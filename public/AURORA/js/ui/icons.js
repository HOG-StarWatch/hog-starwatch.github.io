/* ============================================================
 * Aurora Toolbox — Icons
 * Stroke-based inline SVG icons (24x24, currentColor). Replace
 * UI emojis in HTML via <span class="ic" data-ic="name"></span>;
 * icons.js hydrates them to <svg> on DOM ready and on mutations.
 * Usage in JS: Ui.icon('copy') -> svg string
 * ============================================================ */
window.Ui = window.Ui || {};

Ui.ICONS = {
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  heart: '<path d="M12 20.5C7 16 3 12.6 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3 .8 4.2 2.1C13.2 4.8 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 3.7-4 7.1-9 11.6z"/>',
  home: '<path d="M3 11 12 3l9 8M5 10v11h14V10"/>',
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  flame: '<path d="M12 2c1 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 2 3 5a6 6 0 0 1-12 0c0-6 5-8 6-12z"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.2"/><circle cx="15.5" cy="8.5" r="1.2"/><circle cx="8.5" cy="15.5" r="1.2"/><circle cx="15.5" cy="15.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  cyclone: '<path d="M3 12a9 9 0 0 1 15-6.4M21 12a9 9 0 0 1-15 6.4"/><circle cx="12" cy="12" r="3"/>',
  save: '<path d="M5 3h11l5 5v13H5z"/><path d="M8 3v6h9V3M8 21v-7h8v7"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  upload: '<path d="M12 21V9m0 0 4 4m-4-4-4 4"/><path d="M4 7V4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'folder-open': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H6l-3 8V7z"/><path d="M3 18l3-8h15l-3 8H3z"/>',
  file: '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/>',
  package: '<path d="M4 7l8-3 8 3v10l-8 3-8-3z"/><path d="M4 7l8 3 8-3M12 10v9"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M4 12.5 10 18 20 6"/>',
  check2: '<path d="M5 12l5 5 9-11"/>',
  rocket: '<path d="M12 3c3 1 6 4 6 9-1 3-3 5-6 6-3-1-5-3-6-6 0-5 3-8 6-9z"/><circle cx="12" cy="11" r="2"/><path d="M9 19l-2 2M15 19l2 2M7 15l-3 1 2-3"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 15h18M7 4v5M17 4v5M7 15v5M17 15v5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/>',
  'rotate-cw': '<path d="M21 12a9 9 0 1 1-3-6.7M21 4v4h-4"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"/>',
  'corner-up-left': '<path d="M4 10l6 6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.5"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.3-1.6-.5-1.3.4-2.4 1.8-2.4h2.2A3.7 3.7 0 0 0 21 13.3C21 7.6 17 3 12 3z"/><circle cx="7.5" cy="10" r="1"/><circle cx="12" cy="7" r="1"/><circle cx="16.5" cy="9.5" r="1"/>',
  pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  pencil: '<path d="M17 3l4 4L8 20l-5 1 1-5z"/><path d="M14 6l4 4"/>',
  brush: '<path d="M7 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M7 9C7 6 9 3 14 2c-1 2-2 4-2 6l-5 1z"/>',
  eraser: '<path d="M13 4 20 11l-8 8H5l-3-3z"/>',
  ruler: '<path d="M6 3h12v18H6z"/><path d="M9 3v4M12 3v4M15 3v4M18 3v4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  ghost: '<path d="M6 21l2-2 2 2 2-2 2 2 2-2 2 2V8a6 6 0 0 0-12 0z"/><circle cx="9.5" cy="10" r="1"/><circle cx="14.5" cy="10" r="1"/>',
  music: '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  translate: '<path d="M4 5h9M8.5 3v2M6 10c1.5 3 3.5 5 6 7M3 19l6-9M15 5c1.5 2 2.5 4 3 7m0-7c1.5 2 2.5 4 3 7M15 19h6M15 19l3-6 3 6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9z"/>',
  fork: '<path d="M6 3v7M12 3v7M18 3v7M6 10a6 6 0 0 0 12 0M12 10v8l-3 3"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
  skull: '<circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><path d="M5.5 12a6.5 6.5 0 0 1 13 0c.9 0 1.5.8 1.5 1.6 0 .9-.7 1.6-1.6 1.6H18v3H6v-3H5.6c-.9 0-1.6-.7-1.6-1.6 0-.8.6-1.6 1.5-1.6z"/><path d="M9 20v-2M15 20v-2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-2.5 2.5-3.8 5.5-3.8 9S9.5 18.5 12 21c2.5-2.5 3.8-5.5 3.8-9S14.5 5.5 12 3z"/>',
  sprout: '<path d="M12 22V11M12 11c0-4 3-6 7-6 0 4-2 7-7 6zM12 14c1-3 3-4 6-4"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.5-1 1.2-1 2h-6c0-.8-.4-1.5-1-2A6 6 0 0 1 12 3z"/>',
  swap: '<path d="M4 7h13M13 3l4 4-4 4M20 17H7M11 13l-4 4 4 4"/>',
  inbox: '<path d="M3 13h5l2 3h4l2-3h5l-2 8H5z"/><path d="M3 13V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  flag: '<path d="M5 21V4m0 0h13l-2 4 2 4H5"/>',
  'arrow-right': '<path d="M4 12h16m0 0-5-5m5 5-5 5"/>',
  'arrow-left': '<path d="M20 12H4m0 0 5 5m-5-5 5-5"/>',
  'arrow-up': '<path d="M12 20V4m0 0-5 5m5-5 5 5"/>',
  'arrow-down': '<path d="M12 4v16m0 0 5-5m-5 5-5-5"/>',
  'arrows-h': '<path d="M3 12h18M13 7l5 5-5 5M11 7l-5 5 5 5"/>',
  'arrows-v': '<path d="M12 3v18m0 0 5-5m-5 5-5-5M12 3 17 8M12 3 7 8"/>',
  hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
  symbols: '<path d="M4 6h9M4 12h5M4 18h8"/><path d="M13 18l4-8 4 8M14 15h6M21 5c0 1-.8 1.5-1.5 1.5 0 2 .5 2.5.5 3.5"/>',
  bot: '<rect x="5" y="8" width="14" height="11" rx="3"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/><path d="M12 8V5M12 5h-2M10 21v-2M14 21v-2"/>',
  'grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  shuffle: '<path d="M3 6h3c3 0 4 3 6 3s3-3 6-3h3M3 18h3c3 0 4-3 6-3s3 3 6 3h3M18 3l3 3-3 3M18 15l3 3-3 3"/>',
  tomato: '<circle cx="12" cy="13" r="7"/><path d="M12 6c-1-3 2-4 5-3 1 2-1 4-4 3h-1zM12 6c-1-2 2-3 5-3"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  egg: '<path d="M12 3c3 4 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 3-6 6-10z"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  qrcode: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h3v3M20 14v3h-3M14 20h6"/>',
  terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  phone: '<path d="M5 4c0 8 7 15 15 15l2-5-5-2-2 3c-3-2-5-4-7-7l3-2-2-5z"/>',
  'sparkles': '<path d="M12 4l1.8 4.2L18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8z"/><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/>',
  gear: '<path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/><circle cx="12" cy="12" r="3"/>',
  wand: '<path d="M4 20l10-10M15 4l5 5M13 8l3 3M6 15l3 3M18 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>'
};

/** Return an inline <svg> string for a named icon. */
Ui.icon = function (name) {
  const body = Ui.ICONS[name];
  if (!body) return '';
  return '<svg class="ic-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
};

/** Hydrate all [data-ic] spans with their svg (idempotent). */
Ui.hydrateIcons = function (root) {
  root = root || document;
  root.querySelectorAll('span.ic[data-ic]').forEach(function (el) {
    if (el.querySelector('svg')) return;
    const svg = Ui.icon(el.dataset.ic);
    if (svg) el.innerHTML = svg;
  });
};

/* Hydrate on ready + mutations (dynamically injected icons) */
if (typeof document !== 'undefined') {
  const run = function () { if (window.Ui) Ui.hydrateIcons(document); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  const obs = new MutationObserver(function () { run(); });
  try { obs.observe(document.documentElement, { childList: true, subtree: true }); }
  catch (e) {}
}