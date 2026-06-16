import React, { useState, useEffect, useRef } from 'react';
import OptionCard from './OptionCard';
import { Flag, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizView = ({ 
  question, currentIndex, total, selectedAnswer, isFlagged, 
  answers, flaggedMap, questions,
  onSelectOption, onToggleFlag, onNext, onPrevious, onJumpTo, onFinish
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [suspenseActive, setSuspenseActive] = useState(false);
  const suspenseTimerRef = useRef(null);
  
  useEffect(() => {
    setSuspenseActive(false);
    if (suspenseTimerRef.current) {
      clearTimeout(suspenseTimerRef.current);
    }
  }, [currentIndex]);

  const handleOptionClick = (option) => {
    if (selectedAnswer) return;
    setSuspenseActive(true);
    onSelectOption(option);
    
    suspenseTimerRef.current = setTimeout(() => {
      setSuspenseActive(false);
    }, 2000); // 2 second suspense delay
  };

  if (!question) return null;

  const isLast = currentIndex === total - 1;

  return (
    <div className="max-w-4xl mx-auto mt-4">
      {/* Top Bar with Grid Toggle and Flag */}
      <div className="mb-6 flex justify-between items-end">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-blue-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-3">
            <span>Question {currentIndex + 1} of {total}</span>
            {question.topic && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">{question.topic}</span>}
          </span>
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-gray dark:text-slate-400 hover:text-slate-dark dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-gray-200 dark:border-slate-700 shadow-sm"
          >
            <LayoutGrid className="w-4 h-4" />
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
        </div>
        
        <button
          onClick={onToggleFlag}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border-2
            ${isFlagged 
              ? 'bg-rose-red/10 border-rose-red dark:border-rose-400 text-rose-red dark:text-rose-400' 
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-gray dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-600'}`}
        >
          <Flag className={`w-4 h-4 ${isFlagged ? 'fill-current' : ''}`} />
          {isFlagged ? 'Flagged' : 'Flag for Review'}
        </button>
      </div>

      {/* Navigation Grid */}
      {showGrid && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6 flex flex-wrap gap-2 max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
          {questions.map((q, idx) => {
            const hasAnswer = !!answers[q.id];
            const flagged = !!flaggedMap[q.id];
            const isCurrent = idx === currentIndex;
            
            let btnClass = "w-10 h-10 rounded-md font-medium text-sm flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ";
            
            if (isCurrent) {
              btnClass += "border-slate-dark dark:border-slate-300 text-slate-dark dark:text-slate-200 bg-white dark:bg-slate-800 shadow-md ";
            } else if (flagged) {
              btnClass += "border-rose-500 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold ";
            } else if (hasAnswer) {
              btnClass += "border-safety-blue/30 dark:border-cyan-500/30 bg-safety-blue/5 dark:bg-cyan-500/10 text-safety-blue dark:text-cyan-400 ";
            } else {
              btnClass += "border-yellow-200 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-700/50 text-yellow-400 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-700 ";
            }

            return (
              <button 
                key={q.id} 
                onClick={() => onJumpTo(idx)}
                className={btnClass}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-6">
            <h2 className="text-xl font-medium text-slate-dark dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {question.text}
            </h2>
          </div>

          <div className="space-y-3 mb-8">
            {question.options.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const showResult = !!selectedAnswer && !suspenseActive;
              const isCorrectAnswer = option === question.correctAnswer;
              const isWrongSelected = isSelected && !isCorrectAnswer;

              return (
                <OptionCard 
                  key={idx}
                  option={option}
                  isSelected={isSelected}
                  onClick={() => handleOptionClick(option)}
                  showResult={showResult}
                  isCorrectAnswer={isCorrectAnswer}
                  isWrongSelected={isWrongSelected}
                />
              );
            })}
          </div>

        </motion.div>
      </AnimatePresence>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-center border-t border-gray-200 dark:border-slate-700 pt-6 gap-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-lg font-medium transition-colors
            ${currentIndex === 0 
              ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' 
              : 'text-slate-gray dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
        >
          Previous
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {!isLast && (
            <button
              onClick={onFinish}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-lg font-medium text-rose-red dark:text-rose-400 border border-transparent sm:hover:bg-rose-50 dark:sm:hover:bg-rose-500/10 transition-colors"
            >
              End Exam
            </button>
          )}
          <button
            onClick={onNext}
            className={`w-full sm:w-auto px-8 py-3 sm:py-2.5 rounded-lg font-medium transition-all shadow-sm
              ${!selectedAnswer
                ? 'bg-white dark:bg-slate-800 border-2 border-safety-blue dark:border-cyan-500 text-safety-blue dark:text-cyan-400 hover:bg-safety-blue/5 dark:hover:bg-cyan-500/10'
                : 'bg-safety-blue dark:bg-cyan-600 text-white hover:bg-safety-blue/90 dark:hover:bg-cyan-500 border-2 border-safety-blue dark:border-cyan-600'}`}
          >
            {!selectedAnswer ? 'Skip for Now' : (isLast ? 'Submit Exam' : 'Next Question')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;
