
import React from 'react';

interface HUDProps {
  score: number;
  timeLeft: number;
  level: number;
  targetScore: number;
}

const HUD: React.FC<HUDProps> = ({ score, timeLeft, level, targetScore }) => {
  return (
    <div className="relative pointer-events-none text-white p-4 sm:pb-4 sm:pt-0 sm:px-8" style={{zIndex: 100}}>
      <div className="flex justify-between items-center text-xl sm:text-3xl font-extrabold" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
        <div>
          <span>SCORE: </span>
          <span className="text-cyan-400">{score} / {targetScore}</span>
        </div>
        <div>
           <span>LEVEL: </span>
           <span className="text-purple-400">{level}</span>
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