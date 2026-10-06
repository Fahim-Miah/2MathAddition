import React from 'react';
import { GameMode } from '../utils/gameUtils';

interface LandingPageProps {
  onSelectMode: (mode: GameMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>🎈</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-bounce" style={{ animationDelay: '1.5s' }}>🎉</div>
        <div className="absolute top-1/2 left-5 text-4xl animate-pulse">🔢</div>
        <div className="absolute top-1/3 right-10 text-4xl animate-pulse" style={{ animationDelay: '0.7s' }}>➕</div>
      </div>

      <div className="relative z-10 pt-8 pb-4 text-center">
        <div className="text-7xl mb-4 animate-bounce">🧮</div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
          Math Addition
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mt-2">
          FUN! 🎮
        </h2>
        <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto px-4">
          Welcome to the most fun way to practice 2-digit and 3-digit addition!
          Pick a game mode below and start playing! 🚀
        </p>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-4 border-yellow-300">
          <h3 className="text-2xl font-bold text-center text-yellow-700 mb-4">📖 How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-2xl">
              <div className="text-4xl mb-2">👀</div>
              <p className="font-medium text-blue-800">Look at the addition question on screen</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-2xl">
              <div className="text-4xl mb-2">🤔</div>
              <p className="font-medium text-green-800">Think about the answer and type it using the number pad</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-2xl">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-medium text-purple-800">Press the check button to submit your answer!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 mt-8 pb-12">
        <h3 className="text-2xl font-bold text-center text-gray-700 mb-6">🎮 Choose Your Game!</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('two-player')}
            className="group bg-gradient-to-br from-blue-400 to-red-400 rounded-3xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left"
          >
            <div className="bg-white/90 rounded-2xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">⚔️</span>
                <h4 className="text-2xl font-bold text-gray-800">Two Player Battle</h4>
              </div>
              <p className="text-gray-600 mb-3">
                Challenge a friend! Race to answer addition questions correctly first.
                Each player has their own number pad.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">🔵 Player 1</span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">🔴 Player 2</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">🏆 Race!</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('one-player')}
            className="group bg-gradient-to-br from-green-400 to-teal-400 rounded-3xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left"
          >
            <div className="bg-white/90 rounded-2xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🎯</span>
                <h4 className="text-2xl font-bold text-gray-800">Practice Mode</h4>
              </div>
              <p className="text-gray-600 mb-3">
                Practice on your own! Answer addition questions at your own pace.
                Great for learning and improving!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">📝 10 Questions</span>
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">🧘 No Rush</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">📊 Get Stats</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('lightning')}
            className="group bg-gradient-to-br from-orange-400 to-amber-400 rounded-3xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left"
          >
            <div className="bg-white/90 rounded-2xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">⚡</span>
                <h4 className="text-2xl font-bold text-gray-800">Lightning Round</h4>
              </div>
              <p className="text-gray-600 mb-3">
                Think fast! You have 60 seconds to answer as many multiple-choice questions as possible.
                Pick the right answer from 4 choices!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">⏱️ 60 Seconds</span>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">🔘 Multiple Choice</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">🏃 Speed!</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('infinity')}
            className="group bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left"
          >
            <div className="bg-white/90 rounded-2xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">♾️</span>
                <h4 className="text-2xl font-bold text-gray-800">Infinity Round</h4>
              </div>
              <p className="text-gray-600 mb-3">
                Keep going as long as you want! Answer unlimited addition questions.
                Press "End Round" when you're ready to see your stats!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">♾️ Unlimited</span>
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">🎮 Your Pace</span>
                <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-sm font-medium">🏁 End Anytime</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('tug-of-war')}
            className="group bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl text-left md:col-span-2"
          >
            <div className="bg-white/90 rounded-2xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🪢</span>
                <h4 className="text-2xl font-bold text-gray-800">Tug of War</h4>
              </div>
              <p className="text-gray-600 mb-3">
                Two teams compete in an epic tug of war! Answer addition questions correctly to pull the rope to your side.
                First team to pull past the baseline wins!
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">🔵 Team 1</span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">🔴 Team 2</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">⏱️ Timed</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">🪢 Pull!</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="relative z-10 text-center pb-8">
        <p className="text-gray-500 text-sm">Made with ❤️ for 2nd Grade Math Class</p>
        <div className="flex justify-center gap-2 mt-2 text-2xl">
          <span>📚</span><span>✏️</span><span>🧮</span><span>🎓</span><span>⭐</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
