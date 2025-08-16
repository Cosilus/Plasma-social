const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const pool = new Pool({
  connectionString: "postgresql://plasma_posts_user:2OnIIceIw2jlPf6igh6KmaUdaY4JhKOG@dpg-d2gd0a0dl3ps73f6n8bg-a.oregon-postgres.render.com/plasma_posts",
  ssl: { rejectUnauthorized: false }
});


(async () => {
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
})();


app.get('/posts', async (req, res) => {
  const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/like', async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: 'postId required' });

  const result = await pool.query(
    'UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
    [parseInt(postId)]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json(result.rows[0]);
});

app.post('/like', async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ error: 'postId required' });

  await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
