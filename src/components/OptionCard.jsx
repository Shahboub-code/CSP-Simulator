import { memo } from 'react';

const OptionCard = memo(({ option, isSelected, onClick, showResult, isCorrectAnswer, isWrongSelected }) => {
  
  let cardStyles;
  let dotStyles;
  
  if (showResult) {
    if (isCorrectAnswer) {
      cardStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm z-10';
      dotStyles = 'border-emerald-500 bg-emerald-500';
    } else if (isWrongSelected) {
      cardStyles = 'border-rose-red dark:border-rose-400 bg-rose-50 dark:bg-rose-500/10';
      dotStyles = 'border-rose-red dark:border-rose-400 bg-rose-red dark:bg-rose-400';
    } else {
      cardStyles = 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60';
      dotStyles = 'border-gray-300 dark:border-slate-600';
    }
  } else {
    if (isSelected) {
      cardStyles = 'border-safety-blue dark:border-cyan-500 bg-safety-blue/5 dark:bg-cyan-500/10 shadow-sm';
      dotStyles = 'border-safety-blue dark:border-cyan-500 bg-safety-blue dark:bg-cyan-500';
    } else {
      cardStyles = 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm';
      dotStyles = 'border-gray-300 dark:border-slate-600';
    }
  }

  // Use a stable click handler internally to pass the option back up
  const handleClick = () => {
    if (!showResult && onClick) {
      onClick(option);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-4 rounded-xl transition-all duration-200 border-2 relative ${showResult ? 'cursor-default' : 'cursor-pointer'} ${cardStyles}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${dotStyles}`}>
          {(isSelected || (showResult && isCorrectAnswer)) && <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-800"></div>}
        </div>
        <span className={`leading-relaxed whitespace-pre-wrap select-none ${showResult && !isCorrectAnswer && !isWrongSelected ? 'text-slate-500 dark:text-slate-400' : 'text-slate-dark dark:text-slate-200'}`}>
          {option}
        </span>
      </div>
      
      {/* Visual indicators for Correct/Wrong */}
      {showResult && isCorrectAnswer && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded text-xs">
          CORRECT
        </div>
      )}
      {showResult && isWrongSelected && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-red dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-900/40 px-2 py-1 rounded text-xs">
          INCORRECT
        </div>
      )}
    </div>
  );
});

OptionCard.displayName = 'OptionCard';

export default OptionCard;
