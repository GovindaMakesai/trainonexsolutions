import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { site } from '@/content/site';
import { useLockBody } from '@/hooks/useUi';
import { cx } from '@/lib/format';

const links = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const light = (isHome && !scrolled) || open;
  useLockBody(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function goTo(id: string) {
    setOpen(false);
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `/#${id}`);
      return;
    }
    navigate(`/#${id}`);
  }

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-colors',
        open ? 'bg-ink' : scrolled || !isHome ? 'border-b border-line/80 bg-paper/90 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-site items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label={`${site.legalName} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">T</span>
          <span className={cx('text-sm font-semibold tracking-[0.16em]', light ? 'text-cream' : 'text-ink')}>TRAINONEX</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => goTo(link.id)}
              className={cx('text-sm transition hover:text-accent-deep', light ? 'text-cream/80' : 'text-ink/80')}
            >
              {link.label}
            </button>
          ))}
          <button type="button" onClick={() => goTo('contact')} className="rounded-full bg-accent-deep px-4 py-2 text-sm font-medium text-white">
            Start a project
          </button>
        </nav>

        <button
          type="button"
          className={cx('inline-flex h-11 w-11 items-center justify-center rounded-full border md:hidden', light ? 'border-white/20 text-cream' : 'border-line text-ink')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="min-h-[calc(100vh-76px)] bg-ink px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => goTo(link.id)}
                className="border-b border-white/10 py-4 text-left font-serif text-4xl text-cream"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={() => goTo('contact')} className="mt-8 rounded-full bg-accent-deep px-5 py-3 text-sm font-medium text-white">
            Start a project
          </button>
        </div>
      )}
    </header>
  );
}
