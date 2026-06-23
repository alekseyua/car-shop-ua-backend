/*
  Warnings:

  - Added the required column `statusDelivery` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "statusDelivery" TEXT NOT NULL;
