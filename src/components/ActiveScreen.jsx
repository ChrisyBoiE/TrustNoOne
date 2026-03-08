import { useState, useEffect } from 'react';

export default function ActiveScreen({ gameData, onEnd }) {
    const [timeLeft, setTimeLeft] = useState(gameData.timerDuration);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (!gameData.isTimerActive || timeLeft <= 0) return;

        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [gameData.isTimerActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="screen-title mb-1">Játék elkezdődött!</h2>
            <p className="text-center" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                Ideje beszélgetni és elkapni az Imposztort.
            </p>

            <div className="card-container text-center" style={{ width: '100%' }}>
                <h3 style={{ color: 'var(--color-accent)', fontSize: '1.8rem' }}>
                    {gameData.starterPlayer}
                </h3>
                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>kezdi a beszélgetést!</p>
            </div>

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
                    {timeLeft === 0 && (
                        <p style={{ color: '#ef5350', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem', animation: 'fadeIn 0.5s' }}>
                            LEJÁRT AZ IDŐ!
                        </p>
                    )}
                </div>
            )}

            {!showConfirm && (
                <button className="btn" onClick={() => setShowConfirm(true)} style={{ marginTop: 'auto', marginBottom: '2rem' }}>
                    Imposztor és szó felfedése
                </button>
            )}

            {showConfirm && (
                <div style={{
                    marginTop: 'auto',
                    marginBottom: '2rem',
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    boxShadow: 'var(--box-shadow)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Biztosan mindenki végzett a beszélgetéssel?</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn" onClick={() => setShowConfirm(false)} style={{ backgroundColor: 'var(--color-layer3)' }}>
                            Mégsem
                        </button>
                        <button className="btn" onClick={onEnd} style={{ backgroundColor: '#ef5350', color: 'white' }}>
                            Igen, Mutasd!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
