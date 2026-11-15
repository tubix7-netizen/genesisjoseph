/* 약속의 길 — v18.59 창세기 야곱 편 · 라헬을 위한 일곱 해 (dlc_jacob.js)   창 29:1–30
   고센에서 아버지 야곱이 들려주는 젊은 날 이야기 속으로 들어가, 젊은 야곱이 되어 하란에서 라반의 양 떼를 일곱 해 동안 쳐요(목장 경영).
   흐름: ① 우물가의 목자들 → ② 우물 돌 굴리기 · 라헬 → ③ 라반과 품삯 → ④ 일곱 해(해마다 봄·여름·가을·겨울, 철마다 일손 셋) → ⑤ 혼인 잔치와 레아 → ⑥ 라헬
   목장: 양 떼 수 · 기운 · 물구유 · 풀밭 셋(뜯으면 줄고 쉬면 자라요) · 꼴(겨울 먹이) · 양털 · 라반의 신임 · 라헬의 마음.
     철마다 하는 일: 물 긷기 / 풀밭으로 몰기 / 양 돌보기(봄엔 새끼) / 양털 깎기(봄·여름) / 밭일(가을 씨, 봄 거둠, 여름 꼴) / 밤 지키기(늑대) / 라헬과 이야기.
     해마다 라반이 양 떼를 세요(TARGET). 숫자는 아래 상수로 조절해요.
   저장: G.DLC.st('jacob') = { ch, T: { y, se, ap, n, hp, grass[3], at, water, hay, wool, sown, trust, heart, … }, done } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ls = G.Lands, D = G.DLC; if (!Game || !EP || !Ls || !D) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c);
const st = () => D.st('jacob'), say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), Ln = D.Ln, T = D.T, J = (t, ref, e) => ({ n: '야곱', t, ref, e });
const t = Ls.tint, L0 = Ls.lookOf('reuben') || Ls.lookOf('judah') || {}, LJ0 = Ls.lookOf('jacob') || {}, LW = Ls.lookOf('dinah') || Ls.lookOf('leah') || {};
EP.outfits.dlcJacob = { skin: 0xd8a070, hair: 0x2a1c12, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1c12, eye: 0x5a3a20, build: 0.9, top: 0xcdbd98, under: 0xcdbd98, trim: 0x8a4434, belt: 0x6a4428, mantle: 0x7a5a40, mantleTrim: 0x8a4434, vary: false };
const SEA = ['봄', '여름', '가을', '겨울'], TARGET = [46, 54, 64, 76, 90, 106, 124], START = 40, AP = 3;
const WELL = [-22, -6], FOLD = [6, 2], HOUSE = [-24, 20], SHED = [16, 14], FIELD = [-6, 30], OUT = [-38, 2];
const PAST = [{ n: '북쪽 풀밭', x: 0, z: -26, w: 34, d: 14 }, { n: '동쪽 풀밭', x: 32, z: -2, w: 14, d: 30 }, { n: '남쪽 시냇가 풀밭', x: 24, z: 30, w: 26, d: 12 }];
const YEAR_CARD = [
  ['첫 해', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'],
  ['둘째 해', '낮에는 더위를 무릅쓰고 밤에는 추위를 당하며 눈 붙일 겨를도 없이 지내었나이다.', '창세기 31:40'],
  ['셋째 해', '외삼촌의 암양들이나 암염소들이 낙태하지 아니하였고, 또 외삼촌의 양 떼의 숫양을 내가 먹지 아니하였으며', '창세기 31:38'],
  ['넷째 해', '물려 찢긴 것은 내가 외삼촌에게로 가져가지 아니하고 스스로 그것을 보충하였으며', '창세기 31:39'],
  ['다섯째 해', '내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었나이다.', '창세기 30:30'],
  ['여섯째 해', '여호와께서 내 발이 이르는 곳마다 외삼촌에게 복을 주셨나이다.', '창세기 30:30'],
  ['일곱째 해', '야곱이 라반에게 이르되 내 기한이 찼으니 내 아내를 내게 주소서.', '창세기 29:21']];
let LAND = null; const on = () => !!(LAND && LAND.on()), ch = () => st().ch | 0, TY = () => st().T;
const npc = id => Game.npc(id), fin = id => { const n = npc(id); if (n) n.talking = false; };
const newT = () => ({ y: 1, se: 0, ap: AP, n: START, hp: 78, grass: [100, 100, 100], at: -1, water: 50, hay: 0, wool: 0, sown: 0, trust: 50, heart: 10, ev: null, grazed: 0, tended: 0, guard: 0, sheared: 0, lambed: 0, talked: 0, wellY: 0 });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function use(T0, why) { T0.ap = Math.max(0, T0.ap - 1); sfx('blip', { pitch: 1.1 }); G.UI.quest(); if (T0.ap === 0) setTimeout(() => G.UI.toast('이 철의 일손을 다 썼어요 · 라반의 집 앞에서 「한 철 마무리하기」'), 900); }
const noAp = T0 => { if (T0.ap > 0) return false; G.UI.toast('이 철의 일손을 다 썼어요 · 라반의 집 앞에서 「한 철 마무리하기」'); return true; };
/* the flock on the stage stands where it grazes */
function flockAt(T0) { const c = T0 && T0.at >= 0 ? PAST[T0.at] : { x: FOLD[0], z: FOLD[1], w: 7, d: 7 }, s0 = LAND.stage(); for (let i = 0; i < 12; i++) { const n = npc('djSheep' + i); if (!n) continue; const x = s0.x + c.x + (((i * 37) % 11) / 11 - 0.5) * (c.w - 3), z = s0.z + c.z + (((i * 53) % 7) / 7 - 0.5) * (c.d - 3); n.x = n.d.x = x; n.z = n.d.z = z; n.walk = null; } }
function rollEvent(T0) { const r = Math.random(), se = T0.se; T0.ev = null; if (T0.y === 1 && se === 0) return;
  if (se === 1 && r < 0.4) T0.ev = 'drought'; else if ((se === 2 || se === 3) && r < 0.5) T0.ev = 'wolf'; else if (se === 0 && r < 0.25) T0.ev = 'plague'; else if (r > 0.9) T0.ev = 'good';
  const M = { drought: ['가뭄이 들었어요', '풀이 더디게 자라고 구유의 물이 빨리 줄어요'], wolf: ['밤마다 늑대 소리가 들려요', '우리에서 「밤새 양 떼 지키기」를 하지 않으면 양을 잃어요'], plague: ['양 몇 마리가 기운이 없어요', '우리에서 「양 돌보기」를 해 주세요'], good: ['비가 알맞게 내렸어요', '풀밭이 잘 자라요'] }[T0.ev];
  if (M) setTimeout(() => pop(M[0], M[1], T0.ev === 'good' ? 'star' : 'moon'), 1600); }
function endSeason() { const T0 = TY(), log = []; const se = T0.se;
  T0.water -= se === 1 ? 60 : 42; if (T0.ev === 'drought') T0.water -= 15; if (T0.water <= 0) { T0.water = 0; T0.hp -= 14; log.push('구유의 물이 말라 양들이 목말랐어요'); }
  if (se === 3) { if (T0.hay >= 40) T0.hay -= 40; else { T0.hp -= 18; T0.hay = 0; log.push('겨울 꼴이 모자랐어요'); } }
  else if (!T0.grazed) { T0.hp -= 12; log.push('양 떼가 풀을 뜯지 못했어요'); }
  if (T0.ev === 'wolf' && !T0.guard) { const k = Math.min(T0.n - 5, 3); T0.n -= k; T0.trust -= 4; log.push(`늑대가 양 ${k}마리를 물어 갔어요`); }
  if (T0.ev === 'plague' && !T0.tended) { T0.hp -= 12; log.push('앓는 양을 돌보지 못했어요'); }
  for (let i = 0; i < 3; i++) if (!(T0.grazed & (1 << i))) T0.grass[i] = clamp(T0.grass[i] + (T0.ev === 'drought' ? 8 : T0.ev === 'good' ? 34 : 22), 0, 100);
  T0.hp = clamp(T0.hp, 5, 100); if (T0.hp < 30) { const k = Math.max(1, Math.round(T0.n * 0.06)); T0.n -= k; log.push(`기운이 다한 양 ${k}마리를 잃었어요`); }
  T0.se++; T0.ap = AP; T0.grazed = 0; T0.tended = 0; T0.guard = 0; T0.talked = 0; T0.at = -1; flockAt(T0);
  if (T0.se > 3) { endYear(log); return; }
  S().time = 7; narr([D.card(`${T0.y}년째 · ${SEA[T0.se]}`, `${SEA[se]}이 지나고 ${SEA[T0.se]}이 왔어요`, (log.length ? log.join(' · ') + '.\n' : '양 떼가 무사히 한 철을 났어요.\n') + `양 ${T0.n}마리 · 기운 ${Math.round(T0.hp)}% · 물구유 ${Math.round(T0.water)}% · 꼴 ${T0.hay}`)], () => { rollEvent(T0); G.UI.quest(); }); }
function endYear(log) { const T0 = TY(), y = T0.y, tg = TARGET[y - 1], okN = T0.n >= tg, C = YEAR_CARD[y - 1];
  T0.trust = clamp(T0.trust + (okN ? 10 : -8) + Math.min(6, Math.floor(T0.wool / 12)), 0, 100); const wool = T0.wool; T0.wool = 0;
  const lab = okN ? (y === 3 || y === 5 ? '양은 잘 불었구나. …그런데 올해부터는 네 몫의 품삯을 다시 셈해야겠다.' : '허허, 내 양 떼가 이리 불다니! 네가 온 뒤로 집에 복이 드는구나.') : '양이 내 셈보다 모자라는구나. 내년에는 더 힘써야겠다.';
  S().time = 7; narr([D.card(`${y}년이 지났다`, C[0], (log.length ? log.join(' · ') + '.\n' : '') + `라반이 양 떼를 세었습니다. ${T0.n}마리 (라반의 셈 ${tg}마리)${wool ? ` · 양털 ${wool}뭉치` : ''}`), D.card(C[2], y < 7 ? '섬김의 날들' : '칠 년이 찼다', C[1], C[2])],
    () => say([Ln('라반', lab, okN ? 'happy' : 'cold')].concat(y === 3 || y === 5 ? [T('라반은 야곱의 품삯을 열 번이나 바꾸었습니다. 그러나 하나님이 그를 금하사 야곱을 해치지 못하게 하셨습니다.', '창세기 31:7')] : []), () => {
      Game.insight && Game.insight(1, `야곱 편 ${y}년째`); if (y >= 7) { st().ch = 4; st().fin = { n: T0.n, trust: T0.trust, heart: T0.heart }; G.UI.quest(); pop('칠 년이 찼어요', '라반에게 가서 말해요', 'star'); return; }
      T0.y++; T0.se = 0; T0.lambed = 0; T0.sheared = 0; T0.wellY = 0; rollEvent(T0); G.UI.quest(); })); }

// ------------------------------------------------------------------ the story beats
function atWell() { say([J('내 형제여, 어디로서냐?', '창세기 29:4'), Ln('하란의 목자', '하란에서로라.'), J('너희가 나홀의 손자 라반을 아느냐?', '창세기 29:5'), Ln('하란의 목자', '아노라.'), J('그가 평안하냐?', '창세기 29:6'), Ln('하란의 목자', '평안하니라. 그 딸 라헬이 지금 양을 몰고 오느니라.'),
    J('해가 아직 높은즉 짐승 모일 때가 아니니 양에게 물을 먹이고 가서 뜯기라.', '창세기 29:7'), Ln('하란의 목자', '우리가 그리하지 못하겠노라. 떼가 다 모이고 목자들이 우물 아귀에서 돌을 옮겨야 우리가 양에게 물을 먹이느니라.', '', '창세기 29:8')],
  () => { fin('djShep'); st().ch = 1; const r = npc('djRachel'), s0 = LAND.stage(); if (r) { r.x = s0.x + 4; r.z = s0.z - 24; Game.npcWalk('djRachel', s0.x + WELL[0] + 4.5, s0.z + WELL[1] - 2.5, () => { r.face = r.homeFace = -1.9; }, 1.7); } G.UI.toast('라헬이 아버지의 양 떼를 몰고 와요'); G.UI.quest(); }); }
function rollStone() { G.UI.minigame('push', { title: '우물 아귀의 큰 돌', hint: '목자 여럿이 함께 굴리는 돌이에요. 꾹 눌러 밀다가, 힘이 빠지면 잠깐 놓았다가 다시 밀어요.', btn: '꾹 눌러 밀기' }, ok => { if (!ok) { G.UI.toast('돌이 꿈쩍도 안 해요 · 다시 밀어 봐요'); return; }
    sfx('thud', { pitch: 0.6 }); narr([D.card('창세기 29:10', '우물 아귀의 돌', '야곱이 그 외삼촌 라반의 딸 라헬과 그 외삼촌의 양을 보고 나아가서 우물 아귀에서 돌을 옮기고 외삼촌 라반의 양 떼에게 물을 먹이고', '창세기 29:10')],
      () => say([T('그가 라헬에게 입맞추고 소리 내어 울며', '창세기 29:11'), J('나는 그대 아버지의 생질이요 리브가의 아들이라.', '창세기 29:12', 'cry'), Ln('라헬', '리브가 고모님의 아들이라고요? …아버지께 알려야 해요!', 'happy'), T('라헬이 달려가서 그 아비에게 고하매, 라반이 그 생질 야곱의 소식을 듣고 달려와서 그를 영접하여 안고 입맞추고 자기 집으로 인도하여 들이니', '창세기 29:12–13')],
        () => { st().ch = 2; const s0 = LAND.stage(), r = npc('djRachel'); if (r) Game.npcWalk('djRachel', s0.x + HOUSE[0] + 5, s0.z + HOUSE[1] - 5, null, 2.4); G.UI.quest(); })); }); }
function wage() { say([Ln('라반', '너는 참으로 나의 골육이로다.', 'happy', '창세기 29:14'), T('야곱이 한 달을 그와 함께 거하더니', '창세기 29:14'), Ln('라반', '네가 비록 나의 생질이나 어찌 공으로 내 일만 하겠느냐? 무엇이 네 보수겠느냐? 내게 고하라.', '', '창세기 29:15'),
    T('라반이 두 딸이 있으니 형의 이름은 레아요 아우의 이름은 라헬이라. 레아는 안력이 부족하고 라헬은 곱고 아리따우니, 야곱이 라헬을 연애하므로', '창세기 29:16–18'),
    { n: '야곱', t: '(무엇이라 답할까?)', choices: [{ t: '"내가 외삼촌의 작은 딸 라헬을 위하여 외삼촌에게 칠 년을 봉사하리이다."' }] },
    Ln('라반', '그를 네게 주는 것이 타인에게 주는 것보다 나으니 나와 함께 있으라.', '', '창세기 29:19'), Ln('라반', '내 양 떼를 네게 맡기마. 마흔 마리다. 해마다 내가 세어 볼 것이니, 잃지 말고 불려 다오.')],
  () => { fin('djLaban'); st().ch = 3; st().T = newT(); flockAt(TY()); G.UI.quest();
    narr([D.card('하란의 일곱 해', '라반의 양 떼를 치기', '한 해는 봄 · 여름 · 가을 · 겨울, 철마다 일손이 셋이에요.\n· 우물에서 물을 긷고, 풀밭으로 양 떼를 몰아요(뜯은 풀밭은 쉬어야 다시 자라요).\n· 봄에는 우리에서 새끼를 받고, 봄이나 여름에 털을 깎아요.\n· 가을에 보리 씨를 뿌려 봄에 거두고, 여름엔 꼴을 베어 겨울을 나요.\n· 일손을 다 쓰면 라반의 집 앞에서 「한 철 마무리하기」.\n해마다 라반이 양 떼를 세요. 화면 왼쪽 위 목록에 목장 사정이 보여요.')]); }); }
function wedding() { say([J('내 기한이 찼으니 내 아내를 내게 주소서. 내가 그에게 들어가겠나이다.', '창세기 29:21'), Ln('라반', '좋다! 이곳 사람을 다 모아 잔치를 베풀자!', 'happy')], () => { fin('djLaban');
    G.UI.fade(() => { S().time = 20.5; const s0 = LAND.stage(); Game.teleport(s0.x + HOUSE[0] + 3, s0.z + HOUSE[1] - 6, 2.6); }, () => narr([D.card('창세기 29:22', '혼인 잔치', '라반이 그곳 사람을 다 모아 잔치하고, 저녁에 그 딸 레아를 야곱에게로 데려가매 야곱이 그에게로 들어가니라.', '창세기 29:22–23')],
      () => G.UI.fade(() => { S().time = 6.5; st().ch = 5; const s0 = LAND.stage(), l = npc('djLeah'); if (l) { l.x = s0.x + HOUSE[0] + 4.4; l.z = s0.z + HOUSE[1] - 5.2; l.face = l.homeFace = -2.2; } }, () => say([T('야곱이 아침에 보니 레아라.', '창세기 29:25'), J('외삼촌이 어찌하여 내게 이같이 행하셨나이까? 내가 라헬을 위하여 외삼촌께 봉사하지 아니하였나이까? 외삼촌이 나를 속이심은 어찜이니이까?', '창세기 29:25', 'angry'),
        Ln('라반', '형보다 아우를 먼저 주는 것은 우리 지방에서 하지 아니하는 바이라.', 'cold', '창세기 29:26'), Ln('라반', '이를 위하여 칠 일을 채우라. 우리가 그도 네게 주리니, 네가 그를 위하여 또 칠 년을 내게 봉사할지니라.', '', '창세기 29:27'),
        T('아버지를 속여 형의 복을 받았던 야곱이, 이번에는 속임을 당했습니다. 야곱은 무엇을 생각했을까요.'), Ln('레아', '…저를 미워하지 마세요. 아버지가 시키신 일이에요.', 'sad'),
        { n: '야곱', t: '(레아에게)', choices: [{ t: '"그대의 잘못이 아니오. 그대도 이제 내 아내요."', then: () => { st().kind = 1; } }, { t: '(아무 말 없이 고개를 돌린다)' }] }], () => { G.UI.quest(); pop('칠 일을 채웠어요', '라헬에게 가요', 'star'); })))); }); }
function rachel() { const f = st().fin || { n: START, trust: 50, heart: 10 }; say([Ln('라헬', '야곱… 언니를 원망하지 마세요. 그리고 저를 위해 다시 일곱 해라니요.', 'sad'), J('그대를 위해서라면 그 일곱 해도 며칠 같을 것이오.', '', 'tender'),
    T('야곱이 그대로 하여 그 칠 일을 채우매 라반이 딸 라헬도 그에게 아내로 주고', '창세기 29:28'), T('야곱이 또한 라헬에게로 들어갔고 그가 레아보다 라헬을 더 사랑하고 다시 칠 년을 라반에게 봉사하였더라.', '창세기 29:30')],
  () => { fin('djRachel'); const first = !st().done; st().done = 1; st().ch = 6; st().best = Math.max(st().best || 0, f.n);
    narr([D.card('창세기 29:20', '칠 년을 수일같이', '야곱이 라헬을 위하여 칠 년 동안 라반을 봉사하였으나, 그를 연애하는 까닭에 칠 년을 수일같이 여겼더라.', '창세기 29:20'),
      D.card('야곱 편을 마쳤어요', '하란의 장부', `맡은 양 ${START}마리 → ${f.n}마리\n라반의 신임 ${Math.round(f.trust)} · 라헬의 마음 ${Math.round(f.heart)}\n${f.n >= 124 ? '「내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었나이다」(창 30:30)' : '양 떼를 더 불리려면 풀밭을 번갈아 쉬게 하고, 봄마다 새끼를 꼭 받아요.'}\n\n훗날 이 라헬이 낳은 아들이 요셉이에요.`)],
      () => { if (first) { Game.insight && Game.insight(3, '창세기 야곱 편'); S().flags.dlcJacobDone = 1; } say([{ n: '', t: '이야기가 끝났습니다. 고센의 불가로 돌아갈까요?', choices: [{ t: '아버지 곁으로 돌아가기', then: () => D.leave(() => { const j = npc('jacob'); if (j) G.Life.bubble('jacob', '…그 애가 네 어미다, 요셉아.', 4); }) }, { t: '하란을 조금 더 둘러보기' }] }], null); }); }); }

// ------------------------------------------------------------------ the land
const person = (id, name, look, x, z, face, o) => Object.assign({ id, name, look, x, z, face, talkR: 3, noBond: true }, o || {});
LAND = Ls.make({ key: 'dlcj', name: '하란 (아버지의 이야기)', BX: -40, BZ: 10, BY: 64, hours: 0, seed: 229, spawn: [OUT[0] + 2, OUT[1], Math.PI / 2], hello: ['', ''],
  people: [
    person('djShep', '하란의 목자', t(L0, { top: 0x8a7a5a, mantle: 0x5a4a3a }), WELL[0] - 3, WELL[1] + 2, 1.2, { prop: 'staff', show: () => on() && ch() < 3 }),
    person('djShep2', '하란의 목자', t(L0, { top: 0x7a6a4a }), WELL[0] - 4.5, WELL[1] - 1.5, 1.6, { show: () => on() && ch() < 3, chat: ['떼가 다 모여야 돌을 옮기는 법이오.', '저 돌은 혼자서는 못 굴려요.'] }),
    person('djRachel', '라헬', t(LW, { top: 0xc86a5a, clothCol: 0xe8dcc0, clothStripe: 0xc86a5a, fem: true, long: true, hair: 0x2a1810, hairStyle: 'long', age: undefined }), HOUSE[0] + 5, HOUSE[1] - 5, 2.4, { prop: 'staff', show: () => on() && ch() >= 1 }),
    person('djLaban', '라반', t(LJ0, { top: 0x5a6a4a, mantle: 0x3a4a3a, mantleTrim: 0xd8b060, trim: 0xd8b060, hair: 0x6a6058, beardCol: 0x8a8078, limp: false }), HOUSE[0] + 2, HOUSE[1] - 6.5, 2.8, { show: () => on() && ch() >= 2 }),
    person('djLeah', '레아', t(Ls.lookOf('leah') || LW, { age: undefined, hair: 0x3a2a20, top: 0x98708e }), HOUSE[0] + 7, HOUSE[1] - 3, 2.2, { show: () => on() && ch() >= 3, chat: ['동생은 양을 치고, 저는 집안일을 해요.', '(수줍게 고개를 숙인다)'] }),
    ...Array.from({ length: 12 }, (_, i) => ({ id: 'djSheep' + i, name: '양', animal: 'sheep', x: FOLD[0] + (i % 4) * 1.4 - 2, z: FOLD[1] + Math.floor(i / 4) * 1.4 - 1.4, face: i, wander: 2.5, noTalk: true, noTag: true, show: () => on() && (ch() >= 1) && i < Math.max(4, Math.min(12, Math.round((TY() ? TY().n : START) / 11))) }))],
  talk: {
    djShep(s) { if (ch() === 0) { atWell(); return true; } say([Ln('하란의 목자', ch() === 1 ? '저기 라헬이 오는군. 그런데 저 돌을 정말 혼자 옮기겠다고?' : '혼자서 그 돌을 굴리다니… 무슨 힘이 그리 났소?')], () => fin('djShep')); return true; },
    djLaban(s) { const c = ch(); if (c === 2) { wage(); return true; } if (c === 4) { wedding(); return true; }
      if (c === 3) { const T0 = TY(); say([Ln('라반', T0.trust >= 70 ? '네게 맡긴 뒤로 걱정이 없구나. 올해 셈은 ' + TARGET[T0.y - 1] + '마리다.' : T0.trust >= 40 ? '양은 잘 있느냐? 해가 가기 전에 ' + TARGET[T0.y - 1] + '마리는 되어야 한다.' : '요즘 양 떼가 시원찮구나. 내 딸을 얻으려면 더 힘써라.', T0.trust >= 70 ? 'happy' : '')], () => fin('djLaban')); return true; }
      say([Ln('라반', c >= 5 ? '칠 일을 채우거라. 그러면 라헬도 네게 주마.' : '어서 오너라, 내 누이의 아들아.')], () => fin('djLaban')); return true; },
    djRachel(s) { const c = ch(); if (c === 5) { rachel(); return true; } if (c === 3) { const T0 = TY(); if (T0.talked) { say([Ln('라헬', '오늘은 양들이 당신을 잘 따르네요.', 'happy')], () => fin('djRachel')); return true; } T0.talked = 1; T0.heart = clamp(T0.heart + 7, 0, 100);
        const L = [['우물가에서 처음 만난 날을 잊지 못할 거예요.', '나도 그날을 날마다 생각하오.'], ['일곱 해라니… 너무 길지 않나요?', '그대를 생각하면 며칠 같소.'], ['북쪽 풀밭은 봄에 제일 좋아요. 한 번 뜯기면 한 철은 쉬게 해야 해요.', '고맙소. 그대는 양을 나보다 잘 아는구려.'], ['아버지는 셈이 밝으세요. 양을 잃으면 꼭 물어내라 하실 거예요.', '잃은 것은 내가 채워 넣겠소.'], ['겨울 전에 꼴을 넉넉히 베어 두세요. 눈이 오면 풀밭에 못 나가요.', '그리하겠소.'], ['당신 고향 가나안은 어떤 곳이에요?', '아버지 이삭의 장막과 브엘세바의 우물이 있소. 언젠가 함께 갑시다.'], ['이제 얼마 남지 않았어요.', '그대를 위한 일곱 해가 벌써 다 가는구려.']][Math.min(6, T0.y - 1)];
        say([Ln('라헬', L[0], 'tender'), J(L[1], '', 'tender')], () => { fin('djRachel'); pop('라헬의 마음이 자랐어요', `라헬의 마음 ${Math.round(T0.heart)}`, 'star'); G.UI.quest(); }); return true; }
      say([Ln('라헬', c >= 6 ? '이제는 날마다 함께예요.' : '아버지께서 기다리세요. 어서 가 보세요.', 'happy')], () => fin('djRachel')); return true; } },
  ctx(s, lx, lz) { const out = [], c = ch(), near = (p, r) => Math.hypot(p[0] - lx, p[1] - lz) < (r || 3), at = (p, o) => Object.assign({ x: LAND.stage().x + p[0], z: LAND.stage().z + p[1], y: 1.1, noMagnet: true }, o);
    if (near(OUT, 3.6)) out.push(at(OUT, { d: 0.5, label: '이야기에서 나오기 (고센으로)', key: 'djOut', use: () => say([{ n: '', t: '아버지의 이야기를 잠시 멈추고 고센으로 돌아갈까요? 여기까지 한 것은 남아요.', choices: [{ t: '돌아가기', then: () => D.leave() }, { t: '더 듣기' }] }], null) }));
    if (c === 1 && near(WELL, 3.6)) out.push(at(WELL, { d: -1, label: '우물 아귀의 돌 굴리기', key: 'djStone', use: rollStone }));
    if (c !== 3) return out; const T0 = TY();
    if (near(WELL, 3.6)) out.push(at(WELL, { d: -0.5, label: `물 길어 구유 채우기 (물 ${Math.round(T0.water)}%)`, key: 'djWater', disabled: T0.water >= 95, use: () => { if (noAp(T0)) return; const fill = () => { T0.water = 100; sfx('splash', { vol: 0.5 }); pop('구유를 가득 채웠어요', '양들이 줄지어 물을 마셔요', 'star'); use(T0); };
        if (!T0.wellY) { T0.wellY = 1; G.UI.minigame('push', { title: '우물 돌 굴리기', hint: '올해 첫 물이에요. 꾹 눌러 밀어요.', btn: '꾹 눌러 밀기' }, ok => { if (ok) fill(); else G.UI.toast('돌이 안 움직여요 · 다시 해 봐요'); if (!ok) T0.wellY = 0; }); } else fill(); } }));
    PAST.forEach((p, i) => { if (Math.abs(lx - p.x) < p.w / 2 + 2 && Math.abs(lz - p.z) < p.d / 2 + 2 && T0.at !== i) out.push(at([p.x, p.z], { x: P().x, z: P().z, d: 0.2, label: T0.se === 3 ? `${p.n} · 겨울엔 눈이 덮여요` : `양 떼를 ${p.n}으로 몰기 (풀 ${Math.round(T0.grass[i])}%)`, key: 'djPast' + i, disabled: T0.se === 3,
      use: () => { if (noAp(T0)) return; const g = T0.grass[i], gain = Math.round(g / 100 * 20); T0.hp = clamp(T0.hp + gain - (g < 35 ? 6 : 0), 5, 100); T0.grass[i] = clamp(g - 42, 0, 100); T0.grazed |= 1 << i; T0.at = i; flockAt(T0); sfx('rustle', { vol: 0.5 });
        pop(g < 35 ? '풀이 거의 없어요' : `${p.n}에서 풀을 뜯겨요`, g < 35 ? '양들이 배를 못 채웠어요 · 이 풀밭은 쉬게 해요' : `기운 +${gain} · 이 풀밭은 한두 철 쉬어야 다시 자라요`, g < 35 ? 'moon' : 'star'); use(T0); } })); });
    if (near(FOLD, 5)) { const lamb = T0.se === 0 && !T0.lambed;
      out.push(at(FOLD, { d: 0.1, label: lamb ? '우리에서 새끼 받기 (봄)' : '우리에서 양 돌보기', key: 'djTend', use: () => { if (noAp(T0)) return; T0.tended = 1; T0.hp = clamp(T0.hp + 8, 5, 100);
        if (lamb) { T0.lambed = 1; const b = Math.max(1, Math.round(T0.n * 0.22 * T0.hp / 100)); T0.n += b; sfx('craft'); pop(`새끼 양 ${b}마리가 태어났어요!`, `양 ${T0.n}마리 · 어미가 기운이 좋을수록 많이 낳아요`, 'star'); } else pop('아픈 양을 돌봤어요', `기운 ${Math.round(T0.hp)}%`, 'star'); use(T0); } }));
      if (T0.ev === 'wolf' && !T0.guard) out.push(at(FOLD, { d: -0.3, label: '밤새 양 떼 지키기 (늑대)', key: 'djGuard', use: () => { if (noAp(T0)) return; G.UI.minigame('wrestle', { title: '늑대를 쫓아라', hint: '「밤에는 추위를 당하며 눈 붙일 겨를도 없이」(창 31:40) · 초록 칸에서 눌러 지팡이로 쫓아요.', need: 5, dur: 30 }, ok => { T0.guard = 1; if (ok) { sfx('hit'); pop('늑대를 쫓아냈어요', '양을 한 마리도 잃지 않았어요', 'star'); T0.trust = clamp(T0.trust + 3, 0, 100); } else { const k = Math.min(T0.n - 5, 2); T0.n -= k; pop('늑대가 두 마리를 물어 갔어요', '「물려 찢긴 것은 내가 스스로 보충하였으며」(창 31:39)', 'moon'); } use(T0); }); } })); }
    if (near(SHED, 3.6) && (T0.se === 0 || T0.se === 1)) out.push(at(SHED, { d: 0, label: T0.sheared ? '양털 깎기 · 올해는 다 깎았어요' : '양털 깎기', key: 'djShear', disabled: !!T0.sheared, use: () => { if (noAp(T0)) return; G.UI.minigame('rhythm', { title: '양털 깎기', hint: '박자가 줄에 닿을 때 눌러 가위질해요.', need: 8, beats: 14 }, ok => { T0.sheared = 1; const w = Math.round(T0.n * (ok ? 0.5 : 0.3)); T0.wool += w; T0.trust = clamp(T0.trust + (ok ? 4 : 1), 0, 100); pop(`양털 ${w}뭉치를 깎았어요`, ok ? '라반이 흐뭇해해요' : '서툴러서 털이 많이 상했어요', 'star'); use(T0); }); } }));
    if (near(FIELD, 5) && T0.se !== 3) { const lab = T0.se === 2 ? (T0.sown ? '보리밭 · 씨를 뿌려 두었어요' : '보리 씨 뿌리기 (가을)') : T0.se === 0 ? (T0.sown ? '보리 거두기 (꼴 +60)' : '보리밭 · 지난가을에 씨를 안 뿌렸어요') : '들풀 베어 꼴 만들기 (꼴 +30)', dis = (T0.se === 2 && T0.sown) || (T0.se === 0 && !T0.sown);
      out.push(at(FIELD, { d: 0.2, label: lab, key: 'djField', disabled: !!dis, use: () => { if (noAp(T0)) return; if (T0.se === 2) { T0.sown = 1; pop('보리 씨를 뿌렸어요', '봄에 거두면 겨울 먹이가 돼요', 'star'); } else if (T0.se === 0) { T0.sown = 0; T0.hay += 60; pop('보리를 거뒀어요', `꼴 ${T0.hay} · 겨울 한 철에 40이 들어요`, 'star'); } else { T0.hay += 30; pop('꼴을 베어 말렸어요', `꼴 ${T0.hay}`, 'star'); } sfx('rustle'); use(T0); } })); }
    if (near([HOUSE[0] + 2, HOUSE[1] - 4], 3.4)) out.push(at([HOUSE[0], HOUSE[1] - 3.4], { d: 0.9, label: `한 철 마무리하기 (${SEA[T0.se]})`, key: 'djEnd', use: () => { const go = () => G.UI.fade(() => endSeason(), () => { }); if (T0.ap > 0) say([{ n: '', t: `일손이 ${T0.ap} 남았어요. 그래도 ${SEA[T0.se]}을 마칠까요?`, choices: [{ t: '마친다', then: () => setTimeout(go, 40) }, { t: '조금 더 일한다' }] }], null); else go(); } }));
    return out; },
  quest(s) { const c = ch(), T0 = TY(); if (c === 0) return [{ t: '야곱 편 · 우물 곁의 목자들과 이야기하기', ok: false }]; if (c === 1) return [{ t: '야곱 편 · 우물 아귀의 큰 돌 굴려 내기', ok: false }]; if (c === 2) return [{ t: '야곱 편 · 외삼촌 라반과 이야기하기 (집 앞)', ok: false }];
    if (c === 4) return [{ t: '야곱 편 · 칠 년이 찼어요 · 라반에게 말하기', ok: false }]; if (c === 5) return [{ t: '야곱 편 · 라헬에게 가기', ok: false }]; if (c >= 6) return [{ t: '야곱 편을 마쳤어요 · 서쪽 돌무더기에서 「이야기에서 나오기」', ok: true }];
    return [{ t: `라헬을 위한 ${T0.y}년째 · ${SEA[T0.se]} · 남은 일손 ${T0.ap}`, ok: false }, { t: `양 ${T0.n}마리 (기운 ${Math.round(T0.hp)}%) · 라반의 셈 ${TARGET[T0.y - 1]}마리`, ok: T0.n >= TARGET[T0.y - 1] },
      { t: `물구유 ${Math.round(T0.water)}% · 꼴 ${T0.hay}${T0.se === 3 ? '' : T0.hay < 40 ? ' (겨울에 40 필요)' : ''} · 양털 ${T0.wool}`, ok: T0.water > 45 }, { t: `풀밭 북 ${Math.round(T0.grass[0])} · 동 ${Math.round(T0.grass[1])} · 남 ${Math.round(T0.grass[2])}`, ok: !!T0.grazed || T0.se === 3 },
      { t: `라반의 신임 ${Math.round(T0.trust)} · 라헬의 마음 ${Math.round(T0.heart)}${T0.ev === 'wolf' && !T0.guard ? ' · 늑대!' : T0.ev === 'drought' ? ' · 가뭄' : T0.ev === 'plague' && !T0.tended ? ' · 앓는 양' : ''}`, ok: !(T0.ev === 'wolf' && !T0.guard) }]; },
  weather: { clear: 0.7, cloudy: 0.22, rain: 0.05, wind: 0.03, fog: 0, dust: 0, storm: 0 },
  floor: (lx, lz) => (Math.abs(lx) < 50 && Math.abs(lz) < 44 ? 64 : null),
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B, GR = 0xa4a06a, MUD = 0xc4a678, MUD2 = 0xa88a5e;
    box(100, 14, 88, 0, BY - 7, 0, GR); g.box(520, 1, 520, { at: [X, BY - 0.6, Z], c: 0x9a9864, j: 0.05 });
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 150 + rng() * 40; sph(26 + rng() * 14, Math.cos(a) * r, BY - 10, Math.sin(a) * r, [0x8a8a5a, 0x9a9664, 0x7e8250][i % 3], { s: [1.4, 0.5, 1], j: 0.06 }); }
    PAST.forEach((p, i) => { box(p.w, 0.05, p.d, p.x, BY + 0.015, p.z, [0x7e9a4a, 0x8a9a52, 0x76924a][i], { j: 0.06 }); cyl(0.05, 0.06, 1.5, 6, p.x - p.w / 2 + 1, BY + 0.75, p.z + (i === 1 ? -p.d / 2 + 1 : p.d / 2 - 1), 0x7a5a3a); box(0.8, 0.4, 0.06, p.x - p.w / 2 + 1, BY + 1.35, p.z + (i === 1 ? -p.d / 2 + 1 : p.d / 2 - 1), 0xc8a068); });
    box(3, 0.04, 20, 38, BY + 0.02, 34, 0x5a8aa0, { ry: 1.3, j: 0 }); /* the brook by the south pasture */
    cyl(1.5, 1.6, 0.8, 14, WELL[0], BY + 0.4, WELL[1], 0x9a9282); cyl(1.35, 1.35, 0.3, 14, WELL[0] + 1.9, BY + 0.2, WELL[1] + 1.2, 0x7a7468); colR(WELL[0], WELL[1], 1.7, BY + 1.2);
    for (const [dx, dz, ry] of [[3.4, -2.4, 0.3], [-1.6, 3.2, -0.5]]) { box(2.6, 0.5, 0.75, WELL[0] + dx, BY + 0.25, WELL[1] + dz, 0x8a7a62, { ry }); col(WELL[0] + dx, WELL[1] + dz, 2.3, 0.9, BY - 1, BY + 0.6); }
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, ox = Math.cos(a) * 4.2, oz = Math.sin(a) * 4.2, gate = k === 3; if (gate) { box(2.6, 0.9, 0.2, FOLD[0] - 2.9, BY + 0.45, FOLD[1] + oz, 0x7a5a3a); col(FOLD[0] - 2.9, FOLD[1] + oz, 2.6, 0.3, BY - 1, BY + 1); box(2.6, 0.9, 0.2, FOLD[0] + 2.9, BY + 0.45, FOLD[1] + oz, 0x7a5a3a); col(FOLD[0] + 2.9, FOLD[1] + oz, 2.6, 0.3, BY - 1, BY + 1); continue; }
      box(k % 2 ? 0.2 : 8.4, 0.9, k % 2 ? 8.4 : 0.2, FOLD[0] + ox, BY + 0.45, FOLD[1] + oz, 0x7a5a3a); col(FOLD[0] + ox, FOLD[1] + oz, k % 2 ? 0.3 : 8.4, k % 2 ? 8.4 : 0.3, BY - 1, BY + 1); }
    const house = (x, z, w, d, h, dome) => { box(w, h, d, x, BY + h / 2, z, MUD); box(w + 0.3, 0.22, d + 0.3, x, BY + h + 0.08, z, MUD2); if (dome) sph(Math.min(w, d) * 0.42, x, BY + h + 0.1, z, MUD, { s: [1, 0.85, 1] }); box(1.0, 1.8, 0.08, x, BY + 0.9, z - d / 2 - 0.03, 0x3a2818, { j: 0 }); col(x, z, w, d, BY - 1, BY + h + 0.3, true); };
    house(HOUSE[0], HOUSE[1], 8, 6, 3.4, 1); house(HOUSE[0] - 9, HOUSE[1] + 2, 5, 5, 3, 1); house(HOUSE[0] + 9, HOUSE[1] + 4, 5, 4, 2.8, 0);
    box(5, 0.12, 4, SHED[0], BY + 2.3, SHED[1], 0xb89a62); for (const [dx, dz] of [[-2.3, -1.8], [2.3, -1.8], [-2.3, 1.8], [2.3, 1.8]]) cyl(0.08, 0.09, 2.3, 6, SHED[0] + dx, BY + 1.15, SHED[1] + dz, 0x6a4a30); box(1.6, 0.5, 0.9, SHED[0], BY + 0.25, SHED[1] + 0.6, 0xe8e0d0, { j: 0.1 });
    box(14, 0.05, 9, FIELD[0], BY + 0.02, FIELD[1] + 4, 0xc8b060, { j: 0.08 }); for (let i = 0; i < 6; i++) box(13, 0.07, 0.25, FIELD[0], BY + 0.05, FIELD[1] + 0.6 + i * 1.4, 0x8a6a40);
    for (let i = 0; i < 5; i++) sph(0.42 + rng() * 0.15, OUT[0] - 1 + Math.cos(i * 1.3) * 0.7, BY + 0.25 + (i % 2) * 0.3, OUT[1] + Math.sin(i * 1.3) * 0.7, 0x9a9284, { s: [1.1, 0.75, 1] }); colR(OUT[0] - 1, OUT[1], 1.0, BY + 1);
    for (const [x, z] of [[-34, -30], [40, -34], [-40, 34], [44, 20], [-10, -38], [14, 40]]) { if (put('oak', x, z, { s: 1 }) || put('palm', x, z, { s: 1 })) colR(x, z, 0.5); } } });
D.add({ key: 'jacob', land: 'dlcj', hero: '야곱', outfit: 'dlcJacob', spawn: () => [OUT[0] + 2.5, OUT[1], Math.PI / 2],
  onEnter(s0) { S().time = 13; if (G.Weather && G.Weather.set) G.Weather.set('clear', 6); if (TY()) flockAt(TY()); },
  intro(s0) { if (!s0.ch) narr([D.card('창세기 29:1–2', '야곱 편 · 라헬을 위한 일곱 해', '야곱이 발행하여 동방 사람의 땅에 이르러 본즉, 들에 우물이 있고 그 곁에 양 세 떼가 누웠으니 이는 목자들이 그 우물에서 물을 양 떼에게 먹임이라. 큰 돌로 우물 아귀를 덮었다가…', '창세기 29:1–2'), D.card('아버지의 이야기', '젊은 야곱이 되어', '이 이야기 속에서 요셉은 젊은 날의 아버지 야곱이 되어 걸어요. 우물 곁의 목자들에게 말을 걸어 보세요.\n서쪽 돌무더기에서 언제든 「이야기에서 나오기」를 할 수 있어요.')]); else G.UI.toast('아버지의 이야기를 이어서 들어요'); } });
})(window.G);
