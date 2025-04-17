export function splitMessageByTag(
  isSplitting: boolean,
  message: string
): string[] {
  let messages = [] as string[];

  if (isSplitting) {
    const msgRegex = /<msg>[\s\S]*?<\/msg>/g;
    const matches =
      typeof message === "string" ? message.match(msgRegex) : null;

    if (matches) {
      // Extract messages from <msg> tags
      matches.map((match: string) => {
        messages.push(match.replace(/<\/?msg>/g, "").trim());
      });
    } else {
      messages = [message];
    }
  } else {
    messages = [message];
  }

  return messages;
}

export async function sendSplittedMessage(
  messages: string[],
  callback: (text: string) => Promise<void | Error | undefined>
) {
  for (let i = 0; i < messages.length; i++) {
    await callback(messages[i]);
    if (i < messages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }
}
