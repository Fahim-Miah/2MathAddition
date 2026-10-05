import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { TwoPlayerGame } from './components/TwoPlayerGame';
import { PracticeMode } from './components/PracticeMode';
import { LightningRound } from './components/LightningRound';
import { InfinityRound } from './components/InfinityRound';
import { TugOfWar } from './components/TugOfWar';

type GameMode = 'home' | 'two-player' | 'practice' | 'lightning' | 'infinity' | 'tug-of-war';

function App() {
  const [currentGame, setCurrentGame] = useState<GameMode>('home');

  const handleSelectGame = (game: string) => {
    setCurrentGame(game as GameMode);
  };

  const handleBack = () => {
    setCurrentGame('home');
  };

  switch (currentGame) {
    case 'two-player':
      return <TwoPlayerGame onBack={handleBack} />;
    case 'practice':
      return <PracticeMode onBack={handleBack} />;
    case 'lightning':
      return <LightningRound onBack={handleBack} />;
    case 'infinity':
      return <InfinityRound onBack={handleBack} />;
    case 'tug-of-war':
      return <TugOfWar onBack={handleBack} />;
    default:
      return <LandingPage onSelectGame={handleSelectGame} />;
  }
}

export default App;
