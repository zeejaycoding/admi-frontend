import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../context/RegionContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { API_BASE_URL } from '../constants/api';


const DonatePage = () => {
  const { t } = useTranslation('ui');
  const { selectedRegion, regions } = useRegion();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize offering type from URL parameter if present
  const getInitialOfferingType = () => {
    const queryParams = new URLSearchParams(location.search);
    const offeringTypeParam = queryParams.get('offeringType');
    const validOfferingTypes = ['HONOUR_OFFERING', 'MISSION_OFFERING', 'PARTNERSHIP_OFFERING', 'MEDIA_OFFERING'];
    return validOfferingTypes.includes(offeringTypeParam) ? offeringTypeParam : 'MISSION_OFFERING';
  };

  const [formData, setFormData] = useState({
    selectedRegion: selectedRegion.code !== 'NG' ? selectedRegion.code : '',
    offeringType: getInitialOfferingType()
  });

  // Separate form states for Stripe
  const [stripeEmail, setStripeEmail] = useState('');
  const [stripeAmount, setStripeAmount] = useState('50');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [stripeEmailError, setStripeEmailError] = useState('');

  // Separate form states for PayPal
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalAmount, setPaypalAmount] = useState('50');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState(null);
  const [paypalEmailError, setPaypalEmailError] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [success, setSuccess] = useState(null);

  // Payment method selection for US region
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // 'stripe' or 'paypal'

  // Email validation schema — recreated on each render so t() is always current
  const emailSchema = Yup.string()
    .email(t('donate.validEmail'))
    .required(t('donate.emailRequired'));

  // Dummy data for accounts by region
  const dummyData = useMemo(() => ({
    NG: {
      accounts: {
        HONOUR_OFFERING: [
          { id: 1, bank: 'FCMB', accountNumber: '0439000018', accountName: 'Damina Abel/ Rachel' }
        ],
        MISSION_OFFERING: [
           { id: 1, bank: 'FCMB', accountNumber: '0439000018', accountName: 'Damina Abel/ Rachel' }
        ],
        PARTNERSHIP_OFFERING: [
          { id: 1, bank: 'FCMB', accountNumber: '0439000018', accountName: 'Damina Abel/ Rachel' }
        ]
      }
    },
    US: {
      accounts: {
        HONOUR_OFFERING: [],
        MISSION_OFFERING: [],
        PARTNERSHIP_OFFERING: [],
        MEDIA_OFFERING: []
      }
    },
    UK: {
      accounts: {
        HONOUR_OFFERING: [],
        MISSION_OFFERING: [],
        PARTNERSHIP_OFFERING: []
      }
    },
    GH: {
      accounts: {
        HONOUR_OFFERING: [],
        MISSION_OFFERING: [],
        PARTNERSHIP_OFFERING: []
      }
    },
    ZA: {
      accounts: {
        HONOUR_OFFERING: [],
        MISSION_OFFERING: [],
        PARTNERSHIP_OFFERING: []
      }
    }
  }), []);

  // Handle PayPal return callback
  const handlePayPalReturn = useCallback(async (orderId) => {
    setPaypalLoading(true);
    setPaypalError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/donations/capture/${orderId}`);

      if (response.data.success) {
        const capturedAmount = response.data.data?.amount;
        const currency = response.data.data?.currency || 'USD';

        setSuccess(t('donate.paypalSuccess', { currency, amount: capturedAmount }));
        setPaypalError(null);

        // Reset both forms
        setStripeAmount('50');
        setStripeEmail('');
        setPaypalAmount('50');
        setPaypalEmail('');

        // Clean up URL - keep region parameter if present
        const currentParams = new URLSearchParams(location.search);
        const regionParam = currentParams.get('region');
        const cleanUrl = regionParam ? `/donate?region=${regionParam}` : '/donate';
        window.history.replaceState({}, document.title, cleanUrl);

        localStorage.removeItem('donation-region');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
          setSuccess(null);
        }, 10000);
      } else {
        setPaypalError(t('donate.captureError'));
      }
    } catch {
      setPaypalError(t('donate.captureFailure'));
    } finally {
      setPaypalLoading(false);
    }
  }, [t, location.search]);

  // Check URL parameters for success/cancelled status
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment');
    const success = queryParams.get('success');
    const cancelled = queryParams.get('cancelled');
    const token = queryParams.get('token');
    const sessionId = queryParams.get('session_id');

    // Handle Stripe success
    if (paymentStatus === 'success' && sessionId) {
      setSuccess(t('donate.stripeSuccess'));
      setStripeError(null);
      setPaypalError(null);

      setStripeAmount('50');
      setStripeEmail('');
      setPaypalAmount('50');
      setPaypalEmail('');

      const currentParams = new URLSearchParams(location.search);
      const regionParam = currentParams.get('region');
      const cleanUrl = regionParam ? `/donate?region=${regionParam}` : '/donate';
      window.history.replaceState({}, document.title, cleanUrl);

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setSuccess(null);
      }, 10000);

      return;
    }

    // Handle Stripe cancellation
    if (paymentStatus === 'cancelled') {
      setStripeError(t('donate.stripeCancelled'));

      const currentParams = new URLSearchParams(location.search);
      const regionParam = currentParams.get('region');
      const cleanUrl = regionParam ? `/donate?region=${regionParam}` : '/donate';
      window.history.replaceState({}, document.title, cleanUrl);

      return;
    }

    const hasRegionParam = queryParams.has('region');
    const savedRegion = localStorage.getItem('donation-region');

    if ((success === 'true' || cancelled === 'true') && !hasRegionParam && savedRegion && savedRegion !== 'NG') {
      const regionParam = `?region=${savedRegion}`;
      const statusParam = success === 'true' ? '&success=true' : '&cancelled=true';
      const tokenParam = token ? `&token=${token}` : '';
      navigate(`/donate${regionParam}${statusParam}${tokenParam}`, { replace: true });
      return;
    }

    if (success === 'true' && token) {
      handlePayPalReturn(token);
    } else if (cancelled === 'true') {
      setPaypalError(t('donate.paypalCancelled'));
    }
  }, [location.search, navigate, handlePayPalReturn, t]);

  // Keep donate page in sync whenever the header region switcher changes
  useEffect(() => {
    if (selectedRegion.code === 'NG') {
      setFormData(prev => ({ ...prev, selectedRegion: '', offeringType: 'MISSION_OFFERING' }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedRegion: selectedRegion.code,
        offeringType: prev.offeringType === 'MEDIA_OFFERING' && selectedRegion.code !== 'US'
          ? 'MISSION_OFFERING'
          : prev.offeringType,
      }));
    }
    setSelectedPaymentMethod(null);
  }, [selectedRegion.code]);

  // Update accounts when region or offering type changes
  useEffect(() => {
    const regionData = dummyData[formData.selectedRegion];
    if (regionData && regionData.accounts && regionData.accounts[formData.offeringType]) {
      setAccounts(regionData.accounts[formData.offeringType] || []);
    } else {
      setAccounts([]);
    }
  }, [formData.selectedRegion, formData.offeringType, dummyData]);

  const effectiveRegion = useMemo(
    () => regions.find(r => r.code === formData.selectedRegion) || selectedRegion,
    [regions, formData.selectedRegion, selectedRegion]
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'selectedRegion' && value !== 'US' && prev.offeringType === 'MEDIA_OFFERING') {
        next.offeringType = 'MISSION_OFFERING';
      }
      return next;
    });
    if (field === 'selectedRegion') setSelectedPaymentMethod(null);
    if (stripeError) setStripeError(null);
    if (paypalError) setPaypalError(null);
    if (success) setSuccess(null);
  };

  const handleStripeEmailChange = (value) => {
    setStripeEmail(value);
    setStripeError(null);
    setSuccess(null);
    emailSchema
      .validate(value)
      .then(() => setStripeEmailError(''))
      .catch((err) => setStripeEmailError(err.message));
  };

  const handlePaypalEmailChange = (value) => {
    setPaypalEmail(value);
    setPaypalError(null);
    setSuccess(null);
    emailSchema
      .validate(value)
      .then(() => setPaypalEmailError(''))
      .catch((err) => setPaypalEmailError(err.message));
  };

  const handleStripeCheckout = async () => {
    try {
      await emailSchema.validate(stripeEmail);
    } catch (err) {
      setStripeEmailError(err.message);
      setStripeError(t('donate.validEmail'));
      return;
    }

    if (!stripeAmount || parseFloat(stripeAmount) <= 0) {
      setStripeError(t('donate.invalidAmount'));
      return;
    }

    setStripeLoading(true);
    setStripeError(null);
    setSuccess(null);

    try {
      const baseUrl = window.location.origin;
      const regionParam = formData.selectedRegion && formData.selectedRegion !== 'NG' ? `?region=${formData.selectedRegion}` : '';
      const successUrl = `${baseUrl}/donate${regionParam}${regionParam ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/donate${regionParam}${regionParam ? '&' : '?'}payment=cancelled`;

      const requestData = {
        amount: parseFloat(stripeAmount),
        currency: 'USD',
        offeringType: formData.offeringType,
        donorEmail: stripeEmail,
        successUrl,
        cancelUrl
      };

      const response = await axios.post(`${API_BASE_URL}/donations/create-stripe-session`, requestData);

      if (response.data.success && response.data.data.sessionUrl) {
        window.location.href = response.data.data.sessionUrl;
      } else {
        setStripeError(t('donate.stripeSessionError'));
      }
    } catch (err) {
      setStripeError(err.response?.data?.message || t('donate.stripeProcessError'));
    } finally {
      setStripeLoading(false);
    }
  };

  const handleDonate = async () => {
    try {
      await emailSchema.validate(paypalEmail);
    } catch (err) {
      setPaypalEmailError(err.message);
      setPaypalError(t('donate.validEmail'));
      return;
    }

    if (!paypalAmount || parseFloat(paypalAmount) <= 0) {
      setPaypalError(t('donate.invalidAmount'));
      return;
    }

    setPaypalLoading(true);
    setPaypalError(null);
    setSuccess(null);

    try {
      const requestData = {
        amount: parseFloat(paypalAmount),
        currency: 'USD',
        offeringType: formData.offeringType,
        donorEmail: paypalEmail
      };

      const response = await axios.post(`${API_BASE_URL}/donations/create`, requestData);

      if (response.data.success && response.data.data.approvalUrl) {
        localStorage.setItem('donation-region', formData.selectedRegion);
        window.location.href = response.data.data.approvalUrl;
      } else {
        setPaypalError(t('donate.paypalOrderError'));
      }
    } catch (err) {
      setPaypalError(err.response?.data?.message || t('donate.paypalProcessError'));
    } finally {
      setPaypalLoading(false);
    }
  };

  const getHeaderContent = () => {
    const regionHeaders = {
      NG: {
        title: 'Abel Damina Ministries International (ADMI)',
        subtitle: 'Powercity International, Uyo - Headquarters'
      },
      US: {
        title: 'PowerCity International',
        subtitle: 'United States of America'
      },
      UK: {
        title: 'PowerCity International',
        subtitle: 'United Kingdom'
      },
      ZA: {
        title: 'PowerCity International',
        subtitle: 'South Africa'
      },
      GH: {
        title: 'PowerCity International',
        subtitle: 'Ghana'
      }
    };

    return regionHeaders[formData.selectedRegion] || { title: 'Abel Damina Ministries International', subtitle: '' };
  };

  const headerContent = getHeaderContent();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary-600 mb-4">
            {t('donate.giveTo')} {headerContent.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('donate.tagline')}
          </p>
          <div className="mt-6">
            <p className="text-xl font-semibold text-primary-600">
              {headerContent.subtitle}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-10">
          {/* Giving Options Form */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">
              {t('donate.selectGivingOptions')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('donate.selectYourRegion')}
                </label>
                <select
                  value={formData.selectedRegion}
                  onChange={(e) => handleInputChange('selectedRegion', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="">{t('donate.selectRegionPlaceholder')}</option>
                  {regions.map(r => (
                    <option key={r.code} value={r.code}>
                      {r.code === 'NG' ? '🇳🇬' : r.flag} {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Offering Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('donate.selectOfferingType')}
                </label>
                <select
                  value={formData.offeringType}
                  onChange={(e) => handleInputChange('offeringType', e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                >
                  <option value="MISSION_OFFERING">{t('donate.missionOffering')}</option>
                  <option value="HONOUR_OFFERING">
                    {formData.selectedRegion === 'US' ? t('donate.honorOffering') : t('donate.honourOffering')}
                  </option>
                  <option value="PARTNERSHIP_OFFERING">{t('donate.partnershipOffering')}</option>
                  {formData.selectedRegion === 'US' && (
                    <option value="MEDIA_OFFERING">{t('donate.mediaOffering')}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Payment section — only shown after a region is selected */}
          {!formData.selectedRegion && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-base">{t('donate.selectRegionFirst')}</p>
            </div>
          )}

          {formData.selectedRegion && (<>
          {/* Donation Options Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {formData.selectedRegion === 'US' ? t('donate.choosePaymentMethod') : t('donate.bankTransferDetails')}
            </h3>
            <p className="text-gray-600">
              {formData.selectedRegion === 'US'
                ? selectedPaymentMethod === 'stripe'
                  ? t('donate.paySecurelyStripe')
                  : selectedPaymentMethod === 'paypal'
                  ? t('donate.paySecurelyPaypal')
                  : t('donate.paySecurelyBoth')
                : t('donate.useBankDetails')
              }
            </p>
          </div>

          {/* For US Region: Payment Method Selection Cards */}
          {formData.selectedRegion === 'US' && !selectedPaymentMethod && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Stripe Card */}
              <button
                onClick={() => setSelectedPaymentMethod('stripe')}
                className="group relative bg-white border-2 border-purple-200 rounded-2xl p-8 hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Stripe</h4>
                  <p className="text-gray-600 mb-4">{t('donate.payWithCard')}</p>
                  <span className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold group-hover:bg-purple-700 transition-colors">
                    {t('donate.selectStripe')}
                  </span>
                </div>
              </button>

              {/* PayPal Card */}
              <button
                onClick={() => setSelectedPaymentMethod('paypal')}
                className="group relative bg-white border-2 border-blue-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.346-.297c-.652-.499-1.610-.91-2.87-1.255-.366-.1-.756-.177-1.16-.231-.404-.054-.83-.081-1.277-.081H9.614a.956.956 0 0 0-.944.81L7.17 12.025c-.058.37.234.71.61.71h3.674c3.375 0 5.867-1.37 6.555-5.33.18-1.04.086-1.9-.413-2.488z"/>
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">PayPal</h4>
                  <p className="text-gray-600 mb-4">{t('donate.payWithPaypal')}</p>
                  <span className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">
                    {t('donate.selectPaypal')}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Payment Forms Container */}
          <div className="max-w-2xl mx-auto">
            {/* Stripe Checkout Section */}
            {formData.selectedRegion === 'US' && selectedPaymentMethod === 'stripe' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
                  </svg>
                  {t('donate.onlinePaymentStripe')}
                </h3>
                <button
                  onClick={() => setSelectedPaymentMethod(null)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('donate.back')}
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6">
                {/* Email Field */}
                <div className="mb-6">
                  <label htmlFor="stripeEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('donate.emailAddress')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="stripeEmail"
                    name="stripe-email"
                    type="email"
                    autoComplete="off"
                    value={stripeEmail}
                    onChange={(e) => handleStripeEmailChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      stripeEmailError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                    required
                  />
                  {stripeEmailError && (
                    <p className="mt-2 text-sm text-red-600">{stripeEmailError}</p>
                  )}
                </div>

                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {t('donate.selectAmount')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {['25', '50', '100', '250', '500','1000'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setStripeAmount(amount)}
                        className={`px-3 py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                          stripeAmount === amount
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                    <div className="col-span-2 sm:col-span-3 mt-3">
                      <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border-2 focus-within:border-purple-500 transition-colors">
                        <span className="text-xl font-bold text-gray-900 min-w-fit">$</span>
                        <input
                          type="number"
                          value={stripeAmount}
                          onChange={(e) => setStripeAmount(e.target.value)}
                          min="1"
                          step="1"
                          className="flex-1 bg-transparent text-xl font-semibold text-gray-900 border-none focus:outline-none min-w-0"
                          placeholder={t('donate.enterAmount')}
                        />
                        <span className="text-gray-600 text-sm font-medium min-w-fit">USD</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-500 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong className="font-bold">{t('donate.successLabel')} </strong>
                      {success}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {stripeError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{stripeError}</p>
                  </div>
                )}

                {/* Donate Button */}
                <div className="border-t pt-6">
                  <button
                    onClick={handleStripeCheckout}
                    disabled={stripeLoading || !stripeEmail || stripeEmailError || !stripeAmount || parseFloat(stripeAmount) <= 0}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                      stripeLoading || !stripeEmail || stripeEmailError || !stripeAmount || parseFloat(stripeAmount) <= 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {stripeLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('donate.processing')}
                      </span>
                    ) : (
                      t('donate.giveWithStripe', { amount: stripeAmount || 0 })
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t('donate.secureStripe')}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-3 h-3 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t('donate.receiptEmail')}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* PayPal Section */}
            {formData.selectedRegion === 'US' && selectedPaymentMethod === 'paypal' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.346-.297c-.652-.499-1.610-.91-2.87-1.255-.366-.1-.756-.177-1.16-.231-.404-.054-.83-.081-1.277-.081H9.614a.956.956 0 0 0-.944.81L7.17 12.025c-.058.37.234.71.61.71h3.674c3.375 0 5.867-1.37 6.555-5.33.18-1.04.086-1.9-.413-2.488z"/>
                    </svg>
                    {t('donate.onlinePaymentPaypal')}
                  </h3>
                  <button
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('donate.back')}
                  </button>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6">
                  {/* Email Field */}
                  <div className="mb-6">
                    <label htmlFor="paypalEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('donate.emailAddress')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="paypalEmail"
                      name="paypal-email"
                      type="email"
                      autoComplete="off"
                      value={paypalEmail}
                      onChange={(e) => handlePaypalEmailChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        paypalEmailError ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                      required
                    />
                    {paypalEmailError && (
                      <p className="mt-2 text-sm text-red-600">{paypalEmailError}</p>
                    )}
                  </div>

                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t('donate.selectAmount')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {['25', '50', '100', '250', '500','1000', '2000', '5000', '10000'].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setPaypalAmount(amount)}
                          className={`px-3 py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                            paypalAmount === amount
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                      <div className="col-span-2 sm:col-span-3 mt-3">
                        <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border-2 focus-within:border-blue-500 transition-colors">
                          <span className="text-xl font-bold text-gray-900 min-w-fit">$</span>
                          <input
                            type="number"
                            value={paypalAmount}
                            onChange={(e) => setPaypalAmount(e.target.value)}
                            min="1"
                            step="1"
                            className="flex-1 bg-transparent text-xl font-semibold text-gray-900 border-none focus:outline-none min-w-0"
                            placeholder={t('donate.enterAmount')}
                          />
                          <span className="text-gray-600 text-sm font-medium min-w-fit">USD</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-500 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong className="font-bold">{t('donate.successLabel')} </strong>
                        {success}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {paypalError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{paypalError}</p>
                    </div>
                  )}

                  {/* Donate Button */}
                  <div className="border-t pt-6">
                    <button
                      onClick={handleDonate}
                      disabled={paypalLoading || !paypalEmail || paypalEmailError || !paypalAmount || parseFloat(paypalAmount) <= 0}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                        paypalLoading || !paypalEmail || paypalEmailError || !paypalAmount || parseFloat(paypalAmount) <= 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {paypalLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('donate.processing')}
                        </span>
                      ) : (
                        t('donate.giveWithPaypal', { amount: paypalAmount || 0 })
                      )}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('donate.securePayment')}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {t('donate.taxReceiptEmail')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Section - Show for non-US regions */}
            {formData.selectedRegion !== 'US' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 h-fit">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M7 15h1m4 0h1m4 0h1M8 3v4l-2-2m0 4l2-2 2 2M3 7h18M5 21V9.5M19 21V9.5" />
                  </svg>
                  {t('donate.bankTransfer')}
                </h3>

                {accounts.length > 0 ? (
                  <div className={`space-y-4 ${accounts.length > 1 ? 'max-h-96 overflow-y-auto' : ''}`}>
                    {accounts.map((account, index) => (
                      <div key={account.id} className="bg-white rounded-lg p-4 border">
                        {accounts.length > 1 && (
                          <h4 className="font-semibold text-gray-700 mb-3">
                            {t('donate.accountOption', { index: index + 1 })}
                          </h4>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">{t('donate.bank')}</p>
                              <p className="text-lg font-bold text-gray-900">{account.bank}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">{t('donate.accountNumber')}</p>
                              <p className="text-xl font-bold text-gray-900">{account.accountNumber}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600">{t('donate.accountName')}</p>
                              <p className="font-medium text-gray-900">{account.accountName}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('donate.comingSoon')}</h4>
                    <p className="text-base">
                      {t('donate.comingSoonDesc', { regionName: effectiveRegion.name })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          </>)}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
