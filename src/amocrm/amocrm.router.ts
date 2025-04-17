import { Request, Response } from "express"
// import { socketBot } from "../.."

import { amocrm } from "./amocrm.methods"

import express from "express"
// import { loggerparent } from "../../util/logger-service"
const router = express.Router()

// const logger = loggerparent.child({
//   service: `amocrm-router`,
// })

function parseNestedKeys(obj) {
  const result = {}
  for (const compoundKey in obj) {
    const value = obj[compoundKey]
    const keys = compoundKey.match(/[^\[\]]+/g) || [] // Split the compound key
    keys.reduce((acc, key, index) => {
      if (index === keys.length - 1) {
        acc[key] = value
      } else {
        acc[key] = acc[key] || {}
      }
      return acc[key]
    }, result)
  }
  return result
}

router.post("/addBot", async (req: Request, res: Response) => {
  return amocrm.addBot(req, res)
})

router.post("/deleteBot", async (req: Request, res: Response) => {
  return amocrm.deleteBot(req, res)
})

router.post("/sendMessage", async (req: Request, res: Response) => {
  return amocrm.sendMessageToChannel(req.body)
})

router.post("/webhook-amocrm/:scope_id", async (req, res) => {
  const body = req.body

  console.log(body, "body")
  // logger.debug("[AMOCRM]: webhook-amocrm body", { body })

  // const threadId = body.message.conversation.client_id
  // const text = body.message.message.text
  // const media = body.message.message.media

  // const response = await fetch(
  //   `${process.env.BASE_API_URL}/api/internal/assistants/channels/amocrm/bots?threadId=${threadId}`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "x-api-key": `${process.env.PLEEP_INTERNAL_API_KEY}`,
  //     },
  //   },
  // )

  // const { thread } = await response.json()

  // if (thread?.assistant?.amoBot?.enabled) {
  //   const attachments: string[] = []
  //   let channelType = "WEB"

  //   if (media) attachments.push(media)

  //   if (thread.telegram) channelType = "TELEGRAM"
  //   const telegramOBJ = {
  //     telegramChatId: thread.telegram?.chatId,
  //     botId: thread.telegram?.telegramBotId,
  //   }

  //   if (thread.whatsapp) channelType = "WHATSAPP"
  //   const whatsappOBJ = {
  //     chatId: thread.whatsapp?.chatId,
  //     botId: thread.assistantId,
  //   }

  //   if (thread.waba) channelType = "WABA"
  //   const wabaOBJ = {
  //     appId: thread.assistant.wabaBot?.appId,
  //     appToken: thread.assistant.wabaBot?.appToken,
  //     number: thread.waba?.number,
  //   }

  //   if (thread.instagram) channelType = "INSTAGRAM"
  //   const instagramOBJ = {
  //     customerId: thread.instagram?.customerId,
  //     accountId: thread.instagram?.accountId,
  //   }

  //   socketBot.emit("operatorMessage", {
  //     message: text,
  //     attachments,
  //     socketThreadId: thread.id,
  //     applicationId: thread.applicationId,
  //     roomId: thread.threadId,
  //     telegram: telegramOBJ,
  //     whatsapp: whatsappOBJ,
  //     instagram: instagramOBJ,
  //     waba: wabaOBJ,
  //     channel: channelType,
  //   })

  //   // if (thread.messageHandler === "AI" && thread.assistant.application?.settings?.isExternalChannelOperatorSwitch) {
  //   //   socketBot.emit("changeMessageMode", "OPERATOR", thread.threadId, thread.applicationId)
  //   // }
  // }

  res.status(200).send("EVENT_RECEIVED")
})

// router.post("/get-lead", async (req, res) => {
//   const body = req.body
//   const nestedObject: any = parseNestedKeys(body)
//   logger.debug("[AMOCRM]: get-lead body", { body })
//   const domain = nestedObject.account._links.self
//   const leadId = nestedObject.unsorted.add[0].lead_id
//   const pipelineId = nestedObject.unsorted.add[0].pipeline_id
//   const threadString = nestedObject.unsorted.add[0].source
//   const threadId = threadString.split(":")[1]
//   const conversationId = nestedObject.unsorted.add[0].source_data.origin.chat_id
//   logger.debug("[AMOCRM]: get-lead domain", { domain, leadId, threadId, conversationId, pipelineId })

//   const response = await fetch(`${process.env.BASE_API_URL}/api/internal/assistants/channels/amocrm/bots`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       "x-api-key": `${process.env.PLEEP_INTERNAL_API_KEY}`,
//     },
//     body: JSON.stringify({
//       leadId,
//       threadId,
//       conversationId,
//       pipelineId,
//     }),
//   })

//   if (response.status !== 200) {
//     logger.error("[AMOCRM]: Failed to update lead in the database", { response, threadId, leadId })
//   }

//   return res.status(200).send("EVENT_RECEIVED")
// })

// router.post("/status-update", async (req, res) => {
//   const body = req.body;
//   const nestedObject: any = parseNestedKeys(body);
//   logger.debug("body",body)
//   const domain = nestedObject.account._links.self
//   const leadId = nestedObject.leads.status[0].id
//   logger.debug("domain",domain, leadId, "don", body)

//   const response = await fetch(
//     `${process.env.BASE_API_URL}/api/internal/assistants/channels/amocrm/update-lead`,
//     {
//       method: "POST",
//       headers: {
//         "x-api-key": `${process.env.PLEEP_INTERNAL_API_KEY}`,
//       },
//       body: JSON.stringify({
//         domain,
//         leadId
//       }),
//     }
//   );

//   const { thread } = await response.json();

//   if (
//     thread.messageHandler === "AI"
//   ) {
//     socketBot.emit("changeMessageMode", "OPERATOR", thread.threadId);
//   }

//   logger.debug("status-update", thread)
//   res.status(200).send("EVENT_RECEIVED");
// });

export const amocrm_router = router
