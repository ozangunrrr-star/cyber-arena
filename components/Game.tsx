import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, BulletState, TargetState } from '../types';
import HUD from './HUD';

// --- Game Constants ---
const GAME_TIME_SECONDS = 60;
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 4;
const BULLET_SIZE = 6;
const BULLET_SPEED = 8;
const TARGET_RADIUS = 20;

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
    className="absolute bg-cyan-400 rounded-full border-2 border-cyan-200"
    style={{
      width: `${PLAYER_SIZE}px`,
      height: `${PLAYER_SIZE}px`,
      left: `${player.position.x - PLAYER_SIZE / 2}px`,
      top: `${player.position.y - PLAYER_SIZE / 2}px`,
      transform: `rotate(${player.angle}deg)`,
      zIndex: 10,
    }}
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-1 h-4 bg-cyan-200 rounded-t-full" />
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
    className="absolute bg-red-500 rounded-full border-2 border-red-300 shadow-[0_0_15px_theme(colors.red.500)]"
    style={{
      width: `${target.radius * 2}px`,
      height: `${target.radius * 2}px`,
      left: `${target.position.x - target.radius}px`,
      top: `${target.position.y - target.radius}px`,
    }}
  />
));


// --- Main Game Component ---
interface GameProps {
  onGameOver: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const gameArenaRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<PlayerState>({ position: { x: 0, y: 0 }, angle: 0 });
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const [target, setTarget] = useState<TargetState | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SECONDS);
  const keysPressed = useRef<Record<string, boolean>>({});
  const animationFrameId = useRef<number>();
  const scoreRef = useRef(score);
  scoreRef.current = score;


  // Initialize game
  useEffect(() => {
    const bounds = getArenaBounds(gameArenaRef);
    setPlayer({ position: { x: bounds.width / 2, y: bounds.height / 2 }, angle: 0 });
    setTarget(spawnTarget(bounds));
  }, []);

  // Game Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onGameOver(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onGameOver]);
  
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

    // Update player position
    setPlayer(p => {
        const newPos = { ...p.position };
        if (keysPressed.current['w']) newPos.y -= PLAYER_SPEED;
        if (keysPressed.current['s']) newPos.y += PLAYER_SPEED;
        if (keysPressed.current['a']) newPos.x -= PLAYER_SPEED;
        if (keysPressed.current['d']) newPos.x += PLAYER_SPEED;

        // Clamp to bounds
        newPos.x = Math.max(PLAYER_SIZE / 2, Math.min(bounds.width - PLAYER_SIZE / 2, newPos.x));
        newPos.y = Math.max(PLAYER_SIZE / 2, Math.min(bounds.height - PLAYER_SIZE / 2, newPos.y));

        return { ...p, position: newPos };
    });

    // Update bullets and check collisions
    setBullets(prevBullets => {
        const updatedBullets: BulletState[] = [];
        let newTarget = target;
        let scoreIncreased = false;

        for (const bullet of prevBullets) {
            const newPos = {
                x: bullet.position.x + bullet.velocity.x,
                y: bullet.position.y + bullet.velocity.y,
            };

            // Check out of bounds
            if (newPos.x < 0 || newPos.x > bounds.width || newPos.y < 0 || newPos.y > bounds.height) {
                continue; // Skip this bullet
            }

            // Check collision with target
            if (target) {
                const dx = newPos.x - target.position.x;
                const dy = newPos.y - target.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < target.radius + BULLET_SIZE / 2) {
                    if (!scoreIncreased) { // Prevent multiple score increments in one frame
                       setScore(s => s + 1);
                       scoreIncreased = true;
                    }
                    newTarget = spawnTarget(bounds);
                    continue; // Bullet is destroyed on hit
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
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
        animationFrameId.current && cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameLoop]);

  return (
    <div className="w-full h-full p-4">
        <HUD score={score} timeLeft={timeLeft} />
        <div 
          ref={gameArenaRef}
          className="w-full h-full relative overflow-hidden cursor-crosshair border-2 border-cyan-500/50 rounded-lg shadow-[0_0_20px_theme(colors.cyan.500/50)_inset]"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
        >
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