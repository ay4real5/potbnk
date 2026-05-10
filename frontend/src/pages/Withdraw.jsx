import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { AlertTriangle, ArrowRight, Building2, CheckCircle, Clock3, CreditCard, Landmark, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];
const DAILY_LIMIT = 10000;

const DESTINATIONS = {
  ach: { label: 'ACH to external bank', icon: Landmark, speed: '1-3 business days', fee: 0, limit: 10000 },
  instant: { label: 'Instant debit card payout', icon: Zap, speed: 'Usually within 30 minutes', feeRate: 0.015, limit: 2500 },
  wire: { label: 'Domestic wire', icon: Building2, speed: 'Same business day', fee: 15, limit: 10000 },
};

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Withdrawal' });
  const [destination, setDestination] = useState('ach');
  const [destinationDetails, setDestinationDetails] = useState({
    bank_name: '',
    account_last4: '',
    routing_last4: '',
    card_last4: '',
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
  const selectedDestination = DESTINATIONS[destination];
  const amount = Number(form.amount || 0);
  const fee = useMemo(() => selectedDestination.feeRate ? amount * selectedDestination.feeRate : selectedDestination.fee || 0, [amount, selectedDestination]);
  const totalDebit = amount + fee;
  const availableBalance = Number(selectedAccount?.balance || 0);
  const exceedsLimit = amount > Math.min(DAILY_LIMIT, selectedDestination.limit);
  const exceedsBalance = totalDebit > availableBalance;
  const hasDestinationDetails = destination === 'instant'
    ? destinationDetails.card_last4.length === 4
    : destinationDetails.bank_name && destinationDetails.account_last4.length === 4;
  const canReview = form.account_id && amount > 0 && !exceedsLimit && !exceedsBalance && hasDestinationDetails;

  const handleReview = (e) => {
    e.preventDefault();
    if (!canReview) {
      toast.error(exceedsBalance ? 'Amount plus fees exceeds available balance.' : exceedsLimit ? 'This withdrawal exceeds the selected method limit.' : 'Complete withdrawal details before reviewing.');
      return;
    }
    setReviewing(true);
  };

  const submitWithdrawal = async () => {
    setLoading(true);
    try {
      const target = destination === 'instant'
        ? `debit card ••••${destinationDetails.card_last4}`
        : `${destinationDetails.bank_name} ••••${destinationDetails.account_last4}`;
      const description = `${selectedDestination.label} to ${target}`;
      const { data } = await api.post('/accounts/withdraw', { ...form, amount: totalDebit, description });
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setSuccess({ amount, fee, reference: data.transaction_id, speed: selectedDestination.speed });
      setForm((f) => ({ ...f, amount: '', description: 'Withdrawal' }));
      setReviewing(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BankShell title="Withdraw Funds">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#111a18]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="text-emerald-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Withdrawal scheduled</h2>
            <p className="mt-2 text-4xl font-bold text-red-600">-${formatMoney(success.amount)}</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600 dark:bg-white/5 dark:text-white/60">
              <div className="flex justify-between"><span>Fee</span><span className="font-semibold text-slate-900 dark:text-white">${formatMoney(success.fee)}</span></div>
              <div className="mt-2 flex justify-between"><span>Arrival</span><span className="font-semibold text-slate-900 dark:text-white">{success.speed}</span></div>
              <div className="mt-2 flex justify-between"><span>Reference</span><span className="font-mono text-xs text-slate-900 dark:text-white">{String(success.reference).slice(0, 8).toUpperCase()}</span></div>
            </div>
            <button onClick={() => setSuccess(null)} className="mt-6 w-full rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Done</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Move money out</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Withdraw funds</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Send money from your Hunch account to a verified external bank, card, or wire destination.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> Protected transfer review
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleReview} className="lg:col-span-3 space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">From account</label>
              <select value={form.account_id} onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedAccount && <p className="mt-2 text-sm text-slate-500">Available balance: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedAccount.balance)}</span></p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Withdrawal amount</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-4xl sm:text-5xl font-light text-slate-300">$</span>
                <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full bg-transparent text-center text-4xl sm:text-5xl font-bold text-slate-900 outline-none dark:text-white" placeholder="0.00" />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((quick) => <button key={quick} type="button" onClick={() => setForm((f) => ({ ...f, amount: String(quick) }))} className={`rounded-full px-4 py-2 text-sm font-semibold ${amount === quick ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-white/60'}`}>${quick.toLocaleString()}</button>)}
              </div>
              {(exceedsLimit || exceedsBalance) && <p className="mt-3 flex items-center gap-2 text-sm text-red-600"><AlertTriangle size={15} /> {exceedsBalance ? 'Amount plus fees exceeds available balance.' : `Limit for ${selectedDestination.label} is $${formatMoney(selectedDestination.limit)}.`}</p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Destination method</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(DESTINATIONS).map(([id, option]) => {
                  const Icon = option.icon;
                  return <button key={id} type="button" onClick={() => setDestination(id)} className={`rounded-2xl border p-4 text-left transition ${destination === id ? 'border-[#063b36] bg-[#063b36]/5 ring-2 ring-[#063b36]/10 dark:bg-[#063b36]/20' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'}`}>
                    <Icon className={destination === id ? 'text-[#063b36] dark:text-[#7CFC00]' : 'text-slate-400'} size={22} />
                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.speed}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-white/70">Limit ${formatMoney(option.limit)}</p>
                  </button>;
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Destination details</label>
              {destination === 'instant' ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required maxLength={4} value={destinationDetails.card_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, card_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Debit card last 4" />
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-white/5"><CreditCard size={16} /> Verified debit card required</div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input required value={destinationDetails.bank_name} onChange={(e) => setDestinationDetails((f) => ({ ...f, bank_name: e.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Bank name" />
                  <input required maxLength={4} value={destinationDetails.account_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, account_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Account last 4" />
                  <input maxLength={4} value={destinationDetails.routing_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, routing_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Routing last 4" />
                </div>
              )}
            </section>

            <button type="submit" disabled={!canReview} className="w-full rounded-2xl bg-red-600 py-4 text-base font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">Review withdrawal <ArrowRight className="ml-2 inline" size={16} /></button>
          </form>

          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Withdrawal summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-red-300">${formatMoney(amount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Method</span><span className="font-semibold text-right">{selectedDestination.label}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Fee</span><span className="font-semibold">${formatMoney(fee)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Total debit</span><span className="font-semibold">${formatMoney(totalDebit)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Arrival</span><span className="font-semibold text-right">{selectedDestination.speed}</span></div>
              </div>
            </section>
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5" size={18} />
                <p className="text-sm">Daily withdrawal limit is ${formatMoney(DAILY_LIMIT)}. Fees are included in the total debit from your account.</p>
              </div>
            </section>
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 text-slate-400" size={18} />
                <p className="text-sm text-slate-500 dark:text-white/50">Withdrawals may be reviewed for fraud prevention, weekends, holidays, and cutoff times before funds arrive.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review withdrawal</h2>
            <p className="mt-1 text-sm text-slate-500">Confirm details before submitting this withdrawal.</p>
            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
              <div className="flex justify-between"><span>From</span><span className="font-semibold">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span></div>
              <div className="flex justify-between"><span>Method</span><span className="font-semibold text-right">{selectedDestination.label}</span></div>
              <div className="flex justify-between"><span>Amount</span><span className="font-semibold">${formatMoney(amount)}</span></div>
              <div className="flex justify-between"><span>Fee</span><span className="font-semibold">${formatMoney(fee)}</span></div>
              <div className="flex justify-between"><span>Total debit</span><span className="font-semibold">${formatMoney(totalDebit)}</span></div>
              <div className="flex justify-between"><span>Arrival</span><span className="font-semibold text-right">{selectedDestination.speed}</span></div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setReviewing(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Edit</button>
              <button type="button" disabled={loading} onClick={submitWithdrawal} className="rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">{loading ? 'Processing...' : 'Confirm withdrawal'}</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
