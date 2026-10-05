import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateAdditionQuestion } from '../utils/math';
import { NumberPad } from './NumberPad';
import { StatsOverlay } from './StatsOverlay';

interface PracticeModeProps {
  onBack: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentQuestion, setCurrentQuestion] = useState(generateAdditionQuestion());
  const [inputValue, setInputValue] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = (num: number) => {
    setTotalQuestions(num);
    setCurrentQuestion(generateAdditionQuestion());
    setInputValue('');
    setCorrect(0);
    setIncorrect(0);
    setStartTime(Date.now());
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = useCallback((value: string) => {
    if (parseInt(value) === currentQuestion.answer) {
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 800);
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setInputValue('');

      if (newCorrect >= totalQuestions) {
        setEndTime(Date.now());
        setPhase('finished');
        setShowStats(true);
      } else {
        setCurrentQuestion(generateAdditionQuestion());
      }
    } else if (value.length >= String(currentQuestion.answer).length) {
      setIncorrect(prev => prev + 1);
      setInputValue('');
    } else {
      setInputValue(value);
    }
  }, [currentQuestion, correct, totalQuestions]);

  const handleInput = (value: string) => {
    if (phase !== 'playing') return;
    if (value === '') {
      setInputValue('');
      return;
    }
    checkAnswer(value);
  };

  // Keyboard support
  useEffect(() => {
    if (phase !== 'playing') return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        const newValue = inputValue + e.key;
        checkAnswer(newValue);
      } else if (e.key === 'Backspace') {
        setInputValue(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        // Submit current input
        if (inputValue) {
          checkAnswer(inputValue);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, inputValue, checkAnswer]);

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-green-700 mb-6">📝 Practice Round</h2>
          <p className="text-center text-gray-600 mb-6">Choose how many questions to practice:</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[5, 10, 15, 20].map(num => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => initGame(num)}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-2xl text-xl shadow-lg"
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

  const progress = (correct / totalQuestions) * 100;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${correctFlash ? 'bg-green-200' : 'bg-gradient-to-br from-green-100 to-teal-100'}`}>
      {/* Progress bar */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress: {correct}/{totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div
            className="h-4 rounded-full bg-gradient-to-r from-green-400 to-teal-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.a + currentQuestion.b}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center mb-6 w-full max-w-md"
      >
        <p className="text-5xl font-bold text-gray-800 mb-4">
          {currentQuestion.a} + {currentQuestion.b}
        </p>
        <div className="text-3xl font-mono bg-green-100 rounded-xl px-6 py-3 inline-block min-w-[120px]">
          {inputValue || <span className="text-gray-300">?</span>}
        </div>
        {correctFlash && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 font-bold mt-3 text-lg"
          >
            ✅ Correct!
          </motion.p>
        )}
      </motion.div>

      {/* Number Pad */}
      <NumberPad value={inputValue} onInput={handleInput} color="green" />

      {/* Hidden input for keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute w-0 h-0"
        autoFocus
        readOnly
      />

      {/* Back button */}
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
        gameMode="Practice Round"
      />
    </div>
  );
};
