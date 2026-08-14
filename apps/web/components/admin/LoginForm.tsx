'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { ErrorNote } from './admin-ui';

const inputBase =
  'peer h-[52px] w-full rounded-[10px] border bg-brand-surface px-4 pb-2 pt-5 text-base text-brand-text placeholder-transparent focus:outline-none';
const inputNormal =
  'border-brand-border focus:border-brand-primary focus:ring-[3px] focus:ring-brand-primary/20';

const labelBase =
  'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-normal text-brand-text_muted transition-all duration-200 peer-focus:top-3.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-brand-primary peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium';

export default function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.adminLogin(email, password);
      onLogin(result.token);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError("Couldn't reach the API. Is the backend running on port 4000?");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4">
      <div className="w-full max-w-md rounded-[12px] border border-brand-border bg-brand-surface p-8 shadow-sm">
        <h1 className="font-heading text-h3 font-semibold text-brand-text">
          Copper Kitchen Admin
        </h1>
        <p className="mt-1 text-sm text-brand-text_muted">
          Sign in to manage reservations, menu, testimonials and more.
        </p>

        {error ? (
          <div className="mt-5">
            <ErrorNote message={error} />
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                required
                className={`${inputBase} ${inputNormal}`}
              />
              <label htmlFor="admin-email" className={labelBase}>
                Email
              </label>
            </div>
          </div>
          <div>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                className={`${inputBase} ${inputNormal}`}
              />
              <label htmlFor="admin-password" className={labelBase}>
                Password
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
