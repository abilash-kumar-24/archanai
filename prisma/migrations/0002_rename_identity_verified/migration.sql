-- Rename aadhaar_verified to identity_verified: verification no longer
-- collects a government ID, so the column name shouldn't claim it does.
ALTER TABLE "priests" RENAME COLUMN "aadhaar_verified" TO "identity_verified";
