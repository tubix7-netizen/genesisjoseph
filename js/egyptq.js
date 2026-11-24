/* 약속의 길 — v18.84 곁이야기 「마. 총리 시절 애굽」 깊게 (egyptq.js · goshenq.js 다음)   설계표_곁이야기_v18_80.md
   부탁 하나 = 서로 다른 일 3~5가지 · 함께 하는 사람 · 기다림(진짜 시간) · 흔적. 한 부탁 안에서 같은 놀이를 두 번 쓰지 않아요.
   ① 왕의 사냥꾼과 첫 사냥(e_hunt): 흔적 읽기(고르기) → 올무 매듭(리듬) → 갈대 뒤에서 밤까지 기다리기 → 올무에 걸린 가젤을 물매로 → 농부와 울타리(밀기)
   ② 우니의 가마(d_brick 자리): 땔감 쌓기(균형) → 불 지피기(밀기) → 밤새 불 지키기(기다림) → 그릇 꺼내기(세기) → 머리에 이고 장터 좌판에 펼치기
   ③ 티티의 그림 공책(x_photo): 그림 다섯 → 둘(피라미드 · 거위) → 티티를 수레에 태워(또는 함께 걸어) 강가로 → 바람에 종이 잡아 주기(균형) → 곁에서 기다림 → 그림판 세우기
   ④ 곡식 수레(dl_grain · 옛 dl_west · dl_south · dl_pyr 셋을 하나로): 서쪽 나루 판자 고치기(밀기) → 서쪽 마을 → 피라미드 마을 빵 나누기(세기) → 남쪽 마을 줄 세우기(고르기)
   ⑤ 헤티의 낚시(l_fish): 미끼 캐기(세기) → 새벽까지 강가에서 기다리기 → 낚기(낚시) → 손질(리듬)
   ⑥ 이네트의 땔감(l_axe): 손도끼 → 벨 나무 고르기(고르기) → 한 그루 베기 → 장작 쪼개기(리듬) → 볕에 말리기(반나절)
   ⑦ 사부의 돌 깨기(l_hammer): 돌망치 → 돌결 읽기(고르기) → 정과 망치(겨루기) → 머리에 이어 나르기
   ⑧ 장터의 히브리 소년(dq_boy) + 물 떠다 주기 · 엘리압과 함께 걷다 나루 그늘에서 고향 이야기
   ⑨ 온 신전의 물음(dq_on) + 해 질 때까지 앞뜰에서 기다리기 · 등잔에 불 붙여 밤길로
   ⑩ 모자란 곡식 자루(dq_sack) + 밤에 곳간 뒤에 숨어 지켜보기 · 들키지 않게 뒤따라가기
   ⑪ 케티의 작은 바퀴(ketiQ) + 세넵카와 바퀴통 나무 고르기 · 작은 바퀴 함께 깎기
   ⑫ 총리의 유람 마차(coachQ) + 구리 테 두르기 · 케티를 태우고 남쪽 마을 아버지께 시험 주행
   저장: S.flags.eq = { hunt, kiln, titi, grain, fish, axe, ham, boy, on, sack, keti, coach } (각각 { s, … }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P, C = G.Combat;
const E = k => { const s = S(), f = s.flags.eq || (s.flags.eq = {}); return f[k] || (f[k] = { s: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c), toast = m => G.UI.toast(m);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e) => ({ n: nm(id), t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t });
const hAt = (x, z) => Game.W().heightAt(x, z), hour = () => S().time % 24, absT = () => (S().day | 0) * 24 + S().time; /* (time runs 6 → 30 within a day: count across days) */
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const ask = (q, right, wrong, then, again) => say([{ n: '', t: q, choices: [right].concat(wrong).sort(() => Math.random() - 0.5).map(c => ({ t: c[0], then: () => setTimeout(() => { if (c === right) then(); else say([T(c[1])], () => again && again()); }, 30) })) }], null);
const near = (p, r) => !!p && Math.hypot(P().x - p[0], P().z - p[1]) < r;
const spawn = (id, o) => { if (!Game.npc(id)) Game.spawnNPC(Object.assign({ id, noTalk: true, noTag: true, noBond: true }, o)); return Game.npc(id); };
const kill = id => { if (Game.npc(id)) { Game.npcFollow(id, false); Game.removeNPC(id); } };
function walkWith(id, on0) { const n = Game.npc(id); if (!n) return; if (on0) { n.walk = null; n.sit = false; n._wd = n._wd || n.wander; n.wander = null; Game.npcFollow(id, true); } else Game.npcFollow(id, false); }
function standAt(id, q, face) { const n = Game.npc(id); if (!n) return; Game.npcFollow(id, false); n.walk = null; Game.npcTo(id, q[0], q[1], face || 0, false); n.wander = null; }
function sendHome(id) { const n = Game.npc(id); if (!n) return; Game.npcFollow(id, false); const hx = n.d.x, hz = n.d.z; Game.npcWalk(id, hx, hz, () => { if (n._wd) n.wander = n._wd; }, 1.6); }
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: () => (E(key).s | 0) >= k }));
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
let LOAD = null; const setLoad = k => { LOAD = k; const p = P(); if (k) p.carry = 'head'; else if (p.carry === 'head') p.carry = null; };
/* a real wait (time runs only while he stays near) */
let WT = null;
function waitAt(at, r, secs, hours, done, endH) { WT = { at, r, left: secs, rate: hours / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);
const bub = (id, t) => { if (G.Life.bubble && Game.npc(id)) G.Life.bubble(id, t, 2.8); };
const fin = id => { const n = Game.npc(id); if (n) n.talking = false; };
const past = (o, k) => (o.indexOf(S().step) >= o.indexOf(k));

// ------------------------------------------------------------------ ① 왕의 사냥꾼과 첫 사냥
const FIELD = [48, -40], SNARE = [53, -35], BLIND = [44, -33], FENCE = [45, -45];
{ const q0 = QS.e_hunt || {};
  QS.e_hunt = Object.assign({}, q0, { title: '왕의 사냥꾼과 첫 사냥',
    offer: ['총리 나으리, 동쪽 들의 밀밭을 밤마다 무언가 헤집어 놓습니다. 농부 페피가 울상이지요.', '저와 함께 가 보시겠습니까? 먼저 흔적을 읽고, 올무를 놓고, 밤을 기다리는 겁니다. 이 물매도 드리지요. 목자 출신이시라니 금방 손에 익으실 겁니다.'],
    start(s) { if (q0.start) q0.start(s); const f = E('hunt'); f.s = 0; walkWith('hunterE', true); },
    obj: stageObj('hunt', [['동쪽 밭에서 짐승 흔적 읽기 (세넵과 함께)', 1], ['울타리 틈에 올무 놓기', 2], ['갈대 뒤에 숨어 밤까지 기다리기', 3], ['올무에 걸린 짐승을 물매로', 4], ['농부 페피와 무너진 울타리 고치기', 5]]),
    loc: () => { const k = E('hunt').s | 0; return [{ x: FIELD[0], z: FIELD[1] }, { x: SNARE[0], z: SNARE[1] }, { x: BLIND[0], z: BLIND[1] }, { x: SNARE[0], z: SNARE[1] }, { x: FENCE[0], z: FENCE[1] }][k] || 'npc:hunterE'; },
    prog: () => ['동쪽 밭으로 가시지요. 발자국부터 봐야 합니다.', '들어온 길목이 저 울타리 틈입니다. 거기 올무를 놓지요.', '해가 지면 옵니다. 갈대 뒤에 몸을 낮추고 기다리십시오.', '지금입니다! 올무에 걸렸습니다. 물매로!', '페피의 울타리도 손봐 주시지요. 짐승이 또 들지 않게.', '다 되었습니다, 나으리.'][Math.min(5, E('hunt').s | 0)],
    done: [L('hunterE', '흔적을 읽고, 기다리고, 한 번에 맞히셨습니다. 목자의 눈이 사냥꾼의 눈이군요.', 'happy'), L('hunterE', '이제 물매와 활 만드는 법도 아시게 될 겁니다. 메뉴 → 장비에서 만들 수 있습니다.'), T('페피의 밭 울타리 틈에는 새 기둥이 섰어요.')],
    finish() { sendHome('hunterE'); kill('ehFarmer'); } }); }
function huntTracks() { say([L('hunterE', '보십시오. 밀 이삭이 이렇게 뜯겨 나갔습니다. 그리고 여기, 발자국이요.'), T('부드러운 흙에 작고 뾰족하게 둘로 갈라진 굽 자국이 찍혀 있어요. 뛴 자국은 길고 가벼워요.')],
  () => { const go = () => ask('무슨 짐승의 발자국일까?', ['가젤 · 작고 뾰족하게 갈라진 굽', ''], [['나귀 · 둥글고 통으로 된 굽', '세넵: 나귀라면 굽이 둥글고 통으로 찍힙니다. 다시 보시지요.'], ['하이에나 · 발톱이 박힌 넓은 발', '세넵: 하이에나라면 발톱 자국이 보이지요. 이건 굽입니다.']],
      () => say([L('hunterE', '그렇습니다, 가젤입니다. 밤에 저 울타리 틈으로 들어오지요.', 'happy')], () => { E('hunt').s = 1; G.UI.quest(); }), () => go()); go(); }); }
function huntSnare() { mg('rhythm', { title: '올무 매듭 짓기', hint: '박자에 맞춰 힘줄 끈을 감고 매듭을 지어요. 세넵이 고리를 잡아 줘요.', need: 6, beats: 10, btn: '감기' }, () => { E('hunt').s = 2; sfx('rustle'); G.UI.quest(); say([L('hunterE', '좋습니다. 이제 해가 지기를 기다려야지요. 저 갈대 뒤로 가시지요.')]); }); }
function huntWait() { const f = E('hunt'); WT = null; waitAt(BLIND, 4.5, 10, 6, () => { const a = C && C.spawn ? C.spawn('gazelle', SNARE[0] + 0.4, SNARE[1] + 0.3) : null; if (a) { a.home = [SNARE[0], SNARE[1]]; C.stun && C.stun(a, 60); f.wid = a.id; }
    f.k0 = (S().hero.kills.gazelle | 0); f.s = 3; sfx('rustle', { vol: 0.8 }); G.UI.quest(); say([L('hunterE', '(속삭이며) …걸렸습니다! 올무에 가젤이 걸렸어요. 지금입니다, 물매로!', 'awe')]); }, 21.5); WT.key = 'hunt'; toast('갈대 뒤에 몸을 낮추고 기다려요 · 세넵이 곁에 있어요'); }
function huntFence() { mg('push', { title: '울타리 기둥 세우기', hint: '페피가 기둥을 잡는 동안 꾹 눌러 흙을 다져요. 힘이 빠지면 잠깐 쉬어요.', btn: '흙 다지기' }, () => { E('hunt').s = 5; sfx('thud'); G.UI.quest(); walkWith('hunterE', false); standAt('hunterE', [FENCE[0] + 2, FENCE[1] + 1.5], -1.2);
  say([L('ehFarmer', '이제 됐습니다! 총리님께서 손수 울타리를 세워 주시다니… 올해 밀은 제대로 거두겠습니다.', 'happy'), T('세넵에게 말을 걸어 마쳐요.')]); }); }

// ------------------------------------------------------------------ ② 우니의 가마 (예전 「벽돌 나르기」 · 5장 메인의 벽돌과 겹쳐 바꿨어요)
const KILN = [-44, -112], STALL = [-20.2, -70.2];
{ const q0 = QS.d_brick || {};
  QS.d_brick = { giver: 'brick', title: '우니의 가마', when: q0.when || (s => past(Game.stepOrder(), 'c5_patrol')),
    offer: ['총리 나으리! 벽돌 말고도 저는 흙그릇을 굽습니다. 내일이 장날인데 가마를 혼자 지키기가 벅차서요.', '땔감을 쌓고, 해 질 녘에 불을 지펴서, 밤새 불을 지켜야 합니다. 새벽에 꺼내 장터에 펼치면 끝이지요. 함께해 주시겠습니까?'],
    start() { E('kiln').s = 0; },
    obj: stageObj('kiln', [['가마 아궁이에 땔감 쌓기', 1], ['해 질 녘에 불 지피기', 2], ['우니와 밤새 불 지키기', 3], ['식은 가마에서 그릇 꺼내기', 4], ['그릇을 이고 장터 좌판에 펼치기', 5]]),
    loc: () => { const k = E('kiln').s | 0; return k < 4 ? { x: KILN[0] + 2, z: KILN[1] - 1 } : k === 4 ? { x: STALL[0], z: STALL[1] } : 'npc:brick'; },
    prog: () => ['마른 대추야자 잎과 장작을 고르게 쌓아야 불이 고루 돕니다.', '해가 기울면 불을 지핍시다.', '밤새 불이 약해지지 않게 지켜야지요. 저도 곁에 있겠습니다.', '가마가 식었습니다. 하나씩 조심히 꺼내 주십시오.', '장터로 가시지요. 제가 따라가겠습니다.', '보십시오, 벌써 사람들이 모입니다!'][Math.min(5, E('kiln').s | 0)],
    done: [L('brick', '이 그릇들, 나으리 손으로 꺼내신 거라고 하면 장터 사람들이 서로 사겠다고 할 겁니다. 허허.', 'happy'), T('우니의 좌판에는 이제 날마다 구운 그릇이 놓여요.')],
    finish() { sendHome('brick'); }, reward: q0.reward || { silver: 14, items: { clay: 2, straw: 2 }, xp: 20 } }; }
function kilnStack() { mg('balance', { title: '땔감 쌓기', hint: '마른 대추야자 잎과 장작을 아궁이에 고르게 쌓아요. 한쪽으로 쏠리면 불이 고루 안 돌아요.', dur: 9 }, () => { E('kiln').s = 1; sfx('rustle'); G.UI.quest(); bub('brick', '좋습니다! 해가 기울면 불을 지핍시다.'); }); }
function kilnLight() { mg('push', { title: '불 지피기', hint: '아궁이 불씨에 꾹 눌러 바람을 불어요. 숨이 차면 잠깐 쉬어요.', btn: '후 불기' }, () => { const f = E('kiln'); f.s = 2; sfx('fire'); S().time = Game.clockTo(S(), 18.5); G.UI.quest(); say([L('brick', '붙었습니다! 이제 새벽까지 불이 사그라지지 않게 지켜야 합니다. 우리 둘이 번갈아 지켜봅시다.', 'happy')]); }); }
function kilnNight() { const f = E('kiln'); waitAt(KILN, 6, 12, 10.5, () => { f.s = 3; G.UI.quest(); say([T('밤새 가마 불빛이 우니의 얼굴을 붉게 비췄어요. 새벽이 되자 불을 막고 가마가 식기를 기다렸어요.'), L('brick', '이제 꺼내 봅시다. 뜨거우니 조심히요.')]); }, 29.4); WT.key = 'kiln'; const u = Game.npc('brick'); if (u) { u.walk = null; u.act = 'sitg'; } toast('우니와 가마 곁에 앉아 밤새 불을 지켜요'); }
function kilnOut() { mg('count', { title: '그릇 꺼내기', hint: '식은 가마에서 그릇을 하나씩 꺼내 짚 위에 놓아요.', need: 6, btn: '하나 꺼내기', onPress: () => sfx('step', { surf: 'stone', vol: 0.4, pitch: 1.4 }) }, () => { const f = E('kiln'); f.s = 4; const u = Game.npc('brick'); if (u) u.act = null; setLoad('pots'); walkWith('brick', true); G.UI.quest(); pop('그릇을 머리에 였어요', '도성 장터 좌판으로 · 우니가 따라와요', 'star'); }); }
function kilnStall() { P().emote = { k: 'gather', t: 0, dur: 1.6 }; setLoad(null); sfx('craft'); setTimeout(() => { P().emote = null; E('kiln').s = 5; walkWith('brick', false); standAt('brick', [STALL[0] - 1.4, STALL[1] + 1.2], 0.8); G.UI.quest(); bub('brick', '자, 우니의 그릇 사세요!'); }, 1500); }

// ------------------------------------------------------------------ ③ 티티의 그림 공책 (다섯 → 둘 · 함께 그리러)
const RIVER3 = [-74, -121.5], BOARD = [-37.6, -64.2];
{ const X = G.Extras || {}, PH = X.PHOTO; if (Array.isArray(PH)) for (let i = PH.length - 1; i >= 0; i--) if (!['pyramid', 'goose'].includes(PH[i].id)) PH.splice(i, 1); /* the two she asks for now */
  const ph = () => ((S().flags.ex || {}).photo) || {}, q0 = QS.x_photo || {};
  if (PH) QS.x_photo = Object.assign({}, q0, { title: '티티의 그림 공책',
    offer: ['총리님! 저는 그림 그리는 걸 좋아해요. 근데 다리가 이래서 멀리 못 가요…', '피라미드랑 나일 거위를 보고 와 주실래요? 사진 모드에서 「찍기」를 누르면 제가 그대로 그려 볼게요.', '…그리고 언젠가는, 진짜 강가에 가서 직접 그려 보고 싶어요.'],
    start() { E('titi').s = 0; },
    obj: PH.map(p => ({ t: `${p.n} 찍기`, ok: () => !!ph()[p.id] })).concat(stageObj('titi', [['티티와 함께 강가 갈대밭으로 (수레에 태우거나 함께 걷기)', 2], ['바람에 종이 잡아 주며 티티 곁에서 기다리기', 3], ['티티의 집 담에 그림판 세우기', 4]])),
    loc: () => { const p = PH.find(q => !ph()[q.id]); if (p) return p.at(); const k = E('titi').s | 0; return k <= 1 ? (k === 0 ? 'npc:painter' : { x: RIVER3[0], z: RIVER3[1] }) : k === 2 ? { x: RIVER3[0], z: RIVER3[1] } : k === 3 ? { x: BOARD[0], z: BOARD[1] } : 'npc:painter'; },
    prog: () => { if (PH.some(q => !ph()[q.id])) return '사진 모드(동작 → 돌보기 → 사진 모드)에서 「찍기」를 눌러 주세요!'; const k = E('titi').s | 0; return ['우와… 정말 이렇게 생겼어요? 저… 직접 가서 그려 보고 싶어요. 데려가 주실래요?', '수레에 태워 주시면 좋겠어요. 성 밖에서 불러 주세요! 아니면 천천히 따라갈게요.', '바람이 종이를 자꾸 들어 올려요…', '그림을 우리 집 담에 세워 둘래요!', '이제 지나가는 사람들이 다 볼 수 있어요!'][Math.min(4, k)]; },
    done: [L('painter', '총리님, 오늘은 제 평생 가장 먼 나들이였어요. 거위가 물을 차고 나는 소리도 들었어요!', 'happy'), T('티티의 집 담에는 나일 강가 그림이 세워졌어요. 지나가는 사람들이 걸음을 멈추고 들여다봐요.')],
    finish() { const n = Game.npc('painter'); if (n) { Game.npcFollow('painter', false); S().q.cartPax === 'painter' && (S().q.cartPax = null); Game.npcTo('painter', n.d.x, n.d.z, n.d.face || 0, false); } } }); }
function titiGo() { const f = E('titi'); f.s = 1; walkWith('painter', true); G.UI.quest(); toast('티티가 지팡이를 짚고 따라와요 · 성 밖에서 수레를 부르면 태울 수 있어요'); }
function titiDraw() { mg('balance', { title: '바람에 종이 잡아 주기', hint: '강바람이 파피루스를 들어 올려요. 티티가 그리는 동안 종이 끝을 가운데로 잡아 줘요.', dur: 9 }, () => { const f = E('titi'); waitAt(RIVER3, 6, 8, 2.5, () => { f.s = 3; G.UI.quest(); walkWith('painter', true);
    say([L('painter', '다 그렸어요! 갈대랑, 거위랑, 물결이랑… 보세요!', 'happy'), T('티티를 데리고 도성 집으로 돌아가요.')]); }); WT.key = 'titi'; say([T('티티가 붓을 놀려요. 곁에 앉아 강바람을 맞으며 기다려요.')]); }); }
function titiBoard() { P().emote = { k: 'gather', t: 0, dur: 1.6 }; sfx('thud', { vol: 0.5 }); setTimeout(() => { P().emote = null; E('titi').s = 4; walkWith('painter', false); standAt('painter', [BOARD[0] - 1.2, BOARD[1] - 1], 0.4); G.UI.quest(); bub('painter', '우와, 진짜 그림 가게 같아요!'); }, 1500); }

// ------------------------------------------------------------------ ④ 곡식 수레 (셋을 하나로 · 마을마다 다른 일)
const FORD = [-97, -64.5];
const GORDER = ['west', 'pyr', 'south'], GNAME = { west: '서쪽 마을', pyr: '피라미드 일꾼 마을', south: '남쪽 마을' };
const dropOf = k => G.Errands && G.Errands.drop ? G.Errands.drop(k) : null;
for (const k of ['dl_west', 'dl_south', 'dl_pyr']) if (QS[k]) { const w0 = QS[k].when; QS[k].when = s => !!(s && s.side && s.side.act && s.side.act[k]) && (w0 ? w0(s) : true); } /* (the three old ones stay only for a save that has one running) */
QS.dl_grain = { giver: 'dlClerk', title: '곡식 수레 · 세 마을', when: s => !!(s.q && s.q.chariotOk) && !s.q.dlJob,
  offer: s => [`총리님! 서쪽 마을, 피라미드 일꾼 마을, 남쪽 마을에 ${(Game.stepOrder().indexOf(s.step) >= Game.stepOrder().indexOf('c6_dry')) ? '양식' : '씨앗 곡식'}을 보내야 합니다. 수레에 자루 셋을 실어 두었어요.`, '서쪽으로 가는 나루 판자가 지난 물에 무너졌다고 합니다. 가시는 길에 살펴 주세요. 마을마다 사정이 다르니 어귀의 깃발 앞에서 사람들 이야기를 들어 보세요.'],
  start() { const f = E('grain'); f.s = 0; toast('성 밖에서 수레를 불러 타요 · 서쪽 나루부터'); },
  obj: stageObj('grain', [['서쪽 나루의 무너진 판자 고치기', 1], ['수레로 서쪽 마을 어귀 깃발까지', 2], ['수레로 피라미드 일꾼 마을까지', 3], ['일꾼들과 빵 나누기', 4], ['수레로 남쪽 마을까지', 5], ['남쪽 마을 사람들 줄 세우기', 6]]),
  loc: () => { const k = E('grain').s | 0; if (k === 0) return { x: FORD[0], z: FORD[1] }; const d = dropOf(k <= 1 ? 'west' : k <= 3 ? 'pyr' : 'south'); return k >= 6 ? 'npc:dlClerk' : d ? { x: d[0], z: d[1] } : null; },
  prog: () => ['나루가 무너졌다니 걱정입니다. 판자를 먼저 손봐 주세요.', '서쪽 마을 어귀 깃발 앞에 수레를 세우세요.', '피라미드 일꾼 마을로요. 거기 일꾼들이 굶고 있답니다.', '일꾼들에게 빵을 나눠 주세요.', '마지막으로 남쪽 마을입니다.', '줄을 어떻게 세우실지 사람들이 기다립니다.', '다 다녀오셨군요!'][Math.min(6, E('grain').s | 0)],
  done: ['세 마을을 다 도셨군요! 나루도 고치셨다니, 이제 서쪽 길이 다시 열리겠습니다.', '장부에 적어 두겠습니다. 「총리가 손수 나누다」.'], reward: { silver: 30, xp: 30 } };
function grainFord() { mg('push', { title: '나루 판자 깔기', hint: '마을 사람들과 함께 무너진 판자를 들어 올려 말뚝에 걸어요. 꾹 눌러 밀다가 힘이 빠지면 잠깐 쉬어요.', btn: '들어 올리기' }, () => { E('grain').s = 1; sfx('thud'); G.UI.quest(); pop('나루를 고쳤어요', '수레로 서쪽 마을 어귀 깃발까지', 'star'); }); }
function grainBread() { mg('count', { title: '빵 나누기', hint: '줄지어 선 일꾼들에게 빵과 맥주를 한 몫씩 건네요.', need: 6, btn: '한 몫 건네기', onPress: () => sfx('pickup', { vol: 0.5 }) }, () => { E('grain').s = 4; G.UI.quest(); say([{ n: '피라미드 일꾼', t: '총리님 손에서 빵을 받다니! 오늘은 돌이 덜 무겁겠습니다.', e: 'happy' }], () => pop('남쪽 마을로', '수레로 남쪽 마을 어귀 깃발까지', 'star')); }); }
function grainLine() { const go = () => ask('곡식을 누구에게 먼저 나눌까?', ['기침하며 서 있는 노인부터', ''], [['힘센 장정들부터', '장정들이 앞에 서자 노인이 줄 밖으로 밀려났어요. 다시 생각해 봐요.'], ['먼저 온 순서대로', '맨 뒤에 선 노인은 해가 질 때까지 기다려야 해요. 다시 생각해 봐요.']],
    () => say([T('요셉은 기침하는 노인을 맨 앞에 세웠어요. 그 뒤로 아이를 안은 여인들, 그리고 장정들이 섰어요.'), { n: '남쪽 마을 노인', t: '나리… 이 늙은이를 먼저 챙겨 주시다니요.', e: 'cry' }], () => { E('grain').s = 6; G.UI.quest(); pop('세 마을을 다 돌았어요', '도성 곳간 서기 크눔호텝에게 돌아가요', 'star'); }), () => go()); go(); }

// ------------------------------------------------------------------ ⑤ 헤티의 낚시 · ⑥ 이네트의 땔감 · ⑦ 사부의 돌 깨기
const BANK = [-88.6, -40.6], MUD = [-84.5, -43], DEADT = [7, -27], INETO = [-10.5, -54.6], BOULDER = [-2.2, -73.6], SABUK = [-9.7, -72.6];
if (QS.l_fish) { const q0 = QS.l_fish; QS.l_fish = Object.assign({}, q0, {
    offer: ['총리님, 나일 고기 맛을 아시오? 직접 낚은 고기는 더 달다오.', '낚시는 낚싯대보다 기다림이오. 미끼를 캐고, 새벽 강에 서서, 물때를 기다리지. 내가 다 보여 드리리다.'],
    start(s) { if (q0.start) q0.start(s); E('fish').s = 0; walkWith('ct_fish', true); },
    obj: stageObj('fish', [['강가 진흙에서 미끼 캐기 (헤티와 함께)', 1], ['새벽까지 강가에서 기다리기', 2], ['물때를 기다려 한 마리 낚기', 3], ['헤티와 고기 손질하기', 4]]),
    loc: () => { const k = E('fish').s | 0; return k === 0 ? { x: MUD[0], z: MUD[1] } : k < 4 ? { x: BANK[0], z: BANK[1] } : 'npc:ct_fish'; },
    prog: () => ['서쪽 강가로 가십시다. 진흙에 미끼가 있소.', '고기는 새벽에 입을 여오. 강가에 앉아 기다립시다.', '찌가 쑥 들어갈 때까지 참는 거요.', '이제 손질하는 법까지 배워야 진짜 어부지.', '허허, 다 배우셨소!'][Math.min(4, E('fish').s | 0)],
    obj0: q0.obj, done: ['첫 고기를 낚고 손질까지 한 총리는 처음 보오! 그 낚싯대는 이제 총리님 것이오.', '나일이 늘 넉넉하길!'], finish() { sendHome('ct_fish'); } }); }
function fishBait() { mg('count', { title: '미끼 캐기', hint: '물가 진흙을 손가락으로 헤집어 지렁이를 찾아요.', need: 4, btn: '진흙 파기', onPress: () => sfx('rustle', { vol: 0.4 }) }, () => { E('fish').s = 1; G.UI.quest(); say([L('ct_fish', '좋은 미끼요. 이제 고기가 입을 여는 새벽을 기다립시다. 강가에 앉으시오.')]); }); }
function fishDawn() { const f = E('fish'); waitAt(BANK, 6, 9, Math.max(1, ((29 - (S().time % 30)) + 30) % 30), () => { f.s = 2; f.f0 = S().stats.fish || 0; G.UI.quest(); say([T('강 위로 물안개가 피어올라요. 새벽이에요.'), L('ct_fish', '자, 던지시오. 찌가 쑥 들어갈 때까지 참는 거요.')]); }, 29.2); WT.key = 'fish'; toast('헤티와 강가에 앉아 새벽을 기다려요'); }
function fishClean() { mg('rhythm', { title: '고기 손질하기', hint: '박자에 맞춰 비늘을 긁고, 배를 갈라 손질해요. 헤티가 칼 쥐는 법을 알려 줘요.', need: 6, beats: 10, btn: '긁기' }, () => { E('fish').s = 4; sfx('craft'); walkWith('ct_fish', false); standAt('ct_fish', [BANK[0] + 2, BANK[1] - 1.4], -1.2); G.UI.quest(); }); }
if (QS.l_axe) { const q0 = QS.l_axe; QS.l_axe = Object.assign({}, q0, {
    offer: ['총리님, 화덕 땔감이 다 떨어졌어요. 빵을 구워야 하는데…', '손도끼부터 만드세요. 가지 둘, 돌 셋으로 모닥불 곁에서 「만들기」를 하면 돼요. 그다음엔 벨 나무를 잘 골라야 해요.'],
    start(s) { if (q0.start) q0.start(s); E('axe').s = 0; },
    obj: [{ t: '손도끼 만들기 (가지 2 · 돌 3 · 모닥불 곁)', ok: s => !!s.tools.axe }].concat(stageObj('axe', [['벨 나무 고르기 (도성 밖 마른 아카시아)', 1], ['그 나무를 손도끼로 베기', 2], ['이네트 화덕 곁에서 장작 쪼개기', 3], ['볕에 널어 반나절 말리기', 5]])),
    loc: s => { const k = E('axe').s | 0; if (!S().tools.axe) return null; return k <= 1 ? { x: DEADT[0], z: DEADT[1] } : k <= 4 ? { x: INETO[0], z: INETO[1] } : 'npc:ct_bak'; },
    take: undefined, prog: () => ['손도끼가 있으면 도성 밖 마른 아카시아로 가 보세요. 이 집에서 나가 동쪽이에요.', '그 나무예요. 마른 나무가 잘 타요.', '통나무를 화덕 곁으로 가져와 쪼개 주세요.', '장작을 볕에 널어 반나절 말려야 연기가 안 나요.', '거의 말랐어요. 조금만 더요.', '바싹 말랐어요!'][Math.min(5, E('axe').s | 0)],
    done: ['바싹 마른 장작이네요! 연기 하나 없이 활활 타요. 갓 구운 빵 드세요, 총리님.'], reward: q0.reward }); }
function axePick() { const go = () => ask('어느 나무를 벨까?', ['죽어서 마른 아카시아', ''], [['열매가 달린 무화과나무', '이웃이 열매를 따 먹는 나무예요. 베면 안 돼요.'], ['물가의 푸른 버드나무', '물을 머금은 나무는 연기만 나고 잘 안 타요.']],
    () => { E('axe').s = 1; G.UI.quest(); toast('마른 아카시아예요 · 손도끼로 베어요'); }, () => go()); go(); }
function axeSplit() { mg('rhythm', { title: '장작 쪼개기', hint: '도끼날이 줄에 닿을 때 내리쳐 통나무를 장작으로 쪼개요.', need: 6, beats: 10, btn: '내리치기' }, () => { const f = E('axe'); f.s = 3; Game.take && Game.take('wood', 1); sfx('thud'); G.UI.quest(); bub('ct_bak', '이제 볕에 널어요!'); }); }
function axeDry() { P().emote = { k: 'gather', t: 0, dur: 1.4 }; sfx('rustle'); const f = E('axe'); f.s = 4; f.t0 = absT(); G.UI.quest(); toast('장작을 볕에 널었어요 · 반나절 지나면 말라요 · 그동안 다른 일을 해도 돼요'); }
if (QS.l_hammer) { const q0 = QS.l_hammer; QS.l_hammer = Object.assign({}, q0, {
    offer: ['총리님, 가마 바닥에 깔 넓적한 돌이 모자라오.', '돌망치를 만들어 보시겠소? 통나무 하나, 돌 셋이면 모닥불 곁에서 만들 수 있소. 그다음엔 돌결을 읽어야 하오. 아무 데나 치면 돌이 부서지기만 하지.'],
    start(s) { if (q0.start) q0.start(s); E('ham').s = 0; },
    obj: [{ t: '돌망치 만들기 (통나무 1 · 돌 3 · 모닥불 곁)', ok: s => !!s.tools.hammer }].concat(stageObj('ham', [['사부 곁 큰 바위의 돌결 읽기', 1], ['정과 망치로 넓적한 돌 떼어 내기', 2], ['머리에 이어 가마 바닥으로 나르기', 3]])),
    loc: s => { const k = E('ham').s | 0; if (!S().tools.hammer) return null; return k <= 1 ? { x: BOULDER[0], z: BOULDER[1] } : k === 2 ? { x: SABUK[0], z: SABUK[1] } : 'npc:ct_brk'; },
    take: undefined, prog: () => ['큰 바위를 잘 보시오. 결이 보일 거요.', '정을 결에 대고 망치로 치시오.', '가마 바닥까지 날라 주시오.', '이 돌이면 가마가 단단해지겠소.'][Math.min(3, E('ham').s | 0)],
    done: ['결을 따라 떼어 낸 돌은 쪼개지지 않고 넓적하게 나오지. 총리님 손이 돌을 아는구려. 고맙소!'], reward: q0.reward }); }
function hamRead() { const go = () => ask('정을 어디에 댈까?', ['결을 따라 난 가느다란 금', ''], [['가장 두꺼운 가운데', '가운데를 치면 돌이 부서지기만 해요. 결을 찾아요.'], ['모서리 끝', '모서리는 조각만 떨어져요. 결을 찾아요.']],
    () => { E('ham').s = 1; G.UI.quest(); bub('ct_brk', '그렇지! 거기에 정을 대시오.'); }, () => go()); go(); }
function hamSplit() { mg('wrestle', { title: '정과 망치', hint: '정을 결에 대고, 표시가 초록 칸에 들 때 망치로 내리쳐요.', need: 5, dur: 24, unit: '번', btn: '탕!' }, () => { E('ham').s = 2; sfx('thud', { pitch: 0.8 }); setLoad('slab'); G.UI.quest(); pop('넓적한 돌이 떨어졌어요', '머리에 이고 사부의 가마 바닥으로', 'star'); }); }
function hamDrop() { setLoad(null); sfx('thud', { vol: 0.6 }); E('ham').s = 3; G.UI.quest(); bub('ct_brk', '딱 맞는 돌이오!'); }

// ------------------------------------------------------------------ ⑧ 소년 · ⑨ 온 신전 · ⑩ 자루 (깊은 부탁에 마디 둘씩)
const MARKET = [-8, 118], JAR = [-5, 115.5], REST = [-70, 104], ON = [12, -96], COURT = [15, -91], GRAN = [16, -64], BEHIND = [25, -55], WIDOW = [-2, -48];
const dq = () => S().flags.dq || (S().flags.dq = {});
if (QS.dq_boy) { const q0 = QS.dq_boy; QS.dq_boy = Object.assign({}, q0, {
    obj: [{ t: '엘리압에게 물 떠다 주기 (장터 물항아리)', ok: () => !!E('boy').water }].concat(q0.obj.slice(0, 1), [{ t: '엘리압과 함께 걸어 나루 그늘에서 쉬기', ok: () => !!E('boy').rest }], q0.obj.slice(1)),
    loc: s => { const b = dq().boy | 0, f = E('boy'); if (!f.water) return { x: JAR[0], z: JAR[1] }; if (b === 2 && !f.rest) return { x: REST[0], z: REST[1] }; return q0.loc(s); } }); }
function boyWater() { P().emote = { k: 'gather', t: 0, dur: 1.2 }; sfx('pour'); setTimeout(() => { P().emote = null; E('boy').water = 1; G.UI.quest(); say([{ n: '묶인 히브리 소년', t: '(물그릇을 두 손으로 받아 단숨에 마신다) …고맙습니다, 나리.', e: 'cry' }, J('천천히 마셔라. 이제 저 상인과 이야기해 보마.', 'tender')]); }, 1100); }
function boyRest() { const f = E('boy'); waitAt(REST, 6, 7, 2, () => { f.rest = 1; G.UI.quest();
    say([{ n: '엘리압', t: '우리 마을엔 아브라함 할아버지가 팠다는 우물이 있었어요. 흉년에 그 우물도 바닥이 보였어요.', e: 'sad' }, { n: '엘리압', t: '어머니가 그랬어요. 우물이 마르면 하나님이 다른 우물을 보여 주신다고요. …그게 애굽이었나 봐요.', e: 'tender' },
      J('…그래. 나도 이 땅에서 그분이 보여 주신 우물을 여러 번 만났단다. 일어나자, 네 어머니가 기다리신다.', 'tender')]); }); WT.key = 'boy'; toast('나루 곁 그늘에 앉아 쉬어요 · 엘리압이 이야기를 꺼내요'); }
if (QS.dq_on) { const q0 = QS.dq_on; QS.dq_on = Object.assign({}, q0, {
    offer: q0.offer.concat([{ n: '아스낫', t: '아버지는 저녁 제사를 마치시고야 손님을 만나세요. 이 등잔을 가져가세요. 돌아오는 길이 어두울 거예요.', e: 'tender' }]),
    obj: [{ t: '신전 앞뜰에서 해 질 때까지 기다리기', ok: () => !!E('on').dusk }].concat(q0.obj, [{ t: '등잔에 불을 붙여 밤길로 아스낫에게', ok: () => !!E('on').lamp }]),
    loc: s => { const f = E('on'); if (!f.dusk) return { x: COURT[0], z: COURT[1] }; if ((dq().on | 0) >= 2 && !f.lamp) return { x: COURT[0], z: COURT[1] }; return q0.loc(s); } }); }
function onDusk() { const f = E('on'); waitAt(COURT, 6, 8, Math.max(0.5, 19 - hour()), () => { f.dusk = 1; G.UI.quest(); bub('dqPoti', '…기다리셨구려.'); toast('저녁 제사가 끝났어요 · 제사장 보디베라에게 말을 걸어요'); }, 19); WT.key = 'on'; toast('앞뜰 돌계단에 앉아 저녁 제사가 끝나기를 기다려요'); }
function onLamp() { P().emote = { k: 'gather', t: 0, dur: 1.2 }; sfx('fire', { vol: 0.5 }); setTimeout(() => { P().emote = null; E('on').lamp = 1; S().time = Game.clockTo(S(), 20.5); G.UI.quest(); pop('등잔에 불이 붙었어요', '밤길로 아스낫에게 돌아가요', 'moon'); }, 1100); }
if (QS.dq_sack) { const q0 = QS.dq_sack; QS.dq_sack = Object.assign({}, q0, {
    obj: q0.obj.slice(0, 2).concat([{ t: '밤에 곳간 뒤에 숨어 지켜보기', ok: () => !!E('sack').watch }, { t: '들키지 않게 뒤따라가기', ok: () => (dq().sack | 0) >= 3 }], q0.obj.slice(3)),
    loc: s => { const f = E('sack'), d = dq(); if ((d.sack | 0) === 2 && d.w1 && d.w2 && !f.watch) return { x: BEHIND[0], z: BEHIND[1] }; if (f.watch && (d.sack | 0) < 3) { const n = Game.npc('eqSeti'); return n ? { x: n.x, z: n.z } : { x: WIDOW[0], z: WIDOW[1] }; } return q0.loc(s); } }); }
let TRAIL = null;
function sackWatch() { const f = E('sack'); waitAt(BEHIND, 4.5, 9, Math.max(1, 23 - hour()), () => { f.watch = 1; G.UI.quest(); const w2 = Game.npc('dqW2'); kill('eqSeti'); spawn('eqSeti', { name: '짐꾼 세티', look: Object.assign({}, (w2 && w2.d && w2.d.look) || {}, { top: 0x6a5a48 }), x: GRAN[0] + 10, z: GRAN[1] + 7, face: 0, act: 'carry' }); /* (a figure of his own: at night the real Seti is kept at home by the villagers' sleep) */
    TRAIL = { t: 0, i: 0, seen: 0 }; say([T('달빛 아래 곳간 뒷문이 살짝 열렸어요. 작은 자루를 멘 그림자가 남쪽 길로 나가요.'), J('(…세티다. 들키지 않게 따라가 보자.)', 'think')], () => sackNext()); }, 23); WT.key = 'sack'; toast('곳간 뒤 그늘에 숨어 지켜봐요'); }
const SPATH = [[GRAN[0] + 9, GRAN[1] + 13], [10, -54], [3, -51], [WIDOW[0] + 1.2, WIDOW[1] - 1.4]];
function sackNext() { const n = Game.npc('eqSeti'); if (!n || !TRAIL) return; const q = SPATH[TRAIL.i]; if (!q) return; Game.npcWalk('eqSeti', q[0], q[1], () => { if (!TRAIL) return; TRAIL.i++; if (TRAIL.i >= SPATH.length) sackHome(); else if (!TRAIL.hold) sackNext(); }, 1.25); }
function sackHome() { TRAIL = null; const d = dq(); d.sack = 3; G.UI.quest(); say([T('세티는 길가 작은 집 문 앞에 자루를 내려놓고 가만히 문을 두드렸어요. 그리고 돌아보지도 않고 어둠 속으로 사라졌어요.'), J('(저 집은… 과부 메레트의 집이구나.)', 'think'),T('밤이 깊었어요. 날이 밝으면 그 집을 찾아가요.')], () => { kill('eqSeti'); Game.sleep && Game.sleep(); setTimeout(() => pop('아침이 되었어요', '어젯밤 그 집(과부 메레트의 집)을 찾아가요', 'star'), 1600); }); } /* (at night she sleeps: the visit is in the morning) */

// ------------------------------------------------------------------ ⑪ 케티의 작은 바퀴 · ⑫ 총리의 유람 마차
const DADAT = [-141.5, 131.5];
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S();
    if (id === 'ketiDad' && on('ketiQ') && !s.flags.ketiMet && !E('keti').wheel) { ketiWheel(); return true; }
    if (id === 'dqPoti' && on('dq_on') && (dq().on | 0) === 1 && !E('on').dusk) { say([L('dqPoti', '저녁 제사를 마치고 이야기합시다. 앞뜰에서 기다려 주시오.')], () => fin('dqPoti')); return true; }
    return lt0.apply(this, arguments); }; }
function ketiWheel() { const n = Game.npc('ketiDad'); if (n) n.talking = true;
  say([{ n: '늙은 수레장이 세넵카', t: '…케티가 보냈다고요? (떨리는 손을 감추며) 그 녀석이 어릴 때 갖고 놀던 작은 바퀴, 하나 더 깎아 주고 싶었는데 이 손으로는…', e: 'sad' }, J('어르신, 제 손을 빌려 드리겠습니다. 가르쳐 주십시오.', 'tender')],
    () => { const go = () => ask('바퀴통으로 어떤 나무를 쓸까?', ['단단하고 결이 고운 아카시아', ''], [['가볍고 무른 무화과나무', '세넵카: 무화과는 무르다오. 바퀴통은 돌아가며 닳으니 단단해야지.'], ['물가의 갈대 묶음', '세넵카: 허허, 갈대로는 바구니를 엮지.']],
      () => mg('rhythm', { title: '작은 바퀴 깎기', hint: '세넵카가 손을 얹어 박자를 알려 줘요. 박자에 맞춰 자귀로 둥글게 깎아요.', need: 6, beats: 10, btn: '깎기' }, () => { E('keti').wheel = 1; sfx('craft'); if (n) n.talking = false;
        say([{ n: '늙은 수레장이 세넵카', t: '(작은 바퀴를 굴려 보며) …돈다, 잘 돈다. 이걸 케티에게 주시오. 그리고 내 자귀와 이 그림도.', e: 'tender' }], () => setTimeout(() => G.Life.talk('ketiDad'), 40)); }), () => go()); go(); }); }
if (QS.coachQ) { const q0 = QS.coachQ; QS.coachQ = Object.assign({}, q0, {
    obj: q0.obj.concat([{ t: '케티와 바퀴에 구리 테 두르기 (마구간)', ok: () => !!E('coach').rim }, { t: '케티를 태우고 남쪽 마을 아버지께 시험 주행', ok: () => !!E('coach').drive }]),
    loc: s => { const f = E('coach'), ready = Game.inv('cedar') >= 4 && Game.inv('linen') >= 3 && Game.inv('lapis') >= 1 && s.silver >= 120; if (ready && !f.rim) return 'npc:stKeeper'; if (f.rim && !f.drive) return { x: DADAT[0] + 3, z: DADAT[1] - 2 }; return q0.loc(s); } }); }
function coachRim() { mg('push', { title: '구리 테 두르기', hint: '불에 달군 구리 테를 바퀴에 씌우고, 식기 전에 꾹 눌러 망치로 맞춰요. 케티가 물을 끼얹어 줘요.', btn: '두드리기' }, () => { const f = E('coach'); f.rim = 1; sfx('thud', { pitch: 1.3 }); const s = S(); (s.flags.vehOwn = s.flags.vehOwn || {}).coach = 1; G.Cart && G.Cart.setVeh && G.Cart.setVeh('coach'); G.UI.quest();
  say([{ n: '마구간지기 케티', t: '테가 꼭 맞았어요! 총리님, 이 마차로 남쪽 마을까지 가 봐요. 아버지께 보여 드리고 싶어요. 저도 태워 주세요!', e: 'happy' }], () => pop('시험 주행', '성 밖에서 마차를 불러 케티를 태우고 남쪽 마을로', 'donkey')); }); }

// ------------------------------------------------------------------ 행동 단추 (이 부탁들의 일이 가까이 선 사람과의 「말하기」보다 먼저)
Game.CTX.push(function (s) { const p = P(); if (!s || p.ride || p.act || Game.cineOn || G.UI.busy() || (s.q && s.q.riding)) return null; const out = [];
  const at = (pt, r, label, key, use) => { if (!pt) return; const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  if (on('e_hunt')) { const k = E('hunt').s | 0; if (k === 0) at(FIELD, 5, '헤집힌 밭 살피기', 'eqTr', huntTracks); if (k === 1) at(SNARE, 3, '울타리 틈에 올무 놓기', 'eqSn', huntSnare); if (k === 2 && !waiting('hunt')) at(BLIND, 3.4, '갈대 뒤에 숨어 기다리기', 'eqBl', huntWait); if (k === 4) at(FENCE, 3.6, '페피와 울타리 고치기', 'eqFe', huntFence); }
  if (on('d_brick')) { const k = E('kiln').s | 0; if (k === 0) at(KILN, 3.6, '가마 아궁이에 땔감 쌓기', 'eqK0', kilnStack); if (k === 1) at(KILN, 3.6, '아궁이에 불 지피기', 'eqK1', kilnLight); if (k === 2 && !waiting('kiln')) at(KILN, 4, '우니와 밤새 불 지키기', 'eqK2', kilnNight); if (k === 3) at(KILN, 3.6, '식은 가마에서 그릇 꺼내기', 'eqK3', kilnOut); if (k === 4) at(STALL, 3, '좌판에 그릇 펼치기', 'eqK4', kilnStall); }
  if (on('x_photo') && (G.Extras && G.Extras.PHOTO || []).every(q => ((s.flags.ex || {}).photo || {})[q.id])) { const k = E('titi').s | 0, ti = Game.npc('painter');
    if (k === 0 && ti && Math.hypot(ti.x - p.x, ti.z - p.z) < 3) at([ti.x, ti.z], 3, '티티를 데리고 강가로', 'eqT0', titiGo); if (k === 2 && !waiting('titi')) at(RIVER3, 4, '티티 곁에서 종이 잡아 주기', 'eqT2', titiDraw); if (k === 3) at(BOARD, 3, '티티의 집 담에 그림판 세우기', 'eqT3', titiBoard); }
  if (on('dl_grain')) { const k = E('grain').s | 0; if (k === 0) at(FORD, 5, '무너진 나루 판자 고치기', 'eqG0', grainFord); const d = dropOf(k === 3 ? 'pyr' : 'south'); if (k === 3) at(d, 7, '일꾼들에게 빵 나누기', 'eqG3', grainBread); if (k === 5) at(d, 7, '사람들 줄 세우기', 'eqG5', grainLine); }
  if (on('l_fish')) { const k = E('fish').s | 0; if (k === 0) at(MUD, 3.4, '진흙에서 미끼 캐기', 'eqF0', fishBait); if (k === 1 && !waiting('fish')) at(BANK, 4, '강가에 앉아 새벽까지 기다리기', 'eqF1', fishDawn); if (k === 3) at(BANK, 4.5, '헤티와 고기 손질하기', 'eqF3', fishClean); }
  if (on('l_axe') && s.tools.axe) { const k = E('axe').s | 0; if (k === 0) at(DEADT, 5, '벨 나무 고르기', 'eqA0', axePick); if (k === 1 && Math.hypot(DEADT[0] - p.x, DEADT[1] - p.z) < 3.4) out.push({ d: -0.6, x: DEADT[0], z: DEADT[1], y: 1.4, label: '마른 아카시아 베기', key: 'eqA1', story: true, noMagnet: true, anim: 'chop', dur: 0.6, hits: 3, prop: 'axe', fn: () => { Game.give('wood', 1, true); E('axe').s = 2; G.UI.quest(); pop('통나무를 얻었어요', '이네트 화덕 곁으로 가져가 쪼개요', 'star'); } }); /* (the game's own chop: three strokes with the hand axe) */ if (k === 2) at(INETO, 3, '장작 쪼개기', 'eqA2', axeSplit); if (k === 3) at(INETO, 3, '장작을 볕에 널기', 'eqA3', axeDry); }
  if (on('l_hammer') && s.tools.hammer) { const k = E('ham').s | 0; if (k === 0) at(BOULDER, 3, '큰 바위의 돌결 읽기', 'eqH0', hamRead); if (k === 1) at(BOULDER, 3, '정과 망치로 떼어 내기', 'eqH1', hamSplit); if (k === 2) at(SABUK, 3, '가마 바닥에 돌 내려놓기', 'eqH2', hamDrop); }
  if (on('dq_boy')) { const f = E('boy'), b = dq().boy | 0; if (!f.water && b === 1) at(JAR, 3, '소년에게 물 떠다 주기', 'eqB0', boyWater); const bo = Game.npc('dqBoy'); if (b === 2 && !f.rest && !waiting('boy') && bo && Math.hypot(bo.x - p.x, bo.z - p.z) < 7) at(REST, 4, '나루 곁 그늘에서 쉬기', 'eqB1', boyRest); }
  if (on('dq_on')) { const f = E('on'), o = dq().on | 0; if (!f.dusk && o === 1 && !waiting('on')) at(COURT, 4.5, '앞뜰에서 해 질 때까지 기다리기', 'eqO0', onDusk); if (o >= 2 && !f.lamp) at(COURT, 5, '등잔에 불 붙이기', 'eqO1', onLamp); }
  if (on('dq_sack')) { const f = E('sack'), d = dq(); if ((d.sack | 0) === 2 && d.w1 && d.w2 && !f.watch && !waiting('sack')) at(BEHIND, 3.6, '곳간 뒤에 숨어 밤까지 지켜보기', 'eqS0', sackWatch); }
  if (on('coachQ')) { const f = E('coach'), kp = Game.npc('stKeeper'), ready = Game.inv('cedar') >= 4 && Game.inv('linen') >= 3 && Game.inv('lapis') >= 1 && s.silver >= 120; if (ready && !f.rim && kp) at([kp.x, kp.z], 3, '케티와 구리 테 두르기', 'eqC0', coachRim); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ 저절로 넘어가는 것 · 기다림 · 따라가기
let tk = 0;
const up0 = EP.update; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play' || !s || !s.q) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try {
    if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); if (w.endH !== undefined) s.time = Game.clockTo(s, w.endH); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } }
    { const want = (on('d_brick') && (E('kiln').s | 0) === 4) ? 'pots' : (on('l_hammer') && (E('ham').s | 0) === 2) ? 'slab' : null; if (want && p.carry !== 'head') setLoad(want); else if (!want && LOAD) setLoad(null); else if (want) LOAD = want; }
    if (TRAIL && on('dq_sack')) { const n = Game.npc('eqSeti'); if (n) { const dd = Math.hypot(n.x - p.x, n.z - p.z); TRAIL.t -= d;
        if (dd < 3.6 && !TRAIL.hold) { TRAIL.hold = 1; n.walk = null; n.face = Math.atan2(p.x - n.x, p.z - n.z); bub('eqSeti', '…누구요?'); toast('너무 가까워요! 세티가 돌아봐요 · 멀찍이 물러나요'); }
        else if (TRAIL.hold && dd > 7) { TRAIL.hold = 0; sackNext(); }
        else if (dd > 26 && TRAIL.t <= 0) { TRAIL.t = 6; toast('놓치겠어요 · 흘린 낟알을 따라 서둘러요'); } } }
    if ((tk -= d) > 0) return r; tk = 0.25;
    /* ① the gazelle in the snare: down when it is dead */
    if (on('e_hunt') && (E('hunt').s | 0) === 3) { const f = E('hunt'), a = C && C.wild ? C.wild().find(w => w.id === f.wid) : null; if ((s.hero.kills.gazelle | 0) > (f.k0 | 0) || (f.wid && (!a || a.st === 'dead'))) { f.s = 4; G.UI.quest(); spawnFarmer(); say([L('hunterE', '한 번에! 훌륭하십니다, 나으리.', 'happy'), T('밭 주인 농부 페피가 횃불을 들고 달려왔어요. 울타리 기둥이 무너져 있어요.')]); } else if (a && a.st !== 'stun' && a.st !== 'dead' && Math.hypot(a.x - SNARE[0], a.z - SNARE[1]) < 6) { C.stun && C.stun(a, 30); } }
    if (on('e_hunt') && (E('hunt').s | 0) >= 4 && !Game.npc('ehFarmer')) spawnFarmer();
    /* ③ Titi and the cart: in the cart she rides; at the river she gets down and sits */
    if (on('x_photo') && (E('titi').s | 0) === 1) { const ti = Game.npc('painter'); if (ti) { if (s.q.riding && !s.q.cartPax && Math.hypot(ti.x - p.x, ti.z - p.z) < 7) { Game.npcFollow('painter', false); s.q.cartPax = 'painter'; toast('티티를 수레에 태웠어요 · 강가 갈대밭으로'); }
        if (Math.hypot(p.x - RIVER3[0], p.z - RIVER3[1]) < 9 && !s.q.riding && (Math.hypot(ti.x - p.x, ti.z - p.z) < 9 || s.q.cartPax === 'painter')) { if (s.q.cartPax === 'painter') { s.q.cartPax = null; } Game.npcFollow('painter', false); Game.npcTo('painter', RIVER3[0] - 1.4, RIVER3[1] + 0.6, -1.4, false); ti.sit = true; E('titi').s = 2; G.UI.quest(); bub('painter', '강이다…! 거위들 좀 보세요!'); } } }
    if (on('x_photo') && (E('titi').s | 0) === 3) { const ti = Game.npc('painter'); if (ti && ti.sit) ti.sit = false; }
    /* ④ the cart at each flag */
    if (on('dl_grain') && s.q.riding) { const f = E('grain'), k = f.s | 0, sp = Math.abs(G.Cart && G.Cart.speed ? G.Cart.speed() : 0); const tgt = k === 1 ? 'west' : k === 2 ? 'pyr' : k === 4 ? 'south' : null, dpt = tgt && dropOf(tgt);
      if (dpt && sp < 0.9 && Math.hypot(p.x - dpt[0], p.z - dpt[1]) < 9) { f.s = k + 1; sfx('coin'); G.UI.quest(); pop(`${GNAME[tgt]}에 닿았어요`, tgt === 'west' ? '곡식 한 자루를 내렸어요 · 피라미드 일꾼 마을로' : tgt === 'pyr' ? '수레에서 내려 일꾼들에게 빵을 나눠요' : '수레에서 내려 사람들을 줄 세워요', 'donkey'); } }
    /* ⑤ the fish (a real catch) */
    if (on('l_fish') && (E('fish').s | 0) === 2 && (s.stats.fish || 0) > (E('fish').f0 | 0)) { E('fish').s = 3; G.UI.quest(); bub('ct_fish', '잡았소! 이제 손질을 배웁시다.'); }
    /* ⑥ the tree (a real chop) · the drying */
    if (on('l_axe')) { const f = E('axe');
      if ((f.s | 0) === 4 && absT() - (f.t0 || 0) >= 4) { f.s = 5; G.UI.quest(); pop('장작이 바싹 말랐어요', '이네트에게 가져다줘요', 'star'); } }
    /* ⑧ walking with Eliab */
    if (on('dq_boy') && (dq().boy | 0) === 2 && !E('boy').walk && !G.UI.busy()) { /* (after the trader's words close: they send him ahead, he comes with Joseph instead) */ const b = Game.npc('dqBoy'); if (b) { const fw = p.face || 0; b.x = b.d.x = p.x - Math.sin(fw) * 1.6; b.z = b.d.z = p.z - Math.cos(fw) * 1.6; walkWith('dqBoy', true); E('boy').walk = 1; toast('엘리압이 따라와요 · 함께 남쪽 마을로 걸어가요'); } }
    if (on('dq_boy') && (dq().boy | 0) >= 3 && E('boy').walk === 1) { E('boy').walk = 2; walkWith('dqBoy', false); }
    /* ⑫ the test drive: Keti in the coach, to his father */
    if (on('coachQ') && E('coach').rim && !E('coach').drive) { const kp = Game.npc('stKeeper'); if (kp && s.q.riding && !s.q.cartPax && Math.hypot(kp.x - p.x, kp.z - p.z) < 8) { s.q.cartPax = 'stKeeper'; toast('케티를 태웠어요 · 남쪽 마을 아버지께'); }
      if (s.q.riding && s.q.cartPax === 'stKeeper' && Math.hypot(p.x - DADAT[0], p.z - DADAT[1]) < 14 && Math.abs(G.Cart && G.Cart.speed ? G.Cart.speed() : 0) < 0.9) { E('coach').drive = 1; s.q.cartPax = null; if (kp) { kp.x = DADAT[0] + 2; kp.z = DADAT[1] - 1.4; kp.walk = null; } G.UI.quest();
        say([{ n: '늙은 수레장이 세넵카', t: '(마차 바퀴를 한참 쓰다듬으며) …내 그림이 굴러가는구나. 내 아들이 만든 마차가.', e: 'cry' }, { n: '마구간지기 케티', t: '아버지… 아버지 자귀로 깎았어요.', e: 'cry' }, T('아버지와 아들은 마차 곁에 오래 서 있었어요. 케티에게 말을 걸어 마쳐요.')]); } }
  } catch (e) { console.error('egyptq', e); } return r; };
function spawnFarmer() { spawn('ehFarmer', { name: '밭 주인 농부 페피', look: { skin: 0x9a6038, top: 0xd8c8a0, bottom: 0xd8c8a0, belt: 0x6a4428, hair: 0x1a1410 }, x: FENCE[0] - 1.6, z: FENCE[1] + 0.8, face: 1.2 }); }
/* coachQ's end: Keti, back at the stable afterwards */
{ const f0 = QS.coachQ && QS.coachQ.finish; if (QS.coachQ) QS.coachQ.finish = function (s) { if (f0) f0.apply(this, arguments); const kp = Game.npc('stKeeper'); if (kp) { kp.x = kp.d.x; kp.z = kp.d.z; kp.walk = null; } }; }

// ------------------------------------------------------------------ 보이는 것 (올무 · 가마와 불 · 좌판 · 그림판 · 나루 판자 · 바위 · 장작 · 머리에 인 것 · 작은 바퀴)
const MS = {}, MP = []; let mk = 0;
function meshes() { const mkM = (seed, f) => { const g = new G.GB(seed); f(g); return G.R.mesh(g); };
  MS.snare = mkM(801, g => { g.cyl(0.03, 0.035, 0.7, 5, { at: [0, 0.35, 0], c: 0x6a4a30 }); g.cyl(0.18, 0.18, 0.02, 10, { at: [0, 0.12, 0.14], rx: 1.4, c: 0xc8b07a }); });
  MS.kiln = mkM(802, g => { g.sph(1.25, 12, 8, { at: [0, 0.2, 0], s: [1, 0.95, 1], c: 0xa87a52, j: 0.06 }); g.box(0.7, 0.6, 0.3, { at: [0, 0.35, 1.15], c: 0x2a1a10 }); g.cyl(0.25, 0.3, 0.5, 8, { at: [0, 1.4, 0], c: 0x9a6a46 }); });
  MS.pots = mkM(803, g => { for (let i = 0; i < 5; i++) g.lathe([[0, 0], [0.16, 0.02], [0.2, 0.14], [0.16, 0.28], [0.1, 0.32], [0.11, 0.36]], 9, { at: [(i % 3 - 1) * 0.42, (i > 2 ? 0.36 : 0), (i > 2 ? 0 : (i % 2) * 0.1)], c: [0xc0784a, 0xb06a3e, 0xc8885a][i % 3] }); });
  MS.stall = mkM(804, g => { g.box(2.2, 0.08, 1, { at: [0, 0.55, 0], c: 0x8a6a48 }); for (const [x, z] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) g.cyl(0.05, 0.05, 0.55, 5, { at: [x, 0.27, z], c: 0x6a4a30 }); for (let i = 0; i < 6; i++) g.lathe([[0, 0], [0.13, 0.02], [0.16, 0.12], [0.12, 0.24], [0.09, 0.27]], 8, { at: [-0.8 + i * 0.32, 0.6, (i % 2) * 0.2 - 0.1], c: [0xc0784a, 0xb06a3e, 0xc8885a][i % 3] }); });
  MS.board = mkM(805, g => { g.cyl(0.05, 0.06, 1.8, 5, { at: [-0.7, 0.9, 0], c: 0x6a4a30 }); g.cyl(0.05, 0.06, 1.8, 5, { at: [0.7, 0.9, 0], c: 0x6a4a30 }); g.box(1.5, 1.0, 0.05, { at: [0, 1.35, 0.03], c: 0xe8dcc0 }); g.box(1.3, 0.25, 0.02, { at: [0, 1.08, 0.065], c: 0x3a7aa0 }); g.box(1.3, 0.12, 0.02, { at: [0, 1.25, 0.065], c: 0x6a9a4a });
    for (const [x, y] of [[-0.3, 1.45], [0.25, 1.55]]) g.sph(0.08, 6, 4, { at: [x, y, 0.07], s: [1.6, 0.8, 0.4], c: 0xf0ece0 }); g.sph(0.1, 6, 4, { at: [0.5, 1.7, 0.07], s: [1, 1, 0.3], c: 0xe8b040 }); });
  MS.plank = mkM(806, g => { for (let i = 0; i < 6; i++) g.box(0.5, 0.08, 3.2, { at: [(i - 2.5) * 0.55, 0.05, 0], c: [0x8a6a48, 0x7a5a3a][i % 2], j: 0.06 }); for (const s of [-1, 1]) g.cyl(0.08, 0.1, 1.0, 6, { at: [s * 1.6, 0.2, 1.5], c: 0x5a4028 }); });
  MS.rock = mkM(807, g => { g.sph(1.0, 9, 7, { at: [0, 0.6, 0], s: [1.3, 0.8, 1], c: 0xb0a48a, j: 0.06 }); g.box(0.02, 0.6, 1.2, { at: [0.3, 0.75, 0], ry: 0.3, c: 0x6a6050 }); });
  MS.slab = mkM(808, g => g.box(0.9, 0.14, 0.7, { at: [0, 0.07, 0], c: 0xb8ac94, j: 0.06 }));
  MS.logs = mkM(809, g => { for (let i = 0; i < 7; i++) g.cyl(0.07, 0.08, 0.7, 6, { at: [(i % 4 - 1.5) * 0.18, 0.08 + Math.floor(i / 4) * 0.14, 0], rx: Math.PI / 2, c: [0xa88a5e, 0x9a7a50][i % 2] }); });
  MS.wheel = mkM(810, g => { g.cyl(0.32, 0.32, 0.06, 14, { at: [0, 0.33, 0], rx: Math.PI / 2, c: 0x9a7448 }); g.cyl(0.08, 0.08, 0.1, 8, { at: [0, 0.33, 0], rx: Math.PI / 2, c: 0x6a4a30 }); });
  MS.wheat = mkM(812, g => { g.box(8.2, 0.03, 6.2, { at: [0, 0.015, 0], c: 0x8a7448 }); for (let r = 0; r < 6; r++) for (let i = 0; i < 12; i++) for (let k = 0; k < 3; k++) { const x = (i - 5.5) * 0.66 + (k - 1) * 0.16 + (r % 2) * 0.2, z = (r - 2.5) * 1.0 + (k % 2) * 0.14, tr = r >= 2 && r <= 3 && i >= 4 && i <= 7;
      g.cyl(0.025, 0.035, tr ? 0.3 : 0.85, 4, { at: [x, tr ? 0.1 : 0.42, z], rz: tr ? 1.25 : 0.06 * (k - 1), c: tr ? 0x9a8a50 : 0xd0b058 }); if (!tr) g.sph(0.07, 4, 3, { at: [x + 0.06 * (k - 1), 0.88, z], s: [0.7, 1.7, 0.7], c: 0xe4c46a }); } }); /* Pepi's wheat on its tilled earth, trampled in the middle */ /* Pepi's wheat, trampled in the middle */
  MS.fence = mkM(813, g => { for (let i = 0; i < 5; i++) g.cyl(0.06, 0.07, 1.1, 5, { at: [0, 0.55, (i - 2) * 1.6], c: 0x6a4a30 }); for (const y of [0.45, 0.85]) g.box(0.06, 0.06, 6.6, { at: [0, y, 0], c: 0x7a5a3a }); });
  MS.fenceB = mkM(814, g => { for (const i of [0, 1, 3, 4]) g.cyl(0.06, 0.07, 1.1, 5, { at: [0, 0.55, (i - 2) * 1.6], c: 0x6a4a30 }); g.cyl(0.06, 0.07, 1.1, 5, { at: [0.35, 0.18, 0], rz: 1.3, c: 0x6a4a30 }); for (const [z0, z1] of [[-3.3, -1.0], [1.0, 3.3]]) for (const y of [0.45, 0.85]) g.box(0.06, 0.06, z1 - z0, { at: [0, y, (z0 + z1) / 2], c: 0x7a5a3a }); });
  MS.plankB = mkM(815, g => { for (let i = 0; i < 4; i++) g.box(0.5, 0.08, 2.6, { at: [(i - 1.5) * 0.9, 0.04, (i % 2) * 0.6], ry: (i - 1.5) * 0.4, rz: (i % 2 ? 0.25 : -0.2), c: [0x6a5038, 0x5a4430][i % 2] }); }); /* broken planks in the shallows */
  MS.dead = mkM(811, g => { g.cyl(0.14, 0.22, 2.6, 6, { at: [0, 1.3, 0], c: 0x7a6a58 }); for (let i = 0; i < 4; i++) g.cyl(0.04, 0.07, 1.4, 5, { at: [Math.cos(i * 1.6) * 0.4, 2.4, Math.sin(i * 1.6) * 0.4], rz: Math.cos(i * 1.6) * 0.7, rx: Math.sin(i * 1.6) * 0.7, c: 0x8a7a66 }); }); MS.ok = 1; }
const put = (list, mesh, x, z, ry, dy) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, x, hAt(x, z) + (dy || 0), z, ry || 0, 0, 0, 1, 1, 1); list.push({ mesh, m, outline: true }); };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags) return; try { if (!MS.ok) meshes(); mk = 0; const eq = s.flags.eq || {}, p = P(), within = (q, r) => Math.hypot(q[0] - p.x, q[1] - p.z) < (r || 70);
    const g = k => (eq[k] && eq[k].s) | 0;
    if (on('e_hunt') && g('hunt') >= 2 && within(SNARE)) put(list, MS.snare, SNARE[0], SNARE[1], 0.4);
    if (within(KILN, 60)) { put(list, MS.kiln, KILN[0], KILN[1], 0.6); if (on('d_brick') && g('kiln') === 2 && G.Fire && G.Fire.emit) G.Fire.emit(KILN[0] + Math.sin(0.6) * 1.2, hAt(KILN[0], KILN[1]) + 0.3, KILN[1] + Math.cos(0.6) * 1.2, 0.6, 0.25, 1 / 60); }
    if (g('kiln') >= 5 && within(STALL)) put(list, MS.stall, STALL[0], STALL[1], 0.2);
    if (g('titi') >= 4 && within(BOARD)) put(list, MS.board, BOARD[0], BOARD[1], Math.PI + 0.2); /* (the painting toward the street) */
    if (within(FORD, 80)) { const wl = (Game.W().water || { level: 0 }).level; if (g('grain') >= 1) { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, FORD[0] - 1.6, Math.max(hAt(FORD[0] - 1.6, FORD[1]), wl + 0.12), FORD[1], Math.PI / 2, 0, 0, 1, 1, 1); list.push({ mesh: MS.plank, m, outline: true }); } else if (on('dl_grain')) { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, FORD[0] - 2.4, wl - 0.05, FORD[1] + 0.6, 0.3, 0, 0, 1, 1, 1); list.push({ mesh: MS.plankB, m, outline: true }); } } /* (broken in the water before · laid level to the bank after) */
    if (within(FIELD, 70)) { put(list, MS.wheat, FIELD[0] + 2.5, FIELD[1] - 3, 0.1); put(list, (g('hunt') >= 5 || !(on('e_hunt') || (S().side.done || {}).e_hunt !== undefined)) ? MS.fence : (g('hunt') >= 1 || on('e_hunt') ? MS.fenceB : MS.fence), FENCE[0] - 0.5, FENCE[1] + 2.4, 0); }
    if (within(BOULDER)) put(list, MS.rock, BOULDER[0], BOULDER[1], 0.3); if (g('ham') >= 3 && within(SABUK)) put(list, MS.slab, SABUK[0], SABUK[1], 0.2);
    if (within(DEADT, 80) && !(g('axe') >= 2)) put(list, MS.dead, DEADT[0], DEADT[1], 0.4); if (g('axe') >= 4 && within(INETO)) put(list, MS.logs, INETO[0] + 1.2, INETO[1] + 0.4, 0.3);
    if (eq.keti && eq.keti.wheel && within(DADAT)) put(list, MS.wheel, DADAT[0] + 1.2, DADAT[1] - 0.8, 0.6);
    if (LOAD && p.carry === 'head') { const w = p.rig && p.rig.world && G.HBI && p.rig.world[G.HBI.head], hp = w && isFinite(w[13]) && Math.hypot(w[12] - p.x, w[14] - p.z) < 1.5 ? [w[12], w[13] + 0.44, w[14]] : [p.x, p.y + 2.2, p.z], m = MP[mk] || (MP[mk] = G.m4()); mk++;
      G.m4trs(m, hp[0], hp[1], hp[2], p.face || 0, 0, 0, LOAD === 'pots' ? 0.7 : 0.8, LOAD === 'pots' ? 0.7 : 0.8, LOAD === 'pots' ? 0.7 : 0.8); list.push({ mesh: LOAD === 'pots' ? MS.pots : MS.slab, m, outline: true }); }
  } catch (e) { console.error('egyptq dyn', e); } };
/* the dead acacia can be cut for real: a tree node there while the lesson needs it */
G.EgyptQ = { E, WT: () => WT };
})(window.G);
