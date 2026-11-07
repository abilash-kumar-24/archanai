-- Pilot readiness: per-ceremony pricing, documents, favourites, booking contact/amount, indexes.
-- Data steps at the bottom backfill existing priests so nothing changes for them.

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('ID_PROOF', 'CERTIFICATE', 'TEMPLE_LETTER', 'OTHER');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "amount_received" INTEGER,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "reschedule_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "priest_ceremonies" (
    "id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "ceremony_type" "CeremonyType" NOT NULL,
    "price" INTEGER NOT NULL,
    "samagri_included" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "priest_ceremonies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priest_documents" (
    "id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priest_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","priest_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "priest_ceremonies_priest_id_ceremony_type_key" ON "priest_ceremonies"("priest_id", "ceremony_type");

-- CreateIndex
CREATE INDEX "priest_documents_priest_id_idx" ON "priest_documents"("priest_id");

-- Dedupe so the unique index can be created
DELETE FROM "blocked_dates" a USING "blocked_dates" b WHERE a."priest_id" = b."priest_id" AND a."date" = b."date" AND a."id" > b."id";

-- CreateIndex
CREATE UNIQUE INDEX "blocked_dates_priest_id_date_key" ON "blocked_dates"("priest_id", "date");

-- CreateIndex
CREATE INDEX "bookings_priest_id_scheduled_date_idx" ON "bookings"("priest_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "bookings_consumer_id_idx" ON "bookings"("consumer_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_sent_at_idx" ON "notifications"("user_id", "is_read", "sent_at");

-- AddForeignKey
ALTER TABLE "priest_ceremonies" ADD CONSTRAINT "priest_ceremonies_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_documents" ADD CONSTRAINT "priest_documents_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one priest_ceremonies row per ceremony a priest already lists, priced at their old minimum
INSERT INTO "priest_ceremonies" ("id", "priest_id", "ceremony_type", "price")
SELECT gen_random_uuid()::text, p."id", c, p."price_range_min"
FROM "priests" p, unnest(p."ceremonies") AS c
ON CONFLICT DO NOTHING;

-- Backfill: priests with no weekly schedule get Mon-Sun 06:00-20:00
INSERT INTO "priest_availability" ("id", "priest_id", "day_of_week", "start_time", "end_time")
SELECT gen_random_uuid()::text, p."id", d, '06:00', '20:00'
FROM "priests" p CROSS JOIN generate_series(0, 6) AS d
WHERE NOT EXISTS (SELECT 1 FROM "priest_availability" a WHERE a."priest_id" = p."id");

-- Integrity: a priest can hold at most one live booking per day, enforced by the database so two
-- simultaneous requests cannot both succeed. Partial index: Prisma's schema language cannot express
-- it, so `prisma migrate dev` will want to drop it; this project applies migrations with `migrate deploy`.
CREATE UNIQUE INDEX "bookings_one_active_per_priest_day"
  ON "bookings" ("priest_id", "scheduled_date")
  WHERE "status" IN ('PENDING', 'CONFIRMED', 'PRIEST_ACCEPTED');
