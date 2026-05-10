import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { Plus, Target, Trash2, PiggyBank, ArrowUpRight, X, CheckCircle, TrendingUp } from 'lucide-react';

const GOAL_COLORS = [
  { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  { bg: 'bg-sky-500', text: 'text-sky-600', light: 'bg-sky-50' },
  { bg: 'bg-violet-500', text: 'text-violet-600', light: 'bg-violet-50' },
  { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
];

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Goals() {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', icon: 'Target', color: 0 });
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    loadGoals();
    api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
  }, []);

  const loadGoals = () => {
    setLoading(true);
    api.get('/goals/')
      .then(({ data }) => setGoals(data))
      .catch(() => toast.error('Failed to load goals.'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newGoal.name.trim() || !newGoal.target_amount || Number(newGoal.target_amount) <= 0) {
      toast.error('Enter a goal name and target amount.');
      return;
    }
    try {
      await api.post('/goals/', {
        name: newGoal.name.trim(),
        target_amount: Number(newGoal.target_amount),
        icon: newGoal.icon,
        color: String(newGoal.color),
      });
      toast.success('Goal created.');
      setShowCreate(false);
      setNewGoal({ name: '', target_amount: '', icon: 'Target', color: 0 });
      loadGoals();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create goal.');
    }
  };

  const handleContribute = async (goalId) => {
    const amt = prompt('Amount to contribute:');
    if (!amt || Number(amt) <= 0) return;
    try {
      await api.post(`/goals/${goalId}/contribute`, null, { params: { amount: Number(amt) } });
      toast.success('Contribution added.');
      loadGoals();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Contribution failed.');
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm('Delete this goal? Any remaining funds will return to your account.')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      toast.success('Goal deleted.');
      loadGoals();
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete goal.');
    }
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  return (
    <BankShell title="Goals">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Savings Goals</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Build toward what matters</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Saved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">${formatMoney(totalSaved)}</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Target</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">${formatMoney(totalTarget)}</p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</p>
            <p className="text-2xl font-bold text-sky-600 mt-1">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-48 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20">
            <PiggyBank size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No goals yet</p>
            <p className="text-sm text-slate-400 mt-1">Create a goal to start saving automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
              const theme = GOAL_COLORS[Number(g.color || 0) % GOAL_COLORS.length];
              return (
                <div key={g.id} className="rounded-2xl bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 p-5 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${theme.light} flex items-center justify-center`}>
                      <Target size={18} className={theme.text} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleContribute(g.id)} className="text-xs font-semibold text-bank-teal hover:underline">Contribute</button>
                      <button onClick={() => handleDelete(g.id)} className="ml-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{g.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">${formatMoney(g.current_amount)} of ${formatMoney(g.target_amount)}</p>
                  <div className="mt-4 flex-1">
                    <div className="h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full ${theme.bg} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">{pct}% complete</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">New Savings Goal</h3>
            <div className="mt-4 space-y-3">
              <input value={newGoal.name} onChange={(e) => setNewGoal((g) => ({ ...g, name: e.target.value }))} placeholder="Goal name (e.g., Emergency Fund)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input type="number" min="1" step="0.01" value={newGoal.target_amount} onChange={(e) => setNewGoal((g) => ({ ...g, target_amount: e.target.value }))} placeholder="Target amount" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <div className="flex gap-2">
                {GOAL_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setNewGoal((g) => ({ ...g, color: i }))} className={`w-8 h-8 rounded-full ${c.bg} ${newGoal.color === i ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} />
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleCreate} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Create Goal</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
