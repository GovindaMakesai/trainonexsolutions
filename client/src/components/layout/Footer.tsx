import { Link } from 'react-router-dom';
import { site } from '@/content/site';

export function Footer() {
  return (
    <footer className="bg-[#140818] text-cream">
      <div className="h-1.5 bg-gradient-to-r from-accent via-[#6D4AFF] to-[#D6FF4A]" />
      <div className="mx-auto max-w-site px-5 pb-8 pt-16 sm:px-8">
        <p className="font-serif text-[18vw] leading-[0.8] tracking-tight text-[#D6FF4A] sm:text-[12vw]">Trainonex</p>
        <div className="mt-10 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cream/45">Studio</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-cream/75">
              {site.legalName} designs and builds web products with a single team from the first workshop to launch.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cream/45">Visit</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-cream/80 hover:text-white" href="/#work">Work</a></li>
              <li><a className="text-cream/80 hover:text-white" href="/#services">Services</a></li>
              <li><a className="text-cream/80 hover:text-white" href="/#about">About</a></li>
              <li><a className="text-cream/80 hover:text-white" href="/#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cream/45">Contact</p>
            <a className="mt-3 block text-sm text-cream hover:text-accent" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <p className="mt-2 text-sm text-cream/60">{site.location}</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.legalName}</p>
          <Link to="/admin/login" className="hover:text-cream">
            Studio login
          </Link>
        </div>
      </div>
    </footer>
  );
}
