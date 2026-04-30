import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import {
  ArrowLeftRight, MinusCircle, ChevronRight,
  PlusCircle, Settings, Plus, X, ShieldCheck,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────

const typeSign = (type, accountIds, tx) => {
  if (type === 'DEPOSIT') return '+';
  if (type === 'WITHDRAWAL') return '-';
  return accountIds.has(tx.sender_id) ? '-' : '+';
};

const CARD_GRADIENTS = [
  'from-[#012d2a] to-[#024f54]',
  'from-[#1a3a4a] to-[#0d5e6a]',
  'from-[#1e3a5f] to-[#2d5986]',
  'from-[#2d1b4e] to-[#4a2b8a]',
];

// SVG sparkline derived from transaction amounts
function Sparkline({ values }) {
  if (!values || values.length < 2) {
    return <div className="h-12 rounded-xl bg-white/5" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 200, H = 48;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H * 0.8 - H * 0.1;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="none" className="w-full h-12 opacity-70">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const sparkValues = recentTx.length > 1
    ? recentTx.map((tx) => parseFloat(tx.amount)).reverse()
    : [1, 2.5, 1.8, 3.2, 2.8, 4.1, 3.6];

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
        <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
          <div className="h-52 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="h-44 bg-slate-200 rounded-3xl animate-pulse" />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </BankShell>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <BankShell title="Dashboard">
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">

        {/* ── Hero balance card ──────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-emerald-950 via-[#012d2a] to-[#024f54] rounded-3xl p-8 lg:p-10 text-white border border-white/10 shadow-xl overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-teal-500/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">
                {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}
              </p>
              <p className="text-slate-500 text-[11px] uppercase tracking-widest font-semibold mb-3">
                Total Balance · USD
              </p>
              <p className="text-5xl font-extrabold tracking-tight leading-none tabular-nums">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-slate-500 text-xs mt-3">
                Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="sm:w-40 shrink-0">
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2">Activity trend</p>
              <Sparkline values={sparkValues} />
              <p className="text-slate-600 text-[10px] mt-1 text-right">Last {sparkValues.length} transactions</p>
            </div>
          </div>
        </div>

        {/* ── Quick action grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: ArrowLeftRight, label: 'Transfer', href: '/transfer',  iconCls: 'bg-sky-50 text-sky-600 ring-sky-100'           },
            { icon: PlusCircle,     label: 'Deposit',  href: '/deposit',   iconCls: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
            { icon: MinusCircle,    label: 'Withdraw', href: '/withdraw',  iconCls: 'bg-rose-50 text-rose-500 ring-rose-100'          },
            { icon: Settings,       label: 'Settings', href: '/settings',  iconCls: 'bg-violet-50 text-violet-500 ring-violet-100'    },
          ].map(({ icon: Icon, label, href, iconCls }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className="flex flex-col items-center gap-2.5 bg-white rounded-2xl py-5 px-2 shadow-sm border border-slate-100 transition-all duration-300 hover:scale-[1.04] hover:shadow-md group"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ring-4 ${iconCls} transition-all duration-300 group-hover:ring-8`}>
                <Icon size={17} />
              </div>
              <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Account cards ──────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Accounts</h3>
            {!showOpenAcct && (
              <button
                onClick={() => { setShowOpenAcct(true); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <Plus size={13} /> Open Account
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((acc, idx) => (
              <div
                key={acc.id}
                className={`bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} rounded-3xl p-6 text-white border border-white/10 shadow-sm relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute right-8 top-24 w-24 h-24 rounded-full bg-white/5" />
                <div className="flex items-start justify-between mb-7 relative">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    {acc.account_type.replace(/_/g, ' ')}
                  </span>
                  <div className="w-8 h-5 rounded bg-yellow-400/70" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight mb-1 relative tabular-nums">
                  ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-white/40 text-xs mb-7 relative">Available · USD</p>
                <div className="flex items-center justify-between relative">
                  <span className="text-white/40 text-xs font-mono tracking-widest">{acc.account_number}</span>
                  <Link
                    to={`/transactions/${acc.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                  >
                    History <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {showOpenAcct && (
            <div className="mt-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Open a new account</h3>
                <button
                  onClick={() => { setShowOpenAcct(false); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              {openAcctSuccess ? (
                <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">{openAcctSuccess}</div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={openAcctType} onChange={(e) => setOpenAcctType(e.target.value)} className="hnt-input flex-1">
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="BUSINESS_CHECKING">Business Checking</option>
                    <option value="MONEY_MARKET">Money Market</option>
                  </select>
                  <button
                    onClick={handleOpenAccount}
                    disabled={openAcctLoading}
                    className="bg-bank-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-bank-teal transition-all duration-300 disabled:opacity-50"
                  >
                    {openAcctLoading ? 'Opening…' : 'Confirm'}
                  </button>
                </div>
              )}
              {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
            </div>
          )}
        </div>

        {/* ── Recent activity + sidebar ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity feed */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {recentTx.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-slate-400 text-sm">No transactions yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {recentTx.map((tx) => {
                  const isDeposit    = tx.type === 'DEPOSIT';
                  const isWithdrawal = tx.type === 'WITHDRAWAL';
                  const sign         = typeSign(tx.type, myAccountIds, tx);
                  const amountColor  = isDeposit ? 'text-emerald-600' : isWithdrawal ? 'text-slate-800' : 'text-sky-600';
                  const iconCls      = isDeposit
                    ? 'bg-emerald-50 text-emerald-500'
                    : isWithdrawal
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-sky-50 text-sky-500';
                  const TxIcon = isDeposit ? PlusCircle : isWithdrawal ? MinusCircle : ArrowLeftRight;
                  return (
                    <li key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconCls}`}>
                        <TxIcon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className={`text-sm font-bold tabular-nums shrink-0 ${amountColor}`}>
                        {sign}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">

            {/* Summary */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Active accounts</span>
                  <span className="text-sm font-bold text-slate-800">{accounts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Recent activity</span>
                  <span className="text-sm font-bold text-slate-800">{recentTx.length} transactions</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Total balance</span>
                  <span className="text-sm font-bold text-emerald-600 tabular-nums">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="relative bg-gradient-to-br from-emerald-950 to-[#024f54] rounded-3xl p-6 text-white border border-white/10 shadow-sm overflow-hidden">
              <div className="pointer-events-none absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="flex items-center gap-2.5 mb-3 relative">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Security</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-5 relative">
                256-bit encryption and 24/7 monitoring keep your funds safe.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="relative w-full text-center text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/20 rounded-xl py-2.5 transition-all duration-300"
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
