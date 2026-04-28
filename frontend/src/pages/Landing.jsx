import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const products = [
  'Checking Accounts',
  'Savings Accounts',
  'Credit Cards',
  'Personal Loans',
  'Investing',
  'Retirement',
  'Insurance',
  'Business Banking',
];

const articles = [
  {
    title: 'Smart saving strategies for every stage of life',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
  },
  {
    title: 'Understanding your credit score and how to improve it',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  },
  {
    title: 'Planning your financial future with confidence',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  },
];

const contact = [
  { title: 'Ask Us Anything', body: 'Chat with our support team 24/7 for quick answers.' },
  { title: 'Contact Support', body: 'Call, email, or message — we respond fast.' },
  { title: 'Find a Branch', body: 'Locate your nearest Hunch branch or ATM.' },
];

const footerLinks = [
  { heading: 'Products', items: ['Accounts', 'Loans', 'Cards', 'Investing'] },
  { heading: 'Support', items: ['Help Center', 'Security', 'Accessibility'] },
  { heading: 'Company', items: ['About Us', 'Careers', 'Newsroom'] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bank-dark text-white font-sans">
      {/* FDIC bar */}
      <div className="bg-bank-primary text-bank-light text-xs text-center py-1.5 tracking-wide">
        Deposits insured by the Federal Deposit Insurance Corporation (FDIC) up to $250,000 per depositor.
      </div>

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1520975922323-1c8c1f0c7d8f?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center max-w-6xl mx-auto px-4 w-full">
          {/* Hero copy */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest mb-3">
              Welcome to Hunch
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5">
              Banking designed<br />around <span className="text-bank-accent">you.</span>
            </h1>
            <p className="text-gray-200 text-lg mb-7 max-w-md">
              More than checking. More than savings. Every account comes with tools
              that grow with your life.
            </p>
            <Link
              to="/register"
              className="bg-bank-accent text-black font-bold px-7 py-3 rounded-full hover:bg-green-400 transition-colors inline-block"
            >
              Open an Account — It&apos;s Free
            </Link>
          </div>

          {/* Inline sign-in panel */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-7 w-full md:w-80 shrink-0">
            <h2 className="text-lg font-bold mb-4 text-white">Sign in to Hunch</h2>
            <p className="text-sm text-gray-300 mb-4">
              Access your accounts, transfers, and more.
            </p>
            <Link
              to="/login"
              className="block w-full bg-bank-accent text-black text-center font-semibold py-2.5 rounded-lg hover:bg-green-400 transition-colors mb-3"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="block w-full text-center border border-white/30 hover:border-white/60 text-white py-2.5 rounded-lg text-sm transition-colors"
            >
              New here? Create an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Products grid ── */}
      <section className="bg-bank-dark py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-3">
            Care is built into everything we do
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Choose the right product for where you are in life — and where you&apos;re headed.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((item) => (
              <div
                key={item}
                className="bg-green-900/50 hover:bg-green-800/70 border border-green-800 rounded-xl p-5 cursor-pointer transition-colors flex items-center justify-center text-center text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature section ── */}
      <section className="bg-bank-primary py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80"
            alt="Two people reviewing finances together"
            className="rounded-2xl w-full object-cover h-80"
          />
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Shared value, thoughtfully built
            </h2>
            <p className="text-gray-200 leading-relaxed mb-6">
              Our accounts are designed to grow with you — offering flexibility,
              real benefits, and financial tools that adapt to your journey, not
              the other way around.
            </p>
            <Link
              to="/register"
              className="border border-white/50 hover:border-white text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors inline-block"
            >
              Explore Accounts
            </Link>
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="bg-bank-dark py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Advice and guidance that helps you grow
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <div key={a.title} className="bg-green-900/40 border border-green-800 rounded-2xl overflow-hidden">
                <img src={a.img} alt="" className="w-full h-44 object-cover" />
                <div className="p-5">
                  <h3 className="font-semibold mb-3 leading-snug">{a.title}</h3>
                  <button className="border border-white/30 hover:border-white/60 text-sm px-4 py-1.5 rounded-full transition-colors">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile app promo ── */}
      <section className="bg-bank-primary py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">Your bank, in your pocket</h2>
            <p className="text-gray-200 max-w-md">
              Deposit checks, pay bills, transfer funds, and monitor every
              transaction — all from the Hunch mobile app.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="bg-black border border-white/20 rounded-xl px-5 py-3 text-sm font-medium cursor-pointer hover:border-white/50 transition-colors">
              App Store
            </div>
            <div className="bg-black border border-white/20 rounded-xl px-5 py-3 text-sm font-medium cursor-pointer hover:border-white/50 transition-colors">
              Google Play
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="bg-bank-dark py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">We&apos;re here when you need us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contact.map((c) => (
              <div key={c.title} className="bg-green-900/50 border border-green-800 rounded-2xl p-7">
                <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-black text-gray-400 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">
              Hunch<span className="text-bank-accent">.</span>
            </h3>
            <p className="text-sm">Modern banking built for real life.</p>
          </div>
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold mb-3">{col.heading}</h4>
              <ul className="space-y-2 text-sm">
                {col.items.map((item) => (
                  <li key={item} className="hover:text-white cursor-pointer transition-colors">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Hunch Financial, Inc. &nbsp;·&nbsp; Member FDIC &nbsp;·&nbsp;
          Hunch is a demo application. Not a real bank.
        </div>
      </footer>
    </div>
  );
}
