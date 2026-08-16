// Busca os posts direto do repositório no GitHub (pasta content/posts).
// Não precisa de build nem de servidor: lê o conteúdo publicado via API pública do GitHub.

const GITHUB_OWNER = 'rodrigogrillo';
const GITHUB_REPO = 'fisioricardo';
const GITHUB_BRANCH = 'main';
const POSTS_PATH = 'content/posts';

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const [, frontmatter, body] = match;
  const data = {};
  frontmatter.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    value = value.replace(/^["']|["']$/g, '');
    data[key] = value;
  });
  return { data, body: body.trim() };
}

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

async function listPostFiles() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Erro ao listar posts (${res.status})`);
  }
  const files = await res.json();
  return files.filter((f) => f.name.endsWith('.md'));
}

async function fetchRawMarkdown(downloadUrl) {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Erro ao buscar conteúdo (${res.status})`);
  return res.text();
}

async function fetchPosts() {
  const files = await listPostFiles();
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await fetchRawMarkdown(file.download_url);
      const { data } = parseFrontmatter(raw);
      return {
        slug: slugFromFilename(file.name),
        title: data.title || slugFromFilename(file.name),
        date: data.date || null,
        cover: resolveCover(data.cover),
        excerpt: data.excerpt || '',
      };
    })
  );
  return posts;
}

async function fetchPost(slug) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${POSTS_PATH}/${slug}.md?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Erro ao buscar post (${res.status})`);
  }
  const file = await res.json();
  const raw = await fetchRawMarkdown(file.download_url);
  const { data, body } = parseFrontmatter(raw);
  return {
    title: data.title || slug,
    date: data.date || null,
    cover: resolveCover(data.cover),
    excerpt: data.excerpt || '',
    body,
  };
}

function resolveCover(cover) {
  if (!cover) return null;
  if (cover.startsWith('http')) return cover;
  // caminhos vindos do CMS (ex: /assets/blog/foto.jpg) viram raw.githubusercontent
  const clean = cover.replace(/^\//, '');
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${clean}`;
}
