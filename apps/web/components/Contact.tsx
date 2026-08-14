'use client';

import { useState, type FormEvent } from 'react';
import { contactSchema, type ContactInput } from '@copperkitchen/shared';
import { api, ApiClientError } from '@/lib/api';
import {
  ADDRESS_LINES,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  PHONE_TEL
} from '@/lib/fallback';
import SectionHeading from './SectionHeading';
import ScrollReveal from './ScrollReveal';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const CONTACT_ERROR_MESSAGE =
  "Your message couldn't be sent. Please call 01869 240877.";

/** Floating-label input classes (52px, 10px radius, white bg). */
const inputBase =
  'peer h-[52px] w-full rounded-[10px] border bg-brand-surface px-4 pb-2 pt-5 text-base text-brand-text placeholder-transparent focus:outline-none';
const inputNormal =
  'border-brand-border focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20';
const inputError =
  'border-brand-error focus:border-brand-error focus:ring-[3px] focus:ring-brand-error/15';

const labelBase =
  'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactInput, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  const reset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setFieldErrors({});
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setFieldErrors({});

    // Honeypot: if filled, silently pretend success.
    if (website.trim().length > 0) {
      reset();
      setStatus('success');
      return;
    }

    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const errors: Partial<Record<keyof ContactInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ContactInput;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setStatus('idle');
      return;
    }

    try {
      await api.sendContact(result.data);
      reset();
      setStatus('success');
    } catch (err) {
      console.error('Contact form error:', err);
      if (err instanceof ApiClientError && err.status === 403) {
        // Not expected for contact; fall through to generic message.
      }
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-brand-background py-16 md:py-24 lg:py-[120px]"
    >
      <div className="mx-auto max-w-content px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description="No verified email address exists for Copper Kitchen — please call us or use the form below."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          <ScrollReveal delay={100} className="lg:col-span-2">
            <div className="card flex h-full flex-col">
              <h3 className="font-heading text-h3 font-semibold text-brand-text">
                Contact details
              </h3>

              <dl className="mt-6 space-y-6">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-text_muted">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${PHONE_TEL}`}
                      className="inline-flex min-h-11 items-center text-lg font-semibold text-brand-primary transition-colors hover:text-brand-primary_hover"
                    >
                      {PHONE_DISPLAY}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-text_muted">
                    Address
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-brand-text">
                    {ADDRESS_LINES.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-text_muted">
                    Follow
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-3">
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-border px-4 text-sm font-semibold text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H16.4V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.4v7h3.3z" />
                      </svg>
                      Facebook
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-border px-4 text-sm font-semibold text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                      </svg>
                      Instagram
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="lg:col-span-3">
            <form
              onSubmit={onSubmit}
              noValidate
              className="card"
            >
              <h3 className="font-heading text-h3 font-semibold text-brand-text">
                Send us a message
              </h3>

              {status === 'success' ? (
                <div
                  role="status"
                  className="mt-6 rounded-[10px] border border-brand-success/30 bg-brand-success/10 p-5 text-sm font-medium text-brand-success"
                >
                  Thank you — your message has been sent. We&apos;ll be in touch
                  as soon as possible.
                </div>
              ) : status === 'error' ? (
                <div
                  role="alert"
                  className="mt-6 rounded-[10px] border border-brand-error/30 bg-brand-error/10 p-5 text-sm font-medium text-brand-error"
                >
                  {CONTACT_ERROR_MESSAGE}
                </div>
              ) : null}

              {status !== 'success' ? (
                <div className="mt-6 space-y-5">
                  {/* Honeypot — hidden from users and screen readers */}
                  <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                    <label htmlFor="website">
                      Leave this field empty
                      <input
                        id="website"
                        name="website"
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                      />
                    </label>
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Name"
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={
                          fieldErrors.name ? 'contact-name-error' : undefined
                        }
                        className={`${inputBase} ${
                          fieldErrors.name ? inputError : inputNormal
                        }`}
                      />
                      <label htmlFor="contact-name" className={labelBase}>
                        Name
                      </label>
                    </div>
                    {fieldErrors.name ? (
                      <p id="contact-name-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={
                          fieldErrors.email ? 'contact-email-error' : undefined
                        }
                        className={`${inputBase} ${
                          fieldErrors.email ? inputError : inputNormal
                        }`}
                      />
                      <label htmlFor="contact-email" className={labelBase}>
                        Email
                      </label>
                    </div>
                    {fieldErrors.email ? (
                      <p id="contact-email-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="relative">
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Message"
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={
                          fieldErrors.message ? 'contact-message-error' : undefined
                        }
                        className={`peer w-full rounded-[10px] border bg-brand-surface px-4 pb-3 pt-6 text-base text-brand-text placeholder-transparent focus:outline-none ${
                          fieldErrors.message ? inputError : inputNormal
                        }`}
                      />
                      <label
                        htmlFor="contact-message"
                        className="pointer-events-none absolute left-4 top-3 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
                      >
                        Message
                      </label>
                    </div>
                    {fieldErrors.message ? (
                      <p id="contact-message-error" className="mt-1.5 text-sm text-brand-error">
                        {fieldErrors.message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {status === 'submitting' ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      'Send message'
                    )}
                  </button>
                </div>
              ) : null}
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
