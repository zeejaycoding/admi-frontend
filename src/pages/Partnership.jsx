import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../context/RegionContext';
import {
  Send,
  Loader2,
  Globe,
  BookOpen,
  Church,
  HandHeart,
} from 'lucide-react';
import { notify } from '../services/utils/authUtils';
import apiClient from '../services/utils/apiClient';
import formService from '../services/api/formService';
import FormCountrySelect from '../components/forms/FormCountrySelect';
import FormPhoneInput from '../components/forms/FormPhoneInput';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import partnershipBg from '../assets/about_top.png'; // Reusing about image

const Partnership = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('ui');
  const { selectedRegion } = useRegion();

  const [form, setForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const handlePartnerButtonClick = async () => {
    try {
      setLoadingForm(true);
      const response = await formService.getFormByFormCode('PARTNERSHIP');
      setForm(response);

      // Initialize form data with empty values
      const initialData = {};
      if (response.formSchema?.fields) {
        response.formSchema.fields.forEach(field => {
          initialData[field.id] = field.type === 'checkbox' ? [] : '';
        });
      }
      setFormData(initialData);

      setShowFormModal(true);
    } catch (error) {
      notify.error('Failed to load partnership form');
    } finally {
      setLoadingForm(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId, file) => {
    setFiles((prev) => ({
      ...prev,
      [fieldId]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = form.formSchema.fields.filter((f) => f.required);
    const missingFields = requiredFields.filter((f) => !formData[f.id] || formData[f.id] === '');

    if (missingFields.length > 0) {
      notify.error(`Please fill in all required fields: ${missingFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform formData to use field labels
      const transformedData = {};
      form.formSchema.fields.forEach((field) => {
        if (formData[field.id] !== undefined && formData[field.id] !== '') {
          if (field.type !== 'file') {
            let value = formData[field.id];

            // Format phone numbers with + prefix if not already present
            if (field.type === 'phone' && value && !value.startsWith('+')) {
              value = '+' + value;
            }

            transformedData[field.label] = value;
          }
        }
      });

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('submissionData', JSON.stringify(transformedData));

      // Add files
      Object.keys(files).forEach((fieldId) => {
        const file = files[fieldId];
        if (file) {
          formDataToSend.append(fieldId, file);
        }
      });

      await apiClient.post(`/form-submissions/${form.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notify.success(form.successMessage || 'Partnership form submitted successfully!');

      // Close form modal and show donation prompt
      setShowFormModal(false);
      setShowDonationModal(true);

    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonateClick = () => {
    setShowDonationModal(false);
    // Navigate to donate page respecting current region and set offering type to Partnership
    const regionParam = selectedRegion.code !== 'NG' ? `region=${selectedRegion.code}&` : '';
    navigate(`/donate?${regionParam}offeringType=PARTNERSHIP_OFFERING`);
  };

  const handleReturnHome = () => {
    setShowDonationModal(false);
    // Navigate to home page respecting current region
    const regionParam = selectedRegion.code !== 'NG' ? `?region=${selectedRegion.code}` : '';
    navigate(`/${regionParam}`);
  };

  const renderFormLayout = (formSchema) => {
    // Check version for backward compatibility
    if (!formSchema.version || formSchema.version === 1) {
      // V1: Render fields sequentially
      return formSchema.fields
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(field => (
          <div key={field.id} className="mb-6">
            <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ));
    }

    // V2: Row-based layout
    const { layout, fields: formFields } = formSchema;
    const fieldsMap = Object.fromEntries((formFields || []).map(f => [f.id, f]));

    return (layout.rows || []).map((row) => (
      <div
        key={row.id}
        className={`grid gap-4 mb-6 ${
          row.columns === 1 ? 'grid-cols-1' :
          row.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-3'
        }`}
      >
        {(row.fields || []).map(fieldId => {
          const field = fieldsMap[fieldId];
          if (!field) return null;

          return (
            <div key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-semibold text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          );
        })}
      </div>
    ));
  };

  const renderField = (field) => {
    const baseClasses = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 4}
            className={baseClasses}
          />
        );

      case 'dropdown':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value="">{t('partnership.selectOption')}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'file':
        return (
          <input
            type="file"
            id={field.id}
            onChange={(e) => handleFileChange(field.id, e.target.files[0])}
            required={field.required}
            accept={field.accept}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        );

      case 'country':
        return (
          <FormCountrySelect
            value={formData[field.id] || ''}
            onChange={(value) => handleInputChange(field.id, value)}
            required={field.required}
            searchable={field.searchable}
            priorityCountries={field.priorityCountries}
            placeholder={field.placeholder}
          />
        );

      case 'phone':
        return (
          <FormPhoneInput
            value={formData[field.id] || ''}
            onChange={(value) => handleInputChange(field.id, value)}
            required={field.required}
            defaultCountry={field.defaultCountry}
            preferredCountries={field.preferredCountries}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center text-center overflow-hidden"
        style={{ backgroundImage: `url(${partnershipBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-primary-600/60 to-black/80" />
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {t('partnership.heroHeading')}
          </h1>
          <p className="mt-6 max-w-4xl mx-auto text-lg md:text-xl text-gray-200 leading-relaxed mb-8">
            {t('partnership.heroDesc1')}
          </p>
          <p className="mt-4 max-w-3xl mx-auto text-base md:text-lg text-gray-300 leading-relaxed mb-10">
            {t('partnership.heroDesc2')}
          </p>
          <button
            onClick={handlePartnerButtonClick}
            disabled={loadingForm}
            className="px-8 py-4 bg-white text-primary-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loadingForm ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                {t('partnership.loading')}
              </span>
            ) : (
              t('partnership.partnerBtn')
            )}
          </button>
        </div>
      </section>

      {/* Partnership Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t('partnership.whyPartner')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('partnership.globalImpactTitle')}</h3>
              <p className="text-gray-600">{t('partnership.globalImpactDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-secondary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('partnership.equippingTitle')}</h3>
              <p className="text-gray-600">{t('partnership.equippingDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Church className="w-10 h-10 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('partnership.campusExpansionTitle')}</h3>
              <p className="text-gray-600">{t('partnership.campusExpansionDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('partnership.readyTitle')}
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            {t('partnership.readyDesc')}
          </p>
          <button
            onClick={handlePartnerButtonClick}
            disabled={loadingForm}
            className="px-8 py-4 bg-primary-600 text-white font-bold text-lg rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingForm ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                {t('partnership.loadingForm')}
              </span>
            ) : (
              t('partnership.fillFormBtn')
            )}
          </button>
        </div>
      </section>

      {/* Form Modal */}
      <Dialog
        open={showFormModal}
        onClose={() => setShowFormModal(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" component="div" fontWeight="bold">
            {form?.title || 'Partnership Form'}
          </Typography>
          {form?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {form.description}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {form && (
            <form onSubmit={handleSubmit} id="partnership-form">
              {renderFormLayout(form.formSchema)}
            </form>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setShowFormModal(false)}
            variant="outlined"
            color="inherit"
            disabled={isSubmitting}
          >
            {t('partnership.cancel')}
          </Button>
          <Button
            type="submit"
            form="partnership-form"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          >
            {isSubmitting ? t('partnership.submitting') : t('partnership.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Donation Prompt Modal */}
      <Dialog open={showDonationModal} onClose={handleReturnHome} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <div className="flex justify-center mb-3">
            <HandHeart className="w-16 h-16 text-primary-600" />
          </div>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
            {t('partnership.thankYouTitle')}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 2 }}>
          <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
            {t('partnership.thankYouDesc1')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#6b7280' }}>
            {t('partnership.thankYouDesc2')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mt: 2 }}>
            {t('partnership.thankYouDesc3')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', px: 4, pb: 4, gap: 2 }}>
          <Button
            onClick={handleReturnHome}
            variant="outlined"
            size="large"
            sx={{ minWidth: 140 }}
          >
            {t('partnership.notNow')}
          </Button>
          <Button
            onClick={handleDonateClick}
            variant="contained"
            size="large"
            sx={{
              minWidth: 140,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {t('partnership.give')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Partnership;
