/*
  Warnings:

  - Changed the type of `considerationValue` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `marketValue` on the `Transaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "considerationValue",
ADD COLUMN     "considerationValue" DOUBLE PRECISION NOT NULL,
DROP COLUMN "marketValue",
ADD COLUMN     "marketValue" DOUBLE PRECISION NOT NULL;
