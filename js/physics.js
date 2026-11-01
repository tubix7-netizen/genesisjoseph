/* 약속의 길 — physics for loose things (v12).
   Every loose object is a rigid body approximated by a sphere: gravity, bouncing off the ground with friction,
   rolling down slopes (it turns as it rolls), sliding off walls, knocking into each other, and being shoved when the
   hero, an NPC or an animal walks into it (harder when running). Small things can be picked up (A) and thrown (A again);
   clay breaks when it hits hard, stones knock others over, a sling stone sends them flying.
   Bodies far from the hero, or lying still for a while, go to sleep and cost nothing.
   API: G.Phys.add(kind, x, z, o) · G.Phys.KINDS · episodes scatter bodies with EP.physProps(W) → [[kind, x, z], …] */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp, PI = Math.PI;
const Ph = G.Phys = { list: [], held: null };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const GRAV = 18;

// ------------------------------------------------------------------ kinds
const KINDS = Ph.KINDS = {
  jar: { n: '항아리', r: 0.3, m: 6, e: 0.15, f: 0.6, roll: 0.5, lift: true, brk: 6.5, snd: 'thud', model(g) { g.lathe([[0.08, -0.3], [0.24, -0.2], [0.28, 0.02], [0.18, 0.24], [0.11, 0.3], [0.14, 0.34]], 12, { c: 0xb5673a, j: 0.03 }); g.cyl(0.14, 0.14, 0.03, 10, { at: [0, 0.335, 0], c: 0x8a4a2a }); } },
  pot: { n: '작은 단지', r: 0.2, m: 3, e: 0.2, f: 0.6, roll: 0.6, lift: true, brk: 5.5, snd: 'thud', model(g) { g.lathe([[0.06, -0.2], [0.18, -0.12], [0.2, 0.04], [0.12, 0.16], [0.13, 0.2]], 10, { c: 0xc0784a, j: 0.03 }); } },
  basket: { n: '바구니', r: 0.26, m: 2, e: 0.25, f: 0.8, roll: 0.2, lift: true, snd: 'rustle', model(g) { g.lathe([[0.18, -0.2], [0.26, -0.05], [0.27, 0.16]], 12, { c: (x, y) => (Math.floor((y + 1) * 30) % 2 ? 0xc8a868 : 0xa8884a), j: 0.04 }); for (let i = 0; i < 5; i++) g.sph(0.08, 6, 4, { at: [(i - 2) * 0.08, 0.14, (i % 2) * 0.06], c: [0x7a4a6a, 0xd8a040][i % 2] }); } },
  melon: { n: '수박', r: 0.22, m: 4, e: 0.3, f: 0.5, roll: 1, lift: true, brk: 9, snd: 'thud', model(g) { g.sph(0.22, 12, 9, { s: [1, 0.9, 1.1], c: (x, y, z) => (Math.floor((Math.atan2(z, x) + 4) * 3) % 2 ? 0x3e7a34 : 0x5a9a44), j: 0.02 }); } },
  stone: { n: '둥근 돌', r: 0.24, m: 14, e: 0.2, f: 0.5, roll: 1, lift: true, snd: 'thud', model(g) { g.sph(0.24, 7, 5, { s: [1.05, 0.92, 1], c: 0xa89c88, flat: true, j: 0.08 }); } },
  boulder: { n: '굴러가는 바위', r: 0.62, m: 160, e: 0.12, f: 0.45, roll: 1, snd: 'thud', model(g) { g.sph(0.62, 8, 6, { s: [1.05, 0.95, 1], c: 0x9e927e, flat: true, j: 0.08 }); } },
  sack: { n: '곡식 자루', r: 0.3, m: 20, e: 0.05, f: 0.9, roll: 0.05, lift: true, snd: 'rustle', model(g) { g.lathe([[0.2, -0.3], [0.3, -0.18], [0.29, 0.12], [0.12, 0.28], [0.16, 0.32]], 10, { c: 0xd8c49a, j: 0.05 }); } },
};
const MESH = {};
function meshOf(k) { if (!MESH[k]) { const g = new G.GB(70 + k.length); KINDS[k].model(g); MESH[k] = G.R.mesh(g); } return MESH[k]; }

Ph.add = function (k, x, z, o) { const W = Game.W(), K = KINDS[k]; o = o || {};
  { const q = { x, z }; W.collide(q, K.r * 0.9, W.heightAt(x, z)); if (Math.hypot(q.x - x, q.z - z) > 0.05) { x = q.x; z = q.z; q.x = x; q.z = z; const q2 = { x, z }; W.collide(q2, K.r * 0.9, W.heightAt(x, z)); if (Math.hypot(q2.x - x, q2.z - z) > 0.05) return null; } } // never start inside a wall
  const b = { k, K, x, z, y: W.heightAt(x, z) + K.r + (o.dy || 0), vx: 0, vy: 0, vz: 0, yaw: o.yaw || Math.random() * PI * 2, pitch: 0, roll: 0, sleep: 0.5, m: G.m4(), id: 'pb' + Ph.list.length };
  G.m4trs(b.m, b.x, b.y, b.z, b.yaw, 0, 0); Ph.list.push(b); return b; };
Ph.reset = function () { Ph.list.length = 0; Ph.held = null; const EP = Game.EP(), W = Game.W(); if (EP && EP.physProps) for (const [k, x, z, o] of EP.physProps(W, Game.S())) if (KINDS[k]) Ph.add(k, x, z, o); };

// ------------------------------------------------------------------ simulation
function wake(b) { b.sleep = 0; }
Ph.impulse = function (b, ix, iy, iz) { b.vx += ix / b.K.m; b.vy += iy / b.K.m; b.vz += iz / b.K.m; wake(b); };
function pushers() { // things that shove bodies: the hero, people, animals, wild beasts
  const out = [], P = Game.P; out.push([P.x, P.z, P.vx, P.vz, 0.4, P.sprint ? 70 : 45, P.y]);
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.vis && n.near && (n.aspd || 0) > 0.3) out.push([n.x, n.z, Math.sin(n.face) * n.aspd, Math.cos(n.face) * n.aspd, n.d.animal ? 0.6 : 0.35, 40, n.y]); }
  if (G.Combat) for (const a of G.Combat.wild()) if (a.near && (a.speed || 0) > 0.5) out.push([a.x, a.z, Math.sin(a.face) * a.speed, Math.cos(a.face) * a.speed, a.d.big ? 0.8 : 0.4, a.d.big ? 120 : 30, a.y]);
  return out; }
Ph.update = function (dt) {
  const W = Game.W(), P = Game.P; if (!W || !Ph.list.length) return; dt = Math.min(dt, 0.033);
  const push = pushers(), near = [];
  for (const b of Ph.list) { if (b === Ph.held || b.gone) continue; const d = Math.hypot(b.x - P.x, b.z - P.z); if (d > 45) continue;
    for (const p of push) { const dx = b.x - p[0], dz = b.z - p[1], dd = Math.hypot(dx, dz), R0 = b.K.r + p[4]; if (dd < R0 && dd > 1e-4 && Math.abs(b.y - p[6] - b.K.r) < 1.4) {
      const sp = Math.max(0.6, Math.hypot(p[2], p[3])), k = (R0 - dd); b.x += dx / dd * k; b.z += dz / dd * k; const j = Math.min(p[5] * sp, p[5] * 4) * dt * 4; Ph.impulse(b, dx / dd * j, j * 0.08, dz / dd * j);
      if (sp > 4 && b.K.m < 40 && !b.kickT) { b.kickT = 0.4; sfx(b.K.snd, { vol: 0.5, pitch: 1.2 }); } } }
    if (b.kickT > 0) b.kickT -= dt;
    if (b.sleep > 1.5) { b.chk = (b.chk || 0) - dt; if (b.chk > 0) continue; b.chk = 0.6; // a sleeper whose floor changed (dug away, built over) wakes up and falls instead of hovering
      let g0 = W.heightAt(b.x, b.z); if (G.climbTopAt) { const t = G.climbTopAt(W, b.x, b.z, b.y - b.K.r + 0.3); if (t > g0) g0 = t; } if (Math.abs(b.y - b.K.r - g0) > 0.08 && !(W.water && g0 < W.water.level)) wake(b); else continue; }
    near.push(b); }
  for (const b of near) step(b, dt, W);
  // bodies against bodies
  for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) { const a = near[i], c = near[j]; const dx = c.x - a.x, dy = c.y - a.y, dz = c.z - a.z, d = Math.hypot(dx, dy, dz), R0 = a.K.r + c.K.r;
    if (d >= R0 || d < 1e-5) continue; const nx = dx / d, ny = dy / d, nz = dz / d, pen = R0 - d, ma = a.K.m, mc = c.K.m, wa = mc / (ma + mc), wc = ma / (ma + mc);
    a.x -= nx * pen * wa; a.y -= ny * pen * wa; a.z -= nz * pen * wa; c.x += nx * pen * wc; c.y += ny * pen * wc; c.z += nz * pen * wc;
    const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny + (c.vz - a.vz) * nz; if (rv < 0) { const e = Math.min(a.K.e, c.K.e), jj = -(1 + e) * rv / (1 / ma + 1 / mc);
      a.vx -= jj * nx / ma; a.vy -= jj * ny / ma; a.vz -= jj * nz / ma; c.vx += jj * nx / mc; c.vy += jj * ny / mc; c.vz += jj * nz / mc; wake(a); wake(c);
      if (-rv > 3) { sfx(a.K.snd, { vol: Math.min(1, -rv / 8), x: a.x, z: a.z }); brk(a, -rv); brk(c, -rv); } } }
  if (Ph.held) holdUpdate(dt);
};
function step(b, dt, W) {
  const K = b.K; b.vy -= GRAV * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
  // walls & fixed things (in the ground plane), unless it is above them
  const ox = b.x, oz = b.z; W.collide(b, K.r * 0.9, b.y - K.r); if (b.x !== ox || b.z !== oz) { const nx = b.x - ox, nz = b.z - oz, nl = Math.hypot(nx, nz) || 1, vn = (b.vx * nx + b.vz * nz) / nl;
    if (vn < 0) { b.vx -= (1 + K.e) * vn * nx / nl; b.vz -= (1 + K.e) * vn * nz / nl; if (-vn > 3) { sfx(K.snd, { vol: Math.min(1, -vn / 8), x: b.x, z: b.z }); brk(b, -vn); } } }
  // ground: bounce, friction, roll down the slope
  let gy = W.heightAt(b.x, b.z); if (G.climbTopAt) { const t = G.climbTopAt(W, b.x, b.z, b.y - K.r + 0.3); if (t > gy) gy = t; }
  if (W.water && gy < W.water.level && b.y - K.r < W.water.level) { b.vy += (GRAV * 1.3 - b.vy * 2.5) * dt; b.vx *= 1 - 1.5 * dt; b.vz *= 1 - 1.5 * dt; } // floats and drifts in water
  if (b.y - K.r <= gy) { b.y = gy + K.r; const e = 0.01, hx = (W.heightAt(b.x + e * 10, b.z) - W.heightAt(b.x - e * 10, b.z)) / (e * 20), hz = (W.heightAt(b.x, b.z + e * 10) - W.heightAt(b.x, b.z - e * 10)) / (e * 20);
    if (b.vy < -2.5) { sfx(K.snd, { vol: Math.min(1, -b.vy / 10), x: b.x, z: b.z }); brk(b, -b.vy); }
    b.vy = b.vy < -1.2 ? -b.vy * K.e : 0;
    b.vx -= hx * GRAV * K.roll * dt; b.vz -= hz * GRAV * K.roll * dt; // gravity along the slope (round things roll, sacks barely creep)
    const fr = Math.max(0, 1 - (K.f * (1.05 - K.roll * 0.85) * 6 + 0.4) * dt); b.vx *= fr; b.vz *= fr; }
  if (b.y - K.r < gy - 0.02) b.y = gy + K.r; if (b.vy > 14) b.vy = 14; const spm = Math.hypot(b.vx, b.vz); if (spm > 16) { b.vx *= 16 / spm; b.vz *= 16 / spm; }
  // orientation: rolling turns it about the axis across its motion
  const sp = Math.hypot(b.vx, b.vz); if (sp > 0.05) { if (K.roll > 0.3) { b.yaw = Math.atan2(b.vx, b.vz); b.pitch += sp * dt / K.r; } else b.yaw += 0; }
  const settle = sp < 0.08 && Math.abs(b.vy) < 0.05; b.sleep = settle ? b.sleep + dt : 0;
  if (K.roll < 0.6 && settle) { b.pitch *= 0.9; } // jars and sacks come to rest upright
  G.m4trs(b.m, b.x, b.y, b.z, b.yaw, b.pitch, b.roll);
}
function brk(b, sp) { if (!b.K.brk || sp < b.K.brk || b.gone) return; b.gone = true; sfx('thud', { pitch: 1.6, vol: 0.9, x: b.x, z: b.z }); sfx('rip', { pitch: 1.8, vol: 0.4 });
  G.FX.burst(b.x, b.y, b.z, 22, { c: b.k === 'melon' ? [0.85, 0.25, 0.25] : [0.72, 0.42, 0.26], sp: 3, up: 2.5, size: 0.09, g: 9 }); if (Ph.held === b) Ph.held = null;
  if (b.k === 'melon' && Math.hypot(b.x - Game.P.x, b.z - Game.P.z) < 6) G.UI.toast('수박이 깨졌어요!');
  if (G.Deeds && (b.k === 'jar' || b.k === 'pot') && b.heroT && performance.now() / 1000 - b.heroT < 6) G.Deeds.rec('harm', null, { x: b.x, z: b.z, what: b.K.n }); } // a jar or pot the hero just threw broke

// ------------------------------------------------------------------ pick up & throw
function holdUpdate(dt) { const b = Ph.held, P = Game.P; if (b.gone) { Ph.held = null; return; } b.heroT = performance.now() / 1000; // v18.0 P6: remembered as something the hero carried / threw
  const hm = P.rig.world[G.HBI.head]; b.x = hm[12] + Math.sin(P.face) * 0.03; b.z = hm[14] + Math.cos(P.face) * 0.03; b.y = hm[13] + 0.3 + b.K.r * 0.85; // balanced on the head b.vx = b.vy = b.vz = 0; b.sleep = 0;
  G.m4trs(b.m, b.x, b.y, b.z, P.face, 0, 0); if (P.ride || P.swim || P.climb || P.downed || Game.cineOn) Ph.drop(); }
Ph.pick = function (b) { const P = Game.P; if (Ph.held || P.carry) return; Ph.held = b; P.liftArms = true; sfx('pickup'); if (G.Acts) G.Acts.stop(); };
Ph.drop = function () { const b = Ph.held, P = Game.P; if (!b) return; Ph.held = null; P.liftArms = false; b.x = P.x + Math.sin(P.face) * 0.7; b.z = P.z + Math.cos(P.face) * 0.7; b.sleep = 0; };
Ph.throwIt = function () { const b = Ph.held, P = Game.P; if (!b) return; Ph.held = null; P.liftArms = false; const sp = 7.5 - Math.min(4, b.K.m / 6);
  b.vx = Math.sin(P.face) * sp + P.vx * 0.5; b.vz = Math.cos(P.face) * sp + P.vz * 0.5; b.vy = 3.2; b.x += Math.sin(P.face) * 0.5; b.z += Math.cos(P.face) * 0.5; b.sleep = 0; sfx('whoosh');
  if (G.Vitals) G.Vitals.spend(4 + b.K.m * 0.2); };
Game.CTX.push(function (S) { const P = Game.P; if (P.ride || P.climb || P.swim || P.act || Game.cineOn) return null;
  if (Ph.held) return [{ d: -50, label: `${Ph.held.K.n} 던지기`, x: P.x + Math.sin(P.face), z: P.z + Math.cos(P.face), y: 1.2, use: Ph.throwIt, key: 'throw', noMagnet: true }];
  let best = null, bd = 1.5; for (const b of Ph.list) { if (b.gone || !b.K.lift) continue; const d = Math.hypot(b.x - P.x, b.z - P.z) - b.K.r; if (d < bd && Math.abs(b.y - P.y) < 1.6) { bd = d; best = b; } }
  return best ? [{ d: bd + 0.2, label: `${best.K.n} 들기`, x: best.x, z: best.z, y: best.y - P.y + 0.4, use: () => Ph.pick(best), key: 'lift', noMagnet: true }] : null; });

// a sling stone or an arrow that hits a body knocks it
Ph.hitAt = function (x, y, z, vx, vy, vz) { for (const b of Ph.list) { if (b.gone || b === Ph.held) continue; if (Math.hypot(b.x - x, b.y - y, b.z - z) < b.K.r + 0.15) { Ph.impulse(b, vx * 1.6, Math.abs(vy) + 6, vz * 1.6); sfx(b.K.snd, { x, z }); brk(b, b.K.brk ? b.K.brk + 1 : 0); return true; } } return false; };

Ph.dyn = function (list) { const P = Game.P; for (const b of Ph.list) { if (b.gone) continue; if (Math.hypot(b.x - P.x, b.z - P.z) > 70) continue; list.push({ mesh: meshOf(b.k), m: b.m, outline: true }); } };
})(window.G);
