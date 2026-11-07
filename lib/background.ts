import { after } from "next/server"

/**
 * Run work (emails) after the response is sent without cutting it off. On Vercel a plain un-awaited
 * promise can be frozen the moment the response returns; `after` keeps the invocation alive for it.
 * Outside a request (tests, scripts) `after` throws, so the task just runs.
 */
export function background(task: () => Promise<unknown>) {
  const run = () => task().catch((err) => console.error("[background]", err))
  try {
    after(run)
  } catch {
    void run()
  }
}
