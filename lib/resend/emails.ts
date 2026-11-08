import nodemailer from "nodemailer"
import { Resend } from "resend"
import { env } from "@/lib/env"
import { SITE_URL } from "@/lib/site-url"

const FROM = env.fromEmail
export const RESPONSE_WINDOW_HOURS = 48

/** All user-supplied text goes through this before it enters an HTML email. */
export function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Transport: Brevo SMTP when BREVO_SMTP_USER/KEY are set, otherwise Resend. Neither path throws on a
// rejected send, so both log the failure: a failed email must never fail the booking that triggered it.
async function mail(to: string | string[], subject: string, html: string) {
  if (env.brevoSmtpUser && env.brevoSmtpKey) return sendViaSmtp(to, subject, html, env.brevoSmtpUser, env.brevoSmtpKey)
  if (!env.resendApiKey) return console.error("[email] no email provider configured; dropped:", subject)
  const { error } = await new Resend(env.resendApiKey).emails.send({ from: FROM, to, subject, html })
  if (error) console.error("[email]", subject, error)
}

async function sendViaSmtp(to: string | string[], subject: string, html: string, user: string, pass: string) {
  try {
    await nodemailer
      .createTransport({ host: "smtp-relay.brevo.com", port: 587, auth: { user, pass } })
      .sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    console.error("[email]", subject, err)
  }
}

const row = (k: string, v: unknown) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`
const link = (path: string) => `${SITE_URL}${path}`

export async function sendPriestBookingAlert(
  email: string,
  data: {
    priestName:   string
    bookingRef:   string
    ceremonyName: string
    consumerName: string
    date:         string
    time:         string
    address:      string
  }
) {
  return mail(
    email,
    `New Booking Request — ${data.ceremonyName} (${data.bookingRef})`,
    `<p>Namaste ${esc(data.priestName)},</p>
     <p>You have a new booking request on Archanai.</p>
     <table cellpadding="6">
       ${row("Ref", data.bookingRef)}${row("Ceremony", data.ceremonyName)}${row("Family", data.consumerName)}
       ${row("Date", data.date)}${row("Time", data.time)}${row("Location", data.address)}
     </table>
     <p>Please <a href="${link("/priest/dashboard")}">open your dashboard</a> to accept or decline within ${RESPONSE_WINDOW_HOURS} hours. Requests with no reply are released automatically.</p>
     <p>🙏 Archanai</p>`
  )
}

export async function sendBookingReceived(
  email: string,
  data: { consumerName: string; bookingRef: string; ceremonyName: string; priestName: string; date: string; time: string }
) {
  return mail(
    email,
    `Request sent — ${data.ceremonyName} (${data.bookingRef})`,
    `<p>Namaste ${esc(data.consumerName)},</p>
     <p>We have sent your request to <strong>${esc(data.priestName)}</strong>. They have ${RESPONSE_WINDOW_HOURS} hours to respond; we will email you as soon as they do.</p>
     <table cellpadding="6">${row("Ref", data.bookingRef)}${row("Ceremony", data.ceremonyName)}${row("Date", data.date)}${row("Time", data.time)}</table>
     <p><a href="${link("/bookings")}">View your bookings</a></p>
     <p>🙏 Archanai</p>`
  )
}

export async function sendBookingConfirmation(
  email: string,
  data: {
    consumerName: string
    bookingRef:   string
    ceremonyName: string
    priestName:   string
    priestPhone?: string | null
    date:         string
    time:         string
    address:      string
  }
) {
  return mail(
    email,
    `Booking Confirmed — ${data.ceremonyName} (${data.bookingRef})`,
    `<p>Namaste ${esc(data.consumerName)},</p>
     <p>Your booking has been confirmed!</p>
     <table cellpadding="6">
       ${row("Ref", data.bookingRef)}${row("Ceremony", data.ceremonyName)}${row("Priest", data.priestName)}
       ${data.priestPhone ? row("Priest phone", data.priestPhone) : ""}
       ${row("Date", data.date)}${row("Time", data.time)}${row("Address", data.address)}
     </table>
     <p>Please agree the contribution directly with your priest; Archanai does not collect payment. 🙏 Archanai</p>`
  )
}

export async function sendCeremonyReminder(
  email: string,
  data: { name: string; ceremonyName: string; date: string; time: string; address: string }
) {
  return mail(
    email,
    `Reminder — ${data.ceremonyName} tomorrow`,
    `<p>Namaste ${esc(data.name)},</p>
     <p>Your <strong>${esc(data.ceremonyName)}</strong> is tomorrow!</p>
     <table cellpadding="6">${row("Date", data.date)}${row("Time", data.time)}${row("Address", data.address)}</table>
     <p>🙏 Archanai</p>`
  )
}

export async function sendCancellationNotice(
  email: string,
  data: { name: string; bookingRef: string; ceremonyName: string; reason?: string }
) {
  return mail(
    email,
    `Booking Cancelled — ${data.bookingRef}`,
    `<p>Namaste ${esc(data.name)},</p>
     <p>Booking <strong>${esc(data.bookingRef)}</strong> for ${esc(data.ceremonyName)} has been cancelled.</p>
     ${data.reason ? `<p><strong>Reason:</strong> ${esc(data.reason)}</p>` : ""}
     <p>Please <a href="${link("/browse")}">visit Archanai</a> to rebook. We apologise for any inconvenience. 🙏</p>`
  )
}

export async function sendRescheduleNotice(
  email: string,
  data: { name: string; bookingRef: string; ceremonyName: string; date: string; time: string }
) {
  return mail(
    email,
    `Reschedule request — ${data.bookingRef}`,
    `<p>Namaste ${esc(data.name)},</p>
     <p>The family has asked to move <strong>${esc(data.ceremonyName)}</strong> (${esc(data.bookingRef)}) to <strong>${esc(data.date)} at ${esc(data.time)}</strong>.</p>
     <p>Please <a href="${link("/priest/dashboard")}">accept or decline</a> within ${RESPONSE_WINDOW_HOURS} hours.</p>`
  )
}

export async function sendPriestVerification(email: string, data: { name: string; approved: boolean }) {
  return mail(
    email,
    data.approved ? "You're verified on Archanai" : "Your Archanai application",
    data.approved
      ? `<p>Namaste ${esc(data.name)},</p>
         <p>Your profile is verified and now visible to families. Keep your <a href="${link("/priest/calendar")}">calendar</a> up to date so you only get requests you can take.</p>`
      : `<p>Namaste ${esc(data.name)},</p>
         <p>We could not verify your application yet. Please <a href="${link("/priest/profile")}">update your profile and documents</a> or reply to this email for help.</p>`
  )
}

export async function sendAdminNewPriest(emails: string[], data: { name: string; city: string }) {
  if (!emails.length) return
  return mail(
    emails,
    `New priest application — ${data.name}`,
    `<p>${esc(data.name)} (${esc(data.city)}) applied. <a href="${link("/admin/dashboard")}">Review in the admin dashboard</a>.</p>`
  )
}

export async function sendSamagriChecklist(
  email: string,
  data: { name: string; ceremonyName: string; items: { name: string; quantity: string; notes?: string; isOptional?: boolean }[] }
) {
  const rows = data.items
    .map((i) => `<tr><td>${esc(i.name)}${i.isOptional ? " <em>(optional)</em>" : ""}</td><td>${esc(i.quantity)}</td><td>${esc(i.notes ?? "")}</td></tr>`)
    .join("")
  return mail(
    email,
    `Samagri checklist — ${data.ceremonyName}`,
    `<p>Namaste ${esc(data.name)},</p>
     <p>Here is your checklist for <strong>${esc(data.ceremonyName)}</strong>. Your priest may adjust it for your family's tradition.</p>
     <table cellpadding="6" border="1" style="border-collapse:collapse"><tr><th>Item</th><th>Quantity</th><th>Notes</th></tr>${rows}</table>`
  )
}

export async function sendNewMessage(email: string, data: { name: string; from: string; bookingRef: string; path: string }) {
  return mail(
    email,
    `New message — ${data.bookingRef}`,
    `<p>Namaste ${esc(data.name)},</p>
     <p>${esc(data.from)} sent you a message about booking <strong>${esc(data.bookingRef)}</strong>.</p>
     <p><a href="${link(data.path)}">Read and reply</a></p>`
  )
}
