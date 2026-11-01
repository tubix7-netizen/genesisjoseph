/* 약속의 길 — 보물상자 · 항아리 · 나무상자 (v16)
   · chest: a treasure chest in an out-of-the-way place. A opens it once (lid swings up, sparkle): several finds from the land
     around it, some silver, sometimes 깨달음.
   · urn / crate: clay jars and wooden boxes where people live. Smash them — A (a kick), the staff, a sling stone, or anything
     thrown at them — and out come a few things that belong to that place (grain in Egypt, figs and wool in Canaan, dates in the
     desert, fish and reeds by the Nile). They are back two days later.
   · places: out-of-the-way spots that announce themselves the first time you reach them (「새로운 곳 발견 n/N」).
   Episodes supply EP.loot(W) → [{ id, k, x, z, ry, table, rich, insight }] , EP.lootTables = { name: [[item, min, max, weight]] },
   EP.lootTable(x, z) → table name, and EP.places2 = [{ id, n, x, z, r, d }]. */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI;
const Lo = G.Loot = { list: [], places: [] };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
// ------------------------------------------------------------------ models
const MESH = {};
function mk(key, fn) { if (!MESH[key]) { const g = new G.GB(90 + key.length); fn(g); MESH[key] = G.R.mesh(g); } return MESH[key]; }
const chestBody = g => { g.box(0.9, 0.5, 0.56, { at: [0, 0.27, 0], c: 0x7a4e2a, j: 0.03 }); for (const x of [-0.36, 0.36]) g.box(0.07, 0.52, 0.6, { at: [x, 0.27, 0], c: 0x9a8a5a }); g.box(0.9, 0.06, 0.6, { at: [0, 0.04, 0], c: 0x5a3a20 });
  g.box(0.12, 0.14, 0.04, { at: [0, 0.42, 0.29], c: 0xd9a73a }); g.cyl(0.03, 0.03, 0.03, 8, { at: [0, 0.4, 0.31], rx: PI / 2, c: 0x2a1a10 }); };
const chestLid = g => { g.cyl(0.28, 0.28, 0.9, 10, { at: [0, 0, 0.28], rz: PI / 2, s: [1, 1, 0.55], c: 0x8a5a32 }); for (const x of [-0.36, 0.36]) g.cyl(0.29, 0.29, 0.07, 10, { at: [x, 0, 0.28], rz: PI / 2, s: [1, 1, 0.56], c: 0x9a8a5a }); };
const meshOf = b => b.k === 'chest' ? mk('chest', chestBody) : b.k === 'crate' ? mk('crate', g => { g.box(0.7, 0.6, 0.7, { at: [0, 0.3, 0], c: 0xa07a4a, j: 0.05 }); for (const y of [0.08, 0.52]) for (const s of [1, -1]) { g.box(0.74, 0.08, 0.04, { at: [0, y, s * 0.355], c: 0x6a4a2a }); g.box(0.04, 0.08, 0.74, { at: [s * 0.355, y, 0], c: 0x6a4a2a }); } g.box(0.7, 0.04, 0.7, { at: [0, 0.61, 0], c: 0x8a6a40 }); })
  : mk('urn' + (b.v || 0), g => { g.lathe([[0.08, 0], [0.24, 0.12], [0.28, 0.4], [0.2, 0.66], [0.12, 0.76], [0.15, 0.82]], 11, { c: [0xb5673a, 0xc8865a, 0xa85a32][b.v || 0], j: 0.03 }); g.box(0.5, 0.05, 0.02, { at: [0, 0.4, 0.27], c: 0x3a2a1a }); });
// ------------------------------------------------------------------ setup
Lo.reset = function () { const W = Game.W(), EP = Game.EP(), S = Game.S(); Lo.list = []; Lo.drops = []; Lo.places = (EP && EP.places2) || []; if (!W || !EP || !EP.loot) return;
  for (const o of EP.loot(W, S)) { const b = Object.assign({ ry: 0, v: 0 }, o); b.y = W.heightAt(b.x, b.z); b.m = G.m4trs(G.m4(), b.x, b.y, b.z, b.ry); b.lid = G.m4();
    b.col = W.addCol({ x: b.x, z: b.z, r: b.k === 'chest' ? 0.5 : b.k === 'crate' ? 0.45 : 0.3, h: 0.8 }); Lo.list.push(b); }
  Lo.sync(); };
Lo.state = () => { const S = Game.S(); return (S.loot = S.loot || {}); };
Lo.sync = function () { const st = Lo.state(), S = Game.S(); for (const b of Lo.list) { const v = st[b.id]; b.open = b.k === 'chest' && v !== undefined; b.gone = b.k !== 'chest' && v !== undefined && S.day - v < (b.re || 2); if (b.col) b.col.on = !b.gone; b.lidA = b.open ? -1.9 : 0; } };
// ------------------------------------------------------------------ what comes out
function roll(tab, n) { const out = {}; const tot = tab.reduce((a, t) => a + (t[3] || 1), 0); for (let i = 0; i < n; i++) { let r = Math.random() * tot; for (const t of tab) { r -= t[3] || 1; if (r <= 0) { const q = t[1] + Math.floor(Math.random() * (t[2] - t[1] + 1)); out[t[0]] = (out[t[0]] || 0) + q; break; } } } return out; }
function tableFor(b) { const EP = Game.EP(), T = EP.lootTables || {}; return T[b.table || (EP.lootTable ? EP.lootTable(b.x, b.z) : 'any')] || T.any || [['stone', 1, 2]]; }
// v16.1: what spills out of a jar or a box lands on the ground around it, and Joseph picks it up himself (A · 줍기)
Lo.drops = [];
function spill(x, y, z, got, silver) { let i = 0; const W = Game.W(); for (const k in got) { if (!Game.ITEMS[k]) continue; const a = i++ * 2.1 + Math.random(), d = 0.45 + Math.random() * 0.35, tx = x + Math.cos(a) * d, tz = z + Math.sin(a) * d;
    Lo.drops.push({ k, n: got[k], x, z, y: y + 0.5, tx, tz, gy: W.heightAt(tx, tz), vy: 2.6 + Math.random(), t: 0, m: G.m4() }); }
  if (silver) { const a = i * 2.1, tx = x + Math.cos(a) * 0.5, tz = z + Math.sin(a) * 0.5; Lo.drops.push({ k: '$silver', n: silver, x, z, y: y + 0.5, tx, tz, gy: W.heightAt(tx, tz), vy: 3, t: 0, m: G.m4() }); } }
const dropMesh = k => mk('drop_' + k, g => { if (k === '$silver') { for (let i = 0; i < 3; i++) g.cyl(0.05, 0.05, 0.012, 9, { at: [i * 0.03 - 0.03, 0.01 + i * 0.013, i * 0.01], c: 0xd8d8e0 }); return; }
  const it = Game.ITEMS[k], c = it && it.c ? parseInt(it.c.slice(1), 16) : 0xc8a060; // a small cloth bundle in the item's colour, tied at the top
  g.sph(0.11, 8, 6, { at: [0, 0.09, 0], s: [1, 0.8, 1], c: 0xd8c8a0 }); g.sph(0.075, 7, 5, { at: [0, 0.16, 0], c }); g.cyl(0.02, 0.03, 0.05, 6, { at: [0, 0.2, 0], c: 0x8a6a40 }); });
Lo.pickDrop = function (d) { const i = Lo.drops.indexOf(d); if (i < 0) return; Lo.drops.splice(i, 1); Game.P.emote = { k: 'gather', t: 0, dur: 0.6 };
  if (d.k === '$silver') { Game.silver(d.n); G.UI.toast(`은 ${d.n}`); } else { Game.give(d.k, d.n, true); G.UI.gain && G.UI.gain(d.k, d.n); } sfx('pickup'); };
function drop(b, got, silver, insight) { const ks = Object.keys(got); let i = 0;
  for (const k of ks) { if (!Game.ITEMS[k]) continue; setTimeout(() => { Game.give(k, got[k], true); G.UI.gain && G.UI.gain(k, got[k]); }, 120 + i++ * 260); }
  if (silver) setTimeout(() => { Game.silver(silver); G.UI.toast(`은 ${silver}`); }, 140 + i * 260);
  if (insight && Game.insight) setTimeout(() => Game.insight(insight, b.n || '보물상자'), 500 + i * 260); }
Lo.smash = function (b, how, at) { if (!b || (b.gone && !at) || b.k === 'chest') return; const S = Game.S(); Lo.state()[b.id] = S.day; b.gone = true; if (b.col) b.col.on = false;
  sfx('thud', { pitch: b.k === 'urn' ? 1.7 : 1.1, x: b.x, z: b.z }); sfx(b.k === 'urn' ? 'rip' : 'chop', { pitch: 1.6, vol: 0.5 });
  const fxp = at || b; G.FX.burst(fxp.x, fxp.y + 0.4, fxp.z, 20, { c: b.k === 'urn' ? [0.72, 0.42, 0.26] : [0.62, 0.48, 0.3], sp: 2.6, up: 2.4, size: 0.09, g: 9 }); G.haptic && G.haptic('thud');
  const got = Math.random() < 0.15 ? {} : roll(tableFor(b), b.k === 'crate' ? 2 : 1); const sv = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * 3) : 0;
  if (!Object.keys(got).length && !sv) G.UI.toast(b.k === 'urn' ? '빈 항아리였어요' : '텅 빈 상자였어요'); spill(at ? at.x : b.x, at ? at.y : b.y, at ? at.z : b.z, got, sv);
  S.stats.smashed = (S.stats.smashed || 0) + 1; };
Lo.openChest = function (b) { if (!b || b.open) return; const S = Game.S(), P = Game.P; Lo.state()[b.id] = S.day; b.open = true; b.lidT = 0;
  P.face = Math.atan2(b.x - P.x, b.z - P.z); P.emote = { k: 'gather', t: 0, dur: 0.9 }; sfx('chop', { pitch: 0.7, vol: 0.5 }); sfx('quest', { pitch: 1.3 });
  setTimeout(() => G.FX.burst(b.x, b.y + 0.6, b.z, 26, { c: [1, 0.86, 0.4], sp: 1.4, up: 2.4, size: 0.07, g: 1, life: 1.2 }), 300);
  const got = roll(tableFor(b), b.rich ? 4 : 3); if (b.extra) for (const k in b.extra) got[k] = (got[k] || 0) + b.extra[k];
  drop(b, got, (b.rich ? 8 : 4) + Math.floor(Math.random() * 8), b.insight || 0); S.stats.chests = (S.stats.chests || 0) + 1;
  const n = Lo.list.filter(x => x.k === 'chest' && x.open).length, N = Lo.list.filter(x => x.k === 'chest').length; setTimeout(() => G.UI.toast(`보물상자 ${n} / ${N}`), 1500); };
// ------------------------------------------------------------------ interaction, smashing, finding places
Game.CTX.push(function (S) { const P = Game.P; if (P.ride || P.climb || P.swim || P.act || Game.cineOn || (G.Phys && G.Phys.held)) return null; const out = [];
  for (const d of Lo.drops) { if (d.t < 0.5) continue; const dd = Math.hypot(d.x - P.x, d.z - P.z); if (dd < 1.5) out.push({ d: dd - 0.6, label: `줍기 · ${d.k === '$silver' ? '은' : Game.ITEMS[d.k].n} ×${d.n}`, x: d.x, z: d.z, yAbs: (d.gy !== undefined ? d.gy : d.y || 0) + 0.45, key: 'drop:' + Lo.drops.indexOf(d), noMagnet: true, use: () => Lo.pickDrop(d) }); }
  let best = null, bd = 1.7; for (const b of Lo.list) { if (b.gone || (b.k === 'chest' && b.open)) continue; const d = Math.hypot(b.x - P.x, b.z - P.z); if (d < bd && Math.abs(b.y - P.y) < 1.5) { bd = d; best = b; } }
  if (best) { const b = best;
    if (b.k === 'chest') out.push({ d: bd - 0.3, label: '보물상자 열기', x: b.x, z: b.z, yAbs: b.y + 0.9, key: 'loot:' + b.id, use: () => Lo.openChest(b) });
    else if (b.k === 'urn') out.push({ d: bd - 0.3, label: '항아리 들기', x: b.x, z: b.z, yAbs: b.y + 0.95, key: 'loot:' + b.id, noMagnet: true, use: () => Lo.liftUrn(b) });
    else out.push({ d: bd + 0.4, label: '나무상자 · 막대기로 쳐서 부숴요', x: b.x, z: b.z, yAbs: b.y + 0.95, key: 'loot:' + b.id, disabled: true, use: () => G.UI.toast('맨손으로는 못 부숴요 · 지팡이 같은 무기로 공격해 보세요') }); }
  return out.length ? out : null; });
// lifting a jar turns it into a real thing you carry (physics.js); when it smashes — thrown, dropped hard — it spills what was inside
Lo.liftUrn = function (b) { if (!G.Phys) return; const pb = G.Phys.add('jar', b.x, b.z, { yaw: b.ry }); if (!pb) return; pb.lootUrn = b; b.gone = true; if (b.col) b.col.on = false; Lo.state()[b.id] = Game.S().day; G.Phys.pick(pb);
  if (!Game.S().flags.tipUrn) { Game.S().flags.tipUrn = 1; G.UI.toast('던져서 깨 보세요 · 「조준」으로 떨어질 곳을 정할 수 있어요'); } };
Lo.near = (x, z, r) => Lo.list.filter(b => !b.gone && b.k !== 'chest' && Math.hypot(b.x - x, b.z - z) < r);
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const P = Game.P, was = P.atk; const r = atk0.apply(this, arguments); if (P.atk && P.atk !== was) setTimeout(() => {
    const fx = Math.sin(P.face), fz = Math.cos(P.face); for (const b of Lo.near(P.x, P.z, 2.6)) { const dx = b.x - P.x, dz = b.z - P.z, d = Math.hypot(dx, dz) || 1; if ((dx * fx + dz * fz) / d > 0.35) Lo.smash(b, 'hit'); } }, 200); return r; }; }
if (G.Phys) { const hit0 = G.Phys.hitAt; G.Phys.hitAt = function (x, y, z) { for (const b of Lo.near(x, z, 0.6)) if (y < b.y + 1) { Lo.smash(b, 'sling'); return true; } return hit0.apply(this, arguments); }; }
Lo.targets = () => Lo.list.filter(b => !b.gone && b.k !== 'chest').map(b => b.lockT || (b.lockT = { K: true, b, get x() { return b.x; }, get z() { return b.z; }, get y() { return b.y + 0.4; }, get gone() { return b.gone; } }));
let pT = 0;
Lo.update = function (dt) { const P = Game.P, S = Game.S(); if (!S) return;
  for (const d of Lo.drops) { d.t += dt; const k = Math.min(1, d.t / 0.45); d.x += (d.tx - d.x) * Math.min(1, dt * 6); d.z += (d.tz - d.z) * Math.min(1, dt * 6); d.vy -= 14 * dt; d.y = Math.max(d.gy, d.y + d.vy * dt); if (d.y === d.gy) d.vy = 0;
    G.m4trs(d.m, d.x, d.y + (k >= 1 ? 0.03 * Math.sin(d.t * 3) : 0), d.z, d.t * 1.2, 0, 0); if (k >= 1 && Math.random() < dt * 0.8) G.FX.burst(d.x, d.y + 0.25, d.z, 1, { c: [1, 0.95, 0.7], sp: 0.1, up: 0.4, size: 0.04, g: -0.2, life: 0.8 }); }
  if (G.Phys) for (const pb of G.Phys.list) if (pb.lootUrn && pb.gone && !pb.spilled) { pb.spilled = true; Lo.smash(pb.lootUrn, 'throw', { x: pb.x, y: pb.y - pb.K.r, z: pb.z }); }
  for (const b of Lo.list) if (b.k === 'chest') { const want = b.open ? -1.9 : 0; b.lidA += (want - b.lidA) * Math.min(1, dt * 5); }
  if (G.Phys) for (const pb of G.Phys.list) { if (pb.gone || pb.sleep > 0.2 || pb === G.Phys.held) continue; const sp = Math.hypot(pb.vx, pb.vy, pb.vz); if (sp < 4) continue; for (const b of Lo.near(pb.x, pb.z, pb.K.r + 0.4)) if (pb.y < b.y + 1) { Lo.smash(b, 'throw'); pb.vx *= 0.3; pb.vz *= 0.3; } }
  pT -= dt; if (pT <= 0) { pT = 0.5; const f = S.flags.found = S.flags.found || {}; for (const p of Lo.places) { if (f[p.id] || Math.hypot(p.x - P.x, p.z - P.z) > (p.r || 12) || Game.cineOn) continue; f[p.id] = 1;
    const n = Lo.places.filter(q => f[q.id]).length; sfx('quest', { pitch: 1.05 }); G.UI.featCard && G.UI.featCard('place', { kick: `새로운 곳 발견 · ${n} / ${Lo.places.length}`, n: p.n, ic: 'map', d: p.d || '' }); if (Game.insight && p.insight) setTimeout(() => Game.insight(p.insight, p.n), 1800); } } };
Lo.onDay = () => Lo.sync();
Lo.dyn = function (list) { const P = Game.P; for (const d of Lo.drops) list.push({ mesh: dropMesh(d.k), m: d.m, outline: true }); for (const b of Lo.list) { if (b.gone || Math.hypot(b.x - P.x, b.z - P.z) > 70) continue; list.push({ mesh: meshOf(b), m: b.m, outline: true });
  if (b.k === 'chest') { G.m4mul(b.lid, b.m, G.m4trs(G.m4tmp || (G.m4tmp = G.m4()), 0, 0.52, -0.28, 0, b.lidA, 0)); list.push({ mesh: mk('lid', chestLid), m: b.lid, outline: true }); } } };
})(window.G);
