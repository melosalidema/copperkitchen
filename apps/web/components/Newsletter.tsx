'use client';

import { useState, type FormEvent } from 'react';
import { newsletterSchema } from '@copperkitchen/shared';
import { api } from '@/lib/api';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Newsletter signup (used in the footer).
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>('idle');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setError(null);

    const result = newsletterSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please enter a valid email address.');
      setStatus('idle');
      return;
    }

    try {
      await api.subscribeNewsletter(result.data.email);
      setEmail('');
      setStatus('success');
    } catch (err) {
      console.error('Newsletter error:', err);
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        className="rounded-[10px] border border-brand-success/40 bg-brand-success/15 px-4 py-3 text-sm font-medium text-brand-text_on_dark"
      >
        Thank you — you&apos;ve been subscribed to our newsletter.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-text_on_dark">
        Newsletter
      </h3>
      <p className="mb-3 mt-1 text-sm text-brand-text_on_dark/60">
        Occasional news from the kitchen. No spam.
      </p>
      <div className="relative">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className="peer h-[52px] w-full rounded-[10px] border border-brand-border bg-brand-surface px-4 pb-2 pt-5 text-base text-brand-text placeholder-transparent focus:border-brand-primary focus:outline-none focus:ring-[3px] focus:ring-brand-primary/25"
        />
        <label
          htmlFor="newsletter-email"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
        >
          Email address
        </label>
      </div>
      {error ? (
        <p id="newsletter-error" role="alert" className="mt-2 text-sm text-brand-warning">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary mt-3 w-full"
      >
        {status === 'submitting' ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Subscribing…
          </>
        ) : (
          'Subscribe'
        )}
      </button>
    </form>
  );
}
