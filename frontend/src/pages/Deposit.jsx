import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { Info, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Deposit() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Deposit' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, account_id: data[0].id }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/accounts/deposit', {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success(data.message || 'Deposit successful.');
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setForm((f) => ({ ...f, amount: '', description: 'Deposit' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.account_id);

  return (
    <BankShell title="Deposit">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-bank-dark mb-1">Deposit Funds</h2>
              <p className="text-gray-500 text-sm">Add money to your Hunch account.</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col gap-5 shadow-sm"
            >
          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">Account</label>
            <select
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              className="hnt-input"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_type} · {a.account_number} — $
                  {parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <div className="bg-bank-surface border border-gray-200 rounded-lg px-4 py-3 text-sm text-bank-dark">
              Current balance:{' '}
              <span className="font-bold">
                ${parseFloat(selectedAccount.balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none">$</span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="hnt-input pl-8"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="hnt-input"
              placeholder="e.g. Paycheck, Cash deposit"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.account_id || !form.amount}
            className="mt-1 w-full bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing…' : 'Deposit Funds'}
          </button>
        </form>
          </div>

          {/* Info sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-bank-accent" />
                <h3 className="font-bold text-bank-dark text-sm">Deposit Information</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Deposits are credited immediately to your account.</li>
                <li>There is no minimum deposit amount.</li>
                <li>Deposits over $10,000 may require additional documentation.</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-bank-accent" />
                <h3 className="font-bold text-bank-dark text-sm">FDIC Insured</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your deposits are protected up to $250,000 per depositor by the Federal Deposit Insurance Corporation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  );
}
