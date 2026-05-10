import { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle, ArrowRight, Camera, CheckCircle, ChevronRight, Clock,
  Copy, FileImage, ImagePlus, Landmark, Plus, ShieldCheck, X, Zap,
} from 'lucide-react';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CheckDeposit() {
  const toast = useToast();
  const [deposits, setDeposits] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ account_id: '', amount: '', memo: '' });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    loadDeposits();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setForm((f) => ({ ...f, account_id: data[0].id })); }).catch(() => {});
  }, []);

  const loadDeposits = () => {
    setLoading(true);
    api.get('/check-deposits/').then(({ data }) => setDeposits(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const selectedAccount = accounts.find((a) => a.id === form.account_id);
  const numericAmount = Number(form.amount || 0);
  const canSubmit = form.account_id && numericAmount > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Enter a valid amount and account.');
      return;
    }
    try {
      await api.post('/check-deposits/', { account_id: form.account_id, amount: numericAmount, memo: form.memo });
      toast.success('Check submitted for review. Funds will be available in 1-2 business days.');
      setForm({ account_id: accounts[0]?.id || '', amount: '', memo: '' });
      setFrontImage(null);
      setBackImage(null);
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

  const handleFile = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (side === 'front') setFrontImage(reader.result);
      else setBackImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <BankShell title="Check Deposit">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Mobile deposit</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Deposit a check</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Snap a photo of your check and deposit funds into your Hunch account.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> Encrypted & secure
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* To account */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deposit to</label>
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedAccount && (
                <p className="mt-2 text-sm text-slate-500">
                  Current balance: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedAccount.balance)}</span>
                </p>
              )}
            </section>

            {/* Check photos */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Check photos</label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Front */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Front of check</p>
                  {frontImage ? (
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                      <img src={frontImage} alt="Front" className="w-full h-40 object-contain rounded-xl" />
                      <button onClick={() => setFrontImage(null)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-slate-500 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => frontRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                    >
                      <ImagePlus size={28} className="text-slate-300" />
                      <span className="text-xs font-medium text-slate-500">Tap to upload front</span>
                    </button>
                  )}
                  <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'front')} />
                </div>
                {/* Back */}
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">Back of check (endorsed)</p>
                  {backImage ? (
                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                      <img src={backImage} alt="Back" className="w-full h-40 object-contain rounded-xl" />
                      <button onClick={() => setBackImage(null)} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-slate-500 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => backRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                    >
                      <Camera size={28} className="text-slate-300" />
                      <span className="text-xs font-medium text-slate-500">Tap to upload back</span>
                    </button>
                  )}
                  <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, 'back')} />
                </div>
              </div>
              {frontImage && backImage && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-700/30 dark:text-emerald-300">
                  <CheckCircle size={14} className="inline mr-1" /> Both sides uploaded. Ready to enter amount.
                </div>
              )}
            </section>

            {/* Amount */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Check amount</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-4xl sm:text-5xl font-light text-slate-300">$</span>
                <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full bg-transparent text-center text-4xl sm:text-5xl font-bold text-slate-900 outline-none dark:text-white" placeholder="0.00" />
              </div>
            </section>

            {/* Memo */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Memo</label>
              <input value={form.memo} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Memo (optional)" />
            </section>

            {/* Preview */}
            {numericAmount > 0 && selectedAccount && (
              <div className="rounded-2xl border border-[#063b36]/20 bg-gradient-to-br from-[#063b36]/5 to-[#0a5a52]/5 p-5 dark:border-[#7CFC00]/20 dark:from-[#063b36]/10 dark:to-[#0a5a52]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#063b36] text-white">
                      <FileImage size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Check deposit preview</p>
                      <p className="text-[10px] text-slate-400">To {selectedAccount.account_type.replace(/_/g, ' ')} ••••{selectedAccount.account_number.slice(-4)}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${formatMoney(numericAmount)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  {frontImage && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Front uploaded</span>}
                  {backImage && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Back uploaded</span>}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-[#063b36] py-4 text-base font-bold text-white transition hover:bg-[#041f1c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit check deposit <ArrowRight className="ml-2 inline" size={16} />
            </button>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Deposit summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-[#7CFC00]">${formatMoney(numericAmount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">To</span><span className="font-semibold text-right">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Fee</span><span className="font-semibold">$0.00</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Availability</span><span className="font-semibold text-right">1-2 business days</span></div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Deposit timeline</p>
              <div className="space-y-0">
                {[
                  { step: 'Submit', desc: 'Upload check photos', done: frontImage && backImage },
                  { step: 'Review', desc: 'Fraud & image verification', done: false },
                  { step: 'Hold', desc: '1-2 business days', done: false },
                  { step: 'Available', desc: 'Funds released', done: false },
                ].map((item, i, arr) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-white/10'}`}>
                        {item.done ? '✓' : i + 1}
                      </div>
                      {i < arr.length - 1 && <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />}
                    </div>
                    <div className="pb-5">
                      <p className="text-xs font-semibold text-slate-700 dark:text-white/70">{item.step}</p>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold">Hold Policy</p>
                  <p className="text-xs mt-1">Checks are held for 1-2 business days for verification. Endorse the back with "For mobile deposit only at Hunch."</p>
                </div>
              </div>
            </section>

            {/* Recent deposits */}
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent deposits</p>
                {deposits.length > 0 && <span className="text-[10px] text-slate-400">{deposits.length} total</span>}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-6">
                  <FileImage size={32} className="text-slate-200 dark:text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No check deposits yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {deposits.slice(0, 4).map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${d.status === 'CLEARED' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                          {d.status === 'CLEARED' ? <CheckCircle size={14} className="text-emerald-600" /> : <Clock size={14} className="text-amber-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-white/70">${formatMoney(d.amount)}</p>
                          <p className="text-[10px] text-slate-400 truncate">{d.memo || 'Check deposit'} · {new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${d.status === 'CLEARED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
                        {d.status === 'PENDING' && (
                          <button onClick={() => handleClear(d.id)} className="text-[10px] font-semibold text-[#063b36] hover:underline">Clear</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </BankShell>
  );
}
