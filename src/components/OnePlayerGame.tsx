import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import NumberPad from './NumberPad';
import { generateQuestion, Question, PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface OnePlayerGameProps {
  onHome: () => void;
}

const OnePlayerGame: React.FC<OnePlayerGameProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
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
      const newScore = score + 1;
      newStats.correct = stats.correct + 1;
      setScore(newScore);
      setStats(newStats);
      setInput('');

      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 1500);

      if (newScore >= totalQuestions) {
        newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
        setStats(newStats);
        setGameOver(true);
        setTimeout(() => setShowStats(true), 1500);
        // Confetti
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setQuestion(generateQuestion());
      }
    } else {
      newStats.incorrect = stats.incorrect + 1;
      setStats(newStats);
      setInput('');
    }
  }, [input, question, score, stats, startTime, totalQuestions]);

  const handleDigit = (digit: string) => {
    if (gameOver) return;
    setInput(prev => prev.length < 4 ? prev + digit : prev);
  };

  const startGame = () => {
    setQuestion(generateQuestion());
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const resetGame = () => {
    setQuestion(generateQuestion());
    setInput('');
    setScore(0);
    setGameOver(false);
    setShowStats(false);
    setGameStarted(false);
    setCorrectFlash(false);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const pct = calculatePercentage(stats.correct, stats.questionsAnswered.length);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-3xl font-bold text-green-700 mb-6">Practice Mode</h2>
          
          <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200 text-left">
            <h4 className="font-bold text-green-700 mb-2">📋 How it works:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Answer {totalQuestions} addition questions</li>
              <li>• Go at your own pace</li>
              <li>• Use the number pad or keyboard</li>
              <li>• See your stats at the end!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎮 Start Practice!
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
    <div className={`min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 transition-colors duration-300 ${correctFlash ? 'bg-green-200' : ''}`}>
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-green-700">🎯 Practice Mode</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-600 font-bold">Score: {score}/{totalQuestions}</span>
            <span className="text-gray-500 text-sm">Question {score + 1} of {totalQuestions}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-teal-500 transition-all" style={{ width: `${(score / totalQuestions) * 100}%` }} />
          </div>
        </div>
      </div>

      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-bounce">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-green-600">Great Job!</h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

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

      <div className="max-w-md mx-auto px-4 mt-6 pb-8">
        <NumberPad
          value={input}
          onDigit={handleDigit}
          onClear={() => setInput('')}
          onSubmit={checkAnswer}
          onDelete={() => setInput(prev => prev.slice(0, -1))}
          color="green"
          disabled={gameOver}
          enableKeyboard={true}
        />
      </div>

      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-3xl font-bold text-green-600">Practice Complete!</h2>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 mb-4 border-2 border-green-200">
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
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-xl text-lg hover:scale-105 transition-all shadow-lg"
              >
                🔄 Play Again!
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

export default OnePlayerGame;
