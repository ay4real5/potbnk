import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { Globe, Send, Clock, CheckCircle, AlertTriangle, ArrowRight, Plus } from 'lucide-react';

const WIRE_FEE = 25;

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function WireTransfers() {
  const toast = useToast();
  const [wires, setWires] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    sender_account_id: '', amount: '', recipient_name: '', recipient_bank: '', recipient_account_number: '', swift_code: '', reference: '',
  });

  useEffect(() => {
    loadWires();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setForm((f) => ({ ...f, sender_account_id: data[0].id })); }).catch(() => {});
  }, []);

  const loadWires = () => {
    setLoading(true);
    api.get('/wire-transfers/').then(({ data }) => setWires(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!form.sender_account_id || !form.amount || Number(form.amount) <= 0 || !form.recipient_name || !form.recipient_bank || !form.recipient_account_number) {
      toast.error('Complete all required fields.'); return;
    }
    try {
      await api.post('/wire-transfers/', {
        sender_account_id: form.sender_account_id,
        amount: Number(form.amount),
        recipient_name: form.recipient_name,
        recipient_bank: form.recipient_bank,
        recipient_account_number: form.recipient_account_number,
        swift_code: form.swift_code || undefined,
        reference: form.reference || undefined,
      });
      toast.success('Wire transfer sent.');
      setShowForm(false);
      setForm({ sender_account_id: accounts[0]?.id || '', amount: '', recipient_name: '', recipient_bank: '', recipient_account_number: '', swift_code: '', reference: '' });
      loadWires();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Wire transfer failed.');
    }
  };

  const selectedAccount = accounts.find((a) => a.id === form.sender_account_id);

  return (
    <BankShell title="Wire Transfers">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wire Transfers</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Send large amounts securely worldwide</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Send Wire
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Wire Transfer Policy</p>
              <p className="text-xs text-slate-400 mt-0.5">Minimum ${WIRE_FEE * 4}. Fee: ${WIRE_FEE}. Maximum $100,000. Domestic wires typically settle same-day; international may take 1-3 business days.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : wires.length === 0 ? (
          <div className="text-center py-20">
            <Globe size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No wire transfers yet</p>
            <p className="text-sm text-slate-400 mt-1">Send your first domestic or international wire.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wires.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${w.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                    {w.status === 'COMPLETED' ? <CheckCircle size={18} className="text-emerald-600" /> : <Clock size={18} className="text-amber-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">${formatMoney(w.amount)} to {w.recipient_name}</p>
                    <p className="text-xs text-slate-400 truncate">{w.recipient_bank} · Fee: ${formatMoney(w.fee)}</p>
                    {w.reference && <p className="text-[10px] text-slate-400 mt-0.5 truncate">Ref: {w.reference}</p>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{w.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18] max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Send Wire</h3>
            <div className="mt-4 space-y-3">
              <select value={form.sender_account_id} onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              <input type="number" min="100" step="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Amount (min $100)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.recipient_name} onChange={(e) => setForm((f) => ({ ...f, recipient_name: e.target.value }))} placeholder="Recipient full name" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.recipient_bank} onChange={(e) => setForm((f) => ({ ...f, recipient_bank: e.target.value }))} placeholder="Recipient bank name" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.recipient_account_number} onChange={(e) => setForm((f) => ({ ...f, recipient_account_number: e.target.value }))} placeholder="Account number" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.swift_code} onChange={(e) => setForm((f) => ({ ...f, swift_code: e.target.value }))} placeholder="SWIFT/BIC (optional, for international)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} placeholder="Reference / memo (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />

              {selectedAccount && form.amount && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-bold">${formatMoney(Number(form.amount))}</span></div>
                  <div className="flex justify-between mt-1"><span className="text-slate-500">Fee</span><span className="font-bold">${formatMoney(WIRE_FEE)}</span></div>
                  <div className="flex justify-between mt-1 border-t border-slate-100 dark:border-white/10 pt-1"><span className="text-slate-700 dark:text-white/70 font-semibold">Total debit</span><span className="font-bold text-[#063b36]">${formatMoney(Number(form.amount) + WIRE_FEE)}</span></div>
                  <p className="text-[10px] text-slate-400 mt-1">From {selectedAccount.account_type.replace(/_/g, ' ')} ••••{selectedAccount.account_number.slice(-4)}</p>
                </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleSubmit} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Send Wire</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
