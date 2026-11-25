import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { Seo } from '@/components/ui/Seo';
import { useToast } from '@/context/ToastContext';
import { useDebouncedValue } from '@/hooks/useUi';
import { categoryOf, getErrorMessage } from '@/lib/errors';
import { cx, formatDate } from '@/lib/format';
import { deleteProject, getAdminProjects, updateProjectStatus } from '@/services/projects';
import type { Pagination as PageInfo, Project } from '@/types';

export function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const page = Math.max(1, Number(params.get('page') || '1') || 1);
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PageInfo>({ page: 1, limit: 8, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [busyId, setBusyId] = useState('');
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ page: String(page), limit: '8' });
      if (status === 'draft' || status === 'published') query.set('status', status);
      if (debouncedSearch.trim()) query.set('search', debouncedSearch.trim());
      const data = await getAdminProjects(query);
      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateQuery(next: { status?: string; page?: number; search?: string }) {
    const query = new URLSearchParams(params);
    const nextStatus = next.status ?? status;
    const nextPage = next.page ?? page;
    if (nextStatus === 'all') query.delete('status');
    else query.set('status', nextStatus);
    if (nextPage <= 1) query.delete('page');
    else query.set('page', String(nextPage));
    if (next.search !== undefined) {
      if (next.search) query.set('search', next.search);
      else query.delete('search');
    }
    setParams(query);
  }

  useEffect(() => {
    const current = params.get('search') || '';
    if (debouncedSearch.trim() === current) return;
    updateQuery({ search: debouncedSearch.trim(), page: 1 });
    // eslint is not configured; query updates are intentional when the debounced term changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  async function onStatus(project: Project) {
    const next = project.status === 'published' ? 'draft' : 'published';
    setBusyId(project._id);
    try {
      const result = await updateProjectStatus(project._id, next);
      notify('success', result.message || 'Status updated.');
      await load();
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete._id);
    try {
      const result = await deleteProject(pendingDelete._id);
      notify('success', result.message);
      setPendingDelete(null);
      if (projects.length === 1 && page > 1) updateQuery({ page: page - 1 });
      else await load();
    } catch (err) {
      notify('error', getErrorMessage(err));
    } finally {
      setBusyId('');
    }
  }

  return (
    <div>
      <Seo title="Projects — Trainonex studio" noIndex />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone">Library</p>
          <h1 className="mt-2 font-serif text-5xl">Projects</h1>
        </div>
        <Link to="/admin/projects/new" className="inline-flex w-fit rounded-full bg-accent-deep px-5 py-3 text-sm font-medium text-white">
          New project
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">
          <span className="sr-only">Search projects</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3"
          />
        </label>
        <label className="text-sm">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 sm:w-44"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-danger">{error}</p>}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="rounded-3xl border border-line bg-white px-5 py-8 text-sm text-muted">Loading projects…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-white px-5 py-12 text-center">
            <h2 className="font-serif text-3xl">No projects match.</h2>
            <p className="mt-2 text-sm text-muted">Create one, or clear the search and status filters.</p>
          </div>
        ) : (
          projects.map((project) => {
            const category = categoryOf(project);
            return (
              <article key={project._id} className="grid gap-4 rounded-3xl border border-line bg-white p-4 sm:grid-cols-[96px_1fr] sm:items-center">
                <div className="h-20 overflow-hidden rounded-2xl bg-ink/5">
                  {project.thumbnail?.url ? (
                    <img src={project.thumbnail.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-stone">No image</div>
                  )}
                </div>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-medium">{project.title}</h2>
                    <p className="text-sm text-muted">
                      {category?.name || 'Uncategorised'} · {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cx('rounded-full px-3 py-1 text-xs', project.status === 'published' ? 'bg-[#D6FF4A] text-ink' : 'bg-[#6D4AFF]/15 text-[#6D4AFF]')}>
                      {project.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <button type="button" className="rounded-full border border-line px-3 py-1.5 text-sm" disabled={busyId === project._id} onClick={() => void onStatus(project)}>
                      {project.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/admin/projects/${project._id}/edit`} className="rounded-full border border-line px-3 py-1.5 text-sm">
                      Edit
                    </Link>
                    {project.status === 'published' && (
                      <Link to={`/work/${project.slug}`} target="_blank" className="rounded-full border border-line px-3 py-1.5 text-sm">
                        View
                      </Link>
                    )}
                    <button type="button" className="rounded-full border border-red-200 px-3 py-1.5 text-sm text-danger" onClick={() => setPendingDelete(project)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <Pagination page={pagination.page} pages={pagination.pages} onPage={(next) => updateQuery({ page: next })} />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this project?"
        body={pendingDelete ? `“${pendingDelete.title}” will be removed from the studio and the public site, including its images.` : ''}
        loading={Boolean(pendingDelete && busyId === pendingDelete._id)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void onDelete()}
      />
    </div>
  );
}
