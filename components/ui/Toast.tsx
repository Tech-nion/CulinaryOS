
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 ease-out transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
    }`}>
      <div className="bg-slate-900/80 backdrop-blur-xl border border-orange-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ring-4 ring-orange-500/5">
        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-xs font-black text-white uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
};
