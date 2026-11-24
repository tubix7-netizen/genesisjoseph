/* 약속의 길 — v18.85 곁이야기 「라. 옥」 깊게 (prisonq.js · egyptq.js 다음 · 바탕은 prison.js)
   부탁 하나 = 서로 다른 일 3~5가지 · 함께 하는 사람 · 기다림(진짜 시간) · 흔적. 한 부탁 안에서 같은 놀이를 두 번 쓰지 않아요.
   예전에는 「옥에 가둘 자」 셋이 모두 「쫓아가 붙잡기 → 가두기」였어요. 이제 셋이 서로 달라요.
   ① 빵 도둑 메르(x_jail1): 화덕 주인 이야기 → 빵 부스러기 따라가기 → 숨은 메르에게 빵을 건네며 말 걸기(고르기, 쫓지 않음) → 함께 옥으로 → 화덕 주인에게 메르의 말 전하기
      흔적: 서쪽 마을 화덕 곁 「배고픈 이는 하나 가져가오」 빵 바구니
   ② 자루 도둑 세베크(x_jail2): 곳간 앞 수레 자국 읽기(고르기) → 쫓아가 붙잡기(달리기 · 하나만 남은 쫓기) → 갈대밭에 숨긴 자루 되싣기(세기) → 옥에 가두기
      흔적: 남쪽 마을 곳간 문 앞의 자루 다섯
   ③ 가짜 저울 상인 카(x_jail3): 나루 사람들 말 듣기 → 카의 추와 궁의 바른 추 달아 보기(균형) → 깎인 추를 보이기(카가 순순히 따라옴) → 옥에 가두기 → 속인 만큼 곡식 되돌려 주기(세기)
      흔적: 나루의 「바른 추」 상
   ④ 잃어버린 열쇠꾸러미(x_keys): 데디의 말 → 데디처럼 항아리에 물 길어 붓기(리듬) → 짚더미 뒤지기 → 해 질 녘까지 옥 문 곁에서 기다리기 → 셋이 함께 감방 문 잠그기(세기)
      흔적: 옥 문 곁 열쇠 걸이
   ⑤ 억울한 죄수(x_wrong): 창살 사이로 네브카에게 물 한 그릇 → 하피의 이야기 → 바람 부는 한낮까지 노점 곁에서 기다리기 → 바구니에서 은잔 → 간수장 → 감방 문을 열고 네브카와 함께 하피에게
      흔적: 네브카가 하피의 노점 곁에서 일해요
   저장: S.flags.pq = { mer, seb, ka, keys, wrong } (각각 { s, … }) · 옛 진행(S.flags.px)은 그대로 써요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.x_jail1 || !QS.x_keys || !QS.x_wrong) return;
const E = k => { const s = S(), f = s.flags.pq || (s.flags.pq = {}); return f[k] || (f[k] = { s: 0 }); };
const F = () => { const s = S(); return s.flags.px || (s.flags.px = { caught: {}, jailed: {}, keys: 0, wrong: 0, freed: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), toast = m => G.UI.toast(m), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e) => ({ n: nm(id), t, e }), N = (n, t, e) => ({ n, t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t });
const hAt = (x, z) => Game.W().heightAt(x, z), hour = () => S().time % 24;
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const ask = (q, right, wrong, then, again) => say([{ n: '', t: q, choices: [right].concat(wrong).sort(() => Math.random() - 0.5).map(c => ({ t: c[0], then: () => setTimeout(() => { if (c === right) then(); else say([T(c[1])], () => again && again()); }, 30) })) }], null);
const bub = (id, t) => { if (G.Life.bubble && Game.npc(id)) G.Life.bubble(id, t, 2.8); };
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: typeof k === 'function' ? k : () => (E(key).s | 0) >= k }));
const near = (q, r) => !!q && Math.hypot(P().x - q[0], P().z - q[1]) < r;
const npcNear = (id, r) => { const n = Game.npc(id); return !!n && Math.hypot(n.x - P().x, n.z - P().z) < r; };
function walkWith(id, on0) { const n = Game.npc(id); if (!n) return; if (on0) { n.walk = null; n.sit = false; n._wd = n._wd || n.wander; n.wander = null; Game.npcFollow(id, true); } else Game.npcFollow(id, false); }
function standAt(id, q, face) { const n = Game.npc(id); if (!n) return; Game.npcFollow(id, false); n.walk = null; Game.npcTo(id, q[0], q[1], face || 0, false); n.wander = null; }
const fin = id => { const n = Game.npc(id); if (n) n.talking = false; };
/* a real wait (time runs only while he stays near) */
let WT = null;
function waitAt(key, at, r, secs, endH, done) { const h = hour(); const hours = Math.max(0.5, (endH - h + 24) % 24); WT = { key, at, r, left: secs, rate: hours / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);

// ------------------------------------------------------------------ places (all on open ground · checked against the walls)
const OVENW = [-137, -33], CRUMB = [-131, -27], MER = [-128, -30];           /* ① the west village oven, the crumbs, where Mer hides */
const TRK = [-146, 134], STASH = [-93, 141];                                 /* ② the south granary door, the sacks hidden in the reeds */
const KAST = [-88, -63], RET = [-93, -66];                                   /* ③ Ka's scales at the north landing, the people he cheated */
const JAR = [-42.6, 11.2], GATEIN = [-30, 8.6], HOOK = [-37.5, 13.52];         /* ④ the yard's water jar, inside the prison gate (the gate posts stand at z 14), the key hook on the wall's inner face */
const CELL1 = [-35.5, -8], BARS1 = [-35.5, -4.1], STALLH = [-13.5, -74], NEBST = [-16.6, -72.2]; /* ⑤ Nebka's cell, its bars, beside Hapi's stall */
const CELLS = { culMer: [-30, -4.1], culSebek: [-24.5, -4.1], culKa: [-41, -4.1] };

// ------------------------------------------------------------------ ① 빵 도둑 메르
Object.assign(QS.x_jail1, { title: '옥에 가둘 자 · 빵 도둑 메르',
  offer: [N('간수장', '총리님, 서쪽 마을 화덕에서 빵 열두 덩이를 훔쳐 간 자가 있습니다. 메르라는 젊은이랍니다.'), N('간수장', '우리 간수들이 가면 숨어 버립니다. 화덕 주인 말부터 들어 보시지요. 붙잡아 이 옥으로 데려와 주십시오.')],
  obj: stageObj('mer', [['서쪽 마을 화덕 주인의 이야기 듣기', 1], ['흘린 빵 부스러기 따라가기', 2], ['숨은 메르에게 빵을 건네며 말 걸기', 3], ['옥의 빈 감방 앞에서 「옥에 가두기」', () => !!F().jailed.culMer], ['화덕 주인에게 메르의 말 전하기', 4]]),
  loc: () => { const k = E('mer').s | 0; if (k === 0) return { x: OVENW[0], z: OVENW[1] }; if (k === 1) return { x: CRUMB[0], z: CRUMB[1] }; if (k === 2) return 'npc:culMer'; if (!F().jailed.culMer) return { x: CELLS.culMer[0], z: CELLS.culMer[1] }; if (k === 3) return { x: OVENW[0], z: OVENW[1] }; return 'npc:keeper'; },
  prog: () => ['화덕 주인을 먼저 만나 보시지요. 서쪽 마을입니다.', '부스러기라… 굶주린 자는 멀리 못 갑니다.', '그자가 달아나지 않았다니 다행입니다.', '감방 하나를 비워 두었습니다.', '화덕 주인에게도 알려 주셨습니까?'][Math.min(4, E('mer').s | 0)],
  done: [N('간수장', '메르는 며칠 이 옥의 화덕에서 죄수들 빵을 굽게 하겠습니다. 굶어 본 자가 빵을 제일 아끼지요.'), N('간수장', '총리님, 쫓지 않고 빵을 먼저 건네셨다고요. …예전에 이 옥에서 죄수들에게 먼저 물을 떠 주던 젊은이가 생각납니다.'), T('서쪽 마을 화덕 곁에는 「배고픈 이는 하나 가져가오」 바구니가 놓였어요.')] });
function merOven() { say([N('화덕 주인 아낙', '총리님! 그 빵 말씀이시군요. 새벽에 굽던 걸 통째로 들고 뛰었지요.'), N('화덕 주인 아낙', '…그런데 이상해요. 그 젊은이, 뛰면서도 한 덩이씩 떨어뜨리고 갔어요. 손이 떨렸던 것처럼요.'), T('화덕 앞 흙바닥에 빵 부스러기가 북쪽 골목으로 이어져 있어요.')],
  () => { E('mer').s = 1; G.UI.quest(); }); }
function merCrumbs() { sfx('rustle', { vol: 0.5 }); say([T('부스러기가 담 모퉁이에서 끊겨요. 담 그늘에 누군가 웅크리고 앉아 빵을 뜯어 먹고 있어요. 열두 덩이 가운데 남은 것은 서너 덩이뿐이에요.'), J('(달아날 힘도 없어 보이는구나.)')],
  () => { E('mer').s = 2; G.UI.quest(); const n = Game.npc('culMer'); if (n) { n.sit = true; n.face = Math.atan2(P().x - n.x, P().z - n.z); } }); }
function merBread() { const n = Game.npc('culMer'); if (n) { n.talking = true; n.face = Math.atan2(P().x - n.x, P().z - n.z); }
  say([N('빵 도둑 메르', '…오, 오지 마시오! 다 먹어 버렸소. 돌려줄 것도 없단 말이오!', 'fear')], () => {
    const go = () => ask('메르에게 어떻게 할까?', ['곁에 앉아 내 빵 한 덩이를 먼저 건넨다', ''], [['소리쳐 꾸짖고 팔을 붙든다', '메르가 몸을 웅크리며 떨어요. …겁먹은 사람에게는 말이 들리지 않아요.'], ['못 본 척 지나간다', '화덕 주인 아낙의 빵은 누가 갚을까요? 그냥 지나칠 수는 없어요.']],
      () => say([N('빵 도둑 메르', '(빵을 받아 들고 한참 말이 없다가) …사흘을 굶었소. 동생들이 둘 있는데… 잘못했소. 갚을 길도 없고.', 'sad'), J('빵 값은 일해서 갚으면 된다네. 옥에 가서 며칠 죗값을 치르세. 내가 함께 가겠네.', 'tender'), N('빵 도둑 메르', '…달아나지 않겠소.')],
        () => { fin('culMer'); if (n) n.sit = false; E('mer').s = 3; F().caught.culMer = 1; walkWith('culMer', true); sfx('pickup', { vol: 0.5 }); toast('메르가 뒤따라와요 · 옥의 빈 감방 앞으로'); G.UI.quest(); }), () => go()); go(); }); }
function merBack() { say([J('메르가 옥에서 빵 굽는 일을 맡았소. 갚을 때까지 일하겠다고, 동생들에게 미안하다고 전해 달라더이다.'), N('화덕 주인 아낙', '…그 녀석, 동생들이 있었군요. (앞치마를 털며) 알겠어요. 이 바구니에 날마다 한 덩이씩 남겨 두지요. 배고픈 아이가 훔치지 않아도 되게요.', 'tender')],
  () => { E('mer').s = 4; sfx('pickup', { vol: 0.4 }); G.UI.quest(); pop('간수장에게 알려요', '옥으로 돌아가 간수장에게', 'star'); }); }

// ------------------------------------------------------------------ ② 자루 도둑 세베크
Object.assign(QS.x_jail2, { title: '옥에 가둘 자 · 자루 도둑 세베크',
  offer: [N('간수장', '총리님, 남쪽 마을 곳간 앞에서 곡식 자루 다섯을 실어 간 자가 있습니다. 세베크라는 장정이지요.'), N('간수장', '이번 놈은 발이 빠릅니다. 수레 자국부터 읽어 보시고, 달아나거든 쫓아가 붙잡아 주십시오.')],
  obj: stageObj('seb', [['남쪽 마을 곳간 앞에서 수레 자국 읽기', 1], ['세베크 붙잡기 (달아나면 달리기로 쫓아가요)', () => !!(F().caught.culSebek || F().jailed.culSebek)], ['갈대밭에 숨긴 자루 다섯 되싣기', 2], ['옥의 빈 감방 앞에서 「옥에 가두기」', () => !!F().jailed.culSebek]]),
  loc: () => { const k = E('seb').s | 0, f = F(); if (k === 0) return { x: TRK[0], z: TRK[1] }; if (!f.caught.culSebek && !f.jailed.culSebek) return 'npc:culSebek'; if (k === 1) return { x: STASH[0], z: STASH[1] }; if (!f.jailed.culSebek) return { x: CELLS.culSebek[0], z: CELLS.culSebek[1] }; return 'npc:keeper'; },
  prog: () => ['곳간 앞 땅부터 보시지요.', '그놈 발이 빠릅니다. 숨이 찰 때까지 쫓으십시오.', '자루는 어디 숨겼답니까?', '감방 하나를 비워 두었습니다.'][Math.min(3, (E('seb').s | 0) + ((E('seb').s | 0) >= 1 && F().caught.culSebek ? 1 : 0))],
  done: [N('간수장', '자루 다섯이 곳간으로 돌아갔다지요. 남쪽 마을 사람들이 총리님 이름을 부르며 기뻐한답니다.'), N('간수장', '세베크는 흉년이 온다는 말에 겁이 나서 그랬다더군요. 겁은 사람을 도둑으로도 만듭니다.'), T('남쪽 마을 곳간 문 앞에 되찾은 자루 다섯이 쌓였어요.')] });
function sebTracks() { say([T('곳간 문 앞 흙에 바퀴 자국이 깊게 패어 있어요. 짐을 무겁게 실은 자국이에요.')], () => {
  const go = () => ask('수레는 어디로 갔을까?', ['자국이 강 쪽으로 · 바퀴 사이에 나귀 발굽', ''], [['마을 안쪽으로 · 사람 발자국뿐', '그건 아침에 곳간을 드나든 마을 사람들 발자국이에요. 무거운 바퀴 자국을 다시 봐요.'], ['도성 쪽 큰길로 · 소 발굽', '큰길의 소 발굽 자국은 마르고 얕아요. 오늘 생긴 자국이 아니에요.']],
    () => say([J('(나귀 수레가 강가 갈대밭 쪽으로 갔구나.)'), T('담 그늘에서 누군가 이쪽을 엿보다 몸을 돌려요. 세베크예요!')], () => { E('seb').s = 1; G.UI.quest(); }), () => go()); go(); }); }
function sebSacks() { mg('count', { title: '자루 되싣기', hint: '갈대 속에 숨긴 곡식 자루를 하나씩 끌어내 나귀 등에 실어요. 세베크가 고개를 숙이고 함께 들어요.', need: 5, btn: '한 자루 싣기', onPress: () => sfx('thud', { vol: 0.4, pitch: 0.9 }) },
  () => { E('seb').s = 2; G.UI.quest(); say([N('자루 도둑 세베크', '…다섯 자루, 하나도 안 풀었소. 흉년이 온다길래 겁이 나서 그랬소.', 'sad'), J('곡식은 흉년을 위해 모으는 것이네. 혼자 쌓아 두면 그 곡식은 아무도 살리지 못하지.'), T('되찾은 자루는 남쪽 마을 곳간으로 보냈어요 · 이제 세베크를 옥으로')]); }); }

// ------------------------------------------------------------------ ③ 가짜 저울 상인 카
Object.assign(QS.x_jail3, { title: '옥에 가둘 자 · 가짜 저울 상인 카',
  offer: [N('간수장', '총리님, 북쪽 나루에서 저울을 속여 곡식을 판 상인이 있다는 고발이 들어왔습니다. 카라는 자입니다.'), N('간수장', '그런데 증거가 없습니다. 그자는 「저울은 멀쩡하다」고 버티지요. 총리님 눈이라면 가려내실 겁니다.')],
  obj: stageObj('ka', [['나루 사람들의 말 듣기', 1], ['카의 추와 궁의 바른 추 달아 보기', 2], ['깎인 추를 카에게 보이기', 3], ['옥의 빈 감방 앞에서 「옥에 가두기」', () => !!F().jailed.culKa], ['속은 사람들에게 곡식 되돌려 주기 (나루)', 4]]),
  loc: () => { const k = E('ka').s | 0; if (k <= 1) return { x: KAST[0], z: KAST[1] }; if (k === 2) return 'npc:culKa'; if (!F().jailed.culKa) return { x: CELLS.culKa[0], z: CELLS.culKa[1] }; if (k === 3) return { x: RET[0], z: RET[1] }; return 'npc:keeper'; },
  prog: () => ['나루 사람들 말부터 들어 보시지요.', '저울을 달아 보면 알 겁니다.', '증거를 보이면 그자도 할 말이 없겠지요.', '감방 하나를 비워 두었습니다.', '속은 사람들에게도 돌려주셨습니까?'][Math.min(4, E('ka').s | 0)],
  done: [N('간수장', '바른 추가 나루에 놓였다지요. 이제 누구든 제 곡식을 달아 볼 수 있겠습니다.'), N('간수장', '세 사람 다 들어왔으니 애굽 길이 한결 편안하겠습니다. 이건 옥에서 드리는 작은 사례입니다.'), J('「속이는 저울은 여호와의 미워하시는 것」이라 들었소. 바른 추가 백성을 살리지.'), T('북쪽 나루 카의 자리에 궁의 바른 추를 얹은 상이 놓였어요.')] });
function kaListen() { say([N('나루의 아낙', '한 됫박 값을 냈는데 집에 와서 달아 보니 늘 모자라요. 우리 집만 그런 줄 알았지요.'), N('늙은 사공', '카의 저울은 이상하게 늘 그 사람 쪽으로만 기운다오. 그런데 그 사람은 「추는 돌이라 닳을 리 없다」 하지.'), J('(추를 달아 보면 알 수 있겠다. 궁의 바른 추와 나란히.)')], () => { E('ka').s = 1; G.UI.quest(); }); }
function kaWeigh() { say([T('궁에서 가져온 바른 추를 저울 한쪽에, 카의 「한 됫박 추」를 다른 쪽에 얹어요.')], () => mg('balance', { title: '추 달아 보기', hint: '저울대를 수평으로 맞춰 두 추를 견주어요. 흔들림이 멎을 때까지 기다려요.', dur: 9 },
  () => { E('ka').s = 2; sfx('coin', { pitch: 0.8 }); G.UI.quest(); say([T('저울대가 바른 추 쪽으로 툭 내려가요. 카의 추 밑바닥이 반들반들하게 깎여 있어요.'), J('(손으로 깎아 낸 자국이다. 닳은 것이 아니야.)')]); })); }
function kaShow() { const n = Game.npc('culKa'); if (n) { n.talking = true; n.face = Math.atan2(P().x - n.x, P().z - n.z); }
  say([N('가짜 저울 상인 카', '총, 총리님! 저울은 멀쩡하다니까요. 장사꾼끼리 다 그러는…'), J('이 추 밑바닥을 보게. 닳은 돌은 둥글게 닳지, 이렇게 반듯하게 깎이지 않네.'), N('가짜 저울 상인 카', '…(한참 추를 들여다보다 고개를 떨군다) 맞소. 내가 깎았소. 흉년 소문에 곡식 값이 오르니 조금씩, 조금씩…', 'sad'), N('가짜 저울 상인 카', '달아나지 않겠소. 옥으로 가겠소.')],
    () => { fin('culKa'); E('ka').s = 3; F().caught.culKa = 1; walkWith('culKa', true); toast('카가 뒤따라와요 · 옥의 빈 감방 앞으로'); G.UI.quest(); }); }
function kaReturn() { mg('count', { title: '곡식 되돌려 주기', hint: '카의 곳간에서 속인 만큼 됫박으로 달아, 줄 선 사람들에게 한 몫씩 돌려줘요.', need: 6, btn: '한 됫박', onPress: () => sfx('pickup', { vol: 0.4 }) },
  () => { E('ka').s = 4; G.UI.quest(); say([N('나루의 아낙', '모자랐던 만큼 꼭 맞게 돌아왔어요! 총리님, 이 바른 추는 여기 두고 가시나요?'), J('그렇소. 누구든 제 곡식을 이 추로 달아 보시오.'), T('간수장에게 알려요')]); }); }

// ------------------------------------------------------------------ ④ 잃어버린 열쇠꾸러미
{ const q0 = QS.x_keys, fk = q0.finish; Object.assign(q0, { finish() { if (fk) fk.apply(this, arguments); const n = Game.npc('grdPaneb'); if (n) { Game.npcFollow('grdPaneb', false); Game.npcWalk('grdPaneb', -38.6, 2.4, null, 1.2); } },
  obj: [{ t: '간수 데디의 말 듣기', ok: () => F().keys >= 1 }, { t: '데디처럼 항아리에 물 길어 부어 보기 (마당 서쪽)', ok: () => (E('keys').s | 0) >= 1 }, { t: '옥 마당에서 열쇠꾸러미 찾기', ok: () => F().keys >= 2 }, { t: '해 질 녘까지 옥 문 곁에서 기다리기', ok: () => (E('keys').s | 0) >= 2 }, { t: '앙쿠 · 데디와 함께 감방 문 잠그기', ok: () => (E('keys').s | 0) >= 3 }],
  loc: () => { const k = E('keys').s | 0; if (F().keys < 1) return 'npc:grdPaneb'; if (k < 1) return { x: JAR[0], z: JAR[1] }; if (F().keys < 2) return { x: -42.4, z: 10.6 }; if (k < 3) return { x: GATEIN[0], z: GATEIN[1] }; return 'npc:grdSeti'; },
  prog: () => F().keys < 1 ? '데디 녀석이 뭐라고 하던가요?' : F().keys < 2 ? '…마당 어딘가에 떨어뜨렸을지도 모르겠습니다.' : (E('keys').s | 0) < 2 ? '해가 지면 문을 닫습니다. 그때 같이 잠가 보시지요.' : '셋이 같이 세어 보면 다시는 다툴 일이 없겠지요.',
  done: [N('간수 앙쿠', '넷 다 맞았습니다! 이제 열쇠는 이 걸이에 걸고, 넘길 때마다 둘이 함께 세기로 했습니다.'), N('간수 데디', '…앙쿠, 미안하게 됐소. 항아리 물을 붓다가 허리띠 고리가 짚에 걸려 빠졌던 거요.'), N('간수 앙쿠', '아니오, 나도 다짜고짜 의심부터 했소.'), N('간수 데디', '총리님 덕분에 둘 다 목이 붙어 있게 됐습니다.'), T('옥 문 곁 담에 나무 열쇠 걸이가 박혔어요.')] }); }
function keysJar() { mg('rhythm', { title: '물 길어 붓기', hint: '데디가 어젯밤 하던 대로 두레박을 끌어 올려 항아리에 부어요. 박자에 맞춰요.', need: 6, beats: 10, btn: '붓기' },
  () => { E('keys').s = 1; sfx('splash', { vol: 0.5 }); G.UI.quest(); say([T('항아리에 물을 붓느라 몸을 숙일 때마다 허리띠 끝이 곁의 짚더미를 스쳐요.'), J('(데디도 이렇게 숙였겠지. 허리띠에 찬 열쇠꾸러미가 짚에 걸렸다면…)')]); }); }
function keysWait() { const h = hour(); if (!(h >= 6 && h < 18)) { /* (evening or night already: they lock up now) */ E('keys').s = 2; G.UI.quest(); keysLock(); return; }
  standAt('grdSeti', [GATEIN[0] + 2.2, GATEIN[1] + 0.6], -1.6); say([N('간수 앙쿠', '열쇠를 찾으셨군요! …해가 지면 문을 닫고 감방을 다 잠급니다. 그때 데디랑 같이 하나하나 맞춰 보지요.'), T('옥 문 곁에 앉아 해 질 녘을 기다려요 · 자리를 뜨면 기다림이 멈춰요')],
    () => waitAt('keys', GATEIN, 4.2, 10, 18.3, () => { E('keys').s = 2; G.UI.quest(); bub('grdSeti', '해가 졌습니다. 데디!'); setTimeout(keysLock, 400); })); }
function keysLock() { standAt('grdPaneb', [GATEIN[0] - 2.2, GATEIN[1] + 0.4], 1.6);
  say([N('간수 데디', '왔소. 이번엔 셋이 같이 세어 봅시다.'), T('열쇠 넷을 감방 넷의 문에 하나씩 맞춰 돌려요. 앙쿠가 등불을 들고, 데디가 세어요.')],
    () => mg('count', { title: '감방 문 잠그기', hint: '열쇠를 하나씩 맞는 문에 꽂아 돌려요. 「하나… 둘…」 데디가 따라 세어요.', need: 4, btn: '철컥', onPress: () => sfx('click', { pitch: 0.6 }) },
      () => { E('keys').s = 3; sfx('chain', { vol: 0.5, pitch: 1.1 }); G.UI.quest(); toast('넷 다 잠겼어요 · 앙쿠에게 말해요'); })); }

// ------------------------------------------------------------------ ⑤ 억울한 죄수
{ const q0 = QS.x_wrong; Object.assign(q0, {
  obj: [{ t: '창살 사이로 네브카에게 물 한 그릇 건네기', ok: () => !!E('wrong').water }, { t: '은잔 주인 하피의 이야기 듣기 (장터)', ok: () => F().wrong >= 1 }, { t: '바람 부는 한낮까지 노점 곁에서 지켜보기', ok: () => !!E('wrong').wind }, { t: '장터 노점 뒤에서 은잔 찾기', ok: () => F().wrong >= 2 }, { t: '간수장에게 은잔 보여 주기', ok: () => F().wrong >= 3 }, { t: '감방 문을 열고 네브카와 함께 하피에게 가기', ok: () => !!E('wrong').met }],
  loc: () => { const w = E('wrong'), f = F(); if (!w.water) return w.cup ? { x: BARS1[0], z: BARS1[1] } : { x: JAR[0], z: JAR[1] }; if (f.wrong < 1) return 'npc:hapi'; if (!w.wind) return { x: STALLH[0], z: STALLH[1] }; if (f.wrong < 2) return { x: -15.8, z: -77.6 }; if (f.wrong < 3) return 'npc:keeper'; if (!w.out) return { x: BARS1[0], z: BARS1[1] }; if (!w.met) return 'npc:hapi'; return 'npc:nebka'; },
  prog: () => { const w = E('wrong'), f = F(); return !w.water ? '…목이 마릅니다, 총리님.' : f.wrong < 1 ? '…하피 어른은 장터에 계실 겁니다.' : f.wrong < 3 ? '…그날은 바람이 몹시 불었습니다.' : '…정말 나가는 겁니까?'; },
  done: [N('은잔 주인 하피', '(은잔을 받아 들고) 네브카, 내가 자네를 의심했네. 바람을 탓할 걸 사람을 탓했어. 용서하게.', 'sad'), N('죄수 네브카', '…어르신, 저는 그날 노점 곁에서 일거리를 찾고 있었습니다.'), N('은잔 주인 하피', '그렇다면 내 노점에서 일하게. 차양 줄부터 단단히 매 주게나. 다시는 아무것도 바람에 굴러가지 않게.', 'happy'), J('나도 이 옥에서 그렇게 기다렸다네. 하나님은 기다리는 사람을 잊지 않으시지.')],
  finish: () => { F().freed = 1; standAt('nebka', NEBST, 2.6); const n = Game.npc('nebka'); if (n) { n.d.x = NEBST[0]; n.d.z = NEBST[1]; } } }); }
function wrongCup() { E('wrong').cup = 1; sfx('splash', { vol: 0.4, pitch: 1.3 }); toast('물 한 그릇을 떴어요 · 네브카의 감방 창살로'); G.UI.quest(); }
function wrongWater() { const n = Game.npc('nebka'); if (n) n.talking = true;
  say([T('창살 사이로 물그릇을 내밀어요. 네브카가 두 손으로 받아 단숨에 마셔요.'), N('죄수 네브카', '…이 옥에서 누가 제게 먼저 물을 준 건 처음입니다.', 'tender'), J('(나도 이 옥에서 날마다 물을 날랐지. 목마른 사람의 말은 물을 마신 다음에야 들린다.)')],
    () => { fin('nebka'); const w = E('wrong'); w.water = 1; w.cup = 0; G.UI.quest(); }); }
function wrongWind() { const h = hour(); const go = () => { E('wrong').wind = 1; G.UI.quest(); sfx('wind', { vol: 0.6 }); narr({ t: '바람이 불어요', s: '한낮이 되자 강에서 더운 바람이 몰려와요. 차양이 펄럭이고, 노점 동쪽 끝 상에 놓인 그릇 하나가 굴러 뒤쪽 바구니 속으로 툭 떨어져요.' }, () => toast('노점 뒤 바구니를 살펴봐요')); };
  if (h >= 13 && h < 17) { go(); return; } if (!(h >= 6 && h < 13)) { toast('바람은 한낮에 불어요 · 자고 나서 아침에 다시 와 앉아요'); return; } say([T('하피의 말로는 잔이 없어진 날 한낮에 바람이 몹시 불었대요. 노점 곁에 앉아 그 시각을 기다려요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('wrong', STALLH, 4.2, 10, 13.5, go)); }
function wrongOpen() { const n = Game.npc('nebka'); if (!n) return; G.UI.fade(() => { Game.npcTo('nebka', BARS1[0], BARS1[1] + 0.9, Math.PI, false); sfx('door', { pitch: 0.7 }); sfx('chain', { vol: 0.5 }); },
  () => { E('wrong').out = 1; walkWith('nebka', true); G.UI.quest(); say([N('죄수 네브카', '…문이, 열렸습니다. (햇빛에 눈을 가리며) 총리님, 하피 어른께… 같이 가 주시겠습니까?'), J('그러세. 함께 가세.')]); }); }

// ------------------------------------------------------------------ the old prison buttons: in the new order (chase only for Sebek · no grabbing Mer or Ka · the straw and the basket after their steps)
{ const i = Game.CTX.findIndex(f => /catch:/.test(String(f)) && /옥에 가두기/.test(String(f))); if (i >= 0) { const f0 = Game.CTX[i];
  Game.CTX[i] = function (s) { const r = f0.apply(this, arguments); if (!r) return r; const o = r.filter(x => { const k = x.key || '';
    if (k === 'catch:culMer' || k === 'catch:culKa') return false;
    if (k === 'catch:culSebek' && (E('seb').s | 0) < 1) return false;
    if (k === 'jail:culSebek' && (E('seb').s | 0) < 2) return false;
    if (k === 'px:짚더미 뒤지기' && (E('keys').s | 0) < 1) return false;
    if (k === 'px:노점 뒤 바구니 살피기' && !E('wrong').wind) return false;
    return true; }); return o.length ? o : null; }; } }
/* Mer and Ka do not run (they are found and talked to); Sebek runs only once his tracks are read */
const calm = id => { if (!S() || !S().flags) return false; const f = F(); if (f.caught[id] || f.jailed[id]) return false; if (id === 'culMer') return on('x_jail1'); if (id === 'culKa') return on('x_jail3'); if (id === 'culSebek') return on('x_jail2') && (E('seb').s | 0) < 1; return false; };
{ const w0 = Game.npcWalk; Game.npcWalk = function (id) { if (calm(id)) return; return w0.apply(this, arguments); }; }
{ const b0 = G.Life.bubble; if (b0) G.Life.bubble = function (id) { if (calm(id)) return; return b0.apply(this, arguments); }; }
/* Hapi's talk waits for the wind step only if the water came first is not needed — but after the walk she answers Nebka's scene */
{ const lt0 = G.Life.talk; G.Life.talk = function (id) {
    if (id === 'nebka' && on('x_wrong') && E('wrong').out && !E('wrong').met) { toast('네브카와 함께 장터의 하피에게 가요'); return true; }
    return lt0.apply(this, arguments); }; }

// ------------------------------------------------------------------ 행동 단추
Game.CTX.push(function (s) { const p = P(); if (!s || p.ride || p.act || Game.cineOn || G.UI.busy() || (s.q && s.q.riding)) return null; const out = [];
  const at = (pt, r, label, key, use) => { if (!pt) return; const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  const f = F();
  if (on('x_jail1')) { const k = E('mer').s | 0, n = Game.npc('culMer'); if (k === 0) at(OVENW, 4, '화덕 주인에게 묻기', 'pqM0', merOven); if (k === 1) at(CRUMB, 3.6, '빵 부스러기 따라가기', 'pqM1', merCrumbs); if (k === 2 && n && n.vis) at([n.x, n.z], 2.6, '곁에 앉아 빵 건네기', 'pqM2', merBread); if (k === 3 && f.jailed.culMer) at(OVENW, 4, '화덕 주인에게 메르의 말 전하기', 'pqM3', merBack); }
  if (on('x_jail2')) { const k = E('seb').s | 0; if (k === 0) at(TRK, 4, '곳간 앞 수레 자국 읽기', 'pqS0', sebTracks); if (k === 1 && f.caught.culSebek && npcNear('culSebek', 8)) at(STASH, 4.5, '갈대 속 자루 되싣기', 'pqS1', sebSacks); }
  if (on('x_jail3')) { const k = E('ka').s | 0, n = Game.npc('culKa'); if (k === 0) at(KAST, 4, '나루 사람들 말 듣기', 'pqK0', kaListen); if (k === 1) at(KAST, 4, '추 달아 보기', 'pqK1', kaWeigh); if (k === 2 && n && n.vis) at([n.x, n.z], 2.6, '깎인 추를 보이기', 'pqK2', kaShow); if (k === 3 && f.jailed.culKa) at(RET, 5, '곡식 되돌려 주기', 'pqK3', kaReturn); }
  if (on('x_keys')) { const k = E('keys').s | 0; if (f.keys >= 1 && k === 0) at(JAR, 2.6, '항아리에 물 길어 붓기', 'pqY0', keysJar); if (f.keys >= 2 && k === 1 && !waiting('keys')) at(GATEIN, 4, '옥 문 곁에서 해 질 녘 기다리기', 'pqY1', keysWait); if (k === 2) at(GATEIN, 4.5, '셋이 함께 감방 문 잠그기', 'pqY2', keysLock); }
  if (on('x_wrong')) { const w = E('wrong'); if (!w.water && !w.cup) at(JAR, 2.6, '물 한 그릇 뜨기', 'pqW0', wrongCup); if (!w.water && w.cup) at(BARS1, 2.4, '창살 사이로 물 건네기', 'pqW1', wrongWater); if (f.wrong >= 1 && !w.wind && !waiting('wrong')) at(STALLH, 4, '노점 곁에 앉아 한낮 기다리기', 'pqW2', wrongWind); if (f.wrong >= 3 && !w.out) at(BARS1, 2.6, '감방 문 열어 주기', 'pqW3', wrongOpen); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ 기다림 · 함께 걷기 · 자리 지키기
let tk = 0;
const up0 = EP.update; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play' || !s || !s.q || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try {
    if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); s.time = Game.clockTo(s, w.endH); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } }
    if ((tk -= d) > 0) return r; tk = 0.3; const f = F();
    /* ① Mer sits in the wall's shade until he is found */
    if (on('x_jail1') && (E('mer').s | 0) >= 2 && !f.caught.culMer && !f.jailed.culMer) { const n = Game.npc('culMer'); if (n && !n.talking) n.sit = true; }
    /* ⑤ Nebka walks with Joseph to Hapi; there they meet */
    if (on('x_wrong')) { const w = E('wrong'), n = Game.npc('nebka');
      if (n && w.out && !w.met) { if (!n.follow && !n.talking && Math.hypot(n.x - p.x, n.z - p.z) > 1.5) walkWith('nebka', true);
        if (npcNear('hapi', 4.5) && Math.hypot(n.x - p.x, n.z - p.z) < 6) { w.met = 1; standAt('nebka', NEBST, 2.6); const h = Game.npc('hapi'); if (h) h.face = Math.atan2(NEBST[0] - h.x, NEBST[1] - h.z);
          say([N('은잔 주인 하피', '…네브카? 자네가 어찌…'), J('어르신의 잔은 바람에 굴러 바구니 속에 있었소. 이 사람은 아무 죄가 없소.'), T('네브카에게 말을 걸어 마무리해요')], () => G.UI.quest()); } } }
    /* after: Nebka works beside Hapi's stall (also after a reload) */
    if (f.freed && !on('x_wrong')) { const n = Game.npc('nebka'); if (n && !n.follow && !n.walk && !n.talking && Math.hypot(n.x - NEBST[0], n.z - NEBST[1]) > 2.5) standAt('nebka', NEBST, 2.6); }
  } catch (e) { console.error('prisonq', e); }
  return r; };
/* (the old finish walked Nebka out through the gate and away: he stays at the market now) */
{ const n0 = EP.npcs.find(n => n.id === 'nebka'); if (n0) { const sh = n0.show; n0.show = s => (F().freed ? true : sh(s)); } }

// ------------------------------------------------------------------ 흔적
const MS = {}, MP = []; let mk = 0;
const mkM = (seed, fn) => { const g = new G.GB(seed); fn(g); return G.R.mesh(g); };
function meshes() {
  MS.basket = mkM(901, g => { g.lathe([[0.3, 0], [0.38, 0.1], [0.42, 0.28]], 12, { c: 0xb8925a }); for (let i = 0; i < 4; i++) g.sph(0.13, 7, 5, { at: [Math.cos(i * 1.6) * 0.16, 0.3, Math.sin(i * 1.6) * 0.16], s: [1.2, 0.7, 1], c: 0xc8904a }); g.box(0.04, 0.6, 0.04, { at: [0.5, 0.3, 0], c: 0x6a4a30 }); g.box(0.32, 0.2, 0.02, { at: [0.5, 0.62, 0], c: 0xe0d0a8 }); });
  MS.sacks = mkM(902, g => { for (let i = 0; i < 5; i++) g.sph(0.34, 8, 6, { at: [(i % 3 - 1) * 0.62, 0.32 + Math.floor(i / 3) * 0.5, (i % 2) * 0.12], s: [0.9, 1.1, 0.8], c: [0xc8b088, 0xb8a078][i % 2], j: 0.06 }); });
  MS.weights = mkM(903, g => { g.box(1.1, 0.06, 0.6, { at: [0, 0.72, 0], c: 0x8a6a48 }); for (const [x, z] of [[-0.48, -0.24], [0.48, -0.24], [-0.48, 0.24], [0.48, 0.24]]) g.box(0.06, 0.7, 0.06, { at: [x, 0.35, z], c: 0x6a4a30 });
    for (let i = 0; i < 5; i++) g.sph(0.05 + i * 0.022, 8, 6, { at: [-0.38 + i * 0.17, 0.77 + (0.05 + i * 0.022) * 0.8, 0.05], s: [1, 0.8, 1], c: 0x5a5a62 }); g.box(0.02, 0.5, 0.02, { at: [0.3, 1.0, -0.15], c: 0x6a4a30 }); g.box(0.6, 0.02, 0.02, { at: [0.3, 1.25, -0.15], c: 0x6a4a30 }); });
  MS.hook = mkM(904, g => { g.box(0.9, 0.3, 0.05, { at: [0, 1.5, 0], c: 0x7a5a3a }); for (let i = 0; i < 4; i++) { g.cyl(0.02, 0.02, 0.1, 5, { at: [-0.3 + i * 0.2, 1.48, 0.06], rx: Math.PI / 2, c: 0x4a3a2a }); g.cyl(0.04, 0.04, 0.012, 8, { at: [-0.3 + i * 0.2, 1.36, 0.08], rx: Math.PI / 2, c: 0xb09050 }); g.box(0.02, 0.1, 0.01, { at: [-0.3 + i * 0.2, 1.27, 0.08], c: 0x9a8a6a }); } });
  MS.ok = 1; }
const put = (list, mesh, q, ry) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, q[0], hAt(q[0], q[1]), q[1], ry || 0, 0, 0, 1, 1, 1); list.push({ mesh, m, outline: true }); };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.pq) return; try { if (!MS.ok) meshes(); mk = 0; const pq = s.flags.pq, p = P(), within = (q, r) => Math.hypot(q[0] - p.x, q[1] - p.z) < (r || 70), g = k => (pq[k] && pq[k].s) | 0;
    if (g('mer') >= 4 && within(OVENW)) put(list, MS.basket, [OVENW[0] + 1.1, OVENW[1] + 0.6], 0.4);
    if (on('x_jail2') && g('seb') < 2 && within(STASH)) put(list, MS.sacks, STASH, 0.8);
    if (g('seb') >= 2 && within(TRK)) put(list, MS.sacks, [TRK[0] - 1.6, TRK[1] - 0.8], 0.2);
    if (g('ka') >= 4 && within(KAST)) put(list, MS.weights, [KAST[0] + 0.8, KAST[1] + 0.4], 0.3);
    if (g('keys') >= 3 && within(HOOK)) put(list, MS.hook, HOOK, Math.PI); /* (the hooks toward the yard) */
  } catch (e) { console.error('prisonq dyn', e); } };
G.PrisonQ = { E, WT: () => WT, at: { OVENW, CRUMB, MER, TRK, STASH, KAST, RET, JAR, GATEIN, HOOK, BARS1, STALLH, NEBST } };
})(window.G);
