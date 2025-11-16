import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env and .env.local
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

// Check for ENCRYPTION_SECRET
if (!process.env.ENCRYPTION_SECRET) {
  console.error("❌ ERROR: ENCRYPTION_SECRET is not set in your .env or .env.local file!")
  console.error("")
  console.error("Please add this line to your .env.local file:")
  console.error("ENCRYPTION_SECRET=\"your-random-secret-key-here\"")
  console.error("")
  console.error("You can generate a random secret or use any long random string.")
  console.error("Example: ENCRYPTION_SECRET=\"my-super-secret-encryption-key-12345\"")
  process.exit(1)
}

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
  console.log("🌱 Starting database seeding...")
  console.log("📦 Checking database connection...")
  
  // Test database connection
  try {
    await prisma.$connect()
    console.log("✅ Database connected successfully")
  } catch (error) {
    console.error("❌ Database connection failed!")
    console.error("Make sure DATABASE_URL is set in your .env.local file")
    throw error
  }

  // Clear existing for clean testing
  console.log("🗑️  Clearing existing gift cards...")
  const deletedCount = await prisma.giftCard.deleteMany()
  console.log(`   Deleted ${deletedCount.count} existing gift cards`)

  // Helper function to calculate USD amount (approximate: 1 USD = 82 INR)
  const calculateUSD = (inr: number) => parseFloat((inr / 82).toFixed(2));

  // Generate gift cards for Myntra, Flipkart, and Amazon
  // Amounts: 100, 200, 250, 500, 750, 1000, 2000, 3000, 5000 (in INR)
  // Higher amounts added to support larger purchases
  const stores = ["Myntra", "Flipkart", "Amazon"];
  const amounts = [100, 200, 250, 500, 750, 1000, 2000, 3000, 5000];
  
  console.log(`📝 Generating gift cards for stores: ${stores.join(", ")}`)
  console.log(`💰 Amounts: ₹${amounts.join(", ₹")}`)
  
  const giftCards: Array<{
    store: string;
    currency: string;
    amountMinor: number;
    amountUSD: number;
    validityDays: number;
    number: string;
    pin: string;
  }> = [];

  // Generate gift cards for each store and amount combination
  stores.forEach((store, storeIndex) => {
    amounts.forEach((amount, amountIndex) => {
      const storePrefix = store === "Myntra" ? "MYN" : store === "Flipkart" ? "FLPK" : "AMZ";
      const cardNumber = `${storePrefix}-GC-${amount}-${String(storeIndex).padStart(2, '0')}${String(amountIndex).padStart(2, '0')}`;
      const pin = String(Math.floor(Math.random() * 9000) + 1000); // Random 4-digit PIN
      
      giftCards.push({
        store: store,
      currency: "INR",
        amountMinor: amount * 100, // Convert to paise
        amountUSD: calculateUSD(amount),
        validityDays: store === "Flipkart" ? 180 : 365, // Flipkart has 180 days, others 365
        number: cardNumber,
        pin: pin,
      });
    });
  });

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

  // Verify the seeding
  const totalCards = await prisma.giftCard.count()
  const storesCount = await prisma.giftCard.groupBy({
    by: ['store'],
    _count: true
  })

  console.log("")
  console.log("✅ Gift cards seeded successfully!")
  console.log(`📊 Total gift cards created: ${totalCards}`)
  console.log("📦 Cards per store:")
  storesCount.forEach(({ store, _count }) => {
    console.log(`   - ${store}: ${_count} cards`)
  })
  console.log("")
  console.log("🎉 You can now use the checkout flow with Myntra, Flipkart, and Amazon!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
