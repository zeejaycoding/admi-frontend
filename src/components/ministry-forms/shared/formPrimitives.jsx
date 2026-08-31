import React from 'react';

// Shared presentational primitives for the ministry-form components.
// Extracted verbatim to de-duplicate identical copies across the 5 forms —
// markup, classNames and behaviour are byte-for-byte identical to the originals.

export const inp =
  'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-200 hover:border-gray-400 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400';

export const inpErr =
  'w-full px-4 py-3 rounded-lg border border-red-400 bg-white focus:outline-none focus:ring-2 focus:border-red-500 focus:ring-red-200 hover:border-red-400 transition-all duration-200 text-sm text-gray-900 placeholder-gray-400';

export const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

export const ErrMsg = ({ msg }) => msg ? <p className="mt-1 text-xs text-red-500">{msg}</p> : null;

export const RadioOpt = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

// Maps region codes to the default country for FormPhoneInput.
export const REGION_PHONE = { NG: 'ng', US: 'us', UK: 'gb', ZA: 'za', GH: 'gh' };
