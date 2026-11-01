/* 약속의 길 — 요셉 편의 들판 생활 (v11): the RDR2/BotW life layer laid over the story.
   When it switches on
   · 배고픔 (hunger) from the road north (p_road) — Jacob's bread and figs won't last three days; forage and hunt.
     It pauses while the story feeds or holds Joseph: in the pit, bound behind the camels, in prison, in the dream.
   · 사냥 (hunting) from the road too: Joseph is a shepherd boy with a sling (David's weapon). Hares, partridges and
     gazelles in the hills of Canaan, wolves at night. Taken from him at the pit; Pharaoh's vizier hunts again (c5).
   · 낚시 (fishing) on the Nile once Joseph is free to travel as vizier (c5_patrol).
   Where
   · Wild zones and foraging spots follow the land: hill herbs, caper bushes, rock-cleft honey and partridge nests in
     Canaan; date palms, herbs and nests on the Nile banks; game on the desert edges of Egypt. Roads and towns stay clear. */
'use strict';
(function (G) {
const EP = G.EP && G.EP.joseph; if (!EP) return;
const Game = G.Game, between = (S, a, b) => { const o = Game.stepOrder(), i = o.indexOf(S.step); return i >= o.indexOf(a) && (b ? i <= o.indexOf(b) : true); };
Game.TOOLS.fishrod = '낚싯대'; if (Game.TOOL_PROP) Game.TOOL_PROP.fishrod = Game.TOOL_PROP.fishrod || 'fishrod';

// ------------------------------------------------------------------ features
// v12: no hunger gauge — stamina (the lightning core) is the one thing that tires; food refills health and stamina
EP.featAt = Object.assign({}, EP.featAt, { hunt: 'p_road', build: 'p_road', fish: 'c5_patrol' });
const prevLoad = EP.onLoad; EP.onLoad = function (S, G2) { if (S.feat) { delete S.feat.surv; delete S.feat.warm; } if (prevLoad) prevLoad(S, G2); };
// camp-making on the road (RDR2): campfires, a lean-to, a booth — out in the open, not in towns, not while he is held
EP.canBuild = (x, z, S) => between(S, 'c1_pit', 'c4_answer') ? '지금은 지을 수 없어요' : settled(x, z) ? '마을과 집터 가까이에는 지을 수 없어요' : Math.hypot(x - 168, z + 140) < 10 ? '여기에는 지을 수 없어요' : null;
EP.featText = Object.assign({}, EP.featText, {
  surv: { n: '배고픔과 기력', ic: 'bread', d: '걷고 일하면 배가 고파져요. 배가 고프면 기력(머리 위 동그라미)이 끝까지 차오르지 않아요. 왼쪽 위 빵 표시를 누르거나 가방에서 먹으세요. 들에서 약초·열매·새알을 찾고, 모닥불에서 요리할 수 있어요.' },
  build: { n: '들판의 쉼터', ic: 'fire', d: '메뉴 → 짓기에서 모닥불과 움막을 길가 들판에 지을 수 있어요. 크기와 색을 고를 수 있고, 지은 모닥불에서 요리하고 몸을 녹여요.' },
  hunt: { n: '물매와 사냥', ic: 'star', d: '목자의 물매를 챙겼어요. 짐승은 발소리를 듣고 눈으로 봐요 · 「앉기」를 누르고 살금살금 다가가면 들키지 않아요. 돌무더기에서 돌을 주워 물매로 쏘고, 잡은 짐승은 손질해 모닥불에서 구워요. 밤에는 늑대를 조심하세요.' },
  fish: { n: '나일 강 낚시', ic: 'fish', d: '낚싯대를 얻었어요. 물가에서 A로 던지고, 톡톡 건드릴 땐 기다렸다가 찌가 쑥 들어가면 A! 물고기가 도는 반대쪽으로 스틱을 밀면서 A를 누르고 감아요.' },
});
const prevFeat = EP.onFeat;
EP.onFeat = function (k, S, G2, quiet) {
  if (prevFeat) prevFeat(k, S, G2, quiet);
  if (k === 'hunt' && G.Combat) { G.Combat.giveGear('sling', true); S.hero.mode = 'ranged'; if (!S.inv.stone) Game.give('stone', 6, true); }
  if (k === 'fish') { S.tools.fishrod = true; if (G.Combat) { G.Combat.giveGear('sling', true); S.hero.mode = 'ranged'; } G.UI.hud(); }
};
// the brothers strip him at the pit: the sling goes with the coat, until he is free again as vizier
const prevUpdate = EP.update;
EP.update = function (dt, S, G2, t) {
  if (prevUpdate) prevUpdate(dt, S, G2, t);
  const H = S.hero; if (!H || !G.Combat) return; const free = !between(S, 'c1_pit', 'c4_answer');
  if (!free && H.ranged) { S.q.slingAway = H.ranged; H.ranged = null; H.mode = 'melee'; G.UI.hud(); }
  if (free && !H.ranged && S.q.slingAway && between(S, 'c5_patrol')) { H.ranged = S.q.slingAway; H.mode = 'ranged'; S.q.slingAway = null; G.UI.hud(); }
};
// hunger pauses while the story feeds or holds him
EP.calmSurv = function (S) { return !!(S.q.inPit || S.q.bound || S.q.chain || S.q.cellLock || S.q.vision || S.step === 'c1_caravan' || between(S, 'c3_cell', 'c4_answer')); };
EP.hungerMul = 0.65;

// ------------------------------------------------------------------ wildlife
const roadD = EP.roadD, settled = EP.settled, wd = EP.waterDist;
EP.wildOk = (x, z) => roadD(x, z) > 7 && !settled(x, z) && Math.hypot(x - 168, z + 140) > 14;
const canaan = S => between(S, 'p_road', 'p_approach'), egypt = S => between(S, 'c5_patrol');
EP.wildZones = [
  { id: 'cHeb', x: 205, z: 108, r: 34, max: 5, nightMax: 3, on: canaan, sp: [['hare', 5], ['partridge', 4], ['gazelle', 2], ['wolf', 2, 'night']] },
  { id: 'cMid', x: 158, z: 62, r: 32, max: 5, nightMax: 3, on: canaan, sp: [['hare', 4], ['partridge', 3], ['gazelle', 3], ['wolf', 2, 'night']] },
  { id: 'cShe', x: 214, z: 6, r: 32, max: 5, nightMax: 3, on: canaan, sp: [['hare', 4], ['partridge', 4], ['gazelle', 3], ['boar', 1], ['wolf', 2, 'night']] },
  { id: 'cDot', x: 200, z: -96, r: 34, max: 5, nightMax: 3, on: canaan, sp: [['hare', 4], ['gazelle', 3], ['ibex', 2], ['partridge', 3], ['wolf', 2, 'night']] },
  { id: 'eEast', x: 48, z: -40, r: 30, max: 4, nightMax: 2, on: egypt, sp: [['hare', 4], ['gazelle', 3], ['partridge', 2], ['wolf', 1, 'night']] },
  { id: 'eNorth', x: 40, z: 40, r: 26, max: 4, nightMax: 2, on: egypt, sp: [['hare', 3], ['gazelle', 3], ['ibex', 1]] },
  { id: 'eWest', x: -168, z: 20, r: 26, max: 4, nightMax: 2, on: egypt, sp: [['hare', 3], ['gazelle', 2], ['ibex', 2], ['wolf', 1, 'night']] },
];
// ------------------------------------------------------------------ fish
EP.fishAt = (x, z) => wd(x, z) < 30 ? [['tilapia', 6], ['mullet', 3], ['catfish', 2], ['barbel', 2], ['perch', 1]] : [['tilapia', 5], ['carp', 2]];

// ------------------------------------------------------------------ foraging: scattered once the world is built
const prevBuild = EP.build;
EP.build = function (W, G2) {
  prevBuild(W, G2); if (!G.Wilds) return;
  const okC = (x, z) => roadD(x, z) > 3.5 && !settled(x, z) && Math.hypot(x - 168, z + 140) > 10;
  const okN = (x, z) => { const d = wd(x, z); return d > 2 && d < 22 && roadD(x, z) > 3 && !settled(x, z); };
  const C = [['herb', 5], ['caper', 3], ['nest', 2], ['honey', 1], ['rock', 3], ['carob', 1], ['fig', 1]];
  const zones = [
    { x: 196, z: 132, r: 26, n: 12, types: C, ok: okC }, { x: 166, z: 96, r: 26, n: 12, types: C, ok: okC }, { x: 200, z: 58, r: 24, n: 10, types: C, ok: okC },
    { x: 172, z: 14, r: 24, n: 11, types: C, ok: okC }, { x: 208, z: -40, r: 26, n: 12, types: C, ok: okC }, { x: 182, z: -78, r: 26, n: 12, types: C, ok: okC }, { x: 186, z: -122, r: 22, n: 9, types: C, ok: okC } ];
  const N = [['date', 3], ['herb', 3], ['nest', 2], ['reeds', 2]];
  for (let z = -150; z <= 150; z += 50) for (const s of [1, -1]) { const x = -92 + 13 * Math.sin(z / 74) + 5 * Math.sin(z / 23 + 1) + s * 14; zones.push({ x, z, r: 12, n: 5, types: N, ok: okN }); }
  zones.push({ x: 48, z: -40, r: 22, n: 6, types: [['rock', 3], ['herb', 2], ['caper', 2]], ok: (x, z) => roadD(x, z) > 3 }, { x: -166, z: 18, r: 18, n: 6, types: [['rock', 3], ['caper', 2], ['honey', 1]], ok: (x, z) => roadD(x, z) > 3 });
  G.Wilds.scatter(W, zones, 3711);
  // v12 landscape: the wilderness between Canaan and Egypt gets shrubs, outcrops and lone acacias; the hill country gets real groves
  { const rr = G.rng(9071), okD = (x, z) => roadD(x, z) > 4 && !settled(x, z) && Math.hypot(x - 168, z + 140) > 16 && (!W.water || W.heightAt(x, z) > W.water.level + 0.5) && W.slopeAt(x, z) < 0.5;
    for (let i = 0, n = 0; i < 1400 && n < 360; i++) { const x = -60 + rr() * 300, z = -200 + rr() * 400; if (!okD(x, z)) continue; const ar = EP.aridAt ? EP.aridAt(x, z) : 0.5; if (ar < 0.45 || rr() > ar) continue;
      const k = rr(); if (k < 0.62) W.place('desertShrub', x, z, { ry: rr() * 6, s: 0.8 + rr() * 0.6, detail: true }); else if (k < 0.86) W.place('rockField', x, z, { ry: rr() * 6, s: 0.6 + rr() * 0.8, col: { r: 1.1, h: 1 } }); else W.place('acacia', x, z, { ry: rr() * 6, s: 0.8 + rr() * 0.3, col: { r: 0.35, h: 3 } }); n++; }
    for (const [cx, cz, R0, N0] of [[150, 128, 26, 26], [205, 128, 22, 20], [150, 30, 24, 22], [214, -60, 24, 22], [150, -96, 20, 16], [210, 70, 20, 16]]) for (let i = 0, n = 0; i < N0 * 6 && n < N0; i++) {
      const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * R0, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (!okD(x, z) || W.cols.some(c => c.t === 'c' && Math.hypot(c.x - x, c.z - z) < 4)) continue;
      W.place(rr() < 0.55 ? 'oak' : rr() < 0.6 ? 'olive' : 'fig', x, z, { ry: rr() * 6, s: 0.85 + rr() * 0.35, col: { r: 0.45, h: 4 } }); n++; } }
  // ladders: up to the flat roof of Potiphar's hall, and onto a few flat-roofed houses in the city and the villages
  const ladder = (x, z, a, top) => { const y0 = W.heightAt(x, z), h = top - y0; if (h < 1.5 || h > 8) return;
    W.place((g, M) => { for (const s of [1, -1]) g.box(0.07, h + 0.5, 0.07, { m: M, at: [s * 0.26, (h + 0.5) / 2, 0], rx: -0.08, c: 0x7a5a3a }); for (let i = 1; i < h / 0.34; i++) g.box(0.5, 0.05, 0.05, { m: M, at: [0, i * 0.34, ((h + 0.5) / 2 - i * 0.34) * 0.08], c: 0x8a6a48 }); }, x, z, { ry: a });
    W.addLadder({ x, z, a, y0, h }); };
  const hall = (W.roofs || []).find(r => r.k === 'portico' && Math.abs(r.x + 28) < 1 && Math.abs(r.z - 41.5) < 1);
  if (hall) ladder(-41.75, 43.2, -Math.PI / 2, hall.y + 0.28);
  const pads = [[-22, -74, 30], [-140, -40, 22], [-145, 128, 22], [-28, 53, 31]]; let n = 0;
  for (const c of W.cols) { if (c.t !== 'b' || !c.cam || c.y1 - c.y0 < 2.6 || c.y1 - c.y0 > 5 || c.w * c.d < 20 || c.w * c.d > 70 || Math.min(c.w, c.d) < 3) continue;
    if (!pads.some(([x, z, r]) => Math.hypot(c.x - x, c.z - z) < r + 6)) continue; if (n++ % 3) continue;
    const [lx, lz] = [-c.hw + 0.7, c.hd + 0.12], x = c.x + lx * c.ca + lz * c.sa, z = c.z - lx * c.sa + lz * c.ca; ladder(x, z, Math.atan2(c.sa, c.ca), c.y1); }
};
// free climbing only while Joseph is free (the prologue road, and as vizier); ladders always work
EP.noClimb = (x, z, S) => !(between(S, 'p_wake', 'p_approach') || between(S, 'c5_patrol'));
})(window.G);

// ------------------------------------------------------------------ granaries: designed, then raised by hand (창 41:48)
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return; const PI = Math.PI;
  const FIN = { white: 0xefe5cf, mud: 0xb48a5c, ochre: 0xd8a868 }, BAND = { none: 0, blue: 0x2f6a9a, red: 0xb3472e, green: 0x2f8a77 };
  function granary(g, M, r, o, k) { // k: 0 … 1 how far the work has gone
    const wc = FIN[o.finish] || FIN.white, bc = BAND[o.band] || 0, h = k >= 0.75 ? 1 : k <= 0 ? 0.08 : 0.15 + k * 1.05, done = k >= 1;
    g.box(10, 0.8, 6, { m: M, at: [0, 0.4, 0], c: o.finish === 'mud' ? 0x9a7650 : 0xb48a5c, j: 0.04 });
    if (o.shape === 'hall') {
      const H = 3.4 * h; if (H > 0.1) g.box(9.4, H, 5.4, { m: M, at: [0, 0.8 + H / 2, 0], c: wc, j: 0.025 });
      if (done) { g.box(9.9, 0.3, 5.9, { m: M, at: [0, 4.35, 0], c: G.shade ? G.shade(wc, -0.12) : wc }); g.box(1.4, 2, 0.12, { m: M, at: [0, 1.8, 2.72], c: 0x3a2618 });
        for (let i = -3; i <= 3; i += 2) g.box(0.5, 0.4, 0.1, { m: M, at: [i * 1.2, 3.6, 2.72], c: 0x3a2618 }); if (bc) g.box(9.45, 0.28, 5.45, { m: M, at: [0, 3.1, 0], c: bc }); }
    } else {
      const xs = o.shape === 'dome4' ? [-3.6, -1.2, 1.2, 3.6] : [-3.2, 0, 3.2], R0 = o.shape === 'dome4' ? 1.12 : 1.45, H = 3.6 * h;
      for (const ox of xs) { if (H > 0.1) g.cyl(R0, R0 + 0.15, H, 14, { m: M, at: [ox, 0.8 + H / 2, -0.4], c: wc, j: 0.02 });
        if (done) { g.sph(R0, 14, 7, { m: M, at: [ox, 4.4, -0.4], tl: PI / 2, s: [1, 0.9, 1], c: G.shade ? G.shade(wc, -0.05) : wc }); g.box(0.55, 0.55, 0.1, { m: M, at: [ox, 4.5, R0 - 0.45], c: 0x3a2618 });
          if (bc) g.cyl(R0 + 0.03, R0 + 0.03, 0.26, 14, { m: M, at: [ox, 3.2, -0.4], c: bc }); } }
      if (done) g.box(1.3, 1.7, 0.12, { m: M, at: [0, 1.65, 1.0], c: 0x3a2618 });
    }
    if (!done) { // scaffold, a ramp of bricks and a basket while the work goes on
      for (const [x, z] of [[-4.8, -2.8], [4.8, -2.8], [-4.8, 2.8], [4.8, 2.8]]) g.cyl(0.07, 0.08, 4.2, 5, { m: M, at: [x, 2.1, z], c: 0x8a6a48 });
      g.box(9.6, 0.05, 0.25, { m: M, at: [0, 0.8 + Math.max(0.6, 3.6 * h - 0.2), 2.9], c: 0xc8a878 });
      for (let i = 0; i < 6; i++) g.box(0.36, 0.14, 0.2, { m: M, at: [5.4 + (i % 2) * 0.2, 0.08 + Math.floor(i / 2) * 0.15, 2.4 + (i % 3) * 0.25], c: 0xb07a4a });
      g.lathe([[0.2, 0], [0.3, 0.12], [0.32, 0.3]], 8, { m: M, at: [-5.5, 0, 2.6], c: 0xc8a060 }); }
  }
  for (const s of EP.sites || []) { if (!/^gran/.test(s.id)) continue;
    s.work = 4; s.stages = ['터 다지기', '벽돌 쌓기', '곡식 칸 세우기', '지붕 덮기'];
    s.optNames = { shape: '모양', finish: '벽 마감', band: '장식 띠' };
    s.opts = { shape: [['dome', '둥근 곡식 창고 셋'], ['dome4', '작은 곡식 창고 넷', 0, { brick: 4 }], ['hall', '긴 평지붕 곳간', 0, { wood: 2 }]],
      finish: [['white', '석회 회칠', FIN.white], ['mud', '흙벽돌 그대로', FIN.mud], ['ochre', '황토 칠', FIN.ochre]],
      band: [['none', '없음'], ['blue', '청색 띠', BAND.blue, { clay: 1 }], ['red', '붉은 띠', BAND.red, { clay: 1 }], ['green', '청록 띠', BAND.green, { clay: 1 }]] };
    s.modelOpt = granary; }
})(window.G);

// ------------------------------------------------------------------ v12 loose things for the physics engine (jars, baskets, melons, stones)
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return;
  EP.physProps = function (W) { const out = [], r = G.rng(5150); const ring = (cx, cz, n, rad, kinds) => { for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = rad * (0.4 + r() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (W.near(x, z).some(c => c.on && (c.t === 'c' ? Math.hypot(c.x - x, c.z - z) < c.r + 0.5 : false))) continue; out.push([kinds[i % kinds.length], x, z]); } };
    ring(172, 150, 8, 6, ['jar', 'basket', 'pot', 'jar']);           // Jacob's camp at Hebron
    ring(156, -146, 6, 5, ['sack', 'jar', 'basket']);               // the brothers' camp at Dothan
    ring(-6, 118, 10, 7, ['melon', 'basket', 'jar', 'melon', 'sack']); // the market where Joseph is sold
    ring(-12, 46, 6, 3, ['jar', 'pot', 'basket']);                  // Potiphar's kitchen
    ring(-22, -70, 10, 9, ['basket', 'melon', 'jar', 'sack']);      // the city
    ring(16, -58, 6, 5, ['sack', 'sack', 'jar']);                   // by the granary
    for (const [cx, cz] of [[196, 4], [204, -70], [190, 96], [160, 60]]) ring(cx, cz, 7, 10, ['stone', 'stone', 'stone', 'boulder']); // loose stones on the hills
    return out; };
})(window.G);

// ------------------------------------------------------------------ v16 off the story path: treasure chests, jars & boxes to smash, places to find
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return; const PI = Math.PI;
  const nileX = z => -92 + 13 * Math.sin(z / 74) + 5 * Math.sin(z / 23 + 1);
  EP.lootTables = {
    canaan: [['fig', 1, 3, 3], ['olive', 1, 3, 3], ['wool', 1, 2, 2], ['bread', 1, 2, 2], ['cheese', 1, 1, 1], ['herb', 1, 2, 2], ['carob', 1, 2, 2], ['milk', 1, 1, 1], ['branch', 1, 3, 1], ['stone', 2, 3, 1]],
    desert: [['dates', 1, 3, 4], ['carob', 1, 2, 2], ['hide', 1, 1, 2], ['sinew', 1, 1, 1], ['thread', 1, 2, 2], ['arrow', 2, 4, 1], ['bread', 1, 1, 1]],
    egypt: [['wheat', 1, 3, 3], ['barley', 1, 3, 3], ['onion', 1, 2, 3], ['cucumber', 1, 2, 2], ['lentil', 1, 3, 3], ['flax', 1, 2, 2], ['clay', 1, 2, 1], ['bread', 1, 1, 1], ['honey', 1, 1, 1], ['dates', 1, 2, 1]],
    nile: [['carp', 1, 2, 3], ['reed', 2, 3, 3], ['clay', 1, 2, 2], ['flax', 1, 2, 2], ['onion', 1, 1, 1], ['egg', 1, 2, 1]],
    treasure: [['linen', 1, 2, 3], ['honey', 1, 2, 3], ['cheese', 1, 2, 2], ['thread', 2, 3, 2], ['wool', 2, 3, 2], ['dates', 2, 4, 2], ['lentil', 2, 4, 1], ['feather', 1, 3, 1], ['arrow', 4, 8, 1], ['hide', 1, 2, 1]] };
  EP.lootTable = (x, z) => Math.abs(x - nileX(z)) < 26 ? 'nile' : x > 110 ? 'canaan' : x > 28 ? 'desert' : 'egypt';
  // out-of-the-way places, each with a treasure chest
  const SITES = [
    { id: 'tower', hide: [-3.6, -3.2], n: '북쪽 언덕의 옛 망대', x: 126, z: -98, d: '무너진 망대 돌담 너머로 도단 평원이 한눈에 보여요.', insight: 1, props: 'ruin' },
    { id: 'cairn', hide: [2.6, -2.8], n: '남쪽 봉우리 돌무더기', x: 123, z: 97, d: '목자들이 길을 잃지 않으려고 쌓은 돌무더기예요.', props: 'cairn' },
    { id: 'oasis', hide: [7.6, 6.6], n: '광야의 샘', x: 90, z: 25, d: '모래 언덕 사이에 숨은 작은 샘. 대추야자가 그늘을 드리워요.', props: 'oasis', rich: 1 },
    { id: 'camp', hide: [-4.8, 3.8], n: '버려진 대상 야영지', x: 61, z: 119, d: '모래바람에 반쯤 묻힌 천막과 짐짝들. 누가 두고 갔을까요?', props: 'camp' },
    { id: 'cave', hide: [0.6, 4.0], n: '바위 틈 은신처', x: 134, z: -167, d: '바위 사이 그늘진 틈. 옛 목자가 쉬던 자리 같아요.', insight: 1, props: 'cave' },
    { id: 'altar', hide: [-5.6, 5.2], n: '마므레 상수리 옛 제단', x: 200, z: 175, d: '아브라함이 헤브론 마므레 상수리 숲에 이르러 여호와를 위하여 단을 쌓았더라 (창 13:18)', insight: 1, props: 'altar' },
    { id: 'boat', hide: [-3.4, 1.8], n: '갈대숲의 낡은 배', x: -71, z: -160, d: '갈대 사이에 버려진 고깃배. 바닥에 무언가 실려 있어요.', props: 'boat' },
    { id: 'pyr', hide: [5.6, 5.2], n: '피라미드 일꾼 마을 터', x: -185, z: -196, d: '피라미드를 쌓던 일꾼들이 살던 마을의 흔적이에요.', rich: 1, props: 'ruin2' },
    { id: 'dune', hide: [4.2, -3.8], n: '남쪽 모래 언덕', x: -6, z: 198, d: '바람이 모래에 물결무늬를 새긴 언덕 꼭대기예요.', props: 'dune' } ];
  EP.places2 = SITES.map(s => ({ id: s.id, n: s.n, x: s.x, z: s.z, r: 13, d: s.d, insight: s.insight ? 0 : 0 }));
  // where people live: jars and boxes to smash, [x, z, how many, radius]
  const TOWNS = [[176, 152, 6, 9], [158, -150, 3, 7], [-8, 118, 6, 10], [-10, 45, 3, 4.5], [-12, 64, 3, 3], [-45, 53, 2, 3.5], [-32, 3, 3, 6],
    [-22, -72, 6, 12], [16, -64, 4, 7], [10, -140, 3, 7], [-140, -40, 5, 13], [-145, 128, 5, 13]]; // v16.1: only where people live
  EP.loot = function (W) { const out = [], r = G.rng(4242), spots = Object.values(EP.spots);
    const free = (x, z, rr) => { if (spots.some(([a, b]) => Math.hypot(a - x, b - z) < 2.6)) return false; if (W.water && W.heightAt(x, z) < W.water.level + 0.2) return false; if (W.slopeAt(x, z) > 0.35) return false;
      if (out.some(o => Math.hypot(o.x - x, o.z - z) < 1.3)) return false; const q = { x, z }; W.collide(q, rr, W.heightAt(x, z)); return Math.hypot(q.x - x, q.z - z) < 0.01; };
    SITES.forEach(s => { let x = s.x + s.hide[0], z = s.z + s.hide[1]; for (let i = 0; i < 30 && !free(x, z, 0.6); i++) { x = s.x + s.hide[0] + (r() - 0.5) * 2.4; z = s.z + s.hide[1] + (r() - 0.5) * 2.4; }
      out.push({ id: 'ch_' + s.id, k: 'chest', x, z, ry: r() * 6, table: 'treasure', rich: s.rich, insight: s.insight || 0, n: s.n }); });
    TOWNS.forEach(([cx, cz, n, R], ti) => { for (let i = 0, k = 0; i < n * 10 && k < n; i++) { const a = r() * PI * 2, d = R * (0.35 + r() * 0.65), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (!free(x, z, 0.5)) continue;
      const kind = r() < 0.55 ? 'urn' : 'crate'; out.push({ id: `bk_${ti}_${k}`, k: kind, x, z, ry: r() * 6, v: Math.floor(r() * 3), re: 2 }); if (kind === 'urn' && r() < 0.5) { const x2 = x + 0.55, z2 = z + 0.2; if (free(x2, z2, 0.3)) out.push({ id: `bk_${ti}_${k}b`, k: 'urn', x: x2, z: z2, v: Math.floor(r() * 3), re: 2 }); } k++; } });
    return out; };
  // the places themselves: a little set dressing so they look like somewhere
  const prevB = EP.build;
  EP.build = function (W, G2) { prevB(W, G2); const r = G.rng(1616), X = EP.envx || {};
    const pl = (fn, x, z, o) => { try { W.place(typeof fn === 'string' && X[fn] ? X[fn] : fn, x, z, o); } catch (e) { console.error('site', fn, e); } };
    for (const s of SITES) { const { x, z } = s;
      if (s.props === 'ruin' || s.props === 'ruin2') { for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2 + r(), d = 3.4 + r(); pl('wallSeg', x + Math.cos(a) * d, z + Math.sin(a) * d, { ry: -a + PI / 2, args: [2 + r() * 1.6, 0.6 + r() * 1.2], col: { w: 2.5, d: 0.6, h: 1.6, a: -a + PI / 2 } }); }
        pl('pillar', x - 2.2, z + 1.6, { col: { r: 0.4, h: 3 } }); if (s.props === 'ruin2') { pl('pots', x + 2.4, z - 1.8); pl('rockField', x + 5, z + 4, { s: 0.7 }); } }
      if (s.props === 'cairn') { pl('altar', x + 1.8, z - 1.2, { s: 1.3, col: { r: 1, h: 1.4 } }); pl('rock', x - 3, z + 2, { s: 0.8 }); pl('dryGrass', x + 3, z + 2.4); }
      if (s.props === 'oasis') { if (X.pool) pl(X.pool, x + 4, z + 3, { args: [5, 3.4], col: { w: 5.8, d: 4.2, h: 0.4 } }); for (const [dx, dz] of [[-3, 4], [7, 0], [1, 8], [8, 6]]) pl('datePalm', x + dx, z + dz, { col: { r: 0.4, h: 4 } });
        pl('reeds', x + 6, z + 5.6); pl('tent', x - 5, z - 4, { ry: 0.6, s: 0.8, col: { w: 4.6, d: 3, h: 2, cam: true, a: 0.6 } }); }
      if (s.props === 'camp') { pl('tent', x - 3.4, z + 2.6, { ry: 0.3, s: 0.85, col: { w: 4.8, d: 3.2, h: 2, cam: true, a: 0.3 } }); pl('campfire', x + 2.2, z + 1.4); pl('sacks', x + 1.4, z - 2.4); pl('pots', x - 1.4, z - 3); }
      if (s.props === 'cave') { for (const [dx, dz, sc] of [[-4.5, 1, 1.1], [4.2, 1.6, 1], [0.4, 5.2, 1.2], [-3, -4, 0.8]]) pl('cliff', x + dx, z + dz, { s: sc * 0.6, col: { r: 2.4 * sc, h: 4 } }); pl('campfire', x + 0.6, z - 1.6); }
      if (s.props === 'altar') { pl('altar', x + 2, z + 1.4, { col: { r: 1, h: 1.2 } }); pl('oak', x - 5, z + 4, { s: 1.2, col: { r: 0.6, h: 4 } }); pl('oak', x + 6, z - 4.5, { s: 1.0, col: { r: 0.6, h: 4 } }); pl('flowers', x + 1, z - 2); }
      if (s.props === 'boat') { if (X.felucca) pl(X.felucca, x - 2.4, z + 1.4, { ry: 0.5, dy: -0.15 }); pl('reeds', x - 4, z - 2); pl('reeds', x + 3, z + 3); pl('reeds', x - 1, z + 4); }
      { const cx = x + s.hide[0], cz = z + s.hide[1], cov = s.props === 'boat' || s.props === 'oasis' ? 'reeds' : s.props === 'dune' || s.props === 'camp' ? 'desertShrub' : 'bush';
        for (let i = 0; i < 3; i++) { const a = i * 2.2 + r(), d = 1.0 + r() * 0.3; pl(cov === 'bush' && !G.env.bush ? 'dryGrass' : cov, cx + Math.cos(a) * d, cz + Math.sin(a) * d, { s: 0.8 + r() * 0.3, ry: r() * 6 }); } pl('dryGrass', cx + 0.6, cz - 0.7); }
      if (s.props === 'dune') { pl('rockField', x + 3, z - 3, { s: 0.8 }); pl('desertShrub', x - 3, z + 2); pl('dryGrass', x + 1, z + 3.5); } 
    // in the wild, things that grow there instead of jars and boxes
    if (G.Wilds && G.Wilds.scatter) G.Wilds.scatter(W, [{ x: 90, z: 25, r: 10, n: 6, types: [['date', 3], ['herb', 2], ['reeds', 1]] }, { x: 61, z: 119, r: 9, n: 4, types: [['herb', 2], ['caper', 2]] },
      { x: -185, z: -196, r: 10, n: 4, types: [['rock', 2], ['caper', 2]] }, { x: 134, z: -167, r: 8, n: 4, types: [['honey', 1], ['herb', 2], ['rock', 1]] }, { x: 126, z: -98, r: 8, n: 4, types: [['herb', 2], ['caper', 1], ['nest', 1]] }], 8181); } };
})(window.G);

// ------------------------------------------------------------------ v16.2 Joseph's household: 아스낫 and the boys (창 41:45, 50–52)
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return; const rnd = a => a[Math.floor(Math.random() * a.length)];
  const KIDGAMES = [{ t: '요셉은 아이들과 마당에서 술래잡기를 했습니다. 웃음소리가 담장을 넘어갔습니다.', k: 'dance', me: 'clap', kid: ['아빠 잡았다!', '한 번 더! 한 번 더요!'] },
    { t: '요셉은 갈대 피리를 불어 주었고, 아이는 그 소리에 맞춰 빙글빙글 돌았습니다.', k: 'dance2', me: 'flute', kid: ['아빠 피리 소리가 제일 좋아요!', '또 불어 주세요!'] },
    { t: '요셉은 아이를 무릎에 앉히고 증조할아버지 아브라함의 별 이야기를 들려주었습니다.', k: 'sitg', me: 'sitg', kid: ['별이 그렇게 많아요? 하나, 둘, 셋…', '나도 크면 아빠처럼 꿈을 꿀래요!'] },
    { t: '요셉은 아이를 어깨에 태우고 나일 강가까지 걸었습니다.', k: 'cheer', me: 'wave', kid: ['와아, 높다! 피라미드도 보여요!', '아빠, 저 배 타 보고 싶어요!'] }];
  EP.family = {
    asenath: { start: 25, meal: 1, walk: 1,
      talk: (S, lv) => [['오늘 궁에서는 어떠셨어요? 얼굴이 피곤해 보여요.', '아이들이 하루 종일 아빠만 찾았어요.'],
        ['당신의 하나님 이야기를 더 듣고 싶어요. 이 땅의 신들과는 다른 분이시죠.', '당신이 가나안에 두고 온 가족 이야기를 해 줄래요?'],
        ['처음엔 히브리 사람과 결혼한다니 무서웠어요. 지금은… 하나님께 감사해요.', '므낫세가 어제 「아빠의 하나님」께 기도했어요. 들으셨어요?'],
        ['언젠가 당신의 아버지를 뵙고 싶어요. 우리 아이들을 보여 드리고 싶어요.', '당신 곁이라 이 집이 늘 따뜻해요.']][Math.min(3, lv)],
      mealTalk: ['오늘은 당신이 좋아하는 렌틸 죽이에요.', '므낫세, 아빠 오셨다! 손 씻고 오렴.', '에브라임이 오늘 처음으로 혼자 숟가락질을 했어요!'] },
    manasseh: { start: 20, play: 1, walk: 1, games: KIDGAMES,
      talk: (S, lv) => [['아빠! 오늘 뭐 했어요?', '아빠, 수레 태워 주세요!'], ['아빠 하나님은 어디 계세요? 하늘에요?', '저도 아빠처럼 꿈을 풀 수 있어요?'], ['형들은 어떤 사람이에요? 할아버지는요?', '이름이 왜 므낫세예요? …다 잊게 하셨다고요?'], ['아빠, 사랑해요!', '저 커서 아빠처럼 착한 사람이 될래요.']][Math.min(3, lv)] },
    ephraim: { start: 20, play: 1, walk: 1, games: KIDGAMES,
      talk: (S, lv) => [['(방긋 웃는다)', '아빠! 아빠!'], ['므낫세 형이 나 안 놀아 줘요!', '이거 봐요! 돌멩이 주웠어요!'], ['에브라임은 번성한다는 뜻이래요! 나 크게 클 거예요!', '아빠 무릎이 제일 좋아요.'], ['아빠, 내일도 같이 놀아요!', '(아빠 품에 폭 안긴다)']][Math.min(3, lv)] } };
  // coming home: the boys run to their father; at supper time Asenath calls
  let hT = 0; const prevUpd = EP.update;
  EP.update = function (dt, S) { if (prevUpd) prevUpd.apply(this, arguments); if (!S || !S.flags || (hT -= dt) > 0) return; hT = 1;
    if ((G.Cine && G.Cine.on) || G.UI.busy() || !(G.EP.joseph.steps.c5_patrol && S.step && G.Game.stepOrder().indexOf(S.step) >= G.Game.stepOrder().indexOf('c5_patrol'))) return; const P = G.Game.P, home = [10, -140], d = Math.hypot(P.x - home[0], P.z - home[1]);
    const f = S.flags.home = S.flags.home || {}; if (d > 22) { f.away = 1; return; }
    if (f.away && f.greetDay !== S.day) { f.away = 0; f.greetDay = S.day; for (const id of ['manasseh', 'ephraim']) { const n = G.Game.ENT.npcs[id]; if (!n || !n.vis) continue; G.Game.npcWalk(id, P.x + (id === 'ephraim' ? 1 : -1), P.z + 1, () => { n.emote = { k: 'cheer', t: 0, dur: 2 }; }, 3.2); G.Life && G.Life.bubble(id, rnd(['아빠!', '아빠 왔다!', '아빠아!']), 2.6); } }
    const h = S.time % 24; if (h > 18 && h < 21 && f.supperDay !== S.day && d < 14) { f.supperDay = S.day; G.Life && G.Life.bubble('asenath', '저녁 드세요! 오늘은 생선이에요.', 3.5); G.UI.toast('아스낫에게 말을 걸어 함께 식사할 수 있어요'); } };
  // a button for the people you know
  (EP.extra = EP.extra || []).push({ id: 'people', label: '사람들', ic: 'star', on: S => !!(S.bond && Object.keys(S.bond).length), click: () => G.Bond && G.Bond.panel() });
})(window.G);

// ------------------------------------------------------------------ v16.3 two lands: the prologue stays in Canaan, the story after the pit stays in Egypt
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return; const Game = G.Game;
  const CANAAN_X = 118, EGYPT_X = 112; let msgT = 0;
  EP.landOf = S => { const o = Game.stepOrder(), i = o.indexOf(S.step); if (i < 0) return null; return i < o.indexOf('c1_caravan') ? 'canaan' : i > o.indexOf('c1_caravan') ? 'egypt' : null; };
  const prev = EP.update;
  EP.update = function (dt, S) { if (prev) prev.apply(this, arguments); if (!S || (G.Cine && G.Cine.on)) return; const land = EP.landOf(S); if (!land) return; const P = Game.P; msgT -= dt;
    let hit = false; if (land === 'canaan' && P.x < CANAAN_X) { P.x = CANAAN_X; hit = true; } if (land === 'egypt' && P.x > EGYPT_X) { P.x = EGYPT_X; hit = true; }
    if (hit) { if (P.vx) P.vx = 0; if (msgT <= 0) { msgT = 4; G.UI.toast(land === 'canaan' ? '이 너머는 끝없는 광야예요 · 지금은 형들을 찾아야 해요' : '가나안으로 가는 광야 길이에요 · 이제는 애굽 땅에서 지내야 해요'); } } };
})(window.G);

// ------------------------------------------------------------------ v16.6 umbrella button · stamina upgrade for old saves
(function (G) {
  const EP = G.EP && G.EP.joseph; if (!EP) return;
  (EP.extra = EP.extra || []).push({ id: 'umb', label: () => G.Climate && G.Climate.umbOpen ? '우산 접기' : '우산 펴기', ic: 'rain', on: () => !!G.Game.tool('umbrella'), click: () => G.Climate && G.Climate.toggle() });
  const prev = EP.update; EP.update = function (dt, S) { if (prev) prev.apply(this, arguments); if (S && S.hero && !S.flags.stam16) { S.flags.stam16 = 1; if ((S.hero.stamMax || 100) < 140) S.hero.stamMax = (S.hero.stamMax || 100) + 40; } };
})(window.G);
