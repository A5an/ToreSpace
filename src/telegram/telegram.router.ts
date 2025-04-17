import { Router } from "express"
import { telegram } from "./telegram.methods"

const router = Router()

// Webhook endpoint for Telegram updates
router.post("/webhook", async (req, res) => {
  try {
    // Pass the update to the bot
    await telegram.handleUpdate(req.body)
    res.status(200).send("OK")
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    res.status(500).send("Internal Server Error")
  }
})

// Endpoint to get bot info
router.get("/info", async (req, res) => {
  try {
    const botInfo = await telegram.getBotInfo()
    res.json(botInfo)
  } catch (error) {
    console.error("Error getting bot info:", error)
    res.status(500).send("Internal Server Error")
  }
})

export default router 