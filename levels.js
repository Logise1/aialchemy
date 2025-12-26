export const levels = [
    { id: 1, target: "Vapor", emoji: "💨", hint: "Agua + Fuego" },
    { id: 2, target: "Lava", emoji: "🌋", hint: "Tierra + Fuego" },
    { id: 3, target: "Barro", emoji: "💩", hint: "Agua + Tierra" },
    { id: 4, target: "Volcán", emoji: "🌋", hint: "Fuego + Fuego" },
    { id: 5, target: "Obsidiana", emoji: "⬛", hint: "Volcán + Agua" },
    { id: 6, target: "Polvo", emoji: "🌫️", hint: "Tierra + Viento" },
    { id: 7, target: "Humo", emoji: "🚬", hint: "Viento + Fuego" },
    { id: 8, target: "Niebla", emoji: "🌫️", hint: "Agua + Viento -> Ola? No, intenta cosas con aire." },
    { id: 9, target: "Lluvia", emoji: "🌧️", hint: "Nube + Agua" },
    { id: 10, target: "Planta", emoji: "🌱", hint: "Agua + Tierra = ?" },
    { id: 11, target: "Árbol", emoji: "🌳", hint: "Planta + ..." },
    { id: 12, target: "Bosque", emoji: "🌲", hint: "Árbol + Árbol" },
    { id: 13, target: "Lago", emoji: "🌊", hint: "Agua + Agua" },
    { id: 14, target: "Océano", emoji: "🌊", hint: "Lago + Agua" },
    { id: 15, target: "Pez", emoji: "🐟", hint: "Vida + Agua" },
    { id: 16, target: "Isla", emoji: "🏝️", hint: "Océano + Tierra" },
    { id: 17, target: "Humano", emoji: "🧑", hint: "Vida + Tierra" },
    { id: 18, target: "Ladrillo", emoji: "🧱", hint: "Barro + Fuego" },
    { id: 19, target: "Casa", emoji: "🏠", hint: "Muro + Muro" },
    { id: 20, target: "Ciudad", emoji: "🏙️", hint: "Pueblo + Pueblo" },
    { id: 21, target: "Metal", emoji: "🔗", hint: "Fuego + Piedra" },
    { id: 22, target: "Electricidad", emoji: "⚡", hint: "Metal + Energía" },
    { id: 23, target: "Ordenador", emoji: "💻", hint: "Electricidad + Vidrio/Metal" },
    { id: 24, target: "Internet", emoji: "🌐", hint: "Ordenador + Ordenador" },
    { id: 25, target: "Vidrio", emoji: "🥃", hint: "Arena + Fuego" },
    { id: 26, target: "Reloj", emoji: "🕰️", hint: "Arena + Vidrio = Reloj de arena..." },
    { id: 27, target: "Tiempo", emoji: "⏳", hint: "Reloj + ..." },
    { id: 28, target: "Sol", emoji: "☀️", hint: "Fuego + Planeta/Cielo" },
    { id: 29, target: "Luna", emoji: "🌙", hint: "Piedra + Cielo" },
    { id: 30, target: "Eclipse", emoji: "🌑", hint: "Sol + Luna" },
    // Extending to 100 with generic placeholders to reach the goal
    ...Array.from({ length: 70 }, (_, i) => ({
        id: 31 + i,
        target: `Nivel ${31 + i}`,
        emoji: "🔒",
        hint: "¡Sigue experimentando!"
    }))
];

// Set specific names for some higher levels to make them interesting
const specificLevels = {
    40: { target: "Dinosaurio", emoji: "🦖" },
    50: { target: "Unicornio", emoji: "🦄" },
    60: { target: "Dragón", emoji: "🐉" },
    75: { target: "Cthulhu", emoji: "🐙" },
    90: { target: "Universo", emoji: "🌌" },
    100: { target: "Multiverso", emoji: "🎆" }
};

levels.forEach(l => {
    if (specificLevels[l.id]) {
        l.target = specificLevels[l.id].target;
        l.emoji = specificLevels[l.id].emoji;
    }
});

// Simplified daily words (common objects, animals, weather)
export const dailyWords = [
    "Perro", "Gato", "Pájaro", "Flor", "Nube", "Río", "Montaña", "Coche", "Libro", "Música", "Frío", "Calor", "Pan", "Fruta"
];

export function getDailyChallenge() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % dailyWords.length;
    return {
        id: 'daily',
        target: dailyWords[index],
        emoji: '📅',
        isDaily: true,
        hint: "Una palabra común. ¡Intenta combinar lo básico!"
    };
}
