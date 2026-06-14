-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HistoryAction" ADD VALUE 'UPDATE_CART';
ALTER TYPE "HistoryAction" ADD VALUE 'DELETE_CART';
ALTER TYPE "HistoryAction" ADD VALUE 'CLEAR_CART';
ALTER TYPE "HistoryAction" ADD VALUE 'ADD_TO_FAVORITES';
ALTER TYPE "HistoryAction" ADD VALUE 'REMOVE_FROM_FAVORITES';
ALTER TYPE "HistoryAction" ADD VALUE 'PAY_ORDER';
ALTER TYPE "HistoryAction" ADD VALUE 'CREATE_REVIEW';
ALTER TYPE "HistoryAction" ADD VALUE 'UPDATE_REVIEW';
ALTER TYPE "HistoryAction" ADD VALUE 'DELETE_REVIEW';

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "nickname" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "History_userId_idx" ON "History"("userId");

-- CreateIndex
CREATE INDEX "History_action_idx" ON "History"("action");

-- CreateIndex
CREATE INDEX "History_createdAt_idx" ON "History"("createdAt");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
