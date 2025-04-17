import { Router } from "express"
import { whatsapp_router } from "./whatsapp/whatsapp.router"
import { amocrm_router } from "./amocrm/amocrm.router"

const router = Router();

router.use("/whatsapp/bot", whatsapp_router);
router.use("/bot", amocrm_router)

router.get("/", (_, res) => {
  res.status(200).send("Socket server is working")
})

export { router as RootRouter }
