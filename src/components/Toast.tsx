import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-blue-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[100] transition-transform duration-300 pointer-events-none',
        show ? 'translate-y-0' : 'translate-y-[100px]',
        bgColors[type]
      )}
    >
      {message}
    </div>
  );
};
