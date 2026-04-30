import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { Phone, MessageCircle, MapPin, Mail, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const contactMethods = [
  {
    icon: Phone,
    title: '24/7 Phone Support',
    body: 'Speak directly with a Hunch representative any time of day or night.',
    cta: '1-800-HUNCH-00',
    href: 'tel:18004862600',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    body: 'Chat with our support team directly from your desktop or mobile device.',
    cta: 'Start a chat',
    href: '#chat',
  },
  {
    icon: Mail,
    title: 'Secure Message',
    body: 'Send a secure message through your online banking portal for non-urgent requests.',
    cta: 'Sign in to message',
    href: '/login',
  },
  {
    icon: MapPin,
    title: 'Visit a Branch',
    body: 'Find your nearest Hunch branch for in-person banking and personal guidance.',
    cta: 'Find a branch',
    href: '/locations',
  },
];

const topicCards = [
  { title: 'Online & Mobile Banking', desc: 'Login issues, app support, bill pay help.', href: '/support/online-banking' },
  { title: 'Account & Card Issues', desc: 'Report fraud, freeze cards, dispute charges.', href: '/support/accounts' },
  { title: 'Loans & Mortgages', desc: 'Payment help, payoff amounts, rate questions.', href: '/support/loans' },
  { title: 'Account Opening', desc: 'Help opening a new account or upgrading.', href: '/open-account' },
  { title: 'Routing Number', desc: 'Find your Hunch ABA routing number.', href: '/support/routing' },
  { title: 'Security & Fraud', desc: 'Protect your account and report suspicious activity.', href: '/protect' },
];

const faqs = [
  { q: 'How do I reset my online banking password?', a: 'Visit the sign-in page and click "Forgot password." Enter your email address or username, and we\'ll send a secure reset link within 2 minutes. If the link doesn\'t arrive, check your spam folder or call us.' },
  { q: 'How do I find my Hunch routing number?', a: 'Your routing number appears on the bottom-left of any Hunch check, in your online banking portal under Account Details, or on this page under the Routing Number support topic.' },
  { q: 'How do I dispute a transaction?', a: 'Log in to online banking, locate the transaction in question, and choose "Report a problem." For debit and credit cards, you can also freeze the card immediately from the app while an investigation is ongoing.' },
  { q: 'What are your branch hours?', a: 'Most Hunch branches are open Monday–Friday 9 AM–5 PM and Saturday 9 AM–1 PM. Holiday hours vary by location. Use our branch locator to confirm hours for your nearest branch.' },
  { q: 'How long does a wire transfer take?', a: 'Domestic wire transfers initiated before 4 PM ET typically arrive the same business day. International wires generally take 1–3 business days depending on the destination country and receiving bank.' },
  { q: 'Can I open an account if I\'m not a U.S. citizen?', a: 'Yes. We accept applications from permanent residents and certain visa holders. Valid government-issued photo ID and a U.S. address are required. Contact us for specific documentation requirements.' },
];

function FAQ({ faqs }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
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

export default function Support() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Customer Support</p>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-5">
          We&apos;re here<br />
          <span className="text-[#4ade80]">when you need us.</span>
        </h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm leading-relaxed">
          Real help from real people — by phone, chat, in-branch, or through your online banking portal.
        </p>
      </section>

      {/* Contact methods */}
      <section className="bg-bank-surface py-16 px-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {contactMethods.map(({ icon: Icon, title, body, cta, href }) => (
            <a
              key={title}
              href={href}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col hover:shadow-lg transition-shadow group"
            >
              <Icon size={24} className="text-bank-accent mb-4" strokeWidth={1.5} />
              <h3 className="font-bold text-bank-dark text-sm mb-2">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed flex-1">{body}</p>
              <span className="mt-4 text-[#4ade80] text-xs font-bold group-hover:underline">{cta} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Hours notice */}
      <div className="bg-bank-dark/5 border-y border-gray-200 py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 justify-center text-center">
          <Clock size={14} className="text-bank-accent shrink-0" />
          <p className="text-gray-600 text-xs">
            <strong>Phone support hours:</strong> Mon–Fri 7 AM–10 PM · Sat 8 AM–6 PM · Sun 10 AM–6 PM ET · Fraud & lost cards: 24/7
          </p>
        </div>
      </div>

      {/* Help topics */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-bank-dark text-center mb-4">Browse by topic</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Find the right page for your question.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topicCards.map((card) => (
              <Link
                key={card.title}
                to={card.href}
                className="border border-gray-200 rounded-2xl p-6 hover:border-bank-accent hover:shadow-sm transition-all group flex flex-col"
              >
                <h3 className="font-bold text-bank-dark text-sm mb-1 group-hover:text-bank-accent transition-colors">{card.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">{card.desc}</p>
                <span className="mt-4 text-bank-accent text-xs font-bold">View help →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bank-surface py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-bank-dark text-center mb-4">Frequently asked questions</h2>
          <p className="text-center text-gray-500 text-sm mb-10">Quick answers to common questions.</p>
          <FAQ faqs={faqs} />
          <p className="text-center text-gray-400 text-sm mt-8">
            Don't see your question?{' '}
            <Link to="/contact" className="text-bank-accent hover:underline font-semibold">Contact us directly →</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
