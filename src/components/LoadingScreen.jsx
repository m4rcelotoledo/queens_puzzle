import React from 'react';

const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
    {message}...
  </div>
);

export default LoadingScreen;
