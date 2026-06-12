import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation } from 'react-icons/hi';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative glass-panel-strong p-6 max-w-md w-full gradient-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 
                            border border-red-500/20 mx-auto mb-4">
              <HiExclamation className="text-red-400 text-2xl" />
            </div>

            {/* Content */}
            <h3 className="text-lg font-gaming font-semibold text-gray-100 text-center mb-2">
              {title || 'Confirm Action'}
            </h3>
            <p className="text-gray-400 text-sm text-center mb-6">
              {message || 'Are you sure you want to proceed? This action cannot be undone.'}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gaming-dark border border-gaming-border rounded-lg 
                           text-gray-300 text-sm font-medium hover:bg-gaming-card hover:border-gray-600
                           transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 btn-danger text-sm"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
