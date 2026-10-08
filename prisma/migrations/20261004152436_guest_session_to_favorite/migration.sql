/*
  Warnings:

  - A unique constraint covering the columns `[guestSessionId,itemNo]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Favorite_guestSessionId_idx" ON "Favorite"("guestSessionId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_guestSessionId_itemNo_key" ON "Favorite"("guestSessionId", "itemNo");
