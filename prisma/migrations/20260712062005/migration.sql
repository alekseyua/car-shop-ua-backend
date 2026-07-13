/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Garage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Garage_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Garage_userId_name_key" ON "Garage"("userId", "name");
