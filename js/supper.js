/* 약속의 길 — 아스낫과 함께하는 식사 장면 (v18.34)
   「함께 식사하기」를 고르면: 요셉의 집이 가까우면(45 m) 집 안 식탁에 마주 앉아 먹고, 멀면 그 자리에 작은 모닥불을 피워 곁에 앉아 먹어요.
   카메라가 두 사람을 비추는 동안 원래의 식탁 대화가 흘러가요. 끝나면 모닥불은 꺼져 사라지고 아스낫은 하던 일로 돌아가요. */
'use strict';
(function (G) {
const Game = G.Game, B = G.Bond, Ho = G.Homes, EPJ = G.EP && G.EP.joseph; if (!B || !B.meal || !Game || !EPJ) return;
const meal0 = B.meal;
/* v18.34 eating for real: sitting on the floor while the right hand brings bread to the mouth (or lifts the bowl to drink) — the floor-sitting
   pose plus the eating arms, as one pose (added from here so motion.js stays as it is) */
const MP = G.Motion && G.Motion.POSES;
if (MP && MP.sitg && MP.eat && MP.drink) {
  const mk2 = (k, sp) => { const f = (rig, p, t) => { MP.sitg(rig, p, t); const o = rig.mealO === undefined ? (rig.mealO = Math.random()) : rig.mealO; MP[k](rig, (t * sp + o) % 1, t); }; f.up = false; MP['sit_' + k] = f; };
  mk2('eat', 0.34); mk2('drink', 0.24); if (G.Motion.HOLD_IK_OFF) { G.Motion.HOLD_IK_OFF.add('sit_eat'); G.Motion.HOLD_IK_OFF.add('sit_drink'); } }
const MEAL = { on: false, t: 0, n: null };
let spreadMesh = null; const SM = G.m4(), HM = G.m4(), HM2 = G.m4();
const spreads = {}; function spread(cloth) { const key = cloth ? 'c' : 'n'; if (spreads[key]) return spreads[key]; const g = new G.GB(31);
  /* v18.34 laid along the table (1.4 × 0.7 m): a white linen cloth a little smaller than the top, and everything resting on it */
  const T = 0.012; g.box(1.16, T, 0.5, { at: [0, T / 2, 0], c: (x, y, z) => (Math.abs(z) > 0.215 || Math.abs(x) > 0.54 ? 0xd8c8a0 : 0xf2ece0), j: 0 });
  const on = T; /* everything sits on the cloth's top */
  const plate = (x, z, r, c) => g.cyl(r, r * 0.86, 0.018, 12, { at: [x, on + 0.009, z], c: c || 0xc89a6a });
  const bowl = (x, z, food) => { g.lathe([[0.03, 0], [0.085, 0.008], [0.1, 0.05], [0.105, 0.065]], 12, { at: [x, on, z], c: 0xb5673a }); g.cyl(0.092, 0.092, 0.008, 12, { at: [x, on + 0.056, z], c: food }); };
  /* bread: a stack of flat loaves on a board */
  g.box(0.26, 0.02, 0.18, { at: [-0.42, on + 0.01, -0.06], c: 0x8a6440 }); for (let i = 0; i < 3; i++) g.sph(0.07, 9, 5, { at: [-0.46 + i * 0.045, on + 0.035 + i * 0.022, -0.06], s: [1, 0.3, 1], c: i % 2 ? 0xd8a060 : 0xc8884a });
  /* a grilled Nile fish on a plate, with a lemon-less herb garnish */
  plate(-0.1, -0.1, 0.13); g.sph(1, 10, 6, { at: [-0.1, on + 0.045, -0.1], s: [0.11, 0.026, 0.035], c: (x) => (Math.floor((x + 1) * 40) % 2 ? 0xb07840 : 0x8a5a2a) }); g.box(0.008, 0.04, 0.04, { at: [0.02, on + 0.045, -0.1], rx: 0.785, c: 0x8a5a2a }); g.sph(0.018, 5, 4, { at: [-0.16, on + 0.04, -0.06], c: 0x5a8a3a });
  /* lentil stew and greens */
  bowl(0.17, -0.1, 0x8a4a22); bowl(0.38, -0.1, 0x6a8a3a);
  /* fruit: figs, a pomegranate, grapes, dates */
  plate(0.12, 0.12, 0.1, 0xb5673a); for (let i = 0; i < 4; i++) g.sph(0.026, 6, 5, { at: [0.08 + (i % 2) * 0.06, on + 0.04, 0.09 + Math.floor(i / 2) * 0.055], s: [1, 1.15, 1], c: 0x5a3050 }); g.sph(0.04, 8, 6, { at: [0.15, on + 0.06, 0.15], c: 0xa8302a });
  for (let i = 0; i < 9; i++) g.sph(0.017, 5, 4, { at: [0.33 + (i % 3) * 0.03, on + 0.02 + Math.floor(i / 3) * 0.022, 0.12 + (i % 2) * 0.015 - Math.floor(i / 3) * 0.006], c: 0x6a7a2a });
  for (let i = 0; i < 6; i++) g.sph(0.02, 5, 4, { at: [0.47 + (i % 2) * 0.035, on + 0.018, 0.06 + Math.floor(i / 2) * 0.04], s: [1, 0.7, 1.4], c: 0x5a2a18 });
  /* cheese, honey, onions */
  g.cyl(0.05, 0.05, 0.04, 10, { at: [-0.32, on + 0.02, 0.13], c: 0xf0e2b8 }); g.lathe([[0.02, 0], [0.045, 0.02], [0.04, 0.06], [0.025, 0.07]], 9, { at: [-0.18, on, 0.14], c: 0x8a5a2a }); g.cyl(0.026, 0.026, 0.006, 9, { at: [-0.18, on + 0.072, 0.14], c: 0xe0a030 });
  for (let i = 0; i < 2; i++) g.sph(0.026, 7, 5, { at: [-0.04 + i * 0.05, on + 0.024, 0.15], c: 0xe8d8b0 });
  /* a water jug and two cups */
  g.lathe([[0.03, 0], [0.07, 0.05], [0.075, 0.16], [0.04, 0.22], [0.045, 0.25]], 9, { at: [-0.5, on, 0.15], c: 0xc0784a });
  for (const [x, z] of [[-0.42, 0.21], [0.5, -0.19]]) g.lathe([[0.02, 0], [0.032, 0.01], [0.034, 0.06], [0.036, 0.065]], 9, { at: [x, on, z], c: 0xb87a4a });
  return (spreads[key] = G.R.mesh(g)); }
let spreadAt = null; /* [x, y, z, ry] */
const HOUSE = [10, -144];
let fireAt = null, fireMesh = null; const FM = G.m4();
function campfireMesh() { if (fireMesh) return fireMesh; const g = new G.GB(23); G.env.campfire(g, G.m4(), G.rng(7)); fireMesh = G.R.mesh(g); return fireMesh; }
const dyn0 = EPJ.dyn; EPJ.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments);
  if (spreadAt) { G.m4trs(SM, spreadAt[0], spreadAt[1], spreadAt[2], spreadAt[3], 0, 0, 1, 1, 1); list.push({ mesh: spread(true), m: SM, outline: true }); }
  if (MEAL.on) { const P = Game.P, n = MEAL.n, HB = G.HBI; /* bread or bowl in the eating hand */
    if (P.rig && P.rig.world && P.emote) list.push({ mesh: Game.propMesh(P.emote.k === 'sit_drink' ? 'bowl' : 'bread'), m: (HM.set(P.rig.world[HB.handR]), HM), outline: true });
    if (n && n.rig && n.rig.world && n.act && n.act.startsWith('sit_')) list.push({ mesh: Game.propMesh(n.act === 'sit_drink' ? 'bowl' : 'bread'), m: (HM2.set(n.rig.world[HB.handR]), HM2), outline: true }); }
  if (!fireAt) return; G.m4trs(FM, fireAt[0], fireAt[1], fireAt[2], 0, 0, 0, 1, 1, 1); list.push({ mesh: campfireMesh(), m: FM, outline: true }); };
const up0 = EPJ.update; let fxT = 0; EPJ.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined;
  if (MEAL.on) { MEAL.t += dt || 0.016; const P = Game.P, n = MEAL.n, a = Math.floor(MEAL.t / 4.5) % 3, b = Math.floor((MEAL.t + 2.2) / 4.5) % 3;
    const k1 = a === 2 ? 'sit_drink' : a === 1 ? 'sitg' : 'sit_eat', k2 = b === 2 ? 'sit_drink' : b === 0 ? 'sitg' : 'sit_eat';
    if (!P.emote || P.emote.k !== k1) P.emote = { k: k1, t: 0, dur: 0 }; if (n && n.act !== k2) n.act = k2;
    if (Math.random() < (dt || 0.016) * 0.25 && n && G.Life) G.Life.bubble(n.id, ['(빵을 뜯어 건넨다)', '맛있어요?', '(후후 불어 식힌다)', '아이들도 잘 먹네요.'][Math.floor(Math.random() * 4)], 2.2); } if (fireAt && (fxT -= (dt || 0.016)) <= 0) { fxT = 0.07; G.FX && G.FX.burst(fireAt[0], fireAt[1] + 0.15, fireAt[2], 2, { c: [1, 0.6 + Math.random() * 0.25, 0.18], sp: 0.25, up: 1.1, g: -0.6, life: 0.55, size: 0.22, a: 0.9, spread: 0.4, drag: 1 }); } return r; };
B.meal = function (n, done) { if (!n || n.id !== 'asenath') return meal0.apply(this, arguments);
  const S = Game.S(), P = Game.P, W = Game.W(), near = Math.hypot(P.x - HOUSE[0], P.z - HOUSE[1]) < 45 && Ho && Ho.room && !(Ho.inside && Ho.inside() && S.flags.inHouse && S.flags.inHouse.t !== 'mine');
  const save = { x: n.x, z: n.z, face: n.face }; let setup;
  if (near || (Ho && Ho.inside && Ho.inside() && S.flags.inHouse && S.flags.inHouse.t === 'mine')) {
    const v = Ho.allV().find(q => q.id === 'jhouse'), d = v && Ho.door(v, 0), R = Ho.room();
    setup = () => { if (!(S.flags.inHouse && S.flags.inHouse.t === 'mine')) S.flags.inHouse = { v: 'jhouse', i: 0, t: 'mine', x: d ? d.fx : P.x, z: d ? d.fz : P.z, f: d ? d.a : P.face + Math.PI, ow: null, L: Ho.layoutOf ? Ho.layoutOf(v, 0) : 'plain' };
      Game.teleport(R.x - 0.75, R.z + 0.5, Math.PI / 2); P.y = R.y; Game.npcTo('asenath', R.x + 1.35, R.z + 0.5, -Math.PI / 2, false); n.y = R.y; spreadAt = [R.x + 0.3, R.y + 0.7, R.z + 0.5, 0, 1]; Ho.mealSet = true; /* straight on the cleared table top */
      Game.cineCam = { x: R.x + 0.3, y: R.y + 1.9, z: R.z - 2.1, lx: R.x + 0.3, ly: R.y + 0.75, lz: R.z + 0.5, fov: 0.9 }; };
  } else {
    const a = P.face, fx = P.x + Math.sin(a) * 1.3, fz = P.z + Math.cos(a) * 1.3, fy = W.heightAt(fx, fz), ox = Math.cos(a), oz = -Math.sin(a);
    setup = () => { fireAt = [fx, fy, fz]; spreadAt = [fx + ox * 0.95, W.heightAt(fx + ox * 0.95, fz + oz * 0.95), fz + oz * 0.95, a + Math.PI / 2, 1]; /* a cloth on the ground beside the fire */ Game.npcTo('asenath', fx + Math.sin(a) * 1.2, fz + Math.cos(a) * 1.2, a + Math.PI, false); P.face = a;
      Game.cineCam = { x: fx + ox * 3.4, y: fy + 1.6, z: fz + oz * 3.4, lx: fx, ly: fy + 0.6, lz: fz, fov: 0.9 }; G.Audio && G.Audio.sfx('fire', { vol: 0.6 }); };
  }
  G.UI.fade(() => { setup(); P.emote = { k: 'sit_eat', t: 0, dur: 0 }; n.act = 'sit_eat'; n.sit = false; n.talking = true; Game.noDlgCam = true; Object.assign(MEAL, { on: true, t: 0, n, hand: S.hand }); S.hand = null; /* the staff is laid aside for the meal */ }, () => {
    if (fireAt) G.UI.toast('마른 가지를 모아 작은 모닥불을 피웠어요');
    /* the original meal (its words, rewards and bonds) plays while they sit; then everything is put back */
    meal0.call(B, n, () => { G.UI.fade(() => { MEAL.on = false; spreadAt = null; Ho.mealSet = false; /* the table as it was */ if (MEAL.hand && !S.hand) S.hand = MEAL.hand; P.emote = null; n.act = null; n.talking = false; Game.cineCam = null; Game.noDlgCam = false; if (fireAt) { fireAt = null; Game.npcTo('asenath', save.x, save.z, save.face, false); } }, () => { done && done(); }); });
  }); };
})(window.G);
