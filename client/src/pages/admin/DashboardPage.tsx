import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Seo } from '@/components/ui/Seo';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { getStats } from '@/services/studio';
import type { DashboardStats } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Seo title="Studio overview — Trainonex" noIndex />
      <p className="text-xs uppercase tracking-[0.2em] text-stone">Overview</p>
      <h1 className="mt-2 font-serif text-5xl">Studio</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">Published work is live on the site. Drafts stay here until you release them.</p>

      {error && <p className="mt-6 text-sm text-danger">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total projects" value={stats?.totalProjects} loading={loading} to="/admin/projects" />
        <Stat label="Published" value={stats?.publishedProjects} loading={loading} to="/admin/projects?status=published" />
        <Stat label="Drafts" value={stats?.draftProjects} loading={loading} to="/admin/projects?status=draft" />
        <Stat label="Unread messages" value={stats?.unreadMessages} loading={loading} to="/admin/messages" />
      </div>

      <section className="mt-10 rounded-3xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-3xl">Recent projects</h2>
          <Link to="/admin/projects" className="text-sm text-accent-deep">
            Manage
          </Link>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted">Loading projects…</p>
        ) : stats && stats.recentProjects.length > 0 ? (
          <ul className="divide-y divide-line">
            {stats.recentProjects.map((project) => (
              <li key={project._id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={`/admin/projects/${project._id}/edit`} className="font-medium hover:text-accent-deep">
                    {project.title}
                  </Link>
                  <p className="text-xs text-stone">Updated {formatDate(project.updatedAt)}</p>
                </div>
                <span className={project.status === 'published' ? 'text-sm text-forest' : 'text-sm text-stone'}>
                  {project.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-10">
            <p className="text-sm text-muted">No projects yet.</p>
            <Link to="/admin/projects/new" className="mt-4 inline-flex rounded-full bg-ink px-4 py-2 text-sm text-cream">
              Create a project
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, loading, to }: { label: string; value?: number; loading: boolean; to: string }) {
  return (
    <Link to={to} className="rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-0.5">
      <p className="text-xs uppercase tracking-[0.16em] text-stone">{label}</p>
      <p className="mt-3 font-serif text-5xl">{loading ? '—' : value ?? 0}</p>
    </Link>
  );
}
