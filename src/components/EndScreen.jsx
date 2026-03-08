
export default function EndScreen({ gameData, onRestart }) {
    const imposztorNevek = gameData.imposters.join(', ');

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="screen-title mb-1">Eredmény</h2>

            <div className="card-container text-center" style={{ width: '100%', border: '4px solid #ef5350', backgroundColor: '#ffcdd2', boxShadow: '0 10px 30px rgba(239, 83, 80, 0.3)' }}>
                <p style={{ fontSize: '1.2rem', color: '#c62828', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {gameData.imposters.length > 1 ? 'Az imposztorok:' : 'Az imposztor:'}
                </p>
                <h1 style={{ fontSize: '2.5rem', color: '#b71c1c' }}>
                    {imposztorNevek}
                </h1>
            </div>

            <div className="card-container text-center mt-2" style={{ width: '100%', border: '4px solid var(--color-accent)' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-layer3)', marginBottom: '0.5rem' }}>Eredeti szó:</p>
                <h2 style={{ fontSize: '2rem' }}>{gameData.word}</h2>
                <p style={{ fontSize: '1rem', marginTop: '1rem', fontStyle: 'italic', color: '#555' }}>
                    Kategória: {gameData.categoryName}
                </p>
            </div>

            <button className="btn" onClick={onRestart} style={{ marginTop: 'auto', marginBottom: '2rem' }}>
                Új játék indítása
            </button>
        </div>
    );
}
