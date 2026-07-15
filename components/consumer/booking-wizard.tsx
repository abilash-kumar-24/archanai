"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CEREMONIES, TRADITIONS, CITIES } from "@/lib/constants"
import { formatINR } from "@/lib/utils/booking"
import { toast } from "sonner"
import type { City, CeremonyType, SamagriOption, Tradition } from "@/types"

const STEPS = ["Ceremony", "Date & Location", "Family Details", "Samagri", "Review & Confirm"]

const familySchema = z.object({
  primaryName: z.string().min(2, "Required"),
  spouseName:  z.string().optional(),
  fatherName:  z.string().optional(),
  motherName:  z.string().optional(),
  gotram:      z.string().optional(),
  nakshatra:   z.string().optional(),
  rashi:       z.string().optional(),
  notes:       z.string().optional(),
})

const locationSchema = z.object({
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  pincode:      z.string().length(6, "Enter a valid 6-digit pincode"),
})

type FamilyForm   = z.infer<typeof familySchema>
type LocationForm = z.infer<typeof locationSchema>

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
]

// 30% of min price, minimum ₹500, rounded to nearest ₹100
function calcDeposit(priceRangeMin: number) {
  return Math.max(500, Math.round((priceRangeMin * 0.3) / 100) * 100)
}

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return true
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export interface BookingPriest {
  id:            string
  displayName:   string
  tradition:     Tradition
  priceRangeMin: number
  priceRangeMax: number
  rating:        number
  reviewCount:   number
}

interface BookingWizardProps {
  priest:          BookingPriest
  initialCeremony?: string
}

export function BookingWizard({ priest, initialCeremony }: BookingWizardProps) {
  const [step, setStep]                   = useState(0)
  const [selectedCeremony, setSelectedCeremony] = useState<CeremonyType | null>(
    initialCeremony as CeremonyType | null
  )
  const [selectedDate, setSelectedDate]   = useState<Date | undefined>()
  const [selectedTime, setSelectedTime]   = useState<string | null>(null)
  const [selectedCity, setSelectedCity]   = useState<City | "">("")
  const [samagriOption, setSamagriOption] = useState<SamagriOption>("SELF_ARRANGED")
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [bookingRef, setBookingRef]       = useState("")

  const familyForm = useForm<FamilyForm>({
    resolver: zodResolver(familySchema),
    defaultValues: { primaryName: "" },
  })
  const locationForm = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: { addressLine1: "" },
  })

  const deposit = calcDeposit(priest.priceRangeMin)

  const canAdvance = () => {
    if (step === 0) return !!selectedCeremony
    if (step === 1) return !!selectedDate && !!selectedTime && !!selectedCity
    if (step === 2) return true
    if (step === 3) return !!samagriOption
    return true
  }

  const handleNext = async () => {
    if (step === 2) { const ok = await familyForm.trigger(); if (!ok) return }
    if (step === 1) { const ok = await locationForm.trigger(); if (!ok) return }
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const initiatePayment = async (bookingId: string, ref: string) => {
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) { setBookingRef(ref); return }

      const orderRes = await fetch("/api/payments/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bookingId }),
      })

      if (!orderRes.ok) {
        // Razorpay not configured yet — show booking confirmed anyway
        setBookingRef(ref)
        return
      }

      const { orderId, amount, keyId } = await orderRes.json()

      type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
      type RzpClass = new (options: unknown) => { open(): void }
      const RazorpayClass = (window as unknown as { Razorpay: RzpClass }).Razorpay

      const rzp = new RazorpayClass({
        key:         keyId,
        amount:      amount * 100,
        currency:    "INR",
        name:        "Archanai",
        description: `Booking Deposit — ${selectedCeremony ? CEREMONIES[selectedCeremony]?.label : "Ceremony"}`,
        order_id:    orderId,
        handler: async (response: RzpResponse) => {
          await fetch("/api/payments/verify", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ bookingId, ...response }),
          }).catch(console.error)
          setBookingRef(ref)
        },
        prefill: { name: familyForm.getValues("primaryName") },
        theme:   { color: "#B45309" },
        modal:   { ondismiss: () => setBookingRef(ref) },
      })
      rzp.open()
    } catch {
      // Fallback — show success even if payment initiation fails
      setBookingRef(ref)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCeremony || !selectedDate || !selectedTime || !selectedCity) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priestId:      priest.id,
          ceremonyType:  selectedCeremony,
          scheduledDate: selectedDate.toISOString(),
          scheduledTime: selectedTime,
          addressLine1:  locationForm.getValues("addressLine1"),
          addressLine2:  locationForm.getValues("addressLine2"),
          city:          selectedCity,
          pincode:       locationForm.getValues("pincode"),
          samagriOption,
          familyDetails: familyForm.getValues(),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        if (res.status === 401) {
          toast.error("Please sign in to book a priest.")
        } else {
          toast.error(err.error ?? "Failed to create booking")
        }
        return
      }

      const { bookingId, bookingRef: ref } = await res.json()
      setIsSubmitting(false)
      await initiatePayment(bookingId, ref)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingRef) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Booking Request Sent!</h2>
          <p className="text-muted-foreground text-sm">
            Your reference is{" "}
            <span className="font-semibold font-mono text-foreground">{bookingRef}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {priest.displayName} has been notified and will confirm within a few hours.
            You&apos;ll receive an email confirmation once accepted.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStep(0); setBookingRef("") }}>
              Book Another
            </Button>
            <Button asChild>
              <a href="/bookings">View My Bookings</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="hidden sm:flex justify-between">
          {STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => i < step && setStep(i)}
              className={cn(
                "text-xs transition-colors",
                i < step  ? "text-primary cursor-pointer"
                : i === step ? "text-foreground font-medium"
                : "text-muted-foreground cursor-default"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-6">

          {/* Step 0 — Ceremony */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold">Which ceremony are you booking?</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(Object.keys(CEREMONIES) as CeremonyType[]).map((type) => {
                  const c = CEREMONIES[type]
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedCeremony(type)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        selectedCeremony === type
                          ? "border-primary bg-primary/5"
                          : "border-border/60 hover:border-primary/40"
                      )}
                    >
                      <span className="text-2xl shrink-0">{c.emoji}</span>
                      <div>
                        <p className="font-medium text-sm">{c.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(c.durationMin / 60)}–{Math.round(c.durationMax / 60)} hours
                        </p>
                      </div>
                      {selectedCeremony === type && (
                        <Check className="h-4 w-4 text-primary ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 1 — Date, Time & Location */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-semibold">When and where is the ceremony?</h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ceremony date</Label>
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex w-full items-center justify-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal transition-colors hover:bg-muted",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start time</Label>
                  <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={cn(
                          "text-xs py-2 rounded-lg border transition-colors",
                          selectedTime === t
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border/60 hover:border-primary/40"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Ceremony address</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">City *</Label>
                    <Select value={selectedCity} onValueChange={(v) => setSelectedCity(v as City)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(CITIES) as City[]).map((c) => (
                          <SelectItem key={c} value={c}>{CITIES[c].label}, {CITIES[c].state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedCity && <p className="text-xs text-muted-foreground mt-1">Required</p>}
                  </div>
                  <div>
                    <Label htmlFor="addr1" className="text-sm">Address line 1 *</Label>
                    <Input
                      id="addr1"
                      className="mt-1"
                      placeholder="Flat / House no., Building, Street"
                      {...locationForm.register("addressLine1")}
                    />
                    {locationForm.formState.errors.addressLine1 && (
                      <p className="text-xs text-destructive mt-1">{locationForm.formState.errors.addressLine1.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="addr2" className="text-sm">Address line 2</Label>
                    <Input
                      id="addr2"
                      className="mt-1"
                      placeholder="Locality, Landmark (optional)"
                      {...locationForm.register("addressLine2")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pincode" className="text-sm">Pincode *</Label>
                      <Input
                        id="pincode"
                        className="mt-1"
                        placeholder="600001"
                        maxLength={6}
                        {...locationForm.register("pincode")}
                      />
                      {locationForm.formState.errors.pincode && (
                        <p className="text-xs text-destructive mt-1">{locationForm.formState.errors.pincode.message}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">Parking available?</Label>
                      <Input className="mt-1" placeholder="Yes / No / Notes" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Family Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold">Family details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your priest will review these before the ceremony — nothing needs to be repeated on the day.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryName" className="text-sm">Your name (Yajamana) *</Label>
                  <Input
                    id="primaryName"
                    className="mt-1"
                    placeholder="e.g. Ramesh Kumar"
                    {...familyForm.register("primaryName")}
                  />
                  {familyForm.formState.errors.primaryName && (
                    <p className="text-xs text-destructive mt-1">{familyForm.formState.errors.primaryName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="spouseName" className="text-sm">Spouse name</Label>
                  <Input id="spouseName" className="mt-1" placeholder="e.g. Priya Ramesh" {...familyForm.register("spouseName")} />
                </div>
                <div>
                  <Label htmlFor="fatherName" className="text-sm">Father&apos;s name</Label>
                  <Input id="fatherName" className="mt-1" placeholder="e.g. Suresh Kumar" {...familyForm.register("fatherName")} />
                </div>
                <div>
                  <Label htmlFor="motherName" className="text-sm">Mother&apos;s name</Label>
                  <Input id="motherName" className="mt-1" placeholder="e.g. Lakshmi Suresh" {...familyForm.register("motherName")} />
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <h3 className="text-sm font-medium">Jatakam details</h3>
                <p className="text-xs text-muted-foreground">Used for correct mantra recitation — optional but recommended</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gotram" className="text-sm">Gotram</Label>
                  <Input id="gotram" className="mt-1" placeholder="e.g. Bharadwaja" {...familyForm.register("gotram")} />
                </div>
                <div>
                  <Label htmlFor="nakshatra" className="text-sm">Nakshatra</Label>
                  <Input id="nakshatra" className="mt-1" placeholder="e.g. Rohini" {...familyForm.register("nakshatra")} />
                </div>
                <div>
                  <Label htmlFor="rashi" className="text-sm">Rashi</Label>
                  <Input id="rashi" className="mt-1" placeholder="e.g. Vrishabha" {...familyForm.register("rashi")} />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Special instructions or family customs</Label>
                <Textarea
                  id="notes"
                  className="mt-1 resize-none"
                  rows={3}
                  placeholder="Any specific customs, dietary requirements for the priest, or special requests..."
                  {...familyForm.register("notes")}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Samagri */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold">Samagri (ritual materials)</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  How do you want to handle the puja materials?
                </p>
              </div>

              <RadioGroup
                value={samagriOption}
                onValueChange={(v: string) => setSamagriOption(v as SamagriOption)}
                className="space-y-3"
              >
                {([
                  {
                    value: "PRIEST_ARRANGED" as const,
                    label: "Priest arranges everything",
                    desc:  "Your priest will source all materials and bring them. Agree the additional cost directly with the priest.",
                    badge: "Easiest",
                  },
                  {
                    value: "SELF_ARRANGED" as const,
                    label: "I'll arrange (with checklist)",
                    desc:  "We'll send you a precise, tradition-specific samagri checklist via email after booking. Buy from your local store.",
                    badge: "Most popular",
                  },
                ]).map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={opt.value}
                    className={cn(
                      "flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all",
                      samagriOption === opt.value ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{opt.label}</span>
                        <Badge variant="secondary" className="text-xs">{opt.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {selectedCeremony && (
                <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {CEREMONIES[selectedCeremony].emoji} {CEREMONIES[selectedCeremony].label}
                  </span>{" "}
                  requires approximately 15–25 items depending on your tradition.
                  {samagriOption === "SELF_ARRANGED" && (
                    <span className="block mt-1 text-primary text-xs">
                      ✓ A detailed samagri checklist will be sent to your email after the priest confirms.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Review & Confirm */}
          {step === 4 && selectedCeremony && (
            <div className="space-y-5">
              <h2 className="font-semibold">Review your booking request</h2>

              <div className="rounded-xl border border-border/60 divide-y divide-border/60 text-sm">
                <div className="p-4 flex justify-between">
                  <span className="text-muted-foreground">Priest</span>
                  <span className="font-medium">{priest.displayName}</span>
                </div>
                <div className="p-4 flex justify-between">
                  <span className="text-muted-foreground">Tradition</span>
                  <span>{TRADITIONS[priest.tradition]?.label}</span>
                </div>
                <div className="p-4 flex justify-between">
                  <span className="text-muted-foreground">Ceremony</span>
                  <span>{CEREMONIES[selectedCeremony].emoji} {CEREMONIES[selectedCeremony].label}</span>
                </div>
                {selectedDate && (
                  <div className="p-4 flex justify-between">
                    <span className="text-muted-foreground">Date & Time</span>
                    <span>{format(selectedDate, "PPP")} at {selectedTime}</span>
                  </div>
                )}
                {selectedCity && (
                  <div className="p-4 flex justify-between">
                    <span className="text-muted-foreground">City</span>
                    <span>{CITIES[selectedCity as City]?.label}</span>
                  </div>
                )}
                <div className="p-4 flex justify-between">
                  <span className="text-muted-foreground">Samagri</span>
                  <span>{samagriOption === "PRIEST_ARRANGED" ? "Priest-arranged" : "Self-arranged (checklist)"}</span>
                </div>
              </div>

              <div className="rounded-xl bg-accent/30 p-4 text-sm space-y-2">
                <p className="font-medium">Contribution &amp; Deposit</p>
                <p className="text-muted-foreground">
                  This priest&apos;s typical range is{" "}
                  <span className="font-semibold text-foreground">
                    {formatINR(priest.priceRangeMin)} – {formatINR(priest.priceRangeMax)}
                  </span>
                  . A refundable deposit of{" "}
                  <span className="font-semibold text-foreground">{formatINR(deposit)}</span>
                  {" "}is collected now to confirm your slot. The remaining amount is settled directly with the priest on ceremony day.
                </p>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating booking…" : `Pay Deposit ${formatINR(deposit)} & Confirm 🙏`}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                The priest will confirm via email · Free cancellation up to 7 days before ceremony
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < STEPS.length - 1 && (
          <Button onClick={handleNext} disabled={!canAdvance()} className="ml-auto">
            Continue <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
