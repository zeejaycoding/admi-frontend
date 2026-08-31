import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';


const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('signin');

  // Lock body scroll when modal is open to prevent background scroll/jank
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200"
      >
        {/* Header with close button and tab navigation */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'signin' ? 'Welcome Back' : activeTab === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 group" 
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200">
                <path d="M18.3 5.71 12 12.01 5.7 5.71 4.29 7.12 10.59 13.4 4.29 19.7 5.7 21.11 12 14.81 18.3 21.11 19.71 19.7 13.41 13.4 19.71 7.12z"/>
              </svg>
            </button>
          </div>
          
          {/* Tab Navigation */}
          {activeTab !== 'forgot' && (
            <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'bg-white text-primary-600 shadow-sm border border-primary-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white text-primary-600 shadow-sm border border-primary-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'signin' ? (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <p className="text-gray-600 text-center">Sign in to access your account</p>
                </div>
                <LoginForm onSuccess={onClose} />
                <div className="flex items-center justify-between text-sm mt-6 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('forgot')} 
                    className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                  <div className="text-gray-500">
                    New here?{' '}
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('signup')} 
                      className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200"
                    >
                      Create account
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'signup' ? (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <p className="text-gray-600 text-center">Join us today and get started</p>
                </div>
                <RegisterForm onSuccess={onClose} />
                <div className="text-center text-sm mt-6 pt-4 border-t border-gray-100">
                  <span className="text-gray-500">Already have an account?{' '}</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('signin')} 
                    className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200"
                  >
                    Sign in instead
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-600">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reset your password</h3>
                  <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>
                <ForgotPasswordForm />
                <div className="text-center text-sm mt-6 pt-4 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('signin')} 
                    className="text-primary-600 font-medium hover:text-primary-700 transition-colors duration-200 flex items-center justify-center mx-auto space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                    </svg>
                    <span>Back to sign in</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default AuthModal;
