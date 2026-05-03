import type { City, CeremonyType, Tradition, Language } from "@/types"

export const CITIES: Record<City, { label: string; state: string }> = {
  CHENNAI: { label: "Chennai", state: "Tamil Nadu" },
  BANGALORE: { label: "Bangalore", state: "Karnataka" },
  HYDERABAD: { label: "Hyderabad", state: "Telangana" },
  COCHIN: { label: "Cochin", state: "Kerala" },
  AMARAVATI: { label: "Amaravati", state: "Andhra Pradesh" },
}

export const CEREMONIES: Record<
  CeremonyType,
  {
    label: string
    labelTamil: string
    labelTelugu: string
    labelKannada: string
    labelMalayalam: string
    description: string
    durationMin: number
    durationMax: number
    emoji: string
  }
> = {
  GRIHA_PRAVESH: {
    label: "Griha Pravesh",
    labelTamil: "இல்ல பிரவேசம்",
    labelTelugu: "గృహ ప్రవేశం",
    labelKannada: "ಗೃಹ ಪ್ರವೇಶ",
    labelMalayalam: "ഗൃഹ പ്രവേശം",
    description: "New home blessing ceremony to invoke prosperity and positive energy",
    durationMin: 120,
    durationMax: 180,
    emoji: "🏠",
  },
  SATYANARAYAN_PUJA: {
    label: "Satyanarayan Puja",
    labelTamil: "சத்யநாராயண பூஜை",
    labelTelugu: "సత్యనారాయణ పూజ",
    labelKannada: "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ",
    labelMalayalam: "സത്യനാരായണ പൂജ",
    description: "Devotional puja performed on auspicious occasions for blessings and prosperity",
    durationMin: 90,
    durationMax: 120,
    emoji: "🪔",
  },
  NAMAKARANA: {
    label: "Namakarana",
    labelTamil: "நாமகரணம்",
    labelTelugu: "నామకరణం",
    labelKannada: "ನಾಮಕರಣ",
    labelMalayalam: "നാമകരണം",
    description: "Sacred naming ceremony for a newborn — typically on the 11th or 12th day",
    durationMin: 60,
    durationMax: 120,
    emoji: "👶",
  },
  UPANAYANAM: {
    label: "Upanayanam",
    labelTamil: "உபநயனம்",
    labelTelugu: "ఉపనయనం",
    labelKannada: "ಉಪನಯನ",
    labelMalayalam: "ഉപനയനം",
    description: "Sacred thread ceremony marking a boy's entry into formal Vedic study",
    durationMin: 240,
    durationMax: 360,
    emoji: "🧵",
  },
  SEEMANTHAM: {
    label: "Seemantham / Valaikappu",
    labelTamil: "வளைகாப்பு",
    labelTelugu: "సీమంతం",
    labelKannada: "ಸೀಮಂತ",
    labelMalayalam: "സീമന്തം",
    description: "Baby shower blessing ceremony during the 7th or 8th month of pregnancy",
    durationMin: 120,
    durationMax: 180,
    emoji: "🌸",
  },
  ANNAPRASHANA: {
    label: "Annaprashana",
    labelTamil: "சோறூட்டு",
    labelTelugu: "అన్నప్రాశన",
    labelKannada: "ಅನ್ನಪ್ರಾಶನ",
    labelMalayalam: "അന്നപ്രാശനം",
    description: "First solid food ceremony for a baby — a joyful family celebration",
    durationMin: 60,
    durationMax: 90,
    emoji: "🍚",
  },
}

export const TRADITIONS: Record<Tradition, { label: string; cities: City[] }> = {
  IYER_SMARTHA: { label: "Iyer (Smartha)", cities: ["CHENNAI", "BANGALORE"] },
  IYENGAR_SRI_VAISHNAVA: { label: "Iyengar (Sri Vaishnava)", cities: ["CHENNAI", "BANGALORE"] },
  MADHWA: { label: "Madhwa", cities: ["BANGALORE"] },
  SMARTHA_KARNATAKA: { label: "Smartha (Karnataka)", cities: ["BANGALORE"] },
  VAISHNAVA_KARNATAKA: { label: "Vaishnava (Karnataka)", cities: ["BANGALORE"] },
  TELUGU_NIYOGI: { label: "Telugu Brahmin (Niyogi)", cities: ["HYDERABAD", "AMARAVATI"] },
  TELUGU_VAIDIKI: { label: "Telugu Brahmin (Vaidiki)", cities: ["HYDERABAD", "AMARAVATI"] },
  NAMBOODIRI: { label: "Namboodiri", cities: ["COCHIN"] },
  KERALA_SMARTHA: { label: "Kerala Smartha", cities: ["COCHIN"] },
}

export const LANGUAGES: Record<Language, string> = {
  ENGLISH: "English",
  TAMIL: "Tamil",
  KANNADA: "Kannada",
  TELUGU: "Telugu",
  MALAYALAM: "Malayalam",
  SANSKRIT: "Sanskrit",
  HINDI: "Hindi",
}

export const CITY_TRADITIONS: Record<City, Tradition[]> = {
  CHENNAI: ["IYER_SMARTHA", "IYENGAR_SRI_VAISHNAVA"],
  BANGALORE: ["MADHWA", "SMARTHA_KARNATAKA", "VAISHNAVA_KARNATAKA", "IYER_SMARTHA", "IYENGAR_SRI_VAISHNAVA"],
  HYDERABAD: ["TELUGU_NIYOGI", "TELUGU_VAIDIKI"],
  COCHIN: ["NAMBOODIRI", "KERALA_SMARTHA"],
  AMARAVATI: ["TELUGU_NIYOGI", "TELUGU_VAIDIKI"],
}

export const CITY_LANGUAGES: Record<City, Language[]> = {
  CHENNAI: ["TAMIL", "SANSKRIT", "ENGLISH"],
  BANGALORE: ["KANNADA", "TAMIL", "TELUGU", "SANSKRIT", "ENGLISH"],
  HYDERABAD: ["TELUGU", "SANSKRIT", "ENGLISH"],
  COCHIN: ["MALAYALAM", "SANSKRIT", "ENGLISH"],
  AMARAVATI: ["TELUGU", "SANSKRIT", "ENGLISH"],
}

export const PLATFORM_COMMISSION_RATE = 0.12
export const DEPOSIT_RATE = 0.30
export const URGENCY_PREMIUM_RATE = 0.25
