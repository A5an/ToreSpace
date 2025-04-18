import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import { telegram } from "./telegram/telegram.methods"
// import telegramRouter from "./telegram/telegram.router"

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

app.use(cors())
app.use(express.json())

// app.use("/telegram", telegramRouter)

httpServer.listen(process.env.PORT || 3000, async () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`)
  try {
    await telegram.startBot()
    console.log("Telegram bot started successfully")
  } catch (error) {
    console.error("Failed to start Telegram bot:", error)
  }
})

process.on("uncaughtException", (err, origin) => {
  console.error("Uncaught exception:", err)
  console.error("Exception origin:", origin)
})
