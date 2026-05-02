import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import {
  ArrowLeft, Search, Download, X, FileText,
  PlusCircle, MinusCircle, ArrowLeftRight, Filter,
} from 'lucide-react';

const PAGE_SIZE = 10;

function typeBadge(type) {
  const base = 'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide';
  if (type === 'DEPOSIT')    return base + ' bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (type === 'WITHDRAWAL') return base + ' bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return base + ' bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
}

function exportCSV(txs) {
  const header = ['Date', 'Type', 'Description', 'Amount (USD)'];
  const rows = txs.map((tx) => [
    new Date(tx.created_at).toLocaleString('en-US'),
    tx.type,
    '"' + (tx.description || '').replace(/"/g, '""') + '"',
    (tx.type === 'DEPOSIT' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : '') +
      parseFloat(tx.amount).toFixed(2),
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hunch-transactions-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function dateRangeFilter(tx, range) {
  const d = new Date(tx.created_at);
  const now = new Date();
  if (range === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (range === '3months') {
    const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 3);
    return d >= cutoff;
  }
  if (range === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true; // 'all'
}

export default function Transactions() {
  const { accountId } = useParams();

  const [allAccounts, setAllAccounts] = useState([]);
  const [selectedAccId, setSelectedAccId] = useState(accountId || '');
  const [account, setAccount] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter]   = useState('');
  const [searchText, setSearchText]   = useState('');
  const [dateFilter, setDateFilter]   = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const buildUrl = useCallback(() => {
    const base = selectedAccId
      ? '/accounts/' + selectedAccId + '/transactions?limit=500'
      : '/accounts/transactions?limit=500';
    const params = [];
    if (typeFilter)           params.push('tx_type=' + typeFilter);
    if (searchText.trim())    params.push('q=' + encodeURIComponent(searchText.trim()));
    return base + (params.length ? '&' + params.join('&') : '');
  }, [selectedAccId, typeFilter, searchText]);

  // Load account list
  useEffect(() => {
    api.get('/accounts/').then(({ data }) => setAllAccounts(data)).catch(() => {});
  }, []);

  // Load account detail when viewing specific account
  useEffect(() => {
    if (selectedAccId) {
      api.get('/accounts/' + selectedAccId + '/balance')
        .then(({ data }) => setAccount(data))
        .catch(() => {});
    } else {
      setAccount(null);
    }
  }, [selectedAccId]);

  // Load transactions
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    api.get(buildUrl()).then(({ data }) => setTxs(data)).finally(() => setLoading(false));
  }, [buildUrl]);

  // Client-side filters
  const filtered = useMemo(() => {
    return txs.filter((tx) => dateRangeFilter(tx, dateFilter));
  }, [txs, dateFilter]);

  // Stats from filtered set
  const totalIn  = filtered.filter((t) => t.type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = filtered.filter((t) => t.type !== 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
  const netChange = totalIn - totalOut;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Running balance (single-account view only)
  const withRunning = useMemo(() => {
    if (!account) return paginated.map((tx) => ({ ...tx, runningBalance: null }));
    const currentBal = parseFloat(account.available_balance ?? account.balance);
    const sortedAll  = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    let running = currentBal;
    const runMap = {};
    for (const tx of sortedAll) {
      runMap[tx.id] = running;
      const amt = parseFloat(tx.amount);
      if (tx.type === 'DEPOSIT')    running -= amt;
      else if (tx.type === 'WITHDRAWAL') running += amt;
    }
    return paginated.map((tx) => ({ ...tx, runningBalance: runMap[tx.id] ?? null }));
  }, [paginated, account, filtered]);

  const clearFilters = () => {
    setTypeFilter('');
    setSearchText('');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const filtersActive = typeFilter !== '' || searchText.trim() !== '' || dateFilter !== 'all';
  const pageTitle = account
    ? account.account_type + ' · ' + account.account_number
    : 'All Transactions';

  const TYPE_PILLS = [
    { value: '',           label: 'All'         },
    { value: 'DEPOSIT',    label: 'Deposits'    },
    { value: 'WITHDRAWAL', label: 'Withdrawals' },
    { value: 'TRANSFER',   label: 'Transfers'   },
  ];

  const DATE_PILLS = [
    { value: 'month',   label: 'This Month'     },
    { value: '3months', label: 'Last 3 Months'  },
    { value: 'year',    label: 'This Year'      },
    { value: 'all',     label: 'All Time'       },
  ];

  const pillCls = (active) =>
    'px-3 py-1 rounded-full text-xs font-semibold transition-all ' +
    (active
      ? 'bg-[#063b36] text-white'
      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/15');

  const TxIcon = ({ type }) => {
    if (type === 'DEPOSIT')    return <PlusCircle  size={13} className="text-emerald-600" />;
    if (type === 'WITHDRAWAL') return <MinusCircle size={13} className="text-red-500"     />;
    return <ArrowLeftRight size={13} className="text-sky-600" />;
  };

  const amtCls = (type) => {
    if (type === 'DEPOSIT')    return 'font-bold tabular-nums text-emerald-600';
    if (type === 'WITHDRAWAL') return 'font-bold tabular-nums text-red-600';
    return 'font-bold tabular-nums text-sky-600';
  };

  return (
    <BankShell title="Transactions">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Back link */}
        <Link to="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transaction History</h1>
            {account && (
              <p className="text-sm text-slate-400 mt-0.5">
                {account.account_type} &middot; {account.account_number} &mdash; Balance: <span className="font-semibold text-slate-700 dark:text-white/70">${parseFloat(account.available_balance ?? account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl hover:border-[#063b36] hover:text-[#063b36] dark:hover:text-[#7CFC00] transition-colors disabled:opacity-40"
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-4 mb-4 shadow-sm space-y-3 premium-enter">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Account selector */}
            <select
              value={selectedAccId}
              onChange={(e) => { setSelectedAccId(e.target.value); setCurrentPage(1); }}
              className="border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36] sm:w-52"
            >
              <option value="">All Accounts</option>
              {allAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_type.replace(/_/g, ' ')} &bull;&bull;&bull;&bull;{a.account_number.slice(-4)}
                </option>
              ))}
            </select>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                placeholder="Search transactions…"
                className="w-full border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
              />
            </div>
            {filtersActive && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors shrink-0 px-2">
                <X size={13} /> Clear
              </button>
            )}
          </div>
          {/* Type pills */}
          <div className="flex gap-2 flex-wrap">
            {TYPE_PILLS.map((p) => (
              <button key={p.value} onClick={() => { setTypeFilter(p.value); setCurrentPage(1); }}
                className={pillCls(typeFilter === p.value)}>
                {p.label}
              </button>
            ))}
            <div className="w-px bg-slate-200 dark:bg-white/10 mx-1" />
            {DATE_PILLS.map((p) => (
              <button key={p.value} onClick={() => { setDateFilter(p.value); setCurrentPage(1); }}
                className={pillCls(dateFilter === p.value)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-4 shadow-sm mb-4 premium-enter premium-enter-delay-1">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total In</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 tabular-nums">+${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Out</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 tabular-nums">-${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Net Change</p>
              <p className={'text-lg sm:text-xl font-bold tabular-nums ' + (netChange >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                {netChange >= 0 ? '+' : ''}${Math.abs(netChange).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          {/* Cash flow bar */}
          {(totalIn + totalOut) > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Money In</span>
                <span>Money Out</span>
              </div>
              <div className="h-2 rounded-full bg-red-200 dark:bg-red-900/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.round((totalIn / (totalIn + totalOut)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold mt-1">
                <span className="text-emerald-600">{Math.round((totalIn / (totalIn + totalOut)) * 100)}%</span>
                <span className="text-red-600">{Math.round((totalOut / (totalIn + totalOut)) * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden shadow-sm">
            {[0,1,2,3,4,5].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-slate-50 dark:border-white/5 flex gap-4">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 py-20 text-center shadow-sm">
            <FileText size={36} className="text-slate-200 dark:text-white/10 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No transactions found</p>
            {filtersActive && <p className="text-xs text-slate-400 mt-1">Try clearing your filters</p>}
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Description</th>
                    <th className="px-5 py-3 text-left hidden sm:table-cell">Account</th>
                    <th className="px-5 py-3 text-center">Type</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    {account && <th className="px-5 py-3 text-right hidden md:table-cell">Balance</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {withRunning.map((tx, i) => {
                    const rowBg = i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-white/[0.02]';
                    const sign = tx.type === 'DEPOSIT' ? '+' : '-';
                    return (
                      <tr key={tx.id}
                        className={'transition-colors hover:bg-slate-100 dark:hover:bg-white/5 ' + rowBg}>
                        <td className="px-5 py-3.5 text-slate-400 dark:text-white/40 text-xs whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <br />
                          <span className="text-[10px]">{new Date(tx.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={'w-7 h-7 rounded-full flex items-center justify-center shrink-0 ' + (tx.type === 'DEPOSIT' ? 'bg-emerald-50 dark:bg-emerald-900/20' : tx.type === 'WITHDRAWAL' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-sky-50 dark:bg-sky-900/20')}>
                              <TxIcon type={tx.type} />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-white/70 truncate max-w-[160px]">
                              {tx.description || tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 dark:text-white/40 text-xs hidden sm:table-cell">
                          {tx.account_number ? '••••' + tx.account_number.slice(-4) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={typeBadge(tx.type)}>{tx.type}</span>
                        </td>
                        <td className={'px-5 py-3.5 text-right whitespace-nowrap ' + amtCls(tx.type)}>
                          {sign}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        {account && (
                          <td className="px-5 py-3.5 text-right text-xs text-slate-500 dark:text-white/40 hidden md:table-cell whitespace-nowrap">
                            {tx.runningBalance !== null
                              ? '$' + tx.runningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })
                              : '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#063b36] hover:text-[#063b36] dark:hover:text-[#7CFC00] disabled:opacity-40 transition-colors"
                >
                  ← Prev
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={'px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ' + (currentPage === page ? 'bg-[#063b36] text-white' : 'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#063b36]')}>
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="text-slate-400 text-xs self-center">…</span>}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-[#063b36] hover:text-[#063b36] dark:hover:text-[#7CFC00] disabled:opacity-40 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </BankShell>
  );
}
