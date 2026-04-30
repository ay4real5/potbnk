import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { Search, UserCheck, Clock, Info, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    sender_account_id: '',
    receiver_account_id: '',
    amount: '',
    description: 'Transfer',
  });
  // account number input (human-friendly)
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState(null); // { id, account_number, account_type, holder_name }
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);
  const debounceRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, sender_account_id: data[0].id }));
    });
  }, []);

  // Debounced account number lookup
  useEffect(() => {
    const trimmed = recipientInput.trim().toUpperCase();
    setResolvedRecipient(null);
    setLookupError('');
    if (!trimmed) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLooking(true);
      try {
        const { data } = await api.get(`/accounts/lookup?account_number=${encodeURIComponent(trimmed)}`);
        // Prevent sending to own account
        if (accounts.some((a) => a.id === data.id)) {
          setLookupError('You cannot transfer to your own account.');
        } else {
          setResolvedRecipient(data);
          setForm((f) => ({ ...f, receiver_account_id: data.id }));
        }
      } catch (err) {
        setLookupError(err.response?.data?.detail || 'Account not found.');
      } finally {
        setLooking(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [recipientInput, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedRecipient) {
      toast.error('Please enter a valid recipient account number.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/accounts/transfer', {
        ...form,
        amount: parseFloat(form.amount),
      });
      toast.success(data.message || 'Transfer completed.');
      setResolvedRecipient(null);
      setRecipientInput('');
      setForm((f) => ({ ...f, receiver_account_id: '', amount: '', description: 'Transfer' }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSender = accounts.find((a) => a.id === form.sender_account_id);

  return (
    <BankShell title="Transfer Funds">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form column */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-bank-dark mb-1">Transfer Funds</h2>
              <p className="text-gray-500 text-sm">Send money to another Hunch account.</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-xl p-7 flex flex-col gap-5 shadow-sm"
            >
          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">From account</label>
            <select
              value={form.sender_account_id}
              onChange={(e) => setForm({ ...form, sender_account_id: e.target.value })}
              className="hnt-input"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_type} · {a.account_number} — $
                  {parseFloat(a.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
            {selectedSender && (
              <p className="text-xs text-gray-500 mt-1.5">
                Available: <strong className="text-bank-dark">${parseFloat(selectedSender.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">Recipient account number</label>
            <div className="relative">
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                className="hnt-input pr-10"
                placeholder="e.g. PRO-1234567890"
                autoComplete="off"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {looking
                  ? <span className="w-4 h-4 border-2 border-bank-accent border-t-transparent rounded-full animate-spin block" />
                  : <Search size={15} />}
              </span>
            </div>

            {/* Resolved recipient confirmation */}
            {resolvedRecipient && (
              <div className="mt-2 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                <UserCheck size={16} className="text-emerald-600 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-emerald-700">{resolvedRecipient.holder_name}</span>
                  <span className="text-emerald-600"> · {resolvedRecipient.account_type} · {resolvedRecipient.account_number}</span>
                </div>
              </div>
            )}

            {/* Lookup error */}
            {lookupError && (
              <p className="mt-1.5 text-xs text-red-600">{lookupError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bank-dark mb-1.5">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
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
              placeholder="Optional memo"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !resolvedRecipient}
            className="mt-1 w-full bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing…' : 'Send Transfer'}
          </button>
        </form>
      </div>

          {/* Info sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-bank-accent" />
                <h3 className="font-bold text-bank-dark text-sm">Processing Times</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-bank-dark font-semibold w-24 shrink-0">Same day</span>Transfers submitted before 5:00 PM ET</li>
                <li className="flex gap-2"><span className="text-bank-dark font-semibold w-24 shrink-0">Next day</span>Transfers after cut-off or on weekends</li>
                <li className="flex gap-2"><span className="text-bank-dark font-semibold w-24 shrink-0">Holidays</span>Processed next business day</li>
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-bank-accent" />
                <h3 className="font-bold text-bank-dark text-sm">Transfer Limits</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Per transfer</span><span className="font-semibold text-bank-dark">$10,000.00</span></li>
                <li className="flex justify-between"><span>Daily limit</span><span className="font-semibold text-bank-dark">$25,000.00</span></li>
                <li className="flex justify-between"><span>Monthly limit</span><span className="font-semibold text-bank-dark">Unlimited</span></li>
              </ul>
            </div>
            <div className="bg-bank-dark rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={15} className="text-bank-accent" />
                <p className="text-xs font-bold uppercase tracking-widest text-bank-accent">Secure</p>
              </div>
              <p className="text-sm text-white/70">All transfers are encrypted and monitored for unauthorized activity.</p>
            </div>
          </div>
        </div>
      </div>
    </BankShell>
  );
}
