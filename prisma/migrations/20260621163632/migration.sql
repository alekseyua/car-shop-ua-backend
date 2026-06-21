/*
  Warnings:

  - You are about to drop the column `productId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,itemNo]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,itemNo]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemNo` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemNo` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Favorite_userId_productId_key";

-- DropIndex
DROP INDEX "Review_productId_idx";

-- DropIndex
DROP INDEX "Review_userId_productId_key";

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "productId",
ADD COLUMN     "itemNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productId",
ADD COLUMN     "itemNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "productId",
ADD COLUMN     "itemNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_itemNo_key" ON "Favorite"("userId", "itemNo");

-- CreateIndex
CREATE INDEX "Review_itemNo_idx" ON "Review"("itemNo");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_itemNo_key" ON "Review"("userId", "itemNo");
