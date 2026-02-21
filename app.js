const API_BASE = "https://soccergpt-api.loca.lt/api";

const SECRET_PASS = "admin123";

// --- Authentication ---
function handleKeyPress(e) {
    if (e.key === 'Enter') checkPassword();
}

function checkPassword() {
    const input = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('error-msg');

    if (input === SECRET_PASS) {
        document.getElementById('password-overlay').classList.add('hidden');
        document.getElementById('app-content').classList.remove('hidden');
        loadCombinations();
    } else {
        errorMsg.innerText = "Incorrect passphrase.";
        setTimeout(() => errorMsg.innerText = "", 3000);
    }
}

// --- Navigation ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    event.currentTarget.classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.remove('active', 'hidden');

    if (tabId === 'combinations') loadCombinations();
    if (tabId === 'upcoming') {
        if (!document.getElementById('upcoming-date').value) {
            document.getElementById('upcoming-date').value = new Date().toISOString().split('T')[0];
        }
        loadUpcoming();
    }
    if (tabId === 'backtest') loadBacktest();
}

// --- Data Fetching & Rendering ---
async function loadCombinations() {
    const container = document.getElementById('combinations-container');
    container.innerHTML = '<div class="loading">Fetching professional combinations...</div>';

    try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`${API_BASE}/combinations?date=${today}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        const data = await res.json();

        if (!data.combinations || data.combinations.length === 0) {
            container.innerHTML = '<div class="loading">No combinations generated for today.</div>';
            return;
        }

        renderCombinations(data.combinations, container);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="loading" style="color:var(--error)">Failed to load data. Ensure backend is running.</div>`;
    }
}

function getHeaderDetails(name) {
    if (name.includes("Value Edge")) return { icon: "💰", subtitle: "Prioritizing mathematical edge and ROI." };
    if (name.includes("High Conf")) return { icon: "🎯", subtitle: "Highest probability selections for stability." };
    if (name.includes("Mixed")) return { icon: "👔", subtitle: "Diversified risk across multiple markets." };
    if (name.includes("Elite")) return { icon: "⚡", subtitle: "Premium high-volume goal selections." };
    return { icon: "🔥", subtitle: "System generated selections." };
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function renderCombinations(combos, container) {
    container.innerHTML = '';

    combos.forEach(combo => {
        const details = getHeaderDetails(combo.name);

        // Block Wrapper
        const block = document.createElement('div');
        block.className = 'combo-block';

        // Header
        const header = document.createElement('div');
        header.className = 'combo-header';
        header.innerHTML = `
            <h3>${details.icon} ${combo.name}</h3>
            <p>${details.subtitle}</p>
        `;
        block.appendChild(header);

        // Table Wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'table-wrapper';

        let rowsHtml = '';
        let totalOdds = 1.0;

        combo.matches.forEach(m => {
            const time = formatTime(m.match_date);
            const selection = m.market === "Match Winner" ? `Match Winner (${m.prediction})` : `${m.market} (${m.prediction})`;
            const isDual = m.trap_reason && m.trap_reason.includes("Dual-Qualified");
            const badge = isDual ? '<span class="badge">DUAL</span>' : '';

            rowsHtml += `
                <tr>
                    <td class="col-time">${time}</td>
                    <td class="col-league">${m.league_name}</td>
                    <td class="col-match">${m.home_team} vs ${m.away_team}</td>
                    <td class="col-selection">${selection} ${badge}</td>
                    <td class="col-odds">${m.odds.toFixed(2)}</td>
                </tr>
            `;
            totalOdds *= m.odds;
        });

        const tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th class="col-time">Time</th>
                        <th class="col-league">League</th>
                        <th class="col-match">Match</th>
                        <th class="col-selection">Selection</th>
                        <th class="col-odds">Odds</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr class="table-footer-row">
                        <td colspan="4" style="text-align: right; border-bottom: none;">Total Odds</td>
                        <td class="col-odds total-odds-val">${totalOdds.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        `;

        tableWrapper.innerHTML = tableHtml;
        block.appendChild(tableWrapper);
        container.appendChild(block);
    });
}

// --- Upcoming Tab ---
async function loadUpcoming() {
    const container = document.getElementById('upcoming-container');
    const dateInput = document.getElementById('upcoming-date').value || new Date().toISOString().split('T')[0];
    container.innerHTML = '<div class="loading">Fetching upcoming analytics...</div>';

    try {
        const res = await fetch(`${API_BASE}/Analysis?date=${dateInput}`, {
            headers: {
                "Bypass-Tunnel-Reminder": "true"
            }
        });
        const data = await res.json();

        if (!data.matches || data.matches.length === 0) {
            container.innerHTML = '<div class="loading">No matches scheduled for today.</div>';
            return;
        }

        renderUpcoming(data.matches, container);
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="loading" style="color:var(--error)">Failed to load analytics.</div>`;
    }
}

function renderUpcoming(matches, container) {
    container.innerHTML = '';

    const block = document.createElement('div');
    block.className = 'combo-block';

    const header = document.createElement('div');
    header.className = 'combo-header';
    header.innerHTML = `
        <h3>📅 Daily Match Analytics</h3>
        <p>Comprehensive algorithmic insights for all fixtures. Tap a match for details.</p>
    `;
    block.appendChild(header);

    const listWrapper = document.createElement('div');
    listWrapper.className = 'match-list';

    let html = '';
    matches.forEach(m => {
        const time = formatTime(m.match_date || m.date || new Date().toISOString());

        let bestPred = "Avoid";
        if (m.prediction && m.prediction.btts && m.prediction.btts.is_qualified) bestPred = "BTTS (Yes)";
        else if (m.prediction && m.prediction.over25 && m.prediction.over25.is_qualified) bestPred = "Over 2.5";
        else if (m.prediction && m.prediction.match_winner && m.prediction.match_winner.is_qualified) bestPred = `Winner (${m.prediction.match_winner.prediction})`;

        let trapBadge = "";
        if (m.trap && m.trap.is_trap) {
            trapBadge = `<div style="color:var(--error); font-size:0.85em; margin-top:8px;">🚨 Trap: ${m.trap.reason}</div>`;
        }

        // --- Donut Charts ---
        let over25Prob = m.prediction?.over25?.probability ? Math.round(m.prediction.over25.probability * 100) : 0;
        let bttsProb = m.prediction?.btts?.probability ? Math.round(m.prediction.btts.probability * 100) : 0;

        let donutHtml = `
            <div class="donuts-container">
                <div class="donut-wrapper">
                    <div class="donut-chart" style="--percent: ${over25Prob}%"><div class="donut-inner">${over25Prob}%</div></div>
                    <span class="donut-label">O2.5 Prob</span>
                </div>
                <div class="donut-wrapper">
                    <div class="donut-chart" style="--percent: ${bttsProb}%"><div class="donut-inner">${bttsProb}%</div></div>
                    <span class="donut-label">BTTS Prob</span>
                </div>
            </div>
        `;

        // --- H2H Bar Charts ---
        const buildBar = (label, homeVal, awayVal, isPercentage = false) => {
            const displayHome = isPercentage ? (homeVal * 100).toFixed(0) + '%' : homeVal.toFixed(1);
            const displayAway = isPercentage ? (awayVal * 100).toFixed(0) + '%' : awayVal.toFixed(1);
            const total = homeVal + awayVal || 0.001;
            const homePct = (homeVal / total) * 100;
            const awayPct = (awayVal / total) * 100;
            return `
                <div class="h2h-stat">
                    <div class="h2h-label">
                        <span>${displayHome}</span>
                        <span>${label}</span>
                        <span>${displayAway}</span>
                    </div>
                    <div class="h2h-bar-bg">
                        <div class="h2h-bar-home" style="width: ${homePct}%"></div>
                        <div class="h2h-bar-away" style="width: ${awayPct}%"></div>
                    </div>
                </div>
            `;
        };

        let h2hHtml = `<div class="h2h-container"><div class="h2h-title">Team Stats (Last 7 & Overall)</div>`;
        if (m.home_stats && m.away_stats) {
            h2hHtml += buildBar("Avg Goals Scored", m.home_stats.avg_goals_scored_last7 || 0, m.away_stats.avg_goals_scored_last7 || 0);
            h2hHtml += buildBar("Avg Goals Conceded", m.home_stats.avg_goals_conceded_last7 || 0, m.away_stats.avg_goals_conceded_last7 || 0);
            h2hHtml += buildBar("Clean Sheet Rate", m.home_stats.clean_sheet_rate || 0, m.away_stats.clean_sheet_rate || 0, true);
        } else {
            h2hHtml += `<div style="text-align:center;color:var(--text-secondary);font-size:0.8em;padding:10px;">Stats unavailable</div>`;
        }
        h2hHtml += `</div>`;

        html += `
            <div class="match-card">
                <div class="match-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <div class="match-info-main">
                        <div class="match-time-league">${time} • ${m.league || m.league_name || "Unknown"}</div>
                        <div class="match-teams">${m.home_team} vs ${m.away_team}</div>
                        <div class="match-signal-row">
                            <span class="badge" style="margin-left:0; background:var(--accent-blue);">${bestPred}</span>
                            <span style="font-size:0.8em; color:var(--text-secondary);">Odds: ${m.odds_home_win ? m.odds_home_win.toFixed(2) : '-'} | ${m.odds_draw ? m.odds_draw.toFixed(2) : '-'} | ${m.odds_away_win ? m.odds_away_win.toFixed(2) : '-'}</span>
                        </div>
                        ${trapBadge}
                    </div>
                    <div class="match-chevron">▼</div>
                </div>
                <div class="match-details">
                    <div class="details-grid">
                        ${donutHtml}
                        ${h2hHtml}
                    </div>
                </div>
            </div>
        `;
    });

    listWrapper.innerHTML = html;
    block.appendChild(listWrapper);
    container.appendChild(block);
}

// --- Backtest Tab ---
let cachedBacktestData = null;

async function loadBacktest() {
    const container = document.getElementById('backtest-container');
    if (cachedBacktestData) {
        renderBacktestData();
        return;
    }

    container.innerHTML = '<div class="loading">Fetching historical backtest data...</div>';

    try {
        // Fetch static JSON from same directory
        const res = await fetch('backtest_data.json');
        cachedBacktestData = await res.json();
        renderBacktestData();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="loading" style="color:var(--error)">Failed to load backtest data.</div>`;
    }
}

function renderBacktestData() {
    if (!cachedBacktestData) return;

    const container = document.getElementById('backtest-container');
    const stake = parseFloat(document.getElementById('stake-input').value) || 25;
    const data = cachedBacktestData;

    const totalStaked = data.summary.total_staked_units * stake;
    const totalReturned = data.summary.total_returned_units * stake;
    const profit = data.summary.pl_units * stake;

    let html = `
        <div class="combo-block">
            <div class="combo-header">
                <h3>📊 10-Week Combination Performance</h3>
                <p>Based on ${data.summary.combos_total} combinations with a €${stake} stake per ticket.</p>
            </div>
            <div class="table-wrapper">
                <table>
                    <tbody>
                        <tr><td><strong>Total Staked</strong></td><td style="text-align:right;">€${totalStaked.toFixed(2)}</td></tr>
                        <tr><td><strong>Total Returned</strong></td><td style="text-align:right;">€${totalReturned.toFixed(2)}</td></tr>
                        <tr><td><strong>Total Profit</strong></td><td style="text-align:right; color:${profit > 0 ? 'var(--accent-blue)' : 'var(--error)'}">€${profit.toFixed(2)}</td></tr>
                        <tr><td><strong>ROI</strong></td><td style="text-align:right; color:${data.summary.roi_percent > 0 ? 'var(--accent-blue)' : 'var(--error)'}">${data.summary.roi_percent}%</td></tr>
                        <tr><td><strong>Combination Win Rate</strong></td><td style="text-align:right;">${data.summary.win_rate}%</td></tr>
                        <tr><td><strong>Individual Leg Hit Rate</strong></td><td style="text-align:right;">${data.summary.leg_hit_rate}%</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="combo-block">
            <div class="combo-header">
                <h3>🎯 Market Accuracy (Filtered Legs)</h3>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr><th>Market</th><th>Accuracy</th><th>Volume</th></tr>
                    </thead>
                    <tbody>
                        ${data.markets.map(m => `
                            <tr>
                                <td>${m.market}</td>
                                <td>${m.accuracy}%</td>
                                <td>${m.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}
