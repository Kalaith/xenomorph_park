import { ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`relative w-full max-w-2xl overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900 shadow-2xl max-h-[calc(100vh-1rem)] sm:max-h-[90vh] ${className}`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/70 p-3 sm:p-4">
              <h2 className="section-title text-base sm:text-lg">{title}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="!p-1.5 leading-none text-slate-100"
              >
                X
              </Button>
            </div>

            <div className="overflow-y-auto p-3 sm:p-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
