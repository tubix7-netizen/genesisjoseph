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
  scribeR: '왕궁 서기관', maid: '여종', /* v18.21 these two spoke under their code names */
  jacob: '야곱', benjamin: '베냐민', reuben: '르우벤', simeon: '시므온', levi: '레위', judah: '유다', dan: '단', naphtali: '납달리', gad: '갓', asher: '아셀',
  issachar: '잇사갈', zebulun: '스불론', man: '들의 사람', ishmael: '이스마엘 상인', ishBoy: '대상의 아이', midian: '미디안 상인', dinah: '디나', leah: '레아', hServ: '야곱의 종',
  auctioneer: '노예 상인', potiphar: '보디발', wife: '보디발의 아내', ameni: '늙은 종 아메니', neb: '청지기 네브', cook: '요리사 헤누', gardener: '정원지기 앙쿠', boy: '소 치는 아이 파이',
  weaver: '베 짜는 여인 타뮈', scribe: '서기관 이피', guest1: '왕궁 관리', guest2: '신전 제사장', guest3: '군대 장교', keeper: '간수장', cupbearer: '술 맡은 관원장', baker: '떡 굽는 관원장',
  oldP: '늙은 죄수 파네브', youngP: '어린 죄수', prisA: '죄수 케티', prisB: '죄수 메루', messenger: '바로의 사자', pharaoh: '바로', magician: '애굽의 점술가', sage: '애굽의 현인',
  asenath: '아스낫', manasseh: '므낫세', ephraim: '에브라임', overseerW: '서쪽 마을 촌장', overseerS: '남쪽 마을 촌장', overseerC: '성읍 감독관', brick: '벽돌 굽는 이 우니',
  farmer: '애굽 농부', woman: '애굽 여인', elder: '애굽 노인', sidon: '시돈의 상인', edom: '에돔의 목자', canaan: '가나안의 나그네', steward2: '요셉의 청지기',
  cartMan: '왕궁 수레지기 호리', kaiClerk: '서기 카이' /* v18.58 these two spoke under their code names */ };
const J = (t, ref, e) => ({ n: '요셉', t, ref, e });
const N = (id, t, ref, e) => ({ n: NM[id] || id, t, ref, e });
const T = (t, ref, e) => ({ n: '', t, ref, e });
const EG = (id, eg, ko, e) => ({ n: NM[id] || id, t: eg + (ko ? '\n(' + ko + ')' : ''), say: ko || eg, e }); // Egyptian line, Korean gloss

// ------------------------------------------------------------------ MAP
/* v18.35 the dream land stands far off the map (js/dreamworld.js) */
const DWX = 2000, DWZ = 0, DWY = 240; G.DWORLD = { X: DWX, Z: DWZ, Y: DWY };
const SIZE = 480;
const nileX = z => -92 + 13 * Math.sin(z / 74) + 5 * Math.sin(z / 23 + 1);
const brookZ = x => 84 + 4 * Math.sin(x / 9);                        // 헤브론 북쪽 마른 시내(와디)
const FORDS = [-60, 100];
const PIT = { x: 168, z: -140, r: 3.0, wall: 2.35, depth: 4.4 };       // 도단의 빈 구덩이 (창 37:24)
const ROADS = [
  /* v18.67 the road winds through the hill country (Hebron → Shechem ≈ 320 m, Shechem → Dothan ≈ 190 m): Joseph walks it day by day */
  [[176, 146], [178, 130], [160, 120], [134, 112], [128, 96], [146, 86], [176, 82], [192, 74], [194, 58], [176, 50], [150, 46], [134, 36], [140, 22], [162, 16], [186, 10], [186, 4], [184, -30], [178, -48], [156, -56], [136, -66], [138, -82], [160, -90], [169, -104], [165, -132]],   // 헤브론 → 세겜 → 도단
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
const goshK = (x, z) => 0.8 * (1 - smooth(16, 34, Math.hypot(x - 78, z - 56))); // v18.42 고센: 「애굽의 좋은 땅」(창 47:6) — 풀 많은 목초지 (색·풀만, 땅 높이는 그대로)
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
/* v18.36 great houses stand on level ground (floors were 1.3 m out of true inside one house) */
const LEVEL = [[-51, -5, 26, 70, 4, 7], [-45.5, -14.5, -10.5, 14.5, 4.8, 6], [-55, -5, -213.5, -142, 4.19, 10]];
const inLevel = (x, z, m) => LEVEL.some(q => x > q[0] - m && x < q[1] + m && z > q[2] - m && z < q[3] + m);
function height(x, z) { let h = height1(x, z); for (const q of LEVEL) { const dx = Math.max(q[0] - x, 0, x - q[1]), dz = Math.max(q[2] - z, 0, z - q[3]), d = Math.hypot(dx, dz); if (d < q[5]) h = lerp(h, q[4], 1 - smooth(0, q[5], d)); } return h; }
function height1(x, z) {
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
function aridAt(x, z) { const C = canaanK(x); return clamp((1 - Math.max(fert(x, z), goshK(x, z))) * (1 - C) * 0.9 + C * 0.25, 0, 1); }
function waterDist(x, z) { return Math.max(0, Math.abs(x - nileX(z)) - 8); }
// season of the land: 'normal' | 'plenty' | 'famine' (ch5/6 recolour the terrain)
let LAND = 'normal';
/* v18.35b indoors: tiled floors, so no grass grows through them */
const INDOOR = [[-41.5, -14.5, 26.5, 47], [-14, -7, 40, 50], [-18, -7, 59, 70], [-45, -15, -10, 14], [-54.5, -5.5, -213, -163]];
function color(x, z, h, ny) { const c = color1(x, z, h, ny); for (const q of INDOOR) if (x > q[0] && x < q[1] && z > q[2] && z < q[3]) { c[3] = 0; break; } return c; }
function color1(x, z, h, ny) {
  const n = fbm(x * 0.045, z * 0.045, 3), n2 = vnoise(x * 0.18, z * 0.18), C = canaanK(x), F = Math.max(fert(x, z), goshK(x, z)) * (1 - C);
  const sand = [0.79 + n * 0.15, 0.64 + n * 0.16, 0.43 + n * 0.13 + n2 * 0.025];
  let c = sand, dens = 0.08 + n * 0.08;
  // Canaan: green-gold hill pasture with grey limestone
  if (C > 0) { const dry = smooth(0.32, 0.76, n + 0.12*(1-ny));
    const g = [0.32 + dry*0.36, 0.52 + dry*0.13, 0.31 - dry*0.065 + n2*0.04]; c = c.map((v, i) => lerp(v, g[i], C)); dens = lerp(dens, 0.8 * (0.6 + 0.4 * n), C);
    const rock = smooth(0.3, 0.5, 1 - ny) * 0.9 + Math.max(0, n2 - 0.72) * 2; if (rock > 0) { c = c.map((v, i) => lerp(v, [0.72, 0.69, 0.62][i] * (0.92 + n2 * 0.1), clamp(rock, 0, 1) * C)); dens *= 1 - clamp(rock, 0, 0.9); } }
  // Egypt: black fertile soil and green fields near the river
  if (F > 0) { const lush = LAND === 'famine' ? [0.62, 0.52, 0.34] : LAND === 'plenty' ? [0.3, 0.6, 0.2] : [0.36, 0.56, 0.24];
    const soil = LAND === 'famine' ? [0.55, 0.46, 0.33] : [0.32, 0.28, 0.2];
    const growth = smooth(-0.42, 0.26, Math.sin(x*0.21+n) * Math.sin(z*0.17+n2));
    const field = soil.map((v,i) => lerp(v,lush[i],growth));
    c = c.map((v, i) => lerp(v, lerp(field[i], lush[i], 0.5) * (0.92 + n * 0.12), F)); dens = lerp(dens, LAND === 'famine' ? 0.12 : LAND === 'plenty' ? 1 : 0.85, F); }
  // rocky desert plateaus
  const west = smooth(-150, -185, x); if (west > 0) { c = c.map((v, i) => lerp(v, [0.84, 0.7, 0.5][i] * (0.94 + n2 * 0.08), west)); dens *= 1 - west; }
  if (x > 120) { const db = Math.abs(z - brookZ(x)); if (db < 3.5) { const k = 1 - smooth(1.2, 3.5, db); c = c.map((v, i) => lerp(v, [0.7, 0.66, 0.58][i] * (0.9 + n2 * 0.2), k)); dens *= 1 - k * 0.8; } }
  const dw = waterDist(x, z); if (dw < 6) { const k = 1 - smooth(1.5, 6, dw); c = c.map((v, i) => lerp(v, [0.42, 0.4, 0.3][i], k * 0.8)); dens *= 1 - k * 0.7; }
  for (const p of PADS) if (p.set) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r) { const k = 1 - smooth(p.r * 0.55, p.r, d); const pc = C > 0.5 ? [0.74, 0.66, 0.5] : [0.85, 0.77, 0.6]; c = c.map((v, i) => lerp(v, pc[i] * (0.95 + n2 * 0.08), k * 0.85)); dens *= 1 - k; } }
  const rd = roadD(x, z); if (rd < 3) { const k = 1 - smooth(1.1, 2.4 + n2*0.6, rd); c = c.map((v, i) => lerp(v, [0.82, 0.69, 0.49][i]*(0.89+0.15*n2), k * 0.94)); dens *= 1 - k; }
  const dp = Math.hypot(x - PIT.x, z - PIT.z); if (dp < PIT.r + 2) { c = [0.55, 0.47, 0.38]; dens = 0; }
  { const db = Math.hypot(x - SPOTS.restBed[0], z - SPOTS.restBed[1]); if (db < 2.8) dens *= smooth(1.7, 2.8, db); } /* v18.42 trampled ground round the first night's straw bed: no grass through Joseph's body */
  const e = Math.max(Math.abs(x), Math.abs(z)); if (e > 196) { const k = smooth(196, 225, e); c = c.map((v, i) => lerp(v, C > 0.5 ? [0.58, 0.56, 0.48][i] : [0.78, 0.64, 0.46][i], k)); }
  if (LAND === 'famine') dens *= 0.35;
  return [c[0], c[1], c[2], dens];
}
// named places
const SPOTS = {
  hebron: [176, 152], jacobTent: [170, 147], josephTent: [183, 157], bedHeb: [184.21, 158.61], log: [181.1, 84], restOak: [186, 32], restBed: [189.2, 32.4], /* v18.41 off the road, in front of the oak beside the fire */
  waystone: [181, 131], shadeOak: [139, 108], micah: [160, 97], micahTent: [165, 101], micahLamb: [116, 90], hamlet: [118, 32], hamletWell: [124, 29], shechemView: [146, 19], clue4: [200, -6], gorge: [137, -74], dothanWell: [158, -98], /* v18.67 the prologue's new places (e_prologue.js) */
  shechem: [188, -12], clue1: [178, -6], clue2: [197, -21], clue3: [186, -31], manSpot: [196, -36], dothanView: [169, -100], dothanCamp: [160, -148],
  caravanStart: [200, -154], caravanNight: [60, -28], egyptGate: [26, 86], market: [-8, 118], block: [-10, 114],
  pGate: [-28, 71], pHouse: [-28, 42], quarters: [-45, 53], kitchen: [-12, 45], well: [-38, 61], pool: [-18, 58], store: [-12, 64], loom: [-44, 64], quern: [-12.3, 45.2],
  flax: [6, 44], barley: [6, 61], cattle: [9, 76], canal: [-1.5, 70], prisonGate: [-30, 14], cell: [-18, -5.5], window: [-18, -8], yard: [-32, 3], keeperHouse: [-19, 7], basin: [-40, 9],
  city: [-22, -72], granaryA: [16, -64], temple: [12, -96], palaceGate: [-30, -140], throne: [-30, -175], court: [-30, -166], josephHouse: [10, -140], dream: [-78, -200],
  westVillage: [-140, -40], granaryB: [-152, -20], southVillage: [-145, 128], granaryC: [-160, 150], fordN: [-92, -60], fordS: [-80, 100] };
const PLACES = [{ n: '헤브론 골짜기', x: 176, z: 152, k: 'town' }, { n: '상수리나무 쉼터', x: 186, z: 32 }, { n: '세겜 들판', x: 188, z: -12, k: 'town' }, { n: '도단', x: 160, z: -148, k: 'town' },
  { n: '광야 길', x: 70, z: -30 }, { n: '노예 장터', x: -8, z: 118, k: 'town' }, { n: '보디발의 집', x: -28, z: 53, k: 'town' }, { n: '왕의 옥', x: -30, z: 2 }, { n: '왕의 도성', x: -22, z: -72, k: 'town' },
  { n: '바로의 궁', x: -30, z: -162, k: 'town' }, { n: '총리의 집', x: 10, z: -140 }, { n: '성읍 곳간', x: 16, z: -64 }, { n: '온의 신전', x: 12, z: -96 }, { n: '나일 강', x: -96, z: 20 },
  { n: '서쪽 마을', x: -140, z: -40, k: 'town' }, { n: '남쪽 마을', x: -145, z: 128, k: 'town' }, { n: '피라미드', x: -200, z: -170 }, { n: '고센 땅 (애굽 동쪽 목초지)', x: 78, z: 60 }, { n: '북쪽 나루', x: -92, z: -60 }, { n: '남쪽 나루', x: -80, z: 100 }];

// ------------------------------------------------------------------ props for this episode
const PI = Math.PI;
const WHITE = 0xeee6d2, SAND = 0xe4d2a9, LAPIS = 0x2c5aa0, OCHRE = 0xb3472e, TURQ = 0x2f8a77, GOLD = 0xd9a73a, MUD = 0xc49a6c, WOOD = 0x7a5a3a, LINEN = 0xf4efe2;
const band = (g, M, w, y, d, z) => { g.box(w, 0.22, 0.04, { m: M, at: [0, y, z], c: (x) => [LAPIS, OCHRE, TURQ, GOLD][Math.floor((x + w) * 1.4) % 4], j: 0 }); };
/* v18.35 pools you can stand in: the rim is a little step (EP.floor), the bed is the ground, the water comes up to the ankles; only people on a schedule are kept out by a collider */
G.WADE = []; G.wade = (W, x, z, w, d) => { G.WADE.push({ x, z, w, d, y: W.heightAt(x, z) }); for (const s of [1, -1]) { W.addCol({ x, z: z + s * (d / 2 + 0.2), w: w + 0.8, d: 0.4, h: 0.42, npcOnly: true }); W.addCol({ x: x + s * (w / 2 + 0.2), z, w: 0.4, d, h: 0.42, npcOnly: true }); } };
const ENVX = {
  egWall(g, M, r, len, h, col) { h = h || 3; const c = col || WHITE; g.box(len, h, 0.7, { m: M, at: [0, h / 2, 0], c, j: 0.02 }); g.box(len + 0.1, 0.18, 0.86, { m: M, at: [0, h + 0.06, 0], c: 0xd8c8a8, j: 0.02 }); },
  mudWall(g, M, r, len, h) { h = h || 2.4; const n = Math.max(1, Math.round(len / 2)); for (let i = 0; i < n; i++) g.box(len / n + 0.02, h, 0.6, { m: M, at: [-len / 2 + (i + 0.5) * len / n, h / 2, 0], c: [0xc49a6c, 0xbc9264, 0xcaa274][i % 3], j: 0.03 }); },
  tileFloor(g, M, r, w, d, a, b, t) { t = t || 1.5; const nx = Math.max(1, Math.round(w / t)), nz = Math.max(1, Math.round(d / t)), tw = w / nx, td = d / nz; for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) g.box(tw - 0.03, 0.05, td - 0.03, { m: M, at: [-w / 2 + (i + 0.5) * tw, 0.03, -d / 2 + (k + 0.5) * td], c: (i + k) % 2 ? (a || 0xe8dcc4) : (b || 0xcdbb98), j: 0.015 }); g.box(w, 0.03, d, { m: M, at: [0, 0.012, 0], c: 0x9a8a6a, j: 0 }); },
  pillarEg(g, M, r, h) { h = h || 4; g.cyl(0.42, 0.46, 0.22, 12, { m: M, at: [0, 0.11, 0], c: 0xcdbb98, j: 0 }); g.cyl(0.3, 0.34, h - 0.3, 12, { m: M, at: [0, (h - 0.3) / 2, 0], c: SAND, j: 0.02 }); g.cyl(0.46, 0.3, 0.5, 12, { m: M, at: [0, h - 0.45, 0], c: TURQ }); for (const y of [0.3, 0.5, 0.7]) g.cyl(0.33, 0.33, 0.14, 12, { m: M, at: [0, h * y, 0], c: y === 0.5 ? LAPIS : OCHRE, j: 0 }); },
  brickTower(g, M, r, w, d, h) { g.box(w, h, d, { m: M, at: [0, h / 2, 0], c: 0xd8c8a8, j: 0.03 }); g.box(w + 0.3, 0.4, d + 0.3, { m: M, at: [0, h + 0.2, 0], c: 0xc4b08a }); for (const s of [1, -1]) g.box(w + 0.02, 0.35, 0.02, { m: M, at: [0, h * 0.72, s * (d / 2 + 0.01)], c: 0x2c5aa0, j: 0 }); for (let i = 0; i < Math.floor(w / 0.7); i++) g.box(0.36, 0.3, d + 0.36, { m: M, at: [-w / 2 + 0.35 + i * 0.7, h + 0.55, 0], c: 0xc4b08a, j: 0 }); }, /* v18.55 */
  slab(g, M, r, w, d, y) { g.box(w, 0.32, d, { m: M, at: [0, y + 0.16, 0], c: 0xe6dcc4, j: 0.02 }); g.box(w, 0.03, d, { m: M, at: [0, y - 0.015, 0], c: 0x27477e, j: 0 }); for (let i = 0; i < 260; i++) g.box(0.13, 0.02, 0.13, { m: M, at: [(r() - 0.5) * w, y - 0.04, (r() - 0.5) * d], ry: 0.78, c: 0xf0d070, j: 0 }); g.box(w + 0.3, 0.14, d + 0.3, { m: M, at: [0, y + 0.36, 0], c: 0xc8a050, j: 0 }); },
  frieze(g, M, r, len, y) { y = y || 3; g.box(len, 0.5, 0.03, { m: M, at: [0, y, 0], c: 0xf0e6cc, j: 0 }); g.box(len, 0.07, 0.04, { m: M, at: [0, y + 0.25, 0], c: LAPIS, j: 0 }); g.box(len, 0.07, 0.04, { m: M, at: [0, y - 0.25, 0], c: OCHRE, j: 0 }); const n = Math.floor(len / 0.62); for (let i = 0; i < n; i++) { const x = -len / 2 + (i + 0.5) * len / n; g.cyl(0.015, 0.1, 0.22, 6, { m: M, at: [x, y + 0.02, 0.02], s: [1, 1, 0.2], c: [TURQ, GOLD, OCHRE][i % 3], j: 0 }); g.sph(0.045, 6, 4, { m: M, at: [x + len / n / 2, y, 0.02], s: [1, 1, 0.3], c: LAPIS, j: 0 }); } },
  plainRoof(g, M, r, w, d, y, c) { g.box(w, 0.2, d, { m: M, at: [0, y + 0.1, 0], c: c || 0xd8c8a4, j: 0.02 }); for (let i = 0; i < 7; i++) g.box(w - 0.3, 0.1, 0.14, { m: M, at: [0, y - 0.05, -d / 2 + (i + 0.5) * d / 7], c: 0x7a5a3a, j: 0.03 }); },
  lintel(g, M, r, w, y0, y1) { g.box(w + 0.1, y1 - y0, 0.72, { m: M, at: [0, (y0 + y1) / 2, 0], c: WHITE, j: 0.02 }); g.box(w + 0.1, 0.16, 0.76, { m: M, at: [0, y0 + 0.1, 0], c: OCHRE, j: 0 }); },
  prisonWall(g, M, r, len, h) { h = h || 3.4; g.box(len, 0.9, 0.72, { m: M, at: [0, 0.45, 0], c: 0xa89a84, j: 0.05 }); g.box(len, h - 0.9, 0.6, { m: M, at: [0, 0.9 + (h - 0.9) / 2, 0], c: 0xe0d2b4, j: 0.02 }); g.box(len + 0.04, 0.22, 0.64, { m: M, at: [0, h - 0.55, 0], c: 0x2c5a8a, j: 0 }); g.box(len + 0.04, 0.08, 0.65, { m: M, at: [0, h - 0.7, 0], c: OCHRE, j: 0 }); g.box(len + 0.1, 0.2, 0.84, { m: M, at: [0, h + 0.04, 0], c: 0xcdbb98, j: 0.02 }); const n = Math.floor(len / 1.4); for (let i = 0; i < n; i++) g.box(0.5, 0.26, 0.5, { m: M, at: [-len / 2 + (i + 0.5) * len / n, h + 0.26, 0], c: 0xd8c8a8, j: 0.03 }); },
  portico(g, M, r, w, d, h, n, gap, colR) { // flat roof on painted papyrus columns + back wall: the open front hall of a great house
    h = h || 4; n = n || 6; if (gap) { /* v18.35 the hall of Potiphar's house goes on through the back wall */ const lw = gap[0] + w / 2, rw = w / 2 - gap[1]; g.box(lw, h, 0.6, { m: M, at: [-w / 2 + lw / 2, h / 2, -d / 2], c: WHITE, j: 0.02 }); g.box(rw, h, 0.6, { m: M, at: [w / 2 - rw / 2, h / 2, -d / 2], c: WHITE, j: 0.02 }); } else { g.box(w, h, 0.6, { m: M, at: [0, h / 2, -d / 2], c: WHITE, j: 0.02 }); band(g, M, w, h - 0.6, 0, -d / 2 + 0.31); }
    for (const s of [1, -1]) g.box(0.6, h, d, { m: M, at: [s * (w / 2 - 0.3), h / 2, 0], c: WHITE, j: 0.02 });
    for (let i = 0; i < n; i++) { const x = colR ? colR[0] + i * (colR[1] - colR[0]) / (n - 1) : -w / 2 + 1.2 + i * (w - 2.4) / (n - 1); g.cyl(0.3, 0.34, h - 0.3, 10, { m: M, at: [x, (h - 0.3) / 2, d / 2 - 0.5], c: SAND, j: 0.02 }); g.cyl(0.46, 0.3, 0.5, 10, { m: M, at: [x, h - 0.45, d / 2 - 0.5], c: TURQ }); g.cyl(0.32, 0.32, 0.16, 10, { m: M, at: [x, h * 0.7, d / 2 - 0.5], c: OCHRE }); }
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
  /* v18.35 the rear wing of Potiphar's house: the hall runs on to a wall with one door; behind it the master's bedroom */
  potRear(g, M, r) { const h = 4.2; g.box(0.6, h, 10.6, { m: M, at: [-6.35, h / 2, 0], c: WHITE, j: 0.02 }); g.box(0.6, h, 10.6, { m: M, at: [6.35, h / 2, 0], c: WHITE, j: 0.02 }); g.box(13.3, h, 0.6, { m: M, at: [0, h / 2, -5.15], c: WHITE, j: 0.02 });
    g.box(5.15, h, 0.5, { m: M, at: [-3.45, h / 2, 0.5], c: WHITE, j: 0.02 }); g.box(5.1, h, 0.5, { m: M, at: [3.5, h / 2, 0.5], c: WHITE, j: 0.02 }); g.box(1.95, h - 2.5, 0.5, { m: M, at: [0.05, 2.5 + (h - 2.5) / 2, 0.5], c: WHITE, j: 0.02 });
    for (const s of [-1, 1]) g.box(0.2, 2.5, 0.62, { m: M, at: [0.05 + s * 1.02, 1.25, 0.5], c: OCHRE }); g.box(2.3, 0.22, 0.64, { m: M, at: [0.05, 2.6, 0.5], c: TURQ }); band(g, M, 12, h - 0.6, 0, 0.77);
    g.box(13.9, 0.35, 11, { m: M, at: [0, h + 0.1, 0], c: 0xe6dcc4, j: 0.02 });
    g.box(12.1, 0.06, 4.3, { m: M, at: [0, 0.04, 2.8], c: (x, y, z) => (Math.floor(x * 0.8) + Math.floor(z * 0.8)) % 2 ? 0xd8c8a4 : 0xcab890, j: 0 }); g.box(12.1, 0.06, 5.2, { m: M, at: [0, 0.04, -2.3], c: 0xb8a282, j: 0.01 }); },
  bedBig(g, M) { g.box(2.5, 0.34, 2.1, { m: M, at: [0, 0.3, 0], c: 0x7a5232 }); g.box(2.4, 0.16, 2.0, { m: M, at: [0, 0.54, 0], c: LINEN, j: 0.01 }); for (const s of [-1, 1]) g.box(1.0, 0.14, 0.5, { m: M, at: [s * 0.58, 0.68, -0.68], c: 0xf0e8d8 }); g.box(2.42, 0.06, 1.1, { m: M, at: [0, 0.64, 0.42], c: LAPIS });
    g.box(2.7, 1.3, 0.1, { m: M, at: [0, 0.75, -1.08], c: 0x6a4428 }); g.box(2.3, 0.3, 0.04, { m: M, at: [0, 1.2, -1.02], c: GOLD }); for (const [x, z] of [[-1.2, -1], [1.2, -1], [-1.2, 1], [1.2, 1]]) { g.cyl(0.05, 0.07, 2.3, 8, { m: M, at: [x, 1.15, z], c: GOLD }); g.box(0.16, 0.2, 0.16, { m: M, at: [x, 0.08, z], c: 0x4a3020 }); }
    g.box(2.6, 0.06, 2.2, { m: M, at: [0, 2.3, 0], c: 0xe8dfca }); for (const s of [-1, 1]) g.box(0.03, 1.5, 2.1, { m: M, at: [s * 1.24, 1.55, 0], c: 0xefe7d6 }); },
  dutyBoard(g, M) { for (const s of [-1, 1]) g.cyl(0.05, 0.06, 1.7, 6, { m: M, at: [s * 0.62, 0.85, 0], c: 0x6a4a30 }); g.box(1.4, 0.95, 0.06, { m: M, at: [0, 1.15, 0.02], c: 0x8a6440 }); g.box(1.5, 0.08, 0.1, { m: M, at: [0, 1.66, 0.02], c: 0x5a3e28 }); g.box(1.5, 0.06, 0.16, { m: M, at: [0, 0.66, 0.06], c: 0x5a3e28 });
    for (let i = 0; i < 5; i++) { g.box(0.2, 0.26, 0.03, { m: M, at: [-0.48 + i * 0.24, 1.32, 0.06], c: 0xd8c49a }); g.box(0.12, 0.02, 0.01, { m: M, at: [-0.48 + i * 0.24, 1.36, 0.08], c: 0x4a3a2a }); g.box(0.1, 0.02, 0.01, { m: M, at: [-0.48 + i * 0.24, 1.29, 0.08], c: 0x4a3a2a }); g.box(0.16, 0.1, 0.03, { m: M, at: [-0.48 + i * 0.24, 0.96, 0.06], c: [LAPIS, OCHRE, TURQ, GOLD, 0x7a3a6a][i] }); }
    g.box(0.5, 0.06, 0.24, { m: M, at: [0.3, 0.72, 0.1], c: 0xc8b890 }); g.cyl(0.05, 0.06, 0.1, 8, { m: M, at: [-0.4, 0.74, 0.1], c: 0x2a2018 }); },
  pool(g, M, r, w, d) { /* v18.24 a sunken basin of real water: a stone rim, a tiled bed below, and the water surface (drawn by the water shader, GG.POOLS) between */
    const RIM = 0.42, LV = 0.36; for (const s of [1, -1]) { g.box(w + 0.8, RIM, 0.4, { m: M, at: [0, RIM / 2, s * (d / 2 + 0.2)], c: 0xd8c8a4, j: 0.02 }); g.box(0.4, RIM, d, { m: M, at: [s * (w / 2 + 0.2), RIM / 2, 0], c: 0xd8c8a4, j: 0.02 }); }
    g.box(w, 0.05, d, { m: M, at: [0, 0.025, 0], c: 0x3f8a8e, j: 0 }); for (let i = 1; i < Math.floor(w); i++) g.box(0.03, 0.006, d, { m: M, at: [-w / 2 + i, 0.052, 0], c: 0x7ab8b4 });
    for (let i = 0; i < 9; i++) { const x = (r() - 0.5) * (w - 0.8), z = (r() - 0.5) * (d - 0.8); g.cyl(0.28, 0.28, 0.015, 8, { m: M, at: [x, LV + 0.012, z], c: 0x4a8a4a, j: 0.1 }); if (i % 3 === 0) g.sph(0.09, 6, 4, { m: M, at: [x + 0.1, LV + 0.08, z], c: [0xf0e0f0, 0x8aa0e0, 0xf0f0f8][i % 3] }); }
    const P4 = (x, z) => [M[0] * x + M[8] * z + M[4] * LV + M[12], M[1] * x + M[9] * z + M[5] * LV + M[13], M[2] * x + M[10] * z + M[6] * LV + M[14]];
    (GG.POOLS = GG.POOLS || []).push([P4(-w / 2, -d / 2), P4(w / 2, -d / 2), P4(w / 2, d / 2), P4(-w / 2, d / 2)]); },
  cellRow(g, M, r, n, w, d, h, doorCell) { // prison cells: back wall, side walls, roof, iron/wood bars in front (v18.35 doorCell: that cell has a barred door, drawn apart)
    h = h || 2.8; const W2 = n * w; g.box(W2, h, 0.5, { m: M, at: [0, h / 2, -d / 2], c: 0xb8a888, j: 0.03 }); g.box(W2 + 0.5, 0.25, d + 0.3, { m: M, at: [0, h + 0.05, 0], c: 0xa89878, j: 0.03 });
    for (let i = 0; i <= n; i++) g.box(0.4, h, d, { m: M, at: [-W2 / 2 + i * w, h / 2, 0], c: 0xb0a080, j: 0.03 });
    for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) { if (i === doorCell && k >= 2 && k <= 5) continue; g.cyl(0.035, 0.035, h - 0.2, 4, { m: M, at: [-W2 / 2 + i * w + 0.5 + k * (w - 1) / 8, (h - 0.2) / 2, d / 2 - 0.1], c: 0x4a3a2a, j: 0 }); }
    for (let i = 0; i < n; i++) if (i !== doorCell) g.box(w - 0.4, 0.12, 0.12, { m: M, at: [-W2 / 2 + (i + 0.5) * w, 1.9, d / 2 - 0.1], c: 0x4a3a2a }); },
  straw(g, M, r) { g.box(1.8, 0.1, 0.8, { m: M, at: [0, 0.05, 0], c: 0xc8b070, j: 0.1 }); },
  dais(g, M, r, w, d, h) { g.box(w, h, d, { m: M, at: [0, h / 2, 0], c: SAND, j: 0.02 }); for (let i = 0; i < 3; i++) g.box(w * 0.5, h / 3, 0.4, { m: M, at: [0, h / 6 + i * h / 3 - 0.02, d / 2 + 0.6 - i * 0.4], c: 0xd8c49a }); band(g, M, w, h - 0.2, 0, d / 2 + 0.02); },
  throne(g, M) { g.box(1.2, 0.42, 0.74, { m: M, at: [0, 0.21, -0.13], c: GOLD }); g.box(1.2, 1.5, 0.15, { m: M, at: [0, 1.0, -0.45], c: GOLD }); for (const s of [1, -1]) g.box(0.12, 0.45, 0.9, { m: M, at: [s * 0.55, 0.7, 0], c: LAPIS });
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
    /* v18.42 a broad square sail on a yard and a boom, and a steering oar at the stern (Middle Kingdom boats; the triangular lateen sail is a thousand years later) */
    g.box(2.7, 2.5, 0.03, { m: M, at: [0, 2.55, -0.36], c: 0xf0e6cc, j: 0.02 }); for (const y of [3.82, 1.28]) g.cyl(0.045, 0.045, 3.1, 5, { m: M, at: [0, y, -0.36], rz: PI / 2, c: WOOD });
    g.cyl(0.035, 0.03, 2.4, 5, { m: M, at: [0.42, 0.95, 2.05], rx: 0.95, c: WOOD }); g.box(0.04, 0.32, 0.5, { m: M, at: [0.42, 0.18, 2.95], c: WOOD }); },
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
  const node = (type, x, z, s) => { if (waterDist(x, z) < 4 && type !== 'reeds') return; const id = 'n' + (nid++), ry = r() * 6, sc = s || (0.85 + r() * 0.3); if (type === 'reeds' && roadD(x, z) < 4.5) return; /* v18.42 no reeds on the ferry roads (the same random numbers and ids are used up, so nothing else moves) */ W.nodes.push({ id, type, x, y: W.heightAt(x, z), z, ry, s: sc }); };
  // roofed buildings you can walk into register their roof, so the camera knows to stay under the ceiling inside them
  const CANOPY = { oak: [3.6, 11.5, 6], olive: [1.8, 6, 3.5], fig: [1.6, 5.2, 3.6], acacia: [3, 6.2, 4.5], tamarisk: [2, 7, 3.2], datePalm: [8, 12.5, 3.5], palm: [8, 13, 3.5] };
  W.canopies = [];
  const ROOFED = { portico: a => [a[0], a[1], a[2] || 4], room: a => [a[0], a[1], a[2] || 3], cellRow: a => [a[0] * a[1], a[2], a[3] || 2.8], pavilion: a => [a[0], a[1], a[2] || 2.6] };
  const CLEAR = [[-91, -69, 10]]; /* v18.52 the north Nile landing (the Byblos · Caphtor · Kush boats): open ground, no scattered trees or rocks */
  /* v18.66 nothing grows or lies on a road: a tree, bush or boulder that would stand on one is moved to the nearest spot beside it (trunks 3.2 m from the middle, the rest 2.4 m) */
  const offRoad = (fn, x, z) => { const clear = CANOPY[fn] ? 3.2 : 2.4; if (roadD(x, z) >= clear) return [x, z]; for (let r = 0.6; r <= 7; r += 0.6) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (roadD(nx, nz) >= clear) return [nx, nz]; } return null; };
  GG.PROPLOG = []; W._defer = []; /* v18.85 nature that could land in a house is put down last (world.js finishStatics), once every building has its walls */ /* v18.72 every prop the story map puts down: [name, x, z] (for checking that a quest's 「대야」 really has a basin) */
  const P = (fn, x, z, o) => { if (W._defer && typeof fn === 'string' && !(o && (o.keep || o.y !== undefined || o.late)) && ((o && o.scatter) || CANOPY[fn] || /^(bush|rock|outcrop|retama|caperBush|herbBush)$/.test(fn))) { W._defer.push(() => P(fn, x, z, Object.assign({}, o, { late: 1 }))); return { x, y: W.heightAt(x, z), z }; } /* v18.85 no tree, bush or rock inside a house, tent, pyramid or cave mouth */ if (typeof fn === 'string' && (CANOPY[fn] || /^(bush|rock|outcrop|retama|rockField|desertShrub|honeyRock|caperBush|herbBush)$/.test(fn)) && !(o && (o.keep || o.y !== undefined))) { const q = offRoad(fn, x, z); if (!q) return { x, y: W.heightAt(x, z), z }; x = q[0]; z = q[1]; }
    if (o && o.late && W.inBuilding && (W.inBuilding(x, z, CANOPY[fn] ? 0.7 : 0.35) || (CANOPY[fn] && W.inBuilding(x, z, CANOPY[fn][2] * (o.s || 1) * 0.85, W.heightAt(x, z) + CANOPY[fn][0] * (o.s || 1))))) return { x, y: W.heightAt(x, z), z }; /* (a crown that would reach into a roof counts too) */
    if (typeof fn === 'string') GG.PROPLOG.push([fn, x, z]);
    if (typeof fn === 'string' && (CANOPY[fn] || /^(bush|rock|outcrop|retama)$/.test(fn)) && !(o && o.keep) && CLEAR.some(c => Math.hypot(x - c[0], z - c[1]) < c[2])) return { x, y: W.heightAt(x, z), z }; if (fn === 'rugEg') o = Object.assign({}, o, { dy: 0.06 }); if (fn === 'palmRow') for (let i = 0; i < ((o && o.args && o.args[0]) || 0); i++) W.addCol({ x: x + i * 4, z, r: 0.4, h: 3 }); /* v18.35b palms in a row are solid too */ if (fn === 'gatePosts' && o && o.args) for (const s of [1, -1]) W.addCol({ x: x + s * (o.args[0] / 2 + 0.6), z, w: 1.2, d: 1.4, h: 4, cam: true });
    if (fn === 'egHouse' && o) { // v12: houses were one low storey; raise them to a proper two-storey height (model and collider together)
      o = Object.assign({}, o); if (o.args && o.args[0]) o.args = [Object.assign({}, o.args[0], { h: (o.args[0].h || 3) * 1.45 })]; if (o.col) o.col = Object.assign({}, o.col, { h: (o.col.h || 3) * 1.45 }); }
    // v18.8: on phones (GG.treeLod) the trees standing beside the roads are left out, and the forest is thinned by a third (trees were most of the world's triangles); trees near a story place (SPOTS / PADS) are kept.
    if (GG.treeLod && typeof fn === 'string' && CANOPY[fn] && !(o && o.keep)) {
      const road = roadD(x, z) < 11, thin = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 < 0.34;
      if ((road || thin) && !PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r + 12) && !Object.keys(SPOTS).some(k => { const q = SPOTS[k]; return Array.isArray(q) && Math.hypot(x - q[0], z - q[1]) < 12; })) { W.skippedTrees = (W.skippedTrees || 0) + 1; return { x, y: W.heightAt(x, z), z }; }
    }
    if (fn === 'crops' && !(o && o._tile)) { // v18.14 a field of crops is laid in small patches, each on its own ground (one flat slab floated over the river banks); too steep a patch is left out
      const [w, d, rp] = (o && o.args) || [8, 6, false], a = (o && o.ry) || 0, ca = Math.cos(a), sa = Math.sin(a), nx = Math.max(1, Math.round(w / 2.2)), nz = Math.max(1, Math.round(d / 2)), tw = w / nx, td = d / nz, wl = W.water ? W.water.level : -99;
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) { const lx = -w / 2 + (i + 0.5) * tw, lz = -d / 2 + (j + 0.5) * td, px = x + lx * ca + lz * sa, pz = z - lx * sa + lz * ca; let lo = 1e9, hi = -1e9;
        for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]]) { const qx = px + u * tw / 2 * ca + v * td / 2 * sa, qz = pz - u * tw / 2 * sa + v * td / 2 * ca, h = W.heightAt(qx, qz); lo = Math.min(lo, h); hi = Math.max(hi, h); }
        if (hi - lo > 0.4 || lo < wl + 0.15) continue; P(fn, px, pz, Object.assign({}, o, { _tile: 1, args: [tw, td, rp], y: lo - 0.03 })); }
      return { x, y: W.heightAt(x, z), z }; }
    if (fn === 'palmRow' && o && o.args) for (let i = 0; i < o.args[0]; i++) W.addCol({ x: x + i * 4, z, r: 0.32, h: 5 }); /* v18.35 solid trunks */
    if (typeof fn === 'string') o = Object.assign({ kind: fn }, o || {}); // v16.1: lets W.place give it a default collider by name
    if (fn === 'palmRow' && (!o || o.col === undefined)) { const n = (o && o.args && o.args[0]) || 3, a = (o && o.ry) || 0; for (let i = 0; i < n; i++) W.addCol({ x: x + Math.cos(a) * i * 4, z: z - Math.sin(a) * i * 4, r: 0.32, h: 5 }); }
    const res = W.place(typeof fn === 'string' && ENVX[fn] ? ENVX[fn] : fn, x, z, o);
    if (typeof fn === 'string' && CANOPY[fn]) { const c = CANOPY[fn], k = (o && o.s) || 1; (W.canopies = W.canopies || []).push({ x, z, y0: res.y + c[0] * k, y1: res.y + c[1] * k, r: c[2] * k }); } // v15: tree crowns, so cutscene cameras keep out of them
    /* v18.85 rain shelter (not a ceiling for the camera): a market stall's awning and a house's door awning keep the rain off whoever stands beneath */
    if (fn === 'stallM') W.addCover(x, z, 3.4, 2.8, (o && o.ry) || 0, res.y + 2.1);
    if (fn === 'egHouse' && o && o.args && o.args[0] && o.args[0].awning) { const a = (o.ry || 0), q = o.args[0], lx = q.doorX || 0, lz = (q.d || 5) / 2 + 0.75; W.addCover(x + lx * Math.cos(a) + lz * Math.sin(a), z - lx * Math.sin(a) + lz * Math.cos(a), 2.4, 1.7, a, res.y + 2.1); }
    if (typeof fn === 'string' && ROOFED[fn] && W.addRoof) { const [w, d, h] = ROOFED[fn]((o && o.args) || []); W.addRoof({ x, z, w, d, a: (o && o.ry) || 0, y: res.y + h, k: fn }); }
    return res; };
  /* v18.35 pens: a real fence (you can jump over it, not walk through it) with a gate that swings open */
  const penF = (cx, cz, w, d, side) => { const hw = w / 2, hd = d / 2, G2 = 1.1, seg = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); if (L < 0.2) return; P('fence', (x0 + x1) / 2, (z0 + z1) / 2, { ry: x0 === x1 ? PI / 2 : 0, args: [L] }); };
    if (side === 'n') { seg(cx - hw, cz - hd, cx - G2, cz - hd); seg(cx + G2, cz - hd, cx + hw, cz - hd); } else seg(cx - hw, cz - hd, cx + hw, cz - hd);
    if (side === 's') { seg(cx - hw, cz + hd, cx - G2, cz + hd); seg(cx + G2, cz + hd, cx + hw, cz + hd); } else seg(cx - hw, cz + hd, cx + hw, cz + hd);
    if (side === 'w') { seg(cx - hw, cz - hd, cx - hw, cz - G2); seg(cx - hw, cz + G2, cx - hw, cz + hd); } else seg(cx - hw, cz - hd, cx - hw, cz + hd);
    if (side === 'e') { seg(cx + hw, cz - hd, cx + hw, cz - G2); seg(cx + hw, cz + G2, cx + hw, cz + hd); } else seg(cx + hw, cz - hd, cx + hw, cz + hd);
    const gx = side === 'w' ? cx - hw : side === 'e' ? cx + hw : cx, gz = side === 'n' ? cz - hd : side === 's' ? cz + hd : cz, along = side === 'n' || side === 's'; G.GATES = (G.GATES || []).filter(q => Math.hypot(q.x - gx, q.z - gz) > 1); G.GATES.push({ x: gx, z: gz, a: along ? 0 : PI / 2, col: W.addCol({ x: gx, z: gz, w: along ? 2.2 : 0.3, d: along ? 0.3 : 2.2, h: 0.95 }), open: 0, want: 0 }); };
  const wallL = (ax, az, bx, bz, h, kind) => { const L = Math.hypot(bx - ax, bz - az), a = -Math.atan2(bz - az, bx - ax); P(kind || 'egWall', (ax + bx) / 2, (az + bz) / 2, { ry: a, args: [L, h || 3], col: { w: L, d: 0.8, h: (h || 3) + 0.2, a, cam: true } }); };
  const ok = (x, z, m) => !inLevel(x, z, 2) && roadD(x, z) > (m || 4) && PADS.every(p => Math.hypot(x - p.x, z - p.z) > p.r + 2) && waterDist(x, z) > 5 && Math.max(Math.abs(x), Math.abs(z)) < 205 && Math.hypot(x - PIT.x, z - PIT.z) > 8;
  const tree = { r: 0.5, h: 3 };
  // ================= CANAAN
  // Hebron valley: the tents of Jacob
  P('tent', 168, 146, { ry: 0.25, s: 1.3, args: [0x3a302c], col: { w: 7.4, d: 4.8, h: 2.5, cam: true, a: 0.25 } });     // 야곱의 장막
  /* 요셉과 베냐민의 장막 (v16.9): you can walk in under the roof — the back and the sides are walls, the front is open — and
     Joseph's sleeping mat lies inside, so the story starts with him asleep under goat hair, not out on the bare ground */
  /* v18.28 the open front now faces Jacob's tent (the way the story sends you first) */
  P('tent', 184, 158, { ry: -2.24, args: [0x4a3e38], col: null });
  { const ca = Math.cos(-2.24), sa = Math.sin(-2.24), at = (lx, lz) => [184 + ca * lx + sa * lz, 158 - sa * lx + ca * lz];
    for (const [lx, lz, w, d] of [[0, -1.72, 5.7, 0.3], [2.78, 0, 0.3, 3.5], [-2.78, 0, 0.3, 3.5]]) { const [x, z] = at(lx, lz); W.addCol({ x, z, w, d, a: -2.24, h: 2.6, cam: true }); }
    if (W.addRoof) W.addRoof({ x: 184, z: 158, w: 5.6, d: 3.6, a: -2.24, y: W.heightAt(184, 158) + 2.35 });
    const [mx, mz] = at(0.35, -0.55); P((g, M) => { g.box(1.95, 0.05, 0.95, { m: M, at: [0, 0.03, 0], c: (x, y, z) => Math.abs(z) > 0.36 || Math.abs(x) > 0.86 ? 0x8a3a2a : Math.floor((x + 1) * 5) % 2 ? 0xc8b08a : 0xb89a70 });
      g.box(1.7, 0.06, 0.6, { m: M, at: [0.05, 0.07, -0.05], c: 0x6a5a4a, j: 0.04 }); g.sph(0.2, 8, 6, { m: M, at: [0.78, 0.12, 0], s: [1, 0.45, 1.2], c: 0xd8c8a8 }); }, mx, mz, { ry: -2.24, col: null }); }
  P('tent', 163, 162, { ry: 0.9, args: [0x5a4636], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.9 } });
  P('tent', 189, 141, { ry: -1.1, args: [0x3e342e], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -1.1 } });
  P('campfire', 176, 153, { col: { r: 0.8, h: 0.5 } }); /* v23 */ P('logSeat', 177.11, 153.76, { ry: 0.6 }); P('logSeat', 174.7, 154.05, { ry: -0.9 }); P('fireWood', 177.4, 151.6, { ry: 0.3, col: { r: 0.4, h: 0.4 } }); P('sheepskinRug', 175.0, 151.8, { ry: 0.5 }); P('waterSkin', 180.2, 155.4, { ry: 0.4, s: 1.25 }); P('quern', 166.2, 150.6, { ry: 0.3 }); P('loomUp', 158.4, 156.2, { ry: 0.5, col: { w: 1.4, d: 0.4, h: 2, a: 0.9 } }); P('herbRack', 186.6, 154.6, { ry: -0.6, col: { w: 1.8, d: 0.3, h: 1.6, a: -0.6 } }); P('sacks', 179, 147); P('pots', 188.3, 157.3, { ry: -0.5 }); // v18.13 the camp's pots stand together beside Joseph's tent, not in the middle
  P('well', 160, 150, { col: { r: 1.7, h: 1 } }); penF(192, 171, 12, 9, 'n');
  for (const [x, z] of [[156, 140], [196, 150], [165, 172], [190, 130]]) P('olive', x, z, { s: 1.1, col: tree });
  P('oak', 148, 156, { s: 1.5, col: tree }); // 마므레의 상수리나무 (창 35:27)
  P('crops', 160, 128, { args: [10, 6, true] }); P('crops', 196, 124, { args: [8, 6, true] });
  // road north: the fallen trunk across the dry wadi (jump!) between two rock shoulders
  P('logX', SPOTS.log[0], SPOTS.log[1], { ry: 0.05, col: { w: 7.4, d: 0.8, h: 0.62 } });
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) P('outcrop', SPOTS.log[0] + s * (5.8 + i * 2.2), SPOTS.log[1] + (r() - 0.5) * 2, { s: 0.9 + r() * 0.3, ry: r() * 6, col: { r: 1.9, h: 3 } });
  // rest stop under the oak
  P('oak', 190, 29, { s: 1.7, col: { r: 0.7, h: 3 } }); P('campfire', SPOTS.restOak[0], SPOTS.restOak[1], { col: { r: 0.8, h: 0.5 } }); P('straw', SPOTS.restBed[0], SPOTS.restBed[1], { ry: 0.4 }); P('rock', 182, 30, { col: { r: 0.9, h: 1 } });
  // Shechem fields: grazing land, the brothers' old camp
  P('campfire', SPOTS.clue1[0], SPOTS.clue1[1]); P('cookTripod', SPOTS.clue1[0], SPOTS.clue1[1]); P('logSeat', SPOTS.clue1[0] - 1.3, SPOTS.clue1[1] + 0.4, { ry: 1.2 }); P('sacks', SPOTS.clue1[0] + 2, SPOTS.clue1[1] - 1.5); P('altar', SPOTS.clue3[0], SPOTS.clue3[1]);
  for (let i = 0; i < 8; i++) P('olive', 170 + (i % 4) * 9 + r() * 3, -40 - Math.floor(i / 4) * 9, { col: tree });
  // Dothan: the brothers' camp, cisterns
  P('campfire', 158, -150, { col: { r: 0.8, h: 0.5 } }); P('sacks', 154, -146); P('pots', 161, -154); P('tent', 151, -156, { ry: 0.6, args: [0x4a3e38], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.6 } });
  P('pitWell', PIT.x, PIT.z, { y: PIT.floor }); W.markers.pit = PIT; if (W.addAvoid) W.addAvoid({ x: PIT.x, z: PIT.z, r: PIT.wall + 0.7, k: 'pit' }); // nobody strolls across the pit
  P('cistern', 146, -128); P('cistern', 178, -162); P('cistern', 140, -160);
  penF(148, -175, 14, 10, 's');
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
  { const x0 = -50, x1 = -6, z0 = 26, z1 = 70, gx = -28;
    wallL(x0, z0, x1, z0); wallL(x0, z0, x0, z1); wallL(x1, z0, x1, 50.5); wallL(x1, 53.5, x1, z1); wallL(x0, z1, gx - 2, z1); wallL(gx + 2, z1, x1, z1);
    P('gatePosts', gx, z1, { args: [4] }); W.addCol({ x: gx - 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true }); W.addCol({ x: gx + 2.6, z: z1, w: 1.2, d: 1.4, h: 4, cam: true });
    P('portico', -28, 41.5, { args: [26, 9, 4.2, 4, [-8.6, 3.4], [-7.6, 2.4]], col: null }); W.addCol({ x: -38.8, z: 37.2, w: 4.4, d: 0.7, h: 4.2, cam: true }); W.addCol({ x: -19.8, z: 37.2, w: 9.6, d: 0.7, h: 4.2, cam: true }); W.addCol({ x: -41, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true }); W.addCol({ x: -15, z: 41.5, w: 0.7, d: 9, h: 4.2, cam: true });
    /* v18.35 a wider hall (the feast sits round one table) and the master's bedroom behind it: the door opens only when the mistress calls (창 39:11) */
    { const yH = W.heightAt(-30.6, 32); P('potRear', -30.6, 32, { col: null }); W.addCol({ x: -36.95, z: 32, w: 0.7, d: 10.6, h: 4.2, cam: true }); W.addCol({ x: -24.25, z: 32, w: 0.7, d: 10.6, h: 4.2, cam: true }); W.addCol({ x: -30.6, z: 26.85, w: 13.4, d: 0.7, h: 4.2, cam: true });
      W.addCol({ x: -34.05, z: 32.5, w: 5.15, d: 0.5, h: 4.2, cam: true }); W.addCol({ x: -27.1, z: 32.5, w: 5.1, d: 0.5, h: 4.2, cam: true }); GG.POTDOOR = W.addCol({ x: -30.55, z: 32.5, w: 2.0, d: 0.5, h: 4.2, cam: true });
      if (W.addRoof) { W.addRoof({ x: -30.6, z: 34.9, w: 12.7, d: 4.8, y: yH + 4.2, k: 'potHall' }); W.addRoof({ x: -30.6, z: 29.7, w: 12.7, d: 5.4, y: yH + 4.2, k: 'potBed' }); }
      P('bedBig', -30.6, 28.6, { col: { w: 2.7, d: 2.3, h: 1.1 } }); P('chestEg', -26.2, 28.2, { ry: -PI / 2, col: { w: 0.7, d: 1, h: 0.75 } }); P('chestEg', -35.2, 28.2, { ry: PI / 2, col: { w: 0.7, d: 1, h: 0.75 } }); P('rugEg', -30.6, 30.9, { args: [5, 1.6, LAPIS, GOLD] });
      P('lampStand', -33.4, 28, { col: { r: 0.22, h: 1.6 } }); P('lampStand', -27.8, 28, { col: { r: 0.22, h: 1.6 } }); P('banner', -35.2, 27.25, { ry: PI / 2, args: [2.3, OCHRE] }); P('banner', -26, 27.25, { ry: PI / 2, args: [2.3, TURQ] }); P('potPlant', -35.8, 31.6, { args: ['papyrus'], col: { r: 0.3, h: 1 } }); P('stool', -25.6, 31); P('tableEg', -25.6, 30, { ry: PI / 2, col: { w: 0.85, d: 1.8, h: 0.9 } }); P('oilLamp', -25.6, 29.7, { dy: 0.84 });
      P('lampStand', -36, 36, { col: { r: 0.22, h: 1.6 } }); P('lampStand', -25.2, 36, { col: { r: 0.22, h: 1.6 } }); P('banner', -33.8, 32.9, { ry: PI / 2, args: [2.3, LAPIS] }); P('banner', -27.2, 32.9, { ry: PI / 2, args: [2.3, TURQ] }); P('potPlant', -35.9, 33.5, { args: ['palm'], col: { r: 0.3, h: 1 } }); P('potPlant', -25.2, 33.5, { args: ['palm'], col: { r: 0.3, h: 1 } }); }
    /* the feast: one round table in the hall, serving table in the pantry (solid only while the feast is on) */
    GG.BQ = { table: W.addCol({ x: -30.4, z: 38.9, r: 1.3, h: 0.9 }), serve: W.addCol({ x: -40.1, z: 43.1, w: 0.9, d: 1.9, h: 0.95 }) }; GG.BQ.table.on = false; GG.BQ.serve.on = false;
    P('dutyBoard', -30, 44.1, { col: { w: 1.5, d: 0.3, h: 1.7 } }); /* 일꾼 명부: the board Joseph assigns the work on */
    for (let i = 0; i < 4; i++) W.addCol({ x: -35.6 + i * 10 / 3, z: 45.5, r: 0.38, h: 4 }); /* v18.35b columns only across the hall: the wings are real rooms with walls */
    /* tiled floors, the lobby's painted pillars and the way to the door */
    P('tileFloor', -28, 41.9, { args: [26, 9.4], col: null }); P('tileFloor', -30.6, 29.8, { args: [12.6, 5.6, 0xdccdb0, 0xb9a988], col: null }); P('tileFloor', -30.6, 35, { args: [12.6, 4.6], col: null }); P('tileFloor', -10.5, 45, { args: [6, 9, 0xc8a878, 0xb08f62, 1.2], col: null }); P('tileFloor', -12.5, 64.5, { args: [9, 8, 0xc8b898, 0xb8a888, 1.6], col: null }); P('tileFloor', -29, 58.5, { args: [3, 23, 0xd8ccb0, 0xc8bb9c, 1.5], col: null });
    for (const [x, z] of [[-35.4, 39], [-25.8, 39]]) P('pillarEg', x, z, { args: [4.1], col: { r: 0.42, h: 4.2, cam: false } });
    for (const s of [-1, 1]) { P('potPlant', -30.6 + s * 3.6, 47.4, { args: ['palm'], col: { r: 0.32, h: 1 } }); }
    { const room = (x0, x1, z0, z1, y) => { const lx = x1 - x0, lz = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; P('frieze', cx, z0, { args: [lx, y], col: null }); P('frieze', cx, z1, { ry: PI, args: [lx, y], col: null }); P('frieze', x0, cz, { ry: PI / 2, args: [lz, y], col: null }); P('frieze', x1, cz, { ry: -PI / 2, args: [lz, y], col: null }); }; GG.friezeRoom = room;
      room(-36.65, -24.55, 27.2, 32.2, 3.3); room(-24.2, -15.65, 37.35, 46.2, 3.3); P('frieze', -30.6, 32.85, { args: [12, 3.3], col: null }); }
    P('banner', -19.2, 47.05, { ry: PI / 2, args: [2.6, LAPIS] }); P('banner', -39.4, 47.05, { ry: PI / 2, args: [2.6, LAPIS] }); P('flowers', -33, 49.5, { args: [0xd86a8a] }); P('flowers', -24, 49.5, { args: [0xe8c850] });
    /* v18.14 the house is not one open porch any more: the east wing is a closed room for the accounts (장부방, door to the yard) and
       the west wing a serving pantry (door to the hall); the hall in the middle stays open to the yard */
    wallL(-24.6, 37.6, -24.6, 41.2, 4); wallL(-24.6, 43.4, -24.6, 46.6, 4); P('lintel', -24.6, 42.3, { ry: PI / 2, args: [2.2, 2.7, 4], col: null }); P('lintel', -36.6, 42.5, { ry: PI / 2, args: [2.4, 2.7, 4], col: null }); wallL(-24.6, 46.6, -15, 46.6, 4); // 비서실 (door from the lobby)
    wallL(-36.6, 37.6, -36.6, 41.3, 4); wallL(-36.6, 43.7, -36.6, 46.6, 4); wallL(-41, 46.6, -36.6, 46.6, 4); // 시중 방
    P('seatEg', -28, 39.4, { args: [], ry: -1.776, col: { r: 0.45, h: 1 } }); P('tableEg', -22, 40.4, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('shelves', -16, 41, { ry: -PI / 2, args: ['figs'] }); W.addCol({ x: -16, z: 41, w: 0.6, d: 2.2, h: 2 }); P('couch', -35, 35.4, { ry: PI / 2, col: { w: 2, d: 0.8, h: 0.8, a: PI / 2 } }); P('jars', -38.5, 39, { args: [3], col: { w: 1.9, d: 0.5, h: 1 } });
    P('pavilion', -45.5, 52, { args: [7, 15, 2.6] }); for (let i = 0; i < 4; i++) { P('straw', -47.6, 46 + i * 3.4, { ry: PI / 2 }); P('straw', -45.4, 46 + i * 3.4, { ry: PI / 2 }); }   // 종들의 숙소
    P('plainRoof', -10.5, 45, { args: [6.8, 9.8, 2.6, 0xd8c8a4], col: null }); if (W.addRoof) W.addRoof({ x: -10.5, z: 45, w: 6, d: 9, y: W.heightAt(-10.5, 45) + 2.6, k: 'kitchen' }); wallL(-13.5, 40.5, -7.5, 40.5, 2.6); wallL(-7.5, 40.5, -7.5, 49.5, 2.6); wallL(-13.5, 40.5, -13.5, 49.5, 2.6); wallL(-13.5, 49.5, -11.9, 49.5, 2.6); wallL(-8.9, 49.5, -7.5, 49.5, 2.6); wallL(-15, 46.6, -13.5, 46.6, 4); /* v18.39 a wide door on the yard; the old west door opened into a slit between two walls */ P('oven', -10, 41.9, { col: { r: 0.8, h: 1.2 } }); P('quern', SPOTS.quern[0], SPOTS.quern[1], { ry: PI / 2, col: { w: 0.6, d: 1.1, h: 0.45 } }); P('jars', -8.6, 47.8, { ry: PI / 2, args: [3], col: { w: 0.6, d: 1.9, h: 1 } }); P('tableEg', -9.2, 45.4, { ry: PI / 2, col: { w: 0.85, d: 1.8, h: 0.9 } });  // 부엌
    P('well', SPOTS.well[0], SPOTS.well[1], { col: { r: 1.7, h: 1 } });
    P('pool', SPOTS.pool[0], SPOTS.pool[1], { args: [8, 5] }); GG.wade(W, SPOTS.pool[0], SPOTS.pool[1], 8, 5); P('palmRow', -25, 63.5, { args: [2] }); P('datePalm', -13, 55); P('datePalm', -23.6, 54.5); P('flowers', -21, 61.5, { args: [0x8a6ad8] });
    P('room', SPOTS.store[0] - 0.5, SPOTS.store[1] + 0.5, { ry: -PI / 2, args: [8, 9, 3, 1.8] }); // 곳간 (문은 서쪽)
    { const sx = SPOTS.store[0] - 0.5, sz = SPOTS.store[1] + 0.5; W.addCol({ x: sx + 4.5, z: sz, w: 0.5, d: 8, h: 3, cam: true }); W.addCol({ x: sx, z: sz - 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx, z: sz + 4, w: 9, d: 0.5, h: 3, cam: true }); W.addCol({ x: sx - 4.5, z: sz - 2.45, w: 0.5, d: 3.1, h: 3 }); W.addCol({ x: sx - 4.5, z: sz + 2.45, w: 0.5, d: 3.1, h: 3 });
      const SH = [['wine', 3.4, -2.6, 0], ['oil', 3.4, 2.6, 0], ['grain', 0.6, -3.3, PI / 2], ['figs', 0.6, 3.3, -PI / 2]]; for (const [k, dx, dz, ry] of SH) P('shelves', sx + dx, sz + dz, { ry: ry + -PI / 2, args: [k] }); }
    P('loomX', SPOTS.loom[0], SPOTS.loom[1], { ry: PI / 2, col: { w: 2, d: 0.5, h: 2.2, a: PI / 2 } }); P('jars', -38, 67.5, { args: [3] }); P('dovecote', -47, 38.5);
    // fields and the cattle yard outside the east door
    penF(9, 76, 10, 11, 'w');
    P('shaduf', 16, 52, { ry: -PI / 2 }); P('trough', 9, 72, { col: { w: 2.4, d: 0.8, h: 0.6 } }); }
  // ================= THE KING'S PRISON (in the house of the captain of the guard, 창 40:3)
  { const x0 = -45, x1 = -15, z0 = -10, z1 = 14, gx = -30;
    wallL(x0, z0, x1, z0, 3.4, 'prisonWall'); wallL(x0, z0, x0, z1, 3.4, 'prisonWall'); wallL(x1, z0, x1, z1, 3.4, 'prisonWall'); wallL(x0, z1, gx - 1.6, z1, 3.4, 'prisonWall'); wallL(gx + 1.6, z1, x1, z1, 3.4, 'prisonWall');
    P('gatePosts', gx, z1, { args: [3.2] }); for (const s of [1, -1]) { P('brickTower', gx + s * 4.4, z1 + 0.2, { args: [3.4, 1.3, 3.6], col: { w: 3.6, d: 1.3, h: 3.8, cam: true } }); P('banner', gx + s * 8, z1 - 0.42, { ry: -PI / 2, args: [2.2, s > 0 ? LAPIS : OCHRE] }); P('banner', gx + s * 8, z1 + 0.42, { ry: PI / 2, args: [2.2, s > 0 ? LAPIS : OCHRE] }); P('lampStand', gx + s * 2.4, z1 - 1.6, { col: { r: 0.22, h: 1.6 } }); P('potPlant', x0 + 2 + (s > 0 ? 26 : 0), 12.2, { args: ['palm'], col: { r: 0.32, h: 1 } }); }
    P('tileFloor', gx, 2.5, { args: [29, 15, 0xd8ccb0, 0xc4b696, 1.8], col: null }); P('tileFloor', gx, 11.5, { args: [3, 4.6, 0xd8ccb0, 0xc4b696, 1.5], col: null }); P('flowers', -41, 3, { args: [0xd86a8a] }); P('flowers', -19, 3, { args: [0xe8c850] }); P('datePalm', -42.4, -2.4); P('datePalm', -17.6, 0.4);
    P('cellRow', -30, -7.6, { args: [5, 5.5, 4.4, 2.8, 4] }); W.addCol({ x: -32.175, z: -5.55, w: 23.55, d: 0.4, h: 2.8, cam: false }); W.addCol({ x: -17.1, z: -5.55, w: 2.1, d: 0.4, h: 2.8, cam: false }); GG.CELLDOOR = W.addCol({ x: -19.275, z: -5.55, w: 2.25, d: 0.4, h: 2.8, cam: false }); /* v18.35 Joseph is one prisoner among the others: the same row, the same bars, a door of his own */
    for (const x of [-41, -35.5, -30, -24.5]) P('straw', x, -8.8);
    W.addCol({ x: -19, z: -9.85, w: 5.9, d: 0.5, h: 2.9, cam: true }); W.addCol({ x: -21.75, z: -7.6, w: 0.5, d: 4.4, h: 2.9, cam: true }); W.addCol({ x: -16.25, z: -7.6, w: 0.5, d: 4.4, h: 2.9, cam: true });
    if (W.addRoof) W.addRoof({ x: -19, z: -7.6, w: 5.3, d: 4.2, y: W.heightAt(-19, -7.6) + 2.8, k: 'jcell' }); P('straw', -20.2, -8.6); P('egHouse', -20, 8.6, { ry: PI, args: [{ w: 6, d: 4.4, h: 2.8 }], col: { w: 6, d: 4.4, h: 3, a: PI, cam: true } });
    P('tableEg', SPOTS.yard[0] - 2, SPOTS.yard[1] + 4, { col: { w: 1.8, d: 0.8, h: 0.9 } }); P('well', SPOTS.basin[0], SPOTS.basin[1], { args: [{ r: 0.8, posts: false }], col: { r: 1.2, h: 1 } }); P('jars', -43, 12.5, { args: [3] }); P('brazier', -26, 9); P('brazier', -34, 9); }
  // ================= THE ROYAL CITY
  const city = [[-40, -60], [-30, -58], [-12, -58], [-2, -62], [-42, -72], [-6, -74], [-40, -86], [-30, -88], [-12, -88], [-2, -84], [-46, -98], [-34, -104]];
  city.forEach(([x, z], i) => P('egHouse', x, z, { ry: (i % 4) * PI / 2 + (r() - 0.5) * 0.1, args: [{ w: 6 + (i % 3), d: 5, h: 2.8 + (i % 2) * 1.2, awning: i % 3 === 0 ? OCHRE : null }], col: { w: 6 + (i % 3), d: 5, h: 3.4 + (i % 2) * 1.2, a: (i % 4) * PI / 2, cam: true } }));
  [[-26, -76, 0x8a3a5a], [-18, -76, 0x2c5aa0], [-26, -66, 0x3e8a66], [-18, -66, 0xd9a73a]].forEach(([x, z, c]) => { const a = x < -22 ? PI / 2 : -PI / 2; P('stallM', x, z, { ry: a, args: [c, true], col: { w: 2.6, d: 2.2, h: 2.2, a } }); }); // v18.14 the four stalls face the middle aisle (they stood at odd angles)
  P('well', -21, -90, { col: { r: 1.7, h: 1 } }); // v18.14 the city well, at the south edge of the square (the well action used to sit in the middle of the market with no well)
  P('palmRow', -48, -114, { args: [5] }); /* v18.55 the square's obelisk is gone: obelisks and pylons belong to the temple of On */
  // temple of On (Heliopolis): Asenath's father Potiphera is its priest (창 41:45)
  P('obelisk', 5, -95, { col: { r: 0.8, h: 8 } }); P('obelisk', 19, -95, { col: { r: 0.8, h: 8 } }); for (const s of [1, -1]) P('pylon', 12 + s * 5.6, -98.2, { s: 0.42, col: { w: 5, d: 1.8, h: 4.8, cam: true } }); /* v18.55 the temple's own gate */ P('portico', 12, -102, { args: [12, 6, 3.6, 4], col: { w: 12, d: 5, h: 4, cam: true } });
  // ================= PHARAOH'S PALACE
  { const x0 = -54, x1 = -6, z0 = -182, z1 = -142, gx = -30;
    wallL(x0, z0, -47.2, z0, 5); wallL(-44.8, z0, -15.2, z0, 5); wallL(-12.8, z0, x1, z0, 5); wallL(x0, -212, x0, z1, 5); wallL(x1, -212, x1, z1, 5); wallL(x0, -212, x1, -212, 5); wallL(x0, z1, gx - 9.9, z1, 5);
    /* v18.36 the king's own house behind the throne court: a long hall, then the dining hall, his bedchamber and the vizier's office */
    { const y5 = W.heightAt(-30, -195) + 5; wallL(x0, -190, -47.2, -190, 5); wallL(-44.8, -190, -31.2, -190, 5); wallL(-28.8, -190, -15.2, -190, 5); wallL(-12.8, -190, x1, -190, 5); wallL(-38, -212, -38, -190, 5); wallL(-22, -212, -22, -190, 5);
      for (const [x, z] of [[-46, z0], [-14, z0], [-46, -190], [-30, -190], [-14, -190]]) P('lintel', x, z, { args: [2.4, 3, 5], col: null });
      P('slab', -30, -197, { args: [48, 30, 5], col: null }); if (W.addRoof) { W.addRoof({ x: -30, z: -186, w: 47.4, d: 7.4, y: y5, k: 'phHall' }); for (const [x, k] of [[-46, 'phDine'], [-30, 'phBed'], [-14, 'phOffice']]) W.addRoof({ x, z: -201, w: 15.4, d: 21.4, y: y5, k }); }
      P('tileFloor', -30, -186, { args: [47.4, 7.6, 0xece2cc, 0x3e6a8a, 1.9], col: null }); P('tileFloor', -46, -201, { args: [15.4, 21.6, 0xdccdb0, 0xbba980, 1.8], col: null }); P('tileFloor', -30, -201, { args: [15.4, 21.6, 0xe6dcc4, 0xd0b888, 1.8], col: null }); P('tileFloor', -14, -201, { args: [15.4, 21.6, 0xdcd6c4, 0xb8c0b0, 1.8], col: null });
      for (const x of [-52, -38, -22, -8]) P('pillarEg', x, -186, { args: [4.9], col: { r: 0.42, h: 5, cam: false } });
      for (const x of [-50.6, -41, -35, -25, -19, -9.4]) P('banner', x, -189.5, { ry: PI / 2, args: [2.8, [LAPIS, TURQ, OCHRE][Math.abs(Math.round(x)) % 3]] }); for (const x of [-42, -18]) { P('lampStand', x, -183.4, { col: { r: 0.22, h: 1.6 } }); P('potPlant', x + 8, -183.4, { args: ['papyrus'], col: { r: 0.32, h: 1 } }); }
      /* dining hall */ P('rugEg', -46, -202, { args: [11, 5, LAPIS, GOLD] }); for (const x of [-49.6, -46, -42.4]) { P('tableEg', x, -202, { col: { w: 1.9, d: 0.9, h: 0.9 } }); P('fruitBowl', x, -202, { dy: 0.84 }); for (const s of [1, -1]) P('stool', x, -202 + s * 1.1); } P('loaves', -46, -201.6, { dy: 0.84 }); P('oilLamp', -44.2, -202.2, { dy: 0.84 }); P('seatEg', -52.4, -202, { ry: PI / 2, col: { r: 0.45, h: 1 } }); P('jars', -46, -210.6, { args: [4], col: { w: 2.6, d: 0.6, h: 1 } }); for (const [x, z] of [[-52, -193], [-40, -193], [-52, -209.6], [-40, -209.6]]) P('lampStand', x, z, { col: { r: 0.22, h: 1.6 } }); P('banner', -50, -211.5, { ry: PI / 2, args: [2.8, TURQ] }); P('banner', -42, -211.5, { ry: PI / 2, args: [2.8, OCHRE] });
      /* the king's bedchamber */ P('bedBig', -30, -208.6, { col: null }); P('rugEg', -30, -203, { args: [7, 5, OCHRE, LAPIS] }); for (const s of [1, -1]) { P('lampStand', -30 + s * 2.6, -210.4, { col: { r: 0.22, h: 1.6 } }); P('chestEg', -30 + s * 6, -208, { ry: -s * PI / 2, col: { w: 0.7, d: 1, h: 0.75 } }); P('potPlant', -30 + s * 6.2, -193, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('banner', -30 + s * 4.6, -211.5, { ry: PI / 2, args: [2.8, s > 0 ? LAPIS : TURQ] }); P('fan', -30 + s * 2.4, -206.8); }
      /* the vizier's office */ P('scribeDesk', -14, -206.4, { col: { w: 1.3, d: 0.7, h: 0.6 } }); P('seatEg', -14, -207.8, { col: { r: 0.45, h: 1 } }); P('tableEg', -9.6, -200, { ry: PI / 2, col: { w: 0.9, d: 1.9, h: 0.9 } }); P('oilLamp', -9.6, -200.4, { dy: 0.84 }); P('rugEg', -14, -200, { args: [6, 7, TURQ, LINEN] }); for (const [k, z] of [['wine', -196], ['grain', -200], ['figs', -204]]) { P('shelves', -20.8, z, { ry: PI / 2, args: [k] }); W.addCol({ x: -20.8, z, w: 0.6, d: 2.2, h: 2 }); } P('chestEg', -8, -209, { ry: -PI / 2, col: { w: 0.7, d: 1, h: 0.75 } }); P('banner', -14, -211.5, { ry: PI / 2, args: [2.8, LAPIS] }); for (const x of [-18.6, -9.4]) P('lampStand', x, -210, { col: { r: 0.22, h: 1.6 } });
      if (GG.friezeRoom) { GG.friezeRoom(-53.55, -38.45, -211.5, -190.45, 3.9); GG.friezeRoom(-37.55, -22.45, -211.5, -190.45, 3.9); GG.friezeRoom(-21.55, -6.45, -211.5, -190.45, 3.9); }
      for (const x of [-46, -30, -14]) { P('hieroWall', x, -211.3, { args: [15, 5], col: null }); for (const [dx, z] of [[-5.6, -197], [5.6, -197], [-5.6, -205], [5.6, -205]]) P('pillarEg', x + dx, z, { args: [4.9], col: { r: 0.42, h: 5, cam: false } }); }
      P('dais', -30, -208.6, { args: [6, 4.4, 0.14], col: null }); for (const [x, z] of [[-24.2, -192.6], [-39.8, -192.6]]) P('brazier', x, z);
      GG.PALACE = { bedCol: W.addCol({ x: -30, z: -208.6, w: 2.7, d: 2.3, h: 1.1 }), bed: W.addCol({ x: -30, z: -190, w: 2.4, d: 0.4, h: 3 }), office: W.addCol({ x: -14, z: -190, w: 2.4, d: 0.4, h: 3 }) }; } wallL(gx + 9.9, z1, x1, z1, 5);
    for (const s of [1, -1]) P('brickTower', gx + s * 6.6, z1, { args: [6.2, 2.4, 6], col: { w: 6.6, d: 2.4, h: 6.4, cam: true } }); P('gatePosts', gx, z1, { args: [5] }); /* v18.55 a palace gate of plastered brick (no pylons, no obelisks) */
    /* v18.74 the palace front: long banners on both gate towers, a blue carpet out of the gate, braziers either side of it */
    for (const s of [1, -1]) for (const k of [0, 1]) { const fc = [[OCHRE, LAPIS], [TURQ, OCHRE]][k][s > 0 ? 0 : 1];
      P((g, M) => { g.box(1.5, 0.18, 0.12, { m: M, at: [0, 5.55, 0], c: GOLD, j: 0 }); g.box(1.3, 3.7, 0.05, { m: M, at: [0, 3.65, 0], c: fc, j: 0.02 }); g.box(1.3, 0.22, 0.06, { m: M, at: [0, 4.9, 0.01], c: GOLD, j: 0 }); g.box(1.3, 0.16, 0.06, { m: M, at: [0, 2.2, 0.01], c: LINEN, j: 0 }); g.box(0.5, 0.5, 0.06, { m: M, at: [0, 3.7, 0.015], c: GOLD, j: 0 }); }, gx + s * (4.9 + k * 3.4), z1 + 1.24, { col: null }); }
    P('rugEg', gx, z1 + 6, { args: [2.6, 12, LAPIS, GOLD], col: null }); for (const s of [1, -1]) P('brazier', gx + s * 3.4, z1 + 9.5);
    for (let row = 0; row < 3; row++) for (const s of [1, -1]) { const x = gx + s * 7.5, z = -150 - row * 7; P('column', x, z, { args: [6.5], col: { r: 0.85, h: 7, cam: true } }); }
    for (const s of [1, -1]) { P('pool', gx + s * 14, -152, { args: [6, 9] }); GG.wade(W, gx + s * 14, -152, 6, 9); }
    P('dais', gx, -176, { args: [10, 6, 1.1], col: { w: 10, d: 6, h: 1.1 } }); P('throne', gx, -177.4, { y: padH(gx, -176) + 1.1 });
    { const yb = W.heightAt(gx, -170); for (const [x, z] of [[gx - 6.4, -170.2], [gx + 6.4, -170.2], [gx - 6.4, -180.2], [gx + 6.4, -180.2]]) P('pillarEg', x, z, { args: [6.4], col: { r: 0.42, h: 6.4, cam: false } }); P('slab', gx, -175.2, { args: [14.6, 11.6, 6.4], col: null, y: yb }); for (const z of [-170.2, -180.2]) P((g, M) => { g.box(14.4, 0.5, 0.6, { m: M, at: [0, 6.15, 0], c: GOLD }); g.box(14.4, 0.12, 0.62, { m: M, at: [0, 5.86, 0], c: LAPIS, j: 0 }); }, gx, z, { y: yb }); if (W.addRoof) W.addRoof({ x: gx, z: -175.2, w: 14.2, d: 11.2, y: yb + 6.4, k: 'phThrone' }); } /* v18.55 the throne under a roof on four pillars and two beams (it stood under the open sky) */ P('brazier', gx - 6, -172); P('brazier', gx + 6, -172);
    P('hieroWall', gx, -181.3, { args: [29.6, 5] }); P('hieroWall', -50.1, -181.3, { args: [5.8, 5] }); P('hieroWall', -9.9, -181.3, { args: [5.8, 5] }); P('palmRow', -52, -158, { args: [3] }); }
  // the vizier's house
  P('egHouse', 10, -144, { args: [{ w: 12, d: 8, h: 4.2, awning: LAPIS }], col: { w: 12, d: 8, h: 4.4, cam: true } }); P('pool', 4, -134, { args: [5, 3] }); GG.wade(W, 4, -134, 5, 3); P('palmRow', 14, -132, { args: [2] }); P('datePalm', -2, -139);
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
    P(t, x, z, { scatter: 1, ry: r() * 6, s: 0.8 + r() * 0.5, col: big ? tree : t === 'rock' ? { r: 1.1, h: 1.2 } : t === 'outcrop' ? { r: 1.8, h: 2 } : null });
  }
  const smallPts = G.poisson ? G.poisson(r, -200, -200, 200, 200, (x, z) => 13.5 - 4.5 * Math.max(canaanK(x), fert(x, z)), 9, 13.5) : []; // v17.0 포아송 디스크 (grass, flowers, shrubs)
  for (let i = 0; i < smallPts.length; i++) { const x = smallPts[i][0], z = smallPts[i][1]; if (!ok(x, z, 4)) continue; /* v18.40 keep shrubs off the road edge */ const C = canaanK(x), F = fert(x, z);
    if (C > 0.5) P(r() < 0.55 ? 'flowers' : r() < 0.7 ? 'dryGrass' : 'bush', x, z, { scatter: 1, ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xd8343a, 0xf0e0f0, 0xe8c040, 0x8a6ad8][i % 4]] });
    else if (F > 0.4) P(r() < 0.6 ? 'dryGrass' : 'flowers', x, z, { scatter: 1, ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xf0e0f0, 0xe8c040][i % 2]] });
    else P(r() < 0.8 ? 'dryGrass' : 'retama', x, z, { scatter: 1, ry: r() * 6, s: 0.7 + r() * 0.6, detail: 1 }); }
  // gathering: a few sticks and stones in Canaan, figs and olives
  const around = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = rr * (0.4 + r() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 4.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75)) continue; node(types[i % types.length], x, z); } };
  around(176, 152, 38, 14, ['fig', 'olive', 'deadwood', 'rock']); around(188, -12, 30, 8, ['olive', 'fig', 'deadwood']);
  { const r2 = GG.rng(9001); let nsid = 0; const near = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r2() * 6.28, d = rr * (0.4 + r2() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 4.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75)) continue; if (waterDist(x, z) >= 4) W.nodes.push({ id: 'ns' + (nsid++), type: types[i % types.length], x, y: W.heightAt(x, z), z, ry: r2() * 6, s: 0.85 + r2() * 0.3 }); } }; // v18.12 stones: creek pebbles near the well, flint and black rock out on the hills
    near(160, 150, 26, 5, ['creek']); near(176, 152, 40, 4, ['flintrock', 'rock']); near(188, -12, 32, 6, ['creek', 'flintrock', 'blackrock']); near(150, 40, 40, 5, ['rock', 'creek', 'blackrock']); }
  if (typeof proBuild === 'function') proBuild(W, P); if (typeof ch1Build === 'function') ch1Build(W, P); if (typeof ch2Build === 'function') ch2Build(W, P); if (typeof ch3Build === 'function') ch3Build(W, P); if (typeof ch5Build === 'function') ch5Build(W, P); if (typeof ch8Build === 'function') ch8Build(W, P); /* v18.67 the prologue's road places (e_prologue.js) */
  furnish(P, W);
}

// ------------------------------------------------------------------ LOOKS
const KID = o => Object.assign({ wrap: 0x548178, kid: true, skin: 0xe2ab7c, top: 0xd8c8a0, trim: 0x8a5a3a, hair: 0x2a1810, hairStyle: 'curly', belt: 0x6a4428, noPouch: true }, o);
const HEB = (o) => Object.assign({ wovenWrap: true, skin: 0xd09868, hair: 0x2a1810, beard: 'short', beardCol: 0x2a1810, belt: 0x4a3022, legWrap: 0x8a7a5a }, o);
const EGM = (o) => Object.assign({ linenPanel: true, skin: 0xb07448, bare: true, kilt: true, kiltLong: true, bottom: LINEN, hair: 0x15100c, hairStyle: 'wig', barefoot: false, sandal: 0x8a6a40 }, o);
const EGF = (o) => Object.assign({ linenPanel: true, skin: 0xd8a070, fem: true, long: true, top: LINEN, under: LINEN, trim: 0xe8dcc0, hair: 0x15100c, hairStyle: 'wig', collar: TURQ, collar2: GOLD }, o);
const COAT = [0xb3472e, 0xe8dcc0, 0x2e4a78, 0xe0b040, 0x3e8a66, 0xe8dcc0, 0x8a3a8a, 0xd86a2a];   // 채색옷 (창 37:3)
const JO = { skin: 0xe2ab7c, hair: 0x2a1810, hairStyle: 'curly', eye: 0x5a3a20, build: 0.62, jaw: -0.25, browAng: 0.1, vary: false }; // v17.0: Joseph's face is hand-set (no per-NPC variation)
const LOOK = {
  // Joseph through the years
  // 채색옷 v12: a plain cream tunic, with the long striped coat worn open over it — three colours in vertical bands
  josephCoat: Object.assign({}, JO, { long: true, longSleeve: true, top: 0xeee4cc, bottom: 0xeee4cc, trim: 0xd8c49a, belt: 0x6a4428, mantle: 0x9a3226, mantleStripes: [0x9a3226, 0xd4a238, 0x2e4a78, 0x3e7a5a, 0x7a3a7a, 0xc8622a, 0x2a6a8a, 0xb84a2e], mantleWeave: true, mantleTrim: 0x5a2420 }), /* v18.40 woven, many colours */
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
  jacob: { patriarch: true, wrap: 0x275765, yoke: 0x9e734a, skin: 0xd8a070, top: 0xc49c70, trim: 0x315b65, trim2: 0xd8c49a, under: 0xd8c49a, hair: 0xd8d0c4, hairStyle: 'short', beard: 'long', beardCol: 0xf1e5cf, mantle: 0x334e5a, mantleShort: true, mantleTrim: 0xc39651,
    headwear: 'turban', clothCol: 0xcbae78, clothStripe: 0x3a6aa0, bandCol: 0x5a3a24, belt: 0x5a3a24, legWrap: 0x8a7458, limp: true, age: 'old', eye: 0x6a3e22, browAng: -0.1, long: true },
  jacobMourn: { patriarch: true, wrap: 0x635548, skin: 0xd8a070, top: 0x5a4e40, trim: 0x3a3228, hair: 0xd8d0c4, hairStyle: 'wild', beard: 'long', beardCol: 0xece6dc, belt: 0x3a3228, age: 'old', long: true, eye: 0x6a3e22, browAng: -0.45 },   // 굵은 베 (창 37:34)
  benjamin: KID({ yoke: 0x509473, top: 0xe0c8a0, trim: 0x3e8a66, sash: 0x3e8a66, hairStyle: 'curly', skin: 0xe8b48a }),
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
  leah: { wrap: 0x844d68, yoke: 0xb28c98, skin: 0xe0b088, top: 0x98708e, long: true, trim: 0x5a3a5a, trim2: 0xe0c070, under: 0x98708e, hair: 0x6a5a50, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8c8a0, clothStripe: 0xa86a8a, age: 'old', browAng: -0.3 },
  dinah: { wrap: 0xb86354, skin: 0xe2ab7c, top: 0xd88a9a, long: true, trim: 0xa84a5a, hair: 0x2a1810, hairStyle: 'long', headwear: 'veil', clothCol: 0xe8dcc0, clothStripe: 0xa84a5a, fem: true, sash: 0xe0b040 },
  man: { skin: 0xc8a080, top: 0xd8d0c0, long: true, trim: 0x8a7a60, under: 0xd8d0c0, hair: 0x3a3028, headwear: 'cloth', clothCol: 0xe8e4dc, bandCol: 0x8a7a60, mantle: 0xb8b0a0, beard: 'short', beardCol: 0x5a5048, browAng: 0.2, age: 'old' },
  ishmael: { skin: 0xa86e44, long: true, stripes: [0x8a7458, 0x8a7458, 0x3a2a1a, 0x8a7458, 0xc8a050, 0x8a7458], stripesB: [0x8a7458, 0x3a2a1a, 0x8a7458, 0x8a7458, 0xc8a050, 0x8a7458], beard: 'long', beardCol: 0x1a1410, hair: 0x1a1410, headwear: 'turban', clothCol: 0xf0e8d8, bandCol: 0x3a2a1a, sash: 0xb3472e, boots: 0x4a3426, browAng: 0.3 },
  midian: { skin: 0xb07848, long: true, stripes: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xc8963a], stripesB: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xe8dcc0, 0xc8963a], beard: 'short', hair: 0x2a1810, headwear: 'turban', clothCol: 0xd9a73a, bandCol: 0x7a3b2a, sash: 0x2c5aa0, smile: 0.6 },
  ishBoy: KID({ skin: 0xb07848, top: 0xc8b890, trim: 0x7a3b2a, headwear: 'cloth', clothCol: 0xf0e8d8, bandCol: 0x7a3b2a, hairStyle: 'short' }),
  // Egypt
  auctioneer: EGM({ skin: 0xa86a40, hairStyle: 'bald', /* v18.42 Egyptians shaved */ collar: 0xb3472e, browAng: 0.4, build: 1.2 }),
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
  keeper: EGM({ skin: 0x9a6038, top: 0x6a4a30, bare: false, sleeveless: true, long: false, bottom: 0x8a6a48, hairStyle: 'short', build: 1.35, /* v18.42 shaved */ browAng: 0.55, jaw: 0.7 }),
  cupbearer: EGM({ top: LINEN, bare: false, long: true, collar: GOLD, collar2: TURQ, bands: GOLD, smile: 0.4 }),
  baker: EGM({ top: LINEN, bare: false, long: true, collar: 0xd8b878, build: 1.25, hairStyle: 'bald', browAng: -0.15 }),
  prisoner: EGM({ bottom: 0x9a8a6a, hairStyle: 'wild', beard: 'short', beardCol: 0x2a1810, skin: 0x9a6038 }),
  oldPrisoner: EGM({ bottom: 0x8a7a5a, hairStyle: 'wild', hair: 0xc8c0b8, beard: 'long', beardCol: 0xd8d0c8, age: 'old', skin: 0x9a6038 }),
  youngPrisoner: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: 0x9a8a6a, hairStyle: 'wild', top: 0x9a8a6a }),
  pharaoh: EGM({ headwear: 'nemes', collar: GOLD, collar2: LAPIS, bands: GOLD, top: LINEN, bare: false, sleeveless: true, sash: GOLD, beard: 'false', beardCol: 0x15100c, /* v18.42 a false plaited beard, not a real one */ build: 1.1, jaw: 0.3, browAng: 0.2, sandal: GOLD }),
  magician: EGM({ hairStyle: 'bald', top: LINEN, long: true, bare: false, collar: 0x2a1810, sash: 0x2a1810, browAng: 0.35, age: 'old', hair: 0xb8b0a8 }),
  messenger: EGM({ collar: TURQ, bands: GOLD, top: LINEN, bare: false, sleeveless: true, build: 1.0 }),
  asenath: EGF({ skin: 0xe0aa78, top: 0xf8f2e6, collar: GOLD, collar2: TURQ, sash: TURQ, headband: GOLD, smile: 0.55, browAng: 0.05 }),
  manasseh: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  ephraim: KID({ skin: 0xd8a070, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'curly' }),
  farmer: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }),
  farmerThin: EGM({ hairStyle: 'short', bottom: 0x9a8a6a, skin: 0x9a6038, build: 0.4 }),
  woman: EGF({ skin: 0xb88050, top: 0xe0d4b8, collar: 0x8a6a48, collar2: 0, hairStyle: 'long' }),
  elder: EGM({ hairStyle: 'short', hair: 0xd8d0c8, age: 'old', top: 0xe8dcc0, bare: false, long: true }), /* v18.42 shaved */
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
  /* v23 camp furniture by the morning fire (the opening: Joseph sits on the log instead of crouching on the bare ground) */
  logSeat(g, M, r) { // a sawn oak round, bark on the sides and growth rings on the top, a folded fleece over it
    g.cyl(0.215, 0.235, 0.44, 12, { m: M, at: [0, 0.22, 0], c: (x, y, z) => (Math.floor(Math.atan2(z, x) * 5 + y * 9) % 3 ? 0x5a3e28 : 0x4a3220), j: 0.05 });
    for (let i = 0; i < 4; i++) g.cyl(0.2 - i * 0.05, 0.2 - i * 0.05, 0.008, 12, { m: M, at: [0, 0.441 + i * 0.002, 0], c: i % 2 ? 0xb88a5a : 0xcca070, j: 0 });
    g.surf((u, v) => { const a = u * PI * 2, rr = 0.25 + 0.03 * Math.sin(a * 5) + 0.02 * Math.sin(a * 9 + 1), y = 0.455 + 0.025 * Math.sin(v * PI) - (v > 0.8 ? (v - 0.8) * 0.5 : 0); return [Math.cos(a) * rr * (1 - v * 0.15), y - Math.max(0, Math.cos(a) * 0.8 - 0.4) * v * 0.18, Math.sin(a) * rr * (1 - v * 0.15) * 0.85]; }, 20, 3, { m: M, c: 0xece0c4, j: 0.06, flat: true });
    for (let i = 0; i < 14; i++) { const a = r() * PI * 2, d = r() * 0.17; g.sph(0.035, 5, 3, { m: M, at: [Math.cos(a) * d, 0.475, Math.sin(a) * d * 0.85], s: [1, 0.55, 1], c: i % 3 ? 0xf2e8d0 : 0xdccfae, j: 0.05 }); } },
  fireWood(g, M, r) { // split logs stacked crosswise, a hatchet in the top one
    for (let k = 0; k < 3; k++) for (let i = 0; i < 3 - (k > 1 ? 1 : 0); i++) { const ln = 0.62 + r() * 0.12; g.cyl(0.055, 0.06, ln, 6, { m: M, at: k % 2 ? [-0.14 + i * 0.13, 0.06 + k * 0.105, 0] : [0, 0.06 + k * 0.105, -0.14 + i * 0.13], rz: k % 2 ? 0 : PI / 2, rx: k % 2 ? PI / 2 : 0, c: [0x6a4a2e, 0x5a3e26, 0x7a5636][(i + k) % 3], j: 0.06, flat: true });
      g.cyl(0.05, 0.05, 0.01, 6, { m: M, at: k % 2 ? [-0.14 + i * 0.13, 0.06 + k * 0.105, ln / 2] : [ln / 2, 0.06 + k * 0.105, -0.14 + i * 0.13], rz: k % 2 ? 0 : PI / 2, rx: k % 2 ? PI / 2 : 0, c: 0xc89a66, j: 0 }); }
    g.cyl(0.014, 0.016, 0.42, 5, { m: M, at: [0.1, 0.42, 0.05], rz: -0.9, c: 0x8a6a48 }); g.box(0.1, 0.07, 0.015, { m: M, at: [-0.06, 0.53, 0.05], rz: -0.9, c: 0x9a9a98, j: 0 }); },
  cookTripod(g, M, r) { // three poles lashed at the top, a blackened clay pot hanging over the fire on a cord
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3 + 0.4; g.cyl(0.022, 0.028, 1.45, 5, { m: M, at: [Math.cos(a) * 0.34, 0.68, Math.sin(a) * 0.34], ry: -a, rz: 0.24, c: 0x6a4c30 }); }
    g.cyl(0.035, 0.035, 0.08, 6, { m: M, at: [0, 1.38, 0], c: 0xb8a070 }); g.cyl(0.006, 0.006, 0.66, 3, { m: M, at: [0, 1.05, 0], c: 0x8a7a5a });
    g.lathe([[0.06, 0.52], [0.15, 0.56], [0.18, 0.64], [0.16, 0.72], [0.11, 0.76], [0.12, 0.79]], 12, { m: M, c: (x, y) => y < 0.62 ? 0x2a2420 : 0x6a4434, j: 0.04 });
    g.cyl(0.115, 0.115, 0.012, 12, { m: M, at: [0, 0.79, 0], c: 0x9a8a5a, j: 0 }); },
  sheepskinRug(g, M, r) { g.surf((u, v) => { const a = u * PI * 2, rr = (0.5 + 0.06 * Math.sin(a * 6) + 0.04 * Math.sin(a * 11)) * v; return [Math.cos(a) * rr * 1.25, 0.02 + 0.012 * (1 - v), Math.sin(a) * rr * 0.8]; }, 24, 3, { m: M, c: (x, y, z) => Math.hypot(x, z) > 0.45 ? 0xdccfae : 0xece2c8, j: 0.05 }); },
  waterSkin(g, M, r) { // a goatskin of water slung from a little three-pole stand, sweating in the shade
    for (let i = 0; i < 3; i++) { const a = i * PI * 2 / 3; g.cyl(0.016, 0.02, 1.25, 4, { m: M, at: [Math.cos(a) * 0.2, 0.6, Math.sin(a) * 0.2], ry: -a, rz: 0.17, c: 0x7a5a3a }); }
    g.cyl(0.006, 0.006, 0.18, 3, { m: M, at: [0, 1.06, 0], c: 0x8a7a5a });
    g.surf((u, v) => { const a = u * PI * 2, y = 0.55 + v * 0.42, bulge = Math.sin(v * PI) * (0.16 - v * 0.05) + 0.02; return [Math.cos(a) * bulge * 1.15, y - Math.max(0, Math.cos(a)) * 0.04 * Math.sin(v * PI), Math.sin(a) * bulge * 0.8]; }, 14, 6, { m: M, c: (x, y) => (y > 0.92 ? 0x3a2a1a : 0x6e4a2e), j: 0.06 });
    for (const s of [1, -1]) g.cyl(0.03, 0.02, 0.12, 5, { m: M, at: [s * 0.14, 0.62, 0.05], rz: s * 0.9, c: 0x5e3e26 }); },
  quern(g, M, r) { // a saddle quern: the long lower stone, the rubbing stone, a spill of grain and a basket
    g.box(0.62, 0.14, 0.34, { m: M, at: [0, 0.07, 0], rx: 0.08, taper: 0.9, c: 0x8a8278, j: 0.06 }); g.box(0.5, 0.02, 0.24, { m: M, at: [0, 0.155, 0], rx: 0.08, c: 0xa09888, j: 0.04 });
    g.sph(0.09, 7, 5, { m: M, at: [0.06, 0.2, 0], s: [1.4, 0.55, 0.9], c: 0x6e6a62, flat: true });
    for (let i = 0; i < 16; i++) g.sph(0.012, 3, 2, { m: M, at: [0.3 + r() * 0.12, 0.03, (r() - 0.5) * 0.2], c: 0xd8b878, j: 0.1 });
    g.lathe([[0.1, 0], [0.16, 0.04], [0.18, 0.14], [0.17, 0.15]], 10, { m: M, at: [-0.48, 0, 0.08], c: (x, y) => (Math.floor(y * 40) % 2 ? 0xb8925a : 0x9a7444) }); g.cyl(0.15, 0.15, 0.03, 10, { m: M, at: [-0.48, 0.12, 0.08], c: 0xe0c890 }); },
  loomUp(g, M, r) { // an upright loom: two posts and a beam, warp threads weighted with clay rings, a band of striped cloth begun at the top
    for (const s of [1, -1]) g.cyl(0.035, 0.04, 1.9, 6, { m: M, at: [s * 0.62, 0.95, 0], rx: -0.12, c: 0x6a4a30 });
    g.cyl(0.03, 0.03, 1.36, 6, { m: M, at: [0, 1.84, -0.11], rz: PI / 2, c: 0x7a5636 });
    const cols = [0xb3472e, 0xe8dcc0, 0x2e4a78, 0xe8dcc0, 0xd4a238];
    for (let i = 0; i < 12; i++) { const y = 1.79 - i * 0.05; g.box(1.16, 0.05, 0.02, { m: M, at: [0, y, -0.11 + (1.84 - y) * 0.12], rx: -0.12, c: cols[i % cols.length], j: 0.03 }); }
    for (let i = 0; i < 22; i++) { const x = -0.55 + i * 0.052; g.cyl(0.003, 0.003, 0.72, 3, { m: M, at: [x, 0.84, 0.03], rx: -0.12, c: 0xe8dcc0, j: 0 }); g.cyl(0.03, 0.03, 0.035, 6, { m: M, at: [x, 0.44, 0.08], rx: PI / 2, c: 0x9a6a46, j: 0.08 }); } },
  herbRack(g, M, r) { // a rail between two forked sticks, bundles of herbs and a fleece hung to dry
    for (const s of [1, -1]) { g.cyl(0.025, 0.03, 1.45, 5, { m: M, at: [s * 0.8, 0.72, 0], c: 0x6a4c30 }); g.cyl(0.015, 0.02, 0.2, 4, { m: M, at: [s * 0.8 + 0.05, 1.47, 0], rz: -0.5, c: 0x6a4c30 }); }
    g.cyl(0.02, 0.02, 1.7, 5, { m: M, at: [0, 1.42, 0], rz: PI / 2, c: 0x7a5a3a });
    for (let i = 0; i < 5; i++) { const x = -0.6 + i * 0.22; g.cyl(0.004, 0.004, 0.1, 3, { m: M, at: [x, 1.36, 0], c: 0x8a7a5a }); g.lathe([[0.005, 0.95], [0.05, 1.08], [0.035, 1.24], [0.012, 1.31]], 6, { m: M, at: [x, 0, 0], c: [0x6e8a3a, 0x8a9a4a, 0x5a7a32, 0xa08a3a, 0x7a8a42][i], j: 0.08 }); }
    g.surf((u, v) => [0.15 + u * 0.55, 1.4 - v * 0.75, 0.03 + 0.04 * Math.sin(u * 9 + v * 4)], 8, 6, { m: M, c: 0xece2c8, ds: true, j: 0.05 }); },
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
  P('rugEg', -30.4, 38.9, { args: [7.4, 6.4] }); P('rugEg', -35.8, 42.4, { ry: PI / 2, args: [2.4, 3.2, TURQ, LINEN] });
  for (const x of [-39.4, -17.2]) P('lampStand', x, 38.6, { col: { r: 0.22, h: 1.6 } });
  for (const x of [-38.9, -19.2]) P('banner', x, 37.65, /* v18.40 moved off the wall's end so the side wall no longer cuts it */ { ry: PI / 2, args: [2.3, x < -28 ? LAPIS : TURQ] });
  P('potPlant', -40.1, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -16, 44.6, { args: ['palm'], col: { r: 0.32, h: 1 } }); P('potPlant', -39.9, 38.4, { args: ['papyrus'] });
  P('scribeDesk', -17.8, 44.9, { ry: PI, col: { w: 1.2, d: 0.6, h: 0.6 } }); P('stool', -17.8, 44.1);
  P('senet', -33, 44.4, { col: { w: 1.1, d: 0.5, h: 0.5 } }); P('stool', -33, 45.2); P('stool', -33, 43.6);
  P('chestEg', -40.2, 41, { ry: PI / 2, col: { w: 0.6, d: 0.9, h: 0.7 } }); P('fruitBowl', -22.4, 40.3, { dy: 0.84 }); P('oilLamp', -21.4, 40.5, { dy: 0.84 });
  // servants' quarters: bedding, a lamp, water and baskets
  [0x8a3a2a, 0x2c5aa0, 0x3e8a66, 0x7a3a6a].forEach((c, i) => P('blanket', -47.6, 46 + i * 3.4, { ry: PI / 2, args: [c] }));
  P('jugBowl', -43.4, 47.4); P('jugBowl', -43.4, 54.2, { ry: 1 }); P('lampStand', -43.2, 50.8, { col: { r: 0.22, h: 1.6 } }); P('baskets', -43.4, 58, { ry: PI / 2, args: [2] }); P('chestEg', -43.6, 44.6, { ry: -PI / 2 });
  // the kitchen: bread on the table, a drying rack, grain baskets, firewood by the oven
  P('loaves', -9.2, 45.4, { ry: PI / 2, dy: 0.84 }); P('hangRack', -8.3, 42.9, { ry: PI / 2, col: { w: 0.2, d: 2, h: 2, a: PI / 2 } });
  P('baskets', -12.6, 41.6, { args: [3] }); P('woodStack', -8.5, 41.5, { ry: 0.3 }); P('stool', -10.4, 44.1);
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
    talk: { jacob(S, G) { say([N('jacob', '네 형들이 세겜에서 양을 치지 아니하느냐? 너를 그들에게로 보내리라.', '창세기 37:13'),
      J('내가 그리하겠나이다.', '창세기 37:13', 'calm'),
      N('jacob', '가서 네 형들과 양떼가 다 잘 있는 여부를 보고 돌아와 내게 고하라.', '창세기 37:14'),
      N('jacob', '세겜은 북쪽으로 며칠 길이다. 큰길 하나만 따라가면 된다. 들짐승을 조심하고, 밤에는 불을 피우고 자거라.'),
      N('jacob', '…요셉아. 네 어미 라헬이 이렇게 자란 너를 보았다면 얼마나 기뻐했을까.', '', 'tender'),
      J('걱정 마세요, 아버지. 형들 소식을 가지고 금방 돌아올게요.', '', 'happy'),
      T('먼 길을 떠날 채비를 하세요. 장막 곁의 물건 가까이 가서 A를 누르면 챙길 수 있어요.')], () => { S.q.tut = 'items'; G.go('p_provision'); }); } } },
  p_provision: { ch: 1, obj: '길 떠날 채비', list: S => [{ t: '물가죽 부대 챙기기', ok: qd(S, 'skin') }, { t: '빵과 무화과 챙기기', ok: qd(S, 'bread') }, { t: '동생 베냐민에게 인사하기', ok: qd(S, 'benj') }],
    target: S => !qd(S, 'skin') ? { x: 182.2, z: 155.2 } : !qd(S, 'bread') ? { x: 178.9, z: 152.2 } : 'npc:benjamin', check: S => qd(S, 'skin') && qd(S, 'bread') && qd(S, 'benj'),
    talk: { benjamin(S, G) { if (S.q.benj) return false; say([N('benjamin', '형! 어디 가? 나도 갈래!', '', 'happy'), J('세겜에 형들 보러 가. 너는 아버지 곁에 있어야지.'),
      N('benjamin', '치이… 그럼 형, 꼭 빨리 와야 해. 약속!'), J('그래, 약속할게. 돌아오면 별 이야기 또 해 줄게.', '', 'tender'),
      N('benjamin', '아, 잠깐! 이거 가져가, 형. 내 보물 돌멩이 중에 제일 반짝이는 거야. 길에서 무서우면 꼭 쥐어.', '', 'tender'), J('…고마워, 베냐민. 형이 잘 간직할게.', '', 'tender'), /* v18.56 Benjamin's stone (it comes back on the caravan night) */
      T('요셉은 동생의 곱슬머리를 쓰다듬어 주었습니다. 이 약속이 지켜지기까지 얼마나 오랜 세월이 걸릴지, 그때는 아무도 알지 못했습니다.', '', 'sad')], () => tick(S, 'benj')); } },
    done(S, G, next) { S.q.tut = 'run'; next(); }, next: 'p_road' },
  p_road: { ch: 1, obj: '북쪽 세겜으로 · 큰길 따라가기', target: S => Gm().P.z > SPOTS.log[1] + 1 ? { x: SPOTS.log[0], z: SPOTS.log[1] - 3 } : 'spot:restOak',
    enter(S, G, re) { if (!re) G.UI.toast('길은 북쪽으로 이어져요 · 나침반을 따라가세요'); },
    check: (S, G) => G.dist(SPOTS.restOak[0], SPOTS.restOak[1]) < 9,
    done(S, G, next) { if (G.hour() < 18.6) S.time = GG.Game.clockTo(S, 18.7, 0); S.q.tut = null; G.UI.hint(null);
      narr([{ kick: '창세기 37장', title: '첫날 밤', t: '해가 서쪽 산 너머로 넘어갔습니다. 요셉은 길가의 큰 상수리나무 아래에서 밤을 지내기로 했습니다.', ref: '' }], next); }, next: 'p_night' },
  p_night: { ch: 1, obj: '상수리나무 아래 짚자리에 눕기', target: 'spot:restBed' },
  p_shechem: { ch: 1, obj: '세겜 들판에서 형들 찾기', list: S => [{ t: `형들의 흔적 살피기 (${Math.min(3, S.q.clues || 0)}/3)`, ok: (S.q.clues || 0) >= 3 }],
    enter(S, G, re) { if (!re) { const Gm = GG.Game, P0 = Gm.P; if (P0 && Math.hypot(P0.x - 188, P0.z + 12) > 30) { Gm.teleport(185.5, 8, Math.PI); Gm.snapCam && Gm.snapCam(); } } /* v18.42 「이튿날 세겜에 이르렀습니다」: Joseph is now at the edge of the Shechem fields, not still at the night camp */ if (!re) narr([{ kick: '창세기 37:14', title: '세겜 들판', t: '며칠을 걸어, 요셉은 세겜에 이르렀습니다. 그런데 들판 어디에도 형들과 양 떼가 보이지 않았습니다.', ref: '창세기 37:14' }], () => G.UI.hint('형들이 머물던 흔적을 찾아보세요 · 반짝이는 곳에서 A 버튼', 'clue', 'eye')); },
    target: S => { const c = ['clue1', 'clue2', 'clue3'].find(k => !(S.q.cl || {})[k]); return c ? 'spot:' + c : null; },
    check: S => (S.q.clues || 0) >= 3, done(S, G, next) { G.UI.hint(null); GG.Game.npcShow('man', true); next(); }, next: 'p_man' },
  p_man: { ch: 1, obj: '들판의 어떤 사람과 이야기하기', target: 'npc:man',
    talk: { man(S, G) { say([T('어떤 사람이 그를 만난즉, 그가 들에서 방황하는지라.', '창세기 37:15'), N('man', '네가 무엇을 찾느냐?', '창세기 37:15'),
      J('내가 나의 형들을 찾으오니, 청컨대 그들의 양 치는 곳을 내게 가르치소서…', '창세기 37:16'),
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
    enter(S, G, re) { S.q.inPit = 0; if (!re) GG.Cine.hold = true; setTimeout(() => cinJourney(S, G), re ? 600 : 30); }, // v16.1: the journey is a cutscene
    target: S => caravanTarget(S), check: (S, G) => !!S.q.reveal && (!!S.q.atMkt || G.dist(SPOTS.market[0], SPOTS.market[1]) < 24 || G.dist(SPOTS.market[0] + 14, SPOTS.market[1] - 12) < 12), done(S, G, next) { G.UI.hint(null); next(); }, next: 'c1_market' },
  c1_market: { ch: 2, obj: '애굽의 노예 장터', enter(S, G, re) { cinMarket(S, G); } },
  // =============================================================== 2장 · 보디발의 집
  c2_arrive: { ch: 3, obj: '종들의 숙소의 늙은 종과 이야기하기', target: 'npc:ameni', enter(S, G, re) { if (!re) setTimeout(() => GG.Life.bubble('neb', '세헤브! 셰마! (서둘러! 가라!)', 3.2), 800); },
    talk: { ameni(S, G) { say([EG('ameni', '엠 헤테프… 이-크 레크?', '평안하냐… 어디서 왔느냐?'), T('요셉은 고개를 저었습니다. 한 마디도 알아들을 수 없었습니다.', '시편 81:5 참고'),
      N('ameni', '…가나안 말을 하는구나? 나도 조금 할 줄 안다. 젊을 적에 대상을 따라 다녔거든.', '', 'tender'),
      J('말을… 알아들을 수 있는 분이 계시다니. 여기는 어디인가요?', '', 'weary'),
      N('ameni', '바로의 신하, 시위대장 보디발 나리의 집이다. 나리는 바로를 지키는 호위대의 우두머리시지. 이제 너는 이 집의 종이다.'),
      N('ameni', '울지 마라, 얘야. 종의 하루는 길단다. 살아남으려면 먼저 애굽 말부터 익혀야 해. 내가 가르쳐 주마.', '', 'tender'),
      { n: '요셉', t: '요셉은 무엇이라 대답했을까? (어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
        { t: '"…고맙습니다. 아직 마음이 많이 아픕니다. 그래도 하루씩 살아 보겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('honest', 'arrive'); } },
        { t: '"고맙습니다. 하나님이 이곳에서도 저와 함께하실 거예요. 열심히 배우겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('hope', 'arrive'); } }] },
      N('ameni', '자, 이 물항아리를 받아라. 우물에서 물을 길어 부엌 항아리를 채우고, 맷돌에 보리를 갈고, 외양간 소들에게 꼴을 주어라. 일하면서 말을 하나씩 가르쳐 주마.'),
      T('「애굽 말 배우기」 · 일을 하면 애굽 말을 하나씩 익혀요. 익힌 말은 사람들의 말을 알아듣는 데 도움이 돼요.')], () => { G.giveTool('jar'); G.hold('jar'); G.UI.toast('받은 물항아리를 손에 들었어요'); learn('hotep'); G.go('c2_work'); }); } } },
  c2_work: { ch: 3, obj: '종의 첫날', list: S => [{ t: '우물에서 물을 길어 부엌 항아리 채우기', ok: qd(S, 'w1') }, { t: '부엌 맷돌로 보리 갈기', ok: qd(S, 'w2') }, { t: '외양간 소들에게 꼴 주기', ok: qd(S, 'w3') }],
    target: S => !qd(S, 'w1') ? (S.water >= 4 ? { x: -8.6, z: 47.4 } : { x: -38, z: 58.8 }) : !qd(S, 'w2') ? 'spot:quern' : !qd(S, 'w3') ? { x: 9, z: 70 } : null,
    check: S => qd(S, 'w1') && qd(S, 'w2') && qd(S, 'w3'), done(S, G, next) { GG.Life.bubble('neb', '이 인! (이리 와!)', 3); next(); }, next: 'c2_quiz' },
  c2_quiz: { ch: 3, obj: '청지기 네브에게 일 보고하기', target: 'npc:neb',
    talk: { neb(S, G) { say([EG('neb', '히브리 종. 이 인 무!', ''),
      { n: '', t: '네브가 한 말은 무슨 뜻일까요?', choices: [{ t: '물을 가져오라는 말이에요.', ok: true }, { t: '빵을 달라는 말이에요.', ok: false, fb: '아메니가 속삭였다: "타는 빵이고… 무는?"' }, { t: '주인님이 부르신다는 말이에요.', ok: false, fb: '아메니가 속삭였다: "네브는 주인이란 뜻이지. 하지만 네브가 \'무\'라고 했잖니."' }] },
      T('요셉이 물을 따라 건네자, 네브는 한 모금 마시고 다시 물었습니다.'), EG('neb', '타 네페르?', ''),
      { n: '', t: '이번에는 무슨 뜻일까요?', choices: [{ t: '빵이 좋으냐고 묻는 거예요.', ok: true }, { t: '물이 차가우냐고요.', ok: false, fb: '"타"는 부엌에서 들었던 말이에요. 맷돌을 돌리며 헤누가 뭐라고 했지요?' }, { t: '소가 아프냐고요.', ok: false, fb: '소는 "카"예요. "타"는…?' }] },
      J('타… 네페르! (빵이 좋습니다!)', '', 'happy'),
      EG('neb', '…네페르.', '…좋다.'), N('ameni', '하하! 네브가 누구에게 「좋다」고 하는 건 처음 듣는구나. 「네페르」는 「좋다」, 「네브」는 「주인」이란 말이다.', '', 'laugh'),
      T('그날 밤, 요셉은 종들의 숙소에 누워 낯선 하늘의 별을 바라보았습니다. 고향의 별과 같은 별이었습니다.')], () => { learn('nefer'); learn('neb'); if (G.hour() < 19) S.time = GG.Game.clockTo(S, 19.4, 0); G.go('c2_night1'); }); } } },
  c2_night1: { ch: 3, obj: '종들의 숙소 짚자리에서 자기', target: { x: -46.8, z: 50 }, check: S => S.day > (S.q.d0 || 1), enter(S) { S.q.d0 = S.q.d0 || S.day; },
    done(S, G, next) { narr([{ kick: '보디발의 집 · 둘째 날', title: '밭으로', t: '아메니가 요셉을 깨웠습니다. "오늘은 밭에 나가자. 아마를 거두는 날이다. 세마포를 짜는 그 아마 말이다."', ref: '' }], next); }, next: 'c2_field' },
  c2_field: { ch: 3, obj: '보디발의 밭 일', list: (S, G) => [{ t: `밭의 아마 거두기 (${Math.min(8, S.q.flax || 0)}/8)`, ok: (S.q.flax || 0) >= 8 }, { t: '진흙에 빠진 송아지 구하기', ok: qd(S, 'calf') }],
    target: S => (S.q.flax || 0) < 8 ? 'field:pflax' : !qd(S, 'calf') ? 'spot:canal' : null, check: S => (S.q.flax || 0) >= 8 && qd(S, 'calf'),
    enter(S, G, re) { if (!re) { setTimeout(() => G.UI.hint('익은 아마를 바라보고 A를 누르세요 · 누르고 있으면 계속 거둬요', 'flax', 'tap'), 600); } },
    done(S, G, next) { G.UI.hint(null); say([N('gardener', '요셉, 이상하지 않아? 네가 거둔 아마는 다른 사람 것보다 두 배나 묵직해.'), N('ameni', '…그러고 보니 네가 손대는 일마다 잘되는구나. 우물물도 맑아지고, 소들도 살이 오르고.'),
      T('여호와께서 요셉과 함께하시므로 그가 형통한 자가 되어', '창세기 39:2')], next); }, next: 'c2_store' },
  c2_store: { ch: 3, obj: '서기관 이피를 도와 곳간 장부 맞추기', list: S => [{ t: `곳간 선반 살피기 (${Object.keys(S.q.shelf || {}).length}/4)`, ok: Object.keys(S.q.shelf || {}).length >= 4 }, { t: '서기관에게 틀린 곳 알려 주기', ok: qd(S, 'ledger') }],
    enter(S, G, re) { if (!re) say([N('scribe', '곳간 장부가 자꾸 어긋나는구먼… 눈이 침침해서 원…', '', 'fear'), T('곳간 선반을 하나하나 세어 서기관 이피를 도와 드려요.')]); },
    target: S => Object.keys(S.q.shelf || {}).length < 4 ? 'spot:store' : 'npc:scribe', check: S => qd(S, 'ledger'),
    talk: { scribe(S, G) { if (S.q.ledger) return false; if (Object.keys(S.q.shelf || {}).length < 4) { say([N('scribe', '곳간의 선반 네 개를 먼저 세어 보게. 포도주, 기름, 곡식, 무화과.')]); return; } ledgerPuzzle(S, G); } },
    done(S, G, next) { cinPotiphar(S, G, next); }, next: 'c2_manage' }, /* v18.72 (Potiphar's feast was not in Scripture: 39:3 → 39:4) */
  c2_banquet: { ch: 3, obj: S => `잔치에서 보디발과 손님들 섬기기 (${Math.min(4, S.q.served || 0)}/4)`, list: S => [{ t: S.q.want ? `주문: 「${({ guest1: '이르프!', guest2: '무… 무 네페르.', guest3: '타! 타 네페르!', potiphar: '데브.' })[S.q.want]}」 (${S.q.want === 'potiphar' ? '보디발' : '손님'})` : '…', ok: false }, { t: S.q.carry ? `들고 있는 것 · ${S.q.carry}` : '시중 상에서 알맞은 음식을 들고 가기', ok: false }],
    enter(S, G, re) { banquetStart(S, G, re); }, target: S => S.q.carry ? 'npc:' + (S.q.want || 'guest1') : { x: -39.2, z: 43.1 }, need: ['potiphar', 'wife', 'guest1', 'guest2', 'guest3', 'ameni'], check: S => (S.q.served || 0) >= 4,
    done(S, G, next) { banquetEnd(S, G, next); }, next: 'c2_manage' },
  c2_manage: { ch: 3, obj: '가정 총무의 일', list: S => [{ t: '일꾼들에게 맞는 일 맡기기', ok: qd(S, 'assign') }, { t: '요리사와 정원지기의 다툼 풀기', ok: qd(S, 'quarrel') }, { t: '청지기 네브와 이야기하기', ok: qd(S, 'nebOk') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:4', title: '가정 총무', t: '보디발이 요셉을 가정 총무로 삼고 자기의 소유를 다 그의 손에 위탁했습니다. 이제 집안의 모든 일꾼과 곳간과 밭이 요셉의 손에 있습니다.', ref: '창세기 39:4' }]); },
    target: S => !qd(S, 'assign') ? { x: -30, z: 44.9 } : !qd(S, 'quarrel') ? 'npc:cook' : !qd(S, 'nebOk') ? 'npc:neb' : null, check: S => qd(S, 'assign') && qd(S, 'quarrel') && qd(S, 'nebOk'),
    talk: { cook(S, G) { if (S.q.quarrel) return false; quarrel(S, G); }, gardener(S, G) { if (S.q.quarrel) return false; quarrel(S, G); },
      neb(S, G) { if (S.q.nebOk) return false; say([N('neb', '…히브리 종이 하루아침에 총무라니. 이 집에서 서른 해를 일한 나는 무엇이란 말이오.', '', 'cold'),
        { n: '요셉', t: '네브에게 무엇이라 말할까?', choices: [
          { t: '"네브, 대문과 손님 맞는 일은 이 집에서 당신이 제일 잘해요. 그 일을 맡아 주세요. 저는 당신에게 배울 게 많아요."', ok: true },
          { t: '"이제 내가 총무요. 내 말을 따르시오."', ok: false, fb: '요셉은 말을 삼켰습니다. 높아진 자리일수록 낮은 마음이 필요했습니다.' },
          { t: '"주인님께 말씀드려 당신을 내보내게 하겠소."', ok: false, fb: '그것은 요셉이 원하는 길이 아니었습니다. 형들에게 미움받던 아픔을, 요셉은 누구보다 잘 알았습니다.' }] },
        N('neb', '……', ''), N('neb', (S.q.headUp === undefined ? '…' : S.q.headUp ? '이 집에 처음 끌려온 날에도 고개를 들고 제 이름을 말하더니… ' : '이 집에 처음 온 날에는 고개도 못 들던 아이가… ') + '당신은 참 이상한 사람이오, 총무. 좋소. 대문은 내게 맡기시오.', '', 'tender') /* v18.48 the choice before Potiphar at the market comes back */], () => tick(S, 'nebOk')); } },
    done(S, G, next) { cinBless(S, G, next); }, next: 'c2_tempt1' },
  c2_tempt1: { ch: 3, obj: '안주인이 연못가로 부른다', target: 'npc:wife',
    talk: { wife(S, G) { say([T('그 후에 그 주인의 처가 요셉에게 눈짓하다가 동침하기를 청하니…', '창세기 39:7'),
      { n: '요셉', t: '요셉은 어떻게 대답했을까?', choices: [
        { t: '"나의 주인이 가중 제반 소유를 다 내 손에 위임하였으니… 금한 것은 당신뿐이니, 당신은 자기 아내임이라. 그런즉 내가 어찌 이 큰 악을 행하여 하나님께 득죄하리이까."', ok: true, ref: '창세기 39:8–9' },
        { t: '"…(잠시 망설인다)"', ok: false, fb: '그 순간 요셉의 마음에 아버지의 얼굴과, 구덩이 속에서 불렀던 하나님의 이름이 떠올랐습니다. 무엇이 옳은지 요셉은 알고 있었습니다.' },
        { t: '"주인님께만 들키지 않으면 되겠지요."', ok: false, fb: '사람은 속일 수 있어도, 모든 것을 보시는 하나님은 속일 수 없습니다. 요셉은 그것을 알고 있었습니다.' }] },
      J('주인이 가중 제반 소유를 간섭지 아니하고 다 내 손에 위임하였으니, 이 집에는 나보다 큰이가 없으며, 주인이 아무 것도 내게 금하지 아니하였어도 금한 것은 당신뿐이니 당신은 자기 아내임이라.', '창세기 39:8–9'),
      J('그런즉 내가 어찌 이 큰 악을 행하여 하나님께 득죄하리이까.', '창세기 39:9', 'solemn'),
], () => { S.time = GG.Game.clockTo(S, 19.5, 0); G.go('c2_tempt2'); }); } } },
  c2_tempt2: { ch: 3, obj: '날마다 · 사람들 곁에서 일하기', list: S => [{ t: `일꾼들과 함께 밭에서 아마 거두기 (${Math.min(4, S.q.flax2 || 0)}/4)`, ok: (S.q.flax2 || 0) >= 4 }, { t: '아메니와 이야기하기', ok: qd(S, 'ameniWarn') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:10', title: '날마다', t: '여인이 날마다 요셉에게 청하였으나, 요셉이 듣지 아니하여 동침하지 아니할 뿐더러 함께 있지도 아니하니라.', ref: '창세기 39:10' }], () => { G.newDay('날마다 같은 유혹이 찾아왔어요'); }); },
    target: S => (S.q.flax2 || 0) < 4 ? 'field:pflax' : 'npc:ameni', check: S => (S.q.flax2 || 0) >= 4 && qd(S, 'ameniWarn'),
    talk: { ameni(S, G) { if (S.q.ameniWarn) return false; say([N('ameni', '얘야… 안주인의 눈빛이 심상치 않다. 사람들은 다 눈치채고 있어.', '', 'whisper'), J('알아요, 아메니. 그래서 늘 사람들이 있는 곳에서 일해요. 혼자 안채에 들어가지 않아요.'),
      N('ameni', '지혜롭구나. 하지만 사나운 바람은 문을 꼭 닫아도 틈으로 들어오는 법이란다. 네 하나님께서 너를 지켜 주시기를.', '', 'tender')], () => tick(S, 'ameniWarn')); } },
    done(S, G, next) { next(); }, next: 'c2_tempt3' },
  c2_tempt3: { ch: 3, obj: '집 안에서 맡은 일 하기 (장부방)', target: { x: -22.5, z: 41.6 }, need: ['wife'],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:11', title: '그날', t: '그러할 때에 요셉이 시무하러 그 집에 들어갔더니, 그 집 사람은 하나도 거기 없었더라.', ref: '창세기 39:11', e: 'solemn' }], () => { S.q.empty = 1; S.time = GG.Game.clockTo(S, 15, 0); }); else S.q.empty = 1; } },
  c2_flee: { ch: 3, obj: S => RT.chase && RT.chase.held > 0 ? '옷을 뿌리치세요!' : RT.chase && RT.chase.left > 0 ? `도망쳐요! 대문 밖으로 · ${RT.chase.left}초` : '도망쳐요! 대문 밖으로', target: { x: -28, z: 74 }, need: ['wife'], enter(S, G) { S.q.flee = 1; }, check: (S, G) => G.P.z > 71.5 && Math.abs(G.P.x + 28) < 9,
    done(S, G, next) { G.UI.hint(null); S.q.flee = 0; cinAccuse(S, G, next); }, next: 'c3_cell' },
  // =============================================================== 3장 · 왕의 옥
  c3_cell: { ch: 4, obj: '창으로 드는 달빛 아래에서 기도하기', target: { x: -18.4, z: -8.2 }, enter(S, G, re) { S.q.cellLock = 1; if (!re) setTimeout(() => G.UI.hint('창으로 드는 달빛 아래로 가서 A 버튼으로 기도해요', 'chain', 'move'), 1200); } },
  c3_keeper: { ch: 4, obj: '간수장이 맡긴 일', list: S => [{ t: `감방의 죄수들에게 물 나눠 주기 (${Object.keys(S.q.gave || {}).length}/4)`, ok: Object.keys(S.q.gave || {}).length >= 4 }, { t: '앓는 늙은 죄수 돌보기', ok: qd(S, 'oldCare') }],
    enter(S, G, re) { S.q.cellLock = 0; if (!re) say([N('keeper', '일어나라, 히브리 종. 여기서는 일하지 않으면 먹지도 못한다.', '', 'cold'), N('keeper', '저 대야에서 물을 길어 감방마다 나눠 줘라. 그리고 구석의 늙은이가 사흘째 앓고 있으니 좀 살펴보고.', '', 'cold')], () => { if (!G.tool('jar')) G.giveTool('jar'); }); },
    target: S => Object.keys(S.q.gave || {}).length < 4 ? (S.water > 0 ? { x: -33, z: -4.6 } : 'spot:basin') : 'npc:oldP', check: S => Object.keys(S.q.gave || {}).length >= 4 && qd(S, 'oldCare'),
    talk: { oldP(S, G) { if (S.q.oldCare) return false; if (Object.keys(S.q.gave || {}).length < 4) { say([N('oldP', '…물… 물을…', '', 'weary')]); return; }
      say([N('oldP', '…누구냐… 간수냐…?', '', 'weary'), J('물을 가져왔어요, 할아버지. 그리고 제 몫의 떡도요. 조금이라도 드세요.', '', 'tender'), N('oldP', '네 몫을…? 여기서 남에게 떡을 주는 사람은 처음 보는구나…', '', 'weary'),
        T('요셉은 늙은 죄수의 이마를 젖은 천으로 닦아 주고, 밤새 곁을 지켰습니다.')], () => tick(S, 'oldCare')); } },
    done(S, G, next) { say([N('keeper', '…너는 이상한 녀석이로구나. 차꼬를 차고도 남을 먼저 챙기다니.', '', 'cold'), N('keeper', '그 차꼬, 풀어 주마. 대신 내일부터는 옥 안의 일을 네가 도맡아라.'),
      T('여호와께서 요셉과 함께하시고 그에게 인자를 더하사, 전옥에게 은혜를 받게 하시매…', '창세기 39:21')], () => { G.sfx('chain'); G.setOutfit('prisoner'); G.give('bread', 1, true); next(); }); }, next: 'c3_charge' },
  c3_charge: { ch: 4, obj: '옥중의 일을 맡다', list: S => [{ t: `감방마다 떡 나눠 주기 (${Object.keys(S.q.fed || {}).length}/4)`, ok: Object.keys(S.q.fed || {}).length >= 4 }, { t: '두 죄수의 싸움 말리기', ok: qd(S, 'fight') }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 39:22', title: '옥중의 총무', t: '전옥이 옥중 죄수를 다 요셉의 손에 맡기므로, 그 제반 사무를 요셉이 처리하고…', ref: '창세기 39:22' }], () => G.UI.toast('옥 마당 탁자에 오늘 나눠 줄 떡 바구니가 놓여 있어요')); },
    target: S => Object.keys(S.q.fed || {}).length < 4 ? (Gm().P.carry === 'basket' ? { x: -33, z: -4.6 } : { x: -33.7, z: 7 }) : 'npc:prisA', check: S => Object.keys(S.q.fed || {}).length >= 4 && qd(S, 'fight'),
    talk: { prisA(S, G) { if (S.q.fight || Object.keys(S.q.fed || {}).length < 4) return false; fight(S, G); }, prisB(S, G) { if (S.q.fight || Object.keys(S.q.fed || {}).length < 4) return false; fight(S, G); } },
    done(S, G, next) { narr([{ kick: '창세기 39:23', title: '형통하게 하셨더라', t: '전옥은 그의 손에 맡긴 것을 무엇이든지 돌아보지 아니하였으니, 이는 여호와께서 요셉과 함께하심이라. 여호와께서 그의 범사에 형통케 하셨더라.', ref: '창세기 39:23' }], next); }, next: 'c3_officers' },
  c3_officers: { ch: 4, obj: '새로 갇힌 두 관원장 섬기기', list: S => [{ t: '술 맡은 관원장에게 물 드리기', ok: qd(S, 'cupW') }, { t: '떡 굽는 관원장에게 떡 드리기', ok: qd(S, 'bakeW') }],
    enter(S, G, re) { if (!re) cinOfficers(S, G); }, target: S => !qd(S, 'cupW') ? 'npc:cupbearer' : 'npc:baker', check: S => qd(S, 'cupW') && qd(S, 'bakeW'),
    talk: { cupbearer(S, G) { if (S.q.cupW) return false; say([J('나리, 물을 드십시오.'), N('cupbearer', '…바로의 잔을 받들던 내가 옥에서 흙 묻은 잔으로 물을 마시는구나. 그래도 고맙다, 히브리 청년.', '', 'sad'), N('cupbearer', '그런데 젊은이, 자네는 어찌하여 이 옥에 들어왔는가?', '', 'tender'),
        { n: '요셉', t: '요셉은 무엇이라 대답했을까? (어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
          { t: '"저는 히브리 땅에서 끌려온 자요, 여기서도 옥에 갇힐 일은 하지 않았습니다."', then: () => { GG.Deeds && GG.Deeds.char('protest'); setTimeout(() => say([N('cupbearer', '그렇군… 억울한 사람이 어디 자네 하나뿐이겠는가. 자네 마음은 알겠네.', '', 'sad')], () => tick(S, 'cupW')), 30); } },
          { t: '"저는 죄가 없으나, 하나님께서 보고 계심을 믿습니다."', then: () => { GG.Deeds && GG.Deeds.char('trust'); setTimeout(() => say([N('cupbearer', '…원망이 없구먼, 이상한 청년이야. 그런데 그 말이 이 어두운 옥에서는 이상하게 위로가 되는군.', '', 'tender')], () => tick(S, 'cupW')), 30); } }] }]); },
      baker(S, G) { if (S.q.bakeW) return false; say([J('나리, 떡을 드십시오.'), N('baker', '흥, 이걸 떡이라고… 왕궁에서는 이런 건 상에 올리지도 않는다.', '', 'cold'), N('baker', '…그래도 배는 고프구나. 고맙네.', '', 'weary')], () => tick(S, 'bakeW')); } },
    done(S, G, next) { narr([{ kick: '창세기 40:4', title: '여러 날', t: '그들이 갇힌 지 여러 날이라. 그리고 어느 날 밤, 두 사람이 한꺼번에 꿈을 꾸었습니다.', ref: '창세기 40:4–5' }], () => { G.newDay(''); next(); }); }, next: 'c3_dreams' },
  c3_dreams: { ch: 4, obj: S => S.q.dreamGo ? (GG.DW && GG.DW.on() ? '꿈속의 빛나는 곳으로 걸어가기' : '「꿈의 세계」 단추를 눌러 꿈속으로 들어가기') : !qd(S, 'cupDone') ? '근심하는 술 맡은 관원장에게 말 걸기' : '떡 굽는 관원장의 꿈 듣기', target: S => S.q.dreamGo ? (GG.DW && GG.DW.on() ? { x: DREAM.x, z: DREAM.z } : null) : !qd(S, 'cupDone') ? 'npc:cupbearer' : 'npc:baker', need: ['cupbearer', 'baker'], check: S => qd(S, 'bakeDone'),
    talk: { cupbearer(S, G) { if (S.q.cupDone || S.q.dreamGo) return false; if (S.q.cupSeen) { cupTell(S, G); return; } cupDream(S, G); }, baker(S, G) { if (!S.q.cupDone || S.q.bakeDone || S.q.dreamGo) return false; if (S.q.bakeSeen) { bakerTell(S, G); return; } bakerDream(S, G); } }, /* v18.57 a dream already seen is not dreamt again (if the game stopped on the way out of the dream) */
    done(S, G, next) { cinBirthday(S, G, next); }, next: 'c3_wait' },
  c3_wait: { ch: 4, obj: S => WAIT[S.q.wait || 0] ? WAIT[S.q.wait || 0].obj : '', list: S => [{ t: `잊힌 시간 (${Math.min(4, S.q.wait || 0)}/4)`, ok: false }].concat(WAIT[S.q.wait || 0] && WAIT[S.q.wait || 0].list ? WAIT[S.q.wait || 0].list(S) : []),
    enter(S, G, re) { waitSetup(S, G, re); }, target: S => WAIT[S.q.wait || 0] ? WAIT[S.q.wait || 0].target(S) : null },
  // =============================================================== 4장 · 바로의 꿈
  c4_shave: { ch: 5, obj: '대야에서 수염을 깎고 옷 갈아입기', target: 'spot:basin',
    enter(S, G, re) { if (!re) say([N('messenger', '히브리 사람 요셉이 누구냐! 바로께서 너를 부르신다! 서둘러라!', '', 'urgent'), N('keeper', '…요셉. 어서 가거라. 네가 그토록 기다리던 날이 왔구나.', '', 'tender'),
      T('바로 앞에 나아가려면 깨끗이 씻고 단장해야 해요. 옥 마당의 대야로 가세요.')]); } },
  c4_court: { ch: 5, obj: '궁 안으로 들어가 바로 앞에 서기', target: 'spot:court', check: (S, G) => G.dist(SPOTS.court[0], SPOTS.court[1]) < 3.4,
    done(S, G, next) { courtIntro(S, G, next); }, next: 'c4_vision' },
  c4_vision: { ch: 5, obj: S => `바로의 꿈속 장면 살피기 (${Object.keys(S.q.seen || {}).length}/5)`, enter(S, G, re) { visionEnter(S, G, re); },
    target: S => { const k = VISION.find(v => !(S.q.seen || {})[v.id]); return k ? { x: k.x, z: k.z } : null; } },
  c4_answer: { ch: 5, obj: '바로께 꿈을 해석해 드리기', enter(S, G, re) { answerScene(S, G); } },
  // =============================================================== 5장 · 일곱 해 풍년
  c5_patrol: { ch: 6, obj: '애굽 온 땅을 순찰하기', list: S => [{ t: '수레지기 호리에게 버금 수레 받기', ok: !S.q.needCart }, { t: '버금 수레 타기', ok: qd(S, 'rode') }].concat(S.q.cartTut ? [{ t: '전진을 두 번 눌러 보통 걸음으로 가기', ok: qd(S, 'tG2') }, { t: '가다가 「정지」로 수레 세우기', ok: qd(S, 'tStop') }, { t: '서기 카이를 옆자리에 태우기', ok: qd(S, 'tPax') }] : []).concat([{ t: '성읍 감독관 만나기', ok: qd(S, 'metC') }, { t: '서쪽 마을 촌장 만나기 · 곡식 표본 전하기 (북쪽 나루 건너)', ok: qd(S, 'metW') }].concat(S.q.sampleAsk && !qd(S, 'metW') ? [{ t: S.q.sampleAsk === 2 ? '맡겨 둔 곡식 표본 가방에 넣기' : '짐칸에서 곡식 표본 꺼내기', ok: GG.Game.inv('qSample') > 0 }] : []).concat([{ t: '남쪽 마을 촌장 만나기 (남쪽 나루 건너)', ok: qd(S, 'metS') }])),
    enter(S, G, re) { if (!re) { narr([{ kick: '창세기 41:46', title: '순찰', t: '요셉이 바로 앞에서 나가 애굽 온 땅을 순찰하였습니다. 성문 밖에서 수레지기가 바로의 버금 수레를 들고 기다려요.', ref: '창세기 41:46' }], () => { GG.UI.featCard('chariot', { kick: '새로 열린 기능', n: '버금 수레', ic: 'donkey', d: '성문 밖 수레지기 호리에게 가면 수레를 내어 줘요. 탄 뒤에는 전진 한 번 걷기 · 두 번 보통 · 세 번부터 달리기. 왼쪽 「수레 부르기」로 언제든 불러요.' }); }); } },
    target: S => S.q.needCart ? 'npc:cartMan' : !qd(S, 'rode') && GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos() ? GG.Cart.rearPos() /* v18.41 next: climb on the wagon — the arrow shows where it stands */ : S.q.cartTut && qd(S, 'tStop') && !qd(S, 'tPax') ? 'npc:kaiClerk' : !qd(S, 'metC') ? 'npc:overseerC' : !qd(S, 'metW') ? (S.q.sampleAsk === 1 && GG.Game.inv('qSample') < 1 && GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos() ? GG.Cart.rearPos() : 'npc:overseerW') : !qd(S, 'metS') ? 'npc:overseerS' : null, check: S => qd(S, 'rode') && qd(S, 'metC') && qd(S, 'metW') && qd(S, 'metS'),
    talk: { cartMan(S, G) { if (!S.q.needCart) return false; say([N('cartMan', '총리님! 바로께서 내리신 버금 수레입니다. 애굽에서 바로의 수레 다음으로 높은 수레지요.', '창세기 41:43'), N('cartMan', '말은 제가 길들여 놓았습니다. 곡식 표본 자루도 짐칸에 실어 두었으니 서쪽 촌장에게 전해 주십시오.'), { n: '요셉', t: '수레 모는 법을 배울까요?', choices: [
        { t: '"네, 가르쳐 주시오."', then: () => { S.q.cartTut = 1; setTimeout(() => say([N('cartMan', '수레 뒤에서 A키로 오르십시오. 왼쪽 스틱은 핸들입니다. 전진을 한 번 누르면 걷고, 두 번 누르면 보통 걸음이고, 세 번부터는 달리지만 말이 지칩니다.'), N('cartMan', '「정지」로 세우고, 사람 곁에 서서 점프 자리의 「태우기」로 옆자리에 태우실 수 있어요. 서기 카이가 성읍 감독관에게 갈 일이 있으니 태워 주십시오.')]), 30); } },
        { t: '"배우지 않아도 되오. 알아서 가겠소."', then: () => { S.q.cartTut = 0; setTimeout(() => say([N('cartMan', '그러시면 수레에 오르신 뒤 미니맵 아래 「자동 이동」을 누르십시오. 말이 길을 따라 목적지까지 갑니다. 속도는 전진과 정지로 조절하세요.')]), 30); } }] }], () => { S.q.needCart = 0; S.cartStore = S.cartStore || {}; S.cartStore.qSample = 1; /* v18.40 a quest item: 곡식 표본 자루 rides in the cargo box */ G.UI.quest(); }); },
      overseerC(S, G) { if (S.q.metC) return false; say([N('overseerC', '총리님! 바로께서 명하신 대로 성읍 동쪽에 곳간 터를 닦아 두었습니다.'), J('수고했소. 풍년 일곱 해 동안 거둔 곡식을 각 성에 쌓을 것이오. 이 성읍 곳간이 그 첫 곳간이 될 것이오.'), N('overseerC', '벽돌은 벽돌 굽는 우니의 가마에서 가져오시면 됩니다.')].concat(qd(S, 'tPax') ? [N('kaiClerk', '감독관님, 곳간에 들어오는 곡식은 제가 날마다 장부에 적겠습니다.'), N('overseerC', '서기 카이까지 오셨군요! 장부가 있으면 한 톨도 새지 않겠습니다.', '', 'happy'), N('kaiClerk', '총리님, 여기까지 태워 주셔서 감사합니다. 걸어왔으면 해가 졌을 거예요. 장부는 이제 제게 맡겨 주십시오.', '', 'happy'), J('잘 부탁하오, 카이. 한 톨도 헛되이 하지 맙시다.')] : []), () => { const pax = qd(S, 'tPax'); tick(S, 'metC'); if (pax && GG.Cart && GG.Cart.kaiOff) GG.Cart.kaiOff(); }); }, /* v18.58 he thanks Joseph, steps down and stays to keep the ledger (he no longer just vanishes) */ /* v18.42 Kai rode along: the overseer greets him */
      overseerW(S, G) { if (S.q.metW) return false;
        /* v18.40 the sample is in the cart's cargo box: the overseer asks for it, Joseph fetches it (짐칸 → 가방) and hands it over himself */
        const inBag = G.inv('qSample') > 0, inCart = !!(S.cartStore && S.cartStore.qSample);
        const inBox = !inBag && !inCart && Object.keys(S).some(k => (k === 'store' || /^horseBox_/.test(k)) && S[k] && S[k].qSample > 0); /* v18.42 left in a chest or a horse's box: Joseph must bring it */
        if (inBox) { say([N('overseerW', '총리님, 바로께서 곡식 표본을 보내신다 들었습니다. 우리 마을 곡식과 견주어 보고 싶은데요.'), J('아, 표본 자루를 다른 곳에 맡겨 두었소. 가져와서 다시 오리다.')], () => { S.q.sampleAsk = 2; G.UI.quest(); }); return; }
        if (!inBag && inCart) { say([N('overseerW', '총리님, 바로께서 곡식 표본을 보내신다 들었습니다. 우리 마을 곡식과 견주어 보고 싶은데요.'), J('아, 수레 짐칸에 실어 두었소. 곧 꺼내 오리다.')], () => { S.q.sampleAsk = 1; G.UI.quest(); setTimeout(() => { if (GG.UI.help) GG.UI.help('cartBox', '짐칸에서 꺼내기', '수레 뒤에 서면 뜨는 「짐칸」 단추를 누르거나, 수레 위에서 「짐칸」 단추를 눌러요 · 곡식 표본 자루를 눌러 가방에 넣고 촌장에게 다시 말을 걸어요'); }, 300); }); return; }
        say([N('overseerW', '오분의 일이라니요, 총리님! 풍년에 곡식을 왜 쌓아 둡니까? 지금 팔면 다 금이 될 텐데!', '', 'angry'),
        { n: '요셉', t: '촌장을 어떻게 설득할까?', choices: [{ t: '"일곱 해 뒤 흉년이 오면 금은 먹을 수 없소. 지금 쌓은 곡식이 당신의 아이들을 살릴 것이오."', ok: true },
          { t: '"바로의 명령이오! 따르지 않으면 벌을 받을 것이오."', ok: false, fb: '두려움으로 움직인 마음은 오래가지 않아요. 요셉은 다시 차분히 설명했습니다.' }] },
        N('overseerW', '…아이들을. 제 손녀가 이제 막 걸음마를 뗐습니다. 알겠습니다, 총리님. 서쪽 마을은 오분의 일을 바치겠습니다.', '', 'tender'), T('요셉은 가방에서 곡식 표본 자루를 꺼내 촌장에게 건넸습니다.')], () => { if (G.inv('qSample') > 0) G.take('qSample', 1); else if (S.cartStore && S.cartStore.qSample) delete S.cartStore.qSample; else if (S.cartStore && S.cartStore.grain) { S.cartStore.grain--; if (!S.cartStore.grain) delete S.cartStore.grain; } S.q.sampleAsk = 0; GG.UI.pop && GG.UI.pop('곡식 표본을 전했어요', '퀘스트 물건', 'sack'); tick(S, 'metW'); }); },
      overseerS(S, G) { if (S.q.metS) return false; say([N('overseerS', '총리님! 저희 마을은 기꺼이 따르겠습니다. 다만 곡식 창고가 늘 강물에 잠겨서…', '', 'happy'), N('overseerS', '나일 강이 넘치는 철이면 마을 창고까지 물이 들어와 곡식이 썩곤 합니다.'),
        { n: '요셉', t: '남쪽 마을 곳간은 어디에 지을까?', choices: [{ t: '물이 닿지 않는 마을 서쪽 언덕 위 단단한 땅', ok: true }, { t: '물을 길어 오기 쉬운 강가 낮은 땅', ok: false, fb: '강가 낮은 땅은 범람하면 잠겨요. 곳간은 높고 마른 곳이어야 해요.' }, { t: '사람이 많은 마을 한가운데 장터', ok: false, fb: '장터 땅은 낮고 좁아요. 일곱 해 동안 쌓을 곡식에는 넓고 높은 땅이 필요해요.' }] },
        N('overseerS', '언덕 위라! 그곳이라면 물이 닿지 않겠군요. 바로께서 「하나님의 신이 감동한 사람」이라 하시더니, 과연 그렇습니다!', '', 'happy')], () => tick(S, 'metS')); } },
    done(S, G, next) { narr([{ kick: '창세기 41:47–48', title: '풍년 첫해', t: '일곱 해 풍년에 토지 소출이 심히 많았습니다. 요셉은 각 성 주위의 밭의 곡물을 그 성 중에 쌓아 두기로 했습니다. 먼저 곳간 셋을 지어야 해요.', ref: '창세기 41:47–48' }], next); }, next: 'c5_year1' },
  c5_year1: { ch: 6, obj: '풍년 1년 · 곳간 짓기', list: S => [{ t: '벽돌 굽는 우니에게 벽돌 받기', ok: qd(S, 'bricks') }, { t: '성읍 곳간 짓기', ok: !!S.built.granA }, { t: '서쪽 마을 곳간 짓기', ok: !!S.built.granB }, { t: '남쪽 마을 곳간 짓기', ok: !!S.built.granC }],
    target: S => !qd(S, 'bricks') ? 'npc:brick' : !S.built.granA ? 'site:granA' : !S.built.granB ? 'site:granB' : !S.built.granC ? 'site:granC' : null, check: S => S.built.granA && S.built.granB && S.built.granC,
    talk: { brick(S, G) { if (S.q.bricks) return false; say([N('brick', '총리님! 가마마다 벽돌이 산더미입니다. 진흙에 짚을 섞어 볕에 말린 튼튼한 벽돌이지요.'), N('brick', '곳간 셋에 쓸 만큼 수레에 실어 두었습니다. 터에 가서 「짓기」만 하시면 일꾼들이 쌓을 겁니다.')], () => { G.give('brick', 72); G.give('wood', 24); tick(S, 'bricks'); }); } },
    done(S, G, next) { narr([{ kick: '풍년 1년', title: '곳간 셋', t: '성읍과 서쪽 마을과 남쪽 마을에 곳간이 섰습니다. 그해 거둘 때에, 수레마다 곡식이 넘치도록 실려 들어왔습니다.', ref: '창세기 41:48' }], next); }, next: 'c5_manasseh' },
  c5_manasseh: { ch: 6, obj: '총리의 집으로 · 아스낫이 기다린다', target: 'npc:asenath', talk: { asenath(S, G) { birthScene(S, G, 'manasseh'); } } },
  c5_year2: { ch: 6, obj: '풍년 2년 · 왕실 밭과 곳간', list: S => [{ t: `왕실 밭의 밀 거두기 (${Math.min(12, S.q.wheat || 0)}/12)`, ok: (S.q.wheat || 0) >= 12 }, { t: '서기관에게 곳간 기록 듣기', ok: qd(S, 'record') }],
    enter(S, G, re) { if (!re) { if (!G.tool('sickle')) G.giveTool('sickle'); narr([{ kick: '풍년 2년', title: '왕실 밭', t: '바로의 궁 북쪽 왕실 밭에 밀이 누렇게 익었습니다. 총리가 몸소 낫을 들자 일꾼들이 놀라워했습니다.', ref: '' }]); } },
    target: S => (S.q.wheat || 0) < 12 ? 'field:royal' : 'npc:scribeR', check: S => (S.q.wheat || 0) >= 12 && qd(S, 'record'),
    talk: { scribeR(S, G) { if (S.q.record || (S.q.wheat || 0) < 12) return false; say([N('scribeR', '총리님, 곳간 기록을 아룁니다. 성읍 곳간 만 이천 섬, 서쪽 곳간 구천 섬, 남쪽 곳간 칠천 섬…'), N('scribeR', '이대로라면 곳간을 더 지어야 할 것 같습니다. 백성들이 오분의 일을 바치고도 곡식이 남아돈답니다.', '', 'happy'),
      { n: '요셉', t: '요셉은 무엇이라 답했을까? (어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
        { t: '"남는 곡식은 한 톨도 헛되이 쓰지 말고, 앞날을 위해 곳간마다 가득 채우시오."', then: () => { GG.Deeds && GG.Deeds.char('prepare', 'harvest'); } },
        { t: '"곡식이 넘치는 해에도 가난한 이웃이 굶지 않는지 먼저 살피시오."', then: () => { GG.Deeds && GG.Deeds.char('share', 'harvest'); } }] }], () => tick(S, 'record')); } },
    done(S, G, next) { next(); }, next: 'c5_ephraim' },
  c5_ephraim: { ch: 6, obj: '총리의 집 · 둘째 아이', target: 'npc:asenath', talk: { asenath(S, G) { birthScene(S, G, 'ephraim'); } } },
  c5_years: { ch: 6, obj: '일곱 해 풍년', enter(S, G, re) { plentyMontage(S, G); } },
  // =============================================================== 6장 · 일곱 해 흉년
  c6_open: { ch: 7, obj: S => `곳간 문 열기 (${Object.keys(S.q.opened || {}).length}/3)`, list: S => [{ t: '성읍 곳간', ok: !!(S.q.opened || {}).A }, { t: '서쪽 마을 곳간', ok: !!(S.q.opened || {}).B }, { t: '남쪽 마을 곳간', ok: !!(S.q.opened || {}).C }],
    enter(S, G, re) { famineEnter(S, G, re); }, target: S => { const o = S.q.opened || {}; return !o.A ? 'spot:granaryA' : !o.B ? 'spot:granaryB' : !o.C ? 'spot:granaryC' : null; }, check: S => Object.keys(S.q.opened || {}).length >= 3,
    done(S, G, next) { narr([{ kick: '창세기 41:56', title: '곳간을 열다', t: '온 지면에 기근이 있으매, 요셉이 모든 창고를 열고 애굽 백성에게 팔쌔…', ref: '창세기 41:56' }], next); }, next: 'c6_sell' },
  c6_sell: { ch: 7, obj: S => `성읍 곳간 앞의 사람들에게 곡식 팔기 (${Object.keys(S.q.sold || {}).length}/6)`, target: S => { const v = BUYERS.find(b => !(S.q.sold || {})[b.id] && (!b.last || Object.keys(S.q.sold || {}).length >= 5)); return v ? 'npc:' + v.id : null; },
    check: S => Object.keys(S.q.sold || {}).length >= 6, done(S, G, next) { say([{ n: '요셉', t: '(곳간 앞 줄이 길어집니다. 먼 가나안에서도 사람들이 오겠지요. 요셉의 마음속에는 오래전 도단의 구덩이가 스칩니다. 형들이 오면 어떤 마음으로 맞을까요? 어느 쪽도 정답은 아니에요. 요셉의 마음을 골라 보세요)', choices: [
        { t: '"누가 오든 먼저 살펴 보자. 그 사람이 지금 어떤 사람인지 알고 나서 대하자."', then: () => { GG.Deeds && GG.Deeds.char('test', 'brothers'); } },
        { t: '"누가 오든 굶는 사람이면 먹이자. 나머지는 하나님께 맡기자."', then: () => { GG.Deeds && GG.Deeds.char('mercy', 'brothers'); } }] }], () => cinBrothers(S, G, next)); }, next: 'j_end' },
  j_end: { ch: 10, obj: S => { let t = '자유 여행 · 애굽과 고센 땅을 마음껏 다니기'; try { if (GG.Trail) { const m = GG.Trail.summary(); if (m.total) t += ` · 발자취 ${m.done}/${m.total}`; } } catch (e) { } return t; }, /* v18.48 something to aim at after the story */
    // v16.1: when the Bible story of this episode is done, the free journey begins — and it is said plainly that what follows is an
    // imagined 「IF」 story, not Scripture.
    enter(S, G, re) { for (const k of ['build', 'build2', 'herd2', 'ride', 'ride2', 'fish', 'hunt']) if (Gm().FEATS[k]) Gm().unlockFeat(k, true); S.flags.free = 1; S.q.born1 = S.q.born2 = 1;
      if (!re && !S.flags.freeIntro) { S.flags.freeIntro = 1; setTimeout(() => narr([
        { kick: '요셉 편 · 끝', title: '여기까지가 성경의 이야기', t: '요셉은 형들과 화해했고, 아버지 야곱과 온 집안이 고센 땅에 자리 잡았습니다. 성경의 이야기는 창세기 50장까지 이어지지만, 이 편은 여기서 막을 내립니다. "당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사…" (창 50:20)', ref: '창세기 37–47장' },
        ...(((S.flags.chars || {}).coat === 'care') ? [{ kick: '요셉의 마음', title: '조심하는 마음', t: '세겜 들판에서 낯선 이의 말을 귀담아듣고 몸을 조심하려 했던 요셉. 그 조심스러움이 먼 길 위에서 요셉을 지켜 주었는지도 몰라요.' }] : ((S.flags.chars || {}).coat === 'pride') ? [{ kick: '요셉의 마음', title: '사랑받은 마음', t: '아버지의 사랑을 자랑스럽게 입고 걸었던 요셉. 그 사랑이 훗날 가장 어두운 곳에서도 요셉을 붙들어 주었는지도 몰라요.' }] : []),
        ...(((S.flags.chars || {}).credit === 'god') ? [{ kick: '요셉의 마음', title: '돌린 영광', t: '바로 앞에서도 모든 것을 하나님께 돌렸던 요셉. 높아진 자리에서 낮은 마음을 지켰습니다.' }] : ((S.flags.chars || {}).credit === 'duty') ? [{ kick: '요셉의 마음', title: '맡은 책임', t: '맡겨진 일을 힘을 다해 해내겠다고 답했던 요셉. 하나님은 그 성실함을 쓰셔서 일곱 해의 풍년과 흉년을 지키셨습니다.' }] : []),
        ...(((S.flags.chars || {}).arrive === 'honest') ? [{ kick: '요셉의 마음', title: '솔직한 마음', t: '낯선 애굽 땅에서 아프다고 숨김없이 말했던 요셉. 아픔을 감추지 않았기에, 곁에 사람이 모일 수 있었는지도 몰라요.' }] : ((S.flags.chars || {}).arrive === 'hope') ? [{ kick: '요셉의 마음', title: '붙든 소망', t: '가장 낯선 곳에서도 하나님이 함께하신다고 말했던 요셉. 그 소망이 긴 종살이를 버티게 했는지도 몰라요.' }] : []),
        ...(((S.flags.chars || {}).brothers === 'mercy') ? [{ kick: '요셉의 마음', title: '먼저 먹인 마음', t: '형들이 올지도 모른다고 생각했을 때도, 굶는 사람은 먼저 먹이자고 했던 요셉. 그 넓은 마음이 훗날 화해의 문을 열었습니다.', ref: '' }] : []),
        ...(((S.flags.chars || {}).brothers === 'test') ? [{ kick: '요셉의 마음', title: '살펴본 마음', t: '형들을 바로 믿지 않고 먼저 지켜보았던 요셉. 그 신중함 덕분에 형들이 달라졌음을 눈으로 확인하고 눈물로 화해할 수 있었습니다.', ref: '' }] : []),
        ...(((S.flags.chars || {}).harvest === 'prepare') ? [{ kick: '요셉의 마음', title: '내다본 마음', t: '풍년에도 다가올 흉년을 잊지 않았던 요셉. 하나님이 보여 주신 앞날을 잊지 않은 마음, 그 마음을 하나님이 쓰셔서 온 땅을 살리셨습니다.' }] : ((S.flags.chars || {}).harvest === 'share') ? [{ kick: '요셉의 마음', title: '나누는 마음', t: '곡식이 남는 해에도 가난한 이웃부터 살폈던 요셉. 그 따뜻함이 사람들의 마음을 얻었습니다.' }] : []),
        ...(S.flags.char === 'trust' ? [{ kick: '요셉의 마음', title: '맡긴 마음', t: '옥에서 억울함 속에서도 하나님께 맡긴다고 했던 요셉. 그 마음이 이 긴 이야기를 끝까지 지켜 주었는지도 모릅니다.' }] : S.flags.char === 'protest' ? [{ kick: '요셉의 마음', title: '억울했던 마음', t: '옥에서 억울하다고 토해 냈던 요셉. 그렇게 솔직했기에, 그 마음도 결국 하나님 앞에서 위로를 받았는지도 모릅니다.' }] : []),
        { kick: '요셉의 고백', title: '나를 보내신 이', t: '「그런즉 나를 이리로 보낸 자는 당신들이 아니요 하나님이시라.」 모든 길 위에 하나님이 계셨습니다.', ref: '창세기 45:8' }, /* v18.42 the cards close on God's providence */
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
  { id: 'jacob', name: '야곱', look: LOOK.jacob, x: 170.6, z: 150.8, face: 0.9, show: S => before(S, 'p_night') || S.q.heb, talkR: 3.2 },
  { id: 'benjamin', name: '베냐민', look: LOOK.benjamin, scale: 0.62, x: 173.4, z: 156.6, face: 2.2, show: S => before(S, 'p_night') || S.q.heb, chat: ['형, 별 이야기 해 줘!', '나도 크면 형처럼 채색옷 입을 거야!'] },
  { id: 'leah', name: '레아', look: LOOK.leah, x: 165.2, z: 158.2, face: 0.8, sit: true, show: S => before(S, 'p_night') || S.q.heb, chat: S => S.step === 'p_wake' ? ['일어났구나, 요셉아. 아버지가 아까부터 너를 찾으시더라.', '아침 이슬이 차다. 불 곁에서 손 좀 녹이렴.'] : ['요셉아, 형들을 만나거든 어서 돌아오라고 전하렴.', '네 아버지가 너를 얼마나 아끼시는지…'] } /* v18.56 not before Jacob sends him */,
  { id: 'dinah', name: '디나', look: LOOK.dinah, x: 161.8, z: 151.6, face: 0.6, act: 'gather', show: S => before(S, 'p_night') || S.q.heb, chat: ['요셉아, 그 옷 정말 곱다! 누나도 한 번만 입어 보자.', '아버지가 또 너만 찾으셔.'] /* v18.56 Dinah is Joseph's older sister (창 30:21–24) */ },
  { id: 'hServ', name: '야곱의 종', look: LOOK.servantH, x: 188, z: 168, prop: 'staff', wander: 3, show: S => before(S, 'p_night'), chat: ['형님들은 세겜 쪽으로 양을 몰고 가신 지 꽤 되었지요.', '도련님, 길에서 들짐승 조심하십시오.'] },
  { id: 'shepBoy', name: '길가의 목동', look: KID({ top: 0xc8b890, hairStyle: 'short' }), scale: 0.72, x: 186, z: 104, prop: 'staff', wander: 3, show: S => before(S, 'p_night'), chat: ['세겜? 저 북쪽으로 쭉 가면 돼, 형.', '형, 그 옷 진짜 예쁘다! 무지개 같아!'] /* v18.56 a village boy to an older boy: 반말 */ },
  // ---- Shechem: the man in the field (창 37:15)
  { id: 'man', name: '들의 사람', look: LOOK.man, x: SPOTS.manSpot[0], z: SPOTS.manSpot[1], face: -2.6, talkR: 3.4, show: S => S.step === 'p_man' },
  // ---- the ten brothers (Dothan; Hebron in the mourning scene; Egypt at the end)
  ...BRO.map((id, i) => { const a = i / BRO.length * Math.PI * 2; return { id, name: NM[id], look: LOOK[id], x: 158 + Math.cos(a) * 3.4, z: -150 + Math.sin(a) * 3.4, face: Math.atan2(-Math.cos(a), -Math.sin(a)), sit: i % 3 !== 0, noTalk: S => !(steps[S.step] && steps[S.step].talk && steps[S.step].talk[id]) && !(S.step === 'j_end' && S.q.goshen), /* v18.21 a brother can be spoken to when the story wants it (시므온 in the prison) · v18.81 and in Goshen after the story (their requests; js/quiet.js keeps the small talk off) */
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
  { id: 'wife', name: '보디발의 아내', look: LOOK.wife, x: -20.6, z: 61.6, face: Math.PI, talkR: 3, noTalk: S => S.step === 'c2_tempt3' || S.step === 'c2_flee', show: S => between(S, 'c2_arrive', 'c2_flee') && S.step !== 'c2_tempt2', sched: S => S.step === 'c2_tempt3' ? [[0, -25, 39.2, 0.6, 'wander:0.2']] : null },
  { id: 'ameni', name: NM.ameni, look: LOOK.ameni, x: -44, z: 55.4, face: 1.6, show: S => inEgyptHouse(S) && (!S.q.empty || !!RT.alarm), chat: S => before(S, 'c2_field') ? ['엠 헤테프, 요셉. 평안히. …따라 해 보거라.', '이 집에선 해 뜨기 전에 일어나야 한단다.'] : ['네 하나님 이야기를 또 들려다오.', '애굽 말이 많이 늘었구나.', '엠 헤테프, 요셉. 평안히.'] } /* v18.56 not 「많이 늘었구나」 on his first day */,
  { id: 'neb', name: NM.neb, look: LOOK.neb, x: -25.4, z: 66.6, face: Math.PI, show: S => inEgyptHouse(S) && !S.q.empty, chat: S => S.q.nebOk ? ['대문은 내가 지키겠소, 총무.', '손님이 오시면 바로 알리리다.'] : ['…일이나 하라, 히브리 종.'] },
  { id: 'cook', name: NM.cook, look: LOOK.cook, x: -10.8, z: 43.8, face: Math.PI, act: 'gather', show: S => inEgyptHouse(S) && (!S.q.empty || !!RT.alarm), chat: ['타! 갓 구운 타가 최고지!', '오늘은 손님상에 낼 거위를 굽는다네.'] },
  { id: 'gardener', name: NM.gardener, look: LOOK.gardener, x: -18.4, z: 61.2, face: -1.6, act: 'water', show: S => inEgyptHouse(S) && (!S.q.empty || !!RT.alarm), chat: ['연꽃이 올해는 유난히 많이 피었어.', '종려나무는 발은 물에, 머리는 불에 두어야 열매를 맺지.'] },
  { id: 'cowboy', name: NM.boy, look: LOOK.cowboy, scale: 0.68, x: 8, z: 74, face: 0, wander: 3, show: S => inEgyptHouse(S) && !S.q.empty, chat: S => S.q.calf ? ['형! 송아지가 형만 졸졸 따라다녀요!', '카! 카! (소야! 소야!)'] : ['송아지 한 마리가 수로 진흙에 빠졌어요! 도와주세요!'] },
  { id: 'weaver', name: NM.weaver, look: LOOK.weaver, x: -44.2, z: 62.4, face: -1.6, act: 'gather', show: S => inEgyptHouse(S) && (!S.q.empty || !!RT.alarm), chat: ['아마 세 단이면 세마포 한 필이에요.', '마님은 세마포를 아주 곱게만 입으시죠.'] },
  { id: 'scribe', name: NM.scribe, look: LOOK.scribe, x: -22, z: 39, face: 0, sit: true, talkR: 3, show: S => inEgyptHouse(S) && !S.q.empty, sched: S => S.step === 'c2_store' ? [[0, -14, 63.2, -1.6, 'wander:0.4']] : null, chat: ['숫자는 거짓말을 하지 않지. 사람이 할 뿐.', '자네 덕분에 눈이 덜 아프구먼.'] },
  { id: 'maid', name: '여종', look: LOOK.maid, x: -30, z: 47, face: 0, show: S => between(S, 'c2_tempt2', 'c2_tempt3') && !S.q.empty, chat: ['마님 심기가 요즘 편치 않으세요.'] },
  { id: 'guest1', name: NM.guest1, look: LOOK.official, x: -31.94, z: 37.2, face: 0.736, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest2', name: NM.guest2, look: LOOK.priest, x: -32.5, z: 39.85, face: 1.993, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest3', name: NM.guest3, look: LOOK.soldierEg, x: -30.15, z: 41.2, face: 3.25, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'calf', name: '진흙에 빠진 송아지', animal: 'cow', scale: 0.55, x: SPOTS.canal[0], z: SPOTS.canal[1] + 0.6, face: 0.3, noTalk: true, noTag: true, dy: -0.35, show: S => S.step === 'c2_field' && !S.q.calf },
  // ---- the king's prison
  { id: 'keeper', name: NM.keeper, look: LOOK.keeper, x: -24, z: 6.4, face: Math.PI, show: show('c3_cell', 'c4_shave'), chat: S => S.q.cupDone ? ['요셉, 너 없이는 이 옥이 돌아가지 않는다.', '바로의 관원장들이 다 네 말대로 되었다지…'] : ['일해라. 일하지 않으면 먹지도 못한다.'] },
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
  { id: 'cupbearerC', name: NM.cupbearer, look: LOOK.cupbearer, x: -26, z: -169, face: -0.4, show: S => between(S, 'c4_court') || !!S.q.pharShow, chat: S => between(S, 'c5_patrol') ? ['요셉… 아니, 총리님. 이 년이나 잊고 있었던 나를 용서하시오.', '바로의 잔을 들 때마다 그날 옥에서의 일을 생각하오.'] : ['…자네가 그 히브리 청년이군. 이 년이나 잊고 있었네. 미안하네.', '바로 앞에서는 떨지 말게. 자네 하나님이 함께하실 걸세.'] }, /* v18.34 not 총리 before he is made one */
  ...[[-35, -139.6], [-25, -139.6], [-37.5, -160.6], [-22.5, -160.6]].map(([x, z], i) => ({ id: 'royalG' + i, name: '궁의 호위병', look: LOOK.soldierEg, x, z, face: i < 2 ? 0 : (i === 2 ? 1.57 : -1.57), prop: 'spear', noTalk: true, show: S => between(S, 'c4_court') || !!S.q.pharShow })),
  // ---- the vizier's household (ch5–6)
  { id: 'asenath', name: '아스낫', look: LOOK.asenath, x: 7.6, z: -137.4, face: 0.4, show: S => between(S, 'c5_patrol') && !S.q.finale, chat: S => [S.q.born2 ? '므낫세가 에브라임에게 걸음마를 가르쳐요. 둘 다 넘어지지만요, 후후.' : S.q.born1 ? '므낫세가 오늘 당신을 보고 웃었어요.' : '여보, 오늘도 먼 길 다녀오셨군요.', '아버지께서 온의 신전에서 당신의 지혜를 칭찬하셨어요.'] },
  { id: 'manasseh', name: '므낫세', look: LOOK.manasseh, scale: 0.5, x: 10, z: -136, face: 0, wander: 2, show: S => !!S.q.born1 && !S.q.finale, chat: ['아빠!', '아빠, 수레 태워 주세요!'] },
  { id: 'ephraim', name: '에브라임', look: LOOK.ephraim, scale: 0.42, x: 11.5, z: -136.6, face: 0, wander: 1.5, show: S => !!S.q.born2 && !S.q.finale, chat: ['(방긋 웃는다)', '아빠!'] },
  { id: 'steward2', name: NM.steward2, look: Object.assign({}, LOOK.neb, { collar: GOLD }), x: 15, z: -138.6, face: -0.6, show: S => between(S, 'c5_patrol'), chat: ['총리님, 집안일은 염려 마십시오.', '은잔은 늘 깨끗이 닦아 두었습니다.'] },
  { id: 'cartMan', name: '왕궁 수레지기 호리', look: LOOK.official, x: -23, z: -24.4, face: 1.8, talkR: 3, show: S => S.step === 'c5_patrol', chat: ['전진 두 번이면 말이 지치지 않습니다.', '말에게 곡식을 주시면 금세 기운을 차립니다.'] },
  { id: 'kaiClerk', name: '서기 카이', look: LOOK.scribe, x: -13, z: -33, face: -1.6, talkR: 2.6, show: S => S.step === 'c5_patrol' && (!S.q.metC || !!S.q.tPax), chat: S => S.q.metC ? ['총리님 덕분에 편히 왔습니다. 오늘 들어온 곡식부터 적고 있어요.', '곳간에 들어오는 곡식은 한 톨도 빠짐없이 적겠습니다.'] : ['성읍 감독관께 장부를 전해야 해요. 수레에 태워 주시면 좋겠어요.'] },
  { id: 'overseerC', name: NM.overseerC, look: LOOK.official, x: 12, z: -70, face: 1.2, show: show('c5_patrol'), chat: ['곳간 기록은 서기관이 맡고 있습니다.'] },
  { id: 'overseerW', name: NM.overseerW, look: LOOK.elder, x: -136, z: -35, face: 2.8, show: show('c5_patrol'), chat: ['손녀가 총리님 이야기를 하면 눈이 반짝인답니다.'] },
  { id: 'overseerS', name: NM.overseerS, look: Object.assign({}, LOOK.farmer, { collar: TURQ, top: LINEN, bare: false, sleeveless: true }), x: -141, z: 123, face: 0.3, show: show('c5_patrol'), chat: ['언덕 위 곳간은 물 한 방울 들지 않습니다!'] },
  { id: 'brick', name: NM.brick, look: Object.assign({}, LOOK.farmer, { bottom: 0xb07848, skin: 0x9a6038 }), x: -44, z: -116, face: 0.8, act: 'gather', show: show('c5_patrol'), chat: ['진흙 둘에 짚 하나. 그게 좋은 벽돌의 비결이지요.'] },
  { id: 'hunterE', name: '왕의 사냥꾼 세넵', look: Object.assign({}, LOOK.farmer, { skin: 0x9a6038, bottom: 0xd8c8a0, collar: TURQ }), x: 30, z: -54, face: 2.2, prop: 'bow', wander: 2, show: show('c5_patrol'), chat: ['바람을 등지고 다가가야 짐승이 눈치를 못 챕니다.', '물매는 손목이 아니라 허리로 돌리는 겁니다, 나으리.'] }, /* v18.13 gives the vizier his sling (e_hunt) */
  { id: 'patrolKeeper', name: '순찰 기록관 메네스', look: LOOK.scribe, x: 45.8, z: -6.8, face: 2.4, show: show('c5_patrol'), chat: ['총리님, 수레 순찰을 다녀오시면 걸린 시간을 이 판에 적어 드립니다.', '서쪽 곳간, 남쪽 곳간, 성읍 곳간을 돌아 이 길가로 오시면 됩니다.', '지난번 기록보다 빠르시면 금빛 표를 달아 드리지요.'] }, /* v18.14 the patrol challenge has a keeper (and a signpost) */
  { id: 'painter', name: '그림 그리는 아이 티티', look: KID({ skin: 0xa8683a, top: LINEN, long: true, fem: true, hairStyle: 'long' }), scale: 0.62, x: -35, z: -65.5, face: 2.6, wander: 1.5, show: show('c5_patrol'), chat: ['총리님, 오늘은 무엇을 보셨어요?', '나일 강은 정말 끝이 없어요?'] }, /* v18.13e photo requests (js/extras.js) */
  { id: 'scribeR', name: '왕궁 서기관', look: LOOK.scribe, x: 12, z: -58.6, face: 2.6, sit: true, show: show('c5_year1'), chat: ['곳간 기록은 오늘도 늘었습니다.'] },
  // ---- the famine: buyers at the city granary (창 41:56–57)
  { id: 'byFarmer', name: NM.farmer, look: LOOK.farmerThin, x: 10.5, z: -56, face: 2.4, show: show('c6_sell') },
  { id: 'byWoman', name: NM.woman, look: LOOK.woman, x: 13.2, z: -55, face: 2.9, show: show('c6_sell') },
  { id: 'buyElder', name: NM.elder, look: LOOK.elder, x: 16.4, z: -55.2, face: -2.9, show: show('c6_sell') },
  { id: 'bySidon', name: NM.sidon, look: LOOK.sidon, x: 19.2, z: -56.2, face: -2.5, show: show('c6_sell') },
  { id: 'byEdom', name: NM.edom, look: LOOK.edom, x: 8.4, z: -54.2, face: 2.2, show: show('c6_sell') },
  { id: 'byAmeni', name: NM.ameni, look: LOOK.ameniOld, x: 19.4, z: -53.6, /* v18.34 not inside the clerk Ipi */ face: -2.2, show: show('c6_sell') },
  { id: 'benjamin2', name: '베냐민', look: LOOK.benjaminAdult, x: 172, z: 150, face: 0, noTalk: S => !(S.step === 'j_end' && S.q.goshen), show: S => !!S.q.heb2 }, /* v18.81 in Goshen after the story he can be spoken to (his request) */
];
for (const n of npcs) if (n.id === 'jacob') n.show = S => before(S, 'p_night') || !!S.q.heb || !!S.q.heb2; /* v18.56 the family stays at home while Joseph sets out (they no longer vanish the moment he is ready) */
const BUYERS = [{ id: 'byFarmer' }, { id: 'byWoman' }, { id: 'buyElder' }, { id: 'bySidon' }, { id: 'byEdom' }, { id: 'byAmeni', last: true }];

// ------------------------------------------------------------------ villages (people going about their days)
const EGV = { farmerA: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }), farmerB: EGM({ hairStyle: 'short', skin: 0xa86a40, bottom: 0xe0d4b8, beard: 'short' }), waterA: LOOK.woman, waterB: EGF({ skin: 0xc89060, top: 0xe8dcc0, collar: 0xb3472e, collar2: 0, hairStyle: 'long' }),
  potter: EGM({ hairStyle: 'bald', skin: 0x9a6038, bottom: 0xb89a78, build: 1.1 }), weaver: LOOK.weaver, merchant: LOOK.official, elder: LOOK.elder, kidA: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  kidB: KID({ skin: 0xc08458, top: LINEN, long: true, fem: true, hairStyle: 'long' }), shep: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038, prop: 'staff' }), oldW: EGF({ skin: 0xb88050, top: 0xd8ccb0, age: 'old', hair: 0xc8c0b8, hairStyle: 'bun', collar: 0x8a6a48, collar2: 0 }) };
const FK = (id, name, role, look, home, o) => Object.assign({ id, name, role, look: EGV[look] || look, home }, o || {});
const egy = S => between(S, 'c1_market');
const villages = [
  { id: 'city', n: '왕의 도성', x: -22, z: -74, r: 26, when: egy,
    spots: { hub: [-22, -74, 3], well: [-21, -87.6, 2], market: [-22, -71, 3], fire: [-30, -80, 2], play: [-14, -80, 3.5], gate: [-24, -50, 2], work: [-40, -66, 3], shade: [-48, -110, 3] },
    homes: [[-40, -60, 0], [-12, -58, 0], [-42, -72, 0], [-6, -74, 0], [-30, -88, 0], [-12, -88, 0]], about: ['바로의 도성은 나일 강 동쪽에 있다오.', '궁 앞 오벨리스크는 해가 뜨면 금빛으로 빛나지요.'],
    folk: [FK('ct_mer', '도성 상인 세네브', 'merchant', 'merchant', 2, { work: [-27.4, -76, Math.PI / 2, 0.2], persona: '도성 장터의 상인. 흥정을 좋아하고 소식에 밝다.' }), FK('ct_wat', '물 긷는 여인 네페르', 'water', 'waterA', 1, { persona: '나일 강에서 물을 긷는 상냥한 여인.' }),
      FK('ct_pot', '토기장이 아문', 'potter', 'potter', 3, { work: [-40, -66, 0, 1], persona: '물동이와 곡식 항아리를 빚는 토기장이.' }), FK('ct_kid', '아이 케티', 'child', 'kidA', 1, { age: 'kid', persona: '네페르의 아들. 수레 구경을 좋아한다.' }),
      FK('ct_eld', '노인 이푸', 'elder', 'elder', 4, { age: 'old', persona: '도성 성문에 앉아 옛이야기를 하는 노인.' }), FK('ct_wea', '베 짜는 여인 메리트', 'weaver', 'waterB', 5, { work: [-10, -86, 0, 0.6], persona: '세마포를 짜는 솜씨 좋은 여인.' })] },
  { id: 'west', n: '서쪽 마을', x: -140, z: -40, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-140, -40, 2.5], well: [-140, -40, 3.2], market: [-136, -46, 2], fire: [-146, -44, 2], play: [-134, -36, 3], fold: [-122, -36, 2], pasture: [-118, -30, 8], field: [-118, -50, 4], work: [-118, -50, 3] },
    homes: [[-129, -36, 0], [-131, -52, 0], [-144, -55, 0], [-154, -42, 0], [-148, -27, 0], [-136, -24, 0]], about: ['서쪽 마을 사람들은 대대로 나일 강가 밭을 일구었다오.', '강을 건너려면 북쪽 나루로 가시오.'],
    folk: [FK('w_far', '농부 네헤시', 'farmer', 'farmerA', 0, { work: [-118, -50, 0, 4], persona: '서쪽 마을 농부. 말수가 적고 성실하다.' }), FK('w_wat', '여인 타-네트', 'water', 'waterB', 1, { persona: '서쪽 마을 여인. 웃음이 많다.' }), FK('w_kid', '아이 이피', 'child', 'kidB', 1, { age: 'kid', persona: '타-네트의 딸.' }), FK('w_shep', '목자 바크', 'shepherd', 'shep', 2, { persona: '마을 양을 치는 젊은이.' })] },
  { id: 'south', n: '남쪽 마을', x: -145, z: 128, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-145, 128, 2.5], well: [-145, 128, 3.2], market: [-140, 122, 2], fire: [-150, 124, 2], play: [-139, 133, 3], field: [-123, 118, 4], work: [-123, 118, 3] },
    homes: [[-134, 132, 0], [-136, 116, 0], [-149, 113, 0], [-159, 126, 0], [-153, 141, 0], [-141, 144, 0]], about: ['남쪽 마을은 강물이 넘치는 철이면 섬처럼 된다오.', '마을 서쪽 언덕은 물이 닿지 않는 높은 땅이오.'],
    folk: [FK('s_far', '농부 앙쿠', 'farmer', 'farmerB', 0, { work: [-123, 118, 0, 4], persona: '남쪽 마을 농부. 쾌활하다.' }), FK('s_old', '할머니 우세트', 'oldwoman', 'oldW', 2, { age: 'old', persona: '옛이야기를 잘하는 할머니.' }), FK('s_kid', '아이 케케', 'child', 'kidA', 3, { age: 'kid', persona: '앙쿠의 아들.' }), FK('s_pot', '토기장이 데두', 'potter', 'potter', 4, { work: [-150, 120, 0, 1], persona: '항아리를 빚는 토기장이.' })] },
];
const strangers = { max: 0, when: () => false, looks: { default: LOOK.farmer } };

// ------------------------------------------------------------------ SITES (granaries, ch5)
const GRAN = (g, M, r) => G.env.granary(g, M, r, true);
const sites = [
  { id: 'granA', n: '성읍 곳간', x: 16, z: -64, cost: { brick: 20, wood: 6 }, model: GRAN, puzzle: true, d: '각 성 주위 밭의 곡물을 그 성 중에 쌓아 두었더라 (창 41:48)', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granB', n: '서쪽 마을 곳간', x: -152, z: -20, cost: { brick: 20, wood: 6 }, model: GRAN, puzzle: true, d: '서쪽 마을의 오분의 일을 쌓을 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granC', n: '남쪽 마을 곳간', x: -160, z: 150, cost: { brick: 20, wood: 6 }, model: GRAN, puzzle: true, d: '물이 닿지 않는 언덕 위 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
];

// ------------------------------------------------------------------ SPECIALS (things to use)
const SP = (id, x, z, label, on, use, o) => Object.assign({ id, x, z, r: 2.3, label, on, use }, o || {});
const cellIds = ['prisA', 'prisB', 'oldP', 'cell4'];
const specials = [
  SP('skin', 182.2, 155.2, '물가죽 부대 챙기기', S => S.step === 'p_provision' && !S.q.skin, (S, G) => { G.give('skin', 1); pick(); G.UI.hint('잘했어요! 이번엔 모닥불 곁의 빵을 챙겨요', 'items2', 'bag'); tick(S, 'skin'); }),
  SP('bread', 178.9, 152.2, '빵과 무화과 챙기기', S => S.step === 'p_provision' && !S.q.bread, (S, G) => { G.give('bread', 2); G.give('fig', 2); pick(); G.UI.hint(null); tick(S, 'bread'); }),
  SP('restBed', SPOTS.restBed[0], SPOTS.restBed[1], '누워서 별 보기', S => S.step === 'p_night', (S, G) => cinNight(S, G), { r: 2.8 }),
  ...['clue1', 'clue2', 'clue3'].map((k, i) => SP(k, SPOTS[k][0], SPOTS[k][1], ['식은 모닥불 자리 살피기', '양 떼 발자국 살피기', '돌무더기 표시 살피기'][i], S => S.step === 'p_shechem' && !(S.q.cl || {})[k], (S, G) => clue(S, G, k, i), { r: 2.6 })),
  SP('pitShout', PIT.x, PIT.z, '형들을 부르기', S => S.step === 'c1_pit' && !S.q.shout, (S, G) => pitShout(S, G), { r: 2.6, y: 1.2 }),
  SP('pitPray', PIT.x + 0.6, PIT.z - 0.6, '무릎 꿇고 하나님께 부르짖기', S => S.step === 'c1_pit' && S.q.shout && !S.q.pitPray, (S, G) => pitPray(S, G), { r: 2.6, y: 1.0 }),
  SP('kJars', -8.6, 47.4, S => S.water >= 4 ? '부엌 항아리에 물 붓기' : '물이 부족해요 (우물에서 길어 와요)', S => S.step === 'c2_work' && !S.q.w1, (S, G) => { if (S.water < 4) { G.UI.toast('우물에서 물을 길어 오세요 (4번 부을 물)'); return; } if (G.hand() !== 'jar') { G.hold('jar'); return; } S.water -= 4; act('water', 0.8, 'jar'); G.sfx('pour'); G.UI.hud();
    say([EG('cook', '무! 무 네페르!', '물! 좋은 물이다!', 'happy'), T('「무」는 물이라는 뜻이에요. 애굽 말 하나를 배웠어요.') /* v18.73 (was Joseph's inner words) */], () => { learn('mu'); tick(S, 'w1'); }); }),
  SP('quern', SPOTS.quern[0], SPOTS.quern[1], '맷돌로 보리 갈기', S => S.step === 'c2_work' && !S.q.w2, (S, G) => { G.P.face = 0.3;
    G.UI.minigame('wrestle', { title: '맷돌 돌리기', need: 6, dur: 30, btn: '갈기', unit: '갈기', act: 'gather', /* v18.42 not 「붙잡음」, not a wrestling pose */ hint: '하얀 표시가 초록 구간에 들어올 때 「갈기」를 눌러요. 6번 맞추면 보리가 고운 가루가 돼요. 구간 한가운데에 딱 맞추면 두 번 몫이에요.' }, () => { G.sfx('grind'); { const r = GG.UI.mgLast; if (r && r.miss === 0 && GG.UI.pop) GG.UI.pop('한 번도 놓치지 않았어요', '요리사 헤누가 고개를 끄덕였어요', 'star'); } /* v18.48 */ say([EG('cook', '타! 타 네페르!', '빵! 좋은 빵이 되겠군!', 'happy'), T('「타」는 빵이라는 뜻이에요. 이 고운 가루로 내일 아침 빵을 구워요.')], () => { learn('ta'); tick(S, 'w2'); }); }); }, { r: 2.2 }),
  SP('feedOx', 9, 70, '외양간 소들에게 꼴 주기', S => S.step === 'c2_work' && !S.q.w3, (S, G) => { act('gather', 0.9); G.sfx('moo'); say([N('boy', '카! 카! 형, 「카」는 황소예요. 우리 소들은 꼴을 주면 이렇게 고개를 끄덕여요!', '', 'happy')], () => { learn('ka'); tick(S, 'w3'); }); }, { r: 3 }),
  SP('calf', SPOTS.canal[0], SPOTS.canal[1] - 0.6, '진흙에서 송아지 끌어내기', S => S.step === 'c2_field' && !S.q.calf, (S, G) => { G.P.face = 0;
    G.UI.minigame('push', { title: '진흙에 빠진 송아지', hint: 'A를 누르고 있으면 끌어당겨요. 기운이 빠지면 잠깐 놓았다가 다시!', rate: 18, btn: '꾹 눌러 당기기' }, () => { G.sfx('moo', { pitch: 1.4 }); G.FX.burst(SPOTS.canal[0], G.W().heightAt(SPOTS.canal[0], SPOTS.canal[1]) + 0.4, SPOTS.canal[1], 22, { c: [0.35, 0.28, 0.2], sp: 2, up: 2 });
      say([N('boy', '살았다! 고마워요, 히브리 형! 이 송아지는 제가 제일 아끼는 애예요!', '', 'happy')], () => tick(S, 'calf')); }); }, { r: 2.6 }),
  ...[['wine', '포도주 항아리', 14, 3.4 - 0.6, -2.6], ['oil', '기름병', 9, 3.4 - 0.6, 2.6], ['grain', '곡식 자루', 22, 0.6, -3.3 + 0.6], ['figs', '무화과 바구니', 6, 0.6, 3.3 - 0.6]].map(([k, n, c, dx, dz]) =>
    SP('sh_' + k, SPOTS.store[0] - 0.5 + dx, SPOTS.store[1] + 0.5 + dz, n + ' 세기', S => S.step === 'c2_store' && !(S.q.shelf || {})[k], (S, G) => { act('pick', 1.0); (S.q.shelf = S.q.shelf || {})[k] = c; G.UI.quest();
      say([J(`${n}… 하나, 둘, 셋… 모두 ${KNUM[c]}.`, '', 'calm')]); }, { r: 1.7, y: 1.2 })),
  SP('assign', -30, 44.9, '일꾼 명부에 일 적기', S => S.step === 'c2_manage' && !S.q.assign, (S, G) => { G.P.face = Math.PI; act('pick', 0.7); assignPuzzle(S, G); }, { r: 2.2, y: 1.4 }),
  SP('serveT', -40.1, 43.1, S => S.q.carry ? `들고 있는 것 · ${S.q.carry}` : '시중 상에서 음식 들기', S => S.step === 'c2_banquet', (S, G) => serveTable(S, G), { r: 1.9, reach: 1.2 }),
  SP('ledgerT', -22.5, 41.6, '장부 정리하기', S => S.step === 'c2_tempt3' && S.q.empty && !S.q.called, (S, G) => { act('pick', 1); S.q.called = 1; S.q.grab = 1; GG.UI.quest(); say([T('요셉은 장부를 펼쳤습니다. 집 안은 고요했습니다.')], () => { GRAB.x = G.P.x; GRAB.z = G.P.z; S.q.grabAt = [GRAB.x, GRAB.z]; cinGrab(S, G); }); }, { r: 2.2 }), /* v18.72 (the note and the chest in the inner room were not in Scripture: 39:11–12) */
  SP('potDoor', -30.5, 33.6, '안방 문', S => between(S, 'c2_arrive', 'c2_tempt3') && !(S.step === 'c2_tempt3' && S.q.called), (S, G) => { G.sfx('thud', { vol: 0.4, pitch: 1.4 }); GG.UI.toast('주인 내외의 안방이에요 · 부르시기 전엔 들어갈 수 없어요'); }, { r: 1.5, y: 1.3 }),
  SP('prayWin', -18.4, -8.2, '달빛 아래 무릎 꿇고 기도하기', S => S.step === 'c3_cell' || (S.step === 'c3_wait' && S.q.wReady), (S, G) => windowPray(S, G), { r: 1.8, y: 1.0 }),
  ...CELL.map(([x, z], i) => SP('cw' + i, x, -4.9, S => S.step === 'c3_keeper' ? (S.water > 0 ? '창살 너머로 물 건네기' : '물이 없어요 (대야에서 길어 와요)') : '창살 너머로 떡 건네기',
    S => (S.step === 'c3_keeper' && !(S.q.gave || {})[i]) || (S.step === 'c3_charge' && Gm().P.carry === 'basket' && !(S.q.fed || {})[i]), (S, G) => cellGive(S, G, i), { r: 1.9, y: 1.2 })),
  SP('breadT', -33.7, 7, '탁자의 떡 바구니 들기', S => S.step === 'c3_charge' && Gm().P.carry !== 'basket' && Object.keys(S.q.fed || {}).length < 4, (S, G) => { if (G.hand()) G.hold(null); act('pick', 0.7); setTimeout(() => { G.P.carry = 'basket'; G.P.carryArms = false; G.sfx('gather'); G.UI.toast('떡 바구니를 머리에 이었다 · 감방마다 나눠 주세요'); G.UI.quest(); }, 450); }, { r: 2, y: 1.2 }),
  SP('scratch', -20.4, -6.4, '벽에 지난 날들을 새기기', S => S.step === 'c3_wait' && (S.q.wait || 0) === 2 && !S.q.wReady, (S, G) => scratchWall(S, G), { r: 1.6, y: 1.3 }),
  SP('shave', SPOTS.basin[0], SPOTS.basin[1], '물로 씻고 수염 깎기', S => S.step === 'c4_shave', (S, G) => shaveScene(S, G), { r: 2.4 }),
  SP('rodeChk', 0, 0, '', S => false, () => { }),
  ...['A', 'B', 'C'].map(k => { const g = sites.find(s => s.id === 'gran' + k); return SP('open' + k, g.x, g.z + 4, '곳간 문 열기', S => S.step === 'c6_open' && !(S.q.opened || {})[k], (S, G) => openGranary(S, G, k), { r: 3.2 }); }),
];
// v15 살펴보기: little things worth a closer look. Each one tells a true story of the place (often a verse), fills the eye (정신력)
// a little, and counts toward 「알아낸 것」.
const LORE = [
  ['senet', -19.2, 41.6, '세넷 놀이판', '서른 칸짜리 판 위에서 말을 움직이는 애굽의 놀이 「세넷」이에요. 납작한 막대 네 개를 던져 나온 수만큼 나아가요. 귀족도 종들도 모두 즐겼대요.', ''],
  ['scribe', -17.8, 43.4, '서기관의 책상', '갈대 펜, 검은 잉크와 붉은 잉크, 파피루스 두루마리. 이 집의 곡식과 가축이 여기 하나하나 적혔어요. 훗날 이 모든 것을 요셉이 맡게 되지요.', '창세기 39:4'],
  ['linen', -30.8, 38.6, '고운 세마포', '애굽은 아마로 짠 고운 세마포로 이름난 땅이었어요. 훗날 바로는 요셉에게 세마포 옷을 입히고 금 사슬을 목에 걸어 주었어요.', '창세기 41:42'],
  ['rack', -8.9, 44.4, '말린 생선과 양파', '나일 강의 생선, 양파와 마늘… 훗날 광야의 이스라엘 백성은 애굽에서 먹던 이 맛을 그리워했어요.', '민수기 11:5'],
  ['bread', -11.5, 43.4, '화덕 빵', '애굽 사람들은 보리와 밀로 날마다 빵을 구웠어요. 둥근 빵, 길쭉한 빵, 대추야자를 넣은 달콤한 빵까지 있었대요.', ''],
  ['amph', -12.5, 65.4, '포도주와 기름 항아리', '곳간의 큰 항아리마다 무엇이 들었는지 꼬리표가 붙어 있었어요. 요셉이 이 집을 맡은 뒤로 여호와의 복이 집과 밭에 넘쳤어요.', '창세기 39:5'],
  ['lotus', -18, 61.6, '연꽃 연못', '푸른 연꽃은 아침에 피고 저녁에 오므라들어요. 애굽 사람들이 무척 아끼던 꽃이라 벽화와 그릇마다 그려 넣었어요.', ''],
  ['dove', -45.6, 39.6, '비둘기장', '집 뒤에서 새를 기르는 우리예요. 이 무렵 애굽 사람들은 주로 거위를 길러 알과 고기를 얻었어요.', ''],
  ['shaduf', 16, 53.6, '샤두프', '긴 장대 한쪽엔 두레박, 반대쪽엔 흙덩이를 단 물 푸는 틀이에요. 요셉 때에는 드물었고, 대개 멍에에 항아리 둘을 매달아 물을 날랐어요.', ''],
  ['jug', -16.4, -8.0, '물 한 대접', '옥에서는 물 한 대접도 귀했어요. 그래도 여호와께서 요셉과 함께 계셔서, 간수장의 마음을 얻게 하셨어요.', '창세기 39:21'],
  ['throne', -30, -171.2, '바로의 보좌', '금과 청금석으로 꾸민 보좌. 바로는 요셉에게 「내가 너보다 높은 것은 내 왕좌뿐이니라」 하고 말했어요.', '창세기 41:40'],
  ['onAltar', 12, -102.2, '온의 제단', '온(헬리오폴리스)은 해를 섬기던 성읍이에요. 요셉의 아내 아스낫은 이 온의 제사장 보디베라의 딸이었어요.', '창세기 41:45'],
  ['obelisk', 6.6, -95, '오벨리스크', '돌 하나를 통째로 깎아 세운 뾰족한 기둥이에요. 꼭대기를 금으로 씌워 햇빛에 번쩍였대요.', ''],
  ['pyramid', -188, -175, '피라미드', '요셉의 시대에도 왕들은 피라미드를 지었어요. 속은 진흙벽돌, 겉은 흰 석회석이에요. 기자의 큰 피라미드는 그때 이미 팔백 년쯤 된 옛 무덤이었지요.', ''],
  ['tent', 168.4, 146.6, '염소털 장막', /* v18.34 moved behind the tent: it took the A button from Jacob in the very first step */ '야곱의 장막은 검은 염소털로 짰어요. 비가 오면 털실이 부풀어 물이 새지 않고, 해가 나면 바람이 잘 통했대요.', ''],
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
  { id: 'wHeb', type: 'well', x: 160, z: 150, r: 3.2 }, { id: 'fHeb', type: 'fire', x: 176, z: 153, r: 3 }, { id: 'bHeb', type: 'bed', x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1], r: 2, on: S => before(S, 'p_road'), chest: [182.29, 159.2], chestA: -2.24 },
  { id: 'fOak', type: 'fire', x: SPOTS.restOak[0], z: SPOTS.restOak[1], r: 3, on: S => !!(S.q && S.q.oakLit) || !before(S, 'p_shechem') }, { id: 'fDot', type: 'fire', x: 158, z: -150, r: 3 }, { id: 'fCar', type: 'fire', x: SPOTS.caravanNight[0], z: SPOTS.caravanNight[1], r: 3 },
  { id: 'wPot', type: 'well', x: SPOTS.well[0], z: SPOTS.well[1], r: 3.2, on: inEgyptHouse }, { id: 'bPot', type: 'bed', x: -46.8, z: 50, on: inEgyptHouse, noChest: true },
  { id: 'wPri', type: 'well', x: SPOTS.basin[0], z: SPOTS.basin[1], r: 2.8, rim: 1.3, on: show('c3_keeper', 'c4_shave') }, { id: 'bPri', type: 'bed', x: -20.2, z: -8.6, on: show('c3_keeper', 'c3_wait'), noChest: true },
  { id: 'bJos', type: 'bed', x: 10, z: -141.2, on: show('c5_patrol') }, { id: 'wCity', type: 'well', x: -21, z: -90, r: 3.2 }, { id: 'wW', type: 'well', x: -140, z: -40, r: 3.2 }, { id: 'wS', type: 'well', x: -145, z: 128, r: 3.2 },
  { id: 'shopM', type: 'shop', shop: 'market', label: '도성 장터에서 사고팔기', x: -24.4, z: -76, r: 2.2, on: show('c5_patrol') },
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
const hAt = (x, z) => { if (x > 1500 && GG.DW) return GG.DW.h(x, z); const h = Gm().W().heightAt(x, z), f = pitFloor(x, z); return f !== null ? Math.max(h, f) : h; };
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
const OUTFIT_AT = [['p_wake', 'josephCoat'], ['c1_pit', 'josephPlain'], ['c2_arrive', 'josephSlave'], ['c2_manage', 'josephSteward'], ['c2_flee', 'josephFled'], ['c3_cell', 'josephPrisoner'],
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
  wNight: { n: '밤하늘 겉옷', d: '쪽빛으로 물들인 긴 겉옷에 금실 별무늬.', need: null, silver: 160 }, /* v18.55 clothes bought with silver */
  wDesert: { n: '광야 나그네 차림', d: '흙빛 겉옷과 머리 두건. 먼 길을 갈 때 편해요.', need: null, silver: 90 },
  wGold: { n: '금빛 예복', d: '금박을 두른 흰 세마포 예복. 바로의 잔치에나 입을 만한 귀한 옷이에요.', need: null, silver: 320 },
  josephShaved: { n: '겉옷 벗기', d: '겉옷을 벗고 아마 치마만 입어요.', need: null } };
const WARD_LOOKS = {
  wLinen: Object.assign({}, JO, { skin: 0xd09868, bare: true, kilt: true, kiltLong: true, bottom: LINEN, collar: TURQ, collar2: GOLD, hairStyle: 'wig', hair: 0x15100c, build: 0.95, jaw: 0.05, sandal: 0x8a6a40 }),
  wLapis: Object.assign({}, LOOK.josephVizier, { top: LAPIS, under: LINEN, trim: GOLD, trim2: LINEN, sash: GOLD }),
  wFeast: Object.assign({}, LOOK.josephVizier, { mantle: LINEN, mantleTrim: GOLD, collar: GOLD, collar2: TURQ }),
  wRed: Object.assign({}, LOOK.josephVizier, { mantle: 0x9a2a22, mantleTrim: GOLD }),
  wField: Object.assign({}, JO, { skin: 0xd09868, top: 0xc8a878, trim: 0x6a4a30, belt: 0x5a3a22, mantle: 0x6a5a48, hairStyle: 'short', build: 0.95, jaw: 0.05 }),
  wCoat: Object.assign({}, LOOK.josephCoat, { skin: 0xd09868, build: 0.95, jaw: 0.05 }),
  wNight: Object.assign({}, LOOK.josephVizier, { mantle: 0x1e2a5a, mantleTrim: GOLD, collar: GOLD, collar2: LAPIS }),
  wDesert: Object.assign({}, JO, { skin: 0xd09868, top: 0xb89868, trim: 0x7a5a38, belt: 0x5a3a22, mantle: 0x8a7050, hairStyle: 'short', build: 0.95, jaw: 0.05 }),
  wGold: Object.assign({}, LOOK.josephVizier, { mantle: LINEN, mantleTrim: GOLD, collar: GOLD, collar2: GOLD, sash: GOLD, trim: GOLD, trim2: GOLD }) };
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
    if (S.step === 'c2_store') { place('potiphar', -12.6, 59.2, -1.4); place('scribe', -14.2, 62.4, -1.6); }
    else { place('potiphar', -28, 39.4, 0, { sit: true }); place('scribe', -22, 39, 0, { sit: true }); }
    if (S.step === 'c2_tempt3') place('wife', -33.6, 30.4, 1.5); else if (S.step === 'c2_banquet') { place('potiphar', -28, 39.4, -1.776, { sit: true, act: 'eat' }); place('wife', -29.25, 36.9, -0.52, { sit: true, act: 'eat' }); ['guest1', 'guest2', 'guest3'].forEach(id => { const n = G.npc(id); if (n) n.act = 'eat'; }); } else if (S.step !== 'c2_flee') place('wife', -20.6, 61.6, Math.PI);
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
  const pf = innerHeight > innerWidth * 1.15 ? 1 : 0, m = 1 + pf * 0.45; /* v18.42 on a phone held upright the frame is narrow: the shots step back and widen so Joseph's head stays in */
  fade(() => { G.teleport(bx, bz, 1.9708); G.P.sleeping = true; /* v18.12j lie along the straw mat (its long side runs at ry 0.4) */ if (G.hour() < 22) S.time = GG.Game.clockTo(S, 22.2, 0); GG.UI.hint(null); }, () => cine([
    { cam: [bx + (ux * 3.2 + uz * 1.4) * m, h + 1.35 + pf * 0.7, bz + (uz * 3.2 - ux * 1.4) * m], cam2: [bx + (ux * 2.6 + uz * 1.1) * m, h + 1.1 + pf * 0.7, bz + (uz * 2.6 - ux * 1.1) * m], look: [bx, h + 0.3, bz], dur: 5, fov: 0.85 + pf * 0.2, t: '모닥불이 사위어 갈 무렵, 요셉은 짚자리에 누워 하늘을 올려다보았습니다.', music: 'j_night' },
    { cam: [bx + ux * 0.3, h + 0.55, bz + uz * 0.3], look: sky(16, 26), look2: sky(18, 26), dur: 7, fov: 1.05, n: '요셉', t: '해와 달과 열한 별이 내게 절을 했지… 형들은 그 꿈 이야기에 더 화를 냈고.', ref: '창세기 37:9–11', e: 'tender' },
    { cam: [bx + (ux * 1.7 - uz * 0.9) * (1 + pf * 0.8), h + 1.05 + pf * 0.6, bz + (uz * 1.7 + ux * 0.9) * (1 + pf * 0.8)], look: [bx, h + 0.4, bz], dur: 6, fov: 0.7 + pf * 0.3, n: '요셉', t: '아버지는 그 말을 마음에 두셨는데… 형들은 왜 나를 미워할까. 이번엔 형들이 반가워해 주면 좋겠다.', ref: '창세기 37:4, 11', e: 'sad' },
    { cam: [bx + (ux * 3.4 + uz * 0.6) * m, h + 2.3 + pf * 0.6, bz + (uz * 3.4 - ux * 0.6) * m], cam2: [bx + (ux * 3.1 + uz * 0.5) * m, h + 2.15 + pf * 0.6, bz + (uz * 3.1 - ux * 0.5) * m], look: [bx, h + 0.25, bz], dur: 4.5, fov: 0.8 + pf * 0.2, t: '모닥불이 꺼지고, 소년은 스르르 잠이 들었습니다.' },
    { cam: [bx + ux * 1.2, h + 0.5, bz + uz * 1.2], look: sky(14, 30), look2: sky(14.5, 30.5), dur: 6, fov: 1.15, fadeIn: 0.6, t: '그날 밤, 별들은 말없이 소년을 내려다보았습니다.', fadeOut: 1.8 },
  ], () => { G.P.sleeping = false; GG.Game.musicOverride = null; G.newDay('세겜 들판으로'); G.teleport(bx - 1.5, bz - 1.5, Math.PI); G.go('p_shechem'); }));
}
const CLUE_T = [
  [T('식은 모닥불 자리예요. 재가 차가워요. 목자들이 떠난 지 며칠은 된 것 같아요.')],
  [T('수많은 양 떼 발자국이 북쪽으로 이어져 있어요.')],
  [T('목자들이 쌓은 돌 표시예요. 길이 여기서 여러 갈래로 갈라져요.')]];
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
    { cam: [fx + 2.4, fh + 1.3, fz - 1.4], look: [fx - 1, fh + 1.0, fz + 1.5], dur: 5, n: '시므온', t: '꿈 꾸는 자가 오는도다.', ref: '창세기 37:19', e: 'cold', fn: () => { emote('simeon', 'point', 3); } },
    { cam: [fx - 2.2, fh + 1.2, fz + 2.6], look: [fx + 1, fh + 1.0, fz - 1], dur: 7, n: '레위', t: '자, 그를 죽여 한 구덩이에 던지고, 우리가 말하기를 악한 짐승이 그를 잡아먹었다 하자. 그 꿈이 어떻게 되는 것을 우리가 볼 것이니라.', ref: '창세기 37:20', e: 'cold' },
    { cam: [fx + 3.2, fh + 1.4, fz + 2.4], cam2: [fx + 2.6, fh + 1.3, fz + 1.8], look: [fx + 1.6, fh + 1.2, fz + 2.6], dur: 6, n: '르우벤', t: '우리가 그 생명은 상하지 말자. 르우벤이 또 그들에게 이르되 피를 흘리지 말라. 그를 광야 그 구덩이에 던지고 손을 그에게 대지 말라.', ref: '창세기 37:21–22', e: 'urgent', fn: () => emote('reuben', 'think', 6) },
    { cam: [PIT.x + 6, PIT.rim + 2.4, PIT.z + 6], cam2: [PIT.x + 4, PIT.rim + 3, PIT.z + 4], look: [PIT.x, PIT.floor + 1, PIT.z], dur: 6, t: '이는 그가 요셉을 그들의 손에서 구원하여 그 아비에게로 돌리려 함이었더라.', ref: '창세기 37:22' },
  ], next);
}
/* v18.13 the garment motif: three clothes carry the story — the coat torn off (37:23), the cloak left behind (39:12), the linen
   Pharaoh puts on him (41:42). Each gets the same shot: low, close, a slow push toward the cloth, the same chime (lower on the
   way down, higher on the way up) and one quiet line, so the three moments rhyme. */
function garmentBeat(i, look, from, t) { const k = 0.28, cam2 = [from[0] + (look[0] - from[0]) * k, from[1] + (look[1] - from[1]) * k, from[2] + (look[2] - from[2]) * k];
  return { fn: () => { GG.Audio && GG.Audio.sfx('insight', { pitch: [0.72, 0.84, 1.12, 1.25][i], vol: 0.7 }); }, cam: from, cam2, look, dur: 3.6, fov: 0.48, ease: 'out', t, e: undefined }; }
// p_approach → the pit (창 37:23–24)
function cinPit(S, G, next) {
  const P = G.P, px = P.x, pz = P.z, ph = hAt(px, pz), fx = DOTHAN.x, fz = DOTHAN.z, fh = hAt(fx, fz);
  const fr = Math.atan2(fx - px, fz - pz); P.face = fr;
  const rim = (a, r) => [PIT.x + Math.cos(a) * (r || PIT.wall + 0.85), PIT.z + Math.sin(a) * (r || PIT.wall + 0.85)]; // v16.9 at the very edge, looking down (they stood back out of sight)
  cine([
    { fn: () => { cpose(null); }, shot: { type: 'MS', a: 'hero', b: 'simeon' }, dur: 4.5, e: 'happy' },
    { fn: () => { ['simeon', 'levi', 'judah', 'dan', 'gad'].forEach((id, i) => walkTo(id, px + Math.sin(fr + 2.2 + i * 0.45) * 1.7, pz + Math.cos(fr + 2.2 + i * 0.45) * 1.7, 2.2, n => face(id, px, pz))); },
      shot: { type: 'OTS', a: 'simeon', b: 'hero' }, dur: 5, e: 'cold' },
    { shot: { type: 'CU', a: 'hero', b: 'simeon', lens: 'tele', move: 'pushIn' }, dur: 4.5, e: 'fear', fn: () => cpose('think', 4) },
    { fn: () => { emote('simeon', 'grab', 2); emote('levi', 'grab', 2); G.sfx('rip'); G.setOutfit('josephPlain'); cpose('fallen', 0, true); }, cam: [px + 2.4, ph + 1.2, pz + 1.8], look: [px, ph + 0.8, pz], dur: 5, shake: 0.6, shakeDecay: 1.4,
      t: '요셉이 형들에게 이르매, 그 형들이 요셉의 옷 곧 그 입은 채색옷을 벗기고', ref: '창세기 37:23' },
    Object.assign(garmentBeat(0, [px + 0.9, ph + 0.05, pz + 0.5], [px + 1.9, ph + 0.55, pz + 1.6], '첫 번째 옷 · 아버지가 지어 주신 채색옷이 흙바닥에 떨어졌습니다.'), { fn: () => { RT.coatG = { x: px + 0.9, z: pz + 0.5, y: ph }; GG.Audio && GG.Audio.sfx('insight', { pitch: 0.72, vol: 0.7 }); } }),
    { shot: { type: 'LOW', a: 'levi', b: 'hero' }, dur: 4.5, e: 'angry', fn: () => emote('levi', 'swing', 1.2) },
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
    { shot: { type: 'LOW', a: 'simeon', b: 'hero', lens: 'wide' }, dur: 5, e: 'cold', fn: () => emote('levi', 'laugh', 4) },
    { cam: [rim(3.6, 6)[0], PIT.rim + 1.7, rim(3.6, 6)[1]], look: [rim(3.6)[0], PIT.rim + 1.4, rim(3.6)[1]], dur: 4 },
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
      t: '그들이 앉아 음식을 먹다가 눈을 들어 본즉, 한 떼 이스마엘 족속이 길르앗에서 오는데, 그 약대들에 향품과 유향과 몰약을 싣고 애굽으로 내려가는지라.', ref: '창세기 37:25' },
    { fn: () => { const n = G.npc('judah'); if (n) { n.sit = false; n.act = null; } }, cam: [fx + 1.6, fh + 1.5, fz + 3.6], look: [fx + 0.4, fh + 1.3, fz + 1.4], dur: 6, n: '유다', t: '우리가 우리 동생을 죽이고 그의 피를 은익한들 무엇이 유익할까.', ref: '창세기 37:26', e: 'solemn' },
    { cam: [fx - 1.4, fh + 1.6, fz + 4.4], look: [fx + 0.6, fh + 1.3, fz + 1.6], dur: 7, n: '유다', t: '자, 그를 이스마엘 사람에게 팔고 우리 손을 그에게 대지 말자. 그는 우리의 동생이요 우리의 골육이니라.', ref: '창세기 37:27' },
    { fn: () => { ['judah', 'simeon', 'levi'].forEach((id, i) => walkTo(id, top[0] - 1 + i * 1.3, top[1] + 1.8 - i * 0.6, 2.4)); CAR.forEach((id, i) => walkTo(id, PIT.x + 9 + i * 3, PIT.z - 4.5 - (i % 2), 2.2)); },
      cam: [PIT.x - 0.3, PIT.floor + 0.8, PIT.z - 0.6], look: [PIT.x + 1, PIT.rim + 1.4, PIT.z + 1.6], dur: 5, t: '형제들이 청종하였더라.', ref: '창세기 37:27', sfx: 'rope' },
    { fn: () => { S.q.inPit = 0; S.q.bound = 1; G.teleport(top[0], top[1], -1.2); cpose('bound', 0, true); },
      cam: [top[0] - 3.4, hAt(top[0], top[1]) + 1.6, top[1] + 1.6], look: [top[0], hAt(top[0], top[1]) + 1.1, top[1]], dur: 6, shake: 0.25, shakeDecay: 1,
      t: '때에 미디안 사람 상고들이 지나는지라 그들이 요셉을 구덩이에서 끌어올리고…', ref: '창세기 37:28', sfx: 'rope' },
    { fn: () => { place('midian', top[0] + 2.4, top[1] - 1.6, -0.8); place('judah', top[0] + 1.2, top[1] + 0.2, 2.2); },
      cam: [top[0] + 4.4, hAt(top[0], top[1]) + 1.5, top[1] + 0.6], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.3, top[1] - 0.6], dur: 4 },
    { cam: [top[0] + 0.2, hAt(top[0], top[1]) + 1.5, top[1] + 2.4], look: [top[0] + 1.4, hAt(top[0], top[1]) + 1.4, top[1]], dur: 3 }, /* v18.42 no haggling over the boy */
    { cam: [top[0] + 3.4, hAt(top[0], top[1]) + 1.3, top[1] - 0.2], look: [top[0] + 1.8, hAt(top[0], top[1]) + 1.0, top[1] - 0.8], dur: 5.5, sfx: 'coins', t: '은 이십에 이스마엘 사람들에게 팔매', ref: '창세기 37:28', fn: () => emote('midian', 'pick', 2) },
    { cam: [top[0] - 1.8, hAt(top[0], top[1]) + 1.4, top[1] - 1.2], look: [top[0], hAt(top[0], top[1]) + 1.4, top[1]], dur: 7, fov: 0.62, t: '요셉이 애걸하였으나, 형들은 듣지 아니하였습니다.', ref: '창세기 42:21', e: 'cry', fn: () => cpose('beg', 0, true) },
    { cam: [top[0] + 1.2, hAt(top[0], top[1]) + 1.6, top[1] + 3.2], look: [top[0] + 1.2, hAt(top[0], top[1]) + 1.2, top[1] + 0.2], dur: 4 },
    { fn: () => { cpose('bound', 0, true); const L = [[150, -138], [146, -134], [142, -131], [138, -128], [134, -126], [130, -124]]; CAR.forEach((id, i) => { place(id, PIT.x + 6 - i * 3, PIT.z - 7.5 - i * 0.4, -2.2); walkTo(id, L[i][0], L[i][1], 2.1); }); G.teleport(PIT.x - 14, PIT.z - 5.8, -2.2); walkTo('ishBoy', PIT.x - 15, PIT.z - 7.5, 2); },
      cam: [PIT.x + 14, PIT.rim + 9, PIT.z + 14], cam2: [PIT.x + 6, PIT.rim + 14, PIT.z + 10], look: [PIT.x - 10, PIT.rim, PIT.z - 6], look2: [PIT.x - 22, PIT.rim, PIT.z - 2], dur: 8, t: '요셉을 데리고 애굽으로 갔더라.', ref: '창세기 37:28', music: 'j_mourn',
      each: t => { const P = G.P; P.x = PIT.x - 14 - t * 1.6; P.z = PIT.z - 5.8 + t * 0.9; P.y = hAt(P.x, P.z); P.spd = 1.6; } },
    { hour: 18.4, fn: () => { S.q.caravanOn = 0; const [x, z] = [PIT.x + 6.4, PIT.z - 1.4]; place('reuben', x, z, Math.atan2(PIT.x - x, PIT.z - z), { act: 'tearClothes' }); G.teleport(DOTHAN.x - 30, DOTHAN.z + 20, 0); },
      /* v18.40 across the empty pit from its far side (the camera used to sit inside the pit wall) */ cam: [PIT.x - 4.6, Math.max(PIT.rim, hAt(PIT.x - 4.6, PIT.z + 0.8)) + 2.3, PIT.z + 0.8], look: [PIT.x + 6.4, PIT.rim + 1.0, PIT.z - 1.4], dur: 6, t: '르우벤이 돌아와서 구덩이에 이르러 본즉 거기 요셉이 없는지라. 옷을 찢고', ref: '창세기 37:29' },
    { cam: [PIT.x + 9.4, PIT.rim + 1.7, PIT.z - 3.2], look: [PIT.x + 6.4, PIT.rim + 1.3, PIT.z - 1.4], dur: 6, n: '르우벤', t: '아이가 없도다! 나는 나는 어디로 갈까!', ref: '창세기 37:30', e: 'cry' },
    { hour: 21, fn: () => { const n = G.npc('reuben'); if (n) n.act = null; stage(S, G); }, cam: [fx + 6, fh + 3, fz + 6], cam2: [fx + 4, fh + 2.2, fz + 4], look: [fx, fh + 0.8, fz], dur: 6, t: '그들이 요셉의 옷을 취하고 수염소를 죽여 그 옷을 피에 적시고, 그 채색옷을 보내어 그 아비에게로 가져다가', ref: '창세기 37:31–32' },
    { hour: 10, fn: () => { S.q.heb = 1; S.q.broShow = 1; ['judah', 'reuben', 'simeon', 'levi', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun'].forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI));
        place('jacob', heb[0], heb[1] + 2.6, 0); place('benjamin', heb[0] - 2.6, heb[1] + 3.0, 1.75); }, /* v18.76 Benjamin stands left of his father (he stood on the basin's stool and blocked the shot) */
      cam: [heb[0] + 4, hh + 1.7, heb[1] + 9], cam2: [heb[0] + 2.4, hh + 1.6, heb[1] + 7.2], look: [heb[0], hh + 1.2, heb[1] + 3], dur: 7, n: '형들', t: '우리가 이것을 얻었으니, 아버지의 아들의 옷인가 아닌가 보소서…', ref: '창세기 37:32', e: 'solemn' },
    { cam: [heb[0] - 1.2, hh + 1.6, heb[1] + 4.8], look: [heb[0], hh + 1.5, heb[1] + 2.6], dur: 7, fov: 0.62, n: '야곱', t: '내 아들의 옷이라. 악한 짐승이 그를 먹었도다. 요셉이 정녕 찢겼도다!', ref: '창세기 37:33', e: 'cry', fn: () => { const n = G.npc('jacob'); if (n) n.act = 'tearClothes'; } },
    { fn: () => { const n = npcSet('jacob', { look: LOOK.jacobMourn }); if (n) n.act = 'mourn'; }, cam: [heb[0] - 1.0, hh + 1.2, heb[1] + 5.0], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 7, /* v18.76 from the left: the basin's stool no longer stands in front of him (he seemed to kneel on it) */
      t: '자기 옷을 찢고 굵은 베로 허리를 묶고 오래도록 그 아들을 위하여 애통하니', ref: '창세기 37:34' },
    { cam: [heb[0] - 4.2, hh + 0.9, heb[1] + 4.8], look: [heb[0] - 2.6, hh + 0.8, heb[1] + 3.0], dur: 4, fn: () => { const n = G.npc('benjamin'); if (n) n.act = 'weep'; } },
    { cam: [heb[0] - 2.4, hh + 1.3, heb[1] + 4.6], look: [heb[0], hh + 0.9, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 슬퍼하며 음부에 내려 아들에게로 가리라.', ref: '창세기 37:35', e: 'cry' },
    { cam: [heb[0] + 10, hh + 7, heb[1] + 14], cam2: [heb[0] + 14, hh + 12, heb[1] + 20], look: [heb[0], hh + 1, heb[1] + 2], dur: 8, t: '모든 자녀가 위로하되 그가 그 위로를 받지 아니하여 가로되 내가 슬퍼하며 음부에 내려 아들에게로 가리라 하고 그 아비가 그를 위하여 울었더라.', ref: '창세기 37:35', fadeOut: 1.5 },
    { hour: 17.6, fn: () => { GG.Cine.hold = true; /* v18.24 from the prayer in the pit to Egypt: one unbroken chain of scenes, no control in between */ S.q.heb = 0; S.q.broShow = 0; const n = npcSet('jacob', { look: LOOK.jacob }); if (n) n.act = null; const b = G.npc('benjamin'); if (b) b.act = null; caravanStart(S, G, false); },
      fadeIn: 1.4, cam: () => { const P = G.P; return [P.x + 5, P.y + 2.2, P.z + 4]; }, look: () => { const P = G.P; return [P.x, P.y + 1.2, P.z]; }, dur: 7, music: 'j_caravan',
      t: '그 시각, 요셉은 아버지가 자기를 위해 울고 있는 줄도 모른 채, 낯선 이들의 낙타 뒤를 따라 걷고 있었습니다.' },
  ], () => { next(); });
}

// ------------------------------------------------------------------ c1_caravan · bound behind the camels
const CAR_IDS = ['ishmael', 'midian', 'camel1', 'camel2', 'camel3', 'ishBoy']; const CAR_GAP = { ishmael: 0, midian: 5, camel1: 10, camel2: 15, camel3: 20, ishBoy: 35 }; const CAR_ME = 27;
const LEG1 = [[150, -138], [130, -124], [112, -104], [96, -84], [80, -60], [64, -34], [60, -28]];
const LEG2 = [[34, 62], [30, 76], [20, 92], [10, 108], [-2, 115], [-6, 118]];
function caravanStart(S, G, resume) {
  S.q.caravanOn = 1; S.q.bound = 1; const leg = RT.legOver || (S.q.night ? LEG2 : LEG1);
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
  /* v18.73 the traders' made-up talk on the road and Joseph's look back at Hebron are gone (37:25–28 only: the caravan, silent) */
  /* v18.38 the walk on the rope: Joseph walks this stretch himself; if he stands still the rope drags him on after a while */
  if (RT.ropeDone) { RT.ropeT = (RT.ropeT || 0) + dt; if (RT.ropeT > 50 && !busy) C.done = true; if (C.done && !busy) { const f = RT.ropeDone; RT.ropeDone = null; RT.legOver = null; RT.car = null; RT.ropeT = 0; GG.UI.hint(null); f(); return; } return; }
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
  if (GG.Cine.on) return; if (S.q.reveal) { if (S.step === 'c1_caravan') Gm().go('c1_market'); return; } /* v18.24 (a save from after the border goes on to the market) */ RT.car = null; S.q.caravanOn = 1; S.q.bound = 1; GG.UI.hint(null); GG.Cine.hold = true; // one long cutscene to the market
  const a1 = Math.atan2(LEG1[1][0] - LEG1[0][0], LEG1[1][1] - LEG1[0][1]), m = LEG1[3], a2 = Math.atan2(LEG1[4][0] - m[0], LEG1[4][1] - m[1]);
  const p0 = LEG1[0], h0 = hAt(p0[0], p0[1]), hm = hAt(m[0], m[1]);
  const jx = () => Gm().P.x, jz = () => Gm().P.z;
  if (S.q.night) { afterNight(S, G); return; }
  cine([
    { fn: () => stageCar(p0[0], p0[1], a1, true), cam: [p0[0] + 9, h0 + 5, p0[1] - 8], cam2: [p0[0] + 6, h0 + 3.6, p0[1] - 5], look: [p0[0] - 4, h0 + 1, p0[1] + 4], dur: 6, music: 'j_caravan',
      t: '요셉은 줄에 묶인 채, 이스마엘 대상을 따라 남쪽으로 끌려갔습니다.', ref: '창세기 37:28' },
    { cam: () => [jx() + 1.8, hAt(jx(), jz()) + 1.4, jz() + 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.3, jz()], dur: 4.5, fov: 0.62 }, /* v18.76 (the trader's made-up words are gone: the walk on the rope, silent) */
    { fn: () => { stageCar(m[0], m[1], a2, true); GG.Cine.hold = false; }, cam: [m[0] - 30, hm + 14, m[1] - 10], cam2: [m[0] - 22, hm + 10, m[1] - 4], look: [m[0], hm + 1, m[1]], dur: 6, t: '고향 가나안의 언덕은 멀어지고, 끝없는 광야가 펼쳐졌습니다.' },
  ], () => { /* v18.38 this stretch is yours to walk */ RT.legOver = [LEG1[3], LEG1[4], LEG1[5]]; RT.lookBack = 1; RT.ropeT = 0; caravanStart(S, G, false); RT.ropeDone = () => cine([
    { fn: () => { GG.Cine.hold = true; const P = Gm().P; P.face = a2 + Math.PI * 0.85; }, cam: () => [jx() - Math.sin(a2) * 2.2 + 0.6, hAt(jx(), jz()) + 1.5, jz() - Math.cos(a2) * 2.2], look: () => [jx(), hAt(jx(), jz()) + 1.45, jz()], dur: 5.5, fov: 0.6,
      n: '요셉', t: '(뒤를 돌아본다) …저 산 너머가 헤브론인데. 아버지…', e: 'sad' },
  ], () => cinCaravanNight(S, G, () => afterNight(S, G)), { noSkip: false }); setTimeout(() => GG.UI.hint('줄이 당겨요 · 스틱으로 낙타를 따라 걸어요', 'rope', 'tap'), 300); }, { noSkip: false });
}
function afterNight(S, G) {
  const a = LEG2[0], b = LEG2[1], ang = Math.atan2(b[0] - a[0], b[1] - a[1]), h = hAt(a[0], a[1]);
  cine([{ fn: () => stageCar(a[0], a[1], ang, true), cam: [a[0] + 14, h + 6, a[1] - 6], cam2: [a[0] + 8, h + 4, a[1] - 2], look: [a[0] - 2, h + 1, a[1] + 3], dur: 5.5, music: 'j_caravan', t: '여러 날을 걸어 광야를 건넜습니다. 모래 너머로 초록빛이 비치기 시작했습니다.' }],
    () => { const g = SPOTS.egyptGate; stageCar(g[0] + 1, g[1] - 4, ang, true); cinReveal(S, G, () => { stageCar(SPOTS.market[0] + 6, SPOTS.market[1] - 9, -0.4, true); S.q.reveal = 1; S.q.atMkt = 1; GG.Cine.hold = true; if (S.step === 'c1_caravan') Gm().go('c1_market'); }); });
}
function cinCaravanNight(S, G, then) {
  const [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  RT.car = null; const fd = (a, b) => { if (GG.Cine.hold) { a(); b(); } else fade(a, b); }; fd(() => { S.time = GG.Game.clockTo(S, 20.6, 0); place('ishmael', cx + 2, cz + 1.4, -2.2, { sit: true }); place('midian', cx - 1.8, cz + 1.8, 2.4, { sit: true }); place('ishBoy', cx + 1.6, cz - 2.2, -0.6);
    ['camel1', 'camel2', 'camel3'].forEach((id, i) => place(id, cx + 6 + i * 2.6, cz - 3 + i, -1.2)); G.teleport(cx - 0.4, cz - 2.6, 0.2); cpose('sitg', 0, true); /* v18.38 on the ground, not on an invisible chair */ },
  () => cine([
    { cam: [cx - 9, h + 3.6, cz - 7], cam2: [cx - 6, h + 2.4, cz - 4.6], look: [cx, h + 0.8, cz], dur: 6, t: '광야의 밤. 대상은 길가에 불을 피우고 쉬었습니다.', music: 'j_night' },
    { fn: () => walkTo('ishBoy', cx + 0.6, cz - 2.8, 1.2, n => { face('ishBoy', G.P.x, G.P.z); n.act = 'present'; }), cam: [cx + 2.4, h + 1.1, cz - 4.4], look: [cx - 0.2, h + 0.8, cz - 2.4], dur: 5, n: '대상의 아이', t: '…물. 마셔.', e: 'tender', ask: [{ t: '두 손으로 받아 마신다', fn: s => { s.q.tookWater = 1; G.sfx('pour'); } }, { t: '고개를 돌린다', fn: s => { s.q.tookWater = 0; } }] },
    { at: s => s.q.tookWater ? { n: '요셉', t: '…고마워.' } : { n: '', t: '요셉은 고개를 돌렸습니다. 아이는 말없이 물을 곁에 두었고, 한참 뒤 요셉은 그 물을 집어 들었습니다.' }, cam: [cx - 2.6, h + 1.0, cz - 3.4], look: [cx + 0.2, h + 0.9, cz - 2.6], dur: 4.5, e: 'weary' },
    { fn: () => { const n = G.npc('ishBoy'); if (n) { n.act = null; n.sit = true; } }, cam: [cx + 1.8, h + 1.0, cz - 1.0], look: [cx - 0.2, h + 0.7, cz - 2.6], dur: 5, n: '대상의 아이', t: '너 어디서 왔어?' },
    { cam: [cx - 1.6, h + 0.9, cz - 4.0], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, n: '요셉', t: '헤브론. 저 산 너머에… 아버지가 계셔. 동생도.', e: 'sad' },
    { cam: [cx + 2.0, h + 0.9, cz - 3.6], look: [cx + 0.6, h + 0.7, cz - 2.8], dur: 7, n: '대상의 아이', t: '애굽에 가면 팔린대. 아빠가 그러는데, 너는 은 스물 줬으니까 애굽에서는 더 받을 거래.' },
    { cam: [cx - 0.8, h + 0.6, cz - 3.6], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 4.5, t: '요셉은 대답하지 못했습니다.', ask: [{ t: '별을 올려다보며 기도하기' }] },
    { cam: [cx - 0.2, h + 0.5, cz - 3.2], look: [cx - 6, h + 30, cz + 14], dur: 8, n: '요셉', t: '하나님… 아버지가 들려주셨던 벧엘 이야기를 기억해요. 형을 피해 도망치던 밤, 돌을 베고 누운 아버지에게 하나님이 말씀하셨다고.', e: 'pray' },
    { cam: [cx + 0.6, h + 0.7, cz - 4.2], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 8, n: '요셉', t: '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며…」', ref: '창세기 28:15', e: 'pray' },
    { cam: [cx - 1.2, h + 0.8, cz - 3.4], look: [cx - 0.4, h + 0.9, cz - 2.6], dur: 6, fov: 0.6, n: '요셉', t: '저도… 지켜 주실 거죠? 이렇게 멀리 가도요.', e: 'cry' },
    { cam: [cx - 0.6, h + 0.55, cz - 3.0], look: [cx - 0.4, h + 0.75, cz - 2.6], dur: 6, fov: 0.55, t: '요셉은 품 안의 매끈한 돌멩이를 꼭 쥐었습니다. 「형, 약속!」 베냐민의 목소리가 들리는 것 같았습니다.' }, /* v18.56 */
    { cam: [cx, h + 2, cz], cam2: [cx, h + 3, cz], look: [cx + 10, h + 40, cz - 30], look2: [cx - 10, h + 44, cz - 30], dur: 8, t: '그날 밤 광야의 하늘에도, 헤브론에서 보던 그 별들이 떠 있었습니다.', fadeOut: 2 },
    { black: true, title: '여러 날 후', sub: '광야를 건너 애굽으로', cam: [cx, h + 2, cz], look: [cx, h, cz - 3], dur: 3.6,
      fn: () => { cpose(null); S.q.night = 1; S.day += 4; S.time = GG.Game.clockTo(S, 8.4, 1); if (!then) caravanStart(S, G, false); } },
  ], () => { GG.Game.musicOverride = null; G.UI.quest(); if (then) then(); }));
}
function cinReveal(S, G, then) {
  S.q.reveal = 1; const P = G.P, h = P.y;
  cine([
    { cam: [P.x - 1.5, h + 2.4, P.z + 3.5], cam2: [P.x - 20, h + 32, P.z + 12], look: [P.x - 10, h + 1, P.z - 3], look2: [-92, 0, 80], dur: 8, music: 'j_egypt', title: '애굽', sub: '나일 강의 땅',
      t: '광야가 끝나는 곳에, 끝없이 푸른 땅이 펼쳐졌습니다.' },
    { cam: [-20, 30, 120], cam2: [-60, 26, 70], look: [-110, 4, 20], look2: [-180, 20, -140], dur: 9, t: '강을 따라 늘어선 종려나무와 푸른 밭, 흰 벽의 집들. 그리고 저 멀리, 하늘을 찌르는 거대한 돌산이 서 있었습니다.' },
    { cam: [P.x - 1.6, h + 1.6, P.z - 2.4], look: [P.x, h + 1.5, P.z], dur: 4, fov: 0.65 },
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
      t: '애굽의 장터. 이스마엘 상인들은 요셉을 장터에 세웠습니다.' },
    { cam: [bx - 3, bh + 0.8, bz + 3], look: [bx - 1.3, bh + 1.6, bz + 0.2], dur: 6, fn: () => emote('auctioneer', 'wave', 4), ...EG('auctioneer', '헴! 헴 네페르! 가나안의 젊은 종이오!', '종이오! 좋은 종! 가나안에서 온 젊은 종이오!', 'shout') },
    { cam: [bx + 2.6, bh + 0.6, bz + 2.2], look: [bx + 0.6, bh + 1.3, bz + 0.5], dur: 6, fov: 0.62, t: '사람들이 요셉의 팔을 만져 보고, 이를 들여다보고, 값을 불렀습니다. 요셉은 땅만 내려다보았습니다.' },
    { fn: () => { place('potiphar', mx + 5, mz + 4.5, -2.2); walkTo('potiphar', bx + 1.2, bz + 3.4, 1.9, n => face('potiphar', bx, bz)); G.sfx('crowd'); },
      cam: [bx - 2, bh + 1.4, bz + 1], look: [mx + 8, hAt(mx, mz) + 1.4, mz + 5], dur: 5 },
    { cam: [bx + 2.8, bh + 0.4, bz + 4.2], look: [bx + 1.2, hAt(bx, bz) + 1.6, bz + 3.4], dur: 5, fn: () => G.sfx('coins') }, /* v18.72 (Potiphar's questions and Joseph's chosen answer were not in Scripture) */
    { cam: [bx + 8, bh + 5, bz + 12], cam2: [bx + 6, bh + 9, bz + 16], look: [bx, bh, bz], dur: 8, t: '요셉이 이끌려 애굽에 내려가매, 바로의 신하 시위대장 애굽 사람 보디발이 그를 그리로 데려간 이스마엘 사람의 손에서 그를 사니라.', ref: '창세기 39:1', fadeOut: 1.6 },
    { black: true, title: '2장 · 보디발의 집', sub: '창세기 39:1–20', cam: [bx, bh + 2, bz + 4], look: [bx, bh, bz], dur: 4,
      fn: () => { crowd.forEach(id => G.removeNPC(id)); S.q.bound = 0; cpose(null); } },
  ], () => fade(() => { G.teleport(SPOTS.pGate[0], SPOTS.pGate[1] - 5, Math.PI); S.time = GG.Game.clockTo(S, 16.4, 0); G.go('c2_arrive'); }, () => { GG.Game.musicOverride = null; }));
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
  fade(() => { S.time = GG.Game.clockTo(S, 17.6, 0); place('potiphar', -28, 39.4, 0, { sit: true }); G.teleport(-28, 43.4, Math.PI); }, () => cine([
    { cam: [hx + 4, hh + 2, hz + 6], cam2: [hx + 2.6, hh + 1.6, hz + 4.4], look: [hx, hh + 1.1, hz - 1], dur: 6, music: 'j_house', t: '여호와께서 요셉과 함께하시므로 그가 형통한 자가 되어 그 주인 애굽 사람의 집에 있으니', ref: '창세기 39:2' },
    { cam: [hx - 1.8, hh + 1.2, hz + 1.4], look: [hx, hh + 1.0, hz - 2.2], dur: 6, t: '그 주인이 여호와께서 그와 함께하심을 보며, 또 여호와께서 그의 범사에 형통하게 하심을 보았더라.', ref: '창세기 39:3' },
    { cam: [hx + 1.6, hh + 1.3, hz - 0.4], look: [-28, hh + 1.3, 43.4], dur: 6, n: '요셉', t: '나리, 제가 한 것이 아닙니다. 제 하나님 여호와께서 함께 하셔서 그렇습니다.', e: 'calm', fn: () => cpose('bow', 1.6) },
    { cam: [hx - 1.4, hh + 1.1, hz + 1.8], look: [hx, hh + 1.0, hz - 2.2], dur: 7, t: '주인이 여호와께서 그와 함께하심을 보며, 또 여호와께서 그의 범사에 형통케 하심을 보았더라.', ref: '창세기 39:3' },
    { cam: [hx + 2, hh + 1.4, hz + 2.8], look: [hx, hh + 1.1, hz - 1.6], dur: 7, n: '보디발', t: '이레 뒤에 바로의 궁에서 손님들이 온다. 잔치 시중은 네가 들어라. 애굽 말로 주문을 받아야 할 게다.' },
  ], next));
}
const WANT = { guest1: { eg: '이르프!', ko: '포도주!', item: '포도주 항아리', prop: 'jar', arms: true }, guest2: { eg: '무… 무 네페르.', ko: '물… 좋은 물.', item: '물동이', prop: 'jarHead' },
  guest3: { eg: '타! 타 네페르!', ko: '빵! 좋은 빵!', item: '빵 바구니', prop: 'basket' }, potiphar: { eg: '데브.', ko: '무화과.', item: '무화과 쟁반', prop: 'basket' } };
const WANT_ORDER = ['guest1', 'guest2', 'guest3', 'potiphar'];
function banquetStart(S, G, re) {
  const go = () => { S.q.served = S.q.served || 0; S.q.want = WANT_ORDER[S.q.served]; S.q.carry = null; G.P.carry = null; askNext(S); };
  if (re) { go(); return; }
  fade(() => { S.time = GG.Game.clockTo(S, 19.3, 0); G.teleport(-38.3, 42.8, -Math.PI / 2); }, () => say([N('ameni', '요셉, 잘 들어라. 손님들은 애굽 말로만 주문할 게다. 마당 쓸고 자루 나르며 배운 말, 기억하지? 「이르프」는 포도주, 「데브」는 무화과다.', '', 'whisper'),
    N('ameni', '무와 타는 알지? 시중 상에서 알맞은 것을 들고 가서 손님께 드려라.', '', 'tender')], () => { learn('irp'); learn('dab'); go(); }));
}
// v16.6: the order stays above the guest's head until it is served; v18.14 the table names the dishes without their Egyptian
// word, so the player has to remember what 「이르프」, 「무」, 「타」, 「데브」 mean
function askNext(S) { const w = WANT[S.q.want]; if (!w) return; const id = S.q.want; const keep = () => { if (Gm().S().step === 'c2_banquet' && Gm().S().q.want === id && !GG.UI.busy()) bubble(id, w.eg, 6); }; setTimeout(keep, 600); clearInterval(RT.ordT); RT.ordT = setInterval(() => { if (Gm().S().step !== 'c2_banquet' || Gm().S().q.want !== id) { clearInterval(RT.ordT); return; } keep(); }, 5500); GG.UI.quest(); }
function serveTable(S, G) {
  const keys = WANT_ORDER.map(k => WANT[k].item); keys.sort();
  const w0 = WANT[S.q.want]; /* v18.14 the dishes are listed without their Egyptian words: the player has to remember them */
  GG.UI.choose(`무엇을 들고 갈까? · 지금 주문: 「${w0 ? w0.eg : '…'}」`, keys, i => { const it = keys[i]; const w = Object.values(WANT).find(x => x.item === it);
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
    T('요셉이 그 주인에게 은혜를 입어 섬기매, 그가 요셉으로 가정 총무를 삼고 자기 소유를 다 그 손에 위임하니', '창세기 39:4'),
    N('ameni', '(눈시울을 붉히며) …네 하나님이 정말 너와 함께 계시는구나.', '', 'tender')], () => { G.setOutfit('josephSteward'); G.sfx('fanfare'); S.q.carry = null; next(); });
}
// c2_manage
function assignPuzzle(S, G) {
  GG.UI.puzzle({ title: '일꾼들에게 일 맡기기', okText: '이대로 일 맡기기', doneMsg: '모두에게 알맞은 일을 찾았어요!', hint: '왼쪽의 일꾼을 고르고, 그 사람에게 가장 잘 맞는 일(오른쪽)을 고르세요',
    syms: [{ id: 'cook', t: '요리사 헤누 · 혀가 예민해 맛을 잘 본다', m: 'feast', h: '헤누는 맛을 잘 봐요. 음식과 관계된 일이 좋겠지요?' },
      { id: 'gard', t: '정원지기 앙쿠 · 물길을 손금 보듯 안다', m: 'water', h: '앙쿠는 물길을 잘 알아요.' },
      { id: 'boy', t: '소 치는 아이 파이 · 소들이 졸졸 따른다', m: 'cattle', h: '소들이 따르는 아이에게는…' },
      { id: 'weave', t: '베 짜는 여인 타뮈 · 손끝이 섬세하다', m: 'linen', h: '섬세한 손끝은 무엇을 짜는 데 쓰일까요?' },
      { id: 'scr', t: '서기관 이피 · 글과 셈을 안다 (눈은 침침하다)', m: 'ledger', h: '글과 셈을 아는 사람에게는 기록을 맡겨요. 대신 곳간은 함께 세어 주면 되지요.' }],
    means: [{ id: 'water', t: '밭과 정원 물대기' }, { id: 'feast', t: '잔치 음식 준비' }, { id: 'ledger', t: '곳간 기록 (요셉이 함께 셈)' }, { id: 'cattle', t: '외양간 돌보기' }, { id: 'linen', t: '세마포 짜기' }] },
  () => { say([T('일꾼들은 저마다 잘하는 일을 맡자 신이 나서 일했습니다. 보디발의 집이 하루가 다르게 달라졌습니다.')], () => tick(S, 'assign')); });
}
function quarrel(S, G) {
  const ck = G.npc('cook'), gd = G.npc('gardener'); if (ck) { ck.act = 'point'; ck.face = ck.homeFace = gd ? Math.atan2(gd.x - ck.x, gd.z - ck.z) : ck.face; } if (gd) { gd.act = 'point'; gd.face = gd.homeFace = ck ? Math.atan2(ck.x - gd.x, ck.z - gd.z) : gd.face; } /* v18.35 they stay where the player found them (the cook used to vanish to the pool) */
  say([N('cook', '연못 물을 부엌에 써야겠소! 잔치가 코앞인데 우물만으로는 모자라!', '', 'angry'), N('gardener', '안 되오! 연못 물을 퍼 가면 연꽃이 다 말라 죽소! 마님이 아끼시는 연꽃이란 말이오!', '', 'angry'),
    { n: '요셉', t: '어떻게 해결할까?', choices: [
      { t: '"아침에는 부엌이 우물물을 먼저 쓰고, 연못은 앙쿠가 돌보세요. 그리고 샤두프로 수로 물을 길어 올려 연못을 채웁시다."', ok: true },
      { t: '"헤누, 요리가 더 중요하니 연못 물을 쓰세요."', ok: false, fb: '앙쿠의 얼굴이 굳었습니다. 한쪽 편만 들면 다툼은 끝나지 않아요.' },
      { t: '"둘 다 그만! 오늘은 아무도 물을 쓰지 마시오."', ok: false, fb: '그러면 잔치도 정원도 망가져요. 둘 다 살리는 길은 없을까요?' }] },
    N('gardener', '샤두프로…? 아, 동쪽 담 곁의 그 두레박 장대 말이오? 그거면 수로 물을 금방 퍼 올리겠군!', '', 'happy'), N('cook', '흠… 아침에 우물을 먼저 쓴다면야. 좋소, 총무.', '', 'calm')],
  () => { const c = G.npc('cook'), g = G.npc('gardener'); if (c) { G.npcTo('cook', -10.8, 43.8, Math.PI, false); c.act = 'gather'; } if (g) { G.npcTo('gardener', -18.4, 61.2, -1.6, false); g.act = 'water'; } tick(S, 'quarrel'); });
}
steps.c2_manage.talk.gardener = steps.c2_manage.talk.gardener || ((S, G) => { if (S.q.quarrel) return false; quarrel(S, G); });
function cinBless(S, G, next) {
  cine([
    { cam: [16, hAt(6, 44) + 6, 52], cam2: [12, hAt(6, 44) + 4, 50], look: [6, hAt(6, 44) + 0.6, 44], dur: 7, music: 'j_house', hour: 9.5, t: '그가 요셉에게 자기 집과 그 모든 소유물을 주관하게 한 때부터, 여호와께서 요셉을 위하여 그 애굽 사람의 집에 복을 내리시므로', ref: '창세기 39:5',
      fn: () => { const pl = S.plots; for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) pl['pflax:' + i + ',' + j] = { s: 2, c: 'flax', st: 3, g: 0, w: 1 }; G.ENT.plotsDirty = true; } },
    { cam: [16, hAt(9, 76) + 3, 84], look: [9, hAt(9, 76) + 0.8, 76], dur: 6, t: '여호와의 복이 그의 집과 밭에 있는 모든 소유에 미친지라.', ref: '창세기 39:5' },
    { cam: [-26, hAt(-28, 41) + 2.4, 50.5], look: [-29, hAt(-28, 41) + 1.2, 40], dur: 7, t: '주인이 그 소유를 다 요셉의 손에 위임하고, 자기 식료 외에는 간섭하지 아니하였더라.', ref: '창세기 39:6' },
    { fn: () => place('wife', -20.6, 61.6, Math.PI), cam: [-23, hAt(-20, 60) + 1.5, 64.5], look: [-20.6, hAt(-20, 60) + 1.5, 61.6], dur: 6, fov: 0.6, t: '요셉은 용모가 준수하고 아담하였더라.', ref: '창세기 39:6' },
    { cam: [-19.6, hAt(-20, 60) + 1.6, 63.4], look: [-28, hAt(-28, 44) + 1.2, 44], dur: 6, fov: 0.55, t: '그리고 그 모습을, 연못가에서 한 여인이 오래도록 바라보고 있었습니다.' },
  ], next);
}
// c2_tempt3 → the garment (창 39:11–12)
/* v18.35 she calls him into the bedroom, shuts the way out and takes hold of his robe. The player wrenches free (A, five times): then the robe stays in her hand, she falls back, and the chase begins */
const GRAB = { x: -27.3, z: 29.9 }; /* (v18.72 set to where he stands when she catches him) */
function cinGrab(S, G) { /* v18.72 where he works (the ledger room): 39:12 only */
  const tx = GRAB.x, tz = GRAB.z, th = hAt(tx, tz), f = G.P.face, sx = Math.sin(f), sz = Math.cos(f), wx = tx - sx * 2.6 + sz * 0.6, wz = tz - sz * 2.6 - sx * 0.6;
  cine([
    { fn: () => { G.teleport(tx, tz, f); cpose('pick', 0, true); place('wife', wx, wz, Math.atan2(tx - wx, tz - wz)); }, cam: [tx + sz * 3.4, th + 1.7, tz - sx * 3.4], look: [tx, th + 1, tz], dur: 5, music: 'j_dread',
      t: '그러할 때에 요셉이 시무하러 그 집에 들어갔더니, 그 집 사람은 하나도 거기 없었더라.', ref: '창세기 39:11' },
    { fn: () => walkTo('wife', tx - sx * 1.05, tz - sz * 1.05, 1.1, () => face('wife', tx, tz)), cam: [tx - sz * 2.6, th + 1.5, tz + sx * 2.6], look: [tx - sx, th + 1.3, tz - sz], dur: 4.5 },
    { fn: () => { cpose(null); G.P.face = Math.atan2(-sx, -sz); }, cam: [tx + sz * 1.8 - sx * 0.6, th + 1.45, tz - sx * 1.8 - sz * 0.6], look: [tx, th + 1.4, tz], dur: 4.5, fov: 0.62, n: '보디발의 아내', t: '나와 동침하자.', ref: '창세기 39:12', e: 'whisper' },
    { fn: () => { emote('wife', 'grabCloth', 30); const n = G.npc('wife'); if (n) { n.x = tx - sx * 0.78; n.z = tz - sz * 0.78; n.col.x = n.x; n.col.z = n.z; n.face = n.homeFace = Math.atan2(sx, sz); } }, cam: [tx + sz * 1.9, th + 1.3, tz - sx * 1.9], look: [tx, th + 1.15, tz], dur: 3, t: '그 여인이 그 옷을 잡았습니다.', ref: '창세기 39:12', shake: 0.3, shakeDecay: 0.8 },
  ], () => G.go('c2_flee'));
}
function breakFree(S, G) { const n = G.npc('wife'), c = RT.chase, tx = G.P.x, tz = G.P.z, th = hAt(tx, tz); G.sfx('rip'); G.setOutfit('josephFled'); S.q.robe = 1; c.stun = 3.2; c.t = 0; if (n) { n.walk = null; n.act = null; n.emote = { k: 'grabCloth', t: 0, dur: 6 }; } /* v18.42 she stands holding the cloak (she was drawn fallen, like her false story) */ GG.UI.hint(null);
  cine([{ fn: () => { G.P.face = 2.6; }, cam: [tx - 3.2, th + 1.6, tz + 1.5], look: [tx - 0.9, th + 0.7, tz], dur: 4.4, shake: 0.4, shakeDecay: 1.2, t: '요셉이 자기의 옷을 그 여인의 손에 버려두고 밖으로 나가매', ref: '창세기 39:12' },
    garmentBeat(1, [tx - 1.1, th + 0.5, tz + 0.2], [tx - 0.2, th + 0.8, tz + 1.3], '두 번째 옷 · 이번에는 요셉이 스스로 내려놓았습니다. 죄 대신 옷을 잃기로 했습니다.'),
  ], () => { GG.UI.quest(); GG.UI.hint('달리기 버튼으로 뛰어요! 대문 밖까지!', 'flee', 'run'); }); }
// c2_flee done → accused and imprisoned (창 39:13–20)
function cinAccuse(S, G, next) {
  const hx = -28, hz = 41.6, hh = hAt(hx, hz), gx = SPOTS.pGate[0], gz = SPOTS.pGate[1], gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.empty = 0; place('wife', -27, 43, 0); emote('wife', 'cheer', 6); [['cook', -31, 46], ['gardener', -25.8, 47.4], ['maid', -29.4, 47.6], ['neb', -26.2, 48], ['ameni', -32.4, 47]].forEach(([id, x, z]) => place(id, x, z, Math.atan2(-27 - x, 43 - z))); G.teleport(gx + 0.6, gz + 2.6, 0); },
      cam: [hx + 5, hh + 2.2, hz + 9], cam2: [hx + 3.6, hh + 1.8, hz + 7], look: [-27, hh + 1.3, 44], dur: 6, sfx: 'crowd', t: '요셉이 그 옷을 자기 손에 버려두고 도망하여 나감을 보고, 집 사람들을 불러서', ref: '창세기 39:13–14' },
    { cam: [-25.2, hh + 1.5, 46], look: [-27, hh + 1.5, 43], dur: 9, fov: 0.65, n: '보디발의 아내', t: '보라! 주인이 히브리 사람을 우리에게 데려다가 우리를 희롱하게 하도다. 그가 나를 겁간코자 내게로 들어오기로 내가 크게 소리질렀더니, 그가 나의 소리질러 부름을 듣고 그 옷을 내게 버려두고 도망하여 나갔느니라!', ref: '창세기 39:14–15', e: 'shout' },
    { cam: [-33.6, hh + 1.5, 48.6], look: [-32.4, hh + 1.5, 47], dur: 5, fov: 0.6, n: '늙은 종 아메니', t: '(…요셉이 그럴 리가 없어. 그 아이는…)', e: 'whisper' },
    { hour: 18.8, fn: () => { place('potiphar', gx, gz + 4, Math.PI); walkTo('potiphar', -27.4, 45.6, 1.6, () => face('potiphar', -27, 43)); place('pg1', gx - 1.4, gz + 3.6, Math.PI); place('pg2', gx + 1.4, gz + 3.6, Math.PI); G.npcShow('pg1', true); G.npcShow('pg2', true); },
      cam: [gx + 3, gh + 2, gz - 6], look: [gx, gh + 1.3, gz + 1], dur: 6, t: '옷을 곁에 두고 자기 주인이 집으로 돌아 오기를 기다려', ref: '창세기 39:16' },
    { cam: [-25.6, hh + 1.6, 44.8], look: [-29, hh + 1.5, 42], dur: 8, n: '보디발의 아내', t: '당신이 우리에게 데려온 히브리 종이 나를 희롱코자 내게로 들어 왔기로, 내가 소리질러 불렀더니 그가 그 옷을 내게 버려두고 도망하여 나갔나이다.', ref: '창세기 39:17–18', e: 'cry' },
    { cam: [-26.4, hh + 1.6, 47.8], look: [-27.4, hh + 1.6, 45.6], dur: 7, fov: 0.6, t: '주인이 그 아내가 자기에게 고하기를 「당신의 종이 내게 이같이 행하였다」 하는 말을 듣고 심히 노한지라.', ref: '창세기 39:19' },
    { fn: () => { G.teleport(-27.6, 49.4, Math.PI); cpose(null); }, cam: [-26.2, hh + 1.6, 51.4], look: [-27.6, hh + 1.5, 49.4], dur: 6, t: '요셉은 아무 말도 하지 않았습니다. 무슨 말을 한들, 종의 말을 누가 믿어 줄까요.' },
    { cam: [-28.6, hh + 1.6, 47.6], look: [-27.4, hh + 1.6, 45.6], dur: 6, n: '보디발', t: '……이자를 묶어라. 왕의 옥에 넣어라.', e: 'cold' },
    { fn: () => { G.setOutfit('josephPrisoner'); cpose(null); /* v18.14 no shackles */ walkTo('pg1', -28.8, 49.8, 2); walkTo('pg2', -26.4, 49.8, 2); }, cam: [-24, hh + 2, 52], look: [-27.6, hh + 1.2, 49.4], dur: 8,
      t: '요셉의 주인이 그를 잡아 옥에 넣으니, 그 옥은 왕의 죄수를 가두는 곳이었더라. 요셉이 옥에 갇혔으나', ref: '창세기 39:20', fadeOut: 1.6 },
    { black: true, title: '3장 · 왕의 옥', sub: '창세기 39:20–41:14', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4, fn: () => { stage(S, G); } },
    { hour: 21.4, fn: () => { G.teleport(-18.4, -6.2, Math.PI); cpose(null); G.sfx('door'); }, fadeIn: 1.6, music: 'j_prison',
      cam: [-18.4, hAt(-18.4, -6) + 1.6, -1.6], look: [-18.4, hAt(-18.4, -6) + 1.0, -6.4], dur: 8, t: '「그의 발은 차꼬를 차고, 그의 몸은 쇠사슬에 매였으니」', ref: '시편 105:18' },
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
        t: '여호와께서 요셉과 함께하시고 그에게 인자를 더하사, 전옥에게 은혜를 받게 하시매', ref: '창세기 39:21' },
    ], () => { cpose(null); RT.grace = 0; G.newDay('옥에서의 아침'); G.go('c3_keeper'); });
  } else {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6.5, n: '요셉', t: '하나님, 술 맡은 관원장이 떠난 지 벌써 두 해가 다 되어 가요.', e: 'weary' },
      { cam: [-19.8, h + 0.9, -6.6], look: [-18.4, h + 1.1, -8.3], dur: 7, n: '요셉', t: '날마다 문소리가 나면 혹시나 했어요. …이제는 그 문소리가 무서워요.', e: 'sad' },
      { cam: [-18.0, h + 1.1, -7.1], look: [-18.4, h + 1.2, -8.3], dur: 6.5, fov: 0.58, n: '요셉', t: '그래도… 하나님은 저를 잊지 않으셨죠? 사람은 잊어도요.', e: 'cry' },
      { cam: [-18.6, h + 0.5, -6.4], look: [-18.4, h + 2.6, -9.6], dur: 10, each: t => { RT.grace = Math.min(0.7, t / 8); },
        t: '그날 밤 요셉은 원망 대신 감사로 기도를 마쳤습니다. 오늘도 살아 있게 하신 것과, 어린 타후에게 이야기를 들려줄 수 있었던 것과, 늙은 죄수가 웃으며 문을 나선 것을.' },
    ], () => { cpose(null); RT.grace = 0; S.q.wReady = 0; waitNext(S, G); });
  }
}
const GIVE_T = { prisA: ['…고맙다. 너 같은 녀석은 처음 본다.', '떡이다! 오늘은 좀 크구나.'], prisB: ['물이다! 살겠다…', '고맙다, 히브리 사람.'], oldP: ['…물… 고맙구나…', '…떡…'], prisD: ['고맙소. 나는 곧 나간다오.', '마지막 떡이로군. 고맙소.'] };
function cellGive(S, G, i) {
  const id = CELL_IDS[i], keeper = S.step === 'c3_keeper';
  if (keeper) { if (S.water < 1) { G.UI.toast('물이 없어요 · 마당의 대야에서 물을 길어 오세요'); return; } S.water--; (S.q.gave = S.q.gave || {})[i] = 1; act('water', 0.7, 'jar'); G.UI.hud(); }
  else { (S.q.fed = S.q.fed || {})[i] = 1; act('pick', 0.7); if (Object.keys(S.q.fed).length >= 4) { G.P.carry = null; } }
  bubble(id, GIVE_T[id][keeper ? 0 : 1], 3); G.UI.quest(); G.checkStep();
}
function fight(S, G) { /* v18.73 no made-up words of Joseph's: he settles it as the one in charge (39:22), the narration tells it
     · v18.75 a quarrel that can happen between two locked cells: right after the bread is handed out, each thinks the other got more.
       They stand at the bars facing each other (e_ch3.js fightPose3); Joseph sets the two portions side by side */
  if (typeof fightPose3 === 'function') fightPose3(true);
  say([N('prisA', '어이, 메루! 네 떡이 내 것보다 크잖아! 총무가 너만 챙겨 줬지?', '', 'angry'), N('prisB', '무슨 소리야, 케티! 네 물그릇이 더 가득했다고!', '', 'angry'),
    { n: '', t: '요셉이 두 감방의 떡과 물그릇을 창살 앞에 나란히 놓고 견주어 보았습니다. 떡도 물도 똑같았습니다.', fn: () => { G.P.emote = { k: 'pick', t: 0, dur: 1.4 }; } },
    T('간수장이 옥중 죄수를 다 요셉의 손에 맡기므로 그 제반 사무를 요셉이 처리하고', '창세기 39:22'),
    N('prisA', '……똑같네. 배가 고프니 남의 떡이 커 보였나 보다. 미안하다, 메루.', '', 'sad'), N('prisB', '…나도 소리친 거 미안하다, 케티.', '', 'sad')], () => { tick(S, 'fight'); if (typeof fightPose3 === 'function') fightPose3(false); });
}


function cinOfficers(S, G) {
  const gx = -30, gz = 14, gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.potPrison = 1; place('potiphar', gx, gz + 3.4, Math.PI); place('cupbearer', gx - 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('baker', gx + 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('pg1', gx - 2.4, gz + 3.2, Math.PI); place('pg2', gx + 2.4, gz + 3.2, Math.PI);
        G.teleport(gx, gz - 4.4, 0); G.sfx('door'); },
      cam: [gx + 5, gh + 2.2, gz - 7], cam2: [gx + 3.6, gh + 1.8, gz - 5.6], look: [gx, gh + 1.3, gz + 2], dur: 7, music: 'j_dread', t: '그 후에 애굽왕의 술 맡은 자와 떡 굽는 자가 그 주 애굽왕에게 범죄한지라. 바로가 그 두 관원장 곧 술 맡은 관원장과 떡 굽는 관원장에게 노하여', ref: '창세기 40:1–2' },
    { cam: [gx - 2.6, gh + 1.5, gz - 1.6], look: [gx, gh + 1.4, gz + 2.4], dur: 6, t: '그들을 시위대장의 집 안에 있는 옥에 가두니, 곧 요셉의 갇힌 곳이라.', ref: '창세기 40:3' },
    { fn: () => walkTo('potiphar', gx, gz - 1.6, 1.4, () => face('potiphar', gx, gz - 4.4)), cam: [gx + 2.4, gh + 1.6, gz - 6], look: [gx, gh + 1.5, gz - 1], dur: 6, },
    { cam: [gx - 1.4, gh + 1.6, gz - 0.6], look: [gx, gh + 1.5, gz - 4.4], dur: 4.5, fov: 0.6, },
    /* (v18.72 the long look between Potiphar and Joseph was not in Scripture) */
    { cam: [gx + 1.2, gh + 1.6, gz - 6.2], look: [gx, gh + 1.6, gz - 1.6], dur: 7, t: '시위대장이 요셉에게 그들을 수종하게 하였습니다.', ref: '창세기 40:4' },
    { fn: () => { walkTo('potiphar', gx, gz + 6, 1.6); place('cupbearer', CELL[3][0] - 1.1, CELL[3][1] - 0.2, 0); place('baker', CELL[3][0] + 1.1, CELL[3][1] - 0.4, 0); },
      cam: [CELL[3][0] + 1, hAt(CELL[3][0], -3) + 1.6, -2.4], look: [CELL[3][0], hAt(CELL[3][0], -8) + 1.1, -8], dur: 6, t: '시위대장이 요셉으로 그들에게 수종하게 하매 요셉이 그들을 섬겼더라.', ref: '창세기 40:4' },
  ], () => { S.q.potPrison = 0; GG.Game.musicOverride = null; stage(S, G); });
}
// the officers' dreams (창 40:5–19)
const DREAM = { x: DWX, z: DWZ - 72 };
function dreamShots(kind, lines) { const h = hAt(DREAM.x, DREAM.z);
  return lines.map((l, i) => Object.assign({ cam: [DREAM.x + 4.4 - i * 1.2, h + 1.6 + i * 0.2, DREAM.z + 4.2 - i * 0.6], cam2: [DREAM.x + 3.6 - i * 1.2, h + 1.8 + i * 0.25, DREAM.z + 3.4 - i * 0.6], look: [DREAM.x, h + 1.2, DREAM.z], dur: 6.5,
    each: t => { RT.dreamK = Math.min(1, (i + t / 6.5) / lines.length * 1.1); } }, l, i === 0 ? { fn: () => { RT.dreamFx = kind; RT.dreamK = 0; }, fadeIn: 1.2, music: 'j_dream' } : {})); }
function cupDream(S, G) {
  say([J('오늘 어찌하여 근심 빛이 있나이까?', '창세기 40:7', 'tender'), N('cupbearer', '우리가 꿈을 꾸었으나 이를 해석할 자가 없도다.', '창세기 40:8', 'sad'),
    { n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '해석은 하나님께 있지 아니하니이까? 청컨대 내게 고하소서…', ok: true, ref: '창세기 40:8' },
      { t: '"제가 꿈을 잘 풉니다. 말씀해 보세요."', ok: false, fb: '요셉은 알고 있었습니다. 꿈을 푸는 지혜는 자기 것이 아니라 하나님께 있다는 것을.' }] },
    J('해석은 하나님께 있지 아니하니이까? 청컨대 내게 고하소서…', '창세기 40:8'),
    T('관원장이 꿈을 이야기하는 동안, 요셉은 하나님께 지혜를 구했습니다. 「꿈의 세계」 단추로 그 꿈을 함께 보아요.', '창세기 40:8–9')], () => { S.q.dreamGo = 'vine'; G.UI.quest(); }); }
/* v18.35 the dream is first seen, in the dream land: it grows before your eyes, and then God shows what it means; only after that does Joseph tell it */
function vineVision(S, G) { const x = DREAM.x, z = DREAM.z, h = hAt(x, z); G.P.face = Math.atan2(x - G.P.x, z - G.P.z); const dawn = (t, a, b) => { GG.DW.dawn = t > a && t < b ? Math.sin((t - a) / (b - a) * Math.PI) : 0; };
  cine([
    { fn: () => { RT.dreamFx = 'vine'; RT.dreamK = 0; RT.godRay = 0; }, cam: [x + 7, h + 2.6, z + 8], cam2: [x + 4.6, h + 2, z + 5.6], look: [x, h + 1.3, z], dur: 7, fadeIn: 1, music: 'j_dream', n: '술 맡은 관원장', t: '꿈에 보니 내 앞에 포도나무가 있는데, 그 나무에 세 가지가 있고', ref: '창세기 40:9–10', each: t => { RT.dreamK = Math.min(0.3, t / 7 * 0.3); } },
    { cam: [x + 2.6, h + 1.5, z + 3.4], cam2: [x + 2, h + 1.7, z + 2.8], look: [x + 0.2, h + 1.7, z], dur: 7, n: '술 맡은 관원장', t: '싹이 나서 꽃이 피고, 포도송이가 익었고', ref: '창세기 40:10', sfx: 'insight', each: t => { RT.dreamK = 0.3 + t / 7 * 0.6; if (Math.random() < 0.3) G.FX.burst(x + (Math.random() - 0.5) * 2.4, h + 1 + Math.random() * 1.6, z + (Math.random() - 0.5) * 2.4, 2, { c: [1, 0.9, 0.7], sp: 0.3, up: 0.6, g: -0.1, life: 1.6, size: 0.1 }); } },
    { cam: [x - 2.8, h + 1.6, z + 2.6], look: [x + 0.55, h + 1.3, z + 0.5], dur: 8, n: '술 맡은 관원장', t: '내 손에 바로의 잔이 있기로, 내가 포도를 따서 그 즙을 바로의 잔에 짜서, 그 잔을 바로의 손에 드렸노라.', ref: '창세기 40:11', each: t => { RT.dreamK = 1; } },
    { fn: () => { RT.godRay = 0.01; G.sfx('insight', { pitch: 0.6 }); }, cam: [x + 8, h + 1.1, z + 9], cam2: [x + 9, h + 3, z + 10], look: [x, h + 4, z], dur: 6.5, t: '요셉은 꿈을 지켜보며 마음속으로 하나님께 지혜를 구했습니다.', e: 'solemn', each: t => { RT.godRay = Math.min(1, t / 3); } },
    { cam: [x + 6, h + 2, z + 7], look: [x, h + 2, z], dur: 9, t: '기도하자, 그 뜻이 마음에 또렷해졌습니다. 세 가지는… 사흘이었습니다.', e: 'solemn', each: t => { dawn(t, 0.4, 2.8); dawn2(t); } },
    { cam: [x + 2.4, h + 1.6, z + 3], look: [x, h + 1.6, z], dur: 7.5, fadeOut: 1.4, t: '사흘 안에 술 맡은 관원장이 다시 바로의 잔을 받들게 되리라는 것을, 요셉은 깨달았습니다.', e: 'solemn', each: t => { GG.DW.dawn = 0; RT.godRay = 1 - t / 7.5 * 0.6; } },
  ], () => { RT.dreamFx = null; RT.godRay = 0; GG.DW.dawn = 0; S.q.dreamGo = null; S.q.cupSeen = 1; GG.DW.exit(() => cupTell(S, G)); }); function dawn2(t) { if (t > 3 && t < 5.5) dawn(t, 3, 5.5); else if (t > 6 && t < 8.6) dawn(t, 6, 8.6); } }
function cupTell(S, G) { say([T('요셉은 눈을 떴습니다. 꿈의 뜻이 마음에 또렷이 남아 있었습니다.')], () => { say([
    { n: '요셉', t: '세 가지는 무엇을 뜻할까?', choices: [{ t: '사흘', ok: true }, { t: '세 해', ok: false, fb: '기도할 때 마음에 또렷해진 뜻을 떠올려 보세요. 해석은 하나님께 있습니다 (창세기 40:8).' }, { t: '세 사람', ok: false, fb: '가지가 자라 열매 맺기까지의 「때」를 생각해 보세요.' }] },
    J('그 해석이 이러하니, 세 가지는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 들고 당신의 전직을 회복하리니, 당신이 이왕에 술 맡은 자가 되었을 때에 하던것 같이 바로의 잔을 그 손에 받들게 되리이다.', '창세기 40:12–13'),
    J('당신이 득의하거든 나를 생각하고 내게 은혜를 베풀어서, 내 사정을 바로에게 고하여 이 집에서 나를 건져내소서…', '창세기 40:14', 'urgent'),
    J('나는 히브리 땅에서 끌려온 자요, 여기서도 옥에 갇힐 일은 행치 아니하였나이다.', '창세기 40:15', 'sad')], () => tick(S, 'cupDone')); });
}
function bakerDream(S, G) {
  say([N('baker', '(해석이 좋은 것을 보고) 나도 꿈에 보았네! 나도 좀 풀어 주게.', '창세기 40:16'), T('떡 굽는 관원장이 꿈을 이야기하는 동안, 요셉은 다시 하나님께 지혜를 구했습니다. 「꿈의 세계」 단추로 그 꿈을 함께 보아요.')], () => { S.q.dreamGo = 'baskets'; G.UI.quest(); }); }
function basketVision(S, G) { const x = DREAM.x, z = DREAM.z, h = hAt(x, z); G.P.face = Math.atan2(x - G.P.x, z - G.P.z);
  cine([
    { fn: () => { RT.dreamFx = 'baskets'; RT.dreamK = 0; }, cam: [x + 5, h + 2, z + 6], cam2: [x + 3.4, h + 2.3, z + 4.4], look: [x, h + 1.9, z], dur: 7, fadeIn: 1, music: 'j_dread', n: '떡 굽는 관원장', t: '흰 떡 세 광주리가 내 머리에 있고', ref: '창세기 40:16' },
    { cam: [x + 2, h + 2.6, z + 2.6], look: [x, h + 2.2, z], dur: 7, n: '떡 굽는 관원장', t: '윗광주리에 바로를 위하여 만든 각종 구운 식물이 있는데', ref: '창세기 40:17' },
    { cam: [x - 3, h + 1.2, z + 3.4], look: [x, h + 2.8, z], dur: 8, shake: 0.1, sfx: 'flap', n: '떡 굽는 관원장', t: '새들이 내 머리의 광주리에서 그것을 먹더라.', ref: '창세기 40:17', each: t => { RT.dreamK = Math.min(1, t / 6); if (Math.random() < 0.3) G.FX.burst(x + (Math.random() - 0.5) * 1, h + 2.2, z + (Math.random() - 0.5) * 1, 2, { c: [0.1, 0.09, 0.1], sp: 0.8, up: 0.6, size: 0.1, g: 3, life: 0.9 }); } },
    { fn: () => { RT.godRay = 0.01; G.sfx('insight', { pitch: 0.45 }); }, cam: [x + 8, h + 1.1, z + 9], look: [x, h + 3.4, z], dur: 6.5, t: '요셉은 다시 하나님께 구했습니다. 이번에 마음에 새겨진 뜻은 무겁고 슬펐습니다.', e: 'solemn', each: t => { RT.godRay = Math.min(0.6, t / 4); } },
    { cam: [x + 2.4, h + 1.7, z + 3], look: [x, h + 2, z], dur: 8, fadeOut: 1.4, t: '세 광주리도 사흘이었습니다. 그러나 그 끝은… 요셉은 한동안 입을 열 수 없었습니다.', e: 'solemn' },
  ], () => { RT.dreamFx = null; RT.godRay = 0; S.q.dreamGo = null; S.q.bakeSeen = 1; GG.DW.exit(() => bakerTell(S, G)); }); }
function bakerTell(S, G) { say([T('요셉은 한참을 말없이 앉아 있었습니다. 그래도 하나님이 보이신 것을 거짓으로 말할 수는 없었습니다.')], () => { say([
    T('요셉의 얼굴이 굳어졌습니다. 하나님이 보이신 뜻은 좋은 소식이 아니었습니다.'),
    { n: '요셉', t: '어떻게 할까?', choices: [{ t: '하나님이 보이신 대로 정직하게 말한다', ok: true }, { t: '좋은 꿈이라고 둘러댄다', ok: false, fb: '듣기 좋은 거짓말은 그 사람을 준비하지 못하게 해요. 하나님이 보이신 것을 요셉은 바꿀 수 없었습니다.' }] },
    J('그 해석은 이러하니, 세 광주리는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 끊고 당신을 나무에 달리니, 새들이 당신의 고기를 뜯어 먹으리이다.', '창세기 40:18–19', 'solemn'),
    N('baker', '……', '', 'fear')], () => tick(S, 'bakeDone')); });
}
function cinBirthday(S, G, next) {
  const px = -30, pz = -176.8, ph = hAt(px, -176) + 1.1, ch = hAt(-30, 10);
  cine([
    { hour: 9, fn: () => { place('messenger', -30, 12.6, Math.PI); place('cupbearer', -30, 8, 0); place('baker', -27.6, 8.6, 0, { act: 'bound' }); G.teleport(-30, 4.6, 0); }, cam: [-34, ch + 2, 2], look: [-30, ch + 1.3, 9], dur: 7,
      t: '제 삼일은 바로의 탄일이라. 바로가 모든 신하를 위하여 잔치할 때에', ref: '창세기 40:20' },
    { fn: () => walkTo('cupbearer', -30, 15.5, 1.6, () => face('cupbearer', -30, 4.6)), cam: [-31.6, ch + 1.6, 3.4], look: [-30, ch + 1.5, 4.6], dur: 4.5, },
    { fn: () => emote('cupbearer', 'wave', 3), cam: [-28.6, ch + 1.6, 11.6], look: [-30, ch + 1.5, 15.5], dur: 5, },
    { fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('cupbearerC', px + 1.6, -173.6, -2.6, { act: 'present' }); }, cam: [px + 5, ph + 1.4, -168], look: [px, ph + 0.8, pz + 1], dur: 7, music: 'j_court',
      t: '술 맡은 관원장은 전직을 회복하매, 그가 잔을 바로의 손에 받들어 드렸고', ref: '창세기 40:21' },
    { fn: () => { const n = G.npc('baker'); if (n) n.forceVis = false; }, cam: [CELL[3][0] + 0.8, hAt(CELL[3][0], -4) + 1.5, -3], look: [CELL[3][0], hAt(CELL[3][0], -8) + 0.8, -8.2], dur: 6,
      t: '떡 굽는 관원장은 매달리니, 요셉이 그들에게 해석함과 같이 되었으나', ref: '창세기 40:22' },
    { fn: () => { const n = G.npc('cupbearerC'); if (n) { n.act = 'laugh'; } ['magician', 'sage'].forEach(id => emote(id, 'laugh', 6)); }, cam: [px + 4.5, ph + 2.4, -163.5], cam2: [px + 3.5, ph + 1.7, -167], look: [px + 1.6, ph + 0.4, -173.6], dur: 9, fadeOut: 2, music: '',
      t: '술 맡은 관원장이 요셉을 기억지 않고 잊었더라.', ref: '창세기 40:23', e: 'solemn' },
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
  fade(() => { S.day += 60; S.time = GG.Game.clockTo(S, (S.q.wait === 3 ? 20.4 : 8.5), S.q.wait !== 3); if (S.q.wait === 2) S.q.oldGone = 1; }, () => narr([SEASON[S.q.wait]], () => G.UI.quest()));
}
steps.c3_wait.talk = {
  youngP(S, G) { if ((S.q.wait || 0) !== 0) return false;
    say([N('youngP', '…엄마… 엄마…', '', 'cry'), N('youngP', '…타후예요. 빵 하나 훔쳤다고… 여기 갇혔어요.', '', 'cry'), T('요셉은 어린 죄수 곁에 앉아 그를 달랬습니다. 자기 몫의 물도 건넸습니다.')], () => waitNext(S, G)); },
  _oldYoungP(S, G) { say([
      J('타후. 내 동생 베냐민도 지금쯤 너만 하겠구나. …나도 처음 여기 왔을 때 많이 무서웠어.', '', 'tender'),
      /* v18.48 the choice on the caravan night comes back here (a save from before that choice has no such line) */ ...(S.q.tookWater === undefined ? [] : [J(S.q.tookWater ? '이 땅으로 끌려오던 밤에, 꼭 너만 한 아이가 내게 물을 건넸단다. 그 한 모금을 잊은 적이 없어. …자, 내 물이야. 마시렴.' : '이 땅으로 끌려오던 밤에, 꼭 너만 한 아이가 내게 물을 건넸는데… 나는 고개를 돌렸어. 그런데도 그 아이는 물을 내 곁에 두고 갔지. …자, 내 물이야. 마시렴.', '', 'tender')]),
      N('youngP', '형도요? 형은 어른이잖아요.', ''),
      J('무서울 땐 이렇게 해 봐. 하늘을 보고 「여호와여」 하고 불러. 우리 아버지가 그랬어. 어디에 있든지 함께 계시는 분이라고.', '', 'tender'),
      N('youngP', '…여호와. 여기에도요?', ''), J('응. 구덩이 속에도 계셨어. 내가 알아.', '', 'calm')], () => waitNext(S, G)); },
  oldP(S, G) { if ((S.q.wait || 0) !== 1) return false;
    say([N('oldP', '요셉… 오늘 내가 나간다. 앓아누웠던 이 늙은이를 살린 건 너였어.', '', 'tender'),
      N('oldP', '그래, 네 하나님. …얘야, 그 관원장 녀석이 너를 잊었다고 낙심하지 마라.', '', 'tender'),
      N('oldP', '네가 늘 말하던 그 하나님 말이다. 네 말대로라면, 그분은 너를 잊지 않으셨겠지.', '', 'tender'),
      T('파네브는 요셉의 손을 오래도록 붙잡았습니다.')], () => waitNext(S, G)); },
  keeper(S, G) { if ((S.q.wait || 0) !== 3) return false;
    say([N('keeper', '요셉, 잠이 안 오는구나. 나도 그렇다.', '', 'calm'), N('keeper', '너는 왜 원망하지 않느냐? 그 관원장 녀석은 너를 까맣게 잊었을 텐데.', '', 'calm'),
      { n: '요셉', t: '요셉은 무엇이라 대답할까?', choices: [{ t: '"원망한 날도 있었어요. 그래도… 하나님은 구덩이에서도, 보디발의 집에서도, 여기서도 저를 떠나지 않으셨어요."', ok: true },
        { t: '"원망 같은 건 해 본 적 없어요."', ok: false, fb: '그건 정직한 대답이 아니었어요. 요셉도 사람이었고, 울며 기도한 밤들이 있었습니다.' }] },
      N('keeper', '…네 하나님이 부럽구나. 애굽의 신들은 옥에 갇힌 자를 찾아오지 않는다.', '', 'tender'), T('그 밤, 나일 강 건너 바로의 궁에서는 한 왕이 잠 못 이루고 있었습니다.', '창세기 41:1')], () => waitNext(S, G)); },
};
function scratchWall(S, G) {
  G.P.face = -1.57;
  GG.UI.minigame('count', { title: '벽에 날들을 새기기', hint: '돌 조각으로 벽에 금을 그어 지난 달들을 세어요.', need: 8, btn: '새기기', onPress: () => { cpose('scratchWall', 0.6); G.sfx('scratch'); } }, () => {
    say([T('여덟 줄, 또 여덟 줄, 그리고 또 여덟 줄. 벽은 금으로 가득했습니다. 스물넷 · 두 해가 지났습니다.')], () => { S.q.wReady = 1; G.UI.quest(); }); });
}
// Pharaoh's dreams and the cupbearer remembers (창 41:1–14)
function cinPharaohDream(S, G) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1;
  cine([
    { hour: 5.6, fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('magician', -36.5, -171, 0.7); place('sage', -23.5, -171, -0.7); place('cupbearerC', -26, -169, -0.4); },
      cam: [px + 3.4, ph + 1.3, pz + 3.4], cam2: [px + 2.4, ph + 1.1, pz + 2.4], look: [px, ph + 1.2, pz], dur: 7, music: 'j_dream', t: '만 이년 후에 바로가 꿈을 꾼즉, 자기가 하숫가에 섰는데', ref: '창세기 41:1' },
    { cam: [px + 4, ph + 3, -162], look: [px, ph + 0.8, pz + 2], dur: 8, music: 'j_court', t: '아침에 그 마음이 번민하여, 보내어 애굽의 술객과 박사를 모두 불러 그들에게 그 꿈을 고하였으나, 그것을 바로에게 해석하는 자가 없었더라.', ref: '창세기 41:8' },
    { cam: [-35, hAt(-36, -171) + 1.6, -168.6], look: [-36.5, hAt(-36, -171) + 1.5, -171], dur: 5, n: '애굽의 점술가', t: '…바로여, 그 꿈은 저희 지혜로는…', e: 'fear', fn: () => emote('magician', 'bow', 3) },
    { fn: () => walkTo('cupbearerC', px + 1, -172.4, 1.4, () => { face('cupbearerC', px, pz); emote('cupbearerC', 'bow', 2); }), cam: [px + 3.2, ph, -168], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 6, n: '술 맡은 관원장', t: '내가 오늘날 나의 허물을 추억하나이다.', ref: '창세기 41:9', e: 'solemn' },
    { cam: [px - 2.4, ph, -169.6], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 10, n: '술 맡은 관원장', t: '그곳에 시위대장의 종된 히브리 소년이 우리와 함께 있기로, 우리가 그에게 고하매 그가 우리의 꿈을 풀되 그 꿈대로 각인에게 해석하더니, 그 해석한대로 되어 나는 복직하고 그는 매여 달렸나이다.', ref: '창세기 41:12–13' },
    { cam: [px + 1.6, ph + 0.9, pz + 2.6], look: [px, ph + 1.3, pz], dur: 5, fov: 0.6, n: '바로', t: '그를 부르라.', ref: '창세기 41:14', e: 'solemn' },
    { hour: 6.6, fn: () => { S.q.pharShow = 0; const [bx, bz] = SPOTS.basin; G.teleport(bx + 1.2, bz, -1.57); cpose('gather', 5); if (S.q.youngIn) place('youngP', bx + 2.4, bz + 1.3, -2.2); }, music: 'j_prison', /* v18.70 the same morning in the prison */
      cam: [SPOTS.basin[0] + 4.2, hAt(SPOTS.basin[0], SPOTS.basin[1]) + 1.6, SPOTS.basin[1] - 2.8], look: [SPOTS.basin[0] + 1.2, hAt(SPOTS.basin[0], SPOTS.basin[1]) + 1, SPOTS.basin[1]], dur: 6.5, t: '그 시각, 옥에서는 요셉이 여느 아침처럼 대야에서 물을 긷고 있었습니다. 아무것도 모른 채.' },
    { cam: [-30, hAt(-30, 14) + 2.4, 20], cam2: [-30, hAt(-30, 14) + 1.8, 17], look: [-30, hAt(-30, 14) + 1.4, 12], dur: 6, hour: 7.2, sfx: 'door', fn: () => { G.teleport(-30, 6, 0); place('messenger', -29, 11, Math.PI); },
      t: '바로가 보내어 요셉을 부르매, 그들이 급히 그를 옥에서 낸지라.', ref: '창세기 41:14' },
    { black: true, title: '4장 · 바로의 꿈', sub: '창세기 41:14–45', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4 },
  ], () => { S.q.pharShow = 0; GG.Game.musicOverride = null; G.go('c4_shave'); });
}

// ------------------------------------------------------------------ 4장 · Pharaoh's court
function shaveScene(S, G) {
  const [bx, bz] = SPOTS.basin, h = hAt(bx, bz);
  cine([
    { fn: () => { G.teleport(bx + 1.2, bz, -1.57); cpose('gather', 3); }, cam: [bx + 3.2, h + 1.4, bz + 2], look: [bx, h + 0.8, bz], dur: 5, sfx: 'water', t: '요셉이 곧 수염을 깎고', ref: '창세기 41:14' },
    { fn: () => cpose('shave', 0, true), cam: [bx + 2.2, h + 1.6, bz - 0.6], look: [bx + 1.2, h + 1.5, bz], dur: 5, fov: 0.6 },
    { fn: () => { cpose(null); G.setOutfit('josephShaved'); G.sfx('whoosh'); G.FX.burst(bx + 1.2, h + 1, bz, 20, { c: [1, 0.95, 0.8], sp: 1.4, up: 1.4 }); }, cam: [bx + 3.4, h + 1.5, bz + 1.4], look: [bx + 1.2, h + 1.1, bz], dur: 5, t: '옷을 갈아 입고 바로에게 들어오니', ref: '창세기 41:14' },
    { fn: () => { place('youngP', bx + 4, bz + 2.4, -2, { vis: true }); place('keeper', bx + 3.4, bz - 1.6, -1.2); }, cam: [bx + 4.6, h + 1.5, bz + 4.4], look: [bx + 2.4, h + 1.2, bz + 1], dur: 5, n: '어린 죄수', t: '형… 가는 거야? 진짜 가는 거야?', e: 'cry' },
    { cam: [bx + 0.6, h + 1.5, bz + 2.2], look: [bx + 2.4, h + 1.2, bz + 1.6], dur: 6, n: '요셉', t: '응. 하나님이 문을 여셨어. 타후, 너도 꼭 기도해. 그분은 너도 잊지 않으셔.', e: 'tender' },
    { cam: [bx + 5.6, h + 1.6, bz - 2], look: [bx + 3.4, h + 1.5, bz - 1.6], dur: 5, n: '간수장', t: '…가거라, 요셉. 너는 원래부터 여기 있을 사람이 아니었다.', e: 'tender' },
  ], () => { const y = G.npc('youngP'); if (y) y.forceVis = undefined; fade(() => { G.teleport(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 2, Math.PI); S.time = GG.Game.clockTo(S, 9, 1); GG.Game.musicOverride = 'j_court'; }, () => G.go('c4_court')); });
}
function courtIntro(S, G, next) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  G.P.face = Math.PI;
  cine([
    { fn: () => { place('pharaoh', px, pz, 0, { sit: true }); }, cam: [cx + 6, chh + 3.4, cz + 10], cam2: [cx + 3, chh + 2.4, cz + 5], look: [px, ph + 1, pz], dur: 7, music: 'j_court',
      t: '요셉이 바로에게 들어가니', ref: '창세기 41:14' },
    { cam: [px + 1.8, ph + 1.0, pz + 3.4], look: [px, ph + 1.3, pz], dur: 9, fov: 0.62, n: '바로', t: '내가 한 꿈을 꾸었으나 그것을 해석하는 자가 없더니, 들은즉 너는 꿈을 들으면 능히 푼다더라.', ref: '창세기 41:15', e: 'solemn' },
  ], () => say([{ n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '이는 내게 있는 것이 아니라 하나님이 바로에게 평안한 대답을 하시리이다.', ok: true, ref: '창세기 41:16' },
    { t: '"그렇습니다. 저는 어떤 꿈이든 풀 수 있습니다."', ok: false, fb: '이 년 전 옥에서처럼, 요셉은 공을 자기에게 돌리지 않았습니다.' }] },
    J('이는 내게 있는 것이 아니라 하나님이 바로에게 평안한 대답을 하시리이다.', '창세기 41:16', 'solemn'),
    N('pharaoh', '…좋다. 들어라. 내가 꿈에 나일 강 가에 서서 보니…', '창세기 41:17', 'awe')], next));
}
// c4_vision · walk inside Pharaoh's dream by the Nile (창 41:17–24)
/* v18.35 in the dream land by the dream Nile (it was a sloping bank of the real map: grass hung in the air, the camera dived into the ground) */
const VX = x => DWX - 70 + (x + 78), VZ = z => DWZ + 10 + (z + 204);
const VISION = [{ id: 'nile', x: VX(-84), z: VZ(-192) }, { id: 'fat', x: VX(-86), z: VZ(-204) }, { id: 'thin', x: VX(-86), z: VZ(-215) }, { id: 'good', x: VX(-73), z: VZ(-211) }, { id: 'blight', x: VX(-69), z: VZ(-197) }];
function visionEnter(S, G, re) {
  const go = () => { S.q.vision = 1; S.time = GG.Game.clockTo(S, 6.9, 1); GG.DW.ensure(); G.teleport(VX(-80), VZ(-189), -2.4); G.P.y = G.P.airTop = hAt(VX(-80), VZ(-189)); document.body.classList.add('dreamOn'); spawnCows(G); G.UI.hint('꿈속의 빛나는 곳으로 걸어가세요', 'vision', 'eye'); };
  if (re) { go(); return; } fade(go, () => { GG.Game.musicOverride = 'j_dream'; });
}
function spawnCows(G) {
  RT.cows.length = 0;
  for (let i = 0; i < 14; i++) { const thin = i >= 7, k = i % 7; const sp = thin ? 'cow' : 'cow';
    RT.cows.push({ thin, rig: new Rig(AB.cow), mesh: G.animalMesh(sp, thin ? 'black' : (k % 3 === 0 ? 'brown' : 'plain')), x: VX(-97), z: VZ((thin ? -217 : -205) + (k - 3) * 1.8), tx: VX((thin ? -88.5 : -89) + (k % 2) * 1.6), tz: VZ((thin ? -217 : -205) + (k - 3) * 1.8 + (k % 3) * 0.5),
      y: GG.DWORLD.Y - 1.5, k: 0, st: 'hidden', ph: Math.random() * 6, face: 1.4, eaten: 0 }); }
}
function visionUpdate(dt, S, G, t) {
  if (!S.q.vision) return;
  for (const c of RT.cows) {
    if (c.st === 'emerge') { c.k = Math.min(1, c.k + dt / 5); c.x = lerp(VX(-97), c.tx, c.k); c.z = lerp(c.z, c.tz, dt); if (c.k >= 1) c.st = 'graze'; }
    if (c.st === 'eaten') c.eaten = Math.min(1, c.eaten + dt / 2.5);
    const g = hAt(c.x, c.z); c.y = c.st === 'hidden' ? g - 3 : Math.max(g, lerp(g - 1.6, g, Math.min(1, c.k * 1.6)));
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
  nile: [{ n: '바로', t: '내가 꿈에 하숫가에 서서', ref: '창세기 41:17', e: 'awe' }, { n: '요셉', t: '(하나님, 이 꿈을 보여 주소서. 바로가 본 것을 저도 보게 하소서.)', e: 'pray' }],
  fat: [{ n: '바로', t: '살지고 아름다운 일곱 암소가 하숫가에 올라와 갈밭에서 뜯어 먹고', ref: '창세기 41:18', e: 'awe' }],
  thin: [{ n: '바로', t: '그 뒤에 또 약하고 심히 흉악하고 파리한 일곱 암소가 올라오니, 그같이 흉악한 것들은 애굽 땅에서 내가 아직 보지 못한 것이라.', ref: '창세기 41:19', e: 'fear' },
    { n: '바로', t: '그 파리하고 흉악한 소가 처음의 일곱 살진 소를 먹었으며, 먹었으나 먹은듯하지 아니하여 여전히 흉악하더라.', ref: '창세기 41:20–21', e: 'fear' }],
  good: [{ n: '바로', t: '꿈에 보니, 한 줄기에 무성하고 충실한 일곱 이삭이 나오고', ref: '창세기 41:22', e: 'awe' }],
  blight: [{ n: '바로', t: '그 후에 또 세약하고 동풍에 마른 일곱 이삭이 나더니', ref: '창세기 41:23', e: 'fear' }, { n: '바로', t: '이삭이 좋은 일곱 이삭을 삼키더라.', ref: '창세기 41:24', e: 'fear' }] };
function playVision(S, G, v) {
  const h = hAt(v.x, v.z); GG.UI.hint(null);
  const L = VIS_T[v.id]; let shots;
  if (v.id === 'nile') shots = [{ cam: [v.x + 3, h + 1.8, v.z + 3], cam2: [v.x + 4, h + 3.4, v.z + 1], look: [v.x - 6, h + 0.6, v.z - 4], look2: [VX(-102), h, v.z - 6], dur: 7, ...L[0] }, { cam: [v.x - 1.6, h + 1.5, v.z + 1.8], look: [v.x, h + 1.4, v.z], dur: 6, ...L[1] }];
  else if (v.id === 'fat') shots = [{ fn: () => RT.cows.forEach(c => { if (!c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 6, h + 2.4, v.z + 8], cam2: [v.x + 4.4, h + 1.9, v.z + 6.4], look: [VX(-94), h + 0.3, v.z], look2: [VX(-89), h + 0.8, v.z], dur: 9, ...L[0] }];
  else if (v.id === 'thin') shots = [{ fn: () => RT.cows.forEach(c => { if (c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 6, h + 2.2, v.z - 7], look: [VX(-94), h + 0.3, v.z], look2: [VX(-89), h + 0.8, v.z], dur: 9, ...L[0] },
    { fn: () => RT.cows.forEach(c => { if (!c.thin) c.st = 'eaten'; }), cam: [v.x + 8, h + 3.2, v.z + 4], look: [VX(-89), h + 0.8, VZ(-210)], dur: 9, shake: 0.15, sfx: 'moo', ...L[1] }];
  else if (v.id === 'good') shots = [{ fn: () => { RT.ears = 'good'; RT.earK = 0; }, cam: [v.x + 2.2, h + 1.3, v.z + 2.2], look: [v.x, h + 1.0, v.z], dur: 8, each: t => { RT.earK = Math.min(1, t / 6); }, ...L[0] }];
  else shots = [{ fn: () => { RT.ears = 'both'; RT.earK = 0; }, cam: [v.x + 2.4, h + 1.3, v.z - 2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.earK = Math.min(1, t / 6); RT.dust = 1; }, ...L[0] },
    { cam: [v.x - 2.2, h + 1.2, v.z + 2.2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.swallow = Math.min(1, t / 6); }, ...L[1] }];
  cine(shots, () => { RT.dust = 0; (S.q.seen = S.q.seen || {})[v.id] = 1; G.UI.quest();
    if (Object.keys(S.q.seen).length >= VISION.length) fade(() => { S.q.vision = 0; document.body.classList.remove('dreamOn'); RT.cows.length = 0; RT.ears = null; RT.swallow = 0; G.teleport(SPOTS.court[0], SPOTS.court[1], Math.PI); G.P.airTop = G.P.y; S.time = GG.Game.clockTo(S, 10.5, 1); GG.Game.musicOverride = null; G.UI.hint(null); }, () => G.go('c4_answer'));
    else G.UI.hint('다음 빛나는 곳으로', 'vision' + v.id, 'eye'); });
}
function answerScene(S, G) {
  stage(S, G); G.P.face = Math.PI;
  say([N('pharaoh', '내가 그 꿈을 술객에게 말하였으나 그것을 내게 보이는 자가 없느니라.', '창세기 41:24'), J('바로의 꿈은 하나이라. 하나님이 그 하실 일을 바로에게 보이심이니이다.', '창세기 41:25', 'solemn')], () =>
  GG.UI.puzzle({ title: '바로의 꿈 해석', hint: '꿈속 장면(왼쪽)을 고르고, 하나님이 보이신 뜻(오른쪽)을 찾아 짝지으세요',
    syms: [{ id: 'fat', t: '일곱 살진 암소', m: 'y7', h: '살지고 좋은 것은 좋은 해를 뜻해요. 일곱은…?' }, { id: 'good', t: '충실한 일곱 이삭', m: 'y7', h: '무성한 이삭은 풍성한 해예요.' },
      { id: 'thin', t: '파리하고 흉한 일곱 암소', m: 'f7', h: '살진 소를 먹고도 여전히 흉한 소… 무엇이 풍년을 삼킬까요?' }, { id: 'blight', t: '동풍에 마른 일곱 이삭', m: 'f7', h: '마른 이삭은 굶주림의 해예요.' },
      { id: 'twice', t: '꿈을 두 번 겹쳐 꾸심', m: 'sure', h: '같은 뜻을 두 번 보이신 것은…' }],
    means: [{ id: 'y7', t: '온 애굽 땅에 일곱 해 큰 풍년' }, { id: 'f7', t: '뒤이어 일곱 해 흉년' }, { id: 'sure', t: '하나님이 이 일을 정하셨고 속히 행하시리라' }] }, () => say([
    J('일곱 좋은 암소는 일곱해요, 일곱 좋은 이삭도 일곱해니, 그 꿈은 하나이라.', '창세기 41:26'),
    J('온 애굽 땅에 일곱해 큰 풍년이 있겠고, 후에 일곱해 흉년이 들므로 애굽 땅에 있던 풍년을 다 잊어버리게 되고, 이 땅이 기근으로 멸망되리니', '창세기 41:29–30', 'solemn'),
    J('바로께서 꿈을 두번 겹쳐 꾸신 것은, 하나님이 이 일을 정하셨음이라. 속히 행하시리니', '창세기 41:32', 'solemn'),
    { n: '요셉', t: '그렇다면 바로께 무엇을 아뢸까?', choices: [
      { t: '"명철하고 지혜 있는 사람을 택하여 애굽 땅을 치리하게 하시고, 그 일곱해 풍년에 애굽 땅의 오분의 일을 거두어 흉년을 예비하소서."', ok: true, ref: '창세기 41:33–36' },
      { t: '"지금 실컷 먹고 즐기소서. 흉년은 그때 가서 걱정하면 됩니다."', ok: false, fb: '하나님이 미리 보이신 것은 준비하라는 뜻이었어요.' },
      { t: '"신들께 제물을 더 바치소서."', ok: false, fb: '요셉은 하나님이 보이신 길을 그대로 전했습니다. 거두고, 쌓고, 나누는 길을.' }] },
    J('양식을 위하여 각 성에 적치하게 하소서. 이와 같이 그 곡물을 이 땅에 저장하여 애굽 땅에 임할 일곱해 흉년을 예비하시면, 땅이 이 흉년을 인하여 멸망치 아니하리이다.', '창세기 41:35–36'),
    N('pharaoh', '이와 같이 하나님의 신이 감동한 사람을 우리가 어찌 얻을 수 있으리요.', '창세기 41:38', 'awe'),
    N('pharaoh', '하나님이 이 모든 것을 네게 보이셨으니 너와 같이 명철하고 지혜 있는 자가 없도다. 너는 내 집을 치리하라. 내 백성이 다 네 명을 복종하리니, 나는 너보다 높음이 보좌 뿐이니라.', '창세기 41:39–40', 'solemn'),
    { n: '요셉', t: '바로의 말에 요셉은 어떻게 대답했을까? (어느 쪽도 정답은 아니에요)', choices: [
      { t: '"이는 저의 지혜가 아니라, 하나님께서 보여 주신 것입니다."', then: () => { GG.Deeds && GG.Deeds.char('god', 'credit'); } },
      { t: '"맡겨 주신 일을 힘을 다해 맡아 하겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('duty', 'credit'); } }] }],
  () => cinInvest(S, G))));
}
// v16.8 if the interpretation was interrupted, speaking to 바로 again takes it up from the start of the scene
steps.c4_answer.talk = { pharaoh(S, G) { answerScene(S, G); } };
function cinInvest(S, G) {
  const jx = G.P.x, jz = G.P.z, jh = hAt(jx, jz), jf = G.P.face; // v18.13c the linen shot looks at Joseph where he really stands (he is not moved to the court spot)
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  const road = [[-29, -138], [-28, -124], [-24, -100], [-22, -80], [-22, -66]];
  const along = k => { const n = road.length - 1, f = clamp(k, 0, 0.999) * n, i = Math.floor(f), u = f - i; return [lerp(road[i][0], road[i + 1][0], u), lerp(road[i][1], road[i + 1][1], u), Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1])]; };
  cine([
    { fn: () => { G.setOutfit('josephVizier'); G.sfx('fanfare'); G.FX.burst(cx, chh + 1.2, cz, 30, { c: [1, 0.85, 0.4], sp: 2, up: 2 }); }, cam: [cx + 1.6, chh + 1.6, cz - 1.8], look: [cx, chh + 1.4, cz], dur: 9, music: 'j_triumph',
      t: '자기의 인장 반지를 빼어 요셉의 손에 끼우고, 그에게 세마포 옷을 입히고 금사슬을 목에 걸고', ref: '창세기 41:42' },
    garmentBeat(2, [jx, jh + 1.25, jz], [jx + Math.sin(jf) * 1.15 + Math.cos(jf) * 0.45, jh + 0.65, jz + Math.cos(jf) * 1.15 - Math.sin(jf) * 0.45], '세 번째 옷 · 빼앗기고 내려놓았던 자리에, 하나님이 새 옷을 입혀 주셨습니다.'),
    { cam: [px + 2, ph + 0.8, pz + 4.2], look: [px, ph + 1.3, pz], dur: 6, n: '바로', t: '내가 너로 애굽 온 땅을 총리하게 하노라.', ref: '창세기 41:41', e: 'solemn' },
    { cam: [cx - 3, chh + 2.2, cz + 3], look: [cx, chh + 1.3, cz - 2], dur: 9, n: '바로', t: '네 이름을 사브낫바네아라 하고, 또 온 제사장 보디베라의 딸 아스낫을 네게 주어 아내를 삼게 하노라.', ref: '창세기 41:45' },
    { fn: () => { S.q.parade = 1; S.q.riding = 1; S.q.chariotOk = 1; const [x, z, f] = along(0); G.teleport(x, z, f); crowdLine(G, road, true); },
      cam: t => { const [x, z] = along(t / 16); return [x + 6, hAt(x, z) + 3, z + 4]; }, look: t => { const [x, z] = along(t / 16); return [x, hAt(x, z) + 1.4, z]; }, dur: 9, sfx: 'cheerC',
      each: t => { const [x, z, f] = along(t / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; },
      t: '자기에게 있는 버금 수레에 그를 태우매, 무리가 그 앞에서 소리 지르기를 「엎드리라」 하더라.', ref: '창세기 41:43' },
    { cam: t => { const [x, z] = along((t + 9) / 16); return [x - 5, hAt(x, z) + 1.8, z + 7]; }, look: t => { const [x, z] = along((t + 9) / 16); return [x, hAt(x, z) + 1.6, z]; }, dur: 7, sfx: 'cheerC',
      each: t => { const [x, z, f] = along((t + 9) / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; }, t: '아브렉! 아브렉!', n: '애굽 백성', e: 'shout' },
    { cam: [-14, hAt(-22, -66) + 6, -56], cam2: [-8, hAt(-22, -66) + 14, -48], look: [-22, hAt(-22, -66) + 1.4, -66], dur: 8, t: '바로가 그에게 애굽 전국을 총리로 다스리게 하였더라. 요셉이 애굽 왕 바로 앞에 설 때에 삼십 세라.', ref: '창세기 41:43, 46', fadeOut: 1.6 },
    { black: true, title: '5장 · 일곱 해 풍년', sub: '창세기 41:46–52', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4, fn: () => { S.q.parade = 0; crowdLine(G, road, false); } },
  ], () => { S.q.chariotOk = 1; S.q.riding = 0; S.q.needCart = 1; S.q.cartAt = { x: -20.6, z: -25.6, f: Math.PI }; G.teleport(-25, -29.5, 1.2); /* v18.47 further out from the town (the market setting up beside it was too much at once) */ GG.Game.musicOverride = null; G.go('c5_patrol'); }); /* v18.35 the wagon is handed over outside the town by its keeper: the patrol is where you learn to drive it */
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
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 19.6, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 7, music: 'j_night',
      t: '흉년이 들기 전에 요셉에게 두 아들을 낳되, 곧 온 제사장 보디베라의 딸 아스낫이 그에게 낳은지라.', ref: '창세기 41:50' },
    { cam: [ax + 2.75, h + 1.4, az - 0.7], look: [ax + 0.4, h + 1.0, az + 0.4], dur: 6, n: '아스낫', t: '당신을 닮았어요. 이 아이의 이름을 무엇이라 할까요?', e: 'tender' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 므낫세라 하리라. 하나님이 나로 나의 모든 고난과 나의 아비의 온 집 일을 잊어버리게 하셨다.', ref: '창세기 41:51', e: 'tender' },
    { fn: () => { const a = G.npc('asenath'); if (a) a.sit = false; G.P.face = 1.2; }, hour: 22.5, cam: [ax - 2, h + 1.2, az + 4], look: [ax + 30, h + 14, az - 6], dur: 9,
      t: '그러나 그날 밤, 요셉은 오래도록 동쪽 하늘을 바라보았습니다. 가나안이 있는 쪽이었습니다.', fadeOut: 1.6 },
  ], () => { S.q.born1 = 1; GG.Game.musicOverride = null; G.newDay('풍년 둘째 해'); G.go('c5_year2'); });
  else cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 18.4, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 6, music: 'j_hope',
      t: '이듬해, 아스낫이 둘째 아들을 낳았습니다. 므낫세가 아장아장 걸어와 동생을 들여다보았습니다.' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 에브라임이라 하리라. 하나님이 나로 나의 수고한 땅에서 창성하게 하셨다.', ref: '창세기 41:52', e: 'happy' },
    { cam: [ax + 5, h + 2.6, az + 6], look: [ax, h + 0.8, az], dur: 7, t: '구덩이에서 울던 소년은, 이제 두 아이의 아버지가 되었습니다.', fadeOut: 1.4 },
  ], () => { S.q.born2 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.go('c5_years'); });
}
function plentyMontage(S, G) {
  const gs = sites.map(s => [s.x, s.z, hAt(s.x, s.z)]);
  cine([
    { fn: () => { LAND = 'plenty'; G.W().recolor(color); RT.sacks = 1; }, cam: [gs[0][0] + 12, gs[0][2] + 7, gs[0][1] + 10], cam2: [gs[0][0] + 8, gs[0][2] + 4, gs[0][1] + 7], look: [gs[0][0], gs[0][2] + 1.5, gs[0][1]], dur: 7, music: 'j_plenty', title: '풍년 셋째 해', sub: '',
      t: '일곱해 풍년에 토지 소출이 심히 많은지라.', ref: '창세기 41:47' },
    { fn: () => { RT.sacks = 2; }, cam: [-60, 18, -120], cam2: [-90, 22, -60], look: [-100, 1, -100], look2: [-120, 1, -20], dur: 8, title: '풍년 다섯째 해', sub: '', t: '요셉이 애굽 땅에 있는 그 칠년 곡물을 거두어 각성에 저축하되, 각성 주위의 밭의 곡물을 그 성중에 저장하매', ref: '창세기 41:48' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[1][0] + 10, gs[1][2] + 5, gs[1][1] - 8], look: [gs[1][0], gs[1][2] + 1.5, gs[1][1]], dur: 7, title: '풍년 일곱째 해', sub: '', t: '곡식이 바다 모래 같이 심히 많아, 세기를 그쳤으니 그 수가 한이 없음이었더라.', ref: '창세기 41:49' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[2][0] + 8, gs[2][2] + 4, gs[2][1] + 9], look: [gs[2][0], gs[2][2] + 2, gs[2][1]], dur: 6, t: '언덕 위 곳간은 물 한 방울 들지 않았고, 곳간마다 곡식이 천장까지 쌓였습니다.' },
    { fn: () => { LAND = 'famine'; G.W().recolor(color); }, hour: 13, cam: [-50, 16, 40], cam2: [-70, 20, 10], look: [-100, 1, 40], look2: [-110, 1, 0], dur: 9, music: 'j_famine', sfx: 'wind',
      t: '애굽 땅에 일곱해 풍년이 그치고, 요셉의 말과 같이 일곱해 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 식물이 있더니', ref: '창세기 41:53–54', fadeOut: 1.6 },
    { black: true, title: '6장 · 일곱 해 흉년', sub: '창세기 41:53–42:9', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4 },
  ], () => { GG.Game.musicOverride = null; S.day += 7 * 360; G.go('c6_open'); });
}

// ------------------------------------------------------------------ 6장 · the seven years of famine
function famineEnter(S, G, re) {
  if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); }
  if (!re) narr([{ kick: '창세기 41:55', title: '요셉에게 가라', t: '애굽 온 땅이 주리매 백성이 바로에게 부르짖어 양식을 구하는지라. 바로가 애굽 모든 백성에게 이르되 「요셉에게 가서 그가 너희에게 이르는대로 하라」 하니라.', ref: '창세기 41:55' }]);
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
    J('한 자루를 가져가시오. 모자라는 값은 아이들이 자라서 갚으면 되오.', '', 'tender'), N('woman', '…한 자루를요? 총리님, 이 은혜를 어찌 갚을까요.', '', 'cry')]); },
  buyElder(S, G) { return sellTo(S, G, 'buyElder', [N('overseerW', '총리님! 저를 기억하십니까? 오분의 일이 웬 말이냐고 대들던 서쪽 마을 촌장입니다.', '', 'happy'),
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
  say(lines, () => { (S.q.sold = S.q.sold || {})[id] = 1; G.sfx('coins'); emote(id, 'bow', 2); const k = Object.keys(S.q.sold).length; GG.UI.pop && GG.UI.pop('곡식을 내주었어요', k >= 6 ? '줄이 다 끝났어요' : `기다리는 사람이 ${6 - k}명 남았어요 · 곳간 곡식은 아직 넉넉해요`, 'coin'); G.UI.quest(); G.checkStep(); });
}
// the brothers come (창 42:1–9)
function cinBrothers(S, G, next) {
  const heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4), gx = 16, gz = -58, gh = hAt(gx, gz);
  const jx = gx, jz = gz - 1.6;
  cine([
    { hour: 9, fn: () => { S.q.heb2 = 1; S.q.broShow = 1; BRO.forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI)); place('jacob', heb[0], heb[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('benjamin2', heb[0] + 2.2, heb[1] + 2.4, -0.4); },
      cam: [heb[0] + 4.4, hh + 1.8, heb[1] + 9.6], look: [heb[0], hh + 1.2, heb[1] + 3.4], dur: 7, music: 'j_mourn', t: '때에 야곱이 애굽에 곡식이 있음을 보고 아들들에게 이르되, 「너희는 어찌하여 서로 관망만 하느냐」', ref: '창세기 42:1' },
    { cam: [heb[0] - 1.4, hh + 1.6, heb[1] + 5], look: [heb[0], hh + 1.4, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 들은즉 저 애굽에 곡식이 있다 하니, 너희는 그리로 가서 거기서 우리를 위하여 사오라. 그리하면 우리가 살고 죽지 아니하리라.', ref: '창세기 42:2', e: 'weary' },
    { cam: [heb[0] + 3.6, hh + 1.4, heb[1] + 1.4], look: [heb[0] + 2.2, hh + 1.5, heb[1] + 2.4], dur: 8, t: '요셉의 형 십인이 애굽에서 곡식을 사려고 내려갔으나, 야곱이 요셉의 아우 베냐민을 그 형들과 함께 보내지 아니하였으니, 이는 그의 말이 재난이 그에게 미칠까 두렵다 함이었더라.', ref: '창세기 42:3–4' },
    { fn: () => { S.q.heb2 = 0; G.teleport(jx, jz, 0); BRO.forEach((id, i) => place(id, gx - 4.5 + (i % 5) * 2.2, gz + 4 + Math.floor(i / 5) * 1.8, Math.PI)); ['byFarmer', 'byWoman', 'buyElder', 'bySidon', 'byEdom', 'byAmeni'].forEach(id => G.npcShow(id, false)); },
      cam: [gx + 8, gh + 2.6, gz + 12], cam2: [gx + 5, gh + 2, gz + 9], look: [gx, gh + 1.2, gz + 2], dur: 7, music: 'j_finale', t: '요셉이 나라의 총리로서 그 땅 모든 백성에게 팔더니, 요셉의 형들이 와서', ref: '창세기 42:6' },
    { fn: () => BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: -i * 0.15, dur: 12, amb: true }; } }), cam: [jx + 0.8, gh + 2.8, jz - 2.8], look: [gx, gh + 0.3, gz + 5], dur: 9, t: '그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { fn: () => { RT.dreamFx = 'sheaves'; RT.dreamK = 0; }, cam: [DREAM.x + 3.6, hAt(DREAM.x, DREAM.z) + 1.2, DREAM.z + 3.6], cam2: [DREAM.x + 2.8, hAt(DREAM.x, DREAM.z) + 1.6, DREAM.z + 2.8], look: [DREAM.x, hAt(DREAM.x, DREAM.z) + 0.8, DREAM.z], dur: 9, fadeIn: 1,
      each: t => { RT.dreamK = Math.min(1, t / 6); }, t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고', ref: '창세기 42:9' },
    { fn: () => { RT.dreamFx = null; GG.Audio && GG.Audio.sfx('insight', { pitch: 1.0, vol: 0.7 }); cpose(null); BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: 1.6 + i * 0.05, dur: 9, amb: true }; } }); }, cam: [gx + 1.4, gh + 0.55, gz + 8.5], cam2: [gx + 1.1, gh + 0.6, gz + 7.6], look: [jx, gh + 1.5, jz], dur: 5, fov: 0.6, fadeIn: 0.6,
      t: '곡식 단들이 둘러서서 절하던 그 꿈, 그대로였습니다. 스무 해 남짓이 지나 있었습니다.', ref: '창세기 37:7' }, /* v18.13d match cut: the real brothers bow just as the sheaves did */
    { fn: () => { RT.dreamFx = null; }, cam: [jx - 1.2, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.55, fadeIn: 0.8, t: '요셉이 보고 형들인줄 아나, 모르는체 하고 엄한 소리로 그들에게 말하여…', ref: '창세기 42:7' },
    { cam: [jx + 1.6, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '너희가 어디서 왔느냐?', ref: '창세기 42:7', e: 'cold' },
    { fn: () => { const n = G.npc('judah'); if (n) n.act = 'kneelRest'; }, cam: [gx - 2, gh + 1.2, gz + 1.6], look: [gx - 0.1, gh + 0.9, gz + 4], dur: 6, n: '유다', t: '곡물을 사려고 가나안에서 왔나이다.', ref: '창세기 42:7', e: 'fear' },
    { cam: [jx + 0.8, gh + 1.6, jz + 0.9], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.5, t: '요셉은 그 형들을 아나, 그들은 요셉을 알지 못하더라.', ref: '창세기 42:8' },
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
steps.c3_charge.target = S => { const f = S.q.fed || {}; const i = [0, 1, 2, 3].find(k => !f[k]); if (i === undefined) return 'npc:prisA'; return Gm().P.carry === 'basket' ? { x: CELL[i][0], z: -4.9 } : { x: -33.7, z: 7 }; };
steps.c6_open.target = S => { const o = S.q.opened || {}; const k = ['A', 'B', 'C'].find(q => !o[q]); if (!k) return null; const g = sites.find(s => s.id === 'gran' + k); return { x: g.x, z: g.z + 4 }; };
/* v18.41 (c5_patrol's own target in c_steps.js is used: 호리 → the wagon → 카이 → the overseers; this line used to overwrite it and left no arrow before boarding) */

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
    { cam: [jx + 1.4, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 6, n: '요셉', t: '너희는 정탐들이라. 이 나라의 틈을 엿보려고 왔느니라.', ref: '창세기 42:9', e: 'cold' },
    { cam: [gx - 2, gh + 1.3, gz + 1.8], look: [gx - 0.6, gh + 1.1, gz + 4], dur: 8, n: '유다', t: '내 주여 아니니이다. 우리는 다 한 사람의 아들로서 독실한 자니, 종들은 정탐이 아니니이다. 주의 종 우리들은 십 이 형제로서 가나안 땅 한 사람의 아들들이라. 말째 아들은 오늘 아버지와 함께 있고 또 하나는 없어졌나이다.', ref: '창세기 42:10–13', e: 'fear' },
    { cam: [jx + 0.9, gh + 1.7, jz + 1.1], look: [jx, gh + 1.6, jz], dur: 8, fov: 0.55, n: '요셉', t: '나는 하나님을 경외하노니 너희는 이같이 하여 생명을 보전하라 너희가 독실한 자이면 너희 형제중 한 사람만 그 옥에 갇히게 하고 너희는 곡식을 가지고 가서 너희 집들의 주림을 구하고, 너희 말째 아우를 내게로 데리고 오라.', ref: '창세기 42:18–20', e: 'cold' },
    { cam: [gx + 2.2, gh + 1.4, gz + 6.2], look: [gx, gh + 1.2, gz + 4.2], dur: 10, n: '형들', t: '우리가 아우의 일로 인하여 범죄하였도다. 그가 우리에게 애걸할 때에 그 마음의 괴로움을 보고도 듣지 아니하였으므로 이 괴로움이 우리에게 임하도다.', ref: '창세기 42:21', e: 'sad' }, /* v18.42 the brothers' confession (the pit scene's foreshadowing comes home) */
    { cam: [gx + 2.6, gh + 1.4, gz + 6.8], look: [gx, gh + 1.2, gz + 4.2], dur: 9, n: '르우벤', t: '내가 너희더러 그 아이에게 득죄하지 말라고 하지 아니하였느냐? 그래도 너희가 듣지 아니하였느니라. 그러므로 그의 피 값을 내게 되었도다.', ref: '창세기 42:22', e: 'sad' },
    { fn: () => cpose('weep', 6), cam: [jx - 3, gh + 1.5, jz - 2.4], look: [jx, gh + 1.4, jz], dur: 7, t: '피차간에 통변을 세웠으므로 그들은 요셉이 그 말을 알아 들은줄을 알지 못하였더라. 요셉이 그들을 떠나 가서 울고,', ref: '창세기 42:23–24' },
    { fn: () => { cpose(null); const n = G.npc('simeon'); if (n) { n.act = 'kneelRest'; } }, cam: [gx - 0.6, gh + 1.6, gz + 1.4], look: [gx - 1.5, gh + 0.9, gz + 4], dur: 7, t: '다시 돌아와서 그들과 말하다가 그들 중에서 시므온을 취하여 그들의 목전에서 결박하고', ref: '창세기 42:24' },
  ], () => { const n = G.npc('simeon'); if (n) n.act = null; GG.UI.quest(); next && next(); });
}
function cinDepart(S, G, next) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz);
  cine([
    { fn: () => { hide(['simeon']); BRO.filter(id => id !== 'simeon').forEach((id, i) => walkTo(id, gx + 30 + i, gz + 40, 1.6)); }, cam: [gx + 6, gh + 3, gz + 6], look: [gx + 14, gh + 1, gz + 18], dur: 7, music: 'j_mourn',
      t: '그들이 곡식을 나귀에 싣고 그곳을 떠났더니 한 사람이 객점에서 나귀에게 먹이를 주려고 자루를 풀고 본즉 그 돈이 자루 아구에 있는지라.', ref: '창세기 42:26–27' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('reuben', G7HEB[0] - 1.2, G7HEB[1] + 4.6, Math.PI, { vis: true }); /* v18.34 Reuben is there to speak */ }, cam: [G7HEB[0] + 3.4, hAt(G7HEB[0], G7HEB[1]) + 1.6, G7HEB[1] + 6.4], look: [G7HEB[0], hAt(G7HEB[0], G7HEB[1]) + 1.3, G7HEB[1] + 2.6], dur: 8,
      n: '야곱', t: '너희가 나로 나의 자식들을 잃게 하도다. 요셉도 없어졌고 시므온도 없어졌거늘 베냐민을 또 빼앗아 가고자 하니, 이는 다 나를 해롭게 함이로다.', ref: '창세기 42:36', e: 'weary' },
    /* v18.34 Reuben's pledge (42:37), so Judah's later pledge (43:9) reads against it: words offered vs. himself offered */
    { cam: [G7HEB[0] + 0.6, hAt(G7HEB[0], G7HEB[1]) + 1.55, G7HEB[1] + 3.2], look: [G7HEB[0] - 1.2, hAt(G7HEB[0], G7HEB[1]) + 1.5, G7HEB[1] + 4.6], dur: 7, n: '르우벤', t: '내가 그를 아버지께로 데리고 오지 아니하거든 나의 두 아들을 죽이소서. 그를 내 손에 맡기소서…', ref: '창세기 42:37' },
    { cam: [G7HEB[0] + 1.6, hAt(G7HEB[0], G7HEB[1]) + 1.6, G7HEB[1] + 4.6], look: [G7HEB[0], hAt(G7HEB[0], G7HEB[1]) + 1.4, G7HEB[1] + 2.6], dur: 6, n: '야곱', t: '내 아들은 너희와 함께 내려가지 못하리니, 그의 형은 죽고 그만 남았음이라.', ref: '창세기 42:38', e: 'sad' },
  ], () => { S.q.heb2 = 0; S.q.broShow = 0; npcSet('jacob', { look: LOOK.jacob }); BRO.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); next && next(); });
}
function cinJudahPledge(S, G, next) { const hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 8, fn: () => { S.q.heb2 = 1; brosRow(G7HEB[0], G7HEB[1] + 5, Math.PI, BRO.filter(id => id !== 'simeon')); place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); },
      cam: [G7HEB[0] + 5, hh + 2.6, G7HEB[1] + 10], look: [G7HEB[0], hh + 1.2, G7HEB[1] + 3], dur: 7, music: 'j_mourn', t: '그 땅에 기근이 심하고, 그들이 애굽에서 가져온 곡식을 다 먹으매', ref: '창세기 43:1–2' },
    { cam: [G7HEB[0] - 1.6, hh + 1.5, G7HEB[1] + 5.4], look: [G7HEB[0] - 0.6, hh + 1.5, G7HEB[1] + 4.8], dur: 9, n: '유다', t: '저 아이를 나와 함께 보내시면 우리가 곧 가리니, 그러면 우리와 아버지와 우리 어린 것들이 다 살고 죽지 아니하리이다. 내가 그의 몸을 담보하오리니 아버지께서 내 손에 그를 물으소서…', ref: '창세기 43:8–9', e: 'solemn' },
    { cam: [G7HEB[0] + 1.4, hh + 1.6, G7HEB[1] + 4.6], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 9, n: '야곱', t: '그러할찐대 이렇게 하라. 너희는 이 땅의 아름다운 소산을 그릇에 담아가지고 내려가서 그 사람에게 예물을 삼을찌니 곧 유향 조금과 꿀 조금과 향품과 몰약과 비자와 파단행이니라.', ref: '창세기 43:11', e: 'weary' },
    { cam: [G7HEB[0] + 2.8, hh + 1.4, G7HEB[1] + 3.4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, n: '야곱', t: '전능하신 하나님께서 그 사람 앞에서 너희에게 은혜를 베푸사, 그 사람으로 너희 다른 형제와 베냐민을 돌려보내게 하시기를 원하노라. 내가 자식을 잃게 되면 잃으리로다.', ref: '창세기 43:14', e: 'weary' },
  ], () => { S.q.heb2 = 0; npcSet('jacob', { look: LOOK.jacob }); next && next(); });
}
function cinFeast(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 12, fn: () => { G.teleport(hx, hz + 1.2, 0); S.q.broShow = 1; BRO11.forEach((id, i) => showAt(id, hx - 6 + (i % 6) * 2.2, hz + 6 + Math.floor(i / 6) * 2, Math.PI)); },
      cam: [hx + 7, hh + 2.6, hz + 12], look: [hx, hh + 1.2, hz + 6], dur: 7, music: 'j_finale', t: '요셉이 베냐민이 그들과 함께 있음을 보고 그 청지기에게 이르되, 「이 사람들을 집으로 인도해 들이고 짐승을 잡고 준비하라. 이 사람들이 오정에 나와 함께 먹을 것이니라」', ref: '창세기 43:16' },
    { cam: [hx + 1.8, hh + 1.6, hz + 3.2], look: [hx + 0.4, hh + 1.4, hz + 6.2], dur: 7, fov: 0.55, n: '요셉', t: '너희 아버지 너희가 말하던 그 노인이 안녕하시냐? 지금까지 생존하셨느냐?', ref: '창세기 43:27' },
    { fn: () => { BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'prostrate', t: -i * 0.1, dur: 7, amb: true }; }); }, cam: [hx - 4, hh + 2.4, hz + 2], look: [hx - 1, hh + 0.5, hz + 6.5], dur: 7, n: '유다', t: '주의 종 우리 아비가 평안하고 지금까지 생존하였나이다.', ref: '창세기 43:28' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }), cam: [hx + 4.2, hh + 1.5, hz + 8.8], look: [hx + 4.4, hh + 1.3, hz + 8], dur: 7, n: '요셉', t: '너희가 내게 말하던 너희 작은 동생이 이냐? …소자여, 하나님이 네게 은혜 베푸시기를 원하노라.', ref: '창세기 43:29' },
    { fn: () => { G.teleport(hx + 13, hz - 1, -Math.PI / 2); cpose('weep', 8); }, cam: [hx + 10.8, hAt(hx + 13, hz - 1) + 1.5, hz + 0.6], look: [hx + 13, hAt(hx + 13, hz - 1) + 1.4, hz - 1], dur: 8, fadeIn: 0.6,
      t: '요셉이 아우를 인하여 마음이 타는듯 하므로 급히 울곳을 찾아 안방으로 들어가서 울고, 얼굴을 씻고 나와서 그 정을 억제하고 음식을 차리라 하매', ref: '창세기 43:30–31' },
  ], () => { cpose(null); G.teleport(hx, hz + 1.2, 0); next && next(); });
}
function cinMarvel(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    /* v18.55 three tables (창 43:32): Joseph alone, the brothers together, the Egyptians who ate with him apart */
    { fn: () => { BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })); G.teleport(hx, hz + 3.4, 0); cpose('sitg', 40, true); showAt('steward2', hx + 8, hz + 4.6, -Math.PI / 2, { sit: true, act: 'eat' }); },
      cam: [hx - 9, hh + 3.2, hz + 2.6], look: [hx + 1, hh + 0.8, hz + 5.4], dur: 9, music: 'j_finale',
      t: '그들이 요셉에게 따로 하고 그 형제들에게 따로 하고 배식하는 애굽 사람에게도 따로 하니 애굽 사람은 히브리 사람과 같이 먹으면 부정을 입음이었더라.', ref: '창세기 43:32' },
    { fn: () => BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })), cam: [hx + 8, hh + 2.6, hz + 11], look: [hx, hh + 0.9, hz + 7], dur: 8, music: 'j_finale',
      t: '그들이 요셉의 앞에 앉되 그 장유의 차서대로 앉히운바 되니 그들이 서로 이상히 여겼더라.', ref: '창세기 43:33' },
    { cam: [hx + 6.6, hh + 1.3, hz + 5], look: [hx + 6, hh + 0.9, hz + 7], dur: 8, t: '요셉이 자기 식물로 그들에게 주되 베냐민에게는 다른 사람보다 오배나 주매, 그들이 마시며 요셉과 함께 즐거워하였더라.', ref: '창세기 43:34' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.act = null; } }); { const st = G.npc('steward2'); if (st) { st.sit = false; st.act = null; } } next && next(); });
}
function cinCup(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 6, fn: () => { BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 4, cz + Math.floor(i / 6) * 1.8, 0.6)); showAt('steward2', cx - 3, cz - 6, 0.4); },
      cam: [cx + 8, ch + 3, cz - 8], look: [cx, ch + 1.2, cz], dur: 7, music: 'j_mourn', t: '개동시에 사람들과 그 나귀를 보내니라. 그들이 성에서 나가 멀리 가기 전에, 청지기가 그들의 뒤를 따라 미쳐', ref: '창세기 44:3–6' },
    { fn: () => { const n = G.npc('benjamin2'); if (n) n.act = 'kneelRest'; }, cam: [cx + 4.4, ch + 1.4, cz + 3.2], look: [cx + 4, ch + 0.8, cz + 1.8], dur: 8, t: '그들이 각각 급히 자루를 땅에 내려놓고 각기 푸니, 그가 나이 많은 자에게서부터 시작하여 나이 적은 자에게까지 수탐하매 잔이 베냐민의 자루에서 발견된지라.', ref: '창세기 44:11–12' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'weep', t: -i * 0.1, dur: 9, amb: true }; }), cam: [cx - 3, ch + 2.2, cz + 5], look: [cx, ch + 1, cz + 0.6], dur: 6, t: '그들이 옷을 찢고 각기 짐을 나귀에 싣고 성으로 돌아오니라.', ref: '창세기 44:13' },
    { fn: () => { G.teleport(hx, hz + 1.2, 0); BRO11.forEach((id, i) => { const n = showAt(id, hx - 5 + (i % 6) * 2, hz + 5 + Math.floor(i / 6) * 1.6, Math.PI); if (n) n.emote = { k: 'prostrate', t: -i * 0.08, dur: 10, amb: true }; }); hide(['steward2']); },
      cam: [hx + 5, hh + 2.4, hz + 9], look: [hx, hh + 0.6, hz + 5], dur: 7, fadeIn: 0.8, t: '유다와 그 형제들이 요셉의 집에 이르니 요셉이 오히려 그곳에 있는지라. 그 앞 땅에 엎드리니', ref: '창세기 44:14' },
    { cam: [hx + 1.6, hh + 1.2, hz + 4], look: [hx + 0.4, hh + 0.8, hz + 3.2], dur: 9, n: '유다', t: '하나님이 종들의 죄악을 적발하셨으니 우리와 이 잔이 발견된 자가 다 내 주의 종이 되겠나이다.', ref: '창세기 44:16', e: 'cry' }, /* v18.42 Judah's confession */
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }); next && next(); });
}
function cinPlea(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4), jd = () => G.npc('judah');
  cine([
    { fn: () => { const n = jd(); if (n) { G.npcTo('judah', hx + 0.4, hz + 3.2, Math.PI, false); n.act = 'kneelRest'; } }, cam: [hx - 1.6, hh + 1.3, hz + 2.2], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, music: 'j_mourn',
      n: '유다', t: '내 주여, 원하건대 당신의 종에게 내 주의 귀에 한 말씀을 아뢰게 하소서. 우리 아버지의 생명과 아이의 생명이 서로 하나로 묶여 있거늘,', ref: '창세기 44:18, 30', e: 'cry' },
    { cam: [hx + 1.6, hh + 1.2, hz + 4], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '아이가 우리와 함께 가지 아니함을 아버지가 보면 아버지가 죽으리니, 이같이 되면 종들이 주의 종 우리 아버지가 흰 머리로 슬퍼하며 스올로 내려가게 함이니이다.', ref: '창세기 44:31', e: 'cry' },
    { cam: [hx - 0.8, hh + 1.3, hz + 4.6], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '주의 종으로 아이를 대신하여 있어서 주의 종이 되게 하시고 아이는 형제와 함께 도로 올려 보내소서. 내가 어찌 아이와 함께 하지 아니하고 내 아비에게로 올라 갈 수 있으리이까.', ref: '창세기 44:33–34', e: 'cry' },
    { cam: [hx + 0.9, hh + 1.7, hz + 1], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.5, t: '스무 해 남짓 전, 아우 요셉을 팔자고 했던 유다가 이제 아우 베냐민을 위해 자기를 내어 주고 있었습니다.', ref: '창세기 37:26–27; 44:33' },
  ], () => { const n = jd(); if (n) n.act = null; next && next(); });
}
function cinIAmJoseph(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  /* v18.58 when Joseph speaks the lens finds his real head (he weeps bent over, so a fixed height looked over the top of it or cut him off at the edge) */
  const jHead = () => { const P = GG.Game.P, w = P.rig && P.rig.world && GG.HBI && P.rig.world[GG.HBI.head]; return w && isFinite(w[13]) && Math.hypot(w[12] - P.x, w[14] - P.z) < 1.5 ? [w[12], w[13] + 0.08, w[14]] : [P.x, P.y + 1.5, P.z]; };
  const onJ = (dx, dy, dz) => () => { const h = jHead(); return { look: h, cam: [h[0] + dx, h[1] + dy, h[2] + dz] }; };
  cine([
    { fn: () => { G.teleport(hx, hz, 0); /* v18.58 Joseph on his mark: every camera here is aimed at this spot */ cpose('weep', 10); hide(['asenath', 'steward2']); /* v18.42 45:1 「그와 함께 한 다른 사람이 없었더라」 */ BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); }, cam: [hx + 2, hh + 1.6, hz - 1.8], look: [hx, hh + 1.5, hz + 0.6], dur: 8, music: 'j_finale',
      t: '요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리질러 「모든 사람을 자기에게서 물러가라」 하고, 그 형제에게 자기를 알리니 때에 그와 함께한 자가 없었더라. 요셉이 방성대곡하니 애굽 사람에게 들리며 바로의 궁중에 들리더라.', ref: '창세기 45:1–2' },
    { at: onJ(1.22, 0.05, 1.46), cam: [hx + 1, hh + 1.7, hz + 1.2], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.48, n: '요셉', t: '나는 요셉이라. 내 아버지께서 아직 살아 계시니이까?', ref: '창세기 45:3', e: 'cry' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.act = 'kneelRest'; }), cam: [hx - 3, hh + 1.8, hz + 1], look: [hx - 1, hh + 1, hz + 4.5], dur: 6, t: '형들이 그 앞에서 놀라서 능히 대답하지 못하는지라.', ref: '창세기 45:3' },
    { at: onJ(1.40, 0.05, 1.60), cam: [hx + 1.4, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '나는 당신들의 아우 요셉이니 당신들이 애굽에 판 자라. 당신들이 나를 이곳에 팔았으므로 근심하지 마소서. 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들 앞서 보내셨나이다.', ref: '창세기 45:4–5', e: 'cry' },
    { at: onJ(-1.20, 0.05, 1.80), cam: [hx - 1.2, hh + 1.6, hz + 1.8], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '그런즉 나를 이리로 보낸 자는 당신들이 아니요 하나님이시라. 하나님이 나로 바로의 아비를 삼으시며 그 온 집의 주를 삼으시며 애굽 온 땅의 치리자를 삼으셨나이다.', ref: '창세기 45:8', e: 'tender' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) { b.act = null; G.npcTo('benjamin2', hx + 0.5, hz + 0.9, Math.PI, false); b.emote = { k: 'weep', t: 0, dur: 22, amb: true }; } }, cam: [hx + 2.6, hh + 1.5, hz + 0.4], look: [hx + 0.2, hh + 1.4, hz + 0.5], dur: 8,
      t: '자기 아우 베냐민의 목을 안고 우니 베냐민도 요셉의 목을 안고 우니라. 요셉이 또 형들과 입맞추며 안고 우니 형들이 그제야 요셉과 말하니라.', ref: '창세기 45:14–15' },
    /* v18.73 the made-up lines after 45:15 (Benjamin's promise and stone, Judah's and Reuben's words, Joseph's answers) are gone: the main story is the Bible only */
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next && next(); });
}
function cinSendOff(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 7, fn: () => { G.teleport(cx - 2, cz - 3, 0.5); BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 3, cz + 2 + Math.floor(i / 6) * 1.8, 0.4)); },
      cam: [cx + 6, ch + 2.6, cz - 5], look: [cx, ch + 1.2, cz + 2], dur: 8, music: 'j_finale', t: '그들에게 다 각기 옷 한벌씩 주되 베냐민에게는 은 삼백과 옷 다섯벌을 주고, 그가 또 이와 같이 그 아비에게 보내되 수나귀 열 필에 애굽의 아름다운 물품을 실리고 암나귀 열 필에는 아비에게 길에서 공궤할 곡식과 떡과 양식을 실리고…', ref: '창세기 45:22–23' },
    (() => { const sh = garmentBeat(3, [cx, ch + 1.25, cz + 2], [cx, ch + 0.75, cz + 5], '네 번째 옷 · 옷을 빼앗겼던 요셉이, 이제 형들에게 옷을 입혀 줍니다.'), f0 = sh.fn;
      sh.fn = () => { f0(); const n = G.npc('benjamin2') || G.npc(BRO11[0]); if (!n) return; const h = hAt(n.x, n.z), f = n.face, sx = Math.cos(f) * 0.7, sz = -Math.sin(f) * 0.7; // in front of Benjamin, a little to the side, looking up at his new clothes
        sh.look = [n.x, h + 1.3, n.z]; sh.cam = [n.x + Math.sin(f) * 3.4 + sx, h + 0.8, n.z + Math.cos(f) * 3.4 + sz]; sh.cam2 = [n.x + Math.sin(f) * 2.8 + sx, h + 0.9, n.z + Math.cos(f) * 2.8 + sz];
        /* v18.58 the lens sat inside a wall or a pack animal (a plain brown screen, nobody in it): try the spots around him until the way to his face is clear and no one stands on the lens */
        { const W = GG.Game.W(), ok = c => { if (W && W.ray && W.ray(c[0], c[1], c[2], sh.look[0], sh.look[1], sh.look[2]) < 1) return false; if (GG.Game.solidAt && GG.Game.solidAt(c[0], c[2], 0.5)) return false; const E = GG.Game.ENT.npcs; for (const id in E) { const m = E[id]; if (m !== n && m.vis && Math.hypot(m.x - c[0], m.z - c[2]) < (m.d.animal ? 1.6 : 0.9)) return false; } return true; };
          if (!ok(sh.cam) || !ok(sh.cam2)) for (const [da, r, up] of [[0.5, 3.2, 1.2], [-0.5, 3.2, 1.2], [1.0, 3, 1.3], [-1.0, 3, 1.3], [0, 2.2, 1.4], [1.6, 2.8, 1.4], [-1.6, 2.8, 1.4], [0.3, 4.5, 2.2], [-0.3, 4.5, 2.2], [3.14, 3, 1.5]]) { const a = f + da, c = [n.x + Math.sin(a) * r, h + up, n.z + Math.cos(a) * r], c2 = [n.x + Math.sin(a) * (r - 0.5), h + up + 0.05, n.z + Math.cos(a) * (r - 0.5)]; if (ok(c) && ok(c2)) { sh.cam = c; sh.cam2 = c2; break; } }
          /* and never under the ground: on a slope the low lens (0.8 m above Benjamin's feet, 3 m away) could sit below the hillside */ for (const c of [sh.cam, sh.cam2]) c[1] = Math.max(c[1], hAt(c[0], c[2]) + 0.75); } };
      return sh; })(),
    { cam: [cx - 0.4, ch + 1.7, cz - 1.6], look: [cx - 2, ch + 1.6, cz - 3], dur: 6, n: '요셉', t: '당신들은 노중에서 다투지 말라.', ref: '창세기 45:24', e: 'happy' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacob }); }, cam: [G7HEB[0] + 3, hh + 1.5, G7HEB[1] + 5.6], look: [G7HEB[0], hh + 1.4, G7HEB[1] + 2.6], dur: 8, fadeIn: 0.8,
      t: '그들이 가나안 땅으로 들어가서 아버지 야곱에게 이르러 알리되 「요셉이 지금까지 살아 있어 애굽 땅 총리가 되었더이다」 야곱이 그들을 믿지 아니하므로 기색하더니, 요셉의 자기를 태우려고 보낸 수레를 보고야 기운이 소생한지라.', ref: '창세기 45:26–27' },
    { cam: [G7HEB[0] + 1.2, hh + 1.6, G7HEB[1] + 4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, fov: 0.55, n: '야곱', t: '족하도다. 내 아들 요셉이 지금까지 살았으니 내가 죽기 전에 가서 그를 보리라.', ref: '창세기 45:28', e: 'cry' },
    { hour: 21, fn: () => { place('jacob', G7HEB[0] + 6, G7HEB[1] - 20, 0.3, { act: 'kneelRest' }); }, cam: [G7HEB[0] + 9, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.4, G7HEB[1] - 16], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.2, G7HEB[1] - 20], dur: 9, fadeIn: 1,
      t: '이스라엘이 모든 소유를 이끌고 발행하여 브엘세바에 이르러 그 아비 이삭의 하나님께 희생을 드리니, 밤에 하나님이 이상 중에 이스라엘에게 나타나시고', ref: '창세기 46:1–2' },
    { cam: [G7HEB[0] + 6.6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 3, G7HEB[1] - 17], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 12, G7HEB[1] - 24], dur: 9, fov: 1.1,
      t: '「나는 하나님이라 네 아비의 하나님이니 애굽으로 내려가기를 두려워 말라. 내가 거기서 너로 큰 민족을 이루게 하리라. 내가 너와 함께 애굽으로 내려가겠고 정녕 너를 인도하여 다시 올라올 것이며」', ref: '창세기 46:3–4' },
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
      cam: [x0 + 14, gh + 4, z0 - 6], cam2: [x0 + 10, gh + 3, z0 - 2], look: [x0, gh + 1.2, z0 + 4], dur: 8, music: 'j_finale', t: '야곱이 유다를 요셉에게 미리 보내어 자기를 고센으로 인도하게 하고 다 고센 땅에 이르니, 요셉이 수레를 갖추고 고센으로 올라가서 아비 이스라엘을 맞으며', ref: '창세기 46:28–29' },
    { fn: () => { G.teleport(x0, z0 + 4.8, 0); cpose('weep', 12); const j = G.npc('jacob'); if (j) j.emote = { k: 'weep', t: 0, dur: 12, amb: true }; }, cam: [x0 + 2.4, gh + 1.6, z0 + 5.6], look: [x0, gh + 1.5, z0 + 5.4], dur: 9, fov: 0.6,
      t: '그에게 보이고 그 목을 어긋맞겨 안고 얼마 동안 울매', ref: '창세기 46:29' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 9, n: '야곱', t: '네가 지금까지 살아 있고 내가 네 얼굴을 보았으니 지금 죽어도 가하도다.', ref: '창세기 46:30', e: 'cry' },
    { cam: [x0 + 0.9, gh + 1.55, z0 + 5.9], look: [x0, gh + 1.6, z0 + 5.0], dur: 8, fov: 0.5, t: '피 묻은 채색옷을 스무 해 넘게 품고 살던 늙은 손이, 살아 있는 아들의 얼굴을 천천히 더듬었습니다.' }, /* v18.56 the reunion, given time */
    { cam: [x0 - 1.0, gh + 1.6, z0 + 7.0], look: [x0, gh + 1.6, z0 + 5.2], dur: 7, n: '야곱', t: '어디 보자… 이 눈, 이 이마… 네 어미를 꼭 닮았구나. 내 아들 요셉이구나.', e: 'cry' },
    { cam: [x0 + 1.4, gh + 1.6, z0 + 4], look: [x0, gh + 1.6, z0 + 4.8], dur: 7, n: '요셉', t: '아버지… 스무 해 남짓, 하나님은 하루도 저를 떠나지 않으셨어요.', e: 'cry' },
    { cam: [x0 + 6, gh + 1.7, z0 + 6], look: [x0 - 2, gh + 1.2, z0 + 10.5], dur: 7, t: '형들은 멀찍이 선 채 고개를 들지 못했습니다. 그날 헤브론에서 아버지께 피 묻은 옷을 내밀던 손들이었습니다.' },
    { cam: [x0 + 3.0, gh + 1.6, z0 + 8.0], look: [x0 + 1, gh + 1.5, z0 + 10.5], dur: 6, n: '베냐민', t: '아버지가 웃으셔… 형, 스무 해 만에 처음이야.', e: 'cry' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 7, n: '야곱', t: '요셉아, 네 아이들은 어디 있느냐. 이 늙은 아비가 손주들 얼굴을 보고 싶구나.', e: 'tender' },
    { cam: [x0 + 1.4, gh + 1.6, z0 + 4], look: [x0, gh + 1.6, z0 + 4.8], dur: 6, n: '요셉', t: '므낫세와 에브라임이에요, 아버지. 곧 데려올게요. 아버지 무릎에 앉혀 드릴게요.', e: 'tender' },
    { fn: () => { cpose(null); const j = G.npc('jacob'); if (j) j.emote = null; }, cam: [x0 + 18, gh + 9, z0 + 18], cam2: [x0 + 22, gh + 14, z0 + 22], look: [x0, gh + 1, z0 + 3], dur: 9, fadeOut: 1.2,
      t: '야곱의 집 사람으로 애굽에 이른 자의 도합이 칠십명이었더라.', ref: '창세기 46:27' },
  ], () => { placeGoshen(S); G.teleport(x0 + 2, z0 - 4, 0); next && next(); });
}
function cinPharaoh(S, G, next) { const [cx, cz] = SPOTS.court, ch = hAt(cx, cz), FIVE = ['reuben', 'judah', 'levi', 'asher', 'benjamin2'];
  cine([
    { hour: 10, fn: () => { S.q.pharShow = 1; G.teleport(cx + 1.6, cz - 1, Math.PI); FIVE.forEach((id, i) => showAt(id, cx - 2.4 + i * 1.2, cz + 1.4, Math.PI)); showAt('jacob', cx, cz - 2.4, Math.PI); },
      cam: [cx + 6, ch + 3, cz + 6], look: [cx, ch + 1.4, cz - 6], dur: 7, music: 'j_finale', t: '요셉이 형들중 오인을 택하여 바로에게 보이니', ref: '창세기 47:2' },
    { cam: [cx - 2, ch + 2.4, cz - 2], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 6, n: '바로', t: '너희 생업이 무엇이냐?', ref: '창세기 47:3' },
    { cam: [cx + 2.4, ch + 1.5, cz - 1], look: [cx - 1, ch + 1.4, cz + 1.4], dur: 8, n: '유다', t: '종들은 목자이온데 우리와 선조가 다 그러하니이다. 하고 그들이 또 바로에게 고하되 가나안 땅에 기근이 심하여 종들의 떼를 칠 곳이 없기로 종들이 이곳에 우거하러 왔사오니 청컨대 종들로 고센 땅에 거하게 하소서…', ref: '창세기 47:3–4' },
    { cam: [cx - 1.6, ch + 2.2, cz - 3], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 8, n: '바로', t: '애굽 땅이 네 앞에 있으니 땅의 좋은 곳에 네 아비와 형들로 거하게 하되 고센 땅에 그들로 거하게 하고, 그들 중에 능한 자가 있는 줄을 알거든 그들로 나의 짐승을 주관하게 하라.', ref: '창세기 47:6' },
    { cam: [cx + 1.6, ch + 1.6, cz - 4.2], look: [cx, ch + 1.5, cz - 2.4], dur: 7, n: '바로', t: '네 나이가 얼마냐?', ref: '창세기 47:8' },
    { cam: [cx - 1.2, ch + 1.6, cz - 1.2], look: [cx, ch + 1.5, cz - 2.4], dur: 9, n: '야곱', t: '내 나그네 길의 세월이 일백 삼십년이니이다. 나의 연세가 얼마 못되니 우리 조상의 나그네 길의 세월에 미치지 못하나 험악한 세월을 보내었나이다.', ref: '창세기 47:9', e: 'weary' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = 'raiseHands'; }, cam: [cx + 3, ch + 2, cz - 0.6], look: [cx, ch + 1.6, cz - 3.4], dur: 7, t: '야곱이 바로에게 축복하고 그 앞에서 나오니라.', ref: '창세기 47:10' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = null; placeGoshen(S); }, cam: [GOSHEN[0] + 20, GH() + 10, GOSHEN[1] - 16], cam2: [GOSHEN[0] + 14, GH() + 6, GOSHEN[1] - 10], look: [GOSHEN[0], GH() + 1, GOSHEN[1]], dur: 10, fadeIn: 1,
      t: '요셉이 바로의 명대로 그 아비와 형들에게 거할 곳을 주되 애굽의 좋은 땅 라암세스를 그들에게 주어 기업을 삼게 하고, 또 그 아비와 형들과 아비의 온 집에 그 식구를 따라 식물을 주어 공궤하였더라.', ref: '창세기 47:11–12' },
  ], () => { S.q.pharShow = 0; next && next(); });
}
// --- 나이 순서 자리 (창 43:33): the brothers were seated "the firstborn according to his birthright"
function seatPuzzle(S, G, done) { let k = 0, miss = 0; const ORD = BRO11;
  const ask = () => { if (k >= ORD.length) { done(miss); return; } const rest = ORD.slice(k), right = ORD[k], pool = rest.slice(1).sort(() => Math.random() - 0.5).slice(0, 3), opts = [right].concat(pool).sort(() => Math.random() - 0.5);
    say([{ n: '요셉', t: `${k + 1}번째 자리에는…`, choices: opts.map(id => ({ t: `${NM[id] || '베냐민'} (${AGE[id]})`, then: () => { if (id === right) { k++; Gm().sfx('coin', { pitch: 1 + k * 0.03 }); setTimeout(ask, 30); } else { miss++; setTimeout(() => say([T(`음… ${NM[right] || '베냐민'}이(가) 더 먼저 태어났어요. 레아의 네 아들, 빌하의 두 아들, 실바의 두 아들, 다시 레아의 두 아들, 그리고 라헬의 베냐민 순서예요.`)], ask), 30); } } })) }], null); };
  ask(); }

const STEPS7 = {
  g1_spy: { ch: 8, obj: '청지기에게 형들의 자루를 채우라 이르기', target: 'npc:steward2',
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
      { n: '요셉', t: '(무엇이라 답할까?)', choices: [{ t: '"이곳 간수장은 내가 아는 이다. 너를 잘 대하라 일러 두겠다."' }, { t: '"…네 하나님이 너를 잊지 않으셨을 것이다."' }] },
      T('요셉은 시므온에게 빵과 물을 넣어 주게 하고 옥을 나섰습니다. 문을 나서자마자 눈시울이 붉어졌습니다.'), T('(이 만남은 성경에 기록되지 않은 「IF」 장면이에요.)')], () => tick(S, 'visitS')); } },
    check: S => qd(S, 'visitS'), done(S, G, next) { hide(['simeon']); cinJudahPledge(S, G, next); }, next: 'g3_feast' },
  g3_feast: { ch: 8, obj: '형들을 집으로 맞아 나이 순서대로 자리 정하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10 },
    enter(S, G, re) { atHouse(S); if (!re) cinFeast(S, G, () => { atHouse(S); GG.UI.toast('식탁 옆에서 「잔치 음식 차리기」 · 형들 앞에서 「자리 정하기」', true); }); },
    list: S => [{ t: '잔치 음식 차리기 (직접 만든 요리나 청지기에게)', ok: qd(S, 'feastDish') }, { t: '나이 순서대로 자리 정하기', ok: qd(S, 'seated') }, { t: '베냐민에게 줄 몫 정하기', ok: qd(S, 'portion') }],
    check: S => qd(S, 'feastDish') && qd(S, 'seated') && qd(S, 'portion'), done(S, G, next) { cinMarvel(S, G, next); }, next: 'g4_cup' },
  g4_cup: { ch: 8, obj: '청지기에게 은잔을 베냐민의 자루에 넣게 하기', target: 'npc:steward2', enter(S) { atHouse(S); },
    talk: { steward2(S, G) { if (S.q.cup) return false; say([N('steward2', '날이 밝으면 형제분들이 떠납니다. 무엇을 분부하시겠습니까?'),
      { n: '요셉', t: '(창세기 44:2)', choices: [{ t: '"나의 은잔을 막내의 자루 아귀에 넣으라."', then: () => setTimeout(() => say([N('steward2', '…은잔을요? 알겠습니다. 분부대로 하겠습니다.', '', 'fear'), T('요셉은 형들이 베냐민을 버리고 갈지, 끝까지 지킬지 보려 했어요.')], () => tick(S, 'cup')), 30) },
        { t: '"아무것도 넣지 말라. 평안히 보내라."', then: () => setTimeout(() => say([T('요셉은 마지막으로 형들의 마음을 시험해 보기로 했어요. 형들은 이번에도 막내를 버리고 갈까요?')], () => setTimeout(() => G.talkTo('steward2'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'cup'), done(S, G, next) { cinCup(S, G, () => cinPlea(S, G, next)); }, next: 'g5_reveal' },
  g5_reveal: { ch: 8, obj: '형들 앞에서 결단하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 8 },
    enter(S, G, re) { atHouse(S); G.teleport(G7HOUSE[0], G7HOUSE[1], 0);
      setTimeout(() => { if (Gm().S().step !== 'g5_reveal') return; say([T('유다의 간청이 끝났습니다. 요셉은 더 이상 참을 수 없었습니다.'), { n: '요셉', t: '(어떻게 할까?)', choices: [
        { t: '"모든 사람은 내게서 물러가라."', then: () => tick(Gm().S(), 'revealJ') },
        { t: '조금 더 엄하게 대한다', then: () => setTimeout(() => say([T('요셉의 마음이 이미 무너지고 있었어요. 형들은 변했어요 — 유다가 아우 대신 종이 되겠다고 했잖아요.'), { n: '요셉', t: '(이제…)', choices: [{ t: '"모든 사람은 내게서 물러가라."', then: () => tick(Gm().S(), 'revealJ') }] }], null), 30) }] }], null); }, re ? 900 : 300); },
    check: S => qd(S, 'revealJ') /* v18.58 q.reveal was already set back in chapter 1 (the slave market), so this step finished the instant it began: the scene played over the question and the choice came after it */, done(S, G, next) { cinIAmJoseph(S, G, () => narr([{ kick: '창세기 45:5', title: '나는 요셉이라', t: '"하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다." 스무 해의 눈물이 화해로 바뀌었습니다. 이제 아버지를 모셔 올 차례예요.', ref: '창세기 45:5' }], next)); }, next: 'g6_wagons' },
  // =============================================================== 8장 · 고센 땅
  g6_wagons: { ch: 9, obj: '아버지께 보낼 수레 채비', list: S => [{ t: '성읍 곳간에서 곡식 자루 싣기', ok: qd(S, 'wGrain') }, { t: '장터에서 애굽의 좋은 물품 고르기', ok: qd(S, 'wGoods') }, { t: '형들에게 옷 나눠 주기 (청지기)', ok: qd(S, 'wClothes') }],
    target: S => !qd(S, 'wGrain') ? { x: G7GRAN[0], z: G7GRAN[1] - 2 } : !qd(S, 'wGoods') ? { x: -22, z: -71 } : 'npc:steward2',
    enter(S, G, re) { S.q.broShow = 0; S.q.famShow = 0; BRO11.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); { const a = G.npc('asenath'); if (a) a.forceVis = undefined; } /* v18.56 Asenath comes back after the reveal (she was sent out for 45:1) */ showAt('steward2', 15, -138.6, -0.6); /* v18.22 the steward is back at the house (the cup scene left him out on the road, so 「옷 나눠 주기」 pointed at an empty spot) */ if (!re) narr([{ kick: '창세기 45:17–20', title: '바로의 명령', t: '바로가 요셉에게 이르되 「너희는 애굽 땅에서 수레를 가져다가 너희 자녀와 아내를 태우고 너희 아비를 데려오라. 온 애굽 땅의 좋은 것이 너희 것임이니라」', ref: '창세기 45:17–20' }]); },
    talk: { steward2(S, G) { if (S.q.wClothes || !S.q.wGrain || !S.q.wGoods) return false; say([N('steward2', '형제분들께 드릴 옷을 마련해 두었습니다. 어떻게 나누어 드릴까요?'),
      { n: '요셉', t: '(창세기 45:22)', choices: [{ t: '모두에게 한 벌씩, 베냐민에게는 은 삼백과 옷 다섯 벌', then: () => setTimeout(() => say([N('steward2', '알겠습니다. 막내분께는 각별히요.', '', 'happy')], () => tick(S, 'wClothes')), 30) },
        { t: '모두 똑같이 한 벌씩', then: () => setTimeout(() => say([N('steward2', '알겠습니다. 모두 같게 준비하겠습니다.'), T('성경은 베냐민에게 은 삼백과 옷 다섯 벌을 주었다고 기록해요. 그리고 요셉은 형들에게 「길에서 다투지 말라」고 당부했어요.', '창세기 45:22, 24')], () => tick(S, 'wClothes')), 30) } /* v18.42 both answers are accepted: equal gifts are not 'wrong' after a story about favouritism */] }], null); } },
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
    check: S => qd(S, 'coach'), done(S, G, next) { cinPharaoh(S, G, () => narr([{ kick: '창세기 47:27', title: '고센 땅', t: '이스라엘 족속이 애굽 고센 땅에 거하며 거기서 산업을 얻고 생육하며 번성하였더라.', ref: '창세기 47:27' }], next)); }, next: 'j_end' },
};
{ const end = steps.j_end; delete steps.j_end; Object.assign(steps, STEPS7); steps.j_end = end; ORDER = Object.keys(steps); }
steps.c6_sell.next = 'g1_spy';
// v18.13d the feast table (창 43:16 「짐승을 잡고 준비하라」): Joseph sets out a dish he cooked himself, or leaves it to the steward
function feastDish(S, G) { const H = GG.Hearth, CU = GG.Cuisine; if (!H) { tick(S, 'feastDish'); return; }
  const tierOf = k => (CU && CU.CLS && CU.CLS[k] ? CU.CLS[k][1] : 1), clsOf = k => (CU && CU.CLS && CU.CLS[k] ? CU.CLS[k][0] : 'mixed');
  const mine = H.ALL.filter(k => G.inv(k) > 0).sort((a, b) => tierOf(b) - tierOf(a)).slice(0, 3);
  const hunted = k => (GG.Hunt && GG.Hunt.NEW && GG.Hunt.NEW[k]) || clsOf(k) === 'meat';
  const serve = k => { G.take(k, 1); S.q.feastDish = k; const t = tierOf(k), n = G.ITEMS[k].n;
    const lines = t >= 4 ? [N('judah', `「${n}」… 이런 잔칫상은 처음 봅니다. 애굽의 총리께서 손수 차리신 것 같군요.`, '', 'awe'), N('benjamin', '형들, 이것 좀 봐요! 아버지 장막의 잔치 같아요!', '', 'happy')]
      : hunted(k) ? [N('judah', `「${n}」… 들에서 잡은 짐승 맛이 납니다. 고향 들판이 생각나는군요.`, '', 'tender'), N('reuben', '우리 아우가 있었다면 이런 사냥 솜씨였을 텐데…', '', 'sad')]
      : clsOf(k) === 'sweet' ? [N('benjamin', `「${n}」! 달아요. 어머니가 살아 계실 때 이런 걸 해 주셨대요.`, '', 'happy')]
      : [N('judah', `「${n}」… 정성이 담긴 음식이군요. 감사히 먹겠습니다.`, '', 'calm')];
    say(lines.concat([T(t >= 3 ? '요셉은 돌아서서 눈가를 훔쳤습니다. 형들은 이 음식을 누가 만들었는지 모릅니다.' : '형들이 음식을 나누며 조금씩 긴장을 풀었어요.')]), () => tick(S, 'feastDish')); };
  const ch = mine.map(k => ({ t: `${G.ITEMS[k].n} 올리기${tierOf(k) >= 3 ? ' ★' : ''}`, then: () => setTimeout(() => serve(k), 30) }));
  ch.push({ t: '청지기에게 맡기기', then: () => setTimeout(() => say([N('steward2', '알겠습니다. 짐승을 잡아 정오 잔치를 준비하겠습니다.', '창세기 43:16')], () => { S.q.feastDish = 'steward'; tick(S, 'feastDish'); }), 30) });
  say([{ n: '요셉', t: mine.length ? '형들 앞에 무엇을 차릴까? (직접 사냥하고 요리한 음식이면 더 좋아요)' : '가방에 요리가 없어요. 모닥불에서 만들어 오거나 청지기에게 맡길 수 있어요.', choices: ch }], null); }
specials.push({ id: 'g_dish', x: SPOTS.josephHouse[0] - 2.4, z: SPOTS.josephHouse[1] + 10, r: 3.2, label: '잔치 음식 차리기', on: S => S.step === 'g3_feast' && !S.q.feastDish, use: (S, G) => feastDish(S, G) });
// the seating and the portion: actions in the courtyard while the feast is on
specials.push({ id: 'g_seat', x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '자리 정하기', on: S => S.step === 'g3_feast' && !S.q.seated,
  use: (S, G) => { say([T('나이 많은 형부터 막내 베냐민까지, 형들이 태어난 순서대로 자리를 정해 주세요. (창세기 43:33)')], () => seatPuzzle(S, G, miss => say([T(miss ? `틀린 곳이 ${miss}번 있었지만, 마침내 모두 제자리에 앉았어요.` : '단번에 맞혔어요! 형들이 서로 놀란 얼굴로 바라봅니다.')], () => tick(S, 'seated')))); } },
  { id: 'g_portion', x: SPOTS.josephHouse[0] + 2, z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '베냐민의 몫 정하기', on: S => S.step === 'g3_feast' && S.q.seated && !S.q.portion,
    use: (S, G) => say([{ n: '요셉', t: '베냐민에게는 얼마나 줄까?', choices: [{ t: '다른 형들과 똑같이' }, { t: '두 배' }, { t: '다섯 배', then: () => tick(S, 'portion') }] }], () => { if (!S.q.portion) GG.UI.toast('성경에는 베냐민의 몫이 다른 사람보다 「다섯 배」였다고 해요 (창 43:34)'); }) },
  { id: 'g_grain', x: G7GRAN[0], z: G7GRAN[1] - 2, r: 3.2, label: '곡식 자루 싣기', on: S => S.step === 'g6_wagons' && !S.q.wGrain, use: (S, G) => { GG.UI.toast('수레에 곡식 자루를 실었어요 · 암나귀 열 필 분량'); tick(S, 'wGrain'); } },
  { id: 'g_goods', x: -22, z: -71, r: 4, /* v18.34 the city market (SPOTS.market is the slave market far south) */ label: '애굽의 좋은 물품 고르기', on: S => S.step === 'g6_wagons' && !S.q.wGoods,
    use: (S, G) => say([{ n: '요셉', t: '아버지께 무엇을 보낼까? (창세기 45:23)', choices: [{ t: '고운 세마포와 꿀, 대추야자, 향품', then: () => tick(S, 'wGoods') }, { t: '금 장신구와 우상 조각', then: () => setTimeout(() => GG.UI.toast('아버지는 하나님만 섬기셨어요 · 다른 걸 골라 봐요'), 30) }] }], null) });

// ------------------------------------------------------------------ 고센 마을 (free journey, IF)
const goshenOn = S => !!S.q.goshen && idx(S) >= ORDER.indexOf('j_end');
const QUESTS = {
  /* v18.13 Joseph starts with a staff; Pharaoh's huntsman gives the vizier a sling and a first hunt */
  e_hunt: { giver: 'hunterE', title: '왕의 사냥꾼과 첫 사냥', when: S => idx(S) >= ORDER.indexOf('c5_patrol'),
    offer: ['총리 나으리, 동쪽 들의 들짐승이 곡식 밭을 자꾸 헤집어 놓습니다. 저와 함께 사냥해 주시겠습니까?', '이건 제가 쓰던 물매입니다. 목자 출신이시라니 금방 손에 익으실 겁니다. 돌도 몇 개 챙겨 드리지요.'],
    obj: [{ t: (S, G2, st) => `동쪽 들에서 토끼나 가젤 사냥 (${Math.min(2, GG.Life.killsSince(st, ['hare', 'gazelle']))}/2)`, ok: (S, G2, st) => GG.Life.killsSince(st, ['hare', 'gazelle']) >= 2 }], loc: () => ({ x: 48, z: -40 }),
    start(S) { S.flags.slingOK = 1; const C = GG.Combat; if (C) { C.giveGear('sling'); S.hero.mode = 'ranged'; if (!Gm().hand()) Gm().hold('weapon'); } if ((S.inv.stone || 0) < 8) Gm().give('stone', 8 - (S.inv.stone || 0), true); GG.UI.featCard && GG.UI.featCard('sling', { kick: '새 무기', n: '물매', ic: 'star', d: '왼쪽 무기 단추로 근접 ↔ 물매를 바꿔요 · 「쏘기」를 누르고 있다가 놓아요' }); GG.UI.hud(); },
    prog: '동쪽 들입니다. 몸을 낮추고 바람을 등지고 다가가십시오.', done: ['목자 출신이라 하시더니 솜씨가 과연 대단하십니다!', '이제 물매와 활 만드는 법도 알려 드리지요. 메뉴 → 장비에서 만들 수 있습니다.'],
    reward: { silver: 12, items: { meat: 2, sinew: 2, smooth: 3 }, xp: 24 } },
  g_lamb: { giver: 'reuben', title: '르우벤의 길 잃은 어린양', when: goshenOn, repeat: 5,
    offer: ['아우야, 어린양 한 마리가 무리에서 떨어져 나갔다. 저 광야 쪽으로… 가 줄 수 있겠느냐?', '…예전 같으면 내가 너를 찾으러 갔어야 했는데. 이젠 네게 부탁하는구나.'],
    obj: [{ t: '광야의 샘 근처에서 어린양 데려오기', ok: S => !!S.q.gLamb }], loc: () => ({ x: 90, z: 25 }),
    start(S) { S.q.gLamb = 0; const G = Gm(); if (!G.npc('glamb')) G.spawnNPC({ id: 'glamb', name: '길 잃은 어린양', animal: 'sheep', x: 88, z: 30, wander: 2, label: '어린양 안아 들기', talkR: 2.4, noBond: true }); },
    prog: '광야의 샘 쪽이다. 해 지기 전에 찾아 다오.', done: ['찾았구나! 허허… 잃은 하나를 찾아 돌아오는 게 이렇게 기쁜 일이었구나.', '요셉아, 그때… 정말 미안했다.'],
    reward: { silver: 8, items: { wool: 2, milk: 1 }, heart: 1 } },
  g_tent: { giver: 'levi', title: '레위의 장막 말뚝', when: goshenOn, repeat: 4, offer: ['바람이 세서 장막 말뚝이 자꾸 빠지는구나. 단단한 나뭇가지 다섯 개만 구해 주겠느냐?'],
    obj: [{ t: '나뭇가지 5개', ok: S => Gm().have('branch', 5) }], take: { branch: 5 }, prog: '나뭇가지 다섯 개면 된다. 들판 덤불에 마른 가지가 많더라.',
    done: S => (S.side && S.side.done && S.side.done.g_tent !== undefined) ? ['이제 바람이 불어도 끄떡없겠다. 고맙다, 아우야.'] : [N('levi', '(말뚝을 박다가 손을 멈추고) …요셉아, 이 손이 예전엔 세겜에서 칼을 들었었다. 아버지가 우리 이름을 들으면 지금도 한숨을 쉬시지.', '', 'sad'),
      { n: '요셉', t: '(무엇이라 말할까?)', choices: [{ t: '"형님 손은 이제 집을 세우는 손이에요."', lines: [N('levi', '…집을 세우는 손이라. (말뚝을 다시 쥐며) 그래, 그런 손으로 살아 보마.', '', 'tender')] },
        { t: '(말없이 망치를 받아 함께 말뚝을 박는다)', lines: [T('두 형제는 해가 질 때까지 말없이 말뚝을 박았습니다. 레위의 장막은 고센에서 가장 단단한 장막이 되었습니다.')] }] },
      N('levi', '이제 바람이 불어도 끄떡없겠다. 고맙다, 아우야.', '', 'happy')], reward: { silver: 6, items: { cheese: 1 } } }, /* v18.60 the first time it is more than five sticks (창 34 · 49:5–7: Levi's hands) */
  g_bread: { giver: 'judah', title: '유다네 아이들의 빵', when: goshenOn, repeat: 3, offer: ['우리 집 꼬맹이들이 애굽 빵이 그렇게 맛있다는구나. 빵 세 덩이만 구해 줄 수 있겠느냐?'],
    obj: [{ t: '빵 3개 (도성 장터 곡식·잡화 장수)', ok: S => Gm().have('bread', 3) }], take: { bread: 3 }, loc: () => Gm().have('bread', 3) ? null : { x: -18, z: -76 }, /* v18.60 the way to the bread, not to Judah */ prog: '빵 세 덩이면 아이들이 춤을 출 거다. 장터 빵 장수나 화덕에서 구하면 되겠지.',
    done: S => (S.side && S.side.done && S.side.done.g_bread !== undefined) ? ['얘들아, 요셉 삼촌이 빵을 가져왔다! …이 녀석들 웃는 소리 좀 들어 봐라.'] : [N('judah', '얘들아, 요셉 삼촌이 빵을 가져왔다! …이 녀석들 웃는 소리 좀 들어 봐라.', '', 'happy'),
      N('judah', '(아이들을 바라보다가) 흉년에 내 아이들이 굶을까 밤마다 잠을 못 잤다. 그때 알았지. 베냐민을 내놓으라던 그 총리 앞에서, 아버지 마음이 어땠을지.', '', 'tender'),
      { n: '요셉', t: '(무엇이라 말할까?)', choices: [{ t: '"형님은 그 마음으로 베냐민 대신 종이 되겠다고 하셨잖아요."', lines: [N('judah', '(웃으며 고개를 젓는다) 그 말을 한 게 내 평생에 제일 잘한 일이다. 그 덕에 네 얼굴을 다시 봤으니.', '', 'happy')] },
        { t: '"형님 아이들은 이 고센에서 배곯을 일 없을 거예요."', lines: [N('judah', '네 곳간 덕분이지. …아니, 너를 거기 먼저 보내신 분 덕분이지.', '', 'tender')] }] }], reward: { silver: 10, heart: 1 } }, /* v18.60 창 43:8–9 · 44:33 */
  g_story: { giver: 'jacob', title: '아버지와 저녁 이야기', when: goshenOn, repeat: 2, offer: ['요셉아, 오늘 저녁 모닥불가에서 이 늙은 아비와 이야기 좀 하자꾸나.'],
    obj: [{ t: '고센 모닥불가에 앉기 (저녁)', ok: S => S.flags.fsNight === (S.time % 24 < 5 ? S.day - 1 : S.day) && Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - GOSHEN[1]) < 30 }], loc: () => ({ x: GOSHEN[0], z: GOSHEN[1] + 1 }),
    prog: '해가 지면 모닥불가로 오너라.', done: ['네 할아버지 이삭도, 증조할아버지 아브라함도 이렇게 불가에서 하나님 이야기를 하셨단다.', '내가 벧엘에서 본 사다리… 하나님은 그때 한 약속을 다 지키셨구나. 너를 내게 돌려주셨으니.'],
    reward: { insight: 1, items: { jacobGift: 1 } } },
  g_benj: { giver: 'benjamin2', title: '베냐민과 별 세기', when: goshenOn, repeat: 3, offer: ['형! 어릴 때 형이 별 이야기 해 줬던 거 기억나? 오늘 밤 모래 언덕에서 같이 별 보자.'],
    obj: [{ t: '남쪽 모래 언덕에서 별 바라보기 (밤)', ok: S => { const r = (S.flags.sev || {}).stars; return !!(r && r.n && r.n > (S.q.gbStars || 0)); } }], loc: () => ({ x: -6, z: 198 }),
    start(S) { const r = (S.flags.sev || {}).stars; S.q.gbStars = r ? r.n : 0; const b = Gm().ENT.npcs.benjamin2; if (b) b.follow = true; GG.UI.toast('베냐민이 함께 걸어요 · 남쪽 모래 언덕으로'); }, finish(S) { const b = Gm().ENT.npcs.benjamin2; if (b) b.follow = false; }, /* v18.56 he comes along: 「같이 별 보자」 */ prog: '형, 같이 가자! 남쪽 모래 언덕이야. 밤에!', done: ['형, 별이 정말 셀 수 없이 많더라. 아브라함 할아버지 약속 이야기, 이제 나도 내 아이들한테 해 줄 거야.'],
    reward: { heart: 1, items: { raisins: 2 } } },
};
// the lamb is picked up by talking to it
const lambTalk = GG.Life && GG.Life.talk;
if (GG.Life) GG.Life.talk = function (id) { if (id === 'glamb') { const S = Gm().S(); S.q.gLamb = 1; Gm().removeNPC('glamb'); GG.UI.toast('어린양을 품에 안았어요 · 르우벤에게 데려가요'); return true; } return lambTalk.apply(this, arguments); };
// keep the Goshen camp (fixed records) and the family in place after loading
const RT_G = { t: 0 };
function goshenTick(dt, S) { if (!S || !S.q || !S.q.goshen || idx(S) < ORDER.indexOf('g8_pharaoh')) return; if ((RT_G.t -= dt) > 0) return; RT_G.t = 2;
  if (!S.flags.gvil) goshenCamp(S); if (!RT.gPlaced && !(GG.Cine && GG.Cine.on)) { RT.gPlaced = 1; placeGoshen(S); } }
// =================================================================== v18.67 프롤로그 다시 짜기 · 「형들을 찾아서」 (e_prologue.js · 설계표_프롤로그_v18_67.md)
/* 지금의 여덟 단계를 요셉이 직접 겪는 장면으로 늘려요. 걷는 길은 건너뛰지 않아요(a_map.js의 구불구불한 큰길).
   ① 헤브론의 새벽: 이부자리 개기 → 엘닷의 부탁 · 우물에서 세숫물 긷기 → 아버지 대야에 붓기 → 아버지의 부탁(창 37:13–14) · 걱정 · 채색옷(37:3)
   ② 채비: 레아의 보따리 · 물가죽 부대(우물에서 채우기) · 엘닷의 지팡이와 땅바닥 지도 · 베냐민의 약속 → 배웅
   ③ 큰길: 길 표시 돌무더기(집중) · 상수리나무 그늘에서 쉬기 · 지친 나그네에게 물 나누기(소식)
   ④ 목동 아이 미가: 우는 아이 → 가시덤불의 새끼양(안고 오기) → 나뭇가지 여섯 · 텐트 세우기 → 해 질 녘 자칼 둘 쫓기
      → 미가의 아버지(보리 · 소금 · 렌틸) → 미가네 장막에서 첫 밤
   ⑤ 둘째 날 길: 마른 시내 · 올리브 밭 · 가나안 마을 우물(물 긷기를 돕고 물과 빵) → 해 질 녘 세겜 골짜기를 내려다보는 언덕
   ⑥ 세겜 들판 어귀의 밤: 마른 나뭇가지 셋 → 부싯돌 · 불씨 → 요리(보리떡 · 렌틸 죽) → 먹기 → 열한 별(창 37:9) → 불가에서 자기
   ⑦ 세겜 들판: 흔적 넷(식은 재 · 발굽 자국 · 돌 표시 · 깨진 물동이) → 헤매기(창 37:15) → 들판의 사람(37:15–17) · 언덕까지 함께 걷기
   ⑧ 도단 길: 바위 골짜기 → 도단 우물가 여인들 → 언덕에서 형들이 먼저 본다(37:18) → 도단 들판(37:19–24) */
Object.assign(NM, { shepBoy: '목동 아이 미가', prDad: '미가의 아버지', prTrav: '지친 나그네', prWellW: '우물가의 가나안 여인', prDotW1: '도단 우물가의 여인', prDotW2: '물동이 진 소녀', hServ: '종 엘닷' });
{ const sb = npcs.find(n => n.id === 'shepBoy'); if (sb) Object.assign(sb, { name: '목동 아이 미가', x: SPOTS.micah[0], z: SPOTS.micah[1], wander: 0, show: S => between(S, 'p_road', 'p_road2') && !(S.q.pr && S.q.pr.mGone), chat: ['형, 그 알록달록한 옷 정말 멋지다!', '우리 양들 중에 제일 말썽쟁이는 꼬리 까만 녀석이야.'] }); }
{ const hs = npcs.find(n => n.id === 'hServ'); if (hs) hs.name = '종 엘닷'; }
npcs.push(
  { id: 'prTrav', name: '지친 나그네', look: { skin: 0xb88456, top: 0x8a7a60, trim: 0x4a3a2a, hair: 0xb8b0a6, beard: 'long', beardCol: 0xd0c8be, age: 'old', headwear: 'cloth', clothCol: 0xc8b896, bandCol: 0x4a3a2a, legWrap: 0x6a5a48 }, x: SPOTS.shadeOak[0] + 1.6, z: SPOTS.shadeOak[1] - 1.2, face: 0.9, sit: true, talkR: 2.8, noBond: true, show: S => S.step === 'p_road' },
  { id: 'prDad', name: '미가의 아버지', look: { skin: 0xc08a5a, top: 0x8a8462, under: 0xd0c4a4, trim: 0x5a4a32, belt: 0x4a3420, hair: 0x2a1c14, beard: 'short', beardCol: 0x2a1c14, headwear: 'band', bandCol: 0x9a3a2a, goatskin: true, legWrap: 0x6a5a48 }, x: SPOTS.micahTent[0] + 4, z: SPOTS.micahTent[1] + 2, face: -1.2, prop: 'staff', talkR: 2.8, noBond: true, show: S => !!(S.q.pr && S.q.pr.mi >= 6) && before(S, 'p_night') },
  { id: 'prWellW', name: '우물가의 가나안 여인', look: { skin: 0xc8946a, fem: true, long: true, top: 0x9a5a3a, under: 0x9a5a3a, trim: 0x3a3a5a, headwear: 'veil', clothCol: 0xd8c8a8, clothStripe: 0x9a5a3a, hair: 0x2a1a12 }, x: SPOTS.hamletWell[0] + 1.4, z: SPOTS.hamletWell[1] + 0.6, face: -1.6, talkR: 2.8, noBond: true, act: 'gather', show: S => between(S, 'p_road2', 'p_night') },
  { id: 'prDotW1', name: '도단 우물가의 여인', look: { skin: 0xc08a5a, fem: true, long: true, top: 0x6a7a5a, under: 0x6a7a5a, trim: 0x8a3a2a, headwear: 'veil', clothCol: 0xe0d4bc, clothStripe: 0x6a7a5a, hair: 0x1a1410 }, x: SPOTS.dothanWell[0] + 1.6, z: SPOTS.dothanWell[1], face: -1.5, talkR: 2.8, noBond: true, show: S => S.step === 'p_dothan' },
  { id: 'prDotW2', name: '물동이 진 소녀', look: KID({ fem: true, top: 0xb8a47e, hairStyle: 'braid' }), scale: 0.78, x: SPOTS.dothanWell[0] - 1.4, z: SPOTS.dothanWell[1] + 1.2, face: 1.2, talkR: 2.4, noBond: true, show: S => S.step === 'p_dothan', chat: ['언니, 물동이가 너무 무거워요.', '아저씨 옷 진짜 예쁘다!'] });
for (let i = 0; i < 5; i++) npcs.push({ id: 'prFlock' + i, name: '미가네 양', animal: i === 3 ? 'goat' : 'sheep', pattern: i === 1 ? 'black' : 'plain', x: SPOTS.micah[0] - 6 + (i % 3) * 2.2, z: SPOTS.micah[1] - 4 + Math.floor(i / 3) * 2, wander: 4, noTalk: true, noTag: true, show: S => between(S, 'p_road', 'p_road2') });
/* the old pick-ups are now part of the scenes: the bread comes from Leah, the straw bed is not where he sleeps (he sleeps by his fire) */
{ for (const sp of specials) { if (sp.id === 'restBed') sp.on = () => false; if (sp.id === 'bread') { sp.label = '양식 챙기기 (빵 · 무화과 · 보리 · 렌틸)'; const u0 = sp.use; sp.use = (S, G) => { u0(S, G); G.give('barley', 2); G.give('lentil', 3); G.UI.toast('빵 · 무화과 · 보리 · 렌틸을 가방에 넣었어요'); }; } } } /* v18.72 he packs his own food (Leah's bundle was not in Scripture) */

const PR = S => S.q.pr || (S.q.pr = { mi: 0, br: {}, fb: {}, clue4: 0 });
const nearG = (x, z, r) => Math.hypot(Gm().P.x - x, Gm().P.z - z) < r;
const prPop = (t, s, ic) => (GG.UI.pop || GG.UI.toast)(t, s, ic || 'star');
const mg = (k, o, cb) => GG.UI.minigame(k, o, cb);
const BRANCH_M = [[168, 104], [161, 108], [170, 95]]; /* round Micah's camp · v18.80 three different things (not six of the same): a long pole, pegs, a stone */
const FIND_M = [['쓰러진 나무에서 긴 장대 끌어오기', 'gather', 1.4, 'branch', 2, '기둥 할 장대예요.'], ['마른 덤불에서 말뚝감 꺾기', 'pick', 1, 'branch', 2, '짧고 단단한 가지 넷, 말뚝감이에요.'], ['말뚝 박을 납작한 돌 줍기', 'pick', 0.9, 'stone', 1, '손에 꼭 맞는 납작한 돌이에요.']];
const BRANCH_O = [[SPOTS.restOak[0] - 4, SPOTS.restOak[1] + 3], [SPOTS.restOak[0] + 3.5, SPOTS.restOak[1] + 4.5], [SPOTS.restOak[0] - 2.5, SPOTS.restOak[1] - 4.5]];
const TENT_RY = 2.6;
const BRANCH_C = [[137.5, 99.5], [145.5, 99], [139, 92.5]]; /* round the first night's camp (CAMP1) */

/* the places on the road: a shade oak, the waystone, Micah's flock pen and things, the hamlet and its well, the Dothan well, boulders in the gorge */
const CAMP1 = [141, 96.5]; /* v18.72 the first night: his own fire beside the road */
stations.push({ id: 'fCamp1', type: 'fire', x: CAMP1[0], z: CAMP1[1], r: 3, on: S => !!(S.q && S.q.camp1Lit) || !before(S, 'p_road2') });
function proBuild(W, P) {
  P((g, M) => { g.cyl(0.42, 0.48, 0.42, 14, { m: M, at: [0, 0.21, 0], c: 0x9a8e7e, j: 0.06 }); g.lathe([[0.42, 0.42], [0.56, 0.6], [0.62, 0.68]], 20, { m: M, c: 0xb5673a, j: 0.03 }); g.lathe([[0.62, 0.68], [0.52, 0.68]], 20, { m: M, c: 0xc47a48, j: 0.02 }); g.lathe([[0.52, 0.68], [0.4, 0.47]], 20, { m: M, c: 0x8a4a2a, j: 0.02 }); g.lathe([[0.4, 0.47], [0.001, 0.47]], 20, { m: M, c: 0x5a3a24, j: 0 }); /* (an open bowl: the outer wall, the rim, the inner wall going down, the bottom — the lid-like top is gone) */ }, 172.4, 149.9, { col: { r: 0.62, h: 0.75 } }); P('jars', 173.5, 151.1, { args: [1], col: null }); P('stool', 170.8, 150.6); /* v18.78 the basin before Jacob's tent: a wide clay basin on a stone stand (it was a small jug and bowl) — empty until water is poured (f_runtime dyn) */
  P('baskets', 179.3, 152.7, { args: [2] }); P('loaves', 178.6, 152.5, { dy: 0.02 }); P('pots', 182.7, 155.8, { ry: 0.6 }); /* the food and the waterskins he packs */
  for (const [dx, dz, s, dy] of [[0, 0, 0.9, 0], [0.15, 0.1, 0.6, 0.55], [-0.05, 0, 0.38, 0.95]]) P('rock', SPOTS.waystone[0] + dx, SPOTS.waystone[1] + dz, { s, dy, keep: 1 }); /* a cairn, not a field of stones */
  P('pots', SPOTS.clue4[0] + 0.4, SPOTS.clue4[1] + 0.2, { ry: 2.2, s: 0.7 }); /* the broken jar */
  P('campfire', CAMP1[0], CAMP1[1], { col: { r: 0.8, h: 0.5 } }); P('woodStack', CAMP1[0] + 1.9, CAMP1[1] + 1.1, { ry: 0.5 });
  P('oak', SPOTS.shadeOak[0], SPOTS.shadeOak[1], { s: 1.4, col: { r: 0.6, h: 3 } });
  P('rockField', SPOTS.waystone[0], SPOTS.waystone[1], { s: 0.45 }); W.addCol({ x: SPOTS.waystone[0], z: SPOTS.waystone[1], r: 0.7, h: 1 });
  P('fence', SPOTS.micah[0] - 6, SPOTS.micah[1] - 7.5, { args: [7] }); P('trough', SPOTS.micah[0] - 3, SPOTS.micah[1] - 6.2, { ry: 0.3 }); P('sacks', SPOTS.micahTent[0] - 2.4, SPOTS.micahTent[1] + 2.2); P('woodStack', SPOTS.micahTent[0] + 3.4, SPOTS.micahTent[1] - 1.6, { ry: 0.4 });
  for (const [x, z] of [[SPOTS.micahLamb[0] - 1.2, SPOTS.micahLamb[1] + 0.8], [SPOTS.micahLamb[0] + 1.1, SPOTS.micahLamb[1] - 0.6], [SPOTS.micahLamb[0], SPOTS.micahLamb[1] + 1.6]]) P('caperBush', x, z, { s: 1.2 });
  for (let i = 0; i < 12; i++) { const x = 150 + (i % 4) * 6.5, z = 54 + Math.floor(i / 4) * 6; P('olive', x, z, { s: 0.9 }); } /* an olive grove beside the second day's road */
  const [hx, hz] = SPOTS.hamlet; P('house', hx - 4, hz + 3, { ry: 0.3, args: [{ w: 5, d: 4.5, h: 2.6, c: 0xc4b08c }], col: { w: 5, d: 4.5, h: 2.9, cam: true } }); P('house', hx + 3, hz + 6, { ry: -0.2, args: [{ w: 4.5, d: 4, h: 2.5, c: 0xb8a684 }], col: { w: 4.5, d: 4, h: 2.8, cam: true } });
  P('well', SPOTS.hamletWell[0], SPOTS.hamletWell[1]); W.addCol({ x: SPOTS.hamletWell[0], z: SPOTS.hamletWell[1], r: 1.6, h: 1.1 }); P('jars', SPOTS.hamletWell[0] + 2.2, SPOTS.hamletWell[1] - 1.4, { args: [3] });
  P('well', SPOTS.dothanWell[0], SPOTS.dothanWell[1]); W.addCol({ x: SPOTS.dothanWell[0], z: SPOTS.dothanWell[1], r: 1.6, h: 1.1 }); P('trough', SPOTS.dothanWell[0] - 3.2, SPOTS.dothanWell[1] + 1.6, { ry: 0.6 });
  P('well', SPOTS.dothanWell[0] + 9, SPOTS.dothanWell[1] - 6); W.addCol({ x: SPOTS.dothanWell[0] + 9, z: SPOTS.dothanWell[1] - 6, r: 1.6, h: 1.1 }); /* 「도단」: two wells */
  for (const [dx, dz, s] of [[-2.6, -1, 0.9], [2.8, 1.2, 0.8], [-4.4, 3, 1.1], [4.4, -3.4, 1]]) P('rock', SPOTS.gorge[0] + dx, SPOTS.gorge[1] + dz, { s, keep: 1, col: { r: 0.8 * s, h: 0.7 } });
}

// ------------------------------------------------------------------ hands-on things (CTX)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || p.ride || p.act || G.cineOn || GG.UI.busy()) return null; const st = S.step, q = PR(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); }; /* (the scene's own thing wins over chatting with whoever stands by the well) */
  if (st === 'p_wake') {
    if (!q.fold) at(SPOTS.bedHeb[0], SPOTS.bedHeb[1], 2.4, { label: '이부자리 개기', key: 'prFold', use: () => { p.emote = { k: 'gather', t: 0, dur: 1.6 }; G.sfx('rustle', { vol: 0.5 }); q.fold = 1; GG.UI.quest(); setTimeout(() => GG.Life.bubble('hServ', '도련님, 일어나셨어요?', 3), 900); } });
    if (q.ask && !q.water) at(160, 150, 3, { label: '우물에서 세숫물 긷기', key: 'prDraw', use: () => mg('balance', { title: '물동이 이고 가기', hint: '물이 넘치지 않게 가운데를 맞춰요. 아버지의 세숫물이에요.', dur: 7 }, ok => { if (!ok) { GG.UI.toast('물이 출렁 넘쳤어요 · 다시 길어요'); return; } q.water = 1; G.sfx('splash', { vol: 0.5 }); GG.UI.quest(); GG.UI.toast('물동이를 들었어요 · 아버지 장막 앞 대야로 가요'); }) });
    if (q.water && !q.wash) at(172.4, 149.2, 2.6, { label: '대야에 세숫물 붓기', key: 'prWash', use: () => { p.emote = { k: 'pick', t: 0, dur: 1.2 }; G.sfx('splash', { vol: 0.6 }); q.wash = 1; q.washAt = RT.t; G.FX.burst(172.4, hAt(172.4, 149.9) + 0.75, 149.9, 18, { c: [0.6, 0.78, 0.92], sp: 0.7, up: 1, size: 0.06, g: 6, life: 0.7 }); GG.UI.quest(); } }); } /* v18.78 the water rises in the basin (no made-up word of Jacob's) */
  if (st === 'p_provision' && !q.staff) at(SPOTS.bedHeb[0], SPOTS.bedHeb[1], 2.4, { label: '목자 지팡이 챙기기', key: 'prStaff', use: () => { G.giveTool ? G.giveTool('staff') : (S.tools.staff = true); S.hand = 'staff'; q.staff = 1; p.emote = { k: 'pick', t: 0, dur: 0.9 }; GG.UI.hud && GG.UI.hud(); GG.UI.quest(); GG.UI.toast('지팡이를 손에 들었어요 · 들짐승을 쫓을 때 「공격」 단추'); G.checkStep(); } });
  if (st === 'p_provision' && q.skinGot && !q.skinFull) at(160, 150, 3, { label: '물가죽 부대에 물 채우기', key: 'prSkin', use: () => { p.emote = { k: 'gather', t: 0, dur: 1.4 }; G.sfx('splash', { vol: 0.5 }); S.water = S.jarMax || 12; q.skinFull = 1; GG.UI.quest(); GG.UI.hud && GG.UI.hud(); GG.UI.toast('물가죽 부대가 가득 찼어요 · 왼쪽의 물 단추로 마셔요'); } });
  if (st === 'p_road') {
    if (!q.stone) at(SPOTS.waystone[0], SPOTS.waystone[1], 3, { label: '길 표시 돌무더기 살피기', key: 'prStone', use: () => { q.stone = 1; GG.UI.quest(); say([T('목자들이 쌓아 둔 길 표시예요. 맨 위 돌이 북쪽을 가리켜요.'), T('눈 모양 「집중」 단추를 누르면 갈 길과 살펴볼 것이 빛나요. 길이 헷갈릴 때 써 보세요.')]); } });
    if (q.stone && !q.shade) at(SPOTS.shadeOak[0], SPOTS.shadeOak[1], 4.2, { label: '그늘에 앉아 물 마시기', key: 'prShade', use: () => { if (G.hour() < 12) S.time = GG.Game.clockTo(S, 12.3, 0); p.emote = { k: 'sitg', t: 0, dur: 4 }; S.water = Math.max(0, (S.water || 0) - 1); G.sfx('drink', { vol: 0.5 }); q.shade = 1; GG.UI.quest(); setTimeout(() => say([T('한낮에 햇볕 아래 오래 있으면 더위가 차올라요. 나무나 건물 그림자 속에 들면 식어요.')]), 1800); } }); }
  if (st === 'p_road' || st === 'p_micah') {
    if (q.mi === 3) BRANCH_M.forEach(([x, z], i) => { const f = FIND_M[i]; if (!q.br[i] && f) at(x, z, 2, { label: f[0], key: 'prBr' + i, use: () => { q.br[i] = 1; p.emote = { k: f[1], t: 0, dur: f[2] }; G.give(f[3], f[4]); G.sfx(i === 1 ? 'rustle' : 'pickup'); GG.UI.toast(f[5]); GG.UI.quest(); const n = [0, 1, 2].filter(k => q.br[k]).length; if (n === 1) GG.Life.bubble('shepBoy', '맞아요, 그거예요!', 2.6); if (n >= 3) { q.mi = 4; GG.UI.quest(); prPop('장대 · 말뚝감 · 돌을 모았어요', '텐트 자리(평평한 풀밭)에서 「텐트 세우기」', 'house'); } } }); });
    if (q.mi === 4) at(SPOTS.micahTent[0], SPOTS.micahTent[1], 3.2, { label: '텐트 세우기', key: 'prTent', use: buildTent });
    if (q.mi === 1 && !q.lamb) at(SPOTS.micahLamb[0], SPOTS.micahLamb[1], 2.8, { label: '가시덤불에서 새끼양 떼어 내기', key: 'prLamb', use: () => mg('push', { title: '가시에 걸린 털 떼어 내기', hint: '살살 당겨요. 너무 세게 당기면 새끼양이 놀라요.', btn: '살살 당기기' }, ok => { if (!ok) { GG.UI.toast('새끼양이 버둥거려요 · 다시 살살'); return; } q.lamb = 1; q.mi = 2; lambFollow(); GG.UI.quest(); say([J('쉿, 괜찮아. 이제 미가에게 가자.', '', 'tender'), T('새끼양이 요셉을 따라와요. 미가에게 데려가요.')]); }) });
  }
  if (st === 'p_micah') { q.cb = q.cb || {};
    BRANCH_C.forEach(([x, z], i) => { if (!q.cb[i]) at(x, z, 1.9, { label: `마른 나뭇가지 줍기 (${Object.keys(q.cb).length}/3)`, key: 'prCb' + i, use: () => { q.cb[i] = 1; p.emote = { k: 'pick', t: 0, dur: 0.9 }; G.sfx('pickup'); GG.UI.quest(); } }); });
    if (Object.keys(q.cb).length >= 3 && !S.q.camp1Lit) at(CAMP1[0], CAMP1[1], 3, { label: '불 피우기', key: 'prFire1', use: () => lightFire(S, 'camp1') }); }
  if (st === 'p_night' && !S.q.oakLit) at(SPOTS.restOak[0], SPOTS.restOak[1], 3, { label: '어젯밤처럼 불 피우기', key: 'prFire', use: () => { p.emote = { k: 'gather', t: 0, dur: 1.6 }; S.q.oakLit = 1; G.sfx('fire', { vol: 0.6 }); GG.UI.quest(); say([T('어젯밤 배운 대로 마른 나뭇가지를 모아 불을 피웠어요.'), T('밤하늘에 별이 하나둘 돋아요. 오른쪽 아래 ✦ 「별자리」 단추를 눌러 별을 이어 보세요.')]); } });
  if (st === 'p_shechem' && !q.clue4) at(SPOTS.clue4[0], SPOTS.clue4[1], 2.4, { label: '깨진 물동이 살피기', key: 'prClue4', use: () => { q.clue4 = 1; S.q.clues = (S.q.clues || 0) + 1; GG.UI.quest(); say([T('깨진 물동이가 버려져 있어요. 목자들이 머물다 간 자리예요.')], () => G.checkStep()); } });
  return out.length ? out : null; });

// ------------------------------------------------------------------ pieces of the scenes
function lambFollow() { const G = Gm(); let n = G.npc('prLamb'); if (!n) n = G.spawnNPC({ id: 'prLamb', name: '새끼양', animal: 'sheep', scale: 0.6, x: SPOTS.micahLamb[0], z: SPOTS.micahLamb[1], noTalk: true, noTag: true }); n.follow = true; if (!G.P.follow.includes(n)) G.P.follow.push(n); }
function buildTent() { const S = Gm().S(), q = PR(S), G = Gm();
  say([N('shepBoy', '여기가 좋아요! 평평하고, 바위가 바람을 막아 줘요.', '', 'happy'), T('장대를 세우고 미가의 염소털 천을 덮은 뒤, 말뚝을 돌로 박아 줄을 매요.')], () =>
    mg('count', { title: '말뚝 박기', hint: '주운 돌로 말뚝 머리를 쳐서 땅에 박아요.', need: 6, btn: '탕!', onPress: () => G.sfx('thud', { pitch: 1.2, vol: 0.5 }) }, ok => { if (!ok) { GG.UI.toast('기둥이 기울었어요 · 다시 박아요'); return; }
      mg('push', { title: '천 덮고 줄 당기기', hint: '꾹 눌러 줄을 팽팽하게 당겨요.', btn: '당기기' }, ok2 => { if (!ok2) { GG.UI.toast('천이 흘러내렸어요 · 다시 당겨요'); return; }
        const Bd = GG.Build; if (Bd && Bd.prebuild && !S.flags.prTent) { S.flags.prTent = 1; Bd.prebuild(S, 'tent', SPOTS.micahTent[0], SPOTS.micahTent[1], TENT_RY, '미가네 장막'); if (Bd.attach) try { Bd.attach(S, G.W()); } catch (e) { } }
        G.take && G.take('branch', Math.min(4, G.inv ? G.inv('branch') : 4)); q.mi = 5; G.sfx('craft'); GG.UI.quest(); if (G.hour() < 18) S.time = GG.Game.clockTo(S, 18.1, 0);
        say([N('shepBoy', '와, 진짜 장막이다! 형, 고마워요!', '', 'happy'), T('「짓기」로 세운 텐트예요. 궂은 날에는 이런 텐트 안에서만 잘 수 있어요. 요셉도 나중에 짓기 메뉴로 자기 텐트를 칠 수 있어요.'), T('해가 기울었습니다. 저 멀리 덤불 쪽에서 무언가 움직여요…', '', 'fear')], jackals); }); }));
}
function jackals() { const S = Gm().S(), q = PR(S), C = GG.Combat; if (!C || !C.spawn) { q.mi = 6; return; }
  if (!C.WILD.jackalP) C.WILD.jackalP = Object.assign({}, C.WILD.jackal, { n: '굶주린 자칼', hp: 16, beh: 'hunt', aggro: 32, sight: 32, dmg: 4, speed: 6.4, flee: 0 });
  for (let k = 0; k < 2; k++) { const a = C.spawn('jackalP', SPOTS.micah[0] + 16 + k * 2, SPOTS.micah[1] - 10 + k * 3, { special: 'prJackal', scale: 0.9 }); a.st = 'chase'; }
  const b = Gm().npc('shepBoy'); if (b) { Gm().npcWalk('shepBoy', SPOTS.micahTent[0], SPOTS.micahTent[1] + 0.6, () => { b.act = 'sitHug'; }, 2.6); GG.Life.bubble('shepBoy', '형! 자칼이에요!', 3); }
  q.mi = 5.5; GG.UI.quest(); if (GG.Game.P && !S.hand && S.tools.staff) { S.hand = 'staff'; GG.UI.hud && GG.UI.hud(); }
  GG.UI.hint && GG.UI.hint('지팡이를 들고 「공격」 단추로 자칼을 쫓아요', 'sword', 'atk'); }
function jackalsLeft() { const C = GG.Combat; if (!C || !C.wild) return 0; const P = Gm().P; return C.wild().filter(a => a.special === 'prJackal' && a.hp > 0 && Math.hypot(a.x - P.x, a.z - P.z) < 45).length; }
function sleepTent(S) { const G = Gm(), q = PR(S); fade(() => { G.P.emote = null; G.teleport(SPOTS.micahTent[0], SPOTS.micahTent[1], TENT_RY + Math.PI); }, () => {
    GG.Sleep && GG.Sleep.sky ? GG.Sleep.sky('미가네 장막에서 첫 밤을 보냅니다. 염소털 천 너머로 양들이 뒤척이는 소리가 들려요.', () => { q.mi = 8; S.time = 6.2; S.day += 1; G.teleport(SPOTS.micahTent[0] - Math.sin(TENT_RY) * 2.8, SPOTS.micahTent[1] - Math.cos(TENT_RY) * 2.8, TENT_RY); G.go('p_road2'); }) : (q.mi = 8, G.go('p_road2')); }); }
function lightFire(S, which) { const G = Gm();
  say([T('둥글게 놓은 돌 가운데 마른 풀과 잔가지를 모았어요. 부싯돌로 불씨를 만들어요.')], () =>
    mg('rhythm', { title: '부싯돌 치기', hint: '불똥이 마른 풀에 떨어지게, 줄에 닿을 때 쳐요.', need: 5, onHit: () => { G.sfx('flint', { pitch: 0.9 + Math.random() * 0.25 }); const p = Gm().P; G.FX.burst(p.x + Math.sin(p.face) * 0.5, hAt(p.x, p.z) + 0.25, p.z + Math.cos(p.face) * 0.5, 8, { c: [1, 0.75, 0.3], sp: 1, up: 1.2, size: 0.04, g: 4, life: 0.4 }); } }, ok => { /* v18.78 팅! — the flint (it used to be silent: rhythm calls onHit) */ if (!ok) { GG.UI.toast('불똥이 튀지 않았어요 · 다시 쳐요'); return; }
      let blowT = 0; mg('push', { title: '불씨 불어 넣기', hint: '꾹 눌러 숨을 길게 불어 넣다가, 숨이 차면 잠깐 쉬어요.', btn: '후—', onTick: (dt, on) => { blowT -= dt; if (on && blowT <= 0) { blowT = 1.0; G.sfx('blow', { dur: 0.95 }); } } }, ok2 => { /* v18.78 후~ */ if (!ok2) { GG.UI.toast('불씨가 꺼졌어요 · 다시 불어요'); return; }
        if (which === 'camp1') S.q.camp1Lit = 1; else S.q.oakLit = 1; G.sfx('fire', { vol: 0.6 }); GG.UI.quest(); say([T('불이 붙었어요. 모닥불이 생겼어요.'), T('맑은 밤에는 불가에서 「불가에서 자기」로 잘 수 있어요. 비 · 모래바람 · 추위가 심한 궂은 밤에는 텐트나 집에서만 자요.')]); }); }));
}

// ------------------------------------------------------------------ the steps
/* Micah's story (a side story: not in Scripture) — he can be met on the road (p_road) and by the first night (p_micah) */
function micahEnter(S, G, re) { const b = G.npc('shepBoy'); if (b && PR(S).mi === 0) { b.act = 'sitHug'; GG.Life.bubble('shepBoy', '흑흑… 어떡해…', 3); } if (re && PR(S).mi >= 1 && PR(S).mi < 3 && PR(S).lamb) lambFollow(); if (re && PR(S).mi === 5.5) PR(S).mi = 5; if (re && PR(S).mi === 5) setTimeout(jackals, 1500); }
const MICAH_TALK = {
      shepBoy(S, G) { const q = PR(S), b = G.npc('shepBoy');
        if (q.mi === 0) { say([N('shepBoy', '흑… 새끼양이 없어졌어요. 아빠가 오기 전에 찾아야 하는데…', '', 'cry'), J('울지 마. 어느 쪽으로 갔는지 봤니?'), N('shepBoy', '저쪽, 덤불 골짜기 쪽으로요. 작은 발자국이 있을 거예요.'),
          T('「집중」을 켜면 작은 발굽 자국이 보여요. 따라가 보세요.')], () => { q.mi = 1; if (b) b.act = null; GG.UI.quest(); }); return; }
        if (q.mi === 2) { if (G.dist(b.x, b.z) > 4) return; const l = G.npc('prLamb'); if (l) { l.follow = false; G.P.follow = G.P.follow.filter(f => f !== l); G.npcWalk('prLamb', SPOTS.micah[0] - 4, SPOTS.micah[1] - 3, () => { l.wander = { r: 3, cx: l.x, cz: l.z, tx: null, wait: 2 }; }, 1.2); }
          say([N('shepBoy', '찾았다! 아이고, 너 어디 갔었어!', '', 'happy'), N('shepBoy', '고마워요, 형! …형, 하나만 더 도와줄래요? 아빠가 해 지기 전에 장막을 쳐 두라고 했는데, 저 혼자서는 기둥을 못 세워요.'),
            J('그래, 같이 하자. 뭐가 필요하니?'), N('shepBoy', '천이랑 줄은 있어요. 기둥 할 긴 장대랑, 말뚝 할 짧은 가지, 그리고 말뚝 박을 돌이 하나 필요해요!'), T('주변을 돌며 장대 · 말뚝감 · 돌을 하나씩 찾아요(A). 찾은 것은 「가방」에 들어가요.')], () => { q.mi = 3; GG.UI.quest(); }); return; }
        if (q.mi >= 7) { say([N('shepBoy', '형, 또 와요! 우리 양들이 형 기억할 거예요.', '', 'happy')]); return; }
        say([N('shepBoy', ['형, 나뭇가지 저기도 있어요!', '형 최고!', '자칼 무서워요…'][Math.min(2, Math.floor(q.mi / 2.5))])]); },
      prDad(S, G) { const q = PR(S); if (q.mi !== 6) { if (q.mi >= 7) say([N('prDad', '길 조심하시오, 젊은이.')]); return; }
        say([N('prDad', '미가야! 무사하냐? …아니, 이분은 누구시냐?', '', 'fear'), N('shepBoy', '아빠! 이 형이 새끼양도 찾아 주고, 장막도 같이 쳐 주고, 자칼도 쫓아 줬어요!', '', 'happy'),
          N('prDad', '허허… 이 고마움을 어찌 갚는다. 그 고운 옷을 보니 헤브론 야곱 어른 댁 아드님이시구려.', '', 'tender'), J('형들을 찾아 세겜에 가는 길이에요.'),
          N('prDad', '세겜까지는 아직 하루 길이오. 이건 우리 저녁거리지만 가져가시오. 보리랑 소금, 렌틸이오. 불에 익혀 먹으면 든든할 거요.'),
          N('prDad', '해 지기 전에 길을 서두르시오. 불을 꼭 피우고 주무시오. 자칼은 불을 무서워하오.')], () => { G.give('barley', 2); if (G.ITEMS && G.ITEMS.salt) G.give('salt', 1); G.give('lentil', 3); q.mi = 8; GG.UI.quest(); prPop('곁이야기 · 목동 아이 미가', '보리 2 · 렌틸 3 (소금)을 받았어요', 'bag'); }); }
};
const MICAH_OBJ = { 0: '길가에서 우는 아이', 1: '덤불 골짜기에서 새끼양 찾기 (집중)', 2: '새끼양을 미가에게 데려가기', 3: '장대 · 말뚝감 · 돌 찾기', 4: '텐트 자리에서 텐트 세우기', 5: '자칼이 다가와요!', 5.5: '지팡이로 자칼 쫓기 (공격 단추)', 6: '미가의 아버지와 이야기하기' };
function micahList(S) { const q = PR(S); return q.mi > 0 && q.mi < 8 && MICAH_OBJ[q.mi] ? [{ t: '곁이야기 · ' + MICAH_OBJ[q.mi], ok: false }] : []; }
function micahJackals(S) { const q = PR(S); if (q.mi !== 5.5 || jackalsLeft() > 0) return; q.mi = 6; GG.UI.hint && GG.UI.hint(null); GG.UI.quest(); prPop('자칼을 쫓아냈어요', '미가의 아버지가 돌아와요', 'star'); const G = Gm(); if (G.npc('prDad')) { const d = G.npc('prDad'); d.x = SPOTS.micah[0] + 18; d.z = SPOTS.micah[1] - 12; G.npcWalk('prDad', SPOTS.micahTent[0] + 3, SPOTS.micahTent[1] + 1.5, null, 1.8); } const b = G.npc('shepBoy'); if (b) b.act = null; }
const PRO_STEPS = {
  p_wake: { ch: 1, obj: S => { const q = PR(S); return !q.fold ? '장막에서 일어나 이부자리 개기' : !q.wash ? '아버지의 세숫물 떠다 드리기' : '아버지 야곱께 가기'; },
    list: S => { const q = PR(S); return [{ t: '이부자리 개기', ok: !!q.fold }, { t: '종 엘닷과 이야기하기', ok: !!q.ask }, { t: '우물에서 세숫물 긷기', ok: !!q.water }, { t: '아버지 장막 앞 대야에 붓기', ok: !!q.wash }]; },
    target: S => { const q = PR(S); return !q.fold ? { x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1] } : !q.ask ? 'npc:hServ' : !q.water ? { x: 160, z: 150 } : !q.wash ? { x: 172.4, z: 149.2 } : 'npc:jacob'; },
    enter(S, G, re) { S.q.tut = S.q.tut || 'move'; if (!re) { if (G.hour() > 7 || G.hour() < 5) S.time = 5.6; G.teleport(SPOTS.bedHeb[0] - 0.8, SPOTS.bedHeb[1] - 0.8, -2.4); setTimeout(() => GG.UI.hint && GG.UI.hint('동이 텄어요. 장막 안 이부자리에 다가가 A(행동)로 개요', 'sun', 'act'), 1400); } },
    talk: {
      hServ(S, G) { const q = PR(S); if (!q.fold || q.ask) return false; say([N('hServ', '도련님, 일어나셨어요? 주인어른께서도 막 깨셨어요.'), N('hServ', '우물에서 세숫물을 떠다 드리면 좋아하실 거예요. 물동이는 우물가에 있어요.')], () => { q.ask = 1; GG.UI.quest(); }); },
      jacob(S, G) { const q = PR(S); if (!q.wash) { say([T('아버지 장막 앞 대야가 비어 있어요. 우물에서 세숫물을 떠다 부어요.')]); return; }
        say([T('요셉이 떠 온 물로 야곱이 얼굴을 씻었습니다.'),
          N('jacob', '네 형들이 세겜에서 양을 치지 아니하느냐? 너를 그들에게로 보내리라.', '창세기 37:13'), J('내가 그리하겠나이다.', '창세기 37:13', 'calm'),
          N('jacob', '가서 네 형들과 양떼가 다 잘 있는 여부를 보고 돌아와 내게 고하라.', '창세기 37:14'),
          T('이스라엘이 여러 아들보다 요셉을 깊이 사랑하므로 그를 위하여 채색옷을 지었더니', '창세기 37:3'), T('채색옷은 따뜻하지만, 멀리서도 눈에 잘 띄어요. 세겜까지는 사흘 길이에요. 길 떠날 채비를 해요.')], () => { S.q.tut = 'items'; G.go('p_provision'); }); } } },
  p_provision: { ch: 1, obj: S => { const q = PR(S); return !S.q.bread ? '길 떠날 채비 · 양식 챙기기' : !q.skinFull ? (S.q.skin ? '우물에서 물가죽 부대 채우기' : '물가죽 부대 챙기기') : !q.staff ? '장막에서 지팡이 챙기기' : '길 떠날 채비'; },
    list: S => { const q = PR(S); return [{ t: '양식 챙기기 (불가의 바구니)', ok: !!S.q.bread }, { t: '물가죽 부대 챙겨 우물에서 채우기', ok: !!q.skinFull }, { t: '장막에서 지팡이 챙기기', ok: !!q.staff }]; },
    target: S => { const q = PR(S); return !S.q.bread ? { x: 178.9, z: 152.2 } : !S.q.skin ? { x: 182.2, z: 155.2 } : !q.skinFull ? { x: 160, z: 150 } : !q.staff ? { x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1] } : null; },
    enter(S) { const q = PR(S); if (S.q.skin) q.skinGot = 1; },
    check: S => { const q = PR(S); if (S.q.skin) q.skinGot = 1; return !!S.q.bread && !!q.skinFull && !!q.staff; },
    done(S, G, next) { S.q.tut = 'run'; const P = G.P;
      cine([{ cam: [P.x + 2.4, hAt(P.x, P.z) + 1.6, P.z - 3], look: [170.6, hAt(170.6, 150.8) + 1.4, 150.8], dur: 5, t: '그를 헤브론 골짜기에서 보내니, 그가 세겜으로 가니라.', ref: '창세기 37:14' }], () => { G.UI.toast('오른쪽 위 작은 지도를 누르면 큰 지도가 열려요 · 노란 화살표가 갈 곳이에요'); next(); }); },
    next: 'p_road' },
  p_road: { ch: 1, obj: S => { const q = PR(S); return !q.stone ? '북쪽 세겜으로 · 길 표시 돌무더기 살피기' : !q.shade ? '한낮 · 길가 상수리나무 그늘에서 쉬기' : '큰길 따라 북쪽으로 · 길가 야영 자리'; },
    list: S => { const q = PR(S); return [{ t: '길 표시 돌무더기 살피기 (집중)', ok: !!q.stone }, { t: '상수리나무 그늘에서 쉬기', ok: !!q.shade }, { t: '해 질 녘까지 길가 야영 자리로', ok: false }].concat(q.shade ? [{ t: '지친 나그네 (그냥 지나가도 돼요)', ok: !!q.trav }] : []).concat(micahList(S)); },
    target: S => { const q = PR(S); return !q.stone ? { x: SPOTS.waystone[0], z: SPOTS.waystone[1] } : !q.shade ? { x: SPOTS.shadeOak[0], z: SPOTS.shadeOak[1] } : { x: CAMP1[0], z: CAMP1[1] }; },
    enter(S, G, re) { micahEnter(S, G, re); if (!re) G.UI.toast('큰길은 언덕을 굽이굽이 돌아 북쪽으로 이어져요'); },
    check: (S, G) => { const q = PR(S); return !!q.stone && !!q.shade && G.dist(CAMP1[0], CAMP1[1]) < 8; },
    talk: { prTrav(S, G) { const q = PR(S); if (q.trav) { say([N('prTrav', '조심해서 가시오, 젊은이.')]); return; }
      say([N('prTrav', '…물… 물 한 모금만 얻을 수 있겠소? 해가 이리 뜨거울 줄 몰랐구려.', '', 'sad'), { n: '요셉', t: '(물가죽 부대의 물을 나눌까?)', choices: [
        { t: '물을 나눠 드린다', then: () => { S.water = Math.max(0, (S.water || 0) - 2); q.trav = 2; GG.Deeds && GG.Deeds.char && GG.Deeds.char('care', 'water'); setTimeout(() => say([T('나그네가 물을 천천히 마십니다.'), N('prTrav', '고맙소… 살 것 같구려.', '', 'tender'),
          N('prTrav', '보답으로 하나 일러 주리다. 세겜 들판에 히브리 목자들 양 떼가 있었는데, 며칠 전 북쪽으로 옮긴다는 말이 돌더군.'), J('북쪽으로요? 고맙습니다. 평안히 가세요.')], () => GG.UI.quest()), 30); } },
        { t: '물이 넉넉하지 않아 미안하다고 한다', then: () => { q.trav = 1; setTimeout(() => say([N('prTrav', '허허, 그렇지. 먼 길엔 물이 목숨이지. 조심해 가시오.')], () => GG.UI.quest()), 30); } }] }]); } },
    done(S, G, next) { GG.UI.hint && GG.UI.hint(null); next(); }, next: 'p_micah' },
  p_micah: { ch: 1, obj: S => { const q = PR(S), n = Object.keys(q.cb || {}).length; return n < 3 ? '첫날 밤 · 마른 나뭇가지 셋 줍기' : !S.q.camp1Lit ? '돌 둘레 한가운데에 불 피우기' : !q.cooked1 ? '불가에 앉아 「활동하기」 → 「요리하기」' : !q.ate1 ? '만든 음식 먹기 (가방)' : '불가에 앉아 「활동하기」 → 「불가에서 자기」'; },
    list: S => { const q = PR(S), n = Object.keys(q.cb || {}).length; return [{ t: `마른 나뭇가지 (${Math.min(3, n)}/3)`, ok: n >= 3 }, { t: '불 피우기', ok: !!S.q.camp1Lit }, { t: '같은 불에 요리하기', ok: !!q.cooked1 }, { t: '먹기', ok: !!q.ate1 }, { t: '불가에서 자기 (맑은 밤)', ok: false }]; },
    target: S => { const q = PR(S); const i = BRANCH_C.findIndex((b, k) => !(q.cb || {})[k]); return i >= 0 ? { x: BRANCH_C[i][0], z: BRANCH_C[i][1] } : { x: CAMP1[0], z: CAMP1[1] }; },
    enter(S, G, re) { const q = PR(S); q.cb = q.cb || {}; if (!q.n1) q.n1 = S.day; micahEnter(S, G, re); if (!re) { if (G.hour() < 18.2) S.time = GG.Game.clockTo(S, 18.3, 0); narr([{ kick: '창세기 37:14', title: '길에서 맞는 첫 밤', t: '해가 기울었습니다. 세겜까지는 아직 멀어요. 길가에서 마른 나뭇가지를 모아 불을 피우고 밤을 지내요.', ref: '' }]); } },
    talk: MICAH_TALK,
    check: S => S.day > (PR(S).n1 || 1e9), next: 'p_road2' },
  p_road2: { ch: 1, obj: S => { const q = PR(S); return !q.olive ? '둘째 날 · 큰길 따라 북쪽으로' : '해 질 녘 · 세겜 골짜기가 보이는 언덕으로'; },
    list: S => { const q = PR(S); return [{ t: '올리브 밭 지나기', ok: !!q.olive }, { t: '가나안 마을 우물 (도와도 되고 지나가도 돼요)', ok: !!q.well }, { t: '세겜 골짜기 내려다보기', ok: !!q.view }]; },
    target: S => { const q = PR(S); return !q.olive ? { x: 160, z: 52 } : { x: SPOTS.shechemView[0], z: SPOTS.shechemView[1] }; },
    enter(S, G, re) { if (!re) { PR(S).mGone = 1; narr([{ kick: '창세기 37:14', title: '둘째 날', t: '불에 흙을 덮고 다시 큰길에 올랐어요. 마른 시내를 건너고 올리브 밭을 지나면 작은 마을이 있어요.', ref: '' }]); } },
    check: (S, G) => { const q = PR(S); if (!q.olive && G.dist(160, 54) < 14) { q.olive = 1; GG.UI.quest(); GG.UI.toast('올리브 밭 · 가나안 사람들의 밭이에요'); }
      if (!q.view && G.dist(SPOTS.shechemView[0], SPOTS.shechemView[1]) < 5) { q.view = 1; viewShechem(S, G); } return !!q.view2; }, /* (the hamlet well is on the way; helping there is up to you) */
    talk: { prWellW(S, G) { const q = PR(S); if (q.well) { say([N('prWellW', '평안히 가시오. 해 지기 전에 골짜기에 닿을 거예요.')]); return; }
      say([N('prWellW', '아이고, 이 두레박 줄이 왜 이리 무거운지… 젊은이, 좀 거들어 주겠소?')], () =>
        mg('push', { title: '두레박 끌어올리기', hint: '꾹 눌러 줄을 당기다가, 팔이 아프면 잠깐 놓아요.', btn: '당기기' }, ok => { if (!ok) { GG.UI.toast('두레박이 다시 내려갔어요 · 다시 당겨요'); return; }
          G.sfx('splash', { vol: 0.5 }); S.water = S.jarMax || 12; G.give('bread', 1); q.well = 1; GG.UI.quest();
          say([N('prWellW', '고맙소! 자, 물가죽도 채우고, 이 빵도 가져가오.', '', 'happy'), N('prWellW', '그러고 보니 며칠 전에도 히브리 목자들이 여기서 물을 먹이고 세겜 들판 쪽으로 가더군. 조심해서 가시오.')]); })); } },
    next: 'p_night' },
  p_night: { ch: 1, obj: S => { const f = (S.flags.ex && S.flags.ex.stars) || {}; return !S.q.oakLit ? '세겜 들판 어귀 · 어젯밤처럼 불 피우기' : !f.eleven ? '하늘을 보며 별자리 찾기 (✦ 단추)' : '불가에 앉아 「활동하기」 → 「불가에서 자기」'; }, /* v18.78 the cooking and eating are the first night's (one fire, all of it) — no second round here */
    list: S => { const f = (S.flags.ex && S.flags.ex.stars) || {}; return [{ t: '불 피우기', ok: !!S.q.oakLit }, { t: '열한 별 찾기', ok: !!f.eleven }, { t: '불가에서 자기', ok: false }]; },
    target: () => ({ x: SPOTS.restOak[0], z: SPOTS.restOak[1] }),
    enter(S, G, re) { if (!re) { if (G.hour() < 18.6) S.time = GG.Game.clockTo(S, 18.7, 0); S.q.tut = null; G.UI.hint(null); narr([{ kick: '창세기 37:14', title: '세겜 들판 어귀', t: '해가 서쪽 산 너머로 넘어갔습니다. 들판 어귀의 큰 상수리나무 아래, 형들은 보이지 않았습니다. 요셉은 여기서 밤을 지내고 내일 찾아보기로 했습니다.', ref: '' }]); } } },
  p_shechem: { ch: 1, obj: S => (S.q.clues || 0) >= 4 ? (S.q.prLost ? '어느 쪽일까…' : '세겜 들판에서 형들 찾기') : '세겜 들판에서 형들 찾기',
    list: S => [{ t: `형들의 흔적 살피기 (${Math.min(4, S.q.clues || 0)}/4)`, ok: (S.q.clues || 0) >= 4 }],
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 37:14', title: '세겜 들판', t: '아침 해가 들판을 비추자, 요셉은 불에 흙을 덮고 짐을 쌌습니다. 형들의 양 떼는 보이지 않았습니다. 흔적을 찾아보세요. (「집중」이 도와줘요)', ref: '' }]); },
    target: S => { if ((S.q.clues || 0) >= 4) return null; const c = ['clue1', 'clue2', 'clue3'].find(k => !(S.q.cl || {})[k]); return c ? 'spot:' + c : !PR(S).clue4 ? { x: SPOTS.clue4[0], z: SPOTS.clue4[1] } : null; },
    check: S => { if ((S.q.clues || 0) < 4) return false; const q = PR(S); if (!S.q.prLost) { S.q.prLost = 1; q.lostT = 0; GG.UI.quest(); say([T('발자국이 여기저기로 흩어져 있어요. 어느 쪽인지 알 수 없어요.'), T('그가 들에서 방황하는지라', '창세기 37:15')]); } return q.lostT > 14; },
    done(S, G, next) { G.UI.hint(null); GG.Game.npcShow('man', true); /* v18.73 (no made-up call: 37:15 「어떤 사람이 그를 만난즉」) */ next(); }, next: 'p_man' },
  p_man: { ch: 1, obj: '들판의 어떤 사람과 이야기하기', target: 'npc:man',
    talk: { man(S, G) { if (S.q.prWalkDone) return false;
      say([T('어떤 사람이 그를 만난즉, 그가 들에서 방황하는지라.', '창세기 37:15'), N('man', '네가 무엇을 찾느냐?', '창세기 37:15'),
        J('내가 나의 형들을 찾으오니, 청컨대 그들의 양 치는 곳을 내게 가르치소서…', '창세기 37:16'),
        N('man', '그들이 여기서 떠났느니라. 내가 그들의 말을 들으니 「도단으로 가자」 하더라.', '창세기 37:17'),
        T('요셉이 그 형들의 뒤를 따라가서 도단에서 그들을 만나니라. 도단은 북쪽 골짜기 너머예요.', '창세기 37:17')], () => { S.q.prWalkDone = 1; GG.UI.quest(); G.npcWalk('man', 214, -30, () => G.npcShow('man', false), 1.5); G.checkStep(); }); } },
    check: S => !!S.q.prWalkDone, next: 'p_dothan' },
  p_dothan: { ch: 1, obj: S => { const q = PR(S); return !q.gorge ? '도단으로 · 바위 골짜기 지나기' : '언덕 너머 도단 평원으로'; },
    list: S => { const q = PR(S); return [{ t: '바위 골짜기 지나기 (바위는 점프로 넘어요)', ok: !!q.gorge }, { t: '도단 우물가 (물을 얻어도 되고 지나가도 돼요)', ok: !!q.dwell }]; },
    target: S => { const q = PR(S); return !q.gorge ? { x: SPOTS.gorge[0] + 1, z: SPOTS.gorge[1] - 8 } : !q.dwell ? 'npc:prDotW1' : 'spot:dothanView'; },
    talk: { prDotW1(S, G) { const q = PR(S); if (q.dwell) { say([N('prDotW1', '저 아래 들판이에요. 조심해서 가요.')]); return; }
      say([N('prDotW1', '물 좀 드시겠어요? 먼 데서 오신 것 같은데.'), J('고맙습니다. 혹시 히브리 목자들을 보셨나요? 제 형들이에요.'),
        N('prDotW1', '아, 열 명쯤 되는 형제들 말이지요? 어제 이 우물에서 양을 먹이고 저 아래 들판에 장막을 쳤어요.'),
        N('prDotW2', '아저씨 옷 진짜 예쁘다!', '', 'happy')], () => { S.water = S.jarMax || 12; q.dwell = 1; GG.UI.quest(); }); } },
    check: (S, G) => { const q = PR(S); if (!q.gorge && G.P.z < SPOTS.gorge[1] - 6) { q.gorge = 1; GG.UI.quest(); } return !!q.gorge && G.P.z < -98; }, /* (the well women are on the way; speaking to them is up to you) */
    done(S, G, next) { cinPlot(S, G, next); }, next: 'p_approach' }
};
/* the walk with the man: he leads to the northern rise and waits when Joseph falls behind */
const MAN_PATH = [[186, -20], [184, -32], [181, -42], [178, -48]];
function manWalk(S, dt) { const G = Gm(), n = G.npc('man'); if (!n || !S.q.prWalk || S.q.prWalkDone || GG.UI.busy()) return; const i = S.q.prWalkI | 0, d = G.dist(n.x, n.z);
  if (d > 7) { if (n.walk) n.walk = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); S.q.prWaitT = (S.q.prWaitT || 0) + dt; if (S.q.prWaitT > 5) { S.q.prWaitT = 0; GG.Life.bubble('man', '이쪽이오, 젊은이!', 2.6); } return; }
  if (!n.walk) { if (i >= MAN_PATH.length) { S.q.prWalkDone = 1; say([N('man', '여기서부터는 길이 하나요. 저 골짜기를 지나면 도단이오.'), N('man', '하나님이 자네 걸음을 지키시기를… 아니, 자네 아버지의 하나님이라고 했던가. 잘 가게.', '', 'tender'), J('고맙습니다! 평안히 가세요!', '', 'happy')], () => { G.npcWalk('man', 214, -30, () => G.npcShow('man', false), 1.5); G.checkStep(); }); return; }
    const [x, z] = MAN_PATH[i]; G.npcWalk('man', x, z, () => { S.q.prWalkI = i + 1; }, 1.4); if (i === 1) GG.Life.bubble('man', '도단 우물은 물맛이 좋다네.', 3); } }
/* the second day's view of the Shechem valley at dusk */
function viewShechem(S, G) { const p = G.P, x = SPOTS.shechemView[0], z = SPOTS.shechemView[1], h = hAt(x, z); if (G.hour() < 18.2) S.time = GG.Game.clockTo(S, 18.3, 0);
  cine([{ cam: [x - 1.5, h + 2.4, z + 2], cam2: [x - 1, h + 2.6, z + 1.2], look: [188, hAt(188, -12) + 4, -12], dur: 6, t: '해 질 녘, 언덕 위에서 두 산 사이로 펼쳐진 세겜 골짜기가 보였습니다. 들판 어귀에 큰 상수리나무 한 그루가 서 있었습니다.', music: 'j_night' }],
    () => { PR(S).view2 = 1; G.checkStep(); }); }
/* hooks: cooking, eating and sleeping by the fire on the Shechem night; the lost wander; the walk */
setTimeout(() => { if (GG.Hearth && GG.Hearth.cook) { const c0 = GG.Hearth.cook; GG.Hearth.cook = function () { const r = c0.apply(this, arguments); try { const S = Gm().S(); if (S && S.step === 'p_micah' && S.q.camp1Lit && !PR(S).cooked1) { PR(S).cooked1 = 1; GG.UI.quest(); setTimeout(() => GG.UI.toast('다 익었어요 · 「가방」에서 먹어요'), 600); } } catch (e) { } return r; }; } }, 0);
{ const e0 = GG.Game.eat; if (e0) GG.Game.eat = function () { const r = e0.apply(this, arguments); try { const S = Gm().S(); if (S && S.step === 'p_micah' && PR(S).cooked1 && !PR(S).ate1) { PR(S).ate1 = 1; GG.UI.quest(); setTimeout(() => say([T('배가 든든해졌어요. 이제 같은 불가에서 자요.')]), 800); } } catch (e) { } return r; }; }
/* sleeping by the fire on the Shechem night is the story's own night (the stars, the dream remembered) */
GG.storyNight = S => !!S && (S.step === 'p_micah' || S.step === 'p_night') && S.time % 24 >= 17.5; /* v18.78 the first two nights on the road: 「불가에서 자기」 even at dusk (not a nap that never ends the night) */
GG.prFireSleep = function (S) { if (!S) return false; const q = PR(S), f = (S.flags.ex && S.flags.ex.stars) || {};
  if (S.step === 'p_micah') { if (!q.cooked1 || !q.ate1) { GG.UI.toast(!q.cooked1 ? '자기 전에 이 불에 먹을 것을 지어요 · 「활동하기」 → 「요리하기」' : '먼저 만든 음식을 먹어요 (가방)'); return true; } return false; } /* v18.78 the first night: one fire, all of it */
  if (S.step !== 'p_night') return false;
  if (!S.q.oakLit) { GG.UI.toast('먼저 불을 피워요'); return true; }
  if (!f.eleven) { GG.UI.toast('잠들기 전에 하늘을 봐요 · ✦ 별자리 단추'); return true; }
  cinNight(S, Gm()); return true; };
PRO_STEPS.p_night.check = S => false;
PRO_STEPS.p_road.talk = Object.assign({}, MICAH_TALK, PRO_STEPS.p_road.talk); /* Micah can be met on the road */
function proTick(dt, S) { if (!S) return; try { if (S.step === 'p_shechem' && S.q.prLost) { const p = Gm().P; if (p.spd > 0.6) PR(S).lostT = (PR(S).lostT || 0) + dt; } if ((S.step === 'p_road' || S.step === 'p_micah') && PR(S).mi === 5.5) { PR(S).jT = (PR(S).jT || 0) - dt; if (PR(S).jT <= 0) { PR(S).jT = 0.5; micahJackals(S); } } } catch (e) { console.error('prologue', e); } }
/* put the new steps in order: the old p_wake … p_approach keys are kept (old saves land in them), p_micah and p_road2 slot in after p_road */
{ const keys = Object.keys(steps), at = keys.indexOf('p_road'); const rest = keys.slice(at + 1).map(k => [k, steps[k]]); for (const [k] of rest) delete steps[k];
  for (const k of ['p_wake', 'p_provision', 'p_road']) steps[k] = Object.assign({}, steps[k], PRO_STEPS[k]);
  steps.p_provision.talk = Object.assign({}, steps.p_provision.talk, { benjamin: () => false }); /* v18.73 Benjamin's made-up farewell (「약속!」 · the stone) is gone: he is quiet like everyone of the Bible (js/quiet.js) */
  steps.p_micah = PRO_STEPS.p_micah; steps.p_road2 = PRO_STEPS.p_road2;
  for (const [k, v] of rest) steps[k] = PRO_STEPS[k] ? Object.assign({}, v, PRO_STEPS[k]) : v;
  ORDER = Object.keys(steps); }
// =================================================================== v18.68 1장 다시 짜기 · 「구덩이와 노예 장터」 (e_ch1.js · 설계표_1장_v18_68.md)
/* ① 빈 구덩이: 1분 동안(게임 시간 오후 2시 → 6시) 실제로 기다려요. 둘러보기 · 기어오르기 · 형들 부르기(창 42:21) · 빵 냄새(37:25) · 벽 그림자 · 베냐민의 돌멩이 · 기도(세 단계)
      → 낙타 방울 소리 → 형들의 말(37:25–27) → 밧줄에 매달려 끌려 올라가기(37:28) → 흥정 · 애원 · 헤브론의 애통(지금 장면)
   ② 줄에 묶여 걷기 · 돌아보기 · 광야의 날들(지금 장면)
   ③ 광야의 모닥불 밤: 불 둘레 7m 안에서만 움직이고 사람에게 말을 걸 수 없어요. 물그릇 · 대추 한 알 · 낙타 곁 · 별과 기도 · 불가에서 자기 → 「여러 날 후」
   ④ 애굽 장터: 물통에서 씻기 → 줄 서기 · 늙은 가나안 포로의 귓속말 → 장터 단 위(지금 장면) · 가만히 서 있기 → 보디발 · 값 치르기
      → 청지기 네브를 따라 보디발의 집 대문까지 걷기 → 「2장 · 보디발의 집」 */
Object.assign(NM, { mkOld: '늙은 가나안 포로', mkNub: '누비아 소년', mkWoman: '끌려온 여인' });
const MKT = { trough: [SPOTS.market[0] + 7, SPOTS.market[1] - 6], line: [SPOTS.block[0] - 3.2, SPOTS.block[1] + 2.6] };
npcs.push(
  { id: 'mkOld', name: '늙은 가나안 포로', look: Object.assign({}, LOOK.elder, { top: 0x8a7a62, mantle: undefined }), x: MKT.line[0] - 1.2, z: MKT.line[1], face: Math.PI * 0.9, talkR: 2.6, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone },
  { id: 'mkNub', name: '누비아 소년', look: KID({ skin: 0x5a3a24, top: 0xd8c8a0, hairStyle: 'short' }), scale: 0.74, x: MKT.line[0] - 2.4, z: MKT.line[1] + 0.3, face: Math.PI, noTalk: true, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone },
  { id: 'mkWoman', name: '끌려온 여인', look: Object.assign({}, LOOK.woman, { top: 0x8a7a62 }), x: MKT.line[0] - 3.6, z: MKT.line[1] - 0.2, face: Math.PI * 1.1, noTalk: true, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone });
{ for (const sp of specials) { if (sp.id === 'pitShout' || sp.id === 'pitPray') sp.on = () => false; } }
function ch1Build(W, P) { P('trough', MKT.trough[0], MKT.trough[1], { ry: 0.4, col: { r: 0.8, h: 0.6 } }); P('jars', MKT.trough[0] + 1.6, MKT.trough[1] - 0.8, { args: [2] }); }
const C1 = S => S.q.c1 || (S.q.c1 = { pitT: 0, call: {}, pray: 0 });
const PIT_T = 60; /* seconds in the pit (the user asked for one minute) */

// ------------------------------------------------------------------ the pit
const PRAY_P = [['살려 주세요… 하나님, 여기서 꺼내 주세요.', '구덩이는 대답이 없었습니다.'], ['아버지의 하나님… 지금 어디에 계세요? 제가 무엇을 잘못했나요?', '하늘은 둥글게 잘린 채 파랗기만 했습니다.'], ['…그래도 저를 버리지 마세요. 아버지가 그러셨어요. 어디로 가든지 지키신다고.', '요셉은 오래도록 무릎을 꿇고 있었습니다.']];
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy()) return null; const out = [], c = C1(S);
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (S.step === 'c1_pit' && S.q.inPit) {
    at(PIT.x, PIT.z, 3.4, { label: '구덩이 안에서…', key: 'c1Menu', use: () => pitMenu(S) }); }
  if (S.step === 'c1_caravan' && S.q.cNight) nightCtx(S, at);
  if (S.step === 'c1_market') marketCtx(S, at);
  return out.length ? out : null; });
function pitMenu(S) { const c = C1(S), p = Gm().P, t = c.pitT, ch = [];
  if (!c.look) ch.push({ t: '구덩이 둘러보기', then: () => { c.look = 1; GG.UI.quest(); setTimeout(() => say([T('그 구덩이는 빈 것이라 그 속에 물이 없었더라.', '창세기 37:24'), T('바닥은 바싹 말랐고, 벽은 손이 닿지 않을 만큼 높아요.')]), 30); } });
  if (c.look && !Object.keys(c.call).length) ch.push({ t: '위를 향해 형들을 부르기', then: () => setTimeout(() => callBrothers(S), 30) });
  if (t > 12 && t < 44 && !c.shade) ch.push({ t: '벽 그림자 쪽으로 옮겨 앉기', then: () => { c.shade = 1; p.cpose = { k: 'sitHug', t: 0, dur: 0, hold: true }; GG.UI.quest(); setTimeout(() => say([T('해가 머리 위에 오자 구덩이 바닥이 달아올랐어요. 요셉은 벽 그림자에 몸을 붙였습니다.')], () => { p.cpose = null; }), 30); } });
  /* (Benjamin's pebble was not in Scripture) */
  ch.push({ t: '무릎 꿇고 기도하기', then: () => { const k = t < 20 ? 0 : t < 42 ? 1 : 2; c.pray = Math.max(c.pray | 0, k + 1); p.emote = { k: 'pray', t: 0, dur: 4 }; GG.UI.quest(); setTimeout(() => say([T('요셉은 무릎을 꿇고 하나님을 불렀습니다.'), T(PRAY_P[k][1])]), 30); } });
  ch.push({ t: '그냥 기다리기' });
  say([{ n: '', t: t < 20 ? '(해가 구덩이 바닥을 내리쬐어요. 무엇을 할까?)' : t < 45 ? '(해가 벽을 타고 기울어 가요. 무엇을 할까?)' : '(하늘이 붉어져요. 무엇을 할까?)', choices: ch }]); }
function callBrothers(S) { const c = C1(S); c.call['up'] = 1; Gm().sfx('blip', { pitch: 0.8 }); GG.UI.quest();
  say([T('요셉은 구덩이 위를 향해 형들을 불렀습니다. 대답은 없었습니다.'), T('훗날 형들은 이 날을 이렇게 기억했습니다: 「그가 애걸할 때에 우리가 그 마음의 괴로움을 보고도 듣지 아니하였으므로」', '창세기 42:21')]); }
function pitTick(dt, S) { const c = C1(S); if (GG.Cine.on) return; c.pitT += dt; S.time = 14 + 4 * Math.min(1, c.pitT / PIT_T);
  if (c.pitT > 22 && !c.bread && !GG.UI.busy()) { c.bread = 1; say([T('그들이 앉아 음식을 먹었습니다. 위에서 빵을 뜯는 소리가 들려왔어요.', '창세기 37:25')]); }
  if (c.pitT > PIT_T - 6 && !c.bells && !GG.UI.busy()) { c.bells = 1; Gm().sfx('bell', { vol: 0.5 }); say([T('하늘이 붉어지고 구덩이 안이 어두워졌습니다. 멀리서 낙타 방울 소리와 낯선 말소리가 들려왔습니다.')]); } }

// ------------------------------------------------------------------ the sale: the rope comes down between the brothers' words and the bargaining
let splitSold = false, splitMkt = false;
{ const play0 = GG.Cine.play; GG.Cine.play = function (shots, done, o) {
    if (splitSold && shots && shots[0] && /그들이 앉아 음식을 먹다가/.test(shots[0].t || '')) { splitSold = false; const a = shots.slice(0, 4), b = shots.slice(4);
      return play0.call(this, a, () => setTimeout(() => ropeUp(() => play0.call(GG.Cine, b, done, o)), 30), o); }
    if (splitMkt && shots && shots[0] && /애굽의 장터/.test(shots[0].t || '')) { splitMkt = false; const bi = shots.findIndex(s => s.black), a = shots.slice(0, 3), b = shots.slice(3, bi), last = shots[bi];
      return play0.call(this, a, () => setTimeout(() => standStill(() => play0.call(GG.Cine, b, () => { try { last.fn && last.fn(); } catch (e) { } followNeb(Gm().S(), done); }, o)), 30), o); }
    return play0.apply(this, arguments); }; }
function ropeUp(after) { say([T('밧줄 하나가 구덩이 안으로 내려왔습니다. 요셉을 구덩이에서 끌어올리고…', '창세기 37:28')], () =>
  GG.UI.minigame('push', { title: '밧줄을 붙잡고 버티기', hint: '꾹 눌러 밧줄을 붙잡아요. 손이 미끄러지면 잠깐 놓았다가 다시 잡아요.', btn: '붙잡기' }, ok => {
    if (!ok) { say([T('손이 미끄러져 다시 떨어졌습니다. 밧줄이 또 내려왔어요.')], () => ropeUp(after)); return; } Gm().sfx('rope'); after(); })); }

// ------------------------------------------------------------------ the night by the caravan's fire (played, not watched)
function cinCaravanNight(S, G, then) {
  const [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  RT.car = null; const fd = (a, b) => { if (GG.Cine.hold) { a(); b(); } else fade(a, b); };
  fd(() => { S.time = GG.Game.clockTo(S, 20.6, 0); place('ishmael', cx + 2, cz + 1.4, -2.2, { sit: true }); place('midian', cx - 1.8, cz + 1.8, 2.4, { sit: true }); place('ishBoy', cx + 1.6, cz - 2.2, -0.6);
    ['camel1', 'camel2', 'camel3'].forEach((id, i) => place(id, cx + 6 + i * 2.6, cz - 3 + i, -1.2)); G.teleport(cx - 0.4, cz - 3.4, 0.2); cpose(null); },
  () => cine([
    { cam: [cx - 9, h + 3.6, cz - 7], cam2: [cx - 6, h + 2.4, cz - 4.6], look: [cx, h + 0.8, cz], dur: 6, t: '광야의 밤. 대상은 길가에 불을 피우고 쉬었습니다. 요셉의 줄 끝은 낙타 말뚝에 매여 있었습니다.', music: 'j_night' },
    { fn: () => walkTo('ishBoy', cx + 0.4, cz - 4.4, 1.2, n => { face('ishBoy', G.P.x, G.P.z); n.act = 'present'; }), cam: [cx + 2.4, h + 1.1, cz - 5.4], look: [cx - 0.2, h + 0.8, cz - 3.6], dur: 4.5, n: '대상의 아이', t: '…물. 마셔.', e: 'tender' },
  ], () => { const n = G.npc('ishBoy'); if (n) { n.act = null; walkTo('ishBoy', cx + 1.6, cz - 2.2, 1.2, m => { m.sit = true; }); }
    const c = C1(S); c.n = { t: 0, cx: cx - 0.4, cz: cz - 3.4, bowl: [cx + 0.2, cz - 4.6], date: [cx - 2.2, cz - 5.4], then }; S.q.cNight = 1; for (const id of NIGHT_IDS) { const m = G.npc(id); if (m) m.d.noTalk = true; }
    GG.UI.quest(); GG.UI.hint && GG.UI.hint('줄 끝까지만 움직일 수 있어요 · 사람들에게 말을 걸 수 없어요 · 불가에서 잠들면 밤이 지나가요', 'rope', 'tap'); }));
}
const NIGHT_IDS = ['ishmael', 'midian', 'ishBoy', 'camel1', 'camel2', 'camel3'];
function nightCtx(S, at) { const c = C1(S), n = c.n; if (!n) return;
  if (!c.drank) at(n.bowl[0], n.bowl[1], 2, { label: '물그릇 두 손으로 들어 마시기', key: 'c1Bowl', use: () => drinkBowl(S, false) });
  if (!c.date) at(n.date[0], n.date[1], 1.8, { label: '굴러온 대추 한 알 줍기', key: 'c1Date', use: () => { c.date = 1; Gm().P.emote = { k: 'pick', t: 0, dur: 0.9 }; Gm().P.stam = Math.min((GG.Vitals && GG.Vitals.cap) || 140, (Gm().P.stam || 0) + 25); GG.UI.quest(); say([T('불 건너편에서 대추 한 알이 굴러왔습니다. 대상의 아이가 모른 척 고개를 돌렸어요.')]); } });
  const cm = Gm().npc('camel1'); if (cm && !c.camel) at(cm.x - 1.2, cm.z + 0.6, 2.6, { label: '엎드린 낙타 곁에 붙어 앉기', key: 'c1Camel', use: () => { c.camel = 1; Gm().P.cpose = { k: 'sitHug', t: 0, dur: 0, hold: true }; if (GG.Climate) GG.Climate.cold = false; GG.UI.quest(); say([T('밤바람이 차가워지자, 요셉은 엎드린 낙타의 따뜻한 옆구리에 몸을 붙였습니다. 낙타가 콧김을 내뿜었어요.')], () => { Gm().P.cpose = null; }); } });
  at(SPOTS.caravanNight[0], SPOTS.caravanNight[1], 3.6, { label: '불가에 앉기', key: 'c1Fire', use: () => { const ch = []; if (!c.prayed) ch.push({ t: '별을 올려다보며 기도하기', then: () => setTimeout(() => prayStars(S), 30) }); ch.push({ t: '불가에서 자기', then: () => setTimeout(() => { if (!c.drank) { GG.UI.toast('목이 너무 말라 잠이 오지 않아요 · 물그릇'); return; } if (!c.prayed) { GG.UI.toast('잠들기 전에 하늘을 올려다봐요'); return; } sleepNight(S); }, 30) }); ch.push({ t: '일어나기' }); Gm().P.cpose = { k: 'sitg', t: 0, dur: 0, hold: true }; say([{ n: '', t: '(불가에 앉았어요. 무엇을 할까?)', choices: ch }], () => { if (Gm().P.cpose && Gm().P.cpose.k === 'sitg') Gm().P.cpose = null; }); } }); }
function drinkBowl(S, late) { const c = C1(S); c.drank = 1; Gm().P.emote = { k: 'kneel', t: 0, dur: 1.4 }; Gm().sfx('pour'); GG.UI.quest();
  say(late ? [T('한참 동안 고개를 돌리고 있던 요셉은, 목마름을 이기지 못하고 끝내 그 물을 집어 들었습니다.')] : [T('요셉은 두 손으로 물그릇을 들어 마셨습니다.')]); }
function prayStars(S) { const c = C1(S), G = Gm(), [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz); c.prayed = 1; GG.UI.quest(); G.P.emote = { k: 'pray', t: 0, dur: 6 };
  cine([
    { cam: () => [G.P.x + 0.2, hAt(G.P.x, G.P.z) + 0.5, G.P.z - 0.4], look: [cx - 6, h + 30, cz + 14], dur: 8, t: '요셉은 별을 올려다보며 하나님을 불렀습니다. 아버지 야곱이 벧엘에서 들었다는 말씀이 떠올랐습니다.', e: 'pray' },
    { cam: () => [G.P.x + 1, hAt(G.P.x, G.P.z) + 0.7, G.P.z - 1], look: () => [G.P.x, hAt(G.P.x, G.P.z) + 0.9, G.P.z], dur: 8, t: '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며…」', ref: '창세기 28:15', e: 'pray' }
  ], () => { G.P.emote = null; GG.UI.toast('불가에서 자면 밤이 지나가요'); }); }
function sleepNight(S) { const c = C1(S), G = Gm(), n = c.n, [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  const go = () => { S.q.cNight = 0; for (const id of NIGHT_IDS) { const m = G.npc(id); if (m) m.d.noTalk = false; } GG.UI.hint && GG.UI.hint(null);
    cine([{ black: true, title: '여러 날 후', sub: '광야를 건너 애굽으로', cam: [cx, h + 2, cz], look: [cx, h, cz - 3], dur: 3.6, fn: () => { cpose(null); S.q.night = 1; S.day += 4; S.time = GG.Game.clockTo(S, 8.4, 1); if (!n.then) caravanStart(S, G, false); } }],
      () => { GG.Game.musicOverride = null; G.UI.quest(); if (n.then) n.then(); }); };
  if (GG.Sleep && GG.Sleep.sky) GG.Sleep.sky('그날 밤 광야의 하늘에도, 헤브론에서 보던 그 별들이 떠 있었습니다.', go); else go(); }
function nightTick(dt, S) { const c = C1(S), n = c.n; if (!n || GG.Cine.on) return; const P = Gm().P; n.t += dt;
  const dx = P.x - n.cx, dz = P.z - n.cz, d = Math.hypot(dx, dz), R = 7; if (d > R) { P.x = n.cx + dx / d * R; P.z = n.cz + dz / d * R; P.vx *= 0.2; P.vz *= 0.2; if (!n.tug || n.t - n.tug > 3) { n.tug = n.t; GG.UI.toast('줄이 팽팽하게 당겨져요'); Gm().sfx('rope', { vol: 0.4 }); } }
  if (!c.drank && n.t > 25 && !GG.UI.busy()) drinkBowl(S, true); }

// ------------------------------------------------------------------ the slave market
function marketCtx(S, at) { const m = S.q.mk | 0;
  if (m === 0) at(MKT.trough[0], MKT.trough[1], 2.8, { label: '물통에서 얼굴과 팔 씻기', key: 'mkWash', use: () => { S.q.mk = 1; Gm().P.emote = { k: 'gather', t: 0, dur: 2 }; Gm().sfx('splash', { vol: 0.5 }); GG.UI.quest(); say([T('광야의 흙먼지가 물통에 뿌옇게 풀렸습니다.')]); } });
  if (m === 1) at(MKT.line[0], MKT.line[1], 3, { label: '포로들 곁에 줄 서기', key: 'mkLine', use: () => { S.q.mk = 3; Gm().teleport(MKT.line[0], MKT.line[1], Math.PI); GG.UI.quest(); } }); /* (the old captive's whisper was not in Scripture) */
  if (m === 3) at(MKT.line[0], MKT.line[1], 3, { label: '단 위로 끌려 올라가기', key: 'mkUp', use: () => { S.q.mk = 4; splitMkt = true; cinMarket(S, Gm()); } }); }
function standStill(after) { GG.UI.minigame('balance', { title: '가만히 서 있기', hint: '사람들이 팔을 만지고 이를 들여다봐요. 고개를 숙이고, 떨리는 몸을 가운데로 붙잡아요.', dur: 9 }, ok => { if (!ok) { say([T('요셉이 움찔하자 줄이 홱 당겨졌습니다.')], () => standStill(after)); return; } after(); }); }
const NEB_PATH = [[-14, 104], [-20, 92], [-28, 72]];
function followNeb(S, done) { const G = Gm(), n = G.npc('neb'); S.q.mkGone = 1; S.q.bound = 1;
  if (!n) { done && done(); return; } n.forceVis = true; place('neb', SPOTS.block[0] + 2, SPOTS.block[1] + 4, Math.PI * 0.9); G.teleport(SPOTS.block[0] + 0.6, SPOTS.block[1] + 5.6, Math.PI * 0.9);
  say([T('청지기가 저울에 은을 달아 상인에게 건넸습니다. 상인은 요셉의 줄을 청지기에게 넘겼습니다.'), T('보디발 집의 청지기를 따라 애굽의 거리를 걸어요.')], () => { S.q.follow = { i: 0, done }; GG.UI.quest(); }); }
function followTick(dt, S) { const f = S.q.follow; if (!f || GG.UI.busy() || GG.Cine.on) return; const G = Gm(), n = G.npc('neb'); if (!n) return; const d = G.dist(n.x, n.z);
  if (d > 7) { if (n.walk) n.walk = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); f.wt = (f.wt || 0) + dt; if (f.wt > 5) { f.wt = 0; GG.Life.bubble('neb', '이쪽이다. 서둘러라.', 2.6); } return; }
  if (!n.walk) { if (f.i >= NEB_PATH.length) { const done = f.done; S.q.follow = null; n.forceVis = undefined; say([T('시위대장 보디발의 집이에요. 높은 흙벽 너머로 종려나무와 연못이 보였습니다.')], () => cine([{ black: true, title: '2장 · 보디발의 집', sub: '창세기 39:1–20', cam: [G.P.x, hAt(G.P.x, G.P.z) + 2, G.P.z + 4], look: [G.P.x, hAt(G.P.x, G.P.z), G.P.z], dur: 4 }], () => done && done())); return; }
    const [x, z] = NEB_PATH[f.i]; G.npcWalk('neb', x, z, () => { f.i++; }, 1.5); } } /* (the steward only leads the way) */

// ------------------------------------------------------------------ the steps
Object.assign(steps.c1_pit, {
  obj: S => { const t = C1(S).pitT; return t < 20 ? '빈 구덩이 속에서 · 해가 머리 위로 올라와요' : t < 45 ? '해가 구덩이 벽을 타고 기울어요…' : t < PIT_T ? '하늘이 붉어져요…' : '위에서 무슨 소리가 나요'; },
  list: S => { const c = C1(S); return [{ t: '구덩이 둘러보기', ok: !!c.look }, { t: `형들을 부르기 (${Object.keys(c.call).length}/3)`, ok: Object.keys(c.call).length >= 1 }, { t: `벽을 기어오르려 해 보기 · 점프 (${Math.min(3, S.q.climb || 0)})`, ok: (S.q.climb || 0) >= 1 }, { t: '무릎 꿇고 기도하기', ok: (c.pray | 0) >= 1 }]; },
  target: () => null,
  check: S => { const c = C1(S); return c.pitT >= PIT_T && Object.keys(c.call).length >= 1 && (c.pray | 0) >= 1 && !!c.look; },
  done(S, G, next) { G.UI.hint(null); splitSold = true; cinSold(S, G, next); } });
Object.assign(steps.c1_caravan, {
  obj: S => S.q.cNight ? '광야의 밤 · 줄 끝에서' : S.q.night ? '대상을 따라 애굽으로' : '줄에 묶여 이스마엘 대상을 따라 걷기',
  list: S => { if (!S.q.cNight) return [{ t: '광야의 밤', ok: !!S.q.night }, { t: '애굽 국경', ok: !!S.q.reveal }]; const c = C1(S); return [{ t: '물그릇의 물 마시기', ok: !!c.drank }, { t: '대추 한 알 (그냥 둬도 돼요)', ok: !!c.date }, { t: '낙타 곁에서 몸 녹이기 (그냥 둬도 돼요)', ok: !!c.camel }, { t: '별을 보며 기도하기', ok: !!c.prayed }, { t: '불가에서 자기', ok: false }]; } });
Object.assign(steps.c1_market, {
  obj: S => ['장터 어귀 물통에서 씻기', '포로들 곁에 줄 서기', '포로들 곁에 줄 서기', '단 위로 끌려 올라가기', '장터의 단 위에서', '청지기를 따라 보디발의 집으로'][S.q.follow ? 5 : Math.min(4, S.q.mk | 0)],
  list: S => { const m = S.q.mk | 0; return [{ t: '물통에서 씻기', ok: m >= 1 }, { t: '줄 서기', ok: m >= 3 }, { t: '단 위에서', ok: m >= 5 || !!S.q.follow }]; },
  target: S => S.q.follow ? 'npc:neb' : [{ x: MKT.trough[0], z: MKT.trough[1] }, { x: MKT.line[0], z: MKT.line[1] }, { x: MKT.line[0], z: MKT.line[1] }, { x: MKT.line[0], z: MKT.line[1] }, null][Math.min(4, S.q.mk | 0)],
  enter(S, G, re) { if (GG.Cine.hold) setTimeout(() => { GG.Cine.hold = false; }, 0); if ((S.q.mk | 0) >= 4) S.q.mk = 3; S.q.bound = 1; cpose(null);
    if (!re) { G.teleport(SPOTS.market[0] + 10, SPOTS.market[1] - 10, -0.6); say([T('애굽의 장터. 이스마엘 상인들은 포로들을 장터 어귀에 세웠습니다.'), T('장터 어귀 물통에서 얼굴과 팔의 흙먼지를 씻어요.')]); } },
  talk: { mkOld(S, G) { return false; } } }); /* (the old captive stands in the line; he has no lines of his own) */
function ch1Tick(dt, S) { if (!S) return; try { if (S.step === 'c1_pit' && S.q.inPit) pitTick(dt, S); if (S.step === 'c1_caravan' && S.q.cNight) nightTick(dt, S); if (S.step === 'c1_market' && S.q.follow) followTick(dt, S); } catch (e) { console.error('ch1', e); } }
// =================================================================== v18.69 2장 다시 짜기 · 「보디발의 집」 (e_ch2.js · 설계표_2장_v18_69.md)
/* 아메니가 곁에서 함께 일하고, 여러 해가 흘러요(창 39:1–20).
   ① 낯선 집: 아메니 → 집 둘러보기(따라 걷기) → 종들의 저녁 · 첫 밤
   ② 종의 첫날: 아메니와 물 긷기(세 번 · 아메니의 물동이를 들어 드릴 수도) · 헤누의 맷돌 · 외양간 → 네브의 시험 → 저녁에 아메니의 이야기 → 둘째 밤
   ③ 날들이 쌓이다: 사흘의 일(마당 쓸기 · 자루 나르기 · 물 긷기) · 애굽 말 · 우물물이 맑아진다(39:2–3)
   ④ 아마밭(지금 그대로) → 아마 담그기 · 이틀 · 건져 널기 · 두드리기
   ⑤ 곳간과 장부(지금) + 애굽 숫자   ⑥ 잔치 준비(빵 · 포도주 · 연꽃) → 잔치(지금)   ⑦ 가정 총무(지금) + 아메니의 허리 · 약초
   ⑧ 세 철(범람 · 씨뿌림 · 거둠) · 요셉이 청년으로 자라요 → 복의 장면(지금 cinBless · 39:5–6)
   ⑨ 유혹(지금) · 사흘 동안 날마다 사람들 곁에서 일할 곳 고르기 · 밤 기도 → 그날(39:11 · 까닭은 넣지 않아요) → 도망(지금)
   ⑩ 누명(지금) → 아메니의 끄덕임 → 병사들을 따라 옥까지 걷기 → 「3장 · 왕의 옥」 */
Object.assign(WORDS, { iin: ['이 인 · 이리 와', '「이리 와!」 네브가 종을 부를 때 하는 말이에요.', 'star'], shema: ['셰마 · 가라', '「가라」. 일을 시킬 때 많이 들어요.', 'star'],
  seheb: ['세헤브 · 서둘러', '「서둘러!」 네브가 입에 달고 사는 말이에요.', 'star'], irp: ['이르프 · 포도주', '포도주. 잔치 때 손님들이 제일 많이 찾아요.', 'drop'], dab: ['데브 · 무화과', '무화과. 보디발 나리가 제일 좋아하는 과일이에요.', 'heart'] });
const C2 = S => S.q.c2 || (S.q.c2 = { tour: 0, pour: 0, dd: 0, sw: {}, sk: 0, fl: 0, se: 0, td: 0 });
/* the yard's east wall (x −6) has one side door at z ≈ 52: a walk from the yard to the fields and the cattle goes through it */
const route = (x0, z0, x, z) => (x0 < -6) === (x < -6) ? null : x0 < -6 ? [[-8.5, 52], [-3, 52]] : [[-3, 52], [-8.5, 52]];
const amWalk = (x, z, line) => { const G = Gm(), a = G.npc('ameni'); if (!a) return; a.sit = false; G.npcWalk('ameni', x, z, () => { const p = G.P; face('ameni', p.x, p.z); if (line) GG.Life.bubble('ameni', line, 3.6); }, 1.6, route(a.x, a.z, x, z)); };
/* sleep where he lies: the sky, then the real new day (so the bed by the straw works the same) */
const sleepHere = text => { const G = Gm(); if (GG.Sleep && GG.Sleep.sky) GG.Sleep.sky(text, () => G.sleep()); else G.sleep(); };
const BED = [-46.8, 50];
const C2SPOT = { sweep: [[-36, 50], [-33, 55.5], [-30, 51.5]], /* v18.80 three corners, not four */ sackA: [-27, 67.5], sackB: [-12, 62.5], brick: [1.5, 72.5], seed: [6, 50], plough: [9, 73], herb: [-25.5, 58.2], prayer: [-46.2, 51.2], rack: [3, 66] };
const TOUR = [[-45, 53, '여기가 종들의 숙소다. 짚자리 하나가 네 자리야.'], [-38, 61, '우물이다. 새벽마다 여기서 하루가 시작되지.'], [-10.4, 51.4, '부엌. 헤누가 화덕을 지킨다. 배고프면 헤누 눈치를 잘 봐라, 하하.', [[-24, 53]]], [8.2, 68.6, '외양간. 나리는 소를 몹시 아끼신다.'], [-18, 53.4, '연못과 정원. 정원지기가 연꽃을 키우지.', [[-3, 52], [-8.5, 52]]], [-10, 57.4, '저기가 곳간이다. 서기관 이피 영감이 장부를 쓰지.', [[-10, 54]]], [-28, 49, '저기 안채는… 우리 같은 종이 함부로 들어가는 곳이 아니다. 기억해라.', [[-10, 54], [-18, 52.6]]]]; /* round the pool (8 × 5 m) and the palms */

// ------------------------------------------------------------------ hands-on things (one menu entry per spot)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || p.ride) return null; const st = S.step; if (!/^c2_/.test(st)) return null; const c = C2(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c2_supper') { if (!c.ate) at(-44, 52, 3.4, { label: '보리빵과 양파 받아 먹기', key: 'c2Eat', use: () => { c.ate = 1; p.emote = { k: 'eat', t: 0, dur: 2 }; G.sfx('eat'); GG.UI.quest(); say([T('종들이 둘러앉아 보리빵과 양파를 나눠 먹었습니다. 요셉에게도 한 조각이 돌아왔어요.'), T('숙소 짚자리에서 자요.')]); } });
    if (c.ate) at(BED[0], BED[1], 2.6, { label: '숙소 짚자리에서 자기', key: 'c2Sleep1', use: () => sleepHere('요셉은 짚자리에 누워 낯선 하늘의 별을 바라보았습니다. 고향의 별과 같은 별이었습니다.') }); }
  if (st === 'c2_work' && c.pour >= 1 && !c.amJar && !S.q.w1) { const a = G.npc('ameni'); if (a) at(a.x, a.z, 2.4, { label: '아메니의 물동이 대신 들어 드리기', key: 'c2AmJar', use: () => { c.amJar = 1; S.water = Math.min(S.jarMax || 12, (S.water || 0) + 4); G.UI.hud(); GG.Bond && GG.Bond.add && GG.Bond.add('ameni', 6, '물동이'); GG.UI.quest(); say([N('ameni', '어허, 늙은이 허리를 알아주는구나. …고맙다, 얘야.', '', 'tender')]); } }); }
  if (st === 'c2_days') daysCtx(S, c, at);
  if (st === 'c2_flax2') { const cx = SPOTS.canal[0], cz = SPOTS.canal[1];
    if (c.fl === 0) at(cx, cz, 3.2, { label: '아마 다발 운하 물에 담그기', key: 'c2Soak', use: () => { c.fl = 1; p.emote = { k: 'gather', t: 0, dur: 1.6 }; G.sfx('splash'); GG.UI.quest(); say([N('gardener', '이렇게 돌로 눌러 두면 이틀 뒤에 껍질이 물러지지.'), N('ameni', '세마포 한 필이 되려면 이 고생을 다 해야 한단다.')], () => { fade(() => { S.day += 2; S.time = 9; }, () => { c.fl = 2; GG.UI.quest(); GG.UI.toast('이틀이 지났어요'); }); }); } });
    if (c.fl === 2) at(cx, cz, 3.2, { label: '아마 건져 볕에 널기', key: 'c2Dry', use: () => { c.fl = 3; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); say([T('물러진 아마 다발을 건져 밭둑에 길게 널었습니다. 뜨거운 해가 금세 말려 주었어요.'), N('ameni', '다 마르면 저기 두드리는 판에서 두드리자.')]); } });
    if (c.fl === 3) at(C2SPOT.rack[0], C2SPOT.rack[1], 3.4, { label: '방망이로 아마 두드리기', key: 'c2Beat', use: () => GG.UI.minigame('rhythm', { title: '아마 두드리기', hint: '동그라미가 금에 닿을 때 내리쳐요. 껍질이 떨어지고 고운 섬유만 남아요.', need: 7 }, ok => { if (!ok) { GG.UI.toast('섬유가 엉켰어요 · 다시 두드려요'); return; } c.fl = 4; G.sfx('thud'); GG.UI.quest(); say([T('하얗고 고운 섬유가 나왔습니다. 길쌈하는 여인들이 와서 실을 자았어요.'), N('ameni', '이게 나리가 입으실 세마포가 될 거다. 네 손을 거쳐서 말이야.', '', 'tender')], () => G.checkStep()); }) }); }
  if (st === 'c2_banquet' && !S.q.prepDone) { const pr = c.prep || (c.prep = {});
    if (!pr.bread) at(-10.6, 43.6, 2.6, { label: '헤누와 잔치 빵 굽기', key: 'c2Bread', use: () => GG.UI.minigame('rhythm', { title: '빵 굽기', hint: '동그라미가 금에 닿을 때 반죽을 화덕 벽에서 떼어 내요.', need: 5 }, ok => { if (!ok) { GG.UI.toast('빵이 조금 탔어요 · 다시 구워요'); return; } pr.bread = 1; G.sfx('eat'); GG.UI.quest(); prepDone(S); }) });
    if (!pr.wine) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '포도주 단지 대청으로 나르기', key: 'c2Wine', use: () => GG.UI.minigame('balance', { title: '포도주 단지 나르기', hint: '넘치지 않게 가운데를 맞춰요.', dur: 7 }, ok => { if (!ok) { GG.UI.toast('조금 흘렸어요 · 다시 들어요'); return; } pr.wine = 1; GG.UI.quest(); prepDone(S); }) });
    if (!pr.lotus) at(SPOTS.pool[0], SPOTS.pool[1], 3.4, { label: '연못에서 연꽃 꺾어 상에 꽂기', key: 'c2Lotus', use: () => { pr.lotus = 1; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); prepDone(S); } }); }
  if (st === 'c2_manage' && S.q.amHurt && !c.herb) at(C2SPOT.herb[0], C2SPOT.herb[1], 3, { label: '정원에서 약초 캐기', key: 'c2Herb', use: () => { c.herb = 1; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); say([N('gardener', '허리 아픈 데는 이 풀을 짓찧어 붙이는 게 최고지요. 아메니 영감께 갖다 드리세요.')]); } });
  if (st === 'c2_seasons') seasonCtx(S, c, at);
  if (st === 'c2_tempt2' && c.td >= 3 && !c.prayN) at(C2SPOT.prayer[0], C2SPOT.prayer[1], 2.6, { label: '숙소에서 무릎 꿇고 기도하기', key: 'c2Pray', use: () => { c.prayN = 1; p.emote = { k: 'pray', t: 0, dur: 4 }; GG.UI.quest(); say([T('요셉은 무릎을 꿇었습니다. 「내가 어찌 이 큰 악을 행하여 하나님께 득죄하리이까」', '창세기 39:9')], () => G.checkStep()); } });
  return out.length ? out : null; });
function prepDone(S) { const pr = C2(S).prep; if (pr.bread && pr.wine && pr.lotus && !S.q.prepDone) { S.q.prepDone = 1; say([N('cook', '다 됐다! 손님들이 오신다!', '', 'happy')], () => banquetStart(S, Gm(), false)); } }

/* ③ three days of work */
const DAYS = [['마당 쓸기', '숙소 앞마당 네 곳을 쓸어요', ['iin', 'shema']], ['자루 나르기', '대문 앞 곡식 자루를 곳간으로 두 번 날라요', ['seheb', 'irp']], ['빵 굽기', '부엌 화덕에서 요리사 헤누를 도와 종들이 먹을 빵을 구워요 (물 긷기는 첫날에 했어요)', ['ta', 'dab']]]; /* v18.80 not the first day's water again */
const DAYN = ['셋째', '넷째', '다섯째'];
function daysCtx(S, c, at) { const G = Gm(), p = G.P, d = c.dd;
  if (c.dayDone) { at(BED[0], BED[1], 2.6, { label: '숙소 짚자리에서 자기', key: 'c2DSleep', use: () => sleepHere('하루가 저물었습니다. 숙소 지붕 틈으로 별이 보였어요.') }); return; }
  if (d === 0) C2SPOT.sweep.forEach(([x, z], i) => { if (!c.sw[i]) at(x, z, 2, { label: `빗자루로 마당 쓸기 (${Object.keys(c.sw).length}/3)`, key: 'c2Sw' + i, use: () => { c.sw[i] = 1; p.emote = { k: 'gather', t: 0, dur: 1.4 }; G.sfx('rustle'); GG.UI.quest(); if (Object.keys(c.sw).length >= 3) dayEnd(S); } }); });
  if (d === 1) { if (!c.carry && c.sk < 2) at(C2SPOT.sackA[0], C2SPOT.sackA[1], 2.6, { label: `곡식 자루 지기 (${c.sk}/2)`, key: 'c2SackA', use: () => { c.carry = 1; p.emote = { k: 'pick', t: 0, dur: 0.9 }; GG.UI.quest(); GG.UI.toast('자루를 졌어요 · 곳간으로'); } });
    if (c.carry) at(C2SPOT.sackB[0], C2SPOT.sackB[1], 2.6, { label: '곳간에 자루 내려놓기', key: 'c2SackB', use: () => { c.carry = 0; c.sk++; G.sfx('thud', { vol: 0.5 }); GG.UI.quest(); if (c.sk >= 2) dayEnd(S); } }); }
  if (d === 2 && !c.baked) at(-10.6, 43.6, 2.6, { label: '헤누와 화덕에서 빵 굽기', key: 'c2DBake', use: () => GG.UI.minigame('rhythm', { title: '빵 굽기', hint: '동그라미가 금에 닿을 때 반죽을 화덕 벽에 철썩 붙였다가 떼어 내요.', need: 5 }, ok => { if (!ok) { GG.UI.toast('빵이 조금 탔어요 · 다시 구워요'); return; } c.baked = 1; G.sfx('eat'); GG.Life.bubble('cook', '오, 제법인데! 종들 저녁이 푸짐하겠다.', 3); GG.UI.quest(); dayEnd(S); }) }); } /* v18.80 bread, not water again */
function dayStart(S) { const c = C2(S), D = DAYS[c.dd]; if (!D) return; c.sw = {}; c.sk = 0; c.carry = 0; c.pour = 0; c.baked = 0;
  narr([{ kick: '보디발의 집 · 날들이 쌓이다', title: `${DAYN[c.dd]} 날 · ${D[0]}`, t: D[1] + '. 아메니가 곁에서 함께해요.', ref: '' }], () => {
    if (c.dd === 0) amWalk(-34.5, 53, '쓸 때는 바람 부는 쪽에서부터 쓸어라.'); if (c.dd === 1) amWalk(-25.5, 66, '무릎으로 들어라. 허리로 들면 나처럼 된다, 하하.'); if (c.dd === 2) amWalk(-12.2, 45.4, '빵은 화덕 벽에 붙여 굽는단다. 손 데지 마라.'); }); }
function dayEnd(S) { const c = C2(S), D = DAYS[c.dd]; D[2].forEach(k => learn(k)); c.dayDone = 1; c.dayAt = S.day; S.time = Math.max(S.time, 18.6); GG.UI.quest();
  const L = [[N('ameni', '말도 두 개 배워 두자. 「이 인」은 이리 오라, 「셰마」는 가라는 말이다. 네브가 부르면 빨리 대답해야 한다.')], [N('ameni', '「세헤브」는 서둘러라. 네브가 입에 달고 사는 말이지. 「이르프」는 포도주란다. 잔치 때 꼭 듣게 될 게다.')],
    [N('ameni', '「타」는 빵, 「데브」는 무화과. 헤누가 빵 사이에 무화과를 넣어 주었구나.'), N('ameni', '…그나저나 이상하구나. 네가 구운 빵은 한 번도 타지 않는구나. 헤누가 눈이 휘둥그레졌다.', '', 'awe'), T('여호와께서 요셉과 함께하시므로 그가 형통한 자가 되어 그 주인 애굽 사람의 집에 있으니', '창세기 39:2'), N('ameni', '이제 나보다 빠르구나. 늙은이는 구경이나 해야겠다.', '', 'laugh')]][c.dd];
  say(L.concat([T('해가 졌어요. 숙소 짚자리에서 자요.')])); }
function daysTick(S, c) { if (!c.dayDone || S.day <= (c.dayAt || 0) || GG.UI.busy() || GG.Cine.on) return; c.dd++; c.dayDone = 0; GG.UI.quest(); if (c.dd >= 3) Gm().checkStep(); else setTimeout(() => dayStart(S), 900); }

/* ⑧ the three seasons (years go by) */
const SEAS = [['아케트 · 범람의 철', '한 해가 지나', '나일 강물이 넘쳐 밭이 물에 잠겼습니다. 무너진 담을 흙벽돌로 고치고, 곡식을 높은 선반으로 옮겨요.'], ['페레트 · 씨뿌림의 철', '또 해가 바뀌어', '물이 빠진 검은 땅에 씨를 뿌리는 철입니다. 일꾼들에게 씨앗을 나누고, 소에 쟁기를 매요.'], ['셰무 · 거둠의 철', '여러 해가 흘러', '곡식이 누렇게 익었습니다. 거둔 곡식을 세어 장부에 적어요.']];
function seasonCtx(S, c, at) { const G = Gm(), p = G.P, se = c.se, t = c.st || (c.st = {});
  if (se === 0) { if (!t.brick) at(C2SPOT.brick[0], C2SPOT.brick[1], 3, { label: '일꾼들과 흙벽돌 찍기', key: 'c2Brick', use: () => GG.UI.minigame('count', { title: '흙벽돌 찍기', hint: '진흙을 틀에 꾹꾹 눌러 담아요.', need: 6, btn: '꾹!', onPress: () => G.sfx('thud', { pitch: 1.3, vol: 0.4 }) }, ok => { if (!ok) return; t.brick = 1; GG.UI.quest(); seasonCheck(S); }) });
    if (!t.lift) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '곡식 자루 높은 선반으로 옮기기', key: 'c2Lift', use: () => { t.lift = 1; p.emote = { k: 'pick', t: 0, dur: 1.4 }; GG.UI.quest(); seasonCheck(S); } }); }
  if (se === 1) { if (!t.seed) at(C2SPOT.seed[0], C2SPOT.seed[1], 3.4, { label: '일꾼들에게 씨앗 자루 나눠 주기', key: 'c2Seed', use: () => { t.seed = 1; p.emote = { k: 'present', t: 0, dur: 1.4 }; GG.UI.quest(); say([N('gardener', '총무님이 나눠 주시는 씨앗은 싹이 잘 나요. 다들 그렇게 말해요.', '', 'happy')], () => seasonCheck(S)); } });
    if (!t.plough) at(C2SPOT.plough[0], C2SPOT.plough[1], 3, { label: '소에 쟁기 매기', key: 'c2Plough', use: () => GG.UI.minigame('push', { title: '멍에 매기', hint: '꾹 눌러 끈을 당겨요. 소가 놀라지 않게 천천히.', btn: '당기기' }, ok => { if (!ok) return; t.plough = 1; G.sfx('moo'); GG.UI.quest(); seasonCheck(S); }) }); }
  if (se === 2 && !t.count) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '거둔 곡식 세어 장부에 적기', key: 'c2Count', use: () => { t.count = 1; p.emote = { k: 'gather', t: 0, dur: 1.6 }; GG.UI.quest(); say([N('scribe', '…한 번에 딱 맞는구먼! 자네가 쓴 장부는 고칠 데가 없어.', '', 'happy')], () => seasonCheck(S)); } }); }
function seasonStart(S) { const c = C2(S), Q = SEAS[c.se]; c.st = {}; GG.UI.quest(); narr([{ kick: `보디발의 집 · ${Q[1]}`, title: Q[0], t: Q[2], ref: '' }]); }
function seasonCheck(S) { const c = C2(S), t = c.st, done = c.se === 0 ? t.brick && t.lift : c.se === 1 ? t.seed && t.plough : !!t.count; if (!done) return;
  const B = [[N('neb', '이웃 집들은 물에 담이 무너졌다는데, 우리 집은 멀쩡하구려. …총무 덕이오.', '', 'tender'), T('그 주인이 여호와께서 그와 함께하심을 보며, 또 여호와께서 그의 범사에 형통하게 하심을 보았더라.', '창세기 39:3')],
    [N('ameni', '요셉아, 너 키가 나보다 커졌구나. 처음 왔을 땐 비쩍 마른 아이였는데.', '', 'tender')],
    [T('곳간마다 곡식이 가득 찼습니다.')]][c.se];
  say(B, () => { c.se++; GG.UI.quest(); if (c.se === 2) grow(S); if (c.se >= 3) Gm().checkStep(); else fade(() => { S.day += 120; S.time = 8; }, () => seasonStart(S)); }); }
/* Joseph grows into a young man (39:6): the steward's and the fleeing outfits fill out and the jaw firms */
const YOUNG = { build: 0.85, jaw: -0.25 }, GROWN = { build: 0.95, jaw: 0.02 };
function grow(S) { S.flags.grown = 1; lookAge(S); GG.UI.toast('요셉이 청년이 되었어요'); }
function lookAge(S) { const w = S.flags && S.flags.grown ? GROWN : YOUNG; let ch = false; for (const k of ['josephSteward', 'josephFled']) { const L = LOOK[k]; if (L && (L.build !== w.build || L.jaw !== w.jaw)) { L.build = w.build; L.jaw = w.jaw; ch = true; } } if (ch && /^joseph(Steward|Fled)$/.test(S.outfit || '')) Gm().refreshLook(); }

/* v18.72 the things the chores need, where the chores are done */
function ch2Build(W, P) { try {
  P('sacks', C2SPOT.sackA[0] + 0.6, C2SPOT.sackA[1] + 0.5, { ry: 0.4 }); P('sacks', C2SPOT.sackA[0] - 0.7, C2SPOT.sackA[1] + 0.8, { ry: 1.6 }); /* the grain sacks at the gate */
  P('sacks', C2SPOT.seed[0] + 0.8, C2SPOT.seed[1] + 0.4, { ry: 0.8 }); P('baskets', C2SPOT.seed[0] - 0.8, C2SPOT.seed[1] - 0.4, { args: [2] }); /* the seed sacks */
  P('hangRack', C2SPOT.rack[0] + 1.4, C2SPOT.rack[1] + 0.6, { ry: 0.3 }); P('stool', C2SPOT.rack[0], C2SPOT.rack[1] - 0.4); P('baskets', C2SPOT.rack[0] + 0.6, C2SPOT.rack[1] - 1.2, { args: [1] }); P('woodStack', C2SPOT.rack[0] - 1.4, C2SPOT.rack[1] + 0.4, { ry: 0.9 }); /* flax drying and the beating board */
  P('bales', C2SPOT.brick[0] + 1.6, C2SPOT.brick[1] - 0.6, { ry: 0.5 }); P('woodStack', C2SPOT.brick[0] - 0.4, C2SPOT.brick[1] + 0.9, { ry: 0.2 }); P('pots', C2SPOT.brick[0] - 1.6, C2SPOT.brick[1] - 0.4, { ry: 0.3 }); /* mud, straw and the brick moulds */
  for (const [dx, dz] of [[0, 0], [1.2, 0.6], [-1.1, 0.7], [0.4, -1]]) P('herbBush', C2SPOT.herb[0] + dx, C2SPOT.herb[1] + dz, { s: 0.8, keep: 1 }); /* the herb bed in the garden */
} catch (e) { console.error('ch2Build', e); } }
// ------------------------------------------------------------------ the new steps
const CH2 = {
  c2_tour: { ch: 3, obj: S => C2(S).tour < TOUR.length ? '아메니를 따라 집 둘러보기' : '집을 다 둘러보았어요', target: 'npc:ameni', need: ['ameni'],
    list: S => [{ t: `집 둘러보기 (${Math.min(TOUR.length, C2(S).tour)}/${TOUR.length})`, ok: C2(S).tour >= TOUR.length }],
    enter(S, G, re) { const c = C2(S); if (!re) c.tour = 0; c.arrived = -1; c.twait = 0; },
    check: S => C2(S).tour >= TOUR.length, done(S, G, next) { say([N('ameni', '자, 이제 저녁 먹으러 가자. 종들의 저녁은 늦고 짧단다.')], next); }, next: 'c2_supper' },
  c2_supper: { ch: 3, obj: S => C2(S).ate ? '숙소 짚자리에서 자기' : '숙소 앞에서 종들과 저녁 먹기', target: S => C2(S).ate ? { x: BED[0], z: BED[1] } : { x: -44, z: 52 }, need: ['ameni'],
    enter(S, G, re) { const c = C2(S); if (!c.sd0) c.sd0 = S.day; if (G.hour() < 19) S.time = GG.Game.clockTo(S, 19.2, 0); amWalk(-43, 53.4); },
    check: S => S.day > (C2(S).sd0 || 1e9), done(S, G, next) { G.teleport(-45.6, 52.4, 0.4); next(); }, next: 'c2_work' },
  c2_story: { ch: 3, obj: '저녁 · 아메니와 이야기하기', target: 'npc:ameni', need: ['ameni'],
    enter(S, G, re) { if (G.hour() < 19) S.time = GG.Game.clockTo(S, 19.4, 0); amWalk(-43.4, 52.6); },
    talk: { ameni(S, G) { say([N('ameni', '젊을 적에 나는 대상을 따라 가나안을 여러 번 오갔단다. 헤브론 근처 상수리나무 숲도 지나 봤지. 그래서 네 말을 조금 알아.', '', 'tender'),
      J('헤브론이요? …제 아버지 장막이 거기 있어요. 아버지 이름은 야곱이에요. 막내 동생 베냐민도 있고요.', '', 'sad'), N('ameni', '…그렇구나. 아버지가 지금쯤 너를 찾고 계시겠구나.', '', 'sad'),
      J('형들이… 들짐승이 저를 먹었다고 했을지도 몰라요.', '', 'cry'), N('ameni', '울어도 된다. 여기서는 아무도 안 본다. …내일도 새벽에 깨우마. 이제 자거라.', '', 'tender'), T('숙소 짚자리에서 자요.')], () => G.go('c2_night1')); } } },
  c2_days: { ch: 3, obj: S => { const c = C2(S), D = DAYS[c.dd]; return !D ? '날들이 쌓였어요' : c.dayDone ? `${DAYN[c.dd]} 날 저녁 · 숙소 짚자리에서 자기` : `${DAYN[c.dd]} 날 · ${D[0]}`; },
    list: S => { const c = C2(S); return [{ t: '마당 쓸기' + (c.dd === 0 && !c.dayDone ? ` (${Object.keys(c.sw || {}).length}/4)` : ''), ok: c.dd > 0 || (c.dd === 0 && !!c.dayDone) }, { t: '곡식 자루 나르기' + (c.dd === 1 && !c.dayDone ? ` (${c.sk || 0}/2)` : ''), ok: c.dd > 1 || (c.dd === 1 && !!c.dayDone) }, { t: '헤누와 빵 굽기', ok: c.dd > 2 || (c.dd === 2 && !!c.dayDone) }]; }, need: ['ameni'],
    target: S => { const c = C2(S); if (c.dayDone) return { x: BED[0], z: BED[1] }; if (c.dd === 0) { const i = C2SPOT.sweep.findIndex((q, k) => !c.sw[k]); return i >= 0 ? { x: C2SPOT.sweep[i][0], z: C2SPOT.sweep[i][1] } : null; } if (c.dd === 1) return c.carry ? { x: C2SPOT.sackB[0], z: C2SPOT.sackB[1] } : { x: C2SPOT.sackA[0], z: C2SPOT.sackA[1] }; return { x: -10.6, z: 45 }; },
    enter(S, G, re) { const c = C2(S); if (!re) { c.dd = 0; c.dayDone = 0; } if (c.dd < 3 && !c.dayDone) setTimeout(() => dayStart(S), re ? 400 : 1200); },
    check: S => C2(S).dd >= 3,
    done(S, G, next) { narr([{ kick: '보디발의 집', title: '밭으로', t: '아메니가 요셉을 깨웠습니다. "오늘은 밭에 나가자. 아마를 거두는 날이다. 세마포를 짜는 그 아마 말이다."', ref: '' }], next); }, next: 'c2_field' },
  c2_flax2: { ch: 3, obj: S => ['아마 다발 운하 물에 담그기', '이틀을 기다려요', '아마 건져 볕에 널기', '방망이로 아마 두드리기', '세마포가 될 실'][C2(S).fl] || '',
    list: S => { const f = C2(S).fl; return [{ t: '물에 담그기', ok: f >= 1 }, { t: '건져 널기', ok: f >= 3 }, { t: '두드려 섬유 고르기', ok: f >= 4 }]; },
    target: S => { const f = C2(S).fl; return f === 3 ? { x: C2SPOT.rack[0], z: C2SPOT.rack[1] } : { x: SPOTS.canal[0], z: SPOTS.canal[1] }; },
    enter(S, G, re) { if (!re) say([N('ameni', '거둔 아마는 바로 쓰는 게 아니란다. 물에 담갔다가, 말렸다가, 두드려야 실이 나와. 같이 하자.')]); amWalk(SPOTS.canal[0] - 2, SPOTS.canal[1] + 1.5); },
    check: S => C2(S).fl >= 4, next: 'c2_store' },
  c2_seasons: { ch: 3, obj: S => { const c = C2(S); return c.se >= 3 ? '여러 해가 흘렀어요' : SEAS[c.se][0]; },
    list: S => { const c = C2(S), t = c.st || {}; return c.se === 0 ? [{ t: '흙벽돌 찍기', ok: !!t.brick }, { t: '곡식 자루 높은 곳으로', ok: !!t.lift }] : c.se === 1 ? [{ t: '씨앗 나눠 주기', ok: !!t.seed }, { t: '소에 쟁기 매기', ok: !!t.plough }] : [{ t: '곡식 세어 장부에 적기', ok: !!t.count }]; },
    target: S => { const c = C2(S), t = c.st || {}; return c.se === 0 ? (!t.brick ? { x: C2SPOT.brick[0], z: C2SPOT.brick[1] } : { x: SPOTS.store[0], z: SPOTS.store[1] }) : c.se === 1 ? (!t.seed ? { x: C2SPOT.seed[0], z: C2SPOT.seed[1] } : { x: C2SPOT.plough[0], z: C2SPOT.plough[1] }) : { x: SPOTS.store[0], z: SPOTS.store[1] }; },
    enter(S, G, re) { const c = C2(S); if (!re) { c.se = 0; c.st = {}; fade(() => { S.day += 90; S.time = 8; }, () => seasonStart(S)); } },
    check: S => C2(S).se >= 3, done(S, G, next) { cinBless(S, G, next); }, next: 'c2_tempt1' }
};
/* ① Ameni's welcome now ends with 「따라오너라」 and the tour (the jar comes in the morning) */
steps.c2_arrive.talk.ameni = (S, G) => { say([EG('ameni', '엠 헤테프… 이-크 레크?', '평안하냐… 어디서 왔느냐?'), T('요셉은 고개를 저었습니다. 한 마디도 알아들을 수 없었습니다.', '시편 81:5 참고'),
  N('ameni', '…가나안 말을 하는구나? 나도 조금 할 줄 안다. 젊을 적에 대상을 따라 다녔거든.', '', 'tender'), N('ameni', '여기는 바로의 신하, 시위대장 보디발 나리의 집이다. 나리는 바로를 지키는 호위대의 우두머리시지. 이제 너는 이 집의 종이다. 나는 아메니라고 한다.'),
  N('ameni', '울지 마라, 얘야. 종의 하루는 길단다. 살아남으려면 먼저 이 집을 알고, 애굽 말부터 익혀야 해. 내가 가르쳐 주마.', '', 'tender'),
  N('ameni', '자, 따라오너라. 이 집을 한 바퀴 보여 주마. 길을 잃으면 매 맞는다, 하하.')], () => { learn('hotep'); G.go('c2_tour'); }); };
/* ② the first day: Ameni works beside him */
Object.assign(steps.c2_work, { need: ['ameni', 'cook', 'boy'],
  enter(S, G, re) { if (!G.tool('jar')) G.giveTool('jar'); G.hold('jar'); if (!re) say([N('ameni', '일어나라, 얘야. 첫닭이 울었다. 자, 이 물항아리는 이제 네 것이다.'), N('ameni', '우물에서 물을 길어 부엌 항아리를 세 번 채우고, 맷돌에 보리를 갈고, 외양간 소들에게 꼴을 주자. 오늘은 내가 곁에서 같이 하마.'),
    T('「애굽 말 배우기」 · 일을 하면 애굽 말을 하나씩 익혀요. 익힌 말은 사람들의 말을 알아듣는 데 도움이 돼요.')], () => amWalk(SPOTS.well[0] + 1.6, SPOTS.well[1] - 1, '두레박은 무릎을 굽히고 허리를 펴서 당겨라.')); },
  list: S => { const c = C2(S); return [{ t: `우물물 길어 부엌 항아리 채우기 (${qd(S, 'w1') ? 3 : Math.min(3, c.pour)}/3)`, ok: qd(S, 'w1') }, { t: '헤누와 맷돌로 보리 갈기', ok: qd(S, 'w2') }, { t: '외양간 소들에게 꼴 주기', ok: qd(S, 'w3') }]; } });
{ const sp = specials.find(q => q.id === 'kJars'); if (sp) { sp.label = S => S.water >= 4 ? `부엌 항아리에 물 붓기 (${Math.min(3, C2(S).pour + 1)}/3)` : '물이 부족해요 (우물에서 길어 와요)';
    const use0 = sp.use; sp.use = (S, G) => { const c = C2(S); if (c.pour >= 2) { c.pour = 3; return use0(S, G); } if (S.water < 4) { G.UI.toast('우물에서 물을 길어 와요 (한 번 부을 물)'); return; } if (G.hand() !== 'jar') { G.hold('jar'); return; }
      S.water -= 4; act('water', 0.8, 'jar'); G.sfx('pour'); G.UI.hud(); c.pour++; GG.UI.quest(); if (c.pour === 1) { GG.Life.bubble('ameni', '좋다. 두 번만 더.', 3); amWalk(SPOTS.well[0] + 1.4, SPOTS.well[1] - 1.4); } if (c.pour === 2) GG.Life.bubble('ameni', '…어이쿠, 허리야.', 3); }; } }
{ const sq = specials.find(q => q.id === 'quern'); if (sq) { const u0 = sq.use; sq.use = (S, G) => { amWalk(SPOTS.quern[0] - 1.6, SPOTS.quern[1] + 1.4, '헤누가 노래를 부르면 맷돌이 잘 돈다더라.'); return u0(S, G); }; } }
{ const so = specials.find(q => q.id === 'feedOx'); if (so) { const u0 = so.use; so.use = (S, G) => { amWalk(7.4, 68.4, '아픈 소는 눈부터 봐라. 눈이 맑으면 괜찮다.'); return u0(S, G); }; } }
/* the night line of the old c2_quiz moves to the first night (it now leads to Ameni's evening story) */
{ const say0 = GG.UI.say; GG.UI.say = function (lines, cb) { const S = GG.Game.S && GG.Game.S(); if (S && S.step === 'c2_quiz' && Array.isArray(lines)) lines = lines.filter(l => !(l && /그날 밤, 요셉은 종들의 숙소에 누워/.test(l.t || ''))); return say0.call(this, lines, cb); }; }
/* (v18.72 Ameni's evening story — his past and Joseph's words about his father — was not in Scripture: c2_quiz goes straight on to the night) */
steps.c2_night1.done = (S, G, next) => next();
/* ⑤ the ledger, then Egyptian numbers from the scribe */
Object.assign(steps.c2_store, { list: S => [{ t: `곳간 선반 살피기 (${Object.keys(S.q.shelf || {}).length}/4)`, ok: Object.keys(S.q.shelf || {}).length >= 4 }, { t: '서기관에게 틀린 곳 알려 주기', ok: qd(S, 'ledger') }, { t: '서기관 이피에게 애굽 숫자 배우기', ok: !!S.q.numbers }],
  target: S => Object.keys(S.q.shelf || {}).length < 4 ? 'spot:store' : 'npc:scribe', check: S => qd(S, 'ledger') && !!S.q.numbers });
{ const t0 = steps.c2_store.talk.scribe; steps.c2_store.talk.scribe = function (S, G) { if (S.q.ledger && !S.q.numbers) { numbersLesson(S, G); return; } return t0.apply(this, arguments); }; }
function numbersLesson(S, G) { say([N('scribe', '자네 셈이 밝군. 그럼 애굽 숫자도 배워 두게. 막대 하나가 하나, 말발굽처럼 굽은 뒤꿈치뼈가 열, 감긴 밧줄이 백일세.'),
  { n: '서기관 이피', t: '곡식 자루 스물둘을 장부에 어떻게 쓰겠나?', choices: [{ t: '뒤꿈치뼈 둘, 막대 둘', ok: true }, { t: '막대 스물둘', ok: false, fb: '이피가 껄껄 웃었습니다. 「그러다 장부가 막대 숲이 되겠네! 열은 뒤꿈치뼈 하나로 쓰지.」' }, { t: '감긴 밧줄 둘, 막대 둘', ok: false, fb: '「밧줄은 백이라네. 그럼 이백둘이 되지.」' }] },
  N('scribe', '옳지! 오늘부터 곳간 장부 한 장은 자네가 쓰게. 이 늙은 눈이 한결 편하겠구먼.', '', 'happy')], () => { S.q.numbers = 1; GG.UI.quest(); G.checkStep(); }); }
/* ⑥ the feast is prepared first: bread with Henu, wine jars, lotus */
Object.assign(steps.c2_banquet, { enter(S, G, re) { setTimeout(() => { if (G.S().step === 'c2_banquet') G.go('c2_manage'); }, 0); /* v18.72 (Potiphar's feast was not in Scripture: an old save here goes on to 39:4) */ },
  obj: S => S.q.prepDone ? `잔치에서 보디발과 손님들 섬기기 (${Math.min(4, S.q.served || 0)}/4)` : '잔치 준비 · 헤누를 돕기',
  target: S => { if (!S.q.prepDone) { const pr = C2(S).prep || {}; return !pr.bread ? { x: -10.6, z: 43.6 } : !pr.wine ? { x: SPOTS.store[0], z: SPOTS.store[1] } : { x: SPOTS.pool[0], z: SPOTS.pool[1] }; } return S.q.carry ? 'npc:' + (S.q.want || 'guest1') : { x: -39.2, z: 43.1 }; } });
{ const l0 = steps.c2_banquet.list; steps.c2_banquet.list = (S, G) => S.q.prepDone ? l0(S, G) : (pr => [{ t: '헤누와 빵 굽기', ok: !!pr.bread }, { t: '포도주 단지 나르기', ok: !!pr.wine }, { t: '연꽃 꽂기', ok: !!pr.lotus }])(C2(S).prep || {}); }
/* ⑦ the overseer's days, and Ameni's back */
Object.assign(steps.c2_manage, { list: S => [{ t: '일꾼들에게 맞는 일 맡기기', ok: qd(S, 'assign') }, { t: '요리사와 정원지기의 다툼 풀기', ok: qd(S, 'quarrel') }, { t: '청지기 네브와 이야기하기', ok: qd(S, 'nebOk') }].concat(S.q.amHurt ? [{ t: '곁이야기 · 아메니의 허리', ok: !!S.q.amCare }] : []),
  target: S => !qd(S, 'assign') ? { x: -30, z: 44.9 } : !qd(S, 'quarrel') ? 'npc:cook' : !qd(S, 'nebOk') ? 'npc:neb' : !S.q.amCare ? (C2(S).herb ? 'npc:ameni' : { x: C2SPOT.herb[0], z: C2SPOT.herb[1] }) : null,
  check: S => { const base = qd(S, 'assign') && qd(S, 'quarrel') && qd(S, 'nebOk'); if (base && !S.q.amHurt) { S.q.amHurt = 1; GG.UI.quest(); say([{ n: '어린 종', t: '총무님! 아메니 영감이 물동이를 들다 허리를 삐끗했어요!', e: 'fear' }, T('곁이야기 · 정원에서 약초를 캐어 드릴 수 있어요(안 해도 이야기는 이어져요).')]); return false; } return base; },
  done(S, G, next) { next(); }, next: 'c2_seasons' });
steps.c2_manage.talk.ameni = (S, G) => { if (!S.q.amHurt || S.q.amCare) return false; if (!C2(S).herb) { say([N('ameni', '아이고… 괜찮다, 괜찮아. 늙으면 다 이렇지.', '', 'weary'), T('정원지기에게 약초를 얻어 오면 좋겠어요.')]); return; }
  say([T('정원지기가 준 약초를 아메니의 허리에 붙여 드렸어요.'), N('ameni', '…네가 나를 돌보는구나. 처음 이 집에 왔을 때는 내가 너를 돌봤는데.', '', 'cry'), N('ameni', '고맙다, 총무. 아니… 고맙다, 요셉아.', '', 'tender')], () => { S.q.amCare = 1; GG.UI.quest(); G.checkStep(); }); };
/* ⑨ day after day (39:10): three days, each day the summons, and he picks a place among people */
Object.assign(steps.c2_tempt2, { list: S => { const c = C2(S); return [{ t: `날마다 사람들 곁에서 일하기 (${Math.min(3, c.td)}/3일)`, ok: c.td >= 3 }, { t: '숙소에서 무릎 꿇기 (창 39:9)', ok: !!c.prayN }]; },
  target: S => { const c = C2(S); return c.td < 3 ? null : { x: C2SPOT.prayer[0], z: C2SPOT.prayer[1] }; },
  check: S => { const c = C2(S); return c.td >= 3 && !!c.prayN; } });
{ const e0 = steps.c2_tempt2.enter; steps.c2_tempt2.enter = function (S, G, re) { if (e0) e0.apply(this, arguments); if (C2(S).td < 3) setTimeout(() => temptDay(S), re ? 1500 : 4000); }; }
steps.c2_tempt2.talk.ameni = () => false; /* (Ameni's warning and Joseph's answer were not in Scripture) */
const TEMPT_JOBS = [['밭에서 일꾼들과 아마 거두기', [6, 44]], ['대청에서 서기와 장부 맞추기', [-22, 41.5]], ['외양간에서 소 치는 아이와 소 돌보기', [8, 73]], ['곳간에서 짐꾼들과 곡식 세기', [-13, 62]]];
function temptDay(S) { const c = C2(S), G = Gm(); if (S.step !== 'c2_tempt2' || c.td >= 3 || c.tdBusy) return; if (GG.UI.busy() || GG.Cine.on) { setTimeout(() => temptDay(S), 1500); return; } c.tdBusy = 1;
  say([T('여인이 날마다 요셉에게 청하였습니다.', '창세기 39:10'), { n: '', t: '오늘은 어디서 일할까요? (사람들이 있는 곳)', choices: TEMPT_JOBS.map(([t, at]) => ({ t, then: () => setTimeout(() => {
    fade(() => { G.teleport(at[0] + 1.5, at[1] + 1.5, 0); S.time = Math.max(S.time, 17.5); }, () => { c.td++; c.tdBusy = 0; GG.UI.quest();
      say([T(c.td === 1 ? '요셉은 해가 질 때까지 사람들 곁을 떠나지 않았습니다.' : c.td === 2 ? '이튿날도, 그다음 날도 여인은 같은 말로 청하였습니다.' : '여인이 날마다 요셉에게 청하였으나, 요셉이 듣지 아니하여 동침하지 아니할 뿐더러 함께 있지도 아니하니라.', c.td === 3 ? '창세기 39:10' : '')].concat(c.td >= 3 ? [T('밤이 되었어요. 숙소에서 무릎을 꿇어요.')] : []),
        () => { if (c.td < 3) fade(() => { S.day += 1; S.time = 9; }, () => setTimeout(() => temptDay(S), 1200)); }); }); }, 60) })) }]); }
/* ⑩ the walk to the prison: the accusation scene is cut before 「3장」 and the walk is played in between (39:20) */
const JAIL_PATH = [[-17, 51.6], [-6, 52], [-2.5, 49], [-2.5, 24], [-14, 21], [-27, 19.5], [-30, 16.6]]; /* out by the side door and round the back wall to the prison gate (the yard's back wall has no door) */
let splitAccuse = false;
{ const play1 = GG.Cine.play; GG.Cine.play = function (shots, done, o) {
    if (splitAccuse && shots && shots.some(s => /보라! 주인이 히브리 사람을/.test(s.t || ''))) { splitAccuse = false; const bi = shots.findIndex(s => s.black); if (bi > 0) { const a = shots.slice(0, bi).map((s, i) => i === bi - 1 ? Object.assign({}, s, { fadeOut: 0 }) : s), b = shots.slice(bi);
      return play1.call(this, a, () => { const S = GG.Game.S(); S.q.jail = { i: 0, wait: 1 }; /* the escape's catch rule stays off from here */ setTimeout(() => jailWalk(S, () => play1.call(GG.Cine, b, done, o)), 30); }, o); } }
    return play1.apply(this, arguments); }; }
{ const d0 = steps.c2_flee.done; steps.c2_flee.done = function (S, G, next) { splitAccuse = true; return d0.apply(this, arguments); }; }
{ const e0 = steps.c2_flee.enter; steps.c2_flee.enter = function (S, G, re) { if (S.q.grabAt) { GRAB.x = S.q.grabAt[0]; GRAB.z = S.q.grabAt[1]; } return e0 && e0.apply(this, arguments); }; }
{ const o0 = steps.c2_flee.obj, t0 = steps.c2_flee.target; steps.c2_flee.obj = S => S.q.jail ? '병사들을 따라 옥으로 걷기' : (typeof o0 === 'function' ? o0(S) : o0); steps.c2_flee.target = S => S.q.jail ? 'npc:pg1' : (typeof t0 === 'function' ? t0(S) : t0); }
function jailWalk(S, then) { const G = Gm(); S.q.jail = { i: 0, then }; S.q.bound = 1; RT.chase = null; RT.alarm = 0; { const w = G.npc('wife'); if (w) { w.walk = null; w.emote = null; } } G.npcShow('pg1', true); G.npcShow('pg2', true); place('pg1', -28.9, 47.6, Math.PI); place('pg2', -26.3, 47.6, Math.PI); G.teleport(-27.6, 49.6, Math.PI);
  face('ameni', -27.6, 49.6); GG.UI.quest();
  say([T('병사 둘이 요셉의 두 팔을 묶어 앞세우고 걸었습니다.'), T('대청 기둥 곁에서 늙은 아메니가 요셉을 바라보았습니다. 아메니는 아무 말 없이, 천천히 고개를 끄덕였습니다.'), T('병사들을 따라 옥까지 걸어요.')]); }
function jailTick(dt, S) { const j = S.q.jail; if (!j || j.wait || GG.UI.busy() || GG.Cine.on) return;
  if (!j.then) { /* a game loaded in the middle of the walk: the scene's end is gone, so go on to the cell */ S.q.jail = null; S.q.bound = 0; const G = Gm(); stage(S, G); G.teleport(-18.4, -6.2, Math.PI); G.go('c3_cell'); return; } const G = Gm(), n = G.npc('pg1'), n2 = G.npc('pg2'); if (!n) return; const d = G.dist(n.x, n.z);
  if (j.i === 0 && !j.nod) { j.nod = 1; GG.Life.bubble('ameni', '……', 3); }
  if (d > 7) { if (n.walk) n.walk = null; if (n2 && n2.walk) n2.walk = null; j.wt = (j.wt || 0) + dt; if (j.wt > 4) { j.wt = 0; GG.Life.bubble('pg1', '세헤브! 걸어라!', 2.4); } return; }
  if (!n.walk) { if (j.i >= JAIL_PATH.length) { const t = j.then; S.q.jail = null; S.q.bound = 0; t && t(); return; } const [x, z] = JAIL_PATH[j.i]; const nx = JAIL_PATH[j.i + 1] || [x, z - 2], ax = nx[0] - x, az = nx[1] - z, al = Math.hypot(ax, az) || 1; /* side by side, across the way ahead */ G.npcWalk('pg1', x - az / al * 1.1, z + ax / al * 1.1, () => { j.i++; }, 1.4); if (n2) G.npcWalk('pg2', x + az / al * 1.1, z - ax / al * 1.1, null, 1.4);
    if (j.i === 2 && !j.b2) { j.b2 = 1; GG.Life.bubble('pg2', '시위대장 나리 댁 총무가 옥에 가는군.', 3); } if (j.i === 3 && !j.b3) { j.b3 = 1; GG.Life.bubble('pg1', '쉿. 나리 귀에 들어간다.', 3); } } }

// ------------------------------------------------------------------ tick + order
function ch2Tick(dt, S) { if (!S) return; try { lookAge(S); const c = S.q.c2; if (!c && !S.q.jail) return; if (S.step === 'c2_tour') tourTick(dt, S, c); if (S.step === 'c2_days') daysTick(S, c); if (S.q.jail) jailTick(dt, S); } catch (e) { console.error('ch2', e); } }
function tourTick(dt, S, c) { if (!c || GG.UI.busy() || GG.Cine.on || c.tour >= TOUR.length) return; const G = Gm(), a = G.npc('ameni'); if (!a) return;
  if (c.arrived !== c.tour) { const [x, z] = TOUR[c.tour]; c.wk = (c.wk || 0) + dt; /* a well or a wall in the way: after 30 s (or within 3 m) he is there */
    if (Math.hypot(a.x - x, a.z - z) > 3 && c.wk < 30) { if (!a.walk) G.npcWalk('ameni', x, z, null, 1.5, TOUR[c.tour][3] || route(a.x, a.z, x, z)); return; } a.walk = null; c.arrived = c.tour; c.wk = 0; }
  if (a.walk) return;
  if (G.dist(a.x, a.z) > 6) { c.twait = (c.twait || 0) + dt; if (c.twait > 5) { c.twait = 0; GG.Life.bubble('ameni', '이쪽이다, 얘야!', 2.4); } return; }
  c.twait = 0; face('ameni', G.P.x, G.P.z); const line = TOUR[c.tour][2]; c.tour++; GG.UI.quest(); say([N('ameni', line)], () => G.checkStep()); }
{ const keys = Object.keys(steps), cut = keys.indexOf('c2_arrive'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c2_tour = CH2.c2_tour; steps.c2_supper = CH2.c2_supper;
  for (const [k, v] of tail) { steps[k] = v; if (k === 'c2_quiz') steps.c2_story = CH2.c2_story; if (k === 'c2_night1') steps.c2_days = CH2.c2_days; if (k === 'c2_field') steps.c2_flax2 = CH2.c2_flax2; if (k === 'c2_manage') steps.c2_seasons = CH2.c2_seasons; }
  steps.c2_night1.next = 'c2_days'; steps.c2_field.next = 'c2_flax2';
  ORDER = Object.keys(steps); }

/* v18.80 the flax field without the same move eight times: pull a few by the roots, bind the bundle, carry it to the canal (the workers pull the rest) */
const FBIND2 = [4, 51], FDROP2 = [1.2, 66.4];
Object.assign(steps.c2_field, { list: S => { const c = C2(S), n = Math.min(3, S.q.flax || 0); return [{ t: `아마를 뿌리째 뽑기 (${n}/3)`, ok: n >= 3 }, { t: '일꾼들과 아마 다발 묶기', ok: !!c.fBind }, { t: '다발을 지고 운하 곁으로', ok: !!c.fDrop }, { t: '진흙에 빠진 송아지 구하기', ok: qd(S, 'calf') }]; },
  target: S => { const c = C2(S); if ((S.q.flax || 0) < 3) return 'field:pflax'; if (!c.fBind) return { x: FBIND2[0], z: FBIND2[1] }; if (!c.fDrop) return { x: FDROP2[0], z: FDROP2[1] }; return !qd(S, 'calf') ? 'spot:canal' : null; },
  check: S => { const c = C2(S); return (S.q.flax || 0) >= 3 && !!c.fBind && !!c.fDrop && qd(S, 'calf'); } });
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || S.step !== 'c2_field' || G.cineOn || GG.UI.busy()) return null; const c = C2(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if ((S.q.flax || 0) >= 3 && !c.fBind) at(FBIND2[0], FBIND2[1], 3, { label: '일꾼들과 아마 다발 묶기', key: 'c2FBind', use: () => GG.UI.minigame('count', { title: '다발 묶기', hint: '뽑은 아마를 한 아름 모아 끈으로 세 번 감아 매요.', need: 3, btn: '감기', unit: '번' }, ok => { if (!ok) return; c.fBind = 1; p.carry = 'basket'; act('pick', 0.8);
    for (const k in S.plots) if (k.startsWith('pflax:') && S.plots[k].s === 2) delete S.plots[k]; GG.Game.ENT.plotsDirty = true; /* (the workers pulled the rest) */
    GG.UI.quest(); GG.UI.toast('일꾼들이 나머지 아마를 다 뽑았어요 · 다발을 지고 운하 곁으로'); }) });
  if (c.fBind && !c.fDrop) at(FDROP2[0], FDROP2[1], 2.8, { label: '운하 곁에 아마 다발 내려놓기', key: 'c2FDrop', use: () => { c.fDrop = 1; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.4 }); GG.UI.quest(); setTimeout(() => GG.Life.bubble('cowboy', '형! 송아지가 진흙에 빠졌어요!', 3.2), 900); } });
  return out.length ? out : null; });
// =================================================================== v18.70 3장 다시 짜기 · 「왕의 옥」 (e_ch3.js · 설계표_3장_v18_70.md)
/* 창 39:20 – 41:13. 늙은 죄수 파네브가 옥의 아메니가 되고, 간수장 호르는 차갑다가 요셉을 믿게 돼요.
   ① 첫날 밤: 차꼬 · 감방 살피기 · 벽 너머 네헤시 · 달빛 기도 · 짚자리 잠(시 105:18–19)
   ② 옥의 하루: 점호 · 물 넷(지금) · 보리죽(먹기/남기기) · 늙은 죄수(지금) → 밤샘 세 번 → 쪽잠 → 차꼬를 풀다(39:21 · 「나는 호르다」)
   ③ 옥의 총무: 파네브의 가르침 · 열쇠와 명부(애굽 숫자) · 떡 넷(지금) · 싸움(지금) · 케티와 메루의 짚 갈기 · 네헤시 배웅 → 39:23
   ④ 두 관원장: 문지기 수군거림 · 네헤시 감방 준비(짚 · 물 항아리 · 등잔) → 보디발(지금) → 잔 닦기 · 섬기기(지금)
   ⑤ 여러 날(40:4): 아침 물 · 낮 떡 · 저녁 등잔 → 밤 순찰(40:5)   ⑥ 두 꿈(지금 · 「음성」 대신 기도와 깨달음)
   ⑦ 사흘: 「기억해 주세요」 · 떡 굽는 관원장 곁에 앉기 · 기도 → 바로의 생일(지금)
   ⑧ 잊힌 두 해: 철마다 문소리 하나와 겹치지 않는 일 둘셋 → 바로의 꿈(지금) */
const C3 = S => S.q.c3 || (S.q.c3 = { look: {}, w: {} });
const BED3 = [-20.2, -8.6], WIN3 = [-18.4, -8.2], GATE3 = [-30, 11.4], STRAW3 = [-43.2, 6.4], PATCH3 = [-38.5, 3.2], JARS3 = [-42.6, 11.2], LAMP3 = [-21.6, 5.6];
const bars3 = i => [CELL[i][0], -4.3]; /* where he stands at a cell's bars */
const LOOKS3 = [['straw', -20.2, -8.3, '짚 한 줌', [T('젖은 짚 한 줌. 이것이 잠자리였습니다.')]], ['bowl', -17.2, -6.6, '깨진 물그릇', [T('이가 빠진 물그릇에 물이 조금 남아 있었습니다.')]],
  ['win', -18, -9, '벽의 작은 창', [T('손바닥만 한 창으로 달빛이 들어왔습니다. 헤브론에서 보던 그 달이었습니다.')]], ['marks', -21, -6.8, '벽에 남은 금', [T('벽에 누군가 새긴 금이 있었습니다. 먼저 이곳을 지나간 사람의 날들이었습니다.')]]];
/* the prison's own sleep: from the straw, the eye goes to the little window; the hours run on (a nap: three hours, no new day) */
function prisonSleep(text, nap, after) { const G = Gm(), S = G.S(), p = G.P, h = hAt(BED3[0], BED3[1]), t0 = S.time, t1 = nap ? t0 + 3 : Math.max(t0, 29.3);
  G.teleport(BED3[0], BED3[1] + 0.5, Math.PI); p.emote = { k: 'lie', t: 0, dur: 0 };
  cine([{ cam: [-19.2, h + 0.7, -6.9], cam2: [-19.0, h + 0.8, -7.1], look: [-18, h + 2, -9.8], look2: [-18, h + 2.1, -9.8], dur: 7, t: text, each: tt => { S.time = t0 + (t1 - t0) * Math.min(1, tt / 6.5); }, fadeOut: 1.2 }],
    () => { S.time = Math.max(S.time, t1); if (p.emote && p.emote.k === 'lie') p.emote = null; if (nap) { GG.UI.quest(); after && after(); G.checkStep(); return; } G.sleep(); setTimeout(() => { after && after(); G.checkStep(); }, 1300); }, { cut: true }); }
const toTime = (S, h, then) => fade(() => { if (S.time >= h) S.day += 1; S.time = h; }, () => { GG.UI.quest(); then && then(); }); /* S.time is the hour of S.day (it runs past 24 until the next sleep) */
/* an NPC walks ahead along a path and waits for him (Nehesi to the gate, Paneb to the gate) */
let ESC3 = null;
function escort(id, path, after, sp, call) { ESC3 = { id, path: path.slice(), after, wt: 0, sp: sp || 1.3, call: call || '요셉, 이쪽이오!' }; }
function escTick(dt) { const e = ESC3; if (!e || GG.UI.busy() || GG.Cine.on) return; const G = Gm(), n = G.npc(e.id); if (!n) { ESC3 = null; return; }
  if (e.pause > 0) { e.pause -= dt; return; } if (n.walk) return; const d = G.dist(n.x, n.z);
  if (d > 7) { e.wt += dt; if (e.wt > 5) { e.wt = 0; GG.Life.bubble(e.id, e.call, 2.4); } return; } e.wt = 0;
  const q = e.path.shift(); if (!q) { const a = e.after; ESC3 = null; a && a(); return; } G.npcWalk(e.id, q[0], q[1], () => { if (q[2]) e.pause = q[2]; if (q[3]) GG.Life.bubble(e.id, q[3], 3); }, e.sp); }

// ------------------------------------------------------------------ hands-on things
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^c3_/.test(S.step)) return null; const st = S.step, c = C3(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  const bed = (label, text, nap, after) => at(BED3[0], BED3[1], 1.6, { label, key: 'c3Bed', use: () => prisonSleep(text, nap, after) });
  if (st === 'c3_cell') { if (!c.nb) LOOKS3.forEach(([k, x, z, lb, L]) => { if (!c.look[k]) at(x, z, 1.25, { label: `살펴보기 · ${lb}`, key: 'c3L' + k, use: () => { c.look[k] = 1; GG.UI.quest(); say(L); } }); });
    if (c.prayed) bed('짚자리에 누워 자기', '「곧 여호와의 말씀이 응할 때까지라. 그의 말씀이 그를 단련하였도다.」', false); }
  if (st === 'c3_keeper') { if (!c.por) at(LAMP3[0], LAMP3[1], 2.4, { label: '간수장에게 보리죽 한 그릇 받기', key: 'c3Por', use: () => say([T('하루 한 그릇 보리죽이에요.'),
      { n: '요셉', t: '보리죽을 어떻게 할까? (어느 쪽도 정답은 아니에요)', choices: [{ t: '먹는다', then: () => { c.por = 1; p.emote = { k: 'eat', t: 0, dur: 2 }; G.sfx('eat'); GG.UI.quest(); } }, { t: '구석에서 앓는 늙은 죄수 몫으로 남겨 둔다', then: () => { c.por = 2; GG.UI.quest(); } }] }]) });
    if (S.q.oldCare && (c.vig || 0) < 3) { const [x, z] = bars3(2); at(x, z, 2.2, { label: ['한밤 · 젖은 천으로 이마 닦아 주기', '새벽 전 · 물 떠 먹이기', '동틀 녘 · 짚 거적 덮어 주기'][c.vig || 0], key: 'c3Vig', use: () => vigil(S, c) }); }
    if ((c.vig || 0) >= 3 && !c.nap) bed('짚자리에서 쪽잠 자기', '요셉은 짚자리에 쓰러지듯 누웠습니다. 밤새 지킨 눈이 스르르 감겼습니다.', true, () => { c.nap = 1; }); }
  if (st === 'c3_charge') { if (fed3(S) && !qd(S, 'fight')) at(FIGHT3.mid[0], FIGHT3.mid[1], 2.6, { label: '다툼 말리기 · 떡과 물그릇 견주어 보기', key: 'c3Fight', use: () => fight(S, G) });
    if (S.q.fight && !c.straw) at(STRAW3[0], STRAW3[1], 2.6, { label: '케티 · 메루와 감방 짚 갈기', key: 'c3Straw', use: () => GG.UI.minigame('count', { title: '짚 갈기', hint: '썩은 짚을 걷어 내고 마른 짚을 깔아요. 케티와 메루가 함께해요.', need: 6, btn: '걷어 내기', onPress: () => G.sfx('rustle') }, ok => { if (!ok) return;
      say([N('prisA', '어이, 메루. 그쪽 짚 좀 넘겨.'), N('prisB', '여기 있다, 케티. …어제 일은 잊자.'), N('oldP', '짚이 마르면 병도 덜 난다. 잘했다, 얘들아.', '', 'tender')], () => { c.straw = 1; GG.UI.quest(); G.checkStep(); }); }) }); }
  if (st === 'c3_officers') { const pr = c.prep || (c.prep = {}), [bx, bz] = bars3(3);
    if (!prepDone3(c)) { if (!c.carry) { if (!pr.straw) at(STRAW3[0], STRAW3[1], 2.6, { label: '마른 짚 한 아름 들기', key: 'c3PS', use: () => carry3(c, 'straw') }); if (!pr.jar) at(JARS3[0], JARS3[1], 2.4, { label: '물 항아리 들기', key: 'c3PJ', use: () => carry3(c, 'jar') }); if (!pr.lamp) at(LAMP3[0], LAMP3[1], 2.4, { label: '간수장 집에서 등잔 들기', key: 'c3PL', use: () => carry3(c, 'lamp') }); }
      else at(bx, bz, 2.4, { label: `빈 감방에 ${({ straw: '짚', jar: '물 항아리', lamp: '등잔' })[c.carry]} 놓기`, key: 'c3Put', use: () => { pr[c.carry] = 1; c.carry = null; p.carry = null; act('pick', 0.7); G.sfx('thud', { vol: 0.4 }); GG.UI.quest(); if (prepDone3(c)) setTimeout(() => cinOfficers3(S, G), 600); } }); }
    if (false) at(SPOTS.basin[0], SPOTS.basin[1], 2.6, { label: '모래로 잔 닦기', key: 'c3Cup', use: () => { c.cupClean = 1; act('gather', 1.2); G.sfx('water'); GG.UI.quest(); GG.UI.toast('잔이 깨끗해졌어요 · 술 맡은 관원장에게 드려요'); } }); }
  if (st === 'c3_days') { const D = DAYS3[c.d3 || 0], [bx, bz] = bars3(3);
    if (D && !c.d3done) at(bx, bz, 2.4, { label: D.t, key: 'c3Day', use: () => { act('pick', 0.7); say(D.lines, () => { c.d3done = 1; GG.UI.quest(); if ((c.d3 || 0) === 2) toTime(S, 23.5, () => say([T('한밤중이 되었어요. 등잔을 들고 감방을 둘러봐요.')])); }); } });
    if (c.d3done && (c.d3 || 0) === 2 && !c.patrol) at(bx, bz, 2.4, { label: '등잔 들고 밤 순찰 · 관원장들의 감방 살피기', key: 'c3Pat', use: () => say([T('한밤중, 요셉은 등잔을 들고 감방을 돌았습니다.'), T('두 관원장이 끙끙 앓는 소리를 내며 뒤척이고 있었습니다.'), T('옥에 갇힌 애굽 왕의 술 맡은 자와 떡 굽는 자 두 사람이 하룻밤에 꿈을 꾸니, 각기 몽조가 다르더라.', '창세기 40:5')], () => { c.patrol = 1; GG.UI.quest(); }) });
    if (c.d3done && ((c.d3 || 0) < 2 || c.patrol)) bed('짚자리에서 자기', ['하루가 저물었습니다. 창으로 별 하나가 지나갔습니다.', '옥 안이 조용해졌습니다. 요셉은 두 관원장을 위해 짧게 기도하고 잠들었습니다.', '그 밤, 두 사람의 꿈 이야기는 아직 아무도 몰랐습니다.'][c.d3 || 0], false); }
  if (st === 'c3_three') { const [bx, bz] = bars3(3);
    if (c.rem && !c.sit) at(bx + 1.1, bz, 2, { label: '떡 굽는 관원장 곁에 앉아 있기', key: 'c3Sit', use: () => { p.emote = { k: 'sitg', t: 0, dur: 5 }; say([T('관원장은 죽도 먹지 않고 벽만 바라보았습니다. 요셉은 아무 말 없이 창살 곁에 앉아 있었습니다.'), N('baker', '…자네는 끝까지 듣기 좋은 말을 하지 않는군.', '', 'weary'), J('…곁에 있을게요, 나리.', '', 'tender'), T('요셉은 거짓 위로를 하지 않았습니다. 다만 해가 지도록 곁을 떠나지 않았습니다.')], () => { c.sit = 1; toTime(S, 20.5); }); } });
    if (c.sit && !c.pray3) at(WIN3[0], WIN3[1], 1.8, { label: '창가에서 두 관원장을 위해 기도하기', key: 'c3Pr3', use: () => { cpose('kneelPray', 4); say([J('하나님, 술 맡은 관원장이 저를 잊지 않게 해 주세요.', '', 'pray'), J('그리고 떡 굽는 관원장의 남은 밤을… 불쌍히 여겨 주세요.', '', 'pray')], () => { cpose(null); c.pray3 = 1; c.t3At = S.day; GG.UI.quest(); }); } });
    if (c.pray3) bed('짚자리에서 자기', '사흘째 아침이 밝아 오고 있었습니다.', false); }
  if (st === 'c3_wait') waitCtx(S, c, at, bed);
  return out.length ? out : null; });
const prepDone3 = c => !!(c.prep && c.prep.straw && c.prep.jar && c.prep.lamp);
function carry3(c, k) { const G = Gm(); c.carry = k; act('pick', 0.7); if (k === 'straw') { G.P.carry = 'basket'; G.P.carryArms = false; } G.sfx('gather'); GG.UI.quest(); GG.UI.toast('네헤시가 있던 빈 감방으로 가져가요'); }
function cinOfficers3(S, G) { C3(S).offIn = 1; GG.UI.quest(); cinOfficers(S, G); }
function vigil(S, c) { const v = c.vig || 0, G = Gm(); act('gather', 1.2);
  const L = [[T('이마가 불덩이 같았습니다. 요셉은 젖은 천으로 이마를 닦고 또 닦았습니다.'), N('oldP', '…어머니…', '', 'weary')], [T('새벽 전, 늙은 죄수가 목이 마르다고 신음했습니다. 요셉은 물을 조금씩 떠 넣어 주었습니다.'), N('oldP', '…고맙다…', '', 'weary')],
    [T('동틀 녘, 바람이 차가워졌습니다. 요셉은 자기 짚 거적을 가져와 늙은 죄수에게 덮어 주었습니다.'), T('…열이 내렸습니다. 늙은 죄수가 고르게 숨을 쉬기 시작했습니다.'), T('요셉도 몹시 지쳤어요. 짚자리에서 잠깐 눈을 붙여요.')]][v];
  say(L, () => { c.vig = v + 1; GG.UI.quest(); if (v === 0) fade(() => { S.time = Math.max(S.time, 25.6); }, () => GG.UI.toast('새벽 한 시 반쯤')); if (v === 1) fade(() => { S.time = Math.max(S.time, 28.9); }, () => GG.UI.toast('동이 터 와요')); if (v === 2) { S.day += 1; S.time = 5.4; } }); }
const DAYS3 = [
  { t: '아침 · 술 맡은 관원장에게 물 드리기', h: 8, lines: [T('아침마다 요셉은 두 관원장에게 물을 날랐습니다.')] },
  { t: '낮 · 떡 굽는 관원장에게 떡 드리기', h: 12.5, lines: [T('낮에는 떡을 날랐습니다.')] },
  { t: '저녁 · 두 관원장에게 등잔 밝혀 드리기', h: 19, lines: [T('저녁에는 감방에 등잔을 밝혔습니다. 그들이 갇힌 지 여러 날이었습니다.', '창세기 40:4')] }];

// ------------------------------------------------------------------ ⑧ the forgotten two years: each season one door and two or three things that are not the same
function waitCtx(S, c, at, bed) { const G = Gm(), p = G.P, w = S.q.wait || 0, W = c.w;
  if (w <= 2 && W['rang' + w] && !W['door' + w]) at(GATE3[0], GATE3[1], 3, { label: '옥 문 · 누가 왔는지 보기', key: 'c3Door', use: () => door3(S, c, w) });
  if (w === 0) { const [x, z] = bars3(3); if (W.door0 && W.tahu && !W.bail) at(x, z, 2.4, { label: '감방 바닥 물 퍼내고 타후의 젖은 짚 갈아 주기', key: 'c3Bail', use: () => GG.UI.minigame('count', { title: '물 퍼내기', hint: '나일 강이 불어 감방 바닥까지 물이 스며들었어요. 바가지로 퍼내요.', need: 6, btn: '퍼내기', onPress: () => G.sfx('splash', { vol: 0.4 }) }, ok => { if (!ok) return;
      say([N('youngP', '형, 물이 발목까지 왔었어요!', '', 'fear'), T('물을 퍼내고, 타후의 젖은 짚을 마른 짚으로 갈아 주었어요.')], () => { W.bail = 1; toTime(S, 19.5, () => GG.UI.toast('저녁이 되었어요 · 타후에게 이야기를 들려줘요')); }); }) });
    if (W.bail) bed('짚자리에서 자기', '나일 강물이 불어나는 소리가 밤새 들려왔습니다.', false, () => waitNext(S, G)); }
  if (w === 1) { if (W.door1 && !W.patch) at(PATCH3[0], PATCH3[1], 2.6, { label: '파네브와 마당 한쪽에 채소밭 일구기', key: 'c3Patch', use: () => GG.UI.minigame('count', { title: '흙 일구기', hint: '돌을 골라내고 흙을 부드럽게 일궈요. 파네브가 씨앗을 넣어요.', need: 6, btn: '일구기', onPress: () => G.sfx('dig') }, ok => { if (!ok) return;
      say([N('oldP', '앓는 사람에게는 푸성귀 국이 약이지. 내가 나가도 이 밭은 남겠구나.', '', 'tender'), N('oldP', '오늘 내가 나간다, 얘야. 해가 기울면 간수장이 문을 열어 준다더구나.', '', 'tender')], () => { W.patch = 1; toTime(S, 16); }); }) });
    if (W.patch && !W.going) bed('짚자리에서 자기', W.gone ? '파네브가 누웠던 자리가 비어 있었습니다.' : '해가 졌어요. 옥 안이 조용해졌습니다.', false, () => { if (!W.gone) { W.gone = 1; S.q.oldGone = 1; } waitNext(S, G); }); } }
function door3(S, c, w) { const G = Gm(); c.w['door' + w] = 1; GG.UI.quest();
  if (w === 0) say([T('요셉은 옥 문 쪽으로 달려갔습니다.'), N('pg1', '떡 수레다. 비켜라.', '', 'cold'), T('그 뒤로 어린 죄수의 울음소리가 들려왔어요.')]);
  if (w === 1) say([T('문소리가 났습니다. 요셉은 이번에는 달려가지 않고 걸어갔습니다.'), N('pg2', '물장수다. 물 항아리 받아라.'), T('마당 한쪽에서 파네브가 손짓했어요.')]);
  if (w === 2) say([T('문소리가 났습니다. 이번에는 사람이 많았습니다.'), N('pg1', '세금을 못 낸 농부들이다. 명부에 적어라.', '', 'cold'),
    { n: '요셉', t: '「농부 열둘」. 명부에 어떻게 쓸까?', choices: [{ t: '뒤꿈치뼈 하나, 막대 둘', ok: true }, { t: '막대 열둘', ok: false, fb: '열은 뒤꿈치뼈 하나로 써요. 서기관 이피가 가르쳐 준 대로요.' }, { t: '감긴 밧줄 하나, 막대 둘', ok: false, fb: '감긴 밧줄은 백이에요.' }] },
    T('농부들은 거둔 곡식을 다 바치고도 세금을 채우지 못했다고 했습니다. 요셉은 감방을 나누고 마른 짚을 깔아 주었습니다.')], () => toTime(S, 19, () => GG.UI.toast('밤이 되었어요 · 감방 벽에 지난 날들을 새겨요'))); }
/* the seasons' objectives and lists (the old WAIT · four parts) */
WAIT[0] = { obj: S => { const W = C3(S).w; return !W.door0 ? '문소리 · 누가 왔을까' : !W.tahu ? '새로 들어온 어린 죄수 달래기' : !W.bail ? '감방 물 퍼내기' : '짚자리에서 자기'; },
  list: S => { const W = C3(S).w; return [{ t: '문소리', ok: !!W.door0 }, { t: '어린 죄수 타후', ok: !!W.tahu }, { t: '물 퍼내기 · 짚 갈기', ok: !!W.bail }]; },
  target: S => { const W = C3(S).w; return !W.door0 ? { x: GATE3[0], z: GATE3[1] } : !W.tahu ? 'npc:youngP' : !W.bail ? { x: bars3(3)[0], z: bars3(3)[1] } : { x: BED3[0], z: BED3[1] }; } };
WAIT[1] = { obj: S => { const W = C3(S).w; return !W.door1 ? '문소리 · 누가 왔을까' : !W.patch ? '파네브와 채소밭 일구기' : '짚자리에서 자기 (파네브 배웅은 곁이야기)'; },
  list: S => { const W = C3(S).w; return [{ t: '문소리', ok: !!W.door1 }, { t: '채소밭', ok: !!W.patch }, { t: '곁이야기 · 파네브 배웅', ok: !!W.gone }]; },
  target: S => { const W = C3(S).w; return !W.door1 ? { x: GATE3[0], z: GATE3[1] } : !W.patch ? { x: PATCH3[0], z: PATCH3[1] } : { x: BED3[0], z: BED3[1] }; } };
WAIT[2] = { obj: S => { const W = C3(S).w; return !W.door2 ? '문소리 · 누가 왔을까' : S.q.wReady ? '창가에서 기도하기' : '벽에 지난 날들을 새기기'; },
  list: S => { const W = C3(S).w; return [{ t: '새 죄수를 명부에', ok: !!W.door2 }, { t: '벽의 금', ok: !!S.q.wReady }]; },
  target: S => { const W = C3(S).w; return !W.door2 ? { x: GATE3[0], z: GATE3[1] } : S.q.wReady ? { x: PRAY[0], z: PRAY[1] } : { x: -20.4, z: -6.4 }; } };
SEASON[3].t = '술 맡은 관원장이 떠난 지 만 이 년이 지났습니다. 그 밤도 요셉은 옥에 있었습니다.';
steps.c3_wait.talk.keeper = () => false;
SEASON[1].t = '들판에 씨를 뿌리는 철이 왔습니다. 옥 밖에서는 농부들의 노랫소리가 들렸습니다. 오늘은 파네브가 풀려나는 날입니다.';
SEASON[2].t = '거두는 철. 한 해가 지나고 또 한 해가 흘렀습니다. 세금을 채우지 못한 농부들이 옥으로 끌려오는 철이기도 했습니다.';
function waitSetup(S, G, re) { S.q.wait = S.q.wait || 0; if (S.q.wait === 0) S.q.youngIn = 1; if (!re) { if (S.q.wait === 0) { S.day += 20; S.time = 8.5; } narr([SEASON[S.q.wait]]); } }
{ const sc = specials.find(q => q.id === 'scratch'); if (sc) { const on0 = sc.on; sc.on = S => on0(S) && !!C3(S).w.door2; } }
{ const sp = specials.find(q => q.id === 'prayWin'); if (sp) sp.on = S => (S.step === 'c3_cell' && !!C3(S).nb && !C3(S).prayed) || (S.step === 'c3_wait' && !!S.q.wReady); }
{ const T0 = steps.c3_wait.talk, y0 = T0.youngP, o0 = T0.oldP;
  T0.youngP = function (S, G) { const W = C3(S).w; if ((S.q.wait || 0) !== 0) return false;
    if (!W.door0) { say([N('youngP', '…엄마…', '', 'cry')]); return; }
    if (!W.tahu) { W._tahu = 1; /* the old talk ends with waitNext(): here it only marks Tahu */ return y0.call(this, S, G); }
    if (false) { say([J('타후, 이야기 하나 해 줄까? 우리 아버지 야곱이 젊을 때, 집을 떠나 혼자 광야에서 돌을 베고 잤대.', '', 'tender'),
      J('그 밤에 꿈을 꾸셨어. 땅에서 하늘까지 닿는 사닥다리가 있고, 그 위로 하나님의 사자들이 오르락내리락했대.', '창세기 28:12'), J('그리고 하나님이 말씀하셨대. 「내가 너와 함께 있어 네가 어디로 가든지 너를 지키리라」', '창세기 28:15', 'calm'),
      N('youngP', '…그 사닥다리가 이 옥에도 닿아요?', ''), J('응. 나는 그렇게 믿어.', '', 'calm'), T('타후는 창살에 기대어 잠이 들었습니다.')], () => { W.story = 1; GG.UI.quest(); }); return; }
    return false; };
  T0.oldP = function (S, G) { const W = C3(S).w; if ((S.q.wait || 0) !== 1 || !W.patch || W.gone || W.going) return false; W._pan = 1; return o0.call(this, S, G); }; }
/* the old talks of Tahu and Paneb end with waitNext(): in these seasons the talk only marks its part, the season ends at the straw bed */
function waitNextGate(S, G) { const W = C3(S).w; if (W._tahu) { W._tahu = 0; W.tahu = 1; GG.UI.quest(); return true; }
  if (W._pan) { W._pan = 0; W.going = 1; GG.UI.quest(); escort('oldP', [[-34, 6.4], [GATE3[0], GATE3[1] + 0.8, 1.4, '…잘 있거라, 요셉.'], [-30, 17.5]], () => { G.npcShow('oldP', false); S.q.oldGone = 1; W.gone = 1; W.going = 0; GG.UI.quest(); say([T('파네브는 웃으며 옥 문을 나섰습니다. 문이 닫히고, 마당이 조용해졌습니다.')], () => toTime(S, 19.5)); }); return true; }
  return false; }
/* the old waitNext (e_cine2.js), with the gate in front: a later declaration of the same name wins in the whole episode */
function waitNext(S, G) { if (waitNextGate(S, G)) return;
  S.q.wait = (S.q.wait || 0) + 1; G.UI.quest();
  if (S.q.wait >= 4) { cinPharaohDream(S, G); return; }
  if (S.q.wait === 3) { fade(() => { S.day += 60; S.time = 20.4; }, () => narr([SEASON[3]], () => { S.q.wait = 4; cinPharaohDream(S, G); })); return; } /* (v18.72 the jailer's night talk was not in Scripture: two full years, then Pharaoh's dream) */
  fade(() => { S.day += 60; S.time = GG.Game.clockTo(S, (S.q.wait === 3 ? 20.4 : 8.5), S.q.wait !== 3); if (S.q.wait === 2) S.q.oldGone = 1; }, () => narr([SEASON[S.q.wait]], () => G.UI.quest()));
}

// ------------------------------------------------------------------ the steps
/* ① the first night */
Object.assign(steps.c3_cell, { obj: S => { const c = C3(S), n = Object.keys(c.look).length; return !c.nb ? `감방 살펴보기 (${Math.min(n, 4)}/4)` : !c.prayed ? '창으로 드는 달빛 아래에서 기도하기' : '짚자리에 누워 자기'; },
  target: S => { const c = C3(S); if (!c.nb) { const k = LOOKS3.find(l => !c.look[l[0]]); return k ? { x: k[1], z: k[2] } : null; } return !c.prayed ? { x: WIN3[0], z: WIN3[1] } : { x: BED3[0], z: BED3[1] }; },
  enter(S, G, re) { const c = C3(S); S.q.cellLock = 1; S.q.chain = 1; G.setOutfit('josephFettered'); if (!c.d0) c.d0 = S.day; if (!re) setTimeout(() => say([T('발목의 차꼬가 걸을 때마다 철컥거렸습니다. 천천히만 걸을 수 있어요.'), T('좁은 감방을 둘러봐요.')]), 500); },
  check: S => !!C3(S).prayed && S.day > (C3(S).d0 || 1e9), next: 'c3_keeper' });
function neighbor3(S, c) { c.nb = 1; GG.UI.quest();
  say([T('벽 너머에서 누군가 뒤척이는 소리가 들려왔습니다. 어디선가 앓는 소리도 들렸습니다.'), T('창으로 드는 달빛 아래에서 무릎을 꿇어요.')]); }
/* the moonlight prayer: the first night now ends at the straw bed (the old one went on to the morning) */
function windowPray(S, G) {
  const h = hAt(PRAY[0], PRAY[1]);
  if (S.step === 'c3_cell') {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6, t: '요셉은 창으로 드는 달빛 아래 무릎을 꿇고 하나님을 불렀습니다.', music: 'j_prison' },
      { cam: [-18.6, h + 0.5, -6.4], cam2: [-18.5, h + 0.7, -6.8], look: [-18.4, h + 2.6, -9.6], look2: [-18.4, h + 1.4, -8.4], dur: 8, music: 'j_hope', each: t => { RT.grace = Math.min(1, t / 6); }, t: '창으로 든 달빛이 요셉의 얼굴을 비추었습니다. 그 밤, 요셉은 혼자가 아니었습니다.' },
    ], () => { cpose(null); RT.grace = 0; C3(S).prayed = 1; GG.UI.quest(); GG.UI.toast('짚자리에 누워 자요'); });
  } else {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6.5, t: '술 맡은 관원장이 떠난 지 두 해가 다 되어 갔습니다. 요셉은 그날 밤도 창가에 무릎을 꿇었습니다.' },
      { cam: [-18.6, h + 0.5, -6.4], look: [-18.4, h + 2.6, -9.6], dur: 8, each: t => { RT.grace = Math.min(0.7, t / 8); }, t: '술 맡은 관원장이 요셉을 기억지 않고 잊었더라.', ref: '창세기 40:23' },
    ], () => { cpose(null); RT.grace = 0; S.q.wReady = 0; waitNext(S, G); });
  }
}
/* ② the jailer's day */
{ const e0 = steps.c3_keeper.enter; steps.c3_keeper.enter = function (S, G, re) { S.q.cellLock = 0; if (re) return e0.apply(this, arguments); const a = arguments;
    say([T('새벽, 간수장이 감방마다 죄수를 세었습니다.'), T('옥 마당 대야에서 물을 길어 감방마다 나눠 줘요. 구석에서 앓는 늙은 죄수도 살펴봐요.')], () => { if (!G.tool('jar')) G.giveTool('jar'); }); }; }
Object.assign(steps.c3_keeper, { obj: S => { const c = C3(S), g = Object.keys(S.q.gave || {}).length; return g < 4 ? '간수장이 맡긴 일 · 감방마다 물 나눠 주기' : !c.por ? '보리죽 한 그릇 받기' : !S.q.oldCare ? '앓는 늙은 죄수 돌보기' : (c.vig || 0) < 3 ? '밤새 늙은 죄수 곁 지키기' : '짚자리에서 쪽잠 자기'; },
  list: S => { const c = C3(S), g = Object.keys(S.q.gave || {}).length; return [{ t: `감방의 죄수들에게 물 나눠 주기 (${Math.min(4, g)}/4)`, ok: g >= 4 }, { t: '보리죽 한 그릇', ok: !!c.por }, { t: '앓는 늙은 죄수 돌보기', ok: qd(S, 'oldCare') }, { t: `밤샘 (${Math.min(3, c.vig || 0)}/3)`, ok: (c.vig || 0) >= 3 }, { t: '쪽잠', ok: !!c.nap }]; },
  target: S => { const c = C3(S), g = Object.keys(S.q.gave || {}).length; if (g < 4) return S.water > 0 ? { x: -33, z: -4.6 } : 'spot:basin'; if (!c.por) return { x: LAMP3[0], z: LAMP3[1] }; if (!S.q.oldCare) return 'npc:oldP'; if ((c.vig || 0) < 3) return { x: bars3(2)[0], z: bars3(2)[1] }; return { x: BED3[0], z: BED3[1] }; },
  check: S => { const c = C3(S); return Object.keys(S.q.gave || {}).length >= 4 && qd(S, 'oldCare') && (c.vig || 0) >= 3 && !!c.nap; },
  done(S, G, next) { say([T('간수장이 요셉의 차꼬를 풀어 주었습니다.'), T('여호와께서 요셉과 함께하시고 그에게 인자를 더하사, 전옥에게 은혜를 받게 하시매…', '창세기 39:21')], () => { G.sfx('chain'); S.q.chain = 0; G.setOutfit('prisoner'); G.give('bread', 1, true); next(); }); } });
steps.c3_keeper.talk.oldP = (S, G) => { const c = C3(S); if (S.q.oldCare) return false; if (Object.keys(S.q.gave || {}).length < 4) { say([N('oldP', '…물… 물을…', '', 'weary')]); return; }
  say([N('oldP', '…누구냐… 간수냐…?', '', 'weary'), T(c.por === 2 ? '요셉은 물과 남겨 둔 보리죽을 늙은 죄수에게 건넸습니다.' : '요셉은 물과 자기 몫의 떡을 늙은 죄수에게 건넸습니다.'),
    N('oldP', '네 몫을…? 여기서 남에게 먹을 것을 주는 사람은 처음 보는구나…', '', 'weary'), T('늙은 죄수의 몸이 불덩이 같았습니다. 요셉은 오늘 밤 그 곁을 지키기로 했습니다.')],
    () => { S.q.oldCare = 1; fade(() => { if (S.time < 21.5) S.time = 21.5; }, () => { GG.UI.quest(); say([T('밤이 깊었어요. 창살 곁에서 늙은 죄수를 세 번 살펴요.')]); }); }); };
/* ③ the overseer of the prison */
Object.assign(steps.c3_charge, { obj: S => { const c = C3(S), f = Object.keys(S.q.fed || {}).length; return !c.keys ? '간수장에게 가기' : f < 4 ? '감방마다 떡 나눠 주기' : !qd(S, 'fight') ? '두 죄수의 싸움 말리기' : !c.straw ? '케티 · 메루와 짚 갈기' : (c.neh || 0) < 3 ? '풀려나는 네헤시 배웅하기' : '옥중의 일을 맡다'; },
  list: S => { const c = C3(S), f = Object.keys(S.q.fed || {}).length; return [{ t: '간수장에게 열쇠와 명부 받기', ok: !!c.keys }, { t: `감방마다 떡 나눠 주기 (${Math.min(4, f)}/4)`, ok: f >= 4 }, { t: '두 죄수의 싸움 말리기', ok: qd(S, 'fight') }, { t: '케티 · 메루와 짚 갈기', ok: !!c.straw }].concat(c.tips ? [] : [{ t: '곁이야기 · 늙은 죄수 파네브', ok: false }]).concat(c.straw && (c.neh || 0) < 3 ? [{ t: '곁이야기 · 풀려나는 네헤시', ok: false }] : []); },
  target: S => { const c = C3(S), f = Object.keys(S.q.fed || {}).length; if (!c.keys) return 'npc:keeper'; if (f < 4) return Gm().P.carry === 'basket' ? { x: -33, z: -4.6 } : { x: -33.7, z: 7 }; if (!qd(S, 'fight')) return { x: FIGHT3.mid[0], z: FIGHT3.mid[1] }; if (!c.straw) return { x: STRAW3[0], z: STRAW3[1] }; return 'npc:prisD'; },
  check: S => { const c = C3(S); return !!c.keys && Object.keys(S.q.fed || {}).length >= 4 && qd(S, 'fight') && !!c.straw; } }); /* (Paneb's tips and Nehesi's farewell are side things) */
{ const e0 = steps.c3_charge.enter; steps.c3_charge.enter = function (S, G, re) { const c = C3(S); if (re && c.neh === 2) { c.neh = 3; S.q.nehGone = 1; } return e0.apply(this, arguments); }; }
/* (v18.72 the jailer's speech after 39:23 was not in Scripture) */
Object.assign(steps.c3_charge.talk, {
  oldP(S, G) { const c = C3(S); if (c.tips) return false; say([N('oldP', '요셉이라 했지? 나는 파네브다. 이 옥에서 여섯 해를 살았지. 네 덕에 다시 일어났구나.', '', 'tender'), N('oldP', '이 늙은이가 옥살이를 알려 주마. 첫째, 물은 아껴라. 대야는 하루에 한 번만 찬다.'),
    N('oldP', '둘째, 호르는 화를 내도 뒤끝이 없다. 거짓말만 안 하면 된다.'), N('oldP', '셋째, 케티와 메루는 하루걸러 싸운다. 오늘이 그날이다, 허허.', '', 'laugh')], () => { c.tips = 1; GG.UI.quest(); G.checkStep(); }); },
  keeper(S, G) { const c = C3(S); if (c.keys) return false; say([T('간수장이 옥 열쇠와 죄수 명부를 요셉에게 맡겼어요. 들어온 날을 애굽 숫자로 적어요.'),
    { n: '요셉', t: '「케티 · 들어온 지 열넷째 달」. 명부에 어떻게 쓸까?', choices: [{ t: '뒤꿈치뼈 하나, 막대 넷', ok: true }, { t: '막대 열넷', ok: false, fb: '보디발의 집에서 서기관 이피가 가르쳐 준 것을 떠올려요. 열은 뒤꿈치뼈 하나예요.' }, { t: '감긴 밧줄 하나, 막대 넷', ok: false, fb: '감긴 밧줄은 백이에요.' }] },
], () => { c.keys = 1; G.sfx('chain', { vol: 0.3, pitch: 1.6 }); GG.UI.quest(); G.checkStep(); }); },
  prisD(S, G) { const c = C3(S); if (!c.straw || c.neh) return false; say([N('prisD', '요셉! 오늘이오. 오늘 내가 나가오!', '', 'happy'), J('잘됐어요, 네헤시. 나가기 전에 얼굴이라도 씻으세요. 대문까지 같이 가요.', '', 'happy')],
    () => { c.neh = 2; GG.UI.quest(); fade(() => { place('prisD', bars3(3)[0], -3.4, 0); }, () => escort('prisD', [[-34, 2], [SPOTS.basin[0] + 1.4, SPOTS.basin[1] - 0.6, 2, '시원하다! 이 물맛도 이제 마지막이로군.'], [GATE3[0], GATE3[1] + 0.8, 1.6, '고맙소, 히브리 사람. 남쪽 마을에 가면 네 이야기를 하겠소.'], [-30, 17.5]],
      () => { G.npcShow('prisD', false); S.q.nehGone = 1; c.neh = 3; GG.UI.quest(); say([T('네헤시가 옥 문을 나섰습니다. 요셉은 처음으로 그 문이 열리는 것을 보았습니다.')], () => G.checkStep()); })); }); } });
{ const d = npcs.find(n => n.id === 'prisD'); if (d) { const s0 = d.show; d.show = S => s0(S) && !S.q.nehGone; } }
/* ④ the two chief officials: the cell is made ready first; the cup is cleaned before the water */
Object.assign(steps.c3_officers, { enter(S, G, re) { const c = C3(S); c.prep = c.prep || {};
    if (!re) { GG.Life.bubble('pg1', '궁에서 높은 분들이 온다더라.', 3.4); setTimeout(() => GG.Life.bubble('pg2', '쉿. 무슨 일인지는 아무도 모른다.', 3.4), 1800); say([T('간수장이 빈 감방을 치우게 했어요. 새 짚 · 물 항아리 · 등잔을 들여놓아요.')]); }
    else if (prepDone3(c) && !c.offIn) cinOfficers3(S, G); },
  obj: S => { const c = C3(S); return !prepDone3(c) ? (c.carry ? '빈 감방에 가져다 놓기' : '빈 감방 준비하기 (짚 · 물 항아리 · 등잔)') : !qd(S, 'cupW') ? '술 맡은 관원장에게 물 드리기' : '떡 굽는 관원장에게 떡 드리기'; },
  list: S => { const c = C3(S), pr = c.prep || {}; return [{ t: '짚', ok: !!pr.straw }, { t: '물 항아리', ok: !!pr.jar }, { t: '등잔', ok: !!pr.lamp }].concat(c.offIn ? [{ t: '술 맡은 관원장에게 물 드리기', ok: qd(S, 'cupW') }, { t: '떡 굽는 관원장에게 떡 드리기', ok: qd(S, 'bakeW') }] : []); },
  target: S => { const c = C3(S), pr = c.prep || {}; if (!prepDone3(c)) { if (c.carry) return { x: bars3(3)[0], z: bars3(3)[1] }; return !pr.straw ? { x: STRAW3[0], z: STRAW3[1] } : !pr.jar ? { x: JARS3[0], z: JARS3[1] } : { x: LAMP3[0], z: LAMP3[1] }; }
    if (!qd(S, 'cupW')) return 'npc:cupbearer'; return 'npc:baker'; },
  check: S => { const c = C3(S); return prepDone3(c) && !!c.offIn && qd(S, 'cupW') && qd(S, 'bakeW'); }, done(S, G, next) { next(); }, next: 'c3_days' });
steps.c3_officers.talk.cupbearer = function (S, G) { if (S.q.cupW || !C3(S).offIn) return false; act('pick', 0.7); say([T('요셉은 술 맡은 관원장에게 물을 드렸습니다.')], () => tick(S, 'cupW')); }; /* (v18.72 his invented words and the chosen answer were not in Scripture) */
steps.c3_officers.talk.baker = function (S, G) { if (S.q.bakeW || !C3(S).offIn) return false; act('pick', 0.7); say([T('요셉은 떡 굽는 관원장에게 떡을 드렸습니다.')], () => tick(S, 'bakeW')); };
['cupbearer', 'baker'].forEach(id => { const d = npcs.find(n => n.id === id); if (d) d.show = S => between(S, 'c3_officers', 'c3_three') && (S.step !== 'c3_officers' || !!(S.q.c3 && S.q.c3.offIn)); });
/* ⑤ many days (40:4) · one thing a day, then the night watch (40:5) */
const CH3 = {
  c3_days: { ch: 4, obj: S => { const c = C3(S), D = DAYS3[c.d3 || 0]; if (!D) return '여러 날이 지났어요'; return !c.d3done ? D.t : (c.d3 || 0) === 2 && !c.patrol ? '한밤 · 등잔 들고 순찰하기' : '짚자리에서 자기'; },
    list: S => { const c = C3(S), k = c.d3 || 0; return DAYS3.map((D, i) => ({ t: D.t.split(' · ')[0] + ' · ' + ['물', '떡', '등잔'][i], ok: i < k || (i === k && !!c.d3done) })).concat([{ t: '밤 순찰', ok: !!c.patrol }]); },
    target: S => { const c = C3(S); if (!c.d3done || ((c.d3 || 0) === 2 && !c.patrol)) return { x: bars3(3)[0], z: bars3(3)[1] }; return { x: BED3[0], z: BED3[1] }; }, need: ['cupbearer', 'baker'],
    enter(S, G, re) { const c = C3(S); if (!re) { c.d3 = 0; c.d3done = 0; c.patrol = 0; fade(() => { S.day += 1; S.time = 8; }, () => { c.d3At = S.day; narr([{ kick: '창세기 40:4', title: '여러 날', t: '그들이 갇힌 지 여러 날이라. 요셉은 날마다 두 관원장을 섬겼습니다.', ref: '창세기 40:4' }]); }); } },
    check: S => { const c = C3(S); return (c.d3 || 0) >= 3; }, next: 'c3_dreams' },
  c3_three: { ch: 4, obj: S => { const c = C3(S); return !c.rem ? '술 맡은 관원장과 이야기하기' : !c.sit ? '떡 굽는 관원장 곁에 있어 주기' : !c.pray3 ? '창가에서 두 사람을 위해 기도하기' : '짚자리에서 자기'; },
    list: S => { const c = C3(S); return [{ t: '「저를 기억해 주세요」', ok: !!c.rem }, { t: '떡 굽는 관원장 곁에', ok: !!c.sit }, { t: '두 사람을 위한 기도', ok: !!c.pray3 }]; },
    target: S => { const c = C3(S); return !c.rem ? 'npc:cupbearer' : !c.sit ? { x: bars3(3)[0] + 1.1, z: bars3(3)[1] } : !c.pray3 ? { x: WIN3[0], z: WIN3[1] } : { x: BED3[0], z: BED3[1] }; }, need: ['cupbearer', 'baker'],
    enter(S, G, re) { setTimeout(() => { if (G.S().step === 'c3_three') cinBirthday(S, G, () => G.go('c3_wait')); }, 0); },
    talk: { cupbearer(S, G) { const c = C3(S); if (c.rem) return false; say([N('cupbearer', '사흘이라! 나가면 제일 먼저 나일 강물에 몸을 씻고, 집에 가서 아내가 구운 떡을 먹겠네!', '', 'happy'), J('나리… 저를 꼭 기억해 주세요. 바로께 제 사정을 말씀해 주세요.', '', 'urgent'), N('cupbearer', '물론이지, 물론이지! 어찌 잊겠는가!', '', 'happy')], () => { c.rem = 1; GG.UI.quest(); }); },
      baker(S, G) { const c = C3(S); if (c.sit) return false; say([N('baker', '……', '', 'weary'), T('떡 굽는 관원장은 아무 말도 하지 않았어요. 곁에 앉아 있어 줄 수 있어요.')]); } },
    check: S => { const c = C3(S); return !!c.pray3 && S.day > (c.t3At || 1e9); }, done(S, G, next) { cinBirthday(S, G, next); }, next: 'c3_wait' }
};
steps.c3_dreams.done = (S, G, next) => cinBirthday(S, G, next); steps.c3_dreams.next = 'c3_wait'; /* (v18.72 the invented three days are gone) */
/* each night of c3_days: the new day brings the next errand */
function daysTick3(S, c) { if (!c.d3done || S.day <= (c.d3At || 0) || GG.UI.busy() || GG.Cine.on) return; if ((c.d3 || 0) === 2 && !c.patrol) return;
  c.d3 = (c.d3 || 0) + 1; c.d3done = 0; c.d3At = S.day; GG.UI.quest(); if (c.d3 >= 3) { Gm().checkStep(); return; } const D = DAYS3[c.d3]; if (D.h > 7) toTime(S, D.h, () => GG.UI.toast(D.t.split(' · ')[0] + '이 되었어요')); }

// ------------------------------------------------------------------ hooks: chains, the neighbour's voice, escorts
{ const j0 = GG.Game.jump; GG.Game.jump = function () { const S = GG.Game.S && GG.Game.S(); if (S && S.q && S.q.chain) return; return j0.apply(this, arguments); }; }
/* v18.75 the quarrel after the bread: Keti and Meru get up, come to the bars of their cells and face each other, shouting (bubbles);
   Joseph comes between them in the corridor (「다툼 말리기」). Afterwards they go back into their cells. */
const FIGHT3 = { a: [-39.1, -5.95, 0.78], b: [-37.4, -5.95, -0.78], mid: [-38.25, -4.3] }; let FQ3 = 0, FQ3t = 0, FQ3i = 0;
const FQ3L = [['prisA', '네 떡이 내 것보다 크잖아!'], ['prisB', '무슨 소리! 네 물그릇이 더 가득했어!'], ['prisA', '총무가 너만 챙겨 줬지?'], ['prisB', '눈이 어떻게 된 거 아냐, 케티?'], ['prisA', '내 떡 좀 봐라, 이게 떡이냐?'], ['prisB', '내 것도 똑같거든!']];
const fed3 = S => Object.keys(S.q.fed || {}).length >= 4;
function fightPose3(on) { const G = Gm(), s = G.S(); for (const [id, p] of [['prisA', FIGHT3.a], ['prisB', FIGHT3.b]]) { const n = G.npc(id); if (!n) continue;
    if (on) { if (Math.hypot(n.x - p[0], n.z - p[1]) > 0.7) G.npcTo(id, p[0], p[1], p[2], false); n.walk = null; n.face = n.homeFace = p[2]; n.act = 'point'; n.sit = false; }
    else { n.act = null; const home = CELL[id === 'prisA' ? 0 : 1]; G.npcWalk(id, home[0], home[1], () => { n.face = n.homeFace = 0; }, 1.2); } if (s && s.npcPos) delete s.npcPos[id]; }
  if (!on) FQ3 = 0; }
function fightTick3(dt, S) { const G = Gm(); if (qd(S, 'fight') || !fed3(S)) return;
  if (!FQ3) { FQ3 = 1; FQ3t = 2; for (const [id, p] of [['prisA', FIGHT3.a], ['prisB', FIGHT3.b]]) { const n = G.npc(id); if (!n) continue; n.sit = false; n.act = null;
      G.npcWalk(id, p[0], p[1], () => { n.face = n.homeFace = p[2]; n.act = 'point'; }, 1.6); if (S.npcPos) delete S.npcPos[id]; }
    GG.UI.toast('케티와 메루가 창살 앞에서 다투고 있어요'); GG.UI.quest(); return; }
  if (GG.UI.busy() || GG.Cine.on || (FQ3t -= dt) > 0) return; FQ3t = 3.4; if (G.dist(FIGHT3.mid[0], FIGHT3.mid[1]) > 26) return;
  const [id, t] = FQ3L[FQ3i++ % FQ3L.length]; GG.Life.bubble(id, t, 2.8); }
function ch3Tick(dt, S) { if (!S) return; try { const G = Gm();
    if (S.q.chain && !GG.Cine.on && S.outfit !== 'josephFettered') G.setOutfit('josephFettered');
    if (!/^c3_/.test(S.step || '')) return; const c = C3(S);
    if (S.step === 'c3_cell' && !c.nb && Object.keys(c.look).length >= 2 && !GG.UI.busy() && !GG.Cine.on) neighbor3(S, c);
    if (S.step === 'c3_days') daysTick3(S, c);
    if (S.step === 'c3_charge') fightTick3(dt, S);
    if (S.step === 'c3_wait') { const w = S.q.wait || 0; if (w <= 2 && !c.w['rang' + w] && !GG.UI.busy() && !GG.Cine.on) { c.w['rang' + w] = 1; G.sfx('door'); GG.UI.toast('옥 문이 열리는 소리가 났어요'); GG.UI.quest(); }
      if (w === 1 && c.w.door1 && !c.w.placed1) { c.w.placed1 = 1; place('oldP', PATCH3[0] + 1.4, PATCH3[1] + 0.6, -1.6); }
      if (c.w.going && !ESC3) { c.w.going = 0; c.w.gone = 1; S.q.oldGone = 1; G.npcShow('oldP', false); GG.UI.quest(); } /* a game loaded during the walk to the gate: he has gone */ }
    escTick(dt); } catch (e) { console.error('ch3', e); } }
function ch3Build(W, P) { try { /* v18.76 the 「손바닥만 한 창」 of Joseph's cell: a small barred window high in the back wall, where the sleep and prayer scenes look (there was only plain wall) */
    { const wy = W.heightAt(-18.2, -9.5) + 1.85; P((g, M) => { g.box(0.78, 0.66, 0.1, { m: M, at: [0, 0.33, 0], c: 0x8a6a48, j: 0 }); g.box(0.56, 0.44, 0.04, { m: M, at: [0, 0.33, 0.04], c: 0xa9c8e8, j: 0 });
      for (const bx of [-0.17, 0, 0.17]) g.box(0.045, 0.46, 0.05, { m: M, at: [bx, 0.33, 0.07], c: 0x3a2a1a, j: 0 }); g.box(0.6, 0.06, 0.08, { m: M, at: [0, 0.05, 0.06], c: 0x6a5038, j: 0 }); }, -18.2, -9.6, { y: wy, col: null }); }
    P('bales', STRAW3[0], STRAW3[1], { ry: 0.3, col: { r: 0.9, h: 1 } }); P('crops', PATCH3[0], PATCH3[1], { args: [3, 2, false] }); P('tableEg', LAMP3[0] - 0.6, LAMP3[1] - 0.8, { ry: 0.2, col: { w: 1.8, d: 0.8, h: 0.9, a: 0.2 } }); P('jugBowl', LAMP3[0] - 1, LAMP3[1] - 0.8, { dy: 0.86 }); P('oilLamp', LAMP3[0] - 0.1, LAMP3[1] - 0.7, { dy: 0.86 }); /* the jailer's table: porridge and lamps */ } catch (e) { console.error('ch3Build', e); } }
/* put the new steps in order */
{ const keys = Object.keys(steps), cut = keys.indexOf('c3_officers'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c3_days = CH3.c3_days; for (const [k, v] of tail) { steps[k] = v; if (k === 'c3_dreams') steps.c3_three = CH3.c3_three; } /* (c3_three is kept only for old saves) */
  ORDER = Object.keys(steps); }
/* v18.80 the bread round in one roll-call: the keeper's list in hand, Joseph calls each name down the corridor and they come to the bars (the water round already went cell by cell) */
const ROLL3 = [-32.75, -2.6];
{ const l0 = steps.c3_charge.list; steps.c3_charge.list = S => l0(S).map(r => /떡 나눠 주기/.test(r.t) ? Object.assign({}, r, { t: '명부를 펴고 이름 불러 떡 나눠 주기' }) : r); }
{ const o0 = steps.c3_charge.obj; steps.c3_charge.obj = S => { const r = typeof o0 === 'function' ? o0(S) : o0; return /감방마다 떡/.test(r || '') ? (Gm().P.carry === 'basket' ? '복도에서 명부를 펴고 이름 부르기' : '탁자의 떡 바구니 들기') : r; }; }
{ const t0 = steps.c3_charge.target; steps.c3_charge.target = S => { const f = Object.keys(S.q.fed || {}).length; if (C3(S).keys && f < 4 && Gm().P.carry === 'basket') return { x: ROLL3[0], z: ROLL3[1] }; return t0(S); }; }
function roll3(S, G) { const h = hAt(ROLL3[0], ROLL3[1]); G.teleport(CELL[0][0] + 0.6, -3.4, Math.PI / 2);
  cine([{ fn: () => CELL_IDS.forEach((id, i) => { const n = G.npc(id); if (n && id !== 'oldP') { n.sit = false; n.act = null; G.npcWalk(id, CELL[i][0], -5.2, () => { n.face = n.homeFace = 0; }, 1.2); } }), cam: [ROLL3[0] + 7.5, h + 2.1, -1.2], cam2: [ROLL3[0] + 6.5, h + 2, -1.4], look: [ROLL3[0] - 3, h + 1.1, -4.6], dur: 9,
    each: t => { const k = Math.floor(t / 1.8); for (let i = 0; i <= Math.min(3, k); i++) if (!(S.q.fed = S.q.fed || {})[i]) { S.q.fed[i] = 1; const P = G.P; G.teleport(CELL[i][0] + 0.4, -3.4, Math.PI); P.emote = { k: 'pick', t: 0, dur: 0.8 }; const id = CELL_IDS[i]; GG.Life.bubble(id, GIVE_T[id][1], 2.4); } },
    t: '요셉이 간수장에게 받은 명부를 펴고 이름을 하나씩 부르니, 죄수들이 창살 앞으로 나와 떡을 받았어요.' }],
    () => { S.q.fed = { 0: 1, 1: 1, 2: 1, 3: 1 }; G.P.carry = null; GG.UI.quest(); G.checkStep(); }); }
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || S.step !== 'c3_charge' || G.cineOn || GG.UI.busy() || !C3(S).keys || p.carry !== 'basket' || Object.keys(S.q.fed || {}).length >= 4) return null;
  const d = Math.hypot(ROLL3[0] - p.x, ROLL3[1] - p.z); if (d > 3.6) return null; return [{ d: d - 1.2, x: ROLL3[0], z: ROLL3[1], y: 1, story: true, noMagnet: true, key: 'c3Roll', label: '명부를 펴고 이름 부르기 · 떡 나눠 주기', use: () => roll3(S, G) }]; });
// =================================================================== v18.71 4장 다시 짜기 · 「바로의 꿈」 (e_ch4.js · 설계표_4장_v18_71.md)
/* 창 41:14–46. 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 성경에 적힌 일을 손으로 해 보는 것만 더해요.
   ① 급히(41:14): 부름 · 씻고 수염 깎기(조심조심) · 옷 갈아입기 · 사자를 따라 바로에게(말 없음)
   ② 바로 앞에서(41:15–16 · 지금) ③ 꿈(41:17–24 · 지금, 요셉의 속말 기도는 뺌) ④ 해석(41:25–32 · 지금)
   ⑤ 계획(41:33–36): 오분의 일 셈 · 지도에 표시된 세 성읍 짚기(자리는 정해져 있어요 · 5장 곳간)
   ⑥ 결정(41:37–41) · 반지와 세마포 옷과 금사슬을 하나씩 받기(41:42) · 버금 수레(41:43 · 장면) · 41:44 · 새 이름과 아스낫(41:45)
   ⑦ 혼인 잔치 · 잔치 튜토리얼(잔치 자리 · 음식 먹기 · 함께 춤추기 · 잔치 알림과 초대 편지) → 삼십 세(41:46) → 5장 */
const C4 = S => S.q.c4 || (S.q.c4 = {});
const MSG_PATH = [[-30, 16.6], [-12, 16.4], [-11, -14], [-23, -20], [-22, -60], [-24, -100], [-28, -124], [-30, -137]];
const WED = { x: -30, z: -151 };
const CITIES4 = [{ id: 'A', n: '성읍', x: SPOTS.granaryA[0], z: SPOTS.granaryA[1] }, { id: 'B', n: '서쪽 마을', x: SPOTS.granaryB[0], z: SPOTS.granaryB[1] }, { id: 'C', n: '남쪽 마을', x: SPOTS.granaryC[0], z: SPOTS.granaryC[1] }];
const WED_GUESTS = [['wg0', '궁의 신하', LOOK.official, 'sit'], ['wg1', '궁의 신하', LOOK.official, 'clap'], ['wg2', '온의 제사장', LOOK.priest, 'sit'], ['wg3', '궁의 여인', LOOK.woman, 'clap'], ['wg4', '궁의 여종', LOOK.maid, 'dance'], ['wg5', '궁의 어른', LOOK.elder, 'sit'], ['wg6', '궁의 여인', LOOK.woman, 'cheer'], ['wg7', '궁의 신하', LOOK.official, 'clap']];

// ------------------------------------------------------------------ ① in haste (41:14)
{ const sp = specials.find(q => q.id === 'shave'); if (sp) { sp.label = S => !C4(S).shaved ? '물로 씻고 수염 깎기' : '깨끗한 옷으로 갈아입기'; sp.on = S => S.step === 'c4_shave' && !(C4(S).shaved && C4(S).dressed); sp.use = (S, G) => C4(S).shaved ? dress4(S, G) : shave4(S, G); } }
function shave4(S, G) { const [bx, bz] = SPOTS.basin; G.teleport(bx + 1.2, bz, -1.57); act('gather', 1.2); G.sfx('water');
  GG.UI.minigame('balance', { title: '수염 깎기', hint: '대야 물로 얼굴을 씻었어요. 구리 칼이 흔들리지 않게 가운데를 지켜요. 서두르면 베여요.', dur: 8 }, ok => {
    if (!ok) { G.sfx('fail', { vol: 0.4 }); GG.UI.toast('앗, 살짝 베였어요 · 천천히 다시 해요'); return; }
    const h = hAt(bx, bz); cine([
      { fn: () => cpose('shave', 0, true), cam: [bx + 2.2, h + 1.6, bz - 0.6], look: [bx + 1.2, h + 1.5, bz], dur: 4.5, fov: 0.6, t: '요셉이 곧 수염을 깎고', ref: '창세기 41:14' }], () => { cpose(null); C4(S).shaved = 1; GG.UI.quest(); }); }); }
function dress4(S, G) { const [bx, bz] = SPOTS.basin, h = hAt(bx, bz);
  cine([{ fn: () => { G.setOutfit('josephShaved'); G.sfx('whoosh'); G.FX.burst(bx + 1.2, h + 1, bz, 18, { c: [1, 0.95, 0.8], sp: 1.4, up: 1.4 }); }, cam: [bx + 3.4, h + 1.5, bz + 1.4], look: [bx + 1.2, h + 1.1, bz], dur: 4.5, t: '그 옷을 갈아입고', ref: '창세기 41:14' }],
    () => { C4(S).dressed = 1; GG.UI.quest(); G.checkStep(); }); }
Object.assign(steps.c4_shave, { obj: S => { const c = C4(S); return !c.shaved ? '대야에서 씻고 수염 깎기' : '깨끗한 옷으로 갈아입기'; },
  list: S => { const c = C4(S); return [{ t: '씻고 수염 깎기', ok: !!c.shaved }, { t: '옷 갈아입기', ok: !!c.dressed }]; },
  enter(S, G, re) { if (!re) say([N('messenger', '히브리 사람 요셉! 바로께서 너를 부르신다. 서둘러라!', '', 'urgent')], () => GG.UI.toast('옥 마당 대야에서 씻고 수염을 깎아요')); },
  check: S => !!C4(S).shaved && !!C4(S).dressed, next: 'c4_go' });
{ const m = npcs.find(n => n.id === 'messenger'); if (m) m.show = S => S.step === 'c4_shave' || S.step === 'c4_go' || S.step === 'c4_court'; }

// ------------------------------------------------------------------ ⑤ the plan: one fifth, and the cities (41:34–35)
function oneFifth(S, G, then) { say([J('바로께서는 또 이같이 행하사 나라 안에 감독관들을 두어, 그 일곱 해 풍년에 애굽 땅의 오분의 일을 거두소서.', '창세기 41:34'),
    { n: '오분의 일', t: '밭에서 곡식 쉰 자루를 거두면, 다섯에 하나는 몇 자루일까? (애굽 숫자로)', choices: [{ t: '뒤꿈치뼈 하나 · 열 자루', ok: true }, { t: '막대 다섯 · 다섯 자루', ok: false, fb: '쉰을 다섯 몫으로 나누면 한 몫은…?' }, { t: '뒤꿈치뼈 다섯 · 쉰 자루', ok: false, fb: '그건 전부예요. 다섯에 하나만 거둬요.' }] },
    { n: '오분의 일', t: '곡식 백 자루라면?', choices: [{ t: '뒤꿈치뼈 둘 · 스무 자루', ok: true }, { t: '감긴 밧줄 하나 · 백 자루', ok: false, fb: '감긴 밧줄은 백, 전부예요.' }, { t: '뒤꿈치뼈 하나 · 열 자루', ok: false, fb: '백의 다섯에 하나는 열이 아니라…' }] }], then); }
{ const css = document.createElement('style'); css.textContent = `#c4map{position:fixed;inset:0;z-index:235;display:flex;align-items:center;justify-content:center;background:rgba(10,8,4,.55);touch-action:none}
#c4map .box{background:#efe0bc;border:2px solid #8a6a3a;border-radius:14px;padding:12px 14px 10px;width:min(340px,92vw);box-shadow:0 8px 30px rgba(0,0,0,.5);color:#3a2a14;text-align:center}
#c4map h4{margin:0 0 2px;font:700 17px/1.3 var(--serif,serif)}#c4map p{margin:0 0 6px;font-size:12px;opacity:.85}#c4map svg{width:100%;height:auto;display:block}
#c4map .mk{cursor:pointer}#c4map .st{font:700 15px/1.2 var(--serif,serif);margin-top:4px}`; document.head.appendChild(css); }
function cityMap(then) { const X = x => 24 + (x + 178) / 216 * 252, Y = z => 22 + (z + 212) / 378 * 370; GG.UI.setBusy('c4map', true);
  let nile = ''; for (let z = -212; z <= 166; z += 14) nile += (z === -212 ? 'M' : 'L') + X(nileX(z)).toFixed(1) + ' ' + Y(z).toFixed(1) + ' ';
  const el = document.createElement('div'); el.id = 'c4map';
  el.innerHTML = `<div class="box"><h4>각 성에 적치하게 하소서</h4><p>창세기 41:35 · 지도에 표시된 성읍 세 곳을 짚어요</p><svg viewBox="0 0 300 420"><rect x="6" y="6" width="288" height="408" rx="10" fill="#e6d2a4" stroke="#b8945a"/>
    <path d="${nile}" fill="none" stroke="#4a86b8" stroke-width="7" stroke-linecap="round" opacity=".8"/><circle cx="${X(-30)}" cy="${Y(-170)}" r="7" fill="#8a3a2a"/><text x="${X(-30) + 10}" y="${Y(-170) + 4}" font-size="12" fill="#5a2a1a">바로의 궁</text>
    ${CITIES4.map(c => `<g class="mk" data-id="${c.id}"><circle cx="${X(c.x)}" cy="${Y(c.z)}" r="15" fill="#f8e6a8" stroke="#c89a2a" stroke-width="3"><animate attributeName="r" values="13;17;13" dur="1.4s" repeatCount="indefinite"/></circle><text x="${X(c.x)}" y="${Y(c.z) + 30}" font-size="12" text-anchor="middle" fill="#3a2a14">${c.n}</text></g>`).join('')}</svg><div class="st">0 / 3</div></div>`;
  document.body.appendChild(el); const got = {};
  el.querySelectorAll('.mk').forEach(g => { const hit = e => { e && e.preventDefault && e.preventDefault(); const id = g.dataset.id; if (got[id]) return; got[id] = 1; const c = g.querySelector('circle'); c.setAttribute('fill', '#e8b830'); const an = c.querySelector('animate'); an && an.remove(); GG.Audio && GG.Audio.sfx('blip', { pitch: 1.2 });
      const n = Object.keys(got).length; el.querySelector('.st').textContent = `${n} / 3`; if (n >= 3) setTimeout(() => { el.remove(); GG.UI.setBusy('c4map', false); then && then(); }, 700); };
    g.addEventListener('pointerdown', hit); g._hit = hit; }); }

// ------------------------------------------------------------------ ②–⑥ the court: the old answer scene, kept to the words of Scripture
VIS_T.nile[1] = { t: '바로의 말을 따라 꿈속 나일 강가를 걸어요. 빛나는 곳마다 바로가 본 것이 나타나요.' }; /* (the line of Joseph's own prayer is not in Scripture) */
function answerScene(S, G) {
  stage(S, G); G.P.face = Math.PI;
  say([N('pharaoh', '내가 그 꿈을 술객에게 말하였으나 그것을 내게 보이는 자가 없느니라.', '창세기 41:24'), J('바로의 꿈은 하나이라. 하나님이 그 하실 일을 바로에게 보이심이니이다.', '창세기 41:25', 'solemn')], () =>
  GG.UI.puzzle({ title: '바로의 꿈 해석', hint: '꿈속 장면(왼쪽)을 고르고, 하나님이 보이신 뜻(오른쪽)을 찾아 짝지으세요',
    syms: [{ id: 'fat', t: '일곱 살진 암소', m: 'y7', h: '살지고 좋은 것은 좋은 해를 뜻해요. 일곱은…?' }, { id: 'good', t: '충실한 일곱 이삭', m: 'y7', h: '무성한 이삭은 풍성한 해예요.' },
      { id: 'thin', t: '파리하고 흉한 일곱 암소', m: 'f7', h: '살진 소를 먹고도 여전히 흉한 소… 무엇이 풍년을 삼킬까요?' }, { id: 'blight', t: '동풍에 마른 일곱 이삭', m: 'f7', h: '마른 이삭은 굶주림의 해예요.' },
      { id: 'twice', t: '꿈을 두 번 겹쳐 꾸심', m: 'sure', h: '같은 뜻을 두 번 보이신 것은…' }],
    means: [{ id: 'y7', t: '온 애굽 땅에 일곱 해 큰 풍년' }, { id: 'f7', t: '뒤이어 일곱 해 흉년' }, { id: 'sure', t: '하나님이 이 일을 정하셨고 속히 행하시리라' }] }, () => say([
    J('일곱 좋은 암소는 일곱해요, 일곱 좋은 이삭도 일곱해니, 그 꿈은 하나이라.', '창세기 41:26'),
    J('온 애굽 땅에 일곱해 큰 풍년이 있겠고, 후에 일곱해 흉년이 들므로 애굽 땅에 있던 풍년을 다 잊어버리게 되고, 이 땅이 기근으로 멸망되리니', '창세기 41:29–30', 'solemn'),
    J('바로께서 꿈을 두번 겹쳐 꾸신 것은, 하나님이 이 일을 정하셨음이라. 속히 행하시리니', '창세기 41:32', 'solemn'),
    { n: '요셉', t: '그렇다면 바로께 무엇을 아뢸까?', choices: [
      { t: '"명철하고 지혜 있는 사람을 택하여 애굽 땅을 치리하게 하시고, 그 일곱해 풍년에 애굽 땅의 오분의 일을 거두어 흉년을 예비하소서."', ok: true, ref: '창세기 41:33–36' },
      { t: '"지금 실컷 먹고 즐기소서. 흉년은 그때 가서 걱정하면 됩니다."', ok: false, fb: '하나님이 미리 보이신 것은 준비하라는 뜻이었어요.' },
      { t: '"신들께 제물을 더 바치소서."', ok: false, fb: '요셉은 하나님이 보이신 길을 그대로 전했습니다. 거두고, 쌓고, 나누는 길을.' }] },
    J('이제 바로께서는 명철하고 지혜 있는 사람을 택하여 애굽 땅을 치리하게 하소서.', '창세기 41:33')],
  () => oneFifth(S, G, () => say([J('그들로 장차 올 풍년의 모든 곡물을 거두고 그 곡물을 바로의 손에 돌려 양식을 위하여 각 성에 적치하게 하소서.', '창세기 41:35')], () => cityMap(() => say([
    J('이와 같이 그 곡물을 이 땅에 저장하여 애굽 땅에 임할 일곱해 흉년을 예비하시면, 땅이 이 흉년을 인하여 멸망치 아니하리이다.', '창세기 41:36'),
    T('바로와 그 모든 신하가 이 일을 좋게 여긴지라.', '창세기 41:37'),
    N('pharaoh', '이와 같이 하나님의 신이 감동한 사람을 우리가 어찌 얻을 수 있으리요.', '창세기 41:38', 'awe'),
    N('pharaoh', '하나님이 이 모든 것을 네게 보이셨으니 너와 같이 명철하고 지혜 있는 자가 없도다. 너는 내 집을 치리하라. 내 백성이 다 네 명을 복종하리니, 나는 너보다 높음이 보좌 뿐이니라.', '창세기 41:39–40', 'solemn')],
    () => G.go('c4_robe'))))))));
}

// ------------------------------------------------------------------ ⑥ the ring, the linen, the gold chain (41:42) · the second chariot (41:43)
const ROBE4 = [['ring', '손을 내밀어 인장 반지 받기', '바로가 자기의 인장 반지를 빼어 요셉의 손에 끼우고'], ['linen', '세마포 옷 받아 입기', '그에게 세마포 옷을 입히고'], ['chain', '고개 숙여 금사슬 받기', '금 사슬을 목에 걸고']];
function robe4(S, G, k) { const c = C4(S), P = G.P, h = hAt(P.x, P.z), f = P.face, [, , text] = ROBE4.find(r => r[0] === k);
  cine([{ fn: () => { if (k === 'ring') P.emote = { k: 'present', t: 0, dur: 2 }; if (k === 'linen') G.setOutfit('josephVizier'); if (k === 'chain') { P.emote = { k: 'bow', t: 0, dur: 2 }; G.FX.burst(P.x, h + 1.4, P.z, 24, { c: [1, 0.85, 0.4], sp: 1.6, up: 1.4 }); } GG.Audio && GG.Audio.sfx('insight', { pitch: k === 'ring' ? 0.84 : k === 'linen' ? 1.0 : 1.25, vol: 0.7 }); },
    cam: [P.x + Math.sin(f) * 1.6 + Math.cos(f) * 0.6, h + 1.5, P.z + Math.cos(f) * 1.6 - Math.sin(f) * 0.6], look: [P.x, h + (k === 'ring' ? 1.0 : 1.3), P.z], dur: 4.5, fov: 0.55, t: text, ref: '창세기 41:42' }], () => { c[k] = 1; GG.UI.quest(); G.checkStep(); }); }
function cinParade4(S, G, next) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  const road = [[-29, -138], [-28, -124], [-24, -100], [-22, -80], [-22, -66]];
  const along = k => { const n = road.length - 1, f = clamp(k, 0, 0.999) * n, i = Math.floor(f), u = f - i; return [lerp(road[i][0], road[i + 1][0], u), lerp(road[i][1], road[i + 1][1], u), Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1])]; };
  cine([
    { fn: () => { S.q.parade = 1; S.q.riding = 1; S.q.chariotOk = 1; const [x, z, f] = along(0); G.teleport(x, z, f); crowdLine(G, road, true); }, music: 'j_triumph',
      cam: t => { const [x, z] = along(t / 16); return [x + 6, hAt(x, z) + 3, z + 4]; }, look: t => { const [x, z] = along(t / 16); return [x, hAt(x, z) + 1.4, z]; }, dur: 9, sfx: 'cheerC',
      each: t => { const [x, z, f] = along(t / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; },
      t: '자기에게 있는 버금 수레에 그를 태우매, 무리가 그 앞에서 소리 지르기를 「엎드리라」 하더라.', ref: '창세기 41:43' },
    { cam: t => { const [x, z] = along((t + 9) / 16); return [x - 5, hAt(x, z) + 1.8, z + 7]; }, look: t => { const [x, z] = along((t + 9) / 16); return [x, hAt(x, z) + 1.6, z]; }, dur: 7, sfx: 'cheerC',
      each: t => { const [x, z, f] = along((t + 9) / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; }, t: '아브렉! 아브렉!', n: '애굽 백성', e: 'shout', ref: '창세기 41:43' },
    { cam: [-14, hAt(-22, -66) + 6, -56], cam2: [-8, hAt(-22, -66) + 14, -48], look: [-22, hAt(-22, -66) + 1.4, -66], dur: 7, t: '바로가 그로 애굽 전국을 총리하게 하였더라.', ref: '창세기 41:43', fadeOut: 1.4 },
    { fn: () => { S.q.parade = 0; S.q.riding = 0; crowdLine(G, road, false); G.teleport(cx, cz, Math.PI); place('pharaoh', px, pz, 0, { sit: true }); }, fadeIn: 1.2, music: 'j_court',
      cam: [px + 2, ph + 0.8, pz + 4.2], look: [px, ph + 1.3, pz], dur: 7, n: '바로', t: '나는 바로라. 애굽 온 땅에서 너의 허락이 없이는 수족을 놀릴 자가 없으리라.', ref: '창세기 41:44', e: 'solemn' },
    { cam: [cx - 3, chh + 2.2, cz + 3], look: [cx, chh + 1.3, cz - 2], dur: 9, t: '바로가 요셉의 이름을 사브낫바네아라 하고, 또 온 제사장 보디베라의 딸 아스낫을 그에게 주어 아내를 삼게 하니라.', ref: '창세기 41:45' },
  ], () => { GG.Game.musicOverride = null; next(); });
}

// ------------------------------------------------------------------ ⑦ the wedding feast: the feast tutorial (the village feast's own table, food and dance)
const ateW = S => (S.flags.feastAte || -1) === S.day, dancedW = S => !!C4(S).danced;
function wedStart(S, G, re) { const c = C4(S);
  const setUp = () => { if (S.time < 17.6) S.time = 17.6; G.teleport(WED.x, WED.z + 7, Math.PI); G.setOutfit('josephVizier');
    GG.Feast && GG.Feast.stage({ x: WED.x, z: WED.z, v: { id: 'royalWed', n: '잔치 자리', folk: WED_GUESTS.map(([id]) => ({ id })) } });
    WED_GUESTS.forEach(([id, name, look, mode], i) => { const a = (i / WED_GUESTS.length) * Math.PI * 2 + 0.3, r = i % 2 ? 4.6 : 3.4, x = WED.x + Math.cos(a) * r, z = WED.z + Math.sin(a) * r;
      if (!G.npc(id)) G.spawnNPC({ id, name, look, x, z, face: Math.atan2(WED.x - x, WED.z - z), noTalk: true, noTag: true, act: mode === 'sit' ? null : mode }); if (mode === 'sit') place(id, x, z, Math.atan2(WED.x - x, WED.z - z), { sit: true }); });
    if (!G.npc('potipherah')) G.spawnNPC({ id: 'potipherah', name: '온의 제사장 보디베라', look: LOOK.priest, x: WED.x + 2.2, z: WED.z - 2.4, face: 0, noTalk: true });
    place('potipherah', WED.x + 2.2, WED.z - 2.4, 0, { sit: true }); place('asenath', WED.x - 2.2, WED.z - 2.4, 0, { sit: true }); };
  if (re) { setUp(); return; }
  fade(setUp, () => { GG.Game.musicOverride = 'j_plenty'; narr([{ kick: '창세기 41:45', title: '혼인 잔치', t: '바로가 온 제사장 보디베라의 딸 아스낫을 요셉에게 주어 아내를 삼게 하였습니다. 궁 뜰에 잔치 상이 차려졌어요.', ref: '창세기 41:45' },
    { kick: '잔치 배우기 · 1', title: '잔치 자리', t: '잔치는 해 질 녘에 열리고, 상 둘레에 사람들이 모여요. 상 앞으로 가서 「잔치 음식 먹기」를 해 보세요.', ref: '' }], () => { c.wedIn = 1; GG.UI.quest(); }); }); }
function wedEnd(S, G, next) { const c = C4(S);
  cine([{ cam: [WED.x + 8, hAt(WED.x, WED.z) + 4, WED.z + 10], cam2: [WED.x + 6, hAt(WED.x, WED.z) + 6, WED.z + 8], look: [WED.x, hAt(WED.x, WED.z) + 1, WED.z], dur: 7, t: '요셉이 애굽 왕 바로 앞에 설 때에 삼십 세라.', ref: '창세기 41:46', fadeOut: 1.6 }, /* (「애굽 온 땅을 순찰하니」는 5장 첫머리에 나와요) */
    { black: true, title: '5장 · 일곱 해 풍년', sub: '창세기 41:46–52', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4, fn: () => { GG.Feast && GG.Feast.stage(null); WED_GUESTS.forEach(([id]) => { if (G.npc(id)) G.removeNPC(id); }); if (G.npc('potipherah')) G.removeNPC('potipherah'); } }],
    () => { S.q.chariotOk = 1; S.q.riding = 0; S.q.needCart = 1; S.q.cartAt = { x: -20.6, z: -25.6, f: Math.PI }; G.teleport(-25, -29.5, 1.2); GG.Game.musicOverride = null; c.wedDone = 1; next(); }); }
{ const a = npcs.find(n => n.id === 'asenath'); if (a) { const s0 = a.show; a.show = S => S.step === 'c4_wedding' || s0(S); } }

// ------------------------------------------------------------------ the new steps
const CH4 = {
  c4_go: { ch: 5, obj: '바로의 사자를 따라 궁으로', target: 'npc:messenger', need: ['messenger'],
    enter(S, G, re) { const c = C4(S); if (re) { G.teleport(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 2, Math.PI); c.atGate = 1; return; } place('messenger', -30, 12.6, Math.PI); escort('messenger', MSG_PATH, () => { c.atGate = 1; G.checkStep(); }, 1.9, '서둘러라!'); },
    check: S => !!C4(S).atGate, done(S, G, next) { GG.Game.musicOverride = 'j_court'; next(); }, next: 'c4_court' },
  c4_robe: { ch: 5, obj: S => { const c = C4(S), r = ROBE4.find(q => !c[q[0]]); return r ? r[1] : '바로 앞에서'; },
    list: S => { const c = C4(S); return [{ t: '인장 반지', ok: !!c.ring }, { t: '세마포 옷', ok: !!c.linen }, { t: '금사슬', ok: !!c.chain }]; },
    target: () => ({ x: SPOTS.court[0], z: SPOTS.court[1] }), need: ['pharaoh'],
    enter(S, G, re) { stage(S, G); if (!re) say([N('pharaoh', '내가 너로 애굽 온 땅을 총리하게 하노라.', '창세기 41:41', 'solemn')]); },
    check: S => { const c = C4(S); return !!(c.ring && c.linen && c.chain); }, done(S, G, next) { cinParade4(S, G, next); }, next: 'c4_wedding' },
  c4_wedding: { ch: 5, obj: S => { const c = C4(S); return !c.wedIn ? '혼인 잔치' : !ateW(S) ? '잔치 음식 먹기' : !dancedW(S) ? '마당 가운데에서 함께 춤추기' : '잔치 알림과 초대 편지'; },
    list: S => [{ t: '잔치 음식 먹기', ok: ateW(S) }, { t: '함께 춤추기', ok: dancedW(S) }, { t: '잔치 알림과 초대 편지', ok: !!C4(S).told }],
    target: () => ({ x: WED.x, z: WED.z }), need: ['asenath'],
    enter(S, G, re) { wedStart(S, G, re); },
    check: S => ateW(S) && dancedW(S) && !!C4(S).told, done(S, G, next) { wedEnd(S, G, next); }, next: 'c5_patrol' }
};
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || S.step !== 'c4_robe') return null; const c = C4(S), r = ROBE4.find(q => !c[q[0]]); if (!r) return null;
  const [x, z] = SPOTS.court, d = Math.hypot(p.x - x, p.z - z); if (d > 4.5) return null; return [{ d: d - 0.8, x: p.x, z: p.z, y: 1.2, story: true, noMagnet: true, key: 'c4Robe', label: r[1], use: () => robe4(S, G, r[0]) }]; });
function ch4Tick(dt, S) { if (!S || !/^c4_/.test(S.step || '')) return; try { const G = Gm(), c = C4(S);
    if (S.step === 'c4_go') escTick(dt);
    if ((S.step === 'c4_robe' && c.linen) || S.step === 'c4_wedding') { if (!GG.Cine.on && S.outfit !== 'josephVizier') G.setOutfit('josephVizier'); }
    if (S.step === 'c4_wedding' && c.wedIn && !GG.UI.busy() && !GG.Cine.on) {
      if (ateW(S) && !c.t2) { c.t2 = 1; GG.UI.quest(); narr([{ kick: '잔치 배우기 · 2', title: '함께 춤추기', t: '잔치 음식을 먹으면 체력 · 기력 · 정신력이 차고, 함께한 사람들과 조금씩 가까워져요(잔치마다 한 번). 이번엔 마당 가운데에서 「함께 춤추기」! 북소리에 맞춰 화면(또는 A)을 톡 눌러요.', ref: '' }]); }
      if (!c.danced && GG.Feast && GG.Feast.lastDance === S.day) { c.danced = 1; GG.UI.quest(); }
      if (c.danced && !c.told) { c.told = 1; narr([{ kick: '잔치 배우기 · 3', title: '잔치 알림과 초대 편지', t: '앞으로 애굽의 마을마다 잔치가 열려요(거둠 잔치 · 아기 이름 짓는 날 · 집들이 · 나일 강 새해 맞이 …). 그날 아침 「오늘 저녁 ○○ 마을에서 잔치!」 알림이 뜨고, 친한 사람은 전날 초대 편지를 보내요.', ref: '' }], () => { GG.UI.quest(); G.checkStep(); }); } } } catch (e) { console.error('ch4', e); } }
/* put the new steps in order (c4_answer now ends in c4_robe; the old cinInvest is no longer used) */
{ const keys = Object.keys(steps), cut = keys.indexOf('c4_shave'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c4_go = CH4.c4_go; for (const [k, v] of tail) { steps[k] = v; if (k === 'c4_answer') { steps.c4_robe = CH4.c4_robe; steps.c4_wedding = CH4.c4_wedding; } }
  ORDER = Object.keys(steps); }
// =================================================================== v18.77 5장 다시 짜기 · 「일곱 해 풍년」 (e_ch5.js · 설계표_5장_v18_74.md)
/* 창 41:46–54. 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 요셉의 말은 성경 말씀만(41:34–36 · 41:51–52).
   ① 순찰(41:46): 버금 수레 배우기 · 세 마을 돌며 설득하기(요셉의 말은 바로 앞에서 아뢴 41:34–36) · 곳간 터 재기
   ② 풍년 첫해(41:47): 왕실 밭 두 이랑 · 쟁기질 → 씨 뿌리기 → 나흘 기다림 → 거두기 → 단 묶기 → 타작 → 키질(오후 바람) → 자루 → 오분의 일(41:34)
   ③ 성읍 곳간(41:48 「각 성에 저장하되」): 터 다지기 → 기초 돌 → 벽돌(사흘 말리기) → 벽 다섯 켜(하루 한 켜) → 문 → 둥근 지붕 → 회칠 → 첫 곡식
      · 기다리는 동안 곁이야기를 할 수 있어요(game.js CALM) · 서쪽 · 남쪽 곳간은 장면으로
   ④ 므낫세(41:50–51) ⑤ 해마다 쌓기: 둘째 해 거둔 곡식을 수레로 서쪽 · 남쪽 곳간에 ⑥ 에브라임(41:52) ⑦ 세기를 그침(41:49) ⑧ 풍년이 그침(41:53–54) */
const C5 = S => S.q.c5 || (S.q.c5 = {});
const FIELD5 = 'royal', ROWS5 = [0, 1];
const THRESH5 = [-61.5, -151], STONE5 = [24.5, -58.5], BRICK5 = [-41.5, -113.5];
const GR5 = id => sites.find(s => s.id === id);
const field5 = () => fields.find(f => f.id === FIELD5);
const rowPos5 = j => { const F = field5(); return [F.x, F.z + (j - (F.rows - 1) / 2) * F.ts]; };
const rowIds5 = j => { const F = field5(), out = []; for (let i = 0; i < F.cols; i++) out.push(FIELD5 + ':' + i + ',' + j); return out; };
const plots5 = () => ROWS5.flatMap(rowIds5);
const ripe5 = S => plots5().filter(k => { const p = S.plots[k]; return p && p.s === 2 && p.c === 'wheat' && p.st >= 3; }).length;
const growing5 = S => plots5().filter(k => { const p = S.plots[k]; return p && p.s === 2 && p.c === 'wheat'; }).length;
const MG5 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const hr5 = S => S.time % 24;
const sinceDay = (S, d) => S.day > (d === undefined ? -1 : d);

// ------------------------------------------------------------------ ① 순찰 · 세 마을 설득 · 곳간 터 재기 (41:46)
const SITE5 = [['A', 'granA', '성읍'], ['B', 'granB', '서쪽 마을'], ['C', 'granC', '남쪽 마을']];
Object.assign(steps.c5_patrol, {
  list: S => { const c = C5(S), m = c.meas || {}; return [{ t: '수레지기 호리에게 버금 수레 받기', ok: !S.q.needCart }, { t: '버금 수레 타기', ok: qd(S, 'rode') }]
    .concat(S.q.cartTut ? [{ t: '전진을 두 번 눌러 보통 걸음으로 가기', ok: qd(S, 'tG2') }, { t: '가다가 「정지」로 수레 세우기', ok: qd(S, 'tStop') }, { t: '서기 카이를 옆자리에 태우기', ok: qd(S, 'tPax') }] : [])
    .concat([{ t: '성읍 감독관 만나기', ok: qd(S, 'metC') }, { t: '성읍 곳간 터 재기', ok: !!m.A }, { t: '서쪽 마을 촌장 설득하기 (북쪽 나루 건너)', ok: qd(S, 'metW') }, { t: '서쪽 곳간 터 재기', ok: !!m.B },
      { t: '남쪽 마을 촌장 설득하기 (남쪽 나루 건너)', ok: qd(S, 'metS') }, { t: '남쪽 곳간 터 재기', ok: !!m.C }]); },
  target: S => { const c = C5(S), m = c.meas || {}; if (S.q.needCart) return 'npc:cartMan'; if (!qd(S, 'rode') && GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos()) return GG.Cart.rearPos();
    if (S.q.cartTut && qd(S, 'tStop') && !qd(S, 'tPax')) return 'npc:kaiClerk'; if (!qd(S, 'metC')) return 'npc:overseerC'; const g = id => { const s = GR5(id); return { x: s.x, z: s.z }; };
    if (!m.A) return g('granA'); if (!qd(S, 'metW')) return 'npc:overseerW'; if (!m.B) return g('granB'); if (!qd(S, 'metS')) return 'npc:overseerS'; if (!m.C) return g('granC'); return null; },
  check: S => { const m = C5(S).meas || {}; return qd(S, 'rode') && qd(S, 'metC') && qd(S, 'metW') && qd(S, 'metS') && !!(m.A && m.B && m.C); },
  done(S, G, next) { narr([{ kick: '창세기 41:47', title: '풍년 첫해', t: '칠 년 풍년에 토지 소산이 심히 많은지라. 왕실 밭의 검은 흙이 나일 물을 머금고 기다리고 있어요.', ref: '창세기 41:47' }], next); }, next: 'c5_farm' });
Object.assign(steps.c5_patrol.talk, {
  /* the wagon master teaches (no 「shall I learn?」 answer of Joseph's) */
  cartMan(S, G) { if (!S.q.needCart) return false; say([N('cartMan', '총리님! 바로께서 내리신 버금 수레입니다.', '창세기 41:43'), N('cartMan', '말은 제가 길들여 놓았습니다. 곡식 표본 자루도 짐칸에 실어 두었으니 서쪽 촌장에게 전해 주십시오.'),
    N('cartMan', '수레 뒤에서 A키로 오르십시오. 왼쪽 스틱은 핸들입니다. 전진을 한 번 누르면 걷고, 두 번 누르면 보통 걸음, 세 번부터는 달리지만 말이 지칩니다.'),
    N('cartMan', '「정지」로 세우고, 사람 곁에 서서 「태우기」로 옆자리에 태울 수 있어요. 서기 카이가 성읍 감독관에게 갈 일이 있으니 태워 주십시오.')], () => { S.q.cartTut = 1; S.q.needCart = 0; S.cartStore = S.cartStore || {}; S.cartStore.qSample = 1; G.UI.quest(); }); },
  overseerC(S, G) { if (S.q.metC) return false; const pax = qd(S, 'tPax');
    say([N('overseerC', '총리님! 바로께서 명하신 대로 성읍 동쪽에 곳간 터를 닦아 두었습니다. 말뚝과 줄도 쳐 두었지요.'), N('overseerC', '벽돌은 벽돌 굽는 우니의 벽돌터에서 굽습니다. 터를 한번 재어 보시지요.')]
      .concat(pax ? [N('kaiClerk', '감독관님, 곳간에 들어오는 곡식은 제가 날마다 장부에 적겠습니다.'), N('overseerC', '서기 카이까지 오셨군요! 장부가 있으면 한 톨도 새지 않겠습니다.', '', 'happy'), N('kaiClerk', '총리님, 여기까지 태워 주셔서 감사합니다. 걸어왔으면 해가 졌을 거예요.', '', 'happy')] : []),
      () => { tick(S, 'metC'); if (pax && GG.Cart && GG.Cart.kaiOff) GG.Cart.kaiOff(); }); },
  /* v18.77 the villages are persuaded with Joseph's own words before Pharaoh (41:34–36) — the only words of his here */
  overseerW(S, G) { if (S.q.metW) return false;
    const inBag = G.inv('qSample') > 0, inCart = !!(S.cartStore && S.cartStore.qSample), inBox = !inBag && !inCart && Object.keys(S).some(k => (k === 'store' || /^horseBox_/.test(k)) && S[k] && S[k].qSample > 0);
    if (inBox || (!inBag && inCart)) { say([N('overseerW', '총리님, 바로께서 곡식 표본을 보내신다 들었습니다. 우리 마을 곡식과 견주어 보고 싶은데요.'), T(inBox ? '곡식 표본 자루를 다른 곳에 맡겨 두었어요. 가져와서 다시 와요.' : '곡식 표본 자루는 수레 짐칸에 있어요. 꺼내서 다시 말을 걸어요.')], () => { S.q.sampleAsk = inBox ? 2 : 1; G.UI.quest(); if (!inBox && GG.UI.help) setTimeout(() => GG.UI.help('cartBox', '짐칸에서 꺼내기', '수레 뒤에 서면 뜨는 「짐칸」 단추를 누르거나, 수레 위에서 「짐칸」 단추를 눌러요 · 곡식 표본 자루를 눌러 가방에 넣고 촌장에게 다시 말을 걸어요'), 300); }); return; }
    say([N('overseerW', '오분의 일이라니요, 총리님! 풍년에 곡식을 왜 쌓아 둡니까? 지금 팔면 다 금이 될 텐데!', '', 'angry'),
      { n: '', t: '요셉은 바로 앞에서 아뢴 말을 촌장에게 들려주었어요. 무엇이라 했을까요?', choices: [
        { t: '「그 양식으로 이 땅이 칠 년 흉년을 예비함이 되리니 땅이 이 흉년으로 인하여 멸망치 아니하리이다」', ok: true },
        { t: '「바로의 명이니 따르지 않으면 벌을 받으리라」', ok: false, fb: '요셉이 바로 앞에서 한 말은 겁을 주는 말이 아니었어요. 흉년을 예비하자는 말이었어요(창 41:36).' },
        { t: '「곡식을 쌓아 두면 값이 오르리라」', ok: false, fb: '요셉의 계획은 돈벌이가 아니었어요. 흉년에 땅이 망하지 않게 하는 것이었어요(창 41:36).' }] },
      J('그 양식으로 이 땅이 칠 년 흉년을 예비함이 되리니 땅이 이 흉년으로 인하여 멸망치 아니하리이다.', '창세기 41:36'),
      N('overseerW', '…칠 년 흉년이라. 제 손녀가 이제 막 걸음마를 뗐습니다. 알겠습니다, 총리님. 서쪽 마을은 오분의 일을 바치겠습니다.', '', 'tender'), T('요셉은 곡식 표본 자루를 촌장에게 건넸어요.')],
      () => { if (G.inv('qSample') > 0) G.take('qSample', 1); else if (S.cartStore && S.cartStore.qSample) delete S.cartStore.qSample; S.q.sampleAsk = 0; GG.UI.pop && GG.UI.pop('곡식 표본을 전했어요', '퀘스트 물건', 'sack'); tick(S, 'metW'); }); },
  overseerS(S, G) { if (S.q.metS) return false;
    say([N('overseerS', '총리님, 저희 마을도 따르겠습니다. 다만… 해마다 거둔 것을 바치면 우리 아이들은 무엇을 먹습니까?', '', 'sad'),
      { n: '', t: '요셉은 바로 앞에서 아뢴 말을 들려주었어요. 무엇이라 했을까요?', choices: [
        { t: '「그 칠 년 풍년에 애굽 땅의 오분 일을 거두되」', ok: true },
        { t: '「거둔 것을 모두 바치라」', ok: false, fb: '요셉이 바로 앞에서 말한 것은 오분의 일이었어요(창 41:34).' },
        { t: '「바치지 않아도 되리라」', ok: false, fb: '오분의 일은 거두어 각 성에 쌓아 두어야 했어요(창 41:34–35).' }] },
      J('바로께서는 이같이 행하사 국중에 감독관들을 두어 그 칠 년 풍년에 애굽 땅의 오분 일을 거두되', '창세기 41:34'),
      N('overseerS', '다섯에 하나라면… 넷은 우리 몫이군요! 곳간 터는 마을 서쪽 언덕 위라 들었습니다. 거기라면 강물이 넘쳐도 물 한 방울 들지 않겠지요.', '', 'happy')], () => tick(S, 'metS')); } });

// ------------------------------------------------------------------ ② 풍년 첫해 · 왕실 밭 한 바퀴 (41:47–48 · 41:34)
const CH5 = {};
CH5.c5_farm = { ch: 6, obj: S => farmObj5(S), list: S => { const c = C5(S), r = ripe5(S), g = growing5(S); return [
    { t: '소와 쟁기로 이랑 갈기 (' + Math.min(2, c.plow || 0) + '/2)', ok: (c.plow || 0) >= 2 }, { t: '밀 씨 뿌리기 (' + Math.min(2, c.sow || 0) + '/2)', ok: (c.sow || 0) >= 2 },
    { t: '밀이 자라기를 기다리기 · 나흘', ok: !!c.harvest || (g > 0 && r === g) }, { t: '낫으로 밀 거두기 · 네 칸 (나머지는 일꾼들과)' + ((c.sow || 0) >= 2 && !c.harvest && g ? ` (${Math.min(4, plots5().length - g)}/4)` : ''), ok: !!c.harvest },
    { t: '거둔 밀 단 묶기', ok: !!c.bind }, { t: '타작마당 · 소가 밟아 이삭 떨기', ok: !!c.thresh }, { t: '키질하기 (바람 부는 오후)', ok: !!c.winnow }, { t: '자루에 담기', ok: !!c.bag }, { t: '서기 카이와 오분의 일 나누기', ok: !!c.fifth }]; },
  enter(S, G, re) { G.unlock(FIELD5); (S.irrigated = S.irrigated || {})[FIELD5] = 1; if (!G.tool('sickle')) G.giveTool('sickle');
    if (!re) narr([{ kick: '풍년 첫해 · 왕실 밭', title: '한 해 농사', t: '나일 물이 물러간 왕실 밭에 검은 흙이 드러났어요. 일꾼들과 함께 이랑을 갈고, 씨를 뿌리고, 거두어 곳간 몫을 떼어 놓아요. 밀이 자라는 동안에는 곁이야기를 하러 다녀와도 돼요.', ref: '' }]); },
  target: S => { const c = C5(S); if ((c.plow || 0) < 2) { const [x, z] = rowPos5(ROWS5[c.plow || 0]); return { x, z }; } if ((c.sow || 0) < 2) { const [x, z] = rowPos5(ROWS5[c.sow || 0]); return { x, z }; }
    if (!c.harvest) { const [x, z] = rowPos5(0.5); return { x, z }; } if (!c.bind) { const [x, z] = rowPos5(0.5); return { x, z }; } if (!c.fifth && c.bag) return 'npc:kaiClerk'; return { x: THRESH5[0], z: THRESH5[1] }; },
  check: S => !!C5(S).fifth,
  done(S, G, next) { narr([{ kick: '창세기 41:48', title: '각 성에 저장하되', t: '요셉이 애굽 땅에 있는 그 칠 년 곡물을 거두어 각 성에 저장하되, 각 성 주위의 밭의 곡물을 그 성 중에 쌓으매. 이제 성읍 곳간을 지어요.', ref: '창세기 41:48' }], next); }, next: 'c5_build',
  talk: { kaiClerk(S, G) { const c = C5(S); if (!c.bag || c.fifth) return false;
    say([N('kaiClerk', '총리님, 열 자루가 나왔습니다. 바로께 드릴 오분의 일은 몇 자루입니까?'),
      { n: '', t: '열 자루의 오분의 일은? (4장에서 배운 애굽 숫자: │ 하나 · ∩ 열)', choices: [{ t: '││ (두 자루)', ok: true }, { t: '│││││ (다섯 자루)', ok: false, fb: '다섯 자루는 절반이에요. 다섯 자루마다 한 자루씩이니, 열 자루라면 두 자루예요.' }, { t: '∩ (열 자루)', ok: false, fb: '그러면 밭 임자 몫이 하나도 없어요. 다섯에 하나씩이에요.' }] },
      N('kaiClerk', '두 자루는 곳간 몫, 여덟 자루는 밭 임자 몫. 장부에 적었습니다.', '', 'happy'), T('곳간이 서기 전까지, 곳간 몫 두 자루는 성읍 창고에 맡겨 두었어요.')], () => { c.fifth = 1; GG.UI.quest(); G.checkStep(); }); } } };
function farmObj5(S) { const c = C5(S), r = ripe5(S), g = growing5(S);
  if ((c.plow || 0) < 2) return '왕실 밭 · 소와 쟁기로 이랑 갈기'; if ((c.sow || 0) < 2) return '왕실 밭 · 밀 씨 뿌리기';
  if (!c.harvest && g && r < g) { const left = Math.max(1, 4 - (S.day - (c.sowDay || S.day))); return `밀이 자라기를 기다리기 · ${left}일쯤 (곁이야기를 해도 돼요)`; }
  if (!c.harvest) return '낫으로 밀 거두기 (낫을 손에 들고 밭에서 A)'; if (!c.bind) return '거둔 밀 단 묶기'; if (!c.thresh) return '타작마당 · 소가 밟아 이삭 떨기';
  if (!c.winnow) return hr5(S) >= 13 && hr5(S) < 18.5 ? '키질하기 · 바람이 불어요' : '키질하기 · 바람이 부는 오후(1시~6시)까지 기다리기'; if (!c.bag) return '자루에 담기'; return '서기 카이와 오분의 일 나누기'; }
let OX5 = 0;
function ox5(on, x, z) { const G = Gm(); if (on) { if (!G.npc('ox5')) G.spawnNPC({ id: 'ox5', name: '황소', animal: 'cow', x, z, face: Math.PI / 2, noTalk: true, noTag: true, noBond: true }); else G.npcTo('ox5', x, z, Math.PI / 2, false); OX5 = 1; }
  else if (G.npc('ox5')) { G.removeNPC('ox5'); OX5 = 0; } }
function plow5(S, G, j) { const c = C5(S), F = field5(), [x, z] = rowPos5(j), x0 = F.x - F.cols * F.ts / 2 - 1.2, x1 = F.x + F.cols * F.ts / 2 + 1.2;
  ox5(true, x0, z); G.teleport(x0 - 1.6, z, Math.PI / 2); const ox = G.npc('ox5'); if (ox) G.npcWalk('ox5', x1, z, null, 0.7);
  MG5('push', { title: '쟁기질', hint: '황소가 쟁기를 끌어요. 쟁기 자루를 꾹 눌러 이랑이 곧고 깊게 나도록 해요.', need: 8, dur: 14, btn: '누르기', unit: '고랑' }, () => {
    for (const k of rowIds5(j)) { S.plots[k] = { s: 1 }; } G.ENT.plotsDirty = true; G.FX.burst(x, hAt(x, z) + 0.2, z, 24, { c: [0.35, 0.25, 0.18], sp: 2, up: 1.2, spread: 5 });
    c.plow = (c.plow || 0) + 1; ox5(false); GG.UI.toast(c.plow >= 2 ? '두 이랑을 다 갈았어요 · 이제 씨를 뿌려요' : '한 이랑을 갈았어요'); GG.UI.quest(); }); }
function sow5(S, G, j) { const c = C5(S), [x, z] = rowPos5(j); act('plant', 1.2);
  MG5('rhythm', { title: '씨 뿌리기', hint: '박자에 맞춰 한 줌씩 흩뿌려요. 고르게 뿌려야 고르게 나요.', beats: 14, need: 9 }, () => {
    for (const k of rowIds5(j)) { S.plots[k] = { s: 2, c: 'wheat', st: 0, g: 0, w: 1 }; } G.ENT.plotsDirty = true; c.sow = (c.sow || 0) + 1; if (c.sow >= 2) c.sowDay = S.day;
    GG.UI.toast(c.sow >= 2 ? '씨를 다 뿌렸어요 · 나흘쯤 지나면 거둘 수 있어요 (곁이야기를 해도 돼요)' : '한 이랑에 씨를 뿌렸어요'); GG.UI.quest(); }); }
function bind5(S, G) { act('gather', 1.4); MG5('wrestle', { title: '단 묶기', hint: '밀 한 아름을 모아 짚 끈으로 꽉 조여 묶어요.', need: 6, dur: 14, btn: '조이기', unit: '단' }, () => { C5(S).bind = 1; GG.UI.toast('밀단을 묶어 타작마당으로 날랐어요'); GG.UI.quest(); }); }
function thresh5(S, G) { const [x, z] = THRESH5; ox5(true, x + 2.6, z); const path = []; for (let k = 1; k <= 8; k++) { const a = k / 8 * Math.PI * 2; path.push([x + Math.cos(a) * 2.6, z + Math.sin(a) * 2.6]); } G.npcWalk('ox5', path[7][0], path[7][1], null, 0.9, path.slice(0, 7)); G.teleport(x + 3.6, z + 2.4, -2.2);
  MG5('balance', { title: '타작', hint: '황소가 마당을 돌며 이삭을 밟아요. 고삐를 잡고 소가 원 밖으로 나가지 않게 가운데를 지켜요.', dur: 10 }, () => { C5(S).thresh = 1; ox5(false); GG.UI.toast('이삭이 다 떨어졌어요 · 오후 바람에 키질해요'); GG.UI.quest(); }); }
function winnow5(S, G) { const h = hr5(S); if (h < 13 || h >= 18.5) { GG.UI.toast('아직 바람이 없어요 · 바람은 오후 1시부터 6시 사이에 불어요'); return; } act('gather', 1.2);
  MG5('rhythm', { title: '키질', hint: '바람이 불 때 낟알을 높이 던져 올려요. 가벼운 겨는 날아가고 낟알만 떨어져요.', beats: 16, need: 10 }, () => { C5(S).winnow = 1; G.FX.burst(THRESH5[0], hAt(THRESH5[0], THRESH5[1]) + 1.4, THRESH5[1], 30, { c: [0.95, 0.85, 0.55], sp: 2.4, up: 2.2 }); GG.UI.toast('겨가 바람에 날아가고 낟알만 남았어요'); GG.UI.quest(); }); }
function bag5(S, G) { act('pick', 1); MG5('count', { title: '자루에 담기', hint: '낟알을 자루에 퍼 담아요. 자루 열 개.', need: 10, dur: 14, btn: '담기', unit: '자루' }, () => { C5(S).bag = 1; GG.UI.toast('곡식 열 자루 · 서기 카이에게 가요'); GG.UI.quest(); G.checkStep(); }); }

// ------------------------------------------------------------------ ③ 성읍 곳간 · 직접 공들여 (41:48)
const BUILD5 = [ /* [what to do, where ('site' | 'stone' | 'brick'), minigame, options, wait (null | 'day' | 'dry')] */
  ['다짐판으로 터 다지기', 'site', 'rhythm', { title: '터 다지기', hint: '물을 뿌린 흙을 나무 다짐판으로 쿵, 쿵. 박자에 맞춰 단단히 다져요.', beats: 14, need: 9 }],
  ['기초 돌 놓기', 'stone', null, null],
  ['진흙과 짚 밟아 섞기 (우니의 벽돌터)', 'brick', 'wrestle', { title: '진흙 밟기', hint: '「진흙 둘에 짚 하나.」 발로 꼭꼭 밟아 고루 섞어요.', need: 7, dur: 14, btn: '밟기', unit: '번' }],
  ['벽돌 틀에 찍기', 'brick', 'count', { title: '벽돌 찍기', hint: '나무 틀에 진흙을 꾹 채우고 들어 올려요. 열두 장.', need: 12, dur: 16, btn: '찍기', unit: '장' }, 'dry'],
  ['마른 벽돌 수레에 싣기', 'brick', 'balance', { title: '벽돌 싣기', hint: '마른 벽돌을 수레에 차곡차곡. 한쪽으로 기울지 않게 가운데를 지켜요.', dur: 9 }],
  ['첫째 켜 · 줄 맞춰 벽돌 놓기', 'site', 'count', { title: '첫째 켜', hint: '줄을 따라 벽돌을 한 장씩 놓아요.', need: 10, dur: 14, btn: '놓기', unit: '장' }, 'day'],
  ['둘째 켜 · 진흙 반죽 바르기', 'site', 'rhythm', { title: '둘째 켜', hint: '벽돌 사이에 진흙 반죽을 박자에 맞춰 발라요.', beats: 14, need: 9 }, 'day'],
  ['셋째 켜 · 나무 발판 세우기', 'site', 'push', { title: '셋째 켜', hint: '벽이 가슴 높이를 넘었어요. 일꾼들과 나무 발판을 밀어 세워요.', need: 7, dur: 14, btn: '밀기', unit: '번' }, 'day'],
  ['넷째 켜 · 벽돌 올려 주기', 'site', 'balance', { title: '넷째 켜', hint: '발판 위로 벽돌 바구니를 올려요. 기울지 않게.', dur: 9 }, 'day'],
  ['다섯째 켜 · 다림줄로 곧은지 보기', 'site', 'count', { title: '다섯째 켜', hint: '다림줄을 대고 벽이 곧은지 한 군데씩 살펴요.', need: 8, dur: 12, btn: '살피기', unit: '군데' }, 'day'],
  ['위 구멍과 아래 문 달기 (목수와 함께)', 'site', 'push', { title: '문 달기', hint: '목수와 함께 나무 문을 문틀에 밀어 맞추고 빗장을 걸어요.', need: 6, dur: 12, btn: '밀기', unit: '번' }],
  ['둥근 지붕 올리기 (발판 위에서)', 'site', 'balance', { title: '둥근 지붕', hint: '벽돌을 안쪽으로 조금씩 들여 쌓아 둥글게 닫아요. 발판 위에서 흔들리지 않게.', dur: 10 }, 'day'],
  ['석회 회칠', 'site', 'rhythm', { title: '회칠', hint: '쥐와 습기를 막는 하얀 석회를 박자에 맞춰 발라요.', beats: 16, need: 10 }],
  ['사다리를 올라 첫 곡식 붓기', 'site', 'balance', { title: '첫 곡식', hint: '곳간 몫 두 자루를 지고 사다리를 올라요. 꼭대기 구멍에 부어요.', dur: 9 }]];
/* how far the granary model has risen after each of these (s.work = 9; the last fills it: built) */
const RISE5 = [1, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 9];
const W5 = ['일꾼 메리', '일꾼 세티', '일꾼 아메']; const WK5 = [[-3.6, 4.2, 'swing'], [3.8, 4.4, 'gather'], [5.8, -1.2, 'pick']];
function workers5(on) { const G = Gm(), s = GR5('granA'); WK5.forEach(([dx, dz, a], i) => { const id = 'gw5_' + i; if (on) { if (!G.npc(id)) G.spawnNPC({ id, name: W5[i], look: i === 1 ? LOOK.farmerThin : LOOK.farmer, x: s.x + dx, z: s.z + dz, face: Math.atan2(-dx, -dz), noTalk: true, noTag: true, noBond: true, act: a }); }
  else if (G.npc(id)) G.removeNPC(id); }); }
function buildStage5(S) { return C5(S).b || 0; }
function waitLeft5(S) { const c = C5(S), st = BUILD5[c.b || 0]; if (!st) return 0; if (c.dryUntil && S.day < c.dryUntil) return c.dryUntil - S.day; if (c.lastDay !== undefined && c.lastWait === 'day' && S.day <= c.lastDay) return 1; return 0; } /* (after a day's course the mud sets overnight, whatever comes next) */
CH5.c5_build = { ch: 6, obj: S => { const c = C5(S), b = c.b || 0, st = BUILD5[b], w = waitLeft5(S); if (!st) return '성읍 곳간 다 지음';
    if (b === 1) return (c.stones || 0) < 2 ? `기초 돌 놓기 (${c.stones || 0}/2) · 돌무더기에서 들어 터로` : '큰 기초 돌 둘 · 일꾼들과 굴림대로 굴려 오기'; if (w) return (c.dryUntil && S.day < c.dryUntil ? `벽돌이 볕에 마르는 중 · ${w}일 남음` : '진흙이 굳기를 기다리기 · 내일 아침') + ' (곁이야기를 해도 돼요)'; return '성읍 곳간 짓기 · ' + st[0]; },
  list: S => { const b = C5(S).b || 0; return BUILD5.map((s, i) => ({ t: s[0], ok: b > i })); },
  enter(S, G, re) { const s = GR5('granA'); s.work = 9; if (S.built.granA && !(C5(S).b >= BUILD5.length)) { C5(S).b = BUILD5.length; setTimeout(() => G.checkStep(), 60); return; } /* (an old save that already raised it with the brick puzzles) */ workers5(true); if (!S.siteWork || !S.siteWork.granA) { S.siteWork = S.siteWork || {}; if (!S.built.granA) { S.siteWork.granA = { opt: { shape: 'dome', finish: 'white', band: 'blue' }, n: 0 }; G.buildSiteMeshes && G.buildSiteMeshes(); } }
    if (!re) narr([{ kick: '성읍 곳간 · 공들여 짓기', title: '열흘의 일', t: '곳간은 하루에 다 지을 수 없어요. 벽돌은 볕에 사흘 말려야 하고, 벽은 하루에 한 켜씩 쌓아 진흙이 굳어야 해요. 기다리는 동안에는 곁이야기를 하러 다녀와도 돼요.', ref: '' }]); },
  target: S => { const c = C5(S), b = c.b || 0, st = BUILD5[b], s = GR5('granA'); if (!st || waitLeft5(S)) return null; if (st[1] === 'brick') return { x: BRICK5[0], z: BRICK5[1] };
    if (st[1] === 'stone') return S.q.c5carry ? { x: s.x, z: s.z + 3.2 } : { x: STONE5[0], z: STONE5[1] }; return { x: s.x, z: s.z + 3.6 }; },
  check: S => (C5(S).b || 0) >= BUILD5.length,
  done(S, G, next) { twoGranaries5(S, G, next); }, next: 'c5_manasseh' };
function doBuild5(S, G) { const c = C5(S), b = c.b || 0, st = BUILD5[b]; if (!st || waitLeft5(S)) return;
  const fin = () => { const n = RISE5[b], s = GR5('granA'); s.work = 9; /* (ep_joseph_life.js sets every granary to 4 stages) */ if (n && S.siteWork && S.siteWork.granA && S.siteWork.granA.n < n) { S.siteWork.granA.n = n - 1; G.siteWork(s); } /* (the model rises · the last completes the granary) */
    c.b = b + 1; if (st[4] === 'dry') { c.dryUntil = S.day + 3; } if (st[4] === 'day') { c.lastDay = S.day; c.lastWait = 'day'; } else c.lastWait = null;
    const sayL = { 2: [N('brick', '좋습니다, 총리님. 이제 틀에 찍어 볕에 내놓지요.')], 3: [N('brick', '이제 볕에 사흘입니다. 서두르면 갈라집니다.')], 5: [N('overseerC', '첫 켜가 반듯합니다! 진흙이 굳으면 내일 둘째 켜를 올리지요.', '', 'happy')], 10: [N('gw5_1', '문틀이 반듯해야 빗장이 맞습니다. 됐습니다!')], 12: [N('overseerC', '하얀 곳간이 섰습니다, 총리님!', '', 'happy')] }[b];
    GG.UI.toast(b === BUILD5.length - 1 ? '첫 곡식이 곳간에 들어갔어요' : st[4] === 'dry' ? '벽돌을 볕에 내놓았어요 · 사흘 뒤에 나를 수 있어요' : st[4] === 'day' ? `${st[0].split(' · ')[0]} 끝 · 진흙이 굳으면 내일 다음 켜를 올려요` : '끝났어요');
    const after = () => { GG.UI.quest(); if (b === BUILD5.length - 1) firstGrain5(S, G); else G.checkStep(); }; if (sayL) say(sayL, after); else after(); };
  if (!st[2]) return fin(); act(st[2] === 'rhythm' ? 'gather' : st[2] === 'push' ? 'pick' : 'gather', 1.2, st[1] === 'site' && b >= 5 ? 'hammer' : null); MG5(st[2], st[3], fin); }
function firstGrain5(S, G) { const s = GR5('granA'), h = hAt(s.x, s.z), sc = G.npc('scribeR');
  cine([{ fn: () => { G.teleport(s.x + 1.4, s.z + 3.2, Math.PI); if (sc) G.npcTo('scribeR', s.x - 2.2, s.z + 4.2, 2.6, false); }, cam: [s.x + 6, h + 3.4, s.z + 9], look: [s.x, h + 3, s.z], dur: 6, t: '곳간 몫 두 자루가 꼭대기 구멍으로 쏟아져 들어갔습니다. 왕궁 서기관이 곳간 장부에 첫 줄을 적었습니다.' }], () => G.checkStep()); }
/* the other two granaries: the same work in the same order, seen from Joseph's wagon (no words) */
function twoGranaries5(S, G, next) { const b = GR5('granB'), c = GR5('granC'), hb = hAt(b.x, b.z), hc = hAt(c.x, c.z); const fin = id => { const s = GR5(id); if (S.built[id]) return; S.siteWork = S.siteWork || {}; S.siteWork[id] = { opt: { shape: 'dome', finish: id === 'granB' ? 'ochre' : 'white', band: id === 'granB' ? 'red' : 'green' }, n: (s.work || 9) - 1 }; G.siteWork(s); };
  workers5(false);
  cine([{ cam: [b.x + 12, hb + 6, b.z + 12], cam2: [b.x + 9, hb + 5, b.z + 9], look: [b.x, hb + 1.5, b.z], dur: 6, music: 'j_plenty', t: '서쪽 마을에서도 일꾼들이 같은 차례로 곳간을 지었습니다. 터를 다지고, 벽돌을 말리고, 하루에 한 켜씩.' },
    { fn: () => fin('granB'), cam: [b.x + 8, hb + 4, b.z + 10], look: [b.x, hb + 2.4, b.z], dur: 5, t: '서쪽 마을 곳간이 섰습니다.' },
    { cam: [c.x + 12, hc + 6, c.z - 12], cam2: [c.x + 9, hc + 5, c.z - 9], look: [c.x, hc + 1.5, c.z], dur: 6, t: '남쪽 마을의 곳간은 강물이 닿지 않는 언덕 위에 섰습니다.' },
    { fn: () => fin('granC'), cam: [c.x + 8, hc + 4, c.z - 10], look: [c.x, hc + 2.4, c.z], dur: 5, t: '이렇게 곳간 셋이 섰습니다.', ref: '창세기 41:48' }], () => { GG.Game.musicOverride = null; next(); }); }

// ------------------------------------------------------------------ ④ ⑥ two sons (41:50–52) · only the Bible's words
function birthScene(S, G, which) { /* v18.77 (redeclared: no made-up words of Asenath's, no look east, no toddling Manasseh) */
  const ax = 7.6, az = -137.4, h = hAt(ax, az);
  if (which === 'manasseh') cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 19.6, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 7, music: 'j_night',
      t: '흉년이 들기 전에 요셉에게 두 아들이 나되, 곧 온 제사장 보디베라의 딸 아스낫이 그에게서 낳은지라.', ref: '창세기 41:50' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 므낫세라 하리라. 하나님이 나로 내 모든 고난과 나의 아비의 온 집 일을 잊어버리게 하셨다.', ref: '창세기 41:51', e: 'tender', fadeOut: 1.4 },
  ], () => { S.q.born1 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.newDay('풍년 둘째 해'); G.go('c5_haul'); });
  else cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 18.4, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 6, music: 'j_hope', t: '아스낫이 둘째 아들을 낳았습니다.', ref: '창세기 41:50' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 에브라임이라 하리라. 하나님이 나로 수고한 땅에서 번성하게 하셨다.', ref: '창세기 41:52', e: 'happy', fadeOut: 1.4 },
  ], () => { S.q.born2 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.go('c5_count'); });
}

// ------------------------------------------------------------------ ⑤ year by year (41:48): the second harvest to the west and south granaries
CH5.c5_haul = { ch: 6, obj: S => { const c = C5(S); return !c.load ? '성읍 곳간 앞 · 곡식 자루를 수레에 싣기' : !c.hB ? '수레를 몰고 서쪽 마을 곳간으로 (북쪽 나루 건너)' : !c.hC ? '수레를 몰고 남쪽 마을 곳간으로 (남쪽 나루 건너)' : '곳간 셋에 다 부었어요'; },
  list: S => { const c = C5(S); return [{ t: '성읍 곳간 앞에서 곡식 자루 싣기', ok: !!c.load }, { t: '서쪽 마을 곳간에 붓기', ok: !!c.hB }, { t: '남쪽 마을 곳간에 붓기', ok: !!c.hC }]; },
  enter(S, G, re) { if (!re) narr([{ kick: '풍년 둘째 해', title: '해마다 쌓기', t: '해마다 각 성 주위 밭의 곡물을 그 성의 곳간에 쌓았어요. 올해는 요셉이 몸소 버금 수레에 자루를 싣고 서쪽과 남쪽 곳간까지 가요.', ref: '창세기 41:48' }]); },
  target: S => { const c = C5(S), g = id => { const s = GR5(id); return { x: s.x, z: s.z + 4 }; }; return !c.load ? g('granA') : !c.hB ? g('granB') : !c.hC ? g('granC') : null; },
  check: S => { const c = C5(S); return !!(c.load && c.hB && c.hC); },
  done(S, G, next) { narr([{ kick: '풍년 둘째 해', title: '곳간마다', t: '세 곳간에 곡식 자루가 쌓여 갔습니다.', ref: '' }], next); }, next: 'c5_ephraim' };
const cartNear5 = (x, z, r) => { const G = Gm(), S = G.S(), cp = S.q.riding ? { x: G.P.x, z: G.P.z } : GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos(); return !!cp && Math.hypot(cp.x - x, cp.z - z) < (r || 16); }; /* (riding: the wagon is where Joseph is) */
function haul5(S, G, k) { const c = C5(S), s = GR5(k === 'load' ? 'granA' : k === 'hB' ? 'granB' : 'granC');
  if (k !== 'load' && !cartNear5(s.x, s.z)) { GG.UI.toast('곡식 자루를 실은 버금 수레를 곳간 앞까지 몰고 와요'); return; }
  if (k === 'load' && !cartNear5(s.x, s.z, 20)) { GG.UI.toast('버금 수레를 곳간 앞에 대 놓고 실어요 (왼쪽 「수레 부르기」)'); return; }
  act('pick', 1); MG5(k === 'load' ? 'balance' : 'count', k === 'load' ? { title: '자루 싣기', hint: '자루를 수레 짐칸에 고르게. 기울지 않게.', dur: 8 } : { title: '곡식 붓기', hint: '자루를 하나씩 풀어 곳간 구멍에 부어요.', need: 6, dur: 12, btn: '붓기', unit: '자루' }, () => {
    c[k] = 1; G.FX.burst(s.x, hAt(s.x, s.z) + 2, s.z, 24, { c: [0.95, 0.85, 0.55], sp: 1.6, up: 2 }); GG.UI.toast(k === 'load' ? '곡식 자루를 실었어요 · 서쪽 마을 곳간으로' : k === 'hB' ? '서쪽 곳간에 부었어요 · 이제 남쪽 마을로' : '남쪽 곳간에도 부었어요'); GG.UI.quest(); G.checkStep(); }); }

// ------------------------------------------------------------------ ⑦ 「세기를 그쳤더라」 (41:49)
CH5.c5_count = { ch: 6, obj: S => '성읍 곳간에서 서기관과 곡식 세기', list: S => [{ t: '곳간의 곡식 세기', ok: !!C5(S).counted }],
  enter(S, G, re) { if (!re) narr([{ kick: '풍년 여섯째 해', title: '곳간마다 가득', t: '해마다 곡식이 들어왔어요. 성읍 곳간 앞에서 왕궁 서기관이 장부를 펴고 기다려요.', ref: '' }]); },
  target: S => { const s = GR5('granA'); return { x: s.x, z: s.z + 4 }; }, check: S => !!C5(S).counted,
  done(S, G, next) { next(); }, next: 'c5_years' };
function count5(S, G) { const s = GR5('granA'), h = hAt(s.x, s.z); act('pick', 1);
  MG5('count', { title: '곡식 세기', hint: '서기관이 부르는 대로 자루를 세어요.', need: 12, dur: 14, btn: '하나', unit: '자루' }, () => {
    say([T('열둘, 스물넷, 백… 서기관의 장부가 금세 가득 찼어요.'), T('그날 들어온 수레가 또 줄지어 섰어요.')], () => {
      MG5('count', { title: '곡식 세기 · 또', hint: '수레가 끝없이 들어와요. 계속 세어요.', need: 16, dur: 14, btn: '하나', unit: '자루' }, () => {
        cine([{ cam: [s.x + 10, h + 5, s.z + 12], cam2: [s.x + 16, h + 9, s.z + 18], look: [s.x, h + 2, s.z], dur: 8, t: '요셉이 곡식을 저축하였으되 바다 모래 같이 심히 많아서 셀 수 없으므로 세기를 그쳤더라.', ref: '창세기 41:49' }], () => { C5(S).counted = 1; GG.UI.quest(); G.checkStep(); }); }); }); }); }

// ------------------------------------------------------------------ ⑧ the end of the plenty (41:53–54) · the old montage without its made-up line
function plentyMontage(S, G) { /* v18.77 (redeclared) */ const gs = sites.map(s => [s.x, s.z, hAt(s.x, s.z)]);
  cine([
    { fn: () => { LAND = 'plenty'; G.W().recolor(color); RT.sacks = 3; }, cam: [gs[0][0] + 12, gs[0][2] + 7, gs[0][1] + 10], cam2: [gs[0][0] + 8, gs[0][2] + 4, gs[0][1] + 7], look: [gs[0][0], gs[0][2] + 1.5, gs[0][1]], dur: 7, music: 'j_plenty', title: '풍년 일곱째 해', sub: '', t: '칠 년 풍년에 토지 소산이 심히 많은지라.', ref: '창세기 41:47' },
    { fn: () => { LAND = 'famine'; G.W().recolor(color); }, hour: 13, cam: [-50, 16, 40], cam2: [-70, 20, 10], look: [-100, 1, 40], look2: [-110, 1, 0], dur: 9, music: 'j_famine', sfx: 'wind',
      t: '애굽 땅에 칠 년 풍년이 그치고, 요셉의 말과 같이 칠 년 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 식물이 있더니', ref: '창세기 41:53–54', fadeOut: 1.6 },
    { black: true, title: '6장 · 일곱 해 흉년', sub: '창세기 41:53–42:9', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4 },
  ], () => { GG.Game.musicOverride = null; S.day += 7 * 360; G.go('c6_dry'); });
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^c5_/.test(S.step || '')) return null; const st = S.step, c = C5(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c5_patrol') { const m = c.meas || (c.meas = {}); SITE5.forEach(([k, id, n]) => { if (m[k]) return; const s = GR5(id); if (k === 'A' && !qd(S, 'metC')) return; if (k === 'B' && !qd(S, 'metW')) return; if (k === 'C' && !qd(S, 'metS')) return;
      at(s.x, s.z + 3.4, 4.2, { label: `${n} 곳간 터 재기 · 줄을 따라 걸음 세기`, key: 'c5Meas' + k, use: () => MG5('count', { title: '터 재기', hint: '말뚝과 줄을 따라 걸으며 걸음을 세어요. 가로 열 걸음.', need: 10, dur: 12, btn: '한 걸음', unit: '걸음' }, () => { m[k] = 1; say([T(`${n} 곳간 터 · 가로 열 걸음, 세로 여섯 걸음. 말뚝과 줄이 반듯해요.`)], () => { GG.UI.quest(); G.checkStep(); }); }) }); }); }
  if (st === 'c5_farm') { const F = field5();
    if ((c.plow || 0) < 2) { const j = ROWS5[c.plow || 0], [x, z] = rowPos5(j); at(x, z, F.cols * F.ts / 2 + 2, { label: `소와 쟁기로 이랑 갈기 (${(c.plow || 0) + 1}/2)`, key: 'c5Plow', use: () => plow5(S, G, j) }); }
    else if ((c.sow || 0) < 2) { const j = ROWS5[c.sow || 0], [x, z] = rowPos5(j); at(x, z, F.cols * F.ts / 2 + 2, { label: `밀 씨 뿌리기 (${(c.sow || 0) + 1}/2)`, key: 'c5Sow', use: () => sow5(S, G, j) }); }
    else if (!c.harvest) { /* the real harvest: the plots themselves (sickle) */ }
    else if (!c.bind) { const [x, z] = rowPos5(0.5); at(x, z, 9, { label: '거둔 밀 단 묶기', key: 'c5Bind', use: () => bind5(S, G) }); }
    else { const [x, z] = THRESH5; if (!c.thresh) at(x, z, 4, { label: '타작마당 · 소가 밟아 이삭 떨기', key: 'c5Thr', use: () => thresh5(S, G) }); else if (!c.winnow) at(x, z, 4, { label: hr5(S) >= 13 && hr5(S) < 18.5 ? '키질하기 · 바람이 불어요' : '키질하기 · 바람 기다리기 (오후)', key: 'c5Win', use: () => winnow5(S, G) }); else if (!c.bag) at(x, z, 4, { label: '자루에 담기', key: 'c5Bag', use: () => bag5(S, G) }); } }
  if (st === 'c5_build') { const b = c.b || 0, bs = BUILD5[b], s = GR5('granA'); if (bs && !waitLeft5(S)) {
      if (bs[1] === 'brick') at(BRICK5[0], BRICK5[1], 3.6, { label: bs[0], key: 'c5B' + b, use: () => doBuild5(S, G) });
      else if (bs[1] === 'stone' && (c.stones || 0) >= 2) at(STONE5[0], STONE5[1], 3.2, { label: '큰 기초 돌 둘 · 굴림대로 굴려 오기', key: 'c5Roll', use: () => roll5(S, G) }); /* v18.80 two by hand, the two big ones on rollers with the workers (not four of the same) */
      else if (bs[1] === 'stone') { if (!S.q.c5carry) at(STONE5[0], STONE5[1], 2.8, { label: `기초 돌 들기 (${(c.stones || 0) + 1}/2)`, key: 'c5St', use: () => { S.q.c5carry = 1; p.carry = 'stone'; act('pick', 0.8); G.sfx('thud', { vol: 0.4 }); } });
        else at(s.x, s.z + 3.2, 3.6, { label: `기초 돌 놓기 (${(c.stones || 0) + 1}/2)`, key: 'c5Put', use: () => { S.q.c5carry = 0; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.6 }); c.stones = (c.stones || 0) + 1; GG.UI.quest(); if (c.stones === 2) GG.UI.toast('남은 둘은 너무 커요 · 일꾼들과 굴림대로 굴려요'); if (c.stones >= 4) doBuild5(S, G); } }); }
      else at(s.x, s.z + 3.6, 4.4, { label: bs[0], key: 'c5B' + b, use: () => doBuild5(S, G) }); } }
  if (st === 'c5_haul') { if (!c.load) { const s = GR5('granA'); at(s.x, s.z + 4, 6, { label: '곡식 자루를 수레에 싣기', key: 'c5Load', use: () => haul5(S, G, 'load') }); }
    else for (const [k, id] of [['hB', 'granB'], ['hC', 'granC']]) { if (c[k] || (k === 'hC' && !c.hB)) continue; const s = GR5(id); at(s.x, s.z + 4, 7, { label: '곳간에 곡식 붓기', key: 'c5' + k, use: () => haul5(S, G, k) }); } }
  if (st === 'c5_count' && !c.counted) { const s = GR5('granA'); at(s.x, s.z + 4, 5, { label: '서기관과 곳간 곡식 세기', key: 'c5Cnt', use: () => count5(S, G) }); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ every frame
function ch5Tick(dt, S) { if (!S || !/^c5_/.test(S.step || '')) return; try { const G = Gm(), c = C5(S);
    if (S.step === 'c5_farm') { const k = G.npc('kaiClerk'); if (k && Math.hypot(k.x - (THRESH5[0] - 1.6), k.z - (THRESH5[1] + 4.4)) > 1.5 && !k.walk && !k.talking) G.npcTo('kaiClerk', THRESH5[0] - 1.6, THRESH5[1] + 4.4, 2.6, false); }
    if (S.step === 'c5_farm' && !c.harvest && (c.sow || 0) >= 2 && !c.crew && growing5(S) > 0 && growing5(S) <= plots5().length - 4) { c.crew = 1; for (const k of plots5()) { const q = S.plots[k]; if (q && q.s === 2 && q.c === 'wheat') delete S.plots[k]; } G.ENT.plotsDirty = true; GG.UI.toast('곁의 일꾼들이 남은 밀을 함께 다 베었어요'); } /* v18.80 Joseph reaps four plots, the workers the rest */
    if (S.step === 'c5_farm' && !c.harvest && (c.sow || 0) >= 2 && growing5(S) === 0) { c.harvest = 1; GG.UI.toast('밀을 다 거두었어요 · 단을 묶어요'); GG.UI.quest(); }
    if (S.step === 'c5_build') { if (c.dryUntil && S.day >= c.dryUntil && !c.dryTold) { c.dryTold = 1; GG.UI.toast('벽돌이 다 말랐어요 · 우니의 벽돌터로'); GG.UI.quest(); }
      if (!G.npc('gw5_0')) workers5(true); }
    if (c.lastWait === 'day' && S.day > (c.lastDay || 0) && c.toldDay !== S.day) { c.toldDay = S.day; if (S.step === 'c5_build') { GG.UI.toast('진흙이 다 굳었어요 · 다음 켜를 올려요'); GG.UI.quest(); } }
  } catch (e) { console.error('ch5', e); } }
function ch5Build(W, P) { try { const [tx, tz] = THRESH5, [sx, sz] = STONE5, [bx, bz] = BRICK5;
    P((g, M) => { g.cyl(3.4, 3.5, 0.1, 22, { m: M, at: [0, 0.05, 0], c: 0xc8a878, j: 0.02 }); for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.box(0.5, 0.18, 0.32, { m: M, at: [Math.cos(a) * 3.55, 0.09, Math.sin(a) * 3.55], ry: -a, c: 0x9a8a72, j: 0.06 }); } }, tx, tz, { col: null }); /* the threshing floor: beaten earth ringed with stones */
    P('bales', tx + 4.6, tz - 2.4, { ry: 0.4, col: { r: 0.9, h: 1 } }); P('jars', tx - 4.4, tz + 1.8, { args: [3], col: { w: 2, d: 0.6, h: 1 } });
    P((g, M) => { for (let k = 0; k < 9; k++) g.sph(0.32 + (k % 3) * 0.06, 6, 4, { m: M, at: [(k % 3 - 1) * 0.7, 0.22 + Math.floor(k / 3) * 0.32, (Math.floor(k / 3) - 1) * 0.5], s: [1.3, 0.7, 1], c: 0xa89a84, flat: true, j: 0.08 }); }, sx, sz, { col: { r: 1, h: 1 } }); /* foundation stones */
    P((g, M) => { for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) g.box(0.36, 0.12, 0.18, { m: M, at: [-1 + k * 0.42, 0.06, -0.8 + r * 0.5], c: 0xb07a4a, j: 0.05 }); g.box(0.5, 0.14, 0.3, { m: M, at: [1.6, 0.07, 0.6], c: 0x7a5a3a }); }, bx, bz, { col: null }); /* bricks drying in rows · a mould */
  } catch (e) { console.error('ch5Build', e); } }

// ------------------------------------------------------------------ put the steps in order (the old c5_year1 / c5_year2 stay only for old saves)
CH5.c5_manasseh = Object.assign({}, steps.c5_manasseh, { next: 'c5_haul' });
CH5.c5_ephraim = Object.assign({}, steps.c5_ephraim, { next: 'c5_count' });
steps.c5_year1 = Object.assign({}, steps.c5_year1, { obj: '풍년 첫해', enter(S, G, re) { setTimeout(() => G.go('c5_farm'), 60); } }); /* (an old save: on to the new chapter) */
steps.c5_year2 = Object.assign({}, steps.c5_year2, { obj: '풍년 둘째 해', enter(S, G, re) { setTimeout(() => G.go('c5_haul'), 60); } });
{ const keys = Object.keys(steps), cut = keys.indexOf('c5_patrol'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c5_year1 = tail.find(t => t[0] === 'c5_year1')[1]; steps.c5_farm = CH5.c5_farm; steps.c5_build = CH5.c5_build; steps.c5_manasseh = CH5.c5_manasseh;
  steps.c5_year2 = tail.find(t => t[0] === 'c5_year2')[1]; steps.c5_haul = CH5.c5_haul; steps.c5_ephraim = CH5.c5_ephraim; steps.c5_count = CH5.c5_count;
  for (const [k, v] of tail) { if (/^c5_(year1|year2|manasseh|ephraim)$/.test(k)) continue; steps[k] = v; }
  ORDER = Object.keys(steps); }
{ const d = npcs.find(n => n.id === 'kaiClerk'); if (d) { const sh0 = d.show; d.show = S => S.step === 'c5_farm' || sh0(S); } } /* Kai keeps the ledger at the threshing floor in the first harvest */
/* the granaries are raised by the story now (no brick puzzles in chapter 5) */
for (const id of ['granA', 'granB', 'granC']) { const s = sites.find(q => q.id === id); if (!s) continue; const r0 = s.r; Object.defineProperty(s, 'r', { configurable: true, get: () => { const S = Gm().S(); return S && between(S, 'c5_patrol', 'c5_years') ? 0.001 : (r0 || 4); } }); if (id === 'granA') s.work = 9; } /* (the site is still drawn as it rises: only its old 「짓기」 button is out of reach) */

/* v18.80 the two big foundation stones: up on wooden rollers, the workers pull the ropes, Joseph pushes from behind (one hands-on go, a different one from carrying) */
function roll5(S, G) { const c = C5(S); GG.UI.minigame('push', { title: '굴림대로 큰 돌 옮기기', hint: '일꾼들이 줄을 당길 때 꾹 눌러 뒤에서 밀어요. 숨이 차면 잠깐 쉬고, 뒤로 빠진 굴림대는 앞으로 옮겨 놓아요.', btn: '밀기' }, ok => { if (!ok) { GG.UI.toast('돌이 굴림대에서 미끄러졌어요 · 다시 밀어요'); return; }
  c.stones = 4; G.sfx('thud', { vol: 0.8 }); GG.UI.quest(); say([T('통나무 굴림대 위로 큰 돌 둘이 굴러 터에 놓였어요. 일꾼들이 손뼉을 쳤어요.')], () => doBuild5(S, G)); }); }
// =================================================================== v18.78 6장 다시 짜기 · 「일곱 해 흉년」 (e_ch6.js · 설계표_6장_v18_77.md)
/* 창 41:54 – 42:9(앞부분). 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 요셉의 말은 성경 말씀만(42:7).
   ① 기근(41:54–55): 나일 자로 물 높이 보기 → 궁 앞에 몰려든 백성 · 바로 「요셉에게 가라」
   ② 성읍 곳간(41:56): 진흙 봉인 떼기 → 곡식 한 줌 살피기 → 파는 법(됫박 · 저울 · 장부) · 백성 셋
   ③ 서쪽 곳간: 문 열기 → 둘째 파는 자리 세우기(됫박 · 저울 나르기) → 팔기
   ④ 남쪽 곳간: 언덕 위 곳간 → 나귀에 자루 싣기 → 강가 마을로 끌고 가 팔기
   ⑤ 각국 백성(41:57): 시돈 · 에돔 · 미디안 사람의 은(고리 · 덩이 · 조각) 달기
   ⑥ 형들(42:1–9 앞부분): 가나안 → 대상 속에 섞여 → 엎드려 절함 → 「너희가 어디서 왔느냐」 → 꿈을 생각하고 → 7장
   빠진 것: 요셉의 지어낸 말 · 에돔 목자의 야곱 집안 소식 · 아메니와 만남(→ 메인 뒤 곁이야기) · 마음 고르기 · 속마음 해설 */
const C6 = S => S.q.c6 || (S.q.c6 = {});
const GRA6 = k => sites.find(s => s.id === 'gran' + k);
const NILO6 = [-93.5, -63.5], RIVER6 = [-90, 132];
const MG6 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const CROWD6 = [[-6, 0, 'raiseHands'], [-4.4, 1.6, 'weep'], [-2.6, 0.4, 'raiseHands'], [-1, 2.2, 'kneelRest'], [1.2, 1.8, 'raiseHands'], [2.8, 0.2, 'weep'], [4.4, 1.4, 'raiseHands'], [6, 0.6, 'kneelRest'], [-3.4, 3.8, 'raiseHands'], [3.2, 3.6, 'weep']];
function crowd6(on) { const G = Gm(), [gx, gz] = SPOTS.palaceGate; CROWD6.forEach(([dx, dz, a], i) => { const id = 'cr6_' + i; if (on) { if (!G.npc(id)) G.spawnNPC({ id, name: '굶주린 백성', look: i % 3 === 1 ? LOOK.woman : LOOK.farmerThin, x: gx + dx, z: gz + 8 + dz, face: Math.PI, noTalk: true, noTag: true, noBond: true, act: a }); } else if (G.npc(id)) G.removeNPC(id); }); }
/* the buyers keep to the granary front from the first sale on (they used to come only at the end) */
for (const id of ['byFarmer', 'byWoman', 'buyElder']) { const d = npcs.find(n => n.id === id); if (d) d.show = S => between(S, 'c6_open', 'c6_open') && !(C6(S).sold || {})[id]; }
for (const id of ['bySidon', 'byEdom']) { const d = npcs.find(n => n.id === id); if (d) d.show = S => S.step === 'c6_sell' && !(C6(S).sold || {})[id]; }
{ const d = npcs.find(n => n.id === 'overseerW'); if (d) { const s0 = d.show; d.show = S => S.step === 'c6_west' || s0(S); } }
{ const d = npcs.find(n => n.id === 'byAmeni'); if (d) d.show = S => S.step === 'j_end'; } /* (the old servant is met after the story now · see the side story at the end of this file) */

// ------------------------------------------------------------------ ① 기근 (41:54–55)
const CH6 = {};
CH6.c6_dry = { ch: 7, obj: S => !C6(S).nile ? '북쪽 나루 · 나일 자로 물 높이 보기' : '바로의 궁으로', list: S => { const c = C6(S); return [{ t: '나일 자로 물 높이 보기 (북쪽 나루)', ok: !!c.nile }, { t: '바로의 궁 앞으로', ok: !!c.cry }]; },
  enter(S, G, re) { if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); } crowd6(true); if (!re) narr([{ kick: '창세기 41:54', title: '흉년의 첫해', t: '애굽 땅에 칠 년 풍년이 그치고 요셉의 말과 같이 칠 년 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 식물이 있더니.', ref: '창세기 41:54' }]); },
  target: S => !C6(S).nile ? { x: NILO6[0], z: NILO6[1] } : { x: SPOTS.palaceGate[0], z: SPOTS.palaceGate[1] + 14 }, check: S => !!C6(S).cry,
  done(S, G, next) { crowd6(false); next(); }, next: 'c6_open' };
function nile6(S, G) { const [x, z] = NILO6, h = hAt(x, z); act('gather', 1); cine([{ cam: [x + 3, h + 1.6, z + 3.4], look: [x - 3, h - 0.6, z - 1], dur: 6, t: '나일 강둑의 자에는 해마다 물이 오른 높이를 새겨 두었어요. 올해 물은 가장 아랫금에도 닿지 않았어요.' }],
  () => { C6(S).nile = 1; GG.UI.quest(); }); }
function cry6(S, G) { const [gx, gz] = SPOTS.palaceGate, h = hAt(gx, gz + 6); C6(S).cry = 1;
  cine([{ fn: () => { place('pharaoh', gx, gz - 1.2, 0); G.teleport(gx + 5.5, gz + 13, -2.6); }, cam: [gx + 7, h + 3.4, gz + 18], look: [gx, h + 1.4, gz + 6], dur: 7, music: 'j_famine', t: '애굽 온 땅이 주리매 백성이 바로에게 부르짖어 양식을 구하는지라.', ref: '창세기 41:55' },
    { cam: [gx + 1.6, h + 1.7, gz + 2.8], look: [gx, h + 1.8, gz - 1.2], dur: 7, fov: 0.6, n: '바로', t: '요셉에게 가서 그가 너희에게 이르는 대로 하라.', ref: '창세기 41:55' },
    { fn: () => { CROWD6.forEach((_, i) => { const n = G.npc('cr6_' + i); if (n) { n.act = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); } }); }, cam: [gx - 4, h + 2.2, gz + 6], look: [gx + 5.5, h + 1.4, gz + 13], dur: 6, t: '백성이 일제히 요셉을 바라보았어요.' }],
  () => { const n = G.npc('pharaoh'); if (n) G.npcTo('pharaoh', -30, -177.2, 0, false); G.checkStep(); }); }

// ------------------------------------------------------------------ ② 성읍 곳간 · 파는 법 배우기 (41:56)
const SELL6A = [['byFarmer', '총리님, 곡식을 사러 왔습니다. 은은 이만큼 있습니다.', 'measure'], ['byWoman', '아이들이 배고파해요. 한 자루만 사게 해 주세요.', 'ledger'], ['buyElder', '이 늙은이도 한 자루 사겠소. 은은 정직하게 달아 주시오.', 'weigh']]; /* v18.80 measure · ledger · weigh, each once (no repeats) */
CH6.c6_open = { ch: 7, obj: S => { const c = C6(S); return !c.seal ? '성읍 곳간 · 진흙 봉인 떼고 문 열기' : !c.look ? '곳간 안 곡식 한 줌 살피기' : `곳간 앞 백성에게 곡식 팔기 (${Object.keys(c.sold || {}).filter(k => SELL6A.some(b => b[0] === k)).length}/3)`; },
  list: S => { const c = C6(S), s = c.sold || {}; return [{ t: '진흙 봉인 떼고 문 열기', ok: !!c.seal }, { t: '곡식 한 줌 살피기', ok: !!c.look }].concat(SELL6A.map(([id], i) => ({ t: ['농부에게 팔기 · 됫박으로 되기', '여인에게 팔기 · 장부에 적기', '노인에게 팔기 · 저울에 은 달기'][i], ok: !!s[id] }))); },
  enter(S, G, re) { if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); } },
  target: S => { const c = C6(S), g = GRA6('A'); if (!c.seal || !c.look) return { x: g.x, z: g.z + 3.4 }; const b = SELL6A.find(q => !(c.sold || {})[q[0]]); return b ? 'npc:' + b[0] : null; },
  check: S => SELL6A.every(([id]) => (C6(S).sold || {})[id]),
  done(S, G, next) { narr([{ kick: '창세기 41:56', title: '모든 창고를 열고', t: '온 지면에 기근이 있으매 요셉이 모든 창고를 열고 애굽 백성에게 팔새, 애굽 땅에 기근이 심하며. 이제 서쪽 마을 곳간으로 가요.', ref: '창세기 41:56' }], next); }, next: 'c6_west',
  talk: Object.fromEntries(SELL6A.map(([id, line, how]) => [id, (S, G) => { const c = C6(S); if ((c.sold || {})[id] || !c.look) return false; sell6(S, G, id, [N(id, line)], how); }])) };
function seal6(S, G) { const g = GRA6('A'), h = hAt(g.x, g.z); act('pick', 1.2);
  MG6('wrestle', { title: '진흙 봉인 떼기', hint: '곳간 문 빗장에 붙여 둔 진흙 봉인을 조심조심 떼어 내요.', need: 6, dur: 12, btn: '떼기', unit: '번' }, () => {
    cine([{ cam: [g.x + 4.5, h + 2, g.z + 8.5], look: [g.x, h + 1.8, g.z + 1], dur: 5, sfx: 'door', t: '일곱 해 동안 닫혀 있던 곳간 문이 열렸어요.', fn: () => { G.FX.burst(g.x, h + 1.5, g.z + 2.5, 26, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); } }], () => { C6(S).seal = 1; (S.q.opened = S.q.opened || {}).A = 1; GG.UI.quest(); }); }); }
function look6(S, G) { act('gather', 1.4); say([T('곳간 안으로 들어가 곡식을 한 줌 쥐어 보았어요. 마르고 단단해요. 벌레 먹은 낟알이 없어요.'), T('하얀 석회를 바른 벽이 일곱 해 동안 쥐와 습기를 막아 주었어요.'), T('곳간 앞에는 벌써 사람들이 줄을 섰어요. 됫박으로 곡식을 되고, 저울에 은을 달아 팔아요.')], () => { C6(S).look = 1; GG.UI.quest(); }); }
/* one sale: the buyer's words (background people), then the work itself — Joseph says nothing */
function sell6(S, G, id, lines, how, after) { const c = C6(S);
  const measure = then => MG6('count', { title: '됫박으로 되기', hint: '됫박에 곡식을 수북이 담고 손바닥으로 위를 깎아 고르게 되어요.', need: 8, dur: 12, btn: '되기', unit: '됫박' }, then);
  const weigh = (then, hard) => MG6('balance', { title: hard ? '먼 나라의 은 달기' : '저울에 은 달기', hint: hard ? '은의 모양이 달라 무게를 가늠하기 어려워요. 저울대가 수평이 되게 추를 옮겨요.' : '저울 한쪽에 은을, 다른 쪽에 추를 올려 저울대가 수평이 되게 맞춰요.', dur: hard ? 11 : 8 }, then);
  const ledger = then => say([N('scribeR', '총리님, 장부에 적겠습니다. 이 손님은 몇 자루입니까?'), { n: '', t: '애굽 숫자로 「한 자루」는?', choices: [{ t: '│', ok: true }, { t: '∩', ok: false, fb: '∩는 열이에요. 한 자루는 막대 하나 │예요.' }] }, N('scribeR', '한 자루. 적었습니다.', '', 'happy')], then);
  const fin = () => { (c.sold = c.sold || {})[id] = 1; G.sfx('coins'); emote(id, 'bow', 2); G.FX.burst(G.P.x, hAt(G.P.x, G.P.z) + 1, G.P.z, 14, { c: [0.95, 0.85, 0.55], sp: 1.2, up: 1.4 }); GG.UI.quest(); after ? after() : G.checkStep(); };
  const queue = then => say([{ n: NM.overseerW || '서쪽 촌장', t: '총리님, 새 자리로 누구를 보낼까요?', choices: [{ t: '줄의 뒤쪽 절반', then: () => setTimeout(() => say([T('뒤쪽 사람들이 새 자리로 옮겨 섰어요. 두 줄이 나란히 줄어들어요.')], then), 30) }, { t: '줄의 맨 앞 사람들', ok: false, fb: '맨 앞 사람들은 가장 오래 기다렸어요. 뒤쪽 사람들을 새 자리로 보내면 모두가 더 빨리 받아요.' }] }]);
  const unload = then => MG6('push', { title: '나귀 짐 내리기', hint: '나귀 등의 무거운 자루를 꾹 붙잡고 천천히 내려요. 숨이 차면 잠깐 쉬어요.', btn: '내리기' }, then);
  const shape = (then, ans) => say([T('은을 손바닥에 올려 살펴보았어요.'), { n: '왕궁 서기관', t: '총리님, 장부에 은 모양을 무엇이라 적을까요?', choices: ['고리', '덩이', '조각'].map(k => k === ans ? { t: k, then: () => setTimeout(then, 30) } : { t: k, ok: false, fb: `다시 보세요. 이 사람의 은은 ${ans}예요.` }) }]);
  say(lines, () => { if (how === 'full') measure(() => weigh(() => ledger(fin))); else if (how === 'measure') measure(fin); else if (how === 'ledger') ledger(fin); else if (how === 'weigh') weigh(fin); else if (how === 'far') weigh(fin, true); else if (how === 'queue') queue(fin); else if (how === 'unload') unload(fin); else if (how && how.shape) shape(fin, how.shape); else fin(); }); } /* v18.80 queue · unload · shape: new ways, not the scoop and the scale again */

// ------------------------------------------------------------------ ③ 서쪽 마을 곳간 · 둘째 파는 자리
CH6.c6_west = { ch: 7, obj: S => { const c = C6(S); return !c.wOpen ? '버금 수레로 서쪽 마을 곳간 (북쪽 나루 건너)' : !c.wMet ? '서쪽 마을 촌장과 이야기하기' : (c.post || 0) < 2 ? `둘째 파는 자리 세우기 · 됫박과 저울 나르기 (${c.post || 0}/2)` : '새 자리로 줄 나누기'; },
  list: S => { const c = C6(S); return [{ t: '서쪽 마을 곳간 문 열기', ok: !!c.wOpen }, { t: '촌장과 이야기하기', ok: !!c.wMet }, { t: '됫박과 저울 나르기 (' + Math.min(2, c.post || 0) + '/2)', ok: (c.post || 0) >= 2 }, { t: '새 자리로 줄 나누기', ok: !!c.wSold }]; },
  target: S => { const c = C6(S), g = GRA6('B'); if (!c.wOpen) return { x: g.x, z: g.z + 3.4 }; if (!c.wMet) return 'npc:overseerW'; if ((c.post || 0) < 2) return S.q.c6carry ? { x: g.x + 6, z: g.z + 4 } : { x: g.x - 6, z: g.z + 5 }; return { x: g.x + 6, z: g.z + 4 }; },
  check: S => !!C6(S).wSold, done(S, G, next) { narr([{ kick: '서쪽 마을', title: '두 자리', t: '이제 서쪽 마을 곳간에는 파는 자리가 둘이에요. 줄이 반으로 줄었어요. 남쪽 마을 곳간으로 가요.', ref: '' }], next); }, next: 'c6_south',
  talk: { overseerW(S, G) { const c = C6(S); if (c.wMet || !c.wOpen) return false; say([N('overseerW', '총리님! 「그 양식으로 칠 년 흉년을 예비하자」 하시던 그 말씀이 오늘을 두고 하신 말씀이었군요.', '', 'tender'), N('overseerW', '그런데 줄이 너무 깁니다. 자리 하나로는 해가 져도 다 못 팝니다. 저 짐수레에 됫박과 저울이 하나씩 더 있습니다.')], () => { c.wMet = 1; GG.UI.quest(); }); } } };
function open6(S, G, k, then) { const g = GRA6(k), h = hAt(g.x, g.z); act('pick', 1);
  cine([{ cam: [g.x + 4.5, h + 2, g.z + 8.5], look: [g.x, h + 1.8, g.z + 1], dur: 5, sfx: 'door', t: k === 'B' ? '진흙 봉인을 떼고 서쪽 마을 곳간 문을 열었어요. 줄 선 사람들이 술렁였어요.' : '언덕 위 곳간 문을 열었어요. 강물이 닿지 않은 곡식은 한 톨도 상하지 않았어요.', fn: () => { G.FX.burst(g.x, h + 1.5, g.z + 2.5, 22, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); (S.q.opened = S.q.opened || {})[k] = 1; } }], then); }

// ------------------------------------------------------------------ ④ 남쪽 마을 곳간 · 나귀로 강가 마을에
CH6.c6_south = { ch: 7, obj: S => { const c = C6(S); return !c.sOpen ? '남쪽 마을 곳간 (남쪽 나루 건너 · 언덕 위)' : !c.load ? '나귀에 곡식 자루 싣기' : !c.down ? '나귀를 끌고 강가 마을까지 내려가기' : '나귀 짐에서 자루 내려 팔기'; },
  list: S => { const c = C6(S); return [{ t: '언덕 위 곳간 문 열기', ok: !!c.sOpen }, { t: '나귀에 자루 싣기', ok: !!c.load }, { t: '강가 마을까지 끌고 가기', ok: !!c.down }, { t: '나귀 짐 내려 팔기', ok: !!c.sSold }]; },
  enter(S, G, re) { if (C6(S).load && !C6(S).sSold) donkey6(true); },
  target: S => { const c = C6(S), g = GRA6('C'); if (!c.sOpen || !c.load) return { x: g.x, z: g.z + 3.4 }; return { x: RIVER6[0], z: RIVER6[1] }; },
  check: S => !!C6(S).sSold, done(S, G, next) { donkey6(false); narr([{ kick: '창세기 41:56', title: '곳간 셋', t: '성읍과 서쪽 마을과 남쪽 마을, 곳간 셋의 문이 다 열렸어요. 애굽 땅에 기근이 심하였으나 곳간마다 곡식이 있었어요.', ref: '창세기 41:56' }], next); }, next: 'c6_sell' };
function donkey6(on) { const G = Gm(), g = GRA6('C'); if (on) { if (!G.npc('don6')) G.spawnNPC({ id: 'don6', name: '나귀', animal: 'donkey', x: g.x + 3, z: g.z + 5, face: 0, noTalk: true, noTag: true, noBond: true }); G.npcFollow('don6', true); } else if (G.npc('don6')) { G.npcFollow('don6', false); G.removeNPC('don6'); } }

// ------------------------------------------------------------------ ⑤ 각국 백성 (41:57) · c6_sell keeps its old name (old saves)
const FAR6 = [['bySidon', '바다 건너 시돈에서 왔소. 은고리로 값을 치르겠소. 잘 달아 주시오.', 'far'], ['byEdom', '에돔 땅에서 왔습니다. 가나안도 기근이 아주 심하지요. 은 덩이가 이것뿐입니다.', { shape: '덩이' }], ['byMid6', '미디안 대상이오. 우리 은은 잘게 쪼갠 조각이오.', { shape: '조각' }]]; /* v18.80 one weighing; the other two: the silver's shape for the ledger */
CH6.c6_sell = { ch: 7, obj: S => `성읍 곳간 · 먼 나라 사람들에게 팔기 (${FAR6.filter(([id]) => (C6(S).sold || {})[id]).length}/3)`,
  list: S => FAR6.map(([id], i) => ({ t: ['시돈 상인 · 은고리 달기', '에돔 목자 · 은 모양 살피기', '미디안 대상 · 은 모양 살피기'][i], ok: !!(C6(S).sold || {})[id] })),
  enter(S, G, re) { const g = GRA6('A'); if (!G.npc('byMid6')) G.spawnNPC({ id: 'byMid6', name: '미디안 대상', look: LOOK.midian, x: g.x - 2.6, z: g.z + 8.6, face: Math.PI, noBond: true }); if (!re) narr([{ kick: '창세기 41:57', title: '각국 백성', t: '각국 백성도 양식을 사려고 애굽으로 들어와 요셉에게 이르렀으니, 기근이 온 세상에 심함이었더라.', ref: '창세기 41:57' }]); },
  target: S => { const f = FAR6.find(([id]) => !(C6(S).sold || {})[id]); return f ? 'npc:' + f[0] : null; },
  check: S => FAR6.every(([id]) => (C6(S).sold || {})[id]), done(S, G, next) { const G2 = Gm(); if (G2.npc('byMid6')) G2.removeNPC('byMid6'); cinBrothers(S, G, next); }, next: 'g1_spy',
  talk: Object.fromEntries(FAR6.map(([id, line, how]) => [id, (S, G) => { if ((C6(S).sold || {})[id]) return false; sell6(S, G, id, [N(id, line)], how); }])) };

// ------------------------------------------------------------------ ⑥ the brothers (42:1–9) · only the Bible's words, ending where he remembers the dreams
function cinBrothers(S, G, next) { /* v18.78 (redeclared) */
  const heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4), gx = 16, gz = -58, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6, road = [104, 46], rh = hAt(road[0], road[1]);
  cine([
    { hour: 9, fn: () => { S.q.heb2 = 1; S.q.broShow = 1; BRO.forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI)); place('jacob', heb[0], heb[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('benjamin2', heb[0] + 2.2, heb[1] + 2.4, -0.4); },
      cam: [heb[0] + 4.4, hh + 1.8, heb[1] + 9.6], look: [heb[0], hh + 1.2, heb[1] + 3.4], dur: 7, music: 'j_mourn', t: '때에 야곱이 애굽에 곡식이 있음을 보고 아들들에게 이르되,', ref: '창세기 42:1' },
    { cam: [heb[0] - 1.4, hh + 1.6, heb[1] + 5], look: [heb[0], hh + 1.4, heb[1] + 2.6], dur: 8, n: '야곱', t: '너희는 어찌하여 서로 관망만 하느냐. 내가 들은즉 저 애굽에 곡식이 있다 하니, 너희는 그리로 가서 거기서 우리를 위하여 사오라. 그리하면 우리가 살고 죽지 아니하리라.', ref: '창세기 42:1–2', e: 'weary' },
    { cam: [heb[0] + 3.6, hh + 1.4, heb[1] + 1.4], look: [heb[0] + 2.2, hh + 1.5, heb[1] + 2.4], dur: 8, t: '요셉의 형 십 인이 애굽에서 곡식을 사려고 내려갔으나, 야곱이 요셉의 아우 베냐민을 그 형들과 함께 보내지 아니하였으니, 이는 그의 말이 재난이 그에게 미칠까 두렵다 함이었더라.', ref: '창세기 42:3–4' },
    { fn: () => { S.q.heb2 = 0; BRO.forEach((id, i) => place(id, road[0] - i * 2.2, road[1] + (i % 2) * 1.2, -1.57)); }, cam: [road[0] + 6, rh + 3, road[1] + 9], cam2: [road[0] - 4, rh + 3.4, road[1] + 10], look: [road[0] - 8, rh + 1.2, road[1]], dur: 8, music: 'j_egypt', t: '이스라엘의 아들들이 양식 사러 간 자 중에 섞여 갔으니, 가나안 땅에 기근이 있음이라.', ref: '창세기 42:5' },
    { fn: () => { G.teleport(jx, jz, 0); BRO.forEach((id, i) => place(id, gx - 4.5 + (i % 5) * 2.2, gz + 4 + Math.floor(i / 5) * 1.8, Math.PI)); ['byFarmer', 'byWoman', 'buyElder', 'bySidon', 'byEdom'].forEach(id => G.npcShow(id, false)); },
      cam: [gx + 8, gh + 2.6, gz + 12], cam2: [gx + 5, gh + 2, gz + 9], look: [gx, gh + 1.2, gz + 2], dur: 7, music: 'j_finale', t: '때에 요셉이 나라의 총리로서 그 땅 모든 백성에게 팔더니, 요셉의 형들이 와서', ref: '창세기 42:6' },
    { fn: () => BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: -i * 0.15, dur: 14, amb: true }; } }), cam: [jx + 0.8, gh + 2.8, jz - 2.8], look: [gx, gh + 0.3, gz + 5], dur: 9, t: '그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { cam: [jx - 1.2, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.55, t: '요셉이 보고 형들인 줄 아나, 모르는 체하고 엄한 소리로 그들에게 말하여', ref: '창세기 42:7' },
    { cam: [jx + 1.6, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '너희가 어디서 왔느냐?', ref: '창세기 42:7', e: 'cold' },
    { fn: () => { const n = G.npc('judah'); if (n) { n.emote = null; n.act = 'kneelRest'; } }, cam: [gx - 2, gh + 1.2, gz + 1.6], look: [gx - 0.1, gh + 0.9, gz + 4], dur: 6, n: '형들', t: '곡물을 사려고 가나안에서 왔나이다.', ref: '창세기 42:7', e: 'fear' },
    { cam: [jx + 0.8, gh + 1.6, jz + 0.9], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.5, t: '요셉은 그 형들을 알아보나, 그들은 요셉을 알지 못하더라.', ref: '창세기 42:8' },
    { fn: () => { RT.dreamFx = 'sheaves'; RT.dreamK = 0; }, cam: [DREAM.x + 3.6, hAt(DREAM.x, DREAM.z) + 1.2, DREAM.z + 3.6], cam2: [DREAM.x + 2.8, hAt(DREAM.x, DREAM.z) + 1.6, DREAM.z + 2.8], look: [DREAM.x, hAt(DREAM.x, DREAM.z) + 0.8, DREAM.z], dur: 9, fadeIn: 1,
      each: t => { RT.dreamK = Math.min(1, t / 6); }, t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고', ref: '창세기 42:9' },
    { fn: () => { RT.dreamFx = null; GG.Audio && GG.Audio.sfx('insight', { pitch: 1.0, vol: 0.7 }); BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: 1.6 + i * 0.05, dur: 9, amb: true }; } }); }, cam: [gx + 1.4, gh + 0.55, gz + 8.5], cam2: [gx + 1.1, gh + 0.6, gz + 7.6], look: [jx, gh + 1.5, jz], dur: 6, fov: 0.6, fadeIn: 0.6, fadeOut: 1.6,
      t: '곡식 단들이 둘러서서 절하던 그 꿈이었어요.', ref: '창세기 37:7' },
  ], () => { GG.Game.musicOverride = null; npcSet('jacob', { look: LOOK.jacob }); const H = S.hero || { lvl: 1 };
    narr([{ kick: '나의 여정', title: `${S.day}일의 기록`, t: `배운 애굽 말 ${Object.keys(S.q.words || {}).length}개 · 지은 곳간 ${['granA', 'granB', 'granC'].filter(k => S.built[k]).length}채 · 곡식을 판 사람 ${Object.keys(C6(S).sold || {}).length}명 · 살펴서 알아낸 것 ${Object.keys(S.flags.lore || {}).length}개 · 만들어 본 요리 ${Object.keys(S.flags.dishes || {}).length}가지 · 체력 Lv ${H.lvl}`, ref: '' }], () => next()); });
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^c6_/.test(S.step || '')) return null; const st = S.step, c = C6(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c6_dry' && !c.nile) at(NILO6[0], NILO6[1], 3.4, { label: '나일 자로 물 높이 보기', key: 'c6Nile', use: () => nile6(S, G) });
  if (st === 'c6_open') { const g = GRA6('A'); if (!c.seal) at(g.x, g.z + 3.4, 3.6, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6Seal', use: () => seal6(S, G) }); else if (!c.look) at(g.x, g.z + 3.4, 3.6, { label: '곳간 곡식 한 줌 살피기', key: 'c6Look', use: () => look6(S, G) }); }
  if (st === 'c6_west') { const g = GRA6('B'); if (!c.wOpen) at(g.x, g.z + 3.4, 4, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6WOpen', use: () => open6(S, G, 'B', () => { c.wOpen = 1; GG.UI.quest(); }) });
    else if (c.wMet && (c.post || 0) < 2) { if (!S.q.c6carry) at(g.x - 6, g.z + 5, 3, { label: (c.post || 0) === 0 ? '짐수레에서 됫박 들기' : '짐수레에서 저울 들기', key: 'c6Take', use: () => { S.q.c6carry = 1; p.carry = 'basket'; act('pick', 0.8); } });
      else at(g.x + 6, g.z + 4, 3, { label: (c.post || 0) === 0 ? '둘째 자리에 됫박 놓기' : '둘째 자리에 저울 세우기', key: 'c6Put', use: () => { S.q.c6carry = 0; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.5 }); c.post = (c.post || 0) + 1; GG.UI.quest(); if (c.post >= 2) GG.UI.toast('둘째 파는 자리가 섰어요 · 줄의 반이 이쪽으로 왔어요'); } }); }
    else if ((c.post || 0) >= 2 && !c.wSold) at(g.x + 6, g.z + 4, 3.2, { label: '새 자리로 줄 나누기', key: 'c6WSell', use: () => sell6(S, G, 'west2', [T('곳간 앞 줄이 마을 끝까지 늘어서 있어요.')], 'queue', () => { c.wSold = 1; GG.UI.quest(); G.checkStep(); }) }); }
  if (st === 'c6_south') { const g = GRA6('C'); if (!c.sOpen) at(g.x, g.z + 3.4, 4, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6SOpen', use: () => open6(S, G, 'C', () => { c.sOpen = 1; GG.UI.quest(); }) });
    else if (!c.load) at(g.x, g.z + 3.4, 5, { label: '나귀에 곡식 자루 싣기', key: 'c6Load', use: () => { donkey6(true); MG6('balance', { title: '나귀 짐 싣기', hint: '자루를 나귀 양쪽에 고르게 실어요. 한쪽으로 기울면 나귀가 비틀거려요.', dur: 9 }, () => { c.load = 1; GG.UI.toast('나귀가 따라와요 · 언덕 아래 강가 마을까지 끌고 가요'); GG.UI.quest(); }); } });
    else if (!c.down) { const d = Math.hypot(RIVER6[0] - p.x, RIVER6[1] - p.z); if (d < 9) { c.down = 1; GG.UI.toast('강가 마을에 닿았어요'); GG.UI.quest(); } }
    else if (!c.sSold) at(RIVER6[0], RIVER6[1], 5, { label: '나귀 짐에서 자루 내려 팔기', key: 'c6SSell', use: () => sell6(S, G, 'south2', [T('언덕을 오를 힘이 없던 강가 마을 사람들이 나귀 곁으로 모여들었어요.')], 'unload', () => { c.sSold = 1; GG.UI.quest(); G.checkStep(); }) }); }
  return out.length ? out : null; });
function ch6Tick(dt, S) { if (!S || S.step !== 'c6_dry') return; try { const c = C6(S); if (c.nile && !c.cry && !GG.UI.busy() && !GG.Cine.on && Gm().dist(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 10) < 14) cry6(S, Gm()); if (!Gm().npc('cr6_0')) crowd6(true); } catch (e) { console.error('ch6', e); } }

// ------------------------------------------------------------------ the side story after the main one: the old servant Ameni (moved out of chapter 6 · it is not in the Bible)
EP_TALK6: { const t0 = talk.byAmeni; talk.byAmeni = function (S, G) { if (S.step !== 'j_end' || S.flags.ameniMet) return t0 ? t0(S, G) : false;
    say([T('곁이야기 · 늙은 종 아메니'), N('ameni', '총리님께 곡식을 사러 왔습니다. 보디발 나리 댁에서… 얘야? 너… 요셉이냐?', '', 'awe'), J('아메니! 아메니 할아버지!', '', 'happy'), T('요셉은 총리의 자리에서 내려와, 늙은 종을 끌어안았습니다.'),
      N('ameni', '네 하나님이… 정말로 너와 함께 하셨구나. 그 구덩이에서도, 그 옥에서도.', '', 'cry'), J('할아버지가 가르쳐 주신 애굽 말로 바로 앞에서 말했어요. 엠 헤테프, 아메니. 평안히.', '', 'tender'), T('(이 만남은 성경에 기록되지 않은 「IF」 이야기예요.)')],
      () => { S.flags.ameniMet = 1; G.heart && G.heart(1); GG.UI.pop && GG.UI.pop('곁이야기', '늙은 종 아메니를 다시 만났어요', 'heart'); }); }; }

// ------------------------------------------------------------------ put the steps in order (c6_dry first · the rest keep their names for old saves)
{ const keys = Object.keys(steps), cut = keys.indexOf('c6_open'), tail = keys.slice(cut).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c6_dry = CH6.c6_dry; steps.c6_open = Object.assign({}, CH6.c6_open); steps.c6_west = CH6.c6_west; steps.c6_south = CH6.c6_south; steps.c6_sell = CH6.c6_sell;
  for (const [k, v] of tail) { if (k === 'c6_open' || k === 'c6_sell') continue; steps[k] = v; }
  ORDER = Object.keys(steps); }
// =================================================================== v18.78 7장 손보기 · 「형제들」 (e_ch7.js)
/* ① 42:14–17을 넣었어요: 요셉의 시험(「바로의 생명으로 맹세하노니」) → 사흘 동안 옥에 가둠 → 실제로 사흘을 기다려요 → 사흘째 옥으로 가서 42:18–24
   ② 「옥에 갇힌 시므온 찾아가기」(성경에 없음)는 뺐어요. 유다의 약속 장면(43:1–14)은 형들이 떠난 장면 뒤로 옮겼어요.
   ③ 「조금 더 엄하게 대한다」 고르기(성경에 없음)를 뺐어요. 45:1 말씀대로 「모든 사람은 내게서 물러가라」만.
   ④ 청지기에게 이르기의 틀린 답 설명에서 요셉의 속마음(성경에 없음)을 뺐어요. */
const SPY7 = S => S.q.spy7 || (S.q.spy7 = {});
const prisonRow7 = () => { const [yx, yz] = SPOTS.yard; brosRow(yx + 1, yz + 1.5, 0); BRO.forEach(id => { const n = Gm().npc(id); if (n) { n.act = 'kneelRest'; n.emote = null; } }); };
function cinSpies(S, G, next) { /* v18.78 (redeclared): 42:9–17 · the test and the three days */ const [gx, gz] = G7GRAN, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6, [yx, yz] = SPOTS.yard, yh = hAt(yx, yz);
  cine([
    { hour: 10, fn: () => { ageBrothers(); S.q.broShow = 1; G.teleport(jx, jz, 0); brosRow(gx, gz + 4, Math.PI); },
      cam: [gx + 6, gh + 2.2, gz + 9], look: [gx, gh + 1.2, gz + 3], dur: 6, music: 'j_mourn', t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고 그들에게 이르되,', ref: '창세기 42:9' },
    { cam: [jx + 1.4, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 6, n: '요셉', t: '너희는 정탐들이라. 이 나라의 틈을 엿보려고 왔느니라.', ref: '창세기 42:9', e: 'cold' },
    { cam: [gx - 2, gh + 1.3, gz + 1.8], look: [gx - 0.6, gh + 1.1, gz + 4], dur: 9, n: '형들', t: '내 주여 아니니이다. 당신의 종들은 곡물을 사러 왔나이다. 우리는 다 한 사람의 아들들로서 확실한 자니이다. 당신의 종들은 정탐이 아니니이다.', ref: '창세기 42:10–11', e: 'fear' },
    { cam: [jx + 1.2, gh + 1.7, jz + 1.3], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '아니라, 너희가 이 나라의 틈을 엿보러 왔느니라.', ref: '창세기 42:12', e: 'cold' },
    { cam: [gx + 2, gh + 1.3, gz + 1.9], look: [gx + 0.4, gh + 1.1, gz + 4], dur: 9, n: '형들', t: '당신의 종 우리들은 열두 형제로서 가나안 땅 한 사람의 아들들이라. 말째는 오늘 아비와 함께 있고 하나는 없어졌나이다.', ref: '창세기 42:13', e: 'fear' },
    { cam: [jx + 0.9, gh + 1.7, jz + 1.1], look: [jx, gh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '내가 너희에게 이르기를 너희는 정탐들이라 한 말이 이것이니라. 너희는 이같이 하여 시험을 받을지니, 바로의 생명으로 맹세하노니 너희 말째 아우가 여기 오지 아니하면 너희가 이곳에서 떠나지 못하리라.', ref: '창세기 42:14–15', e: 'cold' },
    { cam: [jx - 1.1, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '너희 중 하나를 보내어 너희 아우를 데려오게 하고 너희는 갇히어 있으라. 내가 너희 말을 시험하여 너희 중에 진실이 있는지 보리라. 바로의 생명으로 맹세하노니 그리하지 아니하면 너희는 과연 정탐이니라.', ref: '창세기 42:16', e: 'cold' },
    { fn: () => prisonRow7(), cam: [yx + 7, yh + 2.4, yz + 8], cam2: [yx + 5, yh + 2, yz + 6], look: [yx + 1, yh + 0.8, yz + 1.5], dur: 7, music: 'j_court', t: '그들을 다 함께 삼 일을 가두었더라.', ref: '창세기 42:17', fadeOut: 1.4 },
  ], () => { SPY7(S).day = S.day; GG.UI.quest(); next && next(); });
}
function cinSpiesB(S, G, next) { /* 42:18–24 · on the third day, at the prison where Joseph himself was once kept */ const [yx, yz] = SPOTS.yard, yh = hAt(yx, yz), jx = yx + 1, jz = yz - 2.4;
  cine([
    { hour: 9, fn: () => { prisonRow7(); G.teleport(jx, jz, 0); BRO.forEach(id => { const n = G.npc(id); if (n) n.act = null; }); }, cam: [yx + 6, yh + 2.6, yz + 7], look: [yx + 1, yh + 1, yz], dur: 6, t: '사흘 만에 요셉이 그들에게 이르되,', ref: '창세기 42:18' },
    { cam: [jx + 0.9, yh + 1.7, jz + 1.1], look: [jx, yh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '나는 하나님을 경외하노니 너희는 이같이 하여 생명을 보전하라. 너희가 확실한 자이면 너희 형제 중 한 사람만 너희 갇혔던 옥에 갇히게 하고, 너희는 곡식을 가지고 가서 너희 집의 굶주림을 구하고, 너희 말째 아우를 내게로 데리고 오라. 그러면 너희 말이 진실하게 되고 너희가 죽지 아니하리라.', ref: '창세기 42:18–20', e: 'calm' },
    { cam: [yx + 2.6, yh + 1.4, yz + 4], look: [yx + 1, yh + 1.1, yz + 1.6], dur: 10, n: '형들', t: '우리가 아우의 일로 인하여 범죄하였도다. 그가 우리에게 애걸할 때에 그 마음의 괴로움을 보고도 듣지 아니하였으므로 이 괴로움이 우리에게 임하도다.', ref: '창세기 42:21', e: 'sad' },
    { cam: [yx + 3, yh + 1.4, yz + 4.4], look: [yx + 1, yh + 1.2, yz + 1.6], dur: 9, n: '르우벤', t: '내가 너희에게 그 아이에게 죄를 짓지 말라 하지 아니하였더냐. 그래도 너희가 듣지 아니하였느니라. 그러므로 그의 핏값을 치르게 되도다.', ref: '창세기 42:22', e: 'sad' },
    { fn: () => cpose('weep', 6), cam: [jx - 3, yh + 1.5, jz - 2.4], look: [jx, yh + 1.4, jz], dur: 7, t: '그들 사이에 통역을 세웠으므로 그들은 요셉이 듣는 줄을 알지 못하였더라. 요셉이 그들을 떠나가서 울고,', ref: '창세기 42:23–24' },
    { fn: () => { cpose(null); const n = G.npc('simeon'); if (n) { n.emote = null; n.act = 'kneelRest'; } }, cam: [yx - 0.6, yh + 1.6, yz + 0.4], look: [yx - 1.5, yh + 0.9, yz + 1.6], dur: 7, t: '다시 돌아와서 그들과 말하다가 그들 중에서 시므온을 끌어내어 그들의 눈앞에서 결박하고', ref: '창세기 42:24', fadeOut: 1.2 },
  ], () => { const n = G.npc('simeon'); if (n) n.act = null; hide(['simeon']); BRO.forEach(id => { const m = G.npc(id); if (m && id !== 'simeon') m.act = null; }); G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0); SPY7(S).b = 1; GG.UI.quest(); next && next(); });
}
const spyLeft7 = S => { const d = SPY7(S).day; return d === undefined ? 0 : Math.max(0, d + 2 - S.day); };
Object.assign(steps.g1_spy, {
  obj: S => { const c = SPY7(S); if (c.day === undefined) return '정탐이라 하기'; if (!c.b) return spyLeft7(S) ? `형들이 옥에 갇혀 있어요 · 사흘째까지 ${spyLeft7(S)}일 (곁이야기를 해도 돼요)` : '사흘째 · 옥으로 가서 형들 앞에 서기'; return '청지기에게 형들의 자루를 채우라 이르기'; },
  list: S => { const c = SPY7(S); return [{ t: '사흘 동안 기다리기', ok: c.day !== undefined && !spyLeft7(S) }, { t: '사흘째 옥으로 가기', ok: !!c.b }, { t: '청지기에게 이르기', ok: qd(S, 'sacks') }]; },
  enter(S, G, re) { ageBrothers(); const c = SPY7(S); if (!re && c.day === undefined) cinSpies(S, G, () => G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0)); else if (!c.b) { S.q.broShow = 1; prisonRow7(); } },
  target: S => { const c = SPY7(S); if (!c.b) return spyLeft7(S) ? null : { x: GATE3[0], z: GATE3[1] - 2 }; return 'npc:steward2'; },
  next: 'g3_feast', done(S, G, next) { cinDepart(S, G, () => { hide(['simeon']); cinJudahPledge(S, G, next); }); } });
{ const t0 = steps.g1_spy.talk.steward2; steps.g1_spy.talk.steward2 = function (S, G) { if (!SPY7(S).b) return false; const say0 = GG.UI.say; GG.UI.say = function (lines, done) { lines = lines.map(l => l && l.t && /형들의 마음이 변했는지/.test(l.t) ? Object.assign({}, l, { t: '요셉이 명한 것은 곡물을 그 그릇에 채우게 하는 것이었어요.', ref: '창세기 42:25' }) : l); return say0.call(this, lines, done); }; try { return t0.call(this, S, G); } finally { GG.UI.say = say0; } }; }
/* the old Simeon visit (not in the Bible) is gone: an old save there goes on to Judah's pledge and the feast */
Object.assign(steps.g2_simeon, { obj: '형들이 가나안으로 돌아갔어요', talk: {}, check: () => false, target: null, enter(S, G) { hide(['simeon']); setTimeout(() => cinJudahPledge(S, G, () => G.go('g3_feast')), 80); } });
/* 45:1 only: 「모든 사람은 내게서 물러가라」 (no 「a little harsher」) */
Object.assign(steps.g5_reveal, { enter(S, G, re) { atHouse(S); G.teleport(G7HOUSE[0], G7HOUSE[1], 0);
  setTimeout(() => { if (Gm().S().step !== 'g5_reveal') return; say([T('요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리 질러', '창세기 45:1'), { n: '', t: '요셉이 외쳤어요.', choices: [{ t: '「모든 사람은 내게서 물러가라」', then: () => tick(Gm().S(), 'revealJ') }] }], null); }, re ? 900 : 300); } });
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || S.step !== 'g1_spy' || G.cineOn || GG.UI.busy()) return null; const c = SPY7(S); if (c.day === undefined || c.b || spyLeft7(S)) return null;
  const d = Math.hypot(GATE3[0] - p.x, GATE3[1] - 2 - p.z); if (d > 4) return null; return [{ d: d - 0.8, x: GATE3[0], z: GATE3[1] - 2, y: 1, story: true, noMagnet: true, key: 'g1Prison', label: '옥에 들어가 형들 앞에 서기 (사흘째)', use: () => cinSpiesB(S, G, () => G.checkStep()) }]; });
// =================================================================== v18.79 7장 나머지 · 8장 「고센 땅」 (e_ch8.js · 설계표_7장8장_v18_78.md)
/* 창 43:15 – 47:26. 메인은 성경만: 요셉 · 야곱 · 형들 · 바로 · 청지기 · 애굽 백성의 말은 성경 말씀 그대로예요(서기 · 마구간지기 같은 배경 사람만 짧게 일 이야기를 해요).
   같은 일을 되풀이하지 않게, 장면마다 손으로 하는 일이 달라요.
   7장: 베냐민과 온 형들 → 청지기 · 시므온이 풀려남 → 세 상 따로 차리기 → 정오(예물 · 절 · 안부 · 베냐민) → 안방에서 울고 얼굴 씻기 → 「음식을 차리라」
        → 나이 차례(어머니별 다섯 무리) → 다섯 배의 몫 → 은잔(말씀 한 번) → 자루 뒤지기 · 44:15–17 → 유다의 간청 → 「나는 요셉이라」(45:9–13 더함)
   8장: 바로의 명령(궁) → 수레 끌어내기 · 멍에 → 옷 · 베냐민의 은 삼백 → 나귀 스무 필 살피기 → 「노중에서 다투지 말라」 → 가나안 · 브엘세바 · 수레에 탄 집안 · 일흔 사람
        → 유다가 먼저 옴 → 수레에 말 매기 → 고센 만남 · 46:31–34 → 형 다섯과 궁으로 · 47:1–6 → 아버지와 천천히 걸어 · 47:7–10 → 라암세스 문서에 인 · 식구를 따라 양식
        → 흉년의 다섯 가지 일(47:13–26: 은 · 가축 · 땅 · 씨앗 · 법) → 47:27 에필로그 */
const C8 = S => S.q.c8 || (S.q.c8 = {});
const MG8 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const HX8 = G7HOUSE[0], HZ8 = G7HOUSE[1];
const ROOM8 = [24, -136], STACK8 = [19, -138.4];
const TAB8 = { j: { x: HX8, z: HZ8 + 4.3, n: '요셉의 상', d: '요셉은 따로 먹어요' }, h: { x: HX8, z: HZ8 + 6, n: '형제들의 상', d: '히브리 사람인 형제들은 따로 먹어요' }, e: { x: HX8 + 7.2, z: HZ8 + 4.6, n: '애굽 사람의 상', d: '애굽 사람은 히브리 사람과 같이 먹지 않아요' } };
const SEAT8 = i => [HX8 - 6 + i * 1.2, HZ8 + 7];
const WAIT8 = [3, 7, 0, 9, 5, 1, 10, 4, 8, 2, 6]; /* (the brothers stand about in no order until they are seated) */
const WAG8 = [[34, -118], [38.5, -118]], OXT8 = [36, -123.5];
const LINE8 = { x0: 4, x1: 26, z: -113 };
const PALG8 = [-30, -134], COURT8 = SPOTS.court, OFFICE8 = [-14, -205], TREAS8 = [-30, -151], STABLE8 = [38, -127], FIELD8 = [-62, -141], LAW8 = [-23, -133];
const FIVE8 = ['reuben', 'judah', 'levi', 'asher', 'benjamin2'];
const PHAR8 = () => [-30, hAt(-30, -177) + 2, -177.2];
const bros10 = () => BRO.filter(id => id !== 'simeon').concat(['benjamin2']);
const spawn8 = (id, o) => { const G = Gm(); if (!G.npc(id)) G.spawnNPC(Object.assign({ id, noTalk: true, noTag: true, noBond: true }, o)); return G.npc(id); };
const kill8 = re => { const G = Gm(); for (const id of Object.keys(G.ENT.npcs)) if (re.test(id)) { G.npcFollow(id, false); G.removeNPC(id); } };
const near8 = (x, z, r) => Gm().dist(x, z) < r;

// ------------------------------------------------------------------ 7장 · 첫째 마디 · 다시 내려옴 (43:15–25)
const S8 = {};
S8.g3_return = { ch: 8, obj: S => { const c = C8(S), n = Object.keys(c.tb || {}).length; return !c.met ? '성읍 곳간 앞 · 다시 온 형들' : n < 3 ? `잔칫방 · 상 셋을 따로 차리기 (${n}/3)` : '정오 · 형들을 맞기 (앞마당)'; },
  list: S => { const c = C8(S), t = c.tb || {}; return [{ t: '곳간 앞에서 형들을 보기', ok: !!c.met }].concat(['j', 'h', 'e'].map(k => ({ t: TAB8[k].n + ' 놓기', ok: !!t[k] }))).concat([{ t: '정오 · 형들을 맞기', ok: !!c.noonGo }]); },
  enter(S, G, re) { ageBrothers(); stage8(S, true); if (!re && !C8(S).met) narr([{ kick: '창세기 43:15', title: '다시 애굽으로', t: '그 사람들이 예물을 마련하고 갑절의 돈을 자기들의 손에 가지고 베냐민을 데리고 일어나 애굽에 내려가서 요셉 앞에 서니라.', ref: '창세기 43:15' }]); },
  target: S => { const c = C8(S); if (!c.met) return { x: G7GRAN[0], z: G7GRAN[1] - 1.6 }; const t = c.tb || {}; if (Object.keys(t).length < 3) { const k = S.q.c8carry; return k && TAB8[k] ? { x: TAB8[k].x, z: TAB8[k].z - 0.9 } : { x: STACK8[0], z: STACK8[1] }; } return { x: HX8, z: HZ8 + 2.4 }; },
  check: S => !!C8(S).noonGo, next: 'g3_feast' };
function cine8Return(S, G) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz), dx = HX8, dz = HZ8 - 5.2, dh = hAt(dx, dz); C8(S).met = 1;
  cine([
    { hour: 9, fn: () => { G.teleport(gx, gz - 1.6, 0); showAt('steward2', gx + 1.8, gz - 1.4, -0.8); }, cam: [gx + 6, gh + 2.4, gz + 10], look: [gx, gh + 1.2, gz + 3.6], dur: 6, music: 'j_finale', t: '요셉은 베냐민이 그들과 함께 있음을 보고', ref: '창세기 43:16' },
    { cam: [gx + 1.2, gh + 1.7, gz - 0.2], look: [gx, gh + 1.6, gz - 1.6], dur: 8, fov: 0.55, n: '요셉', t: '이 사람들을 집으로 인도해 들이고 짐승을 잡고 준비하라. 이 사람들이 오정에 나와 함께 먹을 것이니라.', ref: '창세기 43:16' },
    { fn: () => { bros10().forEach((id, i) => showAt(id, dx - 6 + (i % 6) * 2.2, dz + 3 + Math.floor(i / 6) * 1.6, Math.PI)); showAt('steward2', dx, dz + 0.6, 0); },
      cam: [dx + 7, dh + 2.6, dz + 9], look: [dx, dh + 1.2, dz + 2], dur: 7, fadeIn: 0.8, t: '그 사람이 요셉의 명대로 하여 그 사람들을 요셉의 집으로 인도하니, 그 사람들이 요셉의 집으로 인도되매 두려워하여 이르되', ref: '창세기 43:17–18' },
    { cam: [dx - 2.4, dh + 1.5, dz + 6.4], look: [dx - 1, dh + 1.3, dz + 3.4], dur: 8, n: '형들', t: '전번에 우리 자루에 들어 있던 돈의 일로 우리가 끌려 드는도다. 이는 틈을 타서 우리에게 달려들어 우리를 잡아 노예를 삼고 우리 나귀를 빼앗으려 함이로다.', ref: '창세기 43:18', e: 'fear' },
    { cam: [dx + 1.6, dh + 1.5, dz + 5.6], look: [dx, dh + 1.4, dz + 3], dur: 9, n: '형들', t: '내 주여, 우리가 전번에 내려와서 양식을 사가지고 여관에 이르러 자루를 푼즉 각 사람의 돈이 그 자루 아구에 있고 그 중수가 여전하기로 우리 손에 도로 가져왔고, 양식 살 다른 돈도 우리 손에 가지고 내려왔나이다. 우리의 돈을 누가 우리 자루에 넣었는지 우리가 알지 못하나이다.', ref: '창세기 43:20–22', e: 'fear' },
    { cam: [dx + 1.2, dh + 1.6, dz + 2.4], look: [dx, dh + 1.5, dz + 0.6], dur: 9, n: '요셉의 청지기', t: '너희는 안심하라, 두려워 말라. 너희 하나님, 너희 아버지의 하나님이 재물을 너희 자루에 넣어 너희에게 주신 것이니라. 너희 돈은 내가 이미 받았느니라.', ref: '창세기 43:23', e: 'calm' },
    { fn: () => { showAt('simeon', dx + 12, dz + 1.6, -1.57); walkTo('simeon', dx + 7.6, dz + 3.4, 1.1); }, cam: [dx + 1, dh + 1.9, dz + 9.4], look: [dx + 6.4, dh + 1.1, dz + 2.8], dur: 8, t: '하고 시므온을 그들에게로 이끌어내고', ref: '창세기 43:23' },
    { fn: () => { bros10().concat(['simeon']).forEach(id => { const n = G.npc(id); if (n) { n.walk = null; n.sit = true; } }); }, cam: [dx + 5, dh + 2, dz + 7.4], look: [dx, dh + 0.7, dz + 3], dur: 8, t: '그들을 요셉의 집으로 인도하고 물을 주어 발을 씻기며 그 나귀에게 먹이를 주더라.', ref: '창세기 43:24' },
    { cam: [dx - 4, dh + 2.4, dz + 8], look: [dx, dh + 1, dz + 1], dur: 7, fadeOut: 1.2, t: '그들이 거기서 먹겠다 함을 들었으므로 예물을 정돈하고 요셉이 정오에 오기를 기다리더니', ref: '창세기 43:25' },
  ], () => { hide(BRO11); showAt('steward2', 15, -138.6, -0.6); G.teleport(STACK8[0] - 1.6, STACK8[1] + 3, Math.PI); GG.UI.quest(); setTimeout(() => GG.UI.toast('정오 전에 · 앞마당에 상 셋을 따로 차려요 (창세기 43:32)', true), 600); });
}

// ------------------------------------------------------------------ 7장 · 둘째 마디 · 정오의 잔치 (43:26–34)
S8.g3_feast = { ch: 8, obj: S => { const c = C8(S); return !c.wept ? '울 곳을 찾아 · 안방으로' : !c.washed ? '안방 대야에서 얼굴 씻기' : !c.serve ? '앞마당으로 나가 「음식을 차리라」' : !c.seated ? '형들을 나이 차례로 앉히기' : '요셉의 상에서 몫 보내기'; },
  list: S => { const c = C8(S); return [{ t: '안방에서 울기', ok: !!c.wept }, { t: '얼굴 씻기', ok: !!c.washed }, { t: '「음식을 차리라」', ok: !!c.serve }, { t: '나이 차례로 앉히기', ok: !!c.seated }, { t: '몫 보내기 (베냐민은 다섯 배)', ok: !!c.portion }]; },
  enter(S, G, re) { const c = C8(S); if (Object.keys(c.tb || {}).length < 3) c.tb = { j: 1, h: 1, e: 1 }; /* (an old save: the tables stand ready) */ S.q.broShow = 1; S.q.famShow = 1; ageBrothers(); if (!c.noon) cine8Noon(S, G); else stage8(S, true); },
  target: S => { const c = C8(S); if (!c.wept) return { x: ROOM8[0] - 0.6, z: ROOM8[1] + 0.3 }; if (!c.washed) return { x: ROOM8[0] + 0.4, z: ROOM8[1] - 0.2 }; if (!c.serve) return { x: HX8, z: HZ8 + 2.6 }; if (!c.seated) return { x: HX8, z: HZ8 + 5 }; return { x: TAB8.j.x, z: TAB8.j.z - 0.9 }; },
  check: S => !!C8(S).portion, done(S, G, next) { cinMarvel(S, G, next); }, next: 'g4_cup' };
function bros8Wait() { const G = Gm(); BRO11.forEach((id, i) => { const k = WAIT8[i], n = showAt(id, HX8 - 6 + k * 1.2 + (k % 2) * 0.3, HZ8 + 9.4 + (k % 3) * 0.5, Math.PI); if (n) { n.sit = false; n.act = null; } }); }
function seatAll8() { BRO11.forEach((id, i) => { const [x, z] = SEAT8(i); showAt(id, x, z, Math.PI, { sit: true }); }); }
function cine8Noon(S, G) { const c = C8(S), hh = hAt(HX8, HZ8 + 4); c.noon = 1;
  cine([
    { hour: 12, fn: () => { G.teleport(HX8, HZ8 + 1.4, 0); bros8Wait(); BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'prostrate', t: -i * 0.1, dur: 8, amb: true }; }); }, cam: [HX8 + 7, hh + 2.8, HZ8 + 15], look: [HX8, hh + 1, HZ8 + 7], dur: 8, music: 'j_finale', t: '요셉이 집으로 오매 그들이 집으로 가지고 들어온 예물을 그 앞에 드리고 땅에 엎드려 절하니', ref: '창세기 43:26' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }), cam: [HX8 + 1.6, hh + 1.6, HZ8 + 3.4], look: [HX8, hh + 1.5, HZ8 + 1.4], dur: 7, fov: 0.55, n: '요셉', t: '너희 아비 너희가 말하던 그 노인이 안녕하시냐? 지금까지 생존하였느냐?', ref: '창세기 43:27' },
    { cam: [HX8 - 3, hh + 1.6, HZ8 + 6], look: [HX8 - 1, hh + 1.2, HZ8 + 9.6], dur: 7, n: '형들', t: '주의 종 우리 아비가 평안하고 지금까지 생존하였나이다.', ref: '창세기 43:28' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'bow', t: -i * 0.08, dur: 3 }; }), cam: [HX8 + 4, hh + 2, HZ8 + 6], look: [HX8, hh + 0.9, HZ8 + 9.6], dur: 5, t: '하고 머리 숙여 절하더라.', ref: '창세기 43:28' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) b.face = Math.atan2(G.P.x - b.x, G.P.z - b.z); }, at: () => { const b = G.npc('benjamin2'); return b ? { look: [b.x, hAt(b.x, b.z) + 1.5, b.z], cam: [b.x - Math.sin(b.face) * -2.2 + 0.6, hAt(b.x, b.z) + 1.6, b.z + Math.cos(b.face) * 2.2] } : null; }, cam: [HX8 + 2, hh + 1.6, HZ8 + 7.4], look: [HX8 + 2, hh + 1.5, HZ8 + 9.6], dur: 9,
      n: '요셉', t: '너희가 내게 말하던 너희 작은 동생이 이냐? …소자여, 하나님이 네게 은혜 베푸시기를 원하노라.', ref: '창세기 43:29', e: 'tender' },
    { fn: () => cpose('weep', 5), cam: [HX8 + 1, hh + 1.6, HZ8 + 2.6], look: [HX8, hh + 1.5, HZ8 + 1.4], dur: 6, fov: 0.5, t: '요셉이 아우를 인하여 마음이 타는 듯하므로 급히 울 곳을 찾아', ref: '창세기 43:30' },
  ], () => { cpose(null); GG.UI.quest(); });
}
function weep8(S, G) { const [rx, rz] = ROOM8, h = hAt(rx, rz); G.teleport(rx - 0.4, rz + 0.2, Math.PI / 2);
  cine([{ fn: () => cpose('weep', 9), cam: [rx - 3.6, h + 1.5, rz + 0.8], cam2: [rx - 3, h + 1.5, rz + 0.6], look: [rx - 0.2, h + 1.2, rz + 0.1], dur: 8, music: 'j_mourn', t: '안방으로 들어가서 울고', ref: '창세기 43:30' }], () => { cpose(null); C8(S).wept = 1; GG.UI.quest(); }); }
function wash8(S, G) { const [rx, rz] = ROOM8, h = hAt(rx, rz); act('pick', 1.4); G.sfx('splash', { vol: 0.6 }); G.FX.burst(rx + 0.8, h + 0.95, rz, 16, { c: [0.6, 0.78, 0.92], sp: 0.7, up: 1, size: 0.05, g: 6, life: 0.6 });
  setTimeout(() => say([T('얼굴을 씻고 나와서 그 정을 억제하고', '창세기 43:31')], () => { C8(S).washed = 1; GG.UI.quest(); }), 900); }
function serve8(S, G) { const hh = hAt(HX8, HZ8 + 4); cine([{ fn: () => { G.teleport(HX8, HZ8 + 2.6, 0); C8(S).serve = 1; }, cam: [HX8 + 1.5, hh + 1.7, HZ8 + 4.2], look: [HX8, hh + 1.6, HZ8 + 2.6], dur: 5, fov: 0.55, n: '요셉', t: '음식을 차리라.', ref: '창세기 43:31' },
  { cam: [HX8 + 9, hh + 3.4, HZ8 + 13], look: [HX8, hh + 0.5, HZ8 + 5], dur: 6, t: '종들이 상 셋에 음식을 차렸어요.' }], () => GG.UI.quest()); }
const GROUP8 = [[['reuben', 'simeon', 'levi', 'judah'], '레아의 네 아들 · 르우벤 · 시므온 · 레위 · 유다'], [['dan', 'naphtali'], '빌하의 두 아들 · 단 · 납달리'], [['gad', 'asher'], '실바의 두 아들 · 갓 · 아셀'], [['issachar', 'zebulun'], '레아의 두 아들 · 잇사갈 · 스불론'], [['benjamin2'], '라헬의 아들 · 베냐민']];
function seat8(S, G) { const c = C8(S); let k = 0, seat = 0; const head = s => s.split(' · ')[0];
  const sitGroup = ids => ids.forEach(id => { const [x, z] = SEAT8(seat++); walkTo(id, x, z, 1.5, n => { n.sit = true; n.face = n.homeFace = Math.PI; }); });
  const ask = () => { if (k >= GROUP8.length) { c.seated = 1; GG.UI.quest(); setTimeout(() => say([T('그들이 요셉의 앞에 앉되 그 장유의 차서대로 앉히운바 되니 그들이 서로 이상히 여겼더라.', '창세기 43:33')], () => G.checkStep()), 1400); return; }
    if (k === GROUP8.length - 1) { say([T('마지막 자리에는 라헬의 아들, 막내 베냐민이 앉아요.')], () => { sitGroup(GROUP8[k][0]); k++; setTimeout(ask, 1500); }); return; } /* (one group left: no one-button question) */
    const right = GROUP8[k], opts = GROUP8.slice(k).map((g, i) => i === 0 ? { t: g[1], then: () => { sitGroup(g[0]); G.sfx('coin', { pitch: 1 + k * 0.05 }); k++; setTimeout(ask, 1500); } } : { t: g[1], ok: false, fb: `${head(g[1])}보다 ${head(right[1])}이 먼저 태어났어요.` }).sort(() => Math.random() - 0.5);
    say([{ n: '', t: k === 0 ? '맏아들 쪽 자리부터 · 누구를 먼저 앉힐까요?' : `다음 자리에는? (${k + 1}/5)`, choices: opts }], null); };
  say([T('앞에서부터 나이 차례로 앉혀요. 어머니별로 함께 태어난 형제들을 한 무리로 앉혀요.')], ask); }

function cinMarvel(S, G, next) { /* v18.79 (redeclared): 43:33 was just read at the seating, so the scene shows the three tables (43:32) and the portions (43:34) */ const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => { BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })); G.teleport(hx, hz + 3.4, 0); cpose('sitg', 40, true); showAt('steward2', hx + 8, hz + 4.6, -Math.PI / 2, { sit: true, act: 'eat' }); },
      cam: [hx - 9, hh + 3.2, hz + 2.6], look: [hx + 1, hh + 0.8, hz + 5.4], dur: 9, music: 'j_finale',
      t: '그들이 요셉에게 따로 하고 그 형제들에게 따로 하고 배식하는 애굽 사람에게도 따로 하니 애굽 사람은 히브리 사람과 같이 먹으면 부정을 입음이었더라.', ref: '창세기 43:32' },
    { cam: [hx + 6.6, hh + 1.3, hz + 5], look: [hx + 6, hh + 0.9, hz + 7], dur: 8, t: '요셉이 자기 식물로 그들에게 주되 베냐민에게는 다른 사람보다 오배나 주매, 그들이 마시며 요셉과 함께 즐거워하였더라.', ref: '창세기 43:34' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.act = null; } }); { const st = G.npc('steward2'); if (st) { st.sit = false; st.act = null; } } next && next(); });
}

// ------------------------------------------------------------------ 7장 · 셋째 마디 · 은잔 (44:1–17)
S8.g4_cup = { ch: 8, obj: S => !C8(S).cupCmd ? '청지기에게 이르기 (창세기 44:1–2)' : '밤이 지나고 · 새벽', target: 'npc:steward2',
  enter(S, G, re) { stage8(S, true); },
  talk: { steward2(S, G) { const c = C8(S); if (c.cupCmd) return false; say([J('양식을 각인의 자루에 운반할 수 있을 만큼 채우고 각인의 돈을 그 자루 아구에 넣고, 또 나의 잔 곧 은잔을 그 소년의 자루 아구에 넣고 그 양식 값 돈도 함께 넣으라.', '창세기 44:1–2')], () => { c.cupCmd = 1; GG.UI.quest(); cine8Night(S, G); }); } },
  check: S => !!C8(S).dawn, done(S, G, next) { cinCup8(S, G, () => cinPlea(S, G, next)); }, next: 'g5_reveal' };
function cine8Night(S, G) { const sx = HX8, sz = HZ8 - 3.6, h = hAt(sx, sz);
  cine([{ hour: 22, fn: () => { place('steward2', sx - 0.4, sz + 0.6, -1.57, { act: 'gather', vis: true }); G.teleport(HX8 + 8, HZ8 + 6, -2.4); }, cam: [sx - 8.4, h + 2.3, sz + 5.4], look: [sx - 3, h + 0.5, sz + 0.2], dur: 8, music: 'j_mourn', t: '그가 요셉의 명대로 하고', ref: '창세기 44:2' }],
    () => { const n = G.npc('steward2'); if (n) n.act = null; C8(S).dawn = 1; G.checkStep(); }); }
function cinCup8(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), hh = hAt(HX8, HZ8 + 4), gp = (x, dy, z) => [x, hAt(x, z) + dy, z]; /* (the road is on a slope: every lens stands on its own ground) */
  cine([
    { hour: 6, fn: () => { BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 4, cz + Math.floor(i / 6) * 1.8, 0.6)); hide(['steward2']); }, cam: gp(cx + 8, 3, cz - 8), look: gp(cx, 1.2, cz), dur: 6, music: 'j_mourn', t: '아침 밝을 때에 사람들과 그 나귀들을 보내니라.', ref: '창세기 44:3' },
    { fn: () => { G.teleport(HX8, HZ8 - 1, 0); showAt('steward2', HX8 + 1.2, HZ8 + 0.6, -2.4); }, cam: [HX8 + 2.2, hh + 1.6, HZ8 + 2.4], look: [HX8 + 0.4, hh + 1.5, HZ8 - 0.4], dur: 6, fadeIn: 0.6, t: '그들이 성에서 나가 멀리 가기 전에 요셉이 청지기에게 이르되', ref: '창세기 44:4' },
    { cam: [HX8 + 1.4, hh + 1.7, HZ8 + 0.6], look: [HX8, hh + 1.6, HZ8 - 1], dur: 10, fov: 0.55, n: '요셉', t: '일어나 그 사람들을 따라 미쳐서 그들에게 이르기를, 너희가 어찌하여 선을 악으로 갚느냐? 이는 내 주인이 가지고 마시며 늘 점치는 데 쓰는 것이 아니냐? 너희가 이같이 하니 악하도다 하라.', ref: '창세기 44:4–5' },
    { fn: () => showAt('steward2', cx - 3, cz - 4, 0.4), cam: gp(cx - 7, 2.4, cz - 8), look: gp(cx - 1, 1.2, cz), dur: 6, fadeIn: 0.6, t: '청지기가 그들에게 미쳐서 그대로 말하니', ref: '창세기 44:6' },
    { cam: gp(cx - 4.6, 1.7, cz - 4.8), look: gp(cx - 1, 1.3, cz + 0.6), dur: 10, n: '형들', t: '내 주여, 어찌 이렇게 말씀하시나이까? 당신의 종들이 이런 일은 결단코 아니하나이다. … 당신의 종 중 누구에게서 발견되든지 그는 죽을 것이요, 우리는 내 주의 종이 되리이다.', ref: '창세기 44:7–9', e: 'fear' },
    { cam: gp(cx - 1.2, 1.7, cz - 1.4), look: gp(cx - 3, 1.5, cz - 4), dur: 7, n: '요셉의 청지기', t: '그러면 너희 말과 같이 하리라. 그것이 발견되는 자는 내 종이 될 것이요, 너희는 무죄하리라.', ref: '창세기 44:10' },
    { fn: () => { const n = G.npc('benjamin2'); if (n) n.act = 'kneelRest'; }, at: () => { const b = G.npc('benjamin2'); return b ? { look: [b.x, hAt(b.x, b.z) + 0.7, b.z], cam: gp(b.x + 2.4, 1.5, b.z - 2) } : null; }, cam: gp(cx + 4.4, 1.4, cz + 3.2), look: gp(cx + 2.4, 0.8, cz + 1.8), dur: 8, t: '그들이 각각 급히 자루를 땅에 내려놓고 각기 푸니, 그가 나이 많은 자에게서부터 시작하여 나이 적은 자에게까지 수탐하매 잔이 베냐민의 자루에서 발견된지라.', ref: '창세기 44:11–12' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'weep', t: -i * 0.1, dur: 9, amb: true }; } }), cam: gp(cx - 3, 2.2, cz + 5), look: gp(cx, 1, cz + 0.6), dur: 6, t: '그들이 옷을 찢고 각기 짐을 나귀에 싣고 성으로 돌아오니라.', ref: '창세기 44:13' },
    { fn: () => { G.teleport(HX8, HZ8 + 1.2, 0); hide(['steward2']); BRO11.forEach((id, i) => { const n = showAt(id, HX8 - 5 + (i % 6) * 2, HZ8 + 5 + Math.floor(i / 6) * 1.6, Math.PI); if (n) n.emote = { k: 'prostrate', t: -i * 0.08, dur: 14, amb: true }; }); },
      cam: [HX8 + 5, hh + 2.4, HZ8 + 9], look: [HX8, hh + 0.6, HZ8 + 5], dur: 7, fadeIn: 0.8, t: '유다와 그 형제들이 요셉의 집에 이르니 요셉이 오히려 그곳에 있는지라. 그 앞 땅에 엎드리니', ref: '창세기 44:14' },
    { cam: [HX8 + 1.2, hh + 1.7, HZ8 + 2.6], look: [HX8, hh + 1.6, HZ8 + 1.2], dur: 7, fov: 0.55, n: '요셉', t: '너희가 어찌하여 이렇게 행하였느냐? 나 같은 사람이 점칠 줄을 너희가 알지 못하였느냐?', ref: '창세기 44:15', e: 'cold' },
    { cam: [HX8 + 1.6, hh + 1.2, HZ8 + 4], look: [HX8 + 0.4, hh + 0.8, HZ8 + 3.2], dur: 10, n: '유다', t: '우리가 내 주께 무슨 말을 하오며 무슨 설명을 하오며 어떻게 우리의 정직함을 나타내리이까? 하나님이 종들의 죄악을 적발하셨으니 우리와 이 잔이 발견된 자가 다 내 주의 노예가 되겠나이다.', ref: '창세기 44:16', e: 'cry' },
    { cam: [HX8 - 1.2, hh + 1.7, HZ8 + 2.6], look: [HX8, hh + 1.6, HZ8 + 1.2], dur: 9, fov: 0.55, n: '요셉', t: '내가 결단코 그리하지 아니하리라. 잔이 그 손에서 발견된 자만 내 종이 되고, 너희는 평안히 너희 아비에게로 도로 올라갈 것이니라.', ref: '창세기 44:17', e: 'cold' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }); next && next(); });
}

// ------------------------------------------------------------------ 7장 · 넷째 마디 · 「나는 요셉이라」 (45:1–15) · redeclared: 45:9–13 added
function cinIAmJoseph(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  const jHead = () => { const P = GG.Game.P, w = P.rig && P.rig.world && GG.HBI && P.rig.world[GG.HBI.head]; return w && isFinite(w[13]) && Math.hypot(w[12] - P.x, w[14] - P.z) < 1.5 ? [w[12], w[13] + 0.08, w[14]] : [P.x, P.y + 1.5, P.z]; };
  const onJ = (dx, dy, dz) => () => { const h = jHead(); return { look: h, cam: [h[0] + dx, h[1] + dy, h[2] + dz] }; };
  cine([
    { fn: () => { G.teleport(hx, hz, 0); cpose('weep', 10); hide(['asenath', 'steward2']); BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); }, cam: [hx + 2, hh + 1.6, hz - 1.8], look: [hx, hh + 1.5, hz + 0.6], dur: 8, music: 'j_finale',
      t: '요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리질러 「모든 사람을 자기에게서 물러가라」 하고, 그 형제에게 자기를 알리니 때에 그와 함께한 자가 없었더라. 요셉이 방성대곡하니 애굽 사람에게 들리며 바로의 궁중에 들리더라.', ref: '창세기 45:1–2' },
    { at: onJ(1.22, 0.05, 1.46), cam: [hx + 1, hh + 1.7, hz + 1.2], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.48, n: '요셉', t: '나는 요셉이라. 내 아버지께서 아직 살아 계시니이까?', ref: '창세기 45:3', e: 'cry' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.act = 'kneelRest'; }), cam: [hx - 3, hh + 1.8, hz + 1], look: [hx - 1, hh + 1, hz + 4.5], dur: 6, t: '형들이 그 앞에서 놀라서 능히 대답하지 못하는지라.', ref: '창세기 45:3' },
    { at: onJ(1.40, 0.05, 1.60), cam: [hx + 1.4, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '나는 당신들의 아우 요셉이니 당신들이 애굽에 판 자라. 당신들이 나를 이곳에 팔았으므로 근심하지 마소서. 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들 앞서 보내셨나이다.', ref: '창세기 45:4–5', e: 'cry' },
    { at: onJ(-1.20, 0.05, 1.80), cam: [hx - 1.2, hh + 1.6, hz + 1.8], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '그런즉 나를 이리로 보낸 자는 당신들이 아니요 하나님이시라. 하나님이 나로 바로의 아비를 삼으시며 그 온 집의 주를 삼으시며 애굽 온 땅의 치리자를 삼으셨나이다.', ref: '창세기 45:8', e: 'tender' },
    { at: onJ(1.0, 0.1, 1.7), cam: [hx + 1, hh + 1.6, hz + 1.7], look: [hx, hh + 1.6, hz], dur: 11, n: '요셉', t: '당신들은 속히 아버지께로 올라가서 고하기를, 아버지의 아들 요셉의 말에 하나님이 나를 애굽 전국의 주로 세우셨으니 지체 말고 내게로 내려오사 아버지와 아버지의 아들들과 아버지의 손자들과 아버지의 양과 소와 모든 소유가 고센 땅에 머물며 나와 가깝게 하소서.', ref: '창세기 45:9–10', e: 'tender' },
    { at: onJ(-1.1, 0.1, 1.6), cam: [hx - 1.1, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '흉년이 아직 다섯 해가 있으니 내가 거기서 아버지를 봉양하리이다. 아버지와 아버지의 가족과 아버지께 속한 모든 사람에게 부족함이 없도록 하리이다 하더라 하소서.', ref: '창세기 45:11', e: 'tender' },
    { at: onJ(1.3, 0.1, 1.3), cam: [hx + 1.3, hh + 1.6, hz + 1.3], look: [hx, hh + 1.6, hz], dur: 10, n: '요셉', t: '당신들의 눈과 내 아우 베냐민의 눈이 보는 바 당신들에게 이렇게 말하는 것은 내 입이라. 당신들은 내가 애굽에서 받는 영화와 당신들이 본 모든 것을 내 아버지께 고하고 속히 모시고 내려오소서.', ref: '창세기 45:12–13', e: 'happy' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) { b.act = null; G.npcTo('benjamin2', hx + 0.5, hz + 0.9, Math.PI, false); b.emote = { k: 'weep', t: 0, dur: 22, amb: true }; } }, cam: [hx + 2.6, hh + 1.5, hz + 0.4], look: [hx + 0.2, hh + 1.4, hz + 0.5], dur: 8,
      t: '자기 아우 베냐민의 목을 안고 우니 베냐민도 요셉의 목을 안고 우니라. 요셉이 또 형들과 입맞추며 안고 우니 형들이 그제야 요셉과 말하니라.', ref: '창세기 45:14–15' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next && next(); });
}

// ------------------------------------------------------------------ 8장 · 첫째 마디 · 바로의 명령과 수레 (45:16–24)
S8.g6_palace = { ch: 9, obj: '바로의 궁으로 · 바로 앞에 서기', target: { x: COURT8[0], z: COURT8[1] + 2 },
  enter(S, G, re) { S.q.broShow = 0; S.q.famShow = 0; BRO11.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); { const a = G.npc('asenath'); if (a) a.forceVis = undefined; } showAt('steward2', 15, -138.6, -0.6); /* (he was sent out for 45:1) */ if (!re) narr([{ kick: '창세기 45:16', title: '바로의 궁에 들린 소문', t: '요셉의 형들이 왔다는 소문이 바로의 궁에 들리매 바로와 그 신하들이 기뻐하고', ref: '창세기 45:16' }]); },
  check: S => !!C8(S).order, next: 'g6_wagons' };
function cine8Command(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); C8(S).orderGo = 1;
  cine([
    { fn: () => { G.teleport(cx + 1.6, cz - 2, Math.PI); }, cam: [cx + 5, ch + 3, cz + 4], look: [cx, ch + 1.6, cz - 8], dur: 6, music: 'j_finale', t: '바로는 요셉에게 이르되', ref: '창세기 45:17' },
    { cam: [cx - 2, ch + 2.4, cz - 2.4], look: PHAR8(), dur: 10, n: '바로', t: '너의 형들에게 명하기를, 너희는 이렇게 하여 너희 짐승에 싣고 가서 가나안 땅에 이르거든 너희 아비와 너희 가속을 이끌고 내게로 오라. 내가 너희에게 애굽의 좋은 땅을 주리니 너희가 나라의 기름진 것을 먹으리라 하라.', ref: '창세기 45:17–18' },
    { cam: [cx + 2, ch + 2.2, cz - 3], look: PHAR8(), dur: 10, n: '바로', t: '이제 명을 받았으니 이렇게 하라. 너희는 애굽 땅에서 수레를 가져다가 너희 자녀와 아내를 태우고 너희 아비를 데려오라. 또 너희의 기구를 아끼지 말라. 온 애굽 땅의 좋은 것이 너희 것임이니라.', ref: '창세기 45:19–20' },
  ], () => { C8(S).order = 1; G.checkStep(); });
}
S8.g6_wagons = { ch: 9, obj: S => { const c = C8(S); return !c.pull ? '왕의 수레 곳간 · 수레 끌어내기' : !c.yoke ? '수레에 소의 멍에 메우기' : !c.robe ? '앞마당 · 형들에게 옷 한 벌씩 주기' : !c.benj ? '베냐민에게 은 삼백과 옷 다섯 벌' : !c.line ? '나귀 스무 필 · 줄을 따라 걸으며 짐 살피기' : '형들을 떠나보내기'; },
  list: S => { const c = C8(S); return [{ t: '수레 끌어내기', ok: !!c.pull }, { t: '소에 멍에 메우기', ok: !!c.yoke }, { t: '형들에게 옷 한 벌씩', ok: !!c.robe }, { t: '베냐민에게 은 삼백과 옷 다섯 벌', ok: !!c.benj }, { t: '나귀 스무 필의 짐 살피기', ok: !!c.line }, { t: '「노중에서 다투지 말라」', ok: !!c.sent }]; },
  enter(S, G, re) { ageBrothers(); stage8(S, true); if (!re) GG.UI.toast('요셉이 바로의 명대로 형들에게 수레를 주고 길 양식을 주어요 (창세기 45:21)', true); },
  target: S => { const c = C8(S); if (!c.pull) return { x: (WAG8[0][0] + WAG8[1][0]) / 2, z: WAG8[0][1] - 2.4 }; if (!c.yoke) return { x: OXT8[0], z: OXT8[1] - 1.6 }; if (!c.robe) return { x: HX8, z: HZ8 + 5 }; if (!c.benj) return 'npc:benjamin2'; if (!c.line) return c.lineOn ? { x: LINE8.x1 + 1, z: LINE8.z - 2 } : { x: LINE8.x0 - 1.5, z: LINE8.z - 2 }; return { x: LINE8.x0 - 2.5, z: LINE8.z - 1 }; },
  check: S => !!C8(S).sent, done(S, G, next) { kill8(/^(ox8|don8_|scribe8)/); next(); }, next: 'g7_goshen' };
const NEWROBE8 = { top: 0xeee6d2, trim: 0x2f6f8f, under: 0xf4efe2 };
function robes8(S, G) { const ids = bros10().concat(['simeon']).filter((id, i, a) => a.indexOf(id) === i && id !== 'benjamin2'), hh = hAt(HX8, HZ8 + 6);
  cine([{ fn: () => { G.teleport(HX8, HZ8 + 3.4, 0); }, cam: [HX8 + 6, hh + 2.2, HZ8 + 1.4], look: [HX8, hh + 1.1, HZ8 + 7.6], dur: 9, music: 'j_finale', t: '그들에게 다 각기 옷 한 벌씩 주되', ref: '창세기 45:22',
    each: t => { const k = Math.floor(t / 0.75); ids.forEach((id, i) => { const n = G.npc(id); if (!n || i > k || n._robe8) return; n._robe8 = 1; npcSet(id, { look: Object.assign({}, n.d.look, NEWROBE8) }); n.emote = { k: 'bow', t: 0, dur: 1.6 }; G.sfx('cloth', { vol: 0.4 }); }); } }],
    () => { ids.forEach(id => { const n = G.npc(id); if (n && !n._robe8) { n._robe8 = 1; npcSet(id, { look: Object.assign({}, n.d.look, NEWROBE8) }); } }); C8(S).robe = 1; GG.UI.quest(); }); }
function benj8(S, G) { const b = G.npc('benjamin2'); if (!b) { C8(S).benj = 1; return; } const h = hAt(b.x, b.z);
  cine([{ fn: () => { act('pick', 1.2); }, cam: [b.x + 1.8, h + 1.6, b.z - 1.6], look: [b.x, h + 1.3, b.z], dur: 8, t: '베냐민에게는 은 삼백과 옷 다섯 벌을 주고', ref: '창세기 45:22',
    each: t => { if (t > 1.5 && !b._robe8) { b._robe8 = 1; npcSet('benjamin2', { look: Object.assign({}, b.d.look, NEWROBE8, { trim: 0x8a2a5a }) }); G.sfx('coins'); G.FX.burst(b.x, h + 1.1, b.z, 22, { c: [0.92, 0.92, 0.95], sp: 1, up: 1.2 }); } } }],
    () => { C8(S).benj = 1; GG.UI.quest(); }); }
function sendOff8(S, G) { const x0 = LINE8.x0 - 3, z0 = LINE8.z, h0 = hAt(x0, z0), hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 7, fn: () => { G.teleport(x0 - 1.6, z0 - 2.4, 0.6); bros10().concat(['simeon']).forEach((id, i) => showAt(id, x0 + (i % 6) * 1.4, z0 - 1.2 + Math.floor(i / 6) * 1.4, -2.6)); }, cam: [x0 + 5, h0 + 2.4, z0 - 6], look: [x0, h0 + 1.2, z0], dur: 6, music: 'j_finale', t: '이에 형들을 돌려보내며 떠날 때에 그들에게 이르되', ref: '창세기 45:24' },
    { cam: [x0 - 0.6, h0 + 1.7, z0 - 1.2], look: [x0 - 1.6, h0 + 1.6, z0 - 2.4], dur: 6, n: '요셉', t: '당신들은 노중에서 다투지 말라.', ref: '창세기 45:24', e: 'happy' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacob }); }, cam: [G7HEB[0] + 3, hh + 1.5, G7HEB[1] + 5.6], look: [G7HEB[0], hh + 1.4, G7HEB[1] + 2.6], dur: 8, fadeIn: 0.8,
      t: '그들이 애굽에서 올라와 가나안 땅에 들어가서 그 아비 야곱에게 이르러 고하여 가로되 「요셉이 지금까지 살아 있어 애굽 땅 총리가 되었더이다」 야곱이 그들을 믿지 아니하므로 기색하더니, 요셉의 자기를 태우려고 보낸 수레를 보고야 기운이 소생한지라.', ref: '창세기 45:25–27' },
    { cam: [G7HEB[0] + 1.2, hh + 1.6, G7HEB[1] + 4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, fov: 0.55, n: '야곱', t: '족하도다. 내 아들 요셉이 지금까지 살았으니 내가 죽기 전에 가서 그를 보리라.', ref: '창세기 45:28', e: 'cry' },
    { hour: 21, fn: () => { place('jacob', G7HEB[0] + 6, G7HEB[1] - 20, 0.3, { act: 'kneelRest' }); }, cam: [G7HEB[0] + 9, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.4, G7HEB[1] - 16], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.2, G7HEB[1] - 20], dur: 9, fadeIn: 1,
      t: '이스라엘이 모든 소유를 이끌고 발행하여 브엘세바에 이르러 그 아비 이삭의 하나님께 희생을 드리니, 밤에 하나님이 이상 중에 이스라엘에게 나타나시고', ref: '창세기 46:1–2' },
    { cam: [G7HEB[0] + 6.6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 3, G7HEB[1] - 17], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 12, G7HEB[1] - 24], dur: 9, fov: 1.1,
      t: '「나는 하나님이라 네 아비의 하나님이니 애굽으로 내려가기를 두려워 말라. 내가 거기서 너로 큰 민족을 이루게 하리라. 내가 너와 함께 애굽으로 내려가겠고 정녕 너를 인도하여 다시 올라올 것이며」', ref: '창세기 46:3–4' },
    { hour: 9, fn: () => { const n = G.npc('jacob'); if (n) n.act = null; const [tx, tz] = [G7HEB[0] - 20, G7HEB[1] - 46]; RT.wag8T = [tx, tz]; place('jacob', tx + 0.3, tz + 0.1, -2.2, { sit: true }); bros10().concat(['simeon']).forEach((id, i) => showAt(id, tx - 2 - (i % 4) * 1.6, tz - 1 - Math.floor(i / 4) * 1.8, -2.2)); },
      at: () => { const w = RT.wag8T; return w ? { look: [w[0] - 2, hAt(w[0], w[1]) + 1, w[1] - 1.5], cam: [w[0] + 7, hAt(w[0], w[1]) + 3, w[1] + 6] } : null; }, cam: [G7HEB[0] - 13, hh + 3, G7HEB[1] - 40], look: [G7HEB[0] - 22, hh + 1, G7HEB[1] - 47], dur: 9, fadeIn: 1,
      t: '이스라엘의 아들들이 바로가 그를 태우려고 보낸 수레에 그 아비 야곱과 그들의 처자들을 태우고, 그 가축과 가나안 땅에서 얻은 재물을 이끌었으며, 야곱과 그 자손들이 다 함께 애굽으로 갔더라.', ref: '창세기 46:5–7', fadeOut: 1 },
  ], () => { RT.wag8T = null; S.q.heb2 = 0; S.q.broShow = 0; S.q.famShow = 0; const n = G.npc('jacob'); if (n) { n.act = null; n.sit = false; } BRO11.forEach(id => { const n2 = G.npc(id); if (n2) n2.forceVis = undefined; });
    narr([{ kick: '창세기 46:8–27', title: '일흔 사람', t: '레아의 자손 서른세 명 · 실바의 자손 열여섯 명 · 라헬의 자손 열네 명 · 빌하의 자손 일곱 명. 야곱의 집 사람으로 애굽에 이른 자가 도합 칠십 명이었더라.', ref: '창세기 46:15–27' }], () => { C8(S).sent = 1; G.checkStep(); }); });
}

// ------------------------------------------------------------------ 8장 · 셋째 마디 · 고센에서 만남 (46:28–34)
const CART8 = { x: 23, z: -127.6, f: 1.3 };
S8.g7_goshen = { ch: 9, obj: S => { const c = C8(S); return S.q.chariotOk && !c.harness ? '버금 수레에 말 매기 (앞마당 동쪽)' : '수레를 몰고 고센으로 · 아버지 맞이하기'; },
  list: S => { const c = C8(S); return [{ t: '유다가 먼저 옴', ok: !!c.judah }, { t: '버금 수레에 말 매기', ok: !!c.harness || !S.q.chariotOk }, { t: '고센으로 가서 아버지 맞이하기', ok: false }]; },
  enter(S, G, re) { if (Gm().FEATS && Gm().FEATS.ride) Gm().unlockFeat('ride', true); const c = C8(S); if (S.q.chariotOk && !c.harness && !S.q.riding) S.q.cartAt = { x: CART8.x, z: CART8.z, f: CART8.f }; if (!c.judah) setTimeout(() => cine8Judah(S, Gm()), re ? 900 : 300); },
  target: S => { const c = C8(S); if (S.q.chariotOk && !c.harness) return { x: CART8.x + 1.6, z: CART8.z - 1.2 }; return { x: GOSHEN[0], z: GOSHEN[1] - 6 }; },
  check: S => (!!C8(S).harness || !S.q.chariotOk) && Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - (GOSHEN[1] - 6)) < 12,
  done(S, G, next) { cinReunion(S, G, next); }, next: 'g8_pharaoh' };
function cine8Judah(S, G) { if (GG.Cine.on || C8(S).judah) return; const jx = HX8 + 4, jz = HZ8 + 4, h = hAt(jx, jz); C8(S).judah = 1;
  cine([{ hour: 10, fn: () => { ageBrothers(); showAt('judah', jx + 14, jz + 10, -2.2); walkTo('judah', jx, jz, 1.8); G.teleport(HX8, HZ8 + 1, 0.4); }, cam: [jx - 4, h + 2.2, jz - 3], look: [jx + 6, h + 1.2, jz + 5], dur: 8, music: 'j_finale', t: '야곱이 유다를 요셉에게 미리 보내어 자기를 고센으로 인도하게 하고 다 고센 땅에 이르니', ref: '창세기 46:28' }],
    () => { hide(['judah']); GG.UI.quest(); if (S.q.chariotOk) GG.UI.toast('요셉이 그의 수레를 갖추고 · 앞마당 동쪽 버금 수레로 가요 (창세기 46:29)', true); }); }
function cinReunion(S, G, next) { /* v18.79 (redeclared): the Bible's words only (the seven made-up lines after 46:30 are gone) + 46:31–34 */ const [x0, z0] = GOSHEN, gh = GH();
  cine([
    { hour: 16, fn: () => { S.q.goshen = 1; S.q.broShow = 1; goshenCamp(S); BRO11.forEach((id, i) => showAt(id, x0 - 8 + (i % 6) * 2.4, z0 + 10 + Math.floor(i / 6) * 2, Math.PI)); place('jacob', x0, z0 + 6, Math.PI); npcSet('jacob', { look: LOOK.jacob }); G.teleport(x0, z0 - 6, 0); },
      cam: [x0 + 14, gh + 4, z0 - 6], cam2: [x0 + 10, gh + 3, z0 - 2], look: [x0, gh + 1.2, z0 + 4], dur: 8, music: 'j_finale', t: '요셉이 그의 수레를 갖추고 고센으로 올라가서 그의 아버지 이스라엘을 맞으며', ref: '창세기 46:29' },
    { fn: () => { G.teleport(x0, z0 + 4.8, 0); cpose('weep', 12); const j = G.npc('jacob'); if (j) j.emote = { k: 'weep', t: 0, dur: 12, amb: true }; }, cam: [x0 + 2.4, gh + 1.6, z0 + 5.6], look: [x0, gh + 1.5, z0 + 5.4], dur: 9, fov: 0.6,
      t: '그에게 보이고 그의 목을 어긋맞겨 안고 얼마 동안 울매', ref: '창세기 46:29' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 9, n: '야곱', t: '네가 지금까지 살아 있고 내가 네 얼굴을 보았으니 지금 죽어도 가하도다.', ref: '창세기 46:30', e: 'cry' },
    { fn: () => { cpose(null); const j = G.npc('jacob'); if (j) j.emote = null; G.teleport(x0 + 1.2, z0 + 4.4, -0.3); }, cam: [x0 + 4.6, gh + 1.8, z0 + 2.4], look: [x0 - 1, gh + 1.3, z0 + 8.6], dur: 6, t: '요셉이 그의 형들과 그의 아버지의 가속에게 이르되', ref: '창세기 46:31' },
    { cam: [x0 + 2.2, gh + 1.7, z0 + 5.8], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 11, n: '요셉', t: '내가 올라가서 바로에게 고하여 이르기를, 가나안 땅에 있던 내 형들과 내 아버지의 가속이 내게로 왔는데 그들은 목자라 목축하는 사람들이므로 그들의 양과 소와 모든 소유를 이끌고 왔나이다 하리니,', ref: '창세기 46:31–32' },
    { cam: [x0 - 0.2, gh + 1.7, z0 + 6.2], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 11, n: '요셉', t: '바로가 당신들을 불러서 「너희의 생업이 무엇이냐」 묻거든, 당신들은 이르기를 「주의 종들은 어렸을 때부터 지금까지 목축하는 자들이온데 우리와 우리 선조가 그러하니이다」 하소서.', ref: '창세기 46:33–34' },
    { cam: [x0 + 2.6, gh + 1.7, z0 + 3.2], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 8, n: '요셉', t: '그리하면 당신들이 고센 땅에 거하게 되리이다. 애굽 사람은 다 목축을 가증히 여기나이다.', ref: '창세기 46:34' },
    { cam: [x0 + 18, gh + 9, z0 + 18], cam2: [x0 + 22, gh + 14, z0 + 22], look: [x0, gh + 1, z0 + 3], dur: 9, fadeOut: 1.2, t: '야곱의 집 사람으로 애굽에 이른 자의 도합이 칠십 명이었더라.', ref: '창세기 46:27' },
  ], () => { placeGoshen(S); G.teleport(x0 + 2, z0 - 4, 0); next && next(); });
}

// ------------------------------------------------------------------ 8장 · 넷째 마디 · 바로 앞에서 (47:1–10)
S8.g8_pharaoh = { ch: 9, obj: S => { const c = C8(S); return !c.five ? '요셉의 집 앞마당 · 형 다섯과 함께 바로의 궁으로' : !c.phar1 ? '형 다섯과 함께 바로 앞에 서기' : !c.walk ? '궁 문 밖 · 아버지를 모시기' : '아버지와 천천히 걸어 바로 앞으로'; },
  list: S => { const c = C8(S); return [{ t: '형 다섯과 함께 궁으로', ok: !!c.phar1 }, { t: '아버지를 모시고 바로 앞으로 (천천히)', ok: !!c.phar2 }]; },
  enter(S, G, re) { S.q.goshen = 1; ageBrothers(); goshenCamp(S); placeGoshen(S); stage8(S, true); if (!re && !C8(S).five) narr([{ kick: '창세기 47:1–2', title: '바로 앞으로', t: '형들 가운데 다섯이 요셉의 집 앞마당에서 기다려요. 함께 바로의 궁으로 가요. 아버지는 궁 문 밖에서 기다리세요.', ref: '' }]); },
  target: S => { const c = C8(S); if (!c.five) return { x: HX8, z: HZ8 + 4 }; if (!c.phar1) return { x: COURT8[0], z: COURT8[1] + 2 }; if (!c.walk) return { x: PALG8[0] + 1.2, z: PALG8[1] + 1.4 }; return { x: COURT8[0], z: COURT8[1] + 2 }; },
  check: S => !!C8(S).phar2, next: 'g9_land' };
function cine8Phar1(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); FIVE8.forEach(id => G.npcFollow(id, false));
  cine([
    { fn: () => { G.teleport(cx + 1.6, cz - 1, Math.PI); FIVE8.forEach((id, i) => showAt(id, cx - 2.4 + i * 1.2, cz + 1.4, Math.PI)); }, cam: [cx + 5, ch + 2.6, cz + 5], look: [cx, ch + 1.4, cz - 6], dur: 6, music: 'j_finale', t: '요셉이 바로에게 가서 고하여 이르되', ref: '창세기 47:1' },
    { cam: [cx + 2.6, ch + 1.7, cz - 0.2], look: [cx + 1.6, ch + 1.6, cz - 1], dur: 9, fov: 0.55, n: '요셉', t: '내 아버지와 내 형들과 그들의 양과 소와 모든 소유가 가나안 땅에서 와서 고센 땅에 있나이다.', ref: '창세기 47:1' },
    { cam: [cx + 6, ch + 3, cz + 6], look: [cx, ch + 1.4, cz - 6], dur: 6, t: '그의 형들 중 다섯 명을 택하여 바로에게 보이니', ref: '창세기 47:2' },
    { cam: [cx - 2, ch + 2.4, cz - 2], look: PHAR8(), dur: 5, n: '바로', t: '너희 생업이 무엇이냐?', ref: '창세기 47:3' },
    { cam: [cx + 2.4, ch + 1.5, cz - 1], look: [cx - 1, ch + 1.4, cz + 1.4], dur: 11, n: '형들', t: '종들은 목자이온데 우리와 선조가 다 그러하니이다. … 가나안 땅에 기근이 심하여 종들의 양 떼를 칠 곳이 없기로 종들이 이곳에 거류하고자 왔사오니, 청하건대 종들로 고센 땅에 거하게 하소서.', ref: '창세기 47:3–4' },
    { cam: [cx - 1.6, ch + 2.2, cz - 3], look: PHAR8(), dur: 11, n: '바로', t: '네 아비와 형들이 네게 왔은즉 애굽 땅이 네 앞에 있으니 땅의 좋은 곳에 네 아비와 형들로 거하게 하되 고센 땅에 그들로 거하게 하고, 그들 중에 능한 자가 있는 줄을 알거든 그들로 나의 짐승을 주관하게 하라.', ref: '창세기 47:5–6' },
  ], () => { const c = C8(S); c.phar1 = 1; FIVE8.forEach((id, i) => showAt(id, cx + 4 + (i % 3) * 1.2, cz + 3 + Math.floor(i / 3) * 1.2, Math.PI)); showAt('jacob', PALG8[0], PALG8[1], Math.PI); GG.UI.quest(); GG.UI.toast('궁 문 밖에서 아버지가 기다려요', true); });
}
function cine8Phar2(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); C8(S).walkEnd = 1;
  cine([
    { fn: () => { G.teleport(cx + 1.4, cz - 1.6, Math.PI); place('jacob', cx, cz - 2.4, Math.PI, { vis: true }); }, cam: [cx + 4, ch + 2.4, cz + 3], look: [cx, ch + 1.5, cz - 4], dur: 8, music: 'j_finale', t: '요셉이 자기 아버지 야곱을 인도하여 바로 앞에 서게 하니 야곱이 바로에게 축복하매', ref: '창세기 47:7' },
    { cam: [cx + 1.6, ch + 1.6, cz - 4.2], look: [cx, ch + 1.5, cz - 2.4], dur: 6, n: '바로', t: '네 나이가 얼마냐?', ref: '창세기 47:8' },
    { cam: [cx - 1.2, ch + 1.6, cz - 1.2], look: [cx, ch + 1.5, cz - 2.4], dur: 10, n: '야곱', t: '내 나그네 길의 세월이 일백 삼십 년이니이다. 나의 연세가 얼마 못 되니 우리 조상의 나그네 길의 세월에 미치지 못하나 험악한 세월을 보내었나이다.', ref: '창세기 47:9', e: 'weary' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = 'raiseHands'; }, cam: [cx + 3, ch + 2, cz - 0.6], look: [cx, ch + 1.6, cz - 3.4], dur: 7, t: '야곱이 바로에게 축복하고 그 앞에서 나오니라.', ref: '창세기 47:10', fadeOut: 1 },
  ], () => { const j = G.npc('jacob'); if (j) j.act = null; FIVE8.concat(['jacob']).forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); placeGoshen(S); C8(S).phar2 = 1; G.checkStep(); });
}

// ------------------------------------------------------------------ 8장 · 다섯째 마디 · 라암세스 땅 (47:11–12)
S8.g9_land = { ch: 9, obj: S => !C8(S).deed ? '총리의 집무실 · 라암세스 땅 문서에 인 치기' : '집무실 · 서기와 양식 나눌 법 정하기', target: { x: OFFICE8[0] + 0.6, z: OFFICE8[1] + 1.4 },
  list: S => { const c = C8(S); return [{ t: '기업 문서에 반지로 인 치기', ok: !!c.deed }, { t: '식구를 따라 양식 정하기', ok: !!c.feed }]; },
  enter(S, G, re) { stage8(S, true); if (!re) narr([{ kick: '창세기 47:11', title: '라암세스 땅', t: '바로의 명대로 아버지와 형들에게 땅을 기업으로 주어요. 궁 뒤 총리의 집무실로 가요.', ref: '' }]); },
  check: S => !!C8(S).feed, done(S, G, next) { kill8(/^scribe8/); cine8Ration(S, G, next); }, next: 'g10_famine' };
function deed8(S, G) { act('pick', 1.4); setTimeout(() => { G.sfx('thud', { vol: 0.6 }); G.FX.burst(OFFICE8[0], hAt(OFFICE8[0], OFFICE8[1]) + 0.9, OFFICE8[1] - 1.2, 10, { c: [0.6, 0.42, 0.3], sp: 0.5, up: 0.6, size: 0.05 }); }, 600);
  setTimeout(() => say([T('요셉이 손가락의 반지를 진흙에 꾹 눌러 인을 쳤어요.'), T('요셉이 바로의 명대로 그 아비와 형들에게 거할 곳을 주되 애굽의 좋은 땅 라암세스를 그들에게 주어 기업을 삼게 하고', '창세기 47:11')], () => { C8(S).deed = 1; GG.UI.quest(); }), 1300); }
function feed8(S, G) { say([{ n: '서기', t: '고센의 집마다 어린아이 수가 달라요. 양식을 어떻게 나눌까요?', choices: [{ t: '집마다 똑같이', ok: false, fb: '성경은 「그 식구를 따라」 주었다고 해요. 어린아이가 많은 집에는 더 많이요.' }, { t: '식구를 따라 · 어린아이 수대로', then: () => setTimeout(() => say([{ n: '서기', t: '식구 수대로 적겠습니다, 총리님.' }], () => { C8(S).feed = 1; GG.UI.quest(); G.checkStep(); }), 30) }] }], null); }
function cine8Ration(S, G, next) { cine([{ fn: () => placeGoshen(S), cam: [GOSHEN[0] + 20, GH() + 10, GOSHEN[1] - 16], cam2: [GOSHEN[0] + 14, GH() + 6, GOSHEN[1] - 10], look: [GOSHEN[0], GH() + 1, GOSHEN[1]], dur: 10, fadeIn: 1, music: 'j_finale',
  t: '또 그 아비와 형들과 아비의 온 집에 그 식구를 따라 식물을 주어 공궤하였더라.', ref: '창세기 47:12' }], () => next && next()); }

// ------------------------------------------------------------------ 8장 · 여섯째 마디 · 흉년의 다섯 가지 일 (47:13–26)
S8.g10_famine = { ch: 9, obj: S => { const c = C8(S); return !c.coin ? '성읍 곳간 · 곡식을 팔고 받은 은 거두기' : !c.treas ? '은 궤를 들고 바로의 궁으로' : !c.heard ? '궁 문 앞 · 백성의 말 듣기' : !c.herd ? '받은 소와 나귀를 왕의 마구간으로' : !c.yearTold ? '…' : !c.land ? '왕의 밭 어귀 · 바로의 경계석 세우기' : !c.seed ? '농부들에게 씨앗을 주고 뿌리는 법 보이기' : '궁 문 앞 · 서기와 토지법 새기기'; },
  list: S => { const c = C8(S); return [{ t: '은 · 바로의 궁으로 (47:14)', ok: !!c.treas }, { t: '가축 · 왕의 마구간으로 (47:17)', ok: !!c.herd }, { t: '땅 · 경계석 세우기 (47:20)', ok: !!c.land }, { t: '씨앗 · 뿌리는 법 (47:23)', ok: !!c.seed }, { t: '법 · 오분의 일 (47:26)', ok: !!c.law }]; },
  enter(S, G, re) { stage8(S, true); if (!re) narr([{ kick: '창세기 47:13', title: '흉년이 더욱 심하여', t: '기근이 더욱 심하여 사방에 먹을 것이 없고 애굽 땅과 가나안 땅이 기근으로 황폐하니', ref: '창세기 47:13' }]); },
  target: S => { const c = C8(S); if (!c.coin) return { x: G7GRAN[0], z: G7GRAN[1] - 1.6 }; if (!c.treas) return { x: TREAS8[0], z: TREAS8[1] }; if (!c.heard) return { x: LAW8[0] + 1, z: LAW8[1] + 4 }; if (!c.herd) return { x: STABLE8[0], z: STABLE8[1] }; if (!c.land) return { x: FIELD8[0], z: FIELD8[1] }; if (!c.seed) return { x: FIELD8[0] - 3, z: FIELD8[1] + 2.4 }; return { x: LAW8[0], z: LAW8[1] + 1.4 }; },
  check: S => !!C8(S).law, done(S, G, next) { kill8(/^(ppl8|far8|cow8|don8h|scribe8)/); narr([{ kick: '창세기 47:27', title: '고센 땅', t: '이스라엘 족속이 애굽 고센 땅에 거하며 거기서 산업을 얻고 생육하며 번성하였더라.', ref: '창세기 47:27' }], next); }, next: 'j_end' };
function coin8(S, G) { MG8('catch', { title: '은 거두기', hint: '곡식을 팔고 받은 은을 바구니에 받아 담아요.', need: 10, dur: 30 }, () => { const c = C8(S); c.coin = 1; S.q.c8carry = 'chest'; G.P.carry = 'head'; GG.UI.quest();
  say([T('요셉이 곡식을 팔고 애굽 땅과 가나안 땅에 있는 돈을 모두 거두어들이고', '창세기 47:14')], () => GG.UI.toast('무거운 은 궤예요 · 바로의 궁으로 들고 가요', true)); }); }
function treas8(S, G) { S.q.c8carry = null; G.P.carry = null; act('pick', 1); G.sfx('coins'); say([T('그 돈을 바로의 궁으로 가져가니', '창세기 47:14')], () => { C8(S).treas = 1; GG.UI.quest(); stage8(S, true); }); }
function heard8(S, G) { say([{ n: '애굽 백성', t: '돈이 진하였사오니 우리에게 식물을 주소서. 어찌 주 앞에서 죽으리이까?', ref: '창세기 47:15' }, J('너희 짐승을 내라. 돈이 진하였을진대 내가 너희의 짐승과 바꾸어 주리라.', '창세기 47:16')], () => {
  const c = C8(S); c.heard = 1; ['cow8', 'don8h'].forEach(id => G.npcFollow(id, true)); GG.UI.quest(); GG.UI.toast('소와 나귀가 따라와요 · 왕의 마구간으로 데려가요', true); }); }
function herd8(S, G) { const c = C8(S); c.herd = 1; ['cow8', 'don8h'].forEach(id => { G.npcFollow(id, false); walkTo(id, STABLE8[0] + (id === 'cow8' ? -1 : 1), STABLE8[1] - 6, 1.2); }); GG.UI.quest();
  say([{ n: '마구간지기', t: '총리님, 왕의 마구간에 들이겠습니다.' }, T('그들이 그 짐승을 요셉에게 끌어오는지라. 요셉이 그 말과 양 떼와 소 떼와 나귀를 받고 그들에게 식물을 주되, 곧 그 모든 짐승과 바꾸어서 그 해 동안에 식물로 그들을 기르니라.', '창세기 47:17')], () => {
    kill8(/^(cow8|don8h)/); narr([{ kick: '창세기 47:18', title: '새 해', t: '그 해가 다 가고 새 해가 되매 무리가 요셉에게 와서 가로되,', ref: '창세기 47:18' }], () => { const P = G.P; [[0, LOOK.farmerThin], [1, LOOK.woman], [2, LOOK.farmer]].forEach(([i, L]) => { const a = P.face + (i - 1) * 0.5; spawn8('ppl8_y' + i, { name: '애굽 백성', look: L, x: P.x + Math.sin(a) * 2.6, z: P.z + Math.cos(a) * 2.6, face: P.face + Math.PI, act: i === 1 ? 'beg' : null }); }); say([{ n: '애굽 백성', t: '우리가 주께 숨기지 아니하나이다. 우리의 돈이 다하였고 우리의 짐승 떼가 주께로 돌아갔사오니 주께 낼 것이 아무것도 남지 아니하고 우리의 몸과 토지뿐이라.', ref: '창세기 47:18' },
      { n: '애굽 백성', t: '우리 몸과 우리 토지를 식물로 사소서. 우리가 토지와 함께 바로의 종이 되리니 우리에게 종자를 주시면 우리가 살고 죽지 아니하며 토지도 황폐하지 아니하리이다.', ref: '창세기 47:19' }], () => { c.yearTold = 1; kill8(/^ppl8_y/); stage8(S, true); GG.UI.quest(); GG.UI.toast('서쪽 · 왕의 밭 어귀로 가요', true); }); }); }); }
function stone8(S, G) { MG8('push', { title: '경계석 세우기', hint: '바로의 표가 새겨진 돌을 꾹 밀어 일으켜 세우다가, 힘이 빠지면 잠깐 쉬어요.', btn: '밀기' }, () => { const c = C8(S); c.land = 1; G.sfx('thud', { vol: 0.7 }); GG.UI.quest();
  say([T('그러므로 요셉이 애굽의 모든 토지를 다 사서 바로에게 바치니, 애굽의 각 사람이 기근에 몰려서 다 그 전지를 팔았음이라. 땅이 바로의 소유가 되니라.', '창세기 47:20'), T('요셉이 애굽 이 지경에서 저 지경까지의 백성을 성읍들에 옮겼으나, 제사장들의 토지는 사지 아니하였으니 제사장들은 바로에게서 녹을 받는 고로 바로가 주는 녹을 먹음이라.', '창세기 47:21–22')]); }); }
function seed8(S, G) { say([J('오늘날 내가 바로를 위하여 너희 몸과 너희 토지를 샀노라. 여기 종자가 있으니 너희는 그 땅에 뿌리라.', '창세기 47:23'), J('추수의 오분 일을 바로에게 상납하고 사분은 너희가 취하여 전지의 종자도 삼고 너희의 양식도 삼고 너희 가족과 어린아이의 양식도 삼으라.', '창세기 47:24')], () =>
  MG8('rhythm', { title: '씨 뿌리기 보이기', hint: '걸음에 맞춰 한 줌씩, 줄에 닿을 때 씨를 흩뿌려요.', need: 5 }, () => { const c = C8(S); c.seed = 1; act('gather', 1.2); G.FX.burst(G.P.x + Math.sin(G.P.face), hAt(G.P.x, G.P.z) + 1, G.P.z + Math.cos(G.P.face), 18, { c: [0.85, 0.72, 0.4], sp: 1.4, up: 0.8, size: 0.04, g: 7 });
    for (let i = 0; i < 3; i++) { const n = G.npc('far8_' + i); if (n) n.act = 'gather'; } GG.UI.quest(); say([{ n: '애굽 백성', t: '주께서 우리를 살리셨사오니 우리가 주께 은혜를 입고 바로의 종이 되겠나이다.', ref: '창세기 47:25' }], () => stage8(S, true)); })); }
function law8(S, G) { MG8('memory', { title: '토지법 새기기', hint: '서기가 쓴 글자를 잘 보고, 돌에 똑같이 새겨요.', n: 4, grid: 9, show: 3.6, pool: ['reed', 'water', 'eye', 'bird', 'bread', 'rope', 'hand', 'leg', 'snake'], names: { reed: '갈대', water: '물결', eye: '눈', bird: '새', bread: '빵', rope: '밧줄', hand: '손', leg: '다리', snake: '뱀' } }, () => { const c = C8(S); c.law = 1; G.sfx('craft'); GG.UI.quest();
  say([T('요셉이 애굽 토지법을 세우매 그 오분 일이 바로에게 상납되나, 제사장의 토지는 바로의 소유가 되지 아니하여 오늘날까지 이르니라.', '창세기 47:26')], () => G.checkStep()); }); }

// ------------------------------------------------------------------ who stands where (called on entering a step and when a save loads)
function stage8(S, force) { const G = Gm(), st = S.step, c = C8(S); if (!force && RT.st8 === st) return; RT.st8 = st;
  { const k = S.q.c8carry, mine = (st === 'g3_return' && TAB8[k]) || (st === 'g10_famine' && k === 'chest' && !c.treas); if (k && !mine) { S.q.c8carry = null; if (G.P.carry === 'head') G.P.carry = null; } else if (k) G.P.carry = 'head'; } /* (a table or the chest is only carried in its own step; after a load the pose comes back) */
  if (st !== 'g6_wagons') kill8(/^(ox8|don8_)/); if (!/^g(9|10)_/.test(st)) kill8(/^(scribe8|ppl8|far8|cow8|don8h)/);
  if (st === 'g3_return') { S.q.broShow = 1; if (!c.met) { const [gx, gz] = G7GRAN; bros10().forEach((id, i) => showAt(id, gx - 4.5 + (i % 6) * 1.8, gz + 4.4 + Math.floor(i / 6) * 1.8, Math.PI)); hide(['simeon']); } else hide(BRO11); }
  if (st === 'g3_feast') { if (c.seated) seatAll8(); else bros8Wait(); }
  if (st === 'g4_cup') hide(BRO11);
  if (st === 'g6_wagons') { S.q.broShow = 1; ageBrothers(); if (!c.robe) bros10().concat(['simeon']).forEach((id, i) => showAt(id, HX8 - 5 + (i % 6) * 2, HZ8 + 7 + Math.floor(i / 6) * 1.6, Math.PI));
    else bros10().concat(['simeon']).forEach((id, i) => showAt(id, LINE8.x0 - 4 + (i % 4) * 1.4, LINE8.z - 4 - Math.floor(i / 4) * 1.4, 0.4));
    const oxAt = (i, x, z, f) => { const n = spawn8('ox8' + i, { name: '소', animal: 'cow', x, z, face: f }); if (n) { Gm().npcTo('ox8' + i, x, z, f, false); n.walk = null; n.wander = null; } };
    if (c.yoke) WAG8.forEach(([x, z], i) => oxAt(i, x, z + 2.8, 0)); else { oxAt(0, OXT8[0] - 1, OXT8[1], 0.4); oxAt(1, OXT8[0] + 1, OXT8[1] + 0.4, -0.3); }
    if (!c.sent) for (let i = 0; i < 12; i++) { const x = LINE8.x0 + (i % 6) * 4.2, z = LINE8.z + (i < 6 ? 0 : 2.2); const n = spawn8('don8_' + i, { name: i < 6 ? '수나귀' : '암나귀', animal: 'donkey', x, z, face: Math.PI / 2 }); if (n) n.wander = null; } }
  if (st === 'g8_pharaoh') { S.q.broShow = 1; if (!c.phar1) { FIVE8.forEach((id, i) => showAt(id, HX8 - 3 + i * 1.5, HZ8 + 5, Math.PI)); if (c.five) FIVE8.forEach(id => G.npcFollow(id, true)); showAt('jacob', PALG8[0], PALG8[1], Math.PI); } else if (!c.phar2) showAt('jacob', PALG8[0], PALG8[1], Math.PI); }
  if (st === 'g9_land') { const n = spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: OFFICE8[0] + 1.6, z: OFFICE8[1] - 0.4, face: -1.3 }); if (n) n.wander = null; }
  if (st === 'g10_famine') { if (c.treas && !c.heard) { [[0, LOOK.farmerThin], [1, LOOK.woman]].forEach(([i, L]) => spawn8('ppl8_' + i, { name: '애굽 백성', look: L, x: LAW8[0] + 0.4 + i * 1.4, z: LAW8[1] + 5.4, face: Math.PI, act: 'beg' })); spawn8('cow8', { name: '소', animal: 'cow', x: LAW8[0] + 3.6, z: LAW8[1] + 6.4, face: Math.PI }); spawn8('don8h', { name: '나귀', animal: 'donkey', x: LAW8[0] + 5.4, z: LAW8[1] + 6, face: Math.PI }); }
    if (c.heard && !c.herd) { spawn8('cow8', { name: '소', animal: 'cow', x: G.P.x - 1.6, z: G.P.z - 1.6, face: 0 }); spawn8('don8h', { name: '나귀', animal: 'donkey', x: G.P.x + 1.6, z: G.P.z - 1.6, face: 0 }); ['cow8', 'don8h'].forEach(id => G.npcFollow(id, true)); }
    if (c.heard) kill8(/^ppl8/);
    if (c.yearTold && !c.seed) for (let i = 0; i < 3; i++) spawn8('far8_' + i, { name: '애굽 농부', look: LOOK.farmerThin, x: FIELD8[0] - 3 - i * 1.5, z: FIELD8[1] + 3.6, face: Math.PI * 0.9 });
    if (c.seed && !c.law) { kill8(/^far8/); spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: LAW8[0] + 1.4, z: LAW8[1] - 0.6, face: -1.2 }); } }
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^g(3|4|6|7|8|9|10)_/.test(S.step || '')) return null; const st = S.step, c = C8(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'g3_return' && c.met) { const t = c.tb || (c.tb = {}), k = S.q.c8carry, nxt = ['j', 'h', 'e'].find(q => !t[q]);
    if (nxt && !k) at(STACK8[0], STACK8[1], 2.8, { label: `${TAB8[nxt].n} 들기`, key: 'c8Tab', use: () => { S.q.c8carry = nxt; p.carry = 'head'; act('pick', 0.8); GG.UI.quest(); } }); /* (carried on the head, the way loads went in Egypt) */
    if (k && TAB8[k]) at(TAB8[k].x, TAB8[k].z, 2.6, { label: `${TAB8[k].n} 놓기`, key: 'c8Put', use: () => { t[k] = 1; S.q.c8carry = null; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.5 }); GG.UI.toast(TAB8[k].d + ' (창세기 43:32)'); GG.UI.quest(); } });
    if (!nxt && !c.noonGo) at(HX8, HZ8 + 2.4, 3.2, { label: '정오 · 형들을 맞기', key: 'c8Noon', use: () => { c.noonGo = 1; G.checkStep(); } }); }
  if (st === 'g3_feast' && c.noon) { const [rx, rz] = ROOM8;
    if (!c.wept) at(rx - 0.4, rz + 0.2, 2.2, { label: '안방에서 울기', key: 'c8Weep', use: () => weep8(S, G) });
    else if (!c.washed) at(rx + 0.8, rz, 2, { label: '대야에서 얼굴 씻기', key: 'c8Wash', use: () => wash8(S, G) });
    else if (!c.serve) at(HX8, HZ8 + 2.6, 3.2, { label: '「음식을 차리라」', key: 'c8Serve', use: () => serve8(S, G) });
    else if (!c.seated) at(HX8, HZ8 + 5, 3.6, { label: '형들을 나이 차례로 앉히기', key: 'c8Seat', use: () => seat8(S, G) });
    else if (!c.portion) at(TAB8.j.x, TAB8.j.z - 0.6, 2.6, { label: '요셉의 상에서 몫 보내기', key: 'c8Por', use: () => MG8('count', { title: '몫 보내기', hint: '요셉의 상에서 음식을 덜어 형제들에게 보내요. 베냐민에게는 다섯 몫이에요.', need: 5, btn: '베냐민에게 보내기', unit: '몫' }, () => { c.portion = 1; GG.UI.quest(); G.checkStep(); }) }); }
  if (st === 'g6_wagons') { const wx = (WAG8[0][0] + WAG8[1][0]) / 2, wz = WAG8[0][1];
    if (!c.pull) at(wx, wz - 1.6, 4, { label: '왕의 수레 끌어내기', key: 'c8Pull', use: () => MG8('wrestle', { title: '수레 끌어내기', hint: '바퀴가 모래에 박혔어요. 힘껏 당겨 수레를 끌어내요.', need: 6, dur: 12, btn: '당기기', unit: '번' }, () => { c.pull = 1; G.sfx('thud', { vol: 0.6 }); GG.UI.quest(); GG.UI.toast('수레 둘을 내놓았어요 · 소에 멍에를 메워요'); }) });
    else if (!c.yoke) at(OXT8[0], OXT8[1], 3.4, { label: '소에 멍에 메우기', key: 'c8Yoke', use: () => MG8('balance', { title: '멍에 메우기', hint: '무거운 멍에를 두 소의 목에 고르게 얹어요. 한쪽으로 기울지 않게.', dur: 8 }, () => { c.yoke = 1; GG.UI.quest(); stage8(S, true); GG.UI.toast('소가 수레 앞에 섰어요 · 앞마당의 형들에게 가요'); }) });
    else if (!c.robe) at(HX8, HZ8 + 5, 3.6, { label: '형들에게 옷 한 벌씩 주기', key: 'c8Robe', use: () => robes8(S, G) });
    else if (!c.benj) { const b = G.npc('benjamin2'); if (b) at(b.x, b.z, 2.8, { label: '베냐민에게 은 삼백과 옷 다섯 벌', key: 'c8Benj', use: () => benj8(S, G) }); }
    else if (c.line && !c.sent) at(LINE8.x0 - 2.5, LINE8.z - 1, 3.4, { label: '형들을 떠나보내기', key: 'c8Send', use: () => sendOff8(S, G) }); }
  if (st === 'g7_goshen' && S.q.chariotOk && !c.harness && !S.q.riding && c.judah) at(CART8.x + 1.6, CART8.z - 1.2, 4, { label: '버금 수레에 말 매기', key: 'c8Harn', use: () => MG8('rhythm', { title: '말 매기', hint: '말이 가만히 설 때 끈을 조여요.', need: 4 }, () => { c.harness = 1; GG.UI.quest(); GG.UI.toast('수레에 올라 고센으로 몰고 가요 (동쪽 광야 가장자리)', true); }) });
  if (st === 'g8_pharaoh') { if (!c.five) at(HX8, HZ8 + 4, 3.6, { label: '형 다섯과 함께 바로의 궁으로', key: 'c8Five', use: () => { c.five = 1; FIVE8.forEach(id => G.npcFollow(id, true)); GG.UI.quest(); } });
    else if (c.phar1 && !c.walk) { const j = G.npc('jacob'); if (j) at(j.x, j.z, 2.8, { label: '아버지를 모시고 바로 앞으로', key: 'c8Dad', use: () => { c.walk = 1; GG.UI.quest(); GG.UI.toast('아버지는 백삼십 살이에요 · 걸음을 맞춰 천천히 걸어요', true); } }); } }
  if (st === 'g9_land') { if (!c.deed) at(OFFICE8[0], OFFICE8[1] - 0.6, 2.8, { label: '라암세스 땅 문서에 인 치기', key: 'c8Deed', use: () => deed8(S, G) }); else if (!c.feed) { const n = G.npc('scribe8'); if (n) at(n.x, n.z, 2.8, { label: '서기와 양식 나눌 법 정하기', key: 'c8Feed', use: () => feed8(S, G) }); } }
  if (st === 'g10_famine') { if (!c.coin) at(G7GRAN[0], G7GRAN[1] - 1.6, 3.2, { label: '팔고 받은 은 거두기', key: 'c8Coin', use: () => coin8(S, G) });
    else if (!c.treas) at(TREAS8[0], TREAS8[1], 3.2, { label: '바로의 궁에 은 궤 들이기', key: 'c8Treas', use: () => treas8(S, G) });
    else if (!c.heard) { const n = G.npc('ppl8_0'); if (n) at(n.x, n.z, 3, { label: '백성의 말 듣기', key: 'c8Hear', use: () => heard8(S, G) }); }
    else if (c.yearTold && !c.land) at(FIELD8[0], FIELD8[1], 3, { label: '바로의 경계석 세우기', key: 'c8Stone', use: () => stone8(S, G) });
    else if (c.land && !c.seed) at(FIELD8[0] - 3, FIELD8[1] + 2.4, 3.4, { label: '씨앗을 주며 이르기', key: 'c8Seed', use: () => seed8(S, G) });
    else if (c.seed && !c.law) at(LAW8[0], LAW8[1] + 1.4, 3, { label: '서기와 토지법 새기기', key: 'c8Law', use: () => law8(S, G) }); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ every frame
let t8 = 0;
function ch8Tick(dt, S) { if (!S || !/^g(3|6|8|10)_/.test(S.step || '')) return; try { const G = Gm(), c = C8(S), st = S.step, free = !GG.UI.busy() && !GG.Cine.on && !G.cineOn;
  if ((t8 -= dt) > 0) return; t8 = 0.3; if (RT.st8 !== st) stage8(S);
  if (st === 'g3_return' && !c.met && free && near8(G7GRAN[0], G7GRAN[1], 8)) cine8Return(S, G);
  if (st === 'g6_palace' && !c.orderGo && free && near8(COURT8[0], COURT8[1], 9)) cine8Command(S, G);
  if (st === 'g6_wagons' && c.benj && !c.line) { const p = G.P;
    if (!c.lineOn && Math.hypot(p.x - (LINE8.x0 - 1.5), p.z - (LINE8.z - 2)) < 3) { c.lineOn = 1; c.lineK = 0; const n = spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: p.x - 1, z: p.z - 1, face: Math.PI / 2 }); if (n) G.npcFollow('scribe8', true); GG.UI.quest(); GG.UI.toast('줄을 따라 천천히 걸어요 · 서기가 짐을 읽어 줘요'); }
    if (c.lineOn && Math.abs(p.z - LINE8.z) < 6) { const k = p.x > LINE8.x1 - 1 ? 3 : p.x > LINE8.x0 + 13 ? 2 : p.x > LINE8.x0 + 4 ? 1 : 0;
      if (k > (c.lineK || 0)) { c.lineK = k; if (k === 1) GG.Life.bubble('scribe8', '수나귀 열 필 · 애굽의 아름다운 물품입니다.', 3.4); if (k === 2) GG.Life.bubble('scribe8', '암나귀 열 필 · 곡식과 떡과 길 양식입니다.', 3.4);
        if (k === 3) { c.line = 1; G.npcFollow('scribe8', false); GG.UI.quest(); say([T('그가 또 이와 같이 그 아비에게 보내되, 수나귀 열 필에 애굽의 아름다운 물품을 실리고 암나귀 열 필에는 아비에게 길에서 공궤할 곡식과 떡과 양식을 실리고', '창세기 45:23')]); } } } }
  if (st === 'g8_pharaoh') { const p = G.P;
    if (c.five && !c.phar1 && free && near8(COURT8[0], COURT8[1], 10.5)) cine8Phar1(S, G);
    if (c.walk && !c.walkEnd && free) { const j = G.npc('jacob'); if (j) { const d = Math.hypot(j.x - p.x, j.z - p.z);
      if (d > 2.2 && d < 12) { const bx = p.x - Math.sin(p.face) * 1.3 + Math.cos(p.face) * 0.8, bz = p.z - Math.cos(p.face) * 1.3 - Math.sin(p.face) * 0.8; if (!j.walk || Math.hypot(j.walk.x - bx, j.walk.z - bz) > 1.2) { j.sit = false; j.act = null; G.npcWalk('jacob', bx, bz, null, 0.8); } }
      if (d > 6) { RT.lag8 = (RT.lag8 || 0) - 0.3; if (RT.lag8 <= 0) { RT.lag8 = 7; GG.UI.toast('아버지가 뒤처졌어요 · 걸음을 맞춰 천천히 걸어요'); } }
      if (d >= 12) { G.npcTo('jacob', p.x - Math.sin(p.face) * 2, p.z - Math.cos(p.face) * 2, p.face, false); }
      if (near8(COURT8[0], COURT8[1], 7) && d < 4) cine8Phar2(S, G); } } }
  if (st === 'g10_famine' && c.heard && !c.herd && free && near8(STABLE8[0], STABLE8[1], 6)) { const a = G.npc('cow8'); if (a && Math.hypot(a.x - G.P.x, a.z - G.P.z) < 8) herd8(S, G); }
} catch (e) { console.error('ch8', e); } }

// ------------------------------------------------------------------ things to see (dyn meshes · f_runtime draws them)
function ch8Dyn(list, S, G, t) { const st = S.step; if (!/^g(3|4|6|9|10)_/.test(st || '')) return; const c = C8(S), P = G.P, WD = 0x8a6440, LIN = 0xeee4cc;
  const tbl = k => mk('tab8' + k, g => { const w = k === 'h' ? 13 : k === 'e' ? 0.8 : 1.5, d = k === 'h' ? 0.8 : k === 'e' ? 2.6 : 0.75; g.box(w, 0.06, d, { at: [0, 0.42, 0], c: WD }); g.box(w + 0.04, 0.012, d + 0.04, { at: [0, 0.455, 0], c: LIN, j: 0 });
    const lx = w / 2 - 0.12, lz = d / 2 - 0.12, xs = k === 'h' ? [-lx, -lx / 2, 0, lx / 2, lx] : [-lx, lx]; for (const x of xs) for (const z of [-lz, lz]) g.box(0.07, 0.4, 0.07, { at: [x, 0.2, z], c: 0x6a4a30 }); });
  if ((st === 'g3_return' || st === 'g3_feast' || st === 'g4_cup') && c.tb) for (const k of ['j', 'h', 'e']) if (c.tb[k]) { const T0 = TAB8[k]; list.push({ mesh: tbl(k), m: mat('tab8' + k, T0.x, hAt(T0.x, T0.z), T0.z, 0), outline: true }); }
  if (S.q.c8carry && TAB8[S.q.c8carry] && st === 'g3_return') { const k = S.q.c8carry; list.push({ mesh: tbl(k), m: mat('tab8c', P.x, P.y + 2.02, P.z, P.face + (k === 'e' ? Math.PI / 2 : 0), Math.PI, 0, k === 'h' ? 0.16 : 0.8, 0.5, 0.8), outline: true }); } /* (upside down on his head; the long one is shown folded short) */
  if (st === 'g3_return' && c.met) { const left = ['j', 'h', 'e'].filter(k => !(c.tb || {})[k] && S.q.c8carry !== k); left.forEach((k, i) => list.push({ mesh: tbl(k), m: mat('tab8s' + i, STACK8[0] + i * 0.15, hAt(STACK8[0], STACK8[1]) + i * 0.08, STACK8[1] + i * 0.1, 0.3, 0, 0, k === 'h' ? 0.16 : 0.8, 0.9, 0.8), outline: true })); } /* (the tables waiting by the house wall) */
  if ((st === 'g3_feast' && c.serve) || (st === 'g4_cup' && !c.dawn)) { const dish = mk('dish8', g => { g.cyl(0.13, 0.1, 0.05, 10, { at: [0, 0.025, 0], c: 0xc8a070 }); g.sph(0.07, 6, 4, { at: [0, 0.07, 0], s: [1, 0.5, 1], c: 0xb86a3a }); });
    const put = (key, x, z) => list.push({ mesh: dish, m: mat(key, x, hAt(x, z) + 0.46, z, 0), outline: false });
    put('dish8j', TAB8.j.x, TAB8.j.z); put('dish8e0', TAB8.e.x, TAB8.e.z - 0.6); put('dish8e1', TAB8.e.x, TAB8.e.z + 0.6);
    for (let i = 0; i < 11; i++) { const [x] = SEAT8(i), n = i === 10 && c.portion ? 5 : 1; for (let k = 0; k < n; k++) put('dish8b' + i + '_' + k, x + (k ? ((k % 2) ? -1 : 1) * Math.ceil(k / 2) * 0.24 : 0), TAB8.h.z + (k ? 0.18 : 0)); } }
  if (st === 'g4_cup' && !c.dawn) { const sack = mk('sack8', g => { g.sph(0.3, 7, 5, { at: [0, 0.32, 0], s: [1, 1.25, 0.9], c: 0xc8b088 }); g.cyl(0.1, 0.14, 0.12, 6, { at: [0, 0.7, 0], c: 0xa8906a }); });
    for (let i = 0; i < 11; i++) { const x = HX8 - 8 + i * 0.7, z = HZ8 - 3.6; list.push({ mesh: sack, m: mat('sack8_' + i, x, hAt(x, z), z, i * 0.7), outline: true }); } }
  if (st === 'g6_wagons' || RT.wag8T) { const wag = mk('wag8', g => { g.box(1.6, 0.12, 2.6, { at: [0, 0.78, 0], c: 0x8a6a44 }); for (const sx of [-1, 1]) g.box(0.06, 0.36, 2.6, { at: [sx * 0.8, 1.0, 0], c: 0x7a5a38 }); g.box(1.6, 0.36, 0.06, { at: [0, 1.0, -1.3], c: 0x7a5a38 });
      for (const sx of [-1, 1]) { g.cyl(0.42, 0.42, 0.08, 12, { at: [sx * 0.88, 0.42, -0.6], rz: Math.PI / 2, c: 0x5a4028 }); g.cyl(0.08, 0.08, 0.12, 6, { at: [sx * 0.9, 0.42, -0.6], rz: Math.PI / 2, c: 0x3a2818 }); } g.cyl(0.04, 0.05, 2.2, 5, { at: [0, 0.6, 2.1], rx: Math.PI / 2 - 0.15, c: 0x6a4a30 }); });
    if (st === 'g6_wagons') WAG8.forEach(([x, z], i) => list.push({ mesh: wag, m: mat('wag8_' + i, x, hAt(x, z), z, 0), outline: true }));
    if (RT.wag8T) { const [x, z] = RT.wag8T; list.push({ mesh: wag, m: mat('wag8_t', x, hAt(x, z), z, -2.2), outline: true }); } }
  if (st === 'g10_famine') { if (S.q.c8carry === 'chest') list.push({ mesh: mk('chest8', g => { g.box(0.5, 0.28, 0.36, { at: [0, 0, 0], c: 0x6a4428 }); g.box(0.52, 0.04, 0.38, { at: [0, 0.16, 0], c: 0xd8b04a }); }), m: mat('chest8', P.x, P.y + 1.96, P.z, P.face), outline: true }); /* (on his head, held with both hands) */
    const stn = mk('bstone8', g => { g.box(0.5, 1.3, 0.28, { at: [0, 0.65, 0], c: 0xb8aa92, j: 0.05 }); g.box(0.3, 0.3, 0.02, { at: [0, 1.0, 0.15], c: 0x8a3a2a, j: 0 }); });
    list.push({ mesh: stn, m: c.land ? mat('bstone8', FIELD8[0], hAt(FIELD8[0], FIELD8[1]), FIELD8[1], 0.4) : mat('bstone8', FIELD8[0], hAt(FIELD8[0], FIELD8[1]) + 0.14, FIELD8[1] + 0.5, 0.4, -Math.PI / 2 + 0.08), outline: true });
    if (c.seed || c.law) list.push({ mesh: mk('stele8', g => { g.box(1.0, 1.9, 0.3, { at: [0, 0.95, 0], c: 0xcabf9e, j: 0.03 }); g.box(1.0, 0.24, 0.32, { at: [0, 2.0, 0], c: 0xd8b04a }); }), m: mat('stele8', LAW8[0], hAt(LAW8[0], LAW8[1]), LAW8[1] - 0.6, Math.PI), outline: true });
    if (c.law) list.push({ mesh: mk('stele8w', g => { for (let i = 0; i < 5; i++) g.box(0.7, 0.05, 0.02, { at: [0, 0.6 + i * 0.22, 0], c: 0x4a3a2a, j: 0 }); }), m: mat('stele8w', LAW8[0], hAt(LAW8[0], LAW8[1]), LAW8[1] - 0.44, Math.PI), outline: false }); }
}
function ch8Build(W, P) { try { /* the inner room (창 43:30): a curtained chamber east of the vizier's house, open toward the courtyard, with a basin to wash in */ const [rx, rz] = ROOM8;
  P((g, M) => { const POST = 0x8a6a48, LIN = 0xe8dcc0, TR = 0x2f6f8f; for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) g.box(0.14, 2.5, 0.14, { m: M, at: [x, 1.25, z], c: POST }); g.box(3.3, 0.12, 3.3, { m: M, at: [0, 2.56, 0], c: LIN });
    g.box(3.1, 2.3, 0.04, { m: M, at: [0, 1.2, -1.5], c: LIN, j: 0.02 }); g.box(3.1, 2.3, 0.04, { m: M, at: [0, 1.2, 1.5], c: LIN, j: 0.02 }); g.box(0.04, 2.3, 3.1, { m: M, at: [1.5, 1.2, 0], c: LIN, j: 0.02 }); g.box(3.3, 0.14, 0.06, { m: M, at: [0, 2.42, -1.52], c: TR }); g.box(3.3, 0.14, 0.06, { m: M, at: [0, 2.42, 1.52], c: TR });
    g.box(2.6, 0.02, 2.4, { m: M, at: [0, 0.01, 0], c: 0x8a3a3a, j: 0 }); g.cyl(0.2, 0.24, 0.62, 10, { m: M, at: [0.85, 0.31, 0], c: 0x9a8e7e }); g.lathe([[0.2, 0.62], [0.32, 0.74], [0.36, 0.8]], 14, { m: M, at: [0.85, 0, 0], c: 0xb5673a }); g.lathe([[0.3, 0.8], [0.2, 0.66]], 14, { m: M, at: [0.85, 0, 0], c: 0x7a4a2a }); g.cyl(0.26, 0.26, 0.01, 12, { m: M, at: [0.85, 0.72, 0], c: 0x5f9cc4, j: 0 }); }, rx, rz, { keep: 1, col: null }); } catch (e) { console.warn('ch8Build', e); } }

// ------------------------------------------------------------------ put the steps in order (the old keys stay: old saves land in them)
for (const sp of specials) if (/^g_(dish|seat|portion|grain|goods)$/.test(sp.id)) sp.on = () => false; /* (the old feast and wagon buttons) */
{ const keys = Object.keys(steps), cut = keys.indexOf('g3_feast'), tail = keys.slice(cut).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.g3_return = S8.g3_return; steps.g3_feast = S8.g3_feast; steps.g4_cup = S8.g4_cup;
  steps.g5_reveal = Object.assign(tail.find(q => q[0] === 'g5_reveal')[1], { done(S, G, next) { cinIAmJoseph(S, G, next); } });
  steps.g6_palace = S8.g6_palace; steps.g6_wagons = S8.g6_wagons; steps.g7_goshen = S8.g7_goshen; steps.g8_pharaoh = S8.g8_pharaoh; steps.g9_land = S8.g9_land; steps.g10_famine = S8.g10_famine;
  for (const [k, v] of tail) if (!steps[k]) steps[k] = v;
  ORDER = Object.keys(steps); }
steps.g5_reveal.next = 'g6_palace'; steps.g1_spy.next = 'g3_return';
Object.assign(steps.g2_simeon, { enter(S, G) { hide(['simeon']); setTimeout(() => cinJudahPledge(S, G, () => G.go('g3_return')), 80); } });

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
{ const en = steps.c2_field.enter; steps.c2_field.enter = function (S, G, re) { if (!G.tool('sickle')) G.giveTool('sickle'); if (!re || !S.q.flaxPlanted) { ripe(S, 'pflax', 'flax'); S.q.flaxPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c2_tempt2.enter; steps.c2_tempt2.enter = function (S, G, re) { if (!S.q.flax2Planted) { ripe(S, 'pflax', 'flax'); S.q.flax2Planted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_year2.enter; steps.c5_year2.enter = function (S, G, re) { G.unlock('royal'); if (!S.q.wheatPlanted) { ripe(S, 'royal', 'wheat'); S.q.wheatPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_patrol.enter; steps.c5_patrol.enter = function (S, G, re) { S.q.chariotOk = 1; /* v18.52 the 은 200 gift (바로의 하사금) is gone, as asked */ en.call(this, S, G, re); }; }
{ const en = steps.c2_flee.enter; steps.c2_flee.enter = function (S, G, re) { RT.alarm = 0; RT.chase = { t: 0, w: 0, b: 0, caught: false, held: S.q.robe ? 0 : 5 }; en.call(this, S, G, re); if (re && !S.q.robe) { const n = G.npc('wife'); G.teleport(GRAB.x, GRAB.z, -1.5); if (n) { place('wife', GRAB.x - 0.78, GRAB.z + 0.1, 1.5); n.emote = { k: 'grabCloth', t: 0, dur: 60 }; } }
  if (!S.q.robe) { setTimeout(() => GG.UI.hint('붙잡혔어요! A 버튼을 연달아 눌러 뿌리치세요', 'struggle', 'tap'), 200); } }; }
/* v18.35 뿌리치기: she holds him by the robe; five presses of A wrench him free */
GG.Game.CTX.push(S => { const c = RT.chase; if (!c || !(c.held > 0) || S.step !== 'c2_flee' || GG.Cine.on) return null; const P = GG.Game.P; return [{ d: -9, label: `뿌리치기 (${5 - c.held}/5)`, x: P.x, z: P.z, y: 1.4, use: () => struggle(S, GG.Game), key: 'struggle', noMagnet: true }]; });
function struggle(S, G) { const c = RT.chase, n = G.npc('wife'), P = G.P; if (!c || !(c.held > 0)) return; c.held--; G.sfx('rip', { pitch: 1.5 - c.held * 0.1, vol: 0.5 }); GG.haptic && GG.haptic('thud'); P.face = -1.5 + (c.held % 2 ? 0.45 : -0.45); if (n) n.face = 1.5 + (c.held % 2 ? -0.2 : 0.2); GG.UI.quest(); if (GG.FX && GG.FX.burst) GG.FX.burst(P.x - 0.4, P.y + 1.1, P.z, 5, { c: [0.9, 0.85, 0.7], sp: 0.8, up: 0.5, size: 0.08 }); if (c.held <= 0) breakFree(S, G); }
/* v18.14 「밖으로 나가」 (창 39:12): she runs after him. Caught before the gate, the house starts to whisper — the player goes back to
   just before the ledger and tries again. Only running (달리기) gets away. */
const HOUSE_ROOMS = [{ in: p => p.z < 32.5 && p.x > -36.6 && p.x < -24.6, di: [-30.5, 31.2], do: [-30.5, 33.8] }, { in: p => p.x > -24.6 && p.x < -15 && p.z > 37 && p.z < 46.6, di: [-23.2, 42.3], do: [-26, 42.3] }, /* 비서실 (door from the lobby) */ { in: p => p.x > -13.5 && p.x < -7.5 && p.z > 40.5 && p.z < 49.5, di: [-10.4, 48.2], do: [-10.4, 50.7] }, // 부엌 (west door)
  { in: p => p.x < -36.6 && p.x > -41 && p.z > 37 && p.z < 46.6, di: [-37.7, 42.5], do: [-35.4, 42.5] }]; // 시중 방 (door to the hall)
const CHASE_L = ['그가 나와 동침하고자 내게로 들어오므로', '내가 크게 소리 질렀더니', '그가 그 옷을 내게 버려두고 도망하여 나갔느니라']; /* v18.73 her words as the Bible gives them (39:14–15) */ /* v18.42 she does not run after him: she calls the household (창 39:13–14) */
function chase(dt, S, G) { const c = RT.chase || (RT.chase = { t: 0, w: 0, b: 0, caught: false, held: 0 }), n = G.npc('wife'), P = G.P; if (!n || !n.vis || c.caught) return;
  if (c.held > 0) { P.x = GRAB.x; P.z = GRAB.z; P.vx = P.vz = 0; P.sprint = false; n.face = n.homeFace = 1.5; if (!n.emote || n.emote.k !== 'grabCloth') n.emote = { k: 'grabCloth', t: 0, dur: 60 }; return; } /* v18.35 held by the robe */
  c.t += dt; if (c.t < (c.stun || 1.3)) return; if (n.act === 'fallen') { n.act = null; n.emote = { k: 'stretch', t: 0, dur: 0.4, amb: true }; } // she falls back and gets up
  n.walk = null; n.sit = false; n.wander = null; n.face = n.homeFace = Math.atan2(P.x - n.x, P.z - n.z); if (!n.emote || n.emote.k !== 'grabCloth') n.emote = { k: 'grabCloth', t: 0, dur: 60 }; /* v18.42 she stays, his cloak in her hand, and calls out */
  /* v18.58 창 39:12–15: for a moment she only stares at the cloak in her hand. Then she cries out, and the household comes running.
     From the cry on: go back to her and it is over; be seen by anyone running in and it is over. So: wrench free and RUN. */
  { const left = Math.max(0, Math.ceil(FLEE_T - c.t)); if (left !== c.left) { c.left = left; GG.UI.quest(); } const dw = Math.hypot(n.x - P.x, n.z - P.z); if (dw > 3.4) c.away = 1;
    if (c.t > CRY_T && !c.alarm) { c.alarm = RT.alarm = 1; c.b = RT.t; G.sfx('door'); bubble('wife', '보라, 주인이 히브리 사람을 우리에게 데려다가 우리를 희롱하게 하는도다!', 3.4); GG.haptic && GG.haptic('thud'); GG.UI.toast('여인이 소리쳤어요! 사람들이 달려와요 · 들키지 말고 대문 밖으로!'); }
    if (c.alarm) { c.sent = c.sent || {}; FLEE_FOLK.forEach(([id, x, z, dl], i) => { if (c.sent[id] || c.t < CRY_T + dl) return; c.sent[id] = 1; const m = G.npc(id); if (!m) return; m.sit = false; m.act = null; m.wander = null; G.npcWalk(id, x, z, null, 3.4, GG.NpcAI && GG.NpcAI.pathTo ? GG.NpcAI.pathTo(m.x, m.z, x, z) : null); bubble(id, ['마님 목소리다!', '무슨 일이오!', '안채에서 소리가!', '어서 가 보자!', '청지기가 간다! 비켜라!'][i % 5], 2.4); }); }
    if (c.alarm && ((c.away && dw < 2.3) || (!c.away && c.t > CRY_T + 2.6))) { fleeFail(S, G, n, 'back'); return; } /* turned back to her (or never left her side) */
    if (c.sent) { const W = GG.Game.W(); for (const [id] of FLEE_FOLK) { const m = G.npc(id); if (!m || !m.vis || !c.sent[id]) continue; /* only someone already running to the cry */ const d2 = Math.hypot(m.x - P.x, m.z - P.z); if (d2 > 3.4) continue; if (d2 > 1.6 && W && W.ray && W.ray(m.x, m.y + 1.5, m.z, P.x, P.y + 1.3, P.z) < 1) continue; /* a wall between them: not seen */ m.walk = null; m.face = Math.atan2(P.x - m.x, P.z - m.z); m.emote = { k: 'point', t: 0, dur: 3 }; fleeFail(S, G, n, 'seen', m); return; } }
    if (c.t > FLEE_T) { fleeFail(S, G, n); return; } }
  if (c.alarm && RT.t - c.b > 2.6) { c.b = RT.t; bubble('wife', CHASE_L[Math.floor(Math.random() * CHASE_L.length)], 2.2); } return;
  const d = Math.hypot(n.x - P.x, n.z - P.z);
  if (d < 1.05) { caught(S, G, n); return; }
  if ((c.w -= dt) <= 0) { c.w = 0.22; n.sit = false; n.act = null; n.wander = null; const path = [];
    for (const R of HOUSE_ROOMS) { const a = R.in(n), b = R.in(P); if (a === b) continue; const [p1, p2] = a ? [R.di, R.do] : [R.do, R.di]; if (Math.hypot(n.x - p1[0], n.z - p1[1]) > 0.7) path.push(p1); path.push(p2); break; } // through the door, not into the wall
    G.npcWalk('wife', P.x, P.z, null, Math.min(4.9, 3.5 + (c.t - c.stun) * 0.2), path); if (n.walk) n.walk.chase = true; }
  if (RT.t - c.b > 3) { c.b = RT.t; bubble('wife', CHASE_L[Math.floor(Math.random() * CHASE_L.length)], 2.2); } }
function caught(S, G, n) { const c = RT.chase; c.caught = true; n.walk = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); G.P.vx = G.P.vz = 0; G.P.sprint = false; G.sfx('rip', { pitch: 0.7 });
  say([N('wife', '(요셉의 팔을 붙잡으며) …어디로 가려느냐.', '', 'cold'), T('여종 하나가 그 모습을 보고 말았습니다. 저녁이 되기도 전에, 집 안에 이상한 소문이 퍼지기 시작했습니다.')],
    () => narr([{ kick: '다시 하기', title: '소문이 퍼졌어요', t: '요셉은 유혹 앞에서 「밖으로 나가」 피했습니다(창 39:12). 붙잡히지 않도록 달리기로 뛰어 대문 밖까지 피하세요. 뿌리친 뒤로 돌아가요.', ref: '창세기 39:12', e: 'solemn' }],
      () => GG.UI.fade(() => { n.walk = null; G.P.sprint = false; G.teleport(GRAB.x, GRAB.z, 2.6); place('wife', GRAB.x - 0.9, GRAB.z + 0.1, 1.5); n.act = 'fallen'; RT.chase = { t: 0, w: 0, b: 0, caught: false, held: 0, stun: 2.6 }; }, () => { GG.UI.hint('달리기 버튼으로 뛰어요! 대문 밖까지!', 'flee', 'run'); }))); }
const FLEE_T = 22, CRY_T = 3.4, FLEE_FOLK = [['ameni', -29.6, 35.6, 0.5], ['cook', -31.4, 35.2, 0.9], ['weaver', -28.6, 36.4, 1.3], ['gardener', -30.4, 36.6, 2.4], ['neb', -30.5, 34.6, 4.6]]; /* [who, where they run to, seconds after the cry]: those who stand along the way out (the gardener, the steward at the gate) turn last, so a Joseph who runs at once is already past them */
function fleeFail(S, G, n, why, who) { const c = RT.chase; c.caught = true; G.P.vx = G.P.vz = 0; G.P.sprint = false; G.sfx('thud'); if (who) bubble(who.id, '저기다! 히브리 종이 저기 있다!', 2.6);
  const card = why === 'back' ? { title: '돌아가면 안 돼요', t: '여인이 소리친 뒤에 그 곁에 머물거나 되돌아가면, 달려온 사람들 앞에서 꼼짝없이 붙들려요. 요셉은 옷을 버려두고 「도망하여 밖으로 나갔습니다」(창 39:12). 뿌리치자마자 달리세요. 장부를 정리하기 전으로 돌아가요.' }
    : why === 'seen' ? { title: `${who ? who.name + '에게 ' : ''}들켰어요`, t: '여인의 외침에 달려오던 집 사람이 요셉을 보고 말았습니다. 요셉은 「도망하여 밖으로 나갔습니다」(창 39:12). 여인이 소리치기 전에, 사람들과 마주치지 않게 곧장 대문으로 달리세요. 장부를 정리하기 전으로 돌아가요.' }
    : { title: '사람들이 몰려왔어요', t: '여인의 외침에 집 사람들이 달려왔습니다. 요셉은 「밖으로 나가」 피했습니다(창 39:12). 사람들이 오기 전에 달려서 대문 밖까지 나가세요. 장부를 정리하기 전으로 돌아가요.' };
  narr([{ kick: '다시 하기', title: card.title, t: card.t, ref: '창세기 39:12', e: 'solemn' }],
    () => GG.UI.fade(() => { RT.alarm = 0; RT.chase = null; S.q.called = 0; S.q.grab = 0; S.q.robe = 0; S.q.flee = 0; S.q.empty = 1; if (n) { n.walk = null; n.emote = null; n.act = null; } FLEE_FOLK.forEach(([id]) => { const m = G.npc(id); if (m) m.walk = null; }); G.setOutfit('josephSteward'); G.go('c2_tempt3', true); G.teleport(-26.4, 42.3, 1.57); place('wife', -33.6, 30.4, 1.5); }, () => { GG.UI.quest(); GG.UI.toast('장부방에서 다시 시작해요 · 이번엔 달리기로!'); })); }
const SCENE_ONLY = { c1_market: 1, c4_answer: 1, c5_years: 1 };
/* v18.35 the cook and the gardener argue by the pool path where the player can find them (no teleporting once he talks to them) */
function quarrelStage(S, G, dt) { const c = G.npc('cook'), g = G.npc('gardener'); if (!c || !g) return; const near = G.dist(-13, 54) < 16; if (!RT.qsOn) { RT.qsOn = 1; if (near) { G.npcWalk('cook', -13.4, 53.6, null, 1.6, GG.NpcAI && GG.NpcAI.pathTo ? GG.NpcAI.pathTo(c.x, c.z, -13.4, 53.6) : null); G.npcWalk('gardener', -15.2, 54.6, null, 1.6); } else { place('cook', -13.4, 53.6, -2.2); place('gardener', -15.2, 54.6, 0.9); } c.act = null; g.act = null; } if (c.walk || g.walk) return; c.face = c.homeFace = Math.atan2(g.x - c.x, g.z - c.z); g.face = g.homeFace = Math.atan2(c.x - g.x, c.z - g.z); c.act = g.act = 'point'; if (near && RT.t - (RT.qsB || 0) > 5) { RT.qsB = RT.t; const k = Math.floor(RT.t / 5) % 2; bubble(k ? 'gardener' : 'cook', k ? '연못 물은 안 되오!' : '물이 모자라단 말이오!', 3); } }
function update(dt, S, G, t) {
  if (S.step === 'j_end' && !S.flags.clearMark) { S.flags.clearMark = 1; clearMark(S); } /* v18.73 (the vizier title) */
  if (typeof proTick === 'function') proTick(dt, S); if (typeof ch1Tick === 'function') ch1Tick(dt, S); if (typeof ch2Tick === 'function') ch2Tick(dt, S); if (typeof ch3Tick === 'function') ch3Tick(dt, S); if (typeof ch4Tick === 'function') ch4Tick(dt, S); if (typeof ch5Tick === 'function') ch5Tick(dt, S); if (typeof ch6Tick === 'function') ch6Tick(dt, S); if (typeof ch8Tick === 'function') ch8Tick(dt, S); /* v18.67 prologue (e_prologue.js) */
  const P = G.P, st = S.step; RT.t += dt;
  if (P.cpose) { P.cpose.t += dt; if (P.cpose.dur && !P.cpose.hold && P.cpose.t > P.cpose.dur) P.cpose = null; }
  if (P.cpose && P.spd > 0.6 && !GG.Cine.on && ['reach', 'scratchWall', 'shave', 'think', 'bow', 'gather'].includes(P.cpose.k)) P.cpose = null;
  if (P.cpose && P.cpose.hold && !GG.Cine.on && P.spd > 0.6 && !['bound'].includes(P.cpose.k)) P.cpose = null;
  if (S.step === 'c2_flee' && !S.q.jail && !GG.Cine.on && !GG.UI.busy()) chase(dt, S, G); /* v18.69 not once he is out of the gate (the walk to the prison) */
  if (S.step === 'c3_dreams' && S.q.dreamGo && GG.DW && GG.DW.on() && !GG.Cine.on && !GG.UI.busy() && !RT.dreamFx && G.dist(DREAM.x, DREAM.z) < 6.5) { if (S.q.dreamGo === 'vine') vineVision(S, G); else basketVision(S, G); }
  if (S.step === 'c2_tempt3' && S.q.called && !S.q.grab && P.z < 31.2 && P.x > -36.6 && P.x < -24.6 && !GG.Cine.on && !GG.UI.busy()) { S.q.grab = 1; cinGrab(S, G); }
  if (S.step === 'c2_manage' && S.q.assign && !S.q.quarrel && !GG.Cine.on && !GG.UI.busy()) quarrelStage(S, G, dt);
  if (P.spd > 0.8 && P.grounded && !P.ride) for (const p of GG.WADE || []) if (Math.abs(P.x - p.x) < p.w / 2 && Math.abs(P.z - p.z) < p.d / 2) { if ((RT.wadeT = (RT.wadeT || 0) - dt) <= 0) { RT.wadeT = P.spd > 3.5 ? 0.22 : 0.38; G.sfx('step', { surf: 'water', vol: 0.5 }); if (GG.FX && GG.FX.burst) GG.FX.burst(P.x, p.y + 0.4, P.z, 4, { c: [0.75, 0.88, 0.95], sp: 0.7, up: 0.8, size: 0.06, g: 5 }); } break; }
  if (S.q.chain && !between(S, 'c3_cell', 'c3_keeper')) S.q.chain = 0; /* v18.70 the fetters are back for the first night and day (시 105:18); old saves that kept them on lose them */
  if (S.outfit === 'josephFettered' && !GG.Cine.on && !S.q.chain) G.setOutfit('josephPrisoner');
  if (S.q.bound && !P.cpose && !GG.Cine.on) P.cpose = { k: 'bound', t: 0, dur: 0, hold: true }; /* (fetters are on the feet: the hands stay free to carry water) */
  if (!S.q.bound && P.cpose && P.cpose.k === 'bound' && !GG.Cine.on) P.cpose = null;
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
  G.CAM.zoom = lerp(G.CAM.zoom || 1, S.q.riding ? 2.35 : 1, Math.min(1, dt * 2)); /* v18.24 farther back on the chariot (it is long now) */
  if (S.q.riding) { /* v18.22 galloping (달리기) wears the horses out: breath drains, and at zero the gallop stops until they have rested */
    /* (the game's own sprint already spends breath; the old floor of 60 that kept it full is gone) */
    if (P.exhausted && !RT.horseTired) { RT.horseTired = 1; GG.UI.pop && GG.UI.pop('말이 지쳤어요', '숨을 돌리면 다시 달려요', 'donkey'); } else if (!P.exhausted) RT.horseTired = 0;
    RT.hoof = (RT.hoof || 0) + P.spd * dt; if (RT.hoof > 1.3 && P.spd > 1) { RT.hoof = 0; G.sfx('step', { surf: 'stone', vol: 0.4 + P.spd / 30, pitch: 0.7 + Math.random() * 0.2 }); }
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
  else if (st === 'p_provision') { if (!S.q.skin) GG.UI.hint('물건 가까이에서 A를 누르면 챙길 수 있어요', 'items', 'tap'); }
  else if (st === 'p_road') { const dl = Math.hypot(P.x - SPOTS.log[0], P.z - SPOTS.log[1]);
    if (dl < 11 && P.z > SPOTS.log[1] - 1) GG.UI.hint('쓰러진 나무가 길을 막았어요 · 점프 버튼(스페이스)으로 넘어요', 'jump', 'jump');
    else if (!RT.ran && P.z > SPOTS.log[1]) { if (P.sprint && P.spd > 5) RT.ran = 1; GG.UI.hint('달리기 버튼을 누른 채 걸으면 빨리 달려요 (키보드: Shift)', 'run', 'run'); }
    else GG.UI.hint(null); }
  else if (st === 'c2_work' && !S.q.w1 && S.water < 4) GG.UI.hint('물이 모자라요 · 우물에서 더 길어 오세요 (4번 부을 물)', 'w1water', 'drop');
  else if (st === 'c1_pit') { if ((S.q.climb || 0) < 2) GG.UI.hint('구덩이 벽이 높아요 · 점프 버튼으로 기어올라 보세요', 'pitJump', 'jump'); else if (S.q.shout && !S.q.pitPray) GG.UI.hint('무릎 꿇고 하나님께 부르짖어요', 'pitPray', 'pray'); }
}

// ------------------------------------------------------------------ BOUNDS · CAMERA · MOVEMENT · POSE
const ESTATE = { x0: -50.4, x1: 16, z0: 26, z1: 84 };
function bounds(P, S) { if (P.x > 1500) return; /* v18.35 the dream land keeps its own limits */
  const st = S.step;
  if (S.q.inPit) { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.wall - 0.48; if (d > R0) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  else { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.r + 1.5; if (d < R0 && d > 0.01) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  if (st === 'c1_caravan' && RT.car) { const n = GG.Game.npc('camel3'); if (n) { const d = Math.hypot(P.x - n.x, P.z - n.z), L = 6.6; if (d > L) { P.x = n.x + (P.x - n.x) / d * L; P.z = n.z + (P.z - n.z) / d * L; } /* v18.40 the rope is tied to the last camel's saddle: he stays behind its tail and never walks into it */ const fx = Math.sin(n.face), fz = Math.cos(n.face), along = (P.x - n.x) * fx + (P.z - n.z) * fz, BACK = 1.9; if (along > -BACK) { P.x -= fx * (along + BACK); P.z -= fz * (along + BACK); } } }
  if (S.q.cellLock) { P.x = clamp(P.x, -21.2, -16.8); P.z = clamp(P.z, -9.3, -6); }
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
function speedMul(S, P, mag) { if (S.q.riding && S.q.chariotOk) return P.sprint ? 1.85 : 2.2; if (S.step === 'c2_flee' && P.sprint && !S.q.jail) return 1.8; /* v18.35 this is no stroll in town: he runs for it (the town's slow run let her catch him at once) */ if (S.q.chain) return 0.52; if (S.q.bound) return 0.74; if (S.q.inPit) return 0.6; return 1; }
function pose(pst, S, G) {
  const P = G.P;
  if (S.q.riding && S.q.chariotOk) { pst.act = 'charioteer'; pst.actT = 0; pst.speed = 0; pst.staff = false; pst.carry = null; return; }
  if (P.cpose && !pst.act) { pst.act = P.cpose.k; pst.actT = P.cpose.dur ? Math.min(1, P.cpose.t / P.cpose.dur) : (P.cpose.t % 2) / 2; }
}
function rootY(S, G) { return S.q.riding && S.q.chariotOk ? 0.46 : 0; }
const extra = [{ id: 'chariot', label: S => S.q.riding ? '수레 내리기' : '버금 수레 타기', ic: 'donkey', on: S => !!S.q.chariotOk && between(S, 'c5_patrol'),
  click: (S, G) => { S.q.riding = S.q.riding ? 0 : 1; G.sfx(S.q.riding ? 'whoosh' : 'step'); if (S.q.riding) { S.q.rode = 1; G.UI.toast('버금 수레 · 달리기 버튼을 누르면 말이 힘차게 달려요'); G.checkStep(); } G.snapCam(); } }];
/* v18.14 the wardrobe lives in the personal chest now (storage.js): EP.openWardrobe / EP.wardOk */
function canSleep(S) { return S.step === 'c2_night1' || S.step === 'p_night'; }

// ------------------------------------------------------------------ DYNAMIC MESHES
const MESH = {};
const softGB = g => GG.softG && GG.softG(g);
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
  /* v18.78 the water in Jacob's basin: empty until Joseph pours, then it rises */
  if (Math.hypot(P.x - 172.4, P.z - 149.9) < 70 && idx(S) <= ORDER.indexOf('c1_pit')) { const q = S.q.pr || {}, washed = q.wash || idx(S) > ORDER.indexOf('p_wake'), k = !washed ? 0 : q.washAt === undefined ? 1 : Math.min(1, (RT.t - q.washAt) / 1.8);
    if (k > 0) { const wy = 0.49 + 0.15 * k, wr = 0.4 + (wy - 0.47) / 0.21 * 0.12 - 0.006; list.push({ mesh: mk('basinWater', g => g.cyl(1, 1, 0.01, 20, { at: [0, 0, 0], c: 0x5f9cc4, j: 0 })), m: mat('basinWater', 172.4, hAt(172.4, 149.9) + wy, 149.9, 0, 0, 0, wr, 1, wr) }); } } /* (the water fills the open bowl from its bottom (y 0.47) up to just under the rim (0.68)) */
  /* v18.78 the dry branches to gather (the action used to stand over bare grass) */
  { const q = S.q.pr || {}, br = (n, x, z, i) => list.push({ mesh: mk('dryBranch' + (i % 3), g => { g.cyl(0.035, 0.05, 1.2, 5, { at: [0, 0.05, 0], rz: Math.PI / 2, ry: (i % 3) * 0.7, c: 0x6f5b45 }); g.cyl(0.02, 0.03, 0.5, 4, { at: [0.25, 0.07, 0.12], rz: Math.PI / 2, ry: 0.9 + (i % 3) * 0.4, c: 0x5f4b38 }); g.cyl(0.018, 0.025, 0.4, 4, { at: [-0.3, 0.06, -0.1], rz: Math.PI / 2, ry: -0.6, c: 0x7d6a50 }); /* (grey-brown: dry wood, not fresh orange) */ }), m: mat('dryBranch' + n, x, hAt(x, z) + 0.02, z, (i * 1.3) % 3), outline: true });
    if (S.step === 'p_micah') BRANCH_C.forEach(([x, z], i) => { if (!(q.cb || {})[i]) br('c' + i, x, z, i); });
    if ((S.step === 'p_road' || S.step === 'p_micah') && q.mi === 3) BRANCH_M.forEach(([x, z], i) => { if ((q.br || {})[i]) return; /* v18.80 a pole, a bundle of pegs on a dry bush, a flat stone */
      const mesh = i === 0 ? mk('findPole', g => { g.cyl(0.05, 0.07, 2.6, 6, { at: [0, 0.08, 0], rz: Math.PI / 2, c: 0x6f5b45 }); g.cyl(0.025, 0.03, 0.5, 4, { at: [0.6, 0.12, 0.14], rz: Math.PI / 2, ry: 0.8, c: 0x5f4b38 }); g.cyl(0.12, 0.16, 0.5, 7, { at: [-1.4, 0.18, 0], rz: 1.2, c: 0x5a4632 }); })
        : i === 1 ? mk('findPegs', g => { g.sph(0.42, 6, 4, { at: [0, 0.32, 0], s: [1, 0.8, 1], c: 0x8a7a50 }); for (let k = 0; k < 6; k++) g.cyl(0.018, 0.024, 0.55, 4, { at: [Math.cos(k * 1.1) * 0.22, 0.5, Math.sin(k * 1.1) * 0.22], rz: 0.5 * Math.cos(k), rx: 0.5 * Math.sin(k), c: 0x6a5238 }); })
        : mk('findStone', g => { g.sph(0.17, 6, 4, { at: [0, 0.06, 0], s: [1.3, 0.45, 1], c: 0x8e8678, flat: true }); });
      list.push({ mesh, m: mat('find' + i, x, hAt(x, z) + 0.02, z, i * 1.3), outline: true }); }); }
  // v16.9 the things to pack before the road actually lie there (the action used to float beside the jars over nothing)
  if (S.step === 'p_provision' || S.step === 'p_wake' || S.step === 'p_jacob') {
    if (!S.q.bread) list.push({ mesh: mk('provBread', g => { g.cyl(0.26, 0.2, 0.16, 12, { at: [0, 0.08, 0], c: 0xa57a3c }); g.cyl(0.25, 0.25, 0.02, 12, { at: [0, 0.17, 0], c: 0x7a5530 });
      for (let i = 0; i < 4; i++) g.sph(0.085, 8, 5, { at: [Math.cos(i * 1.6) * 0.11, 0.21, Math.sin(i * 1.6) * 0.11], s: [1, 0.55, 1], c: 0xd8a860 });
      for (let i = 0; i < 3; i++) g.sph(0.045, 6, 4, { at: [Math.cos(i * 2.1 + 0.6) * 0.06, 0.27, Math.sin(i * 2.1 + 0.6) * 0.06], c: 0x6a3a52 }); }), m: mat('provBread', 178.9, hAt(178.9, 152.2), 152.2, 0.4) /* v18.57 a step away from the fire */, outline: true });
    if (!S.q.skin) list.push({ mesh: mk('provSkin', g => { g.sph(0.2, 10, 8, { at: [0, 0.16, 0], s: [1.25, 0.75, 0.85], c: 0x7a5034 }); g.cyl(0.035, 0.045, 0.12, 6, { at: [0.26, 0.24, 0], rz: -1.1, c: 0x6a4228 });
      g.cyl(0.012, 0.012, 0.5, 4, { at: [0, 0.3, 0], rz: 1.5708, c: 0x3a2a1a }); }), m: mat('provSkin', 182.2, hAt(182.2, 155.2), 155.2, 1.1), outline: true }); }
  // the rope: last camel → Joseph's hands
  if (S.step === 'c1_caravan' && S.q.bound && RT.car) { const n = G.npc('camel3'); if (n && n.vis) { const a = [n.x - Math.sin(n.face) * 0.9, n.y + 1.2, n.z - Math.cos(n.face) * 0.9], h = wpos(P.rig.world[HBI.handR]), mid = [(a[0] + h[0]) / 2, Math.min(a[1], h[1]) - 0.35, (a[2] + h[2]) / 2];
    ropeSeg(list, 'r1', a, mid); ropeSeg(list, 'r2', mid, h); } }
  // the second chariot and its horses (v18.24b: cart.js draws the wagon itself)
  if (S.q.riding && S.q.chariotOk && !GG.Cart) {
    const f = P.face, y = P.y + (G.EP().rootY ? 0 : 0);
    list.push({ mesh: mk('chariot', g => { g.box(1.3, 0.08, 1.0, { at: [0, 0.42, 0], c: 0x8a6440 }); g.box(1.3, 0.62, 0.06, { at: [0, 0.74, 0.48], c: 0xd9a73a }); for (const s of [1, -1]) { g.box(0.06, 0.5, 0.95, { at: [s * 0.62, 0.7, 0], c: 0xd9a73a }); g.cyl(0.42, 0.42, 0.07, 14, { at: [s * 0.74, 0.42, -0.1], rz: Math.PI / 2, c: 0x6a4a30 }); g.cyl(0.06, 0.06, 0.14, 6, { at: [s * 0.78, 0.42, -0.1], rz: Math.PI / 2, c: 0xd9a73a }); }
      g.box(0.08, 0.08, 2.2, { at: [0, 0.6, 1.5], rx: -0.15, c: 0x8a6440 }); g.box(1.8, 0.07, 0.07, { at: [0, 0.82, 2.55], c: 0x8a6440 }); band2(g); }), m: mat('char', P.x, y, P.z, f), outline: true });
    for (const s of [1, -1]) { const hx = P.x + Math.sin(f) * 2.6 + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * 2.6 - Math.sin(f) * s * 0.55; RT.hph = (RT.hph || 0) + 0; }
  }
  // the banquet table
  { const cd = GG.CELLDOOR, cl = !!S.q.cellLock || (S.step === 'c3_cell'); if (cd) cd.on = cl; RT.cdA = (RT.cdA || 0) + ((cl ? 0 : 1.9) - (RT.cdA || 0)) * 0.1; if (Math.hypot(G.P.x + 19, G.P.z + 5) < 60) list.push({ mesh: mk('cdoor', g => { for (let k = 0; k < 5; k++) g.cyl(0.035, 0.035, 2.5, 4, { at: [0.12 + k * 0.5, 1.28, 0], c: 0x4a3a2a }); for (const y of [0.25, 1.9, 2.5]) g.box(2.25, 0.12, 0.12, { at: [1.12, y, 0], c: 0x4a3a2a }); }), m: mat('cdoor', -20.4, hAt(-19, -5.5), -5.6, -RT.cdA), outline: true }); }
  if (S.step === 'c3_charge' && G.P.carry !== 'basket' && Object.keys(S.q.fed || {}).length < 4) list.push({ mesh: mk('breadB', g => { g.lathe([[0.2, 0], [0.34, 0.06], [0.4, 0.26], [0.43, 0.3]], 12, { c: 0xb08a4a }); for (let i = 0; i < 6; i++) g.sph(0.13, 7, 5, { at: [Math.cos(i) * 0.18 * (i ? 1 : 0), 0.3 + (i % 2) * 0.05, Math.sin(i) * 0.18 * (i ? 1 : 0)], s: [1.1, 0.7, 1], c: 0xd8a860 }); }), m: mat('breadB', -33.7, hAt(-34, 7) + 0.84, 7, 0), outline: true }); /* v18.35 the basket stands on the table before he takes it */
  { const open = (S.step === 'c2_tempt3' && S.q.called) || S.step === 'c2_flee', door = GG.POTDOOR; if (door) door.on = !open; RT.pdA = (RT.pdA || 0) + ((open ? 1.75 : 0) - (RT.pdA || 0)) * 0.12;
    if (Math.hypot(G.P.x + 30, G.P.z - 34) < 60) list.push({ mesh: mk('pdoor', g => { g.box(1.95, 2.46, 0.09, { at: [0.975, 1.23, 0], c: 0x7a5232 }); for (const y of [0.5, 1.2, 1.9]) g.box(1.95, 0.1, 0.12, { at: [0.975, y, 0], c: 0x5a3e28 }); g.cyl(0.05, 0.05, 0.04, 8, { at: [1.75, 1.15, 0.07], rx: PI / 2, c: 0xc8a040 }); }), m: mat('pdoor', -31.5, hAt(-30.5, 32.5) + 0.05, 32.5, -RT.pdA), outline: true }); }
  if (S.step === 'c2_banquet') { if (GG.BQ) { GG.BQ.table.on = true; GG.BQ.serve.on = true; }
    list.push({ mesh: mk('bqTable', g => { g.cyl(1.25, 1.25, 0.07, 22, { at: [0, 0.66, 0], c: 0x8a6440 }); g.cyl(1.3, 1.3, 0.03, 22, { at: [0, 0.61, 0], c: 0x6a4a30 }); g.cyl(0.22, 0.32, 0.62, 12, { at: [0, 0.31, 0], c: 0x6a4a30 }); g.cyl(1.0, 1.0, 0.012, 22, { at: [0, 0.7, 0], c: 0xf0e8d6 });
      for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2 + 0.3, x = Math.sin(a) * 0.82, z = Math.cos(a) * 0.82; g.cyl(0.19, 0.15, 0.04, 12, { at: [x, 0.725, z], c: 0xd8c49a }); g.sph(0.09, 7, 5, { at: [x, 0.77, z], s: [1.3, 0.6, 1.2], c: [0xd8a060, 0x6a3a5a, 0xc8783a, 0xe8c070, 0x7a4a3a][i] }); g.lathe([[0.02, 0], [0.05, 0.02], [0.06, 0.1], [0.04, 0.13]], 8, { at: [x * 0.68 + Math.cos(a) * 0.14, 0.71, z * 0.68 - Math.sin(a) * 0.14], c: 0xb5673a }); }
      g.lathe([[0.04, 0], [0.13, 0.1], [0.14, 0.26], [0.06, 0.4], [0.08, 0.45]], 10, { at: [0.1, 0.7, -0.12], c: 0x8a3a3a }); g.cyl(0.26, 0.2, 0.08, 12, { at: [-0.1, 0.74, 0.14], c: 0x2f8a77 }); for (let i = 0; i < 7; i++) g.sph(0.06, 6, 4, { at: [-0.1 + (i % 3 - 1) * 0.1, 0.81, 0.14 + (Math.floor(i / 3) - 1) * 0.09], c: [0xd8a060, 0x6a3a5a, 0xd9a73a][i % 3] });
      for (const [sx, sz] of [[-1.53, -1.7], [-2.1, 0.95], [0.25, 2.3], [1.15, -2]]) { g.box(0.46, 0.06, 0.4, { at: [sx, 0.42, sz], c: 0x8a6440 }); for (const [x, z] of [[-0.17, -0.14], [0.17, -0.14], [-0.17, 0.14], [0.17, 0.14]]) g.cyl(0.03, 0.03, 0.4, 4, { at: [sx + x, 0.2, sz + z], c: 0x6a4a30 }); } }), m: mat('bqTable', -30.4, hAt(-30.4, 38.9) + 0.06, 38.9, 0), outline: true }); }
  else if (GG.BQ && GG.BQ.table.on) { GG.BQ.table.on = false; GG.BQ.serve.on = false; }
  if (S.step === 'c2_banquet') list.push({ mesh: mk('feast', g => { ENVX.tableEg(g, m4()); for (let i = 0; i < 4; i++) { g.lathe([[0.05, 0], [0.16, 0.1], [0.18, 0.32], [0.08, 0.5], [0.1, 0.55]], 8, { at: [-0.6 + i * 0.4, 0.84, -0.15], c: [0x8a3a3a, 0xc8865a, 0xd8b860, 0x6a4a6a][i] }); }
      for (let i = 0; i < 5; i++) g.sph(0.09, 6, 4, { at: [-0.5 + i * 0.25, 0.9, 0.2], s: [1.4, 0.7, 1], c: 0xd8a060 }); for (let i = 0; i < 7; i++) g.sph(0.05, 5, 4, { at: [0.3 + (i % 3) * 0.1, 0.9, 0.18 + Math.floor(i / 3) * 0.08], c: 0x6a3a5a }); }), m: mat('feast', -40.1, hAt(-40.1, 43.1), 43.1, PI / 2), outline: true });
  // v18.13 the coat lying on the ground at the pit (garment motif, 창 37:23)
  if (RT.coatG && S.step === 'p_approach') list.push({ mesh: mk('coatW', g => { const C = LOOK.josephCoat.mantleStripes; /* v18.40 a crumpled woven coat, not a row of boards */ g.surf((u, v) => { const a = (u - 0.5) * 1.15, b = (v - 0.5) * 1.05, r = Math.hypot(a, b); return [a + 0.04 * Math.sin(v * 9 + u * 3), 0.02 + 0.05 * Math.max(0, Math.sin(u * 7 + 1) * Math.sin(v * 5 + 2)) + 0.035 * Math.sin(u * 13 + v * 4) * (1 - r) + 0.06 * Math.exp(-((a - 0.15) * (a - 0.15) + (b + 0.1) * (b + 0.1)) * 18), b + 0.03 * Math.sin(u * 8)]; }, 26, 18, { cuv: (u, v) => GG.weaveCol(C, u, v), ds: true, inner: 0.7, j: 0 }); }), m: mat('coatW', RT.coatG.x, RT.coatG.y, RT.coatG.z, 0.7), outline: true });
  else if (RT.coatG && S.step !== 'p_approach') RT.coatG = null;
  // the garment left in her hand (창 39:12)
  if (S.q.robe && (S.step === 'c2_tempt3' || between(S, 'c2_flee', 'c2_flee'))) { const n = G.npc('wife'), rf = Math.floor(t * 5) % 4; if (n && n.vis) list.push({ mesh: mk('robeS' + rf, g => { const ph = rf * 1.57; /* v18.35b soft linen hanging from one fist: gathered at the hand, opening and rippling towards the hem */
      g.surf((u, v) => { const w = 0.05 + 0.42 * Math.pow(v, 0.7), a = (u - 0.5) * 2, fold = Math.sin(a * 5 + v * 2 + ph * 0.3) * (0.02 + 0.075 * v), sway = Math.sin(v * 3 + ph) * 0.06 * v * v; return [a * w + Math.sin(v * 4 + ph) * 0.03 * v, -0.02 - v * 1.02 + 0.05 * v * Math.cos(a * 7 + ph), fold + sway + Math.cos(a * 1.6) * 0.09 * v]; }, 18, 12, { c: (x, y) => y < -0.93 ? 0x40566e : y < -0.88 ? 0xb89a5a : 0xe2d2ae, ds: true, inner: 0.8, j: 0 });
      g.sph(0.055, 7, 5, { at: [0, -0.01, 0], s: [1.3, 0.9, 1], c: 0xd8c8a0, j: 0 }); softGB(g);}), m: (() => { const hw = n.rig.world[HBI.handR], M = RT.robeM || (RT.robeM = m4()); const sf = Math.sin(n.face), cf = Math.cos(n.face); return GG.m4trs(M, hw[12] + sf * 0.12 - cf * 0.1, hw[13], hw[14] + cf * 0.12 + sf * 0.1, n.face + 0.5, 0, 0, 1, 1, 1); })(), outline: true }); }
  // days scratched on the wall
  if (between(S, 'c3_wait') && (S.q.wait || 0) >= 2 && before(S, 'c4_court')) list.push({ mesh: mk('marks', g => { for (let i = 0; i < 24; i++) g.box(0.02, 0.22, 0.01, { at: [(i % 12) * 0.07 + Math.floor((i % 12) / 4) * 0.04, Math.floor(i / 12) * 0.3, 0], rz: (i % 4 === 3) ? 0.9 : 0.05, c: 0x5a4a38 }); }), m: mat('marks', -21.47, hAt(-20.6, -6.4) + 1.2, -6.8, Math.PI / 2) });
  // grain piled before the granaries
  const sacks = RT.sacks || (between(S, 'c5_years') ? 3 : 0);
  if (sacks) for (const s of sites) if (S.built[s.id] || S.step === 'c5_years') list.push({ mesh: mk('sacks' + sacks, (g, M, r) => { for (let i = 0; i < sacks * 7; i++) g.sph(0.32, 7, 5, { at: [(i % 7) * 0.62 - 1.9 + (r() - 0.5) * 0.1, 0.25 + Math.floor(i / 7) * 0.42, (Math.floor(i / 7) % 2) * 0.3], s: [1, 0.85, 0.8], c: [0xd8c49a, 0xc8b080, 0xe2cfa0][i % 3] }); }), m: mat('sk' + s.id, s.x, hAt(s.x, s.z + 4.4), s.z + 4.4, 0), outline: true });
  dreamDyn(list, S, G, t); earsDyn(list, S, G, t); if (typeof ch8Dyn === 'function') ch8Dyn(list, S, G, t);
}
function band2(g) { for (let i = 0; i < 6; i++) g.box(0.2, 0.08, 0.02, { at: [-0.5 + i * 0.2, 0.92, 0.52], c: [0x2c5aa0, 0xb3472e, 0x2f8a77][i % 3] }); }
const HR = { rigs: [new Rig(AB.horse), new Rig(AB.horse)], ph: 0 };
function skinned(list, S, G, t) {
  for (const c of RT.cows) if (c.st !== 'hidden' && c.eaten < 0.99) list.push({ mesh: c.mesh, bones: c.rig.bones, outline: true, tint: c.thin ? [0.72, 0.66, 0.62] : null });
  if (S.q.riding && S.q.chariotOk) { const P = G.P, f = P.face, CT = GG.Cart, hv = CT && CT.hv ? Math.abs(CT.hv()) : P.spd, ex = CT && CT.sx ? CT.sx() : 0; HR.ph += hv * 0.016 * 1.6; /* v18.25b the horses run at their own pace, a little ahead of the wagon when the traces are taut */
    const bk = CT && CT.beast ? CT.beast() : 'horse', RG = bk === 'horse' ? HR.rigs : (HR['r' + bk] || (HR['r' + bk] = [new Rig(AB[bk]), new Rig(AB[bk])])); /* v18.45 oxen pull the cart */
    RG.forEach((rig, i) => { const s = i ? 1 : -1, hx = P.x + Math.sin(f) * (2.6 + ex) + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * (2.6 + ex) - Math.sin(f) * s * 0.55;
      animAnimal(rig, { speed: hv * (bk === 'horse' ? 0.55 : 1.1), phase: HR.ph + i * 0.4, graze: false }, t); rig.update(m4trs(HR['M' + i] || (HR['M' + i] = m4()), hx, hAt(hx, hz), hz, f));
      list.push({ mesh: bk === 'horse' ? G.animalMesh('horse', 'plain', { royal: 1 }) : G.animalMesh(bk, 'plain'), bones: rig.bones, outline: true }); }); }
}
// light: the moonlight shaft in Joseph's cell, the dream glows
let shaftMesh = null;
let godMesh = null;
function flats(list, S, G, t) {
  const hr = S.time % 24;
  if (RT.godRay > 0) { if (!godMesh) { const g = new GG.GB(7); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2, r0 = 3.4, r1 = 1.1, H = 34; g.tri([Math.cos(a) * r0, H, Math.sin(a) * r0], [Math.cos(b) * r0, H, Math.sin(b) * r0], [Math.cos(b) * r1, 0, Math.sin(b) * r1], { c: 0xffffff }); g.tri([Math.cos(a) * r0, H, Math.sin(a) * r0], [Math.cos(b) * r1, 0, Math.sin(b) * r1], [Math.cos(a) * r1, 0, Math.sin(a) * r1], { c: 0xffffff }); } godMesh = R.mesh(g); } list.push({ mesh: godMesh, m: mat('gray', DREAM.x, hAt(DREAM.x, DREAM.z), DREAM.z, t * 0.2), color: [1, 0.95, 0.78, 0.34 * RT.godRay] }); }
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
  vizTitle(S, G);
}
/* v18.73 once the story has reached its end (j_end, in any slot), the title shows Joseph as Egypt's vizier (linen robe, gold chain)
   · v18.74 seen from the front: Pharaoh's palace gate and its two towers fill the picture, Joseph stands in the middle before it and looks at us;
   under the name 「애굽의 총리 · 사브낫바네아」 */
const CLEAR_KEY = 'yakgil_joseph_clear', TITLE0 = {}, TITLE_BACK = 10; /* Joseph stands 10 m in front of the gate */
function clearMark(S) { if (S && S.step === 'j_end') { try { localStorage.setItem(CLEAR_KEY, '1'); } catch (e) { } } }
const clearedJ = () => { try { return localStorage.getItem(CLEAR_KEY) === '1'; } catch (e) { return false; } };
function vizTitle(S, G) { const E = GG.EP.joseph, sub = document.getElementById('tSub'); clearMark(S);
  if (!('cam' in TITLE0)) { TITLE0.cam = E.titleCam; TITLE0.music = E.titleMusic; }
  const on = G.mode === 'title' && clearedJ(); if (sub) sub.hidden = !on; G.titleHero = on;
  if (!on) { E.titleCam = TITLE0.cam; E.titleMusic = TITLE0.music; return; }
  const W = G.W(), P = G.P, x = SPOTS.palaceGate[0], z = SPOTS.palaceGate[1] + TITLE_BACK;
  P.x = x; P.z = z; P.y = W.heightAt(x, z); P.face = 0; P.vx = P.vz = 0; P.emote = null; P.cpose = null; P.carry = null; S.hand = null; S.time = 17.7;
  G.setOutfit('josephVizier');
  for (const [id, gx2] of [['royalG0', x - 5], ['royalG1', x + 5]]) { const n = G.npc(id); if (n) { n.forceVis = true; G.npcTo(id, gx2, SPOTS.palaceGate[1] + 2.4, 0, false); n.walk = null; n.wander = null; } } /* the palace guards either side of the gate (title only) */
  titleCrowd(G, x, z);
  E.titleCam = titleFrame(x, z); E.titleMusic = 'j_finale';
  if (!TITLE0.rs) { TITLE0.rs = 1; addEventListener('resize', () => { const g = GG.Game; if (g.mode === 'title' && g.titleHero && GG.EP.joseph.titleCam && GG.EP.joseph.titleCam.a0 !== undefined) GG.EP.joseph.titleCam = titleFrame(g.P.x, g.P.z); }); } }
/* v18.74 the people of Egypt on both sides, glad, looking out at us with him: clapping, waving, hands raised (title only: gone when the game starts) */
const CROWD = [[-1.6, -3.4, 'official', 'raiseHands'], [1.6, -3.4, 'woman', 'clap'], [-1.05, 0.9, 'kid', 'wave'], [1.05, 0.8, 'kid', 'raiseHands'],
  [-3.3, -1.6, 'farmer', 'clap'], [3.3, -1.6, 'maid', 'wave'], [-5.2, 0, 'woman', 'laugh'], [5.2, -0.2, 'farmer', 'raiseHands'], [-6.8, -2.2, 'elder', 'clap'], [6.8, -2, 'scribe', 'clap'],
  [-8.6, -0.6, 'farmer', 'wave'], [8.6, -0.8, 'woman', 'raiseHands'], [-4.4, 2.2, 'maid', 'clap'], [4.4, 2.1, 'official', 'wave']];
function titleCrowd(G, x, z) { let kid = null; for (const id in G.ENT.npcs) { const n = G.ENT.npcs[id]; if (n.d.folk && n.d.folk.age === 'kid' && n.d.look) { kid = n.d.look; break; } }
  CROWD.forEach(([dx, dz, lk, act], i) => { const id = 'tCrowd' + i; if (G.npc(id)) return; const isKid = lk === 'kid'; if (isKid && !kid) return;
    G.spawnNPC({ id, name: '애굽 사람', look: isKid ? kid : LOOK[lk], x: x + dx, z: z + dz, face: -dx * 0.03 + (i % 3 - 1) * 0.08, noTalk: true, noTag: true, noBond: true, act, scale: isKid ? 0.62 : undefined }); }); }
/* the camera stands straight in front, low (1.4 m): the tops of the gate towers just under the top edge, Joseph's feet just above the title words, on any screen */
function titleFrame(x, z) { const T = Math.tan(0.95 / 2), hc = 1.4, top = 6.4, a = 0.05, wr = document.querySelector('#title .t-wrap'), tw = wr ? wr.getBoundingClientRect().top / Math.max(1, innerHeight) : 0.4;
  const b = Math.min(0.6, Math.max(0.3, tw - 0.04)), frac = (ang, p) => 0.5 - 0.5 * Math.tan(ang - p) / T, pitch = D => -Math.atan(hc / D) - Math.atan((0.5 - b) * 2 * T);
  let lo = 3, hi = 60, D = 15; for (let i = 0; i < 50; i++) { D = (lo + hi) / 2; if (frac(Math.atan((top - hc) / (D + TITLE_BACK)), pitch(D)) < a) lo = D; else hi = D; }
  return { x, z, r: D, h: 0, ty: 0, minH: hc, a0: 0, arc: 0.03, lk: 0, ly: hc + D * Math.tan(pitch(D)) }; }
function onDay(S, G) { if (between(S, 'c5_patrol', 'c5_years')) { S.silver += 0; } }
function calmWeather(S) { return !!(S.step === 'p_micah' || S.step === 'p_night' || S.q.vision || RT.dreamFx || S.q.inPit || between(S, 'c2_tempt3', 'c3_cell') || between(S, 'c4_shave', 'c4_answer') || (GG.Opening && GG.Opening.on)); }
function calmSurv() { return true; }
function climate(S, x, z, hr) { if (canaanK(x) > 0.5) return null; return { clear: 0.66, cloudy: 0.12, rain: 0.004, storm: 0, wind: 0.12, dust: LAND === 'famine' ? 0.22 : 0.06, fog: hr > 4 && hr < 8 && fert(x, z) > 0.5 ? 0.08 : 0 }; }
function quiet(S) { return !!(S.q.inPit || S.q.vision || between(S, 'c2_tempt3', 'c3_cell') || S.step === 'c1_caravan' || S.step === 'c3_wait'); }
function ledger(S, G) { const w = Object.keys(S.q.words || {}).length; return { title: '요셉의 기록', rows: [['배운 애굽 말', w + '개'], ['지은 곳간', ['granA', 'granB', 'granC'].filter(k => S.built[k]).length + '채'], ['곡식을 판 사람', Object.keys(S.q.sold || {}).length + '명'], ['지난 날', S.day + '일']] }; }
function worldFacts(S) {
  if (before(S, 'c1_caravan')) return '요셉은 헤브론에 사는 야곱의 열한째 아들로, 채색옷을 입은 열일곱 살 목자 소년이다.';
  if (before(S, 'c3_cell')) return '여기는 애굽 땅이다. 요셉은 가나안에서 팔려 온 히브리 종으로, 시위대장 보디발의 집에서 일한다. 애굽 말을 배우는 중이다.';
  if (before(S, 'c4_court')) return '요셉은 왕의 옥에 갇힌 히브리 사람이다. 간수장이 옥중 일을 그에게 맡겼다.';
  return '요셉은 바로가 세운 애굽의 총리(사브낫바네아)다. 풍년에 오분의 일을 거두어 곳간에 쌓게 했다. 여기는 애굽 땅이고, 사람들은 나일 강을 따라 산다.';
}
function rumors(S) { if (between(S, 'c6_open')) return ['곳간 문이 열렸습니다! 총리님 덕분에 우리 아이들이 살았습니다.', '가나안에서도 곡식을 사러 사람들이 온다고 합니다.']; /* v18.42 said to the vizier himself: polite */
  if (between(S, 'c5_patrol')) return ['총리님이 각 성마다 곳간을 짓게 하셨대요.', '버금 수레를 탄 총리님을 봤소? 히브리 사람이라던데.', '올해는 밀이 사람 키만큼 자랐어요!'];
  return ['나일 강이 불어날 철이 다가오오.', '온의 신전 앞에 새 오벨리스크를 세운다더군요.']; }
const chatter = [
  { a: 'cook', b: 'gardener', when: S => between(S, 'c2_arrive', 'c2_tempt2'), lines: [[0, '앙쿠! 연못 물 좀 쓰자니까.'], [1, '연꽃이 다 죽는다고 몇 번을 말해!']] },
  { a: 'neb', b: 'ameni', when: S => between(S, 'c2_arrive', 'c2_quiz'), lines: [[0, '저 히브리 녀석, 말 한마디 못 알아듣던데.'], [1, '두고 보게. 눈빛이 다른 아이야.']] },
  { a: 'prisA', b: 'prisB', when: S => between(S, 'c3_keeper', 'c3_wait'), r: 7, lines: [[0, '저 히브리 사람은 왜 늘 기도하지?'], [1, '그 덕에 우리가 물이라도 마시잖아.']] },
  { a: 'magician', b: 'sage', when: S => between(S, 'c4_court', 'c4_answer'), r: 16, lines: [[0, '히브리 죄수가 바로의 꿈을 푼다고?'], [1, '…우리가 못 푼 꿈이오. 지켜봅시다.']] },
  { a: 'reuben', b: 'judah', when: S => S.step === 'c1_pit', r: 8, lines: [[0, '…해가 지면 내가 구덩이 쪽을 살펴보겠다.'], [1, '왜, 형? 마음이 약해졌소?']] },
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
    { art: OPEN_ART[5], kick: '요셉 편', title: '꿈꾸는 자', t: '형들에게 미움받던 열일곱 살 소년의 꿈은, 어떻게 이루어질까요? 이제 그 길을 직접 걸어 보세요.', ref: '창세기 37–47장', e: 'tender' }],
  setup: true, setupArt: OPEN_ART[5],
  after(S, G) {
    /* v18.35 he begins out in the open, sitting by the morning fire (he used to wake up in the tent and had to find his way out of it) */
    const bx = 177.11, bz = 153.76, h = hAt(bx, bz), jx = 170.6, jz = 150.8, ff = Math.atan2(176 - bx, 153 - bz);
    G.teleport(bx, bz, ff); cpose('stoolWarm', 0, true); S.time = 6.4; /* v23 on the log seat beside the fire (he crouched on the bare ground) */
    cine([{ hour: 6.4, cam: [bx + 30, h + 26, bz + 34], cam2: [bx + 7, h + 4, bz + 7], look: [176, h + 1, 152], look2: [bx, h + 0.8, bz], dur: 7, music: 'j_canaan', t: '헤브론 골짜기에 아침이 밝았습니다.', ref: '창세기 37:14' },
      { cam: [bx + 2.6, h + 1.15, bz + 2.2], look: [176.6, h + 0.55, 153.4], dur: 5, fov: 0.72, t: '요셉은 모닥불 곁에 앉아 아침 공기에 손을 녹이고 있었습니다.' },
      { cam: [bx - 0.7, h + 1.35, bz + 1.4], look: [jx, hAt(jx, jz) + 1.5, jz], dur: 4.5, fov: 0.62, n: '야곱', t: '요셉아! 이리 오너라!', e: 'tender' },
      { fn: () => { cpose(null); { const ux = jx - bx, uz = jz - bz, ul = Math.hypot(ux, uz); G.teleport(bx + ux / ul * 0.55, bz + uz / ul * 0.55); } /* v23 he stands up off the log, a step toward his father */ G.P.face = Math.atan2(jx - bx, jz - bz); }, cam: [bx + 2.2, h + 1.45, bz + 1.6], look: [bx, h + 1.1, bz], dur: 4.2, fov: 0.8, n: '요셉', t: '네, 아버지! 지금 가요!', e: 'happy' },
      { cam: [jx + 3, hAt(jx, jz) + 1.7, jz + 4], look: [jx, hAt(jx, jz) + 1.4, jz], dur: 3.6, t: '아버지 야곱이 장막 앞에서 요셉을 기다리고 있었습니다.' }],
    () => { GG.Game.musicOverride = null; { const C = GG.Game.CAM, f = Math.atan2(jx - G.P.x, jz - G.P.z); G.P.face = f; if (C) { C.yaw = f + Math.PI; C.yv = 0; C.hold = 1; } } /* v18.56 the first look: from behind Joseph, toward his father (as before v18.40) */ narr([{ kick: '조작 안내', title: '프롤로그 · 형들을 찾아서', t: '왼쪽 아래를 끌어 걷고, 오른쪽 화면을 끌어 둘러봐요. 사람이나 물건 가까이에서 A를 누르면 말하거나 챙길 수 있어요. 갈 곳은 오른쪽 위 미니맵의 노란 길과 화살표가 알려 줘요.', ref: '' }]); }, { noSkip: false });
  },
};

// ------------------------------------------------------------------ REGISTER
G.EP.joseph = {
  roadD, handOnly: S => between(S, 'c1_market', 'c4_answer') ? ['jar', 'bigjar', 'sickle'] : null, /* v18.35 a new slave: his hands hold the jar he was given, or nothing */
  floor: (x, z) => { for (const p of GG.WADE || []) { const dx = Math.abs(x - p.x), dz = Math.abs(z - p.z); if (dx < p.w / 2 + 0.4 && dz < p.d / 2 + 0.4) return dx >= p.w / 2 || dz >= p.d / 2 ? p.y + 0.42 : p.y + 0.04; } return pitFloor(x, z); }, // v16.9 the pit collar · v18.35 pools to wade in
  id: 'joseph', title: '요셉 편 · 꿈꾸는 자', hero: '요셉', sub: '창세기 37–47장',
  blurb: '채색옷을 입은 소년이 형들을 찾아 나섰다가 구덩이에 던져집니다. 은 이십에 팔려 애굽의 종이 되고, 누명을 쓰고 옥에 갇혀도 하나님은 그와 함께 하셨습니다. 보디발의 집과 왕의 옥을 지나 바로 앞에 서기까지.',
  chapters: [{ t: '프롤로그 · 형들을 찾아서', r: '창 37:12–17' }, { t: '1장 · 구덩이', r: '창 37:18–36' }, { t: '2장 · 보디발의 집', r: '창 39:1–20' }, { t: '3장 · 왕의 옥', r: '창 39:20–41:14' },
    { t: '4장 · 바로의 꿈', r: '창 41:14–45' }, { t: '5장 · 일곱 해 풍년', r: '창 41:46–52' }, { t: '6장 · 일곱 해 흉년', r: '창 41:53–42:9' }, { t: '7장 · 형제들', r: '창 42:9–45:15' }, { t: '8장 · 고센 땅', r: '창 45:16–47:26' }, { t: '에필로그 · 고센의 이스라엘', r: '창 47:27' }],
  spec: { size: SIZE, cell: 2, seed: 37, height, color, water: { level: -0.35, shallow: [0.36, 0.62, 0.56], deep: [0.14, 0.32, 0.36] } },
  build, npcs, pens, fields, sites, specials, shops, stations, spots: SPOTS, steps, talk, chatter, envx: ENVX, quests: QUESTS,
  outfits: Object.assign({ default: LOOK.josephCoat }, ...['josephCoat', 'josephPlain', 'josephSlave', 'josephServant', 'josephSteward', 'josephFled', 'josephPrisoner', 'josephFettered', 'josephShaved', 'josephVizier'].map(k => ({ [k]: LOOK[k] })), { prisoner: LOOK.josephPrisoner }, WARD_LOOKS),
  start: { step: 'p_wake', x: 177.11, z: 153.76, face: -2.2, /* v18.35 by the fire, out in the open */ time: 6.4, silver: 0, inv: {}, tools: {}, outfit: 'josephCoat' },
  recipes: ['bread', 'bbread', 'linen', 'brick', 'grain', 'grainW', 'hay', 'torch'],
  showStaff: false, rain: 0.02, sleepFrom: 17, titleCam: { x: 176, z: 152, r: 32, h: 9, ty: 1.5 }, titleTime: 17.6, titleMusic: 'j_theme', timeScale: 1,
  openWardrobe, wardOk: S => !before(S, 'c5_patrol'),
  mood, update, skinned, dyn, flats, bounds, camera, speedMul, pose, rootY, extra, onDay, onLoad, canSleep, music, ledger, aridAt, waterDist, climate, noRain: false,
  villages, strangers, opening: OPENING, places: PLACES, roads: ROADS, roadD, rumors, worldFacts, quiet, calmWeather, calmSurv,
  heroName: S => between(S, 'c5_patrol') ? '요셉 (사브낫바네아)' : '요셉', heroCall: S => between(S, 'c5_patrol') ? '총리님' : '요셉', settled: (x, z) => inLevel(x, z, 3) || PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 10),
  canBuild: () => '요셉 편에서는 정해진 곳간 터에만 지을 수 있어요',
  _dbg: { RT, stage, VISION, WAIT, ORDER, hAt, cin: (k, nx) => ({ cinNight, cinPlot, cinPit, cinSold, cinCaravanNight, cinReveal, cinMarket, cinGrab, cinAccuse, windowPray, cinOfficers, cinBirthday, cinPharaohDream, courtIntro, cinInvest, plentyMontage, cinBrothers })[k](GG.Game.S(), GG.Game, nx || (() => { })) },
};
{ const u0 = G.EP.joseph.update; G.EP.joseph.update = function (dt, S) { if (u0) u0.apply(this, arguments); goshenTick(dt, S); }; } // v16.7 고센 마을
// ------------------------------------------------------------------ v18.78 chapter cards: one picture for each chapter, a breath between chapters (js/chapters.js shows it)
const CARD_SKY = (id, a, b, c) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".65" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${id})"/>`;
const MAN = (x, y, s, c, o) => `<g opacity="${o || 1}"><circle cx="${x}" cy="${y - 13 * s}" r="${3.6 * s}" fill="${c}"/><path d="M${x - 4.6 * s} ${y - 9 * s}Q${x} ${y - 11 * s} ${x + 4.6 * s} ${y - 9 * s}L${x + 5.6 * s} ${y + 6 * s}H${x - 5.6 * s}z" fill="${c}"/></g>`;
const BOW = (x, y, s, c) => `<g><circle cx="${x + 7 * s}" cy="${y - 2.6 * s}" r="${3 * s}" fill="${c}"/><path d="M${x - 7 * s} ${y}Q${x - 6 * s} ${y - 8 * s} ${x + 4 * s} ${y - 5 * s}L${x + 5 * s} ${y}z" fill="${c}"/></g>`;
const CAMEL = (x, y, s, c) => `<path d="M${x} ${y}l${2 * s} ${-9 * s}q${3 * s} ${-6 * s} ${7 * s} ${-2 * s}q${3 * s} ${-5 * s} ${7 * s} 0l${3 * s} ${-5 * s}q${2 * s} ${-2 * s} ${4 * s} 0l${-2 * s} ${8 * s}l${-1 * s} ${8 * s}h${-1.5 * s}l${-1 * s} ${-6 * s}l${-8 * s} 0l${-1 * s} ${6 * s}h${-1.5 * s}z" fill="${c}"/>`;
const PALM = (x, y, h, c) => `<path d="M${x} ${y}q${-3} ${-h / 2} ${2} ${-h}" stroke="${c}" stroke-width="3" fill="none"/><g fill="${c}"><path d="M${x + 2} ${y - h}q-14 -4 -22 6q12 -9 22 -6z"/><path d="M${x + 2} ${y - h}q14 -5 22 5q-12 -8 -22 -5z"/><path d="M${x + 2} ${y - h}q-4 -12 -16 -14q13 4 16 14z"/><path d="M${x + 2} ${y - h}q6 -12 18 -12q-13 3 -18 12z"/></g>`;
const DOMEG = (x, y, s, c, d) => `<g><rect x="${x - 9 * s}" y="${y - 22 * s}" width="${18 * s}" height="${22 * s}" fill="${c}"/><ellipse cx="${x}" cy="${y - 22 * s}" rx="${9 * s}" ry="${8 * s}" fill="${c}"/><rect x="${x - 2.6 * s}" y="${y - 30 * s}" width="${5.2 * s}" height="${4 * s}" fill="${d}"/></g>`;
const SHEAF = (x, y, s, c) => `<g fill="${c}"><path d="M${x - 1.5 * s} ${y}L${x - 3 * s} ${y - 16 * s}Q${x} ${y - 24 * s} ${x + 3 * s} ${y - 16 * s}L${x + 1.5 * s} ${y}z"/><rect x="${x - 3.6 * s}" y="${y - 9 * s}" width="${7.2 * s}" height="${1.6 * s}" fill="#9a6a2a"/></g>`;
const COW = (x, y, s, c, thin) => { const b = thin ? 3.2 : 6; return `<g fill="${c}"><ellipse cx="${x}" cy="${y - 7 * s}" rx="${9 * s}" ry="${b * s}"/><circle cx="${x + 10 * s}" cy="${y - 9 * s}" r="${2.8 * s}"/><rect x="${x - 7 * s}" y="${y - 6 * s}" width="${1.4 * s}" height="${7 * s}"/><rect x="${x + 5 * s}" y="${y - 6 * s}" width="${1.4 * s}" height="${7 * s}"/></g>`; };
const CARD_ART = {
  2: SV(`<path d="M0 132Q90 112 180 126T320 118V200H0z" fill="#7a4a30"/><path d="M0 150Q100 136 200 146T320 140V200H0z" fill="#5a3422"/>
    ${CAMEL(210, 118, 1.3, '#3a2218')}${CAMEL(238, 116, 1.2, '#3a2218')}${CAMEL(264, 115, 1.1, '#3a2218')}${MAN(196, 118, 0.9, '#3a2218')}
    <ellipse cx="150" cy="168" rx="58" ry="20" fill="#2a1a12"/><ellipse cx="150" cy="168" rx="58" ry="20" fill="none" stroke="#8a6a4a" stroke-width="5"/><ellipse cx="150" cy="172" rx="44" ry="13" fill="#140c08"/>
    ${BOY(150, 160, 0.42)}${MAN(98, 152, 1.3, '#24160e')}${MAN(116, 148, 1.25, '#24160e')}${MAN(196, 150, 1.3, '#24160e')}`, CARD_SKY('k2', '#3a2a5a', '#d0784a', '#f2b060')),
  3: SV(`<path d="M0 170H320V200H0z" fill="#e8d2a2"/><rect x="40" y="70" width="190" height="100" fill="#efe6d2"/><rect x="40" y="62" width="190" height="10" fill="#2c5aa0"/><rect x="40" y="72" width="190" height="4" fill="#b3472e"/>
    <rect x="118" y="112" width="34" height="58" fill="#5a3a22"/>${[64, 90, 180, 206].map(x => `<rect x="${x - 5}" y="80" width="10" height="90" fill="#e2d6ba"/><rect x="${x - 8}" y="76" width="16" height="6" fill="#2f8a77"/>`).join('')}
    ${PALM(268, 172, 70, '#3a6a3a')}${PALM(292, 176, 56, '#2f5a32')}<ellipse cx="275" cy="182" rx="34" ry="6" fill="#6aa8c8"/>
    ${BOY(100, 150, 0.8, '#b07850').replace(/fill="#(b3472e|e5b552|2f8a77|2c5aa0|c06a9a|f0e6cc)"/g, 'fill="#f0e6cc"')}<path d="M110 134q10 -6 14 4l-4 10q-8 0 -10 -6z" fill="#b5673a"/>`, CARD_SKY('k3', '#7fb2d8', '#f0dcb0', '#f2c890')),
  4: SV(`<rect width="320" height="200" fill="#1a1626"/><rect x="0" y="0" width="320" height="200" fill="#2a2236"/>
    <rect x="196" y="38" width="44" height="34" fill="#0d1428"/>${[204, 214, 224, 234].map(x => `<rect x="${x}" y="38" width="3" height="34" fill="#3a2a1a"/>`).join('')}<circle cx="226" cy="52" r="6" fill="#f2eedc" opacity=".9"/>
    <path d="M196 72L240 72L180 200L80 200z" fill="#e8e0c8" opacity=".14"/><path d="M0 178H320V200H0z" fill="#3a3024"/>${[...Array(14)].map((_, i) => `<path d="M${30 + i * 18} 186l6 -8" stroke="#8a7a52" stroke-width="2"/>`).join('')}
    <g fill="#120e18"><circle cx="146" cy="138" r="7"/><path d="M134 148Q146 140 158 148L166 176H126z"/><path d="M138 150l-6 -16l4 -2l6 14z"/><path d="M154 150l6 -16l-4 -2l-6 14z"/></g><path d="M139 148q7 -4 14 0" stroke="#e8e0c8" stroke-width="1" opacity=".5" fill="none"/>`),
  5: SV(`${STARS(40, 9)}<circle cx="262" cy="34" r="12" fill="#f4ecd0"/><circle cx="268" cy="30" r="11" fill="#14183a"/><path d="M0 120H320V152H0z" fill="#22406a"/><path d="M0 128Q160 122 320 130" stroke="#5a86b8" stroke-width="2" fill="none" opacity=".6"/><path d="M0 152H320V200H0z" fill="#2a3a22"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => COW(28 + i * 20, 116, 0.95, '#c88a4a')).join('')}${[0, 1, 2, 3, 4, 5, 6].map(i => COW(28 + i * 20, 172, 0.9, '#5a4a3a', true)).join('')}
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${180 + i * 18} 112q2 -22 0 -40" stroke="#c8a040" stroke-width="2" fill="none"/><ellipse cx="${180 + i * 18}" cy="${70 - (i % 2) * 2}" rx="3.4" ry="9" fill="#e8c050"/>`).join('')}
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${180 + i * 18} 196q2 -18 -2 -32" stroke="#7a6a3a" stroke-width="1.6" fill="none"/><ellipse cx="${178 + i * 18}" cy="${164}" rx="1.6" ry="7" fill="#8a7a4a"/>`).join('')}`, CARD_SKY('k5', '#0a1230', '#1e2a58', '#3a3a6a')),
  6: SV(`<circle cx="246" cy="52" r="26" fill="#fff2c0" opacity=".9"/><path d="M0 128Q100 116 200 126T320 120V200H0z" fill="#d8a848"/>${[...Array(9)].map((_, r) => [...Array(16)].map((_, i) => SHEAF(12 + i * 20 + (r % 2) * 10, 150 + r * 7, 0.42 + r * 0.03, r % 2 ? '#e8b848' : '#d4a030')).join('')).join('')}
    <path d="M60 128H244V136H60z" fill="#c8a878"/>${DOMEG(98, 128, 1.6, '#f4ecd8', '#3a2618')}${DOMEG(152, 128, 1.6, '#f4ecd8', '#3a2618')}${DOMEG(206, 128, 1.6, '#f4ecd8', '#3a2618')}
    <rect x="70" y="106" width="164" height="4" fill="#2c5aa0" opacity=".85"/>${[0, 1, 2, 3].map(i => `<ellipse cx="${240 + i * 9}" cy="${132 - (i % 2) * 3}" rx="5" ry="4" fill="#c8a060"/>`).join('')}`, CARD_SKY('k6', '#f2c860', '#f8e2a8', '#f0c070')),
  7: SV(`<circle cx="70" cy="44" r="20" fill="#fffaf0" opacity=".85"/><path d="M0 120Q120 110 320 118V200H0z" fill="#c8b088"/>
    ${[...Array(18)].map((_, i) => `<path d="M${(i * 37) % 320} ${130 + (i * 13) % 60}l${8 + (i % 4) * 4} ${(i % 3) * 4 - 4}l${6} ${6}" stroke="#8a6a48" stroke-width="1.4" fill="none"/>`).join('')}
    <path d="M196 118H268V124H196z" fill="#b8a07c"/>${DOMEG(232, 118, 1.7, '#ece2cc', '#2a1a10')}<rect x="226" y="100" width="12" height="18" fill="#1a120c"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => MAN(210 - i * 19, 160 + (i % 2) * 4, 1.25, '#5a4636')).join('')}${[0, 2, 4, 6].map(i => `<ellipse cx="${216 - i * 19}" cy="${156 + (i % 2) * 4}" rx="4" ry="5" fill="#b8955a"/>`).join('')}`, CARD_SKY('k7', '#c8cdd4', '#e4dcc8', '#d8c09a')),
  8: SV(`<path d="M0 150Q160 140 320 152V200H0z" fill="#c8a878"/>${[0, 1, 2].map(i => SHEAF(40 + i * 26, 92, 1.5, '#e8c060')).join('')}${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => SHEAF(20 + i * 26, 104, 0.9, 'rgba(232,192,96,.35)')).join('')}
    <path d="M226 150H300V160H226z" fill="#d8b878"/><g fill="#f0e6cc"><circle cx="262" cy="104" r="5"/><path d="M254 112Q262 108 270 112L274 150H250z"/></g><rect x="252" y="112" width="20" height="4" fill="#d9a73a"/>
    ${[0, 1, 2, 3, 4].map(i => BOW(36 + i * 34, 166, 1.9, '#4a3426')).join('')}${[0, 1, 2, 3, 4].map(i => BOW(52 + i * 34, 186, 1.9, '#3a281c')).join('')}`, CARD_SKY('k8', '#8aa8c8', '#e8d6b0', '#d8b080')),
  9: SV(`<path d="M0 132Q110 118 200 130T320 124V200H0z" fill="#7aa84a"/><path d="M0 160Q120 148 320 162V200H0z" fill="#5a8a3a"/>
    <path d="M30 132L56 104L84 132z" fill="#3a2a22"/><path d="M70 134L92 110L116 134z" fill="#4a3428"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${40 + i * 14}" cy="${170 + (i % 2) * 6}" rx="6" ry="4" fill="#f4f0e4"/>`).join('')}
    <g><path d="M236 156h40l-4 -14h-32z" fill="#8a6a48"/><circle cx="242" cy="160" r="6" fill="none" stroke="#5a4030" stroke-width="2.4"/><circle cx="270" cy="160" r="6" fill="none" stroke="#5a4030" stroke-width="2.4"/></g>
    <g><circle cx="152" cy="118" r="5.4" fill="#e8dcc8"/><path d="M144 124Q152 120 160 124L163 160H141z" fill="#5a4636"/><path d="M140 126L132 162" stroke="#6a4a2a" stroke-width="2"/></g>
    <g><circle cx="164" cy="114" r="5.4" fill="#c98a5a"/><path d="M156 120Q164 116 172 120L176 160H152z" fill="#f4ecd8"/><rect x="156" y="120" width="16" height="3.4" fill="#d9a73a"/><path d="M158 126Q152 128 150 134" stroke="#f4ecd8" stroke-width="4" fill="none"/></g>`, CARD_SKY('k9', '#9ac0e0', '#e8f0e0', '#d8e8b8')),
};
const CARD_VERSE = { 2: ['그를 잡아 구덩이에 던지니 그 구덩이는 빈 것이라 그 속에 물이 없었더라.', '창세기 37:24'], 3: ['여호와께서 요셉과 함께 하시므로 그가 형통한 자가 되어 그 주인 애굽 사람의 집에 있으니', '창세기 39:2'],
  4: ['여호와께서 요셉과 함께 하시고 그에게 인자를 더하사 전옥에게 은혜를 받게 하시매', '창세기 39:21'], 5: ['만 이 년 후에 바로가 꿈을 꾼즉 자기가 하숫가에 섰는데', '창세기 41:1'],
  6: ['칠 년 풍년에 토지 소산이 심히 많은지라.', '창세기 41:47'], 7: ['온 지면에 기근이 있으매 요셉이 모든 창고를 열고 애굽 백성에게 팔새', '창세기 41:56'],
  8: ['그들이 피차에 말하되 우리가 아우의 일로 인하여 범죄하였도다.', '창세기 42:21'], 9: ['요셉이 … 그 아비 이스라엘을 맞으러 고센으로 올라가서 아비에게 보이고 그 목을 어긋맞추어 안고 얼마 동안 울매', '창세기 46:29'] };
G.EP.joseph.chapterCards = {}; for (const k in CARD_ART) { const ch = +k, c = G.EP.joseph.chapters[ch - 1] || {}; G.EP.joseph.chapterCards[ch] = { art: CARD_ART[k], kick: c.r ? c.r.replace(/^창 /, '창세기 ') : '', title: c.t || '', t: CARD_VERSE[k][0], ref: CARD_VERSE[k][1] }; }
GG.NpcAI && GG.NpcAI.register(G.EP.joseph);
})(window.G);
