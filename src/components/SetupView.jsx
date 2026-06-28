import { useState, useEffect } from 'react';
import { Upload, AlertCircle, RefreshCw, Zap, Target, Award, ArrowRight } from 'lucide-react';
import { parseExcelFile, loadDefaultBank } from '../utils/excelParser';

const SetupView = ({ onDataLoaded }) => {
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
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Just keep the first one for reference if needed
      setError(null);
      setLoading(true);
      try {
        let allQuestions = [];
        for (const f of files) {
          const questions = await parseExcelFile(f);
          allQuestions = [...allQuestions, ...questions];
        }
        
        // Remove duplicates by question text to be safe
        const uniqueQuestions = [];
        const seen = new Set();
        
        // Sort questions so ones with explanations are processed first
        allQuestions.sort((a, b) => {
          const aHasExp = a.explanation && a.explanation.trim().length > 0 ? 1 : 0;
          const bHasExp = b.explanation && b.explanation.trim().length > 0 ? 1 : 0;
          return bHasExp - aHasExp;
        });

        for (const q of allQuestions) {
          // Normalize text by lowercasing and keeping only alphanumeric
          const normalized = (q.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const key = normalized.substring(0, 150);
          
          if (!seen.has(key)) {
            seen.add(key);
            uniqueQuestions.push(q);
          }
        }
        setParsedBank(uniqueQuestions);
      } catch (err) {
        setError(err.message);
        setParsedBank(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const startExam = (count, requiredScore, examName) => {
    // Filter by topic if one is selected
    const bankToUse = selectedTopic === 'All Topics' 
      ? parsedBank 
      : parsedBank.filter(q => q.topic === selectedTopic);

    // Separate questions with and without explanations
    const withExplanation = bankToUse.filter(q => q.explanation && q.explanation.trim().length > 0);
    const withoutExplanation = bankToUse.filter(q => !q.explanation || q.explanation.trim().length === 0);

    const shuffleArray = (arr) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // "Need All Questions With Explansion be in 1st"
    let finalBank = [...shuffleArray(withExplanation), ...shuffleArray(withoutExplanation)];
    
    // If we don't have enough questions in this topic, pad from the rest of the bank
    if (finalBank.length < count && selectedTopic !== 'All Topics') {
      const needed = count - finalBank.length;
      const otherQuestions = parsedBank.filter(q => q.topic !== selectedTopic);
      const otherWithExp = otherQuestions.filter(q => q.explanation && q.explanation.trim().length > 0);
      const otherWithoutExp = otherQuestions.filter(q => !q.explanation || q.explanation.trim().length === 0);
      
      const paddedBank = [...shuffleArray(otherWithExp), ...shuffleArray(otherWithoutExp)];
      finalBank = [...finalBank, ...paddedBank.slice(0, needed)];
    }
    
    // Slice to the selected amount, or take all if the bank is smaller
    const selectedQuestions = finalBank.slice(0, Math.min(count, finalBank.length));
    
    onDataLoaded({
      questions: selectedQuestions,
      requiredScore: requiredScore,
      examName: examName
    });
  };

  const uniqueTopics = parsedBank 
    ? ['All Topics', ...Array.from(new Set(parsedBank.map(q => q.topic))).sort()] 
    : [];
    
  const filteredBankLength = parsedBank 
    ? (selectedTopic === 'All Topics' ? parsedBank.length : parsedBank.filter(q => q.topic === selectedTopic).length)
    : 0;

  return (
    <div className="max-w-5xl mx-auto mt-4 md:mt-8 relative">
      {/* Ambient background glows for creative feel */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-safety-blue/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-10000" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-emerald-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-7000" />

      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-dark dark:text-white mb-6 tracking-tight leading-tight">
          Master Your <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-blue via-cyan-400 to-indigo-500 dark:from-cyan-300 dark:via-blue-400 dark:to-indigo-400 animate-gradient-x">
            CSP Exam
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-gray dark:text-slate-400 max-w-2xl mx-auto px-4 leading-relaxed font-medium">
          The ultimate simulator designed to push your limits. Identify weak spots, master concepts, and pass with complete confidence.
        </p>
      </div>

      {/* Main Card container */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-dark/5 dark:shadow-black/40 border border-white/50 dark:border-slate-700/50 p-8 md:p-14 relative overflow-hidden transition-colors duration-300 z-10">
        {/* Decorative Internal Background Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-safety-blue via-cyan-400 to-indigo-500" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-safety-blue/10 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 relative z-10 animate-in fade-in duration-500">
             <div className="relative">
               <div className="absolute inset-0 bg-safety-blue/20 dark:bg-cyan-500/20 rounded-full blur-2xl animate-ping" />
               <RefreshCw className="w-14 h-14 text-safety-blue dark:text-cyan-400 animate-spin relative z-10 mb-8" />
             </div>
             <p className="text-2xl text-slate-dark dark:text-white font-bold tracking-tight">Initializing Simulator</p>
             <p className="text-slate-gray dark:text-slate-400 mt-2 font-medium">Synchronizing certified question bank...</p>
          </div>
        ) : (
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
            {!parsedBank && (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-safety-blue to-cyan-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="border-2 border-dashed border-gray-200/80 dark:border-slate-600/80 rounded-[2.5rem] p-16 text-center transition-all bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-slate-800 relative z-10 cursor-pointer overflow-hidden">
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple
                    accept=".xlsx, .xls, .csv, .txt" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                    onChange={handleFileChange}
                  />
                  <div className="pointer-events-none flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-safety-blue/10 to-cyan-400/10 dark:from-cyan-400/10 dark:to-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-safety-blue/20 transition-all duration-500 transform group-hover:-translate-y-2">
                      <Upload className="w-10 h-10 text-safety-blue dark:text-cyan-400" />
                    </div>
                    <span className="text-2xl text-slate-dark dark:text-white font-extrabold mb-3 tracking-tight">
                      Drop your question bank here
                    </span>
                    <span className="text-slate-gray dark:text-slate-400 font-medium">
                      Select multiple .xlsx, .csv, or .txt files to magically merge them
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-10 p-6 bg-rose-red/5 dark:bg-rose-red/10 border-2 border-rose-red/20 dark:border-rose-red/30 rounded-2xl flex items-start gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-rose-red/10">
                  <AlertCircle className="w-6 h-6 text-rose-red dark:text-rose-400 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-rose-red dark:text-rose-400 mb-1">Failed to load bank</h4>
                  <p className="text-rose-red/80 dark:text-rose-400/80 font-medium">{error}</p>
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
                
                {/* Practice Mode Section (Always Visible) */}
                <h3 className="text-xl font-bold text-slate-dark dark:text-white mb-4 pl-2 mt-4">Practice Mode</h3>
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto mb-10">
                  <button
                    onClick={() => startExam(filteredBankLength, null, 'Practice Mock')}
                    disabled={filteredBankLength < 1}
                    className="group relative flex flex-col md:flex-row items-center md:items-start lg:items-center p-6 md:p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 text-left disabled:opacity-50 overflow-hidden w-full border border-white/10"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/2 translate-y-1/2" />
                    
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 md:mb-0 md:mr-8 shadow-inner border border-white/20 group-hover:scale-105 group-hover:bg-white/30 transition-all duration-300 z-10">
                      <Zap className="w-10 h-10 text-white drop-shadow-md" />
                    </div>
                    
                    <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left z-10">
                      <h4 className="text-3xl font-extrabold text-white mb-2 drop-shadow-sm">Ultimate Practice Mock</h4>
                      <p className="text-purple-100 text-lg font-medium">
                        Master {filteredBankLength} questions • Unrestricted Practice Session
                      </p>
                    </div>

                    <div className="hidden md:flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-purple-600 transition-colors ml-4 z-10 shadow-sm border border-white/10 group-hover:border-white">
                      <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Official Certifications Section (Only visible for All Topics) */}
                {selectedTopic === 'All Topics' && (
                  <>
                    <h3 className="text-xl font-bold text-slate-dark dark:text-white mb-4 pl-2 border-t border-gray-100 dark:border-slate-700 pt-8">Official Certifications</h3>
                    <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto mb-12">
                      {/* Option ASP Exam */}
                      <button
                        onClick={() => startExam(parsedBank.length, 114, 'ASP Exam')}
                        disabled={parsedBank.length < 1}
                        className="group relative flex flex-col md:flex-row items-center md:items-start lg:items-center p-6 md:p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 text-left disabled:opacity-50 overflow-hidden w-full"
                      >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 md:mb-0 md:mr-8 shadow-inner border border-white/20 group-hover:scale-105 transition-transform duration-300">
                          <Target className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left z-10">
                          <h4 className="text-3xl font-extrabold text-white mb-2">ASP Exam Simulator</h4>
                          <p className="text-indigo-100 text-lg">
                            All {parsedBank.length} questions • Passing score: 114 correct
                          </p>
                        </div>

                        <div className="hidden md:flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-indigo-600 transition-colors ml-4 z-10">
                          <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                      {/* Option CSP Exam */}
                      <button
                        onClick={() => startExam(parsedBank.length, 110, 'CSP Exam')}
                        disabled={parsedBank.length < 1}
                        className="group relative flex flex-col md:flex-row items-center md:items-start lg:items-center p-6 md:p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 text-left disabled:opacity-50 overflow-hidden w-full"
                      >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 md:mb-0 md:mr-8 shadow-inner border border-white/20 group-hover:scale-105 transition-transform duration-300">
                          <Award className="w-10 h-10 text-white" />
                        </div>
                        
                        <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left z-10">
                          <h4 className="text-3xl font-extrabold text-white mb-2">CSP Exam Simulator</h4>
                          <p className="text-emerald-100 text-lg">
                            All {parsedBank.length} questions • Passing score: 110 correct
                          </p>
                        </div>

                        <div className="hidden md:flex flex-shrink-0 items-center justify-center w-14 h-14 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-emerald-600 transition-colors ml-4 z-10">
                          <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </>
                )}
                
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
