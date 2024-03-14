import fs from 'fs'

export function decodeBase64Image (base64String, filePath) {
  const imageBuffer = Buffer.from(base64String, 'base64')
  fs.writeFileSync(filePath, imageBuffer)
}
