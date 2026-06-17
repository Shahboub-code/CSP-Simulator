import { useEffect } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, type, onConfirm, onCancel }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isEarly = type === 'endEarly';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isEarly ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500'}`}>
            {isEarly ? <AlertTriangle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {isEarly ? "End Exam Early?" : "Submit Exam?"}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {isEarly 
              ? "Are you sure you want to end the exam early? You won't be able to change your answers." 
              : "You have reached the end of the exam. Are you sure you want to submit your answers?"}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onCancel}
              className="w-full px-6 py-3.5 rounded-xl border-2 border-gray-200 dark:border-slate-700 font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`w-full px-6 py-3.5 rounded-xl font-bold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all ${isEarly ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Yes, Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
