-- AlterTable
ALTER TABLE "User" ADD COLUMN "jobCategories" TEXT;

-- AlterTable
ALTER TABLE "JobListing" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "JobListing_category_idx" ON "JobListing"("category");
