import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, fieldClass } from '@/components/ui/Field';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { slugify } from '@/lib/format';
import { deleteCategory, getAdminCategories, saveCategory } from '@/services/projects';
import type { Category } from '@/types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      setCategories(await getAdminCategories());
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    setEditing(null);
    setName('');
    setSlug('');
    setErrors({});
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters.';
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) next.slug = 'Use lowercase letters, numbers, and hyphens.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const result = await saveCategory(editing?._id || null, { name: name.trim(), slug: slug.trim() || undefined });
      notify('success', result.message);
      reset();
      await load();
    } catch (error) {
      const fieldErrors = getFieldErrors(error) || [];
      const mapped: typeof errors = {};
      fieldErrors.forEach((issue) => {
        if (issue.field === 'name' || issue.field === 'slug') mapped[issue.field] = issue.message;
      });
      setErrors(mapped);
      notify('error', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await deleteCategory(pendingDelete._id);
      notify('success', result.message);
      setPendingDelete(null);
      if (editing?._id === pendingDelete._id) reset();
      await load();
    } catch (error) {
      notify('error', getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <Seo title="Categories — Trainonex studio" noIndex />
      <p className="text-xs uppercase tracking-[0.2em] text-stone">Organisation</p>
      <h1 className="mt-2 font-serif text-5xl">Categories</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-3xl border border-line bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label={editing ? 'Rename category' : 'New category'} htmlFor="category-name" error={errors.name}>
          <input
            id="category-name"
            className={fieldClass(Boolean(errors.name))}
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);
              if (!editing) setSlug(slugify(value));
            }}
          />
        </Field>
        <Field label="Slug" htmlFor="category-slug" error={errors.slug}>
          <input id="category-slug" className={fieldClass(Boolean(errors.slug))} value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} onBlur={() => setSlug((current) => slugify(current))} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" loading={submitting}>
            {editing ? 'Save' : 'Add'}
          </Button>
          {editing && (
            <Button type="button" variant="ghost" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-white">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading categories…</p>
        ) : categories.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {categories.map((category) => (
              <li key={category._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-stone">
                    /{category.slug} · {category.projectCount || 0} projects
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-line px-3 py-1.5 text-sm"
                    onClick={() => {
                      setEditing(category);
                      setName(category.name);
                      setSlug(category.slug);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-danger disabled:opacity-40"
                    disabled={(category.projectCount || 0) > 0}
                    title={(category.projectCount || 0) > 0 ? 'Move projects out of this category first' : 'Delete category'}
                    onClick={() => setPendingDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        body={pendingDelete ? `“${pendingDelete.name}” will be removed. This cannot be undone.` : ''}
        loading={deleting}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void onDelete()}
      />
    </div>
  );
}
