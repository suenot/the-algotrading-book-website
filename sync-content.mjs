/**
 * sync-content.mjs
 * Fetches README.md / README.ru.md from GitHub raw content at build time.
 * No local chapter files or submodules needed.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, 'src/content/docs');
const GH_RAW = 'https://raw.githubusercontent.com/suenot';
const CONCURRENCY = 10;

const BLOCKS = [
  { dir: '01-foundations',            range: [1, 24]   },
  { dir: '02-trading-strategies',     range: [25, 38]  },
  { dir: '03-transformers',           range: [39, 58]  },
  { dir: '04-llm',                    range: [59, 78]  },
  { dir: '05-nlp-bert',               range: [79, 101] },
  { dir: '06-meta-learning',          range: [102, 111]},
  { dir: '07-transfer-learning',      range: [112, 116]},
  { dir: '08-causal-inference',       range: [117, 131]},
  { dir: '09-explainability',         range: [132, 146]},
  { dir: '10-ssm-mamba',              range: [147, 161]},
  { dir: '11-physics-nn',             range: [162, 176]},
  { dir: '12-generative',             range: [177, 196]},
  { dir: '13-contrastive-ssl',        range: [197, 218]},
  { dir: '14-microstructure-lob',     range: [219, 238]},
  { dir: '15-reinforcement-learning', range: [239, 268]},
  { dir: '16-uncertainty-bayesian',   range: [269, 279]},
  { dir: '17-graph-nn',               range: [280, 290]},
  { dir: '18-cnn-timeseries',         range: [291, 300]},
  { dir: '19-federated-learning',     range: [301, 315]},
  { dir: '20-quantum-computing',      range: [316, 330]},
  { dir: '21-model-efficiency',       range: [331, 350]},
  { dir: '22-adversarial',            range: [351, 360]},
  { dir: '23-frontier',               range: [361, 365]},
];

// Generate chapter list: NNN → repo slug
const CHAPTERS = [];
for (let n = 1; n <= 365; n++) {
  const num = String(n).padStart(3, '0');
  // We need folder names — read from .gitmodules or reconstruct from known pattern
  // Since repos are named NNN-slug, we fetch the list once from GitHub API
  CHAPTERS.push(num);
}

function getBlockDir(num) {
  for (const block of BLOCKS) {
    if (num >= block.range[0] && num <= block.range[1]) return block.dir;
  }
  return 'misc';
}

function getTitle(content) {
  const h1 = content.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : 'Chapter';
}

function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) return content.slice(end + 3).trimStart();
  }
  return content;
}

function rewriteImageUrls(content, repoName) {
  const base = `${GH_RAW}/${repoName}/main`;
  // Rewrite markdown images: ![alt](relative/path) → ![alt](https://raw...)
  return content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (_, alt, src) => `![${alt}](${base}/${src.replace(/^\.\//, '')})`
  );
}

function addFrontmatter(title, content, repoName) {
  const body = rewriteImageUrls(stripFrontmatter(content), repoName);
  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n${body}`;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

// Fetch repo list from GitHub API to get folder→slug mapping
console.log('Fetching repo list from GitHub...');
let repos = [];
let page = 1;
while (true) {
  const res = await fetch(
    `https://api.github.com/users/suenot/repos?per_page=100&page=${page}`,
    { headers: { 'Accept': 'application/vnd.github.v3+json' } }
  );
  const data = await res.json();
  if (!data.length) break;
  const chapter = data.filter(r => /^\d{3}-/.test(r.name));
  repos.push(...chapter);
  if (data.length < 100) break;
  page++;
}
repos.sort((a, b) => a.name.localeCompare(b.name));
console.log(`Found ${repos.length} chapter repos on GitHub`);

// Process in batches
async function processBatch(batch) {
  return Promise.all(batch.map(async (repo) => {
    const num = parseInt(repo.name.slice(0, 3), 10);
    const blockDir = getBlockDir(num);
    const slug = repo.name; // already NNN-slug format

    const results = [];
    for (const [lang, file] of [['en', 'README.md'], ['ru', 'README.ru.md']]) {
      const url = `${GH_RAW}/${repo.name}/main/${file}`;
      const content = await fetchText(url);
      if (!content) { results.push({ ok: false }); continue; }

      const title = getTitle(content);
      const final = addFrontmatter(title, content, repo.name);
      const destDir = path.join(DOCS_DIR, lang === 'en' ? '' : lang, 'chapters', blockDir);
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(path.join(destDir, `${slug}.md`), final, 'utf-8');
      results.push({ ok: true });
    }
    return results;
  }));
}

let written = 0;
let failed = 0;

for (let i = 0; i < repos.length; i += CONCURRENCY) {
  const batch = repos.slice(i, i + CONCURRENCY);
  const results = await processBatch(batch);
  for (const r of results.flat()) {
    r.ok ? written++ : failed++;
  }
  process.stdout.write(`\r  ${i + batch.length}/${repos.length} repos processed...`);
}

console.log(`\n✓ Synced ${written} files (${failed} failed)`);
