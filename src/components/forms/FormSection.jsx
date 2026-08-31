import React from 'react';

const FormSection = ({ title, description, children }) => {
  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default FormSection;
