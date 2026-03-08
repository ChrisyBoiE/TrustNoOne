import { useState, useEffect } from 'react';
import { GAME_CATEGORIES } from '../data/categories';

export default function SetupScreen({ onStart, initialPlayers = [] }) {
    const [players, setPlayers] = useState(initialPlayers);
    const [newPlayerName, setNewPlayerName] = useState('');

    const [settings, setSettings] = useState({
        imposterCount: 1,
        isTrollMode: false,
        selectedCategories: [], // Empty now literally means EMPTY
        isTimerActive: false,
        timerDuration: 300 // 5 minutes in seconds
    });

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (newPlayerName.trim() && !players.includes(newPlayerName.trim()) && players.length < 20) {
            setPlayers([...players, newPlayerName.trim()]);
            setNewPlayerName('');
        }
    };

    const handleRemovePlayer = (name) => {
        setPlayers(players.filter(p => p !== name));
    };

    useEffect(() => {
        setSettings(s => {
            if (s.isTrollMode) return s;
            const maxImposters = players.length < 5 ? 1 : Math.max(1, players.length - 1);
            if (s.imposterCount > maxImposters && players.length >= 3) {
                return { ...s, imposterCount: maxImposters };
            }
            return s;
        });
    }, [players.length]);

    const toggleCategory = (catId) => {
        setSettings(prev => {
            const isSelected = prev.selectedCategories.includes(catId);
            if (isSelected) {
                return { ...prev, selectedCategories: prev.selectedCategories.filter(id => id !== catId) };
            } else {
                return { ...prev, selectedCategories: [...prev.selectedCategories, catId] };
            }
        });
    };

    const selectAllCategories = () => {
        setSettings(prev => ({ ...prev, selectedCategories: [] })); // Empty array implies all are active
    };

    // Wait, to truly deselect all, it would be an empty list, but the engine treats empty as ALL.
    // Let's implement robust UI handling:

    const isCategorySelected = (catId) => {
        return settings.selectedCategories.includes(catId);
    };

    const handleCategoryToggleLogic = (catId) => {
        setSettings(prev => {
            let newSelection = [...prev.selectedCategories];
            if (newSelection.includes(catId)) {
                newSelection = newSelection.filter(id => id !== catId);
            } else {
                newSelection.push(catId);
            }
            return { ...prev, selectedCategories: newSelection };
        });
    };


    const handleStart = () => {
        if (players.length < 3) {
            alert('Legalább 3 játékos szükséges!');
            return;
        }
        if (players.length < 5 && settings.imposterCount > 1 && !settings.isTrollMode) {
            alert('5 játékos alatt maximum 1 imposztor lehet!');
            return;
        }
        if (settings.imposterCount >= players.length && !settings.isTrollMode) {
            alert('Túl sok az imposztor a játékosok számához viszonyítva!');
            return;
        }
        if (settings.selectedCategories.length === 0) {
            alert('Válassz legalább egy kategóriát!');
            return;
        }

        onStart(players, settings);
    };

    return (
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 className="screen-title mb-1">Trust No One</h1>

            <div className="card-container">
                <h3>Játékosok ({players.length}/20)</h3>
                <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Játékos neve..."
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--color-layer3)', fontFamily: 'var(--font-family)', fontSize: '1rem' }}
                    />
                    <button type="submit" className="btn" style={{ marginTop: 0, width: 'auto', padding: '0.8rem 1.2rem' }}>+</button>
                </form>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {players.map(p => (
                        <span key={p} style={{ backgroundColor: 'var(--color-layer2)', padding: '0.5rem 1rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {p}
                            <button
                                onClick={() => handleRemovePlayer(p)}
                                style={{ background: 'transparent', border: 'none', color: 'red', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}
                            >×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="card-container">
                <h3>Beállítások</h3>

                <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label>Imposztorok száma:</label>
                    <input
                        type="number"
                        min="1"
                        max={players.length < 5 ? 1 : Math.max(1, players.length - 1)}
                        value={settings.imposterCount}
                        onChange={(e) => setSettings({ ...settings, imposterCount: parseInt(e.target.value) || 1 })}
                        style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                        disabled={settings.isTrollMode}
                    />
                </div>

                <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.isTrollMode}
                            onChange={(e) => setSettings({ ...settings, isTrollMode: e.target.checked })}
                            style={{ width: '20px', height: '20px' }}
                        />
                        Troll Mód (Mindenki Imposztor!)
                    </label>
                </div>

                <div style={{ margin: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.isTimerActive}
                            onChange={(e) => setSettings({ ...settings, isTimerActive: e.target.checked })}
                            style={{ width: '20px', height: '20px' }}
                        />
                        Időzítő (másodperc)
                    </label>
                    {settings.isTimerActive && (
                        <input
                            type="number"
                            min="30"
                            step="30"
                            value={settings.timerDuration}
                            onChange={(e) => setSettings({ ...settings, timerDuration: parseInt(e.target.value) || 300 })}
                            style={{ width: '80px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', textAlign: 'center' }}
                        />
                    )}
                </div>
            </div>

            <div className="card-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3>Kategóriák</h3>
                    <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, selectedCategories: GAME_CATEGORIES.map(c => c.id) }))}
                        style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}
                    >Mind</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '0.5rem 0' }}>
                    {GAME_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryToggleLogic(cat.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: '12px',
                                padding: '0.8rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--color-accent)',
                                backgroundColor: isCategorySelected(cat.id) ? 'var(--color-accent)' : 'var(--color-base)',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-family)',
                                fontSize: '1.1rem',
                                fontWeight: isCategorySelected(cat.id) ? '700' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <button
                    className="btn"
                    onClick={handleStart}
                    disabled={players.length < 3 || settings.selectedCategories.length === 0}
                >
                    {players.length < 3 ? 'Legalább 3 játékos kell' : settings.selectedCategories.length === 0 ? 'Válassz kategóriát!' : 'Játék indítása'}
                </button>
            </div>
        </div>
    );
}
