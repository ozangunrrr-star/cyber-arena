
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

  const startGame = useCallback(() => {
    setScore(0);
    setGameState(GameState.Playing);
  }, []);

  const gameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
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
        return <GameOver score={score} onRestart={startGame} onMenu={backToMenu} />;
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