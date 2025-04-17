import { Bot, Context, InputFile, InputMediaBuilder } from "grammy"
import { autoChatAction, AutoChatActionFlavor } from "@grammyjs/auto-chat-action"
import { io as ioClient } from "socket.io-client"
import { loggerparent } from "../util/logger-service"
import { uploadFileFromUrl } from "../util/upload-file-from-url"
// import { sendSplittedMessage, splitMessageByTag } from "../util/splitMessageByTag"
// import { filterAttachments } from "../shared/filterAttachments"
import { amocrm } from "../amocrm/amocrm.methods"
import dotenv from "dotenv"
dotenv.config()

const logger = loggerparent.child({ service: "telegram-bot-service" })
const socketBot = ioClient(process.env.BASE_URL!)

// Initialize the bot with your token
const bot = new Bot<Context & AutoChatActionFlavor>(process.env.TELEGRAM_BOT_TOKEN!)

// Store active conversations
const activeConversations = new Map<string, string>() // chatId -> amoThreadId

// Handle incoming messages
bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  const logMeta = { chatId }

  try {
    // Get or create AmoCRM thread for this chat
    let threadId = activeConversations.get(chatId)
    if (!threadId) {
      // Create new thread in AmoCRM
      threadId = await createAmoThread(chatId, ctx.from?.first_name || "User")
      activeConversations.set(chatId, threadId)
    }

    // Handle text message
    const text = ctx.message.text || ctx.message.caption
    if (text) {
      await amocrm.sendMessageToChannel({
        scopeId: process.env.AMOCRM_SCOPE_ID!,
        threadId,
        sender: {
            id: chatId,
            name: ctx.from?.first_name || "User"
        },
        message: { 
            type: "text",
            text: text,  
         }
      })
    }

    // Handle files
    if (ctx.message.document || ctx.message.photo || ctx.message.video || ctx.message.audio || ctx.message.voice) {
      const file = await ctx.getFile()
      const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`
      
      // Upload file and get URL
      const uploadResult = await uploadFileFromUrl({ fileUrl })
      if (uploadResult?.fileUrls?.length > 0) {
        await amocrm.sendMessageToChannel({
          scopeId: process.env.AMOCRM_SCOPE_ID!,
          threadId,
          sender: {
            id: chatId,
            name: ctx.from?.first_name || "User"
          },
          message: {
            text: text || "File attachment",
            media: uploadResult.fileUrls[0]
          }
        })
      }
    }

  } catch (error) {
    logger.error(`[TELEGRAM]: Error processing message`, { ...logMeta, error })
    await ctx.reply("Sorry, there was an error processing your message. Please try again later.")
  }
})

// Handle messages from AmoCRM
socketBot.on("operatorMessage", async (data) => {
  try {
    const { message, attachments, socketThreadId } = data
    const chatId = Array.from(activeConversations.entries())
      .find(([_, threadId]) => threadId === socketThreadId)?.[0]

    if (!chatId) {
      logger.warn(`[TELEGRAM]: No active conversation found for thread ${socketThreadId}`)
      return
    }

    // Send text message
    if (message) {
      await bot.api.sendMessage(chatId, message)
    }

    // Send attachments
    if (attachments?.length > 0) {
      const media = attachments.map(url => {
        const extension = url.split('.').pop()?.toLowerCase()
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension!)) {
          return InputMediaBuilder.photo(new InputFile({ url }))
        } else if (['mp4', 'mov'].includes(extension!)) {
          return InputMediaBuilder.video(new InputFile({ url }))
        } else if (['mp3', 'wav'].includes(extension!)) {
          return InputMediaBuilder.audio(new InputFile({ url }))
        } else {
          return InputMediaBuilder.document(new InputFile({ url }))
        }
      })

      await bot.api.sendMediaGroup(chatId, media)
    }
  } catch (error) {
    logger.error(`[TELEGRAM]: Error sending message from AmoCRM`, { error })
  }
})

// Helper function to create AmoCRM thread
async function createAmoThread(chatId: string, userName: string): Promise<string> {
  // Implement your logic to create a new thread in AmoCRM
  // This is a placeholder - replace with actual AmoCRM API call
  return `thread_${chatId}_${Date.now()}`
}

// Start the bot
export async function startBot() {
  try {
    await bot.start()
    logger.info("[TELEGRAM]: Bot started successfully")
  } catch (error) {
    logger.error("[TELEGRAM]: Error starting bot", { error })
    throw error
  }
}

export const telegram = {
  startBot
}
