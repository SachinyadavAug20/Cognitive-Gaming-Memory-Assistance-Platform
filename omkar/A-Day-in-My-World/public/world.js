// 3D world construction and helpers.
import * as THREE from 'three';

export function makeBox(w, h, d, color, opts = {}) {
  const g = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.MeshStandardMaterial({
    color, roughness: opts.roughness ?? 0.9,
    transparent: opts.transparent ?? false, opacity: opts.opacity ?? 1,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

export function makePlane(w, h, color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}

// Build a cozy home interior (living/bed area) around origin.
export function buildHome(scene) {
  const g = new THREE.Group();

  // floor
  const floor = makePlane(16, 16, '#c8a273');
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  g.add(floor);

  // walls (facing inward)
  const wallH = 4;
  const wallMat = '#eeddcc';

  // back wall (north, -z)
  const back = makeBox(16, wallH, 0.3, wallMat);
  back.position.set(0, wallH / 2, -8);
  g.add(back);
  // front wall (south, +z) with door opening (split into two)
  const f1 = makeBox(6.5, wallH, 0.3, wallMat);
  f1.position.set(-4.75, wallH / 2, 8);
  g.add(f1);
  const f2 = makeBox(6.5, wallH, 0.3, wallMat);
  f2.position.set(4.75, wallH / 2, 8);
  g.add(f2);
  // left wall (west, -x)
  const left = makeBox(0.3, wallH, 16, wallMat);
  left.position.set(-8, wallH / 2, 0);
  g.add(left);
  // right wall (east, +x)
  const right = makeBox(0.3, wallH, 16, wallMat);
  right.position.set(8, wallH / 2, 0);
  g.add(right);

  // ceiling
  const ceiling = makeBox(16, 0.3, 16, '#e8dcc8');
  ceiling.position.set(0, wallH, 0);
  g.add(ceiling);

  // window on back wall (with sunlight)
  const win = makeBox(3, 2.2, 0.35, '#bfe9ff', { transparent: true, opacity: 0.85 });
  win.position.set(0, 2, -8);
  g.add(win);
  const winFrame1 = makeBox(0.15, 2.2, 0.4, '#7a5230');
  winFrame1.position.set(0, 2, -8.05);
  g.add(winFrame1);
  const winFrame2 = makeBox(3, 0.15, 0.4, '#7a5230');
  winFrame2.position.set(0, 2, -8.05);
  g.add(winFrame2);

  // BED (which is a mattress on the floor)
  const bedFrame = makeBox(5, 0.5, 6, '#8a5a2b');
  bedFrame.position.set(-4.5, 0.25, -4.5);
  g.add(bedFrame);
  const bedMat = makeBox(4.6, 0.35, 5.6, '#ffffff');
  bedMat.position.set(-4.5, 0.65, -4.5);
  g.add(bedMat);
  const pillow = makeBox(1.6, 0.3, 1, '#d0e6ff');
  pillow.position.set(-3.4, 0.95, -2.2);
  g.add(pillow);
  const blanket = makeBox(4.4, 0.2, 3.6, '#7fb5d0');
  blanket.position.set(-4.5, 0.85, -4.8);
  blanket.rotation.z = 0.1;
  g.add(blanket);

  // ALARM CLOCK on a small bedside table
  const table = makeBox(2, 1, 1.4, '#6b4a2b');
  table.position.set(-6.6, 0.5, -6.4);
  g.add(table);
  const clockBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.25, 24),
    new THREE.MeshStandardMaterial({ color: '#e74c3c', roughness: 0.6 })
  );
  clockBody.position.set(-6.6, 1.15, -6.4);
  clockBody.rotation.x = 0.5;
  g.add(clockBody);
  const bell1 = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.6 }));
  bell1.position.set(-6.25, 1.5, -6.4);
  g.add(bell1);
  const bell2 = bell1.clone(); bell2.position.x = -6.95;
  g.add(bell2);
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.4, 20), new THREE.MeshBasicMaterial({ color: '#fffaf0' }));
  clockFace.position.set(-6.6, 1.15, -5.85);
  g.add(clockFace);
  clockFace.name = 'clockFace';

  // NOTE on the table (handwritten-style)
  const note = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), new THREE.MeshBasicMaterial({ color: '#fff6cf' }));
  note.position.set(-6.6, 1.3, -6.35);
  note.rotation.x = -0.9;
  note.name = 'note';
  g.add(note);

  // KEY on the table (to interact with)
  const key = buildKey();
  key.position.set(-6.9, 1.12, -6.25);
  g.add(key);
  key.name = 'keyProp';

  // a small bookshelf
  const shelf = makeBox(2.4, 2.6, 0.5, '#6b4a2b');
  shelf.position.set(7.6, 1.3, -5);
  g.add(shelf);

  // FRONT DOOR in the +z opening (between f1 and f2)
  const doorFrameL = makeBox(0.15, 2.4, 0.5, '#7a5230');
  doorFrameL.position.set(-1.8, 1.2, 7.95);
  g.add(doorFrameL);
  const doorFrameR = makeBox(0.15, 2.4, 0.5, '#7a5230');
  doorFrameR.position.set(1.8, 1.2, 7.95);
  g.add(doorFrameR);
  const doorPanel = makeBox(3.4, 2.35, 0.25, '#a5713c');
  doorPanel.position.set(0, 1.18, 7.9);
  g.add(doorPanel);
  const doorKnob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshStandardMaterial({ color: '#f1c40f', metalness: 0.6 }));
  doorKnob.position.set(-1.3, 1.15, 8.03);
  g.add(doorKnob);
  const doorTop = makeBox(16, 0.4, 0.3, wallMat);
  doorTop.position.set(0, 2.8, 8);
  g.add(doorTop);

  // PHOTO ALBUM table by the window (holds the family photos chapter)
  const albumTable = makeBox(2.6, 0.8, 1.8, '#7a5230');
  albumTable.position.set(4.8, 0.4, -6.6);
  g.add(albumTable);
  const album = makeBox(2.0, 0.25, 1.3, '#8b2745');
  album.position.set(4.8, 0.9, -6.6);
  g.add(album);
  const albumGold = makeBox(2.0, 0.1, 0.2, '#f1c40f');
  albumGold.position.set(4.8, 1.0, -6.6);
  g.add(albumGold);
  // small stack of photo cards on the table
  for (let i = 0; i < 3; i++) {
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), new THREE.MeshBasicMaterial({ color: ['#ffffff', '#ffeedd', '#eef7ff'][i] }));
    card.position.set(5.9 - i * 0.12, 1.0 + i * 0.02, -6.3);
    card.rotation.y = 0.4;
    g.add(card);
  }

  // CLOCK HANDS on the alarm clock (keep trackable by name for animation)
  const hourHand = makeBox(0.06, 0.22, 0.03, '#222');
  hourHand.position.set(-6.6, 1.15, -5.82);
  hourHand.rotation.z = 0.8;
  g.add(hourHand);
  hourHand.name = 'clockHour';
  const minHand = makeBox(0.04, 0.30, 0.03, '#222');
  minHand.position.set(-6.6, 1.15, -5.81);
  minHand.rotation.z = -0.6;
  g.add(minHand);
  minHand.name = 'clockMin';

  // cozy floor lamp
  const lampPole = makeBox(0.1, 2.4, 0.1, '#333');
  lampPole.position.set(6.5, 1.2, 2.5);
  g.add(lampPole);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 16), new THREE.MeshStandardMaterial({ color: '#f6d08a', emissive: '#ffdf9a', emissiveIntensity: 0.4 }));
  lampShade.position.set(6.5, 2.6, 2.5);
  g.add(lampShade);

  // a kitchen counter along the left wall
  const counter = makeBox(1.6, 1, 5, '#d8c39a');
  counter.position.set(-7.8, 0.5, 3);
  g.add(counter);

  // picture frames on back wall
  const pic1 = makeBox(1.1, 0.8, 0.1, '#a0d8ef');
  pic1.position.set(-3, 2.6, -7.85);
  g.add(pic1);
  const pic2 = makeBox(1.1, 0.8, 0.1, '#efc6a0');
  pic2.position.set(3, 2.6, -7.85);
  g.add(pic2);

  // a rug
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshStandardMaterial({ color: '#d9805a', roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, 0);
  g.add(rug);

  scene.add(g);
  return g;
}

export function buildKey() {
  const g = new THREE.Group();
  const head = makeBox(0.45, 0.45, 0.12, '#f1c40f');
  head.position.y = 0;
  g.add(head);
  const shaft = makeBox(0.1, 0.8, 0.1, '#f1c40f');
  shaft.position.set(0.28, -0.25, 0);
  g.add(shaft);
  const tooth = makeBox(0.1, 0.2, 0.1, '#f1c40f');
  tooth.position.set(0.23, -0.55, 0);
  g.add(tooth);
  g.userData.object = 'key';
  return g;
}

export function buildCap() {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.HemisphereGeometry(0.55, 0.55, 16, 8), new THREE.MeshStandardMaterial({ color: '#2e86de', roughness: 0.7 }));
  dome.scale.y = 0.7;
  g.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 20), new THREE.MeshStandardMaterial({ color: '#2e86de', roughness: 0.7 }));
  brim.position.y = -0.05;
  g.add(brim);
  g.userData.object = 'cap';
  return g;
}

export function buildBag() {
  const g = new THREE.Group();
  const body = makeBox(0.9, 1, 0.6, '#935116');
  g.add(body);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 8, 16), new THREE.MeshStandardMaterial({ color: '#7a4520' }));
  handle.position.y = 0.55;
  g.add(handle);
  g.userData.object = 'bag';
  return g;
}

// Build a small neighborhood: a path from home (origin) toward market eastward,
// through a park and past a landmark, with a shop row at the east end.
// Returns a group and also records landmark positions for navigation levels.
export function buildNeighborhood(scene, markers) {
  const g = new THREE.Group();
  const ground = makePlane(120, 60, '#79a84f');
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(20, -0.1, -6);
  g.add(ground);

  // main path running east (home at x=0, market at x=~60)
  const path = makePlane(66, 6, '#c9b28a');
  path.rotation.x = -Math.PI / 2;
  path.position.set(30, 0.02, -6);
  g.add(path);

  // PARK (midway, x~30) - trees and a pond
  if (markers.park) markers.park.set(30, -6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const tree = makeTree(28 + Math.cos(a) * 3, -6 + Math.sin(a) * 3, 1.1);
    g.add(tree);
  }
  const pond = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), new THREE.MeshStandardMaterial({ color: '#4aa3df', roughness: 0.4 }));
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(30, 0.05, -10);
  g.add(pond);

  // LANDMARK (x~43) - a temple/arch
  if (markers.landmark) markers.landmark.set(43, -6);
  const lm = buildLandmark();
  lm.position.set(43, 0, -6);
  g.add(lm);

  // MARKET (east end, x~62)
  if (markers.market) markers.market.set(62, -6);
  const market = buildMarket();
  market.position.set(62, 0, -6);
  g.add(market);

  // street lamps along path
  for (let x = 5; x <= 60; x += 12) {
    const lamp = buildLamp();
    lamp.position.set(x, 0, -3.2);
    g.add(lamp);
  }

  // border road-block marker (used in ch3 level 4)
  if (markers.block) markers.block.set(48, -6);

  scene.add(g);
  return g;
}

function buildLandmark() {
  const g = new THREE.Group();
  const base = makeBox(3, 1, 3, '#d9c9a3');
  base.position.y = 0.5;
  g.add(base);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.28, 10, 20, Math.PI), new THREE.MeshStandardMaterial({ color: '#f5d98a', roughness: 0.6 }));
  arch.position.set(0, 2.5, 0);
  g.add(arch);
  const pole = makeBox(0.3, 2.6, 0.3, '#8a5a2b');
  pole.position.y = 1.3;
  g.add(pole);
  const flag = makePlane(0.8, 0.5, '#e74c3c');
  flag.position.set(0.5, 2.7, 0);
  g.add(flag);
  g.userData.landmark = true;
  return g;
}

function buildMarket() {
  const g = new THREE.Group();
  // market square with stalls
  const floor = makePlane(16, 16, '#d8c39a');
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.02;
  g.add(floor);
  // a couple of market stalls
  const stall1 = makeBox(4, 1.2, 2, '#2980b9');
  stall1.position.set(-3, 0.6, 0);
  g.add(stall1);
  const stallRoof1 = makeBox(4.6, 0.15, 2.6, '#e74c3c');
  stallRoof1.position.set(-3, 1.4, 0);
  stallRoof1.castShadow = true;
  g.add(stallRoof1);
  const stall2 = makeBox(4, 1.2, 2, '#27ae60');
  stall2.position.set(3, 0.6, 0);
  g.add(stall2);
  const stallRoof2 = makeBox(4.6, 0.15, 2.6, '#f1c40f');
  stallRoof2.position.set(3, 1.4, 0);
  stallRoof2.castShadow = true;
  g.add(stallRoof2);
  g.userData.market = true;
  return g;
}

function makeTree(x, z, scale = 1) {
  const g = new THREE.Group();
  const trunk = makeBox(0.4 * scale, 1.4 * scale, 0.4 * scale, '#6b4a2b');
  trunk.position.y = 0.7 * scale;
  g.add(trunk);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 2 * scale, 8), new THREE.MeshStandardMaterial({ color: '#2e8b57', roughness: 0.9 }));
  cone.position.y = 2 * scale;
  cone.castShadow = true;
  g.add(cone);
  g.position.set(x, 0, z);
  return g;
}

function buildLamp() {
  const g = new THREE.Group();
  const pole = makeBox(0.12, 3, 0.12, '#444');
  pole.position.y = 1.5;
  g.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), new THREE.MeshStandardMaterial({ color: '#ffe9a8', emissive: '#ffd75e', emissiveIntensity: 0.9 }));
  bulb.position.y = 3.1;
  g.add(bulb);
  return g;
}

// East/west wall for road blocking visuals
export function buildBarrier() {
  const g = new THREE.Group();
  const bar = makeBox(5, 0.5, 0.2, '#c0392b');
  bar.position.y = 0.6;
  g.add(bar);
  const leg1 = makeBox(0.15, 0.7, 0.15, '#555'); leg1.position.x = -2.2; leg1.position.y = 0.3; g.add(leg1);
  const leg2 = makeBox(0.15, 0.7, 0.15, '#555'); leg2.position.x = 2.2; leg2.position.y = 0.3; g.add(leg2);
  g.userData.barrier = true;
  return g;
}
