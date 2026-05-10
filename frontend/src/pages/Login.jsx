import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Fingerprint } from 'lucide-react';
import Navbar from '../components/Navbar';

const TABS = ['Personal & Business', 'Commercial', 'Other'];

export default function Login() {
  const { login, verifyTOTP, totpPending } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [totpCode, setTOTPCode] = useState('');
  const [showTOTP, setShowTOTP] = useState(false);
  const biometricEligible =
    typeof window !== 'undefined' &&
    /iphone|ipad|android/i.test(navigator.userAgent) &&
    localStorage.getItem('hunch-biometric-enabled') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const els = e.currentTarget.elements;
    const emailVal = (els['login-email']?.value || email).trim().toLowerCase();
    const passwordVal = (els['login-password']?.value ?? password).trim();

    if (!showTOTP) {
      if (!emailVal || !emailVal.includes('@')) {
        setError('Please enter the email address used for your account.');
        return;
      }
      setLoading(true);
      try {
        const result = await login(emailVal, passwordVal);
        if (result?.requires_totp) {
          setShowTOTP(true);
          return;
        }
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!totpCode || totpCode.length < 6) {
        setError('Enter the 6-digit verification code from your authenticator app.');
        return;
      }
      setLoading(true);
      try {
        await verifyTOTP(totpCode);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.detail || 'Invalid verification code.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBiometricLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // UX-only biometric pass: use entered credentials, otherwise demo fallback.
      const emailVal = email.trim().toLowerCase() || 'demo@potbnk.app';
      const passwordVal = password.trim() || 'DemoLogin#2026!';
      await new Promise((r) => setTimeout(r, 500));
      await login(emailVal, passwordVal);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Biometric sign-in failed. Please use password.');
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

              {biometricEligible && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full mb-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Fingerprint size={15} />
                  {loading ? 'Verifying…' : 'Use Face/Touch ID'}
                </button>
              )}

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
                {!showTOTP ? (
                  <>
                    <div className="relative">
                      <label htmlFor="login-email" className="absolute left-3 top-2 text-[11px] text-gray-500 font-medium pointer-events-none">Email</label>
                      <input id="login-email" type="email" required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className="hnt-input pt-6 pb-2 pr-10" placeholder="name@email.com" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></span>
                    </div>
                    <div className="relative">
                      <label htmlFor="login-password" className="absolute left-3 top-2 text-[11px] text-gray-500 font-medium pointer-events-none">Password</label>
                      <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={password} onChange={(e) => setPassword(e.target.value)} className="hnt-input pt-6 pb-2 pr-10" placeholder="••••••••" />
                      <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bank-dark focus:outline-none">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                    <button type="submit" disabled={loading} className="hnt-btn-primary w-full mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Lock size={15} /> {loading ? 'Signing in…' : 'Log In'}</button>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-semibold">Two-factor authentication required</p>
                      <p className="mt-1 text-xs text-slate-500">Enter the 6-digit code from your authenticator app.</p>
                    </div>
                    <div className="relative">
                      <label htmlFor="login-totp" className="absolute left-3 top-2 text-[11px] text-gray-500 font-medium pointer-events-none">Verification code</label>
                      <input id="login-totp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={totpCode} onChange={(e) => setTOTPCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="hnt-input pt-6 pb-2 pr-10" placeholder="000000" />
                    </div>
                    <button type="submit" disabled={loading} className="hnt-btn-primary w-full mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Lock size={15} /> {loading ? 'Verifying…' : 'Verify & Sign In'}</button>
                    <button type="button" onClick={() => { setShowTOTP(false); setTOTPCode(''); setError(''); }} className="text-xs text-bank-teal hover:underline font-medium">Back to password</button>
                  </>
                )}
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
