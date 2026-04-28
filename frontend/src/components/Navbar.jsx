import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, ArrowLeftRight, MinusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-bank-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to={user ? '/dashboard' : '/'}
          className="text-white font-bold text-2xl tracking-tight"
        >
          Hunch<span className="text-bank-accent">.</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link
              to="/transfer"
              className="text-slate-300 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <ArrowLeftRight size={16} /> Transfer
            </Link>
            <Link
              to="/withdraw"
              className="text-slate-300 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <MinusCircle size={16} /> Withdraw
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-sm transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-bank-accent hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
