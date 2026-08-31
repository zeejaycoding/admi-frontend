import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/api';

/**
 * Fetches the Form config for a ministry form by its eventCode.
 * Returns { formConfig, isLoading, error } where formConfig contains:
 *   { id, requiresPayment, paymentAmount, paymentCurrency, paymentGateway, paymentDescription, title }
 */
const useMinistryForm = (eventCode) => {
  const [formConfig, setFormConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventCode) return;

    let cancelled = false;

    const fetchConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/forms/event/${eventCode}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load form config (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setFormConfig({
            id: data.id,
            title: data.title,
            requiresPayment: data.requiresPayment ?? false,
            paymentAmount: data.paymentAmount ?? 0,
            paymentCurrency: data.paymentCurrency ?? 'USD',
            paymentGateway: data.paymentGateway ?? 'STRIPE',
            paymentDescription: data.paymentDescription ?? '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchConfig();
    return () => { cancelled = true; };
  }, [eventCode]);

  return { formConfig, isLoading, error };
};

export default useMinistryForm;
