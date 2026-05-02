import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import {
  CheckCircle, User, Lock, Bell, CreditCard, Palette,
  Mail, Calendar, Shield, Plus, X, Moon, Sun, Fingerprint, Laptop, Smartphone, MapPin, Clock3,
} from 'lucide-react';

// ── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ' +
        (checked ? 'bg-[#063b36]' : 'bg-slate-200 dark:bg-white/20')}
    >
      <span className={'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ' +
        (checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function Settings() {
  const { user, fetchMe } = useAuth();

  // Profile
  const [nameForm, setNameForm]       = useState({ full_name: '' });
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError]     = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  // Security
  const [passForm, setPassForm]       = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError]     = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Notifications (UI only)
  const [notifs, setNotifs] = useState({
    email: true, transactions: true, security: true, statements: false,
  });

  // Accounts tab
  const [accounts, setAccounts]             = useState([]);
  const [showOpenAcct, setShowOpenAcct]     = useState(false);
  const [openAcctType, setOpenAcctType]     = useState('SAVINGS');
  const [openAcctLoading, setOpenAcctLoading] = useState(false);
  const [openAcctSuccess, setOpenAcctSuccess] = useState('');
  const [openAcctError, setOpenAcctError]   = useState('');

  // Appearance
  const [dark, setDark] = useState(() => localStorage.getItem('hunch-theme') === 'dark');
  const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem('hunch-biometric-enabled') === '1');

  // Nav
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    async function load() {
      const me = user || await fetchMe();
      if (me) setNameForm({ full_name: me.full_name });
    }
    load();
  }, [user]);

  // Load accounts when Accounts tab is active
  useEffect(() => {
    if (activeTab === 'accounts') {
      api.get('/accounts/').then(({ data }) => setAccounts(data)).catch(() => {});
    }
  }, [activeTab]);

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('hunch-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('hunch-biometric-enabled', biometricEnabled ? '1' : '0');
  }, [biometricEnabled]);

  const trustedDevices = useMemo(() => {
    const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
    const isMobile = /iphone|ipad|android/.test(ua);
    return [
      {
        id: 'current',
        label: isMobile ? 'Current mobile device' : 'Current desktop device',
        location: 'Current location',
        seen: 'Active now',
        Icon: isMobile ? Smartphone : Laptop,
      },
      {
        id: 'last',
        label: 'Last signed-in session',
        location: 'Same city as usual',
        seen: '2 hours ago',
        Icon: Laptop,
      },
    ];
  }, []);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameError(''); setNameSuccess('');
    setNameLoading(true);
    try {
      await api.patch('/auth/me', { full_name: nameForm.full_name });
      await fetchMe();
      setNameSuccess('Name updated successfully.');
    } catch (err) {
      setNameError(err.response?.data?.detail || 'Failed to update name.');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassError(''); setPassSuccess('');
    if (passForm.new_password !== passForm.confirm_password) { setPassError('New passwords do not match.'); return; }
    if (passForm.new_password.length < 8) { setPassError('New password must be at least 8 characters.'); return; }
    setPassLoading(true);
    try {
      await api.patch('/auth/me', {
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      });
      setPassSuccess('Password changed successfully.');
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPassError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleOpenAccount = async () => {
    setOpenAcctError(''); setOpenAcctSuccess('');
    setOpenAcctLoading(true);
    try {
      const { data } = await api.post('/accounts/open', { account_type: openAcctType });
      setOpenAcctSuccess(data.message);
      const { data: accs } = await api.get('/accounts/');
      setAccounts(accs);
    } catch (err) {
      setOpenAcctError(err.response?.data?.detail || 'Failed to open account.');
    } finally {
      setOpenAcctLoading(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HU';

  const TABS = [
    { id: 'profile',      icon: User,       label: 'Profile'       },
    { id: 'security',     icon: Shield,     label: 'Security'      },
    { id: 'notifications',icon: Bell,       label: 'Notifications' },
    { id: 'accounts',     icon: CreditCard, label: 'Accounts'      },
    { id: 'appearance',   icon: Palette,    label: 'Appearance'    },
  ];

  const navItemCls = (id) =>
    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ' +
    (activeTab === id
      ? 'bg-[#063b36]/10 text-[#063b36] dark:bg-[#7CFC00]/10 dark:text-[#7CFC00] font-semibold'
      : 'text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/5');

  return (
    <BankShell title="Settings">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-display">Account Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your profile, security, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left nav */}
          <div className="lg:col-span-1 space-y-2">
            <div className="premium-card p-4 premium-enter">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={navItemCls(id)}>
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* Profile summary card */}
            <div className="bg-[#063b36] rounded-2xl p-4 text-white premium-enter premium-enter-delay-1 shadow-lg shadow-[#041f1c]/20">
              <div className="w-12 h-12 rounded-full bg-[#7CFC00] flex items-center justify-center text-[#041f1c] font-bold text-lg mb-3">
                {initials}
              </div>
              <p className="font-semibold text-sm">{user?.full_name ?? '—'}</p>
              <p className="text-white/50 text-xs truncate mt-0.5">{user?.email ?? '—'}</p>
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-3 flex flex-col gap-5 premium-enter premium-enter-delay-1">

            {/* ── PROFILE ── */}
            {activeTab === 'profile' && (
              <>
                {/* Avatar + info */}
                <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-6 shadow-sm">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full bg-[#063b36] flex items-center justify-center text-white text-2xl font-bold">
                        {initials}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-[#111a18] border-2 border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-500 dark:text-white/50 hover:text-[#063b36] transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-lg">{user?.full_name ?? '—'}</p>
                      <p className="text-slate-400 text-sm">{user?.email ?? '—'}</p>
                      <button className="text-xs text-[#16a34a] hover:text-[#15803d] font-semibold mt-1 transition-colors">Change Photo</button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5 mb-5 pb-5 border-b border-slate-50 dark:border-white/5">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        <Mail size={11} /> Email Address
                      </div>
                      <p className="text-slate-700 dark:text-white/70 font-medium text-sm">{user?.email ?? '—'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Read-only</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        <Calendar size={11} /> Member Since
                      </div>
                      <p className="text-slate-700 dark:text-white/70 font-medium text-sm">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Update name */}
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white/70 mb-4">Display Name</h3>
                  {nameSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl px-4 py-3 mb-4">
                      <CheckCircle size={15} /> {nameSuccess}
                    </div>
                  )}
                  {nameError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{nameError}</div>
                  )}
                  <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text" required
                      value={nameForm.full_name}
                      onChange={(e) => setNameForm({ full_name: e.target.value })}
                      className="flex-1 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]"
                      placeholder="Your full name"
                    />
                    <button type="submit" disabled={nameLoading}
                      className="bg-[#063b36] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#041f1c] transition-colors disabled:opacity-50 shrink-0 text-sm">
                      {nameLoading ? 'Saving…' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Lock size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Change Password</h3>
                    <p className="text-xs text-slate-400">Use a strong password with letters, numbers, and symbols.</p>
                  </div>
                </div>
                {passSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl px-4 py-3 mb-4">
                    <CheckCircle size={15} /> {passSuccess}
                  </div>
                )}
                {passError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{passError}</div>
                )}
                <form onSubmit={handlePassSubmit} className="flex flex-col gap-4 max-w-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">Current password</label>
                    <input type="password" required autoComplete="current-password"
                      value={passForm.current_password}
                      onChange={(e) => setPassForm((f) => ({ ...f, current_password: e.target.value }))}
                      className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">New password</label>
                    <input type="password" required minLength={8} autoComplete="new-password"
                      value={passForm.new_password}
                      onChange={(e) => setPassForm((f) => ({ ...f, new_password: e.target.value }))}
                      className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-white/50 mb-1.5 uppercase tracking-wider">Confirm new password</label>
                    <input type="password" required minLength={8} autoComplete="new-password"
                      value={passForm.confirm_password}
                      onChange={(e) => setPassForm((f) => ({ ...f, confirm_password: e.target.value }))}
                      className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]" />
                  </div>
                  <button type="submit" disabled={passLoading}
                    className="bg-[#063b36] text-white font-semibold py-3 rounded-xl hover:bg-[#041f1c] transition-colors disabled:opacity-50 text-sm">
                    {passLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                        <Fingerprint size={16} className="text-slate-600 dark:text-white/60" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-white/80">Biometric Sign-in</p>
                        <p className="text-xs text-slate-400">Allow Face ID / Touch ID quick sign-in on trusted devices</p>
                      </div>
                    </div>
                    <Toggle checked={biometricEnabled} onChange={setBiometricEnabled} />
                  </div>

                  <div className="rounded-xl border border-slate-100 dark:border-white/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Trusted Devices & Activity</p>
                    <div className="space-y-3">
                      {trustedDevices.map(({ id, label, location, seen, Icon }) => (
                        <div key={id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-white/5 px-3 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon size={14} className="text-slate-500 dark:text-white/50 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{label}</p>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {location}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock3 size={10} /> {seen}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-5">Notification Preferences</h3>
                <div className="space-y-0">
                  {[
                    { key: 'email',        label: 'Email Notifications',  desc: 'Receive account updates via email'        },
                    { key: 'transactions', label: 'Transaction Alerts',   desc: 'Get notified on every transaction'        },
                    { key: 'security',     label: 'Security Alerts',      desc: 'Alerts for suspicious activity'          },
                    { key: 'statements',   label: 'Monthly Statements',   desc: 'Monthly account summary emails'          },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-white/5 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-white/80">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={(val) => setNotifs((n) => ({ ...n, [key]: val }))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACCOUNTS ── */}
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Your Accounts</h3>
                  <button
                    onClick={() => { setShowOpenAcct((s) => !s); setOpenAcctSuccess(''); setOpenAcctError(''); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:text-[#15803d] transition-colors"
                  >
                    <Plus size={12} /> Open New Account
                  </button>
                </div>

                {showOpenAcct && (
                  <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-slate-700 dark:text-white/80 text-sm">New Account</p>
                      <button onClick={() => setShowOpenAcct(false)} className="text-slate-400 hover:text-slate-600"><X size={15} /></button>
                    </div>
                    {openAcctSuccess ? (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl px-4 py-3">
                        <CheckCircle size={14} /> {openAcctSuccess}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select value={openAcctType} onChange={(e) => setOpenAcctType(e.target.value)}
                          className="flex-1 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#063b36]">
                          <option value="CHECKING">Checking</option>
                          <option value="SAVINGS">Savings</option>
                          <option value="BUSINESS_CHECKING">Business Checking</option>
                          <option value="MONEY_MARKET">Money Market</option>
                        </select>
                        <button onClick={handleOpenAccount} disabled={openAcctLoading}
                          className="bg-[#063b36] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#041f1c] transition-all disabled:opacity-50">
                          {openAcctLoading ? '…' : 'Open'}
                        </button>
                      </div>
                    )}
                    {openAcctError && <p className="mt-2 text-xs text-red-600">{openAcctError}</p>}
                  </div>
                )}

                {accounts.length === 0 ? (
                  <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-10 text-center shadow-sm">
                    <p className="text-slate-400 text-sm">No accounts yet.</p>
                  </div>
                ) : (
                  accounts.map((acc) => (
                    <div key={acc.id} className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-5 shadow-sm flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#063b36]/10 dark:bg-[#7CFC00]/10 flex items-center justify-center shrink-0">
                        <CreditCard size={16} className="text-[#063b36] dark:text-[#7CFC00]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-white/80 text-sm truncate">{acc.account_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-400 mt-0.5">••••{acc.account_number.slice(-4)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-800 dark:text-white tabular-nums text-sm">${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 mt-1">Active</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-[#111a18] rounded-2xl border border-slate-100 dark:border-white/10 p-6 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Appearance</h3>

                {/* Dark mode */}
                <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    {dark ? <Moon size={18} className="text-slate-600 dark:text-white/60" /> : <Sun size={18} className="text-amber-500" />}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-white/80">Dark Mode</p>
                      <p className="text-xs text-slate-400">{dark ? 'Dark theme is active' : 'Light theme is active'}</p>
                    </div>
                  </div>
                  <Toggle checked={dark} onChange={setDark} />
                </div>

                {/* Color theme */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-white/80 mb-3">Color Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: 'Forest Green', color: '#063b36', active: true  },
                      { name: 'Navy Blue',    color: '#1e3a5f', active: false },
                      { name: 'Slate',        color: '#334155', active: false },
                    ].map((theme) => (
                      <button key={theme.name}
                        className={'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ' +
                          (theme.active ? 'border-[#063b36] dark:border-[#7CFC00]' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 opacity-50')}>
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.color }} />
                        <span className="text-xs font-semibold text-slate-700 dark:text-white/70">{theme.name}</span>
                        {theme.active && <span className="text-[10px] text-[#063b36] dark:text-[#7CFC00]">Current</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </BankShell>
  );
}
