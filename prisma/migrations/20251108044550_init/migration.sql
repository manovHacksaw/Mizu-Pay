-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "amountUSD" DOUBLE PRECISION NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "encryptedNumber" TEXT NOT NULL,
    "encryptedPin" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);
