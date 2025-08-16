const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔹 Config PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render Environment Variable
  ssl: { rejectUnauthorized: false }          // obligatoire sur Render
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

app.post('/posts', async (req, res) => {
  const { author, walletAddress, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: 'Author et content requis' });

  try {
    const result = await pool.query(
      'INSERT INTO posts (author, wallet_address, content) VALUES ($1, $2, $3) RETURNING *',
      [author, walletAddress || null, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erreur publication post:', err);
    res.status(500).json({ error: 'Erreur publication', details: err.message });
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
