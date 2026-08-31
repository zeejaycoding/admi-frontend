import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Divider,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Link2, Copy } from 'lucide-react';
import { notify } from '../../services/utils/authUtils';

const FormSettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    // If setting formCode, clear eventCode
    if (field === 'formCode' && value && value.trim() !== '') {
      onChange({ ...settings, [field]: value, eventCode: '' });
    }
    // If setting eventCode, clear formCode
    else if (field === 'eventCode' && value && value.trim() !== '') {
      onChange({ ...settings, [field]: value, formCode: '' });
    }
    else {
      onChange({ ...settings, [field]: value });
    }
  };

  const hasFormCode = settings.formCode && settings.formCode.trim() !== '';
  const hasEventCode = settings.eventCode && settings.eventCode.trim() !== '';

  const shareCode = (settings.formCode || settings.eventCode || '').trim();
  const shareLink = shareCode
    ? `${window.location.origin}/forms/${shareCode.toLowerCase()}`
    : '';

  const handleCopyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => notify.success('Share link copied to clipboard!'))
      .catch(() => notify.error('Could not copy the link'));
  };

  // Derive a clean share code from the form title so admins don't have to invent one.
  const handleGenerateCode = () => {
    const code = (settings.title || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    if (code) handleChange('formCode', code);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #e5e7eb',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1f2937' }}>
        Form Settings
      </Typography>

      {/* Basic Settings */}
      <TextField
        fullWidth
        label="Form Title"
        value={settings.title || ''}
        onChange={(e) => handleChange('title', e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Description"
        value={settings.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Success Message"
        value={settings.successMessage || ''}
        onChange={(e) => handleChange('successMessage', e.target.value)}
        helperText="Message shown after successful submission"
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ my: 3 }} />

      {/* Form Categorization */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
        Form Categorization (Mutually Exclusive)
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="caption">
          Choose ONE: Either <strong>Form Code</strong> (for page-based forms like Partnership)
          or <strong>Event Code</strong> (for program/event forms). Cannot use both.
        </Typography>
      </Alert>

      <TextField
        fullWidth
        label="Form Code"
        value={settings.formCode || ''}
        onChange={(e) => handleChange('formCode', e.target.value)}
        helperText="For page-based forms (e.g., PARTNERSHIP). Disables Event Code when filled."
        disabled={hasEventCode}
        sx={{ mb: 2 }}
        InputLabelProps={{
          sx: { fontWeight: hasFormCode ? 600 : 400 }
        }}
      />

      <TextField
        fullWidth
        label="Event Code"
        value={settings.eventCode || ''}
        onChange={(e) => handleChange('eventCode', e.target.value)}
        helperText="For program/event forms shown on Programs page. Disables Form Code when filled."
        disabled={hasFormCode}
        sx={{ mb: 3 }}
        InputLabelProps={{
          sx: { fontWeight: hasEventCode ? 600 : 400 }
        }}
      />

      {/* Shareable Link */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Link2 size={16} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Shareable Link
          </Typography>
        </Box>
        {shareLink ? (
          <>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
              Anyone with this link can open and submit the form.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={shareLink}
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
              <Button
                variant="contained"
                onClick={handleCopyShareLink}
                startIcon={<Copy size={16} />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Copy
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
              This form has no share code yet. Generate one to get a copyable link
              (or type a Form Code above).
            </Typography>
            <Button
              variant="outlined"
              onClick={handleGenerateCode}
              disabled={!settings.title || settings.title.trim() === ''}
              startIcon={<Link2 size={16} />}
            >
              Generate Share Link
            </Button>
          </>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Submission Settings */}
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#374151' }}>
        Submission Settings
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={settings.requireAuthentication || false}
            onChange={(e) => handleChange('requireAuthentication', e.target.checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Require Authentication
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Users must be logged in to submit this form
            </Typography>
          </Box>
        }
        sx={{ mb: 2, alignItems: 'flex-start', ml: 0 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.isPublished || false}
            onChange={(e) => handleChange('isPublished', e.target.checked)}
          />
        }
        label={
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Publish Form
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Make this form publicly accessible on the Programs page
            </Typography>
          </Box>
        }
        sx={{ alignItems: 'flex-start', ml: 0 }}
      />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Payment Required
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Collect payment before accepting form submissions
          </Typography>
        </Box>
        <Switch
          checked={settings.requiresPayment || false}
          onChange={(e) => onChange({ ...settings, requiresPayment: e.target.checked })}
        />
      </Box>

      {settings.requiresPayment && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Amount"
              type="number"
              size="small"
              value={settings.paymentAmount || ''}
              onChange={(e) => onChange({ ...settings, paymentAmount: e.target.value })}
              sx={{ flex: 1 }}
              slotProps={{ input: { inputProps: { min: 0, step: 0.01 } } }}
              helperText="Set 0 for free registration"
            />
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                label="Currency"
                value={settings.paymentCurrency || 'USD'}
                onChange={(e) => onChange({ ...settings, paymentCurrency: e.target.value })}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="NGN">NGN</MenuItem>
                <MenuItem value="GHS">GHS</MenuItem>
                <MenuItem value="ZAR">ZAR</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>Payment Gateway</InputLabel>
            <Select
              label="Payment Gateway"
              value={settings.paymentGateway || 'STRIPE'}
              onChange={(e) => onChange({ ...settings, paymentGateway: e.target.value })}
            >
              <MenuItem value="STRIPE">Stripe</MenuItem>
              <MenuItem value="PAYPAL">PayPal</MenuItem>
              <MenuItem value="BOTH">Stripe &amp; PayPal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Payment Description"
            placeholder="e.g. Conference registration fee"
            value={settings.paymentDescription || ''}
            onChange={(e) => onChange({ ...settings, paymentDescription: e.target.value })}
          />
        </Box>
      )}
    </Paper>
  );
};

export default FormSettings;
