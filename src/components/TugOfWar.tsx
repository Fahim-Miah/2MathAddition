import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAdditionQuestion } from '../utils/math';
import { StatsOverlay } from './StatsOverlay';

interface TugOfWarProps {
  onBack: () => void;
}

interface TeamStats {
  name: string;
  correct: number;
  incorrect: number;
  total: number;
  time: number;
}

export const TugOfWar: React.FC<TugOfWarProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [timeLimit, setTimeLimit] = useState(3);
  const [ropePosition, setRopePosition] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(generateAdditionQuestion());
  const [activeTeam, setActiveTeam] = useState<0 | 1>(0);
  const [inputValues, setInputValues] = useState(['', '']);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([
    { name: 'Team Alpha', correct: 0, incorrect: 0, total: 0, time: 0 },
    { name: 'Team Beta', correct: 0, incorrect: 0, total: 0, time: 0 },
  ]);
  const [startTime, setStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [winner, setWinner] = useState<number | undefined>(undefined);
  const [flashTeam, setFlashTeam] = useState<number | null>(null);
  const [shakeRope, setShakeRope] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);
  const startTimeRef = useRef(0);

  const BASELINE = 70;

  const endGame = useCallback((winnerIdx?: number) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    setPhase('finished');
    
    const elapsed = Date.now() - startTimeRef.current;
    
    if (winnerIdx !== undefined) {
      setWinner(winnerIdx);
    } else {
      setRopePosition(pos => {
        if (pos < 0) setWinner(0);
        else if (pos > 0) setWinner(1);
        else setWinner(undefined);
        return pos;
      });
    }
    
    setTeamStats(prev => prev.map(s => ({ ...s, time: elapsed })));
    setTimeout(() => setShowStats(true), 500);
  }, []);

  const initGame = (minutes: number) => {
    setTimeLimit(minutes);
    setTimeRemaining(minutes * 60);
    setRopePosition(0);
    setCurrentQuestion(generateAdditionQuestion());
    setInputValues(['', '']);
    setTeamStats([
      { name: 'Team Alpha', correct: 0, incorrect: 0, total: 0, time: 0 },
      { name: 'Team Beta', correct: 0, incorrect: 0, total: 0, time: 0 },
    ]);
    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    setWinner(undefined);
    setGameOver(false);
    gameOverRef.current = false;
    setPhase('playing');
  };

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, endGame]);

  const checkAnswer = useCallback((teamIdx: number, value: string) => {
    if (gameOverRef.current) return;
    
    setCurrentQuestion(prevQ => {
      const answer = prevQ.answer;

      if (parseInt(value) === answer) {
        setFlashTeam(teamIdx);
        setShakeRope(true);
        setTimeout(() => { setFlashTeam(null); setShakeRope(false); }, 600);

        const pullAmount = 8 + Math.random() * 4;
        
        setRopePosition(prev => {
          const newPos = teamIdx === 0 ? prev - pullAmount : prev + pullAmount;
          
          if (newPos <= -BASELINE) {
            endGame(0);
            return -BASELINE;
          } else if (newPos >= BASELINE) {
            endGame(1);
            return BASELINE;
          }
          return newPos;
        });

        setTeamStats(prev => prev.map((s, i) =>
          i === teamIdx ? { ...s, correct: s.correct + 1, total: s.total + 1 } : s
        ));
        setInputValues(prev => { const n = [...prev]; n[teamIdx] = ''; return n; });
        return generateAdditionQuestion();
      } else if (value.length >= String(answer).length) {
        setTeamStats(prev => prev.map((s, i) =>
          i === teamIdx ? { ...s, incorrect: s.incorrect + 1, total: s.total + 1 } : s
        ));
        setInputValues(prev => { const n = [...prev]; n[teamIdx] = ''; return n; });
        return prevQ;
      } else {
        setInputValues(prev => { const n = [...prev]; n[teamIdx] = value; return n; });
        return prevQ;
      }
    });
  }, [endGame]);

  const handleInput = (teamIdx: number, value: string) => {
    if (phase !== 'playing' || gameOverRef.current) return;
    if (value === '') {
      setInputValues(prev => { const n = [...prev]; n[teamIdx] = ''; return n; });
      return;
    }
    checkAnswer(teamIdx, value);
  };

  // Keyboard support
  useEffect(() => {
    if (phase !== 'playing') return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') return;
      
      if (e.key >= '0' && e.key <= '9') {
        const team = activeTeam;
        const newValue = inputValues[team] + e.key;
        checkAnswer(team, newValue);
      } else if (e.key === 'Backspace') {
        setInputValues(prev => {
          const n = [...prev];
          n[activeTeam] = n[activeTeam].slice(0, -1);
          return n;
        });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActiveTeam(prev => (prev === 0 ? 1 : 0) as 0 | 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, activeTeam, inputValues, checkAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-300 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-red-700 mb-4">🦸 Tug of War</h2>
          <p className="text-center text-gray-600 mb-2">Two teams compete to pull the rope to their side!</p>
          <p className="text-center text-gray-500 mb-6 text-sm">Answer questions correctly to pull the rope. First team to pull past the baseline wins!</p>
          
          <h3 className="font-bold text-gray-700 mb-3">⏱️ Select Time Limit:</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 3, 5, 7, 10, 15].map(min => (
              <motion.button
                key={min}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => initGame(min)}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 rounded-2xl text-lg shadow-lg"
              >
                {min} min
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

  const ropePercent = (ropePosition / BASELINE) * 40;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 overflow-hidden relative">
      {/* Clouds */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl opacity-60"
            style={{ top: `${10 + i * 15}%` }}
            animate={{ x: ['-10vw', '110vw'] }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, delay: i * 5 }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      {/* Timer & Score Bar */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm shadow-lg p-3">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="text-blue-600 font-bold text-sm md:text-base">
            🔵 Alpha: {teamStats[0].correct}
          </div>
          <div className={`text-center font-bold text-lg md:text-xl ${timeRemaining <= 30 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
          <div className="text-red-600 font-bold text-sm md:text-base">
            Beta: {teamStats[1].correct} 🔴
          </div>
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4 min-h-[300px]">
        {/* Grass ground */}
        <div className="absolute bottom-0 left-0 w-full h-[35%] bg-gradient-to-t from-green-700 via-green-500 to-green-400 rounded-t-[50%]" />
        
        {/* Sun */}
        <div className="absolute top-4 right-8 text-5xl opacity-80">☀️</div>

        {/* Baseline markers */}
        <div className="absolute left-[12%] top-[40%] bottom-[35%] w-1.5 bg-white/70 rounded-full" />
        <div className="absolute right-[12%] top-[40%] bottom-[35%] w-1.5 bg-white/70 rounded-full" />
        <div className="absolute left-[10%] top-[37%] text-xl">🏁</div>
        <div className="absolute right-[10%] top-[37%] text-xl">🏁</div>

        {/* Center line */}
        <div className="absolute left-1/2 top-[40%] bottom-[35%] w-0.5 bg-white/30 -translate-x-1/2" />

        {/* Rope & Characters Container */}
        <div className="relative w-full max-w-3xl h-48 md:h-64 flex items-center">
          {/* Rope */}
          <motion.div
            className="absolute top-1/2 left-[12%] right-[12%] h-5 -translate-y-1/2"
            animate={shakeRope ? { y: ['-50%', 'calc(-50% - 4px)', 'calc(-50% + 4px)', '-50%'] } : {}}
            transition={{ duration: 0.2, repeat: 2 }}
          >
            <div className="w-full h-full relative">
              {/* Main rope */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-yellow-600 to-amber-800 rounded-full shadow-md" />
              {/* Rope texture */}
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0.5 bottom-0.5 w-0.5 bg-amber-900/40"
                  style={{ left: `${i * 4 + 1}%`, transform: `rotate(${i % 2 === 0 ? 20 : -20}deg)` }}
                />
              ))}
              {/* Rope highlight */}
              <div className="absolute top-0.5 left-0 right-0 h-1.5 bg-yellow-300/30 rounded-full" />
              
              {/* Center marker (red ribbon) */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-7 h-10 bg-red-500 rounded-sm shadow-lg border-2 border-red-700 z-10"
                animate={{ left: `calc(50% + ${ropePercent * 0.8}% - 14px)` }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-red-400 to-red-600 rounded-sm" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[10px] border-transparent border-t-red-500" />
              </motion.div>
            </div>
          </motion.div>

          {/* Team 1 Characters (Left) */}
          <motion.div
            className="absolute left-[2%] md:left-[4%] flex flex-col items-center z-20"
            animate={{ x: `${ropePercent * 0.4}%` }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <motion.div
              animate={flashTeam === 0 ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div 
                className="text-7xl md:text-9xl select-none"
                style={{ filter: flashTeam === 0 ? 'brightness(1.3) drop-shadow(0 0 15px #3b82f6)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}
              >
                🦸‍♂️
              </div>
              {flashTeam === 0 && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-full bg-blue-400/40"
                  />
                  <motion.div
                    initial={{ opacity: 1, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 1.5, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
                  >
                    💪
                  </motion.div>
                </>
              )}
            </motion.div>
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 shadow-md">
              ALPHA
            </div>
          </motion.div>

          {/* Team 2 Characters (Right) */}
          <motion.div
            className="absolute right-[2%] md:right-[4%] flex flex-col items-center z-20"
            animate={{ x: `${ropePercent * 0.4}%` }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <motion.div
              animate={flashTeam === 1 ? { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div 
                className="text-7xl md:text-9xl select-none"
                style={{ filter: flashTeam === 1 ? 'brightness(1.3) drop-shadow(0 0 15px #ef4444)' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))' }}
              >
                🦸‍♀️
              </div>
              {flashTeam === 1 && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-full bg-red-400/40"
                  />
                  <motion.div
                    initial={{ opacity: 1, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 1.5, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
                  >
                    💪
                  </motion.div>
                </>
              )}
            </motion.div>
            <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 shadow-md">
              BETA
            </div>
          </motion.div>

          {/* Pull effect particles */}
          <AnimatePresence>
            {flashTeam !== null && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ backgroundColor: flashTeam === 0 ? '#3b82f6' : '#ef4444' }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      x: (flashTeam === 0 ? -1 : 1) * (40 + i * 12) * Math.cos(i * 45 * Math.PI / 180),
                      y: (30 + i * 8) * Math.sin(i * 45 * Math.PI / 180),
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.7, delay: i * 0.04 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Position indicator bar */}
        <div className="w-full max-w-md mx-auto mt-2 bg-white/80 rounded-full h-7 relative overflow-hidden shadow-inner border-2 border-white">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-gradient-to-r from-blue-300 to-blue-200" />
            <div className="w-0.5 bg-gray-400" />
            <div className="flex-1 bg-gradient-to-r from-red-200 to-red-300" />
          </div>
          {/* Baseline markers on bar */}
          <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-blue-600/50" />
          <div className="absolute top-0 bottom-0 right-[15%] w-0.5 bg-red-600/50" />
          
          <motion.div
            className="absolute top-0.5 bottom-0.5 w-5 bg-gray-800 rounded-full shadow-md z-10"
            animate={{ left: `calc(${50 + ropePercent / 2.5}% - 10px)` }}
            transition={{ type: 'spring', damping: 12 }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 z-20">
            {ropePosition < -15 ? '← Alpha Leading!' : ropePosition > 15 ? 'Beta Leading! →' : '⚔️ Tied!'}
          </div>
        </div>
      </div>

      {/* Question & Input Area */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-t-3xl p-4 shadow-2xl">
        <div className="max-w-2xl mx-auto">
          {/* Active team indicator */}
          <div className="flex justify-center gap-4 mb-3">
            <button
              onClick={() => setActiveTeam(0)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTeam === 0 ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-300' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            >
              🔵 Alpha
            </button>
            <button
              onClick={() => setActiveTeam(1)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTeam === 1 ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-300' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
            >
              🔴 Beta
            </button>
          </div>

          {/* Question */}
          <div className="text-center mb-3">
            <motion.p
              key={currentQuestion.a + currentQuestion.b}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold text-gray-800"
            >
              {currentQuestion.a} + {currentQuestion.b} = ?
            </motion.p>
          </div>

          {/* Input areas for both teams */}
          <div className="flex gap-2 md:gap-4 justify-center items-center">
            {/* Team 1 Input */}
            <div className={`flex-1 text-center p-2 md:p-3 rounded-2xl transition-all ${activeTeam === 0 ? 'bg-blue-100 ring-2 ring-blue-400 shadow-md' : 'bg-blue-50'}`}>
              <p className="text-xs text-blue-600 font-bold mb-1">Team Alpha</p>
              <div className="text-xl md:text-2xl font-mono font-bold text-blue-800 min-h-[36px] flex items-center justify-center">
                {inputValues[0] || <span className="text-gray-300 text-base">...</span>}
              </div>
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-1 md:gap-1.5 w-36 md:w-48">
              {['1','2','3','4','5','6','7','8','9','⌫','0','C'].map(btn => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === 'C') handleInput(activeTeam, '');
                    else if (btn === '⌫') handleInput(activeTeam, inputValues[activeTeam].slice(0, -1));
                    else handleInput(activeTeam, inputValues[activeTeam] + btn);
                  }}
                  className={`${activeTeam === 0 ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700' : 'bg-red-500 hover:bg-red-600 active:bg-red-700'} text-white font-bold rounded-lg h-9 md:h-10 text-base md:text-lg active:scale-90 transition-all shadow-sm`}
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Team 2 Input */}
            <div className={`flex-1 text-center p-2 md:p-3 rounded-2xl transition-all ${activeTeam === 1 ? 'bg-red-100 ring-2 ring-red-400 shadow-md' : 'bg-red-50'}`}>
              <p className="text-xs text-red-600 font-bold mb-1">Team Beta</p>
              <div className="text-xl md:text-2xl font-mono font-bold text-red-800 min-h-[36px] flex items-center justify-center">
                {inputValues[1] || <span className="text-gray-300 text-base">...</span>}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2">Press Tab to switch teams • Use keyboard to type answers</p>
        </div>
      </div>

      {/* Stats Overlay */}
      <StatsOverlay
        show={showStats}
        players={teamStats}
        winnerIndex={winner}
        onClose={() => { setShowStats(false); setPhase('setup'); }}
        gameMode="Tug of War"
      />
    </div>
  );
};
