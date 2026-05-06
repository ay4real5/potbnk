import { useEffect, useRef, useState } from 'react';
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
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMsgs, setAiMsgs] = useState([
    { role: 'ai', text: 'Hi, I am Hunch AI. I can help you pick the right account in seconds.' },
  ]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // Best-effort autoplay; keep muted+inline to satisfy mobile browser rules.
    const start = async () => {
      try {
        await v.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };
    start();
  }, []);

  const toggleVideoPlayback = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }
    v.pause();
    setIsPlaying(false);
  };

  const answerAi = (q) => {
    const lq = q.toLowerCase();
    if (lq.includes('checking')) return 'For everyday spending, Checking Accounts are best. If you run a company, Business Checking is a stronger fit.';
    if (lq.includes('loan')) return 'For financing, choose Mortgage/Auto/Personal Loans from Borrow, or Business Loans if this is for your company.';
    if (lq.includes('save') || lq.includes('savings')) return 'Savings Accounts are best for short-to-mid goals. For long-term growth, pair with investing guidance.';
    if (lq.includes('business')) return 'For business needs, start with Business Checking, then add Treasury and Lending as you scale.';
    return 'I can help with checking, savings, loans, business banking, and opening an account.';
  };

  const sendAi = (preset) => {
    const q = (preset || aiInput).trim();
    if (!q) return;
    setAiMsgs((m) => [...m, { role: 'user', text: q }]);
    setAiInput('');
    setTimeout(() => {
      setAiMsgs((m) => [...m, { role: 'ai', text: answerAi(q) }]);
    }, 260);
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar overlay />

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
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        >
          <source src="/hero-loop.mp4" type="video/mp4" />
          <source
            src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-bank-dark/50" />

        {/* Content — vertically & horizontally centered */}
        <div className="relative z-10 flex flex-col items-center text-center gap-3 px-4 pt-20 sm:pt-24 md:pt-28">
          {/* Curved WELCOME wordmark */}
          <div className="w-[min(76vw,700px)] max-w-[700px]">
            <svg viewBox="0 0 900 280" className="w-full h-auto" aria-hidden="true">
              <defs>
                <path id="welcome-arc" d="M120 208 Q450 72 780 208" />
              </defs>
              <text
                fill="#8fdb46"
                fontSize="102"
                fontWeight="700"
                fontStyle="italic"
                letterSpacing="6"
                style={{ textShadow: '0 10px 30px rgba(143,219,70,0.25)' }}
              >
                <textPath href="#welcome-arc" startOffset="50%" textAnchor="middle">
                  WELCOME
                </textPath>
              </text>
            </svg>
          </div>

          <p className="text-white text-[11px] font-semibold uppercase tracking-[0.22em] mt-1" style={{ color: '#ffffff' }}>
            WELCOME TO HUNCH BANK
          </p>

          <p className="text-white text-[15px] sm:text-[18px] lg:text-[27px] max-w-[1040px] leading-[1.3] text-center px-2 font-medium mt-1" style={{ color: '#ffffff' }}>
            Hunch Bank is more than checking, more than savings, more than lending.
            <br className="hidden md:block" />
            It&apos;s people who understand where you&apos;re coming from, with the know-how to get you where you want to be.
          </p>

          <Link
            to="/open-account"
            className="mt-4 bg-[#8fdb46] hover:brightness-105 text-bank-dark font-bold px-7 sm:px-8 py-2.5 rounded-full transition-colors text-[15px] sm:text-[16px] leading-none"
          >
            Open an Account Online
          </Link>
        </div>

        {/* Video playback control */}
        <button
          type="button"
          onClick={toggleVideoPlayback}
          aria-label={isPlaying ? 'Pause background video' : 'Play background video'}
          className="absolute right-4 bottom-4 z-20 w-11 h-11 rounded-full border border-white/40 bg-black/35 text-white text-lg font-bold backdrop-blur-sm hover:bg-black/55 transition-colors"
        >
          {isPlaying ? '||' : '▶'}
        </button>
      </section>

      {/* ── Crafted products rail ── */}
      <section id="products" className="bg-[#014745] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-left sm:text-center text-2xl sm:text-4xl lg:text-5xl font-medium text-white mb-3 font-serif leading-[1.1]">
            Care is crafted into everything we do
          </h2>
          <p className="text-left sm:text-center text-white/75 mb-8 sm:mb-10 max-w-2xl sm:mx-auto text-base sm:text-lg">
            Financial products tailored for how we live, build, protect, and grow together.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.slice(0, 8).map((item) => (
              <Link
                to={item.href}
                key={item.name}
                className="group bg-[#055f64] hover:bg-[#0a6b71] rounded-2xl px-4 py-4 sm:p-5 transition-all border border-white/10 hover:border-white/30 flex items-start justify-between gap-3 min-h-[92px] sm:min-h-[120px]"
              >
                <div>
                  <p className="text-white text-lg sm:text-2xl font-serif leading-tight break-words">
                    {item.name}
                  </p>
                </div>
                <span className="text-white/85 text-3xl sm:text-2xl leading-none group-hover:translate-x-1 transition-transform">›</span>
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
            <h2 className="text-xl sm:text-3xl font-bold text-bank-dark mb-5 leading-snug">
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
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark text-center mb-3">
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
          <h2 className="text-xl sm:text-3xl font-bold text-white text-center mb-3">
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

      {/* ── Landing AI assistant ── */}
      <button
        type="button"
        onClick={() => setAiOpen((o) => !o)}
        className="fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full border border-white/80 bg-gradient-to-br from-[#8fdb46] to-[#3f7f2f] text-white shadow-xl hover:brightness-105 transition-all flex items-center justify-center"
        aria-label="Toggle Hunch AI"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H6l-3 3v-7a8 8 0 1 1 18-4z" />
          <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {aiOpen && (
        <div className="fixed right-4 bottom-20 z-40 w-[calc(100vw-2rem)] max-w-sm h-[430px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#072e2d] text-white">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm font-semibold">Hunch AI Assistant</p>
            <button type="button" onClick={() => setAiOpen(false)} className="text-white/60 hover:text-white">×</button>
          </div>
          <div className="h-[320px] overflow-y-auto px-3 py-3 space-y-2">
            {aiMsgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#8fdb46] text-bank-dark' : 'bg-white/10 text-white/85'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div className="pt-1 flex gap-1.5 flex-wrap">
              {['Best checking option', 'Need a business account', 'Which loan should I choose?'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => sendAi(chip)}
                  className="text-[10px] px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
          <div className="px-3 py-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendAi(); }}
              placeholder="Ask about accounts, loans, business…"
              className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-xs focus:outline-none focus:border-white/30"
            />
            <button type="button" onClick={() => sendAi()} className="px-3 rounded-xl bg-[#8fdb46] text-bank-dark text-xs font-semibold">
              Send
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
