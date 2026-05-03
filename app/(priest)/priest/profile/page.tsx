"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TRADITIONS, LANGUAGES, CEREMONIES, CITIES } from "@/lib/constants"
import type { City, CeremonyType, Language, Tradition } from "@/types"
import { toast } from "sonner"

const schema = z.object({
  displayName:       z.string().min(3),
  bio:               z.string().min(20),
  experienceYears:   z.coerce.number().min(1),
  priceRangeMin:     z.coerce.number().min(500),
  priceRangeMax:     z.coerce.number().min(500),
  travelFeePerKm:    z.coerce.number().min(0),
  templeAffiliation: z.string().optional(),
})
type FormData = z.output<typeof schema>

export default function PriestProfilePage() {
  const [tradition, setTradition]   = useState<Tradition>("IYER_SMARTHA")
  const [languages, setLanguages]   = useState<Language[]>([])
  const [ceremonies, setCeremonies] = useState<CeremonyType[]>([])
  const [cities, setCities]         = useState<City[]>([])
  const [saving, setSaving]         = useState(false)
  const [loaded, setLoaded]         = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  // Load priest data once on mount
  if (typeof window !== "undefined" && !loaded) {
    setLoaded(true)
    fetch("/api/priests/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.priest) return
        const p = data.priest
        reset({
          displayName:       p.displayName,
          bio:               p.bio ?? "",
          experienceYears:   p.experienceYears,
          priceRangeMin:     p.priceRangeMin,
          priceRangeMax:     p.priceRangeMax,
          travelFeePerKm:    p.travelFeePerKm,
          templeAffiliation: p.templeAffiliation ?? "",
        })
        setTradition(p.tradition)
        setLanguages(p.languages)
        setCeremonies(p.ceremonies)
        setCities(p.serviceCities)
      })
      .catch(() => {})
  }

  const toggle = <T,>(arr: T[], val: T, set: (a: T[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const res = await fetch("/api/priests/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          experienceYears: Number(data.experienceYears),
          priceRangeMin:   Number(data.priceRangeMin),
          priceRangeMax:   Number(data.priceRangeMax),
          travelFeePerKm:  Number(data.travelFeePerKm),
          tradition,
          languages,
          ceremonies,
          cities,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Could not save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <Badge variant="secondary">⭐ Founding Priest</Badge>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Photo */}
        <Card className="border-border/60 shadow-none">
          <CardHeader><CardTitle className="text-base">Profile photo</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-20 w-20 rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-accent text-primary font-bold text-2xl">VI</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Upload new photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">JPG or PNG, max 5MB. Professional attire preferred.</p>
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card className="border-border/60 shadow-none">
          <CardHeader><CardTitle className="text-base">Basic information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className="text-sm">Display name *</Label>
                <Input className="mt-1" {...register("displayName")} />
                {errors.displayName && <p className="text-xs text-destructive mt-1">{errors.displayName.message}</p>}
              </div>
              <div>
                <Label className="text-sm">Years of experience *</Label>
                <Input className="mt-1" type="number" {...register("experienceYears")} />
              </div>
              <div>
                <Label className="text-sm">Temple / Math affiliation</Label>
                <Input className="mt-1" {...register("templeAffiliation")} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm">Bio *</Label>
                <Textarea className="mt-1 resize-none" rows={4} {...register("bio")} />
                {errors.bio && <p className="text-xs text-destructive mt-1">{errors.bio.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tradition & Skills */}
        <Card className="border-border/60 shadow-none">
          <CardHeader><CardTitle className="text-base">Tradition & skills</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-sm font-medium mb-2 block">Tradition / sampradaya</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {(Object.keys(TRADITIONS) as Tradition[]).map((t) => (
                  <button type="button" key={t} onClick={() => setTradition(t)}
                    className={cn("text-left px-3 py-2 rounded-lg border text-sm transition-colors",
                      tradition === t ? "border-primary bg-primary/5 font-medium" : "border-border/60 hover:border-primary/40")}>
                    {TRADITIONS[t].label}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-2 block">Languages</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                  <button type="button" key={l} onClick={() => toggle(languages, l, setLanguages)}
                    className={cn("px-3 py-1.5 rounded-full border text-xs transition-colors",
                      languages.includes(l) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50")}>
                    {LANGUAGES[l]}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-2 block">Ceremonies offered</Label>
              <div className="grid sm:grid-cols-2 gap-2">
                {(Object.keys(CEREMONIES) as CeremonyType[]).map((c) => (
                  <button type="button" key={c} onClick={() => toggle(ceremonies, c, setCeremonies)}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                      ceremonies.includes(c) ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                    <span>{CEREMONIES[c].emoji}</span>
                    <span>{CEREMONIES[c].label}</span>
                    {ceremonies.includes(c) && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="border-border/60 shadow-none">
          <CardHeader><CardTitle className="text-base">Pricing & service area</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm">Min contribution (₹)</Label>
                <Input className="mt-1" type="number" {...register("priceRangeMin")} />
              </div>
              <div>
                <Label className="text-sm">Max contribution (₹)</Label>
                <Input className="mt-1" type="number" {...register("priceRangeMax")} />
              </div>
              <div>
                <Label className="text-sm">Travel fee /km (₹)</Label>
                <Input className="mt-1" type="number" {...register("travelFeePerKm")} />
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium mb-2 block">Cities you serve</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(CITIES) as City[]).map((c) => (
                  <button type="button" key={c} onClick={() => toggle(cities, c, setCities)}
                    className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                      cities.includes(c) ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                    {cities.includes(c) && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    {CITIES[c].label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  )
}
