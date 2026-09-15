'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { reservationSchema, type ReservationInput } from '@copperkitchen/shared';
import { api, ApiClientError } from '@/lib/api';
import { useSettings, useAvailability } from '@/lib/hooks';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

/** Candidate time slots shown when online booking is enabled. */
const TIME_SLOTS = [
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00'
] as const;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const SLOT_UNAVAILABLE_MESSAGE =
  'That time is not available. Please choose another time, or call 01869 240877.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please try again, or call 01869 240877.';

/** Floating-label input classes (52px, 10px radius, white bg). */
const inputBase =
  'peer h-[52px] w-full rounded-[10px] border bg-brand-surface px-4 pb-2 pt-5 text-base text-brand-text placeholder-transparent focus:outline-none';
const inputNormal =
  'border-brand-border focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20';
const inputError =
  'border-brand-error focus:border-brand-error focus:ring-[3px] focus:ring-brand-error/15';

const labelBase =
  'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium';

/** Static label for select/date fields. */
const staticLabel =
  'mb-1.5 block text-sm font-semibold text-brand-text';

/** Shared select/date field styling. */
const fieldClass =
  'h-[52px] w-full rounded-[10px] border border-brand-border bg-brand-surface px-4 text-base text-brand-text focus:border-brand-primary focus:outline-none focus:ring-[3px] focus:ring-brand-primary/20';

function settingsFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export default function Reservation() {
  const { data: settings } = useSettings();
  const reservationsEnabled = settingsFlag(settings?.reservations_enabled);
  const permanentlyClosed = settingsFlag(settings?.permanently_closed);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ReservationInput, string>>
  >({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [reference, setReference] = useState('');

  const { data: availability } = useAvailability(date, guestCount);
  const slotsAvailable = availability ? availability.available : true;
  const availabilityLoading = Boolean(date && !availability);

  const today = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setFieldErrors({});

    const result = reservationSchema.safeParse({
      customer_name: customerName,
      phone,
      email: email || undefined,
      reservation_date: date,
      reservation_time: time,
      guest_count: guestCount,
      special_requests: specialRequests || undefined
    });

    if (!result.success) {
      const errors: Partial<Record<keyof ReservationInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ReservationInput;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setStatus('idle');
      return;
    }

    if (!slotsAvailable) {
      setStatus('error');
      return;
    }

    try {
      const booking = await api.createReservation(result.data);
      setReference(booking.reference);
      setStatus('success');
    } catch (err) {
      console.error('Reservation error:', err);
      setStatus('error');
    }
  };

  // -------------------------------------------------------------------------
  // Closed state: reservations disabled or the restaurant is permanently
  // closed — this site now stands as a tribute.
  // -------------------------------------------------------------------------
  if (!reservationsEnabled || permanentlyClosed) {
    return (
      <section
        id="reservation"
        className="scroll-mt-24 bg-brand-surface py-16 md:py-24 lg:py-[120px]"
      >
        <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
          <ScrollReveal>
            <SectionHeading eyebrow="Reservations" title="Book a table" />
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className="mx-auto mt-12 max-w-xl rounded-[12px] border border-brand-border bg-brand-background p-8 text-center sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-primary"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h3 className="mt-6 font-heading text-2xl font-semibold text-brand-text">
                We are closed
              </h3>
              <p className="mt-4 text-base leading-relaxed text-brand-text_muted">
                Copper Kitchen permanently closed on 26 October 2025. Online
                booking is no longer available — this website stands as a
                tribute to the restaurant and the meals shared at 75 Sheep
                Street.
              </p>
              <p className="mt-6 text-sm text-brand-text_muted">
                Booking enquiries:{' '}
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="font-semibold text-brand-primary underline decoration-brand-accent underline-offset-2 hover:text-brand-primary_hover"
                >
                  {PHONE_DISPLAY}
                </a>
              </p>
              <a href="#story" className="btn-secondary mt-8">
                Discover our legacy
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Open state: online reservation form with availability check.
  // -------------------------------------------------------------------------
  return (
    <section
      id="reservation"
      className="scroll-mt-24 bg-brand-surface py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Reservations"
            title="Book a table"
            description="Choose a date and party size — available times update automatically."
          />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <form
            onSubmit={onSubmit}
            noValidate
            className="mx-auto mt-12 max-w-2xl rounded-[12px] border border-brand-border bg-brand-surface p-8 sm:p-10"
          >
            {status === 'success' ? (
              <div
                role="status"
                className="rounded-[10px] border border-brand-success/30 bg-brand-success/10 p-6 text-center"
              >
                <p className="text-lg font-semibold text-brand-success">
                  Booking requested!
                </p>
                <p className="mt-2 text-sm text-brand-text_muted">
                  Your booking reference is{' '}
                  <span className="font-bold text-brand-text">
                    {reference}
                  </span>
                  . We&apos;ll confirm by phone or email shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {status === 'error' ? (
                  <div
                    role="alert"
                    className="rounded-[10px] border border-brand-error/30 bg-brand-error/10 p-4 text-sm font-medium text-brand-error"
                  >
                    {slotsAvailable
                      ? GENERIC_ERROR_MESSAGE
                      : SLOT_UNAVAILABLE_MESSAGE}
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <input
                        id="res-name"
                        type="text"
                        autoComplete="name"
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="Name"
                        aria-invalid={Boolean(fieldErrors.customer_name)}
                        aria-describedby={
                          fieldErrors.customer_name ? 'res-name-error' : undefined
                        }
                        className={`${inputBase} ${
                          fieldErrors.customer_name ? inputError : inputNormal
                        }`}
                      />
                      <label htmlFor="res-name" className={labelBase}>
                        Name
                      </label>
                    </div>
                    {fieldErrors.customer_name ? (
                      <p id="res-name-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.customer_name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        id="res-phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Phone"
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={
                          fieldErrors.phone ? 'res-phone-error' : undefined
                        }
                        className={`${inputBase} ${
                          fieldErrors.phone ? inputError : inputNormal
                        }`}
                      />
                      <label htmlFor="res-phone" className={labelBase}>
                        Phone
                      </label>
                    </div>
                    {fieldErrors.phone ? (
                      <p id="res-phone-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.phone}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        id="res-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={
                          fieldErrors.email ? 'res-email-error' : undefined
                        }
                        className={`${inputBase} ${
                          fieldErrors.email ? inputError : inputNormal
                        }`}
                      />
                      <label
                        htmlFor="res-email"
                        className={`${labelBase} after:ml-1 after:content-['(optional)'] after:text-xs after:font-normal after:text-brand-text_muted`}
                      >
                        Email
                      </label>
                    </div>
                    {fieldErrors.email ? (
                      <p id="res-email-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="res-date" className={staticLabel}>
                      Date
                    </label>
                    <input
                      id="res-date"
                      type="date"
                      min={today}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      aria-invalid={Boolean(fieldErrors.reservation_date)}
                      aria-describedby={
                        fieldErrors.reservation_date
                          ? 'res-date-error'
                          : undefined
                      }
                      className={fieldClass}
                    />
                    {fieldErrors.reservation_date ? (
                      <p id="res-date-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.reservation_date}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="res-guests" className={staticLabel}>
                      Guests
                    </label>
                    <select
                      id="res-guests"
                      value={guestCount}
                      onChange={(event) => setGuestCount(Number(event.target.value))}
                      aria-invalid={Boolean(fieldErrors.guest_count)}
                      className={fieldClass}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.guest_count ? (
                      <p id="res-guests-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.guest_count}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="res-time" className={staticLabel}>
                      Time
                    </label>
                    <select
                      id="res-time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      disabled={Boolean(date) && !slotsAvailable}
                      aria-invalid={Boolean(fieldErrors.reservation_time)}
                      aria-describedby="res-time-hint"
                      className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <option value="">Select a time</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <p id="res-time-hint" className="mt-1.5 text-sm text-brand-text_muted">
                      {date
                        ? availabilityLoading
                          ? 'Checking availability…'
                          : slotsAvailable
                            ? 'Times shown are indicative — subject to availability.'
                            : 'No availability on this date for your party size.'
                        : 'Choose a date first.'}
                    </p>
                    {fieldErrors.reservation_time ? (
                      <p id="res-time-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.reservation_time}
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <div className="relative">
                      <textarea
                        id="res-requests"
                        rows={3}
                        value={specialRequests}
                        onChange={(event) => setSpecialRequests(event.target.value)}
                        placeholder="Special requests"
                        className="peer w-full rounded-[10px] border border-brand-border bg-brand-surface px-4 pb-3 pt-6 text-base text-brand-text placeholder-transparent focus:border-brand-primary focus:outline-none focus:ring-[3px] focus:ring-brand-primary/20"
                      />
                      <label
                        htmlFor="res-requests"
                        className="pointer-events-none absolute left-4 top-3 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
                      >
                        Special requests{' '}
                        <span className="text-xs font-normal text-brand-text_muted">
                          (optional)
                        </span>
                      </label>
                    </div>
                    {fieldErrors.special_requests ? (
                      <p className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.special_requests}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary w-full sm:w-auto"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Requesting…
                    </>
                  ) : (
                    'Request booking'
                  )}
                </button>
                <p className="text-xs text-brand-text_muted">
                  Prefer to book by phone? Call{' '}
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="font-semibold text-brand-primary hover:text-brand-primary_hover"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  .
                </p>
              </div>
            )}
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
