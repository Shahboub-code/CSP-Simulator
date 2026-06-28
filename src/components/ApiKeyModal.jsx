import { useState, useEffect } from 'react';
import { Key, X, ExternalLink } from 'lucide-react';

const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('csp_openai_api_key') || '';
      setApiKey(saved);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('csp_openai_api_key', apiKey);
    onSave(apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-safety-blue/10 dark:bg-cyan-500/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-safety-blue dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-dark dark:text-white">OpenAI API Key</h3>
            <p className="text-sm text-slate-gray dark:text-slate-400">For AI-generated explanations</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-safety-blue/50 dark:focus:ring-cyan-500/50"
          />
          <p className="text-xs text-slate-gray dark:text-slate-400 mt-2">
            Your key is stored locally and never sent to our servers.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Get your API key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline hover:text-blue-800 dark:hover:text-blue-200"
            >
              OpenAI Platform <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-slate-gray dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 rounded-xl bg-safety-blue dark:bg-cyan-600 text-white font-medium hover:bg-safety-blue/90 dark:hover:bg-cyan-500 transition-colors"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
