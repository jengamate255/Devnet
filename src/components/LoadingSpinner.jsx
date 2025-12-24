import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'border-blue-400',
    green: 'border-green-400',
    white: 'border-white'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );
};

export default LoadingSpinner;
