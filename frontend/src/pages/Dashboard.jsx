import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { SkeletonCard, SkeletonRow } from '../components/Skeleton';
import { ArrowLeftRight, MinusCircle, ChevronRight, TrendingUp, PlusCircle, Settings, Plus, X } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bank-surface">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          <div className="mb-8 h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {[0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bank-surface">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-gray-500 text-sm">Good day,</p>
            <h1 className="text-3xl font-bold text-bank-dark">{user?.full_name ?? 'there'}</h1>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-bank-dark text-sm transition-colors"
          >
            <Settings size={16} /> Settings
          </button>
        </div>

        {/* Total balance card */}
        <div className="bg-bank-dark rounded-xl p-7 mb-8 flex items-center justify-between text-white">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Total balance</p>
            <p className="text-4xl font-extrabold tracking-tight">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-white/50 text-xs mt-1">All accounts combined · USD</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
            <TrendingUp size={26} className="text-bank-accent" />
          </div>
        </div>

        {/* Account cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {acc.account_type}
                </span>
                <span className="text-xs text-gray-400 font-mono">{acc.account_number}</span>
              </div>
              <p className="text-2xl font-bold text-bank-dark">
                ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-xs mt-1">Available · USD</p>
              <Link
                to={`/transactions/${acc.id}`}
                className="mt-4 flex items-center gap-1 text-bank-teal hover:text-bank-dark text-sm font-semibold transition-colors"
              >
                View transactions <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        {/* Open another account */}
        {!showOpenAcct ? (
          <button
            onClick={() => { setShowOpenAcct(true); setOpenAcctSuccess(''); setOpenAcctError(''); }}
            className="mb-8 flex items-center gap-2 text-sm text-bank-teal hover:text-bank-dark font-semibold transition-colors"
          >
            <Plus size={15} /> Open another account
          </button>
        ) : (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-bank-dark text-sm">Open a new account</h3>
              <button onClick={() => { setShowOpenAcct(false); setOpenAcctSuccess(''); setOpenAcctError(''); }} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            {openAcctSuccess ? (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm">
                {openAcctSuccess}
              </div>
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
                  className="bg-bank-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50"
                >
                  {openAcctLoading ? 'Opening…' : 'Confirm'}
                </button>
              </div>
            )}
            {openAcctError && (
              <p className="mt-2 text-xs text-red-600">{openAcctError}</p>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <button
            onClick={() => navigate('/transfer')}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 hover:border-bank-dark hover:shadow-sm px-4 py-5 rounded-xl text-sm font-semibold text-bank-dark transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-bank-light flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-bank-accent" />
            </div>
            Transfer
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 hover:border-bank-dark hover:shadow-sm px-4 py-5 rounded-xl text-sm font-semibold text-bank-dark transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <MinusCircle size={18} className="text-red-500" />
            </div>
            Withdraw
          </button>
          <button
            onClick={() => navigate('/deposit')}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 hover:border-bank-dark hover:shadow-sm px-4 py-5 rounded-xl text-sm font-semibold text-bank-dark transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <PlusCircle size={18} className="text-green-500" />
            </div>
            Deposit
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 hover:border-bank-dark hover:shadow-sm px-4 py-5 rounded-xl text-sm font-semibold text-bank-dark transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Settings size={18} className="text-purple-500" />
            </div>
            Settings
          </button>
        </div>

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-bank-dark">Recent transactions</h2>
              <Link
                to="/transactions"
                className="text-bank-teal text-sm font-semibold hover:text-bank-dark transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${typeBadge(tx.type)}`}>
                      {tx.type}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-bank-dark">{tx.description || tx.type}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm ${typeColor(tx.type)}`}>
                    {typeSign(tx.type, myAccountIds, tx)}$
                    {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

