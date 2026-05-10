import { useEffect, useState } from 'react';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { FileText, Download, Plus, Calendar, X } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Statements() {
  const [statements, setStatements] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ account_id: '', month: new Date().getMonth(), year: new Date().getFullYear() });

  useEffect(() => {
    loadStatements();
    api.get('/accounts/').then(({ data }) => { setAccounts(data); if (data[0]) setGenForm((f) => ({ ...f, account_id: data[0].id })); }).catch(() => {});
  }, []);

  const loadStatements = () => {
    setLoading(true);
    api.get('/statements/').then(({ data }) => setStatements(data)).catch(() => {}).finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    try {
      await api.post('/statements/', null, { params: { account_id: genForm.account_id, month: genForm.month + 1, year: genForm.year } });
      setShowGenerate(false);
      loadStatements();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate statement.');
    }
  };

  return (
    <BankShell title="Statements">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Statements & Documents</h1>
            <p className="text-sm text-slate-500 dark:text-white/50">Download monthly account statements</p>
          </div>
          <button onClick={() => setShowGenerate(true)} className="bg-[#063b36] text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors text-sm flex items-center gap-2">
            <Plus size={16} /> Generate
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : statements.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-slate-200 dark:text-white/10 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-white/50 font-medium">No statements yet</p>
            <p className="text-sm text-slate-400 mt-1">Generate your first monthly statement.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statements.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/10 bg-white dark:bg-[#111a18] p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <FileText size={18} className="text-slate-600 dark:text-white/60" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{MONTHS[s.month - 1]} {s.year}</p>
                    <p className="text-xs text-slate-400">{accounts.find((a) => a.id === s.account_id)?.account_type.replace(/_/g, ' ') || 'Account'} ••••{accounts.find((a) => a.id === s.account_id)?.account_number?.slice(-4) || ''}</p>
                  </div>
                </div>
                <button onClick={() => alert('In production, this would download the PDF statement.')} className="flex items-center gap-1.5 text-xs font-semibold text-bank-teal hover:underline">
                  <Download size={14} /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Generate Statement</h3>
            <div className="mt-4 space-y-3">
              <select value={genForm.account_id} onChange={(e) => setGenForm((f) => ({ ...f, account_id: e.target.value }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)}</option>)}
              </select>
              <select value={genForm.month} onChange={(e) => setGenForm((f) => ({ ...f, month: Number(e.target.value) }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <input type="number" value={genForm.year} onChange={(e) => setGenForm((f) => ({ ...f, year: Number(e.target.value) }))} className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setShowGenerate(false)} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Cancel</button>
              <button onClick={handleGenerate} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Generate</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
