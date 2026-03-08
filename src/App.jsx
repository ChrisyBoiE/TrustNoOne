import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import PassScreen from './components/PassScreen';
import ActiveScreen from './components/ActiveScreen';
import EndScreen from './components/EndScreen';
import OnlineLobby from './components/OnlineLobby';
import OnlineCategoryScreen from './components/OnlineCategoryScreen';
import OnlinePassScreen from './components/OnlinePassScreen';
import OnlineActiveScreen from './components/OnlineActiveScreen';
import OnlineEndScreen from './components/OnlineEndScreen';
import LoadingScreen from './components/LoadingScreen';
import { generateGame } from './hooks/useGameEngine';
import { useOnlineGame } from './hooks/useOnlineGame';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('trustNoOne_appMode') || 'HOME'; // HOME, LOCAL, ONLINE
  });

  // LOCAL MODE STATE
  const [localGameState, setLocalGameState] = useState(() => {
    return localStorage.getItem('trustNoOne_gameState') || 'SETUP'; // SETUP, PASS, ACTIVE, END
  });

  const [localGameData, setLocalGameData] = useState(() => {
    const saved = localStorage.getItem('trustNoOne_gameData');
    return saved ? JSON.parse(saved) : null;
  });

  const [localPreviousPlayers, setLocalPreviousPlayers] = useState(() => {
    const saved = localStorage.getItem('trustNoOne_previousPlayers');
    return saved ? JSON.parse(saved) : [];
  });

  // ONLINE MODE HOOK
  const onlineHook = useOnlineGame();

  // Effect to save local state changes
  useEffect(() => {
    localStorage.setItem('trustNoOne_appMode', appMode);
    localStorage.setItem('trustNoOne_gameState', localGameState);
    if (localGameData) {
      localStorage.setItem('trustNoOne_gameData', JSON.stringify(localGameData));
    } else {
      localStorage.removeItem('trustNoOne_gameData');
    }
    localStorage.setItem('trustNoOne_previousPlayers', JSON.stringify(localPreviousPlayers));
  }, [appMode, localGameState, localGameData, localPreviousPlayers]);

  // Loading Screen Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // 2 second loading screen
    return () => clearTimeout(timer);
  }, []);

  const handleStartLocalGame = (players, settings) => {
    try {
      const newData = generateGame(players, settings);
      setLocalGameData(newData);
      setLocalPreviousPlayers(players);
      setLocalGameState('PASS');
    } catch (e) {
      alert(e.message);
    }
  };

  // Render Logic
  const renderLocalMode = () => {
    return (
      <>
        {localGameState === 'SETUP' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setAppMode('HOME')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              ← Vissza
            </button>
            <SetupScreen onStart={handleStartLocalGame} initialPlayers={localPreviousPlayers} />
          </div>
        )}
        {localGameState === 'PASS' && (
          <PassScreen gameData={localGameData} onComplete={() => setLocalGameState('ACTIVE')} />
        )}
        {localGameState === 'ACTIVE' && (
          <ActiveScreen gameData={localGameData} onEnd={() => setLocalGameState('END')} />
        )}
        {localGameState === 'END' && (
          <EndScreen gameData={localGameData} onRestart={() => setLocalGameState('SETUP')} />
        )}
      </>
    );
  };

  const renderOnlineMode = () => {
    const rStatus = onlineHook.roomState?.status;

    // Switch based on Room Status
    if (!onlineHook.roomCode || rStatus === 'LOBBY') {
      return <OnlineLobby onlineHook={onlineHook} onBack={() => { onlineHook.leaveRoom(); setAppMode('HOME'); }} />;
    }
    if (rStatus === 'CATEGORY') return <OnlineCategoryScreen onlineHook={onlineHook} />;
    if (rStatus === 'PASS') return <OnlinePassScreen onlineHook={onlineHook} />;
    if (rStatus === 'ACTIVE') return <OnlineActiveScreen onlineHook={onlineHook} />;
    if (rStatus === 'FINISHED') return <OnlineEndScreen onlineHook={onlineHook} />;
    return <p>Hiba: Ismeretlen Online Állapot.</p>;
  };

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      {appMode === 'HOME' && <HomeScreen onSelectMode={setAppMode} />}
      {appMode === 'LOCAL' && renderLocalMode()}
      {appMode === 'ONLINE' && renderOnlineMode()}
    </div>
  );
}

export default App;
