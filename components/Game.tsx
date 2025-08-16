import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, BulletState, TargetState } from '../types';
import HUD from './HUD';

// --- Game Constants ---
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 4;
const BULLET_SIZE = 6;
const BULLET_SPEED = 8;
const TARGET_RADIUS = 20;

const LEVEL_CONFIGS: Record<number, { time: number; target: number }> = {
  1: { time: 60, target: 30 },
  2: { time: 120, target: 80 }, // 30 from level 1 + 50 for level 2
};


// --- Helper Functions ---
const getArenaBounds = (ref: React.RefObject<HTMLDivElement>) => {
  return ref.current?.getBoundingClientRect() ?? { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => '' };
};

const spawnTarget = (bounds: DOMRect): TargetState => {
  const padding = TARGET_RADIUS * 2;
  return {
    id: Date.now(),
    radius: TARGET_RADIUS,
    position: {
      x: Math.random() * (bounds.width - padding) + padding / 2,
      y: Math.random() * (bounds.height - padding) + padding / 2,
    },
  };
};

// --- Child Components ---
const Player: React.FC<{ player: PlayerState }> = React.memo(({ player }) => (
    <div
        className="absolute"
        style={{
            width: `${PLAYER_SIZE}px`,
            height: `${PLAYER_SIZE}px`,
            left: `${player.position.x - PLAYER_SIZE / 2}px`,
            top: `${player.position.y - PLAYER_SIZE / 2}px`,
            transform: `rotate(${player.angle}deg)`,
            zIndex: 10,
        }}
    >
        {/* Base circle with aura */}
        <div
            className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center sukuna-aura-animate"
        >
            {/* Sukuna's abstract eye/mark */}
            <div className="w-2 h-4 bg-red-500 rounded-sm shadow-[0_0_6px_theme(colors.red.500)] transform -skew-x-12" />
        </div>
        
        {/* Aiming Reticle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-1 h-5 bg-red-500 rounded-t-full shadow-[0_0_8px_theme(colors.red.400)]" />
    </div>
));

const Bullet: React.FC<{ bullet: BulletState }> = React.memo(({ bullet }) => (
  <div
    className="absolute bg-yellow-300 rounded-full shadow-[0_0_8px_theme(colors.yellow.300)]"
    style={{
      width: `${BULLET_SIZE}px`,
      height: `${BULLET_SIZE}px`,
      left: `${bullet.position.x - BULLET_SIZE / 2}px`,
      top: `${bullet.position.y - BULLET_SIZE / 2}px`,
    }}
  />
));

const Target: React.FC<{ target: TargetState }> = React.memo(({ target }) => (
  <div
    className="absolute"
    style={{
      width: `${target.radius * 2}px`,
      height: `${target.radius * 2}px`,
      left: `${target.position.x - target.radius}px`,
      top: `${target.position.y - target.radius}px`,
      filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.7))', // Gojo's infinity blue glow
    }}
  >
    <svg viewBox="0 0 50 50" width="100%" height="100%">
      <defs>
        <clipPath id="gojo-clip">
          <circle cx="25" cy="25" r="25" />
        </clipPath>
      </defs>
      <g clipPath="url(#gojo-clip)">
        {/* Hair */}
        <path d="M5,25 C 10,-5 40,-5 45,25 L 50,50 L 0,50 Z" fill="#FFFFFF" />
        {/* Face */}
        <circle cx="25" cy="30" r="15" fill="#f2d5c1" />
        {/* Blindfold */}
        <rect x="5" y="20" width="40" height="10" fill="#1a1a1a" />
      </g>
    </svg>
  </div>
));


// --- Main Game Component ---
interface GameProps {
  onGameOver: (score: number, result: 'win' | 'loss') => void;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const gameArenaRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<PlayerState>({ position: { x: 0, y: 0 }, angle: 0 });
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const [target, setTarget] = useState<TargetState | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIGS[1].time);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const keysPressed = useRef<Record<string, boolean>>({});
  const animationFrameId = useRef<number | null>(null);

  const scoreRef = useRef(score);
  scoreRef.current = score;
  const levelRef = useRef(level);
  levelRef.current = level;

  // Initialize game
  useEffect(() => {
    const bounds = getArenaBounds(gameArenaRef);
    setPlayer({ position: { x: bounds.width / 2, y: bounds.height / 2 }, angle: 0 });
    setTarget(spawnTarget(bounds));
  }, []);

  // Level Up Logic
  useEffect(() => {
    const currentConfig = LEVEL_CONFIGS[level];
    if (score < currentConfig.target) return;

    if (level === 1) { // Level 1 complete, transition to Level 2
      setIsTransitioning(true);
      setTimeout(() => {
        setLevel(2);
        setTimeLeft(LEVEL_CONFIGS[2].time);
        setIsTransitioning(false);
      }, 2500);
    } else if (level === 2) { // Level 2 complete, game won
      onGameOver(score, 'win');
    }
  }, [score, level, onGameOver]);

  // Game Timer
  useEffect(() => {
    if (isTransitioning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          const currentConfig = LEVEL_CONFIGS[levelRef.current];
          if (scoreRef.current < currentConfig.target) {
            onGameOver(scoreRef.current, 'loss');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTransitioning, level, onGameOver]);
  
  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse move for aiming
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = getArenaBounds(gameArenaRef);
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;
    const deltaX = mouseX - player.position.x;
    const deltaY = mouseY - player.position.y;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    setPlayer(p => ({ ...p, angle }));
  }, [player.position]);

  // Mouse click for shooting
  const handleMouseDown = useCallback(() => {
    const angleRad = (player.angle - 90) * (Math.PI / 180);
    const newBullet: BulletState = {
      id: Date.now() + Math.random(),
      position: { ...player.position },
      velocity: {
        x: Math.cos(angleRad) * BULLET_SPEED,
        y: Math.sin(angleRad) * BULLET_SPEED,
      },
    };
    setBullets(b => [...b, newBullet]);
  }, [player.position, player.angle]);


  // Main Game Loop
  const gameLoop = useCallback(() => {
    const bounds = getArenaBounds(gameArenaRef);

    setPlayer(p => {
        const newPos = { ...p.position };
        if (keysPressed.current['w']) newPos.y -= PLAYER_SPEED;
        if (keysPressed.current['s']) newPos.y += PLAYER_SPEED;
        if (keysPressed.current['a']) newPos.x -= PLAYER_SPEED;
        if (keysPressed.current['d']) newPos.x += PLAYER_SPEED;

        newPos.x = Math.max(PLAYER_SIZE / 2, Math.min(bounds.width - PLAYER_SIZE / 2, newPos.x));
        newPos.y = Math.max(PLAYER_SIZE / 2, Math.min(bounds.height - PLAYER_SIZE / 2, newPos.y));
        return { ...p, position: newPos };
    });

    setBullets(prevBullets => {
        const updatedBullets: BulletState[] = [];
        let newTarget = target;
        let scoreIncreased = false;

        for (const bullet of prevBullets) {
            const newPos = {
                x: bullet.position.x + bullet.velocity.x,
                y: bullet.position.y + bullet.velocity.y,
            };

            if (newPos.x < 0 || newPos.x > bounds.width || newPos.y < 0 || newPos.y > bounds.height) continue;

            if (target) {
                const dx = newPos.x - target.position.x;
                const dy = newPos.y - target.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < target.radius + BULLET_SIZE / 2) {
                    if (!scoreIncreased) {
                       setScore(s => s + 1);
                       scoreIncreased = true;
                    }
                    newTarget = spawnTarget(bounds);
                    continue; 
                }
            }
            updatedBullets.push({ ...bullet, position: newPos });
        }
        
        if (newTarget !== target) {
            setTarget(newTarget);
        }
        return updatedBullets;
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [target]);

  useEffect(() => {
    if (isTransitioning) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        return;
    }
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
    };
  }, [gameLoop, isTransitioning]);

  return (
    <div className="w-full h-full p-4 flex flex-col">
        <HUD 
          score={score} 
          timeLeft={timeLeft} 
          level={level}
          targetScore={LEVEL_CONFIGS[level].target}
        />
        <div 
          ref={gameArenaRef}
          className="w-full h-full relative overflow-hidden cursor-crosshair border-2 border-cyan-500/50 rounded-lg shadow-[0_0_20px_theme(colors.cyan.500/50)_inset]"
          onMouseMove={!isTransitioning ? handleMouseMove : undefined}
          onMouseDown={!isTransitioning ? handleMouseDown : undefined}
        >
            {isTransitioning && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                <h2 className="text-8xl font-black text-cyan-400 animate-pulse">LEVEL {level + 1}</h2>
              </div>
            )}
            <Player player={player} />
            {target && <Target target={target} />}
            {bullets.map(b => (
              <Bullet key={b.id} bullet={b} />
            ))}
        </div>
    </div>
  );
};

export default Game;