import { config } from "dotenv"
config({ path: ".env.local" })
import { PrismaClient, CeremonyType, Tradition, Language, City } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "crypto"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

const ceremonies: Array<{
  type: CeremonyType
  name: string
  nameTamil?: string
  nameTelugu?: string
  nameKannada?: string
  nameMalayalam?: string
  description: string
  durationMin: number
  durationMax: number
}> = [
  {
    type:         "GRIHA_PRAVESH",
    name:         "Griha Pravesh",
    nameTamil:    "வீட்டு பிரவேசம்",
    nameTelugu:   "గృహప్రవేశం",
    nameKannada:  "ಗೃಹಪ್ರವೇಶ",
    nameMalayalam: "ഗൃഹപ്രവേശം",
    description:  "House-warming ceremony performed when moving into a new home. Includes Vastu puja, Ganapathi puja, and havan.",
    durationMin:  120,
    durationMax:  180,
  },
  {
    type:         "SATYANARAYAN_PUJA",
    name:         "Satyanarayan Puja",
    nameTamil:    "சத்யநாராயண பூஜை",
    nameTelugu:   "సత్యనారాయణ పూజ",
    nameKannada:  "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ",
    nameMalayalam: "സത്യനാരായണ പൂജ",
    description:  "Auspicious puja dedicated to Lord Vishnu. Performed on special occasions, festivals, and life milestones.",
    durationMin:  90,
    durationMax:  150,
  },
  {
    type:         "NAMAKARANA",
    name:         "Namakarana",
    nameTamil:    "நாமகரணம்",
    nameTelugu:   "నామకరణం",
    nameKannada:  "ನಾಮಕರಣ",
    nameMalayalam: "നാമകരണം",
    description:  "Naming ceremony for a newborn child, typically performed on the 11th or 12th day after birth.",
    durationMin:  60,
    durationMax:  90,
  },
  {
    type:         "UPANAYANAM",
    name:         "Upanayanam",
    nameTamil:    "பூணூல் விழா",
    nameTelugu:   "ఉపనయనం",
    nameKannada:  "ಉಪನಯನ",
    nameMalayalam: "ഉപനയനം",
    description:  "Sacred thread ceremony for boys, marking the initiation into Vedic studies. A significant life milestone.",
    durationMin:  240,
    durationMax:  360,
  },
  {
    type:         "SEEMANTHAM",
    name:         "Seemantham",
    nameTamil:    "வளைகாப்பு",
    nameTelugu:   "సీమంతం",
    nameKannada:  "ಸೀಮಂತ",
    nameMalayalam: "സീമന്തം",
    description:  "Baby shower ceremony performed during pregnancy, typically in the 7th or 8th month, to bless the mother and unborn child.",
    durationMin:  90,
    durationMax:  120,
  },
  {
    type:         "ANNAPRASHANA",
    name:         "Annaprashana",
    nameTamil:    "சோறூண்",
    nameTelugu:   "అన్నప్రాశన",
    nameKannada:  "ಅನ್ನಪ್ರಾಶನ",
    nameMalayalam: "അന്നപ്രാശനം",
    description:  "First rice-feeding ceremony for a baby, typically at 6 months. Celebrates the child's transition to solid food.",
    durationMin:  60,
    durationMax:  90,
  },
]

const samagriByType: Record<CeremonyType, Array<{ name: string; nameTamil?: string; nameTelugu?: string; quantity: string; notes?: string; isOptional: boolean }>> = {
  GRIHA_PRAVESH: [
    { name: "Turmeric powder (Haldi)",    nameTamil: "மஞ்சள்",     quantity: "250g",  isOptional: false },
    { name: "Kumkum (Vermilion)",          nameTamil: "குங்குமம்",  quantity: "50g",   isOptional: false },
    { name: "Sandalwood paste",            nameTamil: "சந்தனம்",    quantity: "1 pack",isOptional: false },
    { name: "Mango leaves (fresh)",        nameTamil: "மாவிலை",     quantity: "2 strings", isOptional: false },
    { name: "Coconuts",                    nameTamil: "தேங்காய்",   quantity: "5",     isOptional: false },
    { name: "Bananas",                     nameTamil: "வாழைப்பழம்", quantity: "1 bunch", isOptional: false },
    { name: "Camphor (Karpoora)",          nameTamil: "கற்பூரம்",   quantity: "50g",   isOptional: false },
    { name: "Ghee (desi)",                 nameTamil: "நெய்",        quantity: "500ml", isOptional: false },
    { name: "Honey",                       nameTamil: "தேன்",        quantity: "100ml", isOptional: false },
    { name: "Panchagavya (milk, curd, ghee, honey, jaggery)", quantity: "as required", isOptional: false },
    { name: "Agarbatti (incense sticks)",  quantity: "2 packs",  isOptional: false },
    { name: "Flowers (marigold, jasmine)", nameTamil: "பூக்கள்", quantity: "2kg",    isOptional: false },
    { name: "Havan samagri (mixed herbs)", quantity: "500g",     isOptional: false },
    { name: "Supari (betel nut)",          quantity: "100g",     isOptional: false },
    { name: "Betel leaves",               quantity: "21",        isOptional: false },
    { name: "New cloth (vastra)",          quantity: "1 set",    isOptional: false, notes: "For the priest — white dhoti preferred" },
    { name: "Earthen pot (matka)",         quantity: "1",        isOptional: true },
    { name: "Navadhanya (9 grains)",       quantity: "100g each", isOptional: true },
  ],
  SATYANARAYAN_PUJA: [
    { name: "Banana leaves",              quantity: "4-6",       isOptional: false },
    { name: "Coconuts",                   nameTamil: "தேங்காய்", quantity: "3",      isOptional: false },
    { name: "Bananas",                    quantity: "1 bunch",   isOptional: false },
    { name: "Turmeric powder",            quantity: "100g",      isOptional: false },
    { name: "Kumkum",                     quantity: "50g",       isOptional: false },
    { name: "Ghee",                       quantity: "250ml",     isOptional: false },
    { name: "Panchamrit (milk, curd, ghee, honey, sugar)", quantity: "as required", isOptional: false },
    { name: "Flowers",                    quantity: "500g",      isOptional: false },
    { name: "Camphor",                    quantity: "25g",       isOptional: false },
    { name: "Incense sticks",             quantity: "1 pack",    isOptional: false },
    { name: "Wheat flour (atta)",         quantity: "500g",      isOptional: false, notes: "For Panchamrit prasad" },
    { name: "Sugar",                      quantity: "250g",      isOptional: false },
    { name: "Betel leaves and supari",    quantity: "21 each",   isOptional: false },
    { name: "Dakshina (dakshina cloth or cash)", quantity: "as desired", isOptional: false },
    { name: "Banana stem",               quantity: "1",          isOptional: true },
  ],
  NAMAKARANA: [
    { name: "Coconut",                    quantity: "2",         isOptional: false },
    { name: "Turmeric",                   quantity: "50g",       isOptional: false },
    { name: "Kumkum",                     quantity: "25g",       isOptional: false },
    { name: "Flowers",                    quantity: "500g",      isOptional: false },
    { name: "Honey",                      quantity: "small jar", isOptional: false },
    { name: "Gold/silver piece",          quantity: "1",         isOptional: false, notes: "For name-writing ritual" },
    { name: "Betel leaves",              quantity: "11",         isOptional: false },
    { name: "Camphor",                    quantity: "25g",       isOptional: false },
    { name: "Incense sticks",             quantity: "1 pack",    isOptional: false },
    { name: "New cloth for baby",         quantity: "1 set",     isOptional: false },
    { name: "Rice (raw)",                 quantity: "1kg",       isOptional: false },
    { name: "Jaggery",                   quantity: "100g",       isOptional: false },
  ],
  UPANAYANAM: [
    { name: "Yagnopaveetam (sacred thread)", quantity: "3 sets", isOptional: false },
    { name: "Coconuts",                   quantity: "11",        isOptional: false },
    { name: "Bananas",                    quantity: "2 bunches", isOptional: false },
    { name: "Ghee",                       quantity: "1L",        isOptional: false },
    { name: "Havan samagri",              quantity: "1kg",       isOptional: false },
    { name: "Samidha (havan sticks)",     quantity: "1 bundle",  isOptional: false },
    { name: "Turmeric",                   quantity: "200g",      isOptional: false },
    { name: "Kumkum",                     quantity: "100g",      isOptional: false },
    { name: "Flowers",                    quantity: "3kg",       isOptional: false },
    { name: "Panchagavya",               quantity: "as required", isOptional: false },
    { name: "New dhoti for the boy",      quantity: "1",         isOptional: false },
    { name: "New dhoti for priest",       quantity: "2",         isOptional: false },
    { name: "Kasha (stick for initiation)", quantity: "1",       isOptional: false },
    { name: "Begging bowl (bhiksha patra)", quantity: "1",       isOptional: false },
    { name: "Navadhanya",                 quantity: "100g each", isOptional: false },
    { name: "Camphor",                    quantity: "100g",      isOptional: false },
    { name: "Sesame seeds (til)",         quantity: "250g",      isOptional: false },
    { name: "Mustard seeds",              quantity: "100g",      isOptional: true },
  ],
  SEEMANTHAM: [
    { name: "Coconuts",                   quantity: "5",         isOptional: false },
    { name: "Bananas",                    quantity: "1 bunch",   isOptional: false },
    { name: "Turmeric",                   quantity: "100g",      isOptional: false },
    { name: "Kumkum",                     quantity: "50g",       isOptional: false },
    { name: "Flowers",                    quantity: "1kg",       isOptional: false },
    { name: "Glass bangles (various colors)", quantity: "as desired", isOptional: false },
    { name: "Mango leaves",              quantity: "1 string",   isOptional: false },
    { name: "Camphor",                    quantity: "25g",       isOptional: false },
    { name: "Incense sticks",             quantity: "1 pack",    isOptional: false },
    { name: "Betel leaves",              quantity: "21",         isOptional: false },
    { name: "Supari",                     quantity: "50g",       isOptional: false },
    { name: "Sweet pongal ingredients",   quantity: "as required", isOptional: true, notes: "Rice, jaggery, ghee, cardamom" },
  ],
  ANNAPRASHANA: [
    { name: "Coconut",                    quantity: "2",         isOptional: false },
    { name: "Banana",                     quantity: "1 bunch",   isOptional: false },
    { name: "Honey",                      quantity: "small jar", isOptional: false },
    { name: "Ghee",                       quantity: "100ml",     isOptional: false },
    { name: "Cooked rice (first morsel)", quantity: "small amount", isOptional: false },
    { name: "Turmeric",                   quantity: "50g",       isOptional: false },
    { name: "Kumkum",                     quantity: "25g",       isOptional: false },
    { name: "Flowers",                    quantity: "250g",      isOptional: false },
    { name: "Camphor",                    quantity: "10g",       isOptional: false },
    { name: "Silver or gold spoon",       quantity: "1",         isOptional: false },
    { name: "New clothes for baby",       quantity: "1 set",     isOptional: false },
    { name: "Panchamrit",                 quantity: "as required", isOptional: true },
  ],
}

async function main() {
  console.log("🌱 Seeding Archanai database...")

  // Upsert ceremonies
  for (const ceremony of ceremonies) {
    await prisma.ceremony.upsert({
      where: { type: ceremony.type },
      update: {},
      create: ceremony,
    })

    const created = await prisma.ceremony.findUnique({ where: { type: ceremony.type } })
    if (!created) continue

    const items = samagriByType[ceremony.type]
    if (!items) continue

    // Default samagri list (no tradition/city filter = universal)
    const existing = await prisma.samagriList.findFirst({
      where: { ceremonyId: created.id, tradition: null, city: null },
    })

    const list = existing ?? await prisma.samagriList.create({
      data: { ceremonyId: created.id },
    })

    // Clear and re-create items
    await prisma.samagriItem.deleteMany({ where: { samagriListId: list.id } })
    await prisma.samagriItem.createMany({
      data: items.map((item) => ({ ...item, samagriListId: list.id })),
    })

    console.log(`  ✓ ${ceremony.name} — ${items.length} samagri items`)
  }

  console.log("✅ Seed complete.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
