import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "https://plasmareviewer.netlify.app" 
}));

app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://plasma_posts_user:2OnIIceIw2jlPf6igh6KmaUdaY4JhKOG@dpg-d2gd0a0dl3ps73f6n8bg-a.oregon-postgres.render.com/plasma_posts",
  ssl: { rejectUnauthorized: false } 
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      wallet TEXT NOT NULL,
      likes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};
initDB();

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/posts", async (req, res) => {
  const { name, content, wallet } = req.body;
  
const walletValue = wallet || '';

const result = await pool.query(
  "INSERT INTO posts (name, content, wallet) VALUES ($1, $2, $3) RETURNING *",
  [name, content, walletValue]
);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/posts/:id/like", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/posts/:id/like", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
