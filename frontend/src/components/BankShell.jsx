import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Transfer',     href: '/transfer' },
  { label: 'Deposit',      href: '/deposit' },
  { label: 'Withdraw',     href: '/withdraw' },
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

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HU';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── FDIC strip ─────────────────────────────────────────────────── */}
      <div className="w-full bg-[#041f1c] text-center py-1 px-8">
        <span className="text-[10px] text-white/50 tracking-wide">
          FDIC-Insured — Backed by the full faith and credit of the U.S. Government
        </span>
      </div>

      {/* ── Main header ────────────────────────────────────────────────── */}
      <header className="bg-[#041f1c] border-b border-white/10 px-8 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">

          {/* Left: logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-white font-bold text-xl tracking-tight">Hunch.</span>
          </Link>

          {/* Center: nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, href }) => {
              const active =
                location.pathname === href ||
                (href === '/transactions' && location.pathname.startsWith('/transactions'));
              return (
                <Link
                  key={href}
                  to={href}
                  className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: date + bell + avatar + mobile hamburger */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50 hidden sm:block">{today}</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <Bell size={17} />
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-8 h-8 rounded-full bg-[#7CFC00] flex items-center justify-center text-[#041f1c] text-xs font-bold hover:brightness-110 transition-all"
            >
              {initials}
            </button>
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
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
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <main className="flex-1 bg-[#f0f4f2]">
        {children}
      </main>
    </div>
  );
}
