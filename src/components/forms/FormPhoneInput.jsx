import React from 'react';
import { Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const FormPhoneInput = ({
  name,
  control,
  rules,
  label,
  placeholder,
  required = false,
  errors,
  defaultCountry = 'us',
  preferredCountries = ['us', 'gb', 'ng'],
  // Direct value/onChange for non-RHF usage
  value,
  onChange,
  id,
  className = '',
  ...props
}) => {
  const hasError = errors && errors[name];

  // Render function for the phone input component
  const renderPhoneInput = (inputValue, inputOnChange) => (
    <PhoneInput
      country={defaultCountry}
      value={inputValue}
      onChange={inputOnChange}
      placeholder={placeholder}
      preferredCountries={preferredCountries}
      enableSearch={true}
      containerClass={`w-full ${className}`}
      inputClass={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
        hasError
          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
      } hover:border-gray-400`}
      buttonClass="border-r-0"
      inputStyle={{
        width: '100%',
        height: '48px',
        fontSize: '16px',
        paddingLeft: '60px'
      }}
      containerStyle={{
        width: '100%'
      }}
      buttonStyle={{
        border: hasError
          ? '1px solid #fca5a5'
          : '1px solid #d1d5db',
        borderRadius: '0.5rem 0 0 0.5rem',
        backgroundColor: 'white'
      }}
      {...props}
    />
  );

  // If control is provided, use React Hook Form Controller
  if (control) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field: { onChange: rhfOnChange, value: rhfValue } }) => (
            <div>
              {renderPhoneInput(rhfValue, rhfOnChange)}
              {hasError && (
                <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
              )}
            </div>
          )}
        />
      </div>
    );
  }

  // Direct usage without React Hook Form
  return (
    <div id={id} className={className}>
      {renderPhoneInput(value, onChange)}
    </div>
  );
};

export default FormPhoneInput;