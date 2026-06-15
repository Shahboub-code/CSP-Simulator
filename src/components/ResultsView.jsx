import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, Flag, Info } from 'lucide-react';

const ResultsView = ({ questions, answers, flaggedMap, onRestart }) => {
  const score = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);
  
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 60; // 60% Passing threshold

  return (
    <div className="max-w-4xl mx-auto mt-8 pb-12">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-dark dark:text-white mb-2">Exam Results</h2>
        
        <p className={`text-2xl font-black tracking-widest uppercase mb-6 ${passed ? 'text-emerald-green dark:text-emerald-400' : 'text-rose-red dark:text-rose-400'}`}>
          {passed ? 'Passed' : 'Failed'}
        </p>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 
            ${passed ? 'border-emerald-green dark:border-emerald-500 text-emerald-green dark:text-emerald-400' : 'border-rose-red dark:border-rose-500 text-rose-red dark:text-rose-400'}`}>
            <span className="text-4xl font-bold">{percentage}%</span>
          </div>
        </div>
        
        <p className="text-lg text-slate-gray dark:text-slate-400 mb-8">
          You answered <span className="font-semibold text-slate-dark dark:text-white">{score}</span> out of <span className="font-semibold text-slate-dark dark:text-white">{questions.length}</span> questions correctly.
        </p>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-soft-gray dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-slate-dark dark:text-white rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Take Another Exam
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-dark dark:text-white px-4">Review Answers</h3>
        
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isUnanswered = !userAnswer;
          const isFlagged = flaggedMap && !!flaggedMap[q.id];
          
          return (
            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className={`px-6 py-4 border-b flex items-start gap-3
                ${isCorrect ? 'bg-emerald-green/5 dark:bg-emerald-500/10 border-emerald-green/10 dark:border-emerald-500/20' : 
                  (isUnanswered ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600' : 'bg-rose-red/5 dark:bg-rose-red/10 border-rose-red/10 dark:border-rose-400/20')}`}>
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-green dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${isUnanswered ? 'text-gray-400 dark:text-slate-500' : 'text-rose-red dark:text-rose-400'}`} />
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-gray dark:text-slate-400">Question {idx + 1}</span>
                    {q.topic && <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded">{q.topic}</span>}
                    {isUnanswered && <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-0.5 rounded">Skipped</span>}
                    {isFlagged && <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1"><Flag className="w-3 h-3 fill-current" /> Flagged</span>}
                  </div>
                  <h4 className="font-medium text-slate-dark dark:text-slate-200 whitespace-pre-wrap">{q.text}</h4>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                {q.options.map((opt, i) => {
                  const isUserPick = opt === userAnswer;
                  const isActualAnswer = opt === q.correctAnswer;
                  
                  let optClass = "p-3 rounded-lg border border-gray-100 dark:border-slate-700 bg-soft-gray/50 dark:bg-slate-800/50 text-slate-gray dark:text-slate-400";
                  
                  if (isActualAnswer) {
                    optClass = "p-3 rounded-lg border-2 border-emerald-green dark:border-emerald-500 bg-emerald-green/5 dark:bg-emerald-500/10 text-slate-dark dark:text-white font-medium";
                  } else if (isUserPick && !isCorrect) {
                    optClass = "p-3 rounded-lg border-2 border-rose-red dark:border-rose-500 bg-rose-red/5 dark:bg-rose-red/10 text-rose-red dark:text-rose-400 font-medium line-through decoration-rose-red/50 dark:decoration-rose-500/50";
                  }

                  return (
                    <div key={i} className={optClass}>
                      <span className="whitespace-pre-wrap">{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsView;
