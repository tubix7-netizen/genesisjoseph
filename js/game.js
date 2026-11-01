/* 약속의 길 — gameplay core: data, player, camera, time, farming, herds, gathering, crafting, market, quests */
'use strict';
(function (G) {
const { R, World, envAt, FX, Rig, HB, HBK, HBI, AB, humanoid, animHuman, animal, animAnimal, prop, GB, m4, m4trs, m4mul, clamp, lerp, smooth, angDiff, rng, hexRGB } = G;
const PI = Math.PI;
const Game = G.Game = {};
const PM = Game.pm = { b() { }, e() { }, n() { } }; // v17.1 P11 frame timing marks: empty unless the game is opened with ?perf=1 (js/perf.js swaps them in)
G.EP = G.EP || {};

// =================================================================== DATA
const ITEMS = {
  branch: { n: '나뭇가지', cat: 'mat', p: 1, ic: 'stick', c: '#8a6440' }, wood: { n: '통나무', cat: 'mat', p: 4, ic: 'log', c: '#7a5232' },
  stone: { n: '돌', cat: 'mat', p: 1, ic: 'stone', c: '#a8a090' }, reed: { n: '갈대', cat: 'mat', p: 1, ic: 'reed', c: '#7a9a4a' },
  clay: { n: '진흙', cat: 'mat', p: 1, ic: 'clay', c: '#9a6a4a' }, straw: { n: '짚', cat: 'mat', p: 1, ic: 'straw', c: '#d8c070' },
  wool: { n: '양털', cat: 'mat', p: 5, ic: 'wool', c: '#efe8da' }, thread: { n: '실', cat: 'mat', p: 12, ic: 'thread', c: '#e0d0b0' },
  cloth: { n: '모직 천', cat: 'good', p: 40, ic: 'cloth', c: '#b8946a' }, flax: { n: '아마', cat: 'crop', p: 5, ic: 'flax', c: '#7a9ab8' },
  linen: { n: '세마포', cat: 'good', p: 30, ic: 'cloth', c: '#f4efe2' }, brick: { n: '흙벽돌', cat: 'mat', p: 3, ic: 'brick', c: '#b07a4a' },
  olive: { n: '올리브', cat: 'crop', p: 2, ic: 'berry', c: '#6a7a3a' }, oil: { n: '올리브기름', cat: 'good', p: 16, ic: 'oil', c: '#c8a040' },
  fig: { n: '무화과', cat: 'food', p: 3, ic: 'berry', c: '#7a4a6a', stam: 25 }, milk: { n: '염소젖', cat: 'food', p: 4, ic: 'milk', c: '#f6f2ea', stam: 20 },
  cheese: { n: '치즈', cat: 'good', p: 16, ic: 'cheese', c: '#f0d890', stam: 50 },
  barley: { n: '보리', cat: 'crop', p: 4, ic: 'grain', c: '#d8b850' }, wheat: { n: '밀', cat: 'crop', p: 6, ic: 'grain', c: '#e0a83a' },
  lentil: { n: '렌틸콩', cat: 'crop', p: 5, ic: 'bean', c: '#c0603a' }, cucumber: { n: '오이', cat: 'crop', p: 7, ic: 'veg', c: '#5a8a3a' },
  onion: { n: '양파', cat: 'crop', p: 6, ic: 'veg', c: '#c89a6a' },
  bread: { n: '빵', cat: 'food', p: 12, ic: 'bread', c: '#d8a060', stam: 60 }, stew: { n: '붉은 팥죽', cat: 'food', p: 18, ic: 'bowl', c: '#b5402a', stam: 80 },
  rod: { n: '껍질 벗긴 가지', cat: 'mat', p: 2, ic: 'rod', c: '#f2ead8' }, hay: { n: '꼴', cat: 'mat', p: 2, ic: 'straw', c: '#c8b060' },
  grain: { n: '곡식 자루', cat: 'good', p: 20, ic: 'sack', c: '#d8c49a' }, oilFlask: { n: '기름병', cat: 'key', p: 0, ic: 'oil', c: '#c8a040' },
  meal: { n: '별미', cat: 'key', p: 0, ic: 'bowl', c: '#a86a3a' },
  s_barley: { n: '보리 씨앗', cat: 'seed', crop: 'barley', p: 2, ic: 'seed', c: '#d8b850' }, s_wheat: { n: '밀 씨앗', cat: 'seed', crop: 'wheat', p: 3, ic: 'seed', c: '#e0a83a' },
  s_lentil: { n: '렌틸콩 씨앗', cat: 'seed', crop: 'lentil', p: 2, ic: 'seed', c: '#c0603a' }, s_flax: { n: '아마 씨앗', cat: 'seed', crop: 'flax', p: 2, ic: 'seed', c: '#7a9ab8' },
  s_cucumber: { n: '오이 씨앗', cat: 'seed', crop: 'cucumber', p: 3, ic: 'seed', c: '#5a8a3a' }, s_onion: { n: '양파 씨앗', cat: 'seed', crop: 'onion', p: 3, ic: 'seed', c: '#c89a6a' },
};
const CROPS = {
  barley: { n: '보리', days: [1, 1, 1], y: [2, 3], sickle: true, seed: 's_barley', straw: 1 },
  wheat: { n: '밀', days: [1, 2, 1], y: [2, 4], sickle: true, seed: 's_wheat', straw: 1 },
  lentil: { n: '렌틸콩', days: [1, 1], y: [2, 3], seed: 's_lentil' },
  flax: { n: '아마', days: [1, 1, 1], y: [2, 3], seed: 's_flax' },
  cucumber: { n: '오이', days: [1, 1, 1], y: [2, 4], seed: 's_cucumber' },
  onion: { n: '양파', days: [1, 2], y: [2, 3], seed: 's_onion' },
};
const RECIPES = [
  { id: 'hoe', n: '괭이', tool: 'hoe', in: { branch: 2, stone: 1 }, d: '밭을 갈 수 있어요' },
  { id: 'staff', n: '목자의 지팡이', tool: 'staff', in: { branch: 2 }, d: '양 떼를 이끌 때 써요' },
  { id: 'umbrella', n: '잎사귀 우산', tool: 'umbrella', in: { branch: 1, reed: 2 }, d: '비 오는 날 펴면 젖지 않고, 뙤약볕도 가려 줘요' },
  { id: 'umbrellaG', n: '풀잎 우산', tool: 'umbrella', in: { herb: 4 }, d: '들풀을 엮어 만든 우산 · 비와 뙤약볕을 가려 줘요' }, // v16.9 also from grass
  { id: 'umbrellaS', n: '짚 우산', tool: 'umbrella', in: { straw: 3 }, d: '짚을 엮어 만든 우산 · 비와 뙤약볕을 가려 줘요' },
  { id: 'sickle', n: '낫', tool: 'sickle', in: { branch: 1, stone: 2 }, d: '보리와 밀을 벨 수 있어요' },
  { id: 'axe', n: '손도끼', tool: 'axe', in: { branch: 2, stone: 3 }, d: '나무를 베어 통나무를 얻어요' },
  { id: 'hammer', n: '돌망치', tool: 'hammer', in: { wood: 1, stone: 3 }, d: '큰 바위를 깨뜨려 돌을 얻어요' },
  { id: 'shears', n: '양털 가위', tool: 'shears', in: { wood: 1, stone: 3 }, d: '양털을 깎을 수 있어요' },
  { id: 'jar', n: '큰 물항아리', tool: 'bigjar', in: { clay: 6 }, st: 'fire', d: '물을 20번 담을 수 있어요' },
  { id: 'rod', n: '껍질 벗긴 가지', out: { rod: 2 }, in: { branch: 3 }, d: '흰 무늬가 드러나게 껍질을 벗긴 가지 (창 30:37)' },
  { id: 'stew', n: '붉은 팥죽', out: { stew: 1 }, in: { lentil: 3, branch: 1 }, water: 1, st: 'fire', d: '렌틸콩으로 끓인 죽 (창 25:29)' },
  { id: 'bread', n: '밀빵', out: { bread: 2 }, in: { wheat: 2, branch: 1 }, water: 1, st: 'fire' },
  { id: 'bbread', n: '보리빵', out: { bread: 1 }, in: { barley: 3, branch: 1 }, water: 1, st: 'fire' },
  { id: 'cheese', n: '치즈', out: { cheese: 1 }, in: { milk: 3 } },
  { id: 'thread', n: '실', out: { thread: 1 }, in: { wool: 2 } },
  { id: 'cloth', n: '모직 천', out: { cloth: 1 }, in: { thread: 3 }, st: 'loom' },
  { id: 'linen', n: '세마포', out: { linen: 1 }, in: { flax: 3 }, st: 'loom' },
  { id: 'oil', n: '올리브기름', out: { oil: 1 }, in: { olive: 4 }, st: 'press' },
  { id: 'brick', n: '흙벽돌', out: { brick: 2 }, in: { clay: 2, straw: 1 }, d: '진흙과 짚을 섞어 볕에 말려요' },
  { id: 'hay', n: '꼴', out: { hay: 2 }, in: { straw: 2 }, d: '가축 먹이' },
  { id: 'grain', n: '곡식 자루', out: { grain: 1 }, in: { barley: 3 }, d: '곳간에 쌓을 곡식' },
  { id: 'grainW', n: '곡식 자루 (밀)', out: { grain: 1 }, in: { wheat: 2 } },
];
const TOOLS = { umbrella: '잎사귀 우산', hoe: '괭이', jar: '물항아리', bigjar: '큰 물항아리', sickle: '낫', axe: '손도끼', hammer: '돌망치', shears: '양털 가위', staff: '지팡이' };
const PATN = { plain: '흰', black: '검은', brown: '갈색', speckled: '점 있는', spotted: '아롱진', streaked: '얼룩무늬' };
const SPN = { sheep: '양', goat: '염소', cow: '소', camel: '낙타', donkey: '나귀' };
Object.assign(Game, { ITEMS, CROPS, RECIPES, TOOLS, PATN, SPN });

// =================================================================== STATE
let S = null, W = null, EP = null; Game.mode = 'title';
const P = { x: 0, z: 0, y: 0, vx: 0, vz: 0, vy: 0, face: 0, spd: 0, phase: 0, grounded: true, coyote: 0, jumpBuf: 0, sprint: false, stam: 100, exhausted: false, act: null, actT: 0, actDur: 0, actFire: null, fired: false, rig: new Rig(HB), mesh: null, look: null, carry: null, follow: [], limp: false, swim: false, stepT: 0 };
const CAM = { yaw: 0, pitch: 0.28, dist: 6.2, tx: 0, ty: 0, tz: 0, x: 0, y: 0, z: 0, last: 0, fov: 1.0 };
const INPUT = { mx: 0, my: 0, cx: 0, cy: 0, act: false, actEdge: false, keys: {} };
const COARSE = typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches;
const SET = { sens: 1, invert: false, autoCam: true, quality: COARSE ? 'mid' : 'high', dist: 1, view: 'shoulder', side: 'right', music: 0.6, sfx: 0.8 };
try { Object.assign(SET, JSON.parse(localStorage.getItem('genesisSettings') || '{}')); } catch (e) { }
{ const qm = /[?&]q=(low|mid|high)\b/.exec(location.search); if (qm) SET.quality = qm[1]; } // ?q=low|mid|high: force the quality for this visit (a crashed phone tab cannot reach the settings menu)
Game.P = P; Game.CAM = CAM; Game.INPUT = INPUT; Game.SET = SET;
Object.defineProperty(Game, 'UI', { get: () => G.UI }); Game.FX = FX; Game.angDiff = angDiff;
Game.saveSettings = () => { try { localStorage.setItem('genesisSettings', JSON.stringify(SET)); } catch (e) { } };
Game.S = () => S; Game.W = () => W; Game.EP = () => EP;

const inv = (k) => (S.inv[k] || 0);
const have = (k, n) => inv(k) >= (n || 1);
function give(k, n, quiet) { n = n || 1; S.inv[k] = inv(k) + n; S.stats.got[k] = (S.stats.got[k] || 0) + n; if (!quiet) G.UI.gain(k, n); }
function take(k, n) { n = n || 1; if (!have(k, n)) return false; S.inv[k] -= n; if (S.inv[k] <= 0) delete S.inv[k]; return true; }
function tool(k) { return !!S.tools[k]; }
function giveTool(k) { S.tools[k] = true; G.UI.toast(`도구를 얻었다 · ${TOOLS[k]}` + (TOOL_PROP[k] ? ' · 손 버튼으로 들고 내려놓아요' : '')); if (k === 'bigjar') S.jarMax = 20; }
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o); Game.sfx = sfx;
// 진동 (Android 등 navigator.vibrate 지원 기기; iOS 사파리는 지원하지 않아 조용히 무시). 설정 → 진동으로 끔.
const HAPTIC = { tap: 8, hit: 14, land: 18, thud: 32, hurt: [40, 30, 25], quest: [18, 50, 26] };
let hapT = 0;
const haptic = k => { if (SET.haptic === 'off' || !navigator.vibrate) return; const now = performance.now(); if (now - hapT < 60) return; hapT = now; try { navigator.vibrate(HAPTIC[k] || k); } catch (e) { } };
Game.haptic = haptic; G.haptic = haptic;
function silver(n) { S.silver = Math.max(0, S.silver + n); if (n > 0) { S.stats.earned += n; sfx('coin'); } G.UI.hud(); }
function stat(k, n) { S.stats[k] = (S.stats[k] || 0) + (n || 1); }
// one hand, one tool: S.hand is what the hero visibly carries (or null = empty-handed). Actions that need another tool
// use it only for the moment of the action; the chosen tool comes back to the hand afterwards.
const TOOL_PROP = { hoe: 'hoe', jar: 'jar', bigjar: 'jar', sickle: 'sickle', axe: 'axe', hammer: 'hammer', staff: 'staff' };
function hand() { return S && S.hand && tool(S.hand) ? S.hand : null; }
function hold(k) {
  if (k && !tool(k)) return false; const was = hand(); S.hand = k || null;
  if (S.hand !== was) { G.UI.toast(S.hand ? `손에 들었다 · ${TOOLS[S.hand]}` : `${TOOLS[was] || '도구'}를 내려놓았다 · 빈손`); sfx('pickup', { pitch: S.hand ? 1.1 : 0.8 }); }
  G.UI.hud(); return true;
}
Object.assign(Game, { inv, have, give, take, tool, giveTool, silver, stat, hand, hold, TOOL_PROP });

// =================================================================== FEATURES (opened one by one as the story goes on)
/* Systems such as hunger, cold, building, riding or buying animals start hidden and are unlocked by the episode
   (EP.featAt = { feature: stepId }, or Game.unlockFeat from a story hook). A small card introduces each one. */
const FEATS = Game.FEATS = {
  surv: { n: '배고픔', ic: 'bread', d: '일하고 걸으면 배가 고파져요. 가방이나 왼쪽 위 빵 표시를 눌러 먹을 것을 드세요.' },
  warm: { n: '체온', ic: 'fire', d: '밤과 비바람에는 몸이 식어요. 모닥불 곁이나 장막 안에서 몸을 녹이세요. 털겉옷을 지으면 덜 추워요.' },
  build: { n: '짓기', ic: 'hammer', d: '메뉴 → 짓기에서 모닥불과 움막을 원하는 곳에 지을 수 있어요.' },
  build2: { n: '집과 농장 짓기', ic: 'house', d: '이제 장막과 흙벽돌 집, 가축 우리, 밭, 우물, 마구간까지 지을 수 있어요.' },
  herd2: { n: '내 가축', ic: 'wool', d: '내 우리를 지으면 가축 상인에게 양과 염소, 소를 사서 직접 키울 수 있어요.' },
  ride: { n: '탈것', ic: 'donkey', d: '나귀나 낙타 곁에서 A를 누르면 올라타요. 달리기 버튼으로 빨리 달리고, 왼쪽 아래 버튼으로 내려요.' },
  ride2: { n: '함께 타기', ic: 'donkey', d: '탈것에 탄 채 가족에게 가까이 가면 뒤에 태울 수 있어요.' },
};
Game.feat = k => !!(S && ((S.feat && S.feat[k]) || (EP && EP.featAll)));
Game.unlockFeat = function (k, quiet) {
  if (!S) return false; S.feat = S.feat || {}; if (S.feat[k]) return false; S.feat[k] = S.day;
  const f = (EP && EP.featText && EP.featText[k]) || FEATS[k]; if (!quiet && f && G.UI.featCard) G.UI.featCard(k, f);
  if (EP && EP.onFeat) EP.onFeat(k, S, Game, quiet); G.UI.hud && G.UI.hud(); return true;
};
Game.stepOrder = () => Object.keys(EP.steps);
function featCheck(quiet) { const at = EP.featAt; if (!at || !S) return; const order = Game.stepOrder(), i = order.indexOf(S.step); for (const k in at) { const j = order.indexOf(at[k]); if (j >= 0 && i >= j) Game.unlockFeat(k, quiet); } }
Game.featCheck = featCheck;
// other modules add interaction candidates here: fn(S, Game) -> [{ d, label, x, z, y, use, key }]
Game.CTX = [];

function newState(ep) {
  return {
    v: 2, ep: ep.id, step: ep.start.step, flags: {}, q: {}, day: 1, time: ep.start.time || 7, weather: 'clear',
    player: { x: ep.start.x, z: ep.start.z, face: ep.start.face || 0 }, silver: ep.start.silver || 0,
    inv: Object.assign({}, ep.start.inv || {}), tools: Object.assign({}, ep.start.tools || {}), water: 0, jarMax: 12, seedSel: null,
    plots: {}, nodes: {}, herds: {}, built: {}, unlocked: {}, npcPos: {}, outfit: ep.start.outfit || 'default', feat: {}, surv: { food: 90, warm: 100 }, bld: [], mounts: [],
    stats: { got: {}, harvest: {}, crafted: {}, sold: 0, earned: 0, tilled: 0, planted: 0, watered: 0, sheared: 0, milked: 0, born: 0 }
  };
}

// =================================================================== LOAD / SAVE
const KEY = id => 'genesisSave_' + id;
Game.hasSave = id => { try { return !!localStorage.getItem(KEY(id)); } catch (e) { return false; } };
Game.save = function (quiet) { if (!S || Game.mode !== 'play') return; S.player = { x: P.x, z: P.z, face: P.face }; if (G.Ride) G.Ride.save(); try { localStorage.setItem(KEY(S.ep), JSON.stringify(S)); if (!quiet) G.UI.toast('저장했어요'); } catch (e) { } };
Game.deleteSave = id => { try { localStorage.removeItem(KEY(id)); } catch (e) { } };

// =================================================================== WORLD SETUP
const ENT = { npcs: {}, animals: [], nodes: [], nodeSets: {}, plotsDirty: true, soilMesh: null, cropSets: {}, sites: [], specials: [], dyn: [], props: {} };
Game.ENT = ENT;
const meshCache = {};
function lookMesh(look, lod) { const k = JSON.stringify(look) + '|L' + (lod || 0); if (!meshCache[k]) meshCache[k] = (R.meshIdx || R.mesh)(humanoid(look, lod || 0)); return meshCache[k]; }
/* NPC meshes are built lazily by distance (detailed < 11 m, medium < 32 m, far beyond) and at most one detailed build per
   frame, so a crowded camp never stalls the first frames; until a finer mesh exists the coarser one is drawn */
let meshBudget = 0;
/* v17.2 P12: detailed people (LOD 0 ≈ 37 ms, LOD 1 ≈ 11 ms on a fast laptop, several times that on a phone) are built in a Web Worker
   (js/meshworker.js) instead of on the main thread, and are asked for early (LOD 0 from 24 m, LOD 1 from 50 m) so they are ready by the
   time someone walks up. Until a finer mesh is ready the coarser one is drawn, as before. Without a worker (file://, ?mw=0, an error)
   the old one-build-per-frame path is used. Game.mw holds the counters (also in the ?perf=1 report). */
const MW = Game.mw = { ok: false, w: null, q: [], pend: new Map(), busy: 0, frame: 0, done: 0, ms: 0, fail: 0 };
function mwPump() {
  while (MW.ok && MW.busy < 2 && MW.q.length) {
    let bi = -1, bs = 1e9; for (let i = 0; i < MW.q.length; i++) { const r = MW.q[i], s = (MW.frame - r.hot < 12 ? 0 : 1000) + r.d; if (s < bs) { bs = s; bi = i; } }
    const r = MW.q.splice(bi, 1)[0]; r.t0 = performance.now(); r.sent = true; MW.busy++; MW.w.postMessage({ key: r.key, look: r.look, lod: r.lod });
  }
}
function mwAsk(key, look, lod, d, hot) {
  let r = MW.pend.get(key); if (!r) { r = { key, look, lod, d, hot: -99, sent: false }; MW.pend.set(key, r); MW.q.push(r); }
  if (d < r.d || !r.sent) r.d = d; if (hot) r.hot = MW.frame; mwPump();
}
(function mwStart() {
  if (typeof Worker === 'undefined' || location.protocol === 'file:' || /[?&]mw=0\b/.test(location.search)) return;
  try {
    const sc = n => { const s = document.querySelector('script[src*="js/' + n + '.js"]'); return s && s.src; }, core = sc('core'), models = sc('models'); if (!core || !models) return;
    const w = MW.w = new Worker(new URL('meshworker.js', core).href + (core.match(/\?.*$/) || [''])[0]);
    w.onmessage = e => { const m = e.data;
      if (m.ready) { MW.ok = true; mwPump(); return; }
      const r = MW.pend.get(m.key); MW.pend.delete(m.key); MW.busy = Math.max(0, MW.busy - 1);
      if (m.err || !r) { if (m.err && ++MW.fail > 3) { MW.ok = false; console.warn('mesh worker off:', m.err); } }
      else { meshCache[m.key] = R.meshWelded(m, m.bs); MW.done++; MW.ms += performance.now() - r.t0; }
      mwPump(); };
    w.onerror = e => { MW.ok = false; console.warn('mesh worker failed', e && e.message); };
    w.postMessage({ init: 1, core, models });
  } catch (e) { MW.ok = false; }
})();
/* v17.3 P13: static chunks are sorted into cells (see R.applyCells) by a second worker, so the one that builds people is never kept waiting. */
const CW = Game.cw = { w: null, id: 0, pend: new Map(), done: 0 };
Game.cellAsk = function (m, g) {
  if (!CW.w || g.d.length < 6000 * 33) return; const data = new Float32Array(g.d), id = ++CW.id; CW.pend.set(id, m); CW.w.postMessage({ cell: id, data, C: 12 }, [data.buffer]);
};
(function cwStart() {
  if (typeof Worker === 'undefined' || location.protocol === 'file:' || /[?&]mw=0\b/.test(location.search)) return;
  try { const s = document.querySelector('script[src*="js/core.js"]'); if (!s) return; const w = CW.w = new Worker(new URL('meshworker.js', s.src).href + (s.src.match(/\?.*$/) || [''])[0]);
    w.onmessage = e => { const r = e.data, m = CW.pend.get(r.cell); CW.pend.delete(r.cell); if (m && r.out) { R.applyCells(m, r.out, r.cells); CW.done++; } };
    w.onerror = () => { CW.w = null; }; } catch (e) { CW.w = null; }
})();
const lookKey = n => n.lkOf === n.d.look ? n.lk : (n.lkOf = n.d.look, n.lk = JSON.stringify(n.d.look)); // the look's cache key, computed once per look
function npcMesh(n, d) {
  if (n.d.animal) return n.mesh; const want = d < 11 ? 0 : d < 32 ? 1 : 2, M = n.meshes || (n.meshes = []);
  if (MW.ok) { // ask early: the mesh for the level this person is about to need
    const pre = d < 24 ? 0 : d < 50 ? 1 : 2;
    if (pre < want && !(n.pfLook === n.d.look && n.pfLv <= pre)) { n.pfLook = n.d.look; n.pfLv = pre; const kp = lookKey(n) + '|L' + pre; if (!meshCache[kp]) mwAsk(kp, n.d.look, pre, d, false); }
  }
  if (!M[want]) { const k = lookKey(n) + '|L' + want;
    if (meshCache[k]) M[want] = meshCache[k];
    else if (want === 2 || (!MW.ok && meshBudget > 0)) { if (want < 2) meshBudget--; M[want] = lookMesh(n.d.look, want); }
    else if (MW.ok) mwAsk(k, n.d.look, want, d, true); }
  for (let l = want; l <= 2; l++) if (M[l]) return M[l]; for (let l = want - 1; l >= 0; l--) if (M[l]) return M[l];
  return (M[2] = lookMesh(n.d.look, 2));
}
Game.npcMesh = npcMesh;
function animalMesh(sp, pat, extra) { const k = sp + ':' + pat + ':' + (extra ? JSON.stringify(extra) : ''); if (!meshCache[k]) meshCache[k] = (R.meshIdx || R.mesh)(animal(sp, Object.assign({ pattern: pat, seed: (k.length * 131) % 997 + 3 }, PATCOL(sp, pat), extra || {})).gb); return meshCache[k]; }
function PATCOL(sp, pat) {
  if (sp === 'sheep') return pat === 'black' ? { wool: 0x3a302a, face: 0x2a2220 } : pat === 'brown' ? { wool: 0x8a5a3a, face: 0x6a4a32 } : {};
  if (sp === 'goat') return pat === 'brown' ? { hide: 0x7a5232 } : pat === 'plain' ? { hide: 0x2e2622 } : {};
  return {};
}
function propMesh(k) { if (!meshCache['p:' + k]) meshCache['p:' + k] = R.mesh(prop(k)); return meshCache['p:' + k]; }
Game.lookMesh = lookMesh; Game.animalMesh = animalMesh; Game.propMesh = propMesh;

Game.start = function (epId, fresh, preview) {
  EP = G.EP[epId]; Game.mode = 'loading'; Game.preview = !!preview;
  if (W) Game.dispose();
  let saved = null; if (!fresh) { try { saved = JSON.parse(localStorage.getItem(KEY(epId)) || 'null'); } catch (e) { } }
  S = saved && saved.v === 2 ? saved : newState(EP);
  // world
  if (window.__bc) __bc('terrain'); W = new World(EP.spec); W.buildTerrain();
  if (window.__bc) __bc('build'); EP.build(W, Game);
  if (window.__bc) __bc('statics'); W.finishStatics();
  // nodes
  buildNodeSets();
  // npcs
  if (window.__bc) __bc('npcs'); ENT.npcs = {}; for (const d of EP.npcs) addNPC(d);
  // pens, sites (player-built pens, fields and stations join the episode's lists first)
  if (G.Build) G.Build.attach(S, W);
  for (const pen of EP.pens || []) { if (!S.herds[pen.id]) S.herds[pen.id] = { list: (pen.init || []).map(a => a.slice()), trough: pen.trough0 || 0, hay: 0, rods: 0, joy: 0, woolDays: 0, milk: false, wool: false }; }
  refreshAnimals();
  ENT.sites = EP.sites || []; ENT.specials = EP.specials || []; ENT.dyn = []; for (const s of ENT.sites) s._col = null;
  for (const s of ENT.sites) if (S.built[s.id]) applySiteFx(s);
  buildSiteMeshes();
  ENT.plotsDirty = true;
  P.x = S.player.x; P.z = S.player.z; P.face = S.player.face; P.y = W.heightAt(P.x, P.z); P.vx = P.vz = P.vy = 0; P.stam = 100; P.follow = []; P.carry = null;
  setOutfit(S.outfit);
  if (G.Combat) G.Combat.reset(S); if (G.Vitals) G.Vitals.reset(); if (G.Phys) G.Phys.reset(); if (G.Loot) G.Loot.reset(); if (G.Lock) G.Lock.reset(); if (G.Life) G.Life.reset(); if (G.Ride) G.Ride.reset(S); if (G.NpcAI) G.NpcAI.reset(S); Q.firstFrame = true; Game.refreshLook();
  CAM.yaw = P.face + PI; CAM.pitch = camCfg().pRest; snapCam();
  if (!R.grass) R.grassInit(SET.quality === 'high' ? 9000 : SET.quality === 'mid' ? 5000 : 1, 40);
  if (window.__bc) __bc('quality'); Game.applyQuality();
  if (preview) { Game.mode = 'title'; S.time = EP.titleTime || 17.2; if (EP.onLoad) EP.onLoad(S, Game); return; }
  Game.mode = 'play';
  G.UI.enterGame();
  if (EP.onLoad) EP.onLoad(S, Game);
  Game.go(S.step, true); featCheck(true);
  if (fresh && EP.opening && G.Opening && !S.flags.opened) { S.flags.opened = 1; G.Opening.play(EP.opening, S, Game); }
};
Game.dispose = function () {
  if (!W) return; W.terrain.forEach(R.free); W.statics.forEach(R.free); if (W.water) R.free(W.water.mesh);
  for (const k in ENT.nodeSets) R.free(ENT.nodeSets[k]); ENT.nodeSets = {}; for (const k in ENT.cropSets) R.free(ENT.cropSets[k]); ENT.cropSets = {};
  if (ENT.soilMesh) R.free(ENT.soilMesh); ENT.soilMesh = null; ENT.dyn.forEach(d => d.own && R.free(d.mesh)); ENT.dyn = [];
  R.gl.deleteTexture(W.heightTex); R.gl.deleteTexture(W.colTex); W = null; ENT.animals = []; ENT.nodes = [];
};
Game.applyQuality = function () {
  const q = SET.quality; R.setShadow(q === 'high' ? 2048 : q === 'mid' ? 1024 : 0);
  R.cloudSh = R.skyOn && q !== 'low' ? 1 : 0; // v18.3 P10: cloud shadows (a little noise per pixel) are off on the lowest quality, as are shadows; ?sky=0 turns the whole new sky/fog look off
  if (R.grass) R.grass.n = q === 'high' ? 9000 : q === 'mid' ? 5000 : 0;
  Game.dpr = Math.min(window.devicePixelRatio || 1, q === 'high' ? 2 : q === 'mid' ? 1.5 : 1);
  G.UI.resize && G.UI.resize();
};
Game.snapCam = () => snapCam();
function snapCam() { CAM.tx = P.x; CAM.ty = P.y + camCfg().piv; CAM.tz = P.z; updateCamera(0, true); }
/* camera presets. Portrait phones get a farther, nearly centred over-the-shoulder view with the hero in the middle of the
   screen (above the thumb controls); landscape keeps the classic left-of-centre shoulder framing, a bit farther than before. */
const CAM_P = { dist: 4.5, run: 0.6, off: 0.26, piv: 1.22, pMin: -0.38, pMax: 0.95, pRest: 0.2, fov: 1.2 };
const CAM_L = { dist: 3.7, run: 0.5, off: 0.62, piv: 1.5, pMin: -0.45, pMax: 0.95, pRest: 0.14, fov: 1.0 };
const CAM_C = { dist: 6.2, run: 0, off: 0, piv: 1.45, pMin: -0.25, pMax: 1.2, pRest: 0.26, fov: 0.98 };
function isPortrait() { return G.UI.H > G.UI.W * 1.05; }
/* v16.8 aiming always goes over the shoulder (even in 일반 3인칭): a short boom behind the right shoulder at eye height, a
   longer lens (≈ 50–60 mm instead of ≈ 30 mm) so the target reads large, Joseph framed on the left third with lead room
   toward the target. CAM.aimK (0..1, a little more in slow motion) blends every parameter. */
const CAM_AP = { dist: 2.75, off: 0.36, piv: 1.62, fov: 1.0 }, CAM_AL = { dist: 2.0, off: 0.6, piv: 1.62, fov: 0.76 };
function camCfg() { const c = SET.view === 'classic' ? CAM_C : isPortrait() ? CAM_P : CAM_L; return c; }
Game.camCfg = camCfg;
// direct swipe-look (drag on empty screen area)
Game.camDrag = function (dx, dy) { if (G.UI.modal()) return; const c = camCfg(), s = SET.sens; CAM.yaw -= dx * 0.0062 * s; CAM.pitch = clamp(CAM.pitch + (SET.invert ? -dy : dy) * 0.0045 * s, c.pMin, c.pMax); CAM.last = 0; };

// =================================================================== OUTFIT / PLAYER LOOK
function setOutfit(key) { S.outfit = key; Game.refreshLook(); }
Game.refreshLook = function () { if (!S) return; const base = (EP.outfits && EP.outfits[S.outfit]) || EP.outfits.default; let look = base;
  const ar = S.hero && S.hero.armor && G.Combat && G.Combat.GEAR[S.hero.armor]; if (ar && ar.mantle && !base.noArmor) look = Object.assign({}, base, { mantle: ar.mantle, strap: 0x5a3a22 });
  P.look = look; // v17.2 P12: a new outfit's mesh (≈40 ms+) is built in the worker; the old one stays on screen until it is ready (render() swaps it in)
  const lk = JSON.stringify(look) + '|L0';
  if (MW.ok && P.mesh && !meshCache[lk]) { P.pend = lk; P.pendT = performance.now(); mwAsk(lk, look, 0, 0, true); } else { P.pend = null; P.mesh = lookMesh(look); }
  P.rig.body = G.Motion.bodyOf(look); P.limp = !!base.limp || !!S.flags.limp; };
Game.setOutfit = setOutfit;

// =================================================================== NPCs
function addNPC(d) {
  const n = { d, id: d.id, name: d.name, rig: new Rig(d.animal ? AB[d.animal] : d.look && d.look.kid ? HBK : HB), mesh: d.animal ? animalMesh(d.animal, d.pattern || 'plain', d.extra) : null, meshLo: null,
    x: d.x, z: d.z, y: 0, face: d.face || 0, homeFace: d.face || 0, vis: true, st: { phase: 0 }, walk: null, wander: d.wander ? { r: d.wander, cx: d.x, cz: d.z, tx: null, wait: Math.random() * 3 } : null, talking: false, act: d.act || null, scale: d.scale || 1 };
  const sp = S.npcPos[d.id]; if (sp) { n.x = sp[0]; n.z = sp[1]; if (sp[2] !== undefined) n.face = n.homeFace = sp[2]; }
  n.y = W.heightAt(n.x, n.z); n.col = W.addCol({ x: n.x, z: n.z, r: d.animal ? 0.6 : 0.42, h: 1.8 });
  ENT.npcs[d.id] = n; return n;
}
Game.npc = id => ENT.npcs[id];
Game.spawnNPC = function (d) { const n = addNPC(d); n.dyn = true; return n; };
Game.removeNPC = function (id) { const n = ENT.npcs[id]; if (!n) return; n.col.on = false; P.follow = P.follow.filter(f => f !== n); delete ENT.npcs[id]; delete S.npcPos[id]; G.UI.dropTag && G.UI.dropTag(id); };
Game.npcShow = function (id, v) { const n = ENT.npcs[id]; if (!n) return; n.forceVis = v; };
Game.npcTo = function (id, x, z, face, persist) { const n = ENT.npcs[id]; if (!n) return; if (W.avoids.length) { const q = W.avoid({ x, z }); x = q.x; z = q.z; } n.x = x; n.z = z; n.y = W.heightAt(x, z); if (face !== undefined) { n.face = n.homeFace = face; } n.col.x = x; n.col.z = z; n.walk = null; if (n.wander) { n.wander.cx = x; n.wander.cz = z; } if (persist !== false) S.npcPos[id] = [x, z, n.face]; };
Game.npcWalk = function (id, x, z, cb, speed, path) { const n = ENT.npcs[id]; if (!n) return; n.walk = { x, z, cb, sp: speed || 2.2, path: path && path.length ? path.slice() : null, stuck: 0 }; S.npcPos[id] = [x, z]; };
Game.npcFollow = function (id, on) { const n = ENT.npcs[id]; if (!n) return; n.follow = on; if (on && !P.follow.includes(n)) P.follow.push(n); if (!on) P.follow = P.follow.filter(f => f !== n); };
function npcVisible(n) { if (n.schedHidden) return false; if (n.forceVis !== undefined) return n.forceVis; return n.d.show ? n.d.show(S, Game) : true; }

// =================================================================== NODES (gathering)
const NODE = {
  olive: { n: '올리브나무', env: 'olive', r: 1.0, tree: true, fruit: 'olive' }, oak: { n: '상수리나무', env: 'oak', r: 1.1, tree: true },
  fig: { n: '무화과나무', env: 'fig', r: 1.0, tree: true, fruit: 'fig' }, palm: { n: '종려나무', env: 'palm', r: 0.8, tree: true, fruit: null },
  acacia: { n: '조각목', env: 'acacia', r: 0.8, tree: true }, poplar: { n: '버드나무', env: 'oak', r: 0.9, tree: true },
  deadwood: { n: '마른 가지', r: 0.0, give: { branch: 2 }, re: 2 }, rock: { n: '돌무더기', r: 0.0, give: { stone: 2 }, re: 3 },
  boulder: { n: '바위', r: 1.1, give: { stone: 5 }, re: 5, need: 'hammer' }, reeds: { n: '갈대', r: 0, give: { reed: 2 }, re: 2 },
  clay: { n: '진흙 구덩이', r: 0, give: { clay: 2 }, re: 2 }, straw: { n: '짚더미', r: 0, give: { straw: 2 }, re: 3 },
};
function nodeModel(type, alt) {
  const g = new GB(type.length * 7 + (alt ? 3 : 0)); const M = m4(); const r = rng(type.length * 31 + (alt ? 5 : 0));
  const t = NODE[type];
  if (t.tree) {
    if (alt) { g.cyl(0.25, 0.32, 0.5, 8, { m: M, at: [0, 0.25, 0], c: 0x8a6a48 }); g.cyl(0.24, 0.24, 0.02, 8, { m: M, at: [0, 0.51, 0], c: 0xd8b888 }); }
    else if (type === 'poplar') { g.cyl(0.16, 0.24, 3.0, 7, { m: M, at: [0, 1.5, 0], c: 0xc8c0b0 }); for (let i = 0; i < 9; i++) g.sph(0.7 + r() * 0.3, 7, 5, { m: M, at: [(r() - 0.5) * 1.2, 2.8 + i * 0.35, (r() - 0.5) * 1.2], s: [1, 1.2, 1], c: [0x7aa04a, 0x8ab058][i % 2], flat: true, j: 0.08, sw: 0.7 }); }
    else G.env[t.env](g, M, r);
  } else if (type === 'deadwood') { for (let i = 0; i < 4; i++) g.cyl(0.04, 0.05, 1.0, 5, { m: M, at: [(r() - 0.5) * 0.6, 0.06, (r() - 0.5) * 0.6], ry: r() * 6, rz: PI / 2, c: 0x7a5a3a }); }
  else if (type === 'rock') { for (let i = 0; i < 4; i++) g.sph(0.2 + r() * 0.1, 5, 4, { m: M, at: [(r() - 0.5) * 0.7, 0.1, (r() - 0.5) * 0.7], s: [1.2, 0.8, 1], c: 0xb0a690, flat: true, j: 0.08 }); }
  else if (type === 'boulder') G.env.rock(g, M, r, 0xa89c88);
  else if (type === 'reeds') G.env.reeds(g, M, r);
  else if (type === 'clay') { g.cyl(0.8, 0.9, 0.08, 10, { m: M, at: [0, 0.02, 0], c: 0x7a5038 }); g.sph(0.25, 6, 4, { m: M, at: [0.2, 0.08, 0.1], s: [1, 0.5, 1], c: 0x8a5a40 }); }
  else if (type === 'straw') { g.lathe([[0.7, 0], [0.6, 0.4], [0.3, 0.8], [0.05, 1.0]], 10, { m: M, c: 0xd8c070, j: 0.06 }); }
  else if (t.env && G.env[t.env]) G.env[t.env](g, M, r, t.envArg);
  else if (t.envX && EP && EP.envx && EP.envx[t.envX]) EP.envx[t.envX](g, M, r);
  if (alt && !t.tree) { g.cyl(0.3, 0.3, 0.02, 6, { m: M, at: [0, 0.01, 0], c: 0x8a7a60 }); }
  return g;
}
function buildNodeSets() {
  ENT.nodes = W.nodes || [];
  for (const n of ENT.nodes) if (NODE[n.type].tree && !n.col) n.col = W.addCol({ x: n.x, z: n.z, r: 0.42, h: 3 });
  for (const k in ENT.nodeSets) R.free(ENT.nodeSets[k]);
  ENT.nodeSets = {};
  refreshNodes();
}
function refreshNodes() {
  const groups = {};
  for (const n of ENT.nodes) {
    const dep = S.nodes[n.id] && S.nodes[n.id] > S.day; const key = n.type + (dep ? ':d' : '');
    if (dep && !NODE[n.type].tree) continue;
    (groups[key] = groups[key] || []).push([n.x, n.y, n.z, n.ry || 0, n.s || 1, 1, 1, 1]);
  }
  for (const k in ENT.nodeSets) ENT.nodeSets[k].n = 0;
  for (const k in groups) {
    if (!ENT.nodeSets[k]) { const [type, d] = k.split(':'); const mesh = R.mesh(nodeModel(type, !!d)); ENT.nodeSets[k] = R.inst(mesh, Math.max(64, groups[k].length + 16)); ENT.nodeSets[k].own = mesh; }
    ENT.nodeSets[k].set(groups[k]);
  }
}
for (const k in NODE) NODE[k].key = k;
Game.NODE = NODE; Game.refreshNodes = refreshNodes;
function nodeAction(n) {
  const t = NODE[n.type]; const dep = S.nodes[n.id] && S.nodes[n.id] > S.day;
  if (t.act) return dep ? null : t.act(n, S, Game); // custom finds (honey, nests…) define their own action
  if (t.tree) {
    if (dep) return null;
    if (tool('axe')) return { label: `${t.n} 베기`, anim: 'chop', dur: 0.6, hits: 3, prop: 'axe', fn: () => { const fr = t.fruit && S.flags.shook !== S.day + ':' + n.id; give('wood', 2); give('branch', 1); if (fr) give(t.fruit, 2); S.nodes[n.id] = S.day + 4; refreshNodes(); FX.burst(n.x, n.y + 1.5, n.z, 18, { c: [0.45, 0.6, 0.3], sp: 2, up: 2 }); } };
    if (S.flags['shook:' + n.id] === S.day) return null;
    return { label: '가지 흔들기', anim: 'pick', dur: 0.7, fn: () => { S.flags['shook:' + n.id] = S.day; give('branch', 1); if (t.fruit) give(t.fruit, 2); FX.burst(n.x, n.y + 2.2, n.z, 14, { c: [0.5, 0.65, 0.3], sp: 1.4, up: 0.5, g: 2 }); } };
  }
  if (dep) return null;
  if (t.need && !tool(t.need)) return { label: `${TOOLS[t.need]}가 필요해요`, disabled: true };
  const lab = t.label || { deadwood: '가지 줍기', rock: '돌 줍기', boulder: '바위 깨기', reeds: '갈대 베기', clay: '진흙 뜨기', straw: '짚 모으기' }[n.type] || `${t.n} 줍기`;
  return { label: lab, anim: n.type === 'boulder' ? 'mine' : 'gather', dur: n.type === 'boulder' ? 0.6 : 0.65, hits: n.type === 'boulder' ? 3 : 1, prop: n.type === 'boulder' ? 'hammer' : null, fn: () => { for (const k in t.give) give(k, t.give[k]); S.nodes[n.id] = S.day + t.re; refreshNodes(); FX.burst(n.x, n.y + 0.3, n.z, 10, { c: [0.75, 0.68, 0.55], sp: 1.2, up: 1.5 }); } };
}

// =================================================================== FARMING
function fields() { return (EP.fields || []).filter(f => !f.lock || S.unlocked[f.id]); }
function tileAt(x, z) {
  for (const f of fields()) {
    const ca = Math.cos(f.ry || 0), sa = Math.sin(f.ry || 0), dx = x - f.x, dz = z - f.z;
    const lx = dx * ca - dz * sa, lz = dx * sa + dz * ca;
    const ts = f.ts || 1.6, w = f.cols * ts, d = f.rows * ts;
    if (Math.abs(lx) < w / 2 && Math.abs(lz) < d / 2) {
      const i = Math.floor((lx + w / 2) / ts), j = Math.floor((lz + d / 2) / ts);
      const cx = -w / 2 + (i + 0.5) * ts, cz = -d / 2 + (j + 0.5) * ts;
      return { f, i, j, id: f.id + ':' + i + ',' + j, x: f.x + cx * ca + cz * sa, z: f.z - cx * sa + cz * ca, ts };
    }
  }
  return null;
}
Game.tileAt = tileAt;
function plot(id) { return S.plots[id] || { s: 0 }; }
function setPlot(id, v) { S.plots[id] = v; ENT.plotsDirty = true; }
function cropStages(c) { return CROPS[c].days.length + 1; }
function plotAction(t) {
  const p = plot(t.id);
  if (p.s === 0) { if (!tool('hoe')) return { label: '괭이가 필요해요', disabled: true }; return { label: '밭 갈기', anim: 'hoe', dur: 0.55, prop: 'hoe', repeat: true, fn: () => { setPlot(t.id, { s: 1 }); stat('tilled'); FX.burst(t.x, W.heightAt(t.x, t.z) + 0.1, t.z, 12, { c: [0.45, 0.33, 0.22], sp: 1.4, up: 1.6 }); } }; }
  if (p.s === 1) {
    const seed = curSeed(); if (!seed) return { label: '씨앗이 없어요', disabled: true, seedless: true };
    return { label: `${ITEMS[seed].n.replace(' 씨앗', '')} 심기`, anim: 'plant', dur: 0.5, repeat: true, fn: () => { if (!take(seed)) return; setPlot(t.id, { s: 2, c: ITEMS[seed].crop, st: 0, g: 0, w: S.weather === 'rain' ? 1 : 0 }); stat('planted'); FX.burst(t.x, W.heightAt(t.x, t.z) + 0.1, t.z, 6, { c: [0.6, 0.5, 0.3], sp: 0.6, up: 1 }); } };
  }
  if (p.s === 2) {
    const mature = p.st >= cropStages(p.c) - 1;
    if (mature) {
      const cr = CROPS[p.c]; if (cr.sickle && !tool('sickle')) return { label: '낫이 필요해요', disabled: true };
      return { label: `${cr.n} 거두기`, anim: 'harvest', dur: 0.55, prop: cr.sickle ? 'sickle' : null, repeat: true, fn: () => {
        const n = cr.y[0] + Math.floor(Math.random() * (cr.y[1] - cr.y[0] + 1)) + (S.flags.blessed ? 1 : 0); give(p.c, n); if (cr.straw) give('straw', cr.straw, true);
        if (Math.random() < 0.7) give(cr.seed, 1, true); S.stats.harvest[p.c] = (S.stats.harvest[p.c] || 0) + n; setPlot(t.id, { s: 1 });
        FX.burst(t.x, W.heightAt(t.x, t.z) + 0.6, t.z, 14, { c: [0.95, 0.8, 0.35], sp: 1.6, up: 2 }); } };
    }
    if (!p.w) { const wm = water(); if (wm <= 0) return { label: '항아리에 물이 없어요', disabled: true, needWater: true }; return { label: '물 주기', anim: 'water', dur: 0.6, prop: 'jar', repeat: true, fn: () => { S.water--; p.w = 1; ENT.plotsDirty = true; stat('watered'); FX.burst(t.x, W.heightAt(t.x, t.z) + 0.8, t.z, 16, { c: [0.6, 0.8, 1.0], sp: 0.8, up: 0.2, g: 6, size: 0.1 }); } }; }
    return null;
  }
  return null;
}
function water() { return (tool('jar') || tool('bigjar')) ? S.water : 0; }
Game.water = water;
function curSeed() {
  const seeds = Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].cat === 'seed' && S.inv[k] > 0);
  if (!seeds.length) return null; if (!seeds.includes(S.seedSel)) S.seedSel = seeds[0]; return S.seedSel;
}
Game.curSeed = curSeed;
Game.cycleSeed = function () { const seeds = Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].cat === 'seed' && S.inv[k] > 0); if (!seeds.length) { G.UI.toast('씨앗이 없어요'); return; } const i = seeds.indexOf(S.seedSel); S.seedSel = seeds[(i + 1) % seeds.length]; G.UI.hud(); };
function growCrops() {
  for (const id in S.plots) {
    const p = S.plots[id]; if (p.s !== 2) continue;
    const cr = CROPS[p.c]; const last = cropStages(p.c) - 1;
    if ((p.w || S.irrigated && S.irrigated[id.split(':')[0]]) && p.st < last) { p.g++; if (p.g >= cr.days[p.st]) { p.st++; p.g = 0; } }
    p.w = S.weather === 'rain' ? 1 : 0;
  }
  ENT.plotsDirty = true;
}
function cropModel(c, st, last) {
  const g = new GB(c.length * 13 + st); const r = rng(c.length * 7 + st); const k = st / last;
  const grain = c === 'barley' || c === 'wheat';
  if (st === 0) { for (let i = 0; i < 4; i++) g.cyl(0.0, 0.015, 0.14, 3, { at: [(r() - 0.5) * 0.9, 0.07, (r() - 0.5) * 0.9], c: 0x7aa84a, sw: 0.3 }); return g; }
  if (grain) {
    const n = 14, h = 0.35 + k * 0.75, mature = st === last, col = mature ? (c === 'wheat' ? 0xe0b040 : 0xd8c060) : 0x78a848;
    for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 1.3, z = (r() - 0.5) * 1.3; g.cyl(0.006, 0.014, h, 3, { at: [x, h / 2, z], rz: (r() - 0.5) * 0.2, c: col, sw: (a, y) => (y + h / 2) / h * 0.8 });
      if (st >= last - 1) g.sph(0.04, 4, 3, { at: [x, h + 0.04, z], s: [0.8, c === 'wheat' ? 1.8 : 2.4, 0.8], c: mature ? (c === 'wheat' ? 0xd8a030 : 0xe8d070) : 0x8ab858, sw: 1 }); }
  } else if (c === 'lentil') { for (let i = 0; i < 6; i++) g.sph(0.14 + k * 0.12, 6, 4, { at: [(r() - 0.5) * 1.0, 0.12 + k * 0.1, (r() - 0.5) * 1.0], s: [1, 0.7, 1], c: [0x6a9a3a, 0x7aa848][i % 2], flat: true, sw: 0.4 }); if (st === last) for (let i = 0; i < 10; i++) g.sph(0.035, 4, 3, { at: [(r() - 0.5) * 1.0, 0.22 + r() * 0.12, (r() - 0.5) * 1.0], c: 0xc0603a, sw: 0.4 }); }
  else if (c === 'flax') { const h = 0.3 + k * 0.7; for (let i = 0; i < 12; i++) { const x = (r() - 0.5) * 1.2, z = (r() - 0.5) * 1.2; g.cyl(0.005, 0.01, h, 3, { at: [x, h / 2, z], c: 0x6a9a48, sw: (a, y) => (y + h / 2) / h }); if (st === last) g.sph(0.045, 5, 3, { at: [x, h, z], s: [1, 0.5, 1], c: 0x6a8ad8, sw: 1 }); } }
  else if (c === 'cucumber') { for (let i = 0; i < 5; i++) g.sph(0.16 + k * 0.1, 6, 4, { at: [(r() - 0.5) * 1.0, 0.1, (r() - 0.5) * 1.0], s: [1.3, 0.5, 1.3], c: 0x5a8a38, flat: true, sw: 0.3 }); if (st >= last - 1) for (let i = 0; i < 4; i++) g.sph(0.05, 5, 4, { at: [(r() - 0.5) * 0.9, 0.16, (r() - 0.5) * 0.9], c: 0xe8c840 }); if (st === last) for (let i = 0; i < 4; i++) g.cyl(0.05, 0.05, 0.28, 6, { at: [(r() - 0.5) * 0.9, 0.08, (r() - 0.5) * 0.9], rz: PI / 2, ry: r() * 3, c: 0x3a7a30 }); }
  else if (c === 'onion') { for (let i = 0; i < 8; i++) { const x = (r() - 0.5) * 1.1, z = (r() - 0.5) * 1.1, h = 0.18 + k * 0.35; g.cyl(0.006, 0.02, h, 4, { at: [x, h / 2, z], rz: (r() - 0.5) * 0.4, c: 0x6aa048, sw: 0.5 }); if (st === last) g.sph(0.07, 6, 5, { at: [x, 0.04, z], c: 0xd8a870 }); } }
  return g;
}
function rebuildFarm() {
  ENT.plotsDirty = false;
  const soil = []; const groups = {};
  const quad = (t, wet) => {
    const f = t.f, ts = t.ts * 0.94, ca = Math.cos(f.ry || 0), sa = Math.sin(f.ry || 0); const c = wet ? [0.30, 0.21, 0.15] : [0.48, 0.35, 0.24];
    for (let k = 0; k < 3; k++) { // furrows
      const off = (k - 1) * ts / 3; const hw = ts / 2, hd = ts / 7.5;
      const pts = [[-hw, off - hd], [hw, off - hd], [hw, off + hd], [-hw, off + hd]].map(([u, v]) => { const x = t.x + u * ca + v * sa, z = t.z - u * sa + v * ca; return [x, W.heightAt(x, z) + 0.05 + (k === 1 ? 0.0 : 0), z]; });
      const add = (a) => soil.push(a[0], a[1], a[2], 0, 1, 0, c[0] * (k % 2 ? 0.88 : 1), c[1] * (k % 2 ? 0.88 : 1), c[2] * (k % 2 ? 0.88 : 1), 0, 0);
      add(pts[0]); add(pts[2]); add(pts[1]); add(pts[0]); add(pts[3]); add(pts[2]);
    }
  };
  for (const f of fields()) {
    const ts = f.ts || 1.6;
    for (let i = 0; i < f.cols; i++) for (let j = 0; j < f.rows; j++) {
      const id = f.id + ':' + i + ',' + j; const p = S.plots[id]; if (!p || !p.s) continue;
      const ca = Math.cos(f.ry || 0), sa = Math.sin(f.ry || 0), cx = -f.cols * ts / 2 + (i + 0.5) * ts, cz = -f.rows * ts / 2 + (j + 0.5) * ts;
      const t = { f, ts, x: f.x + cx * ca + cz * sa, z: f.z - cx * sa + cz * ca };
      quad(t, p.s === 2 && p.w);
      if (p.s === 2) { const key = p.c + ':' + p.st; (groups[key] = groups[key] || []).push([t.x, W.heightAt(t.x, t.z) + 0.04, t.z, (f.ry || 0) + ((i * 7 + j * 3) % 4) * PI / 2, ts / 1.6, 1, 1, 1]); }
    }
  }
  if (!ENT.soilMesh) ENT.soilMesh = R.mesh(new Float32Array(soil.length ? soil : new Array(11).fill(0)));
  else R.updateMesh(ENT.soilMesh, new Float32Array(soil.length ? soil : new Array(11).fill(0)));
  ENT.soilMesh.bs = [0, 0, 0, 1e6];
  for (const k in ENT.cropSets) ENT.cropSets[k].n = 0;
  for (const k in groups) {
    if (!ENT.cropSets[k]) { const [c, st] = k.split(':'); const mesh = R.mesh(cropModel(c, +st, cropStages(c) - 1)); ENT.cropSets[k] = R.inst(mesh, 256); ENT.cropSets[k].shadow = false; }
    ENT.cropSets[k].set(groups[k]);
  }
}
Game.plotStats = function (fieldId) { let tilled = 0, planted = 0, watered = 0, mature = 0; for (const id in S.plots) { if (fieldId && !id.startsWith(fieldId + ':')) continue; const p = S.plots[id]; if (p.s >= 1) tilled++; if (p.s === 2) { planted++; if (p.w) watered++; if (p.st >= cropStages(p.c) - 1) mature++; } } return { tilled, planted, watered, mature }; };

// =================================================================== HERDS
function pen(id) { return (EP.pens || []).find(p => p.id === id); }
function herd(id) { return S.herds[id]; }
Game.pen = pen; Game.herd = herd;
function herdCount(id, f) { const h = S.herds[id]; if (!h) return 0; return h.list.filter(a => !f || f(a)).length; }
Game.herdCount = herdCount;
Game.countAll = function (owner, sp, pats) { let n = 0; for (const p of EP.pens || []) { if (owner && p.owner !== owner) continue; n += herdCount(p.id, a => (!sp || a[0] === sp) && (!pats || pats.includes(a[1]))); } return n; };
Game.addAnimal = function (penId, sp, pat, sex, age) { const h = S.herds[penId]; h.list.push([sp, pat, sex === undefined ? (Math.random() < 0.5 ? 0 : 1) : sex, age === undefined ? 10 : age]); refreshAnimals(penId); };
Game.removeAnimals = function (penId, n, f) { const h = S.herds[penId]; let k = 0; for (let i = h.list.length - 1; i >= 0 && k < n; i--) if (!f || f(h.list[i])) { h.list.splice(i, 1); k++; } refreshAnimals(penId); return k; };
function herdDay() {
  for (const p of EP.pens || []) {
    const h = S.herds[p.id]; if (!h || !h.list.length) { if (h) h.joy = 0; continue; }
    const n = h.list.length; const need = Math.max(1, Math.ceil(n / 12));
    const drank = h.trough >= need; if (drank) h.trough = Math.max(0, h.trough - need);
    const fed = p.pasture !== false || (h.hay >= Math.ceil(n / 8)); if (p.pasture === false && fed) h.hay -= Math.ceil(n / 8);
    const happy = drank && fed; h.joy = happy ? Math.min(100, h.joy + 25) : Math.max(0, h.joy - 30); h.happyToday = happy;
    if (happy) h.happyDays = (h.happyDays || 0) + 1;
    h.list.forEach(a => a[3]++);
    if (happy) {
      h.woolDays++; if (h.woolDays >= 2) h.wool = true; h.milk = true;
      // breeding
      const cap = (p.cap || 30) + (S.capBonus && S.capBonus[p.id] || 0);
      for (const sp of ['sheep', 'goat', 'cow', 'camel', 'donkey']) {
        const fem = h.list.filter(a => a[0] === sp && a[2] === 0 && a[3] >= 4), mal = h.list.filter(a => a[0] === sp && a[2] === 1 && a[3] >= 4);
        if (!fem.length || !mal.length) continue;
        const rate = sp === 'sheep' || sp === 'goat' ? 0.22 : 0.08;
        let births = 0; for (const f of fem) if (Math.random() < rate * (h.joy / 100 + 0.3)) births++;
        for (let b = 0; b < births; b++) {
          if (h.list.length >= cap && !EP.birthDest) break;
          const mom = fem[Math.floor(Math.random() * fem.length)];
          let pat = Math.random() < 0.85 ? mom[1] : h.list[Math.floor(Math.random() * h.list.length)][1];
          if (h.rods > 0 && (sp === 'sheep' || sp === 'goat') && mom[3] > 6 && EP.rodPattern) pat = EP.rodPattern(sp, S) || pat;
          const baby = [sp, pat, Math.random() < 0.5 ? 0 : 1, 0];
          const dest = EP.birthDest ? EP.birthDest(p, baby, S) : p.id;
          const dh = S.herds[dest] || h, dp = pen(dest) || p; if (dh.list.length >= (dp.cap || 30) + (S.capBonus && S.capBonus[dp.id] || 0)) continue;
          dh.list.push(baby); stat('born');
          S.stats.bornPat = S.stats.bornPat || {}; S.stats.bornPat[pat] = (S.stats.bornPat[pat] || 0) + 1;
        }
      }
    }
    if (h.rods > 0) h.rods--;
  }
  refreshAnimals();
}
Game.penAction = function (id, what) {
  const h = herd(id), p = pen(id); if (!h) return;
  const sheep = h.list.filter(a => a[0] === 'sheep' && a[3] >= 4).length, goats = h.list.filter(a => (a[0] === 'goat' || a[0] === 'cow') && a[2] === 0 && a[3] >= 4).length;
  if (what === 'water') { const need = 12 - h.trough; if (S.water <= 0) { G.UI.toast('항아리에 물을 먼저 길어 오세요'); return; } const u = Math.min(need, S.water); h.trough += u; S.water -= u; G.UI.toast(`구유에 물을 채웠다 (${h.trough}/12)`); stat('troughFill'); }
  if (what === 'hay') { const u = Math.min(inv('hay'), 20); if (!u) { G.UI.toast('꼴이 없어요'); return; } take('hay', u); h.hay += u; G.UI.toast(`꼴 ${u}을 주었다`); }
  if (what === 'shear') { if (!tool('shears')) { G.UI.toast('양털 가위가 필요해요'); return; } if (!h.wool || !sheep) { G.UI.toast('아직 깎을 털이 없어요'); return; } const n = Math.min(sheep, 16) * 2; give('wool', n); h.wool = false; h.woolDays = 0; stat('sheared', n); P.act = 'shear'; P.actT = 0; P.actDur = 0.8; }
  if (what === 'milk') { if (!h.milk || !goats) { G.UI.toast('지금은 젖을 짤 수 없어요'); return; } const n = Math.min(goats, 10); give('milk', n); h.milk = false; stat('milked', n); P.act = 'milk'; P.actT = 0; P.actDur = 0.8; }
  if (what === 'rods') { if (!take('rod', 2)) { G.UI.toast('껍질 벗긴 가지 2개가 필요해요'); return; } h.rods = 3; G.UI.toast('물구유 앞에 가지를 세웠다 (3일)'); S.flags.rodsUsed = (S.flags.rodsUsed || 0) + 1; }
  G.UI.hud(); if (EP.onPen) EP.onPen(id, what, S, Game); checkStep();
};
// representative animals rendered in pens
function refreshAnimals(only) {
  ENT.animals = ENT.animals.filter(a => only && a.pen !== only && !a.follow);
  for (const p of EP.pens || []) {
    if (only && p.id !== only) continue; const h = S.herds[p.id]; if (!h || p.hidden && p.hidden(S)) continue;
    const list = h.list; const maxR = p.show || 12; const step = Math.max(1, list.length / maxR);
    for (let i = 0; i < Math.min(list.length, maxR); i++) {
      const a = list[Math.floor(i * step)]; const ang = Math.random() * PI * 2, rr = Math.random();
      const ax = p.x + (Math.random() - 0.5) * (p.w - 2), az = p.z + (Math.random() - 0.5) * (p.d - 2);
      ENT.animals.push({ pen: p.id, sp: a[0], pat: a[1], lamb: a[3] < 4, mesh: animalMesh(a[0], a[1]), rig: new Rig(AB[a[0]]), x: ax, z: az, y: W.heightAt(ax, az), face: ang, tx: null, tz: null, wait: Math.random() * 4, phase: 0, graze: false, seed: Math.random() * 10 });
    }
  }
}
Game.refreshAnimals = refreshAnimals;

// =================================================================== SITES (construction)
function siteBuilt(id) { return !!S.built[id]; }
Game.siteBuilt = siteBuilt;
Game.build = function (site) {
  if (site.silver && S.silver < site.silver) { G.UI.toast('은이 부족해요'); return false; }
  for (const k in site.cost || {}) if (!have(k, site.cost[k])) { G.UI.toast(`${ITEMS[k].n}이(가) 부족해요`); return false; }
  for (const k in site.cost || {}) take(k, site.cost[k]); if (site.silver) silver(-site.silver);
  S.built[site.id] = S.day; applySite(site); G.UI.toast(`완성 · ${site.n}`); FX.burst(site.x, W.heightAt(site.x, site.z) + 1, site.z, 40, { c: [1, 0.9, 0.6], sp: 3, up: 3 });
  if (site.onBuilt) site.onBuilt(S, Game); checkStep(); Game.save(true); return true;
};
/* customised, staged construction (v11): sites with `work` stages are paid for up front, then raised by hand —
   each press of A is a round of hammering (and breath); the model grows stage by stage, then it is finished */
Game.siteStart = function (site, opt) {
  if (site.silver && S.silver < site.silver) { G.UI.toast('은이 부족해요'); return false; }
  const cost = Game.siteCost(site, opt); for (const k in cost) if (!have(k, cost[k])) { G.UI.toast(`${ITEMS[k].n}이(가) 부족해요`); return false; }
  for (const k in cost) take(k, cost[k]); if (site.silver) silver(-site.silver);
  S.siteWork = S.siteWork || {}; S.siteWork[site.id] = { opt, n: 0 }; buildSiteMeshes(); sfx('hammer'); G.UI.toast(`터를 닦았어요 · ${site.n} 곁에서 A를 눌러 지어 올려요`); Game.save(true); return true;
};
Game.siteCost = function (site, opt) { const c = Object.assign({}, site.cost || {}); if (opt && site.opts) for (const k in opt) { const o = (site.opts[k] || []).find(e => e[0] === opt[k]); if (o && o[3]) for (const i in o[3]) c[i] = (c[i] || 0) + o[3][i]; } return c; };
Game.siteWork = function (site) {
  const pr = S.siteWork && S.siteWork[site.id]; if (!pr) return; if (G.Vitals) G.Vitals.spend(6);
  pr.n++; FX.burst(site.x, W.heightAt(site.x, site.z) + 1.2, site.z, 16, { c: [0.85, 0.75, 0.55], sp: 1.6, up: 1.6, spread: 2 });
  if (pr.n >= site.work) { S.siteOpt = S.siteOpt || {}; S.siteOpt[site.id] = pr.opt; delete S.siteWork[site.id];
    S.built[site.id] = S.day; applySite(site); G.UI.toast(`완성 · ${site.n}`); sfx('craft'); haptic('quest'); FX.burst(site.x, W.heightAt(site.x, site.z) + 1, site.z, 40, { c: [1, 0.9, 0.6], sp: 3, up: 3 });
    if (site.onBuilt) site.onBuilt(S, Game); checkStep(); Game.save(true); }
  else { buildSiteMeshes(); G.UI.toast(`${site.n} · ${(site.stages || [])[pr.n - 1] || '일'} 끝 (${pr.n}/${site.work})`); }
};
function applySite(site) { applySiteFx(site); ENT.plotsDirty = true; buildSiteMeshes(); }
function applySiteFx(site) {
  const fx = site.effect || {};
  if (fx.field) S.unlocked[fx.field] = true;
  if (fx.cap) { S.capBonus = S.capBonus || {}; S.capBonus[fx.cap[0]] = (fx.cap[1]); }
  if (fx.irrigate) { S.irrigated = S.irrigated || {}; S.irrigated[fx.irrigate] = true; }
}
function buildSiteMeshes() {
  ENT.dyn = ENT.dyn.filter(d => !d.site);
  for (const s of ENT.sites) {
    const built = siteBuilt(s.id); if (!built && !(s.avail ? s.avail(S) : true)) continue;
    const pr = S.siteWork && S.siteWork[s.id], opt = (built ? S.siteOpt && S.siteOpt[s.id] : pr && pr.opt) || null;
    const key = 'site:' + s.id + ':' + (built ? 1 : 0) + (opt && s.modelOpt ? ':' + JSON.stringify(opt) : '') + (pr && !built ? ':w' + pr.n : '');
    if (!meshCache[key]) { const g = new GB(5); const M = m4(); if (opt && s.modelOpt) s.modelOpt(g, M, rng(7), opt, built ? 1 : pr.n / s.work); else if (built) s.model(g, M, rng(7)); else { // scaffold
        const w = s.w || 4, d = s.d2 || s.w || 4; for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) g.cyl(0.06, 0.07, 1.2, 5, { m: M, at: [x, 0.6, z], c: 0x8a6a48 });
        g.box(w, 0.04, 0.04, { m: M, at: [0, 1.0, -d / 2], c: 0xe8d8b0 }); g.box(w, 0.04, 0.04, { m: M, at: [0, 1.0, d / 2], c: 0xe8d8b0 }); g.box(0.04, 0.04, d, { m: M, at: [-w / 2, 1.0, 0], c: 0xe8d8b0 }); g.box(0.04, 0.04, d, { m: M, at: [w / 2, 1.0, 0], c: 0xe8d8b0 });
        g.box(0.6, 0.5, 0.06, { m: M, at: [w / 2 + 0.4, 0.9, d / 2], ry: -0.3, c: 0xd8c8a0 }); }
      meshCache[key] = R.mesh(g); }
    ENT.dyn.push({ site: s.id, mesh: meshCache[key], m: m4trs(m4(), s.x, W.heightAt(s.x, s.z) + (s.dy || 0), s.z, s.ry || 0) });
    if (built && s.col && !s._col) s._col = W.addCol(Object.assign({ x: s.x, z: s.z, a: s.ry || 0, cam: s.col.h > 2.5 }, s.col));
  }
}
Game.buildSiteMeshes = buildSiteMeshes;

// =================================================================== TIME
const SEC_PER_HOUR = 22;
function newDay(msg) {
  PM.n('newDay');
  if (G.Vitals) setTimeout(() => G.Vitals.mark('sleep'), 900);
  S.day++; S.time = 6;
  if (G.Weather) G.Weather.onDay(S); else S.weather = EP.rain && Math.random() < EP.rain ? 'rain' : 'clear';
  growCrops(); herdDay(); refreshNodes();
  if (G.Combat) G.Combat.onDay(); if (G.Loot) G.Loot.onDay(); if (S.hero) { S.hero.hp = S.hero.hpMax; }
  if (EP.onDay) EP.onDay(S, Game);
  if (G.Surv) G.Surv.onDay(S); if (G.Ride) G.Ride.onDay(S); if (G.NpcAI) G.NpcAI.onDay(S);
  P.stam = (S.hero && S.hero.stamMax) || 100; Game.save(true);
  G.UI.dayCard(S.day, S.weather, msg);
  checkStep();
}
Game.sleep = function (msg) { G.UI.fade(() => { newDay(msg); }, () => { }); };
Game.newDay = newDay;
Game.setTime = h => { S.time = h; };
Game.skipDays = function (n) { for (let i = 0; i < n; i++) { S.day++; S.weather = 'clear'; for (const id in S.plots) if (S.plots[id].s === 2) S.plots[id].w = 1; growCrops(); for (const p of EP.pens || []) if (S.herds[p.id]) S.herds[p.id].trough = 12; herdDay(); } S.time = 7; refreshNodes(); G.UI.hud(); };

// =================================================================== QUEST ENGINE
const Q = Game.Q = {};
Game.go = function (id, resume) {
  const st = EP.steps[id]; if (!st) { console.warn('no step', id); return; }
  S.step = id; Q.cur = st; Q.doneFor = null;
  if (st.enter) st.enter(S, Game, !!resume);
  if (!resume) featCheck(false);
  G.UI.quest(); Game.save(true);
  if (!resume && st.ch && Game.mode === 'play') { sfx('quest'); haptic('quest'); }
};
function checkStep() {
  if (Game.mode !== 'play' || !S) return; const st = EP.steps[S.step]; if (!st || !st.check) return; if (G.UI.busy() || (G.Cine && G.Cine.on)) return;
  // a step's done() often plays a cutscene and only calls next() at its end: run it once, never again while it is still playing
  if (Q.doneFor === S.step) return;
  if (st.check(S, Game)) { const nx = st.next, me = S.step; Q.doneFor = me; if (st.done) st.done(S, Game, () => { if (S.step === me) { Q.doneFor = null; nx && Game.go(nx); } }); else if (nx) Game.go(nx); else Q.doneFor = null; }
}
Game.checkStep = checkStep;
Game.step = () => EP.steps[S.step];
Game.target = function () {
  const st = EP.steps[S.step];
  let t = st && st.target ? (typeof st.target === 'function' ? st.target(S, Game) : st.target) : null;
  if (S.wp) { if (Math.hypot(S.wp.x - P.x, S.wp.z - P.z) < 6) { G.UI.toast(`${S.wp.n || '표시한 곳'}에 도착했어요`); S.wp = null; } else return { x: S.wp.x, z: S.wp.z, wp: true }; }
  if (!t && G.Life) { const tr = G.Life.tracked(S); if (tr && tr.q) t = G.Life.qOk(S, tr.id) ? 'npc:' + tr.q.giver : (typeof tr.q.loc === 'function' ? tr.q.loc(S) : tr.q.loc) || null; }
  if (!t) return null;
  if (typeof t === 'string') {
    const [k, id] = t.split(':');
    if (k === 'npc') { const n = ENT.npcs[id]; return n ? { x: n.x, z: n.z, npc: id } : null; }
    if (k === 'site') { const s = ENT.sites.find(x => x.id === id); return s ? { x: s.x, z: s.z } : null; }
    if (k === 'pen') { const p = pen(id); return p ? { x: p.gx === undefined ? p.x : p.gx, z: p.gz === undefined ? p.z : p.gz } : null; }
    if (k === 'field') { const f = (EP.fields || []).find(x => x.id === id); return f ? { x: f.x, z: f.z } : null; }
    if (k === 'spot') { const s = EP.spots[id]; return s ? { x: s[0], z: s[1] } : null; }
    if (k === 'node') { let b = null, bd = 1e9; for (const n of ENT.nodes) { if (!id.split(',').includes(n.type)) continue; if (S.nodes[n.id] > S.day) continue; const d = Math.hypot(n.x - P.x, n.z - P.z); if (d < bd) { bd = d; b = n; } } return b; }
  }
  return t;
};

// =================================================================== INTERACTION RESOLUTION
let ctx = null; Game.ctx = () => ctx;
function resolveContext() {
  const cands = [];
  const fx = Math.sin(P.face), fz = Math.cos(P.face);
  // specials
  for (const sp of ENT.specials) {
    if (sp.on && !sp.on(S, Game)) continue; const d = Math.hypot(sp.x - P.x, sp.z - P.z); if (d > (sp.r || 2.4)) continue;
    cands.push({ d: d - 1.5, label: typeof sp.label === 'function' ? sp.label(S, Game) : sp.label, x: sp.x, z: sp.z, y: sp.y || 1.6, use: () => sp.use(S, Game), key: 'sp:' + sp.id, reach: sp.reach || 0.8 }); // v16.6: step right up to the thing you pick up
  }
  // npcs
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n.vis || n.d.noTalk) continue; const d = Math.hypot(n.x - P.x, n.z - P.z); if (d > (n.d.talkR || 2.6)) continue;
    cands.push({ d: d - 0.6, label: n.d.label || '말하기', x: n.x, z: n.z, yAbs: n.y + (n.d.animal ? 1.4 : 2.1) * (n.scale || 1), use: () => talkTo(id), key: 'npc:' + id, npc: id }); }
  // stations
  for (const st of EP.stations || []) { if (st.on && !st.on(S, Game)) continue; const d = Math.hypot(st.x - P.x, st.z - P.z); if (d > (st.r || 2.4)) continue;
    const a = stationAction(st); if (a) cands.push(Object.assign({ d, x: st.x, z: st.z, y: 1.4, key: 'st:' + st.id }, a)); }
  // pens
  for (const p of EP.pens || []) { if (p.hidden && p.hidden(S)) continue; const gx = p.gx === undefined ? p.x : p.gx, gz = p.gz === undefined ? p.z : p.gz; const d = Math.hypot(gx - P.x, gz - P.z); if (d > 3) continue;
    cands.push({ d: d + 0.2, label: `${p.n} 돌보기`, x: gx, z: gz, y: 1.4, use: () => G.UI.pen(p.id), key: 'pen:' + p.id }); }
  // sites
  for (const s of ENT.sites) { if (siteBuilt(s.id) || (s.avail && !s.avail(S))) continue; const d = Math.hypot(s.x - P.x, s.z - P.z); if (d > (s.r || 4)) continue;
    const pr = S.siteWork && S.siteWork[s.id];
    if (pr) { cands.push({ d: d + 0.3, label: `${s.n} 짓기 · ${(s.stages || [])[pr.n] || '일하기'} (${pr.n + 1}/${s.work})`, x: s.x, z: s.z, y: 1.6, anim: 'hoe', dur: 0.55, hits: 3, prop: 'hammer', fn: () => Game.siteWork(s), key: 'site:' + s.id, repeat: true }); continue; }
    cands.push({ d: d + 0.3, label: `${s.n} 짓기`, x: s.x, z: s.z, y: 1.6, use: () => G.UI.site(s), key: 'site:' + s.id }); }
  // plot ahead
  const t = tileAt(P.x + fx * 1.05, P.z + fz * 1.05) || tileAt(P.x, P.z);
  if (t) { const a = plotAction(t); if (a) cands.push(Object.assign({ d: 0.6, x: t.x, z: t.z, y: 0.8, tile: t, key: 'plot:' + t.id }, a)); }
  // nodes
  for (const n of ENT.nodes) { const d = Math.hypot(n.x - P.x, n.z - P.z) - NODE[n.type].r; if (d > 1.6) continue; const a = nodeAction(n); if (a) cands.push(Object.assign({ d: d + 0.1, x: n.x, z: n.z, yAbs: n.y + (NODE[n.type].tree ? 2.4 : 0.9), node: n, key: 'node:' + n.id, repeat: true }, a)); }
  if (G.Combat) for (const c of G.Combat.context()) cands.push(c);
  for (const pv of Game.CTX) { const cs = pv(S, Game); if (cs) for (const c of cs) if (c) cands.push(c); }
  if (EP.context) for (const c of EP.context(S, Game) || []) cands.push(c);
  // between two things at about the same distance, take the one in front of the hero (up to 0.5 m of preference)
  for (const c of cands) if (c.x !== undefined && !c.tile) { const dd = Math.hypot(c.x - P.x, c.z - P.z); if (dd > 0.3) c.d += (1 - ((c.x - P.x) * fx + (c.z - P.z) * fz) / dd) * 0.25; }
  cands.sort((a, b) => a.d - b.d);
  return cands[0] || null;
}
function stationAction(st) {
  if (st.type === 'well') { const mx = S.jarMax; if (!(tool('jar') || tool('bigjar'))) return { label: '물항아리가 없어요', disabled: true }; if (S.water >= mx) return { label: '항아리가 가득 찼어요', disabled: true }; return { label: '물 긷기', anim: 'pick', dur: 1.1, hits: 2, prop: 'jar', well: st.rim || 1.75, fn: () => { /* v16.6: drawn over the rim (stand at the well, reach in) */ S.water = mx; G.UI.toast(`물을 길었다 (${mx}/${mx})`); G.UI.hud(); FX.burst(st.x, W.heightAt(st.x, st.z) + 0.8, st.z, 14, { c: [0.6, 0.8, 1], sp: 1, up: 1.5 }); checkStep(); } }; }
  if (st.type === 'bed') return { label: '잠자기', use: () => G.UI.sleepAsk() };
  if (st.type === 'fire' && G.Hearth) return { label: '모닥불에서 요리하기', use: () => G.Hearth.open(st) };
  if (st.type === 'fire' || st.type === 'loom' || st.type === 'press') return { label: st.type === 'fire' ? '모닥불에서 요리하기' : st.type === 'loom' ? '베틀에서 짜기' : '기름틀 쓰기', use: () => G.UI.menu('craft') };
  if (st.type === 'shop') return { label: st.label || '장터', use: () => G.UI.shop(st.shop) };
  if (st.type === 'smith') return { label: '화덕에서 장비 손보기', use: () => G.UI.menu('gear') };
  if (st.type === 'tan') return { label: '가죽 무두질하기', use: () => G.UI.menu('craft') };
  if (st.type === 'custom') return st.action(S, Game);
  return null;
}
Game.nearStation = function (type) { for (const st of EP.stations || []) { if (st.type !== type) continue; if (st.on && !st.on(S, Game)) continue; if (Math.hypot(st.x - P.x, st.z - P.z) < 6) return true; } return false; };
function talkTo(id) {
  const n = ENT.npcs[id]; n.talking = true; n.lookAt = true;
  if (P.cpose && !P.cpose.hold) P.cpose = null; if (P.emote && G.Acts) G.Acts.stop(); // stop a passing gesture (stretch, wave…) before speaking
  if (!n.d.animal) { P.face = Math.atan2(n.x - P.x, n.z - P.z); Game.dlgNpc = n; }
  const st = EP.steps[S.step]; let h = st && st.talk && st.talk[id];
  const done = () => { n.talking = false; };
  if (h) { const r = h(S, Game); if (r === false) { } else return; }
  if (G.Life && G.Life.talk(id)) return;
  if (G.NpcAI && G.NpcAI.talk(n)) return;
  const def = EP.talk && EP.talk[id]; if (def) { if (def(S, Game) !== false) return; }
  let chat = null; if (n.d.chat) { const ls = typeof n.d.chat === 'function' ? n.d.chat(S, Game) : n.d.chat; if (ls && ls.length) { const l = ls[Math.floor(Math.random() * ls.length)]; chat = (Array.isArray(l) ? l : [l]).map(x => typeof x === 'string' ? { n: n.name, t: x } : x); } }
  if (G.Bond && !n.d.animal && !n.d.noBond) { n.id = id; G.Bond.talk(n, chat, done); return; } // v16.2: 친밀도 · family time
  if (chat) { G.UI.say(chat, done); return; }
  G.UI.say([{ n: n.name, t: '평안하시오.' }], done);
}
Game.talkTo = talkTo;
// 상호작용 자석: A를 누르면 대상 쪽으로 몸을 돌리고, 조금 멀면 알맞은 거리까지 스르륵 다가간 뒤에 행동합니다
// (밭 타일·전투·탈것·비활성 행동은 제외). 0.3초 안에 못 닿으면 그 자리에서 그냥 합니다.
const MAG_STOP = a => a.npc ? 1.25 : a.well ? a.well : a.node ? (NODE[a.node.type].r || 0.4) + 0.75 : a.reach || 1.0;
function magnetFor(a) {
  if (!a || a.disabled || a.tile || a.x === undefined || a.noMagnet || P.ride || P.swim || P.act || P.magnet || (G.Cine && G.Cine.on)) return false;
  const d = Math.hypot(a.x - P.x, a.z - P.z), stop = MAG_STOP(a), want = Math.atan2(a.x - P.x, a.z - P.z);
  if (d <= stop + 0.15 && Math.abs(angDiff(P.face, want)) < 0.5) return false; // already there and facing it
  P.magnet = { a, x: a.x, z: a.z, stop, t: 0 }; return true;
}
function magnetUpdate(dt) {
  const m = P.magnet; if (!m) return false; m.t += dt;
  const dx = m.x - P.x, dz = m.z - P.z, d = Math.hypot(dx, dz) || 1e-3, want = Math.atan2(dx, dz);
  P.face += angDiff(P.face, want) * Math.min(1, dt * 18);
  const go = d - m.stop; if (go > 0.02) { const sp = Math.min(go / dt, 4.2); const ox = P.x, oz = P.z; W.move(P, dx / d * sp * dt, dz / d * sp * dt, 0.38, P.y); if (EP.bounds) EP.bounds(P, S); P.vx = (P.x - ox) / dt; P.vz = (P.z - oz) / dt; } else { P.vx *= 0.5; P.vz *= 0.5; }
  P.spd = Math.hypot(P.vx, P.vz);
  if ((go <= 0.02 && Math.abs(angDiff(P.face, want)) < 0.25) || m.t > 0.3) { P.magnet = null; P.vx = P.vz = 0; P.spd = 0; Game.useAction(m.a, true); }
  return true;
}
Game.useAction = function (a, mag) {
  if (!mag && (P.magnet || magnetFor(a))) return; // (a second press while gliding is ignored)
  if (a && !a.disabled && P.ride && !a.rideOk && G.Ride) G.Ride.dismount(true);
  if (!a || a.disabled) { if (a && a.seedless) G.UI.toast('씨앗이 없어요. 상인에게 사거나 수확해서 얻을 수 있어요'); if (a && a.needWater) G.UI.toast('우물이나 물가에서 물을 길어 오세요'); return; }
  if (a.use) { a.use(); return; }
  if (P.act) return;
  P.act = a.anim || 'gather'; P.actT = 0; P.actDur = a.dur || 0.6; P.actHits = a.hits || 1; P.actFn = a.fn; P.actProp = a.prop || null; P.fired = false; P.actRepeat = !!a.repeat;
  if (a.tile) P.face = Math.atan2(a.tile.x - P.x, a.tile.z - P.z) * 0 + P.face; else if (a.x !== undefined) P.face = Math.atan2(a.x - P.x, a.z - P.z);
};
Game.pressAction = function () { if (G.Cine && G.Cine.on) { G.Cine.skip(); return; } if (G.Combat && G.Combat.fish && G.Combat.fishPress()) return; if (G.UI.busy()) { G.UI.advance(); return; } if (ctx) Game.useAction(ctx); };

// =================================================================== PLAYER UPDATE
function updatePlayer(dt) {
  if (G.Climb) { G.Climb.frame(dt); if (P.climb) { G.Climb.update(dt); if (G.Acts) G.Acts.update(dt); return; } }
  const busy = G.UI.busy(); if (P.magnet && (busy || (G.Cine && G.Cine.on))) P.magnet = null;
  if (P.magnet && Math.hypot(INPUT.mx, INPUT.my) > 0.5) P.magnet = null; // the player steers away: cancel
  if (P.magnet && magnetUpdate(dt)) { const g1 = W.heightAt(P.x, P.z); if (P.grounded) P.y = Math.max(g1, EP.floor ? (EP.floor(P.x, P.z, S) ?? g1) : g1); return; }
  let mx = INPUT.mx + ((INPUT.keys.KeyD ? 1 : 0) - (INPUT.keys.KeyA ? 1 : 0)), my = INPUT.my + ((INPUT.keys.KeyS ? 1 : 0) - (INPUT.keys.KeyW ? 1 : 0));
  let mag = Math.min(1, Math.hypot(mx, my)); if (busy || P.act || P.lock || P.downed || P.landT > 0.25) mag = 0;
  if (G.Lock && G.Lock.aim && !busy && G.Lock.steer(mx, my, dt)) mag = 0; // aiming a throw: the stick moves the landing mark
  if (P.emote && mag > 0.15 && !(G.Acts && G.Acts.walkable(P.emote.k))) G.Acts.stop(); if (P.emote && G.Acts && G.Acts.locks(P.emote.k)) mag = 0;
  mag = mag < 0.1 ? 0 : Math.pow((mag - 0.1) / 0.9, 1.15);
  const g0 = W.heightAt(P.x, P.z), wl = W.water ? W.water.level : -99; P.swim = g0 < wl - 0.75;
  if (mag === 0 || P.exhausted || P.swim) P.sprint = P.sprint && mag > 0 && !P.exhausted && !P.swim;
  let target = 0;
  const RD = P.ride && G.Ride ? G.Ride.spec(P.ride) : null; if (RD && P.swim) G.Ride.dismount(false, '물이 깊어 내렸어요');
  if (mag > 0 && RD) { target = mag < 0.6 ? lerp(1.2, RD.walk * 0.62, mag / 0.6) : lerp(RD.walk * 0.62, RD.walk, (mag - 0.6) / 0.4); if (P.sprint && mag > 0.45 && !P.ride.tired) target = RD.run; if (g0 < wl) target *= 0.6; }
  else if (mag > 0) { target = mag < 0.6 ? lerp(1.0, 2.6, mag / 0.6) : lerp(2.6, 4.8, (mag - 0.6) / 0.4); if (P.sprint && mag > 0.45) target = 7.6; if (P.limp) target *= 0.72; if (P.atk) target *= 0.3; if (P.swim) target = Math.min(target, 2.2); else if (g0 < wl) target *= 0.7; if (P.exhausted) target = Math.min(target, 2.0); if (P.crouch) target = Math.min(target, P.swim ? target : 1.75); }
  if (G.Surv && target > 0) target *= G.Surv.mul;
  if (EP.speedMul && target > 0) target *= EP.speedMul(S, P, mag);
  const yaw = CAM.yaw; const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  let dx = fx * (-my) + rx * mx, dz = fz * (-my) + rz * mx; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
  const tvx = dx * target, tvz = dz * target;
  const FL = G.Motion.feel(), acc = target > P.spd ? (P.grounded ? FL.acc : FL.air) : FL.dec;
  const k = 1 - Math.exp(-acc * dt / 3);
  P.vx = lerp(P.vx, tvx, k); P.vz = lerp(P.vz, tvz, k);
  if (P.dodgeT > 0) { // dodge roll: quick dash in the stick direction (or backwards from the target), brief invulnerability
    if (!P.dodgeDir) { let ddx = mag > 0 ? dx : -Math.sin(P.face), ddz = mag > 0 ? dz : -Math.cos(P.face); P.dodgeDir = [ddx, ddz]; P.face = mag > 0 ? Math.atan2(ddx, ddz) : P.face; }
    P.dodgeT -= dt; const sp = 9.5 * (P.limp ? 0.75 : 1) * Math.min(1, P.dodgeT * 4 + 0.3); P.vx = P.dodgeDir[0] * sp; P.vz = P.dodgeDir[1] * sp; }
  if (P.lungeT > 0) { P.lungeT -= dt; P.vx = P.lungeDir[0] * P.lungeV; P.vz = P.lungeDir[1] * P.lungeV; }
  if (P.tintT > 0) { P.tintT -= dt; if (P.tintT <= 0) P.tint = null; }
  P.spd = Math.hypot(P.vx, P.vz);
  if (P.atk && P.atk.tg) P.face += angDiff(P.face, Math.atan2(P.atk.tg.x - P.x, P.atk.tg.z - P.z)) * Math.min(1, dt * 14);
  else if (mag > 0 && !(P.dodgeT > 0) && (P.spd > 0.25 || P.grounded)) { // face the stick (not the lagging velocity); pivot faster from a standstill
    const want = Math.atan2(dx, dz), piv = 1 + 1.2 * (1 - Math.min(1, P.spd / 3)); P.face += angDiff(P.face, want) * Math.min(1, dt * (P.grounded ? FL.turn * piv : 5)); }
  // move with slope check
  // swept in short steps so a sprint, a dodge or a slow frame never tunnels through a wall
  P.hit = null; const mvL = Math.hypot(P.vx, P.vz) * dt, nSub = Math.min(10, Math.max(1, Math.ceil(mvL / 0.16)));
  for (let si = 0; si < nSub; si++) {
    const ox = P.x, oz = P.z, oh = W.heightAt(ox, oz);
    P.x += P.vx * dt / nSub; P.z += P.vz * dt / nSub;
    const fl = (x, z) => EP.floor ? EP.floor(x, z, S) : null;
    // v16.9 a floor more than a step above your feet is a wall (you can't walk up out of the pit onto its collar)
    const steep = (x, z) => { const f = fl(x, z); if (f !== null && f !== undefined) return f > P.y + 0.6; return W.heightAt(x, z) > oh + 0.01 && W.slopeAt(x, z) > 0.6; };
    if (steep(P.x, P.z)) { // too steep: keep whichever axis still goes somewhere, so the hero slides along the hillside instead of sticking
      const ax = !steep(P.x, oz), az = !steep(ox, P.z);
      if (ax && (!az || Math.abs(P.vx) >= Math.abs(P.vz))) { P.z = oz; P.vz *= 0.5; } else if (az) { P.x = ox; P.vx *= 0.5; } else { P.x = ox; P.z = oz; P.vx *= 0.3; P.vz *= 0.3; } }
    W.collide(P, 0.38, P.y); W.collide(P, 0.38, P.y);
  }
  for (const n of P.follow) { } // followers don't block
  if (G.Climb && P.hit) G.Climb.tryGrab(P, dt, mag, dx, dz); else P.grabT = 0;
  const h = W.half - 6; P.x = clamp(P.x, -h, h); P.z = clamp(P.z, -h, h);
  if (EP.bounds) EP.bounds(P, S);
  // vertical
  let gnd = W.heightAt(P.x, P.z); if (EP.floor) { const f2 = EP.floor(P.x, P.z, S); if (f2 !== null && f2 > gnd - 0.3) gnd = Math.max(gnd, f2); }
  if (G.climbTopAt) { const tp = G.climbTopAt(W, P.x, P.z, P.y); if (tp > gnd) gnd = tp; } /* flat roofs and wall tops you climbed onto */ const floor = P.swim ? Math.max(gnd, wl - 1.25) : gnd;
  P.vy -= (P.vy < 0 ? 34 : P.jumpCut ? 52 : 24) * dt; P.y += P.vy * dt; // falls faster than it rises; releasing jump early cuts the rise
  if (P.y <= floor) { if (!P.grounded && P.vy < -4) haptic(P.vy < -10 ? 'thud' : 'land'); if (!P.grounded && P.vy < -6) FX.burst(P.x, floor + 0.05, P.z, 8, { c: [0.8, 0.72, 0.58], sp: 1.4, up: 0.6, size: 0.18 }); P.y = floor; P.vy = 0; P.grounded = true; P.coyote = 0.12; }
  else { if (P.y > floor + 0.08) P.grounded = false; P.coyote -= dt; }
  P.jumpBuf -= dt; if (P.jumpBuf > 0 && (P.grounded || P.coyote > 0) && !busy && !P.act && !P.swim && !P.ride && !P.downed && P.stam > 4) { if (P.crouch && G.Vitals) G.Vitals.crouch(false); P.vy = 7.9; P.grounded = false; P.coyote = 0; P.jumpBuf = 0; P.stam -= 6; P.jumpCut = !INPUT.jumpHeld && !P.jumpTap; P.jumpTap = false; }
  // stamina
  if (P.ride) { P.stamT = (P.stamT || 0) + dt; const sm = (S.hero && S.hero.stamMax) || 100; P.stam = Math.min(sm, P.stam + 30 * dt); if (P.exhausted && P.stam > 45) P.exhausted = false; }
  else if (P.sprint && P.spd > 3) { P.stam -= 20 * dt; P.stamT = 0; if (P.stam <= 0) { P.stam = 0; P.exhausted = true; P.sprint = false; G.UI.toast('숨이 차요… 잠시 쉬어요'); } }
  else { P.stamT = (P.stamT || 0) + dt; const sm = (S.hero && S.hero.stamMax) || 100; if (P.stamT > 1.2 && !(G.Climate && G.Climate.cold) && P.stam < ((G.Vitals && G.Vitals.cap) || sm)) P.stam = Math.min((G.Vitals && G.Vitals.cap) || sm, P.stam + (P.exhausted ? 7 : 10) * dt * (G.Surv ? G.Surv.regen : 1) * (P.resting ? 2.5 : 1)); if (P.exhausted && P.stam > 45) P.exhausted = false; }
  // footsteps (sound on each foot plant) + dust
  if (P.grounded && P.spd > 0.6 && !P.act && !P.ride) { const ph = Math.floor(P.phase / Math.PI); if (ph !== P.lastStepPh) { P.lastStepPh = ph; const gi = W.surfAt ? W.surfAt(P.x, P.z) : 'sand'; sfx('step', { surf: g0 < wl + 0.05 ? 'water' : gi, vol: Math.min(1, 0.35 + P.spd / 8), pitch: 0.9 + Math.random() * 0.2, gap: 0.12 }); } }
  // footstep dust
  if (P.grounded && P.spd > 4.5 && !P.ride) { P.stepT -= dt; if (P.stepT < 0) { P.stepT = 0.18; FX.burst(P.x - Math.sin(P.face) * 0.3, P.y + 0.05, P.z - Math.cos(P.face) * 0.3, 2, { c: [0.82, 0.75, 0.6], sp: 0.5, up: 0.5, size: 0.2, a: 0.6, g: 0.5 }); } }
  if (P.grounded && !P.ride && (P.rig.brk || 0) > 0.45 && P.spd > 2.2) { P.skidT = (P.skidT || 0) - dt; if (P.skidT < 0) { P.skidT = 0.07; FX.burst(P.x + Math.sin(P.face) * 0.35, P.y + 0.04, P.z + Math.cos(P.face) * 0.35, 2, { c: [0.8, 0.72, 0.58], sp: 0.7, up: 0.35, size: 0.22, a: 0.55, g: 0.4 }); } }
  // action
  if (P.act) {
    P.actT += dt; const cycle = P.actDur; const hitT = cycle * 0.55;
    const k2 = P.actT % cycle; const hitIdx = Math.floor(P.actT / cycle);
    if (!P.fired && P.actT >= hitT + (P.actHits - 1) * cycle) { P.fired = true; haptic('hit'); if (P.actFn) P.actFn(); G.UI.hud(); checkStep(); }
    if (P.act && Math.floor((P.actT - dt - hitT) / cycle) < Math.floor((P.actT - hitT) / cycle) && P.actT >= hitT) { const snd = { hoe: 'hoe', chop: 'chop', mine: 'mine', water: 'pour', plant: 'gather', harvest: 'gather', gather: 'gather', pick: 'gather', shear: 'bleat', milk: 'goat' }[P.act]; if (snd) sfx(snd, { pitch: 0.9 + Math.random() * 0.2 }); if (Game.addXP) Game.addXP(P.act === 'chop' || P.act === 'mine' || P.act === 'hoe' ? 2 : 1); }
    if (P.actT >= cycle * P.actHits) { P.act = null; P.actProp = null; if (P.actRepeat && INPUT.actHeld && !G.UI.busy()) { holdRepeat = 0.05; } }
  }
  if (G.Acts) { G.Acts.update(dt); G.Acts.ambient(dt); }
}
let holdRepeat = 0;

// =================================================================== NPC / ANIMAL UPDATE
function updateNPCs(dt, t) {
  for (const id in ENT.npcs) {
    const n = ENT.npcs[id]; n.vis = npcVisible(n); n.col.on = n.vis && !n.follow && !n.pass; if (!n.vis) continue;
    const dist = Math.hypot(n.x - P.x, n.z - P.z); const cc = Game.cineCam; n.near = dist < 90 || (!!cc && Math.hypot(n.x - cc.x, n.z - cc.z) < 90); if (!n.near) continue;
    let speed = 0;
    if (n.follow) {
      const idx = P.follow.indexOf(n); const back = 2.4 + Math.floor(idx / 2) * 1.6; const lat = (idx % 2 ? 1 : -1) * (SET.view === 'classic' ? 0.9 : 1.6); const sl = G.Companion && !n.d.animal ? G.Companion.slot(n, idx, dt) : null; // v17.8 P7: the best of eight spots (js/companion.js)
      const tx = sl ? sl[0] : P.x - Math.sin(P.face) * back + Math.cos(P.face) * lat, tz = sl ? sl[1] : P.z - Math.cos(P.face) * back - Math.sin(P.face) * lat;
      const dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
      if (d > 0.4) { speed = Math.min(d * 2.2, P.spd > 5 ? 7.5 : 5); const ox = n.x, oz = n.z; W.move(n, dx / d * speed * dt, dz / d * speed * dt, 0.32); W.avoid(n, ox, oz);
        const mv = Math.hypot(n.x - ox, n.z - oz); n.fstuck = mv < speed * dt * 0.25 ? (n.fstuck || 0) + dt : 0; n.face += angDiff(n.face, Math.atan2(dx, dz)) * Math.min(1, dt * 8); }
      // lost behind a wall, or far behind: catch up by appearing on the hero's side of the wall (never through it)
      if ((d > 30 || (n.fstuck > 2.2 && d > 3)) && (!G.Companion || G.Companion.canWarp(n))) { const q = { x: P.x - Math.sin(P.face) * 1.2, z: P.z - Math.cos(P.face) * 1.2 }; W.collide(q, 0.32); n.x = q.x; n.z = q.z; n.fstuck = 0; }
    } else if (n.pass) { // riding behind the hero
      if (G.Ride) G.Ride.passSeat(n); speed = P.spd;
    } else if (n.walk) {
      const w = n.walk, wp = w.path && w.path.length ? w.path[0] : null; let gx = wp ? wp[0] : w.x, gz = wp ? wp[1] : w.z;
      const det = W.avoids.length ? W.avoidSteer(n.x, n.z, gx, gz) : null; if (det) { gx = det[0]; gz = det[1]; } // round a pit, not over it
      const dx = gx - n.x, dz = gz - n.z, d = Math.hypot(dx, dz);
      if (wp && d < 0.8) w.path.shift();
      else if (d < 0.3 && !det) { const cb = w.cb; n.walk = null; n.homeFace = n.face; cb && cb(); }
      else { speed = w.sp; const st = Math.min(speed * dt, d), q = { x: n.x, z: n.z };
        /* walkers always respect walls now (cutscene walkers used to glide through them). If one is truly wedged for a moment,
           it slips sideways along the wall first and only as a last resort steps through, so a story beat can never stall */
        if (dist < 70 || (Game.cineCam && Math.hypot(n.x - Game.cineCam.x, n.z - Game.cineCam.z) < 70)) { n.col.on = false; W.move(q, dx / d * st, dz / d * st, 0.32); n.col.on = true; const mv = Math.hypot(q.x - n.x, q.z - n.z);
          if (mv < st * 0.3) { w.stuck += dt; if (w.stuck > 0.5) { const sx = -dz / d * (w.side || (w.side = Math.random() < 0.5 ? 1 : -1)); q.x += sx * st; q.z += dx / d * w.side * st; n.col.on = false; W.collide(q, 0.32); n.col.on = true; }
            if (w.stuck > (w.solid === false ? 1.6 : 2.5)) { q.x = n.x + dx / d * st; q.z = n.z + dz / d * st; } } else w.stuck = Math.max(0, w.stuck - dt); }
        else { q.x += dx / d * st; q.z += dz / d * st; }
        if (W.avoids.length) W.avoid(q, n.x, n.z);
        n.x = q.x; n.z = q.z; n.face += angDiff(n.face, Math.atan2(dx, dz)) * Math.min(1, dt * 8); }
    } else if (n.wander && !n.talking && dist > 3) {
      const w = n.wander; if (w.tx === null || w.stuck > 1.2) { const a = Math.random() * PI * 2, r = Math.random() * w.r; w.tx = w.cx + Math.cos(a) * r; w.tz = w.cz + Math.sin(a) * r; w.wait = 1 + Math.random() * 4; w.stuck = 0; }
      if (w.wait > 0) w.wait -= dt; else { const dx = w.tx - n.x, dz = w.tz - n.z, d = Math.hypot(dx, dz); if (d < 0.4) w.tx = null; else { speed = n.d.animal ? 0.9 : 1.3; const q = { x: n.x, z: n.z }; n.col.on = false; W.move(q, dx / d * speed * dt, dz / d * speed * dt, 0.35); n.col.on = true; if (W.avoids.length) W.avoid(q, n.x, n.z); if (Math.hypot(q.x - n.x, q.z - n.z) < speed * dt * 0.4) w.stuck += dt; n.x = q.x; n.z = q.z; n.face += angDiff(n.face, Math.atan2(dx, dz)) * Math.min(1, dt * 6); } }
    } else {
      const want = (n.talking || dist < 4) && !n.d.fixedFace ? Math.atan2(P.x - n.x, P.z - n.z) : n.homeFace;
      n.face += angDiff(n.face, want) * Math.min(1, dt * 4);
    }
    if (!n.pass) { let gy = W.heightAt(n.x, n.z); if (EP.floor && !n.d.animal) { const f2 = EP.floor(n.x, n.z, S); if (f2 !== null && f2 !== undefined && f2 > gy - 0.3) gy = Math.max(gy, f2); }
      gy += n.seatY || 0; n.y = n.y === undefined || Math.abs(gy - n.y) > 1.2 ? gy : n.y + (gy - n.y) * Math.min(1, dt * 14); } // ease over steps; snap only on a real jump
    n.col.x = n.x; n.col.z = n.z;
    n.aspd = (n.aspd || 0) + (speed - (n.aspd || 0)) * Math.min(1, dt * 7); n.st.face = n.face; n.st.speed = n.aspd; n.st.phase = (n.st.phase || 0) + (n.d.animal ? n.aspd * dt * 3.2 : G.stepRate(n.aspd) * dt); n.st.idle = 1;
    n.st.talk = n.talking && ((G.UI.speaker && G.UI.speaker() === n.name) || (G.NpcAI && G.NpcAI.speaking === n));
    if (n.rig.bodyLook !== n.d.look) { n.rig.body = G.Motion.bodyOf(n.d.look); n.rig.bodyLook = n.d.look; } n.gndOff = -(n.d.dy || 0); n.st.gnd = (cc ? Math.min(dist, Math.hypot(n.x - cc.x, n.z - cc.z)) : dist) < 30 && !n.d.animal ? G.Motion.groundFn(n) : null; n.st.npcLoop = true;
    n.st.listen = n.talking && !n.st.talk; n.st.cold = G.Surv && G.Surv.cold > 8;
    if (n.emote) { n.emote.t += dt; if (n.emote.t >= n.emote.dur || n.walk || n.talking) n.emote = null; else if (!n.emote.amb) n.face += angDiff(n.face, Math.atan2(P.x - n.x, P.z - n.z)) * Math.min(1, dt * 5); }
    const emo = n.emote && n.emote.t >= 0 ? n.emote : null; n.st.act = emo ? emo.k : n.act; n.st.actT = emo ? Math.min(1, emo.t / emo.dur) : (t * 0.8) % 1; n.st.kneel = n.d.kneel; n.st.sit = n.d.sit || n.sit; n.st.sleep = n.sleep; n.st.limp = n.d.limp; n.st.long = n.d.look && n.d.look.long; n.st.ride = !!(n.pass || n.seatY); { const em = G.Cine && G.Cine.emoOf ? G.Cine.emoOf(n.name) : null; n.st.emo = em && !n.d.animal ? em[0] : null; n.st.emoK = em ? em[1] : 1; /* v16.8 acting */ } n.st.passenger = !!n.pass; n.st.rideSp = n.pass ? P.spd : n.aspd; n.st.ridePh = n.pass ? (P.ride ? P.ride.ph || 0 : 0) : (n.mph || 0); n.st.shiver = n.shiver;
    n.st.graze = n.d.animal && !speed && Math.sin(t * 0.3 + n.x) > 0.2;
    if (n.d.animal) animAnimal(n.rig, n.st, t); else animHuman(n.rig, n.st, t + n.x);
    n.rig.update(m4trs(n.M || (n.M = m4()), n.x, n.y + (n.d.dy || 0), n.z, n.face, 0, 0, n.scale, n.scale, n.scale));
  }
}
/* people don't stand inside each other: a soft push apart for nearby walkers, wanderers and followers (seated or posed
   people are left where the story put them), and followers keep a step away from the hero */
const SEP = [];
function separateNPCs(dt) {
  SEP.length = 0; for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n.vis || !n.near || n.pass || n.seatY || n.d.fixed) continue; if (Math.hypot(n.x - P.x, n.z - P.z) > 40) continue; SEP.push(n); }
  for (let i = 0; i < SEP.length; i++) { const a = SEP[i], ra = a.d.animal ? 0.55 : 0.34, ma = a.walk || a.wander || a.follow;
    if (a.follow) { const dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz), m = 0.85; if (d < m && d > 1e-3) { const k = (m - d) * Math.min(1, dt * 10); a.x += dx / d * k; a.z += dz / d * k; } }
    for (let j = i + 1; j < SEP.length; j++) { const b = SEP[j], mb = b.walk || b.wander || b.follow; if (!ma && !mb) continue; const rb = b.d.animal ? 0.55 : 0.34;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = ra + rb; if (d >= m || d < 1e-4) continue;
      const k = (m - d) * Math.min(1, dt * 8), wa = ma && mb ? 0.5 : ma ? 1 : 0, wb = 1 - wa;
      a.x -= dx / d * k * wa; a.z -= dz / d * k * wa; b.x += dx / d * k * wb; b.z += dz / d * k * wb; } }
  for (const n of SEP) { n.col.on = false; W.collide(n, 0.3); n.col.on = n.vis && !n.follow && !n.pass; n.col.x = n.x; n.col.z = n.z; }
}
function updateAnimals(dt, t, night) {
  for (const a of ENT.animals) {
    const p = pen(a.pen); if (!p) continue; const dist = Math.hypot(a.x - P.x, a.z - P.z); const cc = Game.cineCam; a.near = dist < 70 || (!!cc && Math.hypot(a.x - cc.x, a.z - cc.z) < 70); if (!a.near) continue;
    let speed = 0;
    if (a.flee > 0) { a.flee -= dt; const dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz) || 1; speed = 3; W.move(a, dx / d * speed * dt, dz / d * speed * dt, 0.4); a.face = Math.atan2(dx, dz); }
    else if (!night) {
      if (a.tx === null || a.wait < -6) { a.tx = p.x + (Math.random() - 0.5) * (p.w - 2.5); a.tz = p.z + (Math.random() - 0.5) * (p.d - 2.5); a.wait = 2 + Math.random() * 6; }
      if (a.wait > 0) { a.wait -= dt; a.graze = true; } else { const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz); a.graze = false; if (d < 0.3) a.tx = null; else { speed = 0.75; W.move(a, dx / d * speed * dt, dz / d * speed * dt, 0.4); a.face += angDiff(a.face, Math.atan2(dx, dz)) * Math.min(1, dt * 4); a.wait -= dt; } }
      if (dist < 1.6 && P.spd > 1) { a.flee = 0.6; }
    }
    // keep inside pen
    const ca = Math.cos(p.ry || 0), sa = Math.sin(p.ry || 0), lx = (a.x - p.x) * ca - (a.z - p.z) * sa, lz = (a.x - p.x) * sa + (a.z - p.z) * ca;
    const cx = clamp(lx, -p.w / 2 + 0.8, p.w / 2 - 0.8), cz = clamp(lz, -p.d / 2 + 0.8, p.d / 2 - 0.8); a.x = p.x + cx * ca + cz * sa; a.z = p.z - cx * sa + cz * ca;
    a.y = W.heightAt(a.x, a.z);
    a.phase += speed * dt * 4; const sc = a.lamb ? 0.6 : 1;
    animAnimal(a.rig, { speed, phase: a.phase, graze: a.graze && !night, lie: night, legH: AB[a.sp][2][3], seed: a.seed }, t);
    a.rig.update(m4trs(a.M || (a.M = m4()), a.x, a.y, a.z, a.face, 0, 0, sc, sc, sc));
  }
}

// =================================================================== CAMERA
function updateCamera(dt, snap) {
  if (!Game.cineCam && EP && EP.camera && Game.mode === 'play') { const c = EP.camera(S, Game, dt); if (c) { CAM.x = c.x; CAM.y = c.y; CAM.z = c.z; CAM.lx = c.lx; CAM.ly = c.ly; CAM.lz = c.lz; CAM.fov = c.fov || 1; CAM.tx = P.x; CAM.tz = P.z; CAM.ty = P.y + 1.4; CAM.cDist = undefined; if (c.yaw !== undefined) CAM.yaw = c.yaw; return; } }
  if (Game.cineCam) { const c = Game.cineCam; CAM.x = c.x; CAM.y = c.y; CAM.z = c.z; CAM.lx = c.lx; CAM.ly = c.ly; CAM.lz = c.lz; CAM.fov = c.fov; CAM.tx = P.x; CAM.tz = P.z; CAM.ty = P.y + 1.4; CAM.cDist = undefined; return; }
  if (G.Travel && G.Travel.apply(dt)) return; // v18.2 P9: the travel cinema camera owns the view while it is on
  const s = SET.sens, sh = SET.view !== 'classic', side = SET.side === 'left' ? -1 : 1;
  const aw = clamp(CAM.aimK || 0, 0, 1), aw2 = aw * aw * (3 - 2 * aw), AC = isPortrait() ? CAM_AP : CAM_AL, shW = sh ? 1 : aw2; // v16.8 over-the-shoulder aim
  let cx = INPUT.cx + ((INPUT.keys.ArrowRight ? 1 : 0) - (INPUT.keys.ArrowLeft ? 1 : 0)), cy = INPUT.cy + ((INPUT.keys.ArrowDown ? 1 : 0) - (INPUT.keys.ArrowUp ? 1 : 0));
  if (SET.invert) cy = -cy;
  const ex = Math.sign(cx) * Math.pow(Math.abs(cx), 1.6), ey = Math.sign(cy) * Math.pow(Math.abs(cy), 1.6);
  const C = camCfg(), pMin = C.pMin, pMax = C.pMax, pRest = C.pRest;
  const live = Math.abs(cx) + Math.abs(cy) > 0.05 && !G.UI.modal();
  const kr = snap ? 1 : 1 - Math.exp(-dt * 14); // eased angular velocity: no jolt on start/stop
  const fine = 1 - 0.45 * aw; // finer turning while aiming
  CAM.yv = lerp(CAM.yv || 0, live ? -ex * (sh ? 2.8 : 3.2) * s * fine : 0, kr); CAM.pv = lerp(CAM.pv || 0, live ? ey * 1.7 * s * fine : 0, kr);
  if (live || Math.abs(CAM.yv) + Math.abs(CAM.pv) > 0.01) { CAM.yaw += CAM.yv * dt; CAM.pitch = clamp(CAM.pitch + CAM.pv * dt, pMin, pMax); }
  if (live) CAM.last = 0; else CAM.last += dt;
  if (SET.autoCam && CAM.last > 1.2 && P.spd > 1.5 && !G.UI.busy() && aw < 0.05) {
    const want = Math.atan2(P.vx, P.vz) + PI; const lat = Math.abs(Math.sin(angDiff(CAM.yaw, want)));
    CAM.yaw += angDiff(CAM.yaw, want) * Math.min(1, dt * (sh ? 0.4 : 0.55) * (0.3 + lat)) * Math.min(1, P.spd / 4);
    CAM.pitch += (pRest - CAM.pitch) * Math.min(1, dt * 0.4);
  }
  // aiming: tilt so the line of sight through the shoulder pivot meets what is aimed at (unless the right stick is moving)
  if (aw > 0.02 && !live && CAM.aimAt) { const a = CAM.aimAt, hd = Math.max(2, Math.hypot(a.x - P.x, a.z - P.z)), want = clamp(Math.atan2(P.y + AC.piv - a.y, hd) + 0.05, -0.3, 0.55);
    CAM.pitch += (want - CAM.pitch) * Math.min(1, dt * 3.5 * aw); }
  const k = snap ? 1 : 1 - Math.exp(-dt * (sh ? 16 : 12)), kv = snap ? 1 : 1 - Math.exp(-dt * 8);
  const rideUp = P.ride && G.Ride ? G.Ride.spec(P.ride).camUp : 0; CAM.rideK = lerp(CAM.rideK || 0, rideUp, snap ? 1 : 1 - Math.exp(-dt * 3));
  CAM.tx = lerp(CAM.tx, P.x, k); CAM.tz = lerp(CAM.tz, P.z, k); CAM.ty = lerp(CAM.ty, P.y + lerp(C.piv, AC.piv, aw2) + CAM.rideK, kv);
  const run = P.sprint && P.spd > 5 ? 1 : 0;
  /* indoors: under a roof the boom stays below the ceiling, the view levels out and comes in a little, so the people in
     the room are in shot instead of the roof (RDR2-style interior camera). Eases in and out at the doorway. */
  const roof = W.roofAt(P.x, P.z, P.y); P.indoor = !!roof; if (roof) CAM.ceil = roof.y;
  CAM.inK = snap ? (roof ? 1 : 0) : lerp(CAM.inK || 0, roof ? 1 : 0, 1 - Math.exp(-dt * 3));
  if (CAM.inK > 0.01 && !live && aw < 0.05) CAM.pitch += (lerp(pRest, 0.06, CAM.inK) - CAM.pitch) * Math.min(1, dt * 2.5 * CAM.inK);
  let dist = ((sh ? C.dist + run * C.run : CAM.dist) + CAM.rideK * 1.3) * SET.dist * (CAM.zoom || 1) * (1 - 0.18 * CAM.inK);
  dist = lerp(dist, AC.dist * (1 - 0.1 * Math.max(0, (CAM.aimK || 0) - 1)) + CAM.rideK * 0.8, aw2);
  // shoulder offset along camera right
  const rx = Math.cos(CAM.yaw), rz = -Math.sin(CAM.yaw); let off = lerp(sh ? C.off * side : 0, AC.off * side, aw2);
  const cp = Math.cos(CAM.pitch); const dx = Math.sin(CAM.yaw) * cp, dy = Math.sin(CAM.pitch), dz = Math.cos(CAM.yaw) * cp;
  // obstruction: from character to shoulder, then shoulder to camera
  if (off) { const fo = W.ray(CAM.tx, CAM.ty, CAM.tz, CAM.tx + rx * off * 1.3, CAM.ty, CAM.tz + rz * off * 1.3); if (fo < 1) off *= Math.max(0, fo - 0.15); }
  // smooth only the shoulder offset and the boom length; the orbit itself follows yaw/pitch exactly, so turning never "swims"
  CAM.cOff = snap || CAM.cOff === undefined ? off : lerp(CAM.cOff, off, 1 - Math.exp(-dt * 10)); off = CAM.cOff;
  const px = CAM.tx + rx * off, pz = CAM.tz + rz * off, py = CAM.ty;
  if (CAM.inK > 0.01 && dy > 0.01) { const top = (CAM.ceil || py + 9) - 0.4; const lim = (top - py) / dy; if (lim < dist) dist = lerp(dist, Math.max(0.8, lim), CAM.inK); }
  const f = W.ray(px, py, pz, px + dx * dist, py + dy * dist, pz + dz * dist); if (f < 1) dist = Math.max(sh || aw > 0.5 ? 0.75 : 1.2, dist * f - 0.3);
  if (W.roofs.length) { // never park the camera inside a room the hero isn't in (looking out through cell bars or a wall)
    for (let it = 0; it < 6 && dist > 0.8 && W.inRoof(px + dx * dist, pz + dz * dist, py + dy * dist, roof); it++) dist = Math.max(0.8, dist * 0.72); }
  if (snap || CAM.cDist === undefined) CAM.cDist = dist; else CAM.cDist = lerp(CAM.cDist, dist, 1 - Math.exp(-dt * (dist < CAM.cDist ? 22 : 3.5)));
  let ex2 = px + dx * CAM.cDist, ey2 = py + dy * CAM.cDist, ez2 = pz + dz * CAM.cDist;
  for (let i = 1; i <= 3; i++) { const tt = i / 3; const gx = lerp(px, ex2, tt), gz = lerp(pz, ez2, tt), gy = lerp(py, ey2, tt); const gh = W.heightAt(gx, gz) + 0.35; if (gy < gh) { ey2 += (gh - gy) * (1 / tt); } }
  const gh = W.heightAt(ex2, ez2) + 0.4; if (ey2 < gh) ey2 = gh;
  CAM.gy = snap || CAM.gy === undefined ? ey2 - (py + dy * CAM.cDist) : lerp(CAM.gy, ey2 - (py + dy * CAM.cDist), 1 - Math.exp(-dt * 12));
  CAM.x = ex2; CAM.y = py + dy * CAM.cDist + CAM.gy; CAM.z = ez2;
  if (CAM.shake > 0) { CAM.shake = Math.max(0, CAM.shake - dt * 2.2); const a = CAM.shake * CAM.shake * 0.22; CAM.x += (Math.random() - 0.5) * a; CAM.y += (Math.random() - 0.5) * a; CAM.z += (Math.random() - 0.5) * a; }
  // look point: parallel to view direction so the hero sits off-centre (일반 3인칭 looks at the hero, blending to parallel while aiming)
  const plx = CAM.x - dx * 10, ply = CAM.y - dy * 10, plz = CAM.z - dz * 10;
  CAM.lx = lerp(CAM.tx, plx, shW); CAM.ly = lerp(CAM.ty, ply, shW); CAM.lz = lerp(CAM.tz, plz, shW);
  const baseFov = (sh ? C.fov : isPortrait() ? 1.15 : C.fov) + run * 0.08, wantFov = lerp(baseFov, AC.fov * (1 - 0.12 * Math.max(0, (CAM.aimK || 0) - 1)), aw2); // v16.8 longer lens over the shoulder
  CAM.fov = lerp(CAM.fov, wantFov, snap ? 1 : 1 - Math.exp(-dt * 6));
  // v16.8 cutscene → gameplay: blend position, look and lens from the last cutscene frame instead of cutting (≈0.8 s)
  const bl = Game.camBlend; if (bl) { bl.t += dt; const u = clamp(bl.t / bl.dur, 0, 1), e = u * u * (3 - 2 * u), a = 1 - e;
    CAM.x = lerp(CAM.x, bl.x, a); CAM.y = lerp(CAM.y, bl.y, a); CAM.z = lerp(CAM.z, bl.z, a); CAM.lx = lerp(CAM.lx, bl.lx, a); CAM.ly = lerp(CAM.ly, bl.ly, a); CAM.lz = lerp(CAM.lz, bl.lz, a); CAM.fov = lerp(CAM.fov, bl.fov, a);
    if (u >= 1) Game.camBlend = null; }
}

// =================================================================== DIALOGUE CAMERA
/* over-the-shoulder two-shot while people talk: when an NPC speaks the camera sits behind Jacob's shoulder looking at
   the NPC's face, when Jacob speaks it reverses. Blends in and out from the gameplay camera. */
Game.dlgW = 0; const DC = { ax: 0, ay: 0, az: 0, lx: 0, ly: 0, lz: 0, ok: false };
function dialogCam(dt) {
  const inDlg = G.UI.inDialog && G.UI.inDialog(), spk = inDlg ? G.UI.speaker() : null;
  let n = Game.dlgNpc && Game.dlgNpc.talking ? Game.dlgNpc : null;
  if (inDlg && !n) { let bd = 6; for (const id in ENT.npcs) { const m = ENT.npcs[id]; if (!m.talking || !m.vis || m.d.animal) continue; const d = Math.hypot(m.x - P.x, m.z - P.z); if (d < bd) { bd = d; n = m; } } }
  if (spk && n && spk !== n.name && spk !== EP.hero && spk !== '이스라엘') { for (const id in ENT.npcs) { const m = ENT.npcs[id]; if (m.vis && !m.d.animal && m.name === spk && Math.hypot(m.x - P.x, m.z - P.z) < 8) { n = m; break; } } }
  const on = inDlg && n && n.vis && !Game.cineOn && !Game.noDlgCam && Math.hypot(n.x - P.x, n.z - P.z) < 6.5;
  Game.dlgW += ((on ? 1 : 0) - Game.dlgW) * Math.min(1, dt * (on ? 3.2 : 4.5)); if (!inDlg && Game.dlgW < 0.01) { Game.dlgNpc = null; DC.ok = false; DC.side = null; }
  if (on && spk !== '' && spk !== undefined) {
    const heroTalks = spk === EP.hero || spk === '이스라엘', A = heroTalks ? n : P, Bn = heroTalks ? P : n;
    const sa = heroTalks ? (n.scale || 1) : 1, sb = heroTalks ? 1 : (n.scale || 1);
    let dx = Bn.x - A.x, dz = Bn.z - A.z; const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl; const sx = dz, sz = -dx;
    const ay = A.y + 1.63 * sa, by = Bn.y + 1.6 * sb;
    /* v12: the shoulder must never hide the face. Swing wider and further back, and when the one we look at is shorter
       (a child, someone seated) drop the camera toward their eye line so it looks past the shoulder, not through it */
    const low = clamp((ay - by) / 0.5, 0, 1), sideO = 0.62 + 0.25 * low, back = 0.95 + 0.25 * low;
    let cx = A.x - dx * back + sx * sideO, cz = A.z - dz * back + sz * sideO, cy = lerp(ay + 0.05, by + 0.12, 0.55 * low + 0.15);
    const f = W.ray(A.x, ay, A.z, cx, cy, cz); if (f < 1) { cx = A.x + (cx - A.x) * Math.max(0.3, f - 0.1); cz = A.z + (cz - A.z) * Math.max(0.3, f - 0.1); }
    const tx = Bn.x - dx * 0.05, tz = Bn.z - dz * 0.05, ty = by - 0.07;
    const side = (heroTalks ? 'h' : 'n') + (n.id || ''); // shot / reverse-shot: cut when the speaker changes sides instead of swinging the camera through the pair
    if (!DC.ok || (DC.side && DC.side !== side && Game.dlgW > 0.9)) { DC.ax = cx; DC.ay = cy; DC.az = cz; DC.lx = tx; DC.ly = ty; DC.lz = tz; DC.ok = true; }
    DC.side = side;
    const k = 1 - Math.exp(-dt * 6); DC.ax = lerp(DC.ax, cx, k); DC.ay = lerp(DC.ay, cy, k); DC.az = lerp(DC.az, cz, k); DC.lx = lerp(DC.lx, tx, k); DC.ly = lerp(DC.ly, ty, k); DC.lz = lerp(DC.lz, tz, k);
  }
  const w = Game.dlgW; if (w < 0.002 || !DC.ok) return; const e = w * w * (3 - 2 * w);
  CAM.x = lerp(CAM.x, DC.ax, e); CAM.y = lerp(CAM.y, DC.ay, e); CAM.z = lerp(CAM.z, DC.az, e);
  CAM.lx = lerp(CAM.lx, DC.lx, e); CAM.ly = lerp(CAM.ly, DC.ly, e); CAM.lz = lerp(CAM.lz, DC.lz, e); CAM.fov = lerp(CAM.fov, 0.72, e);
}

// =================================================================== MAIN UPDATE
let tAll = 0, lastNow = performance.now(), dayTickT = 0;
const PERF = Game.perf = { avg: 16.7, scale: 1, t: 0 };
{ const m = /[?&]shadowrate=([12])\b/.exec(location.search); if (m) R.shadowRate = R.shadowLock = +m[1]; } // ?shadowrate=1 / 2 pins the shadow update rate (for comparing); without it the rate follows the frame time
/* v18.4 P15 — keeping the frame rate steady instead of chasing the highest one.
   · SET.fps: 'auto' (default) / '30' / '60'. A lock skips display frames (main.js) so every frame is the same length: an even 30 looks smoother, and runs
     cooler, than a 45–55 that wobbles. 'auto' starts unlocked; only if the picture is still slow after the resolution has been lowered it locks to 30
     (once, with a note), tries unlocked again after two minutes, and if that is slow again it stays locked.
   · Resolution (PERF.scale, 0.6–1): judged by p90 of the last 120 frame times (the slow end), not the average, in steps of 0.75 s: p90 over 1.3× the target
     frame time → 0.1 smaller at once; p90 within 1.1× of it, no drop for 30 s and 8 s since the last rise → 0.05 bigger.
   · Shadow map every 2nd frame (R.shadowRate) when p90 stays over 1.25× the target for 3 s (back after 3 s of good frames). ?shadowrate=1|2 pins it.
   Game.fpsTarget() → 0 (display rate) / 30 / 60 · Game.perfTick(rawMs, dt) · PERF.hist (ring of the last 120 frame times). */
PERF.hist = new Float32Array(120); PERF.hn = 0; PERF.slow = PERF.fast = 0; PERF.autoLock = false; PERF.lockAt = 0; PERF.trial = 0; PERF.sticky = false; PERF.dropAt = -99; PERF.raiseAt = -99; PERF.lockN = 0; PERF.ceil = 1; PERF.ceilAt = -999;
Game.fpsTarget = () => { const m = SET.fps; return m === '30' ? 30 : m === '60' ? 60 : PERF.autoLock ? 30 : 0; };
function p90() { const n = Math.min(PERF.hn, 120); if (n < 30) return PERF.avg; const a = Array.prototype.slice.call(PERF.hist, 0, n).sort((x, y) => x - y); return a[Math.floor(n * 0.9)]; }
PERF.p90 = p90;
function perfTick(rawMs, dt) {
  if (!(rawMs > 0 && rawMs < 250) || document.hidden) return;
  PERF.avg += (rawMs - PERF.avg) * 0.05; PERF.hist[PERF.hn++ % 120] = rawMs; PERF.t += dt; if (PERF.t < 0.75) return; PERF.t = 0;
  const tg = Game.fpsTarget(), tgt = tg ? 1000 / tg : 16.7, p = p90(), old = PERF.scale;
  // shadow update rate
  PERF.slow = p > tgt * 1.25 ? PERF.slow + 1 : 0; PERF.fast = p <= tgt * 1.1 ? PERF.fast + 1 : 0;
  if (R.shadowLock) R.shadowRate = R.shadowLock; else if (PERF.slow >= 4) R.shadowRate = 2; else if (PERF.fast >= 4) R.shadowRate = 1;
  // resolution
  if (tAll - PERF.ceilAt > 180) PERF.ceil = 1; // (a ceiling set by a failed rise is forgotten after three minutes)
  if (p > tgt * 1.3 && PERF.scale > 0.6) { PERF.scale = Math.max(0.6, PERF.scale - 0.1); if (tAll - PERF.raiseAt < 25) { PERF.ceil = PERF.scale; PERF.ceilAt = tAll; } PERF.dropAt = tAll; } // a drop soon after a rise: that size was too much, do not try it again for a while
  else if (p <= tgt * 1.1 && PERF.scale < PERF.ceil && tAll - PERF.dropAt > 30 && tAll - PERF.raiseAt > 12) { PERF.scale = Math.min(PERF.ceil, PERF.scale + 0.05); PERF.raiseAt = tAll; }
  if (old !== PERF.scale) G.UI.resize();
  // auto frame lock
  if (SET.fps !== '30' && SET.fps !== '60') {
    if (!PERF.autoLock) { PERF.lockN = p > 22 && PERF.scale <= 0.8 ? PERF.lockN + 1 : 0;
      if (PERF.lockN >= 4 && Game.mode === 'play') { PERF.autoLock = true; PERF.lockAt = tAll; PERF.lockN = 0; PERF.hn = 0; if (PERF.trial) PERF.sticky = true; if (!PERF.told) { PERF.told = 1; G.UI.toast('화면을 부드럽게 · 30프레임으로 맞췄어요 (설정에서 바꿀 수 있어요)'); } } }
    else if (!PERF.sticky && tAll - PERF.lockAt > 120) { PERF.autoLock = false; PERF.trial = 1; PERF.hn = 0; PERF.lockN = 0; } // try unlocked again
  }
}
Game.perfTick = perfTick;
Game.frame = function (now) {
  const rawMs = now - lastNow; let dt = Math.max(0, Math.min(0.05, rawMs / 1000)); lastNow = now; tAll += dt; // never backwards (clock jumps)
  perfTick(rawMs, dt); // adaptive resolution / frame lock / shadow rate (below)
  if (Game.mode === 'play' && W) {
    const modal = G.UI.modal();
    if (!modal) { S.time += dt / SEC_PER_HOUR * (EP.timeScale || 1); if (S.time >= 26) { G.UI.toast('너무 늦었어요… 그 자리에서 잠이 들었다'); newDay(); } }
    if (G.Combat && G.Combat.hitStop > 0) { G.Combat.hitStop -= dt; dt *= 0.2; }
    PM.b('player'); if (!Game.cineOn) updatePlayer(dt); else { P.vx = P.vz = 0; P.spd = 0; }
    if (G.Vitals) G.Vitals.update(dt, S); PM.e('player');
    const wdt = dt * (Game.worldScale || 1); // v16.7 집중: the world slows down, the hero and the camera do not
    PM.b('sys'); if (G.Focus) G.Focus.update(dt);
    if (G.Phys) G.Phys.update(wdt); if (G.Loot) G.Loot.update(dt); if (G.Lock) G.Lock.update(dt); if (G.Bond) G.Bond.update(dt); if (G.Companion) G.Companion.update(dt); if (G.Chem) G.Chem.update(dt); if (G.Deeds) G.Deeds.update(dt); if (G.QCam) G.QCam.update(dt); if (G.Climate) G.Climate.update(dt); if (G.Sling) G.Sling.update(wdt); if (G.Fireside) G.Fireside.update(dt); if (G.Sites) G.Sites.update(dt);
    updateCamera(dt); dialogCam(dt); PM.e('sys');
    const hour = S.time % 24, night = hour < 5.5 || hour > 20.2;
    PM.b('npc'); updateNPCs(wdt, tAll); separateNPCs(wdt); updateAnimals(wdt, tAll, night && !EP.noSleepAnim); PM.e('npc');
    PM.b('farm'); if (ENT.plotsDirty) rebuildFarm(); PM.e('farm');
    PM.b('logic'); ctx = G.UI.busy() || P.act ? null : resolveContext();
    if (holdRepeat > 0) { holdRepeat -= dt; if (holdRepeat <= 0 && INPUT.actHeld && ctx && ctx.repeat && !ctx.disabled) Game.useAction(ctx); }
    if (G.Combat) G.Combat.update(wdt, tAll); if (G.Life) { G.Life.update(dt, tAll); Q.firstFrame = false; }
    if (EP.update) EP.update(dt, S, Game, tAll);
    if (G.Audio && G.Audio.on) { Game.sndT = (Game.sndT || 0) - dt; if (Game.sndT <= 0) { Game.sndT = 0.25; const hr = S.time % 24;
      const mood = (Game.musicOverride) || (EP.music && EP.music(S, Game, hr)) || (hr < 5.2 || hr > 20.6 ? 'night' : 'haran'); G.Audio.setMood(mood);
      let fire = 99; for (const st of EP.stations || []) if (st.type === 'fire') fire = Math.min(fire, Math.hypot(st.x - P.x, st.z - P.z));
      let pens = 99; for (const p of EP.pens || []) if (!(p.hidden && p.hidden(S)) && S.herds[p.id] && S.herds[p.id].list.length) pens = Math.min(pens, Math.hypot(p.x - P.x, p.z - P.z));
      G.Audio.ambient({ hour: hr, arid: EP.aridAt ? EP.aridAt(P.x, P.z) : 0.3, water: EP.waterDist ? EP.waterDist(P.x, P.z) : 99, fire, pens, high: clamp((P.y - 8) / 20, 0, 1), rain: G.Weather ? G.Weather.cur.rain : 0, wind: G.Weather ? G.Weather.cur.wind : 1, indoor: !!P.indoor }, 0.25); } }
    dayTickT += dt; if (dayTickT > 0.5) { dayTickT = 0; PM.b('checkStep'); checkStep(); PM.e('checkStep'); }
    if (G.Weather) G.Weather.update(dt, S);
    if (G.Surv) G.Surv.update(dt, S);
    if (G.Ride) G.Ride.update(dt, tAll); if (G.Build) G.Build.update(dt); if (G.NpcAI) G.NpcAI.update(dt, tAll);
    PM.e('logic'); PM.b('prep'); render(dt); PM.e('prep');
    PM.b('ui'); G.UI.frame(dt); if (G.Wilds) { G.Wilds.frame(); G.Wilds.thoughts && G.Wilds.thoughts(dt); } PM.e('ui');
  } else if (Game.mode === 'title' && W) {
    if (G.Audio && G.Audio.on) G.Audio.setMood(EP.titleMusic || 'title');
    const tc = EP.titleCam || { x: P.x, z: P.z, r: 30, h: 12 }; const a = tAll * 0.05;
    CAM.tx = tc.x; CAM.tz = tc.z; CAM.ty = W.heightAt(tc.x, tc.z) + (tc.ty || 2); CAM.x = tc.x + Math.sin(a) * tc.r; CAM.z = tc.z + Math.cos(a) * tc.r; CAM.y = Math.max(W.heightAt(CAM.x, CAM.z) + 3, CAM.ty + tc.h); CAM.fov = 0.95; CAM.lx = CAM.tx; CAM.ly = CAM.ty; CAM.lz = CAM.tz;
    updateNPCs(dt, tAll); updateAnimals(dt, tAll, false); if (ENT.plotsDirty) rebuildFarm(); render(dt);
  }
};

// =================================================================== RENDER ASSEMBLY
const IDM = m4(), TMPM = m4();
const scene = { cam: [0, 0, 0], target: [0, 0, 0], fov: 1, env: null, time: 0, focus: [0, 0, 0], shadowOn: true, terrain: [], statics: [], insts: [], dyn: [], skinned: [], grass: { on: true, center: [0, 0], player: [0, 0, 0], map: null }, water: null, flats: [], pts: { n: 0 } };
let markerMesh = null, ringMesh = null, tileMesh = null;
function flatMeshes() {
  if (markerMesh) return; const g = new GB(1); const segs = 16, h = 60, r = 0.55;
  for (let i = 0; i < segs; i++) { const a = i / segs * PI * 2, b = (i + 1) / segs * PI * 2; const p = (ang, y) => [Math.cos(ang) * r, y, Math.sin(ang) * r]; const A = p(a, 0), B = p(b, 0), C = p(b, h), D = p(a, h); const push = (q, al) => g.d.push(q[0], q[1], q[2], 0, 1, 0, 1, 0.85, 0.45, al, 0); push(A, 0.5); push(B, 0.5); push(C, 0); push(A, 0.5); push(C, 0); push(D, 0); }
  markerMesh = R.mesh(g);
  const r2 = new GB(2); for (let i = 0; i < 32; i++) { const a = i / 32 * PI * 2, b = (i + 1) / 32 * PI * 2; const P1 = [Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0], P2 = [Math.cos(b) * 1.0, 0, Math.sin(b) * 1.0], P3 = [Math.cos(b) * 1.25, 0, Math.sin(b) * 1.25], P4 = [Math.cos(a) * 1.25, 0, Math.sin(a) * 1.25]; for (const q of [P1, P2, P3, P1, P3, P4]) r2.d.push(q[0], q[1], q[2], 0, 1, 0, 1, 0.9, 0.55, 0.8, 0); }
  ringMesh = R.mesh(r2);
  const t2 = new GB(3); const hw = 0.78, w = 0.07; for (const [x0, z0, x1, z1] of [[-hw, -hw, hw, -hw + w], [-hw, hw - w, hw, hw], [-hw, -hw, -hw + w, hw], [hw - w, -hw, hw, hw]]) for (const q of [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z0], [x1, 0, z1], [x0, 0, z1]]) t2.d.push(q[0], q[1], q[2], 0, 1, 0, 1, 1, 1, 0.85, 0);
  tileMesh = R.mesh(t2);
}
const markerM = m4(), ringM = m4(), tileM = m4();
function render(dt) {
  flatMeshes(); meshBudget = 1; MW.frame++;
  if (P.pend) { if (meshCache[P.pend]) { P.mesh = meshCache[P.pend]; P.pend = null; } else if (!MW.ok || performance.now() - P.pendT > 3000) { P.pend = null; P.mesh = lookMesh(P.look); } } // the worker never answered: build it here
  const hour = S.time % 24, mood = EP.mood && EP.mood(S, Game); const env = envAt(hour, mood);
  if (G.Weather && !mood) G.Weather.apply(env, S);
  scene.rain = G.Weather && !mood && !EP.noRain ? G.Weather.cur.rain : 0; scene.rainWind = [G.Weather ? G.Weather.cur.wind * 0.9 : 1, 0.35];
  scene.env = env; scene.time = tAll; scene.fov = CAM.fov;
  scene.cam[0] = CAM.x; scene.cam[1] = CAM.y; scene.cam[2] = CAM.z; scene.target[0] = CAM.lx === undefined ? CAM.tx : CAM.lx; scene.target[1] = CAM.ly === undefined ? CAM.ty : CAM.ly; scene.target[2] = CAM.lz === undefined ? CAM.tz : CAM.lz;
  scene.focus[0] = P.x + Math.sin(CAM.yaw + PI) * 8; scene.focus[1] = P.y; scene.focus[2] = P.z + Math.cos(CAM.yaw + PI) * 8;
  scene.shadowOn = SET.quality !== 'low' && env.night < 0.9; scene.shadowExt = 34;
  scene.terrain = W.terrain; scene.statics = W.statics; scene.water = W.water;
  scene.insts.length = 0; for (const k in ENT.nodeSets) scene.insts.push(ENT.nodeSets[k]); for (const k in ENT.cropSets) scene.insts.push(ENT.cropSets[k]);
  scene.dyn.length = 0; for (const d of ENT.dyn) scene.dyn.push(d); if (ENT.soilMesh) { const sd = ENT.soilDyn || (ENT.soilDyn = { m: IDM, shadow: false }); sd.mesh = ENT.soilMesh; scene.dyn.push(sd); }
  if (EP.dyn) EP.dyn(scene.dyn, S, Game, tAll);
  if (G.Build) G.Build.dyn(scene.dyn, S, tAll);
  scene.skinned.length = 0;
  // player
  const pst = P.pst || (P.pst = {}); const spk = G.UI.speaker && G.UI.speaker(); Object.assign(pst, { talk: !!spk && (spk === EP.hero || spk === '이스라엘'), face: P.face, speed: P.spd, phase: P.phase, air: !P.grounded && !P.swim, act: P.act, actT: P.act ? (P.actT % P.actDur) / P.actDur : 0, idle: 1, limp: P.limp, carry: P.carry ? (P.carryArms ? 'arms' : 'head') : null, staff: (hand() === 'staff' || hand() === 'hoe') && !P.act && !P.ride && !P.carry && !P.sit && !P.kneel && !P.sleeping && !Game.cineOn && !(G.Combat && G.Combat.heldProp()), long: P.look.long, kneel: P.kneel, sleep: P.sleeping, sit: P.sit, ride: !!P.ride, rideSp: P.spd, ridePh: P.ride ? P.ride.ph || 0 : 0, shiver: G.Surv ? G.Surv.shiver : 0 });
  { pst.vy = P.vy; pst.hero = true; pst.sprint = P.sprint && P.spd > 5; // v16.7 야숨: the hero glances at what he could use / who he could talk to
    let lk = 0; const c = ctx; if (c && c.x !== undefined && !P.act && !P.ride && !Game.cineOn && !G.UI.busy()) { const d = Math.hypot(c.x - P.x, c.z - P.z); if (d > 0.4 && d < 7) lk = clamp(angDiff(P.face, Math.atan2(c.x - P.x, c.z - P.z)), -1.05, 1.05); }
    P.lookS = lerp(P.lookS || 0, lk, 0.1); if (Math.abs(P.lookS) > 0.02) pst.look = P.lookS; else delete pst.look; }
  pst.gnd = P.grounded && !P.swim && !(EP.floor && EP.floor(P.x, P.z, S) !== null) ? G.Motion.groundFn(P) : null; pst.listen = !pst.talk && !!spk; pst.swim = P.swim;
  if (!pst.act && P.emote) { pst.act = P.emote.k; pst.actT = P.emote.dur ? Math.min(1, P.emote.t / P.emote.dur) : (P.emote.t % 2) / 2; }
  P.phase += G.stepRate(P.spd) * dt;
  if (P.atkPose) { pst.act = P.atkPose; pst.actT = 0.5; } else if (P.atk) { pst.act = P.atk.anim; pst.actT = P.atk.t / P.atk.dur; } else if (P.dodgeT > 0) { pst.act = 'dodge'; pst.actT = 1 - P.dodgeT / 0.45; } pst.hurt = P.tintT > 0;
  if (pst.staff && pst.act && !(G.Acts && G.Acts.walkable(pst.act))) pst.staff = false; // kneeling, praying, bowing… the staff is set aside
  pst.crouch = !!P.crouch && !P.ride && !P.swim; if (G.Phys && G.Phys.held && !pst.carry) pst.carry = 'head'; // a lifted jar is held up on the head with both hands pst.landT = P.landT > 0 ? P.landT : 0;
  { const em = G.Cine && G.Cine.emoOf ? G.Cine.emoOf(EP.hero) : null; // v16.8 acting: the line's feeling, or out of breath / cold in play
    const mo = !em && G.Mood ? G.Mood.hero(dt) : null; // v17.7 P4: fear / weary from the game itself (js/mood.js)
    pst.emo = em ? em[0] : mo ? mo[0] : !Game.cineOn && (P.exhausted || (P.stam !== undefined && P.stam < 12)) && P.spd < 0.5 && !P.act && !P.swim && !P.climb && !P.ride ? 'tired' : !Game.cineOn && pst.shiver > 0.35 && P.spd < 0.5 && !P.act ? 'cold' : null; pst.emoK = em ? em[1] : mo ? mo[1] : 1; }
  if (EP.pose) EP.pose(pst, S, Game);
  if (P.downed) { pst.act = 'fallen'; pst.actT = 1; pst.speed = 0; }
  if (P.climb) { pst.act = 'climb'; pst.actT = ((P.climbPh || 0) / (PI * 2)) % 1; pst.speed = 0; pst.air = false; pst.gnd = null; pst.staff = false; }
  animHuman(P.rig, pst, tAll);
  if (P.swim) { P.rig.off[1] -= 0.0; }
  if (P.ride && G.Ride) G.Ride.riderMatrix(TMPM); else m4trs(TMPM, P.x, P.y + (EP.rootY ? EP.rootY(S, Game) : 0), P.z, P.face); P.rig.update(TMPM);
  if (Game.mode === 'play') scene.skinned.push(P.sk || (P.sk = { mesh: null, bones: P.rig.bones, outline: true, bs: [0, 0, 0, 1.8] })); if (P.sk) { P.sk.mesh = P.mesh; P.sk.bs[0] = P.x; P.sk.bs[1] = P.y + 1; P.sk.bs[2] = P.z; P.sk.tint = P.tint || null; }
  // held prop
  // only one thing in the hand: the action's own tool > a drawn weapon > the tool the player chose to hold
  const freeHand = !P.carry && !P.ride && !P.sleeping && !Game.cineOn && !(P.emote && (P.emote.k === 'eat' || P.emote.k === 'drink')) && !(pst.act && pst.act !== P.act && !(G.Acts && G.Acts.walkable(pst.act)));
  const busyP = P.actProp || (G.Combat && G.Combat.heldProp()), hk = !busyP && freeHand ? hand() : null;
  const hp = Game.mode !== 'play' ? null : busyP || (hk && !((hk === 'staff' || hk === 'hoe') && !pst.staff) ? TOOL_PROP[hk] || null : null);
  if (hp) scene.dyn.push(P.propD || (P.propD = { outline: true, m: P.propM = m4() })), P.propD.mesh = propMesh(hp), P.propD.m.set(P.rig.world[hp === 'bow' ? HBI.handL : HBI.handR]);
  if (hp && !busyP) { // carried, not in use: each tool sits in the fist the way it is really carried
    const hm = P.rig.world[HBI.handR], gy = W.heightAt(hm[12], hm[14]), A = Math.min(1, (P.spd || 0) / 2.2), sw = Math.sin(P.phase * 0.5) * A;
    const bx = -Math.sin(P.face) * 0.02, bz = -Math.cos(P.face) * 0.02; // into the fist, not in front of it
    if (hk === 'staff') m4trs(P.propD.m, hm[12] + bx, hm[13], hm[14] + bz, P.face, 0.05 + sw * 0.18, 0.06, 1, clamp((hm[13] - gy) / 0.95, 0.75, 1.3), 1); // upright, its foot on the ground, swung forward every second step
    else if (hk === 'hoe') m4trs(P.propD.m, hm[12] + bx, gy + 0.56, hm[14] + bz, P.face, 0.04 + sw * 0.14, 0.05); // leaned on like a staff, blade up
    else if (hk === 'jar' || hk === 'bigjar') m4trs(P.propD.m, hm[12], hm[13] - 0.4, hm[14], P.face, sw * 0.08); // hanging from the fist by its neck
    else m4trs(P.propD.m, hm[12], hm[13] + 0.02, hm[14], P.face, PI - 0.12 + sw * 0.1); // sickle, axe, hammer: held by the handle, head down
  }
  if (G.Hearth && Game.mode === 'play') G.Hearth.dyn(scene.dyn);
  if (G.Phys) G.Phys.dyn(scene.dyn); if (G.Loot) G.Loot.dyn(scene.dyn); if (G.Climate) G.Climate.dyn(scene.dyn);
  if (P.carry && Game.mode === 'play') scene.dyn.push({ mesh: propMesh(P.carry), m: P.carryArms ? P.rig.world[HBI.handR] : m4mul(P.carryM || (P.carryM = m4()), P.rig.world[HBI.head], m4trs(TMP2, 0, 0.36, 0)), outline: true });
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n.vis || !n.near) continue; const d = Math.hypot(n.x - CAM.x, n.z - CAM.z); if (d > 85 || (d < 1.0 && Game.mode === 'play')) continue; const sk = n.sk || (n.sk = { bones: n.rig.bones, bs: [0, 0, 0, 1.8] }); sk.mesh = npcMesh(n, d / (Game.cineOn || Game.dlgW > 0.5 ? 2.5 : 1)); sk.outline = d < 40 && !n.d.emis; sk.emis = n.d.emis; sk.tint = n.tint || n.d.tint; sk.bs[0] = n.x; sk.bs[1] = n.y + 1; sk.bs[2] = n.z; sk.bs[3] = 1.8 * (n.scale || 1); scene.skinned.push(sk); if (n.d.prop) scene.dyn.push({ mesh: propMesh(n.d.prop), m: n.rig.world[HBI.handR], outline: d < 30 }); }
  for (const a of ENT.animals) { if (!a.near) continue; const d = Math.hypot(a.x - CAM.x, a.z - CAM.z); if (d > 65 || d < 0.9) continue; const sk = a.sk || (a.sk = { mesh: a.mesh, bones: a.rig.bones, bs: [0, 0, 0, 1.6] }); sk.outline = d < 30; sk.bs[0] = a.x; sk.bs[1] = a.y + 0.7; sk.bs[2] = a.z; scene.skinned.push(sk); }
  if (EP.skinned) EP.skinned(scene.skinned, S, Game, tAll);
  if (G.Ride) G.Ride.skinned(scene.skinned, tAll); if (G.NpcAI) G.NpcAI.skinned(scene.skinned, tAll);
  // grass
  scene.grass.on = SET.quality !== 'low' && !EP.noGrass; scene.grass.center[0] = (CAM.x + P.x * 2) / 3; scene.grass.center[1] = (CAM.z + P.z * 2) / 3; scene.grass.player[0] = P.x; scene.grass.player[1] = P.y; scene.grass.player[2] = P.z;
  scene.grass.map = W.map; scene.grass.heightTex = W.heightTex; scene.grass.colTex = W.colTex; scene.grass.h = (EP.grassH || 0.72) * (SET.view === 'classic' ? 1 : 0.78);
  // flats
  scene.flats.length = 0;
  const tg = Game.target(); Game.curTarget = tg;
  if (tg && Game.mode === 'play' && !Game.cineOn) { const d = Math.hypot(tg.x - P.x, tg.z - P.z); /* v12: no light pillar — the goal is shown on the minimap and the compass; a soft ring marks it on arrival */
    m4trs(ringM, tg.x, W.heightAt(tg.x, tg.z) + 0.08, tg.z, tAll * 0.8); scene.flats.push({ mesh: ringMesh, m: ringM, color: [1, 1, 1, 0.6] }); }
  if (G.Build) G.Build.flats(scene.flats);
  if (EP.flats) EP.flats(scene.flats, S, Game, tAll);
  if (ctx && ctx.tile) { const t = ctx.tile; m4trs(tileM, t.x, W.heightAt(t.x, t.z) + 0.12, t.z, t.f.ry || 0, 0, 0, t.ts / 1.6, 1, t.ts / 1.6); scene.flats.push({ mesh: tileMesh, m: tileM, color: ctx.disabled ? [1, 0.5, 0.4, 0.6] : [1, 1, 1, 0.75] }); }
  if (G.Combat && Game.mode === 'play') G.Combat.render(scene);
  // particles
  scene.pts.n = FX.update(dt);
  const Wd = G.UI.cw, Hd = G.UI.ch;
  R.render(scene, Wd, Hd);
  Game.env = env;
}
const TMP2 = m4();

// =================================================================== HELPERS FOR EPISODES
Game.dist = (x, z) => Math.hypot(x - P.x, z - P.z);
Game.teleport = function (x, z, face) { P.x = x; P.z = z; P.y = W.heightAt(x, z); P.vx = P.vz = 0; P.vy = 0; P.grounded = true; P.airTop = P.y; /* a warp is never a fall */ if (face !== undefined) P.face = face; CAM.yaw = P.face + PI; snapCam(); for (const n of P.follow) { n.x = x - Math.sin(P.face) * 2; n.z = z - Math.cos(P.face) * 2; } };
Game.flag = (k, v) => { if (v === undefined) return S.flags[k]; S.flags[k] = v; };
Game.unlock = id => { S.unlocked[id] = true; ENT.plotsDirty = true; };
Game.sayNpc = (id, t, ref) => ({ n: ENT.npcs[id] ? ENT.npcs[id].name : id, t, ref });
Game.addDyn = function (key, buildFn, x, z, ry, extra) { if (!meshCache[key]) { const g = new GB(9); buildFn(g, m4(), rng(5)); meshCache[key] = R.mesh(g); } const d = Object.assign({ key, mesh: meshCache[key], m: m4trs(m4(), x, W.heightAt(x, z) + (extra && extra.dy || 0), z, ry || 0, 0, 0, extra && extra.s || 1) }, extra || {}); ENT.dyn.push(d); return d; };
Game.removeDyn = key => { ENT.dyn = ENT.dyn.filter(d => d.key !== key); };
Game.hour = () => S.time % 24;
Game.items = ITEMS;
Game.craft = function (r, times) {
  times = times || 1; let made = 0;
  for (let t = 0; t < times; t++) {
    if (r.st && !Game.nearStation(r.st)) { G.UI.toast(({ fire: '모닥불', loom: '베틀', press: '기름틀', tan: '가죽 장인의 작업대', smith: '대장장이 화덕' }[r.st] || '작업대') + ' 근처에서 만들 수 있어요'); break; }
    if (r.water && S.water < r.water) { G.UI.toast('항아리에 물이 필요해요'); break; }
    let ok = true; for (const k in r.in) if (!have(k, r.in[k])) ok = false; if (!ok) break;
    if (r.tool && tool(r.tool)) { G.UI.toast('이미 가지고 있어요'); break; }
    for (const k in r.in) take(k, r.in[k]); if (r.water) S.water -= r.water;
    if (r.tool) giveTool(r.tool); else for (const k in r.out) give(k, r.out[k]);
    S.stats.crafted[r.id] = (S.stats.crafted[r.id] || 0) + 1; made++; if (t === 0) sfx('craft');
  }
  G.UI.hud(); checkStep(); return made;
};
Game.recipes = () => RECIPES.filter(r => !EP.recipes || EP.recipes.includes(r.id));
Game.price = (k, mul) => Math.max(1, Math.round(ITEMS[k].p * (EP.sellMul || 1) * ((mul && mul[ITEMS[k].cat]) || 1)));
Game.sell = function (k, n, mul) { n = Math.min(n, inv(k)); if (n <= 0) return; const price = Game.price(k, mul); take(k, n); silver(price * n); S.stats.sold += n; G.UI.toast(`${ITEMS[k].n} ${n}개를 팔았다 · 은 ${price * n}`); checkStep(); };
Game.buy = function (entry) {
  if (S.silver < entry.price) { G.UI.toast('은이 부족해요'); return false; } silver(-entry.price);
  if (entry.mount) { if (!G.Ride || !G.Ride.buy(entry)) { silver(entry.price); return false; } }
  if (entry.item) give(entry.item, entry.qty || 1); if (entry.tool) giveTool(entry.tool); if (entry.gear && G.Combat) G.Combat.giveGear(entry.gear); if (entry.animal) { const pid = entry.pen(S, Game); if (!pid) { silver(entry.price); G.UI.toast(entry.noPen || '가축을 둘 우리가 없어요'); return false; } Game.addAnimal(pid, entry.animal, entry.pattern || 'plain', entry.sex, 10); G.UI.toast(`${entry.n}을(를) 우리로 보냈다`); }
  checkStep(); return true;
};
Game.eat = function (k) { const it = ITEMS[k]; const fv = G.Surv ? G.Surv.food(k) : 0; if (!(it.stam || it.hp || fv) || !take(k)) return; if (G.Acts && !P.act && !P.ride && !P.atk) { G.Acts.play(it.cat === 'drink' || k === 'milk' ? 'drink' : 'eat', { quiet: true }); if (G.Hearth) G.Hearth.eatStart(k); } if (G.Surv) G.Surv.fed(k, fv); if (it.stam) { P.stam = (S.hero && S.hero.stamMax) || 100; P.exhausted = false; } if (it.hp && S.hero) S.hero.hp = Math.min(S.hero.hpMax, S.hero.hp + it.hp); sfx('eat'); G.UI.toast(`${it.n}을(를) 먹었다 · ${[fv && Game.feat('surv') ? `배부름 +${fv}` : '', it.hp ? `체력 +${it.hp}` : '', it.stam ? '기운이 났다' : ''].filter(Boolean).join(' · ')}`); G.UI.hud(); };
Game.jump = () => { P.jumpBuf = 0.15; INPUT.jumpHeld = true; P.jumpTap = true; };
Game.jumpRelease = () => { INPUT.jumpHeld = false; P.jumpTap = false; if (P.vy > 0 && !P.grounded) P.jumpCut = true; };
Game.toggleSprint = () => { if (P.exhausted) return; P.sprint = !P.sprint; if (P.sprint && P.crouch && G.Vitals) G.Vitals.crouch(false); };
})(window.G);
