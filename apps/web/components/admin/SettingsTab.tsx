'use client';

import { useEffect, useState } from 'react';
import type { AdminApi, SettingsDto } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminInput,
  AdminPanel,
  AdminTextarea,
  ErrorNote,
  LoadingNote,
  SuccessNote
} from './admin-ui';

interface SettingRow {
  key: string;
  raw: string;
}

function serializeSettings(settings: SettingsDto): SettingRow[] {
  return Object.entries(settings).map(([key, value]) => ({
    key,
    raw: JSON.stringify(value, null, 2)
  }));
}

export default function SettingsTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.settings(),
    onUnauthorized
  );

  const [rows, setRows] = useState<SettingRow[] | null>(null);
  const [newKey, setNewKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setRows(serializeSettings(data));
  }, [data]);

  const updateRaw = (index: number, raw: string) => {
    setRows((current) =>
      current ? current.map((row, i) => (i === index ? { ...row, raw } : row)) : current
    );
    setSaved(false);
  };

  const addKey = () => {
    const key = newKey.trim();
    if (!key || !rows) return;
    if (rows.some((row) => row.key === key)) return;
    setRows([...rows, { key, raw: '""' }]);
    setNewKey('');
  };

  const removeKey = (index: number) => {
    setRows((current) => (current ? current.filter((_, i) => i !== index) : current));
    setSaved(false);
  };

  const save = async () => {
    if (!rows) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const payload: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        payload[row.key] = JSON.parse(row.raw);
      } catch {
        setSaveError(`"${row.key}" is not valid JSON.`);
        setSaving(false);
        return;
      }
    }

    try {
      const next = await admin.updateSettings(payload);
      setRows(serializeSettings(next));
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanel
      title="Settings"
      subtitle="Key/value restaurant settings (JSON values)"
      action={
        <AdminButton variant="secondary" onClick={() => void reload()}>
          Reset
        </AdminButton>
      }
    >
      {saved ? (
        <div className="mb-4">
          <SuccessNote message="Settings saved." />
        </div>
      ) : null}
      {saveError ? (
        <div className="mb-4">
          <ErrorNote message={saveError} />
        </div>
      ) : null}
      {loading ? (
        <LoadingNote />
      ) : error ? (
        <ErrorNote message={error} onRetry={() => void reload()} />
      ) : !rows ? (
        <p className="py-6 text-center text-sm text-brand-text_secondary">
          No settings.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={row.key} className="rounded-lg border border-brand-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm font-semibold text-brand-text_primary">
                    {row.key}
                  </p>
                  <AdminButton
                    variant="danger"
                    onClick={() => removeKey(index)}
                  >
                    Remove
                  </AdminButton>
                </div>
                <AdminTextarea
                  rows={2}
                  value={row.raw}
                  onChange={(event) => updateRaw(index, event.target.value)}
                  aria-label={`Value for ${row.key}`}
                  className="mt-2 font-mono text-xs"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="settings-new-key" className="mb-1 block text-xs font-semibold text-brand-text_secondary">
                New key
              </label>
              <AdminInput
                id="settings-new-key"
                value={newKey}
                onChange={(event) => setNewKey(event.target.value)}
                placeholder="setting_name"
              />
            </div>
            <AdminButton variant="secondary" onClick={addKey}>
              Add key
            </AdminButton>
            <AdminButton variant="primary" onClick={() => void save()} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </AdminButton>
          </div>
        </>
      )}
    </AdminPanel>
  );
}
