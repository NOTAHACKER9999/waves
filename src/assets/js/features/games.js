document.addEventListener('DOMContentLoaded', () => {
    const gamesMenu = document.getElementById('games-menu');
    if (!gamesMenu) return;

    // 🔹 Use your real JSON file here
    const ZONES_URL = "https://raw.githubusercontent.com/NOTAHACKER9999/Hypper-Drive/main/Games/zones.json";

    const gamesMenuContent = gamesMenu.querySelector('.games-menu-content');
    const closeGamesMenuBtn = document.getElementById('close-games-menu');
    const gamesSearchInput = document.getElementById('gamesSearchInput');
    const gamesGrid = gamesMenu.querySelector('.games-grid');
    const gamesGridContainer = gamesMenu.querySelector('.games-grid-container');
    const gamesLink = document.getElementById('games');
    const shortcutPromptOverlay = document.getElementById('overlay');
    const gamesCredits = gamesMenu.querySelector('.games-credits');

    let allGames = [];
    let filteredGames = [];
    let isMenuTransitioning = false;
    let gamesDataLoaded = false;
    let gameDataPromise = null;
    let debounceTimer = null;

    // Fetch Hypper-Drive JSON
    function getGameData() {
        if (!gameDataPromise) {
            gameDataPromise = fetch(ZONES_URL, { cache: "no-store" })
                .then(res => {
                    if (!res.ok) throw new Error(`Network error: ${res.statusText}`);
                    return res.json();
                })
                .then(data => {
                    allGames = data.map(g => ({
                        id: g.name.replace(/\s+/g, "_").toLowerCase(),
                        name: g.name,
                        author: g.author || "Unknown",
                        description: g.description || "No description",
                        coverUrl: g.cover,
                        gameUrl: g.url,
                        isExternal: g.url.startsWith("http"),
                    }));

                    gamesDataLoaded = true;
                    updateGamesPlaceholder();
                    return allGames;
                })
                .catch(err => {
                    console.error("❌ Failed to load games:", err);
                    gameDataPromise = null;
                    throw err;
                });
        }
        return gameDataPromise;
    }

    // Show menu overlay
    function showGamesMenu() {
        if (isMenuTransitioning || gamesMenu.classList.contains('open')) return;
        isMenuTransitioning = true;

        if (shortcutPromptOverlay) shortcutPromptOverlay.classList.add('show');
        gamesMenu.style.display = 'flex';
        gamesMenu.classList.add('open');
        gamesMenuContent.classList.add('open');

        gamesMenuContent.addEventListener('animationend', function onEnd() {
            gamesMenuContent.removeEventListener('animationend', onEnd);
            isMenuTransitioning = false;
        });

        if (gamesSearchInput) {
            gamesSearchInput.value = '';
            gamesSearchInput.focus();
        }

        gamesGrid.innerHTML = '';
        filteredGames = [];

        if (gamesDataLoaded) {
            resetAndRenderGames();
        } else {
            getGameData().then(resetAndRenderGames)
                         .catch(() => alert("Error loading games"));
        }
    }

    function hideGamesMenu() {
        if (isMenuTransitioning || !gamesMenu.classList.contains('open')) return;
        isMenuTransitioning = true;

        gamesMenuContent.classList.remove('open');
        gamesMenuContent.classList.add('close');
        shortcutPromptOverlay?.classList.remove('show');

        gamesMenuContent.addEventListener('animationend', function onHide() {
            gamesMenuContent.removeEventListener('animationend', onHide);
            gamesMenu.classList.remove('open');
            gamesMenu.style.display = 'none';
            isMenuTransitioning = false;
        });
    }

    // Create card
    function createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameUrl = game.gameUrl;

        card.innerHTML = `
            <div class="game-image">
                <img src="${game.coverUrl}" alt="${game.name} Cover">
            </div>
            <div class="game-info">
                <h2>${game.name}</h2>
                <p>${game.description}</p>
            </div>
        `;
        return card;
    }

    // Re-render
    function resetAndRenderGames() {
        const query = gamesSearchInput?.value.toLowerCase().trim() || "";
        filteredGames = query
            ? allGames.filter(g => g.name.toLowerCase().includes(query))
            : allGames;

        gamesGrid.innerHTML = '';
        if (filteredGames.length) {
            const fragment = document.createDocumentFragment();
            filteredGames.forEach(game => fragment.appendChild(createGameCard(game)));
            gamesGrid.appendChild(fragment);
            gamesGridContainer.style.display = 'grid';
        } else {
            gamesGridContainer.style.display = 'none';
        }
    }

    function updateGamesPlaceholder() {
        if (gamesSearchInput)
            gamesSearchInput.placeholder = `Search ${allGames.length} games...`;
    }

    function debouncedRenderGames() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(resetAndRenderGames, 200);
    }

    // Handle click → execute HTML fully
    gamesGrid.addEventListener('click', async (e) => {
        const card = e.target.closest('.game-card');
        if (!card) return;
        const url = card.dataset.gameUrl;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to load game HTML");
            const html = await res.text();
            document.open();
            document.write(html);
            document.close();
        } catch (err) {
            alert("Error loading game: " + err.message);
        }
    });

    // Event bindings
    if (gamesSearchInput) gamesSearchInput.addEventListener('input', debouncedRenderGames);
    if (gamesLink) gamesLink.addEventListener('click', e => { e.preventDefault(); showGamesMenu(); });
    if (closeGamesMenuBtn) closeGamesMenuBtn.addEventListener('click', hideGamesMenu);
    gamesMenu.addEventListener('click', e => { if (e.target === gamesMenu) hideGamesMenu(); });

    window.showGamesMenu = showGamesMenu;
    window.hideGamesMenu = hideGamesMenu;

    getGameData();
});
