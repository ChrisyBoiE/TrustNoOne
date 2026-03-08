import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

// State structure in DB:
// rooms (table)
// id: UUID (PK)
// code: String (4-6 chars)
// status: 'LOBBY', 'PLAYING', 'FINISHED'
// players: JSONB [{ id, name, isHost, isReady }]
// settings: JSONB
// gameData: JSONB (the output of generateGame)

export function useOnlineGame() {
    const [roomCode, setRoomCode] = useState(null);
    const [roomState, setRoomState] = useState(null);
    const [playerId, setPlayerId] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState(null);

    // Initial setup: persist player identity locally
    useEffect(() => {
        let storedId = localStorage.getItem('trustNoOne_playerId');
        if (!storedId) {
            storedId = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
            localStorage.setItem('trustNoOne_playerId', storedId);
        }
        setPlayerId(storedId);

        let storedName = localStorage.getItem('trustNoOne_playerName');
        if (storedName) {
            setPlayerName(storedName);
        }
    }, []);

    // Cleanup stale rooms (older than 5 minutes of inactivity)
    useEffect(() => {
        if (!supabase) return;

        const cleanupOldRooms = async () => {
            const { data: rooms } = await supabase.from('rooms').select('id, settings');
            if (rooms) {
                const now = Date.now();
                const staleIds = rooms
                    .filter(r => r.settings?.lastActivity && (now - r.settings.lastActivity > 300000))
                    .map(r => r.id);

                if (staleIds.length > 0) {
                    await supabase.from('rooms').delete().in('id', staleIds);
                }
            }
        };

        cleanupOldRooms();
        const interval = setInterval(cleanupOldRooms, 300000); // Check every 5 mins
        return () => clearInterval(interval);
    }, []);

    // Subscribe to room changes
    useEffect(() => {
        if (!roomCode || !supabase) return;

        console.log(`Subscribing to room: ${roomCode}`);
        const subscription = supabase
            .channel(`room:${roomCode}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'rooms',
                    filter: `code=eq.${roomCode}`
                },
                (payload) => {
                    console.log('Room update received:', payload.new);
                    setRoomState(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Successfully subscribed to room changes');
                }
            });

        // Fetch initial state
        const fetchInitialState = async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('code', roomCode)
                .single();

            if (error) {
                console.error("Error fetching room:", error);
                if (error.code === 'PGRST116') {
                    // Not found
                    setError("Ez a szoba nem létezik.");
                    leaveRoom();
                }
            } else if (data) {
                setRoomState(data);
                const me = data.players?.find(p => p.id === playerId);
                if (me) {
                    setIsHost(me.isHost);
                }
            }
        };

        fetchInitialState();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [roomCode, playerId]);

    // Keep activity fresh if host
    useEffect(() => {
        if (!roomCode || !supabase || !isHost) return;

        const activityInterval = setInterval(async () => {
            const { data } = await supabase.from('rooms').select('settings').eq('code', roomCode).single();
            if (data && data.settings) {
                await supabase.from('rooms').update({
                    settings: { ...data.settings, lastActivity: Date.now() }
                }).eq('code', roomCode);
            }
        }, 60000); // Ping every 1 minute

        return () => clearInterval(activityInterval);
    }, [roomCode, isHost]);

    const changeName = (newName) => {
        setPlayerName(newName);
        localStorage.setItem('trustNoOne_playerName', newName);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const createRoom = async () => {
        if (!supabase) return { error: "Nincs adatbázis kapcsolat." };
        if (!playerName.trim()) return { error: "Kérlek, add meg a neved!" };

        const newCode = generateCode();
        const initialPlayer = { id: playerId, name: playerName, isHost: true, isReady: false };

        const { data, error } = await supabase
            .from('rooms')
            .insert([{
                code: newCode,
                status: 'LOBBY',
                players: [initialPlayer],
                settings: {
                    gameMode: 'CASUAL', // CASUAL or COMPETITIVE
                    maxRounds: 3,
                    currentRound: 1,
                    scores: {}, // { "playerId": 0 }
                    imposterCount: 1,
                    isTrollMode: false,
                    selectedCategories: [],
                    isTimerActive: false,
                    timerDuration: 300,
                    lastActivity: Date.now()
                },
                gameData: null
            }])
            .select()
            .single();

        if (error) {
            setError("Hiba a szoba létrehozásakor.");
            return { error };
        }

        setRoomCode(newCode);
        setIsHost(true);
        return { roomCode: newCode };
    };

    const joinRoom = async (codeToJoin) => {
        if (!supabase) return { error: "Nincs adatbázis kapcsolat." };
        if (!playerName.trim()) return { error: "Kérlek, add meg a neved!" };

        const upperCode = codeToJoin.toUpperCase();

        // 1. Fetch room
        const { data: room, error: fetchErr } = await supabase
            .from('rooms')
            .select('*')
            .eq('code', upperCode)
            .single();

        if (fetchErr || !room) {
            return { error: "Nem található ilyen szoba!" };
        }

        if (room.status !== 'LOBBY') {
            return { error: "Ez a játék már elkezdődött!" };
        }

        // 2. Check if player already in room, else add them
        let players = [...(room.players || [])];
        const existingPlayerIndex = players.findIndex(p => p.id === playerId);

        // Prevent joining if max players reached (20)
        if (existingPlayerIndex === -1 && players.length >= 20) {
            return { error: "A szoba megtelt (max 20)!" };
        }

        // Prevent joining with same name
        if (existingPlayerIndex === -1 && players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
            return { error: "Ez a név már foglalt ebben a szobában!" };
        }

        if (existingPlayerIndex === -1) {
            players.push({ id: playerId, name: playerName, isHost: false, isReady: false });
        } else {
            // Update name just in case they changed it
            players[existingPlayerIndex].name = playerName;
        }

        // 3. Update room
        const { error: updateErr } = await supabase
            .from('rooms')
            .update({ players })
            .eq('id', room.id);

        if (updateErr) {
            return { error: "Hiba csatlakozáskor." };
        }

        setRoomCode(upperCode);
        setIsHost(existingPlayerIndex !== -1 ? players[existingPlayerIndex].isHost : false);
        return { success: true };
    };

    const leaveRoom = async () => {
        if (roomCode && roomState && supabase) {
            // Remove player from DB
            const updatedPlayers = roomState.players.filter(p => p.id !== playerId);
            if (updatedPlayers.length === 0) {
                // Delete room if empty
                await supabase.from('rooms').delete().eq('id', roomState.id);
            } else {
                // If host leaves, assign random host
                if (isHost && updatedPlayers.length > 0) {
                    updatedPlayers[0].isHost = true;
                }
                await supabase.from('rooms').update({ players: updatedPlayers }).eq('id', roomState.id);
            }
        }
        setRoomCode(null);
        setRoomState(null);
        setIsHost(false);
    };

    const updateSettings = async (newSettings) => {
        if (!isHost || !roomState || !supabase) return;

        await supabase
            .from('rooms')
            .update({ settings: newSettings })
            .eq('id', roomState.id);
    };

    const goToCategorySelection = async () => {
        if (!isHost || !roomState || !supabase) return;
        await supabase.from('rooms').update({ status: 'CATEGORY' }).eq('id', roomState.id);
    };

    const distributeCards = async (generatedGameData) => {
        if (!isHost || !roomState || !supabase) return;
        const players = roomState.players.map(p => ({ ...p, isReady: false }));

        let updatedSettings = { ...roomState.settings };
        if (updatedSettings.gameMode === 'COMPETITIVE' && updatedSettings.currentRound === 1) {
            const initScores = {};
            players.forEach(p => initScores[p.id] = 0);
            updatedSettings.scores = initScores;
        }

        const gameDataWithVotes = { ...generatedGameData, votes: {} };

        await supabase
            .from('rooms')
            .update({
                status: 'PASS',
                settings: updatedSettings,
                gameData: gameDataWithVotes,
                players: players
            })
            .eq('id', roomState.id);
    };

    const setPlayerReady = async () => {
        if (!roomState || !supabase) return;
        const players = [...roomState.players];
        const me = players.find(p => p.id === playerId);
        if (me) {
            me.isReady = true;
            await supabase.from('rooms').update({ players }).eq('id', roomState.id);
        }
    };

    const everyoneReady = () => {
        if (!roomState || !roomState.players) return false;
        return roomState.players.every(p => p.isReady);
    };

    const voteForImposter = async (suspectId) => {
        if (!roomState || !supabase || roomState.status !== 'ACTIVE') return;

        const currentVotes = { ...(roomState.gameData?.votes || {}) };
        currentVotes[playerId] = suspectId;

        await supabase
            .from('rooms')
            .update({
                gameData: { ...roomState.gameData, votes: currentVotes }
            })
            .eq('id', roomState.id);
    };

    const everyoneVoted = () => {
        if (!roomState || !roomState.players || !roomState.gameData) return false;
        if (roomState.settings.gameMode !== 'COMPETITIVE') return true; // Visual safety
        const totalVotes = Object.keys(roomState.gameData.votes || {}).length;
        return totalVotes >= roomState.players.length;
    };

    const startTimerPhase = async () => {
        if (!isHost || !roomState || !supabase) return;
        // set start time so everyone syncs
        const updatedGameData = { ...roomState.gameData, startTime: Date.now() };
        await supabase
            .from('rooms')
            .update({ status: 'ACTIVE', gameData: updatedGameData })
            .eq('id', roomState.id);
    };

    const endGame = async () => {
        if (!isHost || !roomState || !supabase) return;

        let finalSettings = { ...roomState.settings };
        if (finalSettings.gameMode === 'COMPETITIVE') {
            const votes = roomState.gameData.votes || {};
            const imposters = roomState.gameData.imposters || [];
            const currentScores = { ...(finalSettings.scores || {}) };

            Object.entries(votes).forEach(([voterId, suspectId]) => {
                if (imposters.includes(suspectId)) {
                    currentScores[voterId] = (currentScores[voterId] || 0) + 1;
                }
            });
            finalSettings.scores = currentScores;
        }

        await supabase
            .from('rooms')
            .update({ status: 'FINISHED', settings: finalSettings })
            .eq('id', roomState.id);
    };

    const nextRound = async () => {
        if (!isHost || !roomState || !supabase) return;
        const currentSettings = roomState.settings;

        await supabase
            .from('rooms')
            .update({
                status: 'CATEGORY',
                settings: { ...currentSettings, currentRound: currentSettings.currentRound + 1 }
            })
            .eq('id', roomState.id);
    };

    const backToLobby = async () => {
        if (!isHost || !roomState || !supabase) return;
        await supabase
            .from('rooms')
            .update({ status: 'LOBBY', gameData: null })
            .eq('id', roomState.id);
    }

    return {
        roomCode,
        roomState,
        playerId,
        playerName,
        changeName,
        isHost,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
        updateSettings,
        goToCategorySelection,
        distributeCards,
        setPlayerReady,
        everyoneReady,
        voteForImposter,
        everyoneVoted,
        startTimerPhase,
        endGame,
        nextRound,
        backToLobby
    };
}
