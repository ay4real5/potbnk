import { useState } from 'react';
import PageShell from '../components/PageShell';
import { MapPin, Phone, Clock, ChevronRight, Search, Car, Banknote, Wifi } from 'lucide-react';

const ALL_BRANCHES = [
  {
    id: 1,
    name: 'Hunch – Downtown Financial District',
    address: '1 Financial Plaza, Suite 100',
    city: 'New York',
    state: 'NY',
    zip: '10005',
    phone: '(212) 555-0101',
    hours: 'Mon–Fri 9 AM–5 PM · Sat 9 AM–1 PM',
    services: ['ATM', 'Drive-Through', 'Safe Deposit', 'Notary', 'Loan Officer'],
    lat: 40.7074,
    lng: -74.0113,
  },
  {
    id: 2,
    name: 'Hunch – Midtown Branch',
    address: '575 Fifth Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    phone: '(212) 555-0202',
    hours: 'Mon–Fri 8:30 AM–5:30 PM · Sat 9 AM–2 PM',
    services: ['ATM', 'Safe Deposit', 'Business Banking', 'Mortgage Advisor'],
    lat: 40.7549,
    lng: -73.9793,
  },
  {
    id: 3,
    name: 'Hunch – Chicago Loop',
    address: '200 S Wacker Dr, Suite 200',
    city: 'Chicago',
    state: 'IL',
    zip: '60606',
    phone: '(312) 555-0303',
    hours: 'Mon–Fri 9 AM–5 PM · Sat Closed',
    services: ['ATM', 'Drive-Through', 'Business Banking', 'Loan Officer'],
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: 4,
    name: 'Hunch – Houston Memorial',
    address: '8888 Kirby Dr',
    city: 'Houston',
    state: 'TX',
    zip: '77054',
    phone: '(713) 555-0404',
    hours: 'Mon–Fri 9 AM–5 PM · Sat 9 AM–12 PM',
    services: ['ATM', 'Drive-Through', 'Safe Deposit', 'Mortgage Advisor'],
    lat: 29.7604,
    lng: -95.3698,
  },
  {
    id: 5,
    name: 'Hunch – Phoenix Central',
    address: '3030 N Central Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85012',
    phone: '(602) 555-0505',
    hours: 'Mon–Fri 9 AM–5 PM · Sat 9 AM–1 PM',
    services: ['ATM', 'Drive-Through', 'Business Banking'],
    lat: 33.4484,
    lng: -112.074,
  },
  {
    id: 6,
    name: 'Hunch – Los Angeles Westside',
    address: '11111 Santa Monica Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90025',
    phone: '(310) 555-0606',
    hours: 'Mon–Fri 9 AM–6 PM · Sat 9 AM–2 PM',
    services: ['ATM', 'Safe Deposit', 'Loan Officer', 'Notary'],
    lat: 34.0522,
    lng: -118.4437,
  },
];

const SERVICE_ICONS = {
  ATM: Banknote,
  'Drive-Through': Car,
  'Business Banking': Wifi,
  default: ChevronRight,
};

function BranchCard({ branch, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`border rounded-2xl p-5 cursor-pointer transition-all ${
        active ? 'border-bank-accent shadow-lg bg-bank-light' : 'border-gray-200 hover:border-bank-accent hover:shadow-sm bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-bold text-bank-dark text-sm leading-snug">{branch.name}</h3>
          <p className="text-gray-500 text-xs mt-1">{branch.address}, {branch.city}, {branch.state} {branch.zip}</p>
        </div>
        <MapPin size={18} className={`shrink-0 mt-0.5 ${active ? 'text-bank-accent' : 'text-gray-300'}`} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <Clock size={12} />
        <span>{branch.hours}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {branch.services.map((s) => (
          <span key={s} className="text-[10px] font-semibold uppercase tracking-wide bg-bank-surface text-bank-dark px-2 py-0.5 rounded-sm">
            {s}
          </span>
        ))}
      </div>
      {active && (
        <div className="mt-4 pt-4 border-t border-bank-accent/20 flex gap-3">
          <a
            href={`tel:${branch.phone.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 text-xs text-bank-accent font-semibold hover:underline"
          >
            <Phone size={12} /> {branch.phone}
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${branch.address}, ${branch.city}, ${branch.state}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-bank-accent font-semibold hover:underline"
          >
            <MapPin size={12} /> Get directions
          </a>
        </div>
      )}
    </div>
  );
}

export default function Locations() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);

  const filtered = ALL_BRANCHES.filter((b) => {
    const q = query.toLowerCase();
    return (
      b.city.toLowerCase().includes(q) ||
      b.state.toLowerCase().includes(q) ||
      b.zip.includes(q) ||
      b.name.toLowerCase().includes(q)
    );
  });

  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-bank-dark py-16 px-4 text-center">
        <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-3">Branch & ATM Locator</p>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-5">
          Banking close<br />
          <span className="text-[#4ade80]">to home.</span>
        </h1>
        <p className="text-white/60 max-w-md mx-auto text-sm leading-relaxed mb-8">
          Find a Hunch branch or ATM near you. Over 400 locations nationwide, plus 30,000+ partner ATMs in our network.
        </p>
        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, state, or ZIP code..."
            className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
      </section>

      {/* Stats */}
      <div className="bg-[#0d2b26] border-t border-white/10 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {[
            { value: '400+', label: 'Branch locations' },
            { value: '30K+', label: 'Partner ATMs' },
            { value: '50 states', label: 'Coast to coast' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-black text-[#4ade80]">{s.value}</p>
              <p className="text-white/50 text-xs uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Branch list */}
      <section className="bg-bank-surface py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold text-bank-dark">
              {filtered.length} location{filtered.length !== 1 ? 's' : ''} found
              {query && <span className="text-gray-400 font-normal"> for &ldquo;{query}&rdquo;</span>}
            </p>
            <button
              onClick={() => setQuery('')}
              className={`text-xs text-bank-accent font-semibold hover:underline ${!query ? 'invisible' : ''}`}
            >
              Clear search
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">No branches found for that location.</p>
              <p className="text-gray-300 text-xs mt-2">Try a different city, state abbreviation, or ZIP code.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((b) => (
                <BranchCard
                  key={b.id}
                  branch={b}
                  active={active === b.id}
                  onClick={() => setActive(active === b.id ? null : b.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ATM Network */}
      <section className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-bank-dark mb-3">No-fee ATM network</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
            Access your money fee-free at any Hunch ATM, plus 30,000+ Allpoint and MoneyPass partner ATMs across the country. Look for the network logo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {['Allpoint', 'MoneyPass', 'Sum® Network', 'Plus® Alliance'].map((n) => (
              <div key={n} className="border border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold text-gray-600">
                {n}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bank-dark py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Prefer to bank from home?</h2>
        <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
          Everything you can do in a branch, you can do online or on the Hunch app — 24/7, no appointment needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/login" className="bg-[#4ade80] hover:bg-green-400 text-bank-dark font-bold px-8 py-3 rounded-full transition-colors text-sm">
            Sign In to Online Banking
          </a>
          <a href="/open-account" className="border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-full transition-colors text-sm">
            Open an Account Online
          </a>
        </div>
      </section>
    </PageShell>
  );
}
