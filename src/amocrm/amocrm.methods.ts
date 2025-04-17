import { randomUUID } from "crypto"
import { makeSignedRequest } from "../util/amocrm-signature"
import { getFileType } from "../util/get-file-type-mime"
import { loggerparent } from "../util/logger-service"
import { v4 as uuidv4 } from "uuid"
import fetch from "node-fetch"
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
dotenv.config();

const logger = loggerparent.child({
  service: `amocrm-methods`,
});

interface Talk {
  chat_id: string;
  entity_id: string;
}

export async function addBot(req, res) {
  const baseDomain = req.body.baseDomain;
  // const authToken = req.body.authToken;

  // if (!baseDomain && !authToken) {
  //   return res
  //     .status(400)
  //     .json({ error: "baseDomain and authToken is required." });
  // }

  // const tokens = await getToken(baseDomain, authToken);
  const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjEwNDY2YzE0MjVlOTJjNTg0Njk5NTBlM2Q0YWQ3YzAyNDU5MGYzZjI2NmI2OWI4NTg3NTBjMGE5Y2JhMDU5ZjI4ZjY3NDJlZDY0MDgxZjkzIn0.eyJhdWQiOiI5OTdkZGI5Mi1mNmUxLTRhMGItODc5MS00Yjg4OGViMDVhMzEiLCJqdGkiOiIxMDQ2NmMxNDI1ZTkyYzU4NDY5OTUwZTNkNGFkN2MwMjQ1OTBmM2YyNjZiNjliODU4NzUwYzBhOWNiYTA1OWYyOGY2NzQyZWQ2NDA4MWY5MyIsImlhdCI6MTc0NDkwMjE1NywibmJmIjoxNzQ0OTAyMTU3LCJleHAiOjE4OTQ3NTIwMDAsInN1YiI6IjEyMzg2ODQyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyMzYxNzkwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYWZjODZiMTUtZDZiMC00YTY3LWIwYmQtYzIwN2I5MWM5MzNiIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.K-Aers7OW2rpFSjGppVua46Ou7pCtsyDGFXDgw5Mw5I11SlULykymzIZhZclNmkqxziAmMWiVhHQV-AvggC9fru8v4ZsJTYIMTaPUF8OwKm8S5KsDsFBIWwqOUq8rYoPSWjEgMSvSiIbwZO6AKSfg7kH6wyv3GmNokE-wH_P5a6uFsNGKiaNfcbpWIaejGgVLiWV_Gtf6uh75l6aeq9QWNBctJ2Y7-0uP-UckRzIh5xDAWRrF0uwh4yYr1AwglvDRK0BKHbVXgsQOmpOCqtkEY2cUNKmpL4ra-hEUuj9C6iFesTu0rB1V4uFZdCX3y-tqXjH1-wahe2udvUKqiOeSA"
  try {
    const amojoId = await getAmoId(baseDomain, accessToken);
    console.log(amojoId, "amojoId")
    const scopeId = await connectToChannel(amojoId);
    console.log(scopeId, "scopeId")
    // const accessToken = tokens?.accessToken;
    // const refreshToken = tokens?.refreshToken;
    // const leadWebhookId = await createWebhook(
    //   baseDomain,
    //   accessToken,
    //   "add_unsorted",
    //   "get-lead"
    // );
    // const statusWebhookId = await createWebhook(
    //   baseDomain,
    //   accessToken,
    //   "status_lead",
    //   "status-update"
    // );

    return res.status(200).json({
      amojoId,
      scopeId,
      accessToken,
      // refreshToken,
      // leadWebhookId,
      // statusWebhookId,
    });
  } catch (error) {
    logger.error(`[AMOCRM]: Error adding new bot`, { error })
    return res.status(500).json({ error: "Error adding new bot." })
  }
}

export async function deleteBot(req, res) {
  const amojoId = req.body.amojoId;
  const baseDomain = req.body.baseDomain;
  const accessToken = req.body.accessToken;
  const refreshToken = req.body.refreshToken;

  if (!amojoId) {
    return res.status(400).json({ error: "amojoId is required." });
  }

  try {
    const method = "DELETE";
    const contentType = "application/json";
    const path = `/v2/origin/custom/${process.env.AMOCRM_CHANNEL_ID}/disconnect`;

    const body = {
      account_id: amojoId,
    };

    await makeSignedRequest(
      process.env.AMOCRM_CHANNEL_SECRET,
      method,
      contentType,
      path,
      body
    );
    await deleteWebhook(
      baseDomain,
      accessToken,
      refreshToken,
      "get-lead",
      false
    );
    await deleteWebhook(
      baseDomain,
      accessToken,
      refreshToken,
      "status-update",
      false
    );

    return res.status(200).json({ message: "Bot successfuly deleted" });
  } catch (error) {
    logger.error(`[AMOCRM]: Error adding new bot:`, { error })
    return res.status(500).json({ error: "Error adding new bot." })
  }
}

async function getAmoId(baseDomain, token) {
  try {
    const response = await fetch(
      `https://${baseDomain}/api/v4/account?with=amojo_id`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    const amojoId = result.amojo_id;

    return amojoId;
  } catch (e) {
    logger.error("[AMOCRM]: Error while getting amojoId: ", { error: e })
  }
}

async function connectToChannel(amojoId) {
  const method = "POST";
  const contentType = "application/json";
  const path = `/v2/origin/custom/${process.env.AMOCRM_CHANNEL_ID}/connect`;

  const body = {
    account_id: amojoId,
    title: "Töre Space", // Название вашего канала, отображаемое пользователю
    hook_api_version: "v2",
  };

  const result: any = await makeSignedRequest(
    process.env.AMOCRM_CHANNEL_SECRET,
    method,
    contentType,
    path,
    body
  );

  const scopeId = result.scope_id;

  return scopeId;
}

export async function sendMessageToChannel({
  scopeId,
  threadId,
  sender,
  message,
}) {
  const method = "POST";
  const contentType = "application/json";
  const path = `/v2/origin/custom/${scopeId}`;

  console.log(scopeId, threadId, sender, message, "sendMessageToChannel")

  const body = {
    event_type: "new_message",
    payload: {
      timestamp: Date.now(),
      msgid: randomUUID(),
      conversation_id: threadId,
      sender: {
        id: sender.id,
        name: sender.name,
      },
      message,
      silent: false,
    },
  };

  const result: any = await makeSignedRequest(
    process.env.AMOCRM_CHANNEL_SECRET,
    method,
    contentType,
    path,
    body
  );

  console.log(result, "result")
}

export async function sendMessageFromChannel({
  scopeId,
  threadId,
  receiver,
  message,
}) {
  const method = "POST";
  const contentType = "application/json";
  const path = `/v2/origin/custom/${scopeId}`;

  if (message && message.text && typeof message.text === "object" && "text" in message.text) {
    logger.debug("[AMOCRM]: message.text wiht obj", { message: message.text })
    message.text = message.text.text
  } else {
    logger.debug("[AMOCRM]: message.text without obj", { message: message.text })
  }

  const body = {
    event_type: "new_message",
    payload: {
      timestamp: Date.now(),
      msgid: randomUUID(),
      conversation_id: threadId,
      sender: {
        id: `pleep-${process.env.AMOCRM_BOT_ID}`,
        name: "Pleep",
        ref_id: process.env.AMOCRM_BOT_ID,
      },
      receiver: {
        id: receiver.id,
        name: receiver.name,
      },
      message,
      silent: true,
    },
  };

  const result: any = await makeSignedRequest(
    process.env.AMOCRM_CHANNEL_SECRET,
    method,
    contentType,
    path,
    body
  );

  logger.debug("[AMOCRM]: makeSignedRequest", { result })
}

export async function createFile(fileUrl: string) {
  try {
    const { extension, contentType, size } = await fetchFileWithRetry(fileUrl);

    return {
      media: fileUrl,
      name: `file.${extension}`,
      type: getFileType(contentType),
      size: size,
    };
  } catch (e) {
    logger.error("[AMOCRM]: Error while getting amojoId: ", { error: e })
  }
}

async function fetchFileWithRetry(
  url: string,
  retries = 3,
  timeout = 10000
): Promise<{ extension: string; contentType: string; size: number }> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout,
      });

      const contentType = response.headers["content-type"];
      const size = Number(response.headers["content-length"]);
      const extension = url.split(".").pop() || "";

      return { extension, contentType, size };
    } catch (error: unknown) {
      attempt++;
      const err = error as AxiosError;

      const isLastAttempt = attempt === retries;
      const shouldRetry =
        err.code === "ETIMEDOUT" ||
        err.code === "ECONNRESET" ||
        err.code === "ECONNABORTED";

      if (!shouldRetry || isLastAttempt) {
        console.error(`Fetch failed after ${attempt} attempts:`, err.message);
        throw error;
      }

      console.warn(`Retrying fetch (${attempt}/${retries})...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Этот throw никогда не сработает, но нужен для TypeScript'а
  throw new Error("Unexpected error in fetchFileWithRetry");
}

async function getToken(baseDomain, authToken) {
  const url = `https://${baseDomain}/oauth2/access_token`
  const data = {
    client_id: process.env.AMOCRM_INTEGRATION_ID!,
    client_secret: process.env.AMOCRM_INTEGRATION_SECRET!,
    grant_type: "authorization_code",
    code: authToken,
    redirect_uri: `${process.env.BASE_API_URL}/dashboard`,
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      logger.debug("[AMOCRM]: getToken response", { response })
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    logger.debug("[AMOCRM]: getToken result.tokens", { access_token: result.access_token, refresh_token: result.refresh_token })
    if (!result.access_token || !result.refresh_token) {
      throw new Error("Error fetching tokens, one of them are empty")
    }
    return { accessToken: result.access_token, refreshToken: result.refresh_token }
  } catch (error) {
    logger.error("[AMOCRM]: Error fetching access token:", { error })
  }
}

async function createWebhook(baseDomain, accessToken, setting, destination) {
  const url = `https://${baseDomain}/api/v4/webhooks`
  const data = {
    destination: `${process.env.BASE_URL}/amocrm/bot/${destination}`,
    settings: [`${setting}`],
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      logger.debug("[AMOCRM]: createWebhook response", { response })
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    logger.debug("[AMOCRM]: createWebhook result.id", { resultId: result.id })
    if (!result.id) {
      throw new Error("Error creating webhook, id is empty")
    }
    return result.id
  } catch (error) {
    logger.error("[AMOCRM]: Error creating webhook:", { error })
  }
}

async function deleteWebhook(baseDomain, accessToken, refreshToken, destination, isRetry) {
  const url = `${baseDomain}/api/v4/webhooks`
  const data = {
    destination: `${process.env.BASE_URL}/amocrm/bot/${destination}`,
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      if (response.status === 401 && !isRetry) {
        logger.error("[AMOCRM]: Unauthorized access, attempting to refresh token", { response, baseDomain })

        try {
          const tokens = await refreshTokens(baseDomain, refreshToken)
          logger.debug("[AMOCRM]: newAccessToken", { token: tokens?.accessToken })
          const res = await fetch(`${process.env.BASE_API_URL}/api/internal/assistants/channels/amocrm/bots`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.PLEEP_INTERNAL_API_KEY}`,
            },
            body: JSON.stringify({
              newRefreshToken: tokens?.refreshToken,
              newAccessToken: tokens?.accessToken,
              baseDomain: baseDomain,
            }),
          })

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }

          const newTry = await deleteWebhook(baseDomain, tokens?.accessToken, tokens?.refreshToken, destination, true)
          return newTry
        } catch (error) {
          logger.error("[AMOCRM]: Error fetching access token:", { error })
          return false
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }

    return true
  } catch (error) {
    logger.error("[AMOCRM]: Error deleteWebhook:", { error })
  }
}

async function refreshTokens(baseDomain, authToken) {
  const url = `${baseDomain}/oauth2/access_token`
  const data = {
    client_id: process.env.AMOCRM_INTEGRATION_ID!,
    client_secret: process.env.AMOCRM_INTEGRATION_SECRET!,
    grant_type: "refresh_token",
    refresh_token: authToken,
    redirect_uri: `${process.env.BASE_API_URL}/dashboard`,
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      logger.debug("[AMOCRM]: refreshToken response", { response })
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    logger.debug("[AMOCRM]: refreshToken result.tokens", { access_token: result.access_token, refresh_token: result.refresh_token })
    if (!result.access_token || !result.refresh_token) {
      throw new Error("Error refreshing tokens, one of them are empty")
    }
    return { accessToken: result.access_token, refreshToken: result.refresh_token }
  } catch (error) {
    logger.error("[AMOCRM]: refreshToken Error fetching access token:", { error })
  }
}

export const amocrm = {
  addBot,
  deleteBot,
  sendMessageToChannel,
  sendMessageFromChannel,
  createFile,
}
