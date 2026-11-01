/* 약속의 길 — motion engine (v8)
   A layer on top of the procedural rig in models.js. It turns the C++ design notes (RDR2-style weight + BotW-style
   response) into the browser engine:
   1. Locomotion feel   — three tunings of acceleration / braking / turn rate (설정 → 움직임 느낌).
   2. Blend tree        — the locomotion pose (legs, pelvis) and the action pose (chest, arms, head) are computed
                          separately and merged with a lower-body mask, so you can walk while swinging, waving,
                          playing the pipe or carrying; full-body actions (pick up, kneel) still own the legs.
   3. Two-bone foot IK  — every frame the ground under each foot is sampled; the pelvis drops to the lower foot and the
                          other leg is solved analytically (law of cosines) so feet stand on slopes and steps.
   4. Gait styling      — men stand wide with arms off the lats, women walk with hip sway on a narrow line, elders
                          stoop and shorten their stride; braking skid, turn-in-place shuffle, uphill lean.
   5. Pose library      — combo attacks, real pick-up / gather / plant motions, rests (sit, hug knees, lie down,
                          kneel, squat), worship (pray, prostrate, raise hands), social emotes, idle fidgets and
                          conversation gestures.
   6. Animal gaits      — four-beat walk, diagonal trot, transverse gallop and bound, with leg lift, head nod,
                          spine pitch, tail motion, idle look-around and spring-blended state changes.
   8. Acting (v16.8)    — cutscene emotions on the body and face (posture by emotion, Laban timing, FACS-style eyes/mouth),
                          sling whirl + kinetic-chain release, slope-aware gait. */
'use strict';
(function (G) {
const { clamp, lerp, angDiff, HBI: B, AB, locoPose, clothSim, faceAnim } = G;
const baseAct = G.actPose, baseAnimal = G.animAnimal;
const PI = Math.PI, TAU = PI * 2;
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const E = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const ph01 = (p, a, b) => E((p - a) / (b - a)); // eased 0..1 between a and b
const bell = p => Math.sin(clamp(p, 0, 1) * PI);
const hashf = x => { const s = Math.sin(x * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const M = G.Motion = {};

// =================================================================== 1. LOCOMOTION FEEL
/* acc/dec: velocity response (1/s), turn: facing response (1/s), air: air control, brake: brake-pose strength.
   heavy ≈ RDR2 (momentum, skid to a stop, wide turning arcs) · snappy ≈ BotW (instant pivot) */
M.FEEL = {
  heavy: { acc: 9.5, dec: 11, turn: 7.5, air: 4.5, brake: 1.3, n: '묵직하게' },
  bal: { acc: 22, dec: 30, turn: 14, air: 8, brake: 1, n: '균형' }, // v10: stops in ≈0.35 s instead of sliding 0.9 m
  snappy: { acc: 42, dec: 48, turn: 24, air: 12, brake: 0.5, n: '경쾌하게' },
  wild: { acc: 30, dec: 26, turn: 19, air: 10, brake: 0.85, n: '자유롭게' } }; // v16.7 default: quick to start, a short skid on hard stops, crisp turns
M.feel = () => M.FEEL[(G.Game && G.Game.SET && G.Game.SET.feel) || 'wild'] || M.FEEL.wild;

// body info from a look (sex / build / age), cached on the rig
M.bodyOf = function (look) {
  look = look || {}; const fem = look.fem !== undefined ? !!look.fem : look.headwear === 'veil';
  const old = look.age === 'old' || (look.hair !== undefined && ((look.hair >> 16) & 255) > 0xb0 && ((look.hair >> 8) & 255) > 0xa8);
  return { fem, kid: !!look.kid, old, mus: look.kid || fem ? 0 : (look.build === undefined ? (old ? 0.55 : 1) : look.build) };
};

// =================================================================== helpers
const add = (rig, b, x, y, z, w) => { const o = b * 3; rig.rot[o] += (x || 0) * w; rig.rot[o + 1] += (y || 0) * w; rig.rot[o + 2] += (z || 0) * w; };
const set = (rig, b, x, y, z) => rig.set(b, x, y || 0, z || 0);
const LOWER = [B.pelvis, B.thighL, B.shinL, B.thighR, B.shinR];
const SAVE = new Float32Array(LOWER.length * 3), SOFF = [0, 0, 0];

// =================================================================== 2. POSE LIBRARY
/* Each entry: fn(rig, p, t, st, k) — p = normalised progress of the action (0..1, loops for repeating work), t = time.
   up: true → upper-body layer (legs keep walking when the character moves). */
const P = M.POSES = {};
const pose = (name, up, fn) => { P[name] = fn; fn.up = !!up; };

// ---- melee: three-hit combos. Anticipation → fast strike (contact ≈ 0.42) → follow-through → recover
pose('swing', true, (rig, p) => { // forehand diagonal cut, hips lead the shoulders
  const w = ph01(p, 0, 0.3), h = ph01(p, 0.3, 0.44), k = 1 - ph01(p, 0.7, 1);
  const tw = (0.62 * w - 1.25 * h) * k;
  set(rig, B.pelvis, 0, (0.22 * w - 0.4 * h) * k, 0);
  set(rig, B.chest, (0.04 + 0.22 * h) * k, tw - (0.22 * w - 0.4 * h) * k * 0.3, -0.1 * w * k);
  set(rig, B.uArmR, (-0.25 - 2.25 * w + 1.95 * h) * k, 0, (0.15 + 0.55 * w - 0.7 * h) * k); set(rig, B.fArmR, (-0.35 - 0.85 * w + 0.85 * h) * k);
  set(rig, B.uArmL, (-0.35 - 0.3 * w + 0.2 * h) * k, 0, -0.35 * k); set(rig, B.fArmL, -0.8 * k);
  set(rig, B.thighL, -0.42 * h * k, 0, 0.06); set(rig, B.shinL, 0.25 * h * k); set(rig, B.thighR, 0.28 * h * k, 0, -0.06); set(rig, B.shinR, 0.3 * h * k);
  set(rig, B.head, 0.05 * h, -tw * 0.6, 0); rig.off[1] = -0.06 * h * k + 0.015 * w * (1 - h);
});
pose('swing2', true, (rig, p) => { // backhand return cut, right to left
  const w = ph01(p, 0, 0.26), h = ph01(p, 0.26, 0.42), k = 1 - ph01(p, 0.7, 1);
  const tw = (-0.75 * w + 1.15 * h) * k;
  set(rig, B.pelvis, 0, (-0.25 * w + 0.35 * h) * k, 0);
  set(rig, B.chest, (0.12 + 0.12 * h) * k, tw, 0.08 * w * k);
  set(rig, B.uArmR, (-1.25 - 0.2 * w + 0.15 * h) * k, 0, (-0.75 * w + 1.35 * h) * k); set(rig, B.fArmR, (-1.5 * w + 1.2 * h - 0.2) * k);
  set(rig, B.uArmL, -0.5 * k, 0, -0.45 * k); set(rig, B.fArmL, -0.9 * k);
  set(rig, B.thighR, -0.35 * h * k, 0, -0.05); set(rig, B.shinR, 0.25 * h * k); set(rig, B.thighL, 0.22 * h * k, 0, 0.05); set(rig, B.shinL, 0.3 * h * k);
  set(rig, B.head, 0.05, -tw * 0.6, 0); rig.off[1] = -0.05 * h * k;
});
pose('swing3', true, (rig, p) => { // finisher: two-handed overhead slam with a hop
  const w = ph01(p, 0, 0.38), h = ph01(p, 0.38, 0.5), k = 1 - ph01(p, 0.72, 1);
  set(rig, B.chest, (-0.25 * w + 0.75 * h) * k, 0.1 * w * k, 0);
  const ua = (-0.3 - 2.55 * w + 2.05 * h) * k;
  set(rig, B.uArmR, ua, 0, (0.2 - 0.25 * w) * k); set(rig, B.fArmR, (-0.4 - 0.6 * w + 0.7 * h) * k);
  set(rig, B.uArmL, ua, 0, (-0.2 + 0.25 * w) * k); set(rig, B.fArmL, (-0.4 - 0.6 * w + 0.7 * h) * k);
  set(rig, B.thighL, (-0.15 * w - 0.75 * h) * k, 0, 0.08); set(rig, B.shinL, (0.25 * w + 0.7 * h) * k); set(rig, B.thighR, (0.1 * w + 0.45 * h) * k, 0, -0.08); set(rig, B.shinR, (0.3 * w + 0.6 * h) * k);
  set(rig, B.head, (-0.15 * w + 0.2 * h) * k); rig.off[1] = (0.05 * w * (1 - h) - 0.2 * h) * k;
});
pose('thrust', true, (rig, p) => { // chambered two-handed spear thrust, front foot steps in
  const w = ph01(p, 0, 0.3), h = ph01(p, 0.3, 0.44), k = 1 - ph01(p, 0.68, 1);
  set(rig, B.pelvis, 0, (0.3 * w - 0.35 * h) * k, 0);
  set(rig, B.chest, (0.05 + 0.3 * h) * k, (0.45 * w - 0.55 * h) * k, 0);
  set(rig, B.uArmR, (-0.85 - 0.35 * w - 0.45 * h) * k, 0, (0.3 - 0.35 * h) * k); set(rig, B.fArmR, (-1.5 * w + 1.4 * h - 0.1) * k);
  set(rig, B.uArmL, (-1.05 - 0.4 * h) * k, 0, -0.15 * k); set(rig, B.fArmL, (-0.95 + 0.6 * h) * k);
  set(rig, B.thighL, -0.6 * h * k, 0, 0.06); set(rig, B.shinL, 0.35 * h * k); set(rig, B.thighR, 0.42 * h * k, 0, -0.06); set(rig, B.shinR, 0.35 * h * k);
  set(rig, B.head, 0, -(0.45 * w - 0.55 * h) * k * 0.8, 0); rig.off[1] = -0.08 * h * k;
});
pose('thrust2', true, (rig, p) => { // quick low jab from the hip
  const w = ph01(p, 0, 0.22), h = ph01(p, 0.22, 0.38), k = 1 - ph01(p, 0.62, 1);
  set(rig, B.chest, (0.2 + 0.2 * h) * k, (0.3 * w - 0.4 * h) * k, 0);
  set(rig, B.uArmR, (-0.3 - 0.9 * h) * k, 0, (0.35 - 0.25 * h) * k); set(rig, B.fArmR, (-1.6 * w + 1.3 * h - 0.2) * k);
  set(rig, B.uArmL, -0.7 * k, 0, -0.35 * k); set(rig, B.fArmL, -1.2 * k);
  set(rig, B.thighL, -0.5 * k, 0, 0.1); set(rig, B.shinL, 0.55 * k); set(rig, B.thighR, 0.3 * k, 0, -0.1); set(rig, B.shinR, 0.5 * k); rig.off[1] = -0.12 * k;
});
pose('thrust3', true, (rig, p) => { // long lunge: everything behind the point
  const w = ph01(p, 0, 0.36), h = ph01(p, 0.36, 0.5), k = 1 - ph01(p, 0.72, 1);
  set(rig, B.pelvis, 0.15 * h * k, (0.35 * w - 0.3 * h) * k, 0);
  set(rig, B.chest, (-0.1 * w + 0.4 * h) * k, (0.55 * w - 0.6 * h) * k, 0);
  set(rig, B.uArmR, (-0.7 - 0.5 * w - 0.75 * h) * k, 0, 0.25 * k); set(rig, B.fArmR, (-1.7 * w + 1.65 * h - 0.05) * k);
  set(rig, B.uArmL, (-1.0 - 0.6 * h) * k, 0, -0.1 * k); set(rig, B.fArmL, (-0.9 + 0.75 * h) * k);
  set(rig, B.thighL, (0.1 * w - 1.0 * h) * k, 0, 0.06); set(rig, B.shinL, (0.2 * w + 0.75 * h) * k); set(rig, B.thighR, 0.6 * h * k, 0, -0.06); set(rig, B.shinR, 0.2 * h * k);
  set(rig, B.head, -0.1 * h * k, -(0.55 * w - 0.6 * h) * k * 0.8, 0); rig.off[1] = (-0.04 * w - 0.2 * h) * k;
});

// ---- work: pick up (one knee down, reach, bring to the chest), gather (squat, both hands), harvest (hinge + sickle), plant
pose('pick', false, (rig, p, t, st) => {
  const loop = st && st.npcLoop, d = loop ? 1 : ph01(p, 0, 0.34), r = loop ? 0 : ph01(p, 0.66, 1), k = d * (1 - r * 0.92), grab = sst(0.34, 0.5, p) * (1 - r);
  set(rig, B.thighL, -1.4 * k, 0, 0.12 * k); set(rig, B.shinL, 2.0 * k); set(rig, B.thighR, 0.05 * k, 0, -0.08 * k); set(rig, B.shinR, 1.62 * k);
  rig.off[1] = -0.42 * k; set(rig, B.pelvis, 0.1 * k, 0.15 * k, 0);
  set(rig, B.chest, 0.55 * k, -0.12 * k, 0); set(rig, B.head, 0.38 * k - 0.15 * r);
  set(rig, B.uArmR, -0.95 * k - 0.15 * grab - 0.55 * r * (1 - sst(0.9, 1, p)), 0, 0.12); set(rig, B.fArmR, -0.15 * k - 1.5 * r * (1 - sst(0.9, 1, p)));
  set(rig, B.uArmL, -0.35 * k, 0, 0.05); set(rig, B.fArmL, -0.75 * k);
});
pose('gather', false, (rig, p, t, st) => {
  const k = st && st.npcLoop ? 1 : sst(0, 0.25, p) * (1 - sst(0.82, 1, p)), sc = Math.sin(p * PI * 4);
  set(rig, B.thighL, -1.45 * k, 0, 0.28 * k); set(rig, B.thighR, -1.45 * k, 0, -0.28 * k); set(rig, B.shinL, 2.15 * k); set(rig, B.shinR, 2.15 * k);
  rig.off[1] = -0.47 * k; set(rig, B.pelvis, 0.15 * k); set(rig, B.chest, 0.42 * k + 0.05 * sc * k); set(rig, B.head, 0.3 * k);
  set(rig, B.uArmL, (-0.75 + 0.22 * sc) * k, 0, -0.12 * k); set(rig, B.uArmR, (-0.75 - 0.22 * sc) * k, 0, 0.12 * k); set(rig, B.fArmL, -0.45 * k); set(rig, B.fArmR, -0.45 * k);
});
pose('harvest', false, (rig, p, t, st) => {
  const k = st && st.npcLoop ? 1 : sst(0, 0.2, p) * (1 - sst(0.85, 1, p)), sw = Math.sin(p * TAU);
  set(rig, B.thighL, -0.5 * k, 0, 0.08); set(rig, B.shinL, 0.65 * k); set(rig, B.thighR, -0.15 * k, 0, -0.08); set(rig, B.shinR, 0.6 * k); rig.off[1] = -0.13 * k;
  set(rig, B.chest, 0.7 * k, 0.2 * sw * k, 0); set(rig, B.head, 0.2 * k);
  set(rig, B.uArmR, -1.15 * k, 0, (0.15 + 0.45 * sw) * k); set(rig, B.fArmR, -0.35 * k); set(rig, B.uArmL, -1.2 * k, 0, -0.1 * k); set(rig, B.fArmL, -0.6 * k);
});
pose('plant', false, (rig, p, t, st) => {
  const k = st && st.npcLoop ? 1 : sst(0, 0.25, p) * (1 - sst(0.85, 1, p)), poke = Math.pow(Math.abs(Math.sin(p * PI * 3)), 3);
  set(rig, B.thighL, -1.4 * k, 0, 0.12 * k); set(rig, B.shinL, 2.0 * k); set(rig, B.thighR, 0.05 * k, 0, -0.08 * k); set(rig, B.shinR, 1.62 * k); rig.off[1] = -0.42 * k;
  set(rig, B.chest, 0.65 * k); set(rig, B.head, 0.35 * k);
  set(rig, B.uArmR, (-0.85 + 0.2 * poke) * k, 0, 0.1); set(rig, B.fArmR, (-0.2 - 0.3 * poke) * k); set(rig, B.uArmL, -0.5 * k, 0, 0.05); set(rig, B.fArmL, -0.9 * k);
});
pose('eat', true, (rig, p, t) => { // bring food to the mouth twice and chew
  const k = sst(0, 0.15, p) * (1 - sst(0.85, 1, p)), bite = Math.max(0, Math.sin(p * PI * 4 - 0.6));
  set(rig, B.uArmR, (-0.85 - 0.35 * bite) * k, 0, 0.3 * k); set(rig, B.fArmR, (-1.6 - 0.65 * bite) * k); set(rig, B.uArmL, -0.4 * k, 0, -0.15 * k); set(rig, B.fArmL, -1.1 * k);
  set(rig, B.head, (0.12 - 0.08 * bite) * k); rig.faceM = 0.2 + 0.4 * Math.abs(Math.sin(t * 9)) * k;
});
pose('drink', true, (rig, p) => {
  const k = sst(0, 0.2, p) * (1 - sst(0.82, 1, p));
  set(rig, B.uArmR, -1.25 * k, 0, 0.35 * k); set(rig, B.fArmR, -2.15 * k); set(rig, B.head, -0.4 * k); set(rig, B.chest, -0.08 * k);
});

// ---- rest (hold poses; the inertia spring eases in and out)
pose('sitg', false, (rig, p, t) => { // cross-legged on the ground
  rig.off[1] = -0.74; set(rig, B.thighL, -1.45, 0, 0.55); set(rig, B.thighR, -1.45, 0, -0.55); set(rig, B.shinL, 2.5); set(rig, B.shinR, 2.5);
  set(rig, B.chest, 0.1 + Math.sin(t * 1.6) * 0.02); set(rig, B.uArmL, -0.55, 0, 0.12); set(rig, B.uArmR, -0.55, 0, -0.12); set(rig, B.fArmL, -0.55); set(rig, B.fArmR, -0.55);
  set(rig, B.head, 0.05, Math.sin(t * 0.23) * 0.3, 0);
});
pose('sitHug', false, (rig, p, t) => { // knees up, arms around them
  const rock = Math.sin(t * 0.9) * 0.03;
  rig.off[1] = -0.76; set(rig, B.thighL, -1.95, 0, 0.12); set(rig, B.thighR, -1.95, 0, -0.12); set(rig, B.shinL, 2.45); set(rig, B.shinR, 2.45);
  set(rig, B.pelvis, -0.2 + rock); set(rig, B.chest, 0.45); set(rig, B.head, 0.05, Math.sin(t * 0.3) * 0.25, 0);
  set(rig, B.uArmL, -1.05, 0, -0.32); set(rig, B.uArmR, -1.05, 0, 0.32); set(rig, B.fArmL, -1.15, 0.3); set(rig, B.fArmR, -1.15, -0.3);
});
pose('lie', false, (rig, p, t) => { // v13: on the back, hands behind the head, legs out straight with the ankles crossed (no knee in the air)
  rig.off[1] = -0.74; set(rig, B.pelvis, -PI / 2 + 0.04); set(rig, B.chest, -0.05 + Math.sin(t * 1.3) * 0.015); set(rig, B.head, -0.25, Math.sin(t * 0.2) * 0.2, 0);
  set(rig, B.uArmL, -2.75, 0, 0.55); set(rig, B.uArmR, -2.75, 0, -0.55); set(rig, B.fArmL, -2.3); set(rig, B.fArmR, -2.3);
  set(rig, B.thighL, -0.06, 0, -0.04); set(rig, B.shinL, 0.06); set(rig, B.thighR, -0.04, 0, 0.05); set(rig, B.shinR, 0.04);
});
pose('kneelRest', false, (rig, p, t) => { // sitting back on the heels, hands on the thighs
  rig.off[1] = -0.66; set(rig, B.thighL, -1.42, 0, 0.1); set(rig, B.thighR, -1.42, 0, -0.1); set(rig, B.shinL, 2.85); set(rig, B.shinR, 2.85);
  set(rig, B.chest, 0.05 + Math.sin(t * 1.5) * 0.015); set(rig, B.uArmL, -0.55, 0, 0.05); set(rig, B.uArmR, -0.55, 0, -0.05); set(rig, B.fArmL, -0.75); set(rig, B.fArmR, -0.75);
});
pose('climb', false, (rig, p, t) => { // facing the wall: hands reach overhead in turn, knees come up to find footholds
  const a = Math.sin(p * PI * 2), ra = Math.max(0, a), la = Math.max(0, -a);
  set(rig, B.uArmL, -2.55 - 0.4 * la + 0.25 * ra, 0, 0.28); set(rig, B.fArmL, -0.35 - 0.6 * ra); set(rig, B.uArmR, -2.55 - 0.4 * ra + 0.25 * la, 0, -0.28); set(rig, B.fArmR, -0.35 - 0.6 * la);
  set(rig, B.thighL, -0.75 - 0.5 * ra, 0, 0.14); set(rig, B.shinL, 1.0 + 0.5 * ra); set(rig, B.thighR, -0.75 - 0.5 * la, 0, -0.14); set(rig, B.shinR, 1.0 + 0.5 * la);
  set(rig, B.pelvis, 0.12); set(rig, B.chest, -0.06, 0.08 * a, 0); set(rig, B.head, -0.42, 0, 0); rig.off[1] = -0.12; rig.off[2] = -0.04;
});
pose('squat', false, (rig, p, t) => { // v12: one knee down, forearm resting on the raised knee (no more deep frog squat)
  rig.off[1] = -0.46; set(rig, B.pelvis, 0.05); set(rig, B.thighL, -1.42, 0, 0.12); set(rig, B.shinL, 1.42); set(rig, B.thighR, -0.08, 0, -0.06); set(rig, B.shinR, 1.5);
  set(rig, B.chest, 0.28); set(rig, B.head, -0.08, Math.sin(t * 0.3) * 0.3, 0);
  set(rig, B.uArmL, -0.75, 0, -0.05); set(rig, B.fArmL, -0.5); set(rig, B.uArmR, -0.35, 0, 0.18); set(rig, B.fArmR, -0.6);
});
pose('crossArms', true, (rig, p, t) => { // stand with arms folded, weight on one leg
  set(rig, B.uArmL, -0.5, 0, -0.42); set(rig, B.uArmR, -0.55, 0, 0.42); set(rig, B.fArmL, -1.95, 0.15); set(rig, B.fArmR, -1.95, -0.15);
  add(rig, B.pelvis, 0, 0, 0.06, 1); set(rig, B.thighL, -0.06, 0, 0.06); set(rig, B.shinL, 0.18); set(rig, B.head, 0.02, Math.sin(t * 0.25) * 0.25, -0.05);
});
pose('warmHands', false, (rig, p, t) => { // v12: down on one knee by the fire (modest and steady instead of a deep squat), rubbing the hands
  const rub = Math.sin(t * 9) * 0.12;
  rig.off[1] = -0.46; set(rig, B.pelvis, 0.05); set(rig, B.thighL, -1.42, 0, 0.12); set(rig, B.shinL, 1.42); set(rig, B.thighR, -0.08, 0, -0.06); set(rig, B.shinR, 1.5);
  set(rig, B.chest, 0.3); set(rig, B.head, 0.1);
  set(rig, B.uArmL, -1.1, 0, -0.3 + rub); set(rig, B.uArmR, -1.1, 0, 0.3 + rub); set(rig, B.fArmL, -0.7); set(rig, B.fArmR, -0.7);
});

// ---- worship
pose('prostrate', false, (rig, p, t) => { // 엎드려 절하기: kneel, then the face to the ground
  const k = ph01(p, 0.05, 0.4) * (1 - ph01(p, 0.8, 1));
  rig.off[1] = -0.55; set(rig, B.thighL, -0.35 - 0.6 * k, 0, 0.08); set(rig, B.thighR, -0.35 - 0.6 * k, 0, -0.08); set(rig, B.shinL, 1.7 + 0.6 * k); set(rig, B.shinR, 1.7 + 0.6 * k);
  set(rig, B.pelvis, 0.15 + 0.55 * k); set(rig, B.chest, 0.2 + 0.85 * k); set(rig, B.head, 0.1 + 0.25 * k);
  set(rig, B.uArmL, -0.6 - 1.9 * k, 0, -0.15); set(rig, B.uArmR, -0.6 - 1.9 * k, 0, 0.15); set(rig, B.fArmL, -0.3); set(rig, B.fArmR, -0.3);
  rig.off[1] -= 0.12 * k;
});
pose('raiseHands', true, (rig, p, t) => { // 두 손 들고 찬양
  const sw = Math.sin(t * 1.6);
  set(rig, B.uArmL, -2.65, 0, -0.42 + sw * 0.06); set(rig, B.uArmR, -2.65, 0, 0.42 + sw * 0.06); set(rig, B.fArmL, -0.25); set(rig, B.fArmR, -0.25);
  set(rig, B.chest, -0.12, 0, sw * 0.05); set(rig, B.head, -0.38, 0, sw * 0.04); rig.faceE = 1;
});

// ---- social
pose('wave', true, (rig, p, t) => { const w = Math.sin(t * 11);
  set(rig, B.uArmR, -2.55, 0, 0.35 + w * 0.12); set(rig, B.fArmR, -0.45 + w * 0.35); add(rig, B.chest, 0, -0.1, -0.06, 1); set(rig, B.head, -0.05, 0, 0.06); rig.faceM = 0.45; });
pose('clap', true, (rig, p, t) => { const c = Math.abs(Math.sin(t * 9.4));
  set(rig, B.uArmL, -0.95, 0, -0.38 - 0.2 * c); set(rig, B.uArmR, -0.95, 0, 0.38 + 0.2 * c); set(rig, B.fArmL, -1.25, 0.25); set(rig, B.fArmR, -1.25, -0.25);
  rig.off[1] = -Math.abs(Math.sin(t * 4.7)) * 0.02; rig.faceM = 0.5; });
pose('point', true, (rig, p, t) => { const k = sst(0, 0.15, p) * (1 - sst(0.85, 1, p));
  set(rig, B.uArmR, -1.55 * k, -0.1, 0.05); set(rig, B.fArmR, -0.05 * k); add(rig, B.chest, 0, -0.15 * k, 0, 1); set(rig, B.head, -0.05 * k, 0.1 * k, 0); });
pose('think', true, (rig, p, t) => { // hand on the chin
  set(rig, B.uArmR, -0.55, 0, 0.4); set(rig, B.fArmR, -2.35, -0.35); set(rig, B.uArmL, -0.35, 0, -0.42); set(rig, B.fArmL, -1.75, 0.2);
  set(rig, B.head, 0.12 + Math.sin(t * 0.7) * 0.03, 0.12, 0.1); set(rig, B.chest, 0.06); });
pose('laugh', true, (rig, p, t) => { const h = Math.abs(Math.sin(t * 7)) * (1 - sst(0.8, 1, p));
  set(rig, B.chest, -0.15 - 0.08 * h); set(rig, B.head, -0.25 - 0.1 * h); set(rig, B.uArmL, -0.35, 0, -0.35); set(rig, B.uArmR, -0.35, 0, 0.35); set(rig, B.fArmL, -1.6); set(rig, B.fArmR, -1.6);
  rig.off[1] = -0.02 * h; rig.faceM = 0.55 + 0.35 * h; rig.faceE = 0.6; });
pose('weep', false, (rig, p, t) => { // 야곱이 소리 높여 울며 — face in the hands, shoulders shaking
  const sob = Math.sin(t * 6.5) * 0.04 * (0.6 + 0.4 * Math.sin(t * 1.3));
  set(rig, B.chest, 0.4 + sob); set(rig, B.head, 0.4); set(rig, B.uArmL, -1.0, 0, -0.38 + sob); set(rig, B.uArmR, -1.0, 0, 0.38 - sob); set(rig, B.fArmL, -2.25); set(rig, B.fArmR, -2.25);
  set(rig, B.thighL, -0.12); set(rig, B.shinL, 0.25); set(rig, B.thighR, -0.12); set(rig, B.shinR, 0.25); rig.off[1] = -0.04; rig.faceE = 0.15; });
pose('stretch', false, (rig, p, t) => { // 기지개 + yawn
  const u = ph01(p, 0, 0.35) * (1 - ph01(p, 0.7, 1)), o = ph01(p, 0.35, 0.55) * (1 - ph01(p, 0.7, 1));
  set(rig, B.uArmL, -2.9 * u + 0.6 * o, 0, -0.25 * u + 0.9 * o); set(rig, B.uArmR, -2.9 * u + 0.6 * o, 0, 0.25 * u - 0.9 * o); set(rig, B.fArmL, -0.2 * u); set(rig, B.fArmR, -0.2 * u);
  set(rig, B.chest, -0.22 * u); set(rig, B.head, -0.3 * u); rig.off[1] = 0.03 * u; rig.faceM = 0.16 + 0.75 * u; rig.faceE = 1 - 0.85 * u; });
pose('flute', true, (rig, p, t) => { // 갈대 피리: both hands at the lips, fingers rising and falling, body sways with the tune
  const sw = Math.sin(t * 1.9);
  set(rig, B.uArmL, -1.05, 0, -0.42); set(rig, B.fArmL, -1.95, 0.35); set(rig, B.uArmR, -1.2, 0, 0.32); set(rig, B.fArmR, -1.85, -0.3);
  set(rig, B.head, 0.12 + sw * 0.04, sw * 0.06, sw * 0.05); add(rig, B.chest, 0.05, 0, sw * 0.04, 1); rig.faceM = 0.12; });
pose('pet', false, (rig, p, t) => { // crouch and stroke an animal
  const k = sst(0, 0.2, p) * (1 - sst(0.85, 1, p)), st2 = Math.sin(t * 5);
  rig.off[1] = -0.3 * k; set(rig, B.thighL, -0.95 * k, 0, 0.15); set(rig, B.shinL, 1.35 * k); set(rig, B.thighR, -0.55 * k, 0, -0.15); set(rig, B.shinR, 1.15 * k);
  set(rig, B.chest, 0.5 * k); set(rig, B.head, 0.3 * k); set(rig, B.uArmR, (-1.0 + 0.15 * st2) * k, 0, 0.1); set(rig, B.fArmR, -0.35 * k); set(rig, B.uArmL, -0.4 * k, 0, -0.1); set(rig, B.fArmL, -0.8 * k);
  rig.faceM = 0.3; });
pose('dance2', false, (rig, p, t) => { // circle dance: clap high, step-hop
  const b = Math.sin(t * 6.2), c = Math.abs(Math.sin(t * 6.2));
  set(rig, B.uArmL, -2.3, 0, -0.3 - 0.15 * c); set(rig, B.uArmR, -2.3, 0, 0.3 + 0.15 * c); set(rig, B.fArmL, -0.7, 0.3); set(rig, B.fArmR, -0.7, -0.3);
  set(rig, B.thighL, Math.max(0, b) * -0.7); set(rig, B.shinL, Math.max(0, b) * 1.1); set(rig, B.thighR, Math.max(0, -b) * -0.7); set(rig, B.shinR, Math.max(0, -b) * 1.1);
  set(rig, B.pelvis, 0, b * 0.2, 0); set(rig, B.chest, -0.05, -b * 0.15, 0); rig.off[1] = c * 0.07; rig.faceM = 0.5; });

// ---- sling (v16.8, 프롬프트 5·6장). Holding 「쏘기」: the HORIZONTAL WHIRL over the head (the standard ancient technique),
// feet set about 30° off the target like an archer, the free hand points at it. Loosing: the throwing KINETIC CHAIN —
// stride with the lead (left) leg, then pelvis → chest → upper arm → forearm → hand, each peaking a little after the one
// before (pelvis ≈ 0.42, chest 0.47, upper arm 0.52, forearm/hand 0.55 = the stone leaves), a forward trunk bend in the
// acceleration, and a follow-through across the body with the back leg coming through.
pose('sling', true, (rig, p, t, st) => {
  const hold = st.hero && G.Sling && G.Sling.on;
  if (hold) { const w = t * 16.3, c = Math.cos(w), sn = Math.sin(w);
    set(rig, B.pelvis, 0, 0.38, 0); set(rig, B.chest, -0.06, 0.18 + sn * 0.04, 0.04); set(rig, B.head, 0.04, -0.52, 0);
    set(rig, B.uArmR, -2.72 + c * 0.1, sn * 0.38, 0.28 + c * 0.14); set(rig, B.fArmR, -0.32 + sn * 0.16, 0, 0);
    set(rig, B.uArmL, -1.32, 0.35, -0.05); set(rig, B.fArmL, -0.12, 0, 0);
    set(rig, B.thighL, -0.24, -0.35, 0.06); set(rig, B.shinL, 0.16); set(rig, B.thighR, 0.16, -0.35, -0.06); set(rig, B.shinR, 0.2); rig.off[1] = -0.03; return; }
  const ch = (c, wdt) => E((p - c + wdt) / (2 * wdt)); // 0 → 1 around its peak time c
  const back = 1 - ph01(p, 0.8, 1), stride = ph01(p, 0.12, 0.38), pel = ch(0.42, 0.09), cst = ch(0.47, 0.09), ua = ch(0.52, 0.08), fa = ch(0.55, 0.05), ft = ph01(p, 0.56, 0.78);
  set(rig, B.pelvis, 0.05 * cst * back, (0.38 - 0.66 * pel) * back, 0);
  set(rig, B.chest, (-0.12 + 0.36 * cst + 0.1 * ft) * back, (0.55 - 1.05 * cst) * back, (0.08 - 0.16 * cst) * back);
  set(rig, B.head, (0.04 - 0.15 * cst) * back, (-0.5 + 0.85 * cst) * back, 0);
  // the arm: cocked high behind the head (shoulder external rotation), then whips forward and down past the hip
  set(rig, B.uArmR, (-2.75 + 1.55 * ua + 0.85 * ft) * back, (0.4 - 0.4 * ua) * back, (0.3 - 0.55 * ft) * back);
  set(rig, B.fArmR, (-0.95 + 0.9 * fa - 0.25 * ft) * back, 0, 0);
  set(rig, B.uArmL, (-1.3 + 0.9 * cst) * back, (0.35 - 0.35 * cst) * back, (-0.05 - 0.3 * cst) * back); set(rig, B.fArmL, (-0.15 - 0.9 * cst) * back, 0, 0);
  set(rig, B.thighL, (-0.12 - 0.3 * stride + 0.1 * ft) * back, -0.3 * (1 - pel) * back, 0.05); set(rig, B.shinL, (0.15 + 0.18 * stride) * back);
  set(rig, B.thighR, (0.12 + 0.22 * stride - 0.5 * ft) * back, -0.3 * (1 - pel) * back, -0.05); set(rig, B.shinR, (0.2 + 0.5 * ft) * back);
  rig.off[1] = (-0.03 - 0.05 * stride * (1 - ft)) * back; rig.off[2] = 0.06 * cst * back; });

// =================================================================== 3. IDLE FIDGETS & CONVERSATION
/* additive overlays faded by a bell envelope, so they mix with breathing and weight shifts */
const FID = {
  lookAround: (r, e, q) => { add(r, B.head, -0.05, Math.sin(q * TAU) * 0.75, 0, e); add(r, B.chest, 0, Math.sin(q * TAU) * 0.15, 0, e); },
  shadeEyes: (r, e) => { add(r, B.uArmR, -2.1, 0, 0.35, e); add(r, B.fArmR, -1.35, 0, 0, e); add(r, B.head, -0.18, 0.25, 0, e); },
  scratchHead: (r, e, q, t) => { add(r, B.uArmR, -2.35, 0, 0.5, e); add(r, B.fArmR, -1.9 + Math.sin(t * 14) * 0.12, 0, 0, e); add(r, B.head, 0.1, 0, -0.12, e); },
  rollShoulders: (r, e, q) => { add(r, B.chest, -0.06, 0, Math.sin(q * TAU * 2) * 0.08, e); add(r, B.uArmL, Math.sin(q * TAU * 2) * 0.15, 0, 0.1, e); add(r, B.uArmR, -Math.sin(q * TAU * 2) * 0.15, 0, -0.1, e); add(r, B.head, 0.1, 0, Math.sin(q * TAU) * 0.2, e); },
  shiftWeight: (r, e) => { add(r, B.pelvis, 0, 0.12, 0.09, e); add(r, B.thighR, -0.12, 0, 0, e); add(r, B.shinR, 0.3, 0, 0, e); add(r, B.chest, 0, -0.05, -0.06, e); r.off[0] += 0.03 * e; },
  handsBack: (r, e) => { add(r, B.uArmL, 0.45, 0, -0.1, e); add(r, B.uArmR, 0.45, 0, 0.1, e); add(r, B.fArmL, -1.3, 0, 0, e); add(r, B.fArmR, -1.3, 0, 0, e); add(r, B.chest, -0.05, 0, 0, e); },
  stretchS: (r, e) => { add(r, B.uArmL, -2.6, 0, -0.2, e); add(r, B.uArmR, -2.6, 0, 0.2, e); add(r, B.chest, -0.18, 0, 0, e); add(r, B.head, -0.2, 0, 0, e); r.faceM = 0.16 + 0.6 * e; },
  checkSky: (r, e) => { add(r, B.head, -0.55, 0.15, 0, e); add(r, B.chest, -0.08, 0, 0, e); } };
const FKEYS = Object.keys(FID);
function fidgets(rig, st, t, dt, A) {
  const f = rig.fid || (rig.fid = { idle: 0, k: null, t: 0, dur: 0, next: 4 + Math.random() * 6, seed: Math.random() * 100 });
  const calm = A < 0.05 && !st.act && !st.talk && !st.listen && !st.carry && !st.air && !st.hurt && !(st.shiver > 0.2) && st.idle;
  if (!calm) { f.idle = 0; if (f.k) { f.t += dt * 3; } } else f.idle += dt;
  if (!f.k && calm && f.idle > f.next) { f.k = FKEYS[Math.floor(Math.random() * FKEYS.length)]; if (st.fidgetSet) f.k = st.fidgetSet[Math.floor(Math.random() * st.fidgetSet.length)]; f.t = 0; f.dur = 2 + Math.random() * 1.6; f.next = f.idle + 5 + Math.random() * 9; }
  if (f.k) { f.t += dt; const q = f.t / f.dur; if (q >= 1) { f.k = null; return; } FID[f.k](rig, bell(q), q, t); }
}
// talking: a gesture vocabulary that changes every few seconds; listening: nods
const GEST = [
  (r, e, t) => { add(r, B.uArmR, -0.55, 0, 0.1, e); add(r, B.fArmR, -0.9 + Math.sin(t * 5) * 0.18, 0, 0, e); },
  (r, e, t) => { const k = Math.sin(t * 4); add(r, B.uArmL, -0.5, 0, -0.15, e); add(r, B.uArmR, -0.5, 0, 0.15, e); add(r, B.fArmL, -0.95 + k * 0.12, 0.3, 0, e); add(r, B.fArmR, -0.95 - k * 0.12, -0.3, 0, e); },
  (r, e) => { add(r, B.uArmR, -0.6, 0, 0.45, e); add(r, B.fArmR, -1.7, -0.2, 0, e); add(r, B.head, 0.05, 0, 0, e); },              // hand on the heart
  (r, e, t) => { const k = Math.max(0, Math.sin(t * 2.4)); add(r, B.uArmL, -0.3, 0, 0.35 * k, e); add(r, B.uArmR, -0.3, 0, -0.35 * k, e); add(r, B.fArmL, -1.3, 0.6, 0, e); add(r, B.fArmR, -1.3, -0.6, 0, e); add(r, B.chest, -0.04 * k, 0, 0, e); }, // shrug / open palms
  (r, e, t) => { add(r, B.uArmR, -1.25, 0, 0.1, e); add(r, B.fArmR, -0.45 + Math.sin(t * 6) * 0.15, 0, 0, e); add(r, B.chest, 0, -0.1, 0, e); } ]; // pointing out
function convo(rig, st, t, A) {
  if (A > 0.3 || st.act) return; const sd = (rig.fid && rig.fid.seed) || 0;
  if (st.talk) { const slot = Math.floor(t / 2.6 + sd), q = (t / 2.6 + sd) % 1, g = GEST[Math.floor(hashf(slot) * GEST.length)], e = sst(0, 0.25, q) * (1 - sst(0.75, 1, q));
    // the base talk pose raises the right forearm; fade it to neutral and lay the new gesture on top
    rig.set(B.uArmR, 0, 0, -0.12); rig.set(B.fArmR, -0.18, 0, 0); g(rig, e * 0.9 + 0.1, t); add(rig, B.head, Math.sin(t * 3.1) * 0.04, Math.sin(t * 0.8 + sd) * 0.12, 0, 1); }
  else if (st.listen) { const n = Math.pow(Math.max(0, Math.sin(t * 1.7 + sd)), 6); add(rig, B.head, 0.14 * n + 0.03, 0, 0.05 * Math.sin(t * 0.4 + sd), 1); }
}

// =================================================================== 4. GAIT STYLE, BRAKE, PIVOT, SLOPE
function gaitStyle(rig, st, t, A, dt) {
  const bd = rig.body || {}, sp = st.speed || 0, R = clamp((sp - 3.0) / 2.1, 0, 1), W1 = 1 - R, ph = st.phase || 0, lm = rig.lm || {};
  if (bd.fem && !bd.kid) { // hip sway, narrow line, arms closer and softer
    add(rig, B.pelvis, 0, -rig.rot[B.pelvis * 3 + 1] * 0.35, Math.cos(ph) * 0.06 * A * W1, 1);
    add(rig, B.thighL, 0, 0, -0.035 * A, 1); add(rig, B.thighR, 0, 0, 0.035 * A, 1);
    rig.rot[B.uArmL * 3] *= 0.8; rig.rot[B.uArmR * 3] *= 0.8; add(rig, B.uArmL, 0, 0, -0.04, 1); add(rig, B.uArmR, 0, 0, 0.04, 1);
    rig.off[0] -= Math.cos(ph) * 0.008 * A * W1;
    if (A < 0.1) { add(rig, B.thighL, -0.04, 0, -0.02, 1); add(rig, B.shinL, 0.1, 0, 0, 1); add(rig, B.pelvis, 0, 0, 0.035, 1); } // contrapposto at rest
  }
  if (bd.mus > 0.3) { const m = bd.mus; // wide stance, arms ride off the lats, more shoulder swing
    add(rig, B.uArmL, 0, 0, 0.07 * m, 1); add(rig, B.uArmR, 0, 0, -0.07 * m, 1); add(rig, B.chest, 0, rig.rot[B.chest * 3 + 1] * 0.25 * A, 0, 1);
    if (A < 0.1) { add(rig, B.thighL, 0, 0, 0.045 * m, 1); add(rig, B.thighR, 0, 0, -0.045 * m, 1); add(rig, B.chest, -0.03, 0, 0, 1); }
  }
  if (bd.old) { // stoop and shorter stride
    add(rig, B.chest, 0.15, 0, 0, 1); add(rig, B.head, -0.12, 0, 0, 1); for (const b of [B.thighL, B.thighR]) rig.rot[b * 3] *= 0.8; add(rig, B.shinL, 0.06, 0, 0, 1); add(rig, B.shinR, 0.06, 0, 0, 1); rig.off[1] -= 0.012;
  }
  // braking skid: lead leg plants forward, torso leans back, arms come forward
  const fl = M.feel(), br = (rig.brk = lerp(rig.brk || 0, clamp((-(lm.acc || 0) - 3.2) / 6, 0, 1) * sst(2.6, 5, lm.sp0 = Math.max(sp, (lm.sp0 || 0) * 0.9)) * fl.brake * (st.act ? 0 : 1), Math.min(1, dt * 10)));
  if (br > 0.01) { const b = Math.min(1.2, br);
    add(rig, B.chest, -0.3, 0, 0, b); add(rig, B.pelvis, -0.08, 0, 0, b); add(rig, B.head, 0.15, 0, 0, b);
    rig.rot[B.thighL * 3] = lerp(rig.rot[B.thighL * 3], -0.6, Math.min(1, b)); rig.rot[B.shinL * 3] = lerp(rig.rot[B.shinL * 3], 0.12, Math.min(1, b));
    rig.rot[B.thighR * 3] = lerp(rig.rot[B.thighR * 3], 0.3, Math.min(1, b)); rig.rot[B.shinR * 3] = lerp(rig.rot[B.shinR * 3], 0.55, Math.min(1, b));
    add(rig, B.uArmL, -0.45, 0, 0.15, b); add(rig, B.uArmR, -0.45, 0, -0.15, b); rig.off[1] -= 0.07 * b; }
  // turning on the spot: a little shuffle of the feet instead of sliding
  const tr = Math.abs(lm.turn || 0), pv = st.act || lm.mode === 'turn' || lm.mode === 'stop' ? 0 : clamp((tr - 0.9) / 2, 0, 1) * (1 - sst(0.05, 0.25, A)); // v14: real turn steps in locoPose replace the shuffle
  if (pv > 0.01) { const q = Math.sin(t * 11), side = Math.sign(lm.turn || 1);
    add(rig, B.thighL, -0.28 * Math.max(0, q), 0, 0, pv); add(rig, B.shinL, 0.5 * Math.max(0, q), 0, 0, pv); add(rig, B.thighR, -0.28 * Math.max(0, -q), 0, 0, pv); add(rig, B.shinR, 0.5 * Math.max(0, -q), 0, 0, pv);
    add(rig, B.pelvis, 0, 0.18 * side, 0, pv); add(rig, B.head, 0, 0.25 * side, 0, pv); }
  // uphill lean forward / downhill lean back (slope sampled along the facing)
  if (st.gnd && !st.air && Math.abs(st.gnd(0, 0)) < 0.08) { const s0 = st.gnd(0, 0.45) - st.gnd(0, -0.45), sl = (rig.slope = lerp(rig.slope || 0, clamp(s0 / 0.9, -0.8, 0.8), Math.min(1, dt * 6)));
    add(rig, B.chest, sl * (0.25 + 0.2 * A), 0, 0, 1); add(rig, B.head, -sl * 0.15, 0, 0, 1);
    /* v16.8 slope gait (프롬프트 3장): uphill the hips flex more at contact (hip extensors work harder) and the pelvis goes
       forward; downhill the knees stay bent to brake (quadriceps eccentric) and the pelvis sits lower */
    if (sl > 0) { add(rig, B.thighL, -sl * 0.22 * A, 0, 0, 1); add(rig, B.thighR, -sl * 0.22 * A, 0, 0, 1); rig.off[2] += sl * 0.04 * A; }
    else { const d = -sl; add(rig, B.shinL, d * 0.3 * A, 0, 0, 1); add(rig, B.shinR, d * 0.3 * A, 0, 0, 1); add(rig, B.thighL, -d * 0.12 * A, 0, 0, 1); add(rig, B.thighR, -d * 0.12 * A, 0, 0, 1); rig.off[1] -= d * 0.035 * A; } }
}

// =================================================================== 5. FOOT IK (two-bone, analytic)
const L1 = 0.43, L2 = 0.44, FX = 0.095;
// ankle position relative to the hip in the leg's sagittal plane: dir(θ) = (y: −cosθ, z: −sinθ)
function legIK(rig, th, sh, e) {
  const t1 = rig.rot[th * 3], t2 = rig.rot[sh * 3];
  let ay = -L1 * Math.cos(t1) - L2 * Math.cos(t1 + t2); const az = -L1 * Math.sin(t1) - L2 * Math.sin(t1 + t2);
  ay += e; const D = clamp(Math.hypot(ay, az), 0.14, L1 + L2 - 0.003);
  const phi = Math.atan2(-az, -ay), knee = PI - Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1)), al = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  rig.rot[th * 3] = phi - al; rig.rot[sh * 3] = knee;
  return [az]; }
const ankleZ = (rig, th, sh) => { const t1 = rig.rot[th * 3], t2 = rig.rot[sh * 3]; return -L1 * Math.sin(t1) - L2 * Math.sin(t1 + t2); };
function footIK(rig, st, A, dt) {
  const ik = rig.ik || (rig.ik = { l: 0, r: 0, w: 0 });
  const onT = st.gnd && Math.abs(st.gnd(0, 0)) < 0.08; // standing on the terrain (not a floor, deck or roof)
  const on = onT && !st.air && !st.ride && !st.sleep && !st.swim && !st.noIK;
  ik.w = lerp(ik.w, on ? 1 - 0.55 * A : 0, Math.min(1, dt * 8)); if (ik.w < 0.01 || !st.gnd) return;
  const zl = ankleZ(rig, B.thighL, B.shinL), zr = ankleZ(rig, B.thighR, B.shinR);
  const hl = clamp(st.gnd(FX, zl), -0.35, 0.35), hr = clamp(st.gnd(-FX, zr), -0.35, 0.35), k = Math.min(1, dt * 14);
  ik.l = lerp(ik.l, hl, k); ik.r = lerp(ik.r, hr, k);
  const w = ik.w, pd = clamp(Math.min(ik.l, ik.r, 0.12), -0.22, 0.12); // pelvis goes down to the lower foot
  rig.off[1] += pd * w;
  const el = (ik.l - pd) * w, er = (ik.r - pd) * w;
  if (el > 0.004) legIK(rig, B.thighL, B.shinL, el); if (er > 0.004) legIK(rig, B.thighR, B.shinR, er);
  const tl = clamp((ik.l - ik.r) * 0.5, -0.1, 0.1) * w; add(rig, B.chest, 0, 0, -tl * 0.6, 1); rig.off[0] += tl * 0.25; // shift the weight over the lower foot, shoulders stay level
}


// =================================================================== 8. ACTING (v16.8)
/* Cutscene lines carry an emotion (shot.e: cry, sad, fear, tender, solemn, …) and now the speaker plays it with the body
   and the face instead of only the subtitle. Built from the research notes (프롬프트 9장):
   · emotion reads mostly from the UPPER BODY — sad: neck and upper back flexed, head down, arms hanging, small slow moves;
     joy: trunk extended, head up, arms up and open; anger: trunk forward, elbows bent and out, sudden strong moves;
     fear: LIMB CONTRACTION — elbows in, hands to the body, knees soft, a step back, a fine tremor (startle pattern).
   · Laban Effort sets the timing: sudden emotions (fear, shout, urgent) blend in fast, sustained ones (sad, tender,
     solemn, awe) slowly. Strength is the blend with the neutral pose (st.emoK, 0..1).
   · Face: FACS units mapped to the two face bones — eyes (lid opening: AU5 wide > 1, AU6/AU7 narrowed < 1) and mouth
     (jaw AU26 opening, lip stretch AU12/AU20 as width, AU15 as a pressed small mouth) — and the lip-flap of speech is
     scaled (shouting opens wide, whispering barely moves).
   While a pose owns the arms (st.act: begging, praying, carrying…) only the trunk, head and face take the emotion. */
const to = (rig, b, x, y, z, w) => { const o = b * 3; rig.rot[o] += (x - rig.rot[o]) * w; rig.rot[o + 1] += (y - rig.rot[o + 1]) * w; rig.rot[o + 2] += (z - rig.rot[o + 2]) * w; };
const AU = { // eyes · mouth at rest · mouth width · lip-flap scale · blend-in rate (Laban Time) · breath rate
  sad: [0.8, 0.13, 0.88, 0.7, 2.2, 0.8], weary: [0.72, 0.17, 0.95, 0.75, 2, 0.75], tired: [0.7, 0.34, 1, 0.8, 2.5, 2.4],
  cry: [0.5, 0.22, 1.12, 0.85, 3, 1.6], fear: [1.16, 0.32, 1.14, 0.9, 8, 1.9], angry: [0.82, 0.2, 1.08, 1.25, 7, 1.4],
  shout: [0.9, 0.3, 1.1, 1.45, 8, 1.4], urgent: [1.06, 0.2, 1, 1.15, 6, 1.5], happy: [0.74, 0.22, 1.16, 1.05, 4, 1.1],
  tender: [0.84, 0.16, 1.08, 0.8, 2.2, 0.9], solemn: [0.9, 0.14, 0.94, 0.85, 1.8, 0.7], pray: [0.12, 0.14, 0.92, 0.6, 2.5, 0.7],
  awe: [1.12, 0.36, 1, 0.85, 1.6, 0.8], whisper: [0.88, 0.15, 0.92, 0.4, 3, 0.9], calm: [0.92, 0.16, 1.02, 0.9, 1.6, 0.8], cold: [0.82, 0.18, 0.96, 0.8, 3, 1.3] };
const EMO = { // fn(rig, w = blend, t, arms = how much the arms may be posed, q = per-person seed)
  sad: (r, w, t, a) => { add(r, B.chest, 0.2, 0, 0, w); add(r, B.head, 0.3, 0, 0.05, w); add(r, B.pelvis, -0.05, 0, 0, w);
    to(r, B.uArmL, 0.06, 0, 0.02, w * a * 0.7); to(r, B.uArmR, 0.06, 0, -0.02, w * a * 0.7); to(r, B.fArmL, -0.15, 0, 0, w * a * 0.6); to(r, B.fArmR, -0.15, 0, 0, w * a * 0.6); },
  weary: (r, w, t, a) => { EMO.sad(r, w * 0.75, t, a); add(r, B.head, -0.05, 0, Math.sin(t * 0.7) * 0.06, w); r.off[1] -= 0.015 * w; },
  tired: (r, w, t, a) => { const b = Math.sin(t * 2.4 * PI); add(r, B.chest, 0.3 + b * 0.05, 0, 0, w); add(r, B.head, -0.18, 0, 0, w); add(r, B.pelvis, 0.12, 0, 0, w);
    add(r, B.thighL, -0.2, 0, 0, w); add(r, B.thighR, -0.2, 0, 0, w); add(r, B.shinL, 0.32, 0, 0, w); add(r, B.shinR, 0.32, 0, 0, w); r.off[1] -= 0.05 * w;
    to(r, B.uArmL, -0.62, 0, 0.1, w * a); to(r, B.uArmR, -0.62, 0, -0.1, w * a); to(r, B.fArmL, -0.1, 0, 0, w * a); to(r, B.fArmR, -0.1, 0, 0, w * a); }, // hands on the knees, panting
  cry: (r, w, t, a, q) => { const sob = Math.pow(Math.max(0, Math.sin(t * 5.2 + q)), 3) * (0.6 + 0.4 * Math.sin(t * 0.9 + q)), up = sst(0.3, 0.7, Math.sin(t * 0.35 + q) * 0.5 + 0.5);
    add(r, B.chest, 0.24 + sob * 0.09, 0, 0, w); add(r, B.head, 0.34 - sob * 0.06, 0, 0.06, w); r.off[1] -= sob * 0.012 * w;
    to(r, B.uArmR, -1.25, 0, 0.42, w * a * up); to(r, B.fArmR, -2.25, 0.1, 0, w * a * up); // a hand to the eyes now and then
    to(r, B.uArmL, -0.25, 0, -0.08, w * a * 0.6); to(r, B.fArmL, -1.0, 0.3, 0, w * a * 0.6); },
  fear: (r, w, t, a, q) => { const tr = (Math.sin(t * 31 + q) + Math.sin(t * 23.7)) * 0.012;
    add(r, B.chest, -0.06 + tr, 0, 0, w); add(r, B.head, -0.04, Math.sin(t * 1.3 + q) * 0.18, 0, w); add(r, B.pelvis, 0.06, 0, 0, w); r.off[1] -= 0.035 * w;
    add(r, B.thighL, -0.16, 0, 0, w); add(r, B.thighR, -0.16, 0, 0, w); add(r, B.shinL, 0.3, 0, 0, w); add(r, B.shinR, 0.3, 0, 0, w);
    to(r, B.uArmL, -0.35 + tr, 0, -0.12, w * a); to(r, B.uArmR, -0.35 - tr, 0, 0.12, w * a); to(r, B.fArmL, -1.75, 0.35, 0, w * a); to(r, B.fArmR, -1.75, -0.35, 0, w * a); }, // elbows in, fists to the chest
  angry: (r, w, t, a, q) => { const k = Math.pow(Math.max(0, Math.sin(t * 2.1 + q)), 8);
    add(r, B.chest, 0.14 + k * 0.08, 0, 0, w); add(r, B.head, -0.08, 0, 0, w); add(r, B.pelvis, 0.04, 0, 0, w);
    to(r, B.uArmL, -0.3, 0, 0.32, w * a); to(r, B.uArmR, -0.3 - k * 0.6, 0, -0.32, w * a); to(r, B.fArmL, -1.25, 0, 0, w * a); to(r, B.fArmR, -1.25 + k * 0.6, 0, 0, w * a); }, // elbows out, a hard beat now and then
  shout: (r, w, t, a, q) => { EMO.angry(r, w * 0.7, t, a, q); add(r, B.head, -0.14, 0, 0, w); add(r, B.chest, -0.06, 0, 0, w); },
  urgent: (r, w, t, a, q) => { const k = Math.sin(t * 4.5 + q); add(r, B.chest, 0.16, 0, 0, w); add(r, B.head, -0.06, 0, 0, w);
    to(r, B.uArmR, -0.95 + k * 0.12, 0, 0.12, w * a); to(r, B.fArmR, -0.55, 0, 0, w * a); to(r, B.uArmL, -0.4, 0, -0.15, w * a * 0.7); to(r, B.fArmL, -0.9, 0, 0, w * a * 0.7); },
  happy: (r, w, t, a, q) => { const k = Math.abs(Math.sin(t * 3 + q)); add(r, B.chest, -0.12, 0, 0, w); add(r, B.head, -0.12, 0, 0.04 * Math.sin(t * 1.5), w); r.off[1] += k * 0.012 * w;
    to(r, B.uArmL, -0.5, 0, 0.32, w * a * 0.7); to(r, B.uArmR, -0.5, 0, -0.32, w * a * 0.7); to(r, B.fArmL, -0.75, 0.5, 0, w * a * 0.7); to(r, B.fArmR, -0.75, -0.5, 0, w * a * 0.7); }, // open, upward palms
  tender: (r, w, t, a) => { add(r, B.chest, 0.06, 0, 0, w); add(r, B.head, 0.12, 0, 0.14, w);
    to(r, B.uArmL, -0.42, 0, -0.1, w * a * 0.8); to(r, B.uArmR, -0.42, 0, 0.1, w * a * 0.8); to(r, B.fArmL, -1.15, 0.45, 0, w * a * 0.8); to(r, B.fArmR, -1.15, -0.45, 0, w * a * 0.8); }, // hands softly together
  solemn: (r, w, t, a) => { add(r, B.chest, -0.04, 0, 0, w); add(r, B.head, 0.1, 0, 0, w);
    to(r, B.uArmL, -0.18, 0, -0.12, w * a); to(r, B.uArmR, -0.18, 0, 0.12, w * a); to(r, B.fArmL, -0.75, 0.55, 0, w * a); to(r, B.fArmR, -0.75, -0.55, 0, w * a); }, // hands folded low
  pray: (r, w, t, a) => { add(r, B.chest, 0.08, 0, 0, w); add(r, B.head, 0.36, 0, 0, w);
    to(r, B.uArmL, -0.5, 0, -0.16, w * a); to(r, B.uArmR, -0.5, 0, 0.16, w * a); to(r, B.fArmL, -1.95, 0.5, 0, w * a); to(r, B.fArmR, -1.95, -0.5, 0, w * a); },
  awe: (r, w, t, a) => { add(r, B.chest, -0.12, 0, 0, w); add(r, B.head, -0.32, 0, 0, w);
    to(r, B.uArmL, -0.35, 0, 0.3, w * a * 0.6); to(r, B.uArmR, -0.35, 0, -0.3, w * a * 0.6); to(r, B.fArmL, -0.5, 0.4, 0, w * a * 0.6); to(r, B.fArmR, -0.5, -0.4, 0, w * a * 0.6); },
  whisper: (r, w, t, a) => { add(r, B.chest, 0.12, 0, 0, w); add(r, B.head, 0.08, 0, -0.12, w); to(r, B.uArmR, -0.7, 0, 0.3, w * a * 0.6); to(r, B.fArmR, -2.0, 0.2, 0, w * a * 0.6); },
  calm: (r, w) => { add(r, B.chest, -0.03, 0, 0, w); add(r, B.head, 0.03, 0, 0, w); },
  cold: (r, w, t, a, q) => { const tr = Math.sin(t * 38 + q) * 0.02; add(r, B.chest, 0.16 + tr, 0, 0, w); add(r, B.head, 0.14, 0, 0, w); r.off[1] -= 0.02 * w;
    to(r, B.uArmL, -0.55, 0, -0.35, w * a); to(r, B.uArmR, -0.55, 0, 0.35, w * a); to(r, B.fArmL, -2.05 + tr, 0.6, 0, w * a); to(r, B.fArmR, -2.05 - tr, -0.6, 0, w * a); } }; // arms wrapped round the body
M.EMOTIONS = Object.keys(EMO);
function acting(rig, st, t, dt0, hold) {
  const dt = clamp(t - (rig.emT === undefined ? t - dt0 : rig.emT), 0, 0.25); rig.emT = t; // own clock: distant people animate at a lower rate
  const ew = rig.ew || (rig.ew = {}), want = st.emo && EMO[st.emo] ? st.emo : null, K = st.emoK === undefined ? 1 : st.emoK, q = ((rig.fid && rig.fid.seed) || 0) * 3.1;
  if (want && !(want in ew)) ew[want] = 0;
  let face = null, fw = 0;
  for (const k in ew) { const on = k === want, rate = AU[k] ? AU[k][4] : 3; ew[k] += ((on ? K : 0) - ew[k]) * Math.min(1, dt * (on ? rate : rate * 0.7));
    if (!on && ew[k] < 0.01) { delete ew[k]; continue; } const w = ew[k];
    if (!hold) EMO[k](rig, w, t, st.act ? 0 : 1 - 0.5 * Math.min(1, (st.speed || 0) / 2), q); // a hold pose (sitting, kneeling, sleeping) keeps its body; the face still acts
    if (w > fw) { fw = w; face = k; } }
  rig.emF = face && AU[face] ? face : null; rig.emW = fw; rig.emQ = q;
  // breathing follows the feeling (fast and high in fear, slow and deep in sorrow)
  if (face && !hold && AU[face]) add(rig, B.chest, Math.sin(t * AU[face][5] * 2.2 + q) * 0.022 * fw, 0, 0, 1);
}
function actFace(rig, st, t) { const face = rig.emF; if (!face || rig.n < 17) return; const f = AU[face], sc = rig.scl, fw = rig.emW, q = rig.emQ;
  if (!st.sleep) sc[15 * 3 + 1] *= 1 + (f[0] - 1) * fw;
  if (st.talk) sc[16 * 3 + 1] = 0.16 + (sc[16 * 3 + 1] - 0.16) * (1 + (f[3] - 1) * fw) + (face === 'cry' ? Math.sin(t * 19) * 0.04 * fw : 0);
  else sc[16 * 3 + 1] = lerp(sc[16 * 3 + 1], f[1] + (face === 'cry' || face === 'fear' ? Math.sin(t * 17 + q) * 0.035 : 0), fw);
  sc[16 * 3] = 1 + (f[2] - 1) * fw;
}

// =================================================================== 9. POSTURE CHOREOGRAPHY (v16.8 → v16.9)
/* Lying down ↔ standing doesn't just blend: the body goes THROUGH a kneel (프롬프트 4장 sit-to-stand — trunk forward, weight over
   the feet, then hips and knees extend), over 1.6 s. This only builds that path as the target pose; every other change of
   posture (sit, kneel, bow, beg…) is smoothed by the inertializer below instead of the old timed crossfade. */
const LOW = new Set(['sleep', 'lie', 'prostrate', 'fallen', 'sitHug', 'sitg', 'bound', 'kneelRest']);
const KNEELY = new Set(['kneel', 'kneelPray', 'beg', 'weep', 'pray', 'tearClothes', 'gather', 'pick', 'squat', 'plant', 'water']);
const FAST = /^(swing|thrust|shoot|sling|cast|dodge|hit|charioteer|climb)/;
function postureKey(st) { if (st.sleep) return 'sleep'; if (st.ride) return 'ride'; if (st.kneel) return 'kneel'; if (st.sit) return 'sit';
  if (st.act && !FAST.test(st.act)) return st.act; return 'loco'; }
const MIDR = new Float32Array(19 * 3), MIDO = [0, 0, 0], CURR = new Float32Array(19 * 3), CURO = [0, 0, 0], SCL = new Float32Array(19 * 3);
function postureChoreo(rig, st, t) {
  const k = postureKey(st), pt = rig.pt || (rig.pt = { k, u: 1, snap: new Float32Array(rig.n * 3), so: [0, 0, 0], t });
  const dt = clamp(t - pt.t, 0, 0.1); pt.t = t; const n = rig.n * 3;
  if (k !== pt.k && !(st.act && FAST.test(st.act))) { const low0 = LOW.has(pt.k), low1 = LOW.has(k);
    if (low0 !== low1 && pt.k !== 'ride' && k !== 'ride' && rig.shown) { pt.snap.set(rig.shown); pt.so[0] = rig.shownO[0]; pt.so[1] = rig.shownO[1]; pt.so[2] = rig.shownO[2]; pt.u = 0; } else pt.u = 1; }
  pt.k = k; if (pt.u >= 1) return false; pt.u = Math.min(1, pt.u + dt / 1.6); const u = pt.u;
  CURR.set(rig.rot.subarray(0, n)); CURO[0] = rig.off[0]; CURO[1] = rig.off[1]; CURO[2] = rig.off[2];
  SCL.set(rig.scl.subarray(0, n)); rig.zero(); locoPose(rig, { kneel: true }, t); rig.scl.set(SCL.subarray(0, n)); add(rig, B.chest, 0.25, 0, 0, 1); add(rig, B.uArmL, 0.3, 0, 0, 1); add(rig, B.uArmR, 0.3, 0, 0, 1); // a hand down for support
  MIDR.set(rig.rot.subarray(0, n)); MIDO[0] = rig.off[0]; MIDO[1] = rig.off[1]; MIDO[2] = rig.off[2];
  const a = u < 0.5, e = E(a ? u / 0.5 : (u - 0.5) / 0.5), A = a ? pt.snap : MIDR, Ao = a ? pt.so : MIDO, Bv = a ? MIDR : CURR, Bo = a ? MIDO : CURO;
  for (let i = 0; i < n; i++) rig.rot[i] = A[i] + (Bv[i] - A[i]) * e; for (let c = 0; c < 3; c++) rig.off[c] = Ao[c] + (Bo[c] - Ao[c]) * e;
  return true; }

// =================================================================== 10. INERTIALIZATION (v16.9, 연구 보고서 3장 ①)
/* Bollo (GDC 2018) / Holden "dead blending": when the motion changes we never play two motions at once. At the moment of the change
   we remember, per bone channel (and the root offset), how far the pose on screen is from the new pose (off) and how fast the
   screen pose was moving (vel); every frame a critically damped spring takes off → 0, and the screen shows new pose + off.
   One system for every change in the human driver:
     combat (swing, thrust, sling, bow, dodge, hit) in or out .. halflife 0.05 s (the strike itself is never delayed)
     take-off / landing ......................................... 0.06 / 0.08 s
     start walking / hard stop (brake) / turn on the spot ....... 0.08 / 0.10 / 0.09 s, a sharp change of heading 0.09 s
     gestures and emotes ......................................... 0.12 s
     sit · kneel · lie · bow and other postures ................. 0.20 s (lie ↔ stand also follows the kneel path above)
   It replaces both the old offset spring (models.js inertia(), one 0.12 s for everything, combat included) and the v16.8 timed
   crossfade. Cost: ~60 channels × a few multiplies per character per frame. G.Motion.inertialOn = false turns it off. */
const HL = { combat: 0.05, air: 0.06, land: 0.08, start: 0.08, brake: 0.1, turn: 0.09, sharp: 0.09, gesture: 0.12, posture: 0.2, choreo: 0.15 };
M.HL = HL; M.inertialOn = true;
const CLOTH0 = 14 * 3, CLOTH1 = 15 * 3; // the cape has its own spring (clothSim)
function iKey(st) { if (st.sleep) return 'sleep'; if (st.ride) return 'ride'; if (st.kneel) return 'kneel'; if (st.sit) return 'sit'; return st.act || 'loco'; }
function inertialize(rig, st, t, choreo) {
  const n = rig.n * 3, z = rig.iz || (rig.iz = { off: new Float32Array(n), vel: new Float32Array(n), prev: new Float32Array(n), prev2: new Float32Array(n), oo: [0, 0, 0], ov: [0, 0, 0], po: [0, 0, 0], po2: [0, 0, 0],
    key: iKey(st), air: !!st.air, mode: rig.lm && rig.lm.mode, hl: 0.1, t, init: false, sharpT: 0, live: false });
  let dt = t - z.t; z.t = t; if (!(dt > 0)) dt = 1 / 60; else if (dt > 0.25) dt = 0.25; // far-away people animate at a lower rate: keep real time
  if (!z.init || !M.inertialOn) { z.prev.set(rig.rot.subarray(0, n)); z.prev2.set(z.prev); for (let c = 0; c < 3; c++) z.po[c] = z.po2[c] = rig.off[c]; z.init = true; z.live = false; z.key = iKey(st); z.air = !!st.air; return; }
  // --- what changed this frame?
  const key = iKey(st), lm = rig.lm || {}, mode = lm.mode; let hl = 0;
  if (key !== z.key) { const cb = FAST.test(key) || FAST.test(z.key); const big = /^(sleep|sit|kneel|ride)$/.test(key) || /^(sleep|sit|kneel|ride)$/.test(z.key) || LOW.has(key) || LOW.has(z.key) || KNEELY.has(key) || KNEELY.has(z.key);
    hl = cb ? HL.combat : big ? (choreo ? HL.choreo : HL.posture) : HL.gesture; }
  else if (!!st.air !== z.air) hl = st.air ? HL.air : HL.land;
  else if (mode !== z.mode && mode && z.mode) hl = mode === 'stop' ? HL.brake : mode === 'turn' ? HL.turn : mode === 'move' && z.mode === 'rest' ? HL.start : 0;
  z.sharpT = Math.max(0, z.sharpT - dt); if (!hl && Math.abs(lm.turn || 0) > 4.5 && (st.speed || 0) > 1.5 && z.sharpT <= 0) { hl = HL.sharp; z.sharpT = 0.35; }
  z.key = key; z.air = !!st.air; z.mode = mode;
  // --- start (or restart) a transition from what is on screen
  if (hl) { z.hl = hl; z.live = true; const R = rig.rot;
    for (let i = 0; i < n; i++) { if (i >= CLOTH0 && i < CLOTH1) { z.off[i] = z.vel[i] = 0; continue; } let d = z.prev[i] - R[i]; if (d > PI) d -= TAU; else if (d < -PI) d += TAU;
      z.off[i] = d; z.vel[i] = clamp((z.prev[i] - z.prev2[i]) / dt, -25, 25); }
    for (let c = 0; c < 3; c++) { z.oo[c] = z.po[c] - rig.off[c]; z.ov[c] = clamp((z.po[c] - z.po2[c]) / dt, -6, 6); } }
  // --- decay the offsets (exact critically damped spring) and show new pose + offset
  if (z.live) { const y = 4 * Math.LN2 / z.hl / 2, e = Math.exp(-y * dt); let left = 0;
    for (let i = 0; i < n; i++) { const o = z.off[i], v = z.vel[i]; if (o === 0 && v === 0) continue; const j1 = v + o * y; const no = e * (o + j1 * dt), nv = e * (v - j1 * y * dt);
      if (Math.abs(no) < 1e-4 && Math.abs(nv) < 1e-3) { z.off[i] = z.vel[i] = 0; continue; } z.off[i] = no; z.vel[i] = nv; rig.rot[i] += no; left++; }
    for (let c = 0; c < 3; c++) { const o = z.oo[c], v = z.ov[c], j1 = v + o * y; z.oo[c] = e * (o + j1 * dt); z.ov[c] = e * (v - j1 * y * dt); rig.off[c] += z.oo[c]; }
    if (!left && Math.abs(z.oo[1]) < 1e-4) z.live = false; }
  z.prev2.set(z.prev); z.prev.set(rig.rot.subarray(0, n)); for (let c = 0; c < 3; c++) { z.po2[c] = z.po[c]; z.po[c] = rig.off[c]; }
  (rig.shown || (rig.shown = new Float32Array(n))).set(z.prev); const so = rig.shownO || (rig.shownO = [0, 0, 0]); so[0] = rig.off[0]; so[1] = rig.off[1]; so[2] = rig.off[2];
}
M.iStats = { n: 0, ms: 0 };

// =================================================================== 6. HUMAN DRIVER
const HOLD_IK_OFF = M.HOLD_IK_OFF = new Set(['lie', 'sitg', 'sitHug', 'kneelRest', 'prostrate', 'dance2', 'climb']);
function animHuman(rig, st, t) {
  const tm = rig.mt === undefined ? t - 1 / 60 : rig.mt; let dt = t - tm; rig.mt = t; if (!(dt > 0) || dt > 0.1) dt = 1 / 60;
  rig.faceM = undefined; rig.faceE = undefined;
  const sp = st.speed || 0, A = Math.min(1, sp / 2.2);
  const hold = locoPose(rig, st, t);
  if (!hold) {
    gaitStyle(rig, st, t, A, dt);
    const a = st.act, fn = a && P[a];
    if (a) {
      const up = fn ? fn.up : UP_BASE.has(a), wMove = up ? sst(0.06, 0.45, A) : 0;
      if (wMove > 0) { for (let i = 0; i < LOWER.length; i++) { const o = LOWER[i] * 3; SAVE[i * 3] = rig.rot[o]; SAVE[i * 3 + 1] = rig.rot[o + 1]; SAVE[i * 3 + 2] = rig.rot[o + 2]; } SOFF[0] = rig.off[0]; SOFF[1] = rig.off[1]; SOFF[2] = rig.off[2]; }
      const chestY = rig.rot[B.chest * 3 + 1];
      if (fn) fn(rig, st.actT || 0, t, st); else baseAct(rig, st, t);
      if (wMove > 0) { for (let i = 0; i < LOWER.length; i++) { const o = LOWER[i] * 3; for (let c = 0; c < 3; c++) rig.rot[o + c] = lerp(rig.rot[o + c], SAVE[i * 3 + c], wMove); }
        for (let c = 0; c < 3; c++) rig.off[c] = lerp(rig.off[c], SOFF[c], wMove * 0.85); rig.rot[B.chest * 3 + 1] += chestY * 0.5 * wMove; }
    } else if (st.hurt || st.shiver > 0) baseAct(rig, st, t);
    // 앉기(crouch): knees bent, hips low, chest over the knees, eyes up, hands forward for balance — a stalking walk
    const ck = rig.ck = lerp(rig.ck || 0, st.crouch && !st.act ? 1 : 0, Math.min(1, dt * 9));
    if (ck > 0.01) { rig.off[1] -= 0.27 * ck; add(rig, B.thighL, -0.62, 0, 0.08, ck); add(rig, B.thighR, -0.62, 0, -0.08, ck); add(rig, B.shinL, 0.95, 0, 0, ck); add(rig, B.shinR, 0.95, 0, 0, ck);
      add(rig, B.pelvis, 0.12, 0, 0, ck); add(rig, B.chest, 0.42, 0, 0, ck); add(rig, B.head, -0.38, 0, 0, ck);
      add(rig, B.uArmL, -0.3, 0, -0.08, ck); add(rig, B.uArmR, -0.3, 0, 0.08, ck); add(rig, B.fArmL, -0.45, 0, 0, ck); add(rig, B.fArmR, -0.45, 0, 0, ck); }
    // a hard landing: absorb it in the knees, hands out
    if (st.landT > 0) { const k = sst(0, 0.25, st.landT) ; rig.off[1] -= 0.3 * k; add(rig, B.thighL, -0.7, 0, 0.1, k); add(rig, B.thighR, -0.7, 0, -0.1, k); add(rig, B.shinL, 1.2, 0, 0, k); add(rig, B.shinR, 1.2, 0, 0, k);
      add(rig, B.chest, 0.4, 0, 0, k); add(rig, B.uArmL, -0.5, 0, -0.5, k); add(rig, B.uArmR, -0.5, 0, 0.5, k); }
    fidgets(rig, st, t, dt, A); convo(rig, st, t, A);
  } else if (st.sit && !st.ride) seatedLife(rig, st, t);
  if (st.emo || rig.ew) acting(rig, st, t, dt, hold); else rig.emF = null;
  const choreo = postureChoreo(rig, st, t); // v16.9 lie ↔ stand goes through a kneel (target pose)
  if (M.timing) { const t0 = performance.now(); inertialize(rig, st, t, choreo); M.iStats.ms += performance.now() - t0; M.iStats.n++; } else inertialize(rig, st, t, choreo); // v16.9 one inertializer for every change (replaces inertia())
  if (rig.rc && rig.rc.on) reactStep(rig, dt, false); // v18.1 P8 hit reaction (after the inertializer)
  if (!hold && !HOLD_IK_OFF.has(st.act)) footIK(rig, st, A, dt); else if (rig.ik) rig.ik.w = 0;
  clothSim(rig, st, t); faceAnim(rig, st, t); footRoll(rig, st, A, dt, hold);
  if (rig.n >= 17) { if (rig.faceM !== undefined && !st.talk) rig.scl[16 * 3 + 1] = rig.faceM; if (rig.faceE !== undefined && !st.sleep) rig.scl[15 * 3 + 1] = Math.min(rig.scl[15 * 3 + 1], Math.max(0.08, rig.faceE)); }
  actFace(rig, st, t);
}
const UP_BASE = new Set(['sling', 'shoot', 'cast', 'water', 'fish', 'cheer']);
/* ankles (v11): the foot keeps its sole level with the ground whatever the knee and hip do, rolls through the step —
   toes up as the leg reaches forward for the heel strike, up onto the toes as it trails behind to push off — points
   when the hero is in the air, and trails behind the shin when kneeling instead of sticking into the floor. */
function footRoll(rig, st, A, dt, hold) {
  if (rig.n < 19) return; const fl = rig.fl || (rig.fl = [0, 0]), pel = rig.rot[B.pelvis * 3], k = Math.min(1, dt * 18);
  for (let i = 0; i < 2; i++) { const th = i ? B.thighR : B.thighL, sh = i ? B.shinR : B.shinL, ft = i ? B.footR : B.footL;
    const tx = rig.rot[th * 3], sum = pel + tx + rig.rot[sh * 3]; let want = -sum;
    if (st.air || st.swim) want = 0.45 - sum * 0.3;
    else if (!hold) want += A * (0.5 * Math.max(0, tx + 0.05) - 0.32 * Math.max(0, -tx - 0.12));
    if (sum > 0.95) want = lerp(want, 0.3, sst(0.95, 1.45, sum)); // kneeling: the foot lies back along the floor
    if (st.ride) want = 0.25; else if (st.sit || st.sleep) want *= 0.5;
    fl[i] = lerp(fl[i], clamp(want, -0.6, 1.3), k); rig.rot[ft * 3] = fl[i]; }
}
// seated villagers: hands on knees, chin in hand, leaning back, chatting — chosen per person and changed now and then
function seatedLife(rig, st, t) {
  const sd = (rig.fid || (rig.fid = { idle: 0, seed: Math.random() * 100 })).seed, v = Math.floor(hashf(Math.floor(t / 18 + sd) + sd) * 5);
  if (v === 1) { add(rig, B.uArmR, -0.35, 0, 0.35, 1); add(rig, B.fArmR, -1.25, -0.3, 0, 1); add(rig, B.chest, 0.2, 0, 0, 1); add(rig, B.head, -0.1, 0, 0.08, 1); }        // chin in hand
  else if (v === 2) { add(rig, B.chest, -0.18, 0, 0, 1); add(rig, B.uArmL, 0.75, 0, 0.2, 1); add(rig, B.uArmR, 0.75, 0, -0.2, 1); add(rig, B.fArmL, 0.5, 0, 0, 1); add(rig, B.fArmR, 0.5, 0, 0, 1); } // leaning back on the hands
  else if (v === 3) { const k = Math.sin(t * 4.2); add(rig, B.uArmR, -0.3, 0, 0.1, 1); add(rig, B.fArmR, -0.5 + k * 0.2, 0, 0, 1); add(rig, B.head, 0, Math.sin(t * 0.5 + sd) * 0.4, 0, 1); rig.faceM = 0.16 + 0.4 * Math.max(0, Math.sin(t * 11)) * Math.max(0, Math.sin(t * 0.9 + sd)); } // chatting with the neighbour
  else if (v === 4 && st.cold) { add(rig, B.uArmL, -0.7, 0, -0.2, 1); add(rig, B.uArmR, -0.7, 0, 0.2, 1); add(rig, B.fArmL, 0.2, 0, 0, 1); add(rig, B.fArmR, 0.2, 0, 0, 1); add(rig, B.chest, 0.15, 0, 0, 1); } // hands to the fire
  else add(rig, B.head, 0.04, Math.sin(t * 0.21 + sd) * 0.3, 0, 1);
}

// =================================================================== 7. ANIMALS
const GAIT = { // leg phase offsets [FL, FR, BL, BR] in cycles, swing amplitude, lift, bob, pitch
  walk: { o: [0.25, 0.75, 0, 0.5], amp: 0.36, lift: 0.14, bob: 0.018, pitch: 0.015, nod: 0.09 },
  trot: { o: [0, 0.5, 0.5, 0], amp: 0.5, lift: 0.22, bob: 0.03, pitch: 0.02, nod: 0.04 },
  gallop: { o: [0.5, 0.65, 0, 0.17], amp: 0.72, lift: 0.28, bob: 0.06, pitch: 0.09, nod: 0.1 },
  bound: { o: [0.5, 0.55, 0, 0.04], amp: 0.85, lift: 0.3, bob: 0.07, pitch: 0.16, nod: 0.05 },
  pace: { o: [0, 0.5, 0, 0.5], amp: 0.5, lift: 0.2, bob: 0.03, pitch: 0.015, nod: 0.05 } }; // v17.0: camels pace (both legs of a side together)
const GK = ['walk', 'trot', 'gallop', 'bound', 'pace'];
/* v17.0 보법 섞기 (움직임 연구 보고서 2장 ②): gaits used to switch in one frame (walk -> trot -> gallop), so the legs jumped
   to a new pattern. Each gait now has a weight that eases toward its target (~0.25 s), and the legs, body and head are the
   weighted sum of the gaits. A rider's mount passes its own weights (st.gw, from ride.js speed ranges); other animals get
   targets from their speed. */
function gaitW(rig, st, sp, legH, hare, A, dt) {
  const w = rig.gw || (rig.gw = { walk: 1, trot: 0, gallop: 0, bound: 0, pace: 0 }), tg = { walk: 0, trot: 0, gallop: 0, bound: 0, pace: 0 };
  if (st.gw) Object.assign(tg, st.gw);
  else if (hare && A > 0.1) tg.bound = 1;
  else if (st.gallop) tg.gallop = 1;
  else { const tr = sst(legH * 2.1, legH * 2.9, sp); tg.trot = tr; tg.walk = 1 - tr; }
  const k = Math.min(1, dt * 6); let sum = 0; for (const n of GK) { w[n] += (tg[n] - w[n]) * k; sum += w[n]; }
  if (sum > 1e-4) for (const n of GK) w[n] /= sum; return w;
}
function animAnimal(rig, st, t) {
  if (st.dead || st.fly) { baseAnimal(rig, st, t); return; }
  const tm = rig.mt === undefined ? t - 1 / 60 : rig.mt; let dt = t - tm; rig.mt = t; if (!(dt > 0) || dt > 0.1) dt = 1 / 60;
  rig.zero(); const def = rig.def, legH = def[2] ? def[2][3] : 0.6, sp = st.speed || 0, sd = st.seed || 0;
  const bird = def === AB.partridge, hare = def === AB.hare, big = legH > 0.85;
  const A = clamp(sp / Math.max(0.5, legH * 1.3), 0, 1), ph = st.phase || 0;
  if (bird) { // wings folded, quick little steps, head bobs, pecks while feeding
    const s = Math.sin(ph * 2); rig.set(2, 0, 0, 0.05); rig.set(3, 0, 0, -0.05); rig.set(4, s * 0.7 * A); rig.set(5, -s * 0.7 * A);
    rig.off[1] = -Math.abs(Math.cos(ph * 2)) * 0.012 * A; const peck = st.graze ? Math.pow(Math.max(0, Math.sin(t * 5.5 + sd)), 5) * 0.9 : 0;
    rig.set(1, peck + Math.sin(ph * 4) * 0.12 * A, Math.sin(t * 0.9 + sd) * 0.5 * (1 - A) * (st.graze ? 0.2 : 1), 0); rig.set(6, -0.2 + Math.sin(t * 2 + sd) * 0.08); return blendA(rig, st, dt);
  }
  if (st.lie) { // lying down: legs folded under, head up chewing, occasional head turn or nap
    const nap = Math.sin(t * 0.07 + sd) > 0.4; rig.off[1] = -(st.legH || legH) * 0.82;
    for (let i = 2; i <= 5; i++) { rig.set(i, i < 4 ? -1.45 : 1.45); rig.scl[i * 3 + 1] = 0.5; } // legs folded under the body
    rig.set(1, nap ? 0.55 : 0.12 + Math.sin(t * 0.7 + sd) * 0.05, nap ? 0.6 : Math.sin(t * 0.25 + sd) * 0.4, nap ? 0.3 : 0); rig.set(6, 0, Math.sin(t * 1.5 + sd) * 0.15, 0); return blendA(rig, st, dt);
  }
  if (st.atk === 1) { // wind-up: crouch on the haunches, head low, tail stiff, trembling
    const q = Math.sin(t * 34) * 0.025; rig.off[1] = -0.1 * legH; rig.set(0, 0.14 + q); rig.set(1, 0.42, 0, q * 4); rig.set(2, -0.25); rig.set(3, -0.25); rig.set(4, 0.38); rig.set(5, 0.38);
    rig.scl[4 * 3 + 1] = 0.86; rig.scl[5 * 3 + 1] = 0.86; rig.set(6, -0.5); return blendA(rig, st, dt, 20);
  }
  if (st.atk === 2) { // strike: launch off the hind legs; big beasts rear up
    const rear = def === AB.bear || def === AB.lion ? 1 : 0; rig.off[1] = 0.12 * legH + rear * 0.35 * legH; rig.set(0, -0.15 - rear * 0.45); rig.set(1, -0.35 + rear * 0.15);
    rig.set(2, -0.95 - rear * 0.5); rig.set(3, -0.75 - rear * 0.5); rig.set(4, 0.6); rig.set(5, 0.5); rig.scl[2 * 3 + 1] = 0.9; rig.scl[3 * 3 + 1] = 0.9; rig.set(6, -0.7); return blendA(rig, st, dt, 22);
  }
  const gw = gaitW(rig, st, sp, legH, hare, A, dt), wW = gw.walk, wG = gw.gallop + gw.bound; // v17.0 weighted gaits
  const legR = [0, 0, 0, 0], legS = [0, 0, 0, 0]; let bob = 0, pitch = 0, nod = 0;
  for (const n of GK) { const wt = gw[n]; if (wt < 0.002) continue; const g = GAIT[n];
    for (let i = 0; i < 4; i++) { const a = ph + g.o[i] * TAU; legR[i] += wt * Math.sin(a) * g.amp * A * (i < 2 ? 1 : 0.9); legS[i] += wt * Math.max(0, -Math.cos(a)) * A * g.lift; } // the hoof comes up while the leg swings forward
    bob += wt * g.bob; pitch += wt * g.pitch; nod += wt * g.nod; }
  const aK = st.ampK || 1; for (let i = 0; i < 4; i++) { rig.set(2 + i, legR[i] * aK); rig.scl[(2 + i) * 3 + 1] = 1 - legS[i] * Math.min(1, aK); } // ampK: stride length from the mount's speed range
  rig.off[1] = -(0.5 - 0.5 * Math.cos(ph * 2)) * bob * legH * A;
  rig.set(0, Math.sin(ph) * pitch * A + Math.sin(ph * 2) * 0.01 * A * wW, 0, Math.sin(ph) * 0.03 * A * (0.3 + 0.7 * wW));
  // head: grazing (with a look-up every few seconds), nodding in the walk, curious look-around at rest
  const lookUp = st.graze ? sst(0.55, 0.8, Math.sin(t * 0.37 + sd) * 0.5 + 0.5) : 0;
  const graze = st.graze ? (0.88 + Math.sin(t * 2.3) * 0.07) * (1 - lookUp) : 0;
  const idleYaw = (1 - A) * (st.graze ? lookUp : 1) * Math.sin(t * 0.33 + sd) * 0.45 * Math.max(0, Math.sin(t * 0.13 + sd * 2) + 0.3);
  rig.set(1, graze + Math.sin(ph * 2 + 0.6) * nod * A - gw.gallop * Math.sin(ph) * 0.08 * A + (big ? 0 : -0.05 * lookUp), (st.headYaw || 0) + idleYaw, 0);
  // tail: lazy swish with flicks at rest, lifted and streaming when running
  const flick = Math.pow(Math.max(0, Math.sin(t * 0.8 + sd)), 8);
  rig.set(6, -0.45 * A * (0.3 + 0.7 * wG), Math.sin(t * 3 + sd) * 0.25 * (1 - A) + Math.sin(t * 13 + sd) * 0.35 * flick + Math.sin(ph * 2) * 0.15 * A, 0);
  blendA(rig, st, dt);
  if (rig.rc && rig.rc.on) reactStep(rig, dt, true); // v18.1 P8
}
// spring-blend between animal states (graze ↔ walk ↔ lie ↔ attack) so poses never snap
function blendA(rig, st, dt, rate) {
  const n = rig.rot.length, m = rig.am || (rig.am = { rot: new Float32Array(n), scl: new Float32Array(n), off: [0, 0, 0], init: false, key: '' });
  const key = (st.lie ? 'L' : '') + (st.graze ? 'G' : '') + (st.atk || ''); // v17.0: gait changes are blended by gaitW, not here
  if (!m.init) { m.rot.set(rig.rot); m.scl.set(rig.scl); m.off = rig.off.slice(); m.init = true; m.key = key; return; }
  const k = key !== m.key || m.blend > 0 ? Math.min(1, dt * (rate || 7)) : 1;
  if (key !== m.key) { m.blend = 0.6; m.key = key; } if (m.blend > 0) m.blend -= dt;
  for (let i = 0; i < n; i++) { m.rot[i] += (rig.rot[i] - m.rot[i]) * k; rig.rot[i] = m.rot[i]; m.scl[i] += (rig.scl[i] - m.scl[i]) * k; rig.scl[i] = m.scl[i]; }
  for (let c = 0; c < 3; c++) { m.off[c] += (rig.off[c] - m.off[c]) * k; rig.off[c] = m.off[c]; }
}

// =================================================================== exports
M.groundFn = function (ent) { // st.gnd sampler: height of the ground at a point in the character's local frame, relative to its feet
  return ent.gndFn || (ent.gndFn = (lx, lz) => { const W = G.Game && G.Game.W && G.Game.W(); if (!W) return 0; const f = ent.face || 0, c = Math.cos(f), s = Math.sin(f);
    const k = ent.scale || 1; return (W.heightAt(ent.x + (lx * c + lz * s) * k, ent.z + (-lx * s + lz * c) * k) - (ent.y || 0) + (ent.gndOff || 0)) / k; });
};
M.isRest = k => k === 'sitg' || k === 'sitHug' || k === 'lie' || k === 'kneelRest' || k === 'squat' || k === 'warmHands';
G.animHuman = animHuman; G.animAnimal = animAnimal; M.legIK = legIK;
// v17.1 P11: with ?perf=1 the animators are timed (M.animMs, summed per frame, read by js/perf.js); game.js picks these up when it loads
if (/[?&]perf\b/.test(location.search)) { M.animMs = 0; const ah = animHuman, aa = animAnimal;
  G.animHuman = function () { const t = performance.now(); const r = ah.apply(this, arguments); M.animMs += performance.now() - t; return r; };
  G.animAnimal = function () { const t = performance.now(); const r = aa.apply(this, arguments); M.animMs += performance.now() - t; return r; }; }
// =================================================================== 11. HIT REACTION (v18.1, 엔진·연출 업그레이드 문서의 P8)
/* Being hit used to be one static pose (chest and head leaned back while the red flash lasted) plus a push in the velocity. Now a hit is an IMPULSE into
   a few damped springs that sit on top of whatever the body is doing (after the inertializer, so it is not smoothed away): the torso pitches/rolls/twists
   away from the blow, the head whips the other way a little later (its own looser spring), the arms swing, the pelvis counters — then everything swings
   back and settles, with one soft overshoot. A bigger blow (force 0..1.4) is a bigger swing and takes longer to settle; the direction is the direction the
   body is pushed, relative to where it faces (hit from the front → leans back, from behind → pitches forward, from the side → rolls). Animals use their
   body and head bones. G.Motion.react(rig, pushDx, pushDz, facing, force); off with ?react=0. */
M.reactOn = !/[?&]react=0\b/.test(location.search);
const RXW = 15, RXZ = 0.42, RXWH = 11, RXZH = 0.3;
M.react = function (rig, dx, dz, face, force) {
  if (!M.reactOn || !rig) return; const f = Math.min(1.4, Math.max(0, force || 0)); if (!f) return; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
  const fw = dx * Math.sin(face) + dz * Math.cos(face), sd = dx * Math.cos(face) - dz * Math.sin(face); // push along / across the way it faces
  const R = rig.rc || (rig.rc = { p: 0, pv: 0, r: 0, rv: 0, t: 0, tv: 0, h: 0, hv: 0, on: 0 });
  R.pv += 7.8 * f * fw; R.rv += 5 * f * sd; R.tv += 3.6 * f * sd; R.hv -= 9 * f * fw - 1.6 * f; R.on = 1;
};
function reactStep(rig, dt, animal) {
  const R = rig.rc; if (!R || !R.on) return; dt = Math.min(dt, 0.05);
  R.pv += (-RXW * RXW * R.p - 2 * RXZ * RXW * R.pv) * dt; R.p += R.pv * dt; R.rv += (-RXW * RXW * 0.8 * R.r - 2 * RXZ * RXW * 0.9 * R.rv) * dt; R.r += R.rv * dt;
  R.tv += (-RXW * RXW * 0.64 * R.t - 2 * RXZ * RXW * 0.8 * R.tv) * dt; R.t += R.tv * dt; R.hv += (-RXWH * RXWH * R.h - 2 * RXZH * RXWH * R.hv) * dt; R.h += R.hv * dt;
  R.p = Math.max(-0.7, Math.min(0.7, R.p)); R.r = Math.max(-0.6, Math.min(0.6, R.r)); R.t = Math.max(-0.6, Math.min(0.6, R.t)); R.h = Math.max(-0.8, Math.min(0.8, R.h));
  if (Math.abs(R.p) + Math.abs(R.r) + Math.abs(R.t) + Math.abs(R.h) + 0.05 * (Math.abs(R.pv) + Math.abs(R.rv) + Math.abs(R.tv) + Math.abs(R.hv)) < 0.006) { R.on = 0; R.p = R.r = R.t = R.h = R.pv = R.rv = R.tv = R.hv = 0; return; }
  if (!animal) { add(rig, B.chest, R.p, R.t * 0.6, R.r, 1); add(rig, B.pelvis, -R.p * 0.3, -R.t * 0.2, -R.r * 0.3, 1); add(rig, B.head, R.h - R.p * 0.4, R.t * 0.4, R.r * 0.3, 1);
    add(rig, B.uArmL, -R.p * 0.9, 0, -R.r * 0.5, 1); add(rig, B.uArmR, -R.p * 0.9, 0, R.r * 0.5, 1); }
  else { add(rig, 0, R.p * 0.8, R.t * 0.5, R.r, 1); add(rig, 1, R.h * 1.1 - R.p * 0.3, 0, 0, 1); }
}
M.reactStep = reactStep;
/* v16.9 frame-time check on a real phone: open the game with ?perf=1 — a small line at the top shows the average frame time, how much
   of it the inertializer takes, and tapping it switches the inertializer off/on to compare. */
if (/[?&]perf\b/.test(location.search)) { M.timing = true; } // v17.1 P11: the overlay moved to js/perf.js
if (false) { const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:50%;top:4px;transform:translateX(-50%);z-index:99;font:11px/1.3 monospace;color:#fff;background:rgba(0,0,0,.6);padding:3px 8px;border-radius:6px;pointer-events:auto';
  let fr = 0, acc = 0, last = performance.now(); const tick = now => { fr++; acc += now - last; last = now;
    if (acc > 1000) { el.textContent = `프레임 ${(acc / fr).toFixed(1)}ms · 관성 ${(M.iStats.ms / fr).toFixed(3)}ms ${M.inertialOn ? '켬' : '끔'} (탭: 바꾸기)`; fr = 0; acc = 0; M.iStats.ms = 0; M.iStats.n = 0; }
    requestAnimationFrame(tick); }; requestAnimationFrame(tick); el.onpointerdown = e => { e.stopPropagation(); M.inertialOn = !M.inertialOn; }; document.body.appendChild(el); }
})(window.G);
