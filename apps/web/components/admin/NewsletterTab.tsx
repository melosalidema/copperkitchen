'use client';

import type { AdminApi } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminPanel,
  ErrorNote,
  LoadingNote
} from './admin-ui';
import { formatShortDate } from '@/lib/format';

export default function NewsletterTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.newsletterSubscribers(),
    onUnauthorized
  );

  return (
    <AdminPanel
      title="Newsletter subscribers"
      subtitle={`${data ? data.length : 0} subscribers`}
      action={
        <AdminButton variant="secondary" onClick={() => void reload()}>
          Refresh
        </AdminButton>
      }
    >
      {loading ? (
        <LoadingNote />
      ) : error ? (
        <ErrorNote message={error} onRetry={() => void reload()} />
      ) : !data || data.length === 0 ? (
        <p className="py-6 text-center text-sm text-brand-text_secondary">
          No subscribers yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((subscriber) => (
            <li
              key={subscriber.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border px-4 py-3"
            >
              <p className="font-medium text-brand-text_primary">
                {subscriber.email}
              </p>
              <span className="flex items-center gap-3 text-xs text-brand-text_secondary">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 font-semibold ${
                    subscriber.status === 'subscribed'
                      ? 'border-brand-success/40 bg-brand-success/15 text-brand-success'
                      : 'border-brand-border bg-brand-background text-brand-text_secondary'
                  }`}
                >
                  {subscriber.status}
                </span>
                {formatShortDate(subscriber.subscribedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
