-- CreateTable
CREATE TABLE "CatalogCar" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "groupCode" TEXT NOT NULL,
    "subGroupCode" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "typeAutotechId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modificationId" INTEGER NOT NULL,

    CONSTRAINT "CatalogCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogCar_modificationId_idx" ON "CatalogCar"("modificationId");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogCar_modificationId_groupCode_subGroupCode_key" ON "CatalogCar"("modificationId", "groupCode", "subGroupCode");

-- AddForeignKey
ALTER TABLE "CatalogCar" ADD CONSTRAINT "CatalogCar_modificationId_fkey" FOREIGN KEY ("modificationId") REFERENCES "Modification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
