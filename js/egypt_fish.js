/* 약속의 길 — 갈대 어촌 (v18.50)
   도성 남쪽, 나일 강 동쪽 기슭의 빈 들에 작은 어부 마을이 생겼어요. 갈대배를 묶어 두고, 그물을 깁고, 잡은 고기를 볕에 말리는 마을이에요.
   · 여섯 집: 어부 우나스(마을 어른), 그물 깁는 할머니 메르티, 갈대배 짓는 페피, 고기 말리는 여인 이세트, 어부 아들 케티, 물 긷는 여인 누트.
   · 할 일: 그물 깁기 돕기(하루 한 번 · 생선), 갈대배 짓는 페피에게 갈대 다섯 다발 건네기(한 번 · 은과 생선 · 「갈대 어촌」 발자취),
     말린 생선 맛보기(하루 한 번 · 기력), 우나스의 강 이야기(사람들에게 「이 마을은 어떤 곳이에요?」). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!EP || !AI || !AI.addFolk) return;
const S = () => Game.S(), pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(t);
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const CX = -48, CZ = 148, BANK = -64; // the village · the river bank west of it (the water starts near x -73)
const when = () => after('c2_arrive');
Object.assign(AI.ROUT, { fisher: [[5, 'home:wake'], [5.6, 'work:act:gather'], [11.4, 'shade:sit'], [13, 'work:act:gather'], [17, 'market:wander:2'], [19, 'fire:sit'], [21, 'home']] });
const homes = []; [[-1.1, 12], [-0.4, 14], [0.4, 12], [1.1, 14], [1.9, 12.5], [2.6, 13.5]].forEach(([a, d]) => homes.push([+(CX + Math.cos(a) * d).toFixed(2), +(CZ + Math.sin(a) * d).toFixed(2), 0, -a - Math.PI / 2]));
const V = { id: 'fish', n: '갈대 어촌', x: CX, z: CZ, r: 20, when,
  spots: { hub: [CX, CZ, 3], well: [CX + 3, CZ + 2, 2.5], market: [CX - 6, CZ - 4, 2.5], fire: [CX - 2, CZ + 6, 2], play: [CX + 6, CZ - 6, 3], work: [BANK - 2, CZ, 4], shade: [CX - 9, CZ + 7, 2.5], gate: [CX + 13, CZ, 2] },
  homes: homes.map(h => h.slice(0, 3)), about: ['우리 마을은 나일 강이 먹여 살린다오. 아침엔 그물, 낮엔 볕, 저녁엔 말린 고기.', '강물이 넘치는 철엔 갈대배를 타고 이웃 마을까지 고기를 팔러 다니지.'], folk: [] };
(EP.villages = EP.villages || []).push(V);
const vl = id => { for (const v of EP.villages) { const f = (v.folk || []).find(q => q.id === id); if (f) return f.look; } return null; };
const tw = (b, o) => Object.assign({}, b || {}, o);
const M0 = vl('w_far') || vl('ct_pot'), M1 = vl('s_far') || M0, W0 = vl('ct_wat') || vl('w_wat'), OW = vl('s_old') || W0, K0 = vl('ct_kid') || vl('s_kid'), EL = vl('ct_eld') || M0;
const FOLK = [
  { id: 'fv_unas', name: '어부 어른 우나스', role: 'elder', home: 0, age: 'old', look: tw(EL, { skin: 0x8a5a32 }), persona: '갈대 어촌의 어른. 나일 강의 물때를 손금 보듯 안다. 농담을 좋아한다.' },
  { id: 'fv_merti', name: '그물 깁는 할머니 메르티', role: 'weaver', home: 1, age: 'old', look: tw(OW, { skin: 0xa86a40 }), persona: '마을 그물을 모두 깁는 할머니. 손이 빠르고 잔소리도 빠르다.' },
  { id: 'fv_pepi', name: '갈대배 짓는 페피', role: 'potter', home: 2, look: tw(M1, { skin: 0x9a6038, build: 1.1 }), persona: '파피루스 갈대를 묶어 배를 짓는 장인. 손에 늘 갈대 물이 들어 있다.' },
  { id: 'fv_iset', name: '고기 말리는 이세트', role: 'weaver', home: 3, look: tw(W0, { skin: 0xb07848, top: 0xe8dcc0 }), persona: '잡은 고기를 소금에 절여 볕에 말리는 여인.' },
  { id: 'fv_keti', name: '어부 아들 케티', role: 'child', home: 0, age: 'kid', look: K0, persona: '우나스의 손자. 악어를 한 번도 무서워한 적이 없다고 우긴다.' },
  { id: 'fv_nut', name: '물 긷는 누트', role: 'water', home: 4, look: tw(W0, { skin: 0xc08a58 }), persona: '강물을 길어 마을 항아리를 채우는 여인. 노래를 잘 부른다.' },
  { id: 'fv_fish', name: '어부 세트나', role: 'fisher', home: 5, look: tw(M0, { skin: 0x8a5a32 }), prop: 'fishrod', persona: '마을에서 고기를 제일 잘 잡는 젊은 어부.' }];
for (const f of FOLK) if (f.look) AI.addFolk(EP, V, f);
(EP.places = EP.places || []).push({ n: '갈대 어촌', x: CX, z: CZ, k: 'town', when });
if (G.VillageTalk && G.VillageTalk.any) G.VillageTalk.any.push(['오늘 아침 그물에 메기가 셋!', '저녁엔 구워 먹자!'], ['강 건너 갈대숲에 하마가 나왔대.', '배 띄울 때 조심해야겠네.']);
// ------------------------------------------------------------------ things to do
const RACK = [BANK + 4, CZ - 6], NET = [BANK + 3, CZ + 5], YARD = [BANK + 1, CZ - 14];
const giveFish = n => { const k = Game.ITEMS.tilapia ? 'tilapia' : Game.ITEMS.mullet ? 'mullet' : null; if (k) Game.give(k, n); return k; };
Game.CTX.push(function (s) { const p = Game.P; if (!when() || p.ride || p.swim || Game.cineOn || G.UI.busy() || (s.q && s.q.riding) || (G.Byblos && G.Byblos.inBy())) return null; const out = [];
  { const d = Math.hypot(p.x - NET[0], p.z - NET[1]); if (d < 2.6) out.push(s.flags.fvNetDay === s.day ? { d: d - 1.4, label: '그물 · 오늘은 다 기웠어요', disabled: true, x: NET[0], z: NET[1], y: 1, key: 'fvNet' } : { d: d - 1.4, label: '그물 깁기 돕기', x: NET[0], z: NET[1], y: 1, key: 'fvNet', use: () => mend(s) }); }
  { const d = Math.hypot(p.x - RACK[0], p.z - RACK[1]); if (d < 2.6) out.push(s.flags.fvRackDay === s.day ? { d: d - 1.4, label: '말린 생선 · 오늘은 맛봤어요', disabled: true, x: RACK[0], z: RACK[1], y: 1.2, key: 'fvRack' } : { d: d - 1.4, label: '말린 생선 맛보기', x: RACK[0], z: RACK[1], y: 1.2, key: 'fvRack', use: () => { s.flags.fvRackDay = s.day; Game.P.stam = Math.max(Game.P.stam, (G.Vitals && G.Vitals.cap) || 120); const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 5); if (G.Audio) G.Audio.sfx('eat', { vol: 0.6 }); pop('짭짤한 말린 생선', '기력이 다 찼어요 · 정신력 +5', 'star'); } }); }
  { const d = Math.hypot(p.x - YARD[0], p.z - YARD[1]); if (d < 3 && !s.flags.fvBoat) { const r = (s.inv && s.inv.reed) || 0; out.push(r >= 5 ? { d: d - 1.6, label: '갈대 다섯 다발 건네기', x: YARD[0], z: YARD[1], y: 1, key: 'fvBoat', use: () => boat(s) } : { d: d - 1.6, label: `갈대배 짓는 곳 · 갈대 ${r}/5 다발이 필요해요`, disabled: true, x: YARD[0], z: YARD[1], y: 1, key: 'fvBoat' }); } }
  return out.length ? out : null; });
function mend(s) { G.UI.minigame('wrestle', { title: '그물 깁기', need: 5, dur: 30, btn: '매듭', unit: '매듭', act: 'gather', hint: '찢어진 그물코를 매듭으로 묶어요. 하얀 표시가 초록 구간에 들어올 때 「매듭」!' }, () => {
  s.flags.fvNetDay = s.day; s.flags.fvNetN = (s.flags.fvNetN || 0) + 1; const k = giveFish(2); const m = Game.npc('fv_merti'); if (m && m.vis && G.Voice) G.Voice.react(m, 'laugh', { vol: 0.8 });
  G.UI.say([{ n: '그물 깁는 할머니 메르티', t: s.flags.fvNetN > 1 ? '허허, 이제 매듭이 제법이구려! 총리님 손이 어부 손 다 되었네.' : '어이구, 총리님이 그물을 다 기워 주시다니! 내일 아침 그물엔 고기가 가득할 거요.' }], () => pop('그물을 기웠어요', k ? '생선 2' : '고마운 인사', 'star')); }); }
function boat(s) { if (!Game.take('reed', 5)) return; s.flags.fvBoat = 1; Game.silver(30); giveFish(3); const m = Game.npc('fv_pepi'); if (m && m.vis && G.Voice) G.Voice.react(m, 'surprise');
  G.UI.say([{ n: '갈대배 짓는 페피', t: '갈대 다섯 다발이나! 이걸로 마을 아이들 배를 하나 더 지을 수 있겠어요.' }, { n: '갈대배 짓는 페피', t: '갈대 한 줄기는 쉽게 꺾이지만, 다발로 묶으면 강도 건너는 배가 되지요. 사람도 그렇고요!' }, { n: '요셉', t: '…좋은 배가 되기를 바라오.' }],
    () => { pop('갈대배를 함께 지었어요', '은 30 · 생선 3', 'star'); if (G.UI.quest) G.UI.quest(); }); }
// ------------------------------------------------------------------ the buildings: houses, net racks, fish racks, the boat yard, reed boats on the bank
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const E = Object.assign({}, G.env || {}, EP.envx || {}), put = (fn, x, z, o) => E[fn] && W.place(E[fn], x, z, Object.assign({ kind: fn }, o || {}));
  homes.forEach(([x, z, , ry]) => W.place('egHouse', x, z, { ry, args: [{ w: 4.4, d: 3.6, h: 3.2 }], col: { w: 4.4, d: 3.6, h: 3.7, a: ry, cam: true } }));
  put('well', CX + 3, CZ + 2, { col: { r: 1.7, h: 1 } }); put('campfire', CX - 2, CZ + 6);
  for (const [fn, x, z, ry] of [['jars', CX + 5, CZ + 4, 0.3], ['baskets', CX - 6, CZ - 3, 0], ['sacks', CX - 4, CZ - 6, 0.2], ['oven', CX + 7, CZ - 2, 0]]) put(fn, x, z, { ry });
  // the fish-drying racks (poles, cross-bars, rows of split fish)
  W.place((g, M) => { for (const x of [-2, 0, 2]) g.cyl(0.05, 0.06, 1.8, 5, { m: M, at: [x, 0.9, 0], c: 0x7a5a3a }); for (const y of [1.1, 1.6]) { g.cyl(0.03, 0.03, 4.4, 4, { m: M, at: [0, y, 0], rz: Math.PI / 2, c: 0x6a4a30 }); for (let i = 0; i < 9; i++) g.box(0.16, 0.34, 0.04, { m: M, at: [-1.9 + i * 0.47, y - 0.2, 0], c: i % 2 ? 0xc8a070 : 0xb08858 }); } }, RACK[0], RACK[1], { ry: 0.4, col: { w: 4.4, d: 0.5, h: 1.8, a: 0.4 } });
  // a net hung on poles to dry and mend
  W.place((g, M) => { for (const x of [-1.8, 1.8]) g.cyl(0.05, 0.06, 2.2, 5, { m: M, at: [x, 1.1, 0], c: 0x7a5a3a }); g.box(3.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: 0x8a7a5a, j: 0.1 }); for (let i = 0; i < 8; i++) g.box(0.03, 1.6, 0.04, { m: M, at: [-1.6 + i * 0.46, 1.2, 0], c: 0x5a4a30 }); for (let i = 0; i < 4; i++) g.box(3.6, 0.03, 0.04, { m: M, at: [0, 0.6 + i * 0.4, 0], c: 0x5a4a30 }); }, NET[0], NET[1], { ry: -0.3, col: { w: 3.8, d: 0.4, h: 2.2, a: -0.3 } });
  // the boat yard: a half-made reed boat on trestles, reed bundles
  W.place((g, M) => { for (const x of [-1.4, 1.4]) { g.box(0.12, 0.6, 1.2, { m: M, at: [x, 0.3, 0], c: 0x6a4a30 }); } g.cyl(0.42, 0.42, 4.4, 10, { m: M, at: [0, 0.95, 0], rz: Math.PI / 2, c: 0xa8a050, j: 0.08 }); for (const s of [-1, 1]) g.cyl(0.08, 0.42, 1.0, 8, { m: M, at: [s * 2.6, 1.15, 0], rz: s * (Math.PI / 2 - 0.4), c: 0x9a9048 }); for (let i = 0; i < 6; i++) g.cyl(0.43, 0.43, 0.06, 10, { m: M, at: [-1.8 + i * 0.72, 0.95, 0], rz: Math.PI / 2, c: 0x6a5a30 }); for (let k = 0; k < 4; k++) g.cyl(0.18, 0.18, 2, 6, { m: M, at: [-1.2 + k * 0.8, 0.18, 1.4], rz: Math.PI / 2, c: 0x9a9a50 }); }, YARD[0], YARD[1], { ry: 0.1, col: { w: 5.2, d: 1.4, h: 1.4, a: 0.1 } });
  for (const [x, z, ry] of [[BANK - 4, CZ + 10, 1.4], [BANK - 5, CZ - 2, 1.6]]) W.place((g, M) => { g.cyl(0.35, 0.35, 3.6, 10, { m: M, at: [0, 0.3, 0], rz: Math.PI / 2, c: 0xa8a050, j: 0.08 }); for (const s of [-1, 1]) g.cyl(0.06, 0.35, 0.8, 8, { m: M, at: [s * 2.1, 0.5, 0], rz: s * (Math.PI / 2 - 0.45), c: 0x9a9048 }); for (let i = 0; i < 5; i++) g.cyl(0.36, 0.36, 0.05, 10, { m: M, at: [-1.4 + i * 0.7, 0.3, 0], rz: Math.PI / 2, c: 0x6a5a30 }); }, x, z, { ry, col: { w: 4.2, d: 0.8, h: 0.8, a: ry } });
  for (let i = 0; i < 6; i++) put('reeds', BANK - 6 - (i % 2), CZ - 16 + i * 6);
  for (const [x, z] of [[CX - 12, CZ + 10], [CX + 12, CZ - 10], [CX + 10, CZ + 12]]) put('palm', x, z, { col: { r: 0.4, h: 3 } });
} catch (e) { console.error('fishing village', e); } };
// 발자취
addEventListener('DOMContentLoaded', () => { if (!(G.Trail && G.Trail.GROUPS)) return; const gr = G.Trail.GROUPS.find(x => x.t === '들과 하늘'); const it = [{ id: 'fvNet', n: '갈대 어촌 그물 깁기 세 번', h: '도성 남쪽 나일 강가의 갈대 어촌', v: s => s.flags.fvNetN || 0, max: 3, on: () => when() }, { id: 'fvBoat', n: '갈대배 함께 짓기', h: '갈대 어촌의 페피 · 갈대 다섯 다발', v: s => s.flags.fvBoat ? 1 : 0, max: 1, on: () => when() }]; if (gr) gr.list.push(...it); });
})(window.G);
