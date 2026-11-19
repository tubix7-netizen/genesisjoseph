/* 약속의 길 — v18.60 (v18.64 따로 된 지도 · v18.83 성경만 · 더 깊게) 창세기 아브라함 편 · 약속의 별 (dlc_abraham.js)   창 12–22장
   세겜의 옛 제단 앞에서 증조할아버지 아브라함의 이야기 속으로 들어가요. 걷고 숨고 겨루고 올려다보는 체험이에요.
   땅(v18.64 따로 된 지도 · dlcep.js · 걷는 곳 x −94…94 · z −56…64, 그 밖은 들판 · 언덕 · 그리심과 에발)은 네 구역이에요. 장이 바뀌면 페이드로 그 구역에 옮겨 가요. (이 지도는 +z가 북쪽이에요)
     · 세겜(서쪽, x −94…−44): 길가 야영지 CAMP0, 모레 상수리나무, 제단 돌 세 가지, 남동쪽 언덕 LOOK, 가나안 사람의 집과 계단밭
     · 마므레(가운데, x −40…44): 상수리 수풀, 검은 염소털 장막촌, 우물, 우리, 낙타, 야자나무 · 동쪽에 별을 보는 둔덕 · 북쪽 길의 두 야영지(CAMP1 · CAMP2)
     · 단의 밤 진영(동남, x 44…94, z −54…−6): 동방 왕들의 장막, 모닥불, 전리품, 묶인 포로, 파수꾼 넷
     · 모리아 산(동북, 가운데 (72, 42)): 바위투성이 비탈, 오르는 길, 수풀 셋, 꼭대기
   일곱 장 (v18.83 「더할 것」 일곱 가지와 성경만):
     ① 부르심(12–13장): 길 위의 밤(불 · 잠) → 나귀에 짐 싣기 → 짐 행렬과 상수리나무 → 제단 돌 세 가지(큰 밑돌 굴리기 · 평평한 돌 이기 · 흙과 잔돌) → 롯과 언덕에서 요단 들 · 동서남북
     ② 롯을 구하러(14장): 도망해 온 사람 → 마므레 · 창과 활 나눠 주기 → 장정들과 밤길 → 진영 숨어들기 → 멜기세덱
     ③ 별(15–17장): 장막의 이상 → 둔덕의 하늘(둘러보기 · 별 잇기 · 셀 수 없음) → 다섯 가지 고르기 · 마주 놓기 · 솔개 쫓기 · 해 질 때까지 기다림
     ④ 세 나그네(18장) ⑤ 함께 걸으며 배웅하고 간구(18장) ⑥ 웃음, 이삭(21장 · 젖 떼는 날 잔치 채비 · 에셀나무) ⑦ 모리아(22장 · 사흘 길과 두 밤 · 눈을 들어 · 산)
   · 성경 인물(사래 · 롯 · 엘리에셀 · 마므레 · 하갈 · 이스마엘 · 멜기세덱 · 소돔 왕 · 나그네 · 이삭)은 성경 말씀 말고는 말하지 않아요(말을 걸면 몸짓 · `bib`).
     이름 없는 사람(종 · 장정 · 가나안 사람 · 도망해 온 사람 · 파수꾼)은 자유롭게 말해요. 정답 없는 고르기는 없어요.
   · ②는 숨어들기예요: 파수꾼의 눈길(앞쪽 5m)에 들면 겨루기가 벌어져요. 지면 진영 밖으로 밀려나요. 낮게 걷기(앉기 단추)면 눈에 덜 띄어요.
   · ⑦에서 이삭을 묶는 대목은 글로만 전하고, 손에 쥐는 것은 「수풀에 걸린 수양」을 찾는 일이에요.
   저장: G.DLC.st('abraham') = { v: 2, ch, ph, fire0, st3{big, flat(1 이는 중 · 2 놓음), earth}, altar1, lotGo, lotDone, rally{mamre, capt, arm}, march, down, lot, pc, pcGot, wt, got, w4, pleaOn, fe{flour, dates, mats}, renamed, planted, saddle, wood, jr, fire1, fire2, asked, altar2, seen, ramAt, done } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, XL = G.DLCEP, D = G.DLC; if (!Game || !EP || !XL || !D) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (a, b, c) => (D.pop || G.UI.pop || G.UI.toast)(a, b, c), toast = t => (D.toast || G.UI.toast)(t);
const st = () => D.st('abraham'), say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), Ln = D.Ln, T = D.T, card = D.card;
const A = (t, ref, e) => ({ n: st().renamed ? '아브라함' : '아브람', t, ref, e });
const SARAI = () => st().renamed ? '사라' : '사래';

// ------------------------------------------------------------------ the look of the people (each one their own: Abraham is not old Jacob)
/* 아브라함: 아주 늙은 족장 · 새하얀 긴 수염과 머리 · 흰 두건에 검은 띠 · 검은 염소털 겉옷에 크림·황토 줄 · 황금빛 띠 (야곱의 붉은 갈색·남색과 겹치지 않게) */
EP.outfits.dlcAbraham = { skin: 0xc48c62, hair: 0xf2efe8, hairStyle: 'long', beard: 'long', beardCol: 0xfaf8f2, eye: 0x3a2a1a, browAng: 0.3, jaw: 0.3, build: 0.95, age: 'old', long: true, longSleeve: true,
  top: 0xe6dcc4, under: 0xe6dcc4, trim: 0xc8902e, trim2: 0x6a5a3a, belt: 0xc8902e, sash: 0xc8902e,
  mantle: 0x2e2a26, mantleStripes: [0x2e2a26, 0x2e2a26, 0xe6dcc4, 0x2e2a26, 0x9a7a44, 0x2e2a26], mantleWeave: true, mantleTrim: 0xc8902e,
  headwear: 'cloth', clothCol: 0xf6f2ea, clothStripe: 0xc8902e, bandCol: 0x1e1a16, legWrap: 0x6a5a48, sandal: 0x5a3a22, vary: false };
const LK = {
  sarai: { skin: 0xd8a47a, fem: true, long: true, top: 0x4a5a7e, under: 0x4a5a7e, trim: 0xc89a48, sash: 0xa8582a, headwear: 'veil', clothCol: 0xece2cc, clothStripe: 0x8a4a3a, hair: 0x4a3a32, hairStyle: 'long', eye: 0x4a3020, browAng: -0.1 },
  lot: { skin: 0xd09a6c, top: 0x5a7a4a, under: 0xd8ccb0, trim: 0x3a4a2a, belt: 0x5a3a24, mantle: 0x8a7a5a, mantleTrim: 0x3a4a2a, hair: 0x2a1c14, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1c14, headwear: 'band', bandCol: 0x6a3a22, long: true, build: 0.85 },
  eli: { skin: 0xb88a5e, top: 0xa88a52, under: 0xe0d4b4, trim: 0x5a4a2a, belt: 0x4a3420, hair: 0x5a4a3c, beard: 'short', beardCol: 0x6a5a4a, headwear: 'turban', clothCol: 0xd8c8a0, long: true, build: 0.9, jaw: 0.1 },
  melch: { skin: 0xc8946a, top: 0xf4f0e4, under: 0xf4f0e4, trim: 0xd8b040, mantle: 0x5a2a72, mantleTrim: 0xe0b040, sash: 0xe0b040, hair: 0xb8b0a6, beard: 'long', beardCol: 0xd0c8be, headwear: 'turban', clothCol: 0xf4f0e4, long: true, longSleeve: true, eye: 0x3a2a1a, browAng: 0.15 },
  sodom: { skin: 0xc08a5a, top: 0x8a2a3a, under: 0xe0d0b0, trim: 0xe0b040, mantle: 0x3a1a22, mantleTrim: 0xe0b040, sash: 0xe0b040, hair: 0x1a1410, beard: 'short', beardCol: 0x1a1410, headwear: 'cap', clothCol: 0xe0b040, long: true, build: 1.05 },
  isaac: { skin: 0xd8a478, top: 0xe2d6b6, under: 0xe2d6b6, trim: 0x8a6a3a, belt: 0x6a4428, hair: 0x2a1a12, hairStyle: 'curly', beard: false, eye: 0x4a3020, build: 0.6, jaw: -0.3 },
  visitor: { skin: 0xd8b08a, top: 0xf8f6f0, under: 0xf8f6f0, trim: 0xe8dcb0, mantle: 0xffffff, mantleTrim: 0xe8d8a0, hair: 0x3a2c22, beard: 'short', beardCol: 0x3a2c22, long: true, longSleeve: true, browAng: 0.05 },
  guard: { skin: 0xb07a50, top: 0x6a2622, under: 0x3a2a24, trim: 0xc8a050, belt: 0x2a2018, hair: 0x15100c, hairStyle: 'braid', beard: 'long', beardCol: 0x15100c, headwear: 'cap', clothCol: 0x2a2420, legWrap: 0x3a2a24, build: 1.1, browAng: 0.5 },
  canM: { skin: 0xc08a5a, top: 0x8a8462, under: 0xd0c4a4, trim: 0x5a4a32, belt: 0x4a3420, hair: 0x2a1c14, beard: 'short', beardCol: 0x2a1c14, headwear: 'band', bandCol: 0x9a3a2a },
  canW: { skin: 0xc8946a, fem: true, long: true, top: 0x9a5a3a, under: 0x9a5a3a, trim: 0x3a3a5a, headwear: 'veil', clothCol: 0xd8c8a8, clothStripe: 0x9a5a3a, hair: 0x2a1a12 },
  canS: { skin: 0xb88456, top: 0x6a6a4a, under: 0xc8bc98, belt: 0x4a3420, hair: 0x1a1410, beard: 'short', beardCol: 0x1a1410, legWrap: 0x6a5a40, build: 0.7 },
  mamre: { skin: 0xb88456, top: 0x6a5a3a, under: 0xc8b890, trim: 0xa86a2a, mantle: 0x4a3a2a, mantleTrim: 0xa86a2a, hair: 0x1a1410, beard: 'long', beardCol: 0x1a1410, headwear: 'turban', clothCol: 0x8a6a4a, long: true, build: 1.1 },
  capt: { skin: 0xb88a5e, top: 0x7a6a4a, under: 0xc8b890, belt: 0x5a3a24, hair: 0x2a1c14, beard: 'short', beardCol: 0x2a1c14, headwear: 'band', bandCol: 0x3a3a3a, legWrap: 0x7a6a4a, build: 1.15, browAng: 0.4 },
  hagar: { skin: 0xb07a4e, fem: true, long: true, top: 0xece4d0, under: 0xece4d0, trim: 0x2f8a77, collar: 0x2f8a77, hair: 0x15100c, hairStyle: 'braid', eye: 0x2a1a10 },
  ish: { skin: 0xb88456, top: 0xd8ccb0, under: 0xd8ccb0, belt: 0x6a4428, hair: 0x15100c, hairStyle: 'curly', beard: false, build: 0.55, jaw: -0.2 },
  captive: { skin: 0xc08a5a, top: 0x8a7a62, under: 0x8a7a62, hair: 0x3a2a20, beard: 'short', beardCol: 0x3a2a20 },
  serv: [{ skin: 0xc49064, top: 0xc8b890, belt: 0x6a4428, hair: 0x2a1c14, beard: 'short', beardCol: 0x2a1c14, headwear: 'band', bandCol: 0x8a5a2a },
    { skin: 0xb88456, top: 0x9a8a6a, belt: 0x4a3420, hair: 0x1a1410, hairStyle: 'curly', beard: 'short', beardCol: 0x1a1410 },
    { skin: 0xd09a6c, fem: true, long: true, top: 0x8a6a8a, under: 0x8a6a8a, headwear: 'veil', clothCol: 0xd8ccb4, clothStripe: 0x6a4a6a, hair: 0x2a1a12 },
    { skin: 0xc8946a, top: 0xb8a070, belt: 0x5a3a24, hair: 0x3a2a20, beard: 'long', beardCol: 0x8a8278, headwear: 'cloth', clothCol: 0xd8ccb0, clothStripe: 0x6a5a40, age: 'old' },
    { skin: 0xc08a5a, fem: true, long: true, top: 0xa86a3a, under: 0xa86a3a, headwear: 'veil', clothCol: 0xe0d4bc, clothStripe: 0xa86a3a, hair: 0x1a1410 }] };

// ------------------------------------------------------------------ the stage (the middle of the story's own map; the ground is the hills below)
const XMIN = -94, XMAX = 94, ZMIN = -56, ZMAX = 64;
const prof = (PR, d) => { if (d >= PR[0][0]) return 0; for (let i = 0; i < PR.length - 1; i++) { const [r0, h0] = PR[i], [r1, h1] = PR[i + 1]; if (d <= r0 && d >= r1) return h0 + (h1 - h0) * ((r0 - d) / ((r0 - r1) || 1)); } return PR[PR.length - 1][1]; };
const HILL = [72, 42], HPROF = [[20, 0], [16, 1.6], [12, 3.4], [8, 5], [4, 5.9], [0, 6]];
const KNOLL = [34, 40], KPROF = [[9, 0], [6, 0.7], [3, 1.2], [0, 1.35]];
const LOOK = [-42, -38], LPROF = [[9, 0], [6, 0.8], [3, 1.7], [0, 2.1]]; /* v18.83 the rise south-east of the oak: Lot looks over the Jordan plain from here (13:10), Abram looks north, south, east and west (13:14) */
const hillH = (lx, lz) => Math.max(prof(HPROF, Math.hypot(lx - HILL[0], lz - HILL[1])), prof(KPROF, Math.hypot(lx - KNOLL[0], lz - KNOLL[1])), prof(LPROF, Math.hypot(lx - LOOK[0], lz - LOOK[1])));
/* 세겜 */
const SPAWN0 = [-88, -4], OAK = [-62, -20], ALT1 = [-56, -14];
/* 마므레 */
const SPAWN1 = [-34, 4], MOAK = [-16, -8], VIS = [-13, -3], TENT = [0, 8], STENT = [12, 7], HEARTH = [6, 17], WELLM = [24, 2], FOLD = [-26, 30], HERD = [-8, 40], WOOD = [-8, 14], TAMA = [-4, -6];
/* 단의 밤 진영 */
const EDGE = [46, -20], LOT = [90, -30], DFIRES = [[70, -26], [80, -32], [62, -32]];
const GUARDS = [{ a: [56, -12], b: [56, -30] }, { a: [66, -6], b: [86, -6] }, { a: [64, -35], b: [77, -35] }, { a: [93, -18], b: [93, -42] }];
/* 모리아 */
const FOOT = [48, 44], TOP = [72, 42], THICK = [[66, 37], [78, 48], [77, 36]]; /* the ram is in the last one he looks into */
const OUTS = [[-91, 8], [-40, 2], [44, -30], [44, 52]];
const FIRES = [HEARTH].concat(DFIRES);
/* v18.83 new places */
const CAMP0 = [-84, 5], DONK0 = [CAMP0[0] - 3.6, CAMP0[1] - 2.2], BIGST = [-64, -25], FLATST = [-49, -22], EARTH0 = [-62, -5]; /* the roadside camp · the three things for the altar */
const RUN1 = [TENT[0] - 6, TENT[1] - 4], RACK = [-3, 24.5], MEN = ['daM0', 'daM1', 'daM2', 'daM3', 'daM4', 'daM5']; /* the one who escaped · the spears · six of the 318 */
const TENTD = [TENT[0], TENT[1] - 3.6], PIECE = [38, 34.5]; /* the tent door (15:1) · the pieces laid opposite (15:10), below the knoll */
const W4 = [[VIS[0] + 2, VIS[1] + 1], [0, 2], [14, 14], [24, 27], [KNOLL[0] - 2, KNOLL[1] - 3]]; /* walking with the three toward Sodom (18:16) */
const QUERN = [HEARTH[0] + 1.6, HEARTH[1] + 1.4], DATES = [18, 16], MATS = [MOAK[0] + 4, MOAK[1] - 2]; /* the weaning feast (21:8) */
const DONK6 = [TENT[0] + 6.5, TENT[1] - 2], CAMP1 = [-34, 54], CAMP2 = [8, 58], LOOKV = [36, 54]; /* the three days' road (22:3–4) */
const AVOID83 = [CAMP0, DONK0, BIGST, FLATST, EARTH0, LOOK, RACK, PIECE, DATES, MATS, DONK6, CAMP1, CAMP2, LOOKV];

let LAND = null; const on = () => !!(LAND && LAND.on()), ch = () => st().ch | 0, ph = () => st().ph | 0;
const npc = id => Game.npc(id), fin = id => { const n = npc(id); if (n) n.talking = false; };
const W0 = () => LAND.stage(), wx = l => W0().x + l[0], wz = l => W0().z + l[1];
const loc = id => { const n = npc(id); return n ? [n.x - W0().x, n.z - W0().z] : null; };
const setCh = (c, p) => { st().ch = c; st().ph = p || 0; G.UI.quest(); };
const night = h => { S().time = h; };
const tpL = (l, f) => { Game.teleport(wx(l), wz(l), f === undefined ? 0 : f); const p = P(); p.y = p.airTop = W0().y + hillH(l[0], l[1]); };
function place(id, l, face) { const n = npc(id); if (!n) return; n.x = n.d.x = wx(l); n.z = n.d.z = wz(l); n.walk = null; if (face !== undefined) n.face = n.homeFace = face; }
function follow(id, dt, gap) { const n = npc(id), p = P(); if (!n || !n.vis) return; const d = Math.hypot(n.x - p.x, n.z - p.z); n._fT = (n._fT || 0) - dt; if (d > (gap || 2.2) && n._fT <= 0) { n._fT = 0.35; const k = (gap || 2.2) * 0.8 / d; Game.npcWalk(id, p.x + (n.x - p.x) * k, p.z + (n.z - p.z) * k, null, d > 9 ? 6.2 : d > 6 ? 4.6 : 2.6); } } /* v18.83 (far behind: they hurry to catch up) */
const fade = (mid, after) => G.UI.fade(() => { try { mid && mid(); } catch (e) { console.error('abraham', e); } }, () => { try { after && after(); } catch (e) { console.error('abraham', e); } });

/* who stands where, for the chapter he is in (on entering, after a load, after a chapter turns) */
const FOLLOW0 = ['daSarai', 'daLot', 'daEli', 'daCv1', 'daCvD', 'daCvC'], TRAIN6 = ['daIsaac', 'daServ1', 'daServ2', 'daDonk'];
const nearMe = (i, back) => { const p = P(), o = W0(), f = p.face || 0, b = back + i * 1.3; return [p.x - o.x - Math.sin(f) * b + (i % 2 ? 1 : -1) * 0.9, p.z - o.z - Math.cos(f) * b]; };
function arrange() { const c = ch(), p0 = ph(), s0 = st();
  if (c === 0) {
    if (p0 <= 2) { /* v18.83 the roadside camp the night before Shechem (12:5–6): round the fire at night, by the packs in the morning */
      if (p0 <= 1) { place('daSarai', [CAMP0[0] - 1.8, CAMP0[1] + 1.2], 2.2); place('daLot', [CAMP0[0] + 1.9, CAMP0[1] + 1.0], -2.2); place('daEli', [CAMP0[0] - 0.6, CAMP0[1] + 2.4], Math.PI); place('daCv1', [CAMP0[0] + 3.4, CAMP0[1] - 1.8], -1.4); place('daCvD', DONK0, 1.2); place('daCvC', [CAMP0[0] - 5.6, CAMP0[1] + 1.6], 1.6); }
      else FOLLOW0.forEach((id, i) => place(id, nearMe(i, 2.4), Math.PI / 2));
      for (const id of ['daSarai', 'daLot', 'daEli', 'daCv1']) { const n = npc(id); if (n) n.act = p0 === 0 && s0.fire0 ? 'sitg' : null; } }
    else { place('daSarai', [OAK[0] - 4, OAK[1] + 4], 0.6); place('daEli', [OAK[0] - 6, OAK[1] + 1], 1.2); place('daCv1', [OAK[0] - 8, OAK[1] + 6], 1); place('daCvD', [OAK[0] - 10, OAK[1] + 8], 1); place('daCvC', [OAK[0] - 12, OAK[1] + 5], 1);
      if (!s0.lotDone) place('daLot', p0 === 4 ? nearMe(0, 2.2) : [OAK[0] + 4, OAK[1] + 5], -0.6); for (const id of FOLLOW0) { const n = npc(id); if (n) n.act = null; } } }
  else { place('daSarai', [STENT[0], STENT[1] + 3], 3.0); place('daEli', [TENT[0] + 7.5, TENT[1] + 0.5], -2.4); } /* (Eliezer beside the tent, not in front of its door) */
  if (c === 1) { place('daLot', LOT, -2); const n = npc('daLot'); if (n) n.act = p0 <= 2 ? 'kneelRest' : null;
    GUARDS.forEach((g, i) => { place('daG' + i, g.a, 0); const m = npc('daG' + i); if (m) m.act = s0.down && s0.down[i] ? 'fallen' : null; });
    place('daCap1', [LOT[0] + 1, LOT[1] + 4], -2); place('daCap2', [LOT[0], LOT[1] - 5], -2);
    if (p0 === 0) place('daRun', RUN1, 0.8);
    if (p0 === 1 && s0.march) MEN.forEach((id, i) => place(id, nearMe(i, 2.4), Math.PI / 2));
    else if (p0 >= 2) MEN.forEach((id, i) => place(id, [EDGE[0] - 4 - (i % 3) * 1.4, EDGE[1] - 2 + Math.floor(i / 3) * 2.2], Math.PI / 2)); /* (the 318 wait at the camp's edge for the signal) */
    if (p0 === 4) { place('daLot', [EDGE[0] - 3, EDGE[1] + 4], 1.2); place('daMelch', [EDGE[0] - 6, EDGE[1] + 1], 1.4); place('daSodom', [EDGE[0] - 5, EDGE[1] - 3], 1.6); } }
  if (c === 3) { place('daV0', VIS, 1.2); place('daV1', [VIS[0] - 1.4, VIS[1] + 0.8], 1.2); place('daV2', [VIS[0] - 0.6, VIS[1] - 1.3], 1.2); }
  if (c === 4) { const k = s0.w4 | 0, q = k > 0 ? W4[Math.min(k, W4.length) - 1] : VIS; ['daV0', 'daV1', 'daV2'].forEach((id, i) => place(id, [q[0] + (i - 1) * 1.2, q[1] - (i % 2)], 1.2)); }
  if (c >= 6) { const jr = s0.jr | 0, night = c === 6 && p0 === 1 && [1, 2, 4, 5].includes(jr), camp = jr <= 2 ? CAMP1 : CAMP2;
    if (c === 6 && p0 === 0) { place('daIsaac', [TENT[0] + 4, TENT[1] - 4], 2.4); place('daServ1', [DONK6[0] + 1.6, DONK6[1] - 1.8], -1.6); place('daServ2', [DONK6[0] + 2.4, DONK6[1] + 0.6], -1.8); place('daDonk', DONK6, -1.2); }
    else if (night) { place('daIsaac', [camp[0] - 1.6, camp[1] + 1.2], 2.2); place('daServ1', [camp[0] + 1.8, camp[1] + 1], -2.2); place('daServ2', [camp[0] + 0.4, camp[1] + 2.2], Math.PI); place('daDonk', [camp[0] - 4, camp[1] - 2], 1.2); }
    else if (c === 6 && p0 === 1) TRAIN6.forEach((id, i) => place(id, nearMe(i, 2.2), Math.PI / 2));
    else { const up = p0 >= 2 && c === 6; place('daIsaac', up ? [FOOT[0] + 1.5, FOOT[1] + 1] : [TENT[0] + 4, TENT[1] - 4], up ? Math.PI / 2 : 2.4); place('daServ1', [FOOT[0] - 3, FOOT[1] - 3], 1.2); place('daServ2', [FOOT[0] - 4, FOOT[1] + 2.5], 1.6); place('daDonk', [FOOT[0] - 5.5, FOOT[1] - 0.5], 1.4); }
    for (const id of ['daIsaac', 'daServ1']) { const n = npc(id); if (n) n.act = night ? 'sitg' : null; } { const n = npc('daServ2'); if (n) n.act = night || (c === 6 && p0 >= 2) ? 'sitg' : null; }
    if (s0.ramAt !== undefined) place('daRam', [THICK[s0.ramAt][0] + 0.6, THICK[s0.ramAt][1] + 0.4], 1); }
}
/* people of the Bible: no everyday words · a gesture instead (v18.83, like js/quiet.js in Joseph's story) */
const HERO = () => st().renamed ? '아브라함' : '아브람';
const nod = id => { const n = npc(id), nm = (n && n.name) || '', ga = G.Quiet && G.Quiet.ga ? G.Quiet.ga(nm) : nm + '이(가)', h = HERO();
  const pool = [`${ga} ${h}을 보고 말없이 고개를 끄덕여요.`, `${ga} 하던 일을 잠시 멈추고 ${h}을 바라봐요.`, `${ga} 말없이 미소 지어요.`];
  say([T(pool[Math.floor(Math.random() * pool.length)])], () => fin(id)); return true; };
const jong = s => { const c = (s || '').charCodeAt((s || '').length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; };
const eun = s => s + (jong(s) ? '은' : '는');
/* a real wait (v18.83): he sits; the time runs only while he stays */
let waitNote = 0;
const sitP = on => { P().cpose = on ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const setLoad = (k) => { LOADK = k; P().carry = k ? 'head' : (P().carry === 'head' ? null : P().carry); };
let LOADK = null;
function campFire(after) { G.UI.minigame('push', { title: '불씨 살리기', hint: '마른 가지 아래 불씨에 꾹 눌러 바람을 불어요. 숨이 차면 잠깐 쉬었다가 다시 불어요.', btn: '후 불기', rate: 12 }, ok => { if (!ok) return; sfx('fire'); after(); }); }
const morning = (h, mid, then) => fade(() => { night(h); mid && mid(); arrange(); }, then);

// ------------------------------------------------------------------ ① 부르심 (창 12:4–13:18) · 길 위의 밤 → 세겜 → 롯과 갈라섬
function fire0() { G.UI.minigame('rhythm', { title: '부싯돌 치기', hint: '동그라미가 금에 닿을 때 부싯돌을 쳐서 마른 가지에 불티를 떨어뜨려요.', need: 6, beats: 10, btn: '탁 치기' }, ok => { if (!ok) { toast('불티가 붙지 않았어요 · 다시 쳐 봐요'); return; } sfx('fire'); st().fire0 = 1; arrange(); G.UI.quest(); pop('불이 붙었어요', '모두 불가에 둘러앉아요 · 불가에서 자요', 'star'); }); }
function sleep0() { morning(6.2, () => { const s0 = st(); s0.ph = 1; s0.fire0 = 0; tpL([DONK0[0] + 1.8, DONK0[1] - 1.2], -1.0); }, () => say([T('불가에서 하룻밤을 보냈습니다. 동이 텄어요.')], () => { G.UI.quest(); pop('짐을 꾸려요', '걷은 장막과 짐을 나귀에 실어요', 'star'); })); }
function load0() { G.UI.minigame('balance', { title: '나귀에 짐 싣기', hint: '걷은 장막과 짐을 나귀 양쪽에 고르게 실어요. 표시가 가운데 초록 칸에 머물게 ◀ ▶ 로 맞춰요.', dur: 9 }, ok => {
    if (!ok) { toast('짐이 한쪽으로 쏠렸어요 · 다시 실어요'); return; } sfx('craft'); st().ph = 2; arrange(); G.UI.quest(); pop('떠나요', '짐 행렬을 이끌고 동쪽 큰 상수리나무로 · 모두 뒤따라와요', 'star'); }); }
function oak() { narr([card('창세기 12:6–7', '세겜 땅 모레 상수리나무', '아브람이 그 땅을 통과하여 세겜 땅 모레 상수리나무에 이르니 그때에 가나안 사람이 그 땅에 거하였더라. 여호와께서 아브람에게 나타나 가라사대 「내가 이 땅을 네 자손에게 주리라」 하신지라.', '창세기 12:6–7')],
  () => { st().ph = 3; st().st3 = {}; arrange(); G.UI.quest(); pop('제단에 쓸 돌 세 가지', '큰 밑돌 · 평평한 돌 · 틈을 메울 흙과 잔돌', 'star'); }); }
const left3 = () => { const s3 = st().st3 || {}; if (s3.big && s3.flat === 2 && s3.earth) { pop('세 가지를 다 모았어요', '상수리나무 곁 빈터에서 제단을 쌓아요', 'star'); return; }
  toast('남은 것: ' + [!s3.big && '큰 밑돌', s3.flat !== 2 && '평평한 돌', !s3.earth && '흙과 잔돌'].filter(Boolean).join(' · ')); };
function bigStone() { G.UI.minigame('push', { title: '큰 밑돌 굴리기', hint: '제단 밑에 놓을 둥근 큰 돌이에요. 꾹 눌러 굴리다가, 힘이 빠지면 잠깐 쉬었다가 다시 밀어요.', btn: '꾹 눌러 굴리기', rate: 11 }, ok => {
    if (!ok) { toast('돌이 꿈쩍도 안 해요 · 다시 밀어요'); return; } sfx('thud', { pitch: 0.6 }); st().st3.big = 1; G.UI.quest(); left3(); }); }
function flatUp() { st().st3.flat = 1; P().emote = { k: 'pick', t: 0, dur: 0.9 }; sfx('pickup'); setLoad('slab'); G.UI.quest(); toast('평평한 돌을 머리에 였어요 · 상수리나무 곁 빈터로 가져가요'); }
function flatDown() { st().st3.flat = 2; setLoad(null); sfx('thud', { vol: 0.5 }); G.UI.quest(); left3(); }
function earth0() { G.UI.minigame('count', { title: '흙과 잔돌 모으기', hint: '돌 틈을 메울 흙과 잔돌이에요. 두 손으로 한 줌씩 떠서 겉옷 자락에 담아요.', need: 5, btn: '한 줌 담기', onPress: () => sfx('rustle', { vol: 0.5 }) }, () => { st().st3.earth = 1; G.UI.quest(); left3(); }); }
function altar1() { P().emote = { k: 'gather', t: 0, dur: 1.6 }; sfx('step', { surf: 'stone', vol: 0.7 });
  setTimeout(() => { st().altar1 = 1; P().emote = { k: 'prostrate', t: 0, dur: 4 }; sfx('insight');
    narr([card('창세기 12:7–8', '여호와의 이름을 부르다', '그가 자기에게 나타나신 여호와를 위하여 그곳에 단을 쌓고… 거기서 여호와를 위하여 단을 쌓고 여호와의 이름을 부르더니', '창세기 12:7–8'), card('먼 훗날', '이 제단은', '이 돌 제단이 바로, 요셉이 세겜 들판에서 본 그 옛 제단이에요.')],
      () => { P().emote = null; Game.insight && Game.insight(1, '아브라함 편 · 부르심'); parting(); }); }, 1700); }
/* 13장: 목자들의 다툼 → 롯과 함께 언덕에 올라 요단 들을 바라봄 → 동서남북 → 마므레로 */
function parting() { narr([card('창세기 13:2–7', '여러 해가 흘러', '아브람에게 육축과 은과 금이 풍부하였더라. 아브람과 동행하는 롯도 양과 소와 장막이 있으므로, 그 땅이 그들의 동거함을 용납지 못하였으니… 아브람의 가축의 목자와 롯의 가축의 목자가 서로 다투고', '창세기 13:2–7')],
  () => { st().ph = 4; arrange(); G.UI.quest(); pop('롯과 함께', '남동쪽 언덕에 함께 올라요 · 롯이 뒤따라와요', 'star'); }); }
const lookY = () => W0().y + hillH(LOOK[0], LOOK[1]);
function jordan() { say([A('우리는 한 골육이라. 나나 너나 내 목자나 네 목자나 서로 다투게 말자. 네 앞에 온 땅이 있지 아니하냐? 나를 떠나라. 네가 좌하면 나는 우하고, 네가 우하면 나는 좌하리라.', '창세기 13:8–9', 'tender')], () => {
    fin('daLot'); const x = wx(LOOK), z = wz(LOOK), y = lookY();
    G.Cine.play([{ cam: [x - 2.2, y + 2.6, z + 1.6], look: [x + 40, y + 0.5, z - 4], dur: 8, t: '롯이 눈을 들어 요단 들을 바라본즉 소알까지 온 땅에 물이 넉넉하여 여호와의 동산 같고 애굽 땅과 같았더라.', ref: '창세기 13:10' },
      { cam: [x + 3, y + 2, z + 3.4], look: [x, y + 1.2, z], dur: 7, t: '롯이 요단 온 들을 택하고 동으로 옮기니 그들이 서로 떠난지라.', ref: '창세기 13:11' }], () => {
      st().lotGo = 1; Game.npcWalk('daLot', wx([LOOK[0] + 34, LOOK[1] + 8]), wz([LOOK[0] + 34, LOOK[1] + 8]), () => { st().lotDone = 1; }, 1.7); G.UI.quest(); pop('롯이 떠나요', '언덕 위에서 동서남북을 바라봐요', 'star'); }, { cut: true }); }); }
function fourWinds() { st().lotDone = 1; const x = wx(LOOK), z = wz(LOOK), y = lookY() + 1.7, sh = (dx, dz, t, ref) => ({ cam: [x - dx * 0.8, y + 0.4, z - dz * 0.8], look: [x + dx * 30, y - 1.2, z + dz * 30], dur: 4.6, t, ref });
  P().emote = { k: 'raiseHands', t: 0, dur: 20 };
  G.Cine.play([sh(1, 0, '롯이 아브람을 떠난 후에 여호와께서 아브람에게 이르시되', '창세기 13:14'), sh(-1, 0, '「너는 눈을 들어 너 있는 곳에서', '창세기 13:14'), sh(0, 1, '동서남북을 바라보라.', '창세기 13:14'), sh(0, -1, '보이는 땅을 내가 너와 네 자손에게 주리니 영원히 이르리라」', '창세기 13:15')], () => { P().emote = null;
    narr([card('창세기 13:17–18', '종과 횡으로 행하여 보라', '「너는 일어나 그 땅을 종과 횡으로 행하여 보라. 내가 그것을 네게 주리라」 이에 아브람이 장막을 옮겨 헤브론에 있는 마므레 상수리 수풀에 이르러 거하며 거기서 여호와를 위하여 단을 쌓았더라.', '창세기 13:17–18')],
      () => fade(() => { setCh(1, 0); night(10); arrange(); tpL(SPAWN1, Math.PI / 2); }, () => pop('1장을 마쳤어요', '마므레 상수리 수풀의 장막촌 · 누군가 급히 달려왔어요', 'star'))); }, { cut: true }); }

// ------------------------------------------------------------------ ② 롯을 구하러 (창 14:1–24) · 마므레 → 밤길 → 단의 진영
function news() { say([Ln('도망해 온 사람', '아브람 어른! 동방의 네 왕이 싯딤 골짜기에서 소돔과 고모라 왕들을 쳤어요. 소돔에 살던 어른의 조카 롯도 재물과 함께 끌려갔어요!', 'fear'),
    T('도망한 자가 와서 히브리 사람 아브람에게 고하니, 때에 아브람이 아모리 족속 마므레의 상수리 수풀 근처에 거하였더라. 마므레는 에스골의 형제요 또 아넬의 형제라. 이들은 아브람과 동맹한 자더라.', '창세기 14:13'), T('아브람이 그 조카의 사로잡혔음을 듣고', '창세기 14:14')],
  () => { fin('daRun'); st().ph = 1; st().rally = {}; G.UI.quest(); pop('불러 모으기', '동맹 마므레(수풀 서쪽)와 종들의 우두머리(장막 사이)에게', 'star'); }); }
function rally(who) { const r = st().rally || (st().rally = {});
  if (who === 'mamre') { r.mamre = 1; say([T('아모리 사람 마므레와 그 형제 에스골과 아넬이 아브람과 함께 일어났습니다.', '창세기 14:13, 24')], () => { fin('daMamre'); G.UI.quest(); goMarch(); }); return; }
  r.capt = 1; say([Ln('종들의 우두머리', '집에서 나고 자란 장정들을 다 모으겠습니다! 저기 창 더미에서 창과 활을 나눠 주십시오.', 'shout')], () => { fin('daCapt'); G.UI.quest(); pop('창과 활', '우두머리 곁 창 더미에서 장정들에게 나눠 줘요', 'star'); }); }
function arm() { G.UI.minigame('count', { title: '창과 활 나눠 주기', hint: '장정들이 한 사람씩 와서 받아 가요. 누를 때마다 한 다발씩 건네요.', need: 6, btn: '한 다발 건네기', onPress: () => sfx('pickup', { vol: 0.5 }) },
  () => { st().rally.arm = 1; G.UI.quest(); say([T('집에서 길리고 연습한 자 삼백십팔 인', '창세기 14:14')], () => goMarch()); }); }
function goMarch() { const s0 = st(), r = s0.rally || {}; if (!(r.mamre && r.arm)) { if (r.mamre && !r.capt) toast('이제 종들의 우두머리에게 가요'); return; }
  s0.march = 1; fade(() => { night(21); arrange(); }, () => { G.UI.quest(); pop('밤길', '장정들을 이끌고 남동쪽, 동방 왕들의 진영까지 가요', 'star'); }); }
function marchArrive() { const s0 = st(); s0.march = 0; narr([card('창세기 14:14–15', '단까지 쫓아가서', '집에서 길리고 연습한 자 삼백십팔 인을 거느리고 단까지 쫓아가서, 그 가신을 나누어 밤을 타서', '창세기 14:14–15')],
  () => fade(() => { night(23); s0.ph = 2; s0.down = {}; s0.lot = 0; s0.busy = 0; arrange(); tpL(EDGE, Math.PI / 2); if (G.Weather && G.Weather.set) G.Weather.set('clear', 8); },
    () => { G.UI.quest(); say([T('파수꾼 넷이 진영을 돌고 있어요. 앞쪽 눈길에 들면 붙들려요. 「앉기」로 낮게 걸으면 덜 들켜요. 남쪽 바위들 그늘로 돌아가면 롯이 묶인 동쪽 끝에 닿아요.')], null); })); }
function caught(i) { const s0 = st(); s0.busy = 1; const n = npc('daG' + i); if (n) { n.walk = null; n.face = Math.atan2(P().x - n.x, P().z - n.z); G.Life.bubble('daG' + i, '거기 누구냐!', 2); } P().vx = P().vz = 0; sfx('thud');
  setTimeout(() => G.UI.minigame('wrestle', { title: '파수꾼과 겨루기', hint: '초록 칸에 들 때 눌러요. 소리 지르기 전에 쓰러뜨려야 해요.', need: 5, dur: 22 }, ok => { s0.busy = 0;
    if (ok) { s0.down[i] = 1; if (n) { n.act = 'fallen'; n.walk = null; } sfx('hit'); pop('파수꾼을 쓰러뜨렸어요', '롯은 진 동쪽 끝 말뚝에 묶여 있어요', 'star'); }
    else fade(() => { tpL(EDGE, Math.PI / 2); if (s0.lot) { s0.lot = 0; place('daLot', LOT, -2); const l = npc('daLot'); if (l) l.act = 'kneelRest'; s0.ph = 2; } }, () => toast('진영 밖으로 밀려났어요 · 낮게 걸어서 눈길을 피해 다시 가요')); }), 500); }
function freeLot() { P().emote = { k: 'gather', t: 0, dur: 1.2 }; sfx('rip'); say([T('아브람이 롯을 묶은 줄을 끊었습니다. 롯이 일어나 아브람의 뒤를 따릅니다.')], () => { fin('daLot'); const l = npc('daLot'); if (l) l.act = null; st().lot = 1; st().ph = 3; G.UI.quest(); toast('롯을 데리고 진영 서쪽 끝으로 빠져나가요'); }); } /* v18.83 (no made-up words of Lot's or Abram's) */
function ch1Out() { const s0 = st(); s0.lot = 0; s0.ph = 4; fade(() => { night(8); arrange(); tpL([EDGE[0] - 1.5, EDGE[1] + 1], -1.6); }, melch); }
function melch() { narr([card('창세기 14:15–16', '밤의 승리', '그 가신을 나누어 밤을 타서 그들을 쳐서 파하고 다메섹 좌편 호바까지 쫓아가서, 모든 빼앗겼던 재물과 자기 조카 롯과 그 재물과 또 부녀와 인민을 다 찾아왔더라.', '창세기 14:15–16')],
    () => say([T('살렘 왕 멜기세덱이 떡과 포도주를 가지고 나왔으니 그는 지극히 높으신 하나님의 제사장이었더라.', '창세기 14:18'), Ln('살렘 왕 멜기세덱', '천지의 주재시요 지극히 높으신 하나님이여, 아브람에게 복을 주옵소서. 너희 대적을 네 손에 붙이신 지극히 높으신 하나님을 찬송할지로다.', 'awe', '창세기 14:19–20'),
      T('아브람이 그 얻은 것에서 십분 일을 멜기세덱에게 주었더라.', '창세기 14:20'), Ln('소돔 왕', '사람은 내게 보내고 물품은 네가 취하라.', '', '창세기 14:21'),
      A('천지의 주재시요 지극히 높으신 하나님 여호와께 내가 손을 들어 맹세하노니, 네게 속한 것은 무론 한 실이나 신들메라도 내가 취하지 아니하리라. 네 말이 내가 아브람으로 치부케 하였다 할까 하노라.', '창세기 14:22–23')], /* v18.83 (was a choice) */
      () => { fin('daMelch'); Game.insight && Game.insight(1, '아브라함 편 · 롯'); fade(() => { setCh(2, 0); night(21.5); arrange(); tpL([TENT[0] + 1.5, TENT[1] - 6.2], 0); }, () => pop('2장을 마쳤어요', '마므레의 밤 · 아브람의 장막으로 들어가요', 'star')); })); }

// ------------------------------------------------------------------ ③ 별 (창 15–17장) · 장막 → 둔덕의 별 → 쪼갠 고기 사이로
function vision() { say([T('이 후에 여호와의 말씀이 이상 중에 아브람에게 임하여 가라사대 「아브람아 두려워 말라 나는 너의 방패요 너의 지극히 큰 상급이니라」', '창세기 15:1'),
    A('주 여호와여, 무엇을 내게 주시려나이까? 나는 무자하오니 나의 상속자는 이 다메섹 엘리에셀이니이다.', '창세기 15:2'), T('「그 사람은 너의 후사가 아니라. 네 몸에서 날 자가 네 후사가 되리라」 하시고 그를 이끌고 밖으로 나가', '창세기 15:4–5')],
  () => { st().ph = 1; G.UI.quest(); pop('밖으로', '장막촌 동쪽 둔덕에서 하늘을 우러러봐요', 'star'); }); }
function stars() { P().emote = { k: 'raiseHands', t: 0, dur: 90 }; skyOpen(() => { P().emote = null;
    narr([card('창세기 15:5', '네 자손이 이와 같으리라', '「하늘을 우러러 뭇별을 셀 수 있나 보라」 또 그에게 이르시되 「네 자손이 이와 같으리라」', '창세기 15:5'), card('창세기 15:6', '믿으니', '아브람이 여호와를 믿으니 여호와께서 이를 그의 의로 여기시고', '창세기 15:6')],
      () => morning(9, () => { const s0 = st(); s0.ph = 2; s0.pc = 0; s0.pcGot = []; tpL([HERD[0] + 3, HERD[1] - 3.4], -1); },
        () => say([T('여호와께서 그에게 이르시되 「나를 위하여 삼 년 된 암소와 삼 년 된 암염소와 삼 년 된 수양과 산비둘기와 집비둘기 새끼를 취할지니라」', '창세기 15:9')], () => { G.UI.quest(); pop('다섯 가지', '소 떼 풀밭에서 말씀하신 다섯 가지를 골라요', 'star'); }))); }); }
/* v18.83 15:9–12 · the five, laid opposite, the birds of prey driven off, the wait till sundown */
const OFFER = { heifer: '삼 년 된 암소', goat: '삼 년 된 암염소', ram: '삼 년 된 수양', dove: '산비둘기', pigeon: '집비둘기 새끼', calf: '젖 먹는 송아지', camel: '낙타', donkey: '나귀', raven: '까마귀' };
const RIGHT5 = ['heifer', 'goat', 'ram', 'dove', 'pigeon'], OFFER_ORDER = ['camel', 'heifer', 'donkey', 'goat', 'calf', 'ram', 'raven', 'dove', 'pigeon'];
function offerPick() { const s0 = st(), got = s0.pcGot || (s0.pcGot = []);
  if (RIGHT5.every(k => got.includes(k))) { s0.pc = 1; G.UI.quest(); pop('다섯 가지를 다 골랐어요', '동쪽 둔덕 아래 빈터로 가져가요', 'star'); return; }
  const left = OFFER_ORDER.filter(k => !got.includes(k));
  say([{ n: '', t: `말씀하신 것을 골라요 (${got.length}/5)`, choices: left.map(k => ({ t: OFFER[k], then: () => setTimeout(() => {
      if (RIGHT5.includes(k)) { got.push(k); sfx('pickup'); offerPick(); }
      else say([T(`${eun(OFFER[k])} 말씀하신 것이 아니에요. 「삼 년 된 암소와 삼 년 된 암염소와 삼 년 된 수양과 산비둘기와 집비둘기 새끼」(창 15:9)`)], () => offerPick()); }, 30) })).concat([{ t: '조금 있다가 고르기' }]) }], null); }
function laid() { P().emote = { k: 'gather', t: 0, dur: 1.8 }; sfx('thud', { vol: 0.4 }); say([T('아브람이 그 모든 것을 취하여 그 중간을 쪼개고 그 쪼갠 것을 마주 대하여 놓고 그 새는 쪼개지 아니하였으며', '창세기 15:10')],
  () => { st().pc = 2; G.UI.quest(); pop('솔개가 내려와요', '솔개를 쫓아요', 'moon'); sfx('whoosh', { vol: 0.4 }); }); }
function kites() { G.UI.minigame('wrestle', { title: '솔개 쫓기', hint: '솔개가 내려올 때(초록 칸) 눌러 지팡이를 휘둘러 쫓아요.', need: 5, dur: 30, unit: '쫓음', btn: '지팡이 휘두르기' }, ok => {
    say([T('솔개가 그 사체 위에 내릴 때에는 아브람이 쫓았더라.', '창세기 15:11')], () => { st().pc = 3; G.UI.quest(); pop('해 질 때까지', '곁에 앉아 기다려요', 'moon'); }); }); }
function waitStart() { const s0 = st(); s0.wt = 10; waitNote = 0; sitP(true); G.UI.quest(); toast('곁에 앉아 해가 지기를 기다려요'); }
function waitDone() { sitP(false); night(18.8);
  narr([card('창세기 15:12', '깊은 잠', '해 질 때에 아브람이 깊이 잠든 중에 캄캄함이 임하므로 심히 두려워하더니', '창세기 15:12'),
    card('창세기 15:17–18', '쪼갠 고기 사이로', '해가 져서 어둘 때에 연기 나는 풀무가 보이며 타는 횃불이 쪼갠 고기 사이로 지나더라. 그날에 여호와께서 아브람으로 더불어 언약을 세워 가라사대 「내가 이 땅을 네 자손에게 주노니」', '창세기 15:17–18'),
    card('창세기 16장', '하갈과 이스마엘', '사래가 그 여종 애굽 사람 하갈을 아브람에게 주었고, 하갈이 아들을 낳았어요. 여호와의 사자가 광야의 샘물 곁에서 하갈을 만나 「그 이름을 이스마엘이라 하라 이는 여호와께서 너의 고통을 들으셨음이니라」 하셨고, 하갈은 「감찰하시는 하나님」이라 불렀어요.', '창세기 16:3, 7, 11, 13'),
    card('창세기 17:1–5, 15', '아브라함', '아브람의 구십구 세 때에 여호와께서 그에게 나타나서 이르시되 「…이제 후로는 네 이름을 아브람이라 하지 아니하고 아브라함이라 하리니 이는 내가 너로 열국의 아비가 되게 함이니라」 또 「네 아내 사래는 이름을 사래라 하지 말고 사라라 하라」', '창세기 17:5, 15')],
    () => { Game.insight && Game.insight(1, '아브라함 편 · 별'); st().renamed = 1; D.rename && D.rename('아브라함'); { const sr = npc('daSarai'); if (sr) sr.name = '사라'; } fade(() => { setCh(3, 0); night(12.5); arrange(); tpL([TENT[0] - 3, TENT[1] - 5], -0.8); }, () => pop('3장을 마쳤어요', '여러 해 뒤, 한낮 · 장막 문 앞, 상수리나무 그늘에 나그네 셋이 서 있어요', 'star')); }); }
/* the sky (v18.83): look round it slowly, join the bright ones, then try to count while more and more appear (15:5) — not 24 taps of one button */
function skyOpen(done) { const el = document.createElement('div'); el.id = 'starUI'; document.body.appendChild(el); G.UI.setBusy('abSky', true);
  const Wc = Math.min(340, innerWidth - 32), Hc = Math.round(Wc * 1.05), SKY = Wc * 3;
  el.innerHTML = `<div class="t">하늘을 우러러</div><canvas width="${Wc * 2}" height="${Hc * 2}" style="width:${Wc}px;height:${Hc}px;touch-action:none"></canvas><div class="s"></div><div class="row"><button id="abSkyX">그만 보기</button></div>`;
  const cv = el.querySelector('canvas'), c2 = cv.getContext('2d'), sEl = el.querySelector('.s'); let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const bg = Array.from({ length: 420 }, () => [rnd() * SKY, rnd() * Hc, 0.3 + rnd() * 1.1, rnd() * 6, 0]);
  const BR = [[0.18, 0.3], [0.27, 0.22], [0.36, 0.27], [0.43, 0.4], [0.52, 0.36], [0.6, 0.48], [0.55, 0.62]].map(([u, v]) => [SKY * 0.42 + u * Wc, v * Hc]); /* seven bright ones, a little way round the sky */
  let mode = 0, pan = 0, panned = 0, drag = null, hit = [], cnt = 0, extra = 0, T0 = performance.now(), raf = 0, ended = false;
  const say0 = t => { sEl.textContent = t; }; say0('하늘을 천천히 둘러봐요 (손가락으로 끌어서 둘러보기)');
  const look = () => { if (mode === 0 && panned > SKY * 0.42) { mode = 1; say0('밝게 빛나는 별 일곱을 찾아 차례로 이어요'); } }; /* (on a drag too, not only per frame) */
  const end = () => { if (ended) return; ended = true; cancelAnimationFrame(raf); el.remove(); G.UI.setBusy('abSky', false); done && done(); };
  el.querySelector('#abSkyX').onclick = end;
  cv.onpointerdown = e => { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; drag = { x, pan, moved: 0 };
    if (mode === 1) { let bi = -1, bd = 28; BR.forEach((q, i) => { const d = Math.hypot(q[0] - pan - x, q[1] - y); if (d < bd && !hit.includes(i)) { bd = d; bi = i; } }); if (bi >= 0) { hit.push(bi); sfx('blip', { pitch: 1 + hit.length * 0.06 }); drag = null; if (hit.length >= BR.length) { mode = 2; T0 = performance.now(); say0('이제 별을 세어 보세요 · 보이는 별을 눌러 하나씩'); } } }
    else if (mode === 2) { cnt++; sfx('blip', { pitch: 1.3 + Math.random() * 0.6, vol: 0.35 }); extra += 6 + cnt; drag = null; } };
  cv.onpointermove = e => { if (!drag) return; const r = cv.getBoundingClientRect(), x = e.clientX - r.left; const np = Math.max(0, Math.min(SKY - Wc, drag.pan - (x - drag.x))); panned += Math.abs(np - pan); pan = np; look(); };
  cv.onpointerup = cv.onpointercancel = () => { drag = null; };
  function draw() { const t = (performance.now() - T0) / 1000; c2.setTransform(2, 0, 0, 2, 0, 0); const gr = c2.createLinearGradient(0, 0, 0, Hc); gr.addColorStop(0, '#0b1230'); gr.addColorStop(1, '#1d2a52'); c2.fillStyle = gr; c2.fillRect(0, 0, Wc, Hc);
    if (mode === 0) { if (!drag) { pan = Math.min(SKY - Wc, pan + 0.35); panned += 0.35; } look(); }
    const shown = mode === 2 ? Math.min(bg.length + 2600, bg.length + extra + Math.floor(t * 60)) : bg.length; /* (more keep coming out, faster than he can count) */
    while (bg.length < shown) bg.push([rnd() * SKY, rnd() * Hc, 0.2 + rnd() * 0.7, rnd() * 6, 1]);
    for (const [x, y, s, p, nw] of bg) { const sx = x - pan; if (sx < -2 || sx > Wc + 2) continue; c2.globalAlpha = (nw ? 0.25 : 0.35) + 0.35 * Math.sin(t * 1.3 + p); c2.fillStyle = '#cfd8ff'; c2.beginPath(); c2.arc(sx, y, s, 0, 7); c2.fill(); }
    c2.globalAlpha = 1;
    if (hit.length > 1) { c2.strokeStyle = 'rgba(229,181,82,.8)'; c2.lineWidth = 1.4; c2.beginPath(); hit.forEach((k, i) => { const q = BR[k]; i ? c2.lineTo(q[0] - pan, q[1]) : c2.moveTo(q[0] - pan, q[1]); }); c2.stroke(); }
    BR.forEach((q, i) => { const on = hit.includes(i), tw = 0.85 + 0.15 * Math.sin(t * 2.4 + i); c2.fillStyle = on ? '#ffd27a' : '#f4f6ff'; c2.shadowColor = on ? '#ffb840' : '#9fb4ff'; c2.shadowBlur = on ? 14 : 10; c2.beginPath(); c2.arc(q[0] - pan, q[1], (on ? 3.8 : 3.2) * tw, 0, 7); c2.fill(); c2.shadowBlur = 0; });
    if (mode === 2) { c2.fillStyle = '#dfe8ff'; c2.font = '700 14px system-ui'; c2.fillText(`센 별 ${cnt} · 보이는 별 ${shown}…`, 12, 22);
      if (t > 9 && cnt >= 3 && !el.dataset.fin) { el.dataset.fin = 1; say0('셀수록 더 많아요. 셀 수가 없어요.'); el.querySelector('#abSkyX').textContent = '고개를 들고 서 있기'; } }
    raf = requestAnimationFrame(draw); }
  el._draw = () => { cancelAnimationFrame(raf); draw(); }; /* (a test can draw a frame on demand) */
  draw(); }

// ------------------------------------------------------------------ ④ 세 나그네 (창 18:1–15)
function greet() { P().emote = { k: 'prostrate', t: 0, dur: 3.2 }; setTimeout(() => say([T('아브라함이 눈을 들어 본즉 사람 셋이 맞은편에 섰는지라. 그가 그들을 보자 곧 장막 문에서 달려 나가 영접하며 몸을 땅에 굽혀', '창세기 18:2'),
    A('내 주여, 내가 주께 은혜를 입었사오면 원컨대 종을 떠나 지나가지 마옵시고, 물을 조금 가져오게 하사 당신들의 발을 씻으시고 나무 아래서 쉬소서. 내가 떡을 조금 가져오리니 당신들의 마음을 쾌활케 하신 후에 지나가소서.', '창세기 18:3–5'), Ln('나그네', '네 말대로 그리하라.', '', '창세기 18:5')],
  () => { P().emote = null; st().ph = 1; st().got = {}; G.UI.quest(); pop('급히 채비해요', '우물의 물 · 사라에게 떡 · 소 떼의 송아지 · 엉긴 젖과 우유', 'star'); }), 600); }
const got = k => { st().got[k] = 1; G.UI.quest(); if (['w', 'b', 'c', 'm'].every(x => st().got[x] === 1)) pop('채비를 다 했어요', '상수리나무 아래 나그네들께 상을 차려 드려요', 'star'); };
function bread() { say([A('속히 고운 가루 세 스아를 가져다가 반죽하여 떡을 만들라.', '창세기 18:6'), T('사라가 고운 가루를 반죽하기 시작했습니다.')], () => { fin('daSarai'); got('b'); }); }
function calf() { say([T('아브라함이 또 짐승 떼에 달려가서 기름지고 좋은 송아지를 취하여 하인에게 주니 그가 급히 요리한지라.', '창세기 18:7'), Ln('양을 치는 종', '좋은 송아지네요! 바로 요리하겠습니다.', 'happy')], () => { fin('daS1'); got('c'); }); }
function milk() { say([T('엉긴 젖(뻐터)과 우유를 부탁했습니다.'), Ln('맷돌 가는 여종', '아침에 짠 젖이에요. 우물물에 담가 두어서 시원해요.')], () => { fin('daS2'); got('m'); }); }
function serve() { say([T('아브라함이 뻐터와 우유와 하인이 요리한 송아지를 가져다가 그들의 앞에 진설하고 나무 아래 모셔 서매 그들이 먹으니라.', '창세기 18:8'), Ln('나그네', '네 아내 사라가 어디 있느냐?', '', '창세기 18:9'), A('장막에 있나이다.', '창세기 18:9'), Ln('나그네', '기한이 이를 때에 내가 정녕 네게로 돌아오리니 네 아내 사라에게 아들이 있으리라.', '', '창세기 18:10'),
    T('사라가 그 뒤 장막 문에서 들었더라. 사라가 속으로 웃고 이르되 「내가 노쇠하였고 내 주인도 늙었으니 내게 어찌 낙이 있으리요」', '창세기 18:10–12'), Ln('나그네', '사라가 왜 웃느냐? 여호와께 능치 못한 일이 있겠느냐? 기한이 이를 때에 내가 네게로 돌아오리니 사라에게 아들이 있으리라.', '', '창세기 18:13–14'),
    T('사라가 두려워서 승인치 아니하여 가로되', '창세기 18:15'), Ln('사라', '내가 웃지 아니하였나이다.', 'fear', '창세기 18:15'), Ln('나그네', '아니라. 네가 웃었느니라.', '', '창세기 18:15')],
  () => { Game.insight && Game.insight(1, '아브라함 편 · 세 나그네'); st().w4 = 0; setCh(4, 0); pop('4장을 마쳤어요', '나그네들이 소돔 쪽으로 일어서요 · 곁에서 함께 걸으며 배웅해요', 'star'); }); }

// ------------------------------------------------------------------ ⑤ 배웅과 간구 (창 18:16–33) · 함께 걷기 → 둔덕
const PLEA = [[50, '주께서 의인을 악인과 함께 멸하시려나이까? 그 성중에 의인 오십이 있을지라도 주께서 그곳을 멸하시고 그 오십 의인을 위하여 용서치 아니하시리이까?', '내가 만일 소돔 성중에서 의인 오십을 찾으면 그들을 위하여 온 지경을 용서하리라.'],
  [45, '티끌과 같은 나라도 감히 주께 고하나이다. 오십 의인 중에 오 인이 부족할 것이면 그 오 인 부족함을 인하여 온 성을 멸하시리이까?', '내가 거기서 사십오 인을 찾으면 멸하지 아니하리라.'], [40, '거기서 사십 인을 찾으시면 어찌하시려나이까?', '사십 인을 인하여 멸하지 아니하리라.'],
  [30, '내 주여 노하지 마옵시고 말씀하게 하옵소서. 거기서 삼십 인을 찾으시면 어찌하시려나이까?', '내가 거기서 삼십 인을 찾으면 멸하지 아니하리라.'], [20, '내가 감히 내 주께 고하나이다. 거기서 이십 인을 찾으시면 어찌하시려나이까?', '내가 이십 인을 인하여 멸하지 아니하리라.'],
  [10, '주는 노하지 마옵소서. 내가 이번만 더 말씀하리이다. 거기서 십 인을 찾으시면 어찌하시려나이까?', '내가 십 인을 인하여도 멸하지 아니하리라.']];
let w4Note = 0;
function walk4() { const s0 = st(), k = s0.w4 | 0, p = P(), v = npc('daV0'); if (!v || s0.pleaOn) return;
  if (k >= W4.length) { s0.pleaOn = 1; plea(); return; }
  if (Math.hypot(v.x - p.x, v.z - p.z) > 6) { if (!w4Note) { w4Note = 1; toast('나그네들 곁에서 함께 걸어요'); } return; } w4Note = 0;
  if (!v.walk) { const q = W4[k]; ['daV0', 'daV1', 'daV2'].forEach((id, i) => Game.npcWalk(id, wx(q) + (i - 1) * 1.2, wz(q) - (i % 2) * 1.0, id === 'daV0' ? () => { st().w4 = k + 1; } : null, 1.5)); } }
function plea() { say([T('그 사람들이 거기서 일어나서 소돔으로 향하고 아브라함은 그들을 전송하러 함께 나가니라.', '창세기 18:16'), T('여호와께서 또 가라사대 「소돔과 고모라에 대한 부르짖음이 크고 그 죄악이 심히 중하니」… 그 사람들이 거기서 떠나 소돔으로 향하여 가고 아브라함은 여호와 앞에 그대로 섰더니', '창세기 18:20–22')], () => plea1(0)); }
function plea1(i) { const [, q, a] = PLEA[i]; /* v18.83 the six pleas follow one another as in the text (no choice, no made-up thought) */
  say([A(q, '창세기 18:' + [24, 28, 29, 30, 31, 32][i], i >= 3 ? 'fear' : ''), Ln('', a, '', '창세기 18:' + [26, 28, 29, 30, 31, 32][i])], () => { if (i < PLEA.length - 1) { plea1(i + 1); return; }
    narr([card('창세기 18:33', '돌아서는 길', '여호와께서 아브라함과 말씀을 마치시고 즉시 가시니 아브라함도 자기 곳으로 돌아갔더라.', '창세기 18:33'), card('창세기 19:27–29', '롯을 기억하사', '아브라함이 그 아침에 일찍이 일어나 여호와 앞에 서 있던 곳에 이르러 소돔과 고모라와 그 온 들을 향하여 바라보매 연기가 옹기 가마의 연기같이 치밀음을 보았더라. 하나님이 들의 성들을 멸하실 때… 하나님이 아브라함을 생각하사 롯을 그 엎으시는 중에서 내어 보내셨더라.', '창세기 19:27–29')],
      () => { Game.insight && Game.insight(1, '아브라함 편 · 간구'); fade(() => { setCh(5, 0); ['daV0', 'daV1', 'daV2'].forEach(id => place(id, [200, 220])); night(9); arrange(); tpL([STENT[0] - 3, STENT[1] + 6], 1.2); }, () => pop('5장을 마쳤어요', '이듬해 · 장막의 사라에게 가요', 'star')); }); }); }

// ------------------------------------------------------------------ ⑥ 웃음, 이삭 (창 21:1–34) · 젖 떼는 날의 큰 잔치 → 브엘세바의 에셀나무
function isaacBorn() { say([T('여호와께서 그 말씀대로 사라를 권고하셨고 여호와께서 그 말씀대로 사라에게 행하셨으므로, 사라가 잉태하고 하나님의 말씀하신 기한에 미쳐 늙은 아브라함에게 아들을 낳으니', '창세기 21:1–2'), Ln('사라', '하나님이 나로 웃게 하시니 듣는 자가 다 나와 함께 웃으리로다.', 'happy', '창세기 21:6'), Ln('사라', '사라가 자식들을 젖 먹이겠다고 누가 아브라함에게 말하였으리요마는, 아브라함 노경에 내가 아들을 낳았도다.', 'happy', '창세기 21:7'),
    T('아브라함이 그 아들의 이름을 이삭이라 하였습니다. 「웃음」이라는 뜻이에요. 백 세에 얻은 아들이었습니다.', '창세기 21:3, 5')],
  () => { fin('daSarai'); narr([card('창세기 21:8', '젖 떼는 날', '아이가 자라매 젖을 떼고 이삭의 젖을 떼는 날에 아브라함이 대연을 배설하였더라.', '창세기 21:8')],
      () => { st().ph = 1; st().fe = {}; G.UI.quest(); pop('큰 잔치 채비', '맷돌로 밀가루 갈기 · 대추야자 따기 · 상수리나무 아래 자리 깔기', 'star'); }); }); }
const feastLeft = () => { const f = st().fe || {}; if (f.flour && f.dates && f.mats) { feast(); return; } toast('남은 것: ' + [!f.flour && '밀가루', !f.dates && '대추야자', !f.mats && '자리'].filter(Boolean).join(' · ')); };
function flour() { G.UI.minigame('rhythm', { title: '맷돌 돌리기', hint: '동그라미가 금에 닿을 때 맷돌 손잡이를 돌려 밀을 고운 가루로 갈아요.', need: 8, beats: 12, btn: '돌리기' }, ok => { if (!ok) { toast('가루가 거칠어요 · 다시 갈아요'); return; } sfx('craft'); st().fe.flour = 1; G.UI.quest(); feastLeft(); }); }
function dates() { G.UI.minigame('catch', { title: '대추야자 받기', hint: '종이 나무를 흔들어요. 떨어지는 대추야자 아래로 바구니를 옮겨 받아요. 돌은 피해요.', need: 10, dur: 30, item: 'dates' }, ok => { if (!ok) { toast('바구니가 덜 찼어요 · 다시 받아요'); return; } sfx('pickup'); st().fe.dates = 1; G.UI.quest(); feastLeft(); }); }
function mats() { P().emote = { k: 'gather', t: 0, dur: 1.6 }; sfx('rustle'); setTimeout(() => { P().emote = null; st().fe.mats = 1; G.UI.quest(); feastLeft(); }, 1500); }
function feast() { narr([card('창세기 21:8', '큰 잔치', '이삭의 젖을 떼는 날에 아브라함이 대연을 배설하였더라.', '창세기 21:8'),
    card('창세기 21:14–20', '광야의 하갈과 이스마엘', '그 뒤 하갈과 이스마엘은 장막을 떠나 브엘세바 광야로 갔어요. 물이 떨어져 소리 질러 울던 그때, 하나님이 그 아이의 소리를 들으시고 하갈의 눈을 밝히사 샘을 보게 하셨습니다. 「하나님이 그 아이와 함께 계시매」', '창세기 21:17–20'),
    card('창세기 21:31–33', '브엘세바', '아브라함이 그 땅을 브엘세바라 이름하였으니 「맹세의 우물」이라는 뜻이에요. 그리고 거기 나무를 심었습니다.', '창세기 21:31, 33')],
  () => { st().ph = 2; G.UI.quest(); pop('에셀나무', '장막 앞 빈터에 에셀나무(위성류)를 심어요', 'star'); }); }
function plant() { P().emote = { k: 'plant', t: 0, dur: 2.4 }; sfx('rustle'); setTimeout(() => { P().emote = null; st().planted = 1;
    narr([card('창세기 21:33', '영생하시는 여호와', '아브라함은 브엘세바에 에셀나무를 심고 거기서 영생하시는 하나님 여호와의 이름을 불렀으며, 그가 블레셋 족속의 땅에서 여러 날을 지내었더라.', '창세기 21:33'), card('그리고 여러 해가 흘러', '', '이삭이 자랐습니다.')],
      () => { Game.insight && Game.insight(1, '아브라함 편 · 이삭'); fade(() => { setCh(6, 0); const s0 = st(); s0.saddle = 0; s0.wood = 0; s0.jr = 0; night(5.2); arrange(); tpL([TENT[0] + 2, TENT[1] - 6], 0); },
        () => narr([card('창세기 22:1', '그 일 후에', '하나님이 아브라함을 시험하시려고 그를 부르시되 「아브라함아」 하시니 그가 가로되 「내가 여기 있나이다」', '창세기 22:1'), card('창세기 22:2', '모리아 땅으로', '「네 아들 네 사랑하는 독자 이삭을 데리고 모리아 땅으로 가서 내가 네게 지시하는 한 산 거기서 그를 번제로 드리라」', '창세기 22:2'),
          card('창세기 22:3', '아침에 일찍이', '아브라함이 아침에 일찍이 일어나 나귀에 안장을 지우고 두 사환과 그 아들 이삭을 데리고 번제에 쓸 나무를 쪼개어 가지고 떠나 하나님의 자기에게 지시하시는 곳으로 가더니', '창세기 22:3')],
          () => { G.UI.quest(); pop('떠날 채비', '나귀에 안장 지우기 · 장막 곁 나뭇더미에서 번제 나무 쪼개기', 'star'); })); }); }, 2400); }

// ------------------------------------------------------------------ ⑦ 모리아 (창 22:3–19) · 사흘 길과 두 밤 → 산
function saddle() { P().emote = { k: 'gather', t: 0, dur: 1.4 }; sfx('craft'); setTimeout(() => { P().emote = null; st().saddle = 1; G.UI.quest(); ready7(); }, 1300); }
function wood() { G.UI.minigame('rhythm', { title: '번제에 쓸 나무 쪼개기', hint: '도끼가 줄에 닿을 때 눌러 장작을 쪼개요.', need: 7, beats: 12 }, ok => { if (!ok) { toast('장작이 덜 쪼개졌어요 · 다시 해요'); return; } sfx('thud'); st().wood = 1; G.UI.quest(); ready7(); }); }
const ready7 = () => { const s0 = st(); if (!(s0.saddle && s0.wood)) { toast(s0.saddle ? '이제 장막 곁 나뭇더미에서 나무를 쪼개요' : '이제 나귀에 안장을 지워요'); return; }
  s0.ph = 1; s0.jr = 0; arrange(); G.UI.quest(); pop('떠나요', '이삭과 두 종과 나귀가 뒤따라와요 · 북서쪽 길로', 'star'); };
const JR_AT = jr => jr <= 2 ? CAMP1 : jr <= 5 ? CAMP2 : jr === 6 ? LOOKV : FOOT;
function campArrive() { const s0 = st(), first = (s0.jr | 0) === 0;
  morning(19.2, () => { s0.jr = first ? 1 : 4; if (!first) s0.fire2 = 1; const c0 = first ? CAMP1 : CAMP2; tpL([c0[0] + 1.8, c0[1] - 1.6], -0.8); },
    () => { G.UI.quest(); pop(first ? '첫째 밤' : '둘째 밤', first ? '마른 가지를 모아 불을 피워요' : '종들이 불을 피웠어요 · 나귀에게 물을 먹여요', 'moon'); }); }
function fire1() { campFire(() => { st().fire1 = 1; st().jr = 2; arrange(); G.UI.quest(); pop('불이 붙었어요', '모두 불가에 둘러앉아요 · 불가에서 자요', 'moon'); }); }
function donkeyWater() { P().emote = { k: 'gather', t: 0, dur: 1.6 }; sfx('pour'); setTimeout(() => { P().emote = null; st().jr = 5; G.UI.quest(); pop('나귀가 물을 마셨어요', '불가에서 자요', 'moon'); }, 1500); }
function sleep6() { const s0 = st(), first = (s0.jr | 0) === 2;
  morning(6.4, () => { s0.jr = first ? 3 : 6; s0.fire1 = 0; s0.fire2 = 0; }, () => narr([card(first ? '둘째 날' : '셋째 날', '', first ? '이튿날도 길을 갔습니다.' : '셋째 날 아침이 밝았습니다.')], () => { arrange(); G.UI.quest(); pop(first ? '길을 이어 가요' : '길을 이어 가요', first ? '북쪽 길로 · 모두 뒤따라와요' : '동쪽으로 · 눈을 들어 볼 만한 곳까지', 'star'); })); }
function lookUp() { const x = wx(LOOKV), z = wz(LOOKV), y = W0().y + 1.7, hx = wx(HILL), hz = wz(HILL), hy = W0().y + 6;
  P().emote = { k: 'raiseHands', t: 0, dur: 9 };
  G.Cine.play([{ cam: [x - 1.6, y + 0.6, z + 1.4], look: [hx, hy + 2, hz], dur: 7, t: '제삼일에 아브라함이 눈을 들어 그곳을 멀리 바라본지라.', ref: '창세기 22:4' }], () => { P().emote = null; st().jr = 7; G.UI.quest(); pop('그곳으로', '산 아래까지 가요', 'star'); }, { cut: true }); }
function arriveFoot() { const s0 = st(); s0.jr = 8; say([A('너희는 나귀와 함께 여기서 기다리라. 내가 아이와 함께 저기 가서 경배하고 너희에게로 돌아오리라.', '창세기 22:5'), Ln('젊은 종', '네, 주인님. 나귀와 함께 여기 있겠습니다.'),
    T('아브라함이 번제 나무를 취하여 그 아들 이삭에게 지우고, 자기는 불과 칼을 손에 들고 두 사람이 동행하더니', '창세기 22:6')], () => { s0.ph = 2; arrange(); G.UI.quest(); pop('산으로', '이삭과 함께 바위 사이 길을 따라 산꼭대기로', 'star'); }); }
function isaacAsk() { st().asked = 1; P().vx = P().vz = 0; say([Ln('이삭', '내 아버지여.', '', '창세기 22:7'), A('내 아들아, 내가 여기 있노라.', '창세기 22:7', 'tender'), Ln('이삭', '불과 나무는 있거니와 번제할 어린 양은 어디 있나이까?', '', '창세기 22:7'), A('아들아, 번제할 어린 양은 하나님이 자기를 위하여 친히 준비하시리라.', '창세기 22:8'), T('두 사람이 함께 나아가서', '창세기 22:8')], () => G.UI.quest()); }
function altar2() { G.UI.minigame('count', { title: '단을 쌓다', hint: '돌을 하나씩 올려요.', need: 7, btn: '돌 올리기', onPress: () => sfx('step', { surf: 'stone', vol: 0.6 }) }, ok => { if (!ok) return; st().altar2 = 1; st().ph = 3; const i = npc('daIsaac'); if (i) { i.walk = null; place('daIsaac', [TOP[0] + 0.9, TOP[1] + 0.4], -1.6); i.act = 'kneelRest'; }
    narr([card('창세기 22:9', '지시하신 곳에', '하나님이 그에게 지시하신 곳에 이른지라. 이에 아브라함이 그곳에 단을 쌓고 나무를 벌여 놓고 그 아들 이삭을 결박하여 단 나무 위에 놓고', '창세기 22:9'), card('창세기 22:10', '', '손을 내밀어 칼을 잡고…', '창세기 22:10')],
      () => { sfx('insight', { pitch: 1.3 }); Game.CAM.shake = 0.5; say([Ln('여호와의 사자', '아브라함아, 아브라함아!', 'awe', '창세기 22:11'), A('내가 여기 있나이다.', '창세기 22:11', 'cry'), Ln('여호와의 사자', '그 아이에게 네 손을 대지 말라. 아무 일도 그에게 하지 말라. 네가 네 아들 네 독자라도 내게 아끼지 아니하였으니 내가 이제야 네가 하나님을 경외하는 줄을 아노라.', 'awe', '창세기 22:12'),
        T('아브라함이 눈을 들어 살펴본즉… 산꼭대기 둘레의 수풀을 살펴보세요. 어디선가 양 우는 소리가 들립니다.')], () => { const i2 = npc('daIsaac'); if (i2) i2.act = null; st().ph = 4; st().seen = {}; sfx('sheep', { vol: 0.6 }); G.UI.quest(); }); }); }); }
function thicket(k) { const s0 = st(); if (s0.seen[k]) return; s0.seen[k] = 1; const n = Object.keys(s0.seen).length; sfx('rustle'); if (n < THICK.length) { toast(n === 1 ? '바람에 가지만 흔들려요 · 다른 수풀을 봐요' : '여기도 아니에요 · 양 소리가 더 가까워졌어요'); sfx('sheep', { vol: 0.5 + n * 0.2 }); return; }
  s0.ramAt = k; place('daRam', [THICK[k][0] + 0.6, THICK[k][1] + 0.4], 1); sfx('sheep'); say([T('아브라함이 눈을 들어 살펴본즉 한 수양이 뒤에 있는데 뿔이 수풀에 걸렸는지라.', '창세기 22:13')], /* v18.83 (no made-up words of Isaac's or Abraham's) */
    () => narr([card('창세기 22:13', '아들을 대신하여', '아브라함이 가서 그 수양을 가져다가 아들을 대신하여 번제로 드렸더라.', '창세기 22:13'), card('창세기 22:14', '여호와 이레', '아브라함이 그 땅 이름을 여호와 이레라 하였으므로 오늘까지 사람들이 이르기를 「여호와의 산에서 준비되리라」 하더라.', '창세기 22:14'),
      card('창세기 22:16–18', '하늘의 별과 같이', '「네가 이같이 행하여 네 아들 네 독자를 아끼지 아니하였은즉 내가 네게 큰 복을 주고 네 씨로 크게 성하여 하늘의 별과 같고 바닷가의 모래와 같게 하리니… 네 씨로 말미암아 천하 만민이 복을 얻으리니」', '창세기 22:16–18'),
      card('아브라함 편을 마쳤어요', '약속의 길', '이삭은 야곱을 낳고, 야곱은 요셉을 낳았습니다.\n\n생각해 볼 질문 · 「여호와 이레」(창 22:14), 하나님이 준비하신다는 말씀이에요. 요셉은 구덩이와 옥에서 이 말씀을 어떻게 붙들었을까요?')],
      () => { const first = !s0.done; s0.done = 1; setCh(7, 0); if (first) { Game.insight && Game.insight(3, '창세기 아브라함 편'); S().flags.dlcAbrahamDone = 1; } say([{ n: '', t: '이야기가 끝났습니다. 세겜의 제단 앞으로 돌아갈까요?', choices: [{ t: '돌아가기', then: () => D.leave() }, { t: '산 위에 조금 더 머물기' }] }], null); })); }

// ------------------------------------------------------------------ where the guide points (stage coordinates)
function target() { const c = ch(), p0 = ph(), s0 = st();
  if (c === 0) { if (p0 === 0) return CAMP0; if (p0 === 1) return DONK0; if (p0 === 2) return OAK; if (p0 === 3) { const s3 = s0.st3 || {}; if (s3.flat === 1) return ALT1; if (!s3.big) return BIGST; if (!s3.flat) return FLATST; if (!s3.earth) return EARTH0; return ALT1; } return LOOK; }
  if (c === 1) { if (p0 === 0) return loc('daRun'); if (p0 === 1) { const r = s0.rally || {}; if (s0.march) return EDGE; return !r.mamre ? loc('daMamre') : !r.capt ? loc('daCapt') : !r.arm ? RACK : null; } if (p0 === 2) return LOT; if (p0 === 3) return EDGE; return null; }
  if (c === 2) { if (p0 === 0) return TENTD; if (p0 === 1) return KNOLL; return (s0.pc | 0) === 0 ? HERD : PIECE; }
  if (c === 3) { if (p0 === 0) return loc('daV0'); const g = s0.got || {}; return g.w !== 1 ? WELLM : g.b !== 1 ? loc('daSarai') : !g.c ? HERD : g.c !== 1 ? loc('daS1') : g.m !== 1 ? loc('daS2') : loc('daV0'); }
  if (c === 4) return loc('daV0');
  if (c === 5) { if (p0 === 0) return loc('daSarai'); if (p0 === 1) { const f = s0.fe || {}; return !f.flour ? QUERN : !f.dates ? DATES : !f.mats ? MATS : null; } return TAMA; }
  if (c === 6) { if (p0 === 0) return !s0.saddle ? DONK6 : WOOD; if (p0 === 1) { const jr = s0.jr | 0; return jr === 4 ? loc('daDonk') : JR_AT(jr); } if (p0 === 2 || p0 === 3) return TOP; if (p0 === 4) { const k = THICK.findIndex((q, i) => !(s0.seen || {})[i]); return k >= 0 ? THICK[k] : null; } }
  return null; }

// ------------------------------------------------------------------ the people
const BEASTS = [];
const person = (id, name, look, l, face, o) => Object.assign({ id, name, look, x: l[0], z: l[1], face, talkR: 3, noBond: true }, o || {});
const beast = (id, sp, l, face, o) => { BEASTS.push(id); return Object.assign({ id, name: { sheep: '양', goat: '염소', cow: '소', donkey: '나귀', camel: '낙타' }[sp] || '짐승', animal: sp, x: l[0], z: l[1], face, noTalk: true, noTag: true }, o || {}); };
const vis = f => () => on() && f();
const PEOPLE = [
  /* 세겜 · 하란에서 온 짐 행렬 (1장) */
  person('daSarai', '사래', LK.sarai, [SPAWN0[0] - 2, SPAWN0[1] + 2], Math.PI / 2, { bib: true, show: vis(() => true) }),
  person('daLot', '롯', LK.lot, [SPAWN0[0] - 3, SPAWN0[1] - 2.4], Math.PI / 2, { bib: true, show: vis(() => (ch() === 0 && !st().lotDone) || (ch() === 1 && ph() >= 2)) }),
  person('daEli', '엘리에셀', LK.eli, [SPAWN0[0] - 5, SPAWN0[1] + 1], Math.PI / 2, { bib: true, show: vis(() => true) }),
  person('daCv1', '짐을 진 종', LK.serv[0], [SPAWN0[0] - 6, SPAWN0[1] - 2], Math.PI / 2, { show: vis(() => ch() === 0), chat: ['하란에서부터 오는 길이 참 멀었습니다.', '이 나귀가 장막 기둥을 다 지고 왔어요.'] }),
  beast('daCvD', 'donkey', [SPAWN0[0] - 7.5, SPAWN0[1] + 0.5], Math.PI / 2, { show: vis(() => ch() === 0) }),
  beast('daCvC', 'camel', [SPAWN0[0] - 9.5, SPAWN0[1] - 1], Math.PI / 2, { show: vis(() => ch() === 0) }),
  /* 세겜의 가나안 사람들 (창 12:6) */
  person('daCanF', '가나안 농부', LK.canM, [-74, 12], 0.4, { act: 'gather', show: vis(() => true), chat: ['이 골짜기는 오래전부터 우리 가나안 사람들이 갈아 온 밭이오. 나그네는 어디서 왔소?', '양 떼를 이끌고 오는 걸 보니 큰 집안이구려. 우리 밭은 밟지 마시오.', '저 큰 상수리나무 아래에서는 사람들이 점을 치곤 하오. 「모레」가 「가르치는 이」라는 뜻이라오.'] }),
  person('daCanW', '가나안 여인', LK.canW, [-79, -37], 2.6, { show: vis(() => true), chat: ['물동이를 이고 가는 길이에요. 우물은 저 집들 뒤에 있어요.', '낯선 장막이 늘었네… 아이들이 신기해해요.'] }),
  person('daCanS', '가나안 목자', LK.canS, [-56, 30], 2.8, { prop: 'staff', show: vis(() => true), chat: ['에발 산 쪽 풀이 좋아요. 그리심 산 쪽은 돌이 많고요.', '우리 염소들이 당신네 양을 겁내요. 허허.'] }),
  beast('daCg0', 'goat', [-58, 34], 1, { wander: 3, show: vis(() => true) }), beast('daCg1', 'goat', [-53, 33], 2, { wander: 3, show: vis(() => true) }), beast('daCg2', 'goat', [-55, 37], 0.5, { wander: 3, show: vis(() => true) }),
  /* 마므레의 장막촌 (2장부터) */
  person('daMamre', '아모리 사람 마므레', LK.mamre, [-30, -2], 1.4, { bib: true, show: vis(() => ch() >= 1 && ch() <= 2) }),
  person('daRun', '도망해 온 사람', LK.captive, RUN1, 0.8, { act: 'kneelRest', show: vis(() => ch() === 1 && ph() === 0) }),
  person('daCapt', '종들의 우두머리', LK.capt, [-6, 22], 2.4, { prop: 'spear', show: vis(() => ch() >= 1), chat: ['젊은 종들은 날마다 창과 활을 익힙니다.', '주인님 장막을 지키는 것이 제 일이지요.'] }),
  ...MEN.map((id, i) => person(id, '아브람의 장정', [LK.serv[0], LK.serv[1], LK.capt][i % 3], [200, 230 + i * 2], 0, { prop: 'spear', noTalk: true, show: vis(() => ch() === 1 && ((ph() === 1 && !!st().march) || (ph() >= 2 && ph() <= 3))) })),
  person('daMaid', '여종 하갈', LK.hagar, [STENT[0] + 3, STENT[1] + 3], 2.6, { bib: true, show: vis(() => ch() >= 1 && ch() <= 4) }),
  person('daIsh', '이스마엘', LK.ish, [STENT[0] + 6, STENT[1] + 5], 2.2, { scale: 0.82, bib: true, show: vis(() => ch() === 3 || ch() === 4) }),
  person('daS1', '양을 치는 종', LK.serv[1], [FOLD[0] + 5, FOLD[1] - 1], 1.2, { prop: 'staff', show: vis(() => ch() >= 1), chat: ['새끼 양이 또 태어났어요! 주인님 양 떼는 셀 수가 없어요.', '롯 어른 목자들과 다투던 때가 생각나네요. 이젠 다 지난 일이지요.'] }),
  person('daS2', '맷돌 가는 여종', LK.serv[2], [HEARTH[0] + 0.4, HEARTH[1] + 2.8], Math.PI, { act: 'gather', show: vis(() => ch() >= 1), chat: ['고운 가루 세 스아면 큰 잔치를 차릴 수 있어요.', '화덕 불은 꺼뜨리지 않아요. 나그네가 언제 올지 모르니까요.'] }),
  person('daS3', '늙은 종', LK.serv[3], [WELLM[0] + 2.6, WELLM[1] + 1], -1.4, { show: vis(() => ch() >= 1), chat: ['이 우물은 주인님 종들이 판 것이오. 물이 달고 시원하지.', '나는 하란에서부터 주인님을 섬겼소. 칠십오 세에 떠나셨지. 대단한 분이오.'] }),
  person('daS4', '물 긷는 여종', LK.serv[4], [WELLM[0] - 2.4, WELLM[1] + 2], 1.0, { show: vis(() => ch() >= 1), chat: ['물부대를 채워서 장막마다 날라요.', '물동이는 머리에 이면 덜 무거워요.'] }),
  beast('daSh0', 'sheep', [FOLD[0] - 2, FOLD[1] - 1], 0, { wander: 2.5, show: vis(() => ch() >= 1) }), beast('daSh1', 'sheep', [FOLD[0] + 1, FOLD[1] + 1], 1, { wander: 2.5, show: vis(() => ch() >= 1) }), beast('daSh2', 'sheep', [FOLD[0] - 1, FOLD[1] + 2], 2, { wander: 2.5, show: vis(() => ch() >= 1) }),
  beast('daSh3', 'sheep', [FOLD[0] + 2, FOLD[1] - 2], 3, { wander: 2.5, show: vis(() => ch() >= 1) }), beast('daGt0', 'goat', [FOLD[0] - 3, FOLD[1] + 1], 4, { wander: 2.5, show: vis(() => ch() >= 1) }), beast('daGt1', 'goat', [FOLD[0], FOLD[1] - 2.5], 5, { wander: 2.5, show: vis(() => ch() >= 1) }),
  beast('daCow0', 'cow', [HERD[0] - 2, HERD[1]], 1, { wander: 3, show: vis(() => ch() >= 1) }), beast('daCow1', 'cow', [HERD[0] + 2.5, HERD[1] + 1.5], 2, { wander: 3, show: vis(() => ch() >= 1) }), beast('daCalf', 'cow', [HERD[0], HERD[1] - 2], 0.5, { scale: 0.6, wander: 2, show: vis(() => ch() >= 1 && !(ch() === 3 && st().got && st().got.c)) }),
  beast('daDk0', 'donkey', [26, 30], 2, { wander: 1.5, show: vis(() => ch() >= 1) }), beast('daDk1', 'donkey', [23, 32], 3, { wander: 1.5, show: vis(() => ch() >= 1) }),
  /* 단의 밤 진영 (2장) */
  ...GUARDS.map((g, i) => person('daG' + i, '동방 왕의 파수꾼', LK.guard, g.a, 0, { prop: 'spear', noTalk: true, show: vis(() => ch() === 1 && ph() >= 2 && ph() < 4) })),
  person('daCap1', '사로잡힌 소돔 사람', LK.captive, [LOT[0] + 1, LOT[1] + 4], -2, { act: 'kneelRest', noTalk: true, show: vis(() => ch() === 1 && ph() >= 2 && ph() < 4) }),
  person('daCap2', '사로잡힌 소돔 여인', Object.assign({}, LK.canW, { top: 0x7a6a5a, under: 0x7a6a5a }), [LOT[0], LOT[1] - 5], -2, { act: 'kneelRest', noTalk: true, show: vis(() => ch() === 1 && ph() >= 2 && ph() < 4) }),
  person('daMelch', '살렘 왕 멜기세덱', LK.melch, [200, 200], 1.4, { bib: true, show: vis(() => ch() === 1 && ph() === 4) }),
  person('daSodom', '소돔 왕', LK.sodom, [200, 205], 1.6, { bib: true, show: vis(() => ch() === 1 && ph() === 4) }),
  /* 세 나그네 (3–4장) */
  ...[0, 1, 2].map(i => person('daV' + i, '나그네', i === 1 ? Object.assign({}, LK.visitor, { headwear: 'cloth', clothCol: 0xffffff }) : i === 2 ? Object.assign({}, LK.visitor, { hair: 0x6a5a4a, beardCol: 0x8a7a6a }) : LK.visitor, VIS, 1.2, { noTalk: i > 0, bib: true, show: vis(() => ch() === 3 || ch() === 4) })),
  /* 이삭 · 모리아 (6–7장) */
  person('daIsaac', '이삭', LK.isaac, [TENT[0] + 4, TENT[1] - 4], 2.4, { scale: 0.88, bib: true, show: vis(() => ch() >= 6) }),
  person('daServ1', '젊은 종', LK.serv[0], [FOOT[0] - 3, FOOT[1] - 3], 1.2, { show: vis(() => ch() === 6), chat: ['주인님, 짐은 저희가 살필게요.', '나귀가 오늘따라 순하네요.'] }),
  person('daServ2', '젊은 종', LK.serv[1], [FOOT[0] - 4, FOOT[1] + 2.5], 1.6, { show: vis(() => ch() === 6), chat: ['길이 멀어서 다리가 후들거려요.', '밤에는 불가가 제일이에요.'] }),
  beast('daDonk', 'donkey', [FOOT[0] - 5.5, FOOT[1] - 0.5], 1.4, { show: vis(() => ch() === 6) }),
  beast('daRam', 'sheep', [200, 240], 1, { show: vis(() => ch() >= 6 && st().ramAt !== undefined) })];

// ------------------------------------------------------------------ the land
let M1 = null, M2 = null, MT = null; const MA = G.m4(), MB = G.m4(), MC = G.m4();
const altarMesh = seed => { const g = new G.GB(seed); for (let ly = 0; ly < 3; ly++) { const n = 6 - ly, rad = 0.9 - ly * 0.18; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + ly * 0.5; g.sph(0.3, 6, 4, { at: [Math.cos(a) * rad, 0.2 + ly * 0.3, Math.sin(a) * rad], s: [1.15, 0.72, 1], c: [0x9a9284, 0x8a8276, 0xa8a090][i % 3], flat: true, j: 0.08 }); } } g.box(1.1, 0.12, 1.1, { at: [0, 1.02, 0], c: 0x8a8276, j: 0.05 }); for (let i = 0; i < 4; i++) g.box(0.9, 0.09, 0.12, { at: [0, 1.14 + (i % 2) * 0.08, -0.3 + i * 0.2], ry: i % 2 ? 0.2 : -0.15, c: 0x5a4028 }); return G.R.mesh(g); };
const tamMesh = () => { const g = new G.GB(733); let sd = 11; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; if (G.env && G.env.tamarisk) G.env.tamarisk(g, G.m4(), r); else g.sph(1.2, 7, 5, { at: [0, 2, 0], c: 0x7a9478 }); return G.R.mesh(g); };
const XM = { pool: [], k: 0, mh: G.m4(), ready: false }; let QSEC = -1;
function xmBuild() { const mk = (seed, f) => { const g = new G.GB(seed); f(g); return G.R.mesh(g); };
  XM.boulder = mk(501, g => g.sph(0.62, 9, 7, { at: [0, 0.46, 0], s: [1.15, 0.82, 1], c: 0x8e877a, j: 0.08 }));
  XM.slab = mk(502, g => g.box(1.1, 0.16, 0.8, { at: [0, 0.08, 0], c: 0x9c9484, j: 0.06 }));
  XM.earth = mk(503, g => { g.sph(0.45, 8, 5, { at: [0, 0.04, 0], s: [1.3, 0.42, 1.1], c: 0x7a6448, j: 0.1 }); for (let i = 0; i < 6; i++) g.sph(0.08, 5, 4, { at: [Math.cos(i * 1.1) * 0.42, 0.12, Math.sin(i * 1.1) * 0.36], c: 0x9a9284, j: 0.1 }); });
  XM.packs = mk(504, g => { for (let i = 0; i < 3; i++) g.sph(0.32, 7, 5, { at: [(i - 1) * 0.55, 0.26, (i % 2) * 0.3], s: [1, 0.8, 1.2], c: [0x8a6a44, 0x6a5238, 0x9a7a4e][i], j: 0.1 }); g.box(1.4, 0.12, 0.6, { at: [0, 0.06, 0.9], c: 0x2e2a26, j: 0.05 }); }); /* (the struck tent rolled up beside the packs) */
  XM.fire = mk(505, g => { for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; g.sph(0.16, 6, 4, { at: [Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55], c: 0x7a746a, s: [1.1, 0.7, 1], j: 0.12 }); } for (let i = 0; i < 4; i++) g.box(0.09, 0.09, 0.8, { at: [0, 0.16, 0], ry: i * 0.8, rx: 0.25, c: 0x5a3e26, j: 0.1 }); });
  XM.pieces = mk(506, g => { for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) g.sph(0.3, 7, 5, { at: [sd * 0.95, 0.14, (i - 1) * 0.95], s: [1.35, 0.48, 0.9], c: [0x7a5a3e, 0x8a6a48, 0x6a4a34][i], j: 0.08 }); for (const sd of [-1, 1]) g.sph(0.12, 6, 4, { at: [sd * 0.5, 0.1, 1.75], s: [1, 0.8, 1.5], c: 0xa8a098, j: 0.08 }); });
  XM.kite = mk(507, g => { g.sph(0.14, 6, 4, { at: [0, 0, 0], s: [0.7, 0.55, 1.8], c: 0x3a2e26 }); g.box(1.5, 0.03, 0.34, { at: [0, 0.02, 0.02], c: 0x4a3a2e }); g.box(0.36, 0.02, 0.2, { at: [0, 0, -0.32], c: 0x3a2e26 }); });
  XM.mats = mk(508, g => { [[0, 0, 0x8a3a2a], [1.9, 0.3, 0x2e4a78], [-1.9, 0.2, 0xb08a3a]].forEach(([x, z, c]) => g.box(1.6, 0.04, 1.0, { at: [x, 0.02, z], c, j: 0.04 })); });
  XM.ready = true; }
const dynFires = () => { const s0 = st(), c = ch(), p0 = ph(), jr = s0.jr | 0, F = []; if (c === 0 && p0 === 0 && s0.fire0) F.push(CAMP0); if (c === 6 && p0 === 1 && jr === 2) F.push(CAMP1); if (c === 6 && p0 === 1 && (jr === 4 || jr === 5)) F.push(CAMP2); return F; };
function fires(dt) { if (!G.Fire || !G.Fire.emit) return; const p = P(), o = W0(); let k = 0; for (const f of dynFires().concat(FIRES)) { const x = o.x + f[0], z = o.z + f[1]; if (k >= 3 || Math.hypot(x - p.x, z - p.z) > 30) continue; k++; G.Fire.emit(x, o.y + 0.15, z, 0.8, 0.3, dt); } }
// ------------------------------------------------------------------ 땅 색 (v18.64 길 · 장막촌 · 밭 · 산비탈은 땅에 칠해요 · 판을 깔지 않아요)
const HX = XL.hex, mixC = XL.mix, smc = XL.sm;
const ROADS = [[[-210, -2], [-130, -3], [-94, -4], [-80, -6], [-66, -12], [-50, -10], [-36, 2], [-18, 4], [-4, 14]], [[-4, 14], [6, 9], [24, 4]], [[24, 4], [40, -10], [46, -20]], [[-4, 14], [16, 30], [34, 38]], [[34, 38], [44, 44], [52, 44]], [[46, -20], [60, -52], [110, -110], [200, -190]], [[-70, -42], [-74, -30], [-66, -12]]];
const PATH = [FOOT, [56, 44.8], [63, 43.2], [TOP[0] - 2.5, TOP[1]]];
const roadD = (x, z) => { let d = 1e9; for (const r of ROADS) d = Math.min(d, XL.segD(r, x, z)); return d; };
const FIELDS = [[-80, 18, 14, 9, 1], [-62, 22, 12, 8, 0]]; /* (x, z, w, d, ripe) Shechem's wheat and barley */
const GC = { wheat: HX(0xd4ba66), barley: HX(0x8eaa4c), road: HX(0xc4ae86), road2: HX(0xb29c76), earth: HX(0xa08a62), dust: HX(0xac9a70), soil: HX(0x86704e), lush: HX(0x76a048), west: HX(0x86a452), mid: HX(0xa0a468), east: HX(0xaa9e72), stone: HX(0xa49a82), knoll: HX(0xb4aa70) };
const inR = (x, z, x0, x1, z0, z1, e) => Math.min(smc(x0 - e, x0 + e, x), 1 - smc(x1 - e, x1 + e, x), smc(z0 - e, z0 + e, z), 1 - smc(z1 - e, z1 + e, z));
const near = (x, z, q, r0, r1) => 1 - smc(r0, r1, Math.hypot(x - q[0], z - q[1]));
function ground(x, z, c, gr) { let o = c, g = gr; const lay = (col, k, ga) => { if (!(k > 0)) return; o = mixC(o, col, k); g += (ga - g) * k; };
  /* the three lands: Shechem's green valley (west), Mamre's oak plain (middle), the drier south-east */
  lay(GC.west, (1 - smc(-52, -30, x)) * 0.45, 0.9); lay(GC.mid, smc(-40, -20, x) * (1 - smc(36, 52, x)) * 0.3, 0.8); lay(GC.east, smc(40, 58, x) * (1 - smc(10, 24, z)) * 0.6, 0.45);
  /* Moriah: stony slopes, scrub; the knoll: dry golden grass */
  { const h = hillH(x, z); if (Math.hypot(x - HILL[0], z - HILL[1]) < 22) lay(GC.stone, smc(0.2, 3.5, h) * 0.8, 0.25); if (Math.hypot(x - KNOLL[0], z - KNOLL[1]) < 10) lay(GC.knoll, smc(0.05, 0.9, h) * 0.6, 0.7); }
  /* Shechem: the town's packed earth, the fields under the crops, the vineyard soil, the threshing floor */
  lay(GC.earth, inR(x, z, -93, -58, -53, -33, 2.5) * 0.8, 0.12);
  for (const [fx, fz, w, d, ripe] of FIELDS) { const k = inR(x, z, fx - w / 2, fx + w / 2, fz - d / 2, fz + d / 2, 0.8); if (k > 0) { const f = 0.86 + 0.14 * Math.cos((z - fz) * 3.6), cc = ripe ? GC.wheat : GC.barley; lay([cc[0] * f, cc[1] * f, cc[2] * f], k * 0.92, 1); } }
  lay(GC.soil, inR(x, z, -92, -78, 27.6, 38.8, 0.8) * 0.8, 0.2); /* the vineyard's worked soil */ lay(GC.dust, near(x, z, [-66, -40], 1.7, 2.6), 0);
  lay(GC.lush, near(x, z, OAK, 3, 8) * 0.7, 1); lay(GC.earth, near(x, z, ALT1, 1.6, 3.2) * 0.8, 0.1); lay(GC.knoll, near(x, z, LOOK, 3, 8.5) * 0.45, 0.7); lay(GC.earth, near(x, z, CAMP0, 1.2, 3) * 0.7, 0.2);
  /* Mamre: trampled ground among the tents, round the hearth, the well, the fold; the herd's meadow */
  lay(GC.dust, near(x, z, [4, 14], 8, 17) * 0.4, 0.4); lay(GC.earth, near(x, z, HEARTH, 2, 4.5) * 0.85, 0); lay(GC.earth, near(x, z, WELLM, 2.5, 5.5) * 0.8, 0.1);
  lay(GC.earth, inR(x, z, FOLD[0] - 6, FOLD[0] + 6, FOLD[1] - 5, FOLD[1] + 5, 0.8) * 0.8, 0.15); lay(GC.lush, inR(x, z, HERD[0] - 9, HERD[0] + 9, HERD[1] - 7, HERD[1] + 7, 3) * 0.7, 1);
  lay(GC.lush, near(x, z, MOAK, 3, 9) * 0.5, 1); lay(GC.earth, near(x, z, TAMA, 1.2, 2.4) * 0.8, 0);
  /* the kings' camp: dust and ash */
  lay(GC.dust, inR(x, z, 52, 96, -50, -8, 4) * 0.7, 0.15); for (const f of DFIRES) lay(GC.soil, near(x, z, f, 1.2, 3), 0);
  /* roads and the way up Moriah */
  const rd = roadD(x, z); if (rd < 3) lay(rd < 0.4 ? GC.road2 : GC.road, (1 - smc(0.9, 2.2, rd)) * 0.9, 0);
  const pd = XL.segD(PATH, x, z); if (pd < 2.4) lay(GC.road2, (1 - smc(0.6, 1.8, pd)) * 0.85, 0);
  return [o[0], o[1], o[2], g]; }
/* Gerizim and Ebal on either side of Shechem, the hills of Moriah beyond the east */
const MOUNTS = [[-66, -104, 52, 30], [-72, 112, 52, 32], [150, 60, 60, 24], [130, -80, 55, 14]];
const mounts = (x, z) => { let h = 0; for (const [mx, mz, r, mh] of MOUNTS) { const d = Math.hypot(x - mx, z - mz); if (d < r) h += mh * (0.5 + 0.5 * Math.cos(d / r * Math.PI)); } return h; };
const PLACES = [{ n: '세겜 · 모레 상수리나무', x: OAK[0], z: OAK[1] }, { n: '세겜 성읍', x: -76, z: -44, k: 'town' }, { n: '세겜의 밭', x: -76, z: 24 }, { n: '마므레 상수리나무 숲', x: MOAK[0], z: MOAK[1] }, { n: '아브람의 장막', x: TENT[0], z: TENT[1], k: 'town' },
  { n: '마므레 우물', x: WELLM[0], z: WELLM[1] }, { n: '양 우리', x: FOLD[0], z: FOLD[1] }, { n: '소 떼 풀밭', x: HERD[0], z: HERD[1] }, { n: '동쪽 둔덕', x: KNOLL[0], z: KNOLL[1] },
  { n: '그돌라오멜의 진영', x: 74, z: -28, when: () => (st().ch | 0) >= 1 }, { n: '모리아 산', x: TOP[0], z: TOP[1], when: () => (st().ch | 0) >= 6 }];
LAND = XL.make({ key: 'dlca', story: 'abraham', name: '가나안 (증조할아버지의 이야기)', title: '창세기 아브라함 편 · 약속의 별', hero: '아브람', look: EP.outfits.dlcAbraham, seed: 331, area: [XMIN, XMAX, ZMIN, ZMAX], spawn: [SPAWN0[0], SPAWN0[1], Math.PI / 2],
  places: PLACES, ground, outFloor: (x, z, h) => h + mounts(x, z), sceneryAvoid: (x, z) => roadD(x, z) < 3 || AVOID83.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5), trees: ['oak', 'olive', 'tamarisk', 'oak', 'acacia'], treeN: 460,
  people: PEOPLE,
  chatter: [['양 떼가 또 불었네.', '주인님 장막에 복이 넘쳐.'], ['오늘 밤도 별이 많겠지?', '별이 쏟아질 것 같아.'], ['화덕 불 좀 봐 줘.', '나그네가 오면 금방 떡을 구울 수 있게!'], ['우물가에서 블레셋 사람들 소문 들었어?', '물 때문에 다투는 일은 없었으면 좋겠어.']],
  talk: { /* v18.83 people of the Bible: the Bible's words in the story's steps, otherwise a gesture · the others chat freely */
    daSarai() { const c = ch(), p0 = ph(); if (c === 5 && p0 === 0) { isaacBorn(); return true; } if (c === 3 && p0 === 1 && st().got.b !== 1) { bread(); return true; } return nod('daSarai'); },
    daLot() { if (ch() === 1 && ph() === 2) { freeLot(); return true; } return nod('daLot'); },
    daEli() { return nod('daEli'); },
    daRun() { if (ch() === 1 && ph() === 0) { news(); return true; } return false; },
    daMamre() { if (ch() === 1 && ph() === 1 && !(st().rally || {}).mamre) { rally('mamre'); return true; } return nod('daMamre'); },
    daCapt() { if (ch() === 1 && ph() === 1 && !(st().rally || {}).capt) { rally('capt'); return true; } return false; },
    daMelch() { if (ch() === 1 && ph() === 4) { melch(); return true; } return nod('daMelch'); },
    daSodom() { return nod('daSodom'); }, daMaid() { return nod('daMaid'); }, daIsh() { return nod('daIsh'); },
    daS1() { if (ch() === 3 && ph() === 1 && st().got.c === 0.5) { calf(); return true; } return false; },
    daS2() { if (ch() === 3 && ph() === 1 && (st().got || {}).m !== 1) { milk(); return true; } return false; },
    daV0() { const c = ch(); if (c === 3 && ph() === 0) { greet(); return true; } if (c === 3 && ph() === 1) { if (['w', 'b', 'c', 'm'].every(x => st().got[x] === 1)) { serve(); return true; } say([T('나그네들이 나무 그늘에서 조용히 기다려요.')], () => fin('daV0')); return true; } return nod('daV0'); },
    daIsaac() { return nod('daIsaac'); } },
  tick(dt) { const s0 = st(), c = ch(), p0 = ph(), p = P(), Wd = Game.W(), o = W0();
    /* the beasts stand on the stage, not on the map far below */
    for (const id of BEASTS) { const n = npc(id); if (!n || !n.vis || !Wd) continue; n.seatY = o.y + hillH(n.x - o.x, n.z - o.z) - Wd.heightAt(n.x, n.z); }
    fires(dt);
    { const want = c === 0 && p0 === 3 && s0.st3 && s0.st3.flat === 1 ? 'slab' : null; if (want && p.carry !== 'head') setLoad(want); else if (!want && LOADK) setLoad(null); } /* (the flat stone only on its way to the altar) */
    { const q = c === 2 && s0.wt > 0 ? Math.ceil(s0.wt) : -1; if (q !== QSEC) { QSEC = q; G.UI.quest(); } }
    if (G.UI.busy() || Game.cineOn) return;
    if (c === 0 && p0 === 2) FOLLOW0.forEach((id, i) => follow(id, dt, 2.4 + i * 1.1));
    if (c === 0 && p0 === 4 && !s0.lotGo) follow('daLot', dt, 2.2);
    if (c === 1 && p0 === 1 && s0.march) { MEN.forEach((id, i) => follow(id, dt, 2.2 + i * 0.9)); if (Math.hypot(p.x - wx(EDGE), p.z - wz(EDGE)) < 7) marchArrive(); }
    if (c === 1 && (p0 === 2 || p0 === 3) && !s0.busy) { GUARDS.forEach((g, i) => { const n = npc('daG' + i); if (!n || (s0.down || {})[i]) return; if (!n.walk) { n._leg = (n._leg || 0) ^ 1; const tg = n._leg ? g.b : g.a; Game.npcWalk('daG' + i, wx(tg), wz(tg), null, 1.3); }
        const dx = p.x - n.x, dz = p.z - n.z, d = Math.hypot(dx, dz), low = p.crouch ? 0.62 : 1, front = Math.cos(Math.atan2(dx, dz) - n.face) > 0.5; if (!s0.busy && (d < 1.5 * low || (front && d < 5.2 * low))) caught(i); });
      if (s0.lot) { follow('daLot', dt, 2); if (Math.hypot(p.x - wx(EDGE), p.z - wz(EDGE)) < 4.5) ch1Out(); } }
    if (c === 2 && p0 === 2 && (s0.pc | 0) === 3 && s0.wt > 0) { const d = Math.hypot(p.x - wx(PIECE), p.z - wz(PIECE));
      if (d < 6) { s0.wt -= dt; S().time += dt * 0.35; if (waitNote && d < 3.5 && !p.cpose) { waitNote = 0; sitP(true); } if (s0.wt <= 0) { s0.wt = 0; waitDone(); } }
      else if (!waitNote) { waitNote = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와서 곁에 서면 이어져요'); } }
    if (c === 4) walk4();
    if (c === 6 && p0 === 1) { const jr = s0.jr | 0; if ([0, 3, 6, 7].includes(jr)) TRAIN6.forEach((id, i) => follow(id, dt, 2.2 + i * 1.2));
      if ((jr === 0 && Math.hypot(p.x - wx(CAMP1), p.z - wz(CAMP1)) < 5) || (jr === 3 && Math.hypot(p.x - wx(CAMP2), p.z - wz(CAMP2)) < 5)) campArrive();
      if (jr === 7 && Math.hypot(p.x - wx(FOOT), p.z - wz(FOOT)) < 4.5) arriveFoot(); }
    if (c === 6 && (p0 === 2 || p0 === 4)) follow('daIsaac', dt, 2);
    if (c === 6 && p0 === 2 && !s0.asked && hillH(p.x - o.x, p.z - o.z) > 2) isaacAsk(); },
  ctx(s, lx, lz) { const out = [], c = ch(), p0 = ph(), s0 = st(), near = (q, r) => !!q && Math.hypot(q[0] - lx, q[1] - lz) < (r || 3), at = (q, o) => Object.assign({ x: wx(q), z: wz(q), y: 1.1, noMagnet: true, story: true }, o); /* v18.83 (story: before chatting with whoever stands there) */
    const add = (q, r, label, key, use, d) => { if (near(q, r)) out.push(at(q, { d: d === undefined ? -0.5 : d, label, key, use })); };
    if (c === 0) { if (p0 === 0) { if (!s0.fire0) add(CAMP0, 3, '마른 가지 모아 불 피우기', 'daF0', fire0); else add(CAMP0, 3.4, '불가에서 자기', 'daSl0', sleep0); }
      if (p0 === 1) add(DONK0, 3, '장막을 걷어 나귀에 짐 싣기', 'daLd0', load0);
      if (p0 === 2) add(OAK, 5, '모레 상수리나무 아래 서기', 'daOak', oak, 0);
      if (p0 === 3) { const s3 = s0.st3 || (s0.st3 = {}); if (s3.flat === 1) add(ALT1, 3, '평평한 돌 내려놓기', 'daFlD', flatDown);
        else { if (!s3.big) add(BIGST, 2.8, '큰 밑돌 굴려 오기', 'daBig', bigStone); if (!s3.flat) add(FLATST, 2.4, '평평한 돌 머리에 이기', 'daFlU', flatUp); if (!s3.earth) add(EARTH0, 2.6, '흙과 잔돌 모으기', 'daEa', earth0);
          if (s3.big && s3.flat === 2 && s3.earth) add(ALT1, 3, '제단 쌓기', 'daAlt1', altar1); } }
      if (p0 === 4) { if (!s0.lotGo) add(LOOK, 3.6, '롯과 함께 요단 들을 바라보기', 'daJor', () => { const l = npc('daLot'); if (l && Math.hypot(l.x - wx(LOOK), l.z - wz(LOOK)) > 4) place('daLot', [LOOK[0] + 1.4, LOOK[1] - 0.9], 1.2); jordan(); }, 0); else add(LOOK, 3.6, '동서남북을 바라보기', 'daWinds', fourWinds, 0); } }
    if (c === 1 && p0 === 1 && !s0.march) { const r = s0.rally || {}; if (r.capt && !r.arm) add(RACK, 3, '창과 활 나눠 주기', 'daArm', arm); }
    if (c === 2) { if (p0 === 0) add(TENTD, 3.4, '장막에 들기', 'daTent', vision); if (p0 === 1) add(KNOLL, 4.5, '하늘을 우러러보기', 'daStars', stars, 0);
      if (p0 === 2) { const k = s0.pc | 0; if (k === 0) add(HERD, 6, '말씀하신 다섯 가지 고르기', 'daOff', offerPick, 0.2); if (k === 1) add(PIECE, 3, '쪼갠 것을 마주 놓기', 'daLaid', laid); if (k === 2) add(PIECE, 3.4, '솔개 쫓기', 'daKite', kites); if (k === 3 && !(s0.wt > 0)) add(PIECE, 3, '곁에 앉아 해 질 때까지 기다리기', 'daWait', waitStart); } }
    if (c === 3 && p0 === 1) { if (s0.got.w !== 1) add(WELLM, 3.6, '발 씻을 물 긷기', 'daW', () => G.UI.minigame('balance', { title: '물동이 이고 가기', hint: '물이 쏟아지지 않게 가운데로 맞춰요.', dur: 9 }, ok => { if (ok) got('w'); else toast('물을 쏟았어요 · 다시 길어요'); }), 0);
      if (!s0.got.c) add(HERD, 5.5, '기름지고 좋은 송아지 고르기', 'daC', () => { s0.got.c = 0.5; sfx('cow'); toast('송아지를 골랐어요 · 양 우리 곁의 종에게 맡겨요'); G.UI.quest(); }, 0.2); }
    if (c === 5) { if (p0 === 1) { const f = s0.fe || (s0.fe = {}); if (!f.flour) add(QUERN, 2.6, '맷돌로 밀가루 갈기', 'daFl', flour); if (!f.dates) add(DATES, 3.6, '대추야자 따기', 'daDt', dates); if (!f.mats) add(MATS, 3, '상수리나무 아래 자리 깔기', 'daMt', mats); }
      if (p0 === 2) add(TAMA, 3, '에셀나무 심기', 'daTama', plant, 0); }
    if (c === 6) { if (p0 === 0) { if (!s0.saddle) add(DONK6, 2.8, '나귀에 안장 지우기', 'daSad', saddle); if (!s0.wood) add(WOOD, 3.2, '번제에 쓸 나무 쪼개기', 'daWood', wood, 0); }
      if (p0 === 1) { const jr = s0.jr | 0; if (jr === 1) add(CAMP1, 3, '마른 가지 모아 불 피우기', 'daF1', fire1); if (jr === 2) add(CAMP1, 3.4, '불가에서 자기', 'daSl1', sleep6);
        if (jr === 4) { const dk = loc('daDonk'); if (dk) add(dk, 2.6, '나귀에게 물 먹이기', 'daDw', donkeyWater); } if (jr === 5) add(CAMP2, 3.4, '불가에서 자기', 'daSl2', sleep6); if (jr === 6) add(LOOKV, 3.6, '눈을 들어 멀리 바라보기', 'daLook', lookUp, 0); }
      if (p0 === 2 && s0.asked) add(TOP, 3.4, '단 쌓기', 'daAlt2', altar2, 0);
      if (p0 === 4) THICK.forEach((q, i) => { if (!(s0.seen || {})[i]) add(q, 2.6, '수풀 살피기', 'daTh' + i, () => thicket(i), 0); }); }
    return out; },
  quest(s) { const c = ch(), p0 = ph(), s0 = st(), R = (t0, ok) => ({ t: t0, ok: !!ok }), g = s0.got || {}, r = s0.rally || {}, s3 = s0.st3 || {}, f = s0.fe || {}, jr = s0.jr | 0, pc = s0.pc | 0;
    if (c === 0) { if (p0 === 0) return [R('1장 부르심 · 세겜에 이르기 전날 밤, 길 위의 야영'), R('마른 가지 모아 불 피우기', s0.fire0), R('불가에서 자기')];
      if (p0 === 1) return [R('1장 부르심 · 아침 · 장막을 걷어 나귀에 짐 싣기')]; if (p0 === 2) return [R('1장 부르심 · 짐 행렬을 이끌고 동쪽 모레 상수리나무로')];
      if (p0 === 3) return [R('1장 부르심 · 상수리나무 곁에 돌 제단 쌓기'), R('큰 밑돌 굴려 오기', s3.big), R(s3.flat === 1 ? '평평한 돌 · 빈터에 내려놓기' : '평평한 돌 머리에 이어 오기', s3.flat === 2), R('틈을 메울 흙과 잔돌 모으기', s3.earth), R('제단 쌓기', s0.altar1)];
      return [R('1장 · 롯과 갈라섬'), R('롯과 함께 남동쪽 언덕에 올라 요단 들 바라보기', s0.lotGo), R('동서남북을 바라보기')]; }
    if (c === 1) { if (p0 === 0) return [R('2장 롯 · 장막촌에 달려온 사람에게 가기')];
      if (p0 === 1) return s0.march ? [R('2장 롯 · 밤길 · 장정들을 이끌고 남동쪽 진영까지')] : [R('2장 롯 · 동맹과 장정들을 불러 모으기'), R('아모리 사람 마므레 (수풀 서쪽)', r.mamre), R('종들의 우두머리 (장막 사이)', r.capt), R('창과 활 나눠 주기 (우두머리 곁 창 더미)', r.arm)];
      return [R(['', '', '2장 롯 · 진영 동쪽 끝, 롯이 묶인 말뚝으로 숨어들기', '2장 롯 · 롯을 데리고 진영 서쪽 끝으로 빠져나가기', '2장 롯 · 살렘 왕 멜기세덱'][p0] || '')].concat(p0 === 2 || p0 === 3 ? [R('파수꾼의 눈길(앞쪽)을 피해요 · 앉기 단추로 낮게 · 남쪽 바위 그늘')] : []); }
    if (c === 2) { if (p0 === 0) return [R('3장 별 · 밤 · 아브람의 장막에 들기')]; if (p0 === 1) return [R('3장 별 · 장막촌 동쪽 둔덕에서 하늘을 우러러보기')];
      return [R('3장 별 · 쪼갠 고기 사이로 (창 15:9–12)'), R(`말씀하신 다섯 가지 고르기 (${(s0.pcGot || []).length}/5) · 소 떼 풀밭`, pc >= 1), R('쪼갠 것을 마주 놓기 · 동쪽 둔덕 아래', pc >= 2), R('솔개 쫓기', pc >= 3), R(s0.wt > 0 ? `해 질 때까지 기다리기 · ${Math.ceil(s0.wt)}초` : '곁에 앉아 해 질 때까지 기다리기')]; }
    if (c === 3) return p0 === 0 ? [R('4장 세 나그네 · 상수리나무 그늘의 나그네들에게 달려가기')] : [R('4장 세 나그네 · 서둘러 대접할 채비하기'), R('우물에서 발 씻을 물 긷기', g.w === 1), R('사라에게 떡을 부탁하기', g.b === 1), R('소 떼에서 송아지를 골라 양 우리 곁의 종에게', g.c === 1), R('맷돌 가는 여종에게 엉긴 젖과 우유', g.m === 1), R('나그네들께 상 차려 드리기 (앞의 나그네에게)')];
    if (c === 4) return [R('5장 간구 · 나그네들 곁에서 함께 걸으며 배웅하기')];
    if (c === 5) { if (p0 === 0) return [R('6장 웃음 · 장막의 사라에게 가기')]; if (p0 === 1) return [R('6장 웃음 · 이삭의 젖 떼는 날, 큰 잔치 채비'), R('맷돌로 밀가루 갈기 (화덕 곁)', f.flour), R('대추야자 따기 (우물 북쪽 야자나무)', f.dates), R('상수리나무 아래 자리 깔기', f.mats)]; return [R('6장 웃음 · 장막 앞 빈터에 에셀나무 심기')]; }
    if (c === 6) { if (p0 === 0) return [R('7장 모리아 · 떠날 채비'), R('나귀에 안장 지우기', s0.saddle), R('번제에 쓸 나무 쪼개기 (장막 곁 나뭇더미)', s0.wood)];
      if (p0 === 1) return [R('7장 모리아 · 사흘 길'), R(['첫째 날 · 북서쪽 길로 걷기', '첫째 밤 · 마른 가지 모아 불 피우기', '첫째 밤 · 불가에서 자기', '둘째 날 · 동쪽 길로 걷기', '둘째 밤 · 나귀에게 물 먹이기', '둘째 밤 · 불가에서 자기', '셋째 날 · 동쪽, 눈을 들어 멀리 바라보기', '셋째 날 · 산 아래까지 가기', '셋째 날'][jr] || '')];
      return [R(['', '', s0.asked ? '7장 모리아 · 산꼭대기에 단 쌓기' : '7장 모리아 · 이삭과 함께 산을 오르기', '7장 모리아', `7장 모리아 · 산꼭대기 둘레의 수풀 살피기 (${Object.keys(s0.seen || {}).length}/3)`][p0] || '7장 모리아')]; }
    return [R('아브라함 편을 마쳤어요 · 오른쪽 위 「이야기에서 나오기」로 세겜의 제단에 돌아가요', 1)]; },
  dyn(list) { const s0 = st(), c = ch(), p0 = ph(), o = W0(), yq = q => o.y + hillH(q[0], q[1]), put1 = (mesh, q, ry, dy, sc) => { const m = XM.pool[XM.k] || (XM.pool[XM.k] = G.m4()); XM.k++; G.m4trs(m, wx(q), yq(q) + (dy || 0), wz(q), ry || 0, 0, 0, sc || 1, sc || 1, sc || 1); list.push({ mesh, m, outline: true }); };
    XM.k = 0; if (!XM.ready) xmBuild();
    if (s0.altar1) { M1 = M1 || altarMesh(41); G.m4trs(MA, wx(ALT1), o.y, wz(ALT1), 0.4, 0, 0, 1, 1, 1); list.push({ mesh: M1, m: MA, outline: true }); }
    else if (c === 0) { const s3 = s0.st3 || {}; /* v18.83 the three things for the altar, where they lie and where they are brought */
      put1(XM.boulder, s3.big ? ALT1 : BIGST, 0.5); if (!s3.flat) put1(XM.slab, FLATST, 0.3); else if (s3.flat === 2) put1(XM.slab, [ALT1[0] + 1.1, ALT1[1] + 0.4], 0.8);
      put1(XM.earth, s3.earth ? [ALT1[0] - 1, ALT1[1] + 0.5] : EARTH0, 0); if (p0 <= 1) put1(XM.packs, [DONK0[0] + 1.3, DONK0[1] + 1], 0.4); }
    if (LOADK && P().carry === 'head') { const PP = P(), w = PP.rig && PP.rig.world && G.HBI && PP.rig.world[G.HBI.head], hp = w && isFinite(w[13]) && Math.hypot(w[12] - PP.x, w[14] - PP.z) < 1.5 ? [w[12], w[13] + 0.46, w[14]] : [PP.x, PP.y + 2.2, PP.z]; /* (above his raised hands) */
      G.m4trs(XM.mh, hp[0], hp[1], hp[2], PP.face || 0, 0, 0, 0.8, 0.8, 0.8); list.push({ mesh: XM.slab, m: XM.mh, outline: true }); }
    for (const q of dynFires()) put1(XM.fire, q, 0);
    if (c === 2 && p0 === 2 && (s0.pc | 0) >= 2) { put1(XM.pieces, PIECE, 0.3);
      if ((s0.pc | 0) === 2) { const t = performance.now() / 1000; for (let i = 0; i < 2; i++) { const a = t * (0.6 + i * 0.2) + i * 3, m = XM.pool[XM.k] || (XM.pool[XM.k] = G.m4()); XM.k++; G.m4trs(m, wx(PIECE) + Math.cos(a) * (3.5 + i), yq(PIECE) + 5 + i * 1.2 + Math.sin(t * 2 + i) * 0.4, wz(PIECE) + Math.sin(a) * (3.5 + i), a + Math.PI, 0, Math.sin(t * 3 + i) * 0.25, 1, 1, 1); list.push({ mesh: XM.kite, m }); } } }
    if (c === 5 && (p0 >= 2 || (s0.fe && s0.fe.mats))) put1(XM.mats, MATS, 0.5);
    if (s0.altar2) { M2 = M2 || altarMesh(43); G.m4trs(MB, wx(TOP), o.y + hillH(TOP[0], TOP[1]), wz(TOP), 1.1, 0, 0, 1, 1, 1); list.push({ mesh: M2, m: MB, outline: true }); }
    if (s0.planted) { MT = MT || tamMesh(); G.m4trs(MC, wx(TAMA), o.y, wz(TAMA), 0.6, 0, 0, 0.8, 0.8, 0.8); list.push({ mesh: MT, m: MC, outline: true }); } },
  weather: { clear: 0.8, cloudy: 0.2, rain: 0, wind: 0, fog: 0, dust: 0, storm: 0 },
  floor: (lx, lz) => hillH(lx, lz),
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B;
    const KEEP = [SPAWN0, OAK, ALT1, SPAWN1, MOAK, VIS, TENT, STENT, HEARTH, WELLM, FOLD, HERD, WOOD, TAMA, KNOLL, EDGE, LOT, FOOT, TOP, ...AVOID83, ...THICK, ...DFIRES].map(q => [q[0], q[1]]);
    const free = (x, z, r) => !KEEP.some(q => Math.hypot(q[0] - x, q[1] - z) < (r || 4.5));
    const yAt = (x, z) => BY + hillH(x, z);
    const tree = (fn, x, z, s, r) => { put(fn, x, z, { s: s || 1, y: yAt(x, z) - 0.05 }); colR(x, z, (r || 0.5) * (s || 1), yAt(x, z) + 4); };
    const tent = (x, z, ry, s, c) => { put('tent', x, z, { ry, s, args: [c] }); const w = 5.6 * s, d = 3.6 * s, rot = Math.abs(Math.sin(ry)) > 0.5; col(x, z, rot ? d : w, rot ? w : d, BY - 1, BY + 2.5 * s, true); };
    const wall = (x, z, len, rot, h) => { put('wallSeg', x, z, { ry: rot ? Math.PI / 2 : 0, args: [len, h || 0.9] }); col(x, z, rot ? 0.7 : len, rot ? len : 0.7, BY - 1, BY + (h || 0.9)); };
    const fence = (x, z, len, rot) => { put('fence', x, z, { ry: rot ? Math.PI / 2 : 0, args: [len] }); col(x, z, rot ? 0.3 : len, rot ? len : 0.3, BY - 1, BY + 1.1); };
    const road = () => { }; /* v18.64 roads are painted on the ground (ground, above) */
    const patch = () => { }; /* (patches too) */

    // ---------------- 세겜 (west): the oak of Moreh, the Canaanites' houses and terraces, Gerizim and Ebal on either side

    tree('oak', OAK[0], OAK[1], 1.5, 0.75); for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283; put('flowers', OAK[0] + Math.cos(a) * 3.4, OAK[1] + Math.sin(a) * 3.4, { args: [[0xe8d070, 0xd86a5a, 0xf0f0e0][i % 3]] }); }
    patch(ALT1[0], ALT1[1], 4, 4, 0xb4a47a);
    for (const [x, z, w, d] of [[-80, -45, 6, 5], [-70, -48, 5, 4], [-88, -37, 5, 4], [-62, -50, 4.5, 4]]) { put('house', x, z, { ry: Math.PI, args: [{ w, d, h: 2.6, c: [0xc4b08c, 0xb8a684, 0xcbb894][Math.floor(Math.abs(x)) % 3] }] }); col(x, z, w, d, BY - 1, BY + 2.9, true); }
    wall(-75, -41, 18, 0, 0.8); put('jars', -73, -39.5, { args: [3] }); put('pots', -84, -33); cyl(1.6, 1.6, 0.06, 14, -66, BY + 0.03, -40, 0xc8b88c); /* threshing floor */
    for (const [x, z, w, d, ripe] of FIELDS) { /* v18.64 the wheat is the ground's own grass, painted gold (ground, above), with a few taller tufts: no raised slab */ for (let i = 0; i < w * d / 3; i++) put('dryGrass', x + (rng() - 0.5) * (w - 1), z + (rng() - 0.5) * (d - 1), { s: 0.8 + rng() * 0.5, args: [ripe ? 0xd8c070 : 0x9ab060] }); wall(x, z - d / 2 - 0.5, w, 0, 0.7); }
    for (const [x, z] of [[-90, 26], [-84, 40], [-76, 42], [-70, 38], [-92, 44]]) tree('olive', x, z, 1, 0.4);
    for (const [x, z, f] of [[-84, -20, 'oak'], [-48, -34, 'oak'], [-44, 6, 'tamarisk'], [-92, -30, 'oak'], [-52, 12, 'fig'], [-88, 8, 'oak'], [-46, -46, 'olive'], [-58, -42, 'fig']]) tree(f, x, z, 1, 0.5);
    for (const [x, z] of [[-92, -50], [-50, -52], [-46, 30], [-60, 46], [-90, 58], [-48, 56]]) { put('rockField', x, z, { s: 1.1 }); colR(x, z, 1.2, BY + 1); }

    // ---------------- 마므레 (middle): the oak grove, the black tents of a great household, well, fold, herd, camels
    tree('oak', MOAK[0], MOAK[1], 1.35, 0.7); put('blanket', VIS[0] + 1.2, VIS[1] - 1.5, { ry: 0.4, args: [0x6a3a2a] });
    for (const [x, z, s] of [[-26, -18, 1.1], [-6, -24, 1.2], [6, -28, 1], [-36, -8, 1.1], [18, -22, 1], [-38, 18, 1], [30, -14, 0.9], [-20, -30, 1], [-30, 40, 1], [10, 48, 1]]) tree('oak', x, z, s, 0.55);
    tent(TENT[0], TENT[1], 0, 1.35, 0x2e2a26); tent(STENT[0], STENT[1], 0, 1.1, 0x3a3230);
    for (const [x, z, ry] of [[-14, 24, Math.PI], [2, 28, Math.PI], [16, 26, Math.PI], [28, 12, Math.PI / 2], [-24, 8, -Math.PI / 2], [-2, -12, 0]]) tent(x, z, ry, 1, [0x3e3532, 0x46403a, 0x352e2a][Math.floor(Math.abs(x + z)) % 3]);
    put('campfire', HEARTH[0], HEARTH[1]); colR(HEARTH[0], HEARTH[1], 0.7, BY + 0.6); put('jars', HEARTH[0] + 3, HEARTH[1] - 1, { args: [4] }); put('loaves', HEARTH[0] - 1.6, HEARTH[1] - 1.2, { args: [5] }); put('sacks', HEARTH[0] + 2.4, HEARTH[1] + 2.2); put('baskets', HEARTH[0] - 2.4, HEARTH[1] + 1.6, { args: [3] });
    cyl(0.32, 0.36, 0.22, 10, HEARTH[0] + 1.6, BY + 0.11, HEARTH[1] + 1.4, 0x8a8278); cyl(0.3, 0.3, 0.08, 10, HEARTH[0] + 1.6, BY + 0.26, HEARTH[1] + 1.4, 0x9a9284); /* the millstones (quern) */
    put('well', WELLM[0], WELLM[1]); colR(WELLM[0], WELLM[1], 1.7, BY + 1.1); for (const [dx, dz, ry] of [[3.2, -1.6, 0.3], [-1.8, 3.2, -0.5]]) { put('trough', WELLM[0] + dx, WELLM[1] + dz, { ry }); colR(WELLM[0] + dx, WELLM[1] + dz, 0.9, BY + 0.6); }
    fence(FOLD[0], FOLD[1] - 5, 12, 0); fence(FOLD[0] - 6, FOLD[1], 10, 1); fence(FOLD[0] + 6, FOLD[1] + 2.5, 5, 1); fence(FOLD[0] - 2, FOLD[1] + 5, 8, 0); put('straw', FOLD[0] + 1, FOLD[1] + 2);
    patch(HERD[0], HERD[1], 14, 10, 0x8a9a52); put('trough', HERD[0] + 5, HERD[1] - 3, { ry: 0.2 });
    for (const [x, z, ry] of [[30, 24, 0.6], [33, 28, -0.4], [28, 30, 1.2], [36, 22, 2.4]]) { put('camelSit', x, z, { ry }); colR(x, z, 0.8, BY + 1.1); }
    for (const [dx, dz] of [[0, 0], [2.4, 1.4], [-1.8, 2]]) tree('datePalm', DATES[0] + dx, DATES[1] + dz, 1, 0.4); /* v18.83 the date palms (21:8) */
    for (let i = 0; i < 6; i++) cyl(0.03, 0.035, 2.4, 5, RACK[0] - 0.6 + i * 0.25, BY + 1.15, RACK[1], 0x6a4a30, { rz: 0.25 - i * 0.1 }); colR(RACK[0], RACK[1], 0.5, BY + 1.5); /* the spears (14:14) */
    put('bales', 22, 34, { ry: 0.3 }); put('woodStack', WOOD[0], WOOD[1], { ry: 0.4 }); put('woodStack', WOOD[0] + 0.6, WOOD[1] + 0.9, { ry: -0.3 }); colR(WOOD[0], WOOD[1], 0.8, BY + 0.6);
    for (const [x, z, c] of [[TENT[0] - 2.4, TENT[1] + 3.6, 0x8a3a2a], [STENT[0], STENT[1] + 3, 0x2e4a78]]) put('blanket', x, z, { args: [c] });
    patch(TAMA[0], TAMA[1], 3, 3, 0xb4a47a);
    /* the knoll east of the camp, for the stars and for looking toward Sodom */

    for (const [x, z] of [[KNOLL[0] + 5, KNOLL[1] - 4], [KNOLL[0] - 6, KNOLL[1] + 3]]) put('desertShrub', x, z, { y: yAt(x, z) });

    // ---------------- 단의 밤 진영 (south-east): the kings' tents, fires, loot, captives
    for (const [x, z, ry] of [[64, -16, 0], [76, -12, 0], [86, -20, Math.PI / 2], [70, -42, Math.PI], [84, -44, Math.PI]]) tent(x, z, ry, 1, [0x5a2a22, 0x4a2a2a, 0x3a2420][Math.floor(x) % 3]);
    DFIRES.forEach(([x, z]) => { put('campfire', x, z); colR(x, z, 0.7, BY + 0.6); });
    put('sacks', 74, -22); put('jars', 82, -27, { args: [5] }); put('bales', 66, -24, { ry: 0.6 }); put('baskets', 78, -38, { args: [4] }); put('blanket', 72, -30, { args: [0x6a2a5a] }); put('jars', 60, -40, { args: [3] });
    cyl(0.07, 0.08, 2.0, 6, LOT[0] + 0.6, BY + 1.0, LOT[1] - 0.5, 0x5a4028); for (let i = 0; i < 5; i++) cyl(0.03, 0.035, 2.4, 5, 60 + i * 0.25, BY + 1.15, -20, 0x6a4a30, { rz: 0.25 - i * 0.12 }); /* the stake, the spears stood together */
    for (const [x, z] of [[56, -46], [60, -48]]) { put('camelSit', x, z, { ry: 1.2 }); colR(x, z, 0.8, BY + 1.1); }
    for (const [x, z, s] of [[52, -38, 1], [58, -44, 0.9], [66, -50, 1.1], [76, -50, 1], [86, -50, 0.9], [92, -48, 0.8], [50, -28, 0.8]]) { put('rock', x, z, { s }); colR(x, z, 0.9 * s, BY + 1.2); }
    for (const [x, z] of [[54, -50], [62, -52], [72, -54], [82, -54], [48, -44]]) put('desertShrub', x, z);
    for (const [x, z] of [[48, -8], [92, -8], [52, -52]]) tree('tamarisk', x, z, 1, 0.4);

    // ---------------- 모리아 (north-east): a rocky mountain, a path up its west side, thickets near the top

    for (let i = 0; i < 22; i++) { const a = 0.6 + i / 22 * 5.1 + rng() * 0.15, r = 6 + rng() * 13, x = HILL[0] + Math.cos(a) * r, z = HILL[1] + Math.sin(a) * r; if (Math.abs(Math.atan2(z - HILL[1], x - HILL[0]) - Math.PI) < 0.45) continue; if (!free(x, z, 3)) continue;
      const big = i % 3 === 0; put(big ? 'outcrop' : 'rock', x, z, { s: big ? 0.6 + rng() * 0.3 : 0.8 + rng() * 0.5, y: yAt(x, z) - 0.2 }); colR(x, z, big ? 1.2 : 0.8, yAt(x, z) + 1.4); }
    THICK.forEach(([x, z]) => { const y = yAt(x, z); for (let k = 0; k < 6; k++) sph(0.55 + rng() * 0.3, x + Math.cos(k * 1.1) * 0.75, y + 0.45 + (k % 2) * 0.35, z + Math.sin(k * 1.1) * 0.75, [0x4a6a34, 0x5a7a3c, 0x3e5a2c][k % 3], { j: 0.1 }); });
    for (const [x, z] of [[56, 30], [60, 58], [86, 30], [88, 54], [74, 62]]) { if (free(x, z, 3)) { put('desertShrub', x, z, { y: yAt(x, z) }); } }
    for (const [x, z] of [[50, 58], [92, 40], [56, 22]]) tree('olive', x, z, 0.9, 0.35);
    put('woodStack', FOOT[0] - 3.5, FOOT[1] + 1, { ry: 1.2 });

    for (let i = 0; i < 200; i++) { const x = XMIN + 2 + rng() * (XMAX - XMIN - 4), z = ZMIN + 2 + rng() * (ZMAX - ZMIN - 4); if (!free(x, z, 2.4) || Math.hypot(x - HILL[0], z - HILL[1]) < 21) continue; put(i % 8 === 0 ? 'flowers' : 'dryGrass', x, z, { y: yAt(x, z), s: 0.7 + rng() * 0.6 }); }
    /* grass tufts, bushes and stones everywhere so no ground looks bare */
    for (let i = 0; i < 140; i++) { const x = XMIN + 2 + rng() * (XMAX - XMIN - 4), z = ZMIN + 2 + rng() * (ZMAX - ZMIN - 4); if (!free(x, z, 3.2) || Math.hypot(x - HILL[0], z - HILL[1]) < 21 || (x > 50 && x < 94 && z > -48 && z < -8)) continue; put(i % 7 === 0 ? 'bush' : 'dryGrass', x, z, { y: yAt(x, z), args: i % 7 === 0 ? [] : [0xa0a060] }); }
    for (let i = 0; i < 26; i++) { const x = XMIN + 3 + rng() * (XMAX - XMIN - 6), z = ZMIN + 3 + rng() * (ZMAX - ZMIN - 6); if (!free(x, z, 6) || Math.hypot(x - HILL[0], z - HILL[1]) < 22) continue; sph(0.3 + rng() * 0.35, x, yAt(x, z) + 0.12, z, [0x9a9284, 0xa8a090, 0x8a8276][i % 3], { s: [1.3, 0.6, 1], flat: true, j: 0.1 }); } } });

/* v18.83 an old save: the start of that part (called by spawn and onEnter; once) */
function migrate83(s0) { if (!s0 || s0.v === 2) return; const c0 = s0.ch | 0, p = s0.ph | 0;
  if (c0 === 0 && p >= 1) { s0.ph = 3; s0.st3 = {}; } if (c0 === 5 && p >= 1) s0.ph = 2; if (c0 === 6 && p === 0) { s0.saddle = 0; s0.wood = 0; } if (c0 === 6 && p === 1) { s0.saddle = 1; s0.wood = 1; s0.jr = 0; } if (c0 === 6 && p >= 2) s0.jr = 8; s0.v = 2; }
D.add({ key: 'abraham', land: 'dlca', dayLabel: s0 => (s0.ch | 0) === 0 && (s0.ph | 0) <= 1 ? '세겜 가는 길' : (s0.ch | 0) === 6 && (s0.ph | 0) === 1 ? '모리아 가는 길' : ['세겜', '마므레', '마므레', '마므레', '마므레', '브엘세바', '모리아', '모리아'][s0.ch | 0] || '가나안', backTo: '이야기를 잠시 멈추고 세겜의 제단 앞으로 돌아갈까요?', hero: s0 => s0.renamed ? '아브라함' : '아브람', outfit: 'dlcAbraham', title: '창세기 아브라함 편 · 약속의 별',
  kit: () => ({ inv: { bread: 2, curd: 1, dates: 2 }, tools: ['staff'], hand: 'staff', silver: 0, water: 6 }),
  target: () => { try { return target(); } catch (e) { return null; } },
  spawn: s0 => { migrate83(s0); const c = s0.ch | 0, p0 = s0.ph | 0, jr = s0.jr | 0; if (c === 0) return p0 === 1 ? [DONK0[0] + 1.8, DONK0[1] - 1.2, -1.0] : p0 <= 2 ? [CAMP0[0] + 1.6, CAMP0[1] - 1.4, -1.2] : p0 === 4 ? [LOOK[0] - 6, LOOK[1] + 6, -0.8] : [OAK[0] + 4, OAK[1] + 2, -1.2];
    if (c === 1) return p0 >= 2 ? [EDGE[0], EDGE[1], Math.PI / 2] : [SPAWN1[0], SPAWN1[1], Math.PI / 2]; if (c === 2) return p0 === 2 ? [HERD[0] + 3, HERD[1] - 3.4, -1] : p0 === 1 ? [KNOLL[0] - 3, KNOLL[1] - 3, 0.8] : [TENT[0] + 1.5, TENT[1] - 6.2, 0];
    if (c === 6 && p0 === 0) return [TENT[0] + 2, TENT[1] - 6, 0]; if (c === 6 && p0 === 1) { const q = jr === 0 ? [TENT[0] + 2, TENT[1] - 6] : JR_AT(jr === 3 ? 2 : jr === 6 ? 5 : jr); return [q[0] + 1.8, q[1] - 1.6, -0.8]; }
    if (c === 5) return [STENT[0] - 3, STENT[1] + 6, 1.2]; if (c === 6 && p0 >= 2) return [FOOT[0] - 1.5, FOOT[1], Math.PI / 2]; if (c >= 7) return [TOP[0] - 2, TOP[1], Math.PI / 2, hillH(TOP[0] - 2, TOP[1])];
    return [SPAWN1[0], SPAWN1[1], Math.PI / 2]; },
  onEnter(s0) { { const sr = npc('daSarai'); if (sr) sr.name = s0.renamed ? '사라' : '사래'; }
    migrate83(s0);
    const c = s0.ch | 0, p0 = s0.ph | 0, jr = s0.jr | 0; LOADK = null; waitNote = 0;
    night(c === 0 ? (p0 === 0 ? 18.4 : p0 === 1 ? 6.4 : 10) : c === 1 ? (p0 >= 2 && p0 < 4 ? 23 : p0 === 4 ? 8 : s0.march ? 21 : 10) : c === 2 ? (p0 <= 1 ? 21.5 : 10) : c === 3 ? 12.5 : c === 4 ? 15 : c === 5 ? 9 : c === 6 ? (p0 === 1 && [1, 2, 4, 5].includes(jr) ? 19.4 : p0 === 0 ? 5.2 : 7.5) : 9);
    if (G.Weather && G.Weather.set) G.Weather.set('clear', 8);
    if (c === 0 && p0 === 0) s0.fire0 = 0; if (c === 2 && p0 === 2) s0.wt = 0; if (c === 4) s0.pleaOn = 0; if (c === 0 && p0 === 4 && s0.lotGo && !s0.lotDone) s0.lotDone = 1;
    if (c === 1 && (s0.ph === 2 || s0.ph === 3)) { s0.lot = 0; s0.ph = 2; s0.busy = 0; s0.down = s0.down || {}; }
    if (c === 6 && (s0.ph | 0) === 3) { s0.ph = 2; s0.altar2 = 0; }
    if (c === 6 && (s0.ph | 0) === 4 && !s0.done) { s0.seen = {}; s0.ramAt = undefined; }
    arrange(); },
  intro(s0) { if (!s0.ch && !s0.ph) narr([card('창세기 12:1–2', '아브라함 편 · 약속의 별', '여호와께서 아브람에게 이르시되 「너는 너의 본토 친척 아비 집을 떠나 내가 네게 지시할 땅으로 가라. 내가 너로 큰 민족을 이루고 네게 복을 주어 네 이름을 창대케 하리니 너는 복의 근원이 될지라」', '창세기 12:1–2'),
      card('창세기 12:4–5', '칠십오 세에', '아브람이 하란을 떠날 때에 그 나이 칠십오 세였더라. 아브람이 그 아내 사래와 조카 롯과 하란에서 모은 모든 소유와 얻은 사람들을 이끌고 가나안 땅으로 가려고 떠나서 마침내 가나안 땅에 들어갔더라.', '창세기 12:4–5'),
      card('증조할아버지의 이야기', '아브람이 되어', '이 이야기 속에서 요셉은 증조할아버지 아브람이 되어 걸어요. 세겜에 이르기 전날 밤, 사래와 롯과 종들과 함께 길가에 머물러요. 마른 가지를 모아 불을 피워 보세요.\n화면 오른쪽 위 「이야기에서 나오기」로 언제든 세겜의 제단 앞에 돌아갈 수 있어요. 한 만큼은 남아요.')]); else toast('약속의 이야기를 이어서 떠올려요'); } });
})(window.G);
