const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const app = express();

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/api/team', async (req, res) => {
  const { data } = await supabase.from('players').select('*');
  res.json(data);
});

app.post('/api/team', async (req, res) => {
  const { name, team, position, player_id } = req.body;
  const { data } = await supabase
    .from('players')
    .insert([{ name, team, position, player_id }]);
  res.status(201).json(data);
});

app.delete('/api/team', async (req, res) => {
  const { name, team } = req.body;
  await supabase.from('players').delete().match({ name, team });
  res.status(204).send();
});

module.exports = app;