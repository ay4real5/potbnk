import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [50, 100, 250, 500];

const WITHDRAW_DEST = [
  { id: 'bank', icon: '🏦', label: 'External Bank Account', sub: '3–5 business days' },
  { id: 'card', icon: '💳', label: 'Debit Card',            sub: '30 minutes'        },
];

export default function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Withdrawal' });
  const [destination, setDestination] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [successAmt, setSuccessAmt] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, account_id: data[0].id }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const amount = parseFloat(form.amount);
    try {
      const { data } = await api.post('/accounts/withdraw', { ...form, amount });
      setSuccessAmt(amount);
      setTimeout(() => setSuccessAmt(null), 3000);
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setForm((f) => ({ ...f, amount: '', description: 'Withdrawal' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.account_id);
  const amtFmt = form.amount
    ? parseFloat(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '0.00';

  const chipCls = (amt) =>
    'px-4 py-1.5 rounded-full text-sm font-semibold transition-all ' +
    (parseFloat(form.amount) === amt
      ? 'bg-red-600 text-white'
      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/15');

  const destCardCls = (id) =>
    'flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ' +
    (destination === id
      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20');

  const destLabelCls = (id) =>
    'text-xs font-bold ' +
    (destination === id ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-white/70');

  return (
    <BankShell title="Withdraw Funds">
      {/* ── Success Overlay ────────────────────────────────────────────── */}
      {successAmt !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <style>{`
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes popIn  { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
          `}</style>
          <div className="bg-white dark:bg-[#111a18] rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-4 text-center max-w-xs w-full mx-4"
            style={{ animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <CheckCircle size={36} className="text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">
                -${successAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-slate-500 dark:text-white/50 mt-1">Withdrawal successful</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Withdraw Funds</h1>
          <p className="text-slate-400 mt-1">Move money to your external account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Amount card */}
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 sm:p-8">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Amount</label>

            <div className="flex items-center justify-center mb-2">
              <span className="text-5xl text-slate-200 dark:text-white/20 font-light mr-1 select-none">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                max={selectedAccount ? parseFloat(selectedAccount.balance) : undefined}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="text-5xl font-bold bg-transparent dark:text-white focus:outline-none tabular-nums text-center w-48"
                placeholder="0.00"
              />
            </div>

            {/* Quick chips */}
            <div className="flex gap-2 justify-center flex-wrap mt-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button key={amt} type="button"
                  onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                  className={chipCls(amt)}>
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Account selector */}
            <div className="mt-6">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">FROM ACCOUNT</label>
              <select
                value={form.account_id}
                onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.replace(/_/g, ' ')} · ••••{a.account_number.slice(-4)} — ${parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              {/* Warning bar */}
              <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Daily withdrawal limit: $10,000. You have $10,000 remaining today.
                </p>
              </div>
            </div>
          </div>

          {/* Destination card */}
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white/80 mb-4">Withdraw To</h3>
            <div className="grid grid-cols-2 gap-3">
              {WITHDRAW_DEST.map((d) => (
                <button key={d.id} type="button" onClick={() => setDestination(d.id)}
                  className={destCardCls(d.id)}>
                  <span className="text-2xl">{d.icon}</span>
                  <span className={destLabelCls(d.id)}>{d.label}</span>
                  <span className="text-[10px] text-slate-400">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white rounded-xl py-4 text-base font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
              : 'Withdraw $' + amtFmt}
          </button>

          <p className="text-center text-xs text-slate-400">Funds will be debited immediately from your account</p>
        </form>
      </div>
    </BankShell>
  );
}
