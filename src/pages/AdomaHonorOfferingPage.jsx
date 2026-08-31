import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const STRIPE_AMOUNTS = ['25', '50', '100', '250', '500', '1000'];
const PAYPAL_AMOUNTS = ['25', '50', '100', '250', '500', '1000', '2000', '5000'];

const AdomaHonorOfferingPage = () => {
  const { t } = useTranslation('ministryForms');
  const location = useLocation();
  const navigate  = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState(null); // 'stripe' | 'paypal'

  // Stripe state
  const [stripeEmail,      setStripeEmail]      = useState('');
  const [stripeAmount,     setStripeAmount]     = useState('50');
  const [stripeLoading,    setStripeLoading]    = useState(false);
  const [stripeError,      setStripeError]      = useState(null);
  const [stripeEmailError, setStripeEmailError] = useState('');

  // PayPal state
  const [paypalEmail,      setPaypalEmail]      = useState('');
  const [paypalAmount,     setPaypalAmount]     = useState('50');
  const [paypalLoading,    setPaypalLoading]    = useState(false);
  const [paypalError,      setPaypalError]      = useState(null);
  const [paypalEmailError, setPaypalEmailError] = useState('');

  const [success, setSuccess] = useState(null);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Handle PayPal return (capture)
  const handlePayPalReturn = useCallback(async (orderId) => {
    setPaypalLoading(true);
    setPaypalError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/donations/capture/${orderId}`);
      if (res.data.success) {
        const captured  = res.data.data?.amount  || paypalAmount;
        const currency  = res.data.data?.currency || 'USD';
        setSuccess(t('adoma.successPaypal', { currency, amount: captured }));
        setPaypalAmount('50');
        setPaypalEmail('');
        window.history.replaceState({}, document.title, '/mentoring-academy/honor-offering');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccess(null), 10000);
      } else {
        setPaypalError(t('adoma.errors.capturePaymentFailed'));
      }
    } catch {
      setPaypalError(t('adoma.errors.completeOfferingFailed'));
    } finally {
      setPaypalLoading(false);
    }
  }, [paypalAmount]);

  // Handle URL params on mount (Stripe & PayPal returns)
  useEffect(() => {
    const params    = new URLSearchParams(location.search);
    const payment   = params.get('payment');
    const sessionId = params.get('session_id');
    const token     = params.get('token');
    const cancelled = params.get('cancelled');

    if (payment === 'success' && sessionId) {
      setSuccess(t('adoma.successStripe'));
      setStripeAmount('50');
      setStripeEmail('');
      window.history.replaceState({}, document.title, '/mentoring-academy/honor-offering');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(null), 10000);
      return;
    }

    if (payment === 'cancelled') {
      setStripeError(t('adoma.paymentCancelled'));
      window.history.replaceState({}, document.title, '/mentoring-academy/honor-offering');
      return;
    }

    if (token) {
      handlePayPalReturn(token);
    } else if (cancelled === 'true') {
      setPaypalError(t('adoma.offeringCancelled'));
    }
  }, [location.search, handlePayPalReturn]);

  const handleStripeCheckout = async () => {
    if (!validateEmail(stripeEmail)) {
      setStripeEmailError(t('adoma.errors.invalidEmail'));
      setStripeError(t('adoma.errors.invalidEmail'));
      return;
    }
    if (!stripeAmount || parseFloat(stripeAmount) <= 0) {
      setStripeError(t('adoma.errors.selectAmount'));
      return;
    }
    setStripeLoading(true);
    setStripeError(null);
    try {
      const base       = window.location.origin;
      const successUrl = `${base}/mentoring-academy/honor-offering?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl  = `${base}/mentoring-academy/honor-offering?payment=cancelled`;

      const res = await axios.post(`${API_BASE_URL}/donations/create-stripe-session`, {
        amount:       parseFloat(stripeAmount),
        currency:     'USD',
        offeringType: 'ADOMA_HONOUR_OFFERING',
        donorEmail:   stripeEmail,
        successUrl,
        cancelUrl,
      });

      if (res.data.success && res.data.data?.sessionUrl) {
        window.location.href = res.data.data.sessionUrl;
      } else {
        setStripeError(t('adoma.errors.stripeSessionFailed'));
      }
    } catch (err) {
      setStripeError(err.response?.data?.message || t('adoma.errors.processPaymentFailed'));
    } finally {
      setStripeLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    if (!validateEmail(paypalEmail)) {
      setPaypalEmailError(t('adoma.errors.invalidEmail'));
      setPaypalError(t('adoma.errors.invalidEmail'));
      return;
    }
    if (!paypalAmount || parseFloat(paypalAmount) <= 0) {
      setPaypalError(t('adoma.errors.selectAmount'));
      return;
    }
    setPaypalLoading(true);
    setPaypalError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/donations/create`, {
        amount:       parseFloat(paypalAmount),
        currency:     'USD',
        offeringType: 'ADOMA_HONOUR_OFFERING',
        donorEmail:   paypalEmail,
      });

      if (res.data.success && res.data.data?.approvalUrl) {
        window.location.href = res.data.data.approvalUrl;
      } else {
        setPaypalError(t('adoma.errors.paypalOrderFailed'));
      }
    } catch (err) {
      setPaypalError(err.response?.data?.message || t('adoma.errors.processOfferingFailed'));
    } finally {
      setPaypalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            {t('adoma.title')}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-primary-600 mb-4">{t('adoma.honorOfferingTitle')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('adoma.honorOfferingDesc')}
          </p>
        </div>

        {/* Global success banner */}
        {success && (
          <div className="mb-8 p-5 bg-green-50 border border-green-400 rounded-xl text-center">
            <p className="text-green-800 font-semibold">{success}</p>
            <button
              onClick={() => navigate('/mentoring-academy')}
              className="mt-3 text-sm text-primary-600 hover:underline font-medium"
            >
              {t('adoma.backToAdoma')}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">

          {/* Payment method selection */}
          {!selectedMethod && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">{t('adoma.choosePaymentMethod')}</h2>
              <p className="text-gray-500 text-center mb-8">{t('adoma.giveSecurely')}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Stripe */}
                <button
                  onClick={() => setSelectedMethod('stripe')}
                  className="group bg-white border-2 border-purple-200 rounded-2xl p-8 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Stripe</h4>
                  <p className="text-gray-500 text-sm mb-5">{t('adoma.creditDebitCard')}</p>
                  <span className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors text-sm">
                    {t('adoma.selectStripe')}
                  </span>
                </button>

                {/* PayPal */}
                <button
                  onClick={() => setSelectedMethod('paypal')}
                  className="group bg-white border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.346-.297c-.652-.499-1.610-.91-2.87-1.255-.366-.1-.756-.177-1.16-.231-.404-.054-.83-.081-1.277-.081H9.614a.956.956 0 0 0-.944.81L7.17 12.025c-.058.37.234.71.61.71h3.674c3.375 0 5.867-1.37 6.555-5.33.18-1.04.086-1.9-.413-2.488z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">PayPal</h4>
                  <p className="text-gray-500 text-sm mb-5">{t('adoma.paypalAccount')}</p>
                  <span className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors text-sm">
                    {t('adoma.selectPaypal')}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Stripe form */}
          {selectedMethod === 'stripe' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                  </svg>
                  {t('adoma.payWithStripe')}
                </h3>
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('adoma.back')}
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('adoma.emailAddress')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={stripeEmail}
                    onChange={(e) => {
                      setStripeEmail(e.target.value);
                      setStripeEmailError(validateEmail(e.target.value) ? '' : t('adoma.errors.invalidEmail'));
                      setStripeError(null);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${stripeEmailError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="you@example.com"
                  />
                  {stripeEmailError && <p className="mt-1 text-sm text-red-600">{stripeEmailError}</p>}
                </div>

                {/* Amounts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">{t('adoma.selectAmountUsd')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {STRIPE_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setStripeAmount(a)}
                        className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                          stripeAmount === a
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ${a}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border-2 focus-within:border-purple-500 transition-colors">
                    <span className="text-lg font-bold text-gray-900">$</span>
                    <input
                      type="number"
                      value={stripeAmount}
                      onChange={(e) => setStripeAmount(e.target.value)}
                      min="1"
                      className="flex-1 bg-transparent text-lg font-semibold text-gray-900 border-none focus:outline-none"
                      placeholder={t('adoma.customAmount')}
                    />
                    <span className="text-gray-500 text-sm">USD</span>
                  </div>
                </div>

                {stripeError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{stripeError}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <button
                    onClick={handleStripeCheckout}
                    disabled={stripeLoading || !stripeEmail || !!stripeEmailError || !stripeAmount || parseFloat(stripeAmount) <= 0}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      stripeLoading || !stripeEmail || !!stripeEmailError || !stripeAmount || parseFloat(stripeAmount) <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {stripeLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('adoma.processing')}
                      </span>
                    ) : (
                      t('adoma.giveWithStripe', { amount: stripeAmount || 0 })
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">{t('adoma.securePaymentNote')}</p>
              </div>
            </div>
          )}

          {/* PayPal form */}
          {selectedMethod === 'paypal' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.346-.297c-.652-.499-1.610-.91-2.87-1.255-.366-.1-.756-.177-1.16-.231-.404-.054-.83-.081-1.277-.081H9.614a.956.956 0 0 0-.944.81L7.17 12.025c-.058.37.234.71.61.71h3.674c3.375 0 5.867-1.37 6.555-5.33.18-1.04.086-1.9-.413-2.488z" />
                  </svg>
                  {t('adoma.payWithPaypal')}
                </h3>
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('adoma.back')}
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('adoma.emailAddress')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => {
                      setPaypalEmail(e.target.value);
                      setPaypalEmailError(validateEmail(e.target.value) ? '' : t('adoma.errors.invalidEmail'));
                      setPaypalError(null);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${paypalEmailError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="you@example.com"
                  />
                  {paypalEmailError && <p className="mt-1 text-sm text-red-600">{paypalEmailError}</p>}
                </div>

                {/* Amounts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">{t('adoma.selectAmountUsd')}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {PAYPAL_AMOUNTS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setPaypalAmount(a)}
                        className={`py-3 rounded-lg font-medium text-sm transition-colors ${
                          paypalAmount === a
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ${a}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border-2 focus-within:border-blue-500 transition-colors">
                    <span className="text-lg font-bold text-gray-900">$</span>
                    <input
                      type="number"
                      value={paypalAmount}
                      onChange={(e) => setPaypalAmount(e.target.value)}
                      min="1"
                      className="flex-1 bg-transparent text-lg font-semibold text-gray-900 border-none focus:outline-none"
                      placeholder={t('adoma.customAmount')}
                    />
                    <span className="text-gray-500 text-sm">USD</span>
                  </div>
                </div>

                {paypalError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{paypalError}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <button
                    onClick={handlePayPalCheckout}
                    disabled={paypalLoading || !paypalEmail || !!paypalEmailError || !paypalAmount || parseFloat(paypalAmount) <= 0}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      paypalLoading || !paypalEmail || !!paypalEmailError || !paypalAmount || parseFloat(paypalAmount) <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {paypalLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('adoma.processing')}
                      </span>
                    ) : (
                      t('adoma.giveWithPaypal', { amount: paypalAmount || 0 })
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">{t('adoma.securePaymentNote')}</p>
              </div>
            </div>
          )}

          {/* Back to ADOMA link */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/mentoring-academy')}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              {t('adoma.backToAdomaReg')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdomaHonorOfferingPage;
