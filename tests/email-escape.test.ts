import { test } from "node:test"
import assert from "node:assert/strict"
process.env.NEXT_PUBLIC_SUPABASE_URL = "x"; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "x"
process.env.SUPABASE_SERVICE_ROLE_KEY = "x"; process.env.DATABASE_URL = "x"

test("esc neutralises HTML", async () => {
  const { esc } = await import("../lib/resend/emails")
  assert.equal(esc(`<script>"x"&'y'</script>`), "&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;")
})
