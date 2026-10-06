import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface TwoPlayerStatsOverlayProps {
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  winner: 'player1' | 'player2' | null;
  onPlayAgain: () => void;
  onHome: () => void;
}

const TwoPlayerStatsOverlay: React.FC<TwoPlayerStatsOverlayProps> = ({
  player1Stats,
  player2Stats,
  winner,
  onPlayAgain,
  onHome,
}) => {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#f87171', '#fca5a5'],
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const p1Pct = calculatePercentage(player1Stats.correct, player1Stats.questionsAnswered.length);
  const p2Pct = calculatePercentage(player2Stats.correct, player2Stats.questionsAnswered.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-bounceIn">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🎉</div>
          <h2 className={`text-3xl md:text-4xl font-bold ${winner === 'player1' ? 'text-blue-600' : 'text-red-600'}`}>
            {winner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'} Wins!
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Player 1 Stats */}
          <div className={`rounded-2xl p-4 ${winner === 'player1' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-blue-50 border-2 border-blue-200'}`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              {winner === 'player1' && <span className="text-2xl">👑</span>}
              <h3 className="text-xl font-bold text-blue-600">🔵 Player 1</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{formatTime(player1Stats.totalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct:</span>
                <span className="font-semibold text-green-600">{player1Stats.correct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Incorrect:</span>
                <span className="font-semibold text-red-500">{player1Stats.incorrect}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-semibold">{p1Pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div className={`h-3 rounded-full ${p1Pct >= 70 ? 'bg-green-500' : p1Pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p1Pct}%` }} />
              </div>
            </div>
          </div>

          {/* Player 2 Stats */}
          <div className={`rounded-2xl p-4 ${winner === 'player2' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-red-50 border-2 border-red-200'}`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              {winner === 'player2' && <span className="text-2xl">👑</span>}
              <h3 className="text-xl font-bold text-red-600">🔴 Player 2</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{formatTime(player2Stats.totalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Correct:</span>
                <span className="font-semibold text-green-600">{player2Stats.correct}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Incorrect:</span>
                <span className="font-semibold text-red-500">{player2Stats.incorrect}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-semibold">{p2Pct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div className={`h-3 rounded-full ${p2Pct >= 70 ? 'bg-green-500' : p2Pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p2Pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-6 border-2 border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">💡 Tips to Improve:</h4>
          <ul className="space-y-1">
            {getAdvice(winner === 'player1' ? player1Stats : player2Stats).map((tip, idx) => (
              <li key={idx} className="text-blue-700 text-sm">{tip}</li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-xl text-lg hover:scale-105 transition-all shadow-lg"
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
  );
};

export default TwoPlayerStatsOverlay;
