import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { Building2, DollarSign, TrendingUp, CreditCard, Globe, Users, CheckCircle, ArrowRight } from 'lucide-react';

const businessProducts = [
  {
    icon: Building2,
    name: 'Business Checking',
    tagline: 'Simple, powerful, built for business',
    desc: 'An account that keeps up with your business — from petty cash to payroll. Choose from starter accounts with no monthly fees to premium accounts with unlimited transactions.',
    features: ['No minimum balance options', 'Free ACH transfers', 'Online bill pay', 'Multi-user access controls'],
    href: '/business/checking',
    cta: 'Open Business Checking',
  },
  {
    icon: DollarSign,
    name: 'Business Savings & Money Market',
    tagline: 'Put idle cash to work',
    desc: "Every dollar sitting in your operating account is a dollar not earning. Our business savings and money market accounts offer competitive rates with same-day liquidity.",
    features: ['tiered rates up to 4.20% APY', 'Same-day access', 'No lock-in periods', 'Automated sweep options'],
    href: '/business/savings',
    cta: 'View Business Savings',
  },
  {
    icon: TrendingUp,
    name: 'Business Loans & Lines of Credit',
    tagline: 'Capital when your business needs it',
    desc: 'From SBA-backed loans to revolving credit lines, we structure business financing that matches your cash flow cycle — not ours.',
    features: ['SBA 7(a) & 504 programs', 'Lines of credit from $25K', 'Equipment financing', 'Rapid decision timeline'],
    href: '/business/loans',
    cta: 'Explore Business Lending',
  },
  {
    icon: Globe,
    name: 'Treasury & Cash Management',
    tagline: 'Efficiency at every level',
    desc: 'Streamline payments, collections, and liquidity management with our full suite of treasury services — built for businesses processing $500K+ annually.',
    features: ['ACH origination & receipt', 'Positive Pay fraud control', 'Remote deposit capture', 'Sweep accounts'],
    href: '/business/treasury',
    cta: 'Explore Treasury Services',
  },
  {
    icon: CreditCard,
    name: 'Business Credit Cards',
    tagline: 'Rewards on every business dollar',
    desc: 'Earn cash back or travel points on every business purchase, set spend controls by employee, and manage everything through your business online banking portal.',
    features: ['Up to 2% unlimited cash back', 'Per-employee spending limits', 'Purchase controls', 'No annual fee option'],
    href: '/business/credit-cards',
    cta: 'Compare Business Cards',
  },
  {
    icon: Users,
    name: 'Business Online & Mobile Banking',
    tagline: 'Run your finances from anywhere',
    desc: 'Our business digital banking platform gives you and your team real-time visibility into every account, with role-based access and approval workflows built in.',
    features: ['Multi-user access tiers', 'Mobile check deposit', 'Real-time wire transfers', 'API banking integrations'],
    href: '/business/online-banking',
    cta: 'See Digital Features',
  },
];

const businessSizes = [
  {
    tag: 'STARTUP & SMALL BUSINESS',
    title: 'Starting up to scaling up',
    desc: 'From day-one checking to SBA loans, we support businesses in their earliest and most critical stages.',
    href: '/business/checking',
  },
  {
    tag: 'ESTABLISHED BUSINESS',
    title: 'Mid-market and growing',
    desc: 'Treasury management, lending, and advisory services designed for businesses with $1M–$50M in annual revenue.',
    href: '/business/treasury',
  },
  {
    tag: 'ENTERPRISE',
    title: 'Corporate banking relationships',
    desc: 'A dedicated relationship manager and full commercial banking suite for businesses with complex banking needs.',
    href: '/contact',
  },
];

export default function BusinessHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Business Banking</p>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Banking that<br />
          <span className="text-[#4ade80]">means business.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          From a first business account to full treasury management — Hunch provides every financial tool your business needs to run, grow, and thrive.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/business/checking" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Open a Business Account
          </Link>
          <Link to="/contact" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Talk to a Business Banker
          </Link>
        </div>
      </section>

      {/* Business segment cards */}
      <section className="bg-[#0d2b26] py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-4">
          {businessSizes.map((s) => (
            <Link
              key={s.title}
              to={s.href}
              className="bg-[#163d2e] hover:bg-[#1a4a3c] border border-white/10 rounded-2xl p-8 flex flex-col gap-12 transition-colors group"
            >
              <div>
                <p className="text-[#4ade80] text-[11px] font-bold uppercase tracking-widest mb-3">{s.tag}</p>
                <h3 className="text-white text-2xl font-bold leading-snug">{s.title}</h3>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{s.desc}</p>
              </div>
              <span className="w-fit border border-white/40 group-hover:bg-white group-hover:text-bank-dark rounded-full px-5 py-2 text-white text-sm font-semibold transition-colors">
                Learn more <ArrowRight size={13} className="inline ml-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark text-center mb-3">Everything your business needs in one place</h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">
            Every product is designed to reduce complexity and help you focus on running your business.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessProducts.map(({ icon: Icon, name, tagline, desc, features, href, cta }) => (
              <div key={name} className="border border-gray-200 rounded-2xl p-7 flex flex-col hover:shadow-lg transition-shadow">
                <Icon size={26} className="text-bank-accent mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-bold text-bank-dark mb-1">{name}</h3>
                <p className="text-[#4ade80] text-[11px] font-bold uppercase tracking-wider mb-3">{tagline}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{desc}</p>
                <ul className="space-y-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={13} className="text-[#4ade80] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={href}
                  className="mt-auto flex items-center justify-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold py-3 rounded-full transition-colors text-sm"
                >
                  {cta} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust band */}
      <section className="bg-bank-surface py-14 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50K+', label: 'Business customers' },
            { value: '$4.2B', label: 'Business loans originated' },
            { value: '99.9%', label: 'Online banking uptime' },
            { value: '4.8★', label: 'Business app rating' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-black text-bank-dark mb-1">{s.value}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Let's build your business together.</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          Connect with a dedicated business banker who knows your industry.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/business/checking" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Open a Business Account
          </Link>
          <Link to="/contact" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Request a Consultation
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
