import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({ new_password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-bank-surface">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-xl shadow-md p-8 text-center">
            <AlertCircle size={32} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-bank-dark mb-2">Invalid reset link</h2>
            <p className="text-sm text-gray-500 mb-5">
              This link is missing a reset token. Please go back and request a new link.
            </p>
            <Link to="/forgot-password" className="text-bank-teal hover:underline text-sm font-medium">
              Request a new reset link →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.new_password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bank-surface">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-md p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5 mx-auto">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-bank-dark mb-2">Password updated!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been changed. Redirecting you to sign in…
            </p>
            <Link
              to="/login"
              className="block w-full text-center bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors text-sm"
            >
              Sign in now →
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
          <div className="w-12 h-12 rounded-full bg-bank-surface flex items-center justify-center mb-5">
            <Lock size={22} className="text-bank-dark" />
          </div>

          <h2 className="text-xl font-bold text-bank-dark mb-1">Set a new password</h2>
          <p className="text-sm text-gray-500 mb-6">Must be at least 8 characters.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <label htmlFor="new-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
                New password
              </label>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                className="hnt-input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-bank-dark focus:outline-none"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-600 mb-1.5">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="hnt-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hnt-btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={15} />
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <p className="text-center mt-5">
            <Link to="/forgot-password" className="text-xs text-bank-teal hover:underline">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
