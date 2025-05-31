import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allEmojis = ['🍌', '🍎', '🍓', '🍉', '🍇', '🍒', '🍍', '🍑', '🍋', '🍬', '🍫', '🥝', '🫐', '🍊', '🍈', '🍏', '❤️', '💎'];

export default function EmojiHeist() {
  const [level, setLevel] = useState(1);
  const [targetEmojis, setTargetEmojis] = useState([]);
  const [gridEmojis, setGridEmojis] = useState([]);
  const [gameState, setGameState] = useState('memorize');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('emojiHighScore')) || 0);
  const [newHighScore, setNewHighScore] = useState(false);
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

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('emojiHighScore', score);
      setNewHighScore(true);
    }
  }, [score]);

  const generateEmojis = () => {
    const targets = shuffle([...allEmojis]).slice(0, level + 2);
    const decoys = shuffle([...allEmojis].filter(e => !targets.includes(e))).slice(0, 6);
    setTargetEmojis(targets);
    setGridEmojis(shuffle([...targets, ...decoys]));
    setSelected([]);
    setNewHighScore(false);
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-start px-4 pt-12 pb-10 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-sans">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-yellow-400 drop-shadow-lg mb-2 tracking-wide">Emoji Heist</h1>
      <p className="text-sm sm:text-base text-gray-300 mb-1 uppercase tracking-wider">Level: {level} | Score: {score}</p>
      <p className="text-xs text-green-400 mb-1 uppercase">High Score: {highScore}</p>
      {newHighScore && <p className="text-xs text-pink-400 animate-pulse mb-4">🎉 New High Score! 🎉</p>}

      <AnimatePresence>
        {gameState === 'memorize' && (
          <motion.div
            key="memorize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center mb-6"
          >
            <p className="mb-2 text-sm text-pink-300">Memorize these emojis</p>
            <div className="flex flex-wrap justify-center gap-3 text-4xl">
              {targetEmojis.map((e, idx) => <motion.span key={idx} layout>{e}</motion.span>)}
            </div>
          </motion.div>
        )}

        {gameState === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-md"
          >
            <p className="mb-1 text-sm text-blue-200">Tap the correct emojis</p>
            <span className="mb-4 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 text-xs font-medium tracking-wider">
              ⏱️ {timeLeft}s
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-3xl w-full">
              {gridEmojis.map((e, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleEmojiClick(e)}
                  className={
                    'min-w-[64px] min-h-[64px] flex items-center justify-center p-3 rounded-2xl transition duration-300 shadow-xl ' +
                    (selected.includes(e)
                      ? 'bg-green-500/90 text-white scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105')
                  }
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'lose' && (
          <motion.div
            key="lose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 text-center"
          >
            <p className="text-red-400 text-lg font-semibold mb-4">You got caught! 🚨</p>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl shadow-md transition"
            >
              Restart
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-10 text-xs text-gray-400 text-center">
        Made with 💻 by <a href="https://instagram.com/_imsultan" target="_blank" className="text-pink-400 hover:underline">@_imsultan</a>
      </footer>
    </div>
  );
}
