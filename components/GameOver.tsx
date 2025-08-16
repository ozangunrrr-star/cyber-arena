import React from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, onMenu }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-center p-10 bg-black/50 rounded-lg shadow-2xl backdrop-blur-md border border-cyan-500/50">
        <h1 className="text-7xl font-black text-red-500 uppercase tracking-wider mb-2">
          Time's Up!
        </h1>
        <p className="text-gray-300 text-2xl mb-6">Your Final Score:</p>
        <p className="text-9xl font-bold text-cyan-400 mb-10" style={{textShadow: '0 0 15px rgba(0, 255, 255, 0.5)'}}>{score}</p>
        <div className="flex space-x-4">
            <button
            onClick={onRestart}
            className="px-8 py-3 bg-cyan-500 text-slate-900 font-bold text-xl uppercase rounded-md shadow-lg hover:bg-cyan-400 transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 border-b-4 border-cyan-700 active:border-b-0"
            >
            Play Again
            </button>
            <button
            onClick={onMenu}
            className="px-8 py-3 bg-purple-500 text-white font-bold text-xl uppercase rounded-md shadow-lg hover:bg-purple-600 transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 border-b-4 border-purple-700 active:border-b-0"
            >
            Main Menu
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;