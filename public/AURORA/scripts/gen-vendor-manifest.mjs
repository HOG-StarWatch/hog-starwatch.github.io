#!/usr/bin/env node
/**
 * Phase 4 helper (dev-only): parses the library registry in js/loader.js and
 * generates vendor/manifest.json — the source of truth for vendoring.
 * Run: node scripts/gen-vendor-manifest.mjs
 * Then (on a machine WITH internet): node scripts/vendor-download.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loaderText = fs.readFileSync(path.join(root, 'js', 'loader.js'), 'utf8');

// --- extract the registry object literal ---
const start = loaderText.indexOf('registry: {');
const endMarker = '// Track loaded libraries';
const end = loaderText.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('registry literal not found in loader.js');
const literal = loaderText.slice(start + 'registry: '.length, end).trim().replace(/,\s*$/, '');
let registry;
try {
  registry = new Function(`return (${literal})`)();
} catch (e) {
  throw new Error(`failed to parse registry literal: ${e.message}`);
}

// --- helpers ---
function extractVersion(url) {
  const m = url.match(/@([0-9][0-9a-zA-Z.\-]*)/) || url.match(/\/(v?[0-9]+\.[0-9]+\.[0-9]+[^/]*)\//) || url.match(/\/(\d{8})\//);
  return m ? m[1].replace(/^v/, '') : null;
}
function basename(url) {
  try {
    const p = new URL(url).pathname;
    const b = p.split('/').filter(Boolean).pop();
    return b || 'index.js';
  } catch (e) {
    return 'index.js';
  }
}
function safeFileName(b) {
  let s = b.replace(/@/g, '-').replace(/[?#].*$/, '');
  if (!/\.[a-zA-Z0-9]{2,}$/.test(s)) s += '.js';
  return s;
}
function normalizeUrls(entry) {
  if (Array.isArray(entry)) return entry;
  if (entry && typeof entry === 'object') {
    const arr = [];
    if (entry.url) arr.push(entry.url);
    if (entry.fallback) arr.push(entry.fallback);
    return arr;
  }
  return [];
}

// font-awesome webfont assets (same host family as the css primary)
function fontAwesomeAssets(lib, urls) {
  const base = urls[0].replace(/[^/]*$/, 'webfonts/');
  const fonts = ['fa-solid-900.woff2', 'fa-regular-400.woff2', 'fa-brands-400.woff2'];
  return fonts.map((f) => ({ url: base + f, localPath: `vendor/${lib}/${f}` }));
}

// zstd-wasm real layout (0.0.9 lib/): index.mjs imports ./binary.js + ./ctypes.mjs
function zstdWasmEsmAssets(lib, urls) {
  const base = urls[0].replace(/[^/]*$/, '');
  return ['binary.js', 'ctypes.mjs'].map((f) => ({
    url: base + f,
    localPath: `vendor/${lib}/${f}`
  }));
}

const MAX_BYTES = 20 * 1024 * 1024; // 20MB per file constraint
const libs = [];
for (const [name, entry] of Object.entries(registry)) {
  const urls = normalizeUrls(entry);
  if (!urls.length) continue;
  const version = extractVersion(urls[0]);
  const primary = urls[0];
  // esm.sh modules carry a dependency import graph; ?bundle inlines it into one file
  const esmGraph = /esm\.sh|skypack\.dev/.test(primary);
  const bundleQuery = esmGraph ? '?bundle' : '';
  const localPath = `vendor/${name}/${safeFileName(basename(primary))}`;
  const files = [{ url: primary + bundleQuery, localPath, sha256: null, size: null }];
  if (name === 'font-awesome') files.push(...fontAwesomeAssets(name, urls));
  if (name === 'zstd-wasm-esm') files.push(...zstdWasmEsmAssets(name, urls));
  const lib = {
    name,
    version,
    license: null, // fill manually if known
    files,
    fallbackUrls: urls.slice(1)
  };
  if (esmGraph) {
    lib.esmGraph = true;
    lib.note = 'esm.sh 依赖图已用 ?bundle 合并；若下载失败请保留 CDN 回退';
  }
  libs.push(lib);
}

// Merge with the previous manifest so hand-applied fixes (font sources, wasm
// assets, failed flags, notes) survive regeneration.
const prevPath = path.join(root, 'vendor', 'manifest.json');
if (fs.existsSync(prevPath)) {
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(prevPath, 'utf8')); } catch (e) {}
  if (prev && Array.isArray(prev.libs)) {
    for (const lib of libs) {
      const old = prev.libs.find((l) => l.name === lib.name);
      if (!old) continue;
      if (old.files && old.files.length) lib.files = old.files;
      if (old.failed !== undefined) lib.failed = old.failed;
      if (old.note) lib.note = old.note;
      if (old.license) lib.license = old.license;
    }
  }
}

const manifest = {
  schema: 1,
  generatedBy: 'scripts/gen-vendor-manifest.mjs',
  note: '本地优先依赖清单。下载后 sha256/size 会被填充；单文件必须 < 20MB。',
  maxFileBytes: MAX_BYTES,
  libs
};

const outPath = path.join(root, 'vendor', 'manifest.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`manifest written: ${outPath}`);
console.log(`libs: ${libs.length}, files: ${libs.reduce((n, l) => n + l.files.length, 0)}`);
libs.forEach((l) => console.log(`  ${l.name}@${l.version || '?'} -> ${l.files[0].localPath} (${l.files.length} file(s), fallbacks: ${l.fallbackUrls.length})`));