import React from 'react';
import { Controller } from 'react-hook-form';

const FormToggle = ({
  name,
  control,
  title,
  activeText,
  inactiveText,
  color = 'green',
  watchedValues
}) => {
  const value = watchedValues && watchedValues[name];
  
  const colorMap = {
    green: {
      border: value ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
      toggle: 'peer-checked:bg-green-500',
      ring: 'peer-focus:ring-primary-300'
    },
    yellow: {
      border: value ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
      toggle: 'peer-checked:bg-yellow-500',
      ring: 'peer-focus:ring-yellow-300'
    },
    blue: {
      border: value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
      toggle: 'peer-checked:bg-blue-500',
      ring: 'peer-focus:ring-blue-300'
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <div className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${colorMap[color].border}`}>
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 ${colorMap[color].ring} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${colorMap[color].toggle}`}></div>
            </label>
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-600">
                {value ? activeText : inactiveText}
              </p>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default FormToggle;