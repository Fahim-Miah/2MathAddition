import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAdditionQuestion } from '../utils/math';
import { NumberPad } from './NumberPad';
import { StatsOverlay } from './StatsOverlay';

interface TwoPlayerGameProps {
  onBack: () => void;
}

interface PlayerState {
  name: string;
  currentQuestion: { a: number; b: number; answer: number };
  inputValue: string;
  correct: number;
  incorrect: number;
  completed: boolean;
  startTime: number;
  endTime: number;
  correctFlash: boolean;
}

export const TwoPlayerGame: React.FC<TwoPlayerGameProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const initGame = (numQuestions: number) => {
    const q1 = generateAdditionQuestion();
    const q2 = generateAdditionQuestion();
    const now = Date.now();
    setPlayers([
      {
        name: 'Player 1 (Blue)',
        currentQuestion: q1,
        inputValue: '',
        correct: 0,
        incorrect: 0,
        completed: false,
        startTime: now,
        endTime: 0,
        correctFlash: false,
      },
      {
        name: 'Player 2 (Red)',
        currentQuestion: q2,
        inputValue: '',
        correct: 0,
        incorrect: 0,
        completed: false,
        startTime: now,
        endTime: 0,
        correctFlash: false,
      },
    ]);
    setTotalQuestions(numQuestions);
    setGameEnded(false);
    setPhase('playing');
  };

  const handleInput = (playerIdx: number, value: string) => {
    if (phase !== 'playing' || gameEnded) return;

    if (value === '') {
      setPlayers(prev => {
        const updated = [...prev];
        updated[playerIdx] = { ...updated[playerIdx], inputValue: '' };
        return updated;
      });
      return;
    }

    setPlayers(prev => {
      const updated = [...prev];
      const player = { ...updated[playerIdx] };
      const answer = player.currentQuestion.answer;

      if (parseInt(value) === answer) {
        player.correct += 1;
        player.correctFlash = true;
        player.inputValue = '';

        // Schedule flash removal
        setTimeout(() => {
          setPlayers(p => {
            const u = [...p];
            u[playerIdx] = { ...u[playerIdx], correctFlash: false };
            return u;
          });
        }, 800);

        if (player.correct >= totalQuestions) {
          player.completed = true;
          player.endTime = Date.now();
          
          if (!gameEnded) {
            setGameEnded(true);
            // End game for both players
            setTimeout(() => {
              setPlayers(p => {
                const final = p.map((pl, i) => {
                  if (i === playerIdx) return player;
                  if (!pl.completed) return { ...pl, completed: true, endTime: Date.now() };
                  return pl;
                });
                return final;
              });
              setPhase('finished');
              setShowStats(true);
            }, 600);
          }
        } else {
          player.currentQuestion = generateAdditionQuestion();
        }
      } else if (value.length >= String(answer).length) {
        player.incorrect += 1;
        player.inputValue = '';
      } else {
        player.inputValue = value;
      }

      updated[playerIdx] = player;
      return updated;
    });
  };

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">🏆 Two Player Race</h2>
          <p className="text-center text-gray-600 mb-6">Choose how many questions to answer:</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[5, 10, 15, 20].map(num => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => initGame(num)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 rounded-2xl text-xl shadow-lg"
              >
                {num} Questions
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

  const winnerIdx = players.length === 2 && players[0].completed && players[1].completed
    ? (players[0].endTime <= players[1].endTime ? 0 : 1)
    : players[0]?.completed ? 0 : players[1]?.completed ? 1 : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-white shadow-md p-3 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium">
          ← Back
        </button>
        <div className="flex gap-4 text-sm font-semibold">
          <span className="text-blue-600">🔵 {players[0]?.correct || 0}/{totalQuestions}</span>
          <span className="text-red-600">🔴 {players[1]?.correct || 0}/{totalQuestions}</span>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Player 1 - Blue */}
        <div className={`flex-1 p-4 flex flex-col items-center justify-center relative transition-colors duration-300 ${players[0]?.correctFlash ? 'bg-blue-200' : 'bg-blue-50'}`}>
          <AnimatePresence>
            {players[0]?.correctFlash && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 right-4 text-3xl"
              >
                ✅
              </motion.div>
            )}
          </AnimatePresence>
          <h3 className="text-2xl font-bold text-blue-600 mb-2">🔵 Player 1</h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4 text-center">
            <p className="text-4xl font-bold text-gray-800">
              {players[0]?.currentQuestion.a} + {players[0]?.currentQuestion.b}
            </p>
            <div className="mt-3 text-2xl font-mono bg-blue-100 rounded-xl px-4 py-2 min-w-[100px] inline-block">
              {players[0]?.inputValue || <span className="text-gray-300">?</span>}
            </div>
          </div>
          <NumberPad value={players[0]?.inputValue || ''} onInput={(v) => handleInput(0, v)} color="blue" />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-red-500" />
        <div className="md:hidden h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500" />

        {/* Player 2 - Red */}
        <div className={`flex-1 p-4 flex flex-col items-center justify-center relative transition-colors duration-300 ${players[1]?.correctFlash ? 'bg-red-200' : 'bg-red-50'}`}>
          <AnimatePresence>
            {players[1]?.correctFlash && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 right-4 text-3xl"
              >
                ✅
              </motion.div>
            )}
          </AnimatePresence>
          <h3 className="text-2xl font-bold text-red-600 mb-2">🔴 Player 2</h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4 text-center">
            <p className="text-4xl font-bold text-gray-800">
              {players[1]?.currentQuestion.a} + {players[1]?.currentQuestion.b}
            </p>
            <div className="mt-3 text-2xl font-mono bg-red-100 rounded-xl px-4 py-2 min-w-[100px] inline-block">
              {players[1]?.inputValue || <span className="text-gray-300">?</span>}
            </div>
          </div>
          <NumberPad value={players[1]?.inputValue || ''} onInput={(v) => handleInput(1, v)} color="red" />
        </div>
      </div>

      {/* Stats Overlay */}
      <StatsOverlay
        show={showStats}
        players={players.map(p => ({
          name: p.name,
          correct: p.correct,
          incorrect: p.incorrect,
          total: p.correct + p.incorrect,
          time: (p.endTime || Date.now()) - p.startTime,
        }))}
        winnerIndex={winnerIdx}
        onClose={() => { setShowStats(false); setPhase('setup'); }}
        gameMode="Two Player Race"
      />
    </div>
  );
};
