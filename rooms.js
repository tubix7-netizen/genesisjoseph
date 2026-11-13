/* 약속의 길 — 집 안이 더 다양해요 (v18.23)
   · 새 집 종류
       가게 — 주인과 「물건 사고팔기」 (빵·대추야자·석청·약초·세마포·아마 씨앗)
       세넷 놀이방 — 애굽 사람들이 즐기던 판 놀이 「세넷」을 집주인과 한 판 (내기는 없어요)
       글 배우는 집 — 서기 할아버지에게 하루에 글자 하나씩 (해·물·입·집·빵·눈·갈대)
       치료하는 집 — 꿀과 약초로 상처를 돌봐 줘요 (하루 한 번, 체력 가득)
   · 방 구조도 다섯 가지예요: 그냥 방 · 기둥방(파피루스 기둥 둘, 색 띠) · 흙벽돌 단이 있는 방 · 칸막이 뒤 잠자리 · 지붕으로 오르는 계단.
     벽 색과 띠 색도 집마다 달라요 (아마르나 집터처럼 흰 벽에 파랑·빨강 띠).
   · 집 종류는 사는 사람의 일을 따라요: 상인·장사꾼 → 가게, 토기장이 → 토기장이 집, 베 짜는 이 → 베 짜는 집,
     빵 굽는 이 → 빵 굽는 집, 노인 → 글 배우는 집, 할머니 → 치료하는 집. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ho = G.Homes; if (!EP || !Ho || !Ho.TYPE) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(sub ? t + ' · ' + sub : t);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const T = Ho.TYPE, WOOD = 0x7a5a3a, cur = () => S().flags.inHouse || null, host = h => h && h.ow ? h.ow.split(' ').pop() : '집주인';
const bat = w => { const c = (w || '').charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; }, wa = w => w + (bat(w) ? '과' : '와'), ga = w => w + (bat(w) ? '이' : '가');
const mind = n => { const H = S().hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + n); };

// ------------------------------------------------------------------ the new kinds of house
EP.shops = EP.shops || {};
EP.shops.hShop = { n: '가게', sells: ['crop', 'food', 'good', 'mat'], mul: { good: 1.15, crop: 1.05 }, buy: [{ n: '빵 ×3', item: 'bread', qty: 3, price: 12 }, { n: '대추야자 ×4', item: 'dates', qty: 4, price: 10 },
  { n: '석청', item: 'honey', qty: 1, price: 16, d: '꿀은 상처에도 좋아요' }, { n: '약초 ×2', item: 'herb', qty: 2, price: 10 }, { n: '세마포', item: 'linen', qty: 1, price: 44, d: '애굽의 고운 베' }, { n: '아마 씨앗 ×6', item: 's_flax', qty: 6, price: 10 }].filter(x => Game.ITEMS[x.item]) };
Object.assign(T, {
  shop: { n: '가게', model(g) { g.box(1.7, 0.8, 0.6, { at: [0.3, 0.4, 0.5], c: WOOD }); g.box(1.8, 0.06, 0.7, { at: [0.3, 0.83, 0.5], c: 0x8a6a48 });
      for (let i = 0; i < 3; i++) g.lathe([[0.04, 0], [0.11, 0.07], [0.12, 0.18], [0.06, 0.25]], 8, { at: [-0.3 + i * 0.3, 0.86, 0.45], c: [0xb5673a, 0xd8c49a, 0x8a5a3a][i] });
      g.cyl(0.24, 0.2, 0.14, 10, { at: [0.95, 0.93, 0.5], c: 0xc8a060 }); for (let i = 0; i < 6; i++) g.sph(0.06, 6, 4, { at: [0.85 + (i % 3) * 0.1, 1.02, 0.45 + Math.floor(i / 3) * 0.1], c: 0x8a3a1c });
      for (const y of [0.95, 1.6]) g.box(3.2, 0.06, 0.4, { at: [0.3, y, 2.85], c: WOOD }); for (let i = 0; i < 6; i++) g.lathe([[0.05, 0], [0.13, 0.1], [0.14, 0.24], [0.07, 0.32]], 8, { at: [-1.0 + i * 0.5, i % 2 ? 1.63 : 0.98, 2.85], c: [0xc0784a, 0xb5673a, 0xe8dcc0, 0x8a5a3a, 0xd8a43a, 0x6e9a3a][i] });
      for (let i = 0; i < 3; i++) g.cyl(0.07, 0.07, 0.6, 8, { at: [1.8, 0.5 + i * 0.16, 2.3], rz: Math.PI / 2, c: [0xece2c8, 0xd8c8a0, 0xa8482e][i] });
      for (let i = 0; i < 3; i++) g.sph(0.32, 8, 6, { at: [2.3 + (i % 2) * 0.55, 0.28, 1.2 + i * 0.5], s: [1, 0.9, 1], c: 0xb89a68 }); },
    act: { use: h => ({ label: '물건 사고팔기', noMagnet: true, use: () => { EP.shops.hShop.n = `${host(h)}네 가게`; G.UI.shop('hShop'); } }) } },
  senet: { n: '세넷 놀이방', model(g) { g.box(1.4, 0.32, 0.6, { at: [0.3, 0.16, 0.5], c: WOOD }); g.box(1.1, 0.06, 0.36, { at: [0.3, 0.35, 0.5], c: 0x6a4626 }); for (let i = 0; i < 30; i++) g.box(0.095, 0.012, 0.095, { at: [-0.2 + (i % 10) * 0.105, 0.385, 0.395 + Math.floor(i / 10) * 0.105], c: (i + Math.floor(i / 10)) % 2 ? 0xe8d8b0 : 0xc8a874, j: 0 });
      for (let i = 0; i < 5; i++) g.cyl(0.03, 0.035, 0.07, 6, { at: [-0.12 + i * 0.1, 0.42, 0.42], c: 0xf4ecd8 }); for (let i = 0; i < 5; i++) g.cyl(0.025, 0.035, 0.08, 6, { at: [0.3 + i * 0.1, 0.42, 0.6], c: 0x2a2018 });
      for (const x of [-0.75, 1.35]) g.box(0.5, 0.12, 0.5, { at: [x, 0.06, 0.5], c: 0xb8483a }); for (let i = 0; i < 4; i++) g.box(0.03, 0.01, 0.16, { at: [0.95 + i * 0.05, 0.4, 0.38], c: i % 2 ? 0xf4ecd8 : 0x5a3a22 });
      g.sph(0.4, 8, 6, { at: [2.4, 0.15, 2.1], s: [1, 0.5, 1], c: 0x5a4a3a }); g.lathe([[0.06, 0], [0.16, 0.14], [0.17, 0.3], [0.08, 0.42]], 9, { at: [2.0, 0, 2.5], c: 0xc0784a }); },
    act: { use: h => ({ label: `세넷 한 판 · ${wa(host(h))}`, noMagnet: true, use: () => Senet.open(h) }) } },
  school: { n: '글 배우는 집', model(g) { g.box(1.6, 0.38, 0.6, { at: [0.3, 0.19, 0.5], c: WOOD }); for (let i = 0; i < 3; i++) g.cyl(0.05, 0.05, 0.42, 7, { at: [-0.25 + i * 0.22, 0.43, 0.42], rx: Math.PI / 2, c: 0xe8dcb0 });
      g.box(0.36, 0.03, 0.08, { at: [0.75, 0.395, 0.55], c: 0x2a2018 }); g.box(0.04, 0.01, 0.04, { at: [0.67, 0.41, 0.55], c: 0x101010 }); g.box(0.04, 0.01, 0.04, { at: [0.74, 0.41, 0.55], c: 0xb3301e });
      g.box(1.7, 1.0, 0.06, { at: [0.3, 1.5, 2.98], c: 0xf0e6cc }); for (let i = 0; i < 12; i++) g.box(0.16, 0.16, 0.02, { at: [-0.4 + (i % 6) * 0.28, 1.72 - Math.floor(i / 6) * 0.4, 2.94], c: [0x2a3a6a, 0xb3301e, 0x2a2018][i % 3], j: 0 }); // a whitewashed board with painted signs
      for (const x of [-0.8, 1.4]) g.box(0.45, 0.1, 0.45, { at: [x, 0.05, 0.5], c: 0xc8a868 }); for (let i = 0; i < 4; i++) g.cyl(0.06, 0.06, 0.4, 7, { at: [2.2 + i * 0.16, 0.06, 2.4], rz: Math.PI / 2, ry: 0.3, c: 0xe0d4a8 }); },
    act: { use: (h, s) => glyphCtx(h, s) } },
  healer: { n: '치료하는 집', model(g) { g.box(1.5, 0.08, 0.85, { at: [0.3, 0.04, 0.5], c: 0xc8a868 }); g.box(0.5, 0.1, 0.3, { at: [0.3, 0.12, 0.82], c: 0xe8dcc0 });
      g.lathe([[0.1, 0], [0.16, 0.06], [0.18, 0.2], [0.14, 0.24]], 10, { at: [1.3, 0, 0.1], c: 0x8a7a68 }); g.cyl(0.025, 0.03, 0.28, 5, { at: [1.33, 0.3, 0.1], rz: 0.4, c: 0x6a5a48 });
      for (let i = 0; i < 3; i++) g.lathe([[0.05, 0], [0.1, 0.08], [0.1, 0.16], [0.05, 0.2]], 8, { at: [-0.7 + i * 0.22, 0, 0.0], c: 0xd8a43a });
      g.cyl(0.025, 0.025, 2.6, 5, { at: [0.3, 2.0, 2.85], rz: Math.PI / 2, c: WOOD }); for (let i = 0; i < 7; i++) { const x = -0.8 + i * 0.37; g.cyl(0.006, 0.006, 0.3, 3, { at: [x, 1.85, 2.85], c: 0x5a4a30 }); g.sph(0.09, 6, 4, { at: [x, 1.66, 2.85], s: [0.8, 1.4, 0.8], c: [0x6aa04a, 0x8ab04a, 0x4a8a3a][i % 3] }); }
      g.sph(0.4, 8, 6, { at: [2.4, 0.15, 2.1], s: [1, 0.5, 1], c: 0x5a4a3a }); },
    act: { use: (h, s) => healCtx(h, s) } },
});
// which house is which: the trade of the people who live there (a few houses are fixed so every village has a bit of everything)
T.keep = { n: '간수 숙소', model(g) { g.box(1.5, 0.72, 0.75, { at: [0.3, 0.36, 0.5], c: 0x6a4a30 }); g.box(0.5, 0.03, 0.36, { at: [0, 0.74, 0.5], c: 0xe8dcb8, j: 0 }); g.cyl(0.03, 0.03, 0.4, 6, { at: [0.75, 0.76, 0.55], rx: Math.PI / 2, c: 0xe8dcb8 }); for (let i = 0; i < 5; i++) g.cyl(0.035, 0.035, 0.07, 7, { at: [0.5 + i * 0.05, 0.74, 0.3], rx: Math.PI / 2, c: 0xc8a040, j: 0 }); const bx = 2.3, bz = 2.74; g.box(1.5, 0.05, 0.1, { at: [bx, 1.7, bz], c: WOOD }); g.box(1.5, 0.05, 0.1, { at: [bx, 0.5, bz], c: WOOD }); for (let i = 0; i < 4; i++) { g.cyl(0.018, 0.018, 1.9, 5, { at: [bx - 0.54 + i * 0.36, 1, bz - 0.03], c: 0x7a5a3a }); g.cyl(0.002, 0.04, 0.2, 5, { at: [bx - 0.54 + i * 0.36, 2.04, bz - 0.03], c: 0xb8b8c0, j: 0 }); } g.sph(0.22, 9, 6, { at: [0.3, 1.25, 2.74], s: [1, 1.25, 0.15], c: 0xb3472e, j: 0 }); g.box(0.06, 0.34, 0.04, { at: [0.3, 1.25, 2.68], c: 0xe5b552, j: 0 }); },
  act: { label: '옥 일지 정리 돕기', silver: 4, msg: '죄수 명단과 양식 장부를 맞춰 적었어요 · 수고비로 은 4를 받았어요' } };
const ROLE_T = { merchant: 'shop', trader: 'shop', potter: 'potter', weaver: 'loom', baker: 'bake', elder: 'school', scribe: 'school', oldwoman: 'healer' };
const FIX = { 'keeperH:0': 'keep', 'city:0': 'senet', 'west:1': 'healer', 'west:2': 'senet', 'west:5': 'kids', 'south:1': 'senet', 'south:5': 'shop', 'pyr:4': 'healer', 'pyr:2': 'senet' };
Ho.typeOf = (v, i, TYPES, r) => { const k = v.id + ':' + i, fs = (v.folk || []).filter(f => (f.home || 0) === i);
  if (FIX[k] && !(FIX[k] === 'healer' && fs.length && !fs.some(f => f.role === 'oldwoman' || f.role === 'elder'))) return FIX[k]; /* v18.42 a healer's house only where an old woman or an elder lives (the water carrier's house offered healing) */
  for (const f of fs) if (ROLE_T[f.role]) return ROLE_T[f.role]; const pool = ['family', 'kids', 'family', 'bake']; return pool[Math.floor(r * pool.length)]; };

// ------------------------------------------------------------------ room layouts
const LAY = {
  plain: { wall: 0xe6d6b4, band: 0x9a6a40, frieze: [0xb3472e, 0xe5b552, 0x3e7a6a], tile: [0xc8ae84, 0xb89a70] },
  pillar: { wall: 0xeee6d0, band: 0x2c5aa0, frieze: [0xc04a3a, 0x2c5aa0, 0xe5b552, 0x3a8a5a], cols: [[-1.4, -0.7], [1.7, -0.8]] }, // papyrus columns, painted bands
  bench: { wall: 0xe0c08c, band: 0xa8482e, frieze: [0x2c5aa0, 0xe8dcc0], tile: [0xc0a070, 0xa88a60], bench: [3.22, -0.1, 0.56, 2.0] }, // a low mud-brick bench along the right wall
  back: { wall: 0xece0c4, band: 0x4a7a4a, frieze: [0x4a7a4a, 0xe5b552, 0xb3472e], tile: [0xd0ba92, 0xbca67e], part: [-2.45, 0.55, 2.3, 0.22] }, // a half wall: the sleeping corner behind it
  stair: { wall: 0xdcc8a0, band: 0x7a4a2a, frieze: [0x7a4a2a, 0x3e7a6a], tile: [0xc4aa80, 0xb09672], stair: [-3.18, -1.65, 0.62, 2.1] }, // steps up to the roof along the left wall
};
const KEYS = Object.keys(LAY);
Ho.layoutOf = (v, i) => v.mine ? 'pillar' : KEYS[Math.floor(hash(Ho.houseKey(v, i) + 'lay') * KEYS.length)];
const RM = Ho.room;
function roomOf(L) { const r = RM(), RW = r.w, RD = r.d, WH = r.h, hw = RW / 2, hd = RD / 2, Lc = LAY[L] || LAY.plain, WALL = Lc.wall, BAND = Lc.band;
  return g => { g.box(RW + 0.6, 0.3, RD + 0.6, { at: [0, -0.15, 0], c: 0xb89a70 }); g.box(RW + 0.6, 4, RD + 0.6, { at: [0, -2.3, 0], c: 0xa88a60 });
    const fr = Lc.frieze; const wall = (x, z, w, d) => { g.box(w, WH, d, { at: [x, WH / 2, z], c: WALL }); g.box(w + 0.03, 0.34, d + 0.03, { at: [x, 0.17, z], c: BAND, j: 0 });
      if (fr) { const along = w > d, L = along ? w : d, n = Math.floor(L / 0.5); for (let k = 0; k < n; k++) { const o = -L / 2 + 0.25 + k * 0.5; g.box(along ? 0.46 : w + 0.03, 0.28, along ? d + 0.03 : 0.46, /* v18.24 (was d + 0.03 across: the side walls' frieze became 6.8 m slabs roofing the room) */ { at: [along ? x + o : x, WH - 0.36, along ? z : z + o], c: fr[k % fr.length], j: 0 }); } } };
    wall(0, hd + 0.15, RW + 0.6, 0.3); wall(-hw - 0.15, 0, 0.3, RD + 0.6); wall(hw + 0.15, 0, 0.3, RD + 0.6);
    wall(-(hw + 0.7) / 2 - 0.35, -hd - 0.15, hw - 0.7 + 0.3, 0.3); wall((hw + 0.7) / 2 + 0.35, -hd - 0.15, hw - 0.7 + 0.3, 0.3);
    g.box(1.6, 0.4, 0.34, { at: [0, WH - 0.2, -hd - 0.15], c: WALL });
    /* v18.37 a lived-in room: tiled floor, a window with daylight in it, a painted reed-and-lotus panel, a niche with a lamp, herbs drying on a peg, baskets by the wall */
    { const T2 = Lc.tile || [0xc8ae84, 0xb89a70], nx = 8, nz = 7, tw = RW / nx, td = RD / nz; for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) g.box(tw - 0.025, 0.02, td - 0.025, { at: [-hw + (i + 0.5) * tw, -0.004, -hd + (k + 0.5) * td], c: (i + k) % 2 ? T2[0] : T2[1], j: 0.02 });
      for (const x of [-1.6, 1.6]) { g.box(0.74, 0.42, 0.06, { at: [x, 2.05, hd - 0.02], c: 0x8a6a48, j: 0 }); g.box(0.62, 0.3, 0.07, { at: [x, 2.05, hd - 0.03], c: 0xcfe6f2, j: 0 }); for (const dx of [-0.16, 0, 0.16]) g.box(0.03, 0.32, 0.08, { at: [x + dx, 2.05, hd - 0.05], c: 0x6a4a30, j: 0 }); }
      if (L !== 'back') { const px = -hw + 0.03, pz = L === 'stair' ? 0.55 : 0.2; g.box(0.03, 0.95, 2.1, { at: [px, 1.55, pz], c: 0xf0e6cc, j: 0 }); g.box(0.035, 0.05, 2.14, { at: [px, 2.04, pz], c: Lc.band, j: 0 }); g.box(0.035, 0.05, 2.14, { at: [px, 1.07, pz], c: Lc.band, j: 0 }); g.box(0.04, 0.16, 2.08, { at: [px, 1.18, pz], c: 0x4a8ab0, j: 0 }); for (let i = 0; i < 9; i++) { const z = pz - 0.92 + i * 0.23, h = 0.34 + (i % 3) * 0.1; g.box(0.04, h, 0.025, { at: [px, 1.22 + h / 2, z], c: 0x3e8a5a, j: 0 }); g.sph(0.055, 6, 4, { at: [px + 0.01, 1.24 + h, z], s: [0.4, 1, 1], c: i % 2 ? 0xe88aa8 : 0xf0f0e0, j: 0 }); } g.sph(0.15, 10, 6, { at: [px + 0.01, 1.84, pz + 0.82], s: [0.2, 1, 1], c: 0xe5b552, j: 0 }); }
      { const nxz = hw - 0.02; g.box(0.05, 0.56, 0.6, { at: [nxz, 1.5, 1.1], c: 0x5a4632, j: 0 }); g.box(0.1, 0.05, 0.68, { at: [nxz - 0.03, 1.23, 1.1], c: 0xcdbb98, j: 0 }); g.cyl(0.08, 0.05, 0.05, 9, { at: [nxz - 0.08, 1.28, 1.1], c: 0xb5673a, j: 0 }); g.sph(0.03, 6, 5, { at: [nxz - 0.08, 1.34, 1.1], s: [0.7, 1.5, 0.7], c: 0xffc860, j: 0 }); }
      g.box(0.04, 0.04, 1.4, { at: [hw - 0.06, 2.2, -1], c: WOOD }); for (let i = 0; i < 5; i++) { const z = -1.5 + i * 0.25; g.cyl(0.05, 0.015, 0.34, 6, { at: [hw - 0.08, 2, z], c: [0x6a8a3a, 0xb0883a, 0x5a7a38][i % 3], j: 0.04 }); }
      for (const [x, z, c] of [[1.05, hd - 0.28, 0xb09058], [1.55, hd - 0.28, 0xa08048]]) { g.cyl(0.2, 0.15, 0.3, 11, { at: [x, 0.17, z], c, j: 0.03 }); g.cyl(0.2, 0.2, 0.02, 11, { at: [x, 0.33, z], c: 0x6a4a30 }); }
      g.box(RW + 0.7, 0.07, 0.42, { at: [0, WH + 0.03, hd + 0.15], c: 0xcdbb98, j: 0 }); g.box(0.42, 0.07, RD + 0.7, { at: [-hw - 0.15, WH + 0.03, 0], c: 0xcdbb98, j: 0 }); g.box(0.42, 0.07, RD + 0.7, { at: [hw + 0.15, WH + 0.03, 0], c: 0xcdbb98, j: 0 }); }
    { const rc = L === 'bench' ? 0x3a6a4a : 0x9a3a2e; g.box(2.6, 0.02, 1.8, { at: [0.3, 0.008, 0.4], c: rc, j: 0 }); for (let i = 0; i < 6; i++) g.box(0.13, 0.022, 1.8, { at: [-0.75 + i * 0.42, 0.009, 0.4], c: i % 2 ? 0x2c5aa0 : 0xe5c97a, j: 0 }); for (const z of [-0.45, 1.25]) g.box(2.6, 0.024, 0.09, { at: [0.3, 0.01, z], c: 0xe8dcc0, j: 0 }); }
    g.box(0.95, 0.08, 2.0, { at: [-2.5, 0.05, 1.9], c: 0xc8a868 }); g.box(0.6, 0.1, 0.3, { at: [-2.5, 0.12, 2.75], c: 0xe8dcc0 });
    g.lathe([[0.1, 0], [0.34, 0.2], [0.4, 0.6], [0.24, 0.95], [0.2, 1.05]], 12, { at: [2.9, 0, -2.0], c: 0xb5673a });
    g.box(2.2, 0.06, 0.4, { at: [0.6, 1.5, hd - 0.2], c: WOOD }); for (let i = 0; i < 4; i++) g.lathe([[0.05, 0], [0.13, 0.08], [0.14, 0.2], [0.08, 0.28]], 8, { at: [-0.2 + i * 0.55, 1.53, hd - 0.2], c: [0xb5673a, 0xc0784a, 0x8a5a3a, 0xd8c49a][i] });
    // the layout's own pieces
    if (Lc.cols) for (const [x, z] of Lc.cols) { g.cyl(0.26, 0.3, 0.12, 12, { at: [x, 0.06, z], c: 0xcdbb98 }); g.cyl(0.2, 0.22, WH - 0.6, 12, { at: [x, 0.12 + (WH - 0.6) / 2, z], c: 0xe8dcc0 }); for (const y of [0.6, 1.2, 1.8]) g.cyl(0.215, 0.215, 0.08, 12, { at: [x, y, z], c: 0x2c5aa0, j: 0 });
      g.lathe([[0.2, 0], [0.32, 0.18], [0.34, 0.32], [0.26, 0.44], [0.3, 0.48]], 12, { at: [x, WH - 0.48, z], c: 0x3a8a5a }); g.cyl(0.31, 0.31, 0.08, 12, { at: [x, WH - 0.04, z], c: 0xc04a3a, j: 0 }); }
    if (Lc.bench) { const [x, z, w, d] = Lc.bench; g.box(w, 0.44, d, { at: [x, 0.22, z], c: 0xc8a074 }); g.box(w * 0.8, 0.08, 0.5, { at: [x, 0.48, z - 0.4], c: 0xa8482e }); g.box(w * 0.8, 0.08, 0.5, { at: [x, 0.48, z + 0.5], c: 0x2c5aa0 }); }
    if (Lc.part) { const [x, z, w, d] = Lc.part; g.box(w, 1.9, d, { at: [x, 0.95, z], c: WALL }); g.box(w + 0.03, 0.3, d + 0.03, { at: [x, 0.15, z], c: BAND, j: 0 }); g.box(w + 0.1, 0.1, d + 0.1, { at: [x, 1.92, z], c: BAND }); }
    if (Lc.stair) { const [x, z, w, d] = Lc.stair, n = 7; for (let i = 0; i < n; i++) g.box(w, 0.36 * (i + 1), d / n, { at: [x, 0.18 * (i + 1), z - d / 2 + d / n * (i + 0.5)], c: i % 2 ? 0xd8c4a0 : 0xc8b08a }); }
  }; }
Ho.roomMesh = h => { const L = (h && h.L) || 'plain'; return Ho.mk('hRoom_' + L, roomOf(L)); };
// colliders for the layout pieces (switched on only while you are in a house with that layout)
const COLS = {}; let colOn = null;
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const r = RM(), X = r.x, Z = r.z, y0 = r.y - 1, y1 = r.y + r.h;
  for (const k of KEYS) COLS[k] = []; colOn = null;
  for (const [x, z] of LAY.pillar.cols) COLS.pillar.push(W.addCol({ x: X + x, z: Z + z, r: 0.26, y0, y1, on: false }));
  { const [x, z, w, d] = LAY.bench.bench; COLS.bench.push(W.addCol({ x: X + x, z: Z + z, w, d, y0, y1: r.y + 0.44, on: false })); }
  { const [x, z, w, d] = LAY.back.part; COLS.back.push(W.addCol({ x: X + x, z: Z + z, w, d, y0, y1: r.y + 1.9, on: false })); }
  { const [x, z, w, d] = LAY.stair.stair; COLS.stair.push(W.addCol({ x: X + x, z: Z + z, w, d, y0, y1: r.y + 2.4, on: false })); }
} catch (e) { console.error('rooms', e); } };
function syncCols() { const h = cur(), want = h ? h.L || 'plain' : null; if (want === colOn) return; colOn = want; for (const k in COLS) for (const c of COLS[k]) c.on = k === want; }

// ------------------------------------------------------------------ the healer
function healCtx(h, s) { const H = s.hero; if (!H) return null; const nm = host(h);
  if ((s.flags.healDay || -9) === s.day) return { label: '치료 받기 · 오늘은 받았어요', disabled: true };
  if (H.hp >= H.hpMax) return { label: '치료 받기 · 아픈 데가 없어요', disabled: true };
  return { label: `상처 치료 받기 · ${nm}`, anim: 'gather', dur: 0.9, hits: 1, fn: () => { s.flags.healDay = s.day; H.hp = H.hpMax; sfx('heart', { vol: 0.5 }); pop('다 나았어요!', '꿀과 약초를 발라 주었어요 · 체력 가득', 'heart'); G.UI.hud(); } }; }

// ------------------------------------------------------------------ the scribe school: one sign a day
const GLY = [
  { n: '해', s: '라', d: '해를 그린 글자예요', svg: '<circle cx="24" cy="24" r="13" fill="none" stroke="C" stroke-width="3"/><circle cx="24" cy="24" r="3" fill="C"/>' },
  { n: '물', s: '느', d: '잔물결 — 「ㄴ」 소리예요', svg: '<polyline points="5,26 9,21 13,26 17,21 21,26 25,21 29,26 33,21 37,26 41,21 43,24" fill="none" stroke="C" stroke-width="3" stroke-linejoin="round"/>' },
  { n: '입', s: '르', d: '입 모양 — 「ㄹ」 소리예요', svg: '<path d="M6 24 Q24 12 42 24 Q24 36 6 24 Z" fill="none" stroke="C" stroke-width="3"/>' },
  { n: '집', s: '페르', d: '위에서 본 집 — 「페르」라고 읽어요', svg: '<path d="M10 34 V12 H38 V34 H27 V28 H21 V34 Z" fill="none" stroke="C" stroke-width="3" stroke-linejoin="round"/>' },
  { n: '빵', s: '트', d: '둥근 빵 — 「ㅌ」 소리예요', svg: '<path d="M8 32 Q8 16 24 16 Q40 16 40 32 Z" fill="none" stroke="C" stroke-width="3"/>' },
  { n: '눈', s: '이르', d: '눈 — 「보다」라는 뜻도 있어요', svg: '<path d="M5 24 Q24 10 43 24 Q24 36 5 24 Z" fill="none" stroke="C" stroke-width="3"/><circle cx="24" cy="23.5" r="5" fill="C"/>' },
  { n: '갈대', s: '이', d: '갈대 잎 — 「이」 소리예요', svg: '<path d="M24 42 C20 30 18 18 26 6 C30 18 28 30 24 42 Z" fill="none" stroke="C" stroke-width="3"/><line x1="24" y1="40" x2="25" y2="12" stroke="C" stroke-width="1.5"/>' },
];
const gsvg = (g, col, sz) => `<svg viewBox="0 0 48 48" width="${sz}" height="${sz}">${g.svg.replace(/"C"/g, '"' + col + '"')}</svg>`;
function glyphCtx(h, s) { const got = s.flags.glyphs || (s.flags.glyphs = []), nm = host(h);
  if (got.length >= GLY.length) return { label: '글자 복습하기', use: () => glyCard(null, nm) };
  if (s.flags.glyDay === s.day) return { label: '글공부 · 내일 또 와요', disabled: true };
  return { label: `글자 배우기 · ${nm}`, anim: 'gather', dur: 0.8, hits: 1, fn: () => { const g = GLY[got.length]; got.push(got.length); s.flags.glyDay = s.day; mind(10); sfx('insight', { vol: 0.45 }); glyCard(g, nm); } }; }
const css = document.createElement('style'); css.textContent = `
#glyC,#senetC{position:fixed;inset:0;z-index:246;display:flex;align-items:center;justify-content:center;background:rgba(6,8,16,.5);animation:popFade .25s both}
#glyC .gc{width:min(84vw,330px);padding:18px 18px 14px;border-radius:20px;text-align:center;color:#3a2810;background:linear-gradient(170deg,#f6ecd0,#e4d2a4);border:2px solid #c8902a;box-shadow:0 0 30px rgba(255,210,110,.5);animation:popIn .4s cubic-bezier(.2,1.5,.4,1) both}
#glyC small{display:block;font-size:11px;font-weight:800;letter-spacing:.1em;color:#8a5a1a}#glyC .big{margin:8px auto 4px}#glyC b{display:block;font-size:20px}#glyC p{margin:4px 0 0;font-size:13.5px;opacity:.85}
#glyC .gr{display:flex;justify-content:center;gap:6px;margin-top:12px;flex-wrap:wrap}#glyC .gr i{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:rgba(138,90,26,.12)}#glyC .gr i.no{opacity:.25}#glyC .ok{margin-top:10px;font-size:12px;opacity:.55}
#senetC .sc{width:min(92vw,380px);padding:14px 14px 12px;border-radius:20px;color:#f6ecd8;background:linear-gradient(165deg,#3a2a18,#1c1610);border:2px solid #d8a040;box-shadow:0 0 30px rgba(255,200,90,.35);animation:popIn .4s cubic-bezier(.2,1.5,.4,1) both;text-align:center}
#senetC b{font-size:18px}#senetC small{display:block;font-size:12px;opacity:.75;margin:2px 0 10px}
#senetC .bd{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;padding:6px;border-radius:10px;background:#6a4626}
#senetC .bd div{position:relative;aspect-ratio:1;border-radius:4px;background:#e8d4a6;display:grid;place-items:center;font-size:11px;color:#8a5a1a;font-weight:800}
#senetC .bd div.alt{background:#d8bf8a}#senetC .bd div.sp{background:#f0dca0}
#senetC .pc{position:absolute;width:62%;height:62%;border-radius:50% 50% 40% 40%;box-shadow:0 2px 3px rgba(0,0,0,.4);transition:transform .2s}
#senetC .pc.me{background:radial-gradient(circle at 35% 30%,#fff,#d8d0c0)}#senetC .pc.op{background:radial-gradient(circle at 35% 30%,#6a5a4a,#1a1410)}#senetC .pc.both{transform:translate(-18%,-18%)}#senetC .pc.both.op{transform:translate(18%,18%)}
#senetC .st{display:flex;justify-content:center;gap:7px;margin:12px 0 6px;height:44px}#senetC .st i{width:9px;height:44px;border-radius:5px;background:#3a2414;border:1px solid #c8a060;transition:background .15s}#senetC .st i.w{background:#f6ecd8}
#senetC .msg{min-height:20px;font-size:14px;font-weight:700;color:#ffe2a0}
#senetC .bt{display:flex;gap:8px;justify-content:center;margin-top:10px}#senetC button{font:inherit;border:0;border-radius:14px;padding:11px 18px;font-weight:800;font-size:15px}
#senetC .go{background:linear-gradient(180deg,#ffd878,#d89a30);color:#3a2408;box-shadow:0 0 14px rgba(255,200,90,.5)}#senetC .go:disabled{opacity:.45}#senetC .x{background:rgba(255,255,255,.12);color:#f6ecd8;font-size:13px}`;
document.head.appendChild(css);
function glyCard(g, nm) { const got = S().flags.glyphs || [], el = document.createElement('div'); el.id = 'glyC';
  el.innerHTML = `<div class="gc"><small>${g ? '오늘 배운 글자' : '배운 글자'}</small>${g ? `<div class="big">${gsvg(g, '#6a3a10', 92)}</div><b>${g.n} 「${g.s}」</b><p>${g.d}</p><p style="font-size:12px;opacity:.6">${nm}: 「잘했어요! 내일 또 와요.」 · 정신력 +10</p>` : `<b>${GLY.length}글자를 다 배웠어요!</b><p>이제 곳간 장부를 조금 읽을 수 있어요</p>`}
    <div class="gr">${GLY.map((q, i) => `<i class="${got.includes(i) ? '' : 'no'}">${gsvg(q, '#6a3a10', 26)}</i>`).join('')}</div><div class="ok">눌러서 닫기</div></div>`;
  const close = () => { el.remove(); G.UI.setBusy('glyph', false); }; el.addEventListener('pointerdown', e => { e.preventDefault(); close(); }); document.body.appendChild(el); G.UI.setBusy('glyph', true); setTimeout(() => el.isConnected && close(), 9000); }

// ------------------------------------------------------------------ senet: a race along 30 squares, thrown with four sticks
/* Rules kept short: four sticks, count the light sides (none = 5). 1, 4 or 5 → throw again. Landing on the other piece swaps you
   (except on the ☥ square, 15, which is safe). ★ 26 → throw again; ≈ 27 (the water) → back to 15. First past 30 wins. No stakes. */
const Senet = Ho.Senet = {};
Senet.open = function (h) { if (G.UI.busy()) return; const nm = host(h), s = S();
  const st = { me: 0, op: 0, turn: 'me', lock: false, over: false }; const el = document.createElement('div'); el.id = 'senetC';
  const cell = c => { const r = Math.floor((c - 1) / 10), k = (c - 1) % 10; return [r + 1, r % 2 ? 10 - k : k + 1]; };
  let cells = ''; for (let c = 1; c <= 30; c++) { const [r, col] = cell(c); cells += `<div data-c="${c}" class="${c === 15 || c === 26 || c === 27 ? 'sp' : (c % 2 ? '' : 'alt')}" style="grid-row:${r};grid-column:${col}">${c === 15 ? '☥' : c === 26 ? '★' : c === 27 ? '≈' : ''}</div>`; }
  el.innerHTML = `<div class="sc"><b>세넷 · ${wa(nm)} 한 판</b><small>먼저 30칸을 지나면 이겨요 · 1·4·5가 나오면 한 번 더</small><div class="bd">${cells}</div><div class="st">${'<i></i>'.repeat(4)}</div><div class="msg">막대를 던져요!</div>
    <div class="bt"><button class="go">막대 던지기</button><button class="x">그만하기</button></div></div>`;
  document.body.appendChild(el); G.UI.setBusy('senet', true); sfx('blip', { vol: 0.5, pitch: 1.2 });
  const $ = q => el.querySelector(q), go = $('.go'), msg = t => { $('.msg').textContent = t; };
  function draw() { el.querySelectorAll('.pc').forEach(e => e.remove()); const both = st.me && st.me === st.op;
    for (const [w, c] of [['me', st.me], ['op', st.op]]) { if (c < 1 || c > 30) continue; const d = el.querySelector(`[data-c="${c}"]`), p = document.createElement('i'); p.className = 'pc ' + w + (both ? ' both' : ''); d.appendChild(p); } }
  function sticks() { const w = [0, 0, 0, 0].map(() => Math.random() < 0.5); el.querySelectorAll('.st i').forEach((e, i) => e.className = w[i] ? 'w' : ''); const n = w.filter(Boolean).length; return n || 5; }
  function step(who) { const n = sticks(), oth = who === 'me' ? 'op' : 'me', from = st[who]; let to = from + n, note = '';
    sfx('thud', { vol: 0.45, pitch: 1.6 + Math.random() * 0.3 });
    if (to > 30) { st[who] = 31; draw(); return end(who); }
    if (to === st[oth] && to !== 15) { st[oth] = from; note = who === 'me' ? ` · ${nm}의 말과 자리를 바꿨어요!` : ' · 내 말이 뒤로 밀렸어요!'; }
    st[who] = to; let again = n === 1 || n === 4 || n === 5;
    if (to === 27) { st[who] = to === st[oth] ? 14 : 15; note += ' · 물에 빠져 15칸으로!'; again = false; } else if (to === 26) { again = true; note += ' · ★ 한 번 더!'; }
    draw(); msg(`${who === 'me' ? '나' : nm} ${n}칸${note}${again && !note.includes('한 번 더') ? ' · 한 번 더!' : ''}`); return again; }
  function opTurn() { if (st.over) return; go.disabled = true; setTimeout(() => { if (st.over || !el.isConnected) return; const again = step('op'); if (st.over) return; if (again) opTurn(); else setTimeout(() => { if (st.over) return; st.turn = 'me'; go.disabled = false; msg($('.msg').textContent + ' · 내 차례'); }, 650); }, 850); }
  go.addEventListener('click', () => { if (st.turn !== 'me' || go.disabled || st.over) return; const again = step('me'); if (st.over) return; if (!again) { st.turn = 'op'; opTurn(); } });
  function end(who) { st.over = true; go.disabled = true; const first = s.flags.senetDay !== s.day; s.flags.senetDay = s.day; s.flags.senetW = (s.flags.senetW || 0) + (who === 'me' ? 1 : 0);
    if (first) mind(who === 'me' ? 15 : 8); msg(who === 'me' ? '내가 이겼어요!' : `${ga(nm)} 이겼어요!`);
    setTimeout(() => { close(); if (who === 'me') pop('세넷 승리!', `${nm}: 「한 판 더 해요!」${first ? ' · 정신력 +15' : ''}`, 'star'); else pop('아깝다!', `${nm}: 「재미있었어요!」${first ? ' · 정신력 +8' : ''}`, 'heart'); }, 1100); }
  function close() { st.over = true; el.remove(); G.UI.setBusy('senet', false); }
  $('.x').addEventListener('click', close); draw(); };

const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; try { if (Game.mode === 'play') syncCols(); } catch (e) { } return r; };
})(window.G);
