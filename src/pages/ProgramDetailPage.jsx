import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Lock,
  Loader2,
} from 'lucide-react';
import { fetchFormForSubmission } from '../store/slices/formSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { notify } from '../services/utils/authUtils';
import apiClient from '../services/utils/apiClient';
import FormCountrySelect from '../components/forms/FormCountrySelect';
import FormPhoneInput from '../components/forms/FormPhoneInput';

const ProgramDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { programId } = useParams();
  const { selectedForm, isLoading, error } = useSelector((state) => state.form);

  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (programId) {
      dispatch(fetchFormForSubmission(programId));
    }
  }, [programId, dispatch]);

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = selectedForm.formSchema.fields.filter((f) => f.required);
    const missingFields = requiredFields.filter((f) => !formData[f.id] || formData[f.id] === '');

    if (missingFields.length > 0) {
      notify.error(`Please fill in all required fields: ${missingFields.map((f) => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform formData to use field labels instead of IDs for better database readability
      const transformedData = {};
      selectedForm.formSchema.fields.forEach((field) => {
        if (formData[field.id] !== undefined && formData[field.id] !== '') {
          // For file fields, don't include the filename in transformedData
          // The file will be uploaded separately
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

      // Create FormData to match backend expectations
      const formDataToSend = new FormData();
      formDataToSend.append('submissionData', JSON.stringify(transformedData));

      // Add files to FormData if any
      Object.keys(files).forEach((fieldId) => {
        const file = files[fieldId];
        if (file) {
          // Use the field ID as the key for the backend to process
          formDataToSend.append(fieldId, file);
        }
      });

      await apiClient.post(`/form-submissions/${programId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitted(true);
      notify.success(selectedForm.successMessage || 'Application submitted successfully!');

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormLayout = (formSchema) => {
    // Check version for backward compatibility
    if (!formSchema.version || formSchema.version === 1) {
      // V1: Render fields sequentially (existing behavior)
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

    return (layout.rows || []).map((row, rowIndex) => (
      <div
        key={row.id}
        className={`grid gap-4 mb-6 ${
          row.columns === 1 ? 'grid-cols-1' :
          row.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
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
            <option value="">Select an option...</option>
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

      case 'phone':
        return (
          <FormPhoneInput
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(value) => handleInputChange(field.id, value)}
            defaultCountry={field.defaultCountry || 'us'}
            preferredCountries={field.preferredCountries || ['us']}
            placeholder={field.placeholder || 'Enter phone number'}
            required={field.required}
          />
        );

      case 'country':
        return (
          <FormCountrySelect
            value={formData[field.id] || ''}
            onChange={(value) => handleInputChange(field.id, value)}
            required={field.required}
            searchable={field.searchable !== false}
            priorityCountries={field.priorityCountries || []}
            placeholder={field.placeholder || 'Select a country'}
            className={baseClasses}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Store file for upload
                  setFiles(prev => ({ ...prev, [field.id]: file }));
                  // Store file name for display
                  handleInputChange(field.id, file.name);
                }
              }}
              accept={field.acceptedTypes?.join(',') || '*'}
              required={field.required}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {formData[field.id] && (
              <p className="text-sm text-gray-600">
                Selected: {formData[field.id]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading program..." />;
  }

  // Check if error is authentication-related
  const authError = error && (
    error.message?.includes('Authentication required') ||
    error.error?.includes('Authentication required') ||
    error.message?.includes('authentication') ||
    error.error?.includes('authentication')
  );

  // Check if user already submitted
  const alreadySubmittedError = error && (
    error.message?.includes('already submitted') ||
    error.error?.includes('already submitted')
  );

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-primary-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-8">
            You need to be signed in to apply for this program.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from: `/programs/${programId}` } })}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Sign In to Apply
            </button>
            <button
              onClick={() => navigate('/programs')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Back to Programs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (alreadySubmittedError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Already Submitted</h2>
          <p className="text-gray-600 mb-8">
            You have already submitted an application for this program. Multiple submissions are not allowed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/programs')}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse Other Programs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Not Found</h2>
          <p className="text-gray-600 mb-6">{error.message || error.error || 'This program is not available.'}</p>
          <button
            onClick={() => navigate('/programs')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeft size={18} />
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  if (!selectedForm) {
    return null;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            {selectedForm.successMessage || 'Thank you for your submission. We will review your application and get back to you soon.'}
          </p>
          <button
            onClick={() => navigate('/programs')}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Browse More Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-black py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/programs')}
            className="inline-flex items-center gap-2 text-white mb-6 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Programs
          </button>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-4">{selectedForm.title}</h1>
          {selectedForm.description && (
            <p className="text-xl text-purple-100">{selectedForm.description}</p>
          )}

          {/* Info Pills */}
          {/* {selectedForm.requireAuthentication && (
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-white">
                <Lock size={16} />
                <span className="text-sm font-medium">Login Required</span>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormLayout(selectedForm.formSchema)}

            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;
