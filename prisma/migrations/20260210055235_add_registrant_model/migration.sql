/*
  Warnings:

  - Added the required column `receivedDate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkedBy" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "receivedDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Registrant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registrant_name_key" ON "Registrant"("name");

-- CreateIndex
CREATE INDEX "Registrant_name_idx" ON "Registrant"("name");
