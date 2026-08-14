'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdminApi, MenuCategoryDto, MenuItemDto } from '@/lib/api';
import { useAdminResource } from './use-admin-resource';
import {
  AdminButton,
  AdminCheckbox,
  AdminInput,
  AdminPanel,
  AdminSelect,
  AdminTextarea,
  ErrorNote,
  Field,
  LoadingNote
} from './admin-ui';

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function MenuTab({
  admin,
  onUnauthorized
}: {
  admin: AdminApi;
  onUnauthorized: () => void;
}) {
  const categoriesState = useAdminResource(
    () => admin.menuCategories(),
    onUnauthorized
  );
  const itemsState = useAdminResource(() => admin.menuItems(), onUnauthorized);

  const reloadAll = async () => {
    await Promise.all([categoriesState.reload(), itemsState.reload()]);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [dietaryTags, setDietaryTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');

  const categories = categoriesState.data ?? [];
  const items = itemsState.data ?? [];

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItemDto[]>();
    for (const category of categories) {
      map.set(
        category.id,
        items
          .filter((item) => item.categoryId === category.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      );
    }
    return map;
  }, [categories, items]);

  const startEdit = (item: MenuItemDto) => {
    setEditingId(item.id);
    setName(item.name);
    setCategoryId(item.categoryId);
    setPrice(item.priceGbp !== null ? String(item.priceGbp) : '');
    setDietaryTags(item.dietaryTags.join(', '));
    setIsFeatured(item.isFeatured);
    setIsAvailable(item.isAvailable);
    setFormError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategoryId(categories[0]?.id ?? '');
    setPrice('');
    setDietaryTags('');
    setIsFeatured(false);
    setIsAvailable(true);
    setFormError(null);
  };

  const onSubmitItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload = {
      name,
      categoryId,
      priceGbp: parsePrice(price),
      dietaryTags: dietaryTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isFeatured,
      isAvailable
    };
    try {
      if (editingId) {
        await admin.updateMenuItem(editingId, payload);
      } else {
        await admin.createMenuItem(payload);
      }
      resetForm();
      await itemsState.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save menu item.');
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item: MenuItemDto) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await admin.deleteMenuItem(item.id);
      if (editingId === item.id) resetForm();
      await itemsState.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete item.');
    }
  };

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    try {
      await admin.createCategory({
        name: newCategoryName,
        slug: newCategorySlug
      });
      setNewCategoryName('');
      setNewCategorySlug('');
      await categoriesState.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add category.');
    }
  };

  const removeCategory = async (category: MenuCategoryDto) => {
    if (!window.confirm(`Delete category "${category.name}" and its items?`)) return;
    try {
      await admin.deleteCategory(category.id);
      await reloadAll();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel
        title={editingId ? 'Edit menu item' : 'Add menu item'}
        action={
          editingId ? (
            <AdminButton variant="secondary" onClick={resetForm}>
              Cancel edit
            </AdminButton>
          ) : undefined
        }
      >
        <form onSubmit={onSubmitItem} className="space-y-4">
          {formError ? <ErrorNote message={formError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Item name" htmlFor="menu-item-name">
                <AdminInput
                  id="menu-item-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </Field>
            </div>
            <Field label="Category" htmlFor="menu-item-category">
              <AdminSelect
                id="menu-item-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                {categories.length === 0 ? (
                  <option value="">No categories — add one below</option>
                ) : null}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </AdminSelect>
            </Field>
            <Field label="Price (GBP, optional)" htmlFor="menu-item-price">
              <AdminInput
                id="menu-item-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Leave blank for price on request"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Dietary tags (comma separated)" htmlFor="menu-item-tags">
                <AdminInput
                  id="menu-item-tags"
                  value={dietaryTags}
                  onChange={(event) => setDietaryTags(event.target.value)}
                  placeholder="e.g. V, Ve, GF"
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6">
              <AdminCheckbox
                label="Featured"
                checked={isFeatured}
                onChange={setIsFeatured}
              />
              <AdminCheckbox
                label="Available"
                checked={isAvailable}
                onChange={setIsAvailable}
              />
            </div>
          </div>
          <AdminButton type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add item'}
          </AdminButton>
        </form>
      </AdminPanel>

      <AdminPanel title="Categories" subtitle="Menu groups shown on the site">
        <form onSubmit={addCategory} className="mb-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <AdminInput
            placeholder="Category name"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            required
            aria-label="New category name"
          />
          <AdminInput
            placeholder="slug (e.g. mains)"
            value={newCategorySlug}
            onChange={(event) => setNewCategorySlug(event.target.value)}
            required
            aria-label="New category slug"
          />
          <AdminButton type="submit" variant="primary">
            Add category
          </AdminButton>
        </form>
        {categoriesState.loading ? (
          <LoadingNote />
        ) : categoriesState.error ? (
          <ErrorNote
            message={categoriesState.error}
            onRetry={() => void categoriesState.reload()}
          />
        ) : categories.length === 0 ? (
          <p className="text-sm text-brand-text_secondary">No categories.</p>
        ) : (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.id} className="rounded-lg border border-brand-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-brand-text_primary">
                    {category.name}{' '}
                    <span className="text-xs font-normal text-brand-text_secondary">
                      ({itemsByCategory.get(category.id)?.length ?? 0} items)
                    </span>
                  </p>
                  <AdminButton
                    variant="danger"
                    onClick={() => void removeCategory(category)}
                  >
                    Delete
                  </AdminButton>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {(itemsByCategory.get(category.id) ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border border-brand-border/60 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 text-brand-text_primary">
                        {item.name}
                        {item.dietaryTags.length > 0
                          ? ` (${item.dietaryTags.join(', ')})`
                          : ''}
                        {item.priceGbp !== null
                          ? ` — £${item.priceGbp}`
                          : ' — price on request'}
                        {item.isFeatured ? ' ★' : ''}
                      </span>
                      <span className="flex shrink-0 gap-2">
                        <AdminButton variant="secondary" onClick={() => startEdit(item)}>
                          Edit
                        </AdminButton>
                        <AdminButton variant="danger" onClick={() => void removeItem(item)}>
                          Delete
                        </AdminButton>
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
