import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { ShieldCheck, Lock, AlertTriangle, Eye, Home, Car, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const protectServices = [
  {
    icon: ShieldCheck,
    name: 'Fraud Monitoring',
    tagline: '24/7 account protection',
    desc: 'Our real-time fraud detection watches every transaction and alerts you instantly if something looks off — so you can act before it becomes a problem.',
    features: ['Real-time transaction alerts', 'Zero liability policy', 'Instant card freeze/unfreeze', 'Identity theft resolution support'],
    href: '/protect/security',
    cta: 'Learn About Security',
  },
  {
    icon: Lock,
    name: 'Identity Protection',
    tagline: 'Guard your name and credit',
    desc: 'Our identity monitoring service scans the dark web, credit bureaus, and public records to detect unauthorized use of your information.',
    features: ['Dark web monitoring', 'Credit bureau alerts', 'SSN monitoring', '$1M identity theft insurance'],
    href: '/protect/identity',
    cta: 'Protect Your Identity',
  },
  {
    icon: Home,
    name: 'Home Insurance',
    tagline: 'Coverage that fits your home',
    desc: 'Protect your home and belongings with policies that start from a single comparison — we shop multiple carriers to find you the best rate.',
    features: ['Dwelling & personal property', 'Liability coverage', 'Natural disaster riders', 'Online quote in 5 minutes'],
    href: '/contact',
    cta: 'Get a Home Quote',
  },
  {
    icon: Car,
    name: 'Auto & Life Insurance',
    tagline: 'Peace of mind, simplified',
    desc: 'Bundle your auto and life insurance through Hunch and save on both. Our licensed advisors match you with the right coverage at the right price.',
    features: ['Liability, collision & comprehensive', 'Term & whole life policies', 'Bundle discounts', 'Claims handled in-app'],
    href: '/contact',
    cta: 'Compare Plans',
  },
];

const securityTips = [
  { title: 'Use a unique password for your Hunch account', body: 'Avoid using the same password across multiple sites. A password manager makes this easy.' },
  { title: 'Enable two-factor authentication', body: 'Add a second layer of security with an authenticator app or SMS code.' },
  { title: 'Monitor your statements weekly', body: 'Catching unauthorized transactions early limits your exposure significantly.' },
  { title: 'Be wary of unsolicited contact', body: 'Hunch will never ask for your password, PIN, or full card number by phone or email.' },
  { title: 'Freeze your credit when not actively applying', body: 'A credit freeze is free and blocks anyone from opening new accounts in your name.' },
];

const faqs = [
  { q: 'What should I do if I spot a fraudulent transaction?', a: 'Log into your account immediately and use the "Report a problem" option on the transaction. You can also freeze your card instantly from the app. Call us anytime at our 24/7 fraud line.' },
  { q: 'How does zero liability protection work?', a: 'If a fraudulent transaction is reported promptly, Hunch will reimburse the full amount. This covers debit cards, credit cards, and online banking transactions.' },
  { q: 'Is my personal information stored securely?', a: 'Yes. Hunch uses bank-grade 256-bit encryption for all data storage and transmission. We never sell your personal information to third parties.' },
  { q: 'Can I get insurance through Hunch if I\'m not a customer?', a: 'Our insurance comparison tool is available to anyone. However, Hunch members receive priority rates and additional discounts on bundled policies.' },
];

function FAQ({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((item, i) => (
        <div key={item.q} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-bank-dark text-sm">{item.q}</span>
            <ChevronDown size={16} className={`text-gray-400 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ProtectHub() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Protect with Hunch</p>
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5">
          Stay protected,<br />
          <span className="text-[#4ade80]">stay ahead.</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          From real-time fraud alerts to home and auto insurance — Hunch gives you the tools to protect your money, your identity, and your lifestyle.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/protect/security" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Review Your Protection
          </Link>
          <a href="#tips" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Security Tips
          </a>
        </div>
      </section>

      {/* Alert banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-amber-600 shrink-0" />
          <p className="text-amber-800 text-xs font-medium">
            Fraud alert: Scammers are impersonating banks over text. Hunch will never ask for your PIN or password via SMS.{' '}
            <Link to="/protect/security" className="underline font-semibold">Learn how to spot fraud</Link>
          </p>
        </div>
      </div>

      {/* Protection services */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark text-center mb-3">Layers of protection, built in</h2>
          <p className="text-center text-gray-500 text-sm mb-12 max-w-lg mx-auto">
            Every Hunch account comes with core security features. Upgrade with optional coverage to protect even more.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {protectServices.map(({ icon: Icon, name, tagline, desc, features, href, cta }) => (
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

      {/* Security tips */}
      <section id="tips" className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-bank-accent text-xs font-semibold uppercase tracking-widest mb-3">Stay Smart</p>
            <h2 className="text-xl sm:text-3xl font-bold text-bank-dark mb-8 leading-snug">
              Five security habits that protect your account
            </h2>
            <ul className="space-y-6">
              {securityTips.map((tip, i) => (
                <li key={tip.title} className="flex gap-4">
                  <Eye size={20} className="text-[#4ade80] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-semibold text-bank-dark text-sm">{tip.title}</p>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{tip.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bank-dark rounded-2xl p-8 text-white">
            <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-5">Security Checklist</p>
            <ul className="space-y-4">
              {['Two-factor authentication enabled', 'Alert preferences configured', 'Recovery email verified', 'Card controls reviewed', 'Trusted device list current'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-[#4ade80] shrink-0" />
                  <span className="text-sm text-white/80">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/login" className="mt-8 block w-full text-center bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold py-3 rounded-full transition-colors text-sm">
              Check My Account
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-bold text-bank-dark text-center mb-4">Common security questions</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Answers to the questions we hear most.</p>
          <FAQ faqs={faqs} />
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white mb-4">Questions about your account security?</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">Our security team is available 24/7 — by phone, chat, or in branch.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Contact Security Team
          </Link>
          <Link to="/locations" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Find a Branch
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
