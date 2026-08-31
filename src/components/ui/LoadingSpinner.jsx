import React from 'react';

const LoadingSpinner = ({ 
  size = 'default', 
  text = 'Loading...', 
  fullScreen = false,
  showText = true 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  const SpinnerContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Power City Logo-inspired Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary-100 rounded-full animate-spin`}>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner spinning element */}
        <div className={`absolute inset-2 border-2 border-transparent border-t-yellow-400 rounded-full animate-spin`} 
             style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        
        {/* Center dot */}
        <div className="absolute inset-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Loading text */}
      {showText && (
        <div className={`${textSizes[size]} font-medium text-primary-600 animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <SpinnerContent />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <SpinnerContent />
    </div>
  );
};

export default LoadingSpinner;