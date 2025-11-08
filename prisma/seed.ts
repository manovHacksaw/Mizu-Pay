import { PrismaClient } from "../app/generated/prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

function encrypt(text: string) {
  const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET!).digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64")
  }
}

async function main() {
  // Clear existing for clean testing
  await prisma.giftCard.deleteMany()

  const giftCards = [
    {
      store: "Amazon",
      currency: "INR",
      amountMinor: 50000, // ₹500.00
      amountUSD: 6.10,
      validityDays: 365,
      number: "AMZ-TEST-500-12345",
      pin: "1234",
      stock: 5
    },
    {
      store: "Amazon",
      currency: "INR",
      amountMinor: 100000, // ₹1000.00
      amountUSD: 12.20,
      validityDays: 365,
      number: "AMZ-TEST-1000-67890",
      pin: "5678",
      stock: 3
    },
    {
      store: "Flipkart",
      currency: "INR",
      amountMinor: 25000, // ₹250.00
      amountUSD: 3.05,
      validityDays: 180,
      number: "FLPK-TEST-250-55555",
      pin: "1111",
      stock: 7
    }
  ]

  for (const card of giftCards) {
    const encryptedNumber = encrypt(card.number)
    const encryptedPin = encrypt(card.pin)

    await prisma.giftCard.create({
      data: {
        store: card.store,
        currency: card.currency,
        amountMinor: card.amountMinor,
        amountUSD: card.amountUSD,
        validityDays: card.validityDays,
        encryptedNumber: encryptedNumber.encrypted,
        encryptedPin: encryptedPin.encrypted,
        iv: encryptedNumber.iv,
        tag: encryptedNumber.tag,
        stock: card.stock,
        active: true
      }
    })
  }

  console.log("✅ Gift cards seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
