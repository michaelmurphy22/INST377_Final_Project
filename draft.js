const removedFromDraftList = [];

function getDraftData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/draft-rankings?apikey=TEST&format=")
    .then(function (result) {
      return result.json();
    });
}

function getProjectedData() {
  return fetch("https://api.fantasynerds.com/v1/nfl/dfs?apikey=TEST&slateId=")
    .then(function (res) {
      return res.json();
    });
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

function addToDraft(name, team, position) {
  const player = { name, team, position };
  let teamData = JSON.parse(localStorage.getItem("fantasyTeam")) || [];

  const alreadyAdded = teamData.some(function (p) {
    return p.name === name && p.team === team;
  });

  if (!alreadyAdded) {
    teamData.push(player);
    localStorage.setItem("fantasyTeam", JSON.stringify(teamData));
  }

  renderDraftedList();
  updateStarters();
}

function removeFromDraft(name, team) {
  let teamData = JSON.parse(localStorage.getItem("fantasyTeam")) || [];
  teamData = teamData.filter(function (p) {
    return !(p.name === name && p.team === team);
  });
  localStorage.setItem("fantasyTeam", JSON.stringify(teamData));
  renderDraftedList();
  updateStarters();
}

function clearTeam() {
  localStorage.removeItem("fantasyTeam");
  renderDraftedList();
  updateStarters();
}

function renderDraftedList() {
  const list = document.getElementById("draftedList");
  list.innerHTML = "";

  const teamData = JSON.parse(localStorage.getItem("fantasyTeam")) || [];

  teamData.forEach(function (player) {
    const item = document.createElement("li");
    item.textContent = `${player.name} (${player.team} - ${player.position}) `;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = function () {
      removeFromDraft(player.name, player.team);
    };

    item.appendChild(removeBtn);
    list.appendChild(item);
  });

  const clearBtn = document.getElementById("clearTeamButton");
  if (!clearBtn) {
    const button = document.createElement("button");
    button.id = "clearTeamButton";
    button.textContent = "Clear Entire Team";
    button.style.marginTop = "10px";
    button.onclick = clearTeam;
    list.parentElement.appendChild(button);
  }
}

async function loadPlayers() {
  const position = document.getElementById("selectPosition").value;
  const data = await getDraftData();
  const allPlayers = data.players;

  let filtered = allPlayers
    .filter(function (p) {
      return position === "ALL" || p.position === position;
    })
    .filter(function (p) {
      return !removedFromDraftList.includes(p.name);
    })
    .sort(function (a, b) {
      return position === "ALL" ? a.rank - b.rank : a.rank_position - b.rank_position;
    })
    .slice(0, 10);

  const playerContainer = document.getElementById("playerBoxes");
  playerContainer.innerHTML = "";

  filtered.forEach(function (player) {
    const playerProfile = showPlayerProfiles(player);
    playerContainer.appendChild(playerProfile);
  });
}

function updateStarters() {
  getProjectedData().then(function (data) {
    const players = data.players;
    const drafted = JSON.parse(localStorage.getItem("fantasyTeam")) || [];

    const matched = drafted.map(function (d) {
      return players.find(function (p) {
        return p.name === d.name && p.team === d.team;
      });
    }).filter(Boolean);

    function getTopByPosition(pos, count) {
      return matched
        .filter(function (p) { return p.position === pos; })
        .sort(function (a, b) { return b.proj_pts - a.proj_pts; })
        .slice(0, count);
    }

    let starters = [];
    starters = starters.concat(getTopByPosition("QB", 1));
    starters = starters.concat(getTopByPosition("RB", 2));
    starters = starters.concat(getTopByPosition("WR", 2));
    starters = starters.concat(getTopByPosition("TE", 1));

    const starterBox = document.getElementById("starterList");
    starterBox.innerHTML = "";

    starters.forEach(function (player, index) {
      const div = document.createElement("div");
      div.className = "starterCard";
      const canvasId = `chart-${index}`;

      div.innerHTML = `
        <strong>${player.name}</strong> (${player.position} - ${player.team})<br>
        Projected Points: ${player.proj_pts}<br>
        <canvas id="${canvasId}" width="200" height="100"></canvas>
      `;
      starterBox.appendChild(div);

      // Chart.js config
      const ctx = document.getElementById(canvasId).getContext('2d');
      const chart = new Chart(ctx, {
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
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
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
