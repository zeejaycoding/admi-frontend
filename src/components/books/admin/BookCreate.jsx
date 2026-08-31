import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { notify } from '../../../services/utils/authUtils';
import { createBookWithFiles, clearError, clearSuccess } from '../../../store/slices/bookSlice';
import {
  CampusFormLayout,
  FormSection,
  FormInput,
  FormTextarea,
  FormSelect,
} from '../../forms';
import FileUpload from '../../ui/FileUpload';

const BookCreate = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.book);

  const [pdfFile, setPdfFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [backCoverImageFile, setBackCoverImageFile] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      description: '',
      publisher: '',
      language: 'English',
      basePrice: '',
      ngnPrice: '',
      baseCurrency: 'USD',
      tags: '',
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const onSubmit = async (data) => {
    // Validate required files
    if (!pdfFile) {
      notify.error('Please upload a PDF file');
      return;
    }
    if (!coverImageFile) {
      notify.error('Please upload a cover image');
      return;
    }

    try {
      // Prepare book data
      const bookData = {
        ...data,
        basePrice: parseFloat(data.basePrice),
        ngnPrice: data.ngnPrice ? parseFloat(data.ngnPrice) : null,
        tags: data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) : [],
        isActive: true,
      };

      // Dispatch create action
      await dispatch(
        createBookWithFiles({
          bookData,
          pdfFile,
          coverImageFile,
          backCoverImageFile,
        })
      ).unwrap();

      notify.success('Book uploaded successfully!');
      reset();
      setPdfFile(null);
      setCoverImageFile(null);
      setBackCoverImageFile(null);
      dispatch(clearSuccess());
      onSuccess();
    } catch (err) {
      notify.error(err.message || 'Failed to create book');
    }
  };

  const handleCancel = () => {
    reset();
    setPdfFile(null);
    setCoverImageFile(null);
    setBackCoverImageFile(null);
    dispatch(clearError());
    dispatch(clearSuccess());
    onCancel();
  };

  // Language options
  const languages = [
    { code: 'English', name: 'English' },
    { code: 'Yoruba', name: 'Yoruba' },
    { code: 'Igbo', name: 'Igbo' },
    { code: 'Hausa', name: 'Hausa' },
    { code: 'French', name: 'French' },
    { code: 'Spanish', name: 'Spanish' },
    { code: 'Portuguese', name: 'Portuguese' },
  ];

  // Currency options
  // eslint-disable-next-line no-unused-vars
  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  ];

  return (
    <CampusFormLayout
      title="Add New Book"
      subtitle="Upload book files and fill in the details"
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      onCancel={handleCancel}
      isValid={isValid && pdfFile && coverImageFile}
      submitText="Add Book"
      loadingText="Uploading..."
    >
      {/* File Uploads Section */}
      <FormSection
        title="File Uploads"
      >
        <div className="space-y-6">
          {/* PDF Upload */}
          <FileUpload
            label="Book PDF *"
            accept="application/pdf"
            maxSize={50 * 1024 * 1024} // 50MB
            onFileSelect={setPdfFile}
            value={pdfFile}
            showPreview={false}
            helperText="Upload book PDF (max 50MB)"
            disabled={isLoading}
          />

          {/* Cover Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Front Cover Image *"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              onFileSelect={setCoverImageFile}
              value={coverImageFile}
              showPreview={true}
              helperText="PNG, JPG, WebP (max 5MB)"
              disabled={isLoading}
            />

            <FileUpload
              label="Back Cover Image (Optional)"
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              onFileSelect={setBackCoverImageFile}
              value={backCoverImageFile}
              showPreview={true}
              helperText="PNG, JPG, WebP (max 5MB)"
              disabled={isLoading}
            />
          </div>
        </div>
      </FormSection>

      {/* Book Details Section */}
      <FormSection
        title="Book Details"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="title"
              control={control}
              rules={{
                required: 'Title is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              }}
              label="Book Title"
              placeholder="Enter book title"
              required
              errors={errors}
            />

            <FormInput
              name="author"
              control={control}
              rules={{
                required: 'Author is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              }}
              label="Author"
              placeholder="Enter author name"
              required
              errors={errors}
            />
          </div>

          <FormInput
            name="publisher"
            control={control}
            label="Publisher"
            placeholder="Enter publisher name (optional)"
            errors={errors}
          />

          <FormTextarea
            name="description"
            control={control}
            rules={{
              required: 'Description is required',
              minLength: { value: 10, message: 'Minimum 10 characters' },
            }}
            label="Description"
            placeholder="Brief description of the book"
            required
            maxLength={1000}
            watchedValues={watchedValues}
            errors={errors}
          />
        </div>
      </FormSection>

      {/* Pricing & Language Section */}
      <FormSection
        title="Pricing & Language"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelect
              name="language"
              control={control}
              rules={{ required: 'Language is required' }}
              label="Language"
              placeholder="Select language"
              required
              options={languages}
              optionValue="code"
              optionLabel={(lang) => lang.name}
              errors={errors}
            />

            <FormInput
              name="tags"
              control={control}
              label="Tags (Optional)"
              placeholder="tag1, tag2, tag3"
              helperText="Comma-separated tags"
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              name="basePrice"
              control={control}
              rules={{
                required: 'USD Price is required',
                min: { value: 0, message: 'Price must be positive' },
              }}
              label="USD Price ($)"
              type="number"
              placeholder="0.00"
              required
              helperText="Price in US Dollars"
              errors={errors}
            />

            <FormInput
              name="ngnPrice"
              control={control}
              rules={{
                min: { value: 0, message: 'Price must be positive' },
              }}
              label="NGN Price (₦)"
              type="number"
              placeholder="0.00"
              helperText="Price in Nigerian Naira (optional)"
              errors={errors}
            />
          </div>
        </div>
      </FormSection>
    </CampusFormLayout>
  );
};

export default BookCreate;
