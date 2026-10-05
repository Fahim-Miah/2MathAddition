import React from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onSelectGame: (game: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectGame }) => {
  const games = [
    { id: 'two-player', name: '🏆 Two Player Race', desc: 'Race against a friend! First to finish wins!', color: 'from-blue-500 to-purple-500' },
    { id: 'practice', name: '📝 Practice Round', desc: 'Practice on your own at your own pace!', color: 'from-green-500 to-teal-500' },
    { id: 'lightning', name: '⚡ Lightning Round', desc: 'Quick multiple-choice questions against the clock!', color: 'from-yellow-500 to-orange-500' },
    { id: 'infinity', name: '🔄 Infinity Round', desc: 'Unlimited questions! Play as long as you want!', color: 'from-pink-500 to-rose-500' },
    { id: 'tug-of-war', name: '🦸 Tug of War', desc: 'Team up and pull the rope to your side!', color: 'from-red-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 p-4 overflow-hidden relative">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, rotate: 0 }}
            animate={{ y: '-10vh', rotate: 360 }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5 }}
          >
            {['⭐', '🌟', '✨', '🎈', '🎨', '📐', '🔢', '➕'][i % 8]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 pt-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 mb-3">
            Math Adventure!
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            🎯 Practice 2-digit & 3-digit Addition! 🎯
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl border-4 border-purple-200"
        >
          <h2 className="text-2xl font-bold text-purple-700 mb-3 text-center">📖 How to Play</h2>
          <div className="grid md:grid-cols-2 gap-3 text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-xl">🔢</span>
              <p className="text-sm">Solve addition problems with 2-digit and 3-digit numbers</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">⌨️</span>
              <p className="text-sm">Use the number pad or your keyboard to enter answers</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">🏆</span>
              <p className="text-sm">Race friends or practice on your own!</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <p className="text-sm">Get helpful tips to improve your math skills</p>
            </div>
          </div>
        </motion.div>

        {/* Game Selection */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game, idx) => (
            <motion.button
              key={game.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectGame(game.id)}
              className={`bg-gradient-to-br ${game.color} text-white rounded-3xl p-6 shadow-xl text-left transition-shadow hover:shadow-2xl`}
            >
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-white/90 text-sm">{game.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 mt-8 text-sm"
        >
          Made with ❤️ for awesome 2nd graders!
        </motion.p>
      </div>
    </div>
  );
};
