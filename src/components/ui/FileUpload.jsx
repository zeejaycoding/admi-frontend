import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

/**
 * Reusable FileUpload Component
 *
 * @param {Function} onFileSelect - Callback when file is selected (file) => void
 * @param {string} accept - Accepted file types (e.g., 'image/*', 'application/pdf')
 * @param {number} maxSize - Max file size in bytes (default: 10MB)
 * @param {string} label - Label text for the upload area
 * @param {boolean} showPreview - Whether to show image preview (default: true)
 * @param {string} helperText - Helper text to display below upload area
 * @param {File} value - Current file value (for controlled component)
 * @param {boolean} disabled - Whether the upload is disabled
 * @param {string} error - Error message to display
 */
const FileUpload = ({
  onFileSelect,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload File',
  showPreview = true,
  helperText = '',
  value = null,
  disabled = false,
  error = '',
}) => {
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setUploadError('');

      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors) {
          const errorMessages = rejection.errors.map(e => e.message).join(', ');
          setUploadError(errorMessages);
        }
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Create preview for images
        if (showPreview && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result);
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }

        onFileSelect(file);
      }
    },
    [onFileSelect, showPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => ({ ...acc, [curr.trim()]: [] }), {}),
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemove = () => {
    setPreview(null);
    setUploadError('');
    onFileSelect(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;

    if (file.type.startsWith('image/')) {
      return <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    } else if (file.type === 'application/pdf') {
      return <PictureAsPdfIcon sx={{ fontSize: 48, color: 'error.main' }} />;
    }
    return <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />;
  };

  const displayError = error || uploadError;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label */}
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
      )}

      {/* Upload Area */}
      {!value && (
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: displayError ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            bgcolor: disabled ? 'action.disabledBackground' : isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: disabled ? 'divider' : 'primary.main',
              bgcolor: disabled ? 'action.disabledBackground' : 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: disabled ? 'action.disabled' : 'primary.main', mb: 1 }} />
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500, mb: 0.5 }}>
            {isDragActive ? 'Drop the file here' : 'Drag & drop file here'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            or{' '}
            <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
              click to browse
            </Box>
          </Typography>
          {helperText && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {helperText}
            </Typography>
          )}
        </Box>
      )}

      {/* File Preview/Info */}
      {value && (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            bgcolor: 'background.paper',
          }}
        >
          {/* Image Preview */}
          {preview && showPreview ? (
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 1,
                  mb: 1,
                }}
              />
              <IconButton
                onClick={handleRemove}
                disabled={disabled}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'error.main', color: 'white' },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            // File Info (for PDFs and non-preview files)
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getFileIcon(value)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {value.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatFileSize(value.size)}
                </Typography>
              </Box>
              <IconButton
                onClick={handleRemove}
                disabled={disabled}
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.light' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* Error Message */}
      {displayError && (
        <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
          {displayError}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
