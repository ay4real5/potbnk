import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { ArrowLeftRight, MinusCircle, ChevronRight, TrendingUp, PlusCircle, Settings, Plus, X, Wallet, BarChart2, ShieldCheck } from 'lucide-react';

const typeColor = (type) => {
  if (type === 'DEPOSIT') return 'text-emerald-600';
  if (type === 'WITHDRAWAL') return 'text-red-600';
  return 'text-blue-600';
};

const typeSign = (type, accountIds, tx) => {
  if (type === 'DEPOSIT') return '+';
  if (type === 'WITHDRAWAL') return '-';
  // TRANSFER: debit if sender is one of our accounts
  return accountIds.has(tx.sender_id) ? '-' : '+';
};

const typeBadge = (type) => {
  if (type === 'DEPOSIT') return 'bg-emerald-50 text-emerald-700';
  if (type === 'WITHDRAWAL') return 'bg-red-50 text-red-700';
  return 'bg-blue-50 text-blue-700';
};

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
          const { data: txs } = await api.get('/accounts/transactions?limit=5');
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
      // Refresh account list
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
    } catch (err) {
      setOpenAcctError(err.response?.data?.detail || 'Failed to open account. Please try again.');
    } finally {
      setOpenAcctLoading(false);
    }
  };

  const CARD_GRADIENTS = [
    'from-bank-dark to-[#024f54]',
    'from-[#1a3a4a] to-[#0d5e6a]',
    'from-[#1e3a5f] to-[#2d5986]',
    'from-[#134e4a] to-[#065f46]',
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <BankShell title="Dashboard">
        <div className="p-6 lg:p-8">
          <div className="mb-7 h-9 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl h-80 animate-pulse" />
            <div className="bg-white rounded-xl h-80 animate-pulse" />
          </div>
        </div>
      </BankShell>
    );
  }

  return (
    <BankShell title="Dashboard">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Greeting */}
        <div className="mb-7">
          <p className="text-gray-500 text-sm">{greeting()},</p>
          <h2 className="text-2xl font-bold text-bank-dark">{user?.full_name ?? 'Welcome back'}</h2>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-bank-dark rounded-xl p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Balance</p>
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <TrendingUp size={17} className="text-bank-accent" />
              </div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-white/40 text-xs mt-1">All accounts · USD</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Accounts</p>
              <div className="w-9 h-9 rounded-lg bg-bank-light flex items-center justify-center shrink-0">
                <Wallet size={17} className="text-bank-accent" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-bank-dark">{accounts.length}</p>
            <p className="text-gray-400 text-xs mt-1">Active accounts</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Recent Activity</p>
              <div className="w-9 h-9 rounded-lg bg-bank-light flex items-center justify-center shrink-0">
                <BarChart2 size={17} className="text-bank-teal" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-bank-dark">{recentTx.length}</p>
            <p className="text-gray-400 text-xs mt-1">Transactions</p>
          </div>
        </div>

        {/* Account cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Accounts</h3>
            {!showOpenAcct && (
              <button
                onClick={() => { setShowOpenAcct(true); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-bank-teal hover:text-bank-dark transition-colors"
              >
                <Plus size={13} /> Open Account
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((acc, idx) => (
              <div
                key={acc.id}
                className={`bg-gradient-to-br ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} rounded-xl p-6 text-white shadow-sm relative overflow-hidden`}
              >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute right-4 top-16 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
                <div className="flex items-start justify-between mb-6 relative">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                    {acc.account_type.replace(/_/g, ' ')}
                  </span>
                  <div className="w-8 h-5 rounded-sm bg-yellow-400/80" />
                </div>
                <p className="text-2xl font-extrabold tracking-tight mb-1 relative">
                  ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-white/40 text-xs mb-5 relative">Available · USD</p>
                <div className="flex items-center justify-between relative">
                  <span className="text-white/50 text-xs font-mono">{acc.account_number}</span>
                  <Link
                    to={`/transactions/${acc.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    History <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {showOpenAcct && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-bank-dark text-sm">Open a new account</h3>
                <button onClick={() => { setShowOpenAcct(false); setOpenAcctSuccess(''); setOpenAcctError(''); }} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              {openAcctSuccess ? (
                <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">{openAcctSuccess}</div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select value={openAcctType} onChange={(e) => setOpenAcctType(e.target.value)} className="hnt-input flex-1">
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="BUSINESS_CHECKING">Business Checking</option>
                    <option value="MONEY_MARKET">Money Market</option>
                  </select>
                  <button onClick={handleOpenAccount} disabled={openAcctLoading} className="bg-bank-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50">
                    {openAcctLoading ? 'Opening…' : 'Confirm'}
                  </button>
                </div>
              )}
              {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
            </div>
          )}
        </div>

        {/* Bottom 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent transactions — table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-bank-dark text-sm">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs font-semibold text-bank-teal hover:text-bank-dark transition-colors flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No transactions yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-bank-dark max-w-[160px] truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          tx.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          tx.type === 'WITHDRAWAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>{tx.type}</span>
                      </td>
                      <td className={`px-6 py-3.5 font-bold text-right whitespace-nowrap ${
                        tx.type === 'DEPOSIT' ? 'text-emerald-600' :
                        tx.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' :
                          myAccountIds.has(tx.sender_id) ? '-' : '+'}
                        ${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-bank-dark text-sm">Quick Actions</h3>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {[
                  { icon: ArrowLeftRight, label: 'Transfer Funds', sub: 'Send to another account', href: '/transfer', color: 'bg-blue-50 text-blue-500' },
                  { icon: PlusCircle,     label: 'Deposit',        sub: 'Add money',               href: '/deposit',  color: 'bg-emerald-50 text-emerald-500' },
                  { icon: MinusCircle,    label: 'Withdraw',       sub: 'Take funds out',           href: '/withdraw', color: 'bg-red-50 text-red-500' },
                  { icon: Settings,       label: 'Settings',       sub: 'Manage account',           href: '/settings', color: 'bg-purple-50 text-purple-500' },
                ].map(({ icon: Icon, label, sub, href, color }) => (
                  <button
                    key={href}
                    onClick={() => navigate(href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group text-left w-full"
                  >
                    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-bank-dark group-hover:text-bank-teal transition-colors">{label}</p>
                      <p className="text-xs text-gray-400 truncate">{sub}</p>
                    </div>
                    <ChevronRight size={13} className="ml-auto text-gray-300 shrink-0 group-hover:text-bank-teal transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Security card */}
            <div className="bg-bank-dark rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-bank-accent" />
                <p className="text-xs font-bold uppercase tracking-widest text-bank-accent">Security</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                Your account is protected with 256-bit encryption and monitored 24/7.
              </p>
              <button onClick={() => navigate('/settings')} className="text-xs font-semibold text-bank-accent hover:underline">
                Review security settings →
              </button>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  );
}
