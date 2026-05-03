-- CreateTable
CREATE TABLE "ListBrand" (
    "id" SERIAL NOT NULL,
    "mark" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,

    CONSTRAINT "ListBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutotechnicsBrand" (
    "id" SERIAL NOT NULL,
    "markId" INTEGER NOT NULL,
    "listBrandId" INTEGER NOT NULL,

    CONSTRAINT "AutotechnicsBrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListModel" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "modelRange" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,

    CONSTRAINT "ListModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutotechnicsModel" (
    "id" SERIAL NOT NULL,
    "markId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "listModelId" INTEGER NOT NULL,

    CONSTRAINT "AutotechnicsModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListModification" (
    "id" SERIAL NOT NULL,
    "typeName" TEXT,
    "typeRange" TEXT,
    "engines" TEXT,
    "kw" TEXT,
    "hp" TEXT,
    "ccmTech" INTEGER,
    "capacity" DOUBLE PRECISION,
    "cylinders" INTEGER,
    "valve" INTEGER,
    "fuelId" INTEGER NOT NULL,
    "engineTypeId" INTEGER NOT NULL,
    "fuelPreparationId" INTEGER NOT NULL,
    "bodyTypeId" INTEGER NOT NULL,
    "driveTypeId" INTEGER NOT NULL,
    "tonnage" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,

    CONSTRAINT "ListModification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutotechnicsModification" (
    "id" SERIAL NOT NULL,
    "markId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "listModificationId" INTEGER NOT NULL,

    CONSTRAINT "AutotechnicsModification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fuel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Fuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngineType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EngineType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelPreparation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FuelPreparation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BodyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DriveType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListBrand_mark_key" ON "ListBrand"("mark");

-- CreateIndex
CREATE UNIQUE INDEX "AutotechnicsBrand_markId_key" ON "AutotechnicsBrand"("markId");

-- CreateIndex
CREATE INDEX "AutotechnicsBrand_markId_idx" ON "AutotechnicsBrand"("markId");

-- CreateIndex
CREATE UNIQUE INDEX "ListModel_model_modelRange_key" ON "ListModel"("model", "modelRange");

-- CreateIndex
CREATE UNIQUE INDEX "AutotechnicsModel_markId_modelId_key" ON "AutotechnicsModel"("markId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "AutotechnicsModification_typeId_key" ON "AutotechnicsModification"("typeId");

-- CreateIndex
CREATE INDEX "AutotechnicsModification_markId_idx" ON "AutotechnicsModification"("markId");

-- CreateIndex
CREATE INDEX "AutotechnicsModification_modelId_idx" ON "AutotechnicsModification"("modelId");

-- CreateIndex
CREATE INDEX "AutotechnicsModification_typeId_idx" ON "AutotechnicsModification"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "Fuel_name_key" ON "Fuel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EngineType_name_key" ON "EngineType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FuelPreparation_name_key" ON "FuelPreparation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BodyType_name_key" ON "BodyType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DriveType_name_key" ON "DriveType"("name");

-- AddForeignKey
ALTER TABLE "AutotechnicsBrand" ADD CONSTRAINT "AutotechnicsBrand_listBrandId_fkey" FOREIGN KEY ("listBrandId") REFERENCES "ListBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutotechnicsModel" ADD CONSTRAINT "AutotechnicsModel_listModelId_fkey" FOREIGN KEY ("listModelId") REFERENCES "ListModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListModification" ADD CONSTRAINT "ListModification_fuelId_fkey" FOREIGN KEY ("fuelId") REFERENCES "Fuel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListModification" ADD CONSTRAINT "ListModification_engineTypeId_fkey" FOREIGN KEY ("engineTypeId") REFERENCES "EngineType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListModification" ADD CONSTRAINT "ListModification_fuelPreparationId_fkey" FOREIGN KEY ("fuelPreparationId") REFERENCES "FuelPreparation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListModification" ADD CONSTRAINT "ListModification_bodyTypeId_fkey" FOREIGN KEY ("bodyTypeId") REFERENCES "BodyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListModification" ADD CONSTRAINT "ListModification_driveTypeId_fkey" FOREIGN KEY ("driveTypeId") REFERENCES "DriveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutotechnicsModification" ADD CONSTRAINT "AutotechnicsModification_listModificationId_fkey" FOREIGN KEY ("listModificationId") REFERENCES "ListModification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
