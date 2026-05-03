// Validates required env vars at startup — crashes early with a clear message
// rather than mysterious runtime failures deep in API handlers.

const required = {
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL:                  process.env.DATABASE_URL,
  RESEND_API_KEY:                process.env.RESEND_API_KEY,
} as const

if (typeof window === "undefined") {
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length > 0) {
    throw new Error(
      `[Archanai] Missing required environment variables:\n${missing.map((k) => `  • ${k}`).join("\n")}\n\nCopy .env.local.example to .env.local and fill in the values.`
    )
  }
}

export const env = {
  supabaseUrl:        process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey:    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  databaseUrl:        process.env.DATABASE_URL!,
  resendApiKey:       process.env.RESEND_API_KEY!,
  fromEmail:          process.env.FROM_EMAIL ?? "Archanai <noreply@archanai.in>",
  appUrl:             process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const
