export const supportedAttachmentsFormats = /\.(png|jpe?g|webp|gif|pdf|txt|xlsx|docx|json)$/i

export function filterAttachments(attachments: string[]) {
  const filteredAttachments = attachments.filter((url) => supportedAttachmentsFormats.test(url))
  return filteredAttachments
}
