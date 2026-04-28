import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, PiggyBank, BadgeCheck, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: <Zap size={28} className="text-bank-accent" />,
    title: 'Instant Transfers',
    body: 'Move money between accounts in seconds—no delays, no waiting.',
  },
  {
    icon: <ShieldCheck size={28} className="text-bank-accent" />,
    title: 'Bank-Grade Security',
    body: '256-bit encryption and multi-factor controls keep your funds safe.',
  },
  {
    icon: <PiggyBank size={28} className="text-bank-accent" />,
    title: 'Smart Savings',
    body: 'A dedicated savings account opens automatically alongside your checking.',
  },
];

const trust = [
  { icon: <BadgeCheck size={18} />, label: 'FDIC Insured up to $250,000' },
  { icon: <Lock size={18} />, label: '256-bit SSL Encryption' },
  { icon: <ShieldCheck size={18} />, label: 'Zero-liability fraud protection' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bank-dark text-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
        <span className="bg-bank-primary/30 text-bank-accent text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest border border-bank-accent/30">
          Smarter everyday banking
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight max-w-3xl">
          Banking built for the{' '}
          <span className="text-bank-accent">way you live.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl">
          Open a free checking and savings account in minutes. Send money, track
          spending, and grow your balance—all in one place.
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            to="/register"
            className="bg-bank-accent hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-blue-900/40"
          >
            Open a free account
          </Link>
          <Link
            to="/login"
            className="border border-white/20 hover:border-white/40 text-slate-200 font-medium px-7 py-3 rounded-xl transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20 grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-4"
          >
            {f.icon}
            <h3 className="text-white font-semibold text-lg">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Trust bar */}
      <section className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-wrap justify-center gap-10">
          {trust.map((t) => (
            <div key={t.label} className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="text-bank-accent">{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Hunch Financial, Inc. All rights reserved.</span>
          <span>Hunch is a demo application. Not a real bank.</span>
        </div>
      </footer>
    </div>
  );
}
