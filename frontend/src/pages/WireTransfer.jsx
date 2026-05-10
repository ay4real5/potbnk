import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle, ArrowRight, Building2, CheckCircle, Clock, Globe,
  Landmark, MapPin, MessageSquare, Plus, Route, ShieldCheck, UserCheck,
} from 'lucide-react';

const WIRE_FEE = 25;

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const BANK_META = {
  'Bank of America': { color: '#E31837', initials: 'BA' },
  'Chase Bank': { color: '#117ACA', initials: 'C' },
  'Wells Fargo': { color: '#D71E28', initials: 'WF' },
  'Citibank': { color: '#00A3E0', initials: 'C' },
  'Capital One': { color: '#004977', initials: 'CO' },
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

export default function WireTransfers() {
  const toast = useToast();
  const [wires, setWires] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wireType, setWireType] = useState('domestic');
  const [form, setForm] = useState({
    sender_account_id: '', amount: '', recipient_name: '', recipient_bank: '', recipient_account_number: '', swift_code: '', reference: '',
  });
  const [selectedBank, setSelectedBank] = useState('');
  const [customBank, setCustomBank] = useState('');

  useEffect(() => {
    loadWires();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setForm((f) => ({ ...f, sender_account_id: data[0].id })); }).catch(() => {});
  }, []);

  const loadWires = () => {
    setLoading(true);
    api.get('/wire-transfers/').then(({ data }) => setWires(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const effectiveBank = selectedBank === 'Other' ? customBank : selectedBank;
  const canSubmit = form.sender_account_id && form.amount && Number(form.amount) >= 100 && form.recipient_name && effectiveBank && form.recipient_account_number;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Complete all required fields. Minimum amount is $100.'); return;
    }
    try {
      await api.post('/wire-transfers/', {
        sender_account_id: form.sender_account_id,
        amount: Number(form.amount),
        recipient_name: form.recipient_name,
        recipient_bank: effectiveBank,
        recipient_account_number: form.recipient_account_number,
        swift_code: wireType === 'international' ? form.swift_code : undefined,
        reference: form.reference || undefined,
      });
      toast.success('Wire transfer sent.');
      setForm({ sender_account_id: accounts[0]?.id || '', amount: '', recipient_name: '', recipient_bank: '', recipient_account_number: '', swift_code: '', reference: '' });
      setSelectedBank('');
      setCustomBank('');
      loadWires();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Wire transfer failed.');
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.sender_account_id);
  const numericAmount = Number(form.amount || 0);

  return (
    <BankShell title="Wire Transfers">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Send money worldwide</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Wire Transfers</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Send large amounts securely to domestic and international bank accounts.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> SWIFT-enabled & encrypted
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3 space-y-5">
            {/* Account details */}
            {accounts.length > 0 && (
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#063b36] dark:text-[#7CFC00]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your account details</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {accounts.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600 dark:text-white/70">{a.account_type.replace(/_/g, ' ')}</span>
                        <span className="text-xs font-bold text-[#063b36] dark:text-[#7CFC00]">${formatMoney(a.balance)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{a.account_number}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(a.account_number); toast.success('Account number copied!'); }}
                          className="text-[10px] font-bold uppercase tracking-wide text-[#063b36] hover:underline dark:text-[#7CFC00]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Wire type */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Wire type</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { id: 'domestic', label: 'Domestic wire', icon: Landmark, desc: 'Same business day · USA only', fee: WIRE_FEE },
                  { id: 'international', label: 'International wire', icon: Globe, desc: '1-3 business days · SWIFT', fee: WIRE_FEE + 10 },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setWireType(option.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        wireType === option.id
                          ? 'border-[#063b36] bg-[#063b36]/5 ring-2 ring-[#063b36]/10 dark:bg-[#063b36]/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-white/10'
                      }`}
                    >
                      <Icon className={wireType === option.id ? 'text-[#063b36] dark:text-[#7CFC00]' : 'text-slate-400'} size={22} />
                      <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{option.desc}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-white/70">Fee ${formatMoney(option.fee)}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* From account */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">From account</label>
              <select value={form.sender_account_id} onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedAccount && <p className="mt-2 text-sm text-slate-500">Available balance: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedAccount.balance)}</span></p>}
            </section>

            {/* Amount */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount (min $100)</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-4xl sm:text-5xl font-light text-slate-300">$</span>
                <input type="number" min="100" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full bg-transparent text-center text-4xl sm:text-5xl font-bold text-slate-900 outline-none dark:text-white" placeholder="0.00" />
              </div>
            </section>

            {/* Recipient */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recipient</label>
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <UserCheck size={14} /> Full name
                    </label>
                    <input required value={form.recipient_name} onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Recipient full name" />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Building2 size={14} /> Account number
                    </label>
                    <input required value={form.recipient_account_number} onChange={(e) => setForm((f) => ({ ...f, recipient_account_number: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Account number" />
                  </div>
                </div>

                {/* Bank selector */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Landmark size={14} /> Recipient bank
                  </label>
                  {selectedBank ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-700/30 dark:bg-emerald-900/10">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: getBankStyle(effectiveBank).color }}>{getBankStyle(effectiveBank).initials}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">{effectiveBank}</p>
                          <p className="text-[10px] text-slate-400">{wireType === 'international' ? 'SWIFT wire' : 'Fedwire'} transfer</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setSelectedBank(''); setCustomBank(''); }} className="text-xs font-semibold text-[#063b36] hover:underline">Change</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['Bank of America', 'Chase Bank', 'Wells Fargo', 'Citibank', 'Capital One', 'U.S. Bank', 'PNC Bank', 'Truist Bank'].map((bank) => {
                          const style = getBankStyle(bank);
                          return (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => { setSelectedBank(bank); setForm((f) => ({ ...f, recipient_bank: bank })); }}
                              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: style.color }}>{style.initials}</span>
                              <span className="text-[10px] font-medium text-slate-600 dark:text-white/60 text-center leading-tight">{bank.replace(' Bank', '')}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input value={customBank} onChange={(e) => { setCustomBank(e.target.value); setForm((f) => ({ ...f, recipient_bank: e.target.value })); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Or type another bank name…" />
                    </div>
                  )}
                </div>

                {wireType === 'international' && (
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Globe size={14} /> SWIFT / BIC code
                    </label>
                    <input value={form.swift_code} onChange={(e) => setForm((f) => ({ ...f, swift_code: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="SWIFT/BIC (required for international)" />
                  </div>
                )}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <MessageSquare size={14} /> Reference / memo
                  </label>
                  <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Reference or memo (optional)" />
                </div>

                {/* Preview card */}
                {effectiveBank && form.recipient_name && form.recipient_account_number && (
                  <div className="rounded-2xl border border-[#063b36]/20 bg-gradient-to-br from-[#063b36]/5 to-[#0a5a52]/5 p-4 dark:border-[#7CFC00]/20 dark:from-[#063b36]/10 dark:to-[#0a5a52]/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#063b36] text-sm font-bold text-white">
                        {form.recipient_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{form.recipient_name}</p>
                        <p className="text-xs text-slate-500 dark:text-white/50 flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getBankStyle(effectiveBank).color }} />
                          {effectiveBank}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Acct ••••{form.recipient_account_number.slice(-4)} {wireType === 'international' && form.swift_code && `· SWIFT ${form.swift_code}`}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-[#063b36] py-4 text-base font-bold text-white transition hover:bg-[#041f1c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Wire <ArrowRight className="ml-2 inline" size={16} />
            </button>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Wire summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-white">${formatMoney(numericAmount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Type</span><span className="font-semibold capitalize">{wireType}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Fee</span><span className="font-semibold">${formatMoney(wireType === 'international' ? WIRE_FEE + 10 : WIRE_FEE)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Total debit</span><span className="text-xl font-bold text-[#7CFC00]">${formatMoney(numericAmount + (wireType === 'international' ? WIRE_FEE + 10 : WIRE_FEE))}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">From</span><span className="font-semibold text-right">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span></div>
              </div>
            </section>

            {/* Timeline */}
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Wire timeline</p>
              <div className="space-y-0">
                {[
                  { step: 'Submit', desc: 'You confirm the wire', done: true },
                  { step: 'Review', desc: 'Bank security check', done: false },
                  { step: 'Processing', desc: wireType === 'international' ? 'SWIFT network' : 'Fedwire', done: false },
                  { step: 'Arrival', desc: wireType === 'international' ? '1-3 business days' : 'Same business day', done: false },
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
                  <p className="text-sm font-bold">Wire Policy</p>
                  <p className="text-xs mt-1">Minimum $100. Domestic fee ${WIRE_FEE}; international fee ${WIRE_FEE + 10}. Maximum $100,000. Wires cannot be reversed once sent.</p>
                </div>
              </div>
            </section>

            {/* Wire history */}
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent wires</p>
                {wires.length > 0 && <span className="text-[10px] text-slate-400">{wires.length} total</span>}
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : wires.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No wire transfers yet.</p>
              ) : (
                <div className="space-y-2">
                  {wires.slice(0, 4).map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${w.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                          {w.status === 'COMPLETED' ? <CheckCircle size={14} className="text-emerald-600" /> : <Clock size={14} className="text-amber-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-white/70 truncate">${formatMoney(w.amount)} to {w.recipient_name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{w.recipient_bank}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{w.status}</span>
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
