import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Open an Account', href: '/open-account' },
  { label: 'Sign In',         href: '/login' },
  { label: 'Checking',        href: '/bank' },
  { label: 'Savings',         href: '/bank' },
  { label: 'Loans',           href: '/borrow' },
  { label: 'Support',         href: '/support' },
  { label: 'Find a Branch',   href: '/locations' },
  { label: 'About Hunch',     href: '/about' },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bank-dark flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-12">
        <svg width="28" height="28" viewBox="0 0 22 24" fill="none" aria-hidden="true">
          <path d="M17.6 3.6L15.1 2.2V10.2L7.6 14.6V22.5L10.1 24V16L15.1 13.1V21.8L17.6 20.4V3.6Z" fill="white"/>
          <path d="M11.3 24L13.9 22.5V15.3L11.3 16.8V24Z" fill="white"/>
          <path d="M10.1 0L7.6 1.4V8.8L10.1 7.3V0Z" fill="white"/>
          <path d="M2.5 19.6V4.4L0.4 5.6C0.2 5.7 0 6 0 6.3V17.7C0 18 0.2 18.3 0.4 18.4L2.5 19.6Z" fill="white"/>
          <path d="M3.8 3.6V20.4L6.3 21.8V13.9L13.9 9.5V1.4L11.3 0V8.1L6.3 11V2.2L3.8 3.6Z" fill="white"/>
          <path d="M21.4 17.7V6.3C21.4 6 21.3 5.7 21 5.6L18.9 4.4V19.6L21 18.4C21.3 18.3 21.4 18 21.4 17.7Z" fill="white"/>
        </svg>
        <span className="font-bold text-white text-xl tracking-tight">
          Hunch<span className="text-[#4ade80]">.</span>
        </span>
      </Link>

      {/* 404 giant number */}
      <p className="text-[120px] md:text-[180px] font-black leading-none text-[#4ade80]/20 select-none mb-0">
        404
      </p>

      <h1 className="text-3xl md:text-4xl font-black text-white -mt-4 mb-3">
        Page not found
      </h1>
      <p className="text-white/50 text-sm max-w-md leading-relaxed mb-10">
        The page you're looking for doesn't exist or has been moved. Let's get you somewhere useful.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:border-white/50 hover:text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
        >
          <ArrowLeft size={15} /> Go Back
        </button>
        <Link
          to="/"
          className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-7 py-3 rounded-full transition-colors text-sm"
        >
          Return to Home
        </Link>
      </div>

      {/* Quick links */}
      <div className="border-t border-white/10 pt-10 w-full max-w-lg">
        <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">Quick links</p>
        <div className="flex flex-wrap justify-center gap-3">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-xs font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 rounded-full transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
