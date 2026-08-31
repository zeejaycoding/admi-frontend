import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { notify } from '../services/utils/authUtils';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { verifyEmail, resendVerification, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || '');
  const [resent, setResent] = useState(false);
  const handledRef = useRef(false);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (handledRef.current) return; // Prevent double run in React StrictMode (dev)
    handledRef.current = true;
    if (!token) return setStatus('missing');
    (async () => {
      const res = await verifyEmail(token);
      if (res?.meta?.requestStatus === 'fulfilled') {
        setStatus('success');
        // Email verified - redirect to login page
        setTimeout(() => navigate('/'), 1000);
      } else {
        // Error notification is handled by the auth slice
        setStatus('error');
      }
    })();
  }, [token, verifyEmail, navigate]);

  if (status === 'pending') return <div className="p-6">Verifying your email...</div>;
  if (status === 'missing') return <div className="p-6 text-red-600">Missing verification token.</div>;
  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <div className="text-red-600">We couldn&apos;t verify your email.</div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email to resend verification</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button
            className="btn-primary w-full"
            disabled={!email || resent || isLoading}
            onClick={async () => {
              if (!email) return;
              const res = await resendVerification(email);
              if (res?.meta?.requestStatus === 'fulfilled') {
                notify.info('Verification email resent. Please check your inbox.');
                setResent(true);
              } else {
                const apiErr = res?.payload?.error || res?.payload?.message || 'Resend failed';
                notify.error(apiErr);
              }
            }}
          >
            {resent ? 'Sent' : 'Resend verification email'}
          </button>
        </div>
      </div>
    );
  }
  if (status === 'success') {
    setTimeout(() => navigate('/'), 500);
    return null;
  }
  return null;
};

export default VerifyEmailPage;


