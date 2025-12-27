import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { levels, getDailyChallenge } from "./levels.js";

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyB66lHK9aRUYe-c-dmfcjH0vgcKladPOn4",
    authDomain: "kolab-68a94.firebaseapp.com",
    databaseURL: "https://kolab-68a94-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kolab-68a94",
    storageBucket: "kolab-68a94.firebasestorage.app",
    messagingSenderId: "1096743571153",
    appId: "1:1096743571153:web:e495eae14131bd06f57ff0",
    measurementId: "G-J8LBK57R3P"
};

const API_KEY = "evxly62Xv91b752fbnHA2I3HD988C5RT"; // For AI Generation

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Data ---
const startingElements = ["Agua", "Fuego", "Tierra", "Viento"];
let inventory = new Set([...startingElements]);
let workspaceElements = [];
let isDragging = false;
let draggedElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let zIndexCounter = 100;
let currentUser = null;
let currentGameMode = 'sandbox'; // 'sandbox', 'level', 'daily'
let currentTarget = null; // { target: "Steam", ... }
let completedLevels = new Set(); // IDs of completed levels
let persistentInventory = new Set([...startingElements]); // Store sandbox inventory
let persistentEmojis = {}; // Store custom emojis
let currentLevelPage = 0;
const LEVELS_PER_PAGE = 20;

// Recipes Cache

// Recipes Cache
const recipes = {
    "Agua+Fuego": "Vapor",
    "Fuego+Agua": "Vapor",
    "Agua+Tierra": "Barro",
    "Tierra+Agua": "Barro",
    "Fuego+Tierra": "Lava",
    "Tierra+Fuego": "Lava",
    "Viento+Tierra": "Polvo",
    "Tierra+Viento": "Polvo",
    "Viento+Fuego": "Humo",
    "Fuego+Viento": "Humo",
    "Agua+Agua": "Lago",
    "Fuego+Fuego": "Volcán",
    "Tierra+Tierra": "Montaña",
    "Viento+Viento": "Tornado",
    "Lago+Agua": "Océano",
    "Océano+Agua": "Mar",
    "Tierra+Océano": "Isla",
    "Isla+Árbol": "Palmera",
    "Barro+Fuego": "Ladrillo",
    "Ladrillo+Ladrillo": "Muro",
    "Muro+Muro": "Casa",
    "Casa+Casa": "Pueblo",
    "Pueblo+Pueblo": "Ciudad",
    "Tierra+Vida": "Humano",
    "Humano+Casa": "Familia",
    "Vapor+Tierra": "Géiser",
    "Humo+Niebla": "Smog",
    "Polvo+Fuego": "Pólvora",
    "Montaña+Agua": "Cascada",
    "Cascada+Agua": "Río",
    "Volcán+Agua": "Obsidiana",
    "Agua+Viento": "Ola",
    "Ola+Tierra": "Arena",
    "Arena+Fuego": "Vidrio",
    "Vidrio+Arena": "Reloj de arena",
    "Planta+Agua": "Pantano",
    "Planta+Tierra": "Árbol",
    "Árbol+Árbol": "Bosque",
    "Bosque+Vida": "Salvaje",
    "Vida+Polvo": "Alien",
    "Planta+Sol": "Flor",
    "Volcán+Montaña": "Cordillera",
    "Arena+Arena": "Desierto",
    "Desierto+Agua": "Oasis",
    "Nube+Agua": "Lluvia",
    "Lluvia+Lluvia": "Inundación",
    "Lluvia+Sol": "Arcoíris",
    "Fuego+Vapor": "Motor",
    "Motor+Carbón": "Tren",
    "Motor+Agua": "Barco de vapor",
    "Viento+Energía": "Tormenta",
    "Tormenta+Agua": "Trueno",
    "Vida+Agua": "Pez",
    "Vida+Tierra": "Animal",
    "Animal+Casa": "Mascota",
};

const emojiMap = {
    "Agua": "💧",
    "Fuego": "🔥",
    "Tierra": "🌍",
    "Viento": "💨",
    "Vapor": "💨",
    "Barro": "💩",
    "Lava": "🌋",
    "Polvo": "🌫️",
    "Humo": "🚬",
    "Lago": "🌊",
    "Volcán": "🌋",
    "Montaña": "🏔️",
    "Tornado": "🌪️",
    "Océano": "🌊",
    "Mar": "🌊",
    "Isla": "🏝️",
    "Ladrillo": "🧱",
    "Muro": "🧱",
    "Casa": "🏠",
    "Pueblo": "🏘️",
    "Ciudad": "🏙️",
    "Humano": "🧑",
    "Familia": "👨‍👩‍👧",
    "Géiser": "⛲",
    "Smog": "🌫️",
    "Pólvora": "🧨",
    "Cascada": "🌊",
    "Río": "🏞️",
    "Obsidiana": "⬛",
    "Ola": "🌊",
    "Arena": "🏖️",
    "Vidrio": "🥃",
    "Reloj de arena": "⏳",
    "Pantano": "🐊",
    "Árbol": "🌳",
    "Bosque": "🌲",
    "Salvaje": "🦁",
    "Alien": "👽",
    "Flor": "🌸",
    "Escritorio": "🖥️",
    "Palmera": "🌴",
    "Desierto": "🌵",
    "Oasis": "🏝️",
    "Lluvia": "🌧️",
    "Inundación": "🌊",
    "Arcoíris": "🌈",
    "Motor": "⚙️",
    "Tren": "🚂",
    "Barco de vapor": "🚢",
    "Tormenta": "⛈️",
    "Trueno": "⚡",
    "Pez": "🐟",
    "Animal": "🐶",
    "Mascota": "🐕",
    "Vida": "🧬",
    "Sol": "☀️",
    "Nube": "☁️",
    "Energía": "⚡",
    "Carbón": "🪨",
    "Niebla": "🌫️",
    "Planta": "🌱"
};

// Internal Sound helper
const sounds = {
    delete: new Audio('sfx/delete.mp3'),
    discovery: new Audio('sfx/discovery.mp3'),
    error: new Audio('sfx/error.mp3'),
    instance: new Audio('sfx/instance.mp3'),
    reward: new Audio('sfx/reward.mp3')
};

function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(e => { /* Ignore auto-play blocks */ });
    }
}

// --- DOM Elements ---
const inventoryContainer = document.getElementById('inventory');
const workspace = document.getElementById('workspace');
const searchBar = document.getElementById('search-bar');
const clearBtn = document.getElementById('clear-btn');
const resetBtn = document.getElementById('reset-btn');

// Menu DOM
const mainMenu = document.getElementById('main-menu');
const modeSandboxBtn = document.getElementById('mode-sandbox-btn');
const modeLevelsBtn = document.getElementById('mode-levels-btn');
const modeDailyBtn = document.getElementById('mode-daily-btn');
const levelsModal = document.getElementById('levels-modal');
const levelsGrid = document.getElementById('levels-grid');
const menuButtons = document.querySelector('.menu-buttons');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageIndicator = document.getElementById('page-indicator');

// Challenge DOM
const challengeBar = document.getElementById('challenge-bar');
const challengeTargetSpan = document.getElementById('challenge-target');
const exitChallengeBtn = document.getElementById('exit-challenge-btn');

// Auth DOM
const loginTriggerBtn = document.getElementById('login-trigger-btn');
const authModal = document.getElementById('auth-modal');
const closeModal = document.getElementById('close-modal');

const userDisplay = document.getElementById('user-display');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');

// --- Initialization ---
function init() {
    renderInventory();
    setupGlobalListeners();
    setupAuthListeners();
    setupMenuListeners();
}

function setupMenuListeners() {
    modeSandboxBtn.addEventListener('click', () => {
        playSound('instance');
        startGame('sandbox');
    });

    modeLevelsBtn.addEventListener('click', () => {
        playSound('instance');
        menuButtons.classList.add('hidden');
        levelsModal.classList.add('active');
        currentLevelPage = 0;
        renderLevelsGrid();
    });

    backToMenuBtn.addEventListener('click', () => {
        playSound('instance');
        menuButtons.classList.remove('hidden');
        levelsModal.classList.remove('active');
    });

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(levels.length / LEVELS_PER_PAGE);
            if (currentLevelPage > 0) {
                playSound('instance');
                currentLevelPage--;
                renderLevelsGrid();
            }
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(levels.length / LEVELS_PER_PAGE);
            if (currentLevelPage < totalPages - 1) {
                playSound('instance');
                currentLevelPage++;
                renderLevelsGrid();
            }
        });
    }

    modeDailyBtn.addEventListener('click', () => {
        playSound('instance');
        const daily = getDailyChallenge();
        startGame('daily', daily);
    });

    exitChallengeBtn.addEventListener('click', () => {
        playSound('instance');
        showMainMenu();
    });
}

function renderLevelsGrid() {
    levelsGrid.innerHTML = '';

    const start = currentLevelPage * LEVELS_PER_PAGE;
    const end = start + LEVELS_PER_PAGE;
    const pageLevels = levels.slice(start, end);
    const totalPages = Math.ceil(levels.length / LEVELS_PER_PAGE);

    if (pageIndicator) pageIndicator.textContent = `${currentLevelPage + 1} / ${totalPages}`;
    if (prevPageBtn) prevPageBtn.disabled = currentLevelPage === 0;
    if (nextPageBtn) nextPageBtn.disabled = currentLevelPage >= totalPages - 1;

    pageLevels.forEach(level => {
        const btn = document.createElement('div');
        const isLocked = level.id > 1 && !completedLevels.has(level.id - 1);
        const isCompleted = completedLevels.has(level.id);

        btn.className = `level-btn ${isLocked ? 'locked' : ''}`;
        btn.textContent = isLocked ? '🔒' : (isCompleted ? `✅ ${level.id}` : level.id);

        if (!isLocked) {
            btn.addEventListener('click', () => {
                playSound('instance');
                startGame('level', level);
            });
        }
        levelsGrid.appendChild(btn);
    });
}

function startGame(mode, targetData = null) {
    currentGameMode = mode;
    currentTarget = targetData;

    // UI Updates
    mainMenu.classList.add('hidden');
    challengeBar.style.display = mode === 'sandbox' ? 'none' : 'flex';

    if (mode === 'sandbox') {
        // Restore Sandbox state
        inventory = new Set(persistentInventory);
    } else {
        // Reset for Levels/Daily (Local only)
        inventory = new Set([...startingElements]);
        if (targetData) {
            challengeTargetSpan.textContent = `${targetData.target} ${targetData.emoji || '?'}`;
        }
    }

    renderInventory();
    resetWorkspace();
}

function showMainMenu() {
    mainMenu.classList.remove('hidden');
    menuButtons.classList.remove('hidden');
    levelsModal.classList.remove('active');
    challengeBar.style.display = 'none';
    resetWorkspace();
}

function resetWorkspace() {
    workspaceElements.forEach(el => el.remove());
    workspaceElements = [];
}

// --- Auth Functions ---
function setupAuthListeners() {
    // Modal Logic
    if (loginTriggerBtn) {
        loginTriggerBtn.addEventListener('click', () => {
            playSound('instance');
            if (authModal) {
                authModal.style.display = 'flex';
                if (usernameInput) usernameInput.focus();
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            playSound('instance');
            if (authModal) authModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target == authModal) {
            authModal.style.display = 'none';
        }
    });

    // Login Action
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            playSound('instance');
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showToast("Por favor ingresa usuario y contraseña");
                return;
            }

            const email = `${username}@email.com`;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                if (authModal) authModal.style.display = 'none';
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // Register Action
    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            playSound('instance');
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showToast("Completa los campos para registrarte");
                return;
            }

            if (password.length < 6) {
                showToast("La contraseña debe tener al menos 6 caracteres");
                return;
            }

            const email = `${username}@email.com`;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, {
                    displayName: username
                });

                userNameSpan.textContent = username;
                userAvatar.textContent = username.charAt(0).toUpperCase();

                showToast(`¡Bienvenido, ${username}!`);
                if (authModal) authModal.style.display = 'none';
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            playSound('instance');
            signOut(auth).then(() => {
                showToast("Sesión cerrada");
                inventory = new Set([...startingElements]);
                workspaceElements.forEach(el => el.remove());
                workspaceElements = [];
                renderInventory();
            });
        });
    }

    // Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            // Logged In
            if (loginTriggerBtn) loginTriggerBtn.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'flex';

            let display = user.displayName;
            if (!display && user.email) {
                display = user.email.split('@')[0];
            }
            if (userNameSpan) userNameSpan.textContent = display || "Usuario";
            if (userAvatar && display) userAvatar.textContent = display.charAt(0).toUpperCase();

            await loadUserData(user);
        } else {
            // Logged Out
            if (loginTriggerBtn) loginTriggerBtn.style.display = 'block';
            if (userDisplay) userDisplay.style.display = 'none';
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
        }
    });
}

function handleAuthError(error) {
    console.error("Auth Error:", error.code, error.message);
    if (error.code === 'auth/invalid-email') {
        showToast("Nombre de usuario inválido");
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showToast("Usuario o contraseña incorrectos");
    } else if (error.code === 'auth/email-already-in-use') {
        showToast("Este usuario ya está registrado");
    } else {
        showToast("Error: " + error.message);
    }
}

async function loadUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.emojis) {
            Object.assign(persistentEmojis, data.emojis);
            Object.assign(emojiMap, data.emojis);
        }
        if (data.inventory) {
            data.inventory.forEach(item => persistentInventory.add(item));
        }
        if (data.completedLevels) {
            data.completedLevels.forEach(id => completedLevels.add(id));
        }

        // Sync visual state
        if (currentGameMode === 'sandbox') {
            inventory = new Set(persistentInventory);
            renderInventory();
        }

        // Refresh levels grid if user is viewing it or to ensure state is ready
        renderLevelsGrid();

        showToast(`Progreso cargado`);
    } else {
        await setDoc(userRef, {
            inventory: [...startingElements],
            emojis: {},
            username: user.displayName || user.email.split('@')[0],
            completedLevels: [] // Initialize empty
        }, { merge: true });
    }
}

async function saveNewDiscovery(elementName, emoji) {
    if (!currentUser) return;

    // Sandbox Only Logic for persistence
    if (currentGameMode === 'sandbox') {
        persistentInventory.add(elementName);
        if (emoji) persistentEmojis[elementName] = emoji;

        const userRef = doc(db, "users", currentUser.uid);
        try {
            await setDoc(userRef, {
                inventory: arrayUnion(elementName),
                emojis: {
                    [elementName]: emoji
                }
            }, { merge: true });
        } catch (e) {
            console.error("Error saving discovery:", e);
        }
    }
}

async function saveLevelComplete(levelId) {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    try {
        await updateDoc(userRef, {
            completedLevels: arrayUnion(levelId)
        });
        console.log(`Level ${levelId} progress saved to Firebase.`);
    } catch (e) {
        console.error("Error saving level progress:", e);
        showToast("Error al guardar progreso en la nube");
    }
}

// --- Core Game Logic ---
function renderInventory(filterText = '') {
    inventoryContainer.innerHTML = '';
    const sortedInventory = Array.from(inventory).sort();

    sortedInventory.forEach(itemName => {
        if (itemName.toLowerCase().includes(filterText.toLowerCase())) {
            const el = document.createElement('div');
            el.className = 'element-card';
            el.innerHTML = `
                <span class="element-emoji">${getEmoji(itemName)}</span>
                <span class="element-name">${itemName}</span>
            `;
            el.dataset.name = itemName;
            el.addEventListener('mousedown', (e) => startDragFromSidebar(e, itemName));
            inventoryContainer.appendChild(el);
        }
    });
}

function getEmoji(name) {
    return emojiMap[name] || '⬜';
}

function setupGlobalListeners() {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    searchBar.addEventListener('input', (e) => {
        renderInventory(e.target.value);
    });

    clearBtn.addEventListener('click', () => {
        playSound('instance');
        clearWorkspace();
    });
    resetBtn.addEventListener('click', () => {
        playSound('instance');
        resetAll();
    });
}

function startDragFromSidebar(e, name) {
    if (e.button !== 0) return;
    e.preventDefault();
    playSound('instance');
    const workspaceRect = workspace.getBoundingClientRect();
    const x = e.clientX - workspaceRect.left;
    const y = e.clientY - workspaceRect.top;
    const instance = spawnElement(name, x, y);
    startDragWorkspaceElement(e, instance, true);
}

function startDragWorkspaceElement(e, element, fromSidebar = false) {
    if (!fromSidebar) {
        playSound('instance');
    }
    isDragging = true;
    draggedElement = element;
    const rect = element.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    if (fromSidebar) {
        const elWidth = rect.width || 100;
        const elHeight = rect.height || 40;
        dragOffsetX = elWidth / 2;
        dragOffsetY = elHeight / 2;
        const workspaceRect = workspace.getBoundingClientRect();
        element.style.left = `${e.clientX - workspaceRect.left - dragOffsetX}px`;
        element.style.top = `${e.clientY - workspaceRect.top - dragOffsetY}px`;
    }
    element.classList.add('dragging');
    element.style.zIndex = ++zIndexCounter;
}

function onMouseMove(e) {
    if (!isDragging || !draggedElement) return;
    const workspaceRect = workspace.getBoundingClientRect();
    let newX = e.clientX - workspaceRect.left - dragOffsetX;
    let newY = e.clientY - workspaceRect.top - dragOffsetY;
    draggedElement.style.left = `${newX}px`;
    draggedElement.style.top = `${newY}px`;
}

function onMouseUp(e) {
    if (!isDragging || !draggedElement) return;
    draggedElement.classList.remove('dragging');
    const sidebar = document.querySelector('.sidebar');
    const sbRect = sidebar.getBoundingClientRect();
    if (e.clientX >= sbRect.left && e.clientX <= sbRect.right &&
        e.clientY >= sbRect.top && e.clientY <= sbRect.bottom) {
        playSound('delete');
        removeElement(draggedElement);
        isDragging = false;
        draggedElement = null;
        return;
    }
    checkForMerge(draggedElement);
    isDragging = false;
    draggedElement = null;
}

function spawnElement(name, x, y) {
    const el = document.createElement('div');
    el.className = 'element-card element-instance';
    el.innerHTML = `
        <span class="element-emoji">${getEmoji(name)}</span>
        <span class="element-name">${name}</span>
    `;
    el.dataset.name = name;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startDragWorkspaceElement(e, el);
    });
    el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const rect = el.getBoundingClientRect();
        const workspaceRect = workspace.getBoundingClientRect();
        const x = rect.left - workspaceRect.left + 20;
        const y = rect.top - workspaceRect.top + 20;
        const newEl = spawnElement(name, x, y);

        // Slight randomness to prevent perfect stacking if clicked multiple times
        newEl.style.left = `${x + Math.random() * 10 - 5}px`;
        newEl.style.top = `${y + Math.random() * 10 - 5}px`;

        playSound('instance');
    });
    workspace.appendChild(el);
    workspaceElements.push(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
        el.style.left = `${x - rect.width / 2}px`;
        el.style.top = `${y - rect.height / 2}px`;
    }
    return el;
}

async function checkForMerge(activeElement) {
    const activeRect = activeElement.getBoundingClientRect();
    for (let i = workspaceElements.length - 1; i >= 0; i--) {
        const otherElement = workspaceElements[i];
        if (otherElement === activeElement) continue;
        const otherRect = otherElement.getBoundingClientRect();
        if (isColliding(activeRect, otherRect)) {
            const name1 = activeElement.dataset.name;
            const name2 = otherElement.dataset.name;

            // Visual feedback processing
            activeElement.style.opacity = '0.8';
            otherElement.style.opacity = '0.8';

            const resultData = await getRecipeResult(name1, name2);

            const result = resultData ? resultData.result : null;
            if (result && result !== "Nada") {
                // ANIMATION: Shrink inputs
                activeElement.classList.add('merging');
                otherElement.classList.add('merging');

                const centerX = (activeRect.left + activeRect.width / 2 + otherRect.left + otherRect.width / 2) / 2;
                const centerY = (activeRect.top + activeRect.height / 2 + otherRect.top + otherRect.height / 2) / 2;

                // Wait for shrink to finish before spawning
                setTimeout(async () => {
                    removeElement(activeElement);
                    removeElement(otherElement);

                    const newEl = spawnElement(result, centerX, centerY);
                    newEl.classList.add('spawn-animation'); // New grow animation
                    // Removed 'new-discovery' class as requested

                    if (!inventory.has(result)) {
                        inventory.add(result);
                        renderInventory(searchBar.value);
                        playSound('discovery');
                        saveNewDiscovery(result, getEmoji(result));

                        // Global Discovery Check
                        const isGlobalFirst = await checkGlobalDiscovery(result);
                        if (isGlobalFirst) {
                            showToast(`🏆 ¡PRIMER DESCUBRIMIENTO MUNDIAL!: ${result} 🏆`);
                        } else {
                            showToast(`Descubierto: ${result} ${getEmoji(result)}`);
                        }
                    } else {
                        playSound('reward');
                    }

                    // CHECK CHALLENGE WIN CONDITION
                    if (currentGameMode !== 'sandbox' && currentTarget) {
                        if (result.toLowerCase() === currentTarget.target.toLowerCase()) {
                            playSound('reward'); // Or win sound
                            showToast(`🎉 ¡NIVEL COMPLETADO! 🎉`);

                            // Visual Celebration
                            const winEl = document.createElement('div');
                            winEl.style.position = 'fixed';
                            winEl.style.top = '50%';
                            winEl.style.left = '50%';
                            winEl.style.transform = 'translate(-50%, -50%)';
                            winEl.style.fontSize = '5rem';
                            winEl.textContent = '🏆';
                            winEl.style.zIndex = '3000';
                            winEl.className = 'spawn-animation';
                            document.body.appendChild(winEl);
                            setTimeout(() => winEl.remove(), 2000);

                            if (currentGameMode === 'level') {
                                completedLevels.add(currentTarget.id);
                                saveLevelComplete(currentTarget.id);
                                setTimeout(() => {
                                    showMainMenu();
                                    levelsModal.classList.add('active'); // Go back to level select
                                    menuButtons.classList.add('hidden');
                                    renderLevelsGrid();
                                }, 2000);
                            }
                        }
                    }
                }, 150); // 150ms matches CSS animation

                break;
            } else {
                activeElement.style.opacity = '1';
                otherElement.style.opacity = '1';
                playSound('error');
                showToast("¡No se pueden combinar!");
            }
        }
    }
}

async function checkGlobalDiscovery(elementName) {
    // Only check global discoveries in Sandbox mode
    if (currentGameMode !== 'sandbox') return false;

    if (!currentUser) return false;
    try {
        const docRef = doc(db, "discoveries", elementName);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                discoveredBy: currentUser.displayName || "Anónimo",
                createdAt: new Date().toISOString()
            });
            return true;
        }
    } catch (e) {
        console.error("Error checking global discovery:", e);
    }
    return false;
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

async function getRecipeResult(a, b) {
    // 1. Check Local Cache (Both permutations)
    const key1 = `${a}+${b}`;
    const key2 = `${b}+${a}`;
    if (recipes[key1]) return { result: recipes[key1], emoji: emojiMap[recipes[key1]] };
    if (recipes[key2]) return { result: recipes[key2], emoji: emojiMap[recipes[key2]] };

    // 2. Check Firestore (Global Recipe Cache)
    const sortedKey = [a, b].sort().join('+');
    try {
        const docRef = doc(db, "recipes", sortedKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Update Local
            recipes[sortedKey] = data.result;
            emojiMap[data.result] = data.emoji;
            return { result: data.result, emoji: data.emoji };
        }
    } catch (e) {
        console.error("DB Recipe Error:", e);
    }

    // 3. AI Generation
    const apiResult = await fetchMistralCombination(a, b);

    if (apiResult) {
        // Identity Check: If result is same as one of the inputs -> Fail
        if (apiResult.result.toLowerCase() === a.toLowerCase() ||
            apiResult.result.toLowerCase() === b.toLowerCase()) {
            return null; // Triggers error in checkForMerge
        }

        // Save to Global Cache
        try {
            await setDoc(doc(db, "recipes", sortedKey), {
                result: apiResult.result,
                emoji: apiResult.emoji,
                createdAt: new Date().toISOString()
            });
            // Update Local Cache
            recipes[sortedKey] = apiResult.result;
            emojiMap[apiResult.result] = apiResult.emoji;
        } catch (e) {
            console.error("DB Save Recipe Error:", e);
        }
        return apiResult;
    }

    return null;
}

async function fetchMistralCombination(a, b) {
    showToast(`Combinando ${a} + ${b}...`);
    const prompt = `Crea un concepto REALISTA y CON SENTIDO que podría existir físicamente o como objeto/efecto concreto.

El resultado debe:
- Relacionarse claramente con AMBOS elementos
- NO ser abstracto ni etéreo (evita conceptos vagos como 'niebla', 'esencia', etc.)
- NO combinar ni concatenar las palabras
- NO reutilizar las palabras originales ni sus raíces
- Usar el emoji que más represente la palabra resultante

Entradas:
A: "${a}"
B: "${b}"

Piensa en:
- Propiedades compartidas (función, estado, efecto, material, rol)
- Fenómenos físicos, objetos o procesos que existen en el mundo real

Devuelve SOLO JSON válido:
{
  "result": "Sustantivo único, realista, en Title Case",
  "emoji": "Un solo emoji representativo"
}

Ejemplos:
Fuego + Agua → {"result":"Vapor","emoji":"💨"}
Frío + Electricidad → {"result":"Congelación","emoji":"❄️"}
Fuego + Metal → {"result":"Forja","emoji":"🔥"}
Tierra + Agua → {"result":"Lodo","emoji":"🟫"}

Si el resultado no se relaciona claramente con AMBOS elementos, debes rehacerlo internamente antes de responder.
`;

    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "mistral-medium-latest",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                random_seed: 1
            })
        });

        if (!response.ok) throw new Error("API Error");

        const data = await response.json();
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Return parsed object - side effects handled in getRecipeResult now
        if (parsed.result && parsed.emoji) {
            return parsed;
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

function removeElement(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        workspaceElements = workspaceElements.filter(e => e !== el);
    }
}

function clearWorkspace() {
    playSound('delete');
    workspaceElements.forEach(el => el.remove());
    workspaceElements = [];
}

function resetAll() {
    if (confirm("¿Reiniciar todo?")) {
        playSound('delete');
        inventory = new Set([...startingElements]);
        renderInventory();
        clearWorkspace();
    }
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

init();
