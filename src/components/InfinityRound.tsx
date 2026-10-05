import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { generateAdditionQuestion } from '../utils/math';
import { NumberPad } from './NumberPad';
import { StatsOverlay } from './StatsOverlay';

interface InfinityRoundProps {
  onBack: () => void;
}

export const InfinityRound: React.FC<InfinityRoundProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [currentQuestion, setCurrentQuestion] = useState(generateAdditionQuestion());
  const [inputValue, setInputValue] = useState('');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const initGame = () => {
    setCurrentQuestion(generateAdditionQuestion());
    setInputValue('');
    setCorrect(0);
    setIncorrect(0);
    setStartTime(Date.now());
    setElapsed(0);
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Timer display
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  const checkAnswer = useCallback((value: string) => {
    if (parseInt(value) === currentQuestion.answer) {
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 800);
      setCorrect(c => c + 1);
      setInputValue('');
      setCurrentQuestion(generateAdditionQuestion());
    } else if (value.length >= String(currentQuestion.answer).length) {
      setIncorrect(i => i + 1);
      setInputValue('');
    } else {
      setInputValue(value);
    }
  }, [currentQuestion]);

  const handleInput = (value: string) => {
    if (phase !== 'playing') return;
    if (value === '') {
      setInputValue('');
      return;
    }
    checkAnswer(value);
  };

  const endRound = () => {
    setEndTime(Date.now());
    setPhase('finished');
    setShowStats(true);
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
        if (inputValue) checkAnswer(inputValue);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, inputValue, checkAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
        >
          <h2 className="text-3xl font-bold text-pink-700 mb-4">🔄 Infinity Round</h2>
          <p className="text-gray-600 mb-6">
            Answer as many addition questions as you can! There's no limit — play until you're ready to stop.
          </p>
          <div className="text-6xl mb-6">♾️</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={initGame}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg w-full"
          >
            Start Playing! 🚀
          </motion.button>
          <button onClick={onBack} className="mt-4 text-gray-500 hover:text-gray-700 font-medium">
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${correctFlash ? 'bg-green-200' : 'bg-gradient-to-br from-pink-100 to-rose-100'}`}>
      {/* Stats bar */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between items-center bg-white rounded-2xl px-4 py-3 shadow-md">
          <div className="text-center">
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-lg font-bold text-pink-600">{formatTime(elapsed)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Correct</p>
            <p className="text-lg font-bold text-green-600">{correct}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Incorrect</p>
            <p className="text-lg font-bold text-red-500">{incorrect}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-purple-600">{correct + incorrect}</p>
          </div>
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.a + currentQuestion.b + correct}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center mb-6 w-full max-w-md"
      >
        <p className="text-5xl font-bold text-gray-800 mb-4">
          {currentQuestion.a} + {currentQuestion.b}
        </p>
        <div className="text-3xl font-mono bg-pink-100 rounded-xl px-6 py-3 inline-block min-w-[120px]">
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
      <NumberPad value={inputValue} onInput={handleInput} color="purple" />

      {/* Hidden input for keyboard */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute w-0 h-0"
        autoFocus
        readOnly
      />

      {/* End button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={endRound}
        className="mt-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg"
      >
        🏁 End Round
      </motion.button>

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
        gameMode="Infinity Round"
      />
    </div>
  );
};
