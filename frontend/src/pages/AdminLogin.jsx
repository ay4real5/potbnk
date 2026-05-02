import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const me = await login(email.trim().toLowerCase(), password.trim());
      if (!me?.is_admin) {
        setError('This account is not authorized for admin access.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#052f2d] text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-7 sm:p-8 shadow-2xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/60 mb-2">Hunch Admin</p>
        <h1 className="text-2xl font-bold mb-6">Admin Sign In</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300/30 bg-red-500/10 text-red-100 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs text-white/70 mb-1.5">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
              placeholder="admin@yourbank.com"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 pr-10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55 hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8fdb46] text-bank-dark font-bold py-2.5 flex items-center justify-center gap-2 hover:brightness-105 transition-colors disabled:opacity-60"
          >
            <ShieldCheck size={16} />
            {loading ? 'Verifying…' : 'Enter Admin Console'}
          </button>
        </form>

        <p className="mt-5 text-xs text-white/60">
          Admin access is restricted. Configure credentials via environment variables.
        </p>
        <Link to="/login" className="mt-2 inline-block text-xs text-[#8fdb46] hover:underline">
          Back to customer login
        </Link>
      </div>
    </div>
  );
}
