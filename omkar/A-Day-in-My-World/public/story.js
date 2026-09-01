// Story engine: the 5-chapter guided campaign + opening + final memory.
// Works alongside game.js via a small api object.

import * as UI from './ui.js';
import * as A from './audio.js';

export let api = null; // set by game.js

let state = {
  phase: 'idle',     // menu | opening | collecting | ... | final | ending
  level: 1,
  playerPos: null,
  collecting: [],
  found: [],
};

let pieces = []; // collected journey items for final chapter

// ---------- save / continue ----------
const SAVE_KEY = 'adimw_progress';
export function saveProgress(chapter) {
  try {
    const cur = progress();
    if (chapter > cur) localStorage.setItem(SAVE_KEY, String(chapter));
  } catch (e) {}
}
export function progress() {
  try { return parseInt(localStorage.getItem(SAVE_KEY)) || 0; } catch (e) { return 0; }
}
export function clearProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// ============================================================
//  INTERFACE
// ============================================================
export function init(gameAPI) {
  api = gameAPI;
  UI.setCrosshair(true);
}

// Start the game from a given chapter (1 = opening + ch1 bootstrap).
export async function startAt(chapter) {
  state.phase = 'story';
  api.lockControls(false);
  api.freeze(true);
  A.ensureAudio();
  api.setMorning(true);
  if (chapter <= 1) {
    await startOpening();
  } else {
    await startChapter(chapter);
  }
}

export function getPhase() { return state.phase; }
export function getLevel() { return state.level; }

// ---------- Saathi & narration ----------
function saathi(text, hold = false) {
  UI.say(text, { saathi: true, voice: true });
  A.speak(text, { saathi: true });
}
function you(text) { UI.say(text, { voice: true }); }
function story(text) { UI.say(text, { system: true }); }

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function sayAnd(text, ms = 4200) {
  saathi(text);
  await wait(ms);
}

// ============================================================
//  OPENING SCENE - wake up
// ============================================================
export async function startOpening() {
  state.phase = 'opening';
  UI.setCrosshair(false);
  api.lockControls(false);
  api.freeze(true);

  A.ensureAudio();
  api.setMorning(true);
  api.transitionTo('house');
  api.setPlayerPos(0, 1.7, 2);
  api.lookAt(0, 1.5, -8);

  await wait(800);
  story('🌅 Morning. A soft golden light fills the room.');
  A.ringAlarm();
  UI.say('🔔 Ring... Ring... 🔔', { system: true, voice: false });
  await wait(3200);

  you('“Where was I supposed to go today?”');
  await wait(3200);

  await sayAnd('Good morning. Don’t worry. Let’s remember together. Look at the note on the table.', 5200);
  api.pointAt('note');

  story('On the table is a handwritten note: “Today is an important day.”');
  await wait(4200);

  await sayAnd('But part of the note is missing. Our mission: find the missing pieces of the day. Let’s begin.', 5200);

  api.unlockControls(false);
  api.freeze(false);
  await startChapter(1);
}

// ============================================================
//  CHAPTER SYSTEM
// ============================================================
async function startChapter(n) {
  state.level = 1;
  saveProgress(n);
  if (n === 1) {
    UI.chapterCard('1', 'A Morning to Remember', 'Short-term memory + object recognition');
    await wait(3600);
    await runCh1();
  } else if (n === 2) {
    UI.chapterCard('2', 'The Missing Photograph', 'Before we leave, one last thing...');
    await wait(3600);
    await runCh2();
  } else if (n === 3) {
    UI.chapterCard('3', 'The Way to the Market', 'Spatial memory + navigation');
    await wait(3600);
    await runCh3();
  } else if (n === 4) {
    UI.chapterCard('4', 'The Market Mission', 'Working memory + planning + calculation');
    await wait(3600);
    await runCh4();
  } else if (n === 5) {
    UI.chapterCard('5', 'Something Isn’t Right', 'Problem solving');
    await wait(3600);
    await runCh5();
  } else if (n === 6) {
    UI.chapterCard('6', 'The Memory', 'Reconstruct your journey');
    await wait(3600);
    await runFinal();
  }
}

// ============================================================
//  CHAPTER 1 - remember & collect objects
// ============================================================
async function runCh1() {
  api.transitionTo('house');
  api.setMorning(true);
  api.unlockControls(false);
  await wait(1200);

  const objects = ['key', 'cap', 'bag'];

  UI.showActivity('🔑 Remember these three things', 'Look carefully. I’ll hide them soon.');
  const memBody = UI.$('activityUI').querySelector('.a-body');
  const memo = document.createElement('div');
  memo.className = 'memo-row';
  objects.forEach(o => {
    const t = UI.makeTile({ key: '🔑', cap: '🧢', bag: '👜' }[o]);
    memo.appendChild(t);
  });
  memBody.appendChild(memo);

  const off = UI.$('activityUI').querySelector('.a-footer');
  const goBtn = UI.makeButton('I’ve memorized them', { primary: true });
  goBtn.onclick = async () => {
    UI.hide('activityUI');
    await sayAnd('Now find them around the house and pick them up.', 3600);
    await startCh1Collect(objects);
  };
  off.appendChild(goBtn);
}

async function startCh1Collect(objects) {
  state.phase = 'collecting';
  UI.setLevelLabel(state.level === 4 ? 'Level 4 — remember the order!' : `Level ${state.level}`);
  UI.setObjective(`Collect: ${objects.map(o => ({ key: '🔑', cap: '🧢', bag: '👜' })[o]).join(' ')}`);

  const spawnPoints = [
    [-5, 1.0, 2], [5, 1.0, -3], [2, 1.0, 5], [-2, 1.0, -5],
    [6, 1.0, 6], [-7, 1.0, -1], [0, 1.0, 1], [7, 1.0, -7],
  ];
  const shuffled = [...spawnPoints].sort(() => Math.random() - 0.5);

  state.collecting = [];
  state.found = [];
  objects.forEach((obj, i) => {
    const id = api.spawnCollectible(obj, shuffled[i][0], shuffled[i][1], shuffled[i][2]);
    state.collecting.push({ obj, id, collected: false });
  });

  await wait(200);
  api.unlockControls(true);
}

// called by game.js when the player is near a collectible
export function tryCollect(objectName) {
  if (state.phase !== 'collecting') return false;
  const c = state.collecting.find(x => x.obj === objectName && !x.collected);
  if (!c) return false;

  const order = ['key', 'cap', 'bag'];
  const nextIndex = state.found.length;

  if (state.level === 4 && objectName !== order[nextIndex]) {
    UI.showToast(`First pick: ${({ key: '🔑 Key', cap: '🧢 Cap' })[order[nextIndex]] || 'the next item'}. Remember the order!`);
    A.buzz();
    return true;
  }

  c.collected = true;
  state.found.push(objectName);
  A.chime();
  api.removeCollectible(c.id);
  pieces.push({ key: '🔑', cap: '🧢', bag: '👜' }[objectName]);

  const remaining = state.collecting.filter(x => !x.collected);
  if (remaining.length === 0) {
    UI.hideObjective();
    UI.hideLevelLabel();
    UI.hidePrompt();
    UI.showToast('All found! Great memory!');
    api.unlockControls(false);
    setTimeout(() => advanceChapter1(), 1500);
  } else {
    UI.setObjective(`Collect: ${remaining.map(x => ({ key: '🔑', cap: '🧢', bag: '👜' })[x.obj]).join(' ')}`);
  }
  return true;
}

function advanceChapter1() {
  const level = state.level;
  if (level < 4) {
    state.level++;
    UI.say('Great! Let’s make it a little harder.', { saathi: true, voice: true });
    setTimeout(() => runCh1(), 2500);
  } else {
    UI.say('Wonderful! We have our things. Now let’s leave.', { saathi: true, voice: true });
    setTimeout(() => {
      A.doorOpen();
      startChapter(2);
    }, 3000);
  }
}

// ============================================================
//  CHAPTER 2 - missing photograph
// ============================================================
async function runCh2() {
  api.transitionTo('house');
  api.unlockControls(false);
  await wait(1500);
  let count;
  let similar = false;
  if (state.level === 1) count = 3;
  else if (state.level === 2) count = 5;
  else if (state.level === 3) { count = 5; similar = true; }
  else { count = 5; similar = true; }

  if (state.level === 4) {
    await showPhotoMemory();
    return;
  }

  const targetIndex = Math.floor(Math.random() * count);
  await sayAnd('An old photo album. Someone important is missing from this album.', 4200);
  await sayAnd('Look at these photographs. Which one shows the missing family member?', 4200);

  UI.showActivity('📸 The Missing Photograph', 'Choose the photograph that is missing from the album.');
  const body = UI.$('activityUI').querySelector('.a-body');
  const grid = document.createElement('div');
  grid.className = 'photo-grid';
  const photoEmoji = ['👨', '👩', '👧', '👦', '👵', '👴', '👶', '🧑'];
  for (let i = 0; i < count; i++) {
    const cell = document.createElement('button');
    cell.className = 'photo-cell';
    if (i === targetIndex) {
      cell.textContent = photoEmoji[0];
    } else {
      cell.textContent = similar ? photoEmoji[Math.floor(Math.random() * 4) + 1] : photoEmoji[Math.floor(Math.random() * photoEmoji.length)];
    }
    cell.onclick = () => {
      if (i === targetIndex) {
        grid.querySelectorAll('.photo-cell').forEach(c => c.disabled = true);
        cell.classList.add('correct');
        UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="correct">✅ That’s them! The album is complete.</span></div>';
        A.chime();
        pieces.push('📸');
        setTimeout(() => { UI.hide('activityUI'); advanceChapter2(); }, 1800);
      } else {
        cell.classList.add('wrong');
        saathi('Hmm, are you sure? That’s the neighbour... try again.');
      }
    };
    grid.appendChild(cell);
  }
  body.appendChild(grid);
}

async function showPhotoMemory() {
  await sayAnd('I’ll show you the photograph quickly. Remember it!', 3000);
  UI.showActivity('📸 Remember this face', 'Watch carefully — it will disappear.');
  const body = UI.$('activityUI').querySelector('.a-body');
  const big = document.createElement('div');
  big.className = 'memo-big';
  big.textContent = '👵';
  body.appendChild(big);
  await wait(2500);
  UI.hide('activityUI');

  await sayAnd('Now which face was it?', 2500);
  UI.showActivity('📸 Which face did you see?', 'Choose the photograph that matches.');
  const b2 = UI.$('activityUI').querySelector('.a-body');
  const grid = document.createElement('div');
  grid.className = 'photo-grid';
  const opts = ['👵', '👨', '👧', '👴'];
  opts.forEach((e, i) => {
    const cell = document.createElement('button');
    cell.className = 'photo-cell'; cell.textContent = e;
    cell.onclick = () => {
      if (e === '👵') {
        grid.querySelectorAll('.photo-cell').forEach(c => c.disabled = true);
        cell.classList.add('correct');
        UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="correct">✅ Correct! That was her.</span></div>';
        A.chime();
        pieces.push('📸');
        setTimeout(() => { UI.hide('activityUI'); advanceChapter2(); }, 1800);
      } else {
        cell.classList.add('wrong');
        saathi('Not quite. Look again at the face I showed you.');
      }
    };
    grid.appendChild(cell);
  });
  b2.appendChild(grid);
}

async function advanceChapter2() {
  const level = state.level;
  if (level < 4) {
    state.level++;
    UI.say('Lovely! Let’s try a little harder.', { saathi: true, voice: true });
    setTimeout(() => runCh2(), 2500);
  } else {
    UI.say('Now, we need to go to the market. Do you remember the way?', { saathi: true, voice: true });
    setTimeout(() => { A.doorOpen(); startChapter(3); }, 3000);
  }
}

// ============================================================
//  CHAPTER 3 - navigation
// ============================================================
async function runCh3() {
  api.transitionTo('neighborhood');
  await wait(1500);
  const level = state.level;
  api.unlockControls(true);
  api.setCrosshair(true);
  api.showBarrier(false);

  if (level === 1) {
    UI.setLevelLabel('Level 1 — follow the path');
    await sayAnd('Remember the way to the market.', 3200);
    api.showRoute(true);
    await wait(3000);
    api.showRoute(false);
    await sayAnd('Now walk to the market — follow the highlighted path.', 3400);
    UI.setObjective('Follow the path to the 🛒 Market');
  } else if (level === 2) {
    UI.setLevelLabel('Level 2 — a longer way');
    await sayAnd('Let’s go again. This time the way is a little longer.', 3200);
    api.showRoute(true);
    await wait(2200);
    api.showRoute(false);
    await sayAnd('Walk to the market now.', 3000);
    UI.setObjective('Navigate to the 🛒 Market');
  } else if (level === 3) {
    UI.setLevelLabel('Level 3 — road closed');
    await sayAnd('Oh! A road is closed ahead. We must find another way.', 3400);
    api.showBarrier(true);
    UI.setObjective('Find another way to the 🛒 Market');
  } else {
    UI.setLevelLabel('Level 4 — landmarks only');
    await sayAnd('No highlighted path this time. Use the landmarks to find the market.', 3400);
    UI.setObjective('Use landmarks to reach the 🛒 Market');
  }
  api.setGoal('market');
}

// called by game.js when player reaches the goal (market)
export function goalReached() {
  api.setGoal(null);
  UI.hideObjective();
  UI.hideLevelLabel();
  api.showBarrier(false);
  A.chime();
  pieces.push('🛒');

  if (state.level < 4) {
    state.level++;
    UI.say('You made it to the market! Let’s try the way once more.', { saathi: true, voice: true });
    A.doorOpen();
    setTimeout(() => runCh3(), 2500);
  } else {
    UI.say('You made it to the market! Let’s catch our breath and shop.', { saathi: true, voice: true });
    setTimeout(() => startChapter(4), 2500);
  }
}

// ============================================================
//  CHAPTER 4 - market mission
// ============================================================
async function runCh4() {
  api.transitionTo('market');
  api.unlockControls(false);
  await wait(1500);
  const level = state.level;

  const baseList = {
    1: [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120]],
    2: [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120], ['🍞', 'Bread', 50]],
    3: [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120], ['🍞', 'Bread', 50], ['🧈', 'Butter', 60]],
    4: [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120], ['🍞', 'Bread', 50], ['🧈', 'Butter', 60]],
    5: [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120], ['🍞', 'Bread', 50], ['🧈', 'Butter', 60]],
  };
  const list = baseList[level] || baseList[3];
  const names = list.map(x => x[0]);

  if (level <= 2) {
    await sayAnd(`Here is your shopping list: ${names.join(' ')}. Remember it!`, 4600);
  } else if (level === 3) {
    UI.showActivity('🛒 Shopping List', 'Remember these items, then shop from memory.');
    const body = UI.$('activityUI').querySelector('.a-body');
    const memo = document.createElement('div');
    memo.className = 'memo-row';
    names.forEach(n => memo.appendChild(UI.makeTile(n)));
    body.appendChild(memo);
    await wait(4000);
    UI.hide('activityUI');
    await sayAnd('Now remember them and buy the right items!', 3200);
  }

  if (level === 4) await sayAnd('Careful! You have only ₹500. Don’t overspend.', 3800);
  if (level === 5) await sayAnd('Buy the list within ₹500 and mind your change.', 3800);

  UI.setCrosshair(true);
  UI.showActivity('🛒 The Market Mission', `Buy from your list${level >= 4 ? ' — budget ₹500' : ''}`);
  const body = UI.$('activityUI').querySelector('.a-body');

  const listLabel = document.createElement('div');
  listLabel.className = 'act-sub';
  listLabel.textContent = 'Your list: ' + (level >= 3 ? '???' : names.join(' '));
  body.appendChild(listLabel);

  const storeRow = document.createElement('div');
  storeRow.className = 'photo-grid';
  const store = [['🥛', 'Milk', 40], ['🍎', 'Apples', 80], ['🍚', 'Rice', 120], ['🍞', 'Bread', 50], ['🧈', 'Butter', 60], ['🍬', 'Candy', 20], ['🧃', 'Juice', 60]];
  store.forEach(s => {
    const cell = document.createElement('button');
    cell.className = 'photo-cell';
    cell.innerHTML = `<div class="shop-emoji">${s[0]}</div><div class="shop-price">₹${s[1]}</div>`;
    cell.dataset.name = s[0]; cell.dataset.price = s[1];
    cell.onclick = () => toggleBuy(cell, s[0], s[1]);
    storeRow.appendChild(cell);
  });
  body.appendChild(storeRow);

  const budgetRow = document.createElement('div');
  budgetRow.className = 'act-sub';
  budgetRow.id = 'budgetRow';
  budgetRow.textContent = '🛒 Basket: —   Total: ₹0';
  body.appendChild(budgetRow);

  const off = UI.$('activityUI').querySelector('.a-footer');
  const buyBtn = UI.makeButton('✅ Pay', { primary: true });
  buyBtn.onclick = () => checkout(list, level);
  off.appendChild(buyBtn);
}

let basket = [];
function toggleBuy(cell, name, price) {
  const idx = basket.findIndex(b => b.name === name);
  if (idx >= 0) { basket.splice(idx, 1); cell.classList.remove('bought'); }
  else { basket.push({ name, price }); cell.classList.add('bought'); }
  const total = basket.reduce((s, b) => s + b.price, 0);
  UI.$('budgetRow').textContent = '🛒 Basket: ' + (basket.length ? basket.map(b => b.name).join(' ') : '—') + `   Total: ₹${total}`;
}

async function checkout(list, level) {
  const total = basket.reduce((s, b) => s + b.price, 0);
  const budget = 500;
  const boughtNames = basket.map(b => b.name).sort();
  const listNames = list.map(x => x[0]).sort();
  const matchesList = boughtNames.length === listNames.length && boughtNames.every((v, i) => v === listNames[i]);

  if (!matchesList) {
    UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="wrong">That’s not your list. Check again!</span></div>';
    A.buzz();
    return;
  }
  if (level >= 4 && total > budget) {
    UI.$('activityUI').querySelector('.a-footer').innerHTML = `<div class="result-msg"><span class="wrong">Over budget! You spent ₹${total} of ₹${budget}.</span></div>`;
    A.buzz();
    return;
  }

  if (level === 5) {
    const correctChange = 500 - total;
    const body = UI.$('activityUI').querySelector('.a-body');
    body.innerHTML = `
      <div class="act-sub">Great! Your total is ₹${total}. You gave ₹500.</div>
      <div class="calc-question">How much change should you get?</div>`;
    const optsRow = document.createElement('div');
    optsRow.className = 'photo-grid';
    UI.$('activityUI').querySelector('.a-footer').innerHTML = '';
    body.appendChild(optsRow);
    const wrongs = [correctChange - 100, correctChange - 20, correctChange + 50];
    const opts = [correctChange, ...wrongs].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);
    opts.forEach(c => {
      const cell = document.createElement('button');
      cell.className = 'photo-cell'; cell.textContent = '₹' + c;
      cell.onclick = () => {
        if (c === correctChange) {
          optsRow.querySelectorAll('.photo-cell').forEach(x => x.disabled = true);
          cell.classList.add('correct');
          UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="correct">✅ Correct change! Well done.</span></div>';
          A.chime();
          pieces.push('🍎');
          setTimeout(() => { UI.hide('activityUI'); advanceChapter4(); }, 2000);
        } else {
          cell.classList.add('wrong');
          saathi('Let’s count together: 500 minus ' + total + '.');
        }
      };
      optsRow.appendChild(cell);
    });
    return;
  }

  pieces.push('🍎');
  UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="correct">✅ Perfect! The shopping is done.</span></div>';
  A.chime();
  setTimeout(() => { UI.hide('activityUI'); advanceChapter4(); }, 2000);
}

async function advanceChapter4() {
  const level = state.level;
  if (level < 5) {
    state.level++;
    basket = [];
    UI.say('Superb! Let’s do another trip.', { saathi: true, voice: true });
    setTimeout(() => runCh4(), 2500);
  } else {
    UI.say('Now let’s head home. But something feels... different.', { saathi: true, voice: true });
    setTimeout(() => { A.doorOpen(); startChapter(5); }, 3000);
  }
}

// ============================================================
//  CHAPTER 5 - problem solving
// ============================================================
async function runCh5() {
  api.transitionTo('house');
  api.setEvening(true);
  api.unlockControls(false);
  await wait(1500);
  const level = state.level;

  if (level === 1) {
    await sayAnd('We’re home! But the front door is locked.', 3800);
    await sayAnd('Think carefully. What do we need to open the door?', 3800);
    await chooseFrom('🔑 Key', ['☂️ Umbrella', '📷 Photograph', '🔑 Key', '🧢 Cap'], '🔑');
  } else if (level === 2) {
    await sayAnd('It looks like it’s going to rain. What should we take with us?', 3800);
    await chooseFrom('☂️ Umbrella', ['☂️ Umbrella', '🕶️ Sunglasses', '🧣 Scarf'], '☂️');
  } else if (level === 3) {
    await sayAnd('We’re going to make tea. What do we need?', 3600);
    await chooseFrom('🫖 Kettle', ['🚗 Car', '🫖 Kettle', '🏐 Ball'], '🫖');
  } else if (level === 4) {
    await sayAnd('It got dark while we were out. What do we switch on?', 3600);
    await chooseFrom('💡 Lamp', ['💡 Lamp', '🧹 Broom', '📚 Book'], '💡');
  } else {
    await sayAnd('We need to call for help. Which device should we use?', 3600);
    await chooseFrom('📞 Phone', ['🥪 Sandwich', '📞 Phone', '🧦 Sock'], '📞');
  }
}

function chooseFrom(correctAnswer, options, emoji) {
  UI.setCrosshair(false);
  UI.showActivity('🔍 Something Isn’t Right', 'What do we need? Choose carefully.');
  const body = UI.$('activityUI').querySelector('.a-body');
  const grid = document.createElement('div');
  grid.className = 'photo-grid';
  options.forEach(o => {
    const cell = document.createElement('button');
    cell.className = 'photo-cell'; cell.textContent = o;
    cell.onclick = () => {
      if (o === correctAnswer) {
        grid.querySelectorAll('.photo-cell').forEach(c => c.disabled = true);
        cell.classList.add('correct');
        A.chime();
        pieces.push(emoji);
        UI.$('activityUI').querySelector('.a-footer').innerHTML = '<div class="result-msg"><span class="correct">✅ Exactly right!</span></div>';
        setTimeout(() => { UI.hide('activityUI'); advanceChapter5(); }, 1800);
      } else {
        cell.classList.add('wrong');
        saathi('Hmm, let’s think again. What actually solves this?');
      }
    };
    grid.appendChild(cell);
  });
  body.appendChild(grid);
}

async function advanceChapter5() {
  const level = state.level;
  if (level < 5) {
    state.level++;
    UI.say('Good thinking! One more.', { saathi: true, voice: true });
    setTimeout(() => runCh5(), 2500);
  } else {
    UI.say('You solved them all. Now, let’s look at the photo album again.', { saathi: true, voice: true });
    setTimeout(() => startChapter(6), 3000);
  }
}

// ============================================================
//  FINAL CHAPTER - the memory
// ============================================================
async function runFinal() {
  api.transitionTo('house');
  await wait(1500);
  api.unlockControls(false);
  UI.setCrosshair(false);

  await sayAnd('We’ve done so much today. Do you remember what we did?', 4200);
  await sayAnd('Reconstruct your journey. Put the events in order.', 3800);

  const order = ['🏠 Home', '🔑 Key', '🛒 Market', '🍎 Apples', '🌳 Park', '🏠 Home'];
  const shuffled = [...order].sort(() => Math.random() - 0.5);

  UI.showActivity('🧠 The Memory', 'Tap the events in the correct order to rebuild your day.');
  const body = UI.$('activityUI').querySelector('.a-body');
  const slots = document.createElement('div');
  slots.className = 'slots';
  slots.innerHTML = order.map(() => '<div class="slot">?</div>').join('');
  body.appendChild(slots);

  const pool = document.createElement('div');
  pool.className = 'photo-grid';
  const placed = [];
  shuffled.forEach(e => {
    const cell = document.createElement('button');
    cell.className = 'photo-cell'; cell.textContent = e;
    cell.onclick = () => {
      if (cell.classList.contains('used')) return;
      const slotIdx = placed.length;
      const expected = order[slotIdx];
      if (e === expected) {
        cell.classList.add('used');
        slots.children[slotIdx].textContent = e;
        slots.children[slotIdx].classList.add('filled');
        placed.push(e);
        A.chime();
        if (placed.length === order.length) {
          setTimeout(() => { UI.hide('activityUI'); endGame(); }, 900);
        }
      } else {
        cell.classList.add('wrong');
        saathi('That event happens a bit later. Try again.');
        setTimeout(() => cell.classList.remove('wrong'), 700);
      }
    };
    pool.appendChild(cell);
  });
  body.appendChild(pool);
}

async function endGame() {
  api.setEvening(true);
  await sayAnd('You remembered your journey. Well done.', 3600);
  story('🌅 The sun begins to set.');
  api.setSunset();
  await wait(2000);
  story('The character sits quietly with the old photo album, a soft smile on their face.');
  await wait(4000);
  UI.showActivity('🌅 A Memory to Treasure', '');
  const body = UI.$('activityUI').querySelector('.a-body');
  const msg = document.createElement('div');
  msg.className = 'final-msg';
  msg.innerHTML = `<div class="memo-row-final">🏠 🔑 🛒 🍎 🌳 📸 🏠</div>
  <p>You remembered your whole journey today.</p>`;
  body.appendChild(msg);
  const off = UI.$('activityUI').querySelector('.a-footer');
  const again = UI.makeButton('🔁 Play Again', { primary: true });
  again.onclick = () => location.reload();
  off.appendChild(again);
}
