import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { MapPin, Clock, TrendingUp, Heart, Users, Globe } from 'lucide-react';

const DEPARTMENTS = ['All', 'Technology', 'Product', 'Finance', 'Operations', 'Marketing', 'Compliance'];

const OPENINGS = [
  { id: 1, dept: 'Technology',  title: 'Senior Full-Stack Engineer',       location: 'Columbus, OH (Hybrid)',  type: 'Full-time' },
  { id: 2, dept: 'Technology',  title: 'iOS Mobile Developer',              location: 'Remote',                type: 'Full-time' },
  { id: 3, dept: 'Product',     title: 'Senior Product Manager — Banking',  location: 'Columbus, OH',          type: 'Full-time' },
  { id: 4, dept: 'Product',     title: 'UX Designer — Digital Banking',     location: 'Columbus, OH (Hybrid)',  type: 'Full-time' },
  { id: 5, dept: 'Finance',     title: 'Financial Analyst',                 location: 'Columbus, OH',          type: 'Full-time' },
  { id: 6, dept: 'Operations',  title: 'Branch Operations Coordinator',     location: 'Cleveland, OH',         type: 'Full-time' },
  { id: 7, dept: 'Marketing',   title: 'Content Marketing Strategist',      location: 'Remote',                type: 'Full-time' },
  { id: 8, dept: 'Compliance',  title: 'BSA/AML Compliance Analyst',        location: 'Columbus, OH',          type: 'Full-time' },
  { id: 9, dept: 'Technology',  title: 'Cloud Infrastructure Engineer',     location: 'Remote',                type: 'Full-time' },
  { id: 10,dept: 'Finance',     title: 'Risk Management Analyst',           location: 'Columbus, OH',          type: 'Full-time' },
];

const VALUES = [
  { icon: Heart,     title: 'People first',      desc: 'We put colleagues and customers at the center of every decision.' },
  { icon: TrendingUp, title: 'Grow together',    desc: 'Continuous learning, mentorship, and career development paths for everyone.' },
  { icon: Globe,     title: 'Think differently', desc: 'We challenge the status quo to build better banking experiences.' },
  { icon: Users,     title: 'Inclusive by design', desc: 'Diversity and belonging are core values, not afterthoughts.' },
];

const PERKS = [
  '401(k) with 5% company match',
  'Comprehensive health, dental & vision',
  '20 days PTO + 11 federal holidays',
  'Remote & hybrid-friendly roles',
  'Annual learning & development stipend',
  'Student loan repayment assistance',
  'Paid parental leave — 16 weeks',
  'Free Hunch checking & savings accounts',
];

export default function Careers() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#4ade80,_transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Careers at Hunch</p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-5 leading-tight">
            Come build<br />
            <span className="text-[#4ade80]">what's next.</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Join a team of builders, thinkers, and problem-solvers on a mission to make banking work for everyone. We're growing fast — and looking for people who want to grow with us.
          </p>
          <a
            href="#openings"
            className="inline-block bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-9 py-3 rounded-full transition-colors text-sm"
          >
            See Open Positions
          </a>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#0d2b26] border-y border-white/10 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '1,200+', label: 'Team members' },
            { n: '38',     label: 'States represented' },
            { n: '4.6★',   label: 'Glassdoor rating' },
            { n: '92%',    label: 'Would recommend us' },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-[#4ade80]">{n}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark text-center mb-3">Our values</h2>
          <p className="text-gray-500 text-sm text-center mb-12 max-w-lg mx-auto">What we believe drives how we work every day.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-bank-light flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-bank-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-bank-dark text-sm mb-2">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-bank-surface py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-bank-accent text-xs font-bold uppercase tracking-widest mb-3">Benefits</p>
            <h2 className="text-3xl font-bold text-bank-dark mb-5">We take care of our people.</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Your wellbeing matters. We offer a comprehensive benefits package so you can bring your whole self to work.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {PERKS.map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#4ade80] shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
            alt="Hunch team collaborating"
            className="rounded-2xl h-80 w-full object-cover shadow-lg"
          />
        </div>
      </section>

      {/* Open positions */}
      <section id="openings" className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-bank-dark mb-3">Open positions</h2>
          <p className="text-gray-500 text-sm mb-10">All roles are listed below. We review applications on a rolling basis.</p>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {OPENINGS.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-bank-surface transition-colors gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-bank-accent bg-bank-light px-2 py-0.5 rounded-sm mr-2">
                    {job.dept}
                  </span>
                  <h3 className="font-semibold text-bank-dark text-sm mt-2">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={10} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} /> {job.type}
                    </span>
                  </div>
                </div>
                <button className="shrink-0 bg-bank-dark hover:bg-bank-mid text-white text-xs font-bold px-5 py-2 rounded-full transition-colors">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-xs mt-8">
            Don't see your role? <a href="mailto:careers@hunchbank.com" className="text-bank-accent hover:underline">Send us your resume</a> — we're always looking for great people.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to make your move?</h2>
        <p className="text-white/50 text-sm mb-8">We'd love to meet you. Browse openings and apply today.</p>
        <a
          href="#openings"
          className="inline-block bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-9 py-3 rounded-full transition-colors text-sm"
        >
          View All Openings
        </a>
      </section>
    </PageShell>
  );
}
