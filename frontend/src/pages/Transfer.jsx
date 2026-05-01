import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { Search, UserCheck, ShieldCheck, ArrowDown, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    sender_account_id: '',
    receiver_account_id: '',
    amount: '',
    description: 'Transfer',
  });
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);
  const [recentTx, setRecentTx] = useState([]);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, sender_account_id: data[0].id }));
    });
    api.get('/accounts/transactions?limit=3').then(({ data }) => setRecentTx(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const trimmed = recipientInput.trim().toUpperCase();
    setResolvedRecipient(null);
    setLookupError('');
    if (!trimmed) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLooking(true);
      try {
        const { data } = await api.get('/accounts/lookup?account_number=' + encodeURIComponent(trimmed));
        if (accounts.some((a) => a.id === data.id)) {
          setLookupError('You cannot transfer to your own account.');
        } else {
          setResolvedRecipient(data);
          setForm((f) => ({ ...f, receiver_account_id: data.id }));
        }
      } catch (err) {
        setLookupError(err.response?.data?.detail || 'Account not found.');
      } finally {
        setLooking(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [recipientInput, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedRecipient) { toast.error('Please enter a valid recipient account number.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/accounts/transfer', { ...form, amount: parseFloat(form.amount) });
      toast.success(data.message || 'Transfer completed.');
      setResolvedRecipient(null);
      setRecipientInput('');
      setForm((f) => ({ ...f, receiver_account_id: '', amount: '', description: 'Transfer' }));
      api.get('/accounts/transactions?limit=3').then(({ data: d }) => setRecentTx(d)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSender = accounts.find((a) => a.id === form.sender_account_id);
  const amountFmt = form.amount
    ? parseFloat(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
    : '0.00';

  return (
    <BankShell title="Send Money">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Send Money</h1>
          <p className="text-slate-400 text-sm mt-1">Transfer between your accounts instantly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT — form */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111a18] rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* From */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">FROM ACCOUNT</label>
                <select
                  value={form.sender_account_id}
                  onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36] appearance-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.account_type.replace(/_/g, ' ')} &middot; &bull;&bull;&bull;&bull;{a.account_number.slice(-4)} &mdash; ${parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
                {selectedSender && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Available: <span className="font-semibold text-slate-700 dark:text-white/70">${parseFloat(selectedSender.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </p>
                )}
              </div>

              {/* Arrow divider */}
              <div className="flex items-center justify-center -my-2">
                <div className="w-9 h-9 rounded-full bg-[#063b36] text-white flex items-center justify-center shadow-md">
                  <ArrowDown size={16} />
                </div>
              </div>

              {/* To — account number lookup */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">TO ACCOUNT</label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36] pr-10"
                    placeholder="Enter account number (e.g. PRO-1234567890)"
                    autoComplete="off"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {looking
                      ? <span className="w-4 h-4 border-2 border-[#063b36] border-t-transparent rounded-full animate-spin block" />
                      : <Search size={15} />}
                  </span>
                </div>
                {resolvedRecipient && (
                  <div className="mt-2 flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-2.5">
                    <UserCheck size={15} className="text-emerald-600 shrink-0" />
                    <p className="text-sm">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">{resolvedRecipient.holder_name}</span>
                      <span className="text-emerald-600 dark:text-emerald-500"> &middot; {resolvedRecipient.account_type} &middot; &bull;&bull;&bull;&bull;{resolvedRecipient.account_number.slice(-4)}</span>
                    </p>
                  </div>
                )}
                {lookupError && <p className="mt-1.5 text-xs text-red-600">{lookupError}</p>}
              </div>

              {/* Amount — big centered */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 text-center">AMOUNT</label>
                <div className="relative bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 px-8 py-6 flex items-center justify-center">
                  <span className="text-4xl text-slate-300 dark:text-white/20 font-light mr-1 select-none">$</span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="text-4xl font-bold bg-transparent dark:text-white focus:outline-none tabular-nums text-center w-full"
                    placeholder="0.00"
                  />
                </div>
                {selectedSender && (
                  <p className="text-xs text-slate-400 text-center mt-1.5">
                    Available: ${parseFloat(selectedSender.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#063b36]"
                  placeholder="Add a note (optional)"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !resolvedRecipient}
                className="w-full bg-[#063b36] text-white rounded-xl py-4 text-lg font-semibold hover:bg-[#041f1c] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending&hellip;</span>
                  : 'Transfer Now →'}
              </button>
              <p className="text-center text-xs text-slate-400">Transfers are instant and cannot be reversed</p>
            </form>
          </div>

          {/* RIGHT — dark preview */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-[#063b36] rounded-2xl p-7 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-5">Transfer Summary</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">From</span>
                  <span className="text-sm font-semibold text-white/80 text-right max-w-[160px] truncate">
                    {selectedSender ? selectedSender.account_type.replace(/_/g, ' ') + ' ••••' + selectedSender.account_number.slice(-4) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">To</span>
                  <span className="text-sm font-semibold text-white/80 text-right max-w-[160px] truncate">
                    {resolvedRecipient ? resolvedRecipient.holder_name : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Amount</span>
                  <span className="text-2xl font-bold text-[#7CFC00] tabular-nums">${amountFmt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Date</span>
                  <span className="text-sm font-semibold text-white/80">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Status</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {resolvedRecipient ? 'Ready to send' : 'Waiting…'}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/10 my-5" />
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#7CFC00] shrink-0" />
                <p className="text-xs text-white/40">256-bit encrypted transfer</p>
              </div>
            </div>

            {recentTx.length > 0 && (
              <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} className="text-slate-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Activity</p>
                </div>
                <ul className="space-y-3">
                  {recentTx.map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-white/70 truncate max-w-[140px]">{tx.description || tx.type}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <span className={tx.type === 'DEPOSIT' ? 'font-bold text-emerald-600' : 'font-bold text-red-500'}>
                        {tx.type === 'DEPOSIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </BankShell>
  );
}
