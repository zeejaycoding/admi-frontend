import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../../context/RegionContext';
import { useTranslation } from 'react-i18next';
import useUrlLanguage from '../../hooks/useUrlLanguage';
import {
  User, Phone, Heart, BookOpen, Building2,
  Upload, CheckCircle, FileText, X, Loader2, ChevronDown, AlertCircle,
} from 'lucide-react';
import FormPhoneInput from '../forms/FormPhoneInput';
import FormLocationSelect from '../forms/FormLocationSelect';
import useMinistryForm from '../../hooks/useMinistryForm';
import useMinistryFormSubmit from '../../hooks/useMinistryFormSubmit';
import { inp, inpErr, Label, ErrMsg, RadioOpt, REGION_PHONE } from './shared/formPrimitives';

const CheckOpt = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

const QLabel = ({ n, children, required }) => (
  <div className="flex items-start gap-2.5 mb-2">
    <span className="mt-0.5 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
      {n}
    </span>
    <label className="text-sm font-medium text-gray-700 leading-snug">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  </div>
);

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
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/80 transition-colors group"
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

// English keys used as stable values for form submission & checkbox matching
const MINISTRY_AREA_KEYS = [
  { key: 'worshipMusic',       value: 'Worship & Music' },
  { key: 'childrensMinistry',  value: "Children's Ministry" },
  { key: 'youthMinistry',      value: 'Youth Ministry' },
  { key: 'evangelism',         value: 'Evangelism & Outreach' },
  { key: 'prayerTeam',         value: 'Prayer Team' },
  { key: 'ushering',           value: 'Ushering' },
  { key: 'mediaTech',          value: 'Media & Tech' },
  { key: 'cellGroup',          value: 'Cell Group / Home Fellowship' },
];

const INIT = {
  firstName: '', middleName: '', lastName: '',
  gender: '', dateOfBirth: '', occupation: '', maritalStatus: '',
  phone: '', email: '',
  location: { countryCode: '', stateCode: '', city: '', postalCode: '', addressLine1: '', addressLine2: '' },
  spouseFirstName: '', spouseMiddleName: '', spouseLastName: '',
  spouseGender: '', spouseDateOfBirth: '', spouseOccupation: '',
  spousePhone: '', spouseEmail: '',
  christianBackground: '', yearsFollowingTeachings: '', messagesListened: '',
  giftsStrengths: '', fruitBearing: '', coordinatorTasks: '',
  churchInvolvement: [], ministryTraining: '',
  managedPeople: '', managedPeopleCapacity: '',
  campusOrganizationProgress: '', spaceAccess: '', screenAccess: '',
  proposedLocation: '', proposedPhone: '',
};

const NewCoordinatorsRegistrationForm = () => {
  const { t } = useTranslation('ministryForms');
  useUrlLanguage();
  const { selectedRegion } = useRegion();
  const navigate           = useNavigate();
  const fileInputRef       = useRef(null);

  const regionCode   = selectedRegion?.code?.toUpperCase() || 'NG';
  const defaultPhone = REGION_PHONE[regionCode] || 'ng';

  const { formConfig, error: configError } = useMinistryForm('NEW_COORDINATORS_REGISTRATION');

  const [form,        setForm]        = useState(INIT);
  const [errors,      setErrors]      = useState({});
  const [idFile,      setIdFile]      = useState(null);
  const [dragOver,    setDragOver]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { submitFree } = useMinistryFormSubmit(formConfig?.id, setSubmitError, setSubmitting, t('common.somethingWentWrong'));

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fi      = (f) => errors[f] ? inpErr : inp;
  const clrErr  = (f) => setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
  const set     = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); clrErr(f); };
  const setVal  = (f, v)    => { setForm((p) => ({ ...p, [f]: v })); clrErr(f); };

  const blurEmail = (f) => () => {
    const v = form[f]?.trim();
    if (v && !emailRe.test(v)) setErrors((p) => ({ ...p, [f]: 'Enter a valid email address' }));
  };

  const validate = () => {
    const e = {};
    // Section 1 — Personal
    if (!form.firstName.trim())   e.firstName   = 'First name is required';
    if (!form.lastName.trim())    e.lastName    = 'Last name is required';
    if (!form.gender)             e.gender      = 'Please select your gender';
    if (!form.maritalStatus)      e.maritalStatus = 'Please select your marital status';
    // Section 2 — Contact
    if (!form.phone || form.phone.trim().length < 7) e.phone = 'Phone number is required';
    if (!form.email.trim())       e.email       = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';
    // Spouse email (optional field, but validate format if filled)
    if (form.spouseEmail && !emailRe.test(form.spouseEmail)) e.spouseEmail = 'Enter a valid email address';
    // Section 4 — Questions
    if (!form.christianBackground.trim())    e.christianBackground    = 'This field is required';
    if (!form.yearsFollowingTeachings.trim()) e.yearsFollowingTeachings = 'This field is required';
    if (!form.messagesListened.trim())       e.messagesListened       = 'This field is required';
    if (!form.giftsStrengths.trim())         e.giftsStrengths         = 'This field is required';
    if (!form.fruitBearing.trim())           e.fruitBearing           = 'This field is required';
    if (!form.coordinatorTasks.trim())       e.coordinatorTasks       = 'This field is required';
    if (form.churchInvolvement.length === 0) e.churchInvolvement      = 'Please select at least one area';
    if (!form.ministryTraining.trim())       e.ministryTraining       = 'This field is required';
    if (!form.managedPeople)                 e.managedPeople          = 'Please select Yes or No';
    // Section 5 — Campus
    if (!form.campusOrganizationProgress.trim()) e.campusOrganizationProgress = 'This field is required';
    if (!form.proposedLocation.trim())           e.proposedLocation           = 'This field is required';
    if (!idFile)                                 e.idFile                     = 'Please upload a valid ID or passport';
    return e;
  };

  const toggleMinistry = (value) =>
    setForm((p) => ({
      ...p,
      churchInvolvement: p.churchInvolvement.includes(value)
        ? p.churchInvolvement.filter((a) => a !== value)
        : [...p.churchInvolvement, value],
    }));

  const handleFile = (file) => {
    if (!file) return;
    const ok = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
    if (ok && file.size <= 5 * 1024 * 1024) setIdFile(file);
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('newCoordinators.successTitle')}</h2>
          <p className="text-gray-600 mb-2">
            {t('newCoordinators.successMessage', { name: form.firstName })}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {t('newCoordinators.successContact', { email: form.email })}
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

  const isMarried = form.maritalStatus === 'Married';

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            <span>{selectedRegion?.flag}</span>
            <span>{t('newCoordinators.badge', { region: selectedRegion?.name })}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {t('newCoordinators.title')}
          </h1>
          <p className="text-primary-100 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            {t('newCoordinators.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/70">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('newCoordinators.freeToApply')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('newCoordinators.takesTime')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> {t('newCoordinators.wellBeInTouch')}</span>
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

        <AccSection
          number="1"
          title={t('newCoordinators.section1Title')}
          description={t('newCoordinators.section1Desc')}
          icon={User}
          defaultOpen
          hasError={!!(errors.firstName || errors.lastName || errors.gender || errors.maritalStatus)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t('common.dateOfBirth')}</Label>
                <input type="date" className={inp} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
              </div>
              <div>
                <Label>{t('common.occupation')}</Label>
                <input className={inp} placeholder={t('common.occupationPlaceholder')} value={form.occupation} onChange={set('occupation')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label required>{t('common.gender')}</Label>
                <div className="flex items-center gap-6 mt-1">
                  <RadioOpt name="gender" value="Female" label={t('common.female')} checked={form.gender === 'Female'} onChange={set('gender')} />
                  <RadioOpt name="gender" value="Male"   label={t('common.male')}   checked={form.gender === 'Male'}   onChange={set('gender')} />
                </div>
                <ErrMsg msg={errors.gender} />
              </div>
              <div>
                <Label required>{t('common.maritalStatus')}</Label>
                <select className={fi('maritalStatus')} value={form.maritalStatus} onChange={set('maritalStatus')}>
                  <option value="">{t('common.selectStatus')}</option>
                  <option value="Single">{t('common.single')}</option>
                  <option value="Married">{t('common.married')}</option>
                  <option value="Divorced">{t('common.divorced')}</option>
                  <option value="Widowed">{t('common.widowed')}</option>
                </select>
                <ErrMsg msg={errors.maritalStatus} />
              </div>
            </div>
          </div>
        </AccSection>

        <AccSection
          number="2"
          title={t('newCoordinators.section2Title')}
          description={t('newCoordinators.section2Desc')}
          icon={Phone}
          hasError={!!(errors.phone || errors.email)}
        >
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label required>{t('common.email')}</Label>
                <input
                  type="email"
                  className={fi('email')}
                  placeholder={t('common.emailPlaceholder')}
                  value={form.email}
                  onChange={set('email')}
                  onBlur={blurEmail('email')}
                />
                <ErrMsg msg={errors.email} />
              </div>
            </div>

            <FormLocationSelect
              value={form.location}
              onChange={(loc) => setVal('location', loc)}
            />
          </div>
        </AccSection>

        <AccSection
          number="3"
          title={t('newCoordinators.section3Title')}
          description={isMarried ? t('newCoordinators.section3DescMarried') : t('newCoordinators.section3DescDefault')}
          icon={Heart}
          hasError={!!errors.spouseEmail}
        >
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>{t('common.spouseFirstName')}</Label>
                <input className={inp} placeholder={t('common.firstPlaceholder')} value={form.spouseFirstName} onChange={set('spouseFirstName')} />
              </div>
              <div>
                <Label>{t('common.spouseMiddleName')}</Label>
                <input className={inp} placeholder={t('common.middlePlaceholder')} value={form.spouseMiddleName} onChange={set('spouseMiddleName')} />
              </div>
              <div>
                <Label>{t('common.spouseLastName')}</Label>
                <input className={inp} placeholder={t('common.lastPlaceholder')} value={form.spouseLastName} onChange={set('spouseLastName')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>{t('common.spouseGender')}</Label>
                <div className="flex items-center gap-6 mt-1">
                  <RadioOpt name="spouseGender" value="Female" label={t('common.female')} checked={form.spouseGender === 'Female'} onChange={set('spouseGender')} />
                  <RadioOpt name="spouseGender" value="Male"   label={t('common.male')}   checked={form.spouseGender === 'Male'}   onChange={set('spouseGender')} />
                </div>
              </div>
              <div>
                <Label>{t('common.spouseDateOfBirth')}</Label>
                <input type="date" className={inp} value={form.spouseDateOfBirth} onChange={set('spouseDateOfBirth')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>{t('common.spouseOccupation')}</Label>
                <input className={inp} placeholder={t('common.occupation')} value={form.spouseOccupation} onChange={set('spouseOccupation')} />
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
              <div>
                <Label>{t('common.spouseEmail')}</Label>
                <input type="email" className={fi('spouseEmail')} placeholder={t('newCoordinators.spouseEmailPlaceholder')} value={form.spouseEmail} onChange={set('spouseEmail')} onBlur={blurEmail('spouseEmail')} />
                <ErrMsg msg={errors.spouseEmail} />
              </div>
            </div>
          </div>
        </AccSection>

        <AccSection
          number="4"
          title={t('newCoordinators.section4Title')}
          description={t('newCoordinators.section4Desc')}
          icon={BookOpen}
          hasError={!!(errors.christianBackground || errors.yearsFollowingTeachings || errors.messagesListened || errors.giftsStrengths || errors.fruitBearing || errors.coordinatorTasks || errors.churchInvolvement || errors.ministryTraining || errors.managedPeople)}
        >
          <div className="space-y-7 pt-4">

            <div>
              <QLabel n={1} required>{t('newCoordinators.q1')}</QLabel>
              <textarea rows={3} className={`${fi('christianBackground')} resize-none`}
                placeholder={t('newCoordinators.q1Placeholder')}
                value={form.christianBackground} onChange={set('christianBackground')} />
              <ErrMsg msg={errors.christianBackground} />
            </div>

            <div>
              <QLabel n={2} required>{t('newCoordinators.q2')}</QLabel>
              <input className={fi('yearsFollowingTeachings')} placeholder={t('newCoordinators.q2Placeholder')}
                value={form.yearsFollowingTeachings} onChange={set('yearsFollowingTeachings')} />
              <ErrMsg msg={errors.yearsFollowingTeachings} />
            </div>

            <div>
              <QLabel n={3} required>{t('newCoordinators.q3')}</QLabel>
              <textarea rows={3} className={`${fi('messagesListened')} resize-none`}
                placeholder={t('newCoordinators.q3Placeholder')}
                value={form.messagesListened} onChange={set('messagesListened')} />
              <ErrMsg msg={errors.messagesListened} />
            </div>

            <div>
              <QLabel n={4} required>{t('newCoordinators.q4')}</QLabel>
              <textarea rows={3} className={`${fi('giftsStrengths')} resize-none`}
                placeholder={t('newCoordinators.q4Placeholder')}
                value={form.giftsStrengths} onChange={set('giftsStrengths')} />
              <ErrMsg msg={errors.giftsStrengths} />
            </div>

            <div>
              <QLabel n={5} required>{t('newCoordinators.q5')}</QLabel>
              <textarea rows={3} className={`${fi('fruitBearing')} resize-none`}
                placeholder={t('newCoordinators.q5Placeholder')}
                value={form.fruitBearing} onChange={set('fruitBearing')} />
              <ErrMsg msg={errors.fruitBearing} />
            </div>

            <div>
              <QLabel n={6} required>{t('newCoordinators.q6')}</QLabel>
              <textarea rows={3} className={`${fi('coordinatorTasks')} resize-none`}
                placeholder={t('newCoordinators.q6Placeholder')}
                value={form.coordinatorTasks} onChange={set('coordinatorTasks')} />
              <ErrMsg msg={errors.coordinatorTasks} />
            </div>

            <div>
              <QLabel n={7} required>{t('newCoordinators.q7')}</QLabel>
              <p className="text-xs text-gray-500 mb-3 ml-8">{t('newCoordinators.selectAllThatApply')}</p>
              <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MINISTRY_AREA_KEYS.map(({ key, value }) => (
                  <CheckOpt
                    key={value}
                    label={t(`newCoordinators.ministryArea.${key}`)}
                    checked={form.churchInvolvement.includes(value)}
                    onChange={() => { toggleMinistry(value); clrErr('churchInvolvement'); }}
                  />
                ))}
              </div>
              <ErrMsg msg={errors.churchInvolvement} />
            </div>

            <div>
              <QLabel n={8} required>{t('newCoordinators.q8')}</QLabel>
              <textarea rows={3} className={`${fi('ministryTraining')} resize-none`}
                placeholder={t('newCoordinators.q8Placeholder')}
                value={form.ministryTraining} onChange={set('ministryTraining')} />
              <ErrMsg msg={errors.ministryTraining} />
            </div>

            <div>
              <QLabel n={9} required>{t('newCoordinators.q9')}</QLabel>
              <div className="flex items-center gap-6 ml-8 mt-1">
                <RadioOpt name="managedPeople" value="Yes" label={t('common.yes')} checked={form.managedPeople === 'Yes'} onChange={set('managedPeople')} />
                <RadioOpt name="managedPeople" value="No"  label={t('common.no')}  checked={form.managedPeople === 'No'}  onChange={set('managedPeople')} />
              </div>
              <ErrMsg msg={errors.managedPeople} />
              {form.managedPeople === 'Yes' && (
                <div className="ml-8 mt-3">
                  <Label>{t('newCoordinators.inWhatCapacity')}</Label>
                  <input className={inp} placeholder={t('newCoordinators.inWhatCapacityPlaceholder')}
                    value={form.managedPeopleCapacity} onChange={set('managedPeopleCapacity')} />
                </div>
              )}
            </div>

          </div>
        </AccSection>

        <AccSection
          number="5"
          title={t('newCoordinators.section5Title')}
          description={t('newCoordinators.section5Desc')}
          icon={Building2}
          hasError={!!(errors.campusOrganizationProgress || errors.proposedLocation || errors.idFile)}
        >
          <div className="space-y-7 pt-4">

            <div>
              <QLabel n={10} required>{t('newCoordinators.q10')}</QLabel>
              <textarea rows={3} className={`${fi('campusOrganizationProgress')} resize-none`}
                placeholder={t('newCoordinators.q10Placeholder')}
                value={form.campusOrganizationProgress} onChange={set('campusOrganizationProgress')} />
              <ErrMsg msg={errors.campusOrganizationProgress} />
            </div>

            <div>
              <QLabel n={11}>{t('newCoordinators.q11')}</QLabel>
              <div className="flex items-center gap-6 ml-8 mt-1">
                <RadioOpt name="spaceAccess" value="Yes" label={t('common.yes')} checked={form.spaceAccess === 'Yes'} onChange={set('spaceAccess')} />
                <RadioOpt name="spaceAccess" value="No"  label={t('common.no')}  checked={form.spaceAccess === 'No'}  onChange={set('spaceAccess')} />
              </div>
            </div>

            <div>
              <QLabel n={12}>{t('newCoordinators.q12')}</QLabel>
              <div className="flex items-center gap-6 ml-8 mt-1">
                <RadioOpt name="screenAccess" value="Yes" label={t('common.yes')} checked={form.screenAccess === 'Yes'} onChange={set('screenAccess')} />
                <RadioOpt name="screenAccess" value="No"  label={t('common.no')}  checked={form.screenAccess === 'No'}  onChange={set('screenAccess')} />
              </div>
            </div>

            <div>
              <QLabel n={13} required>{t('newCoordinators.q13')}</QLabel>
              <textarea rows={3} className={`${fi('proposedLocation')} resize-none`}
                placeholder={t('newCoordinators.q13Placeholder')}
                value={form.proposedLocation} onChange={set('proposedLocation')} />
              <ErrMsg msg={errors.proposedLocation} />
            </div>

            <div>
              <QLabel n={14}>{t('newCoordinators.q14')}</QLabel>
              <div className="ml-8">
                <FormPhoneInput
                  value={form.proposedPhone}
                  onChange={(val) => setVal('proposedPhone', val)}
                  defaultCountry={defaultPhone}
                  preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
                />
              </div>
            </div>

            <div>
              <QLabel n={15} required>{t('newCoordinators.q15')}</QLabel>
              <p className="text-xs text-gray-500 mb-3 ml-8">{t('newCoordinators.q15Hint')}</p>

              {idFile ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <FileText size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-800 flex-1 truncate">{idFile.name}</span>
                  <button type="button" onClick={() => setIdFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl py-10 px-4 text-center cursor-pointer transition-all duration-200
                    ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
                >
                  <Upload size={30} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">{t('newCoordinators.uploadPrompt')}</p>
                  <p className="text-xs text-gray-400 mt-1">{t('newCoordinators.uploadHint')}</p>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => { handleFile(e.target.files[0]); clrErr('idFile'); }}
              />
              <ErrMsg msg={errors.idFile} />
            </div>

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
              ? <><Loader2 size={20} className="animate-spin" /> {t('newCoordinators.submittingBtn')}</>
              : <><CheckCircle size={20} /> {t('newCoordinators.submitBtn')}</>
            }
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            {t('common.disclaimerSubmit')}
          </p>
        </div>

      </form>
    </div>
  );
};

export default NewCoordinatorsRegistrationForm;
