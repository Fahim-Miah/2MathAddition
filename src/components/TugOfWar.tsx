import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import NumberPad from './NumberPad';
import { generateQuestion, Question, PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface TugOfWarProps {
  onHome: () => void;
}

const TugOfWar: React.FC<TugOfWarProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(3);
  const [ropePosition, setRopePosition] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const [team1Input, setTeam1Input] = useState('');
  const [team2Input, setTeam2Input] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null);
  const [flashTeam, setFlashTeam] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(0);
  const gameOverRef = useRef(false);

  const [team1Stats, setTeam1Stats] = useState<PlayerStats>({
    correct: 0, incorrect: 0, totalTime: 0,
    questionsAnswered: [], answersGiven: [], correctAnswers: [],
  });
  const [team2Stats, setTeam2Stats] = useState<PlayerStats>({
    correct: 0, incorrect: 0, totalTime: 0,
    questionsAnswered: [], answersGiven: [], correctAnswers: [],
  });

  const BASELINE = 70;

  const endGame = useCallback((winnerTeam?: 'team1' | 'team2') => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    if (winnerTeam) {
      setWinner(winnerTeam);
    } else {
      setRopePosition(pos => {
        if (pos < 0) setWinner('team1');
        else if (pos > 0) setWinner('team2');
        else setWinner(null);
        return pos;
      });
    }

    setTeam1Stats(prev => ({ ...prev, totalTime: elapsed }));
    setTeam2Stats(prev => ({ ...prev, totalTime: elapsed }));
    setTimeout(() => {
      setShowStats(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 500);
  }, [startTime]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, endGame]);

  const checkAnswer = useCallback((teamIdx: number, input: string) => {
    if (gameOverRef.current || input.length === 0) return;
    const answer = parseInt(input);
    const encodedQ = question.num1 * 10000 + question.num2;

    if (answer === question.answer) {
      setFlashTeam(teamIdx);
      setTimeout(() => setFlashTeam(null), 600);

      const pullAmount = 8 + Math.random() * 4;
      setRopePosition(prev => {
        const newPos = teamIdx === 0 ? prev - pullAmount : prev + pullAmount;
        if (newPos <= -BASELINE) {
          endGame('team1');
          return -BASELINE;
        } else if (newPos >= BASELINE) {
          endGame('team2');
          return BASELINE;
        }
        return newPos;
      });

      const newStats = {
        questionsAnswered: [...(teamIdx === 0 ? team1Stats : team2Stats).questionsAnswered, encodedQ],
        answersGiven: [...(teamIdx === 0 ? team1Stats : team2Stats).answersGiven, answer],
        correctAnswers: [...(teamIdx === 0 ? team1Stats : team2Stats).correctAnswers, question.answer],
      };

      if (teamIdx === 0) {
        setTeam1Stats(prev => ({ ...prev, correct: prev.correct + 1, ...newStats }));
        setTeam1Input('');
      } else {
        setTeam2Stats(prev => ({ ...prev, correct: prev.correct + 1, ...newStats }));
        setTeam2Input('');
      }
      setQuestion(generateQuestion());
    } else if (input.length >= String(question.answer).length) {
      if (teamIdx === 0) {
        setTeam1Stats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        setTeam1Input('');
      } else {
        setTeam2Stats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
        setTeam2Input('');
      }
    } else {
      if (teamIdx === 0) setTeam1Input(input);
      else setTeam2Input(input);
    }
  }, [question, team1Stats, team2Stats, endGame]);

  const handleTeam1Digit = (digit: string) => {
    if (gameOver) return;
    setTeam1Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const handleTeam2Digit = (digit: string) => {
    if (gameOver) return;
    setTeam2Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const startGame = (minutes: number) => {
    setTimeLimit(minutes);
    setTimeRemaining(minutes * 60);
    setRopePosition(0);
    setQuestion(generateQuestion());
    setTeam1Input('');
    setTeam2Input('');
    setTeam1Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
    setTeam2Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
    setStartTime(Date.now());
    setWinner(undefined as any);
    setGameOver(false);
    gameOverRef.current = false;
    setGameStarted(true);
  };

  // Keyboard support
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setActiveTeam(prev => (prev === 0 ? 1 : 0) as 0 | 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, gameOver]);

  const ropePercent = (ropePosition / BASELINE) * 40;
  const p1Pct = calculatePercentage(team1Stats.correct, team1Stats.questionsAnswered.length);
  const p2Pct = calculatePercentage(team2Stats.correct, team2Stats.questionsAnswered.length);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-300 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🪢</div>
          <h2 className="text-3xl font-bold text-red-700 mb-6">Tug of War</h2>
          <p className="text-gray-600 mb-4">
            Two teams compete! Answer addition questions correctly to pull the rope to your side.
            First team to pull past the baseline wins!
          </p>
          
          <h3 className="font-bold text-gray-700 mb-3">⏱️ Select Time Limit:</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 3, 5, 7, 10, 15].map(min => (
              <button
                key={min}
                onClick={() => startGame(min)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-xl text-lg shadow-lg hover:scale-105 transition-all"
              >
                {min} min
              </button>
            ))}
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 mb-6 border-2 border-orange-200 text-left">
            <h4 className="font-bold text-orange-700 mb-2">📋 Rules:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Each correct answer pulls the rope toward your side</li>
              <li>• Pull the rope past the baseline to win!</li>
              <li>• If time runs out, the team closest to their baseline wins</li>
              <li>• Press Tab to switch between teams</li>
            </ul>
          </div>

          <button
            onClick={onHome}
            className="block mx-auto text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 overflow-hidden relative">
      {/* Clouds */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute text-5xl opacity-50 animate-pulse"
            style={{ top: `${10 + i * 18}%`, left: `${i * 25}%`, animationDelay: `${i * 0.5}s` }}
          >
            ☁️
          </div>
        ))}
      </div>

      {/* Timer & Score Bar */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg p-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-blue-600 font-bold">🔵 Alpha: {team1Stats.correct}</div>
          <div className={`text-center font-bold text-xl ${timeRemaining <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
          <div className="text-red-600 font-bold">Beta: {team2Stats.correct} 🔴</div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4 min-h-[250px]">
        {/* Grass */}
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-gradient-to-t from-green-700 via-green-500 to-green-400 rounded-t-[50%]" />
        <div className="absolute top-4 right-8 text-5xl opacity-80">☀️</div>

        {/* Baselines */}
        <div className="absolute left-[12%] top-[35%] bottom-[35%] w-1.5 bg-white/60 rounded-full" />
        <div className="absolute right-[12%] top-[35%] bottom-[35%] w-1.5 bg-white/60 rounded-full" />
        <div className="absolute left-[10%] top-[32%] text-xl">🏁</div>
        <div className="absolute right-[10%] top-[32%] text-xl">🏁</div>

        {/* Rope area */}
        <div className="relative w-full max-w-3xl h-48 flex items-center">
          {/* Rope */}
          <div className="absolute top-1/2 left-[12%] right-[12%] h-4 -translate-y-1/2">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-yellow-600 to-amber-800 rounded-full shadow-md" />
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute top-0.5 bottom-0.5 w-0.5 bg-amber-900/30" style={{ left: `${i * 5 + 1}%`, transform: `rotate(${i % 2 === 0 ? 15 : -15}deg)` }} />
              ))}
              {/* Center ribbon */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-8 bg-red-500 rounded-sm shadow-lg border-2 border-red-700 transition-all duration-300"
                style={{ left: `calc(50% + ${ropePercent * 0.8}% - 12px)` }}
              >
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-red-500" />
              </div>
            </div>
          </div>

          {/* Team 1 Character */}
          <div
            className="absolute left-[2%] flex flex-col items-center transition-all duration-300"
            style={{ transform: `translateX(${ropePercent * 0.4}%)` }}
          >
            <div className={`text-7xl md:text-8xl select-none transition-all duration-300 ${flashTeam === 0 ? 'scale-110' : ''}`}
              style={{ filter: flashTeam === 0 ? 'brightness(1.3) drop-shadow(0 0 10px #3b82f6)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}>
              🦸‍♂️
            </div>
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 shadow-md">ALPHA</div>
          </div>

          {/* Team 2 Character */}
          <div
            className="absolute right-[2%] flex flex-col items-center transition-all duration-300"
            style={{ transform: `translateX(${ropePercent * 0.4}%)` }}
          >
            <div className={`text-7xl md:text-8xl select-none transition-all duration-300 ${flashTeam === 1 ? 'scale-110' : ''}`}
              style={{ filter: flashTeam === 1 ? 'brightness(1.3) drop-shadow(0 0 10px #ef4444)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}>
              🦸‍♀️
            </div>
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 shadow-md">BETA</div>
          </div>
        </div>

        {/* Position indicator */}
        <div className="w-full max-w-md mx-auto mt-2 bg-white/80 rounded-full h-6 relative overflow-hidden shadow-inner border-2 border-white">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-blue-200" />
            <div className="w-0.5 bg-gray-400" />
            <div className="flex-1 bg-red-200" />
          </div>
          <div
            className="absolute top-0.5 bottom-0.5 w-4 bg-gray-800 rounded-full shadow-md transition-all duration-300"
            style={{ left: `calc(${50 + ropePercent / 2.5}% - 8px)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {ropePosition < -15 ? '← Alpha Leading!' : ropePosition > 15 ? 'Beta Leading! →' : '⚔️ Tied!'}
          </div>
        </div>
      </div>

      {/* Question & Input Area */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-t-3xl p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          {/* Team selector */}
          <div className="flex justify-center gap-4 mb-3">
            <button
              onClick={() => setActiveTeam(0)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTeam === 0 ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-blue-100 text-blue-600'}`}
            >
              🔵 Alpha
            </button>
            <button
              onClick={() => setActiveTeam(1)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTeam === 1 ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-red-100 text-red-600'}`}
            >
              🔴 Beta
            </button>
          </div>

          {/* Question */}
          <div className="text-center mb-3">
            <p className="text-3xl md:text-4xl font-bold text-gray-800">
              {question.num1} + {question.num2} = ?
            </p>
          </div>

          {/* Input areas */}
          <div className="flex gap-2 md:gap-4 justify-center items-start">
            {/* Team 1 */}
            <div className={`flex-1 max-w-xs transition-all ${activeTeam === 0 ? 'ring-2 ring-blue-400 rounded-2xl' : ''}`}>
              <NumberPad
                value={team1Input}
                onDigit={handleTeam1Digit}
                onClear={() => setTeam1Input('')}
                onSubmit={() => { if (team1Input) checkAnswer(0, team1Input); }}
                onDelete={() => setTeam1Input(prev => prev.slice(0, -1))}
                color="blue"
                disabled={gameOver}
              />
            </div>

            {/* Team 2 */}
            <div className={`flex-1 max-w-xs transition-all ${activeTeam === 1 ? 'ring-2 ring-red-400 rounded-2xl' : ''}`}>
              <NumberPad
                value={team2Input}
                onDigit={handleTeam2Digit}
                onClear={() => setTeam2Input('')}
                onSubmit={() => { if (team2Input) checkAnswer(1, team2Input); }}
                onDelete={() => setTeam2Input(prev => prev.slice(0, -1))}
                color="red"
                disabled={gameOver}
              />
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">Press Tab to switch between teams</p>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className={`text-3xl font-bold ${winner === 'team1' ? 'text-blue-600' : winner === 'team2' ? 'text-red-600' : 'text-gray-600'}`}>
                {winner === 'team1' ? '🔵 Team Alpha Wins!' : winner === 'team2' ? '🔴 Team Beta Wins!' : "It's a Tie!"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-2xl p-4 ${winner === 'team1' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-blue-50 border-2 border-blue-200'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {winner === 'team1' && <span className="text-2xl">👑</span>}
                  <h3 className="text-xl font-bold text-blue-600">🔵 Alpha</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="font-semibold">{formatTime(team1Stats.totalTime)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Correct:</span><span className="font-semibold text-green-600">{team1Stats.correct}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Incorrect:</span><span className="font-semibold text-red-500">{team1Stats.incorrect}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Accuracy:</span><span className="font-semibold">{p1Pct}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div className={`h-3 rounded-full ${p1Pct >= 70 ? 'bg-green-500' : p1Pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p1Pct}%` }} />
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-4 ${winner === 'team2' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {winner === 'team2' && <span className="text-2xl">👑</span>}
                  <h3 className="text-xl font-bold text-red-600">🔴 Beta</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="font-semibold">{formatTime(team2Stats.totalTime)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Correct:</span><span className="font-semibold text-green-600">{team2Stats.correct}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Incorrect:</span><span className="font-semibold text-red-500">{team2Stats.incorrect}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Accuracy:</span><span className="font-semibold">{p2Pct}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div className={`h-3 rounded-full ${p2Pct >= 70 ? 'bg-green-500' : p2Pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p2Pct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-200">
              <h4 className="font-bold text-blue-800 mb-2">💡 Tips to Improve:</h4>
              <ul className="space-y-1">
                {getAdvice(winner === 'team1' ? team1Stats : team2Stats).map((tip, idx) => (
                  <li key={idx} className="text-blue-700 text-sm">{tip}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setGameStarted(false); setShowStats(false); }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl text-lg hover:scale-105 transition-all shadow-lg"
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

export default TugOfWar;
