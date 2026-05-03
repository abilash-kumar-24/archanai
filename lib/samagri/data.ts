import type { CeremonyType, Tradition } from "@/types"

export interface SamagriItemData {
  name: string
  nameTamil?: string
  nameTelugu?: string
  quantity: string
  notes?: string
  isOptional?: boolean
}

type SamagriMap = Partial<Record<CeremonyType, Partial<Record<Tradition | "DEFAULT", SamagriItemData[]>>>>

export const SAMAGRI_DATA: SamagriMap = {
  GRIHA_PRAVESH: {
    DEFAULT: [
      { name: "Turmeric", nameTamil: "மஞ்சள்", nameTelugu: "పసుపు", quantity: "100g" },
      { name: "Kumkum (Vermilion)", nameTamil: "குங்குமம்", nameTelugu: "కుంకుమ", quantity: "50g" },
      { name: "Coconut", nameTamil: "தேங்காய்", nameTelugu: "కొబ్బరి కాయ", quantity: "5 nos" },
      { name: "Banana", nameTamil: "வாழைப்பழம்", nameTelugu: "అరటి పళ్ళు", quantity: "1 bunch" },
      { name: "Mango leaves (Torana)", nameTamil: "மாவிலை", nameTelugu: "మామిడి ఆకులు", quantity: "2 strings" },
      { name: "Flowers (Marigold)", nameTamil: "பூ", nameTelugu: "పువ్వులు", quantity: "1 kg" },
      { name: "Camphor", nameTamil: "கர்பூரம்", nameTelugu: "కర్పూరం", quantity: "50g" },
      { name: "Incense sticks (Agarbatti)", nameTamil: "அகர்பத்தி", nameTelugu: "అగరబత్తి", quantity: "2 packs" },
      { name: "Ghee", nameTamil: "நெய்", nameTelugu: "నెయ్యి", quantity: "200ml" },
      { name: "Sesame seeds (Til)", nameTamil: "எள்", nameTelugu: "నువ్వులు", quantity: "100g" },
      { name: "Rice (Raw)", nameTamil: "அரிசி", nameTelugu: "బియ్యం", quantity: "2 kg" },
      { name: "Betel leaves", nameTamil: "வெற்றிலை", nameTelugu: "తమలపాకులు", quantity: "20 nos" },
      { name: "Betel nuts (Supari)", nameTamil: "பாக்கு", nameTelugu: "పోక చెక్కలు", quantity: "20 nos" },
      { name: "Brass lamp (Deepam)", nameTamil: "தீபம்", nameTelugu: "దీపం", quantity: "1 no" },
      { name: "Oil (Sesame or Coconut)", quantity: "100ml" },
      { name: "Fruits (Assorted)", nameTamil: "பழங்கள்", nameTelugu: "పండ్లు", quantity: "Assorted" },
      { name: "New cloth (for Kalasam)", quantity: "1 piece" },
      { name: "Copper Kalasam (pot)", nameTamil: "கலசம்", nameTelugu: "కలశం", quantity: "1 no", isOptional: true },
      { name: "Puja plate (Thali)", quantity: "1 no" },
    ],
    IYER_SMARTHA: [
      { name: "Panchamruta (milk, curd, honey, ghee, sugar)", quantity: "As needed" },
      { name: "Vibhuti (sacred ash)", nameTamil: "திருநீறு", quantity: "50g" },
    ],
    NAMBOODIRI: [
      { name: "Nilavilakku (traditional lamp)", nameMalayalam: "നിലവിളക്ക്", quantity: "1 no" } as any,
      { name: "Tulsi (Holy Basil) plant", quantity: "1 no" },
    ],
  },

  SATYANARAYAN_PUJA: {
    DEFAULT: [
      { name: "Wheat flour (Atta)", nameTamil: "கோதுமை மாவு", nameTelugu: "గోధుమ పిండి", quantity: "500g" },
      { name: "Sugar", nameTamil: "சர்க்கரை", nameTelugu: "చక్కెర", quantity: "200g" },
      { name: "Banana", nameTamil: "வாழைப்பழம்", nameTelugu: "అరటి పళ్ళు", quantity: "1 bunch" },
      { name: "Milk", nameTamil: "பால்", nameTelugu: "పాలు", quantity: "500ml" },
      { name: "Curd", nameTamil: "தயிர்", nameTelugu: "పెరుగు", quantity: "200ml" },
      { name: "Honey", nameTamil: "தேன்", nameTelugu: "తేనె", quantity: "50ml" },
      { name: "Ghee", nameTamil: "நெய்", nameTelugu: "నెయ్యి", quantity: "200ml" },
      { name: "Coconut", nameTamil: "தேங்காய்", nameTelugu: "కొబ్బరి కాయ", quantity: "3 nos" },
      { name: "Turmeric", nameTamil: "மஞ்சள்", nameTelugu: "పసుపు", quantity: "50g" },
      { name: "Kumkum", nameTamil: "குங்குமம்", nameTelugu: "కుంకుమ", quantity: "25g" },
      { name: "Camphor", nameTamil: "கர்பூரம்", nameTelugu: "కర్పూరం", quantity: "25g" },
      { name: "Incense sticks", quantity: "1 pack" },
      { name: "Flowers", nameTamil: "பூக்கள்", nameTelugu: "పువ్వులు", quantity: "500g" },
      { name: "Betel leaves", nameTamil: "வெற்றிலை", nameTelugu: "తమలపాకులు", quantity: "10 nos" },
      { name: "Betel nuts", quantity: "10 nos" },
      { name: "Panchamruta ingredients", quantity: "As above" },
    ],
  },

  NAMAKARANA: {
    DEFAULT: [
      { name: "Honey", nameTamil: "தேன்", nameTelugu: "తేనె", quantity: "25ml" },
      { name: "Ghee", nameTamil: "நெய்", nameTelugu: "నెయ్యి", quantity: "100ml" },
      { name: "Gold ring (for touching tongue)", quantity: "1 no", notes: "Family to provide" },
      { name: "New clothes for baby", quantity: "1 set", notes: "Family to provide" },
      { name: "Coconut", nameTamil: "தேங்காய்", nameTelugu: "కొబ్బరి కాయ", quantity: "2 nos" },
      { name: "Banana", quantity: "1 bunch" },
      { name: "Turmeric", quantity: "50g" },
      { name: "Kumkum", quantity: "25g" },
      { name: "Flowers", quantity: "500g" },
      { name: "Camphor", quantity: "25g" },
      { name: "Betel leaves", quantity: "10 nos" },
      { name: "Rice (Raw)", quantity: "1 kg" },
    ],
  },

  UPANAYANAM: {
    DEFAULT: [
      { name: "Sacred thread (Yagnopaveeta)", nameTamil: "பூணூல்", nameTelugu: "యజ్ఞోపవీతం", quantity: "3 sets", notes: "Priest will source" },
      { name: "Kusa grass", quantity: "1 bunch" },
      { name: "Ghee", quantity: "500ml" },
      { name: "Sesame seeds", quantity: "200g" },
      { name: "Rice", quantity: "5 kg" },
      { name: "Coconut", quantity: "10 nos" },
      { name: "Fruits (Assorted)", quantity: "Large assortment" },
      { name: "Flowers", quantity: "3 kg" },
      { name: "Mango leaves", quantity: "4 strings" },
      { name: "Turmeric", quantity: "200g" },
      { name: "Kumkum", quantity: "100g" },
      { name: "Camphor", quantity: "100g" },
      { name: "New dhoti for the boy", quantity: "2 sets", notes: "Family to provide" },
      { name: "New clothes for parents", quantity: "1 set each", notes: "Family to provide", isOptional: true },
      { name: "Brass Kalasam", quantity: "1 no" },
      { name: "Banana leaves", quantity: "10 nos" },
      { name: "Betel leaves and nuts", quantity: "50 sets" },
      { name: "Pancha sugandhika (5 fragrances)", quantity: "As needed" },
    ],
  },

  SEEMANTHAM: {
    DEFAULT: [
      { name: "Turmeric", quantity: "100g" },
      { name: "Kumkum", quantity: "50g" },
      { name: "Glass bangles (16 pairs)", nameTamil: "வளையல்கள்", nameTelugu: "గాజులు", quantity: "16 pairs" },
      { name: "Coconut", quantity: "5 nos" },
      { name: "Banana", quantity: "2 bunches" },
      { name: "Flowers (Jasmine & Marigold)", quantity: "2 kg" },
      { name: "Saree for expectant mother", quantity: "1", notes: "Family to provide", isOptional: true },
      { name: "Camphor", quantity: "50g" },
      { name: "Incense sticks", quantity: "2 packs" },
      { name: "Ghee", quantity: "200ml" },
      { name: "Fruits", quantity: "Assorted" },
      { name: "Betel leaves and nuts", quantity: "20 sets" },
    ],
  },

  ANNAPRASHANA: {
    DEFAULT: [
      { name: "Rice (Cooked, first feed)", quantity: "Small bowl", notes: "Family to prepare" },
      { name: "Ghee", quantity: "100ml" },
      { name: "Honey", quantity: "25ml" },
      { name: "Silver spoon", quantity: "1", notes: "Family to provide", isOptional: true },
      { name: "Coconut", quantity: "2 nos" },
      { name: "Banana", quantity: "1 bunch" },
      { name: "Flowers", quantity: "500g" },
      { name: "Turmeric", quantity: "50g" },
      { name: "Kumkum", quantity: "25g" },
      { name: "Camphor", quantity: "25g" },
      { name: "New clothes for baby", quantity: "1 set", notes: "Family to provide" },
    ],
  },
}

export function getSamagriList(
  ceremony: CeremonyType,
  tradition?: Tradition
): SamagriItemData[] {
  const ceremonyData = SAMAGRI_DATA[ceremony]
  if (!ceremonyData) return []

  const defaultItems = ceremonyData.DEFAULT ?? []
  const traditionItems = tradition ? (ceremonyData[tradition] ?? []) : []

  const combined = [...defaultItems, ...traditionItems]
  const seen = new Set<string>()
  return combined.filter((item) => {
    if (seen.has(item.name)) return false
    seen.add(item.name)
    return true
  })
}
