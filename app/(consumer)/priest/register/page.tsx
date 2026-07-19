"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Flame, Check, ChevronRight, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TRADITIONS, LANGUAGES, CEREMONIES, CITIES } from "@/lib/constants"
import type { City, CeremonyType, Language, Tradition } from "@/types"

const STEPS = ["Personal Info", "Tradition & Skills", "Service Area & Pricing", "Documents"]

const step1Schema = z.object({
  displayName:    z.string().min(3, "Full name required"),
  phone:          z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit number required"),
  email:          z.string().email("Valid email required"),
  experienceYears: z.coerce.number().min(1).max(60),
  bio:            z.string().min(50, "Write at least 50 characters about your background"),
})

const step3Schema = z.object({
  priceRangeMin: z.coerce.number().min(500),
  priceRangeMax: z.coerce.number().min(500),
  travelFeePerKm: z.coerce.number().min(0).max(50),
  templeAffiliation: z.string().optional(),
})

type Step1 = z.output<typeof step1Schema>
type Step3 = z.output<typeof step3Schema>

export default function PriestRegisterPage() {
  const router = useRouter()
  const [step, setStep]               = useState(0)
  const [tradition, setTradition]     = useState<Tradition | null>(null)
  const [languages, setLanguages]     = useState<Language[]>([])
  const [ceremonies, setCeremonies]   = useState<CeremonyType[]>([])
  const [cities, setCities]           = useState<City[]>([])
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) as any })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form3 = useForm<Step3>({ resolver: zodResolver(step3Schema) as any, defaultValues: { travelFeePerKm: 10 } })

  const toggle = <T,>(arr: T[], val: T, set: (a: T[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  const handleNext = async () => {
    if (step === 0) { const ok = await form1.trigger(); if (!ok) return }
    if (step === 2) { const ok = await form3.trigger(); if (!ok) return }
    if (step === 1) {
      if (!tradition || !languages.length || !ceremonies.length) return
    }
    if (step === 2 && !cities.length) return
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    const ok1 = await form1.trigger()
    if (!ok1) { setStep(0); return }
    if (!tradition || !languages.length || !ceremonies.length) { setStep(1); return }
    const ok3 = await form3.trigger()
    if (!ok3) { setStep(2); return }
    if (!cities.length) { setStep(2); return }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const step1Data = form1.getValues()
      const step3Data = form3.getValues()
      const res = await fetch("/api/priests/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName:       step1Data.displayName,
          bio:               step1Data.bio,
          experienceYears:   Number(step1Data.experienceYears),
          tradition,
          languages,
          ceremonies,
          cities,
          priceRangeMin:     Number(step3Data.priceRangeMin),
          priceRangeMax:     Number(step3Data.priceRangeMax),
          travelFeePerKm:    Number(step3Data.travelFeePerKm),
          templeAffiliation: step3Data.templeAffiliation,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Registration failed")
      }
      setSubmitted(true)
      router.refresh()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center bg-muted/30 px-4 py-24">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Application submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Thank you for joining Archanai. Our team will review your application and verify your details within
            2–3 business days. You'll receive an SMS once your profile is approved.
          </p>
          <Badge variant="secondary" className="mx-auto">⭐ Founding Priest status applied</Badge>
          <Button asChild className="mt-4">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary">Archanai</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Join as a Founding Priest</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Zero commission for 3 months · Permanent Founding badge · 100s of families in your city
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="hidden sm:flex justify-between">
            {STEPS.map((label, i) => (
              <span key={label} className={cn("text-xs", i < step ? "text-primary" : i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-6 space-y-5">

            {/* Step 0 — Personal Info */}
            {step === 0 && (
              <>
                <h2 className="font-semibold">Tell us about yourself</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-sm">Full name *</Label>
                    <Input className="mt-1" placeholder="e.g. Pandit Venkatesh Iyer" {...form1.register("displayName")} />
                    {form1.formState.errors.displayName && <p className="text-xs text-destructive mt-1">{form1.formState.errors.displayName.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm">Mobile number *</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
                      <Input className="rounded-l-none" placeholder="9876543210" maxLength={10} {...form1.register("phone")} />
                    </div>
                    {form1.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form1.formState.errors.phone.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm">Email address *</Label>
                    <Input className="mt-1" type="email" placeholder="pandit@example.com" {...form1.register("email")} />
                    {form1.formState.errors.email && <p className="text-xs text-destructive mt-1">{form1.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm">Years of experience *</Label>
                    <Input className="mt-1" type="number" min={1} max={60} placeholder="15" {...form1.register("experienceYears")} />
                    {form1.formState.errors.experienceYears && <p className="text-xs text-destructive mt-1">{form1.formState.errors.experienceYears.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm">About you *</Label>
                    <Textarea className="mt-1 resize-none" rows={4} placeholder="Describe your training, specialisation, and what makes your ceremonies special..." {...form1.register("bio")} />
                    {form1.formState.errors.bio && <p className="text-xs text-destructive mt-1">{form1.formState.errors.bio.message}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Step 1 — Tradition & Skills */}
            {step === 1 && (
              <>
                <h2 className="font-semibold">Your tradition & skills</h2>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Your tradition / sampradaya *</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(Object.keys(TRADITIONS) as Tradition[]).map((t) => (
                      <button key={t} onClick={() => setTradition(t)}
                        className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                          tradition === t ? "border-primary bg-primary/5 font-medium" : "border-border/60 hover:border-primary/40")}>
                        {TRADITIONS[t].label}
                      </button>
                    ))}
                  </div>
                  {!tradition && <p className="text-xs text-destructive mt-1">Select your tradition</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Languages *</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(LANGUAGES) as Language[]).map((l) => (
                      <button key={l} onClick={() => toggle(languages, l, setLanguages)}
                        className={cn("px-3 py-1.5 rounded-full border text-xs transition-colors",
                          languages.includes(l) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50")}>
                        {LANGUAGES[l]}
                      </button>
                    ))}
                  </div>
                  {!languages.length && <p className="text-xs text-destructive mt-1">Select at least one language</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Ceremonies you offer *</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(Object.keys(CEREMONIES) as CeremonyType[]).map((c) => (
                      <button key={c} onClick={() => toggle(ceremonies, c, setCeremonies)}
                        className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors",
                          ceremonies.includes(c) ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                        <span>{CEREMONIES[c].emoji}</span>
                        <span>{CEREMONIES[c].label}</span>
                        {ceremonies.includes(c) && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                  {!ceremonies.length && <p className="text-xs text-destructive mt-1">Select at least one ceremony</p>}
                </div>
              </>
            )}

            {/* Step 2 — Service Area & Pricing */}
            {step === 2 && (
              <>
                <h2 className="font-semibold">Where you serve & pricing</h2>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Cities you serve *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(CITIES) as City[]).map((c) => (
                      <button key={c} onClick={() => toggle(cities, c, setCities)}
                        className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors",
                          cities.includes(c) ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                        {cities.includes(c) && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        <span>{CITIES[c].label}</span>
                      </button>
                    ))}
                  </div>
                  {!cities.length && <p className="text-xs text-destructive mt-1">Select at least one city</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Suggested min contribution (₹) *</Label>
                    <Input className="mt-1" type="number" min={500} placeholder="2500" {...form3.register("priceRangeMin")} />
                    {form3.formState.errors.priceRangeMin && <p className="text-xs text-destructive mt-1">{form3.formState.errors.priceRangeMin.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm">Suggested max contribution (₹) *</Label>
                    <Input className="mt-1" type="number" min={500} placeholder="8000" {...form3.register("priceRangeMax")} />
                    {form3.formState.errors.priceRangeMax && <p className="text-xs text-destructive mt-1">{form3.formState.errors.priceRangeMax.message}</p>}
                  </div>
                  <div>
                    <Label className="text-sm">Travel fee per km (₹)</Label>
                    <Input className="mt-1" type="number" min={0} placeholder="10" {...form3.register("travelFeePerKm")} />
                  </div>
                  <div>
                    <Label className="text-sm">Temple / Math affiliation</Label>
                    <Input className="mt-1" placeholder="e.g. Kapaleeshwarar Temple" {...form3.register("templeAffiliation")} />
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <p className="font-medium">Founding Priest benefit</p>
                  <p className="text-xs mt-0.5">Zero platform commission for your first 3 months. After that, 12% only on the deposit amount.</p>
                </div>
              </>
            )}

            {/* Step 3 — Documents */}
            {step === 3 && (
              <>
                <h2 className="font-semibold">Verification documents</h2>
                <p className="text-sm text-muted-foreground">
                  These help us verify your identity and build trust with families. All documents are reviewed privately by our team.
                </p>

                {[
                  { label: "Profile photo", desc: "Clear face photo, professional attire preferred", required: true },
                  { label: "Aadhaar card", desc: "Front and back (for identity verification)", required: true },
                  { label: "Certificate / Gurukul proof", desc: "Training certificate or a letter from your temple/math", required: false },
                ].map((doc) => (
                  <div key={doc.label} className="flex items-center gap-4 rounded-xl border border-border/60 p-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {doc.label}
                        {doc.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{doc.desc}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">Upload</Button>
                  </div>
                ))}

                <div className="flex items-start gap-2 mt-2">
                  <Checkbox id="agree" className="mt-0.5" />
                  <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer">
                    I confirm that the information provided is accurate and I agree to Archanai&apos;s{" "}
                    <Link href="/terms" className="text-primary underline">Terms of Service</Link> and{" "}
                    <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
                  </label>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {submitError && (
          <p className="text-sm text-destructive text-center">{submitError}</p>
        )}
        <div className="flex justify-between mt-4 gap-3">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
