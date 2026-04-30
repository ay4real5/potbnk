import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { ArrowLeft, Search, Download, X, FileText } from 'lucide-react';

const typeBadge = (type) => {
  const base = 'text-xs font-semibold px-2.5 py-0.5 rounded-full';
  if (type === 'DEPOSIT') return `${base} bg-emerald-100 text-emerald-700`;
  if (type === 'WITHDRAWAL') return `${base} bg-red-100 text-red-700`;
  return `${base} bg-blue-100 text-blue-700`;
};

const typeSign = (type) => {
  if (type === 'DEPOSIT') return '+';
  if (type === 'WITHDRAWAL') return '-';
  return '';
};

const typeAmountClass = (type) => {
  if (type === 'DEPOSIT') return 'text-emerald-600 font-bold text-base';
  if (type === 'WITHDRAWAL') return 'text-red-600 font-bold text-base';
  return 'text-bank-dark font-bold text-base';
};

function exportCSV(txs) {
  const header = ['Date', 'Type', 'Description', 'Amount (USD)'];
  const rows = txs.map((tx) => [
    new Date(tx.created_at).toLocaleString('en-US'),
    tx.type,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    (tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : '') +
      parseFloat(tx.amount).toFixed(2),
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hunch-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const filtersActive = typeFilter !== '' || searchText.trim() !== '';

  const buildUrl = useCallback((extraParams = '') => {
    const base = accountId
      ? `/accounts/${accountId}/transactions?limit=200`
      : `/accounts/transactions?limit=200`;
    const params = [];
    if (typeFilter) params.push(`tx_type=${typeFilter}`);
    if (searchText.trim()) params.push(`q=${encodeURIComponent(searchText.trim())}`);
    const qs = params.length ? `&${params.join('&')}` : '';
    return base + qs + extraParams;
  }, [accountId, typeFilter, searchText]);

  useEffect(() => {
    if (accountId) {
      api.get(`/accounts/${accountId}/balance`).then(({ data }) => setAccount(data)).catch(() => {});
    }
  }, [accountId]);

  useEffect(() => {
    setLoading(true);
    api.get(buildUrl()).then(({ data }) => {
      setTxs(data);
    }).finally(() => setLoading(false));
  }, [buildUrl]);

  const clearFilters = () => {
    setTypeFilter('');
    setSearchText('');
  };

  const pageTitle = accountId
    ? (account ? `${account.account_type} · ${account.account_number}` : 'Transaction History')
    : 'All Transactions';

  return (
    <BankShell title="Transactions">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-bank-dark text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        {/* Account header */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-4 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-bank-dark rounded-r-xl" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-bank-dark">Transaction History</h1>
              {accountId ? (
                account ? (
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-sm text-gray-600">
                      {account.account_type} · {account.account_number}
                    </span>
                    <span className="text-sm font-semibold text-bank-dark">
                      Balance: ${parseFloat(account.available_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                ) : (
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
                )
              ) : (
                <p className="text-sm text-gray-500 mt-1">All accounts combined</p>
              )}
            </div>
            {txs.length > 0 && (
              <button
                onClick={() => exportCSV(txs)}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:border-bank-dark hover:text-bank-dark transition-colors"
              >
                <Download size={13} /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-5 shadow-sm flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search description…"
              className="hnt-input pl-8 py-2 text-sm w-full"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="hnt-input py-2 text-sm w-full sm:w-44"
          >
            <option value="">All types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER">Transfers</option>
          </select>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {filtersActive && !loading && (
          <p className="text-xs text-gray-400 mb-3 px-1">
            {txs.length} result{txs.length !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Transaction list */}
        {txs.length === 0 && !loading ? (
          <div className="bg-white border border-gray-200 rounded-xl py-20 text-center shadow-sm">
            <FileText size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{filtersActive ? 'No transactions match your filters.' : 'No transactions yet.'}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Date &amp; Time</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
            {txs.map((tx, i) => (
              <tr
                key={tx.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(tx.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 font-medium text-bank-dark max-w-[200px] truncate">
                  {tx.description || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={typeBadge(tx.type)}>{tx.type}</span>
                </td>
                <td className={`px-6 py-4 font-bold text-right whitespace-nowrap ${typeAmountClass(tx.type)}`}>
                  {typeSign(tx.type)}$
                  {parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-100 flex gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </BankShell>
  );
}
