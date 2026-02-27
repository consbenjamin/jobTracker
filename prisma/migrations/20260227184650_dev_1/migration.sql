-- AlterTable
ALTER TABLE "User" ADD COLUMN     "extensionTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN     "extensionTokenHash" TEXT,
ADD COLUMN     "extensionTokenLast4" TEXT,
ADD COLUMN     "extensionTokenLastUsedAt" TIMESTAMP(3);
