/*
  Warnings:

  - You are about to drop the column `guestSessionId` on the `Garage` table. All the data in the column will be lost.
  - Made the column `userId` on table `Garage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Garage" DROP CONSTRAINT "Garage_guestSessionId_fkey";

-- DropForeignKey
ALTER TABLE "Garage" DROP CONSTRAINT "Garage_userId_fkey";

-- AlterTable
ALTER TABLE "Garage" DROP COLUMN "guestSessionId",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Garage" ADD CONSTRAINT "Garage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
