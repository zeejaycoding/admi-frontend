import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegion } from '../../context/RegionContext';
import { useTranslation } from 'react-i18next';
import useUrlLanguage from '../../hooks/useUrlLanguage';
import {
  User, BookOpen, Heart, Users,
  CheckCircle, Loader2, ChevronDown,
  Monitor, MapPin, CreditCard, AlertCircle, Landmark,
} from 'lucide-react';
import FormPhoneInput from '../forms/FormPhoneInput';
import FormLocationSelect from '../forms/FormLocationSelect';
import FormPaymentModal from '../forms/FormPaymentModal';
import useMinistryForm from '../../hooks/useMinistryForm';
import useMinistryFormSubmit from '../../hooks/useMinistryFormSubmit';
import { inp, inpErr, Label, ErrMsg, RadioOpt, REGION_PHONE } from './shared/formPrimitives';
import { BANK_ACCOUNT } from './shared/bankDetails';

const AccSection = ({ number, title, description, icon: Icon, children, defaultOpen = false, hasError = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (hasError) setOpen(true);
  }, [hasError]);
  const [innerOverflow, setInnerOverflow] = useState(defaultOpen ? 'visible' : 'hidden');
  const timerRef = useRef(null);

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

const HEAR_ABOUT_KEYS = [
  { key: 'socialMedia',     value: 'Social Media' },
  { key: 'friendFamily',    value: 'Friend / Family' },
  { key: 'churchCampus',    value: 'Church / Campus' },
  { key: 'pciWebsite',      value: 'PCI Website' },
  { key: 'emailNewsletter', value: 'Email Newsletter' },
  { key: 'youtubePodcast',  value: 'YouTube / Podcast' },
  { key: 'other',           value: 'Other' },
];

// Pricing matrix: [attendanceType][currency] → { amount, display }
const PRICES = {
  Online:   { USD: { amount: 300,    display: '$300'      }, NGN: { amount: 300000, display: '₦300,000' } },
  Physical: { USD: { amount: 100,    display: '$100'      }, NGN: { amount: 100000, display: '₦100,000' } },
};

const INIT = {
  firstName: '', middleName: '', lastName: '',
  gender: '', dateOfBirth: '',
  address: { countryCode: '', stateCode: '', city: '', postalCode: '', addressLine1: '', addressLine2: '' },
  nationality: '', idPassport: '',
  email: '', phone: '',
  nextOfKin: '', emergencyPhone: '',
  bornAgain: '', bornAgainWhen: '',
  vision: '', heardAboutPbs: '',
  maritalStatus: '',
  spouseName: '', spouseGender: '', spousePlaceOfBirth: '',
  spouseDateOfBirth: '', spouseNationality: '', spouseIdPassport: '',
  spouseEmail: '', spousePhone: '',
  refName: '', refEmail: '', refPhone: '', refAddress: '',
  attendanceType: '',
};

const PowerBibleSchool = () => {
  const { t } = useTranslation('ministryForms');
  useUrlLanguage();
  const { selectedRegion } = useRegion();
  const navigate           = useNavigate();

  const regionCode   = selectedRegion?.code?.toUpperCase() || 'NG';
  const defaultPhone = REGION_PHONE[regionCode] || 'ng';

  const { formConfig, isLoading: configLoading, error: configError } = useMinistryForm('POWER_BIBLE_SCHOOL');

  const [form,              setForm]             = useState(INIT);
  const [errors,            setErrors]           = useState({});
  const [submitting,        setSubmitting]       = useState(false);
  const [submitted,         setSubmitted]        = useState(false);
  const [submitError,       setSubmitError]      = useState('');
  const [paymentModalOpen,  setPaymentModalOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [selectedCurrency,  setSelectedCurrency] = useState('USD');

  const { submitFree, submitBankTransfer } = useMinistryFormSubmit(formConfig?.id, setSubmitError, setSubmitting, t('common.somethingWentWrong'));

  const fi     = (f) => errors[f] ? inpErr : inp;
  const clrErr = (f) => setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  const set    = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); clrErr(f); };
  const setVal = (f, v)    => { setForm((p) => ({ ...p, [f]: v })); clrErr(f); };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // onBlur validators — catch format issues as soon as the user leaves a field
  const blurEmail = (f) => () => {
    const v = form[f]?.trim();
    if (v && !emailRe.test(v)) setErrors((p) => ({ ...p, [f]: 'Enter a valid email address' }));
  };
  const blurNationality = (f) => () => {
    const v = form[f]?.trim();
    if (!v) return;
    if (emailRe.test(v))        setErrors((p) => ({ ...p, [f]: 'Nationality should be a country, not an email address' }));
    else if (/[@\d]/.test(v))   setErrors((p) => ({ ...p, [f]: 'Nationality should only contain letters (e.g. Nigerian, British)' }));
  };

  const isPaid  = formConfig?.requiresPayment && parseFloat(formConfig?.paymentAmount || 0) > 0;
  const isNGN   = selectedCurrency === 'NGN';

  const activePricing = form.attendanceType && PRICES[form.attendanceType]
    ? PRICES[form.attendanceType][selectedCurrency]
    : null;

  const handleCurrencyChange = (cur) => setSelectedCurrency(cur);

  const validate = () => {
    const e = {};
    const hasEmail = (v) => emailRe.test(v?.trim());

    // Section 1
    if (!form.firstName.trim())   e.firstName = 'First name is required';
    if (!form.lastName.trim())    e.lastName  = 'Last name is required';
    if (!form.gender)             e.gender    = 'Please select your gender';
    if (!form.dateOfBirth)        e.dateOfBirth = 'Date of birth is required';
    if (!form.nationality.trim()) {
      e.nationality = 'Nationality is required';
    } else if (hasEmail(form.nationality)) {
      e.nationality = 'Nationality should be a country, not an email address';
    } else if (/[@\d]/.test(form.nationality)) {
      e.nationality = 'Nationality should only contain letters (e.g. Nigerian, British)';
    }
    if (!form.email.trim())       e.email = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone || form.phone.trim().length < 7) e.phone = 'Phone number is required';
    if (!form.nextOfKin.trim())   e.nextOfKin = 'Next of kin is required';
    if (!form.emergencyPhone || form.emergencyPhone.trim().length < 7) e.emergencyPhone = 'Emergency phone is required';

    // Section 2
    if (!form.vision.trim())       e.vision = 'Please share your vision';
    if (!form.heardAboutPbs)       e.heardAboutPbs = 'Please tell us how you heard about PBS';

    // Section 3
    if (!form.maritalStatus)       e.maritalStatus = 'Please select your marital status';
    if (['Married', 'Engaged'].includes(form.maritalStatus)) {
      if (form.spouseEmail && !emailRe.test(form.spouseEmail)) e.spouseEmail = 'Enter a valid spouse email';
      if (form.spouseNationality && hasEmail(form.spouseNationality)) e.spouseNationality = 'Spouse nationality should be a country, not an email';
    }

    // Section 4
    if (!form.refName.trim())      e.refName  = 'Referee name is required';
    if (!form.refEmail.trim())     e.refEmail = 'Referee email is required';
    else if (!emailRe.test(form.refEmail)) e.refEmail = 'Enter a valid referee email';
    if (!form.refPhone || form.refPhone.trim().length < 7) e.refPhone = 'Referee phone is required';

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!form.attendanceType) { setSubmitError(t('pbs.errors.attendanceRequired')); return; }
    if (isPaid && !activePricing) { setSubmitError(t('pbs.errors.attendanceFeeRequired')); return; }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Please fix the errors below before submitting.');
      return;
    }
    setErrors({});

    const { address, ...rest } = form;
    const submissionData = {
      ...rest,
      country:      address.countryName  || '',
      state:        address.stateName    || '',
      city:         address.city         || '',
      postalCode:   address.postalCode   || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      paymentPlanLabel: form.attendanceType === 'Online' ? 'Online via Zoom' : 'On-Site in Uyo',
    };

    // NGN → bank transfer
    if (isPaid && isNGN) {
      const ok = await submitBankTransfer(submissionData, activePricing.amount, 'NGN');
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
  if (submitted && isNGN && isPaid && activePricing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('pbs.successBankTitle')}</h2>
          <p className="text-gray-600 mb-6 text-sm">
            {t('pbs.successBankMessage', { name: form.firstName })}
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
              <div className="flex justify-between border-b border-white/10 pb-2.5">
                <span className="text-blue-200 text-xs">{t('common.attendance')}</span>
                <span className="font-bold">
                  {form.attendanceType === 'Online' ? t('pbs.onlineLabel') : t('pbs.onSiteUyo')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200 text-xs">{t('common.amount')}</span>
                <span className="font-bold">{activePricing.display} NGN</span>
              </div>
            </div>
            <p className="text-[11px] text-blue-200 mt-4">
              {t('common.afterTransfer')}{' '}
              <span className="text-yellow-300 font-semibold">powerbibleschool@drabeldamina.org</span>
            </p>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            {t('pbs.confirmationSent', { email: form.email })}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('pbs.successTitle')}</h2>
          <p className="text-gray-600 mb-2">
            {t('pbs.successMessage', { name: form.firstName })}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {t('pbs.confirmationWillBeSent', { email: form.email })}
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

  const isMarried   = ['Married', 'Engaged'].includes(form.maritalStatus);
  const isBornAgain = form.bornAgain === 'Yes';

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            <span>{selectedRegion?.flag}</span>
            <span>{t('pbs.badge', { region: selectedRegion?.name })}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('pbs.title')}
          </h1>
          <p className="text-primary-100 max-w-xl mx-auto leading-relaxed text-sm md:text-base mb-8">
            {t('pbs.description')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('pbs.onlineOrPhysical')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('pbs.confirmationByEmail')}</span>
            <span className="text-white/30">|</span>
            <Link
              to="/power-bible-school/honor-offering"
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs px-3 py-1.5 rounded-full transition-colors duration-200"
            >
              {t('common.honorOffering')}
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="max-w-3xl mx-auto px-4 py-10 space-y-4">

        {/* Attendance type selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {t('pbs.howWillYouAttend')} <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => setVal('attendanceType', 'Online')}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                form.attendanceType === 'Online'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                form.attendanceType === 'Online' ? 'bg-primary-500' : 'bg-gray-100'
              }`}>
                <Monitor size={18} className={form.attendanceType === 'Online' ? 'text-white' : 'text-gray-500'} />
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${form.attendanceType === 'Online' ? 'text-primary-700' : 'text-gray-800'}`}>
                  {t('pbs.onlineLabel')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t('pbs.onlineDesc')}</p>
              </div>
              {form.attendanceType === 'Online' && (
                <CheckCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setVal('attendanceType', 'Physical')}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                form.attendanceType === 'Physical'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                form.attendanceType === 'Physical' ? 'bg-primary-500' : 'bg-gray-100'
              }`}>
                <MapPin size={18} className={form.attendanceType === 'Physical' ? 'text-white' : 'text-gray-500'} />
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${form.attendanceType === 'Physical' ? 'text-primary-700' : 'text-gray-800'}`}>
                  {t('pbs.physicalLabel')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t('pbs.physicalDesc')}</p>
              </div>
              {form.attendanceType === 'Physical' && (
                <CheckCircle size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
              )}
            </button>

          </div>
        </div>

        {/* Pricing card */}
        {!configLoading && isPaid && form.attendanceType && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">{t('common.registrationFee')}</p>

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
              {[
                { type: 'Online',   labelKey: 'pbs.onlineLabel',  Icon: Monitor },
                { type: 'Physical', labelKey: 'pbs.onSiteUyo',    Icon: MapPin  },
              ].map(({ type, labelKey, Icon }) => {
                const pricing   = PRICES[type][selectedCurrency];
                const isActive  = form.attendanceType === type;
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                      isActive ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`}>
                      <Icon size={17} className={isActive ? 'text-white' : 'text-gray-400'} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${isActive ? 'text-primary-700' : 'text-gray-500'}`}>{t(labelKey)}</p>
                      <p className={`text-lg font-bold ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                        {pricing.display} <span className="text-xs font-normal">{selectedCurrency}</span>
                      </p>
                    </div>
                    {isActive && <CheckCircle size={16} className="text-primary-500 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            {activePricing && (
              <div className="mt-4">
                {isNGN ? (
                  <div className="flex items-start gap-2.5 bg-[#1e3a5f] text-white rounded-xl p-4">
                    <Landmark size={15} className="text-blue-300 flex-shrink-0 mt-0.5" />
                    <div className="text-sm space-y-1.5">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-300">{t('common.bankTransferDetails')}</p>
                      <div className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-blue-200 text-xs">{t('common.bank')}</span>
                        <span className="font-bold text-sm">{BANK_ACCOUNT.bank}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-1.5">
                        <span className="text-blue-200 text-xs">{t('common.accountNumber')}</span>
                        <span className="font-mono font-bold tracking-widest text-yellow-300">{BANK_ACCOUNT.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200 text-xs">{t('common.amount')}</span>
                        <span className="font-bold">{activePricing.display} NGN</span>
                      </div>
                      <p className="text-[11px] text-blue-200 pt-1">
                        {t('common.afterTransfer')}{' '}
                        <span className="text-yellow-300 font-semibold">powerbibleschool@drabeldamina.org</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <CreditCard size={15} className="text-yellow-600 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      <span className="font-semibold">{activePricing.display} USD</span>
                      {' '}— {t('common.stripeNotice')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {configError && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">{t('common.configError')}</p>
          </div>
        )}

        <AccSection
          number="1"
          title={t('pbs.section1Title')}
          description={t('pbs.section1Desc')}
          icon={User}
          defaultOpen
          hasError={!!(errors.firstName || errors.lastName || errors.gender || errors.dateOfBirth || errors.nationality || errors.email || errors.phone || errors.nextOfKin || errors.emergencyPhone)}
        >
          <div className="space-y-5 pt-4">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label required>{t('common.firstName')}</Label>
                <input className={fi('firstName')} placeholder={t('common.firstPlaceholder')} value={form.firstName} onChange={set('firstName')} />
                <ErrMsg msg={errors.firstName} />
              </div>
              <div>
                <Label>{t('common.middleName')}</Label>
                <input className={inp} placeholder={t('common.middlePlaceholder')} value={form.middleName} onChange={set('middleName')} />
              </div>
              <div>
                <Label required>{t('common.lastName')}</Label>
                <input className={fi('lastName')} placeholder={t('common.lastPlaceholder')} value={form.lastName} onChange={set('lastName')} />
                <ErrMsg msg={errors.lastName} />
              </div>
            </div>

            <div>
              <Label required>{t('common.gender')}</Label>
              <div className="flex items-center gap-6 mt-1">
                <RadioOpt name="gender" value="Female" label={t('common.female')} checked={form.gender === 'Female'} onChange={set('gender')} />
                <RadioOpt name="gender" value="Male"   label={t('common.male')}   checked={form.gender === 'Male'}   onChange={set('gender')} />
              </div>
              <ErrMsg msg={errors.gender} />
            </div>

            <div>
              <Label required>{t('common.dateOfBirth')}</Label>
              <input type="date" className={fi('dateOfBirth')} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              <ErrMsg msg={errors.dateOfBirth} />
            </div>

            <FormLocationSelect
              value={form.address}
              onChange={(loc) => setVal('address', loc)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>{t('pbs.nationality')}</Label>
                <input className={fi('nationality')} placeholder={t('pbs.nationalityPlaceholder')} value={form.nationality} onChange={set('nationality')} onBlur={blurNationality('nationality')} />
                <ErrMsg msg={errors.nationality} />
              </div>
              <div>
                <Label>{t('pbs.idPassport')} <span className="text-gray-400 font-normal text-xs">{t('common.optional')}</span></Label>
                <input className={inp} placeholder="A12345678" value={form.idPassport} onChange={set('idPassport')} />
              </div>
            </div>

            <div>
              <Label required>{t('common.email')}</Label>
              <input type="email" className={fi('email')} placeholder={t('common.emailPlaceholder')} value={form.email} onChange={set('email')} onBlur={blurEmail('email')} />
              <ErrMsg msg={errors.email} />
            </div>

            <div>
              <Label required>{t('common.phone')}</Label>
              <FormPhoneInput
                value={form.phone}
                onChange={(val) => setVal('phone', val)}
                defaultCountry={defaultPhone}
                preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
              />
              <ErrMsg msg={errors.phone} />
            </div>

            <div>
              <Label required>{t('pbs.nextOfKin')}</Label>
              <input className={fi('nextOfKin')} placeholder={t('pbs.nextOfKinPlaceholder')} value={form.nextOfKin} onChange={set('nextOfKin')} />
              <ErrMsg msg={errors.nextOfKin} />
            </div>

            <div>
              <Label required>{t('pbs.emergencyPhone')}</Label>
              <FormPhoneInput
                value={form.emergencyPhone}
                onChange={(val) => setVal('emergencyPhone', val)}
                defaultCountry={defaultPhone}
                preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
              />
              <ErrMsg msg={errors.emergencyPhone} />
            </div>

          </div>
        </AccSection>

        <AccSection
          number="2"
          title={t('pbs.section2Title')}
          description={t('pbs.section2Desc')}
          icon={BookOpen}
          hasError={!!(errors.vision || errors.heardAboutPbs)}
        >
          <div className="space-y-5 pt-4">

            <div>
              <Label>{t('pbs.bornAgain')}</Label>
              <div className="flex items-center gap-6 mt-1">
                <RadioOpt name="bornAgain" value="Yes" label={t('common.yes')} checked={form.bornAgain === 'Yes'} onChange={set('bornAgain')} />
                <RadioOpt name="bornAgain" value="No"  label={t('common.no')}  checked={form.bornAgain === 'No'}  onChange={set('bornAgain')} />
              </div>
            </div>

            {isBornAgain && (
              <div>
                <Label required>{t('pbs.bornAgainWhen')}</Label>
                <input
                  className={inp}
                  placeholder={t('pbs.bornAgainWhenPlaceholder')}
                  value={form.bornAgainWhen}
                  onChange={set('bornAgainWhen')}
                />
              </div>
            )}

            <div>
              <Label required>{t('pbs.vision')}</Label>
              <textarea
                rows={4}
                className={`${fi('vision')} resize-none`}
                placeholder={t('pbs.visionPlaceholder')}
                value={form.vision}
                onChange={set('vision')}
              />
              <ErrMsg msg={errors.vision} />
            </div>

            <div>
              <Label required>{t('pbs.heardAbout')}</Label>
              <select className={fi('heardAboutPbs')} value={form.heardAboutPbs} onChange={set('heardAboutPbs')}>
                <option value="">{t('common.selectOption')}</option>
                {HEAR_ABOUT_KEYS.map(({ key, value }) => (
                  <option key={value} value={value}>{t(`pbs.hearAbout.${key}`)}</option>
                ))}
              </select>
              <ErrMsg msg={errors.heardAboutPbs} />
            </div>

          </div>
        </AccSection>

        <AccSection
          number="3"
          title={t('pbs.section3Title')}
          description={t('pbs.section3Desc')}
          icon={Heart}
          hasError={!!(errors.maritalStatus || errors.spouseEmail || errors.spouseNationality)}
        >
          <div className="space-y-5 pt-4">

            <div>
              <Label required>{t('common.maritalStatus')}</Label>
              <select className={fi('maritalStatus')} value={form.maritalStatus} onChange={set('maritalStatus')}>
                <option value="">{t('common.selectStatus')}</option>
                <option value="Single">{t('common.single')}</option>
                <option value="Married">{t('common.married')}</option>
                <option value="Engaged">{t('common.engaged')}</option>
                <option value="Divorced">{t('common.divorced')}</option>
                <option value="Widowed">{t('common.widowed')}</option>
              </select>
              <ErrMsg msg={errors.maritalStatus} />
            </div>

            {isMarried && (
              <>
                <div>
                  <Label>{t('pbs.spouseName')}</Label>
                  <input className={inp} placeholder="Full name" value={form.spouseName} onChange={set('spouseName')} />
                </div>

                <div>
                  <Label>{t('common.spouseGender')}</Label>
                  <div className="flex items-center gap-6 mt-1">
                    <RadioOpt name="spouseGender" value="Female" label={t('common.female')} checked={form.spouseGender === 'Female'} onChange={set('spouseGender')} />
                    <RadioOpt name="spouseGender" value="Male"   label={t('common.male')}   checked={form.spouseGender === 'Male'}   onChange={set('spouseGender')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pbs.spousePlaceOfBirth')}</Label>
                    <input className={inp} placeholder={t('pbs.spousePlaceOfBirthPlaceholder')} value={form.spousePlaceOfBirth} onChange={set('spousePlaceOfBirth')} />
                  </div>
                  <div>
                    <Label>{t('common.spouseDateOfBirth')}</Label>
                    <input type="date" className={inp} value={form.spouseDateOfBirth} onChange={set('spouseDateOfBirth')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('pbs.spouseNationality')}</Label>
                    <input className={fi('spouseNationality')} placeholder={t('pbs.spouseNationalityPlaceholder')} value={form.spouseNationality} onChange={set('spouseNationality')} onBlur={blurNationality('spouseNationality')} />
                    <ErrMsg msg={errors.spouseNationality} />
                  </div>
                  <div>
                    <Label>{t('pbs.spouseIdPassport')}</Label>
                    <input className={inp} placeholder="A12345678" value={form.spouseIdPassport} onChange={set('spouseIdPassport')} />
                  </div>
                </div>

                <div>
                  <Label>{t('common.spouseEmail')}</Label>
                  <input type="email" className={fi('spouseEmail')} placeholder="spouse@example.com" value={form.spouseEmail} onChange={set('spouseEmail')} onBlur={blurEmail('spouseEmail')} />
                  <ErrMsg msg={errors.spouseEmail} />
                </div>
                <div>
                  <Label>{t('common.spousePhone')}</Label>
                  <FormPhoneInput
                    value={form.spousePhone}
                    onChange={(val) => setVal('spousePhone', val)}
                    defaultCountry={defaultPhone}
                    preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
                  />
                </div>
              </>
            )}

          </div>
        </AccSection>

        <AccSection
          number="4"
          title={t('pbs.section4Title')}
          description={t('pbs.section4Desc')}
          icon={Users}
          hasError={!!(errors.refName || errors.refEmail || errors.refPhone)}
        >
          <div className="space-y-5 pt-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>{t('pbs.refName')}</Label>
                <input className={fi('refName')} placeholder="Full name" value={form.refName} onChange={set('refName')} />
                <ErrMsg msg={errors.refName} />
              </div>
              <div>
                <Label required>{t('pbs.refEmail')}</Label>
                <input type="email" className={fi('refEmail')} placeholder={t('pbs.refEmailPlaceholder')} value={form.refEmail} onChange={set('refEmail')} onBlur={blurEmail('refEmail')} />
                <ErrMsg msg={errors.refEmail} />
              </div>
            </div>

            <div>
              <Label required>{t('pbs.refPhone')}</Label>
              <FormPhoneInput
                value={form.refPhone}
                onChange={(val) => setVal('refPhone', val)}
                defaultCountry={defaultPhone}
                preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
              />
              <ErrMsg msg={errors.refPhone} />
            </div>
            <div>
              <Label>{t('pbs.refAddress')}</Label>
              <input className={inp} placeholder={t('pbs.refAddressPlaceholder')} value={form.refAddress} onChange={set('refAddress')} />
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
            {submitting ? (
              <><Loader2 size={20} className="animate-spin" /> {t('pbs.submittingBtn')}</>
            ) : isPaid && isNGN ? (
              <><Landmark size={20} /> {activePricing ? t('pbs.registerAndPay', { amount: activePricing.display }) : t('pbs.registerViaBankTransfer')}</>
            ) : isPaid ? (
              <><CreditCard size={20} /> {activePricing ? t('pbs.registerAndPay', { amount: activePricing.display }) : t('pbs.registerAndProceed')}</>
            ) : (
              <><CheckCircle size={20} /> {t('pbs.submitBtn')}</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400">
            {t('common.disclaimerSubmit')}
          </p>
          <p className="text-center text-xs text-gray-400">
            {t('common.wantToSupport')}{' '}
            <Link to="/power-bible-school/honor-offering" className="text-purple-500 hover:text-purple-700 font-medium underline underline-offset-2">
              {t('common.honorOffering')}
            </Link>
          </p>
        </div>

      </form>

      {!isNGN && (
        <FormPaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          form={formConfig}
          submissionData={pendingSubmission}
          overrideAmount={activePricing?.amount}
          overrideCurrency="USD"
        />
      )}

    </div>
  );
};

export default PowerBibleSchool;
