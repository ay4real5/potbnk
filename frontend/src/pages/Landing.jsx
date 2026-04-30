import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ── Data sourced from product catalogue ──────────────────────────────────────
const products = [
  { name: 'Checking Accounts',  icon: '🏦', desc: 'Everyday banking with no hidden fees',       href: '/bank' },
  { name: 'Savings Accounts',   icon: '💰', desc: 'Grow your money with competitive rates',      href: '/bank' },
  { name: 'Credit Cards',       icon: '💳', desc: 'Rewards and cash back on every purchase',     href: '/bank' },
  { name: 'Mortgage Loans',     icon: '🏠', desc: 'Finance your home with confidence',           href: '/borrow' },
  { name: 'Auto Loans',         icon: '🚗', desc: 'Drive off with a great rate',                 href: '/borrow' },
  { name: 'Personal Loans',     icon: '📋', desc: 'Fund what matters most to you',               href: '/borrow' },
  { name: 'Business Checking',  icon: '🏢', desc: 'Banking built for business owners',           href: '/business' },
  { name: 'Business Loans',     icon: '💼', desc: 'Capital to fuel your growth',                 href: '/business' },
  { name: 'Commercial Banking', icon: '🏛️', desc: 'Sophisticated solutions for enterprise',     href: '/business' },
  { name: 'Wealth Management',  icon: '📈', desc: 'Expert guidance for long-term wealth',        href: '/grow' },
];

// ── Featured articles (from news catalogue) ───────────────────────────────────
const articles = [
  {
    slug: 'automating-finances',
    title: 'Why automating finances may be your secret weapon',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
    tag: 'Savings',
  },
  {
    slug: 'build-credit',
    title: 'How to build a strong credit score',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    tag: 'Credit',
  },
  {
    slug: 'investing-basics',
    title: 'Investing for beginners: A step-by-step guide',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
    tag: 'Investing',
  },
];

// ── More insights ticker ──────────────────────────────────────────────────────
const moreInsights = [
  { slug: 'inflation-savings',        title: 'Three things we learned from the latest inflation report', tag: 'Economy' },
  { slug: 'jobs-report',              title: 'What the latest jobs report means for you',               tag: 'Economy' },
  { slug: 'retirement-prep',          title: 'Planning for retirement: What you need to know',          tag: 'Retirement' },
  { slug: 'budget-rule',              title: 'Budgeting tips for a healthier financial future',         tag: 'Budgeting' },
  { slug: 'emergency-fund',           title: 'The importance of an emergency fund',                     tag: 'Savings' },
  { slug: 'student-loan-debt',        title: 'Navigating student loan debt',                            tag: 'Loans' },
  { slug: 'fraud-protection',         title: 'Protecting yourself from fraud',                          tag: 'Security' },
  { slug: 'estate-planning',          title: 'Estate planning essentials',                              tag: 'Planning' },
  { slug: 'small-business-financing', title: 'Small business financing options',                        tag: 'Business' },
  { slug: 'cybersecurity',            title: 'Cybersecurity best practices for your finances',          tag: 'Security' },
  { slug: 'credit-report',            title: 'Understanding your credit report',                        tag: 'Credit' },
  { slug: 'cryptocurrency',           title: 'Understanding cryptocurrency',                            tag: 'Investing' },
];

const contact = [
  { title: 'Ask Us Anything', body: 'Chat with our support team 24/7 for quick answers.', icon: '💬', href: '/support' },
  { title: 'Contact Support', body: 'Call, email, or message — we respond fast.', icon: '📞', href: '/contact' },
  { title: 'Find a Branch', body: 'Locate your nearest Hunch branch or ATM.', icon: '📍', href: '/locations' },
];

const features = [
  { title: 'No hidden fees', body: 'Transparent pricing with no monthly maintenance fees on checking.' },
  { title: '24/7 online access', body: 'Manage your money any time — on desktop or mobile.' },
  { title: 'FDIC insured', body: 'Your deposits are protected up to $250,000 per depositor.' },
  { title: 'Smart alerts', body: 'Get notified instantly of any account activity.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen font-sans">
      <Navbar />

      {/* ── Hero with video (full-screen) ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-bank-dark">
        {/* Animated gradient blobs — always visible, show instantly */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="hero-blob-1 absolute rounded-full opacity-25"
            style={{
              width: 900, height: 900,
              background: 'radial-gradient(circle, #00bfae 0%, transparent 65%)',
              top: '-250px', right: '-200px',
            }}
          />
          <div
            className="hero-blob-2 absolute rounded-full opacity-20"
            style={{
              width: 700, height: 700,
              background: 'radial-gradient(circle, #4ade80 0%, transparent 65%)',
              bottom: '-200px', left: '-150px',
            }}
          />
          <div
            className="hero-blob-3 absolute rounded-full opacity-15"
            style={{
              width: 500, height: 500,
              background: 'radial-gradient(circle, #024f54 0%, transparent 65%)',
              top: '40%', left: '35%',
            }}
          />
        </div>

        {/* Video background — plays over blobs when loaded */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
          <source
            src="https://videos.pexels.com/video-files/3194277/3194277-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-bank-dark/50" />

        {/* Content — vertically & horizontally centered */}
        <div className="relative z-10 flex flex-col items-center text-center gap-5 px-4">
          {/* Hexagon H logo */}
          <svg viewBox="0 0 160 180" className="w-48 h-48 mb-2 opacity-50" fill="none">
            <polygon points="80,4 152,44 152,136 80,176 8,136 8,44"  stroke="#4ade80" strokeWidth="2.5" fill="none" />
            <polygon points="80,24 136,56 136,124 80,156 24,124 24,56" stroke="#4ade80" strokeWidth="1.5" fill="none" opacity="0.5" />
            <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
              fontSize="70" fontWeight="900" fill="#4ade80" fontFamily="Inter,system-ui,sans-serif">H</text>
          </svg>

          {/* WELCOME */}
          <h1 className="text-7xl md:text-9xl font-black uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>
            WELCOME
          </h1>

          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.35em] mt-1">
            WELCOME TO HUNCH BANK
          </p>

          <p className="text-white/55 text-sm max-w-lg leading-relaxed">
            Hunch Bank is more than checking, more than savings, more than
            lending. It&apos;s people who understand where you&apos;re coming from, with
            the know-how to get you where you want to be.
          </p>

          <Link
            to="/open-account"
            className="mt-2 bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-9 py-3 rounded-full transition-colors text-sm"
          >
            Open an Account Online
          </Link>
        </div>
      </section>

      {/* ── Products grid ── */}
      <section id="products" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-3xl font-bold text-bank-dark mb-3">
            Built around what matters most
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Choose the right product for where you are in life — and where you&apos;re headed.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {products.map((item) => (
              <Link
                to={item.href}
                key={item.name}
                className="group border border-gray-200 hover:border-bank-dark rounded-xl p-5 transition-all hover:shadow-md flex flex-col items-center text-center gap-2"
              >
                <span className="text-3xl">{item.icon}</span>
                <span className="text-sm font-semibold text-bank-dark group-hover:text-bank-mid transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-gray-400 leading-snug">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature two-col ── */}
      <section className="bg-bank-surface py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-14 items-center">
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&q=80"
            alt="Two people reviewing finances together"
            className="rounded-2xl w-full object-cover h-80 shadow-lg"
          />
          <div>
            <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest mb-3">Why Hunch</p>
            <h2 className="text-3xl font-bold text-bank-dark mb-5 leading-snug">
              Shared value, thoughtfully built
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Our accounts are designed to grow with you — offering flexibility,
              real benefits, and financial tools that adapt to your journey, not
              the other way around.
            </p>
            <div className="grid grid-cols-2 gap-5">
              {features.map((f) => (
                <div key={f.title}>
                  <h4 className="font-semibold text-bank-dark text-sm mb-1">{f.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
            <Link
              to="/open-account"
              className="mt-8 inline-block bg-bank-dark hover:bg-bank-mid text-white font-semibold px-6 py-3 rounded-md transition-colors text-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Articles ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">
            Advice and guidance that helps you grow
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Financial tools, tips, and stories from the Hunch team.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                to={`/learn/${a.slug}`}
                key={a.title}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow block group"
              >
                <div className="overflow-hidden h-44">
                  <img
                    src={a.img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                    {a.tag}
                  </span>
                  <h3 className="font-semibold text-bank-dark mt-3 mb-4 leading-snug text-sm">
                    {a.title}
                  </h3>
                  <span className="text-bank-teal text-sm font-semibold group-hover:underline">
                    Read More →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── More Insights grid ── */}
      <section className="bg-bank-surface py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-bank-dark mb-6">More from our newsroom</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moreInsights.map((item) => (
              <Link
                to={`/learn/${item.slug}`}
                key={item.title}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow block group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                  {item.tag}
                </span>
                <p className="text-sm font-semibold text-bank-dark mt-3 leading-snug group-hover:text-bank-mid transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-bank-teal font-semibold mt-3 group-hover:underline">Read more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / help ── */}
      <section className="bg-bank-dark py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-3">
            We&apos;re here when you need us
          </h2>
          <p className="text-center text-white/60 mb-12">
            Real support from real people, whenever you need it.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {contact.map((c) => (
              <Link
                to={c.href}
                key={c.title}
                className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-7 transition-colors block group"
              >
                <span className="text-3xl block mb-4">{c.icon}</span>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#4ade80] transition-colors">{c.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{c.body}</p>
                <p className="text-bank-accent text-xs font-semibold mt-4 group-hover:underline">Learn more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
