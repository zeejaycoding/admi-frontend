import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { notify } from '../../../services/utils/authUtils';
import { createCourse, updateCourse, clearError, clearSuccess } from '../../../store/slices/courseSlice';
import {
  CampusFormLayout,
  FormSection,
  FormInput,
  FormTextarea,
} from '../../forms';
import FileUpload from '../../ui/FileUpload';

const CourseCreate = ({ onSuccess, onCancel, course = null }) => {
  const dispatch = useDispatch();
  const { isLoading, error, courses = [] } = useSelector((state) => state.course);

  // Suggest categories already in use (free-text — admins can type anything new).
  const categorySuggestions = [...new Set((courses || []).map((c) => c.category).filter(Boolean))];

  const isEditMode = Boolean(course);

  const [thumbnailFile, setThumbnailFile] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      title: course?.title || '',
      description: course?.description || '',
      category: course?.category || '',
      basePrice: course?.basePrice ?? '',
      ngnPrice: course?.ngnPrice ?? '',
      baseCurrency: course?.baseCurrency || 'USD',
      isActive: course?.isActive ?? true,
      isFeatured: course?.isFeatured || false,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Parse to a finite number, else fall back (guards against '' and non-numeric input).
  const toNumber = (value, fallback) => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const onSubmit = async (data) => {
    try {
      // Prepare course data
      const courseData = {
        ...data,
        basePrice: toNumber(data.basePrice, 0),
        ngnPrice: toNumber(data.ngnPrice, null),
        isActive: isEditMode ? (course.isActive ?? true) : true,
        isFeatured: data.isFeatured || false,
      };

      if (isEditMode) {
        await dispatch(
          updateCourse({
            id: course.id,
            updateData: courseData,
            thumbnailFile,
          })
        ).unwrap();
        notify.success('Course updated successfully!');
      } else {
        await dispatch(
          createCourse({
            courseData,
            thumbnailFile,
          })
        ).unwrap();
        notify.success('Course created successfully! You can now add lessons.');
      }

      reset();
      setThumbnailFile(null);
      dispatch(clearSuccess());
      onSuccess();
    } catch (err) {
      notify.error(err.message || (isEditMode ? 'Failed to update course' : 'Failed to create course'));
    }
  };

  const handleCancel = () => {
    reset();
    setThumbnailFile(null);
    dispatch(clearError());
    dispatch(clearSuccess());
    onCancel();
  };

  return (
    <CampusFormLayout
      title={isEditMode ? 'Edit Course' : 'Create New Course'}
      subtitle={isEditMode ? 'Update course details' : 'Create a course and add audio lessons later'}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      onCancel={handleCancel}
      isValid={isValid}
      submitText={isEditMode ? 'Save changes' : 'Create Course'}
      loadingText={isEditMode ? 'Saving...' : 'Creating...'}
    >
      {/* Course Details Section */}
      <FormSection
        title="Course Details"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="title"
              control={control}
              rules={{
                required: 'Course title is required',
                minLength: { value: 3, message: 'Minimum 3 characters' },
              }}
              label="Course Title"
              placeholder="Enter course title"
              required
              errors={errors}
            />
          </div>

          <FormInput
            name="category"
            control={control}
            label="Category"
            placeholder="e.g. Power Bible School, ADOMA, TED…"
            list="course-categories"
            errors={errors}
          />
          <datalist id="course-categories">
            {categorySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <FormTextarea
            name="description"
            control={control}
            label="Description"
            placeholder="Short description"
            maxLength={2000}
            watchedValues={watchedValues}
            errors={errors}
          />
        </div>
      </FormSection>

      {/* Thumbnail Upload Section */}
      <FormSection
        title="Course Thumbnail"
      >
        <div className="space-y-6">
          <FileUpload
            label="Course Thumbnail (Optional)"
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            onFileSelect={setThumbnailFile}
            value={thumbnailFile}
            showPreview={true}
            helperText="PNG, JPG, WebP (800x450px recommended, max 5MB)"
            disabled={isLoading}
          />
        </div>
      </FormSection>

      {/* Pricing Section */}
      <FormSection
        title="Pricing"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              name="basePrice"
              control={control}
              rules={{
                min: { value: 0, message: 'Price cannot be negative' },
              }}
              label="USD Price ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              helperText="Enter 0 for a free course"
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
              step="0.01"
              placeholder="0.00"
              helperText="Optional"
              errors={errors}
            />
          </div>
        </div>
      </FormSection>
    </CampusFormLayout>
  );
};

export default CourseCreate;
