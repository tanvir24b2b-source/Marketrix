import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [signupOpen, setSignupOpen] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  useMemo(() => {
    void api<{ hasAdmin: boolean }>('/auth/bootstrap-status').then((r) => setHasAdmin(r.hasAdmin));
  }, []);

  const onLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      const result = await login(String(fd.get('email')), String(fd.get('password')), navigator.userAgent);
      if (result.deviceApprovalRequired) {
        navigate('/device-approval');
        return;
      }
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      await api('/auth/first-signup', {
        method: 'POST',
        body: JSON.stringify({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') }),
      });
      setSignupOpen(false);
      setHasAdmin(true);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="content">
      <div className="card form">
        <h2>Login</h2>
        <form className="form" onSubmit={onLogin}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        {hasAdmin === false && <button onClick={() => setSignupOpen((v) => !v)}>Create First Admin</button>}
        {signupOpen && (
          <form className="form modal" onSubmit={onSignup}>
            <input name="name" placeholder="Admin Name" required />
            <input name="email" type="email" placeholder="Admin Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Create Admin</button>
          </form>
        )}
        {hasAdmin && <p>Public signup disabled after first admin.</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
