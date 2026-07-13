/*
  Warnings:

  - Made the column `name` on table `Garage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Garage" ALTER COLUMN "name" SET NOT NULL;
