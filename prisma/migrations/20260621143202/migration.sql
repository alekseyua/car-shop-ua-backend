/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,itemNo]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemNo` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" 
RENAME COLUMN "productId" to "itemNo";

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_itemNo_key" ON "CartItem"("cartId", "itemNo");
