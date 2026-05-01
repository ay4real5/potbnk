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
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="h-48 bg-slate-300 rounded-2xl animate-pulse" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 flex-1 bg-slate-200 rounded-full animate-pulse" />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
              <div className="h-52 bg-slate-200 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
              <div className="h-36 bg-slate-200 rounded-2xl animate-pulse" />
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

        {/* ── Hero card ────────────────────────────────────────────────── */}
        <div className="bg-[#063b36] rounded-2xl p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-1">
              {greeting()}, {user?.full_name?.split(' ')[0] ?? 'there'}
            </p>
            <p className="font-serif text-3xl font-bold text-white mb-5">Welcome back</p>
            <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1">Total Balance</p>
            <p className="text-4xl font-bold text-white tabular-nums">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-white/40 mt-2">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''} · USD
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/deposit')}
              className="bg-[#84cc16] text-[#041f1c] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#a3e635] transition-colors"
            >
              + Deposit
            </button>
            <button
              onClick={() => navigate('/transfer')}
              className="border border-white/40 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-white/10 transition-colors"
            >
              ↔ Transfer
            </button>
          </div>
        </div>

        {/* ── Quick actions row ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { label: 'Transfer', href: '/transfer'  },
            { label: 'Deposit',  href: '/deposit'   },
            { label: 'Withdraw', href: '/withdraw'  },
            { label: 'Settings', href: '/settings'  },
          ].map(({ label, href }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className="bg-white border border-slate-200 rounded-full px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-[#063b36] hover:text-white hover:border-[#063b36] transition-all duration-300"
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Two-column grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* Left: accounts + activity */}
          <div className="lg:col-span-2 space-y-6">

            {/* My Accounts */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">My Accounts</h3>
                {!showOpenAcct && (
                  <button
                    onClick={() => { setShowOpenAcct(true); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                  >
                    <Plus size={12} /> Open Account
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                        {acc.account_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-mono text-slate-600">
                        ••••{acc.account_number.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#063b36] tabular-nums">
                        ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <Link
                        to={`/transactions/${acc.id}`}
                        className="text-xs font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Open account form */}
              {showOpenAcct && (
                <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-5">
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
                      <select
                        value={openAcctType}
                        onChange={(e) => setOpenAcctType(e.target.value)}
                        className="hnt-input flex-1"
                      >
                        <option value="CHECKING">Checking</option>
                        <option value="SAVINGS">Savings</option>
                        <option value="BUSINESS_CHECKING">Business Checking</option>
                        <option value="MONEY_MARKET">Money Market</option>
                      </select>
                      <button
                        onClick={handleOpenAccount}
                        disabled={openAcctLoading}
                        className="bg-[#063b36] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#041f1c] transition-all duration-300 disabled:opacity-50"
                      >
                        {openAcctLoading ? 'Opening…' : 'Confirm'}
                      </button>
                    </div>
                  )}
                  {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">Recent Activity</h3>
                <Link
                  to="/transactions"
                  className="text-xs font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                >
                  View all →
                </Link>
              </div>
              {recentTx.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-slate-400 text-sm">No transactions yet.</p>
                </div>
              ) : (
                <ul>
                  {recentTx.map((tx) => {
                    const isDeposit    = tx.type === 'DEPOSIT';
                    const isWithdrawal = tx.type === 'WITHDRAWAL';
                    const sign         = typeSign(tx.type, myAccountIds, tx);
                    const amountCls    = isDeposit ? 'text-emerald-600' : 'text-slate-800';
                    const iconBg       = isDeposit
                      ? 'bg-emerald-50 text-emerald-500'
                      : isWithdrawal
                      ? 'bg-rose-50 text-rose-500'
                      : 'bg-sky-50 text-sky-500';
                    const TxIcon = isDeposit ? PlusCircle : isWithdrawal ? MinusCircle : ArrowLeftRight;
                    return (
                      <li key={tx.id} className="flex justify-between items-center px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                            <TxIcon size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{tx.description || tx.type}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold tabular-nums ${amountCls}`}>
                          {sign}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Right: summary + security */}
          <div className="flex flex-col gap-4">

            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Summary</h3>
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
                  <span className="text-sm font-bold text-[#063b36] tabular-nums">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Security card */}
            <div className="bg-[#063b36] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} className="text-[#84cc16]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#84cc16]">Security</p>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-5">
                256-bit encryption and 24/7 monitoring keep your funds safe.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-center text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/20 rounded-xl py-2.5 transition-all duration-300"
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
