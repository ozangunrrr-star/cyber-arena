import React from 'react';

interface HUDProps {
  score: number;
  timeLeft: number;
}

const HUD: React.FC<HUDProps> = ({ score, timeLeft }) => {
  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none text-white p-4 sm:p-8" style={{zIndex: 100}}>
      <div className="flex justify-between items-center text-xl sm:text-3xl font-extrabold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
        <div>
          <span>SCORE: </span>
          <span className="text-cyan-400">{score}</span>
        </div>
        <div>
           <span>TIME: </span>
           <span className="text-red-500">{timeLeft}</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;