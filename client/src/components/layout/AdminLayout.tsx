import { useEffect, useState } from 'react';
import { FolderKanban, LayoutDashboard, LogOut, Mail, Menu, Tags, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLockBody } from '@/hooks/useUi';
import { cx } from '@/lib/format';
import { getStats } from '@/services/studio';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban, end: false },
  { to: '/admin/categories', label: 'Categories', icon: Tags, end: false },
  { to: '/admin/messages', label: 'Messages', icon: Mail, end: false },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  useLockBody(open);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    getStats()
      .then((stats) => {
        if (active) setUnread(stats.unreadMessages);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [location.pathname]);

  async function onLogout() {
    try {
      await logout();
      notify('success', 'Signed out.');
      navigate('/admin/login');
    } catch {
      notify('error', 'Could not sign out. Try again.');
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-3 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">T</span>
        <span>
          <span className="block text-sm font-semibold tracking-[0.14em]">TRAINONEX</span>
          <span className="block text-xs text-white/50">Studio</span>
        </span>
      </Link>
      <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Studio">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cx(
                'flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm',
                isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <span className="inline-flex items-center gap-3">
              <link.icon className="h-4 w-4" />
              {link.label}
            </span>
            {link.to === '/admin/messages' && unread > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-white">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-4">
        <p className="px-2 text-sm font-medium">{admin?.name}</p>
        <p className="px-2 text-xs text-white/50">{admin?.email}</p>
        <button type="button" onClick={() => void onLogout()} className="mt-4 inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm text-white/80 hover:text-white">
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f0ea] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-ink px-4 py-6 text-cream lg:block">{sidebar}</aside>
      <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-4 text-cream lg:hidden">
        <p className="text-sm tracking-[0.14em]">TRAINONEX</p>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15" onClick={() => setOpen(true)} aria-label="Open studio menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink px-4 py-6 text-cream lg:hidden">
          <button type="button" className="absolute right-4 top-4" onClick={() => setOpen(false)} aria-label="Close studio menu">
            <X className="h-5 w-5" />
          </button>
          {sidebar}
        </div>
      )}
      <div className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
}
