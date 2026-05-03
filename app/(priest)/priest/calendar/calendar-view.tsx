"use client"

import { useState } from "react"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths, parseISO,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CEREMONIES } from "@/lib/constants"
import type { CeremonyType } from "@/types"

type Booking = {
  id:           string
  date:         string
  ceremonyType: CeremonyType
  ceremonyName: string
  consumer:     string
  time:         string
}

type BlockedDate = { id: string; date: string }

export function CalendarView({
  priestId,
  bookings,
  initialBlocked,
}: {
  priestId:        string
  bookings:        Booking[]
  initialBlocked:  BlockedDate[]
}) {
  const [current, setCurrent]   = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [blocked, setBlocked]   = useState<BlockedDate[]>(initialBlocked)
  const [toggling, setToggling] = useState(false)

  const start    = startOfMonth(current)
  const end      = endOfMonth(current)
  const days     = eachDayOfInterval({ start, end })
  const startPad = start.getDay()

  const bookingsOnDay = (d: Date) =>
    bookings.filter((b) => isSameDay(parseISO(b.date), d))

  const blockedEntry = (d: Date) =>
    blocked.find((b) => isSameDay(parseISO(b.date), d))

  const toggleBlock = async (d: Date) => {
    if (toggling) return
    const entry = blockedEntry(d)
    setToggling(true)
    try {
      if (entry) {
        await fetch(`/api/priests/blocked-dates/${entry.id}`, { method: "DELETE" })
        setBlocked((prev) => prev.filter((b) => b.id !== entry.id))
      } else {
        const res = await fetch("/api/priests/blocked-dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: d.toISOString() }),
        })
        const data = await res.json()
        setBlocked((prev) => [...prev, { id: data.id, date: d.toISOString() }])
      }
    } catch {}
    setToggling(false)
    setSelectedDay(d)
  }

  const selectedBookings = selectedDay ? bookingsOnDay(selectedDay) : []

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-border/60 shadow-none lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-5">
              <Button variant="ghost" size="icon" onClick={() => setCurrent((c) => subMonths(c, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold">{format(current, "MMMM yyyy")}</h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrent((c) => addMonths(c, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {days.map((day) => {
                const dayBookings = bookingsOnDay(day)
                const isBlockedDay  = !!blockedEntry(day)
                const isSelected    = selectedDay && isSameDay(day, selectedDay)
                const today         = isToday(day)

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    onDoubleClick={() => { if (!dayBookings.length) toggleBlock(day) }}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-start pt-1 text-sm transition-colors relative",
                      isSelected && "ring-2 ring-primary ring-offset-1",
                      today && "font-bold",
                      isBlockedDay && "bg-red-50 text-red-400",
                      dayBookings.length > 0 && "bg-primary/10 text-primary",
                      !isBlockedDay && !dayBookings.length && "hover:bg-muted"
                    )}
                  >
                    <span className={cn("text-xs", today && "h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs")}>
                      {format(day, "d")}
                    </span>
                    {dayBookings.length > 0 && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
                    {isBlockedDay    && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-red-400" />}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary inline-block" /> Booked</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Blocked</span>
              <span>Double-click a free date to block/unblock</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedDay ? (
            <>
              <h3 className="font-semibold text-sm">{format(selectedDay, "EEEE, d MMMM")}</h3>
              {selectedBookings.length > 0 ? (
                selectedBookings.map((b) => (
                  <Card key={b.id} className="border-border/60 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{CEREMONIES[b.ceremonyType]?.emoji}</span>
                        <span className="font-medium text-sm">{b.ceremonyName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.consumer}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">⏰ {b.time}</p>
                    </CardContent>
                  </Card>
                ))
              ) : blockedEntry(selectedDay) ? (
                <Card className="border-red-200 bg-red-50 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-600 font-medium">Blocked</p>
                    <p className="text-xs text-red-500 mt-1">You are unavailable on this date.</p>
                    <Button size="sm" variant="outline"
                      className="mt-3 h-7 text-xs border-red-200 text-red-600 hover:bg-red-100"
                      onClick={() => toggleBlock(selectedDay)} disabled={toggling}>
                      Unblock
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/60 shadow-none">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">No bookings</p>
                    <Button size="sm" variant="outline" className="mt-3 h-7 text-xs"
                      onClick={() => toggleBlock(selectedDay)} disabled={toggling}>
                      Block this date
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Click a date to see details</p>
          )}
        </div>
      </div>
    </div>
  )
}
