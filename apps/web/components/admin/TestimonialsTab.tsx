'use client';

import type { AdminApi } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminCheckbox,
  AdminPanel,
  ErrorNote,
  LoadingNote
} from './admin-ui';
import { formatShortDate } from '@/lib/format';

export default function TestimonialsTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.testimonials(),
    onUnauthorized
  );

  const toggleApproved = async (id: string, isApproved: boolean) => {
    try {
      await admin.updateTestimonial(id, { isApproved: !isApproved });
      await reload();
    } catch {
      // Keep it simple; data will refresh on next successful action.
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await admin.deleteTestimonial(id);
      await reload();
    } catch {
      // Ignore.
    }
  };

  return (
    <AdminPanel
      title="Testimonials"
      subtitle={`${data ? data.length : 0} reviews`}
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
          No testimonials.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map((testimonial) => (
            <li
              key={testimonial.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-brand-border p-4"
            >
              <div className="min-w-0 max-w-2xl">
                <p className="text-sm font-semibold text-brand-text_primary">
                  {testimonial.reviewerName}
                  <span className="ml-2 text-xs font-normal text-brand-text_secondary">
                    {testimonial.source ?? 'Tripadvisor'}
                    {testimonial.rating ? ` · ${testimonial.rating}/5` : ''}
                    {testimonial.reviewDate
                      ? ` · ${formatShortDate(testimonial.reviewDate)}`
                      : ''}
                  </span>
                </p>
                <p className="mt-1 text-sm text-brand-text_secondary">
                  {testimonial.text}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <AdminCheckbox
                  label="Approved"
                  checked={testimonial.isApproved}
                  onChange={(next) => void toggleApproved(testimonial.id, next)}
                />
                <AdminButton
                  variant="danger"
                  onClick={() => void remove(testimonial.id)}
                >
                  Delete
                </AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
