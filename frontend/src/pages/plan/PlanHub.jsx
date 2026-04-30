import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { Map, Target, Clock, Users, Calculator, CheckCircle, ArrowRight } from 'lucide-react';

const planningServices = [
  {
    icon: Target,
    name: 'Retirement Planning',
    tagline: 'Know your number. Reach your goal.',
    desc: 'We help you calculate exactly how much you need to retire on your terms — and build the path to get there, decade by decade.',
    features: ['Retirement income projections', '401(k) & IRA guidance', 'Social Security optimization', 'Legacy planning basics'],
    href: '/plan/retirement',
    cta: 'Plan Your Retirement',
  },
  {
    icon: Map,
    name: 'Wealth Management',
    tagline: 'A partner, not just an account',
    desc: 'Our private banking team provides white-glove service for complex financial needs — from multi-asset portfolios to generational wealth transfers.',
    features: ['Dedicated relationship manager', 'Custom investment strategies', 'Tax-aware portfolio design', 'Quarterly review meetings'],
    href: '/plan/wealth-management',
    cta: 'Explore Private Banking',
  },
  {
    icon: Users,
    name: 'Trust & Estate Services',
    tagline: 'Protect what matters most',
    desc: 'Ensure your assets transfer smoothly to the people you love. Our trust officers guide you through every estate planning decision.',
    features: ['Revocable & irrevocable trusts', 'Estate administration', 'Charitable giving strategies', 'Business succession planning'],
    href: '/plan/trusts',
    cta: 'Learn About Trusts',
  },
  {
    icon: Clock,
    name: 'Financial Planning Sessions',
    tagline: 'One hour can change everything',
    desc: 'Meet one-on-one with a certified financial planner to review your full picture — budget, savings, debt, and long-term goals — in a single session.',
    features: ['No cost for Hunch members', 'Certified financial planners', 'In-branch or video sessions', 'Written action plan included'],
    href: '/contact',
    cta: 'Book a Session',
  },
];

const calculators = [
  { name: 'Retirement Calculator', desc: 'See how your savings today translate into income tomorrow.', icon: Calculator },
  { name: 'Budget Planner', desc: 'Build a realistic monthly budget based on your income and goals.', icon: Target },
  { name: 'Net Worth Tracker', desc: 'Get a clear snapshot of where you stand financially right now.', icon: Map },
  { name: 'College Savings Calculator', desc: 'Find out how much to save monthly for tuition costs.', icon: Users },
];

const stages = [
  { title: 'Starting out (20s–30s)', desc: 'Build your emergency fund, pay down debt, start investing early.' },
  { title: 'Building up (30s–40s)', desc: 'Maximize retirement contributions, buy a home, plan for your family.' },
  { title: 'Peak earning (40s–50s)', desc: 'Accelerate savings, review insurance, start estate planning.' },
  { title: 'Pre-retirement (55–65)', desc: 'Optimize Social Security, shift to lower-risk investments, plan income.' },
  { title: 'Living in retirement (65+)', desc: 'Manage distributions, healthcare costs, and legacy giving.' },
];

export default function PlanHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Plan with Hunch</p>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          A plan that<br />
          <span className="text-[#4ade80]">moves with you.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          Life doesn't stay still. Your financial plan shouldn't either. We provide guidance for every stage — from your first job to your last working day.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Talk to a Planner
          </Link>
          <a href="#calculators" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Use Our Calculators
          </a>
        </div>
      </section>

      {/* Planning services */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">Planning services built for your life</h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">
            Every service is delivered by real experts who take the time to understand your full picture.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {planningServices.map(({ icon: Icon, name, tagline, desc, features, href, cta }) => (
              <div key={name} className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col hover:shadow-lg transition-shadow">
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

      {/* Life stages */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest text-center mb-3">Planning by Life Stage</p>
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-12">Where are you in your journey?</h2>
          <div className="flex flex-col gap-4">
            {stages.map((s, i) => (
              <div key={s.title} className="flex gap-6 items-start p-6 border border-gray-100 rounded-2xl hover:border-bank-accent hover:shadow-sm transition-all cursor-pointer group">
                <span className="text-[#4ade80] font-black text-2xl shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-bold text-bank-dark text-base group-hover:text-bank-accent transition-colors">{s.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{s.desc}</p>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-bank-accent shrink-0 mt-1 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculators */}
      <section id="calculators" className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">Tools to sharpen your plan</h2>
          <p className="text-center text-gray-500 text-sm mb-12">Free calculators to help you think clearly about your financial future.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {calculators.map(({ name, desc, icon: Icon }) => (
              <div key={name} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow text-center cursor-pointer group">
                <Icon size={28} className="text-[#4ade80] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-bold text-bank-dark text-sm mb-2 group-hover:text-bank-accent transition-colors">{name}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your plan starts with one conversation.</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          A certified financial planner is ready to help — no commitment required, no jargon, just clarity.
        </p>
        <Link to="/contact" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-10 py-3 rounded-full transition-colors text-sm inline-block">
          Schedule a Free Consultation
        </Link>
      </section>
    </PageShell>
  );
}
