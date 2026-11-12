/* 약속의 길 — 구스 (나일 강 상류, 누비아) (v18.50)
   「둘째 강의 이름은 기혼이라 구스 온 땅을 둘렀고」(창 2:13). 애굽 남쪽, 나일 강이 바위 사이로 부서져 흐르는 폭포 지대 너머의 땅이에요.
   애굽은 이 땅을 「활의 땅」이라 불렀고, 금과 흑단과 상아가 이곳에서 올라왔어요. 요셉 무렵 애굽은 폭포 곁에 흙벽돌 요새를 두었어요.
   · 나일 북쪽 나루, 그발 배 곁의 「구스 가는 배」 사공에게 말하면 강을 거슬러 남쪽으로 가요.
   · 구스: 바위 사이로 부서지는 폭포와 물보라, 화강암 바위, 둥근 초가집 마을, 긴 뿔 소들의 우리, 애굽 국경 요새, 둠야자와 아카시아.
   · 할 일: 강가에서 사금 일기(하루 세 번), 마을 북 장단 맞추기(하루 한 번), 활의 땅 궁수와 과녁 맞히기(하루 한 번), 흑단 · 상아 장수, 요새 대장과 이야기. */
'use strict';
(function (G) {
const Ls = G.Lands; if (!Ls) return; const Game = G.Game;
const SK = 0x5a3420, t = Ls.tint, LM = Ls.lookOf('hunterE') || Ls.lookOf('brick'), LF = Ls.lookOf('byWoman') || Ls.lookOf('ct_wea'), LEg = Ls.lookOf('keeper') || LM;
const BOAT = '구스 뱃사공 우세르';
const SAND = 0xb88a58, ROCK = 0x7a5e58, ROCK2 = 0x8e6e66, THATCH = 0xc8a858, HUT = 0xa86a3a;
const PAN = [[-14, -15.6], [6, -15.8], [24, -15.4]];
Ls.make({ key: 'kush', name: '구스', BX: -130, BZ: -95, BY: 64, hours: 8, seed: 41, sfx: 'splash',
  spawn: [-30, -13, 0], help: ['구스 (누비아)', '나일 강 위쪽, 폭포 너머의 땅이에요 · 금과 흑단과 활의 땅 · 돌아갈 땐 강가의 뱃사공 우세르에게'], hello: ['구스 도착!', '폭포 너머, 활의 땅'],
  depart: { id: 'kuBoatE', name: BOAT, look: t(LEg, { skin: 0x8a5a3a }), x: -96, z: -79.2, face: Math.PI / 2, backDx: 1.4, backDz: 0.4, /* v18.52 by his boat, south of the landing */ when: () => Ls.after('c5_patrol'), place: '나일 나루 · 구스 가는 배',
    intro: ['총리님! 저는 강을 거슬러 남쪽 구스까지 오가는 사공 우세르예요.', '폭포 바위 사이로는 배를 끌고 가야 하지만, 그 너머엔 금과 흑단의 땅이 있지요.'], ask: '구스에 가 보시겠어요? 바람이 북쪽에서 불어 주면 거슬러 오르기 쉬워요.', go: '배 타고 구스로', night: '밤 강에는 하마가 다녀요. 날이 밝으면 가요!', backMsg: '나일 강 북쪽 나루' },
  arrive: { id: 'kuBoat', name: BOAT, look: t(LEg, { skin: 0x8a5a3a }), x: -32, z: -15.6, face: 0, ask: '애굽으로 내려가실까요? 내려갈 땐 물살이 데려다줘요.', go: '배 타고 애굽으로' },
  items: { gold: { n: '사금', cat: 'good', p: 60, ic: 'stone', c: '#e5b552' }, ebony: { n: '흑단', cat: 'good', p: 45, ic: 'log', c: '#2a2020' }, ivory: { n: '상아', cat: 'good', p: 80, ic: 'stone', c: '#f2ead8' } },
  shops: { kuShop: { n: '흑단 장수 네헤시', sells: ['good', 'crop', 'food'], no: ['ebony', 'ivory', 'gold'], mul: { good: 1.3, crop: 1.2 }, buy: [{ n: '흑단', item: 'ebony', qty: 1, price: 34, d: '물에 가라앉을 만큼 단단하고 검은 나무' }, { n: '상아', item: 'ivory', qty: 1, price: 60, d: '애굽 장인들이 빗과 상자를 깎아요' }, { n: '대추야자 ×4', item: 'dates', qty: 4, price: 8 }] } },
  people: [
    { id: 'kuChief', name: '마을 어른 케르마', look: t(LM, { skin: SK, collar: 0xe5b552, age: 'old', hair: 0x3a3030 }), x: 6, z: 12, face: Math.PI, talkR: 3 },
    { id: 'kuDrum', name: '북 치는 아마니', look: t(LM, { skin: SK, collar: 0xc8402a }), x: -4, z: 8, face: 0.4, talkR: 3 },
    { id: 'kuArcher', name: '활의 땅 궁수 세티', look: t(LM, { skin: SK, collar: 0x2a8a5a, build: 1.1 }), x: 30, z: 6, face: -Math.PI / 2, talkR: 3 },
    { id: 'kuTrader', name: '흑단 장수 네헤시', look: t(LM, { skin: SK, kilt: 0xe8dcc0 }), x: -16, z: -4, face: Math.PI },
    { id: 'kuCapt', name: '요새 대장 세네브', look: t(LEg, { collar: 0x2a5aa0 }), x: 38, z: 30, face: Math.PI, talkR: 3, prop: 'spear' },
    { id: 'kuPanner', name: '사금 이는 아낙 타비', look: t(LF, { skin: SK, top: 0xe8a040 }), x: -6, z: -14.6, face: Math.PI, act: 'gather', chat: ['강모래를 둥근 그릇에 담아 살살 흔들면 무거운 금만 바닥에 남아요.', '물살 센 날은 금도 많이 떠내려와요!'] },
    { id: 'kuKid', name: '구스 아이 하르', look: t(LM, { skin: SK }), x: 2, z: 2, face: 0, wander: 6, scale: 0.6, chat: ['폭포 소리 들려요? 밤에도 저렇게 울어요!', '우리 아빠는 화살 하나로 하늘 나는 새도 맞혀요!'] },
    { id: 'kuWoman', name: '바구니 짜는 네피', look: t(LF, { skin: SK, top: 0xc8402a }), x: 14, z: 20, face: Math.PI, act: 'gather', chat: ['둠야자 잎으로 바구니를 짜요. 애굽 장터에서도 잘 팔려요.', '애굽 총리님이 곡식을 나눠 주셔서 우리 아이들도 살았어요.'] },
    ...[[22, 22], [25, 24], [21, 26], [26, 20]].map(([x, z], i) => ({ id: 'kuCow' + i, name: '긴 뿔 소', animal: 'cow', x, z, face: i * 1.4, wander: 2.4, noTalk: true, noTag: true }))],
  chatter: [['폭포 물이 많이 불었네.', '상류에 비가 왔나 봐.'], ['애굽 요새에 곡식 배가 들어왔대.', '총리님 곳간에서 온 곡식이래!'], ['오늘 밤엔 북을 치자.', '추수 때보다 더 크게!'], ['세티가 또 과녁 한가운데를 맞혔대.', '그 녀석 팔은 활시위로 만들어졌나 봐.']],
  weather: { clear: 0.82, cloudy: 0.12, rain: 0, wind: 0.06, fog: 0, dust: 0, storm: 0 },
  trail: { group: '먼 땅', list: [
    { id: 'kuVisit', n: '구스에 가 보기', h: '나일 북쪽 나루의 사공 우세르', v: s => s.flags.land_kushMet ? 1 : 0, max: 1 },
    { id: 'kuGold', n: '사금 열 줌', h: '구스 강가 · 사금 이기', v: s => s.flags.kuGoldN || 0, max: 10 },
    { id: 'kuDrum', n: '북 장단 세 번', h: '구스 마을의 북 치는 아마니', v: s => s.flags.kuDrumN || 0, max: 3 }] },
  quest: s => [{ t: `구스 · 사금 이기 (오늘 ${(s.flags.kuPanDay === s.day ? s.flags.kuPanToday : 0) || 0}/3)`, ok: (s.flags.kuPanDay === s.day ? s.flags.kuPanToday : 0) >= 3 }],
  // ----------------------------------------------------------------- the ground: a bank south of the river, rocks and rapids in it
  floor: (lx, lz) => { if (Math.abs(lx) < 60 && lz > -15 && lz < 46) return 64; if (Math.abs(lx) < 60 && lz <= -15 && lz > -18.5) return 64 - (-15 - lz) * 0.55; return null; },
  water: (lx, lz) => { if (Math.abs(lx) < 70 && lz <= -15 && lz > -80) return { level: 62.6, bed: lz > -18.5 ? 64 - (-15 - lz) * 0.55 : 60.4 }; return null; },
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B;
    box(120, 14, 62, 0, BY - 7, 15, SAND); box(121, 1.2, 4, 0, BY - 1.6, -16.6, 0xa07a50, { rx: 0.5 }); g.box(460, 1, 340, { at: [X, BY - 0.6, Z + 190], c: 0xb08a5a, j: 0.05 });
    g.box(460, 1, 120, { at: [X, BY - 0.5, Z - 140], c: 0xa88458, j: 0.05 }); // the far (north) bank
    // the cataract: granite boulders in the stream, white water between them
    for (let i = 0; i < 46; i++) { const x = -60 + rng() * 120, z = -22 - rng() * 50, r = 0.8 + rng() * 2.4; sph(r, x, BY - 1.8 + r * 0.3, z, i % 2 ? ROCK : ROCK2, { s: [1.2, 0.7, 1], j: 0.1 }); if (z > -40) colR(x, z, r * 1.1, BY + 2); if (i % 2) box(r * 1.6, 0.06, r * 0.8, x + r * 0.4, 62.66, z + r * 0.9, 0xf4f8f8, { ry: rng(), j: 0.1 }); }
    for (let i = 0; i < 6; i++) { const x = -50 + i * 20 + rng() * 6; box(9, 1.6, 0.5, x, 62.0, -52, 0xeef4f6, { rx: 0.9, j: 0.06 }); box(10, 0.08, 3, x, 62.66, -50, 0xf4f8f8, { j: 0.08 }); } // a step in the river: the falls
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI, r = 120 + rng() * 40; sph(20 + rng() * 14, Math.cos(a) * r, BY - 8, 40 + Math.sin(a) * r * 0.8, [0x9a6a48, 0xa87a50, 0x8a5e40][i % 3], { s: [1.3, 0.6, 1], j: 0.08 }); } // red hills
    for (const [x, z, r] of [[-44, 30, 4], [-50, 18, 3], [48, 40, 3.6], [-36, 42, 2.6], [52, -6, 2.4]]) { sph(r, x, BY + r * 0.3, z, ROCK2, { s: [1.3, 0.8, 1], j: 0.1 }); colR(x, z, r * 1.15, BY + r); }
    // the village: round huts with straw roofs, a fence of thorn branches round the cattle
    const hut = (x, z, r) => { cyl(r, r, 2.1, 12, x, BY + 1.05, z, HUT); cyl(0.12, r * 1.3, 2.3, 12, x, BY + 3.1, z, THATCH, { j: 0.06 }); box(0.9, 1.5, 0.1, x, BY + 0.75, z - r + 0.02, 0x2a1a10, { j: 0 }); box(r * 2, 0.12, 0.06, x, BY + 1.5, z - r - 0.01, 0xe8e0d0, { j: 0 }); colR(x, z, r + 0.1, BY + 2.4); };
    for (const [x, z, r] of [[-2, 20, 2.2], [8, 24, 2], [-12, 16, 2.1], [16, 12, 1.9], [-8, 30, 2.3], [4, 34, 2], [-20, 26, 2]]) hut(x, z, r);
    for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; if (i === 13) continue; const x = 23.5 + Math.cos(a) * 5.4, z = 23 + Math.sin(a) * 5.4; sph(0.7, x, BY + 0.5, z, 0x6a5a30, { s: [1.3, 0.8, 1.3], j: 0.15 }); colR(x, z, 0.7, BY + 1.2); }
    cyl(1.6, 1.6, 0.12, 14, 0, BY + 0.06, 8, 0x7a5a3a); put('campfire', 0, 8); // the drum ground round a fire
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.4; cyl(0.32, 0.26, 0.7, 10, Math.cos(a) * 2.6, BY + 0.35, 8 + Math.sin(a) * 2.6, 0x6a3a20); cyl(0.33, 0.33, 0.03, 10, Math.cos(a) * 2.6, BY + 0.72, 8 + Math.sin(a) * 2.6, 0xd8c8a0); }
    // the archery range: straw targets
    for (const [x, z] of [[46, 2], [46, 8], [46, 14]]) { box(0.3, 1.6, 0.3, x, BY + 0.8, z, 0x7a5a3a); cyl(0.7, 0.7, 0.2, 14, x - 0.2, BY + 1.4, z, 0xd8c070, { rz: Math.PI / 2 }); cyl(0.4, 0.4, 0.22, 14, x - 0.22, BY + 1.4, z, 0xc8402a, { rz: Math.PI / 2 }); cyl(0.14, 0.14, 0.24, 10, x - 0.24, BY + 1.4, z, 0x2a2018, { rz: Math.PI / 2 }); colR(x, z, 0.6, BY + 2); }
    // the Egyptian border fort on the rise: mud-brick walls, towers, a gate
    const FX = 38, FZ = 36; for (const [x, z, w, d] of [[FX, FZ + 6, 16, 1.2], [FX - 8, FZ, 1.2, 12], [FX + 8, FZ, 1.2, 12], [FX - 5, FZ - 6, 6, 1.2], [FX + 5, FZ - 6, 6, 1.2]]) { box(w, 5, d, x, BY + 2.5, z, 0xb08a5a); col(x, z, w, d, BY - 1, BY + 5, true); }
    for (const [x, z] of [[FX - 8, FZ - 6], [FX + 8, FZ - 6], [FX - 8, FZ + 6], [FX + 8, FZ + 6]]) { box(2.4, 6.4, 2.4, x, BY + 3.2, z, 0xa07a4a); col(x, z, 2.4, 2.4, BY - 1, BY + 6.5, true); } box(4.4, 0.6, 1.4, FX, BY + 4.7, FZ - 6, 0xa07a4a); put('banner', FX + 2.2, FZ - 6.6);
    // palms, acacias, the boatman's landing
    for (const [x, z] of [[-30, 4], [-26, 10], [-40, 6], [20, -6], [34, -8], [-52, 34], [54, 22]]) { put('palm', x, z, { s: 1.05 }); colR(x, z, 0.4); }
    for (const [x, z] of [[-24, 36], [28, 42], [-46, -6], [40, -10]]) { put('acacia', x, z, { s: 1 }); colR(x, z, 0.4); }
    put('felucca', -34, -21, { s: 1.2, ry: 0.2, y: 62.4 }); box(3, 0.2, 4, -32, BY - 0.35, -17, 0x8a6a48);
    for (const [fn, x, z] of [['baskets', -18, -6], ['sacks', -14, -6], ['pots', 12, 8]]) put(fn, x, z);
    for (const [x, z, w, d] of [[60.4, 15, 0.8, 62], [-60.4, 15, 0.8, 62], [0, 46.4, 121, 0.8], [0, -40, 140, 0.8], [70, -28, 0.8, 26], [-70, -28, 0.8, 26]]) col(x, z, w, d);
    return { water: B.sea(62.6, [0.3, 0.5, 0.42], [0.1, 0.26, 0.24], 40) }; },
  // ----------------------------------------------------------------- talk
  talk: {
    kuChief(s, done, K) { const N = '마을 어른 케르마';
      const first = s.flags.kuChief ? [] : [K.Ln(N, '애굽의 총리가 몸소 구스까지 오다니! 먼 길 잘 오셨소.'), K.Ln(N, '흉년이 든 뒤로 우리 젊은이들이 금과 흑단을 지고 애굽에 내려가 곡식을 사 왔소. 총리의 곳간이 우리를 먹였지.')];
      s.flags.kuChief = 1; K.say(first.concat([K.Ln(N, '애굽 사람들은 우리 땅을 「활의 땅」이라 부르오. 세티의 활 솜씨를 보시오. 그리고 밤에는 아마니의 북소리를 들어 보시오!')]), () => { if (first.length) { Game.silver(25); K.pop('구스의 환영', '은 25', 'star'); } done(); }); },
    kuTrader(s, done, K) { K.say([K.Ln('흑단 장수 네헤시', '어서 오시오! 물에 가라앉는 흑단, 눈처럼 흰 상아! 애굽 장인들이 줄을 서서 사 가지요.')], () => { done(); G.UI.shop('kuShop'); }); },
    kuCapt(s, done, K) { K.say([K.Ln('요새 대장 세네브', '총리님! 국경 요새의 대장 세네브입니다. 이 요새는 강을 오르내리는 배와 짐을 살피지요.'), K.Ln('요새 대장 세네브', '흉년 뒤로 구스 사람들과 다툼이 줄었습니다. 곡식이 있으니 칼을 들 까닭이 없지요.'), { n: '요셉', t: '배고픈 이웃을 먹이는 것이 성벽보다 든든한 법이오.' }], done); },
    kuDrum(s, done, K) { const N = '북 치는 아마니';
      if (s.flags.kuDrumDay === s.day) { K.say([K.Ln(N, '오늘은 손바닥이 얼얼해요! 내일 또 함께 쳐요!')], done); return; }
      K.say([K.Ln(N, '총리님, 북 장단 맞춰 보실래요? 우리 구스 장단은 발이 먼저 알아요!'), { n: N, t: '제가 치는 장단을 따라 쳐 주세요!', choices: [{ t: '북 장단 맞추기', then: () => { done(); G.UI.minigame('rhythm', { title: '구스 북 장단', need: 9, beats: 14, gap: 0.62, hint: '북소리 표시가 선에 닿을 때 눌러요!' }, ok => {
 if (!ok) { K.say([K.Ln(N, '하하, 박자가 조금 엇갈렸어요! 다시 해 봐요. 발로 먼저 장단을 느껴요!')]); return; }        s.flags.kuDrumDay = s.day; s.flags.kuDrumN = (s.flags.kuDrumN || 0) + 1; const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 15);
        for (const id of ['kuDrum', 'kuKid', 'kuWoman', 'kuChief']) { const m = Game.npc(id); if (m && m.vis && G.Voice) G.Voice.react(m, id === 'kuKid' ? 'surprise' : 'laugh', { vol: 0.8 }); }
        K.pop('구스 북 장단', '정신력 +15', 'star'); }); } }, { t: '다음에요', then: done }] }], done); },
    kuArcher(s, done, K) { const N = '활의 땅 궁수 세티';
      if (s.flags.kuArrowDay === s.day) { K.say([K.Ln(N, '오늘 과녁은 쉬게 해 줍시다. 내일 또 겨뤄요!')], done); return; }
      K.say([K.Ln(N, '애굽 총리님, 활을 쏘아 보신 적 있소? 구스 활은 애굽 활보다 시위가 질기다오.'), { n: N, t: '바람을 읽고, 숨을 멈추고, 놓는 거요. 해 보시겠소?', choices: [{ t: '과녁 맞히기', then: () => { done(); G.UI.minigame('wrestle', { title: '활 쏘기', need: 4, dur: 30, btn: '쏘기', unit: '명중', act: null, hint: '하얀 표시가 초록 과녁에 들어올 때 「쏘기」! 한가운데면 두 발 몫이에요.' }, () => {
        s.flags.kuArrowDay = s.day; const clean = G.UI.mgLast && G.UI.mgLast.miss === 0; const m = Game.npc('kuArcher'); if (m && G.Voice) G.Voice.react(m, clean ? 'surprise' : 'laugh');
        setTimeout(() => K.say([K.Ln(N, clean ? '한 발도 빗나가지 않았소! 총리님은 활의 땅에서 태어났어야 했소!' : '좋은 솜씨요! 구스 활이 총리님 손에 맞나 보오.')], () => { Game.give('ebony', 1); K.pop('과녁을 맞혔어요', '흑단 1', 'star'); }), 700); }); } }, { t: '다음에요', then: done }] }], done); } },
  ctx(s, lx, lz, K) { const out = []; const today = s.flags.kuPanDay === s.day ? s.flags.kuPanToday || 0 : 0;
    if (today < 3) PAN.forEach(([x, z], i) => { const d = Math.hypot(lx - x, lz - z); if (d < 2.2) out.push({ d: d - 1.2, label: `사금 이기 (오늘 ${today}/3)`, x: K.BX + x, z: K.BZ + z, yAbs: K.BY, key: 'kuPan' + i, use: () => pan(s, K) }); });
    return out; } });
// the glint mesh is built lazily (the stage object is the one returned by build)
{ const L = G.Lands.list.find(x => x.key === 'kush'); const EP = G.EP.joseph; const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const gs = new G.GB(3); gs.sph(0.12, 6, 4, { at: [0, 0, 0], c: 0xffe080 }); const mesh = G.R.mesh(gs); L.glint = mesh; } catch (e) { } };
  const d0 = EP.dyn; EP.dyn = function (list) { if (d0) d0.apply(this, arguments); if (!L.on() || !L.glint) return; const s = G.Game.S(); const today = s.flags.kuPanDay === s.day ? s.flags.kuPanToday || 0 : 0; if (today >= 3) return; const t = performance.now() / 1000; L.GM = L.GM || [G.m4(), G.m4(), G.m4()];
    PAN.forEach(([x, z], i) => { const k = 0.8 + Math.sin(t * 4 + i * 2) * 0.3; G.m4trs(L.GM[i], -130 + x, 63.8 + Math.abs(Math.sin(t * 2 + i)) * 0.1, -95 + z, t + i, 0, 0, k, k, k); list.push({ mesh: L.glint, m: L.GM[i], emis: [0.7, 0.55, 0.12] }); }); }; }
function pan(s, K) { G.UI.minigame('wrestle', { title: '사금 이기', need: 3, dur: 30, btn: '흔들기', unit: '금 알갱이', act: 'gather', hint: '모래를 담은 그릇을 흔들어요. 하얀 표시가 초록 구간에 들어올 때 「흔들기」!' }, () => {
  if (s.flags.kuPanDay !== s.day) { s.flags.kuPanDay = s.day; s.flags.kuPanToday = 0; } s.flags.kuPanToday++; s.flags.kuGoldN = (s.flags.kuGoldN || 0) + 1; Game.give('gold', 1); G.Audio && G.Audio.sfx('coins', { vol: 0.5 });
  K.pop('사금 한 줌', `오늘 ${s.flags.kuPanToday}/3 · 애굽에서 비싸게 팔려요`, 'star'); G.UI.quest && G.UI.quest(); }); }
})(window.G);
