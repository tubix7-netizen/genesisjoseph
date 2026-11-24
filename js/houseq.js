/* 약속의 길 — v18.86 곁이야기 「나. 헤브론 · 다. 보디발의 집」 깊게 (houseq.js · prisonq.js 다음 · 바탕은 delights.js)
   부탁 하나 = 서로 다른 일 3~5가지 · 함께 하는 사람 · 기다림(진짜 시간) · 흔적. 한 부탁 안에서 같은 놀이를 두 번 쓰지 않아요.
   예전에는 다섯 부탁이 모두 「놀이 한 번」 또는 「요리 한 그릇」이었어요.
   나 ① 레아의 물들인 실(d_winnow 자리 · 예전 키질은 메인 이야기와 겹쳤어요): 우리 곁에서 깨끗한 털 고르기(세기) → 언덕에서 꼭두서니 뿌리 캐기(밀기)
        → 레아와 솥 곁에 앉아 실이 물들기를 기다리기 → 붉은 실 볕에 널기(리듬)                                흔적: 레아 장막 곁 붉은 실 타래
   나 ② 아버지의 고수 렌틸 수프(d_lentil): 아버지와 함께 걸어 고수 뜯기 → 수프 끓이기(요리) → 해 질 녘 아버지 곁에서 함께 먹기(기다림)
        → 장막 곁에 고수 씨 심기(리듬)                                                                          흔적: 야곱 장막 곁 고수 밭
   다 ③ 정원사의 물동이(d_garden): 막힌 물길 치우기(밀기) → 물동이 이고 대추야자에 물 주기(균형) → 해가 기울 때까지 정원사와 그늘에서 기다리기
        → 어린 대추야자 심기(리듬)                                                                               흔적: 연못 서쪽 어린 대추야자
   다 ④ 이피의 쥐와 고양이(d_store 자리 · 예전 창고 목록 외우기는 메인의 장부 일과 겹쳤어요): 갉힌 자루 살피기(고르기) → 쥐구멍 진흙으로 막기(세기)
        → 밤까지 창고에서 지켜보기 → 부엌 뒤 고양이에게 생선 대가리를 주고 창고로 데려오기(함께 걷기)          흔적: 창고 자루 위에서 자는 고양이
   다 ⑤ 요리사의 시험(d_cook): 마늘 찧기(리듬) → 생선 손질 · 소금(세기) → 소금이 배기를 기다리기 → 마늘 소금 생선구이(요리) → 잔치 상까지 이고 가기(균형)
   저장: S.flags.hq = { leah, lent, gard, ipi, cook } (각각 { s }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.d_winnow || !QS.d_lentil || !QS.d_garden || !QS.d_store || !QS.d_cook) return;
const E = k => { const s = S(), f = s.flags.hq || (s.flags.hq = {}); return f[k] || (f[k] = { s: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), toast = m => G.UI.toast(m), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e) => ({ n: nm(id), t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t });
const hAt = (x, z) => Game.W().heightAt(x, z), hour = () => S().time % 24;
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const ask = (q, right, wrong, then, again) => say([{ n: '', t: q, choices: [right].concat(wrong).sort(() => Math.random() - 0.5).map(c => ({ t: c[0], then: () => setTimeout(() => { if (c === right) then(); else say([T(c[1])], () => again && again()); }, 30) })) }], null);
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: () => (E(key).s | 0) >= k }));
const npcNear = (id, r) => { const n = Game.npc(id); return !!n && Math.hypot(n.x - P().x, n.z - P().z) < r; };
function walkWith(id, on0) { const n = Game.npc(id); if (!n) return; if (on0) { n.walk = null; n.sit = false; n._wd = n._wd || n.wander; n.wander = null; Game.npcFollow(id, true); } else Game.npcFollow(id, false); }
function standAt(id, q, face) { const n = Game.npc(id); if (!n) return; Game.npcFollow(id, false); n.walk = null; Game.npcTo(id, q[0], q[1], face || 0, false); n.wander = null; }
function sendHome(id) { const n = Game.npc(id); if (!n) return; Game.npcFollow(id, false); Game.npcWalk(id, n.d.x, n.d.z, () => { if (n._wd) n.wander = n._wd; }, 1.2); }
const fin = id => { const n = Game.npc(id); if (n) n.talking = false; };
const tidy = (id, extra) => { const q = QS[id]; delete q.repeat; q.start = function () { }; q.prog = extra.prog; Object.assign(q, extra); delete q.take; }; /* (the old one-game version started its game on taking the request) */
/* a real wait (time runs only while he stays near) — only forward within the day */
let WT = null;
function waitAt(key, at, r, secs, endH, done) { if (G.Overnight && G.Overnight.need(endH)) { const A = arguments; G.Overnight.ask(() => waitAt.apply(null, A)); return; } /* v18.93 a daytime hour already gone: sleep here, go on tomorrow */ const h = hour(); if (!(h >= 6 && h < endH)) { done(); return; } WT = { key, at, r, left: secs, rate: (endH - h) / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);

// ------------------------------------------------------------------ places
const WOOL = [184.6, 170], MADDER = [150, 180], DYE = [167, 155], LINE = [159.5, 157];   /* Hebron: by the fold, the hillside, by Leah's tent, the drying line */
const CORI = [160, 135], JSEAT = [172.5, 153], HERBP = [174, 144];                      /* the coriander, Jacob's seat, the new herb bed by his tent */
const CHAN = [-13.2, 58.5], PALMW = [-23, 53.4], POOLW = [-18, 62.2], SAPL = [-31, 58]; /* Potiphar's garden: the pool's inlet, the date palms, the shade, the new palm */
const SACKS = [-11.5, 64.6], HOLE = [-15.6, 67.6], WATCH = [-15.5, 63], CATK = [-15, 48.5]; /* the storeroom, its mouse hole, the kitchen's back */
const QUERN = [-12.3, 46.3], SALT = [-10.6, 47.2], HALLT = [-23, 43.4];                 /* the kitchen quern, the fish table, the feast table in the hall */

// ------------------------------------------------------------------ 나 ① 레아의 물들인 실
QS.d_winnow.title = '레아의 물들인 실';
tidy('d_winnow', {
  offer: [L('leah', '요셉아, 올봄 깎은 양털로 실을 자았는데, 꼭두서니로 붉게 물들이고 싶구나. 손이 모자라서…'), L('leah', '털부터 고르고, 언덕에서 뿌리를 캐고, 솥에서 하루 반나절은 지켜봐야 한단다. 도와주겠니?')],
  obj: stageObj('leah', [['양 우리 곁에서 깨끗한 털 고르기', 1], ['언덕에서 꼭두서니 뿌리 캐기', 2], ['레아와 솥 곁에 앉아 실이 물들기를 기다리기', 3], ['붉은 실을 볕에 널기', 4]]),
  loc: () => [{ x: WOOL[0], z: WOOL[1] }, { x: MADDER[0], z: MADDER[1] }, { x: DYE[0], z: DYE[1] }, { x: LINE[0], z: LINE[1] }][E('leah').s | 0] || 'npc:leah',
  prog: () => ['양 우리 곁에 깎아 둔 털이 있단다. 가시랑 검불은 골라내고.', '꼭두서니는 언덕 비탈에 붙어 자란단다. 뿌리가 붉지.', '솥 곁에 앉으렴. 서두르면 얼룩이 진단다.', '볕 좋은 데 널어야 색이 곱게 앉지.', '다 됐구나!'][Math.min(4, E('leah').s | 0)],
  done: [L('leah', '(붉은 실 한 가닥을 꼬아 요셉의 손목에 매어 주며) 곱구나. …라헬이 살아 있었으면 이 색을 좋아했을 게다.', 'tender'), J('어머니도 이렇게 실을 물들이셨나요?'), L('leah', '그 아이 손이 나보다 훨씬 고왔지. 너도 그 손을 닮았구나.', 'tender'), T('레아의 장막 곁 줄에 붉은 실 타래가 걸렸어요.')],
  reward: { silver: 6, items: { cloth: 1, bread: 2 }, xp: 22, heart: 1 } });
function leahWool() { mg('count', { title: '깨끗한 털 고르기', hint: '깎아 둔 털에서 가시와 검불을 떼어 내고 깨끗한 뭉치만 바구니에 담아요.', need: 6, btn: '한 뭉치', onPress: () => sfx('rustle', { vol: 0.4 }) },
  () => { E('leah').s = 1; G.UI.quest(); toast('털 한 바구니 · 이제 언덕에서 꼭두서니 뿌리를'); }); }
function leahMadder() { mg('push', { title: '꼭두서니 뿌리 캐기', hint: '돌밭 흙을 꾹 눌러 파헤쳐 붉은 뿌리를 끊기지 않게 뽑아요. 힘이 빠지면 잠깐 쉬어요.', btn: '파기' },
  () => { E('leah').s = 2; sfx('thud', { vol: 0.5, pitch: 0.8 }); G.UI.quest(); say([T('흙을 털어 내니 뿌리 속이 핏빛처럼 붉어요. 레아의 솥으로 가져가요.')]); }); }
function leahDye() { standAt('leah', [DYE[0] + 1.3, DYE[1] + 0.5], -1.6); const n = Game.npc('leah'); if (n) n.sit = true;
  say([L('leah', '뿌리를 찧어 솥에 넣고, 실을 담그고… 이제 불을 약하게 두고 기다리는 게다. 끓어 넘치면 색이 탁해지거든.'), T('레아 곁에 앉아 솥을 지켜요 · 자리를 뜨면 기다림이 멈춰요')],
    () => waitAt('leah', DYE, 4, 10, Math.min(19, hour() + 3), () => { E('leah').s = 3; G.UI.quest(); const n2 = Game.npc('leah'); if (n2) n2.sit = false; say([L('leah', '(막대로 실을 건져 올리며) 보렴, 붉게 들었다. 이제 볕에 널자.', 'happy')]); })); }
function leahLine() { mg('rhythm', { title: '붉은 실 널기', hint: '젖은 실 타래를 털어 박자에 맞춰 줄에 하나씩 걸어요.', need: 6, beats: 10, btn: '걸기' },
  () => { E('leah').s = 4; G.UI.quest(); sendHome('leah'); toast('붉은 실이 바람에 나부껴요 · 레아에게 말해요'); }); }

// ------------------------------------------------------------------ 나 ② 아버지의 고수 렌틸 수프
tidy('d_lentil', {
  offer: [L('jacob', '요셉아, 네 어미 라헬이 끓여 주던 렌틸 수프가 생각나는구나. 고수를 넣어 향긋했지…'), L('jacob', '고수는 우물 남쪽 들에 저절로 난단다. 이 늙은 다리로도 거기까지는 가 보고 싶구나. 같이 가자꾸나.')],
  obj: stageObj('lent', [['아버지와 함께 우물 남쪽 들에서 고수 뜯기', 2], ['고수 렌틸 수프 끓이기 (렌틸 + 고수 + 물)', 3], ['해 질 녘 아버지 곁에 앉아 함께 먹기', 4], ['아버지 장막 곁에 고수 씨 심기', 5]]),
  loc: () => { const k = E('lent').s | 0; if (k === 0) return 'npc:jacob'; if (k === 1) return { x: CORI[0], z: CORI[1] }; if (k === 2) return 'npc:jacob'; if (k === 3) return { x: JSEAT[0], z: JSEAT[1] }; if (k === 4) return { x: HERBP[0], z: HERBP[1] }; return 'npc:jacob'; },
  prog: () => ['가자꾸나, 요셉아. 천천히 걸어 다오.', '저기, 잎이 가늘게 갈라진 것이 고수다.', '렌틸은 내 장막에서 가져가거라. 물을 넉넉히 붓고.', '해가 지면 같이 먹자꾸나.', '씨를 심어 두면 내년에도 날 게다.', '고맙다, 내 아들아.'][Math.min(5, E('lent').s | 0)],
  done: [L('jacob', '(고수 밭을 내려다보며) 내년 이맘때 이 잎이 다시 나면, 오늘 저녁을 생각하마.', 'tender'), T('야곱의 장막 곁에 작은 고수 밭이 생겼어요.')],
  reward: { silver: 8, items: { cheese: 1, lentil: 2 }, xp: 26, heart: 1 } });
function lentGo() { const n = Game.npc('jacob'); if (n) { n.talking = false; n.sit = false; } E('lent').s = 1; walkWith('jacob', true); G.UI.quest(); toast('아버지가 지팡이를 짚고 뒤따라와요 · 천천히 걸어요'); }
function lentPick() { E('lent').s = 2; Game.give('coriander', 3, true); Game.give('lentil', 2, true); standAt('jacob', [CORI[0] + 1.4, CORI[1] - 0.6], -1.2); G.UI.quest();
  say([L('jacob', '(고수 잎을 비벼 냄새를 맡으며) …이 냄새다. 라헬은 늘 앞치마에 이 잎을 한 줌씩 넣고 다녔지.', 'tender'), L('jacob', '렌틸 두 줌 여기 있다. 수프는 네가 끓여 다오. 나는 먼저 장막으로 돌아가마.'), T('고수 셋 · 렌틸 둘을 받았어요 · 불가에서 「렌틸 + 고수 + 물」로 끓여요')], () => sendHome('jacob')); }
function lentSup() { if (!Game.have('corianderLentil', 1)) { toast('고수 렌틸 수프가 없어요 · 불가에서 끓여 와요'); return; } standAt('jacob', [JSEAT[0] - 1.4, JSEAT[1] - 0.4], 1.4); const n = Game.npc('jacob'); if (n) n.sit = true;
  say([L('jacob', '해가 지려면 아직이구나. 여기 앉아 함께 기다리자.'), T('아버지 곁에 앉아 해 질 녘을 기다려요 · 자리를 뜨면 기다림이 멈춰요')],
    () => waitAt('lent', JSEAT, 4, 10, 18.4, () => { Game.take('corianderLentil', 1); sfx('pickup', { vol: 0.4 }); E('lent').s = 4; G.UI.quest();
      say([T('노을 아래 둘이 수프를 나눠 먹어요.'), L('jacob', '…그래, 바로 이 맛이다. 베냐민을 낳고 길에서 떠난 네 어미를 나는 에브랏 길가에 묻었지. 그날 이후로 이 수프를 먹어 본 적이 없구나.', 'sad'), J('아버지, 고수 씨를 심어 두겠어요. 해마다 끓여 드릴게요.', 'tender')]); })); }
function lentSeed() { mg('rhythm', { title: '고수 씨 심기', hint: '흙을 고르게 펴고 박자에 맞춰 씨를 한 줌씩 뿌린 뒤 가볍게 덮어요.', need: 6, beats: 10, btn: '뿌리기' },
  () => { E('lent').s = 5; G.UI.quest(); toast('고수 씨를 심었어요 · 아버지께 말해요'); }); }

// ------------------------------------------------------------------ 다 ③ 정원사의 물동이
tidy('d_garden', {
  offer: [L('gardener', '젊은이, 연못으로 들어오는 물길이 진흙에 막혀서 대추야자가 목말라하네. 허리가 말을 안 들어서…'), L('gardener', '물길을 트고, 물을 날라 주고, 해가 기울면 내가 아끼는 걸 하나 보여 주지.')],
  obj: stageObj('gard', [['연못 동쪽 막힌 물길 치우기', 1], ['물동이 이고 대추야자에 물 주기', 2], ['해가 기울 때까지 정원사와 그늘에서 기다리기', 3], ['어린 대추야자 심기', 4]]),
  loc: () => [{ x: CHAN[0], z: CHAN[1] }, { x: PALMW[0], z: PALMW[1] }, { x: POOLW[0], z: POOLW[1] }, { x: SAPL[0], z: SAPL[1] }][E('gard').s | 0] || 'npc:gardener',
  prog: () => ['물길 어귀가 진흙으로 막혔다네.', '흘리지 말고, 뿌리 둘레에 천천히 붓게.', '한낮에 물을 주면 볕이 다 마셔 버린다네. 해가 기울 때를 기다리지.', '이 어린 나무가 열매를 맺을 때쯤 자네는 어디 있을까.', '다 됐네!'][Math.min(4, E('gard').s | 0)],
  done: [L('gardener', '대추야자는 심은 사람이 열매를 못 볼 때도 있다네. 그래도 심지. 누군가는 먹을 테니까.', 'tender'), J('(이 집에서 내가 심은 것도 언젠가 열매를 맺을까.)'), T('연못 서쪽에 어린 대추야자 한 그루가 섰어요.')],
  reward: { silver: 8, items: { dates: 3 }, xp: 22 } });
function gardChan() { mg('push', { title: '물길 치우기', hint: '어귀에 쌓인 진흙을 꾹 눌러 퍼내요. 물이 다시 졸졸 흘러들 때까지.', btn: '퍼내기' }, () => { E('gard').s = 1; sfx('splash', { vol: 0.5 }); G.UI.quest(); toast('물길이 트였어요 · 물동이를 이고 대추야자로'); }); }
function gardWater() { mg('balance', { title: '물동이 이고 가기', hint: '찰랑이는 물동이를 머리에 이고 대추야자까지. 기울면 ◀ ▶ 로 바로잡아요.', dur: 12 },
  () => { E('gard').s = 2; sfx('splash', { vol: 0.4, pitch: 1.2 }); G.UI.quest(); standAt('gardener', [POOLW[0] + 1.3, POOLW[1] + 0.3], -1.8); say([L('gardener', '잘했네. 이제 저 그늘에 앉게. 해가 기울면 할 일이 있네.')]); }); }
function gardWait() { const n = Game.npc('gardener'); if (n) n.sit = true; say([T('연못가 그늘에 정원사와 나란히 앉아요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('gard', POOLW, 4, 10, 16.5, () => { E('gard').s = 3; G.UI.quest(); const n2 = Game.npc('gardener'); if (n2) n2.sit = false; standAt('gardener', [SAPL[0] + 1.2, SAPL[1] + 0.8], -2);
    say([L('gardener', '이제 볕이 누그러졌군. 이리 오게. 대추야자 밑동에서 떼어 낸 어린 싹이 있네. 자네가 심어 보게.')]); })); }
function gardPlant() { mg('rhythm', { title: '어린 대추야자 심기', hint: '구덩이에 싹을 세우고 박자에 맞춰 흙을 덮어 꾹꾹 밟아요.', need: 6, beats: 10, btn: '덮기' },
  () => { E('gard').s = 4; G.UI.quest(); sendHome('gardener'); toast('어린 대추야자를 심었어요 · 정원사에게 말해요'); }); }

// ------------------------------------------------------------------ 다 ④ 이피의 쥐와 고양이
QS.d_store.title = '이피의 쥐와 고양이';
tidy('d_store', {
  offer: [L('scribe', '창고 자루마다 구멍이 났소! 장부와 곡식이 맞지 않으니 누군가 밤마다 훔쳐 가는 게 틀림없소.'), L('scribe', '히브리 종, 네가 살펴보아라. 범인을 찾으면 장부에 네 이름을 적어 두지.')],
  obj: stageObj('ipi', [['창고에서 갉힌 자루 살피기', 1], ['벽 밑 구멍을 진흙으로 막기', 2], ['밤까지 창고에서 지켜보기', 3], ['부엌 뒤 고양이를 창고로 데려오기', 4]]),
  loc: () => { const k = E('ipi').s | 0; if (k === 0) return { x: SACKS[0], z: SACKS[1] }; if (k === 1) return { x: HOLE[0], z: HOLE[1] }; if (k === 2) return { x: WATCH[0], z: WATCH[1] }; if (k === 3) return Game.npc('hqCat') ? { x: SACKS[0], z: SACKS[1] } : { x: CATK[0], z: CATK[1] }; return 'npc:scribe'; },
  prog: () => ['자루를 보아라. 구멍이 어떻게 났는지.', '…쥐라고? 그럼 구멍부터 막아라.', '그래도 줄어든다면, 밤에 지켜보아라.', '고양이? …숫자로 안 되는 일이면 그렇게라도 해 보아라.', '어찌 되었느냐?'][Math.min(4, E('ipi').s | 0)],
  done: [L('scribe', '(장부를 덮으며) …고양이라. 숫자로는 안 되는 일도 있구려. 장부 끝에 「쥐 잡는 고양이 하나 · 히브리 종이 데려옴」이라고 적어 두겠소.'), L('scribe', '아메니 영감이 그대를 아끼는 까닭을 조금은 알겠구려.'), T('창고 자루 위에서 고양이가 몸을 말고 잠들었어요.')],
  reward: { silver: 12, xp: 24 } });
function ipiLook() { say([T('자루 밑동에 작은 구멍이 숭숭 나 있고, 곁에 곡식 껍질과 까만 똥이 흩어져 있어요.')], () => {
  const go = () => ask('누가 자루를 뚫었을까?', ['쥐 · 이빨로 갉은 들쭉날쭉한 구멍', ''], [['사람 · 칼로 벤 자국', '칼로 베었다면 자른 자리가 반듯해요. 이 구멍은 들쭉날쭉해요.'], ['자루가 낡아서 저절로 터짐', '낡아서 터졌다면 솔기를 따라 길게 갈라져요. 이건 둥근 구멍이에요.']],
    () => say([J('(쥐다. 사람을 의심할 일이 아니었어.)'), T('벽 밑에 주먹만 한 구멍이 보여요.')], () => { E('ipi').s = 1; G.UI.quest(); }), () => go()); go(); }); }
function ipiHole() { mg('count', { title: '쥐구멍 막기', hint: '진흙에 짚을 섞어 한 덩이씩 구멍에 채워 넣고 손바닥으로 눌러요.', need: 5, btn: '한 덩이', onPress: () => sfx('thud', { vol: 0.3, pitch: 1.4 }) },
  () => { E('ipi').s = 2; G.UI.quest(); toast('구멍을 막았어요 · 밤까지 창고에서 지켜봐요'); }); }
function ipiWatch() { say([T('자루 그늘에 몸을 낮추고 앉아 밤을 기다려요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('ipi', WATCH, 3.6, 10, 21, () => { E('ipi').s = 3; G.UI.quest(); sfx('rustle', { vol: 0.6 });
    narr({ t: '밤의 창고', s: '등잔이 꺼지자 지붕 들보를 타고 쥐 서너 마리가 내려와요. 막은 구멍이 아니라 위에서 오고 있었어요. 쫓아도 금세 다시 와요.' },
      () => say([J('(구멍을 다 막을 수는 없겠다. …부엌 뒤에 고양이가 있었지.)'), T('부엌 뒤로 가서 고양이를 데려와요 · 생선이 있으면 좋아요')])); })); }
function ipiCat() { const s = S(); const fish = Game.have('fish', 1); if (fish) Game.take('fish', 1);
  let c = Game.npc('hqCat'); if (!c) c = Game.spawnNPC({ id: 'hqCat', name: '부엌 고양이', animal: 'cat', x: CATK[0] + 0.8, z: CATK[1] + 0.6, face: 0, noTalk: true, noTag: true, noBond: true, show: () => true });
  if (c) { Game.npcFollow('hqCat', true); }
  say([T(fish ? '생선을 내밀자 고양이가 냄새를 맡더니 냉큼 받아먹어요. 꼬리를 세우고 뒤를 따라와요.' : '요리사가 던져 준 생선 대가리를 내밀자 고양이가 냉큼 받아먹어요. 꼬리를 세우고 뒤를 따라와요.')], () => { E('ipi').cat = 1; G.UI.quest(); toast('고양이가 따라와요 · 창고로'); }); void s; }

// ------------------------------------------------------------------ 다 ⑤ 요리사의 시험
tidy('d_cook', {
  offer: [L('cook', '타! 히브리 젊은이, 오늘 저녁 주인님 상에 생선을 올리는데, 자네 손맛 좀 보자고.'), L('cook', '마늘 찧고, 생선 손질하고, 소금이 밸 때까지 기다렸다가 굽는 거야. 그리고 잔치 상까지 한 방울도 안 흘리고 들고 가야지!')],
  obj: stageObj('cook', [['맷돌 곁에서 마늘 찧기', 1], ['생선 손질하고 소금 뿌리기', 2], ['소금이 배기를 기다리기', 3], ['마늘 소금 생선구이 굽기 (생선 + 마늘 + 소금)', 4], ['잔치 상까지 이고 가 올리기 (회랑)', 5]]),
  loc: () => { const k = E('cook').s | 0; if (k === 0) return { x: QUERN[0], z: QUERN[1] }; if (k <= 2) return { x: SALT[0], z: SALT[1] }; if (k === 3) return 'npc:cook'; if (k === 4) return { x: HALLT[0], z: HALLT[1] }; return 'npc:cook'; },
  prog: () => ['마늘은 곱게! 덩어리 지면 쓴맛이 나.', '비늘은 꼬리에서 머리 쪽으로 긁어.', '소금이 살에 스며들 때까지 손대지 마!', '불은 세게, 짧게. 겉은 바삭 속은 촉촉!', '흘리면 다시 구워야 해!', '어때?'][Math.min(5, E('cook').s | 0)],
  done: [L('cook', '주인님이 한 점 드시고 「누가 구웠느냐」 물으시더군. 자네라고 했지!', 'happy'), L('cook', '자, 커민이랑 고수 가져가게. 이걸로 뭘 만들지는 자네 몫이야.')],
  reward: { silver: 12, items: { cumin: 2, coriander: 2 }, xp: 26 } });
function cookGarlic() { mg('rhythm', { title: '마늘 찧기', hint: '맷돌 공이로 박자에 맞춰 마늘을 곱게 찧어요.', need: 6, beats: 10, btn: '찧기' }, () => { E('cook').s = 1; Game.give('garlic', 1, true); G.UI.quest(); toast('알싸한 냄새! · 이제 생선 손질'); }); }
function cookFish() { mg('count', { title: '생선 손질', hint: '비늘을 긁고 배를 갈라 씻은 뒤 소금을 고루 뿌려요.', need: 6, btn: '한 손질', onPress: () => sfx('step', { surf: 'stone', vol: 0.3, pitch: 1.6 }) },
  () => { E('cook').s = 2; G.UI.quest(); say([L('cook', '좋아. 이제 소금이 밸 때까지 기다려. 그동안 화덕 곁에 앉아 있어도 돼.')]); }); }
function cookWait() { say([T('소금 친 생선 곁에 앉아 기다려요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('cook', SALT, 3.6, 8, Math.min(18, hour() + 2), () => {
  E('cook').s = 3; Game.give('fish', 1, true); if (!Game.have('salt', 1)) Game.give('salt', 1, true); G.UI.quest(); say([L('cook', '됐어! 소금이 꼭 알맞게 뱄네. 이제 구워 봐. 생선 · 마늘 · 소금!')]); })); }
function cookServe() { if (!Game.have('garlicFish', 1)) { toast('마늘 소금 생선구이가 없어요 · 불가에서 구워 와요'); return; }
  mg('balance', { title: '잔치 상까지 이고 가기', hint: '뜨거운 생선 쟁반을 머리에 이고 회랑까지. 기울면 ◀ ▶ 로 바로잡아요.', dur: 11 }, () => { Game.take('garlicFish', 1); E('cook').s = 5; sfx('pickup', { vol: 0.5 }); G.UI.quest(); toast('잔치 상에 올렸어요 · 요리사에게 말해요'); }); }

// ------------------------------------------------------------------ 행동 단추
Game.CTX.push(function (s) { const p = P(); if (!s || p.ride || p.act || Game.cineOn || G.UI.busy() || (s.q && s.q.riding)) return null; const out = [];
  const at = (pt, r, label, key, use) => { if (!pt) return; const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  if (on('d_winnow')) { const k = E('leah').s | 0; if (k === 0) at(WOOL, 3.6, '깨끗한 털 고르기', 'hqL0', leahWool); if (k === 1) at(MADDER, 4, '꼭두서니 뿌리 캐기', 'hqL1', leahMadder); if (k === 2 && !waiting('leah')) at(DYE, 3.6, '레아와 솥 곁에 앉기', 'hqL2', leahDye); if (k === 3) at(LINE, 3.4, '붉은 실 널기', 'hqL3', leahLine); }
  if (on('d_lentil')) { const k = E('lent').s | 0, j = Game.npc('jacob'); if (k === 0 && j && j.vis && Math.hypot(j.x - p.x, j.z - p.z) < 3) at([j.x, j.z], 3, '아버지와 고수 뜯으러 가기', 'hqJ0', lentGo); if (k === 1 && npcNear('jacob', 8)) out.push({ d: -0.6, x: CORI[0], z: CORI[1], y: 0.6, label: '고수 뜯기', key: 'hqJ1', story: true, noMagnet: true, anim: 'gather', dur: 0.7, hits: 3, fn: lentPick, _at: CORI }); if (k === 3 && !waiting('lent')) at(JSEAT, 3.6, '아버지 곁에 앉아 저녁 기다리기', 'hqJ3', lentSup); if (k === 4) at(HERBP, 3, '고수 씨 심기', 'hqJ4', lentSeed); }
  if (on('d_garden')) { const k = E('gard').s | 0; if (k === 0) at(CHAN, 3, '막힌 물길 치우기', 'hqG0', gardChan); if (k === 1) at(PALMW, 3.4, '물동이 이고 대추야자에 물 주기', 'hqG1', gardWater); if (k === 2 && !waiting('gard')) at(POOLW, 3.4, '정원사와 그늘에 앉기', 'hqG2', gardWait); if (k === 3) at(SAPL, 3.4, '어린 대추야자 심기', 'hqG3', gardPlant); }
  if (on('d_store')) { const k = E('ipi').s | 0; if (k === 0) at(SACKS, 2.6, '갉힌 자루 살피기', 'hqI0', ipiLook); if (k === 1) at(HOLE, 2.4, '쥐구멍 막기', 'hqI1', ipiHole); if (k === 2 && !waiting('ipi')) at(WATCH, 3, '밤까지 지켜보기', 'hqI2', ipiWatch); if (k === 3 && !E('ipi').cat) at(CATK, 3.4, '고양이에게 생선 주기', 'hqI3', ipiCat); }
  if (on('d_cook')) { const k = E('cook').s | 0; if (k === 0) at(QUERN, 2.6, '마늘 찧기', 'hqC0', cookGarlic); if (k === 1) at(SALT, 2.6, '생선 손질하기', 'hqC1', cookFish); if (k === 2 && !waiting('cook')) at(SALT, 3, '소금 배기를 기다리기', 'hqC2', cookWait); if (k === 4) at(HALLT, 3.4, '잔치 상에 올리기', 'hqC4', cookServe); }
  /* the gather-anim button stands where the coriander grows, not where Joseph is */
  for (const o of out) if (o._at) { const d = Math.hypot(o._at[0] - p.x, o._at[1] - p.z); if (d > 3.4) o.hide = true; }
  const vis = out.filter(o => !o.hide); return vis.length ? vis : null; });

// ------------------------------------------------------------------ 기다림 · 저절로 넘어가는 것
let tk = 0;
const up0 = EP.update; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play' || !s || !s.q || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try {
    if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); s.time = Game.clockTo(s, w.endH); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } }
    if ((tk -= d) > 0) return r; tk = 0.3; const hq = s.flags.hq || {};
    /* ② soup made → the supper waits · Jacob keeps walking with him to the coriander after a reload */
    if (on('d_lentil')) { const f = E('lent'); if (f.s === 2 && Game.have('corianderLentil', 1)) { f.s = 3; G.UI.quest(); toast('수프가 다 됐어요 · 해 질 녘 아버지 곁으로'); }
      if (f.s === 1) { const j = Game.npc('jacob'); if (j && !j.follow && !j.talking) walkWith('jacob', true); } }
    /* ⑤ fish grilled → to the feast table */
    if (on('d_cook')) { const f = E('cook'); if (f.s === 3 && Game.have('garlicFish', 1)) { f.s = 4; G.UI.quest(); toast('잘 구웠어요 · 회랑의 잔치 상으로 이고 가요'); } }
    /* ④ the cat follows to the storeroom, then curls up on the sacks · after: it sleeps there */
    { const f = hq.ipi || {}; let c = Game.npc('hqCat');
      if (on('d_store') && f.cat && (f.s | 0) === 3) { if (!c) { c = Game.spawnNPC({ id: 'hqCat', name: '부엌 고양이', animal: 'cat', x: p.x + 1, z: p.z + 1, face: 0, noTalk: true, noTag: true, noBond: true, show: () => true }); Game.npcFollow('hqCat', true); }
        if (c && Math.hypot(c.x - SACKS[0], c.z - SACKS[1]) < 3.2 && Math.hypot(p.x - SACKS[0], p.z - SACKS[1]) < 4) { Game.npcFollow('hqCat', false); Game.npcTo('hqCat', SACKS[0] + 0.6, SACKS[1] + 0.2, 1.2, false); c.sit = true; E('ipi').s = 4; G.UI.quest(); sfx('rustle', { vol: 0.5 });
          say([T('고양이가 자루 사이를 한 바퀴 돌더니 들보 쪽을 노려보며 웅크려요. 쥐들이 후다닥 흩어져요.'), T('서기관 이피에게 알려요')]); } }
      else if ((f.s | 0) >= 4 && !on('d_store')) { const near = Math.hypot(p.x - SACKS[0], p.z - SACKS[1]) < 60; if (near && !c) { c = Game.spawnNPC({ id: 'hqCat', name: '창고 고양이', animal: 'cat', x: SACKS[0] + 0.6, z: SACKS[1] + 0.2, face: 1.2, noTalk: true, noTag: true, noBond: true, show: () => true }); if (c) c.sit = true; } } }
  } catch (e) { console.error('houseq', e); }
  return r; };

// ------------------------------------------------------------------ 흔적
const MS = {}, MP = []; let mk = 0;
const mkM = (seed, fn) => { const g = new G.GB(seed); fn(g); return G.R.mesh(g); };
function meshes() {
  MS.yarn = mkM(951, g => { for (const s of [-1, 1]) g.cyl(0.04, 0.05, 1.7, 5, { at: [s * 1.1, 0.85, 0], c: 0x6a4a30 }); g.cyl(0.012, 0.012, 2.3, 4, { at: [0, 1.6, 0], rz: Math.PI / 2, c: 0x8a7a5a }); for (let i = 0; i < 5; i++) g.box(0.12, 0.55, 0.05, { at: [-0.8 + i * 0.4, 1.32, 0], c: [0xb02a28, 0xc0402c, 0x9a2420][i % 3], j: 0.05 }); });
  MS.herbs = mkM(952, g => { g.box(1.6, 0.06, 1.0, { at: [0, 0.03, 0], c: 0x6a5032 }); for (let i = 0; i < 14; i++) g.sph(0.09, 5, 4, { at: [-0.65 + (i % 7) * 0.22, 0.12, -0.25 + Math.floor(i / 7) * 0.5], s: [1, 1.4, 1], c: [0x5a9a3a, 0x6aaa48][i % 2], j: 0.1 }); });
  MS.palm = mkM(953, g => { g.cyl(0.07, 0.1, 0.9, 6, { at: [0, 0.45, 0], c: 0x8a6a48 }); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.box(0.08, 0.02, 0.8, { at: [Math.cos(a) * 0.32, 0.95, Math.sin(a) * 0.32], ry: -a + Math.PI / 2, rx: 0.5, c: 0x5a8a3a }); } g.cyl(0.4, 0.45, 0.08, 10, { at: [0, 0.04, 0], c: 0x5a4028 }); });
  MS.ok = 1; }
const put = (list, mesh, q, ry) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, q[0], hAt(q[0], q[1]), q[1], ry || 0, 0, 0, 1, 1, 1); list.push({ mesh, m, outline: true }); };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.hq) return; try { if (!MS.ok) meshes(); mk = 0; const hq = s.flags.hq, p = P(), within = (q, r) => Math.hypot(q[0] - p.x, q[1] - p.z) < (r || 70), g = k => (hq[k] && hq[k].s) | 0;
    if (g('leah') >= 4 && within(LINE)) put(list, MS.yarn, LINE, 0.3);
    if (g('lent') >= 5 && within(HERBP)) put(list, MS.herbs, HERBP, 0.25);
    if (g('gard') >= 4 && within(SAPL)) put(list, MS.palm, SAPL, 0.6);
  } catch (e) { console.error('houseq dyn', e); } };
G.HouseQ = { E, WT: () => WT };
})(window.G);
