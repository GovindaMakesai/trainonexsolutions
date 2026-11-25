import { Link } from 'react-router-dom';
import { Seo } from '@/components/ui/Seo';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-site flex-col justify-center px-5 py-32 sm:px-8">
      <Seo title="Page not found — Trainonex" description="That page does not exist." noIndex />
      <p className="text-xs uppercase tracking-[0.22em] text-stone">404</p>
      <h1 className="mt-3 max-w-xl font-serif text-6xl tracking-tight">This page is not on the site.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be out of date. The work, services, and studio are still on the homepage.</p>
      <Link to="/" className="mt-8 inline-flex w-fit rounded-full bg-ink px-5 py-3 text-sm text-cream">
        Back home
      </Link>
    </div>
  );
}
