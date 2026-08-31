import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email });
      if (res?.meta?.requestStatus === 'fulfilled') setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) return <div className="text-sm text-green-700">If an account exists, a reset link has been sent.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send reset link'}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;


