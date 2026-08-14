'use client';

import { useState } from 'react';
import { RESERVATION_STATUSES } from '@copperkitchen/shared';
import type { AdminApi, ReservationDto } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminPanel,
  ErrorNote,
  LoadingNote
} from './admin-ui';
import { formatShortDate, formatTime } from '@/lib/format';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-brand-warning/15 text-brand-warning border-brand-warning/40',
  confirmed: 'bg-brand-success/15 text-brand-success border-brand-success/40',
  rejected: 'bg-brand-error/15 text-brand-error border-brand-error/40',
  cancelled: 'bg-brand-border/40 text-brand-text_secondary border-brand-border',
  completed: 'bg-brand-primary/15 text-brand-primary border-brand-primary/40',
  no_show: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/30'
};

export default function ReservationsTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.reservations(),
    onUnauthorized
  );
  const [updating, setUpdating] = useState<string | null>(null);
  const [savingError, setSavingError] = useState<string | null>(null);

  const changeStatus = async (id: string, status: string) => {
    setUpdating(id);
    setSavingError(null);
    try {
      await admin.updateReservation(id, status);
      await reload();
    } catch (err) {
      if (err instanceof Error && err.name === 'ApiClientError') {
        setSavingError(err.message);
      } else {
        setSavingError('Failed to update reservation.');
      }
    } finally {
      setUpdating(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this reservation?')) return;
    setSavingError(null);
    try {
      await admin.deleteReservation(id);
      await reload();
    } catch {
      setSavingError('Failed to delete reservation.');
    }
  };

  return (
    <AdminPanel
      title="Reservations"
      subtitle={`${data ? data.length : 0} bookings`}
      action={
        <AdminButton variant="secondary" onClick={() => void reload()}>
          Refresh
        </AdminButton>
      }
    >
      {savingError ? <div className="mb-4"><ErrorNote message={savingError} /></div> : null}
      {loading ? (
        <LoadingNote />
      ) : error ? (
        <ErrorNote message={error} onRetry={() => void reload()} />
      ) : !data || data.length === 0 ? (
        <p className="py-6 text-center text-sm text-brand-text_secondary">
          No reservations yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-border text-xs uppercase tracking-wide text-brand-text_secondary">
                <th className="py-2 pr-4">Guest</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Guests</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((reservation: ReservationDto) => (
                <tr
                  key={reservation.id}
                  className="border-b border-brand-border/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-brand-text_primary">
                      {reservation.customerName}
                    </p>
                    <p className="text-xs text-brand-text_secondary">
                      {reservation.phone}
                      {reservation.email ? ` · ${reservation.email}` : ''}
                    </p>
                    {reservation.specialRequests ? (
                      <p className="mt-1 text-xs italic text-brand-text_secondary">
                        “{reservation.specialRequests}”
                      </p>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    {formatShortDate(reservation.reservationDate)}
                  </td>
                  <td className="py-3 pr-4">{formatTime(reservation.reservationTime)}</td>
                  <td className="py-3 pr-4">{reservation.guestCount}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[reservation.status] ?? STATUS_STYLES.pending
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={reservation.status}
                        onChange={(event) =>
                          void changeStatus(reservation.id, event.target.value)
                        }
                        disabled={updating === reservation.id}
                        aria-label={`Change status for ${reservation.customerName}`}
                        className="h-9 rounded-lg border border-brand-border bg-brand-background px-2 text-xs font-medium text-brand-text_primary focus:border-brand-primary focus:outline-none"
                      >
                        {RESERVATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <AdminButton
                        variant="danger"
                        onClick={() => void remove(reservation.id)}
                      >
                        Delete
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
