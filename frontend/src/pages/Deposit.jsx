import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const DEPOSIT_METHODS = [
  { id: 'bank',    icon: '🏦', label: 'Bank Transfer',   sub: '2–3 business days'   },
  { id: 'instant', icon: '⚡', label: 'Instant Transfer', sub: 'Arrives immediately' },
  { id: 'card',    icon: '💳', label: 'Card Deposit',     sub: 'Arrives in minutes'  },
];

export default function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Deposit' });
  const [method, setMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
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
    try {
      const { data } = await api.post('/accounts/deposit', { ...form, amount: parseFloat(form.amount) });
      toast.success(data.message || 'Deposit successful.');
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setForm((f) => ({ ...f, amount: '', description: 'Deposit' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed. Please try again.');
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
      ? 'bg-[#063b36] text-white'
      : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/15');

  const methodCardCls = (id) =>
    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ' +
    (method === id
      ? 'border-[#063b36] bg-[#063b36]/5 dark:bg-[#063b36]/20'
      : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20');

  const methodLabelCls = (id) =>
    'text-xs font-bold leading-tight ' +
    (method === id ? 'text-[#063b36] dark:text-[#7CFC00]' : 'text-slate-700 dark:text-white/70');

  return (
    <BankShell title="Deposit Funds">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Deposit Funds</h1>
          <p className="text-slate-400 mt-1">Add money to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Amount card */}
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-8">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Amount</label>

            <div className="flex items-center justify-center mb-2">
              <span className="text-5xl text-slate-200 dark:text-white/20 font-light mr-1 select-none">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
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
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">TO ACCOUNT</label>
              <select
                value={form.account_id}
                onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.replace(/_/g, ' ')} · ••••{a.account_number.slice(-4)} — ${parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              {selectedAccount && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Current balance: <span className="font-semibold text-slate-700 dark:text-white/70">${parseFloat(selectedAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </p>
              )}
            </div>
          </div>

          {/* Deposit method card */}
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white/80 mb-4">Deposit Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {DEPOSIT_METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                  className={methodCardCls(m.id)}>
                  <span className="text-2xl">{m.icon}</span>
                  <span className={methodLabelCls(m.id)}>{m.label}</span>
                  <span className="text-[10px] text-slate-400">{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.account_id || !form.amount}
            className="w-full bg-[#063b36] text-white rounded-xl py-4 text-base font-semibold hover:bg-[#041f1c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
              : 'Deposit $' + amtFmt}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={12} />
            <span>FDIC insured up to $250,000 per depositor</span>
          </div>
        </form>
      </div>
    </BankShell>
  );
}
