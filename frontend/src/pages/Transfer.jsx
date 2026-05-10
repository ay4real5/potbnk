import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { AlertTriangle, ArrowRight, Building2, CalendarClock, CheckCircle, Clock, CreditCard, Landmark, Repeat, Save, Search, ShieldCheck, Star, Trash2, UserCheck, Users, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QUICK_AMOUNTS = [25, 50, 100, 250, 500, 1000];
const DAILY_LIMIT = 10000;
const STEP_UP_THRESHOLD = 1000;

const TRANSFER_TYPES = {
  between: { label: 'Between my accounts', speed: 'Instant', fee: 0, icon: Repeat, limit: 10000 },
  internal: { label: 'Hunch account', speed: 'Instant', fee: 0, icon: Zap, limit: 10000 },
  external: { label: 'Other bank', speed: '1-3 business days', fee: 0, icon: Landmark, limit: 10000 },
};

const FREQUENCIES = [
  { value: 'ONCE', label: 'One time' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Every 2 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const US_BANKS = [
  'Bank of America',
  'Chase Bank',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'U.S. Bank',
  'PNC Bank',
  'Truist Bank',
  'TD Bank',
  'BMO Bank',
  'Citizens Bank',
  'Fifth Third Bank',
  'KeyBank',
  'Huntington Bank',
  'Regions Bank',
  'M&T Bank',
  'Santander Bank',
  'Comerica Bank',
  'First Citizens Bank',
  'First Horizon Bank',
  'Valley Bank',
  'Webster Bank',
  'Associated Bank',
  'Old National Bank',
  'SouthState Bank',
  'Synovus Bank',
  'Zions Bank',
  'Bank OZK',
  'Cadence Bank',
  'Pinnacle Bank',
  'Frost Bank',
  'Texas Capital Bank',
  'First National Bank',
  'Commerce Bank',
  'Arvest Bank',
  'UMB Bank',
  'Hancock Whitney Bank',
  'Eastern Bank',
  'Flagstar Bank',
  'BankUnited',
  'Popular Bank',
  'Ally Bank',
  'SoFi Bank',
  'Discover Bank',
  'Synchrony Bank',
  'American Express National Bank',
  'Marcus by Goldman Sachs',
  'Charles Schwab Bank',
  'E*TRADE Bank',
  'Fidelity Bank',
  'Vio Bank',
  'Axos Bank',
  'Varo Bank',
  'Chime',
  'Current',
  'Upgrade',
  'LendingClub Bank',
  'Quontic Bank',
  'Navy Federal Credit Union',
  'State Employees Credit Union',
  'PenFed Credit Union',
  'Alliant Credit Union',
  'SchoolsFirst Federal Credit Union',
  'America First Credit Union',
  'Boeing Employees Credit Union',
  'Golden 1 Credit Union',
  'Digital Federal Credit Union',
  'Suncoast Credit Union',
  'Other bank',
];

const BANK_META = {
  'Bank of America': { color: '#E31837', initials: 'BA' },
  'Chase Bank': { color: '#117ACA', initials: 'C' },
  'Wells Fargo': { color: '#D71E28', initials: 'WF' },
  'Citibank': { color: '#00A3E0', initials: 'C' },
  'Capital One': { color: '#004977', initials: 'CO' },
  'U.S. Bank': { color: '#1B6FAD', initials: 'US' },
  'PNC Bank': { color: '#F47B20', initials: 'PNC' },
  'Truist Bank': { color: '#5E3A8C', initials: 'T' },
  'Ally Bank': { color: '#5C068C', initials: 'A' },
  'SoFi Bank': { color: '#0055A5', initials: 'S' },
  'Discover Bank': { color: '#FF6000', initials: 'D' },
  'Synchrony Bank': { color: '#003B5C', initials: 'SY' },
  'Chime': { color: '#23B24B', initials: 'CH' },
  'Marcus by Goldman Sachs': { color: '#7399C6', initials: 'GS' },
  'Charles Schwab Bank': { color: '#0072CE', initials: 'CS' },
  'Navy Federal Credit Union': { color: '#003B5C', initials: 'NF' },
};

function getBankStyle(name) {
  if (BANK_META[name]) return BANK_META[name];
  const words = name.split(' ').filter(w => w.length > 2);
  const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return { color: `hsl(${hue}, 60%, 42%)`, initials: initials || 'BK' };
}

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ sender_account_id: '', receiver_account_id: '', amount: '', description: 'Transfer' });
  const [transferType, setTransferType] = useState('internal');
  const [externalForm, setExternalForm] = useState({ recipient_name: '', recipient_bank: '', recipient_account_number: '', routing_number: '' });
  const [customBankName, setCustomBankName] = useState('');
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [looking, setLooking] = useState(false);
  const [recentTx, setRecentTx] = useState([]);
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [savePayee, setSavePayee] = useState(false);
  const [payeeNickname, setPayeeNickname] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('ONCE');
  const [scheduledList, setScheduledList] = useState([]);
  const [stepUpCode, setStepUpCode] = useState('');
  const [stepUpRequired, setStepUpRequired] = useState(false);
  const [stepUpVerifying, setStepUpVerifying] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const debounceRef = useRef(null);
  const toast = useToast();

  const refreshScheduled = () => api.get('/scheduled-transfers/').then(({ data }) => setScheduledList(data)).catch(() => {});
  const refreshBeneficiaries = () => api.get('/beneficiaries/').then(({ data }) => setBeneficiaries(data)).catch(() => {});

  useEffect(() => {
    api.get('/accounts/').then(({ data }) => {
      setAccounts(data);
      if (data.length > 0) setForm((f) => ({ ...f, sender_account_id: data[0].id }));
    }).catch(() => toast.error('Unable to load your accounts.'));
    api.get('/accounts/transactions?limit=4').then(({ data }) => setRecentTx(data)).catch(() => {});
    api.get('/auth/me').then(({ data }) => setUserProfile(data)).catch(() => {});
    refreshBeneficiaries();
    refreshScheduled();
  }, []);

  useEffect(() => {
    if (transferType !== 'internal') return;
    const trimmed = recipientInput.trim().toUpperCase();
    setResolvedRecipient(null);
    setLookupError('');
    if (!trimmed) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLooking(true);
      try {
        const { data } = await api.get('/accounts/lookup?account_number=' + encodeURIComponent(trimmed));
        if (accounts.some((a) => a.id === data.id)) {
          setLookupError('You cannot transfer to your own account.');
        } else {
          setResolvedRecipient(data);
          setForm((f) => ({ ...f, receiver_account_id: data.id }));
          setLookupError('');
        }
      } catch (err) {
        setLookupError(err.response?.data?.detail || 'Account not found.');
      } finally {
        setLooking(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [recipientInput, accounts, transferType]);

  const selectedSender = accounts.find((a) => a.id === form.sender_account_id);
  const selectedType = TRANSFER_TYPES[transferType];
  const amount = Number(form.amount || 0);
  const fee = selectedType.fee || 0;
  const totalDebit = amount + fee;
  const availableBalance = Number(selectedSender?.balance || 0);
  const exceedsLimit = amount > Math.min(DAILY_LIMIT, selectedType.limit);
  const exceedsBalance = totalDebit > availableBalance;
  const recipientReady = transferType === 'external'
    ? externalForm.recipient_name && externalForm.recipient_bank && (externalForm.recipient_bank !== 'Other bank' || customBankName.trim()) && externalForm.recipient_account_number.length >= 4
    : transferType === 'between'
    ? form.receiver_account_id && form.receiver_account_id !== form.sender_account_id
    : resolvedRecipient;
  const canReview = form.sender_account_id && amount > 0 && recipientReady && !exceedsLimit && !exceedsBalance;
  const recipientLabel = transferType === 'external' ? externalForm.recipient_name : transferType === 'between' ? (accounts.find((a) => a.id === form.receiver_account_id)?.account_type) : resolvedRecipient?.holder_name;
  const recipientDetail = transferType === 'external'
    ? `${externalForm.recipient_bank || 'External bank'} ${externalForm.recipient_account_number ? '••••' + externalForm.recipient_account_number.slice(-4) : ''}`
    : transferType === 'between'
    ? (accounts.find((a) => a.id === form.receiver_account_id) ? `${accounts.find((a) => a.id === form.receiver_account_id)?.account_type.replace(/_/g, ' ')} ••••${accounts.find((a) => a.id === form.receiver_account_id)?.account_number?.slice(-4)}` : 'Select receiving account')
    : resolvedRecipient ? `${resolvedRecipient.account_type} ••••${resolvedRecipient.account_number.slice(-4)}` : 'Enter recipient account';

  const handleReview = (e) => {
    e.preventDefault();
    if (!canReview) {
      toast.error(exceedsBalance ? 'Amount exceeds available balance.' : exceedsLimit ? 'This transfer exceeds the selected method limit.' : 'Complete transfer details before reviewing.');
      return;
    }
    const needsStepUp = amount >= STEP_UP_THRESHOLD && userProfile?.totp_enabled;
    setStepUpRequired(needsStepUp);
    setStepUpCode('');
    setReviewing(true);
  };

  const submitTransfer = async () => {
    setLoading(true);
    try {
      // Step-up verification for large transfers
      if (stepUpRequired) {
        if (!stepUpCode || stepUpCode.length < 6) {
          toast.error('Enter the 6-digit verification code to confirm this transfer.');
          setLoading(false);
          return;
        }
        setStepUpVerifying(true);
        await api.post('/auth/step-up', { code: stepUpCode });
        setStepUpVerifying(false);
      }

      const payload = { ...form, amount };
      const externalPayload = {
        ...payload,
        ...externalForm,
        recipient_bank: externalForm.recipient_bank === 'Other bank' ? customBankName.trim() : externalForm.recipient_bank,
      };

      // Scheduling flow
      if (scheduleEnabled && scheduleDate) {
        const scheduledPayload = {
          sender_account_id: form.sender_account_id,
          receiver_account_id: transferType === 'between' || transferType === 'internal' ? form.receiver_account_id : null,
          external_recipient_name: transferType === 'external' ? externalPayload.recipient_name : null,
          external_bank_name: transferType === 'external' ? externalPayload.recipient_bank : null,
          external_account_number: transferType === 'external' ? externalPayload.recipient_account_number : null,
          external_routing_number: transferType === 'external' ? externalPayload.routing_number : null,
          amount,
          description: form.description || 'Scheduled transfer',
          frequency: scheduleFrequency,
          next_run_at: new Date(scheduleDate).toISOString(),
        };
        await api.post('/scheduled-transfers/', scheduledPayload);
        toast.success('Transfer scheduled successfully.');
        setScheduleEnabled(false);
        setScheduleDate('');
        setScheduleFrequency('ONCE');
        refreshScheduled();
      } else if (transferType === 'external') {
        const { data } = await api.post('/accounts/external-transfer', externalPayload);
        setSuccess({ amount, reference: data.transaction_id, speed: data.estimated_arrival || selectedType.speed, pendingApproval: true });
      } else {
        const { data } = await api.post('/accounts/transfer', payload);
        setSuccess({ amount, reference: data.transaction_id, speed: data.estimated_arrival || selectedType.speed });
      }

      // Save payee after successful transfer
      if (savePayee && transferType === 'external') {
        await api.post('/beneficiaries/', {
          nickname: payeeNickname.trim() || undefined,
          recipient_name: externalForm.recipient_name,
          bank_name: externalForm.recipient_bank === 'Other bank' ? customBankName.trim() : externalForm.recipient_bank,
          account_number: externalForm.recipient_account_number,
          routing_number: externalForm.routing_number || null,
          is_internal: false,
        });
        refreshBeneficiaries();
      }

      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
      api.get('/accounts/transactions?limit=4').then(({ data: d }) => setRecentTx(d)).catch(() => {});
      setResolvedRecipient(null);
      setRecipientInput('');
      setExternalForm({ recipient_name: '', recipient_bank: '', recipient_account_number: '', routing_number: '' });
      setCustomBankName('');
      setForm((f) => ({ ...f, receiver_account_id: '', amount: '', description: 'Transfer' }));
      setSavePayee(false);
      setPayeeNickname('');
      setReviewing(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BankShell title="Send Money">
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-[#111a18]">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${success.pendingApproval ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <CheckCircle className={success.pendingApproval ? 'text-amber-600' : 'text-emerald-600'} size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{success.pendingApproval ? 'Sent — Awaiting approval' : 'Transfer submitted'}</h2>
            <p className="mt-2 text-4xl font-bold text-[#063b36] dark:text-[#7CFC00]">${formatMoney(success.amount)}</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600 dark:bg-white/5 dark:text-white/60">
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-slate-900 dark:text-white">{success.speed}</span></div>
              {success.pendingApproval && (
                <div className="mt-2 flex justify-between"><span>Status</span><span className="font-semibold text-amber-600 dark:text-amber-400">Processing</span></div>
              )}
              <div className="mt-2 flex justify-between"><span>Reference</span><span className="font-mono text-xs text-slate-900 dark:text-white">{String(success.reference).slice(0, 8).toUpperCase()}</span></div>
            </div>
            <button onClick={() => setSuccess(null)} className="mt-6 w-full rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c]">Done</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#063b36] dark:text-[#7CFC00]">Payments and transfers</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Send money</h1>
            <p className="mt-1 text-slate-500 dark:text-white/50">Transfer to Hunch customers instantly or schedule an external bank transfer.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:bg-white/5 dark:text-white/60">
            <ShieldCheck size={14} /> Review required before sending
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={handleReview} className="lg:col-span-3 space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">From account</label>
              <select value={form.sender_account_id} onChange={(e) => setForm((f) => ({ ...f, sender_account_id: e.target.value }))} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
              </select>
              {selectedSender && <p className="mt-2 text-sm text-slate-500">Available balance: <span className="font-semibold text-slate-900 dark:text-white">${formatMoney(selectedSender.balance)}</span></p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Transfer type</label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(TRANSFER_TYPES).map(([id, option]) => {
                  const Icon = option.icon;
                  return <button key={id} type="button" onClick={() => { setTransferType(id); setResolvedRecipient(null); setRecipientInput(''); setForm((f) => ({ ...f, receiver_account_id: '' })); }} className={`rounded-2xl border p-4 text-left transition ${transferType === id ? 'border-[#063b36] bg-[#063b36]/5 ring-2 ring-[#063b36]/10 dark:bg-[#063b36]/20' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'}`}>
                    <Icon className={transferType === id ? 'text-[#063b36] dark:text-[#7CFC00]' : 'text-slate-400'} size={22} />
                    <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.speed}</p>
                  </button>;
                })}
              </div>
            </section>

            {transferType === 'external' && (
              <div className="rounded-2xl border border-violet-200/50 bg-gradient-to-r from-violet-50 to-purple-50 p-4 dark:from-violet-900/10 dark:to-purple-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500 text-white">
                      <Send size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Sending to a person?</p>
                      <p className="text-[11px] text-slate-500">Zelle delivers in minutes using just an email or phone number.</p>
                    </div>
                  </div>
                  <Link to="/zelle" className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 transition">Try Zelle →</Link>
                </div>
              </div>
            )}

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recipient</label>
              {transferType === 'between' ? (
                <div className="mt-4">
                  <select value={form.receiver_account_id} onChange={(e) => setForm((f) => ({ ...f, receiver_account_id: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <option value="">Select receiving account</option>
                    {accounts.filter((a) => a.id !== form.sender_account_id).map((a) => <option key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} ••••{a.account_number.slice(-4)} — ${formatMoney(a.balance)}</option>)}
                  </select>
                </div>
              ) : transferType === 'internal' ? (
                <div className="mt-4">
                  <div className="relative">
                    <input value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-11 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Enter Hunch account number" autoComplete="off" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{looking ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#063b36] border-t-transparent" /> : <Search size={16} />}</span>
                  </div>
                  {resolvedRecipient && <div className="mt-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"><UserCheck size={16} /> <span><b>{resolvedRecipient.holder_name}</b> · {resolvedRecipient.account_type} · ••••{resolvedRecipient.account_number.slice(-4)}</span></div>}
                  {lookupError && <p className="mt-2 text-sm text-red-600">{lookupError}</p>}
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  {/* Saved payees as visual chips */}
                  {beneficiaries.filter((b) => !b.is_internal).length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Saved payees</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {beneficiaries.filter((b) => !b.is_internal).map((b) => {
                          const bankStyle = getBankStyle(b.bank_name);
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setExternalForm({ recipient_name: b.recipient_name, recipient_bank: b.bank_name, recipient_account_number: b.account_number, routing_number: b.routing_number || '' })}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                            >
                              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: bankStyle.color }}>{bankStyle.initials}</span>
                              <span className="font-medium text-slate-700 dark:text-white/70">{b.nickname || b.recipient_name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Bank selector with visual cards */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <Landmark size={14} /> Recipient bank
                    </label>
                    {externalForm.recipient_bank ? (
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-700/30 dark:bg-emerald-900/10">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: getBankStyle(externalForm.recipient_bank).color }}>{getBankStyle(externalForm.recipient_bank).initials}</span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{externalForm.recipient_bank}</p>
                            <p className="text-[10px] text-slate-400">ACH transfer · 1-3 business days</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setExternalForm((f) => ({ ...f, recipient_bank: '' }))} className="text-xs font-semibold text-[#063b36] hover:underline">Change</button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {US_BANKS.slice(0, 8).map((bank) => {
                            const style = getBankStyle(bank);
                            return (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => setExternalForm((f) => ({ ...f, recipient_bank: bank }))}
                                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 hover:border-[#063b36] hover:bg-[#063b36]/5 transition dark:border-white/10 dark:bg-white/5"
                              >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: style.color }}>{style.initials}</span>
                                <span className="text-[10px] font-medium text-slate-600 dark:text-white/60 text-center leading-tight">{bank.replace(' Bank', '').replace(' of America', '')}</span>
                              </button>
                            );
                          })}
                        </div>
                        <select required value={externalForm.recipient_bank} onChange={(e) => { setExternalForm((f) => ({ ...f, recipient_bank: e.target.value })); if (e.target.value !== 'Other bank') setCustomBankName(''); }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                          <option value="">More banks…</option>
                          {US_BANKS.slice(8).map((bank) => <option key={bank} value={bank}>{bank}</option>)}
                          <option value="Other bank">Other bank (not listed)</option>
                        </select>
                      </div>
                    )}
                    {externalForm.recipient_bank === 'Other bank' && (
                      <input required value={customBankName} onChange={(e) => setCustomBankName(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Enter bank name" />
                    )}
                  </div>

                  {/* Recipient details with icons */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <UserCheck size={14} /> Full name
                      </label>
                      <input required value={externalForm.recipient_name} onChange={(e) => setExternalForm((f) => ({ ...f, recipient_name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Recipient full name" />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Building2 size={14} /> Routing number
                      </label>
                      <input value={externalForm.routing_number} onChange={(e) => setExternalForm((f) => ({ ...f, routing_number: e.target.value.replace(/\D/g, '') }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="9-digit routing number" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <CreditCard size={14} /> Account number
                      </label>
                      <input required value={externalForm.recipient_account_number} onChange={(e) => setExternalForm((f) => ({ ...f, recipient_account_number: e.target.value.replace(/\D/g, '') }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Account number" />
                    </div>
                  </div>

                  {/* Recipient preview card */}
                  {externalForm.recipient_name && externalForm.recipient_bank && externalForm.recipient_account_number && (
                    <div className="rounded-2xl border border-[#063b36]/20 bg-gradient-to-br from-[#063b36]/5 to-[#0a5a52]/5 p-4 dark:border-[#7CFC00]/20 dark:from-[#063b36]/10 dark:to-[#0a5a52]/10">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#063b36] text-white text-sm font-bold">
                          {externalForm.recipient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{externalForm.recipient_name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50 flex items-center gap-1">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: getBankStyle(externalForm.recipient_bank).color }} />
                            {externalForm.recipient_bank}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Acct ••••{externalForm.recipient_account_number.slice(-4)} {externalForm.routing_number && `· Routing ${externalForm.routing_number}`}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save payee */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <input id="savePayee" type="checkbox" checked={savePayee} onChange={(e) => setSavePayee(e.target.checked)} className="h-4 w-4 accent-[#063b36]" />
                      <label htmlFor="savePayee" className="text-sm font-medium text-slate-700 dark:text-white/70">Save this payee for future transfers</label>
                    </div>
                    {savePayee && (
                      <input value={payeeNickname} onChange={(e) => setPayeeNickname(e.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Nickname (optional)" />
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount</label>
              <div className="mt-5 flex items-center justify-center rounded-3xl border border-slate-100 bg-slate-50 px-5 py-8 dark:border-white/10 dark:bg-white/5">
                <span className="mr-2 text-4xl sm:text-5xl font-light text-slate-300">$</span>
                <input type="number" required min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full bg-transparent text-center text-4xl sm:text-5xl font-bold text-slate-900 outline-none dark:text-white" placeholder="0.00" />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {QUICK_AMOUNTS.map((quick) => <button key={quick} type="button" onClick={() => setForm((f) => ({ ...f, amount: String(quick) }))} className={`rounded-full px-4 py-2 text-sm font-semibold ${amount === quick ? 'bg-[#063b36] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-white/60'}`}>${quick.toLocaleString()}</button>)}
              </div>
              {(exceedsLimit || exceedsBalance) && <p className="mt-3 flex items-center gap-2 text-sm text-red-600"><AlertTriangle size={15} /> {exceedsBalance ? 'Amount exceeds available balance.' : `Limit for ${selectedType.label} is $${formatMoney(selectedType.limit)}.`}</p>}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-center gap-3">
                <input id="scheduleEnabled" type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="h-4 w-4 accent-[#063b36]" />
                <label htmlFor="scheduleEnabled" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><CalendarClock size={16} /> Schedule this transfer</label>
              </div>
              {scheduleEnabled && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input type="datetime-local" required value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  <select value={scheduleFrequency} onChange={(e) => setScheduleFrequency(e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white">
                    {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              )}
            </section>

            <input type="text" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-[#063b36] dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Memo (optional)" />
            <button type="submit" disabled={!canReview} className="w-full rounded-2xl bg-[#063b36] py-4 text-base font-bold text-white transition hover:bg-[#041f1c] disabled:cursor-not-allowed disabled:opacity-50">{scheduleEnabled ? 'Review scheduled transfer' : 'Review transfer'} <ArrowRight className="ml-2 inline" size={16} /></button>
          </form>

          <aside className="lg:col-span-2 space-y-5">
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#063b36] dark:text-[#7CFC00]" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your account details</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-white/50 mb-3">Share your account number to receive Hunch-to-Hunch transfers.</p>
              <div className="space-y-3">
                {accounts.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-white/70">{a.account_type.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-bold text-[#063b36] dark:text-[#7CFC00]">${formatMoney(a.balance)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-800 dark:text-white">{a.account_number}</span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(a.account_number); toast.success('Account number copied!'); }}
                        className="text-[10px] font-bold uppercase tracking-wide text-[#063b36] hover:underline dark:text-[#7CFC00]"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-[#063b36] p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Transfer summary</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-white/50">Amount</span><span className="text-2xl font-bold text-[#7CFC00]">${formatMoney(amount)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">From</span><span className="font-semibold text-right">{selectedSender ? `${selectedSender.account_type.replace(/_/g, ' ')} ••••${selectedSender.account_number.slice(-4)}` : '—'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">To</span><span className="font-semibold text-right">{recipientLabel || '—'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Method</span><span className="font-semibold text-right">{selectedType.label}</span></div>
                <div className="flex justify-between gap-4"><span className="text-white/50">Delivery</span><span className="font-semibold text-right">{selectedType.speed}</span></div>
              </div>
            </section>
            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 text-slate-400" size={18} />
                <p className="text-sm text-slate-500 dark:text-white/50">External transfers are scheduled through standard bank rails with delivery timing based on method, cutoff time, and recipient institution.</p>
              </div>
            </section>
            {recentTx.length > 0 && <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]"><div className="mb-3 flex items-center gap-2"><Clock size={14} className="text-slate-400" /><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recent activity</p></div><ul className="space-y-3">{recentTx.map((tx) => <li key={tx.id} className="flex items-center justify-between gap-3 text-xs"><div><p className="max-w-[160px] truncate font-semibold text-slate-700 dark:text-white/70">{tx.description || tx.type}</p><p className="mt-0.5 text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p></div><span className={tx.type === 'DEPOSIT' || tx.type === 'ADMIN_CREDIT' ? 'font-bold text-emerald-600' : 'font-bold text-red-500'}>{tx.type === 'DEPOSIT' || tx.type === 'ADMIN_CREDIT' ? '+' : '-'}${formatMoney(tx.amount)}</span></li>)}</ul></section>}
            {scheduledList.length > 0 && (
              <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111a18]">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock size={14} className="text-slate-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Scheduled</p>
                </div>
                <ul className="space-y-3">
                  {scheduledList.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                      <div>
                        <p className="max-w-[140px] truncate font-semibold text-slate-700 dark:text-white/70">{s.description || 'Scheduled transfer'}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{s.frequency} · {new Date(s.next_run_at).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">${formatMoney(s.amount)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#111a18]">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review transfer</h2>
            <p className="mt-1 text-sm text-slate-500">Confirm recipient and amount before submitting.</p>
            <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">
              <div className="flex justify-between"><span>From</span><span className="font-semibold">{selectedSender?.account_type?.replace(/_/g, ' ')} ••••{selectedSender?.account_number?.slice(-4)}</span></div>
              <div className="flex justify-between"><span>To</span><span className="font-semibold text-right">{recipientLabel}<br /><span className="text-xs font-normal text-slate-400">{recipientDetail}</span></span></div>
              <div className="flex justify-between"><span>Amount</span><span className="font-semibold">${formatMoney(amount)}</span></div>
              <div className="flex justify-between"><span>Fee</span><span className="font-semibold">${formatMoney(fee)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="font-semibold text-right">{selectedType.speed}</span></div>
            </div>
            {stepUpRequired && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Step-up verification required</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Enter your authenticator app code to confirm this large transfer.</p>
                <input type="text" inputMode="numeric" maxLength={6} value={stepUpCode} onChange={(e) => setStepUpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400 dark:border-amber-700 dark:bg-white/5 dark:text-white" />
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setReviewing(false); setStepUpRequired(false); setStepUpCode(''); }} className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">Edit</button>
              <button type="button" disabled={loading || stepUpVerifying} onClick={submitTransfer} className="rounded-xl bg-[#063b36] py-3 font-semibold text-white hover:bg-[#041f1c] disabled:opacity-50">{stepUpVerifying ? 'Verifying…' : loading ? 'Processing...' : 'Confirm transfer'}</button>
            </div>
          </div>
        </div>
      )}
    </BankShell>
  );
}
