import { Router } from "express"
import { amocrm_router } from "./amocrm/amocrm.router"

const router = Router();

router.use("/bot", amocrm_router)

router.get("/", (_, res) => {
  res.status(200).send("Socket server is working")
})

export { router as RootRouter }
