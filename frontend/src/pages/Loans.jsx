import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { useToast } from '../context/ToastContext';
import { DollarSign, FileText, TrendingUp, Clock, CheckCircle, X, Plus, Calculator } from 'lucide-react';

const LOAN_TYPES = [
  { value: 'PERSONAL', label: 'Personal Loan', rate: '5.99%', min: 1000, max: 50000 },
  { value: 'AUTO', label: 'Auto Loan', rate: '4.49%', min: 5000, max: 80000 },
  { value: 'HOME', label: 'Home Loan', rate: '6.49%', min: 50000, max: 500000 },
  { value: 'STUDENT', label: 'Student Loan', rate: '3.99%', min: 1000, max: 100000 },
];

function formatMoney(n) {
  return Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateMonthlyPayment(principal, annualRate, months) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function Loans() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ loan_type: 'PERSONAL', amount: '', term_months: 36, purpose: '', annual_income: '' });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = () => {
    setLoading(true);
    api.get('/loans/').then(({ data }) => setApplications(data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    const amount = Number(form.amount);
    if (amount > 0) {
      const type = LOAN_TYPES.find((t) => t.value === form.loan_type);
      const rate = parseFloat(type?.rate || '5.99');
      const monthly = calculateMonthlyPayment(amount, rate, form.term_months);
      const total = monthly * form.term_months;
      setPreview({ rate, monthly, total });
    } else {
      setPreview(null);
    }
  }, [form.amount, form.loan_type, form.term_months]);

  const handleSubmit = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Enter a valid loan amount.'); return; }
    try {
      await api.post('/loans/', {
        loan_type: form.loan_type,
        amount: Number(form.amount),
        term_months: Number(form.term_months),
        purpose: form.purpose,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
      });
      toast.success('Loan application submitted.');
      setShowForm(false);
      setForm({ loan_type: 'PERSONAL', amount: '', term_months: 36, purpose: '', annual_income: '' });
      loadLoans();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Application failed.');
    }
  };

  const statusColor = (s) => {
    if (s === 'APPROVED' || s === 'DISBURSED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'REJECTED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };

  return (
    <BankShell title="Loans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lending Center</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Apply for loans and track applications</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Apply for Loan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {LOAN_TYPES.map((t) => (
            <div key={t.value} className="rounded-2xl bg-white dark:bg-[#111a18] border border-slate-100 dark:border-white/10 p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.label}</p>
              <p className="text-2xl font-bold text-[#063b36] dark:text-[#7CFC00] mt-1">{t.rate}</p>
              <p className="text-xs text-slate-400 mt-0.5">${t.min.toLocaleString()}–${t.max.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No applications yet</p>
            <p className="text-sm text-slate-400 mt-1">Apply for a personal, auto, home, or student loan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#063b36]/10 dark:bg-[#7CFC00]/10 flex items-center justify-center shrink-0">
                    <DollarSign size={18} className="text-[#063b36] dark:text-[#7CFC00]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{app.loan_type.replace(/_/g, ' ')} Loan</p>
                    <p className="text-xs text-slate-400 truncate">${formatMoney(app.amount)} · {app.term_months} months · Rate: {app.rate ? `${app.rate}%` : 'Pending'}</p>
                    {app.purpose && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{app.purpose}</p>}
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${statusColor(app.status)}`}>{app.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18] max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Loan Application</h3>
            <div className="mt-4 space-y-3">
              <select value={form.loan_type} onChange={(e) => setForm((f) => ({ ...f, loan_type: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {LOAN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label} — from {t.rate}</option>)}
              </select>
              <input type="number" min="1" step="1" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder={`Amount ($${LOAN_TYPES.find((t) => t.value === form.loan_type)?.min.toLocaleString()}–$${LOAN_TYPES.find((t) => t.value === form.loan_type)?.max.toLocaleString()})`} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <select value={form.term_months} onChange={(e) => setForm((f) => ({ ...f, term_months: Number(e.target.value) }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {[12,24,36,48,60,120,180,240,360].map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
              <input value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="Purpose (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
              <input type="number" value={form.annual_income} onChange={(e) => setForm((f) => ({ ...f, annual_income: e.target.value }))} placeholder="Annual income (optional)" className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />

              {preview && (
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 space-y-2">
                  <p className="text-xs text-slate-400">Estimated payment</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-white/60">Monthly</span>
                    <span className="font-bold text-slate-900 dark:text-white">${formatMoney(preview.monthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-white/60">Total repayment</span>
                    <span className="font-bold text-slate-900 dark:text-white">${formatMoney(preview.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-white/60">APR</span>
                    <span className="font-bold text-[#063b36]">{preview.rate}%</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleSubmit} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
