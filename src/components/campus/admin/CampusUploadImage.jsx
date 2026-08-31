import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadCampusImage } from '../../../store/slices/campusSlice';
import { notify } from '../../../services/utils/authUtils';

const CampusUploadImage = ({ campus, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const { isLoading, error } = useSelector((state) => state.campus);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      await dispatch(uploadCampusImage({ id: campus.id, imageFile: selectedFile })).unwrap();
      onSuccess();
    } catch (error) {
      notify.error('Failed to upload image. Please try again.');
    }
  };

  if (!campus) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-red-800 text-lg font-semibold mb-2">
            No campus selected
          </h3>
          <p className="text-red-600 text-sm">
            Please select a campus to upload image
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload Campus Image
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Upload an image for <strong>{campus.name}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Image
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="text-gray-600">
                    <span className="font-medium text-primary-600 hover:text-primary-500">
                      Click to upload
                    </span> or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="relative w-48 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                Error: {error.message || 'Failed to upload image'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            {/* <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uploading...' : 'Upload Image'}
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampusUploadImage;
