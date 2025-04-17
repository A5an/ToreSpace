import fetch from "node-fetch"
import crypto from "crypto"
import { loggerparent } from "./logger-service"

const logger = loggerparent.child({ service: "amocrm-service" })

export async function makeSignedRequest(secret, method, contentType, path, body) {
  const date = new Date().toUTCString()
  const url = `https://amojo.amocrm.ru${path}`

  const requestBody = JSON.stringify(body)
  const checkSum = crypto.createHash("md5").update(requestBody).digest("hex")

  const str = [method.toUpperCase(), checkSum, contentType, date, path].join("\n")

  const signature = crypto.createHmac("sha1", secret).update(str).digest("hex")

  const headers = {
    "Date": date,
    "Content-Type": contentType,
    "Content-MD5": checkSum.toLowerCase(),
    "X-Signature": signature.toLowerCase(),
  }

  logger.debug(`${method} ${url}`)
  for (const [name, value] of Object.entries(headers)) {
    logger.debug(`${name}: ${value}`)
  }
  logger.debug(`\n${requestBody}\n`)

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: requestBody,
    })

    logger.debug(`Status: ${response.status}`)

    const responseBody = await response.json()
    return responseBody
  } catch (e: any) {
    logger.error(`Error: ${e.message}`, { error: e })
  }
}
