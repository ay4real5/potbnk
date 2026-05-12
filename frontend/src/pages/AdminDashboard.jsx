import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ─── tiny helpers ─────────────────────────────────────────────── */
const fmt = (n) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtDate = (s) => new Date(s).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const ACTION_COLORS = {
  credit_account: 'text-emerald-400',
  debit_account:  'text-red-400',
  lock_user:      'text-amber-400',
  unlock_user:    'text-sky-400',
  reset_password: 'text-purple-400',
  update_loan_status: 'text-emerald-400',
  update_dispute_status: 'text-amber-400',
  approve_external_transfer: 'text-emerald-400',
  reject_external_transfer:  'text-red-400',
};

const TABS = ['Overview', 'Users', 'Pending Transfers', 'Loans', 'Disputes', 'Wires', 'Cards', 'Balance Tools', 'Audit Log'];

/* ─── stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, sub, color = 'text-[#8fdb46]' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-white/50 text-xs mt-1">{sub}</p>}
    </div>
  );
}

/* ─── alert ────────────────────────────────────────────────────── */
function Alert({ msg, type = 'error' }) {
  if (!msg) return null;
  const cls = type === 'success'
    ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-100'
    : 'border-red-300/30 bg-red-500/10 text-red-100';
  return <div className={`rounded-lg border ${cls} text-sm px-3 py-2 mb-3`}>{msg}</div>;
}

/* ─── input ────────────────────────────────────────────────────── */
function Input({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-white/60">{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        required={required}
        className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
      />
    </div>
  );
}

/* ─── Account row with editable account number ──────────────────── */
function AccountRow({ account, onUpdated, setErr, setOk }) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(account.account_number);
  const [val, setVal] = useState(account.account_number);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setErr(''); setOk(''); setBusy(true);
    try {
      const r = await api.patch(`/admin/accounts/${account.id}/number`, null, { params: { new_number: val.trim() } });
      setOk(r.data?.message || 'Account number updated.');
      setCurrent(val.trim());
      setEditing(false);
      onUpdated?.();
    } catch (e) {
      setErr(e.response?.data?.detail || 'Update failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg bg-white/5 px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/70 shrink-0">{account.account_type}</span>
        {editing ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="flex-1 rounded border border-white/20 bg-black/30 px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#8fdb46]"
            autoFocus
          />
        ) : (
          <span className="text-white/70 font-mono text-xs flex-1 truncate text-center">{current}</span>
        )}
        <span className="font-semibold text-[#8fdb46] shrink-0">{fmt(account.balance)}</span>
        {editing ? (
          <div className="flex gap-1 shrink-0">
            <button onClick={save} disabled={busy || !val.trim() || val === current}
              className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40">{busy ? '…' : 'Save'}</button>
            <button onClick={() => { setEditing(false); setVal(current); }}
              className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/70 hover:bg-white/20">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-[10px] px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 shrink-0">Edit #</button>
        )}
      </div>
    </div>
  );
}

/* ─── User row actions modal ───────────────────────────────────── */
function UserModal({ user, onClose, onRefresh }) {
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    setErr(''); setOk(''); setBusy(true);
    try { const r = await fn(); setOk(r.data?.message || 'Done.'); onRefresh(); }
    catch (e) { setErr(e.response?.data?.detail || 'Action failed.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0a2322] p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-bold text-white text-lg">{user.full_name}</p>
            <p className="text-white/60 text-sm">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="space-y-2 mb-4">
          {user.accounts?.map((a) => (
            <AccountRow key={a.id} account={a} onUpdated={onRefresh} setErr={setErr} setOk={setOk} />
          ))}
        </div>

        <Alert msg={err} type="error" />
        <Alert msg={ok} type="success" />

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button disabled={busy || user.is_locked}
            onClick={() => act(() => api.post(`/admin/users/${user.id}/lock`))}
            className="rounded-full py-2 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition disabled:opacity-40">
            🔒 Lock Account
          </button>
          <button disabled={busy || !user.is_locked}
            onClick={() => act(() => api.post(`/admin/users/${user.id}/unlock`))}
            className="rounded-full py-2 text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition disabled:opacity-40">
            🔓 Unlock Account
          </button>
        </div>

        <div className="flex gap-2">
          <input value={newPw} onChange={(e) => setNewPw(e.target.value)}
            type="text" placeholder="New password (min 8 chars)"
            className="flex-1 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]" />
          <button disabled={busy || newPw.length < 8}
            onClick={() => act(() => api.post(`/admin/users/${user.id}/reset-password`, { new_password: newPw }))}
            className="rounded-lg px-3 py-2 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30 transition disabled:opacity-40 shrink-0">
            Reset PW
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Overview tab ─────────────────────────────────────────────── */
function OverviewTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/overview').then((r) => setStats(r.data)).catch(() => {});
  }, []);
  if (!stats) return <p className="text-white/50 text-sm">Loading stats…</p>;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Total Users" value={stats.users.toLocaleString()} />
      <StatCard label="Total Accounts" value={stats.accounts.toLocaleString()} sub="Checking + Savings" />
      <StatCard label="All Transactions" value={stats.transactions.toLocaleString()} />
      <StatCard label="7-Day Activity" value={stats.recent_activity_7d.toLocaleString()} sub="Transactions" color="text-sky-400" />
      <StatCard label="Total Deposits Under Management" value={fmt(stats.total_balances_usd)} sub="All accounts combined" color="text-purple-300" />
    </div>
  );
}

/* ─── Users tab ────────────────────────────────────────────────── */
function UsersTab() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/users', { params: { q, limit: 50 } });
      setUsers(r.data);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => { search(); }, [search]);

  const openUser = async (u) => {
    const r = await api.get(`/admin/users/${u.id}`);
    setSelected(r.data);
  };

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email…"
        className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46] mb-4" />
      {loading && <p className="text-white/50 text-sm">Searching…</p>}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-right px-4 py-3">Accounts</th>
              <th className="text-right px-4 py-3">Balance</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-4 py-3 font-medium text-white">{u.full_name}</td>
                <td className="px-4 py-3 text-white/70">{u.email}</td>
                <td className="px-4 py-3 text-right text-white/70">{u.account_count}</td>
                <td className="px-4 py-3 text-right text-[#8fdb46] font-semibold">{fmt(u.total_balance)}</td>
                <td className="px-4 py-3 text-center">
                  {u.is_locked
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-400/30">Locked</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">Active</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openUser(u)}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-white/40 text-sm">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && <UserModal user={selected} onClose={() => setSelected(null)} onRefresh={search} />}
    </div>
  );
}

/* ─── Balance Tools tab ────────────────────────────────────────── */
function BalanceTool() {
  const blank = { userEmail: '', accountType: 'CHECKING', amount: '', description: '' };
  const [creditForm, setCreditForm] = useState(blank);
  const [debitForm, setDebitForm] = useState(blank);
  const [creditMsg, setCreditMsg] = useState({ text: '', type: '' });
  const [debitMsg, setDebitMsg] = useState({ text: '', type: '' });
  const [busy, setBusy] = useState('');

  const setF = (setter) => (field) => (e) => setter((p) => ({ ...p, [field]: e.target.value }));

  const submit = async (form, endpoint, setMsg, onSuccess) => {
    setMsg({ text: '', type: '' });
    if (!form.userEmail.trim()) return setMsg({ text: 'User email required.', type: 'error' });
    if (!Number(form.amount) || Number(form.amount) <= 0) return setMsg({ text: 'Valid amount required.', type: 'error' });
    setBusy(endpoint);
    try {
      const { data } = await api.post(`/admin/${endpoint}`, {
        user_email: form.userEmail.trim().toLowerCase(),
        account_type: form.accountType,
        amount: Number(form.amount),
        description: form.description.trim() || undefined,
      });
      setMsg({ text: `${data.message} New balance: ${fmt(data.new_balance)}`, type: 'success' });
      onSuccess();
    } catch (e) {
      setMsg({ text: e.response?.data?.detail || 'Operation failed.', type: 'error' });
    } finally { setBusy(''); }
  };

  const row = (form, setForm, label, endpoint, setMsg, msg, btnCls) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8fdb46] mb-1">{label}</p>
      <p className="text-white/60 text-xs mb-4">Every action is logged in the admin audit trail.</p>
      <Alert msg={msg.text} type={msg.type} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Input label="User email" type="email" value={form.userEmail} onChange={setF(setForm)('userEmail')} required />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/60">Account type</label>
          <select value={form.accountType} onChange={setF(setForm)('accountType')}
            className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8fdb46]">
            <option value="CHECKING">CHECKING</option>
            <option value="SAVINGS">SAVINGS</option>
          </select>
        </div>
        <Input label="Amount ($)" type="number" value={form.amount} onChange={setF(setForm)('amount')} placeholder="0.00" required />
        <Input label="Description" value={form.description} onChange={setF(setForm)('description')} placeholder="e.g. Dispute resolution" />
      </div>
      <button disabled={!!busy}
        onClick={() => submit(form, endpoint, setMsg, () => setForm(blank))}
        className={`mt-4 w-full rounded-full font-bold py-2.5 transition disabled:opacity-50 ${btnCls}`}>
        {busy === endpoint ? 'Processing…' : label}
      </button>
    </section>
  );

  return (
    <div className="space-y-5">
      {row(creditForm, setCreditForm, 'Credit Account', 'credit', setCreditMsg, creditMsg,
        'bg-[#8fdb46] text-bank-dark hover:brightness-105')}
      {row(debitForm, setDebitForm, 'Debit Account', 'debit', setDebitMsg, debitMsg,
        'bg-red-500/80 text-white hover:bg-red-500')}
    </div>
  );
}

/* ─── Audit log tab ────────────────────────────────────────────── */
function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    api.get('/admin/audit-log').then((r) => setLogs(r.data)).catch(() => {});
  }, []);
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest">
            <th className="text-left px-4 py-3">Time</th>
            <th className="text-left px-4 py-3">Actor</th>
            <th className="text-left px-4 py-3">Action</th>
            <th className="text-left px-4 py-3">Target</th>
            <th className="text-left px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-white/5 hover:bg-white/3 transition">
              <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fmtDate(l.created_at)}</td>
              <td className="px-4 py-3 text-white/80">{l.actor_email}</td>
              <td className={`px-4 py-3 font-semibold ${ACTION_COLORS[l.action] ?? 'text-white'}`}>{l.action.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 text-white/60">{l.target_type}</td>
              <td className="px-4 py-3 text-white/50 text-xs max-w-xs truncate">{l.details || '—'}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-white/40 text-sm">No audit entries yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Pending Transfers tab ────────────────────────────────── */
function PendingTransfersTab() {
  const [txs, setTxs] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');

  const refresh = () => {
    api.get('/admin/pending-transfers').then((r) => setTxs(r.data)).catch(() => {});
  };
  useEffect(() => { refresh(); }, []);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/pending-transfers/${id}/approve`);
      setMsg('Transfer approved and funds deducted.');
      refresh();
    } catch (e) {
      setMsg(e.response?.data?.detail || 'Approval failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/admin/pending-transfers/${id}/reject`);
      setMsg('Transfer rejected.');
      refresh();
    } catch (e) {
      setMsg(e.response?.data?.detail || 'Rejection failed.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      {msg && <Alert msg={msg} type={msg.includes('approved') ? 'success' : 'error'} />}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest"><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Account</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Description</th><th className="text-left px-4 py-3">Date</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-4 py-3 text-white/80">{t.user?.full_name}<br/><span className="text-white/40 text-xs">{t.user?.email}</span></td>
                <td className="px-4 py-3 text-white/60 text-xs">{t.sender_account?.account_type}<br/>{t.sender_account?.account_number}</td>
                <td className="px-4 py-3 text-[#8fdb46] font-semibold">{fmt(t.amount)}</td>
                <td className="px-4 py-3 text-white/60 text-xs max-w-xs truncate">{t.description}</td>
                <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{fmtDate(t.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => handleApprove(t.id)} disabled={busyId === t.id} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50">{busyId === t.id ? '…' : 'Approve'}</button>
                    <button onClick={() => handleReject(t.id)} disabled={busyId === t.id} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50">{busyId === t.id ? '…' : 'Reject'}</button>
                  </div>
                </td>
              </tr>
            ))}
            {txs.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-white/40 text-sm">No pending external transfers.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Loans tab ──────────────────────────────────────────────── */
function LoansTab() {
  const [loans, setLoans] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => { api.get('/admin/loans', { params: status ? { status } : {} }).then((r) => setLoans(r.data)).catch(() => {}); }, [status]);
  const updateStatus = async (id, newStatus, rate) => {
    await api.patch(`/admin/loans/${id}`, null, { params: { status: newStatus, rate } });
    api.get('/admin/loans', { params: status ? { status } : {} }).then((r) => setLoans(r.data)).catch(() => {});
  };
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['','PENDING','APPROVED','REJECTED','DISBURSED'].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`text-xs px-3 py-1 rounded-full border ${status === s ? 'bg-[#8fdb46] text-bank-dark border-[#8fdb46]' : 'border-white/20 text-white/60 hover:text-white'}`}>{s || 'All'}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest"><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Term</th><th className="text-left px-4 py-3">Rate</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-4 py-3 text-white/80">{l.loan_type}</td>
                <td className="px-4 py-3 text-[#8fdb46]">{fmt(l.amount)}</td>
                <td className="px-4 py-3 text-white/60">{l.term_months} mo</td>
                <td className="px-4 py-3 text-white/60">{l.rate ? `${l.rate}%` : '—'}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${l.status === 'APPROVED' || l.status === 'DISBURSED' ? 'bg-emerald-500/20 text-emerald-300' : l.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{l.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {l.status === 'PENDING' && (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => updateStatus(l.id, 'APPROVED', l.rate)} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">Approve</button>
                      <button onClick={() => updateStatus(l.id, 'REJECTED')} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {loans.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-white/40 text-sm">No loans found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Disputes tab ─────────────────────────────────────────── */
function DisputesTab() {
  const [disputes, setDisputes] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => { api.get('/admin/disputes', { params: status ? { status } : {} }).then((r) => setDisputes(r.data)).catch(() => {}); }, [status]);
  const updateStatus = async (id, newStatus) => {
    await api.patch(`/admin/disputes/${id}`, null, { params: { status: newStatus } });
    api.get('/admin/disputes', { params: status ? { status } : {} }).then((r) => setDisputes(r.data)).catch(() => {});
  };
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {['','OPEN','REVIEWING','RESOLVED','REJECTED'].map((s) => (
          <button key={s || 'all'} onClick={() => setStatus(s)} className={`text-xs px-3 py-1 rounded-full border ${status === s ? 'bg-[#8fdb46] text-bank-dark border-[#8fdb46]' : 'border-white/20 text-white/60 hover:text-white'}`}>{s || 'All'}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest"><th className="text-left px-4 py-3">ID</th><th className="text-left px-4 py-3">Reason</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-4 py-3 text-white/60 font-mono text-xs">{d.id.slice(0,8)}</td>
                <td className="px-4 py-3 text-white/80 max-w-xs truncate">{d.reason}</td>
                <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${d.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : d.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{d.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {d.status === 'OPEN' && (
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => updateStatus(d.id, 'RESOLVED')} className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">Resolve</button>
                      <button onClick={() => updateStatus(d.id, 'REJECTED')} className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {disputes.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-white/40 text-sm">No disputes found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Wires tab ────────────────────────────────────────────── */
function WiresTab() {
  const [wires, setWires] = useState([]);
  useEffect(() => { api.get('/admin/wire-transfers').then((r) => setWires(r.data)).catch(() => {}); }, []);
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest"><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Recipient</th><th className="text-left px-4 py-3">Bank</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Date</th></tr></thead>
        <tbody>
          {wires.map((w) => (
            <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition">
              <td className="px-4 py-3 text-[#8fdb46]">{fmt(w.amount)}</td>
              <td className="px-4 py-3 text-white/80">{w.recipient_name}</td>
              <td className="px-4 py-3 text-white/60">{w.recipient_bank}</td>
              <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{w.status}</span></td>
              <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{fmtDate(w.created_at)}</td>
            </tr>
          ))}
          {wires.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-white/40 text-sm">No wire transfers found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Cards tab ──────────────────────────────────────────────── */
function CardsTab() {
  const [cards, setCards] = useState([]);
  useEffect(() => { api.get('/admin/cards').then((r) => setCards(r.data)).catch(() => {}); }, []);
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-widest"><th className="text-left px-4 py-3">Last 4</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Limit</th><th className="text-left px-4 py-3">Expires</th><th className="text-left px-4 py-3">Date</th></tr></thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition">
              <td className="px-4 py-3 text-white/80 font-mono">•••• {c.last4}</td>
              <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{c.status}</span></td>
              <td className="px-4 py-3 text-white/60">{fmt(c.daily_limit)}</td>
              <td className="px-4 py-3 text-white/60">{String(c.expiry_month).padStart(2,'0')}/{c.expiry_year}</td>
              <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">{fmtDate(c.created_at)}</td>
            </tr>
          ))}
          {cards.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-white/40 text-sm">No cards found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main shell ───────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('Overview');

  const tabContent = {
    Overview: <OverviewTab />,
    Users: <UsersTab />,
    'Pending Transfers': <PendingTransfersTab />,
    Loans: <LoansTab />,
    Disputes: <DisputesTab />,
    Wires: <WiresTab />,
    Cards: <CardsTab />,
    'Balance Tools': <BalanceTool />,
    'Audit Log': <AuditLogTab />,
  };

  return (
    <div className="min-h-screen bg-[#041f1e] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#052c2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8fdb46] border border-[#8fdb46]/40 px-2 py-0.5 rounded">
              ADMIN
            </span>
            <span className="font-semibold text-white">Hunch Console</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/50 hidden sm:block">{user?.full_name}</span>
            <button onClick={logout}
              className="text-white/60 hover:text-red-400 transition text-xs border border-white/20 px-3 py-1 rounded-full">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Title row */}
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.26em] text-white/50">Admin Console</p>
          <h1 className="text-3xl font-bold mt-1">Welcome, {user?.full_name || 'Administrator'}</h1>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 rounded-xl bg-white/5 border border-white/10 p-1 mb-7 w-fit flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? 'bg-[#8fdb46] text-bank-dark shadow' : 'text-white/60 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tabContent[tab]}
      </div>
    </div>
  );
}

