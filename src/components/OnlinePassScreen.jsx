import { useState } from 'react';
import Card from './Card';

export default function OnlinePassScreen({ onlineHook }) {
    const { roomState, playerId, isHost, setPlayerReady, everyoneReady, startTimerPhase } = onlineHook;
    const { gameData, players } = roomState;
    const [cardFlipped, setCardFlipped] = useState(false);

    // Find the current player's data
    const me = players.find(p => p.id === playerId);
    const isImposter = gameData.imposters.includes(playerId);

    // Determine what text to show based on role
    const displayWord = isImposter ? "Te vagy az Imposztor!" : gameData.word;
    const displayHint = isImposter ? `Kategória: ${gameData.categoryName}\nTipp: ${gameData.hint}` : null;

    if (!me) return null;

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="screen-title mb-1">Kártyaosztás</h2>
            <p className="text-center" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                {me.isReady ? "Te már láttad a szavadat!" : "Tartsd lenyomva a kártyát, hogy lásd a szavadat!"}
            </p>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                <Card
                    isFlipped={cardFlipped}
                    onHoldStart={() => !me.isReady && setCardFlipped(true)}
                    onHoldEnd={() => setCardFlipped(false)}
                >
                    <div style={{ padding: '1rem', textAlign: 'center', wordBreak: 'break-word' }}>
                        <h2 style={{
                            fontSize: isImposter ? '2rem' : '2.5rem',
                            color: isImposter ? '#ef5350' : 'var(--text-primary)',
                            marginBottom: displayHint ? '1rem' : '0'
                        }}>
                            {displayWord}
                        </h2>

                        {displayHint && (
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.6)',
                                borderRadius: '10px',
                                textAlign: 'center',
                                width: '100%'
                            }}>
                                <p style={{ fontStyle: 'italic', fontSize: '1.2rem', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                                    {displayHint}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <div style={{ marginTop: 'auto', marginBottom: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {!me.isReady ? (
                    <button
                        className="btn"
                        onClick={setPlayerReady}
                    >
                        Megnéztem, kész! ✓
                    </button>
                ) : (
                    <div className="card-container text-center" style={{ width: '100%', backgroundColor: 'var(--color-layer2)' }}>
                        Várakozás a többiekre... ({players.filter(p => p.isReady).length}/{players.length})
                    </div>
                )}

                {isHost && everyoneReady() && (
                    <button
                        className="btn"
                        onClick={startTimerPhase}
                        style={{ backgroundColor: 'var(--color-accent)', color: 'white', marginTop: '1rem' }}
                    >
                        🕒 Beszélgetés Indítása!
                    </button>
                )}
            </div>
        </div>
    );
}
