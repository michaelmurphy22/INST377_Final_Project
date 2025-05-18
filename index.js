const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = 3000;

// Serve static HTML/CSS/JS files from root
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// GET all drafted players
app.get('/team', async (req, res) => {
  const { data } = await supabase.from('players').select('*');
  res.json(data);
});

// POST a new drafted player (includes player_id for slider)
app.post('/team', async (req, res) => {
  const { name, team, position, player_id } = req.body;
  const { data } = await supabase
    .from('players')
    .insert([{ name, team, position, player_id }]);
  res.status(201).json(data);
});

// DELETE a drafted player
app.delete('/team', async (req, res) => {
  const { name, team } = req.body;
  await supabase
    .from('players')
    .delete()
    .match({ name, team });
  res.status(204).send();
});

// Start the server
app.listen(port, () => {
  console.log('App alive on port:', port);
});