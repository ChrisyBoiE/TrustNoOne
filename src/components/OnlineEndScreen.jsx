import { useState } from 'react';

export default function OnlineEndScreen({ onlineHook }) {
    const { roomState, isHost, backToLobby, nextRound, playerId } = onlineHook;
    const { gameData, players, settings } = roomState;
    const [showResults, setShowResults] = useState(false);

    const isCompetitive = settings.gameMode === 'COMPETITIVE';
    const isLastRound = isCompetitive && settings.currentRound >= settings.maxRounds;

    // Filter to map imposter IDs back to objects so we can display their names
    const imposztorok = players.filter(p => gameData.imposters.includes(p.id));

    // For Competitive Mode podium
    const getPodiumPlayers = () => {
        if (!settings.scores) return [];
        // Map scores to player objects, sort by score descending
        const scoredPlayers = players.map(p => ({
            ...p,
            score: settings.scores[p.id] || 0
        })).sort((a, b) => b.score - a.score);

        // Take top 3 for podium
        return scoredPlayers.slice(0, 3);
    };

    const renderPodium = () => {
        const top3 = getPodiumPlayers();
        if (top3.length === 0) return null;

        // Podium heights (CSS layout)
        const heights = ['120px', '160px', '100px'];
        const colors = ['#C0C0C0', '#FFD700', '#CD7F32']; // Silver, Gold, Bronze
        const delays = ['0.5s', '1s', '0.2s']; // Animation delays

        // CSS grid order: 2nd, 1st, 3rd
        const displayOrder = [top3[1], top3[0], top3[2]];

        return (
            <div style={{ marginTop: '3rem', width: '100%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--color-accent)' }}>🏆 Végeredmény 🏆</h2>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '10px',
                    height: '250px'
                }}>
                    {displayOrder.map((p, index) => {
                        if (!p) return <div key={`empty-${index}`} style={{ width: '80px' }}></div>;
                        const originalRank = index === 0 ? 2 : (index === 1 ? 1 : 3);
                        const isMe = p.id === playerId;

                        return (
                            <div key={p.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                animation: `slideUp 1s ease-out forwards`,
                                animationDelay: delays[index],
                                opacity: 0,
                                transform: 'translateY(50px)'
                            }}>
                                <span style={{ fontWeight: isMe ? 'bold' : 'normal', color: 'var(--text-primary)', marginBottom: '5px' }}>
                                    {p.name} {isMe ? '(Te)' : ''}
                                </span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
                                    {p.score} pt
                                </span>
                                <div style={{
                                    width: '80px',
                                    height: heights[index],
                                    backgroundColor: colors[index],
                                    borderTopLeftRadius: '10px',
                                    borderTopRightRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    paddingTop: '10px',
                                    boxShadow: '0 -4px 10px rgba(0,0,0,0.2)'
                                }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)' }}>
                                        {originalRank}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', paddingBottom: '2rem' }}>
            <h1 className="screen-title" style={{ color: '#ef5350', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                {isCompetitive && !isLastRound ? `${settings.currentRound}. Kör vége!` : 'Játék vége!'}
            </h1>

            <div className="card-container text-center" style={{ width: '100%', padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Az Imposztorok voltak:</h3>

                {imposztorok.map(p => (
                    <div key={p.id} style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#ef5350',
                        marginBottom: '0.5rem',
                        animation: 'fadeIn 0.5s'
                    }}>
                        {p.name}
                    </div>
                ))}

                <button
                    className="btn"
                    onClick={() => setShowResults(!showResults)}
                    style={{ marginTop: '2rem', backgroundColor: 'var(--color-layer2)', color: 'var(--text-primary)' }}
                >
                    {showResults ? 'Szó elrejtése' : 'Eredeti szó felfedése'}
                </button>

                {showResults && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--color-layer3)' }}>A szó, amit kerestünk:</p>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                            {gameData.word}
                        </p>
                    </div>
                )}
            </div>

            {isLastRound && renderPodium()}

            <div style={{ marginTop: '2rem', width: '100%', textAlign: 'center' }}>
                {isHost ? (
                    isCompetitive && !isLastRound ? (
                        <button className="btn" onClick={nextRound} style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                            Következő kör ({settings.currentRound + 1}/{settings.maxRounds})
                        </button>
                    ) : (
                        <button className="btn" onClick={backToLobby}>
                            Új játék (vissza a lobbyba)
                        </button>
                    )
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Várakozás a házigazdára...</p>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
