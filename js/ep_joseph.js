/* 약속의 길 — 요셉 편 · 꿈꾸는 자 (창세기 37–42장)
   구성: 그림책 오프닝(라헬의 아들, 채색옷, 두 꿈) → 프롤로그 튜토리얼(헤브론 → 세겜 → 도단: 형들을 찾아서) → 1장 구덩이(구덩이에
        던져짐 · 은 이십에 팔림 · 야곱의 애통 · 이스마엘 대상과 광야 길) → 2장 보디발의 집(애굽 말 배우기 · 종에서 가정 총무로 ·
        유혹을 피함 · 누명) → 3장 왕의 옥(차꼬 · 간수장의 신뢰 · 두 관원장의 꿈 · 잊힌 이 년) → 4장 바로의 꿈(꿈속 나일 강가 ·
        해석 · 총리 임명 · 버금 수레 행차) → 5장 일곱 해 풍년(곳간 · 므낫세와 에브라임) → 6장 일곱 해 흉년(곳간을 엶 · 형들의 절)
   지도: 동쪽은 가나안 산지(헤브론 골짜기 · 세겜 들판 · 도단 평원), 가운데는 광야, 서쪽은 나일 강이 흐르는 애굽. */
'use strict';
(function (G) {
const { fbm, vnoise, smooth, lerp, clamp, rng, m4, m4trs, m4mul, Rig, AB, HB, HBK, HBI, animAnimal, animHuman, R } = G;
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb);
const NM = {
  jacob: '야곱', benjamin: '베냐민', reuben: '르우벤', simeon: '시므온', levi: '레위', judah: '유다', dan: '단', naphtali: '납달리', gad: '갓', asher: '아셀',
  issachar: '잇사갈', zebulun: '스불론', man: '들의 사람', ishmael: '이스마엘 상인', ishBoy: '대상의 아이', midian: '미디안 상인', dinah: '디나', leah: '레아', hServ: '야곱의 종',
  auctioneer: '노예 상인', potiphar: '보디발', wife: '보디발의 아내', ameni: '늙은 종 아메니', neb: '청지기 네브', cook: '요리사 헤누', gardener: '정원지기 세티', boy: '소 치는 아이 파이',
  weaver: '베 짜는 여인 타뮈', scribe: '서기관 이피', guest1: '왕궁 관리', guest2: '신전 제사장', guest3: '군대 장교', keeper: '간수장', cupbearer: '술 맡은 관원장', baker: '떡 굽는 관원장',
  oldP: '늙은 죄수', youngP: '어린 죄수', prisA: '죄수 케티', prisB: '죄수 메루', messenger: '바로의 사자', pharaoh: '바로', magician: '애굽의 점술가', sage: '애굽의 현인',
  asenath: '아스낫', manasseh: '므낫세', ephraim: '에브라임', overseerW: '서쪽 마을 촌장', overseerS: '남쪽 마을 촌장', overseerC: '성읍 감독관', brick: '벽돌 굽는 이 우니',
  farmer: '애굽 농부', woman: '애굽 여인', elder: '애굽 노인', sidon: '시돈의 상인', edom: '에돔의 목자', canaan: '가나안의 나그네', steward2: '요셉의 청지기' };
const J = (t, ref, e) => ({ n: '요셉', t, ref, e });
const N = (id, t, ref, e) => ({ n: NM[id] || id, t, ref, e });
const T = (t, ref, e) => ({ n: '', t, ref, e });
const EG = (id, eg, ko, e) => ({ n: NM[id] || id, t: eg + (ko ? '\n(' + ko + ')' : ''), say: ko || eg, e }); // Egyptian line, Korean gloss

// ------------------------------------------------------------------ MAP
const SIZE = 480;
const nileX = z => -92 + 13 * Math.sin(z / 74) + 5 * Math.sin(z / 23 + 1);
const brookZ = x => 84 + 4 * Math.sin(x / 9);                        // 헤브론 북쪽 마른 시내(와디)
const FORDS = [-60, 100];
const PIT = { x: 168, z: -140, r: 3.0, wall: 2.35, depth: 4.4 };       // 도단의 빈 구덩이 (창 37:24)
const ROADS = [
  [[176, 146], [178, 112], [182, 76], [184, 40], [186, 4], [184, -30], [176, -66], [169, -104], [165, -132]],   // 헤브론 → 세겜 → 도단
  [[234, -158], [200, -154], [166, -150]],                                                                          // 길르앗 → 도단 (대상의 길)
  [[160, -150], [130, -124], [96, -84], [64, -34], [44, 24], [30, 76], [10, 108], [-6, 118]],                        // 도단 → 광야 → 애굽
  [[-6, 118], [-20, 92], [-28, 72], [-28, 26], [-29, 14]], [[-28, 26], [-24, -30], [-22, -60], [-24, -100], [-28, -124], [-30, -140]], // 애굽 동쪽 길: 장터 → 보디발 → 옥 → 성읍 → 궁
  [[-24, -112], [6, -130]], [[-20, -66], [14, -64]], [[-22, -84], [10, -94]],                                        // 총리의 집, 곳간, 온의 신전
  [[-30, -60], [-80, -60], [-112, -58], [-136, -44]], [[-12, 100], [-74, 100], [-118, 104], [-142, 124]],            // 서쪽 나루 → 마을들
  [[2, 52], [-6, 52]], [[-136, -44], [-150, -24]], [[-142, 124], [-158, 146]]];
function segD(x, z, a, b) { const vx = b[0] - a[0], vz = b[1] - a[1], wx = x - a[0], wz = z - a[1]; const t = clamp((wx * vx + wz * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(wx - vx * t, wz - vz * t); }
function roadD(x, z) { let b = 1e9; for (const r of ROADS) for (let i = 0; i < r.length - 1; i++) { const d = segD(x, z, r[i], r[i + 1]); if (d < b) b = d; } return b; }
const PADS = [
  { x: 176, z: 152, r: 20, set: 1 }, { x: 186, z: 32, r: 7 }, { x: 188, z: -12, r: 16 }, { x: 160, z: -148, r: 20, set: 1 },          // 가나안
  { x: -8, z: 118, r: 17, set: 1 }, { x: -28, z: 53, r: 31, set: 1 }, { x: -30, z: 2, r: 21, set: 1 }, { x: -22, z: -74, r: 30, set: 1 },  // 장터 · 보디발 · 옥 · 성읍
  { x: -30, z: -162, r: 34, set: 1, dh: 0.4 }, { x: 10, z: -140, r: 13, set: 1 }, { x: 16, z: -64, r: 9, set: 1 }, { x: 12, z: -96, r: 12, set: 1 },  // 궁 · 총리의 집 · 곳간 · 신전
  { x: -140, z: -40, r: 22, set: 1 }, { x: -145, z: 128, r: 22, set: 1 }, { x: -152, z: -20, r: 8, set: 1 }, { x: -160, z: 150, r: 8, set: 1 },
  { x: -78, z: -200, r: 22, keep: 1 }, { x: 6, z: 56, r: 16 }];
const fert = (x, z) => 1 - smooth(34, 70, Math.abs(x - nileX(z)));     // 검은 땅 (범람원)
const canaanK = x => smooth(92, 126, x);
function baseH(x, z) {
  const C = canaanK(x);
  let h = 1.2 + fbm(x * 0.006 + 3, z * 0.006 - 2, 4) * 6;
  // Canaan hill country
  h += C * (2 + fbm(x * 0.011 + 11, z * 0.011 - 5, 4) * 22 + Math.max(0, fbm(x * 0.03, z * 0.03, 2) - 0.5) * 10);
  // the open desert between: dunes
  const D = smooth(18, 46, x) * (1 - C);
  if (D > 0) { const n1 = vnoise(x * 0.028 + 7, z * 0.04 - 3), ridge = 1 - Math.abs(2 * n1 - 1); h += D * (Math.pow(ridge, 1.7) * 4.2 + fbm(x * 0.014 - 9, z * 0.014 + 4, 3) * 4); }
  // Egypt: flat flood plain along the Nile, desert plateau beyond it on both sides
  const F = fert(x, z), west = smooth(-150, -185, x);
  h = lerp(h, 1.1 + fbm(x * 0.03, z * 0.03, 2) * 0.6, F * (1 - C));
  h += west * (6 + fbm(x * 0.02, z * 0.02, 3) * 8);
  return h;
}
for (const p of PADS) p.h = (p.keep ? baseH(p.x, p.z) - 0.2 : baseH(p.x, p.z)) + (p.dh || 0);
const padAt = (x, z) => { for (const p of PADS) if (Math.hypot(x - p.x, z - p.z) < p.r) return p; return null; };
function height(x, z) {
  let h = baseH(x, z);
  for (const p of PADS) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r + 12) h = lerp(h, p.h, 1 - smooth(p.r, p.r + 12, d)); }
  const rd = roadD(x, z); if (rd < 7) { // roads cut a gentle shelf through the hills
    const C = canaanK(x); if (C > 0.1) { let lo = 1e9; for (const r of ROADS) for (let i = 0; i < r.length - 1; i++) if (segD(x, z, r[i], r[i + 1]) < 7) { const a = r[i], b = r[i + 1]; const vx = b[0] - a[0], vz = b[1] - a[1], t = clamp(((x - a[0]) * vx + (z - a[1]) * vz) / (vx * vx + vz * vz), 0, 1); lo = Math.min(lo, lerp(baseH(a[0], a[1]), baseH(b[0], b[1]), t)); }
      if (lo < 1e8) h = lerp(h, Math.min(h, lo + 0.5), (1 - smooth(3, 7, rd)) * C * 0.85); }
    h -= (1 - smooth(1.5, 5, rd)) * 0.15; }
  // Nile channel and its two fords
  const dn = Math.abs(x - nileX(z)); let ford = 0; for (const f of FORDS) ford = Math.max(ford, 1 - smooth(5, 12, Math.abs(z - f)));
  h = lerp(h, Math.min(h, 0.75), 1 - smooth(10, 24, dn)); h = lerp(h, lerp(-2.8, -0.72, ford), 1 - smooth(6, 12.5, dn));
  // a dry wadi north of Hebron (summer stream bed)
  if (x > 120) { const db = Math.abs(z - brookZ(x)); h -= (1 - smooth(1.2, 4.5, db)) * 0.55; }
  // the empty pit at Dothan
  // v12: a cistern cut straight down into level ground (it used to be a sloped bowl, so the stone shaft showed above the slope)
  const dp = Math.hypot(x - PIT.x, z - PIT.z); if (dp < 15) { const rim = padH(PIT.x, PIT.z); h = lerp(rim, h, smooth(7, 15, dp)); if (dp < PIT.wall + 2.4) h = lerp(rim - PIT.depth, h, smooth(PIT.wall + 0.95, PIT.wall + 2.4, dp)); } // the terrain grid is coarse: the cut is wide, and a ground collar (pitWell) covers its slope
  const e = Math.max(Math.abs(x), Math.abs(z)); h += smooth(196, 236, e) * (22 + 10 * fbm(x * 0.02, z * 0.02, 2));
  return h;
}
function padH(x, z) { const p = padAt(x, z); return p ? p.h : baseH(x, z); }
PIT.floor = padH(PIT.x, PIT.z) - PIT.depth; PIT.rim = padH(PIT.x, PIT.z);
/* v16.9 the trodden-earth collar round the pit lies flush with the field, but the coarse terrain under it slopes down into the
   cut — people standing or walking on the collar sank into it (and the camera/drag shots dipped). The collar is a floor now. */
function pitFloor(x, z) { const d = Math.hypot(x - PIT.x, z - PIT.z); return d > PIT.wall + 0.3 && d < PIT.wall + 4.6 ? PIT.rim + 0.03 : null; }
function aridAt(x, z) { const C = canaanK(x); return clamp((1 - fert(x, z)) * (1 - C) * 0.9 + C * 0.25, 0, 1); }
function waterDist(x, z) { return Math.max(0, Math.abs(x - nileX(z)) - 8); }
// season of the land: 'normal' | 'plenty' | 'famine' (ch5/6 recolour the terrain)
let LAND = 'normal';
function color(x, z, h, ny) {
  const n = fbm(x * 0.045, z * 0.045, 3), n2 = vnoise(x * 0.18, z * 0.18), C = canaanK(x), F = fert(x, z) * (1 - C);
  const sand = [0.86 + n * 0.05, 0.74 + n * 0.04, 0.52 + n2 * 0.04];
  let c = sand, dens = 0.08 + n * 0.08;
  // Canaan: green-gold hill pasture with grey limestone
  if (C > 0) { const g = [0.44 + n * 0.08, 0.58 + n * 0.06, 0.28 + n2 * 0.03]; c = c.map((v, i) => lerp(v, g[i], C)); dens = lerp(dens, 0.8 * (0.6 + 0.4 * n), C);
    const rock = smooth(0.3, 0.5, 1 - ny) * 0.9 + Math.max(0, n2 - 0.72) * 2; if (rock > 0) { c = c.map((v, i) => lerp(v, [0.72, 0.69, 0.62][i] * (0.92 + n2 * 0.1), clamp(rock, 0, 1) * C)); dens *= 1 - clamp(rock, 0, 0.9); } }
  // Egypt: black fertile soil and green fields near the river
  if (F > 0) { const lush = LAND === 'famine' ? [0.62, 0.52, 0.34] : LAND === 'plenty' ? [0.3, 0.6, 0.2] : [0.36, 0.56, 0.24];
    const soil = LAND === 'famine' ? [0.55, 0.46, 0.33] : [0.32, 0.28, 0.2];
    const field = Math.sin(x * 0.21) * Math.sin(z * 0.17) > -0.2 ? lush : soil;
    c = c.map((v, i) => lerp(v, lerp(field[i], lush[i], 0.5) * (0.92 + n * 0.12), F)); dens = lerp(dens, LAND === 'famine' ? 0.12 : LAND === 'plenty' ? 1 : 0.85, F); }
  // rocky desert plateaus
  const west = smooth(-150, -185, x); if (west > 0) { c = c.map((v, i) => lerp(v, [0.84, 0.7, 0.5][i] * (0.94 + n2 * 0.08), west)); dens *= 1 - west; }
  if (x > 120) { const db = Math.abs(z - brookZ(x)); if (db < 3.5) { const k = 1 - smooth(1.2, 3.5, db); c = c.map((v, i) => lerp(v, [0.7, 0.66, 0.58][i] * (0.9 + n2 * 0.2), k)); dens *= 1 - k * 0.8; } }
  const dw = waterDist(x, z); if (dw < 6) { const k = 1 - smooth(1.5, 6, dw); c = c.map((v, i) => lerp(v, [0.42, 0.4, 0.3][i], k * 0.8)); dens *= 1 - k * 0.7; }
  for (const p of PADS) if (p.set) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r) { const k = 1 - smooth(p.r * 0.55, p.r, d); const pc = C > 0.5 ? [0.74, 0.66, 0.5] : [0.85, 0.77, 0.6]; c = c.map((v, i) => lerp(v, pc[i] * (0.95 + n2 * 0.08), k * 0.85)); dens *= 1 - k; } }
  const rd = roadD(x, z); if (rd < 3) { const k = 1 - smooth(1.2, 3, rd); c = c.map((v, i) => lerp(v, [0.8, 0.7, 0.52][i], k * 0.9)); dens *= 1 - k; }
  const dp = Math.hypot(x - PIT.x, z - PIT.z); if (dp < PIT.r + 2) { c = [0.55, 0.47, 0.38]; dens = 0; }
  const e = Math.max(Math.abs(x), Math.abs(z)); if (e > 196) { const k = smooth(196, 225, e); c = c.map((v, i) => lerp(v, C > 0.5 ? [0.58, 0.56, 0.48][i] : [0.78, 0.64, 0.46][i], k)); }
  if (LAND === 'famine') dens *= 0.35;
  return [c[0], c[1], c[2], dens];
}
// named places
const SPOTS = {
  hebron: [176, 152], jacobTent: [170, 147], josephTent: [183, 157], bedHeb: [184.57, 157.69], log: [181.1, 84], restOak: [186, 32], restBed: [184, 34.5],
  shechem: [188, -12], clue1: [178, -6], clue2: [197, -21], clue3: [186, -31], manSpot: [196, -36], dothanView: [169, -100], dothanCamp: [160, -148],
  caravanStart: [200, -154], caravanNight: [60, -28], egyptGate: [26, 86], market: [-8, 118], block: [-10, 114],
  pGate: [-28, 71], pHouse: [-28, 42], quarters: [-45, 53], kitchen: [-12, 45], well: [-38, 61], pool: [-18, 58], store: [-12, 64], loom: [-44, 64], quern: [-14, 49],
  flax: [6, 44], barley: [6, 61], cattle: [9, 76], canal: [-1.5, 70], prisonGate: [-30, 14], cell: [-18, -5.5], window: [-18, -8], yard: [-32, 3], keeperHouse: [-19, 7], basin: [-40, 9],
  city: [-22, -72], granaryA: [16, -64], temple: [12, -96], palaceGate: [-30, -140], throne: [-30, -175], court: [-30, -166], josephHouse: [10, -140], dream: [-78, -200],
  westVillage: [-140, -40], granaryB: [-152, -20], southVillage: [-145, 128], granaryC: [-160, 150], fordN: [-92, -60], fordS: [-80, 100] };
const PLACES = [{ n: '헤브론 골짜기', x: 176, z: 152, k: 'town' }, { n: '상수리나무 쉼터', x: 186, z: 32 }, { n: '세겜 들판', x: 188, z: -12, k: 'town' }, { n: '도단', x: 160, z: -148, k: 'town' },
  { n: '광야 길', x: 70, z: -30 }, { n: '노예 장터', x: -8, z: 118, k: 'town' }, { n: '보디발의 집', x: -28, z: 53, k: 'town' }, { n: '왕의 옥', x: -30, z: 2 }, { n: '왕의 도성', x: -22, z: -72, k: 'town' },
  { n: '바로의 궁', x: -30, z: -162, k: 'town' }, { n: '총리의 집', x: 10, z: -140 }, { n: '성읍 곳간', x: 16, z: -64 }, { n: '온의 신전', x: 12, z: -96 }, { n: '나일 강', x: -96, z: 20 },
  { n: '서쪽 마을', x: -140, z: -40, k: 'town' }, { n: '남쪽 마을', x: -145, z: 128, k: 'town' }, { n: '피라미드', x: -200, z: -170 }, { n: '고센 땅 (광야 가장자리)', x: 78, z: 60 }, { n: '북쪽 나루', x: -92, z: -60 }, { n: '남쪽 나루', x: -80, z: 100 }];

// ------------------------------------------------------------------ props for this episode
const PI = Math.PI;
const WHITE = 0xeee6d2, SAND = 0xe4d2a9, LAPIS = 0x2c5aa0, OCHRE = 0xb3472e, TURQ = 0x2f8a77, GOLD = 0xd9a73a, MUD = 0xc49a6c, WOOD = 0x7a5a3a, LINEN = 0xf4efe2;
const band = (g, M, w, y, d, z) => { g.box(w, 0.22, 0.04, { m: M, at: [0, y, z], c: (x) => [LAPIS, OCHRE, TURQ, GOLD][Math.floor((x + w) * 1.4) % 4], j: 0 }); };
const ENVX = {
  egWall(g, M, r, len, h, col) { h = h || 3; const c = col || WHITE; g.box(len, h, 0.7, { m: M, at: [0, h / 2, 0], c, j: 0.02 }); g.box(len + 0.1, 0.18, 0.86, { m: M, at: [0, h + 0.06, 0], c: 0xd8c8a8, j: 0.02 }); },
  mudWall(g, M, r, len, h) { h = h || 2.4; const n = Math.max(1, Math.round(len / 2)); for (let i = 0; i < n; i++) g.box(len / n + 0.02, h, 0.6, { m: M, at: [-len / 2 + (i + 0.5) * len / n, h / 2, 0], c: [0xc49a6c, 0xbc9264, 0xcaa274][i % 3], j: 0.03 }); },
  portico(g, M, r, w, d, h, n) { // flat roof on painted papyrus columns + back wall: the open front hall of a great house
    h = h || 4; n = n || 6; g.box(w, h, 0.6, { m: M, at: [0, h / 2, -d / 2], c: WHITE, j: 0.02 }); band(g, M, w, h - 0.6, 0, -d / 2 + 0.31);
    for (const s of [1, -1]) g.box(0.6, h, d, { m: M, at: [s * (w / 2 - 0.3), h / 2, 0], c: WHITE, j: 0.02 });
    for (let i = 0; i < n; i++) { const x = -w / 2 + 1.2 + i * (w - 2.4) / (n - 1); g.cyl(0.3, 0.34, h - 0.3, 10, { m: M, at: [x, (h - 0.3) / 2, d / 2 - 0.5], c: SAND, j: 0.02 }); g.cyl(0.46, 0.3, 0.5, 10, { m: M, at: [x, h - 0.45, d / 2 - 0.5], c: TURQ }); g.cyl(0.32, 0.32, 0.16, 10, { m: M, at: [x, h * 0.7, d / 2 - 0.5], c: OCHRE }); }
    g.box(w + 0.6, 0.35, d + 0.4, { m: M, at: [0, h + 0.1, 0], c: 0xe6dcc4, j: 0.02 }); band(g, M, w + 0.6, h + 0.1, 0, d / 2 + 0.21);
    g.box(w - 1.4, 0.06, d - 1.4, { m: M, at: [0, 0.04, -0.2], c: (x, y, z) => (Math.floor(x * 0.8) + Math.floor(z * 0.8)) % 2 ? 0xd8c8a4 : 0xcab890, j: 0 }); },
  pavilion(g, M, r, w, d, h, col) { h = h || 2.6; for (const [x, z] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2], [0, d / 2], [0, -d / 2]]) g.cyl(0.12, 0.14, h, 6, { m: M, at: [x, h / 2, z], c: WOOD });
    g.box(w + 0.6, 0.18, d + 0.6, { m: M, at: [0, h + 0.05, 0], c: col || 0xc8b48a, j: 0.04 }); for (let i = 0; i < 7; i++) g.cyl(0.05, 0.05, d + 0.8, 4, { m: M, at: [-w / 2 + i * w / 6, h + 0.18, 0], rx: PI / 2, c: 0x9a7a4a }); },
  oven(g, M) { g.lathe([[0.75, 0], [0.8, 0.4], [0.62, 0.9], [0.28, 1.15], [0.2, 1.2]], 12, { m: M, c: 0xb07448, j: 0.04 }); g.box(0.45, 0.4, 0.1, { m: M, at: [0, 0.35, 0.74], c: 0x2a1810, j: 0 }); g.sph(0.12, 6, 4, { m: M, at: [0, 0.3, 0.8], c: 0xff8a3a, j: 0.1 }); },
  quern(g, M) { g.box(1.0, 0.25, 0.55, { m: M, at: [0, 0.13, 0], c: 0x8a8278, j: 0.06, flat: true }); g.box(0.5, 0.14, 0.32, { m: M, at: [0.05, 0.32, 0], c: 0x9a9288, j: 0.06 }); g.sph(0.18, 6, 4, { m: M, at: [0.62, 0.12, 0.1], s: [1, 0.4, 1], c: 0xe8d8a0 }); },
  jars(g, M, r, n) { n = n || 4; for (let i = 0; i < n; i++) g.lathe([[0.06, 0], [0.24, 0.18], [0.27, 0.5], [0.16, 0.85], [0.1, 0.95], [0.13, 1.02]], 10, { m: M, at: [(i - (n - 1) / 2) * 0.62, 0, (i % 2) * 0.2], c: [0xc8865a, 0xb5673a, 0xd09868][i % 3] }); },
  shelves(g, M, r, kind) { g.box(2.4, 1.9, 0.5, { m: M, at: [0, 0.95, -0.15], c: 0x8a6a48, j: 0.03 }); for (const y of [0.55, 1.2]) g.box(2.5, 0.06, 0.62, { m: M, at: [0, y, 0.05], c: 0x6a4a30 });
    const col = { wine: 0x8a3a3a, oil: 0xd8b860, grain: 0xe2cfa0, figs: 0x6a4a6a }[kind] || 0xb5673a;
    for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { const y = 0.6 + k * 0.65; if (kind === 'grain') g.lathe([[0.12, 0], [0.2, 0.12], [0.19, 0.35], [0.09, 0.48], [0.12, 0.52]], 8, { m: M, at: [-0.9 + i * 0.6, y, 0.08], c: col }); else if (kind === 'figs') { g.cyl(0.22, 0.17, 0.2, 8, { m: M, at: [-0.9 + i * 0.6, y + 0.1, 0.08], c: 0xa57a3c }); g.sph(0.15, 6, 4, { m: M, at: [-0.9 + i * 0.6, y + 0.22, 0.08], s: [1, 0.5, 1], c: col }); }
      else g.lathe([[0.04, 0], [0.13, 0.1], [0.15, 0.3], [0.08, 0.48], [0.07, 0.56]], 8, { m: M, at: [-0.9 + i * 0.6, y, 0.08], c: kind === 'oil' ? 0xc8a050 : 0xb5673a }); } },
  room(g, M, r, w, d, h, doorW) { // walled storeroom open at the front door, flat roof
    h = h || 3; doorW = doorW || 1.6; g.box(w, h, 0.5, { m: M, at: [0, h / 2, -d / 2], c: WHITE, j: 0.02 }); for (const s of [1, -1]) g.box(0.5, h, d, { m: M, at: [s * w / 2, h / 2, 0], c: WHITE, j: 0.02 });
    const side = (w - doorW) / 2; for (const s of [1, -1]) g.box(side, h, 0.5, { m: M, at: [s * (doorW / 2 + side / 2), h / 2, d / 2], c: WHITE, j: 0.02 }); g.box(doorW, 0.6, 0.5, { m: M, at: [0, h - 0.3, d / 2], c: WHITE });
    g.box(w + 0.4, 0.22, d + 0.4, { m: M, at: [0, h + 0.05, 0], c: 0xe0d4b8, j: 0.02 }); band(g, M, w, h - 0.45, 0, d / 2 + 0.26); },
  pool(g, M, r, w, d) { g.box(w + 0.8, 0.35, d + 0.8, { m: M, at: [0, 0.12, 0], c: 0xd8c8a4 }); g.box(w, 0.06, d, { m: M, at: [0, 0.31, 0], c: 0x3a7a8a, j: 0 });
    for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * (w - 0.8), z = (r() - 0.5) * (d - 0.8); g.cyl(0.28, 0.28, 0.02, 8, { m: M, at: [x, 0.35, z], c: 0x4a8a4a, j: 0.1 }); if (i % 3 === 0) g.sph(0.09, 6, 4, { m: M, at: [x + 0.1, 0.42, z], c: [0xf0e0f0, 0x8aa0e0, 0xf0f0f8][i % 3] }); } },
  cellRow(g, M, r, n, w, d, h) { // prison cells: back wall, side walls, roof, iron/wood bars in front
    h = h || 2.8; const W2 = n * w; g.box(W2, h, 0.5, { m: M, at: [0, h / 2, -d / 2], c: 0xb8a888, j: 0.03 }); g.box(W2 + 0.5, 0.25, d + 0.3, { m: M, at: [0, h + 0.05, 0], c: 0xa89878, j: 0.03 });
    for (let i = 0; i <= n; i++) g.box(0.4, h, d, { m: M, at: [-W2 / 2 + i * w, h / 2, 0], c: 0xb0a080, j: 0.03 });
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) g.cyl(0.035, 0.035, h - 0.2, 4, { m: M, at: [-W2 / 2 + i * w + 0.5 + k * (w - 1) / 8, (h - 0.2) / 2, d / 2 - 0.1], c: 0x4a3a2a, j: 0 });
    for (let i = 0; i < n; i++) g.box(w - 0.4, 0.12, 0.12, { m: M, at: [-W2 / 2 + (i + 0.5) * w, 1.9, d / 2 - 0.1], c: 0x4a3a2a }); },
  straw(g, M, r) { g.box(1.8, 0.1, 0.8, { m: M, at: [0, 0.05, 0], c: 0xc8b070, j: 0.1 }); },
  dais(g, M, r, w, d, h) { g.box(w, h, d, { m: M, at: [0, h / 2, 0], c: SAND, j: 0.02 }); for (let i = 0; i < 3; i++) g.box(w * 0.5, h / 3, 0.4, { m: M, at: [0, h / 6 + i * h / 3 - 0.02, d / 2 + 0.6 - i * 0.4], c: 0xd8c49a }); band(g, M, w, h - 0.2, 0, d / 2 + 0.02); },
  throne(g, M) { g.box(1.2, 0.5, 1.0, { m: M, at: [0, 0.25, 0], c: GOLD }); g.box(1.2, 1.5, 0.15, { m: M, at: [0, 1.0, -0.45], c: GOLD }); for (const s of [1, -1]) g.box(0.12, 0.45, 0.9, { m: M, at: [s * 0.55, 0.7, 0], c: LAPIS });
    for (const [x, z] of [[-1.5, -1.2], [1.5, -1.2], [-1.5, 1.4], [1.5, 1.4]]) g.cyl(0.08, 0.08, 3.6, 6, { m: M, at: [x, 1.8, z], c: GOLD }); g.box(3.4, 0.12, 2.9, { m: M, at: [0, 3.6, 0.1], c: (x) => Math.floor((x + 2) * 3) % 2 ? LAPIS : WHITE }); },
  brazier(g, M) { g.cyl(0.05, 0.08, 1.1, 6, { m: M, at: [0, 0.55, 0], c: 0x6a5a3a }); g.lathe([[0.1, 1.05], [0.42, 1.25], [0.46, 1.4]], 10, { m: M, c: 0xb08a4a }); g.sph(0.28, 6, 4, { m: M, at: [0, 1.38, 0], s: [1, 0.5, 1], c: 0xff9a3a, j: 0.15 }); },
  logX(g, M) { g.cyl(0.34, 0.4, 7.5, 9, { m: M, at: [0, 0.38, 0], rz: PI / 2, c: 0x6a4a30, j: 0.06 }); for (let i = 0; i < 4; i++) g.cyl(0.07, 0.1, 1.1, 5, { m: M, at: [-2.6 + i * 1.8, 0.75, 0.15], rz: 0.6 - i * 0.3, rx: 0.4, c: 0x5a3a24 }); g.sph(0.45, 7, 5, { m: M, at: [3.8, 0.4, 0], s: [0.6, 1, 1], c: 0x8a6a48, flat: true }); },
  pitWell(g, M, r) { // the cistern: stone-lined walls (seen from inside) and a ring of rim stones
    const R0 = PIT.wall, H = PIT.depth + 0.06, n = 22;
    for (let k = 0; k < Math.ceil(H / 0.42); k++) for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * PI * 2, y = 0.2 + k * 0.42; g.box(0.72, 0.44, 0.4, { m: M, at: [Math.cos(a) * (R0 + 0.2), y, Math.sin(a) * (R0 + 0.2)], ry: -a + PI / 2, c: [0x9a8a72, 0x8a7a64, 0xa89880, 0x7a6c58][(i + k) % 4], j: 0.08, flat: true }); }
    g.cyl(R0 + 0.1, R0 + 0.1, 0.05, 16, { m: M, at: [0, 0.02, 0], c: 0x6a5a48, j: 0.1 });
    g.lathe([[R0 + 4.6, PIT.depth - 0.12], [R0 + 3.6, PIT.depth - 0.03], [R0 + 2.4, PIT.depth - 0.0], [R0 + 1.3, PIT.depth + 0.01], [R0 + 0.3, PIT.depth + 0.03]], 48, { m: M, c: 0x9a8668, j: 0.05 });
    g.lathe([[R0 + 0.48, -0.1], [R0 + 0.5, PIT.depth * 0.5], [R0 + 0.48, PIT.depth + 0.02]], 32, { m: M, c: 0x7e6a50, j: 0.06 }); // v13: packed earth behind the stones — nothing of the shaft shows from outside // v12: one smooth collar of trodden earth, flush with the field, over the coarse terrain slope
    for (let i = 0; i < 13; i++) { const a = (i + r() * 0.5) / 13 * PI * 2, rr = R0 + 0.55 + r() * 0.35; g.sph(0.28 + r() * 0.2, 6, 4, { m: M, at: [Math.cos(a) * rr, PIT.depth + 0.04, Math.sin(a) * rr], ry: r() * 6, s: [1.2 + r() * 0.5, 0.35 + r() * 0.2, 0.9 + r() * 0.3], c: [0xa89880, 0x9a8a72, 0xb8a890][i % 3], flat: true, j: 0.08 }); }
    for (let i = 0; i < 5; i++) g.sph(0.2 + r() * 0.15, 5, 4, { m: M, at: [(r() - 0.5) * 2.4, 0.12, (r() - 0.5) * 2.4], c: 0x8a7a64, flat: true }); },
  cistern(g, M, r) { g.cyl(1.5, 1.7, 0.4, 12, { m: M, at: [0, 0.18, 0], c: 0xa89880, flat: true, j: 0.08 }); g.cyl(1.1, 1.1, 0.05, 12, { m: M, at: [0, 0.38, 0], c: 0x1a1612, j: 0 }); },
  fort(g, M) { g.box(5, 7, 5, { m: M, at: [0, 3.5, 0], c: MUD, j: 0.03, taper: 0.92 }); for (let i = 0; i < 4; i++) for (const s of [1, -1]) { g.box(0.8, 0.7, 0.8, { m: M, at: [-1.8 + i * 1.2, 7.2, s * 2.1], c: 0xb48a5c }); g.box(0.8, 0.7, 0.8, { m: M, at: [s * 2.1, 7.2, -1.8 + i * 1.2], c: 0xb48a5c }); } g.box(1.2, 2, 0.1, { m: M, at: [0, 1, 2.52], c: 0x3a2618 }); },
  felucca(g, M) { g.lathe([[0.05, -2.4], [0.5, -1.6], [0.7, 0], [0.5, 1.6], [0.05, 2.4]], 8, { m: M, at: [0, 0.3, 0], s: [1, 0.32, 1], rz: PI / 2, c: 0x8a6440 }); g.cyl(0.05, 0.06, 4.2, 5, { m: M, at: [0, 2.3, -0.4], c: WOOD });
    g.tri([0, 4.3, -0.4], [0, 0.9, -2.0], [0, 0.9, 1.6], { m: M, c: 0xf4ecd8 }); g.tri([0, 4.3, -0.4], [0, 0.9, 1.6], [0, 0.9, -2.0], { m: M, c: 0xe8dcc0 }); },
  camelSit(g, M) { g.sph(0.6, 9, 7, { m: M, at: [0, 0.55, 0], s: [0.75, 0.6, 1.4], c: 0xc9a46c }); g.sph(0.35, 8, 6, { m: M, at: [0, 1.05, -0.05], c: 0xc9a46c }); g.cyl(0.1, 0.14, 0.9, 6, { m: M, at: [0, 1.0, 0.9], rx: 0.45, c: 0xc9a46c }); g.sph(0.14, 7, 5, { m: M, at: [0, 1.38, 1.12], s: [0.8, 0.8, 1.5], c: 0xc9a46c }); g.box(0.9, 0.3, 0.9, { m: M, at: [0, 1.25, 0], c: 0xb3472e }); },
  bales(g, M, r) { for (let i = 0; i < 5; i++) g.box(0.8, 0.5, 0.6, { m: M, at: [(i % 3) * 0.85 - 0.85, 0.25 + Math.floor(i / 3) * 0.5, 0], ry: (r() - 0.5) * 0.3, c: [0xc8a878, 0xb8946a, 0xd8b888][i % 3] }); },
  sheafField(g, M, r, n) { for (let i = 0; i < (n || 10); i++) { const x = (r() - 0.5) * 9, z = (r() - 0.5) * 6; g.cyl(0.16, 0.24, 0.9, 7, { m: M, at: [x, 0.45, z], c: 0xe2b844, j: 0.06 }); g.cyl(0.25, 0.25, 0.06, 7, { m: M, at: [x, 0.5, z], c: 0x9a6a2a }); } },
  tableEg(g, M) { g.box(1.8, 0.08, 0.8, { m: M, at: [0, 0.8, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.8, -0.3], [0.8, -0.3], [-0.8, 0.3], [0.8, 0.3]]) g.cyl(0.04, 0.04, 0.8, 5, { m: M, at: [x, 0.4, z], c: 0x6a4a30 }); },
  couch(g, M) { g.box(2.0, 0.45, 0.8, { m: M, at: [0, 0.32, 0], c: 0x8a6440 }); g.box(2.0, 0.12, 0.8, { m: M, at: [0, 0.6, 0], c: LINEN }); g.box(0.2, 0.5, 0.8, { m: M, at: [-0.95, 0.75, 0], c: 0x8a6440 }); },
  seatEg(g, M) { g.box(0.6, 0.45, 0.55, { m: M, at: [0, 0.22, 0], c: 0x8a6440 }); g.box(0.6, 0.5, 0.08, { m: M, at: [0, 0.65, -0.24], c: 0x8a6440 }); },
  palmRow(g, M, r, n) { for (let i = 0; i < n; i++) G.env.datePalm(g, m4mul(m4(), M, m4trs(m4(), i * 4, 0, (r() - 0.5) * 0.6, r() * 6)), r); },
  hieroWall(g, M, r, len, h) { ENVX.egWall(g, M, r, len, h, SAND); for (let i = 0; i < Math.floor(len / 0.9); i++) for (let k = 0; k < 3; k++) if (r() < 0.75) g.box(0.32, 0.36, 0.04, { m: M, at: [-len / 2 + 0.6 + i * 0.9, h * 0.35 + k * 0.55, 0.37], c: [LAPIS, OCHRE, 0x2a2018, TURQ][Math.floor(r() * 4)], j: 0 }); },
  gatePosts(g, M, r, w) { for (const s of [1, -1]) g.box(1.2, 4, 1.4, { m: M, at: [s * (w / 2 + 0.6), 2, 0], c: WHITE, j: 0.02, taper: 0.9 }); g.box(w + 2.6, 0.7, 1.6, { m: M, at: [0, 4.1, 0], c: 0xe6dcc4 }); band(g, M, w + 2.6, 4.0, 0, 0.82); },
  crops(g, M, r, w, d, ripe) { for (let i = 0; i < Math.round(w / 1.1); i++) { const x = -w / 2 + (i + 0.5) * w / Math.round(w / 1.1); g.box(0.7, 0.08, d, { m: M, at: [x, 0.03, 0], c: 0x4a3a2a, j: 0.03 });
      for (let k = 0; k < Math.round(d / 0.5); k++) { const z = -d / 2 + (k + 0.5) * 0.5, h = 0.5 + r() * 0.3; g.cyl(0.02, 0.05, h, 3, { m: M, at: [x + (r() - 0.5) * 0.3, h / 2, z], c: ripe ? [0xd8b850, 0xe0c060][k % 2] : [0x6aa048, 0x7ab050][k % 2], sw: 0.6 }); } } },
  loomX(g, M) { g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [-0.9, 1.1, 0], c: WOOD }); g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [0.9, 1.1, 0], c: WOOD }); g.cyl(0.06, 0.06, 2, 6, { m: M, at: [0, 2.1, 0], rz: PI / 2, c: WOOD });
    g.box(1.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: (x, y) => (Math.floor((y + 2) * 8) % 2 ? LINEN : 0xe0d8c4) }); },
  dovecote(g, M) { g.lathe([[1.1, 0], [1.0, 2.2], [0.6, 3.4], [0.2, 3.9]], 10, { m: M, c: MUD, j: 0.04 }); for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; g.box(0.12, 0.12, 0.05, { m: M, at: [Math.cos(a) * 0.9, 2.6, Math.sin(a) * 0.9], ry: -a, c: 0x2a1810, j: 0 }); } },
};
function tentHeb(g, M, r, col) { G.env.tent(g, M, r, col); }

// ------------------------------------------------------------------ BUILD
function build(W, Game) {
  const r = rng(91); W.nodes = []; let nid = 0;
  const node = (type, x, z, s) => { if (waterDist(x, z) < 4 && type !== 'reeds') return; W.nodes.push({ id: 'n' + (nid++), type, x, y: W.heightAt(x, z), z, ry: r() * 6, s: s || (0.85 + r() * 0.3) }); };
  // roofed buildings you can walk into register their roof, so the camera knows to stay under the ceiling inside them
  const CANOPY = { oak: [3.6, 11.5, 6], olive: [1.8, 6, 3.5], fig: [1.6, 5.2, 3.6], acacia: [3, 6.2, 4.5], tamarisk: [2, 7, 3.2], datePalm: [8, 12.5, 3.5], palm: [8, 13, 3.5] };
  W.canopies = [];
  const ROOFED = { portico: a => [a[0], a[1], a[2] || 4], room: a => [a[0], a[1], a[2] || 3], cellRow: a => [a[0] * a[1], a[2], a[3] || 2.8], pavilion: a => [a[0], a[1], a[2] || 2.6] };
  const P = (fn, x, z, o) => {
    if (fn === 'egHouse' && o) { // v12: houses were one low storey; raise them to a proper two-storey height (model and collider together)
      o = Object.assign({}, o); if (o.args && o.args[0]) o.args = [Object.assign({}, o.args[0], { h: (o.args[0].h || 3) * 1.45 })]; if (o.col) o.col = Object.assign({}, o.col, { h: (o.col.h || 3) * 1.45 }); }
    // v18.8: on phones (GG.treeLod) the trees standing beside the roads are left out, and the forest is thinned by a third (trees were most of the world's triangles); trees near a story place (SPOTS / PADS) are kept.
    if (GG.treeLod && typeof fn === 'string' && CANOPY[fn] && !(o && o.keep)) {
      const road = roadD(x, z) < 11, thin = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 < 0.34;
      if ((road || thin) && !PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r + 12) && !Object.keys(SPOTS).some(k => { const q = SPOTS[k]; return Array.isArray(q) && Math.hypot(x - q[0], z - q[1]) < 12; })) { W.skippedTrees = (W.skippedTrees || 0) + 1; return { x, y: W.heightAt(x, z), z }; }
    }
    if (typeof fn === 'string') o = Object.assign({ kind: fn }, o || {}); // v16.1: lets W.place give it a default collider by name
    if (fn === 'palmRow' && (!o || o.col === undefined)) { const n = (o && o.args && o.args[0]) || 3, a = (o && o.ry) || 0; for (let i = 0; i < n; i++) W.addCol({ x: x + Math.cos(a) * i * 4, z: z - Math.sin(a) * i * 4, r: 0.32, h: 5 }); }
    const res = W.place(typeof fn === 'string' && ENVX[fn] ? ENVX[fn] : fn, x, z, o);
    if (typeof fn === 'string' && CANOPY[fn]) { const c = CANOPY[fn], k = (o && o.s) || 1; (W.canopies = W.canopies || []).push({ x, z, y0: res.y + c[0] * k, y1: res.y + c[1] * k, r: c[2] * k }); } // v15: tree crowns, so cutscene cameras keep out of them
    if (typeof fn === 'string' && ROOFED[fn] && W.addRoof) { const [w, d, h] = ROOFED[fn]((o && o.args) || []); W.addRoof({ x, z, w, d, a: (o && o.ry) || 0, y: res.y + h, k: fn }); }
    return res; };
  const wallL = (ax, az, bx, bz, h, kind) => { const L = Math.hypot(bx - ax, bz - az), a = -Math.atan2(bz - az, bx - ax); P(kind || 'egWall', (ax + bx) / 2, (az + bz) / 2, { ry: a, args: [L, h || 3], col: { w: L, d: 0.8, h: (h || 3) + 0.2, a, cam: true } }); };
  const ok = (x, z, m) => roadD(x, z) > (m || 4) && PADS.every(p => Math.hypot(x - p.x, z - p.z) > p.r + 2) && waterDist(x, z) > 5 && Math.max(Math.abs(x), Math.abs(z)) < 205 && Math.hypot(x - PIT.x, z - PIT.z) > 8;
  const tree = { r: 0.5, h: 3 };
  // ================= CANAAN
  // Hebron valley: the tents of Jacob
  P('tent', 168, 146, { ry: 0.25, s: 1.3, args: [0x3a302c], col: { w: 7.4, d: 4.8, h: 2.5, cam: true, a: 0.25 } });     // 야곱의 장막
  /* 요셉과 베냐민의 장막 (v16.9): you can walk in under the roof — the back and the sides are walls, the front is open — and
     Joseph's sleeping mat lies inside, so the story starts with him asleep under goat hair, not out on the bare ground */
  P('tent', 184, 158, { ry: -0.5, args: [0x4a3e38], col: null });
  { const ca = Math.cos(-0.5), sa = Math.sin(-0.5), at = (lx, lz) => [184 + ca * lx + sa * lz, 158 - sa * lx + ca * lz];
    for (const [lx, lz, w, d] of [[0, -1.72, 5.7, 0.3], [2.78, 0, 0.3, 3.5], [-2.78, 0, 0.3, 3.5]]) { const [x, z] = at(lx, lz); W.addCol({ x, z, w, d, a: -0.5, h: 2.2, cam: true }); }
    if (W.addRoof) W.addRoof({ x: 184, z: 158, w: 5.6, d: 3.6, a: -0.5, y: W.heightAt(184, 158) + 1.9 });
    const [mx, mz] = at(0.35, -0.55); P((g, M) => { g.box(1.95, 0.05, 0.95, { m: M, at: [0, 0.03, 0], c: (x, y, z) => Math.abs(z) > 0.36 || Math.abs(x) > 0.86 ? 0x8a3a2a : Math.floor((x + 1) * 5) % 2 ? 0xc8b08a : 0xb89a70 });
      g.box(1.7, 0.06, 0.6, { m: M, at: [0.05, 0.07, -0.05], c: 0x6a5a4a, j: 0.04 }); g.sph(0.2, 8, 6, { m: M, at: [0.78, 0.12, 0], s: [1, 0.45, 1.2], c: 0xd8c8a8 }); }, mx, mz, { ry: -0.5, col: null }); }
  P('tent', 163, 162, { ry: 0.9, args: [0x5a4636], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.9 } });
  P('tent', 189, 141, { ry: -1.1, args: [0x3e342e], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -1.1 } });
  P('campfire', 176, 153, { col: { r: 0.8, h: 0.5 } }); P('pots', 172, 156); P('sacks', 179, 147); P('pots', 186, 152);
  P('well', 160, 150, { col: { r: 1.7, h: 1 } }); P('fence', 192, 166.5, { args: [12] }); P('fence', 192, 175.5, { args: [12] }); P('fence', 186, 171, { ry: PI / 2, args: [9] }); P('fence', 198, 171, { ry: PI / 2, args: [9] });
  for (const [x, z] of [[156, 140], [196, 150], [165, 172], [190, 130]]) P('olive', x, z, { s: 1.1, col: tree });
  P('oak', 148, 156, { s: 1.5, col: tree }); // 마므레의 상수리나무 (창 35:27)
  P('crops', 160, 128, { args: [10, 6, true] }); P('crops', 196, 124, { args: [8, 6, true] });
  // road north: the fallen trunk across the dry wadi (jump!) between two rock shoulders
  P('logX', SPOTS.log[0], SPOTS.log[1], { ry: 0.05, col: { w: 7.4, d: 0.8, h: 0.62 } });
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) P('outcrop', SPOTS.log[0] + s * (5.8 + i * 2.2), SPOTS.log[1] + (r() - 0.5) * 2, { s: 0.9 + r() * 0.3, ry: r() * 6, col: { r: 1.9, h: 3 } });
  // rest stop under the oak
  P('oak', 190, 29, { s: 1.7, col: { r: 0.7, h: 3 } }); P('campfire', SPOTS.restOak[0], SPOTS.restOak[1], { col: { r: 0.8, h: 0.5 } }); P('straw', SPOTS.restBed[0], SPOTS.restBed[1], { ry: 0.4 }); P('rock', 182, 30, { col: { r: 0.9, h: 1 } });
  // Shechem fields: grazing land, the brothers' old camp
  P('campfire', SPOTS.clue1[0], SPOTS.clue1[1]); P('sacks', SPOTS.clue1[0] + 2, SPOTS.clue1[1] - 1.5); P('altar', SPOTS.clue3[0], SPOTS.clue3[1]);
  for (let i = 0; i < 8; i++) P('olive', 170 + (i % 4) * 9 + r() * 3, -40 - Math.floor(i / 4) * 9, { col: tree });
  // Dothan: the brothers' camp, cisterns
  P('campfire', 158, -150, { col: { r: 0.8, h: 0.5 } }); P('sacks', 154, -146); P('pots', 161, -154); P('tent', 151, -156, { ry: 0.6, args: [0x4a3e38], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.6 } });
  P('pitWell', PIT.x, PIT.z, { y: PIT.floor }); W.markers.pit = PIT; if (W.addAvoid) W.addAvoid({ x: PIT.x, z: PIT.z, r: PIT.wall + 0.7, k: 'pit' }); // nobody strolls across the pit
  P('cistern', 146, -128); P('cistern', 178, -162); P('cistern', 140, -160);
  P('fence', 148, -170, { args: [14] }); P('fence', 148, -180, { args: [14] }); P('fence', 141, -175, { ry: PI / 2, args: [10] }); P('fence', 155, -175, { ry: PI / 2, args: [10] });
  // Gilead / caravan road: acacias
  for (let i = 0; i < 6; i++) P('acacia', 205 + i * 5, -146 + (r() - 0.5) * 12, { col: tree });
  // ================= DESERT
  P('campfire', SPOTS.caravanNight[0], SPOTS.caravanNight[1]); P('bales', SPOTS.caravanNight[0] + 3, SPOTS.caravanNight[1] - 2); P('camelSit', SPOTS.caravanNight[0] - 4, SPOTS.caravanNight[1] + 2, { ry: 0.8 }); P('camelSit', SPOTS.caravanNight[0] + 5, SPOTS.caravanNight[1] + 3, { ry: -1.2 });
  P('fort', 34, 78, { ry: 0.3, col: { w: 5, d: 5, h: 7, cam: true, a: 0.3 } });  // 애굽 국경의 망루
  // ================= EGYPT · market
  P('dais', SPOTS.block[0], SPOTS.block[1] - 2, { args: [4, 3, 0.9], col: { w: 4, d: 3, h: 0.9 } });
  [[2, 124, 0xb3472e], [-18, 124, 0x2c5aa0], [4, 110, 0x3e8a66], [-20, 110, 0xd9a73a]].forEach(([x, z, c], i) => P('stallM', x, z, { ry: i * 0.5 + 0.3, args: [c], col: { w: 2.6, d: 2.2, h: 2.2, a: i * 0.5 + 0.3 } }));
  P('palmRow', -24, 132, { args: [4] }); P('palmRow', 8, 132, { args: [3] }); P('jars', -2, 126, { args: [5] }); P('bales', -15, 106); P('camelSit', 10, 118, { ry: 2.4 }); P('camelSit', 13, 114, { ry: 2.0 });
  // ================= POTIPHAR'S HOUSE (captain of the guard)
  { const x0 = -50, x1 = -6, z0 = 36, z1 = 70, gx = -28;
    wallL(x0, z0, x1, z0); wallL(x0, z0, x0, z1); wallL(x1, z0, x1, 50.5); wallL(x1, 53.5, x1, z1); wallL(x0, z1, gx - 2, z1); wallL(gx + 2, z1, x1, z1);
    P('gatePosts', gx, z1, { args: [4] }); W.addCol({ x: gx - 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true }); W.addCol({ x: gx + 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true });
    P('portico', -28, 41.5, { args: [26, 9, 4.2, 7], col: null }); W.addCol({ x: -28, z: 37.2, w: 26, d: 0.7, h: 4.2, cam: true }); W.addCol({ x: -41, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true }); W.addCol({ x: -15, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true });
    for (let i = 0; i < 7; i++) W.addCol({ x: -28 - 13 + 1.2 + i * (26 - 2.4) / 6, z: 41.5 + 4.5 - 0.5, r: 0.38, h: 4 });
    P('seatEg', -28, 39.4, { args: [], col: { r: 0.45, h: 1 } }); P('tableEg', -22.5, 40.2, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('couch', -34.5, 39.6, { col: { w: 2, d: 0.8, h: 0.8 } }); P('jars', -38.5, 39, { args: [3] });
    P('pavilion', -45.5, 52, { args: [7, 15, 2.6] }); for (let i = 0; i < 4; i++) P('straw', -47.6, 46 + i * 3.4, { ry: PI / 2 });   // 종들의 숙소
    P('pavilion', -10.5, 45, { args: [6, 9, 2.6, 0xd0b888] }); P('oven', -10, 41.8, { col: { r: 0.8, h: 1.2 } }); P('quern', SPOTS.quern[0], SPOTS.quern[1], { ry: 0.3 }); P('jars', -8.4, 47.6, { ry: PI / 2, args: [3] }); P('tableEg', -11.5, 44.6, { ry: PI / 2 });  // 부엌
    P('well', SPOTS.well[0], SPOTS.well[1], { col: { r: 1.7, h: 1 } });
    P('pool', SPOTS.pool[0], SPOTS.pool[1], { args: [8, 5], col: { w: 8.8, d: 5.8, h: 0.4 } }); P('palmRow', -25, 63.5, { args: [3] }); P('datePalm', -13, 55); P('datePalm', -26, 54.5); P('flowers', -21, 61.5, { args: [0x8a6ad8] });
    P('room', SPOTS.store[0] - 0.5, SPOTS.store[1] + 0.5, { ry: -PI / 2, args: [8, 9, 3, 1.8] }); // 곳간 (문은 서쪽)
    { const sx = SPOTS.store[0] - 0.5, sz = SPOTS.store[1] + 0.5; W.addCol({ x: sx + 4.5, z: sz, w: 0.5, d: 8, h: 3, cam: true }); W.addCol({ x: sx, z: sz - 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx, z: sz + 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx - 4.5, z: sz - 2.45, w: 0.5, d: 3.1, h: 3 }); W.addCol({ x: sx - 4.5, z: sz + 2.45, w: 0.5, d: 3.1, h: 3 });
      const SH = [['wine', 3.4, -2.6, 0], ['oil', 3.4, 2.6, 0], ['grain', 0.6, -3.3, PI / 2], ['figs', 0.6, 3.3, -PI / 2]]; for (const [k, dx, dz, ry] of SH) P('shelves', sx + dx, sz + dz, { ry: ry + -PI / 2, args: [k] }); }
    P('loomX', SPOTS.loom[0], SPOTS.loom[1], { ry: PI / 2, col: { w: 2, d: 0.5, h: 2.2, a: PI / 2 } }); P('jars', -38, 67.5, { args: [3] }); P('dovecote', -47, 38.5);
    // fields and the cattle yard outside the east door
    P('fence', 9, 70.5, { args: [10] }); P('fence', 9, 81.5, { args: [10] }); P('fence', 4, 76, { ry: PI / 2, args: [11] }); P('fence', 14, 76, { ry: PI / 2, args: [11] });
    P('shaduf', 16, 52, { ry: -PI / 2 }); P('trough', 9, 72, { col: { w: 2.4, d: 0.8, h: 0.6 } }); }
  // ================= THE KING'S PRISON (in the house of the captain of the guard, 창 40:3)
  { const x0 = -45, x1 = -15, z0 = -10, z1 = 14, gx = -30;
    wallL(x0, z0, x1, z0, 3.4, 'mudWall'); wallL(x0, z0, x0, z1, 3.4, 'mudWall'); wallL(x1, z0, x1, z1, 3.4, 'mudWall'); wallL(x0, z1, gx - 1.6, z1, 3.4, 'mudWall'); wallL(gx + 1.6, z1, x1, z1, 3.4, 'mudWall');
    P('gatePosts', gx, z1, { args: [3.2] });
    P('cellRow', -32.75, -7.6, { args: [4, 5.5, 4.4, 2.8] }); W.addCol({ x: -32.75, z: -5.55, w: 22.2, d: 0.4, h: 2.8, cam: false });
    P('room', -18.4, -6.6, { args: [5.6, 6.2, 2.9, 1.3], col: null }); W.addCol({ x: -18.4, z: -9.7, w: 5.6, d: 0.5, h: 2.9, cam: true }); W.addCol({ x: -21.2, z: -6.6, w: 0.5, d: 6.2, h: 2.9, cam: true }); W.addCol({ x: -15.6, z: -6.6, w: 0.5, d: 6.2, h: 2.9, cam: true });
    W.addCol({ x: -20.25, z: -3.5, w: 2.3, d: 0.5, h: 2.9, cam: true }); W.addCol({ x: -16.55, z: -3.5, w: 2.3, d: 0.5, h: 2.9, cam: true });
    P('straw', -19.6, -8.2); P('egHouse', -20, 8.6, { ry: PI, args: [{ w: 6, d: 4.4, h: 2.8 }], col: { w: 6, d: 4.4, h: 3, a: PI, cam: true } });
    P('tableEg', SPOTS.yard[0] - 2, SPOTS.yard[1] + 4, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('well', SPOTS.basin[0], SPOTS.basin[1], { args: [{ r: 0.8, posts: false }], col: { r: 1.2, h: 1 } }); P('jars', -43, 12.5, { args: [3] }); P('brazier', -26, 9); P('brazier', -34, 9); }
  // ================= THE ROYAL CITY
  const city = [[-40, -60], [-30, -58], [-12, -58], [-2, -62], [-42, -72], [-6, -74], [-40, -86], [-30, -88], [-12, -88], [-2, -84], [-46, -98], [-34, -104]];
  city.forEach(([x, z], i) => P('egHouse', x, z, { ry: (i % 4) * PI / 2 + (r() - 0.5) * 0.1, args: [{ w: 6 + (i % 3), d: 5, h: 2.8 + (i % 2) * 1.2, awning: i % 3 === 0 ? OCHRE : null }], col: { w: 6 + (i % 3), d: 5, h: 3.4 + (i % 2) * 1.2, a: (i % 4) * PI / 2, cam: true } }));
  [[-26, -76, 0x8a3a5a], [-18, -76, 0x2c5aa0], [-26, -66, 0x3e8a66], [-18, -66, 0xd9a73a]].forEach(([x, z, c], i) => P('stallM', x, z, { ry: i * 0.4, args: [c], col: { w: 2.6, d: 2.2, h: 2.2, a: i * 0.4 } }));
  P('obelisk', -32, -71, { col: { r: 0.8, h: 8 } }); P('palmRow', -48, -114, { args: [5] });
  // temple of On (Heliopolis): Asenath's father Potiphera is its priest (창 41:45)
  P('obelisk', 5, -95, { col: { r: 0.8, h: 8 } }); P('obelisk', 19, -95, { col: { r: 0.8, h: 8 } }); P('portico', 12, -102, { args: [12, 6, 3.6, 4], col: { w: 12, d: 5, h: 4, cam: true } });
  // ================= PHARAOH'S PALACE
  { const x0 = -54, x1 = -6, z0 = -182, z1 = -142, gx = -30;
    wallL(x0, z0, x1, z0, 5); wallL(x0, z0, x0, z1, 5); wallL(x1, z0, x1, z1, 5); wallL(x0, z1, gx - 9.9, z1, 5); wallL(gx + 9.9, z1, x1, z1, 5);
    for (const s of [1, -1]) P('pylon', gx + s * 6.6, z1, { s: 0.55, col: { w: 6.6, d: 2.4, h: 6.2, cam: true } }); P('gatePosts', gx, z1, { args: [5] });
    for (const s of [1, -1]) P('obelisk', gx + s * 9.5, z1 + 4, { col: { r: 0.8, h: 8 } });
    for (let row = 0; row < 3; row++) for (const s of [1, -1]) { const x = gx + s * 7.5, z = -150 - row * 7; P('column', x, z, { args: [6.5], col: { r: 0.85, h: 7, cam: true } }); }
    for (const s of [1, -1]) P('pool', gx + s * 14, -152, { args: [6, 9], col: { w: 6.8, d: 9.8, h: 0.4 } });
    P('dais', gx, -176, { args: [10, 6, 1.1], col: { w: 10, d: 6, h: 1.1 } }); P('throne', gx, -177.4, { y: padH(gx, -176) + 1.1 }); P('brazier', gx - 6, -172); P('brazier', gx + 6, -172);
    P('hieroWall', gx, -181.3, { args: [46, 5] }); P('palmRow', -52, -158, { args: [3] }); }
  // the vizier's house
  P('egHouse', 10, -144, { args: [{ w: 12, d: 8, h: 4.2, awning: LAPIS }], col: { w: 12, d: 8, h: 4.4, cam: true } }); P('pool', 4, -134, { args: [5, 3], col: { w: 5.8, d: 3.8, h: 0.4 } }); P('palmRow', 14, -132, { args: [2] }); P('datePalm', -2, -139);
  // ================= WEST BANK & SOUTH: villages, fields, pyramids
  for (const [cx, cz] of [SPOTS.westVillage, SPOTS.southVillage]) { for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2 + 0.3, d = 11 + (i % 2) * 4; P('egHouse', cx + Math.cos(a) * d, cz + Math.sin(a) * d, { ry: -a + PI / 2, args: [{ w: 5, d: 4, h: 2.6 }], col: { w: 5, d: 4, h: 3, a: -a + PI / 2, cam: true } }); }
    P('well', cx, cz, { col: { r: 1.7, h: 1 } }); P('shaduf', cx + 18, cz + 4); P('dovecote', cx - 6, cz + 17); P('crops', cx + 22, cz - 10, { args: [12, 8, true] }); P('crops', cx - 24, cz + 6, { args: [10, 8, false] }); }
  P('pyramid', -205, -175, { args: [30] }); P('pyramid', -178, -214, { args: [22] }); P('pyramid', -216, -122, { args: [18] });
  // the Nile: papyrus, palms, boats; fields along the banks
  for (let z = -205; z < 205; z += 7) { const s = r() < 0.5 ? -1 : 1; node('reeds', nileX(z) + s * (9.5 + r() * 2.5), z); if (r() < 0.22) P('datePalm', nileX(z) + s * (18 + r() * 8), z + r() * 3, { col: tree }); }
  for (const [z, s] of [[-120, 1], [30, -1], [150, 1]]) P('felucca', nileX(z) + s * 3, z, { ry: 0.1, y: -0.3 });
  for (let i = 0; i < 26; i++) { const z = -190 + i * 15 + r() * 6, s = r() < 0.5 ? -1 : 1, x = nileX(z) + s * (26 + r() * 22); if (!ok(x, z, 6)) continue; P('crops', x, z, { ry: r() * 0.4, args: [8 + r() * 6, 6 + r() * 4, r() < 0.5] }); }
  // decorative trees, rocks and shrubs across the land
  // v17.0 포아송 디스크: evenly scattered with a minimum gap (closer in green Canaan and by the Nile, wide apart in the desert)
  const bigPts = G.poisson ? G.poisson(r, -205, -205, 205, 205, (x, z) => { const C = canaanK(x), F = fert(x, z); return 19 - 7 * Math.max(C, F); }, 11, 19) : [];
  for (const bp of bigPts) {
    const x = bp[0], z = bp[1]; if (!ok(x, z, 6)) continue; const C = canaanK(x), F = fert(x, z) * (1 - C), k = r(); let t;
    if (C > 0.5) t = k < 0.3 ? 'olive' : k < 0.5 ? 'oak' : k < 0.62 ? 'fig' : k < 0.8 ? 'bush' : k < 0.9 ? 'rock' : 'outcrop';
    else if (F > 0.5) t = k < 0.42 ? 'datePalm' : k < 0.6 ? 'palm' : k < 0.75 ? 'acacia' : k < 0.88 ? 'bush' : 'tamarisk';
    else t = k < 0.18 ? 'acacia' : k < 0.3 ? 'tamarisk' : k < 0.46 ? 'retama' : k < 0.66 ? 'outcrop' : 'rock';
    const big = ['oak', 'olive', 'acacia', 'tamarisk', 'fig', 'datePalm', 'palm'].includes(t);
    P(t, x, z, { ry: r() * 6, s: 0.8 + r() * 0.5, col: big ? tree : t === 'rock' ? { r: 1.1, h: 1.2 } : t === 'outcrop' ? { r: 1.8, h: 2 } : null });
  }
  const smallPts = G.poisson ? G.poisson(r, -200, -200, 200, 200, (x, z) => 13.5 - 4.5 * Math.max(canaanK(x), fert(x, z)), 9, 13.5) : []; // v17.0 포아송 디스크 (grass, flowers, shrubs)
  for (let i = 0; i < smallPts.length; i++) { const x = smallPts[i][0], z = smallPts[i][1]; if (!ok(x, z, 2.5)) continue; const C = canaanK(x), F = fert(x, z);
    if (C > 0.5) P(r() < 0.55 ? 'flowers' : r() < 0.7 ? 'dryGrass' : 'bush', x, z, { ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xd8343a, 0xf0e0f0, 0xe8c040, 0x8a6ad8][i % 4]] });
    else if (F > 0.4) P(r() < 0.6 ? 'dryGrass' : 'flowers', x, z, { ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xf0e0f0, 0xe8c040][i % 2]] });
    else P(r() < 0.8 ? 'dryGrass' : 'retama', x, z, { ry: r() * 6, s: 0.7 + r() * 0.6, detail: 1 }); }
  // gathering: a few sticks and stones in Canaan, figs and olives
  const around = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = rr * (0.4 + r() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 2.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75)) continue; node(types[i % types.length], x, z); } };
  around(176, 152, 38, 14, ['fig', 'olive', 'deadwood', 'rock']); around(188, -12, 30, 8, ['olive', 'fig', 'deadwood']);
  { const r2 = GG.rng(9001); let nsid = 0; const near = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r2() * 6.28, d = rr * (0.4 + r2() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 2.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75)) continue; if (waterDist(x, z) >= 4) W.nodes.push({ id: 'ns' + (nsid++), type: types[i % types.length], x, y: W.heightAt(x, z), z, ry: r2() * 6, s: 0.85 + r2() * 0.3 }); } }; // v18.12 stones: creek pebbles near the well, flint and black rock out on the hills
    near(160, 150, 26, 5, ['creek']); near(176, 152, 40, 4, ['flintrock', 'rock']); near(188, -12, 32, 6, ['creek', 'flintrock', 'blackrock']); near(150, 40, 40, 5, ['rock', 'creek', 'blackrock']); }
  furnish(P, W);
}

// ------------------------------------------------------------------ LOOKS
const KID = o => Object.assign({ kid: true, skin: 0xe2ab7c, top: 0xd8c8a0, trim: 0x8a5a3a, hair: 0x2a1810, hairStyle: 'curly', belt: 0x6a4428, noPouch: true }, o);
const HEB = (o) => Object.assign({ skin: 0xd09868, hair: 0x2a1810, beard: 'short', beardCol: 0x2a1810, belt: 0x4a3022, legWrap: 0x8a7a5a }, o);
const EGM = (o) => Object.assign({ skin: 0xb07448, bare: true, kilt: true, kiltLong: true, bottom: LINEN, hair: 0x15100c, hairStyle: 'wig', barefoot: false, sandal: 0x8a6a40 }, o);
const EGF = (o) => Object.assign({ skin: 0xd8a070, fem: true, long: true, top: LINEN, under: LINEN, trim: 0xe8dcc0, hair: 0x15100c, hairStyle: 'wig', collar: TURQ, collar2: GOLD }, o);
const COAT = [0xb3472e, 0xe8dcc0, 0x2e4a78, 0xe0b040, 0x3e8a66, 0xe8dcc0, 0x8a3a8a, 0xd86a2a];   // 채색옷 (창 37:3)
const JO = { skin: 0xe2ab7c, hair: 0x2a1810, hairStyle: 'curly', eye: 0x5a3a20, build: 0.62, jaw: -0.25, browAng: 0.1, vary: false }; // v17.0: Joseph's face is hand-set (no per-NPC variation)
const LOOK = {
  // Joseph through the years
  // 채색옷 v12: a plain cream tunic, with the long striped coat worn open over it — three colours in vertical bands
  josephCoat: Object.assign({}, JO, { long: true, longSleeve: true, top: 0xeee4cc, bottom: 0xeee4cc, trim: 0xd8c49a, belt: 0x6a4428, mantle: 0x7a3a2e, mantleStripes: [0x7a3a2e, 0xa88a52, 0x40566e], mantleReps: 4, mantleTrim: 0x4a2820 }),
  josephPlain: Object.assign({}, JO, { top: 0xd8ccb0, trim: 0x8a7a5a, under: 0xd0c4a8, belt: 0x6a4428 }),
  josephSlave: Object.assign({}, JO, { top: 0xcfc0a0, sleeveless: true, skin: 0xd9a070, kilt: true, kiltLong: true, bottom: 0xcfc0a0, barefoot: true, build: 0.72 }),
  josephServant: Object.assign({}, JO, { top: LINEN, sleeveless: true, skin: 0xd09868, kilt: true, kiltLong: true, bottom: LINEN, collar: 0xb8a070, build: 0.82, hairStyle: 'short' }),
  josephSteward: Object.assign({}, JO, { skin: 0xd09868, top: LINEN, sleeveless: true, kilt: true, bottom: LINEN, collar: TURQ, collar2: GOLD, sash: GOLD, build: 0.85, hairStyle: 'short', bands: GOLD }),
  josephFled: Object.assign({}, JO, { top: LINEN, sleeveless: true, skin: 0xd09868, kilt: true, kiltLong: true, bottom: LINEN, build: 0.85, hairStyle: 'short' }),
  josephPrisoner: Object.assign({}, JO, { top: 0x9a8a6a, sleeveless: true, skin: 0xc89060, kilt: true, kiltLong: true, bottom: 0x9a8a6a, beard: 'short', beardCol: 0x2a1810, hairStyle: 'wild', build: 0.8, barefoot: true }),
  josephFettered: Object.assign({}, JO, { top: 0x9a8a6a, sleeveless: true, skin: 0xc89060, kilt: true, kiltLong: true, bottom: 0x9a8a6a, beard: 'short', beardCol: 0x2a1810, hairStyle: 'wild', build: 0.8, barefoot: true, gloves: 0x4a4440, legWrap: 0x4a4440, limp: true }),
  josephShaved: Object.assign({}, JO, { skin: 0xd09868, bare: true, kilt: true, bottom: LINEN, hairStyle: 'short', build: 0.9, jaw: 0 }),
  josephVizier: Object.assign({}, JO, { skin: 0xd09868, long: true, top: LINEN, under: LINEN, trim: GOLD, trim2: LAPIS, collar: GOLD, collar2: LAPIS, sash: GOLD, bands: GOLD, hairStyle: 'wig', hair: 0x15100c, build: 0.95, jaw: 0.05, sandal: GOLD }),
  // family in Canaan
  jacob: { skin: 0xd8a070, top: 0x8a4434, trim: 0x2e4a78, trim2: 0xd8c49a, under: 0xd8c49a, hair: 0xd8d0c4, hairStyle: 'short', beard: 'long', beardCol: 0xece6dc, mantle: 0x6a5a48, mantleTrim: 0x2e4a78,
    headwear: 'cloth', clothCol: 0xece4d0, clothStripe: 0x3a6aa0, bandCol: 0x5a3a24, belt: 0x5a3a24, legWrap: 0x8a7458, limp: true, age: 'old', eye: 0x6a3e22, browAng: -0.1, long: true },
  jacobMourn: { skin: 0xd8a070, top: 0x5a4e40, trim: 0x3a3228, hair: 0xd8d0c4, hairStyle: 'wild', beard: 'long', beardCol: 0xece6dc, belt: 0x3a3228, age: 'old', long: true, eye: 0x6a3e22, browAng: -0.45 },   // 굵은 베 (창 37:34)
  benjamin: KID({ top: 0xe0c8a0, trim: 0x3e8a66, sash: 0x3e8a66, hairStyle: 'curly', skin: 0xe8b48a }),
  reuben: HEB({ top: 0x9a5a3a, trim: 0x5a3a22, under: 0xd8c8a8, mantle: 0x6a5a40, mantleShort: true, hairStyle: 'short', beard: 'long', beardCol: 0x3a2414, browAng: -0.1, build: 1.1 }),
  simeon: HEB({ top: 0x6a5a48, trim: 0x2a2018, sleeveless: true, hairStyle: 'wild', browAng: 0.65, build: 1.25, wraps: 0x4a3426 }),
  levi: HEB({ top: 0x5a6a7a, trim: 0x2a3a4a, hairStyle: 'tied', browAng: 0.5, build: 1.1 }),
  judah: HEB({ top: 0xa8402e, trim: 0xe0b040, sash: 0xe0b040, hairStyle: 'tied', beard: 'long', browAng: 0.25, build: 1.3, bag: 0x6a4428 }),
  dan: HEB({ top: 0x8aa0b8, trim: 0x4a5a7a, headwear: 'band', bandCol: 0x4a5a7a, browAng: 0.3 }),
  naphtali: HEB({ top: 0xa0b888, trim: 0x5a6a3a, hairStyle: 'curly', browAng: 0.2, build: 0.9 }),
  gad: HEB({ top: 0xb89a6a, trim: 0x5a3a22, headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x5a3a22, browAng: 0.4 }),
  asher: HEB({ top: 0xe0c070, trim: 0x8a6a2a, hairStyle: 'short', browAng: 0.1 }),
  issachar: HEB({ top: 0x8a7a5a, trim: 0x4a3a2a, hairStyle: 'short', build: 1.35, browAng: 0.15 }),
  zebulun: HEB({ top: 0x7a9ab8, trim: 0x3a5a7a, headwear: 'cloth', clothCol: 0xe0d8c8, bandCol: 0x3a5a7a, browAng: 0.3 }),
  servantH: HEB({ top: 0xb8a888, trim: 0x6a4a30, headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x6a4a30, beard: 'short' }),
  leah: { skin: 0xe0b088, top: 0x98708e, long: true, trim: 0x5a3a5a, trim2: 0xe0c070, under: 0x98708e, hair: 0x6a5a50, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8c8a0, clothStripe: 0xa86a8a, age: 'old', browAng: -0.3 },
  dinah: { skin: 0xe2ab7c, top: 0xd88a9a, long: true, trim: 0xa84a5a, hair: 0x2a1810, hairStyle: 'long', headwear: 'veil', clothCol: 0xe8dcc0, clothStripe: 0xa84a5a, fem: true, sash: 0xe0b040 },
  man: { skin: 0xc8a080, top: 0xd8d0c0, long: true, trim: 0x8a7a60, under: 0xd8d0c0, hair: 0x3a3028, headwear: 'cloth', clothCol: 0xe8e4dc, bandCol: 0x8a7a60, mantle: 0xb8b0a0, beard: 'short', beardCol: 0x5a5048, browAng: 0.2, age: 'old' },
  ishmael: { skin: 0xa86e44, long: true, stripes: [0x8a7458, 0x8a7458, 0x3a2a1a, 0x8a7458, 0xc8a050, 0x8a7458], stripesB: [0x8a7458, 0x3a2a1a, 0x8a7458, 0x8a7458, 0xc8a050, 0x8a7458], beard: 'long', beardCol: 0x1a1410, hair: 0x1a1410, headwear: 'turban', clothCol: 0xf0e8d8, bandCol: 0x3a2a1a, sash: 0xb3472e, boots: 0x4a3426, browAng: 0.3 },
  midian: { skin: 0xb07848, long: true, stripes: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xc8963a], stripesB: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xe8dcc0, 0xc8963a], beard: 'short', hair: 0x2a1810, headwear: 'turban', clothCol: 0xd9a73a, bandCol: 0x7a3b2a, sash: 0x2c5aa0, smile: 0.6 },
  ishBoy: KID({ skin: 0xb07848, top: 0xc8b890, trim: 0x7a3b2a, headwear: 'cloth', clothCol: 0xf0e8d8, bandCol: 0x7a3b2a, hairStyle: 'short' }),
  // Egypt
  auctioneer: EGM({ skin: 0xa86a40, hairStyle: 'bald', beard: 'short', beardCol: 0x2a1810, collar: 0xb3472e, browAng: 0.4, build: 1.2 }),
  potiphar: EGM({ skin: 0xa86a40, top: 0xd8b878, sleeveless: true, bare: false, collar: GOLD, collar2: LAPIS, bands: GOLD, sash: OCHRE, build: 1.35, jaw: 0.6, browAng: 0.35, bottom: LINEN }),
  wife: EGF({ skin: 0xe0aa78, top: 0xf8f2e6, collar: GOLD, collar2: LAPIS, sash: 0xb3472e, headband: GOLD, smile: 0.2, browAng: 0.1, bust: 1.0 }),
  ameni: EGM({ skin: 0x9a6038, hairStyle: 'bald', age: 'old', bottom: 0xe0d4b8, hair: 0x9a9088, browAng: -0.2, smile: 0.5, build: 0.6 }),
  neb: EGM({ top: LINEN, sleeveless: true, bare: false, collar: TURQ, browAng: 0.45, narrow: true }),
  cook: EGM({ hairStyle: 'bald', build: 1.3, top: 0xe8dcc0, sleeveless: true, bare: false, sash: OCHRE, smile: 0.7 }),
  gardener: EGM({ hairStyle: 'short', skin: 0x9a6038, bottom: 0xd8c8a0, browAng: 0.1 }),
  cowboy: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: LINEN, hairStyle: 'short', top: LINEN }),
  weaver: EGF({ skin: 0xc89060, top: 0xe8dcc0, collar: 0x8a6a48, collar2: 0, smile: 0.5 }),
  scribe: EGM({ hairStyle: 'bald', top: LINEN, bare: false, sleeveless: true, collar: 0xe0d0b0, build: 0.6, age: 'old', hair: 0xb8b0a8 }),
  official: EGM({ collar: GOLD, collar2: TURQ, bands: GOLD, top: LINEN, bare: false, sleeveless: true, long: true }),
  priest: EGM({ hairStyle: 'bald', top: LINEN, long: true, bare: false, collar: 0xe0d0b0, build: 0.8 }),
  soldierEg: EGM({ hairStyle: 'short', collar: 0x8a6a48, bottom: 0xd8c8a0, build: 1.2, browAng: 0.5, wraps: 0x6a4a30 }),
  maid: EGF({ skin: 0xb88050, top: 0xe0d4b8, collar: 0x8a6a48, collar2: 0, hairStyle: 'long' }),
  keeper: EGM({ skin: 0x9a6038, top: 0x6a4a30, bare: false, sleeveless: true, long: false, bottom: 0x8a6a48, hairStyle: 'short', beard: 'short', beardCol: 0x2a1810, build: 1.35, browAng: 0.55, jaw: 0.7 }),
  cupbearer: EGM({ top: LINEN, bare: false, long: true, collar: GOLD, collar2: TURQ, bands: GOLD, smile: 0.4 }),
  baker: EGM({ top: LINEN, bare: false, long: true, collar: 0xd8b878, build: 1.25, hairStyle: 'bald', browAng: -0.15 }),
  prisoner: EGM({ bottom: 0x9a8a6a, hairStyle: 'wild', beard: 'short', beardCol: 0x2a1810, skin: 0x9a6038 }),
  oldPrisoner: EGM({ bottom: 0x8a7a5a, hairStyle: 'wild', hair: 0xc8c0b8, beard: 'long', beardCol: 0xd8d0c8, age: 'old', skin: 0x9a6038 }),
  youngPrisoner: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: 0x9a8a6a, hairStyle: 'wild', top: 0x9a8a6a }),
  pharaoh: EGM({ headwear: 'nemes', collar: GOLD, collar2: LAPIS, bands: GOLD, top: LINEN, bare: false, sleeveless: true, sash: GOLD, beard: 'short', beardCol: 0x15100c, build: 1.1, jaw: 0.3, browAng: 0.2, sandal: GOLD }),
  magician: EGM({ hairStyle: 'bald', top: LINEN, long: true, bare: false, collar: 0x2a1810, sash: 0x2a1810, browAng: 0.35, age: 'old', hair: 0xb8b0a8 }),
  messenger: EGM({ collar: TURQ, bands: GOLD, top: LINEN, bare: false, sleeveless: true, build: 1.0 }),
  asenath: EGF({ skin: 0xe0aa78, top: 0xf8f2e6, collar: GOLD, collar2: TURQ, sash: TURQ, headband: GOLD, smile: 0.55, browAng: 0.05 }),
  manasseh: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  ephraim: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'curly' }),
  farmer: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }),
  farmerThin: EGM({ hairStyle: 'short', bottom: 0x9a8a6a, skin: 0x9a6038, build: 0.4 }),
  woman: EGF({ skin: 0xb88050, top: 0xe0d4b8, collar: 0x8a6a48, collar2: 0, hairStyle: 'long' }),
  elder: EGM({ hairStyle: 'short', hair: 0xd8d0c8, age: 'old', top: 0xe8dcc0, bare: false, long: true, beard: 'short', beardCol: 0xd8d0c8 }),
  sidon: { skin: 0xd0a070, long: true, top: 0x6a2a5a, trim: 0xe0b040, under: 0xe8dcc0, beard: 'long', beardCol: 0x2a1810, hair: 0x2a1810, headwear: 'cap', capCol: 0x6a2a5a, sash: 0xe0b040, browAng: 0.2 },
  edom: { skin: 0xc0805a, top: 0x8a3a2a, trim: 0x4a2a1a, hair: 0x8a3a1e, hairStyle: 'wild', beard: 'long', beardCol: 0x8a3a1e, goatskin: true, belt: 0x3a2618, boots: 0x5a3a24, browAng: 0.3 },
  canaanite: { skin: 0xc0885a, top: 0x8a7a60, bottom: 0x6a5a48, trim: 0x4a3a2a, beard: 'long', beardCol: 0x6a5a4a, hair: 0x4a3a2a, headwear: 'cloth', clothCol: 0xb8a888, bandCol: 0x3a2a1a, mantle: 0x5a4a38, legWrap: 0x7a6a50, bag: 0x5a3a24, age: 'old' },
};

// ------------------------------------------------------------------ v15 INTERIORS: the rooms you walk into are lived in
Object.assign(ENVX, {
  rugEg(g, M, r, w, d, c1, c2) { const A = c1 || OCHRE, B = c2 || LINEN; g.box(w, 0.025, d, { m: M, at: [0, 0.015, 0], c: (x, y, z) => { const bx = Math.abs(x) > w / 2 - 0.25 || Math.abs(z) > d / 2 - 0.25; return bx ? LAPIS : (Math.floor((x + w) * 1.6) % 3 === 0 ? A : B); }, j: 0 });
    for (const s of [1, -1]) for (let i = 0; i < Math.floor(d / 0.12); i++) g.box(0.12, 0.01, 0.03, { m: M, at: [s * (w / 2 + 0.05), 0.012, -d / 2 + 0.06 + i * 0.12], c: 0xe8dcc0, j: 0 }); },
  lampStand(g, M) { g.cyl(0.16, 0.2, 0.06, 8, { m: M, at: [0, 0.03, 0], c: 0x6a5030 }); g.cyl(0.03, 0.04, 1.35, 6, { m: M, at: [0, 0.7, 0], c: GOLD }); g.lathe([[0.04, 1.36], [0.16, 1.42], [0.19, 1.48]], 10, { m: M, c: 0xc0844a });
    g.sph(0.06, 6, 4, { m: M, at: [0.12, 1.53, 0], s: [0.8, 1.6, 0.8], c: 0xffc860, j: 0 }); g.sph(0.035, 5, 3, { m: M, at: [0.12, 1.58, 0], s: [0.8, 1.5, 0.8], c: 0xfff4c8, j: 0 }); },
  oilLamp(g, M) { g.lathe([[0.02, 0], [0.09, 0.03], [0.08, 0.06], [0.03, 0.07]], 8, { m: M, c: 0xb5673a }); g.box(0.08, 0.03, 0.05, { m: M, at: [0.1, 0.05, 0], c: 0xb5673a }); g.sph(0.03, 5, 3, { m: M, at: [0.14, 0.1, 0], s: [0.8, 1.6, 0.8], c: 0xffd070, j: 0 }); },
  potPlant(g, M, r, kind) { g.lathe([[0.16, 0], [0.26, 0.1], [0.3, 0.42], [0.33, 0.48]], 10, { m: M, c: 0xb5673a, j: 0.03 }); g.cyl(0.29, 0.29, 0.03, 10, { m: M, at: [0, 0.45, 0], c: 0x4a3420 });
    if (kind === 'papyrus') { for (let i = 0; i < 9; i++) { const a = i * 2.4, l = 1.1 + r() * 0.5, tx = Math.cos(a) * 0.18, tz = Math.sin(a) * 0.18; g.cyl(0.012, 0.018, l, 3, { m: M, at: [tx * 0.5, 0.45 + l / 2, tz * 0.5], rz: tx * 0.6, rx: -tz * 0.6, c: 0x5f8a3a, sw: 0.4 }); g.sph(0.13, 6, 3, { m: M, at: [tx * 1.4, 0.45 + l, tz * 1.4], s: [1, 0.45, 1], c: 0x7aa04a, sw: 0.7 }); } }
    else { g.cyl(0.04, 0.06, 1.1, 5, { m: M, at: [0, 1.0, 0], c: 0x7a5a3a }); for (let i = 0; i < 7; i++) { const a = i * PI * 2 / 7; g.box(0.16, 0.02, 0.85, { m: M, at: [Math.cos(a) * 0.36, 1.48, Math.sin(a) * 0.36], ry: -a + PI / 2, rx: 0.5, c: [0x4f7a32, 0x5f8a3a][i % 2], sw: 0.8 }); } } },
  chestEg(g, M) { g.box(0.9, 0.5, 0.55, { m: M, at: [0, 0.32, 0], c: 0x7a5232, j: 0.02 }); g.box(0.95, 0.1, 0.6, { m: M, at: [0, 0.6, 0], c: 0x6a4428 }); for (const s of [1, -1]) g.box(0.06, 0.08, 0.06, { m: M, at: [s * 0.4, 0.04, 0], c: 0x4a3020 });
    g.box(0.9, 0.08, 0.02, { m: M, at: [0, 0.45, 0.28], c: (x) => [LAPIS, GOLD, OCHRE][Math.floor((x + 1) * 6) % 3], j: 0 }); g.box(0.1, 0.1, 0.03, { m: M, at: [0, 0.5, 0.29], c: GOLD }); },
  senet(g, M) { g.box(1.1, 0.4, 0.5, { m: M, at: [0, 0.2, 0], c: 0x8a6440, j: 0.02 }); g.box(1.04, 0.03, 0.36, { m: M, at: [0, 0.415, 0], c: (x, y, z) => ((Math.floor((x + 0.52) / 0.104) + Math.floor((z + 0.18) / 0.12)) % 2 ? 0xe8d8b0 : 0xb89060), j: 0 });
    for (let i = 0; i < 5; i++) { g.cyl(0.03, 0.035, 0.07, 6, { m: M, at: [-0.46 + i * 0.21, 0.46, -0.12], c: 0x2a1a10 }); g.cyl(0.03, 0.035, 0.05, 6, { m: M, at: [-0.36 + i * 0.21, 0.45, 0.12], c: 0xf0e8d0 }); }
    for (let i = 0; i < 4; i++) g.box(0.12, 0.01, 0.02, { m: M, at: [0.42, 0.44, -0.15 + i * 0.05], c: i % 2 ? 0x3a2a1a : 0xf0e0c0 }); },
  stool(g, M) { g.box(0.42, 0.06, 0.36, { m: M, at: [0, 0.42, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.16, -0.13], [0.16, -0.13], [-0.16, 0.13], [0.16, 0.13]]) g.cyl(0.025, 0.03, 0.4, 4, { m: M, at: [x, 0.2, z], rz: x * 0.6, c: 0x6a4a30 }); },
  banner(g, M, r, h, col) { h = h || 2.2; g.box(0.04, 0.04, 1.0, { m: M, at: [0, h + 0.4, 0], c: 0x6a4a30 }); g.box(0.015, h, 0.9, { m: M, at: [0.02, h / 2 + 0.4, 0], c: (x, y) => { const k = Math.floor((y + h) * 3.2) % 6; return k === 0 ? (col || LAPIS) : k === 3 ? OCHRE : LINEN; }, j: 0 }); },
  scribeDesk(g, M) { g.box(1.2, 0.06, 0.6, { m: M, at: [0, 0.48, 0], c: 0x8a6440 }); for (const [x, z] of [[-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22]]) g.cyl(0.03, 0.03, 0.46, 4, { m: M, at: [x, 0.24, z], c: 0x6a4a30 });
    g.box(0.55, 0.005, 0.32, { m: M, at: [-0.15, 0.515, 0], c: 0xf0e4c0, j: 0 }); g.cyl(0.04, 0.04, 0.34, 8, { m: M, at: [-0.45, 0.55, 0], rx: PI / 2, c: 0xe8d8b0 }); g.cyl(0.04, 0.04, 0.34, 8, { m: M, at: [0.14, 0.55, 0], rx: PI / 2, c: 0xe8d8b0 });
    g.box(0.24, 0.02, 0.06, { m: M, at: [0.38, 0.52, 0.12], c: 0x9a7a4a }); g.cyl(0.018, 0.018, 0.01, 6, { m: M, at: [0.33, 0.535, 0.12], c: 0x101010 }); g.cyl(0.018, 0.018, 0.01, 6, { m: M, at: [0.42, 0.535, 0.12], c: 0xb02a1a });
    for (let i = 0; i < 3; i++) g.cyl(0.004, 0.004, 0.26, 3, { m: M, at: [0.38, 0.53, -0.08 + i * 0.03], rz: PI / 2, c: 0xc8b070 });
    for (let i = 0; i < 4; i++) g.cyl(0.035, 0.035, 0.36, 7, { m: M, at: [-0.7 - (i % 2) * 0.08, 0.05 + Math.floor(i / 2) * 0.07, -0.1 + i * 0.07], rz: PI / 2, c: 0xe0d0a8 }); },
  bedEg(g, M) { g.box(1.9, 0.08, 0.8, { m: M, at: [0, 0.38, 0], c: 0x7a5232 }); g.box(1.85, 0.1, 0.75, { m: M, at: [0, 0.46, 0], c: LINEN, j: 0.02 }); for (const [x, z] of [[-0.85, -0.32], [0.85, -0.32], [-0.85, 0.32], [0.85, 0.32]]) g.cyl(0.04, 0.05, 0.36, 5, { m: M, at: [x, 0.18, z], c: 0x5a3a24 });
    g.box(0.2, 0.06, 0.3, { m: M, at: [-0.75, 0.53, 0], c: 0x8a6440 }); g.cyl(0.11, 0.11, 0.3, 8, { m: M, at: [-0.75, 0.66, 0], rx: PI / 2, s: [1, 1, 0.6], c: 0x9a7448 }); g.box(1.0, 0.04, 0.78, { m: M, at: [0.4, 0.53, 0], c: (x) => Math.floor((x + 2) * 5) % 2 ? 0xb3472e : 0xd8c49a }); },
  blanket(g, M, r, c) { g.box(1.5, 0.05, 0.7, { m: M, at: [0.1, 0.13, 0], c: (x) => Math.floor((x + 2) * 4) % 3 === 0 ? (c || 0x8a3a2a) : 0xc8b490, j: 0.06 }); g.cyl(0.1, 0.1, 0.55, 6, { m: M, at: [-0.75, 0.16, 0], rx: PI / 2, c: 0xa89070 }); },
  loaves(g, M, r, n) { n = n || 5; for (let i = 0; i < n; i++) g.sph(0.1, 7, 4, { m: M, at: [(i - (n - 1) / 2) * 0.22, 0.04, (i % 2) * 0.12], s: [1.1, 0.5, 1.1], c: [0xc8904a, 0xb87a3a][i % 2], j: 0.03 });
    g.cyl(0.16, 0.12, 0.08, 10, { m: M, at: [0.5, 0.04, -0.12], c: 0xb5673a }); for (let i = 0; i < 6; i++) g.sph(0.04, 5, 3, { m: M, at: [0.45 + (i % 3) * 0.05, 0.1, -0.15 + Math.floor(i / 3) * 0.06], c: [0x6a3a5a, 0x5a2a4a][i % 2] }); },
  fruitBowl(g, M) { g.lathe([[0.02, 0], [0.18, 0.04], [0.24, 0.12]], 10, { m: M, c: 0x2f8a77 }); for (let i = 0; i < 7; i++) { const a = i * 0.9; g.sph(0.06, 6, 4, { m: M, at: [Math.cos(a) * 0.1, 0.12 + (i % 2) * 0.04, Math.sin(a) * 0.1], c: [0x6a3a5a, 0xd8a040, 0x8a2a2a, 0x7aa04a][i % 4] }); } },
  hangRack(g, M) { for (const s of [1, -1]) g.cyl(0.04, 0.05, 2.0, 5, { m: M, at: [s * 0.9, 1.0, 0], c: 0x6a4a30 }); g.cyl(0.03, 0.03, 2.0, 5, { m: M, at: [0, 1.95, 0], rz: PI / 2, c: 0x7a5a3a });
    for (let i = 0; i < 7; i++) { const x = -0.75 + i * 0.25; g.cyl(0.004, 0.004, 0.3, 3, { m: M, at: [x, 1.8, 0], c: 0xc8b070 }); if (i % 3 === 1) g.box(0.06, 0.35, 0.02, { m: M, at: [x, 1.5, 0], c: 0x9a9a8a });
      else for (let k = 0; k < 3; k++) g.sph(0.055, 5, 4, { m: M, at: [x + (k - 1) * 0.04, 1.62 - k * 0.07, 0.02], s: [1, 1.15, 1], c: i % 3 === 0 ? 0xd8b070 : 0xf0e8e0 }); } },
  baskets(g, M, r, n) { n = n || 3; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.62; g.lathe([[0.2, 0], [0.28, 0.12], [0.29, 0.34]], 10, { m: M, at: [x, 0, (i % 2) * 0.2], c: (xx, y) => (Math.floor((y + 1) * 30) % 2 ? 0xc8a868 : 0xa8884a), j: 0.04 });
    g.sph(0.25, 8, 4, { m: M, at: [x, 0.3, (i % 2) * 0.2], s: [1, 0.3, 1], c: [0xe2cfa0, 0xd8b060, 0x6a4a6a][i % 3] }); } },
  woodStack(g, M, r) { for (let i = 0; i < 9; i++) g.cyl(0.06, 0.07, 0.9, 5, { m: M, at: [(i % 4) * 0.13 - 0.2 + Math.floor(i / 4) * 0.06, 0.06 + Math.floor(i / 4) * 0.11, 0], rx: PI / 2, ry: (r() - 0.5) * 0.2, c: [0x6a4a30, 0x7a5a3a][i % 2], j: 0.05 }); },
  jugBowl(g, M) { g.lathe([[0.05, 0], [0.13, 0.08], [0.14, 0.25], [0.07, 0.38], [0.06, 0.44], [0.08, 0.46]], 9, { m: M, c: 0xa86a42, j: 0.04 }); g.lathe([[0.02, 0], [0.12, 0.03], [0.14, 0.08]], 9, { m: M, at: [0.32, 0, 0.1], c: 0x8a5a3a }); g.sph(0.06, 5, 3, { m: M, at: [0.32, 0.05, 0.1], s: [1.4, 0.4, 1.4], c: 0xc89a5a }); },
  fan(g, M) { g.cyl(0.025, 0.03, 2.2, 5, { m: M, at: [0, 1.1, 0], c: GOLD }); for (let i = 0; i < 9; i++) { const a = (i - 4) * 0.17; g.box(0.07, 0.6, 0.015, { m: M, at: [Math.sin(a) * 0.32, 2.3 + Math.cos(a) * 0.25, 0], rz: -a, c: i % 2 ? 0xf4efe2 : 0xe8dcc0 }); } g.sph(0.06, 6, 4, { m: M, at: [0, 2.2, 0], c: LAPIS }); },
  offering(g, M) { ENVX.tableEg(g, M); for (let i = 0; i < 3; i++) g.sph(0.1, 7, 4, { m: M, at: [-0.55 + i * 0.22, 0.88, -0.1], s: [1.1, 0.5, 1.1], c: 0xc8904a }); g.lathe([[0.02, 0.84], [0.18, 0.88], [0.22, 0.96]], 10, { m: M, at: [0.2, 0, 0], c: 0x2f8a77 });
    for (let i = 0; i < 5; i++) g.sph(0.06, 6, 4, { m: M, at: [0.16 + (i % 3) * 0.06, 0.98, -0.05 + Math.floor(i / 3) * 0.08], c: [0xd8a040, 0x8a2a2a, 0x7aa04a][i % 3] });
    for (let i = 0; i < 3; i++) { g.cyl(0.008, 0.008, 0.4, 3, { m: M, at: [0.65, 1.0, -0.2 + i * 0.12], c: 0x5f8a3a }); g.sph(0.06, 6, 3, { m: M, at: [0.65, 1.22, -0.2 + i * 0.12], s: [1, 0.7, 1], c: [0xf0f0f8, 0x8aa0e0, 0xf0e0f0][i] }); }
    g.lathe([[0.03, 0.84], [0.09, 0.9], [0.1, 0.98]], 8, { m: M, at: [-0.7, 0, 0.2], c: 0x6a5a3a }); },
  ampRack(g, M) { g.box(1.8, 0.08, 0.5, { m: M, at: [0, 0.3, 0], c: 0x7a5a3a }); for (let i = 0; i < 4; i++) { g.lathe([[0.02, -0.3], [0.12, -0.15], [0.16, 0.2], [0.07, 0.42], [0.08, 0.5]], 9, { m: M, at: [-0.66 + i * 0.44, 0.62, 0], c: [0xc8865a, 0xb5673a][i % 2] }); } },
});
function furnish(P, W) {
  // Potiphar's great hall (the portico): rug, lamps, wall hangings, plants, a scribe's desk, a game of senet, a chest
  P('rugEg', -28, 41.4, { args: [8, 3.6] }); P('rugEg', -35.8, 42.4, { ry: PI / 2, args: [2.4, 3.2, TURQ, LINEN] });
  for (const x of [-31.6, -24.4, -39.4, -17.2]) P('lampStand', x, 38.6, { col: { r: 0.22, h: 1.6 } });
  for (const x of [-37.4, -30.8, -25.2, -19.2]) P('banner', x, 37.65, { ry: PI / 2, args: [2.3, x < -28 ? LAPIS : TURQ] });
  P('potPlant', -40.1, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -16, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -39.9, 38.4, { args: ['papyrus'] });
  P('scribeDesk', -36.6, 43.6, { ry: 0.2, col: { w: 1.2, d: 0.6, h: 0.6, a: 0.2 } }); P('stool', -36.4, 44.4);
  P('senet', -19.2, 42.8, { col: { w: 1.1, d: 0.5, h: 0.5 } }); P('stool', -19.2, 43.6); P('stool', -19.2, 42.0);
  P('chestEg', -40.2, 41, { ry: PI / 2, col: { w: 0.6, d: 0.9, h: 0.7 } }); P('fruitBowl', -22.5, 40.0, { dy: 0.84 }); P('oilLamp', -21.9, 40.4, { dy: 0.84 });
  // servants' quarters: bedding, a lamp, water and baskets
  [0x8a3a2a, 0x2c5aa0, 0x3e8a66, 0x7a3a6a].forEach((c, i) => P('blanket', -47.6, 46 + i * 3.4, { ry: PI / 2, args: [c] }));
  P('jugBowl', -43.4, 47.4); P('jugBowl', -43.4, 54.2, { ry: 1 }); P('lampStand', -43.2, 50.8, { col: { r: 0.22, h: 1.6 } }); P('baskets', -43.4, 58, { ry: PI / 2, args: [2] }); P('chestEg', -43.6, 44.6, { ry: -PI / 2 });
  // the kitchen: bread on the table, a drying rack, grain baskets, firewood by the oven
  P('loaves', -11.5, 44.6, { ry: PI / 2, dy: 0.84 }); P('hangRack', -7.9, 44.4, { ry: PI / 2, col: { w: 0.2, d: 2, h: 2, a: PI / 2 } });
  P('baskets', -12.9, 47.4, { args: [3] }); P('woodStack', -8.4, 41.4, { ry: 0.3 }); P('stool', -12.4, 44.6);
  // the storeroom (곳간): stacked sacks, an amphora rack and the steward's tally desk
  P('ampRack', -12.5, 66.6, { col: { w: 1.8, d: 0.5, h: 1.2 } }); P('sacks', -10.4, 64.2); P('scribeDesk', -14.4, 62.2, { ry: PI / 2 }); P('oilLamp', -14.4, 62.6, { dy: 0.52 });
  // Joseph's cell: a jug and bowl, a lamp on a ledge, a blanket on the straw
  P('jugBowl', -16.4, -8.9, { ry: 2 }); P('oilLamp', -20.7, -9.2, { dy: 0.02 }); P('blanket', -19.6, -8.2, { args: [0x6a5a4a] });
  // the other cells: straw and a water jug in each
  for (let i = 0; i < 4; i++) { const cx = -32.75 - 11 + (i + 0.5) * 5.5; P('straw', cx - 1.5, -8.7, { ry: PI / 2 + 0.2 }); P('jugBowl', cx + 1.7, -9.1, { ry: i }); }
  // Pharaoh's hall: a long runner to the throne, lamps, papyrus in pots, feather fans by the throne
  P('rugEg', -30, -160, { ry: PI / 2, args: [24, 2.4, OCHRE, LINEN] });
  for (let i = 0; i < 4; i++) for (const s of [1, -1]) P('lampStand', -30 + s * 3.2, -150 - i * 6, { col: { r: 0.22, h: 1.6 } });
  for (const s of [1, -1]) { P('potPlant', -30 + s * 5.6, -171.6, { args: ['papyrus'], col: { r: 0.32, h: 1 } }); P('fan', -30 + s * 1.6, -178.2, { y: padH(-30, -176) + 1.1 }); P('offering', -30 + s * 3.6, -175.2, { ry: PI / 2, y: padH(-30, -176) + 1.1 }); }
  // the temple of On: an offering table, lamps and papyrus
  P('offering', 12, -103.6, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('lampStand', 9.4, -104, { col: { r: 0.22, h: 1.6 } }); P('lampStand', 14.6, -104, { col: { r: 0.22, h: 1.6 } }); P('potPlant', 7.2, -100.4, { args: ['papyrus'] }); P('potPlant', 16.8, -100.4, { args: ['papyrus'] });
}

// ------------------------------------------------------------------ STEP HELPERS
let ORDER = [];
const idx = S => ORDER.indexOf(S.step);
const between = (S, a, b) => { const i = idx(S); return i >= ORDER.indexOf(a) && (b ? i <= ORDER.indexOf(b) : true); };
const before = (S, a) => idx(S) < ORDER.indexOf(a);
const GG = G; const Gm = () => GG.Game;
const qd = (S, k) => !!S.q[k];
const word = (k, n, d, ic) => { const S = Gm().S(); S.q.words = S.q.words || {}; if (S.q.words[k]) return; S.q.words[k] = 1; GG.UI.featCard(k, { kick: '애굽 말', n, ic: ic || 'star', d }); Gm().sfx('insight', { pitch: 1.4 }); };
const WORDS = { mu: ['무 · 물', '우물가에서 "무!" 하면 물을 달라는 말이에요.', 'drop'], ta: ['타 · 빵', '빵. 부엌의 헤누가 제일 좋아하는 말이에요.', 'bread'], ka: ['카 · 황소', '황소. 애굽 사람들은 소를 아주 귀하게 여겨요.', 'wool'],
  nefer: ['네페르 · 좋다', '좋다, 아름답다. 칭찬할 때 쓰는 말이에요.', 'heart'], neb: ['네브 · 주인', '주인, 주님. 청지기 네브의 이름도 같은 말이에요.', 'star'], hotep: ['엠 헤테프 · 평안히', '평안히. 애굽 사람들의 인사말이에요.', 'sun'] };
const learn = k => word(k, WORDS[k][0], WORDS[k][1], WORDS[k][2]);
const tick = (S, k) => { S.q[k] = 1; GG.UI.quest(); Gm().checkStep(); };
const prayLine = t => J(t, '', 'pray');
const CH = n => `${n}장`;

// ------------------------------------------------------------------ STEPS
const steps = {
  // =============================================================== 프롤로그 · 채색옷 입은 아이 (튜토리얼)
  p_wake: { ch: 1, obj: '아버지 야곱께 가기', target: 'npc:jacob', enter(S, G, re) { S.q.tut = S.q.tut || 'move'; },
    talk: { jacob(S, G) { say([N('jacob', '요셉아, 네 형들이 세겜에서 양을 치지 아니하느냐? 내가 너를 그들에게로 보내리라.', '창세기 37:13'),
      J('내가 그리하겠나이다.', '창세기 37:13', 'calm'),
      N('jacob', '가서 네 형들과 양 떼가 다 잘 있는지를 보고 돌아와 내게 말하라.', '창세기 37:14'),
      N('jacob', '세겜은 북쪽으로 사흘 길이다. 큰길 하나만 따라가면 된다. 들짐승을 조심하고, 밤에는 불을 피우고 자거라.'),
      N('jacob', '…요셉아. 네 어미 라헬이 이렇게 자란 너를 보았다면 얼마나 기뻐했을까.', '', 'tender'),
      J('걱정 마세요, 아버지. 형들 소식을 가지고 금방 돌아올게요.', '', 'happy'),
      T('먼 길을 떠날 채비를 하세요. 장막 곁의 물건 가까이 가서 A를 누르면 챙길 수 있어요.')], () => { S.q.tut = 'items'; G.go('p_provision'); }); } } },
  p_provision: { ch: 1, obj: '길 떠날 채비', list: S => [{ t: '물가죽 부대 챙기기', ok: qd(S, 'skin') }, { t: '빵과 무화과 챙기기', ok: qd(S, 'bread') }, { t: '동생 베냐민에게 인사하기', ok: qd(S, 'benj') }],
    target: S => !qd(S, 'skin') ? { x: 182.2, z: 155.2 } : !qd(S, 'bread') ? { x: 172.5, z: 157 } : 'npc:benjamin', check: S => qd(S, 'skin') && qd(S, 'bread') && qd(S, 'benj'),
    talk: { benjamin(S, G) { if (S.q.benj) return false; say([N('benjamin', '형! 어디 가? 나도 갈래!', '', 'happy'), J('세겜에 형들 보러 가. 너는 아버지 곁에 있어야지.'),
      N('benjamin', '치이… 그럼 형, 꼭 빨리 와야 해. 약속!'), J('그래, 약속할게. 돌아오면 별 이야기 또 해 줄게.', '', 'tender'),
      T('요셉은 동생의 곱슬머리를 쓰다듬어 주었습니다. 이 약속이 지켜지기까지 얼마나 오랜 세월이 걸릴지, 그때는 아무도 알지 못했습니다.', '', 'sad')], () => tick(S, 'benj')); } },
    done(S, G, next) { GG.Life.bubble('benjamin', '형, 약속!', 3); S.q.tut = 'run'; next(); }, next: 'p_road' },
  p_road: { ch: 1, obj: '북쪽 세겜으로 · 큰길 따라가기', target: S => Gm().P.z > SPOTS.log[1] + 1 ? { x: SPOTS.log[0], z: SPOTS.log[1] - 3 } : 'spot:restOak',
    enter(S, G, re) { if (!re) G.UI.toast('길은 북쪽으로 이어져요 · 나침반을 따라가세요'); },
    check: (S, G) => G.dist(SPOTS.restOak[0], SPOTS.restOak[1]) < 9,
    done(S, G, next) { if (G.hour() < 18.6) S.time = Math.floor(S.time / 24) * 24 + 18.7; S.q.tut = null; G.UI.hint(null);
      narr([{ kick: '창세기 37장', title: '첫날 밤', t: '해가 서쪽 산 너머로 넘어갔습니다. 요셉은 길가의 큰 상수리나무 아래에서 밤을 지내기로 했습니다.', ref: '' }], next); }, next: 'p_night' },
  p_night: { ch: 1, obj: '상수리나무 아래 짚자리에 눕기', target: 'spot:restBed' },
  p_shechem: { ch: 1, obj: '세겜 들판에서 형들 찾기', list: S => [{ t: `형들의 흔적 살피기 (${Math.min(3, S.q.clues || 0)}/3)`, ok: (S.q.clues || 0) >= 3 }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 37:14', title: '세겜 들판', t: '이튿날, 요셉은 세겜에 이르렀습니다. 그런데 들판 어디에도 형들과 양 떼가 보이지 않았습니다.', ref: '창세기 37:14' }], () => G.UI.hint('형들이 머물던 흔적을 찾아보세요 · 반짝이는 곳에서 A 버튼', 'clue', 'eye')); },
    target: S => { const c = ['clue1', 'clue2', 'clue3'].find(k => !(S.q.cl || {})[k]); return c ? 'spot:' + c : null; },
    check: S => (S.q.clues || 0) >= 3, done(S, G, next) { G.UI.hint(null); GG.Game.npcShow('man', true); GG.Life.bubble('man', '여보게, 젊은이!', 3); G.sfx('blip', { pitch: 1.2 }); next(); }, next: 'p_man' },
  p_man: { ch: 1, obj: '들판의 어떤 사람과 이야기하기', target: 'npc:man',
    talk: { man(S, G) { say([T('어떤 사람이 그를 만난즉, 그가 들에서 방황하는지라.', '창세기 37:15'), N('man', '네가 무엇을 찾느냐?', '창세기 37:15'),
      J('내가 내 형들을 찾으오니, 청하건대 그들이 양 치는 곳을 내게 가르쳐 주소서.', '창세기 37:16'),
      N('man', '그들이 여기서 떠났느니라. 내가 그들의 말을 들으니 「도단으로 가자」 하더라.', '창세기 37:17'),
      N('man', '도단은 북쪽 골짜기 너머, 우물이 많은 평원이다. …젊은이, 그 고운 옷이 눈에 잘 띄는구먼. 몸조심하게.', '', 'tender'),
      { n: '요셉', t: '요셉은 무엇이라 대답했을까? (어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
        { t: '"네, 조심하겠습니다. 아버지가 주신 소중한 옷이라, 더 곱게 입을게요."', then: () => { GG.Deeds && GG.Deeds.char('care', 'coat'); } },
        { t: '"아버지께서 사랑으로 주신 옷이니, 자랑스럽게 입고 가겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('pride', 'coat'); } }] },
      J('고맙습니다! 하나님이 당신에게 복 주시기를!', '', 'happy')], () => { G.npcWalk('man', 214, -30, () => G.npcShow('man', false), 1.5); G.go('p_dothan'); }); } } },
  p_dothan: { ch: 1, obj: '형들을 따라 북쪽 도단으로', target: 'spot:dothanView', check: (S, G) => G.P.z < -98,
    done(S, G, next) { cinPlot(S, G, next); }, next: 'p_approach' },
  p_approach: { ch: 1, obj: '도단 들판의 형들에게 가기', target: 'spot:dothanCamp', check: (S, G) => G.dist(SPOTS.dothanCamp[0], SPOTS.dothanCamp[1] + 6) < 7,
    done(S, G, next) { cinPit(S, G, next); }, next: 'c1_pit' },
  // =============================================================== 1장 · 구덩이
  c1_pit: { ch: 2, obj: '빈 구덩이 속에서', list: S => [{ t: `벽을 기어오르려 해 보기 · 점프 (${Math.min(2, S.q.climb || 0)}/2)`, ok: (S.q.climb || 0) >= 2 }, { t: '형들을 불러 보기', ok: qd(S, 'shout') }, { t: '하나님께 부르짖기', ok: qd(S, 'pitPray') }],
    enter(S, G, re) { S.q.inPit = 1; if (!re) setTimeout(() => G.UI.hint('구덩이 벽이 높아요 · 점프 버튼으로 기어올라 보세요', 'pitJump', 'jump'), 900); },
    target: S => (S.q.climb || 0) < 2 ? null : !qd(S, 'shout') ? { x: PIT.x, z: PIT.z } : { x: PIT.x + 0.8, z: PIT.z - 0.8 },
    check: S => (S.q.climb || 0) >= 2 && qd(S, 'shout') && qd(S, 'pitPray'), done(S, G, next) { G.UI.hint(null); cinSold(S, G, next); }, next: 'c1_caravan' },
  c1_caravan: { ch: 2, obj: S => S.q.night ? '대상을 따라 애굽으로' : '줄에 묶여 이스마엘 대상을 따라 걷기', list: S => [{ t: '광야의 밤', ok: !!S.q.night }, { t: '애굽 국경', ok: !!S.q.reveal }],
    enter(S, G, re) { S.q.inPit = 0; setTimeout(() => cinJourney(S, G), re ? 600 : 250); }, // v16.1: the journey is a cutscene
    target: S => caravanTarget(S), check: (S, G) => !!S.q.reveal && (G.dist(SPOTS.market[0], SPOTS.market[1]) < 24 || G.dist(SPOTS.market[0] + 14, SPOTS.market[1] - 12) < 12), done(S, G, next) { G.UI.hint(null); next(); }, next: 'c1_market' },
  c1_market: { ch: 2, obj: '애굽의 노예 장터', enter(S, G, re) { cinMarket(S, G); } },
  // =============================================================== 2장 · 보디발의 집
  c2_arrive: { ch: 3, obj: '종들의 숙소의 늙은 종과 이야기하기', target: 'npc:ameni', enter(S, G, re) { if (!re) setTimeout(() => GG.Life.bubble('neb', '세헤브! 셰마! (서둘러! 가라!)', 3.2), 800); },
    talk: { ameni(S, G) { say([EG('ameni', '엠 헤테프… 이-크 레크?', '평안하냐… 어디서 왔느냐?'), T('요셉은 고개를 저었습니다. 한 마디도 알아들을 수 없었습니다.', '시편 81:5 참고'),
      N('ameni', '…가나안 말을 하는구나? 나도 조금 할 줄 안다. 젊을 적에 대상을 따라 다녔거든.', '', 'tender'),
      J('말을… 알아들을 수 있는 분이 계시다니. 여기는 어디인가요?', '', 'weary'),
      N('ameni', '바로의 신하, 친위대장 보디발 나리의 집이다. 나리는 바로를 지키는 호위대의 우두머리시지. 이제 너는 이 집의 종이다.'),
      N('ameni', '울지 마라, 얘야. 종의 하루는 길단다. 살아남으려면 먼저 애굽 말부터 익혀야 해. 내가 가르쳐 주마.', '', 'tender'),
      N('ameni', '자, 이 물항아리를 받아라. 우물에서 물을 길어 부엌 항아리를 채우고, 맷돌에 보리를 갈고, 외양간 소들에게 꼴을 주어라. 일하면서 말을 하나씩 가르쳐 주마.'),
      T('「애굽 말 배우기」 · 일을 하면 애굽 말을 하나씩 익혀요. 익힌 말은 사람들의 말을 알아듣는 데 도움이 돼요.')], () => { G.giveTool('jar'); learn('hotep'); G.go('c2_work'); }); } } },
  c2_work: { ch: 3, obj: '종의 첫날', list: S => [{ t: '우물에서 물을 길어 부엌 항아리 채우기', ok: qd(S, 'w1') }, { t: '부엌 맷돌로 보리 갈기', ok: qd(S, 'w2') }, { t: '외양간 소들에게 꼴 주기', ok: qd(S, 'w3') }],
    target: S => !qd(S, 'w1') ? (S.water >= 4 ? { x: -8.6, z: 47.4 } : { x: -38, z: 58.8 }) : !qd(S, 'w2') ? 'spot:quern' : !qd(S, 'w3') ? { x: 9, z: 70 } : null,
    check: S => qd(S, 'w1') && qd(S, 'w2') && qd(S, 'w3'), done(S, G, next) { GG.Life.bubble('neb', '이 인! (이리 와!)', 3); next(); }, next: 'c2_quiz' },
  c2_quiz: { ch: 3, obj: '청지기 네브에게 일 보고하기', target: 'npc:neb',
    talk: { neb(S, G) { say([EG('neb', '히브리 종. 이 인 무!', ''),
      { n: '요셉', t: '네브가 무슨 말을 했을까?', choices: [{ t: '물을 가져오라는 말이에요.', ok: true }, { t: '빵을 달라는 말이에요.', ok: false, fb: '아메니가 속삭였다: "타는 빵이고… 무는?"' }, { t: '주인님이 부르신다는 말이에요.', ok: false, fb: '아메니가 속삭였다: "네브는 주인이란 뜻이지. 하지만 네브가 \'무\'라고 했잖니."' }] },
      T('요셉이 물을 따라 건네자, 네브는 한 모금 마시고 다시 물었습니다.'), EG('neb', '타 네페르?', ''),
      { n: '요셉', t: '이번에는?', choices: [{ t: '빵이 좋으냐고 묻는 거예요.', ok: true }, { t: '물이 차가우냐고요.', ok: false, fb: '"타"는 부엌에서 들었던 말이에요. 맷돌을 돌리며 헤누가 뭐라고 했지요?' }, { t: '소가 아프냐고요.', ok: false, fb: '소는 "카"예요. "타"는…?' }] },
      J('타… 네페르! (빵이 좋습니다!)', '', 'happy'),
      EG('neb', '…네페르.', '…좋다.'), N('ameni', '하하! 네브가 누구에게 「좋다」고 하는 건 처음 듣는구나. 「네페르」는 「좋다」, 「네브」는 「주인」이란 말이다.', '', 'laugh'),
      T('그날 밤, 요셉은 종들의 숙소에 누워 낯선 하늘의 별을 바라보았습니다. 고향의 별과 같은 별이었습니다.')], () => { learn('nefer'); learn('neb'); if (G.hour() < 19) S.time = Math.floor(S.time / 24) * 24 + 19.4; G.go('c2_night1'); }); } } },
  c2_night1: { ch: 3, obj: '종들의 숙소 짚자리에서 자기', target: { x: -46.8, z: 50 }, check: S => S.day > (S.q.d0 || 1), enter(S) { S.q.d0 = S.q.d0 || S.day; },
    done(S, G, next) { narr([{ kick: '보디발의 집 · 둘째 날', title: '밭으로', t: '아메니가 요셉을 깨웠습니다. "오늘은 밭에 나가자. 아마를 거두는 날이다. 세마포를 짜는 그 아마 말이다."', ref: '' }], next); }, next: 'c2_field' },
  c2_field: { ch: 3, obj: '보디발의 밭 일', list: (S, G) => [{ t: `밭의 아마 거두기 (${Math.min(8, S.q.flax || 0)}/8)`, ok: (S.q.flax || 0) >= 8 }, { t: '진흙에 빠진 송아지 구하기', ok: qd(S, 'calf') }],
    target: S => (S.q.flax || 0) < 8 ? 'field:pflax' : !qd(S, 'calf') ? 'spot:canal' : null, check: S => (S.q.flax || 0) >= 8 && qd(S, 'calf'),
    enter(S, G, re) { if (!re) { setTimeout(() => G.UI.hint('익은 아마를 바라보고 A를 누르세요 · 누르고 있으면 계속 거둬요', 'flax', 'tap'), 600); } },
    done(S, G, next) { G.UI.hint(null); say([N('gardener', '요셉, 이상하지 않아? 네가 거둔 아마는 다른 사람 것보다 두 배나 묵직해.'), N('ameni', '…그러고 보니 네가 손대는 일마다 잘되는구나. 우물물도 맑아지고, 소들도 살이 오르고.'),
      J('제가 한 게 아니에요. 제 하나님께서 함께 계셔서 그래요.'), N('ameni', '네 하나님…? 이 먼 애굽 땅까지 너를 따라왔단 말이냐?', '', 'awe')], next); }, next: 'c2_store' },
  c2_store: { ch: 3, obj: '서기관 이피를 도와 곳간 장부 맞추기', list: S => [{ t: `곳간 선반 살피기 (${Object.keys(S.q.shelf || {}).length}/4)`, ok: Object.keys(S.q.shelf || {}).length >= 4 }, { t: '서기관에게 틀린 곳 알려 주기', ok: qd(S, 'ledger') }],
    enter(S, G, re) { if (!re) say([N('potiphar', '이피! 곳간 장부가 또 안 맞는다고? 내가 바로의 궁에 바칠 곡식을 어찌 세란 말이냐!', '', 'angry'), N('scribe', '나리, 장부와 곳간이 자꾸 어긋납니다… 눈이 침침해서 원…', '', 'fear'),
      N('ameni', '(작은 목소리로) 요셉, 너 셈을 할 줄 알지? 저 노인을 좀 도와 드려라. 곳간 선반을 하나하나 세어 보거라.', '', 'whisper')]); },
    target: S => Object.keys(S.q.shelf || {}).length < 4 ? 'spot:store' : 'npc:scribe', check: S => qd(S, 'ledger'),
    talk: { scribe(S, G) { if (S.q.ledger) return false; if (Object.keys(S.q.shelf || {}).length < 4) { say([N('scribe', '곳간의 선반 네 개를 먼저 세어 보게. 포도주, 기름, 곡식, 무화과.')]); return; } ledgerPuzzle(S, G); } },
    done(S, G, next) { cinPotiphar(S, G, next); }, next: 'c2_banquet' },
  c2_banquet: { ch: 3, obj: S => `잔치에서 보디발과 손님들 섬기기 (${Math.min(4, S.q.served || 0)}/4)`, list: S => [{ t: S.q.want ? `주문: 「${({ guest1: '이르프!', guest2: '무… 무 네페르.', guest3: '타! 타 네페르!', potiphar: '데브.' })[S.q.want]}」 (${S.q.want === 'potiphar' ? '보디발' : '손님'})` : '…', ok: false }, { t: S.q.carry ? `들고 있는 것 · ${S.q.carry}` : '시중 상에서 알맞은 음식을 들고 가기', ok: false }],
    enter(S, G, re) { banquetStart(S, G, re); }, target: S => S.q.carry ? 'npc:' + (S.q.want || 'guest1') : { x: -38.4, z: 44.6 }, check: S => (S.q.served || 0) >= 4,
    done(S, G, next) { banquetEnd(S, G, next); }, next: 'c2_manage' },
  c2_manage: { ch: 3, obj: '가정 총무의 일', list: S => [{ t: '일꾼들에게 맞는 일 맡기기', ok: qd(S, 'assign') }, { t: '요리사와 정원지기의 다툼 풀기', ok: qd(S, 'quarrel') }, { t: '청지기 네브와 이야기하기', ok: qd(S, 'nebOk') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:4', title: '가정 총무', t: '보디발이 요셉을 가정 총무로 삼고 자기의 소유를 다 그의 손에 위탁했습니다. 이제 집안의 모든 일꾼과 곳간과 밭이 요셉의 손에 있습니다.', ref: '창세기 39:4' }]); },
    target: S => !qd(S, 'assign') ? { x: -28, z: 44.2 } : !qd(S, 'quarrel') ? 'npc:cook' : !qd(S, 'nebOk') ? 'npc:neb' : null, check: S => qd(S, 'assign') && qd(S, 'quarrel') && qd(S, 'nebOk'),
    talk: { cook(S, G) { if (S.q.quarrel) return false; quarrel(S, G); }, gardener(S, G) { if (S.q.quarrel) return false; quarrel(S, G); },
      neb(S, G) { if (S.q.nebOk) return false; say([N('neb', '…히브리 종이 하루아침에 총무라니. 이 집에서 서른 해를 일한 나는 무엇이란 말이오.', '', 'cold'),
        { n: '요셉', t: '네브에게 무엇이라 말할까?', choices: [
          { t: '"네브, 대문과 손님 맞는 일은 이 집에서 당신이 제일 잘해요. 그 일을 맡아 주세요. 저는 당신에게 배울 게 많아요."', ok: true },
          { t: '"이제 내가 총무요. 내 말을 따르시오."', ok: false, fb: '요셉은 말을 삼켰습니다. 높아진 자리일수록 낮은 마음이 필요했습니다.' },
          { t: '"주인님께 말씀드려 당신을 내보내게 하겠소."', ok: false, fb: '그것은 요셉이 원하는 길이 아니었습니다. 형들에게 미움받던 아픔을, 요셉은 누구보다 잘 알았습니다.' }] },
        N('neb', '……', ''), N('neb', '…당신은 참 이상한 사람이오, 총무. 좋소. 대문은 내게 맡기시오.', '', 'tender')], () => tick(S, 'nebOk')); } },
    done(S, G, next) { cinBless(S, G, next); }, next: 'c2_tempt1' },
  c2_tempt1: { ch: 3, obj: '안주인이 연못가로 부른다', target: 'npc:wife',
    talk: { wife(S, G) { say([N('wife', '요셉, 이리 와서 앉아. 너는 왜 늘 바쁘기만 하니?', '', 'tender'), J('마님, 곳간 일을 보러 가던 길입니다.'),
      T('그 후에 그의 주인의 아내가 요셉에게 눈짓하며 동침하기를 청했습니다.', '창세기 39:7'),
      { n: '요셉', t: '요셉은 어떻게 대답했을까?', choices: [
        { t: '"내 주인이 집안의 모든 소유를 다 내 손에 위탁하였으니… 금한 것은 당신뿐이니, 당신은 그의 아내임이라. 그런즉 내가 어찌 이 큰 악을 행하여 하나님께 죄를 지으리이까."', ok: true, ref: '창세기 39:8–9' },
        { t: '"…(잠시 망설인다)"', ok: false, fb: '그 순간 요셉의 마음에 아버지의 얼굴과, 구덩이 속에서 불렀던 하나님의 이름이 떠올랐습니다. 무엇이 옳은지 요셉은 알고 있었습니다.' },
        { t: '"주인님께만 들키지 않으면 되겠지요."', ok: false, fb: '사람은 속일 수 있어도, 모든 것을 보시는 하나님은 속일 수 없습니다. 요셉은 그것을 알고 있었습니다.' }] },
      J('내 주인이 집안의 모든 소유를 간섭하지 아니하고 다 내 손에 위탁하였으니, 이 집에는 나보다 큰 이가 없으며, 주인이 아무것도 내게 금하지 아니하였어도 금한 것은 당신뿐이니 당신은 그의 아내임이라.', '창세기 39:8–9'),
      J('그런즉 내가 어찌 이 큰 악을 행하여 하나님께 죄를 지으리이까.', '창세기 39:9', 'solemn'),
      N('wife', '…하나님? 네가 섬긴다는 그 보이지도 않는 신 말이냐.', '', 'cold'), N('wife', '두고 보자, 히브리 종.', '', 'cold')], () => { S.time = Math.floor(S.time / 24) * 24 + 19.5; G.go('c2_tempt2'); }); } } },
  c2_tempt2: { ch: 3, obj: '날마다 · 사람들 곁에서 일하기', list: S => [{ t: `일꾼들과 함께 밭에서 아마 거두기 (${Math.min(4, S.q.flax2 || 0)}/4)`, ok: (S.q.flax2 || 0) >= 4 }, { t: '아메니와 이야기하기', ok: qd(S, 'ameniWarn') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:10', title: '날마다', t: '여인이 날마다 요셉에게 청하였으나, 요셉이 듣지 아니하여 동침하지 아니할 뿐더러 함께 있지도 아니하였습니다.', ref: '창세기 39:10' }], () => { G.newDay('날마다 같은 유혹이 찾아왔어요'); }); },
    target: S => (S.q.flax2 || 0) < 4 ? 'field:pflax' : 'npc:ameni', check: S => (S.q.flax2 || 0) >= 4 && qd(S, 'ameniWarn'),
    talk: { ameni(S, G) { if (S.q.ameniWarn) return false; say([N('ameni', '얘야… 안주인의 눈빛이 심상치 않다. 사람들은 다 눈치채고 있어.', '', 'whisper'), J('알아요, 아메니. 그래서 늘 사람들이 있는 곳에서 일해요. 혼자 안채에 들어가지 않아요.'),
      N('ameni', '지혜롭구나. 하지만 사나운 바람은 문을 꼭 닫아도 틈으로 들어오는 법이란다. 네 하나님께서 너를 지켜 주시기를.', '', 'tender')], () => tick(S, 'ameniWarn')); } },
    done(S, G, next) { say([N('maid', '총무님, 마님께서 안채로 오시랍니다.'), { n: '요셉', t: '어떻게 할까?', choices: [{ t: '"일꾼들과 밭일 중이라고 전해 주세요. 일은 대청에서 사람들 앞에서 보고드리겠습니다."', ok: true }] }], next); }, next: 'c2_tempt3' },
  c2_tempt3: { ch: 3, obj: '안채 대청에서 장부 정리하기', target: { x: -22.5, z: 41.6 },
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:11', title: '그날', t: '그러할 때에 요셉이 그의 일을 하러 그 집에 들어갔더니, 그 집 사람들은 하나도 거기에 없었습니다.', ref: '창세기 39:11', e: 'solemn' }], () => { S.q.empty = 1; S.time = Math.floor(S.time / 24) * 24 + 15; }); else S.q.empty = 1; } },
  c2_flee: { ch: 3, obj: '도망쳐요! 대문 밖으로', target: { x: -28, z: 74 }, enter(S, G) { S.q.flee = 1; G.UI.hint('달리기 버튼으로 뛰어요!', 'flee', 'run'); }, check: (S, G) => G.P.z > 71.5 && Math.abs(G.P.x + 28) < 9,
    done(S, G, next) { G.UI.hint(null); S.q.flee = 0; cinAccuse(S, G, next); }, next: 'c3_cell' },
  // =============================================================== 3장 · 왕의 옥
  c3_cell: { ch: 4, obj: '창으로 드는 달빛 아래에서 기도하기', target: { x: -18.4, z: -8.2 }, enter(S, G, re) { S.q.cellLock = 1; if (!re) setTimeout(() => G.UI.hint('차꼬를 차서 천천히 걸어요', 'chain', 'move'), 1200); } },
  c3_keeper: { ch: 4, obj: '간수장이 맡긴 일', list: S => [{ t: `감방의 죄수들에게 물 나눠 주기 (${Object.keys(S.q.gave || {}).length}/4)`, ok: Object.keys(S.q.gave || {}).length >= 4 }, { t: '앓는 늙은 죄수 돌보기', ok: qd(S, 'oldCare') }],
    enter(S, G, re) { S.q.cellLock = 0; if (!re) say([N('keeper', '일어나라, 히브리 종. 여기서는 일하지 않으면 먹지도 못한다.', '', 'cold'), N('keeper', '저 대야에서 물을 길어 감방마다 나눠 줘라. 그리고 구석의 늙은이가 사흘째 앓고 있으니 좀 살펴보고.', '', 'cold')], () => { if (!G.tool('jar')) G.giveTool('jar'); }); },
    target: S => Object.keys(S.q.gave || {}).length < 4 ? (S.water > 0 ? { x: -33, z: -4.6 } : 'spot:basin') : 'npc:oldP', check: S => Object.keys(S.q.gave || {}).length >= 4 && qd(S, 'oldCare'),
    talk: { oldP(S, G) { if (S.q.oldCare) return false; if (Object.keys(S.q.gave || {}).length < 4) { say([N('oldP', '…물… 물을…', '', 'weary')]); return; }
      say([N('oldP', '…누구냐… 간수냐…?', '', 'weary'), J('물을 가져왔어요, 할아버지. 그리고 제 몫의 떡도요. 조금이라도 드세요.', '', 'tender'), N('oldP', '네 몫을…? 여기서 남에게 떡을 주는 놈은 처음 보는구나…', '', 'weary'),
        T('요셉은 늙은 죄수의 이마를 젖은 천으로 닦아 주고, 밤새 곁을 지켰습니다.')], () => tick(S, 'oldCare')); } },
    done(S, G, next) { say([N('keeper', '…너는 이상한 녀석이로구나. 차꼬를 차고도 남을 먼저 챙기다니.', '', 'cold'), N('keeper', '그 차꼬, 풀어 주마. 대신 내일부터는 옥 안의 일을 네가 도맡아라.'),
      T('여호와께서 요셉과 함께 하시고 그에게 인자를 더하사, 간수장에게 은혜를 받게 하셨습니다.', '창세기 39:21')], () => { G.sfx('chain'); G.setOutfit('prisoner'); G.give('bread', 1, true); next(); }); }, next: 'c3_charge' },
  c3_charge: { ch: 4, obj: '옥중의 일을 맡다', list: S => [{ t: `감방마다 떡 나눠 주기 (${Object.keys(S.q.fed || {}).length}/4)`, ok: Object.keys(S.q.fed || {}).length >= 4 }, { t: '두 죄수의 싸움 말리기', ok: qd(S, 'fight') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:22', title: '옥중의 총무', t: '간수장이 옥중 죄수를 다 요셉의 손에 맡기므로, 그 제반 사무를 요셉이 처리하였습니다.', ref: '창세기 39:22' }]); },
    target: S => Object.keys(S.q.fed || {}).length < 4 ? (Gm().P.carry === 'basket' ? { x: -33, z: -4.6 } : { x: -32, z: 7 }) : 'npc:prisA', check: S => Object.keys(S.q.fed || {}).length >= 4 && qd(S, 'fight'),
    talk: { prisA(S, G) { if (S.q.fight || Object.keys(S.q.fed || {}).length < 4) return false; fight(S, G); }, prisB(S, G) { if (S.q.fight || Object.keys(S.q.fed || {}).length < 4) return false; fight(S, G); } },
    done(S, G, next) { narr([{ kick: '창세기 39:23', title: '형통하게 하셨더라', t: '간수장은 요셉의 손에 맡긴 것을 무엇이든지 살펴보지 아니하였으니, 이는 여호와께서 요셉과 함께 하심이라. 여호와께서 그를 범사에 형통하게 하셨더라.', ref: '창세기 39:23' }], next); }, next: 'c3_officers' },
  c3_officers: { ch: 4, obj: '새로 갇힌 두 관원장 섬기기', list: S => [{ t: '술 맡은 관원장에게 물 드리기', ok: qd(S, 'cupW') }, { t: '떡 굽는 관원장에게 떡 드리기', ok: qd(S, 'bakeW') }],
    enter(S, G, re) { if (!re) cinOfficers(S, G); }, target: S => !qd(S, 'cupW') ? 'npc:cupbearer' : 'npc:baker', check: S => qd(S, 'cupW') && qd(S, 'bakeW'),
    talk: { cupbearer(S, G) { if (S.q.cupW) return false; say([J('나리, 물을 드십시오.'), N('cupbearer', '…바로의 잔을 받들던 내가 옥에서 흙 묻은 잔으로 물을 마시는구나. 그래도 고맙다, 히브리 청년.', '', 'sad'), N('cupbearer', '그런데 젊은이, 자네는 어찌하여 이 옥에 들어왔는가?', '', 'tender'),
        { n: '요셉', t: '요셉은 무엇이라 대답했을까? (어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
          { t: '"저는 억울합니다. 누명을 썼어요. 주인께서 제 말은 들어 주지 않으셨습니다!"', then: () => { GG.Deeds && GG.Deeds.char('protest'); setTimeout(() => say([N('cupbearer', '그렇군… 억울한 사람이 어디 자네 하나뿐이겠는가. 자네 마음은 알겠네.', '', 'sad')], () => tick(S, 'cupW')), 30); } },
          { t: '"저는 죄가 없으나, 하나님께서 보고 계심을 믿습니다."', then: () => { GG.Deeds && GG.Deeds.char('trust'); setTimeout(() => say([N('cupbearer', '…원망이 없구먼, 이상한 청년이야. 그런데 그 말이 이 어두운 옥에서는 이상하게 위로가 되는군.', '', 'tender')], () => tick(S, 'cupW')), 30); } }] }]); },
      baker(S, G) { if (S.q.bakeW) return false; say([J('나리, 떡을 드십시오.'), N('baker', '흥, 이걸 떡이라고… 왕궁에서는 이런 건 상에 올리지도 않는다.', '', 'cold'), N('baker', '…그래도 배는 고프구나. 고맙네.', '', 'weary')], () => tick(S, 'bakeW')); } },
    done(S, G, next) { narr([{ kick: '창세기 40:4', title: '여러 날', t: '그들이 갇힌 지 여러 날이라. 그리고 어느 날 밤, 두 사람이 한꺼번에 꿈을 꾸었습니다.', ref: '창세기 40:4–5' }], () => { G.newDay(''); next(); }); }, next: 'c3_dreams' },
  c3_dreams: { ch: 4, obj: S => !qd(S, 'cupDone') ? '근심하는 술 맡은 관원장에게 말 걸기' : '떡 굽는 관원장의 꿈 듣기', target: S => !qd(S, 'cupDone') ? 'npc:cupbearer' : 'npc:baker', check: S => qd(S, 'bakeDone'),
    talk: { cupbearer(S, G) { if (S.q.cupDone) return false; cupDream(S, G); }, baker(S, G) { if (!S.q.cupDone || S.q.bakeDone) return false; bakerDream(S, G); } },
    done(S, G, next) { cinBirthday(S, G, next); }, next: 'c3_wait' },
  c3_wait: { ch: 4, obj: S => WAIT[S.q.wait || 0] ? WAIT[S.q.wait || 0].obj : '', list: S => [{ t: `잊힌 시간 (${Math.min(4, S.q.wait || 0)}/4)`, ok: false }].concat(WAIT[S.q.wait || 0] && WAIT[S.q.wait || 0].list ? WAIT[S.q.wait || 0].list(S) : []),
    enter(S, G, re) { waitSetup(S, G, re); }, target: S => WAIT[S.q.wait || 0] ? WAIT[S.q.wait || 0].target(S) : null },
  // =============================================================== 4장 · 바로의 꿈
  c4_shave: { ch: 5, obj: '대야에서 수염을 깎고 옷 갈아입기', target: 'spot:basin',
    enter(S, G, re) { if (!re) say([N('messenger', '히브리 사람 요셉이 누구냐! 바로께서 너를 부르신다! 서둘러라!', '', 'urgent'), N('keeper', '…요셉. 어서 가거라. 너는 원래부터 여기 있을 사람이 아니었다.', '', 'tender'),
      T('바로 앞에 나아가려면 깨끗이 씻고 단장해야 해요. 옥 마당의 대야로 가세요.')]); } },
  c4_court: { ch: 5, obj: '궁 안으로 들어가 바로 앞에 서기', target: 'spot:court', check: (S, G) => G.dist(SPOTS.court[0], SPOTS.court[1]) < 3.4,
    done(S, G, next) { courtIntro(S, G, next); }, next: 'c4_vision' },
  c4_vision: { ch: 5, obj: S => `바로의 꿈속 장면 살피기 (${Object.keys(S.q.seen || {}).length}/5)`, enter(S, G, re) { visionEnter(S, G, re); },
    target: S => { const k = VISION.find(v => !(S.q.seen || {})[v.id]); return k ? { x: k.x, z: k.z } : null; } },
  c4_answer: { ch: 5, obj: '바로께 꿈을 해석해 드리기', enter(S, G, re) { answerScene(S, G); } },
  // =============================================================== 5장 · 일곱 해 풍년
  c5_patrol: { ch: 6, obj: '애굽 온 땅을 순찰하기', list: S => [{ t: '버금 수레 타기', ok: qd(S, 'rode') }, { t: '성읍 감독관 만나기', ok: qd(S, 'metC') }, { t: '서쪽 마을 촌장 만나기 (북쪽 나루 건너)', ok: qd(S, 'metW') }, { t: '남쪽 마을 촌장 만나기 (남쪽 나루 건너)', ok: qd(S, 'metS') }],
    enter(S, G, re) { if (!re) { narr([{ kick: '창세기 41:46', title: '순찰', t: '요셉이 바로 앞에서 나가 애굽 온 땅을 순찰하였습니다. 바로가 내어 준 버금 수레를 타고 가면 먼 길도 금세예요.', ref: '창세기 41:46' }], () => { GG.UI.featCard('chariot', { kick: '새로 열린 기능', n: '버금 수레', ic: 'donkey', d: '왼쪽 아래 「수레 타기」로 타고 내려요. 달리기 버튼을 누르면 말이 힘차게 달려요. 사람이나 장소 가까이 가면 저절로 멈춰요.' }); }); } },
    target: S => !qd(S, 'metC') ? 'npc:overseerC' : !qd(S, 'metW') ? 'npc:overseerW' : !qd(S, 'metS') ? 'npc:overseerS' : null, check: S => qd(S, 'rode') && qd(S, 'metC') && qd(S, 'metW') && qd(S, 'metS'),
    talk: { overseerC(S, G) { if (S.q.metC) return false; say([N('overseerC', '총리님! 바로께서 명하신 대로 성읍 동쪽에 곳간 터를 닦아 두었습니다.'), J('수고했소. 풍년 일곱 해 동안 거둔 곡식을 각 성에 쌓을 것이오. 이 성읍 곳간이 그 첫 곳간이 될 것이오.'), N('overseerC', '벽돌은 벽돌 굽는 우니의 가마에서 가져오시면 됩니다.')], () => tick(S, 'metC')); },
      overseerW(S, G) { if (S.q.metW) return false; say([N('overseerW', '오분의 일이라니요, 총리님! 풍년에 곡식을 왜 쌓아 둡니까? 지금 팔면 다 금이 될 텐데!', '', 'angry'),
        { n: '요셉', t: '촌장을 어떻게 설득할까?', choices: [{ t: '"일곱 해 뒤 흉년이 오면 금은 먹을 수 없소. 지금 쌓은 곡식이 당신의 아이들을 살릴 것이오."', ok: true },
          { t: '"바로의 명령이오! 따르지 않으면 벌을 받을 것이오."', ok: false, fb: '두려움으로 움직인 마음은 오래가지 않아요. 요셉은 다시 차분히 설명했습니다.' }] },
        N('overseerW', '…아이들을. 제 손녀가 이제 막 걸음마를 뗐습니다. 알겠습니다, 총리님. 서쪽 마을은 오분의 일을 바치겠습니다.', '', 'tender')], () => tick(S, 'metW')); },
      overseerS(S, G) { if (S.q.metS) return false; say([N('overseerS', '총리님! 저희 마을은 기꺼이 따르겠습니다. 다만 곡식 창고가 늘 강물에 잠겨서…', '', 'happy'), N('overseerS', '나일 강이 넘치는 철이면 마을 창고까지 물이 들어와 곡식이 썩곤 합니다.'),
        { n: '요셉', t: '남쪽 마을 곳간은 어디에 지을까?', choices: [{ t: '물이 닿지 않는 마을 서쪽 언덕 위 단단한 땅', ok: true }, { t: '물을 길어 오기 쉬운 강가 낮은 땅', ok: false, fb: '강가 낮은 땅은 범람하면 잠겨요. 곳간은 높고 마른 곳이어야 해요.' }, { t: '사람이 많은 마을 한가운데 장터', ok: false, fb: '장터 땅은 낮고 좁아요. 일곱 해 동안 쌓을 곡식에는 넓고 높은 땅이 필요해요.' }] },
        N('overseerS', '언덕 위라! 그곳이라면 물이 닿지 않겠군요. 역시 하나님의 영에 감동된 분이십니다!', '', 'happy')], () => tick(S, 'metS')); } },
    done(S, G, next) { narr([{ kick: '창세기 41:47–48', title: '풍년 첫해', t: '일곱 해 풍년에 토지 소출이 심히 많았습니다. 요셉은 각 성 주위의 밭의 곡물을 그 성 중에 쌓아 두기로 했습니다. 먼저 곳간 셋을 지어야 해요.', ref: '창세기 41:47–48' }], next); }, next: 'c5_year1' },
  c5_year1: { ch: 6, obj: '풍년 1년 · 곳간 짓기', list: S => [{ t: '벽돌 굽는 우니에게 벽돌 받기', ok: qd(S, 'bricks') }, { t: '성읍 곳간 짓기', ok: !!S.built.granA }, { t: '서쪽 마을 곳간 짓기', ok: !!S.built.granB }, { t: '남쪽 마을 곳간 짓기', ok: !!S.built.granC }],
    target: S => !qd(S, 'bricks') ? 'npc:brick' : !S.built.granA ? 'site:granA' : !S.built.granB ? 'site:granB' : !S.built.granC ? 'site:granC' : null, check: S => S.built.granA && S.built.granB && S.built.granC,
    talk: { brick(S, G) { if (S.q.bricks) return false; say([N('brick', '총리님! 가마마다 벽돌이 산더미입니다. 진흙에 짚을 섞어 볕에 말린 튼튼한 벽돌이지요.'), N('brick', '곳간 셋에 쓸 만큼 수레에 실어 두었습니다. 터에 가서 「짓기」만 하시면 일꾼들이 쌓을 겁니다.')], () => { G.give('brick', 60); G.give('wood', 18); tick(S, 'bricks'); }); } },
    done(S, G, next) { narr([{ kick: '풍년 1년', title: '곳간 셋', t: '성읍과 서쪽 마을과 남쪽 마을에 곳간이 섰습니다. 그해 가을, 수레마다 곡식이 넘치도록 실려 들어왔습니다.', ref: '창세기 41:48' }], next); }, next: 'c5_manasseh' },
  c5_manasseh: { ch: 6, obj: '총리의 집으로 · 아스낫이 기다린다', target: 'npc:asenath', talk: { asenath(S, G) { birthScene(S, G, 'manasseh'); } } },
  c5_year2: { ch: 6, obj: '풍년 2년 · 왕실 밭과 곳간', list: S => [{ t: `왕실 밭의 밀 거두기 (${Math.min(12, S.q.wheat || 0)}/12)`, ok: (S.q.wheat || 0) >= 12 }, { t: '서기관에게 곳간 기록 듣기', ok: qd(S, 'record') }],
    enter(S, G, re) { if (!re) { if (!G.tool('sickle')) G.giveTool('sickle'); narr([{ kick: '풍년 2년', title: '왕실 밭', t: '바로의 궁 북쪽 왕실 밭에 밀이 누렇게 익었습니다. 총리가 몸소 낫을 들자 일꾼들이 놀라워했습니다.', ref: '' }]); } },
    target: S => (S.q.wheat || 0) < 12 ? 'field:royal' : 'npc:scribeR', check: S => (S.q.wheat || 0) >= 12 && qd(S, 'record'),
    talk: { scribeR(S, G) { if (S.q.record || (S.q.wheat || 0) < 12) return false; say([N('scribeR', '총리님, 곳간 기록을 아룁니다. 성읍 곳간 만 이천 섬, 서쪽 곳간 구천 섬, 남쪽 곳간 칠천 섬…'), N('scribeR', '이대로라면 곳간을 더 지어야 할 것 같습니다. 백성들이 오분의 일을 바치고도 곡식이 남아돈답니다.', '', 'happy')], () => tick(S, 'record')); } },
    done(S, G, next) { next(); }, next: 'c5_ephraim' },
  c5_ephraim: { ch: 6, obj: '총리의 집 · 둘째 아이', target: 'npc:asenath', talk: { asenath(S, G) { birthScene(S, G, 'ephraim'); } } },
  c5_years: { ch: 6, obj: '일곱 해 풍년', enter(S, G, re) { plentyMontage(S, G); } },
  // =============================================================== 6장 · 일곱 해 흉년
  c6_open: { ch: 7, obj: S => `곳간 문 열기 (${Object.keys(S.q.opened || {}).length}/3)`, list: S => [{ t: '성읍 곳간', ok: !!(S.q.opened || {}).A }, { t: '서쪽 마을 곳간', ok: !!(S.q.opened || {}).B }, { t: '남쪽 마을 곳간', ok: !!(S.q.opened || {}).C }],
    enter(S, G, re) { famineEnter(S, G, re); }, target: S => { const o = S.q.opened || {}; return !o.A ? 'spot:granaryA' : !o.B ? 'spot:granaryB' : !o.C ? 'spot:granaryC' : null; }, check: S => Object.keys(S.q.opened || {}).length >= 3,
    done(S, G, next) { narr([{ kick: '창세기 41:56', title: '곳간을 열다', t: '온 지면에 기근이 있으매, 요셉이 모든 창고를 열고 애굽 백성에게 팔았습니다.', ref: '창세기 41:56' }], next); }, next: 'c6_sell' },
  c6_sell: { ch: 7, obj: S => `성읍 곳간 앞의 사람들에게 곡식 팔기 (${Object.keys(S.q.sold || {}).length}/6)`, target: S => { const v = BUYERS.find(b => !(S.q.sold || {})[b.id] && (!b.last || Object.keys(S.q.sold || {}).length >= 5)); return v ? 'npc:' + v.id : null; },
    check: S => Object.keys(S.q.sold || {}).length >= 6, done(S, G, next) { cinBrothers(S, G, next); }, next: 'j_end' },
  j_end: { ch: 10, obj: '자유 여행 · 애굽과 고센 땅을 마음껏 다니기',
    // v16.1: when the Bible story of this episode is done, the free journey begins — and it is said plainly that what follows is an
    // imagined 「IF」 story, not Scripture.
    enter(S, G, re) { for (const k of ['build', 'build2', 'herd2', 'ride', 'ride2', 'fish', 'hunt']) if (Gm().FEATS[k]) Gm().unlockFeat(k, true); S.flags.free = 1; S.q.born1 = S.q.born2 = 1;
      if (!re && !S.flags.freeIntro) { S.flags.freeIntro = 1; setTimeout(() => narr([
        { kick: '요셉 편 · 끝', title: '여기까지가 성경의 이야기', t: '요셉은 형들과 화해했고, 아버지 야곱과 온 집안이 고센 땅에 자리 잡았습니다. 성경의 이야기는 창세기 50장까지 이어지지만, 이 편은 여기서 막을 내립니다. "당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사…" (창 50:20)', ref: '창세기 37–47장' },
        ...(((S.flags.chars || {}).coat === 'care') ? [{ kick: '요셉의 마음', title: '조심하는 마음', t: '세겜 들판에서 낯선 이의 말을 귀담아듣고 몸을 조심하려 했던 요셉. 그 조심스러움이 먼 길 위에서 요셉을 지켜 주었는지도 몰라요.' }] : ((S.flags.chars || {}).coat === 'pride') ? [{ kick: '요셉의 마음', title: '사랑받은 마음', t: '아버지의 사랑을 자랑스럽게 입고 걸었던 요셉. 그 사랑이 훗날 가장 어두운 곳에서도 요셉을 붙들어 주었는지도 몰라요.' }] : []),
        ...(((S.flags.chars || {}).credit === 'god') ? [{ kick: '요셉의 마음', title: '돌린 영광', t: '바로 앞에서도 모든 것을 하나님께 돌렸던 요셉. 높아진 자리에서 낮은 마음을 지켰습니다.' }] : ((S.flags.chars || {}).credit === 'duty') ? [{ kick: '요셉의 마음', title: '맡은 책임', t: '맡겨진 일을 힘을 다해 해내겠다고 답했던 요셉. 그 성실함이 일곱 해의 풍년과 흉년을 지켜 냈습니다.' }] : []),
        ...(S.flags.char === 'trust' ? [{ kick: '요셉의 마음', title: '맡긴 마음', t: '옥에서 억울함을 말하는 대신 하나님께 맡긴다고 했던 요셉. 그 마음이 이 긴 이야기를 끝까지 지켜 주었는지도 모릅니다.' }] : S.flags.char === 'protest' ? [{ kick: '요셉의 마음', title: '억울했던 마음', t: '옥에서 억울하다고 토해 냈던 요셉. 그렇게 솔직했기에, 그 마음도 결국 하나님 앞에서 위로를 받았는지도 모릅니다.' }] : []),
        { kick: '자유 여행', title: '이제부터는 마음껏', t: '이제 애굽과 가나안 어디든 자유롭게 다녀도 좋아요. 총리의 집에서 아스낫과 므낫세·에브라임과 시간을 보내고, 고센 마을에서 아버지와 형제들을 만나 부탁을 들어주고, 사람들과 친해지고, 집을 짓고, 밭을 갈고, 가축을 기르고, 외딴 곳의 보물상자와 새로운 곳을 찾아보세요. 옷장에서 옷도 갈아입을 수 있어요.', ref: '' },
        { kick: 'IF 이야기', title: '성경 밖의 이야기', t: '지금부터 펼쳐지는 이야기는 성경에 기록되지 않은 「만약에(IF)」 이야기예요. 성경과 옛 애굽의 역사 자료를 바탕으로 상상해 꾸민 것이라, 실제와 다를 수 있어요.', ref: '' }]), 900); } } },
};
ORDER = Object.keys(steps);

// ------------------------------------------------------------------ NPCs
const BRO = ['reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun'];
const show = (a, b) => S => between(S, a, b);
const inEgyptHouse = S => between(S, 'c2_arrive', 'c2_flee');
const CELL = [[-41, -8], [-35.5, -8], [-30, -8.4], [-24.5, -8]];
LOOK.benjaminAdult = { skin: 0xe2ab7c, top: 0xe0c8a0, trim: 0x3e8a66, sash: 0x3e8a66, hair: 0x2a1810, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1810, belt: 0x6a4428, build: 0.9, eye: 0x5a3a20 };
LOOK.ameniOld = Object.assign({}, LOOK.ameni, { build: 0.4, bottom: 0x9a8a6a });
const npcs = [
  // ---- Hebron valley
  { id: 'jacob', name: '야곱', look: LOOK.jacob, x: 170.6, z: 150.8, face: 0.9, show: S => before(S, 'p_road') || S.q.heb, talkR: 3.2 },
  { id: 'benjamin', name: '베냐민', look: LOOK.benjamin, scale: 0.62, x: 179.5, z: 155.6, face: -2.2, show: S => before(S, 'p_road') || S.q.heb, chat: ['형, 별 이야기 해 줘!', '나도 크면 형처럼 채색옷 입을 거야!'] },
  { id: 'leah', name: '레아', look: LOOK.leah, x: 165.2, z: 158.2, face: 0.8, sit: true, show: S => before(S, 'p_road') || S.q.heb, chat: ['요셉아, 형들을 만나거든 어서 돌아오라고 전하렴.', '네 아버지가 너를 얼마나 아끼시는지…'] },
  { id: 'dinah', name: '디나', look: LOOK.dinah, x: 161.8, z: 151.6, face: 0.6, act: 'gather', show: S => before(S, 'p_road') || S.q.heb, chat: ['요셉 오라버니, 그 옷 정말 곱다!', '아버지가 오라버니만 찾으셔.'] },
  { id: 'hServ', name: '야곱의 종', look: LOOK.servantH, x: 188, z: 168, prop: 'staff', wander: 3, show: S => before(S, 'p_road'), chat: ['형님들은 세겜 쪽으로 양을 몰고 가신 지 꽤 되었지요.', '도련님, 길에서 들짐승 조심하십시오.'] },
  { id: 'shepBoy', name: '길가의 목동', look: KID({ top: 0xc8b890, hairStyle: 'short' }), scale: 0.72, x: 186, z: 104, prop: 'staff', wander: 3, show: S => before(S, 'p_night'), chat: ['세겜이요? 저 북쪽으로 쭉 가면 돼요.', '그 옷 진짜 예쁘다! 무지개 같아요!'] },
  // ---- Shechem: the man in the field (창 37:15)
  { id: 'man', name: '들의 사람', look: LOOK.man, x: SPOTS.manSpot[0], z: SPOTS.manSpot[1], face: -2.6, talkR: 3.4, show: S => S.step === 'p_man' },
  // ---- the ten brothers (Dothan; Hebron in the mourning scene; Egypt at the end)
  ...BRO.map((id, i) => { const a = i / BRO.length * Math.PI * 2; return { id, name: NM[id], look: LOOK[id], x: 158 + Math.cos(a) * 3.4, z: -150 + Math.sin(a) * 3.4, face: Math.atan2(-Math.cos(a), -Math.sin(a)), sit: i % 3 !== 0, noTalk: true,
    show: S => between(S, 'p_dothan', 'c1_pit') || !!S.q.broShow }; }),
  // ---- the caravan (창 37:25, 28)
  { id: 'ishmael', name: '이스마엘 상인', look: LOOK.ishmael, x: 236, z: -158, face: -1.6, prop: 'staff', noTalk: true, show: S => !!S.q.caravanOn },
  { id: 'midian', name: '미디안 상인', look: LOOK.midian, x: 238, z: -160, face: -1.6, noTalk: true, show: S => !!S.q.caravanOn },
  { id: 'ishBoy', name: '대상의 아이', look: LOOK.ishBoy, scale: 0.72, x: 240, z: -156, face: -1.6, noTalk: true, show: S => !!S.q.caravanOn },
  ...[1, 2, 3].map(i => ({ id: 'camel' + i, name: '낙타', animal: 'camel', extra: { saddle: [0xb3472e, 0x2c5aa0, 0xd9a73a][i - 1] }, x: 240 + i * 3, z: -158, face: -1.6, noTalk: true, noTag: true, show: S => !!S.q.caravanOn })),
  // ---- Egypt · the slave market
  { id: 'auctioneer', name: NM.auctioneer, look: LOOK.auctioneer, x: -12, z: 112.4, face: 0.2, dy: 0.9, noTalk: true, show: S => S.step === 'c1_market' },
  { id: 'mk1', name: '애굽 상인', look: LOOK.official, x: -6, z: 118, face: 3.0, show: S => between(S, 'c1_market'), chat: ['향품이 들어왔소! 길르앗의 유향이오!', '은을 달아 드리리다.'] },
  { id: 'mk2', name: '물 긷는 여인', look: LOOK.woman, x: -16, z: 120, face: 2.2, act: 'gather', show: S => between(S, 'c1_market'), chat: ['나일 물은 언제나 달아요.'] },
  { id: 'mk3', name: '구경꾼', look: LOOK.farmer, x: -2, z: 112, face: -2.4, show: S => S.step === 'c1_market', noTalk: true },
  // ---- Potiphar's household
  { id: 'potiphar', name: '보디발', look: LOOK.potiphar, x: -28, z: 39.4, face: 0, sit: true, talkR: 3.2, show: S => between(S, 'c1_market', 'c2_flee') && !S.q.empty, sched: S => S.step === 'c2_store' ? [[0, -12.6, 59.2, -1.6, 'wander:0.5']] : null },
  { id: 'wife', name: '보디발의 아내', look: LOOK.wife, x: -20.6, z: 61.6, face: Math.PI, talkR: 3, show: S => between(S, 'c2_arrive', 'c2_flee') && S.step !== 'c2_tempt2', sched: S => S.step === 'c2_tempt3' ? [[0, -25, 39.2, 0.6, 'wander:0.2']] : null },
  { id: 'ameni', name: NM.ameni, look: LOOK.ameni, x: -44, z: 55.4, face: 1.6, show: inEgyptHouse, chat: ['네 하나님 이야기를 또 들려다오.', '애굽 말이 많이 늘었구나.', '엠 헤테프, 요셉. 평안히.'] },
  { id: 'neb', name: NM.neb, look: LOOK.neb, x: -25.4, z: 66.6, face: Math.PI, show: inEgyptHouse, chat: S => S.q.nebOk ? ['대문은 내가 지키겠소, 총무.', '손님이 오시면 바로 알리리다.'] : ['…일이나 하라, 히브리 종.'] },
  { id: 'cook', name: NM.cook, look: LOOK.cook, x: -10.8, z: 43.8, face: Math.PI, act: 'gather', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['타! 갓 구운 타가 최고지!', '오늘은 손님상에 낼 거위를 굽는다네.'] },
  { id: 'gardener', name: NM.gardener, look: LOOK.gardener, x: -15.4, z: 60.6, face: -1.6, act: 'water', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['연꽃이 올해는 유난히 많이 피었어.', '종려나무는 발은 물에, 머리는 불에 두어야 열매를 맺지.'] },
  { id: 'cowboy', name: NM.boy, look: LOOK.cowboy, scale: 0.68, x: 8, z: 74, face: 0, wander: 3, show: S => inEgyptHouse(S) && !S.q.empty, chat: S => S.q.calf ? ['형! 송아지가 형만 졸졸 따라다녀요!', '카! 카! (소야! 소야!)'] : ['송아지 한 마리가 수로 진흙에 빠졌어요! 도와주세요!'] },
  { id: 'weaver', name: NM.weaver, look: LOOK.weaver, x: -44.2, z: 62.4, face: -1.6, act: 'gather', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['아마 세 단이면 세마포 한 필이에요.', '마님은 세마포를 아주 곱게만 입으시죠.'] },
  { id: 'scribe', name: NM.scribe, look: LOOK.scribe, x: -23.6, z: 41.2, face: 0, sit: true, talkR: 3, show: S => inEgyptHouse(S) && !S.q.empty, sched: S => S.step === 'c2_store' ? [[0, -14, 63.2, -1.6, 'wander:0.4']] : null, chat: ['숫자는 거짓말을 하지 않지. 사람이 할 뿐.', '자네 덕분에 눈이 덜 아프구먼.'] },
  { id: 'maid', name: '여종', look: LOOK.maid, x: -30, z: 47, face: 0, show: S => between(S, 'c2_tempt2', 'c2_tempt3') && !S.q.empty, chat: ['마님 심기가 요즘 편치 않으세요.'] },
  { id: 'guest1', name: NM.guest1, look: LOOK.official, x: -34.4, z: 42.2, face: 0.5, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest2', name: NM.guest2, look: LOOK.priest, x: -31.2, z: 43.4, face: 0.1, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest3', name: NM.guest3, look: LOOK.soldierEg, x: -23.8, z: 43.2, face: -0.4, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'calf', name: '진흙에 빠진 송아지', animal: 'cow', scale: 0.55, x: SPOTS.canal[0], z: SPOTS.canal[1] + 0.6, face: 0.3, noTalk: true, noTag: true, dy: -0.35, show: S => S.step === 'c2_field' && !S.q.calf },
  // ---- the king's prison
  { id: 'keeper', name: NM.keeper, look: LOOK.keeper, x: -22.6, z: 6.4, face: Math.PI, show: show('c3_cell', 'c4_shave'), chat: S => S.q.cupDone ? ['요셉, 너 없이는 이 옥이 돌아가지 않는다.', '바로의 관원장들이 다 네 말대로 되었다지…'] : ['일해라. 일하지 않으면 먹지도 못한다.'] },
  { id: 'prisA', name: NM.prisA, look: LOOK.prisoner, x: CELL[0][0], z: CELL[0][1], face: 0, talkR: 4.2, show: show('c3_cell', 'c4_shave'), chat: ['요셉, 오늘 떡은 좀 더 크더라.', '너는 왜 그렇게 평안해 보이지?'] },
  { id: 'prisB', name: NM.prisB, look: Object.assign({}, LOOK.prisoner, { skin: 0xa86a40, hairStyle: 'short', beard: 'long' }), x: CELL[1][0], z: CELL[1][1], face: 0, talkR: 4.2, show: show('c3_cell', 'c4_shave'), chat: ['밖은 지금 나일 강이 불어났겠지…', '네 하나님은 이 옥에도 계시냐?'] },
  { id: 'oldP', name: NM.oldP, look: LOOK.oldPrisoner, x: CELL[2][0], z: CELL[2][1], face: 0, talkR: 4.2, show: S => between(S, 'c3_cell', 'c4_shave') && !S.q.oldGone, chat: ['…고맙다, 히브리 청년.', '네 하나님 이야기를 해 다오.'] },
  { id: 'youngP', name: NM.youngP, look: LOOK.youngPrisoner, scale: 0.7, x: CELL[3][0], z: CELL[3][1], face: 0, talkR: 4.2, show: S => between(S, 'c3_wait', 'c4_shave') && !!S.q.youngIn, chat: ['형, 오늘도 기도해요?', '엄마 꿈을 꿨어요.'] },
  { id: 'cupbearer', name: NM.cupbearer, look: LOOK.cupbearer, x: CELL[3][0] - 1.1, z: CELL[3][1] - 0.2, face: 0, talkR: 4.2, show: show('c3_officers', 'c3_dreams') },
  { id: 'baker', name: NM.baker, look: LOOK.baker, x: CELL[3][0] + 1.1, z: CELL[3][1] - 0.4, face: 0, talkR: 4.2, show: show('c3_officers', 'c3_dreams') },
  { id: 'messenger', name: NM.messenger, look: LOOK.messenger, x: -29, z: 11, face: Math.PI, show: S => S.step === 'c4_shave' },
  { id: 'pg1', name: '옥 문지기', look: LOOK.soldierEg, x: -32.6, z: 16, face: 0, prop: 'spear', noTalk: true, show: show('c3_cell', 'c4_shave') }, { id: 'pg2', name: '옥 문지기', look: LOOK.soldierEg, x: -27.4, z: 16, face: 0, prop: 'spear', noTalk: true, show: show('c3_cell', 'c4_shave') },
  // ---- Pharaoh's court
  { id: 'pharaoh', name: '바로', look: LOOK.pharaoh, x: -30, z: -177.2, face: 0, dy: 1.1 + padH(-30, -176) - padH(-30, -177.2), sit: true, fixedFace: true, talkR: 7.5, show: S => between(S, 'c4_court') || !!S.q.pharShow },
  { id: 'magician', name: NM.magician, look: LOOK.magician, x: -36.5, z: -171, face: 0.7, show: S => between(S, 'c4_court', 'c4_answer') || !!S.q.pharShow, chat: ['…나일의 신께서도 침묵하시는데, 히브리 노예가 무엇을 안다고.'] },
  { id: 'sage', name: NM.sage, look: Object.assign({}, LOOK.magician, { skin: 0xa86a40, sash: GOLD }), x: -23.5, z: -171, face: -0.7, show: S => between(S, 'c4_court', 'c4_answer') || !!S.q.pharShow, chat: ['일곱이라… 하늘의 수로다.'] },
  { id: 'cupbearerC', name: NM.cupbearer, look: LOOK.cupbearer, x: -26, z: -169, face: -0.4, show: S => between(S, 'c4_court') || !!S.q.pharShow, chat: ['요셉… 아니, 총리님. 이 년이나 잊고 있었던 나를 용서하시오.', '바로의 잔을 들 때마다 그날 옥에서의 일을 생각하오.'] },
  ...[[-35, -144], [-25, -144], [-38, -158], [-22, -158]].map(([x, z], i) => ({ id: 'royalG' + i, name: '궁의 호위병', look: LOOK.soldierEg, x, z, face: i < 2 ? 0 : (i === 2 ? 1.57 : -1.57), prop: 'spear', noTalk: true, show: S => between(S, 'c4_court') || !!S.q.pharShow })),
  // ---- the vizier's household (ch5–6)
  { id: 'asenath', name: '아스낫', look: LOOK.asenath, x: 7.6, z: -137.4, face: 0.4, show: S => between(S, 'c5_patrol') && !S.q.finale, chat: S => [S.q.born2 ? '므낫세가 에브라임에게 걸음마를 가르쳐요. 둘 다 넘어지지만요, 후후.' : S.q.born1 ? '므낫세가 오늘 당신을 보고 웃었어요.' : '여보, 오늘도 먼 길 다녀오셨군요.', '아버지께서 온의 신전에서 당신의 지혜를 칭찬하셨어요.'] },
  { id: 'manasseh', name: '므낫세', look: LOOK.manasseh, scale: 0.5, x: 10, z: -136, face: 0, wander: 2, show: S => !!S.q.born1 && !S.q.finale, chat: ['아빠!', '아빠, 수레 태워 주세요!'] },
  { id: 'ephraim', name: '에브라임', look: LOOK.ephraim, scale: 0.42, x: 11.5, z: -136.6, face: 0, wander: 1.5, show: S => !!S.q.born2 && !S.q.finale, chat: ['(방긋 웃는다)', '아빠!'] },
  { id: 'steward2', name: NM.steward2, look: Object.assign({}, LOOK.neb, { collar: GOLD }), x: 15, z: -138.6, face: -0.6, show: S => between(S, 'c5_patrol'), chat: ['총리님, 집안일은 염려 마십시오.', '은잔은 늘 깨끗이 닦아 두었습니다.'] },
  { id: 'overseerC', name: NM.overseerC, look: LOOK.official, x: 12, z: -70, face: 1.2, show: show('c5_patrol'), chat: ['곳간 기록은 서기관이 맡고 있습니다.'] },
  { id: 'overseerW', name: NM.overseerW, look: LOOK.elder, x: -136, z: -35, face: 2.8, show: show('c5_patrol'), chat: ['손녀가 총리님 이야기를 하면 눈이 반짝인답니다.'] },
  { id: 'overseerS', name: NM.overseerS, look: Object.assign({}, LOOK.farmer, { collar: TURQ, top: LINEN, bare: false, sleeveless: true }), x: -141, z: 123, face: 0.3, show: show('c5_patrol'), chat: ['언덕 위 곳간은 물 한 방울 들지 않습니다!'] },
  { id: 'brick', name: NM.brick, look: Object.assign({}, LOOK.farmer, { bottom: 0xb07848, skin: 0x9a6038 }), x: -44, z: -116, face: 0.8, act: 'gather', show: show('c5_patrol'), chat: ['진흙 둘에 짚 하나. 그게 좋은 벽돌의 비결이지요.'] },
  { id: 'scribeR', name: '왕궁 서기관', look: LOOK.scribe, x: 12, z: -58.6, face: 2.6, sit: true, show: show('c5_year1'), chat: ['곳간 기록은 오늘도 늘었습니다.'] },
  // ---- the famine: buyers at the city granary (창 41:56–57)
  { id: 'byFarmer', name: NM.farmer, look: LOOK.farmerThin, x: 10.5, z: -56, face: 2.4, show: show('c6_sell') },
  { id: 'byWoman', name: NM.woman, look: LOOK.woman, x: 13.2, z: -55, face: 2.9, show: show('c6_sell') },
  { id: 'byElder', name: NM.elder, look: LOOK.elder, x: 16.4, z: -55.2, face: -2.9, show: show('c6_sell') },
  { id: 'bySidon', name: NM.sidon, look: LOOK.sidon, x: 19.2, z: -56.2, face: -2.5, show: show('c6_sell') },
  { id: 'byEdom', name: NM.edom, look: LOOK.edom, x: 8.4, z: -54.2, face: 2.2, show: show('c6_sell') },
  { id: 'byAmeni', name: NM.ameni, look: LOOK.ameniOld, x: 21, z: -58.6, face: -2.2, show: show('c6_sell') },
  { id: 'benjamin2', name: '베냐민', look: LOOK.benjaminAdult, x: 172, z: 150, face: 0, noTalk: true, show: S => !!S.q.heb2 },
];
for (const n of npcs) if (n.id === 'jacob') n.show = S => before(S, 'p_road') || !!S.q.heb || !!S.q.heb2;
const BUYERS = [{ id: 'byFarmer' }, { id: 'byWoman' }, { id: 'byElder' }, { id: 'bySidon' }, { id: 'byEdom' }, { id: 'byAmeni', last: true }];

// ------------------------------------------------------------------ villages (people going about their days)
const EGV = { farmerA: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }), farmerB: EGM({ hairStyle: 'short', skin: 0xa86a40, bottom: 0xe0d4b8, beard: 'short' }), waterA: LOOK.woman, waterB: EGF({ skin: 0xc89060, top: 0xe8dcc0, collar: 0xb3472e, collar2: 0, hairStyle: 'long' }),
  potter: EGM({ hairStyle: 'bald', skin: 0x9a6038, bottom: 0xb89a78, build: 1.1 }), weaver: LOOK.weaver, merchant: LOOK.official, elder: LOOK.elder, kidA: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  kidB: KID({ skin: 0xc08458, top: LINEN, long: true, fem: true, hairStyle: 'long' }), shep: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038, prop: 'staff' }), oldW: EGF({ skin: 0xb88050, top: 0xd8ccb0, age: 'old', hair: 0xc8c0b8, hairStyle: 'bun', collar: 0x8a6a48, collar2: 0 }) };
const FK = (id, name, role, look, home, o) => Object.assign({ id, name, role, look: EGV[look] || look, home }, o || {});
const egy = S => between(S, 'c1_market');
const villages = [
  { id: 'city', n: '왕의 도성', x: -22, z: -74, r: 26, when: egy,
    spots: { hub: [-22, -74, 3], well: [-22, -82, 2.5], market: [-22, -71, 3], fire: [-30, -80, 2], play: [-14, -80, 3.5], gate: [-24, -50, 2], work: [-40, -66, 3], shade: [-48, -110, 3] },
    homes: [[-40, -60, 0], [-12, -58, 0], [-42, -72, 0], [-6, -74, 0], [-30, -88, 0], [-12, -88, 0]], about: ['바로의 도성은 나일 강 동쪽에 있다오.', '궁 앞 오벨리스크는 해가 뜨면 금빛으로 빛나지요.'],
    folk: [FK('ct_mer', '도성 상인 세네브', 'merchant', 'merchant', 2, { work: [-26, -73, 0, 1], persona: '도성 장터의 상인. 흥정을 좋아하고 소식에 밝다.' }), FK('ct_wat', '물 긷는 여인 네페르', 'water', 'waterA', 1, { persona: '나일 강에서 물을 긷는 상냥한 여인.' }),
      FK('ct_pot', '토기장이 아메니', 'potter', 'potter', 3, { work: [-40, -66, 0, 1], persona: '물동이와 곡식 항아리를 빚는 토기장이.' }), FK('ct_kid', '아이 케티', 'child', 'kidA', 1, { age: 'kid', persona: '네페르의 아들. 수레 구경을 좋아한다.' }),
      FK('ct_eld', '노인 이푸', 'elder', 'elder', 4, { age: 'old', persona: '도성 성문에 앉아 옛이야기를 하는 노인.' }), FK('ct_wea', '베 짜는 여인 메리트', 'weaver', 'waterB', 5, { work: [-10, -86, 0, 0.6], persona: '세마포를 짜는 솜씨 좋은 여인.' })] },
  { id: 'west', n: '서쪽 마을', x: -140, z: -40, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-140, -40, 2.5], well: [-140, -40, 3.2], market: [-136, -46, 2], fire: [-146, -44, 2], play: [-134, -36, 3], fold: [-122, -36, 2], pasture: [-118, -30, 8], field: [-118, -50, 4], work: [-118, -50, 3] },
    homes: [[-129, -36, 0], [-131, -52, 0], [-144, -55, 0], [-154, -42, 0], [-148, -27, 0], [-136, -24, 0]], about: ['서쪽 마을 사람들은 대대로 나일 강가 밭을 일구었다오.', '강을 건너려면 북쪽 나루로 가시오.'],
    folk: [FK('w_far', '농부 네헤시', 'farmer', 'farmerA', 0, { work: [-118, -50, 0, 4], persona: '서쪽 마을 농부. 말수가 적고 성실하다.' }), FK('w_wat', '여인 타-네트', 'water', 'waterB', 1, { persona: '서쪽 마을 여인. 웃음이 많다.' }), FK('w_kid', '아이 이피', 'child', 'kidB', 1, { age: 'kid', persona: '타-네트의 딸.' }), FK('w_shep', '목자 바크', 'shepherd', 'shep', 2, { persona: '마을 양을 치는 젊은이.' })] },
  { id: 'south', n: '남쪽 마을', x: -145, z: 128, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-145, 128, 2.5], well: [-145, 128, 3.2], market: [-140, 122, 2], fire: [-150, 124, 2], play: [-139, 133, 3], field: [-123, 118, 4], work: [-123, 118, 3] },
    homes: [[-134, 132, 0], [-136, 116, 0], [-149, 113, 0], [-159, 126, 0], [-153, 141, 0], [-141, 144, 0]], about: ['남쪽 마을은 강물이 넘치는 철이면 섬처럼 된다오.', '마을 서쪽 언덕은 물이 닿지 않는 높은 땅이오.'],
    folk: [FK('s_far', '농부 세티', 'farmer', 'farmerB', 0, { work: [-123, 118, 0, 4], persona: '남쪽 마을 농부. 쾌활하다.' }), FK('s_old', '할머니 우세트', 'oldwoman', 'oldW', 2, { age: 'old', persona: '옛이야기를 잘하는 할머니.' }), FK('s_kid', '아이 파세르', 'child', 'kidA', 3, { age: 'kid', persona: '세티의 아들.' }), FK('s_pot', '토기장이 후이', 'potter', 'potter', 4, { work: [-150, 120, 0, 1], persona: '항아리를 빚는 토기장이.' })] },
];
const strangers = { max: 0, when: () => false, looks: { default: LOOK.farmer } };

// ------------------------------------------------------------------ SITES (granaries, ch5)
const GRAN = (g, M, r) => G.env.granary(g, M, r, true);
const sites = [
  { id: 'granA', n: '성읍 곳간', x: 16, z: -64, cost: { brick: 20, wood: 6 }, model: GRAN, d: '각 성 주위 밭의 곡물을 그 성 중에 쌓아 두었더라 (창 41:48)', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granB', n: '서쪽 마을 곳간', x: -152, z: -20, cost: { brick: 20, wood: 6 }, model: GRAN, d: '서쪽 마을의 오분의 일을 쌓을 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granC', n: '남쪽 마을 곳간', x: -160, z: 150, cost: { brick: 20, wood: 6 }, model: GRAN, d: '물이 닿지 않는 언덕 위 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
];

// ------------------------------------------------------------------ SPECIALS (things to use)
const SP = (id, x, z, label, on, use, o) => Object.assign({ id, x, z, r: 2.3, label, on, use }, o || {});
const cellIds = ['prisA', 'prisB', 'oldP', 'cell4'];
const specials = [
  SP('skin', 182.2, 155.2, '물가죽 부대 챙기기', S => S.step === 'p_provision' && !S.q.skin, (S, G) => { G.give('skin', 1); pick(); G.UI.hint('잘했어요! 이번엔 모닥불 곁의 빵을 챙겨요', 'items2', 'bag'); tick(S, 'skin'); }),
  SP('bread', 172.5, 157, '빵과 무화과 챙기기', S => S.step === 'p_provision' && !S.q.bread, (S, G) => { G.give('bread', 2); G.give('fig', 2); pick(); G.UI.hint(null); tick(S, 'bread'); }),
  SP('restBed', SPOTS.restBed[0], SPOTS.restBed[1], '누워서 별 보기', S => S.step === 'p_night', (S, G) => cinNight(S, G), { r: 2.8 }),
  ...['clue1', 'clue2', 'clue3'].map((k, i) => SP(k, SPOTS[k][0], SPOTS[k][1], ['식은 모닥불 자리 살피기', '양 떼 발자국 살피기', '돌무더기 표시 살피기'][i], S => S.step === 'p_shechem' && !(S.q.cl || {})[k], (S, G) => clue(S, G, k, i), { r: 2.6 })),
  SP('pitShout', PIT.x, PIT.z, '형들을 부르기', S => S.step === 'c1_pit' && !S.q.shout, (S, G) => pitShout(S, G), { r: 2.6, y: 1.2 }),
  SP('pitPray', PIT.x + 0.6, PIT.z - 0.6, '무릎 꿇고 하나님께 부르짖기', S => S.step === 'c1_pit' && S.q.shout && !S.q.pitPray, (S, G) => pitPray(S, G), { r: 2.6, y: 1.0 }),
  SP('kJars', -8.6, 47.4, S => S.water >= 4 ? '부엌 항아리에 물 붓기' : '물이 부족해요 (우물에서 길어 와요)', S => S.step === 'c2_work' && !S.q.w1, (S, G) => { if (S.water < 4) { G.UI.toast('우물에서 물을 길어 오세요 (4번 부을 물)'); return; } S.water -= 4; act('water', 0.8, 'jar'); G.sfx('pour'); G.UI.hud();
    say([EG('cook', '무! 무 네페르!', '물! 좋은 물이다!', 'happy'), N('ameni', '「무」는 물이란다. 이제 하나 배웠구나.', '', 'tender')], () => { learn('mu'); tick(S, 'w1'); }); }),
  SP('quern', SPOTS.quern[0], SPOTS.quern[1], '맷돌로 보리 갈기', S => S.step === 'c2_work' && !S.q.w2, (S, G) => { G.P.face = 0.3;
    G.UI.minigame('wrestle', { title: '맷돌 돌리기', need: 6, dur: 30 }, () => { G.sfx('grind'); say([EG('cook', '타! 타 네페르!', '빵! 좋은 빵이 되겠군!', 'happy'), N('ameni', '「타」는 빵이다. 이 고운 가루로 내일 아침 빵을 굽겠지.')], () => { learn('ta'); tick(S, 'w2'); }); }); }, { r: 2.2 }),
  SP('feedOx', 9, 70, '외양간 소들에게 꼴 주기', S => S.step === 'c2_work' && !S.q.w3, (S, G) => { act('gather', 0.9); G.sfx('moo'); say([N('boy', '카! 카! 형, 「카」는 황소예요. 우리 소들은 꼴을 주면 이렇게 고개를 끄덕여요!', '', 'happy')], () => { learn('ka'); tick(S, 'w3'); }); }, { r: 3 }),
  SP('calf', SPOTS.canal[0], SPOTS.canal[1] - 0.6, '진흙에서 송아지 끌어내기', S => S.step === 'c2_field' && !S.q.calf, (S, G) => { G.P.face = 0;
    G.UI.minigame('push', { title: '진흙에 빠진 송아지', hint: 'A를 누르고 있으면 끌어당겨요. 기운이 빠지면 잠깐 놓았다가 다시!', rate: 18 }, () => { G.sfx('moo', { pitch: 1.4 }); G.FX.burst(SPOTS.canal[0], G.W().heightAt(SPOTS.canal[0], SPOTS.canal[1]) + 0.4, SPOTS.canal[1], 22, { c: [0.35, 0.28, 0.2], sp: 2, up: 2 });
      say([N('boy', '살았다! 고마워요, 히브리 형! 이 송아지는 제가 제일 아끼는 애예요!', '', 'happy')], () => tick(S, 'calf')); }); }, { r: 2.6 }),
  ...[['wine', '포도주 항아리', 14, 3.4 - 0.6, -2.6], ['oil', '기름병', 9, 3.4 - 0.6, 2.6], ['grain', '곡식 자루', 22, 0.6, -3.3 + 0.6], ['figs', '무화과 바구니', 6, 0.6, 3.3 - 0.6]].map(([k, n, c, dx, dz]) =>
    SP('sh_' + k, SPOTS.store[0] - 0.5 + dx, SPOTS.store[1] + 0.5 + dz, n + ' 세기', S => S.step === 'c2_store' && !(S.q.shelf || {})[k], (S, G) => { act('pick', 1.0); (S.q.shelf = S.q.shelf || {})[k] = c; G.UI.quest();
      say([J(`${n}… 하나, 둘, 셋… 모두 ${KNUM[c]}.`, '', 'calm')]); }, { r: 1.7, y: 1.2 })),
  SP('assign', -28, 44.2, '일꾼들의 일 정하기', S => S.step === 'c2_manage' && !S.q.assign, (S, G) => assignPuzzle(S, G), { r: 2.4 }),
  SP('serveT', -38.4, 44.6, S => S.q.carry ? `들고 있는 것 · ${S.q.carry}` : '시중 상에서 음식 들기', S => S.step === 'c2_banquet', (S, G) => serveTable(S, G), { r: 2 }),
  SP('ledgerT', -22.5, 41.6, '장부 정리하기', S => S.step === 'c2_tempt3' && S.q.empty, (S, G) => cinGrab(S, G), { r: 2.2 }),
  SP('prayWin', -18.4, -8.2, '달빛 아래 무릎 꿇고 기도하기', S => S.step === 'c3_cell' || (S.step === 'c3_wait' && S.q.wReady), (S, G) => windowPray(S, G), { r: 1.8, y: 1.0 }),
  ...CELL.map(([x, z], i) => SP('cw' + i, x, -4.9, S => S.step === 'c3_keeper' ? (S.water > 0 ? '창살 너머로 물 건네기' : '물이 없어요 (대야에서 길어 와요)') : '창살 너머로 떡 건네기',
    S => (S.step === 'c3_keeper' && !(S.q.gave || {})[i]) || (S.step === 'c3_charge' && Gm().P.carry === 'basket' && !(S.q.fed || {})[i]), (S, G) => cellGive(S, G, i), { r: 1.9, y: 1.2 })),
  SP('breadT', -32, 6.2, '떡 바구니 머리에 이기', S => S.step === 'c3_charge' && Gm().P.carry !== 'basket' && Object.keys(S.q.fed || {}).length < 4, (S, G) => { G.P.carry = 'basket'; G.P.carryArms = false; G.sfx('gather'); G.UI.toast('떡 바구니를 머리에 이었다 · 감방마다 나눠 주세요'); G.UI.quest(); }, { r: 2.2 }),
  SP('scratch', -20.4, -6.4, '벽에 지난 날들을 새기기', S => S.step === 'c3_wait' && (S.q.wait || 0) === 2 && !S.q.wReady, (S, G) => scratchWall(S, G), { r: 1.6, y: 1.3 }),
  SP('shave', SPOTS.basin[0], SPOTS.basin[1], '물로 씻고 수염 깎기', S => S.step === 'c4_shave', (S, G) => shaveScene(S, G), { r: 2.4 }),
  SP('rodeChk', 0, 0, '', S => false, () => { }),
  ...['A', 'B', 'C'].map(k => { const g = sites.find(s => s.id === 'gran' + k); return SP('open' + k, g.x, g.z + 4, '곳간 문 열기', S => S.step === 'c6_open' && !(S.q.opened || {})[k], (S, G) => openGranary(S, G, k), { r: 3.2 }); }),
];
// v15 살펴보기: little things worth a closer look. Each one tells a true story of the place (often a verse), fills the eye (정신력)
// a little, and counts toward 「알아낸 것」.
const LORE = [
  ['senet', -19.2, 41.6, '세넷 놀이판', '서른 칸짜리 판 위에서 말을 움직이는 애굽의 놀이 「세넷」이에요. 납작한 막대 네 개를 던져 나온 수만큼 나아가요. 귀족도 종들도 모두 즐겼대요.', ''],
  ['scribe', -36.6, 44.6, '서기관의 책상', '갈대 펜, 검은 잉크와 붉은 잉크, 파피루스 두루마리. 이 집의 곡식과 가축이 여기 하나하나 적혔어요. 훗날 이 모든 것을 요셉이 맡게 되지요.', '창세기 39:4'],
  ['linen', -30.8, 38.6, '고운 세마포', '애굽은 아마로 짠 고운 세마포로 이름난 땅이었어요. 훗날 바로는 요셉에게 세마포 옷을 입히고 금 사슬을 목에 걸어 주었어요.', '창세기 41:42'],
  ['rack', -8.9, 44.4, '말린 생선과 양파', '나일 강의 생선, 양파와 마늘… 훗날 광야의 이스라엘 백성은 애굽에서 먹던 이 맛을 그리워했어요.', '민수기 11:5'],
  ['bread', -11.5, 43.4, '화덕 빵', '애굽 사람들은 보리와 밀로 날마다 빵을 구웠어요. 둥근 빵, 길쭉한 빵, 대추야자를 넣은 달콤한 빵까지 있었대요.', ''],
  ['amph', -12.5, 65.4, '포도주와 기름 항아리', '곳간의 큰 항아리마다 무엇이 들었는지 꼬리표가 붙어 있었어요. 요셉이 이 집을 맡은 뒤로 여호와의 복이 집과 밭에 넘쳤어요.', '창세기 39:5'],
  ['lotus', -18, 61.6, '연꽃 연못', '푸른 연꽃은 아침에 피고 저녁에 오므라들어요. 애굽 사람들이 무척 아끼던 꽃이라 벽화와 그릇마다 그려 넣었어요.', ''],
  ['dove', -45.6, 39.6, '비둘기장', '애굽에서는 집집마다 비둘기를 길렀어요. 알과 고기를 얻고, 거름은 밭에 뿌렸대요.', ''],
  ['shaduf', 16, 53.6, '샤두프', '긴 장대 한쪽엔 두레박, 반대쪽엔 무거운 흙덩이. 지렛대 원리로 나일 강물을 퍼 올려 밭에 대는 도구예요.', ''],
  ['jug', -16.4, -8.0, '물 한 대접', '옥에서는 물 한 대접도 귀했어요. 그래도 여호와께서 요셉과 함께 계셔서, 간수장의 마음을 얻게 하셨어요.', '창세기 39:21'],
  ['throne', -30, -171.2, '바로의 보좌', '금과 청금석으로 꾸민 보좌. 바로는 요셉에게 「내가 너보다 높은 것은 그 보좌뿐이니라」 하고 말했어요.', '창세기 41:40'],
  ['onAltar', 12, -102.2, '온의 제단', '온(헬리오폴리스)은 해를 섬기던 성읍이에요. 요셉의 아내 아스낫은 이 온의 제사장 보디베라의 딸이었어요.', '창세기 41:45'],
  ['obelisk', 6.6, -95, '오벨리스크', '돌 하나를 통째로 깎아 세운 뾰족한 기둥이에요. 꼭대기를 금으로 씌워 햇빛에 번쩍였대요.', ''],
  ['pyramid', -188, -175, '피라미드', '요셉이 애굽에 왔을 때, 이 피라미드는 이미 수백 년 된 옛 왕들의 무덤이었어요.', ''],
  ['tent', 172.6, 150.4, '염소털 장막', '야곱의 장막은 검은 염소털로 짰어요. 비가 오면 털실이 부풀어 물이 새지 않고, 해가 나면 바람이 잘 통했대요.', ''],
];
const loreBusy = (S, me) => specials.some(o => o !== me && !o.lore && o.id !== 'rodeChk' && Math.hypot(o.x - Gm().P.x, o.z - Gm().P.z) < (o.r || 2.4) && o.on && o.on(S, Gm()));
for (const [id, x, z, n, t, ref] of LORE) { const sp = SP('lore_' + id, x, z, `살펴보기 · ${n}`, S => !loreBusy(S, sp), (S, G) => {
    const L = S.flags.lore = S.flags.lore || {}, first = !L[id]; L[id] = 1; GG.Audio && GG.Audio.sfx('page', { vol: 0.6 });
    say([{ n: n, t, ref }], () => { const got = Object.keys(L).length; if (first) { GG.Vitals && GG.Vitals.mindGain && GG.Vitals.mindGain(12); GG.UI.toast(`알아낸 것 ${got} / ${LORE.length} · 정신력 +12`); if (!S.flags.tipLore) { S.flags.tipLore = 1; setTimeout(() => GG.UI.toast('곳곳의 물건을 살펴보면 이야기를 알게 되고, 눈(정신력)이 조금 차요'), 2600); } } }); },
    { r: 1.5, y: 1.1, lore: true }); specials.push(sp); }

const KNUM = { 6: '여섯', 9: '아홉', 14: '열넷', 22: '스물둘' };
function pick() { const P = Gm().P; P.act = 'pick'; P.actT = 0; P.actDur = 0.8; P.actHits = 1; P.fired = true; Gm().sfx('pickup'); }
function act(k, dur, prop) { const P = Gm().P; P.act = k; P.actT = 0; P.actDur = dur || 0.8; P.actHits = 1; P.fired = true; P.actProp = prop || null; }

// ------------------------------------------------------------------ SHOPS & STATIONS
const shops = {
  market: { n: '도성 장터', buy: [{ n: '빵 ×3', item: 'bread', qty: 3, price: 12 }, { n: '무화과 ×4', item: 'fig', qty: 4, price: 8 }, { n: '밀 씨앗 ×10', item: 's_wheat', qty: 10, price: 14 }, { n: '양파 씨앗 ×6', item: 's_onion', qty: 6, price: 10 }], mul: { good: 1.1 } },
};
const stations = [
  // v16.9 each well's action sits on the well itself (it used to be a couple of metres in front of it)
  { id: 'wHeb', type: 'well', x: 160, z: 150, r: 3.2 }, { id: 'fHeb', type: 'fire', x: 176, z: 153, r: 3 }, { id: 'bHeb', type: 'bed', x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1], r: 2, on: S => before(S, 'p_road') },
  { id: 'fOak', type: 'fire', x: SPOTS.restOak[0], z: SPOTS.restOak[1], r: 3 }, { id: 'fDot', type: 'fire', x: 158, z: -150, r: 3 }, { id: 'fCar', type: 'fire', x: SPOTS.caravanNight[0], z: SPOTS.caravanNight[1], r: 3 },
  { id: 'wPot', type: 'well', x: SPOTS.well[0], z: SPOTS.well[1], r: 3.2, on: inEgyptHouse }, { id: 'bPot', type: 'bed', x: -46.8, z: 50, on: inEgyptHouse },
  { id: 'wPri', type: 'well', x: SPOTS.basin[0], z: SPOTS.basin[1], r: 2.8, rim: 1.3, on: show('c3_keeper', 'c4_shave') }, { id: 'bPri', type: 'bed', x: -19.4, z: -8.6, on: show('c3_keeper', 'c3_wait') },
  { id: 'bJos', type: 'bed', x: 10, z: -141.2, on: show('c5_patrol') }, { id: 'wCity', type: 'well', x: -22, z: -82, r: 3.2 }, { id: 'wW', type: 'well', x: -140, z: -40, r: 3.2 }, { id: 'wS', type: 'well', x: -145, z: 128, r: 3.2 },
  { id: 'shopM', type: 'shop', shop: 'market', label: '도성 장터에서 사고팔기', x: -22, z: -66.4, r: 2.6, on: show('c5_patrol') },
];
const fields = [
  { id: 'pflax', x: 6, z: 44, cols: 8, rows: 4, ts: 1.6 },
  { id: 'royal', x: -72, z: -150, cols: 8, rows: 5, ts: 1.6, lock: true },
];
const pens = [
  { id: 'hebFlock', n: '야곱의 양 떼', x: 192, z: 171, w: 12, d: 9, owner: 'jacob', cap: 40, init: [...Array(10)].map((_, i) => [i % 3 ? 'sheep' : 'goat', i === 4 ? 'speckled' : i === 7 ? 'spotted' : 'plain', i % 4 ? 0 : 1, 12]), trough0: 12, hidden: S => !before(S, 'p_road') },
  { id: 'dotFlock', n: '형들의 양 떼', x: 148, z: -175, w: 14, d: 10, owner: 'bro', cap: 40, init: [...Array(14)].map((_, i) => [i % 4 ? 'sheep' : 'goat', i % 5 === 0 ? 'speckled' : i % 7 === 0 ? 'spotted' : 'plain', i % 5 ? 0 : 1, 12]), trough0: 12, hidden: S => !between(S, 'p_dothan', 'c1_pit') },
  { id: 'pcattle', n: '보디발의 외양간', x: 9, z: 76, w: 10, d: 11, owner: 'potiphar', cap: 30, init: [['cow', 'plain', 0, 20], ['cow', 'plain', 0, 20], ['cow', 'plain', 1, 20], ['cow', 'plain', 0, 3], ['goat', 'plain', 0, 12], ['goat', 'brown', 0, 12]], trough0: 12, hidden: S => before(S, 'c1_market') },
];

// ------------------------------------------------------------------ POSES for this episode (player & NPCs)
const MP = GG.Motion.POSES, B = GG.HBI;
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bset = (rig, b, x, y, z) => rig.set(b, x, y || 0, z || 0);
function addPose(name, up, fn, holdIK) { MP[name] = fn; fn.up = !!up; if (holdIK && GG.Motion.HOLD_IK_OFF) GG.Motion.HOLD_IK_OFF.add(name); }
addPose('bound', true, (rig, p, t) => { // wrists tied in front, head low (the rope / the fetters)
  bset(rig, B.uArmL, -0.45, 0, -0.36); bset(rig, B.uArmR, -0.45, 0, 0.36); bset(rig, B.fArmL, -1.0, 0.35); bset(rig, B.fArmR, -1.0, -0.35);
  bset(rig, B.chest, 0.14); bset(rig, B.head, 0.3 + Math.sin(t * 0.7) * 0.03); rig.faceE = 0.55; });
addPose('fallen', false, (rig, p, t) => { // thrown down: on the back, knees drawn up, an arm over the face
  rig.off[1] = -0.74; bset(rig, B.pelvis, -Math.PI / 2 + 0.05); bset(rig, B.chest, 0.28 + Math.sin(t * 1.6) * 0.02); bset(rig, B.head, 0.3, 0.25, 0);
  bset(rig, B.uArmR, -2.2, 0, 0.5); bset(rig, B.fArmR, -2.2); bset(rig, B.uArmL, -0.3, 0, -0.2); bset(rig, B.fArmL, -0.5);
  bset(rig, B.thighL, -0.4, 0, -0.32); bset(rig, B.shinL, 0.7); bset(rig, B.thighR, -0.3, 0, -0.38); bset(rig, B.shinR, 0.55); rig.faceE = 0.2; }, true); // v13: knees together and fallen to one side, not drawn up
addPose('reach', true, (rig, p, t) => { const s = Math.sin(t * 3) * 0.08; // reaching up the wall
  bset(rig, B.uArmL, -2.95 + s, 0, -0.12); bset(rig, B.uArmR, -2.9 - s, 0, 0.12); bset(rig, B.fArmL, -0.15); bset(rig, B.fArmR, -0.15); bset(rig, B.chest, -0.18); bset(rig, B.head, -0.5); });
addPose('mourn', false, (rig, p, t) => { const sob = Math.sin(t * 5.2) * 0.045 * (0.6 + 0.4 * Math.sin(t * 1.1)); // on the knees, hands on the head
  rig.off[1] = -0.66; bset(rig, B.thighL, -1.42, 0, 0.1); bset(rig, B.thighR, -1.42, 0, -0.1); bset(rig, B.shinL, 2.85); bset(rig, B.shinR, 2.85);
  bset(rig, B.pelvis, 0.18); bset(rig, B.chest, 0.42 + sob); bset(rig, B.head, 0.38); bset(rig, B.uArmL, -0.95, 0, -0.42 + sob); bset(rig, B.uArmR, -0.95, 0, 0.42 - sob); bset(rig, B.fArmL, -2.3, 0.25); bset(rig, B.fArmR, -2.3, -0.25); rig.faceE = 0.1; }, true); // v12: hands over the face, elbows in (it used to throw the arms over the head)
addPose('tearClothes', false, (rig, p, t) => { const rip = sst(0.25, 0.42, p) * (1 - sst(0.8, 1, p)); // rend the garment at the neck
  rig.off[1] = -0.36; bset(rig, B.thighL, -1.1, 0, 0.12); bset(rig, B.shinL, 1.6); bset(rig, B.thighR, 0.05, 0, -0.08); bset(rig, B.shinR, 1.2);
  bset(rig, B.chest, 0.2 + 0.15 * rip); bset(rig, B.head, -0.25 + 0.4 * rip); bset(rig, B.uArmL, -1.35, 0, -0.35 + 0.75 * rip); bset(rig, B.uArmR, -1.35, 0, 0.35 - 0.75 * rip);
  bset(rig, B.fArmL, -1.5 + 0.6 * rip); bset(rig, B.fArmR, -1.5 + 0.6 * rip); rig.faceE = 0.2; }, true);
addPose('beg', false, (rig, p, t) => { const s = Math.sin(t * 2.2) * 0.07; // kneeling, hands held out
  rig.off[1] = -0.62; bset(rig, B.thighL, -1.3, 0, 0.12); bset(rig, B.thighR, -1.3, 0, -0.12); bset(rig, B.shinL, 2.6); bset(rig, B.shinR, 2.6);
  bset(rig, B.chest, 0.12 + s * 0.5); bset(rig, B.head, -0.22); bset(rig, B.uArmL, -1.45 + s, 0, -0.12); bset(rig, B.uArmR, -1.45 - s, 0, 0.12); bset(rig, B.fArmL, -0.45); bset(rig, B.fArmR, -0.45); rig.faceE = 0.4; }, true);
addPose('grabCloth', true, (rig, p, t) => { bset(rig, B.uArmR, -1.55, 0, 0.12); bset(rig, B.fArmR, -0.35); bset(rig, B.uArmL, -1.2, 0, -0.1); bset(rig, B.fArmL, -0.7); bset(rig, B.chest, 0.2); bset(rig, B.head, -0.05); });
addPose('present', true, (rig, p, t) => { bset(rig, B.uArmL, -1.2, 0, -0.28); bset(rig, B.uArmR, -1.2, 0, 0.28); bset(rig, B.fArmL, -0.65, 0.2); bset(rig, B.fArmR, -0.65, -0.2); bset(rig, B.chest, 0.18); bset(rig, B.head, 0.22); });
addPose('charioteer', false, (rig, p, t) => { const b = Math.sin(t * 9) * 0.015; // standing in the chariot, reins in the hands
  rig.off[1] = -0.07 + b; bset(rig, B.thighL, -0.28, 0, 0.1); bset(rig, B.shinL, 0.45); bset(rig, B.thighR, -0.12, 0, -0.1); bset(rig, B.shinR, 0.3);
  bset(rig, B.chest, 0.16); bset(rig, B.head, -0.05); bset(rig, B.uArmL, -0.85, 0, -0.18); bset(rig, B.uArmR, -0.85, 0, 0.18); bset(rig, B.fArmL, -0.95); bset(rig, B.fArmR, -0.95); }, true);
addPose('shave', true, (rig, p, t) => { const s = Math.sin(t * 6) * 0.15; bset(rig, B.uArmR, -0.6, 0, 0.42); bset(rig, B.fArmR, -2.3 + s, -0.3); bset(rig, B.uArmL, -0.4, 0, -0.3); bset(rig, B.fArmL, -1.2); bset(rig, B.head, -0.15, 0.2, 0); });
addPose('scratchWall', true, (rig, p, t) => { const s = Math.sin(t * 7) * 0.18; bset(rig, B.uArmR, -1.75, 0, 0.1); bset(rig, B.fArmR, -0.35 + s); bset(rig, B.uArmL, -0.3, 0, -0.1); bset(rig, B.fArmL, -0.5); bset(rig, B.head, 0.12); });
addPose('kneelPray', false, (rig, p, t) => { const br = Math.sin(t * 1.3) * 0.02; // on the knees, hands folded, face lifted
  rig.off[1] = -0.66; bset(rig, B.thighL, -1.42, 0, 0.1); bset(rig, B.thighR, -1.42, 0, -0.1); bset(rig, B.shinL, 2.85); bset(rig, B.shinR, 2.85);
  bset(rig, B.chest, 0.06 + br); bset(rig, B.head, -0.32); bset(rig, B.uArmL, -0.75, 0, -0.42); bset(rig, B.uArmR, -0.75, 0, 0.42); bset(rig, B.fArmL, -1.75, 0.3); bset(rig, B.fArmR, -1.75, -0.3); rig.faceE = 0.25; }, true);

// ------------------------------------------------------------------ HELPERS
const hAt = (x, z) => { const h = Gm().W().heightAt(x, z), f = pitFloor(x, z); return f !== null ? Math.max(h, f) : h; };
const at = (x, z, dy) => [x, hAt(x, z) + (dy || 0), z];
const P_ = () => Gm().P;
const cpose = (k, dur, hold) => { P_().cpose = k ? { k, t: 0, dur: dur || 0, hold: !!hold } : null; };
function npcSet(id, props) { const n = Gm().npc(id); if (!n) return null; n.d = Object.assign({}, n.d, props); if (props.look) n.meshes = null; return n; }
function place(id, x, z, face, o) { const Gx = Gm(), n = Gx.npc(id); if (!n) return null; Gx.npcTo(id, x, z, face, false); n.walk = null; n.sit = !!(o && o.sit); n.act = (o && o.act) || null; n.emote = null; if (o && o.vis !== undefined) n.forceVis = o.vis; return n; }
function walkTo(id, x, z, sp, cb) { const n = Gm().npc(id); if (!n) return; n.sit = false; n.act = null; Gm().npcWalk(id, x, z, () => { cb && cb(n); }, sp || 2); if (n.walk) n.walk.solid = false; }
function emote(id, k, dur) { const n = Gm().npc(id); if (n) n.emote = { k, t: 0, dur: dur || 2.5 }; }
function face(id, x, z) { const n = Gm().npc(id); if (n) { n.face = n.homeFace = Math.atan2(x - n.x, z - n.z); } }
const bubble = (id, t, d) => GG.Life && GG.Life.bubble(id, t, d || 3);
const cine = (shots, done, o) => GG.Cine.play(shots, done, o);
const fade = (mid, after) => GG.UI.fade(mid, after);
const RT = { crumbs: [], car: null, cows: [], tw: [], t: 0, grace: 0 };
const OUTFIT_AT = [['p_wake', 'josephCoat'], ['c1_pit', 'josephPlain'], ['c2_arrive', 'josephSlave'], ['c2_manage', 'josephSteward'], ['c2_flee', 'josephFled'], ['c3_cell', 'josephFettered'],
  ['c3_charge', 'josephPrisoner'], ['c4_court', 'josephShaved'], ['c5_patrol', 'josephVizier']];
function outfitFor(S) { let o = 'josephCoat'; for (const [k, v] of OUTFIT_AT) if (!before(S, k)) o = v; const wd = S.flags && S.flags.ward; if (o === 'josephVizier' && wd && wd.sel && WARD[wd.sel]) o = wd.sel; return o; }
// ------------------------------------------------------------------ v16 옷장: once Joseph is vizier he can have clothes made and change into them
const WARD = {
  josephVizier: { n: '총리 예복', d: '바로가 입혀 준 세마포 옷과 금 사슬', need: null },
  wLinen: { n: '세마포 평상복', d: '가벼운 아마 치마와 청록 목걸이. 더운 날 들판 순찰에 좋아요.', need: { linen: 1 } },
  wLapis: { n: '청금석 예복', d: '푸른 물을 들인 긴 옷에 금띠. 궁에 들어갈 때 입어요.', need: { cloth: 2 }, silver: 40 },
  wFeast: { n: '잔치 예복', d: '흰 겉옷에 금 테두리. 손님을 맞을 때 입어요.', need: { linen: 2 }, silver: 60 },
  wRed: { n: '붉은 겉옷', d: '붉게 물들인 양털 겉옷. 밤바람이 찬 날에 좋아요.', need: { wool: 2, cloth: 1 } },
  wField: { n: '들판 차림', d: '수수한 겉옷과 가죽 띠. 사냥하고 낚시할 때 편해요.', need: { wool: 2, thread: 1 } },
  wCoat: { n: '채색옷 (그리움)', d: '아버지가 지어 주신 채색옷을 떠올리며 새로 지었어요.', need: { cloth: 3, thread: 2 } },
  josephShaved: { n: '겉옷 벗기', d: '겉옷을 벗고 아마 치마만 입어요.', need: null } };
const WARD_LOOKS = {
  wLinen: Object.assign({}, JO, { skin: 0xd09868, bare: true, kilt: true, kiltLong: true, bottom: LINEN, collar: TURQ, collar2: GOLD, hairStyle: 'wig', hair: 0x15100c, build: 0.95, jaw: 0.05, sandal: 0x8a6a40 }),
  wLapis: Object.assign({}, LOOK.josephVizier, { top: LAPIS, under: LINEN, trim: GOLD, trim2: LINEN, sash: GOLD }),
  wFeast: Object.assign({}, LOOK.josephVizier, { mantle: LINEN, mantleTrim: GOLD, collar: GOLD, collar2: TURQ }),
  wRed: Object.assign({}, LOOK.josephVizier, { mantle: 0x9a2a22, mantleTrim: GOLD }),
  wField: Object.assign({}, JO, { skin: 0xd09868, top: 0xc8a878, trim: 0x6a4a30, belt: 0x5a3a22, mantle: 0x6a5a48, hairStyle: 'short', build: 0.95, jaw: 0.05 }),
  wCoat: Object.assign({}, LOOK.josephCoat, { skin: 0xd09868, build: 0.95, jaw: 0.05 }) };
function wardState(S) { const w = S.flags.ward = S.flags.ward || { own: { josephVizier: 1, josephShaved: 1 }, sel: null }; return w; }
function openWardrobe(S, G2) { const UI = GG.UI, w = wardState(S); let el = document.getElementById('wardUI');
  if (!el) { el = document.createElement('div'); el.className = 'overlay sheet'; el.id = 'wardUI'; el.hidden = true; document.body.appendChild(el);
    el.addEventListener('click', e => { const b = e.target.closest('[data-w]'); if (e.target.closest('#wardX') || e.target === el) { el.hidden = true; UI.setBusy('ward', false); return; } if (!b) return; const k = b.dataset.w, it = WARD[k], st = wardState(Gm().S());
      if (!st.own[k]) { const S2 = Gm().S(); for (const i in it.need || {}) if (!Gm().have(i, it.need[i])) { UI.toast(`${Gm().ITEMS[i].n}이(가) 모자라요`); return; } if (it.silver && S2.silver < it.silver) { UI.toast('은이 부족해요'); return; }
        for (const i in it.need || {}) Gm().take(i, it.need[i]); if (it.silver) Gm().silver(-it.silver); st.own[k] = 1; GG.Audio && GG.Audio.sfx('craft'); UI.toast(`${it.n}을(를) 지었어요`); }
      st.sel = k === 'josephVizier' ? null : k; Gm().setOutfit(outfitFor(Gm().S())); const P = Gm().P; GG.FX.burst(P.x, P.y + 1.1, P.z, 18, { c: [1, 0.9, 0.6], sp: 1.2, up: 1.2 }); GG.Audio && GG.Audio.sfx('whoosh'); draw(); }); }
  const draw = () => { const st = wardState(Gm().S()), cur = st.sel || 'josephVizier', I = Gm().ITEMS;
    el.innerHTML = `<div class="panel"><div class="p-head"><h3>옷장 · 총리의 옷</h3><button class="p-x" id="wardX">닫기</button></div><div class="p-body"><p class="muted" style="margin:0 0 8px">옷을 지어 두면 언제든 갈아입을 수 있어요.</p><div class="ward">${Object.keys(WARD).map(k => { const it = WARD[k], own = st.own[k], need = Object.keys(it.need || {}).map(i => `${I[i].n} ${it.need[i]}`).concat(it.silver ? [`은 ${it.silver}`] : []).join(' · ');
      return `<button class="wcard${cur === k ? ' on' : ''}" data-w="${k}"><b>${it.n}</b><span>${it.d}</span><em>${cur === k ? '입는 중' : own ? '입기' : '짓기 · ' + need}</em></button>`; }).join('')}</div></div></div>`; };
  draw(); el.hidden = false; UI.setBusy('ward', true); }


// where everyone stands, step by step (also restores the scene after loading a save)
const DOTHAN = { x: 158, z: -150 };
const broRing = (i, r) => { const a = i / BRO.length * Math.PI * 2 + 0.3; return [DOTHAN.x + Math.cos(a) * (r || 3.4), DOTHAN.z + Math.sin(a) * (r || 3.4), Math.atan2(-Math.cos(a), -Math.sin(a))]; };
function stage(S, G) {
  if (!G || !G.npc) return; GG.UI.hint(null); G.P.sleeping = false; G.P.sit = false; G.P.kneel = false;
  const want = outfitFor(S); if (S.outfit !== want) G.setOutfit(want);
  if (between(S, 'p_dothan', 'c1_pit') && !S.q.broShow) BRO.forEach((id, i) => { const [x, z, f] = broRing(i); place(id, x, z, f, { sit: i % 4 !== 0, act: S.step === 'c1_pit' && i % 3 === 1 ? 'eat' : null }); });
  if (S.step === 'c1_market') { place('potiphar', -3.6, 121, -2.6); }
  else if (between(S, 'c2_arrive', 'c2_flee')) {
    if (S.step === 'c2_store') { place('potiphar', -13.4, 60.6, -1.4); place('scribe', -14.2, 62.4, -1.6); }
    else { place('potiphar', -28, 39.4, 0, { sit: true }); place('scribe', -23.6, 41.2, 0, { sit: true }); }
    if (S.step === 'c2_tempt3' || S.step === 'c2_flee') place('wife', -30.5, 39.6, 0.5); else place('wife', -20.6, 61.6, Math.PI);
  }
  if (between(S, 'c3_officers', 'c3_dreams')) { place('cupbearer', CELL[3][0] - 1.1, CELL[3][1] - 0.2, 0); place('baker', CELL[3][0] + 1.1, CELL[3][1] - 0.4, 0); }
  if (between(S, 'c5_patrol')) { place('pharaoh', -30, -177.2, 0, { sit: true }); }
  if (S.step === 'c6_sell' || S.step === 'j_end') { const n = G.npc('overseerW'); if (n) n.forceVis = false; }
  ['pg1', 'pg2'].forEach(id => G.npcShow(id, undefined)); if (between(S, 'c3_cell', 'c4_shave')) { place('pg1', -32.6, 16, 0); place('pg2', -27.4, 16, 0); }
}
// every step's enter re-stages the world
for (const k in steps) { const st = steps[k], en = st.enter; st.enter = function (S, G, re) { stage(S, G); if (en) en.call(this, S, G, re); }; }
const talk = {};

// ------------------------------------------------------------------ PROLOGUE · the errand (tutorial)
function cinNight(S, G) {
  const bx = SPOTS.restBed[0], bz = SPOTS.restBed[1], h = hAt(bx, bz);
  // v15: the big oak stands north-east of the straw bed (190, 29), so every shot stays on the open south-west side and the upward
  // looks point away from its crown. The scene ends on Joseph asleep, then cuts (no flying camera) to the stars above him.
  const ox = 190 - bx, oz = 29 - bz, ol = Math.hypot(ox, oz), ux = -ox / ol, uz = -oz / ol; // unit vector pointing away from the oak
  const sky = (k, up) => [bx + ux * k, h + up, bz + uz * k];
  fade(() => { G.teleport(bx, bz, 2.6); G.P.sleeping = true; if (G.hour() < 22) S.time = Math.floor(S.time / 24) * 24 + 22.2; GG.UI.hint(null); }, () => cine([
    { cam: [bx + ux * 3.2 + uz * 1.4, h + 1.35, bz + uz * 3.2 - ux * 1.4], cam2: [bx + ux * 2.6 + uz * 1.1, h + 1.1, bz + uz * 2.6 - ux * 1.1], look: [bx, h + 0.3, bz], dur: 5, fov: 0.85, t: '모닥불이 사위어 갈 무렵, 요셉은 짚자리에 누워 하늘을 올려다보았습니다.', music: 'j_night' },
    { cam: [bx + ux * 0.3, h + 0.55, bz + uz * 0.3], look: sky(16, 26), look2: sky(18, 26), dur: 7, fov: 1.05, n: '요셉', t: '해와 달과 열한 별이 내게 절을 했지… 형들은 그 꿈 이야기에 더 화를 냈고.', ref: '창세기 37:9–11', e: 'tender' },
    { cam: [bx + ux * 1.7 - uz * 0.9, h + 1.05, bz + uz * 1.7 + ux * 0.9], look: [bx, h + 0.4, bz], dur: 6, fov: 0.7, n: '요셉', t: '아버지는 그 말을 마음에 두셨는데… 형들은 왜 나를 미워할까. 이번엔 형들이 반가워해 주면 좋겠다.', ref: '창세기 37:4, 11', e: 'sad' },
    { cam: [bx + ux * 3.4 + uz * 0.6, h + 2.3, bz + uz * 3.4 - ux * 0.6], cam2: [bx + ux * 3.1 + uz * 0.5, h + 2.15, bz + uz * 3.1 - ux * 0.5], look: [bx, h + 0.25, bz], dur: 4.5, fov: 0.8, t: '모닥불이 꺼지고, 소년은 스르르 잠이 들었습니다.' },
    { cam: [bx + ux * 1.2, h + 0.5, bz + uz * 1.2], look: sky(14, 30), look2: sky(14.5, 30.5), dur: 6, fov: 1.15, fadeIn: 0.6, t: '그날 밤, 별들은 말없이 소년을 내려다보았습니다.', fadeOut: 1.8 },
  ], () => { G.P.sleeping = false; GG.Game.musicOverride = null; G.newDay('세겜 들판으로'); G.teleport(bx - 1.5, bz - 1.5, Math.PI); G.go('p_shechem'); }));
}
const CLUE_T = [
  [J('모닥불 자리… 재가 식었어. 형들이 떠난 지 며칠은 된 것 같아.', '', 'calm'), T('곁에는 빈 자루와 깨진 물동이가 굴러다녔습니다.')],
  [J('양 떼 발자국이야. 많기도 해라… 북쪽으로 이어져 있어.', '', 'calm')],
  [J('르우벤 형이 쌓는 방식의 돌무더기다. 길이 여기서 갈라지네… 어느 쪽일까?', '', 'calm'), T('요셉은 한참을 두리번거렸습니다. 넓은 들판에서, 혼자였습니다.', '창세기 37:15')]];
function clue(S, G, k, i) {
  (S.q.cl = S.q.cl || {})[k] = 1; S.q.clues = Object.keys(S.q.cl).length; pick(); G.FX.burst(SPOTS[k][0], hAt(SPOTS[k][0], SPOTS[k][1]) + 0.5, SPOTS[k][1], 12, { c: [1, 0.9, 0.55], sp: 1, up: 1.5 });
  say(CLUE_T[i], () => { G.UI.quest(); G.checkStep(); });
}
// p_dothan: from the brothers' side of the valley (창 37:18–22)
function cinPlot(S, G, next) {
  const P = G.P, px = P.x, pz = P.z, ph = hAt(px, pz), fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz);
  stage(S, G); GG.UI.hint(null);
  cine([
    { cam: [fx - 1.2, fh + 1.9, fz - 6.4], cam2: [fx - 0.8, fh + 1.8, fz - 5.8], look: [px, ph + 1.2, pz], dur: 5, fov: 0.55, t: '도단 들판. 형들이 저 멀리 언덕길을 내려오는 한 사람을 보았습니다. 햇빛에 무지갯빛 옷자락이 반짝였습니다.', music: 'j_dread' },
    { cam: [fx + 2.4, fh + 1.3, fz - 1.4], look: [fx - 1, fh + 1.0, fz + 1.5], dur: 5, n: '시므온', t: '저기 꿈꾸는 자가 오는도다.', ref: '창세기 37:19', e: 'cold', fn: () => { emote('simeon', 'point', 3); } },
    { cam: [fx - 2.2, fh + 1.2, fz + 2.6], look: [fx + 1, fh + 1.0, fz - 1], dur: 7, n: '레위', t: '자, 그를 죽여 한 구덩이에 던지고, 악한 짐승이 그를 잡아먹었다 하자. 그의 꿈이 어떻게 되는지 우리가 볼 것이니라.', ref: '창세기 37:20', e: 'cold' },
    { cam: [fx + 3.2, fh + 1.4, fz + 2.4], cam2: [fx + 2.6, fh + 1.3, fz + 1.8], look: [fx + 1.6, fh + 1.2, fz + 2.6], dur: 6, n: '르우벤', t: '우리가 그의 생명은 해치지 말자. 피를 흘리지 말라. 그를 광야 그 구덩이에 던지고 손을 그에게 대지 말라.', ref: '창세기 37:21–22', e: 'urgent', fn: () => emote('reuben', 'think', 6) },
    { cam: [PIT.x + 6, PIT.rim + 2.4, PIT.z + 6], cam2: [PIT.x + 4, PIT.rim + 3, PIT.z + 4], look: [PIT.x, PIT.floor + 1, PIT.z], dur: 6, t: '이는 르우벤이 요셉을 그들의 손에서 구출하여 그의 아버지에게로 돌려보내려 함이었더라.', ref: '창세기 37:22' },
  ], next);
}
// p_approach → the pit (창 37:23–24)
function cinPit(S, G, next) {
  const P = G.P, px = P.x, pz = P.z, ph = hAt(px, pz), fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz);
  const fr = Math.atan2(fx - px, fz - pz); P.face = fr;
  const rim = (a, r) => [PIT.x + Math.cos(a) * (r || PIT.wall + 0.85), PIT.z + Math.sin(a) * (r || PIT.wall + 0.85)]; // v16.9 at the very edge, looking down (they stood back out of sight)
  cine([
    { fn: () => { cpose(null); }, shot: { type: 'MS', a: 'hero', b: 'simeon' }, dur: 4.5, n: '요셉', t: '형들! 드디어 찾았다! 아버지께서 형들이 잘 있는지 보고 오라고 하셨어요!', e: 'happy' },
    { fn: () => { ['simeon', 'levi', 'judah', 'dan', 'gad'].forEach((id, i) => walkTo(id, px + Math.sin(fr + 2.2 + i * 0.45) * 1.7, pz + Math.cos(fr + 2.2 + i * 0.45) * 1.7, 2.2, n => face(id, px, pz))); },
      shot: { type: 'OTS', a: 'simeon', b: 'hero' }, dur: 5, n: '시므온', t: '꿈꾸는 자야. 아버지 심부름까지 와서 우리를 감시하느냐.', e: 'cold' },
    { shot: { type: 'CU', a: 'hero', b: 'simeon', lens: 'tele', move: 'pushIn' }, dur: 4.5, n: '요셉', t: '형들… 왜 그런 눈으로 보세요…?', e: 'fear', fn: () => cpose('think', 4) },
    { fn: () => { emote('simeon', 'grab', 2); emote('levi', 'grab', 2); G.sfx('rip'); G.setOutfit('josephPlain'); cpose('fallen', 0, true); }, cam: [px + 2.4, ph + 1.2, pz + 1.8], look: [px, ph + 0.8, pz], dur: 5, shake: 0.6, shakeDecay: 1.4,
      t: '요셉이 형들에게 이르매, 그들이 요셉의 옷 곧 그가 입은 채색옷을 벗기고', ref: '창세기 37:23' },
    { shot: { type: 'LOW', a: 'levi', b: 'hero' }, dur: 4.5, n: '레위', t: '이 옷이 그리도 자랑스러웠느냐! 아버지가 너만 사랑하신다고!', e: 'angry', fn: () => emote('levi', 'swing', 1.2) },
    // dragged to the edge: the two brothers walk Joseph to the rim between them, then it goes dark as he falls
    { fn: () => { const ax = px - PIT.x, az = pz - PIT.z, al = Math.hypot(ax, az) || 1, ux = ax / al, uz = az / al, sx = -uz, sz = ux;
        RT.drag = { x0: PIT.x + ux * (PIT.r + 7.5), z0: PIT.z + uz * (PIT.r + 7.5), x1: PIT.x + ux * (PIT.r + 1.1), z1: PIT.z + uz * (PIT.r + 1.1), sx, sz, f: Math.atan2(-ux, -uz) };
        const D = RT.drag; G.teleport(D.x0, D.z0, D.f); cpose('bound', 0, true);
        place('simeon', D.x0 + sx * 0.75, D.z0 + sz * 0.75, D.f); place('levi', D.x0 - sx * 0.75, D.z0 - sz * 0.75, D.f);
        walkTo('simeon', D.x1 + sx * 0.75 + ux * 0.3, D.z1 + sz * 0.75 + uz * 0.3, 1.75); walkTo('levi', D.x1 - sx * 0.75 + ux * 0.3, D.z1 - sz * 0.75 + uz * 0.3, 1.75);
        ['judah', 'dan', 'gad'].forEach((id, i) => { const a = Math.atan2(uz, ux) + 0.9 + i * 0.5; place(id, PIT.x + Math.cos(a) * (PIT.r + 2.4), PIT.z + Math.sin(a) * (PIT.r + 2.4), Math.atan2(-Math.cos(a), -Math.sin(a))); }); },
      cam: () => { const D = RT.drag; return [D.x1 + D.sx * 6.5 + (D.x0 - D.x1) * 0.25, hAt(D.x1, D.z1) + 2.2, D.z1 + D.sz * 6.5 + (D.z0 - D.z1) * 0.25]; },
      look: () => { const P = G.P; return [P.x, P.y + 1.1, P.z]; }, dur: 4.6, t: '형들은 요셉의 두 팔을 잡아 끌고 들판의 빈 구덩이로 갔습니다.', ref: '창세기 37:24',
      each: t => { const D = RT.drag, P = G.P, k = Math.min(1, t / 4); P.x = D.x0 + (D.x1 - D.x0) * k; P.z = D.z0 + (D.z1 - D.z0) * k; P.y = hAt(P.x, P.z); P.face = D.f; P.spd = k < 1 ? 1.6 : 0; } },
    { black: true, cam: [px, ph + 2, pz + 3], look: [px, ph, pz], dur: 2.4, t: '그를 잡아 구덩이에 던지니', ref: '창세기 37:24', sfx: 'thud',
      fn: () => { S.q.inPit = 1; G.teleport(PIT.x + 0.4, PIT.z + 0.3, 0.6); P.y = PIT.floor; cpose('fallen', 0, true);
        [['simeon', 0.6], ['levi', 1.4], ['judah', 2.4], ['reuben', 3.6], ['dan', 4.6]].forEach(([id, a]) => { const [x, z] = rim(a); place(id, x, z, Math.atan2(PIT.x - x, PIT.z - z)); }); } },
    { cam: [PIT.x - 0.6, PIT.floor + 0.7, PIT.z - 0.8], look: [PIT.x + 0.8, PIT.rim + 1.6, PIT.z + 1.6], dur: 6, fov: 1.05, shake: 0.4, shakeDecay: 1, t: '그 구덩이는 빈 것이라. 그 속에 물이 없었더라.', ref: '창세기 37:24', music: 'j_pit' },
    { shot: { type: 'LOW', a: 'simeon', b: 'hero', lens: 'wide' }, dur: 5, n: '시므온', t: '네 꿈이 어떻게 되는지 보자! 해와 달과 별들이 너를 꺼내 주겠지!', e: 'cold', fn: () => emote('levi', 'laugh', 4) },
    { cam: [rim(3.6, 6)[0], PIT.rim + 1.7, rim(3.6, 6)[1]], look: [rim(3.6)[0], PIT.rim + 1.4, rim(3.6)[1]], dur: 6, t: '르우벤은 아무 말도 하지 못했습니다. 그는 밤이 되면 몰래 돌아와 동생을 건져 내리라 마음먹었습니다.', ref: '창세기 37:22, 29' },
    { fn: () => { cpose(null); BRO.forEach((id, i) => { const [x, z, f] = broRing(i); walkTo(id, x, z, 1.8, n => { n.face = n.homeFace = f; n.sit = i % 4 !== 0; if (i % 3 === 1) n.act = 'eat'; }); }); },
      cam: [PIT.x, PIT.rim + 1.5, PIT.z + 1], cam2: [PIT.x, PIT.rim + 6, PIT.z + 1.5], look: [PIT.x + 0.4, PIT.floor + 0.6, PIT.z + 0.3], dur: 7, title: '1장 · 구덩이', sub: '창세기 37:23–36' },
  ], () => { stage(S, G); next(); }, { noSkip: false });
}
// c1_pit: jumping, calling, praying
function pitShout(S, G) {
  cpose('reach', 2.4);
  say([J('르우벤 형! 유다 형! 여기서 꺼내 주세요! 형들!', '', 'cry'), T('위에서 형들이 음식을 먹으며 웃는 소리가 들렸습니다. 아무도 대답하지 않았습니다.', '창세기 37:25'),
    J('…제발요. 잘못했어요. 꿈 이야기 다시는 안 할게요…', '', 'cry'),
    T('훗날 형들은 이 날을 이렇게 기억했습니다. "그가 우리에게 애걸할 때에 그 마음의 괴로움을 보고도 듣지 아니하였으므로…"', '창세기 42:21')], () => tick(S, 'shout'));
}
function pitPray(S, G) {
  cpose('kneelPray', 0, true);
  cine([{ cam: [PIT.x + 1.6, PIT.floor + 1.0, PIT.z + 1.2], look: [PIT.x + 0.6, PIT.floor + 0.8, PIT.z - 0.6], dur: 6, n: '요셉', t: '하나님… 아브라함과 이삭과, 우리 아버지 야곱의 하나님.', e: 'pray' },
    { cam: [PIT.x - 0.5, PIT.floor + 0.6, PIT.z - 1.4], look: [PIT.x + 0.6, PIT.floor + 1.1, PIT.z - 0.6], dur: 7, n: '요셉', t: '아버지에게 돌아가겠다고… 베냐민에게 금방 간다고 약속했어요. 저를 여기서 꺼내 주세요.', e: 'cry' },
    { cam: [PIT.x + 0.6, PIT.floor + 0.5, PIT.z - 0.4], look: [PIT.x + 0.6, PIT.rim + 30, PIT.z - 0.6], dur: 7, t: '동그랗게 뚫린 하늘로 구름이 천천히 흘러갔습니다. 요셉의 기도를 듣는 이는 아무도 없는 것 같았습니다. 그러나 하나님은 듣고 계셨습니다.' }],
  () => { cpose(null); tick(S, 'pitPray'); });
}
// c1_pit done → sold for twenty pieces of silver (창 37:25–28), Reuben, Jacob's grief (37:29–35)
function cinSold(S, G, next) {
  const fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz), heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4);
  const top = [PIT.x + 4.6, PIT.z + 1.2];
  const CAR = ['ishmael', 'camel1', 'camel2', 'camel3', 'midian', 'ishBoy'];
  cine([
    { fn: () => { S.q.caravanOn = 1; CAR.forEach((id, i) => { place(id, 214 + i * 3.4, -155.5 + (i % 2) * 0.6, -1.55); walkTo(id, 184 + i * 3.4, -152 + (i % 2) * 0.6, id.startsWith('camel') ? 2.2 : 2.3); }); },
      cam: [fx - 2, fh + 1.8, fz - 2.6], cam2: [fx - 1, fh + 2.2, fz - 2], look: [fx, fh + 1, fz], look2: [200, hAt(200, -154) + 2, -154], dur: 8, music: 'j_dread',
      t: '그들이 앉아 음식을 먹다가 눈을 들어 본즉, 한 무리의 이스마엘 사람들이 길르앗에서 오는데, 그 낙타들에 향품과 유향과 몰약을 싣고 애굽으로 내려가는지라.', ref: '창세기 37:25' },
    { fn: () => { const n = G.npc('judah'); if (n) { n.sit = false; n.act = null; } }, cam: [fx + 1.6, fh + 1.5, fz + 3.6], look: [fx + 0.4, fh + 1.3, fz + 1.4], dur: 6, n: '유다', t: '우리가 우리 동생을 죽이고 그의 피를 덮어둔들 무엇이 유익할까.', ref: '창세기 37:26', e: 'solemn' },
    { cam: [fx - 1.4, fh + 1.6, fz + 4.4], look: [fx + 0.6, fh + 1.3, fz + 1.6], dur: 7, n: '유다', t: '자, 그를 이스마엘 사람들에게 팔고 그에게 우리 손을 대지 말자. 그는 우리의 동생이요 우리의 혈육이니라.', ref: '창세기 37:27' },
    { fn: () => { ['judah', 'simeon', 'levi'].forEach((id, i) => walkTo(id, top[0] - 1 + i * 1.3, top[1] + 1.8 - i * 0.6, 2.4)); CAR.forEach((id, i) => walkTo(id, PIT.x + 9 + i * 3, PIT.z - 4.5 - (i % 2), 2.2)); },
      cam: [PIT.x - 0.3, PIT.floor + 0.8, PIT.z - 0.6], look: [PIT.x + 1, PIT.rim + 1.4, PIT.z + 1.6], dur: 5, t: '그 형제들이 청종하였더라.', ref: '창세기 37:27', sfx: 'rope' },
    { fn: () => { S.q.inPit = 0; S.q.bound = 1; G.teleport(top[0], top[1], -1.2); cpose('bound', 0, true); },
      cam: [top[0] - 3.4, hAt(top[0], top[1]) + 1.6, top[1] + 1.6], look: [top[0], hAt(top[0], top[1]) + 1.1, top[1]], dur: 6, shake: 0.25, shakeDecay: 1,
      t: '그 때에 미디안 사람 상인들이 지나가고, 형제들이 요셉을 구덩이에서 끌어올렸습니다.', ref: '창세기 37:28', sfx: 'rope' },
    { fn: () => { place('midian', top[0] + 2.4, top[1] - 1.6, -0.8); place('judah', top[0] + 1.2, top[1] + 0.2, 2.2); },
      cam: [top[0] + 4.4, hAt(top[0], top[1]) + 1.5, top[1] + 0.6], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.3, top[1] - 0.6], dur: 4, n: '미디안 상인', t: '열다섯.', e: 'cold' },
    { cam: [top[0] + 0.2, hAt(top[0], top[1]) + 1.5, top[1] + 2.4], look: [top[0] + 1.4, hAt(top[0], top[1]) + 1.4, top[1]], dur: 4, n: '유다', t: '스물. 젊고 튼튼하오.', e: 'cold' },
    { cam: [top[0] + 3.4, hAt(top[0], top[1]) + 1.3, top[1] - 0.2], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.0, top[1] - 0.8], dur: 5.5, sfx: 'coins', n: '미디안 상인', t: '…좋소. 은 스물.', e: 'cold', fn: () => emote('midian', 'pick', 2) },
    { cam: [top[0] - 1.8, hAt(top[0], top[1]) + 1.4, top[1] - 1.2], look: [top[0], hAt(top[0], top[1]) + 1.4, top[1]], dur: 7, fov: 0.62, n: '요셉', t: '유다 형! 시므온 형! 제발요… 아버지가 기다리세요! 베냐민한테 금방 간다고 약속했단 말이에요!', e: 'cry', fn: () => cpose('beg', 0, true) },
    { cam: [top[0] + 1.2, hAt(top[0], top[1]) + 1.6, top[1] + 3.2], look: [top[0] + 1.2, hAt(top[0], top[1]) + 1.2, top[1] + 0.2], dur: 6, t: '형들은 고개를 돌렸습니다. 은 이십 세겔에, 요셉은 이스마엘 사람들에게 팔렸습니다.', ref: '창세기 37:28' },
    { fn: () => { cpose('bound', 0, true); const L = [[150, -138], [146, -134], [142, -131], [138, -128], [134, -126], [130, -124]]; CAR.forEach((id, i) => { place(id, PIT.x + 6 - i * 3, PIT.z - 7.5 - i * 0.4, -2.2); walkTo(id, L[i][0], L[i][1], 2.1); }); G.teleport(PIT.x - 14, PIT.z - 5.8, -2.2); walkTo('ishBoy', PIT.x - 15, PIT.z - 7.5, 2); },
      cam: [PIT.x + 14, PIT.rim + 9, PIT.z + 14], cam2: [PIT.x + 6, PIT.rim + 14, PIT.z + 10], look: [PIT.x - 10, PIT.rim, PIT.z - 6], look2: [PIT.x - 22, PIT.rim, PIT.z - 2], dur: 8, t: '상인들은 요셉을 데리고 애굽으로 갔습니다.', ref: '창세기 37:28', music: 'j_mourn',
      each: t => { const P = G.P; P.x = PIT.x - 14 - t * 1.6; P.z = PIT.z - 5.8 + t * 0.9; P.y = hAt(P.x, P.z); P.spd = 1.6; } },
    { hour: 18.4, fn: () => { S.q.caravanOn = 0; const [x, z] = [PIT.x + 6.4, PIT.z - 1.4]; place('reuben', x, z, Math.atan2(PIT.x - x, PIT.z - z), { act: 'tearClothes' }); G.teleport(DOTHAN.x - 30, DOTHAN.z + 20, 0); },
      cam: [PIT.x - 2, PIT.floor + 1, PIT.z - 2], look: [PIT.x + 6.4, PIT.rim + 1.4, PIT.z - 1.4], dur: 6, t: '르우벤이 돌아와 구덩이에 이르러 본즉 거기 요셉이 없는지라. 옷을 찢고', ref: '창세기 37:29' },
    { cam: [PIT.x + 9.4, PIT.rim + 1.7, PIT.z - 3.2], look: [PIT.x + 6.4, PIT.rim + 1.3, PIT.z - 1.4], dur: 6, n: '르우벤', t: '아이가 없도다! 나는 어디로 갈까!', ref: '창세기 37:30', e: 'cry' },
    { hour: 21, fn: () => { const n = G.npc('reuben'); if (n) n.act = null; stage(S, G); }, cam: [fx + 6, fh + 3, fz + 6], cam2: [fx + 4, fh + 2.2, fz + 4], look: [fx, fh + 0.8, fz], dur: 6, t: '그들이 요셉의 옷을 가져다가 숫염소를 죽여 그 옷을 피에 적시고, 그의 채색옷을 보내어 아버지에게로 가지고 가서', ref: '창세기 37:31–32' },
    { hour: 10, fn: () => { S.q.heb = 1; S.q.broShow = 1; ['judah', 'reuben', 'simeon', 'levi', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun'].forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI));
        place('jacob', heb[0], heb[1] + 2.6, 0); place('benjamin', heb[0] + 2.4, heb[1] + 2.2, -0.6); },
      cam: [heb[0] + 4, hh + 1.7, heb[1] + 9], cam2: [heb[0] + 2.4, hh + 1.6, heb[1] + 7.2], look: [heb[0], hh + 1.2, heb[1] + 3], dur: 7, n: '유다', t: '아버지… 우리가 이것을 발견하였으니, 아버지의 아들의 옷인가 보소서.', ref: '창세기 37:32', e: 'solemn' },
    { cam: [heb[0] - 1.2, hh + 1.6, heb[1] + 4.8], look: [heb[0], hh + 1.5, heb[1] + 2.6], dur: 7, fov: 0.62, n: '야곱', t: '내 아들의 옷이라. 악한 짐승이 그를 잡아먹었도다. 요셉이 분명히 찢겼도다!', ref: '창세기 37:33', e: 'cry', fn: () => { const n = G.npc('jacob'); if (n) n.act = 'tearClothes'; } },
    { fn: () => { const n = npcSet('jacob', { look: LOOK.jacobMourn }); if (n) n.act = 'mourn'; }, cam: [heb[0] + 3, hh + 1.2, heb[1] + 4], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 7,
      t: '야곱이 자기 옷을 찢고 굵은 베로 허리를 묶고 오랫동안 그의 아들을 위하여 애통하니', ref: '창세기 37:34' },
    { cam: [heb[0] + 3.6, hh + 0.9, heb[1] + 1.4], look: [heb[0] + 2.4, hh + 0.8, heb[1] + 2.2], dur: 6, n: '베냐민', t: '아버지… 요셉 형은요? 형이 금방 온다고… 약속했는데…', e: 'cry', fn: () => { const n = G.npc('benjamin'); if (n) n.act = 'weep'; } },
    { cam: [heb[0] - 2.4, hh + 1.3, heb[1] + 4.6], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 슬퍼하며 스올로 내려가 아들에게로 가리라.', ref: '창세기 37:35', e: 'cry' },
    { cam: [heb[0] + 10, hh + 7, heb[1] + 14], cam2: [heb[0] + 14, hh + 12, heb[1] + 20], look: [heb[0], hh + 1, heb[1] + 2], dur: 8, t: '그의 모든 자녀가 위로하되 그가 그 위로를 받지 아니하였으며, 그의 아버지가 그를 위하여 울었더라.', ref: '창세기 37:35', fadeOut: 1.5 },
    { hour: 17.6, fn: () => { S.q.heb = 0; S.q.broShow = 0; const n = npcSet('jacob', { look: LOOK.jacob }); if (n) n.act = null; const b = G.npc('benjamin'); if (b) b.act = null; caravanStart(S, G, false); },
      fadeIn: 1.4, cam: () => { const P = G.P; return [P.x + 5, P.y + 2.2, P.z + 4]; }, look: () => { const P = G.P; return [P.x, P.y + 1.2, P.z]; }, dur: 7, music: 'j_caravan',
      t: '그 시각, 요셉은 아버지가 자기를 위해 울고 있는 줄도 모른 채, 낯선 이들의 낙타 뒤를 따라 걷고 있었습니다.' },
  ], () => { next(); });
}

// ------------------------------------------------------------------ c1_caravan · bound behind the camels
const CAR_IDS = ['ishmael', 'midian', 'camel1', 'camel2', 'camel3', 'ishBoy']; const CAR_GAP = { ishmael: 0, midian: 5, camel1: 10, camel2: 15, camel3: 20, ishBoy: 35 }; const CAR_ME = 27;
const LEG1 = [[150, -138], [130, -124], [112, -104], [96, -84], [80, -60], [64, -34], [60, -28]];
const LEG2 = [[34, 62], [30, 76], [20, 92], [10, 108], [-2, 115], [-6, 118]];
function caravanStart(S, G, resume) {
  S.q.caravanOn = 1; S.q.bound = 1; const leg = S.q.night ? LEG2 : LEG1;
  let i0 = 0; if (resume && RT.car && RT.car.leg === leg) i0 = RT.car.i; else if (resume) { let bd = 1e9; leg.forEach((p, i) => { const d = Math.hypot(p[0] - G.P.x, p[1] - G.P.z); if (d < bd) { bd = d; i0 = i; } }); }
  const p0 = leg[i0], p1 = leg[Math.min(leg.length - 1, i0 + 1)], a = Math.atan2(p1[0] - p0[0], p1[1] - p0[1]);
  RT.car = { leg, i: i0 + 1, done: false, wait: 0 }; RT.crumbs = [];
  for (let k = 0; k < 40; k++) RT.crumbs.push({ x: p0[0] - Math.sin(a) * k * 0.6, z: p0[1] - Math.cos(a) * k * 0.6 });
  CAR_IDS.forEach(id => { const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_GAP[id])]; place(id, c.x, c.z, a); });
  const tail = RT.crumbs[CAR_ME];
  if (!resume || Math.hypot(G.P.x - tail.x, G.P.z - tail.z) > 9) G.teleport(tail.x, tail.z, a);
  cpose('bound', 0, true);
}
// the guide points at Joseph's own place on the rope (behind the last camel), not at the leader: walking up to the leader
// used to leave the boy ahead of the camels, the leader waiting for him behind and the rope holding him in front — a dead end
function carSlot() { const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_ME)]; return c ? { x: c.x, z: c.z } : null; }
function caravanTarget(S) { return carSlot() || (n => n ? { x: n.x, z: n.z } : null)(Gm().npc('ishmael')); }
function caravanUpdate(dt, S, G) {
  const C = RT.car; if (!C || S.step !== 'c1_caravan') return;
  const lead = G.npc('ishmael'); if (!lead) return; const P = G.P;
  const tailN = G.npc('camel3'), dTail = tailN ? Math.hypot(P.x - tailN.x, P.z - tailN.z) : 0;
  const busy = GG.UI.busy() || GG.Cine.on;
  // the leader walks the road and waits for the boy on the rope
  if (!C.done) {
    // wait only for a boy who lags behind his place on the rope (one who has walked ahead is no reason to stop)
    const wp = C.leg[C.i], slot = carSlot(), dSlot = slot ? Math.hypot(P.x - slot.x, P.z - slot.z) : dTail;
    const behind = !slot || Math.hypot(P.x - lead.x, P.z - lead.z) > Math.hypot(slot.x - lead.x, slot.z - lead.z);
    const wait = busy || (dTail > 6.2 && dSlot > 4 && behind);
    if (wait) { lead.walk = null; }
    else if (!lead.walk) { G.npcWalk('ishmael', wp[0], wp[1], () => { C.i++; if (C.i >= C.leg.length) C.done = true; }, 2.45); if (lead.walk) lead.walk.solid = false; }
  }
  // breadcrumb train
  const last = RT.crumbs[0]; if (!last || Math.hypot(lead.x - last.x, lead.z - last.z) > 0.6) { RT.crumbs.unshift({ x: lead.x, z: lead.z }); if (RT.crumbs.length > 60) RT.crumbs.pop(); }
  CAR_IDS.forEach((id, k) => { if (!k) return; const n = G.npc(id); if (!n) return; const c = RT.crumbs[Math.min(RT.crumbs.length - 1, CAR_GAP[id])]; const d = Math.hypot(c.x - n.x, c.z - n.z);
    if (d > 0.35) { G.npcWalk(id, c.x, c.z, null, clamp(d * 1.6, 0.6, 4.2)); if (n.walk) n.walk.solid = false; } });
  // talk along the road
  RT.carT = (RT.carT || 0) - dt; if (RT.carT <= 0 && !busy) { RT.carT = 16 + Math.random() * 10; const L = S.q.night ? ['저기 초록 땅이 보이지? 애굽이다.', '나일 강 물은 꿀처럼 달단다.', '장터에 서면 고개를 들어라. 그래야 값을 잘 받지.'] : ['걸어라, 히브리 아이. 해 지기 전에 우물까지 가야 한다.', '향품 자루를 떨어뜨리지 마라!', '물은 아껴 마셔라. 광야는 길다.'];
    bubble(Math.random() < 0.6 ? 'ishmael' : 'midian', L[Math.floor(Math.random() * L.length)], 3.6); }
  if (!S.q.night && !RT.lookBack && P.z > -110 && P.x < 120) { RT.lookBack = 1; setTimeout(() => { if (S.step === 'c1_caravan' && !GG.UI.busy()) say([J('(뒤를 돌아본다) …저 산 너머가 헤브론인데. 아버지…', '', 'sad'), N('ishBoy', '…', ''), T('대상의 아이가 말없이 요셉을 바라보았습니다.')]); }, 400); }
  // arrivals
  if (C.done && !S.q.night && Math.hypot(P.x - SPOTS.caravanNight[0], P.z - SPOTS.caravanNight[1]) < 26 && !busy) { C.done = false; cinCaravanNight(S, G); }
  if (S.q.night && !S.q.reveal && Math.hypot(P.x - SPOTS.egyptGate[0], P.z - SPOTS.egyptGate[1]) < 13 && !busy) cinReveal(S, G);
}
// v16.1: the road to Egypt is a cutscene now (walking two long legs behind the camels was the slowest part of the game):
// leaving Dothan on the rope → the long road south, looking back toward Hebron → the night by the fire (as before) → crossing
// the desert → Egypt revealed → the slave market.
function stageCar(x, z, a, bound) { CAR_IDS.forEach(id => { const g = CAR_GAP[id] * 0.6; place(id, x - Math.sin(a) * g, z - Math.cos(a) * g, a); });
  const g = CAR_ME * 0.6; Gm().teleport(x - Math.sin(a) * g, z - Math.cos(a) * g, a); if (bound) cpose('bound', 0, true); }
function cinJourney(S, G) {
  if (S.q.reveal || GG.Cine.on) return; RT.car = null; S.q.caravanOn = 1; S.q.bound = 1; GG.UI.hint(null); GG.Cine.hold = true; // one long cutscene to the market
  const a1 = Math.atan2(LEG1[1][0] - LEG1[0][0], LEG1[1][1] - LEG1[0][1]), m = LEG1[3], a2 = Math.atan2(LEG1[4][0] - m[0], LEG1[4][1] - m[1]);
  const p0 = LEG1[0], h0 = hAt(p0[0], p0[1]), hm = hAt(m[0], m[1]);
  const jx = () => Gm().P.x, jz = () => Gm().P.z;
  if (S.q.night) { afterNight(S, G); return; }
  cine([
    { fn: () => stageCar(p0[0], p0[1], a1, true), cam: [p0[0] + 9, h0 + 5, p0[1] - 8], cam2: [p0[0] + 6, h0 + 3.6, p0[1] - 5], look: [p0[0] - 4, h0 + 1, p0[1] + 4], dur: 6, music: 'j_caravan',
      t: '요셉은 줄에 묶인 채, 이스마엘 대상을 따라 남쪽으로 끌려갔습니다.', ref: '창세기 37:28' },
    { cam: () => [jx() + 1.8, hAt(jx(), jz()) + 1.4, jz() + 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.3, jz()], dur: 4.5, fov: 0.62, n: '이스마엘 상인', t: '걸어라, 히브리 아이. 해 지기 전에 우물에 닿아야 한다.' },
    { fn: () => stageCar(m[0], m[1], a2, true), cam: [m[0] - 30, hm + 14, m[1] - 10], cam2: [m[0] - 22, hm + 10, m[1] - 4], look: [m[0], hm + 1, m[1]], dur: 6, t: '헤브론의 푸른 언덕은 멀어지고, 끝없는 광야가 펼쳐졌습니다.' },
    { fn: () => { const P = Gm().P; P.face = a2 + Math.PI * 0.85; }, cam: () => [jx() - Math.sin(a2) * 2.2 + 0.6, hAt(jx(), jz()) + 1.5, jz() - Math.cos(a2) * 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.45, jz()], dur: 5.5, fov: 0.6,
      n: '요셉', t: '(뒤를 돌아본다) …저 산 너머가 헤브론인데. 아버지…', e: 'sad' },
  ], () => cinCaravanNight(S, G, () => afterNight(S, G)), { noSkip: false });
}
function afterNight(S, G) {
  const a = LEG2[0], b = LEG2[1], ang = Math.atan2(b[0] - a[0], b[1] - a[1]), h = hAt(a[0], a[1]);
  cine([{ fn: () => stageCar(a[0], a[1], ang, true), cam: [a[0] + 14, h + 6, a[1] - 6], cam2: [a[0] + 8, h + 4, a[1] - 2], look: [a[0] - 2, h + 1, a[1] + 3], dur: 5.5, music: 'j_caravan', t: '여러 날을 걸어 광야를 건넜습니다. 모래 너머로 초록빛이 비치기 시작했습니다.' }],
    () => { const g = SPOTS.egyptGate; stageCar(g[0] + 1, g[1] - 4, ang, true); cinReveal(S, G, () => { stageCar(SPOTS.market[0] + 6, SPOTS.market[1] - 9, -0.4, true); S.q.reveal = 1; Gm().checkStep(); }); });
}
function cinCaravanNight(S, G, then) {
  const [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  RT.car = null; fade(() => { S.time = Math.floor(S.time / 24) * 24 + 20.6; place('ishmael', cx + 2, cz + 1.4, -2.2, { sit: true }); place('midian', cx - 1.8, cz + 1.8, 2.4, { sit: true }); place('ishBoy', cx + 1.6, cz - 2.2, -0.6);
    ['camel1', 'camel2', 'camel3'].forEach((id, i) => place(id, cx + 6 + i * 2.6, cz - 3 + i, -1.2)); G.teleport(cx - 0.4, cz - 2.6, 0.2); cpose(null); G.P.sit = true; },
  () => cine([
    { cam: [cx - 9, h + 3.6, cz - 7], cam2: [cx - 6, h + 2.4, cz - 4.6], look: [cx, h + 0.8, cz], dur: 6, t: '광야의 밤. 대상은 길가에 불을 피우고 쉬었습니다.', music: 'j_night' },
    { fn: () => walkTo('ishBoy', cx + 0.6, cz - 2.8, 1.2, n => { face('ishBoy', G.P.x, G.P.z); n.act = 'present'; }), cam: [cx + 2.4, h + 1.1, cz - 4.4], look: [cx - 0.2, h + 0.8, cz - 2.4], dur: 5, n: '대상의 아이', t: '…물. 마셔.', e: 'tender' },
    { cam: [cx - 2.6, h + 1.0, cz - 3.4], look: [cx + 0.2, h + 0.9, cz - 2.6], dur: 4, n: '요셉', t: '…고마워.', e: 'weary' },
    { fn: () => { const n = G.npc('ishBoy'); if (n) { n.act = null; n.sit = true; } }, cam: [cx + 1.8, h + 1.0, cz - 1.0], look: [cx - 0.2, h + 0.7, cz - 2.6], dur: 5, n: '대상의 아이', t: '너 어디서 왔어?' },
    { cam: [cx - 1.6, h + 0.9, cz - 4.0], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, n: '요셉', t: '헤브론. 저 산 너머에… 아버지가 계셔. 동생도.', e: 'sad' },
    { cam: [cx + 2.0, h + 0.9, cz - 3.6], look: [cx + 0.6, h + 0.7, cz - 2.8], dur: 7, n: '대상의 아이', t: '애굽에 가면 팔린대. 아빠가 그러는데, 너는 은 스물 줬으니까 애굽에서는 더 받을 거래.' },
    { cam: [cx - 0.8, h + 0.6, cz - 3.6], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 4.5, t: '요셉은 대답하지 못했습니다.' },
    { cam: [cx - 0.2, h + 0.5, cz - 3.2], look: [cx - 6, h + 30, cz + 14], dur: 8, n: '요셉', t: '하나님… 아버지가 들려주셨던 벧엘 이야기를 기억해요. 형을 피해 도망치던 밤, 돌을 베고 누운 아버지에게 하나님이 말씀하셨다고.', e: 'pray' },
    { cam: [cx + 0.6, h + 0.7, cz - 4.2], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 8, n: '요셉', t: '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며…」', ref: '창세기 28:15', e: 'pray' },
    { cam: [cx - 1.2, h + 0.8, cz - 3.4], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, fov: 0.6, n: '요셉', t: '저도… 지켜 주실 거죠? 이렇게 멀리 가도요.', e: 'cry' },
    { cam: [cx, h + 2, cz], cam2: [cx, h + 3, cz], look: [cx + 10, h + 40, cz - 30], look2: [cx - 10, h + 44, cz - 30], dur: 8, t: '그날 밤 광야의 하늘에도, 헤브론에서 보던 그 별들이 떠 있었습니다.', fadeOut: 2 },
    { black: true, title: '여러 날 후', sub: '광야를 건너 애굽으로', cam: [cx, h + 2, cz], look: [cx, h, cz - 3], dur: 3.6,
      fn: () => { G.P.sit = false; S.q.night = 1; S.day += 4; S.time = Math.floor(S.time / 24) * 24 + 8.4; if (!then) caravanStart(S, G, false); } },
  ], () => { GG.Game.musicOverride = null; G.UI.quest(); if (then) then(); }));
}
function cinReveal(S, G, then) {
  S.q.reveal = 1; const P = G.P, h = P.y;
  cine([
    { cam: [P.x - 1.5, h + 2.4, P.z + 3.5], cam2: [P.x - 20, h + 32, P.z + 12], look: [P.x - 10, h + 1, P.z - 3], look2: [-92, 0, 80], dur: 8, music: 'j_egypt', title: '애굽', sub: '나일 강의 땅',
      t: '광야가 끝나는 곳에, 끝없이 푸른 땅이 펼쳐졌습니다.' },
    { cam: [-20, 30, 120], cam2: [-60, 26, 70], look: [-110, 4, 20], look2: [-180, 20, -140], dur: 9, t: '강을 따라 늘어선 종려나무와 푸른 밭, 흰 벽의 집들. 그리고 저 멀리, 하늘을 찌르는 거대한 돌산이 서 있었습니다.' },
    { cam: [P.x - 1.6, h + 1.6, P.z - 2.4], look: [P.x, h + 1.5, P.z], dur: 5, fov: 0.65, n: '요셉', t: '여기가… 애굽.', e: 'awe' },
  ], () => { G.UI.quest(); if (then) then(); });
}
// c1_market · sold again (창 37:36; 39:1)
function cinMarket(S, G) {
  if (GG.Cine.hold) setTimeout(() => { GG.Cine.hold = false; }, 0); // the market scene ends the road-to-Egypt chain
  const bx = SPOTS.block[0], bz = SPOTS.block[1] - 2, bh = hAt(bx, bz) + 0.9, mx = SPOTS.market[0], mz = SPOTS.market[1];
  const crowd = [];
  cine([
    { fn: () => { S.q.caravanOn = 0; S.q.bound = 1; RT.car = null; G.teleport(bx + 0.6, bz + 0.5, 0); G.P.y = bh; cpose('bound', 0, true); place('auctioneer', bx - 1.3, bz + 0.2, 0.4);
        place('ishmael', bx + 3.2, bz + 2.2, -0.6); for (let i = 0; i < 7; i++) { const id = 'mkC' + i; if (!G.npc(id)) G.spawnNPC({ id, name: '구경꾼', look: [LOOK.farmer, LOOK.woman, LOOK.official, LOOK.elder, LOOK.farmerThin, LOOK.maid, LOOK.priest][i], x: bx - 4 + i * 1.4, z: bz + 4 + (i % 3) * 0.9, face: Math.PI + (i - 3) * 0.12, noTalk: true, noTag: true, show: s => s.step === 'c1_market' }); crowd.push(id); } },
      cam: [bx + 2, bh + 2, bz + 11], cam2: [bx + 1, bh + 1.4, bz + 8], look: [bx, bh + 1.2, bz], dur: 7, sfx: 'crowd', music: 'j_egypt',
      t: '애굽의 장터. 이스마엘 상인들은 요셉을 노예 상인에게 넘겼습니다.' },
    { cam: [bx - 3, bh + 0.8, bz + 3], look: [bx - 1.3, bh + 1.6, bz + 0.2], dur: 6, fn: () => emote('auctioneer', 'wave', 4), ...EG('auctioneer', '헴! 헴 네페르! 가나안의 젊은 종이오!', '종이오! 좋은 종! 가나안에서 온 젊은 종이오!', 'shout') },
    { cam: [bx + 2.6, bh + 0.6, bz + 2.2], look: [bx + 0.6, bh + 1.3, bz + 0.5], dur: 6, fov: 0.62, t: '사람들이 요셉의 팔을 만져 보고, 이를 들여다보고, 값을 불렀습니다. 요셉은 땅만 내려다보았습니다.' },
    { fn: () => { place('potiphar', mx + 5, mz + 4.5, -2.2); walkTo('potiphar', bx + 1.2, bz + 3.4, 1.9, n => face('potiphar', bx, bz)); G.sfx('crowd'); },
      cam: [bx - 2, bh + 1.4, bz + 1], look: [mx + 8, hAt(mx, mz) + 1.4, mz + 5], dur: 6, n: '애굽 상인', t: '(속삭이며) 비켜라, 비켜! 친위대장 보디발 나리시다!', e: 'whisper' },
    { cam: [bx + 2.8, bh + 0.4, bz + 4.2], look: [bx + 1.2, hAt(bx, bz) + 1.6, bz + 3.4], dur: 6, n: '보디발', t: '…눈빛이 맑구나. 종의 눈이 아니야. 이름이 무엇이냐.', e: 'calm' },
    { cam: [bx + 1.2, bh + 0.6, bz + 3.2], look: [bx + 0.6, bh + 1.4, bz + 0.5], dur: 5, n: '요셉', t: '요셉… 히브리 사람 요셉입니다.', e: 'weary' },
    { cam: [bx - 0.4, bh + 0.4, bz + 4.4], look: [bx + 1.2, hAt(bx, bz) + 1.6, bz + 3.4], dur: 5, n: '보디발', t: '가나안 말을 하는구나. 좋다. 내가 사겠다.', fn: () => G.sfx('coins') },
    { cam: [bx + 8, bh + 5, bz + 12], cam2: [bx + 6, bh + 9, bz + 16], look: [bx, bh, bz], dur: 8, t: '요셉이 이끌려 애굽에 내려가매, 바로의 신하 친위대장 애굽 사람 보디발이 그를 거기로 데려간 이스마엘 사람의 손에서 그를 사니라.', ref: '창세기 39:1', fadeOut: 1.6 },
    { black: true, title: '2장 · 보디발의 집', sub: '창세기 39:1–20', cam: [bx, bh + 2, bz + 4], look: [bx, bh, bz], dur: 4,
      fn: () => { crowd.forEach(id => G.removeNPC(id)); S.q.bound = 0; cpose(null); } },
  ], () => fade(() => { G.teleport(SPOTS.pGate[0], SPOTS.pGate[1] - 5, Math.PI); S.time = Math.floor(S.time / 24) * 24 + 16.4; G.go('c2_arrive'); }, () => { GG.Game.musicOverride = null; }));
}

// ------------------------------------------------------------------ 2장 · Potiphar's house
WORDS.irp = ['이르프 · 포도주', '포도주. 잔칫상에 빠지지 않는 말이에요.', 'stew']; WORDS.dab = ['데브 · 무화과', '무화과. 보디발 나리가 제일 좋아하는 과일이에요.', 'berry'];
function ledgerPuzzle(S, G) {
  const sh = S.q.shelf || {};
  say([N('scribe', '내 장부에는 이렇게 적혀 있네. 포도주 열넷, 기름 열둘, 곡식 스물둘, 무화과 아홉.', '', 'weary'),
    { n: '요셉', t: `내가 센 것과 다른 것은? (포도주 ${sh.wine} · 기름 ${sh.oil} · 곡식 ${sh.grain} · 무화과 ${sh.figs})`, choices: [
      { t: '포도주', ok: false, fb: '포도주는 열넷. 장부와 같아요.' }, { t: '기름과 무화과', ok: true }, { t: '곡식', ok: false, fb: '곡식 자루는 스물둘. 장부와 같아요.' }, { t: '모두 맞아요', ok: false, fb: '다시 한 번 장부와 선반의 수를 견주어 보세요.' }] },
    N('scribe', '기름이 셋, 무화과가 셋 모자란다고…? 그럼 누가 훔쳐 갔단 말인가!', '', 'fear'),
    { n: '요셉', t: '모자란 기름 셋과 무화과 셋은 어디로 갔을까?', choices: [
      { t: '"지난 잔치 때 부엌으로 내간 것을 장부에 적지 않으셨어요. 부엌에서 기름병 셋과 무화과 바구니 셋을 보았어요."', ok: true },
      { t: '"누군가 훔쳐 간 게 틀림없어요."', ok: false, fb: '증거 없이 사람을 의심하면 안 돼요. 요셉은 오늘 부엌에서 일하며 본 것을 떠올렸습니다.' }] },
    N('scribe', '아이고! 맞다, 지난번 잔치 때…! 내 정신 좀 봐. 히브리 청년, 자네는 눈이 밝기도 하구먼.', '', 'laugh'),
    N('potiphar', '…장부가 맞았다고? 저 종이 셈을 했단 말이냐.', '', 'awe')], () => tick(S, 'ledger'));
}
function cinPotiphar(S, G, next) {
  const hx = -28, hz = 41.6, hh = hAt(hx, hz);
  fade(() => { S.time = Math.floor(S.time / 24) * 24 + 17.6; place('potiphar', -28, 39.4, 0, { sit: true }); G.teleport(-28, 43.4, Math.PI); }, () => cine([
    { cam: [hx + 4, hh + 2, hz + 6], cam2: [hx + 2.6, hh + 1.6, hz + 4.4], look: [hx, hh + 1.1, hz - 1], dur: 6, music: 'j_house', t: '여호와께서 요셉과 함께 하시므로 그가 형통한 자가 되어 그의 주인 애굽 사람의 집에 있으니', ref: '창세기 39:2' },
    { cam: [hx - 1.8, hh + 1.2, hz + 1.4], look: [hx, hh + 1.0, hz - 2.2], dur: 6, n: '보디발', t: '히브리 청년. 네가 손대는 일마다 잘된다고 집안이 떠들썩하더구나. 우물물이 맑아지고, 소가 살찌고, 이제는 장부까지.' },
    { cam: [hx + 1.6, hh + 1.3, hz - 0.4], look: [-28, hh + 1.3, 43.4], dur: 6, n: '요셉', t: '나리, 제가 한 것이 아닙니다. 제 하나님 여호와께서 함께 하셔서 그렇습니다.', e: 'calm', fn: () => cpose('bow', 1.6) },
    { cam: [hx - 1.4, hh + 1.1, hz + 1.8], look: [hx, hh + 1.0, hz - 2.2], dur: 7, t: '그의 주인이 여호와께서 그와 함께 하심을 보며, 또 여호와께서 그의 범사에 형통하게 하심을 보았더라.', ref: '창세기 39:3' },
    { cam: [hx + 2, hh + 1.4, hz + 2.8], look: [hx, hh + 1.1, hz - 1.6], dur: 7, n: '보디발', t: '이레 뒤에 바로의 궁에서 손님들이 온다. 잔치 시중은 네가 들어라. 애굽 말로 주문을 받아야 할 게다.' },
  ], next));
}
const WANT = { guest1: { eg: '이르프!', ko: '포도주!', item: '포도주 항아리', prop: 'jar', arms: true }, guest2: { eg: '무… 무 네페르.', ko: '물… 좋은 물.', item: '물동이', prop: 'jarHead' },
  guest3: { eg: '타! 타 네페르!', ko: '빵! 좋은 빵!', item: '빵 바구니', prop: 'basket' }, potiphar: { eg: '데브.', ko: '무화과.', item: '무화과 쟁반', prop: 'basket' } };
const WANT_ORDER = ['guest1', 'guest2', 'guest3', 'potiphar'];
function banquetStart(S, G, re) {
  const go = () => { S.q.served = S.q.served || 0; S.q.want = WANT_ORDER[S.q.served]; S.q.carry = null; G.P.carry = null; askNext(S); };
  if (re) { go(); return; }
  fade(() => { S.time = Math.floor(S.time / 24) * 24 + 19.3; G.teleport(-37.2, 45.4, 2.6); }, () => say([N('ameni', '요셉, 잘 들어라. 손님들은 애굽 말로만 주문할 게다. 「이르프」는 포도주, 「데브」는 무화과란다.', '', 'whisper'),
    N('ameni', '무와 타는 알지? 시중 상에서 알맞은 것을 들고 가서 손님께 드려라.', '', 'tender')], () => { learn('irp'); learn('dab'); go(); }));
}
// v16.6: the order stays above the guest's head until it is served, and the table shows each dish with its Egyptian word —
// you read the order and pick the matching dish instead of guessing
function askNext(S) { const w = WANT[S.q.want]; if (!w) return; const id = S.q.want; const keep = () => { if (Gm().S().step === 'c2_banquet' && Gm().S().q.want === id && !GG.UI.busy()) bubble(id, w.eg, 6); }; setTimeout(keep, 600); clearInterval(RT.ordT); RT.ordT = setInterval(() => { if (Gm().S().step !== 'c2_banquet' || Gm().S().q.want !== id) { clearInterval(RT.ordT); return; } keep(); }, 5500); GG.UI.quest(); }
function serveTable(S, G) {
  const keys = WANT_ORDER.map(k => WANT[k].item); keys.sort();
  const w0 = WANT[S.q.want], EGW = { '포도주 항아리': '이르프', '물동이': '무', '빵 바구니': '타', '무화과 쟁반': '데브' };
  GG.UI.choose(`무엇을 들고 갈까? · 지금 주문: 「${w0 ? w0.eg : '…'}」`, keys.map(k => `${k} · 「${EGW[k]}」`), i => { const it = keys[i]; const w = Object.values(WANT).find(x => x.item === it);
    S.q.carry = it; G.P.carry = w.prop; G.P.carryArms = !!w.arms; G.sfx('pickup'); G.UI.quest(); });
}
for (const id of WANT_ORDER) steps.c2_banquet.talk = Object.assign(steps.c2_banquet.talk || {}, { [id]: (S, G) => serveGuest(S, G, id) });
function serveGuest(S, G, id) {
  const w = WANT[id];
  if (id !== S.q.want) { say([N(id === 'potiphar' ? 'potiphar' : id, id === 'potiphar' ? '손님들부터 모셔라.' : '…나는 아직 괜찮다.')]); return; }
  if (!S.q.carry) { say([EG(id, w.eg, '', 'calm'), T('무엇을 원하는 걸까? 시중 상으로 가서 알맞은 것을 들고 오세요.')]); return; }
  if (S.q.carry !== w.item) { const had = S.q.carry; S.q.carry = null; G.P.carry = null; G.UI.quest(); say([EG(id, '이아! ' + w.eg, '아니! ' + w.ko, 'angry'), T(`가져온 것은 ${had}. 손님은 다른 것을 원해요. 시중 상으로 돌아가 다시 골라 보세요.`)]); return; }
  G.P.carry = null; S.q.carry = null; G.sfx(w.prop === 'jar' || w.prop === 'jarHead' ? 'pour' : 'pickup'); act('pick', 0.8); S.q.served++;
  const praise = { guest1: [EG('guest1', '네페르! 이르프 네페르!', '좋다! 좋은 포도주로군!', 'happy')], guest2: [N('guest2', '…히브리 사람이 따른 물이라. 그래도 정성스럽군.', '', 'cold')],
    guest3: [EG('guest3', '타 네페르! 하하!', '좋은 빵이다! 하하!', 'laugh')], potiphar: [N('potiphar', '…데브. 내가 무화과를 좋아하는 걸 어찌 알았느냐.', '', 'tender')] }[id];
  say(praise, () => { if (S.q.served < 4) { S.q.want = WANT_ORDER[S.q.served]; askNext(S); } else { S.q.want = null; G.UI.quest(); G.checkStep(); } });
}
function banquetEnd(S, G, next) {
  say([N('guest1', '보디발, 이 종은 어디서 구했소? 애굽 말도 서툰 이방인이 손님 마음을 이리 잘 읽다니. 바로의 궁에도 이런 자는 드물 거요.', '', 'happy'),
    N('potiphar', '…요셉. 앞으로 나오너라.'),
    N('potiphar', '오늘부터 너는 내 집의 총무다. 내 집과 내 모든 소유를 네 손에 맡긴다.', '창세기 39:4'),
    T('요셉이 그의 주인에게 은혜를 입어 섬기매, 그가 요셉을 가정 총무로 삼고 자기의 소유를 다 그의 손에 위탁하니', '창세기 39:4'),
    N('ameni', '(눈시울을 붉히며) …네 하나님이 정말 너와 함께 계시는구나.', '', 'tender')], () => { G.setOutfit('josephSteward'); G.sfx('fanfare'); S.q.carry = null; next(); });
}
// c2_manage
function assignPuzzle(S, G) {
  GG.UI.puzzle({ title: '일꾼들에게 일 맡기기', hint: '왼쪽의 일꾼을 고르고, 그 사람에게 가장 잘 맞는 일(오른쪽)을 고르세요',
    syms: [{ id: 'cook', t: '요리사 헤누 · 혀가 예민해 맛을 잘 본다', m: 'feast', h: '헤누는 맛을 잘 봐요. 음식과 관계된 일이 좋겠지요?' },
      { id: 'gard', t: '정원지기 세티 · 물길을 손금 보듯 안다', m: 'water', h: '세티는 물길을 잘 알아요.' },
      { id: 'boy', t: '소 치는 아이 파이 · 소들이 졸졸 따른다', m: 'cattle', h: '소들이 따르는 아이에게는…' },
      { id: 'weave', t: '베 짜는 여인 타뮈 · 손끝이 섬세하다', m: 'linen', h: '섬세한 손끝은 무엇을 짜는 데 쓰일까요?' },
      { id: 'scr', t: '서기관 이피 · 글과 셈을 안다 (눈은 침침하다)', m: 'ledger', h: '글과 셈을 아는 사람에게는 기록을 맡겨요. 대신 곳간은 함께 세어 주면 되지요.' }],
    means: [{ id: 'water', t: '밭과 정원 물대기' }, { id: 'feast', t: '잔치 음식 준비' }, { id: 'ledger', t: '곳간 기록 (요셉이 함께 셈)' }, { id: 'cattle', t: '외양간 돌보기' }, { id: 'linen', t: '세마포 짜기' }] },
  () => { say([T('일꾼들은 저마다 잘하는 일을 맡자 신이 나서 일했습니다. 보디발의 집이 하루가 다르게 달라졌습니다.')], () => tick(S, 'assign')); });
}
function quarrel(S, G) {
  place('cook', -16, 56.8, -1.2); place('gardener', -18.6, 56.2, 1.2);
  say([N('cook', '연못 물을 부엌에 써야겠소! 잔치가 코앞인데 우물만으로는 모자라!', '', 'angry'), N('gardener', '안 되오! 연못 물을 퍼 가면 연꽃이 다 말라 죽소! 마님이 아끼시는 연꽃이란 말이오!', '', 'angry'),
    { n: '요셉', t: '어떻게 해결할까?', choices: [
      { t: '"아침에는 부엌이 우물물을 먼저 쓰고, 연못은 세티가 돌보세요. 그리고 샤두프로 수로 물을 길어 올려 연못을 채웁시다."', ok: true },
      { t: '"헤누, 요리가 더 중요하니 연못 물을 쓰세요."', ok: false, fb: '세티의 얼굴이 굳었습니다. 한쪽 편만 들면 다툼은 끝나지 않아요.' },
      { t: '"둘 다 그만! 오늘은 아무도 물을 쓰지 마시오."', ok: false, fb: '그러면 잔치도 정원도 망가져요. 둘 다 살리는 길은 없을까요?' }] },
    N('gardener', '샤두프로…? 아, 동쪽 담 곁의 그 두레박 장대 말이오? 그거면 수로 물을 금방 퍼 올리겠군!', '', 'happy'), N('cook', '흠… 아침에 우물을 먼저 쓴다면야. 좋소, 총무.', '', 'calm')],
  () => { const c = G.npc('cook'), g = G.npc('gardener'); if (c) { G.npcTo('cook', -10.8, 43.8, Math.PI, false); c.act = 'gather'; } if (g) { G.npcTo('gardener', -15.4, 60.6, -1.6, false); g.act = 'water'; } tick(S, 'quarrel'); });
}
steps.c2_manage.talk.gardener = steps.c2_manage.talk.gardener || ((S, G) => { if (S.q.quarrel) return false; quarrel(S, G); });
function cinBless(S, G, next) {
  cine([
    { cam: [16, hAt(6, 44) + 6, 52], cam2: [12, hAt(6, 44) + 4, 50], look: [6, hAt(6, 44) + 0.6, 44], dur: 7, music: 'j_house', hour: 9.5, t: '그가 요셉에게 자기의 집과 그의 모든 소유물을 주관하게 한 때부터, 여호와께서 요셉을 위하여 그 애굽 사람의 집에 복을 내리시므로', ref: '창세기 39:5',
      fn: () => { const pl = S.plots; for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) pl['pflax:' + i + ',' + j] = { s: 2, c: 'flax', st: 3, g: 0, w: 1 }; G.ENT.plotsDirty = true; } },
    { cam: [16, hAt(9, 76) + 3, 84], look: [9, hAt(9, 76) + 0.8, 76], dur: 6, t: '여호와의 복이 그의 집과 밭에 있는 모든 소유에 미친지라.', ref: '창세기 39:5' },
    { cam: [-20, hAt(-28, 41) + 2.4, 48], look: [-28, hAt(-28, 41) + 1.2, 40], dur: 7, t: '주인이 그의 소유를 다 요셉의 손에 위탁하고, 자기가 먹는 음식 외에는 간섭하지 아니하였더라.', ref: '창세기 39:6' },
    { fn: () => place('wife', -20.6, 61.6, Math.PI), cam: [-23, hAt(-20, 60) + 1.5, 64.5], look: [-20.6, hAt(-20, 60) + 1.5, 61.6], dur: 6, fov: 0.6, t: '요셉은 용모가 빼어나고 아름다웠더라.', ref: '창세기 39:6' },
    { cam: [-19.6, hAt(-20, 60) + 1.6, 63.4], look: [-28, hAt(-28, 44) + 1.2, 44], dur: 6, fov: 0.55, t: '그리고 그 모습을, 연못가에서 한 여인이 오래도록 바라보고 있었습니다.' },
  ], next);
}
// c2_tempt3 → the garment (창 39:11–12)
function cinGrab(S, G) {
  const tx = -22.5, tz = 41.6, th = hAt(tx, tz);
  cine([
    { fn: () => { G.teleport(tx, tz, Math.PI); cpose('pick', 0, true); place('wife', -31, 39.6, 1.2); }, cam: [tx + 3.6, th + 1.7, tz + 3.2], look: [tx, th + 1, tz - 0.6], dur: 6, music: 'j_dread',
      t: '집 안은 고요했습니다. 요셉은 대청의 장부를 정리하고 있었습니다.' },
    { fn: () => walkTo('wife', tx - 1.1, tz + 0.5, 1.1, () => face('wife', tx, tz)), cam: [tx - 4, th + 1.5, tz + 2.6], look: [tx - 2.4, th + 1.3, tz + 0.2], dur: 6, n: '보디발의 아내', t: '요셉… 아무도 없어. 오늘은 아무도.', e: 'whisper' },
    { fn: () => { cpose(null); G.P.face = -1.5; }, cam: [tx + 1.6, th + 1.5, tz + 1.8], look: [tx - 1, th + 1.4, tz + 0.4], dur: 5, fov: 0.62, n: '보디발의 아내', t: '나와 동침하자.', ref: '창세기 39:12', e: 'whisper' },
    { fn: () => { emote('wife', 'grabCloth', 3); }, cam: [tx - 0.4, th + 1.3, tz + 2.6], look: [tx - 0.6, th + 1.2, tz + 0.4], dur: 3.5, n: '요셉', t: '안 됩니다!', e: 'shout', shake: 0.3, shakeDecay: 0.8 },
    { fn: () => { G.sfx('rip'); G.setOutfit('josephFled'); S.q.robe = 1; G.P.face = 0.2; cpose(null); }, cam: [tx - 3.2, th + 1.6, tz + 3.4], look: [tx - 0.8, th + 1.1, tz + 0.6], dur: 6, shake: 0.4, shakeDecay: 1.2,
      t: '그 여인이 그의 옷을 잡고 동침하자 하니, 요셉이 자기의 옷을 그 여인의 손에 버리고 밖으로 나가매', ref: '창세기 39:12' },
  ], () => G.go('c2_flee'));
}
// c2_flee done → accused and imprisoned (창 39:13–20)
function cinAccuse(S, G, next) {
  const hx = -28, hz = 41.6, hh = hAt(hx, hz), gx = SPOTS.pGate[0], gz = SPOTS.pGate[1], gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.empty = 0; place('wife', -27, 43, 0); emote('wife', 'cheer', 6); [['cook', -31, 46], ['gardener', -24.6, 46.4], ['maid', -29.4, 47.6], ['neb', -26.2, 48], ['ameni', -32.4, 47]].forEach(([id, x, z]) => place(id, x, z, Math.atan2(-27 - x, 43 - z))); G.teleport(gx + 0.6, gz + 2.6, 0); },
      cam: [hx + 5, hh + 2.2, hz + 9], cam2: [hx + 3.6, hh + 1.8, hz + 7], look: [-27, hh + 1.3, 44], dur: 6, sfx: 'crowd', t: '그 여인이 요셉이 그의 옷을 자기 손에 버리고 도망하여 나감을 보고, 그 여인의 집 사람들을 불러서', ref: '창세기 39:13–14' },
    { cam: [-25.2, hh + 1.5, 46], look: [-27, hh + 1.5, 43], dur: 9, fov: 0.65, n: '보디발의 아내', t: '보라! 주인이 히브리 사람을 우리에게 데려다가 우리를 희롱하게 하는도다. 그가 나와 동침하고자 내게로 들어오므로 내가 크게 소리 질렀더니, 그가 그의 옷을 내게 버려두고 도망하여 나갔느니라!', ref: '창세기 39:14–15', e: 'shout' },
    { cam: [-33.6, hh + 1.5, 48.6], look: [-32.4, hh + 1.5, 47], dur: 5, fov: 0.6, n: '늙은 종 아메니', t: '(…요셉이 그럴 리가 없어. 그 아이는…)', e: 'whisper' },
    { hour: 18.8, fn: () => { place('potiphar', gx, gz + 4, Math.PI); walkTo('potiphar', -27.4, 45.6, 1.6, () => face('potiphar', -27, 43)); place('pg1', gx - 1.4, gz + 3.6, Math.PI); place('pg2', gx + 1.4, gz + 3.6, Math.PI); G.npcShow('pg1', true); G.npcShow('pg2', true); },
      cam: [gx + 3, gh + 2, gz - 6], look: [gx, gh + 1.3, gz + 1], dur: 6, t: '그의 옷을 곁에 두고 자기 주인이 집으로 돌아오기를 기다려', ref: '창세기 39:16' },
    { cam: [-24.6, hh + 1.6, 44.8], look: [-27, hh + 1.5, 43], dur: 8, n: '보디발의 아내', t: '당신이 우리에게 데려온 히브리 종이 나를 희롱하려고 내게로 들어왔으므로, 내가 소리 질러 불렀더니 그가 그의 옷을 내게 버려두고 밖으로 도망하여 나갔나이다.', ref: '창세기 39:17–18', e: 'cry' },
    { cam: [-26.4, hh + 1.6, 47.8], look: [-27.4, hh + 1.6, 45.6], dur: 7, fov: 0.6, t: '주인이 그의 아내가 자기에게 이르기를 「당신의 종이 내게 이같이 행하였다」 하는 말을 듣고 심히 노한지라.', ref: '창세기 39:19' },
    { fn: () => { G.teleport(-27.6, 49.4, Math.PI); cpose(null); }, cam: [-26.2, hh + 1.6, 51.4], look: [-27.6, hh + 1.5, 49.4], dur: 6, t: '요셉은 아무 말도 하지 않았습니다. 무슨 말을 한들, 종의 말을 누가 믿어 줄까요.' },
    { cam: [-28.6, hh + 1.6, 47.6], look: [-27.4, hh + 1.6, 45.6], dur: 6, n: '보디발', t: '……이자를 묶어라. 왕의 옥에 넣어라.', e: 'cold' },
    { fn: () => { G.setOutfit('josephFettered'); S.q.chain = 1; cpose('bound', 0, true); G.sfx('chain'); walkTo('pg1', -28.8, 49.8, 2); walkTo('pg2', -26.4, 49.8, 2); }, cam: [-24, hh + 2, 52], look: [-27.6, hh + 1.2, 49.4], dur: 8,
      t: '요셉의 주인이 그를 잡아 옥에 넣으니, 그 옥은 왕의 죄수를 가두는 곳이었더라. 요셉이 옥에 갇혔으나', ref: '창세기 39:20', fadeOut: 1.6 },
    { black: true, title: '3장 · 왕의 옥', sub: '창세기 39:20–41:14', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4, fn: () => { stage(S, G); } },
    { hour: 21.4, fn: () => { G.teleport(-18.4, -6.2, Math.PI); cpose('bound', 0, true); G.sfx('door'); }, fadeIn: 1.6, music: 'j_prison',
      cam: [-18.4, hAt(-18.4, -6) + 1.6, -1.6], look: [-18.4, hAt(-18.4, -6) + 1.0, -6.4], dur: 8, t: '「그의 발은 차꼬를 차고, 그의 몸은 쇠사슬에 매였으니」', ref: '시편 105:18', sfx: 'chain' },
  ], () => { GG.Game.musicOverride = null; next(); });
}

// ------------------------------------------------------------------ 3장 · the king's prison
NM.prisD = '죄수 네헤시';
npcs.push({ id: 'prisD', name: NM.prisD, look: Object.assign({}, LOOK.prisoner, { skin: 0x7a4a2a, hairStyle: 'bald', beard: null }), x: CELL[3][0], z: CELL[3][1], face: 0, talkR: 4.2,
  show: S => between(S, 'c3_cell', 'c3_charge'), chat: ['나는 곧 풀려난다. 남쪽 마을에 가족이 있지.', '히브리 사람, 너는 왜 그리 평안하냐?'] });
{ const pot = npcs.find(n => n.id === 'potiphar'); const s0 = pot.show; pot.show = S => s0(S) || !!S.q.potPrison; delete pot.sched; delete pot.sit;
  const wf = npcs.find(n => n.id === 'wife'); delete wf.sched; const sc = npcs.find(n => n.id === 'scribe'); delete sc.sched; delete sc.sit;
  BRO.forEach(id => { const b = npcs.find(n => n.id === id); delete b.sit; }); }
const CELL_IDS = ['prisA', 'prisB', 'oldP', 'prisD'];
const PRAY = [-18.4, -8.2];
function windowPray(S, G) {
  const h = hAt(PRAY[0], PRAY[1]);
  if (S.step === 'c3_cell') {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6, n: '요셉', t: '하나님… 저는 아무 잘못도 하지 않았어요.', e: 'pray', music: 'j_prison' },
      { cam: [-19.8, h + 0.9, -6.6], look: [-18.4, h + 1.1, -8.3], dur: 6.5, n: '요셉', t: '구덩이에서도, 종의 숙소에서도… 그리고 이제는 왕의 옥이에요.', e: 'weary' },
      { cam: [-17.4, h + 0.7, -7.0], look: [-18.4, h + 1.15, -8.3], dur: 8, n: '요셉', t: '아버지가 말씀하셨어요. 하나님은 벧엘에서도, 하란에서도, 얍복 강가에서도 함께 계셨다고.', e: 'pray' },
      { cam: [-18.0, h + 1.1, -7.1], look: [-18.4, h + 1.2, -8.3], dur: 6, fov: 0.58, n: '요셉', t: '여기서도… 함께 계신 거죠?', e: 'cry' },
      { cam: [-18.6, h + 0.5, -6.4], cam2: [-18.5, h + 0.7, -6.8], look: [-18.4, h + 2.6, -9.6], look2: [-18.4, h + 1.4, -8.4], dur: 9, music: 'j_hope', each: t => { RT.grace = Math.min(1, t / 6); },
        t: '여호와께서 요셉과 함께 하시고 그에게 인자를 더하사, 그로 하여금 간수장에게 은혜를 받게 하시매', ref: '창세기 39:21' },
    ], () => { cpose(null); RT.grace = 0; G.newDay('옥에서의 아침'); G.go('c3_keeper'); });
  } else {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6.5, n: '요셉', t: '하나님, 술 맡은 관원장이 떠난 지 벌써 한 해가 넘었어요.', e: 'weary' },
      { cam: [-19.8, h + 0.9, -6.6], look: [-18.4, h + 1.1, -8.3], dur: 7, n: '요셉', t: '날마다 문소리가 나면 혹시나 했어요. …이제는 그 문소리가 무서워요.', e: 'sad' },
      { cam: [-18.0, h + 1.1, -7.1], look: [-18.4, h + 1.2, -8.3], dur: 6.5, fov: 0.58, n: '요셉', t: '그래도… 하나님은 저를 잊지 않으셨죠? 사람은 잊어도요.', e: 'cry' },
      { cam: [-18.6, h + 0.5, -6.4], look: [-18.4, h + 2.6, -9.6], dur: 10, each: t => { RT.grace = Math.min(0.7, t / 8); },
        t: '그날 밤 요셉은 원망 대신 감사로 기도를 마쳤습니다. 오늘도 살아 있게 하신 것과, 어린 케티에게 이야기를 들려줄 수 있었던 것과, 늙은 죄수가 웃으며 문을 나선 것을.' },
    ], () => { cpose(null); RT.grace = 0; S.q.wReady = 0; waitNext(S, G); });
  }
}
const GIVE_T = { prisA: ['…고맙다. 너 같은 놈은 처음 본다.', '떡이다! 오늘은 좀 크구나.'], prisB: ['물이다! 살겠다…', '고맙다, 히브리 사람.'], oldP: ['…물… 고맙구나…', '…떡…'], prisD: ['고맙소. 나는 곧 나간다오.', '마지막 떡이로군. 고맙소.'] };
function cellGive(S, G, i) {
  const id = CELL_IDS[i], keeper = S.step === 'c3_keeper';
  if (keeper) { if (S.water < 1) { G.UI.toast('물이 없어요 · 마당의 대야에서 물을 길어 오세요'); return; } S.water--; (S.q.gave = S.q.gave || {})[i] = 1; act('water', 0.7, 'jar'); G.UI.hud(); }
  else { (S.q.fed = S.q.fed || {})[i] = 1; act('pick', 0.7); if (Object.keys(S.q.fed).length >= 4) { G.P.carry = null; } }
  bubble(id, GIVE_T[id][keeper ? 0 : 1], 3); G.UI.quest(); G.checkStep();
}
function fight(S, G) {
  say([N('prisA', '메루 놈이 내 떡을 훔쳐 먹었어!', '', 'angry'), N('prisB', '거짓말! 네가 먼저 내 물을 엎질렀잖아!', '', 'angry'),
    { n: '요셉', t: '어떻게 말릴까?', choices: [
      { t: '"제 몫의 떡을 반씩 나눠 드릴게요. 대신 서로 손을 잡으세요."', ok: true },
      { t: '"간수장께 일러서 둘 다 벌을 받게 하겠어요."', ok: false, fb: '벌은 미움을 키울 뿐이에요. 형제의 미움이 어디까지 갈 수 있는지, 요셉은 누구보다 잘 알았습니다.' },
      { t: '(모른 척한다)', ok: false, fb: '옥중의 일을 맡은 이상, 요셉은 외면할 수 없었습니다.' }] },
    N('prisA', '…네 몫을? 그럼 너는 뭘 먹고.', '', 'awe'), J('저는 괜찮아요. 하나님이 먹이실 거예요.', '', 'tender'),
    N('prisB', '……미안하다, 케티. 물은 내가 실수로 엎은 거야.', '', 'sad'), N('prisA', '…나도 떡 훔친 거 아니라고 소리친 거, 미안하다.', '', 'sad')], () => tick(S, 'fight'));
}
function cinOfficers(S, G) {
  const gx = -30, gz = 14, gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.potPrison = 1; place('potiphar', gx, gz + 3.4, Math.PI); place('cupbearer', gx - 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('baker', gx + 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('pg1', gx - 2.4, gz + 3.2, Math.PI); place('pg2', gx + 2.4, gz + 3.2, Math.PI);
        G.teleport(gx, gz - 4.4, 0); G.sfx('door'); },
      cam: [gx + 5, gh + 2.2, gz - 7], cam2: [gx + 3.6, gh + 1.8, gz - 5.6], look: [gx, gh + 1.3, gz + 2], dur: 7, music: 'j_dread', t: '그 후에 애굽 왕의 술 맡은 자와 떡 굽는 자가 그들의 주 애굽 왕에게 범죄한지라. 바로가 그 두 관원장에게 노하여', ref: '창세기 40:1–2' },
    { cam: [gx - 2.6, gh + 1.5, gz - 1.6], look: [gx, gh + 1.4, gz + 2.4], dur: 6, t: '그들을 친위대장의 집 안에 있는 옥에 가두니, 곧 요셉이 갇힌 곳이라.', ref: '창세기 40:3' },
    { fn: () => walkTo('potiphar', gx, gz - 1.6, 1.4, () => face('potiphar', gx, gz - 4.4)), cam: [gx + 2.4, gh + 1.6, gz - 6], look: [gx, gh + 1.5, gz - 1], dur: 6, n: '보디발', t: '……요셉.', e: 'cold' },
    { cam: [gx - 1.4, gh + 1.6, gz - 0.6], look: [gx, gh + 1.5, gz - 4.4], dur: 4.5, fov: 0.6, n: '요셉', t: '…나리.', e: 'tender' },
    { cam: [gx + 4, gh + 1.4, gz - 3], look: [gx, gh + 1.4, gz - 3], dur: 6, t: '두 사람은 한참 동안 서로를 바라보았습니다. 보디발은 무언가 말하려다 입을 다물었습니다.' },
    { cam: [gx + 1.2, gh + 1.6, gz - 6.2], look: [gx, gh + 1.6, gz - 1.6], dur: 7, n: '보디발', t: '이 두 사람은 바로의 관원장들이다. 네가 이들을 수종 들어라. …네가 늘 그랬듯이, 잘 섬겨라.', ref: '창세기 40:4', e: 'tender' },
    { fn: () => { walkTo('potiphar', gx, gz + 6, 1.6); place('cupbearer', CELL[3][0] - 1.1, CELL[3][1] - 0.2, 0); place('baker', CELL[3][0] + 1.1, CELL[3][1] - 0.4, 0); },
      cam: [CELL[3][0] + 1, hAt(CELL[3][0], -3) + 1.6, -2.4], look: [CELL[3][0], hAt(CELL[3][0], -8) + 1.1, -8], dur: 6, t: '친위대장이 요셉에게 그들을 수종들게 하매 요셉이 그들을 섬겼더라.', ref: '창세기 40:4' },
  ], () => { S.q.potPrison = 0; GG.Game.musicOverride = null; stage(S, G); });
}
// the officers' dreams (창 40:5–19)
const DREAM = { x: -78, z: -196 };
function dreamShots(kind, lines) { const h = hAt(DREAM.x, DREAM.z);
  return lines.map((l, i) => Object.assign({ cam: [DREAM.x + 4.4 - i * 1.2, h + 1.6 + i * 0.2, DREAM.z + 4.2 - i * 0.6], cam2: [DREAM.x + 3.6 - i * 1.2, h + 1.8 + i * 0.25, DREAM.z + 3.4 - i * 0.6], look: [DREAM.x, h + 1.2, DREAM.z], dur: 6.5,
    each: t => { RT.dreamK = Math.min(1, (i + t / 6.5) / lines.length * 1.1); } }, l, i === 0 ? { fn: () => { RT.dreamFx = kind; RT.dreamK = 0; }, fadeIn: 1.2, music: 'j_dream' } : {})); }
function cupDream(S, G) {
  say([J('나리들, 오늘은 어찌하여 근심 빛이 있나이까?', '창세기 40:7', 'tender'), N('cupbearer', '우리가 꿈을 꾸었으나 이를 해석할 자가 없도다.', '창세기 40:8', 'sad'),
    ...(S.flags.char === 'trust' ? [N('cupbearer', '자네가 원망 없이 지내는 걸 보니, 이 꿈 이야기를 털어놓아도 될 것 같네.', '', 'tender')] : S.flags.char === 'protest' ? [N('cupbearer', '자네도 억울하다 하지 않았나. 같은 처지니 속을 털어놓겠네.', '', 'sad')] : []),
    { n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '"해석은 하나님께 있지 아니하니이까? 청하건대 내게 이르소서."', ok: true, ref: '창세기 40:8' },
      { t: '"제가 꿈을 잘 풉니다. 말씀해 보세요."', ok: false, fb: '요셉은 알고 있었습니다. 꿈을 푸는 지혜는 자기 것이 아니라 하나님께 있다는 것을.' }] },
    J('해석은 하나님께 있지 아니하니이까? 청하건대 내게 이르소서.', '창세기 40:8')], () => cine(dreamShots('vine', [
    { n: '술 맡은 관원장', t: '꿈에 보니 내 앞에 포도나무가 있는데, 그 나무에 세 가지가 있고', ref: '창세기 40:9–10' },
    { n: '술 맡은 관원장', t: '싹이 나서 꽃이 피고, 포도송이가 익었고', ref: '창세기 40:10' },
    { n: '술 맡은 관원장', t: '내 손에 바로의 잔이 있기로, 내가 포도를 따서 그 즙을 바로의 잔에 짜서, 그 잔을 바로의 손에 드렸노라.', ref: '창세기 40:11', fadeOut: 1.2 }]),
  () => { RT.dreamFx = null; GG.Game.musicOverride = null; say([
    { n: '요셉', t: '세 가지는 무엇을 뜻할까?', choices: [{ t: '사흘', ok: true }, { t: '세 해', ok: false, fb: '포도나무는 한 꿈 안에서 금세 자라 열매를 맺었어요. 아주 짧은 때예요.' }, { t: '세 사람', ok: false, fb: '가지가 자라 열매 맺기까지의 「때」를 생각해 보세요.' }] },
    J('그 해석이 이러하니, 세 가지는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 들고 당신의 전직을 회복시키리니, 당신이 이전에 술 맡은 자가 되었을 때에 하던 것 같이 바로의 잔을 그의 손에 드리게 되리이다.', '창세기 40:12–13'),
    N('cupbearer', '…정말인가? 정말 그렇게 된단 말인가!', '', 'happy'),
    J('당신이 잘 되시거든 나를 생각하고 내게 은혜를 베풀어서, 내 사정을 바로에게 아뢰어 이 집에서 나를 건져 주소서.', '창세기 40:14', 'urgent'),
    J('나는 히브리 땅에서 끌려온 자요, 여기서도 옥에 갇힐 일은 행하지 아니하였나이다.', '창세기 40:15', 'sad'),
    N('cupbearer', '물론이지! 내가 반드시 바로께 아뢰겠네. 이 은혜를 어찌 잊겠는가!', '', 'happy')], () => tick(S, 'cupDone')); }));
}
function bakerDream(S, G) {
  say([N('baker', '(해석이 좋은 것을 보고) 나도 꿈에 보니…', '창세기 40:16')], () => cine(dreamShots('baskets', [
    { n: '떡 굽는 관원장', t: '흰 떡 세 광주리가 내 머리에 있고', ref: '창세기 40:16' },
    { n: '떡 굽는 관원장', t: '맨 윗광주리에 바로를 위하여 만든 각종 구운 음식이 있는데', ref: '창세기 40:17' },
    { n: '떡 굽는 관원장', t: '새들이 내 머리의 광주리에서 그것을 먹더라.', ref: '창세기 40:17', fadeOut: 1.2 }]),
  () => { RT.dreamFx = null; GG.Game.musicOverride = null; say([
    T('요셉의 얼굴이 굳어졌습니다. 하나님이 보이신 뜻은 좋은 소식이 아니었습니다.'),
    { n: '요셉', t: '어떻게 할까?', choices: [{ t: '하나님이 보이신 대로 정직하게 말한다', ok: true }, { t: '좋은 꿈이라고 둘러댄다', ok: false, fb: '듣기 좋은 거짓말은 그 사람을 준비하지 못하게 해요. 하나님이 보이신 것을 요셉은 바꿀 수 없었습니다.' }] },
    J('그 해석은 이러하니, 세 광주리는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 들고 당신을 나무에 달리니, 새들이 당신의 고기를 뜯어 먹으리이다.', '창세기 40:18–19', 'solemn'),
    N('baker', '……', '', 'fear')], () => tick(S, 'bakeDone')); }));
}
function cinBirthday(S, G, next) {
  const px = -30, pz = -176.8, ph = hAt(px, -176) + 1.1, ch = hAt(-30, 10);
  cine([
    { hour: 9, fn: () => { place('messenger', -30, 12.6, Math.PI); place('cupbearer', -30, 8, 0); place('baker', -27.6, 8.6, 0, { act: 'bound' }); G.teleport(-30, 4.6, 0); }, cam: [-34, ch + 2, 2], look: [-30, ch + 1.3, 9], dur: 7,
      t: '사흘째 되는 날은 바로의 생일이라. 바로가 그의 모든 신하를 위하여 잔치를 베풀 때에', ref: '창세기 40:20' },
    { fn: () => walkTo('cupbearer', -30, 15.5, 1.6, () => face('cupbearer', -30, 4.6)), cam: [-31.6, ch + 1.6, 3.4], look: [-30, ch + 1.5, 4.6], dur: 4.5, n: '요셉', t: '나리! 저를 꼭 기억해 주세요!', e: 'urgent' },
    { fn: () => emote('cupbearer', 'wave', 3), cam: [-28.6, ch + 1.6, 11.6], look: [-30, ch + 1.5, 15.5], dur: 5, n: '술 맡은 관원장', t: '걱정 말게! 바로께 꼭 아뢰겠네!', e: 'happy' },
    { fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('cupbearerC', px + 1.6, -173.6, -2.6, { act: 'present' }); }, cam: [px + 5, ph + 1.4, -168], look: [px, ph + 0.8, pz + 1], dur: 7, music: 'j_court',
      t: '술 맡은 관원장은 전직을 회복하매, 그가 잔을 바로의 손에 드렸고', ref: '창세기 40:21' },
    { fn: () => { const n = G.npc('baker'); if (n) n.forceVis = false; }, cam: [CELL[3][0] + 0.8, hAt(CELL[3][0], -4) + 1.5, -3], look: [CELL[3][0], hAt(CELL[3][0], -8) + 0.8, -8.2], dur: 6,
      t: '떡 굽는 관원장은 매달리니, 요셉이 그들에게 해석함과 같이 되었으나', ref: '창세기 40:22' },
    { fn: () => { const n = G.npc('cupbearerC'); if (n) { n.act = 'laugh'; } ['magician', 'sage'].forEach(id => emote(id, 'laugh', 6)); }, cam: [px + 4.5, ph + 2.4, -163.5], cam2: [px + 3.5, ph + 1.7, -167], look: [px + 1.6, ph + 0.4, -173.6], dur: 9, fadeOut: 2, music: '',
      t: '술 맡은 관원장이 요셉을 기억하지 못하고 그를 잊었더라.', ref: '창세기 40:23', e: 'solemn' },
    { fn: () => { S.q.pharShow = 0; const c = G.npc('cupbearerC'); if (c) c.act = null; const b = G.npc('baker'); if (b) b.forceVis = undefined; G.teleport(PRAY[0], PRAY[1] + 0.6, Math.PI); }, fadeIn: 1.6, hour: 16.5, music: 'j_prison',
      cam: [-18.4, hAt(-18.4, -6) + 1.5, -4.4], look: [-18.4, hAt(-18.4, -8) + 1.6, -9.4], dur: 7, t: '하루, 또 하루. 요셉은 옥 문이 열리기를 기다렸습니다.' },
  ], () => { GG.Game.musicOverride = null; next(); });
}
// c3_wait · the forgotten two years (창 41:1)
const SEASON = [
  { kick: '잊힌 시간 · 첫째 철', title: '물이 불어나는 철', t: '술 맡은 관원장이 떠난 뒤로 나일 강이 불어났다가 줄어들었습니다. 옥 문은 열리지 않았습니다. 그 사이, 옥에 어린 죄수 하나가 새로 들어왔습니다.', ref: '' },
  { kick: '잊힌 시간 · 둘째 철', title: '씨 뿌리는 철', t: '들판에 씨를 뿌리는 철이 왔습니다. 옥 밖에서는 농부들의 노랫소리가 들렸습니다. 오늘은 늙은 죄수가 풀려나는 날입니다.', ref: '' },
  { kick: '잊힌 시간 · 셋째 철', title: '거두는 철', t: '한 해가 지나고, 또 한 해가 흘러갔습니다. 요셉은 벽에 날들을 새기기 시작했습니다.', ref: '' },
  { kick: '만 이 년', title: '다시 물이 불어나는 철', t: '술 맡은 관원장이 떠난 지 만 이 년. 그날 밤, 간수장이 요셉을 찾아왔습니다.', ref: '창세기 41:1' }];
const WAIT = [
  { obj: '새로 들어온 어린 죄수 달래기', target: S => 'npc:youngP' },
  { obj: '풀려나는 늙은 죄수 배웅하기', target: S => 'npc:oldP' },
  { obj: S => S.q.wReady ? '창가에서 기도하기' : '벽에 지난 날들을 새기기', target: S => S.q.wReady ? { x: PRAY[0], z: PRAY[1] } : { x: -20.4, z: -6.4 } },
  { obj: '간수장과 이야기하기', target: S => 'npc:keeper' }];
steps.c3_wait.obj = S => { const w = WAIT[S.q.wait || 0]; return w ? (typeof w.obj === 'function' ? w.obj(S) : w.obj) : ''; };
function waitSetup(S, G, re) { S.q.wait = S.q.wait || 0; if (S.q.wait === 0) S.q.youngIn = 1; if (!re) narr([SEASON[S.q.wait]]); }
function waitNext(S, G) {
  S.q.wait = (S.q.wait || 0) + 1; G.UI.quest();
  if (S.q.wait >= 4) { cinPharaohDream(S, G); return; }
  fade(() => { S.day += 60; S.time = Math.floor(S.time / 24) * 24 + (S.q.wait === 3 ? 20.4 : 8.5); if (S.q.wait === 2) S.q.oldGone = 1; }, () => narr([SEASON[S.q.wait]], () => G.UI.quest()));
}
steps.c3_wait.talk = {
  youngP(S, G) { if ((S.q.wait || 0) !== 0) return false;
    say([N('youngP', '…엄마… 엄마…', '', 'cry'), J('얘야, 이름이 뭐니?', '', 'tender'), N('youngP', '…케티. 빵 하나 훔쳤다고… 여기 갇혔어요.', '', 'cry'),
      J('케티. 내 동생 베냐민도 지금쯤 너만 하겠구나. …나도 처음 여기 왔을 때 많이 무서웠어.', '', 'tender'),
      N('youngP', '형도요? 형은 어른이잖아요.', ''),
      J('무서울 땐 이렇게 해 봐. 하늘을 보고 「여호와여」 하고 불러. 우리 아버지가 그랬어. 어디에 있든지 함께 계시는 분이라고.', '', 'tender'),
      N('youngP', '…여호와. 여기에도요?', ''), J('응. 구덩이 속에도 계셨어. 내가 알아.', '', 'calm')], () => waitNext(S, G)); },
  oldP(S, G) { if ((S.q.wait || 0) !== 1) return false;
    say([N('oldP', '요셉… 오늘 내가 나간다. 앓아누웠던 이 늙은이를 살린 건 너였어.', '', 'tender'), J('하나님이 하신 일이에요, 할아버지.', '', 'calm'),
      N('oldP', '그래, 네 하나님. …얘야, 그 관원장 놈이 너를 잊었다고 낙심하지 마라.', '', 'tender'),
      N('oldP', '사람은 잊어도, 네 하나님은 너를 잊지 않으실 게다. 이 늙은이가 장담하마.', '', 'tender'),
      T('늙은 죄수는 요셉의 손을 오래도록 붙잡았다가, 웃으며 옥 문을 나섰습니다.')], () => waitNext(S, G)); },
  keeper(S, G) { if ((S.q.wait || 0) !== 3) return false;
    say([N('keeper', '요셉, 잠이 안 오는구나. 나도 그렇다.', '', 'calm'), N('keeper', '너는 왜 원망하지 않느냐? 그 관원장 놈은 너를 까맣게 잊었을 텐데.', '', 'calm'),
      { n: '요셉', t: '요셉은 무엇이라 대답할까?', choices: [{ t: '"원망한 날도 있었어요. 그래도… 하나님은 구덩이에서도, 보디발의 집에서도, 여기서도 저를 떠나지 않으셨어요."', ok: true },
        { t: '"원망 같은 건 해 본 적 없어요."', ok: false, fb: '그건 정직한 대답이 아니었어요. 요셉도 사람이었고, 울며 기도한 밤들이 있었습니다.' }] },
      N('keeper', '…네 하나님이 부럽구나. 나도 그런 신을 섬겨 보고 싶다.', '', 'tender'), T('그 밤, 나일 강 건너 바로의 궁에서는 한 왕이 잠 못 이루고 있었습니다.', '창세기 41:1')], () => waitNext(S, G)); },
};
function scratchWall(S, G) {
  G.P.face = -1.57;
  GG.UI.minigame('count', { title: '벽에 날들을 새기기', hint: '돌 조각으로 벽에 금을 그어 지난 달들을 세어요.', need: 8, btn: '새기기', onPress: () => { cpose('scratchWall', 0.6); G.sfx('scratch'); } }, () => {
    say([T('여덟 줄, 그리고 또 여덟 줄. 벽은 금으로 가득했습니다.'), J('…스물넷. 이 년이 지났구나.', '', 'weary'), J('하나님, 저는 아직 여기 있어요.', '', 'sad')], () => { S.q.wReady = 1; G.UI.quest(); }); });
}
// Pharaoh's dreams and the cupbearer remembers (창 41:1–14)
function cinPharaohDream(S, G) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1;
  cine([
    { hour: 5.6, fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('magician', -36.5, -171, 0.7); place('sage', -23.5, -171, -0.7); place('cupbearerC', -26, -169, -0.4); },
      cam: [px + 3.4, ph + 1.3, pz + 3.4], cam2: [px + 2.4, ph + 1.1, pz + 2.4], look: [px, ph + 1.2, pz], dur: 7, music: 'j_dream', t: '만 이 년 후에 바로가 꿈을 꾼즉, 자기가 나일 강 가에 서 있는데', ref: '창세기 41:1' },
    { cam: [px + 4, ph + 3, -162], look: [px, ph + 0.8, pz + 2], dur: 8, music: 'j_court', t: '아침에 그의 마음이 번민하여, 애굽의 점술가와 현인들을 다 불러 그들에게 그의 꿈을 말하였으나, 그것을 바로에게 해석하는 자가 없었더라.', ref: '창세기 41:8' },
    { cam: [-35, hAt(-36, -171) + 1.6, -168.6], look: [-36.5, hAt(-36, -171) + 1.5, -171], dur: 5, n: '애굽의 점술가', t: '…바로여, 그 꿈은 저희 지혜로는…', e: 'fear', fn: () => emote('magician', 'bow', 3) },
    { fn: () => walkTo('cupbearerC', px + 1, -172.4, 1.4, () => { face('cupbearerC', px, pz); emote('cupbearerC', 'bow', 2); }), cam: [px + 3.2, ph, -168], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 6, n: '술 맡은 관원장', t: '내가 오늘 내 죄를 기억하나이다.', ref: '창세기 41:9', e: 'solemn' },
    { cam: [px - 2.4, ph, -169.6], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 10, n: '술 맡은 관원장', t: '그곳에 친위대장의 종 된 히브리 청년이 우리와 함께 있기로, 우리가 그에게 말하매 그가 우리의 꿈을 풀되 각 사람의 꿈대로 해석하더니, 그 해석한 대로 되어 나는 복직되고 그는 매달렸나이다.', ref: '창세기 41:12–13' },
    { cam: [px + 1.6, ph + 0.9, pz + 2.6], look: [px, ph + 1.3, pz], dur: 5, fov: 0.6, n: '바로', t: '그를 부르라.', ref: '창세기 41:14', e: 'solemn' },
    { cam: [-30, hAt(-30, 14) + 2.4, 20], cam2: [-30, hAt(-30, 14) + 1.8, 17], look: [-30, hAt(-30, 14) + 1.4, 12], dur: 6, hour: 7.2, sfx: 'door', fn: () => { G.teleport(-30, 6, 0); place('messenger', -29, 11, Math.PI); },
      t: '바로가 사람을 보내어 요셉을 부르매, 그들이 곧 그를 옥에서 내어놓은지라.', ref: '창세기 41:14' },
    { black: true, title: '4장 · 바로의 꿈', sub: '창세기 41:14–45', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4 },
  ], () => { S.q.pharShow = 0; GG.Game.musicOverride = null; G.go('c4_shave'); });
}

// ------------------------------------------------------------------ 4장 · Pharaoh's court
function shaveScene(S, G) {
  const [bx, bz] = SPOTS.basin, h = hAt(bx, bz);
  cine([
    { fn: () => { G.teleport(bx + 1.2, bz, -1.57); cpose('gather', 3); }, cam: [bx + 3.2, h + 1.4, bz + 2], look: [bx, h + 0.8, bz], dur: 5, sfx: 'water', t: '요셉이 곧 수염을 깎고', ref: '창세기 41:14' },
    { fn: () => cpose('shave', 0, true), cam: [bx + 2.2, h + 1.6, bz - 0.6], look: [bx + 1.2, h + 1.5, bz], dur: 5, fov: 0.6 },
    { fn: () => { cpose(null); G.setOutfit('josephShaved'); G.sfx('whoosh'); G.FX.burst(bx + 1.2, h + 1, bz, 20, { c: [1, 0.95, 0.8], sp: 1.4, up: 1.4 }); }, cam: [bx + 3.4, h + 1.5, bz + 1.4], look: [bx + 1.2, h + 1.1, bz], dur: 5, t: '그의 옷을 갈아입고 바로에게 들어가니', ref: '창세기 41:14' },
    { fn: () => { place('youngP', bx + 4, bz + 2.4, -2, { vis: true }); place('keeper', bx + 3.4, bz - 1.6, -1.2); }, cam: [bx + 4.6, h + 1.5, bz + 4.4], look: [bx + 2.4, h + 1.2, bz + 1], dur: 5, n: '어린 죄수', t: '형… 가는 거야? 진짜 가는 거야?', e: 'cry' },
    { cam: [bx + 0.6, h + 1.5, bz + 2.2], look: [bx + 2.4, h + 1.2, bz + 1.6], dur: 6, n: '요셉', t: '응. 하나님이 문을 여셨어. 케티, 너도 꼭 기도해. 그분은 너도 잊지 않으셔.', e: 'tender' },
    { cam: [bx + 5.6, h + 1.6, bz - 2], look: [bx + 3.4, h + 1.5, bz - 1.6], dur: 5, n: '간수장', t: '…가거라, 요셉. 너는 원래부터 여기 있을 사람이 아니었다.', e: 'tender' },
  ], () => { const y = G.npc('youngP'); if (y) y.forceVis = undefined; fade(() => { G.teleport(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 2, Math.PI); S.time = Math.floor(S.time / 24) * 24 + 9; GG.Game.musicOverride = 'j_court'; }, () => G.go('c4_court')); });
}
function courtIntro(S, G, next) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  G.P.face = Math.PI;
  cine([
    { fn: () => { place('pharaoh', px, pz, 0, { sit: true }); }, cam: [cx + 6, chh + 3.4, cz + 10], cam2: [cx + 3, chh + 2.4, cz + 5], look: [px, ph + 1, pz], dur: 7, music: 'j_court',
      t: '요셉은 바로의 궁에 들어섰습니다. 금빛 기둥 사이로, 애굽의 모든 신하가 히브리 죄수를 바라보았습니다.' },
    { cam: [px + 1.8, ph + 1.0, pz + 3.4], look: [px, ph + 1.3, pz], dur: 9, fov: 0.62, n: '바로', t: '내가 한 꿈을 꾸었으나 그것을 해석하는 자가 없더니, 들은즉 너는 꿈을 들으면 능히 푼다 하더라.', ref: '창세기 41:15', e: 'solemn' },
  ], () => say([{ n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '"내가 아니라 하나님께서 바로에게 편안한 대답을 하시리이다."', ok: true, ref: '창세기 41:16' },
    { t: '"그렇습니다. 저는 어떤 꿈이든 풀 수 있습니다."', ok: false, fb: '이 년 전 옥에서처럼, 요셉은 공을 자기에게 돌리지 않았습니다.' }] },
    J('내가 아니라 하나님께서 바로에게 편안한 대답을 하시리이다.', '창세기 41:16', 'solemn'),
    N('pharaoh', '…좋다. 들어라. 내가 꿈에 나일 강 가에 서서 보니…', '창세기 41:17', 'awe')], next));
}
// c4_vision · walk inside Pharaoh's dream by the Nile (창 41:17–24)
const VISION = [{ id: 'nile', x: -84, z: -192 }, { id: 'fat', x: -88, z: -204 }, { id: 'thin', x: -87, z: -215 }, { id: 'good', x: -73, z: -211 }, { id: 'blight', x: -69, z: -197 }];
function visionEnter(S, G, re) {
  const go = () => { S.q.vision = 1; S.time = Math.floor(S.time / 24) * 24 + 6.9; G.teleport(-80, -189, -2.4); spawnCows(G); G.UI.hint('꿈속의 빛나는 곳으로 걸어가세요', 'vision', 'eye'); };
  if (re) { go(); return; } fade(go, () => { GG.Game.musicOverride = 'j_dream'; });
}
function spawnCows(G) {
  RT.cows.length = 0;
  for (let i = 0; i < 14; i++) { const thin = i >= 7, k = i % 7; const sp = thin ? 'cow' : 'cow';
    RT.cows.push({ thin, rig: new Rig(AB.cow), mesh: G.animalMesh(sp, thin ? 'black' : (k % 3 === 0 ? 'brown' : 'plain')), x: -95.5, z: (thin ? -217 : -205) + (k - 3) * 1.8, tx: (thin ? -88.5 : -89) + (k % 2) * 1.6, tz: (thin ? -217 : -205) + (k - 3) * 1.8 + (k % 3) * 0.5,
      y: -1.5, k: 0, st: 'hidden', ph: Math.random() * 6, face: 1.4, eaten: 0 }); }
}
function visionUpdate(dt, S, G, t) {
  if (!S.q.vision) return;
  for (const c of RT.cows) {
    if (c.st === 'emerge') { c.k = Math.min(1, c.k + dt / 5); c.x = lerp(-95.5, c.tx, c.k); c.z = lerp(c.z, c.tz, dt); if (c.k >= 1) c.st = 'graze'; }
    if (c.st === 'eaten') c.eaten = Math.min(1, c.eaten + dt / 2.5);
    const g = hAt(c.x, c.z); c.y = c.st === 'hidden' ? g - 3 : Math.max(g, lerp(-1.6, g, Math.min(1, c.k * 1.6)));
    const sp = c.st === 'emerge' ? 1.6 : 0; c.ph += sp * dt * 3; c.face = c.st === 'emerge' ? 1.57 : c.face + Math.sin(t * 0.3 + c.ph) * dt * 0.1;
    animAnimal(c.rig, { speed: sp, phase: c.ph, graze: c.st === 'graze' && Math.sin(t * 0.7 + c.ph) > -0.2 }, t);
    const s = (1 - c.eaten) * (c.thin ? 1 : 1.12); const sx = c.thin ? 0.62 * s : 1.18 * s;
    c.rig.update(m4trs(c.M || (c.M = m4()), c.x, c.y, c.z, c.face, 0, 0, sx, s * (c.thin ? 1.02 : 1), s));
  }
  if (GG.Cine.on || GG.UI.busy()) return;
  const v = VISION.find(q => !(S.q.seen || {})[q.id]); if (!v) return;
  if (Math.hypot(G.P.x - v.x, G.P.z - v.z) < 4.2) playVision(S, G, v);
}
const VIS_T = {
  nile: [{ n: '바로', t: '내가 꿈에 나일 강 가에 서서 보니', ref: '창세기 41:17', e: 'awe' }, { n: '요셉', t: '(하나님, 이 꿈을 보여 주소서. 바로가 본 것을 저도 보게 하소서.)', e: 'pray' }],
  fat: [{ n: '바로', t: '살지고 아름다운 일곱 암소가 나일 강 가에서 올라와 갈밭에서 뜯어먹고', ref: '창세기 41:18', e: 'awe' }],
  thin: [{ n: '바로', t: '그 뒤에 또 약하고 심히 흉하고 파리한 일곱 암소가 올라오니, 그같이 흉한 것들은 애굽 땅에서 내가 아직 보지 못한 것이라.', ref: '창세기 41:19', e: 'fear' },
    { n: '바로', t: '그 파리하고 흉한 소가 처음의 일곱 살진 소를 먹었으며, 먹었으나 먹은 듯 하지 아니하고 여전히 흉하더라.', ref: '창세기 41:20–21', e: 'fear' }],
  good: [{ n: '바로', t: '또 꿈에 보니, 한 줄기에 무성하고 충실한 일곱 이삭이 나오고', ref: '창세기 41:22', e: 'awe' }],
  blight: [{ n: '바로', t: '그 후에 또 가늘고 동풍에 마른 일곱 이삭이 나더니', ref: '창세기 41:23', e: 'fear' }, { n: '바로', t: '그 가는 이삭이 좋은 일곱 이삭을 삼키더라.', ref: '창세기 41:24', e: 'fear' }] };
function playVision(S, G, v) {
  const h = hAt(v.x, v.z); GG.UI.hint(null);
  const L = VIS_T[v.id]; let shots;
  if (v.id === 'nile') shots = [{ cam: [v.x + 3, h + 1.8, v.z + 3], cam2: [v.x + 4, h + 3.4, v.z + 1], look: [v.x - 6, h + 0.6, v.z - 4], look2: [-102, -0.2, v.z - 6], dur: 7, ...L[0] }, { cam: [v.x - 1.6, h + 1.5, v.z + 1.8], look: [v.x, h + 1.4, v.z], dur: 6, ...L[1] }];
  else if (v.id === 'fat') shots = [{ fn: () => RT.cows.forEach(c => { if (!c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 2.5, h + 2.2, v.z + 7], cam2: [v.x + 1, h + 1.6, v.z + 5], look: [-95, -0.2, v.z], look2: [-90, h + 0.6, v.z], dur: 9, ...L[0] }];
  else if (v.id === 'thin') shots = [{ fn: () => RT.cows.forEach(c => { if (c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 2.6, h + 2, v.z - 6], look: [-95, -0.2, v.z], look2: [-89, h + 0.6, v.z], dur: 9, ...L[0] },
    { fn: () => RT.cows.forEach(c => { if (!c.thin) c.st = 'eaten'; }), cam: [v.x + 4, h + 3, v.z + 7], look: [-89, h + 0.6, -210], dur: 9, shake: 0.15, sfx: 'moo', ...L[1] }];
  else if (v.id === 'good') shots = [{ fn: () => { RT.ears = 'good'; RT.earK = 0; }, cam: [v.x + 2.2, h + 1.3, v.z + 2.2], look: [v.x, h + 1.0, v.z], dur: 8, each: t => { RT.earK = Math.min(1, t / 6); }, ...L[0] }];
  else shots = [{ fn: () => { RT.ears = 'both'; RT.earK = 0; }, cam: [v.x + 2.4, h + 1.3, v.z - 2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.earK = Math.min(1, t / 6); RT.dust = 1; }, ...L[0] },
    { cam: [v.x - 2.2, h + 1.2, v.z + 2.2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.swallow = Math.min(1, t / 6); }, ...L[1] }];
  cine(shots, () => { RT.dust = 0; (S.q.seen = S.q.seen || {})[v.id] = 1; G.UI.quest();
    if (Object.keys(S.q.seen).length >= VISION.length) fade(() => { S.q.vision = 0; RT.cows.length = 0; RT.ears = null; RT.swallow = 0; G.teleport(SPOTS.court[0], SPOTS.court[1], Math.PI); S.time = Math.floor(S.time / 24) * 24 + 10.5; GG.Game.musicOverride = null; G.UI.hint(null); }, () => G.go('c4_answer'));
    else G.UI.hint('다음 빛나는 곳으로', 'vision' + v.id, 'eye'); });
}
function answerScene(S, G) {
  stage(S, G); G.P.face = Math.PI;
  say([N('pharaoh', '내가 이 꿈을 점술가에게 말하였으나 이를 내게 풀이해 주는 자가 없느니라.', '창세기 41:24'), J('바로의 꿈은 하나라. 하나님이 그가 하실 일을 바로에게 보이심이니이다.', '창세기 41:25', 'solemn')], () =>
  GG.UI.puzzle({ title: '바로의 꿈 해석', hint: '꿈속 장면(왼쪽)을 고르고, 하나님이 보이신 뜻(오른쪽)을 찾아 짝지으세요',
    syms: [{ id: 'fat', t: '일곱 살진 암소', m: 'y7', h: '살지고 좋은 것은 좋은 해를 뜻해요. 일곱은…?' }, { id: 'good', t: '충실한 일곱 이삭', m: 'y7', h: '무성한 이삭은 풍성한 해예요.' },
      { id: 'thin', t: '파리하고 흉한 일곱 암소', m: 'f7', h: '살진 소를 먹고도 여전히 흉한 소… 무엇이 풍년을 삼킬까요?' }, { id: 'blight', t: '동풍에 마른 일곱 이삭', m: 'f7', h: '마른 이삭은 굶주림의 해예요.' },
      { id: 'twice', t: '꿈을 두 번 겹쳐 꾸심', m: 'sure', h: '같은 뜻을 두 번 보이신 것은…' }],
    means: [{ id: 'y7', t: '온 애굽 땅에 일곱 해 큰 풍년' }, { id: 'f7', t: '뒤이어 일곱 해 흉년' }, { id: 'sure', t: '하나님이 이 일을 정하셨고 속히 행하시리라' }] }, () => say([
    J('일곱 좋은 암소는 일곱 해요, 일곱 좋은 이삭도 일곱 해니, 그 꿈은 하나라.', '창세기 41:26'),
    J('온 애굽 땅에 일곱 해 큰 풍년이 있겠고, 후에 일곱 해 흉년이 들므로 애굽 땅에 있던 풍년을 다 잊어버리게 되고, 이 땅이 기근으로 망하리니', '창세기 41:29–30', 'solemn'),
    J('바로께서 꿈을 두 번 겹쳐 꾸신 것은, 하나님이 이 일을 정하셨음이라. 하나님이 속히 행하시리니', '창세기 41:32', 'solemn'),
    { n: '요셉', t: '그렇다면 바로께 무엇을 아뢸까?', choices: [
      { t: '"명철하고 지혜 있는 사람을 택하여 애굽 땅을 다스리게 하시고, 풍년 일곱 해 동안 애굽 땅의 오분의 일을 거두어 흉년을 대비하소서."', ok: true, ref: '창세기 41:33–36' },
      { t: '"지금 실컷 먹고 즐기소서. 흉년은 그때 가서 걱정하면 됩니다."', ok: false, fb: '하나님이 미리 보이신 것은 준비하라는 뜻이었어요.' },
      { t: '"신들께 제물을 더 바치소서."', ok: false, fb: '요셉은 하나님이 보이신 길을 그대로 전했습니다. 거두고, 쌓고, 나누는 길을.' }] },
    J('그 곡물을 각 성에 쌓아 두어 애굽 땅에 임할 일곱 해 흉년에 대비하시면, 땅이 이 흉년으로 말미암아 망하지 아니하리이다.', '창세기 41:35–36'),
    N('pharaoh', '이와 같이 하나님의 영에 감동된 사람을 우리가 어찌 찾을 수 있으리요.', '창세기 41:38', 'awe'),
    N('pharaoh', '하나님이 이 모든 것을 네게 보이셨으니 너와 같이 명철하고 지혜 있는 자가 없도다. 너는 내 집을 다스리라. 내 백성이 다 네 명령을 따르리니, 내가 너보다 높은 것은 그 왕좌뿐이니라.', '창세기 41:39–40', 'solemn'),
    { n: '요셉', t: '바로의 말에 요셉은 어떻게 대답했을까? (어느 쪽도 정답은 아니에요)', choices: [
      { t: '"이는 저의 지혜가 아니라, 하나님께서 보여 주신 것입니다."', then: () => { GG.Deeds && GG.Deeds.char('god', 'credit'); } },
      { t: '"맡겨 주신 일을 힘을 다해 맡아 하겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('duty', 'credit'); } }] }],
  () => cinInvest(S, G))));
}
// v16.8 if the interpretation was interrupted, speaking to 바로 again takes it up from the start of the scene
steps.c4_answer.talk = { pharaoh(S, G) { answerScene(S, G); } };
function cinInvest(S, G) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  const road = [[-29, -138], [-28, -124], [-24, -100], [-22, -80], [-22, -66]];
  const along = k => { const n = road.length - 1, f = clamp(k, 0, 0.999) * n, i = Math.floor(f), u = f - i; return [lerp(road[i][0], road[i + 1][0], u), lerp(road[i][1], road[i + 1][1], u), Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1])]; };
  cine([
    { fn: () => { G.setOutfit('josephVizier'); G.sfx('fanfare'); G.FX.burst(cx, chh + 1.2, cz, 30, { c: [1, 0.85, 0.4], sp: 2, up: 2 }); }, cam: [cx + 1.6, chh + 1.6, cz - 1.8], look: [cx, chh + 1.4, cz], dur: 9, music: 'j_triumph',
      t: '바로가 자기의 인장 반지를 빼어 요셉의 손에 끼우고, 그에게 세마포 옷을 입히고 금 사슬을 목에 걸고', ref: '창세기 41:42' },
    { cam: [px + 2, ph + 0.8, pz + 4.2], look: [px, ph + 1.3, pz], dur: 6, n: '바로', t: '내가 너를 애굽 온 땅의 총리가 되게 하노라.', ref: '창세기 41:41', e: 'solemn' },
    { cam: [cx - 3, chh + 2.2, cz + 3], look: [cx, chh + 1.3, cz - 2], dur: 9, n: '바로', t: '네 이름을 사브낫바네아라 하리라. 그리고 온의 제사장 보디베라의 딸 아스낫을 네 아내로 주노라.', ref: '창세기 41:45' },
    { fn: () => { S.q.parade = 1; S.q.riding = 1; S.q.chariotOk = 1; const [x, z, f] = along(0); G.teleport(x, z, f); crowdLine(G, road, true); },
      cam: t => { const [x, z] = along(t / 16); return [x + 6, hAt(x, z) + 3, z + 4]; }, look: t => { const [x, z] = along(t / 16); return [x, hAt(x, z) + 1.4, z]; }, dur: 9, sfx: 'cheerC',
      each: t => { const [x, z, f] = along(t / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; },
      t: '자기에게 있는 버금 수레에 그를 태우매, 무리가 그의 앞에서 소리 지르기를 「엎드리라(아브렉)」 하더라.', ref: '창세기 41:43' },
    { cam: t => { const [x, z] = along((t + 9) / 16); return [x - 5, hAt(x, z) + 1.8, z + 7]; }, look: t => { const [x, z] = along((t + 9) / 16); return [x, hAt(x, z) + 1.6, z]; }, dur: 7, sfx: 'cheerC',
      each: t => { const [x, z, f] = along((t + 9) / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; }, t: '아브렉! 아브렉!', n: '애굽 백성', e: 'shout' },
    { cam: [-14, hAt(-22, -66) + 6, -56], cam2: [-8, hAt(-22, -66) + 14, -48], look: [-22, hAt(-22, -66) + 1.4, -66], dur: 8, t: '바로가 그에게 애굽 전국을 총리로 다스리게 하였더라. 요셉이 애굽 왕 바로 앞에 설 때에 삼십 세라.', ref: '창세기 41:43, 46', fadeOut: 1.6 },
    { black: true, title: '5장 · 일곱 해 풍년', sub: '창세기 41:46–52', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4, fn: () => { S.q.parade = 0; crowdLine(G, road, false); } },
  ], () => { S.q.chariotOk = 1; S.q.riding = 1; GG.Game.musicOverride = null; G.go('c5_patrol'); });
}
function crowdLine(G, road, on) {
  const LK = [LOOK.farmer, LOOK.woman, LOOK.elder, LOOK.maid, LOOK.official, LOOK.farmerThin, LOOK.priest, EGV.kidA, EGV.kidB, EGV.waterB];
  for (let i = 0; i < 18; i++) { const id = 'abrek' + i; if (!on) { if (G.npc(id)) G.removeNPC(id); continue; }
    const k = (i % 9) / 9 + 0.04, n = road.length - 1, f = k * n, j = Math.floor(f), u = f - j; const x = lerp(road[j][0], road[j + 1][0], u), z = lerp(road[j][1], road[j + 1][1], u), s = i < 9 ? 1 : -1;
    if (!G.npc(id)) G.spawnNPC({ id, name: '애굽 백성', look: LK[i % LK.length], scale: LK[i % LK.length].kid ? 0.7 : 1, x: x + s * 3.4, z: z + (i % 3) * 0.7, face: s > 0 ? -1.57 : 1.57, noTalk: true, noTag: true, act: i % 3 === 0 ? 'cheer' : i % 3 === 1 ? 'prostrate' : 'wave' }); }
}

// ------------------------------------------------------------------ 5장 · the seven years of plenty
function birthScene(S, G, which) {
  const ax = 7.6, az = -137.4, h = hAt(ax, az);
  if (which === 'manasseh') cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = Math.floor(S.time / 24) * 24 + 19.6; }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 7, music: 'j_night',
      t: '흉년이 들기 전에 요셉에게 두 아들이 나되, 곧 온의 제사장 보디베라의 딸 아스낫이 그에게서 낳은지라.', ref: '창세기 41:50' },
    { cam: [ax + 2.75, h + 1.4, az - 0.7], look: [ax + 0.4, h + 1.0, az + 0.4], dur: 6, n: '아스낫', t: '당신을 닮았어요. 이 아이의 이름을 무엇이라 할까요?', e: 'tender' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '므낫세. 하나님이 내게 내 모든 고난과 내 아버지의 온 집 일을 잊어버리게 하셨다.', ref: '창세기 41:51', e: 'tender' },
    { fn: () => { const a = G.npc('asenath'); if (a) a.sit = false; G.P.face = 1.2; }, hour: 22.5, cam: [ax - 2, h + 1.2, az + 4], look: [ax + 30, h + 14, az - 6], dur: 9,
      t: '그러나 그날 밤, 요셉은 오래도록 동쪽 하늘을 바라보았습니다. 가나안이 있는 쪽이었습니다.', fadeOut: 1.6 },
  ], () => { S.q.born1 = 1; GG.Game.musicOverride = null; G.newDay('풍년 둘째 해'); G.go('c5_year2'); });
  else cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = Math.floor(S.time / 24) * 24 + 18.4; }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 6, music: 'j_hope',
      t: '이듬해, 아스낫이 둘째 아들을 낳았습니다. 므낫세가 아장아장 걸어와 동생을 들여다보았습니다.' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '에브라임. 하나님이 나를 내가 수고한 땅에서 번성하게 하셨다.', ref: '창세기 41:52', e: 'happy' },
    { cam: [ax + 5, h + 2.6, az + 6], look: [ax, h + 0.8, az], dur: 7, t: '구덩이에서 울던 소년은, 이제 두 아이의 아버지가 되었습니다.', fadeOut: 1.4 },
  ], () => { S.q.born2 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.go('c5_years'); });
}
function plentyMontage(S, G) {
  const gs = sites.map(s => [s.x, s.z, hAt(s.x, s.z)]);
  cine([
    { fn: () => { LAND = 'plenty'; G.W().recolor(color); RT.sacks = 1; }, cam: [gs[0][0] + 12, gs[0][2] + 7, gs[0][1] + 10], cam2: [gs[0][0] + 8, gs[0][2] + 4, gs[0][1] + 7], look: [gs[0][0], gs[0][2] + 1.5, gs[0][1]], dur: 7, music: 'j_plenty', title: '풍년 셋째 해', sub: '',
      t: '일곱 해 풍년에 토지 소출이 심히 많았습니다.', ref: '창세기 41:47' },
    { fn: () => { RT.sacks = 2; }, cam: [-60, 18, -120], cam2: [-90, 22, -60], look: [-100, 1, -100], look2: [-120, 1, -20], dur: 8, title: '풍년 다섯째 해', sub: '', t: '요셉이 애굽 땅에 있는 그 일곱 해의 곡물을 거두어 각 성에 저장하되, 각 성 주위의 밭의 곡물을 그 성 중에 쌓아 두었습니다.', ref: '창세기 41:48' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[1][0] + 10, gs[1][2] + 5, gs[1][1] - 8], look: [gs[1][0], gs[1][2] + 1.5, gs[1][1]], dur: 7, title: '풍년 일곱째 해', sub: '', t: '요셉이 곡식을 저축함이 바다의 모래 같이 심히 많아, 세기를 그쳤으니 이는 그 수가 한이 없음이었더라.', ref: '창세기 41:49' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[2][0] + 8, gs[2][2] + 4, gs[2][1] + 9], look: [gs[2][0], gs[2][2] + 2, gs[2][1]], dur: 6, t: '언덕 위 곳간은 물 한 방울 들지 않았고, 곳간마다 곡식이 천장까지 쌓였습니다.' },
    { fn: () => { LAND = 'famine'; G.W().recolor(color); }, hour: 13, cam: [-50, 16, 40], cam2: [-70, 20, 10], look: [-100, 1, 40], look2: [-110, 1, 0], dur: 9, music: 'j_famine', sfx: 'wind',
      t: '애굽 땅에 일곱 해 풍년이 그치고, 요셉의 말과 같이 일곱 해 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 먹을 것이 있더니', ref: '창세기 41:53–54', fadeOut: 1.6 },
    { black: true, title: '6장 · 일곱 해 흉년', sub: '창세기 41:53–42:9', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4 },
  ], () => { GG.Game.musicOverride = null; S.day += 7 * 360; G.go('c6_open'); });
}

// ------------------------------------------------------------------ 6장 · the seven years of famine
function famineEnter(S, G, re) {
  if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); }
  if (!re) narr([{ kick: '창세기 41:55', title: '요셉에게 가라', t: '애굽 온 땅이 굶주리매 백성이 바로에게 부르짖어 양식을 구하는지라. 바로가 애굽의 모든 백성에게 이르되 「요셉에게 가서 그가 너희에게 이르는 대로 하라」 하니라.', ref: '창세기 41:55' }]);
}
function openGranary(S, G, k) {
  const g = sites.find(s => s.id === 'gran' + k), h = hAt(g.x, g.z);
  cine([{ cam: [g.x + 5, h + 2.2, g.z + 9], look: [g.x, h + 2, g.z], dur: 5, sfx: 'door', t: k === 'A' ? '요셉이 모든 창고를 열고 애굽 백성에게 팔았습니다.' : k === 'B' ? '서쪽 마을 사람들이 곳간 앞으로 몰려들었습니다.' : '물이 닿지 않는 언덕 위 곳간의 곡식은 한 톨도 상하지 않았습니다.', ref: k === 'A' ? '창세기 41:56' : '',
    fn: () => { (S.q.opened = S.q.opened || {})[k] = 1; G.sfx('cheerC'); G.FX.burst(g.x, h + 1.5, g.z + 3, 26, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); } }],
  () => { G.UI.quest(); G.checkStep(); });
}
steps.c6_sell.talk = {
  byFarmer(S, G) { return sellTo(S, G, 'byFarmer', [N('farmer', '총리님… 풍년에 오분의 일을 바치라 하실 때는 원망도 했습니다. 그 곡식이 이렇게 돌아올 줄이야.', '', 'weary'),
    { n: '요셉', t: '어떻게 할까?', choices: [{ t: '"정한 값으로 파시오. 그리고 씨앗도 조금 덤으로 드리시오. 흉년이 끝나면 다시 뿌려야 하니까."', ok: true }, { t: '"값을 두 배로 받으시오. 모자라니까."', ok: false, fb: '곳간은 백성을 살리려고 지은 것이었어요.' }] },
    N('farmer', '씨앗까지…! 총리님, 이 은혜를 잊지 않겠습니다.', '', 'happy')]); },
  byWoman(S, G) { return sellTo(S, G, 'byWoman', [N('woman', '아이들이 사흘을 굶었어요. 은이 이것밖에 없는데… 반 자루라도 될까요?', '', 'cry'),
    J('한 자루를 가져가시오. 모자라는 값은 아이들이 자라서 갚으면 되오.', '', 'tender'), N('woman', '…한 자루를요? 하나님이 당신을 보내셨군요.', '', 'cry')]); },
  byElder(S, G) { return sellTo(S, G, 'byElder', [N('overseerW', '총리님! 저를 기억하십니까? 오분의 일이 웬 말이냐고 대들던 서쪽 마을 촌장입니다.', '', 'happy'),
    N('overseerW', '그때 총리님이 「지금 쌓은 곡식이 당신의 아이들을 살릴 것이오」 하셨지요. 제 손녀가… 살았습니다. 이제 다섯 살이에요.', '', 'cry'), J('하나님이 하신 일이오, 촌장.', '', 'tender')]); },
  bySidon(S, G) { return sellTo(S, G, 'bySidon', [N('sidon', '바다 건너 시돈에서 왔소. 온 세상에 기근이 심하여, 각국 백성이 다 애굽으로 곡식을 사러 온다오.', '창세기 41:57'),
    J('먼 길 오셨소. 정한 값에 파시오. 이방인이라고 값을 더 받지 마시오.', '', 'calm')]); },
  byEdom(S, G) { return sellTo(S, G, 'byEdom', [N('edom', '에돔 땅에서 왔습니다. 가나안도 기근이 아주 심하지요.', '', 'weary'),
    N('edom', '헤브론 골짜기의 늙은 족장 집안도 곧 애굽으로 곡식을 사러 올 거라더군요. 아들이 열하나라던가…', '', 'calm'),
    J('……헤브론? 그 족장의 이름이… 혹시…', '', 'awe'), N('edom', '야곱이라던가. 이스라엘이라고도 하고. 옛날에 아들 하나를 들짐승에게 잃었다지요.', '', 'calm'),
    T('요셉의 손이 떨렸습니다. 이십 년 동안 한 번도 잊은 적 없는 이름이었습니다.')]); },
  byAmeni(S, G) { return sellTo(S, G, 'byAmeni', [N('ameni', '총리님께 곡식을 사러 왔습니다. 보디발 나리 댁에서… 얘야? 너… 요셉이냐?', '', 'awe'),
    J('아메니! 아메니 할아버지!', '', 'happy'), T('요셉은 총리의 자리에서 내려와, 늙은 종을 끌어안았습니다.'),
    N('ameni', '네 하나님이… 정말로 너와 함께 하셨구나. 그 구덩이에서도, 그 옥에서도.', '', 'cry'),
    J('할아버지가 가르쳐 주신 애굽 말로 바로 앞에서 말했어요. 엠 헤테프, 아메니. 평안히.', '', 'tender')]); },
};
function sellTo(S, G, id, lines) {
  const b = BUYERS.find(x => x.id === id); if ((S.q.sold || {})[id]) return false;
  if (b.last && Object.keys(S.q.sold || {}).length < 5) { say([N(id === 'byAmeni' ? 'ameni' : id, '…먼저 온 사람들부터 사게 하시오.')]); return; }
  say(lines, () => { (S.q.sold = S.q.sold || {})[id] = 1; G.sfx('coins'); emote(id, 'bow', 2); G.UI.quest(); G.checkStep(); });
}
// the brothers come (창 42:1–9)
function cinBrothers(S, G, next) {
  const heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4), gx = 16, gz = -58, gh = hAt(gx, gz);
  const jx = gx, jz = gz - 1.6;
  cine([
    { hour: 9, fn: () => { S.q.heb2 = 1; S.q.broShow = 1; BRO.forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI)); place('jacob', heb[0], heb[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('benjamin2', heb[0] + 2.2, heb[1] + 2.4, -0.4); },
      cam: [heb[0] + 4.4, hh + 1.8, heb[1] + 9.6], look: [heb[0], hh + 1.2, heb[1] + 3.4], dur: 7, music: 'j_mourn', t: '그 때에 야곱이 애굽에 곡식이 있음을 보고 아들들에게 이르되, 「너희는 어찌하여 서로 바라보고만 있느냐」', ref: '창세기 42:1' },
    { cam: [heb[0] - 1.4, hh + 1.6, heb[1] + 5], look: [heb[0], hh + 1.4, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 들은즉 저 애굽에 곡식이 있다 하니, 너희는 그리로 가서 거기서 우리를 위하여 사 오라. 그러면 우리가 살고 죽지 아니하리라.', ref: '창세기 42:2', e: 'weary' },
    { cam: [heb[0] + 3.6, hh + 1.4, heb[1] + 1.4], look: [heb[0] + 2.2, hh + 1.5, heb[1] + 2.4], dur: 8, t: '요셉의 형 열 사람이 애굽에서 곡식을 사려고 내려갔으나, 야곱이 요셉의 아우 베냐민은 그의 형들과 함께 보내지 아니하였으니, 이는 그의 생각에 재난이 그에게 미칠까 두려워함이었더라.', ref: '창세기 42:3–4' },
    { fn: () => { S.q.heb2 = 0; G.teleport(jx, jz, 0); BRO.forEach((id, i) => place(id, gx - 4.5 + (i % 5) * 2.2, gz + 4 + Math.floor(i / 5) * 1.8, Math.PI)); ['byFarmer', 'byWoman', 'byElder', 'bySidon', 'byEdom', 'byAmeni'].forEach(id => G.npcShow(id, false)); },
      cam: [gx + 8, gh + 2.6, gz + 12], cam2: [gx + 5, gh + 2, gz + 9], look: [gx, gh + 1.2, gz + 2], dur: 7, music: 'j_finale', t: '요셉이 나라의 총리로서 그 땅 모든 백성에게 곡식을 팔더니, 요셉의 형들이 와서', ref: '창세기 42:6' },
    { fn: () => BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: -i * 0.15, dur: 12, amb: true }; } }), cam: [jx + 0.8, gh + 2.8, jz - 2.8], look: [gx, gh + 0.3, gz + 5], dur: 9, t: '그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { fn: () => { RT.dreamFx = 'sheaves'; RT.dreamK = 0; }, cam: [DREAM.x + 3.6, hAt(DREAM.x, DREAM.z) + 1.2, DREAM.z + 3.6], cam2: [DREAM.x + 2.8, hAt(DREAM.x, DREAM.z) + 1.6, DREAM.z + 2.8], look: [DREAM.x, hAt(DREAM.x, DREAM.z) + 0.8, DREAM.z], dur: 9, fadeIn: 1,
      each: t => { RT.dreamK = Math.min(1, t / 6); }, t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고', ref: '창세기 42:9' },
    { fn: () => { RT.dreamFx = null; }, cam: [jx - 1.2, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.55, fadeIn: 0.8, t: '요셉이 보고 형들인 줄을 아나, 모르는 체하고 엄한 소리로 그들에게 말하였습니다.', ref: '창세기 42:7' },
    { cam: [jx + 1.6, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '너희가 어디서 왔느냐?', ref: '창세기 42:7', e: 'cold' },
    { fn: () => { const n = G.npc('judah'); if (n) n.act = 'kneelRest'; }, cam: [gx - 2, gh + 1.2, gz + 1.6], look: [gx - 0.1, gh + 0.9, gz + 4], dur: 6, n: '유다', t: '곡물을 사려고 가나안 땅에서 왔나이다.', ref: '창세기 42:7', e: 'fear' },
    { cam: [jx + 0.8, gh + 1.6, jz + 0.9], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.5, t: '요셉은 그들을 알아보았으나, 그들은 요셉을 알아보지 못하더라.', ref: '창세기 42:8' },
    { cam: [gx + 14, gh + 8, gz + 14], cam2: [gx + 20, gh + 16, gz + 20], look: [gx, gh + 1, gz + 2], dur: 10, fadeOut: 2.4,
      t: '스무 해 전 도단의 구덩이에서 울던 소년이, 이제 애굽의 총리가 되어 형들 앞에 서 있었습니다. 그리고 이야기는 이제, 용서와 화해를 향해 나아갑니다.', ref: '창세기 42–45장' },
  ], () => { GG.Game.musicOverride = 'j_finale'; const H = S.hero || { lvl: 1 };
    narr([{ kick: '창세기 42:9', title: '형들의 마음', t: '요셉은 곧바로 자기를 밝히지 않았습니다. 스무 해 전 자기를 팔았던 형들의 마음이 정말 변했는지, 아우 베냐민은 무사한지 알고 싶었습니다.', ref: '창세기 42:7–9' },
      { kick: '나의 여정', title: `${S.day}일의 기록`, t: `배운 애굽 말 ${Object.keys(S.q.words || {}).length}개 · 지은 곳간 ${['granA', 'granB', 'granC'].filter(k => S.built[k]).length}채 · 곡식을 판 사람 ${Object.keys(S.q.sold || {}).length}명 · 살펴서 알아낸 것 ${Object.keys(S.flags.lore || {}).length}개 · 만들어 본 요리 ${Object.keys(S.flags.dishes || {}).length}가지 · 체력 Lv ${H.lvl}`, ref: '' }], () => {
      S.q.broShow = 0; GG.Game.musicOverride = null; npcSet('jacob', { look: LOOK.jacob }); BRO.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next(); }); });
}
// ------------------------------------------------------------------ precise targets (the guide light points at the next thing to use)
steps.p_approach.target = { x: 160, z: -141 };
steps.c2_store.target = S => { const sh = S.q.shelf || {}; const sp = specials.find(s => s.id.startsWith('sh_') && !sh[s.id.slice(3)]); return sp ? { x: sp.x, z: sp.z } : 'npc:scribe'; };
steps.c3_keeper.target = S => { const g = S.q.gave || {}; const i = [0, 1, 2, 3].find(k => !g[k]); if (i === undefined) return 'npc:oldP'; return S.water > 0 ? { x: CELL[i][0], z: -4.9 } : 'spot:basin'; };
steps.c3_charge.target = S => { const f = S.q.fed || {}; const i = [0, 1, 2, 3].find(k => !f[k]); if (i === undefined) return 'npc:prisA'; return Gm().P.carry === 'basket' ? { x: CELL[i][0], z: -4.9 } : { x: -32, z: 6.2 }; };
steps.c6_open.target = S => { const o = S.q.opened || {}; const k = ['A', 'B', 'C'].find(q => !o[q]); if (!k) return null; const g = sites.find(s => s.id === 'gran' + k); return { x: g.x, z: g.z + 4 }; };
steps.c5_patrol.target = S => !S.q.rode ? null : !qd(S, 'metC') ? 'npc:overseerC' : !qd(S, 'metW') ? 'npc:overseerW' : !qd(S, 'metS') ? 'npc:overseerS' : null;

// =================================================================== v16.7 7장 형제들 · 8장 고센 땅 (창세기 42:9 – 47:12)
/* The story no longer stops when the brothers bow. 7장: 정탐꾼 누명 → 시므온을 묶어 둠 → 자루에 은을 도로 넣음 → 옥의 시므온 →
   야곱이 베냐민을 보냄(유다의 담보) → 요셉의 집 잔치(나이 순서 자리 · 베냐민의 다섯 배 몫) → 은잔 → 유다의 간청 → 「나는 요셉이라」.
   8장: 아버지께 보낼 수레와 선물 → 브엘세바의 밤 → 고센에서 아버지를 맞음 → 바로 앞에서(목자라 하라) → 고센에 정착.
   After that the free journey (j_end) adds 고센 마을: Jacob's tents, the brothers, sheep — and their side requests (IF). */
const GOSHEN = [78, 56];
const BRO11 = ['reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun', 'benjamin2'];
const AGE = { reuben: '레아의 맏아들', simeon: '레아의 둘째', levi: '레아의 셋째', judah: '레아의 넷째', dan: '빌하의 첫째', naphtali: '빌하의 둘째', gad: '실바의 첫째', asher: '실바의 둘째', issachar: '레아의 다섯째', zebulun: '레아의 여섯째', benjamin2: '라헬의 둘째, 막내' };
const grown = id => { const L0 = LOOK[id] || LOOK.man; return Object.assign({}, L0, { beard: L0.beard === 'none' ? 'short' : 'long', beardCol: L0.beardCol || L0.hair, build: (L0.build || 1) * 1.04 }); };
const ageBrothers = () => { for (const id of BRO) { const n = Gm().npc(id); if (n && !n.d.grown) npcSet(id, { look: grown(id), grown: 1 }); } };
for (const n of npcs) { if (n.id === 'jacob' || n.id === 'benjamin2') { const s0 = n.show; n.show = S => s0(S) || !!S.q.goshen || !!S.q.famShow; } }
const GH = () => hAt(GOSHEN[0], GOSHEN[1]);
const hide = ids => ids.forEach(id => { const n = Gm().npc(id); if (n) n.forceVis = false; });
const showAt = (id, x, z, f, o) => place(id, x, z, f, Object.assign({ vis: true }, o || {}));
const brosRow = (x, z, f, ids, gap) => (ids || BRO).forEach((id, i) => showAt(id, x + (i % 6) * (gap || 1.5) - 3.6, z + Math.floor(i / 6) * 1.6, f));
const G7GRAN = [16, -58], G7HOUSE = [SPOTS.josephHouse[0], SPOTS.josephHouse[1] + 6], /* the courtyard in front of the house */ G7YARD = SPOTS.yard, G7HEB = SPOTS.jacobTent;
const atHouse = S => { S.q.broShow = 1; S.q.famShow = 1; ageBrothers(); const [hx, hz] = G7HOUSE; BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); };

function cinSpies(S, G, next) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6;
  cine([
    { hour: 10, fn: () => { ageBrothers(); S.q.broShow = 1; G.teleport(jx, jz, 0); brosRow(gx, gz + 4, Math.PI); },
      cam: [gx + 6, gh + 2.2, gz + 9], look: [gx, gh + 1.2, gz + 3], dur: 6, music: 'j_mourn', t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고 그들에게 이르되,', ref: '창세기 42:9' },
    { cam: [jx + 1.4, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 6, n: '요셉', t: '너희는 정탐꾼이라. 이 나라의 틈을 엿보러 왔느니라.', ref: '창세기 42:9', e: 'cold' },
    { cam: [gx - 2, gh + 1.3, gz + 1.8], look: [gx - 0.6, gh + 1.1, gz + 4], dur: 8, n: '유다', t: '아니니이다, 내 주여. 우리는 다 한 사람의 아들들로서 확실한 자들이니, 열두 형제가 가나안 땅 한 사람의 아들들이라. 막내는 오늘 우리 아버지와 함께 있고 하나는 없어졌나이다.', ref: '창세기 42:10–13', e: 'fear' },
    { cam: [jx + 0.9, gh + 1.7, jz + 1.1], look: [jx, gh + 1.6, jz], dur: 8, fov: 0.55, n: '요셉', t: '너희 형제 중 하나만 옥에 갇히게 하고 너희는 곡식을 가지고 가서 너희 집안의 굶주림을 구하고, 너희 막내 아우를 내게로 데리고 오라.', ref: '창세기 42:19–20', e: 'cold' },
    { cam: [gx + 2.6, gh + 1.4, gz + 6.8], look: [gx, gh + 1.2, gz + 4.2], dur: 9, n: '르우벤', t: '내가 너희에게 그 아이에 대하여 죄를 짓지 말라고 하지 아니하였더냐? 그래도 너희가 듣지 아니하였느니라. 그러므로 그의 핏값을 치르게 되었도다.', ref: '창세기 42:22', e: 'sad' },
    { fn: () => cpose('weep', 6), cam: [jx - 3, gh + 1.5, jz - 2.4], look: [jx, gh + 1.4, jz], dur: 7, t: '그들은 요셉이 통역을 세운 까닭에 그가 알아들은 줄을 알지 못하였더라. 요셉이 그들을 떠나가서 울고,', ref: '창세기 42:23–24' },
    { fn: () => { cpose(null); const n = G.npc('simeon'); if (n) { n.act = 'kneelRest'; } }, cam: [gx - 0.6, gh + 1.6, gz + 1.4], look: [gx - 1.5, gh + 0.9, gz + 4], dur: 7, t: '다시 돌아와서 그들과 말하다가 그들 중에서 시므온을 끌어내어 그들의 눈앞에서 결박하고', ref: '창세기 42:24' },
  ], () => { const n = G.npc('simeon'); if (n) n.act = null; GG.UI.quest(); next && next(); });
}
function cinDepart(S, G, next) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz);
  cine([
    { fn: () => { hide(['simeon']); BRO.filter(id => id !== 'simeon').forEach((id, i) => walkTo(id, gx + 30 + i, gz + 40, 1.6)); }, cam: [gx + 6, gh + 3, gz + 6], look: [gx + 14, gh + 1, gz + 18], dur: 7, music: 'j_mourn',
      t: '그들이 곡식을 나귀에 싣고 그 곳을 떠났더라. 한 사람이 여관에서 나귀에게 먹이를 주려고 자루를 풀고 본즉 그 돈이 자루 아귀에 있는지라.', ref: '창세기 42:26–27' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); }, cam: [G7HEB[0] + 3.4, hAt(G7HEB[0], G7HEB[1]) + 1.6, G7HEB[1] + 6.4], look: [G7HEB[0], hAt(G7HEB[0], G7HEB[1]) + 1.3, G7HEB[1] + 2.6], dur: 8,
      n: '야곱', t: '너희가 나에게 내 자식들을 잃게 하도다. 요셉도 없어졌고 시므온도 없어졌거늘 베냐민을 또 빼앗아 가고자 하니… 내 아들은 너희와 함께 내려가지 못하리니.', ref: '창세기 42:36, 38', e: 'weary' },
  ], () => { S.q.heb2 = 0; S.q.broShow = 0; npcSet('jacob', { look: LOOK.jacob }); BRO.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); next && next(); });
}
function cinJudahPledge(S, G, next) { const hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 8, fn: () => { S.q.heb2 = 1; brosRow(G7HEB[0], G7HEB[1] + 5, Math.PI, BRO.filter(id => id !== 'simeon')); place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); },
      cam: [G7HEB[0] + 5, hh + 2.6, G7HEB[1] + 10], look: [G7HEB[0], hh + 1.2, G7HEB[1] + 3], dur: 7, music: 'j_mourn', t: '그 땅에 기근이 심하고, 그들이 애굽에서 가져온 곡식을 다 먹으매', ref: '창세기 43:1–2' },
    { cam: [G7HEB[0] - 1.6, hh + 1.5, G7HEB[1] + 5.4], look: [G7HEB[0] - 0.6, hh + 1.5, G7HEB[1] + 4.8], dur: 9, n: '유다', t: '저 아이를 나와 함께 보내시면 우리가 곧 가리니, 그러면 우리와 아버지와 우리 어린 아이들이 다 살고 죽지 아니하리이다. 내가 그를 위하여 담보가 되오리니 아버지께서 내 손에서 그를 찾으소서.', ref: '창세기 43:8–9', e: 'solemn' },
    { cam: [G7HEB[0] + 1.4, hh + 1.6, G7HEB[1] + 4.6], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 9, n: '야곱', t: '그러할진대 이렇게 하라. 이 땅의 아름다운 소산을 그릇에 담아 가지고 내려가서 그 사람에게 예물로 드릴지니 곧 유향 조금과 꿀 조금과 향품과 몰약과 유향나무 열매와 감복숭아이니라.', ref: '창세기 43:11', e: 'weary' },
    { cam: [G7HEB[0] + 2.8, hh + 1.4, G7HEB[1] + 3.4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, n: '야곱', t: '전능하신 하나님께서 그 사람 앞에서 너희에게 은혜를 베푸사… 내가 자식을 잃게 되면 잃으리로다.', ref: '창세기 43:14', e: 'weary' },
  ], () => { S.q.heb2 = 0; npcSet('jacob', { look: LOOK.jacob }); next && next(); });
}
function cinFeast(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 12, fn: () => { G.teleport(hx, hz + 1.2, 0); S.q.broShow = 1; BRO11.forEach((id, i) => showAt(id, hx - 6 + (i % 6) * 2.2, hz + 6 + Math.floor(i / 6) * 2, Math.PI)); },
      cam: [hx + 7, hh + 2.6, hz + 12], look: [hx, hh + 1.2, hz + 6], dur: 7, music: 'j_finale', t: '요셉이 베냐민이 그들과 함께 있음을 보고 자기의 청지기에게 이르되, 「이 사람들을 집으로 인도해 들이고 짐승을 잡고 준비하라. 이 사람들이 정오에 나와 함께 먹을 것이니라」', ref: '창세기 43:16' },
    { cam: [hx + 1.8, hh + 1.6, hz + 3.2], look: [hx + 0.4, hh + 1.4, hz + 6.2], dur: 7, fov: 0.55, n: '요셉', t: '너희 아버지 너희가 말하던 그 노인이 잘 있느냐? 아직 살아 있느냐?', ref: '창세기 43:27' },
    { fn: () => { BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'prostrate', t: -i * 0.1, dur: 7, amb: true }; }); }, cam: [hx - 4, hh + 2.4, hz + 2], look: [hx - 1, hh + 0.5, hz + 6.5], dur: 7, n: '유다', t: '주의 종 우리 아버지가 평안하고 지금까지 살아 있나이다.', ref: '창세기 43:28' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }), cam: [hx + 4.2, hh + 1.5, hz + 8.8], look: [hx + 4.4, hh + 1.3, hz + 8], dur: 7, n: '요셉', t: '너희가 내게 말하던 너희 작은 동생이 이 아이냐? 소자여, 하나님이 너에게 은혜 베푸시기를 원하노라.', ref: '창세기 43:29' },
    { fn: () => { G.teleport(hx + 13, hz - 1, -Math.PI / 2); cpose('weep', 8); }, cam: [hx + 10.8, hAt(hx + 13, hz - 1) + 1.5, hz + 0.6], look: [hx + 13, hAt(hx + 13, hz - 1) + 1.4, hz - 1], dur: 8, fadeIn: 0.6,
      t: '요셉이 아우를 사랑하는 마음이 복받쳐 급히 울 곳을 찾아 안방으로 들어가서 울고, 얼굴을 씻고 나와서 그 정을 억제하고 음식을 차리라 하매', ref: '창세기 43:30–31' },
  ], () => { cpose(null); G.teleport(hx, hz + 1.2, 0); next && next(); });
}
function cinMarvel(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })), cam: [hx + 8, hh + 2.6, hz + 11], look: [hx, hh + 0.9, hz + 7], dur: 8, music: 'j_finale',
      t: '그들이 요셉 앞에 앉되 그 나이에 따라 앉게 되니 그들이 서로 이상히 여겼더라.', ref: '창세기 43:33' },
    { cam: [hx + 6.6, hh + 1.3, hz + 5], look: [hx + 6, hh + 0.9, hz + 7], dur: 8, t: '요셉이 자기 음식을 그들에게 주되 베냐민에게는 다른 사람보다 다섯 배나 주매, 그들이 마시며 요셉과 함께 즐거워하였더라.', ref: '창세기 43:34' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.act = null; } }); next && next(); });
}
function cinCup(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 6, fn: () => { BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 4, cz + Math.floor(i / 6) * 1.8, 0.6)); showAt('steward2', cx - 3, cz - 6, 0.4); },
      cam: [cx + 8, ch + 3, cz - 8], look: [cx, ch + 1.2, cz], dur: 7, music: 'j_mourn', t: '아침이 밝을 때에 사람들과 그들의 나귀들을 보내니라. 그들이 성읍에서 나가 멀리 가기 전에 요셉의 청지기가 그들을 따라 미쳐', ref: '창세기 44:3–6' },
    { fn: () => { const n = G.npc('benjamin2'); if (n) n.act = 'kneelRest'; }, cam: [cx + 4.4, ch + 1.4, cz + 3.2], look: [cx + 4, ch + 0.8, cz + 1.8], dur: 8, t: '그들이 각각 급히 자루를 땅에 내리고 자루를 각기 푸니, 그가 나이 많은 자에게서부터 시작하여 나이 적은 자에게까지 조사하매 그 잔이 베냐민의 자루에서 발견된지라.', ref: '창세기 44:11–12' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'weep', t: -i * 0.1, dur: 9, amb: true }; }), cam: [cx - 3, ch + 2.2, cz + 5], look: [cx, ch + 1, cz + 0.6], dur: 6, t: '그들이 옷을 찢고 각기 짐을 나귀에 싣고 성으로 돌아가니라.', ref: '창세기 44:13' },
    { fn: () => { G.teleport(hx, hz + 1.2, 0); BRO11.forEach((id, i) => { const n = showAt(id, hx - 5 + (i % 6) * 2, hz + 5 + Math.floor(i / 6) * 1.6, Math.PI); if (n) n.emote = { k: 'prostrate', t: -i * 0.08, dur: 10, amb: true }; }); hide(['steward2']); },
      cam: [hx + 5, hh + 2.4, hz + 9], look: [hx, hh + 0.6, hz + 5], dur: 7, fadeIn: 0.8, t: '유다와 그의 형제들이 요셉의 집에 이르니 요셉이 아직 그 곳에 있는지라. 그의 앞에서 땅에 엎드리니', ref: '창세기 44:14' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }); next && next(); });
}
function cinPlea(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4), jd = () => G.npc('judah');
  cine([
    { fn: () => { const n = jd(); if (n) { G.npcTo('judah', hx + 0.4, hz + 3.2, Math.PI, false); n.act = 'kneelRest'; } }, cam: [hx - 1.6, hh + 1.3, hz + 2.2], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, music: 'j_mourn',
      n: '유다', t: '내 주여, 원하건대 당신의 종에게 내 주의 귀에 한 말씀을 아뢰게 하소서. 우리 아버지의 생명과 아이의 생명이 서로 하나로 묶여 있거늘,', ref: '창세기 44:18, 30', e: 'cry' },
    { cam: [hx + 1.6, hh + 1.2, hz + 4], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '아이가 우리와 함께 가지 아니함을 아버지가 보면 아버지가 죽으리니, 이같이 되면 종들이 주의 종 우리 아버지의 흰 머리로 슬피 스올로 내려가게 함이니이다.', ref: '창세기 44:31', e: 'cry' },
    { cam: [hx - 0.8, hh + 1.3, hz + 4.6], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '이제 주의 종으로 그 아이를 대신하여 머물러 있어 내 주의 종이 되게 하시고 그 아이는 그의 형제들과 함께 올려 보내소서. 그 아이가 나와 함께 가지 아니하면 내가 어찌 내 아버지에게로 올라갈 수 있으리이까.', ref: '창세기 44:33–34', e: 'cry' },
    { cam: [hx + 0.9, hh + 1.7, hz + 1], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.5, t: '스무 해 전, 형을 팔자고 했던 유다가 이제 아우를 위해 자기를 내어 주고 있었습니다.', ref: '창세기 37:26–27; 44:33' },
  ], () => { const n = jd(); if (n) n.act = null; next && next(); });
}
function cinIAmJoseph(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => { cpose('weep', 10); BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); }, cam: [hx + 2, hh + 1.6, hz - 1.8], look: [hx, hh + 1.5, hz + 0.6], dur: 8, music: 'j_finale',
      t: '요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리 질러 「모든 사람은 나를 떠나 나가라」 하고, 그들에게 자기를 알리니라. 요셉이 큰 소리로 우니 애굽 사람에게 들리며 바로의 궁중에 들리더라.', ref: '창세기 45:1–2' },
    { cam: [hx + 1, hh + 1.7, hz + 1.2], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.48, n: '요셉', t: '나는 요셉이라. 내 아버지께서 아직 살아 계시니이까?', ref: '창세기 45:3', e: 'cry' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.act = 'kneelRest'; }), cam: [hx - 3, hh + 1.8, hz + 1], look: [hx - 1, hh + 1, hz + 4.5], dur: 6, t: '형들이 그 앞에서 놀라서 대답하지 못하더라.', ref: '창세기 45:3' },
    { cam: [hx + 1.4, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '나는 당신들의 아우 요셉이니 당신들이 애굽에 판 자라. 당신들이 나를 이 곳에 팔았다고 해서 근심하지 마소서. 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다.', ref: '창세기 45:4–5', e: 'cry' },
    { cam: [hx - 1.2, hh + 1.6, hz + 1.8], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '그런즉 나를 이리로 보낸 이는 당신들이 아니요 하나님이시라. 하나님이 나를 바로에게 아버지로 삼으시고 그 온 집의 주로 삼으시며 애굽 온 땅의 통치자로 삼으셨나이다.', ref: '창세기 45:8', e: 'tender' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) { b.act = null; G.npcTo('benjamin2', hx + 0.5, hz + 0.9, Math.PI, false); b.emote = { k: 'weep', t: 0, dur: 9, amb: true }; } }, cam: [hx + 2.6, hh + 1.5, hz + 0.4], look: [hx + 0.2, hh + 1.4, hz + 0.5], dur: 8,
      t: '자기 아우 베냐민의 목을 안고 우니 베냐민도 요셉의 목을 안고 우니라. 요셉이 또 형들과 입맞추며 안고 우니 형들이 그제서야 요셉과 말하니라.', ref: '창세기 45:14–15' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next && next(); });
}
function cinSendOff(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 7, fn: () => { G.teleport(cx - 2, cz - 3, 0.5); BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 3, cz + 2 + Math.floor(i / 6) * 1.8, 0.4)); },
      cam: [cx + 6, ch + 2.6, cz - 5], look: [cx, ch + 1.2, cz + 2], dur: 8, music: 'j_finale', t: '그들에게 다 각기 옷 한 벌씩을 주되 베냐민에게는 은 삼백과 옷 다섯 벌을 주고, 그 아버지에게는 수나귀 열 필에 애굽의 좋은 물품을 실리고 암나귀 열 필에는 곡식과 떡과 양식을 실렸더라.', ref: '창세기 45:22–23' },
    { cam: [cx - 0.4, ch + 1.7, cz - 1.6], look: [cx - 2, ch + 1.6, cz - 3], dur: 6, n: '요셉', t: '당신들은 길에서 다투지 말라.', ref: '창세기 45:24', e: 'happy' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacob }); }, cam: [G7HEB[0] + 3, hh + 1.5, G7HEB[1] + 5.6], look: [G7HEB[0], hh + 1.4, G7HEB[1] + 2.6], dur: 8, fadeIn: 0.8,
      t: '그들이 가나안 땅으로 들어가서 아버지 야곱에게 이르러 알리되 「요셉이 지금까지 살아 있어 애굽 땅 총리가 되었더이다」 야곱이 그들의 말을 믿지 못하여 어리둥절하더니, 요셉이 보낸 수레를 보고서야 기운이 소생한지라.', ref: '창세기 45:26–27' },
    { cam: [G7HEB[0] + 1.2, hh + 1.6, G7HEB[1] + 4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, fov: 0.55, n: '야곱', t: '족하도다. 내 아들 요셉이 지금까지 살아 있으니 내가 죽기 전에 가서 그를 보리라.', ref: '창세기 45:28', e: 'cry' },
    { hour: 21, fn: () => { place('jacob', G7HEB[0] + 6, G7HEB[1] - 20, 0.3, { act: 'kneelRest' }); }, cam: [G7HEB[0] + 9, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.4, G7HEB[1] - 16], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.2, G7HEB[1] - 20], dur: 9, fadeIn: 1,
      t: '이스라엘이 브엘세바에 이르러 그의 아버지 이삭의 하나님께 희생제사를 드리니, 그 밤에 하나님이 이상 중에 이스라엘에게 나타나 이르시되', ref: '창세기 46:1–2' },
    { cam: [G7HEB[0] + 6.6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 3, G7HEB[1] - 17], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 12, G7HEB[1] - 24], dur: 9, fov: 1.1,
      t: '「나는 하나님이라 네 아버지의 하나님이니 애굽으로 내려가기를 두려워하지 말라. 내가 거기서 너로 큰 민족을 이루게 하리라. 내가 너와 함께 애굽으로 내려가겠고 반드시 너를 인도하여 다시 올라올 것이며」', ref: '창세기 46:3–4' },
  ], () => { S.q.heb2 = 0; S.q.broShow = 0; S.q.famShow = 0; const n = G.npc('jacob'); if (n) n.act = null; BRO11.forEach(id => { const n2 = G.npc(id); if (n2) n2.forceVis = undefined; }); next && next(); });
}
function goshenCamp(S) { const Bd = GG.Build; if (S.flags.gvil || !Bd || !Bd.prebuild) return; S.flags.gvil = 1; const [x0, z0] = GOSHEN;
  const put = (k, dx, dz, ry, name) => { for (let t = 0; t < 12; t++) { const a = t * 2.4, r = t ? 1.5 + t * 0.8 : 0, x = x0 + dx + Math.sin(a) * r, z = z0 + dz + Math.cos(a) * r; if (!Bd.check(k, x, z, ry, 1, true)) { Bd.prebuild(S, k, x, z, ry, name); return; } } };
  put('tent', -6, -3, 0.4, '야곱의 장막'); put('tent', 4, -6, -0.3, '르우벤의 장막'); put('tent', 9, 2, -1.2, '유다의 장막'); put('tent', -9, 6, 1.1, '레위의 장막'); put('tent', 2, 9, 2.6, '베냐민의 장막');
  put('campfire', 0, 1, 0, '고센 모닥불'); put('pen', -14, -10, 0.2, '고센 양 우리'); put('pen', 14, -12, -0.4, '고센 염소 우리'); put('well', 6, -1, 0, '고센 우물'); put('altar', -2, 14, 0, '고센 돌 제단'); put('oven', -3, -6, 0, '고센 화덕'); }
const GPOS = { jacob: [-5, -1, 0.6], reuben: [4.5, -3.6, -0.6], simeon: [6, -4.4, -1], levi: [-7.6, 4.4, 1.6], judah: [7.6, 1.4, -1.5], dan: [-2.4, -8, 0.2], naphtali: [-0.6, -8.6, 0.1], gad: [-12, -7, 0.8], asher: [-11, -4.6, 1.2],
  issachar: [11, -9, -0.5], zebulun: [12.4, -7.4, -0.9], benjamin2: [2.2, 7, 2.8] };
function placeGoshen(S) { const [x0, z0] = GOSHEN; for (const id in GPOS) { const [dx, dz, f] = GPOS[id]; const n = Gm().npc(id); if (!n) continue; Gm().npcTo(id, x0 + dx, z0 + dz, f, false); n.walk = null; n.sit = id === 'jacob'; n.act = null; n.emote = null; n.forceVis = undefined;
  if (id !== 'jacob' && id !== 'benjamin2') n.wander = { r: 3, cx: x0 + dx, cz: z0 + dz, tx: null, wait: 2 }; }
  if (!RT.gSheep) { RT.gSheep = 1; for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 6 + (i % 3) * 3; GG.Game.spawnNPC({ id: 'gsheep' + i, name: '고센의 양', animal: i % 4 === 3 ? 'goat' : 'sheep', pattern: i % 5 === 2 ? 'black' : 'plain', x: x0 - 14 + Math.cos(a) * r * 0.5, z: z0 - 18 + Math.sin(a) * r * 0.5, wander: 5, noTalk: true, noTag: true }); } } }
function cinReunion(S, G, next) { const [x0, z0] = GOSHEN, gh = GH();
  cine([
    { hour: 16, fn: () => { S.q.goshen = 1; S.q.broShow = 1; goshenCamp(S); BRO11.forEach((id, i) => showAt(id, x0 - 8 + (i % 6) * 2.4, z0 + 10 + Math.floor(i / 6) * 2, Math.PI)); place('jacob', x0, z0 + 6, Math.PI); npcSet('jacob', { look: LOOK.jacob }); G.teleport(x0, z0 - 6, 0); },
      cam: [x0 + 14, gh + 4, z0 - 6], cam2: [x0 + 10, gh + 3, z0 - 2], look: [x0, gh + 1.2, z0 + 4], dur: 8, music: 'j_finale', t: '야곱이 유다를 요셉에게 미리 보내어 자기를 고센으로 인도하게 하고 다 고센 땅에 이르니, 요셉이 그의 수레를 갖추고 고센으로 올라가서 그의 아버지 이스라엘을 맞으며', ref: '창세기 46:28–29' },
    { fn: () => { G.teleport(x0, z0 + 4.8, 0); cpose('weep', 12); const j = G.npc('jacob'); if (j) j.emote = { k: 'weep', t: 0, dur: 12, amb: true }; }, cam: [x0 + 2.4, gh + 1.6, z0 + 5.6], look: [x0, gh + 1.5, z0 + 5.4], dur: 9, fov: 0.6,
      t: '그에게 보이고 그의 목을 어긋맞춰 안고 얼마 동안 울매', ref: '창세기 46:29' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 9, n: '야곱', t: '네가 지금까지 살아 있고 내가 네 얼굴을 보았으니 지금 죽어도 족하도다.', ref: '창세기 46:30', e: 'cry' },
    { cam: [x0 + 1.4, gh + 1.6, z0 + 4], look: [x0, gh + 1.6, z0 + 4.8], dur: 7, n: '요셉', t: '아버지… 스무 해 동안, 하나님은 하루도 저를 떠나지 않으셨어요.', e: 'cry' },
    { fn: () => { cpose(null); const j = G.npc('jacob'); if (j) j.emote = null; }, cam: [x0 + 18, gh + 9, z0 + 18], cam2: [x0 + 22, gh + 14, z0 + 22], look: [x0, gh + 1, z0 + 3], dur: 9, fadeOut: 1.2,
      t: '애굽에 이른 야곱의 집 사람이 모두 칠십 명이었더라.', ref: '창세기 46:27' },
  ], () => { placeGoshen(S); G.teleport(x0 + 2, z0 - 4, 0); next && next(); });
}
function cinPharaoh(S, G, next) { const [cx, cz] = SPOTS.court, ch = hAt(cx, cz), FIVE = ['reuben', 'judah', 'levi', 'asher', 'benjamin2'];
  cine([
    { hour: 10, fn: () => { S.q.pharShow = 1; G.teleport(cx + 1.6, cz - 1, Math.PI); FIVE.forEach((id, i) => showAt(id, cx - 2.4 + i * 1.2, cz + 1.4, Math.PI)); showAt('jacob', cx, cz - 2.4, Math.PI); },
      cam: [cx + 6, ch + 3, cz + 6], look: [cx, ch + 1.4, cz - 6], dur: 7, music: 'j_finale', t: '요셉이 그의 형들 중 다섯 명을 택하여 바로에게 보이니', ref: '창세기 47:2' },
    { cam: [cx - 2, ch + 2.4, cz - 2], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 6, n: '바로', t: '너희의 생업이 무엇이냐?', ref: '창세기 47:3' },
    { cam: [cx + 2.4, ch + 1.5, cz - 1], look: [cx - 1, ch + 1.4, cz + 1.4], dur: 8, n: '유다', t: '종들은 목자이온데 우리와 우리 선조가 다 그러하니이다. 가나안 땅에 기근이 심하여 종들의 양 떼를 칠 곳이 없기로 이 곳에 거류하고자 왔사오니 종들로 고센 땅에 살게 하소서.', ref: '창세기 47:3–4' },
    { cam: [cx - 1.6, ch + 2.2, cz - 3], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 8, n: '바로', t: '애굽 땅이 네 앞에 있으니 땅의 좋은 곳에 네 아버지와 네 형제가 거주하게 하되 그들이 고센 땅에 거주하고, 그들 중에 능력 있는 자가 있거든 그들로 내 가축을 관리하게 하라.', ref: '창세기 47:6' },
    { cam: [cx + 1.6, ch + 1.6, cz - 4.2], look: [cx, ch + 1.5, cz - 2.4], dur: 7, n: '바로', t: '네 나이가 얼마냐?', ref: '창세기 47:8' },
    { cam: [cx - 1.2, ch + 1.6, cz - 1.2], look: [cx, ch + 1.5, cz - 2.4], dur: 9, n: '야곱', t: '내 나그네 길의 세월이 백삼십 년이니이다. 내 나이가 얼마 못 되니 우리 조상의 나그네 길의 연조에 미치지 못하나 험악한 세월을 보내었나이다.', ref: '창세기 47:9', e: 'weary' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = 'raiseHands'; }, cam: [cx + 3, ch + 2, cz - 0.6], look: [cx, ch + 1.6, cz - 3.4], dur: 7, t: '야곱이 바로에게 축복하고 그 앞에서 나오니라.', ref: '창세기 47:10' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = null; placeGoshen(S); }, cam: [GOSHEN[0] + 20, GH() + 10, GOSHEN[1] - 16], cam2: [GOSHEN[0] + 14, GH() + 6, GOSHEN[1] - 10], look: [GOSHEN[0], GH() + 1, GOSHEN[1]], dur: 10, fadeIn: 1,
      t: '요셉이 바로의 명령대로 그의 아버지와 그의 형들에게 거주할 곳을 주되 애굽의 좋은 땅 라암셋을 그들에게 주어 소유로 삼게 하고, 또 그의 아버지와 그의 형들과 그의 아버지의 온 집에 그 식구를 따라 먹을 것을 주어 봉양하였더라.', ref: '창세기 47:11–12' },
  ], () => { S.q.pharShow = 0; next && next(); });
}
// --- 나이 순서 자리 (창 43:33): the brothers were seated "the firstborn according to his birthright"
function seatPuzzle(S, G, done) { let k = 0, miss = 0; const ORD = BRO11;
  const ask = () => { if (k >= ORD.length) { done(miss); return; } const rest = ORD.slice(k), right = ORD[k], pool = rest.slice(1).sort(() => Math.random() - 0.5).slice(0, 3), opts = [right].concat(pool).sort(() => Math.random() - 0.5);
    say([{ n: '요셉', t: `${k + 1}번째 자리에는…`, choices: opts.map(id => ({ t: `${NM[id] || '베냐민'} (${AGE[id]})`, then: () => { if (id === right) { k++; Gm().sfx('coin', { pitch: 1 + k * 0.03 }); setTimeout(ask, 30); } else { miss++; setTimeout(() => say([T(`음… ${NM[right] || '베냐민'}이(가) 더 먼저 태어났어요. 레아의 네 아들, 빌하의 두 아들, 실바의 두 아들, 다시 레아의 두 아들, 그리고 라헬의 베냐민 순서예요.`)], ask), 30); } } })) }], null); };
  ask(); }

const STEPS7 = {
  g1_spy: { ch: 8, obj: '청지기 네브에게 형들의 자루를 채우라 이르기', target: 'npc:steward2',
    enter(S, G, re) { if (!re) cinSpies(S, G, () => G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0)); else ageBrothers(); },
    talk: { steward2(S, G) { if (S.q.sacks) return false; const order = [];
      const pick = () => say([{ n: '요셉', t: `청지기에게 무엇을 이를까? (${order.length}/3)`, choices: [
        { t: '그들의 그릇에 곡식을 채우라', then: () => { if (!order.includes('g')) order.push('g'); setTimeout(next2, 30); } },
        { t: '각 사람의 돈은 그의 자루에 도로 넣으라', then: () => { if (!order.includes('s')) order.push('s'); setTimeout(next2, 30); } },
        { t: '길 양식을 그들에게 주라', then: () => { if (!order.includes('p')) order.push('p'); setTimeout(next2, 30); } },
        { t: '돈을 받고 곡식은 조금만 주라', then: () => setTimeout(() => say([T('형들을 벌주려는 것이 아니에요. 요셉은 형들의 마음이 변했는지 보고 싶었고, 집안의 굶주림도 걱정했어요.')], pick), 30) }] }], null);
      const next2 = () => { if (order.length < 3) return pick(); say([N('steward2', '분부대로 하겠습니다, 총리님. 은은 자루 아귀에 몰래 넣어 두겠습니다.'), T('요셉이 명하여 곡물을 그 그릇에 채우게 하고 각 사람의 돈은 그의 자루에 도로 넣게 하고 또 길 양식을 그들에게 주게 하니 그대로 행하였더라. (창세기 42:25)')], () => tick(S, 'sacks')); };
      say([N('steward2', '총리님, 가나안에서 온 사람들의 나귀가 문 앞에 있습니다. 어떻게 할까요?')], pick); } },
    check: S => qd(S, 'sacks'), done(S, G, next) { cinDepart(S, G, next); }, next: 'g2_simeon' },
  g2_simeon: { ch: 8, obj: '옥에 갇힌 시므온 찾아가기', target: 'npc:simeon',
    enter(S, G) { S.q.broShow = 0; ageBrothers(); showAt('simeon', G7YARD[0] + 1.4, G7YARD[1] + 1.4, 0.4, { sit: true }); },
    talk: { simeon(S, G) { if (S.q.visitS) return false; say([N('simeon', '…총리께서 이 옥까지 무슨 일이십니까. 형제들은 반드시 돌아올 것입니다. 막내를 데리고요.', '', 'fear'),
      N('simeon', '밤마다 꿈에 한 소년이 보입니다. 구덩이 속에서 우리를 올려다보던 눈… 이 옥은 그 값인지도 모르지요.', '', 'sad'),
      { n: '요셉', t: '(무엇이라 답할까?)', choices: [{ t: '"이곳 간수장은 내가 아는 이요. 너를 잘 대하라 일러 두겠다."' }, { t: '"…네 하나님이 너를 잊지 않으셨을 것이다."' }] },
      T('요셉은 시므온에게 빵과 물을 넣어 주게 하고 옥을 나섰습니다. 문을 나서자마자 눈시울이 붉어졌습니다.'), T('(이 만남은 성경에 기록되지 않은 「IF」 장면이에요.)')], () => tick(S, 'visitS')); } },
    check: S => qd(S, 'visitS'), done(S, G, next) { hide(['simeon']); cinJudahPledge(S, G, next); }, next: 'g3_feast' },
  g3_feast: { ch: 8, obj: '형들을 집으로 맞아 나이 순서대로 자리 정하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10 },
    enter(S, G, re) { atHouse(S); if (!re) cinFeast(S, G, () => { atHouse(S); GG.UI.toast('형들 앞에 서서 「자리 정하기」'); }); },
    list: S => [{ t: '나이 순서대로 자리 정하기', ok: qd(S, 'seated') }, { t: '베냐민에게 줄 몫 정하기', ok: qd(S, 'portion') }],
    check: S => qd(S, 'seated') && qd(S, 'portion'), done(S, G, next) { cinMarvel(S, G, next); }, next: 'g4_cup' },
  g4_cup: { ch: 8, obj: '청지기에게 은잔을 베냐민의 자루에 넣게 하기', target: 'npc:steward2', enter(S) { atHouse(S); },
    talk: { steward2(S, G) { if (S.q.cup) return false; say([N('steward2', '날이 밝으면 형제분들이 떠납니다. 무엇을 분부하시겠습니까?'),
      { n: '요셉', t: '(창세기 44:2)', choices: [{ t: '"나의 은잔을 막내의 자루 아귀에 넣으라."', then: () => setTimeout(() => say([N('steward2', '…은잔을요? 알겠습니다. 분부대로 하겠습니다.', '', 'fear'), T('요셉은 형들이 베냐민을 버리고 갈지, 끝까지 지킬지 보려 했어요.')], () => tick(S, 'cup')), 30) },
        { t: '"아무것도 넣지 말라. 평안히 보내라."', then: () => setTimeout(() => say([T('요셉은 마지막으로 형들의 마음을 시험해 보기로 했어요. 형들은 이번에도 막내를 버리고 갈까요?')], () => setTimeout(() => G.talkTo('steward2'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'cup'), done(S, G, next) { cinCup(S, G, () => cinPlea(S, G, next)); }, next: 'g5_reveal' },
  g5_reveal: { ch: 8, obj: '형들 앞에서 결단하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 8 },
    enter(S, G, re) { atHouse(S); G.teleport(G7HOUSE[0], G7HOUSE[1], 0);
      setTimeout(() => { if (Gm().S().step !== 'g5_reveal') return; say([T('유다의 간청이 끝났습니다. 요셉은 더 이상 참을 수 없었습니다.'), { n: '요셉', t: '(어떻게 할까?)', choices: [
        { t: '"모든 사람은 나를 떠나 나가라."', then: () => tick(Gm().S(), 'reveal') },
        { t: '조금 더 엄하게 대한다', then: () => setTimeout(() => say([T('요셉의 마음이 이미 무너지고 있었어요. 형들은 변했어요 — 유다가 아우 대신 종이 되겠다고 했잖아요.'), { n: '요셉', t: '(이제…)', choices: [{ t: '"모든 사람은 나를 떠나 나가라."', then: () => tick(Gm().S(), 'reveal') }] }], null), 30) }] }], null); }, re ? 900 : 300); },
    check: S => qd(S, 'reveal'), done(S, G, next) { cinIAmJoseph(S, G, () => narr([{ kick: '창세기 45:5', title: '나는 요셉이라', t: '"하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다." 스무 해의 눈물이 화해로 바뀌었습니다. 이제 아버지를 모셔 올 차례예요.', ref: '창세기 45:5' }], next)); }, next: 'g6_wagons' },
  // =============================================================== 8장 · 고센 땅
  g6_wagons: { ch: 9, obj: '아버지께 보낼 수레 채비', list: S => [{ t: '성읍 곳간에서 곡식 자루 싣기', ok: qd(S, 'wGrain') }, { t: '장터에서 애굽의 좋은 물품 고르기', ok: qd(S, 'wGoods') }, { t: '형들에게 옷 나눠 주기 (청지기)', ok: qd(S, 'wClothes') }],
    target: S => !qd(S, 'wGrain') ? { x: G7GRAN[0], z: G7GRAN[1] - 2 } : !qd(S, 'wGoods') ? { x: SPOTS.market[0], z: SPOTS.market[1] } : 'npc:steward2',
    enter(S, G, re) { S.q.broShow = 0; S.q.famShow = 0; BRO11.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); if (!re) narr([{ kick: '창세기 45:17–20', title: '바로의 명령', t: '바로가 요셉에게 이르되 「너는 애굽 땅에서 수레를 가져다가 너희 자녀와 아내들을 태우고 너희 아버지를 모셔 오라. 온 애굽 땅의 좋은 것이 너희 것임이니라」', ref: '창세기 45:17–20' }]); },
    talk: { steward2(S, G) { if (S.q.wClothes || !S.q.wGrain || !S.q.wGoods) return false; say([N('steward2', '형제분들께 드릴 옷을 마련해 두었습니다. 어떻게 나누어 드릴까요?'),
      { n: '요셉', t: '(창세기 45:22)', choices: [{ t: '모두에게 한 벌씩, 베냐민에게는 은 삼백과 옷 다섯 벌', then: () => setTimeout(() => say([N('steward2', '알겠습니다. 막내분께는 각별히요.', '', 'happy')], () => tick(S, 'wClothes')), 30) },
        { t: '모두 똑같이 한 벌씩', then: () => setTimeout(() => say([T('요셉은 어머니 라헬의 아들, 하나뿐인 친동생 베냐민에게 특별한 사랑을 보였어요. 다시 골라 보세요.')], () => setTimeout(() => G.talkTo('steward2'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'wGrain') && qd(S, 'wGoods') && qd(S, 'wClothes'), done(S, G, next) { cinSendOff(S, G, next); }, next: 'g7_goshen' },
  g7_goshen: { ch: 9, obj: '수레를 타고 고센으로 가서 아버지 맞이하기', target: { x: GOSHEN[0], z: GOSHEN[1] - 6 },
    enter(S, G, re) { if (Gm().FEATS && Gm().FEATS.ride) Gm().unlockFeat('ride', true); if (!re) narr([{ kick: '창세기 46:28', title: '고센으로', t: '아버지와 온 집안이 애굽 땅 고센에 이르렀다는 소식이 왔어요. 동쪽 광야 가장자리, 가나안으로 가는 길목의 고센 땅으로 가세요.', ref: '창세기 46:28' }]); },
    check: S => Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - (GOSHEN[1] - 6)) < 12, done(S, G, next) { cinReunion(S, G, next); }, next: 'g8_pharaoh' },
  g8_pharaoh: { ch: 9, obj: '형들에게 바로 앞에서 할 말 일러 주기', target: 'npc:judah',
    enter(S, G) { S.q.goshen = 1; S.q.broShow = 1; ageBrothers(); goshenCamp(S); placeGoshen(S); },
    talk: { judah(S, G) { if (S.q.coach) return false; say([N('judah', '아우야, 내일 바로 앞에 선다지? 무엇이라 말해야 하느냐?'),
      { n: '요셉', t: '바로가 「너희의 생업이 무엇이냐」 물으면… (창세기 46:33–34)', choices: [
        { t: '"우리 조상 때부터 가축을 치는 자들입니다" 하라', then: () => setTimeout(() => say([J('그리하면 형님들이 고센 땅에 살게 될 거예요. 애굽 사람은 목축을 다 가증히 여기니, 따로 떨어져 우리 식대로 살 수 있어요.'), N('judah', '허허, 우리 아우가 다 생각이 있었구나.', '', 'happy')], () => tick(S, 'coach')), 30) },
        { t: '"우리는 장사꾼입니다" 하라', then: () => setTimeout(() => say([T('형들은 목자예요. 정직하게 말하는 것이 좋고, 그래야 양 떼를 칠 고센 땅에서 살 수 있어요.')], () => setTimeout(() => G.talkTo('judah'), 60)), 30) },
        { t: '"총리의 형제이니 궁에서 살게 해 달라" 하라', then: () => setTimeout(() => say([T('요셉은 가족이 애굽 궁의 화려함보다, 하나님을 섬기며 목자로 살아가길 바랐어요.')], () => setTimeout(() => G.talkTo('judah'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'coach'), done(S, G, next) { cinPharaoh(S, G, () => narr([{ kick: '창세기 47:27', title: '고센 땅', t: '이스라엘 족속이 애굽 고센 땅에 거주하며 거기서 생업을 얻어 생육하며 번성하였더라.', ref: '창세기 47:27' }], next)); }, next: 'j_end' },
};
{ const end = steps.j_end; delete steps.j_end; Object.assign(steps, STEPS7); steps.j_end = end; ORDER = Object.keys(steps); }
steps.c6_sell.next = 'g1_spy';
// the seating and the portion: actions in the courtyard while the feast is on
specials.push({ id: 'g_seat', x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '자리 정하기', on: S => S.step === 'g3_feast' && !S.q.seated,
  use: (S, G) => { say([T('나이 많은 형부터 막내 베냐민까지, 형들이 태어난 순서대로 자리를 정해 주세요. (창세기 43:33)')], () => seatPuzzle(S, G, miss => say([T(miss ? `틀린 곳이 ${miss}번 있었지만, 마침내 모두 제자리에 앉았어요.` : '단번에 맞혔어요! 형들이 서로 놀란 얼굴로 바라봅니다.')], () => tick(S, 'seated')))); } },
  { id: 'g_portion', x: SPOTS.josephHouse[0] + 2, z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '베냐민의 몫 정하기', on: S => S.step === 'g3_feast' && S.q.seated && !S.q.portion,
    use: (S, G) => say([{ n: '요셉', t: '베냐민에게는 얼마나 줄까?', choices: [{ t: '다른 형들과 똑같이' }, { t: '두 배' }, { t: '다섯 배', then: () => tick(S, 'portion') }] }], () => { if (!S.q.portion) GG.UI.toast('성경에는 베냐민의 몫이 다른 사람보다 「다섯 배」였다고 해요 (창 43:34)'); }) },
  { id: 'g_grain', x: G7GRAN[0], z: G7GRAN[1] - 2, r: 3.2, label: '곡식 자루 싣기', on: S => S.step === 'g6_wagons' && !S.q.wGrain, use: (S, G) => { GG.UI.toast('수레에 곡식 자루를 실었어요 · 암나귀 열 필 분량'); tick(S, 'wGrain'); } },
  { id: 'g_goods', x: SPOTS.market[0], z: SPOTS.market[1], r: 4, label: '애굽의 좋은 물품 고르기', on: S => S.step === 'g6_wagons' && !S.q.wGoods,
    use: (S, G) => say([{ n: '요셉', t: '아버지께 무엇을 보낼까? (창세기 45:23)', choices: [{ t: '고운 세마포와 꿀, 대추야자, 향품', then: () => tick(S, 'wGoods') }, { t: '금 장신구와 우상 조각', then: () => setTimeout(() => GG.UI.toast('아버지는 하나님만 섬기셨어요 · 다른 걸 골라 봐요'), 30) }] }], null) });

// ------------------------------------------------------------------ 고센 마을 (free journey, IF)
const goshenOn = S => !!S.q.goshen && idx(S) >= ORDER.indexOf('j_end');
const QUESTS = {
  g_lamb: { giver: 'reuben', title: '르우벤의 길 잃은 어린양', when: goshenOn, repeat: 5,
    offer: ['아우야, 어린양 한 마리가 무리에서 떨어져 나갔다. 저 광야 쪽으로… 가 줄 수 있겠느냐?', '…예전 같으면 내가 너를 찾으러 갔어야 했는데. 이젠 네게 부탁하는구나.'],
    obj: [{ t: '광야의 샘 근처에서 어린양 데려오기', ok: S => !!S.q.gLamb }], loc: () => ({ x: 90, z: 25 }),
    start(S) { S.q.gLamb = 0; const G = Gm(); if (!G.npc('glamb')) G.spawnNPC({ id: 'glamb', name: '길 잃은 어린양', animal: 'sheep', x: 88, z: 30, wander: 2, label: '어린양 안아 들기', talkR: 2.4, noBond: true }); },
    prog: '광야의 샘 쪽이다. 해 지기 전에 찾아 다오.', done: ['찾았구나! 허허… 잃은 하나를 찾아 돌아오는 게 이렇게 기쁜 일이었구나.', '요셉아, 그때… 정말 미안했다.'],
    reward: { silver: 8, items: { wool: 2, milk: 1 }, heart: 1 } },
  g_tent: { giver: 'levi', title: '레위의 장막 말뚝', when: goshenOn, repeat: 4, offer: ['바람이 세서 장막 말뚝이 자꾸 빠지는구나. 단단한 나뭇가지 다섯 개만 구해 주겠느냐?'],
    obj: [{ t: '나뭇가지 5개', ok: S => Gm().have('branch', 5) }], take: { branch: 5 }, prog: '나뭇가지 다섯 개면 된다.', done: ['이제 바람이 불어도 끄떡없겠다. 고맙다, 아우야.'], reward: { silver: 6, items: { cheese: 1 } } },
  g_bread: { giver: 'judah', title: '유다네 아이들의 빵', when: goshenOn, repeat: 3, offer: ['우리 집 꼬맹이들이 애굽 빵이 그렇게 맛있다는구나. 빵 세 덩이만 구해 줄 수 있겠느냐?'],
    obj: [{ t: '빵 3개', ok: S => Gm().have('bread', 3) }], take: { bread: 3 }, prog: '빵 세 덩이면 아이들이 춤을 출 거다.', done: ['얘들아, 요셉 삼촌이 빵을 가져왔다! …이 녀석들 웃는 소리 좀 들어 봐라.'], reward: { silver: 10, heart: 1 } },
  g_story: { giver: 'jacob', title: '아버지와 저녁 이야기', when: goshenOn, repeat: 2, offer: ['요셉아, 오늘 저녁 모닥불가에서 이 늙은 아비와 이야기 좀 하자꾸나.'],
    obj: [{ t: '고센 모닥불가에 앉기 (저녁)', ok: S => S.flags.fsNight === (S.time % 24 < 5 ? S.day - 1 : S.day) && Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - GOSHEN[1]) < 30 }], loc: () => ({ x: GOSHEN[0], z: GOSHEN[1] + 1 }),
    prog: '해가 지면 모닥불가로 오너라.', done: ['네 할아버지 이삭도, 증조할아버지 아브라함도 이렇게 불가에서 하나님 이야기를 하셨단다.', '내가 벧엘에서 본 사다리… 하나님은 그때 한 약속을 다 지키셨구나. 너를 내게 돌려주셨으니.'],
    reward: { insight: 1, items: { jacobGift: 1 } } },
  g_benj: { giver: 'benjamin2', title: '베냐민과 별 세기', when: goshenOn, repeat: 3, offer: ['형! 어릴 때 형이 별 이야기 해 줬던 거 기억나? 오늘 밤 모래 언덕에서 같이 별 보자.'],
    obj: [{ t: '남쪽 모래 언덕에서 별 바라보기 (밤)', ok: S => { const r = (S.flags.sev || {}).stars; return !!(r && r.n && r.n > (S.q.gbStars || 0)); } }], loc: () => ({ x: -6, z: 198 }),
    start(S) { const r = (S.flags.sev || {}).stars; S.q.gbStars = r ? r.n : 0; }, prog: '남쪽 모래 언덕이야. 밤에!', done: ['형, 별이 정말 셀 수 없이 많더라. 아브라함 할아버지 약속 이야기, 이제 나도 내 아이들한테 해 줄 거야.'],
    reward: { heart: 1, items: { raisins: 2 } } },
};
// the lamb is picked up by talking to it
const lambTalk = GG.Life && GG.Life.talk;
if (GG.Life) GG.Life.talk = function (id) { if (id === 'glamb') { const S = Gm().S(); S.q.gLamb = 1; Gm().removeNPC('glamb'); GG.UI.toast('어린양을 품에 안았어요 · 르우벤에게 데려가요'); return true; } return lambTalk.apply(this, arguments); };
// keep the Goshen camp (fixed records) and the family in place after loading
const RT_G = { t: 0 };
function goshenTick(dt, S) { if (!S || !S.q || !S.q.goshen || idx(S) < ORDER.indexOf('g8_pharaoh')) return; if ((RT_G.t -= dt) > 0) return; RT_G.t = 2;
  if (!S.flags.gvil) goshenCamp(S); if (!RT.gPlaced && !(GG.Cine && GG.Cine.on)) { RT.gPlaced = 1; placeGoshen(S); } }

// ------------------------------------------------------------------ ITEMS · MUSIC registered at load
Object.assign(GG.Game.ITEMS, { skin: { n: '물가죽 부대', cat: 'key', p: 0, ic: 'drop', c: '#8a6440' } });
const TRK = { j_theme: [127.0588, 'title'], j_canaan: [68.5714, 'camp'], j_dread: [64, 'night'], j_pit: [71.1111, 'night'], j_mourn: [82.7586, 'night'], j_caravan: [75.7895, 'desert'],
  j_egypt: [65.4545, 'haran'], j_house: [60, 'haran'], j_night: [64, 'night'], j_prison: [77.4194, 'night'], j_hope: [66.6667, 'epilogue'], j_dream: [68.5714, 'dream'],
  j_court: [68.5714, 'festival'], j_triumph: [57.6, 'festival'], j_plenty: [55.3846, 'festival'], j_famine: [71.1111, 'desert'], j_finale: [120, 'epilogue'] };
if (GG.Audio && GG.Audio.addTracks) { const m = {}; for (const k in TRK) m[k] = { url: 'music/' + k + '.mp3', loop: TRK[k][0], gain: 0.9, fallback: TRK[k][1], fadeIn: 2.4, xfade: 2.6 }; GG.Audio.addTracks(m); }

// ------------------------------------------------------------------ MUSIC & MOOD
function music(S, G, hr) {
  const st = S.step, night = hr > 20.6 || hr < 5;
  if (S.q.vision || RT.dreamFx) return 'j_dream';
  if (before(S, 'p_dothan')) return night ? 'j_night' : 'j_canaan';
  if (st === 'p_dothan' || st === 'p_approach') return 'j_dread';
  if (st === 'c1_pit') return 'j_pit';
  if (st === 'c1_caravan') return S.q.night ? 'j_egypt' : night ? 'j_night' : 'j_caravan';
  if (st === 'c1_market') return 'j_egypt';
  if (between(S, 'c2_arrive', 'c2_flee')) { if (st === 'c2_tempt3' || st === 'c2_flee') return 'j_dread'; return night ? 'j_night' : 'j_house'; }
  if (st === 'c3_cell' || st === 'c3_officers' || st === 'c3_wait') return night ? 'j_night' : 'j_prison';
  if (between(S, 'c3_keeper', 'c3_dreams') || st === 'c4_shave') return 'j_hope';
  if (between(S, 'c4_court', 'c4_answer')) return 'j_court';
  if (st === 'c5_patrol') return night ? 'j_night' : G.dist(-22, -74) < 50 ? 'j_triumph' : 'j_egypt';
  if (between(S, 'c5_year1', 'c5_years')) return night ? 'j_night' : 'j_plenty';
  if (between(S, 'c6_open', 'c6_sell')) return 'j_famine';
  return night ? 'j_night' : 'j_egypt';
}
const NEXT_TRACK = { p_wake: 'j_night', p_shechem: 'j_dread', p_approach: 'j_pit', c1_pit: 'j_mourn', c1_caravan: 'j_egypt', c1_market: 'j_house', c2_tempt2: 'j_dread', c2_flee: 'j_prison', c3_keeper: 'j_hope',
  c3_dreams: 'j_dream', c3_wait: 'j_court', c4_vision: 'j_triumph', c5_patrol: 'j_plenty', c5_years: 'j_famine', c6_sell: 'j_finale' };
function mood(S, G) {
  if (S.q.vision) return { mod(e) { e.skyTop = [0.42, 0.3, 0.52]; e.skyHor = [1.0, 0.76, 0.52]; e.fogCol = [0.96, 0.78, 0.6]; e.sunCol = [1.0, 0.86, 0.62]; e.skyAmb = [0.62, 0.52, 0.56]; e.gndAmb = [0.4, 0.3, 0.28]; e.fogDen = 1 / 70; e.cloudCol = [1, 0.8, 0.7]; e.night = 0; } };
  if (RT.dreamFx) return { mod(e) { e.skyTop = [0.08, 0.06, 0.22]; e.skyHor = [0.55, 0.38, 0.5]; e.fogCol = [0.28, 0.2, 0.36]; e.sunCol = [1.0, 0.85, 0.6]; e.skyAmb = [0.5, 0.42, 0.6]; e.gndAmb = [0.25, 0.18, 0.3]; e.night = 1; e.sunDir = [0.2, 0.75, -0.6]; e.fogDen = 1 / 60; e.cloudCol = [0.6, 0.45, 0.7]; } };
  if (LAND === 'famine' && between(S, 'c6_open', 'c6_sell')) return { mod(e) { const k = 1 - (e.night || 0) * 0.7; e.fogCol = e.fogCol.map((v, i) => lerp(v, [0.82, 0.64, 0.44][i], 0.55 * k)); e.skyHor = e.skyHor.map((v, i) => lerp(v, [0.9, 0.72, 0.5][i], 0.5 * k)); e.fogDen = (e.fogDen || 1 / 300) * 1.8; e.sunCol = e.sunCol.map((v, i) => v * [1.04, 0.94, 0.8][i]); } };
  return null;
}

// ------------------------------------------------------------------ RUNTIME UPDATE
const FIELD_N = { pflax: 32, royal: 40 };
function ripe(S, f, crop) { const F = fields.find(x => x.id === f); for (let i = 0; i < F.cols; i++) for (let j = 0; j < F.rows; j++) S.plots[f + ':' + i + ',' + j] = { s: 2, c: crop, st: 3, g: 0, w: 1 }; GG.Game.ENT.plotsDirty = true; }
function ripeLeft(S, f) { let n = 0; for (const k in S.plots) if (k.startsWith(f + ':') && S.plots[k].s === 2) n++; return n; }
{ const en = steps.c2_field.enter; steps.c2_field.enter = function (S, G, re) { if (!re || !S.q.flaxPlanted) { ripe(S, 'pflax', 'flax'); S.q.flaxPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c2_tempt2.enter; steps.c2_tempt2.enter = function (S, G, re) { if (!S.q.flax2Planted) { ripe(S, 'pflax', 'flax'); S.q.flax2Planted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_year2.enter; steps.c5_year2.enter = function (S, G, re) { G.unlock('royal'); if (!S.q.wheatPlanted) { ripe(S, 'royal', 'wheat'); S.q.wheatPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_patrol.enter; steps.c5_patrol.enter = function (S, G, re) { S.q.chariotOk = 1; en.call(this, S, G, re); }; }
const SCENE_ONLY = { c1_market: 1, c4_answer: 1, c5_years: 1 };
function update(dt, S, G, t) {
  const P = G.P, st = S.step; RT.t += dt;
  if (P.cpose) { P.cpose.t += dt; if (P.cpose.dur && !P.cpose.hold && P.cpose.t > P.cpose.dur) P.cpose = null; }
  if (P.cpose && P.spd > 0.6 && !GG.Cine.on && ['reach', 'scratchWall', 'shave', 'think', 'bow', 'gather'].includes(P.cpose.k)) P.cpose = null;
  if (P.cpose && P.cpose.hold && !GG.Cine.on && P.spd > 0.6 && !['bound'].includes(P.cpose.k)) P.cpose = null;
  if ((S.q.bound || S.q.chain) && !P.cpose && !GG.Cine.on) P.cpose = { k: 'bound', t: 0, dur: 0, hold: true };
  if (!S.q.bound && !S.q.chain && P.cpose && P.cpose.k === 'bound' && !GG.Cine.on) P.cpose = null;
  if (S.q.bound || S.q.chain) P.sprint = false;
  tutorial(dt, S, G);
  // the pit: trying to climb out
  if (S.q.inPit && st === 'c1_pit' && !GG.Cine.on) { if (!P.grounded && P.vy > 5 && !RT.jmp) { RT.jmp = 1; S.q.climb = (S.q.climb || 0) + 1; G.sfx('scratch'); setTimeout(() => {
      cpose('reach', 1.6); G.FX.burst(P.x + Math.sin(P.face) * 0.6, P.y + 1.6, P.z + Math.cos(P.face) * 0.6, 14, { c: [0.6, 0.5, 0.38], sp: 1, up: -0.5, g: 6 });
      G.UI.toast(S.q.climb === 1 ? '손이 닿지 않아요… 벽이 너무 높아요' : S.q.climb === 2 ? '흙벽이 무너져 내려요. 혼자서는 나갈 수 없어요' : '…');
      if (S.q.climb === 2) GG.UI.hint('구덩이 한가운데에서 형들을 불러 보세요', 'pitCall', 'tap'); G.UI.quest(); G.checkStep(); }, 380); }
    if (P.grounded) RT.jmp = 0; }
  caravanUpdate(dt, S, G);
  visionUpdate(dt, S, G, t);
  /* v16.8 a story scene that only starts when its step begins (노예 장터 · 바로의 꿈 해석 · 일곱 해 풍년) must never hang: if the
     step is still here and nothing is playing for 6 s (a puzzle or dialogue was somehow closed), the scene picks up again.
     Talking to 바로 during 꿈 해석 does the same at once. */
  if (SCENE_ONLY[st]) { const idle = !GG.Cine.on && !GG.Game.cineOn && !GG.UI.busy(); RT.sceneIdle = RT.sceneStep === st && idle ? (RT.sceneIdle || 0) + dt : RT.sceneStep === st ? Math.min(0, RT.sceneIdle || 0) : 0; RT.sceneStep = st;
    if (RT.sceneIdle > 6) { RT.sceneIdle = -20; G.UI.toast('멈춘 장면을 다시 이어 가요'); steps[st].enter(S, G, true); } }
  if (st === 'c2_field') { const n = FIELD_N.pflax - ripeLeft(S, 'pflax'); if (n !== S.q.flax) { S.q.flax = n; G.UI.quest(); G.checkStep(); } }
  if (st === 'c2_tempt2') { const n = FIELD_N.pflax - ripeLeft(S, 'pflax'); if (n !== S.q.flax2) { S.q.flax2 = n; G.UI.quest(); G.checkStep(); } }
  if (st === 'c5_year2') { const n = FIELD_N.royal - ripeLeft(S, 'royal'); if (n !== S.q.wheat) { S.q.wheat = n; G.UI.quest(); G.checkStep(); } }
  // fetters clink as he walks
  if (S.q.chain && P.spd > 0.5) { RT.chT = (RT.chT || 0) - dt; if (RT.chT <= 0) { RT.chT = 0.62; G.sfx('chain', { vol: 0.32, pitch: 0.9 + Math.random() * 0.2 }); } }
  // the second chariot
  const ride = !!S.q.riding && !!S.q.chariotOk && !GG.Cine.on;
  G.CAM.zoom = lerp(G.CAM.zoom || 1, S.q.riding ? 1.6 : 1, Math.min(1, dt * 2));
  if (S.q.riding) { P.stam = Math.max(P.stam, 60); P.exhausted = false; RT.hoof = (RT.hoof || 0) + P.spd * dt; if (RT.hoof > 1.3 && P.spd > 1) { RT.hoof = 0; G.sfx('step', { surf: 'stone', vol: 0.4 + P.spd / 30, pitch: 0.7 + Math.random() * 0.2 }); }
    if (ride && P.spd > 7) { RT.dustT = (RT.dustT || 0) - dt; if (RT.dustT < 0) { RT.dustT = 0.08; G.FX.burst(P.x - Math.sin(P.face) * 1.2, P.y + 0.1, P.z - Math.cos(P.face) * 1.2, 3, { c: [0.85, 0.76, 0.6], sp: 0.8, up: 0.6, size: 0.3, a: 0.6, g: 0.4 }); } } }
  if (RT.dust) { RT.dustT2 = (RT.dustT2 || 0) - dt; if (RT.dustT2 < 0) { RT.dustT2 = 0.05; const v = VISION[4]; G.FX.burst(v.x + 6 + Math.random() * 4, hAt(v.x, v.z) + 0.4 + Math.random() * 1.5, v.z + (Math.random() - 0.5) * 6, 3, { c: [0.8, 0.65, 0.45], sp: 3, up: 0.3, size: 0.25, a: 0.5, g: -0.1 }); } }
  // prefetch the next score
  if (RT.preStep !== st) { RT.preStep = st; const nx = NEXT_TRACK[st]; if (nx && GG.Audio && GG.Audio.prefetch) setTimeout(() => GG.Audio.prefetch(nx), 4000); }
  // buyers line up and the visited one steps aside
  if (st === 'c6_sell') for (const b of BUYERS) { const n = G.npc(b.id); if (n && (S.q.sold || {})[b.id] && !n.left) { n.left = 1; G.npcWalk(b.id, n.x + (Math.random() - 0.5) * 6, n.z + 8, null, 1.4); } }
}
function tutorial(dt, S, G) {
  const P = G.P, st = S.step; if (GG.Cine.on || GG.UI.busy() || (GG.Opening && GG.Opening.on)) return;
  if (st === 'p_wake') { if (!RT.tut0) RT.tut0 = [P.x, P.z]; const moved = Math.hypot(P.x - RT.tut0[0], P.z - RT.tut0[1]);
    if (moved < 3) GG.UI.hint('왼쪽 아래를 끌면 걸어요 · 오른쪽 화면을 끌면 둘러봐요 (키보드: WASD · 방향키)', 'move', 'move');
    else GG.UI.hint('화살표가 가리키는 곳으로 · 아버지 야곱께 가서 A로 말해요', 'goJacob', 'tap'); }
  else if (st === 'p_provision') { if (!S.q.skin) GG.UI.hint('물건 가까이에서 A를 누르면 챙길 수 있어요', 'items', 'tap'); else if (S.q.bread && !S.q.benj) GG.UI.hint('동생 베냐민에게 인사해요', 'benj', 'heart'); }
  else if (st === 'p_road') { const dl = Math.hypot(P.x - SPOTS.log[0], P.z - SPOTS.log[1]);
    if (dl < 11 && P.z > SPOTS.log[1] - 1) GG.UI.hint('쓰러진 나무가 길을 막았어요 · 점프 버튼(스페이스)으로 넘어요', 'jump', 'jump');
    else if (!RT.ran && P.z > SPOTS.log[1]) { if (P.sprint && P.spd > 5) RT.ran = 1; GG.UI.hint('달리기 버튼을 누른 채 걸으면 빨리 달려요 (키보드: Shift)', 'run', 'run'); }
    else GG.UI.hint(null); }
  else if (st === 'c1_pit') { if ((S.q.climb || 0) < 2) GG.UI.hint('구덩이 벽이 높아요 · 점프 버튼으로 기어올라 보세요', 'pitJump', 'jump'); else if (S.q.shout && !S.q.pitPray) GG.UI.hint('무릎 꿇고 하나님께 부르짖어요', 'pitPray', 'pray'); }
}

// ------------------------------------------------------------------ BOUNDS · CAMERA · MOVEMENT · POSE
const ESTATE = { x0: -50.4, x1: 16, z0: 34, z1: 84 };
function bounds(P, S) {
  const st = S.step;
  if (S.q.inPit) { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.wall - 0.48; if (d > R0) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  else { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.r + 1.5; if (d < R0 && d > 0.01) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  if (st === 'c1_caravan' && RT.car) { const n = GG.Game.npc('camel3'); if (n) { const d = Math.hypot(P.x - n.x, P.z - n.z), L = 6.6; if (d > L) { P.x = n.x + (P.x - n.x) / d * L; P.z = n.z + (P.z - n.z) / d * L; } } }
  if (S.q.cellLock) { P.x = clamp(P.x, -20.4, -16.4); P.z = clamp(P.z, -9.2, -4.1); }
  if (between(S, 'c3_keeper', 'c3_wait') && !GG.Cine.on) { P.x = clamp(P.x, -44.3, -15.7); P.z = clamp(P.z, P.x > -20.5 && P.x < -16.3 ? -9.2 : -4.6, 13.2); }
  if (between(S, 'c2_arrive', 'c2_tempt3')) { const ox = P.x, oz = P.z; P.x = clamp(P.x, ESTATE.x0, ESTATE.x1); P.z = clamp(P.z, ESTATE.z0, ESTATE.z1); if ((ox !== P.x || oz !== P.z) && (!RT.estT || RT.t - RT.estT > 6)) { RT.estT = RT.t; GG.UI.toast('보디발의 집 종은 멀리 갈 수 없어요'); } }
  if (S.q.vision) { const d = Math.hypot(P.x + 80, P.z + 203), R0 = 26; if (d > R0) { P.x = -80 + (P.x + 80) / d * R0; P.z = -203 + (P.z + 203) / d * R0; } }
}
function camera(S, G, dt) {
  if (!S.q.inPit) return null; const P = G.P, C = G.CAM;
  const yaw = C.yaw, dist = 2.1, cx = P.x + Math.sin(yaw) * dist, cz = P.z + Math.cos(yaw) * dist, d = Math.hypot(cx - PIT.x, cz - PIT.z), R0 = PIT.wall - 0.25;
  const k = d > R0 ? R0 / d : 1, x = PIT.x + (cx - PIT.x) * k, z = PIT.z + (cz - PIT.z) * k, up = clamp(C.pitch, -0.3, 0.9);
  return { x, y: P.y + 1.25 + up * 0.35, z, lx: P.x - Math.sin(yaw) * 0.6, ly: P.y + 1.95 + up * 1.8, lz: P.z - Math.cos(yaw) * 0.6, fov: 1.1 };
}
function speedMul(S, P, mag) { if (S.q.riding && S.q.chariotOk) return P.sprint ? 1.85 : 2.2; if (S.q.chain) return 0.52; if (S.q.bound) return 0.74; if (S.q.inPit) return 0.6; return 1; }
function pose(pst, S, G) {
  const P = G.P;
  if (S.q.riding && S.q.chariotOk) { pst.act = 'charioteer'; pst.actT = 0; pst.speed = 0; pst.staff = false; pst.carry = null; return; }
  if (P.cpose && !pst.act) { pst.act = P.cpose.k; pst.actT = P.cpose.dur ? Math.min(1, P.cpose.t / P.cpose.dur) : (P.cpose.t % 2) / 2; }
}
function rootY(S, G) { return S.q.riding && S.q.chariotOk ? 0.46 : 0; }
const extra = [{ id: 'chariot', label: S => S.q.riding ? '수레 내리기' : '버금 수레 타기', ic: 'donkey', on: S => !!S.q.chariotOk && between(S, 'c5_patrol'),
  click: (S, G) => { S.q.riding = S.q.riding ? 0 : 1; G.sfx(S.q.riding ? 'whoosh' : 'step'); if (S.q.riding) { S.q.rode = 1; G.UI.toast('버금 수레 · 달리기 버튼을 누르면 말이 힘차게 달려요'); G.checkStep(); } G.snapCam(); } }];
extra.push({ id: 'ward', label: '옷장', ic: 'cloth', on: S => !before(S, 'c5_patrol'), click: (S, G) => openWardrobe(S, G) });
function canSleep(S) { return S.step === 'c2_night1' || S.step === 'p_night'; }

// ------------------------------------------------------------------ DYNAMIC MESHES
const MESH = {};
const mk = (k, fn) => { if (!MESH[k]) { const g = new GG.GB(k.length * 7 + 3); fn(g, m4(), rng(k.length * 13 + 1)); MESH[k] = R.mesh(g); } return MESH[k]; };
const Mx = {}; const mat = (k, x, y, z, ry, rx, rz, sx, sy, sz) => m4trs(Mx[k] || (Mx[k] = m4()), x, y, z, ry || 0, rx || 0, rz || 0, sx, sy, sz);
function ropeSeg(list, k, a, b, col) { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-3; const ry = Math.atan2(dx, dz), rx = Math.acos(clamp(dy / L, -1, 1));
  list.push({ mesh: mk('rope', g => g.cyl(0.022, 0.022, 1, 5, { base: true, c: col || 0x8a6a40 })), m: mat(k, a[0], a[1], a[2], ry, rx, 0, 1, L, 1) }); }
const wpos = M => [M[12], M[13], M[14]];
function vineMesh(stage) { return mk('vine' + stage, (g, M, r) => {
  g.cyl(0.07, 0.11, 1.4, 7, { at: [0, 0.7, 0], c: 0x6a4a30 });
  for (let b = 0; b < 3; b++) { const a = (b - 1) * 0.7; const ex = Math.sin(a) * 0.9, ey = 1.4 + 0.6, ez = Math.cos(a) * 0.15; g.cyl(0.035, 0.05, 1.0, 5, { at: [ex / 2, 1.4 + 0.3, ez / 2], rz: -a, c: 0x6a4a30 });
    if (stage >= 1) for (let l = 0; l < 4; l++) g.sph(0.16, 6, 4, { at: [ex * (0.4 + l * 0.2) + (r() - 0.5) * 0.2, 1.5 + l * 0.14, ez + (r() - 0.5) * 0.3], s: [1.3, 0.35, 1], ry: r() * 6, c: [0x5a9a3a, 0x6aaa48][l % 2], flat: true });
    if (stage === 2) for (let f = 0; f < 3; f++) g.sph(0.05, 5, 4, { at: [ex * 0.9 + (r() - 0.5) * 0.2, ey - 0.1 + (r() - 0.5) * 0.15, ez + 0.12], c: 0xf4f0d8 });
    if (stage >= 3) for (let q = 0; q < 9; q++) g.sph(0.065, 6, 4, { at: [ex * 0.95 + (q % 3 - 1) * 0.07, ey - 0.15 - Math.floor(q / 3) * 0.1, ez + 0.14 + (q % 2) * 0.04], c: [0x5a2a5a, 0x6a3a6a][q % 2] }); }
  if (stage >= 3) { g.lathe([[0.02, 0], [0.12, 0.02], [0.05, 0.06], [0.03, 0.2], [0.14, 0.28], [0.17, 0.42]], 10, { at: [0.55, 0.9, 0.5], c: 0xd9a73a }); } }); }
function dreamDyn(list, S, G, t) {
  const fx = RT.dreamFx; if (!fx) return; const x = DREAM.x, z = DREAM.z, h = hAt(x, z), k = RT.dreamK || 0;
  if (fx === 'vine') { const stg = k < 0.3 ? 0 : k < 0.55 ? 1 : k < 0.8 ? 2 : 3; list.push({ mesh: vineMesh(stg), m: mat('vine', x, h, z, 0.4, 0, 0, 0.6 + k * 0.6), emis: [0.25, 0.22, 0.12] }); }
  if (fx === 'baskets') { list.push({ mesh: mk('baskets', g => { for (let i = 0; i < 3; i++) { g.cyl(0.42 - i * 0.03, 0.36 - i * 0.03, 0.32, 12, { at: [0, 1.2 + i * 0.34, 0], c: 0xf4ecd8 }); g.cyl(0.36 - i * 0.03, 0.36 - i * 0.03, 0.04, 12, { at: [0, 1.37 + i * 0.34, 0], c: 0xd8b070 }); }
      for (let q = 0; q < 6; q++) g.sph(0.08, 6, 4, { at: [Math.cos(q) * 0.2, 2.25, Math.sin(q) * 0.2], s: [1.4, 0.6, 1], c: 0xc88848 }); }), m: mat('bsk', x, h, z, 0), emis: [0.3, 0.28, 0.2] });
    for (let i = 0; i < 5; i++) { const a = t * (0.9 + i * 0.13) + i * 1.3, r = 1.1 + Math.sin(t * 0.7 + i) * 0.3 - k * 0.6, y = h + 2.6 + Math.sin(t * 2 + i) * 0.25 - k * 0.3;
      list.push({ mesh: mk('bird', g => { g.sph(0.09, 6, 4, { s: [0.7, 0.6, 1.4], c: 0x2a2420 }); g.tri([0, 0.02, 0.02], [-0.32, 0.06, -0.05], [0, 0.02, -0.08], { c: 0x2a2420 }); g.tri([0, 0.02, 0.02], [0, 0.02, -0.08], [0.32, 0.06, -0.05], { c: 0x2a2420 }); }),
        m: mat('bird' + i, x + Math.cos(a) * r, y, z + Math.sin(a) * r, -a, 0, Math.sin(t * 14 + i) * 0.5) }); } }
  if (fx === 'sheaves') { for (let i = 0; i < 12; i++) { const center = i === 11, a = i / 11 * Math.PI * 2, R0 = center ? 0 : 2.2, sx = x + Math.cos(a) * R0, sz = z + Math.sin(a) * R0;
      const bow = center ? 0 : k * 0.55, ry = Math.atan2(x - sx, z - sz);
      list.push({ mesh: mk('sheaf', g => { g.cyl(0.18, 0.26, 1.0, 8, { base: true, c: 0xe2b844, j: 0.06 }); g.cyl(0.27, 0.27, 0.07, 8, { at: [0, 0.55, 0], c: 0xb88a2a }); for (let q = 0; q < 8; q++) g.cyl(0.02, 0.03, 0.4, 3, { at: [Math.cos(q) * 0.12, 1.12, Math.sin(q) * 0.12], rx: Math.sin(q) * 0.3, rz: Math.cos(q) * 0.3, c: 0xf0d060 }); }),
        m: mat('shf' + i, sx, hAt(sx, sz), sz, ry, bow, 0, center ? 1.25 : 1), emis: center ? [0.4, 0.32, 0.1] : [0.18, 0.14, 0.05] }); } }
}
function earsDyn(list, S, G, t) {
  if (!RT.ears) return; const v = VISION[3], w = VISION[4], k = RT.earK || 0, sw = RT.swallow || 0;
  const stalk = (key, good) => mk(key, g => { g.cyl(0.02, 0.035, 1.3, 4, { base: true, c: good ? 0x8aa040 : 0x9a8a5a });
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, y = 1.0 + (i % 3) * 0.12; g.cyl(0.01, 0.012, 0.3, 3, { at: [Math.cos(a) * 0.1, y, Math.sin(a) * 0.1], rz: Math.cos(a) * 0.6, rx: -Math.sin(a) * 0.6, c: good ? 0x8aa040 : 0x8a7a50 });
      g.sph(good ? 0.07 : 0.035, 6, 4, { at: [Math.cos(a) * 0.24, y + 0.16, Math.sin(a) * 0.24], s: [0.8, good ? 2.2 : 2.6, 0.8], c: good ? 0xe8c040 : 0x9a8058 }); } });
  const gs = RT.ears === 'good' ? k : 1; if (sw < 0.98) list.push({ mesh: stalk('earG', true), m: mat('earG', v.x, hAt(v.x, v.z), v.z, t * 0.05, Math.sin(t * 0.8) * 0.04, 0, gs * 1.3 * (1 - sw)), emis: [0.3, 0.25, 0.08] });
  if (RT.ears === 'both') list.push({ mesh: stalk('earT', false), m: mat('earT', w.x, hAt(w.x, w.z), w.z, 0, Math.sin(t * 3) * 0.12, Math.sin(t * 2.3) * 0.1, k * 1.3) });
}
function dyn(list, S, G, t) {
  const P = G.P, W = G.W();
  // v16.9 the things to pack before the road actually lie there (the action used to float beside the jars over nothing)
  if (S.step === 'p_provision' || S.step === 'p_wake' || S.step === 'p_jacob') {
    if (!S.q.bread) list.push({ mesh: mk('provBread', g => { g.cyl(0.26, 0.2, 0.16, 12, { at: [0, 0.08, 0], c: 0xa57a3c }); g.cyl(0.25, 0.25, 0.02, 12, { at: [0, 0.17, 0], c: 0x7a5530 });
      for (let i = 0; i < 4; i++) g.sph(0.085, 8, 5, { at: [Math.cos(i * 1.6) * 0.11, 0.21, Math.sin(i * 1.6) * 0.11], s: [1, 0.55, 1], c: 0xd8a860 });
      for (let i = 0; i < 3; i++) g.sph(0.045, 6, 4, { at: [Math.cos(i * 2.1 + 0.6) * 0.06, 0.27, Math.sin(i * 2.1 + 0.6) * 0.06], c: 0x6a3a52 }); }), m: mat('provBread', 172.5, hAt(172.5, 157), 157, 0.4), outline: true });
    if (!S.q.skin) list.push({ mesh: mk('provSkin', g => { g.sph(0.2, 10, 8, { at: [0, 0.16, 0], s: [1.25, 0.75, 0.85], c: 0x7a5034 }); g.cyl(0.035, 0.045, 0.12, 6, { at: [0.26, 0.24, 0], rz: -1.1, c: 0x6a4228 });
      g.cyl(0.012, 0.012, 0.5, 4, { at: [0, 0.3, 0], rz: 1.5708, c: 0x3a2a1a }); }), m: mat('provSkin', 182.2, hAt(182.2, 155.2), 155.2, 1.1), outline: true }); }
  // the rope: last camel → Joseph's hands
  if (S.step === 'c1_caravan' && S.q.bound && RT.car) { const n = G.npc('camel3'); if (n && n.vis) { const a = [n.x - Math.sin(n.face) * 0.9, n.y + 1.2, n.z - Math.cos(n.face) * 0.9], h = wpos(P.rig.world[HBI.handR]), mid = [(a[0] + h[0]) / 2, Math.min(a[1], h[1]) - 0.35, (a[2] + h[2]) / 2];
    ropeSeg(list, 'r1', a, mid); ropeSeg(list, 'r2', mid, h); } }
  // the second chariot and its horses
  if (S.q.riding && S.q.chariotOk) {
    const f = P.face, y = P.y + (G.EP().rootY ? 0 : 0);
    list.push({ mesh: mk('chariot', g => { g.box(1.3, 0.08, 1.0, { at: [0, 0.42, 0], c: 0x8a6440 }); g.box(1.3, 0.62, 0.06, { at: [0, 0.74, 0.48], c: 0xd9a73a }); for (const s of [1, -1]) { g.box(0.06, 0.5, 0.95, { at: [s * 0.62, 0.7, 0], c: 0xd9a73a }); g.cyl(0.42, 0.42, 0.07, 14, { at: [s * 0.74, 0.42, -0.1], rz: Math.PI / 2, c: 0x6a4a30 }); g.cyl(0.06, 0.06, 0.14, 6, { at: [s * 0.78, 0.42, -0.1], rz: Math.PI / 2, c: 0xd9a73a }); }
      g.box(0.08, 0.08, 2.2, { at: [0, 0.6, 1.5], rx: -0.15, c: 0x8a6440 }); g.box(1.8, 0.07, 0.07, { at: [0, 0.82, 2.55], c: 0x8a6440 }); band2(g); }), m: mat('char', P.x, y, P.z, f), outline: true });
    for (const s of [1, -1]) { const hx = P.x + Math.sin(f) * 3.0 + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * 3.0 - Math.sin(f) * s * 0.55; RT.hph = (RT.hph || 0) + 0; }
  }
  // the banquet table
  if (S.step === 'c2_banquet') list.push({ mesh: mk('feast', g => { ENVX.tableEg(g, m4()); for (let i = 0; i < 4; i++) { g.lathe([[0.05, 0], [0.16, 0.1], [0.18, 0.32], [0.08, 0.5], [0.1, 0.55]], 8, { at: [-0.6 + i * 0.4, 0.84, -0.15], c: [0x8a3a3a, 0xc8865a, 0xd8b860, 0x6a4a6a][i] }); }
      for (let i = 0; i < 5; i++) g.sph(0.09, 6, 4, { at: [-0.5 + i * 0.25, 0.9, 0.2], s: [1.4, 0.7, 1], c: 0xd8a060 }); for (let i = 0; i < 7; i++) g.sph(0.05, 5, 4, { at: [0.3 + (i % 3) * 0.1, 0.9, 0.18 + Math.floor(i / 3) * 0.08], c: 0x6a3a5a }); }), m: mat('feast', -38.4, hAt(-38.4, 43.7), 43.7, 0), outline: true });
  // the garment left in her hand (창 39:12)
  if (S.q.robe && between(S, 'c2_flee', 'c2_flee')) { const n = G.npc('wife'); if (n && n.vis) list.push({ mesh: mk('robe', g => { g.box(0.5, 0.9, 0.06, { at: [0, -0.45, 0], c: 0xe8dcc0 }); g.box(0.52, 0.12, 0.07, { at: [0, -0.86, 0], c: 0x9a6a3a }); }), m: n.rig.world[HBI.handR], outline: true }); }
  // days scratched on the wall
  if (between(S, 'c3_wait') && (S.q.wait || 0) >= 2 && before(S, 'c4_court')) list.push({ mesh: mk('marks', g => { for (let i = 0; i < 24; i++) g.box(0.02, 0.22, 0.01, { at: [(i % 12) * 0.07 + Math.floor((i % 12) / 4) * 0.04, Math.floor(i / 12) * 0.3, 0], rz: (i % 4 === 3) ? 0.9 : 0.05, c: 0x5a4a38 }); }), m: mat('marks', -20.62, hAt(-20.6, -6.4) + 1.2, -6.8, Math.PI / 2) });
  // grain piled before the granaries
  const sacks = RT.sacks || (between(S, 'c5_years') ? 3 : 0);
  if (sacks) for (const s of sites) if (S.built[s.id] || S.step === 'c5_years') list.push({ mesh: mk('sacks' + sacks, (g, M, r) => { for (let i = 0; i < sacks * 7; i++) g.sph(0.32, 7, 5, { at: [(i % 7) * 0.62 - 1.9 + (r() - 0.5) * 0.1, 0.25 + Math.floor(i / 7) * 0.42, (Math.floor(i / 7) % 2) * 0.3], s: [1, 0.85, 0.8], c: [0xd8c49a, 0xc8b080, 0xe2cfa0][i % 3] }); }), m: mat('sk' + s.id, s.x, hAt(s.x, s.z + 4.4), s.z + 4.4, 0), outline: true });
  dreamDyn(list, S, G, t); earsDyn(list, S, G, t);
}
function band2(g) { for (let i = 0; i < 6; i++) g.box(0.2, 0.08, 0.02, { at: [-0.5 + i * 0.2, 0.92, 0.52], c: [0x2c5aa0, 0xb3472e, 0x2f8a77][i % 3] }); }
const HR = { rigs: [new Rig(AB.horse), new Rig(AB.horse)], ph: 0 };
function skinned(list, S, G, t) {
  for (const c of RT.cows) if (c.st !== 'hidden' && c.eaten < 0.99) list.push({ mesh: c.mesh, bones: c.rig.bones, outline: true, tint: c.thin ? [0.72, 0.66, 0.62] : null });
  if (S.q.riding && S.q.chariotOk) { const P = G.P, f = P.face; HR.ph += P.spd * 0.016 * 1.6;
    HR.rigs.forEach((rig, i) => { const s = i ? 1 : -1, hx = P.x + Math.sin(f) * 3.0 + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * 3.0 - Math.sin(f) * s * 0.55;
      animAnimal(rig, { speed: P.spd * 0.55, phase: HR.ph + i * 0.4, graze: false }, t); rig.update(m4trs(HR['M' + i] || (HR['M' + i] = m4()), hx, hAt(hx, hz), hz, f));
      list.push({ mesh: G.animalMesh('horse', i ? 'plain' : 'brown', { saddle: 0xd9a73a }), bones: rig.bones, outline: true }); }); }
}
// light: the moonlight shaft in Joseph's cell, the dream glows
let shaftMesh = null;
function flats(list, S, G, t) {
  const hr = S.time % 24;
  if (between(S, 'c3_cell', 'c4_shave') && (hr > 19 || hr < 5.5 || RT.grace > 0)) {
    if (!shaftMesh) { const g = new GG.GB(2); const top = [[-0.28, 0, -0.1], [0.28, 0, -0.1], [0.28, 0, 0.1], [-0.28, 0, 0.1]], bot = [[-0.7, -2.6, 1.2], [0.7, -2.6, 1.2], [0.7, -2.6, 1.9], [-0.7, -2.6, 1.9]];
      const push = (q, a) => g.d.push(q[0], q[1], q[2], 0, 1, 0, 0.75, 0.85, 1.0, a, 0);
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; push(top[i], 0.35); push(top[j], 0.35); push(bot[j], 0); push(top[i], 0.35); push(bot[j], 0); push(bot[i], 0); }
      shaftMesh = R.mesh(g); }
    const k = RT.grace > 0 ? 0.25 + RT.grace * 0.75 : 0.22; list.push({ mesh: shaftMesh, m: mat('shaft', -18.4, hAt(-18.4, -9) + 2.75, -9.55, 0), color: [1, RT.grace > 0 ? 0.95 : 1, RT.grace > 0 ? 0.75 : 1, k] });
  }
  if (S.q.vision && !GG.Cine.on) { const v = VISION.find(q => !(S.q.seen || {})[q.id]); if (v) { if (!RT.glow) { const g = new GG.GB(3); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2, r = 1.1;
        const q = (ang, y, rr) => [Math.cos(ang) * rr, y, Math.sin(ang) * rr]; for (const [p, al] of [[q(a, 0, r), 0.5], [q(b, 0, r), 0.5], [q(b, 6, r * 0.6), 0], [q(a, 0, r), 0.5], [q(b, 6, r * 0.6), 0], [q(a, 6, r * 0.6), 0]]) g.d.push(p[0], p[1], p[2], 0, 1, 0, 1, 0.9, 0.6, al, 0); }
        RT.glow = R.mesh(g); } list.push({ mesh: RT.glow, m: mat('glow', v.x, hAt(v.x, v.z), v.z, t * 0.3), color: [1, 0.92, 0.7, 0.5 + Math.sin(t * 2.4) * 0.15] }); } }
}

// ------------------------------------------------------------------ LOAD · DAY
function onLoad(S, G) {
  RT.car = null; RT.cows.length = 0; RT.ears = null; RT.dreamFx = null; RT.dust = 0; RT.sacks = 0; RT.grace = 0; RT.lookBack = 0; RT.tut0 = null; RT.preStep = null; GG.Game.musicOverride = null; G.CAM.zoom = 1;
  const want = between(S, 'c6_open') ? 'famine' : between(S, 'c5_years') ? 'plenty' : 'normal';
  if (LAND !== want) { LAND = want; G.W().recolor(color); }
  if (between(S, 'c6_open') && S.step !== 'c6_open') { /* the land stays dry */ }
  if (S.step === 'c1_pit') S.q.inPit = 1; if (!S.q.inPit) G.P.cpose = null;
  if (S.step === 'c2_field' && !S.q.flaxPlanted) { ripe(S, 'pflax', 'flax'); S.q.flaxPlanted = 1; }
  if (between(S, 'c5_year2')) G.unlock('royal');
  G.P.sleeping = false; G.P.sit = false; G.P.kneel = false;
}
function onDay(S, G) { if (between(S, 'c5_patrol', 'c5_years')) { S.silver += 0; } }
function calmWeather(S) { return !!(S.q.vision || RT.dreamFx || S.q.inPit || between(S, 'c2_tempt3', 'c3_cell') || between(S, 'c4_shave', 'c4_answer') || (GG.Opening && GG.Opening.on)); }
function calmSurv() { return true; }
function climate(S, x, z, hr) { if (canaanK(x) > 0.5) return null; return { clear: 0.66, cloudy: 0.12, rain: 0.01, storm: 0, wind: 0.12, dust: LAND === 'famine' ? 0.22 : 0.06, fog: hr > 4 && hr < 8 && fert(x, z) > 0.5 ? 0.08 : 0 }; }
function quiet(S) { return !!(S.q.inPit || S.q.vision || between(S, 'c2_tempt3', 'c3_cell') || S.step === 'c1_caravan' || S.step === 'c3_wait'); }
function ledger(S, G) { const w = Object.keys(S.q.words || {}).length; return { title: '요셉의 기록', rows: [['배운 애굽 말', w + '개'], ['지은 곳간', ['granA', 'granB', 'granC'].filter(k => S.built[k]).length + '채'], ['곡식을 판 사람', Object.keys(S.q.sold || {}).length + '명'], ['지난 날', S.day + '일']] }; }
function worldFacts(S) {
  if (before(S, 'c1_caravan')) return '요셉은 헤브론에 사는 야곱의 열한째 아들로, 채색옷을 입은 열일곱 살 목자 소년이다.';
  if (before(S, 'c3_cell')) return '여기는 애굽 땅이다. 요셉은 가나안에서 팔려 온 히브리 종으로, 친위대장 보디발의 집에서 일한다. 애굽 말을 배우는 중이다.';
  if (before(S, 'c4_court')) return '요셉은 왕의 옥에 갇힌 히브리 사람이다. 간수장이 옥중 일을 그에게 맡겼다.';
  return '요셉은 바로가 세운 애굽의 총리(사브낫바네아)다. 풍년에 오분의 일을 거두어 곳간에 쌓게 했다. 여기는 애굽 땅이고, 사람들은 나일 강을 따라 산다.';
}
function rumors(S) { if (between(S, 'c6_open')) return ['곳간 문이 열렸다오! 총리님 덕에 우리 아이들이 살았소.', '가나안에서도 곡식을 사러 사람들이 온다더군요.'];
  if (between(S, 'c5_patrol')) return ['총리님이 각 성마다 곳간을 짓게 하셨대요.', '버금 수레를 탄 총리님을 봤소? 히브리 사람이라던데.', '올해는 밀이 사람 키만큼 자랐어요!'];
  return ['나일 강이 불어날 철이 다가오오.', '바로의 궁에 새 오벨리스크를 세운다더군요.']; }
const chatter = [
  { a: 'cook', b: 'gardener', when: S => between(S, 'c2_arrive', 'c2_tempt2'), lines: [[0, '세티! 연못 물 좀 쓰자니까.'], [1, '연꽃이 다 죽는다고 몇 번을 말해!']] },
  { a: 'neb', b: 'ameni', when: S => between(S, 'c2_arrive', 'c2_quiz'), lines: [[0, '저 히브리 놈, 말 한마디 못 알아듣던데.'], [1, '두고 보게. 눈빛이 다른 아이야.']] },
  { a: 'prisA', b: 'prisB', when: S => between(S, 'c3_keeper', 'c3_wait'), r: 7, lines: [[0, '저 히브리 사람은 왜 늘 기도하지?'], [1, '그 덕에 우리가 물이라도 마시잖아.']] },
  { a: 'magician', b: 'sage', when: S => between(S, 'c4_court', 'c4_answer'), r: 16, lines: [[0, '히브리 죄수가 바로의 꿈을 푼다고?'], [1, '…우리가 못 푼 꿈이오. 지켜봅시다.']] },
  { a: 'reuben', b: 'judah', when: S => S.step === 'c1_pit', r: 8, lines: [[0, '…해가 지면 내가 우물 쪽을 살펴보겠다.'], [1, '왜, 형? 마음이 약해졌소?']] },
  { a: 'ct_mer', b: 'ct_wat', when: S => between(S, 'c5_patrol'), lines: [[0, '총리님 수레가 지나갔다며?'], [1, '말들이 금빛 굴레를 쓰고 있더래요!']] },
];

// ------------------------------------------------------------------ STORYBOOK OPENING (창 37:2–11), told by old Benjamin
const SV = (body, sky) => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">${sky || ''}${body}</svg>`;
const STARS = (n, seed) => { let s = '', r = rng(seed); for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 320).toFixed(1)}" cy="${(r() * 110).toFixed(1)}" r="${(0.4 + r() * 1.1).toFixed(2)}" fill="#fff6dc" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`; return s; };
const SKY_N = `<defs><linearGradient id="jn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".72" stop-color="#2b3b70"/><stop offset="1" stop-color="#6a5274"/></linearGradient><radialGradient id="jf" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf70" stop-opacity=".85"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs><rect width="320" height="200" fill="url(#jn)"/>`;
const SKY_D = `<defs><linearGradient id="jd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2d8"/><stop offset=".7" stop-color="#f2d8a8"/><stop offset="1" stop-color="#e8b878"/></linearGradient></defs><rect width="320" height="200" fill="url(#jd)"/>`;
const SKY_G = `<defs><linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c66a"/><stop offset=".6" stop-color="#f4dca0"/><stop offset="1" stop-color="#e6a85a"/></linearGradient></defs><rect width="320" height="200" fill="url(#jg)"/>`;
const COATS = (x, y, s) => { const C = ['#b3472e', '#e5b552', '#2f8a77', '#2c5aa0', '#c06a9a', '#f0e6cc']; let o = ''; for (let i = 0; i < 6; i++) o += `<path d="M${x - 9 * s} ${y + i * 5 * s}H${x + 9 * s}V${y + (i + 1) * 5 * s}H${x - 9 * s}z" fill="${C[i]}"/>`; return o; };
const BOY = (x, y, s, c) => `<g><circle cx="${x}" cy="${y - 8 * s}" r="${5 * s}" fill="${c || '#c98a5a'}"/><path d="M${x - 5 * s} ${y - 12 * s}Q${x} ${y - 16 * s} ${x + 5 * s} ${y - 12 * s}" fill="#2a1810"/>${COATS(x, y - 3 * s, s)}<path d="M${x - 4 * s} ${y + 27 * s}V${y + 36 * s}M${x + 4 * s} ${y + 27 * s}V${y + 36 * s}" stroke="#7a5232" stroke-width="${2.4 * s}"/></g>`;
const OPEN_ART = [
  SV(`${STARS(60, 5)}<path d="M0 150Q80 128 160 146T320 140V200H0z" fill="#3b2f48"/><path d="M0 170Q90 152 170 166T320 160V200H0z" fill="#271f33"/>
    <path d="M30 156L56 116L148 108L176 152z" fill="#17121e"/><path d="M92 152L98 124L116 123L120 152z" fill="#f2b45a"/><circle cx="214" cy="160" r="38" fill="url(#jf)"/>
    <path d="M206 166Q208 150 214 142Q218 152 222 156Q224 150 223 146Q230 156 224 166z" fill="#ffb347"/>
    <g fill="#1d1622"><circle cx="248" cy="132" r="7.5"/><path d="M238 128Q248 118 258 128L262 150L236 150z"/><path d="M236 146Q248 140 262 146L268 172L230 172z"/><path d="M244 138Q248 146 252 138" stroke="#d8d0c8" stroke-width="3" fill="none"/></g>
    ${BOY(186, 146, 0.75)}`, SKY_N),
  SV(`<circle cx="262" cy="44" r="18" fill="#fff4c8"/><path d="M0 140Q90 112 170 132T320 120V200H0z" fill="#9ab060"/><path d="M0 160Q100 140 190 156T320 150V200H0z" fill="#7a9448"/>
    ${[...Array(9)].map((_, i) => `<ellipse cx="${30 + i * 32}" cy="${160 + (i % 3) * 8}" rx="9" ry="6" fill="#f2ead8"/><circle cx="${37 + i * 32}" cy="${157 + (i % 3) * 8}" r="3.4" fill="#2a2420"/>`).join('')}
    <g transform="translate(150 70) scale(2.2)">${BOY(0, 0, 1)}</g><path d="M178 58Q200 40 226 50" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`, SKY_D),
  SV(`<path d="M0 150Q90 122 170 142T320 130V200H0z" fill="#b8a070"/><path d="M0 168Q100 150 190 164T320 158V200H0z" fill="#9a8458"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<g fill="#3a2a22" opacity="${0.75 + (i % 2) * 0.2}"><circle cx="${40 + i * 24}" cy="${116 + (i % 2) * 6}" r="7"/><path d="M${32 + i * 24} ${124 + (i % 2) * 6}L${48 + i * 24} ${124 + (i % 2) * 6}L${52 + i * 24} ${160 + (i % 2) * 6}L${28 + i * 24} ${160 + (i % 2) * 6}z"/></g>`).join('')}
    <g transform="translate(262 112) scale(1.1)">${BOY(0, 0, 1)}</g><path d="M218 110Q236 100 246 108" stroke="#7a2a1a" stroke-width="2" fill="none" stroke-dasharray="3 4"/>`, SKY_D),
  SV(`<circle cx="160" cy="40" r="22" fill="#fff0b0" opacity=".9"/>${[...Array(11)].map((_, i) => { const a = (i / 11) * Math.PI * 2, x = 160 + Math.cos(a) * 96, y = 150 + Math.sin(a) * 30; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.cos(a) * -28).toFixed(1)})"><path d="M-7 0L7 0L5 -30L-5 -30z" fill="#d8a83a"/><path d="M-8 -24L8 -24" stroke="#9a6a1a" stroke-width="2.4"/><path d="M-5 -30Q0 -42 5 -30" fill="#f0c860"/></g>`; }).join('')}
    <g transform="translate(160 150)"><path d="M-9 0L9 0L7 -46L-7 -46z" fill="#f0c040"/><path d="M-10 -36L10 -36" stroke="#9a6a1a" stroke-width="3"/><path d="M-7 -46Q0 -64 7 -46" fill="#ffe080"/></g>`, SKY_G),
  SV(`${STARS(40, 9)}<circle cx="120" cy="60" r="20" fill="#ffd060"/><circle cx="210" cy="56" r="12" fill="#f4f0e0"/><circle cx="215" cy="52" r="10" fill="#2b3b70"/>
    ${[...Array(11)].map((_, i) => { const x = 40 + i * 24, y = 100 + Math.sin(i) * 8; return `<path d="M${x} ${y - 6}L${x + 2} ${y - 1}L${x + 7} ${y}L${x + 2} ${y + 2}L${x} ${y + 7}L${x - 2} ${y + 2}L${x - 7} ${y}L${x - 2} ${y - 1}z" fill="#fff6c8"/>`; }).join('')}
    <path d="M0 170Q100 150 200 166T320 160V200H0z" fill="#1d1830"/><g transform="translate(160 160)">${BOY(0, 0, 0.9)}</g><path d="M150 132Q160 124 170 132" stroke="#fff4c8" stroke-width="1" fill="none" opacity=".6"/>`, SKY_N),
  SV(`<defs><radialGradient id="js" cx=".5" cy=".9" r=".7"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".5" stop-color="#f4a860"/><stop offset="1" stop-color="#3a4a80"/></radialGradient></defs><rect width="320" height="200" fill="url(#js)"/>
    <circle cx="160" cy="168" r="34" fill="#fff2c0"/><path d="M0 170Q80 150 160 160T320 152V200H0z" fill="#3a2a30"/><path d="M110 168Q160 120 210 168" fill="#2a1e26"/>
    <g transform="translate(160 132) scale(1.25)">${BOY(0, 0, 1, '#b07a4a')}</g>${STARS(18, 13)}`, '')];
const OPENING = {
  music: 'j_theme', startLabel: '요셉의 이야기 시작하기',
  pages: [
    { art: OPEN_ART[0], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '라헬의 아들', t: '내 형 요셉 이야기를 해 주마. 아버지 야곱에게는 아들이 열둘 있었단다. 그중 요셉 형과 나는 아버지가 가장 사랑하신 라헬 어머니의 아들이었지. 아버지는 늙어서 얻은 요셉 형을 누구보다 사랑하셨어.', ref: '창세기 37:2–3' },
    { art: OPEN_ART[1], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '채색옷', t: '아버지는 요셉 형에게 채색옷을 지어 입히셨단다. 햇빛을 받으면 무지개처럼 빛나는 옷이었지. 열일곱 살 형은 그 옷을 입고 양 떼 사이를 뛰어다녔어.', ref: '창세기 37:3' },
    { art: OPEN_ART[2], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '형들의 눈빛', t: '하지만 형들은 그 옷을 볼 때마다 마음이 어두워졌어. 아버지가 요셉만 사랑하는 것을 보고, 형들은 요셉을 미워하여 그에게 다정한 말 한마디 하지 않았지.', ref: '창세기 37:4', e: 'sad' },
    { art: OPEN_ART[3], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '곡식 단의 꿈', t: '어느 날 형이 꿈 이야기를 했어. 밭에서 곡식 단을 묶는데, 형의 단은 일어서고 형들의 단이 둘러서서 절을 했다는 거야. 형들은 "네가 참으로 우리의 왕이 되겠느냐?" 하며 더욱 미워했단다.', ref: '창세기 37:5–8' },
    { art: OPEN_ART[4], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '해와 달과 열한 별', t: '형은 또 꿈을 꾸었어. 해와 달과 열한 별이 자기에게 절을 했다는 꿈이었지. 아버지는 형을 꾸짖으셨지만… 그 말을 마음에 두셨단다.', ref: '창세기 37:9–11', e: 'awe' },
    { art: OPEN_ART[5], kick: '요셉 편', title: '꿈꾸는 자', t: '형들에게 미움받던 열일곱 살 소년의 꿈은, 어떻게 이루어질까요? 이제 그 길을 직접 걸어 보세요.', ref: '창세기 37–42장', e: 'tender' }],
  setup: true, setupArt: OPEN_ART[5],
  after(S, G) {
    const bx = SPOTS.bedHeb[0], bz = SPOTS.bedHeb[1], h = hAt(bx, bz), jx = 170.6, jz = 150.8;
    const tc = Math.cos(-0.5), ts = Math.sin(-0.5), at = (lx, lz) => [184 + tc * lx + ts * lz, 158 - ts * lx + tc * lz], c1 = at(-0.15, 3.0), c2 = at(0.75, 2.8); // v16.9 shots from the tent's open front
    G.teleport(bx, bz, -2.07); G.P.sleeping = true; S.time = 6.4;
    cine([{ hour: 6.4, cam: [bx + 30, h + 26, bz + 34], cam2: [bx + 6, h + 4, bz + 6], look: [176, h + 1, 152], look2: [bx, h + 0.8, bz], dur: 7, music: 'j_canaan', t: '헤브론 골짜기에 아침이 밝았습니다.', ref: '창세기 37:14' },
      { cam: [c1[0], h + 1.3, c1[1]], look: [bx, h + 0.3, bz], dur: 4.5, fov: 0.72, n: '야곱', t: '요셉아! 요셉아, 일어나거라!', e: 'tender' },
      { fn: () => { G.P.sleeping = false; setTimeout(() => cpose('stretch', 2.2), 1600); }, cam: [c2[0], h + 1.45, c2[1]], look: [bx, h + 0.8, bz], dur: 4.6, fov: 0.8, n: '요셉', t: '네, 아버지! 지금 가요!', e: 'happy' },
      { cam: [jx + 3, hAt(jx, jz) + 1.7, jz + 4], look: [jx, hAt(jx, jz) + 1.4, jz], dur: 4, t: '아버지 야곱이 장막 앞에서 요셉을 기다리고 있었습니다.' }],
    () => { GG.Game.musicOverride = null; narr([{ kick: '조작 안내', title: '프롤로그 · 형들을 찾아서', t: '왼쪽 아래를 끌어 걷고, 오른쪽 화면을 끌어 둘러봐요. 사람이나 물건 가까이에서 A를 누르면 말하거나 챙길 수 있어요. 갈 곳은 오른쪽 위 미니맵의 노란 길과 화살표가 알려 줘요.', ref: '' }]); }, { noSkip: false });
  },
};

// ------------------------------------------------------------------ REGISTER
G.EP.joseph = {
  floor: (x, z) => pitFloor(x, z), // v16.9 the pit collar
  id: 'joseph', title: '요셉 편 · 꿈꾸는 자', hero: '요셉', sub: '창세기 37–47장',
  blurb: '채색옷을 입은 소년이 형들을 찾아 나섰다가 구덩이에 던져집니다. 은 이십에 팔려 애굽의 종이 되고, 누명을 쓰고 옥에 갇혀도 하나님은 그와 함께 하셨습니다. 보디발의 집과 왕의 옥을 지나 바로 앞에 서기까지.',
  chapters: [{ t: '프롤로그 · 형들을 찾아서', r: '창 37:12–17' }, { t: '1장 · 구덩이', r: '창 37:18–36' }, { t: '2장 · 보디발의 집', r: '창 39:1–20' }, { t: '3장 · 왕의 옥', r: '창 39:20–41:14' },
    { t: '4장 · 바로의 꿈', r: '창 41:14–45' }, { t: '5장 · 일곱 해 풍년', r: '창 41:46–52' }, { t: '6장 · 일곱 해 흉년', r: '창 41:53–42:9' }, { t: '7장 · 형제들', r: '창 42:9–45:15' }, { t: '8장 · 고센 땅', r: '창 45:16–47:12' }, { t: '에필로그 · 고센의 이스라엘', r: '창 47' }],
  spec: { size: SIZE, cell: 2, seed: 37, height, color, water: { level: -0.35, shallow: [0.36, 0.62, 0.56], deep: [0.14, 0.32, 0.36] } },
  build, npcs, pens, fields, sites, specials, shops, stations, spots: SPOTS, steps, talk, chatter, envx: ENVX, quests: QUESTS,
  outfits: Object.assign({ default: LOOK.josephCoat }, ...['josephCoat', 'josephPlain', 'josephSlave', 'josephServant', 'josephSteward', 'josephFled', 'josephPrisoner', 'josephFettered', 'josephShaved', 'josephVizier'].map(k => ({ [k]: LOOK[k] })), { prisoner: LOOK.josephPrisoner }, WARD_LOOKS),
  start: { step: 'p_wake', x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1], face: -2.07, time: 6.4, silver: 0, inv: {}, tools: {}, outfit: 'josephCoat' },
  recipes: ['bread', 'bbread', 'linen', 'brick', 'grain', 'grainW', 'hay', 'torch'],
  showStaff: false, rain: 0.02, sleepFrom: 17, titleCam: { x: 176, z: 152, r: 32, h: 9, ty: 1.5 }, titleTime: 17.6, titleMusic: 'j_theme', timeScale: 1,
  mood, update, skinned, dyn, flats, bounds, camera, speedMul, pose, rootY, extra, onDay, onLoad, canSleep, music, ledger, aridAt, waterDist, climate, noRain: false,
  villages, strangers, opening: OPENING, places: PLACES, roads: ROADS, roadD, rumors, worldFacts, quiet, calmWeather, calmSurv,
  heroName: S => between(S, 'c5_patrol') ? '요셉 (사브낫바네아)' : '요셉', settled: (x, z) => PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 10),
  canBuild: () => '요셉 편에서는 정해진 곳간 터에만 지을 수 있어요',
  _dbg: { RT, stage, VISION, WAIT, ORDER, hAt, cin: (k, nx) => ({ cinNight, cinPlot, cinPit, cinSold, cinCaravanNight, cinReveal, cinMarket, cinGrab, cinAccuse, windowPray, cinOfficers, cinBirthday, cinPharaohDream, courtIntro, cinInvest, plentyMontage, cinBrothers })[k](GG.Game.S(), GG.Game, nx || (() => { })) },
};
{ const u0 = G.EP.joseph.update; G.EP.joseph.update = function (dt, S) { if (u0) u0.apply(this, arguments); goshenTick(dt, S); }; } // v16.7 고센 마을
GG.NpcAI && GG.NpcAI.register(G.EP.joseph);
})(window.G);
