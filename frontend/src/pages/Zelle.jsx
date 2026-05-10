import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import {
  AlertTriangle, ArrowRight, AtSign, CheckCircle, Clock, MessageSquare, Phone,
  Search, Send, ShieldCheck, Smartphone, User, UserPlus, Zap,
} from 'lucide-react';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];
const DAILY_LIMIT = 2500;

const MOCK_CONTACTS = [
  { id: '1', name: 'Sarah Johnson', handle: 'sarah.j@email.com', avatar: 'SJ' },
  { id: '2', name: 'Mike Chen', handle: '+1 (555) 234-5678', avatar: 'MC' },
  { id: '3', name: 'David Park', handle: 'dpark@email.com', avatar: 'DP' },
  { id: '4', name: 'Lisa Williams', handle: '+1 (555) 876-1234', avatar: 'LW' },
];

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Zelle() {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [mode, setMode] = useState('send'); // send | request
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [senderAccountId, setSenderAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [recentZelle, setRecentZelle] = useState([]);

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data[0]) setSenderAccountId(data[0].id);
    }).catch(() => {});
    // Mock recent zelle transactions
    setRecentZelle([
      { id: 'z1', name: 'Sarah Johnson', amount: 150, type: 'sent', date: '2026-05-09T14:30:00Z', memo: 'Dinner split' },
      { id: 'z2', name: 'Mike Chen', amount: 75, type: 'received', date: '2026-05-08T09:15:00Z', memo: 'Taxi' },
      { id: 'z3', name: 'David Park', amount: 200, type: 'sent', date: '2026-05-05T18:45:00Z', memo: 'Concert tickets' },
    ]);
  }, []);

  const selectedAccount = accounts.find((a) => a.id === senderAccountId);
  const numericAmount = Number(amount || 0);
  const exceedsLimit = numericAmount > DAILY_LIMIT;
  const exceedsBalance = numericAmount > Number(selectedAccount?.balance || 0);
  const canSubmit = senderAccountId && numericAmount > 0 && (selectedContact || recipientInput.trim()) && !exceedsLimit && !exceedsBalance;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Mock Zelle send via regular transfer endpoint or show toast
      await new Promise((r) => setTimeout(r, 800));
      setSuccess({
        amount: numericAmount,
        recipient: selectedContact?.name || recipientInput,
        memo,
        reference: Math.random().toString(36).substring(2, 10).toUpperCase(),
      });
      setAmount('');
      setMemo('');
      setSelectedContact(null);
      setRecipientInput('');
    } catch (err) {
      toast.error('Zelle transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = recipientInput.trim()
    ? MOCK_CONTACTS.filter((c) =>
        c.name.toLowerCase().includes(recipientInput.toLowerCase()) ||
        c.handle.toLowerCase().includes(recipientInput.toLowerCase())
      )
    : MOCK_CONTACTS;

  return (
    <BankShell title="Zelle">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#111a18]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="text-emerald-600" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'send' ? 'Payment sent' : 'Request sent'}
            </h2>
            <p className="mt-2 text-4xl font-bold text-emerald-600">${formatMoney(success.amount)}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">to {success.recipient}</p>
            {success.memo && <p className="mt-1 text-xs text-slate-400">"{success.memo}"</p>}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600 dark:bg-white/5 dark:text-white/60">
              <div className="flex justify-between"><span>Reference</span><span className="font-mono text-xs text-slate-900 dark:text-white">{success.reference}</span></div>
              <div className="mt-2 flex justify-between"><span>From</span><span className="font-semibold text-slate-900 dark:text-white">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span></div>
            </div>
            <button onClick={() => setSuccess(null)} className="mt-6 w-full rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Done</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Peer-to-peer payments</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Zelle</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Send money to friends and family with just an email or phone number.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> Bank-grade secure
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-5">
            {/* From account */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">From account</label>
              <select value={senderAccountId} onChange={(e) => setSenderAccountId(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedAccount && (
                <p className="mt-2 text-sm text-slate-500">
                  Available: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedAccount.balance)}</span>
                </p>
              )}
            </section>

            {/* Send/Request toggle */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Action</label>
              <div className="mt-4 flex rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
                {[
                  { id: 'send', label: 'Send', icon: Send },
                  { id: 'request', label: 'Request', icon: MessageSquare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                        mode === item.id
                          ? 'bg-white text-[#063b36] shadow-sm dark:bg-[#111a18] dark:text-[#7CFC00]'
                          : 'text-slate-500 dark:text-white/50'
                      }`}
                    >
                      <Icon size={16} /> {item.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recipient */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recipient</label>
              <div className="mt-4">
                {selectedContact ? (
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-700/30 dark:bg-emerald-900/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#063b36] text-xs font-bold text-white">
                        {selectedContact.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedContact.name}</p>
                        <p className="text-[10px] text-slate-400">{selectedContact.handle}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => { setSelectedContact(null); setRecipientInput(''); }} className="text-xs font-semibold text-[#063b36] hover:underline">Change</button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Search contacts or enter email / phone"
                      autoComplete="off"
                    />
                  </div>
                )}

                {/* Contact chips */}
                {!selectedContact && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {filteredContacts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedContact(c)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#063b36] text-[9px] font-bold text-white">{c.avatar}</span>
                        <span className="font-medium text-slate-700 dark:text-white/70">{c.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedContact({ id: 'new', name: recipientInput, handle: recipientInput, avatar: '?' })}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs hover:border-[#063b36] transition dark:border-white/20 dark:bg-white/5"
                    >
                      <UserPlus size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-500 dark:text-white/50">New recipient</span>
                    </button>
                  </div>
                )}

                {/* Input type indicators */}
                {!selectedContact && recipientInput && !recipientInput.includes('@') && !/^\+?\d/.test(recipientInput) && (
                  <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <AtSign size={12} /> Enter an email or phone number
                  </p>
                )}
              </div>
            </section>

            {/* Amount */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-4xl sm:text-5xl font-light text-slate-300">$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-center text-4xl sm:text-5xl font-bold text-slate-900 outline-none dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setAmount(String(quick))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      numericAmount === quick
                        ? 'bg-[#063b36] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-white/60'
                    }`}
                  >
                    ${quick.toLocaleString()}
                  </button>
                ))}
              </div>
              {(exceedsLimit || exceedsBalance) && (
                <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle size={15} />
                  {exceedsBalance ? 'Amount exceeds available balance.' : `Daily Zelle limit is $${formatMoney(DAILY_LIMIT)}.`}
                </p>
              )}
            </section>

            {/* Memo */}
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Memo</label>
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="What's this for? (optional)"
                maxLength={140}
              />
              <p className="mt-1 text-right text-[10px] text-slate-400">{memo.length}/140</p>
            </section>

            {/* Preview */}
            {(selectedContact || recipientInput.trim()) && numericAmount > 0 && (
              <div className="rounded-2xl border border-[#063b36]/20 bg-gradient-to-br from-[#063b36]/5 to-[#0a5a52]/5 p-5 dark:border-[#7CFC00]/20 dark:from-[#063b36]/10 dark:to-[#0a5a52]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#063b36] text-sm font-bold text-white">
                      {selectedContact?.avatar || recipientInput[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{selectedContact?.name || recipientInput}</p>
                      <p className="text-[10px] text-slate-400">{selectedContact?.handle || (recipientInput.includes('@') ? 'Email recipient' : 'Phone recipient')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">${formatMoney(numericAmount)}</p>
                    {memo && <p className="text-[10px] text-slate-400 mt-0.5 max-w-[140px] truncate">"{memo}"</p>}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-[#063b36] py-4 text-base font-bold text-white transition hover:bg-[#041f1c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'send' ? 'Send with Zelle' : 'Request with Zelle'} <ArrowRight className="ml-2 inline" size={16} />
            </button>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Zelle summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/50">Amount</span>
                  <span className="text-2xl font-bold text-[#7CFC00]">${formatMoney(numericAmount)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/50">Action</span>
                  <span className="font-semibold capitalize">{mode}</span>
                </div>
                {mode === 'send' && (
                  <div className="flex justify-between gap-4">
                    <span className="text-white/50">From</span>
                    <span className="font-semibold text-right">{selectedAccount?.account_type?.replace(/_/g, ' ')} ••••{selectedAccount?.account_number?.slice(-4)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-white/50">To</span>
                  <span className="font-semibold text-right truncate max-w-[140px]">{selectedContact?.name || recipientInput || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/50">Daily limit</span>
                  <span className="font-semibold">${formatMoney(DAILY_LIMIT)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="mb-3 flex items-center gap-2">
                <Zap size={14} className="text-[#063b36] dark:text-[#7CFC00]" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent Zelle</p>
              </div>
              {recentZelle.length === 0 ? (
                <p className="text-xs text-slate-400">No recent activity.</p>
              ) : (
                <ul className="space-y-3">
                  {recentZelle.map((z) => (
                    <li key={z.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ${z.type === 'sent' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                          {z.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-700 dark:text-white/70">{z.name}</p>
                          <p className="text-[10px] text-slate-400">{z.memo || z.type}</p>
                        </div>
                      </div>
                      <span className={`font-bold tabular-nums ${z.type === 'sent' ? 'text-slate-800 dark:text-white' : 'text-emerald-600'}`}>
                        {z.type === 'sent' ? '-' : '+'}${formatMoney(z.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-start gap-3">
                <Smartphone className="mt-0.5 text-slate-400" size={18} />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">How Zelle works</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50 leading-relaxed">
                    Money moves directly between bank accounts. Recipients are notified by email or text and typically receive funds within minutes.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5" size={18} />
                <div>
                  <p className="font-bold text-sm">Only send to people you trust</p>
                  <p className="mt-1 text-xs">Zelle payments cannot be canceled once sent. Always verify the recipient before confirming.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </BankShell>
  );
}
