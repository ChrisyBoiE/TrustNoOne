import { useState } from 'react';
import { GAME_CATEGORIES } from '../data/categories';
import { generateGame } from '../hooks/useGameEngine';

export default function OnlineCategoryScreen({ onlineHook }) {
    const { roomState, updateSettings, distributeCards, isHost, backToLobby } = onlineHook;
    const { settings, players } = roomState;

    if (!isHost) {
        return (
            <div className="flex-1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="card-container text-center">
                    <h3>Várakozás a házigazdára...</h3>
                    <p>A házigazda éppen kategóriát választ.</p>
                </div>
            </div>
        );
    }

    const toggleCategory = (catId) => {
        let newSelection = [...settings.selectedCategories];
        if (newSelection.includes(catId)) {
            newSelection = newSelection.filter(id => id !== catId);
        } else {
            newSelection.push(catId);
        }
        updateSettings({ ...settings, selectedCategories: newSelection });
    };

    const handleStart = () => {
        if (settings.selectedCategories.length === 0) {
            alert('Válassz legalább egy kategóriát!');
            return;
        }

        // Generate the game data
        try {
            const gameData = generateGame(players.map(p => p.name), settings);

            // Map the imposter names back to IDs so each client knows what they are without relying only on name
            const impostersIds = players.filter(p => gameData.imposters.includes(p.name)).map(p => p.id);
            const starterPlayerObj = players.find(p => p.name === gameData.starterPlayer);

            const onlineGameData = {
                word: gameData.word,
                hint: gameData.hint,
                categoryName: gameData.categoryName,
                imposters: impostersIds,
                starterPlayerId: starterPlayerObj?.id || players[0].id,
                starterPlayerName: starterPlayerObj?.name || players[0].name,
                isTimerActive: gameData.isTimerActive,
                timerDuration: gameData.timerDuration
            };

            distributeCards(onlineGameData);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => updateSettings({ ...settings, action: null })} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '1rem' }}>
                ← Vissza a lobbyba
            </button>

            <h1 className="screen-title mb-1">Kategóriák</h1>
            <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Válassz témát a játéknak!</p>

            <div className="card-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3>Minden kategória</h3>
                    <button
                        type="button"
                        onClick={() => updateSettings({ ...settings, selectedCategories: GAME_CATEGORIES.map(c => c.id) })}
                        style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}
                    >Mind</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                    {GAME_CATEGORIES.map(cat => {
                        const isSelected = settings.selectedCategories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    gap: '12px',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-accent)',
                                    backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-base)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1.1rem',
                                    fontWeight: isSelected ? '700' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button
                    className="btn"
                    onClick={handleStart}
                    disabled={settings.selectedCategories.length === 0}
                >
                    {settings.selectedCategories.length === 0 ? 'Válassz kategóriát!' : 'Játék indítása mindenkinek!'}
                </button>
            </div>
        </div>
    );
}
