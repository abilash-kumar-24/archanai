-- Payment gateway removed: Archanai never processes payment, families pay
-- priests directly. Drop deposit/platform-fee/Razorpay tracking entirely.
ALTER TABLE "bookings" DROP COLUMN "paymentStatus";
ALTER TABLE "bookings" DROP COLUMN "platform_fee";
ALTER TABLE "bookings" DROP COLUMN "deposit_amount";
ALTER TABLE "bookings" DROP COLUMN "razorpay_order_id";
ALTER TABLE "bookings" DROP COLUMN "razorpay_payment_id";

DROP TYPE "PaymentStatus";
