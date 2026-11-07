import { z } from "zod"
import { CITIES, CEREMONIES, TRADITIONS, LANGUAGES } from "@/lib/constants"
import type { City, CeremonyType, Tradition, Language } from "@/types"

const keys = <T extends string>(o: Record<T, unknown>) => Object.keys(o) as [T, ...T[]]
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const offeringSchema = z.object({
  type:            z.enum(keys<CeremonyType>(CEREMONIES)),
  price:           z.number().int().min(100).max(1_000_000),
  samagriIncluded: z.boolean().default(false),
  notes:           z.string().max(300).optional(),
})

export const windowSchema = z
  .object({ dayOfWeek: z.number().int().min(0).max(6), startTime: hhmm, endTime: hhmm })
  .refine((w) => w.startTime < w.endTime, "End time must be after start time")

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")

export const priestProfileSchema = z.object({
  displayName:       z.string().min(3).max(80),
  bio:               z.string().min(20).max(2000),
  experienceYears:   z.number().int().min(1).max(70),
  tradition:         z.enum(keys<Tradition>(TRADITIONS)),
  languages:         z.array(z.enum(keys<Language>(LANGUAGES))).min(1),
  cities:            z.array(z.enum(keys<City>(CITIES))).min(1),
  templeAffiliation: z.string().max(120).optional(),
  phone:             phoneSchema,
  offerings:         z.array(offeringSchema).min(1).refine((o) => new Set(o.map((x) => x.type)).size === o.length, "Duplicate ceremony"),
})

/** priestRangeMin/Max and ceremonies[] are derived from the offerings so browse filters keep working. */
export function deriveFromOfferings(offerings: { type: CeremonyType; price: number }[]) {
  const prices = offerings.map((o) => o.price)
  return { ceremonies: offerings.map((o) => o.type), priceRangeMin: Math.min(...prices), priceRangeMax: Math.max(...prices) }
}

export const DEFAULT_WINDOWS = [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, startTime: "06:00", endTime: "20:00" }))
