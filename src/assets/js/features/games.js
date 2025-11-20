document.addEventListener('DOMContentLoaded', () => {
    const gamesMenu = document.getElementById('games-menu');
    if (!gamesMenu) return;

    const ZONES_URL = "https://cdn.jsdelivr.net/gh/NOTAHACKER9999/Hypper-Drive@refs/heads/main/Games/zones.json";

    const gamesMenuContent = gamesMenu.querySelector('.games-menu-content');
    const closeGamesMenuBtn = document.getElementById('close-games-menu');
    const gamesSearchInput = document.getElementById('gamesSearchInput');
    const gamesGrid = gamesMenu.querySelector('.games-grid');
    const gamesGridContainer = gamesMenu.querySelector('.games-grid-container');
    const gamesLink = document.getElementById('games');
    const shortcutPromptOverlay = document.getElementById('overlay');

    let allGames = [];
    let filteredGames = [];
    let gamesDataLoaded = false;
    let debounceTimer = null;
    let loadingPromise = null;

    // 🔹 Fetch JSON once
    function getGameData() {
        if (!loadingPromise) {
            loadingPromise = fetch(ZONES_URL, { cache: "no-store" })
                .then(res => {
                    if (!res.ok) throw new Error("Failed to load JSON");
                    return res.json();
                })
                .then(data => {
                    allGames = data.map(g => ({
                        id: g.name.replace(/\s+/g, "_").toLowerCase(),
                        name: g.name,
                        author: g.author || "Unknown",
                        description: g.description || "",
                        coverUrl: g.cover,
                        url: g.url,
                    }));
                    gamesDataLoaded = true;
                    updateGamesPlaceholder();
                    return allGames;
                })
                .catch(err => {
                    console.error("Error loading zones.json:", err);
                    loadingPromise = null;
                    throw err;
                });
        }
        return loadingPromise;
    }

    // 🔹 Show menu
    function showGamesMenu() {
        if (!gamesDataLoaded) {
            getGameData().then(() => {
                showMenuAfterLoad();
                resetAndRenderGames();
            });
        } else {
            showMenuAfterLoad();
            resetAndRenderGames();
        }
    }

    function showMenuAfterLoad() {
        gamesMenu.style.display = 'flex';
        gamesMenu.classList.add('open');
        gamesMenuContent.classList.add('open');
        shortcutPromptOverlay?.classList.add('show');

        if (gamesSearchInput) {
            gamesSearchInput.value = '';
            gamesSearchInput.focus();
        }
    }

    function hideGamesMenu() {
        gamesMenu.classList.remove('open');
        gamesMenuContent.classList.remove('open');
        gamesMenu.style.display = 'none';
        shortcutPromptOverlay?.classList.remove('show');
    }

    // 🔹 Create a game card
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.url = game.url;

        card.innerHTML = `
            <div class="game-image">
                <img src="${game.coverUrl}" alt="${game.name}">
            </div>
            <div class="game-info">
                <h2>${game.name}</h2>
                <p>${game.description}</p>
            </div>
        `;

        return card;
    }

    // 🔹 Render grid
    function resetAndRenderGames() {
        const q = gamesSearchInput?.value.toLowerCase().trim() || "";
        filteredGames = q ? allGames.filter(g => g.name.toLowerCase().includes(q)) : allGames;

        gamesGrid.innerHTML = "";

        if (filteredGames.length === 0) {
            gamesGridContainer.style.display = "none";
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredGames.forEach(game => fragment.appendChild(createGameCard(game)));
        gamesGrid.appendChild(fragment);

        gamesGridContainer.style.display = "grid";
    }

    function updateGamesPlaceholder() {
        if (gamesSearchInput)
            gamesSearchInput.placeholder = `Search ${allGames.length} games...`;
    }

    function debouncedRenderGames() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(resetAndRenderGames, 200);
    }

    // ✅ **THIS loads the game as a full file — NO BLOB, NO IFRAME**
    async function openGameAsFullFile(url) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch game");

            const html = await res.text();

            // 🔥 This replaces the entire page with the game's HTML
            document.open();
            document.write(html);
            document.close();

        } catch (err) {
            alert("Error loading game: " + err.message);
        }
    }

    // 🔹 Click → load game
    gamesGrid.addEventListener('click', e => {
        const card = e.target.closest('.game-card');
        if (!card) return;

        const url = card.dataset.url;
        if (!url) return;

        openGameAsFullFile(url);
    });

    // 🔹 Bind events
    if (gamesSearchInput) gamesSearchInput.addEventListener('input', debouncedRenderGames);
    if (gamesLink) gamesLink.addEventListener('click', e => { e.preventDefault(); showGamesMenu(); });
    if (closeGamesMenuBtn) closeGamesMenuBtn.addEventListener('click', hideGamesMenu);
    gamesMenu.addEventListener('click', e => { if (e.target === gamesMenu) hideGamesMenu(); });

    // Load data on startup
    getGameData();
});
