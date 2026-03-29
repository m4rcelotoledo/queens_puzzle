import React from 'react';
import AppBranding from './AppBranding';

const LoadingScreen = ({ message, footer, showBranding = true }) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {showBranding && (
          <header className="flex justify-between items-center mb-8">
            <AppBranding />
          </header>
        )}

        <div className="flex flex-col items-center justify-center mt-24 text-gray-500 dark:text-gray-400 font-medium text-lg">
          <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="animate-pulse">{message}...</p>
        </div>
      </div>
    </div>
    {footer}
  </div>
);

export default LoadingScreen;
