import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react';
import { useState } from 'react';

const reasons = [
  'Account question', 'Loan inquiry', 'Card dispute', 'Technical support',
  'Business banking', 'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', reason: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Contact Us</p>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
          Talk to a<br />
          <span className="text-[#4ade80]">real person.</span>
        </h1>
        <p className="text-white/60 max-w-md mx-auto text-sm leading-relaxed">
          Whether you have a quick question or a complex situation, we&apos;re ready to help.
        </p>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-bold text-bank-dark mb-2">Send us a message</h2>
            <p className="text-gray-500 text-sm mb-8">We typically respond within one business day.</p>

            {submitted ? (
              <div className="bg-bank-surface border border-green-200 rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-bank-dark mb-2">Message sent</h3>
                <p className="text-gray-500 text-sm">Thank you, {form.name}. We&apos;ll follow up at {form.email} within one business day.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-bank-accent hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-bank-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-bank-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number (optional)</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 555-5555"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-bank-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for contact *</label>
                  <select
                    required
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-bank-accent transition-colors bg-white"
                  >
                    <option value="">Select a reason...</option>
                    {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-bank-accent transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-bank-dark hover:bg-bank-mid text-white font-bold py-3 rounded-full transition-colors text-sm"
                >
                  Send Message
                </button>
                <p className="text-xs text-gray-400 text-center">
                  For urgent issues, please call <strong>1-800-HUNCH-00</strong>. Don't include full account or Social Security numbers in messages.
                </p>
              </form>
            )}
          </div>

          {/* Contact info sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-bank-dark mb-2">Other ways to reach us</h2>
            <p className="text-gray-500 text-sm mb-6">Prefer to call or chat? We&apos;re available around the clock for urgent matters.</p>

            {[
              { icon: Phone, title: 'Phone', detail: '1-800-HUNCH-00', sub: 'Mon–Fri 7 AM–10 PM ET · Emergencies 24/7', href: 'tel:18004862600' },
              { icon: MessageCircle, title: 'Live Chat', detail: 'Available in app & online', sub: 'Average wait under 2 minutes', href: '#chat' },
              { icon: MapPin, title: 'Branch', detail: 'Find your nearest location', sub: 'In-person help from local bankers', href: '/locations' },
              { icon: Mail, title: 'Secure Message', detail: 'Via online banking portal', sub: 'Response within 1 business day', href: '/login' },
            ].map(({ icon: Icon, title, detail, sub, href }) => (
              <a
                key={title}
                href={href}
                className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-bank-accent hover:shadow-sm transition-all group"
              >
                <div className="bg-bank-surface rounded-xl p-3 shrink-0">
                  <Icon size={18} className="text-bank-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-bank-dark text-sm group-hover:text-bank-accent transition-colors">{title}</p>
                  <p className="text-gray-700 text-sm mt-0.5">{detail}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
                </div>
              </a>
            ))}

            <div className="bg-bank-surface rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-bank-accent mb-2">Accessibility</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                If you need an accommodation to use our services, please call our accessibility support line at <strong>1-800-HUNCH-01</strong> or visit any branch.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
