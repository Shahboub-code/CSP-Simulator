import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ConfirmationModal from './components/ConfirmationModal';

const SetupView = lazy(() => import('./components/SetupView'));
const QuizView = lazy(() => import('./components/QuizView'));
const ResultsView = lazy(() => import('./components/ResultsView'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safety-blue dark:border-cyan-400"></div>
  </div>
);

function App() {
  const [view, setView] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState('submit');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const [examConfig, setExamConfig] = useState({ requiredScore: null, examName: '' });

  const handleDataLoaded = useCallback(({ questions, requiredScore, examName }) => {
    setQuestions(questions);
    setExamConfig({ requiredScore, examName });
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setView('quiz');
  }, []);

  const handleSelectOption = useCallback((option) => {
    setQuestions(prev => {
      const currentQ = prev[currentIndex];
      if (!currentQ || answers[currentQ.id]) return prev;
      setAnswers(prevAns => ({
        ...prevAns,
        [currentQ.id]: option
      }));
      return prev;
    });
  }, [currentIndex, answers]);

  const handleToggleFlag = useCallback(() => {
    setQuestions(prev => {
      const currentQ = prev[currentIndex];
      if (!currentQ) return prev;
      setFlagged(prevFlag => ({
        ...prevFlag,
        [currentQ.id]: !prevFlag[currentQ.id]
      }));
      return prev;
    });
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < questions.length - 1) {
        return prev + 1;
      } else {
        setConfirmModalType('submit');
        setShowConfirmModal(true);
        return prev;
      }
    });
  }, [questions.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  const handleJumpTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleFinishEarly = useCallback(() => {
    setConfirmModalType('endEarly');
    setShowConfirmModal(true);
  }, []);

  const confirmSubmit = useCallback(() => {
    setShowConfirmModal(false);
    setView('results');
  }, []);

  const cancelSubmit = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleRestart = useCallback(() => {
    setView('setup');
    setQuestions([]);
  }, []);

  const progress = useMemo(() => {
    if (view === 'quiz' && questions.length > 0) {
      return (Object.keys(answers).length / questions.length) * 100;
    } else if (view === 'results') {
      return 100;
    }
    return 0;
  }, [view, questions.length, answers]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-safety-blue/20 dark:selection:bg-safety-blue/40 transition-colors duration-300">
      <Header progress={progress} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-1 px-4 py-8">
        <Suspense fallback={<LoadingFallback />}>
          {view === 'setup' && (
            <SetupView onDataLoaded={handleDataLoaded} />
          )}
          
          {view === 'quiz' && questions.length > 0 && (
            <QuizView 
              question={questions[currentIndex]}
              currentIndex={currentIndex}
              total={questions.length}
              selectedAnswer={answers[questions[currentIndex]?.id]}
              isFlagged={flagged[questions[currentIndex]?.id]}
              answers={answers}
              flaggedMap={flagged}
              questions={questions}
              onSelectOption={handleSelectOption}
              onToggleFlag={handleToggleFlag}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onJumpTo={handleJumpTo}
              onFinish={handleFinishEarly}
            />
          )}
          
          {view === 'results' && (
            <ResultsView 
              questions={questions}
              answers={answers}
              flaggedMap={flagged}
              examConfig={examConfig}
              onRestart={handleRestart}
            />
          )}
        </Suspense>
      </main>

      <ConfirmationModal 
        isOpen={showConfirmModal}
        type={confirmModalType}
        onConfirm={confirmSubmit}
        onCancel={cancelSubmit}
      />

      {/* Creative Developer Credit */}
      <footer className="py-8 text-center pb-12">
        <div className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm text-slate-gray dark:text-slate-300 hover:shadow-md hover:border-safety-blue/30 dark:hover:border-safety-blue/50 transition-all duration-300 group">
          <span className="font-signature text-2xl tracking-wide">Crafted with</span>
          <span className="text-rose-red group-hover:scale-125 transition-transform duration-300 text-xl">♥</span>
          <span className="font-signature text-2xl tracking-wide">by</span>
          <span className="font-signature font-bold text-3xl text-safety-blue dark:text-cyan-400 bg-safety-blue/5 dark:bg-safety-blue/10 px-4 py-1.5 rounded-md group-hover:bg-safety-blue/10 dark:group-hover:bg-safety-blue/20 transition-colors tracking-wide">
            A.Shahboub
          </span>
          <a 
            href="https://www.linkedin.com/in/ahmed-shahboub-8074a42b0/" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Connect on LinkedIn"
            className="ml-2 text-[#0A66C2] dark:text-[#3b82f6] hover:scale-125 transition-transform duration-300 flex items-center justify-center"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
