import { useState } from 'react';

export default function HomeScreen({ onSelectMode }) {
    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 className="screen-title" style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Trust No One</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Keresd meg az imposztort a barátaid között!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '300px' }}>
                <button
                    className="btn"
                    onClick={() => onSelectMode('LOCAL')}
                    style={{ padding: '1.5rem', fontSize: '1.3rem' }}
                >
                    📱 Klasszikus (Közös telefon)
                </button>

                <button
                    className="btn"
                    onClick={() => onSelectMode('ONLINE')}
                    style={{ padding: '1.5rem', fontSize: '1.3rem', backgroundColor: 'var(--color-layer2)', color: 'var(--text-primary)', border: '2px solid var(--color-accent)' }}
                >
                    🌍 Online (Saját telefonon)
                </button>
            </div>

            <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--color-layer3)' }}>
                Verzió: 2.0 (Online Multiplayer)
            </div>
        </div>
    );
}
