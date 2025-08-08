const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/posts', (req, res) => {
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
  res.status(201).json(newPost);
});

app.post('/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Post not found');

  post.likes = (post.likes || 0) + 1;
  res.json(post);
});

app.delete('/posts/:id/like', (req, res) => {
  const id = parseInt(req.params.id);
  const post = posts.find(p => p.id === id);
  if (!post) return res.status(404).send('Post not found');

  post.likes = Math.max(0, (post.likes || 0) - 1);
  res.json(post);
});


app.listen(PORT, () => {
  console.log(`🚀 Server launched ${PORT}`);
});
