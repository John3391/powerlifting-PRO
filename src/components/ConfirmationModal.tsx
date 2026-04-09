import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gray-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className={`h-2 w-full ${
              variant === 'danger' ? 'bg-red-600' : 
              variant === 'warning' ? 'bg-yellow-500' : 'bg-blue-600'
            }`} />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-red-900/20 text-red-500' : 
                  variant === 'warning' ? 'bg-yellow-900/20 text-yellow-500' : 'bg-blue-900/20 text-blue-500'
                }`}>
                  <AlertTriangle size={32} />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-800 hover:bg-gray-700 transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${
                    variant === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 
                    variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/20' : 
                    'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
