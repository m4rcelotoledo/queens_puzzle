import React from 'react';

const LoadingScreen = ({ message, footer }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
    <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold text-lg">
      {message}...
    </div>
    {footer}
  </div>
);

export default LoadingScreen;
