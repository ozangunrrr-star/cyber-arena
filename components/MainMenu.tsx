import React from 'react';

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-center p-8 bg-black/50 rounded-lg shadow-2xl backdrop-blur-md border border-cyan-500/50">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'}}>
          Cyberstrike Arena
        </h1>
        <div className="text-gray-300 text-lg mb-8 max-w-2xl space-y-2">
           <p>Use <span className="font-bold text-white bg-gray-700 px-2 py-1 rounded">W</span> <span className="font-bold text-white bg-gray-700 px-2 py-1 rounded">A</span> <span className="font-bold text-white bg-gray-700 px-2 py-1 rounded">S</span> <span className="font-bold text-white bg-gray-700 px-2 py-1 rounded">D</span> to move.</p>
           <p>Aim with your mouse.</p>
           <p><span className="font-bold text-white">Click</span> to shoot the targets.</p>
           <p>Score as many points as you can in 60 seconds!</p>
        </div>
        <button
          onClick={onStartGame}
          className="px-12 py-4 bg-cyan-500 text-slate-900 font-bold text-2xl uppercase rounded-md shadow-lg hover:bg-cyan-400 transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-opacity-50 border-b-4 border-cyan-700 active:border-b-0"
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default MainMenu;