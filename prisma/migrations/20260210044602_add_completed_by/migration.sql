/*
  Warnings:

  - Added the required column `receivedDate` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkedBy" TEXT,
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "receivedDate" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
