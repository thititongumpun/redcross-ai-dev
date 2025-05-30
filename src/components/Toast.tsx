import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  const textColor = 'text-white';

  return (
    <div
      className={`fixed bottom-5 right-5 ${bgColor} ${textColor} p-4 rounded-lg shadow-xl transition-transform transform animate-fadeIn`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <span className="mr-4">{message}</span>
        <button
          onClick={onClose}
          className={`${textColor} hover:text-gray-200 font-bold text-xl`}
          aria-label="Close toast"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// Basic fadeIn animation (could be moved to index.css or a global style if preferred)
// For now, let's assume Tailwind handles this or it's a minor detail if not visible.
// A proper animation setup would involve adding @keyframes to a CSS file.
// We'll add a simple style tag here for the animation for now, though it's not ideal.
// This part might not work perfectly in the sandbox but illustrates the intent.
const ToastWrapper: React.FC<ToastProps> = (props) => (
  <>
    <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}
    </style>
    <Toast {...props} />
  </>
);


export default ToastWrapper;
