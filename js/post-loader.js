document.addEventListener('DOMContentLoaded', async () => {
  const postContent = document.getElementById('post-content');
  if (!postContent) return; // post.html이 아니면 실행 안 함

  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get('file');

  if (!fileName) {
    postContent.innerHTML = '<p>게시글을 찾을 수 없습니다.</p>';
    document.getElementById('post-title').textContent = 'Error';
    return;
  }

  try {
    const response = await fetch(`pages/${fileName}`);
    if (!response.ok) throw new Error('Post not found');

    let content = await response.text();

    // UTF-8 BOM 제거
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    parseAndRenderMarkdown(content);
    loadGiscus();
  } catch (error) {
    console.error('Error loading post:', error);
    postContent.innerHTML = '<p>게시글을 불러오는데 실패했습니다.</p>';
    document.getElementById('post-title').textContent = 'Error';
  }
});

function parseAndRenderMarkdown(rawContent) {
  const frontMatterMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

  let markdownContent = rawContent;
  let metadata = {};

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    markdownContent = frontMatterMatch[2];

    const lines = frontMatter.split(/\r?\n/);
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value.replace(/'/g, '"'));
          } catch {
            value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        metadata[key] = value;
      }
    });
  }

  // 메타데이터 렌더링
  if (metadata.title) {
    document.getElementById('post-title').textContent = metadata.title;
    document.title = `${metadata.title} - Developer Blog`;
  }
  if (metadata.date) {
    document.getElementById('post-date').textContent = `📅 ${metadata.date}`;
  }
  if (metadata.category) {
    document.getElementById('post-category').innerHTML = `📁 ${metadata.category}`;
  }
  if (metadata.tags && Array.isArray(metadata.tags)) {
    const tagsContainer = document.getElementById('post-tags');
    tagsContainer.innerHTML = metadata.tags.map(tag => `<span class="tag">#${tag}</span>`).join('');
  }

  // marked.js 설정 및 렌더링
  marked.setOptions({
    highlight: function (code, lang) {
      if (Prism.languages[lang]) {
        return Prism.highlight(code, Prism.languages[lang], lang);
      }
      return code;
    }
  });

  // 이미지 경로 수정 (../images/ -> images/)
  const correctedMarkdown = markdownContent.replace(/\.\.\/images\//g, 'images/');
  const htmlContent = marked.parse(correctedMarkdown);
  document.getElementById('post-content').innerHTML = htmlContent;

  // Prism.js 수동 실행 (필요한 경우)
  Prism.highlightAll();
}

function loadGiscus() {
  const giscusContainer = document.querySelector('.giscus');
  if (!giscusContainer) return;

  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';

  // Giscus 설정 - PLAN.md 4단계 참조하여 나중에 값 변경 필요
  script.setAttribute('data-repo', 'Dani-dong/Dani-dong.github.io');
  script.setAttribute('data-repo-id', 'R_kgDOSXY9hA');
  script.setAttribute('data-category', 'Announcements');
  script.setAttribute('data-category-id', 'DIC_kwDOSXY9hM4C8jY5');
  script.setAttribute('data-mapping', 'title');
  script.setAttribute('data-strict', '0');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '1');
  script.setAttribute('data-input-position', 'bottom');

  // 현재 테마 확인 후 Giscus 테마 설정
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  script.setAttribute('data-theme', currentTheme);

  script.setAttribute('data-lang', 'ko');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  giscusContainer.appendChild(script);

  // 테마 변경 시 Giscus 테마 업데이트를 위해 옵저버 등록
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe) return;
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: newTheme } } },
          'https://giscus.app'
        );
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });
}
