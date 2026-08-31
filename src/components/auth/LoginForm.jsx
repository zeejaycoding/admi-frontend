import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';

const LoginForm = ({ onSuccess }) => {
  const { login, isLoading, error, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    if (res?.meta?.requestStatus === 'fulfilled') {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-sm text-red-600">{error?.error || error?.message || 'Login failed'}</div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
};

export default LoginForm;


