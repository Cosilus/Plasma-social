const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const postsFile = path.join(__dirname, 'posts.json');

const corsOptions = {
  origin: 'https://plasmareviewer.netlify.app',
  optionsSuccessStatus: 200
};

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.json());

function readPosts() {
  try {
    const data = fs.readFileSync(postsFile, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writePosts(posts) {
  fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
}

app.get('/posts', (req, res) => {
  const posts = readPosts();
  res.json(posts);
});

app.post('/posts', (req, res) => {
  const posts = readPosts();
  const { author, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newPost = {
    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
    author: author || 'Anonyme',
    content,
    createdAt: new Date(),
    likes: 0
  };

  posts.push(newPost);
  writePosts(posts);

  res.status(201).json(newPost);
});

app.post('/posts/:id/like', (req, res) => {
  const posts = readPosts();
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) return res.status(404).send('Post not found');

  post.likes++;
  writePosts(posts);

  res.json(post);
});

app.delete('/posts/:id/like', (req, res) => {
  const posts = readPosts();
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) return res.status(404).send('Post not found');

  post.likes = Math.max(0, post.likes - 1);
  writePosts(posts);

  res.json(post);
});

app.listen(PORT, () => {
  console.log(`🚀 Server launched on port ${PORT}`);
});
