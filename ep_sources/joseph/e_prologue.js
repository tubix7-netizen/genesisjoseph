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
