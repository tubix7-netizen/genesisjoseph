/* 약속의 길 — 미디안 광야 (v18.50)
   애굽 동쪽, 시내 광야 너머 붉은 바위 땅. 「미디안 사람 상인들이 지나갈 때에 형들이 요셉을 구덩이에서 끌어올리고 은 이십에 이스마엘 사람들에게 팔매」(창 37:28).
   · 고센 들판의 「미디안 대상」 사람에게 말하면 낙타를 타고 동쪽 광야로 가요.
   · 미디안: 붉은 사암 절벽과 협곡, 야자수 둘러싼 오아시스 샘, 검은 염소털 천막 마을, 낙타들, 아카시아, 향품 짐.
   · 할 일: 그날 요셉을 애굽으로 데려간 늙은 상인과 다시 만나기(용서), 협곡으로 흩어진 낙타 셋 찾기, 오아시스에서 물 긷기, 향품 장수(유향 · 몰약 · 향품). */
'use strict';
(function (G) {
const Ls = G.Lands; if (!Ls) return; const Game = G.Game;
const t = Ls.tint, LM = Ls.lookOf('midian') || Ls.lookOf('ishmael'), LI = Ls.lookOf('ishmael') || LM, LF = Ls.lookOf('dinah') || Ls.lookOf('leah');
const GUIDE = '미디안 대상 사람 르우';
const SAND = 0xc89a64, RED = 0xa8583a, RED2 = 0x9a4a30, POOL = [0, 4];
const CAMELS = [[-44, 30], [46, 34], [-40, -30]]; // lost in the canyons
Ls.make({ key: 'midian', name: '미디안', BX: 140, BZ: -120, BY: 64, hours: 7, seed: 57, sfx: 'step',
  spawn: [0, -36, 0], help: ['미디안 광야', '애굽 동쪽 붉은 바위 땅 · 오아시스와 천막 마을 · 돌아갈 땐 대상 사람 르우에게'], hello: ['미디안 광야 도착!', '붉은 바위와 오아시스의 땅'],
  depart: { id: 'mdGuideE', name: GUIDE, look: t(LM, { clothCol: 0x7a4a2a }), x: 54, z: 28, face: -Math.PI / 2, when: () => Ls.after('c5_patrol'), place: '고센 들판 · 미디안 대상',
    intro: ['애굽의 총리님! 저는 미디안 대상의 르우입니다. 고센에서 양털을 사서 동쪽으로 돌아가는 길이에요.', '우리 미디안 사람들은 광야의 별을 보고 길을 찾지요. 향품과 유향을 싣고 애굽을 오간 지 오래되었어요.'], ask: '우리 천막 마을에 가 보시겠어요? 낙타로 며칠 길이에요.', go: '낙타 타고 미디안으로', night: '밤 광야는 별이 길잡이지만, 총리님을 모시고는 낮에 떠나요!', backMsg: '고센 들판' },
  arrive: { id: 'mdGuide', name: GUIDE, look: t(LM, { clothCol: 0x7a4a2a }), x: 3, z: -37, face: Math.PI, ask: '애굽으로 돌아가실까요?', go: '낙타 타고 애굽으로' },
  items: { frank: { n: '유향', cat: 'good', p: 35, ic: 'oil', c: '#e8dcc0' }, myrrh: { n: '몰약', cat: 'good', p: 45, ic: 'oil', c: '#8a3a2a' }, spice: { n: '향품', cat: 'good', p: 30, ic: 'herb', c: '#a8783a' }, mdBell: { n: '낙타 방울', cat: 'key', p: 0, ic: 'stone', c: '#c8a040' } },
  shops: { mdShop: { n: '향품 장수 나하라', sells: ['good', 'crop', 'food'], no: ['frank', 'myrrh', 'spice'], mul: { good: 1.3, food: 1.2 }, buy: [{ n: '유향', item: 'frank', qty: 1, price: 26, d: '나무 진을 말린 하얀 향 · 애굽 신전과 궁에서 써요' }, { n: '몰약', item: 'myrrh', qty: 1, price: 34, d: '쓰고 향기로운 진 · 약과 향유로 써요' }, { n: '향품', item: 'spice', qty: 1, price: 22 }, { n: '대추야자 ×4', item: 'dates', qty: 4, price: 8 }] } },
  people: [
    { id: 'mdOld', name: '늙은 미디안 상인 야틸', look: t(LM, { age: 'old', hair: 0xd8d0c8, beardCol: 0xd8d0c8, clothCol: 0x5a3a2a }), x: -6, z: 14, face: 0.6, talkR: 3, sit: true },
    { id: 'mdChief', name: '천막 마을 어른 호밥', look: t(LI, { clothCol: 0x3a2a2a, age: 'old' }), x: 8, z: 18, face: Math.PI, talkR: 3 },
    { id: 'mdSpice', name: '향품 장수 나하라', look: t(LF, { clothCol: 0x7a2a3a, top: 0x7a2a3a }), x: 14, z: 6, face: -Math.PI / 2 },
    { id: 'mdHerd', name: '낙타 몰이 소년 에벨', look: t(Ls.lookOf('ishBoy') || LM, { top: 0xc8a040 }), x: 18, z: 22, face: Math.PI, talkR: 3, scale: 0.72 },
    { id: 'mdWater', name: '물 긷는 여인 십보', look: t(LF, { clothCol: 0x2a4a6a, top: 0x2a4a6a }), x: -3, z: 1, face: 0.3, act: 'gather', chat: ['이 샘은 광야의 생명이에요. 낙타도 사람도 여기서 살아요.', '샘가 야자수는 할아버지의 할아버지가 심었대요.'] },
    { id: 'mdKid', name: '미디안 아이 레엘', look: t(Ls.lookOf('ishBoy') || LM, { top: 0xe8e0d0 }), x: 4, z: 26, face: 0, wander: 6, scale: 0.6, chat: ['밤에 별 보러 가요! 광야 별은 모래알처럼 많아요!', '애굽엔 물이 강처럼 흐른다면서요? 진짜예요?'] },
    ...[[22, 28], [25, 26], [20, 31]].map(([x, z], i) => ({ id: 'mdCamel' + i, name: '낙타', animal: 'camel', x, z, face: i * 1.2 + 2, wander: 1.5, noTalk: true, noTag: true })),
    ...CAMELS.map(([x, z], i) => ({ id: 'mdLost' + i, name: '길 잃은 낙타', animal: 'camel', x, z, face: i * 2, noTalk: true, show: () => { const s = Game.S(); return !!(s && s.flags.land_midian && s.flags.mdCamelQ && !(s.flags.mdCamels || {})[i]); } })),
    ...CAMELS.map((p, i) => ({ id: 'mdHome' + i, name: '돌아온 낙타', animal: 'camel', x: 26 + i * 2.6, z: 21 - i, face: 2.4, wander: 1.2, noTalk: true, noTag: true, show: () => { const s = Game.S(); return !!(s && s.flags.land_midian && (s.flags.mdCamels || {})[i]); } }))],
  chatter: [['오늘 밤엔 서풍이 불겠어.', '모래 언덕이 또 자리를 옮기겠네.'], ['애굽 총리가 히브리 사람이래.', '…설마, 그때 그 아이는 아니겠지?'], ['유향 짐을 다 쌌어?', '해 뜨기 전에 떠나야 해.'], ['샘물이 줄지 않아서 다행이야.', '흉년에도 이 샘은 마른 적이 없지.']],
  weather: { clear: 0.86, cloudy: 0.06, rain: 0, wind: 0.08, fog: 0, dust: 0, storm: 0 },
  trail: { group: '먼 땅', list: [
    { id: 'mdVisit', n: '미디안 광야에 가 보기', h: '고센 들판의 대상 사람 르우', v: s => s.flags.land_midianMet ? 1 : 0, max: 1 },
    { id: 'mdForgive', n: '옛 상인과 다시 만나기', h: '미디안 천막 마을의 늙은 상인', v: s => s.flags.mdForgive ? 1 : 0, max: 1 },
    { id: 'mdCamel', n: '길 잃은 낙타 셋', h: '미디안 · 낙타 몰이 소년 에벨', v: s => Object.keys(s.flags.mdCamels || {}).length, max: 3 }] },
  quest: s => s.flags.mdCamelQ && !s.flags.mdCamelDone ? [{ t: `미디안 · 길 잃은 낙타 (${Object.keys(s.flags.mdCamels || {}).length}/3)`, ok: Object.keys(s.flags.mdCamels || {}).length >= 3 }] : [],
  // ----------------------------------------------------------------- the ground: a sandy basin ringed by red cliffs, a pool in the middle
  floor: (lx, lz) => { if (Math.hypot(lx - POOL[0], lz - POOL[1]) < 5.2) return null; if (Math.abs(lx) < 56 && Math.abs(lz) < 44) return 64; return null; },
  water: (lx, lz) => { const d = Math.hypot(lx - POOL[0], lz - POOL[1]); if (d < 5.2) return { level: 63.7, bed: 64 - Math.min(1.4, (5.2 - d) * 0.45) }; return null; },
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B;
    box(116, 14, 92, 0, BY - 7, 0, SAND); g.box(500, 1, 500, { at: [X, BY - 0.4, Z], c: 0xc0905a, j: 0.05 });
    cyl(5.6, 5.6, 0.2, 20, POOL[0], BY - 1.5, POOL[1], 0x6a7a5a); // the pool's floor (the water mesh sits just under the sand around it)
    // red sandstone cliffs round the basin, with canyon mouths where camels stray
    const cliff = (x, z, w, d, h) => { box(w, h, d, x, BY + h / 2 - 0.2, z, rng() < 0.5 ? RED : RED2, { j: 0.12, ry: (rng() - 0.5) * 0.3 }); box(w * 0.8, h * 0.25, d * 0.8, x + (rng() - 0.5) * 2, BY + h + h * 0.1, z, RED2, { j: 0.12 }); col(x, z, w, d, BY - 1, BY + h + 2, true); };
    for (let i = 0; i < 9; i++) { const x = -52 + i * 13; if (Math.abs(x - 46) < 6) continue; cliff(x, 46 + rng() * 2, 12, 6, 9 + rng() * 6); }
    for (let i = 0; i < 9; i++) { const x = -52 + i * 13; if (Math.abs(x + 40) < 6) continue; cliff(x, -46 - rng() * 2, 12, 6, 8 + rng() * 6); }
    for (let i = 0; i < 7; i++) { const z = -38 + i * 12.6; if (Math.abs(z - 30) < 6) continue; cliff(-58 - rng() * 2, z, 6, 12, 9 + rng() * 6); cliff(58 + rng() * 2, z, 6, 12, 9 + rng() * 6); }
    // the canyon pockets beyond the gaps (where the lost camels are), closed at their far ends
    for (const [x, z, w, d] of [[-44, 30, 8, 6], [46, 34, 6, 8], [-40, -30, 6, 8]]) box(w + 4, 0.06, d + 4, x, BY + 0.02, z, 0xb88a58, { j: 0.05 });
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2, r = 130 + rng() * 60; box(30 + rng() * 30, 18 + rng() * 26, 20, Math.cos(a) * r, BY + 4, Math.sin(a) * r, [RED, RED2, 0xb86a44][i % 3], { ry: a, j: 0.1 }); } // mesas on the horizon
    for (const [x, z, r] of [[-20, -20, 2.2], [26, -24, 1.8], [-30, 8, 1.6], [34, 0, 2], [-10, 34, 1.4]]) { sph(r, x, BY + r * 0.4, z, RED2, { s: [1.3, 0.9, 1.1], j: 0.12 }); colR(x, z, r * 1.2, BY + r * 1.3); }
    // the oasis: palms round the pool, reeds, grass
    box(16, 0.05, 16, POOL[0], BY + 0.015, POOL[1], 0x7a8a4a, { j: 0.08 });
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.3, x = POOL[0] + Math.cos(a) * 7.2, z = POOL[1] + Math.sin(a) * 7.2; put(i % 2 ? 'datePalm' : 'palm', x, z, { s: 1 + (i % 3) * 0.1 }); colR(x, z, 0.4); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, x = POOL[0] + Math.cos(a) * 5.4, z = POOL[1] + Math.sin(a) * 5.4; put('reeds', x, z, { s: 0.7 }); }
    // the tent village (black goat-hair tents), a fire, camels kneeling, loads of incense
    for (const [x, z, ry, s] of [[-12, 18, 0.2, 1.1], [0, 22, 0, 1.2], [12, 24, -0.2, 1.1], [-20, 10, 0.6, 1], [22, 12, -0.6, 1], [-16, 28, 0.3, 1]]) { put('tent', x, z, { ry, s }); col(x, z, 4.2 * s, 3.2 * s, BY - 1, BY + 2.6); }
    put('campfire', -2, 12); for (const [x, z, ry] of [[24, 18, 2.2], [28, 16, 2.6]]) put('camelSit', x, z, { ry });
    for (const [fn, x, z] of [['sacks', 16, 4], ['baskets', 18, 6], ['pots', 12, 2], ['bales', 30, 22]]) put(fn, x, z);
    for (const [x, z] of [[-30, -10], [30, -12], [-36, 22], [40, 18], [0, -24]]) { put('acacia', x, z, { s: 1.05 }); colR(x, z, 0.4); }
    // walls: the basin's edge is the cliffs; the three canyon pockets are open into it but closed behind
    for (const [x, z, w, d] of [[-44, 35, 12, 0.8], [-49, 30, 0.8, 10], [-39, 33, 0.8, 4], [51, 34, 0.8, 12], [46, 40, 10, 0.8], [-40, -35, 10, 0.8], [-45, -30, 0.8, 10], [-35, -33, 0.8, 4]]) col(x, z, w, d);
    return { water: B.sea(63.7, [0.2, 0.5, 0.42], [0.06, 0.26, 0.24], 30) }; },
  // ----------------------------------------------------------------- talk
  talk: {
    mdOld(s, done, K) { const N = '늙은 미디안 상인 야틸';
      if (s.flags.mdForgive) { K.say([K.Ln(N, '총리님… 아니, 요셉. 그날 이후로 나는 길에서 만나는 아이마다 물 한 모금씩 건넸다오.')], done); return; }
      K.say([K.Ln(N, '애굽의 총리가 히브리 사람이라더니… 가까이 와 보시오. 늙은이 눈이 어두워서.'), K.Ln(N, '…그 얼굴. 그 옛날 도단 들판에서… 구덩이에서 끌어올린 그 소년!', 'fear'),
        K.Ln(N, '은 스물에 너를 사서, 줄에 묶어 애굽까지 끌고 간 대상에 내가 있었다. 밤마다 우는 소리를 들었지만… 장사꾼은 짐을 동정하지 않는 법이라 여겼지.', 'cry'),
        { n: N, t: '이제 너는 온 애굽의 총리. 이 늙은이를 어떻게 하겠느냐…', choices: [
          { t: '"두려워하지 마십시오. 하나님이 생명을 구하시려고 저를 앞서 보내셨습니다."', then: () => setTimeout(() => forgive(s, K, done), 60) },
          { t: '"…그 밤들을 저는 잊지 못합니다."', then: () => setTimeout(() => K.say([{ n: '요셉', t: '…그래도 그날 줄을 풀어 물을 준 아이가 대상에 있었어요. 하나님은 그 길에도 계셨지요.' }, K.Ln(N, '…그 아이는 내 손자였다.')], () => forgive(s, K, done)), 60) }] }], done); },
    mdChief(s, done, K) { const N = '천막 마을 어른 호밥';
      K.say([K.Ln(N, '광야에 오신 것을 환영하오. 천막은 좁아도 손님 자리는 늘 있지.'), K.Ln(N, '우리 미디안은 아브라함 어른의 아들 미디안의 자손이오. 그러니 총리와 우리는 먼 친척인 셈이지!'), { n: '', t: '그두라가 시므란과 욕산과 므단과 미디안과… 를 낳았고.', ref: '창세기 25:2' }], () => { if (!s.flags.mdChief) { s.flags.mdChief = 1; Game.give('dates', 4); K.pop('광야의 환대', '대추야자 4', 'star'); } done(); }); },
    mdSpice(s, done, K) { K.say([K.Ln('향품 장수 나하라', '향품과 유향과 몰약! 길르앗에서 애굽까지, 우리 낙타가 실어 나르는 귀한 것들이에요.')], () => { done(); G.UI.shop('mdShop'); }); },
    mdHerd(s, done, K) { const N = '낙타 몰이 소년 에벨', n = Object.keys(s.flags.mdCamels || {}).length;
      if (s.flags.mdCamelDone) { K.say([K.Ln(N, '낙타들이 총리님을 알아봐요! 침도 안 뱉어요. 하하!')], done); return; }
      if (n >= 3) { K.say([K.Ln(N, '셋 다 찾아오셨어요?! 고맙습니다! 할아버지께 혼날 뻔했어요.'), K.Ln(N, '이건 우리 대상 맨 앞 낙타가 달던 방울이에요. 이 소리가 들리면 광야 어디서든 우리 대상인 줄 알아요.')], () => { s.flags.mdCamelDone = 1; Game.give('mdBell', 1); Game.silver(30); K.pop('낙타 방울을 받았어요', '은 30', 'star'); G.UI.quest && G.UI.quest(); done(); }); return; }
      if (s.flags.mdCamelQ) { K.say([K.Ln(N, `낙타는 바위 틈 협곡으로 들어가는 버릇이 있어요. (${n}/3) 북서쪽, 북동쪽, 남서쪽 절벽 사이를 살펴보세요!`)], done); return; }
      K.say([K.Ln(N, '총리님! 큰일 났어요. 밤에 바람이 불어서 낙타 셋이 흩어졌어요.'), { n: N, t: '바위 틈 협곡으로 들어간 것 같은데… 같이 찾아 주실래요?', choices: [{ t: '찾아 줄게', then: () => { s.flags.mdCamelQ = 1; G.UI.quest && G.UI.quest(); K.pop('길 잃은 낙타 셋', '절벽 사이 협곡을 살펴요', 'star'); } }, { t: '나중에', then: () => { } }] }], done); } },
  ctx(s, lx, lz, K) { const out = [];
    { const d = Math.hypot(lx - POOL[0], lz - POOL[1]); if (d < 7.2 && d > 4.6) out.push({ d: d - 4.4, label: '오아시스에서 물 긷기', x: K.BX + POOL[0], z: K.BZ + POOL[1], yAbs: K.BY + 0.6, key: 'mdPool', use: () => { s.water = s.jarMax || 8; G.Audio && G.Audio.sfx('water', { vol: 0.6 }); K.pop('물을 가득 길었어요', '오아시스의 샘물', 'drop'); G.UI.hud && G.UI.hud(); } }); }
    if (s.flags.mdCamelQ && !s.flags.mdCamelDone) { const got = (s.flags.mdCamels = s.flags.mdCamels || {}); CAMELS.forEach(([x, z], i) => { if (got[i]) return; const d = Math.hypot(lx - x, lz - z); if (d < 3.2) out.push({ d: d - 2, label: '낙타 고삐 잡기', x: K.BX + x, z: K.BZ + z, yAbs: K.BY + 2.2, key: 'mdCamel' + i, use: () => { got[i] = 1; const m = Game.npc('mdLost' + i); if (m) m.vis = false; G.Audio && G.Audio.sfx('pickup'); const n = Object.keys(got).length; K.pop(`낙타 ${n}/3`, n >= 3 ? '천막 마을의 에벨에게 돌아가요' : '낙타가 마을로 걸어가요', 'star'); G.UI.quest && G.UI.quest(); } }); }); }
    return out; } });
function forgive(s, K, done) { const N = '늙은 미디안 상인 야틸';
  K.say([K.Ln(N, '…이 늙은이를, 용서한다는 말이냐.', 'cry'), { n: '요셉', t: '「당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사 오늘과 같이 만민의 생명을 구원하게 하시려 하셨나니」. 그 길 끝에서 저는 온 땅을 먹였습니다.', ref: '창세기 50:20' },
    K.Ln(N, '…', 'cry'), K.Ln(N, '그날 대상에서 네 줄을 몰래 풀어 물을 먹인 아이가 있었지. 그 아이가 내 손자 르우다. 너를 이리로 데려온 그 사람이야.'), { n: '요셉', t: '…하나님은 그 길에도 계셨군요.' }],
    () => { s.flags.mdForgive = 1; if (Game.insight) Game.insight(1, '광야의 용서'); const H = s.hero; if (H) H.mind = H.mindMax || 100; K.pop('옛 상인과 다시 만났어요', '깨달음 1 · 정신력이 가득', 'star'); done && done(); }); }
})(window.G);
