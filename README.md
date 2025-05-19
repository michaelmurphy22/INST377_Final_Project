# INST377_Final_Project

# Project Name: Fantasy Lineup Pro

# Description: This project is a full stack web application to be a helper for a user who would like to take part in a fantasy football draft. This application uses data on players in the National Football League from the Fantasy Nerds API to show users who are the best players available to draft, automatically sets their lineup for them, and shows them data on their's players projected points.

# Target Browsers: The application can be used in any online browser

# Developer Manual

# Link to the application: https://inst-377-final-project-dusky.vercel.app/

# To run the application on a server, type in the terminal "node index.js" to start the server then type into your web browser http://localhost:3000

## API Information
# For API data on draft rankings follow this link: https://api.fantasynerds.com/v1/nfl/draft-rankings?apikey=TEST&format= and this is what you need to use to return the list of players to draft 

# For API data on project points follow this link: https://api.fantasynerds.com/v1/nfl/dfs?apikey=TEST&slateId= and this is what you need to automatically set the user's lineup 

# For the pictures of the user's team members that is on the home page, you need to use this api link: https://www.fantasynerds.com/images/nfl/players_small/${player.player_id}.png

# One known bug is that not all of the players in the API with projected points and the API with draft rankings do not have all of the same players because the NFL season hasn't started yet and it is updated weekly. Because of this, sometimes players cannot be put in the starting lineups even when they are drafted to the team.
