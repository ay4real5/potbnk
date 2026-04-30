import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, PlusCircle, MinusCircle,
  ClipboardList, Settings, LogOut, Bell, Menu, X, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard' },
  { icon: ArrowLeftRight,  label: 'Transfer',     href: '/transfer' },
  { icon: PlusCircle,      label: 'Deposit',      href: '/deposit' },
  { icon: MinusCircle,     label: 'Withdraw',     href: '/withdraw' },
  { icon: ClipboardList,   label: 'Transactions', href: '/transactions' },
  { icon: Settings,        label: 'Settings',     href: '/settings' },
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
    <div className="min-h-screen flex bg-[#f0f4f3]">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bank-dark flex flex-col
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 shrink-0">
          <LogoMark />
          <span className="text-white font-bold text-xl tracking-tight">Hunch.</span>
          <button className="ml-auto lg:hidden text-white/50 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.full_name ?? 'User'}</p>
              <p className="text-white/40 text-xs truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active =
              location.pathname === href ||
              (href === '/transactions' && location.pathname.startsWith('/transactions'));
            return (
              <Link
                key={href}
                to={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon size={17} className={active ? 'text-bank-accent' : 'text-white/40'} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto text-bank-accent/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-6 shrink-0 shadow-sm">
          <button className="lg:hidden text-gray-500 hover:text-bank-dark" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="text-[15px] font-bold text-bank-dark flex-1">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{today}</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={17} />
            </button>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-8 h-8 rounded-full bg-bank-dark flex items-center justify-center text-white text-xs font-bold hover:bg-bank-mid transition-colors"
            >
              {initials}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
