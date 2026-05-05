-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "mark" TEXT NOT NULL,
    "markAutotechId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "model" TEXT NOT NULL,
    "modelAutotechId" INTEGER NOT NULL,
    "range" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "brandId" INTEGER NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modification" (
    "id" SERIAL NOT NULL,
    "modificationAutotechId" INTEGER NOT NULL,
    "typeName" TEXT,
    "typeRange" TEXT,
    "kw" TEXT,
    "hp" TEXT,
    "ccmTech" INTEGER,
    "capacity" DECIMAL(65,30),
    "cylinders" INTEGER,
    "valve" INTEGER,
    "tonnage" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "fuelId" INTEGER NOT NULL,
    "engineTypeId" INTEGER NOT NULL,
    "fuelPreparationId" INTEGER NOT NULL,
    "bodyTypeId" INTEGER NOT NULL,
    "driveTypeId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,

    CONSTRAINT "Modification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Engine" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModificationEngine" (
    "id" SERIAL NOT NULL,
    "modificationId" INTEGER NOT NULL,
    "engineId" INTEGER NOT NULL,

    CONSTRAINT "ModificationEngine_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Brand_mark_key" ON "Brand"("mark");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_markAutotechId_key" ON "Brand"("markAutotechId");

-- CreateIndex
CREATE UNIQUE INDEX "Model_brandId_modelAutotechId_key" ON "Model"("brandId", "modelAutotechId");

-- CreateIndex
CREATE INDEX "Modification_modelId_idx" ON "Modification"("modelId");

-- CreateIndex
CREATE INDEX "Modification_modelId_fuelId_engineTypeId_idx" ON "Modification"("modelId", "fuelId", "engineTypeId");

-- CreateIndex
CREATE INDEX "Modification_modelId_bodyTypeId_driveTypeId_idx" ON "Modification"("modelId", "bodyTypeId", "driveTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Modification_modelId_modificationAutotechId_key" ON "Modification"("modelId", "modificationAutotechId");

-- CreateIndex
CREATE UNIQUE INDEX "Engine_code_key" ON "Engine"("code");

-- CreateIndex
CREATE INDEX "ModificationEngine_engineId_modificationId_idx" ON "ModificationEngine"("engineId", "modificationId");

-- CreateIndex
CREATE UNIQUE INDEX "ModificationEngine_modificationId_engineId_key" ON "ModificationEngine"("modificationId", "engineId");

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
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_bodyTypeId_fkey" FOREIGN KEY ("bodyTypeId") REFERENCES "BodyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_driveTypeId_fkey" FOREIGN KEY ("driveTypeId") REFERENCES "DriveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_engineTypeId_fkey" FOREIGN KEY ("engineTypeId") REFERENCES "EngineType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_fuelId_fkey" FOREIGN KEY ("fuelId") REFERENCES "Fuel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_fuelPreparationId_fkey" FOREIGN KEY ("fuelPreparationId") REFERENCES "FuelPreparation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modification" ADD CONSTRAINT "Modification_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModificationEngine" ADD CONSTRAINT "ModificationEngine_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "Engine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModificationEngine" ADD CONSTRAINT "ModificationEngine_modificationId_fkey" FOREIGN KEY ("modificationId") REFERENCES "Modification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
