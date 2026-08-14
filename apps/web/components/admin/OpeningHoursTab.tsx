'use client';

import { useEffect, useState } from 'react';
import type { AdminApi, OpeningHourDto } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import { DAY_NAMES } from '@/lib/fallback';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminPanel,
  ErrorNote,
  LoadingNote,
  SuccessNote
} from './admin-ui';

export default function OpeningHoursTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.openingHours(),
    onUnauthorized
  );

  const [rows, setRows] = useState<OpeningHourDto[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const updateRow = (id: string, patch: Partial<OpeningHourDto>) => {
    setRows((current) =>
      current ? current.map((row) => (row.id === id ? { ...row, ...patch } : row)) : current
    );
    setSaved(false);
  };

  const save = async () => {
    if (!rows) return;
    setSaving(true);
    setSaved(false);
    try {
      const next = await admin.updateOpeningHours(
        rows.map((row) => ({
          dayOfWeek: row.dayOfWeek,
          slotType: row.slotType,
          openTime: row.isClosed ? null : row.openTime,
          closeTime: row.isClosed ? null : row.closeTime,
          isClosed: row.isClosed,
          source: 'manual'
        }))
      );
      setRows(next);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanel
      title="Opening hours"
      subtitle="Replaces all opening-hour rows when saved"
      action={
        <AdminButton variant="secondary" onClick={() => void reload()}>
          Reset
        </AdminButton>
      }
    >
      {saved ? (
        <div className="mb-4">
          <SuccessNote message="Opening hours saved." />
        </div>
      ) : null}
      {loading ? (
        <LoadingNote />
      ) : error ? (
        <ErrorNote message={error} onRetry={() => void reload()} />
      ) : !rows ? (
        <p className="py-6 text-center text-sm text-brand-text_secondary">
          No opening hours.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-brand-border p-3"
              >
                <p className="w-32 font-semibold text-brand-text_primary">
                  {DAY_NAMES[row.dayOfWeek] ?? `Day ${row.dayOfWeek}`}
                  <span className="ml-1 text-xs font-normal text-brand-text_secondary">
                    ({row.slotType})
                  </span>
                </p>
                <AdminCheckbox
                  label="Closed"
                  checked={row.isClosed}
                  onChange={(next) => updateRow(row.id, { isClosed: next })}
                />
                <div className="flex items-center gap-2">
                  <AdminInput
                    type="time"
                    value={row.openTime ?? ''}
                    onChange={(event) =>
                      updateRow(row.id, { openTime: event.target.value || null })
                    }
                    disabled={row.isClosed}
                    aria-label={`${DAY_NAMES[row.dayOfWeek]} open time`}
                  />
                  <span className="text-sm text-brand-text_secondary">–</span>
                  <AdminInput
                    type="time"
                    value={row.closeTime ?? ''}
                    onChange={(event) =>
                      updateRow(row.id, { closeTime: event.target.value || null })
                    }
                    disabled={row.isClosed}
                    aria-label={`${DAY_NAMES[row.dayOfWeek]} close time`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <AdminButton variant="primary" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save hours'}
            </AdminButton>
          </div>
        </>
      )}
    </AdminPanel>
  );
}
