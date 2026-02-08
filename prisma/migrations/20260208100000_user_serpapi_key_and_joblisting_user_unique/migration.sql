-- AlterTable: add encrypted SerpApi key to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serpApiKeyEncrypted" TEXT;

-- Drop existing unique on JobListing and add new one including userId
DROP INDEX IF EXISTS "JobListing_source_externalId_key";
CREATE UNIQUE INDEX "JobListing_source_externalId_userId_key" ON "JobListing"("source", "externalId", "userId");
