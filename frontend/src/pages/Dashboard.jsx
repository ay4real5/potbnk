import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { ArrowLeftRight, MinusCircle, ChevronRight, TrendingUp } from 'lucide-react';

const typeColor = (type) => {
  if (type === 'DEPOSIT') return 'text-emerald-400';
  if (type === 'WITHDRAWAL') return 'text-red-400';
  return 'text-blue-400';
};

const typeSign = (type, accountId, tx) => {
  if (type === 'DEPOSIT') return '+';
  if (type === 'WITHDRAWAL') return '-';
  return tx.sender_id === accountId ? '-' : '+';
};

export default function Dashboard() {
  const { user, fetchMe } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!user) await fetchMe();
      try {
        const { data: accs } = await api.get('/accounts/');
        setAccounts(accs);
        if (accs.length > 0) {
          const { data: txs } = await api.get(
            `/accounts/${accs[0].id}/transactions?limit=5`
          );
          setRecentTx(txs);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-bank-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bank-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bank-dark text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-400 text-sm">Good day,</p>
          <h1 className="text-3xl font-bold">{user?.full_name ?? 'there'}</h1>
        </div>

        {/* Total balance card */}
        <div className="bg-gradient-to-br from-bank-primary to-bank-accent rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Total balance</p>
            <p className="text-4xl font-extrabold">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <TrendingUp size={40} className="text-blue-200/50" />
        </div>

        {/* Account cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {acc.account_type}
                </span>
                <span className="text-xs text-slate-500">{acc.account_number}</span>
              </div>
              <p className="text-2xl font-bold">
                ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-slate-500 text-xs mt-1">USD</p>
              <Link
                to={`/transactions/${acc.id}`}
                className="mt-4 flex items-center gap-1 text-bank-accent text-sm hover:underline"
              >
                View transactions <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => navigate('/transfer')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeftRight size={16} className="text-bank-accent" /> Transfer
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <MinusCircle size={16} className="text-red-400" /> Withdraw
          </button>
        </div>

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Recent transactions</h2>
              {accounts[0] && (
                <Link
                  to={`/transactions/${accounts[0].id}`}
                  className="text-bank-accent text-sm hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {recentTx.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description || tx.type}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`font-semibold ${typeColor(tx.type)}`}>
                    {typeSign(tx.type, accounts[0]?.id, tx)}$
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
