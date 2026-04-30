import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { Mail, ArrowLeft, CheckCircle, Copy } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [copied, setCopied] = useState(false);

  const resetUrl = resetToken
    ? `${window.location.origin}/reset-password?token=${resetToken}`
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      if (data.reset_token) {
        setResetToken(data.reset_token);
      } else {
        // Email not found — show generic success (no enumeration)
        setResetToken('not-found');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state — token found, show clickable link (demo behaviour)
  if (resetToken && resetToken !== 'not-found') {
    return (
      <div className="min-h-screen bg-bank-surface">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-8">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5 mx-auto">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-bank-dark text-center mb-2">Reset link ready</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              In production this link would be emailed. For this demo, use it directly below.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
              <p className="text-xs font-semibold text-amber-700 mb-1">Demo only — not a real email</p>
              <p className="text-xs text-amber-600">
                A real bank would send this link to your inbox. This token expires in 1 hour.
              </p>
            </div>

            <div className="flex gap-2 mb-5">
              <input
                readOnly
                value={resetUrl}
                className="hnt-input text-xs flex-1 font-mono"
              />
              <button
                onClick={copyLink}
                className="shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:border-bank-dark hover:text-bank-dark transition-colors"
                title="Copy link"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>

            <Link
              to={`/reset-password?token=${resetToken}`}
              className="block w-full text-center bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors text-sm"
            >
              Go to Reset Password →
            </Link>

            <p className="text-center mt-4">
              <Link to="/login" className="text-xs text-bank-teal hover:underline">
                ← Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Generic success (email not in system — don't reveal this)
  if (resetToken === 'not-found') {
    return (
      <div className="min-h-screen bg-bank-surface">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-5 mx-auto">
              <Mail size={28} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-bank-dark mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500 mb-6">
              If <strong>{email}</strong> is registered, a reset link has been sent.
            </p>
            <Link to="/login" className="text-sm text-bank-teal hover:underline font-medium">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bank-surface">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-bank-dark text-xs mb-6 transition-colors"
          >
            <ArrowLeft size={13} /> Back to sign in
          </Link>

          <div className="w-12 h-12 rounded-full bg-bank-surface flex items-center justify-center mb-5">
            <Mail size={22} className="text-bank-dark" />
          </div>

          <h2 className="text-xl font-bold text-bank-dark mb-1">Forgot your password?</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email and we'll generate a reset link.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hnt-input"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hnt-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={15} />
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
