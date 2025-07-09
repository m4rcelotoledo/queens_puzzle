// Notification Component for visual feedback
import React, { useEffect } from 'react';

const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;

  const baseClasses = "fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl text-white font-semibold animate-fade-in-down z-50";
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-700'}`}>
      {message}
    </div>
  );
};

export default Notification;
