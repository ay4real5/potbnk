import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { CheckCircle } from 'lucide-react';

export default function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: 'Withdrawal' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, account_id: data[0].id }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/accounts/withdraw', {
        ...form,
        amount: parseFloat(form.amount),
      });
      setSuccess(data.message || 'Withdrawal successful.');
      // Refresh balances
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      setForm((f) => ({ ...f, amount: '', description: 'Withdrawal' }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.account_id);

  return (
    <div className="min-h-screen bg-bank-dark text-white">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-1">Withdraw funds</h1>
        <p className="text-slate-400 text-sm mb-8">Withdraw from your Hunch account.</p>

        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3 mb-5">
            <CheckCircle size={18} /> {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-sm text-slate-300 mb-1">Account</label>
            <select
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-bank-accent transition-colors"
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
            <div className="bg-slate-800/60 rounded-lg px-4 py-3 text-sm text-slate-300">
              Available:{' '}
              <span className="font-semibold text-white">
                ${parseFloat(selectedAccount.balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1">Amount (USD)</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              max={selectedAccount ? parseFloat(selectedAccount.balance) : undefined}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-bank-accent transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-bank-accent transition-colors"
              placeholder="Optional memo"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? 'Processing…' : 'Withdraw'}
          </button>
        </form>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors"
        >
          Back to dashboard
        </button>
      </main>
    </div>
  );
}
