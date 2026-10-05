import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdvice } from '../utils/math';

interface PlayerStats {
  name: string;
  correct: number;
  incorrect: number;
  total: number;
  time: number;
}

interface StatsOverlayProps {
  show: boolean;
  players: PlayerStats[];
  winnerIndex?: number;
  onClose: () => void;
  gameMode: string;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({ show, players, winnerIndex, onClose, gameMode }) => {
  useEffect(() => {
    if (show && winnerIndex !== undefined) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#ef4444', '#f87171', '#fca5a5'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [show, winnerIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800">
                {winnerIndex !== undefined ? `${players[winnerIndex].name} Wins!` : 'Great Job!'}
              </h2>
              <p className="text-gray-500 mt-1">{gameMode} Complete!</p>
            </div>

            <div className={`grid ${players.length > 1 ? 'grid-cols-2 gap-4' : 'grid-cols-1'} mb-6`}>
              {players.map((player, idx) => {
                const percentage = player.total > 0 ? Math.round((player.correct / player.total) * 100) : 0;
                const isWinner = idx === winnerIndex;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.2 }}
                    className={`rounded-2xl p-4 ${isWinner ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-gray-50 border-2 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {isWinner && <span className="text-2xl">👑</span>}
                      <h3 className={`text-xl font-bold ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {player.name}
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-semibold">{formatTime(player.time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Correct:</span>
                        <span className="font-semibold text-green-600">{player.correct}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Incorrect:</span>
                        <span className="font-semibold text-red-500">{player.incorrect}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className={`h-3 rounded-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <h4 className="font-bold text-blue-800 mb-2">💡 Tips to Improve:</h4>
              <ul className="space-y-1">
                {getAdvice(
                  players.reduce((sum, p) => sum + p.correct, 0),
                  players.reduce((sum, p) => sum + p.total, 0),
                  players[0]?.time && players[0]?.total ? players[0].time / players[0].total : undefined
                ).map((tip, idx) => (
                  <li key={idx} className="text-blue-700 text-sm">{tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg active:scale-95"
            >
              Play Again! 🎮
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
