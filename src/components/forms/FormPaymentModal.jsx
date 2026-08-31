import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, CircularProgress, Divider } from '@mui/material';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Modal } from '../ui';
import { API_BASE_URL } from '../../constants/api';

function FormPaymentModal({ open, onClose, form, submissionData, onPaypalSuccess, overrideAmount, overrideCurrency }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const amount = parseFloat(overrideAmount ?? form?.paymentAmount ?? 0);
  const currency = overrideCurrency || form?.paymentCurrency || 'USD';
  const gateway = form?.paymentGateway || 'STRIPE';

  const currencySymbols = { USD: '$', GBP: '£', NGN: '₦', GHS: '₵', ZAR: 'R' };
  const symbol = currencySymbols[currency] || '$';

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/forms/${form.id}/checkout/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          submissionData,
          email: submissionData?.email || submissionData?.Email || '',
          ...(overrideAmount != null && { overrideAmount }),
          ...(overrideCurrency != null && { overrideCurrency }),
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.message || 'Failed to create checkout session');
        return;
      }
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      setError('Payment setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/forms/${form.id}/checkout/paypal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          submissionData,
          email: submissionData?.email || submissionData?.Email || '',
          ...(overrideAmount != null && { overrideAmount }),
          ...(overrideCurrency != null && { overrideCurrency }),
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setError(err.message || 'Failed to create PayPal order');
        return;
      }
      const data = await response.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        setError('Failed to create PayPal order');
      }
    } catch (err) {
      setError('PayPal setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showStripe = gateway === 'STRIPE' || gateway === 'BOTH';
  const showPayPal = gateway === 'PAYPAL' || gateway === 'BOTH';

  return (
    <Modal open={open} onClose={onClose} title="Complete Registration">
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: 3,
            p: 3,
            bgcolor: '#f9fafb',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
            {amount === 0 ? 'Free' : `${symbol}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
            {form?.paymentDescription || `Registration: ${form?.title}`}
          </Typography>
        </Box>

        {error && (
          <Typography sx={{ color: '#dc2626', mb: 2, fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {showStripe && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleStripeCheckout}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CreditCard size={18} />}
              endIcon={<ExternalLink size={14} />}
              sx={{
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {loading ? 'Setting up...' : 'Pay with Stripe'}
            </Button>
          )}

          {showStripe && showPayPal && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>or</Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>
          )}

          {showPayPal && (
            <Button
              fullWidth
              variant="contained"
              onClick={handlePayPalCheckout}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: '#f59e0b',
                color: '#111827',
                '&:hover': { bgcolor: '#d97706' },
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              {loading ? 'Setting up...' : 'Pay with PayPal'}
            </Button>
          )}
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={onClose}
          sx={{ mt: 1.5, color: '#6b7280', textTransform: 'none' }}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
}

FormPaymentModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  form: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    paymentAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentCurrency: PropTypes.string,
    paymentGateway: PropTypes.string,
    paymentDescription: PropTypes.string,
  }),
  submissionData: PropTypes.object,
  onPaypalSuccess: PropTypes.func,
  overrideAmount: PropTypes.number,
  overrideCurrency: PropTypes.string,
};

export default FormPaymentModal;
