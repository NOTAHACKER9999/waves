const GAMES_JSON = "https://raw.githubusercontent.com/NOTAHACKER9999/Hypper-Drive/main/Games/zones.json";
const FALLBACK = "https://dummyimage.com/300x450/111/ff0000&text=No+Image";

let allGames = [];
let recentGames = JSON.parse(localStorage.getItem("recentGames") || "[]");

/* DOM */
const contentArea = document.getElementById("contentArea");
const libraryTopbar = document.getElementById("libraryTopbar");
const gamesTab = document.getElementById("gamesTab");

/* HELPERS */
function saveRecents() {
    localStorage.setItem("recentGames", JSON.stringify(recentGames));
}
function addRecentGame(g) {
    recentGames = [g, ...recentGames.filter(x => x.url !== g.url)].slice(0, 10);
    saveRecents();
}
function el(t, p = {}, ...kids) {
    const e = document.createElement(t);
    Object.assign(e, p);
    kids.forEach(k => typeof k === "string" ? e.appendChild(document.createTextNode(k)) : k && e.appendChild(k));
    return e;
}

/* DASHBOARD (Recent Games only) */
function renderDashboard() {
    libraryTopbar.style.display = "none";
    contentArea.innerHTML = "";

    contentArea.appendChild(el('h1', {}, 'System Crash — Dashboard'));

    // Recent games
    contentArea.appendChild(el('div', { className: 'section-title' }, 'Recent Games'));
    const gGrid = el('div', { className: 'grid' });
    if (recentGames.length === 0) gGrid.appendChild(el('div', { className: 'muted' }, 'No recent games'));
    recentGames.forEach(g => {
        const card = el('div', { className: 'card', onclick: () => openGame(g) });
        card.appendChild(el('img', { src: g.cover || FALLBACK }));
        card.appendChild(el('h3', {}, g.name));
        gGrid.appendChild(card);
    });
    contentArea.appendChild(gGrid);
}

/* GAMES LIBRARY */
async function renderGamesLibrary() {
    libraryTopbar.style.display = "flex";
    gamesTab.classList.add("active");
    contentArea.innerHTML = "";

    // Search input
    const searchRow = el('div', { className: 'search-row' });
    const input = el('input', { placeholder: 'Search games...', oninput: filterGames, id: 'gamesSearch' });
    const count = el('div', { className: 'count', id: 'gamesCount' });
    searchRow.appendChild(input);
    searchRow.appendChild(count);
    contentArea.appendChild(searchRow);

    // Games grid
    const grid = el('div', { className: 'grid', id: 'gamesGrid' });
    contentArea.appendChild(grid);

    if (allGames.length === 0) {
        try {
            const r = await fetch(GAMES_JSON);
            const raw = await r.json();
            allGames = raw.map(g => ({ name: g.name, cover: g.cover, url: g.url }));
        } catch (e) {
            grid.appendChild(el('div', { className: 'muted' }, 'Failed to load games'));
        }
    }

    filterGames();

    function filterGames() {
        const q = document.getElementById('gamesSearch').value.toLowerCase();
        const filtered = allGames.filter(g => g.name.toLowerCase().includes(q));
        const gGrid = document.getElementById('gamesGrid');
        gGrid.innerHTML = "";
        filtered.forEach(g => {
            const c = el('div', { className: 'card', onclick: () => openGame(g) });
            c.appendChild(el('img', { src: g.cover || FALLBACK }));
            c.appendChild(el('h3', {}, g.name));
            gGrid.appendChild(c);
        });
        count.textContent = `${filtered.length} Games Found`;
    }
}

/* OPEN GAME AS FULL FILE */
async function openGame(game) {
    if (!game.url) {
        alert("No game URL");
        return;
    }
    addRecentGame(game);

    try {
        const r = await fetch(game.url);
        const html = await r.text();

        // Run HTML directly
        document.open();
        document.write(html);
        document.close();

    } catch (e) {
        alert("Failed to load game");
    }
}

/* TAB HANDLERS */
gamesTab.onclick = () => renderGamesLibrary();

/* INITIAL RENDER */
renderDashboard();
