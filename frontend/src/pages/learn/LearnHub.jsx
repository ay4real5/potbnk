import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { BookOpen, TrendingUp, Home, DollarSign, CreditCard, Briefcase, Search } from 'lucide-react';
import { useState } from 'react';

const topics = [
  { label: 'All', icon: BookOpen },
  { label: 'Savings', icon: DollarSign },
  { label: 'Investing', icon: TrendingUp },
  { label: 'Home Buying', icon: Home },
  { label: 'Credit', icon: CreditCard },
  { label: 'Business', icon: Briefcase },
];

const articles = [
  {
    title: 'Why automating your finances may be your secret weapon',
    tag: 'Savings',
    excerpt: 'Setting up automatic transfers removes willpower from the equation — the single best change most people can make to build wealth consistently.',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
    readTime: '5 min read',
    href: '/learn/automating-finances',
  },
  {
    title: 'How to build a strong credit score from scratch',
    tag: 'Credit',
    excerpt: 'Starting from zero doesn\'t mean starting from behind. These practical steps help you build a solid credit history faster than you might expect.',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    readTime: '7 min read',
    href: '/learn/build-credit',
  },
  {
    title: 'Investing for beginners: a plain-language guide',
    tag: 'Investing',
    excerpt: 'You don\'t need to be wealthy to start investing. This guide covers index funds, IRAs, and the compounding math that makes starting early so powerful.',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    readTime: '9 min read',
    href: '/learn/investing-basics',
  },
  {
    title: 'What the latest inflation report means for your savings',
    tag: 'Savings',
    excerpt: 'Inflation erodes the purchasing power of cash. Here\'s how to ensure your savings account is at least keeping pace with rising prices.',
    img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&q=80',
    readTime: '4 min read',
    href: '/learn/inflation-savings',
  },
  {
    title: 'Hidden costs to budget for when buying a home',
    tag: 'Home Buying',
    excerpt: 'The purchase price is just the beginning. Closing costs, inspections, repairs, and moving expenses can add tens of thousands to the true cost.',
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    readTime: '8 min read',
    href: '/learn/home-buying-costs',
  },
  {
    title: 'Small business financing: what are your real options?',
    tag: 'Business',
    excerpt: 'SBA loans, lines of credit, equipment financing, and invoice factoring — each option has trade-offs. This guide helps you choose the right fit.',
    img: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&q=80',
    readTime: '11 min read',
    href: '/learn/small-business-financing',
  },
  {
    title: 'The 50/30/20 budget rule: does it actually work?',
    tag: 'Savings',
    excerpt: 'The popular budgeting framework is simple, but is it right for everyone? We look at when it works, when it doesn\'t, and how to adapt it.',
    img: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&q=80',
    readTime: '6 min read',
    href: '/learn/budget-rule',
  },
  {
    title: 'Understanding your credit report: a practical walkthrough',
    tag: 'Credit',
    excerpt: 'Most people have never actually read their credit report. This step-by-step breakdown shows you what to look for and what to dispute.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
    readTime: '10 min read',
    href: '/learn/credit-report',
  },
];

const featuredInsights = [
  { title: 'FIRE: Get help retiring early', tag: 'Investing', href: '/learn/fire-movement' },
  { title: 'Micro-investing: small steps, big goals', tag: 'Investing', href: '/learn/micro-investing' },
  { title: 'Preparing for retirement at any age', tag: 'Retirement', href: '/learn/retirement-prep' },
  { title: 'The importance of an emergency fund', tag: 'Savings', href: '/learn/emergency-fund' },
  { title: 'Estate planning essentials', tag: 'Planning', href: '/learn/estate-planning' },
  { title: 'Cybersecurity best practices for your finances', tag: 'Security', href: '/learn/cybersecurity' },
];

export default function LearnHub() {
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = articles.filter((a) => {
    const matchTag = activeTag === 'All' || a.tag === activeTag;
    const matchQuery = a.title.toLowerCase().includes(query.toLowerCase()) || a.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchTag && matchQuery;
  });

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Hunch Learn</p>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Knowledge that<br />
          <span className="text-[#4ade80]">moves you forward.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          Financial clarity isn't a privilege — it's a skill. Our guides, articles, and resources help you make better decisions at every stage of life.
        </p>
        {/* Search bar */}
        <div className="max-w-lg mx-auto relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, guides, and resources..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
      </section>

      {/* Topic filters */}
      <section className="bg-bank-surface border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {topics.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTag(label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTag === label
                  ? 'bg-bank-dark text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-bank-dark hover:text-bank-dark'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Article grid */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No articles found for your search.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => (
                <Link
                  key={a.title}
                  to={a.href}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="overflow-hidden h-44">
                    <img
                      src={a.img}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                        {a.tag}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{a.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-bank-dark leading-snug text-sm mb-3 group-hover:text-bank-accent transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{a.excerpt}</p>
                    <p className="text-bank-accent text-xs font-semibold mt-4 group-hover:underline">Read article →</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick insights */}
      <section className="bg-bank-surface py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-bank-dark mb-6">More from the Hunch newsroom</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featuredInsights.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group block"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                  {item.tag}
                </span>
                <p className="text-sm font-semibold text-bank-dark mt-3 leading-snug group-hover:text-bank-accent transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-bank-accent font-semibold mt-3 group-hover:underline">Read more →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Stay informed with Hunch Insights</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          Monthly financial tips, market updates, and practical guidance — delivered straight to your inbox.
        </p>
        <form className="max-w-sm mx-auto flex gap-3" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 px-4 py-2.5 rounded-full text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#4ade80]"
          />
          <button
            type="submit"
            className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-5 py-2.5 rounded-full transition-colors text-sm whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </section>
    </PageShell>
  );
}
