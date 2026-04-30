import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BankShell from '../components/BankShell';
import { CheckCircle, User, Lock, Calendar, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();

  const [nameForm, setNameForm] = useState({ full_name: '' });
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const me = user || await fetchMe();
      if (me) setNameForm({ full_name: me.full_name });
    }
    load();
  }, [user]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');
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
    setPassError('');
    setPassSuccess('');
    if (passForm.new_password !== passForm.confirm_password) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passForm.new_password.length < 8) {
      setPassError('New password must be at least 8 characters.');
      return;
    }
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

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <BankShell title="Settings">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-bank-dark mb-1">Account Settings</h2>
          <p className="text-gray-500 text-sm">Manage your profile and security preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tab sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-100 last:border-0 text-left
                    ${activeTab === id ? 'bg-bank-dark text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {/* Profile summary */}
            <div className="mt-4 bg-bank-dark rounded-xl p-4 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg mb-3">
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'HU'}
              </div>
              <p className="font-semibold text-sm">{user?.full_name ?? '—'}</p>
              <p className="text-white/50 text-xs truncate">{user?.email ?? '—'}</p>
            </div>
          </div>

          {/* Tab content */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {activeTab === 'profile' && (
              <>
                {/* Read-only info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-bank-dark text-sm mb-5">Account Information</h3>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">
                        <Mail size={12} /> Email Address
                      </div>
                      <p className="text-bank-dark font-medium text-sm">{user?.email ?? '—'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1.5">
                        <Calendar size={12} /> Member Since
                      </div>
                      <p className="text-bank-dark font-medium text-sm">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Update name */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-bank-dark text-sm mb-5">Display Name</h3>
                  {nameSuccess && (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
                      <CheckCircle size={16} /> {nameSuccess}
                    </div>
                  )}
                  {nameError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{nameError}</div>
                  )}
                  <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      value={nameForm.full_name}
                      onChange={(e) => setNameForm({ full_name: e.target.value })}
                      className="hnt-input flex-1"
                      placeholder="Your full name"
                    />
                    <button
                      type="submit"
                      disabled={nameLoading}
                      className="bg-bank-dark text-white font-semibold px-6 py-3 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 shrink-0 text-sm"
                    >
                      {nameLoading ? 'Saving…' : 'Save'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Lock size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bank-dark text-sm">Change Password</h3>
                    <p className="text-xs text-gray-400">Choose a strong password with letters, numbers, and symbols.</p>
                  </div>
                </div>
                {passSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
                    <CheckCircle size={16} /> {passSuccess}
                  </div>
                )}
                {passError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{passError}</div>
                )}
                <form onSubmit={handlePassSubmit} className="flex flex-col gap-4 max-w-sm">
                  <div>
                    <label className="block text-sm font-medium text-bank-dark mb-1.5">Current password</label>
                    <input type="password" required value={passForm.current_password} onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })} className="hnt-input" autoComplete="current-password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bank-dark mb-1.5">New password</label>
                    <input type="password" required minLength={8} value={passForm.new_password} onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })} className="hnt-input" autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bank-dark mb-1.5">Confirm new password</label>
                    <input type="password" required minLength={8} value={passForm.confirm_password} onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })} className="hnt-input" autoComplete="new-password" />
                  </div>
                  <button type="submit" disabled={passLoading} className="bg-bank-dark text-white font-semibold py-3 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 text-sm">
                    {passLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </BankShell>
  );
}
