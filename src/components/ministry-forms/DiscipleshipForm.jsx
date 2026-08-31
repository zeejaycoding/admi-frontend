import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegion } from '../../context/RegionContext';
import { useTranslation } from 'react-i18next';
import useUrlLanguage from '../../hooks/useUrlLanguage';
import {
  User, CheckCircle, Loader2, ChevronDown, Video, AlertCircle, Monitor,
} from 'lucide-react';
import FormPhoneInput from '../forms/FormPhoneInput';
import FormLocationSelect from '../forms/FormLocationSelect';
import useMinistryForm from '../../hooks/useMinistryForm';
import useMinistryFormSubmit from '../../hooks/useMinistryFormSubmit';
import { inp, inpErr, Label, ErrMsg, RadioOpt, REGION_PHONE } from './shared/formPrimitives';

const AccSection = ({ number, title, description, icon: Icon, children, defaultOpen = false, hasError = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (hasError) setOpen(true);
  }, [hasError]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors"
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
        <div className="overflow-hidden">
          <div className="px-6 pb-8 pt-2 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const INIT = {
  firstName: '',
  lastName:  '',
  gender:    '',
  email:     '',
  phone:     '',
  location:  { countryCode: '', stateCode: '', city: '', postalCode: '', addressLine1: '', addressLine2: '' },
};

const DiscipleshipForm = () => {
  const { t } = useTranslation('ministryForms');
  useUrlLanguage();
  const { selectedRegion } = useRegion();
  const navigate           = useNavigate();

  const regionCode   = selectedRegion?.code?.toUpperCase() || 'NG';
  const defaultPhone = REGION_PHONE[regionCode] || 'ng';

  const { formConfig, isLoading: configLoading, error: configError } = useMinistryForm('DISCIPLESHIP_PROGRAM');

  const [form,        setForm]        = useState(INIT);
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { submitFree } = useMinistryFormSubmit(formConfig?.id, setSubmitError, setSubmitting, t('common.somethingWentWrong'));

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fi      = (f) => errors[f] ? inpErr : inp;
  const clrErr  = (f) => setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  const set     = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); clrErr(f); };
  const setVal  = (f, v)    => { setForm((p) => ({ ...p, [f]: v })); clrErr(f); };

  const blurEmail = () => {
    const v = form.email.trim();
    if (v && !emailRe.test(v)) setErrors((p) => ({ ...p, email: 'Enter a valid email address' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.gender)           e.gender    = 'Please select your gender';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone || form.phone.trim().length < 7) e.phone = 'Phone number is required';
    return e;
  };

  const FEATURES = [
    t('discipleship.featureBibleStudy'),
    t('discipleship.featurePrayerGroups'),
    t('discipleship.featureAccountability'),
    t('discipleship.featureSpiritualGrowth'),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setSubmitError('Please fix the errors below before submitting.');
      return;
    }
    setErrors({});

    const { location, ...rest } = form;
    const ok = await submitFree({
      ...rest,
      country:      location.countryName  || '',
      state:        location.stateName    || '',
      city:         location.city         || '',
      postalCode:   location.postalCode   || '',
      addressLine1: location.addressLine1 || '',
      addressLine2: location.addressLine2 || '',
    });
    if (ok) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('discipleship.successTitle')}</h2>
          <p className="text-gray-600 mb-2">
            {t('discipleship.successMessage', { name: form.firstName })}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            {t('discipleship.successZoom', { email: form.email })}
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

  const sec1Error = !!(errors.firstName || errors.lastName || errors.gender || errors.email || errors.phone);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-blue-400/20 border border-blue-300/30 text-blue-100 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
              <Video size={12} />
              {t('discipleship.badge')}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('discipleship.title')}
          </h1>

          <p className="text-primary-100 max-w-xl mx-auto leading-relaxed text-sm md:text-base mb-6">
            {t('discipleship.description')}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FEATURES.map((f) => (
              <span
                key={f}
                className="text-xs bg-white/10 border border-white/20 text-white/80 px-3 py-1 rounded-full font-medium"
              >
                {f}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('discipleship.freeToAttend')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('common.onlineViaZoom')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('discipleship.openToAllRegions')}</span>
            <span className="text-white/30">|</span>
            <Link
              to="/discipleship/honor-offering"
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

        <AccSection
          number="1"
          title={t('discipleship.section1Title')}
          description={t('discipleship.section1Desc')}
          icon={User}
          defaultOpen
          hasError={sec1Error}
        >
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
              <Label required>{t('common.gender')}</Label>
              <div className="flex items-center gap-6 mt-1">
                <RadioOpt name="gender" value="Female" label={t('common.female')} checked={form.gender === 'Female'} onChange={set('gender')} />
                <RadioOpt name="gender" value="Male"   label={t('common.male')}   checked={form.gender === 'Male'}   onChange={set('gender')} />
              </div>
              <ErrMsg msg={errors.gender} />
            </div>

            <div>
              <Label required>{t('common.email')}</Label>
              <input
                type="email"
                className={fi('email')}
                placeholder={t('common.emailPlaceholder')}
                value={form.email}
                onChange={set('email')}
                onBlur={blurEmail}
              />
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

            <FormLocationSelect
              value={form.location}
              onChange={(loc) => setVal('location', loc)}
            />

          </div>
        </AccSection>

        {submitError && (
          <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {submitError}
          </p>
        )}

        <div className="pb-10 pt-2">
          <button
            type="submit"
            disabled={submitting || !formConfig?.id}
            className="w-full flex items-center justify-center gap-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-60 shadow-lg hover:shadow-xl text-base"
          >
            {submitting
              ? <><Loader2 size={20} className="animate-spin" /> {t('discipleship.submittingBtn')}</>
              : <><CheckCircle size={20} /> {t('discipleship.submitBtn')}</>
            }
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            {t('common.disclaimerRegister')}
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            {t('common.wantToSupport')}{' '}
            <Link to="/discipleship/honor-offering" className="text-purple-500 hover:text-purple-700 font-medium underline underline-offset-2">
              {t('common.honorOffering')}
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
};

export default DiscipleshipForm;
