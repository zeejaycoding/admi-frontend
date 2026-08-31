import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { notify } from '../../services/utils/authUtils';

const RegisterForm = ({ onSuccess }) => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      notify.error('Passwords do not match');
      return;
    }
    const payload = {
      email: form.email,
      password: form.password,
      fullName: form.fullName,
    };
    const res = await registerUser(payload);
    if (res?.meta?.requestStatus === 'fulfilled') {
      if (onSuccess) onSuccess();
      navigate(`/welcome-verify?email=${form.email}`);
    } else {
      const apiErr = res?.payload || 'Registration failed';
      const { formatBackendErrorMessage } = await import('../../services/utils/authUtils');
      notify.error(formatBackendErrorMessage(apiErr));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input name="fullName" className="input-field" value={form.fullName} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" name="email" className="input-field" value={form.email} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" name="password" className="input-field" value={form.password} onChange={handleChange} minLength={8} required />
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input type="password" name="confirmPassword" className="input-field" value={form.confirmPassword} onChange={handleChange} required />
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600">{error?.message || 'Registration failed'}</div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
};

export default RegisterForm;
