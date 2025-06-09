-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "srNo" INTEGER,
    "docNoAndYear" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "propertyExtent" TEXT NOT NULL,
    "villageStreet" TEXT,
    "street" TEXT,
    "scheduleRemarks" TEXT,
    "documentRemarks" TEXT,
    "plotNo" TEXT,
    "dates" JSONB NOT NULL,
    "executants" JSONB NOT NULL,
    "claimants" JSONB NOT NULL,
    "surveyNo" JSONB NOT NULL,
    "prNumber" JSONB NOT NULL,
    "considerationValue" TEXT NOT NULL,
    "marketValue" TEXT NOT NULL,
    "volPageNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_docNoAndYear_key" ON "Transaction"("docNoAndYear");
