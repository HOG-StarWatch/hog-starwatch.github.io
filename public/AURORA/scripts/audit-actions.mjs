#!/usr/bin/env node
/**
 * Phase 2 acceptance audit.
 * For every tools/*.html:
 *  1. count remaining inline event attributes (must be 0),
 *  2. collect data-action names used,
 *  3. resolve each action: built-in | registered in js/tools/<base>.js (app.action('name'...))
 *     | global function declaration (function name...) in the same js file.
 * Reports unresolved actions.
 * Usage: node scripts/audit-actions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = path.join(root, 'tools');
const jsToolsDir = path.join(root, 'js', 'tools');

const INLINE_RE = /\son(click|change|input|load|submit|drop|dragover|keyup|keydown|keypress|mouseover|mouseout|mouseenter|mouseleave|focus|blur|dblclick|contextmenu|error)=/gi;
const BUILTINS = new Set(['copy', 'clear', 'file-click', 'window-open']);

let inlineTotal = 0;
let unresolved = 0;
let unresolvedList = [];

const files = fs.readdirSync(toolsDir).filter((f) => f.endsWith('.html')).sort();
for (const file of files) {
  const html = fs.readFileSync(path.join(toolsDir, file), 'utf8');
  const base = path.basename(file, '.html');

  const inlineCount = (html.match(INLINE_RE) || []).length;
  inlineTotal += inlineCount;

  const actions = [...html.matchAll(/data-action="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set(actions);
  if (!seen.size) {
    if (inlineCount) console.log(`${file}: ${inlineCount} inline events (!!)`);
    continue;
  }

  let jsText = '';
  let jsTextAll = '';
  try {
    jsText = fs.readFileSync(path.join(jsToolsDir, `${base}.js`), 'utf8');
  } catch (e) {}
  try {
    // additional per-tool scripts (legacy <base>__2.js splits; none remain,
    // kept for robustness) may hold globals
    const extra = fs.readdirSync(jsToolsDir).filter((f) => f.startsWith(`${base}__`) && f.endsWith('.js'));
    jsTextAll = extra.map((f) => fs.readFileSync(path.join(jsToolsDir, f), 'utf8')).join('\n');
  } catch (e) {}
  const jsAll = jsText + '\n' + jsTextAll;

  for (const name of seen) {
    if (BUILTINS.has(name)) continue;
    if (jsText.includes(`app.action('${name}'`)) continue;
    // global function declaration? function name(...) at top level
    const fnRe = new RegExp(`function\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`);
    if (fnRe.test(jsAll)) continue;
    // window.name = ... assignment (arrow or function expression)
    const winRe = new RegExp(`window\\.${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=`);
    if (winRe.test(jsAll)) continue;
    unresolved++;
    unresolvedList.push(`${file}: data-action="${name}" unresolved`);
  }
  if (inlineCount) console.log(`${file}: ${inlineCount} inline events (!!)`);
}

console.log('--- summary ---');
console.log(`files checked: ${files.length}`);
console.log(`remaining inline event attrs: ${inlineTotal}`);
console.log(`unresolved data-actions: ${unresolved}`);
unresolvedList.forEach((l) => console.log('  ' + l));
process.exit(inlineTotal === 0 && unresolved === 0 ? 0 : 1);