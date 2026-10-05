import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAdditionQuestion, generateMultipleChoice } from '../utils/math';
import { StatsOverlay } from './StatsOverlay';

interface LightningRoundProps {
  onBack: () => void;
}

export const LightningRound: React.FC<LightningRoundProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(generateAdditionQuestion());
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [questionNum, setQuestionNum] = useState(1);

  const QUESTION_TIME = 10; // seconds per question

  const initGame = (num: number) => {
    setTotalQuestions(num);
    const q = generateAdditionQuestion();
    setCurrentQuestion(q);
    setChoices(generateMultipleChoice(q.answer));
    setCorrect(0);
    setIncorrect(0);
    setStartTime(Date.now());
    setTimeLeft(QUESTION_TIME);
    setQuestionNum(1);
    setPhase('playing');
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this question
          setIncorrect(i => i + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setInputValue('');
          if (questionNum >= totalQuestions) {
            setEndTime(Date.now());
            setPhase('finished');
            setShowStats(true);
            return 0;
          } else {
            const q = generateAdditionQuestion();
            setCurrentQuestion(q);
            setChoices(generateMultipleChoice(q.answer));
            setQuestionNum(n => n + 1);
            return QUESTION_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, questionNum, totalQuestions]);

  const handleChoiceSelect = useCallback((choice: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choice);
    const isRight = choice === currentQuestion.answer;
    setIsCorrect(isRight);

    if (isRight) {
      setCorrect(c => c + 1);
    } else {
      setIncorrect(i => i + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setInputValue('');
      if (questionNum >= totalQuestions) {
        setEndTime(Date.now());
        setPhase('finished');
        setShowStats(true);
      } else {
        const q = generateAdditionQuestion();
        setCurrentQuestion(q);
        setChoices(generateMultipleChoice(q.answer));
        setQuestionNum(n => n + 1);
        setTimeLeft(QUESTION_TIME);
      }
    }, 1000);
  }, [selectedAnswer, currentQuestion, questionNum, totalQuestions]);

  // Keyboard support (1-4 for choices)
  useEffect(() => {
    if (phase !== 'playing' || selectedAnswer !== null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (choices[idx] !== undefined) {
          handleChoiceSelect(choices[idx]);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, selectedAnswer, choices, handleChoiceSelect]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-orange-700 mb-6">⚡ Lightning Round</h2>
          <p className="text-center text-gray-600 mb-2">Quick multiple-choice questions!</p>
          <p className="text-center text-gray-500 mb-6 text-sm">You have {QUESTION_TIME} seconds per question. Press 1-4 on keyboard or click to answer.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[5, 10, 15, 20].map(num => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => initGame(num)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl text-xl shadow-lg"
              >
                {num} Questions
              </motion.button>
            ))}
          </div>
          <button onClick={onBack} className="w-full text-gray-500 hover:text-gray-700 font-medium py-2">
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = (questionNum / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 flex flex-col items-center justify-center p-4">
      {/* Timer & Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Question {questionNum}/{totalQuestions}
          </span>
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-orange-600'}`}
          >
            ⏱️ {timeLeft}s
          </motion.div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={`${currentQuestion.a}-${currentQuestion.b}-${questionNum}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center mb-6 w-full max-w-lg"
      >
        <p className="text-5xl font-bold text-gray-800 mb-6">
          {currentQuestion.a} + {currentQuestion.b} = ?
        </p>

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3">
          {choices.map((choice, idx) => {
            let btnClass = 'bg-gray-100 hover:bg-orange-100 text-gray-800 border-2 border-gray-200';
            if (selectedAnswer !== null) {
              if (choice === currentQuestion.answer) {
                btnClass = 'bg-green-100 border-2 border-green-500 text-green-800';
              } else if (choice === selectedAnswer && !isCorrect) {
                btnClass = 'bg-red-100 border-2 border-red-500 text-red-800';
              }
            }
            return (
              <motion.button
                key={idx}
                whileHover={selectedAnswer === null ? { scale: 1.05 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                onClick={() => handleChoiceSelect(choice)}
                disabled={selectedAnswer !== null}
                className={`${btnClass} rounded-2xl py-4 text-2xl font-bold transition-colors`}
              >
                <span className="text-sm text-gray-400 mr-1">{idx + 1}.</span> {choice}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {isCorrect !== null && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
            >
              {isCorrect ? '✅ Correct!' : `❌ The answer was ${currentQuestion.answer}`}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Score */}
      <div className="flex gap-4 text-sm font-semibold">
        <span className="text-green-600">✅ {correct}</span>
        <span className="text-red-600">❌ {incorrect}</span>
      </div>

      <button onClick={onBack} className="mt-6 text-gray-500 hover:text-gray-700 font-medium">
        ← Back to Menu
      </button>

      {/* Stats Overlay */}
      <StatsOverlay
        show={showStats}
        players={[{
          name: 'You',
          correct,
          incorrect,
          total: correct + incorrect,
          time: endTime - startTime,
        }]}
        onClose={() => { setShowStats(false); setPhase('setup'); }}
        gameMode="Lightning Round"
      />
    </div>
  );
};
