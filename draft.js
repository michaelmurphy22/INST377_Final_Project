const removedFromDraftList = [];

function getDraftData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/draft-rankings?apikey=TEST&format=")
    .then((res) => res.json());
}

function getProjectedData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/dfs?apikey=TEST&slateId=")
    .then((res) => res.json());
}

function showPlayerProfiles(player) {
  const playerProfile = document.createElement("div");
  playerProfile.className = "playerProfile";

  playerProfile.innerHTML = `
    <h3>${player.name}</h3>
    <p>Team: ${player.team}</p>
    <p>Position: ${player.position}</p>
    <p>Rank: ${player.rank}</p>
    <p>Injury Risk: ${player.injury_risk}</p>
    <button onclick="addToDraft('${player.name}', '${player.team}', '${player.position}')">Add to Team</button>
    <button onclick="removeFromDraftCard(this)">Remove</button>
  `;
  return playerProfile;
}

function removeFromDraftCard(button) {
  const card = button.parentElement;
  const name = card.querySelector("h3").textContent;

  removedFromDraftList.push(name);
  card.remove();
  loadPlayers();
}

async function addToDraft(name, team, position) {
  await fetch('/team', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, team, position })
  });

  renderDraftedList();
  updateStarters();
}

async function removeFromDraft(name, team) {
  await fetch('/team', {
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

  const res = await fetch('/team');
  const teamData = await res.json();

  teamData.forEach((player) => {
    const item = document.createElement("li");
    item.textContent = `${player.name} (${player.team} - ${player.position})`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => removeFromDraft(player.name, player.team);

    item.appendChild(removeBtn);
    list.appendChild(item);
  });
}

async function loadPlayers() {
  const position = document.getElementById("selectPosition").value;
  const data = await getDraftData();
  const allPlayers = data.players || [];

  let filtered = allPlayers
    .filter((p) => position === "ALL" || p.position === position)
    .filter((p) => !removedFromDraftList.includes(p.name))
    .sort((a, b) =>
      position === "ALL" ? a.rank - b.rank : a.rank_position - b.rank_position
    )
    .slice(0, 10);

  const playerContainer = document.getElementById("playerBoxes");
  playerContainer.innerHTML = "";

  filtered.forEach((player) => {
    const playerProfile = showPlayerProfiles(player);
    playerContainer.appendChild(playerProfile);
  });
}

function getTopByPosition(players, pos, count) {
  return players
    .filter((p) => p.position === pos)
    .sort((a, b) => b.proj_pts - a.proj_pts)
    .slice(0, count);
}

async function updateStarters() {
  const data = await getProjectedData();
  const players = data.players;

  const res = await fetch('/team');
  const drafted = await res.json();

  const matched = drafted.map((d) =>
    players.find((p) => p.name === d.name && p.team === d.team)
  ).filter(Boolean);

  let starters = [];
  starters = starters.concat(getTopByPosition(matched, "QB", 1));
  starters = starters.concat(getTopByPosition(matched, "RB", 2));
  starters = starters.concat(getTopByPosition(matched, "WR", 2));
  starters = starters.concat(getTopByPosition(matched, "TE", 1));

  const starterBox = document.getElementById("starterList");
  starterBox.innerHTML = "";

  starters.forEach((player, index) => {
    const div = document.createElement("div");
    div.className = "starterCard";
    const canvasId = `chart-${index}`;

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
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false }
        }
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
