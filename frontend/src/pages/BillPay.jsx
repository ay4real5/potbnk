import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Receipt, Zap, Calendar, CheckCircle, Landmark } from 'lucide-react';

const BILL_CATEGORIES = ['Utilities', 'Credit Card', 'Rent / Mortgage', 'Insurance', 'Phone / Internet', 'Subscription', 'Other'];

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BillPay() {
  const toast = useToast();
  const [billers, setBillers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBiller, setShowBiller] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [payForm, setPayForm] = useState({ biller_id: '', account_id: '', amount: '' });
  const [newBiller, setNewBiller] = useState({ name: '', category: 'Utilities', account_number: '', nickname: '' });

  useEffect(() => {
    loadData();
    api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/billers/').then(({ data }) => setBillers(data)).catch(() => {}),
      api.get('/billers/payments').then(({ data }) => setPayments(data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  const handleAddBiller = async () => {
    if (!newBiller.name.trim()) { toast.error('Biller name is required.'); return; }
    try {
      await api.post('/billers/', newBiller);
      toast.success('Biller added.');
      setShowBiller(false);
      setNewBiller({ name: '', category: 'Utilities', account_number: '', nickname: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add biller.');
    }
  };

  const handlePay = async () => {
    if (!payForm.biller_id || !payForm.account_id || !payForm.amount || Number(payForm.amount) <= 0) {
      toast.error('Complete all payment details.'); return;
    }
    try {
      await api.post('/billers/payments', {
        biller_id: payForm.biller_id,
        account_id: payForm.account_id,
        amount: Number(payForm.amount),
      });
      toast.success('Payment sent.');
      setShowPay(false);
      setPayForm({ biller_id: '', account_id: '', amount: '' });
      loadData();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed.');
    }
  };

  const handleDeleteBiller = async (id) => {
    if (!confirm('Remove this biller?')) return;
    try { await api.delete(`/billers/${id}`); toast.success('Biller removed.'); loadData(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to remove.'); }
  };

  return (
    <BankShell title="Bill Pay">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bill Pay</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Pay bills quickly and securely</p>
          </div>
          <button onClick={() => setShowBiller(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Add Biller
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Your Billers</h3>
              {billers.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt size={36} className="text-slate-200 dark:text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No billers yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {billers.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{b.nickname || b.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{b.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => { setSelectedBiller(b); setPayForm({ biller_id: b.id, account_id: accounts[0]?.id || '', amount: '' }); setShowPay(true); }} className="text-xs font-semibold text-bank-teal hover:underline">Pay</button>
                        <button onClick={() => handleDeleteBiller(b.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Payment History</h3>
              {payments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No payments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {payments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                          <CheckCircle size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-white/70">{billers.find((b) => b.id === p.biller_id)?.name || 'Biller'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">-${formatMoney(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Quick Pay</p>
              <p className="text-sm text-white/70 mt-2">Select a biller to make a payment instantly from any of your accounts.</p>
              <button onClick={() => { if (billers.length === 0) { toast.error('Add a biller first.'); return; } setSelectedBiller(billers[0]); setPayForm({ biller_id: billers[0].id, account_id: accounts[0]?.id || '', amount: '' }); setShowPay(true); }} className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">Pay a bill now</button>
            </section>
          </aside>
        </div>
      </div>

      {showBiller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Add Biller</h3>
            <div className="mt-4 space-y-3">
              <input value={newBiller.name} onChange={(e) => setNewBiller((b) => ({ ...b, name: e.target.value }))} placeholder="Biller name (e.g., City Electric)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <select value={newBiller.category} onChange={(e) => setNewBiller((b) => ({ ...b, category: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {BILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input value={newBiller.account_number} onChange={(e) => setNewBiller((b) => ({ ...b, account_number: e.target.value }))} placeholder="Account number (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={newBiller.nickname} onChange={(e) => setNewBiller((b) => ({ ...b, nickname: e.target.value }))} placeholder="Nickname (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowBiller(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleAddBiller} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Add Biller</button>
            </div>
          </div>
        </div>
      )}

      {showPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Pay Bill</h3>
            <p className="text-sm text-slate-400 mt-1">{billers.find((b) => b.id === payForm.biller_id)?.name}</p>
            <div className="mt-4 space-y-3">
              <select value={payForm.account_id} onChange={(e) => setPayForm((f) => ({ ...f, account_id: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                <option value="">Select account</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              <input type="number" min="0.01" step="0.01" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Amount" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowPay(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handlePay} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Send Payment</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
