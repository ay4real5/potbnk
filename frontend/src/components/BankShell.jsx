import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, Moon, Sun, User, Settings, Shield, LogOut } from 'lucide-react';
import api from '../api/client';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Transfer',     href: '/transfer' },
  { label: 'Deposit',      href: '/deposit' },
  { label: 'Withdraw',     href: '/withdraw' },
  { label: 'Bill Pay',     href: '/bill-pay' },
  { label: 'Goals',        href: '/goals' },
  { label: 'Cards',        href: '/cards' },
  { label: 'Statements',   href: '/statements' },
  { label: 'Check Deposit',href: '/check-deposit' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Settings',     href: '/settings' },
];

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 22 24" fill="none" aria-hidden="true">
      <path d="M17.6 3.6L15.1 2.2V10.2L7.6 14.6V22.5L10.1 24V16L15.1 13.1V21.8L17.6 20.4V3.6Z" fill="white"/>
      <path d="M11.3 24L13.9 22.5V15.3L11.3 16.8V24Z" fill="white"/>
      <path d="M10.1 0L7.6 1.4V8.8L10.1 7.3V0Z" fill="white"/>
      <path d="M2.5 19.6V4.4L0.4 5.6C0.2 5.7 0 6 0 6.3V17.7C0 18 0.2 18.3 0.4 18.4L2.5 19.6Z" fill="white"/>
      <path d="M3.8 3.6V20.4L6.3 21.8V13.9L13.9 9.5V1.4L11.3 0V8.1L6.3 11V2.2L3.8 3.6Z" fill="white"/>
      <path d="M21.4 17.7V6.3C21.4 6 21.3 5.7 21 5.6L18.9 4.4V19.6L21 18.4C21.3 18.3 21.4 18 21.4 17.7Z" fill="white"/>
    </svg>
  );
}

export default function BankShell({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('hunch-theme') === 'dark'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('hunch-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  useEffect(() => {
    api.get('/auth/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onEscape = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onEscape);
    };
  }, [profileOpen]);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HU';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  const notifDotCls = (category) => {
    if (category === 'SECURITY') return 'bg-amber-500';
    if (category === 'TRANSFER') return 'bg-sky-500';
    if (category === 'DEPOSIT')  return 'bg-emerald-500';
    if (category === 'WITHDRAWAL') return 'bg-red-500';
    return 'bg-slate-400';
  };
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f2] dark:bg-[#0a0f0e] transition-colors duration-300 overflow-x-hidden">

      <div className="w-full bg-[#041f1c] text-center py-1 px-8">
        <span className="text-[9px] text-white/50 tracking-[0.18em] uppercase">
          FDIC-Insured — Backed by the full faith and credit of the U.S. Government
        </span>
      </div>

      <header className="bg-[#041f1c] border-b border-white/10 px-4 sm:px-8 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">

          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-white font-bold text-xl tracking-tight font-display">Hunch.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => {
              const active =
                location.pathname === href ||
                (href === '/transactions' && location.pathname.startsWith('/transactions'));
              return (
                <Link
                  key={href}
                  to={href}
                  className={`text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                    active ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 hidden sm:block mr-1">{today}</span>

            <button
              onClick={() => setDark((d) => !d)}
              title={dark ? 'Light mode' : 'Dark mode'}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors relative"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#041f1c]" />
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white dark:bg-[#111a18] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Notifications</p>
                    <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">No notifications yet</p>
                    </div>
                  ) : (
                    <ul>
                      {notifications.map((n) => (
                        <li key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0 ${!n.is_read ? 'bg-slate-50/60 dark:bg-white/[0.03]' : ''}`}>
                          <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${notifDotCls(n.category)}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{n.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/50 truncate mt-0.5">{n.body}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <button
                              onClick={async (e) => { e.stopPropagation(); await api.patch(`/auth/notifications/${n.id}/read`); setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x)); }}
                              className="text-[10px] font-semibold text-bank-teal hover:underline shrink-0"
                            >
                              Mark read
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                title="Account menu"
                className="w-8 h-8 rounded-full bg-[#7CFC00] flex items-center justify-center text-[#041f1c] text-xs font-bold hover:brightness-110 transition-all"
              >
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 z-50 w-64 bg-white dark:bg-[#111a18] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{user?.full_name || 'Account'}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'Signed in'}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-white/70 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-white/70 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Settings size={14} /> Preferences
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-white/70 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Shield size={14} /> Security Center
                    </button>
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden mt-3 flex flex-col gap-1 border-t border-white/10 pt-3 pb-2">
            {NAV_ITEMS.map(({ label, href }) => {
              const active =
                location.pathname === href ||
                (href === '/transactions' && location.pathname.startsWith('/transactions'));
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    active ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
