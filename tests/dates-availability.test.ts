import { test } from "node:test"
import assert from "node:assert/strict"
import { addDays, dayOfWeek, parseDateOnly, toDateOnly, todayIST } from "../lib/dates"
import { dayAvailable, evaluateSlot } from "../lib/booking/availability"

const base = { today: "2026-03-10", windows: [], blocked: new Set<string>(), booked: new Set<string>(), time: "09:00" }

test("parseDateOnly is strict and tz-proof", () => {
  assert.equal(toDateOnly(parseDateOnly("2026-03-14")!), "2026-03-14")
  assert.equal(parseDateOnly("2026-02-30"), null)
  assert.equal(parseDateOnly("2026-03-14T00:00:00Z"), null)
  assert.equal(parseDateOnly("garbage"), null)
})

test("date math and weekday", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01")
  assert.equal(dayOfWeek("2026-03-15"), 0) // Sunday
})

test("todayIST rolls over at 18:30 UTC", () => {
  assert.equal(todayIST(new Date("2026-03-10T18:29:00Z")), "2026-03-10")
  assert.equal(todayIST(new Date("2026-03-10T18:31:00Z")), "2026-03-11")
})

test("lead time and horizon", () => {
  assert.equal(evaluateSlot({ ...base, day: "2026-03-10" }).ok, false) // today
  assert.equal(evaluateSlot({ ...base, day: "2026-03-11" }).ok, true) // tomorrow
  assert.equal(evaluateSlot({ ...base, day: "2027-04-01" }).ok, false) // > 365d
})

test("weekly windows", () => {
  const windows = [{ dayOfWeek: 0, startTime: "06:00", endTime: "12:00" }] // Sundays only
  assert.equal(evaluateSlot({ ...base, windows, day: "2026-03-15" }).ok, true) // Sunday 09:00
  assert.equal(evaluateSlot({ ...base, windows, day: "2026-03-16" }).ok, false) // Monday
  assert.equal(evaluateSlot({ ...base, windows, day: "2026-03-15", time: "12:00" }).ok, false) // end exclusive
  assert.equal(evaluateSlot({ ...base, windows, day: "2026-03-15", time: "05:30" }).ok, false)
})

test("blocked and booked days", () => {
  assert.equal(evaluateSlot({ ...base, day: "2026-03-12", blocked: new Set(["2026-03-12"]) }).ok, false)
  assert.equal(evaluateSlot({ ...base, day: "2026-03-12", booked: new Set(["2026-03-12"]) }).ok, false)
  assert.equal(evaluateSlot({ ...base, day: "2026-03-13", booked: new Set(["2026-03-12"]) }).ok, true)
})

test("dayAvailable mirrors the slot rules without time", () => {
  const w = [{ dayOfWeek: 0, startTime: "06:00", endTime: "12:00" }]
  assert.equal(dayAvailable({ ...base, day: "2026-03-15", windows: w }), true)
  assert.equal(dayAvailable({ ...base, day: "2026-03-16", windows: w }), false)
  assert.equal(dayAvailable({ ...base, day: "2026-03-15", windows: w, booked: new Set(["2026-03-15"]) }), false)
  assert.equal(dayAvailable({ ...base, day: "2026-03-10" }), false)
})
