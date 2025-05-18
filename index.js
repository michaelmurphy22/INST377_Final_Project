const express = require('express');
const supabaseClient = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/team', async (req, res) => {
  const { data } = await supabase.from('players').select('*');
  res.json(data);
});

app.post('/team', async (req, res) => {
  const { name, team, position, player_id } = req.body;
  const { data } = await supabase
    .from('players')
    .insert([{ name, team, position, player_id }]);
  res.status(201).json(data);
});

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