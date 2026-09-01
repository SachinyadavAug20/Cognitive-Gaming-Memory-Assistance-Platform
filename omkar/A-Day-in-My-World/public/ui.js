// UI helpers: dialogue box, chapter cards, HUD, and generic minigame overlay.

export const $ = (id) => document.getElementById(id);

export function show(id) { $(id)?.classList.remove('hidden'); }
export function hide(id) { $(id)?.classList.add('hidden'); }

// ---------- Dialogue ----------
let currentLine = null;

export function say(text, opts = {}) {
  const box = $('dialogue');
  currentLine = text;
  let label = '🚶 You';
  if (opts.speaker) label = opts.speaker;
  if (opts.saathi) label = '🗣️ Saathi';
  if (opts.system) label = '📖 Story';
  box.querySelector('.d-name').textContent = label;
  box.querySelector('.d-text').textContent = text;
  show('dialogue');
  if (opts.voice) {
    import('./audio.js').then(a => a.speak(text, { saathi: opts.saathi }));
  }
}

export function clearSay() {
  hide('dialogue');
  currentLine = null;
  import('./audio.js').then(a => a.stopSpeech());
}

export function nextLineQueue(msg) {
  // placeholder for potential queueing; currently dialogue is immediate
}

// ---------- Chapter card ----------
export function chapterCard(num, title, subtitle) {
  const el = $('chapterCard');
  el.querySelector('.cc-num').textContent = `🎮 CHAPTER ${num}`;
  el.querySelector('.cc-title').textContent = title;
  el.querySelector('.cc-sub').textContent = subtitle || '';
  show('chapterCard');
  import('./audio.js').then(a => a.whoosh());
  setTimeout(() => hide('chapterCard'), 4200);
}

// ---------- HUD helpers ----------
export function setLevelLabel(txt) {
  const el = $('levelLabel');
  el.textContent = txt;
  show('levelLabel');
}

export function hideLevelLabel() { hide('levelLabel'); }

export function setObjective(txt) {
  const el = $('objective');
  el.textContent = txt;
  show('objective');
}

export function hideObjective() { hide('objective'); }

export function showPrompt(txt) { const el = $('prompt'); el.textContent = txt; show('prompt'); }
export function hidePrompt() { hide('prompt'); }

export function showToast(txt, ms = 2400) {
  const el = $('toast');
  el.textContent = txt;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), ms);
}
export function hideToast() {
  const el = $('toast');
  el.classList.remove('show');
}

export function setCrosshair(on = true) { $('crosshair').style.display = on ? 'block' : 'none'; }

// ---------- Generic choice/dialog overlay ----------
export function showActivity(title, subtitle) {
  const el = $('activityUI');
  el.querySelector('.a-title').textContent = title;
  el.querySelector('.a-sub').textContent = subtitle || '';
  el.querySelector('.a-body').innerHTML = '';
  el.querySelector('.a-footer').innerHTML = '';
  show('activityUI');
  return {
    body: el.querySelector('.a-body'),
    footer: el.querySelector('.a-footer'),
    close: () => hide('activityUI'),
  };
}

export function makeButton(label, opts = {}) {
  const b = document.createElement('button');
  b.textContent = label;
  b.className = opts.primary ? 'primary' : 'ghost';
  if (opts.tile) b.className = 'tile';
  if (opts.big) b.classList.add('big-btn');
  return b;
}

export function makeTile(text) {
  const b = document.createElement('button');
  b.className = 'tile';
  b.textContent = text;
  return b;
}
