document.addEventListener('DOMContentLoaded', function(){
  const API_URL = 'https://ton-backend-render-url.onrender.com'; // <-- Remplace par ton URL Render

  const authorEl = document.getElementById('author');
  const contentEl = document.getElementById('content');
  const postBtn = document.getElementById('postBtn');
  const charCounter = document.getElementById('charCounter');
  const feedEl = document.getElementById('feed');
  const sortSelect = document.getElementById('sortSelect');

  let posts = [];

  async function fetchPosts(){
    try {
      const res = await fetch(`${API_URL}/posts`);
      posts = await res.json();
      render();
    } catch(e) {
      alert('Erreur de chargement des posts.');
    }
  }

  async function postNew(){
    const author = (authorEl.value || 'Anonyme').trim();
    const content = contentEl.value.trim();
    if(!content) { alert('Le message est vide.'); return; }
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ author, content })
      });
      if(!res.ok) throw new Error('Erreur au serveur');
      authorEl.value = '';
      contentEl.value = '';
      charCounter.textContent = `0 / 5000`;
      await fetchPosts();
    } catch(e){
      alert('Erreur lors de l'envoi du post.');
    }
  }

  function render(){
    const mode = sortSelect.value;
    let toShow = posts.slice();
    if(mode === 'new') toShow.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
    else toShow.sort((a,b)=> b.likes - a.likes || new Date(b.createdAt)-new Date(a.createdAt));

    feedEl.innerHTML = '';
    toShow.forEach(p => feedEl.appendChild(createPostNode(p)));

    document.getElementById('countInfo').textContent = `${posts.length} posts`;
  }

  function createPostNode(p){
    const node = document.createElement('div'); 
    node.className = 'post';

    const meta = document.createElement('div'); 
    meta.className = 'meta-row';
    const author = document.createElement('strong'); 
    author.textContent = p.author;
    const sep = document.createElement('span'); 
    sep.textContent = ' · ';
    const ago = document.createElement('span'); 
    ago.textContent = timeAgo(p.createdAt);
    meta.appendChild(author); 
    meta.appendChild(sep); 
    meta.appendChild(ago);

    const content = document.createElement('div'); 
    content.className = 'content';
    content.textContent = p.content;
    content.style.maxHeight = '60px';
    content.style.overflow = 'hidden';
    content.style.transition = 'max-height 0.3s ease';

    node.appendChild(meta); 
    node.appendChild(content);

    return node;
  }

  function timeAgo(iso){ 
    const d = new Date(iso); 
    const s = Math.floor((Date.now()-d.getTime())/1000); 
    if(s<60) return s+'s'; 
    if(s<3600) return Math.floor(s/60)+'m'; 
    if(s<86400) return Math.floor(s/3600)+'h'; 
    return Math.floor(s/86400)+'j'; 
  }

  contentEl.addEventListener('input', function(){
    if(this.value.length > 5000) this.value = this.value.slice(0,5000);
    charCounter.textContent = `${this.value.length} / 5000`;
  });

  postBtn.addEventListener('click', postNew);
  sortSelect.addEventListener('change', render);

  fetchPosts();
});