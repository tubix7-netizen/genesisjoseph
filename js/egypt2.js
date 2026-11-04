/* 약속의 길 — 피라미드 일꾼 마을 (v18.23)
   기자의 피라미드 곁에는 피라미드를 짓고 고치던 일꾼들의 마을이 있었어요 (빵 굽는 화덕과 맷돌, 일꾼들의 집, 감독관과 서기).
   요셉이 애굽에 왔을 때 피라미드는 이미 수백 년 된 옛 왕들의 무덤이었지만, 돌을 다듬고 고치는 일꾼들은 여전히 있었지요.
   · 서쪽 사막 끝, 피라미드 동쪽(-168, -140)에 일곱 집의 마을: 감독관 세넨, 돌 깎는 일꾼 바키, 돌 끄는 일꾼 켄티,
     빵 굽는 여인 사트, 물 나르는 여인 레넷, 서기 우세르, 아이 아누.
   · 채석장(큰 피라미드 앞): 다듬은 돌 더미, 돌 썰매, 끌 자국 난 바위. 마을: 우물, 화덕, 맷돌, 항아리, 철 따라 오는 일꾼들의 천막. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!EP || !AI || !AI.addFolk) return;
const S = () => Game.S();
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const CX = -168, CZ = -140, QX = -180, QZ = -152; // village centre · the quarry before the great pyramid
Object.assign(AI.ROUT, {
  stonecutter: [[5.4, 'home:wake'], [6, 'work:act:mine'], [11.4, 'shade:sit'], [13, 'work:act:mine'], [17.4, 'market:wander:2'], [19, 'fire:sit'], [21, 'home']],
  overseer: [[6, 'work:wander:5'], [12, 'eat'], [13, 'work:wander:5'], [17.5, 'market:wander:2'], [19, 'fire:sit'], [21, 'home']],
  scribe: [[6.5, 'work:wander:3'], [12, 'eat'], [13, 'work:wander:3'], [16, 'market:wander:2'], [18.5, 'fire:sit'], [20.8, 'home']],
});
const homes = []; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + 0.5, d = 11 + (i % 2) * 3; homes.push([+(CX + Math.cos(a) * d).toFixed(2), +(CZ + Math.sin(a) * d).toFixed(2), 0, -a + Math.PI / 2]); }
const V = { id: 'pyr', n: '피라미드 일꾼 마을', x: CX, z: CZ, r: 20, when: S2 => after('c2_arrive'),
  spots: { hub: [CX, CZ, 3], well: [CX, CZ, 3], market: [CX + 6, CZ - 6, 2.5], fire: [CX - 6, CZ - 6, 2], play: [CX + 8, CZ + 6, 3], work: [QX, QZ, 4], shade: [CX - 8, CZ + 8, 2.5], gate: [CX + 12, CZ, 2] },
  homes: homes.map(h => h.slice(0, 3)), about: ['이 마을 사람들은 대대로 피라미드 돌을 다듬어 왔다오.', '큰 피라미드는 옛 왕 때 지은 거라, 우리 할아버지의 할아버지도 몰랐다오.'], folk: [] };
(EP.villages = EP.villages || []).push(V);
const vl = id => { for (const v of EP.villages) { const f = (v.folk || []).find(q => q.id === id); if (f) return f.look; } return null; };
const tw = (b, o) => Object.assign({}, b || {}, o);
const M0 = vl('ct_pot'), M1 = vl('w_far') || M0, OF = vl('ct_mer') || M0, W0 = vl('ct_wat') || vl('w_wat'), K0 = vl('ct_kid');
const FOLK = [
  { id: 'py_ovr', name: '감독관 세넨', role: 'overseer', home: 0, look: tw(OF, { skin: 0xa86a40 }), prop: 'staff', persona: '피라미드 일꾼들을 이끄는 감독관. 엄하지만 일꾼들 밥은 꼭 챙긴다.' },
  { id: 'py_cut1', name: '돌 깎는 일꾼 바키', role: 'stonecutter', home: 1, look: tw(M0, { skin: 0x8a5a32 }), prop: 'hammer', persona: '돌을 반듯하게 다듬는 일꾼. 손가락 마디마다 굳은살이 박였다.' },
  { id: 'py_cut2', name: '돌 끄는 일꾼 켄티', role: 'stonecutter', home: 2, look: tw(M1, { skin: 0x9a6038, build: 1.15 }), persona: '썰매로 큰 돌을 끄는 힘센 일꾼. 노래를 부르며 줄을 당긴다.' },
  { id: 'py_bak', name: '빵 굽는 여인 사트', role: 'baker', home: 3, look: tw(W0, { skin: 0xb07848 }), persona: '일꾼들이 먹을 빵을 굽는 여인. 하루에 수백 덩이를 굽는다.' },
  { id: 'py_wat', name: '물 나르는 여인 레넷', role: 'water', home: 4, look: tw(W0, { skin: 0xc08a58, top: 0xd8c8a0 }), persona: '나일 강에서 마을까지 물을 나르는 여인.' },
  { id: 'py_scr', name: '서기 우세르', role: 'scribe', home: 5, look: tw(OF, { skin: 0xb88050 }), persona: '돌 하나하나를 장부에 적는 서기. 글을 가르치기도 한다.' },
  { id: 'py_kid', name: '아이 아누', role: 'child', home: 3, age: 'kid', look: K0, persona: '사트의 아들. 커서 감독관이 되고 싶다.' },
];
for (const f of FOLK) if (f.look) AI.addFolk(EP, V, f);
(EP.places = EP.places || []).push({ n: '피라미드 일꾼 마을', x: CX, z: CZ, k: 'town', when: S2 => after('c2_arrive') });
if (G.VillageTalk) G.VillageTalk.any.push(['돌 하나가 소 열 마리 무게래요.', '그래도 다 같이 끌면 움직여요!'], ['피라미드는 옛 왕들의 무덤이래요.', '수백 년 전에 지었다지요.']);
// ------------------------------------------------------------------ the buildings and the quarry
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const E = Object.assign({}, G.env || {}, EP.envx || {}), put = (fn, x, z, o) => E[fn] && W.place(E[fn], x, z, o || {});
  homes.forEach(([x, z, , ry]) => W.place('egHouse', x, z, { ry, args: [{ w: 4.6, d: 3.8, h: 3.4 }], col: { w: 4.6, d: 3.8, h: 3.9, a: ry, cam: true } }));
  put('well', CX, CZ, { col: { r: 1.7, h: 1 } });
  for (const [fn, x, z, ry] of [['oven', CX + 5.5, CZ - 7.5, 0], ['oven', CX + 7.6, CZ - 6.2, 0.6], ['quern', CX + 4.2, CZ - 4.8, 0], ['jars', CX - 3.6, CZ + 4.4, 0.3], ['baskets', CX + 3.4, CZ + 4.2, 0], ['bales', CX - 6.4, CZ - 3, 0.4]]) put(fn, x, z, { ry });
  for (const [x, z, ry] of [[CX - 2, CZ + 20, 0.3], [CX + 5, CZ + 21.5, -0.2], [CX - 9, CZ + 19, 0.6]]) put('tent', x, z, { ry }); // seasonal workers (the flood months, when the fields are under water)
  // quarry: dressed blocks, a sledge with a block, a chiselled rock face
  W.place((g, M) => { for (let i = 0; i < 9; i++) { const x = (i % 3) * 1.35, z = Math.floor(i / 3) * 1.25; g.box(1.2, 0.9, 1.1, { m: M, at: [x, 0.45, z], c: 0xd8c49a, j: 0.04 }); if (i < 4) g.box(1.2, 0.9, 1.1, { m: M, at: [0.6 + (i % 2) * 1.35, 1.35, 0.6 + Math.floor(i / 2) * 1.25], c: 0xd0bc90, j: 0.04 }); } }, QX + 4, QZ + 2, { ry: 0.2, col: { w: 4.4, d: 4, h: 2 } });
  W.place((g, M) => { for (const s of [-1, 1]) g.box(0.16, 0.18, 3.2, { m: M, at: [s * 0.6, 0.09, 0], c: 0x7a5a3a }); for (let i = 0; i < 4; i++) g.box(1.4, 0.08, 0.16, { m: M, at: [0, 0.2, -1.2 + i * 0.8], c: 0x6a4a30 }); g.box(1.2, 1.0, 1.6, { m: M, at: [0, 0.74, 0], c: 0xd8c49a }); g.cyl(0.03, 0.03, 4.2, 4, { m: M, at: [0.35, 0.3, 3.4], rx: Math.PI / 2 - 0.08, c: 0xc8a878 }); g.cyl(0.03, 0.03, 4.2, 4, { m: M, at: [-0.35, 0.3, 3.4], rx: Math.PI / 2 - 0.08, c: 0xc8a878 }); }, QX - 3, QZ + 6, { ry: 0.6, col: { w: 1.6, d: 3.4, h: 1.4 } });
  W.place((g, M) => { g.box(7, 3.4, 2.6, { m: M, at: [0, 1.7, 0], c: 0xc8b48a, j: 0.06 }); for (let i = 0; i < 6; i++) g.box(0.06, 2.8, 0.06, { m: M, at: [-3 + i * 1.2, 1.6, 1.31], c: 0x9a8668, j: 0 }); }, QX - 6, QZ - 2, { ry: 0.25, col: { w: 7, d: 2.6, h: 3.4 } });
} catch (e) { console.error('egypt2', e); } };
})(window.G);
