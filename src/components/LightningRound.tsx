import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { generateQuestion, generateMultipleChoice, PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface LightningRoundProps {
  onHome: () => void;
}

const LightningRound: React.FC<LightningRoundProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion());
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);

  const [stats, setStats] = useState<PlayerStats>({
    correct: 0, incorrect: 0, totalTime: 0,
    questionsAnswered: [], answersGiven: [], correctAnswers: [],
  });

  useEffect(() => {
    if (gameStarted && !gameOver) {
      setChoices(generateMultipleChoice(question.answer));
    }
  }, [question, gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          setTimeout(() => setShowStats(true), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  const handleChoiceSelect = useCallback((choice: number) => {
    if (selectedAnswer !== null || gameOver) return;
    setSelectedAnswer(choice);
    const encodedQ = question.num1 * 10000 + question.num2;
    const right = choice === question.answer;

    if (right) {
      setIsCorrect(true);
      setScore(s => s + 1);
      setStats(prev => ({
        ...prev,
        correct: prev.correct + 1,
        questionsAnswered: [...prev.questionsAnswered, encodedQ],
        answersGiven: [...prev.answersGiven, choice],
        correctAnswers: [...prev.correctAnswers, question.answer],
      }));
    } else {
      setIsCorrect(false);
      setIncorrectCount(i => i + 1);
      setStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        questionsAnswered: [...prev.questionsAnswered, encodedQ],
        answersGiven: [...prev.answersGiven, choice],
        correctAnswers: [...prev.correctAnswers, question.answer],
      }));
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestion(generateQuestion());
      setQuestionNum(n => n + 1);
    }, 1000);
  }, [selectedAnswer, gameOver, question]);

  // Keyboard support
  useEffect(() => {
    if (!gameStarted || gameOver || selectedAnswer !== null) return;
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
  }, [gameStarted, gameOver, selectedAnswer, choices, handleChoiceSelect]);

  const startGame = () => {
    const q = generateQuestion();
    setQuestion(q);
    setChoices(generateMultipleChoice(q.answer));
    setScore(0);
    setIncorrectCount(0);
    setTimeLeft(60);
    setGameOver(false);
    setShowStats(false);
    setGameStarted(true);
    setStartTime(Date.now());
    setQuestionNum(1);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const pct = calculatePercentage(stats.correct, stats.questionsAnswered.length);
  const totalTime = 60 - timeLeft;

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-3xl font-bold text-orange-700 mb-6">Lightning Round</h2>
          
          <div className="bg-orange-50 rounded-2xl p-4 mb-6 border-2 border-orange-200 text-left">
            <h4 className="font-bold text-orange-700 mb-2">📋 Rules:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• You have 60 seconds</li>
              <li>• Answer multiple-choice questions</li>
              <li>• Pick from 4 choices</li>
              <li>• Press 1-4 on keyboard or click!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            ⚡ Start Lightning Round!
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100">
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-orange-700">⚡ Lightning Round!</h1>
          <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-orange-600 font-bold">✅ {score}</span>
            <span className="text-gray-500 text-sm">Question {questionNum}</span>
            <span className="text-red-500 font-bold">❌ {incorrectCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all" style={{ width: `${(timeLeft / 60) * 100}%` }} />
          </div>
        </div>
      </div>

      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-bounce">
            <div className="text-7xl mb-4">⚡</div>
            <h2 className="text-4xl font-bold text-orange-600">Time's Up!</h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-gray-500 text-lg mb-2">What is:</p>
          <div className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            {question.num1} + {question.num2} = ?
          </div>

          <div className="grid grid-cols-2 gap-3">
            {choices.map((choice, idx) => {
              let btnClass = 'bg-gray-100 hover:bg-orange-100 text-gray-800 border-2 border-gray-200';
              if (selectedAnswer !== null) {
                if (choice === question.answer) {
                  btnClass = 'bg-green-100 border-2 border-green-500 text-green-800';
                } else if (choice === selectedAnswer && !isCorrect) {
                  btnClass = 'bg-red-100 border-2 border-red-500 text-red-800';
                }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={selectedAnswer !== null}
                  className={`${btnClass} rounded-2xl py-4 text-2xl font-bold transition-colors`}
                >
                  <span className="text-sm text-gray-400 mr-1">{idx + 1}.</span> {choice}
                </button>
              );
            })}
          </div>

          {isCorrect !== null && (
            <p className={`mt-4 font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '✅ Correct!' : `❌ The answer was ${question.answer}`}
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm mt-4">Press 1-4 on your keyboard to select an answer</p>

      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">⚡</div>
              <h2 className="text-3xl font-bold text-orange-600">Lightning Complete!</h2>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4 mb-4 border-2 border-orange-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Used:</span>
                  <span className="font-semibold">{formatTime(totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct:</span>
                  <span className="font-semibold text-green-600">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Incorrect:</span>
                  <span className="font-semibold text-red-500">{incorrectCount}</span>
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
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl text-lg hover:scale-105 transition-all shadow-lg"
              >
                ⚡ Play Again!
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

export default LightningRound;
