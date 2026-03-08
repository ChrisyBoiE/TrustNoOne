import { useState } from 'react';

export default function OnlineLobby({ onlineHook, onBack }) {
    const {
        roomCode, roomState, playerName, changeName,
        isHost, error, createRoom, joinRoom, leaveRoom,
        updateSettings, goToCategorySelection
    } = onlineHook;

    const [joinCode, setJoinCode] = useState('');
    const [localError, setLocalError] = useState(null);

    // If not in a room, show Create/Join UI
    if (!roomCode) {
        return (
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '1rem' }}>
                    ← Vissza
                </button>
                <h1 className="screen-title mb-1">Online játék</h1>

                <div className="card-container" style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Játékos neved:</label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => changeName(e.target.value)}
                        placeholder="Pl. Gábor..."
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-layer3)', fontFamily: 'var(--font-family)', fontSize: '1.1rem' }}
                    />
                </div>

                {error && <p style={{ color: '#ef5350', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</p>}
                {localError && <p style={{ color: '#ef5350', marginBottom: '1rem', fontWeight: 'bold' }}>{localError}</p>}

                <div className="card-container" style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Új szoba készítése</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Te leszel a házigazda, és küldhetsz kódot a többieknek.</p>
                    <button className="btn" onClick={createRoom}>Szoba létrehozása</button>
                </div>

                <div className="card-container" style={{ width: '100%' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Csatlakozás szobához</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Szobakód (5 betű)"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={5}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '2px solid var(--color-accent)', textTransform: 'uppercase', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                        />
                        <button
                            className="btn"
                            style={{ width: '100%', marginTop: 0 }}
                            onClick={async () => {
                                if (joinCode.length !== 5) {
                                    setLocalError("A kódnak pontosan 5 karakternek kell lennie!");
                                    return;
                                }
                                setLocalError(null);
                                const res = await joinRoom(joinCode);
                                if (res?.error) setLocalError(res.error);
                            }}
                        >
                            Belépés
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!roomState) {
        return <div className="flex-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Betöltés...</h2></div>;
    }

    // Inside a room
    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={leaveRoom} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#ef5350', fontWeight: 'bold' }}>
                    Kilépés
                </button>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Szobakód:</span><br />
                    <strong style={{ fontSize: '1.5rem', letterSpacing: '2px', color: 'var(--color-accent)' }}>{roomCode}</strong>
                </div>
            </div>

            <div className="card-container">
                <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Játékosok a szobában</span>
                    <span>{roomState.players?.length || 0}/20</span>
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
                    {roomState.players?.map(p => (
                        <span key={p.id} style={{
                            backgroundColor: p.isHost ? 'var(--color-accent)' : 'var(--color-layer2)',
                            color: p.isHost ? 'white' : 'var(--text-primary)',
                            padding: '0.5rem 1rem',
                            borderRadius: '15px',
                            fontWeight: p.isHost ? 'bold' : 'normal'
                        }}>
                            {p.name} {p.isHost && '👑'} {p.id === onlineHook.playerId && ' (Te)'}
                        </span>
                    ))}
                </div>
            </div>

            {isHost ? (
                <div className="card-container" style={{ marginTop: '1rem', flex: 1, overflowY: 'auto' }}>
                    <h3>Host beállítások</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Mint házigazda, te szabályozod a kört.</p>

                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Játékmód:</label>
                        <select
                            value={roomState.settings.gameMode || 'CASUAL'}
                            onChange={(e) => updateSettings({ ...roomState.settings, gameMode: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'var(--font-family)', fontSize: '1rem' }}
                        >
                            <option value="CASUAL">Laza (1 körös)</option>
                            <option value="COMPETITIVE">Verseny (Több körös)</option>
                        </select>
                    </div>

                    {roomState.settings.gameMode === 'COMPETITIVE' && (
                        <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Körök száma:</label>
                            <input
                                type="number"
                                min="2"
                                max="10"
                                value={roomState.settings.maxRounds || 3}
                                onChange={(e) => updateSettings({ ...roomState.settings, maxRounds: parseInt(e.target.value) || 3 })}
                                style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                            />
                        </div>
                    )}

                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Imposztorok száma:</label>
                        <input
                            type="number"
                            min="1"
                            max={roomState.players.length < 5 ? 1 : Math.max(1, roomState.players.length - 1)}
                            value={roomState.settings.imposterCount}
                            onChange={(e) => updateSettings({ ...roomState.settings, imposterCount: parseInt(e.target.value) || 1 })}
                            style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                            disabled={roomState.settings.isTrollMode}
                        />
                    </div>

                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={roomState.settings.isTrollMode}
                                onChange={(e) => updateSettings({ ...roomState.settings, isTrollMode: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            Troll Mód
                        </label>
                    </div>

                    <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={roomState.settings.isTimerActive}
                                onChange={(e) => updateSettings({ ...roomState.settings, isTimerActive: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            Időzítő (másodperc)
                        </label>
                        {roomState.settings.isTimerActive && (
                            <input
                                type="number"
                                min="30"
                                step="30"
                                value={roomState.settings.timerDuration}
                                onChange={(e) => updateSettings({ ...roomState.settings, timerDuration: parseInt(e.target.value) || 300 })}
                                style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="card-container text-center" style={{ marginTop: '1rem' }}>
                    <h3>Várakozás a házigazdára ⏳</h3>
                    <p style={{ marginTop: '0.5rem' }}>Csak a házigazda (👑) tudja elindítani a mérkőzést, és módosítani a beállításokat. Kérd meg, hogy válasszon kategóriát!</p>
                </div>
            )}

            {isHost && (
                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    <button
                        className="btn"
                        onClick={() => {
                            // Validations
                            if (roomState.players.length < 3) {
                                alert('A játékhoz legalább 3 ember szükséges!');
                                return;
                            }
                            if (roomState.players.length < 5 && roomState.settings.imposterCount > 1 && !roomState.settings.isTrollMode) {
                                alert('5 játékos alatt maximum 1 imposztor lehet!');
                                return;
                            }

                            // To actually pick categories, the Host should go to a SetupScreen equivalent.
                            goToCategorySelection();
                        }}
                    >
                        Tovább a kategóriákhoz
                    </button>
                </div>
            )}
        </div>
    );
}
