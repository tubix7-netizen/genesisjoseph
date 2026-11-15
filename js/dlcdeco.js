/* 약속의 길 — v18.63 두 DLC 무대 더 꾸미기 (dlcdeco.js · dlc_abraham.js 다음)
   두 이야기의 땅(야곱 편 dlcj · 아브라함 편 dlca)에 숲 띠 · 과수원 · 포도원 · 돌담 · 살림살이 · 바위를 더하고(spec.deco),
   굴뚝 연기와 하늘을 도는 새 떼를 그려요(G.DLCEP.deco). 이야기 자리(우물 · 우리 · 길 · 진영 · 산길 …)는 비워 둬요.
   v18.64 이야기마다 따로 된 지도가 되어 G.DLCEP 틀에 붙어요. 포도원은 막대 위의 공이 아니라 땅에 낮게 기는 포도나무 줄이에요(창 49:11). */
'use strict';
(function (G) {
const Game = G.Game, XL = G.DLCEP; if (!Game || !XL) return;
const land = k => (XL.list || []).find(l => l.key === k);
const away = (keep, x, z) => keep.every(([kx, kz, r]) => Math.hypot(kx - x, kz - z) > r);
const inRect = (rs, x, z) => rs.some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
function wrap(key, deco) { const L = land(key); if (!L || !L.spec) return; (L.spec.deco = L.spec.deco || []).push(deco); }
const tree = (B, k, x, z, y, s) => { B.put(k, x, z, { y, s: s || (0.85 + B.rng() * 0.35), ry: B.rng() * 6.28 }); B.colR(x, z, 0.5, (y || B.BY) + 4); };
function wall(B, x0, z0, x1, z1, y) { const L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0), n = Math.ceil(L / 1.1); for (let i = 0; i < n; i++) { const k = (i + 0.5) / n; B.sph(0.42 + B.rng() * 0.14, x0 + (x1 - x0) * k, (y || B.BY) + 0.28, z0 + (z1 - z0) * k, [0x9a9284, 0x8a8276, 0xa8a090][i % 3], { s: [1.3, 0.75, 1], flat: true, j: 0.1 }); }
  B.col((x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.7, Math.abs(z1 - z0) + 0.7, (y || B.BY) - 1, (y || B.BY) + 0.8); void a; }

// ------------------------------------------------------------------ 야곱 편 · 하란 들판
const J = { WELL: [-30, -6], FOLD: [16, 2], SHED: [28, 14], FIELD: [-36, 30], GATE: [-8, 13], OUT: [-60, 2.6], CAMPF: [36, -34], TANNUR: [-17, 17.5] };
const JKEEP = [[-30, -6, 10], [16, 2, 9], [28, 14, 6], [-36, 30, 11], [-8, 13, 5], [-60, 2.6, 6], [36, -34, 7], [-14, -20, 7], [8, -20, 7]];
const JRECT = [[-25, 9, 9, 38], [-64, -37, -44, -12], [-24, 20, -46, -26], [28, 48, -29, 5], [14, 46, 32, 48], [49, 70, -70, 70], [-70, 60, 5, 11]]; /* house yard · town · three pastures · river · the road */
wrap('dlcj', B => { const { BY, rng } = B, ok = (x, z) => away(JKEEP, x, z) && !inRect(JRECT, x, z);
  /* tree belts on three sides (the river is the fourth) */
  for (let z = -52; z <= 52; z += 5.5) { const x = -60 + rng() * 3; if (ok(x, z)) tree(B, ['oak', 'tamarisk', 'olive'][Math.floor(rng() * 3)], x, z, BY); }
  for (let x = -52; x <= 44; x += 6) { const z = -52 + rng() * 2.5; if (ok(x, z)) tree(B, ['acacia', 'tamarisk', 'datePalm', 'oak'][Math.floor(rng() * 4)], x, z, BY); }
  /* an olive orchard in rows on the south slope, with a stone wall */
  for (let x = -54; x <= -4; x += 5) for (let z = 46; z <= 54; z += 4.5) if (ok(x, z)) tree(B, 'olive', x + rng() * 0.8, z + rng() * 0.8, BY, 0.8 + rng() * 0.2);
  wall(B, -56, 43.5, -4, 43.5);
  /* dry-stone walls along the pastures (gaps left for the flock) */
  wall(B, -24, -45.5, -6, -45.5); wall(B, 2, -45.5, 20, -45.5); wall(B, 47.5, -28, 47.5, -8); wall(B, 14, 48.5, 30, 48.5);
  /* the life of a shepherds' farm: hay, wood, jars, baskets, troughs, a dovecote, shepherd booths, a well-sweep by the river */
  const X = (fn, x, z, o) => { if (B.E[fn] || (G.env && G.env[fn])) B.put(fn, x, z, Object.assign({ y: BY, ry: rng() * 6.28 }, o || {})); };
  X('bales', 33, 18); X('bales', 34.5, 15.5, { s: 0.9 }); X('straw', 31, 20); X('woodStack', -22, 9.4, { ry: 0 }); X('jars', 9.5, 10.2); X('baskets', 11, 11); X('trough', 21, 7); X('trough', 10.5, -4, { ry: 1.57 });
  X('dovecote', -27, 41); B.colR(-27, 41, 1.6, BY + 4); X('booth', -6, -44); X('booth', 40, -20, { ry: 1.2 }); X('booth', 24, 42);
  X('shaduf', 48, 20, { ry: -1.57 }); X('sheafField', -46, 22, { s: 0.8 }); X('woodStack', 38, -38);
  for (const [x, z] of [[-48, -52], [42, -54], [-62, 44], [-58, -40], [46, 52]]) X('outcrop', x, z, { s: 0.9 + rng() * 0.6 });
  /* low bushes and boulders in the open ground between */
  for (let i = 0; i < 70; i++) { const x = -60 + rng() * 108, z = -52 + rng() * 104; if (!ok(x, z)) continue; const r = rng(); X(r < 0.45 ? 'bush' : r < 0.7 ? 'retama' : r < 0.85 ? 'rock' : 'herbBush', x, z, { s: 0.6 + rng() * 0.6 }); if (r >= 0.7 && r < 0.85) B.colR(x, z, 0.5); } });
// ------------------------------------------------------------------ 아브라함 편 · 세겜 · 마므레 · 진영 · 모리아
const A = { HILL: [72, 42], KNOLL: [34, 40] };
const HPROF = [[20, 0], [16, 1.6], [12, 3.4], [8, 5], [4, 5.9], [0, 6]], KPROF = [[9, 0], [6, 0.7], [3, 1.2], [0, 1.35]];
const prof = (P, d) => { if (d >= P[0][0]) return 0; for (let i = 0; i < P.length - 1; i++) { const [d0, h0] = P[i], [d1, h1] = P[i + 1]; if (d <= d0 && d >= d1) return h0 + (h1 - h0) * (d0 - d) / (d0 - d1); } return P[P.length - 1][1]; };
const hy = (x, z) => Math.max(prof(HPROF, Math.hypot(x - 72, z - 42)), prof(KPROF, Math.hypot(x - 34, z - 40)));
const AKEEP = [[-88, -4, 6], [-62, -20, 7], [-56, -14, 5], [-34, 4, 5], [-16, -8, 7], [-13, -3, 4], [0, 8, 9], [12, 7, 6], [6, 17, 4], [24, 2, 5], [-26, 30, 7], [-8, 40, 8], [-8, 14, 4], [-4, -6, 4], [46, -20, 6], [48, 44, 6], [72, 42, 6], [66, 37, 4], [78, 48, 4], [77, 36, 4], [-91, 8, 5], [-40, 2, 5], [44, -30, 5], [44, 52, 5], [34, 40, 10],
  ...[[-70, -28], [-67, -9], [-55, -27], [-49, -16], [-61, -5], [-73, -17], [-52, -22], [-65, -32]].map(([x, z]) => [x, z, 3])];
const ARECT = [[46, 98, -48, 0]]; /* the kings' camp and its sneaking paths stay as they are */
const onPath = (x, z) => { const ax = 48, az = 44, bx = 72, bz = 42, dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - ax - dx * t, z - az - dz * t) < 3.4; };
wrap('dlca', B => { const { BY, rng } = B, ok = (x, z) => away(AKEEP, x, z) && !inRect(ARECT, x, z) && !onPath(x, z), Y = (x, z) => BY + hy(x, z);
  const X = (fn, x, z, o) => { if (B.E[fn] || (G.env && G.env[fn])) B.put(fn, x, z, Object.assign({ y: Y(x, z), ry: rng() * 6.28 }, o || {})); };
  /* 세겜: vineyard rows on the terraces, an olive grove, terebinths along the hills */
  /* (v18.64) the vines lie low along the rows, propped on a stone here and there, with dark clusters under the leaves: no stakes with balls on top */
  const OLV = [[-90, 26], [-84, 40], [-76, 42], [-70, 38], [-92, 44]];
  for (let x = -90.6; x <= -79; x += 2.3) { for (let z = 28.4; z <= 38.2; z += 1.05) { if (!ok(x, z) || OLV.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 2.4)) continue; const jx = (rng() - 0.5) * 0.25, w = 0.55 + rng() * 0.2;
      B.sph(w, x + jx, BY + 0.26, z, [0x4a7430, 0x56803a, 0x5e883e][Math.floor(rng() * 3)], { s: [1.05, 0.5, 1.5], flat: true, j: 0.14 });
      if (rng() < 0.45) B.sph(0.07 + rng() * 0.03, x + jx + (rng() < 0.5 ? -0.42 : 0.42), BY + 0.2, z + (rng() - 0.5) * 0.6, 0x3a2448, { s: [1, 1.4, 1], j: 0.1 });
      if (rng() < 0.2) B.sph(0.16, x + jx + 0.2, BY + 0.08, z, 0x9a9284, { s: [1.3, 0.6, 1], flat: true, j: 0.1 }); }
    B.cyl(0.05, 0.07, 0.9, 5, x + 0.1, BY + 0.45, 27.8, 0x6a4a30); }
  X('booth', -77.4, 36.8, { ry: 0.2 }); /* the watchman's booth over the vineyard (사 1:8) */
  for (let x = -90; x <= -72; x += 4.5) for (let z = -52; z <= -40; z += 4.5) if (ok(x, z)) tree(B, 'olive', x + rng(), z + rng(), BY, 0.85);
  for (let x = -92; x <= -46; x += 6) { const z = -55 + rng() * 2; if (ok(x, z)) tree(B, rng() < 0.6 ? 'oak' : 'acacia', x, z, BY); }
  wall(B, -92, 27, -78.5, 27); X('altar', -80, -46, { s: 0.7 }); /* a Canaanite high place on the edge of the olive grove (12:6 「그때에 가나안 사람이 그 땅에 거하였더라」) */
  /* 마므레: a thicker oak grove behind the camp, tent life, a stone fold, camels */
  for (let i = 0; i < 26; i++) { const x = -38 + rng() * 70, z = -54 + rng() * 22; if (ok(x, z)) tree(B, rng() < 0.75 ? 'oak' : 'tamarisk', x, z, BY, 0.9 + rng() * 0.4); }
  for (const [fn, x, z, o] of [['quern', 3, 13], ['jars', -3.5, 12.5], ['baskets', 15, 12], ['woodStack', -11, 17], ['sacks', 17, 11], ['loomX', 9, 22, { ry: 1.2 }], ['pots', 1, 22], ['camelSit', 30, 12, { ry: -1 }], ['camelSit', 33, 15, { ry: -0.6 }], ['trough', 27, 4], ['bales', -20, 24]]) if (ok(x, z) || /quern|jars|baskets|pots|sacks|loomX/.test(fn)) X(fn, x, z, o);
  wall(B, -34, 24, -18, 24); wall(B, -34, 36, -18, 36); wall(B, -34, 24, -34, 36);
  /* 모리아: junipers and broom on the slopes, scree and boulders, the way up left open */
  for (let i = 0; i < 60; i++) { const a = rng() * 6.283, r = 3 + rng() * 17, x = 72 + Math.cos(a) * r, z = 42 + Math.sin(a) * r; if (!ok(x, z)) continue; const q = rng(); X(q < 0.35 ? 'retama' : q < 0.6 ? 'desertShrub' : q < 0.8 ? 'rock' : 'acacia', x, z, { s: 0.6 + rng() * 0.6 }); if (q >= 0.6) B.colR(x, z, 0.6, Y(x, z) + 3); }
  for (const [x, z] of [[58, 30], [86, 30], [90, 50], [62, 58], [80, 60]]) { X('outcrop', x, z, { s: 1 + rng() * 0.6 }); B.colR(x, z, 1.4, Y(x, z) + 3); }
  /* the far edges: groves so the stage never ends in bare grass */
  for (let x = -90; x <= 90; x += 7) { const z = 60 + rng() * 2; if (ok(x, z)) tree(B, ['oak', 'olive', 'tamarisk'][Math.floor(rng() * 3)], x, z, Y(x, z)); }
  for (let i = 0; i < 60; i++) { const x = -92 + rng() * 184, z = -54 + rng() * 116; if (!ok(x, z)) continue; const q = rng(); X(q < 0.5 ? 'bush' : q < 0.75 ? 'herbBush' : 'rock', x, z, { s: 0.6 + rng() * 0.5 }); } });

// ------------------------------------------------------------------ 굴뚝 연기와 새 떼
const SMOKE = { dlcj: [[-17, 17.5], [36, -34], [-50, -30], [-56, -20]], dlca: [[6, 17], [-74, -8]] };
const BIRDS = { dlcj: [[0, 0, 20], [-40, 30, 14]], dlca: [[-10, 10, 22], [72, 42, 16]] };
let bird = null; const BM = [], sT = { dlcj: 0, dlca: 0 };
XL.deco = function (k, list, t) { if (!SMOKE[k]) return; const s = Game.S(), h = s ? s.time % 24 : 12, night = h < 5.5 || h > 19.5;
  /* smoke: a thin grey wisp above each hearth */
  if (G.FX && t - sT[k] > 0.35) { sT[k] = t; for (const [x, z] of SMOKE[k]) G.FX.burst(x, (k === 'dlca' ? hy(x, z) : 0) + 1.4, z, 1, { c: [0.78, 0.76, 0.74], sp: 0.15, up: 0.9, size: 0.45, a: 0.35, g: -0.25, life: 4, drag: 0.2 }); }
  /* birds: two loose flocks wheeling high over the fields by day */
  if (night) return; if (!bird) { const g = new G.GB(733); g.box(0.5, 0.03, 0.12, { at: [0.22, 0, 0], rz: 0.35, c: 0x2a2420 }); g.box(0.5, 0.03, 0.12, { at: [-0.22, 0, 0], rz: -0.35, c: 0x2a2420 }); g.box(0.1, 0.06, 0.28, { at: [0, 0, 0], c: 0x2a2420 }); bird = G.R.mesh(g); }
  let i = 0; for (const [cx, cz, r] of BIRDS[k]) for (let b = 0; b < 6; b++, i++) { const a = t * (0.18 + b * 0.01) + b * 0.55 + cx, rr = r + Math.sin(t * 0.3 + b) * 3, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr, y = 16 + Math.sin(t * 0.7 + b * 1.3) * 2 + b * 0.4;
    const m = BM[i] || (BM[i] = G.m4()), flap = 0.7 + 0.3 * Math.abs(Math.sin(t * 6 + b)); G.m4trs(m, x, y, z, -a, 0, Math.sin(t * 6 + b) * 0.25, 1, flap, 1); list.push({ mesh: bird, m }); } };
})(window.G);
