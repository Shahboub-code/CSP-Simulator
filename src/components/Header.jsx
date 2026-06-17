import { Moon, Sun } from 'lucide-react';

const Header = ({ progress, isDarkMode, toggleDarkMode }) => {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-dark dark:text-white tracking-tight">CSP Exam Simulator</h1>
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-soft-gray dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors ml-auto sm:ml-0"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        
        {progress > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-1/3">
            <div className="flex-1 bg-soft-gray dark:bg-slate-800 rounded-full h-2.5 overflow-hidden border border-gray-200 dark:border-slate-700">
              <div 
                className="bg-safety-blue dark:bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-slate-gray dark:text-slate-400">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
