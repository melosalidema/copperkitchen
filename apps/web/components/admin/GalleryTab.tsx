'use client';

import { useState, type FormEvent } from 'react';
import type { AdminApi } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminInput,
  AdminPanel,
  ErrorNote,
  Field,
  LoadingNote
} from './admin-ui';

export default function GalleryTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const { data, loading, error, reload } = useAdminResource(
    () => admin.gallery(),
    onUnauthorized
  );

  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await admin.createGalleryImage({
        url,
        altText,
        caption: caption || null
      });
      setUrl('');
      setAltText('');
      setCaption('');
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add image.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await admin.deleteGalleryImage(id);
      await reload();
    } catch {
      // Ignore.
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel title="Add image" subtitle="Images appear on the public gallery">
        <form onSubmit={onSubmit} className="space-y-4">
          {formError ? <ErrorNote message={formError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Image URL" htmlFor="gallery-url">
                <AdminInput
                  id="gallery-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                  placeholder="https://…"
                />
              </Field>
            </div>
            <Field label="Alt text" htmlFor="gallery-alt">
              <AdminInput
                id="gallery-alt"
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                required
              />
            </Field>
            <Field label="Caption (optional)" htmlFor="gallery-caption">
              <AdminInput
                id="gallery-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
              />
            </Field>
          </div>
          <AdminButton type="submit" variant="primary" disabled={saving}>
            {saving ? 'Adding…' : 'Add image'}
          </AdminButton>
        </form>
      </AdminPanel>

      <AdminPanel title="Gallery" subtitle={`${data ? data.length : 0} images`}>
        {loading ? (
          <LoadingNote />
        ) : error ? (
          <ErrorNote message={error} onRetry={() => void reload()} />
        ) : !data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-brand-text_secondary">
            No images yet. Add one above.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((image) => (
              <li
                key={image.id}
                className="overflow-hidden rounded-lg border border-brand-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText}
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-brand-text_primary">
                    {image.altText}
                  </p>
                  {image.caption ? (
                    <p className="truncate text-xs text-brand-text_secondary">
                      {image.caption}
                    </p>
                  ) : null}
                  <AdminButton
                    variant="danger"
                    className="mt-2"
                    onClick={() => void remove(image.id)}
                  >
                    Remove
                  </AdminButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
