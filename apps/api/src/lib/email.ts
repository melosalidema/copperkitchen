import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';

/**
 * Outbound email via Nodemailer.
 *
 * Every function here is intentionally NON-FATAL: if SMTP is not configured or a
 * send fails, the error is logged and the request continues. Email must never
 * break a booking or a form submission.
 */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const FROM_ADDRESS = process.env.RESTAURANT_EMAIL || 'no-reply@copperkitchen.local';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || '';

const smtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD);

let transporter: Transporter | null = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }
  });
} else {
  console.warn('[email] SMTP is not configured — emails will be skipped (non-fatal).');
}

async function sendMail(options: SendMailOptions): Promise<void> {
  if (!transporter) {
    console.warn('[email] Skipping email (SMTP not configured):', options.subject);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM_ADDRESS, ...options });
    console.log(`[email] Sent "${options.subject}" to ${String(options.to)}`);
  } catch (error) {
    console.error('[email] Failed to send email (non-fatal):', error);
  }
}

const TEXT_FOOTER =
  '\n\nCopper Kitchen, 75 Sheep Street, Bicester, Oxfordshire OX26 6JS\n' +
  'Tel: 01869 240877';

interface ReservationEmailDetails {
  reference: string;
  customerName: string;
  date: string;
  time: string;
  guestCount: number;
  specialRequests?: string | null;
}

export function sendReservationConfirmation(
  to: string,
  details: ReservationEmailDetails,
  cancellationToken: string
): Promise<void> {
  const text =
    `Hello ${details.customerName},\n\n` +
    `Your reservation request at Copper Kitchen has been received.\n\n` +
    `Reference: ${details.reference}\n` +
    `Date: ${details.date}\n` +
    `Time: ${details.time}\n` +
    `Guests: ${details.guestCount}\n` +
    (details.specialRequests ? `Special requests: ${details.specialRequests}\n` : '') +
    `\nTo cancel this reservation, use this link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel?token=${cancellationToken}\n` +
    TEXT_FOOTER;
  return sendMail({
    to,
    subject: 'Copper Kitchen — reservation request received',
    text
  });
}

export function sendReservationCancellation(
  to: string,
  details: ReservationEmailDetails
): Promise<void> {
  const text =
    `Hello ${details.customerName},\n\n` +
    `Your reservation (reference ${details.reference}) for ${details.date} at ${details.time} has been cancelled.\n` +
    TEXT_FOOTER;
  return sendMail({ to, subject: 'Copper Kitchen — reservation cancelled', text });
}

export function sendNewReservationNotification(
  details: ReservationEmailDetails & { phone: string }
): Promise<void> {
  if (!RESTAURANT_EMAIL) {
    console.warn('[email] RESTAURANT_EMAIL not set — skipping new-reservation notification.');
    return Promise.resolve();
  }
  const text =
    `New reservation request received:\n\n` +
    `Reference: ${details.reference}\n` +
    `Name: ${details.customerName}\n` +
    `Phone: ${details.phone}\n` +
    `Date: ${details.date}\n` +
    `Time: ${details.time}\n` +
    `Guests: ${details.guestCount}\n` +
    (details.specialRequests ? `Special requests: ${details.specialRequests}\n` : '');
  return sendMail({
    to: RESTAURANT_EMAIL,
    subject: 'Copper Kitchen — new reservation request',
    text
  });
}

export function sendContactMessageNotification(contact: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  if (!RESTAURANT_EMAIL) {
    console.warn('[email] RESTAURANT_EMAIL not set — skipping contact notification.');
    return Promise.resolve();
  }
  const text =
    `New contact message:\n\n` +
    `Name: ${contact.name}\n` +
    `Email: ${contact.email}\n` +
    `\nMessage:\n${contact.message}`;
  return sendMail({
    to: RESTAURANT_EMAIL,
    subject: 'Copper Kitchen — new contact message',
    text
  });
}

export function sendNewsletterConfirmation(to: string): Promise<void> {
  const text =
    'Thank you for subscribing to the Copper Kitchen newsletter.\n\n' +
    'Please note that Copper Kitchen ceased trading on 26 October 2025.\n' +
    TEXT_FOOTER;
  return sendMail({
    to,
    subject: 'Copper Kitchen — newsletter subscription',
    text
  });
}
