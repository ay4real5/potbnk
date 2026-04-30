import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Register is superseded by the multi-step ApplyOnline flow.
// This component simply redirects to /apply to preserve any inbound links.
export default function Register() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/apply', { replace: true }); }, [navigate]);
  return null;
}
