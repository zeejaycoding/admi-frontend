import PropTypes from 'prop-types';

const CampusFormLayout = ({
  title,
  subtitle,
  onSubmit,
  isLoading,
  error,
  onCancel,
  isValid,
  submitText = 'Save Changes',
  loadingText = 'Saving...',
  children,
}) => {
  return (
    <div>
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-8">
          {children}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-center font-medium">
                {error.message || 'An error occurred'}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {loadingText}
                </span>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
    </div>
  );
};

CampusFormLayout.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onSubmit: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.shape({ message: PropTypes.string }),
  onCancel: PropTypes.func,
  isValid: PropTypes.bool,
  submitText: PropTypes.string,
  loadingText: PropTypes.string,
  children: PropTypes.node,
};

export default CampusFormLayout;
