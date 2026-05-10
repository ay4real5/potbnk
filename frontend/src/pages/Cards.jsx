import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { Plus, CreditCard, Lock, Unlock, Trash2, ShieldCheck, Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Cards() {
  const toast = useToast();
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [editingCard, setEditingCard] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  useEffect(() => {
    loadCards();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setNewAccountId(data[0].id); }).catch(() => {});
  }, []);

  const loadCards = () => {
    setLoading(true);
    api.get('/cards/').then(({ data }) => setCards(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newAccountId) { toast.error('Select an account.'); return; }
    try {
      await api.post('/cards/', null, { params: { account_id: newAccountId } });
      toast.success('Card issued.');
      setShowCreate(false);
      loadCards();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to issue card.');
    }
  };

  const toggleStatus = async (card, nextStatus) => {
    try {
      await api.patch(`/cards/${card.id}`, { status: nextStatus });
      toast.success(`Card ${nextStatus.toLowerCase()}.`);
      loadCards();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update card.');
    }
  };

  const handleUpdateLimit = async () => {
    if (!editingCard || !editLimit || Number(editLimit) <= 0) return;
    try {
      await api.patch(`/cards/${editingCard.id}`, { daily_limit: Number(editLimit) });
      toast.success('Daily limit updated.');
      setEditingCard(null);
      setEditLimit('');
      loadCards();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update limit.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this card?')) return;
    try { await api.delete(`/cards/${id}`); toast.success('Card deleted.'); loadCards(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to delete card.'); }
  };

  return (
    <BankShell title="Cards">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Card Management</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Lock, unlock, and manage your cards</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Issue Card
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2].map((i) => <div key={i} className="h-56 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No cards yet</p>
            <p className="text-sm text-slate-400 mt-1">Issue a virtual debit card linked to any account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((c) => (
              <div key={c.id} className="relative rounded-2xl bg-gradient-to-br from-[#063b36] to-[#041f1c] p-6 text-white shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-bold tracking-widest uppercase text-white/50">Hunch Banking</span>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{c.status}</div>
                  </div>
                  <p className="text-2xl font-mono tracking-widest mb-6">•••• •••• •••• {c.last4}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Expires</p>
                      <p className="text-sm font-mono">{String(c.expiry_month).padStart(2, '0')}/{String(c.expiry_year).slice(-2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">Daily Limit</p>
                      <p className="text-sm font-semibold">${formatMoney(c.daily_limit)}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    {c.status === 'ACTIVE' ? (
                      <button onClick={() => toggleStatus(c, 'FROZEN')} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5"><Lock size={13} /> Freeze</button>
                    ) : (
                      <button onClick={() => toggleStatus(c, 'ACTIVE')} className="flex-1 rounded-lg bg-emerald-500/20 text-emerald-300 py-2 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1.5"><Unlock size={13} /> Unfreeze</button>
                    )}
                    <button onClick={() => { setEditingCard(c); setEditLimit(String(c.daily_limit)); }} className="rounded-lg bg-white/10 p-2 hover:bg-white/20 transition-colors"><SlidersHorizontal size={13} /></button>
                    <button onClick={() => handleDelete(c.id)} className="rounded-lg bg-white/10 p-2 hover:bg-red-500/20 hover:text-red-300 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Issue Virtual Card</h3>
            <p className="text-sm text-slate-400 mt-1">Link to an existing account.</p>
            <select value={newAccountId} onChange={(e) => setNewAccountId(e.target.value)} className="mt-4 w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)}</option>)}
            </select>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleCreate} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Issue</button>
            </div>
          </div>
        </div>
      )}

      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Edit Daily Limit</h3>
            <input type="number" min="1" step="1" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} className="mt-4 w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => { setEditingCard(null); setEditLimit(''); }} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleUpdateLimit} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Save</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
