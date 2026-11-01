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
