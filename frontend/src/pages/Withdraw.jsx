import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Withdrawal' });
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
      const { data } = await api.post('/accounts/withdraw', {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success(data.message || 'Withdrawal successful.');
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setForm((f) => ({ ...f, amount: '', description: 'Withdrawal' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.account_id);

  return (
    <BankShell title="Withdraw">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-bank-dark mb-1">Withdraw Funds</h2>
              <p className="text-gray-500 text-sm">Withdraw from your Hunch account.</p>
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
              Available:{' '}
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
                max={selectedAccount ? parseFloat(selectedAccount.balance) : undefined}
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
              placeholder="Optional memo"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hnt-btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            {loading ? 'Processing…' : 'Withdraw Funds'}
          </button>
        </form>
          </div>

          {/* Info sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-bank-accent" />
                <h3 className="font-bold text-bank-dark text-sm">Withdrawal Information</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>Funds are available immediately after withdrawal.</li>
                <li>You cannot withdraw more than your available balance.</li>
                <li>Large withdrawals may require identity verification.</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={15} className="text-amber-600" />
                <h3 className="font-bold text-amber-800 text-sm">Reminder</h3>
              </div>
              <p className="text-sm text-amber-700">
                Ensure sufficient funds remain to cover any pending transactions or minimum balance requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  );
}
