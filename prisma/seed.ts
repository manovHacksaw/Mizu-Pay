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
      pin: "1234"
    },
    {
      store: "Amazon",
      currency: "INR",
      amountMinor: 100000, // ₹1000.00
      amountUSD: 12.20,
      validityDays: 365,
      number: "AMZ-TEST-1000-67890",
      pin: "5678",
    },
    {
      store: "Amazon",
      currency: "INR",
      amountMinor: 250000, // ₹2500.00
      amountUSD: 30.50,
      validityDays: 365,
      number: "AMZ-TEST-2500-99999",
      pin: "9999",
    },
    {
      store: "Flipkart",
      currency: "INR",
      amountMinor: 25000, // ₹250.00
      amountUSD: 3.05,
      validityDays: 180,
      number: "FLPK-TEST-250-55555",
      pin: "1111",
    },
    {
      store: "Flipkart",
      currency: "INR",
      amountMinor: 200000, // ₹2000.00
      amountUSD: 24.40,
      validityDays: 180,
      number: "FLPK-TEST-2000-77777",
      pin: "7777",
    },
    {
      store: "Myntra",
      currency: "INR",
      amountMinor: 200000, // ₹2000.00
      amountUSD: 24.40,
      validityDays: 365,
      number: "MYN-TEST-2000-11111",
      pin: "2222",
    },
    {
      store: "Myntra",
      currency: "INR",
      amountMinor: 500000, // ₹5000.00
      amountUSD: 61.00,
      validityDays: 365,
      number: "MYN-TEST-5000-33333",
      pin: "3333",
    },
    {
      store: "Make My Trip",
      currency: "INR",
      amountMinor: 100000, // ₹1000.00
      amountUSD: 12.20,
      validityDays: 365,
      number: "MMT-TEST-1000-AAAAA",
      pin: "4444",
    },
    {
      store: "Make My Trip",
      currency: "INR",
      amountMinor: 250000, // ₹2500.00
      amountUSD: 30.50,
      validityDays: 365,
      number: "MMT-TEST-2500-BBBBB",
      pin: "5555",
    },
    {
      store: "Make My Trip",
      currency: "INR",
      amountMinor: 500000, // ₹5000.00
      amountUSD: 61.00,
      validityDays: 365,
      number: "MMT-TEST-5000-CCCCC",
      pin: "6666",
    },
    {
      store: "Make My Trip",
      currency: "INR",
      amountMinor: 1000000, // ₹10000.00
      amountUSD: 122.00,
      validityDays: 365,
      number: "MMT-TEST-10000-DDDDD",
      pin: "8888",
    }
  ]

  for (const card of giftCards) {
    // Use the same IV for both number and pin so we can decrypt both with the same IV/tag
    const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_SECRET!).digest()
    const iv = crypto.randomBytes(16)
    
    // Encrypt number
    const cipherNumber = crypto.createCipheriv("aes-256-gcm", key, iv)
    const encryptedNumberBuffer = Buffer.concat([cipherNumber.update(card.number, "utf8"), cipherNumber.final()])
    const tagNumber = cipherNumber.getAuthTag()
    
    // Encrypt pin with the same IV
    const cipherPin = crypto.createCipheriv("aes-256-gcm", key, iv)
    const encryptedPinBuffer = Buffer.concat([cipherPin.update(card.pin, "utf8"), cipherPin.final()])
    const tagPin = cipherPin.getAuthTag()
    
    // Use the number's tag (or we could combine them, but for simplicity use number's tag)
    // Actually, we need to store both tags or use a combined approach
    // For now, let's use the number's tag and we'll need to handle pin separately
    // Better solution: encrypt them together or store both tags
    
    // Actually, the best solution is to encrypt number+pin together as a JSON string
    // But to minimize changes, let's use the same IV and store number's tag
    // The pin will need its own tag stored somewhere, or we encrypt together
    
    // Let's encrypt them together as a single JSON string
    const combinedData = JSON.stringify({ number: card.number, pin: card.pin })
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
    const encrypted = Buffer.concat([cipher.update(combinedData, "utf8"), cipher.final()])
    const tag = cipher.getAuthTag()
    
    await prisma.giftCard.create({
      data: {
        store: card.store,
        currency: card.currency,
        amountMinor: card.amountMinor,
        amountUSD: card.amountUSD,
        validityDays: card.validityDays,
        encryptedNumber: encrypted.toString("base64"),
        encryptedPin: encrypted.toString("base64"), // Store same encrypted data, we'll extract both
        iv: iv.toString("base64"),
        tag: tag.toString("base64"),
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
