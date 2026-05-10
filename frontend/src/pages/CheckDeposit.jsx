import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { Camera, CheckCircle, Clock, FileImage, Plus, X } from 'lucide-react';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CheckDeposit() {
  const toast = useToast();
  const [deposits, setDeposits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ account_id: '', amount: '', memo: '' });

  useEffect(() => {
    loadDeposits();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setForm((f) => ({ ...f, account_id: data[0].id })); }).catch(() => {});
  }, []);

  const loadDeposits = () => {
    setLoading(true);
    api.get('/check-deposits/').then(({ data }) => setDeposits(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.account_id || !form.amount || Number(form.amount) <= 0) {
      toast.error('Enter a valid amount and account.');
      return;
    }
    try {
      await api.post('/check-deposits/', { account_id: form.account_id, amount: Number(form.amount), memo: form.memo });
      toast.success('Check submitted for review. Funds will be available in 1-2 business days.');
      setShowForm(false);
      setForm({ account_id: accounts[0]?.id || '', amount: '', memo: '' });
      loadDeposits();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed.');
    }
  };

  const handleClear = async (id) => {
    try {
      await api.post(`/check-deposits/${id}/clear`);
      toast.success('Check cleared and funds deposited.');
      loadDeposits();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Clear failed.');
    }
  };

  return (
    <BankShell title="Check Deposit">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mobile Check Deposit</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Deposit checks from your device</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Deposit Check
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Hold Policy</p>
              <p className="text-xs text-slate-400 mt-0.5">Checks are held for 1-2 business days for verification. Funds become available after clearance.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : deposits.length === 0 ? (
          <div className="text-center py-20">
            <FileImage size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No check deposits yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.status === 'CLEARED' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                    {d.status === 'CLEARED' ? <CheckCircle size={18} className="text-emerald-600" /> : <Clock size={18} className="text-amber-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">${formatMoney(d.amount)}</p>
                    <p className="text-xs text-slate-400 truncate">{d.memo || 'Mobile check deposit'} · {new Date(d.created_at).toLocaleDateString()}</p>
                    {d.hold_until && d.status === 'PENDING' && <p className="text-[10px] text-amber-500 mt-0.5 truncate">Hold until {new Date(d.hold_until).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${d.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-emerald-400'}`}>{d.status}</span>
                  {d.status === 'PENDING' && (
                    <button onClick={() => handleClear(d.id)} className="text-xs font-semibold text-bank-teal hover:underline">Clear now</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Deposit Check</h3>
            <div className="mt-4 space-y-3">
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)}</option>)}
              </select>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Check amount" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.memo} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} placeholder="Memo (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleSubmit} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Submit</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
