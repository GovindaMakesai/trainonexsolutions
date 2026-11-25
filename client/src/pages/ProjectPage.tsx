import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Lightbox } from '@/components/portfolio/Lightbox';
import { Seo } from '@/components/ui/Seo';
import { categoryOf, getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { getPublishedProject } from '@/services/projects';
import type { ImageAsset, Project } from '@/types';

export function ProjectPage() {
  const { slug = '' } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMissing(false);
    setError('');
    getPublishedProject(slug)
      .then((data) => {
        if (active) setProject(data);
      })
      .catch((err: { status?: number; message?: string }) => {
        if (!active) return;
        if (err.status === 404) setMissing(true);
        else setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-site px-5 pb-24 pt-32 sm:px-8">
        <div className="h-4 w-32 animate-pulse bg-ink/10" />
        <div className="mt-6 h-16 w-2/3 animate-pulse bg-ink/10" />
        <div className="mt-10 aspect-[16/9] animate-pulse bg-ink/10" />
      </div>
    );
  }

  if (missing || (!project && !error)) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-site flex-col justify-center px-5 py-32 sm:px-8">
        <Seo title="Project not found — Trainonex" description="This case study is not published." noIndex />
        <p className="text-xs uppercase tracking-[0.22em] text-stone">404</p>
        <h1 className="mt-3 font-serif text-6xl">This case study is not available.</h1>
        <p className="mt-4 max-w-lg text-muted">It may be a draft, or the link is no longer published.</p>
        <Link to="/#work" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-cream">
          <ArrowLeft className="h-4 w-4" />
          Back to work
        </Link>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-site px-5 py-32 sm:px-8">
        <h1 className="font-serif text-5xl">We couldn’t open this project.</h1>
        <p className="mt-4 text-danger">{error}</p>
        <button type="button" className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-cream" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const category = categoryOf(project);
  const images: ImageAsset[] = [...(project.thumbnail ? [project.thumbnail] : []), ...(project.gallery || [])];
  const paragraphs = project.description.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <article className="pb-24 pt-28">
      <Seo title={`${project.title} — Trainonex`} description={project.shortDescription} />
      <div className="mx-auto max-w-site px-5 sm:px-8">
        <Link to="/#work" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          All work
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-stone">
          {category?.name || 'Project'}
          {project.createdAt ? ` · ${formatDate(project.createdAt)}` : ''}
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-5xl tracking-tight sm:text-7xl">{project.title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{project.shortDescription}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {project.projectUrl && (
            <a className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-cream" href={project.projectUrl} target="_blank" rel="noreferrer">
              Visit project
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          {project.githubUrl && (
            <a className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm" href={project.githubUrl} target="_blank" rel="noreferrer">
              GitHub
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {project.technologies.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li key={tech} className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>

      {project.thumbnail?.url && (
        <button type="button" className="mx-auto mt-12 block w-full max-w-[1400px] px-5 sm:px-8" onClick={() => setActiveImage(0)}>
          <img src={project.thumbnail.url} alt={`${project.title} thumbnail`} className="aspect-[16/9] w-full rounded-[28px] object-cover shadow-card" />
        </button>
      )}

      <div className="mx-auto mt-14 max-w-3xl space-y-6 px-5 text-lg leading-8 sm:px-8">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      {project.gallery.length > 0 && (
        <div className="mx-auto mt-14 grid max-w-site gap-4 px-5 sm:grid-cols-2 sm:px-8">
          {project.gallery.map((image, index) => (
            <button key={image.publicId} type="button" onClick={() => setActiveImage(project.thumbnail ? index + 1 : index)}>
              <img src={image.url} alt={`${project.title} gallery ${index + 1}`} className="aspect-[4/3] w-full rounded-[24px] object-cover shadow-card" />
            </button>
          ))}
        </div>
      )}

      <Lightbox images={images} index={activeImage} onClose={() => setActiveImage(null)} onIndex={setActiveImage} />
    </article>
  );
}
