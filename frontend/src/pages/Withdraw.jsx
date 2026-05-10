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

const US_BANKS = [
  'Bank of America', 'Chase Bank', 'Wells Fargo', 'Citibank', 'Capital One',
  'U.S. Bank', 'PNC Bank', 'Truist Bank', 'Ally Bank', 'SoFi Bank',
  'Discover Bank', 'Synchrony Bank', 'Chime', 'Marcus by Goldman Sachs',
  'Charles Schwab Bank', 'Navy Federal Credit Union', 'Other bank',
];

const BANK_META = {
  'Bank of America': { color: '#E31837', initials: 'BA' },
  'Chase Bank': { color: '#117ACA', initials: 'C' },
  'Wells Fargo': { color: '#D71E28', initials: 'WF' },
  'Citibank': { color: '#00A3E0', initials: 'C' },
  'Capital One': { color: '#004977', initials: 'CO' },
  'U.S. Bank': { color: '#1B6FAD', initials: 'US' },
  'PNC Bank': { color: '#F47B20', initials: 'PNC' },
  'Truist Bank': { color: '#5E3A8C', initials: 'T' },
  'Ally Bank': { color: '#5C068C', initials: 'A' },
  'SoFi Bank': { color: '#0055A5', initials: 'S' },
  'Discover Bank': { color: '#FF6000', initials: 'D' },
  'Synchrony Bank': { color: '#003B5C', initials: 'SY' },
  'Chime': { color: '#23B24B', initials: 'CH' },
  'Marcus by Goldman Sachs': { color: '#7399C6', initials: 'GS' },
  'Charles Schwab Bank': { color: '#0072CE', initials: 'CS' },
  'Navy Federal Credit Union': { color: '#003B5C', initials: 'NF' },
};

function getBankStyle(name) {
  if (BANK_META[name]) return BANK_META[name];
  const words = name.split(' ').filter(w => w.length > 2);
  const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return { color: `hsl(${hue}, 60%, 42%)`, initials: initials || 'BK' };
}

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
  const [selectedBank, setSelectedBank] = useState('');
  const [customBankName, setCustomBankName] = useState('');
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
  const effectiveBankName = selectedBank === 'Other bank' ? customBankName : selectedBank;
  const hasDestinationDetails = destination === 'instant'
    ? destinationDetails.card_last4.length === 4
    : effectiveBankName && destinationDetails.account_last4.length === 4;
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
        : `${effectiveBankName} ••••${destinationDetails.account_last4}`;
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
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <CreditCard size={14} /> Card last 4
                      </label>
                      <input required maxLength={4} value={destinationDetails.card_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, card_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Last 4 digits" />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-white/5 w-full">
                        <Zap size={16} className="text-amber-500" /> Instant payout to verified card
                      </div>
                    </div>
                  </div>
                  {destinationDetails.card_last4.length === 4 && (
                    <div className="rounded-2xl border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-900/10 dark:to-orange-900/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">Debit card ending in {destinationDetails.card_last4}</p>
                          <p className="text-[10px] text-slate-400">Instant payout · {DESTINATIONS.instant.speed}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Bank selector */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Landmark size={14} /> Bank
                    </label>
                    {selectedBank ? (
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-700/30 dark:bg-emerald-900/10">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: getBankStyle(effectiveBankName).color }}>{getBankStyle(effectiveBankName).initials}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{effectiveBankName}</p>
                            <p className="text-[10px] text-slate-400">{destination === 'wire' ? 'Wire transfer' : 'ACH transfer'} · {selectedDestination.speed}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => { setSelectedBank(''); setCustomBankName(''); }} className="text-xs font-semibold text-[#063b36] hover:underline">Change</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {US_BANKS.slice(0, 8).map((bank) => {
                            const style = getBankStyle(bank);
                            return (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => { setSelectedBank(bank); setDestinationDetails((f) => ({ ...f, bank_name: bank })); }}
                                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                              >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: style.color }}>{style.initials}</span>
                                <span className="text-[10px] font-medium text-slate-600 dark:text-white/60 text-center leading-tight">{bank.replace(' Bank', '').replace(' of America', '')}</span>
                              </button>
                            );
                          })}
                        </div>
                        <select value={selectedBank} onChange={(e) => { setSelectedBank(e.target.value); setDestinationDetails((f) => ({ ...f, bank_name: e.target.value })); if (e.target.value !== 'Other bank') setCustomBankName(''); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                          <option value="">More banks…</option>
                          {US_BANKS.slice(8).map((bank) => <option key={bank} value={bank}>{bank}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedBank === 'Other bank' && (
                      <input required value={customBankName} onChange={(e) => { setCustomBankName(e.target.value); setDestinationDetails((f) => ({ ...f, bank_name: e.target.value })); }} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Enter bank name" />
                    )}
                  </div>

                  {/* Account details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Building2 size={14} /> Account last 4
                      </label>
                      <input required maxLength={4} value={destinationDetails.account_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, account_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Account last 4" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <ArrowRight size={14} /> Routing last 4
                      </label>
                      <input maxLength={4} value={destinationDetails.routing_last4} onChange={(e) => setDestinationDetails((f) => ({ ...f, routing_last4: e.target.value.replace(/\D/g, '').slice(0, 4) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Routing last 4 (optional)" />
                    </div>
                  </div>

                  {/* Preview card */}
                  {effectiveBankName && destinationDetails.account_last4.length === 4 && (
                    <div className="rounded-2xl border border-[#063b36]/20 bg-gradient-to-br from-[#063b36]/5 to-[#0a5a52]/5 p-4 dark:border-[#7CFC00]/20 dark:from-[#063b36]/10 dark:to-[#0a5a52]/10">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: getBankStyle(effectiveBankName).color }}>{getBankStyle(effectiveBankName).initials}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{effectiveBankName}</p>
                          <p className="text-[10px] text-slate-400">Account ••••{destinationDetails.account_last4} {destinationDetails.routing_last4 && `· Routing ••••${destinationDetails.routing_last4}`}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{selectedDestination.label} · {selectedDestination.speed}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <button type="submit" disabled={!canReview} className="w-full rounded-2xl bg-red-600 py-4 text-base font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">Review withdrawal <ArrowRight className="ml-2 inline" size={16} /></button>
          </form>

          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Withdrawal summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-white">${formatMoney(amount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Method</span><span className="font-semibold text-right">{selectedDestination.label}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Fee</span><span className="font-semibold text-white/80">${formatMoney(fee)}</span></div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between gap-4"><span className="text-white/50">Total debit</span><span className="text-xl font-bold text-[#7CFC00]">${formatMoney(totalDebit)}</span></div>
                </div>
                {/* Fee breakdown bar */}
                {fee > 0 && totalDebit > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1">
                      <span>Amount</span>
                      <span>Fee</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden flex">
                      <div className="h-full bg-white/60" style={{ width: `${(amount / totalDebit) * 100}%` }} />
                      <div className="h-full bg-[#7CFC00]" style={{ width: `${(fee / totalDebit) * 100}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex justify-between gap-4"><span className="text-white/50">Arrival</span><span className="font-semibold text-right">{selectedDestination.speed}</span></div>
                {effectiveBankName && (
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">Destination</span>
                    <span className="font-semibold text-right truncate max-w-[140px]">{effectiveBankName} ••••{destinationDetails.account_last4}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Timeline</p>
              <div className="space-y-0">
                {[
                  { step: 'Review', desc: 'Security check', done: true },
                  { step: 'Processing', desc: destination === 'wire' ? 'Same business day' : '1-3 business days', done: false },
                  { step: 'Arrival', desc: selectedDestination.speed, done: false },
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
                  <p className="text-sm font-bold">Daily limit: ${formatMoney(DAILY_LIMIT)}</p>
                  <p className="text-xs mt-1">Fees are included in the total debit. Withdrawals may be reviewed for fraud prevention before processing.</p>
                </div>
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
              <div className="flex justify-between"><span>To</span><span className="font-semibold text-right">{destination === 'instant' ? `Debit card ••••${destinationDetails.card_last4}` : `${effectiveBankName} ••••${destinationDetails.account_last4}`}</span></div>
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
