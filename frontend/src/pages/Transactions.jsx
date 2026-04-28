import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

const typeColor = (type) => {
  if (type === 'DEPOSIT') return 'text-emerald-400';
  if (type === 'WITHDRAWAL') return 'text-red-400';
  return 'text-blue-400';
};

const typeBadge = (type) => {
  const base = 'text-xs font-semibold px-2 py-0.5 rounded-full';
  if (type === 'DEPOSIT') return `${base} bg-emerald-500/20 text-emerald-400`;
  if (type === 'WITHDRAWAL') return `${base} bg-red-500/20 text-red-400`;
  return `${base} bg-blue-500/20 text-blue-400`;
};

const PAGE_SIZE = 20;

export default function Transactions() {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/accounts/${accountId}/balance`)
      .then(({ data }) => setAccount(data))
      .catch(() => {});
    loadPage(0);
  }, [accountId]);

  async function loadPage(off) {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/accounts/${accountId}/transactions?limit=${PAGE_SIZE}&offset=${off}`
      );
      if (off === 0) {
        setTxs(data);
      } else {
        setTxs((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
      setOffset(off + PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bank-dark text-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          {account && (
            <p className="text-slate-400 text-sm mt-1">
              {account.account_type} · {account.account_number} ·{' '}
              <span className="text-white font-medium">
                ${parseFloat(account.available_balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}{' '}
                USD
              </span>
            </p>
          )}
        </div>

        {txs.length === 0 && !loading ? (
          <p className="text-slate-500 text-sm text-center py-16">No transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className={typeBadge(tx.type)}>{tx.type}</span>
                  <p className="text-sm font-medium mt-1">{tx.description || '—'}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-lg font-bold ${typeColor(tx.type)}`}>
                  ${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-bank-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasMore && !loading && (
          <button
            onClick={() => loadPage(offset)}
            className="mt-6 w-full border border-white/20 hover:border-white/40 text-slate-300 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Load more
          </button>
        )}
      </main>
    </div>
  );
}
