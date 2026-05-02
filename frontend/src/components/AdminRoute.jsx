import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { token, user, fetchMe } = useAuth();
  const [loading, setLoading] = useState(!user && !!token);

  useEffect(() => {
    if (token && !user) {
      fetchMe().finally(() => setLoading(false));
    }
  }, [token, user, fetchMe]);

  if (!token) return <Navigate to="/admin/login" replace />;
  if (loading) {
    return (
      <div className="min-h-screen bg-bank-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bank-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  return children;
}
