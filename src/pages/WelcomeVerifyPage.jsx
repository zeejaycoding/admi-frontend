import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { notify } from '../services/utils/authUtils';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const WelcomeVerifyPage = ({ email: emailProp, inModal = false }) => {
  const query = useQuery();
  const email = emailProp || query.get('email') || '';
  const navigate = useNavigate();
  const { resendVerification, isLoading, user } = useAuth();
  const [resending, setResending] = useState(false);
  
  // Check if user is already verified
  const isAlreadyVerified = user?.isEmailVerified === true;

  return (
    <div className={inModal ? "" : "container mx-auto px-4 py-12"}>
      <div className={inModal ? "" : "max-w-2xl mx-auto bg-white rounded-xl shadow p-6 md:p-8"}>
        {isAlreadyVerified ? (
          <>
            <h1 className="text-2xl font-semibold mb-2">Email Verified Successfully!</h1>
            <p className="text-green-600 mb-4">Your email has been verified. Welcome to Power City International!</p>
            <p className="text-gray-600">You can now access all features of our platform including courses, events, and the store.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2">Welcome to Power City International</h1>
            <p className="text-gray-600">We just created your account.</p>
            <div className="mt-6 space-y-3">
              <p className="text-gray-700">
                To keep your account secure, please verify your email address. We sent a verification link to:
              </p>
              <div className="px-4 py-3 rounded-lg bg-primary-50 text-primary-700 inline-block">
                {email || 'your email'}
              </div>
              <p className="text-gray-600">Open your inbox and click the link. Once verified, you can start exploring courses, events and the store.</p>
            </div>
          </>
        )}
        {!isAlreadyVerified && !inModal && (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${email || ''}`}
              className="btn-primary"
            >
              Open Mail app
            </a>
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/')}
            >
              Go to home
            </button>
          </div>
        )}
        {!isAlreadyVerified && inModal && (
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${email || ''}`}
              className="btn-primary"
            >
              Open Mail app
            </a>
            <button
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/')}
            >
              Continue to site
            </button>
          </div>
        )}
        {isAlreadyVerified && (
          <div className="mt-8">
            <button
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Continue to Power City International
            </button>
          </div>
        )}
        {!isAlreadyVerified && (
          <div className="mt-6 text-xs text-gray-500">
            <p>Didn&apos;t receive the email? Check spam or{' '}
              <button 
                onClick={async () => {
                  if (!email || resending || isLoading) return;
                  setResending(true);
                  try {
                    const res = await resendVerification(email);
                    if (res?.meta?.requestStatus === 'fulfilled') {
                      notify.success('Verification email resent! Check your inbox.');
                    } else {
                      // Don't show error here - it's handled by the auth slice
                    }
                  } catch (error) {
                    // Error handling is done in auth slice
                  } finally {
                    setResending(false);
                  }
                }}
                disabled={!email || resending || isLoading}
                className="text-primary-600 hover:text-primary-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'resending...' : 'resend verification email'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeVerifyPage;


