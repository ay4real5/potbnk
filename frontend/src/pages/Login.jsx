import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';

const TABS = ['Personal & Business', 'Commercial', 'Other'];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Read directly from DOM so browser-autofilled values (which don't
    // always trigger React onChange on mobile) are captured correctly.
    const els = e.currentTarget.elements;
    const emailVal = (els['login-email']?.value || form.email).trim().toLowerCase();
    const passwordVal = els['login-password']?.value ?? form.password;
    if (!emailVal || !emailVal.includes('@')) {
      setError('Please enter the email address used for your account.');
      return;
    }
    setLoading(true);
    try {
      await login(emailVal, passwordVal);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bank-surface">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {/* Login Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">

            {/* Account type tabs */}
            <div className="flex border-b border-gray-200">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors focus:outline-none ${
                    activeTab === i
                      ? 'bg-bank-dark text-white'
                      : 'text-bank-dark hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-8">
              {/* FDIC badge */}
              <div className="flex items-start gap-2.5 mb-5">
                <span className="mt-0.5 shrink-0 text-[9px] font-black text-white bg-bank-dark px-1.5 py-0.5 rounded-sm tracking-widest">
                  FDIC
                </span>
                <p className="text-xs text-gray-500 italic leading-snug">
                  FDIC-Insured—Backed by the full faith and credit of the U.S. Government
                </p>
              </div>

              <h2 className="text-xl font-bold text-bank-dark mb-5">Log into Online Banking</h2>

              {sessionExpired && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 mb-5">
                  Your session expired. Please sign in again.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="login-email"
                    className="absolute left-3 top-2 text-[11px] text-gray-500 font-medium pointer-events-none"
                  >
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="hnt-input pt-6 pb-2 pr-10"
                    placeholder="name@email.com"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                </div>

                {/* Password */}
                <div className="relative">
                  <label
                    htmlFor="login-password"
                    className="absolute left-3 top-2 text-[11px] text-gray-500 font-medium pointer-events-none"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="hnt-input pt-6 pb-2 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bank-dark focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="hnt-btn-primary w-full mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock size={15} />
                  {loading ? 'Signing in…' : 'Log In'}
                </button>
              </form>

              {/* Forgot links */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4">
                <a href="#" className="text-xs text-bank-teal hover:underline font-medium">
                  Forgot Username?
                </a>
                <Link to="/forgot-password" className="text-xs text-bank-teal hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>

              {/* Enroll section */}
              <div className="border-t border-gray-100 mt-5 pt-5">
                <p className="text-sm font-semibold text-bank-dark mb-1">New to Online Banking?</p>
                <p className="text-sm text-gray-500">
                  <Link to="/register" className="text-bank-teal hover:underline font-semibold">
                    Enroll Now
                  </Link>{' '}
                  or{' '}
                  <Link to="/register" className="text-bank-teal hover:underline font-medium">
                    Learn More
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
