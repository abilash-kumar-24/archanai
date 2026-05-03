import { Resend } from "resend"
import { env } from "@/lib/env"

function getResend() {
  return new Resend(env.resendApiKey)
}

const FROM = env.fromEmail

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
  return getResend().emails.send({
    from: FROM,
    to:   email,
    subject: `New Booking Request — ${data.ceremonyName} (${data.bookingRef})`,
    html: `
      <p>Namaste ${data.priestName},</p>
      <p>You have a new booking request on Archanai.</p>
      <table cellpadding="6">
        <tr><td><strong>Ref</strong></td><td>${data.bookingRef}</td></tr>
        <tr><td><strong>Ceremony</strong></td><td>${data.ceremonyName}</td></tr>
        <tr><td><strong>Family</strong></td><td>${data.consumerName}</td></tr>
        <tr><td><strong>Date</strong></td><td>${data.date}</td></tr>
        <tr><td><strong>Time</strong></td><td>${data.time}</td></tr>
        <tr><td><strong>Location</strong></td><td>${data.address}</td></tr>
      </table>
      <p>Please log in to your dashboard to accept or decline within 2 hours.</p>
      <p>🙏 Archanai</p>
    `,
  })
}

export async function sendBookingConfirmation(
  email: string,
  data: {
    consumerName: string
    bookingRef:   string
    ceremonyName: string
    priestName:   string
    date:         string
    time:         string
    address:      string
  }
) {
  return getResend().emails.send({
    from: FROM,
    to:   email,
    subject: `Booking Confirmed — ${data.ceremonyName} (${data.bookingRef})`,
    html: `
      <p>Namaste ${data.consumerName},</p>
      <p>Your booking has been confirmed!</p>
      <table cellpadding="6">
        <tr><td><strong>Ref</strong></td><td>${data.bookingRef}</td></tr>
        <tr><td><strong>Ceremony</strong></td><td>${data.ceremonyName}</td></tr>
        <tr><td><strong>Priest</strong></td><td>${data.priestName}</td></tr>
        <tr><td><strong>Date</strong></td><td>${data.date}</td></tr>
        <tr><td><strong>Time</strong></td><td>${data.time}</td></tr>
        <tr><td><strong>Address</strong></td><td>${data.address}</td></tr>
      </table>
      <p>Your priest will reach out before the ceremony. 🙏 Archanai</p>
    `,
  })
}

export async function sendCeremonyReminder(
  email: string,
  data: {
    name:         string
    ceremonyName: string
    date:         string
    time:         string
    address:      string
  }
) {
  return getResend().emails.send({
    from: FROM,
    to:   email,
    subject: `Reminder — ${data.ceremonyName} tomorrow`,
    html: `
      <p>Namaste ${data.name},</p>
      <p>Your <strong>${data.ceremonyName}</strong> is tomorrow!</p>
      <table cellpadding="6">
        <tr><td><strong>Date</strong></td><td>${data.date}</td></tr>
        <tr><td><strong>Time</strong></td><td>${data.time}</td></tr>
        <tr><td><strong>Address</strong></td><td>${data.address}</td></tr>
      </table>
      <p>🙏 Archanai</p>
    `,
  })
}

export async function sendCancellationNotice(
  email: string,
  data: {
    name:         string
    bookingRef:   string
    ceremonyName: string
    reason?:      string
  }
) {
  return getResend().emails.send({
    from: FROM,
    to:   email,
    subject: `Booking Cancelled — ${data.bookingRef}`,
    html: `
      <p>Namaste ${data.name},</p>
      <p>Booking <strong>${data.bookingRef}</strong> for ${data.ceremonyName} has been cancelled.</p>
      ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
      <p>Please visit Archanai to rebook. We apologise for any inconvenience. 🙏</p>
    `,
  })
}
