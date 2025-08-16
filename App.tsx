
import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';

enum GameState {
  MainMenu,
  Playing,
  GameOver,
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MainMenu);
  const [score, setScore] = useState(0);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);

  const startGame = useCallback(() => {
    setScore(0);
    setGameResult(null);
    setGameState(GameState.Playing);
  }, []);

  const gameOver = useCallback((finalScore: number, result: 'win' | 'loss') => {
    setScore(finalScore);
    setGameResult(result);
    setGameState(GameState.GameOver);
  }, []);

  const backToMenu = useCallback(() => {
    setGameState(GameState.MainMenu);
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Playing:
        return <Game onGameOver={gameOver} />;
      case GameState.GameOver:
        return <GameOver score={score} result={gameResult} onRestart={startGame} onMenu={backToMenu} />;
      case GameState.MainMenu:
      default:
        return <MainMenu onStartGame={startGame} />;
    }
  };

  return (
    <div className="w-screen h-screen text-white overflow-hidden cyber-grid">
      {renderContent()}
    </div>
  );
};

export default App;