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

export default function ContactTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.contactMessages(),
    onUnauthorized
  );

  return (
    <AdminPanel
      title="Contact messages"
      subtitle={`${data ? data.length : 0} messages`}
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
          No contact messages.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((message) => (
            <li
              key={message.id}
              className="rounded-lg border border-brand-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-brand-text_primary">
                  {message.name}
                  <span className="ml-2 text-xs font-normal text-brand-text_secondary">
                    {message.email}
                  </span>
                </p>
                <span className="text-xs text-brand-text_secondary">
                  {formatShortDate(message.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-brand-text_primary">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
