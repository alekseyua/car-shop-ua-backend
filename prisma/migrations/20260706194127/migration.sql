-- CreateTable
CREATE TABLE "Garage" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "comment" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Garage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarageCar" (
    "id" SERIAL NOT NULL,
    "garageId" INTEGER NOT NULL,
    "modificationId" INTEGER NOT NULL,
    "vin" TEXT,
    "nickname" TEXT,
    "mileage" INTEGER,
    "year" INTEGER,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GarageCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GarageCar_vin_key" ON "GarageCar"("vin");

-- AddForeignKey
ALTER TABLE "Garage" ADD CONSTRAINT "Garage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarageCar" ADD CONSTRAINT "GarageCar_garageId_fkey" FOREIGN KEY ("garageId") REFERENCES "Garage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarageCar" ADD CONSTRAINT "GarageCar_modificationId_fkey" FOREIGN KEY ("modificationId") REFERENCES "Modification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
