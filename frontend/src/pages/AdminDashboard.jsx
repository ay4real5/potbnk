import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [creditForm, setCreditForm] = useState({
    userEmail: '',
    accountType: 'CHECKING',
    amount: '',
    description: 'Manual admin credit',
  });
  const [submitting, setSubmitting] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [creditSuccess, setCreditSuccess] = useState('');

  const cards = useMemo(
    () => [
      {
        title: 'Customer Accounts',
        value: 'View / search / lock',
        desc: 'Review profile status, KYC completion, and risky sessions.',
      },
      {
        title: 'Fraud Queue',
        value: 'High priority',
        desc: 'Flag unusual transfer patterns and enforce step-up verification.',
      },
      {
        title: 'Audit Log',
        value: 'Immutable trail',
        desc: 'Track who changed what and when across auth and transactions.',
      },
      {
        title: 'Support Overrides',
        value: 'Controlled actions',
        desc: 'Reset 2FA, unlock sessions, and issue temporary access links.',
      },
    ],
    []
  );

  const setField = (field) => (e) => {
    setCreditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    setCreditError('');
    setCreditSuccess('');
    setSubmitting(true);
    try {
      const amountVal = Number(creditForm.amount);
      if (!creditForm.userEmail.trim()) {
        setCreditError('User email is required.');
        return;
      }
      if (!amountVal || amountVal <= 0) {
        setCreditError('Amount must be greater than zero.');
        return;
      }

      const payload = {
        user_email: creditForm.userEmail.trim().toLowerCase(),
        account_type: creditForm.accountType,
        amount: amountVal,
        description: creditForm.description.trim() || 'Manual admin credit',
      };
      const { data } = await api.post('/admin/credit', payload);
      setCreditSuccess(
        `Credited $${amountVal.toFixed(2)} to ${data.account_type} (${data.account_number}). New balance: $${Number(data.new_balance).toFixed(2)}.`
      );
      setCreditForm((prev) => ({ ...prev, amount: '' }));
    } catch (err) {
      setCreditError(err.response?.data?.detail || 'Credit action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041f1e] text-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">Admin Console</p>
        <h1 className="text-3xl font-bold mt-2">Welcome, {user?.full_name || 'Administrator'}</h1>
        <p className="text-white/70 mt-3 max-w-2xl text-sm leading-relaxed">
          This is your operations surface for platform trust, user controls, and incident response.
          Keep all sensitive actions behind approvals and audit logging.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {cards.map((card) => (
            <section key={card.title} className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8fdb46]">{card.title}</p>
              <h2 className="text-xl font-semibold mt-2">{card.value}</h2>
              <p className="text-white/65 text-sm mt-2">{card.desc}</p>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8fdb46]">Manual Balance Adjustment</p>
          <h2 className="text-xl font-semibold mt-2">Credit User Account by Type</h2>
          <p className="text-white/65 text-sm mt-2">
            Use this for approved adjustments. Every credit is logged in admin audit trails.
          </p>

          {creditError && (
            <div className="mt-4 rounded-lg border border-red-300/30 bg-red-500/10 text-red-100 text-sm px-3 py-2">
              {creditError}
            </div>
          )}
          {creditSuccess && (
            <div className="mt-4 rounded-lg border border-emerald-300/30 bg-emerald-500/10 text-emerald-100 text-sm px-3 py-2">
              {creditSuccess}
            </div>
          )}

          <form onSubmit={handleCredit} className="mt-5 grid md:grid-cols-2 gap-3">
            <input
              type="email"
              value={creditForm.userEmail}
              onChange={setField('userEmail')}
              placeholder="User email"
              className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
              required
            />

            <select
              value={creditForm.accountType}
              onChange={setField('accountType')}
              className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8fdb46]"
            >
              <option value="CHECKING">CHECKING</option>
              <option value="SAVINGS">SAVINGS</option>
            </select>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={creditForm.amount}
              onChange={setField('amount')}
              placeholder="Amount"
              className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
              required
            />

            <input
              type="text"
              value={creditForm.description}
              onChange={setField('description')}
              placeholder="Description"
              className="rounded-lg border border-white/20 bg-black/20 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#8fdb46]"
            />

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 mt-1 rounded-full bg-[#8fdb46] text-bank-dark font-bold py-2.5 px-5 hover:brightness-105 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Applying credit…' : 'Credit Account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
