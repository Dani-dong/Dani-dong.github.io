function initSearch(posts, renderCallback) {
  const searchInput = document.getElementById('search-input');
  const tagFiltersContainer = document.getElementById('tag-filters');
  
  if (!searchInput || !tagFiltersContainer) return;

  let currentSearchQuery = '';
  let activeTag = null;

  // 모든 태그 수집
  const allTags = new Set();
  posts.forEach(post => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach(tag => allTags.add(tag));
    }
  });

  // 태그 버튼 생성
  const tagsArray = Array.from(allTags).sort();
  tagFiltersContainer.innerHTML = `
    <button class="tag-btn ${activeTag === null ? 'active' : ''}" data-tag="">전체</button>
    ${tagsArray.map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('')}
  `;

  // 필터링 함수
  function filterPosts() {
    const filtered = posts.filter(post => {
      const matchQuery = currentSearchQuery === '' || 
        post.title.toLowerCase().includes(currentSearchQuery) || 
        post.excerpt.toLowerCase().includes(currentSearchQuery);
      
      const matchTag = activeTag === null || 
        (post.tags && post.tags.includes(activeTag));

      return matchQuery && matchTag;
    });
    
    renderCallback(filtered);
  }

  // 검색 이벤트
  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase();
    filterPosts();
  });

  // 태그 클릭 이벤트
  tagFiltersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-btn')) {
      // 기존 활성화 클래스 제거
      document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
      
      // 새 활성화 클래스 추가
      e.target.classList.add('active');
      
      const tag = e.target.getAttribute('data-tag');
      activeTag = tag === '' ? null : tag;
      
      filterPosts();
    }
  });
}
