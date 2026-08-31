import React from 'react';
import { Controller } from 'react-hook-form';

const FormSelect = ({
  name,
  control,
  rules,
  label,
  placeholder = "Select an option",
  required = false,
  errors,
  options = [],
  optionLabel = 'label',
  optionValue = 'value',
  renderOption,
  ...props
}) => {
  const hasError = errors && errors[name];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <div>
            <select
              {...field}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                hasError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              } hover:border-gray-400 bg-white`}
              {...props}
            >
              <option value="">{placeholder}</option>
              {options.map((option) => {
                if (renderOption) {
                  return renderOption(option);
                }
                
                const value = typeof option === 'object' ? option[optionValue] : option;
                const label = typeof optionLabel === 'function' 
                  ? optionLabel(option)
                  : typeof option === 'object' ? option[optionLabel] : option;
                
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default FormSelect;