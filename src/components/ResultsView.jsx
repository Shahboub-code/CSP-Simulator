import { CheckCircle2, XCircle, RotateCcw, Flag, ArrowDown } from 'lucide-react';

const ResultsView = ({ questions, answers, flaggedMap, examConfig, onRestart }) => {
  const score = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);
  
  const skippedCount = questions.length - Object.keys(answers).length;
  const incorrectCount = questions.length - score - skippedCount;
  
  const percentage = Math.round((score / questions.length) * 100);
  
  let passed;
  let requiredCorrect;
  if (examConfig && examConfig.requiredScore) {
    requiredCorrect = examConfig.requiredScore;
    passed = score >= requiredCorrect;
  } else {
    // Default 60% passing
    requiredCorrect = Math.ceil(questions.length * 0.6);
    passed = percentage >= 60;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 pb-12">
      {/* Main Results Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 p-8 sm:p-12 mb-8 text-center transition-colors">
        
        <div className="flex flex-col items-center justify-center space-y-3 mb-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {passed ? 'Congratulations! 🎉' : 'Exam Completed'}
          </h2>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-lg">
            {passed 
              ? "You've successfully passed the exam. Great job!" 
              : "Don't give up, keep practicing and you'll get it next time!"}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center group">
            <svg className="w-56 h-56 transform -rotate-90 transition-transform duration-500 group-hover:scale-105">
              <circle cx="112" cy="112" r="100" className="stroke-current text-gray-100 dark:text-slate-700" strokeWidth="16" fill="none" />
              <circle 
                cx="112" cy="112" r="100" 
                className={`stroke-current ${passed ? 'text-emerald-500' : 'text-rose-500'}`} 
                strokeWidth="16" 
                fill="none" 
                strokeDasharray={`${2 * Math.PI * 100}`} 
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - percentage / 100)}`} 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-6xl font-black tracking-tighter ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {percentage}%
              </span>
              <span className={`text-sm font-bold uppercase tracking-widest mt-1 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-5 flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{score}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Correct</span>
              <span className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-1">Needed: {requiredCorrect}</span>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-5 flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
              <span className="text-4xl font-bold text-rose-600 dark:text-rose-400 mb-1">{incorrectCount}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">Incorrect</span>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-5 flex flex-col items-center justify-center col-span-2 transform hover:scale-105 transition-transform">
              <span className="text-4xl font-bold text-gray-700 dark:text-gray-300 mb-1">{skippedCount}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Skipped</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('review-section').scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            Review Answers
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={onRestart}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-xl font-bold transition-all hover:-translate-y-0.5"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Exam
          </button>
        </div>
      </div>

      {/* Review Section */}
      <div id="review-section" className="space-y-6 pt-4 mt-12 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white px-2 mb-6">Detailed Review</h3>
        
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isUnanswered = !userAnswer;
          const isFlagged = flaggedMap && !!flaggedMap[q.id];
          
          return (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
              <div className={`px-6 py-5 border-b flex items-start gap-4
                ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 
                  (isUnanswered ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20')}`}>
                {isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className={`w-7 h-7 flex-shrink-0 mt-0.5 ${isUnanswered ? 'text-gray-400 dark:text-slate-500' : 'text-rose-500'}`} />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-bold tracking-wide uppercase text-gray-500 dark:text-slate-400">Question {idx + 1}</span>
                    {q.topic && <span className="text-xs font-bold tracking-wide uppercase text-blue-600 dark:text-cyan-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">{q.topic}</span>}
                    {isUnanswered && <span className="text-xs font-bold tracking-wide uppercase text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-0.5 rounded-md">Skipped</span>}
                    {isFlagged && <span className="text-xs font-bold tracking-wide uppercase text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-md flex items-center gap-1"><Flag className="w-3 h-3 fill-current" /> Flagged</span>}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{q.text}</h4>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                {q.options.map((opt, i) => {
                  const isUserPick = opt === userAnswer;
                  const isActualAnswer = opt === q.correctAnswer;
                  
                  let optClass = "p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-300 transition-colors";
                  
                  if (isActualAnswer) {
                    optClass = "p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-gray-900 dark:text-white font-semibold shadow-sm";
                  } else if (isUserPick && !isCorrect) {
                    optClass = "p-4 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold line-through decoration-rose-500/50 opacity-90";
                  }

                  return (
                    <div key={i} className={optClass}>
                      <span className="whitespace-pre-wrap">{opt}</span>
                    </div>
                  );
                })}
              </div>
              
              {q.explanation && (
                <div className="px-6 pb-6 pt-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-5">
                    <h5 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2">Explanation</h5>
                    <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsView;
