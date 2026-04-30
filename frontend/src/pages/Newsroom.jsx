import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Calendar, ArrowRight, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Company News', 'Products', 'Economy', 'Community', 'Awards'];

const PRESS_RELEASES = [
  {
    id: 1,
    category: 'Products',
    date: 'April 21, 2026',
    title: 'Hunch Launches No-Fee High-Yield Savings Account with 4.75% APY',
    excerpt: 'The new account offers customers one of the highest savings rates available with no minimum balance requirements, furthering Hunch\'s commitment to transparent, customer-first banking.',
    featured: true,
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
  },
  {
    id: 2,
    category: 'Company News',
    date: 'April 14, 2026',
    title: 'Hunch Bank Surpasses $2 Billion in Total Deposits',
    excerpt: 'Driven by strong consumer growth and expanded digital banking offerings, Hunch reached a new milestone just three years after launching its full product suite.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  },
  {
    id: 3,
    category: 'Awards',
    date: 'March 30, 2026',
    title: 'Hunch Named One of America\'s Best Banks for 2026 by Forbes',
    excerpt: 'Forbes recognized Hunch for outstanding customer service, digital innovation, and transparent fee structures — ranking us in the top 10 community banks nationwide.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
  },
  {
    id: 4,
    category: 'Community',
    date: 'March 18, 2026',
    title: 'Hunch Foundation Commits $5M to Financial Literacy Programs Across Ohio',
    excerpt: 'The Hunch Foundation today announced a multi-year grant to fund K-12 and adult financial education programs in underserved communities across central and southeastern Ohio.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  },
  {
    id: 5,
    category: 'Products',
    date: 'February 27, 2026',
    title: 'Hunch Rewards Visa® Card Arrives with 2% Unlimited Cash Back',
    excerpt: 'The new Hunch Rewards Visa® offers unlimited 2% cash back on every purchase with no annual fee — making it one of the simplest and most rewarding cards on the market.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  },
  {
    id: 6,
    category: 'Economy',
    date: 'February 10, 2026',
    title: 'Hunch Chief Economist Weighs In on Fed Rate Decision',
    excerpt: 'Dr. Maya Torres, Hunch\'s Chief Economist, shares her analysis of the Federal Reserve\'s latest decision and what it means for savers, borrowers, and the broader economy.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
  },
  {
    id: 7,
    category: 'Company News',
    date: 'January 22, 2026',
    title: 'Hunch Expands to 50 Branch Locations Across the Midwest',
    excerpt: 'With the opening of new branches in Detroit and Indianapolis, Hunch now operates 50 physical locations — while continuing to invest in its award-winning digital experience.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  {
    id: 8,
    category: 'Awards',
    date: 'January 8, 2026',
    title: 'Hunch Mobile App Earns 4.9 Stars and Best-in-Class Rating from J.D. Power',
    excerpt: 'For the second consecutive year, Hunch has received J.D. Power\'s highest digital banking satisfaction score among retail banks under $10 billion in assets.',
    featured: false,
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  },
];

const MEDIA_CONTACTS = [
  { name: 'Sarah Jennings', title: 'VP, Corporate Communications', email: 'media@hunchbank.com', phone: '(614) 555-0182' },
  { name: 'Marcus Reid', title: 'Senior PR Manager', email: 'press@hunchbank.com', phone: '(614) 555-0193' },
];

export default function Newsroom() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? PRESS_RELEASES
    : PRESS_RELEASES.filter((p) => p.category === activeCategory);

  const featured = PRESS_RELEASES.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured || activeCategory !== 'All');

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_bottom_left,_#4ade80,_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Newsroom</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Hunch in the news
          </h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
            Press releases, media coverage, and announcements from Hunch Financial, Inc.
          </p>
        </div>
      </section>

      {/* Featured story */}
      {activeCategory === 'All' && featured && (
        <section className="bg-white border-b border-gray-100 py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-bank-accent mb-6">Featured Story</p>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <img
                src={featured.img}
                alt=""
                className="rounded-2xl w-full h-64 object-cover shadow-md"
              />
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={10} /> {featured.date}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-bank-dark mb-4 leading-snug">{featured.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold px-6 py-2.5 rounded-full transition-colors text-sm"
                >
                  Read Full Story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter + articles */}
      <section className="bg-bank-surface py-14 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-bank-dark text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-bank-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rest.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="overflow-hidden h-40">
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-bank-dark text-sm leading-snug mb-2 group-hover:text-bank-mid transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">{item.excerpt}</p>
                  <Link to="/learn" className="text-xs font-semibold text-bank-accent hover:underline inline-flex items-center gap-1">
                    Read more <ArrowRight size={11} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Media contacts */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-bank-dark mb-2">Media contacts</h2>
          <p className="text-gray-500 text-sm mb-8">Journalists and media professionals may reach us at any time.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {MEDIA_CONTACTS.map((c) => (
              <div key={c.name} className="border border-gray-200 rounded-2xl p-6">
                <p className="font-bold text-bank-dark">{c.name}</p>
                <p className="text-gray-400 text-xs mb-3">{c.title}</p>
                <a href={`mailto:${c.email}`} className="text-bank-accent text-sm hover:underline block mb-1">{c.email}</a>
                <p className="text-gray-500 text-sm">{c.phone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
