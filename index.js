const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let posts = [];
let idCounter = 1;

app.get('/posts', (req, res) => {
  res.json(posts);
});

app.post('/posts', (req, res) => {
  const { author, content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content is required' });
  }
  const post = {
    id: idCounter++,
    author: author && author.trim() !== '' ? author.trim() : 'Anonyme',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0
  };
  posts.push(post);
  res.status(201).json(post);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});