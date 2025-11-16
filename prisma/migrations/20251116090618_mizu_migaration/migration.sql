/*
  Warnings:

  - The values [paid,refunded] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stock` on the `GiftCard` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reservedByPaymentId]` on the table `GiftCard` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('pending', 'confirming', 'succeeded', 'email_failed', 'failed');
ALTER TABLE "public"."Payment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SessionStatus" ADD VALUE 'processing';
ALTER TYPE "SessionStatus" ADD VALUE 'email_failed';

-- AlterTable
ALTER TABLE "GiftCard" DROP COLUMN "stock",
ADD COLUMN     "reservedAt" TIMESTAMP(3),
ADD COLUMN     "reservedByPaymentId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultCurrency" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_reservedByPaymentId_key" ON "GiftCard"("reservedByPaymentId");

-- AddForeignKey
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_reservedByPaymentId_fkey" FOREIGN KEY ("reservedByPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
