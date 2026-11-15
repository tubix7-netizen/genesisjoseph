/* 약속의 길 — v18.62 깊은 부탁 넷 (deepq.js)
   여러 곳을 오가고, 사람마다 다른 이야기를 듣고, 고른 대답에 따라 끝이 달라지는 부탁들이에요.
   부탁은 이야기가 쉬는 때(풍년 1·2년, 본편을 마친 뒤)에만 열려요(life.js L.avail · game.js CALM).
   ① 르우벤의 빈 구덩이 (본편 뒤 · 고센의 르우벤 → 도단의 구덩이 → 고센)   창 37:21–30
   ② 장터의 히브리 소년 (총리 때 · 노예 장터 → 값 치르기 → 남쪽 마을의 어머니)
   ③ 온 신전의 물음 (총리 때 · 아스낫 → 온의 제사장 보디베라 → 아스낫)   창 41:16, 45
   ④ 모자란 곡식 자루 (총리 때 · 곳간 서기 → 자루 세기 → 일꾼 둘 → 흘린 낟알 → 과부 → 결정)
   저장: S.flags.dq = { pit, pitWay, boy, boyWay, on, onWay, sack, w1, w2, sackWay } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ls = G.Lands; if (!Game || !EP || !EP.quests || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, QS = EP.quests;
const F = () => { const s = S(); return s.flags.dq || (s.flags.dq = {}); };
const ord = () => Game.stepOrder(), idx = k => ord().indexOf(k), after = k => { const s = S(); return !!s && idx(s.step) >= idx(k); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e, ref) => ({ n: nm(id), t, e, ref }), J = (t, e, ref) => ({ n: '요셉', t, e, ref }), T = (t, ref) => ({ n: '', t, ref });
const look = (k, o) => Object.assign({}, (Ls && Ls.lookOf(k)) || {}, o || {});
const near = (x, z, r) => Math.hypot(P().x - x, P().z - z) < r;
const fin = id => { const n = Game.npc(id); if (n) n.talking = false; };
const vizier = s => idx(s.step) >= idx('c5_patrol') && !(s.q && s.q.finale);

// ------------------------------------------------------------------ 사람들
const MARKET = [-8, 118], SOUTH = [-145, 128], ON = [12, -96], GRAN = [16, -64], PIT = { x: 168, z: -140 };
const WIDOW = [-2, -48];
EP.npcs.push(
  { id: 'dqBoy', name: '묶인 히브리 소년', look: look('benjamin', { top: 0x9a8a6a, trim: 0x5a4a3a, sash: 0x5a4a3a, skin: 0xd09a6a }), scale: 0.66, x: MARKET[0] + 4, z: MARKET[1] + 3, face: Math.PI, talkR: 2.6, noBond: true,
    show: s => vizier(s) && !((s.flags.dq || {}).boy >= 4) },
  { id: 'dqTrader', name: '노예 상인 하르웨', look: look('ishmael', { clothCol: 0x5a3a2a }), x: MARKET[0] + 6.2, z: MARKET[1] + 4.6, face: -2.4, talkR: 2.6, noBond: true,
    show: s => vizier(s) && !((s.flags.dq || {}).boy >= 2), chat: ['좋은 물건 있소이다. 튼튼한 아이들이오.', '값만 맞으면 누구든 데려가시오.'] },
  { id: 'dqMother', name: '베 짜는 여종 아다', look: look('leah', { age: undefined, top: 0x8a7a6a, clothCol: 0xd8c8a8, hair: 0x2a1a10 }), x: SOUTH[0] - 3, z: SOUTH[1] + 3, face: 0.6, talkR: 2.6, noBond: true, act: 'gather',
    show: s => vizier(s) && ((s.flags.dq || {}).boy >= 2) },
  { id: 'dqPoti', name: '온의 제사장 보디베라', look: look('priest', { collar: 0xe0b040, collar2: 0x2a5aa0 }), x: ON[0] + 3, z: ON[1] + 8, face: Math.PI, talkR: 2.8, noBond: true,
    show: s => vizier(s) && ((s.flags.dq || {}).on >= 1) },
  { id: 'dqClerk', name: '곳간 서기 네페르', look: look('scribe'), x: GRAN[0] + 4, z: GRAN[1] + 5, face: -2.4, talkR: 2.6, noBond: true,
    show: s => vizier(s) && !!(s.built && s.built.granA), chat: ['오늘 들어온 자루가 몇인지 적고 있습니다.', '장부가 맞아야 마음이 놓이지요.'] },
  { id: 'dqW1', name: '짐꾼 바키', look: look('farmer', { skin: 0x8a5a34 }), x: GRAN[0] - 3, z: GRAN[1] + 6, face: 0.8, talkR: 2.4, noBond: true, act: 'carry',
    show: s => vizier(s) && ((s.flags.dq || {}).sack >= 1) },
  { id: 'dqW2', name: '짐꾼 세티', look: look('farmer', { skin: 0xa06a40, hairStyle: 'bald' }), x: GRAN[0] + 7, z: GRAN[1] - 2, face: -1.2, talkR: 2.4, noBond: true,
    show: s => vizier(s) && ((s.flags.dq || {}).sack >= 1) },
  { id: 'dqWidow', name: '과부 메레트', look: look('woman', { top: 0x9a8a72, collar: 0x6a5a48 }), x: WIDOW[0], z: WIDOW[1], face: 2.6, talkR: 2.6, noBond: true, act: 'sitg',
    show: s => vizier(s) && ((s.flags.dq || {}).sack >= 3) },
  { id: 'dqWidowKid', name: '메레트의 아이', look: look('cowboy'), scale: 0.6, x: WIDOW[0] + 1.2, z: WIDOW[1] + 0.6, face: 2.2, noTalk: true, noBond: true,
    show: s => vizier(s) && ((s.flags.dq || {}).sack >= 3) },
  { id: 'dqReuben', name: '르우벤', look: look('reuben'), x: PIT.x + 2.6, z: PIT.z + 1.4, face: -2, talkR: 2.8, noBond: true,
    show: s => s.step === 'j_end' && (s.flags.dq || {}).pit === 1 }
);

// ------------------------------------------------------------------ ① 르우벤의 빈 구덩이
QS.dq_pit = { giver: 'reuben', title: '르우벤의 빈 구덩이', when: s => s.step === 'j_end' && !!s.q.goshen && s.side && s.side.done && s.side.done.g_lamb !== undefined,
  offer: ['요셉아… 요즘도 그 꿈을 꾼다. 도단의 그 구덩이, 내가 밤에 돌아가 보니 비어 있던 그 구덩이.',
    '가나안 길이 다시 열렸다지. 한 번만… 나와 함께 그 자리에 가 주겠느냐? 내가 먼저 가 있으마. 도단 들판, 북쪽 길 끝이다.'],
  start(s) { F().pit = 1; },
  obj: [{ t: '도단의 그 구덩이에서 르우벤 만나기', ok: s => (F().pit | 0) >= 2 }],
  loc: s => (F().pit | 0) < 2 ? { x: PIT.x + 2, z: PIT.z + 1 } : null,
  prog: s => (F().pit | 0) < 2 ? '도단 들판 북쪽, 그 구덩이다. 거기서 기다리마.' : '돌아왔구나. 이리 와 앉거라.',
  done: s => { const w = F().pitWay; const end = w === 'fill' ? [L('reuben', '그 구덩이에 돌을 채우고 오니, 이상하게 밤이 짧아졌다. 꿈에서도 이젠 비어 있지 않구나.', 'tender')]
      : w === 'down' ? [L('reuben', '네가 그 바닥에 서서 나를 올려다볼 때… 스무 해 전 그 눈을 다시 봤다. 그런데 이번엔 웃고 있더구나.', 'cry')]
      : [L('reuben', '그 자리에서 네가 드린 기도를 오래 생각했다. 나를 위해 기도하는 아우라니.', 'tender')];
    return end.concat([L('reuben', '아버지께도 말씀드렸다. 그 옷을 들고 가던 날 내가 무엇을 했는지 다. …아버지가 내 머리에 손을 얹으시더라.', 'cry'), J('형님, 이제 그 구덩이는 비어 있어도 괜찮아요. 제가 여기 있잖아요.', 'tender'),
      T('「르우벤이 구덩이에 돌아와 본즉 요셉이 없는지라 옷을 찢고」(창 37:29). 스무 해 넘게 찢겨 있던 마음이 오늘 조금 꿰매졌습니다.')]); },
  finish(s) { F().pit = 3; }, reward: { silver: 12, insight: 2, heart: 1 } };
function pitScene() { const f = F(); f.pit = 1.5; const r = Game.npc('dqReuben'); if (r) { r.face = Math.atan2(P().x - r.x, P().z - r.z); r.talking = true; }
  narr([{ kick: '창세기 37:21–24', title: '도단의 구덩이', t: '르우벤이 듣고 요셉을 그들의 손에서 구원하여 내어 그 아비에게로 돌리려 하여… 그를 잡아 구덩이에 던지니 그 구덩이는 빈 것이라 그 속에 물이 없었더라.', ref: '창세기 37:22–24' }],
    () => say([L('reuben', '여기다. 이 돌, 이 마른 흙… 하나도 안 변했구나.', 'sad'), L('reuben', '나는 너를 살리려고 이 구덩이를 말했다. 밤에 와서 꺼내 아버지께 데려가려고. 그런데 내가 양 떼를 보러 간 사이에…', 'cry'),
      L('reuben', '돌아와 보니 비어 있었다. 내가 옷을 찢으며 소리쳤지. 「아이가 없도다. 나는 어디로 갈꼬」(창 37:30). 그 뒤로 스무 해, 나는 이 구덩이 옆에서 산 것 같다.', 'cry'),
      { n: '요셉', t: '(르우벤 형님에게 무엇을 해 줄까?)', choices: [
        { t: '"형님, 우리 이 구덩이를 함께 메워요."', then: () => { f.pitWay = 'fill'; }, lines: [T('두 형제는 들에서 돌을 날라 구덩이에 하나씩 넣었습니다. 해가 기울 무렵, 구덩이는 반쯤 메워졌습니다.'), L('reuben', '…돌 하나 넣을 때마다 숨이 하나씩 쉬어지는구나.', 'tender')] },
        { t: '(구덩이 안으로 내려가 형님을 올려다본다)', then: () => { f.pitWay = 'down'; }, lines: [T('요셉은 구덩이 바닥에 내려가 섰습니다. 스무 해 전처럼 위를 올려다보니, 구덩이 가장자리에 르우벤의 얼굴이 보였습니다.'), J('형님, 저 여기 있어요. 이번엔 형님이 와 주셨네요.', 'tender'), L('reuben', '(손을 뻗으며) 잡아라, 요셉아. 이번엔 내가 꺼낸다.', 'cry')] },
        { t: '"형님을 위해 여기서 기도할게요."', then: () => { f.pitWay = 'pray'; P().emote = { k: 'pray', t: 0, dur: 4 }; }, lines: [J('하나님, 이 구덩이를 기억하시는 분이시여. 형님의 밤을 거두어 주세요. 그날 저를 살리려던 형님의 마음을 기억해 주세요.', 'tender'), L('reuben', '…아멘. (오래 고개를 숙이고 있다)', 'cry')] }] },
      L('reuben', '이제 돌아가자, 아우야. 고센에서 다시 이야기하자. 나는 먼저 걸어가마.', 'tender')], () => { fin('dqReuben'); f.pit = 2; G.UI.quest(); pop('구덩이 앞에서', '고센으로 돌아가 르우벤과 이야기해요', 'star'); })); }

// ------------------------------------------------------------------ ② 장터의 히브리 소년
QS.dq_boy = { giver: 'dqBoy', title: '장터의 히브리 소년', when: s => vizier(s),
  offer: S => [{ n: '묶인 히브리 소년', t: '(줄에 묶인 채 고개를 들고, 히브리 말로) …물… 물 좀 주세요…', e: 'weary' }, T('요셉은 걸음을 멈췄습니다. 고향 말이었습니다. 스무 해 전 이 장터에 묶여 서 있던 열일곱 살 소년이 떠올랐습니다.'),
    J('(히브리 말로) 얘야, 이름이 무엇이냐? 어디서 왔느냐?', 'tender'), { n: '묶인 히브리 소년', t: '…엘리압이에요. 브엘세바 근처에서 흉년에 어머니랑 같이 팔려 왔어요. 어머니는 어제 다른 사람이 데려갔어요…', e: 'cry' }],
  start(s) { F().boy = 1; },
  obj: [{ t: '노예 상인 하르웨와 이야기하기', ok: s => (F().boy | 0) >= 2 }, { t: '남쪽 마을에서 엘리압의 어머니 찾기', ok: s => (F().boy | 0) >= 3 }],
  loc: s => { const b = F().boy | 0; return b < 2 ? { x: MARKET[0] + 6, z: MARKET[1] + 3.6 } : b < 3 ? { x: SOUTH[0] - 3, z: SOUTH[1] + 2 } : null; },
  prog: s => (F().boy | 0) < 2 ? { n: '묶인 히브리 소년', t: '(상인 쪽을 겁먹은 눈으로 본다)', e: 'fear' } : (F().boy | 0) < 3 ? { n: '엘리압', t: '어머니는 남쪽 마을에 계신대요… 꼭 찾아 주세요.', e: 'sad' } : { n: '엘리압', t: '총리님!', e: 'happy' },
  done: s => [{ n: '엘리압', t: '(어머니 치마폭에 매달려) 총리님… 어머니를 찾아 주셔서 고맙습니다.', e: 'cry' }, L('dqMother', '나리, 우리 같은 사람을 위해 이 먼 길을… 나리도 히브리 사람이라 들었습니다.', 'cry'),
    J('나도 열일곱에 저 장터에 묶여 서 있었소. 은 이십에 팔려서.', 'tender'), L('dqMother', '…그런데 지금은 온 애굽을 먹이시는군요.', 'awe'),
    { n: '요셉', t: '(두 사람의 앞날을 어떻게 할까?)', choices: [
      { t: '"고센에 우리 히브리 사람들이 살고 있소. 거기로 가시오."', then: () => { F().boyWay = 'goshen'; }, lines: [L('dqMother', '고센… 우리 말을 하는 사람들 곁에서 살 수 있다니요.', 'happy'), T('엘리압과 어머니는 고센으로 떠났습니다. 훗날 고센의 아이들 가운데 엘리압이라는 목동이 있었다고 해요.')] },
      { t: '"이 마을 베 짜는 집에서 품삯을 받으며 자유롭게 일하시오."', then: () => { F().boyWay = 'south'; }, lines: [L('dqMother', '종이 아니라 품꾼으로요? …네, 나리. 이 손으로 엘리압을 먹이겠어요.', 'tender'), T('아다는 남쪽 마을에서 품삯을 받는 베 짜는 여인이 되었습니다. 엘리압은 마을 아이들과 나일 강에서 헤엄을 배웠어요.')] }] },
    { n: '엘리압', t: '총리님, 저도 크면 총리님처럼 묶인 사람을 풀어 주는 사람이 될래요!', e: 'happy' }],
  finish(s) { F().boy = 4; }, reward: { insight: 2, items: { flower: 1 } } };
function haggle() { const s = S(), f = F(); say([L('dqTrader', '아, 총리님! 이 히브리 아이 말씀이십니까? 튼튼하고 말도 잘 듣습니다. 은 서른이면 드리지요.', 'happy'),
  { n: '요셉', t: `(가진 은 ${s.silver})`, choices: [
    { t: s.silver >= 30 ? '"은 서른을 치르겠소. 이 아이는 오늘부터 자유요."' : '"은 서른을 치르겠소." (은이 모자라요)', then: () => { if (s.silver < 30) { setTimeout(() => say([J('(은이 모자라다. 곡식이나 다른 것으로 치를 수도 있겠다.)')], () => fin('dqTrader')), 30); return; } Game.silver(-30); free('silver'); } },
    { t: Game.have('grain', 2) ? '"곡식 자루 둘로 치르겠소. 흉년엔 은보다 귀하지."' : '"곡식 자루로 치르겠소." (곡식 자루 2개가 필요해요)', then: () => { if (!Game.have('grain', 2)) { setTimeout(() => say([J('(곡식 자루가 모자라다. 곳간이나 장터에서 구해 와야겠다.)')], () => fin('dqTrader')), 30); return; } Game.take('grain', 2); free('grain'); } },
    { t: '"이 아이를 판 값은 누가 받았소?" (따져 묻는다)', then: () => setTimeout(() => say([L('dqTrader', '…흉년에 제 발로 팔려 온 어미와 아이입니다, 나리. 저도 값을 치르고 샀소. 억울하면 값을 치르시지요.', 'cold'), J('(…법대로라면 그의 말이 맞다. 값을 치러 자유를 사 주자.)')], () => haggle()), 30) }] }], null);
  function free(how) { f.boy = 2; sfx('coins'); setTimeout(() => say([L('dqTrader', how === 'grain' ? '곡식 두 자루라… 이 흉년에 아주 후하십니다. 가거라, 꼬마야.' : '거래 끝! 가거라, 꼬마야.', 'happy'), T('요셉이 소년의 줄을 손수 풀었습니다.'),
    { n: '엘리압', t: '…저 이제 어디로 가요?', e: 'fear' }, J('네 어머니를 찾으러 가자. 데려간 사람이 남쪽 마을 사람이라 했지? 내 청지기가 너를 먼저 그리 데려갈 것이다. 나도 곧 가마.', 'tender')],
    () => { fin('dqTrader'); fin('dqBoy'); const b = Game.npc('dqBoy'); if (b) { b.d.x = SOUTH[0] - 1.8; b.d.z = SOUTH[1] + 3.4; b.x = b.d.x; b.z = b.d.z; b.face = b.homeFace = 0.4; } G.UI.quest(); pop('엘리압이 자유가 되었어요', '남쪽 마을에서 어머니를 찾아요', 'star'); }), 40); } }
function mother() { const f = F(); if ((f.boy | 0) !== 2) { say([L('dqMother', (f.boy | 0) > 2 ? '엘리압이 옆에 있으니 이 베틀이 하나도 무겁지 않아요.' : '(베를 짜며) …', 'tender')], () => fin('dqMother')); return; }
  say([L('dqMother', '(베를 짜다 고개를 든다) …누구신지요? 이 마을에 나리 같은 분이 무슨 일로…', 'fear'), J('브엘세바에서 온 아다요? 엘리압의 어머니?'), L('dqMother', '…엘리압을 아세요? 그 아이가 살아 있어요? 어제 장터에서 떨어진 뒤로…', 'cry'),
    { n: '엘리압', t: '어머니!!', e: 'cry' }, T('소년이 마당으로 뛰어 들어왔습니다. 여인은 베틀을 밀치고 아들을 끌어안았습니다. 한참 동안 아무도 말을 하지 못했습니다.'),
    J('(…아버지도 나를 이렇게 안고 싶으셨겠지.)', 'tender')], () => { fin('dqMother'); f.boy = 3; G.UI.quest(); pop('어머니를 찾았어요', '엘리압에게 말을 걸어요', 'star'); }); }

// ------------------------------------------------------------------ ③ 온 신전의 물음
QS.dq_on = { giver: 'asenath', title: '온 신전의 물음', when: s => vizier(s),
  offer: ['여보, 아버지께서 당신을 한번 뵙고 싶어 하세요. 온의 신전에서요.', '아버지는 평생 하늘의 해를 섬긴 제사장이에요. 그런데 당신이 바로의 꿈을 푼 뒤로 밤마다 같은 걸 물으세요. 「왜 우리 신들은 그 꿈을 몰랐을까」 하고요.', '…아버지와 이야기해 주시겠어요?'],
  start(s) { F().on = 1; },
  obj: [{ t: '온의 신전에서 제사장 보디베라 만나기', ok: s => (F().on | 0) >= 2 }],
  loc: s => (F().on | 0) < 2 ? { x: ON[0] + 3, z: ON[1] + 6.6 } : null,
  prog: s => (F().on | 0) < 2 ? '아버지는 온의 신전 앞뜰에 계실 거예요.' : '아버지와 무슨 이야기를 나누셨어요?',
  done: s => { const w = F().onWay; return [L('asenath', '아버지가 오늘 편지를 보내셨어요. 「네 남편은 자기를 높이지 않더구나」라고요.', 'tender'),
    w === 'humble' ? L('asenath', '아버지는 평생 「내가 안다」고 말하는 사람들만 보셨대요. 「내가 아니라」고 말하는 사람은 처음이라고.', 'awe') : L('asenath', '아버지가 그러셨어요. 당신은 많은 걸 알지만, 그 앎이 어디서 오는지 아는 사람이라고.', 'tender'),
    L('asenath', '그리고 이걸 므낫세와 에브라임에게 주라고 하셨어요. 아버지가 젊을 때 지니던 청금석이래요.', 'happy'),
    J('고맙게 받겠소. 아이들에게 외할아버지 이야기를 해 주어야겠구려.', 'tender')]; },
  finish(s) { F().on = 3; }, reward: { insight: 2, items: { lapis: 1 } } };
function poti() { const f = F(); if ((f.on | 0) !== 1) { say([L('dqPoti', (f.on | 0) >= 2 ? '해는 날마다 뜨지. 그런데 그 해를 뜨게 하는 이가 따로 있다는 말을, 요즘 자주 생각하오.' : '…총리시군요.', 'tender')], () => fin('dqPoti')); return; }
  say([L('dqPoti', '오셨소, 사위. (앞뜰의 오벨리스크를 바라보며) 나는 사십 년을 이 신전에서 해를 섬겼소. 해 뜨는 시각, 별이 도는 길, 나일이 부는 날까지 다 적었지.', ''),
    L('dqPoti', '그런데 바로의 꿈 앞에서 우리는 아무 말도 못 했소. 애굽의 모든 술객과 현인이. 그런데 옥에서 나온 히브리 청년이 풀었지.', 'awe'),
    L('dqPoti', '묻고 싶소. 그대는 어떻게 그 꿈을 알았소? 그대의 지혜요, 그대 신의 뜻이오?', ''),
    { n: '요셉', t: '(무엇이라 답할까?)', choices: [
      { t: '"내가 아니라 하나님이 바로에게 평안한 대답을 하시리이다." (창 41:16)', then: () => { f.onWay = 'humble'; }, lines: [L('dqPoti', '…내가 아니라. (한참 말이 없다가) 이 신전의 사람들은 모두 「내가 안다」고 하오. 그대는 「내가 아니라」고 하는구려.', 'awe')] },
      { t: '"나도 꿈이 무엇인지 처음엔 몰랐소. 구덩이에서도, 옥에서도 기다렸을 뿐이오."', then: () => { f.onWay = 'wait'; }, lines: [L('dqPoti', '기다렸다… 우리는 별을 재고 물을 재며 신들을 재촉했소. 기다린 적은 없었구려.', 'tender')] },
      { t: '"내 지혜로 풀었소."', then: () => { f.onWay = 'proud'; }, lines: [T('요셉은 말을 꺼내려다 멈췄습니다. 그것은 사실이 아니었습니다.'), J('…아니오. 다시 말하겠소. 해석은 하나님께 있소(창 40:8). 나는 들은 것을 전했을 뿐이오.', 'tender'), L('dqPoti', '말을 고치는 총리라니. 허허, 그것도 처음 보오.', 'happy')] }] },
    L('dqPoti', '나는 이 신전의 제사장이고, 내일도 해에게 향을 올릴 것이오. 그러나 그대가 섬기는 분의 이름은 잊지 않겠소. 내 딸의 남편이 섬기는 분이니.', ''),
    L('dqPoti', '돌아가시오. 아스낫에게 편지를 보내겠소.', 'tender')], () => { fin('dqPoti'); f.on = 2; G.UI.quest(); pop('제사장과 이야기했어요', '아스낫에게 돌아가요', 'star'); }); }

// ------------------------------------------------------------------ ④ 모자란 곡식 자루
QS.dq_sack = { giver: 'dqClerk', title: '모자란 곡식 자루', when: s => vizier(s) && !!(s.built && s.built.granA),
  offer: ['총리님, 송구합니다. 사흘째 장부와 곳간의 자루 수가 맞지 않습니다. 하루에 한 자루씩 모자랍니다.', '짐꾼들을 다 옥에 넣으라는 말도 나오는데… 저는 누가 그랬는지도 모른 채 사람을 벌하고 싶지 않습니다. 총리님께서 살펴봐 주시겠습니까?'],
  start(s) { F().sack = 0; F().w1 = 0; F().w2 = 0; },
  obj: [{ t: '곳간 안에서 자루 세어 보기', ok: s => (F().sack | 0) >= 1 }, { t: '짐꾼 바키와 세티에게 묻기', ok: s => !!(F().w1 && F().w2) }, { t: '흘린 낟알 따라가기', ok: s => (F().sack | 0) >= 3 }, { t: '낟알 끝의 집 사람과 이야기하기', ok: s => (F().sack | 0) >= 4 }],
  loc: s => { const f = F(), k = f.sack | 0; return k < 1 ? { x: GRAN[0], z: GRAN[1] + 3 } : !(f.w1 && f.w2) ? (f.w1 ? { x: GRAN[0] + 7, z: GRAN[1] - 2 } : { x: GRAN[0] - 3, z: GRAN[1] + 6 }) : k < 3 ? { x: GRAN[0] + 9, z: GRAN[1] + 9 } : k < 4 ? { x: WIDOW[0], z: WIDOW[1] } : null; },
  prog: s => (F().sack | 0) < 4 ? '무엇이든 알아내시면 말씀해 주십시오.' : '…누구였습니까, 총리님?',
  done: s => [L('dqClerk', '세티였군요… 이 곳간에서 제일 성실한 짐꾼인데. 법대로라면 곡식 도둑은 옥으로 갑니다. 어떻게 할까요?', 'sad'),
    { n: '요셉', t: '(어떻게 처리할까?)', choices: [
      { t: '"법대로 하라. 그러나 메레트의 아이들은 내 집에서 먹이겠다."', then: () => { F().sackWay = 'law'; }, lines: [L('dqClerk', '…분부대로 하겠습니다.', ''), T('세티는 옥으로 갔습니다. 요셉은 그 옥의 간수장에게 세티를 잘 대해 달라고 일렀습니다. 그 옥이 어떤 곳인지 요셉보다 잘 아는 사람은 없었으니까요.'), J('(공의도, 긍휼도… 둘 다 붙드는 것은 왜 이리 어려울까.)', 'sad')] },
      { t: '"모자란 자루 값은 내가 치르겠다. 세티에게는 곳간 일을 더 맡겨 갚게 하라."', then: () => { F().sackWay = 'pay'; Game.silver(-Math.min(S().silver, 15)); }, lines: [L('dqClerk', '총리님께서 손수…! 세티가 들으면 평생 이 곳간을 지킬 겁니다.', 'awe'), L('dqW2', '(뒤에서 듣고 무릎을 꿇으며) 총리님… 이 은혜를 갚을 때까지 한 톨도 흘리지 않겠습니다.', 'cry')] },
      { t: '"곳간 문 앞에서 과부와 고아에게 곡식을 나누는 날을 정하라."', then: () => { F().sackWay = 'gate'; }, lines: [L('dqClerk', '나누는 날을…? 훔칠 까닭이 없게 만드시는군요.', 'awe'), T('그달부터 성읍 곳간 앞에는 이레마다 과부와 고아에게 곡식을 나누는 날이 생겼습니다. 세티는 그 줄을 세우는 일을 맡았습니다.'), L('dqClerk', '장부에 새 줄을 하나 만들겠습니다. 「나눔」이라고요.', 'happy')] }] }],
  finish(s) { F().sack = 5; }, reward: { insight: 2, silver: 6 } };
function workerTalk(id) { const f = F(); if ((f.sack | 0) < 1) { say([L(id, '(자루를 메고 지나간다) 바쁩니다, 나리.', '')], () => fin(id)); return; }
  if (id === 'dqW1') { say([L('dqW1', '자루요? 저는 아니에요! 맹세해요. 저는 새벽에 와서 해 지면 바로 집에 가요.', 'fear'), L('dqW1', '…그런데 세티는 요즘 해가 지고도 곳간에 남더라고요. 꼼꼼해서 그런가 했는데.', ''),
      { n: '요셉', t: '(무엇을 더 물을까?)', choices: [{ t: '"세티는 어떤 사람이오?"', lines: [L('dqW1', '좋은 사람이죠. 남쪽 길가에 혼자 아이 셋 키우는 과부 집이 있는데, 거기 지붕도 세티가 고쳐 줬어요.', '')] }, { t: '"고맙소. 그만 가 보시오."' }] }], () => { fin('dqW1'); f.w1 = 1; G.UI.quest(); }); return; }
  say([L('dqW2', '(자루를 내려놓고 허리를 편다) 자루가 모자란다고요? …저도 들었습니다.', ''), L('dqW2', '저는 맡은 자루를 다 날랐습니다. 장부에 하나도 빠짐없이…', 'fear'),
    { n: '요셉', t: '(세티의 눈을 본다)', choices: [{ t: '"그대 손에 낟알이 묻어 있소."', lines: [L('dqW2', '…곳간 일을 하면 다 묻지요.', 'cold'), J('(그는 눈을 피했다. 곳간 뒤를 살펴봐야겠다.)')] }, { t: '"알겠소. 수고하시오."', lines: [J('(그는 눈을 피했다. 곳간 뒤를 살펴봐야겠다.)')] }] }], () => { fin('dqW2'); f.w2 = 1; if ((f.sack | 0) < 2) f.sack = 2; G.UI.quest(); }); }
function widow() { const f = F(); if ((f.sack | 0) !== 3) { say([L('dqWidow', (f.sack | 0) > 3 ? '총리님, 아이들이 오늘은 배불리 먹고 잠들었어요.' : '…', 'tender')], () => fin('dqWidow')); return; }
  say([L('dqWidow', '(아이를 끌어안으며) 나리…! 우리는 아무것도 안 했어요.', 'fear'), J('겁내지 마시오. 이 낟알이 곳간에서 여기까지 떨어져 있었소.', 'tender'),
    L('dqWidow', '(한참 울다가) …세티가 밤마다 자루를 하나씩 놓고 갔어요. 남편이 큰물에 죽은 뒤로 아이들이 사흘을 굶었거든요. 저는 그게 어디서 오는지 묻지 않았어요. 묻고 싶지 않았어요…', 'cry'),
    { n: '요셉', t: '(무엇이라 말할까?)', choices: [{ t: '"아이들 이름이 무엇이오?"', lines: [L('dqWidow', '…메리, 테티, 그리고 막내 아누예요.', 'cry'), J('(굶는 아이들 앞에서 곳간의 장부는 무엇이어야 할까.)')] }, { t: '"오늘 밤은 굶지 않게 하겠소."', then: () => { Game.take('bread', Math.min(2, Game.inv('bread') || 0)); }, lines: [T('요셉은 가진 떡을 꺼내 아이들 손에 쥐여 주었습니다.')] }] }],
  () => { fin('dqWidow'); f.sack = 4; G.UI.quest(); pop('까닭을 알았어요', '곳간 서기 네페르에게 돌아가 결정해요', 'star'); }); }

// ------------------------------------------------------------------ 말 걸기 · 손으로 하는 일 · 자리
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(), f = F();
    if (id === 'dqTrader' && s.side && s.side.act && s.side.act.dq_boy && (f.boy | 0) === 1) { haggle(); return true; }
    if (id === 'dqMother') { mother(); return true; }
    if (id === 'dqPoti') { poti(); return true; }
    if (id === 'dqW1' || id === 'dqW2') { workerTalk(id); return true; }
    if (id === 'dqWidow') { widow(); return true; }
    if (id === 'dqReuben') { if ((f.pit | 0) === 1) pitScene(); else fin(id); return true; }
    return lt0.apply(this, arguments); }; }
Game.CTX.push(function (s) { const p = P(); if (p.ride || p.act || Game.cineOn || G.UI.busy() || (s.q && s.q.riding)) return null; const f = F(), a = s.side && s.side.act;
  if (a && a.dq_sack) { if ((f.sack | 0) < 1 && near(GRAN[0], GRAN[1] + 3, 4)) return [{ d: -0.5, label: '곳간 자루 세어 보기', x: GRAN[0], z: GRAN[1] + 3, y: 1, key: 'dqCount', noMagnet: true, use: () => {
      p.emote = { k: 'think', t: 0, dur: 2 }; say([T('요셉은 서기의 장부를 들고 곳간 안의 자루를 하나하나 세었습니다. 장부에는 삼백열 자루, 곳간에는 삼백일곱 자루.'), J('세 자루… 하루 한 자루씩이라 했지. 곳간 문은 하나뿐이고, 짐꾼은 둘이다.', 'think')], () => { f.sack = 1; G.UI.quest(); }); } }];
    if ((f.sack | 0) === 2 && f.w1 && f.w2 && near(GRAN[0] + 9, GRAN[1] + 9, 3.6)) return [{ d: -0.5, label: '곳간 뒤 흘린 낟알 살피기', x: GRAN[0] + 9, z: GRAN[1] + 9, y: 0.6, key: 'dqTrail', noMagnet: true, use: () => {
      p.emote = { k: 'squat', t: 0, dur: 2 }; say([T('곳간 뒤 흙바닥에 밀 낟알이 한 줄로 떨어져 있었습니다. 자루 구멍에서 흘렀는지, 낟알은 남쪽 길을 따라 이어졌습니다.'), J('…밤에 누군가 자루를 메고 이 길로 갔구나. 따라가 보자.', 'think')], () => { f.sack = 3; G.UI.quest(); pop('낟알이 남쪽 길로 이어져요', '낟알을 따라가요', 'star'); }); } }]; }
  return null; });
{ const up0 = EP.update; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; try { if (!s || Game.mode !== 'play') return r; const f = s.flags.dq; if (!f) return r;
    /* Reuben goes ahead to Dothan: he is not in Goshen while he waits at the pit */ const ru = Game.npc('reuben'); if (ru) { const away = s.step === 'j_end' && f.pit === 1; if (away && ru.forceVis !== false) ru.forceVis = false; else if (!away && ru.forceVis === false) ru.forceVis = undefined; }
    if (f.pit === 1 && !G.UI.busy() && !Game.cineOn && near(PIT.x, PIT.z, 7)) pitScene(); } catch (e) { console.error('deepq', e); } return r; }; }
/* the grain trail you can see: a line of kernels from the back of the granary to the widow's door */
let grainMesh = null; const GM = [];
{ const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); try { if (!s || Game.mode !== 'play') return; const f = s.flags.dq; if (!f || (f.sack | 0) < 2 || (f.sack | 0) > 4 || !(s.side && s.side.act && s.side.act.dq_sack)) return; if (Math.hypot(P().x - GRAN[0], P().z - GRAN[1]) > 60) return;
    if (!grainMesh) { const g = new G.GB(907); for (let i = 0; i < 7; i++) g.sph(0.035, 4, 3, { at: [(i % 3 - 1) * 0.12, 0.02, (i % 2) * 0.1 - 0.05], c: 0xe0c070, s: [1, 0.6, 1.4] }); grainMesh = G.R.mesh(g); }
    const W = Game.W(), a = [GRAN[0] + 9, GRAN[1] + 9], b = WIDOW, n = 28; for (let i = 0; i < n; i++) { const k = i / (n - 1), x = a[0] + (b[0] - a[0]) * k + Math.sin(i * 1.7) * 0.4, z = a[1] + (b[1] - a[1]) * k; const m = GM[i] || (GM[i] = G.m4()); G.m4trs(m, x, W.heightAt(x, z), z, i, 0, 0, 1, 1, 1); list.push({ mesh: grainMesh, m }); } } catch (e) { } }; }
})(window.G);
