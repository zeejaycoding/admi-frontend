import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import formService from '../../../services/api/formService';
import FormSubmissions from './FormSubmissions';

const REPORT_FORM_CODE = 'MONTHLY_REPORT';

/**
 * Reports dashboard = the "Monthly Report" form's submissions.
 * Reuses the shared FormSubmissions view (listing, detail viewer, export) instead of
 * a bespoke reports screen. Coordinators submit via the form's public share link.
 */
const ReportSubmissions = () => {
  const [formId, setFormId] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing

  useEffect(() => {
    let cancelled = false;
    formService
      .getFormByFormCode(REPORT_FORM_CODE)
      .then((form) => {
        if (cancelled) return;
        if (form?.id) {
          setFormId(form.id);
          setStatus('ready');
        } else {
          setStatus('missing');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('missing');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'missing') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Monthly Report form not found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The Monthly Report form is seeded on backend startup. Restart the backend,
          then reload this page.
        </Typography>
      </Box>
    );
  }

  return <FormSubmissions formId={formId} />;
};

export default ReportSubmissions;
