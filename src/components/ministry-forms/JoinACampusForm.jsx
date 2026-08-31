import React, { useState } from 'react';
import { useRegion } from '../../context/RegionContext';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, MapPin, AlertCircle } from 'lucide-react';
import FormPhoneInput from '../forms/FormPhoneInput';
import useMinistryForm from '../../hooks/useMinistryForm';
import useMinistryFormSubmit from '../../hooks/useMinistryFormSubmit';
import { inp, inpErr, Label, ErrMsg, REGION_PHONE } from './shared/formPrimitives';

const JoinACampusForm = ({ campus, onClose, onSuccess }) => {
  const { t } = useTranslation('ministryForms');
  const { selectedRegion } = useRegion();
  const regionCode   = selectedRegion?.code?.toUpperCase() || 'NG';
  const defaultPhone = REGION_PHONE[regionCode] || 'ng';

  const { formConfig, isLoading: configLoading, error: configError } = useMinistryForm('JOIN_CAMPUS');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', message: '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
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
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!emailRe.test(form.email)) e.email = 'Enter a valid email address';
    return e;
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

    const ok = await submitFree({
      ...form,
      campusId:   campus?.id,
      campusName: campus?.name,
      campusCity: campus?.city,
    });
    if (ok) {
      setSubmitted(true);
      onSuccess?.();
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4 px-2">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('joinCampus.requestSent')}</h3>
        <p className="text-gray-600 text-sm mb-1">
          {t('joinCampus.thankYou', { name: form.firstName })}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          {t('joinCampus.joinedMessage', { campus: campus?.name, email: form.email })}
        </p>
        <button
          onClick={onClose}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition-all duration-200"
        >
          {t('common.done')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {configError && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800">{t('common.configError')}</p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
          <MapPin size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary-900 truncate">{campus?.name}</p>
          {(campus?.city || campus?.region) && (
            <p className="text-xs text-primary-600 mt-0.5">
              {[campus.city, campus.region].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
        <Label>{t('common.phone')}</Label>
        <FormPhoneInput
          value={form.phone}
          onChange={(val) => setVal('phone', val)}
          defaultCountry={defaultPhone}
          preferredCountries={['ng', 'gb', 'us', 'za', 'gh']}
        />
      </div>

      <div>
        <Label>
          {t('joinCampus.message')}{' '}
          <span className="text-gray-400 font-normal text-xs">{t('common.optional')}</span>
        </Label>
        <textarea
          rows={3}
          className={`${inp} resize-none`}
          placeholder={t('joinCampus.messagePlaceholder')}
          value={form.message}
          onChange={set('message')}
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {submitError}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting || !formConfig?.id}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg text-sm transition-all duration-200 disabled:opacity-60"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> {t('joinCampus.sendingBtn')}</>
            : <><CheckCircle size={16} /> {t('joinCampus.joinBtn')}</>
          }
        </button>
      </div>
    </form>
  );
};

export default JoinACampusForm;
