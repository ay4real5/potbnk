import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { TrendingUp, PiggyBank, DollarSign, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';

const growProducts = [
  {
    icon: PiggyBank,
    name: 'High-Yield Savings',
    tagline: 'Earn more on every dollar',
    desc: 'Park your cash in an account that actually works for you. Our high-yield savings rate beats the national average — no gimmicks, no lock-in.',
    features: ['APY up to 4.75%', 'No monthly fees', 'FDIC insured', 'No minimum balance'],
    href: '/bank/savings',
    cta: 'Open Savings Account',
  },
  {
    icon: DollarSign,
    name: 'Certificates of Deposit',
    tagline: 'Lock in a great rate today',
    desc: 'Choose a term that matches your timeline and lock in a guaranteed rate. Perfect for short-term goals or money you won\'t need for a year or more.',
    features: ['Terms from 3 months to 5 years', 'Guaranteed rate', 'As low as $500 to open', 'Auto-renew option'],
    href: '/bank/savings',
    cta: 'View CD Rates',
  },
  {
    icon: TrendingUp,
    name: 'Investment Accounts',
    tagline: 'Grow your wealth long-term',
    desc: 'From brokerage accounts to IRAs, our investment advisors help you build a portfolio that reflects your goals, timeline, and risk tolerance.',
    features: ['Self-directed or guided', 'Traditional & Roth IRA', 'Low advisory fees', 'Tax-advantaged options'],
    href: '/contact',
    cta: 'Explore Investing',
  },
  {
    icon: BarChart2,
    name: 'Retirement Planning',
    tagline: 'Your future, built today',
    desc: 'Whether retirement is 5 years or 35 years away, we help you create a plan that closes the gap between where you are and where you want to be.',
    features: ['401(k) rollovers', 'Personalized projections', 'Roth conversion guidance', 'Required minimum distributions'],
    href: '/contact',
    cta: 'Start Planning',
  },
];

const milestones = [
  { label: 'Build an emergency fund', desc: 'Cover 3–6 months of expenses in a liquid, high-yield account.' },
  { label: 'Pay off high-interest debt', desc: 'Free up cash flow and improve your financial foundation.' },
  { label: 'Max your tax-advantaged accounts', desc: "Contribute to your 401(k) and IRA before investing elsewhere." },
  { label: 'Invest for the long term', desc: 'Let compound interest do the heavy lifting over time.' },
  { label: 'Protect what you\'ve built', desc: 'Insurance and estate planning keep your wealth safe.' },
];

const stats = [
  { value: '$2.4B', label: 'In customer savings accounts' },
  { value: '4.75%', label: 'Highest available APY' },
  { value: '98%', label: 'Customer satisfaction score' },
  { value: '30+', label: 'Years of wealth guidance' },
];

export default function GrowHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Grow with Hunch</p>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Your money,<br />
          <span className="text-[#4ade80]">working harder.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          From high-yield savings to long-term investment strategies — we give you the tools and guidance to build wealth on your own terms.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/apply?product=high-yield-savings" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Start Growing Today
          </Link>
          <Link to="/learn" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Explore Resources
          </Link>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#012d2a]/90 border-t border-white/10 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-[#4ade80] mb-1">{s.value}</p>
              <p className="text-white/50 text-xs uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Growth products */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">Build wealth your way</h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">
            Whether you're saving for a rainy day or building a retirement portfolio, we have the right account for every stage.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {growProducts.map(({ icon: Icon, name, tagline, desc, features, href, cta }) => (
              <div key={name} className="border border-gray-200 rounded-2xl p-8 flex flex-col hover:shadow-lg transition-shadow">
                <Icon size={28} className="text-bank-accent mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-bank-dark mb-1">{name}</h3>
                <p className="text-[#4ade80] text-xs font-bold uppercase tracking-wider mb-3">{tagline}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-[#4ade80] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={href}
                  className="mt-auto flex items-center justify-center gap-2 bg-bank-dark hover:bg-bank-mid text-white font-bold py-3 rounded-full transition-colors text-sm"
                >
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth milestones */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest mb-3">The Hunch Path to Wealth</p>
            <h2 className="text-3xl font-bold text-bank-dark mb-6 leading-snug">
              Five milestones to a stronger financial future
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Wealth isn't built overnight. It's the result of consistent habits, smart decisions, and having a banking partner that supports every step.
            </p>
            <ul className="space-y-5">
              {milestones.map((m, i) => (
                <li key={m.label} className="flex gap-4">
                  <span className="text-[#4ade80] font-black text-lg shrink-0 w-6 text-right">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-semibold text-bank-dark text-sm">{m.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{m.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80"
            alt="Person reviewing financial growth charts"
            className="rounded-2xl w-full object-cover h-96 shadow-lg"
          />
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to put your money to work?</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          Open a high-yield savings account or speak with an advisor — no obligation, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/open-account" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Open an Account
          </Link>
          <Link to="/contact" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Speak with an Advisor
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
