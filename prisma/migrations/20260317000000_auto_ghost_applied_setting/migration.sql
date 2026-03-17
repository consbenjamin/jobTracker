-- Add autoGhostApplied setting to User
ALTER TABLE "User" ADD COLUMN "autoGhostApplied" BOOLEAN NOT NULL DEFAULT true;

