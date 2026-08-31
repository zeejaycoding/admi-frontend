import { useCallback } from 'react';
import { API_BASE_URL } from '../constants/api';

/**
 * Shared submission helpers for the ministry-form components.
 *
 * De-duplicates the byte-identical fetch/error-handling blocks that were
 * copy-pasted across the 5 forms. Each helper performs exactly the same
 * request the inline code did (same endpoint, headers, body encoding and
 * error handling) and resolves to `true` on success. Callers keep their own
 * per-form state updates and side effects (setSubmitted, scroll, onSuccess…).
 *
 * @param {string} formId  formConfig.id
 * @param {(msg: string) => void} setSubmitError
 * @param {(v: boolean) => void} setSubmitting
 */
const useMinistryFormSubmit = (formId, setSubmitError, setSubmitting, fallbackErrorMsg = '') => {
  // Free (URL-encoded) submission → POST /form-submissions/{formId}
  const submitFree = useCallback(async (submissionData) => {
    setSubmitting(true);
    try {
      const body = new URLSearchParams();
      body.append('submissionData', JSON.stringify(submissionData));
      const res = await fetch(`${API_BASE_URL}/form-submissions/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Submission failed');
      }
      return true;
    } catch (err) {
      setSubmitError(err.message || fallbackErrorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [formId, setSubmitError, setSubmitting, fallbackErrorMsg]);

  // NGN bank-transfer submission → POST /forms/{formId}/submit/bank-transfer
  const submitBankTransfer = useCallback(async (submissionData, overrideAmount, overrideCurrency = 'NGN') => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/forms/${formId}/submit/bank-transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionData, overrideAmount, overrideCurrency }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Submission failed. Please try again.');
      }
      return true;
    } catch (err) {
      setSubmitError(err.message || fallbackErrorMsg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [formId, setSubmitError, setSubmitting, fallbackErrorMsg]);

  return { submitFree, submitBankTransfer };
};

export default useMinistryFormSubmit;
