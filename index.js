const express = require('express');
const supabaseClient = require('@supabase/supabase-js');

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(express.json());

const supabaseUrl = 'https://evobpvdryqpojgclvghh.supabase.co';
const supabaseKey = 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2b2JwdmRyeXFwb2pnY2x2Z2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODk4OTQsImV4cCI6MjA2MjY2NTg5NH0.FeDZ-YRroV_KNKYeIC3JYqlONkqiQ0j69XXoh2X-ND4';

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

app.listen(port, () => {
    console.log('App alive on port:', port);
});


// http://localhost:3000/home_page.html