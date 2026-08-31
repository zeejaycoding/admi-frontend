import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegion } from '../../context/RegionContext';
import { useTranslation } from 'react-i18next';
import useUrlLanguage from '../../hooks/useUrlLanguage';
import {
  User, CheckCircle, Loader2, ChevronDown,
  Monitor, GraduationCap, CreditCard, AlertCircle, Repeat, BadgeCheck, Landmark,
} from 'lucide-react';
import FormPhoneInput from '../forms/FormPhoneInput';
import FormLocationSelect from '../forms/FormLocationSelect';
import FormPaymentModal from '../forms/FormPaymentModal';
import useMinistryForm from '../../hooks/useMinistryForm';
import useMinistryFormSubmit from '../../hooks/useMinistryFormSubmit';
import { inp, inpErr, Label, ErrMsg, REGION_PHONE } from './shared/formPrimitives';
import { BANK_ACCOUNT } from './shared/bankDetails';

const AccSection = ({ number, title, description, icon: Icon, children, defaultOpen = false, hasError = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [innerOverflow, setInnerOverflow] = useState(defaultOpen ? 'visible' : 'hidden');
  const timerRef = useRef(null);

  useEffect(() => {
    if (hasError) setOpen(true);
  }, [hasError]);

  const toggle = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (open) {
      setInnerOverflow('hidden');
      setOpen(false);
    } else {
      setOpen(true);
      timerRef.current = setTimeout(() => setInnerOverflow('visible'), 320);
    }
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors rounded-xl"
      >
        <span className="w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-primary-600" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-gray-900 text-sm sm:text-base">{title}</span>
          {description && (
            <span className="block text-xs text-gray-500 mt-0.5 truncate">{description}</span>
          )}
        </span>
        <ChevronDown
          size={20}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 300ms ease',
        }}
      >
        <div style={{ overflow: innerOverflow }}>
          <div className="px-6 pb-8 pt-2 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const INIT = {
  firstName: '', lastName: '', email: '', phone: '',
  location: { countryCode: '', stateCode: '', city: '', postalCode: '', addressLine1: '', addressLine2: '' },
};

const AbelDaminaMentoringAcademyForm = () => {
  const { t } = useTranslation('ministryForms');
  useUrlLanguage();
  const { selectedRegion } = useRegion();
  const navigate = useNavigate();

  const regionCode   = selectedRegion?.code?.toUpperCase() || 'NG';
  const defaultPhone = REGION_PHONE[regionCode] || 'ng';

  const { formConfig, isLoading: configLoading, error: configError } = useMinistryForm('ABEL_DAMINA_MENTORING_ACADEMY');

  const [form,             setForm]            = useState(INIT);
  const [errors,           setErrors]          = useState({});
  const [submitting,       setSubmitting]      = useState(false);
  const [submitted,        setSubmitted]       = useState(false);
  const [submitError,      setSubmitError]     = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedPlan,     setSelectedPlan]    = useState(null);

  const { submitFree, submitBankTransfer } = useMinistryFormSubmit(formConfig?.id, setSubmitError, setSubmitting, t('common.somethingWentWrong'));

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fi      = (f) => errors[f] ? inpErr : inp;
  const clrErr  = (f) => setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  const set     = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); clrErr(f); };
  const setVal  = (f, v)    => { setForm((p) => ({ ...p, [f]: v })); clrErr(f); };

  const blurEmail = () => {
    const v = form.email.trim();
    if (v && !emailRe.test(v)) setErrors((p) => ({ ...p, email: 'Enter a valid email address' }));
  };

  const isPaid   = formConfig?.requiresPayment && parseFloat(formConfig?.paymentAmount || 0) > 0;
  const isNGN    = selectedCurrency === 'NGN';

  const USD_PLANS = [
    {
      id: 'ONE_OFF',
      label: t('adoma.planOneOffLabel'),
      amount: 200,
      currency: 'USD',
      display: '$200',
      description: t('adoma.planOneOffUsdDesc'),
      perks: [t('adoma.planOneOffPerk1'), t('adoma.planOneOffPerk2Usd'), t('adoma.planOneOffPerk3')],
      icon: BadgeCheck,
      highlight: true,
    },
    {
      id: 'QUARTERLY',
      label: t('adoma.planQuarterlyLabel'),
      amount: 60,
      currency: 'USD',
      display: '$60',
      description: t('adoma.planQuarterlyUsdDesc'),
      perks: [t('adoma.planQuarterlyPerk1'), t('adoma.planQuarterlyPerk2Usd'), t('adoma.planQuarterlyPerk3')],
      icon: Repeat,
      highlight: false,
    },
  ];

  const NGN_PLANS = [
    {
      id: 'ONE_OFF',
      label: t('adoma.planOneOffLabel'),
      amount: 200000,
      currency: 'NGN',
      display: '₦200,000',
      description: t('adoma.planOneOffNgnDesc'),
      perks: [t('adoma.planOneOffPerk1'), t('adoma.planOneOffPerk2Ngn'), t('adoma.planOneOffPerk3')],
      icon: BadgeCheck,
      highlight: true,
    },
    {
      id: 'QUARTERLY',
      label: t('adoma.planQuarterlyLabel'),
      amount: 60000,
      currency: 'NGN',
      display: '₦60,000',
      description: t('adoma.planQuarterlyNgnDesc'),
      perks: [t('adoma.planQuarterlyPerk1'), t('adoma.planQuarterlyPerk2Ngn'), t('adoma.planQuarterlyPerk3')],
      icon: Repeat,
      highlight: false,
    },
  ];

  const plans    = isNGN ? NGN_PLANS : USD_PLANS;
  const activePlan = plans.find((p) => p.id === selectedPlan);

  const PROGRAM_FEATURES = [
    t('adoma.featureLeadership'),
    t('adoma.featureOneOnOne'),
    t('adoma.featureGroupSessions'),
    t('adoma.featureSpiritualDev'),
  ];

  const handleCurrencyChange = (cur) => {
    setSelectedCurrency(cur);
    setSelectedPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!form.email.trim())     errs.email     = 'Email is required';
    else if (!emailRe.test(form.email)) errs.email = 'Enter a valid email address';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitError('Please fix the errors below before submitting.');
      return;
    }
    setErrors({});

    if (isPaid && !selectedPlan) {
      setSubmitError(t('adoma.errors.planRequired'));
      return;
    }

    const { location, ...rest } = form;
    const submissionData = {
      ...rest,
      country:      location.countryName  || '',
      state:        location.stateName    || '',
      city:         location.city         || '',
      postalCode:   location.postalCode   || '',
      addressLine1: location.addressLine1 || '',
      addressLine2: location.addressLine2 || '',
      paymentPlan: selectedPlan,
      paymentPlanLabel: activePlan?.label || '',
    };

    // NGN → bank transfer
    if (isPaid && isNGN) {
      const ok = await submitBankTransfer(submissionData, activePlan.amount, 'NGN');
      if (ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // USD → Stripe modal
    if (isPaid) {
      setPendingSubmission(submissionData);
      setPaymentModalOpen(true);
      return;
    }

    // Free submission
    const ok = await submitFree(submissionData);
    if (ok) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Success screen — NGN bank transfer
  if (submitted && isNGN && isPaid && activePlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('adoma.successBankTitle')}</h2>
          <p className="text-gray-600 mb-6 text-sm">
            {t('adoma.successBankMessage', { name: form.firstName })}
          </p>
          <div className="bg-[#1e3a5f] text-white rounded-xl p-5 mb-5 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4 flex items-center gap-2">
              <Landmark size={13} /> {t('common.bankTransferDetails')}
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-blue-200 text-xs">{t('common.bank')}</span>
                <span className="font-bold">{BANK_ACCOUNT.bank}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-blue-200 text-xs">{t('common.accountNumber')}</span>
                <span className="font-mono text-xl font-bold tracking-widest text-yellow-300">{BANK_ACCOUNT.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-xs">{t('common.amount')}</span>
                <span className="font-bold">{activePlan.display} NGN</span>
              </div>
            </div>
            <p className="text-[11px] text-blue-200 mt-4">
              {t('common.afterTransfer')}{' '}
              <span className="text-yellow-300 font-semibold">adoma@drabeldamina.org</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            {t('adoma.confirmationSent', { email: form.email })}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  // Success screen — Stripe / free
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('adoma.successTitle')}</h2>
          <p className="text-gray-600 mb-2">
            {t('adoma.successMessage', { name: form.firstName })}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {t('adoma.furtherDetails', { email: form.email })}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('adoma.title')}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('adoma.leadershipTraining')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('adoma.oneOnOneMentoring')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('adoma.onlineAndPhysical')}</span>
            <span className="text-white/30">|</span>
            <Link
              to="/mentoring-academy/honor-offering"
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
            >
              {t('common.honorOffering')}
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto px-4 py-10 space-y-4">

        {configError && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">{t('common.configError')}</p>
          </div>
        )}

        <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
          <span className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Monitor size={20} className="text-primary-600" />
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{t('common.onlineViaZoom')}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('common.zoomDescription')}</p>
          </div>
          <CheckCircle size={18} className="text-primary-500 ml-auto flex-shrink-0" />
        </div>

        <AccSection number="1" title={t('adoma.section1Title')} description={t('adoma.section1Desc')} icon={User} defaultOpen hasError={!!(errors.firstName || errors.lastName || errors.email)}>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>{t('common.firstName')}</Label>
                <input className={fi('firstName')} placeholder={t('common.firstPlaceholder')} value={form.firstName} onChange={set('firstName')} />
                <ErrMsg msg={errors.firstName} />
              </div>
              <div>
                <Label required>{t('common.lastName')}</Label>
                <input className={fi('lastName')} placeholder={t('common.lastPlaceholder')} value={form.lastName} onChange={set('lastName')} />
                <ErrMsg msg={errors.lastName} />
              </div>
            </div>
            <div>
              <Label required>{t('common.email')}</Label>
              <input type="email" className={fi('email')} placeholder={t('common.emailPlaceholder')} value={form.email} onChange={set('email')} onBlur={blurEmail} />
              <ErrMsg msg={errors.email} />
            </div>
            <div>
              <Label>{t('common.phone')}</Label>
              <FormPhoneInput
                value={form.phone}
                onChange={(val) => setVal('phone', val)}
                defaultCountry={defaultPhone}
                preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
              />
            </div>
            <FormLocationSelect
              value={form.location}
              onChange={(loc) => setVal('location', loc)}
            />
          </div>
        </AccSection>

        <AccSection number="2" title={t('adoma.section2Title')} description={t('adoma.section2Desc')} icon={GraduationCap} defaultOpen>
          <div className="pt-4">
            <div className="border border-gray-200 rounded-xl overflow-hidden">

              <div className="flex items-start gap-4 p-5 bg-gray-50 border-b border-gray-200">
                <div className="w-11 h-11 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={22} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{t('adoma.programName')}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{t('adoma.programDescription')}</p>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('adoma.whatsIncluded')}</p>
                <ul className="space-y-2">
                  {PROGRAM_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-primary-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {!configLoading && isPaid && (
                <div className="border-t border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('adoma.selectPlan')}</p>

                  <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
                    {[{ key: 'USD', label: t('common.currencyUsd') }, { key: 'NGN', label: t('common.currencyNgn') }].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleCurrencyChange(key)}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                          selectedCurrency === key
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plans.map((plan) => {
                      const PlanIcon = plan.icon;
                      const isSelected = selectedPlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`relative text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                            isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'
                          }`}
                        >
                          {plan.highlight && (
                            <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-0.5 rounded-full">
                              {t('common.bestValue')}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <PlanIcon size={16} className={isSelected ? 'text-primary-600' : 'text-gray-400'} />
                            <span className={`font-semibold text-sm ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                              {plan.label}
                            </span>
                          </div>
                          <p className={`text-lg font-bold mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                            {plan.display} <span className="text-xs font-normal text-gray-500">{plan.currency}</span>
                          </p>
                          <p className="text-xs text-gray-500 mb-3">{plan.description}</p>
                          <ul className="space-y-1">
                            {plan.perks.map((perk) => (
                              <li key={perk} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <CheckCircle size={11} className="text-primary-500 flex-shrink-0 mt-0.5" /> {perk}
                              </li>
                            ))}
                          </ul>
                          {isSelected && (
                            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-600">
                              <CheckCircle size={13} /> {t('common.selected')}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isNGN && selectedPlan && (
                    <div className="mt-4 bg-[#1e3a5f] text-white rounded-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-3 flex items-center gap-1.5">
                        <Landmark size={13} /> {t('common.bankTransferDetails')}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-blue-200 text-xs">{t('common.bank')}</span>
                          <span className="font-bold">{BANK_ACCOUNT.bank}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-blue-200 text-xs">{t('common.accountNumber')}</span>
                          <span className="font-mono font-bold tracking-widest text-yellow-300">{BANK_ACCOUNT.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-200 text-xs">{t('common.amount')}</span>
                          <span className="font-bold">{activePlan?.display} NGN</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-blue-200 mt-3">
                        {t('common.afterTransfer')}{' '}
                        <span className="text-yellow-300 font-semibold">adoma@drabeldamina.org</span>
                      </p>
                    </div>
                  )}

                  {!isNGN && selectedPlan && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <CreditCard size={15} className="text-yellow-600 flex-shrink-0" />
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">{activePlan?.label}: {activePlan?.display} USD</span>
                        {' '}— {t('common.stripeNotice')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </AccSection>

        {submitError && (
          <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {submitError}
          </p>
        )}

        <div className="pb-10 pt-2 space-y-3">
          <button
            type="submit"
            disabled={submitting || !formConfig?.id}
            className="w-full flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-60 shadow-lg hover:shadow-xl text-base"
          >
            {submitting
              ? <><Loader2 size={20} className="animate-spin" /> {t('common.submitting')}</>
              : isPaid && isNGN
                ? <><Landmark size={20} /> {selectedPlan ? t('common.registerAndPay', { amount: activePlan?.display }) : t('common.registerViaBankTransfer')}</>
                : isPaid
                  ? <><CreditCard size={20} /> {selectedPlan ? t('common.registerAndPay', { amount: activePlan?.display }) : t('common.registerAndProceed')}</>
                  : <><CheckCircle size={20} /> {t('discipleship.submitBtn')}</>
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            {t('common.wantToSupport')}{' '}
            <Link to="/mentoring-academy/honor-offering" className="text-purple-500 hover:text-purple-700 font-medium underline underline-offset-2">
              {t('common.honorOffering')}
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400">
            {t('common.disclaimerRegister')}
          </p>
        </div>

      </form>

      {!isNGN && (
        <FormPaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          form={formConfig}
          submissionData={pendingSubmission}
          overrideAmount={activePlan?.amount}
          overrideCurrency="USD"
        />
      )}

    </div>
  );
};

export default AbelDaminaMentoringAcademyForm;
