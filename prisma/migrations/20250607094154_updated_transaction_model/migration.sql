/*
  Warnings:

  - A unique constraint covering the columns `[docNoAndYear]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Transaction_srNo_docNoAndYear_key";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "srNo" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_docNoAndYear_key" ON "Transaction"("docNoAndYear");
