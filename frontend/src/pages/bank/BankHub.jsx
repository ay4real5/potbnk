import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { CreditCard, PiggyBank, Smartphone, Monitor, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';

const accounts = [
  {
    name: 'Everyday Checking',
    tag: 'MOST POPULAR',
    tagColor: 'bg-[#4ade80] text-bank-dark',
    rate: '$0',
    rateLabel: 'monthly fee',
    perks: ['No minimum balance', 'Free debit card', 'Mobile check deposit', '24/7 online access'],
    cta: 'Open an Account',
    href: '/apply?product=everyday-checking',
  },
  {
    name: 'Perks Checking',
    tag: 'BEST VALUE',
    tagColor: 'bg-bank-accent text-white',
    rate: '$8',
    rateLabel: 'monthly fee',
    perks: ['Interest-bearing balance', 'ATM fee waivers', 'Roadside assistance', 'Identity theft protection'],
    cta: 'Open an Account',
    href: '/apply?product=perks-checking',
  },
  {
    name: 'Premier Checking',
    tag: 'PREMIUM',
    tagColor: 'bg-bank-dark text-white border border-white/30',
    rate: '$25',
    rateLabel: 'monthly fee',
    perks: ['Relationship rates on savings', 'Free wire transfers', 'Priority customer service', 'Safe deposit box discount'],
    cta: 'Open an Account',
    href: '/apply?product=perks-checking',
  },
];

const savingsProducts = [
  { icon: PiggyBank,   name: 'Statement Savings',   desc: 'Simple, no-frills savings with competitive interest and zero minimums to open.',           href: '/apply?product=high-yield-savings' },
  { icon: PiggyBank,   name: 'High-Yield Savings',  desc: 'Earn more on every dollar you save — with rates that beat the national average.',          href: '/apply?product=high-yield-savings' },
  { icon: CreditCard,  name: 'Credit Cards',         desc: 'Cash back, travel rewards, or low rates — choose the card that fits your lifestyle.',     href: '/apply?product=rewards-card' },
  { icon: Monitor,     name: 'Online Banking',        desc: 'Manage everything from one dashboard — transfers, bills, and statements in one place.',  href: '/login' },
  { icon: Smartphone,  name: 'Mobile Banking',        desc: 'Deposit checks, pay friends, and check balances from anywhere on the Hunch app.',       href: '/login' },
  { icon: ShieldCheck, name: 'Account Security',     desc: 'Advanced fraud monitoring, alerts, and zero-liability protection for every account.',    href: '/protect' },
];

const faqs = [
  { q: 'How do I open a Hunch checking account?', a: 'You can open an account entirely online in about five minutes. Have your government-issued ID and Social Security number ready.' },
  { q: 'Is there a minimum balance required?', a: 'Everyday Checking has no minimum balance requirement. Perks and Premier Checking have waivable minimums — see account details for specifics.' },
  { q: 'How do I deposit cash without a branch?', a: 'Use any of our 30,000+ partner ATMs nationwide, or visit a branch near you using our locator.' },
  { q: 'What is the routing number for Hunch Bank?', a: 'The Hunch routing number is displayed in your online banking portal under Account Details, or contact customer service for assistance.' },
];

export default function BankHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Bank with Hunch</p>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Your money,<br />
          <span className="text-[#4ade80]">your rules.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          Checking and savings accounts built around how you actually live — with transparent fees, powerful tools, and real human support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/open-account" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Open an Account
          </Link>
          <Link to="/login" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Sign In
          </Link>
        </div>
      </section>

      {/* Checking account cards */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">Choose your checking account</h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">All accounts include a free debit card, mobile check deposit, and 24/7 online access.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {accounts.map((acct) => (
              <div key={acct.name} className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-bank-dark font-bold text-lg leading-snug">{acct.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${acct.tagColor}`}>{acct.tag}</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-black text-bank-dark">{acct.rate}</span>
                  <span className="text-gray-400 text-sm ml-1">{acct.rateLabel}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {acct.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-[#4ade80] shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to={acct.href} className="bg-bank-dark hover:bg-bank-mid text-white font-semibold px-5 py-3 rounded-lg text-sm text-center transition-colors">
                  {acct.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More banking products */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark mb-3">More ways to bank with Hunch</h2>
          <p className="text-gray-500 text-sm mb-10">A full suite of products to support every financial goal.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {savingsProducts.map(({ icon: Icon, name, desc, href }) => (
              <Link key={name} to={href} className="group border border-gray-200 hover:border-bank-dark rounded-xl p-6 flex flex-col gap-3 transition-all hover:shadow-md">
                <Icon size={24} className="text-bank-accent" strokeWidth={1.5} />
                <h3 className="font-semibold text-bank-dark group-hover:text-bank-mid transition-colors">{name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed flex-1">{desc}</p>
                <span className="text-[#4ade80] text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to make the switch?</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">Open an account in minutes — no minimum deposit, no paperwork hassle.</p>
        <Link to="/open-account" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-10 py-3 rounded-full transition-colors text-sm inline-block">
          Get Started
        </Link>
      </section>

      {/* FAQ */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-bank-dark mb-8">Frequently asked questions</h2>
          <div className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <details key={faq.q} className="py-5 group">
                <summary className="flex justify-between items-center cursor-pointer list-none text-bank-dark font-semibold text-sm">
                  {faq.q}
                  <ArrowRight size={16} className="shrink-0 rotate-90 group-open:rotate-[270deg] transition-transform text-gray-400" />
                </summary>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/support" className="text-bank-accent font-semibold text-sm hover:underline">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
