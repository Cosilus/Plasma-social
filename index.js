const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // mettre ton URL ici
  ssl: { rejectUnauthorized: false }
});

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
    console.log('Database ready!');
  } catch (err) {
    console.error('Erreur création table:', err);
  }
})();

app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur récupération posts', details: err.message });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { author, walletAddress, content } = req.body;
    if (!author || !content) return res.status(400).json({ error: 'Author and content required' });

    const result = await pool.query(
      'INSERT INTO posts (author, wallet_address, content) VALUES ($1, $2, $3) RETURNING *',
      [author, walletAddress || null, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur publication', details: err.message });
  }
});

app.post('/like', async (req, res) => {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(400).json({ error: 'postId required' });

    const idInt = parseInt(postId);
    const result = await pool.query(
      'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [idInt]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur like', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
