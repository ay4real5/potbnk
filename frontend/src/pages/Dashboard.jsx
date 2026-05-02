import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import {
  ArrowLeftRight, MinusCircle, PlusCircle, Settings, Plus, X,
  ShieldCheck, Send, Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── helpers ────────────────────────────────────────────────────────────────

const typeSign = (type, accountIds, tx) => {
  if (type === 'DEPOSIT') return '+';
  if (type === 'WITHDRAWAL') return '-';
  return accountIds.has(tx.sender_id) ? '-' : '+';
};

const ACCT_GRADIENTS = {
  CHECKING:          'from-[#063b36] to-[#0a5a52]',
  SAVINGS:           'from-[#1a3a4a] to-[#2d5986]',
  BUSINESS_CHECKING: 'from-[#2d1b4e] to-[#4a2b8a]',
  MONEY_MARKET:      'from-[#1f3820] to-[#2d6a4f]',
};

function Sparkline({ values }) {
  const W = 140, H = 50;
  if (!values || values.length < 2) return <div style={{ width: W, height: H }} />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * (H * 0.8) - H * 0.1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const fillPts = [...pts, `${W},${H}`, `0,${H}`].join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      className="hidden sm:block">
      <polyline points={pts.join(' ')} fill="none" stroke="rgba(124,252,0,0.7)"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={fillPts} fill="rgba(124,252,0,0.07)" />
    </svg>
  );
}

// ── Balance Chart ──────────────────────────────────────────────────────────

function BalanceChart({ transactions, accounts }) {
  const [range, setRange] = useState('30D');

  const data = (() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (range === '7D' ? 7 : 30));

    const startBalance = accounts.reduce((s, a) => s + parseFloat(a.balance), 0);
    const sorted = [...transactions].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const inRange = sorted.filter((tx) => new Date(tx.created_at) >= cutoff);

    // Walk backwards from current balance
    let running = startBalance;
    const points = inRange.map((tx) => {
      const date = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const delta = tx.type === 'DEPOSIT'
        ? parseFloat(tx.amount)
        : tx.type === 'WITHDRAWAL'
        ? -parseFloat(tx.amount)
        : 0;
      running -= delta; // subtract going backward
      return { date, balance: parseFloat(running.toFixed(2)) };
    }).reverse();

    // Add today's actual balance as the last point
    points.push({
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: parseFloat(startBalance.toFixed(2)),
    });

    return points;
  })();

  const fmt = (v) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0 });

  return (
    <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-white/80">Balance History</h3>
        <div className="flex gap-1">
          {['7D', '30D'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                range === r
                  ? 'bg-[#063b36] text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/15'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {data.length < 2 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-xs text-slate-400">Not enough data for chart yet.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={60} />
            <Tooltip
              formatter={(v) => ['$' + v.toLocaleString('en-US', { minimumFractionDigits: 2 }), 'Balance']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#balGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Quick Transfer Modal ──────────────────────────────────────────────────

function QuickTransferModal({ accounts, onClose, onSuccess }) {
  const [form, setForm] = useState({
    sender_account_id: accounts[0]?.id ?? '',
    receiver_account_id: '',
    amount: '',
    description: 'Transfer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const receiverOptions = accounts.filter((a) => a.id !== form.sender_account_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.receiver_account_id) { setError('Please select a recipient account.'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/accounts/transfer', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess(data.message || 'Transfer successful!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="bg-white dark:bg-[#111a18] rounded-3xl shadow-2xl w-full max-w-md p-7 relative"
        style={{ animation: 'modalIn 0.2s ease-out' }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white/70">
          <X size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Quick Transfer</h2>

        {success ? (
          <div className="text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">From</label>
              <select
                value={form.sender_account_id}
                onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value, receiver_account_id: '' }))}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.replace(/_/g, ' ')} — ••••{a.account_number.slice(-4)} (${parseFloat(a.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">To</label>
              <select
                value={form.receiver_account_id}
                onChange={(e) => setForm((f) => ({ ...f, receiver_account_id: e.target.value }))}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
              >
                <option value="">Select account…</option>
                {receiverOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.replace(/_/g, ' ')} — ••••{a.account_number.slice(-4)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="0.01" step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">Description <span className="normal-case font-normal">(optional)</span></label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
              />
            </div>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#063b36] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#041f1c] transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Transferring…' : 'Transfer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── AI Assistant ────────────────────────────────────────────────────────────

const CHIPS = [
  "What's my total balance?",
  'How much did I deposit this month?',
  'Show my recent transactions',
];

function AIAssistant({ accounts, transactions, totalBalance }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m Hunch AI. Ask me anything about your finances.' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const now = new Date();
  const monthDeposits = transactions
    .filter((tx) => tx.type === 'DEPOSIT' && new Date(tx.created_at).getMonth() === now.getMonth())
    .reduce((s, tx) => s + parseFloat(tx.amount), 0);

  const answer = useCallback((q) => {
    const lq = q.toLowerCase();
    if (lq.includes('balance')) {
      return `Your total balance is $${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}.`;
    }
    if (lq.includes('deposit') || lq.includes('deposited')) {
      return `You deposited $${monthDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })} this month.`;
    }
    if (lq.includes('transaction') || lq.includes('recent')) {
      const last3 = transactions.slice(0, 3);
      if (!last3.length) return 'No transactions yet.';
      return last3.map((tx) => {
        const sign = tx.type === 'DEPOSIT' ? '+' : '-';
        return `${tx.type} ${sign}$${parseFloat(tx.amount).toFixed(2)} · ${new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }).join('\n');
    }
    return "I can answer questions about your balance, deposits, and recent transactions. Try one of the suggested questions!";
  }, [accounts, transactions, totalBalance, monthDeposits]);

  const send = (text) => {
    const q = text || input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'ai', text: answer(q) }]);
    }, 400);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#063b36] text-white shadow-xl flex items-center justify-center hover:bg-[#041f1c] hover:scale-105 transition-all duration-200"
        title="Hunch AI"
      >
        <Sparkles size={22} />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm h-96 bg-white dark:bg-[#111a18] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.22s ease-out' }}
        >
          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <div className="flex items-center justify-between px-4 py-3 bg-[#063b36]">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#7CFC00]" />
              <p className="text-sm font-bold text-white">Hunch AI</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#063b36] text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white/80 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Chips */}
          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-[#063b36] hover:text-white transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="px-3 pb-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Ask Hunch AI…"
              className="flex-1 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
            />
            <button
              onClick={() => send()}
              className="w-8 h-8 rounded-xl bg-[#063b36] text-white flex items-center justify-center hover:bg-[#041f1c] transition-colors shrink-0"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, fetchMe } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAcctType, setOpenAcctType] = useState('SAVINGS');
  const [openAcctLoading, setOpenAcctLoading] = useState(false);
  const [openAcctError, setOpenAcctError] = useState('');
  const [openAcctSuccess, setOpenAcctSuccess] = useState('');
  const [showOpenAcct, setShowOpenAcct] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      if (accs.length > 0) {
        const [r6, r30] = await Promise.all([
          api.get('/accounts/transactions?limit=6'),
          api.get('/accounts/transactions?limit=200'),
        ]);
        setRecentTx(r6.data);
        setAllTx(r30.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (!user) await fetchMe();
      await loadData();
    }
    init();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const myAccountIds = new Set(accounts.map((a) => a.id));
  const balanceFmt     = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const balanceDollars = balanceFmt.split('.')[0];
  const balanceCents   = balanceFmt.split('.')[1] ?? '00';

  const sparkValues = recentTx.length > 1
    ? recentTx.map((tx) => parseFloat(tx.amount)).reverse()
    : [1, 2.5, 1.8, 3.2, 2.8, 4.1, 3.6];

  const now = new Date();
  const monthTx = allTx.filter((tx) => {
    const d = new Date(tx.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthDeposits   = monthTx.filter((t) => t.type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
  const monthWithdrawals = monthTx.filter((t) => t.type === 'WITHDRAWAL').reduce((s, t) => s + parseFloat(t.amount), 0);
  const monthlyNet = monthDeposits - monthWithdrawals;

  const handleOpenAccount = async () => {
    setOpenAcctError('');
    setOpenAcctSuccess('');
    setOpenAcctLoading(true);
    try {
      const { data } = await api.post('/accounts/open', { account_type: openAcctType });
      setOpenAcctSuccess(data.message);
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
    } catch (err) {
      setOpenAcctError(err.response?.data?.detail || 'Failed to open account. Please try again.');
    } finally {
      setOpenAcctLoading(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <BankShell title="Dashboard">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          <div className="h-36 sm:h-44 rounded-2xl animate-pulse bg-[#063b36]/30" />
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-16 sm:h-20 bg-white dark:bg-white/5 rounded-2xl animate-pulse border border-slate-100 dark:border-white/10" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="h-64 bg-white dark:bg-white/5 rounded-2xl animate-pulse border border-slate-100 dark:border-white/10" />
            <div className="h-64 bg-white dark:bg-white/5 rounded-2xl animate-pulse border border-slate-100 dark:border-white/10" />
            <div className="space-y-4">
              <div className="h-32 bg-white dark:bg-white/5 rounded-2xl animate-pulse border border-slate-100 dark:border-white/10" />
              <div className="h-28 rounded-2xl animate-pulse bg-[#063b36]/30" />
            </div>
          </div>
        </div>
      </BankShell>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <BankShell title="Dashboard">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#041f1c] via-[#063b36] to-[#0a5a52] rounded-2xl p-5 sm:p-8 overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#7CFC00]/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/[0.03]" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-white/45 mb-1">
                {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}
              </p>
              <p className="text-[10px] uppercase tracking-[2.5px] text-white/30 mb-3">Total Balance · USD</p>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none tabular-nums">
                {balanceDollars}<span className="text-xl sm:text-2xl text-white/50">.{balanceCents}</span>
              </p>
              <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                <span className="text-[11px] text-white/35">
                  Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                </span>
                {monthlyNet !== 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#7CFC00]/15 text-[#7CFC00]">
                    {monthlyNet > 0 ? '↑ +' : '↓ '}${Math.abs(monthlyNet).toLocaleString('en-US', { minimumFractionDigits: 2 })} this month
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
              <Sparkline values={sparkValues} />
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/deposit')}
                  className="bg-[#7CFC00] text-[#041f1c] text-xs font-semibold px-4 py-2 rounded-full hover:brightness-110 transition-all"
                >
                  + Deposit
                </button>
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  ↔ Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Balance Chart ─────────────────────────────────────────────── */}
        <BalanceChart transactions={allTx} accounts={accounts} />

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-5">
          {[
            { label: 'Transfer', onClick: () => setShowTransferModal(true), bg: 'bg-emerald-50 dark:bg-emerald-900/20', fg: 'text-emerald-700 dark:text-emerald-400', icon: <ArrowLeftRight size={16} /> },
            { label: 'Deposit',  onClick: () => navigate('/deposit'),       bg: 'bg-sky-50 dark:bg-sky-900/20',     fg: 'text-sky-700 dark:text-sky-400',     icon: <PlusCircle size={16} />    },
            { label: 'Withdraw', onClick: () => navigate('/withdraw'),      bg: 'bg-rose-50 dark:bg-rose-900/20',   fg: 'text-rose-600 dark:text-rose-400',   icon: <MinusCircle size={16} />   },
            { label: 'Settings', onClick: () => navigate('/settings'),      bg: 'bg-violet-50 dark:bg-violet-900/20', fg: 'text-violet-600 dark:text-violet-400', icon: <Settings size={16} />  },
          ].map(({ label, onClick, bg, fg, icon }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg} ${fg}`}>
                {icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-white/60">{label}</span>
            </button>
          ))}
        </div>

        {/* ── 3-column grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">

          {/* Col 1: My Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400">My Accounts</h3>
              {!showOpenAcct && (
                <button
                  onClick={() => { setShowOpenAcct(true); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                >
                  <Plus size={11} /> Open
                </button>
              )}
            </div>
            <div className="space-y-3">
              {accounts.map((acc) => {
                const gradient = ACCT_GRADIENTS[acc.account_type] ?? 'from-[#063b36] to-[#0a5a52]';
                return (
                  <div key={acc.id} className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200`}>
                    <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
                    <div className="flex justify-between items-start mb-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[1px] text-white/50">
                        {acc.account_type.replace(/_/g, ' ')}
                      </span>
                      <div className="rounded-sm bg-yellow-400/60" style={{ width: 28, height: 18 }} />
                    </div>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">
                      ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] font-mono text-white/35 tracking-widest">
                        ••••  {acc.account_number.slice(-4)}
                      </span>
                      <Link to={`/transactions/${acc.id}`} className="text-[11px] font-semibold text-[#7CFC00] hover:brightness-110 transition-all">
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {showOpenAcct && (
              <div className="mt-3 bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-800 dark:text-white/80 text-sm">New account</p>
                  <button onClick={() => { setShowOpenAcct(false); setOpenAcctSuccess(''); setOpenAcctError(''); }} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
                {openAcctSuccess ? (
                  <div className="text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2 text-xs">{openAcctSuccess}</div>
                ) : (
                  <div className="flex gap-2">
                    <select value={openAcctType} onChange={(e) => setOpenAcctType(e.target.value)} className="hnt-input flex-1 text-xs">
                      <option value="CHECKING">Checking</option>
                      <option value="SAVINGS">Savings</option>
                      <option value="BUSINESS_CHECKING">Business Checking</option>
                      <option value="MONEY_MARKET">Money Market</option>
                    </select>
                    <button onClick={handleOpenAccount} disabled={openAcctLoading}
                      className="bg-[#063b36] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#041f1c] transition-all disabled:opacity-50">
                      {openAcctLoading ? '…' : 'Open'}
                    </button>
                  </div>
                )}
                {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
              </div>
            )}
          </div>

          {/* Col 2: Recent Activity */}
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 dark:border-white/5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white/80">Recent Activity</h3>
              <Link to="/transactions" className="text-[11px] font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors">
                View all →
              </Link>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-slate-400 text-sm">No transactions yet.</p>
              </div>
            ) : (
              <ul className="px-1">
                {recentTx.map((tx) => {
                  const isDeposit    = tx.type === 'DEPOSIT';
                  const isWithdrawal = tx.type === 'WITHDRAWAL';
                  const sign         = typeSign(tx.type, myAccountIds, tx);
                  const amountCls    = isDeposit ? 'text-emerald-600' : tx.type === 'TRANSFER' ? 'text-sky-600' : 'text-slate-800 dark:text-white/80';
                  const iconBg       = isDeposit
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                    : isWithdrawal
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30'
                    : 'bg-sky-50 text-sky-600 dark:bg-sky-900/30';
                  const TxIcon = isDeposit ? PlusCircle : isWithdrawal ? MinusCircle : ArrowLeftRight;
                  const txDate = new Date(tx.created_at);
                  return (
                    <li key={tx.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                        <TxIcon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{tx.description || tx.type}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                          {txDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className={`text-xs font-bold tabular-nums shrink-0 ${amountCls}`}>
                        {sign}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Col 3: Summary + Security + Insights */}
          <div className="flex flex-col gap-4">

            <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 dark:text-white/50">Active accounts</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white/80">{accounts.length}</span>
                </div>
                {monthlyNet !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-white/50">This month</span>
                    <span className={`text-xs font-semibold ${monthlyNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {monthlyNet > 0 ? '+' : ''}${monthlyNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between">
                  <span className="text-xs text-slate-500 dark:text-white/50">Total balance</span>
                  <span className="text-xs font-bold text-[#063b36] dark:text-[#7CFC00] tabular-nums">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#041f1c] to-[#063b36] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#7CFC00]/15 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="text-[#7CFC00]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#7CFC00]">Security</p>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                256-bit encryption & 24/7 fraud monitoring active.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-[11px] font-semibold text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl py-2 transition-all"
              >
                Review settings →
              </button>
            </div>

            {/* Insights */}
            <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-4">Insights</h3>
              {monthTx.length === 0 ? (
                <p className="text-xs text-slate-400">Make your first transaction to see insights.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-white/50">↑ Deposited</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      +${monthDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-xs text-slate-500 dark:text-white/50">↓ Withdrawn</span>
                    </div>
                    <span className="text-xs font-bold text-red-500">
                      -${monthWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${monthlyNet >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-slate-500 dark:text-white/50">Net this month</span>
                    </div>
                    <span className={`text-xs font-bold ${monthlyNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {monthlyNet >= 0 ? '+' : ''}${monthlyNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Transfer Modal ──────────────────────────────────────── */}
      {showTransferModal && accounts.length >= 2 && (
        <QuickTransferModal
          accounts={accounts}
          onClose={() => setShowTransferModal(false)}
          onSuccess={async () => {
            const { data: accs } = await api.get('/accounts/');
            setAccounts(accs);
          }}
        />
      )}
      {showTransferModal && accounts.length < 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowTransferModal(false)}>
          <div className="bg-white dark:bg-[#111a18] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="text-sm font-semibold text-slate-700 dark:text-white/80 mb-3">You need at least 2 accounts to transfer between.</p>
            <button onClick={() => setShowTransferModal(false)} className="text-xs font-semibold text-[#16a34a]">Close</button>
          </div>
        </div>
      )}

      {/* ── AI Assistant ─────────────────────────────────────────────── */}
      <AIAssistant accounts={accounts} transactions={allTx} totalBalance={totalBalance} />
    </BankShell>
  );
}
