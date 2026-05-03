-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONSUMER', 'PRIEST', 'ADMIN');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('CHENNAI', 'BANGALORE', 'HYDERABAD', 'COCHIN', 'AMARAVATI');

-- CreateEnum
CREATE TYPE "Tradition" AS ENUM ('IYER_SMARTHA', 'IYENGAR_SRI_VAISHNAVA', 'MADHWA', 'SMARTHA_KARNATAKA', 'VAISHNAVA_KARNATAKA', 'TELUGU_NIYOGI', 'TELUGU_VAIDIKI', 'NAMBOODIRI', 'KERALA_SMARTHA');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'TAMIL', 'KANNADA', 'TELUGU', 'MALAYALAM', 'SANSKRIT', 'HINDI');

-- CreateEnum
CREATE TYPE "CeremonyType" AS ENUM ('GRIHA_PRAVESH', 'SATYANARAYAN_PUJA', 'NAMAKARANA', 'UPANAYANAM', 'SEEMANTHAM', 'ANNAPRASHANA');

-- CreateEnum
CREATE TYPE "SamagriOption" AS ENUM ('PRIEST_ARRANGED', 'SELF_ARRANGED', 'PLATFORM_KIT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PRIEST_ACCEPTED', 'COMPLETED', 'CANCELLED_CONSUMER', 'CANCELLED_PRIEST', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'DEPOSIT_PAID', 'COMPLETED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CONSUMER',
    "avatar_url" TEXT,
    "city" "City",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "photo_url" TEXT,
    "gallery_urls" TEXT[],
    "tradition" "Tradition" NOT NULL,
    "languages" "Language"[],
    "ceremonies" "CeremonyType"[],
    "service_cities" "City"[],
    "experience_years" INTEGER NOT NULL,
    "ceremonies_count" INTEGER NOT NULL DEFAULT 0,
    "price_range_min" INTEGER NOT NULL,
    "price_range_max" INTEGER NOT NULL,
    "travel_fee_per_km" INTEGER NOT NULL DEFAULT 10,
    "temple_affiliation" TEXT,
    "aadhaar_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "founding_priest" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "priests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priest_availability" (
    "id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "priest_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ceremonies" (
    "id" TEXT NOT NULL,
    "type" "CeremonyType" NOT NULL,
    "name" TEXT NOT NULL,
    "name_tamil" TEXT,
    "name_telugu" TEXT,
    "name_kannada" TEXT,
    "name_malayalam" TEXT,
    "description" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "duration_max" INTEGER NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ceremonies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samagri_lists" (
    "id" TEXT NOT NULL,
    "ceremony_id" TEXT NOT NULL,
    "tradition" "Tradition",
    "city" "City",

    CONSTRAINT "samagri_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samagri_items" (
    "id" TEXT NOT NULL,
    "samagri_list_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_tamil" TEXT,
    "name_telugu" TEXT,
    "quantity" TEXT NOT NULL,
    "notes" TEXT,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "samagri_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_ref" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "ceremony_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "duration_hours" DOUBLE PRECISION NOT NULL,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" "City" NOT NULL,
    "pincode" TEXT NOT NULL,
    "google_maps_url" TEXT,
    "samagri_option" "SamagriOption" NOT NULL,
    "family_details" JSONB NOT NULL,
    "base_price" INTEGER NOT NULL,
    "travel_fee" INTEGER NOT NULL DEFAULT 0,
    "samagri_price" INTEGER NOT NULL DEFAULT 0,
    "platform_fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "deposit_amount" INTEGER NOT NULL,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "special_requests" TEXT,
    "priest_notes" TEXT,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "priest_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "photo_urls" TEXT[],
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabase_id_key" ON "users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "priests_user_id_key" ON "priests"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ceremonies_type_key" ON "ceremonies"("type");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_ref_key" ON "bookings"("booking_ref");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- AddForeignKey
ALTER TABLE "priests" ADD CONSTRAINT "priests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "priest_availability" ADD CONSTRAINT "priest_availability_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samagri_lists" ADD CONSTRAINT "samagri_lists_ceremony_id_fkey" FOREIGN KEY ("ceremony_id") REFERENCES "ceremonies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samagri_items" ADD CONSTRAINT "samagri_items_samagri_list_id_fkey" FOREIGN KEY ("samagri_list_id") REFERENCES "samagri_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ceremony_id_fkey" FOREIGN KEY ("ceremony_id") REFERENCES "ceremonies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_priest_id_fkey" FOREIGN KEY ("priest_id") REFERENCES "priests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
