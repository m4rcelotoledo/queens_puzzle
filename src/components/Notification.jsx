// Notification Component for visual feedback
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl text-white font-semibold z-50 ${typeClasses[type] || 'bg-gray-700'}`}
    >
      {message}
    </motion.div>
  );
};

export default Notification;
