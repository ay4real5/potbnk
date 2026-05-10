import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { ArrowLeft, ShieldCheck, ShieldAlert, Smartphone, Laptop } from 'lucide-react';

export default function LoginActivity() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/login-activity')
      .then(({ data }) => setAttempts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (ua) => {
    const lower = (ua || '').toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return <Smartphone size={16} />;
    return <Laptop size={16} />;
  };

  return (
    <BankShell title="Login Activity">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/settings" className="text-slate-400 hover:text-slate-600 dark:hover:text-white/70"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Login Activity</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Recent sign-ins to your account</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">No login activity recorded yet.</div>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  {a.success ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{a.success ? 'Successful login' : 'Failed attempt'}</span>
                    <span className="text-[10px] text-slate-400">· {getIcon(a.user_agent)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{a.ip_address} {a.device ? `· ${a.device}` : ''}</p>
                  {a.failure_reason && <p className="text-xs text-red-500 mt-0.5">{a.failure_reason}</p>}
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BankShell>
  );
}
