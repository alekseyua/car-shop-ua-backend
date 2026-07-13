/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Garage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Garage_name_key" ON "Garage"("name");
