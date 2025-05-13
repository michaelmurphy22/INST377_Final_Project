async function loadTeamImages() {
  const res = await fetch('/team');
  const team = await res.json();
  
  const container = document.getElementById("teamSlider");
  container.innerHTML = "";
  
  team.forEach((player, index) => {
    if (player.player_id) {
      const img = document.createElement("img");
      img.src = `https://www.fantasynerds.com/images/nfl/players_small/${player.player_id}.png`;
      img.alt = player.name;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      if (index === 0) img.className = "current-slide";
      container.appendChild(img);
    }
  });
  
  simpleslider.getSlider({
    container: container,
    prop: 'left',
    init: -150,
    show: 0,
    end: 150,
    unit: 'px'
  });
}
  
window.onload = loadTeamImages;