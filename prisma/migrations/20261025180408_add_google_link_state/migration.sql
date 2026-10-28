-- CreateTable
CREATE TABLE "GoogleLinkState" (
    "id" SERIAL NOT NULL,
    "stateHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleLinkState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleLinkState_stateHash_key" ON "GoogleLinkState"("stateHash");

-- CreateIndex
CREATE INDEX "GoogleLinkState_userId_idx" ON "GoogleLinkState"("userId");

-- CreateIndex
CREATE INDEX "GoogleLinkState_expiresAt_idx" ON "GoogleLinkState"("expiresAt");

-- AddForeignKey
ALTER TABLE "GoogleLinkState" ADD CONSTRAINT "GoogleLinkState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
