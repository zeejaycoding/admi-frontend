import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  updateCampus, 
  getSupportedRegions, 
  getSupportedCurrencies 
} from '../../../store/slices/campusSlice';
import { notify } from '../../../services/utils/authUtils';
import {
  CampusFormLayout,
  FormSection,
  FormInput,
  FormTextarea,
  FormSelect,
  FormToggle,
  FormPhoneInput
} from '../../forms';

const CampusEdit = ({ campus, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { isLoading, error, regions, currencies } = useSelector((state) => state.campus);

  // Process currencies to ensure correct structure
  const processedCurrencies = React.useMemo(() => {
    // Always use the fallback currencies since backend expects just codes
    const fallbackCurrencies = [
      { code: 'GBP', symbol: '£', name: 'British Pound Sterling', country: 'UK' },
      { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa' },
      { code: 'USD', symbol: '$', name: 'US Dollar', country: 'USA' },
      { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', country: 'Ghana' },
      { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria' }
    ];
    
    // If API returns currencies, try to use them, otherwise use fallback
    if (Array.isArray(currencies) && currencies.length > 0) {
      // If API returns array of strings (codes)
      if (typeof currencies[0] === 'string') {
        return currencies.map(code => {
          const found = fallbackCurrencies.find(c => c.code === code);
          return found || { code, symbol: '', name: code, country: '' };
        });
      }
      
      // If API returns array of objects
      if (typeof currencies[0] === 'object' && currencies[0].code) {
        return currencies;
      }
    }
    
    return fallbackCurrencies;
  }, [currencies]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      region: '',
      country: '',
      currency: '',
      email: '',
      phoneNumber: '',
      coordinator: '',
      coordinatorEmail: '',
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      notes: '',
      isActive: true,
      isFeatured: false,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  useEffect(() => {
    dispatch(getSupportedRegions());
    dispatch(getSupportedCurrencies());
  }, [dispatch]);

  useEffect(() => {
    if (campus) {
      reset({
        name: campus.name || '',
        description: campus.description || '',
        address: campus.fullAddress || campus.address || '',
        city: campus.city || '',
        state: campus.state || '',
        region: campus.region || '',
        country: campus.country || '',
        currency: campus.currency || '',
        email: campus.email || '',
        phoneNumber: campus.phoneNumber || '',
        coordinator: campus.coordinator || '',
        coordinatorEmail: campus.coordinatorEmail || '',
        facebookUrl: campus.facebookUrl || '',
        instagramUrl: campus.instagramUrl || '',
        twitterUrl: campus.twitterUrl || '',
        notes: campus.notes || '',
        isActive: campus.isActive ?? true,
        isFeatured: campus.isFeatured ?? false,
      });
    }
  }, [campus, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateCampus({ id: campus.id, campusData: data })).unwrap();
      onSuccess();
    } catch (error) {
      notify.error('Failed to update campus. Please try again.');
    }
  };

  if (!campus) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h3 className="text-red-800 text-lg font-semibold mb-2">
            No campus data provided
          </h3>
          <p className="text-red-600 text-sm">
            Please select a campus to edit
          </p>
        </div>
      </div>
    );
  }

  return (
    <CampusFormLayout
      title="Edit Campus"
      subtitle={<>Update information for <strong>{campus.name}</strong></>}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
      onCancel={onCancel}
      isValid={isValid}
      submitText="Save Changes"
      loadingText="Updating..."
    >
      {/* Basic Information Section */}
      <FormSection
        title="Basic Information"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            name="name"
            control={control}
            rules={{ 
              required: 'Campus name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' }
            }}
            label="Campus Name"
            placeholder="Enter campus name"
            required
            errors={errors}
          />

          <FormInput
            name="email"
            control={control}
            rules={{ 
              required: 'Contact email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            }}
            label="Contact Email"
            type="email"
            placeholder="campus@example.com"
            required
            errors={errors}
          />
        </div>

        <FormTextarea
          name="description"
          control={control}
          rules={{ 
            required: 'Description is required',
            minLength: { value: 10, message: 'Minimum 10 characters' }
          }}
          label="Description"
          placeholder="Brief description of the campus"
          required
          maxLength={500}
          watchedValues={watchedValues}
          errors={errors}
        />
      </FormSection>

      {/* Location Information Section */}
      <FormSection
        title="Location Details"
      >
        <div className="space-y-6">
          <FormInput
            name="address"
            control={control}
            rules={{ required: 'Address is required' }}
            label="Full Address"
            placeholder="Street address, building number"
            required
            errors={errors}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              name="city"
              control={control}
              rules={{ required: 'City is required' }}
              label="City"
              placeholder="City name"
              required
              errors={errors}
            />

            <FormInput
              name="state"
              control={control}
              rules={{ required: 'State is required' }}
              label="State/Province"
              placeholder="State or province"
              required
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelect
              name="region"
              control={control}
              rules={{ required: 'Region is required' }}
              label="Region"
              placeholder="Select region"
              required
              options={regions}
              errors={errors}
            />

            <FormInput
              name="country"
              control={control}
              rules={{ required: 'Country is required' }}
              label="Country"
              placeholder="Country name"
              required
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormSelect
              name="currency"
              control={control}
              rules={{ required: 'Currency is required' }}
              label="Currency"
              placeholder="Select currency"
              required
              options={processedCurrencies}
              optionValue="code"
              optionLabel={(currency) => `${currency.code} - ${currency.name} (${currency.symbol})`}
              errors={errors}
            />

            <FormPhoneInput
              name="phoneNumber"
              control={control}
              rules={{ required: 'Phone number is required' }}
              label="Phone Number"
              placeholder="Enter phone number"
              required
              errors={errors}
            />
          </div>
        </div>
      </FormSection>

      {/* Coordinator Information Section */}
      <FormSection
        title="Coordinator Information"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormInput
            name="coordinator"
            control={control}
            rules={{ required: 'Coordinator name is required' }}
            label="Coordinator Name"
            placeholder="Enter coordinator name"
            required
            errors={errors}
          />

          <FormInput
            name="coordinatorEmail"
            control={control}
            rules={{
              required: 'Coordinator email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            }}
            label="Coordinator Email"
            type="email"
            placeholder="coordinator@example.com"
            required
            errors={errors}
          />
        </div>
      </FormSection>

      {/* Social Media Section */}
      <FormSection
        title="Social Media Links"
      >
        <div className="grid grid-cols-1 gap-6">
          <FormInput
            name="facebookUrl"
            control={control}
            rules={{
              pattern: {
                value: /^https?:\/\/(www\.)?facebook\.com\/.+$/,
                message: 'Please enter a valid Facebook URL'
              }
            }}
            label="Facebook URL"
            placeholder="https://facebook.com/yourcampus"
            errors={errors}
          />

          <FormInput
            name="instagramUrl"
            control={control}
            rules={{
              pattern: {
                value: /^https?:\/\/(www\.)?instagram\.com\/.+$/,
                message: 'Please enter a valid Instagram URL'
              }
            }}
            label="Instagram URL"
            placeholder="https://instagram.com/yourcampus"
            errors={errors}
          />

          <FormInput
            name="twitterUrl"
            control={control}
            rules={{
              pattern: {
                value: /^https?:\/\/(www\.)?(twitter|x)\.com\/.+$/,
                message: 'Please enter a valid Twitter/X URL'
              }
            }}
            label="Twitter/X URL"
            placeholder="https://twitter.com/yourcampus"
            errors={errors}
          />
        </div>
      </FormSection>

      {/* Additional Information Section */}
      <FormSection
        title="Additional Information"
      >
        <FormTextarea
          name="notes"
          control={control}
          label="Internal Notes"
          placeholder="Add any internal notes about this campus (not visible to public)"
          maxLength={1000}
          watchedValues={watchedValues}
          errors={errors}
        />
      </FormSection>

      {/* Settings Section */}
      <FormSection
        title="Campus Settings"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormToggle
            name="isActive"
            control={control}
            title="Active Campus"
            activeText="Campus is active and visible"
            inactiveText="Campus is inactive"
            watchedValues={watchedValues}
          />

          <FormToggle
            name="isFeatured"
            control={control}
            title="Featured Campus"
            activeText="Will appear in featured list"
            inactiveText="Regular campus listing"
            watchedValues={watchedValues}
          />
        </div>
      </FormSection>
    </CampusFormLayout>
  );
};

export default CampusEdit;