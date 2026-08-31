import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Send, Plus, Trash2 } from 'lucide-react';
import formService from '../services/api/formService';
import formSubmissionService from '../services/api/formSubmissionService';
import FormCountrySelect from '../components/forms/FormCountrySelect';
import FormPhoneInput from '../components/forms/FormPhoneInput';
import { notify } from '../services/utils/authUtils';

// Computed field value = sum(addFieldIds) - sum(subtractFieldIds) - sum(repeater number columns)
const computeFieldValue = (field, formData, allFields) => {
  const num = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };
  let total = 0;
  (field.addFieldIds || []).forEach((id) => { total += num(formData[id]); });
  (field.subtractFieldIds || []).forEach((id) => { total -= num(formData[id]); });
  (field.subtractRepeaters || []).forEach((repId) => {
    const rep = (allFields || []).find((f) => f.id === repId);
    if (!rep) return;
    const numberSubIds = (rep.subFields || []).filter((s) => s.type === 'number').map((s) => s.id);
    (formData[repId] || []).forEach((row) => {
      numberSubIds.forEach((sid) => { total -= num(row[sid]); });
    });
  });
  return total;
};

const PublicFormPage = () => {
  const { formCode } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formCode !== formCode.toLowerCase()) {
      navigate(`/forms/${formCode.toLowerCase()}`, { replace: true });
      return;
    }
  }, [formCode, navigate]);

  useEffect(() => {
    if (formCode !== formCode.toLowerCase()) return;
    const loadForm = async () => {
      try {
        // Resolve by form code first, then fall back to event code, so ANY shared
        // form (page-based or event) opens from the same /forms/{code} link.
        let response;
        try {
          response = await formService.getFormByFormCode(formCode.toUpperCase());
        } catch (formCodeErr) {
          response = await formService.getFormByEventCode(formCode.toUpperCase());
        }
        setForm(response);

        const initialData = {};
        if (response.formSchema?.fields) {
          response.formSchema.fields.forEach(field => {
            if (field.type === 'repeater') {
              const rowCount = Math.max(1, field.minRows ?? 1);
              initialData[field.id] = Array.from({ length: rowCount }, () => {
                const row = {};
                (field.subFields || []).forEach((sub) => { row[sub.id] = ''; });
                return row;
              });
            } else if (field.type === 'checkbox') {
              initialData[field.id] = [];
            } else {
              initialData[field.id] = '';
            }
          });
        }
        setFormData(initialData);
      } catch (err) {
        setError('Form not found or is no longer available.');
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formCode]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (fieldId, fileList) => {
    setFiles(prev => ({ ...prev, [fieldId]: Array.from(fileList || []) }));
  };

  // Repeater helpers: each row is an object keyed by sub-field id
  const makeEmptyRow = (field) => {
    const row = {};
    (field.subFields || []).forEach((sub) => { row[sub.id] = ''; });
    return row;
  };

  const handleRepeaterCellChange = (fieldId, rowIndex, subId, value) => {
    setFormData(prev => {
      const list = [...(prev[fieldId] || [])];
      list[rowIndex] = { ...list[rowIndex], [subId]: value };
      return { ...prev, [fieldId]: list };
    });
  };

  const addRepeaterRow = (field) => {
    setFormData(prev => ({ ...prev, [field.id]: [...(prev[field.id] || []), makeEmptyRow(field)] }));
  };

  const removeRepeaterRow = (fieldId, rowIndex) => {
    setFormData(prev => {
      const list = [...(prev[fieldId] || [])];
      list.splice(rowIndex, 1);
      return { ...prev, [fieldId]: list };
    });
  };

  const rowHasValue = (row) => Object.values(row || {}).some((v) => v !== '' && v != null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = form.formSchema.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => {
      if (f.type === 'computed') {
        return false; // always auto-calculated
      }
      if (f.type === 'file') {
        return !(files[f.id] && files[f.id].length > 0);
      }
      if (f.type === 'repeater') {
        const list = formData[f.id] || [];
        return !list.some(rowHasValue);
      }
      const val = formData[f.id];
      return !val || (Array.isArray(val) ? val.length === 0 : val === '');
    });

    if (missingFields.length > 0) {
      notify.error(`Please fill in: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const transformedData = {};
      form.formSchema.fields.forEach(field => {
        if (field.type === 'file') return;

        if (field.type === 'computed') {
          transformedData[field.label] = computeFieldValue(field, formData, form.formSchema.fields);
          return;
        }

        if (field.type === 'repeater') {
          // Keep only non-empty rows, re-key each row's cells by sub-field label
          const rows = (formData[field.id] || [])
            .filter(rowHasValue)
            .map((row) => {
              const obj = {};
              (field.subFields || []).forEach((sub) => {
                obj[sub.label] = row[sub.id] ?? '';
              });
              return obj;
            });
          if (rows.length) transformedData[field.label] = rows;
          return;
        }

        const val = formData[field.id];
        if (val !== undefined && val !== '') {
          let value = val;
          if (field.type === 'phone' && value && !value.startsWith('+')) {
            value = '+' + value;
          }
          transformedData[field.label] = value;
        }
      });

      await formSubmissionService.submitForm(form.id, transformedData, files);
      setSubmitted(true);
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={e => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'textarea':
      case 'richtext':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={e => handleInputChange(field.id, e.target.value)}
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
            onChange={e => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={baseClasses}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
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
                  onChange={e => handleInputChange(field.id, e.target.value)}
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
                  onChange={e => {
                    const current = formData[field.id] || [];
                    handleInputChange(
                      field.id,
                      e.target.checked ? [...current, option] : current.filter(v => v !== option)
                    );
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
            onChange={e => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={baseClasses}
          />
        );

      case 'file': {
        const selected = files[field.id] || [];
        return (
          <div>
            <input
              type="file"
              id={field.id}
              multiple={field.allowMultiple}
              onChange={e => handleFileChange(field.id, e.target.files)}
              required={field.required && selected.length === 0}
              accept={Array.isArray(field.acceptedTypes) ? field.acceptedTypes.join(',') : (field.acceptedTypes || field.accept)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {selected.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-600">
                {selected.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="truncate">{f.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      case 'repeater': {
        const list = formData[field.id] || [];
        const subFields = field.subFields || [];
        const minRows = Math.max(0, field.minRows ?? 1);
        return (
          <div className="space-y-3">
            {list.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-wrap items-end gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                {subFields.map((sub) => (
                  <div key={sub.id} className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {sub.label}
                    </label>
                    <input
                      type={sub.type === 'number' ? 'number' : sub.type === 'date' ? 'date' : 'text'}
                      value={row[sub.id] || ''}
                      onChange={(e) => handleRepeaterCellChange(field.id, rowIndex, sub.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => removeRepeaterRow(field.id, rowIndex)}
                  disabled={list.length <= minRows}
                  className="px-2 py-2 text-red-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remove row"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addRepeaterRow(field)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              <Plus size={16} /> {field.addButtonLabel || 'Add Row'}
            </button>
          </div>
        );
      }

      case 'computed': {
        const decimals = field.decimals ?? 2;
        const computed = computeFieldValue(field, formData, form.formSchema.fields);
        return (
          <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 font-semibold text-gray-900">
            {computed.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })}
          </div>
        );
      }

      case 'country':
        return (
          <FormCountrySelect
            value={formData[field.id] || ''}
            onChange={value => handleInputChange(field.id, value)}
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
            onChange={value => handleInputChange(field.id, value)}
            required={field.required}
            defaultCountry={field.defaultCountry}
            preferredCountries={field.preferredCountries}
          />
        );

      default:
        return null;
    }
  };

  const renderFormLayout = (formSchema) => {
    if (!formSchema.version || formSchema.version === 1) {
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

    const { layout, fields: formFields } = formSchema;
    const fieldsMap = Object.fromEntries((formFields || []).map(f => [f.id, f]));

    return (layout.rows || [])
      .slice()
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(row => (
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            {form?.successMessage || 'Your submission has been received successfully.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{form?.title}</h1>
            {form?.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {form?.formSchema && renderFormLayout(form.formSchema)}

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
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

export default PublicFormPage;
