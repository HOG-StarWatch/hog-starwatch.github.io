#!/usr/bin/env node
/**
 * Phase 4 helper (dev-only): downloads every library listed in
 * vendor/manifest.json into vendor/, computes SHA-256 + size, enforces the
 * <20MB per-file constraint, and writes the hashes back into the manifest.
 *
 * Run (ON A MACHINE WITH INTERNET): node scripts/vendor-download.mjs
 * Re-runnable: skips files already downloaded & verified.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'vendor', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const MAX_BYTES = manifest.maxFileBytes || 20 * 1024 * 1024;

async function fetchBuffer(url, timeoutMs = 60000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

async function downloadFile(file, fallbacks) {
  const target = path.join(root, file.localPath);
  if (fs.existsSync(target) && file.sha256) {
    const existing = fs.readFileSync(target);
    if (crypto.createHash('sha256').update(existing).digest('hex') === file.sha256) {
      return { file, status: 'cached' };
    }
  }
  const urls = [file.url, ...(fallbacks || [])];
  let lastErr = null;
  for (const url of urls) {
    try {
      const buf = await fetchBuffer(url);
      if (buf.length > MAX_BYTES) {
        throw new Error(`文件超限 ${buf.length} bytes > ${MAX_BYTES} (单文件 < 20MB)`);
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, buf);
      file.sha256 = crypto.createHash('sha256').update(buf).digest('hex');
      file.size = buf.length;
      return { file, status: `ok (${url})` };
    } catch (e) {
      lastErr = e;
      console.warn(`  ! ${file.localPath} <- ${url} 失败: ${e.message}`);
    }
  }
  throw new Error(`全部源失败: ${file.localPath} (${lastErr && lastErr.message})`);
}

let ok = 0, failed = 0, cached = 0, skipped = 0;
for (const lib of manifest.libs) {
  console.log(`[${lib.name}@${lib.version || '?'}]`);
  if (lib.failed) {
    skipped++;
    console.log(`  - 跳过：清单标记 failed（上游失效）${lib.note ? '— ' + lib.note : ''}`);
    continue;
  }
  for (const file of lib.files) {
    try {
      const r = await downloadFile(file, lib.fallbackUrls);
      if (r.status === 'cached') cached++;
      else ok++;
      console.log(`  ✓ ${r.file.localPath} — ${r.status}${r.file.size ? `, ${(r.file.size / 1024).toFixed(1)} KB` : ''}`);
    } catch (e) {
      failed++;
      console.error(`  ✗ ${e.message}`);
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('\n--- 完成 ---');
console.log(`下载 ${ok}，缓存命中 ${cached}，跳过(上游失效) ${skipped}，失败 ${failed}`);
console.log('清单已回写 sha256/size；请提交 vendor/ 目录。');
process.exit(failed ? 1 : 0);