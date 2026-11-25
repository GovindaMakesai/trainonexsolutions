import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { photos } from '@/content/photos';
import { usePublicProjects } from '@/hooks/usePublicProjects';
import { categoryOf } from '@/lib/errors';
import { cx } from '@/lib/format';
import type { Project } from '@/types';

function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const category = categoryOf(project);
  return (
    <article className={cx(featured && 'md:col-span-2')}>
      <Link to={`/work/${project.slug}`} className="group block">
        <div className={cx('overflow-hidden rounded-[28px] bg-ink/5 shadow-card ring-4 ring-white', featured ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
          {project.thumbnail?.url ? (
            <img
              src={project.thumbnail.url}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-end bg-ink p-6 text-cream">
              <span className="font-serif text-4xl">{project.title}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#6D4AFF]">{category?.name || 'Project'}</p>
            <h3 className="mt-1 font-serif text-3xl tracking-tight group-hover:text-accent-deep">{project.title}</h3>
          </div>
          <ArrowUpRight className="mt-2 h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{project.shortDescription}</p>
      </Link>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-ink/10" />
      <div className="mt-4 h-3 w-24 bg-ink/10" />
      <div className="mt-3 h-7 w-2/3 bg-ink/10" />
      <div className="mt-3 h-4 w-full bg-ink/10" />
    </div>
  );
}

export function Work() {
  const { category, setCategory, categories, projects, total, loading, loadingMore, error, hasMore, reload, loadMore } =
    usePublicProjects();

  return (
    <section id="work" className="bg-paper py-24">
      <div className="mx-auto max-w-site px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#6D4AFF]">Selected work</p>
            <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">Case studies</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            {loading ? 'Loading published work.' : `${total} published ${total === 1 ? 'project' : 'projects'}. Drafts stay in the studio.`}
          </p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter work by category">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </FilterChip>
          {categories.map((item) => (
            <FilterChip key={item._id} active={category === item.slug} onClick={() => setCategory(item.slug)}>
              {item.name}
            </FilterChip>
          ))}
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-line bg-white p-6">
            <p className="text-sm text-danger">{error}</p>
            <Button type="button" variant="secondary" className="mt-4" onClick={() => void reload()}>
              Try again
            </Button>
          </div>
        )}

        {loading ? (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <Skeleton />
            <Skeleton />
          </div>
        ) : projects.length === 0 ? (
          <div className="relative mt-10 overflow-hidden rounded-[32px] px-6 py-20 text-center text-cream shadow-card">
            <img src={photos.abstract} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#140818]/75" />
            <div className="relative">
              <h3 className="font-serif text-4xl">Nothing published in this view yet.</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-cream/80">
                Case studies appear here as soon as they are published from the studio dashboard. Drafts are never shown on this page.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectCard key={project._id} project={project} featured={index === 0 && category === 'all'} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-12 flex justify-center">
            <Button type="button" variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
              Load more work
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cx(
        'shrink-0 rounded-full px-4 py-2 text-sm transition',
        active ? 'bg-ink text-[#D6FF4A]' : 'border border-line bg-white text-ink hover:border-[#6D4AFF] hover:text-[#6D4AFF]',
      )}
    >
      {children}
    </button>
  );
}
