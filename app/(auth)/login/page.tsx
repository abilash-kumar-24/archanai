"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Flame, Mail, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirect     = searchParams.get("redirect") ?? "/"

  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit() {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Enter a valid email address")
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo:  `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-primary">Archanai</span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm space-y-5">

          {/* Sent state */}
          {sent ? (
            <div className="text-center space-y-3 py-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-base font-semibold">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                We sent a sign-in link to <strong>{email}</strong>. Click the link in that email to continue.
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                Didn&apos;t get it?{" "}
                <button
                  className="underline hover:text-foreground"
                  onClick={() => { setSent(false); setError(null) }}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-semibold">Sign in to Archanai</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  New or returning — just enter your email. We&apos;ll send you a sign-in link.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null) }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="mt-1"
                  autoFocus
                />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : <Mail className="h-4 w-4 mr-2" />}
                Send sign-in link
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
