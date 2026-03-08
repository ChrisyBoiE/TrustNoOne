import { useState, useRef } from 'react';

export default function PassScreen({ gameData, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);

    const timerRef = useRef(null);
    const { playerData } = gameData;
    const currentPlayer = playerData[currentIndex];

    const handlePointerDown = () => {
        // Add a tiny delay to ensure intentional holding, but for mobile games immediate is fine too
        // Let's make it instant for snappiness, or tiny delay
        timerRef.current = setTimeout(() => {
            setIsRevealed(true);
        }, 150); // 150ms hold
    };

    const handlePointerUp = () => {
        clearTimeout(timerRef.current);
        if (isRevealed) {
            setIsRevealed(false);
        }
    };

    const nextPlayer = () => {
        if (currentIndex < playerData.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsRevealed(false);
        } else {
            onComplete();
        }
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
            <h2 className="text-center" style={{ fontSize: '1.8rem', color: 'var(--color-layer3)' }}>
                Kártyák továbbadása
            </h2>
            <p className="text-center" style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
                {currentIndex + 1} / {playerData.length}
            </p>

            <div
                className="flex-1"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <div
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                        width: '100%',
                        maxWidth: '320px',
                        height: '420px',
                        perspective: '1000px',
                        cursor: 'pointer',
                        WebkitUserSelect: 'none',
                        userSelect: 'none'
                    }}
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}>

                        {/* Front of Card */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            backgroundColor: 'var(--color-layer1)',
                            borderRadius: '20px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: 'var(--box-shadow)',
                            border: '4px solid var(--color-accent)'
                        }}>
                            <h1 style={{ fontSize: '2.5rem', textAlign: 'center', wordBreak: 'break-word' }}>
                                {currentPlayer.name}
                            </h1>
                            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-layer3)' }}>
                                Tartsd nyomva a felfedéshez!
                            </p>

                            {/* Pulsing indicator */}
                            <div style={{
                                marginTop: '1.5rem',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-accent)',
                                animation: 'pulse 1.5s infinite'
                            }}></div>
                        </div>

                        {/* Back of Card */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            backgroundColor: currentPlayer.isImposter ? '#ffcdd2' : 'var(--color-layer2)', // Slightly reddish if imposter
                            borderRadius: '20px',
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: 'var(--box-shadow)',
                            transform: 'rotateY(180deg)',
                            border: currentPlayer.isImposter ? '4px solid #ef5350' : '4px solid var(--color-accent)'
                        }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#555' }}>
                                {currentPlayer.isImposter ? 'A titkod:' : 'A szó:'}
                            </p>
                            <h1 style={{
                                fontSize: '2.2rem',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                color: currentPlayer.isImposter ? '#c62828' : '#000'
                            }}>
                                {currentPlayer.displayWord}
                            </h1>

                            {currentPlayer.hint && (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    backgroundColor: 'rgba(255,255,255,0.6)',
                                    borderRadius: '10px',
                                    textAlign: 'center',
                                    width: '100%'
                                }}>
                                    <p style={{ fontStyle: 'italic', fontSize: '1.2rem', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                                        {currentPlayer.hint}
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <button
                className="btn"
                onClick={nextPlayer}
                style={{ marginTop: '2rem' }}
            >
                {currentIndex < playerData.length - 1 ? 'Következő játékos' : 'Játék indítása!'}
            </button>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(213, 189, 175, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(213, 189, 175, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(213, 189, 175, 0); }
        }
      `}</style>
        </div>
    );
}
