import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Users, Heart, Award, MapPin } from 'lucide-react';

const values = [
  { icon: Users, title: 'People first', desc: 'Every product decision starts with one question: does this make banking better for the person using it?' },
  { icon: Heart, title: 'Genuine care', desc: 'We invest in communities we serve — not just because it\'s the right thing to do, but because strong communities build strong customers.' },
  { icon: Award, title: 'Earned trust', desc: 'Trust isn\'t claimed, it\'s built over years of showing up, following through, and doing right by people when it counts.' },
  { icon: MapPin, title: 'Rooted locally', desc: 'We\'re a national bank that acts like a local one — with bankers who understand your neighborhood, not just your credit score.' },
];

const leaders = [
  { name: 'Alexandra Monroe', title: 'Chief Executive Officer', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80' },
  { name: 'David Osei-Bonsu', title: 'Chief Financial Officer', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { name: 'Priya Patel', title: 'Chief Technology Officer', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80' },
  { name: 'Marcus Thiel', title: 'Chief Risk Officer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
];

const milestones = [
  { year: '1994', event: 'Hunch Financial founded in Columbus, Ohio with a single branch and a clear mission.' },
  { year: '2001', event: 'Launched online banking — among the first community banks to do so.' },
  { year: '2008', event: 'Navigated the financial crisis without a government bailout. Customers took notice.' },
  { year: '2014', event: 'Crossed $10B in assets. Expanded into 12 new states.' },
  { year: '2019', event: 'Launched the Hunch mobile app — rated #1 banking app for two consecutive years.' },
  { year: '2024', event: 'Surpassed $50B in managed assets. Named to Fortune\'s Most Admired Companies list.' },
];

export default function About() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative bg-bank-dark py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-4">About Hunch</p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight mb-6 leading-none">
            Banking that<br />
            <span className="text-[#4ade80]">puts you first.</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-base leading-relaxed">
            We started Hunch with a simple belief: banking should help people build better lives, not just bigger balance sheets. Thirty years later, that belief still drives every decision we make.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
            alt="Hunch team collaborating"
            className="rounded-2xl w-full object-cover h-80 shadow-lg"
          />
          <div>
            <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest mb-3">Our Mission</p>
            <h2 className="text-3xl font-bold text-bank-dark mb-5 leading-snug">
              Banking that understands where you're going
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              Too many financial institutions see customers as accounts — numbers on a ledger. At Hunch, we see people. People saving for a down payment, people building businesses from scratch, people navigating a loved one's estate.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our job is to understand your situation and put the right tools, guidance, and people in your corner. Not just once — but throughout your entire financial journey.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest text-center mb-3">What We Stand For</p>
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-12">Our values shape everything we do</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100">
                <Icon size={24} className="text-[#4ade80] mb-4" strokeWidth={1.5} />
                <h3 className="font-bold text-bank-dark text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest text-center mb-3">Our Story</p>
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-12">Thirty years of building trust</h2>
          <div className="relative">
            <div className="absolute left-12 top-0 bottom-0 w-px bg-gray-200 md:left-1/2" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`flex items-start gap-6 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="shrink-0 w-24 text-right md:w-1/2 md:text-right pr-6">
                    <span className="font-black text-[#4ade80] text-xl">{m.year}</span>
                  </div>
                  <div className="bg-bank-surface border border-gray-100 rounded-xl p-5 flex-1 md:max-w-sm">
                    <p className="text-gray-600 text-sm leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest text-center mb-3">Leadership</p>
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-12">The people behind Hunch</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {leaders.map((l) => (
              <div key={l.name} className="text-center group cursor-pointer">
                <div className="rounded-2xl overflow-hidden mb-4 h-52">
                  <img
                    src={l.img}
                    alt={l.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="font-bold text-bank-dark text-sm">{l.name}</p>
                <p className="text-gray-400 text-xs mt-1">{l.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Community Impact</p>
        <h2 className="text-3xl font-bold text-white mb-5">Investing in the communities we serve</h2>
        <p className="text-white/60 text-sm mb-10 max-w-lg mx-auto">
          In 2025, Hunch committed $500M in Community Reinvestment Act lending, supported 1,200 small businesses through our local grants program, and volunteered 40,000+ hours across our markets.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mb-10">
          {[
            { value: '$500M', label: 'CRA lending commitment' },
            { value: '1,200+', label: 'Small businesses supported' },
            { value: '40K hrs', label: 'Community volunteer hours' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-[#4ade80] mb-1">{s.value}</p>
              <p className="text-white/50 text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
        <Link to="/contact" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-10 py-3 rounded-full transition-colors text-sm inline-block">
          Learn About Our Community Efforts
        </Link>
      </section>
    </PageShell>
  );
}
