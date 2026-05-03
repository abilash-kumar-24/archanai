export type City = "CHENNAI" | "BANGALORE" | "HYDERABAD" | "COCHIN" | "AMARAVATI"

export type Tradition =
  | "IYER_SMARTHA"
  | "IYENGAR_SRI_VAISHNAVA"
  | "MADHWA"
  | "SMARTHA_KARNATAKA"
  | "VAISHNAVA_KARNATAKA"
  | "TELUGU_NIYOGI"
  | "TELUGU_VAIDIKI"
  | "NAMBOODIRI"
  | "KERALA_SMARTHA"

export type Language = "ENGLISH" | "TAMIL" | "KANNADA" | "TELUGU" | "MALAYALAM" | "SANSKRIT" | "HINDI"

export type CeremonyType =
  | "GRIHA_PRAVESH"
  | "SATYANARAYAN_PUJA"
  | "NAMAKARANA"
  | "UPANAYANAM"
  | "SEEMANTHAM"
  | "ANNAPRASHANA"

export type SamagriOption = "PRIEST_ARRANGED" | "SELF_ARRANGED" | "PLATFORM_KIT"

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PRIEST_ACCEPTED"
  | "COMPLETED"
  | "CANCELLED_CONSUMER"
  | "CANCELLED_PRIEST"
  | "NO_SHOW"

export type PaymentStatus = "PENDING" | "DEPOSIT_PAID" | "COMPLETED" | "REFUNDED" | "PARTIALLY_REFUNDED"

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

export interface FamilyDetails {
  primaryName: string
  spouseName?: string
  fatherName?: string
  motherName?: string
  gotram?: string
  nakshatra?: string
  rashi?: string
  notes?: string
}

export interface PriestProfile {
  id: string
  userId: string
  displayName: string
  bio?: string
  photoUrl?: string
  galleryUrls: string[]
  tradition: Tradition
  languages: Language[]
  ceremonies: CeremonyType[]
  serviceCities: City[]
  experienceYears: number
  ceremoniesCount: number
  priceRangeMin: number
  priceRangeMax: number
  travelFeePerKm: number
  templeAffiliation?: string
  aadhaarVerified: boolean
  verificationStatus: VerificationStatus
  foundingPriest: boolean
  isActive: boolean
  rating: number
  reviewCount: number
}

export interface BookingSummary {
  id: string
  bookingRef: string
  ceremonyName: string
  priestName: string
  priestPhoto?: string
  scheduledDate: string
  scheduledTime: string
  city: City
  status: BookingStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  depositAmount: number
}

export interface PriestSearchFilters {
  city?: City
  ceremony?: CeremonyType
  tradition?: Tradition
  language?: Language
  date?: string
  minRating?: number
  maxPrice?: number
}
