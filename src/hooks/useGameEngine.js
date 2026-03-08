import { GAME_CATEGORIES } from '../data/categories';

export function generateGame(players, settings) {
    // 1. Pick category & word
    const allowedCategories = GAME_CATEGORIES.filter(c => settings.selectedCategories.includes(c.id));

    if (allowedCategories.length === 0) {
        throw new Error("Nincs kiválasztott kategória!");
    }

    const randomCategory = allowedCategories[Math.floor(Math.random() * allowedCategories.length)];
    const randomItem = randomCategory.items[Math.floor(Math.random() * randomCategory.items.length)];

    const { word, hint } = randomItem;

    // 2. Assign Imposters
    let imposters = [];
    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());

    if (settings.isTrollMode || settings.imposterCount >= players.length) {
        imposters = players;
    } else {
        imposters = shuffledPlayers.slice(0, settings.imposterCount);
    }

    // 3. Create Player Cards (keep original player order for pass-the-phone)
    const playerData = players.map(p => {
        const isImposter = imposters.includes(p);
        return {
            name: p,
            isImposter: isImposter,
            displayWord: isImposter ? "Te vagy az Imposztor!" : word,
            hint: isImposter ? `Kategória: ${randomCategory.name}\nTipp: ${hint}` : null
        };
    });

    // 4. Random Starter
    const starterPlayer = players[Math.floor(Math.random() * players.length)];

    return {
        word,
        hint,
        categoryName: randomCategory.name,
        imposters,
        playerData,
        starterPlayer,
        timerDuration: settings.timerDuration,
        isTimerActive: settings.isTimerActive
    };
}
