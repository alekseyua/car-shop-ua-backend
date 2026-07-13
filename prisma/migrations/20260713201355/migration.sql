/*
  Warnings:

  - A unique constraint covering the columns `[garageId,modificationId]` on the table `GarageCar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GarageCar_garageId_modificationId_key" ON "GarageCar"("garageId", "modificationId");
