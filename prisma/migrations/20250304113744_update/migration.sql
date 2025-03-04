/*
  Warnings:

  - You are about to drop the column `name` on the `SavedList` table. All the data in the column will be lost.
  - You are about to drop the column `responseCodes` on the `SavedList` table. All the data in the column will be lost.
  - Added the required column `title` to the `SavedList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedList" DROP COLUMN "name",
DROP COLUMN "responseCodes",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;
