import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allEmojis = ['🍌', '🍎', '🍓', '🍉', '🍇', '🍒', '🍍', '🍑', '🍋', '🍬', '🍫', '🥝', '🫐', '🍊', '🍈', '🍏', '❤️', '💎'];

export default function EmojiHeist() {
  const [level, setLevel] = useState(1);
  const [targetEmojis, setTargetEmojis] = useState([]);
  const [gridEmojis, setGridEmojis] = useState([]);
  const [gameState, setGameState] = useState('memorize');
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (gameState === 'memorize') {
      generateEmojis();
      const timer = setTimeout(() => setGameState('play'), 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState, level]);

  useEffect(() => {
    if (gameState === 'play') {
      setTimeLeft(10);
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('lose');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const generateEmojis = () => {
    const targets = shuffle([...allEmojis]).slice(0, level + 2);
    const decoys = shuffle([...allEmojis].filter(e => !targets.includes(e))).slice(0, 6);
    setTargetEmojis(targets);
    setGridEmojis(shuffle([...targets, ...decoys]));
    setSelected([]);
  };

  const handleEmojiClick = (emoji) => {
    if (!targetEmojis.includes(emoji)) {
      setGameState('lose');
      return;
    }
    if (selected.includes(emoji)) return;

    const newTargets = targetEmojis.filter(e => e !== emoji);
    const newSelected = [...selected, emoji];
    setSelected(newSelected);

    if (newTargets.length === 0) {
      setScore(score + 1);
      setLevel(level + 1);
      setGameState('memorize');
    }
    setTargetEmojis(newTargets);
  };

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setGameState('memorize');
  };

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-start bg-gradient-to-b from-gray-900 to-black text-white px-4 pt-10 pb-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-yellow-400 text-center">Emoji Heist</h1>
      <p className="mb-2 text-base sm:text-lg">Level: {level} | Score: {score}</p>

      <AnimatePresence>
        {gameState === 'memorize' && (
          <motion.div className="flex flex-col items-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="mb-2 text-sm text-gray-300">Memorize these emojis!</p>
            <div className="flex flex-wrap justify-center gap-3 text-3xl sm:text-4xl">
              {targetEmojis.map((e, idx) => <motion.span key={idx} layout>{e}</motion.span>)}
            </div>
          </motion.div>
        )}

        {gameState === 'play' && (
          <motion.div className="flex flex-col items-center w-full max-w-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="mb-2 text-sm text-gray-300">Tap the correct emojis!</p>
            <p className="mb-4 text-sm font-semibold text-yellow-300">Time Left: {timeLeft}s</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-3xl w-full">
              {gridEmojis.map((e, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleEmojiClick(e)}
                  className={
                    'min-w-[64px] min-h-[64px] p-4 rounded-xl text-3xl sm:text-4xl transition duration-200 shadow-md ' +
                    (selected.includes(e) ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600')
                  }
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'lose' && (
          <motion.div className="mt-6 text-center text-red-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="mb-3 text-lg">Wrong emoji or time up! You got caught! 🚨</p>
            <button onClick={resetGame} className="bg-red-600 px-5 py-2 rounded-xl hover:bg-red-500 transition text-white font-medium">Restart</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
