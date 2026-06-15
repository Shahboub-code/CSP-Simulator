import React, { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, RefreshCw, Zap, Target, Award, ArrowRight } from 'lucide-react';
import { parseExcelFile, loadDefaultBank } from '../utils/excelParser';

const SetupView = ({ onDataLoaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parsedBank, setParsedBank] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const questions = await loadDefaultBank();
        setParsedBank(questions);
        setError(null);
      } catch (err) {
        console.warn("Default bank not found or failed to load. Falling back to manual upload.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDefault();
  }, []);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setLoading(true);
      try {
        const questions = await parseExcelFile(selected);
        setParsedBank(questions);
      } catch (err) {
        setError(err.message);
        setParsedBank(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const startExam = (count) => {
    // Filter by topic if one is selected
    const bankToUse = selectedTopic === 'All Topics' 
      ? parsedBank 
      : parsedBank.filter(q => q.topic === selectedTopic);

    // Fisher-Yates shuffle to randomize the bank
    const shuffled = [...bankToUse];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Slice to the selected amount, or take all if the bank is smaller
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    onDataLoaded(selectedQuestions);
  };

  const uniqueTopics = parsedBank 
    ? ['All Topics', ...Array.from(new Set(parsedBank.map(q => q.topic))).sort()] 
    : [];
    
  const filteredBankLength = parsedBank 
    ? (selectedTopic === 'All Topics' ? parsedBank.length : parsedBank.filter(q => q.topic === selectedTopic).length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto mt-4 md:mt-8">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-br from-safety-blue/20 to-cyan-500/10 rounded-2xl mb-6 shadow-sm border border-safety-blue/10 dark:border-safety-blue/20">
          <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl shadow-sm border border-white dark:border-slate-700">
            <FileSpreadsheet className="w-8 h-8 text-safety-blue dark:text-cyan-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-dark dark:text-white mb-5 tracking-tight leading-tight">
          Master Your <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-blue to-cyan-500 dark:from-cyan-400 dark:to-blue-500">CSP Exam</span>
        </h1>
        <p className="text-lg text-slate-gray dark:text-slate-400 max-w-2xl mx-auto px-4 leading-relaxed">
          The ultimate Certified Safety Professional simulator. Test your knowledge, identify your weak spots, and pass your exam with complete confidence.
        </p>
      </div>

      {/* Main Card container */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-dark/5 dark:shadow-black/20 border border-gray-100 dark:border-slate-700 p-8 md:p-12 relative overflow-hidden transition-colors duration-300">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-safety-blue via-cyan-400 to-safety-blue dark:from-blue-500 dark:via-cyan-400 dark:to-blue-500" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-safety-blue/5 dark:bg-safety-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-400/5 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 relative z-10">
             <div className="relative">
               <div className="absolute inset-0 bg-safety-blue/20 dark:bg-safety-blue/40 rounded-full blur-xl animate-pulse" />
               <RefreshCw className="w-12 h-12 text-safety-blue dark:text-cyan-400 animate-spin relative z-10 mb-6" />
             </div>
             <p className="text-lg text-slate-dark dark:text-slate-200 font-semibold">Initializing Simulator...</p>
             <p className="text-slate-gray dark:text-slate-400 mt-1">Loading certified question bank</p>
          </div>
        ) : (
          <div className="relative z-10">
            {!parsedBank && (
              <div className="border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-2xl p-12 text-center transition-all hover:border-safety-blue/50 dark:hover:border-cyan-500/50 hover:bg-safety-blue/5 dark:hover:bg-cyan-500/5 focus-within:border-safety-blue relative group cursor-pointer">
                <input 
                  type="file" 
                  id="file-upload" 
                  accept=".xlsx, .xls" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                />
                <div className="pointer-events-none flex flex-col items-center">
                  <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-600 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                    <Upload className="w-8 h-8 text-safety-blue dark:text-cyan-400" />
                  </div>
                  <span className="text-xl text-slate-dark dark:text-white font-bold mb-2">
                    Drop your question bank here
                  </span>
                  <span className="text-slate-gray dark:text-slate-400">
                    Supports .xlsx and .xls formats
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-8 p-5 bg-rose-red/5 dark:bg-rose-red/10 border border-rose-red/20 dark:border-rose-red/30 rounded-xl flex items-start gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-rose-red dark:text-rose-400 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-red dark:text-rose-400 mb-1">Failed to load question bank</h4>
                  <p className="text-sm text-rose-red/80 dark:text-rose-400/80">{error}</p>
                </div>
              </div>
            )}

            {parsedBank && !error && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-slate-700 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-dark dark:text-white flex items-center gap-2">
                      <Target className="w-6 h-6 text-safety-blue dark:text-cyan-400" />
                      Select Exam Mode
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-shrink-0">
                      <select 
                        value={selectedTopic} 
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-safety-blue/50 dark:focus:ring-cyan-500/50 focus:border-safety-blue dark:focus:border-cyan-500 font-medium text-sm transition-all cursor-pointer max-w-[200px] sm:max-w-xs truncate"
                      >
                        {uniqueTopics.map(topic => (
                          <option key={topic} value={topic}>{topic}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Option 10 */}
                  <button
                    onClick={() => startExam(10)}
                    disabled={filteredBankLength < 1}
                    className="group relative flex flex-col items-start p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl hover:border-safety-blue dark:hover:border-cyan-500 hover:shadow-xl hover:shadow-safety-blue/10 dark:hover:shadow-cyan-500/10 transition-all duration-300 text-left disabled:opacity-50 disabled:hover:border-gray-100 dark:disabled:hover:border-slate-700 disabled:hover:shadow-none overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 dark:from-cyan-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none" />
                    
                    <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-safety-blue dark:group-hover:bg-cyan-500 transition-all duration-300 shadow-sm">
                      <Zap className="w-7 h-7 text-safety-blue dark:text-cyan-400 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-dark dark:text-white mb-2">Quick Sprint</h4>
                    <p className="text-sm text-slate-gray dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                      {filteredBankLength >= 10 ? '10 questions' : `All ${filteredBankLength} questions`} for a fast knowledge check. Perfect for daily micro-learning sessions.
                    </p>
                    <div className="flex items-center text-safety-blue dark:text-cyan-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                      Start Sprint <ArrowRight className="w-4 h-4 ml-1.5" />
                    </div>
                  </button>

                  {/* Option 50 */}
                  <button
                    onClick={() => startExam(50)}
                    disabled={filteredBankLength < 1}
                    className="group relative flex flex-col items-start p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all duration-300 text-left disabled:opacity-50 disabled:hover:border-gray-100 dark:disabled:hover:border-slate-700 disabled:hover:shadow-none overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 dark:from-indigo-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none" />

                    <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-500 dark:group-hover:bg-indigo-500 transition-all duration-300 shadow-sm">
                      <Target className="w-7 h-7 text-indigo-500 dark:text-indigo-400 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-dark dark:text-white mb-2">Half Mock</h4>
                    <p className="text-sm text-slate-gray dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                      {filteredBankLength >= 50 ? '50 questions' : `All ${filteredBankLength} questions`} to test your endurance, timing, and deeper domain understanding.
                    </p>
                    <div className="flex items-center text-indigo-500 dark:text-indigo-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                      Start Half Mock <ArrowRight className="w-4 h-4 ml-1.5" />
                    </div>
                  </button>

                  {/* Option 100 */}
                  <button
                    onClick={() => startExam(100)}
                    disabled={filteredBankLength < 1}
                    className="group relative flex flex-col items-start p-6 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 transition-all duration-300 text-left disabled:opacity-50 disabled:hover:border-gray-100 dark:disabled:hover:border-slate-700 disabled:hover:shadow-none overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 dark:from-emerald-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none" />

                    <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-500 transition-all duration-300 shadow-sm">
                      <Target className="w-7 h-7 text-emerald-500 dark:text-emerald-400 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-dark dark:text-white mb-2">Full Mock</h4>
                    <p className="text-sm text-slate-gray dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                      {filteredBankLength >= 100 ? '100 questions' : `All ${filteredBankLength} questions`} to deeply test your knowledge before the big day.
                    </p>
                    <div className="flex items-center text-emerald-500 dark:text-emerald-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                      Start Full Mock <ArrowRight className="w-4 h-4 ml-1.5" />
                    </div>
                  </button>

                  {/* Option 200 */}
                  <button
                    onClick={() => startExam(200)}
                    disabled={filteredBankLength < 1}
                    className="group relative flex flex-col items-start p-6 bg-gradient-to-b from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-900 border-2 border-safety-blue dark:border-cyan-500 rounded-2xl hover:shadow-2xl hover:shadow-safety-blue/20 dark:hover:shadow-cyan-500/20 transition-all duration-300 text-left disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-safety-blue/10 dark:from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />
                    
                    <div className="absolute -top-3 -right-2 bg-gradient-to-r from-rose-red to-orange-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full shadow-md transform rotate-3">
                      Ultimate
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-safety-blue to-blue-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-safety-blue/30 dark:shadow-cyan-500/30">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-dark dark:text-white mb-2">CSP Marathon</h4>
                    <p className="text-sm text-slate-gray dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                      {filteredBankLength >= 200 ? '200 questions' : `All ${filteredBankLength} questions`}. The ultimate authentic CSP exam marathon.
                    </p>
                    <div className="flex items-center text-safety-blue dark:text-cyan-400 font-extrabold text-sm group-hover:translate-x-2 transition-transform">
                      Start Marathon <ArrowRight className="w-4 h-4 ml-1.5" />
                    </div>
                  </button>
                </div>
                
                {filteredBankLength < 1 && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">No questions found for the selected topic. Please choose a different topic.</p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupView;
