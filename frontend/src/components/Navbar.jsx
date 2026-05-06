import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, LayoutDashboard, ArrowLeftRight, MinusCircle, Menu, X, Search,
  PiggyBank, RefreshCw, Handshake, Shield, Home, DollarSign,
  CreditCard, Calculator, TrendingUp, MapPin, Trophy,
  ShieldCheck, Lock, CheckSquare, Info, Monitor, ChevronRight, Map,
  Eye, EyeOff,
} from 'lucide-react';

// ── Logo ─────────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 22 24" fill="none" aria-hidden="true">
      <path d="M17.6 3.6L15.1 2.2V10.2L7.6 14.6V22.5L10.1 24V16L15.1 13.1V21.8L17.6 20.4V3.6Z" fill="white"/>
      <path d="M11.3 24L13.9 22.5V15.3L11.3 16.8V24Z" fill="white"/>
      <path d="M10.1 0L7.6 1.4V8.8L10.1 7.3V0Z" fill="white"/>
      <path d="M2.5 19.6V4.4L0.4 5.6C0.2 5.7 0 6 0 6.3V17.7C0 18 0.2 18.3 0.4 18.4L2.5 19.6Z" fill="white"/>
      <path d="M3.8 3.6V20.4L6.3 21.8V13.9L13.9 9.5V1.4L11.3 0V8.1L6.3 11V2.2L3.8 3.6Z" fill="white"/>
      <path d="M21.4 17.7V6.3C21.4 6 21.3 5.7 21 5.6L18.9 4.4V19.6L21 18.4C21.3 18.3 21.4 18 21.4 17.7Z" fill="white"/>
    </svg>
  );
}

// ── Mega-menu data ────────────────────────────────────────────────────────────
// Route map for task-category nav buttons
const CATEGORY_ROUTES = {
  Bank:    '/bank',
  Borrow:  '/borrow',
  Grow:    '/grow',
  Plan:    '/plan',
  Protect: '/protect',
  Learn:   '/learn',
};

// Links shown in the mega-menu left sidebar with their routes
const MEGA_MENU_ROUTES = {
  'Bank with Hunch':    '/bank',
  'Checking':           '/bank/checking',
  'Savings':            '/bank/savings',
  'Credit Card':        '/bank/credit-cards',
  'Home Loans':         '/borrow/mortgages',
  'Personal Loans':     '/borrow/personal-loans',
  'Auto Loans':         '/borrow/auto-loans',
  'Credit Cards':       '/bank/credit-cards',
  'Borrow with Hunch':  '/borrow',
  'Grow with Hunch':    '/grow',
  'Plan with Hunch':    '/plan',
  'Retirement':         '/plan/retirement',
  'Trust & Estates':    '/plan/trusts',
  'Protect with Hunch': '/protect',
  'Home Insurance':     '/protect/home-insurance',
  'Life Insurance':     '/protect/insurance',
  'Vehicle Insurance':  '/protect/insurance',
  'Learn':              '/learn',
  'Private Bank Insights': '/learn',
};

const MEGA_MENUS = {
  Bank: {
    links: ['Bank with Hunch', 'Checking', 'Savings', 'Credit Card'],
    cards: [
      { Icon: PiggyBank, title: "Maximize your tax refund's potential", desc: 'Earn more this tax season with a high-yield savings account.' },
      { Icon: RefreshCw,  title: 'Perks Checking',                        desc: 'Designed to support everyday banking needs.' },
      { Icon: Handshake,  title: "Help care for your loved one's finances",  desc: 'Caregiver Banking supports their independence.' },
      { Icon: Shield,     title: 'Banking that honors your service',         desc: 'Checking perks for those who serve.' },
    ],
    articles: [
      { title: 'Authorized User, Joint, or POA?', cta: 'Tell me more' },
      { title: 'How to Write a Check',            cta: 'Check writing tips' },
    ],
  },
  Borrow: {
    links: ['Home Loans', 'Personal Loans', 'Auto Loans', 'Credit Cards', 'Borrow with Hunch'],
    cards: [
      { Icon: Home,       title: 'Buying your first home?',         desc: 'Prep for homebuying with tips and tools to guide you.' },
      { Icon: DollarSign, title: 'Funding what matters to you',     desc: "From home updates to tuition, we're here to help." },
      { Icon: CreditCard, title: 'Choose the right card for you',   desc: 'Compare rewards, rates, and built-in perks.' },
      { Icon: Calculator, title: 'Rethink your rate',               desc: 'Could refinancing free up cash? Try our calculator.' },
    ],
    articles: [
      { title: 'What Should My Budget Be for Buying a House?', cta: 'Start planning' },
      { title: 'Hidden Homebuying Costs to Plan For',          cta: 'Explore Costs'  },
    ],
  },
  Grow: {
    links: ['Grow with Hunch'],
    cards: [
      { Icon: PiggyBank,  title: 'Save with intention',             desc: 'The right savings accounts can help shape your future.' },
      { Icon: TrendingUp, title: 'Your plan. Your portfolio.',       desc: 'Turn your goals into a plan with expert guidance.' },
      { Icon: DollarSign, title: 'Your future, thoughtfully nurtured', desc: "Get financial clarity for life's big decisions." },
      { Icon: MapPin,     title: 'Find a branch or ATM',            desc: 'Convenient access, hometown service.' },
    ],
    articles: [
      { title: 'FIRE: Get help retiring early',          cta: 'Craft Next Steps' },
      { title: 'Micro investing: small steps, big goals', cta: 'Read the Guide'  },
    ],
  },
  Plan: {
    links: ['Plan with Hunch', 'Retirement', 'Trust & Estates'],
    cards: [
      { Icon: Map,    title: 'Your partner in private banking',  desc: 'A relationship-based approach to your wealth.'         },
      { Icon: Trophy, title: 'Comprehensive wealth management',   desc: 'Banking, lending, and investing — working together.' },
    ],
    articles: [
      { title: 'Are your retirement savings on track?', cta: 'Plan by Decade'  },
      { title: 'Preparing for Retirement',              cta: 'Plan Retirement' },
    ],
  },
  Protect: {
    links: ['Protect with Hunch', 'Home Insurance', 'Life Insurance', 'Vehicle Insurance'],
    cards: [
      { Icon: ShieldCheck, title: 'Stay ahead of fraud and scams',     desc: 'Tips, tools, and support to help you stay protected.' },
      { Icon: Lock,        title: 'Protect your money from the start', desc: 'Know what to watch for and how to shut it down.'     },
    ],
    articles: [
      { title: 'Life insurance, explained',              cta: 'Insurance Basics'   },
      { title: 'Why identity theft protection matters',  cta: 'ID Safety Tips'     },
      { title: 'Get an insurance quote online', body: "We'll find the right coverage for your needs and budget.", cta: 'Get a quote', wide: true },
    ],
  },
  Learn: {
    links: ['Learn', 'Private Bank Insights'],
    cards: [
      { Icon: CheckSquare, title: 'Understand investing, step-by-step', desc: 'Learn how to invest wisely, at any life stage.'        },
      { Icon: PiggyBank,   title: 'Craft the habit of saving',           desc: 'Saving money is a skillset. Start building yours today.' },
      { Icon: Info,        title: 'Insights that keep you informed',      desc: "Equipping you with clarity for what's ahead."           },
      { Icon: Monitor,     title: 'Credit without the confusion.',         desc: "Learn what impacts credit and what doesn't."            },
    ],
    articles: [
      { title: 'What affects your credit score?', cta: 'Find Out'    },
      { title: 'What to save for and how much',   cta: 'How to Save' },
    ],
  },
};

const BUSINESS_CARDS = [
  {
    tag: 'GROWING BUSINESS',
    title: 'Start-up to scale-up',
    desc: 'Business checking, card controls, and credit lines designed for fast-moving teams and founders.',
    cta: 'Explore startup banking',
    href: '/business/checking',
  },
  {
    tag: 'ESTABLISHED ENTERPRISE',
    title: 'Mid to large corporations',
    desc: 'Treasury management, payment workflows, and relationship-led commercial lending for complex operations.',
    cta: 'Explore enterprise solutions',
    href: '/business/treasury',
  },
  {
    tag: 'GOVERNMENT & PUBLIC SECTOR',
    title: 'Government, education, and non-profit',
    desc: 'Dedicated public-sector banking support for municipalities, schools, and mission-driven organizations.',
    cta: 'Talk to a specialist',
    href: '/contact',
  },
];

const BUSINESS_OFFER_LINKS = [
  { title: 'Checking Accounts', href: '/business/checking' },
  { title: 'Savings Accounts', href: '/business/savings' },
  { title: 'Credit Cards', href: '/business/credit-cards' },
  { title: 'Home, auto and personal loans', href: '/borrow' },
  { title: 'Investing and financial advising', href: '/grow' },
  { title: 'Retirement planning and trusts', href: '/plan' },
  { title: 'Home, auto and life insurance', href: '/protect' },
  { title: 'Business Checking', href: '/business/checking' },
];

const PERSONAL_MOBILE_OFFER_LINKS = {
  Bank: [
    { title: 'Checking Accounts', href: '/bank/checking' },
    { title: 'Savings Accounts', href: '/bank/savings' },
    { title: 'Credit Cards', href: '/bank/credit-cards' },
    { title: 'Home, auto and personal loans', href: '/borrow' },
    { title: 'Investing and financial advising', href: '/grow' },
    { title: 'Retirement planning and trusts', href: '/plan' },
    { title: 'Home, auto and life insurance', href: '/protect' },
    { title: 'Business Checking', href: '/business/checking' },
  ],
  Borrow: [
    { title: 'Mortgage Loans', href: '/borrow/mortgages' },
    { title: 'Auto Loans', href: '/borrow/auto-loans' },
    { title: 'Personal Loans', href: '/borrow/personal-loans' },
    { title: 'Credit Cards', href: '/bank/credit-cards' },
  ],
  Grow: [
    { title: 'Savings Accounts', href: '/bank/savings' },
    { title: 'Investing and financial advising', href: '/grow' },
    { title: 'Learn Hub', href: '/learn' },
  ],
  Plan: [
    { title: 'Retirement planning and trusts', href: '/plan' },
    { title: 'Private banking support', href: '/plan' },
    { title: 'Estate and legacy planning', href: '/plan/trusts' },
  ],
  Protect: [
    { title: 'Home, auto and life insurance', href: '/protect' },
    { title: 'Fraud and identity protection', href: '/protect' },
    { title: 'Security resources', href: '/support' },
  ],
  Learn: [
    { title: 'Financial education articles', href: '/learn' },
    { title: 'Credit and budgeting tools', href: '/learn' },
    { title: 'Private Bank Insights', href: '/learn' },
  ],
};

const MOBILE_FOOTER_LINKS = [
  { title: 'About Hunch', href: '/about' },
  { title: 'Find a Branch or ATM', href: '/locations' },
  { title: 'Customer Service', href: '/support' },
];

const NAV_CATEGORIES = ['Bank', 'Borrow', 'Grow', 'Plan', 'Protect', 'Learn'];

// ── Mega-menu panel ───────────────────────────────────────────────────────────
// ── Search overlay ──────────────────────────────────────────────────────────
const SEARCH_SUGGESTIONS = [
  { label: 'Checking accounts', href: '/bank' },
  { label: 'High-yield savings', href: '/grow' },
  { label: 'Mortgage loans', href: '/borrow/mortgages' },
  { label: 'Credit cards', href: '/bank/credit-cards' },
  { label: 'Auto loans', href: '/borrow/auto-loans' },
  { label: 'Personal loans', href: '/borrow/personal-loans' },
  { label: 'Online banking', href: '/bank/online-banking' },
  { label: 'Find a branch', href: '/locations' },
  { label: 'Routing number', href: '/support' },
  { label: 'Business checking', href: '/business' },
];

function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = query.length > 1
    ? SEARCH_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_SUGGESTIONS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) { navigate(results[0].href); onClose(); }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bank-dark rounded-2xl w-full max-w-2xl shadow-2xl border border-white/10 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Hunch…  (products, support, locations)"
            className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
          />
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </form>
        <ul className="py-2 max-h-80 overflow-y-auto">
          {results.map((s) => (
            <li key={s.href}>
              <Link
                to={s.href}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 text-white/80 hover:text-white text-sm transition-colors"
              >
                <Search size={13} className="text-white/30 shrink-0" />
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="px-5 py-3 border-t border-white/10 text-xs text-white/30">
          Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/50 font-mono">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

// ── Mega-menu panel ──────────────────────────────────────────────────────────
function MegaPanel({ cat, isPersonal }) {
  if (!isPersonal) {
    return (
      <div className="bg-[#163d2e] rounded-2xl p-6 shadow-2xl">
        <h3 className="text-center text-white text-3xl md:text-5xl font-display font-semibold mb-6">
          Care is crafted into everything we do
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUSINESS_OFFER_LINKS.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group bg-[#2a676d]/80 hover:bg-[#357880] rounded-xl px-4 py-4 border border-white/10 hover:border-white/25 transition-colors flex items-start justify-between gap-3 min-h-[92px]"
            >
              <span className="text-white text-lg leading-snug font-semibold">{item.title}</span>
              <ChevronRight size={18} className="text-white/85 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const menu = MEGA_MENUS[cat];
  if (!menu) return null;

  const normalArticles = menu.articles.filter((a) => !a.wide);
  const wideArticles   = menu.articles.filter((a) =>  a.wide);

  return (
    <div className="bg-[#163d2e] rounded-2xl p-5 shadow-2xl">
      <div className="flex gap-5">
        {/* Left sidebar */}
        <div className="w-48 shrink-0 flex flex-col pt-1">
          {menu.links.map((lnk) => (
            <Link
              key={lnk}
              to={MEGA_MENU_ROUTES[lnk] || '#'}
              className="text-white/90 text-[13px] font-semibold hover:text-[#4ade80] transition-colors flex items-center justify-between group py-2.5 border-b border-white/5"
            >
              {lnk}
              <ChevronRight size={14} className="text-white/30 group-hover:text-[#4ade80] transition-colors" />
            </Link>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Feature cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {menu.cards.map(({ Icon, title, desc }) => (
              <a
                key={title}
                href="#"
                className="bg-[#0d3426] hover:bg-[#0f3d2e] rounded-xl p-4 flex flex-col gap-2 group relative"
              >
                <Icon size={20} className="text-white/70" strokeWidth={1.5} />
                <h4 className="text-white font-semibold text-[13px] leading-snug">{title}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                <ChevronRight size={14} className="absolute bottom-3 right-3 text-white/30 group-hover:text-white/70 transition-colors" />
              </a>
            ))}
          </div>

          {/* Normal article cards */}
          {normalArticles.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {normalArticles.map((a) => (
                <a
                  key={a.title}
                  href="#"
                  className="bg-[#1a4a3c]/60 border border-white/10 rounded-xl px-4 py-3 hover:border-white/25 transition-colors"
                >
                  <p className="text-white/80 text-[13px] font-semibold mb-1">{a.title}</p>
                  <span className="text-[#4ade80] text-xs font-semibold underline underline-offset-2">{a.cta}</span>
                </a>
              ))}
            </div>
          )}

          {/* Wide article cards */}
          {wideArticles.map((a) => (
            <a
              key={a.title}
              href="#"
              className="bg-[#1a4a3c]/60 border border-white/10 rounded-xl px-4 py-3 hover:border-white/25 transition-colors"
            >
              <p className="text-white/80 text-[13px] font-semibold mb-0.5">{a.title}</p>
              {a.body && <p className="text-white/50 text-xs mb-1.5">{a.body}</p>}
              <span className="text-[#4ade80] text-xs font-semibold underline underline-offset-2">{a.cta}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Login Dropdown ───────────────────────────────────────────────────────────
const OTHER_SERVICES = [
  'Asset Based Lending', 'Commercial eCustomerService', 'Escrow Solutions',
  'Payroll – Paychex', 'Payroll – SurePayroll', 'Online Investments',
  'Online Trust', 'Smart Tax', 'Welcome Lobby', 'Linscomb Wealth',
  'Cadence Asset Management & Trust', 'Cadence Retirement Plan Services',
];

function FdicBadge() {
  return (
    <div className="flex items-start gap-2.5 mb-4">
      <span className="mt-0.5 shrink-0 text-[9px] font-black text-white bg-bank-dark px-1.5 py-0.5 rounded-sm tracking-widest">FDIC</span>
      <p className="text-xs text-gray-500 italic leading-snug">
        FDIC-Insured—Backed by the full faith and credit of the U.S. Government
      </p>
    </div>
  );
}

function FloatInput({ id, label, type = 'text', value, onChange, suffix }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-2 text-sm text-bank-dark focus:outline-none focus:border-bank-dark transition-colors"
      />
      <label
        htmlFor={id}
        className="absolute left-3 top-1.5 text-[10px] text-gray-400 font-medium pointer-events-none transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-bank-dark"
      >
        {label}
      </label>
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  );
}

function MobileLoginTypeControl({ activeTab, setActiveTab, onLogin }) {
  return (
    <section className="w-full rounded-2xl border border-white/15 bg-white/[0.06] p-3.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-2">Mobile login</p>
      <p className="text-[11px] font-semibold text-white/85 mb-2">Choose profile</p>

      <div className="inline-flex w-full rounded-full border border-white/25 bg-[#0b5a5e] p-1">
        {['Personal', 'Business'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`h-9 flex-1 rounded-full text-[14px] font-bold transition-colors ${
              activeTab === tab
                ? 'bg-[#8fdb46] text-bank-dark'
                : 'text-white/85 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <Link
        to="/login"
        onClick={onLogin}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-[#8fdb46] px-5 text-bank-dark text-sm font-bold hover:brightness-105 transition-colors"
      >
        Login to {activeTab}
      </Link>
    </section>
  );
}

function LoginDropdown({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ email: '', password: '', companyId: '', userId: '', bizPass: '' });
  const [showPass, setShowPass] = useState(false);
  const [showBizPass, setShowBizPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePersonalLogin = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter the email address used for your account.');
      return;
    }
    setLoading(true);
    try {
      await login(normalizedEmail, form.password);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (show, setShow) => (
    <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)} className="text-gray-400 hover:text-bank-dark transition-colors">
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="absolute top-full right-0 mt-1 w-[460px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[300]">
      {/* Tabs */}
      <div className="flex gap-2 p-4 pb-3">
        {['Personal & Business', 'Commercial', 'Other'].map((t, i) => (
          <button
            key={t}
            onClick={() => { setTab(i); setError(''); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
              tab === i
                ? 'bg-bank-dark text-white border-bank-dark'
                : 'border-gray-300 text-bank-dark hover:border-bank-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 pb-6 pt-1">
        {/* ── Personal & Business ── */}
        {tab === 0 && (
          <form onSubmit={handlePersonalLogin} className="flex flex-col gap-4">
            <FdicBadge />
            <h2 className="text-xl font-bold text-bank-dark -mt-1">Log into Online Banking</h2>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <FloatInput id="email" label="Email" value={form.email} onChange={set('email')} />
            <FloatInput
              id="password" label="Password" type={showPass ? 'text' : 'password'}
              value={form.password} onChange={set('password')}
              suffix={eyeBtn(showPass, setShowPass)}
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold py-3 px-6 rounded-full transition-colors w-fit disabled:opacity-60"
            >
              <Lock size={15} />
              {loading ? 'Signing in…' : 'Log In'}
            </button>
            <div className="flex gap-5 text-sm">
              <a href="/support" className="text-bank-dark underline underline-offset-2 hover:text-bank-mid">Forgot Username?</a>
              <a href="/support" className="text-bank-dark underline underline-offset-2 hover:text-bank-mid">Forgot Password?</a>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="font-bold text-bank-dark text-base mb-1">New to Online Banking?</p>
              <p className="text-sm text-gray-600">
                <Link to="/apply" onClick={onClose} className="text-bank-dark underline underline-offset-2 hover:text-bank-mid font-semibold">Enroll Now</Link>
                {' '}or{' '}
                <Link to="/open-account" onClick={onClose} className="text-bank-dark underline underline-offset-2 hover:text-bank-mid font-semibold">Learn More</Link>
              </p>
            </div>
          </form>
        )}

        {/* ── Commercial ── */}
        {tab === 1 && (
          <div className="flex flex-col gap-4">
            <FdicBadge />
            <h2 className="text-xl font-bold text-bank-dark -mt-1">Log into Business Online</h2>
            <FloatInput id="companyId" label="Company ID" value={form.companyId} onChange={set('companyId')} />
            <FloatInput
              id="userId" label="User ID" value={form.userId} onChange={set('userId')}
              suffix={eyeBtn(false, () => {})}
            />
            <FloatInput
              id="bizPass" label="Password" type={showBizPass ? 'text' : 'password'}
              value={form.bizPass} onChange={set('bizPass')}
              suffix={eyeBtn(showBizPass, setShowBizPass)}
            />
            <button className="flex items-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold py-3 px-6 rounded-full transition-colors w-fit">
              <Lock size={15} /> Log In
            </button>
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <div>
                <p className="font-bold text-bank-dark text-base mb-0.5">New to Business Online?</p>
                <a href="/business" className="text-sm text-bank-dark underline underline-offset-2 hover:text-bank-mid font-semibold">Learn More</a>
              </div>
              <div>
                <p className="font-bold text-bank-dark text-base mb-1">Forgot password</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Please contact your Company Administrator to reset your password if you continue to have problems logging in.
                  Your Company Administrator is the only individual able to reset your password.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Other ── */}
        {tab === 2 && (
          <div>
            <h2 className="text-xl font-bold text-bank-dark mb-4">Access Other Services</h2>
            <ul className="flex flex-col gap-2.5">
              {OTHER_SERVICES.map((s) => (
                <li key={s}>
                  <a href="#" className="text-sm font-semibold text-bank-dark hover:text-bank-mid transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar({ overlay = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');
  const [openMenu, setOpenMenu]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef(null);
  const closeTimer = useRef(null);
  const overlayGuest = overlay && !user;

  const closeMobileMenu = useCallback(() => {
    setMobileCategory(null);
    setMobileOpen(false);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Close login dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (loginOpen && loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [loginOpen]);

  const openCat    = (cat) => { clearTimeout(closeTimer.current); setOpenMenu(cat); };
  const startClose = ()    => { closeTimer.current = setTimeout(() => setOpenMenu(null), 130); };
  const cancelClose = ()   => clearTimeout(closeTimer.current);

  // Global keyboard shortcut: / or Ctrl+K opens search
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !e.target.matches('input,textarea,select')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!mobileOpen) setMobileCategory(null);
  }, [mobileOpen]);

  return (
    <header className={overlayGuest ? 'absolute top-0 left-0 right-0 z-50 bg-transparent' : 'sticky top-0 z-50 bg-bank-dark'}>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* ── Top utility bar ── */}
      <div className={overlayGuest ? 'border-b border-white/10 bg-bank-dark' : 'border-b border-white/10'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/60 border border-white/30 px-1.5 py-0.5 rounded-sm tracking-wide">FDIC</span>
            <span className="text-[10px] sm:text-[11px] text-white/70 leading-tight">
              FDIC-Insured — Backed by the full faith and credit of the U.S. Government
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { lbl: 'About Hunch',     href: '/about' },
              { lbl: 'Find a Branch',   href: '/locations' },
              { lbl: 'Customer Service', href: '/support' },
            ].map(({ lbl, href }) => (
              <Link key={lbl} to={href} className="text-[11px] text-white/70 hover:text-white transition-colors">{lbl}</Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main nav row ── */}
      <div>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center">

          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LogoMark />
            <span className="text-white font-bold text-base sm:text-xl tracking-tight">
              Hunch Bank
            </span>
          </Link>

          {/* Center – Personal / Business (guest) OR app links (logged in) */}
          {!user ? (
            <div className="hidden md:flex flex-1 justify-center items-stretch self-stretch">
              {['Personal', 'Business'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-white border-[#4ade80]'
                      : 'text-white/60 border-transparent hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center gap-6">
              <Link to="/dashboard" className="text-white/80 hover:text-white flex items-center gap-1.5 text-sm transition-colors"><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/transfer"  className="text-white/80 hover:text-white flex items-center gap-1.5 text-sm transition-colors"><ArrowLeftRight size={15} /> Transfer</Link>
              <Link to="/withdraw"  className="text-white/80 hover:text-white flex items-center gap-1.5 text-sm transition-colors"><MinusCircle size={15} /> Withdraw</Link>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {user ? (
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-red-400 transition-colors">
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-5">
                {/* Login dropdown trigger */}
                <div className="relative" ref={loginRef}>
                  <div className="flex items-center gap-4">
                    <Link
                      to="/open-account"
                      className="text-white text-sm font-semibold underline underline-offset-4 hover:text-white/80 transition-colors"
                    >
                      Open an account
                    </Link>
                    <button
                      onClick={() => setLoginOpen((v) => !v)}
                      className={`text-sm font-bold px-9 py-4 rounded-[20px] border transition-colors ${
                        loginOpen
                          ? 'bg-[#8fdb46] text-bank-dark border-[#8fdb46]'
                          : 'bg-[#8fdb46] text-bank-dark border-[#8fdb46] hover:brightness-105'
                      }`}
                    >
                      Login
                    </button>
                  </div>
                  {loginOpen && <LoginDropdown onClose={() => setLoginOpen(false)} />}
                </div>
              </div>
            )}
            {!user && (
              <Link
                to="/login"
                className="md:hidden bg-[#8fdb46] hover:brightness-105 text-bank-dark text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}
            <button
              className="md:hidden text-white p-1"
              onClick={() => {
                if (mobileOpen) {
                  closeMobileMenu();
                  return;
                }
                setMobileOpen(true);
              }}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category nav + mega-menu (guest desktop) ── */}
      {!user && (
        <div className={overlayGuest ? 'relative hidden md:block' : 'relative hidden md:block'} onMouseLeave={startClose}>
          <div className={overlayGuest ? '' : 'border-t border-white/10'}>
            <div className="flex justify-center gap-1 h-11 items-center">
              {NAV_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onMouseEnter={() => openCat(cat)}
                  onClick={() => { navigate(CATEGORY_ROUTES[cat]); setOpenMenu(null); }}
                  className={`px-4 h-8 text-sm font-medium rounded-full transition-all ${
                    openMenu === cat
                      ? 'bg-white/10 text-white ring-1 ring-white/30'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Mega-menu panel */}
          {openMenu && (
            <div
              className="absolute top-full left-0 right-0 z-50 flex justify-center px-6 pt-1 pb-6"
              onMouseEnter={cancelClose}
            >
              <div className="w-full max-w-[960px]">
                <MegaPanel cat={openMenu} isPersonal={activeTab === 'Personal'} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-bank-dark px-5 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-4 min-h-[calc(100vh-104px)] overflow-y-auto">
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu} className="text-white/80 text-sm flex items-center gap-2"><LayoutDashboard size={15}/>Dashboard</Link>
              <Link to="/transfer"  onClick={closeMobileMenu} className="text-white/80 text-sm flex items-center gap-2"><ArrowLeftRight size={15}/>Transfer</Link>
              <Link to="/withdraw"  onClick={closeMobileMenu} className="text-white/80 text-sm flex items-center gap-2"><MinusCircle size={15}/>Withdraw</Link>
              <button onClick={handleLogout} className="text-white/70 text-sm text-left flex items-center gap-2"><LogOut size={15}/>Sign out</button>
            </>
          ) : (
            <>
              {!mobileCategory ? (
                <>
                  <MobileLoginTypeControl
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogin={closeMobileMenu}
                  />

                  <div className="flex flex-col gap-1 pt-1">
                    {NAV_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMobileCategory(cat)}
                        className="w-full py-2 text-left text-[clamp(2.5rem,12vw,3.15rem)] leading-[0.95] font-serif text-white flex items-center justify-between gap-3"
                      >
                        <span>{cat}</span>
                        <ChevronRight size={28} className="text-white/90 shrink-0" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/20 flex flex-col gap-4">
                    {MOBILE_FOOTER_LINKS.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        onClick={closeMobileMenu}
                        className="text-white text-[18px] font-medium"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>

                  <Link
                    to="/open-account"
                    onClick={closeMobileMenu}
                    className="pt-4 text-white text-[clamp(2.2rem,11vw,2.8rem)] leading-[0.95] font-bold underline underline-offset-4"
                  >
                    Open an account
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMobileCategory(null)}
                      className="text-white/90 hover:text-white transition-colors"
                      aria-label="Back"
                    >
                      <ChevronRight size={24} className="rotate-180" />
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className="text-white/90 hover:text-white transition-colors"
                        aria-label="Search"
                      >
                        <Search size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={closeMobileMenu}
                        className="text-white/90 hover:text-white transition-colors"
                        aria-label="Close menu"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <MobileLoginTypeControl
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onLogin={closeMobileMenu}
                  />

                  {activeTab === 'Business' ? (
                    <div className="space-y-4 pt-2">
                      {BUSINESS_CARDS.map((card) => (
                        <article
                          key={card.title}
                          className="bg-[#055f64] rounded-2xl px-5 py-5 border border-white/10"
                        >
                          <p className="text-[#8fdb46] text-[16px] tracking-wide mb-2">{card.tag}</p>
                          <h3 className="text-white font-serif text-[clamp(2.2rem,10vw,3.1rem)] leading-[0.95] mb-4 break-words">{card.title}</h3>
                          <Link
                            to={card.href}
                            onClick={closeMobileMenu}
                            className="inline-flex items-center justify-center rounded-full border-2 border-white/75 text-white text-[clamp(1.45rem,6vw,1.7rem)] font-bold px-6 py-2.5"
                          >
                            Continue
                          </Link>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-white font-serif text-[clamp(2.3rem,10.5vw,3.3rem)] leading-[0.96] pr-2">
                        Care is crafted into everything we do
                      </h3>
                      {(PERSONAL_MOBILE_OFFER_LINKS[mobileCategory] || BUSINESS_OFFER_LINKS).map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={closeMobileMenu}
                          className="group bg-[#055f64] rounded-2xl px-5 py-4 border border-white/10 flex items-center justify-between gap-3"
                        >
                          <span className="text-white text-[clamp(1.8rem,8.4vw,2.25rem)] leading-[1.03] font-serif break-words">{item.title}</span>
                          <ChevronRight size={26} className="text-white/90 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}
