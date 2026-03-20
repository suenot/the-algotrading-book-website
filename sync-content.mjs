/**
 * sync-content.mjs
 * Reads chapters from ../chapters/ and writes them into
 * src/content/docs/en/chapters/<block>/<slug>.md  (English)
 * src/content/docs/ru/chapters/<block>/<slug>.md  (Russian)
 * Adds Starlight frontmatter (title, sidebar label) to each file.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHAPTERS_DIR = path.resolve(__dirname, '../chapters');
const DOCS_DIR = path.resolve(__dirname, 'src/content/docs');

// Block ranges: [startChapter, endChapter] (inclusive, 1-indexed)
const BLOCKS = [
  { dir: '01-foundations',           range: [1, 24]   },
  { dir: '02-trading-strategies',    range: [25, 38]  },
  { dir: '03-transformers',          range: [39, 58]  },
  { dir: '04-llm',                   range: [59, 78]  },
  { dir: '05-nlp-bert',              range: [79, 101] },
  { dir: '06-meta-learning',         range: [102, 111]},
  { dir: '07-transfer-learning',     range: [112, 116]},
  { dir: '08-causal-inference',      range: [117, 131]},
  { dir: '09-explainability',        range: [132, 146]},
  { dir: '10-ssm-mamba',             range: [147, 161]},
  { dir: '11-physics-nn',            range: [162, 176]},
  { dir: '12-generative',            range: [177, 196]},
  { dir: '13-contrastive-ssl',       range: [197, 218]},
  { dir: '14-microstructure-lob',    range: [219, 238]},
  { dir: '15-reinforcement-learning',range: [239, 268]},
  { dir: '16-uncertainty-bayesian',  range: [269, 279]},
  { dir: '17-graph-nn',              range: [280, 290]},
  { dir: '18-cnn-timeseries',        range: [291, 300]},
  { dir: '19-federated-learning',    range: [301, 315]},
  { dir: '20-quantum-computing',     range: [316, 330]},
  { dir: '21-model-efficiency',      range: [331, 350]},
  { dir: '22-adversarial',           range: [351, 360]},
  { dir: '23-frontier',              range: [361, 365]},
];

function getBlockDir(num) {
  for (const block of BLOCKS) {
    if (num >= block.range[0] && num <= block.range[1]) return block.dir;
  }
  return 'misc';
}

function makeSlug(folderName) {
  // "001_algorithmic_intelligence_intro" → "001-algorithmic-intelligence-intro"
  return folderName.replace(/_/g, '-');
}

function getTitle(folderName, content) {
  // Try to extract first H1 from content
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  // Fallback: derive from folder name
  const parts = folderName.split('_').slice(1);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function stripFrontmatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) return content.slice(end + 3).trimStart();
  }
  return content;
}

function addFrontmatter(title, content) {
  const clean = stripFrontmatter(content);
  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n${clean}`;
}

// Get sorted chapter list
const chapters = fs.readdirSync(CHAPTERS_DIR)
  .filter(name => /^\d{3}_/.test(name))
  .sort();

let written = 0;
let skipped = 0;

for (const folder of chapters) {
  const num = parseInt(folder.slice(0, 3), 10);
  const blockDir = getBlockDir(num);
  const slug = makeSlug(folder);
  const chapterPath = path.join(CHAPTERS_DIR, folder);

  for (const [lang, readmeFile] of [['en', 'README.md'], ['ru', 'README.ru.md']]) {
    const srcFile = path.join(chapterPath, readmeFile);
    if (!fs.existsSync(srcFile)) { skipped++; continue; }

    const rawContent = fs.readFileSync(srcFile, 'utf-8');
    const title = getTitle(folder, rawContent);
    const finalContent = addFrontmatter(title, rawContent);

    const destDir = path.join(DOCS_DIR, lang, 'chapters', blockDir);
    fs.mkdirSync(destDir, { recursive: true });

    const destFile = path.join(destDir, `${slug}.md`);
    fs.writeFileSync(destFile, finalContent, 'utf-8');
    written++;
  }
}

console.log(`✓ Synced ${written} files (${skipped} skipped)`);
