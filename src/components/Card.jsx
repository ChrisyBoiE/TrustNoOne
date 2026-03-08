import React from 'react';

export default function Card({ isFlipped, onHoldStart, onHoldEnd, children }) {
    return (
        <div
            onPointerDown={onHoldStart}
            onPointerUp={onHoldEnd}
            onPointerLeave={onHoldEnd}
            onPointerCancel={onHoldEnd}
            style={{
                width: '100%',
                maxWidth: '320px',
                height: '420px',
                perspective: '1000px',
                cursor: 'pointer',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                margin: '0 auto'
            }}
        >
            <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
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
                    backgroundColor: 'var(--color-layer2)',
                    borderRadius: '20px',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: 'var(--box-shadow)',
                    transform: 'rotateY(180deg)',
                    border: '4px solid var(--color-accent)'
                }}>
                    {children}
                </div>
            </div>

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
