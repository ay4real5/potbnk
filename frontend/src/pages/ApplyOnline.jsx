import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, CheckCircle, ChevronRight, ChevronLeft, Lock,
  PiggyBank, CreditCard, Building2, AlertCircle, Eye, EyeOff,
} from 'lucide-react';

// ── Logo (shared with Navbar) ─────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 22 24" fill="none" aria-hidden="true">
      <path d="M17.6 3.6L15.1 2.2V10.2L7.6 14.6V22.5L10.1 24V16L15.1 13.1V21.8L17.6 20.4V3.6Z" fill="#012d2a"/>
      <path d="M11.3 24L13.9 22.5V15.3L11.3 16.8V24Z" fill="#012d2a"/>
      <path d="M10.1 0L7.6 1.4V8.8L10.1 7.3V0Z" fill="#012d2a"/>
      <path d="M2.5 19.6V4.4L0.4 5.6C0.2 5.7 0 6 0 6.3V17.7C0 18 0.2 18.3 0.4 18.4L2.5 19.6Z" fill="#012d2a"/>
      <path d="M3.8 3.6V20.4L6.3 21.8V13.9L13.9 9.5V1.4L11.3 0V8.1L6.3 11V2.2L3.8 3.6Z" fill="#012d2a"/>
      <path d="M21.4 17.7V6.3C21.4 6 21.3 5.7 21 5.6L18.9 4.4V19.6L21 18.4C21.3 18.3 21.4 18 21.4 17.7Z" fill="#012d2a"/>
    </svg>
  );
}

// ── Product catalogue ─────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'everyday-checking',
    category: 'Checking',
    icon: CheckCircle,
    badge: 'Most Popular',
    badgeColor: 'bg-[#4ade80] text-bank-dark',
    name: 'Everyday Checking',
    tagline: 'No fees, no minimums',
    highlights: ['$0 monthly fee', 'Free debit card', 'Mobile check deposit', 'Zelle® included'],
  },
  {
    id: 'perks-checking',
    category: 'Checking',
    icon: CheckCircle,
    badge: 'Best Value',
    badgeColor: 'bg-bank-accent/10 text-bank-accent border border-bank-accent/30',
    name: 'Perks Checking',
    tagline: 'Interest + extras',
    highlights: ['Interest-bearing', 'ATM fee waivers', 'Roadside assistance', 'Identity protection'],
  },
  {
    id: 'high-yield-savings',
    category: 'Savings',
    icon: PiggyBank,
    badge: '',
    badgeColor: '',
    name: 'High-Yield Savings',
    tagline: 'Up to 4.75% APY',
    highlights: ['No minimums', 'FDIC insured', 'Savings goals', 'No withdrawal fees'],
  },
  {
    id: 'certificate-of-deposit',
    category: 'Savings',
    icon: PiggyBank,
    badge: '',
    badgeColor: '',
    name: 'Certificate of Deposit',
    tagline: 'Lock in a great rate',
    highlights: ['3 mo – 5 yr terms', 'Up to 5.10% APY', 'From $500 to open', 'Auto-renew option'],
  },
  {
    id: 'rewards-card',
    category: 'Credit Card',
    icon: CreditCard,
    badge: 'New',
    badgeColor: 'bg-purple-100 text-purple-700 border border-purple-200',
    name: 'Hunch Rewards Visa®',
    tagline: '2% cash back everywhere',
    highlights: ['Unlimited 2% cash back', 'No annual fee', '$200 welcome bonus', 'Zero fraud liability'],
  },
  {
    id: 'business-checking',
    category: 'Business',
    icon: Building2,
    badge: '',
    badgeColor: '',
    name: 'Business Checking',
    tagline: 'Built for business',
    highlights: ['Unlimited transactions', 'Multi-user access', 'Free ACH transfers', 'Business debit card'],
  },
];

const CATEGORIES = ['All', 'Checking', 'Savings', 'Credit Card', 'Business'];

// Maps product catalogue IDs → backend account_type value
const PRODUCT_ACCOUNT_TYPE = {
  'everyday-checking':    'CHECKING',
  'perks-checking':       'CHECKING',
  'high-yield-savings':   'SAVINGS',
  'certificate-of-deposit': 'SAVINGS',
  'rewards-card':         'CHECKING',
  'business-checking':    'BUSINESS_CHECKING',
};

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Choose account' },
  { id: 2, label: 'Your info' },
  { id: 3, label: 'Address' },
  { id: 4, label: 'Identity' },
  { id: 5, label: 'Funding' },
  { id: 6, label: 'Review' },
];

// ── Shared field component ────────────────────────────────────────────────────
function Field({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-colors ${className}`}
    />
  );
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-bank-accent/30 focus:border-bank-accent transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Product selection
// ─────────────────────────────────────────────────────────────────────────────
function StepChoose({ data, onChange }) {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">What would you like to open?</h2>
      <p className="text-gray-500 text-sm mb-6">Select the account that fits your needs. You can add more later.</p>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === cat
                ? 'bg-bank-dark text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((product) => {
          const selected = data.productId === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onChange({ productId: product.id, productName: product.name })}
              className={`text-left border-2 rounded-2xl p-5 transition-all hover:shadow-md ${
                selected
                  ? 'border-bank-accent bg-bank-light shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <product.icon
                    size={18}
                    className={selected ? 'text-bank-accent' : 'text-gray-400'}
                    strokeWidth={1.8}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {product.category}
                  </span>
                </div>
                {product.badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${product.badgeColor}`}>
                    {product.badge}
                  </span>
                )}
              </div>
              <h3 className={`font-bold text-base mb-0.5 ${selected ? 'text-bank-dark' : 'text-gray-800'}`}>
                {product.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3">{product.tagline}</p>
              <ul className="space-y-1">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected ? 'bg-bank-accent' : 'bg-gray-300'}`} />
                    {h}
                  </li>
                ))}
              </ul>
              {selected && (
                <div className="mt-3 pt-3 border-t border-bank-accent/20 flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-bank-accent" />
                  <span className="text-xs font-semibold text-bank-accent">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Personal info
// ─────────────────────────────────────────────────────────────────────────────
function StepPersonal({ data, onChange, errors }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">Tell us about yourself</h2>
      <p className="text-gray-500 text-sm mb-6">We'll use this to verify your identity and set up your account.</p>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="First Name" required error={errors.firstName}>
            <Input
              name="firstName"
              value={data.firstName || ''}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="Jane"
              className={errors.firstName ? 'border-red-300' : 'border-gray-200'}
            />
          </Field>
          <Field label="Last Name" required error={errors.lastName}>
            <Input
              name="lastName"
              value={data.lastName || ''}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Smith"
              className={errors.lastName ? 'border-red-300' : 'border-gray-200'}
            />
          </Field>
        </div>
        <Field label="Date of Birth" required error={errors.dob}>
          <Input
            type="date"
            name="dob"
            value={data.dob || ''}
            onChange={(e) => onChange({ dob: e.target.value })}
            className={errors.dob ? 'border-red-300' : 'border-gray-200'}
          />
        </Field>
        <Field label="Email Address" required error={errors.email}>
          <Input
            type="email"
            name="email"
            value={data.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="jane@example.com"
            className={errors.email ? 'border-red-300' : 'border-gray-200'}
          />
        </Field>
        <Field label="Phone Number" required error={errors.phone}>
          <Input
            type="tel"
            name="phone"
            value={data.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(555) 555-5555"
            className={errors.phone ? 'border-red-300' : 'border-gray-200'}
          />
        </Field>
        <Field label="U.S. Citizenship Status" required error={errors.citizenship}>
          <Select
            name="citizenship"
            value={data.citizenship || ''}
            onChange={(e) => onChange({ citizenship: e.target.value })}
            className={errors.citizenship ? 'border-red-300' : 'border-gray-200'}
          >
            <option value="">Select...</option>
            <option>U.S. Citizen</option>
            <option>U.S. Permanent Resident</option>
            <option>Non-Resident with U.S. Work Visa</option>
          </Select>
        </Field>
        <Field label="Password" required error={errors.password}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={data.password || ''}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder="At least 8 characters"
              className={`pr-10 ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" required error={errors.confirmPassword}>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={data.confirmPassword || ''}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className={`pr-10 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Address
// ─────────────────────────────────────────────────────────────────────────────
function StepAddress({ data, onChange, errors }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">Your home address</h2>
      <p className="text-gray-500 text-sm mb-6">Enter your current residential address. P.O. Boxes are not accepted.</p>
      <div className="space-y-5">
        <Field label="Street Address" required error={errors.street}>
          <Input
            name="street"
            value={data.street || ''}
            onChange={(e) => onChange({ street: e.target.value })}
            placeholder="123 Main Street"
            className={errors.street ? 'border-red-300' : 'border-gray-200'}
          />
        </Field>
        <Field label="Apt / Suite / Unit" error={errors.unit}>
          <Input
            name="unit"
            value={data.unit || ''}
            onChange={(e) => onChange({ unit: e.target.value })}
            placeholder="Apt 4B (optional)"
            className="border-gray-200"
          />
        </Field>
        <div className="grid sm:grid-cols-3 gap-5">
          <div className="sm:col-span-1">
            <Field label="City" required error={errors.city}>
              <Input
                name="city"
                value={data.city || ''}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Columbus"
                className={errors.city ? 'border-red-300' : 'border-gray-200'}
              />
            </Field>
          </div>
          <Field label="State" required error={errors.state}>
            <Select
              name="state"
              value={data.state || ''}
              onChange={(e) => onChange({ state: e.target.value })}
              className={errors.state ? 'border-red-300' : 'border-gray-200'}
            >
              <option value="">State</option>
              {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s=>(
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="ZIP Code" required error={errors.zip}>
            <Input
              name="zip"
              value={data.zip || ''}
              onChange={(e) => onChange({ zip: e.target.value })}
              placeholder="43215"
              maxLength={5}
              className={errors.zip ? 'border-red-300' : 'border-gray-200'}
            />
          </Field>
        </div>
        <Field label="How long at this address?" required error={errors.residenceYears}>
          <Select
            name="residenceYears"
            value={data.residenceYears || ''}
            onChange={(e) => onChange({ residenceYears: e.target.value })}
            className={errors.residenceYears ? 'border-red-300' : 'border-gray-200'}
          >
            <option value="">Select...</option>
            <option>Less than 1 year</option>
            <option>1–2 years</option>
            <option>3–5 years</option>
            <option>More than 5 years</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Identity
// ─────────────────────────────────────────────────────────────────────────────
function StepIdentity({ data, onChange, errors }) {
  const [showSSN, setShowSSN] = useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">Verify your identity</h2>
      <p className="text-gray-500 text-sm mb-2">
        Federal law requires us to collect this information to verify your identity.
      </p>
      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
        <Lock size={13} className="text-blue-500 shrink-0" />
        <p className="text-blue-700 text-xs">Your information is encrypted with 256-bit SSL and never sold to third parties.</p>
      </div>
      <div className="space-y-5">
        <Field label="Social Security Number" required error={errors.ssn}>
          <div className="relative">
            <Input
              type={showSSN ? 'text' : 'password'}
              name="ssn"
              value={data.ssn || ''}
              onChange={(e) => onChange({ ssn: e.target.value })}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className={`pr-10 ${errors.ssn ? 'border-red-300' : 'border-gray-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowSSN((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSSN ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="ID Type" required error={errors.idType}>
          <Select
            name="idType"
            value={data.idType || ''}
            onChange={(e) => onChange({ idType: e.target.value })}
            className={errors.idType ? 'border-red-300' : 'border-gray-200'}
          >
            <option value="">Select ID type...</option>
            <option>Driver's License</option>
            <option>State-Issued ID</option>
            <option>U.S. Passport</option>
            <option>U.S. Military ID</option>
          </Select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="ID Number" required error={errors.idNumber}>
            <Input
              name="idNumber"
              value={data.idNumber || ''}
              onChange={(e) => onChange({ idNumber: e.target.value })}
              placeholder="ID number"
              className={errors.idNumber ? 'border-red-300' : 'border-gray-200'}
            />
          </Field>
          <Field label="ID Expiration Date" required error={errors.idExpiry}>
            <Input
              type="date"
              name="idExpiry"
              value={data.idExpiry || ''}
              onChange={(e) => onChange({ idExpiry: e.target.value })}
              className={errors.idExpiry ? 'border-red-300' : 'border-gray-200'}
            />
          </Field>
        </div>
        <Field label="Issuing State / Country" required error={errors.idState}>
          <Select
            name="idState"
            value={data.idState || ''}
            onChange={(e) => onChange({ idState: e.target.value })}
            className={errors.idState ? 'border-red-300' : 'border-gray-200'}
          >
            <option value="">Select...</option>
            <option>United States</option>
            {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s=>(
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5: Funding
// ─────────────────────────────────────────────────────────────────────────────
const FUNDING_OPTIONS = [
  {
    id: 'transfer',
    icon: '🏦',
    title: 'Transfer from another bank',
    desc: 'Link your external account using routing and account numbers.',
  },
  {
    id: 'direct-deposit',
    icon: '📄',
    title: 'Set up direct deposit',
    desc: "Use your Hunch account number and routing number. We'll provide them after opening.",
  },
  {
    id: 'mail-check',
    icon: '✉️',
    title: 'Mail a check',
    desc: 'Send a personal check to our processing center. Address provided after opening.',
  },
  {
    id: 'fund-later',
    icon: '⏳',
    title: 'Fund later',
    desc: 'Open your account now and fund it within 30 days to keep it active.',
  },
];

function StepFunding({ data, onChange }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">How would you like to fund your account?</h2>
      <p className="text-gray-500 text-sm mb-6">
        {data.productId === 'certificate-of-deposit'
          ? 'A minimum opening deposit of $500 is required for a CD.'
          : 'There is no minimum opening deposit required.'}
      </p>

      <div className="space-y-3 mb-6">
        {FUNDING_OPTIONS.map((opt) => {
          const selected = data.fundingMethod === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ fundingMethod: opt.id })}
              className={`w-full text-left border-2 rounded-2xl px-5 py-4 flex items-start gap-4 transition-all ${
                selected ? 'border-bank-accent bg-bank-light' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${selected ? 'text-bank-dark' : 'text-gray-800'}`}>{opt.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{opt.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                selected ? 'border-bank-accent bg-bank-accent' : 'border-gray-300'
              }`}>
                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {data.fundingMethod === 'transfer' && (
        <div className="bg-bank-surface border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-bank-dark">Link external account</p>
          <Field label="Bank Routing Number">
            <Input
              value={data.routingNumber || ''}
              onChange={(e) => onChange({ routingNumber: e.target.value })}
              placeholder="9-digit routing number"
              maxLength={9}
              className="border-gray-200"
            />
          </Field>
          <Field label="Account Number">
            <Input
              value={data.externalAccount || ''}
              onChange={(e) => onChange({ externalAccount: e.target.value })}
              placeholder="Account number"
              className="border-gray-200"
            />
          </Field>
          <Field label="Account Type">
            <Select
              value={data.externalAccountType || ''}
              onChange={(e) => onChange({ externalAccountType: e.target.value })}
              className="border-gray-200"
            >
              <option value="">Select...</option>
              <option>Checking</option>
              <option>Savings</option>
            </Select>
          </Field>
          <Field label="Opening Deposit Amount">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                type="number"
                min="0"
                value={data.depositAmount || ''}
                onChange={(e) => onChange({ depositAmount: e.target.value })}
                placeholder="0.00"
                className="border-gray-200 pl-7"
              />
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6: Review
// ─────────────────────────────────────────────────────────────────────────────
function StepReview({ data, onEdit }) {
  const product = PRODUCTS.find((p) => p.id === data.productId);
  const fundingLabel = FUNDING_OPTIONS.find((f) => f.id === data.fundingMethod)?.title || '—';

  const sections = [
    {
      title: 'Account',
      step: 1,
      rows: [['Product', product?.name || '—']],
    },
    {
      title: 'Personal Information',
      step: 2,
      rows: [
        ['Name', `${data.firstName || ''} ${data.lastName || ''}`.trim() || '—'],
        ['Date of Birth', data.dob || '—'],
        ['Email', data.email || '—'],
        ['Phone', data.phone || '—'],
        ['Citizenship', data.citizenship || '—'],
      ],
    },
    {
      title: 'Address',
      step: 3,
      rows: [
        ['Street', [data.street, data.unit].filter(Boolean).join(', ') || '—'],
        ['City / State / ZIP', [data.city, data.state, data.zip].filter(Boolean).join(', ') || '—'],
        ['Duration', data.residenceYears || '—'],
      ],
    },
    {
      title: 'Identity',
      step: 4,
      rows: [
        ['ID Type', data.idType || '—'],
        ['ID Number', data.idNumber ? `****${data.idNumber.slice(-4)}` : '—'],
        ['SSN', data.ssn ? '•••-••-' + data.ssn.slice(-4) : '—'],
      ],
    },
    {
      title: 'Funding',
      step: 5,
      rows: [
        ['Method', fundingLabel],
        ...(data.fundingMethod === 'transfer' ? [['Deposit Amount', data.depositAmount ? `$${data.depositAmount}` : '—']] : []),
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-bank-dark mb-1">Review your application</h2>
      <p className="text-gray-500 text-sm mb-6">
        Please review everything carefully before submitting. You can go back to edit any section.
      </p>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="font-semibold text-bank-dark text-sm">{sec.title}</p>
              <button
                type="button"
                onClick={() => onEdit(sec.step)}
                className="text-bank-accent text-xs font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {sec.rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" required className="mt-0.5 accent-bank-accent" />
          <span className="text-xs text-gray-500 leading-relaxed">
            I certify that the information I provided is accurate and complete. I agree to Hunch's{' '}
            <a href="/about" className="text-bank-accent hover:underline">Terms & Conditions</a>,{' '}
            <a href="/about" className="text-bank-accent hover:underline">Privacy Policy</a>, and{' '}
            the <a href="/about" className="text-bank-accent hover:underline">Deposit Account Agreement</a>.
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-0.5 accent-bank-accent" />
          <span className="text-xs text-gray-500 leading-relaxed">
            I agree to receive electronic statements and account notices. (Recommended — save paper.)
          </span>
        </label>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────
function Confirmation({ data }) {
  const product = PRODUCTS.find((p) => p.id === data.productId);
  const confirmationNumber = `HB-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-[#4ade80]/15 flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={40} className="text-[#4ade80]" strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl font-black text-bank-dark mb-2">You're approved!</h2>
      <p className="text-gray-500 text-sm mb-1">
        Your <strong className="text-bank-dark">{product?.name}</strong> has been created.
      </p>
      <p className="text-gray-400 text-xs mb-8">
        Confirmation #{confirmationNumber}
      </p>

      <div className="bg-bank-surface border border-gray-200 rounded-2xl p-6 text-left mb-8 max-w-sm mx-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-bank-accent mb-4">Next steps</p>
        <ul className="space-y-4">
          {[
            { icon: '📧', text: `We've sent a welcome email to ${data.email || 'your inbox'}.` },
            { icon: '🏦', text: 'Your account number and routing number are available in online banking.' },
            { icon: '💳', text: 'Your debit card will arrive in 5–7 business days (if applicable).' },
            { icon: '📱', text: 'Download the Hunch app to manage your account on the go.' },
          ].map(({ icon, text }) => (
            <li key={text} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{icon}</span>
              <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard"
          className="bg-bank-dark hover:bg-bank-mid text-white font-bold px-8 py-3 rounded-full transition-colors text-sm"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/"
          className="border border-gray-200 text-gray-600 hover:border-gray-400 font-semibold px-8 py-3 rounded-full transition-colors text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
function validate(step, data) {
  const errs = {};
  if (step === 1) {
    if (!data.productId) errs._root = 'Please select an account to continue.';
  }
  if (step === 2) {
    if (!data.firstName?.trim()) errs.firstName = 'Required';
    if (!data.lastName?.trim())  errs.lastName  = 'Required';
    if (!data.dob)               errs.dob       = 'Required';
    if (!data.email?.includes('@')) errs.email  = 'Valid email required';
    if (!data.phone?.trim())     errs.phone     = 'Required';
    if (!data.citizenship)       errs.citizenship = 'Required';
    if (!data.password || data.password.length < 8) errs.password = 'At least 8 characters required';
    if (data.password !== data.confirmPassword)      errs.confirmPassword = 'Passwords do not match';
  }
  if (step === 3) {
    if (!data.street?.trim()) errs.street = 'Required';
    if (!data.city?.trim())   errs.city   = 'Required';
    if (!data.state)          errs.state  = 'Required';
    if (!/^\d{5}$/.test(data.zip || '')) errs.zip = '5-digit ZIP required';
    if (!data.residenceYears) errs.residenceYears = 'Required';
  }
  if (step === 4) {
    if (!data.ssn?.trim())    errs.ssn      = 'Required';
    if (!data.idType)         errs.idType   = 'Required';
    if (!data.idNumber?.trim()) errs.idNumber = 'Required';
    if (!data.idExpiry)       errs.idExpiry = 'Required';
    if (!data.idState)        errs.idState  = 'Required';
  }
  if (step === 5) {
    if (!data.fundingMethod)  errs._root = 'Please choose a funding method.';
  }
  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ApplyOnline() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const topRef = useRef(null);
  const { login } = useAuth();

  // Pre-select product if passed via query (?product=everyday-checking)
  const [formData, setFormData] = useState(() => ({
    productId: searchParams.get('product') || '',
    productName: PRODUCTS.find((p) => p.id === searchParams.get('product'))?.name || '',
  }));

  const update = (partial) => {
    setFormData((d) => ({ ...d, ...partial }));
    setErrors({});
  };

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleNext = async () => {
    const errs = validate(step, formData);
    if (Object.keys(errs).length > 0) { setErrors(errs); scrollTop(); return; }
    setErrors({});
    if (step === 6) {
      setSubmitting(true);
      setApiError('');
      try {
        await api.post('/auth/register', {
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
        });
        await login(formData.email, formData.password);
        // Open the account the user specifically chose (registration auto-creates
        // CHECKING + SAVINGS; this adds the selected product as a dedicated account)
        const accountType = PRODUCT_ACCOUNT_TYPE[formData.productId];
        if (accountType) {
          try {
            await api.post('/accounts/open', { account_type: accountType });
          } catch (_) {
            // Non-fatal: user still has default accounts from registration
          }
        }
        setSubmitted(true);
        scrollTop();
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : 'Registration failed. Please try again.';
        setApiError(msg);
        scrollTop();
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
    scrollTop();
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
    scrollTop();
  };

  const handleEdit = (targetStep) => {
    setErrors({});
    setStep(targetStep);
    scrollTop();
  };

  const currentProduct = PRODUCTS.find((p) => p.id === formData.productId);
  const progress = submitted ? 100 : Math.round(((step - 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" ref={topRef}>
      {/* ── Minimal header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="font-bold text-bank-dark text-lg tracking-tight">
              Hunch<span className="text-[#4ade80]">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock size={12} className="text-bank-accent" />
            <span className="hidden sm:inline">Secure application</span>
            <ShieldCheck size={12} className="text-bank-accent sm:ml-1" />
            <span className="hidden sm:inline text-gray-400">256-bit SSL</span>
          </div>
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Exit ✕
          </Link>
        </div>

        {/* Progress bar */}
        {!submitted && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-[#4ade80] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">

          {submitted ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <Confirmation data={formData} />
            </div>
          ) : (
            <div className="grid md:grid-cols-[1fr_260px] gap-6 items-start">
              {/* ── Main form card ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                {/* Step tracker (mobile: inline; desktop: in sidebar) */}
                <div className="flex md:hidden items-center gap-1.5 mb-6 text-xs overflow-x-auto pb-1">
                  {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step > s.id ? 'bg-[#4ade80] text-bank-dark'
                          : step === s.id ? 'bg-bank-dark text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step > s.id ? '✓' : s.id}
                      </div>
                      {i < STEPS.length - 1 && <div className={`w-4 h-px ${step > s.id ? 'bg-[#4ade80]' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                  <span className="ml-2 text-gray-400 shrink-0">{STEPS[step - 1]?.label}</span>
                </div>

                {(errors._root || apiError) && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-red-600 text-sm">
                    <AlertCircle size={15} className="shrink-0" />
                    {apiError || errors._root}
                  </div>
                )}

                {/* Step content */}
                {step === 1 && <StepChoose data={formData} onChange={update} />}
                {step === 2 && <StepPersonal data={formData} onChange={update} errors={errors} />}
                {step === 3 && <StepAddress data={formData} onChange={update} errors={errors} />}
                {step === 4 && <StepIdentity data={formData} onChange={update} errors={errors} />}
                {step === 5 && <StepFunding data={formData} onChange={update} />}
                {step === 6 && <StepReview data={formData} onEdit={handleEdit} />}

                {/* Navigation */}
                <div className={`flex mt-8 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-bank-dark font-semibold transition-colors px-4 py-2.5 rounded-full hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={(step === 1 && !formData.productId) || submitting}
                    className="flex items-center gap-1.5 bg-bank-dark hover:bg-bank-mid disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-7 py-2.5 rounded-full transition-colors text-sm ml-auto"
                  >
                    {submitting ? 'Submitting…' : step === 6 ? 'Submit Application' : 'Continue'}
                    {!submitting && <ChevronRight size={16} />}
                  </button>
                </div>
              </div>

              {/* ── Sidebar ── */}
              <div className="hidden md:flex flex-col gap-4">
                {/* Step ladder */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Application steps</p>
                  <ul className="space-y-3">
                    {STEPS.map((s) => (
                      <li key={s.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          step > s.id ? 'bg-[#4ade80] text-bank-dark'
                            : step === s.id ? 'bg-bank-dark text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {step > s.id ? '✓' : s.id}
                        </div>
                        <span className={`text-sm ${
                          step === s.id ? 'font-semibold text-bank-dark'
                            : step > s.id ? 'text-gray-400 line-through'
                            : 'text-gray-400'
                        }`}>
                          {s.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selected product */}
                {currentProduct && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Opening</p>
                    <p className="font-bold text-bank-dark text-sm">{currentProduct.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5 mb-3">{currentProduct.tagline}</p>
                    <ul className="space-y-1.5">
                      {currentProduct.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CheckCircle size={11} className="text-[#4ade80] shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trust badges */}
                <div className="bg-bank-surface rounded-2xl border border-gray-100 p-5">
                  <ul className="space-y-2.5">
                    {[
                      { icon: ShieldCheck, text: 'FDIC insured up to $250,000' },
                      { icon: Lock,        text: '256-bit SSL encryption' },
                      { icon: CheckCircle, text: 'No hidden fees, ever' },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2 text-xs text-gray-500">
                        <Icon size={12} className="text-[#4ade80] shrink-0" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Minimal footer ── */}
      <footer className="bg-white border-t border-gray-200 py-5 px-4 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Hunch Financial, Inc. · Member FDIC · Demo app — not a real bank.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Accessibility'].map((l) => (
              <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
