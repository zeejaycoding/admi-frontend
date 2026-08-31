import React from 'react';
import { Controller } from 'react-hook-form';

const FormTextarea = ({
  name,
  control,
  rules,
  label,
  placeholder,
  required = false,
  errors,
  rows = 4,
  maxLength,
  watchedValues,
  ...props
}) => {
  const hasError = errors && errors[name];
  const currentLength = watchedValues && watchedValues[name] ? watchedValues[name].length : 0;
  
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
            <textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              maxLength={maxLength}
              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                hasError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              } hover:border-gray-400`}
              {...props}
            />
            <div className="flex justify-between mt-1">
              {hasError && (
                <p className="text-sm text-red-600">{errors[name].message}</p>
              )}
              {maxLength && (
                <p className="text-sm text-gray-400 ml-auto">
                  {currentLength}/{maxLength} characters
                </p>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default FormTextarea;