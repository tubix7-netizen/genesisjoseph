/* 약속의 길 — 하란 (밧단아람) (v18.50)
   아버지 야곱이 외삼촌 라반의 집에서 스무 해를 지낸 땅(창 29–31장). 어머니 라헬을 처음 만난 곳도 여기 들판의 우물가였어요(창 29:9–11).
   · 애굽 도성 동쪽 길의 「하란 가는 대상」 우두머리에게 말하면 대상을 따라 북동쪽 강가 땅으로 가요.
   · 하란: 발릭 강과 갈대, 흙벽돌 집과 둥근 지붕, 들판의 큰 우물(무거운 덮개 돌), 양 떼와 얼룩 양 우리, 라반의 옛 집터, 보리밭.
   · 할 일: 우물 덮개 돌 굴리기(하루 한 번 · 창 29:10의 아버지처럼), 늙은 목자에게 듣는 아버지 이야기, 할머니 세라에게 듣는 어머니 라헬 이야기,
     라반의 손자 엘닷(요셉의 사촌뻘)과 만나기, 양털 장수 가게. */
'use strict';
(function (G) {
const Ls = G.Lands; if (!Ls) return; const Game = G.Game;
const L0 = Ls.lookOf('man') || Ls.lookOf('reuben'), LO = Ls.lookOf('jacob') || L0, LF = Ls.lookOf('dinah') || Ls.lookOf('leah'), LW = Ls.lookOf('leah') || LF, t = Ls.tint;
const CAR = '하란 가는 대상 우두머리 게렐';
const MUD = 0xc4a678, MUD2 = 0xa88a5e, GRASS = 0xa4a06a;
const WELL = [-14, -8];
Ls.make({ key: 'haran', name: '하란', BX: 120, BZ: 40, BY: 64, hours: 6, seed: 29, sfx: 'step',
  spawn: [46, -6, -Math.PI / 2], help: ['하란 (밧단아람)', '아버지 야곱이 스무 해를 지낸 땅이에요 · 들판의 우물과 양 떼 · 돌아갈 땐 대상 우두머리 게렐에게'], hello: ['하란 도착!', '아버지가 젊은 날을 보낸 땅'],
  depart: { id: 'hrCarE', name: CAR, look: t(Ls.lookOf('ishmael') || L0, { clothCol: 0x6a4a2a }), x: 34, z: -46, face: Math.PI, when: () => Ls.after('c5_patrol'), place: '도성 동쪽 길 · 하란 가는 대상',
    intro: ['애굽의 총리님! 저는 북쪽 강 너머 하란까지 오가는 대상 우두머리 게렐입니다.', '하란은 유브라데 강 위쪽, 발릭 강가의 땅이에요. 양털과 모직 천이 좋지요.'], ask: '우리 대상을 따라 하란에 가 보시겠어요? 길은 멀지만 낙타는 빨라요.', go: '대상을 따라 하란으로', night: '밤에는 대상이 쉬어요. 날이 밝으면 떠나요!', backMsg: '도성 동쪽 길' },
  arrive: { id: 'hrCar', name: CAR, look: t(Ls.lookOf('ishmael') || L0, { clothCol: 0x6a4a2a }), x: 49, z: -8, face: -Math.PI / 2, ask: '애굽으로 돌아가실까요? 낙타들은 늘 준비되어 있어요.', go: '대상을 따라 애굽으로' },
  items: { hrBand: { n: '라헬의 양털 띠', cat: 'key', p: 0, ic: 'cloth', c: '#c8a070' } },
  shops: { hrShop: { n: '양털 장수 게델', sells: ['good', 'crop', 'food', 'mat'], no: ['wool', 'cloth'], mul: { good: 1.25 }, buy: [{ n: '양털 ×3', item: 'wool', qty: 3, price: 12 }, { n: '모직 천', item: 'cloth', qty: 1, price: 34, d: '하란 사람들이 짠 두꺼운 천' }, { n: '치즈', item: 'cheese', qty: 1, price: 14 }, { n: '보리 ×3', item: 'barley', qty: 3, price: 10 }] } },
  people: [
    { id: 'hrShep', name: '늙은 목자 하맛', look: t(LO, { top: 0x8a7a5a, mantle: 0x5a4a3a, age: 'old', limp: false }), x: -10, z: -4, face: -2.2, talkR: 3 },
    { id: 'hrSera', name: '할머니 세라', look: t(LW, { clothCol: 0x6a4a6a, top: 0x6a4a6a, age: 'old', hair: 0xd8d0c8 }), x: 12, z: 14, face: Math.PI, talkR: 3 },
    { id: 'hrEldad', name: '라반의 손자 엘닷', look: t(L0, { top: 0x4a5a7a, clothCol: 0x4a5a7a, beard: 'short' }), x: 24, z: 26, face: Math.PI, talkR: 3 },
    { id: 'hrGirl', name: '목동 소녀 미가', look: t(LF, { top: 0xb06a3a, clothCol: 0xb06a3a }), x: -17, z: -11, face: 0.9, talkR: 3 },
    { id: 'hrWool', name: '양털 장수 게델', look: t(L0, { top: 0x9a8a6a }), x: 20, z: -4, face: -Math.PI / 2 },
    { id: 'hrShep2', name: '젊은 목자 야일', look: t(L0, { top: 0x7a6a4a }), x: -20, z: -4, face: 1.2, prop: 'staff', chat: ['이 우물 돌은 세 사람이 함께 굴려야 겨우 움직여요.', '양 떼가 다 모이면 그때 돌을 굴리는 게 이 들판의 법이지요.'] },
    { id: 'hrKid', name: '하란 아이 나단', look: t(Ls.lookOf('ishBoy') || L0, { top: 0xd8c040 }), x: 6, z: 4, face: 0, wander: 6, scale: 0.62, chat: ['애굽에서 오셨어요? 강이 바다처럼 넓다면서요!', '할머니가 그러는데, 옛날에 엄청 힘센 목자가 혼자서 우물 돌을 굴렸대요!'] },
    { id: 'hrWeave', name: '베 짜는 아낙 아디', look: t(LF, { top: 0x7a3a3a, clothCol: 0x7a3a3a }), x: 30, z: 8, face: Math.PI, act: 'gather', chat: ['하란 양털은 길고 부드러워요.', '애굽 세마포는 시원하고, 우리 모직 천은 따뜻하지요.'] },
    ...[[-8, -16], [-6, -13], [-12, -18], [-4, -18], [-22, -14], [-24, -18], [-19, -20]].map(([x, z], i) => ({ id: 'hrSheep' + i, name: '양', animal: 'sheep', x, z, face: i, wander: 3, noTalk: true, noTag: true }))],
  chatter: [['요즘 양털 값이 올랐어.', '애굽에서 사 가는 사람이 많대.'], ['옛날 야곱이라는 목자 이야기 들었어?', '얼룩 양을 그렇게 많이 늘렸다는 그 사람?'], ['발릭 강물이 많이 줄었네.', '흉년이 여기까지 왔나 봐.'], ['애굽 총리님이 하란 핏줄이래!', '라반 집안과 친척이라던데?']],
  weather: { clear: 0.6, cloudy: 0.24, rain: 0.06, wind: 0.1, fog: 0, dust: 0, storm: 0 },
  trail: { group: '먼 땅', list: [
    { id: 'hrVisit', n: '하란에 가 보기', h: '도성 동쪽 길의 대상 우두머리 게렐', v: s => s.flags.land_haranMet ? 1 : 0, max: 1 },
    { id: 'hrWell', n: '우물 돌 굴리기 세 번', h: '하란 들판의 우물 · 하루 한 번', v: s => s.flags.hrWellN || 0, max: 3 },
    { id: 'hrRachel', n: '어머니 라헬의 이야기', h: '하란의 할머니 세라', v: s => s.flags.hrRachel ? 1 : 0, max: 1 }] },
  quest: s => s.flags.hrWellDay === s.day ? [] : [{ t: '하란 · 들판의 우물 돌 굴리기 (하루 한 번)', ok: false }],
  // ----------------------------------------------------------------- the ground
  floor: (lx, lz) => { if (lx > -36 && lx < 62 && lz > -46 && lz < 46) return 64; if (lx < -46 && lx > -66 && Math.abs(lz) < 46) return 64; if (lx >= -46 && lx <= -36 && Math.abs(lz) < 46) { const e = Math.min(lx + 46, -36 - lx); return e < 1.6 ? 64 - (1.6 - e) * 0.9 : null; } return null; },
  water: (lx, lz) => { if (lx > -45 && lx < -37 && Math.abs(lz) < 60) { const e = Math.min(lx + 45, -37 - lx); return { level: 63.4, bed: 63.4 - Math.min(1.6, 0.3 + e * 0.5) }; } return null; },
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B;
    // the steppe on both banks, the Balikh river between, far ground and hills
    box(98, 14, 92, 13, BY - 7, 0, GRASS); box(20, 14, 92, -56, BY - 7, 0, GRASS); box(10, 1, 120, -41, BY - 2.6, 0, 0x6a5a40);
    g.box(260, 1, 500, { at: [X + 110, BY - 0.5, Z], c: 0x9a9864, j: 0.05 }); g.box(400, 1, 500, { at: [X - 246, BY - 0.5, Z], c: 0x9a9864, j: 0.05 }); g.box(10, 1, 500, { at: [X - 41, BY - 2.8, Z], c: 0x6a5a40 });
    for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, r = 150 + rng() * 40; sph(26 + rng() * 14, Math.cos(a) * r, BY - 10, Math.sin(a) * r, [0x8a8a5a, 0x9a9664, 0x7e8250][i % 3], { s: [1.4, 0.5, 1], j: 0.06 }); }
    for (const [x, z, w, d] of [[-8, -14, 30, 18], [36, 30, 22, 14], [-2, 34, 20, 10]]) box(w, 0.05, d, x, BY + 0.015, z, x > 30 ? 0xc8b060 : 0x8a9a52, { j: 0.06 }); // pasture · barley · gardens
    for (let i = 0; i < 26; i++) put('reeds', -35.4 - (i % 2) * 0.4, -44 + i * 3.5 + rng(), { s: 0.9 + rng() * 0.3 }), put('reeds', -46.4 + (i % 2) * 0.4, -43 + i * 3.4 + rng(), { s: 0.9 + rng() * 0.3 });
    for (const [x, z] of [[-30, 20], [-28, -30], [40, -30], [56, 20], [-54, 10], [-58, -24]]) { put('palm', x, z, { s: 1 }); colR(x, z, 0.4); }
    // mud-brick houses with round domes (the town), a low town wall with a gate
    const house = (x, z, w, d, h, dome) => { box(w, h, d, x, BY + h / 2, z, MUD); box(w + 0.3, 0.22, d + 0.3, x, BY + h + 0.08, z, MUD2); if (dome) sph(Math.min(w, d) * 0.42, x, BY + h + 0.1, z, MUD, { s: [1, 0.85, 1] });
      box(1.0, 1.8, 0.08, x, BY + 0.9, z - d / 2 - 0.03, 0x3a2818, { j: 0 }); box(0.5, 0.4, 0.08, x + w / 4, BY + h * 0.65, z - d / 2 - 0.03, 0x2a2018, { j: 0 }); col(x, z, w, d, BY - 1, BY + h + 0.3, true); };
    for (const h of [[12, 20, 6, 6, 3.2, 1], [20, 22, 5, 5, 3.0, 1], [28, 18, 6, 5, 3.4, 1], [6, 26, 5, 6, 3.0, 1], [16, 32, 6, 6, 3.4, 1], [30, 32, 5, 5, 3.0, 1], [36, 22, 5, 6, 3.2, 1], [40, 10, 6, 5, 3.0, 0], [24, 2, 5, 5, 2.8, 1], [10, 6, 5, 4, 2.6, 0]]) house(...h);
    for (const [x0, z0, x1, z1] of [[0, 40, 44, 40], [44, 40, 44, 28], [44, 16, 44, -2], [0, 40, 0, 30]]) { const w = Math.abs(x1 - x0) || 0.8, d = Math.abs(z1 - z0) || 0.8; box(w, 1.8, d, (x0 + x1) / 2, BY + 0.9, (z0 + z1) / 2, MUD2); col((x0 + x1) / 2, (z0 + z1) / 2, w, d, BY - 1, BY + 2); }
    // the well in the field: stone ring, the heavy cover stone, troughs (창 29:2–3)
    cyl(1.5, 1.6, 0.8, 14, WELL[0], BY + 0.4, WELL[1], 0x9a9282); cyl(1.35, 1.35, 0.32, 14, WELL[0] + 0.15, BY + 0.98, WELL[1], 0x7a7468); colR(WELL[0], WELL[1], 1.7, BY + 1.2);
    for (const [dx, dz, ry] of [[2.8, 0.6, 0.2], [-2.6, 1.6, -0.6]]) { box(2.4, 0.5, 0.7, WELL[0] + dx, BY + 0.25, WELL[1] + dz, 0x8a7a62, { ry }); col(WELL[0] + dx, WELL[1] + dz, 2.2, 0.8, BY - 1, BY + 0.6); }
    // sheep pens with fences; the old house of Laban, fallen in
    for (const [x, z] of [[-26, 6], [-14, 22]]) { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, ox = Math.cos(a) * 3.2, oz = Math.sin(a) * 3.2; box(k % 2 ? 0.2 : 6.4, 0.9, k % 2 ? 6.4 : 0.2, x + ox, BY + 0.45, z + oz, 0x7a5a3a); col(x + ox, z + oz, k % 2 ? 0.3 : 6.4, k % 2 ? 6.4 : 0.3, BY - 1, BY + 1); } }
    for (const [x, z, w, d, h] of [[-30, 32, 8, 0.6, 1.4], [-34, 28, 0.6, 8, 1.1], [-26, 28, 0.6, 5, 0.8], [-31, 24, 4, 0.6, 0.6]]) { box(w, h, d, x, BY + h / 2, z, MUD2, { j: 0.08 }); col(x, z, w, d, BY - 1, BY + h); }
    put('well', 22, 12); colR(22, 12, 1.6, BY + 1); for (const [x, z] of [[46, -10], [48, -3]]) put('camelSit', x, z, { ry: -1.6 });
    // the edges: steep river banks are open (swim); far sides closed
    for (const [x, z, w, d] of [[62.4, 0, 0.8, 92], [0, 46.4, 130, 0.8], [0, -46.4, 130, 0.8], [-66.4, 0, 0.8, 92]]) col(x, z, w, d);
    return { water: B.sea(63.4, [0.22, 0.42, 0.36], [0.08, 0.2, 0.18], 40) }; },
  // ----------------------------------------------------------------- talk
  talk: {
    hrShep(s, done, K) { const N = '늙은 목자 하맛';
      if (s.flags.hrJacob) { K.say([K.Ln(N, '야곱의 아들이 총리라니… 이 늙은이 살아생전에 별일을 다 보는구먼. 허허!')], done); return; }
      K.say([K.Ln(N, '애굽에서 오신 분이라고? …어디 보자. 그 눈매가 낯이 익구먼.'), { n: N, t: '혹시 야곱이라는 목자를 아시오? 내가 젊을 적 이 들판에서 함께 양을 쳤지.', choices: [{ t: '"제 아버지입니다."', then: () => setTimeout(() => K.say([
        K.Ln(N, '야곱의 아들이라고! 허허, 이런 날이 오다니!'), K.Ln(N, '자네 아버지는 낮에는 더위를, 밤에는 추위를 견디며 라반의 양을 쳤다네. 눈 붙일 틈도 없이 스무 해를 말이야.'),
        K.Ln(N, '라반 어른이 품삯을 열 번이나 바꿨지만, 자네 아버지의 양 떼는 얼룩지고 점 있는 것이 자꾸만 늘었지. 다들 하나님이 그와 함께하신다고 수군거렸다네.'),
        { n: '요셉', t: '「하나님이 그를 금하사 나를 해치 못하게 하셨으며」… 아버지가 늘 하시던 말씀이에요.', ref: '창세기 31:7' }, K.Ln(N, '그래, 그래. 그분이 자네도 지키셨구먼. 허허허!')], () => { s.flags.hrJacob = 1; const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 15); K.pop('아버지의 옛 이야기', '정신력 +15', 'star'); done(); }), 60) }, { t: '"…들어 본 이름이에요."', then: done }] }], done); },
    hrSera(s, done, K) { const N = '할머니 세라';
      if (s.flags.hrRachel) { K.say([K.Ln(N, '라헬의 아들이 이렇게 장성하다니… 그 아이가 보았으면 얼마나 좋아했을까.')], done); return; }
      K.say([K.Ln(N, '이리 가까이 와 보게. 늙어서 눈이 침침하다네.'), K.Ln(N, '…그 눈. 내가 처녀 적에 알던 아이의 눈과 꼭 닮았어. 라헬이라는 아이였지.'),
        { n: N, t: '양을 치던 소녀였어. 얼굴도 곱고 마음씨도 고왔지. 자네… 혹시 그 아이를 아나?', choices: [{ t: '"라헬은 제 어머니입니다."', then: () => setTimeout(() => K.say([
          K.Ln(N, '…아이고, 세상에. 라헬의 아들이라니!', 'cry'), K.Ln(N, '라헬이 저 들판 우물가에서 처음 야곱을 만났다네. 야곱이 혼자서 그 무거운 돌을 굴리고 라헬의 양에게 물을 먹였지.'),
          K.Ln(N, '그러고는 라헬에게 입 맞추고 소리 내어 울었어. 우리 모두 그 모습을 보았다네.'), { n: '', t: '야곱이 라헬에게 입 맞추고 소리 내어 울며.', ref: '창세기 29:11' },
          K.Ln(N, '라헬은 베를 잘 짰지. 이건 그 아이가 짜 준 양털 띠야. 평생 간직했는데… 이제 주인에게 돌아갈 때가 되었구먼.'), { n: '요셉', t: '…어머니.' }], () => { s.flags.hrRachel = 1; Game.give('hrBand', 1); if (Game.insight) Game.insight(1, '어머니 라헬'); K.pop('라헬의 양털 띠를 받았어요', '깨달음 1', 'star'); done(); }), 60) }, { t: '"…아니요. 잘 모르겠어요."', then: done }] }], done); },
    hrEldad(s, done, K) { const N = '라반의 손자 엘닷';
      if (s.flags.hrEldad) { K.say([K.Ln(N, '사촌 형님! 다음에 오실 땐 애굽 이야기를 더 들려주세요!')], done); return; }
      K.say([K.Ln(N, '애굽 총리님이 우리 할아버지 집터를 보러 오셨다고요?'), K.Ln(N, '저는 라반의 손자 엘닷이에요. 할아버지 딸이 레아와 라헬이고, 그분들이 야곱 어른께 시집가셨대요.'),
        { n: '요셉', t: '그럼 우리는 한 핏줄이구나. 내 어머니가 라헬이란다.' }, K.Ln(N, '네에?! 그럼 형님은 제 고모님 아들… 사촌 형님이시네요!', 'happy'),
        K.Ln(N, '할아버지는 야곱 어른이 몰래 떠났다고 평생 투덜거리셨지만, 길르앗에서 돌무더기를 쌓고 서로 해치지 않기로 언약하셨대요.'), { n: '', t: '여호와께서 나와 너 사이를 살피시옵소서.', ref: '창세기 31:49' }],
        () => { s.flags.hrEldad = 1; Game.silver(20); K.pop('사촌 엘닷을 만났어요', '은 20 · 반가운 핏줄', 'star'); done(); }); },
    hrWool(s, done, K) { K.say([K.Ln('양털 장수 게델', '어서 오세요! 하란 양털은 길고 부드러워요. 애굽 세마포와 바꿔 가는 사람도 많지요.')], () => { done(); G.UI.shop('hrShop'); }); },
    hrGirl(s, done, K) { const N = '목동 소녀 미가';
      if (s.flags.hrWellDay === s.day) { K.say([K.Ln(N, '오늘 양들은 물을 실컷 마셨어요. 고맙습니다!')], done); return; }
      K.say([K.Ln(N, '양들이 목말라해요… 그런데 우물 덮개 돌이 너무 무거워서 목자들이 다 모일 때까지 기다려야 해요.'), { n: N, t: '혹시… 같이 밀어 주실래요?', choices: [{ t: '돌을 굴려 주기', then: () => { done(); wellStone(s, K); } }, { t: '다음에요', then: done }] }], done); } },
  ctx(s, lx, lz, K) { const out = []; const d = Math.hypot(lx - WELL[0], lz - WELL[1]); if (d < 3.2 && s.flags.hrWellDay !== s.day) out.push({ d: d - 1.8, label: '우물 덮개 돌 굴리기', x: K.BX + WELL[0], z: K.BZ + WELL[1], yAbs: K.BY + 1.4, key: 'hrWell', use: () => wellStone(s, K) });
    { const e = Math.hypot(lx + 30, lz - 28); if (e < 4.5) out.push({ d: e - 3, label: '라반의 옛 집터 둘러보기', x: K.BX - 30, z: K.BZ + 28, yAbs: K.BY + 1.2, key: 'hrRuin', use: () => K.say([{ n: '', t: '무너진 흙벽만 남은 집터예요. 여기서 아버지 야곱은 스무 해를 일했고, 레아와 라헬과 혼인했어요. 형들 열과 요셉이 태어난 것도 이 집이었어요.' }, { n: '요셉', t: '「내가 이와 같이 낮에는 더위를 무릅쓰고 밤에는 추위를 당하며 눈붙일 겨를도 없이 지내었나이다」… 아버지, 이곳이었군요.', ref: '창세기 31:40' }]) }); }
    return out; } });
function wellStone(s, K) { G.UI.minigame('count', { title: '우물 덮개 돌 굴리기', hint: '어깨를 대고 힘껏 밀어요! 아버지 야곱도 이 돌을 혼자 굴렸대요.', need: 10, btn: '밀기', onPress: n => { const P = Game.P; P.emote = { k: 'gather', t: 0, dur: 0.4 }; if (n % 3 === 0 && G.Audio) G.Audio.sfx('thud', { vol: 0.4 }); } }, () => {
  s.flags.hrWellDay = s.day; s.flags.hrWellN = (s.flags.hrWellN || 0) + 1; Game.give('wool', 2); const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 10);
  for (const id of ['hrGirl', 'hrShep2', 'hrShep']) { const m = Game.npc(id); if (m && m.vis) { if (G.Voice) G.Voice.react(m, id === 'hrShep' ? 'laugh' : 'surprise', { vol: 0.8 }); setTimeout(() => G.Life.bubble(id, id === 'hrShep' ? '허허, 야곱이 돌아온 줄 알았네!' : '혼자서 굴렸어!', 2.4), 500); } }
  setTimeout(() => K.say([{ n: '', t: '돌이 굴러가자 목자들이 양 떼에게 물을 먹였어요.', ref: '창세기 29:10' }], () => { K.pop('우물 돌을 굴렸어요', '양털 2 · 정신력 +10', 'star'); G.UI.quest && G.UI.quest(); }), 900); }); }
})(window.G);
