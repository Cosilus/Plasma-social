const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: 'postgresql://plasma_posts_user:2OnIIceIw2jlPf6igh6KmaUdaY4JhKOG@dpg-d2gd0a0dl3ps73f6n8bg-a.oregon-postgres.render.com/plasma_posts',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à PostgreSQL réussie !');
  } catch (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err);
  }
})();

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        author TEXT NOT NULL,
        wallet_address TEXT,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table posts prête !');
  } catch (err) {
    console.error('❌ Erreur création table posts:', err);
  }
})();

app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Erreur récupération posts:', err);
    res.status(500).json({ error: 'Erreur chargement posts', details: err.message });
  }
});

app.post('/like', async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: 'postId requis' });

  try {
    const id = parseInt(postId, 10); // <- conversion en int
    if (isNaN(id)) return res.status(400).json({ error: 'postId invalide' });

    const result = await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Post introuvable' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur like post:', err);
    res.status(500).json({ error: 'Erreur like', details: err.message });
  }
});

app.post('/like', async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: 'postId requis' });

  try {
    await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur like post:', err);
    res.status(500).json({ error: 'Erreur like', details: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur le port ${PORT}`));
