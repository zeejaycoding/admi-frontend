import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import apiClient from '../services/utils/apiClient';

const MAX_POLLS = 8;
const POLL_INTERVAL_MS = 3000;

const FormPaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [submission, setSubmission] = useState(null);
  const pollCount = useRef(0);
  const timerRef = useRef(null);

  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data } = await apiClient.get(`/forms/submission/by-session/${sessionId}`);
        setSubmission(data);

        if (data.paymentStatus === 'COMPLETED') {
          setStatus('success');
          return;
        }

        // Still pending — retry up to MAX_POLLS times
        pollCount.current += 1;
        if (pollCount.current < MAX_POLLS) {
          timerRef.current = setTimeout(fetchStatus, POLL_INTERVAL_MS);
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('error');
      }
    };

    fetchStatus();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying your payment...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t verify your registration. If payment was taken, please contact{' '}
            <a href="mailto:adoma@drabeldamina.org" className="text-primary-600 underline">
              adoma@drabeldamina.org
            </a>
            .
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Processing</h2>
          <p className="text-gray-600 mb-6">
            Your payment was received but is still being confirmed. You&apos;ll receive a
            confirmation email once it&apos;s complete. If you don&apos;t hear from us within 24 hours,
            please contact{' '}
            <a href="mailto:adoma@drabeldamina.org" className="text-primary-600 underline">
              adoma@drabeldamina.org
            </a>
            .
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors w-full"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Confirmed!</h2>
        {submission?.formTitle && (
          <p className="text-gray-500 mb-2 text-sm">{submission.formTitle}</p>
        )}
        <p className="text-gray-600 mb-6">
          Your payment has been received and your registration is confirmed. Check your
          email for details.
        </p>
        {submission?.paymentAmount && (
          <p className="text-sm text-gray-500 mb-6">
            Amount paid: {submission.paymentCurrency}{' '}
            {Number.parseFloat(submission.paymentAmount).toFixed(2)}
          </p>
        )}
        <button
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors w-full"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FormPaymentSuccessPage;
