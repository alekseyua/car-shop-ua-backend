/*
  Warnings:

  - You are about to drop the column `deliveryCountry` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPostalCode` on the `Order` table. All the data in the column will be lost.
  - Added the required column `deliveryLastname` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryCountry",
DROP COLUMN "deliveryPostalCode",
ADD COLUMN     "deliveryComment" TEXT,
ADD COLUMN     "deliveryEmail" TEXT,
ADD COLUMN     "deliveryFirstname" TEXT,
ADD COLUMN     "deliveryLastname" TEXT NOT NULL,
ADD COLUMN     "deliveryMiddlename" TEXT,
ADD COLUMN     "deliveryPhone" TEXT NOT NULL,
ADD COLUMN     "deliveryPoint" TEXT,
ADD COLUMN     "deliveryPointRef" TEXT,
ADD COLUMN     "deliveryVin" TEXT;
