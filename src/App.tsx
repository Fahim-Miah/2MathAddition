import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import TwoPlayerGame from './components/TwoPlayerGame';
import OnePlayerGame from './components/OnePlayerGame';
import LightningRound from './components/LightningRound';
import InfinityRound from './components/InfinityRound';
import TugOfWar from './components/TugOfWar';
import { GameMode } from './utils/gameUtils';

function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('landing');

  const goToHome = () => setCurrentMode('landing');

  const renderGame = () => {
    switch (currentMode) {
      case 'landing':
        return <LandingPage onSelectMode={setCurrentMode} />;
      case 'two-player':
        return <TwoPlayerGame onHome={goToHome} />;
      case 'one-player':
        return <OnePlayerGame onHome={goToHome} />;
      case 'lightning':
        return <LightningRound onHome={goToHome} />;
      case 'infinity':
        return <InfinityRound onHome={goToHome} />;
      case 'tug-of-war':
        return <TugOfWar onHome={goToHome} />;
      default:
        return <LandingPage onSelectMode={setCurrentMode} />;
    }
  };

  return (
    <div className="font-sans">
      {renderGame()}
    </div>
  );
}

export default App;
