-- CreateTable
CREATE TABLE "ListOEMByItem" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "comId" INTEGER NOT NULL,
    "itemNo" TEXT NOT NULL,
    "search" TEXT NOT NULL,

    CONSTRAINT "ListOEMByItem_pkey" PRIMARY KEY ("id")
);
