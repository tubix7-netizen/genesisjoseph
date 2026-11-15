/* 약속의 길 — v18.60 (v18.64 따로 된 지도) 창세기 야곱 편 · 라헬을 위한 일곱 해 (dlc_jacob.js)   창 29:1–30 (31:7, 38–41)
   고센에서 아버지 야곱이 들려주는 젊은 날 이야기 속으로 들어가, 젊은 야곱이 되어 하란에서 라반의 양 떼를 일곱 해 동안 쳐요(목장 경영).
   흐름: ① 우물가의 목자들 → ② 우물 돌 굴리기 · 라헬 → ③ 라반과 품삯 → ④ 일곱 해(해마다 봄·여름·가을·겨울, 철마다 일손 셋, 해마다 「올해의 일」 하나)
         → ⑤ 혼인 잔치와 레아 → ⑥ 라헬
   목장: 양 떼 수 · 기운 · 물구유 · 풀밭 셋(뜯으면 줄고 쉬면 자라요) · 꼴(겨울 먹이) · 양털 · 라반의 신임 · 라헬의 마음.
     철마다 하는 일: 물 긷기 / 풀밭으로 몰기 / 양 돌보기(봄엔 새끼) / 양털 깎기(봄·여름) / 밭일(가을 씨, 봄 거둠, 여름 꼴) / 밤 지키기(늑대) / 라헬과 이야기.
     해마다 라반이 양 떼를 세요(TARGET). 숫자는 아래 상수로 조절해요.
   올해의 일(EV): 해마다 한 사람에게 작은 사건이 하나씩 있어요(우물가의 법 · 양털 깎는 날 · 라반의 셈법 · 우물가의 다툼 · 벧엘의 이야기 · 레아의 빵 · 혼인의 너울).
     하지 않아도 해는 넘어가요. 하면 신임이나 마음이 조금 올라요.
   땅(v18.64 따로 된 지도 · dlcep.js · 걷는 곳 x ±66 · z ±58, 그 밖은 들판과 언덕): 서쪽 큰길 → 들의 우물(양 세 떼) → 라반의 집 마당(벌집 지붕 집 · 화덕 · 베틀 · 염소 우리)
     → 야곱의 양 우리 · 털 깎는 곳 → 풀밭 셋 · 다른 목자들의 우리 · 장막 → 동쪽 발릭 강(얕은 여울, 지도 밖까지 흘러요) · 북서쪽 하란 성읍 · 남서쪽 보리밭 · 올리브 숲.
     길 · 마당 · 풀밭 · 밭 · 강가는 땅에 칠해요(ground). 지도의 장소 이름은 PLACES.
   짐승: 양 떼 · 염소 · 나귀 · 낙타 · 개는 이 파일이 직접 그려요(spec.skinned → drawHerd).
   저장: G.DLC.st('jacob') = { ch, T: { y, se, ap, n, hp, grass[3], at, water, hay, wool, sown, trust, heart, evd{해:1}, … }, kind, leah, wellLaw, fin, done, best } */
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
const SEA = ['봄', '여름', '가을', '겨울'], TARGET = [46, 53, 61, 70, 80, 92, 106], START = 40, AP = 3; /* v18.60 셈: 사람이 놀이를 가끔 놓쳐도 닿을 만큼(만점이면 140마리쯤) */
const OUT = [-60, 2.6], WELL = [-30, -6], FOLD = [16, 2], SHED = [28, 14], FIELD = [-36, 30], GATE = [-8, 13], F1 = [-14, -20], F2 = [8, -20], LOOM = [-1, 18], TANNUR = [-17, 17.5], CAMPF = [36, -34];
const LABAN_HOME = [-4.6, 10.4], RACHEL_HOME = [-0.8, 10.8], LEAH_HOME = [-1, 19.7];
const PAST = [{ n: '북쪽 풀밭', x: -2, z: -36, w: 40, d: 16 }, { n: '동쪽 풀밭', x: 38, z: -12, w: 16, d: 30 }, { n: '남쪽 시냇가 풀밭', x: 30, z: 40, w: 28, d: 12 }];
const RIVER = 55; /* 발릭 강: x 51.5 ~ 58.5 · 얕은 여울 */
const YEAR_CARD = [
  ['첫 해', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'],
  ['둘째 해', '낮에는 더위를 무릅쓰고 밤에는 추위를 당하며 눈 붙일 겨를도 없이 지내었나이다.', '창세기 31:40'],
  ['셋째 해', '외삼촌의 암양들이나 암염소들이 낙태하지 아니하였고, 또 외삼촌의 양 떼의 숫양을 내가 먹지 아니하였으며', '창세기 31:38'],
  ['넷째 해', '물려 찢긴 것은 내가 외삼촌에게로 가져가지 아니하고 스스로 그것을 보충하였으며', '창세기 31:39'],
  ['다섯째 해', '내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었나이다.', '창세기 30:30'],
  ['여섯째 해', '내가 이같이 이십 년을 외삼촌의 집에 있으면서… 외삼촌이 내 품삯을 열 번이나 변역하였으며', '창세기 31:41'],
  ['일곱째 해', '야곱이 라반에게 이르되 내 기한이 찼으니 내 아내를 내게 주소서.', '창세기 29:21']];
let LAND = null; const on = () => !!(LAND && LAND.on()), ch = () => st().ch | 0, TY = () => st().T;
const npc = id => Game.npc(id), fin = id => { const n = npc(id); if (n) n.talking = false; };
const newT = () => ({ y: 1, se: 0, ap: AP, n: START, hp: 78, grass: [100, 100, 100], at: -1, water: 50, hay: 0, wool: 0, sown: 0, trust: 50, heart: 10, ev: null, grazed: 0, tended: 0, guard: 0, sheared: 0, lambed: 0, talked: 0, leahT: 0, wellY: 0, evd: {} });
function use(T0) { T0.ap = Math.max(0, T0.ap - 1); sfx('blip', { pitch: 1.1 }); G.UI.quest(); if (T0.ap === 0) setTimeout(() => toast('이 철의 일손을 다 썼어요 · 라반의 집 대문 앞에서 「한 철 마무리하기」'), 900); }
const noAp = T0 => { if (T0.ap > 0) return false; toast('이 철의 일손을 다 썼어요 · 라반의 집 대문 앞에서 「한 철 마무리하기」'); return true; };
const flockAt = () => { for (const a of HERD) if (a.grp === 'flock') { a.tx = null; a.wait = Math.random() * 0.8; } };

/* 사람 자리: 장마다 서 있는 곳이 달라요 (이어하기로 불러와도 그 장의 자리로) */
function put1(id, l, face) { const n = npc(id); if (!n) return; const x = BX + l[0], z = BZ + l[1]; n.x = n.d.x = x; n.z = n.d.z = z; n.walk = null; if (n.wander) { n.wander.cx = x; n.wander.cz = z; n.wander.tx = null; } if (face !== undefined) n.face = n.homeFace = face; }
function placeCast() { const c = ch();
  if (c < 3) { put1('djShep', [WELL[0] - 3.2, WELL[1] + 2.6], 0.6); put1('djShep2', [WELL[0] + 5, WELL[1] + 3.4], -0.9); put1('djShep3', [WELL[0] - 6, WELL[1] - 4], 1.4); }
  else { put1('djShep', [F1[0] + 1.2, F1[1] + 5.4], Math.PI); put1('djShep2', [CAMPF[0] - 2.6, CAMPF[1] + 2.2], 0.5); put1('djShep3', [F2[0] - 1.2, F2[1] + 5.4], Math.PI); }
  put1('djRachel', c === 1 ? [WELL[0] + 5, WELL[1] + 0.8] : RACHEL_HOME, c === 1 ? -1.73 : Math.PI);
  put1('djLaban', LABAN_HOME, Math.PI); put1('djLeah', c === 5 ? [-5.2, 11.4] : LEAH_HOME, c === 5 ? -0.8 : Math.PI); }

// ------------------------------------------------------------------ 한 해의 흐름
const WX = ['clear', 'clear', 'wind', 'cloudy'];
function rollEvent(T0) { const r = Math.random(), se = T0.se; T0.ev = null; if (T0.y === 1 && se === 0) return;
  if (se === 1 && r < 0.4) T0.ev = 'drought'; else if ((se === 2 || se === 3) && r < 0.5) T0.ev = 'wolf'; else if (se === 0 && r < 0.25) T0.ev = 'plague'; else if (r > 0.9) T0.ev = 'good';
  const M = { drought: ['가뭄이 들었어요', '풀이 더디게 자라고 구유의 물이 빨리 줄어요'], wolf: ['밤마다 늑대 소리가 들려요', '우리에서 「밤새 양 떼 지키기」를 하지 않으면 양을 잃어요'], plague: ['양 몇 마리가 기운이 없어요', '우리에서 「양 돌보기」를 해 주세요'], good: ['비가 알맞게 내렸어요', '풀밭이 잘 자라요'] }[T0.ev];
  if (M) setTimeout(() => pop(M[0], M[1], T0.ev === 'good' ? 'star' : 'moon'), 1600); }
/* v18.61 a bigger flock drinks more, crops its pasture harder and needs more winter fodder: the work grows with the flock */
const HAYN = n => Math.round(20 + n * 0.45), DRINK = n => Math.round(30 + n * 0.25);
function endSeason() { const T0 = TY(), log = []; const se = T0.se;
  T0.water -= DRINK(T0.n) + (se === 1 ? 18 : 0); if (T0.ev === 'drought') T0.water -= 15; if (T0.water <= 0) { T0.water = 0; T0.hp -= 14; log.push('구유의 물이 말라 양들이 목말랐어요'); }
  if (se === 3) { const need = HAYN(T0.n); if (T0.hay >= need) T0.hay -= need; else { const short = 1 - T0.hay / need, k = Math.max(1, Math.round(T0.n * 0.12 * short)); T0.hp -= Math.round(34 * short); T0.n -= k; T0.hay = 0; log.push(`겨울 꼴이 모자라 양 ${k}마리가 겨울을 넘기지 못했어요`); } }
  else if (!T0.grazed) { T0.hp -= 12; log.push('양 떼가 풀을 뜯지 못했어요'); }
  if (T0.ev === 'wolf' && !T0.guard) { const k = Math.min(T0.n - 5, 3); T0.n -= k; T0.trust -= 4; log.push(`늑대가 양 ${k}마리를 물어 갔어요`); }
  if (T0.ev === 'plague' && !T0.tended) { T0.hp -= 12; log.push('앓는 양을 돌보지 못했어요'); }
  for (let i = 0; i < 3; i++) if (!(T0.grazed & (1 << i))) T0.grass[i] = clamp(T0.grass[i] + (T0.ev === 'drought' ? 8 : T0.ev === 'good' ? 34 : 22), 0, 100);
  T0.hp = clamp(T0.hp, 5, 100); if (T0.hp < 30) { const k = Math.max(1, Math.round(T0.n * 0.06)); T0.n -= k; log.push(`기운이 다한 양 ${k}마리를 잃었어요`); }
  T0.se++; T0.ap = AP; T0.grazed = 0; T0.tended = 0; T0.guard = 0; T0.talked = 0; T0.leahT = 0; T0.at = -1; flockAt();
  if (G.Weather && G.Weather.set) try { G.Weather.set(WX[T0.se % 4], 8); } catch (e) { }
  if (T0.se > 3) { endYear(log); return; }
  S().time = 7; narr([D.card(`${T0.y}년째 · ${SEA[T0.se]}`, `${SEA[se]}이 지나고 ${SEA[T0.se]}이 왔어요`, (log.length ? log.join(' · ') + '.\n' : '양 떼가 무사히 한 철을 났어요.\n') + `양 ${T0.n}마리 · 기운 ${Math.round(T0.hp)}% · 물구유 ${Math.round(T0.water)}% · 꼴 ${T0.hay}`)], () => { rollEvent(T0); G.UI.quest(); }); }
function endYear(log) { const T0 = TY(), y = T0.y, tg = TARGET[y - 1], okN = T0.n >= tg, C = YEAR_CARD[y - 1];
  T0.trust = clamp(T0.trust + (okN ? 10 : -8) + Math.min(6, Math.floor(T0.wool / 12)), 0, 100); const wool = T0.wool; T0.wool = 0;
  const lab = okN ? (y === 3 || y === 5 ? '양은 잘 불었구나. …그런데 올해부터는 네 몫의 품삯을 다시 셈해야겠다.' : '허허, 내 양 떼가 이리 불다니! 네가 온 뒤로 집에 복이 드는구나.') : '양이 내 셈보다 모자라는구나. 내년에는 더 힘써야겠다.';
  S().time = 7; narr([D.card(`${y}년이 지났다`, C[0], (log.length ? log.join(' · ') + '.\n' : '') + `라반이 양 떼를 세었습니다. ${T0.n}마리 (라반의 셈 ${tg}마리)${wool ? ` · 양털 ${wool}뭉치` : ''}`), D.card(C[2], y < 7 ? '섬김의 날들' : '칠 년이 찼다', C[1], C[2])],
    () => say([Ln('라반', lab, okN ? 'happy' : 'cold')].concat(y === 3 || y === 5 ? [T('라반은 야곱의 품삯을 열 번이나 바꾸었습니다. 그러나 하나님이 그를 금하사 야곱을 해치지 못하게 하셨습니다.', '창세기 31:7')] : []), () => {
      fin('djLaban'); Game.insight && Game.insight(1, `야곱 편 ${y}년째`); if (y >= 7) { st().ch = 4; st().fin = { n: T0.n, trust: T0.trust, heart: T0.heart }; G.UI.quest(); pop('칠 년이 찼어요', '라반의 집 대문 앞에서 라반에게 말해요', 'star'); return; }
      T0.y++; T0.se = 0; T0.lambed = 0; T0.sheared = 0; T0.wellY = 0; rollEvent(T0); G.UI.quest(); const e = evOpen(T0); if (e) setTimeout(() => pop(`올해의 일 · ${e.t}`, `${e.nm}에게 말을 걸어 보세요`, 'star'), 2600); })); }

// ------------------------------------------------------------------ 올해의 일 (해마다 하나 · 하지 않아도 해는 넘어가요)
const EV = [
  { y: 1, who: 'djShep', nm: OLD, t: '우물가의 법', run: evWell },
  { y: 2, who: 'djSon1', nm: SON1, t: '양털 깎는 날', need: T0 => T0.sheared ? '' : '봄이나 여름에 털 깎는 곳에서 양털을 먼저 깎아요', miss: T0 => T0.se >= 2 && !T0.sheared, run: evShear },
  { y: 3, who: 'djLaban', nm: '라반', t: '라반의 셈법', run: evWage },
  { y: 4, who: 'djShep2', nm: YNG, t: '우물가의 다툼', run: evQuarrel },
  { y: 5, who: 'djRachel', nm: '라헬', t: '벧엘의 이야기', run: evBethel },
  { y: 6, who: 'djLeah', nm: '레아', t: '레아의 빵', run: evBread },
  { y: 7, who: 'djBilhah', nm: BIL, t: '혼인의 너울', run: evVeil }];
function evOpen(T0) { if (!T0) return null; const e = EV.find(x => x.y === T0.y); if (!e) return null; if ((T0.evd || {})[e.y]) return null; if (e.miss && e.miss(T0)) return null; return e; }
const evReady = (e, T0) => !e.need || !e.need(T0);
function evDone(T0, e, sub) { (T0.evd || (T0.evd = {}))[e.y] = 1; G.UI.quest(); pop(`올해의 일 · ${e.t}`, sub || '마쳤어요', 'star'); }
function evTry(id) { if (ch() !== 3) return false; const T0 = TY(), e = evOpen(T0); if (!e || e.who !== id || !evReady(e, T0)) return false; e.run(T0, e); return true; }
function evWell(T0, e) { say([Ln(OLD, '젊은이, 그날 혼자서 우물 돌을 굴린 일로 온 들판이 떠들썩했다오.', 'happy'), Ln(OLD, '허나 이 들판에는 법이 있소. 떼가 다 모여야 돌을 옮기지. 물이 귀한 해에도 모든 떼가 고루 마시게 하려는 것이오.'),
    { n: '야곱', t: '(무엇이라 답할까?)', choices: [{ t: '"앞으로는 떼가 다 모이면 함께 굴리겠소."', then: () => { st().wellLaw = 1; T0.trust = clamp(T0.trust + 4, 0, 100); } }, { t: '"그날은 라헬의 양 떼가 목말라 보였소."', then: () => { T0.heart = clamp(T0.heart + 3, 0, 100); } }] },
    Ln(OLD, '허허. 들판 일은 서로 돕고 사는 거요. 앞으로 해마다 첫 물은 우리가 함께 밀어 주리다.')], () => { fin('djShep'); st().wellLaw = 1; evDone(T0, e, '이제 해마다 첫 물은 목자들이 함께 돌을 밀어 줘요'); }); }
function evShear(T0, e) { narr([D.card('창세기 31:19 · 38:12', '양털 깎는 날', '양털을 깎는 날은 목자들의 잔칫날이었어요. 라반의 집안도 이웃을 불러 먹고 마시며 한 해의 털을 기뻐했어요.')],
  () => say([Ln(SON1, '올해 털이 이렇게 많이 나온 건 처음이야! 아버지가 오늘은 잔치를 하자셔.', 'happy'), Ln('라반', '허허, 저 양털 더미를 봐라! 오늘은 다들 실컷 먹어라.', 'happy'), Ln('라헬', '야곱이 깎은 털이 제일 고와요. 한 올도 상하지 않았어요.', 'happy'), J('(라헬의 웃음소리가 마당 가득 퍼졌다.)', '', 'tender')],
    () => { fin('djSon1'); T0.trust = clamp(T0.trust + 6, 0, 100); T0.heart = clamp(T0.heart + 4, 0, 100); Game.give && Game.give('cheese', 1, true); evDone(T0, e, '라반의 신임 +6 · 라헬의 마음 +4 · 치즈 한 덩이'); })); }
function evWage(T0, e) { say([Ln('라반', '야곱아, 지난해 들짐승에게 찢긴 양이 있었지. 그 값은 누가 치르겠느냐?', 'cold'),
  { n: '야곱', t: '(무엇이라 답할까?)', choices: [
    { t: '"찢긴 것은 제가 스스로 채우겠습니다."', then: () => setTimeout(() => say([T('물려 찢긴 것은 내가 외삼촌에게로 가져가지 아니하고 스스로 그것을 보충하였으며, 낮에 도적을 맞았든지 밤에 도적을 맞았든지 외삼촌이 그것을 내 손에서 찾았으며', '창세기 31:39'), Ln('라반', '좋다. 네 셈이 바르구나.', 'happy')],
      () => { fin('djLaban'); T0.n = Math.max(10, T0.n - 2); T0.trust = clamp(T0.trust + 8, 0, 100); evDone(T0, e, '양 두 마리를 채워 넣었어요 · 라반의 신임 +8'); }), 30) },
    { t: '"들짐승이 물어 간 것을 어찌 제가 물어냅니까?"', then: () => setTimeout(() => say([Ln('라반', '흥, 그렇다면 네 품삯에서 깎을 테다.', 'cold'), T('외삼촌이 내 품삯을 열 번이나 변역하였으나, 하나님이 그를 금하사 나를 해치지 못하게 하셨으며', '창세기 31:7')],
      () => { fin('djLaban'); T0.trust = clamp(T0.trust - 5, 0, 100); evDone(T0, e, '라반의 신임 -5'); }), 30) }] }], null); }
function evQuarrel(T0, e) { say([Ln(YNG, '야곱 형! 셋째 떼 목자가 자기 떼부터 먹이겠다고 우겨요. 우리가 먼저 왔는데!', 'angry'), Ln(SH3, '우리 떼가 제일 크니 먼저 마셔야 하오!', 'angry'),
  { n: '야곱', t: '(어떻게 할까?)', choices: [
    { t: '"먼저 온 떼부터 차례로 먹입시다."', then: () => setTimeout(() => say([Ln(SH3, '…흠. 법대로 하자면 그렇지. 알겠소.', 'cold'), Ln(YNG, '고마워요, 형!', 'happy')], () => { fin('djShep2'); T0.trust = clamp(T0.trust + 3, 0, 100); evDone(T0, e, '다툼이 가라앉았어요 · 라반의 신임 +3'); }), 30) },
    { t: '"내가 돌을 굴려 모든 떼에 물을 길어 주겠소."', then: () => setTimeout(() => G.UI.minigame('push', { title: '모든 떼를 위해 돌 굴리기', hint: '꾹 눌러 밀다가, 힘이 빠지면 잠깐 놓았다가 다시 밀어요.', btn: '꾹 눌러 밀기' }, ok => {
      fin('djShep2'); if (ok) { T0.water = 100; T0.hp = clamp(T0.hp + 5, 5, 100); T0.trust = clamp(T0.trust + 5, 0, 100); sfx('splash', { vol: 0.5 }); evDone(T0, e, '모든 떼가 물을 마셨어요 · 물구유 가득 · 신임 +5'); }
      else { T0.water = clamp(T0.water + 50, 0, 100); evDone(T0, e, '목자들이 함께 밀어 주었어요 · 물구유 +50'); } }), 30) }] }], null); }
function evBethel(T0, e) { say([Ln('라헬', '야곱, 가나안에서 여기까지 혼자 오던 길은 무섭지 않았어요?', 'tender'), J('어느 밤 들에서 돌을 베고 잤소. 꿈에 땅에서 하늘까지 닿은 사다리가 보였지.', '창세기 28:12'),
    J('하나님의 사자들이 그 위에서 오르락내리락하고, 그분이 말씀하셨소. 「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며 너를 이끌어 이 땅으로 돌아오게 할지라」', '창세기 28:15'), Ln('라헬', '…그래서 당신은 무서워하지 않는군요.', 'tender'), J('무서울 때도 있소. 그래도 그 말씀을 붙들지.', '', 'tender')],
  () => { fin('djRachel'); T0.heart = clamp(T0.heart + 8, 0, 100); Game.insight && Game.insight(1, '벧엘의 이야기'); evDone(T0, e, '라헬의 마음 +8'); }); }
function evBread(T0, e) { say([Ln('레아', '들에 나가 계시느라 춥지요? 갓 구운 빵과 따뜻한 젖이에요.', 'tender'),
  { n: '야곱', t: '(무엇이라 답할까?)', choices: [
    { t: '"고맙소, 레아. 그대의 손이 따뜻하구려."', then: () => setTimeout(() => say([Ln('레아', '(레아의 얼굴이 환해진다) …천천히 드세요.', 'happy')], () => { fin('djLeah'); st().leah = (st().leah | 0) + 1; Game.give && Game.give('bread', 2, true); evDone(T0, e, '빵 두 개를 받았어요'); }), 30) },
    { t: '"라헬이 보냈소?"', then: () => setTimeout(() => say([Ln('레아', '…아니요. 제가 구웠어요.', 'sad'), J('(야곱은 그제야 레아의 언 손을 보았다.)')], () => { fin('djLeah'); Game.give && Game.give('bread', 2, true); evDone(T0, e, '빵 두 개를 받았어요'); }), 30) }] }], null); }
function evVeil(T0, e) { say([Ln(BIL, '혼인 잔치에 쓸 너울을 짜고 있어요. 제일 고운 실로요.', 'happy'), Ln(ZIL, '그런데 주인어른이 너울을 두 장 짜라고 하셨어요. 이상하지요?'), J('두 장이라… (야곱은 고개를 갸웃했다)'), T('그 시절 신부는 혼인 날 너울로 얼굴을 가렸습니다(창 24:65).')],
  () => { fin('djBilhah'); T0.heart = clamp(T0.heart + 3, 0, 100); evDone(T0, e, '혼인 날이 다가와요'); }); }

// ------------------------------------------------------------------ 이야기 마디
function atWell() { say([J('내 형제여, 어디로서냐?', '창세기 29:4'), Ln(OLD, '하란에서로라.'), J('너희가 나홀의 손자 라반을 아느냐?', '창세기 29:5'), Ln(OLD, '아노라.'), J('그가 평안하냐?', '창세기 29:6'), Ln(OLD, '평안하니라. 그 딸 라헬이 지금 양을 몰고 오느니라.'),
    J('해가 아직 높은즉 짐승 모일 때가 아니니 양에게 물을 먹이고 가서 뜯기라.', '창세기 29:7'), Ln(OLD, '우리가 그리하지 못하겠노라. 떼가 다 모이고 목자들이 우물 아귀에서 돌을 옮겨야 우리가 양에게 물을 먹이느니라.', '', '창세기 29:8')],
  () => { fin('djShep'); st().ch = 1; const r = npc('djRachel'); if (r) { r.x = BX + 4; r.z = BZ - 30; Game.npcWalk('djRachel', BX + WELL[0] + 5, BZ + WELL[1] + 0.8, () => { r.face = r.homeFace = -1.73; r.d.x = r.x; r.d.z = r.z; }, 1.7); } flockAt(); toast('라헬이 아버지의 양 떼를 몰고 와요'); G.UI.quest(); }); }
function rollStone() { G.UI.minigame('push', { title: '우물 아귀의 큰 돌', hint: '목자 여럿이 함께 굴리는 돌이에요. 꾹 눌러 밀다가, 힘이 빠지면 잠깐 놓았다가 다시 밀어요.', btn: '꾹 눌러 밀기' }, ok => { if (!ok) { toast('돌이 꿈쩍도 안 해요 · 다시 밀어 봐요'); return; }
    sfx('thud', { pitch: 0.6 }); st().stoneOff = 1; narr([D.card('창세기 29:10', '우물 아귀의 돌', '야곱이 그 외삼촌 라반의 딸 라헬과 그 외삼촌의 양을 보고 나아가서 우물 아귀에서 돌을 옮기고 외삼촌 라반의 양 떼에게 물을 먹이고', '창세기 29:10')],
      () => say([T('그가 라헬에게 입맞추고 소리 내어 울며', '창세기 29:11'), J('나는 그대 아버지의 생질이요 리브가의 아들이라.', '창세기 29:12', 'cry'), Ln('라헬', '리브가 고모님의 아들이라고요? …아버지께 알려야 해요!', 'happy'), T('라헬이 달려가서 그 아비에게 고하매, 라반이 그 생질 야곱의 소식을 듣고 달려와서 그를 영접하여 안고 입맞추고 자기 집으로 인도하여 들이니', '창세기 29:12–13')],
        () => { fin('djRachel'); st().ch = 2; const r = npc('djRachel'); if (r) Game.npcWalk('djRachel', BX + RACHEL_HOME[0], BZ + RACHEL_HOME[1], () => { r.face = r.homeFace = Math.PI; r.d.x = r.x; r.d.z = r.z; }, 2.4); flockAt(); G.UI.quest(); pop('라반의 집으로', '남동쪽 마당 대문 앞의 라반에게 가요', 'star'); })); }); }
function wage() { say([Ln('라반', '너는 참으로 나의 골육이로다.', 'happy', '창세기 29:14'), T('야곱이 한 달을 그와 함께 거하더니', '창세기 29:14'), Ln('라반', '네가 비록 나의 생질이나 어찌 공으로 내 일만 하겠느냐? 무엇이 네 보수겠느냐? 내게 고하라.', '', '창세기 29:15'),
    T('라반이 두 딸이 있으니 형의 이름은 레아요 아우의 이름은 라헬이라. 레아는 안력이 부족하고 라헬은 곱고 아리따우니, 야곱이 라헬을 연애하므로', '창세기 29:16–18'),
    { n: '야곱', t: '(무엇이라 답할까?)', choices: [{ t: '"내가 외삼촌의 작은 딸 라헬을 위하여 외삼촌에게 칠 년을 봉사하리이다."' }] },
    Ln('라반', '그를 네게 주는 것이 타인에게 주는 것보다 나으니 나와 함께 있으라.', '', '창세기 29:19'), Ln('라반', '내 양 떼를 네게 맡기마. 마흔 마리다. 해마다 내가 세어 볼 것이니, 잃지 말고 불려 다오.')],
  () => { fin('djLaban'); st().ch = 3; st().T = newT(); placeCast(); flockAt(); G.UI.quest();
    narr([D.card('하란의 일곱 해', '라반의 양 떼를 치기', '한 해는 봄 · 여름 · 가을 · 겨울, 철마다 일손이 셋이에요.\n· 들의 우물에서 물을 긷고, 풀밭 셋 가운데 하나로 양 떼를 몰아요(뜯은 풀밭은 쉬어야 다시 자라요).\n· 봄에는 동쪽 양 우리에서 새끼를 받고, 봄이나 여름에 털 깎는 곳에서 털을 깎아요.\n· 가을에 남서쪽 보리밭에 씨를 뿌려 봄에 거두고, 여름엔 꼴을 베어 겨울을 나요.\n· 일손을 다 쓰면 라반의 집 대문 앞에서 「한 철 마무리하기」.\n해마다 라반이 양 떼를 세요. 해마다 「올해의 일」도 하나씩 생겨요.')]); }); }
function wedding() { say([J('내 기한이 찼으니 내 아내를 내게 주소서. 내가 그에게 들어가겠나이다.', '창세기 29:21'), Ln('라반', '좋다! 이곳 사람을 다 모아 잔치를 베풀자!', 'happy')], () => { fin('djLaban');
    G.UI.fade(() => { S().time = 20.5; Game.teleport(BX + GATE[0], BZ + GATE[1] + 4, Math.PI); }, () => narr([D.card('창세기 29:22', '혼인 잔치', '라반이 그곳 사람을 다 모아 잔치하고, 저녁에 그 딸 레아를 야곱에게로 데려가매 야곱이 그에게로 들어가니라.', '창세기 29:22–23')],
      () => G.UI.fade(() => { S().time = 6.5; st().ch = 5; placeCast(); Game.teleport(BX + GATE[0], BZ + GATE[1] - 1.6, 0.6); }, () => say([T('야곱이 아침에 보니 레아라.', '창세기 29:25'), J('외삼촌이 어찌하여 내게 이같이 행하셨나이까? 내가 라헬을 위하여 외삼촌께 봉사하지 아니하였나이까? 외삼촌이 나를 속이심은 어찜이니이까?', '창세기 29:25', 'angry'),
        Ln('라반', '형보다 아우를 먼저 주는 것은 우리 지방에서 하지 아니하는 바이라.', 'cold', '창세기 29:26'), Ln('라반', '이를 위하여 칠 일을 채우라. 우리가 그도 네게 주리니, 네가 그를 위하여 또 칠 년을 내게 봉사할지니라.', '', '창세기 29:27'),
        T('아버지를 속여 형의 복을 받았던 야곱이, 이번에는 속임을 당했습니다. 야곱은 무엇을 생각했을까요.'), Ln('레아', '…저를 미워하지 마세요. 아버지가 시키신 일이에요.', 'sad'),
        { n: '야곱', t: '(레아에게)', choices: [{ t: '"그대의 잘못이 아니오. 그대도 이제 내 아내요."', then: () => { st().kind = 1; } }, { t: '(아무 말 없이 고개를 돌린다)' }] }], () => { fin('djLeah'); G.UI.quest(); pop('칠 일을 채웠어요', '라헬에게 가요', 'star'); })))); }); }
function rachel() { const f = st().fin || { n: START, trust: 50, heart: 10 }; say([Ln('라헬', '야곱… 언니를 원망하지 마세요. 그리고 저를 위해 다시 일곱 해라니요.', 'sad'), J('그대를 위해서라면 그 일곱 해도 며칠 같을 것이오.', '', 'tender'),
    T('야곱이 그대로 하여 그 칠 일을 채우매 라반이 딸 라헬도 그에게 아내로 주고, 또 그 여종 빌하를 그 딸 라헬에게 주어 시녀가 되게 하매', '창세기 29:28–29'), T('야곱이 또한 라헬에게로 들어갔고 그가 레아보다 라헬을 더 사랑하고 다시 칠 년을 라반에게 봉사하였더라.', '창세기 29:30')],
  () => { fin('djRachel'); const first = !st().done; st().done = 1; st().ch = 6; st().best = Math.max(st().best || 0, f.n);
    narr([D.card('창세기 29:20', '칠 년을 수일같이', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'),
      D.card('야곱 편을 마쳤어요', '하란의 장부', `맡은 양 ${START}마리 → ${f.n}마리\n라반의 신임 ${Math.round(f.trust)} · 라헬의 마음 ${Math.round(f.heart)}\n${f.n >= TARGET[6] ? '「내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었나이다」(창 30:30)' : '양 떼를 더 불리려면 풀밭을 번갈아 쉬게 하고, 봄마다 새끼를 꼭 받아요.'}\n\n훗날 이 라헬이 낳은 아들이 요셉이에요.`)],
      () => { if (first) { Game.insight && Game.insight(3, '창세기 야곱 편'); S().flags.dlcJacobDone = 1; } say([{ n: '', t: '이야기가 끝났습니다. 고센의 불가로 돌아갈까요?', choices: [{ t: '아버지 곁으로 돌아가기', then: () => D.leave(() => { const j = npc('jacob'); if (j) G.Life.bubble('jacob', '…그 애가 네 어미다, 요셉아.', 4); }) }, { t: '하란을 조금 더 둘러보기' }] }], null); }); }); }

// ------------------------------------------------------------------ 평소 말 (철과 장에 따라)
const seaOf = () => { const T0 = TY(); return ch() === 3 && T0 ? T0.se : 0; };
const CHAT = {
  djShep: () => ch() < 3 ? ['떼가 다 모여야 돌을 옮기는 법이오.', '이 들판 우물은 할아버지의 할아버지 때부터 썼다오.'] : [['봄풀은 연해서 양들이 금세 살이 올라요. 그래도 한 풀밭만 뜯기면 맨땅이 되지.', '봄에는 어미 양 곁을 떠나지 마시오. 새끼가 나오는 철이오.'], ['여름엔 물이 생명이오. 구유가 마르지 않게 하시오.', '한낮엔 양들도 그늘을 찾지.'], ['가을에 씨를 뿌려 두면 봄에 꼴 걱정이 없지.', '바람이 차지면 늑대가 산에서 내려온다오.'], ['겨울밤엔 늑대가 내려와요. 우리 문을 꼭 지키시오.', '눈 덮인 풀밭엔 양을 낼 수가 없소. 꼴이 다요.']][seaOf()],
  djShep2: () => ch() < 3 ? ['저 돌은 혼자서는 못 굴려요.', '라헬 아가씨가 오면 다들 기다려 주지요.'] : ['라헬 아가씨가 요즘 노래를 흥얼거리던데… 누구 때문일까?', '형, 늑대 발자국 보면 나한테도 알려 줘요.', '저 장막이 우리 집이에요. 여름엔 시원하고 겨울엔 연기가 매워요.'],
  djShep3: () => ch() < 3 ? ['우리 떼가 제일 크다오. 그러니 먼저 마시는 게 맞지.', '…흠, 낯선 얼굴이군.'] : ['북쪽 우리가 우리 떼 자리요. 남의 풀밭은 넘보지 마시오.', '라반 어른 떼가 부쩍 늘었더군. 자네 솜씨인가?'],
  djSon1: () => ['아버지는 셈이 밝으셔. 양 한 마리도 그냥 넘어가는 법이 없지.', '네가 온 뒤로 우리 양 떼가 늘었다고 아버지가 웃으시더라.', '양털 깎는 날엔 온 동네가 우리 마당에 모여.'],
  djSon2: () => ['낙타 타 봤어? 나는 아직 무서워.', '누나들은 맨날 나보고 물 길어 오래.', '형, 우물 돌 어떻게 혼자 굴렸어? 나도 가르쳐 줘!'],
  djZilpah: () => ['큰아씨는 베틀 앞에 앉으면 해가 지는 줄도 몰라요.', '빵은 아침에 굽고, 물은 해 질 녘에 길어요.', '화덕 불은 꺼뜨리면 안 돼요. 주인어른이 싫어하세요.'],
  djBilhah: () => ['작은아씨는 양 이름을 다 외워요. 우리 눈엔 다 똑같아 보이는데.', '맷돌질은 노래를 부르며 하면 덜 힘들어요.', '작은아씨가 오늘도 당신 이야기를 했어요. 쉿, 비밀이에요!'],
  djKid: () => ['야곱 아저씨, 정말 혼자 우물 돌을 굴렸어요?', '나도 크면 양 백 마리 칠 거예요!', '강가에서 개구리 잡았어요. 보여 줄까요?'],
  djElder: () => ch() < 2 ? ['나홀 어른 댁 말이오? 라반이 그 집 손자지. 저 남동쪽 마당 큰 집이오.', '하란 성읍엔 장사꾼이 많소. 동쪽 큰 강 건너에서도 오지.'] : ['라반은 셈이 밝은 사람이오. 손해 보는 일은 안 하지.', '양털 깎는 날엔 성읍 사람들도 라반 집에 몰려간다오.', '자네가 그 가나안 청년이구먼. 일 잘한다고 소문났소.'] };
const LEAH_T = [['우물가 일은 들었어요. 동생이 그날 얼굴이 빨개져서 뛰어왔지요.', '(야곱이 머쓱하게 웃었다.)'], ['베틀에 앉으면 마음이 고요해져요. 실이 엉키지 않게 천천히.', '그대가 짠 천은 촘촘하고 곱구려.'], ['아버지는 셈이 밝으신 분이에요. 당신이 손해 보지 않으면 좋겠어요.', '걱정해 주어 고맙소.'],
  ['동생은 양 떼와 들로, 저는 집안일로… 그래도 우리는 서로 아끼는 자매예요.', '그대들 자매는 서로를 많이 아끼는구려.'], ['당신 어머니 리브가 고모님은 어떤 분이세요?', '지혜롭고 굳센 분이오. 나를 가장 아끼셨지.'], ['겨울이 오기 전에 당신 겉옷을 기워 둘게요.', '고맙소, 레아.'], ['곧 혼인 잔치가 열리겠네요. …동생이 행복했으면 좋겠어요.', '(야곱은 고개를 끄덕였다.)']];
const RACHEL_T = [['우물가에서 처음 만난 날을 잊지 못할 거예요.', '나도 그날을 날마다 생각하오.'], ['일곱 해라니… 너무 길지 않나요?', '그대를 생각하면 며칠 같소.'], ['북쪽 풀밭은 봄에 제일 좋아요. 한 번 뜯기면 한 철은 쉬게 해야 해요.', '고맙소. 그대는 양을 나보다 잘 아는구려.'], ['아버지는 셈이 밝으세요. 양을 잃으면 꼭 물어내라 하실 거예요.', '잃은 것은 내가 채워 넣겠소.'], ['겨울 전에 꼴을 넉넉히 베어 두세요. 눈이 오면 풀밭에 못 나가요.', '그리하겠소.'], ['당신 고향 가나안은 어떤 곳이에요?', '아버지 이삭의 장막과 브엘세바의 우물이 있소. 언젠가 함께 갑시다.'], ['이제 얼마 남지 않았어요.', '그대를 위한 일곱 해가 벌써 다 가는구려.']];

// ------------------------------------------------------------------ 짐승 (이 파일이 무대 높이에 직접 그려요)
const HERD = []; let hInit = false, hT = -1, hFrame = 0, bleatT = 8, fireT = 0, placedFor = null;
const GA = { w0: [WELL[0] - 7, WELL[1] - 6, 2.4], w1: [WELL[0] + 7, WELL[1] - 7, 2.4], w2: [WELL[0] - 1, WELL[1] - 10, 2.4], f1: [F1[0], F1[1], 2.6], f2: [F2[0], F2[1], 2.6], pen: [2.2, 22.6, 1.2], donk: [-14.6, 10.6, 1.0], cam0: [9.2, 20, 0.1], cam1: [9.6, 24.6, 0.1], kidg: [-20, 6, 3] };
function grpArea(g) { const c = ch();
  if (g === 'flock') { const T0 = TY(); if (c === 1) return [WELL[0] + 7, WELL[1] + 3.4, 2.6]; if (c >= 3 && T0 && T0.at >= 0) { const p = PAST[T0.at]; return [p.x, p.z, Math.min(p.w, p.d) / 2 - 2]; } return [FOLD[0], FOLD[1] - 0.5, 2.8]; }
  if (g === 'dog') { const n = npc('djShep'); if (n && n.vis) return [n.x - BX + 1.6, n.z - BZ + 1.2, 1.6]; return [F1[0], F1[1] + 6, 2]; }
  return GA[g] || null; }
const flockVis = () => { const c = ch(); if (c < 1) return 0; const n = c >= 3 && TY() ? TY().n : START; return clamp(Math.round(n / 7), 5, 18); };
function herdInit() { HERD.length = 0; let k = 0; const add = (kind, pat, grp, n, o) => { for (let i = 0; i < n; i++) HERD.push(Object.assign({ kind, pat, grp, i, k: k++, x: 0, z: 0, f: Math.random() * 6.28, tx: null, wait: Math.random() * 3, ph: Math.random() * 6, sp: 0, seed: Math.random() * 10, s: 1, rig: null }, o || {})); };
  const fl = ['plain', 'plain', 'plain', 'plain', 'black', 'plain', 'plain', 'plain', 'brown', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain', 'plain'];
  fl.forEach((p, i) => add(i === 4 || i === 11 ? 'goat' : 'sheep', i === 11 ? 'black' : p, 'flock', 1, { i, s: i === 4 || i === 11 ? 0.95 : 1 }));
  add('sheep', 'plain', 'w0', 5); add('sheep', 'spotted', 'w1', 4); add('goat', 'brown', 'w1', 1); add('sheep', 'plain', 'w2', 4); add('goat', 'black', 'w2', 1);
  add('sheep', 'plain', 'f1', 5); add('goat', 'black', 'f1', 2); add('sheep', 'speckled', 'f2', 5); add('sheep', 'brown', 'f2', 1);
  add('goat', 'brown', 'pen', 2); add('goat', 'black', 'pen', 2, { s: 0.7 });
  add('donkey', 'plain', 'donk', 1, { extra: { pack: 0x7a5a3a } }); add('donkey', 'plain', 'donk', 1);
  add('camel', 'plain', 'cam0', 1, { lieAlways: 1 }); add('camel', 'plain', 'cam1', 1, { lieAlways: 1 }); add('jackal', 'plain', 'dog', 1, { s: 0.9 }); add('goat', 'brown', 'kidg', 2, { s: 0.75 });
  for (const a of HERD) { const ar = grpArea(a.grp) || [0, 0, 1], an = Math.random() * 6.283, r = Math.sqrt(Math.random()) * ar[2]; a.x = ar[0] + Math.cos(an) * r; a.z = ar[1] + Math.sin(an) * r; }
  hInit = true; }
function herdTick(dt) { const h = S().time % 24, night = h > 20.5 || h < 5.5, nv = flockVis(), c = ch();
  for (const a of HERD) { a.vis = a.grp !== 'flock' || a.i < nv; if (!a.vis) continue; const ar = grpArea(a.grp); if (!ar) { a.vis = false; continue; }
    const far = Math.hypot(a.x - ar[0], a.z - ar[1]) > ar[2] + 1.5, lie = a.lieAlways || (night && a.kind !== 'jackal' && a.kind !== 'donkey') || (c === 0 && /^w/.test(a.grp));
    if (lie && !far) { a.lie = true; a.sp = 0; a.graze = false; continue; } a.lie = false;
    if (a.tx === null || a.tx === undefined || (far && !a.drive)) { const an = Math.random() * 6.283, r = Math.sqrt(Math.random()) * ar[2]; a.tx = ar[0] + Math.cos(an) * r; a.tz = ar[1] + Math.sin(an) * r; a.drive = far; if (far) a.wait = Math.random() * 0.6; }
    if (a.wait > 0) { a.wait -= dt; a.sp *= 0.85; a.graze = !a.drive; continue; }
    const dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz);
    if (d < 0.3) { a.tx = null; a.drive = false; a.wait = 2 + Math.random() * 5; continue; }
    const want = a.drive ? (a.kind === 'jackal' ? 3.2 : 1.8) : (a.kind === 'jackal' ? 1.3 : 0.5); a.sp += (want - a.sp) * Math.min(1, dt * 3); a.graze = false;
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
let STONE = null; const SM = G.m4();
LAND = XL.make({ key: 'dlcj', story: 'jacob', name: '하란 (아버지의 이야기)', title: '창세기 야곱 편 · 라헬을 위한 일곱 해', hero: '야곱', look: LK.jacobY, seed: 229, area: [-66, 66, -58, 58], spawn: [OUT[0] + 2.5, OUT[1] + 3, Math.PI / 2],
  places: PLACES, ground, valley: (x, z) => 1 - XL.sm(10, 42, Math.abs(x - RIVER)), outFloor: (x, z, h) => { const dr = Math.abs(x - RIVER); if (dr > 9) return null; return (dr < 3.5 ? -0.72 * clamp((3.5 - dr) / 1.6, 0, 1) : 0) + h * XL.sm(3.5, 9, dr); },
  water: { level: -0.38, shallow: [0.24, 0.46, 0.38], deep: [0.08, 0.24, 0.2] }, sceneryAvoid: (x, z) => Math.abs(x - RIVER) < 7 || roadD(x, z) < 3, trees: ['oak', 'tamarisk', 'olive', 'acacia'],
  skinned: (list, t) => drawHerd(list, t),
  people: [
    person('djShep', OLD, LK.shepOld, [WELL[0] - 3.2, WELL[1] + 2.6], 0.6, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep() }),
    person('djShep2', YNG, LK.shepYoung, [WELL[0] + 5, WELL[1] + 3.4], -0.9, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep2() }),
    person('djShep3', SH3, LK.shep3, [WELL[0] - 6, WELL[1] - 4], 1.4, { prop: 'staff', show: () => on(), chat: S => CHAT.djShep3() }),
    person('djRachel', '라헬', LK.rachel, RACHEL_HOME, Math.PI, { prop: 'staff', show: () => on() && ch() >= 1 }),
    person('djLaban', '라반', LK.laban, LABAN_HOME, Math.PI, { show: () => on() && ch() >= 2 }),
    person('djLeah', '레아', LK.leah, LEAH_HOME, Math.PI, { show: () => on() && ch() >= 2 }),
    person('djZilpah', ZIL, LK.zilpah, [TANNUR[0] + 1.2, TANNUR[1] + 2], Math.PI, { show: () => on() && ch() >= 2, chat: S => CHAT.djZilpah() }),
    person('djBilhah', BIL, LK.bilhah, [-13.5, 21.8], Math.PI, { show: () => on() && ch() >= 2, act: 'gather', chat: S => CHAT.djBilhah() }),
    person('djSon1', SON1, LK.son1, [F2[0] - 4, F2[1] + 5.6], Math.PI, { prop: 'staff', show: () => on() && ch() >= 2, chat: S => CHAT.djSon1() }),
    person('djSon2', SON2, LK.son2, [8.2, 16], -1.5, { show: () => on() && ch() >= 2, wander: 2, chat: S => CHAT.djSon2() }),
    person('djKid', '하란 아이', LK.kid, [-20, 8.6], 0.4, { scale: 0.62, wander: 3, show: () => on(), chat: S => CHAT.djKid() }),
    person('djElder', '하란 성읍의 노인', LK.elder, [-44, -12.6], 1.0, { wander: 1.5, show: () => on(), chat: S => CHAT.djElder() })],
  chatter: [['올해는 비가 알맞게 오려나.', '하늘이 하는 일을 누가 알겠소.'], ['라반 어른 양 떼가 부쩍 늘었더군.', '그 가나안 청년 덕이라던데.'], ['우물 돌은 오늘 누가 굴렸대?', '또 그 청년이지 뭐.'], ['양털 깎는 날이 기다려져요.', '그날은 잔칫날이지!'], ['밤에 늑대 소리 들었어?', '우리 문 단단히 걸어 두자.'], ['발릭 강물이 많이 불었네.', '여울로 건널 땐 조심해야겠어.']],
  talk: {
    djShep(s) { const c = ch(); if (c === 0) { atWell(); return true; } if (evTry('djShep')) return true;
      if (c < 3) { say([Ln(OLD, c === 1 ? '저기 라헬이 오는군. 그런데 저 돌을 정말 혼자 옮기겠다고?' : '혼자서 그 돌을 굴리다니… 무슨 힘이 그리 났소?')], () => fin('djShep')); return true; } return false; },
    djShep2(s) { return evTry('djShep2') ? true : false; },
    djSon1(s) { return evTry('djSon1') ? true : false; },
    djBilhah(s) { return evTry('djBilhah') ? true : false; },
    djLaban(s) { const c = ch(); if (c === 2) { wage(); return true; } if (c === 4) { wedding(); return true; } if (evTry('djLaban')) return true;
      if (c === 3) { const T0 = TY(); say([Ln('라반', T0.trust >= 70 ? '네게 맡긴 뒤로 걱정이 없구나. 올해 셈은 ' + TARGET[T0.y - 1] + '마리다.' : T0.trust >= 40 ? '양은 잘 있느냐? 해가 가기 전에 ' + TARGET[T0.y - 1] + '마리는 되어야 한다.' : '요즘 양 떼가 시원찮구나. 내 딸을 얻으려면 더 힘써라.', T0.trust >= 70 ? 'happy' : '')], () => fin('djLaban')); return true; }
      say([Ln('라반', c >= 5 ? '칠 일을 채우거라. 그러면 라헬도 네게 주마.' : '어서 오너라, 내 누이의 아들아.')], () => fin('djLaban')); return true; },
    djLeah(s) { const c = ch(); if (evTry('djLeah')) return true;
      if (c === 3) { const T0 = TY(); if (T0.leahT) { say([Ln('레아', '(베틀의 북이 가만가만 오간다.)')], () => fin('djLeah')); return true; } T0.leahT = 1; const L = LEAH_T[Math.min(6, T0.y - 1)]; say([Ln('레아', L[0], 'tender'), J(L[1], '', 'tender')], () => fin('djLeah')); return true; }
      if (c >= 6) { say([Ln('레아', st().kind ? '당신이 그날 해 준 말을 잊지 않을게요.' : '…저도 이 집의 아내예요. 언젠가 당신이 저를 돌아봐 주시겠지요.', st().kind ? 'tender' : 'sad')], () => fin('djLeah')); return true; }
      say([Ln('레아', c === 5 ? '…' : '어서 오세요. 아버지는 대문 앞에 계세요.', c === 5 ? 'sad' : '')], () => fin('djLeah')); return true; },
    djRachel(s) { const c = ch(); if (c === 5) { rachel(); return true; } if (evTry('djRachel')) return true;
      if (c === 3) { const T0 = TY(); if (T0.talked) { say([Ln('라헬', '오늘은 양들이 당신을 잘 따르네요.', 'happy')], () => fin('djRachel')); return true; } T0.talked = 1; T0.heart = clamp(T0.heart + 7, 0, 100);
        const L = RACHEL_T[Math.min(6, T0.y - 1)]; say([Ln('라헬', L[0], 'tender'), J(L[1], '', 'tender')], () => { fin('djRachel'); pop('라헬의 마음이 자랐어요', `라헬의 마음 ${Math.round(T0.heart)}`, 'star'); G.UI.quest(); }); return true; }
      say([Ln('라헬', c >= 6 ? '이제는 날마다 함께예요.' : c === 1 ? '목자들이 다 모여야 돌을 옮길 수 있어요. …아직 아무도 안 왔네요.' : '아버지께서 대문 앞에서 기다리세요. 어서 가 보세요.', 'happy')], () => fin('djRachel')); return true; } },
  ctx(s, lx, lz) { const out = [], c = ch(), near = (p, r) => Math.hypot(p[0] - lx, p[1] - lz) < (r || 3), at = (p, o) => Object.assign({ x: BX + p[0], z: BZ + p[1], y: 1.1, noMagnet: true }, o);

    if (c === 1 && near(WELL, 4)) out.push(at(WELL, { d: -1, label: '우물 아귀의 돌 굴리기', key: 'djStone', use: rollStone }));
    if (c !== 3) return out; const T0 = TY();
    if (near(WELL, 4)) out.push(at(WELL, { d: -0.5, label: `물 길어 구유 채우기 (물 ${Math.round(T0.water)}%)`, key: 'djWater', disabled: T0.water >= 95, use: () => { if (noAp(T0)) return; const fill = () => { T0.water = 100; sfx('splash', { vol: 0.5 }); pop('구유를 가득 채웠어요', '양들이 줄지어 물을 마셔요', 'star'); use(T0); };
        if (!T0.wellY && !st().wellLaw) { T0.wellY = 1; G.UI.minigame('push', { title: '우물 돌 굴리기', hint: '올해 첫 물이에요. 꾹 눌러 밀어요.', btn: '꾹 눌러 밀기' }, ok => { if (ok) fill(); else { toast('돌이 안 움직여요 · 다시 해 봐요'); T0.wellY = 0; } }); } else { T0.wellY = 1; fill(); } } }));
    PAST.forEach((p, i) => { if (Math.abs(lx - p.x) < p.w / 2 + 2 && Math.abs(lz - p.z) < p.d / 2 + 2 && T0.at !== i) out.push({ x: P().x, z: P().z, y: 1.1, noMagnet: true, d: 0.2, label: T0.se === 3 ? `${p.n} · 겨울엔 눈이 덮여요` : `양 떼를 ${p.n}으로 몰기 (풀 ${Math.round(T0.grass[i])}%)`, key: 'djPast' + i, disabled: T0.se === 3,
      use: () => { if (noAp(T0)) return; const g = T0.grass[i], gain = Math.round(g / 100 * 20); T0.hp = clamp(T0.hp + gain - (g < 35 ? 6 : 0), 5, 100); T0.grass[i] = clamp(g - (34 + T0.n * 0.22), 0, 100); T0.grazed |= 1 << i; T0.at = i; flockAt(); sfx('rustle', { vol: 0.5 });
        pop(g < 35 ? '풀이 거의 없어요' : `${p.n}에서 풀을 뜯겨요`, g < 35 ? '양들이 배를 못 채웠어요 · 이 풀밭은 쉬게 해요' : `기운 +${gain} · 이 풀밭은 한두 철 쉬어야 다시 자라요`, g < 35 ? 'moon' : 'star'); use(T0); } }); });
    if (near(FOLD, 6.5)) { const lamb = T0.se === 0 && !T0.lambed;
      out.push(at(FOLD, { d: 0.1, label: lamb ? '우리에서 새끼 받기 (봄)' : '우리에서 양 돌보기', key: 'djTend', use: () => { if (noAp(T0)) return; T0.tended = 1; T0.hp = clamp(T0.hp + 8, 5, 100);
        if (lamb) { T0.lambed = 1; const b = Math.max(1, Math.round(T0.n * 0.22 * T0.hp / 100)); T0.n += b; sfx('craft'); sfx('bleat', { vol: 0.5, pitch: 1.4 }); pop(`새끼 양 ${b}마리가 태어났어요!`, `양 ${T0.n}마리 · 어미가 기운이 좋을수록 많이 낳아요`, 'star'); } else pop('양들을 돌봤어요', `기운 ${Math.round(T0.hp)}%`, 'star'); use(T0); } }));
      if (T0.ev === 'wolf' && !T0.guard) out.push(at(FOLD, { d: -0.3, label: '밤새 양 떼 지키기 (늑대)', key: 'djGuard', use: () => { if (noAp(T0)) return; G.UI.minigame('wrestle', { title: '늑대를 쫓아라', hint: '「밤에는 추위를 당하며 눈 붙일 겨를도 없이」(창 31:40) · 초록 칸에서 눌러 지팡이로 쫓아요.', need: 5, dur: 30 }, ok => { T0.guard = 1; if (ok) { sfx('hit'); pop('늑대를 쫓아냈어요', '양을 한 마리도 잃지 않았어요', 'star'); T0.trust = clamp(T0.trust + 3, 0, 100); } else { const k = Math.min(T0.n - 5, 2); T0.n -= k; pop('늑대가 두 마리를 물어 갔어요', '「물려 찢긴 것은 내가 스스로 보충하였으며」(창 31:39)', 'moon'); } use(T0); }); } })); }
    if (near(SHED, 4) && (T0.se === 0 || T0.se === 1)) out.push(at(SHED, { d: 0, label: T0.sheared ? '양털 깎기 · 올해는 다 깎았어요' : '양털 깎기', key: 'djShear', disabled: !!T0.sheared, use: () => { if (noAp(T0)) return; G.UI.minigame('rhythm', { title: '양털 깎기', hint: '박자가 줄에 닿을 때 눌러 가위질해요.', need: 8, beats: 14 }, ok => { T0.sheared = 1; const w = Math.round(T0.n * (ok ? 0.5 : 0.3)); T0.wool += w; T0.trust = clamp(T0.trust + (ok ? 4 : 1), 0, 100); pop(`양털 ${w}뭉치를 깎았어요`, ok ? '라반이 흐뭇해해요' : '서툴러서 털이 많이 상했어요', 'star'); use(T0); }); } }));
    if (near(FIELD, 6) && T0.se !== 3) { const lab = T0.se === 2 ? (T0.sown ? '보리밭 · 씨를 뿌려 두었어요' : '보리 씨 뿌리기 (가을)') : T0.se === 0 ? (T0.sown ? '보리 거두기 (꼴 +60)' : '보리밭 · 지난가을에 씨를 안 뿌렸어요') : '들풀 베어 꼴 만들기 (꼴 +30)', dis = (T0.se === 2 && T0.sown) || (T0.se === 0 && !T0.sown);
      out.push(at(FIELD, { d: 0.2, label: lab, key: 'djField', disabled: !!dis, use: () => { if (noAp(T0)) return; if (T0.se === 2) { T0.sown = 1; pop('보리 씨를 뿌렸어요', '봄에 거두면 겨울 먹이가 돼요', 'star'); } else if (T0.se === 0) { T0.sown = 0; T0.hay += 60; pop('보리를 거뒀어요', `꼴 ${T0.hay} · 이 양 떼는 겨울에 ${HAYN(T0.n)}이 들어요`, 'star'); } else { T0.hay += 30; pop('꼴을 베어 말렸어요', `꼴 ${T0.hay}`, 'star'); } sfx('rustle'); use(T0); } })); }
    if (near(GATE, 3.4)) out.push(at(GATE, { d: 0.9, label: `한 철 마무리하기 (${SEA[T0.se]})`, key: 'djEnd', use: () => { const go = () => G.UI.fade(() => endSeason(), () => { }); if (T0.ap > 0) say([{ n: '', t: `일손이 ${T0.ap} 남았어요. 그래도 ${SEA[T0.se]}을 마칠까요?`, choices: [{ t: '마친다', then: () => setTimeout(go, 40) }, { t: '조금 더 일한다' }] }], null); else go(); } }));
    return out; },
  quest(s) { const c = ch(), T0 = TY(); if (c === 0) return [{ t: '들의 우물 곁 목자들과 이야기하기', ok: false }]; if (c === 1) return [{ t: '우물 아귀의 큰 돌 굴려 내기', ok: false }]; if (c === 2) return [{ t: '외삼촌 라반과 이야기하기 (남동쪽 마당 대문 앞)', ok: false }];
    if (c === 4) return [{ t: '칠 년이 찼어요 · 대문 앞의 라반에게 말하기', ok: false }]; if (c === 5) return [{ t: '라헬에게 가기', ok: false }]; if (c >= 6) return [{ t: '야곱 편을 마쳤어요 · 오른쪽 위 「이야기에서 나오기」로 고센에 돌아가요', ok: true }];
    if (!T0) return [];
    const e = evOpen(T0), rows = [{ t: T0.ap > 0 ? `라헬을 위한 ${T0.y}년째 · ${SEA[T0.se]} · 남은 일손 ${T0.ap}` : `${T0.y}년째 ${SEA[T0.se]} · 일손을 다 썼어요 · 대문 앞에서 「한 철 마무리하기」`, ok: false }, { t: `양 ${T0.n}마리 (기운 ${Math.round(T0.hp)}%) · 라반의 셈 ${TARGET[T0.y - 1]}마리`, ok: T0.n >= TARGET[T0.y - 1] },
      { t: `물구유 ${Math.round(T0.water)}% · 꼴 ${T0.hay}${T0.se === 3 ? '' : T0.hay < HAYN(T0.n) ? ` (겨울에 ${HAYN(T0.n)} 필요)` : ''} · 양털 ${T0.wool}`, ok: T0.water > 45 }, { t: `풀밭 북 ${Math.round(T0.grass[0])} · 동 ${Math.round(T0.grass[1])} · 남 ${Math.round(T0.grass[2])}`, ok: !!T0.grazed || T0.se === 3 },
      { t: `라반의 신임 ${Math.round(T0.trust)} · 라헬의 마음 ${Math.round(T0.heart)}${T0.ev === 'wolf' && !T0.guard ? ' · 늑대!' : T0.ev === 'drought' ? ' · 가뭄' : T0.ev === 'plague' && !T0.tended ? ' · 앓는 양' : ''}`, ok: !(T0.ev === 'wolf' && !T0.guard) }];
    if (e) rows.push({ t: `올해의 일 · ${e.t} · ${evReady(e, T0) ? e.nm + '에게' : e.need(T0)}`, ok: false }); return rows; },
  tick(dt) { if (placedFor !== S()) { placedFor = S(); placeCast(); hInit = false; }
    const p = P(), h = S().time % 24;
    if ((bleatT -= dt) <= 0) { bleatT = 6 + Math.random() * 9; const a = HERD.find(q => q.vis && (q.kind === 'sheep' || q.kind === 'goat') && Math.hypot(BX + q.x - p.x, BZ + q.z - p.z) < 22); if (a) sfx('bleat', { vol: 0.3, pitch: a.kind === 'goat' ? 1.25 : 0.9 + Math.random() * 0.3, x: BX + a.x, z: BZ + a.z }); }
    if ((fireT -= dt) <= 0) { fireT = 0.07; if (G.FX && G.FX.burst) { const F = [[TANNUR[0], TANNUR[1], 0.95, h > 5.5 && h < 20.5]], N = [CAMPF[0], CAMPF[1], 0.4, h > 18.5 || h < 6.5]; F.push(N); for (const [x, z, y, lit] of F) { if (!lit || Math.hypot(BX + x - p.x, BZ + z - p.z) > 45) continue; G.FX.burst(BX + x, BY + y, BZ + z, 1, { c: [1, 0.55 + Math.random() * 0.2, 0.15], sp: 0.18, up: 1.1, size: 0.13, g: -1.6, life: 0.55, a: 0.9, spread: 0.25 }); } } } },
  dyn(list, t) { const c = ch(); if (!STONE) { const g = new G.GB(377); g.cyl(1.32, 1.36, 0.34, 14, { at: [0, 0, 0], c: 0x8a8276, j: 0.06 }); g.cyl(0.9, 1.0, 0.1, 10, { at: [0, 0.2, 0], c: 0x9a9284, j: 0.08 }); STONE = G.R.mesh(g); }
    if (c < 2 && !st().stoneOff) G.m4trs(SM, BX + WELL[0], BY + 0.98, BZ + WELL[1], 0.3, 0, 0, 1, 1, 1); else G.m4trs(SM, BX + WELL[0] + 2.8, BY + 0.2, BZ + WELL[1] + 1.6, 0.8, 0, 0.12, 1, 1, 1); /* rolled off and lying beside the well */
    list.push({ mesh: STONE, m: SM, outline: true }); },
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
      if (x > 26 && x < 47 && z > -49 && z < -30) return true; if (Math.hypot(x - OUT[0], z - OUT[1]) < 4) return true; if (x < -60 || (x > -66 && z > 1 && z < 11 && x < -20)) return true; if (Math.abs(z - 8) < 3 && x > -10 && x < 50) return true; return false; };
    for (let i = 0; i < 150; i++) { const x = -62 + rng() * 112, z = -54 + rng() * 108; if (keep(x, z)) continue; const r = rng(); if (r < 0.14) { put('rock', x, z, { s: 0.5 + rng() * 0.9 }); colR(x, z, 0.5); } else if (r < 0.34) { put('bush', x, z, { s: 0.6 + rng() * 0.5 }); } else if (r < 0.72) put('dryGrass', x, z, { s: 0.8 + rng() * 0.5 }); else put('flowers', x, z); }

    for (let i = 0; i < 200; i++) { const x = -62 + rng() * 112, z = -54 + rng() * 108; if (keep(x, z)) continue; put(i % 9 === 0 ? 'flowers' : 'dryGrass', x, z, { s: 0.7 + rng() * 0.6 }); }
    for (const [x, z] of [[-60, -6], [-54, 50], [-6, -50], [40, 52], [48, 30]]) { put('outcrop', x, z, { s: 1.1 + rng() * 0.5 }); colR(x, z, 1.6); }

    return {}; } });
D.add({ key: 'jacob', land: 'dlcj', dayLabel: s0 => (s0.ch | 0) === 3 && s0.T ? `${s0.T.y}년째 ${SEA[s0.T.se]}` : (s0.ch | 0) > 3 ? '일곱 해 뒤' : '하란', backTo: '아버지의 이야기를 잠시 멈추고 고센으로 돌아갈까요?', hero: '야곱', outfit: 'dlcJacob', title: '창세기 야곱 편 · 라헬을 위한 일곱 해', spawn: () => [OUT[0] + 2.5, OUT[1] + 3, Math.PI / 2],
  kit: () => ({ inv: { bread: 3, cheese: 1, fig: 2 }, tools: ['staff'], hand: 'staff', silver: 0, water: 6 }),
  target(s0) { const c = s0.ch | 0, T0 = s0.T, np = id => { const n = npc(id); return n && n.vis ? [n.x - BX, n.z - BZ] : null; };
    if (c === 0) return np('djShep'); if (c === 1) return [WELL[0], WELL[1] + 2.8]; if (c === 2 || c === 4) return np('djLaban') || [GATE[0], GATE[1] - 2]; if (c === 5) return np('djRachel'); if (c >= 6) return null;
    if (!T0) return null; if (T0.ap === 0) return [GATE[0], GATE[1] - 1]; const e = evOpen(T0); if (e && evReady(e, T0)) { const q = np(e.who); if (q) return q; }
    if (T0.ev === 'wolf' && !T0.guard) return [FOLD[0], FOLD[1] + 6]; if (T0.water < 45) return [WELL[0], WELL[1] + 2.8]; if (T0.se === 0 && !T0.lambed) return [FOLD[0], FOLD[1] + 6]; return null; },
  onEnter(s0) { placedFor = null; hInit = false; S().time = (s0.ch | 0) >= 3 ? 8 : 13; if (G.Weather && G.Weather.set) G.Weather.set(s0.T ? WX[s0.T.se % 4] : 'clear', 6); },
  intro(s0) { if (!s0.ch) narr([D.card('창세기 29:1–2', '야곱 편 · 라헬을 위한 일곱 해', '야곱이 발행하여 동방 사람의 땅에 이르러 본즉, 들에 우물이 있고 그 곁에 양 세 떼가 누웠으니 이는 목자들이 그 우물에서 물을 양 떼에게 먹임이라. 큰 돌로 우물 아귀를 덮었다가…', '창세기 29:1–2'), D.card('아버지의 이야기', '젊은 야곱이 되어', '이 이야기 속에서 요셉은 젊은 날의 아버지 야곱이 되어 걸어요. 큰길을 따라 동쪽으로 가면 들의 우물이 있어요. 우물 곁의 목자들에게 말을 걸어 보세요.\n화면 오른쪽 위 「이야기에서 나오기」로 언제든 고센에 돌아갈 수 있어요. 한 만큼은 남아요.')]); else toast('아버지의 이야기를 이어서 들어요'); } });
})(window.G);
