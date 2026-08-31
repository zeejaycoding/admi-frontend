import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before being redirected to register
  const from = location.state?.from || '/';

  const handleRegisterSuccess = () => {
    // After registration, user typically needs to verify email
    // But we can redirect them to the verification page with the from state
    navigate('/welcome-verify', { state: { from } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us to access programs and more</p>
        </div>

        <RegisterForm onSuccess={handleRegisterSuccess} />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from }}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
