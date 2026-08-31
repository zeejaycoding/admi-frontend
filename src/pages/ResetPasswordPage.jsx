import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { notify } from '../services/utils/authUtils';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    const res = await resetPassword({ token, newPassword: password });
    if (res?.meta?.requestStatus === 'fulfilled') {
      notify.success('Password reset successful. You can now log in.');
      navigate('/');
    } else {
      const apiErr = res?.payload || 'Password reset failed';
      const { formatBackendErrorMessage } = await import('../services/utils/authUtils');
      notify.error(formatBackendErrorMessage(apiErr));
    }
  };

  if (!token) return <div className="p-6 text-red-600">Missing reset token.</div>;
  // success redirects; no inline success UI

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Reset password'}
      </button>
    </form>
  );
};

export default ResetPasswordPage;


