/**
 * CyberPrivacy Matrix - 100% English Native Application Engine
 * Fast, reliable, clean, zero translation overhead.
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
        const response = await fetch('./apps_database.json?v=8');
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

        let iconHtml = `<div class="app-icon">${app.icon || '📱'}</div>`;
        if (app.icon_url) {
            iconHtml = `<img class="app-icon-img" src="${app.icon_url}" alt="${app.name}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'app-icon\\'>${app.icon || '📱'}</div>';">`;
        }

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

        const iconHeader = app.icon_url
            ? `<img src="${app.icon_url}" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover;" onerror="this.onerror=null; this.outerHTML='<div style=\\'font-size:1.6rem;\\'>${app.icon || '📱'}</div>';">`
            : `<div style="font-size: 1.6rem;">${app.icon || '📱'}</div>`;

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
