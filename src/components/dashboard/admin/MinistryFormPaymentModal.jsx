import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Typography, Switch, FormControlLabel,
  TextField, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Button, Divider,
} from '@mui/material';
import { CreditCard, Save } from 'lucide-react';
import { Modal } from '../../ui';
import { useDispatch } from 'react-redux';
import { updateForm, fetchAllForms } from '../../../store/slices/formSlice';
import { notify } from '../../../services/utils/authUtils';

const CURRENCIES = ['USD', 'GBP', 'NGN', 'GHS', 'ZAR'];
const GATEWAYS   = ['STRIPE', 'PAYPAL', 'BOTH'];

function MinistryFormPaymentModal({ open, onClose, form }) {
  const dispatch = useDispatch();

  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentAmount,   setPaymentAmount]   = useState('');
  const [currency,        setCurrency]        = useState('USD');
  const [gateway,         setGateway]         = useState('STRIPE');
  const [description,     setDescription]     = useState('');
  const [saving,          setSaving]          = useState(false);

  // Populate fields from the form prop when modal opens
  useEffect(() => {
    if (form && open) {
      setRequiresPayment(form.requiresPayment ?? false);
      setPaymentAmount(form.paymentAmount != null ? String(form.paymentAmount) : '');
      setCurrency(form.paymentCurrency || 'USD');
      setGateway(form.paymentGateway || 'STRIPE');
      setDescription(form.paymentDescription || '');
    }
  }, [form, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateForm({
        formId: form.id,
        updateData: {
          requiresPayment,
          paymentAmount: requiresPayment && paymentAmount ? parseFloat(paymentAmount) : null,
          paymentCurrency: requiresPayment ? currency : null,
          paymentGateway:  requiresPayment ? gateway : null,
          paymentDescription: requiresPayment ? description : null,
        },
      })).unwrap();

      dispatch(fetchAllForms({}));
      notify.success('Payment settings saved!');
      onClose();
    } catch {
      notify.error('Failed to save payment settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Payment Settings — ${form.title}`}>
      <Box sx={{ p: 2, minWidth: 340 }}>

        {/* Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={requiresPayment}
              onChange={(e) => setRequiresPayment(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" fontWeight={600}>
              Requires Payment
            </Typography>
          }
        />

        {requiresPayment && (
          <>
            <Divider sx={{ my: 2 }} />

            {/* Amount */}
            <TextField
              label="Amount"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              placeholder="e.g. 50.00"
            />

            {/* Currency */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Gateway */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Payment Gateway</InputLabel>
              <Select
                value={gateway}
                label="Payment Gateway"
                onChange={(e) => setGateway(e.target.value)}
              >
                {GATEWAYS.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Description */}
            <TextField
              label="Payment Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Power Bible School registration fee"
              multiline
              rows={2}
            />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={16} />}
            sx={{
              bgcolor: '#003999',
              '&:hover': { bgcolor: '#002d7a' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            startIcon={<CreditCard size={16} />}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

MinistryFormPaymentModal.propTypes = {
  open:    PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  form:    PropTypes.shape({
    id:                 PropTypes.number,
    title:              PropTypes.string,
    requiresPayment:    PropTypes.bool,
    paymentAmount:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentCurrency:    PropTypes.string,
    paymentGateway:     PropTypes.string,
    paymentDescription: PropTypes.string,
  }),
};

export default MinistryFormPaymentModal;
