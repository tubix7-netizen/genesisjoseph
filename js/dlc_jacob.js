/* 약속의 길 — v18.60 (v18.64 따로 된 지도 · v18.82 일곱 장면) 창세기 야곱 편 · 라헬을 위한 일곱 해 (dlc_jacob.js)   창 29:1–30 (30:30, 31:38–40)
   고센에서 아버지 야곱이 들려주는 젊은 날 이야기 속으로 들어가, 젊은 야곱이 되어 하란에서 라반의 양 떼를 일곱 해 동안 쳐요.
   흐름: ① 우물가의 목자들 → ② 우물 돌 굴리기 · 라헬 → ③ 라반과 품삯 → ④ 일곱 해 → ⑤ 혼인 잔치와 레아 → ⑥ 라헬
   v18.82 「칠 년을 수일같이」(29:20): 일곱 해는 해마다 서로 다른 한 가지 일이에요(YEARS). 그 사이의 날들은 해 카드로 빠르게 지나가요.
     1 봄 들의 우물(떼가 다 모이기를 기다려 차례로 물 · 29:3) · 2 봄 새끼 낳는 밤(31:38) · 3 여름 한낮 더위(떼를 몰고 강가 그늘로 · 31:40)
     4 가을 밤의 맹수(밤새 지키고 새벽에 발자국 따라가기 · 31:39) · 5 겨울 서리 내린 밤(불 피우고 눈 붙일 겨를 없이 · 31:40)
     6 봄 양털 깎는 날(깎고 이어 라반의 곳간으로) · 7 여름 양 떼를 세는 날(지팡이 아래로 · 30:30)
     같은 놀이를 두 해에 쓰지 않아요. 양 떼 수는 보이기만 해요(NS). 철마다 하던 목장 일 · 일손 · 신임 · 마음 · 올해의 일은 없앴어요.
   v18.82 성경만: 라헬 · 레아 · 라반 · 실바 · 빌하(성경 인물)는 성경 말씀 말고는 말하지 않아요(말을 걸면 몸짓만 · 서로 말풍선도 없어요).
     하란의 목자들 · 라반의 아들들 · 아이 · 노인(성경에 이름이 없는 사람)은 자유롭게 말해요. 정답 없는 고르기는 없앴어요.
   땅(v18.64 따로 된 지도 · dlcep.js · 걷는 곳 x ±66 · z ±58, 그 밖은 들판과 언덕): 서쪽 큰길 → 들의 우물(양 세 떼) → 라반의 집 마당(벌집 지붕 집 · 화덕 · 베틀 · 염소 우리)
     → 야곱의 양 우리 · 털 깎는 곳 → 풀밭 셋 · 다른 목자들의 우리 · 장막 → 동쪽 발릭 강(얕은 여울, 지도 밖까지 흘러요) · 북서쪽 하란 성읍 · 남서쪽 보리밭 · 올리브 숲.
     길 · 마당 · 풀밭 · 밭 · 강가는 땅에 칠해요(ground). 지도의 장소 이름은 PLACES.
   짐승: 양 떼 · 염소 · 나귀 · 낙타 · 개는 이 파일이 직접 그려요(spec.skinned → drawHerd).
   저장: G.DLC.st('jacob') = { ch, T: { v: 2, y 해, k 그 해의 몇째 일, n 양 떼, wt 남은 기다림(초), … }, fin, done, best } (옛 저장의 T는 들어올 때 그 해의 처음으로 바꿔요) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, XL = G.DLCEP, D = G.DLC; if (!Game || !EP || !XL || !D) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (a, b, c) => D.pop ? D.pop(a, b, c) : (G.UI.pop || G.UI.toast)(a, b, c), toast = m => D.toast ? D.toast(m) : G.UI.toast(m);
const st = () => D.st('jacob'), say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), Ln = D.Ln, T = D.T, J = (t, ref, e) => ({ n: '야곱', t, ref, e });
const BX = 0, BZ = 0, BY = 0; /* v18.64 the story has a map of its own: the stage is the middle of it, at height 0 */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), angd = (a, b) => { let d = (b - a) % 6.2832; if (d > 3.1416) d -= 6.2832; if (d < -3.1416) d += 6.2832; return d; };

// ------------------------------------------------------------------ 생김새 (늙은 야곱 · 본편 사람들과 겹치지 않게)
const LK = {
  jacobY: { skin: 0xd8a070, hair: 0x2a1c12, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1c12, eye: 0x4a2a14, build: 1.05, jaw: 0.15, browAng: 0.05, top: 0xd6c6a0, under: 0xd6c6a0, trim: 0x8a4434, belt: 0x5a3a24, headwear: 'band', bandCol: 0x8a4434, bag: 0x6a4428, legWrap: 0x8a7458, mantle: 0x6a5238, mantleShort: true, mantleTrim: 0x8a4434, vary: false },
  laban: { skin: 0xcf9a6c, hair: 0x5a5048, beard: 'long', beardCol: 0x7a7068, eye: 0x3a2a1a, build: 1.25, jaw: 0.45, browAng: 0.4, smile: 0.25, long: true, top: 0x3e5a4a, under: 0xe0d0a8, trim: 0xd8b060, trim2: 0x7a2a2a, mantle: 0x7a2a2a, mantleTrim: 0xd8b060, sash: 0xd8b060, headwear: 'turban', clothCol: 0xe6d6b0, bandCol: 0x7a2a2a, belt: 0x4a3020, sandal: 0x6a4a2a, age: 'old', vary: false },
  rachel: { skin: 0xe6b086, fem: true, long: true, hair: 0x24140c, hairStyle: 'braid', eye: 0x3a2412, top: 0xb84a3a, under: 0xe8dcc0, trim: 0xe0b040, sash: 0xe0b040, headwear: 'cloth', clothCol: 0xf0e6d2, clothStripe: 0xb84a3a, bandCol: 0xb84a3a, smile: 0.45, browAng: 0.1, bust: 0.9, vary: false },
  leah: { skin: 0xdcab84, fem: true, long: true, hair: 0x3a2618, hairStyle: 'bun', eye: 0x5a4a3a, top: 0x3e5a8a, under: 0xd8ccb0, trim: 0xe0c070, trim2: 0x8a5a9a, headwear: 'veil', clothCol: 0xe0d6c0, clothStripe: 0x3e5a8a, browAng: -0.35, smile: 0.2, bust: 1.0, vary: false },
  zilpah: { skin: 0xc48c5c, fem: true, long: true, hair: 0x1e140c, hairStyle: 'tied', top: 0xb8a47e, under: 0xb8a47e, trim: 0x6a5238, headwear: 'cloth', clothCol: 0xc8b896, bandCol: 0x6a5238, barefoot: true, smile: 0.35 },
  bilhah: { skin: 0xd09a6a, fem: true, long: true, hair: 0x2a1a10, hairStyle: 'long', top: 0x8a7a5a, under: 0xc8b896, trim: 0x4a6a4a, headwear: 'veil', clothCol: 0xa89878, clothStripe: 0x4a6a4a, barefoot: true, browAng: -0.1 },
  son1: { skin: 0xcf9a6c, hair: 0x2a1c12, hairStyle: 'short', beard: 'short', beardCol: 0x2a1c12, build: 1.15, jaw: 0.35, browAng: 0.45, top: 0x5a6a7a, trim: 0xd8b060, belt: 0x3a2a1a, headwear: 'turban', clothCol: 0xd8c8a0, bandCol: 0x5a6a7a, mantle: 0x4a4a5a, mantleShort: true },
  son2: { skin: 0xd8a070, hair: 0x2a1c12, hairStyle: 'wild', build: 0.8, browAng: 0.15, smile: 0.5, top: 0xa86a3a, sleeveless: true, trim: 0x5a3a22, belt: 0x5a3a22, legWrap: 0x8a7458 },
  shepOld: { skin: 0xb88050, hair: 0xd0c8bc, beard: 'long', beardCol: 0xe0d8cc, age: 'old', build: 0.7, browAng: -0.1, top: 0x7a6a50, trim: 0x4a3a2a, mantle: 0x5a4a38, headwear: 'cloth', clothCol: 0xd8ccb4, bandCol: 0x4a3a2a, goatskin: true, legWrap: 0x6a5a48, bag: 0x5a3a24 },
  shepYoung: { skin: 0xc89060, hair: 0x2a1a10, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1a10, build: 0.95, browAng: 0.3, smile: 0.4, top: 0x9a8a62, sleeveless: true, trim: 0x5a4a32, belt: 0x5a4a32, headwear: 'band', bandCol: 0x3e5a3e },
  shep3: { skin: 0xb8784c, hair: 0x1a120c, beard: 'long', beardCol: 0x1a120c, build: 1.1, browAng: 0.35, long: true, stripes: [0x6a5a42, 0x6a5a42, 0xd8ccb0, 0x6a5a42, 0x3a2a1c], headwear: 'turban', clothCol: 0x8a3a2a, bandCol: 0x3a2a1c, legWrap: 0x5a4a38 },
  kid: { kid: true, skin: 0xd8a070, top: 0xd8c08a, trim: 0x7a4a2a, hair: 0x2a1810, hairStyle: 'curly', belt: 0x6a4428, noPouch: true },
  elder: { skin: 0xc8946a, hair: 0xe0d8cc, beard: 'long', beardCol: 0xe8e2d8, age: 'old', long: true, top: 0xe0d4b8, trim: 0x6a4a6a, mantle: 0x6a4a6a, headwear: 'turban', clothCol: 0xf0e8d8, bandCol: 0x6a4a6a, build: 0.8 } };
EP.outfits.dlcJacob = LK.jacobY;
const OLD = '하란의 늙은 목자', YNG = '하란의 젊은 목자', SH3 = '셋째 떼의 목자', SON1 = '라반의 큰아들', SON2 = '라반의 작은아들', ZIL = '여종 실바', BIL = '여종 빌하';

// ------------------------------------------------------------------ 자리 (무대 기준)
const SEA = ['봄', '여름', '가을', '겨울'], START = 40, NS = [40, 48, 57, 66, 76, 88, 102]; /* v18.82 the flock grows year by year (창 30:30 「번성하여 떼를 이루었나이다」) */
const OUT = [-60, 2.6], WELL = [-30, -6], FOLD = [16, 2], SHED = [28, 14], FIELD = [-36, 30], GATE = [-8, 13], F1 = [-14, -20], F2 = [8, -20], LOOM = [-1, 18], TANNUR = [-17, 17.5], CAMPF = [36, -34];
const LABAN_HOME = [-4.6, 10.4], RACHEL_HOME = [-0.8, 10.8], LEAH_HOME = [-1, 19.7];
const PAST = [{ n: '북쪽 풀밭', x: -2, z: -36, w: 40, d: 16 }, { n: '동쪽 풀밭', x: 38, z: -12, w: 16, d: 30 }, { n: '남쪽 시냇가 풀밭', x: 30, z: 40, w: 28, d: 12 }];
const RIVER = 55; /* 발릭 강: x 51.5 ~ 58.5 · 얕은 여울 */
const SHADE = [RIVER - 6.4, -24], BRUSH = [FOLD[0] + 10, FOLD[1] - 6], STORE = [2.6, 27.2]; /* v18.82 the poplar shade by the river · dry thorn bushes east of the fold · Laban's storeroom door */
const EWE = [FOLD[0] - 2.2, FOLD[1] + 1.2], TORN = [FOLD[0] + 14, FOLD[1] - 14], FIRE5 = [FOLD[0] - 6.8, FOLD[1] + 0.6], GATEF = [FOLD[0], FOLD[1] + 6.4]; /* v18.82 the ewe in labour · where the torn one lies · the frost-night fire · outside the fold's gate */
const YEAR_CARD = [ /* v18.82 one verse a year (개역한글) */
  ['첫 해', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'],
  ['둘째 해', '내가 이 이십 년을 외삼촌과 함께 하였거니와 외삼촌의 암양들이나 암염소들이 낙태하지 아니하였고', '창세기 31:38'],
  ['셋째 해', '내가 이와 같이 낮에는 더위와 밤에는 추위를 무릅쓰고', '창세기 31:40'],
  ['넷째 해', '물려 찢긴 것은 내가 외삼촌에게로 가져가지 아니하고 스스로 그것을 보충하였으며', '창세기 31:39'],
  ['다섯째 해', '…눈 붙일 겨를도 없이 지내었나이다.', '창세기 31:40'],
  ['여섯째 해', '때에 라반은 양털을 깎으러 갔었으므로…', '창세기 31:19'],
  ['일곱째 해', '내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었으니, 내 발이 이르는 곳마다 여호와께서 외삼촌에게 복을 주셨나이다.', '창세기 30:30']];
const YEARS = [ /* v18.82 one thing a year, each different, each with its own game (no more four seasons of the same chores) · at: where the year starts */
  { se: 0, hour: 9.5, wx: 'clear', title: '들의 우물', at: [WELL[0] + 2, WELL[1] + 3.3, -2.6], steps: ['들의 우물 · 다른 떼가 다 모이기를 기다리기', '떼마다 차례로 두레박 물 붓기'] },
  { se: 0, hour: 21, wx: 'clear', title: '새끼 낳는 밤', at: [FOLD[0], FOLD[1] + 8.4, Math.PI], steps: ['밤 · 우리 안 해산하는 어미양 곁에서 기다리기', '어미양을 달래며 새끼 받기', '갓 난 새끼를 마른 짚으로 닦아 주기'] },
  { se: 1, hour: 12.5, wx: 'clear', title: '한낮 더위', at: [PAST[0].x + 4, PAST[0].z + 9.5, Math.PI], steps: ['한낮 · 북쪽 풀밭에 지쳐 누운 양 떼 일으키기', '양 떼를 몰고 동쪽 강가 미루나무 그늘로', '그늘에서 더위가 가라앉기를 기다리기'] },
  { se: 2, hour: 21.5, wx: 'wind', title: '밤의 맹수', at: [FOLD[0], FOLD[1] + 8.4, Math.PI], steps: ['밤 · 우리 문 앞에서 양 떼 지키기', '새벽 · 짐승 발자국을 따라 없어진 양 찾기'] },
  { se: 3, hour: 17.2, wx: 'cloudy', title: '서리 내린 밤', at: [BRUSH[0] - 1.6, BRUSH[1] + 2.3, 2.5], steps: ['해 질 녘 · 우리 동쪽 덤불에서 마른 가지 꺾기', '우리 서쪽 곁에 불 피우기', '불 곁에서 밤새 떼 지키기'] },
  { se: 0, hour: 9, wx: 'clear', title: '양털 깎는 날', at: [SHED[0] - 1.2, SHED[1] - 2.9, 0.3], steps: ['털 깎는 곳 · 양털 깎기', '깎은 털 뭉치를 이고 라반의 곳간으로'] },
  { se: 1, hour: 17, wx: 'clear', title: '양 떼를 세는 날', at: [GATEF[0] - 2.2, GATEF[1] + 0.7, 2.4], steps: ['우리 문 · 지팡이 아래로 들어가는 양 떼 세기'] }];
const WT = { 1: [0, WELL, 9, 1.8, 6.5], 2: [0, EWE, 9, 1.2, 4], 3: [2, SHADE, 9, 4.2, 7], 5: [2, FIRE5, 11, 10.4, 5] }; /* v18.82 a real wait: year → [step, place, seconds, hours that pass, how near] */
const SPOT1 = { djShep: [WELL[0] - 3.2, WELL[1] + 2.6, 0.6], djShep2: [WELL[0] + 5, WELL[1] + 3.4, -0.9], djShep3: [WELL[0] - 6, WELL[1] - 4, 1.4] };
const TR1 = { w0: [-3.8, -2.6], w1: [3.6, -3], w2: [0, -4.4], flock: [3.6, -3] }, ORDER1 = ['w0', 'w1', 'w2', 'flock'], NAME1 = ['늙은 목자의 떼', '젊은 목자의 떼', '셋째 떼', '라반의 떼']; /* the troughs: each flock drinks in its turn (29:3) */
let LAND = null; const on = () => !!(LAND && LAND.on()), ch = () => st().ch | 0, TY = () => st().T;
const npc = id => Game.npc(id), fin = id => { const n = npc(id); if (n) n.talking = false; };
const newT = () => ({ v: 2, y: 1, k: 0, n: NS[0] }); /* v18.82 year · step in that year · flock */
const YR = () => { const T0 = TY(); return T0 ? YEARS[Math.min(6, Math.max(0, T0.y - 1))] : null; };
const flockAt = () => { for (const a of HERD) if (a.grp === 'flock') { a.tx = null; a.wait = Math.random() * 0.8; } };

/* 사람 자리: 장마다 서 있는 곳이 달라요 (이어하기로 불러와도 그 장의 자리로) */
function put1(id, l, face) { const n = npc(id); if (!n) return; const x = BX + l[0], z = BZ + l[1]; n.x = n.d.x = x; n.z = n.d.z = z; n.walk = null; if (n.wander) { n.wander.cx = x; n.wander.cz = z; n.wander.tx = null; } if (face !== undefined) n.face = n.homeFace = face; }
function placeCast() { const c = ch(), T0 = TY(), y = c === 3 && T0 ? T0.y : 0;
  if (c < 3 || (y === 1 && (T0.gath || T0.k >= 1))) for (const id in SPOT1) put1(id, SPOT1[id], SPOT1[id][2]);
  else { put1('djShep', [F1[0] + 1.2, F1[1] + 5.4], Math.PI); put1('djShep2', [CAMPF[0] - 2.6, CAMPF[1] + 2.2], 0.5); put1('djShep3', [F2[0] - 1.2, F2[1] + 5.4], Math.PI); }
  /* v18.82 Rachel is there, without words, on the days she would be: at the well, at the shearing, at the counting (the night years are Jacob's alone · 31:40) */
  put1('djRachel', c === 1 ? [WELL[0] + 5, WELL[1] + 0.8] : y === 1 ? [WELL[0] + 8.6, WELL[1] + 6] : y === 6 ? [SHED[0] - 3.4, SHED[1] + 3.4] : y === 7 ? [GATEF[0] - 4.6, GATEF[1] + 2.6] : RACHEL_HOME,
    c === 1 ? -1.73 : y === 1 ? -2.2 : y === 6 ? 0.9 : y === 7 ? 1.9 : Math.PI);
  put1('djLaban', y === 6 ? [SHED[0] + 3.6, SHED[1] + 3.4] : y === 7 ? [GATEF[0] + 2.6, GATEF[1] + 0.8] : LABAN_HOME, y === 6 ? -2.4 : y === 7 ? -1.2 : Math.PI);
  put1('djSon1', y === 6 ? [SHED[0] + 1.6, SHED[1] - 3.2] : [F2[0] - 4, F2[1] + 5.6], y === 6 ? 0.2 : Math.PI);
  put1('djLeah', c === 5 ? [-5.2, 11.4] : LEAH_HOME, c === 5 ? -0.8 : Math.PI); }

// ------------------------------------------------------------------ 일곱 해 (v18.82 · 해마다 서로 다른 한 가지 일 · 그 사이는 해 카드로 빠르게)
const YK = () => { const T0 = TY(); return ch() === 3 && T0 ? T0.y * 10 + (T0.k | 0) : 0; }; /* 11 = first year, first step … */
let waitNote = 0, qSec = -1, loadOn = false;
const sit = on => { P().cpose = on ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const setLoad = on => { loadOn = on; P().carry = on ? 'head' : (P().carry === 'head' ? null : P().carry); };
function startYear(tp) { const T0 = TY(), Y = YR(); if (!T0 || !Y) return; S().time = Y.hour; try { G.Weather && G.Weather.set && G.Weather.set(Y.wx, 3); } catch (e) { }
  T0.wt = 0; sit(false); setLoad(false); placeCast(); hInit = false; if (tp) Game.teleport(BX + Y.at[0], BZ + Y.at[1], Y.at[2]); }
function yearCard(cb) { const T0 = TY(), Y = YR(), C = YEAR_CARD[T0.y - 1];
  narr([D.card(`라헬을 위한 ${C[0]} · ${SEA[Y.se]}`, Y.title, C[1], C[2])], () => { G.UI.quest(); pop(Y.title, Y.steps[0], 'star'); cb && cb(); }); }
function next(m1, m2) { const T0 = TY(); T0.k++; T0.wt = 0; G.UI.quest(); if (m1) pop(m1, m2 || YR().steps[T0.k] || '', 'star'); }
function yearDone() { const T0 = TY(), y = T0.y; sit(false); setLoad(false); Game.insight && Game.insight(1, `야곱 편 · ${YEAR_CARD[y - 1][0]}`);
  if (y >= 7) { st().ch = 4; st().fin = { n: T0.n }; placeCast(); G.UI.quest(); pop('칠 년이 찼어요', '라반의 집 대문 앞에서 라반에게 말해요', 'star'); return; }
  G.UI.fade(() => { Object.assign(T0, { y: y + 1, k: 0, n: NS[y], wt: 0, open: 0, gath: 0, pour: 0, lamb: 0, wood: 0, fire: 0, wool: 0, torn: 0 }); startYear(true); }, () => yearCard()); }
function waitStart() { const T0 = TY(), w = WT[T0.y]; if (!w) return; T0.wt = w[2]; waitNote = 0; sit(true); G.UI.quest();
  if (T0.y === 1) { T0.gath = 1; for (const id in SPOT1) { const sp = SPOT1[id]; Game.npcWalk(id, BX + sp[0], BZ + sp[1], () => { const n = npc(id); if (n) { n.face = n.homeFace = sp[2]; n.d.x = n.x; n.d.z = n.z; } }, 3.2); } toast('목자들이 저마다 떼를 몰고 우물로 와요'); }
  else toast(T0.y === 2 ? '어미양 곁에 앉아 기다려요' : T0.y === 3 ? '그늘에 앉아 기다려요' : '불 곁에 앉아 밤을 지켜요'); }
function waitDone() { const T0 = TY(), y = T0.y; sit(false);
  if (y === 1) { S().time = 11.5; for (const id in SPOT1) { const n = npc(id); if (n && n.walk) put1(id, SPOT1[id], SPOT1[id][2]); }
    say([Ln(OLD, '자, 떼가 다 모였소. 다 같이 돌을 굴립시다.', 'happy'), T('모든 떼가 모이면 그들이 우물 아귀에서 돌을 옮기고 그 양 떼에게 물을 먹이고는 여전히 우물 아귀 그 자리에 돌을 덮더라.', '창세기 29:3')],
      () => { fin('djShep'); sfx('thud', { pitch: 0.6 }); T0.open = 1; next('목자들이 함께 돌을 옮겼어요', '먼저 온 떼부터 차례로 물을 부어요'); }); return; }
  if (y === 2) { S().time = 23; sfx('bleat', { vol: 0.5, pitch: 0.8 }); next('어미양이 힘을 주기 시작해요', '어미를 달래며 새끼를 받아요'); return; }
  if (y === 3) { S().time = 16.8; say([T('해가 기울자 강바람이 선선해졌습니다. 양 떼가 하나둘 일어나 다시 풀을 뜯습니다.')], () => yearDone()); return; }
  if (y === 5) { S().time = 5.6; say([T('새벽, 들에 하얗게 서리가 내렸습니다. 불은 밤새 꺼지지 않았고, 양 떼는 한 마리도 얼지 않았습니다.')], () => yearDone()); } }
/* first year · each flock to its trough in turn, then the stone goes back (29:3) */
function pour1() { const T0 = TY(); T0.pour = 1; sfx('pour'); pop(NAME1[0] + '가 먼저 마셔요', '먼저 온 떼부터 차례로', 'star');
  const step = () => { if (!on() || ch() !== 3 || TY() !== T0 || T0.y !== 1) return; if (T0.pour < 4) { T0.pour++; sfx('pour'); toast(NAME1[T0.pour - 1] + (T0.pour === 4 ? ' · 이제 내가 치는 떼 차례예요' : ' 차례예요')); setTimeout(step, 2600); return; }
    T0.pour = 0; say([Ln(OLD, '돌은 도로 덮어 둡시다. 저녁에 또 모입시다.'), T('목자들이 돌을 우물 아귀 그 자리에 다시 덮었습니다.')], () => { fin('djShep'); sfx('thud', { pitch: 0.6 }); T0.open = 0; yearDone(); }); };
  setTimeout(step, 2600); }
/* the steps' buttons: year*10 + step → [where, how near, label, what it does] */
function stepAct(T0) { const k = T0.y * 10 + T0.k;
  switch (k) {
    case 10: return T0.wt > 0 ? null : [WELL, 4.2, '우물 곁에 앉아 다른 떼를 기다리기', waitStart];
    case 11: return T0.pour ? null : [WELL, 4.2, '두레박으로 물 길어 구유에 붓기', pour1];
    case 20: return T0.wt > 0 ? null : [EWE, 2.6, '어미양 곁에 앉아 기다리기', waitStart];
    case 21: return [EWE, 2.6, '어미양을 달래며 새끼 받기', () => G.UI.minigame('balance', { title: '어미양을 달래며 새끼 받기', hint: '어미양이 아파서 몸부림쳐요. ◀ ▶ 로 어미를 달래, 흔들리는 표시가 가운데 초록 칸에 머물게 해요.', dur: 10 }, ok => {
      if (!ok) { toast('어미가 놀랐어요 · 숨을 고르고 다시 달래요'); return; } T0.lamb = 1; sfx('bleat', { vol: 0.6, pitch: 1.6 }); next('새끼가 나왔어요!', '젖은 새끼를 마른 짚으로 닦아 줘요'); })];
    case 22: return [EWE, 2.6, '마른 짚으로 새끼 닦아 어미 곁에', () => { T0.lamb = 2; sfx('rustle'); say([T('짚으로 닦아 주자 새끼가 비틀거리며 일어나 어미의 젖을 찾았습니다.')], () => yearDone()); }];
    case 30: { const p0 = PAST[0]; return [[p0.x, p0.z], 0, '지쳐 누운 양 떼 일으키기', () => { sfx('bleat', { vol: 0.6 }); next('양 떼가 일어났어요', '동쪽 발릭 강가 미루나무 그늘로 · 양 떼가 뒤따라와요'); }]; }
    case 32: return T0.wt > 0 ? null : [SHADE, 4.5, '그늘에 앉아 더위가 가라앉기를 기다리기', waitStart];
    case 40: return [GATEF, 3.4, '우리 문 앞에서 밤새 지키기', () => G.UI.minigame('wrestle', { title: '밤의 맹수', hint: '어둠 속 눈빛이 초록 칸에 들어올 때 눌러, 지팡이로 짐승을 쫓아요.', need: 5, dur: 30, unit: '쫓음', btn: '지팡이로 쫓기' }, ok => {
      G.UI.fade(() => { S().time = 5.8; }, () => say([T(ok ? '짐승을 쫓아냈습니다. 그러나 동이 틀 무렵 양을 세어 보니 한 마리가 없었습니다.' : '짐승은 어둠 속으로 달아났습니다. 동이 틀 무렵 양을 세어 보니 한 마리가 없었습니다.')], () => next('발자국을 따라가요', '우리 동쪽으로 짐승 발자국이 나 있어요'))); })];
    case 41: return [TORN, 3, '없어진 양 살피기', () => { T0.torn = 1; say([T('덤불 곁에 짐승에게 찢긴 양이 있었습니다.'), T('물려 찢긴 것은 내가 외삼촌에게로 가져가지 아니하고 스스로 그것을 보충하였으며, 낮에 도적을 맞았든지 밤에 도적을 맞았든지 외삼촌이 그것을 내 손에서 찾았으며', '창세기 31:39')], () => yearDone()); }];
    case 50: return [BRUSH, 3.2, '마른 가지 꺾기', () => { T0.wood = 1; sfx('rustle'); next('마른 가지 한 아름', '우리 서쪽 곁에 불을 피워요'); }];
    case 51: return [FIRE5, 2.6, '불 피우기', () => G.UI.minigame('push', { title: '불씨 살리기', hint: '부싯깃 위의 불씨에 꾹 눌러 바람을 불어요. 숨이 차면 잠깐 쉬었다가 다시 불어요.', btn: '후 불기', rate: 12 }, ok => {
      if (!ok) return; T0.fire = 1; sfx('fire'); next('불이 붙었어요', '불 곁에 앉아 밤새 떼를 지켜요'); })];
    case 52: return T0.wt > 0 ? null : [FIRE5, 2.6, '불 곁에 앉아 밤새 떼 지키기', waitStart];
    case 60: return [SHED, 3.4, '양털 깎기', () => G.UI.minigame('rhythm', { title: '양털 깎기', hint: '동그라미가 금에 닿을 때 가위질해요. 털이 한 장으로 이어지게 깎아요.', need: 8, beats: 14, btn: '가위질' }, ok => {
      if (!ok) { toast('털이 끊어졌어요 · 다시 깎아 봐요'); return; } T0.wool = 1; setLoad(true); sfx('rustle'); next('양털 한 장을 깎아 뭉쳤어요', '머리에 이고 라반의 집 마당 동쪽 끝 곳간으로'); })];
    case 61: return [STORE, 2.6, '곳간에 양털 들이기', () => { T0.wool = 2; setLoad(false); sfx('thud', { vol: 0.4 }); say([Ln(SON1, '올해 털이 이렇게 많이 나온 건 처음이야!', 'happy'), T('라반의 곳간에 양털이 쌓여 갔습니다.')], () => yearDone()); }];
    case 70: return [GATEF, 3.4, '지팡이 아래로 양 떼 세기', () => G.UI.minigame('count', { title: '지팡이 아래로 양 떼 세기', hint: '양이 한 마리씩 지팡이 아래로 지나 우리에 들어가요. 지날 때마다 눌러 세요. (렘 33:13 「양 떼가 다시 세는 자의 손 아래로 지나리라」)', need: flockVis(), btn: '하나 세기',
      onPress: () => { const a = HERD.find(q => q.grp === 'flock' && q.vis && !q.inF); if (a) { a.inF = true; a.tx = null; } sfx('bleat', { vol: 0.25, pitch: 1 + Math.random() * 0.3 }); } }, /* each tap sends the next sheep in through the gate */
      () => say([T('양 떼가 하나하나 지팡이 아래로 지나 우리에 들었습니다.')], () => narr([D.card('일곱 해의 끝', '라반의 양 떼', `처음 맡은 양 ${START}마리 → 이제 ${T0.n}마리`)], () => yearDone())))];
  }
  return null; }

// ------------------------------------------------------------------ 이야기 마디
function atWell() { say([J('내 형제여, 어디로서냐?', '창세기 29:4'), Ln(OLD, '하란에서로라.'), J('너희가 나홀의 손자 라반을 아느냐?', '창세기 29:5'), Ln(OLD, '아노라.'), J('그가 평안하냐?', '창세기 29:6'), Ln(OLD, '평안하니라. 그 딸 라헬이 지금 양을 몰고 오느니라.'),
    J('해가 아직 높은즉 짐승 모일 때가 아니니 양에게 물을 먹이고 가서 뜯기라.', '창세기 29:7'), Ln(OLD, '우리가 그리하지 못하겠노라. 떼가 다 모이고 목자들이 우물 아귀에서 돌을 옮겨야 우리가 양에게 물을 먹이느니라.', '', '창세기 29:8')],
  () => { fin('djShep'); st().ch = 1; const r = npc('djRachel'); if (r) { r.x = BX + 4; r.z = BZ - 30; Game.npcWalk('djRachel', BX + WELL[0] + 5, BZ + WELL[1] + 0.8, () => { r.face = r.homeFace = -1.73; r.d.x = r.x; r.d.z = r.z; }, 1.7); } flockAt(); toast('라헬이 아버지의 양 떼를 몰고 와요'); G.UI.quest(); }); }
function rollStone() { G.UI.minigame('push', { title: '우물 아귀의 큰 돌', hint: '목자 여럿이 함께 굴리는 돌이에요. 꾹 눌러 밀다가, 힘이 빠지면 잠깐 놓았다가 다시 밀어요.', btn: '꾹 눌러 밀기' }, ok => { if (!ok) { toast('돌이 꿈쩍도 안 해요 · 다시 밀어 봐요'); return; }
    sfx('thud', { pitch: 0.6 }); st().stoneOff = 1; narr([D.card('창세기 29:10', '우물 아귀의 돌', '야곱이 그 외삼촌 라반의 딸 라헬과 그 외삼촌의 양을 보고 나아가서 우물 아귀에서 돌을 옮기고 외삼촌 라반의 양 떼에게 물을 먹이고', '창세기 29:10')],
      () => say([T('야곱이 라헬에게 입맞추고 소리 내어 울며, 라헬에게 자기가 그의 아비의 생질이요 리브가의 아들 됨을 고하였더니', '창세기 29:11–12'), T('라헬이 달려가서 그 아비에게 고하매, 라반이 그 생질 야곱의 소식을 듣고 달려와서 그를 영접하여 안고 입맞추고 자기 집으로 인도하여 들이니', '창세기 29:12–13')], /* v18.82 (no made-up words of Rachel's) */
        () => { fin('djRachel'); st().ch = 2; const r = npc('djRachel'); if (r) Game.npcWalk('djRachel', BX + RACHEL_HOME[0], BZ + RACHEL_HOME[1], () => { r.face = r.homeFace = Math.PI; r.d.x = r.x; r.d.z = r.z; }, 2.4); flockAt(); G.UI.quest(); pop('라반의 집으로', '남동쪽 마당 대문 앞의 라반에게 가요', 'star'); })); }); }
function wage() { say([Ln('라반', '너는 참으로 나의 골육이로다.', 'happy', '창세기 29:14'), T('야곱이 한 달을 그와 함께 거하더니', '창세기 29:14'), Ln('라반', '네가 비록 나의 생질이나 어찌 공으로 내 일만 하겠느냐? 무엇이 네 보수겠느냐? 내게 고하라.', '', '창세기 29:15'),
    T('라반이 두 딸이 있으니 형의 이름은 레아요 아우의 이름은 라헬이라. 레아는 안력이 부족하고 라헬은 곱고 아리따우니', '창세기 29:16–17'),
    J('내가 외삼촌의 작은 딸 라헬을 위하여 외삼촌에게 칠 년을 봉사하리이다.', '창세기 29:18'), /* v18.82 (was a choice with one answer) */
    Ln('라반', '그를 네게 주는 것이 타인에게 주는 것보다 나으니 나와 함께 있으라.', '', '창세기 29:19')],
  () => { fin('djLaban'); st().ch = 3; st().T = newT(); G.UI.quest();
    narr([D.card('하란의 일곱 해', '라반의 양 떼를 치기', '일곱 해 동안 해마다 한 가지씩, 목자가 하는 일을 처음으로 해 봐요.\n그 사이의 날들은 빠르게 지나가요. 「칠 년을 수일같이 여겼더라」(창 29:20)\n할 일은 오른쪽 위에 보이고, 갈 곳은 길잡이 빛이 알려 줘요.')],
      () => G.UI.fade(() => startYear(true), () => yearCard())); }); }
function wedding() { say([J('내 기한이 찼으니 내 아내를 내게 주소서. 내가 그에게 들어가겠나이다.', '창세기 29:21')], () => { fin('djLaban');
    G.UI.fade(() => { S().time = 20.5; Game.teleport(BX + GATE[0], BZ + GATE[1] + 4, Math.PI); }, () => narr([D.card('창세기 29:22', '혼인 잔치', '라반이 그곳 사람을 다 모아 잔치하고, 저녁에 그 딸 레아를 야곱에게로 데려가매 야곱이 그에게로 들어가니라. 라반이 또 그 여종 실바를 그 딸 레아에게 시녀로 주었더라.', '창세기 29:22–24')],
      () => G.UI.fade(() => { S().time = 6.5; st().ch = 5; placeCast(); Game.teleport(BX + GATE[0], BZ + GATE[1] - 1.6, 0.6); }, () => say([T('야곱이 아침에 보니 레아라.', '창세기 29:25'), J('외삼촌이 어찌하여 내게 이같이 행하셨나이까? 내가 라헬을 위하여 외삼촌께 봉사하지 아니하였나이까? 외삼촌이 나를 속이심은 어찜이니이까?', '창세기 29:25', 'angry'),
        Ln('라반', '형보다 아우를 먼저 주는 것은 우리 지방에서 하지 아니하는 바이라.', 'cold', '창세기 29:26'), Ln('라반', '이를 위하여 칠 일을 채우라. 우리가 그도 네게 주리니, 네가 그를 위하여 또 칠 년을 내게 봉사할지니라.', '', '창세기 29:27')], /* v18.82 (Laban's 「좋다!」, the narrator's comment, Leah's plea and the choice were made up · gone) */
        () => { fin('djLaban'); G.UI.quest(); pop('칠 일을 채웠어요', '라헬에게 가요', 'star'); })))); }); }
function rachel() { const f = st().fin || { n: NS[6] }; say([T('야곱이 그대로 하여 그 칠 일을 채우매 라반이 딸 라헬도 그에게 아내로 주고, 또 그 여종 빌하를 그 딸 라헬에게 주어 시녀가 되게 하매', '창세기 29:28–29'), T('야곱이 또한 라헬에게로 들어갔고 그가 레아보다 라헬을 더 사랑하고 다시 칠 년을 라반에게 봉사하였더라.', '창세기 29:30')], /* v18.82 (no made-up words of Rachel's or Jacob's) */
  () => { fin('djRachel'); const first = !st().done; st().done = 1; st().ch = 6; st().best = Math.max(st().best || 0, f.n);
    narr([D.card('창세기 29:20', '칠 년을 수일같이', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'),
      D.card('야곱 편을 마쳤어요', '하란의 일곱 해', `들의 우물 · 새끼 낳는 밤 · 한낮 더위 · 밤의 맹수 · 서리 내린 밤 · 양털 깎는 날 · 양 떼를 세는 날\n맡은 양 ${START}마리 → ${f.n}마리\n\n훗날 이 라헬이 낳은 아들이 요셉이에요(창 30:22–24).\n\n생각해 볼 질문 · 아버지를 속여 복을 받았던 야곱이 이번에는 속임을 당했어요(창 27:35 · 29:25). 그날 야곱은 무엇을 생각했을까요?`)],
      () => { if (first) { Game.insight && Game.insight(3, '창세기 야곱 편'); S().flags.dlcJacobDone = 1; } say([{ n: '', t: '이야기가 끝났습니다. 고센의 불가로 돌아갈까요?', choices: [{ t: '아버지 곁으로 돌아가기', then: () => D.leave() }, { t: '하란을 조금 더 둘러보기' }] }], null); }); }); } /* v18.82 (old Jacob's made-up bubble on the way back is gone) */

// ------------------------------------------------------------------ 평소 말 (v18.82 성경에 이름이 없는 사람만 · 성경 인물은 몸짓만)
const CHAT = {
  djShep: () => ch() < 3 ? ['떼가 다 모여야 돌을 옮기는 법이오.', '이 들판 우물은 할아버지의 할아버지 때부터 썼다오.'] : ['떼가 다 모여야 돌을 옮기지. 그래야 모든 떼가 고루 마신다오.', '새끼 낳는 철엔 밤에도 어미 곁을 떠나지 마시오.', '한낮엔 양들도 그늘을 찾지. 강가 미루나무 밑이 제일이오.', '바람이 차지면 산에서 짐승이 내려온다오.'],
  djShep2: () => ch() < 3 ? ['저 돌은 혼자서는 못 굴려요.', '떼가 다 모일 때까지 우리도 여기서 기다려요.'] : ['형, 짐승 발자국 보면 나한테도 알려 줘요.', '저 장막이 우리 집이에요. 여름엔 시원하고 겨울엔 연기가 매워요.', '형은 해가 갈수록 일이 손에 붙네요.'],
  djShep3: () => ch() < 3 ? ['우리 떼가 제일 크다오. 그러니 먼저 마시는 게 맞지.', '…흠, 낯선 얼굴이군.'] : ['북쪽 우리가 우리 떼 자리요. 남의 풀밭은 넘보지 마시오.', '라반 어른 떼가 부쩍 늘었더군. 자네 솜씨인가?'],
  djSon1: () => ['우리 집 셈은 늘 꼼꼼해. 양 한 마리도 그냥 넘어가는 법이 없지.', '네가 온 뒤로 우리 양 떼가 늘었어.', '양털 깎는 날엔 온 동네가 우리 마당에 모여.'],
  djSon2: () => ['낙타 타 봤어? 나는 아직 무서워.', '나도 크면 형처럼 혼자 양 떼를 칠 거야.', '형, 우물 돌 어떻게 혼자 굴렸어? 나도 가르쳐 줘!'],
  djKid: () => ['야곱 아저씨, 정말 혼자 우물 돌을 굴렸어요?', '나도 크면 양 백 마리 칠 거예요!', '강가에서 개구리 잡았어요. 보여 줄까요?'],
  djElder: () => ch() < 2 ? ['나홀 어른 댁 말이오? 라반이 그 집 손자지. 저 남동쪽 마당 큰 집이오.', '하란 성읍엔 장사꾼이 많소. 동쪽 큰 강 건너에서도 오지.'] : ['양털 깎는 날엔 성읍 사람들도 라반 집에 몰려간다오.', '자네가 그 가나안 청년이구먼. 일 잘한다고 소문났소.', '하란 성읍엔 장사꾼이 많소. 동쪽 큰 강 건너에서도 오지.'] };
/* people of the Bible (Rachel, Leah, Laban, Zilpah, Bilhah): no everyday words · a gesture instead (like js/quiet.js in Joseph's story) */
const nod = id => { const n = npc(id), nm = (n && n.name) || '', ga = G.Quiet && G.Quiet.ga ? G.Quiet.ga(nm) : nm + '이(가)';
  const pool = [`${ga} 야곱을 보고 말없이 고개를 끄덕여요.`, `${ga} 하던 일을 잠시 멈추고 야곱을 바라봐요.`, `${ga} 말없이 미소 지어요.`];
  say([T(pool[Math.floor(Math.random() * pool.length)])], () => fin(id)); return true; };

// ------------------------------------------------------------------ 짐승 (이 파일이 무대 높이에 직접 그려요)
const HERD = []; let hInit = false, hT = -1, hFrame = 0, bleatT = 8, fireT = 0, placedFor = null;
const GA = { w0: [WELL[0] - 7, WELL[1] - 6, 2.4], w1: [WELL[0] + 7, WELL[1] - 7, 2.4], w2: [WELL[0] - 1, WELL[1] - 10, 2.4], f1: [F1[0], F1[1], 2.6], f2: [F2[0], F2[1], 2.6], pen: [2.2, 22.6, 1.2], donk: [-14.6, 10.6, 1.0], cam0: [9.2, 20, 0.1], cam1: [9.6, 24.6, 0.1], kidg: [-20, 6, 3] };
function grpArea(g) { const c = ch(), T0 = TY(), y = c === 3 && T0 ? T0.y : 0, k = T0 ? T0.k | 0 : 0;
  if (y === 1 && T0.pour) { const o = ORDER1.indexOf(g); if (o === T0.pour - 1) { const t = TR1[g]; return [WELL[0] + t[0] * 1.3, WELL[1] + t[1] * 1.3, 0.9]; } } /* (29:3 · each flock at the trough in its turn) */
  if (g === 'flock') { if (c === 1) return [WELL[0] + 7, WELL[1] + 3.4, 2.6];
    if (y === 1) return [WELL[0] + 8, WELL[1] + 3.6, 2.4];
    if (y === 3) { if (k === 0) return [PAST[0].x, PAST[0].z, 6]; if (k === 1) { const p = P(), f = p.face || 0; return [p.x - BX - Math.sin(f) * 3.2, p.z - BZ - Math.cos(f) * 3.2, 2.2]; } return [SHADE[0] - 0.6, SHADE[1] + 1.4, 3]; }
    if (y === 2) return [FOLD[0] + 1.8, FOLD[1] - 1.8, 1.9]; /* (the rest of the flock lies in the far corner: the ewe has her own) */
    if (y === 6) return [SHED[0] - 4.6, SHED[1] - 3.6, 2.6]; if (y === 7) return [GATEF[0], GATEF[1] + 2.8, 2.4];
    return [FOLD[0], FOLD[1] - 0.5, 2.8]; }
  if (g === 'lamb') return y === 2 && T0.lamb ? [EWE[0] + 0.75, EWE[1] + 0.35, 0.12] : null;
  if (y === 1 && !T0.gath && !T0.k && /^w/.test(g)) return g === 'w0' ? [F1[0], F1[1], 2.6] : g === 'w1' ? [F2[0], F2[1], 2.6] : [CAMPF[0] - 7, CAMPF[1] + 7, 2.6]; /* first year: the other flocks are still at their folds until they gather */
  if (g === 'dog') { const n = npc('djShep'); if (n && n.vis) return [n.x - BX + 1.6, n.z - BZ + 1.2, 1.6]; return [F1[0], F1[1] + 6, 2]; }
  return GA[g] || null; }
const flockVis = () => { const c = ch(); if (c < 1) return 0; const n = c >= 3 && TY() ? TY().n | 0 || START : START; return clamp(Math.round(n / 7), 5, 18); };
function herdInit() { HERD.length = 0; let k = 0; const add = (kind, pat, grp, n, o) => { for (let i = 0; i < n; i++) HERD.push(Object.assign({ kind, pat, grp, i, k: k++, x: 0, z: 0, f: Math.random() * 6.28, tx: null, wait: Math.random() * 3, ph: Math.random() * 6, sp: 0, seed: Math.random() * 10, s: 1, rig: null }, o || {})); };
  const fl = ['plain', 'plain', 'plain', 'plain', 'black', 'plain', 'plain', 'plain', 'brown', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain'];
  fl.forEach((p, i) => add(i === 4 || i === 11 ? 'goat' : 'sheep', i === 11 ? 'black' : p, 'flock', 1, { i, s: i === 4 || i === 11 ? 0.95 : 1 }));
  add('sheep', 'plain', 'w0', 5); add('sheep', 'spotted', 'w1', 4); add('goat', 'brown', 'w1', 1); add('sheep', 'plain', 'w2', 4); add('goat', 'black', 'w2', 1);
  add('sheep', 'plain', 'f1', 5); add('goat', 'black', 'f1', 2); add('sheep', 'speckled', 'f2', 5); add('sheep', 'brown', 'f2', 1);
  add('goat', 'brown', 'pen', 2); add('goat', 'black', 'pen', 2, { s: 0.7 });
  add('donkey', 'plain', 'donk', 1, { extra: { pack: 0x7a5a3a } }); add('donkey', 'plain', 'donk', 1);
  add('sheep', 'plain', 'lamb', 1, { s: 0.42 }); add('camel', 'plain', 'cam0', 1, { lieAlways: 1 }); add('camel', 'plain', 'cam1', 1, { lieAlways: 1 }); add('jackal', 'plain', 'dog', 1, { s: 0.9 }); add('goat', 'brown', 'kidg', 2, { s: 0.75 });
  for (const a of HERD) { const ar = grpArea(a.grp) || [0, 0, 1], an = Math.random() * 6.283, r = Math.sqrt(Math.random()) * ar[2]; a.x = ar[0] + Math.cos(an) * r; a.z = ar[1] + Math.sin(an) * r; }
  hInit = true; }
function herdTick(dt) { const h = S().time % 24, night = h > 20.5 || h < 5.5, nv = flockVis(), c = ch(), T0 = TY(), y = c === 3 && T0 ? T0.y : 0, k = T0 ? T0.k | 0 : 0;
  const ewe = y === 2, hot = y === 3 && k !== 1, follow = y === 3 && k === 1; /* v18.82 the ewe in labour · lying down in the noon heat · following him to the shade */
  for (const a of HERD) { a.vis = a.grp !== 'flock' || a.i < nv; if (!a.vis) continue; if (a.inF && y !== 7) a.inF = false;
    const ar = a.inF ? [FOLD[0], FOLD[1] - 0.8, 2.6] : grpArea(a.grp); if (!ar) { a.vis = false; a.hid = 1; continue; }
    if (a.hid) { a.hid = 0; a.x = ar[0]; a.z = ar[1]; a.tx = null; } /* (a lamb just born is there, not walking in from afar) */
    if (ewe && a.grp === 'flock' && a.i === 0) { a.x = EWE[0]; a.z = EWE[1]; a.f = 1.2; a.lie = true; a.sp = 0; a.graze = false; continue; }
    const stand = a.grp === 'lamb' && T0 && T0.lamb === 2;
    const far = Math.hypot(a.x - ar[0], a.z - ar[1]) > ar[2] + 1.5, lie = !stand && (a.lieAlways || (night && a.kind !== 'jackal' && a.kind !== 'donkey') || (c === 0 && /^w/.test(a.grp)) || (hot && a.grp === 'flock') || a.grp === 'lamb');
    if (lie && !far) { a.lie = true; a.sp = 0; a.graze = false; continue; } a.lie = false;
    if (a.tx === null || a.tx === undefined || (far && !a.drive)) { const an = Math.random() * 6.283, r = Math.sqrt(Math.random()) * ar[2]; a.tx = ar[0] + Math.cos(an) * r; a.tz = ar[1] + Math.sin(an) * r; a.drive = far; if (far) a.wait = Math.random() * (follow ? 0.25 : 0.6); }
    if (follow && a.grp === 'flock' && a.drive && Math.hypot(a.tx - ar[0], a.tz - ar[1]) > ar[2] + 3) a.tx = null; /* (he keeps walking: aim at where he is now) */
    if (a.wait > 0) { a.wait -= dt; a.sp *= 0.85; a.graze = !a.drive; continue; }
    if (a.tx === null) continue;
    const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz);
    if (d < 0.3) { a.tx = null; a.drive = false; a.wait = 2 + Math.random() * 5; continue; }
    const want = a.drive ? (a.kind === 'jackal' ? 3.4 : follow && a.grp === 'flock' ? 4.6 : 2.8) : (a.kind === 'jackal' ? 1.3 : 0.5); a.sp += (want - a.sp) * Math.min(1, dt * 3); a.graze = false;
    const step = Math.min(d, a.sp * dt); a.x += dx / d * step; a.z += dz / d * step; a.f += angd(a.f, Math.atan2(dx, dz)) * Math.min(1, dt * 5); a.ph += a.sp * dt * 3.2; } }
function drawHerd(list, t) { if (!hInit) herdInit(); const dt = hT < 0 ? 1 / 60 : Math.min(0.1, Math.max(0, t - hT)); hT = t; herdTick(dt); hFrame++;
  const CAM = Game.CAM;
  for (const a of HERD) { if (!a.vis) continue; const wx = BX + a.x, wz = BZ + a.z, d = Math.hypot(wx - CAM.x, wz - CAM.z); if (d > 80) continue;
    if (!a.rig) { a.rig = new G.Rig(G.AB[a.kind]); a.M = G.m4(); a.mesh = Game.animalMesh(a.kind, a.pat, a.extra); }
    if (d < 32 || (hFrame + a.k) % 3 === 0) { G.animAnimal(a.rig, { speed: a.sp, phase: a.ph, graze: a.graze, lie: a.lie, seed: a.seed }, t); a.rig.update(G.m4trs(a.M, wx, BY, wz, a.f, 0, 0, a.s, a.s, a.s)); }
    list.push({ mesh: a.mesh, bones: a.rig.bones, outline: true }); } }

// ------------------------------------------------------------------ 땅 색 (v18.64 길 · 마당 · 풀밭 · 밭 · 강가는 땅에 칠해요 · 판을 깔지 않아요)
const HX = XL.hex, mixC = XL.mix, smc = XL.sm;
const ROADS = [[[-210, 9], [-120, 8], [-66, 6.5], [-50, 5], [-40, 3], [-33, 0.5], [-24, 2], [-16, 6.5], [-8, 10.5]], [[-8, 10.5], [2, 8.5], [12, 9], [16, 7.5]], [[12, 9], [24, 6], [34, -2], [46, -6], [51, -6], [60, -6], [100, -11], [210, -18]], [[24, 6], [28, 11]], [[-40, 3], [-46, -8], [-48, -15]], [[-48, -15], [-80, -40], [-150, -90]]];
const roadD = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, XL.segD(r, x, z)); return d; };
const GC = { road: HX(0xc6b088), road2: HX(0xb49e78), yard: HX(0xbea884), earth: HX(0xa8916a), straw: HX(0xc6ae78), lush: HX(0x6c9840), barley: HX(0xd2ba68), soil: HX(0x7a6448), mud: HX(0x7c6c4c), reed: HX(0x6a8c44), town: HX(0xc4b08c) };
const inR = (x, z, x0, x1, z0, z1, e) => Math.min(smc(x0 - e, x0 + e, x), 1 - smc(x1 - e, x1 + e, x), smc(z0 - e, z0 + e, z), 1 - smc(z1 - e, z1 + e, z));
function ground(x, z, c, gr) { let o = c, g = gr; const lay = (col, k, ga) => { if (!(k > 0)) return; o = mixC(o, col, k); g += (ga - g) * k; };
  for (const p of PAST) lay(GC.lush, inR(x, z, p.x - p.w / 2, p.x + p.w / 2, p.z - p.d / 2, p.z + p.d / 2, 3) * 0.75, 1);
  const dr = Math.abs(x - RIVER); lay(GC.reed, (1 - smc(3.2, 9, dr)) * 0.8, 1); lay(GC.mud, 1 - smc(2.4, 3.6, dr), 0.05);
  { const k = inR(x, z, FIELD[0] - 7, FIELD[0] + 7, FIELD[1] - 5, FIELD[1] + 5, 0.9); if (k > 0) { const f = 0.86 + 0.14 * Math.cos((z - FIELD[1]) * 3.93); lay([GC.barley[0] * f, GC.barley[1] * f, GC.barley[2] * f], k, 1); } }
  lay(GC.soil, inR(x, z, FIELD[0] - 6, FIELD[0] + 6, FIELD[1] + 8.6, FIELD[1] + 14.4, 0.6), 0.1);
  lay(GC.earth, (1 - smc(3.5, 9, Math.hypot(x - WELL[0], z - WELL[1] + 2.5))) * 0.85, 0.12);
  lay(GC.yard, inR(x, z, -21, 5, 14, 34, 0.8), 0); lay(GC.town, inR(x, z, -63, -38, -42, -16, 2.5) * 0.9, 0.08);
  for (const [cx, cz, w] of [[FOLD[0], FOLD[1], 9], [F1[0], F1[1], 8], [F2[0], F2[1], 8]]) lay(GC.straw, inR(x, z, cx - w / 2, cx + w / 2, cz - w / 2, cz + w / 2, 0.7) * 0.9, 0.15);
  lay(GC.straw, (1 - smc(2.5, 5, Math.hypot(x - SHED[0], z - SHED[1]))) * 0.75, 0.25);
  lay(GC.earth, (1 - smc(5, 11, Math.hypot(x - 36, z - 42))) * 0.55, 0.3); lay(GC.earth, (1 - smc(1.5, 3.8, Math.hypot(x - CAMPF[0], z - CAMPF[1]))) * 0.85, 0);
  const rd = roadD(x, z); if (rd < 3) lay(rd < 0.4 ? GC.road2 : GC.road, (1 - smc(0.9, 2.2, rd)) * 0.92, 0);
  return [o[0], o[1], o[2], g]; }
const PLACES = [{ n: '들의 우물', x: WELL[0], z: WELL[1] }, { n: '라반의 집', x: -8, z: 24, k: 'town' }, { n: '야곱의 양 우리', x: FOLD[0], z: FOLD[1] }, { n: '털 깎는 곳', x: SHED[0], z: SHED[1] }, { n: '보리밭 · 텃밭', x: FIELD[0], z: FIELD[1] + 4 },
  { n: '하란 성읍', x: -50, z: -28, k: 'town' }, { n: '북쪽 풀밭', x: PAST[0].x, z: PAST[0].z }, { n: '동쪽 풀밭', x: PAST[1].x, z: PAST[1].z }, { n: '남쪽 시냇가 풀밭', x: PAST[2].x, z: PAST[2].z }, { n: '목자들의 장막', x: 36, z: -40 }, { n: '발릭 강 여울', x: RIVER, z: -6 }, { n: '가나안 가는 큰길', x: -62, z: 6.5 }];
// ------------------------------------------------------------------ 무대
const person = (id, name, look, l, face, o) => Object.assign({ id, name, look, x: l[0], z: l[1], face, talkR: 3, noBond: true }, o || {});
let STONE = null; const SM = G.m4(), XM = { tm: [], m1: G.m4(), m2: G.m4(), m3: G.m4() }; /* v18.82 tracks · the torn one · the frost-night fire · the fleece */
LAND = XL.make({ key: 'dlcj', story: 'jacob', name: '하란 (아버지의 이야기)', title: '창세기 야곱 편 · 라헬을 위한 일곱 해', hero: '야곱', look: LK.jacobY, seed: 229, area: [-66, 66, -58, 58], spawn: [OUT[0] + 2.5, OUT[1] + 3, Math.PI / 2],
  places: PLACES, ground, valley: (x, z) => 1 - XL.sm(10, 42, Math.abs(x - RIVER)), outFloor: (x, z, h) => { const dr = Math.abs(x - RIVER); if (dr > 9) return null; return (dr < 3.5 ? -0.72 * clamp((3.5 - dr) / 1.6, 0, 1) : 0) + h * XL.sm(3.5, 9, dr); },
  water: { level: -0.38, shallow: [0.24, 0.46, 0.38], deep: [0.08, 0.24, 0.2] }, sceneryAvoid: (x, z) => Math.abs(x - RIVER) < 7 || roadD(x, z) < 3, trees: ['oak', 'tamarisk', 'olive', 'acacia'],
  skinned: (list, t) => drawHerd(list, t),
  people: [
    person('djShep', OLD, LK.shepOld, [WELL[0] - 3.2, WELL[1] + 2.6], 0.6, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep() }),
    person('djShep2', YNG, LK.shepYoung, [WELL[0] + 5, WELL[1] + 3.4], -0.9, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep2() }),
    person('djShep3', SH3, LK.shep3, [WELL[0] - 6, WELL[1] - 4], 1.4, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep3() }),
    person('djRachel', '라헬', LK.rachel, RACHEL_HOME, Math.PI, { prop: 'staff', bib: true, show: () => on() && ch() >= 1 }),
    person('djLaban', '라반', LK.laban, LABAN_HOME, Math.PI, { bib: true, show: () => on() && ch() >= 2 }),
    person('djLeah', '레아', LK.leah, LEAH_HOME, Math.PI, { bib: true, show: () => on() && ch() >= 2 }),
    person('djZilpah', ZIL, LK.zilpah, [TANNUR[0] + 1.2, TANNUR[1] + 2], Math.PI, { bib: true, show: () => on() && ch() >= 2 }),
    person('djBilhah', BIL, LK.bilhah, [-13.5, 21.8], Math.PI, { bib: true, show: () => on() && ch() >= 2, act: 'gather' }),
    person('djSon1', SON1, LK.son1, [F2[0] - 4, F2[1] + 5.6], Math.PI, { prop: 'staff', show: () => on() && ch() >= 2, chat: S => CHAT.djSon1() }),
    person('djSon2', SON2, LK.son2, [8.2, 16], -1.5, { show: () => on() && ch() >= 2, wander: 2, chat: S => CHAT.djSon2() }),
    person('djKid', '하란 아이', LK.kid, [-20, 8.6], 0.4, { scale: 0.62, wander: 3, show: () => on(), chat: S => CHAT.djKid() }),
    person('djElder', '하란 성읍의 노인', LK.elder, [-44, -12.6], 1.0, { wander: 1.5, show: () => on(), chat: S => CHAT.djElder() })],
  chatter: [['올해는 비가 알맞게 오려나.', '하늘이 하는 일을 누가 알겠소.'], ['라반 어른 양 떼가 부쩍 늘었더군.', '그 가나안 청년 덕이라던데.'], ['우물 돌은 오늘 누가 굴렸대?', '또 그 청년이지 뭐.'], ['양털 깎는 날이 기다려져요.', '그날은 잔칫날이지!'], ['밤에 늑대 소리 들었어?', '우리 문 단단히 걸어 두자.'], ['발릭 강물이 많이 불었네.', '여울로 건널 땐 조심해야겠어.']],
  talk: { /* v18.82 people of the Bible: Bible words in the story's steps, otherwise a gesture · the others chat freely (CHAT) */
    djShep(s) { const c = ch(); if (c === 0) { atWell(); return true; }
      if (c < 3) { say([Ln(OLD, c === 1 ? '저기 라헬이 오는군. 그런데 저 돌을 정말 혼자 옮기겠다고?' : '혼자서 그 돌을 굴리다니… 무슨 힘이 그리 났소?')], () => fin('djShep')); return true; } return false; },
    djLaban(s) { const c = ch(); if (c === 2) { wage(); return true; } if (c === 4) { wedding(); return true; } return nod('djLaban'); },
    djRachel(s) { if (ch() === 5) { rachel(); return true; } return nod('djRachel'); },
    djLeah(s) { return nod('djLeah'); }, djZilpah(s) { return nod('djZilpah'); }, djBilhah(s) { return nod('djBilhah'); } },
  ctx(s, lx, lz) { const out = [], c = ch(), near = (p, r) => Math.hypot(p[0] - lx, p[1] - lz) < (r || 3), at = (p, o) => Object.assign({ x: BX + p[0], z: BZ + p[1], y: 1.1, noMagnet: true }, o);
    if (c === 1 && near(WELL, 4)) out.push(at(WELL, { d: -1, label: '우물 아귀의 돌 굴리기', key: 'djStone', use: rollStone }));
    if (c !== 3) return out; const T0 = TY(); if (!T0) return out;
    const a = stepAct(T0); if (!a) return out;
    const p0 = PAST[0], inside = a[1] === 0 ? Math.abs(lx - p0.x) < p0.w / 2 + 2 && Math.abs(lz - p0.z) < p0.d / 2 + 2 : near(a[0], a[1]); /* (the noon flock: anywhere in the north pasture) */
    if (inside) out.push(a[1] === 0 ? { x: P().x, z: P().z, y: 1.1, noMagnet: true, story: true, d: -1, label: a[2], key: 'djY' + YK(), use: a[3] } : at(a[0], { d: -1, story: true, label: a[2], key: 'djY' + YK(), use: a[3] })); /* (story: before chatting with whoever stands there) */
    return out; },
  quest(s) { const c = ch(), T0 = TY(); if (c === 0) return [{ t: '들의 우물 곁 목자들과 이야기하기', ok: false }]; if (c === 1) return [{ t: '우물 아귀의 큰 돌 굴려 내기', ok: false }]; if (c === 2) return [{ t: '외삼촌 라반과 이야기하기 (남동쪽 마당 대문 앞)', ok: false }];
    if (c === 4) return [{ t: '칠 년이 찼어요 · 대문 앞의 라반에게 말하기', ok: false }]; if (c === 5) return [{ t: '라헬에게 가기', ok: false }]; if (c >= 6) return [{ t: '야곱 편을 마쳤어요 · 오른쪽 위 「이야기에서 나오기」로 고센에 돌아가요', ok: true }];
    const Y = YR(); if (!T0 || !Y) return []; const C = YEAR_CARD[T0.y - 1], rows = [{ t: `라헬을 위한 일곱 해 · ${C[0]} ${SEA[Y.se]} · ${Y.title}`, ok: false }];
    Y.steps.forEach((t, i) => { if (i <= T0.k) rows.push({ t: i === T0.k && T0.wt > 0 ? `${t} · 기다리는 중 ${Math.ceil(T0.wt)}초` : i === T0.k && T0.y === 1 && T0.pour ? `${t} · ${NAME1[T0.pour - 1]} 차례` : t, ok: i < T0.k }); });
    rows.push({ t: `라반의 양 떼 ${T0.n}마리`, ok: true }); return rows; },
  tick(dt) { if (placedFor !== S()) { placedFor = S(); placeCast(); hInit = false; }
    const p = P(), h = S().time % 24, T0 = ch() === 3 ? TY() : null;
    if (T0 && T0.wt > 0 && !G.UI.busy()) { const w = WT[T0.y]; if (w && T0.k === w[0]) { if (Math.hypot(p.x - BX - w[1][0], p.z - BZ - w[1][1]) < w[4]) { T0.wt -= dt; S().time += dt * w[3] / w[2]; if (T0.wt <= 0) { T0.wt = 0; waitDone(); } }
        else if (!waitNote) { waitNote = 1; toast('자리를 뜨면 기다림이 멈춰요 · 돌아와서 다시 앉으면 이어져요'); sit(false); } } }
    if (T0 && T0.wt > 0 && waitNote && !p.cpose) { const w = WT[T0.y]; if (w && Math.hypot(p.x - BX - w[1][0], p.z - BZ - w[1][1]) < w[4] * 0.6) { waitNote = 0; sit(true); } }
    { const q = T0 && T0.wt > 0 ? Math.ceil(T0.wt) : -1; if (q !== qSec) { qSec = q; G.UI.quest(); } }
    if (T0 && T0.y === 3 && T0.k === 1 && !G.UI.busy() && Math.hypot(p.x - BX - SHADE[0], p.z - BZ - SHADE[1]) < 6) { sfx('splash', { vol: 0.4 }); next('미루나무 그늘에 닿았어요', '양들이 여울에서 물을 마시고 그늘에 누워요 · 곁에 앉아 기다려요'); }
    if (T0 && T0.y === 5 && T0.fire && G.Fire && G.Fire.emit && Math.hypot(BX + FIRE5[0] - p.x, BZ + FIRE5[1] - p.z) < 40) G.Fire.emit(BX + FIRE5[0], BY + 0.15, BZ + FIRE5[1], 0.8, 0.3, dt); /* (flames, as the Abraham story's fires) */
    { const want = !!(T0 && T0.y === 6 && T0.k === 1); if (want && p.carry !== 'head') setLoad(true); else if (!want && loadOn) setLoad(false); } /* (the fleece only on the way to the storeroom) */
    if ((bleatT -= dt) <= 0) { bleatT = 6 + Math.random() * 9; const a = HERD.find(q => q.vis && (q.kind === 'sheep' || q.kind === 'goat') && Math.hypot(BX + q.x - p.x, BZ + q.z - p.z) < 22); if (a) sfx('bleat', { vol: 0.3, pitch: a.kind === 'goat' ? 1.25 : 0.9 + Math.random() * 0.3, x: BX + a.x, z: BZ + a.z }); }
    if ((fireT -= dt) <= 0) { fireT = 0.07; if (G.FX && G.FX.burst) { const F = [[TANNUR[0], TANNUR[1], 0.95, h > 5.5 && h < 20.5]], N = [CAMPF[0], CAMPF[1], 0.4, h > 18.5 || h < 6.5]; F.push(N);  for (const [x, z, y, lit] of F) { if (!lit || Math.hypot(BX + x - p.x, BZ + z - p.z) > 45) continue; G.FX.burst(BX + x, BY + y, BZ + z, 1, { c: [1, 0.55 + Math.random() * 0.2, 0.15], sp: 0.18, up: 1.1, size: 0.13, g: -1.6, life: 0.55, a: 0.9, spread: 0.25 }); } } } },
  dyn(list, t) { const c = ch(), T0 = c === 3 ? TY() : null; if (!STONE) { const g = new G.GB(377); g.cyl(1.32, 1.36, 0.34, 14, { at: [0, 0, 0], c: 0x8a8276, j: 0.06 }); g.cyl(0.9, 1.0, 0.1, 10, { at: [0, 0.2, 0], c: 0x9a9284, j: 0.08 }); STONE = G.R.mesh(g); }
    /* v18.82 the stone lies on the well's mouth except while the flocks drink (29:3) */
    const shut = c < 2 ? !st().stoneOff : c === 2 ? false : !(T0 && T0.y === 1 && T0.open);
    if (shut) G.m4trs(SM, BX + WELL[0], BY + 0.98, BZ + WELL[1], 0.3, 0, 0, 1, 1, 1); else G.m4trs(SM, BX + WELL[0] + 2.8, BY + 0.2, BZ + WELL[1] + 1.6, 0.8, 0, 0.12, 1, 1, 1); /* rolled off and lying beside the well */
    list.push({ mesh: STONE, m: SM, outline: true });
    if (!XM.track) { const g = new G.GB(378); for (const [dx, dz] of [[-0.09, 0.05], [0.09, 0.05], [-0.05, -0.12], [0.05, -0.12]]) g.cyl(0.055, 0.06, 0.012, 7, { at: [dx, 0.012, dz], c: 0x4a3a2a, j: 0 }); g.cyl(0.11, 0.12, 0.012, 9, { at: [0, 0.012, 0.18], c: 0x4a3a2a, j: 0 }); XM.track = G.R.mesh(g);
      const w = new G.GB(379); for (let i = 0; i < 6; i++) w.sph(0.16 + (i % 3) * 0.03, 7, 5, { at: [Math.cos(i * 1.1) * 0.3, 0.08, Math.sin(i * 1.1) * 0.24], c: 0xe6dccb, s: [1.2, 0.6, 1], j: 0.1 }); XM.tuft = G.R.mesh(w);
      const f = new G.GB(380); for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; f.sph(0.16, 6, 4, { at: [Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55], c: 0x7a746a, s: [1.1, 0.7, 1], j: 0.12 }); } for (let i = 0; i < 4; i++) f.box(0.09, 0.09, 0.8, { at: [0, 0.16, 0], ry: i * 0.8, rx: 0.25, c: 0x5a3e26, j: 0.1 }); XM.fire = G.R.mesh(f);
      const b = new G.GB(381); for (let i = 0; i < 5; i++) b.sph(0.15, 7, 5, { at: [(i - 2) * 0.1, (i % 2) * 0.06, (i % 3 - 1) * 0.07], c: 0xeee6d6, s: [1.1, 0.62, 1], j: 0.12 }); XM.fleece = G.R.mesh(b); }
    if (T0 && T0.y === 4) { /* the beast's tracks from the fold's east wall to the thorn bush, and the torn one there (31:39) */
      const x0 = FOLD[0] + 5.2, z0 = FOLD[1] - 1, x1 = TORN[0], z1 = TORN[1], L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 1.3), ry = Math.atan2(x1 - x0, z1 - z0);
      if (T0.k >= 1) for (let i = 0; i < n; i++) { const m = XM.tm[i] || (XM.tm[i] = G.m4()), u = i / n, side = (i % 2 ? 0.16 : -0.16); G.m4trs(m, BX + x0 + (x1 - x0) * u + Math.cos(ry) * side, BY + 0.01, BZ + z0 + (z1 - z0) * u - Math.sin(ry) * side, ry, 0, 0, 1, 1, 1); list.push({ mesh: XM.track, m }); }
      if (T0.k >= 1) { G.m4trs(XM.m1, BX + TORN[0], BY, BZ + TORN[1], 0.4, 0, 0, 1, 1, 1); list.push({ mesh: XM.tuft, m: XM.m1, outline: true }); } }
    if (T0 && T0.y === 5 && (T0.k >= 1)) { G.m4trs(XM.m2, BX + FIRE5[0], BY, BZ + FIRE5[1], 0, 0, 0, 1, 1, 1); list.push({ mesh: XM.fire, m: XM.m2, outline: true }); }
    if (loadOn && P().carry === 'head') { const PP = Game.P, w = PP.rig && PP.rig.world && G.HBI && PP.rig.world[G.HBI.head], hp = w && isFinite(w[13]) && Math.hypot(w[12] - PP.x, w[14] - PP.z) < 1.5 ? [w[12], w[13] + 0.36, w[14]] : [PP.x, PP.y + 2.1, PP.z]; /* (on top of the head, above his hands) */
      G.m4trs(XM.m3, hp[0], hp[1], hp[2], PP.face || 0, 0, 0, 1, 1, 1); list.push({ mesh: XM.fleece, m: XM.m3, outline: true }); } },
  weather: { clear: 0.7, cloudy: 0.22, rain: 0.05, wind: 0.03, fog: 0, dust: 0, storm: 0 },
  floor: (lx, lz) => { const d = Math.abs(lx - RIVER); if (d < 3.5) return -0.72 * clamp((3.5 - d) / 1.6, 0, 1); return 0; },

  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z } = B, GR = 0x9fa064, MUD = 0xc4a678, MUD2 = 0xa88a5e, ROADC = 0xc4b08a;
    // ---- 땅 · 먼 들판 · 먼 언덕은 이 이야기의 지도(dlcep.js)가 만들어요. 길 · 마당 · 풀밭 · 밭은 땅에 칠해요(위 ground).

    // ---- 길

    for (let i = 0; i < 6; i++) sph(0.45, RIVER - 2.6 + i * 1.05, BY - 0.42, -6 + (i % 2) * 0.3, 0x9a9284, { s: [1.2, 0.5, 1], j: 0.1 }); /* 여울의 디딤돌 */
    // ---- 풀밭 셋 (푯말)
    PAST.forEach((p, i) => { const sx = p.x - p.w / 2 + 1, sz = p.z + (i === 1 ? -p.d / 2 + 1 : p.d / 2 - 1); cyl(0.05, 0.06, 1.5, 6, sx, BY + 0.75, sz, 0x7a5a3a); box(0.8, 0.4, 0.06, sx, BY + 1.35, sz, 0xc8a068); colR(sx, sz, 0.15, BY + 1.6);
      for (let k = 0; k < 10; k++) put(rng() < 0.5 ? 'flowers' : 'dryGrass', p.x + (rng() - 0.5) * (p.w - 2), p.z + (rng() - 0.5) * (p.d - 2), { s: 0.8 + rng() * 0.4, args: [rng() < 0.5 ? undefined : 0x9ab060] }); });
    // ---- 들의 우물 (창 29:2–3) · 구유 셋
    cyl(1.55, 1.65, 0.8, 16, WELL[0], BY + 0.4, WELL[1], 0x9a9282, { j: 0.05 }); cyl(1.35, 1.4, 0.12, 16, WELL[0], BY + 0.82, WELL[1], 0xa8a090); cyl(1.0, 1.0, 0.06, 12, WELL[0], BY + 0.8, WELL[1], 0x1e2a30); colR(WELL[0], WELL[1], 1.75, BY + 1.3);
    for (const [dx, dz, ry] of [[3.6, -3, 0.5], [-3.8, -2.6, -0.5], [0, -4.4, 0]]) { box(2.6, 0.5, 0.75, WELL[0] + dx, BY + 0.25, WELL[1] + dz, 0x8a7a62, { ry }); box(2.3, 0.04, 0.5, WELL[0] + dx, BY + 0.49, WELL[1] + dz, 0x3a6a7a, { ry }); colR(WELL[0] + dx, WELL[1] + dz, 1.1, BY + 0.6); }

    for (const [x, z] of [[-38, -3.6], [-21.6, -1.2]]) { put('datePalm', x, z); colR(x, z, 0.4); }
    // ---- 라반의 집 마당 (x -21~5, z 14~34 · 대문은 북쪽 x -10~-6)

    const wall = (x, z, w, d, h) => { box(w, h, d, x, BY + h / 2, z, MUD2, { j: 0.04 }); box(w + 0.1, 0.12, d + 0.1, x, BY + h + 0.06, z, MUD); col(x, z, w, d, BY - 1, BY + h); };
    wall(-15.5, 14, 11, 0.6, 2.1); wall(-0.5, 14, 11, 0.6, 2.1); wall(-8, 34, 26.6, 0.6, 2.1); wall(-21, 24, 0.6, 20, 2.1); wall(5, 24, 0.6, 20, 2.1);
    for (const x of [-10.2, -5.8]) { box(0.8, 2.8, 0.8, x, BY + 1.4, 14, MUD, { j: 0.03 }); col(x, 14, 0.8, 0.8, BY - 1, BY + 2.8); }
    const bee = (x, z, s, door) => { box(s, 2.3, s, x, BY + 1.15, z, MUD, { j: 0.03 }); cyl(0.16, s * 0.52, s * 1.0, 12, x, BY + 2.3 + s * 0.5, z, MUD, { j: 0.04 }); cyl(0.12, 0.16, 0.2, 6, x, BY + 2.3 + s + 0.08, z, MUD2);
      const dz = door === 's' ? s / 2 + 0.03 : -s / 2 - 0.03; box(0.9, 1.6, 0.08, x, BY + 0.8, z + dz, 0x3a2818, { j: 0 }); box(0.4, 0.3, 0.08, x + s * 0.28, BY + 1.75, z + dz, 0x2a2018, { j: 0 }); col(x, z, s, s, BY - 1, BY + 3.3, true); };
    bee(-17, 30.6, 4, 'n'); bee(-11, 30.6, 4, 'n'); bee(-7, 30.6, 4, 'n'); bee(-3, 30.6, 4, 'n');
    box(3.6, 2.4, 4, 2.6, BY + 1.2, 30.6, MUD, { j: 0.03 }); box(3.9, 0.2, 4.3, 2.6, BY + 2.45, 30.6, 0x8a6a48); box(0.9, 1.6, 0.08, 2.6, BY + 0.8, 28.57, 0x3a2818); col(2.6, 30.6, 3.6, 4, BY - 1, BY + 2.6, true); put('sacks', 0.8, 27.6); put('pots', 3.2, 27.5);
    cyl(0.5, 0.62, 0.9, 12, TANNUR[0], BY + 0.45, TANNUR[1], 0xb88a5a, { j: 0.04 }); cyl(0.32, 0.34, 0.05, 10, TANNUR[0], BY + 0.92, TANNUR[1], 0x2a1a10); colR(TANNUR[0], TANNUR[1], 0.7, BY + 1); /* 화덕 (탄누르) */
    cyl(0.42, 0.45, 0.25, 12, -13.5, BY + 0.13, 23.4, 0x8a8276); cyl(0.36, 0.38, 0.12, 12, -13.5, BY + 0.32, 23.4, 0x9a9284); colR(-13.5, 23.4, 0.5, BY + 0.5); /* 맷돌 */
    for (const x of [LOOM[0] - 1, LOOM[0] + 1]) cyl(0.05, 0.06, 1.9, 6, x, BY + 0.95, LOOM[1], 0x6a4a30); box(2.3, 0.08, 0.08, LOOM[0], BY + 1.88, LOOM[1], 0x6a4a30); box(2.0, 1.1, 0.03, LOOM[0], BY + 1.25, LOOM[1], 0xd8ccb0, { j: 0.05 }); box(2.0, 0.5, 0.035, LOOM[0], BY + 0.95, LOOM[1] + 0.01, 0x3e5a8a, { j: 0.04 }); col(LOOM[0], LOOM[1], 2.3, 0.4, BY - 1, BY + 2);
    put('pots', -12.4, 15.4); put('pots', -3.4, 15.4, { ry: 1.2 });
    for (const [x, z, ry, len] of [[2.2, 20.6, 0, 4], [2.2, 24.6, 0, 4], [0.2, 22.6, Math.PI / 2, 4], [4.2, 22.6, Math.PI / 2, 4]]) { put('fence', x, z, { ry, args: [len] }); col(x, z, ry ? 0.25 : len, ry ? len : 0.25, BY - 1, BY + 1.1); } /* 염소 우리 */
    box(1.6, 0.05, 1, -8, BY + 0.03, 13.2, 0x8a6a48); /* 대문 앞 깔개 */
    for (const [x, z] of [[-23.4, 15.2], [6.4, 11.8]]) { put('datePalm', x, z); colR(x, z, 0.4); }
    for (const [x, z] of [[-24.6, 10.6], [10, 32], [-25.4, 38]]) { cyl(0.13, 0.18, 1.6, 7, x, BY + 0.8, z, 0x5a4434); for (let k = 0; k < 4; k++) sph(0.95, x + Math.cos(k * 1.6) * 0.8, BY + 2.0 + (k % 2) * 0.35, z + Math.sin(k * 1.6) * 0.8, [0xf2e0e6, 0xead0d8, 0x9ab070, 0xf6ecee][k], { s: [1, 0.7, 1], j: 0.12 }); colR(x, z, 0.3); } /* 살구나무(아몬드) — 창 30:37 */
    // ---- 야곱의 양 우리 (x 11.5~20.5 · z -2.5~6.5 · 남쪽 문) · 다른 목자들의 우리 둘
    const fold = (cx, cz, w, d) => { const hw = w / 2, hd = d / 2; put('wallSeg', cx, cz - hd, { args: [w, 1.1] }); col(cx, cz - hd, w, 0.6, BY - 1, BY + 1.2); for (const s of [-1, 1]) { put('wallSeg', cx + s * hw, cz, { ry: Math.PI / 2, args: [d, 1.1] }); col(cx + s * hw, cz, 0.6, d, BY - 1, BY + 1.2); }
      const gw = (w - 3) / 2; for (const s of [-1, 1]) { const x = cx + s * (1.5 + gw / 2); put('wallSeg', x, cz + hd, { args: [gw, 1.1] }); col(x, cz + hd, gw, 0.6, BY - 1, BY + 1.2); } };
    fold(FOLD[0], FOLD[1], 9, 9); fold(F1[0], F1[1], 8, 8); fold(F2[0], F2[1], 8, 8);
    put('trough', FOLD[0] + 2.6, FOLD[1] - 2.8); put('trough', F1[0] - 2, F1[1] - 2.6); put('trough', F2[0] + 2, F2[1] - 2.6);
    // ---- 털 깎는 곳
    box(5.4, 0.12, 4.4, SHED[0], BY + 2.4, SHED[1], 0xb89a62, { j: 0.06 }); for (const [dx, dz] of [[-2.4, -2], [2.4, -2], [-2.4, 2], [2.4, 2]]) { cyl(0.08, 0.09, 2.4, 6, SHED[0] + dx, BY + 1.2, SHED[1] + dz, 0x6a4a30); colR(SHED[0] + dx, SHED[1] + dz, 0.15, BY + 2.4); }
    box(1.8, 0.45, 0.8, SHED[0] - 0.6, BY + 0.22, SHED[1] + 1.2, 0x7a5a3a); for (let k = 0; k < 5; k++) sph(0.42, SHED[0] + 1.6 + (k % 2) * 0.5, BY + 0.35 + Math.floor(k / 2) * 0.42, SHED[1] - 1 + (k % 3) * 0.3, 0xece4d4, { s: [1.2, 0.8, 1], j: 0.12 }); colR(SHED[0] + 1.8, SHED[1] - 0.8, 0.8, BY + 1.2);
    // ---- v18.82 우리 동쪽 마른 덤불(다섯째 해 땔감) · 넷째 해 찢긴 양이 있던 덤불
    for (const [dx, dz, s0] of [[0, 0, 1.1], [1.7, 0.9, 0.9], [-1.5, 1.1, 0.8], [0.7, -1.5, 1]]) { put('bush', BRUSH[0] + dx, BRUSH[1] + dz, { s: s0 }); put('dryGrass', BRUSH[0] + dx * 1.4 + 0.6, BRUSH[1] + dz * 1.4 - 0.4, { s: 0.9 }); }
    put('bush', TORN[0] + 1.1, TORN[1] - 0.8, { s: 1.1 }); put('dryGrass', TORN[0] - 0.9, TORN[1] + 0.6, { s: 0.9 });
    // ---- 남서쪽 보리밭 · 텃밭 · 망대 · 올리브 숲
    
    for (let k = 0; k < 26; k++) put('dryGrass', FIELD[0] - 6 + (k % 9) * 1.5, FIELD[1] - 4 + Math.floor(k / 9) * 3.2 + rng(), { args: [0xd8c070] });
    for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) sph(0.26, FIELD[0] - 5.2 + k * 1.3, BY + 0.15, FIELD[1] + 9.4 + r * 1.4, [0x5a8a3a, 0x6a9a44, 0x7aa24c][(r + k) % 3], { s: [1, 0.7, 1], j: 0.15 });
    put('booth', -45, 37, { ry: 0.6 }); colR(-45, 37, 1.3);
    for (const [x, z] of [[-56, 20], [-52, 24.5], [-58, 28.5], [-53, 32.5], [-57.5, 37], [-52, 41], [-58, 45]]) { put('olive', x, z, { s: 0.9 + rng() * 0.2 }); colR(x, z, 0.4); }
    // ---- 북서쪽 하란 성읍 (벌집 지붕 집 · 성벽 · 성문)
    for (const [x, z, s] of [[-52, -24, 4.4], [-46, -28, 4], [-56.5, -31, 4.6], [-48, -35, 4.2], [-41.5, -24.5, 3.8], [-58, -22, 3.6], [-53, -38.5, 4], [-42, -33, 4.4]]) bee(x, z, s, 's');
    wall(-56, -16.6, 12, 0.7, 2.6); wall(-41.5, -16.6, 5, 0.7, 2.6); for (const x of [-49.6, -45.6]) { box(1.1, 3.6, 1.1, x, BY + 1.8, -16.6, MUD, { j: 0.03 }); col(x, -16.6, 1.1, 1.1, BY - 1, BY + 3.6); }
    put('pots', -44.4, -14.6); put('sacks', -50.6, -14.2);
    // ---- 다른 목자들의 장막 · 밤 모닥불
    for (const [x, z, ry] of [[30, -42, 0.2], [42, -45, -0.3]]) { put('tent', x, z, { ry, args: [0x3a302c] }); col(x, z, 6, 4, BY - 1, BY + 2.6); }
    put('campfire', CAMPF[0], CAMPF[1]); colR(CAMPF[0], CAMPF[1], 0.7, BY + 0.5);
    // ---- 강가 미루나무(백양목 · 창 30:37) · 들의 상수리나무 · 위성류
    const poplar = (x, z, h) => { cyl(0.12, 0.18, h * 0.55, 6, x, BY + h * 0.275, z, 0x8a8478); sph(1.1, x, BY + h * 0.62, z, 0x6e8e4e, { s: [0.75, h * 0.26, 0.75], j: 0.08 }); sph(0.8, x + 0.2, BY + h * 0.86, z - 0.1, 0x7e9e5a, { s: [0.7, h * 0.2, 0.7], j: 0.08 }); colR(x, z, 0.3); };
    for (const z of [-50, -38, -25, 10, 21, 33, 47]) poplar(RIVER - 5.6, z + rng() * 2, 8 + rng() * 3); for (const z of [-48, -36, -22, -10, 4, 16, 29, 43]) poplar(RIVER + 6.4, z + rng() * 2, 8 + rng() * 3);
    for (let i = 0; i < 22; i++) { const z = -54 + i * 5.1 + rng(); if (Math.abs(z + 6) < 3) continue; put('reeds', RIVER - 3.4 + (i % 2) * 0.3, z, { s: 0.9 + rng() * 0.3 }); put('reeds', RIVER + 3.4 - (i % 2) * 0.3, z + 2, { s: 0.9 + rng() * 0.3 }); }
    for (const [x, z, k] of [[-48, 14, 'oak'], [-16, 47, 'oak'], [4, 49, 'oak'], [-30, -47, 'oak'], [22, -51, 'oak'], [-61, -46, 'oak'], [-44, -47, 'tamarisk'], [44, 51, 'tamarisk'], [-62, 50, 'tamarisk'], [20, 26, 'tamarisk']]) { put(k, x, z, { s: 0.9 + rng() * 0.25 }); colR(x, z, 0.5); }
    // ---- 바위 · 덤불 · 마른 풀 · 들꽃 (길 · 마당 · 우리 · 밭 · 강은 비워요)
    const keep = (x, z) => { if (x > RIVER - 5 || Math.abs(x) > 62 || Math.abs(z) > 54) return true; if (Math.hypot(x - WELL[0], z - WELL[1]) < 10) return true; if (x > -24 && x < 8 && z > 11 && z < 37) return true; if (x > -63 && x < -38 && z > -42 && z < -14) return true;
      if (x > -47 && x < -26 && z > 22 && z < 47) return true; if (Math.hypot(x - FOLD[0], z - FOLD[1]) < 8 || Math.hypot(x - F1[0], z - F1[1]) < 7 || Math.hypot(x - F2[0], z - F2[1]) < 7 || Math.hypot(x - SHED[0], z - SHED[1]) < 5) return true;
      if (x > 26 && x < 47 && z > -49 && z < -30) return true; if (Math.hypot(x - OUT[0], z - OUT[1]) < 4 || Math.hypot(x - BRUSH[0], z - BRUSH[1]) < 4 || Math.hypot(x - TORN[0], z - TORN[1]) < 3.5 || Math.hypot(x - FIRE5[0], z - FIRE5[1]) < 3 || Math.hypot(x - SHADE[0], z - SHADE[1]) < 4) return true; if (x < -60 || (x > -66 && z > 1 && z < 11 && x < -20)) return true; if (Math.abs(z - 8) < 3 && x > -10 && x < 50) return true; return false; };
    for (let i = 0; i < 150; i++) { const x = -62 + rng() * 112, z = -54 + rng() * 108; if (keep(x, z)) continue; const r = rng(); if (r < 0.14) { put('rock', x, z, { s: 0.5 + rng() * 0.9 }); colR(x, z, 0.5); } else if (r < 0.34) { put('bush', x, z, { s: 0.6 + rng() * 0.5 }); } else if (r < 0.72) put('dryGrass', x, z, { s: 0.8 + rng() * 0.5 }); else put('flowers', x, z); }

    for (let i = 0; i < 200; i++) { const x = -62 + rng() * 112, z = -54 + rng() * 108; if (keep(x, z)) continue; put(i % 9 === 0 ? 'flowers' : 'dryGrass', x, z, { s: 0.7 + rng() * 0.6 }); }
    for (const [x, z] of [[-60, -6], [-54, 50], [-6, -50], [40, 52], [48, 30]]) { put('outcrop', x, z, { s: 1.1 + rng() * 0.5 }); colR(x, z, 1.6); }

    return {}; } });
D.add({ key: 'jacob', land: 'dlcj', dayLabel: s0 => (s0.ch | 0) === 3 && s0.T && YEARS[s0.T.y - 1] ? `${YEAR_CARD[s0.T.y - 1][0]} ${SEA[YEARS[s0.T.y - 1].se]}` : (s0.ch | 0) > 3 ? '일곱 해 뒤' : '하란', backTo: '아버지의 이야기를 잠시 멈추고 고센으로 돌아갈까요?', hero: '야곱', outfit: 'dlcJacob', title: '창세기 야곱 편 · 라헬을 위한 일곱 해', spawn: s0 => { const c = (s0 && s0.ch) | 0, Y = c === 3 && s0.T && s0.T.v === 2 ? YEARS[s0.T.y - 1] : null; /* v18.83 a story carried on starts where its work is (not back on the west road) */
    if (Y) return Y.at.slice(); if (c === 2 || c === 4) return [GATE[0], GATE[1] - 3, Math.PI]; if (c === 5) return [GATE[0] + 2, GATE[1] - 1.6, 0.6]; if (c >= 6) return [GATE[0], GATE[1] - 3, Math.PI]; if (c === 1) return [WELL[0] + 3, WELL[1] + 5, -2.6]; return [OUT[0] + 2.5, OUT[1] + 3, Math.PI / 2]; },
  kit: () => ({ inv: { bread: 3, cheese: 1, fig: 2 }, tools: ['staff'], hand: 'staff', silver: 0, water: 6 }),
  target(s0) { const c = s0.ch | 0, T0 = s0.T, np = id => { const n = npc(id); return n && n.vis ? [n.x - BX, n.z - BZ] : null; };
    if (c === 0) return np('djShep'); if (c === 1) return [WELL[0], WELL[1] + 2.8]; if (c === 2 || c === 4) return np('djLaban') || [GATE[0], GATE[1] - 2]; if (c === 5) return np('djRachel'); if (c >= 6) return null;
    if (!T0 || T0.v !== 2) return null; const k = T0.y * 10 + (T0.k | 0);
    return k === 10 || k === 11 ? [WELL[0], WELL[1] + 2.8] : k >= 20 && k <= 22 ? EWE : k === 30 ? [PAST[0].x, PAST[0].z] : k === 31 || k === 32 ? SHADE : k === 40 || k === 70 ? GATEF : k === 41 ? TORN : k === 50 ? BRUSH : k === 51 || k === 52 ? FIRE5 : k === 60 ? SHED : k === 61 ? STORE : null; },
  onEnter(s0) { placedFor = null; hInit = false; loadOn = false;
    if ((s0.ch | 0) === 3 && (!s0.T || s0.T.v !== 2)) { const y = clamp((s0.T && s0.T.y) | 0 || 1, 1, 7); s0.T = Object.assign(newT(), { y, n: NS[y - 1] }); } /* v18.82 an old save in the middle of the seasons: the start of that year */
    if ((s0.ch | 0) === 3) { const Y = YEARS[s0.T.y - 1]; S().time = Y.hour; s0.T.wt = 0; s0.T.pour = 0; if (G.Weather && G.Weather.set) G.Weather.set(Y.wx, 3); }
    else { S().time = 13; if (G.Weather && G.Weather.set) G.Weather.set('clear', 6); } },
  intro(s0) { if (!s0.ch) narr([D.card('창세기 29:1–2', '야곱 편 · 라헬을 위한 일곱 해', '야곱이 발행하여 동방 사람의 땅에 이르러 본즉, 들에 우물이 있고 그 곁에 양 세 떼가 누웠으니 이는 목자들이 그 우물에서 물을 양 떼에게 먹임이라. 큰 돌로 우물 아귀를 덮었다가…', '창세기 29:1–2'), D.card('아버지의 이야기', '젊은 야곱이 되어', '이 이야기 속에서 요셉은 젊은 날의 아버지 야곱이 되어 걸어요. 큰길을 따라 동쪽으로 가면 들의 우물이 있어요. 우물 곁의 목자들에게 말을 걸어 보세요.\n화면 오른쪽 위 「이야기에서 나오기」로 언제든 고센에 돌아갈 수 있어요. 한 만큼은 남아요.')]); else { toast('아버지의 이야기를 이어서 들어요'); if ((s0.ch | 0) === 3 && s0.T) setTimeout(() => { if (on() && ch() === 3) yearCard(); }, 900); } } });
})(window.G);
