"use client"

import { useEffect, useRef, useState } from "react"
import { Check, FileText, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TRADITIONS, LANGUAGES, CEREMONIES, CITIES } from "@/lib/constants"
import type { City, CeremonyType, Language, Tradition } from "@/types"
import { toast } from "sonner"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DOC_KINDS = { ID_PROOF: "ID proof", CERTIFICATE: "Training certificate", TEMPLE_LETTER: "Temple letter", OTHER: "Other" } as const
type DocKind = keyof typeof DOC_KINDS

type Offering = { price: string; samagriIncluded: boolean; notes: string }
type Day = { on: boolean; start: string; end: string }
type Doc = { id: string; kind: DocKind; fileName: string }

const emptyWeek = (): Day[] => DAYS.map(() => ({ on: true, start: "06:00", end: "20:00" }))

export default function PriestProfilePage() {
  const [form, setForm] = useState({ displayName: "", bio: "", experienceYears: "", phone: "", templeAffiliation: "" })
  const [tradition, setTradition] = useState<Tradition>("IYER_SMARTHA")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("")
  const [travels, setTravels] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [offerings, setOfferings] = useState<Partial<Record<CeremonyType, Offering>>>({})
  const [week, setWeek] = useState<Day[]>(emptyWeek())
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [status, setStatus] = useState<string>("PENDING")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [docKind, setDocKind] = useState<DocKind>("ID_PROOF")
  const photoRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/priests/me")
      .then((r) => r.json())
      .then(({ priest: p, phone }) => {
        if (!p) return
        setForm({
          displayName: p.displayName, bio: p.bio ?? "", experienceYears: String(p.experienceYears),
          phone: phone ?? "", templeAffiliation: p.templeAffiliation ?? "",
        })
        setTradition(p.tradition)
        setGender(p.gender ?? "")
        setTravels(!!p.travelsOutsideCity)
        setLanguages(p.languages)
        setCities(p.serviceCities)
        setPhotoUrl(p.photoUrl)
        setStatus(p.verificationStatus)
        setDocs(p.documents)
        const o: Partial<Record<CeremonyType, Offering>> = {}
        for (const x of p.ceremonyOfferings) o[x.ceremonyType as CeremonyType] = { price: String(x.price), samagriIncluded: x.samagriIncluded, notes: x.notes ?? "" }
        // Legacy priests without per-ceremony rows start from their old minimum.
        if (!p.ceremonyOfferings.length) for (const c of p.ceremonies) o[c as CeremonyType] = { price: String(p.priceRangeMin), samagriIncluded: false, notes: "" }
        setOfferings(o)
        if (p.availability.length) {
          const w = DAYS.map(() => ({ on: false, start: "06:00", end: "20:00" }))
          for (const a of p.availability) w[a.dayOfWeek] = { on: true, start: a.startTime, end: a.endTime }
          setWeek(w)
        }
      })
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false))
  }, [])

  const toggle = <T,>(arr: T[], v: T, set: (a: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const field = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })) })
  const chosen = Object.keys(offerings) as CeremonyType[]

  async function save() {
    const problems: string[] = []
    if (form.displayName.trim().length < 3) problems.push("Enter your name")
    if (form.bio.trim().length < 20) problems.push("Write at least 20 characters in About")
    if (!/^[6-9]\d{9}$/.test(form.phone)) problems.push("Enter a valid 10-digit mobile number")
    if (!languages.length) problems.push("Choose a language")
    if (!cities.length) problems.push("Choose a city")
    if (!chosen.length) problems.push("Choose at least one ceremony")
    if (chosen.some((c) => !(Number(offerings[c]!.price) >= 100))) problems.push("Every ceremony needs a price of at least ₹100")
    if (!week.some((d) => d.on)) problems.push("Choose at least one working day")
    if (week.some((d) => d.on && d.start >= d.end)) problems.push("Working hours must end after they start")
    if (problems.length) return toast.error(problems[0])

    setSaving(true)
    try {
      const res = await fetch("/api/priests/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName.trim(), bio: form.bio.trim(), experienceYears: Number(form.experienceYears) || 1,
          phone: form.phone, tradition, languages, cities,
          gender: gender || null, travelsOutsideCity: travels,
          templeAffiliation: form.templeAffiliation.trim() || undefined,
          offerings: chosen.map((c) => ({ type: c, price: Number(offerings[c]!.price), samagriIncluded: offerings[c]!.samagriIncluded, notes: offerings[c]!.notes.trim() || undefined })),
          availability: week.flatMap((d, i) => (d.on ? [{ dayOfWeek: i, startTime: d.start, endTime: d.end }] : [])),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(typeof json.error === "string" ? json.error : "Please check the highlighted details")
      toast.success("Profile saved 🙏")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  async function upload(url: string, file: File, extra?: Record<string, string>) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      Object.entries(extra ?? {}).forEach(([k, v]) => fd.append(k, v))
      const res = await fetch(url, { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : "Upload failed")
      return null
    } finally {
      setUploading(false)
    }
  }

  async function removeDoc(id: string) {
    const res = await fetch(`/api/priests/documents/${id}`, { method: "DELETE" })
    if (res.ok) setDocs((d) => d.filter((x) => x.id !== id))
    else toast.error("Could not delete")
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <Badge variant={status === "VERIFIED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"}>
          {status === "VERIFIED" ? "Verified" : status === "REJECTED" ? "Needs attention" : "Awaiting verification"}
        </Badge>
      </div>

      {status !== "VERIFIED" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {status === "REJECTED"
            ? "We could not verify your application. Update your details below, then contact the Archanai team."
            : "Your profile is hidden from families until our team verifies you by phone. You can keep editing meanwhile."}
        </div>
      )}

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">Photo</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20 rounded-2xl">
            {photoUrl && <AvatarImage src={photoUrl} alt="Profile photo" className="rounded-2xl object-cover" />}
            <AvatarFallback className="rounded-2xl bg-accent text-primary font-bold text-2xl">🙏</AvatarFallback>
          </Avatar>
          <div>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]; e.target.value = ""
                if (!f) return
                const json = await upload("/api/priests/photo", f)
                if (json) { setPhotoUrl(json.photoUrl); toast.success("Photo updated") }
              }} />
            <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => photoRef.current?.click()}>
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload photo
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG or WebP, max 5MB. A clear face photo builds trust.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">About you</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Label>Display name *</Label><Input className="mt-1" {...field("displayName")} /></div>
          <div><Label>Mobile number *</Label>
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
              <Input className="rounded-l-none" maxLength={10} inputMode="numeric" {...field("phone")} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Shared with a family only after you accept their booking.</p>
          </div>
          <div><Label>Years of experience *</Label><Input className="mt-1" type="number" min={1} max={70} {...field("experienceYears")} /></div>
          <div className="sm:col-span-2"><Label>Bio *</Label><Textarea className="mt-1 resize-none" rows={4} {...field("bio")} /></div>
          <div><Label>Temple / Math affiliation</Label><Input className="mt-1" {...field("templeAffiliation")} /></div>
          <div><Label>Gender (optional)</Label>
            <select className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}>
              <option value="">Prefer not to say</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
            </select>
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={travels} onCheckedChange={(v) => setTravels(v === true)} /> I am willing to travel outside my city for ceremonies
          </label>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">Tradition, languages, cities</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-2">
            {(Object.keys(TRADITIONS) as Tradition[]).map((t) => (
              <button type="button" key={t} onClick={() => setTradition(t)}
                className={cn("text-left px-3 py-2.5 rounded-lg border text-sm", tradition === t ? "border-primary bg-primary/5 font-medium" : "border-border/60 hover:border-primary/40")}>
                {TRADITIONS[t].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(LANGUAGES) as Language[]).map((l) => (
              <button type="button" key={l} onClick={() => toggle(languages, l, setLanguages)}
                className={cn("px-3 py-1.5 rounded-full border text-xs", languages.includes(l) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50")}>
                {LANGUAGES[l]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(CITIES) as City[]).map((c) => (
              <button type="button" key={c} onClick={() => toggle(cities, c, setCities)}
                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm", cities.includes(c) ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40")}>
                {cities.includes(c) && <Check className="h-3.5 w-3.5 text-primary" />}{CITIES[c].label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">Ceremonies and your price</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Tick what you perform and set what you ask for each. Families pay you directly.</p>
          {(Object.keys(CEREMONIES) as CeremonyType[]).map((c) => {
            const o = offerings[c]
            return (
              <div key={c} className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 p-2.5">
                <label className="flex items-center gap-2 flex-1 min-w-40 text-sm cursor-pointer">
                  <Checkbox checked={!!o} onCheckedChange={(v) => setOfferings((p) => {
                    const n = { ...p }
                    if (v === true) n[c] = { price: "", samagriIncluded: false, notes: "" }; else delete n[c]
                    return n
                  })} />
                  {CEREMONIES[c].emoji} {CEREMONIES[c].label}
                </label>
                {o && (
                  <>
                    <div className="flex items-center gap-1"><span className="text-sm text-muted-foreground">₹</span>
                      <Input className="w-24" type="number" min={100} placeholder="Price" value={o.price}
                        onChange={(e) => setOfferings((p) => ({ ...p, [c]: { ...o, price: e.target.value } }))} /></div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox checked={o.samagriIncluded} onCheckedChange={(v) => setOfferings((p) => ({ ...p, [c]: { ...o, samagriIncluded: v === true } }))} /> Samagri included
                    </label>
                    <Input className="basis-full text-xs" maxLength={300} placeholder="Note for families, e.g. needs 2 days notice, bring your own idol" value={o.notes}
                      onChange={(e) => setOfferings((p) => ({ ...p, [c]: { ...o, notes: e.target.value } }))} />
                  </>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">Weekly availability</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Families can only request a start time inside these hours. Block individual dates from your Calendar.</p>
          {week.map((d, i) => (
            <div key={DAYS[i]} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-20 text-sm cursor-pointer">
                <Checkbox checked={d.on} onCheckedChange={(v) => setWeek((w) => w.map((x, j) => (j === i ? { ...x, on: v === true } : x)))} />{DAYS[i]}
              </label>
              <Input type="time" className="w-28" value={d.start} disabled={!d.on} onChange={(e) => setWeek((w) => w.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} />
              <span className="text-muted-foreground text-sm">to</span>
              <Input type="time" className="w-28" value={d.end} disabled={!d.on} onChange={(e) => setWeek((w) => w.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)))} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-none">
        <CardHeader><CardTitle className="text-base">Documents (optional)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Visible only to the Archanai team, to help verify you. PDF or image, max 8MB.</p>
          {docs.map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-sm rounded-lg border border-border/60 px-3 py-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 truncate">{DOC_KINDS[d.kind]} · {d.fileName}</span>
              <button type="button" aria-label="Delete document" onClick={() => removeDoc(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-8 rounded-md border border-border bg-background px-2 text-sm" value={docKind} onChange={(e) => setDocKind(e.target.value as DocKind)}>
              {(Object.keys(DOC_KINDS) as DocKind[]).map((k) => <option key={k} value={k}>{DOC_KINDS[k]}</option>)}
            </select>
            <input ref={docRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]; e.target.value = ""
                if (!f) return
                const json = await upload("/api/priests/documents", f, { kind: docKind })
                if (json) { setDocs((d) => [json.document, ...d]); toast.success("Document uploaded") }
              }} />
            <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => docRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-t border-border lg:static lg:m-0 lg:p-0 lg:border-0 lg:bg-transparent">
        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save changes
        </Button>
      </div>
    </div>
  )
}
