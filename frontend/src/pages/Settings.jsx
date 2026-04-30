import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Navbar from '../components/Navbar';
import { CheckCircle, User, Lock } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-bank-surface">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-bank-dark text-sm mb-8 transition-colors"
        >
          ← Back to dashboard
        </button>

        <h1 className="text-2xl font-bold text-bank-dark mb-1">Account settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your profile and security.</p>

        {/* Profile info (read-only) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-bank-light flex items-center justify-center">
              <User size={18} className="text-bank-accent" />
            </div>
            <h2 className="font-bold text-bank-dark">Profile</h2>
          </div>
          <div className="text-sm text-gray-500 mb-1">Email</div>
          <div className="text-bank-dark font-medium mb-4">{user?.email ?? '—'}</div>
          <div className="text-sm text-gray-500 mb-1">Member since</div>
          <div className="text-bank-dark font-medium">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : '—'}
          </div>
        </div>

        {/* Update name */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5 shadow-sm">
          <h2 className="font-bold text-bank-dark mb-4">Display name</h2>
          {nameSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
              <CheckCircle size={16} /> {nameSuccess}
            </div>
          )}
          {nameError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {nameError}
            </div>
          )}
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-bank-dark mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={nameForm.full_name}
                onChange={(e) => setNameForm({ full_name: e.target.value })}
                className="hnt-input"
              />
            </div>
            <button
              type="submit"
              disabled={nameLoading}
              className="w-full bg-bank-dark text-white font-semibold py-2.5 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {nameLoading ? 'Saving…' : 'Save name'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
              <Lock size={16} className="text-purple-500" />
            </div>
            <h2 className="font-bold text-bank-dark">Change password</h2>
          </div>
          {passSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
              <CheckCircle size={16} /> {passSuccess}
            </div>
          )}
          {passError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {passError}
            </div>
          )}
          <form onSubmit={handlePassSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-bank-dark mb-1.5">Current password</label>
              <input
                type="password"
                required
                value={passForm.current_password}
                onChange={(e) => setPassForm({ ...passForm, current_password: e.target.value })}
                className="hnt-input"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bank-dark mb-1.5">New password</label>
              <input
                type="password"
                required
                minLength={8}
                value={passForm.new_password}
                onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })}
                className="hnt-input"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bank-dark mb-1.5">Confirm new password</label>
              <input
                type="password"
                required
                minLength={8}
                value={passForm.confirm_password}
                onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })}
                className="hnt-input"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={passLoading}
              className="w-full bg-bank-dark text-white font-semibold py-2.5 rounded-lg hover:bg-bank-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {passLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
