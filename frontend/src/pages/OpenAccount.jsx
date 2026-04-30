import { useState } from 'react';
import { Link } from 'react-router-dom';

function OpenAccountShell({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 22 24" fill="none" aria-hidden="true">
              <path d="M17.6 3.6L15.1 2.2V10.2L7.6 14.6V22.5L10.1 24V16L15.1 13.1V21.8L17.6 20.4V3.6Z" fill="#012d2a"/>
              <path d="M11.3 24L13.9 22.5V15.3L11.3 16.8V24Z" fill="#012d2a"/>
              <path d="M10.1 0L7.6 1.4V8.8L10.1 7.3V0Z" fill="#012d2a"/>
              <path d="M2.5 19.6V4.4L0.4 5.6C0.2 5.7 0 6 0 6.3V17.7C0 18 0.2 18.3 0.4 18.4L2.5 19.6Z" fill="#012d2a"/>
              <path d="M3.8 3.6V20.4L6.3 21.8V13.9L13.9 9.5V1.4L11.3 0V8.1L6.3 11V2.2L3.8 3.6Z" fill="#012d2a"/>
              <path d="M21.4 17.7V6.3C21.4 6 21.3 5.7 21 5.6L18.9 4.4V19.6L21 18.4C21.3 18.3 21.4 18 21.4 17.7Z" fill="#012d2a"/>
            </svg>
            <span className="font-bold text-lg text-bank-dark">
              Hunch<span className="text-[#4ade80]">.</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-bank-dark transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Hunch
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Slim FDIC footer */}
      <div className="bg-bank-dark py-5 px-6">
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} Hunch Financial, Inc.&nbsp;·&nbsp;Member FDIC&nbsp;·&nbsp;Demo Application
        </p>
      </div>
    </div>
  );
}

// ── Product data ──────────────────────────────────────────────────────────────
const SEGMENTS = ['Personal', 'Business', 'Loans'];

const PRODUCTS = {
  Personal: {
    tabs: ['Checking', 'Savings', 'Credit Card'],
    Checking: [
      {
        id: 'everyday-checking',
        name: 'Everyday Checking®',
        tagline: 'Free to open and free to maintain.',
        bullets: [
          'No monthly service fees, ever',
          'Hunch Relationship Savings account available with no monthly service fee',
          'Free debit card & mobile check deposit',
          'Zelle® included',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '$0', label: 'Monthly maintenance fee' },
        badge: 'Most Popular',
      },
      {
        id: 'perks-checking',
        name: 'Hunch Perks Checking®',
        tagline: 'Your checking deposits earn interest.',
        bullets: [
          'Five free non-Hunch ATM withdrawals per statement cycle',
          'Credit score monitoring with alerts and insights',
          'Relationship rates on savings and money market accounts',
          'ID theft protection included',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '$0 or $10', label: 'Monthly maintenance fee', note: 'Fee waived with $1,000 in total monthly deposits, or $5,000 in total relationship balances' },
      },
      {
        id: 'platinum-checking',
        name: 'Hunch Platinum Perks Checking®',
        tagline: 'Your checking deposits earn interest.',
        bullets: [
          'Unlimited free non-Hunch ATM withdrawals per statement cycle',
          'Unlimited free checks',
          'Round-the-clock identity monitoring',
          'Discounts on mortgages and home equity lines of credit',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '$0 or $25', label: 'Monthly maintenance fee', note: 'Fee waived with $25,000 in total relationship balances' },
      },
    ],
    Savings: [
      {
        id: 'high-yield-savings',
        name: 'High-Yield Savings',
        tagline: 'Earn more on every dollar you save.',
        bullets: [
          'Up to 4.75% APY — no minimums required',
          'FDIC insured up to $250,000',
          'Automated savings goals',
          'No withdrawal penalty fees',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '4.75%', label: 'APY earned' },
      },
      {
        id: 'certificate-of-deposit',
        name: 'Certificate of Deposit (CD)',
        tagline: 'Lock in a guaranteed rate for a set term.',
        bullets: [
          '3-month to 5-year terms available',
          'Rates up to 5.10% APY',
          'As low as $500 to open',
          'Auto-renew option at maturity',
        ],
        stat1: { value: '$500', label: 'Minimum to open' },
        stat2: { value: '5.10%', label: 'APY (top rate)' },
      },
    ],
    'Credit Card': [
      {
        id: 'rewards-card',
        name: 'Hunch Rewards Visa®',
        tagline: 'Unlimited cash back on every purchase.',
        bullets: [
          'Unlimited 2% cash back everywhere',
          'No annual fee',
          '$200 welcome bonus after $500 spend in first 3 months',
          'Zero fraud liability protection',
        ],
        stat1: { value: '2%', label: 'Cash back, unlimited' },
        stat2: { value: '$0', label: 'Annual fee' },
        badge: 'New',
      },
    ],
  },
  Business: {
    tabs: ['Checking', 'Savings'],
    Checking: [
      {
        id: 'business-checking',
        name: 'Business Checking',
        tagline: 'Everything your business needs, nothing it doesn\'t.',
        bullets: [
          'Unlimited transactions with no per-item fees',
          'Multi-user access with role-based permissions',
          'Free ACH transfers and bill pay',
          'Business debit card included',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '$0', label: 'Monthly maintenance fee' },
      },
    ],
    Savings: [
      {
        id: 'business-savings',
        name: 'Business Savings',
        tagline: 'Put your reserves to work.',
        bullets: [
          'Competitive interest on business deposits',
          'Linked to your Business Checking for easy transfers',
          'FDIC insured up to $250,000',
          'No minimum balance required',
        ],
        stat1: { value: '$0', label: 'Minimum to open' },
        stat2: { value: '3.50%', label: 'APY earned' },
      },
    ],
  },
  Loans: {
    tabs: ['Home', 'Auto', 'Personal'],
    Home: [
      {
        id: 'mortgage',
        name: '30-Year Fixed Mortgage',
        tagline: 'Stable payments for the life of your loan.',
        bullets: [
          'Competitive fixed rates',
          'Down payments as low as 3%',
          'First-time homebuyer programs available',
          'Online application in minutes',
        ],
        stat1: { value: '6.75%', label: 'APR (example rate)' },
        stat2: { value: '3%', label: 'Min. down payment' },
      },
      {
        id: 'heloc',
        name: 'Home Equity Line of Credit',
        tagline: 'Tap your home\'s value when you need it.',
        bullets: [
          'Borrow up to 85% of your home\'s equity',
          'Variable rate tied to Prime',
          'Interest-only payments during draw period',
          'Use for renovations, tuition, or emergencies',
        ],
        stat1: { value: '85%', label: 'Max. LTV' },
        stat2: { value: '$0', label: 'Annual fee (first year)' },
      },
    ],
    Auto: [
      {
        id: 'auto-loan',
        name: 'Auto Loan',
        tagline: 'Drive away with a great rate.',
        bullets: [
          'New and used vehicles',
          'Terms from 24 to 84 months',
          'Pre-approval in minutes',
          'No prepayment penalty',
        ],
        stat1: { value: '5.99%', label: 'APR as low as' },
        stat2: { value: '$0', label: 'Application fee' },
      },
    ],
    Personal: [
      {
        id: 'personal-loan',
        name: 'Personal Loan',
        tagline: 'Fixed-rate financing for any purpose.',
        bullets: [
          'Borrow $1,000 – $50,000',
          'Fixed monthly payments, no surprises',
          'Funds deposited as fast as the same day',
          'No prepayment penalty',
        ],
        stat1: { value: '7.99%', label: 'APR as low as' },
        stat2: { value: '$0', label: 'Origination fee' },
      },
    ],
  },
};

// ── Single product row (Huntington list style) ────────────────────────────────
function ProductRow({ product, isLast }) {
  return (
    <div className={`py-8 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Left: name + bullets */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
            {product.badge && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-[#4ade80] text-bank-dark px-2.5 py-0.5 rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-4">{product.tagline}</p>
          <ul className="space-y-1.5">
            {product.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bank-accent shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <Link
            to={`/learn`}
            className="inline-block mt-4 text-xs font-semibold text-bank-accent hover:underline"
          >
            See all features &amp; fee information →
          </Link>
        </div>

        {/* Middle: stats */}
        <div className="flex lg:flex-col gap-6 lg:gap-4 lg:min-w-[240px] lg:text-center">
          <div className="flex-1 lg:flex-none">
            <p className="text-3xl font-black text-bank-accent leading-none mb-1">{product.stat1.value}</p>
            <p className="text-xs font-semibold text-gray-600">{product.stat1.label}</p>
          </div>
          <div className="flex-1 lg:flex-none">
            <p className="text-3xl font-black text-bank-accent leading-none mb-1">{product.stat2.value}</p>
            <p className="text-xs font-semibold text-gray-600">{product.stat2.label}</p>
            {product.stat2.note && (
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-[200px] lg:mx-auto">{product.stat2.note}</p>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-3 lg:min-w-[140px]">
          <Link
            to={`/apply?product=${product.id}`}
            className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-6 py-3 rounded-full text-sm transition-colors text-center whitespace-nowrap"
          >
            Apply Now
          </Link>
          <Link
            to={`/learn`}
            className="text-bank-accent hover:underline text-xs font-semibold text-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OpenAccount() {
  const [segment, setSegment] = useState('Personal');
  const [productTab, setProductTab] = useState('Checking');

  const segmentData = PRODUCTS[segment];
  const tabs = segmentData.tabs;
  // If current productTab not available in new segment, reset to first tab
  const activeTab = tabs.includes(productTab) ? productTab : tabs[0];
  const products = segmentData[activeTab] || [];

  const handleSegment = (s) => {
    setSegment(s);
    setProductTab(PRODUCTS[s].tabs[0]);
  };

  return (
    <OpenAccountShell>
      {/* ── Hero ── */}
      <section
        className="relative bg-bank-dark overflow-hidden"
        style={{ minHeight: 280 }}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#4ade80,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-end gap-8">
          <div>
            <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Open an Account</p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Open your account<br />online.
            </h1>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Choose the right checking, savings, loan, or credit card and apply in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ── Segment tabs (Personal / Business / Loans) ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[56px] z-30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {SEGMENTS.map((s) => (
              <button
                key={s}
                onClick={() => handleSegment(s)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  segment === s
                    ? 'border-bank-dark text-bank-dark'
                    : 'border-transparent text-gray-500 hover:text-bank-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product category tabs ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setProductTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t
                    ? 'border-bank-accent text-bank-accent'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product list ── */}
      <section className="bg-white py-4 px-6">
        <div className="max-w-5xl mx-auto">
          {products.map((product, i) => (
            <ProductRow key={product.id} product={product} isLast={i === products.length - 1} />
          ))}
        </div>
      </section>

      {/* ── Bottom strip ── */}
      <section className="bg-bank-surface border-t border-gray-200 py-12 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-2xl mb-3">🏦</p>
            <h3 className="font-bold text-bank-dark text-sm mb-2">Already a customer?</h3>
            <p className="text-gray-400 text-xs mb-3">Add a product from your existing online banking portal.</p>
            <Link to="/login" className="text-bank-accent text-xs font-bold hover:underline">Sign in →</Link>
          </div>
          <div className="md:border-x md:border-gray-200">
            <p className="text-2xl mb-3">💼</p>
            <h3 className="font-bold text-bank-dark text-sm mb-2">Opening for a business?</h3>
            <p className="text-gray-400 text-xs mb-3">Our business team will walk you through the right products.</p>
            <Link to="/business" className="text-bank-accent text-xs font-bold hover:underline">Business accounts →</Link>
          </div>
          <div>
            <p className="text-2xl mb-3">🤝</p>
            <h3 className="font-bold text-bank-dark text-sm mb-2">Not sure which to pick?</h3>
            <p className="text-gray-400 text-xs mb-3">Chat with a specialist or visit a branch.</p>
            <Link to="/contact" className="text-bank-accent text-xs font-bold hover:underline">Get help →</Link>
          </div>
        </div>
      </section>

      {/* ── FDIC notice ── */}
      <div className="bg-white border-t border-gray-200 py-5 px-6">
        <p className="text-xs text-gray-400 max-w-4xl mx-auto leading-relaxed">
          <strong className="text-gray-600">FDIC Member.</strong> Deposits insured up to $250,000 per depositor, per FDIC-insured bank, per ownership category. APY = Annual Percentage Yield. Rates shown are examples for illustrative purposes. Hunch is a demo application — not a real bank. No actual financial transactions take place.
        </p>
      </div>
    </OpenAccountShell>
  );
}
