import { PLATFORM_COMMISSION_RATE, DEPOSIT_RATE } from "@/lib/constants"

export function calculatePricing(
  basePrice: number,
  travelFee: number = 0,
  samagriPrice: number = 0,
  isUrgent: boolean = false
) {
  const urgencyFee = isUrgent ? Math.round(basePrice * 0.25) : 0
  const subtotal = basePrice + travelFee + samagriPrice + urgencyFee
  const platformFee = Math.round(subtotal * PLATFORM_COMMISSION_RATE)
  const totalAmount = subtotal + platformFee
  const depositAmount = Math.round(totalAmount * DEPOSIT_RATE)

  return {
    basePrice,
    travelFee,
    samagriPrice,
    urgencyFee,
    platformFee,
    totalAmount,
    depositAmount,
  }
}

export function formatCurrency(amountInPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amountInPaise / 100)
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}
