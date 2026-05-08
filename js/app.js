let allPostsData = [];

document.addEventListener('DOMContentLoaded', async () => {
  const postListSection = document.getElementById('post-list');
  
  if (!postListSection) return; // index.html이 아니면 실행 안 함

  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Failed to load posts');
    
    allPostsData = await response.json();
    renderPosts(allPostsData);
    
    // search.js가 로드되어 있다면 초기화
    if (typeof initSearch === 'function') {
      initSearch(allPostsData, renderPosts);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    postListSection.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
  }
});

function renderPosts(posts) {
  const postListSection = document.getElementById('post-list');
  if (!postListSection) return;

  if (posts.length === 0) {
    postListSection.innerHTML = '<p>게시글이 없습니다.</p>';
    return;
  }

  postListSection.innerHTML = posts.map(post => `
    <article class="post-card">
      <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a></h2>
      <div class="meta">
        <span>📅 ${post.date}</span>
        ${post.category ? `<span class="category">📁 ${post.category}</span>` : ''}
      </div>
      <p class="excerpt">${post.excerpt}</p>
      <div class="tags">
        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    </article>
  `).join('');
}
