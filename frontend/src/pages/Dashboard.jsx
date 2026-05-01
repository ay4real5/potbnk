import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import {
  ArrowLeftRight, MinusCircle, PlusCircle, Settings, Plus, X, ShieldCheck,
} from 'lucide-react';

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
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="rgba(124,252,0,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points={fillPts} fill="rgba(124,252,0,0.07)" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, fetchMe } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAcctType, setOpenAcctType] = useState('SAVINGS');
  const [openAcctLoading, setOpenAcctLoading] = useState(false);
  const [openAcctError, setOpenAcctError] = useState('');
  const [openAcctSuccess, setOpenAcctSuccess] = useState('');
  const [showOpenAcct, setShowOpenAcct] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!user) await fetchMe();
      try {
        const { data: accs } = await api.get('/accounts/');
        setAccounts(accs);
        if (accs.length > 0) {
          const { data: txs } = await api.get('/accounts/transactions?limit=6');
          setRecentTx(txs);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const myAccountIds = new Set(accounts.map((a) => a.id));

  const balanceFmt    = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const balanceDollars = balanceFmt.split('.')[0];
  const balanceCents   = balanceFmt.split('.')[1] ?? '00';

  const sparkValues = recentTx.length > 1
    ? recentTx.map((tx) => parseFloat(tx.amount)).reverse()
    : [1, 2.5, 1.8, 3.2, 2.8, 4.1, 3.6];

  const now = new Date();
  const monthlyNet = recentTx.reduce((sum, tx) => {
    const d = new Date(tx.created_at);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return sum;
    return tx.type === 'DEPOSIT'
      ? sum + parseFloat(tx.amount)
      : tx.type === 'WITHDRAWAL'
      ? sum - parseFloat(tx.amount)
      : sum;
  }, 0);

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
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
          <div className="h-44 rounded-2xl animate-pulse" style={{ background: 'rgba(6,59,54,0.25)' }} />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
            <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
              <div className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(6,59,54,0.25)' }} />
            </div>
          </div>
        </div>
      </BankShell>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <BankShell title="Dashboard">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#041f1c] via-[#063b36] to-[#0a5a52] rounded-2xl p-8 overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#7CFC00]/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/[0.03]" />
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-white/45 mb-1">
                {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}
              </p>
              <p className="text-[10px] uppercase tracking-[2.5px] text-white/30 mb-3">Total Balance · USD</p>
              <p className="text-5xl font-bold tracking-tight text-white leading-none tabular-nums">
                {balanceDollars}<span className="text-2xl text-white/50">.{balanceCents}</span>
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
            <div className="flex flex-col items-end gap-3 shrink-0">
              <Sparkline values={sparkValues} />
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/deposit')}
                  className="bg-[#7CFC00] text-[#041f1c] text-xs font-semibold px-4 py-2 rounded-full hover:brightness-110 transition-all"
                >
                  + Deposit
                </button>
                <button
                  onClick={() => navigate('/transfer')}
                  className="bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  ↔ Transfer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Transfer', href: '/transfer', bg: 'bg-emerald-50', fg: 'text-emerald-700', icon: <ArrowLeftRight size={16} /> },
            { label: 'Deposit',  href: '/deposit',  bg: 'bg-sky-50',     fg: 'text-sky-700',     icon: <PlusCircle size={16} />    },
            { label: 'Withdraw', href: '/withdraw', bg: 'bg-rose-50',    fg: 'text-rose-600',    icon: <MinusCircle size={16} />   },
            { label: 'Settings', href: '/settings', bg: 'bg-violet-50',  fg: 'text-violet-600',  icon: <Settings size={16} />      },
          ].map(({ label, href, bg, fg, icon }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className="flex flex-col items-center gap-2 py-4 px-3 bg-white rounded-2xl border border-slate-100 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${bg} ${fg}`}>
                {icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-600">{label}</span>
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
                  <div
                    key={acc.id}
                    className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-0.5 transition-transform duration-200`}
                  >
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
                      <Link
                        to={`/transactions/${acc.id}`}
                        className="text-[11px] font-semibold text-[#7CFC00] hover:brightness-110 transition-all"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {showOpenAcct && (
              <div className="mt-3 bg-white border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-800 text-sm">New account</p>
                  <button
                    onClick={() => { setShowOpenAcct(false); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
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
                    <button
                      onClick={handleOpenAccount}
                      disabled={openAcctLoading}
                      className="bg-[#063b36] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#041f1c] transition-all disabled:opacity-50"
                    >
                      {openAcctLoading ? '…' : 'Open'}
                    </button>
                  </div>
                )}
                {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
              </div>
            )}
          </div>

          {/* Col 2: Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
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
                  const amountCls    = isDeposit ? 'text-emerald-600' : tx.type === 'TRANSFER' ? 'text-sky-600' : 'text-slate-800';
                  const iconBg       = isDeposit
                    ? 'bg-emerald-50 text-emerald-600'
                    : isWithdrawal
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-sky-50 text-sky-600';
                  const TxIcon = isDeposit ? PlusCircle : isWithdrawal ? MinusCircle : ArrowLeftRight;
                  const txDate = new Date(tx.created_at);
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                        <TxIcon size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{tx.description || tx.type}</p>
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

          {/* Col 3: Summary + Security */}
          <div className="flex flex-col gap-4">

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-400 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Active accounts</span>
                  <span className="text-xs font-semibold text-slate-800">{accounts.length}</span>
                </div>
                {monthlyNet !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">This month</span>
                    <span className={`text-xs font-semibold ${monthlyNet >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {monthlyNet > 0 ? '+' : ''}${monthlyNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-50 flex justify-between">
                  <span className="text-xs text-slate-500">Total balance</span>
                  <span className="text-xs font-bold text-[#063b36] tabular-nums">
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
          </div>
        </div>
      </div>
    </BankShell>
  );
}
