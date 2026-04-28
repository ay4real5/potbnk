import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, ArrowLeftRight, MinusCircle } from 'lucide-react';

const NAV_CATEGORIES = ['Bank', 'Borrow', 'Grow', 'Plan', 'Protect', 'Learn'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Personal');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-bank-primary">
      {/* Row 1: logo + Personal/Business tabs + auth */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link
          to={user ? '/dashboard' : '/'}
          className="text-white font-bold text-2xl tracking-tight shrink-0"
        >
          Hunch<span className="text-bank-accent">.</span>
        </Link>

        {!user && (
          <div className="flex items-center self-stretch">
            {['Personal', 'Business'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 h-full text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'text-white border-bank-accent'
                    : 'text-green-200 border-transparent hover:text-white hover:border-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-5">
            <Link
              to="/dashboard"
              className="text-green-100 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link
              to="/transfer"
              className="text-green-100 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeftRight size={15} /> Transfer
            </Link>
            <Link
              to="/withdraw"
              className="text-green-100 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <MinusCircle size={15} /> Withdraw
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-green-300 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-green-100 hover:text-white text-sm transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-bank-accent hover:bg-green-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>

      {/* Row 2: category links (guest only) */}
      {!user && (
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-10 h-10">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="text-green-100 hover:text-white text-sm font-medium transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
