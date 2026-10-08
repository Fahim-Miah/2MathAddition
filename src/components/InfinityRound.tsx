import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import NumberPad from './NumberPad';
import { generateQuestion, Question, PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface InfinityRoundProps {
  onHome: () => void;
}

const InfinityRound: React.FC<InfinityRoundProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [correctFlash, setCorrectFlash] = useState(false);

  const [stats, setStats] = useState<PlayerStats>({
    correct: 0, incorrect: 0, totalTime: 0,
    questionsAnswered: [], answersGiven: [], correctAnswers: [],
  });

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameStarted, gameOver]);

  const checkAnswer = useCallback(() => {
    if (input.length === 0) return;
    const answer = parseInt(input);
    const encodedQ = question.num1 * 10000 + question.num2;

    const newStats = {
      ...stats,
      questionsAnswered: [...stats.questionsAnswered, encodedQ],
      answersGiven: [...stats.answersGiven, answer],
      correctAnswers: [...stats.correctAnswers, question.answer],
    };

    if (answer === question.answer) {
      newStats.correct = stats.correct + 1;
      setScore(s => s + 1);
      setStats(newStats);
      setInput('');

      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 1500);

      setQuestion(generateQuestion());
    } else {
      newStats.incorrect = stats.incorrect + 1;
      setIncorrectCount(i => i + 1);
      setStats(newStats);
      setInput('');
    }
  }, [input, question, stats]);

  const handleDigit = (digit: string) => {
    if (gameOver) return;
    setInput(prev => prev.length < 4 ? prev + digit : prev);
  };

  const startGame = () => {
    setQuestion(generateQuestion());
    setInput('');
    setScore(0);
    setIncorrectCount(0);
    setGameOver(false);
    setShowStats(false);
    setGameStarted(true);
    setCorrectFlash(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const endRound = () => {
    const finalStats = { ...stats, totalTime: Math.floor((Date.now() - startTime) / 1000) };
    setStats(finalStats);
    setGameOver(true);
    setElapsedTime(finalStats.totalTime);
    setTimeout(() => {
      setShowStats(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }, 300);
  };

  const handlePointerDown = useCallback((e: React.PointerEvent, action: () => void) => {
    e.preventDefault(); // Prevents the subsequent click event
    action();
  }, []);

  const pct = calculatePercentage(stats.correct, stats.questionsAnswered.length);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-fuchsia-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">♾️</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-6">Infinity Round</h2>
          
          <div className="bg-purple-50 rounded-2xl p-4 mb-6 border-2 border-purple-200 text-left">
            <h4 className="font-bold text-purple-700 mb-2">📋 How it works:</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Unlimited questions!</li>
              <li>• Play as long as you want</li>
              <li>• Press "End Round" when ready</li>
              <li>• See your stats at the end!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            ♾️ Start Infinity Round!
          </button>
          <button
            onClick={onHome}
            className="block mx-auto mt-4 text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-fuchsia-100 transition-colors duration-300 ${correctFlash ? 'bg-green-200' : ''}`}>
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-700">♾️ Infinity Round</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-xs text-gray-500">Correct</p>
              <p className="text-xl font-bold text-green-600">{score}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Incorrect</p>
              <p className="text-xl font-bold text-red-500">{incorrectCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-purple-600">{score + incorrectCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-xl font-bold text-gray-700">{formatTime(elapsedTime)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-gray-500 text-lg mb-2">Solve this:</p>
          <div className="text-5xl md:text-6xl font-bold text-gray-800">
            {question.num1} + {question.num2} = ?
          </div>
          {correctFlash && (
            <p className="text-green-600 font-bold text-xl mt-3 animate-bounce">✅ Correct!</p>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 pb-4">
        <NumberPad
          value={input}
          onDigit={handleDigit}
          onClear={() => setInput('')}
          onSubmit={checkAnswer}
          onDelete={() => setInput(prev => prev.slice(0, -1))}
          color="purple"
          disabled={gameOver}
          enableKeyboard={true}
        />
      </div>

      <div className="text-center pb-8">
        <button
          onPointerDown={(e) => handlePointerDown(e, endRound)}
          disabled={gameOver}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-3 px-8 rounded-xl text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
        >
          🏁 End Round
        </button>
      </div>

      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-3xl font-bold text-purple-600">Round Complete!</h2>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4 mb-4 border-2 border-purple-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{formatTime(stats.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct:</span>
                  <span className="font-semibold text-green-600">{stats.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Incorrect:</span>
                  <span className="font-semibold text-red-500">{stats.incorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Questions:</span>
                  <span className="font-semibold">{stats.questionsAnswered.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div className={`h-3 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">💡 Tips to Improve:</h4>
              <ul className="space-y-1">
                {getAdvice(stats).map((tip, idx) => (
                  <li key={idx} className="text-blue-700 text-sm">{tip}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl text-lg hover:scale-105 transition-all shadow-lg"
              >
                ♾️ Play Again!
              </button>
              <button
                onClick={onHome}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-xl text-lg transition-all"
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfinityRound;
