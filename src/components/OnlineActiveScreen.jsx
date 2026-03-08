import { useState, useEffect } from 'react';

export default function OnlineActiveScreen({ onlineHook }) {
    const { roomState, playerId, isHost, endGame, voteForImposter, everyoneVoted } = onlineHook;
    const { gameData, settings, players } = roomState;

    // Derived state for voting
    const isCompetitive = settings?.gameMode === 'COMPETITIVE';
    const myVote = gameData?.votes?.[playerId];
    const isHostWaitingForVotes = isCompetitive && !everyoneVoted();

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!gameData.isTimerActive || !gameData.startTime) return;

        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - gameData.startTime) / 1000);
            const remaining = Math.max(0, gameData.timerDuration - elapsed);
            setTimeLeft(remaining);
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [gameData.isTimerActive, gameData.startTime, gameData.timerDuration]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="screen-title mb-1">Játék elkezdődött!</h2>
            <p className="text-center" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                Ideje beszélgetni és elkapni az Imposztort!
            </p>

            <div className="card-container text-center" style={{ width: '100%', marginBottom: isCompetitive ? '1.5rem' : '0' }}>
                <h3 style={{ color: 'var(--color-accent)', fontSize: '1.8rem' }}>
                    {gameData.starterPlayerName}
                </h3>
                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>kezdi a beszélgetést!</p>
            </div>

            {isCompetitive && (
                <div className="card-container text-center" style={{ width: '100%' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Szavazás: Ki az Imposztor?</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Mindenkinek szavaznia kell, mielőtt a Host lezárhatja a kört!</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {players.filter(p => p.id !== playerId).map(p => (
                            <button
                                key={p.id}
                                className="btn"
                                onClick={() => voteForImposter(p.id)}
                                style={{
                                    padding: '0.8rem',
                                    backgroundColor: myVote === p.id ? 'var(--color-accent)' : 'var(--color-base)',
                                    color: myVote === p.id ? 'white' : 'var(--text-primary)',
                                    border: myVote === p.id ? '2px solid white' : '1px solid var(--color-accent)'
                                }}
                            >
                                {p.name} {myVote === p.id ? '✅' : ''}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {gameData.isTimerActive && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-layer3)' }}>Hátralévő idő:</p>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: timeLeft <= 10 ? '#ef5350' : 'var(--text-primary)',
                        textShadow: '2px 2px 0px rgba(255,255,255,0.5)'
                    }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            )}

            <div style={{ marginTop: 'auto', marginBottom: '2rem', width: '100%', textAlign: 'center' }}>
                {isHost ? (
                    <button
                        className="btn"
                        onClick={endGame}
                        disabled={isHostWaitingForVotes}
                        style={{
                            backgroundColor: isHostWaitingForVotes ? '#ccc' : '#ef5350',
                            color: 'white',
                            cursor: isHostWaitingForVotes ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isHostWaitingForVotes ? 'Várakozás a szavazatokra...' : 'Játék vége (Felfedés)'}
                    </button>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Csak a házigazda (👑) fedheti fel az eredményt.</p>
                )}
            </div>
        </div>
    );
}
