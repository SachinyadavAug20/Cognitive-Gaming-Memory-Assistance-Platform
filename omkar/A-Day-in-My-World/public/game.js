// A Day in My World — 3D story campaign (Windows/desktop browser).
// Orchestrates the scene + player controller and provides an API to story.js.

import * as THREE from 'three';
import * as W from './world.js';
import * as A from './audio.js';
import * as UI from './ui.js';
import * as Story from './story.js';

const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------
//  RENDERER / SCENE / CAMERA
// ------------------------------------------------------------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('scene'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 1.7, 4);

// -------- Custom first-person controller (robust: WASD always works) --------
const player = {
  yaw: 0,          // horizontal rotation (radians)
  pitch: -0.08,    // vertical rotation (radians)
  lookEnabled: true,
};
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const lookFromPose = () => {
  euler.set(player.pitch, player.yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);
};
const pointCameraAt = (tx, ty, tz) => {
  // set yaw/pitch from camera direction to a target
  camera.lookAt(tx, ty, tz);
  euler.setFromQuaternion(camera.quaternion, 'YXZ');
  player.yaw = euler.y;
  player.pitch = euler.x;
};

function requestLookLock() {
  if (!player.lookEnabled || player.locked) return;
  try {
    const el = document.body;
    const req = el.requestPointerLock && el.requestPointerLock();
    if (req && req.catch) req.catch(() => {});
  } catch (e) {}
}
function releaseLookLock() {
  try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
}

document.addEventListener('pointerlockchange', () => {
  player.locked = document.pointerLockElement === document.body;
  if (!player.locked) {
    // lock lost -> show pause (unless we're on the menu / an overlay)
    if (!frozen && Story.getPhase() !== 'opening' && !overlayOpen() && inRound) UI.show('pause');
  }
});

let lookDragging = false;
let lastMX = 0, lastMY = 0;
const turnSpeed = 0.0032;
document.addEventListener('mousemove', (e) => {
  if (player.locked) {
    player.yaw -= e.movementX * turnSpeed;
    player.pitch -= e.movementY * turnSpeed;
    const lim = Math.PI / 2 - 0.05;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
    lookFromPose();
  } else if (lookDragging) {
    player.yaw -= (e.clientX - lastMX) * turnSpeed;
    player.pitch -= (e.clientY - lastMY) * turnSpeed;
    const lim = Math.PI / 2 - 0.05;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
    lastMX = e.clientX; lastMY = e.clientY;
    lookFromPose();
  }
});

// Lights
const sun = new THREE.DirectionalLight('#fff6e0', 2.0);
sun.position.set(25, 40, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
scene.add(sun);
scene.add(new THREE.AmbientLight('#e8f2ff', 0.7));
const hemi = new THREE.HemisphereLight('#bfe0ff', '#5c7a3a', 0.7);
scene.add(hemi);

function applySky(kind) {
  if (kind === 'morning') {
    scene.background = new THREE.Color('#b8dff5');
    sun.color.set('#fff3d6'); sun.intensity = 2.0;
    hemi.color.set('#cfe9ff'); hemi.groundColor.set('#7a9a52');
  } else if (kind === 'evening') {
    scene.background = new THREE.Color('#8a5a44');
    sun.color.set('#ffb27a'); sun.intensity = 1.1;
    hemi.color.set('#e8a07a'); hemi.groundColor.set('#5a4a3a');
  } else if (kind === 'sunset') {
    scene.background = new THREE.Color('#ff9a5a');
    sun.color.set('#ff7a3a'); sun.intensity = 0.9;
    hemi.color.set('#ffb98a'); hemi.groundColor.set('#6a4a3a');
  }
}
applySky('morning');

// ------------------------------------------------------------
//  WORLD GROUPS
// ------------------------------------------------------------
const houseGroup = new THREE.Group();
const neighborhoodGroup = new THREE.Group();
scene.add(houseGroup);
scene.add(neighborhoodGroup);

W.buildHome(houseGroup);
const markers = {};
W.buildNeighborhood(neighborhoodGroup, markers);
houseGroup.visible = true;
neighborhoodGroup.visible = false;

// Route glow plane (ch3)
const routePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(64, 1.4),
  new THREE.MeshBasicMaterial({ color: '#ffd75e', transparent: true, opacity: 0.7 })
);
routePlane.rotation.x = -Math.PI / 2;
routePlane.position.set(32, 0.06, -6);
routePlane.visible = false;
scene.add(routePlane);

// Road barrier (ch3 lvl4)
const barrier = W.buildBarrier();
barrier.position.set(48, 0, -6);
barrier.visible = false;
scene.add(barrier);

// ------------------------------------------------------------
//  COLLECTIBLES
// ------------------------------------------------------------
let nextId = 1;
const collectibles = [];

function buildCollectibleMesh(type) {
  if (type === 'key') return W.buildKey();
  if (type === 'cap') return W.buildCap();
  if (type === 'bag') return W.buildBag();
  return new THREE.Group();
}

function spawnCollectible(type, x, y, z) {
  const mesh = buildCollectibleMesh(type);
  mesh.position.set(x, y, z);
  mesh.originY = y;
  scene.add(mesh);
  const id = nextId++;
  collectibles.push({ id, obj: type, mesh });
  return id;
}

function removeCollectible(id) {
  const i = collectibles.findIndex(c => c.id === id);
  if (i >= 0) { scene.remove(collectibles[i].mesh); collectibles.splice(i, 1); }
}

// ------------------------------------------------------------
//  PLAYER
// ------------------------------------------------------------
const BOUNDS = {
  house: { minX: -7, maxX: 7, minZ: -7, maxZ: 7 },
  world: { minX: -4, maxX: 78, minZ: -18, maxZ: 10 },
};
let currentBounds = BOUNDS.house;
let scenario = 'house';
let frozen = true;
let inRound = false;   // true while an active play round is running
let goalType = null;
let goalPos = null;
const keys = {};
let stepTimer = 0;
let ambientTimer = 0;

// ------------------------------------------------------------
//  COLLISION — solid obstacles ([minX, maxX, minZ, maxZ]) that
//  block the player. Approximated as axis-aligned boxes drawn
//  around the actual furniture / trees / stalls in the scene.
// ------------------------------------------------------------
const PLAYER_RADIUS = 0.5;
const OBSTACLES = {
  house: [
    // bed (+pillow)
    [-7.3, -2.1, -7.7, -1.3],
    // bedside table (alarm clock)
    [-7.7, -5.5, -7.3, -5.5],
    // bookshelf (right wall)
    [6.3, 8.9, -5.4, -4.6],
    // photo album table
    [3.4, 6.2, -7.7, -5.5],
    // kitchen counter (left wall)
    [-8.7, -6.9, 0.4, 5.6],
    // floor lamp
    [6.35, 6.75, 2.4, 2.8],
    // front door frame posts
    [-1.9, -1.7, 7.7, 8.3],
    [1.7, 1.9, 7.7, 8.3],
  ],
  world: [
    // landmark (temple/arch) at x=43
    [41.4, 44.6, -7.7, -4.3],
    // market stalls at x=62 (+/-3)
    [56.9, 61.1, -7.1, -4.9],
    [62.9, 67.1, -7.1, -4.9],
    // pond at (30,-10) — don't walk in
    [27.3, 32.7, -12.7, -7.3],
    // street lamps along the path (thin poles, z=-3.2)
    [4.6, 5.4, -3.5, -2.9],
    [16.6, 17.4, -3.5, -2.9],
    [28.6, 29.4, -3.5, -2.9],
    [40.6, 41.4, -3.5, -2.9],
    [52.6, 53.4, -3.5, -2.9],
    // park trees — 6 small trees (radius ~0.7) around a 3m circle at (28,-6)
    [30.4, 31.8, -6.8, -5.2],   // 0deg  (31,-6)
    [28.8, 30.2, -4.2, -2.6],   // 60deg (29.5,-3.4)
    [25.8, 27.2, -4.2, -2.6],   // 120deg (26.5,-3.4)
    [24.4, 25.8, -6.8, -5.2],   // 180deg (25,-6)
    [25.8, 27.2, -9.4, -7.8],   // 240deg (26.5,-8.6)
    [28.8, 30.2, -9.4, -7.8],   // 300deg (29.5,-8.6)
  ],
};

function collides(x, z) {
  const useWorld = scenario === 'neighborhood' || scenario === 'market';
  const list = useWorld ? OBSTACLES.world : OBSTACLES.house;
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (x > o[0] - PLAYER_RADIUS && x < o[1] + PLAYER_RADIUS &&
        z > o[2] - PLAYER_RADIUS && z < o[3] + PLAYER_RADIUS) {
      return true;
    }
  }
  return false;
}

// Move toward (x,z) but stop at walls/furniture; slide along surfaces.
function moveWithCollision(nx, nz) {
  const b = currentBounds;
  nx = Math.max(b.minX, Math.min(b.maxX, nx));
  nz = Math.max(b.minZ, Math.min(b.maxZ, nz));
  if (!collides(nx, camera.position.z)) camera.position.x = nx;
  if (!collides(camera.position.x, nz)) camera.position.z = nz;
}

// ------------------------------------------------------------
//  API for story.js
// ------------------------------------------------------------
function lockControls(doLock) {
  if (doLock) requestLookLock();
  else releaseLookLock();
}

const api = {
  lockControls,
  unlockControls: lockControls,
  freeze(v) { frozen = v; },
  setCrosshair(on) { UI.setCrosshair(on); },
  setPlayerPos(x, y, z) { camera.position.set(x, y, z); },
  lookAt(x, y, z) { pointCameraAt(x, y, z); },
  pointAt(name) {
    // gently turn the camera toward a named object in the house
    const target = houseGroup.getObjectByName(name);
    if (target) {
      const p = new THREE.Vector3();
      target.getWorldPosition(p);
      pointCameraAt(p.x, p.y, p.z);
    }
  },
  setMorning(v) { if (v) applySky('morning'); },
  setEvening(v) { if (v) applySky('evening'); },
  setSunset() { applySky('sunset'); },
  spawnCollectible,
  removeCollectible,
  showRoute(v) { routePlane.visible = v; },
  showBarrier(v) { barrier.visible = v; },
  setGoal(kind) {
    goalType = kind;
    goalPos = (kind === 'market') ? { x: 62, z: -6 } : null;
  },
  transitionTo(scen) {
    scenario = scen;
    const useNeighborhood = scen === 'neighborhood' || scen === 'market';
    currentBounds = useNeighborhood ? BOUNDS.world : BOUNDS.house;
    houseGroup.visible = !useNeighborhood;
    neighborhoodGroup.visible = useNeighborhood;
    if (scen === 'neighborhood') {
      camera.position.set(0, 1.7, 8);
      pointCameraAt(10, 1.7, -6);
    } else if (scen === 'market') {
      camera.position.set(60, 1.7, 2);
      pointCameraAt(62, 1.7, -6);
    } else {
      camera.position.set(0, 1.7, 4);
      pointCameraAt(0, 1.5, -8);
    }
  },
};

// ------------------------------------------------------------
//  INTERACTION
// ------------------------------------------------------------
const INTERACT_DIST = 2.6;

function nearestCollectible() {
  let best = null, bestD = INTERACT_DIST;
  collectibles.forEach(c => {
    const dx = camera.position.x - c.mesh.position.x;
    const dz = camera.position.z - c.mesh.position.z;
    const d = Math.hypot(dx, dz);
    if (d < bestD) { bestD = d; best = c; }
  });
  return best;
}

function reachedGoal() {
  if (!goalType || !goalPos) return false;
  const dx = camera.position.x - goalPos.x;
  const dz = camera.position.z - goalPos.z;
  return (dx * dx + dz * dz) < 6 * 6;
}

function handleInteract() {
  if (frozen) return;
  const c = nearestCollectible();
  if (c) { Story.tryCollect(c.obj); return; }
  if (goalType && reachedGoal()) Story.goalReached();
}

function overlayOpen() {
  return !$('pause').classList.contains('hidden') ||
    !$('activityUI').classList.contains('hidden') ||
    !$('menu').classList.contains('hidden');
}

const MAX_CLICK_MOVE = 6;
let downX = 0, downY = 0;

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && !frozen) handleInteract();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// click the scene = grab mouse (pointer lock) OR drag to look; both also interact
document.addEventListener('mousedown', (e) => {
  if (overlayOpen()) { e.stopImmediatePropagation(); return; }
  lookDragging = true;
  lastMX = e.clientX; lastMY = e.clientY;
  downX = e.clientX; downY = e.clientY;
  if (inRound && !player.locked) requestLookLock();
}, true);
document.addEventListener('mouseup', (e) => {
  if (lookDragging) {
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    lookDragging = false;
    if (!frozen && !overlayOpen() && moved < MAX_CLICK_MOVE) handleInteract();
  }
});

// ============================================================
//  MOBILE / TOUCH CONTROLS
// ============================================================
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const moveTouch = { x: 0, y: 0 }; // joystick axes (-1..1)
let lookTouchActive = false;
let turnX = 0, turnY = 0, lastTX = 0, lastTY = 0;
let lastTap = 0;

function buildJoystick() {
  const wrap = document.createElement('div');
  wrap.id = 'joyWrap';
  wrap.innerHTML = '<div class="joy-base"><div class="joy-knob"></div></div>';
  document.body.appendChild(wrap);
  const base = wrap.querySelector('.joy-base');
  const knob = wrap.querySelector('.joy-knob');
  const maxR = base.offsetWidth / 3;
  let active = false, sx = 0, sy = 0;
  const setKnob = (dx, dy) => {
    const d = Math.hypot(dx, dy);
    if (d > maxR) { dx = dx / d * maxR; dy = dy / d * maxR; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    moveTouch.x = dx / maxR;   // -1..1
    moveTouch.y = dy / maxR;
  };
  const down = (e) => {
    e.preventDefault();
    active = true;
    const p = base.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY;
    setKnob(0, 0);
    base.style.opacity = '0.9';
  };
  const move = (e) => {
    if (!active) return;
    e.preventDefault();
    setKnob(e.clientX - sx, e.clientY - sy);
  };
  const up = () => {
    active = false;
    setKnob(0, 0);
    moveTouch.x = 0; moveTouch.y = 0;
    base.style.opacity = '0.5';
  };
  base.addEventListener('touchstart', down, { passive: false });
  base.addEventListener('touchmove', move, { passive: false });
  base.addEventListener('touchend', up);
  base.addEventListener('touchcancel', up);
  // mouse fallback for testing on desktop
  base.addEventListener('mousedown', down);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
  return wrap;
}

// Two distinct touch roles: left half = move (or joystick), right half = look + tap
document.addEventListener('touchstart', (e) => {
  if (overlayOpen()) return;
  const t = e.changedTouches[0];
  if (t.clientX < window.innerWidth / 2 && !e.target.closest('#joyWrap')) {
    // left tap without moving the stick = treat as joystick placement
    return;
  }
  lookTouchActive = true;
  turnX = 0; turnY = 0;
  lastTX = t.clientX; lastTY = t.clientY;
  lastTap = performance.now();
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!lookTouchActive || overlayOpen() || (e.changedTouches[0].clientX < window.innerWidth / 2)) return;
  e.preventDefault();
  const t = e.changedTouches[0];
  turnX = t.clientX - lastTX;
  turnY = t.clientY - lastTY;
  lastTX = t.clientX; lastTY = t.clientY;
  player.yaw -= turnX * turnSpeed;
  player.pitch -= turnY * turnSpeed;
  const lim = Math.PI / 2 - 0.05;
  player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
  lookFromPose();
}, { passive: false });

document.addEventListener('touchend', (e) => {
  if (!lookTouchActive) return;
  const t = e.changedTouches[0];
  const moved = Math.hypot(t.clientX - lastTX, t.clientY - lastTY);
  lookTouchActive = false;
  if (!frozen && !overlayOpen() && moved < 10) handleInteract();
});

const m = {
  isTouch,
  moveTouch,
  autoResetCamera() { pointCameraAt(camera.position.x + (camera.getWorldDirection(new THREE.Vector3()).x * 0 + 0), 1.5, camera.position.z - 3); },
};

if (isTouch) {
  buildJoystick();
  document.body.classList.add('touch-device');
}

// ============================================================
//  GAME LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.elapsedTime;

  // movement
  if (!frozen && !overlayOpen()) {
    const f = new THREE.Vector3();
    camera.getWorldDirection(f); f.y = 0; f.normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), f);
    const mv = new THREE.Vector3();
    if (keys['KeyW']) mv.add(f);
    if (keys['KeyS']) mv.sub(f);
    if (keys['KeyA']) mv.add(right);
    if (keys['KeyD']) mv.sub(right);
    // touch joystick (screen-relative: up=forward, right=strafe right)
    if (isTouch && (moveTouch.x !== 0 || moveTouch.y !== 0)) {
      mv.add(right.clone().multiplyScalar(moveTouch.x));
      mv.add(f.clone().multiplyScalar(-moveTouch.y));
    }
    if (mv.lengthSq() > 0) {
      mv.normalize().multiplyScalar(6 * dt);
      moveWithCollision(camera.position.x + mv.x, camera.position.z + mv.z);
      stepTimer += dt * 7;
      if (stepTimer > 1) { stepTimer = 0; A.footstep(); }
    }
  }
  camera.position.y = 1.7;

  // birds
  ambientTimer += dt;
  if (ambientTimer > 4 + Math.random() * 5 && !frozen) { ambientTimer = 0; A.bird(); }

  // prompt
  UI.hidePrompt();
  if (isTouch) {
    const jw = $('joyWrap');
    if (jw) {
      const show = !overlayOpen() && !frozen && Story.getPhase() !== 'idle';
      jw.style.display = (show && inRound) ? 'block' : 'none';
    }
  }
  if (!frozen && !overlayOpen()) {
    const c = nearestCollectible();
    if (c) {
      UI.showPrompt(isTouch ? `Tap to pick up ${({ key: '🔑', cap: '🧢', bag: '👜' })[c.obj]}` : `Press E to pick up ${({ key: '🔑', cap: '🧢', bag: '👜' })[c.obj]}`);
    } else if (goalType && reachedGoal()) {
      UI.showPrompt(isTouch ? '🏁 You reached the market — tap!' : '🏁 You reached the market — press E');
    }
  }

  // bob collectibles
  collectibles.forEach(c => {
    c.mesh.rotation.y += dt * 1.2;
    c.mesh.position.y = c.mesh.originY + Math.sin(elapsed * 2) * 0.03;
  });

  // animate the bedside alarm clock hands (slow tick)
  const hh = houseGroup.getObjectByName('clockHour');
  const mh = houseGroup.getObjectByName('clockMin');
  if (hh && mh) {
    hh.rotation.z = 0.8 + Math.sin(elapsed * 0.15) * 0.25;
    mh.rotation.z = -0.6 + Math.sin(elapsed * 0.9) * 0.12;
  }

  renderer.render(scene, camera);
}

// ------------------------------------------------------------
//  UI WIRING
// ------------------------------------------------------------
function showMenu() {
  const p = Story.progress();
  const btnCont = $('btnContinue');
  const prog = $('menuProgress');
  if (p >= 2) {
    btnCont.classList.remove('hidden');
    prog.classList.remove('hidden');
    prog.textContent = `Progress: ${p} of 6 chapters completed`;
  } else {
    btnCont.classList.add('hidden');
    prog.classList.add('hidden');
  }
  UI.show('menu');
  // % helper matches UI.show but not exported; use classList directly
  $('pause').classList.add('hidden');
  $('activityUI').classList.add('hidden');
}
function startGame(fromChapter) {
  UI.hide('menu');
  A.ensureAudio();
  A.ensureRunning();
  Story.init(api);
  inRound = true;
  frozen = true;
  lockControls(false);
  requestLookLock();
  Story.startAt(fromChapter);
}
$('btnPlay').onclick = () => startGame(1);
$('btnContinue').onclick = () => startGame(Math.min(Story.progress(), 6));
$('btnControls').onclick = () => UI.show('controls');
$('btnControlsClose').onclick = () => UI.hide('controls');
$('dNext').onclick = () => A.stopSpeech();
$('btnResume').onclick = () => { UI.hide('pause'); lockControls(true); };
$('btnExit').onclick = () => { UI.hide('pause'); inRound = false; frozen = true; releaseLookLock(); showMenu(); };
$('btnHelp').onclick = () => UI.show('controls');
$('btnProgress').onclick = () => UI.showToast(`Completed ${Story.progress()} of 6 chapters. Progress is saved automatically.`);
$('btnMute').onclick = () => {
  const muted = A.toggleMuted();
  $('btnMute').textContent = muted ? '🔇' : '🔊';
};

// Escape: toggle the pause menu (works whether or not mouse-look is locked)
window.addEventListener('keydown', (e) => {
  if (e.code !== 'Escape') return;
  if (!inRound) return;
  if (player.locked) return; // Esc already releases pointer lock -> pause via pointerlockchange
  if ($('menu').classList.contains('hidden') && $('pause').classList.contains('hidden')) {
    UI.show('pause');
    frozen = true;
  } else if (!$('pause').classList.contains('hidden') && inRound) {
    UI.hide('pause');
    frozen = false;
    requestLookLock();
  }
});

showMenu();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
