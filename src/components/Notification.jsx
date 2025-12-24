import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ type = 'success', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: AlertCircle
  };

  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300'
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 p-3 sm:p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top duration-300 max-w-sm sm:max-w-md ${colors[type]}`}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1">{message}</p>
        <button
          onClick={onClose}
          className="hover:bg-white/10 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
