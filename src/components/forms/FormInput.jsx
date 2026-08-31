import React from 'react';
import { Controller } from 'react-hook-form';

const FormInput = ({
  name,
  control,
  rules,
  label,
  type = "text",
  placeholder,
  required = false,
  errors,
  helperText,
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
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-300 ${
                hasError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              } hover:border-gray-400`}
              {...props}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
            )}
            {helperText && !hasError && (
              <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default FormInput;