import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { Home, Car, DollarSign, Calculator, CheckCircle, ArrowRight } from 'lucide-react';

const loanProducts = [
  {
    icon: Home,
    name: 'Mortgages',
    tagline: 'Finance your home with confidence',
    desc: 'Fixed and adjustable-rate mortgages with competitive rates, local underwriting, and a dedicated loan officer from application to closing.',
    features: ['Fixed & ARM options', 'Pre-approval in 24 hours', 'Down payments from 3%', 'First-time buyer programs'],
    href: '/contact',
    cta: 'Speak with a Loan Specialist',
  },
  {
    icon: Home,
    name: 'Home Equity',
    tagline: 'Put your equity to work',
    desc: 'A home equity line of credit (HELOC) or fixed home equity loan lets you borrow against what your home is worth — at rates that beat most personal loans.',
    features: ['Rates from 6.99% APR', 'Draw periods up to 10 years', 'Interest-only payment option', 'Online application'],
    href: '/contact',
    cta: 'Get a Quote',
  },
  {
    icon: Car,
    name: 'Auto Loans',
    tagline: 'Drive off with a great rate',
    desc: 'New and used vehicle financing with pre-approval that travels with you to any dealership. Know your number before you negotiate.',
    features: ['Terms up to 84 months', 'New & used vehicles', 'Pre-approval in minutes', 'No prepayment penalty'],
    href: '/contact',
    cta: 'Explore Auto Loans',
  },
  {
    icon: DollarSign,
    name: 'Personal Loans',
    tagline: 'Funds for what matters most',
    desc: 'From home improvements to tuition to unexpected costs — a fixed-rate personal loan means predictable payments and no collateral required.',
    features: ['Borrow $1,000 – $50,000', 'Fixed rate & fixed term', 'Funds as fast as 1 day', 'No origination fees'],
    href: '/contact',
    cta: 'Explore Personal Loans',
  },
];

const steps = [
  { step: '01', title: 'Choose your loan type', desc: 'Select the product that fits your goal — mortgage, auto, personal, or home equity.' },
  { step: '02', title: 'Apply online in minutes', desc: 'Our streamlined application takes most applicants under 10 minutes to complete.' },
  { step: '03', title: 'Get a decision fast', desc: 'Personal and auto loan decisions often come back the same day. Mortgages in 24 hours.' },
  { step: '04', title: 'Access your funds', desc: "Once approved, funds are deposited directly to your Hunch account — or we wire the payoff." },
];

const faqs = [
  { q: 'How quickly can I get a personal loan?', a: 'Most personal loan applicants receive a decision within hours. Approved funds can be in your account as soon as the next business day.' },
  { q: 'Do I need a Hunch account to apply for a loan?', a: 'No — anyone can apply for a Hunch loan. However, having a checking or savings account may unlock better rates.' },
  { q: 'What credit score do I need for a mortgage?', a: 'We work with borrowers starting at 620 for conventional loans. FHA programs allow scores as low as 580 with a qualifying down payment.' },
  { q: 'Can I pay off my loan early without a penalty?', a: 'Yes. All Hunch personal and auto loans have zero prepayment penalties — pay ahead whenever it works for you.' },
];

export default function BorrowHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Borrow with Hunch</p>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Borrow smarter,<br />
          <span className="text-[#4ade80]">live better.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          Whether you're buying a home, a car, or funding life's next chapter — we have straight-forward loan products at rates that are actually fair.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Talk to a Loan Specialist
          </Link>
          <a href="#calculator" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Use a Calculator
          </a>
        </div>
      </section>

      {/* Loan products */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark mb-3 text-center">Pick your path</h2>
          <p className="text-gray-500 text-sm text-center mb-12 max-w-lg mx-auto">Every loan is built around your situation — not a one-size-fits-all formula.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {loanProducts.map(({ icon: Icon, name, tagline, desc, features, href, cta }) => (
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
                <Link to={href} className="text-bank-dark font-bold text-sm flex items-center gap-1.5 hover:text-bank-accent transition-colors group">
                  {cta} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bank-surface py-20 px-4" id="calculator">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark text-center mb-12">How borrowing with Hunch works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-bank-dark text-[#4ade80] font-black text-lg flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-bank-dark text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate compare strip */}
      <section className="bg-bank-dark py-14 px-4 text-center">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-2 font-bold">Current starting rates</p>
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          {[
            { label: 'Personal Loans', rate: '7.99% APR' },
            { label: 'Auto Loans', rate: '5.49% APR' },
            { label: '30-yr Mortgage', rate: '6.75% APR' },
            { label: 'HELOC', rate: '6.99% APR' },
          ].map(({ label, rate }) => (
            <div key={label} className="text-center">
              <p className="text-[#4ade80] text-2xl font-black">{rate}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-white/30 text-[10px] mt-6 max-w-sm mx-auto">Rates shown are for illustration only. Actual rates depend on creditworthiness and product terms.</p>
      </section>

      {/* FAQ */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-bank-dark mb-8">Common questions</h2>
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
            <Link to="/support" className="text-bank-accent font-semibold text-sm hover:underline">Contact a loan specialist →</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
