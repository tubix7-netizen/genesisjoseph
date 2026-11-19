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
