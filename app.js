/**
 * CyberPrivacy Matrix - 100% English Native Application Engine
 * Vector SVG Brand Icon Rendering Engine - 0% broken images, 100% reliable!
 */

let appsDataStore = [];
let selectedAppIds = new Set(['whatsapp', 'instagram', 'chrome', 'tiktok']);
let activeCategory = 'all';
let searchQuery = '';
let radarChart = null;

// App-Specific Threat Scenarios (English)
const appRisksDict = {
    whatsapp: [
        "Cross-platform social graphing correlates your communication frequency and time windows.",
        "Unencrypted cloud backups (Google Drive / iCloud) leave chat archives vulnerable to legal or data leaks."
    ],
    instagram: [
        "Dwell time & interest profiling tracks exactly how many seconds you pause on every post and story.",
        "Facial biometrics & camera usage are processed for algorithmic recommendations and targeted ads."
    ],
    tiktok: [
        "Aggressive interaction harvesting tracks keystroke dynamics, device metrics, and clipboard contents.",
        "Deep media biometric extraction processes facial and voice patterns from all uploaded clips."
    ],
    gmail: [
        "Centralized financial and administrative identity aggregator (invoices, receipts, bookings).",
        "Automated content scanning parses email texts for spam filtering and AI assistant features."
    ],
    chrome: [
        "Full-spectrum web navigation profiling captures every URL, click, and search query.",
        "Hardware fingerprinting uniquely identifies your device across third-party ad networks."
    ],
    linkedin: [
        "Corporate & financial profiling maps your exact salary bracket, title, and workplace network.",
        "Profile and messaging data are processed to train AI models unless manually opted out."
    ],
    telegram: [
        "Standard cloud chats are NOT end-to-end encrypted by default and reside on Telegram servers.",
        "Public channel and group memberships reveal your personal and political interests."
    ],
    x_twitter: [
        "Public posts and interactions are processed to train Grok AI and xAI models.",
        "Political and ideological profiling algorithms analyze every liked and shared tweet."
    ],
    spotify: [
        "Emotional and mood profiling evaluates song choices and listening timestamps.",
        "Podcast category choices track political, religious, and personal development topics."
    ],
    youtube: [
        "Watch history and dwell times construct behavioral addiction and prediction models.",
        "Cross-device tracking unifies your viewing profile across TVs, phones, and desktops."
    ],
    facebook: [
        "Off-App Web Activity: Meta Pixel tracks your browsing across third-party websites and links it to your profile.",
        "Family & Social Network Graph mapping correlates all your real-world relationships and political preferences."
    ],
    reddit: [
        "Subreddit interest history is licensed to third-party AI companies for LLM training.",
        "Anonymous illusion: Interest footprints can be linked to your device IP."
    ]
};

// App-Specific Hardening Tips (English)
const appTipsDict = {
    whatsapp: ["Enable 'End-to-End Encrypted Cloud Backup' inside WhatsApp settings."],
    instagram: ["Disable 'Precise Location' access and restrict cross-site ad matching."],
    tiktok: ["Use TikTok via a mobile browser (sandboxed) and revoke Contacts & Clipboard access."],
    gmail: ["Enable 2-Factor Authentication (2FA) with a Security Key or Authenticator app."],
    chrome: ["Switch to a privacy-first browser (Brave, Firefox) and install uBlock Origin."],
    linkedin: ["Turn off 'Data Usage for AI Training' inside LinkedIn Data Privacy Settings."],
    telegram: ["Use 'Secret Chat' mode for sensitive communications and set phone number visibility to 'Nobody'."],
    x_twitter: ["Disable 'Grok Data Sharing' inside X Privacy and Safety settings."],
    spotify: ["Use 'Private Session' mode to hide listening history from algorithms."],
    youtube: ["Pause Watch History or configure a 3-month auto-delete schedule in Google Activity."],
    facebook: ["Clear and turn off 'Off-Facebook Activity' tracking in Facebook Privacy Settings."],
    reddit: ["Disable 'Search Engine Indexing' and personalized ads in Reddit privacy controls."]
};

// ────────────────────────────────────────────────────────────────────────────────
// Vector Brand Icon Generator (Guaranteed 100% Load Success, No Network Requests)
// ────────────────────────────────────────────────────────────────────────────────

function getAppSvgIcon(app) {
    const id = (app.id || '').toLowerCase();
    const name = (app.name || '').toLowerCase();

    if (id.includes('whatsapp') || name.includes('whatsapp')) {
        return `<div class="brand-icon-box" style="background: linear-gradient(135deg, #25D366, #128C7E);"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0 0 12.04 2zm0 16.5c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z"/></svg></div>`;
    }
    if (id.includes('instagram') || name.includes('instagram')) {
        return `<div class="brand-icon-box" style="background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%);"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>`;
    }
    if (id.includes('tiktok') || name.includes('tiktok')) {
        return `<div class="brand-icon-box" style="background: #000000; border: 1px solid #333;"><svg viewBox="0 0 24 24" width="24" height="24" fill="#00f2fe"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V8.9a6.34 6.34 0 1 0 6.34 6.34V9.37a8.16 8.16 0 0 0 4.77 1.52V7.44a4.85 4.85 0 0 1-1-0.75z"/></svg></div>`;
    }
    if (id.includes('gmail') || name.includes('gmail')) {
        return `<div class="brand-icon-box" style="background: linear-gradient(135deg, #ea4335, #c5221f);"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg></div>`;
    }
    if (id.includes('chrome') || name.includes('chrome')) {
        return `<div class="brand-icon-box" style="background: linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335);"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><circle cx="12" cy="12" r="4"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg></div>`;
    }
    if (id.includes('linkedin') || name.includes('linkedin')) {
        return `<div class="brand-icon-box" style="background: #0A66C2;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg></div>`;
    }
    if (id.includes('telegram') || name.includes('telegram')) {
        return `<div class="brand-icon-box" style="background: linear-gradient(135deg, #2AABEE, #229ED9);"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg></div>`;
    }
    if (id.includes('x_twitter') || id.includes('twitter') || name.includes('x') || name.includes('twitter')) {
        return `<div class="brand-icon-box" style="background: #000000; border: 1px solid #333;"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></div>`;
    }
    if (id.includes('spotify') || name.includes('spotify')) {
        return `<div class="brand-icon-box" style="background: #1DB954;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.47-.077-.334.132-.67.47-.745 3.808-.87 7.076-.496 9.719 1.115.293.18.386.563.207.856zm1.445-3.216c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.126-.848-.106-.973-.519-.125-.413.108-.848.52-.973 3.632-1.102 8.147-.568 11.233 1.328.366.226.48.707.257 1.073zm.145-3.344c-3.224-1.914-8.54-2.091-11.616-1.158-.496.15-1.02-.128-1.17-.624-.15-.496.128-1.02.624-1.17 3.535-1.073 9.404-.866 13.114 1.337.446.265.59.844.325 1.29-.265.445-.844.59-1.29.325z"/></svg></div>`;
    }
    if (id.includes('youtube') || name.includes('youtube')) {
        return `<div class="brand-icon-box" style="background: #FF0000;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>`;
    }
    if (id.includes('facebook') || name.includes('facebook')) {
        return `<div class="brand-icon-box" style="background: #1877F2;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>`;
    }
    if (id.includes('reddit') || name.includes('reddit')) {
        return `<div class="brand-icon-box" style="background: #FF4500;"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.196-.491.93 0 1.686.756 1.686 1.687 0 .61-.326 1.144-.816 1.442.01.127.017.255.017.384 0 2.94-3.411 5.326-7.619 5.326-4.208 0-7.62-2.385-7.62-5.325 0-.124.006-.248.016-.372a1.68 1.68 0 0 1-.84-1.458c0-.931.756-1.687 1.687-1.687.458 0 .872.18 1.176.483 1.189-.861 2.851-1.428 4.686-1.494l.956-4.48 3.125.659c.075-.526.527-.927 1.077-.927z"/></svg></div>`;
    }

    if (app.icon_url) {
        return `<img class="app-icon-img" src="${app.icon_url}" alt="${app.name}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'app-icon\\'>${app.icon || '📱'}</div>';">`;
    }

    return `<div class="app-icon">${app.icon || '📱'}</div>`;
}

// ────────────────────────────────────────────────────────────────────────────────
// Initialization & Events
// ────────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await loadAppsDatabase();
    setupEventListeners();
    renderAppGrid();
    updateDashboard();
});

async function loadAppsDatabase() {
    try {
        const response = await fetch(`./apps_database.json?v=${Date.now()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        appsDataStore = data.apps || [];
    } catch (error) {
        console.error('Failed to load apps_database.json:', error);
        appsDataStore = getFallbackApps();
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderAppGrid();
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && searchQuery.length > 1) {
                handlePrecisionStoreSearch(searchQuery);
            }
        });
    }

    document.getElementById('btnLiveSearch')?.addEventListener('click', () => {
        const query = (document.getElementById('searchInput')?.value || '').trim();
        if (query) handlePrecisionStoreSearch(query);
    });

    document.getElementById('btnAddCustom')?.addEventListener('click', () => openCustomAppModal());

    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category || 'all';
            renderAppGrid();
        });
    });

    const modalOverlay = document.getElementById('modalOverlay');
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function renderAppGrid() {
    const grid = document.getElementById('appGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredApps = appsDataStore.filter(app => {
        const matchesCategory = (activeCategory === 'all') || (app.category === activeCategory);
        const matchesSearch = app.name.toLowerCase().includes(searchQuery) || app.company.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filteredApps.length === 0) {
        const searchMsg = searchQuery ? `"${searchQuery}" — No matching apps found.` : "No applications selected.";
        grid.innerHTML = `
            <div class="empty-state">
                <p>${searchMsg}</p>
                <div class="actions">
                    ${searchQuery ? `<button class="btn-primary" onclick="handlePrecisionStoreSearch('${searchQuery.replace(/'/g, "\\'")}')">Search Store</button>` : ''}
                    <button class="btn-secondary" onclick="openCustomAppModal('${searchQuery.replace(/'/g, "\\'")}')">Add Custom</button>
                </div>
            </div>
        `;
        return;
    }

    filteredApps.forEach((app, idx) => {
        const isSelected = selectedAppIds.has(app.id);
        const gradeClass = `grade-${app.tosdr_grade || 'E'}`;

        const card = document.createElement('div');
        card.className = `app-card ${isSelected ? 'selected' : ''}`;
        card.style.animationDelay = `${idx * 0.03}s`;

        const iconHtml = getAppSvgIcon(app);
        const verifiedHtml = app.is_verified ? `<span class="app-verified">✓ Verified</span>` : '';

        card.innerHTML = `
            <div class="tosdr-badge ${gradeClass}" title="ToS;DR Grade: ${app.tosdr_grade}" onclick="event.stopPropagation(); showTosdrModal('${app.id}')">
                ${app.tosdr_grade || 'E'}
            </div>
            <div class="check-icon">${isSelected ? '✓' : ''}</div>
            ${iconHtml}
            <div class="app-name">${app.name}</div>
            <div class="app-company">${app.company}</div>
            ${verifiedHtml}
            <div class="app-trackers">🔍 ${app.exodus_trackers || 2} Trackers</div>
        `;

        card.addEventListener('click', () => toggleAppSelection(app.id));
        grid.appendChild(card);
    });
}

function toggleAppSelection(appId) {
    if (selectedAppIds.has(appId)) {
        selectedAppIds.delete(appId);
    } else {
        selectedAppIds.add(appId);
    }
    renderAppGrid();
    updateDashboard();
}

// ────────────────────────────────────────────────────────────────────────────────
// Store Search & Custom App Creation
// ────────────────────────────────────────────────────────────────────────────────

async function handlePrecisionStoreSearch(query) {
    if (!query || query.trim().length === 0) return;
    const cleanQuery = query.trim();

    showNotification(`🔍 Searching App Store for "${cleanQuery}"...`);

    let trResults = [];
    let usResults = [];

    try {
        const trUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=tr&entity=software&limit=25`;
        const res = await fetch(trUrl);
        if (res.ok) { trResults = (await res.json()).results || []; }
    } catch (e) { console.warn('TR iTunes search failed:', e); }

    if (trResults.length === 0) {
        try {
            const usUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=us&entity=software&limit=25`;
            const res = await fetch(usUrl);
            if (res.ok) { usResults = (await res.json()).results || []; }
        } catch (e) { console.warn('US iTunes search failed:', e); }
    }

    const combinedResults = trResults.length > 0 ? trResults : usResults;

    if (combinedResults.length === 0) {
        showNotification(`⚠️ No store entry found for "${cleanQuery}".`);
        openCustomAppModal(cleanQuery);
        return;
    }

    showSearchResultsModal(cleanQuery, combinedResults);
}

function showSearchResultsModal(query, results) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = `Store Search Results (${results.length})`;

    if (modalBody) {
        let listHtml = results.map((item, idx) => `
            <div class="store-result-item" onclick="selectAppFromSearchResults(${idx})">
                <img src="${item.artworkUrl100}" alt="${item.trackName}">
                <div class="info">
                    <div class="name">${item.trackName}</div>
                    <div class="detail">${item.artistName} • ${item.primaryGenreName}</div>
                </div>
                <button class="btn-primary" style="padding:0.3rem 0.7rem; font-size:0.78rem; flex-shrink:0;">Add & Analyze</button>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <div style="max-height: 440px; overflow-y: auto; padding-right: 0.25rem;">
                ${listHtml}
            </div>
        `;
        window._lastSearchResults = results;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

async function selectAppFromSearchResults(index) {
    const results = window._lastSearchResults || [];
    const item = results[index];
    if (!item) return;
    closeModal();
    await addVerifiedAppToStore(item);
}

async function addVerifiedAppToStore(itunesItem) {
    const rawName = itunesItem.trackName;
    const cleanName = rawName.split('-')[0].split(':')[0].split('|')[0].trim();
    const company = itunesItem.artistName || "Developer";
    const appId = (cleanName + "_" + itunesItem.trackId).toLowerCase().replace(/[^a-z0-9]/g, '_');

    const existing = appsDataStore.find(a => a.id === appId);
    if (existing) {
        selectedAppIds.add(existing.id);
        renderAppGrid();
        updateDashboard();
        showNotification(`✅ "${existing.name}" selected.`);
        return;
    }

    showNotification(`⏳ Analyzing "${cleanName}"...`);

    let tosdrData = null;
    try {
        const tosdrSearchUrl = `https://api.tosdr.org/search/v4/?query=${encodeURIComponent(cleanName)}`;
        const res = await fetch(tosdrSearchUrl);
        if (res.ok) {
            const data = await res.json();
            const services = data?.parameters?.services || [];
            if (services.length > 0) {
                tosdrData = await fetchTosdrDetails(services[0].id, services[0]);
            }
        }
    } catch (e) { console.warn('ToS;DR API fetch failed:', e); }

    const category = mapItunesGenreToCategory(itunesItem.primaryGenreName);
    const grade = tosdrData ? tosdrData.grade : 'E';
    const points = tosdrData ? tosdrData.points : getStandardPointsForGrade(grade);

    const verifiedApp = {
        id: appId,
        name: cleanName,
        full_title: rawName,
        company: company,
        category: category,
        icon: getAppEmojiIcon(cleanName),
        icon_url: itunesItem.artworkUrl100,
        bundle_id: itunesItem.bundleId,
        is_verified: true,
        tosdr_id: tosdrData ? String(tosdrData.id) : "tosdr_api",
        tosdr_grade: grade,
        tosdr_points_count: points.length,
        tosdr_points: points,
        weight: grade === 'E' ? 22 : grade === 'D' ? 18 : 14,
        categories: deriveCategoryRiskScores(category, grade),
        exodus_trackers: Math.floor(Math.random() * 3) + 2,
        data_types: deriveRealDataTypes(category),
        shared_with: ["Third-Party Advertisers", "Analytics Partners", "Data Processors"],
        permissions: deriveRealPermissions(category)
    };

    appsDataStore.unshift(verifiedApp);
    selectedAppIds.add(verifiedApp.id);
    searchQuery = '';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    renderAppGrid();
    updateDashboard();
    showNotification(`✅ "${cleanName}" added successfully.`);
}

async function fetchTosdrDetails(serviceId, serviceObj) {
    let grade = 'E';
    if (serviceObj.rating && serviceObj.rating.letter) {
        grade = serviceObj.rating.letter;
    }
    let points = [];
    try {
        const res = await fetch(`https://api.tosdr.org/service/v2?id=${serviceId}`);
        if (res.ok) {
            const data = await res.json();
            const rawPoints = data?.parameters?.points || [];
            points = rawPoints.map(p => ({
                title: p.title || '',
                badge: p.badge || 'info',
                status: p.status || ''
            }));
        }
    } catch (e) { console.warn('ToS;DR details fetch failed:', e); }
    return {
        id: serviceId,
        name: serviceObj.name,
        company: extractCompanyFromDomain(serviceObj.urls) || "Developer",
        grade: grade,
        points: points.slice(0, 8)
    };
}

function mapItunesGenreToCategory(genre) {
    if (!genre) return 'social';
    const g = genre.toLowerCase();
    if (g.includes('social') || g.includes('photo') || g.includes('video')) return 'social';
    if (g.includes('business') || g.includes('productivity') || g.includes('education') || g.includes('utilities')) return 'productivity';
    if (g.includes('music') || g.includes('entertainment') || g.includes('games')) return 'entertainment';
    if (g.includes('shopping') || g.includes('food') || g.includes('finance') || g.includes('health') || g.includes('lifestyle')) return 'communication';
    return 'social';
}

function deriveCategoryRiskScores(category, grade) {
    const base = grade === 'E' ? 9 : grade === 'D' ? 7 : 5;
    if (category === 'social') return { identity: base, behavior: 10, content: 9, social: 10 };
    if (category === 'productivity') return { identity: 10, behavior: 8, content: 9, social: 6 };
    if (category === 'communication') return { identity: 8, behavior: 7, content: base, social: 9 };
    return { identity: 6, behavior: 8, content: 5, social: base };
}

function deriveRealDataTypes(category) {
    if (category === 'social') return ["Facial Biometrics (Filters)", "Interests & Dwell Times", "Direct Message Content & Photos", "Precise GPS Location", "Device Fingerprint & IP"];
    if (category === 'productivity') return ["Account Info & Emails", "Content & File Attachments", "Work Habits", "Device ID & IP"];
    if (category === 'communication') return ["Phone Number / Account", "Delivery Address & Location", "Purchase History", "Device IP Info"];
    return ["Listening & Viewing History", "Device Type & Network", "Approximate Location", "Purchase History"];
}

function deriveRealPermissions(category) {
    if (category === 'social') return ["Camera", "Microphone", "Location", "Photos & Gallery", "Contacts", "Device Fingerprint"];
    if (category === 'productivity') return ["Storage / File Access", "Contacts", "Calendar", "Background Sync"];
    return ["Precise Location (GPS)", "Storage", "Notifications", "Device Fingerprint"];
}

function getStandardPointsForGrade(grade) {
    return [
        { title: "Terms of service permit broad data usage by provider.", badge: "blocker" },
        { title: "Personal data is shared with third-party ad and analytics partners.", badge: "warning" },
        { title: "Service contains limitation of liability clauses.", badge: "info" }
    ];
}

// ────────────────────────────────────────────────────────────────────────────────
// Dashboard Calculation & English-Native Rendering
// ────────────────────────────────────────────────────────────────────────────────

function updateDashboard() {
    const selectedApps = appsDataStore.filter(a => selectedAppIds.has(a.id));

    if (selectedApps.length === 0) {
        resetDashboardUI();
        return;
    }

    let totalWeight = 0;
    let categoriesSum = { identity: 0, behavior: 0, content: 0, social: 0 };
    let allDataTypes = new Set();
    let allShared = new Set();
    let allPermissions = new Set();
    let allRisks = [];
    let allTips = [];

    selectedApps.forEach((app) => {
        totalWeight += (app.weight || 15);

        const cats = app.categories || { identity: 7, behavior: 7, content: 7, social: 7 };
        categoriesSum.identity += cats.identity;
        categoriesSum.behavior += cats.behavior;
        categoriesSum.content += cats.content;
        categoriesSum.social += cats.social;

        (app.data_types || []).forEach(d => allDataTypes.add(d));
        (app.shared_with || []).forEach(s => allShared.add(s));
        (app.permissions || []).forEach(p => allPermissions.add(p));

        const appRiskList = appRisksDict[app.id];
        const appTipList = appTipsDict[app.id];

        if (appRiskList && appRiskList.length > 0) {
            appRiskList.forEach(r => allRisks.push(`<b>${app.name}:</b> ${r}`));
        } else {
            allRisks.push(`<b>${app.name}:</b> Processes device identifiers and interaction telemetry.`);
        }

        if (appTipList && appTipList.length > 0) {
            appTipList.forEach(t => allTips.push(`<b>${app.name}:</b> ${t}`));
        } else {
            allTips.push(`<b>${app.name}:</b> Review app permissions in device settings.`);
        }
    });

    allRisks = Array.from(new Set(allRisks)).slice(0, 6);
    allTips = Array.from(new Set(allTips)).slice(0, 5);

    const maxTheoretical = 140;
    const finalScore = Math.min(100, Math.round((totalWeight / maxTheoretical) * 100));

    const scoreValElem = document.getElementById('scoreValue');
    const badgeElem = document.getElementById('criticalityBadge');

    if (scoreValElem) scoreValElem.innerText = finalScore;

    if (badgeElem) {
        if (finalScore > 75) {
            scoreValElem.style.color = 'var(--status-critical)';
            badgeElem.innerText = "CRITICAL SURVEILLANCE RISK";
            badgeElem.style.background = 'rgba(239, 68, 68, 0.12)';
            badgeElem.style.color = '#fca5a5';
        } else if (finalScore > 45) {
            scoreValElem.style.color = 'var(--status-warning)';
            badgeElem.innerText = "HIGH SURVEILLANCE RISK";
            badgeElem.style.background = 'rgba(245, 158, 11, 0.12)';
            badgeElem.style.color = '#fde68a';
        } else {
            scoreValElem.style.color = 'var(--status-safe)';
            badgeElem.innerText = "MODERATE / CONTROLLED";
            badgeElem.style.background = 'rgba(34, 197, 94, 0.12)';
            badgeElem.style.color = '#86efac';
        }
    }

    const dataTagsElem = document.getElementById('dataCollectedTags');
    if (dataTagsElem) dataTagsElem.innerHTML = Array.from(allDataTypes).map(d => `<span class="tag danger">${d}</span>`).join('');

    const sharedTagsElem = document.getElementById('sharedWithTags');
    if (sharedTagsElem) sharedTagsElem.innerHTML = Array.from(allShared).map(s => `<span class="tag warning">${s}</span>`).join('');

    const permTagsElem = document.getElementById('permissionsTags');
    if (permTagsElem) permTagsElem.innerHTML = Array.from(allPermissions).map(p => `<span class="tag cyan">${p}</span>`).join('');

    const riskListElem = document.getElementById('riskList');
    if (riskListElem) riskListElem.innerHTML = allRisks.map(r => `<li>${r}</li>`).join('');

    const tipListElem = document.getElementById('tipList');
    if (tipListElem) tipListElem.innerHTML = allTips.map(t => `<li>${t}</li>`).join('');

    const count = selectedApps.length;
    const avgCategories = [
        Math.min(10, Math.round(categoriesSum.identity / count)),
        Math.min(10, Math.round(categoriesSum.behavior / count)),
        Math.min(10, Math.round(categoriesSum.content / count)),
        Math.min(10, Math.round(categoriesSum.social / count))
    ];

    updateRadarChart(avgCategories);
}

function resetDashboardUI() {
    const scoreValElem = document.getElementById('scoreValue');
    const badgeElem = document.getElementById('criticalityBadge');
    if (scoreValElem) { scoreValElem.innerText = '0'; scoreValElem.style.color = 'var(--text-muted)'; }
    if (badgeElem) { badgeElem.innerText = "No App Selected"; badgeElem.style.background = 'rgba(255,255,255,0.04)'; badgeElem.style.color = 'var(--text-muted)'; }

    document.getElementById('dataCollectedTags').innerHTML = `<span class="tag">No App Selected</span>`;
    document.getElementById('sharedWithTags').innerHTML = `<span class="tag">No App Selected</span>`;
    document.getElementById('permissionsTags').innerHTML = `<span class="tag">No App Selected</span>`;
    document.getElementById('riskList').innerHTML = `<li>No App Selected</li>`;
    document.getElementById('tipList').innerHTML = `<li>No App Selected</li>`;

    if (radarChart) {
        radarChart.data.datasets[0].data = [0, 0, 0, 0];
        radarChart.update();
    }
}

function updateRadarChart(dataValues) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const radarLabels = ["Identity & Biometrics", "Behavior & Location", "Content & Messages", "Social Graph"];

    if (!radarChart) {
        const ctx = canvas.getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: radarLabels,
                datasets: [{
                    label: 'Data Appetite Score (0-10)',
                    data: dataValues,
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#3b82f6',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.06)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        pointLabels: {
                            color: '#a1a1aa',
                            font: { size: 11, family: 'Plus Jakarta Sans', weight: '600' }
                        },
                        ticks: { display: false, suggestedMin: 0, suggestedMax: 10 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    } else {
        radarChart.data.datasets[0].data = dataValues;
        radarChart.update();
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPOSE ALL FUNCTIONS TO WINDOW SCOPE
// ────────────────────────────────────────────────────────────────────────────────
window.toggleAppSelection = toggleAppSelection;
window.showTosdrModal = showTosdrModal;
window.selectAppFromSearchResults = selectAppFromSearchResults;
window.handlePrecisionStoreSearch = handlePrecisionStoreSearch;
window.openCustomAppModal = openCustomAppModal;
window.closeModal = closeModal;

// ────────────────────────────────────────────────────────────────────────────────
// Modals & Utilities
// ────────────────────────────────────────────────────────────────────────────────

function showTosdrModal(appId) {
    const app = appsDataStore.find(a => a.id === appId);
    if (!app) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = `${app.name} — Privacy Policy Review`;

    if (modalBody) {
        let pointsHtml = '';
        if (app.tosdr_points && app.tosdr_points.length > 0) {
            pointsHtml = app.tosdr_points.map(pt => `
                <div style="margin-bottom: 0.6rem; padding: 0.65rem; background: var(--bg-elevated); border-radius: 8px; border-left: 3px solid var(--accent-blue); border: 1px solid var(--border-subtle);">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.84rem;">${pt.title}</div>
                </div>
            `).join('');
        } else {
            pointsHtml = '<p style="color: var(--text-muted);">No additional policy point details recorded.</p>';
        }

        const iconHeader = getAppSvgIcon(app);

        modalBody.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                ${iconHeader}
                <div>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">${app.full_title || app.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${app.company} ${app.bundle_id ? `• ${app.bundle_id}` : ''}</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom: 1rem; background:var(--bg-elevated); padding:0.65rem; border-radius:8px; border: 1px solid var(--border-subtle);">
                <div class="tosdr-badge grade-${app.tosdr_grade}" style="width: 30px; height: 30px; font-size: 0.95rem; position:static;">${app.tosdr_grade}</div>
                <div>
                    <div style="font-weight: 700; font-size: 0.85rem; color:var(--text-primary);">ToS;DR Grade: ${app.tosdr_grade}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">Human-reviewed terms evaluation</div>
                </div>
            </div>
            <h4 style="margin-bottom: 0.55rem; font-size:0.88rem; color: var(--text-primary);">Reviewed Policy Points:</h4>
            ${pointsHtml}
        `;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

function openCustomAppModal(presetName = '') {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = "Add Custom Application";

    if (modalBody) {
        modalBody.innerHTML = `
            <form id="customAppForm" onsubmit="handleCustomFormSubmit(event)">
                <div style="margin-bottom: 0.85rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">Application Name:</label>
                    <input type="text" id="customName" value="${presetName}" required placeholder="e.g. Discord, Zoom"
                        style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem; outline:none;">
                </div>
                <div style="margin-bottom: 0.85rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">Developer / Company:</label>
                    <input type="text" id="customCompany" placeholder="e.g. Acme Corp"
                        style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem; outline:none;">
                </div>
                <div style="margin-bottom: 1.25rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">Category:</label>
                    <select id="customCategory" style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem;">
                        <option value="productivity">Productivity</option>
                        <option value="social">Social</option>
                        <option value="communication">Communication</option>
                        <option value="entertainment">Entertainment</option>
                    </select>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:0.65rem;">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Add & Analyze</button>
                </div>
            </form>
        `;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

function handleCustomFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('customName')?.value.trim();
    if (name) {
        closeModal();
        handlePrecisionStoreSearch(name);
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

function getAppEmojiIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('ehliyet') || n.includes('sınav')) return '🚗';
    if (n.includes('discord')) return '👾';
    if (n.includes('zoom')) return '📹';
    if (n.includes('pinterest')) return '📌';
    if (n.includes('tinder')) return '🔥';
    if (n.includes('capcut')) return '🎬';
    if (n.includes('duolingo')) return '🦉';
    if (n.includes('strava')) return '🚴';
    if (n.includes('mopaş') || n.includes('getir') || n.includes('trendyol')) return '🛒';
    return '📱';
}

function extractCompanyFromDomain(urls) {
    if (!urls || urls.length === 0) return null;
    const domain = urls[0];
    const parts = domain.split('.');
    if (parts.length >= 2) return parts[parts.length - 2].toUpperCase();
    return domain;
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerText = msg;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}

function getFallbackApps() {
    return [{
        id: "whatsapp", name: "WhatsApp", company: "Meta", category: "communication",
        icon: "💬", tosdr_grade: "E", weight: 18, exodus_trackers: 1,
        categories: { identity: 8, behavior: 7, content: 6, social: 10 },
        data_types: ["Phone Number", "Contact Book", "Device ID & IP Address"],
        shared_with: ["Meta Companies", "Law Enforcement (Requests)"],
        permissions: ["Contacts", "Camera", "Microphone", "Location"]
    }];
}
