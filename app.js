const API_BASE = "http://localhost:5165/api";

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

function shortMarket(market, prediction) {
    if (market === "Match Winner") return `Win ${shortName(prediction)}`;
    if (market === "Both Teams To Score") return "BTTS";
    if (market === "Over 2.5 Goals") return "O2.5";
    return market;
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

        const listWrapper = document.createElement('div');
        listWrapper.className = 'match-list';

        let html = '';
        let totalOdds = 1.0;

        combo.matches.forEach(m => {
            const time = formatTime(m.match_date);
            const selectionShort = shortMarket(m.market, m.prediction);
            const isDual = m.trap_reason && m.trap_reason.includes("Dual-Qualified");

            const homeShort = shortName(m.home_team);
            const awayShort = shortName(m.away_team);
            const leagueDisplay = m.league_name || "Unknown";

            totalOdds *= m.odds;

            let dualBadge = isDual ? `<div style="color:#f39c12; font-size:0.8em; margin-top:8px;">💎 Dual Qualified</div>` : "";

            html += `
                <div class="match-card">
                    <div class="match-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <div class="match-info-compact">
                            <span class="match-time-col">${time}</span>
                            <span class="match-league-col">${leagueDisplay}</span>
                            <span class="match-teams-col">${homeShort} vs ${awayShort}</span>
                            <span class="badge ${isDual ? 'badge-success' : 'badge-neutral'}" style="margin-left:auto;">${selectionShort}</span>
                            <span class="match-chevron" style="margin-left: 8px;">▼</span>
                        </div>
                    </div>
                    <div class="match-details">
                        <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px;">
                            <strong style="color:var(--text-primary)">Teams:</strong> ${m.home_team} vs ${m.away_team} <br>
                            <strong style="color:var(--text-primary)">Selection:</strong> ${m.market} (${m.prediction}) <br>
                            <strong style="color:var(--text-primary)">Odds:</strong> ${m.odds.toFixed(2)}
                            ${dualBadge}
                        </div>
                        ${m.gemini_reasoning ? `
                        <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 10px; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 6px; border-left: 3px solid var(--accent-blue);">
                            <strong style="color:var(--accent-blue)">🤖 Gemini Predicts:</strong> ${m.gemini_recommendation} (${m.gemini_confidence}%)
                            ${m.gemini_is_trap ? '<span style="color:var(--accent-red);font-weight:bold;margin-left:10px;">🚨 TRAP DETECTED</span>' : ''}<br>
                            <span style="font-style: italic;"><strong>Reasoning:</strong> "${m.gemini_reasoning}"</span><br>
                            <span style="font-style: italic; margin-top:5px; display:inline-block;"><strong>Analysis:</strong> "${m.gemini_analysis_text}"</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `
            <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; text-align: right; font-size: 1.1em; font-weight: 600;">
                Combo Odds: <span style="color:var(--accent-blue)">${totalOdds.toFixed(2)}</span>
            </div>
        `;

        listWrapper.innerHTML = html;
        block.appendChild(listWrapper);
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

function shortName(name) {
    if (!name) return "";
    return name.substring(0, 3).toUpperCase();
}

function getTimeGroup(timeStr) {
    const hours = parseInt(timeStr.split(':')[0], 10);
    const mins = parseInt(timeStr.split(':')[1], 10);
    const totalMins = hours * 60 + mins;

    if (totalMins < 13 * 60) return "Morning (Before 13:00)";
    if (totalMins < 15 * 60 + 30) return "Early Afternoon (13:00 - 15:30)";
    if (totalMins < 18 * 60) return "Late Afternoon (15:30 - 18:00)";
    if (totalMins < 22 * 60) return "Evening (18:00 - 22:00)";
    return "Night (22:00 onwards)";
}

function renderUpcoming(matches, container) {
    container.innerHTML = '';

    // Sort matches chronologically
    matches.sort((a, b) => {
        const timeA = formatTime(a.match_date || a.date || new Date().toISOString());
        const timeB = formatTime(b.match_date || b.date || new Date().toISOString());
        return timeA.localeCompare(timeB);
    });

    // Group logically
    const groupedMatches = {};
    matches.forEach(m => {
        const timeStr = formatTime(m.match_date || m.date || new Date().toISOString());
        const group = getTimeGroup(timeStr);
        if (!groupedMatches[group]) groupedMatches[group] = [];
        groupedMatches[group].push(m);
    });

    const timeOrder = [
        "Morning (Before 13:00)",
        "Early Afternoon (13:00 - 15:30)",
        "Late Afternoon (15:30 - 18:00)",
        "Evening (18:00 - 22:00)",
        "Night (22:00 onwards)"
    ];

    const block = document.createElement('div');
    block.className = 'combo-block';

    const header = document.createElement('div');
    header.className = 'combo-header';
    header.innerHTML = `
        <h3>📅 Daily Match Analytics</h3>
        <p>Comprehensive algorithmic insights grouped by time. Tap a match for details.</p>
    `;
    block.appendChild(header);

    const listWrapper = document.createElement('div');
    listWrapper.className = 'match-list';

    let html = '';

    timeOrder.forEach(groupName => {
        const groupMatches = groupedMatches[groupName];
        if (!groupMatches || groupMatches.length === 0) return;

        html += `<div class="time-group-header">${groupName}</div>`;

        groupMatches.forEach(m => {
            const time = formatTime(m.match_date || m.date || new Date().toISOString());

            let bestPred = "Avoid";
            let bestClass = "";
            let bestReason = "";

            if (m.prediction?.btts?.is_qualified) {
                bestPred = "BTTS";
                bestReason = m.prediction.btts.reason;
                bestClass = "badge-success";
            } else if (m.prediction?.over25?.is_qualified) {
                bestPred = "O2.5";
                bestReason = m.prediction.over25.reason;
                bestClass = "badge-success";
            } else if (m.prediction?.match_winner?.is_qualified) {
                bestPred = `Win ${shortName(m.prediction.match_winner.prediction)}`;
                bestReason = m.prediction.match_winner.reason;
                bestClass = "badge-neutral";
            }

            let trapBadge = "";
            if (m.trap?.is_trap) {
                trapBadge = `<div style="color:var(--error); font-size:0.8em; margin-top:8px;">🚨 Trap: ${m.trap.reason}</div>`;
            }

            const homeShort = shortName(m.home_team);
            const awayShort = shortName(m.away_team);
            const leagueDisplay = m.league || m.league_name || "Unknown";

            // Safety render for team info
            const homeRank = m.home_stats?.rank || '-';
            const homePts = m.home_stats?.points || '-';
            const homeForm = m.home_stats?.form || '-';
            const homeFormPct = m.home_stats?.form_percentage || 0;
            const homeInfoStr = m.home_stats ? `(#${homeRank} | ${homePts}pts | ${homeForm} | Form: ${homeFormPct}%)` : '';

            const awayRank = m.away_stats?.rank || '-';
            const awayPts = m.away_stats?.points || '-';
            const awayForm = m.away_stats?.form || '-';
            const awayFormPct = m.away_stats?.form_percentage || 0;
            const awayInfoStr = m.away_stats ? `(#${awayRank} | ${awayPts}pts | ${awayForm} | Form: ${awayFormPct}%)` : '';

            // Donut Charts
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

            // H2H Bar Charts
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
                h2hHtml += buildBar("Avg Goals", m.home_stats.avg_goals_scored_last7 || 0, m.away_stats.avg_goals_scored_last7 || 0);
                h2hHtml += buildBar("Conceded", m.home_stats.avg_goals_conceded_last7 || 0, m.away_stats.avg_goals_conceded_last7 || 0);
                h2hHtml += buildBar("Clean Sheet", m.home_stats.clean_sheet_rate || 0, m.away_stats.clean_sheet_rate || 0, true);
            } else {
                h2hHtml += `<div style="text-align:center;color:var(--text-secondary);font-size:0.8em;padding:10px;">Stats unavailable</div>`;
            }
            h2hHtml += `</div>`;

            const geminiHtml = m.gemini ? `
                <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 15px; padding: 10px; background: rgba(52, 152, 219, 0.05); border-radius: 6px; border-left: 3px solid var(--accent-blue);">
                    <strong style="color:var(--accent-blue)">🤖 Gemini Predicts:</strong> ${m.gemini.recommendation || m.gemini.Recommendation || 'N/A'} (${m.gemini.confidence || m.gemini.Confidence || 0}%)
                    ${(m.gemini.is_trap || m.gemini.isTrap || m.gemini.IsTrap) ? '<span style="color:var(--accent-red);font-weight:bold;margin-left:10px;">🚨 TRAP DETECTED</span>' : ''}<br>
                    <span style="font-style: italic;"><strong>Reasoning:</strong> "${m.gemini.reasoning || m.gemini.Reasoning || ''}"</span><br>
                    <span style="font-style: italic; margin-top:5px; display:inline-block;"><strong>Analysis:</strong> "${m.gemini.analysis || m.gemini.Analysis || ''}"</span>
                </div>
            ` : '';

            html += `
                <div class="match-card">
                    <div class="match-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <div class="match-info-compact">
                            <span class="match-time-col">${time}</span>
                            <span class="match-league-col">${leagueDisplay}</span>
                            <span class="match-teams-col">${homeShort} vs ${awayShort}</span>
                            <span class="badge ${bestClass}" style="margin-left:auto;">${bestPred}</span>
                        </div>
                    </div>
                    <div class="match-details">
                        <div style="font-size: 0.85em; color: var(--text-secondary); margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                            <strong style="color:var(--text-primary)">Teams:</strong> ${m.home_team} ${homeInfoStr} <br/> 
                            <span style="margin-left: 50px;">vs</span> <br/>
                            <span style="margin-left: 50px;">${m.away_team} ${awayInfoStr}</span> <br><br>
                            <strong style="color:var(--text-primary)">AI Signal Logic:</strong> ${bestReason || 'None'} <br>
                            <strong style="color:var(--text-primary)">1X2 Odds:</strong> ${m.odds_home_win?.toFixed(2) || '-'} | ${m.odds_draw?.toFixed(2) || '-'} | ${m.odds_away_win?.toFixed(2) || '-'}
                            ${trapBadge}
                        </div>
                        ${geminiHtml}
                        <div class="details-grid">
                            ${donutHtml}
                            ${h2hHtml}
                        </div>
                    </div>
                </div>
            `;
        });
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
        
        <div class="combo-block">
            <div class="combo-header">
                <h3>🏆 League & Market Performance</h3>
                <p>Accuracy breakdown by specific league and betting market.</p>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr><th>League</th><th>Market</th><th>Accuracy</th><th>Volume</th></tr>
                    </thead>
                    <tbody>
                        ${data.leagues ? data.leagues.map(l => `
                            <tr>
                                <td>${l.league}</td>
                                <td>${l.market}</td>
                                <td style="color:${l.accuracy >= 65 ? 'var(--accent-blue)' : l.accuracy <= 40 ? 'var(--error)' : 'inherit'}">${l.accuracy}%</td>
                                <td>${l.total}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4" style="text-align:center;">No data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    container.innerHTML = html;
}
