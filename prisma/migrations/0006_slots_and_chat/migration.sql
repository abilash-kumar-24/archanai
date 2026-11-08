-- One live booking per priest per day-part (morning <12:00, afternoon <17:00, evening) instead of per day.
-- Expression index: Prisma cannot model it, so this project applies migrations with `migrate deploy`.
DROP INDEX IF EXISTS "bookings_one_active_per_priest_day";
CREATE UNIQUE INDEX "bookings_one_active_per_priest_daypart"
  ON "bookings" ("priest_id", "scheduled_date", (CASE WHEN "scheduled_time" < '12:00' THEN 'M' WHEN "scheduled_time" < '17:00' THEN 'A' ELSE 'E' END))
  WHERE "status" IN ('PENDING', 'CONFIRMED', 'PRIEST_ACCEPTED');

-- Chat between family and priest, one thread per booking.
CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "booking_id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "messages_booking_id_created_at_idx" ON "messages"("booking_id", "created_at");
