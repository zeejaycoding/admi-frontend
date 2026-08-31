import React from 'react';
import {
    Dialog,
    DialogContent,
} from '@mui/material';
import {
    X,
    Download,
    User,
    Mail,
    Calendar,
    FileText,
    ExternalLink,
} from 'lucide-react';
import apiClient from '../../../services/utils/apiClient';
import { notify } from '../../../services/utils/authUtils';

const SubmissionDetail = ({ open, onClose, submission }) => {

    const handleDownloadFile = async (s3Key, fileName, forceDownload = true) => {
        try {
            // Get presigned URL from secure backend endpoint
            const response = await apiClient.get('/form-submissions/admin/file/download', {
                params: {
                    s3Key: s3Key,
                    expirationHours: 1,
                },
            });

            if (response.data?.presignedUrl) {
                if (forceDownload) {
                    // Force download by fetching as blob
                    const fileResponse = await fetch(response.data.presignedUrl);
                    const blob = await fileResponse.blob();
                    const blobUrl = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = fileName || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Clean up blob URL
                    window.URL.revokeObjectURL(blobUrl);
                } else {
                    // Just view in new tab
                    window.open(response.data.presignedUrl, '_blank');
                }
            }
        } catch (error) {
            notify.error(error?.response?.data?.message || 'Failed to download file. Please try again.');
        }
    };

    const renderFieldValue = (field, value) => {
        if (!value) return <span className="text-gray-400">-</span>;

        // Handle file uploads
        if (typeof value === 'object' && value.fileUrl) {
            return (
                <button
                    onClick={() => handleDownloadFile(value.fileUrl, value.fileName)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <Download size={16} />
                    <span>{value.fileName || 'Download File'}</span>
                    {value.fileSize && (
                        <span className="text-xs text-gray-500">
                            ({(value.fileSize / 1024).toFixed(1)} KB)
                        </span>
                    )}
                </button>
            );
        }

        // Handle arrays
        if (Array.isArray(value)) {
            if (value.length === 0) return <span className="text-gray-400">-</span>;

            // Multi-file field → list of download links
            if (value.every((v) => v && typeof v === 'object' && v.fileUrl)) {
                return (
                    <div className="space-y-1">
                        {value.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => handleDownloadFile(f.fileUrl, f.fileName)}
                                className="flex items-center gap-2 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Download size={16} />
                                <span>{f.fileName || 'Download File'}</span>
                            </button>
                        ))}
                    </div>
                );
            }

            // Repeater rows → table
            if (value.every((v) => v && typeof v === 'object')) {
                const columns = Array.from(new Set(value.flatMap((row) => Object.keys(row))));
                return (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-200 rounded">
                            <thead>
                                <tr className="bg-gray-50">
                                    {columns.map((col) => (
                                        <th key={col} className="text-left px-3 py-1.5 font-medium text-gray-600 border-b border-gray-200">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {value.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 last:border-0">
                                        {columns.map((col) => (
                                            <td key={col} className="px-3 py-1.5 text-gray-900">{row[col] ?? ''}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }

            // Checkboxes / scalar arrays
            return <span className="text-gray-900">{value.join(', ')}</span>;
        }

        // Handle objects
        if (typeof value === 'object') {
            return <span className="text-gray-900">{JSON.stringify(value)}</span>;
        }

        // Handle regular text
        return <span className="text-gray-900">{value.toString()}</span>;
    };

    // Extract files from submission data
    const getFiles = () => {
        if (!submission?.submissionData) return [];
        const files = [];
        Object.entries(submission.submissionData).forEach(([key, value]) => {
            if (value && typeof value === 'object' && value.fileUrl) {
                files.push({ key, ...value });
            } else if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (item && typeof item === 'object' && item.fileUrl) {
                        files.push({ key, ...item });
                    }
                });
            }
        });
        return files;
    };

    if (!submission) return null;

    const files = getFiles();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                {/* Header */}
                <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        Submission #{submission.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Submission Info */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Submission Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <FileText className="text-primary-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-gray-500">Form</p>
                                    <p className="text-sm font-medium text-gray-900">{submission.formTitle}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <User className="text-primary-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-gray-500">Submitted By</p>
                                    <p className="text-sm font-medium text-gray-900">{submission.userName || 'Anonymous'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="text-primary-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{submission.userEmail || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-primary-600 mt-0.5" size={18} />
                                <div>
                                    <p className="text-xs text-gray-500">Submitted At</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Attachments</h3>
                        {files.length > 0 ? (
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary-100 rounded-lg">
                                                <FileText className="text-primary-600" size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                                                {file.fileSize && (
                                                    <p className="text-xs text-gray-500">
                                                        {(file.fileSize / 1024).toFixed(1)} KB
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownloadFile(file.fileUrl, file.fileName, false)}
                                                className="flex items-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                                title="View file"
                                            >
                                                <ExternalLink size={16} />
                                                <span>View</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownloadFile(file.fileUrl, file.fileName, true)}
                                                className="flex items-center gap-1 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition-colors"
                                                title="Download file"
                                            >
                                                <Download size={16} />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No files attached</p>
                        )}
                    </div>

                    {/* Form Responses */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Form Responses</h3>
                        {submission.submissionData && Object.keys(submission.submissionData).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(submission.submissionData).map(([key, value]) => {
                                    // Skip file fields (single or multi) — shown in the Attachments section
                                    if (value && typeof value === 'object' && value.fileUrl) {
                                        return null;
                                    }
                                    if (Array.isArray(value) && value.length > 0 &&
                                        value.every((v) => v && typeof v === 'object' && v.fileUrl)) {
                                        return null;
                                    }
                                    return (
                                        <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
                                            <p className="text-xs font-medium text-gray-500 mb-1">{key}</p>
                                            <div className="text-sm">{renderFieldValue(key, value)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No form data available</p>
                        )}
                    </div>

                    {/* Close Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SubmissionDetail;
