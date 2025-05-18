const removedFromDraftList = [];

function getDraftData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/draft-rankings?apikey=TEST&format=")
    .then(res => res.json());
}

function getProjectedData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/dfs?apikey=TEST&slateId=")
    .then(res => res.json());
}

function showPlayerProfiles(player) {
  const div = document.createElement("div");
  div.className = "playerProfile";

  div.innerHTML = `
    <h3>${player.name}</h3>
    <p>Team: ${player.team}</p>
    <p>Position: ${player.position}</p>
    <p>Rank: ${player.rank}</p>
    <p>Injury Risk: ${player.injury_risk}</p>
    <button onclick='addToDraft(${JSON.stringify(player.name)}, ${JSON.stringify(player.team)}, ${JSON.stringify(player.position)}, ${JSON.stringify(player.playerId)})'>Add to Team</button>
    <button onclick="removeFromDraftCard(this)">Remove</button>
  `;

  return div;
}

function removeFromDraftCard(button) {
  const card = button.parentElement;
  const name = card.querySelector("h3").textContent;
  removedFromDraftList.push(name);
  card.remove();
  loadPlayers();
}

async function addToDraft(name, team, position, player_id) {
  await fetch('/api/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, team, position, player_id })
  });

  renderDraftedList();
  updateStarters();
}

async function removeFromDraft(name, team) {
  await fetch('/api/team', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, team })
  });

  renderDraftedList();
  updateStarters();
}

async function renderDraftedList() {
  const list = document.getElementById("draftedList");
  list.innerHTML = "";

  const res = await fetch('/api/team');
  const teamData = await res.json();

  teamData.forEach(function (player) {
    const item = document.createElement("li");
    item.textContent = `${player.name} (${player.team} - ${player.position})`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = function () {
      removeFromDraft(player.name, player.team);
    };

    item.appendChild(removeBtn);
    list.appendChild(item);
  });
}

async function loadPlayers() {
  const position = document.getElementById("selectPosition").value;
  const data = await getDraftData();
  const players = (data.players || [])
    .filter(function (p) {
      return (position === "ALL" || p.position === position) &&
             !removedFromDraftList.includes(p.name);
    })
    .sort(function (a, b) {
      return position === "ALL" ? a.rank - b.rank : a.rank_position - b.rank_position;
    })
    .slice(0, 10);

  const container = document.getElementById("playerBoxes");
  container.innerHTML = "";
  players.forEach(function (p) {
    container.appendChild(showPlayerProfiles(p));
  });
}

function getTopByPosition(players, pos, count) {
  return players
    .filter(function (p) {
      return p.position === pos;
    })
    .sort(function (a, b) {
      return b.proj_pts - a.proj_pts;
    })
    .slice(0, count);
}

async function updateStarters() {
  const projected = await getProjectedData();
  const allPlayers = projected.players;

  const res = await fetch('/api/team');
  const drafted = await res.json();

  const matched = drafted.map(function (d) {
    return allPlayers.find(function (p) {
      return p.name === d.name && p.team === d.team;
    });
  }).filter(Boolean);

  const starters = []
    .concat(getTopByPosition(matched, "QB", 1))
    .concat(getTopByPosition(matched, "RB", 2))
    .concat(getTopByPosition(matched, "WR", 2))
    .concat(getTopByPosition(matched, "TE", 1));

  const starterBox = document.getElementById("starterList");
  starterBox.innerHTML = "";

  starters.forEach(function (player, index) {
    const canvasId = `chart-${index}`;
    const div = document.createElement("div");
    div.className = "starterCard";
    div.innerHTML = `
      <strong>${player.name}</strong> (${player.position} - ${player.team})<br>
      Projected Points: ${player.proj_pts}<br>
      <canvas id="${canvasId}" width="200" height="100"></canvas>
    `;
    starterBox.appendChild(div);

    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Conservative', 'Aggressive'],
        datasets: [{
          label: 'Projection Type',
          data: [player.proj_pts_conservative, player.proj_pts_aggressive],
          backgroundColor: ['#36A2EB', '#FF6384']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
  });
}

function setupDrafter() {
  document.getElementById("selectPosition").onchange = function () {
    removedFromDraftList.length = 0;
    loadPlayers();
  };

  loadPlayers();
  renderDraftedList();
  updateStarters();
}

window.onload = setupDrafter;
