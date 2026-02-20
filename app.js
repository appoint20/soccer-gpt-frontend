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
        <p>Comprehensive algorithmic insights for all fixtures.</p>
    `;
    block.appendChild(header);

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-wrapper';

    let rowsHtml = '';
    matches.forEach(m => {
        const time = formatTime(m.match_date || m.date || new Date().toISOString());

        let trapBadge = "";
        if (m.trap && m.trap.is_trap) {
            trapBadge = `<div style="color:var(--error); font-size:0.85em; margin-top:4px;">🚨 Trap: ${m.trap.reason}</div>`;
        }

        let details = [];
        if (m.prediction && m.prediction.btts) details.push(`BTTS: ${m.prediction.btts.probability * 100}% (${m.prediction.btts.reason})`);
        if (m.prediction && m.prediction.over25) details.push(`O2.5: ${m.prediction.over25.probability * 100}% (${m.prediction.over25.reason})`);
        if (m.prediction && m.prediction.match_winner) details.push(`Winner: ${m.prediction.match_winner.prediction} ${m.prediction.match_winner.confidence * 100}% (${m.prediction.match_winner.reason})`);

        rowsHtml += `
            <tr>
                <td class="col-time" style="vertical-align:top;">${time}</td>
                <td class="col-league" style="vertical-align:top;">${m.league || m.league_name || "Unknown"}</td>
                <td class="col-match" style="vertical-align:top;">
                    <strong>${m.home_team} vs ${m.away_team}</strong>
                    ${trapBadge}
                </td>
                <td class="col-selection" style="font-size:0.85em; vertical-align:top;">
                    ${details.join('<br>')}
                </td>
                <td class="col-odds" style="vertical-align:top;">${m.odds_home_win ? m.odds_home_win.toFixed(2) : '-'} | ${m.odds_draw ? m.odds_draw.toFixed(2) : '-'} | ${m.odds_away_win ? m.odds_away_win.toFixed(2) : '-'}</td>
            </tr>
        `;
    });

    const tableHtml = `
        <table>
            <thead>
                <tr>
                    <th class="col-time">Time</th>
                    <th class="col-league">League</th>
                    <th class="col-match">Match</th>
                    <th class="col-selection">Detailed Analysis</th>
                    <th class="col-odds">1X2 Odds</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
    tableWrapper.innerHTML = tableHtml;
    block.appendChild(tableWrapper);
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
