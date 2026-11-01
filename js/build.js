/* 약속의 길 — building. The hero picks a blueprint (메뉴 → 짓기), walks a ghost of it to a spot (it sits in front of
   him, green when the ground is good), turns it and builds it with the gathered materials. Buildings persist in
   S.bld and become part of the world: campfires and ovens cook and warm, shelters keep the rain off and can be slept
   in, pens hold animals bought from traders, fields can be tilled and sown, wells give water, stables keep mounts.
   Blueprints: G.Build.BP (episodes may add their own via EP.blueprints or forbid places with EP.canBuild(x, z, S)). */
'use strict';
(function (G) {
const { R, GB, m4, m4trs, m4mul, rng, clamp } = G;
const Game = G.Game, PI = Math.PI;
const Bd = G.Build = { placing: null };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const $ = id => document.getElementById(id);
const env = () => G.env;
const at = (M, x, y, z, ry) => m4mul(m4(), M, m4trs(m4(), x, y, z, ry || 0));
// v11 customising: three sizes (costs scale with the floor area) and a few finishes (tints)
const SIZES = [[0.8, '작게'], [1, '보통'], [1.25, '크게']], TINTS = [[null, '본래 색'], [[1.12, 1.02, 0.86], '햇볕에 바랜'], [[0.82, 0.78, 0.76], '짙은 나무'], [[1.12, 0.86, 0.78], '붉은 흙'], [[0.9, 1.0, 1.08], '회칠']];
Bd.SIZES = SIZES; Bd.TINTS = TINTS;
const sOf = b => SIZES[b.size || 1] ? SIZES[b.size === undefined ? 1 : b.size][0] : 1;
const costOf = (bp, size) => { const k = SIZES[size === undefined ? 1 : size][0], c = {}; for (const i in bp.cost) c[i] = Math.max(1, Math.round(bp.cost[i] * k * k)); return c; };

// ------------------------------------------------------------------ models (local space, front = +z)
const MD = {
  campfire(g, M, r) { env().campfire(g, M, r); for (let i = 0; i < 5; i++) g.sph(0.07, 5, 4, { m: M, at: [(r() - 0.5) * 0.4, 0.1, (r() - 0.5) * 0.4], c: 0xff7a2a, j: 0.2 }); g.cyl(0.18, 0.2, 0.32, 7, { m: M, at: [1.3, 0.16, 0.2], c: 0x7a5a3a }); },
  leanto(g, M, r) { for (const [x, z, h] of [[-1.3, -0.9, 1.9], [1.3, -0.9, 1.9], [-1.3, 0.9, 1.2], [1.3, 0.9, 1.2]]) g.cyl(0.05, 0.06, h, 5, { m: M, at: [x, h / 2, z], c: 0x7a5a3a });
    for (let i = 0; i < 12; i++) g.cyl(0.03, 0.04, 2.3, 4, { m: M, at: [-1.4 + i * 0.255, 1.58, 0], rx: PI / 2 - 0.33, c: [0xb8a060, 0xa89050, 0xc8b070][i % 3], j: 0.05 });
    g.box(2.2, 0.03, 1.6, { m: M, at: [0, 0.02, 0], c: 0xb5673a, j: 0 }); g.box(0.7, 0.18, 0.5, { m: M, at: [-0.6, 0.1, -0.4], c: 0xd8c49a }); },
  fence(g, M, r) { env().fence(g, M, r, 4); },
  booth(g, M, r) { env().booth(g, M, r); },
  tent(g, M, r) { env().tent(g, M, r, 0x4a3e38); },
  house(g, M, r) { g.box(6.3, 1.4, 5.3, { m: M, at: [0, -0.6, 0], c: 0xa89070, j: 0.04 }); env().house(g, M, r, { w: 6, d: 5, h: 2.8, c: 0xcfb48c, awning: 0x8a3a2a, stair: true }); },
  pen(g, M, r) { const W2 = 6, D2 = 4.5, gate = 1.4; env().wallSeg(g, at(M, 0, 0, -D2), r, 12, 1.1); env().wallSeg(g, at(M, -W2, 0, 0, PI / 2), r, 9, 1.1); env().wallSeg(g, at(M, W2, 0, 0, PI / 2), r, 9, 1.1);
    env().wallSeg(g, at(M, -(W2 + gate) / 2, 0, D2), r, W2 - gate, 1.1); env().wallSeg(g, at(M, (W2 + gate) / 2, 0, D2), r, W2 - gate, 1.1);
    for (const s of [1, -1]) g.cyl(0.09, 0.1, 1.5, 6, { m: M, at: [gate * s, 0.75, D2], c: 0x6a4a30 }); env().trough(g, at(M, -3, 0, -3.4), r); g.lathe([[0.7, 0], [0.6, 0.4], [0.3, 0.7], [0.05, 0.85]], 9, { m: M, at: [3.6, 0, -3.2], c: 0xd8c070, j: 0.06 }); },
  stable(g, M, r) { for (const [x, z, h] of [[-3, -1.9, 2.6], [3, -1.9, 2.6], [-3, 1.9, 2.2], [3, 1.9, 2.2], [0, 1.9, 2.2]]) g.cyl(0.08, 0.1, h, 6, { m: M, at: [x, h / 2, z], c: 0x6a4a30 });
    g.box(6.5, 0.12, 4.4, { m: M, at: [0, 2.45, 0], rx: 0.1, c: 0xc8b070, j: 0.06 }); for (let i = 0; i < 8; i++) g.box(6.6, 0.08, 0.5, { m: M, at: [0, 2.53, -2 + i * 0.56], rx: 0.1, c: [0xb8a060, 0xd0b878][i % 2], j: 0.06 });
    env().wallSeg(g, at(M, 0, 0, -2.05), r, 6.2, 1.8, 0xb8a080); g.box(4.4, 0.5, 0.6, { m: M, at: [0, 0.55, -1.5], c: 0x7a5a3a }); g.box(4.2, 0.08, 0.45, { m: M, at: [0, 0.8, -1.5], c: 0xd8c070, j: 0.1 });
    g.lathe([[0.8, 0], [0.7, 0.5], [0.35, 0.85], [0.05, 1.0]], 9, { m: M, at: [2.4, 0, 0.6], c: 0xd8c070, j: 0.06 }); },
  field(g, M, r) { const w = 8.4, d = 6.8; for (let i = 0; i < 28; i++) { const t = i / 28, per = 2 * (w + d), p = t * per; let x, z; if (p < w) { x = -w / 2 + p; z = -d / 2; } else if (p < w + d) { x = w / 2; z = -d / 2 + p - w; } else if (p < 2 * w + d) { x = w / 2 - (p - w - d); z = d / 2; } else { x = -w / 2; z = d / 2 - (p - 2 * w - d); }
      g.sph(0.2 + r() * 0.1, 5, 4, { m: M, at: [x, 0.08, z], s: [1.3, 0.6, 1], ry: r() * 6, c: [0xb0a690, 0xa09680, 0xc0b6a0][i % 3], flat: true, j: 0.08 }); }
    g.cyl(0.05, 0.06, 1.2, 5, { m: M, at: [w / 2 + 0.3, 0.6, d / 2 + 0.3], c: 0x7a5a3a }); g.box(0.6, 0.35, 0.04, { m: M, at: [w / 2 + 0.3, 1.05, d / 2 + 0.33], c: 0xd8c8a0 }); },
  well(g, M, r) { env().well(g, M, r, { r: 1.0 }); env().trough(g, at(M, 0, 0, 2.1), r); },
  oven(g, M, r) { g.lathe([[0.85, 0], [0.82, 0.3], [0.68, 0.7], [0.4, 0.98], [0.12, 1.08]], 12, { m: M, c: 0xb5784a, j: 0.04 }); g.box(0.5, 0.42, 0.1, { m: M, at: [0, 0.3, 0.8], c: 0x2a1810, j: 0 }); g.sph(0.1, 6, 4, { m: M, at: [0, 0.25, 0.75], c: 0xff8a3a, j: 0.2 });
    for (let i = 0; i < 4; i++) g.cyl(0.05, 0.05, 0.6, 5, { m: M, at: [1.1, 0.06 + i * 0.1, -0.3 + (i % 2) * 0.1], rz: PI / 2, ry: 0.3 * i, c: 0x6a4a30 }); },
  loom(g, M) { g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [-0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.06, 0.06, 2, 6, { m: M, at: [0, 2.1, 0], rz: PI / 2, c: 0x7a5a3a });
    g.box(1.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: (x, y) => (Math.floor((y + 2) * 8) % 2 ? 0x9a5a7a : 0xe8dcc0) }); g.box(1.8, 0.1, 0.1, { m: M, at: [0, 0.35, 0], c: 0x6a4a30 }); },
  altar(g, M, r) { env().altar(g, M, r); g.cyl(0.25, 0.3, 0.1, 8, { m: M, at: [0, 1.25, 0], c: 0x8a7a68 }); },
};
// ------------------------------------------------------------------ blueprints
const BP = Bd.BP = {
  campfire: { n: '모닥불', feat: 'build', cost: { stone: 5, branch: 3 }, w: 1.8, d: 1.8, d0: '요리하고 몸을 녹여요', col: [{ r: 0.75, h: 0.5 }], st: [{ type: 'fire', r: 3 }], ic: 'fire' },
  leanto: { n: '움막', feat: 'build', cost: { branch: 8, reed: 4 }, w: 3, d: 2.2, d0: '비와 이슬을 피하고 잠을 잘 수 있어요', st: [{ type: 'bed', dz: 0, shelter: 2.6 }], shelter: [0, 0, 2.6], ic: 'house' },
  booth: { n: '초막', feat: 'build', cost: { branch: 8, reed: 6 }, w: 3.4, d: 2.6, d0: '나뭇가지로 엮은 그늘막 · 가축과 사람이 비를 피해요 (창 33:17)', shelter: [0, 0, 2.6], ic: 'house' },
  fence: { n: '나무 울타리', feat: 'build', cost: { branch: 4 }, w: 4, d: 0.5, d0: '길이 4걸음 · 마당을 꾸며요', col: [{ w: 4, d: 0.3, h: 1.1 }], ic: 'stick', many: true },
  tent: { n: '장막', feat: 'build2', cost: { cloth: 2, wood: 3, branch: 4 }, w: 6, d: 4, d0: '염소털 장막 · 앞에서 잠을 자고 비를 피해요', col: [{ w: 5.8, d: 3.8, h: 2.2, cam: true }], st: [{ type: 'bed', dz: 2.6, shelter: 4.2 }], shelter: [0, 2.2, 4.2], ic: 'house' },
  house: { n: '흙벽돌 집', feat: 'build2', cost: { brick: 20, wood: 6, straw: 4 }, w: 6.6, d: 5.6, slope: 1.6, d0: '평평한 지붕의 흙벽돌 집 · 비바람과 추위를 막아 줘요', col: [{ w: 6, d: 5, h: 3, cam: true }], st: [{ type: 'bed', dz: 3.3, shelter: 5 }], shelter: [0, 3, 5], ic: 'house' },
  pen: { n: '가축 우리', feat: 'build2', cost: { stone: 16, wood: 2 }, w: 12.6, d: 9.6, slope: 1.6, d0: '양·염소·소 20마리 · 가축 상인에게 사서 넣어요', pen: { w: 11, d: 8, cap: 20 }, ic: 'wool',
    col: [{ dx: 0, dz: -4.5, w: 12, d: 0.7, h: 1.2 }, { dx: -6, dz: 0, w: 0.7, d: 9, h: 1.2 }, { dx: 6, dz: 0, w: 0.7, d: 9, h: 1.2 }, { dx: -3.7, dz: 4.5, w: 4.6, d: 0.7, h: 1.2 }, { dx: 3.7, dz: 4.5, w: 4.6, d: 0.7, h: 1.2 }] },
  field: { n: '밭', feat: 'build2', cost: { stone: 4, branch: 4 }, w: 8.8, d: 7.2, slope: 1.0, d0: '20칸 밭 · 괭이로 갈고 씨앗을 심어요', field: { cols: 5, rows: 4 }, ic: 'seed' },
  well: { n: '우물', feat: 'build2', cost: { stone: 18, wood: 2, clay: 4 }, w: 3.2, d: 4.4, d0: '물을 길을 수 있어요', col: [{ r: 1.45, h: 1 }, { dz: 2.1, w: 2.4, d: 0.8, h: 0.6 }], st: [{ type: 'well', r: 2.6 }], ic: 'drop' },
  oven: { n: '흙 화덕', feat: 'build2', cost: { clay: 8, stone: 4 }, w: 2.2, d: 2.2, d0: '빵을 굽고 요리해요 · 곁이 따뜻해요', col: [{ r: 0.9, h: 1.1 }], st: [{ type: 'fire', r: 2.8, dz: 0.4 }], ic: 'fire' },
  loom: { n: '베틀', feat: 'build2', cost: { wood: 3, branch: 6 }, w: 2.4, d: 1.2, d0: '실로 천을, 아마로 세마포를 짜요', col: [{ w: 2, d: 0.6, h: 2.2 }], st: [{ type: 'loom', r: 2.6, dz: 0.8 }], ic: 'cloth' },
  altar: { n: '돌 제단', feat: 'build2', cost: { stone: 10 }, w: 2.2, d: 2.2, d0: '하루에 한 번 기도하면 몸과 마음이 새로워져요', col: [{ r: 1.0, h: 1.2 }], st: [{ type: 'custom', r: 2.6, pray: true }], ic: 'star' },
  stable: { n: '마구간', feat: 'ride', feat2: 'build2', cost: { wood: 6, straw: 6, branch: 6 }, w: 6.6, d: 4.6, slope: 1.4, d0: '탈것을 두 마리 더 기를 수 있어요 · 비를 피해요', col: [{ dz: -2.05, w: 6.2, d: 0.7, h: 1.9 }], shelter: [0, 0, 3.2], stable: [0, 0.4], ic: 'donkey' },
};
const ORDER = ['campfire', 'leanto', 'booth', 'fence', 'tent', 'house', 'pen', 'field', 'well', 'oven', 'loom', 'altar', 'stable'];
const bps = () => Object.assign({}, BP, (Game.EP() && Game.EP().blueprints) || {});
const bld = S => S.bld || (S.bld = []);
Bd.check = (k, x, z, ry, size, pre) => check(k, x, z, ry || 0, size === undefined ? 1 : size, pre);
// v16.7 the village fires the world lights by itself (fixed records in S.bld marked pre:1, never charged for)
Bd.prebuild = function (S, k, x, z, ry, name) { const b = { id: 'b' + (S.bldN = (S.bldN || 0) + 1), k, x: +x.toFixed(2), z: +z.toFixed(2), ry: +(ry || 0).toFixed(3), day: S.day, size: 1, tint: 0, pre: 1, name }; bld(S).push(b); attachOne(b, S, Game.W()); Game.ENT.plotsDirty = true; return b; };
Bd.count = (S, k) => bld(S).filter(b => b.k === k).length;
Bd.avail = (k, S) => { const b = bps()[k]; return b && Game.feat(b.feat) && (!b.feat2 || Game.feat(b.feat2)); };
const meshes = {};
function meshOf(k) { if (!meshes[k]) { const g = new GB(31 + k.length * 7); bps()[k].model ? bps()[k].model(g, m4(), rng(k.length * 13)) : MD[k](g, m4(), rng(k.length * 13)); meshes[k] = R.mesh(g); } return meshes[k]; }
const loc = (b, dx, dz) => { const ca = Math.cos(b.ry), sa = Math.sin(b.ry), k = sOf(b); dx *= k; dz *= k; return [b.x + dx * ca + dz * sa, b.z - dx * sa + dz * ca]; };
function groundY(k, x, z, ry) { const bp = bps()[k], W = Game.W(); let lo = 1e9, sum = 0, n = 0; const ca = Math.cos(ry), sa = Math.sin(ry);
  for (const [u, v] of [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]]) { const h = W.heightAt(x + u * bp.w / 2 * ca + v * bp.d / 2 * sa, z - u * bp.w / 2 * sa + v * bp.d / 2 * ca); lo = Math.min(lo, h); sum += h; n++; }
  return Math.min(sum / n, lo + 0.25); }

// ------------------------------------------------------------------ world attachment (pens, fields, stations, colliders)
Bd.attach = function (S, W) {
  const EP = Game.EP(); EP.pens = (EP.pens || []).filter(p => !p.bld); EP.fields = (EP.fields || []).filter(f => !f.bld); EP.stations = (EP.stations || []).filter(s => !s.bld);
  for (const b of bld(S)) attachOne(b, S, W);
};
function attachOne(b, S, W) {
  const bp = bps()[b.k], EP = Game.EP(); if (!bp) return; b._cols = [];
  const ks = sOf(b); b.y = groundY(b.k, b.x, b.z, b.ry); b.M = m4trs(m4(), b.x, b.y, b.z, b.ry, 0, 0, ks, ks, ks); b.d = null;
  for (const c of bp.col || []) { const [cx, cz] = loc(b, c.dx || 0, c.dz || 0); const sc = Object.assign({}, c, { x: cx, z: cz }); if (sc.w) sc.w *= ks; if (sc.d) sc.d *= ks; if (sc.r) sc.r *= ks; if (sc.h) sc.h *= ks; b._cols.push(W.addCol(Object.assign({ x: cx, z: cz, a: b.ry, y0: b.y - 0.5, y1: b.y + (sc.h || 2) }, sc))); }
  (bp.st || []).forEach((s, i) => { const [sx, sz] = loc(b, s.dx || 0, s.dz || 0); const st = Object.assign({ id: 'bs_' + b.id + '_' + i, x: sx, z: sz, bld: b.id }, s);
    if (s.pray) Object.assign(st, { type: 'custom', action: () => pray(b) }); EP.stations.push(st); });
  if (bp.pen) { const [gx, gz] = loc(b, 0, bp.d / 2 + 0.9); const id = 'bp_' + b.id;
    EP.pens.push({ id, n: b.name || '내 우리', x: b.x, z: b.z, w: bp.pen.w, d: bp.pen.d, ry: b.ry, gx, gz, owner: 'home', cap: bp.pen.cap, trough0: 0, bld: b.id });
    if (!S.herds[id]) S.herds[id] = { list: [], trough: 0, hay: 0, rods: 0, joy: 0, woolDays: 0, milk: false, wool: false }; }
  if (bp.field) EP.fields.push({ id: 'bf_' + b.id, x: b.x, z: b.z, cols: bp.field.cols, rows: bp.field.rows, ry: b.ry, bld: b.id });
}
function detachOne(b) { const EP = Game.EP(); for (const c of b._cols || []) c.on = false; b._cols = [];
  EP.pens = EP.pens.filter(p => p.bld !== b.id); EP.fields = EP.fields.filter(f => f.bld !== b.id); EP.stations = EP.stations.filter(s => s.bld !== b.id); }
function pray(b) {
  const S = Game.S();
  if (S.flags.prayDay === S.day) return { label: '오늘은 이미 기도했어요', disabled: true };
  return { label: '제단에서 기도하기', use: () => { S.flags.prayDay = S.day; const P = Game.P; P.kneel = true; P.face = Math.atan2(b.x - P.x, b.z - P.z); sfx('insight', { pitch: 0.9 });
    G.UI.say([{ n: '', t: '제단 앞에 엎드려 기도합니다. "여호와는 나의 목자시니 내게 부족함이 없으리로다."', ref: '시편 23:1 (다윗의 노래)' }], () => { P.kneel = false; const H = S.hero; if (H) H.hp = H.hpMax; if (S.surv) S.surv.warm = 100; P.stam = (H && H.stamMax) || 100; G.UI.toast('마음이 평안해지고 몸에 힘이 솟아요'); if (G.Combat) G.Combat.hpDirty = 1;
      G.FX.burst(b.x, b.y + 1.4, b.z, 24, { c: [1, 0.9, 0.55], sp: 1, up: 2.2 }); if (!S.flags.firstPray) { S.flags.firstPray = 1; Game.insight && setTimeout(() => Game.insight(1, '나의 제단'), 300); } }); } };
}
Bd.shelterAt = function (x, z) { const S = Game.S(); let best = 0; for (const b of bld(S)) { const bp = bps()[b.k]; if (!bp || !bp.shelter) continue; const [sx, sz] = loc(b, bp.shelter[0], bp.shelter[1]); const d = Math.hypot(sx - x, sz - z); if (d < bp.shelter[2]) best = Math.max(best, 1 - d / (bp.shelter[2] * 1.25)); } return best; };
Bd.homePen = function (S) { for (const p of Game.EP().pens || []) if (p.owner === 'home' && S.herds[p.id] && S.herds[p.id].list.length < (p.cap || 20)) return p.id; return null; };
Bd.homePens = S => (Game.EP().pens || []).filter(p => p.owner === 'home');
Bd.stableSpot = function (S) { const st = bld(S).filter(b => b.k === 'stable'); if (!st.length) return null; const b = st[Math.floor(Math.random() * st.length)]; return loc(b, (Math.random() - 0.5) * 3, 0.6); };

// ------------------------------------------------------------------ placement
function check(k, x, z, ry, size, pre) {
  const bp = bps()[k], W = Game.W(), EP = Game.EP(), S = Game.S(), P = Game.P, ks = SIZES[size === undefined ? 1 : size][0]; const hw = bp.w / 2 * ks, hd = bp.d / 2 * ks, ca = Math.cos(ry), sa = Math.sin(ry);
  const wl = W.water ? W.water.level : -99; let lo = 1e9, hi = -1e9;
  for (const [u, v] of [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1], [-1, 0], [1, 0]]) { const px = x + u * hw * ca + v * hd * sa, pz = z - u * hw * sa + v * hd * ca, h = W.heightAt(px, pz); lo = Math.min(lo, h); hi = Math.max(hi, h); if (h < wl + 0.3) return '물가에는 지을 수 없어요'; }
  if (hi - lo > (bp.slope || 1.2)) return '땅이 너무 비탈져요';
  if (Math.max(Math.abs(x), Math.abs(z)) > W.half - 22) return '너무 외진 곳이에요';
  const inside = (cx, cz, pad) => { const dx = cx - x, dz = cz - z, lx = dx * ca - dz * sa, lz = dx * sa + dz * ca; return Math.abs(lx) < hw + pad && Math.abs(lz) < hd + pad; };
  const H = W.HC; const seen = new Set(); const ext = Math.hypot(hw, hd) + 3;
  for (let gx = Math.floor((x - ext) / H); gx <= Math.floor((x + ext) / H); gx++) for (let gz = Math.floor((z - ext) / H); gz <= Math.floor((z + ext) / H); gz++) for (const c of W.hash.get(gx * 10007 + gz) || []) {
    if (!c.on || seen.has(c)) continue; seen.add(c); const cr = c.t === 'c' ? c.r : Math.min(c.hw, c.hd);
    if (inside(c.x, c.z, cr * 0.7) || (c.t === 'b' && Math.hypot(c.x - x, c.z - z) < Math.hypot(c.hw, c.hd) * 0.7 + Math.min(hw, hd))) return '다른 것과 겹쳐요'; }
  for (const b of bld(S)) { const o = bps()[b.k]; if (!o) continue; if (Math.hypot(b.x - x, b.z - z) < (Math.min(o.w, o.d) + Math.min(bp.w, bp.d)) * 0.45 + (k === 'fence' && b.k === 'fence' ? -0.6 : 0.2)) return '다른 건물과 너무 가까워요'; }
  for (const f of EP.fields || []) { if (f.bld) continue; const ts = f.ts || 1.6; if (Math.hypot(f.x - x, f.z - z) < Math.hypot(f.cols * ts, f.rows * ts) / 2 + Math.min(hw, hd)) return '밭과 겹쳐요'; }
  for (const p of EP.pens || []) { if (p.bld || (p.hidden && p.hidden(S))) continue; if (Math.hypot(p.x - x, p.z - z) < Math.hypot(p.w, p.d) / 2 + Math.min(hw, hd)) return '우리와 겹쳐요'; }
  for (const s of (EP.stations || []).concat(EP.specials || []).concat(EP.sites || [])) { if (s.bld) continue; if (inside(s.x, s.z, 1.6)) return '여기에는 지을 수 없어요'; }
  if (!pre && inside(P.x, P.z, 0.3)) return '조금 뒤로 물러서세요';
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.vis && inside(n.x, n.z, 0.4)) return '사람이나 짐승이 서 있어요'; }
  if (EP.canBuild && !pre) { const m = EP.canBuild(x, z, S, k); if (m) return m === true ? '여기에는 지을 수 없어요' : m; }
  return null;
}
const canPay = (cost) => Object.keys(cost).every(i => Game.have(i, cost[i]));
Bd.start = function (k) {
  const bp = bps()[k]; if (!bp || !Bd.avail(k, Game.S())) return;
  if (!canPay(costOf(bp, 1))) { G.UI.toast('재료가 부족해요'); return; }
  if (Game.P.ride && G.Ride) G.Ride.dismount(true);
  Bd.placing = { k, rot: k === 'fence' ? PI / 2 : PI, x: 0, z: 0, ry: 0, msg: null, t: 0, size: 1, tint: 0 }; if (G.UI.busy()) G.UI.closePanel(); bar(true); sfx('click');
};
Bd.rotate = () => { if (Bd.placing) { Bd.placing.rot += PI / 4; sfx('click'); } };
Bd.resize = () => { const pl = Bd.placing; if (!pl) return; pl.size = (pl.size + 1) % SIZES.length; pl.t = 0; sfx('click'); bar(true); };
Bd.retint = () => { const pl = Bd.placing; if (!pl) return; pl.tint = (pl.tint + 1) % TINTS.length; sfx('click'); bar(true); };
Bd.cancel = () => { Bd.placing = null; bar(false); };
Bd.confirm = function () {
  const pl = Bd.placing; if (!pl) return; if (pl.msg) { G.UI.toast(pl.msg); return; } const bp = bps()[pl.k], cost = costOf(bp, pl.size);
  if (!canPay(cost)) { G.UI.toast('재료가 부족해요 · 「크기」로 작게 지으면 덜 들어요'); return; }
  const spot = { k: pl.k, x: pl.x, z: pl.z, ry: pl.ry, size: pl.size, tint: pl.tint }; const P = Game.P;
  P.act = 'hoe'; P.actT = 0; P.actDur = 0.55; P.actHits = 3; P.actProp = 'hammer'; P.fired = false; P.actRepeat = false; P.face = Math.atan2(spot.x - P.x, spot.z - P.z);
  P.actFn = () => { const S = Game.S(); if (!canPay(cost)) return; for (const i in cost) Game.take(i, cost[i]);
    const b = { id: 'b' + (S.bldN = (S.bldN || 0) + 1), k: spot.k, x: +spot.x.toFixed(2), z: +spot.z.toFixed(2), ry: +spot.ry.toFixed(3), day: S.day, size: spot.size, tint: spot.tint }; bld(S).push(b); attachOne(b, S, Game.W());
    Game.ENT.plotsDirty = true; G.FX.burst(b.x, b.y + 1, b.z, 40, { c: [1, 0.9, 0.6], sp: 3, up: 3 }); sfx('craft'); G.UI.toast(`완성 · ${bp.n}`); Game.stat('builtN');
    if (bp.pen) G.UI.toast('우리를 지었어요 · 가축 상인에게서 가축을 사면 이리로 와요'); if (bp.stable && G.Ride) G.UI.toast('마구간을 지었어요 · 탈것을 더 둘 수 있어요');
    if (Game.EP().onBuild) Game.EP().onBuild(b, S, Game); Game.checkStep(); Game.save(true);
    if (!(bp.many && canPay(cost))) Bd.cancel(); };
  sfx('hammer');
};
Bd.remove = function (id) {
  const S = Game.S(), i = bld(S).findIndex(b => b.id === id); if (i < 0) return; const b = bld(S)[i], bp = bps()[b.k];
  if (b.pre) { G.UI.toast('마을 사람들이 함께 쓰는 모닥불이에요'); return; }
  if (bp.pen) { const h = S.herds['bp_' + b.id]; if (h && h.list.length) { G.UI.toast('우리에 가축이 있어요 · 먼저 다른 곳으로 옮기거나 파세요'); return; } }
  detachOne(b); bld(S).splice(i, 1); if (bp.field) { for (const pid in S.plots) if (pid.startsWith('bf_' + b.id + ':')) delete S.plots[pid]; }
  for (const k in bp.cost) { const n = Math.floor(bp.cost[k] / 2); if (n) Game.give(k, n, true); } Game.ENT.plotsDirty = true; Game.refreshAnimals(); G.UI.toast(`${bp.n}을(를) 허물었어요 · 재료의 절반을 돌려받았어요`); Game.save(true);
};
Bd.update = function (dt) {
  const pl = Bd.placing, P = Game.P; fireFX(dt);
  if (!pl) return; if (Game.mode !== 'play' || Game.cineOn) { Bd.cancel(); return; }
  const bp = bps()[pl.k]; const dist = Math.max(bp.w, bp.d) / 2 * SIZES[pl.size][0] + 1.4; pl.x = P.x + Math.sin(P.face) * dist; pl.z = P.z + Math.cos(P.face) * dist; pl.ry = P.face + pl.rot;
  pl.t -= dt; if (pl.t <= 0) { pl.t = 0.12; pl.msg = check(pl.k, pl.x, pl.z, pl.ry, pl.size); if (!pl.msg && !canPay(costOf(bp, pl.size))) pl.msg = '재료가 부족해요'; const m = $('bbMsg'); if (m) { const t = pl.msg || 'A를 누르면 지어요'; if (m.textContent !== t) m.textContent = t; m.classList.toggle('bad', !!pl.msg); } }
};
// interaction: while placing, the action button builds
Game.CTX.push(function () { const pl = Bd.placing; if (!pl || Game.P.act) return null; const bp = bps()[pl.k];
  return [{ d: -99, label: pl.msg ? '여기는 안 돼요' : `${bp.n} 짓기`, disabled: !!pl.msg, x: pl.x, z: pl.z, y: 1.6, use: Bd.confirm, key: 'build' }]; });

// ------------------------------------------------------------------ rendering
let frameMesh = null; const ghostM = m4(), frameM = m4();
Bd.dyn = function (list, S) {
  const P = Game.P;
  for (const b of bld(S)) { if (!b.M || Math.hypot(b.x - P.x, b.z - P.z) > 120) continue; list.push(b.d || (b.d = { mesh: meshOf(b.k), m: b.M, outline: true, tint: (TINTS[b.tint || 0] || TINTS[0])[0] })); }
  const pl = Bd.placing; if (pl) { const y = groundY(pl.k, pl.x, pl.z, pl.ry), ks = SIZES[pl.size][0]; m4trs(ghostM, pl.x, y + 0.02, pl.z, pl.ry, 0, 0, ks, ks, ks);
    list.push({ mesh: meshOf(pl.k), m: ghostM, tint: pl.msg ? [1.5, 0.55, 0.5] : [0.7, 1.45, 0.75], emis: pl.msg ? [0.25, 0.02, 0] : [0.02, 0.2, 0.05], shadow: false, outline: true }); }
};
Bd.flats = function (flats) {
  const pl = Bd.placing; if (!pl) return; const bp = bps()[pl.k], W = Game.W();
  if (!frameMesh) { const g = new GB(3), w = 0.06; for (const [x0, z0, x1, z1] of [[-0.5, -0.5, 0.5, -0.5 + w], [-0.5, 0.5 - w, 0.5, 0.5], [-0.5, -0.5, -0.5 + w, 0.5], [0.5 - w, -0.5, 0.5, 0.5]]) for (const q of [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z0], [x1, 0, z1], [x0, 0, z1]]) g.d.push(q[0], q[1], q[2], 0, 1, 0, 1, 1, 1, 0.9, 0); frameMesh = R.mesh(g); }
  m4trs(frameM, pl.x, W.heightAt(pl.x, pl.z) + 0.15, pl.z, pl.ry, 0, 0, bp.w * SIZES[pl.size][0], 1, bp.d * SIZES[pl.size][0]); flats.push({ mesh: frameMesh, m: frameM, color: pl.msg ? [1, 0.45, 0.35, 0.8] : [0.6, 1, 0.6, 0.8] });
};
// flames & smoke on every fire near the hero (episode campfires and built ones)
let fxT = 0;
function fireFX(dt) {
  fxT -= dt; if (fxT > 0 || Game.mode !== 'play') return; fxT = 0.07; const P = Game.P, EP = Game.EP(), S = Game.S(), W = Game.W(); if (!W) return;
  const rain = G.Weather ? G.Weather.cur.rain : 0;
  for (const s of EP.stations || []) { if (s.type !== 'fire' || (s.on && !s.on(S, Game)) || s.noFlame) continue; const d = Math.hypot(s.x - P.x, s.z - P.z); if (d > 38) continue;
    const y = W.heightAt(s.x, s.z) + (s.fy || 0.15), fx = s.x + (s.fdx || 0), fz = s.z + (s.fdz || 0);
    G.FX.burst(fx, y, fz, 2, { c: [1, 0.55 + Math.random() * 0.3, 0.18], sp: 0.25, up: 1.1, g: -0.6, life: 0.55, size: 0.22, a: 0.9, spread: 0.45, drag: 1 });
    if (Math.random() < 0.35) G.FX.burst(fx, y + 0.6, fz, 1, { c: [0.45, 0.42, 0.4], sp: 0.2, up: 0.6, g: -0.35, life: 2.2, size: 0.45, a: 0.25 * (1 - rain * 0.5), spread: 0.3, drag: 0.6 }); }
}

// ------------------------------------------------------------------ menu (메뉴 → 짓기)
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
Bd.renderMenu = function (body, rerender) {
  const S = Game.S(), B = bps(), UI = G.UI, keys = ORDER.concat(Object.keys(B).filter(k => !ORDER.includes(k)));
  const cost = c => `<div class="cost">${Object.keys(c).map(i => `<em class="${Game.have(i, c[i]) ? '' : 'no'}">${esc(Game.ITEMS[i] ? Game.ITEMS[i].n : i)} ${Game.inv(i)}/${c[i]}</em>`).join('')}</div>`;
  const open = keys.filter(k => Bd.avail(k, S)), locked = keys.filter(k => !Bd.avail(k, S));
  const mine = bld(S);
  body.innerHTML = `<div class="row"><div class="t"><b>원하는 곳에 지어요</b><span>설계도를 고르면 야곱 앞에 초록 그림자가 보여요. 걸어서 자리를 잡고 「돌리기」로 방향을 바꾼 뒤 A를 누르면 지어요.</span></div></div>` +
    open.map(k => { const b = B[k], ok = canPay(b.cost); return `<div class="row">${UI.icon(b.ic || 'tool', ok ? '#e5b552' : '#8a8070')}<div class="t"><b>${esc(b.n)}${Bd.count(S, k) ? ` · ${Bd.count(S, k)}개 지음` : ''}</b><span>${esc(b.d0 || '')}</span>${cost(b.cost)}</div><button class="sbtn ${ok ? 'pri' : ''}" data-bp="${k}" ${ok ? '' : 'disabled'}>자리 잡기</button></div>`; }).join('') +
    (locked.length ? `<div class="sec">아직 모르는 설계도 ${locked.length}개</div><div class="row"><div class="t"><span>이야기가 이어지면 더 많은 것을 지을 수 있어요.</span></div></div>` : '') +
    (mine.length ? `<div class="sec">내가 지은 것</div>` + mine.map(b => { const bp = B[b.k]; const dd = Math.round(Math.hypot(b.x - Game.P.x, b.z - Game.P.z)); return `<div class="row">${UI.icon(bp ? bp.ic || 'tool' : 'tool', '#c8c0b0')}<div class="t"><b>${esc(bp ? bp.n : b.k)}</b><span>${dd}m 떨어져 있어요 · ${b.day}일째에 지음</span></div><button class="sbtn" data-rm="${b.id}">허물기</button></div>`; }).join('') : '');
  body.onclick = e => { const t = e.target.closest('button'); if (!t || t.disabled) return; if (t.dataset.bp) Bd.start(t.dataset.bp);
    if (t.dataset.rm) { if (t.dataset.sure) { Bd.remove(t.dataset.rm); rerender && rerender(); } else { t.dataset.sure = 1; t.textContent = '정말 허물기'; } } };
};
function bar(on) { const el = $('buildBar'); if (!el) return; el.hidden = !on; if (on) { const pl = Bd.placing, bp = bps()[pl.k], c = costOf(bp, pl.size); $('bbName').textContent = `${bp.n} · ${SIZES[pl.size][1]} · ${TINTS[pl.tint][1]}`;
  if ($('bbSize')) { $('bbSize').textContent = '크기: ' + SIZES[pl.size][1]; $('bbTint').textContent = '색: ' + TINTS[pl.tint][1]; $('bbCost').textContent = Object.keys(c).map(i => `${Game.ITEMS[i] ? Game.ITEMS[i].n : i} ${c[i]}`).join(' · '); } } }
if ($('bbRot')) { $('bbRot').onclick = Bd.rotate; $('bbCancel').onclick = Bd.cancel; if ($('bbSize')) { $('bbSize').onclick = Bd.resize; $('bbTint').onclick = Bd.retint; } }
})(window.G);
