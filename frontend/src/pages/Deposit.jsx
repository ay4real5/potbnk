import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { AlertCircle, ArrowRight, Building2, CheckCircle, Clock3, CreditCard, Landmark, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const FUNDING_METHODS = {
  ach: {
    label: 'ACH bank transfer',
    icon: Landmark,
    speed: '2-3 business days',
    fee: 0,
    limit: 10000,
    description: 'Standard external bank funding with no fee.',
  },
  instant: {
    label: 'Instant bank transfer',
    icon: Zap,
    speed: 'Usually available immediately',
    feeRate: 0.015,
    limit: 2500,
    description: 'Faster availability with a 1.5% convenience fee.',
  },
  card: {
    label: 'Debit card deposit',
    icon: CreditCard,
    speed: 'Available in minutes',
    feeRate: 0.025,
    limit: 1000,
    description: 'Small debit-card deposits for quick funding.',
  },
};

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Deposit' });
  const [method, setMethod] = useState('ach');
  const [fundingSource, setFundingSource] = useState({
    bank_name: '',
    account_last4: '',
    routing_last4: '',
  });
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, account_id: data[0].id }));
    }).catch(() => toast.error('Unable to load your accounts.'));
  }, []);

  const selectedAccount = accounts.find((a) => a.id === form.account_id);
  const selectedMethod = FUNDING_METHODS[method];
  const amount = Number(form.amount || 0);
  const fee = useMemo(() => selectedMethod.feeRate ? amount * selectedMethod.feeRate : selectedMethod.fee || 0, [amount, selectedMethod]);
  const totalDebit = amount + fee;
  const exceedsLimit = amount > selectedMethod.limit;
  const canReview = form.account_id && amount > 0 && !exceedsLimit && fundingSource.bank_name && fundingSource.account_last4.length === 4;

  const handleReview = (e) => {
    e.preventDefault();
    if (!canReview) {
      toast.error(exceedsLimit ? `This method limit is $${formatMoney(selectedMethod.limit)}.` : 'Complete the funding details before reviewing.');
      return;
    }
    setReviewing(true);
  };

  const submitDeposit = async () => {
    setLoading(true);
    try {
      const description = `${selectedMethod.label} from ${fundingSource.bank_name} ••••${fundingSource.account_last4}`;
      const { data } = await api.post('/accounts/deposit', { ...form, amount, description });
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setSuccess({ amount, reference: data.transaction_id, availability: selectedMethod.speed });
      setForm((f) => ({ ...f, amount: '', description: 'Deposit' }));
      setReviewing(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BankShell title="Deposit Funds">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111a18] p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="text-emerald-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Deposit scheduled</h2>
            <p className="mt-2 text-4xl font-bold text-emerald-600">${formatMoney(success.amount)}</p>
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-white/5 p-4 text-left text-sm text-slate-600 dark:text-white/60">
              <div className="flex justify-between"><span>Availability</span><span className="font-semibold text-slate-900 dark:text-white">{success.availability}</span></div>
              <div className="mt-2 flex justify-between"><span>Reference</span><span className="font-mono text-xs text-slate-900 dark:text-white">{String(success.reference).slice(0, 8).toUpperCase()}</span></div>
            </div>
            <button onClick={() => setSuccess(null)} className="mt-6 w-full rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Done</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Move money in</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Deposit funds</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Add money from an external bank or debit card with clear timing, limits, and fees.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> Bank-grade encrypted session
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleReview} className="lg:col-span-3 space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deposit amount</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-5xl font-light text-slate-300">$</span>
                <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full bg-transparent text-center text-5xl font-bold text-slate-900 outline-none dark:text-white" placeholder="0.00" />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((quick) => <button key={quick} type="button" onClick={() => setForm((f) => ({ ...f, amount: String(quick) }))} className={`rounded-full px-4 py-2 text-sm font-semibold ${amount === quick ? 'bg-[#063b36] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-white/60'}`}>${quick.toLocaleString()}</button>)}
              </div>
              {exceedsLimit && <p className="mt-3 flex items-center gap-2 text-sm text-red-600"><AlertCircle size={15} /> Limit for {selectedMethod.label} is ${formatMoney(selectedMethod.limit)}.</p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">To account</label>
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedAccount && <p className="mt-2 text-sm text-slate-500">Current balance: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedAccount.balance)}</span></p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Funding method</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(FUNDING_METHODS).map(([id, option]) => {
                  const Icon = option.icon;
                  return <button key={id} type="button" onClick={() => setMethod(id)} className={`rounded-2xl border p-4 text-left transition ${method === id ? 'border-[#063b36] bg-[#063b36]/5 ring-2 ring-[#063b36]/10 dark:bg-[#063b36]/20' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'}`}>
                    <Icon className={method === id ? 'text-[#063b36] dark:text-[#7CFC00]' : 'text-slate-400'} size={22} />
                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.speed}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-white/70">Limit ${formatMoney(option.limit)}</p>
                  </button>;
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">External funding source</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input required value={fundingSource.bank_name} onChange={(e) => setFundingSource((f) => ({ ...f, bank_name: e.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Bank name" />
                <input required maxLength={4} value={fundingSource.account_last4} onChange={(e) => setFundingSource((f) => ({ ...f, account_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Account last 4" />
                <input maxLength={4} value={fundingSource.routing_last4} onChange={(e) => setFundingSource((f) => ({ ...f, routing_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Routing last 4" />
              </div>
              <p className="mt-3 text-xs text-slate-500">For this demo, linked-bank details are used to create realistic transaction descriptions only.</p>
            </section>

            <button type="submit" disabled={!canReview} className="w-full rounded-2xl bg-[#063b36] py-4 text-base font-bold text-white transition hover:bg-[#041f1c] disabled:cursor-not-allowed disabled:opacity-50">Review deposit <ArrowRight className="ml-2 inline" size={16} /></button>
          </form>

          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Deposit summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-[#7CFC00]">${formatMoney(amount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Method</span><span className="font-semibold text-right">{selectedMethod.label}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Fee</span><span className="font-semibold">${formatMoney(fee)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Debit from source</span><span className="font-semibold">${formatMoney(totalDebit)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Availability</span><span className="font-semibold text-right">{selectedMethod.speed}</span></div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 text-slate-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Funds availability</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-white/50">Availability depends on method, cutoff time, and account review. Posted balances update immediately in this simulated environment.</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 text-slate-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Standard bank behavior</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-white/50">Real banks verify ownership, run risk checks, and may hold deposits before withdrawal. This app simulates the workflow without live ACH or card rails.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review deposit</h2>
            <p className="mt-1 text-sm text-slate-500">Confirm details before scheduling this deposit.</p>
            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
              <div className="flex justify-between"><span>From</span><span className="font-semibold">{fundingSource.bank_name} ••••{fundingSource.account_last4}</span></div>
              <div className="flex justify-between"><span>To</span><span className="font-semibold">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span></div>
              <div className="flex justify-between"><span>Amount</span><span className="font-semibold">${formatMoney(amount)}</span></div>
              <div className="flex justify-between"><span>Fee</span><span className="font-semibold">${formatMoney(fee)}</span></div>
              <div className="flex justify-between"><span>Availability</span><span className="font-semibold text-right">{selectedMethod.speed}</span></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setReviewing(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Edit</button>
              <button type="button" disabled={loading} onClick={submitDeposit} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c] disabled:opacity-50">{loading ? 'Processing...' : 'Confirm deposit'}</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
