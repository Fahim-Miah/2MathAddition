import React, { useState, useEffect, useCallback } from 'react';
import NumberPad from './NumberPad';
import TwoPlayerStatsOverlay from './TwoPlayerStatsOverlay';
import { generateQuestion, Question, PlayerStats } from '../utils/gameUtils';

interface TwoPlayerGameProps {
  onHome: () => void;
}

const TwoPlayerGame: React.FC<TwoPlayerGameProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [questionsToWin, setQuestionsToWin] = useState(10);
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const [player1CorrectFlash, setPlayer1CorrectFlash] = useState(false);
  const [player2CorrectFlash, setPlayer2CorrectFlash] = useState(false);

  const [player1Stats, setPlayer1Stats] = useState<PlayerStats>({
    correct: 0, incorrect: 0, totalTime: 0,
    questionsAnswered: [], answersGiven: [], correctAnswers: [],
  });

  const [player2Stats, setPlayer2Stats] = useState<PlayerStats>({
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

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
  }, []);

  const checkAnswer = useCallback((player: 1 | 2, input: string) => {
    if (input.length === 0) return;
    
    const answer = parseInt(input);
    const encodedQ = question.num1 * 10000 + question.num2;
    
    if (player === 1) {
      const newStats = {
        ...player1Stats,
        questionsAnswered: [...player1Stats.questionsAnswered, encodedQ],
        answersGiven: [...player1Stats.answersGiven, answer],
        correctAnswers: [...player1Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        const newScore = player1Score + 1;
        newStats.correct = player1Stats.correct + 1;
        setPlayer1Score(newScore);
        setPlayer1Stats(newStats);
        setPlayer1Input('');
        
        setPlayer1CorrectFlash(true);
        setTimeout(() => setPlayer1CorrectFlash(false), 1500);
        
        if (newScore >= questionsToWin) {
          newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
          setPlayer1Stats(newStats);
          setPlayer2Stats(prev => ({ ...prev, totalTime: Math.floor((Date.now() - startTime) / 1000) }));
          setGameOver(true);
          setWinner('player1');
          setTimeout(() => setShowStats(true), 2000);
          return;
        }
        
        nextQuestion();
      } else {
        newStats.incorrect = player1Stats.incorrect + 1;
        setPlayer1Stats(newStats);
        setPlayer1Input('');
      }
    } else {
      const newStats = {
        ...player2Stats,
        questionsAnswered: [...player2Stats.questionsAnswered, encodedQ],
        answersGiven: [...player2Stats.answersGiven, answer],
        correctAnswers: [...player2Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        const newScore = player2Score + 1;
        newStats.correct = player2Stats.correct + 1;
        setPlayer2Score(newScore);
        setPlayer2Stats(newStats);
        setPlayer2Input('');
        
        setPlayer2CorrectFlash(true);
        setTimeout(() => setPlayer2CorrectFlash(false), 1500);
        
        if (newScore >= questionsToWin) {
          newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
          setPlayer2Stats(newStats);
          setPlayer1Stats(prev => ({ ...prev, totalTime: Math.floor((Date.now() - startTime) / 1000) }));
          setGameOver(true);
          setWinner('player2');
          setTimeout(() => setShowStats(true), 2000);
          return;
        }
        
        nextQuestion();
      } else {
        newStats.incorrect = player2Stats.incorrect + 1;
        setPlayer2Stats(newStats);
        setPlayer2Input('');
      }
    }
  }, [question, player1Score, player2Score, player1Stats, player2Stats, startTime, nextQuestion, questionsToWin]);

  const handlePlayer1Digit = (digit: string) => {
    if (gameOver) return;
    setPlayer1Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const handlePlayer2Digit = (digit: string) => {
    if (gameOver) return;
    setPlayer2Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const startGame = () => {
    setQuestion(generateQuestion());
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const resetGame = () => {
    setQuestion(generateQuestion());
    setPlayer1Input('');
    setPlayer2Input('');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setGameOver(false);
    setWinner(null);
    setShowStats(false);
    setGameStarted(false);
    setPlayer1CorrectFlash(false);
    setPlayer2CorrectFlash(false);
    setPlayer1Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
    setPlayer2Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (gameStarted && !gameOver) {
      e.preventDefault();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-6">Two Player Battle</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">
              How many correct answers to win?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionsToWin(num)}
                  className={`py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
                    questionsToWin === num
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-3">
              First player to get <span className="font-bold text-purple-600">{questionsToWin}</span> correct answers wins!
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-200 text-left">
            <h4 className="font-bold text-blue-700 mb-2">📋 Rules:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Both players see the same question</li>
              <li>• The question stays until someone answers correctly</li>
              <li>• Wrong answers don't change the question</li>
              <li>• First to {questionsToWin} correct answers wins!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎮 Start Game!
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
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-red-100"
      onContextMenu={handleContextMenu}
    >
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-700">⚔️ Two Player Battle!</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {`${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`}</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex-1 text-center relative">
            <span className="text-blue-600 font-bold text-lg">🔵 Player 1</span>
            <div className="text-3xl font-bold text-blue-700">{player1Score}/{questionsToWin}</div>
            {player1CorrectFlash && (
              <span className="absolute -top-1 -right-1 text-2xl animate-bounce">✓</span>
            )}
          </div>
          <div className="text-4xl font-bold text-gray-300">VS</div>
          <div className="flex-1 text-center relative">
            <span className="text-red-600 font-bold text-lg">🔴 Player 2</span>
            <div className="text-3xl font-bold text-red-700">{player2Score}/{questionsToWin}</div>
            {player2CorrectFlash && (
              <span className="absolute -top-1 -left-1 text-2xl animate-bounce">✓</span>
            )}
          </div>
        </div>
      </div>

      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-bounce">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className={`text-4xl font-bold ${winner === 'player1' ? 'text-blue-600' : 'text-red-600'}`}>
              {winner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'} Wins!
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-gray-500 text-lg mb-2">Solve this:</p>
          <div className="text-5xl md:text-6xl font-bold text-gray-800">
            {question.num1} + {question.num2} = ?
          </div>
          <p className="text-sm text-gray-400 mt-3">Question stays until answered correctly</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className={`bg-blue-50 rounded-3xl p-4 border-4 shadow-lg transition-all duration-300 ${
              player1CorrectFlash ? 'border-green-400 ring-2 ring-green-300' : 'border-blue-300'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <h3 className="text-center text-xl font-bold text-blue-700 mb-3">🔵 Player 1</h3>
            <NumberPad
              value={player1Input}
              onDigit={handlePlayer1Digit}
              onClear={() => setPlayer1Input('')}
              onSubmit={() => { if (player1Input) checkAnswer(1, player1Input); }}
              onDelete={() => setPlayer1Input(prev => prev.slice(0, -1))}
              color="blue"
              disabled={gameOver}
            />
          </div>

          <div 
            className={`bg-red-50 rounded-3xl p-4 border-4 shadow-lg transition-all duration-300 ${
              player2CorrectFlash ? 'border-green-400 ring-2 ring-green-300' : 'border-red-300'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            <h3 className="text-center text-xl font-bold text-red-700 mb-3">🔴 Player 2</h3>
            <NumberPad
              value={player2Input}
              onDigit={handlePlayer2Digit}
              onClear={() => setPlayer2Input('')}
              onSubmit={() => { if (player2Input) checkAnswer(2, player2Input); }}
              onDelete={() => setPlayer2Input(prev => prev.slice(0, -1))}
              color="red"
              disabled={gameOver}
            />
          </div>
        </div>
      </div>

      {showStats && (
        <TwoPlayerStatsOverlay
          player1Stats={player1Stats}
          player2Stats={player2Stats}
          winner={winner}
          onPlayAgain={resetGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};

export default TwoPlayerGame;
