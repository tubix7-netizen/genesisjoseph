/* 약속의 길 — models: rigged humans & animals, procedural animation, environment props */
'use strict';
(function (G) {
const { GB, m4, m4trs, m4mul, rng, mixHex, clamp, lerp, spline, angDiff } = G;
const PI = Math.PI;

// =================================================================== RIG
const HY = 1.652, HZ = 0.006, HR = [0.098, 0.121, 0.11];                  // head centre & radii (adult, ~7 heads tall)
const KNP = [0, 1.535, 0.012], AHS = 1.19, /* v16.7 야숨 proportions: a bigger head (≈6.3 heads tall) */ KIDS = 1.2 * AHS;                   // head scale about the neck (adults / children)
const EYE_PY0 = 1.6465, MOUTH_PY0 = 1.5905, EYE_PY = KNP[1] + (EYE_PY0 - KNP[1]) * AHS, MOUTH_PY = KNP[1] + (MOUTH_PY0 - KNP[1]) * AHS; // blink / speech pivots
const HB = [ // name, parent, bind x,y,z
  ['pelvis', -1, 0, 0.95, 0], ['chest', 0, 0, 1.08, 0], ['head', 1, 0, 1.48, 0],
  ['uArmL', 1, 0.19, 1.41, 0], ['fArmL', 3, 0.2, 1.13, 0], ['uArmR', 1, -0.19, 1.41, 0], ['fArmR', 5, -0.2, 1.13, 0],
  ['thighL', 0, 0.095, 0.93, 0], ['shinL', 7, 0.095, 0.5, 0], ['thighR', 0, -0.095, 0.93, 0], ['shinR', 9, -0.095, 0.5, 0],
  ['handL', 4, 0.202, 0.86, 0.01], ['handR', 6, -0.202, 0.86, 0.01], ['back', 1, 0, 1.3, -0.17], ['cape', 1, 0, 1.46, -0.09],
  ['eyes', 2, 0, EYE_PY - 0.032, 0.09], ['mouth', 2, 0, MOUTH_PY - 0.032, 0.1], ['footL', 8, 0.085, 0.072, 0], ['footR', 10, -0.085, 0.072, 0]]; // v11: ankles, so feet roll and stay on the ground
const HBK = HB.map(b => b[0] === 'eyes' || b[0] === 'mouth' ? [b[0], b[1], 0, KNP[1] + ((b[0] === 'eyes' ? EYE_PY0 : MOUTH_PY0) - KNP[1]) * KIDS, b[4]] : b); // children (bigger head)
const B = {}; HB.forEach((b, i) => B[b[0]] = i);
class Rig {
  constructor(def) {
    this.def = def; const n = def.length; this.n = n;
    this.rot = new Float32Array(n * 3); this.scl = new Float32Array(n * 3).fill(1); this.off = [0, 0, 0];
    this.world = []; for (let i = 0; i < n; i++) this.world.push(m4());
    this.bones = new Float32Array(Math.max(n, 1) * 16); this.L = m4();
  }
  zero() { this.rot.fill(0); this.scl.fill(1); this.off[0] = this.off[1] = this.off[2] = 0; }
  update(M) {
    const d = this.def, L = this.L, sc = this.scl;
    for (let i = 0; i < this.n; i++) {
      const b = d[i], p = b[1];
      const tx = p < 0 ? b[2] + this.off[0] : b[2] - d[p][2], ty = p < 0 ? b[3] + this.off[1] : b[3] - d[p][3], tz = p < 0 ? b[4] + this.off[2] : b[4] - d[p][4];
      m4trs(L, tx, ty, tz, this.rot[i * 3 + 1], this.rot[i * 3], this.rot[i * 3 + 2], sc[i * 3], sc[i * 3 + 1], sc[i * 3 + 2]);
      m4mul(this.world[i], p < 0 ? M : this.world[p], L);
      const w = this.world[i], o = i * 16;
      for (let k = 0; k < 12; k++) this.bones[o + k] = w[k];
      this.bones[o + 12] = w[12] - (w[0] * b[2] + w[4] * b[3] + w[8] * b[4]);
      this.bones[o + 13] = w[13] - (w[1] * b[2] + w[5] * b[3] + w[9] * b[4]);
      this.bones[o + 14] = w[14] - (w[2] * b[2] + w[6] * b[3] + w[10] * b[4]);
      this.bones[o + 15] = 1;
    }
  }
  set(i, x, y, z) { this.rot[i * 3] = x; this.rot[i * 3 + 1] = y || 0; this.rot[i * 3 + 2] = z || 0; }
}

// =================================================================== HUMANOID
/* Stylised-realistic toon human (v4). Reference for the *craft* only — modern stylised action-adventure character
   sheets: ~7-head proportions, sculpted face with big readable eyes, hair built from tapered strands, and a layered
   costume (tunic with woven trim, under-sleeves, leather belt & buckle, cross strap and bag, bracers, wraps, boots).
   Every design here is our own biblical character. Built from parametric surfaces; limbs are continuous tubes whose
   joint rings blend between two bones. Facial features are thin decals that hug the sculpted head; the eye decals
   hang from the 'eyes' bone (scaled to blink) and the mouth from the 'mouth' bone (scaled to speak).
   Bind pose: facing +z, arms hanging, palms inward. Ground at y = 0, height ~1.79. */
function shade(c, k) { return mixHex(c, k > 0 ? 0xffffff : 0x000000, Math.abs(k)); }
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// v16: the neck read too long (a pillar between collar and jaw). Everything that rides on the head bones (head, hair, face, eyes,
// mouth, hats) sits NECK_DROP lower on adults; vertices blended between chest and head move by their head weight, so the neck
// itself shortens smoothly. The eye/mouth pivots move with them (see HB below).
const NECK_DROP = 0.032, HEADB = { 2: 1, 15: 1, 16: 1 }; // head, eyes, mouth (v16.1: was 11/12 = the hands, which left the eyes behind)
function shortenNeck(g, D) { const d = g.d; for (let i = 0; i < d.length; i += 11) { const v = d[i + 10]; let w;
  if (v < 32) w = HEADB[v] ? 1 : 0; else { const b0 = v % 32, b1 = Math.floor(v / 32) % 32, t = Math.floor(v / 1024) / 255; w = (HEADB[b0] ? 1 - t : 0) + (HEADB[b1] ? t : 0); }
  if (w) d[i + 1] -= D * w; } }
const BW = (b0, b1, w) => w <= 0.004 ? b0 : w >= 0.996 ? b1 : b0 + b1 * 32 + Math.round(w * 255) * 1024;
const jY = (bA, bB, yA, yB) => (x, y) => BW(bA, bB, sst(yA, yB, y));
const G2 = (x, s) => Math.exp(-x * x / (2 * s * s));
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vnrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const vcrs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// cloth weights: skirt follows the thigh on its side (less clipping when walking/sitting); capes & veils hang from a spring bone
const skirtBF = (hem, maxW) => (x, y, z) => { const L = x >= 0, w = clamp(1 - Math.abs(x - (L ? 0.095 : -0.095)) / 0.17, 0, 1) * sst(0.99, hem, y) * maxW; return BW(0, L ? 7 : 9, w); };
const capeBF = (yTop, yFull, maxW) => (x, y, z) => BW(1, 14, sst(yTop, yFull, y) * maxW * (z < 0.02 ? 1 : clamp(1 - (z - 0.02) * 12, 0, 1)));
const hoodBF = (x, y, z) => y > 1.47 ? BW(1, 2, sst(1.47, 1.6, y)) : BW(1, 14, sst(1.47, 1.15, y) * 0.75 * (z < 0 ? 1 : clamp(1 - z * 9, 0, 1)));
// Catmull-Rom curve through points (any dimension), t in [0,1]
function crv(pts) {
  const n = pts.length - 1;
  return t => { const f = clamp(t, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), s = f - i, s2 = s * s, s3 = s2 * s;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)], out = [];
    for (let k = 0; k < p1.length; k++) out.push(0.5 * (2 * p1[k] + (p2[k] - p0[k]) * s + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * s2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * s3));
    return out; };
}
// tapered strand along a path: elliptic section, w across (side), h along the reference normal (thickness)
function strand(g, path, ref, wf, hf, nu, nv, o) {
  return g.surf((u, v) => { const p = path(v), q1 = path(Math.min(1, v + 0.01)), q0 = path(Math.max(0, v - 0.01));
    const T = vnrm(vsub(q1, q0)), S = vnrm(vcrs(T, ref(p, v))), N = vcrs(S, T), a = u * 2 * PI, w = wf(v), h = hf(v), ca = Math.cos(a), sa = Math.sin(a);
    return [p[0] + S[0] * ca * w + N[0] * sa * h, p[1] + S[1] * ca * w + N[1] * sa * h, p[2] + S[2] * ca * w + N[2] * sa * h]; }, nu, nv, o);
}
// tapered capsule from point a to point b
function seg(g, a, b, r0, r1, o) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-4;
  const rx = Math.acos(clamp(dy / L, -1, 1)), ry = Math.atan2(dx, dz), fl = o.flat || 1, cv = o.curve || 0;
  return g.tube(y => { const t = y / L, r = r0 + (r1 - r0) * t; return [r, r * fl, 0, cv * Math.sin(t * PI) * L]; }, 0, L, o.nu || 6, o.nv || 3,
    Object.assign({}, o, { at: a, rx, ry, cap0: o.round === false ? 0 : r0 * 0.9, cap1: o.round === false ? 0 : Math.max(r1, 0.002) * 0.9, capN: 2 }));
}
// piecewise-linear remap (for putting more rows where detail lives)
const pwl = keys => x => { for (let i = 1; i < keys.length; i++) if (x <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return keys[keys.length - 1][1]; };
const AT_ROWS = pwl([[0, 0], [0.12, 0.17], [0.22, 0.3], [0.72, 0.6], [0.82, 0.7], [1, 1]]);
const PHI_COL = u => { const t = 2 * u - 1; return PI / 2 + PI * (0.32 * t + 0.68 * t * t * t); };

function humanoid(o, lod) {
  o = o || {}; const g = new GB(o.seed || 3), lv = lod || 0, lo = lv >= 1, lo2 = lv >= 2, Q = (a, b, c) => lv === 0 ? a : lv === 1 ? b : (c === undefined ? b : c);
  const skin = o.skin || 0xd29a6c, top = o.top === undefined ? 0xd9c9a6 : o.top, bot = o.bottom === undefined ? top : o.bottom;
  const hair = o.hair === undefined ? 0x2a1a12 : o.hair, sandal = o.sandal || 0x6a4a2e;
  const kid = !!o.kid, old = o.age === 'old' || (o.hair !== undefined && ((o.hair >> 16) & 255) > 0xb0 && ((o.hair >> 8) & 255) > 0xa8);
  const fem = o.fem !== undefined ? !!o.fem : o.headwear === 'veil';
  const topC = o.stripes ? (x, y) => o.stripes[Math.floor(y * 16 + 40) % o.stripes.length] : top;
  const botC = o.stripesB ? (x, y) => o.stripesB[Math.floor(y * 12 + 40) % o.stripesB.length] : bot;
  const legC = o.legs || skin, sleeveC = o.bare || o.sleeveless ? skin : topC, fw = fem ? 0.9 : 1, S0 = { j: 0 };
  const hw = o.headwear, hs = o.hairStyle || 'short', clothed = !o.bare;
  const trim = o.trim === undefined ? shade(typeof top === 'number' ? top : 0xd9c9a6, -0.42) : o.trim;
  const J = x => Object.assign({}, S0, x);
  // ---------------------------------------------------------------- face parameters
  /* sex-dimorphic build (v8): MUS 0..1.4 = male musculature (broad chest, traps, deltoids, biceps, thick neck, heavier jaw);
     BUST 0..1.2 = female figure (bust, narrow waist, wide hips). Override per look with o.build / o.bust. */
  const MUS = kid || fem ? 0 : (o.build === undefined ? (old ? 0.55 : 1) : o.build), BUST = fem && !kid ? (o.bust === undefined ? (old ? 0.7 : 1) : o.bust) : 0;
  const bustF = (a, y) => BUST ? 1 + 0.27 * BUST * G2(y - 1.258, 0.044) * (G2(a - 1.1, 0.34) + G2(a - 2.04, 0.34)) * (Math.sin(a) > 0 ? 1 : 0)
    : MUS ? 1 + 0.045 * MUS * G2(y - 1.315, 0.05) * (G2(a - 1.2, 0.45) + G2(a - 1.94, 0.45)) * (Math.sin(a) > 0 ? 1 : 0) + 0.03 * MUS * G2(y - 1.25, 0.08) * G2(Math.abs(Math.cos(a)) - 0.85, 0.2) : 1; // pecs + lats
  const strong = o.jaw === undefined ? 0.3 * MUS : o.jaw; // -1 delicate … +1 heavy jaw
  const ST = o.realFace ? 1 : old ? 0.9 : 0.74; // v12 stylisation (BotW-like): a smaller nose, softer brow and jaw, no hollow cheeks in the young
  const F = { nose: (kid ? 0.0092 : fem ? 0.0142 : 0.0205 + (old ? 0.0018 : 0)) * ST, noseW: (kid ? 0.6 : fem ? 0.72 : 1) * (0.5 + 0.5 * ST), brow: (fem || kid ? 0.45 : 1 + 0.3 * strong) * ST,
    chin: (kid ? 0.45 : fem ? 0.6 : 1 + 0.25 * strong) * (0.4 + 0.6 * ST), cheek: kid ? 0.5 : fem ? 0.8 : 1, hollow: kid || fem ? 0 : old ? 0.0026 : 0 };
  const YOUNG = !old && !o.realFace; // v16.3 미형: young faces get a smaller nose, softer brow ridge, flatter muzzle and smoother cheeks
  if (YOUNG) { F.nose *= fem ? 0.5 : 0.45; F.noseW *= 0.7; F.brow *= fem ? 0.8 : 0.72; F.chin *= fem ? 0.3 : 0.75; F.cheek *= fem ? 0.4 : 0.65; }
  const MUZ = YOUNG ? (fem ? 0.12 : 0.4) : 1;
  /* v17.0 얼굴 개성: every NPC gets small, fixed differences (eye size and spacing, eye tilt, brow angle, nose, chin, face and jaw
     width) from a hash of its look, so a crowd of pretty faces is not one face. Hand-designed faces opt out with vary: false. */
  const VARY = o.vary !== false && !o.realFace && (G.FACE || {}).vary !== 0, vKey = JSON.stringify([o.seed, o.skin, o.hair, o.top, o.trim, o.eye, o.hairStyle, o.fem, o.kid, o.beard, o.age]);
  const vh = k => { if (!VARY) return 0; let h = 2166136261 ^ k * 7919; for (let i = 0; i < vKey.length; i++) h = Math.imul(h ^ vKey.charCodeAt(i), 16777619); h ^= h >>> 13; h = Math.imul(h, 2654435761); h ^= h >>> 16; return (h >>> 0) / 4294967296 - 0.5; };
  F.nose *= 1 + vh(4) * 0.6; F.chin *= 1 + vh(7) * 0.5;
  const HSc = kid ? KIDS : AHS, SC = p => [KNP[0] + (p[0] - KNP[0]) * HSc, KNP[1] + (p[1] - KNP[1]) * HSc, KNP[2] + (p[2] - KNP[2]) * HSc];
  const HYs = y => KNP[1] + (y - KNP[1]) * HSc, HRs = HR.map(r => r * HSc), HZs = KNP[2] + (HZ - KNP[2]) * HSc;
  // ---------------------------------------------------------------- head shape
  /* The skull is a stack of horizontal sections (front-view width W, side-profile front zF / back zB, the z of the widest
     point zW, and superellipse exponents for the face half Ef and the back half Eb). Proportions follow a stylised-real
     head: ~0.65 width:height, eyes on the mid line, flat face plane (both eyes stay on the face in 3/4 view), cheekbones,
     a jaw that tapers to a defined chin, deep occiput. Features (brow, nose, lips, chin) are relief in face-plane coords. */
  const HP = kid ? { cw: 0.083, c2: 0.081, ck: 0.0775, jw: 0.0695, j2: 0.0605, j3: 0.049, chW: 0.034, ch2: 0.021, chinY: -0.106, zf: 0.087, Ef: 2.15 }
    : fem ? { cw: 0.0738, c2: 0.0722, ck: 0.0668, jw: 0.0578, j2: 0.0478, j3: 0.0372, chW: 0.0285, ch2: 0.017, chinY: -0.1055, zf: 0.0838, Ef: 2.45 } // v16.3 미형: shorter, softer chin; slimmer jaw
      : !o.realFace && !old ? { cw: 0.0778, c2: 0.0766, ck: 0.0722, jw: 0.0652 + 0.003 * strong, j2: 0.0578 + 0.003 * strong, j3: 0.0492 + 0.003 * strong, chW: 0.0352 + 0.003 * strong, ch2: 0.0232 + 0.002 * strong, chinY: -0.1075, zf: 0.0878, Ef: 2.3, jE: 1.9 } // v16.3 미형: a cleaner V-line // v12: young men — shorter, rounder lower face and a softer chin (BotW proportions)
      : { cw: 0.0795, c2: 0.0768, ck: 0.0712, jw: 0.0672 + 0.004 * strong, j2: 0.0592 + 0.004 * strong, j3: 0.0478 + 0.004 * strong, chW: 0.0338 + 0.004 * strong, ch2: 0.0222 + 0.003 * strong, chinY: -0.1305, zf: 0.0905, Ef: 2.5, jE: 2.15, long: 1 };
  HP.cw *= 1 + vh(5) * 0.08; HP.jw *= 1 + vh(6) * 0.12; HP.j2 *= 1 + vh(6) * 0.1; // v17.0 얼굴 개성: face and jaw width
  const CJ = old || o.realFace || kid ? 1 : fem ? 0.92 : 0.96;
  if (!old && !o.realFace && !kid) { const t = fem ? 0.9 : 0.87; HP.jw *= 0.94; HP.j2 *= t; HP.j3 *= t * 0.96; HP.chW *= t * 0.93; HP.ch2 *= t * 0.9; HP.chinY += fem ? 0.002 : 0.003; } // v16.7 미형: a slimmer, tapered lower face under the same skull
  if (!old && !o.realFace) { HP.Ef = fem || kid ? 2.02 : 2.08; if (HP.jE) HP.jE = 1.78; } // v16.5 보들보들: round (not boxy) cross-sections for young faces // v16.4: the chin sits back under the face instead of jutting forward
  const hk0 = [ // [y, W, zW, zF, zB, Ef, Eb] ascending y (chin -> crown)
    [HP.chinY, 0.002, 0.05, 0.062 * CJ, 0.046, 2, 2], [HP.chinY + 0.007, HP.ch2, 0.043, 0.074 * CJ, 0.026, 1.9, 2], [HP.long ? -0.1125 : -0.108, HP.chW, 0.03, 0.081 * CJ, 0.002, 1.75, 2],
    [HP.long ? -0.097 : -0.094, HP.j3, 0.012, HP.zf - 0.004, -0.024, 1.7, 2], [HP.long ? -0.082 : -0.08, HP.j2, -0.003, HP.zf - 0.003, -0.05, HP.jE ? 1.95 : 1.75, 2], [-0.066, HP.jw, -0.012, HP.zf - 0.002, -0.07, HP.jE || 1.85, 2.2],
    [-0.05, HP.ck, -0.009, HP.zf - 0.001, -0.083, HP.Ef - 0.4, 2.2], [-0.032, HP.c2, -0.007, HP.zf, -0.093, HP.Ef - 0.15, 2.2], [-0.012, HP.cw * 0.985, -0.007, HP.zf + 0.001, -0.1, HP.Ef, 2.15],
    [0.01, HP.cw, -0.008, HP.zf + 0.002, -0.105, HP.Ef, 2.1], [0.032, HP.cw * 0.995, -0.01, HP.zf - 0.001, -0.107, HP.Ef - 0.1, 2], [0.058, HP.cw * 0.96, -0.011, HP.zf - 0.007, -0.104, 2.3, 2],
    [0.083, HP.cw * 0.865, -0.012, HP.zf - 0.017, -0.097, 2.2, 2], [0.103, HP.cw * 0.715, -0.013, HP.zf - 0.032, -0.085, 2.1, 2], [0.117, HP.cw * 0.52, -0.014, HP.zf - 0.052, -0.066, 2, 2],
    [0.125, HP.cw * 0.3, -0.014, HP.zf - 0.08, -0.04, 2, 2], [0.1285, 0.0015, -0.014, -0.012, -0.016, 2, 2]];
  const HSP = spline(hk0), hY0 = hk0[0][0], hY1 = hk0[hk0.length - 1][0], NSEC = 400, SEC = new Float32Array((NSEC + 1) * 6);
  for (let i = 0; i <= NSEC; i++) { const r = HSP(hY0 + (hY1 - hY0) * i / NSEC); for (let k = 0; k < 6; k++) SEC[i * 6 + k] = r[k]; }
  const sec = (y, out) => { const f = clamp((y - hY0) / (hY1 - hY0), 0, 1) * NSEC, i = Math.min(NSEC - 1, Math.floor(f)), t = f - i;
    for (let k = 0; k < 6; k++) out[k] = SEC[i * 6 + k] * (1 - t) + SEC[i * 6 + 6 + k] * t; return out; };
  const SB = [0, 0, 0, 0, 0, 0], HCL = [0, -0.006, -0.008]; // ray origin (local, relative to [0, HY, HZ])
  const inHead = (x, y, z) => { if (y <= hY0 || y >= hY1) return false; sec(y, SB); const W = SB[0]; if (W < 0.0004) return false; const dz = z - SB[1], D = dz >= 0 ? SB[2] - SB[1] : SB[1] - SB[3];
    if (D <= 1e-4) return false; const E = dz >= 0 ? SB[4] : SB[5]; return Math.pow(Math.abs(x) / W, E) + Math.pow(Math.abs(dz) / D, E) < 1; };
  const rayCache = new Map();
  const headR = (dx, dy, dz) => { const key = (Math.round(dx * 2e4) + 30000) * 3.6e9 + (Math.round(dy * 2e4) + 30000) * 6e4 + Math.round(dz * 2e4) + 30000; let r = rayCache.get(key); if (r !== undefined) return r;
    let a = 0.04, b = 0.175; for (let i = 0; i < 19; i++) { const m = (a + b) / 2; if (inHead(HCL[0] + dx * m, HCL[1] + dy * m, HCL[2] + dz * m)) a = m; else b = m; } r = (a + b) / 2; rayCache.set(key, r); return r; };
  const hdir = (th, ph) => { const st = Math.sin(th); return [st * Math.cos(ph), -Math.cos(th), st * Math.sin(ph)]; };
  // point on the bare skull (local coords) + its ray direction
  const hbase = (th, ph) => { const d = hdir(th, ph), r = headR(d[0], d[1], d[2]); return [HCL[0] + d[0] * r, HCL[1] + d[1] * r, HCL[2] + d[2] * r, d]; };
  const frontness = (x, y, z) => { sec(y, SB); const D = SB[2] - SB[1]; return D > 1e-4 ? sst(0.25, 0.8, (z - SB[1]) / D) : 0; };
  // facial relief in face-plane coordinates (X across, Y up from the head centre), metres before head scaling
  const relief = (X, Y) => { const ax = Math.abs(X); let d = 0;
    d += 0.0032 * F.brow * G2(Y - 0.021, 0.0065) * G2(ax - 0.027, 0.019) + 0.0018 * G2(Y - 0.013, 0.008) * G2(X, 0.008);           // brow ridge + glabella
    d -= 0.0016 * G2(Y + 0.001, 0.0085) * G2(ax - 0.034, 0.0135);                                                                   // soft eye socket
    const tN = clamp((0.013 - Y) / 0.042, 0, 1), wN = 0.0042 + 0.0036 * tN;                                                        // nose: bridge -> tip -> base
    const hN = Y > -0.029 ? F.nose * (0.16 + 0.84 * Math.pow(tN, 1.7)) * sst(0.02, 0.009, Y) : F.nose * sst(-0.0385, -0.029, Y);
    d += hN * G2(X, wN) + 0.0042 * F.noseW * G2(Y + 0.0335, 0.0042) * G2(ax - 0.0098, 0.0042);
    d += 0.0034 * F.cheek * G2(Y + 0.019, 0.012) * G2(ax - 0.049, 0.013) - F.hollow * G2(Y + 0.053, 0.012) * G2(ax - 0.052, 0.012);  // cheekbones / hollows
    d += MUZ * (0.0046 * G2(Y + 0.058, 0.018) * G2(X, 0.021) + 0.0013 * G2(Y + 0.0565, 0.0034) * G2(X, 0.011) + (fem ? 0.0024 : 0.0019) * G2(Y + 0.0675, 0.0037) * G2(X, 0.0095)); // muzzle, lips
    d -= 0.0006 * G2(Y + 0.047, 0.005) * G2(X, 0.0022) + 0.0012 * G2(Y + (HP.long ? 0.081 : 0.079), 0.0045) * G2(X, 0.013);                            // philtrum, lip-chin groove
    d += 0.0046 * F.chin * G2(Y + (HP.long ? 0.103 : 0.099), 0.011) * G2(X, 0.015);                                                                     // chin
    return d; };
  const SC0 = p => SC([p[0], HY + p[1], HZ + p[2]]);
  // point on the sculpted head (with relief) / on a smooth shell k times the head (hair, headwear) + add along the ray
  const hp = (th, ph, add) => { const b = hbase(th, ph), d = b[3], fr = frontness(b[0], b[1], b[2]), off = relief(b[0], b[1]) * fr + (add || 0);
    return SC0([b[0] + d[0] * off, b[1] + d[1] * off, b[2] + d[2] * off]); };
  const hk = (th, ph, k, add) => { const d = hdir(th, ph), r = headR(d[0], d[1], d[2]) * k + (add || 0); return SC0([HCL[0] + d[0] * r, HCL[1] + d[1] * r, HCL[2] + d[2] * r]); };
  // face-plane (X, Y) -> (theta, phi) of the ray through the front surface at that spot
  const fp = (X, Y) => { sec(Y, SB); const W = SB[0], q = Math.min(0.995, Math.pow(Math.abs(X) / Math.max(W, 1e-4), SB[4])), z = SB[1] + (SB[2] - SB[1]) * Math.pow(1 - q, 1 / SB[4]);
    const dx = X - HCL[0], dy = Y - HCL[1], dz = z - HCL[2], l = Math.hypot(dx, dy, dz); return [Math.acos(clamp(-dy / l, -1, 1)), Math.atan2(dz, dx)]; };
  const dp = (X, Y, add) => { const t = fp(X, Y); return hp(t[0], t[1], add); };
  const HC = SC0(HCL);
  // ellipse that wraps the head section at local height y (bands, turbans, wig rims), world units: [rx, rz, cx, cz]
  const ring = (y, off) => { sec(y, SB); return [(SB[0] + off) * HSc, ((SB[2] - SB[3]) / 2 + off) * HSc, 0, KNP[2] + (HZ + (SB[2] + SB[3]) / 2 - KNP[2]) * HSc]; };
  // ---------------------------------------------------------------- torso (body)
  const m1 = MUS;
  const TOR = spline([
    [0.84, fem ? 0.135 : 0.125, 0.098, 0, -0.004, 2], [0.93, fem ? 0.176 : 0.15, fem ? 0.118 : 0.11, 0, fem ? -0.014 : -0.008, 2.2], [1.0, fem ? 0.163 : 0.148, 0.106, 0, -0.006, 2.2],
    [1.07, fem ? 0.11 : 0.134 + 0.003 * m1, fem ? 0.092 : 0.098, 0, -0.002, 2.2], [1.16, fem ? 0.122 : 0.145 + 0.007 * m1, fem ? 0.1 : 0.106 + 0.004 * m1, 0, 0.004, 2.3], [1.26, fem ? 0.138 : 0.163 + 0.009 * m1, fem ? 0.112 : 0.119 + 0.014 * m1, 0, 0.012, 2.4],
    [1.34, fem ? 0.146 : 0.175 + 0.01 * m1, fem ? 0.108 : 0.114 + 0.013 * m1, 0, 0.008, 2.6], [1.4, fem ? 0.144 : 0.172 + 0.012 * m1, 0.103 + 0.004 * m1, 0, 0, 2.8], [1.445, fem ? 0.112 : 0.13 + 0.016 * m1, 0.083 + 0.004 * m1, 0, -0.008, 2.6],
    [1.485, fem ? 0.06 : 0.07 + 0.008 * m1, 0.058, 0, -0.012, 2.1], [1.505, 0.052, 0.048, 0, -0.012, 2]]);
  const torR = (y, add) => { const r = TOR(y); return [r[0] + add, r[1] + add, r[2], r[3], r[4]]; };
  const waistBF = jY(0, 1, 0.99, 1.14);
  if (o.bare) g.tube(y => TOR(y), 0.86, 1.505, Q(22, 12, 8), Q(18, 8, 5), J({ c: (x, y, z) => shade(skin, -0.06 * G2(y - 1.21, 0.012) * (z > 0 ? 1 : 0) - 0.05 * sst(1.1, 0.9, y)), bf: waistBF, cap0: 0.04, mod: bustF, soft: 1 }));
  else g.tube(y => TOR(y), 1.3, 1.505, Q(16, 10, 6), 4, J({ c: skin, b: 1, soft: 1 }));
  // neck (slight forward lean, sternomastoid hint)
  const nk = !fem && !kid && !old && !o.realFace ? 0.86 : 1; // v13: a slimmer neck for the young (it read as a pillar)
  g.tube(y => [(fem ? 0.041 : kid ? 0.046 : 0.0525 + 0.006 * MUS) * nk, (fem ? 0.045 : kid ? 0.05 : 0.056 + 0.006 * MUS) * nk, 0, -0.012 + (y - 1.42) * 0.07], 1.43, 1.6, Q(16, 10, 6), Q(7, 3, 2), J({ c: (x, y, z) => { const tt = clamp((y - 1.44) / 0.15, 0, 1), xg = lerp(0.006, 0.03, tt);
      return shade(skin, (z < 0.03 && y < 1.56 ? -0.04 : -0.07 * sst(1.56, 1.6, y) * (z > 0 ? 1 : 0)) - (!fem && !kid ? 0.07 * G2(Math.abs(x) - xg, 0.005) * (z > 0.01 ? 1 : 0) * sst(1.44, 1.47, y) : 0)); }, bf: jY(1, 2, 1.47, 1.555), soft: 1 })); // v16.5 the neck is shaded like the face (no dark band under the chin)
  // ---------------------------------------------------------------- legs & feet
  const LEG = spline([[0.07, 0.025, 0.029, 0, -0.008], [0.12, 0.027, 0.031, 0, -0.006], [0.2, 0.035, 0.04, 0, -0.012], [0.3, 0.045, 0.051, 0, -0.018], [0.385, 0.043, 0.049, 0, -0.012],
    [0.455, 0.04, 0.043, 0, -0.002], [0.5, 0.045, 0.047, 0, 0.004], [0.56, 0.051, 0.053, 0, 0.006], [0.66, 0.06, 0.064, 0, 0.006], [0.78, 0.07, 0.073, 0, 0.004], [0.9, fem ? 0.082 : 0.078, 0.08, 0, -0.002], [0.97, 0.08, 0.082, 0, -0.004]]);
  for (const s of [1, -1]) {
    const T = s > 0 ? B.thighL : B.thighR, Sh = s > 0 ? B.shinL : B.shinR, Ft = s > 0 ? B.footL : B.footR, X = 0.095 * s, legX = y => X - s * (0.97 - y) * 0.013;
    const lk = kid ? 1.05 : fem ? 1.02 : 1.12 + 0.03 * MUS, calf = y => MUS * 0.005 * G2(y - 0.31, 0.06) + (fem ? 0.006 * G2(y - 0.86, 0.07) : 0), lr = (y, add) => { const r = LEG(y); return [r[0] * lk + add + calf(y), r[1] * lk + add + calf(y) * 1.2, legX(y), r[3]]; };
    const kneeBF = jY(T, Sh, 0.545, 0.455), robeLeg = clothed && !o.legs && !o.bare ? shade(typeof bot === 'number' ? bot : 0xb8a888, -0.3) : 0, robeY = o.long ? 0.44 : 0.6; // under-layer seen when a long robe parts in stride
    if (o.long && clothed && !o.legs) { // v12: under a long robe only the lower shin shows; the rest is a thin dark core that can never poke through the cloth
      const robeC = shade(typeof bot === 'number' ? bot : 0xb8a888, -0.06); // the hidden leg is dressed in the robe's cloth: a raised knee reads as drapery
      g.tube(y => lr(y, 0.012 * sst(0.12, 0.2, y)), 0.06, 0.34, Q(12, 8, 6), Q(6, 4, 3), J({ c: (x, y) => y > 0.15 ? robeC : legC, bf: kneeBF, cap1: 0.02, soft: o.legs ? 0 : 1 }));
      g.tube(y => { const r = lr(y, 0.02); return [r[0] * 1.05, r[1] * 1.05, r[2], r[3]]; }, 0.3, 0.97, Q(10, 8, 4), Q(8, 4, 3), J({ c: robeC, bf: kneeBF })); }
    else g.tube(y => lr(y, 0), 0.06, 0.97, Q(12, 8, 6), Q(16, 8, 5), J({ c: robeLeg ? (x, y) => y > robeY ? robeLeg : legC : legC, bf: kneeBF, cap1: 0.05, soft: o.legs ? 0 : 1 }));
    if (!lo2 && !(o.long && clothed && !o.legs)) g.sph(0.045 * lk, Q(8, 6), Q(5, 4), J({ at: [legX(0.5), 0.5, 0.016], s: [1, 1.1, 0.8], c: o.long && robeLeg ? robeLeg : legC, b: Sh, soft: o.legs ? 0 : 1 })); // knee cap
    // foot: heel -> arch -> ball -> toes
    const fx = legX(0.06), FT = spline([[-0.06, 0.028, 0.045], [-0.02, 0.034, 0.07], [0.04, 0.037, 0.066], [0.1, 0.045, 0.045], [0.15, 0.044, 0.028], [0.185, 0.03, 0.018]]);
    const footPt = (u, v, gr) => { const z = -0.06 + 0.245 * v, r = FT(z), a = u * 2 * PI, ca = Math.cos(a), sa = Math.sin(a); const end = Math.min(1, Math.min(v, 1 - v) * 9);
      const w = r[0] * Math.sqrt(end) + (gr || 0), h = r[1] * Math.sqrt(end) + (gr || 0); return [fx + ca * w * (sa < 0 ? 1.05 : 1), 0.004 + (sa > 0 ? sa * h : sa * 0.004), z]; };
    g.surf((u, v) => footPt(u, v, 0), Q(12, 8, 6), Q(10, 6, 4), J({ c: o.boots || legC, b: Ft, soft: o.boots || o.legs ? 0 : 1 }));
    if (o.boots) { // calf boots with folded cuff
      g.tube(y => lr(y, 0.009 + 0.006 * sst(0.3, 0.06, y)), 0.035, 0.36, Q(12, 8, 6), Q(6, 3, 2), J({ c: (x, y) => shade(o.boots, 0.05 * Math.sin(y * 40)), b: Sh }));
      g.tube(y => lr(y, 0.019), 0.33, 0.395, Q(12, 8, 6), 2, J({ c: shade(o.boots, 0.16), b: Sh, cap0: 0.006, cap1: 0.006, capN: 1 }));
      g.surf((u, v) => footPt(u, v, 0.008), Q(12, 8, 6), Q(10, 6, 4), J({ c: o.boots, b: Ft }));
      g.surf((u, v) => { const p = footPt(u, 0.5 + (v - 0.5) * 1.0, 0.011); return [p[0], Math.min(p[1], 0.012), p[2]]; }, Q(12, 8, 6), Q(6, 4, 3), J({ c: shade(o.boots, -0.45), b: Ft }));
    } else if (!o.barefoot) { // sandal: sole + toe, instep and ankle straps
      g.surf((u, v) => { const ph = u * 2 * PI, z = -0.065 + 0.255 * (0.5 + 0.5 * Math.sin(ph)), r = FT(z); const w = (r[0] + 0.006) * Math.abs(Math.cos(ph)) ** 0.8 * Math.sign(Math.cos(ph)) + 0.0001;
        return [fx + w, 0.002 + v * 0.013, z]; }, Q(16, 10, 6), 1, J({ c: shade(sandal, -0.22), b: Ft }));
      g.surf((u, v) => { const ph = u * 2 * PI, z = -0.065 + 0.255 * (0.5 + 0.5 * Math.sin(ph)) * (1 - v * 0.15) + v * 0.02, r = FT(z); const w = (r[0] + 0.006) * (1 - v * 0.9) * Math.sign(Math.cos(ph)) * Math.abs(Math.cos(ph)) ** 0.8;
        return [fx + w, 0.015, z]; }, Q(16, 10, 6), 1, J({ c: shade(sandal, 0.08), b: Ft, flip: true }));
      for (const [zz, ww, hh] of [[0.11, 0.05, 0.034], [0.035, 0.044, 0.064], [-0.01, 0.04, 0.07]]) g.tube(() => [ww, hh, fx, 0.0], -0.008, 0.008, Q(12, 8, 6), 1, J({ c: sandal, b: Ft, at: [0, 0.012, zz], rx: -PI / 2, a0: 0, al: PI }));
      g.tube(y => lr(y, 0.004), 0.085, 0.1, Q(12, 8, 6), 1, J({ c: sandal, b: Sh }));
    }
    if (o.legWrap && !o.boots) // cloth leg wraps (puttees) wound from ankle to below the knee
      g.tube(y => lr(y, 0.005 + 0.002 * Math.sin(y * 70)), 0.1, 0.42, Q(12, 8, 6), Q(16, 6, 3), J({ c: (x, y, z) => { const a = Math.atan2(z, x - legX(y)), q = (y * 26 + a / (2 * PI) * 1.0) % 1; return shade(o.legWrap, q < 0.2 ? -0.32 : q > 0.82 ? 0.1 : -0.04); }, b: Sh, cap1: 0.006, capN: 1 }));
  }
  // ---------------------------------------------------------------- garments: lower (skirt / kilt / robe) on pelvis
  {
    const hem = o.long ? 0.075 : o.kilt ? (o.kiltLong ? 0.4 : 0.6) : 0.47, flare = o.long ? 0.3 : o.kilt ? 0.24 : 0.265;
    const SK = spline(o.long ? [[0.075, flare, flare * 0.86], [0.35, 0.255, 0.215], [0.66, 0.218, 0.17], [0.9, 0.19, 0.132], [1.06, 0.162, 0.118]]
      : [[hem, flare, flare * 0.8], [hem + 0.2, flare - 0.03, flare * 0.8 - 0.035], [0.9, 0.19, 0.132], [1.06, 0.162, 0.118]]);
    const ph0 = (o.seed || 3) * 1.7;
    const fold = (a, v) => 1 + 0.032 * (1 - v) * Math.sin(a * 7 + ph0) + 0.012 * (1 - v) * Math.sin(a * 13 + 1) + 0.008 * Math.sin(a * 3);
    const hemY = a => hem + (o.long ? 0 : 0.01 * Math.sin(a * 2 + 1));
    const sk = (y, add) => { const r = SK(y), fk = fem ? lerp(0.9, 1.04, sst(0.45, 0.92, y)) : 1; let rx = r[0] * fk + (fem ? 0.005 : 0), rz = r[1];
      if (fem && !kid) { const w = sst(0.94, 1.055, y), t = TOR(Math.min(y, 1.06)); rx = lerp(rx, t[0] + 0.022, w); rz = lerp(rz, t[1] + 0.022, w); }
      return [rx + add, rz + add, 0, -0.004]; };
    const vOf = y => clamp((y - hem) / (1.06 - hem), 0, 1);
    const nvS = o.stripesB ? Q(Math.round((1.06 - hem) / 0.0065), 24, 10) : Q(10, 6, 3);
    const skCol = o.stripesB ? null : (u, v) => { const a = u * 2 * PI, f = fold(a, v) - 1; return shade(bot, clamp(f * 3.2, -0.2, 0.07) - 0.07 * sst(0.25, 0, v) - 0.06 * G2(v - 0.97, 0.03)); };
    g.tube(y => sk(y, 0), hemY, 1.06, Q(28, 14, 8), nvS, J({ c: botC, cuv: skCol, flatC: !!o.stripesB, bf: skirtBF(hem, o.long ? 0.42 : o.kilt ? 0.5 : 0.62), ds: true, inner: 0.38, mod: (a, y, v) => fold(a, v) }));
    if (!lo2 && clothed && !o.kilt) { // woven hem border (+ fine contrast line)
      const bh = o.long ? 0.05 : 0.04;
      g.tube(y => sk(y, 0.0035), hemY, a => hemY(a) + bh, Q(28, 14), 2, J({ c: (x, y) => o.trim2 && Math.abs(y - (hem + bh * 0.55)) < bh * 0.18 ? o.trim2 : trim, bf: skirtBF(hem, o.long ? 0.42 : 0.62), ds: true, inner: 0.4, mod: (a, y) => fold(a, vOf(y)) }));
    }
    if (o.kilt) g.tube(y => [0.06 - (0.9 - y) * 0.03, 0.01, 0, 0.17], 0.62, 1.0, 6, 3, J({ c: shade(bot, -0.1), b: 0, rx: -0.1 }));
  }
  // ---------------------------------------------------------------- garments: upper tunic
  const vNeck = !fem && !o.collar && !o.roundNeck;
  const neckTop = a => { const f = Math.max(0, Math.sin(a)); return 1.503 - 0.02 * f * f - (o.collar ? 0 : vNeck ? 0.085 * Math.pow(f, 18) : 0.05 * Math.pow(f, 10)); };
  const tunR = (y, add) => { const r = torR(y, add + 0.012 * G2(y - 1.115, 0.035)); return r; };
  if (clothed) {
    const nvT = o.stripes ? Q(Math.round(0.52 / 0.0065), 30, 12) : Q(16, 8, 4);
    const tfold = (a, y) => 0.014 * Math.sin(a * 9) * G2(y - 1.1, 0.045) + 0.006 * Math.sin(a * 5 + 1) * sst(1.3, 1.0, y);
    g.tube(y => tunR(y, 0.011), 0.985, neckTop, Q(24, 14, 8), nvT, J({ c: o.stripes ? topC : (x, y, z) => { const a = Math.atan2(z, x); return shade(top, clamp(tfold(a, y) * 6, -0.14, 0.05) - 0.08 * G2(y - 1.0, 0.025) - 0.05 * G2(Math.abs(x) - 0.15, 0.03) * G2(y - 1.3, 0.06)); }, flatC: !!o.stripes, bf: waistBF, mod: (a, y) => (1 + tfold(a, y)) * bustF(a, y) }));
    if (!lo2 && !o.collar) // neckline trim
      g.surf((u, v) => { const a = u * 2 * PI, y = neckTop(a) - 0.016 * (1 - v), r = tunR(y, 0.0135), e = 2 / r[4] - 1; return [Math.cos(a) * Math.pow(Math.abs(Math.cos(a)), e) * r[0], y, r[3] + Math.sin(a) * Math.pow(Math.abs(Math.sin(a)), e) * r[1]]; },
        Q(48, 24), 1, J({ c: trim, b: 1 }));
  }
  // belt / sash
  const beltC = o.belt || shade(typeof bot === 'number' ? bot : 0x8a6a48, -0.45);
  const band = (yc, hgt, add, col, bone) => g.tube(y => { const r = torR(y, add); return [r[0], r[1], r[2], r[3], 2.2]; }, yc - hgt / 2, yc + hgt / 2, Q(26, 14, 8), 2, J({ c: col, b: bone === undefined ? 0 : bone, cap0: 0.005, cap1: 0.005, capN: 1 }));
  if (o.sash) {
    band(1.06, 0.075, 0.02, o.sash);
    if (!lo2) { g.sph(0.026, 8, 6, J({ at: [0.085, 1.06, 0.105], s: [1.1, 0.9, 0.6], c: shade(o.sash, -0.08), b: 0 }));
      for (const k of [0, 1]) seg(g, [0.08 + k * 0.012, 1.05, 0.108], [0.09 + k * 0.035, 0.86 - k * 0.04, 0.12], 0.018, 0.012, J({ c: shade(o.sash, k * -0.08), b: 0, flat: 0.35, nu: 6, nv: 3 })); }
  }
  if (!o.sash || o.belt) {
    band(1.035, 0.042, o.sash ? 0.03 : 0.022, beltC);
    if (!lo2) { // bronze buckle + hanging end + pouch on the right hip
      const bz = torR(1.035, 0.03); g.box(0.042, 0.04, 0.008, J({ at: [0.035, 1.035, bz[1] + bz[3] + 0.004], c: 0xb08a3a, b: 0 })); g.box(0.024, 0.022, 0.006, J({ at: [0.035, 1.035, bz[1] + bz[3] + 0.007], c: shade(beltC, -0.1), b: 0 }));
      seg(g, [0.055, 1.03, bz[1] + bz[3] + 0.006], [0.07, 0.94, bz[1] + bz[3] + 0.012], 0.012, 0.011, J({ c: beltC, b: 0, flat: 0.3, nu: 5, nv: 2 }));
      if (!o.noPouch) { const px = -0.148, pz = 0.045; g.tube(() => [0.024, 0.042, 0, 0, 4], 0.925, 1.02, Q(14, 8), 2, J({ c: shade(o.bag || beltC, 0.12), b: 0, cap0: 0.012, cap1: 0.004, capN: 2, at: [px, 0, pz], ry: -0.35 }));
        g.tube(() => [0.027, 0.045, 0, 0, 4], 0.985, 1.025, Q(14, 8), 1, J({ c: shade(o.bag || beltC, -0.08), b: 0, cap0: 0.004, cap1: 0.004, capN: 1, at: [px, 0, pz], ry: -0.35 })); }
    }
  }
  // cross strap (right shoulder -> left hip) with a shepherd's bag, optional rolled cloak on the back
  if (o.bag || o.strap) {
    const sc = o.strap || shade(o.bag, -0.15), yc = 1.235, kk = 1.6;
    const loop = t => { const a = t * 2 * PI; let y = yc; for (let i = 0; i < 5; i++) { const r = tunR(y, 0.016); y = yc - kk * Math.cos(a) * r[0] * Math.abs(Math.cos(a)) ** (2 / r[4] - 1); y = clamp(y, 0.96, 1.47); }
      const r = tunR(y, 0.016), ca = Math.cos(a), sa = Math.sin(a), e = 2 / r[4] - 1, bk = bustF(a, y); return [ca * Math.abs(ca) ** e * r[0] * bk, y, r[3] + sa * Math.abs(sa) ** e * r[1] * bk]; };
    strand(g, loop, p => vnrm([p[0], 0, p[2]]), () => 0.018, () => 0.004, Q(4, 4, 3), Q(48, 24, 12), J({ c: sc, bf: jY(0, 1, 1.0, 1.12), ol: 0.6 }));
    if (o.bag && !lo2) { const bx = 0.185, by = 0.9, bz = 0.03; // bag with flap and buckle
      g.tube(() => [0.026, 0.068, bx, bz, 4], by, by + 0.12, Q(14, 8), 3, J({ c: o.bag, b: 0, cap0: 0.018, cap1: 0.006, capN: 2 }));
      g.tube(y => [0.031, 0.072, bx + 0.002, bz, 4], by + 0.065, by + 0.128, Q(14, 8), 2, J({ c: shade(o.bag, -0.16), b: 0, cap0: 0.006, cap1: 0.006, capN: 1 }));
      g.box(0.008, 0.022, 0.018, J({ at: [bx + 0.033, by + 0.07, bz], c: 0xb08a3a, b: 0 })); }
    if (o.roll && !lo2) { const a = [-0.11, 1.4, -0.175], b2 = [0.13, 1.1, -0.17];
      seg(g, a, b2, 0.044, 0.044, J({ c: (x, y, z) => shade(o.roll, 0.06 * Math.sin(x * 60 + y * 40)), b: 1, nu: Q(12, 8), nv: Q(6, 3), round: true }));
      for (const t of [0.22, 0.78]) { const p = [a[0] + (b2[0] - a[0]) * t, a[1] + (b2[1] - a[1]) * t, a[2] + (b2[2] - a[2]) * t]; seg(g, [p[0] - 0.012, p[1] - 0.016, p[2]], [p[0] + 0.012, p[1] + 0.016, p[2]], 0.048, 0.048, J({ c: sc, b: 1, nu: Q(12, 8), nv: 1, round: false })); } }
  }
  if (o.collar) g.tube(y => { const t = (y - 1.4) / 0.11, w = o.bare ? 0.26 : 0.2; return [w - t * (w - 0.08), w * 0.73 - t * (w * 0.73 - 0.065), 0, -0.012]; }, 1.4, 1.51, Q(24, 12), 3, J({ c: (x, y) => o.collar2 && y < 1.43 ? o.collar2 : (Math.floor(y * 60) % 3 === 0 ? shade(o.collar, -0.2) : o.collar), b: 1, ds: true }));
  else if (o.collar2) g.tube(() => [0.2, 0.15, 0, -0.012], 1.43, 1.46, Q(24, 12), 1, J({ c: o.collar2, b: 1, ds: true }));
  // ---------------------------------------------------------------- arms & hands
  const am = fem ? 0.86 : kid ? 0.95 : 1.06 + 0.05 * MUS;
  const ARM = spline([[0.888, 0.0175, 0.023, 0.2025, 0.004], [0.93, 0.024, 0.027, 0.2025, 0.002], [1.0, 0.033, 0.034, 0.202, -0.002], [1.065, 0.039, 0.038, 0.2, -0.004],
    [1.13, 0.035, 0.037, 0.2, -0.008], [1.19, 0.039, 0.042, 0.198, -0.002], [1.26, 0.044, 0.049, 0.196, 0.004], [1.33, 0.048, 0.052, 0.194, 0.002], [1.395, 0.054, 0.056, 0.193, -0.004], [1.44, 0.046, 0.05, 0.188, -0.006]]);
  for (const s of [1, -1]) {
    const U = s > 0 ? B.uArmL : B.uArmR, Fb = s > 0 ? B.fArmL : B.fArmR, H = s > 0 ? B.handL : B.handR;
    const armR = (y, add) => { const r = ARM(y), bi = MUS * (0.0065 * G2(y - 1.275, 0.05) + 0.0045 * G2(y - 1.065, 0.04)); return [r[0] * am + add + bi * 0.8, r[1] * am + add + bi * 1.25, r[2] * s, r[3] + bi * 0.35]; };
    const elbow = jY(U, Fb, 1.175, 1.085), armBF = (x, y, z) => y > 1.4 ? BW(U, 1, sst(1.4, 1.46, y) * 0.35) : elbow(x, y);
    const bareArm = !o.longSleeve || o.bare;
    g.tube(y => armR(y, 0), 0.875, bareArm ? 1.385 : 0.96, Q(12, 8, 6), Q(16, 8, 4), J({ c: (x, y) => o.gloves && y < 0.9 ? o.gloves : skin, bf: armBF, cap1: bareArm ? 0.012 : 0, cap0: 0.012, soft: 1 }));
    if (bareArm && !lo2 && !(clothed && o.under)) g.sph(0.034 * am, Q(8, 6), Q(5, 4), J({ at: [0.2 * s, 1.13, -0.012], s: [0.92, 1, 0.9], c: skin, b: Fb, soft: 1 })); // elbow
    if (clothed && o.under && !o.longSleeve) g.tube(y => armR(y, 0.007 + (y < 0.97 ? (0.97 - y) * 0.06 : 0)), 0.915, 1.39, Q(12, 8, 6), Q(12, 6, 3), J({ c: (x, y) => shade(o.under, 0.04 * Math.sin(y * 90)), bf: armBF, cap0: 0.004, capN: 1 }));
    if (clothed && !o.sleeveless) {
      const sleeveEnd = o.longSleeve ? 0.92 : 1.255;
      if (false) g.tube(y => armR(y, 0.007 + (y < 0.97 ? (0.97 - y) * 0.06 : 0)), 0.915, 1.42, Q(12, 8, 6), Q(12, 6, 3), J({ c: (x, y) => shade(o.under, 0.04 * Math.sin(y * 90)), bf: elbow, cap0: 0.004, capN: 1 }));
      g.tube(y => armR(y, 0.008 + (y < sleeveEnd + 0.1 ? (sleeveEnd + 0.1 - y) * 0.09 : 0)), sleeveEnd, 1.395, Q(o.mantleStripes ? 24 : 14, 10, 6), o.stripes ? Q(36, 14, 6) : Q(8, 4, 2), J({ c: o.mantleStripes ? (x, y, z) => o.mantleStripes[Math.floor((Math.atan2(z, x - 0.2 * s) / (2 * PI) + 0.5) * o.mantleStripes.length * 2) % o.mantleStripes.length] : topC, flatC: !!(o.stripes || o.mantleStripes), bf: armBF, ds: true, inner: 0.4 })); // v12: the coat's sleeves carry its stripes
      if (!lo2) g.tube(y => armR(y, 0.011 + (y < sleeveEnd + 0.1 ? (sleeveEnd + 0.1 - y) * 0.09 : 0)), sleeveEnd, sleeveEnd + 0.024, Q(14, 8), 1, J({ c: o.mantleTrim || trim, bf: armBF, ds: true, inner: 0.4 }));
    } else if (!bareArm) { }
    if (o.wraps && !lo2) { // leather bracer with wound cord
      g.tube(y => armR(y, 0.008 + 0.003 * sst(0.95, 1.05, y)), 0.905, 1.06, Q(12, 8), Q(10, 5), J({ c: (x, y, z) => { const a = Math.atan2(z, x - 0.2 * s), q = (y * 30 + a / (2 * PI) * s) % 1; return shade(o.wraps, q < 0.18 ? -0.28 : q > 0.88 ? 0.12 : 0); }, b: Fb, cap0: 0.005, cap1: 0.005, capN: 1 }));
    }
    { const shC = !clothed ? skin : !o.sleeveless ? (o.stripes ? (x, y, z, wx, wy) => topC(wx, wy) : top) : o.under || skin, ad = clothed && (!o.sleeveless || o.under) ? 0.008 : 0;
      const SHK = !old && !o.realFace ? (fem ? 0.82 : 0.9) : 1; // v16.6: slimmer, less puffy shoulders
      const shBF = (x, y) => BW(U, 1, clamp(sst(0.215, 0.12, Math.abs(x)) * 0.85 + sst(1.42, 1.47, y) * 0.2, 0, 0.9));
      g.sph(1, Q(14, 10, 8), Q(9, 6, 4), J({ at: [(0.187 + 0.006 * MUS) * s * (fem ? 0.96 : 1), 1.388 + 0.004 * MUS, -0.006], s: [(0.067 + ad) * am * (1 + 0.1 * MUS) * SHK, (0.047 + ad * 0.6 + 0.007 * MUS) * SHK, (0.06 + ad) * am * (1 + 0.12 * MUS) * SHK], rz: -0.38 * s, c: shC, bf: shBF, soft: shC === skin ? 0.5 : undefined }));
    }
    if (o.bands) g.tube(y => armR(y, 0.008), 1.2, 1.235, Q(12, 8), 1, J({ c: o.bands, b: U, cap0: 0.004, cap1: 0.004, capN: 1 }));
    if (o.goatskin) g.tube(y => armR(y, 0.017), 0.92, 1.06, Q(12, 8), 3, J({ c: 0x4a3b30, b: Fb, j: 0.12, mod: a => 1 + 0.12 * Math.abs(Math.sin(a * 5)), cap0: 0.01, cap1: 0.01 }));
    // hand: palm block + four curled fingers + thumb (palm faces the body)
    const hx = 0.2025 * s, hz = 0.008, hc = o.gloves || skin;
    if (lo) { g.surf((u, v) => { const th = v * PI, ph = u * PI * 2, sx = Math.sin(th) * Math.cos(ph), sz = Math.sin(th) * Math.sin(ph), sy = -Math.cos(th); const t = (sy + 1) / 2;
        return [hx + sx * 0.016 * am * (0.85 + 0.3 * t) - s * (1 - t) * (1 - t) * 0.02, 0.805 + sy * 0.065, hz + sz * (0.035 + 0.004 * Math.sin(t * PI)) * am]; }, Q(8, 7, 5), Q(6, 5, 3), J({ c: skin, b: H, soft: 1 })); }
    else {
      g.surf((u, v) => { const th = v * PI, ph = u * PI * 2, sx = Math.sin(th) * Math.cos(ph), sz = Math.sin(th) * Math.sin(ph), sy = -Math.cos(th);
        return [hx + sx * 0.0145 * am - s * 0.002 * (1 - sy), 0.846 + sy * 0.044, hz + sz * 0.036 * am * (1 - 0.15 * Math.max(0, sy))]; }, 10, 7, J({ c: hc, b: H }));
      const fz = [0.024, 0.0085, -0.0075, -0.0225], fl = [0.068, 0.076, 0.071, 0.057];
      for (let i = 0; i < 4; i++) { const z0 = hz + fz[i] * am, L = fl[i] * am, r0 = 0.0084 * am;
        const P = crv([[hx, 0.818, z0], [hx - s * 0.003, 0.818 - L * 0.45, z0 + 0.001], [hx - s * 0.011, 0.818 - L * 0.85, z0 + 0.002], [hx - s * 0.02, 0.818 - L * 1.02, z0 + 0.002]]);
        strand(g, P, () => [-s, 0, 0.0001], t => r0 * (1 - 0.25 * t) * (t > 0.9 ? Math.sqrt(Math.max(0, (1 - t) / 0.1)) * 0.9 + 0.1 : 1), t => r0 * 0.92 * (1 - 0.25 * t) * (t > 0.9 ? Math.sqrt(Math.max(0, (1 - t) / 0.1)) * 0.9 + 0.1 : 1), 6, 5,
          J({ c: (x, y) => o.gloves && y > 0.79 ? o.gloves : skin, b: H, soft: 1 })); }
      const TP = crv([[hx - s * 0.006, 0.868, hz + 0.024], [hx - s * 0.014, 0.842, hz + 0.042], [hx - s * 0.02, 0.815, hz + 0.05], [hx - s * 0.026, 0.796, hz + 0.05]]);
      strand(g, TP, () => [-s, 0, 0.0001], t => 0.0105 * am * (1 - 0.3 * t) * (t > 0.88 ? Math.sqrt(Math.max(0, (1 - t) / 0.12)) * 0.9 + 0.1 : 1), t => 0.0095 * am * (1 - 0.3 * t) * (t > 0.88 ? Math.sqrt(Math.max(0, (1 - t) / 0.12)) * 0.9 + 0.1 : 1), 6, 5, J({ c: skin, b: H, soft: 1 }));
    }
  }
  // ---------------------------------------------------------------- mantle (simlah) — heavy wool cloth over the shoulders, open at the front, deep folds
  if (o.mantle) {
    const mc = o.mantle, open = 0.5, mt = o.mantleTrim || shade(mc, -0.32), lenK = o.mantleShort ? 0.22 : 0;
    const MS = spline([[0.3, 0.31, 0.225, 0, -0.05], [0.7, 0.29, 0.205, 0, -0.045], [1.0, 0.278, 0.186, 0, -0.038], [1.22, 0.272, 0.168, 0, -0.03], [1.34, 0.274, 0.152, 0, -0.022],
      [1.395, 0.27, 0.142, 0, -0.018], [1.43, 0.243, 0.128, 0, -0.016], [1.457, 0.192, 0.11, 0, -0.016], [1.482, 0.138, 0.092, 0, -0.016], [1.505, 0.09, 0.075, 0, -0.016]]);
    const topY = a => 1.448 + 0.054 * Math.pow(Math.abs(Math.sin(a)), 3), botY = a => 0.42 + lenK + 0.075 * Math.sin(a) + 0.018 * Math.cos(a * 5);
    const mfold = (a, v) => { const b = a - PI * 1.5; return 1 + 0.07 * Math.pow(1 - v, 1.1) * Math.sin(b * 11 + 0.6) + 0.025 * (1 - v) * Math.sin(b * 5 + 1) + 0.05 * sst(0.86, 1, v); };
    const mstr = o.mantleStripes ? u => o.mantleStripes[Math.floor(u * o.mantleStripes.length * (o.mantleReps || 4)) % o.mantleStripes.length] : () => mc;
    const mcol = (u, v) => { const a = PI / 2 + open + u * (PI * 2 - open * 2), f = mfold(a, v) - 1 - 0.05 * sst(0.86, 1, v);
      return shade(mstr(u), clamp(f * 2.6, -0.2, 0.06) - (v < 0.05 ? 0.14 : 0) - 0.1 * sst(0.92, 1, v)); };
    g.tube(MS, botY, topY, o.mantleStripes ? Q(84, 42, 16) : Q(30, 14, 8), Q(16, 7, 4), J({ cuv: mcol, flatC: !!o.mantleStripes, a0: PI / 2 + open, al: PI * 2 - open * 2, ds: true, inner: 0.38, bf: capeBF(1.42, 0.85, 1), mod: (a, y, v) => mfold(a, v) }));
    if (!lo2) { const edge = (a, y, add) => { const r = MS(y), y0 = botY(a), y1 = topY(a), m = mfold(a, (y - y0) / (y1 - y0)); return [Math.cos(a) * (r[0] * m + add), y, r[3] + Math.sin(a) * (r[1] * m + add)]; };
      strand(g, t => { const a = PI / 2 + open + t * (PI * 2 - open * 2); return edge(a, topY(a) - 0.004, 0.008); }, p => vnrm([p[0], 0.5, p[2]]), () => 0.014, () => 0.012, 6, Q(30, 14), J({ c: shade(mc, -0.1), b: 1 }));
      const mbf = capeBF(1.42, 0.85, 1), da = 0.045; // woven border down both front edges and along the hem
      for (const a of [PI / 2 + open + da, PI * 2.5 - open - da]) strand(g, t => { const y = lerp(botY(a) + 0.006, topY(a) - 0.02, t); return edge(a, y, 0); }, p => vnrm([p[0], 0, p[2] + 0.016]), () => 0.016, () => 0.0055, 4, Q(16, 8),
        J({ c: mt, bf: mbf, ol: 0.5 }));
      strand(g, t => { const a = PI / 2 + open + da + t * (PI * 2 - open * 2 - da * 2); return edge(a, botY(a) + 0.02, 0); }, p => vnrm([p[0], 0, p[2] + 0.016]), () => 0.016, () => 0.0055, 4, Q(40, 18),
        J({ c: mt, bf: mbf, ol: 0.5 })); }
  }
  // ---------------------------------------------------------------- head
  const hb = 2, J2 = x => J(Object.assign({ b: hb }, x));
  const lipC = mixHex(skin, fem ? 0xc04a44 : 0xa8584a, fem ? 0.7 : 0.32);
  const headCol = (th, ph) => { const b = hbase(th, ph), X = b[0], Y = b[1], d = b[3], fr = frontness(b[0], b[1], b[2]), ax = Math.abs(X); let c = skin;
    c = mixHex(c, 0xe07a68, (fem || kid ? 0.3 : 0.07) * G2(Y + 0.024, 0.011) * G2(ax - 0.045, 0.014) * fr);                                  // cheeks
    c = mixHex(c, lipC, Math.min(1, (fem ? (old ? 0.85 : 0.42) : 0.55) * G2(Y + 0.0563, 0.0026) * G2(X, 0.0102) + (fem ? (old ? 0.95 : 0.5) : 0.6) * G2(Y + 0.0668, 0.0032) * G2(X, 0.0092)) * fr); // lips
    c = shade(c, -0.08 * G2(Y + 0.0385, 0.0028) * G2(X, 0.0085) * fr - 0.1 * sst(-0.55, -0.9, d[1]));                                     // under the nose, under the jaw
    return c; };
  /* v17.0 얼굴 그늘 (2차 연구 1장): the lighting normal of the head skin is blended toward a smooth ellipsoid around the skull, so
     nose, brow and eye-socket relief no longer paint blotchy shade; the shapes stay in the silhouette and the outline. */
  const FX = G.FACE || {}, NMIX = FX.nmix !== undefined ? FX.nmix : old || o.realFace ? 0.45 : 0.7;
  const EC = SC0([0, -0.004, -0.012]), ER = [HP.cw * HSc, 0.118 * HSc, 0.098 * HSc];
  const faceN = NMIX > 0 ? (p, n) => { let ex = (p[0] - EC[0]) / (ER[0] * ER[0]), ey = (p[1] - EC[1]) / (ER[1] * ER[1]), ez = (p[2] - EC[2]) / (ER[2] * ER[2]); const el = Math.hypot(ex, ey, ez) || 1;
    ex = n[0] + (ex / el - n[0]) * NMIX; ey = n[1] + (ey / el - n[1]) * NMIX; ez = n[2] + (ez / el - n[2]) * NMIX; const l = Math.hypot(ex, ey, ez) || 1; return [ex / l, ey / l, ez / l]; } : null;
  g.surf((u, v) => hp(PI * (lo ? v : AT_ROWS(v)), lo ? u * PI * 2 : PHI_COL(u)), Q(56, 24, 12), Q(56, 20, 10), J2({ cuv: (u, v) => headCol(PI * (lo ? v : AT_ROWS(v)), lo ? u * PI * 2 : PHI_COL(u)), soft: 1, nrm: faceN }));
  // ears: on the side of the skull between brow and nose base, leaning back a little
  for (const s of [1, -1]) {
    const eyL = -0.011, ES0 = sec(eyL, [0, 0, 0, 0, 0, 0]), ex = s * ES0[0] * 0.965, ez = ES0[1] - 0.013;
    g.surf((u, v) => { const a = u * 2 * PI, ca = Math.cos(a), sa = Math.sin(a), rim = 1 - 0.35 * v, dy = sa * 0.0265 * rim * (sa > 0 ? 1 : 0.82), dz = ca * 0.0155 * rim - 0.006 * v * (sa > 0 ? sa : 0);
      return SC0([ex + s * (0.0035 + 0.0065 * v) * (1 - Math.abs(sa) * 0.3), eyL + dy, ez + dz - 0.22 * dy]); }, Q(12, 8, 6), Q(3, 2, 1), J2({ c: skin, soft: 1, ds: true, inner: 0.22 }));
    if (!lo) g.surf((u, v) => { const a = u * 2 * PI, dy = Math.sin(a) * 0.016 * v - 0.002; return SC0([ex + s * 0.0085, eyL + dy, ez + Math.cos(a) * 0.0085 * v - 0.22 * dy]); }, 8, 1, J2({ c: shade(skin, -0.22), ol: 0, ds: true, inner: 0 }));
  }
  // ---- facial decals (eyes on the 'eyes' bone, mouth on the 'mouth' bone)
  const EB = 15, MB = 16;
  const eyeC = o.eye || [0x6e4426, 0x4a2c18, 0x7a5a2a, 0x5a4a30, 0x3a2414, 0x6a5038][Math.floor((vh(11) + 0.5) * 5.999)], /* v17.0: eye colour varies when not set */ lidC = o.lid || (fem ? 0x1a100c : 0x24160f), browC = o.brow || shade(hair, old ? 0.1 : -0.1);
  /* v16.9 미형 (얼굴미형 연구 보고서 1·2장): young eyes were 35% of the face width with a third of an eye between them. Only the young
     non-realFace adults change; kids, the old and realFace keep their v16.8 values. */
  const YA = !old && !o.realFace && !kid; // young adult, stylised face
  const EYE2 = (G.FACE || {}).eye !== undefined ? !!G.FACE.eye : !old && !o.realFace; // v17.0 눈 (2차 연구 2장): anime eye drawing for young stylised faces (kids too)
  const ES0 = (kid ? 1.2 : fem ? 1.1 : old ? 0.9 : 1.27) * (o.realFace ? 1 : old ? 1.06 : 1.16); // v16.8 value (kids, old, realFace)
  const KID2 = kid && (G.FACE || {}).kid !== 0; // v17.0 아이 미형: kids' eyes were 34% of the face with only a fifth of an eye between them
  const ES = (YA ? (fem ? 1.04 : 1.12) : KID2 ? 1.3 : ES0) * (1 + vh(1) * 0.14); // v17.0: kids 1.39 -> 1.3 (eye/face ~0.31 — a little bigger than adults' 0.27); ±4% per person // v16.9 미형: 연구 보고서 2-1 — ES 남 1.47→1.12, 여 1.28→1.04 (표의 1.10은 여성 얼굴이 좁아 눈÷얼굴 0.30이 되어 목표 0.27에 맞춤)
  const huK = !old && !o.realFace ? (fem ? 0.97 : YA ? 1.0 : 1.2) : 1; // v16.9 미형: 연구 보고서 2-1 — 젊은 남성 위 눈꺼풀 추가 배율 1.2→1.0
  const riK = o.realFace ? 1 : old ? 1.07 : KID2 ? 1.45 : !YA ? (fem ? 1.14 : 1.3) : fem ? 1.2 : 1.4; // v17.0: kids' iris 1.3 -> 1.45 (big, glassy irises in a smaller eye) // v16.9 미형: 연구 보고서 2-1 — 홍채 남 1.3→1.4, 여 1.14→1.2
  const MALE = !fem && !kid; const E = { x: (MALE ? 0.0333 : 0.0338) * (kid ? 0.97 : 1), y: !old && !o.realFace ? -0.0048 : -0.003, w: (MALE ? 0.0187 : 0.0198) * ES, hu: (fem || kid ? 0.0126 : 0.0109) * ES * (o.narrow ? 0.78 : 1) * huK, hl: 0.0071 * ES * (!old && !o.realFace ? 0.92 : 1), tilt: (o.tilt === undefined ? (!old && !o.realFace ? 0.0022 : 0.0012) : o.tilt), ri: (MALE ? 0.0111 : 0.0116) * ES * riK };
  if (YA) E.x = fem ? 0.0372 : 0.038; if (KID2) E.x = 0.0425; E.x *= 1 + vh(2) * 0.1; if (o.tilt === undefined) E.tilt += vh(3) * 0.0034; E.hu *= 1 + vh(9) * 0.3; // round or narrow eyes // v17.0: kid spacing 0.19 -> ~0.7 eye; per-person spacing and tilt // v16.9 미형: 연구 보고서 2-1 — 미간 남 0.0362→0.038, 여 0.0352→0.0372 (표의 0.036은 미간÷눈 0.65라 목표 0.8에 맞춤)
  if (G.faceLog) G.faceLog.push({ fem, kid, old, real: !!o.realFace, ES, Ex: E.x, Ew: E.w, W: sec(E.y, [0, 0, 0, 0, 0, 0])[0], W2: sec(-0.011, [0, 0, 0, 0, 0, 0])[0] }); // dev: face proportions (set G.faceLog = [] before building a look)
  if (!lo2) for (const s of [1, -1]) {
    const top = x => { const q = (x - 0.12 * E.w) / (1.06 * E.w); return E.hu * Math.pow(Math.max(0, 1 - q * q), 0.62) + E.tilt * x / E.w; };
    const botf = x => { const q = x / E.w; return -E.hl * Math.pow(Math.max(0, 1 - q * q), 0.85) + E.tilt * x / E.w * 0.45; };
    const P = (x, y, add) => dp(s * (E.x + x), E.y + y, add);
    const XU = u => s * (E.w - 2 * E.w * u); // u runs toward -X so decals face outward
    const nuE = lo ? 6 : 12;
    g.surf((u, v) => { const x = XU(u); return P(x, botf(x) + (top(x) - botf(x)) * v, 0.0017); }, nuE, lo ? 2 : 4, J2({ b: EB, ol: 0, cuv: (u, v) => mixHex(0xfbf7f0, 0xc9bdb2, sst(0.5, 1, v) * 0.85) }));
    const ic = [E.w * 0.04, fem || kid ? 0.0004 : -0.0004], clampE = (x, y) => { x = clamp(x, -E.w * 0.97, E.w * 0.97); return [x, clamp(y, botf(x) + 0.00025, top(x) - 0.0001)]; };
    const disc = (cx, cy, rx, ry, add, col, nu, nv) => g.surf((u, v) => { const a = -s * u * 2 * PI, q = clampE(cx + Math.cos(a) * rx * v, cy + Math.sin(a) * ry * v); return P(q[0], q[1], add); }, nu, nv, J2({ b: EB, ol: 0, cuv: col }));
    const irisDark = shade(eyeC, -0.5), irisLite = shade(eyeC, !old && !o.realFace ? 0.75 : 0.45); // v16.4: glassier, brighter irises on young faces
    disc(ic[0], ic[1], E.ri * 0.93, E.ri, 0.0023, EYE2 ? (u, v) => { const a = -s * u * 2 * PI, sy = Math.sin(a); if (v > 0.88) return shade(eyeC, -0.65); // v17.0 눈 (2차 연구 2장): dark top under the lid -> clear lower crescent
      let c = mixHex(irisDark, eyeC, clamp(0.55 - sy * 0.9, 0, 1)); c = mixHex(c, shade(eyeC, 0.9), 0.9 * sst(-0.05, -0.7, sy) * sst(0.25, 0.62, v)); return mixHex(c, shade(eyeC, -0.72), 0.65 * sst(0.4, 0.85, sy)); }
      : (u, v) => { const a = -s * u * 2 * PI, sy = Math.sin(a); return v > 0.86 ? shade(eyeC, -0.6) : mixHex(mixHex(irisDark, irisLite, clamp(0.45 - sy * 0.75 * v, 0, 1)), eyeC, 0.25); }, lo ? 8 : 16, lo ? 2 : 4);
    disc(ic[0], ic[1] - 0.0004, E.ri * 0.42, E.ri * 0.46, 0.0028, () => 0x0e0807, lo ? 6 : 10, 1);
    const HK = EYE2 ? 1.3 : 1; // v17.0 눈: a bigger key catch-light (same spot, so the lid does not hide it), a small fill one low on the other side
    if (!lo) { disc(ic[0] + s * 0 + 0.0042, ic[1] + 0.0042, 0.0026 * ES * HK, 0.0022 * ES * HK, 0.0033, () => 0xffffff, 8, 1); disc(ic[0] - 0.0036, ic[1] - 0.004, 0.0011 * HK, 0.0011 * HK, 0.0033, () => 0xe8f0ff, 6, 1); }
    // upper lid line (thick, with a slight flick past the outer corner), lower lid, crease, brow
    const TK = EYE2 ? 1.55 : 1; // v17.0 눈: a bolder upper lash line (thin at the inner corner, heaviest toward the outer third)
    const tk = x => { const q = (x + E.w) / (2.1 * E.w); return (0.0013 + (fem ? 0.0028 : 0.0022) * Math.pow(Math.sin(PI * clamp(q * 0.9 + 0.1, 0, 1)), 0.7) * (EYE2 ? 0.75 + 0.6 * q : 1)) * TK + (x > E.w * 0.6 ? (x - E.w * 0.6) * (fem ? 0.11 : 0.06) * (EYE2 ? 1.2 : 1) : 0); };
    const topX = x => x <= E.w ? top(Math.max(-E.w, x)) : top(E.w) + (x - E.w) * 0.42;
    g.surf((u, v) => { const xl = E.w * 1.14 - u * E.w * 2.17; return dp(s * (E.x + xl), E.y + topX(xl) - 0.0005 + v * tk(xl), 0.0036); }, lo ? 6 : 14, 1, J2({ b: EB, ol: 0, c: lidC, flip: s < 0 }));
    if (fem && !lo) for (const k of [0, 1]) { const x0 = E.w * (0.8 + k * 0.22), y0 = topX(x0) + tk(x0) * 0.7; // lashes at the outer corner
      g.surf((u, v) => dp(s * (E.x + x0 + u * 0.0045), E.y + y0 + u * 0.0026 + v * 0.0009 * (1 - u), 0.0037), 3, 1, J2({ b: EB, ol: 0, c: lidC, flip: s > 0 })); }
    if (!lo) {
      const LL = EYE2 ? 0.85 : 1.3; // v17.0 눈: the lower lash line only on the outer half, lighter, so the eye stays open
      g.surf((u, v) => { const xl = E.w * 1.0 - u * E.w * LL; return dp(s * (E.x + xl), E.y + botf(xl) + 0.0002 - (1 - v) * (0.0005 + 0.0006 * (1 - u)), 0.0034); }, 8, 1, J2({ b: EB, ol: 0, c: mixHex(skin, 0x3a2018, EYE2 ? 0.5 : 0.62), flip: s < 0 }));
      g.surf((u, v) => { const xl = E.w * 0.95 - u * E.w * 1.35; return dp(s * (E.x + xl), E.y + top(xl) + 0.0046 + v * 0.0007, 0.0022); }, 8, 1, J2({ c: shade(skin, -0.2), ol: 0, flip: s < 0 }));
    }
    const ba = o.browAng === undefined ? 0.35 + vh(8) * 0.7 : o.browAng, bth = 1 + vh(10) * 0.6; // v17.0: per-person brow angle // >0: inner end lower (determined), <0: worried
    g.surf((u, v) => { const xl = E.w * 1.22 - u * E.w * 2.3, q = (xl + E.w * 1.08) / (E.w * 2.3), arc = 0.0026 * Math.pow(Math.sin(PI * clamp(q * 0.85 + 0.1, 0, 1)), 0.8) - ba * 0.0032 * (1 - q);
      const th = bth * (0.0052 - 0.0028 * q) * (old ? 1.35 : fem ? 0.58 : kid ? 0.8 : !o.realFace ? 0.9 : 1.18); return dp(s * (E.x + xl), E.y + E.hu + (fem ? 0.0088 : kid ? 0.0078 : !old && !o.realFace ? 0.0085 : 0.0064) + arc + v * th, 0.0026); }, lo ? 5 : 10, 1, J2({ c: browC, ol: 0, flip: s < 0 }));
    if (old && !lo) for (const k of [0, 1]) // crow's feet
      g.surf((u, v) => { const xl = E.w * 1.25 + u * 0.008; return dp(s * (E.x + xl), E.y + 0.001 - k * 0.0035 + u * (k ? -0.003 : 0.002) + v * 0.0006, 0.0006); }, 4, 1, J2({ c: shade(skin, -0.22), ol: 0, flip: s > 0 }));
  }
  if (!lo2) {
    // mouth: a dark opening on the speech bone (rest scale ~0.16 reads as a line) + soft nose shadow
    const MY = MOUTH_PY0 - HY, mw = (fem ? 0.0118 : kid ? 0.011 : 0.0136) * (!old && !o.realFace ? (fem ? 0.98 : 0.84) : 1), sm = o.smile === undefined ? 0.0006 : o.smile * 0.0014;
    const mh = !old && !o.realFace && fem ? 0.0036 : 0.0058, sm2 = sm + (!old && !o.realFace && fem ? 0.0011 : 0); // v16.5: a soft closed smile, not an 「o」
    g.surf((u, v) => { const a = -u * 2 * PI, x = Math.cos(a) * mw * v, y = Math.sin(a) * mh * v * (Math.sin(a) > 0 ? 0.75 : 1) + sm2 * (x / mw) * (x / mw); return dp(x, MY + y, 0.002); }, lo ? 8 : 14, lo ? 1 : 2, J2({ b: MB, ol: 0, cuv: (u, v) => v > 0.75 ? mixHex(0x4a1e1a, lipC, 0.25) : 0x3a1412 }));
    if (!lo) {
      g.surf((u, v) => { const a = -u * 2 * PI; return dp(Math.cos(a) * 0.0072 * v, -0.0355 + Math.sin(a) * 0.0016 * v, 0.0016); }, 10, 1, J2({ c: shade(skin, -0.13), ol: 0 }));
      if (old) for (const s of [1, -1]) g.surf((u, v) => dp(s * (0.017 + 0.006 * v + u * 0.0008), -0.03 - 0.03 * v, 0.0005), 1, 5, J2({ c: shade(skin, -0.2), ol: 0, flip: s < 0 }));
    }
  }
  // ---------------------------------------------------------------- hair: a voluminous mass + thick tapered clumps
  /* Stylised hair reads as a few big overlapping "chunks" with sharp tips: a mass shell stands 1-2.5 cm off the scalp for
     volume, clumps break up the surface and the silhouette, bangs fall in V-tips over the brow, sideburns in front of the ear. */
  const hairTh = (ph, front, side, back) => { const f = Math.sin(ph), fa = Math.sign(f) * Math.pow(Math.abs(f), 0.8); return f > 0 ? side + (front - side) * fa : side + (side - back) * fa; };
  const HAIR2 = (G.FACE || {}).hair !== undefined ? !!G.FACE.hair : !old && !o.realFace; // v17.0 머리카락 (2차 연구 3장)
  const hcRoot = shade(hair, -0.26), hcTip = shade(hair, HAIR2 ? 0.17 : 0.06), hcHi = shade(hair, old ? 0.14 : HAIR2 ? 0.42 : 0.32); // v17.0: lighter tips + a brighter shine band
  const lockCol = (tone, hi) => (u, v) => { const inner = Math.sin(u * 2 * PI) < 0; let c = v < 0.3 ? mixHex(hcRoot, hair, v / 0.3) : mixHex(hair, hcTip, (v - 0.3) / 0.7);
    if (hi !== undefined && !inner) c = mixHex(c, hcHi, 0.6 * G2(v - hi, 0.07)); return shade(c, tone + (inner ? -0.12 : 0)); };
  let lockN = 0;
  const lock3 = (pts, w, h, opt) => { opt = opt || {}; lockN++; const tone = opt.tone !== undefined ? opt.tone : ((lockN * 37) % 9 - 4) * 0.012, sh = opt.sharp || 2.2;
    const wf = opt.clump ? t => w * (0.9 + 0.24 * Math.sin(PI * Math.min(1, t * 1.25))) * (1 - Math.pow(t, sh)) : t => w * (0.72 + 0.5 * Math.sin(PI * Math.min(1, t * 1.15))) * (1 - Math.pow(t, sh));
    const hf = opt.clump ? t => h * (1 - 0.72 * Math.pow(t, 1.4)) : t => h * (1 - Math.pow(t, 1.6));
    strand(g, crv(pts), opt.ref || (p => vnrm(vsub(p, HC))), wf, hf, Q(opt.nu || 6, 4, 3), Q(opt.nv || 7, 4, 3),
      J({ cuv: lockCol(tone, opt.hi), bf: opt.bf, b: opt.b === undefined ? hb : opt.b, ol: opt.ol === undefined ? 0.22 : opt.ol, soft: 0.45 })); };
  const lockS = (pts, w, h, opt) => lock3(pts.map(([at, ph, k]) => hk(at * PI, ph, k)), w, h, opt); // points in (at, phi, k) head space
  const hairOn = hs !== 'bald' && hw !== 'nemes' && hw !== 'cap';
  const covered = hw === 'veil' || hw === 'cloth' || hw === 'turban';
  const curly = hs === 'curly' || hs === 'wild', wild = hs === 'wild', tied = hs === 'tied', longH = hs === 'long' || hs === 'braid', bun = hs === 'bun';
  const VOL = curly ? (wild ? 0.021 : 0.017) : tied ? 0.0075 : bun ? 0.0065 : longH ? 0.0095 : 0.0125;
  const vol = (at, ph) => { const top = sst(0.62, 0.95, at), back = Math.max(0, -Math.sin(ph)); return VOL * (0.72 + 0.38 * top + 0.15 * back) + (kid ? 0.0025 : 0) + (tied ? 0.0045 * top * Math.max(0, Math.sin(ph)) : 0); };
  const earBump = ph => Math.max(G2(angDiff(ph, -0.16), 0.3), G2(angDiff(ph, PI + 0.16), 0.3));
  const thMin = ph => (hairTh(ph, hs === 'wig' ? 0.71 : tied ? 0.745 : 0.735, 0.5, longH || bun ? 0.27 : 0.3) + 0.078 * earBump(ph)) * PI;
  const offAt = (th, ph, skin0) => { const tm = thMin(ph); return lerp(skin0, vol(th / PI, ph), sst(tm - 0.1, tm + 0.07, th)); };
  // a clump from (at0, ph0) to (at1, ph1) along the hair mass; `over` lifts the path over the crown (front -> back sweeps)
  const clumpD = (a0, p0, a1, p1, c) => { c = c || {}; const d0 = hdir(a0 * PI, p0), d1 = hdir(a1 * PI, p1), n = c.n || 7, pts = [], sk = c.skin === undefined ? 0.0055 : c.skin;
    for (let i = 0; i <= n; i++) { const t = i / n; let d = [lerp(d0[0], d1[0], t), lerp(d0[1], d1[1], t) + (c.over || 0) * Math.sin(PI * t), lerp(d0[2], d1[2], t)]; d = vnrm(d);
      const th = Math.acos(clamp(-d[1], -1, 1)), ph = Math.atan2(d[2], d[0]);
      const off = (c.fixed !== undefined ? c.fixed : offAt(th, ph, sk) * (i === 0 ? 0.5 : 1)) + (c.lift === undefined ? 0.003 : c.lift) * Math.sin(PI * t) + (c.flick || 0) * t * t * t;
      pts.push(hk(th, ph, 1, off + (c.layer || 0))); }
    if (c.tail) for (const q of c.tail) pts.push(q);
    lock3(pts, c.w || 0.036, c.h || 0.0095, { clump: true, nv: c.nv || 10, sharp: c.sharp || 2.6, hi: c.hi, tone: c.tone, bf: c.bf, nu: 6 }); };
  const part = ((o.seed || 3) % 2 ? 1 : -1) * 0.13;
  const BL = [0, 0.03, -0.012, 0.042, 0.008, -0.004, 0.034, 0.016, 0.026]; // v17.0: uneven bang lengths (no even crown of spikes)
  const bangs = (n, len, spread, c) => { for (let i = 0; i < n; i++) { const q = n > 1 ? i / (n - 1) - 0.5 : 0, ph = PI / 2 + q * spread;
    clumpD(0.9, PI / 2 + part + q * 0.7, len + (HAIR2 ? BL[(i + (part > 0 ? 3 : 0)) % BL.length] : i % 2 ? 0.022 : 0) + (Math.abs(q) > 0.4 ? 0.035 : 0), ph - part * 0.35 + q * (HAIR2 ? 0.22 : 0.1),
      Object.assign({ w: 0.033 + (i % 2) * 0.006, layer: 0.0035, lift: 0.006, hi: 0.32, skin: 0.0058, sharp: 2.2 }, c)); } };
  const LB = (x, y) => y > 1.47 ? BW(1, 2, sst(1.42, 1.56, y)) : BW(1, 14, sst(1.47, 1.2, y) * 0.6); // long hair below the head follows chest + cape spring
  if (hairOn && !covered && hs !== 'wig') {
    // mass shell (lod2 shows only this)
    g.surf((u, v) => { const ph = u * 2 * PI, t0 = thMin(ph), th = t0 + (PI - t0) * v; return hk(th, ph, 1, 0.0012 + vol(th / PI, ph) * sst(0, 0.16, v) * (lo2 ? 0.85 : 0.92)); }, Q(32, 16, 8), Q(12, 7, 4),
      J2({ cuv: (u, v) => { const ph = u * 2 * PI, at = (thMin(ph) + (PI - thMin(ph)) * v) / PI; let c = mixHex(hcRoot, hair, sst(0, 0.35, v)); c = mixHex(c, hcHi, (HAIR2 ? 0.7 : 0.45) * G2(at - 0.8, HAIR2 ? 0.028 : 0.035) * Math.max(0, Math.sin(ph + 0.3))); return c; }, soft: 0.45 })); // v17.0: a crisper shine ring
    if (!lo2) {
      const nk = lo ? 0.5 : 1, N = n => Math.max(3, Math.round(n * nk));
      if (tied) { // swept back over the crown into a knot at the nape, loose strands framing the face
        const nT = N(13);
        for (let i = 0; i < nT; i++) { const q = i / (nT - 1) - 0.5, ph = PI / 2 + q * 2.75;
          clumpD(thMin(ph) / PI + 0.01, ph, 0.46, 1.5 * PI + q * 0.5, { over: 0.42 + 0.5 * (0.5 - Math.abs(q)), w: 0.042, h: 0.0105, lift: 0.005, n: 9, nv: 12, hi: 0.28, sharp: 3.5 }); }
        const kn = hk(0.44 * PI, 1.5 * PI, 1, vol(0.44, 1.5 * PI) + 0.012);
        g.sph(0.024, Q(9, 6), Q(7, 4), J2({ at: kn, s: [1.2, 1, 0.95], c: hcRoot })); g.tube(() => [0.026, 0.022, kn[0], kn[2] - 0.004], kn[1] - 0.008, kn[1] + 0.008, Q(10, 6), 1, J2({ c: o.tie || 0x6a4428 }));
        for (let i = 0; i < 4; i++) { const dx = (i - 1.5) * 0.009;
          lock3([[kn[0] + dx, kn[1] + 0.004, kn[2] + 0.004], [kn[0] + dx * 1.4, kn[1] - 0.035, kn[2] - 0.026], [kn[0] + dx * 1.8, kn[1] - 0.085, kn[2] - 0.03], [kn[0] + dx * 2.2 + 0.004 * (i % 2), kn[1] - 0.14, kn[2] - 0.016 + i * 0.003]], 0.026, 0.009,
            { clump: true, sharp: 2.4, nv: 7, ref: p => [0, 0, -1], bf: (x, y) => y > 1.5 ? hb : BW(1, 2, sst(1.42, 1.55, y)) }); }
        for (const s of [1, -1]) { // face-framing locks from the part to the jaw, and a short one at the temple
          clumpD(0.8, PI / 2 + s * 0.62, 0.44, PI / 2 + s * 0.98, { w: 0.026, h: 0.008, layer: 0.004, lift: 0.004, skin: 0.0055, hi: 0.3, sharp: 2.2, n: 6 });
          clumpD(0.84, PI / 2 + s * 0.3, 0.62, PI / 2 + s * 0.62, { w: 0.026, h: 0.0078, layer: 0.0045, lift: 0.005, skin: 0.0058, sharp: 2, n: 6 }); }
        clumpD(0.9, PI / 2 + part, 0.63, PI / 2 + part * 1.9, { w: 0.03, h: 0.0085, layer: 0.0045, lift: 0.007, skin: 0.006, hi: 0.3 });
      } else if (longH || bun) {
        // top: from a centre part down to the sides and back
        const nT = N(16);
        for (let i = 0; i < nT; i++) { const q = i / nT, ph = PI / 2 + 0.25 + q * (2 * PI - 0.5), side = Math.sin(ph) > 0 ? 1 : 0.6;
          clumpD(0.97, PI / 2 + (Math.cos(ph) > 0 ? 0.05 : -0.05), bun ? 0.62 : (thMin(ph) / PI - 0.03) * side + 0.4 * (1 - side), ph, { w: 0.04, h: 0.0095, n: 8, lift: 0.004, hi: 0.3, sharp: 3 }); }
        bangs(N(4), 0.62, 0.95, { w: 0.036 });
        if (bun) { const bc = hk(0.66 * PI, 1.5 * PI, 1, vol(0.66, 1.5 * PI) + 0.035); g.sph(0.05, Q(10, 7), Q(8, 5), J2({ at: bc, s: [1.05, 0.95, 0.9], c: hair }));
          for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * PI; lock3([[bc[0] + Math.cos(a) * 0.034, bc[1] + Math.sin(a) * 0.034, bc[2] - 0.03], [bc[0] + Math.cos(a + 1) * 0.05, bc[1] + Math.sin(a + 1) * 0.05, bc[2] - 0.018], [bc[0] + Math.cos(a + 2) * 0.03, bc[1] + Math.sin(a + 2) * 0.03, bc[2] - 0.046]], 0.026, 0.009, { clump: true, nv: 6, ref: p => vnrm(vsub(p, bc)) }); } }
        else { // long curtain down the back + locks in front of the shoulders
          const nB = N(9);
          for (let i = 0; i < nB; i++) { const q = i / (nB - 1) - 0.5, ph = 1.5 * PI + q * 2.5, p0 = hk(0.42 * PI, ph, 1, vol(0.42, ph) + 0.002), ox = p0[0] * 1.08, oz = p0[2];
            clumpD(0.96, PI / 2 + 0.6 * Math.sign(-q || 1), 0.42, ph, { w: 0.044, h: 0.01, n: 7, lift: 0.004, sharp: 6, nv: 14, bf: LB,
              tail: [[ox * 1.04, p0[1] - 0.09, oz - 0.012], [ox * 1.03, p0[1] - 0.2, oz - 0.03], [ox * 0.98, p0[1] - 0.31 + 0.02 * (i % 2), oz - 0.02]] }); }
          for (const s of [1, -1]) { const p0 = hk(0.5 * PI, PI / 2 + s * 1.05, 1, vol(0.5, PI / 2 + s * 1.05)), lx = p0[0], so = Math.sign(lx);
            clumpD(0.88, PI / 2 + s * 0.3, 0.5, PI / 2 + s * 1.05, { w: 0.034, h: 0.009, layer: 0.003, n: 6, sharp: 6, nv: 12, bf: LB,
              tail: [[lx + so * 0.014, p0[1] - 0.07, p0[2] + 0.012], [lx + so * 0.024, p0[1] - 0.15, p0[2] + 0.03], [lx + so * 0.022, p0[1] - 0.23, p0[2] + 0.045]] }); }
          if (hs === 'braid') for (let i = 0; i < 6; i++) g.sph(0.03 - i * 0.003, 8, 5, J({ at: [0, 1.36 - i * 0.055, -0.135 - i * 0.004], c: i % 2 ? hair : hcRoot, b: 1 }));
        }
      } else { // short / curly / wild: chunks radiating from the crown whorl
        const cw0 = 1.5 * PI + 0.35;
        const nBk = N(curly ? 11 : 9);
        for (let i = 0; i < nBk; i++) { const q = i / (nBk - 1) - 0.5, ph = 1.5 * PI + q * 3.3;
          clumpD(0.9, cw0 + q * 0.8, thMin(ph) / PI - (curly ? 0.035 : 0.02) - (wild ? 0.05 * ((i * 7) % 3) / 2 : 0), ph, { w: curly ? 0.04 : 0.044, h: 0.0105, flick: curly ? 0.012 : 0.005, lift: 0.004, sharp: curly ? 2 : 2.6 }); }
        for (const s of [1, -1]) { const nS = N(4);
          for (let i = 0; i < nS; i++) { const ph = PI / 2 - s * (0.62 + i * 0.36);
            clumpD(0.9, PI / 2 - s * (0.35 + i * 0.3), thMin(ph) / PI - 0.03 - (wild ? 0.04 : 0), ph - s * 0.12, { w: 0.038, h: 0.0098, layer: 0.001, flick: curly ? 0.01 : 0.0035, lift: 0.004, hi: 0.4, sharp: curly ? 2 : 2.5 }); } }
        const nTop = N(curly ? 9 : 7);
        for (let i = 0; i < nTop; i++) { const ph = cw0 + PI + (i / nTop) * 2 * PI;
          clumpD(0.985, ph + 0.4, curly ? 0.76 : 0.79, ph, { w: curly ? 0.04 : 0.042, h: 0.01, layer: 0.002, lift: curly ? 0.008 : 0.005, flick: curly ? 0.008 : 0, hi: 0.5, sharp: 2.4 }); }
        bangs(N(curly ? 7 : 6), kid ? 0.6 : 0.615, curly ? 1.45 : 1.3, curly ? { flick: 0.006, w: 0.036 } : {});
        if (!curly && !lo && !HAIR2) for (const sd of [1, -1]) clumpD(0.84, PI / 2 + sd * 0.7, kid ? 0.56 : 0.575, PI / 2 + sd * 0.93, { w: 0.022, h: 0.0072, layer: 0.003, lift: 0.003, skin: 0.0056, hi: 0.35, sharp: 2.1, n: 6 }); // v16.7 a soft lock at each temple framing the face
        if (HAIR2 && !lo) for (const sd of [1, -1]) { // v17.0 머리카락: a long lock down each side of the face to the cheek (frames it, the face reads smaller)
          clumpD(0.84, PI / 2 + sd * 0.82, kid ? 0.46 : 0.45, PI / 2 + sd * 1.2, { w: 0.03, h: 0.008, layer: 0.002, lift: 0.002, skin: 0.0056, hi: 0.4, sharp: 2.4, n: 7, nv: 12 });
          clumpD(0.8, PI / 2 + sd * 1.05, kid ? 0.5 : 0.49, PI / 2 + sd * 1.36, { w: 0.026, h: 0.008, layer: 0.0015, lift: 0.002, skin: 0.0056, hi: 0.4, sharp: 2.2, n: 6 }); }
      }
    }
  }
  if (hairOn && hs === 'wig') {
    const r0 = ring(0.05, 0.022), wy = HYs(HY + 0.05);
    { const yb = 1.53, span = wy + 0.04 - yb; // v16.7 softer bob: swells gently, then tucks under at the hem; fine low-contrast braids
    const prof = y => { const t = clamp((wy + 0.04 - y) / span, 0, 1), d = Math.max(0, wy - y); return 0.012 + Math.sqrt(d * 0.06) * 0.21 + 0.006 * Math.sin(PI * t) - 0.011 * sst(0.82, 1, t); };
    /* v17.0 가발 옆머리: the side panels used to start 41deg from the front and stand 2-4 cm off the cheek, so in 3/4 and profile
       they hid the face. Now the opening is wider (~60deg), the front edge tucks in toward the face like a lock framing it,
       and the panel reads as hair (a shine band, slightly lighter ends) instead of a flat black slab. */
    const WOP = (G.FACE || {}).wig === 0 ? 0.72 : 1.04, wigE = a => sst(WOP + 0.5, WOP, Math.abs(angDiff(a, PI / 2)));
    const wigMod = (G.FACE || {}).wig === 0 ? null : (a, y) => 1 - 0.13 * wigE(a) * sst(wy + 0.03, wy - 0.05, y), wHi = shade(hair, 0.3), wy0 = wy - 0.035;
    g.tube(y => [r0[0] + prof(y), r0[1] + prof(y) * 0.95 + 0.002, 0, r0[3] - 0.012], a => yb + 0.008 * Math.cos(a * 2), wy + 0.04, Q(28, 12), Q(6, 4), J2({ c: (x, y) => { const k = 0.5 + 0.5 * Math.sin(y * 520);
      return wigMod ? mixHex(shade(hair, 0.035 * k + 0.1 * sst(wy - 0.06, yb, y)), wHi, 0.35 * G2(y - wy0, 0.012)) : shade(hair, 0.035 * k); }, a0: PI / 2 + WOP, al: PI * 2 - 2 * WOP, mod: wigMod, ds: true, inner: 0.4, soft: 0.45 })); }
    g.surf((u, v) => { const ph = u * 2 * PI, th = 0.56 * PI + 0.44 * PI * v; return hk(th, ph, 1, 0.016); }, Q(28, 14), Q(10, 5), J2({ c: (x, y) => shade(hair, 0.03 * (0.5 + 0.5 * Math.sin(y * 520))), soft: 0.45 })); // v13: the crown comes down over the panels so the wig is one piece
  }
  if (covered && hs !== 'bald' && !lo2) { // hair peeking from under head coverings
    if (hw === 'veil') { const pw = 0.8; // neatly parted hair framing the brow under the veil + a wisp at each temple
      g.surf((u, v) => { const dph = (0.5 - u) * 2 * pw, aLow = 0.712 - 0.09 * Math.pow(Math.abs(dph) / pw, 1.5), at = aLow + (0.81 - aLow) * v; return hk(at * PI, PI / 2 + dph, 1, 0.0034 + 0.0042 * Math.sin(Math.min(1, v * 1.4) * PI * 0.5)); },
        Q(18, 10), Q(5, 3), J2({ cuv: (u, v) => { const dph = (0.5 - u) * 2 * pw; let c = mixHex(hair, hcRoot, 0.7 * G2(dph - part * 0.25, 0.035) + 0.3 * (1 - v)); c = mixHex(c, hcHi, 0.5 * G2(v - 0.55, 0.14) * (1 - G2(dph - part * 0.25, 0.08))); return shade(c, 0.035 * Math.sin(dph * 46)); }, soft: 0.45, ol: 0.5 }));
      for (const s of [1, -1]) clumpD(0.74, PI / 2 + s * 0.56, 0.585, PI / 2 + s * 0.74, { w: 0.017, h: 0.0048, skin: 0.0052, lift: 0.002, n: 5, nv: 6, sharp: 2 }); }
    else if (!fem) {       const nN = hw === 'turban' ? (lo ? 4 : 7) : 0; for (let i = 0; i < nN; i++) { const ph = 1.5 * PI + (i / (nN - 1) - 0.5) * 1.8; clumpD(0.5, ph, 0.3, ph + (i % 2 ? 0.08 : -0.08), { w: 0.034, h: 0.009, skin: 0.006, n: 4, nv: 6, flick: 0.006, sharp: 2 }); } }
  }
  // ---------------------------------------------------------------- beard (shell + pointed locks + moustache)
  if (o.beard) {
    const bc = o.beardCol || hair, long = o.beard === 'long', thHi = ph => 0.305 * PI + 0.125 * PI * sst(0.22, 1.15, Math.abs(ph - PI / 2)) + 0.008 * PI * Math.sin(ph * 23);
    g.surf((u, v) => { const ph = PI / 2 - 1.42 + u * 2.84, th = 0.03 + (thHi(ph) - 0.03) * v; const tp = hp(th, ph, 0.0035 + 0.004 * Math.sin(ph * 9) * Math.sin(th * 5) * (1 - v));
      return tp; }, Q(24, 12, 6), Q(8, 4, 2), J2({ cuv: (u, v) => { const ph = PI / 2 - 1.42 + u * 2.84, side = sst(0.5, 1.2, Math.abs(ph - PI / 2)); let c = mixHex(shade(bc, -0.2), bc, Math.min(1, v * 1.4)); return mixHex(c, mixHex(bc, skin, 0.3), sst(0.8, 1, v) * (0.3 + 0.4 * side)); }, ds: true }));
    if (!lo2) {
      const n = lo ? 5 : 11;
      for (let i = 0; i < n; i++) { const ph = PI / 2 + (i / (n - 1) - 0.5) * 2.5, base = hp(0.2 * PI, ph, 0.003), mid = Math.abs(ph - PI / 2) < 0.5;
        const L = long ? (mid ? 0.2 : 0.11) * (1 - 0.3 * Math.abs(ph - PI / 2)) : 0.035 + (mid ? 0.02 : 0.005);
        lock3([hp(0.28 * PI, ph, 0.002), base, [base[0] * 0.92, base[1] - L * 0.55, base[2] + 0.012], [base[0] * 0.8, base[1] - L, base[2] + (long ? 0.03 : 0.006)]], long ? 0.034 : 0.026, 0.01,
          { ref: p => vnrm([p[0], -0.2, p[2] - HZ]), cuvTone: 0, b: long ? undefined : hb, bf: long ? jY(1, 2, 1.38, 1.5) : undefined, sharp: 1.6, nv: long ? 7 : 4, tone: -0.05 }); }
      for (const s of [1, -1]) lock3([dp(s * 0.002, -0.041, 0.004), dp(s * 0.014, -0.0445, 0.0045), dp(s * 0.026, -0.05, 0.004), dp(s * 0.034, -0.058, 0.003)], 0.0085, 0.0042, { ref: p => vnrm(vsub(p, HC)), nv: 6, sharp: 1.4 }); // moustache
    }
  }
  // ---------------------------------------------------------------- headwear
  const headBand = (atF, atB, hwA, add, thick, col, opt) => { opt = opt || {}; const k = opt.k || 1;
    g.surf((u, v) => { const ph = u * 2 * PI, ac = atF + (atB - atF) * (0.5 - 0.5 * Math.sin(ph)), at = ac + (v - 0.5) * 2 * hwA; return hk(at * PI, ph, k, add + thick * Math.sin(v * PI)); },
      Q(opt.nu || 36, 18, 10), Q(4, 2, 2), J2({ c: typeof col === 'number' ? col : 0xffffff, cuv: typeof col === 'function' ? col : undefined, ol: opt.ol === undefined ? 0.5 : opt.ol })); };
  const hood = (p) => { // cloth head covering: cap over the skull + drape that frames the face and falls to the shoulders/back
    const k = p.k, col = p.col, thJ = 0.24 * PI, split = 0.55;
    const fa0 = p.folds || 0.075, fq0 = p.fq || 9;
    const fshade = (u, v, c) => { if (v >= split) return c; const ph = PI / 2 + p.open + u * (PI * 2 - p.open * 2), tt = Math.pow(1 - v / split, 0.8), f = fa0 * Math.sin(ph * fq0 + 0.5) * tt + 0.025 * Math.sin(ph * 17 + 2) * tt * tt;
      return shade(c, clamp(f * 2.4, -0.17, 0.05) - 0.1 * G2(v / split - 0.02, 0.04)); };
    const cuv = p.cuv || (typeof col !== 'number' ? null : p.stripe ? (u, v) => { const q = v / split; return fshade(u, v, (q > 0.07 && q < 0.12) || (q > 0.17 && q < 0.2) ? p.stripe : col); } : (u, v) => fshade(u, v, col));
    const thCap = ph => hairTh(ph, p.capF, p.capS, p.capB);
    g.surf((u, v) => { const ph = u * PI * 2, t0 = thCap(ph), th = t0 + (PI - t0) * v; return hk(th, ph, k + (v < 0.08 ? -0.012 * (1 - v / 0.08) : 0) + 0.02 * Math.pow(v, 3) + 0.035 * Math.max(0, -Math.sin(ph)) * Math.sin(v * PI), 0.004); }, Q(24, 12, 8), Q(8, 5, 3),
      J2({ c: typeof col === 'number' ? col : 0xffffff, cuv: p.capCuv }));
    g.surf((u, v) => {
      const ph = PI / 2 + p.open + u * (PI * 2 - p.open * 2), f = Math.sin(ph), back = Math.max(0, -f), cz = p.cz || -0.02;
      if (v >= split) { const tt = (v - split) / (1 - split), th = thJ + (thCap(ph) + 0.08 - thJ) * tt; return hk(th, ph, k + 0.008, 0.004); }
      const Jp = hk(thJ, ph, k + 0.008, 0.004), yB = Jp[1] - (p.Ls + (p.Lb - p.Ls) * Math.pow(back, p.backPow || 0.8)) + 0.025 * Math.sin(ph * 5 + 1), pin = 1 - (p.pinch || 0) * (f > 0 ? f * f * f : 0);
      const cph = Math.cos(ph), shx = p.wS * pin, shz = p.wB, yS = Math.max(yB, 1.445 - (p.sideDrop || 0) * cph * cph), fl = p.flare || 0, t = 1 - v / split, yy = Jp[1] + (yB - Jp[1]) * t;
      if (yy >= yS) { const s = (Jp[1] - yy) / Math.max(1e-4, Jp[1] - yS), e = 1 - (1 - s) * (1 - s); return [lerp(Jp[0], Math.cos(ph) * shx, e), yy, lerp(Jp[2], cz + f * shz, e)]; }
      const s = (yS - yy) / Math.max(1e-4, yS - yB), fa = p.folds || 0.075, w = 1 + fa * Math.sin(ph * (p.fq || 9) + 0.5) * Math.pow(s, 0.8) + 0.03 * Math.sin(ph * 4) * s + 0.025 * Math.sin(ph * 17 + 2) * s * s;
      return [Math.cos(ph) * (shx + fl * s) * w, yy, cz + f * (shz + fl * 0.6 * s) * w];
    }, Q(26, 14, 8), Q(15, 8, 4), J({ c: typeof col === 'number' ? col : 0xffffff, cuv, ds: true, inner: 0.3, bf: hoodBF }));
    if (p.band && !lo2) headBand(p.capF / PI - 0.045, p.capF / PI + 0.05, 0.028, 0.006, 0.006, p.band, { k: k + 0.006 });
  };
  if (hw === 'cloth') hood({ k: 1.14, capF: 0.735 * PI, capS: 0.42 * PI, capB: 0.38 * PI, open: 0.78, Ls: 0.15, Lb: 0.36, wS: 0.24, wB: 0.135, flare: 0.012, pinch: 0.3, sideDrop: 0.035, backPow: 1.1, col: o.clothCol || 0xe9dfc8, stripe: o.clothStripe, band: o.bandCol || 0x3a2a22 });
  if (hw === 'veil') hood({ k: 1.13, capF: 0.77 * PI, capS: 0.5 * PI, capB: 0.4 * PI, open: 0.86, Ls: 0.3, Lb: 0.58, wS: 0.252, wB: 0.128, flare: 0.012, pinch: 0.46, sideDrop: 0.05, backPow: 1.6, folds: 0.1, fq: 11, col: o.clothCol || 0xe9dfc8, stripe: o.clothStripe, band: o.headband });
  if (hw === 'nemes') { const nm = (u, v) => (Math.floor(v * 14) % 2 ? 0xd9a73a : 0x2c5aa0);
    hood({ k: 1.15, capF: 0.74 * PI, capS: 0.45 * PI, capB: 0.4 * PI, open: 0.72, Ls: 0.32, Lb: 0.26, wS: 0.24, wB: 0.13, flare: 0.01, pinch: 0.42, col: 0xd9a73a, cuv: nm, capCuv: (u, v) => (Math.floor(v * 7) % 2 ? 0xd9a73a : 0x2c5aa0) });
    seg(g, SC([0, HY + 0.085, 0.15]), SC([0, HY + 0.135, 0.145]), 0.014, 0.004, J2({ c: 0xe8bb3a, nu: 5, nv: 2 })); }
  if (hw === 'turban') { // a puffy wound mass + broad crossing wraps + a thin cord
    const tc = o.clothCol || 0xe9dfc8;
    g.surf((u, v) => { const ph = u * PI * 2, th = 0.61 * PI + 0.39 * PI * v; return hk(th, ph, 1, 0.016 + 0.012 * Math.sin(Math.min(1, v * 1.6) * PI * 0.5) + 0.004 * Math.sin(ph * 6) * (1 - v)); }, Q(28, 14, 8), Q(9, 5, 3), J2({ c: shade(tc, -0.06) }));
    const nW = lo ? 2 : 4;
    for (let i = 0; i < nW; i++) { const lowF = i % 2 === 0, aF = 0.635 + i * 0.045 + (lowF ? 0 : 0.03), aB = 0.69 + i * 0.045 - (lowF ? 0 : 0.03);
      headBand(aF, aB, 0.042, 0.02 + i * 0.0025, 0.009, (u, v) => shade(tc, 0.05 * Math.sin(u * 2 * PI * 7 + i * 1.7) * (0.5 + v) + (i % 2 ? 0.035 : -0.015) - 0.07 * G2(v - 0.04, 0.06)), { ol: 0.4 }); }
    if (o.bandCol) headBand(0.655, 0.715, 0.011, 0.031, 0.003, o.bandCol, { ol: 0.3 }); }
  if (hw === 'cap') g.tube(y => { const t = (y - HYs(HY)) / 0.3, r = ring(0.02, 0.012); return [r[0] + t * 0.03, r[1] + t * 0.03, 0, r[3]]; }, HYs(HY + 0.02), HYs(HY + 0.02) + 0.27, Q(20, 12), 3, J2({ c: o.capCol || 0xf6f1e6, cap1: 0.05 }));
  if (hw === 'band') headBand(0.7, 0.78, 0.022, hairOn ? vol(0.74, PI) + 0.0105 : 0.002, 0.006, o.bandCol || 0xb3472e, { ol: 0.4 });
  if (o.goatskin) g.tube(y => [0.058, 0.062, 0, -0.012], 1.47, 1.53, Q(12, 8), 2, J({ c: 0x4a3b30, b: 1, j: 0.12, mod: a => 1 + 0.15 * Math.abs(Math.sin(a * 6)), cap0: 0.01, cap1: 0.01 }));
  if (!kid) shortenNeck(g, NECK_DROP);
  return g;
}

// =================================================================== HUMAN ANIMATION
/* st: {speed, run, air, vy, act, actT, carry, kneel, sleep, limp, ride, sit, talk, look} */
function animHuman(rig, st, t) { animPose(rig, st, t); inertia(rig, st, t); clothSim(rig, st, t); faceAnim(rig, st, t); }
/* stride model: step length grows with speed (walk ~0.8 m, run ~1.5 m, sprint ~2 m) so the feet don't skate; returns the
   locomotion phase rate (rad/s, one step = PI) for a ground speed */
const stepLen = sp => clamp(0.55 + 0.2 * sp, 0.65, 2.05);
function stepRate(sp) { return sp > 0.02 ? sp / stepLen(sp) * PI : 0; }
/* inertialization: when the pose "mode" switches (start/stop an action, sit, kneel, carry, jump, land, talk), the pose
   that was on screen is kept as an offset that decays with a critically damped spring, so limbs ease into the new pose
   with momentum instead of snapping. Continuous motion (walk cycles, swings) is not filtered and keeps its timing. */
const poseKey = st => (st.sleep ? 'S' : '') + (st.kneel ? 'K' : '') + (st.ride ? 'R' : st.sit ? 'T' : '') + (st.carry || '') + (st.air ? 'A' : '') + '|' + (st.act || '') + (st.talk ? 't' : '') + (st.staff ? 'f' : '') + (st.hurt ? 'h' : '') + (st.swim ? 'w' : '');
function inertia(rig, st, t) {
  const n = rig.rot.length, m = rig.mem || (rig.mem = { rot: new Float32Array(n), d: new Float32Array(n), v: new Float32Array(n), off: [0, 0, 0], od: [0, 0, 0], ov: [0, 0, 0], key: null, t, init: false });
  let dt = t - m.t; m.t = t; if (!(dt > 0) || dt > 0.1) dt = 1 / 60;
  const key = poseKey(st);
  if (!m.init) { m.rot.set(rig.rot); m.off = rig.off.slice(); m.key = key; m.init = true; return; }
  if (key !== m.key) { for (let i = 0; i < n; i++) m.d[i] = m.rot[i] - rig.rot[i]; for (let k = 0; k < 3; k++) m.od[k] = m.off[k] - rig.off[k]; m.key = key; }
  const w = st.blendW || 13, kk = w * w, kd = 2 * w; // half-life ~0.12 s
  for (let i = 0; i < n; i++) { if (i >= 14 * 3 && i < 15 * 3) continue; const d = m.d[i]; if (d === 0 && m.v[i] === 0) continue;
    m.v[i] += (-kk * d - kd * m.v[i]) * dt; m.d[i] = d + m.v[i] * dt; if (Math.abs(m.d[i]) < 1e-4 && Math.abs(m.v[i]) < 1e-3) { m.d[i] = 0; m.v[i] = 0; } rig.rot[i] += m.d[i]; }
  for (let k = 0; k < 3; k++) { m.ov[k] += (-kk * m.od[k] - kd * m.ov[k]) * dt; m.od[k] += m.ov[k] * dt; rig.off[k] += m.od[k]; }
  m.rot.set(rig.rot); m.off[0] = rig.off[0]; m.off[1] = rig.off[1]; m.off[2] = rig.off[2];
}
/* blinking (eyes bone y-scale) and lip movement while speaking (mouth bone y-scale; ~0.16 at rest reads as a closed line) */
function faceAnim(rig, st, t) {
  if (rig.n < 17) return; const b = rig.bl || (rig.bl = { next: t + 0.5 + Math.random() * 3 }); let k = 1;
  if (t < b.next - 10) b.next = t + 1; if (t > b.next) { const p = (t - b.next) / 0.17; if (p >= 1) b.next = t + 2.2 + Math.random() * 3.8; else k = 1 - Math.sin(p * PI) * 0.92; }
  if (st.sleep || st.eyesClosed) k = 0.08; rig.scl[15 * 3 + 1] = k;
  let m = st.mouth !== undefined ? st.mouth : 0.16; if (st.talk) m = 0.18 + 0.62 * Math.max(0, Math.sin(t * 13.5) * (0.6 + 0.4 * Math.sin(t * 4.3 + 1)));
  rig.scl[16 * 3 + 1] = m;
}
/* secondary motion for the cape bone: a damped spring that keeps the cloth hanging under gravity,
   flares it back with speed and acceleration, and swings it sideways when turning */
function clothSim(rig, st, t) {
  const c = rig.cl || (rig.cl = { a: 0, v: 0, z: 0, zv: 0, t, sp: 0, face: st.face || 0 });
  let dt = t - c.t; c.t = t; if (!(dt > 0) || dt > 0.1) dt = 1 / 60;
  const sp = st.speed || 0, acc = clamp((sp - c.sp) / dt, -25, 25); c.sp = sp;
  const lean = rig.rot[B.chest * 3] + rig.rot[B.pelvis * 3];
  let target = st.sleep ? 0 : (st.kneel || st.sit || st.ride) ? -lean * 0.5 + 0.15 : -lean + Math.min(0.8, sp * 0.08) + (st.air ? 0.4 : 0) + (st.act === 'dodge' ? 0.6 : 0);
  c.v += acc * 0.01 + ((target - c.a) * 55 - c.v * 7.5) * dt; c.a = clamp(c.a + c.v * dt, -0.7, 1.35);
  let turn = 0; if (st.face !== undefined) { turn = angDiff(c.face, st.face) / dt; c.face = st.face; }
  c.zv += ((clamp(-turn * 0.07, -0.45, 0.45) - c.z) * 38 - c.zv * 6) * dt; c.z = clamp(c.z + c.zv * dt, -0.5, 0.5);
  rig.set(14, c.a, 0, c.z);
}
// gait keyframes (cycle fraction 0 = this foot's heel strike): [u, hip flexion (+ forward), knee flexion]
const GAIT_W = [[0, 0.42, 0.06], [0.1, 0.38, 0.28], [0.25, 0.16, 0.1], [0.45, -0.14, 0.12], [0.58, -0.2, 0.55], [0.7, 0.05, 1.05], [0.82, 0.38, 0.62], [0.93, 0.46, 0.12], [1, 0.42, 0.06]];
const GAIT_R = [[0, 0.5, 0.42], [0.12, 0.25, 0.75], [0.32, -0.38, 0.32], [0.45, -0.3, 1.25], [0.6, 0.35, 2.05], [0.76, 0.9, 1.45], [0.9, 0.72, 0.6], [1, 0.5, 0.42]];
function gaitKey(K, u) { let i = 0; while (i < K.length - 2 && K[i + 1][0] <= u) i++; const a = K[i], b = K[i + 1], k = (u - a[0]) / (b[0] - a[0] || 1), e = k * k * (3 - 2 * k);
  return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e]; }
function gaitLeg(u, R, kW, kR) { const w = gaitKey(GAIT_W, u), r = gaitKey(GAIT_R, u);
  return [w[0] * kW * (1 - R) + r[0] * kR * R, w[1] * Math.min(1, kW * 1.1) * (1 - R) + r[1] * R]; }
function animPose(rig, st, t) { if (!locoPose(rig, st, t)) actPose(rig, st, t); }
function locoPose(rig, st, t) { // returns true when a full-body hold pose (sleep/kneel/ride/sit) owns the rig
  rig.zero();
  const sp = st.speed || 0, A = Math.min(1, sp / 2.2), R = clamp((sp - 3.0) / 2.1, 0, 1);
  const ph = st.phase || 0, s = Math.sin(ph), c = Math.cos(ph);
  if (st.sleep) { rig.off[1] = -0.72; rig.set(B.pelvis, -PI / 2, 0, 0); rig.set(B.uArmL, 0, 0, 0.2); rig.set(B.uArmR, 0, 0, -0.2); rig.set(B.head, -0.2, 0, 0.2); return true; }
  if (st.kneel) {
    rig.off[1] = -0.42; rig.set(B.thighL, -0.15, 0, 0); rig.set(B.thighR, -0.15, 0, 0); rig.set(B.shinL, 1.55, 0, 0); rig.set(B.shinR, 1.55, 0, 0);
    rig.set(B.chest, 0.25, 0, 0); rig.set(B.head, 0.35, 0, 0); rig.set(B.uArmL, -0.6, 0, -0.3); rig.set(B.uArmR, -0.6, 0, 0.3); rig.set(B.fArmL, -1.2, 0, 0); rig.set(B.fArmR, -1.2, 0, 0); return true;
  }
  if (st.ride) { // astride a donkey or camel: knees out, reins in hand (a passenger holds on to the rider), the body
    // rocks with the animal's gait
    const A2 = clamp((st.rideSp || 0) / 4.5, 0, 1), g = Math.sin((st.ridePh || 0) * 2), g2 = Math.cos((st.ridePh || 0) * 2);
    rig.set(B.thighL, -1.22, 0.05, 0.52); rig.set(B.thighR, -1.22, -0.05, -0.52); rig.set(B.shinL, 1.05 + g * 0.08 * A2, 0, -0.1); rig.set(B.shinR, 1.05 - g * 0.08 * A2, 0, 0.1);
    if (st.passenger) { rig.set(B.uArmL, -0.95, 0, 0.32); rig.set(B.uArmR, -0.95, 0, -0.32); rig.set(B.fArmL, -0.75, 0.2, 0); rig.set(B.fArmR, -0.75, -0.2, 0); }
    else { rig.set(B.uArmL, -0.58 + g2 * 0.04 * A2, 0, 0.1); rig.set(B.uArmR, -0.58 - g2 * 0.04 * A2, 0, -0.1); rig.set(B.fArmL, -1.0, 0, 0); rig.set(B.fArmR, -1.0, 0, 0); }
    rig.set(B.pelvis, g * 0.06 * A2, 0, g2 * 0.03 * A2); rig.set(B.chest, 0.06 + A2 * 0.16 - g * 0.07 * A2 + Math.sin(t * 1.7) * 0.012, 0, -g2 * 0.03 * A2);
    rig.set(B.head, -0.05 - A2 * 0.1 + g * 0.05 * A2, (st.look || 0), 0); rig.off[1] = Math.abs(g) * 0.035 * A2;
    if (st.talk) { const k = Math.sin(t * 5); rig.set(B.uArmR, -0.45 + k * 0.08, 0, -0.25); rig.set(B.fArmR, -1.1 + k * 0.15, 0, 0); }
    return true;
  }
  if (st.ride || st.sit) {
    rig.set(B.thighL, -1.45, 0, 0.12); rig.set(B.thighR, -1.45, 0, -0.12); rig.set(B.shinL, 1.3, 0, 0); rig.set(B.shinR, 1.3, 0, 0);
    rig.set(B.uArmL, -0.5, 0, 0.1); rig.set(B.uArmR, -0.5, 0, -0.1); rig.set(B.fArmL, -0.8, 0, 0); rig.set(B.fArmR, -0.8, 0, 0);
    if (st.sit) rig.off[1] = -0.5; rig.set(B.chest, Math.sin(t * 2) * 0.02, 0, 0); return true;
  }
  // locomotion — stride-matched legs, pelvis bob/roll/twist, counter-rotating shoulders, lagging arm swing, a head that
  // stays level, lean into acceleration and turns, breathing and weight shifts at rest
  const lm = rig.lm || (rig.lm = { t, sp: 0, face: st.face || 0, turn: 0, acc: 0, land: 0, air: false, seed: Math.random() * 10 });
  let ldt = t - lm.t; lm.t = t; if (!(ldt > 0) || ldt > 0.1) ldt = 1 / 60;
  lm.acc += (clamp((sp - lm.sp) / ldt, -12, 12) - lm.acc) * Math.min(1, ldt * 6); lm.sp = sp;
  if (st.face !== undefined) { lm.turn += (clamp(angDiff(lm.face, st.face) / ldt, -6, 6) - lm.turn) * Math.min(1, ldt * 8); lm.face = st.face; }
  if (lm.air && !st.air) lm.land = 1; lm.air = !!st.air; lm.land = Math.max(0, lm.land - ldt * 4.5);
  /* v13 gait: keyframed joint curves from human gait data instead of plain sines, blended walk → run by speed.
     Walk: heel strike with the hip flexed ~25°, a small knee give on loading, a straight leg over the foot, push-off, then
     a quick swing with ~60° of knee bend. The body is lowest at double support and highest over the planted foot; the
     pelvis turns with the reaching leg and drops on the swing side; the chest turns the other way and the arms swing
     against the legs, elbows bending more on the forward swing. Run: short stance with a knee compression, a flight
     phase, high knee drive and heel kick, forward trunk lean, arms bent to ~90° pumping across the body. */
  const W1 = 1 - R, stp = stepLen(sp), limpK = st.limp ? 0.55 : 1, robe = st.long ? 0.7 : 1;
  /* v14 transitions. START: from standing the first step is a real step — the stride is set so one foot pushes off and
     swings through first, with a small forward lean of anticipation. STOP: when the stick is released mid-stride the
     step is finished (the gait keeps running, smaller and smaller) until the feet come together under the body, instead
     of the legs shrinking in place. TURN ON THE SPOT: the feet step around the turn (small, quick steps, pelvis leading). */
  if (lm.mode === undefined) { lm.mode = 'rest'; lm.ext = 0; lm.amp = 0; lm.startK = 0; }
  const turnIn = A < 0.12 && Math.abs(lm.turn) > 1.3 && !st.act && !st.air;
  if (A > 0.12) { if (lm.mode !== 'move') { if (lm.mode === 'rest') { const want = 0.55 * 2 * PI + PI / 2; lm.ext = want - ph; lm.startK = 1; } lm.mode = 'move'; } lm.amp = A; }
  else if (turnIn) { lm.mode = 'turn'; lm.ext += Math.min(9, Math.abs(lm.turn) * 2.2) * ldt; lm.amp += (0.36 - lm.amp) * Math.min(1, ldt * 10); }
  else if (lm.mode === 'move' || lm.mode === 'turn') { lm.mode = 'stop'; lm.amp = Math.max(lm.amp, 0.4); }
  if (lm.mode === 'stop') { lm.ext += 7 * ldt; lm.amp = Math.max(0, lm.amp - ldt * 1.4);
    const u0 = ((((ph + lm.ext) - PI / 2) / (2 * PI)) % 1 + 1) % 1, a0 = gaitKey(GAIT_W, u0)[0], b0 = gaitKey(GAIT_W, (u0 + 0.5) % 1)[0];
    if (Math.abs(a0 - b0) < 0.07 || lm.amp < 0.04) { lm.mode = 'rest'; lm.amp = 0; } }
  if (lm.mode === 'rest') lm.amp = 0;
  lm.startK = Math.max(0, lm.startK - ldt * 2.6);
  const Ag = Math.max(A, lm.amp), phE = ph + lm.ext, turnK = lm.mode === 'turn' ? 1 : 0;
  const uL = (((phE - PI / 2) / (2 * PI)) % 1 + 1) % 1, uR = (uL + 0.5) % 1;
  const kW = clamp(stp / 0.95, 0.45, 1.25) * Ag * robe, kR = clamp(stp / 1.6, 0.6, 1.3) * robe;
  const legL = gaitLeg(uL, R, kW, kR), legR = gaitLeg(uR, R, kW, kR);
  const tw = clamp(lm.turn, -3, 3) * 0.09 * turnK; // stepping round: the feet open toward the turn
  rig.set(B.thighL, -legL[0] * limpK, tw, 0.03 + R * 0.02 + Math.max(0, tw) * 0.5); rig.set(B.thighR, -legR[0], tw, -0.03 - R * 0.02 + Math.min(0, tw) * 0.5);
  rig.set(B.shinL, legL[1] * (st.limp ? 0.7 : 1) + lm.land * 0.55, 0, 0); rig.set(B.shinR, legR[1] + lm.land * 0.55, 0, 0);
  if (lm.land > 0) { rig.rot[B.thighL * 3] -= lm.land * 0.3; rig.rot[B.thighR * 3] -= lm.land * 0.3; }
  const cyc = 2 * PI * uL, lag = 0.55; // the arm trails the leg a little
  const armW = 0.27 * Ag * (1 - turnK * 0.6) * W1 * (0.6 + 0.4 * Math.min(1, sp / 1.6)), armR = (0.68 + 0.14 * (st.sprint ? 1 : 0)) * R;
  /* v17.0 부위별 위상 (움직임 연구 보고서 3장 ③, Local Motion Phases): the arms have their own phase and swing size. The phase
     is pulled toward the legs' (with the usual lag) instead of being copied from them, and the swing size eases in and out, so
     arms build up over the first steps, keep swinging a moment after a stop, and each person swings a little unevenly. */
  if (lm.aph === undefined) { lm.aph = cyc - lag; lm.aamp = 0; lm.asym = 0.92 + 0.16 * ((Math.abs(lm.seed || 0) * 7.13) % 1); }
  lm.aph += angDiff(lm.aph, cyc - lag) * Math.min(1, ldt * 9); const aw = armW + armR; lm.aamp += (aw - lm.aamp) * Math.min(1, ldt * (aw > lm.aamp ? 5 : 2.2));
  const swL = Math.cos(lm.aph), swR = -swL, aL = lm.aamp * lm.asym, aR = lm.aamp * (2 - lm.asym); // left arm forward (negative) when the right leg leads
  rig.set(B.uArmL, aL * swL + 0.06 * A * W1 - R * 0.08, 0, 0.1 + R * 0.06); rig.set(B.uArmR, aR * swR + 0.06 * A * W1 - R * 0.08, 0, -0.1 - R * 0.06); // arms hang slightly back of the body line when walking
  rig.set(B.fArmL, -0.3 - 0.32 * A * W1 * Math.max(0, -swL) - R * (1.25 + 0.25 * Math.max(0, -swL)), R * 0.25, 0); rig.set(B.fArmR, -0.3 - 0.32 * A * W1 * Math.max(0, -swR) - R * (1.25 + 0.25 * Math.max(0, -swR)), -R * 0.25, 0);
  const lean = clamp(-lm.turn * sp * 0.04, -0.34, 0.34), accLean = clamp(lm.acc * 0.022, -0.14, 0.2);
  const breath = Math.sin(t * 1.7 + lm.seed) * 0.018 * (1 - A), shift = Math.sin(t * 0.33 + lm.seed) * (1 - A);
  const twP = -0.12 * Ag * (W1 + R * 0.6) * Math.cos(cyc) + clamp(lm.turn, -3, 3) * 0.06 * turnK, twC = 0.2 * Ag * (W1 * 0.8 + R) * Math.cos(cyc) * (1 - turnK * 0.7);
  const drop = 0.05 * Ag * W1 * Math.sin(cyc);
  const spr = st.sprint ? 1 : 0; rig.set(B.pelvis, 0.12 * R + 0.025 * spr, twP, lean + drop + shift * 0.022 + (st.hero && A < 0.1 ? 0.035 : 0)); /* v16.7 야숨: the runner leans from the ankles; at rest the hero stands hip-shot */ // the sprinter leans from the ankles
  rig.set(B.chest, 0.05 + R * 0.25 + 0.04 * spr + accLean + breath + 0.1 * lm.startK + 0.025 * Ag * Math.abs(Math.sin(cyc)), twC - twP, -lean * 0.45 - drop * 0.6);
  rig.off[0] = -Math.sin(cyc) * 0.022 * Ag * W1 + shift * 0.014;
  const bobW = -0.032 * Ag * 0.5 * (1 + Math.cos(2 * cyc)), bobR = -0.064 * R * 0.5 * (1 + Math.cos(2 * (cyc - 2 * PI * 0.15))) - 0.03 * R;
  rig.off[1] = bobW * W1 + bobR + (st.limp ? Math.max(0, -Math.sin(cyc)) * -0.05 * A : 0) - lm.land * 0.12;
  const idleLook = st.idle && A < 0.1 && !st.talk && st.look === undefined ? Math.sin(t * 0.21 + lm.seed) * 0.22 * Math.max(0, Math.sin(t * 0.09 + lm.seed * 2)) : 0;
  rig.set(B.head, -0.03 - R * 0.08 - (0.05 + R * 0.2 + accLean) * 0.7 + (st.lookDown || 0), (st.look || 0) - twC * 0.9 + idleLook + clamp(lm.turn, -3, 3) * 0.1 * turnK, -lean * 0.3 + drop * 0.4); // eyes stay level and forward
  if (st.idle && Ag < 0.08) { rig.set(B.uArmL, Math.sin(t * 1.1 + lm.seed) * 0.025, 0, 0.13); rig.set(B.uArmR, -Math.sin(t * 1.1 + lm.seed) * 0.025, 0, -0.13); rig.set(B.fArmL, -0.14 - breath, 0, 0); rig.set(B.fArmR, -0.14 - breath, 0, 0); }
  if (st.air) {
    const up = clamp(((st.vy === undefined ? 2 : st.vy) + 3) / 7, 0, 1), dn = 1 - up; // v16.7: rising = tucked, falling = legs reach down, arms out
    rig.set(B.thighL, -1.2 * up - 0.42 * dn, 0, 0.06); rig.set(B.thighR, -0.45 * up + 0.12 * dn, 0, -0.06); rig.set(B.shinL, 1.45 * up + 0.5 * dn, 0, 0); rig.set(B.shinR, 1.25 * up + 0.35 * dn, 0, 0);
    rig.set(B.uArmL, -0.55 * up - 0.2 * dn, 0, 0.55 + 0.6 * dn); rig.set(B.uArmR, 0.25 * up - 0.2 * dn, 0, -0.55 - 0.6 * dn); rig.set(B.fArmL, -0.7 * up - 0.3 * dn, 0, 0); rig.set(B.fArmR, -0.5 * up - 0.3 * dn, 0, 0);
    rig.rot[B.chest * 3] += 0.18 * up - 0.05 * dn; rig.rot[B.head * 3] -= 0.12 * up;
  }
  if (st.carry === 'head') { rig.set(B.uArmL, -2.75, 0, -0.25); rig.set(B.uArmR, -2.75, 0, 0.25); rig.set(B.fArmL, -0.65, 0, 0); rig.set(B.fArmR, -0.65, 0, 0); }
  if (st.carry === 'arms') { rig.set(B.uArmL, -0.7, 0, -0.15); rig.set(B.uArmR, -0.7, 0, 0.15); rig.set(B.fArmL, -1.1, 0, 0); rig.set(B.fArmR, -1.1, 0, 0); }
  if (st.talk) { const k = Math.sin(t * 5); rig.set(B.uArmR, -0.35 + k * 0.08, 0, -0.25); rig.set(B.fArmR, -1.1 + k * 0.15, 0, 0); rig.set(B.head, -0.05 + Math.sin(t * 3) * 0.04, st.look || 0, 0); }
  if (st.staff) { const pl = Math.sin((st.phase || 0) * 0.5) * Math.min(1, (st.speed || 0) / 2.2); // fist in front at the hip, elbow bent, reaching forward as the staff is planted
    rig.set(B.uArmR, -0.32 - pl * 0.22, 0, -0.16); rig.set(B.fArmR, -1.05 + pl * 0.15, 0, 0); }
  return false;
}
function actPose(rig, st, t) {
  const A = Math.min(1, (st.speed || 0) / 2.2);
  const a = st.act, p = st.actT || 0;
  if (a === 'hoe' || a === 'chop' || a === 'mine') {
    const k = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55, sw = Math.pow(1 - k, 2);
    const up = -2.7 + (1 - k) * 2.3 + sw * 0;
    rig.set(B.uArmL, up, 0, -0.35); rig.set(B.uArmR, up, 0, 0.35); rig.set(B.fArmL, -0.5, 0, 0); rig.set(B.fArmR, -0.5, 0, 0);
    rig.set(B.chest, 0.45 * (1 - k) - 0.15 * k, a === 'chop' ? 0.35 * k : 0, 0); rig.set(B.thighL, -0.35, 0, 0.05); rig.set(B.thighR, 0.2, 0, -0.05); rig.set(B.shinL, 0.3, 0, 0);
    rig.off[1] = -0.05 * (1 - k);
  }
  if (a === 'water') { rig.set(B.uArmL, -1.1, 0, -0.35); rig.set(B.uArmR, -1.1, 0, 0.35); rig.set(B.fArmL, -0.6, 0, 0); rig.set(B.fArmR, -0.6, 0, 0); rig.set(B.chest, 0.3, 0, 0); rig.set(B.head, 0.3, 0, 0); }
  if (a === 'pick' || a === 'plant' || a === 'harvest' || a === 'milk' || a === 'shear' || a === 'gather') {
    const k = Math.sin(Math.min(1, p) * PI);
    rig.off[1] = -0.3 * k; rig.set(B.thighL, -1.15 * k, 0, 0.1); rig.set(B.thighR, -0.6 * k, 0, -0.1); rig.set(B.shinL, 1.5 * k, 0, 0); rig.set(B.shinR, 1.1 * k, 0, 0);
    rig.set(B.chest, 0.55 * k, 0, 0); rig.set(B.head, 0.3 * k, 0, 0);
    rig.set(B.uArmR, -0.9 * k + Math.sin(p * 18) * 0.15 * k, 0, 0.15); rig.set(B.uArmL, -0.7 * k, 0, -0.1); rig.set(B.fArmR, -0.5 * k, 0, 0);
  }
  if (a === 'push') { rig.set(B.chest, 0.55, 0, 0); rig.set(B.uArmL, -1.45, 0, -0.1); rig.set(B.uArmR, -1.45, 0, 0.1); rig.set(B.fArmL, -0.2, 0, 0); rig.set(B.fArmR, -0.2, 0, 0); rig.set(B.thighL, -0.7 + Math.sin(t * 6) * 0.2, 0, 0); rig.set(B.thighR, 0.4 - Math.sin(t * 6) * 0.2, 0, 0); rig.set(B.shinL, 0.6, 0, 0); rig.off[1] = -0.08; }
  if (a === 'wrestle') { const k = Math.sin(t * 3) * 0.15; rig.set(B.chest, 0.45 + k, k, 0); rig.set(B.uArmL, -1.3, 0, -0.5); rig.set(B.uArmR, -1.3, 0, 0.5); rig.set(B.fArmL, -1.0, 0, 0); rig.set(B.fArmR, -1.0, 0, 0); rig.set(B.thighL, -0.6, 0, 0.2); rig.set(B.thighR, 0.3, 0, -0.2); rig.set(B.shinL, 0.7, 0, 0); rig.set(B.shinR, 0.3, 0, 0); rig.off[1] = -0.12; }
  if (a === 'pray') { rig.off[1] = -0.42; rig.set(B.thighL, -0.15, 0, 0); rig.set(B.thighR, -0.15, 0, 0); rig.set(B.shinL, 1.55, 0, 0); rig.set(B.shinR, 1.55, 0, 0); rig.set(B.chest, 0.1, 0, 0); rig.set(B.head, -0.35, 0, 0); rig.set(B.uArmL, -2.2, 0, -0.5); rig.set(B.uArmR, -2.2, 0, 0.5); rig.set(B.fArmL, -0.4, 0, 0); rig.set(B.fArmR, -0.4, 0, 0); }
  if (a === 'wave') { rig.set(B.uArmR, -2.6, 0, 0.3); rig.set(B.fArmR, -0.4 + Math.sin(t * 10) * 0.3, 0, 0); }
  if (a === 'bow') { const k = Math.sin(Math.min(1, p) * PI); rig.set(B.chest, 0.9 * k, 0, 0); rig.set(B.head, 0.3 * k, 0, 0); rig.set(B.uArmL, 0.2 * k, 0, 0.1); rig.set(B.uArmR, 0.2 * k, 0, -0.1); }
  if (a === 'hug') { rig.set(B.uArmL, -1.3, 0, -0.9); rig.set(B.uArmR, -1.3, 0, 0.9); rig.set(B.fArmL, -1.2, 0, 0); rig.set(B.fArmR, -1.2, 0, 0); rig.set(B.head, 0.1, 0.3, 0); }
  // ---- combat & fishing & camp poses
  const E = x => x * x * (3 - 2 * x);
  if (a === 'swing') { const w = p < 0.4 ? E(p / 0.4) : 1, h = p < 0.4 ? 0 : E(Math.min(1, (p - 0.4) / 0.2)), back = 1 - (p > 0.75 ? E((p - 0.75) / 0.25) : 0);
    rig.set(B.chest, 0.08 + h * 0.2, (w * 0.55 - h * 1.1) * back, 0); rig.set(B.uArmR, (-0.2 - w * 2.3 + h * 1.9) * back, 0, (0.15 + w * 0.5 - h * 0.6) * back); rig.set(B.fArmR, (-0.3 - w * 0.9 + h * 0.8) * back, 0, 0);
    rig.set(B.uArmL, -0.4 * back, 0, -0.35); rig.set(B.fArmL, -0.7, 0, 0); rig.set(B.thighL, -0.35 * h, 0, 0.05); rig.set(B.thighR, 0.25 * h, 0, -0.05); rig.set(B.shinR, 0.2 * h, 0, 0); }
  if (a === 'thrust') { const w = p < 0.35 ? E(p / 0.35) : 1, h = p < 0.35 ? 0 : E(Math.min(1, (p - 0.35) / 0.18)), back = 1 - (p > 0.7 ? E((p - 0.7) / 0.3) : 0);
    rig.set(B.chest, (0.1 + h * 0.25) * back, (0.4 * w - 0.5 * h) * back, 0); rig.set(B.uArmR, (-0.9 - 0.3 * w - 0.4 * h) * back, 0, (0.25 - 0.3 * h) * back); rig.set(B.fArmR, (-1.4 * w + 1.3 * h) * back, 0, 0);
    rig.set(B.uArmL, -1.0 * back, 0, -0.2); rig.set(B.fArmL, -0.9 * back, 0, 0); rig.set(B.thighL, -0.5 * h * back, 0, 0.05); rig.set(B.thighR, 0.35 * h * back, 0, -0.05); rig.set(B.shinR, 0.3 * h * back, 0, 0); rig.off[1] = -0.05 * h; }
  if (a === 'sling') { const w = p < 0.55, k = w ? p / 0.55 : 1, h = w ? 0 : E(Math.min(1, (p - 0.55) / 0.15));
    rig.set(B.chest, 0.05, w ? 0.25 : -0.45 * h, 0); rig.set(B.uArmR, w ? -2.6 + Math.sin(k * 30) * 0.25 : -2.6 + h * 1.6, w ? Math.cos(k * 30) * 0.4 : 0, w ? 0.3 : 0.1); rig.set(B.fArmR, w ? -0.3 : -0.2, 0, 0);
    rig.set(B.uArmL, -0.9, 0, -0.2); rig.set(B.fArmL, -0.5, 0, 0); rig.set(B.thighL, -0.3 * h, 0, 0); rig.set(B.thighR, 0.2 * h, 0, 0); }
  if (a === 'shoot') { const d = p < 0.5 ? E(p / 0.5) : 1, rel = p > 0.55 ? 1 : 0;
    rig.set(B.chest, 0.02, -0.9, 0); rig.set(B.head, 0, 0.85, 0); rig.set(B.uArmL, -1.55, 0, -0.15); rig.set(B.fArmL, -0.05, 0, 0);
    rig.set(B.uArmR, -1.5, 0, 0.2 + d * 0.25 - rel * 0.2); rig.set(B.fArmR, -0.4 - d * 1.6 + rel * 1.3, 0, 0); rig.set(B.thighL, -0.2, 0, 0.12); rig.set(B.thighR, 0.15, 0, -0.12); }
  if (a === 'dodge') { const k = Math.sin(Math.min(1, p) * PI); rig.off[1] = -0.38 * k; rig.set(B.pelvis, 0.6 * k, 0, 0); rig.set(B.chest, 0.6 * k, 0, 0); rig.set(B.head, 0.4 * k, 0, 0);
    rig.set(B.thighL, -1.5 * k, 0, 0.1); rig.set(B.thighR, -1.2 * k, 0, -0.1); rig.set(B.shinL, 2.0 * k, 0, 0); rig.set(B.shinR, 1.8 * k, 0, 0); rig.set(B.uArmL, -1.0 * k, 0, -0.3); rig.set(B.uArmR, -1.0 * k, 0, 0.3); rig.set(B.fArmL, -1.4 * k, 0, 0); rig.set(B.fArmR, -1.4 * k, 0, 0); }
  if (a === 'cast') { const w = p < 0.45 ? E(p / 0.45) : 1, h = p < 0.45 ? 0 : E(Math.min(1, (p - 0.45) / 0.25)); rig.set(B.uArmR, -0.6 - w * 2.0 + h * 1.6, 0, 0.2); rig.set(B.fArmR, -0.5, 0, 0); rig.set(B.uArmL, -0.5 - w * 1.2 + h, 0, -0.3); rig.set(B.fArmL, -0.8, 0, 0); rig.set(B.chest, -0.15 * w + 0.3 * h, 0, 0); }
  if (a === 'fish') { rig.set(B.uArmR, -0.85 + Math.sin(t * 1.3) * 0.03, 0, 0.15); rig.set(B.fArmR, -0.7, 0, 0); rig.set(B.uArmL, -0.7, 0, -0.25); rig.set(B.fArmL, -1.0, 0, 0); rig.set(B.chest, 0.08, 0, 0); }
  if (a === 'grab') { const k = Math.sin(t * 4) * 0.12; rig.set(B.chest, 0.5 + k, k * 0.5, 0); rig.set(B.uArmL, -1.5, 0, -0.45); rig.set(B.uArmR, -1.5, 0, 0.45); rig.set(B.fArmL, -1.3, 0, 0); rig.set(B.fArmR, -1.3, 0, 0); rig.set(B.thighL, -0.7, 0, 0.25); rig.set(B.thighR, 0.35, 0, -0.25); rig.set(B.shinL, 0.8, 0, 0); rig.set(B.shinR, 0.3, 0, 0); rig.off[1] = -0.14; }
  if (a === 'sitg') { rig.off[1] = -0.74; rig.set(B.thighL, -1.45, 0, 0.55); rig.set(B.thighR, -1.45, 0, -0.55); rig.set(B.shinL, 2.5, 0, 0); rig.set(B.shinR, 2.5, 0, 0); rig.set(B.chest, 0.08 + Math.sin(t * 1.6) * 0.02, 0, 0); rig.set(B.uArmL, -0.6, 0, 0.1); rig.set(B.uArmR, -0.6, 0, -0.1); rig.set(B.fArmL, -0.6, 0, 0); rig.set(B.fArmR, -0.6, 0, 0); }
  if (a === 'dance') { const k = Math.sin(t * 6); rig.set(B.uArmL, -2.4 + k * 0.3, 0, -0.4); rig.set(B.uArmR, -2.4 - k * 0.3, 0, 0.4); rig.set(B.fArmL, -0.5, 0, 0); rig.set(B.fArmR, -0.5, 0, 0); rig.set(B.pelvis, 0, k * 0.25, 0); rig.set(B.chest, 0, -k * 0.2, k * 0.08); rig.off[1] = -Math.abs(Math.cos(t * 6)) * 0.08; rig.set(B.thighL, Math.max(0, k) * -0.6, 0, 0); rig.set(B.shinL, Math.max(0, k) * 0.9, 0, 0); }
  if (a === 'cheer') { const k = Math.abs(Math.sin(t * 7)); rig.set(B.uArmL, -2.6, 0, -0.5); rig.set(B.uArmR, -2.6, 0, 0.5); rig.off[1] = k * 0.1; }
  if (a === 'thrown') { rig.off[1] = -0.78; rig.set(B.pelvis, -PI / 2 + 0.1, 0.4, 0); rig.set(B.uArmL, -1.2, 0, 0.6); rig.set(B.uArmR, -0.6, 0, -0.9); rig.set(B.thighL, -0.5, 0, 0.1); rig.set(B.shinL, 0.9, 0, 0); }
  if (st.hurt && !a) { rig.set(B.chest, -0.22, 0, 0); rig.set(B.head, -0.25, 0, 0); }
  if (st.shiver > 0 && !a && A < 0.6) { const k = st.shiver * (1 - A), q = Math.sin(t * 38) * 0.035 * k; // hugging oneself against the cold
    rig.set(B.uArmL, -0.55 * k + q, 0, -0.25 * k + 0.13); rig.set(B.uArmR, -0.55 * k - q, 0, 0.25 * k - 0.13); rig.set(B.fArmL, -1.6 * k - 0.14, 0, 0); rig.set(B.fArmR, -1.6 * k - 0.14, 0, 0);
    rig.rot[B.chest * 3] += 0.12 * k + q * 0.5; rig.rot[B.head * 3] += 0.1 * k; }
}

// =================================================================== ANIMALS
const AB = { sheep: [['body', -1, 0, 0.62, 0], ['head', 0, 0, 0.78, 0.36], ['lFL', 0, 0.13, 0.5, 0.25], ['lFR', 0, -0.13, 0.5, 0.25], ['lBL', 0, 0.13, 0.5, -0.25], ['lBR', 0, -0.13, 0.5, -0.25], ['tail', 0, 0, 0.66, -0.4]] };
AB.goat = [['body', -1, 0, 0.68, 0], ['head', 0, 0, 0.9, 0.36], ['lFL', 0, 0.12, 0.55, 0.26], ['lFR', 0, -0.12, 0.55, 0.26], ['lBL', 0, 0.12, 0.55, -0.26], ['lBR', 0, -0.12, 0.55, -0.26], ['tail', 0, 0, 0.82, -0.38]];
AB.cow = [['body', -1, 0, 1.0, 0], ['head', 0, 0, 1.2, 0.72], ['lFL', 0, 0.22, 0.78, 0.5], ['lFR', 0, -0.22, 0.78, 0.5], ['lBL', 0, 0.22, 0.78, -0.5], ['lBR', 0, -0.22, 0.78, -0.5], ['tail', 0, 0, 1.15, -0.75]];
AB.camel = [['body', -1, 0, 1.55, 0], ['head', 0, 0, 1.75, 0.6], ['lFL', 0, 0.22, 1.25, 0.45], ['lFR', 0, -0.22, 1.25, 0.45], ['lBL', 0, 0.22, 1.25, -0.5], ['lBR', 0, -0.22, 1.25, -0.5], ['tail', 0, 0, 1.6, -0.7]];
AB.donkey = [['body', -1, 0, 0.9, 0], ['head', 0, 0, 1.15, 0.5], ['lFL', 0, 0.16, 0.72, 0.36], ['lFR', 0, -0.16, 0.72, 0.36], ['lBL', 0, 0.16, 0.72, -0.36], ['lBR', 0, -0.16, 0.72, -0.36], ['tail', 0, 0, 0.98, -0.52]];
AB.horse = [['body', -1, 0, 1.15, 0], ['head', 0, 0, 1.45, 0.65], ['lFL', 0, 0.18, 0.92, 0.5], ['lFR', 0, -0.18, 0.92, 0.5], ['lBL', 0, 0.18, 0.92, -0.5], ['lBR', 0, -0.18, 0.92, -0.5], ['tail', 0, 0, 1.25, -0.7]];
AB.wolf = [['body', -1, 0, 0.55, 0], ['head', 0, 0, 0.66, 0.42], ['lFL', 0, 0.1, 0.42, 0.3], ['lFR', 0, -0.1, 0.42, 0.3], ['lBL', 0, 0.1, 0.42, -0.3], ['lBR', 0, -0.1, 0.42, -0.3], ['tail', 0, 0, 0.6, -0.45]];
AB.gazelle = [['body', -1, 0, 0.82, 0], ['head', 0, 0, 1.15, 0.36], ['lFL', 0, 0.09, 0.66, 0.26], ['lFR', 0, -0.09, 0.66, 0.26], ['lBL', 0, 0.09, 0.66, -0.26], ['lBR', 0, -0.09, 0.66, -0.26], ['tail', 0, 0, 0.86, -0.34]];
AB.hare = [['body', -1, 0, 0.22, 0], ['head', 0, 0, 0.3, 0.16], ['lFL', 0, 0.05, 0.15, 0.1], ['lFR', 0, -0.05, 0.15, 0.1], ['lBL', 0, 0.06, 0.18, -0.09], ['lBR', 0, -0.06, 0.18, -0.09], ['tail', 0, 0, 0.24, -0.16]];
AB.partridge = [['body', -1, 0, 0.2, 0], ['head', 0, 0, 0.32, 0.1], ['lFL', 0, 0.07, 0.24, 0], ['lFR', 0, -0.07, 0.24, 0], ['lBL', 0, 0.035, 0.12, 0.01], ['lBR', 0, -0.035, 0.12, 0.01], ['tail', 0, 0, 0.23, -0.11]];
AB.deer = [['body', -1, 0, 0.95, 0], ['head', 0, 0, 1.3, 0.44], ['lFL', 0, 0.11, 0.76, 0.32], ['lFR', 0, -0.11, 0.76, 0.32], ['lBL', 0, 0.11, 0.76, -0.32], ['lBR', 0, -0.11, 0.76, -0.32], ['tail', 0, 0, 1.0, -0.45]];
AB.ibex = [['body', -1, 0, 0.78, 0], ['head', 0, 0, 1.02, 0.4], ['lFL', 0, 0.13, 0.6, 0.28], ['lFR', 0, -0.13, 0.6, 0.28], ['lBL', 0, 0.13, 0.6, -0.28], ['lBR', 0, -0.13, 0.6, -0.28], ['tail', 0, 0, 0.88, -0.4]];
AB.boar = [['body', -1, 0, 0.62, 0], ['head', 0, 0, 0.62, 0.48], ['lFL', 0, 0.14, 0.42, 0.3], ['lFR', 0, -0.14, 0.42, 0.3], ['lBL', 0, 0.14, 0.42, -0.3], ['lBR', 0, -0.14, 0.42, -0.3], ['tail', 0, 0, 0.7, -0.5]];
AB.bear = [['body', -1, 0, 0.95, 0], ['head', 0, 0, 1.08, 0.72], ['lFL', 0, 0.24, 0.7, 0.42], ['lFR', 0, -0.24, 0.7, 0.42], ['lBL', 0, 0.24, 0.7, -0.45], ['lBR', 0, -0.24, 0.7, -0.45], ['tail', 0, 0, 0.98, -0.72]];
AB.lion = [['body', -1, 0, 0.92, 0], ['head', 0, 0, 1.12, 0.66], ['lFL', 0, 0.18, 0.7, 0.45], ['lFR', 0, -0.18, 0.7, 0.45], ['lBL', 0, 0.18, 0.7, -0.45], ['lBR', 0, -0.18, 0.7, -0.45], ['tail', 0, 0, 1.0, -0.72]];
/* v16.9 legs grow up INTO the body with a shoulder/haunch muscle at the top (skinned to the leg), so a swinging leg never shows
   a gap between its top and the belly — the "floating limbs" look. */
function legTop(g, b, i, r, col) { const front = i < 4; g.sph(r * 1.9, 8, 6, { at: [b[2] * 0.85, b[3] + r * 1.7, b[4] + (front ? 0.015 : -0.03)], s: [0.8, 1.7, front ? 1.05 : 1.25], c: col, b: i, j: 0.02 }); }
function legs2(g, def, h, r0, r1, col, hoof) { // tapered legs with a little joint bump and hoof/paw
  for (let i = 2; i <= 5; i++) { const b = def[i], ext = r0 * 2.6; g.tube(y => { const k = Math.min(1, y / h); return [r1 + (r0 - r1) * k + 0.006 * Math.sin(k * PI) + (y > h ? (y - h) * 0.6 : 0), r1 + (r0 - r1) * k * 1.1 + (y > h ? (y - h) * 0.7 : 0), 0, 0]; }, 0, h + ext, 7, 4, { at: [b[2], b[3] - h, b[4]], c: col, b: i, j: 0, cap1: r0 * 0.8 }); legTop(g, b, i, r0, col);
    if (hoof !== null) g.sph(r1 * 1.25, 7, 4, { at: [b[2], b[3] - h + r1 * 0.6, b[4] + r1 * 0.3], s: [1, 0.7, 1.25], c: hoof || 0x2a2220, b: i, j: 0 }); }
}
function camelLegs(g, def, hide) { // v12: thick thigh → knobbly knee → slim cannon → broad padded foot
  const kn = shade(hide, -0.12), pad = 0x6a5a4a, H = def[2][3];
  for (let i = 2; i <= 5; i++) { const b = def[i], front = i < 4, kneeY = front ? 0.62 : 0.72;
    g.tube(y => { const k = clamp((y - kneeY) / (H - kneeY), 0, 1); return [0.07 + 0.075 * k * k, 0.07 + 0.09 * k * k, 0, 0]; }, kneeY, H + 0.2, 10, 6, { at: [b[2], 0, b[4]], c: hide, b: i, j: 0, cap1: 0.12 }); // reaches up into the body: no open top
    g.sph(0.2, 9, 6, { at: [b[2] * 0.8, H + 0.08, b[4] + (front ? 0.04 : -0.06)], s: [0.75, 1.15, 1.05], c: hide, b: i, j: 0.02 }); // shoulder / haunch muscle
    g.sph(0.08, 7, 5, { at: [b[2], kneeY, b[4] + (front ? 0.02 : -0.02)], s: [1, 1.15, 1], c: kn, b: i });
    g.tube(y => [0.045 + 0.012 * Math.sin(y / kneeY * PI), 0.05, 0, 0], 0.1, kneeY + 0.03, 8, 4, { at: [b[2], 0, b[4]], c: hide, b: i, j: 0, cap0: 0.04, cap1: 0.04 });
    g.sph(0.06, 6, 4, { at: [b[2], 0.13, b[4] + 0.02], c: kn, b: i });
    g.sph(0.12, 8, 5, { at: [b[2], 0.04, b[4] + 0.05], s: [0.9, 0.42, 1.25], c: pad, b: i, j: 0 }); }
}
function legs(g, def, h, r, col, hoof) {
  for (let i = 2; i <= 5; i++) { const b = def[i], ext = r * 3; g.cyl(r * 0.8, r * 1.3, h + ext, 7, { at: [b[2], b[3] - h / 2 + ext / 2, b[4]], c: col, b: i, j: 0 }); legTop(g, b, i, r, col);
    g.sph(r * 1.05, 6, 4, { at: [b[2], b[3] - h * 0.48, b[4] + (i < 4 ? 0.006 : -0.01)], c: col, b: i, j: 0 }); /* knee / hock */
    g.cyl(r * 0.9, r * 0.95, 0.06, 6, { at: [b[2], b[3] - h + 0.03, b[4]], c: hoof || 0x2a2220, b: i, j: 0 }); }
}
function patternFn(pat, base, dark, r) {
  if (pat === 'streaked') return (x, y, z) => (Math.floor((z + 2) * 9) % 2 ? dark : base);
  return () => base;
}
function animal(sp, o) {
  o = o || {}; const g = new GB(o.seed || 11); const def = AB[sp]; const r = rng(o.seed || 11);
  const pat = o.pattern || 'plain';
  if (sp === 'sheep') {
    const wool = o.wool || 0xf3eee2, dark = o.dark || 0x4a3a30, face = o.face || 0xf0e6d6;
    const fn = patternFn(pat, wool, dark);
    for (let i = 0; i < 22; i++) {
      const a = r() * PI * 2, z = (r() - 0.5) * 0.62, rr = 0.17 + r() * 0.06, y = 0.62 + Math.sin(a) * 0.17 * 0.9, x = Math.cos(a) * 0.17;
      let c = typeof fn === 'function' ? fn(0, 0, z) : wool; if (pat === 'spotted' && r() < 0.3) c = dark;
      g.sph(rr, 8, 6, { at: [x, Math.max(0.5, y), z], c, b: 0, j: 0.04 });
    }
    g.sph(0.3, 10, 8, { at: [0, 0.64, 0], s: [0.85, 0.75, 1.25], c: pat === 'streaked' ? fn : wool, b: 0, j: 0.03 });
    if (pat === 'speckled') for (let i = 0; i < 26; i++) { const a = r() * PI * 2, z = (r() - 0.5) * 0.6; g.sph(0.035 + r() * 0.02, 5, 4, { at: [Math.cos(a) * 0.27, 0.64 + Math.abs(Math.sin(a)) * 0.2, z], c: dark, b: 0, j: 0 }); }
    g.sph(0.12, 8, 7, { at: [0, 0.8, 0.46], s: [0.85, 1, 1.25], c: face, b: 1, j: 0 });
    g.sph(0.1, 7, 6, { at: [0, 0.88, 0.4], c: pat === 'plain' ? wool : fn(0, 0, 0.4), b: 1, j: 0.03 });
    for (const s of [1, -1]) { g.sph(0.05, 6, 4, { at: [0.11 * s, 0.84, 0.42], s: [1.6, 0.6, 0.9], c: face, b: 1 }); g.sph(0.018, 5, 4, { at: [0.05 * s, 0.84, 0.56], c: 0x1a1210, b: 1, j: 0 }); }
    legs(g, def, 0.48, 0.035, o.legCol || 0x5a4a3e);
    g.sph(0.07, 6, 5, { at: [0, 0.66, -0.43], c: wool, b: 6 });
  } else if (sp === 'goat') {
    const hide = o.hide || 0x2e2622, dark = o.dark || 0xe8ddc8; const fn = pat === 'streaked' ? (x, y, z) => (Math.floor((z + 2) * 10) % 2 ? dark : hide) : hide;
    g.sph(0.26, 10, 8, { at: [0, 0.7, 0], s: [0.85, 0.95, 1.55], c: fn, b: 0, j: 0.04 });
    if (pat === 'spotted') for (let i = 0; i < 7; i++) { const a = r() * PI * 2, z = (r() - 0.5) * 0.6; g.sph(0.09 + r() * 0.04, 6, 5, { at: [Math.cos(a) * 0.17, 0.72 + Math.sin(a) * 0.17, z], s: [1, 1, 0.4], ry: a, c: dark, b: 0 }); }
    if (pat === 'speckled') for (let i = 0; i < 26; i++) { const a = r() * PI * 2, z = (r() - 0.5) * 0.66; g.sph(0.03 + r() * 0.015, 5, 4, { at: [Math.cos(a) * 0.21, 0.72 + Math.sin(a) * 0.22, z], c: dark, b: 0, j: 0 }); }
    g.sph(0.1, 8, 7, { at: [0, 0.98, 0.46], s: [0.8, 1, 1.4], c: hide, b: 1, j: 0.03 });
    for (const s of [1, -1]) { g.cyl(0.005, 0.03, 0.26, 5, { at: [0.05 * s, 1.15, 0.36], rx: -0.7, rz: 0.2 * s, c: 0x9a8a72, b: 1, j: 0 }); g.sph(0.05, 6, 4, { at: [0.11 * s, 1.0, 0.42], s: [1.6, 0.5, 0.8], rz: -0.4 * s, c: hide, b: 1 }); g.sph(0.016, 5, 4, { at: [0.055 * s, 1.03, 0.55], c: 0xd8b040, b: 1, j: 0 }); }
    g.cyl(0.0, 0.035, 0.12, 5, { at: [0, 0.83, 0.56], rx: PI, c: hide, b: 1 });
    legs(g, def, 0.55, 0.035, hide);
    g.cyl(0, 0.04, 0.16, 5, { at: [0, 0.88, -0.42], rx: -0.6, c: hide, b: 6 });
  } else if (sp === 'cow') {
    const hide = o.hide || 0xb9874e, white = 0xf2ece0;
    g.sph(0.45, 12, 9, { at: [0, 1.05, 0], s: [0.78, 0.82, 1.6], c: hide, b: 0, j: 0.03 });
    for (let i = 0; i < 5; i++) { const a = r() * PI * 2, z = (r() - 0.5) * 1.0; g.sph(0.16, 6, 5, { at: [Math.cos(a) * 0.32, 1.05 + Math.sin(a) * 0.3, z], s: [1, 1, 0.4], ry: a, c: white, b: 0 }); }
    g.sph(0.2, 8, 7, { at: [0, 1.25, 0.86], s: [0.8, 0.9, 1.25], c: hide, b: 1 }); g.sph(0.13, 7, 5, { at: [0, 1.18, 1.05], c: 0xe8c8b0, b: 1 });
    for (const s of [1, -1]) { g.cyl(0.01, 0.04, 0.24, 5, { at: [0.15 * s, 1.42, 0.8], rz: -1.0 * s, c: 0xf0e8d0, b: 1, j: 0 }); g.sph(0.06, 6, 4, { at: [0.2 * s, 1.3, 0.82], s: [1.6, 0.6, 0.9], c: hide, b: 1 }); }
    legs(g, def, 0.78, 0.07, hide);
    g.cyl(0.02, 0.03, 0.6, 5, { at: [0, 0.88, -0.78], c: hide, b: 6 });
  } else if (sp === 'camel') {
    const hide = o.hide || 0xc9a46c;
    g.sph(0.47, 14, 10, { at: [0, 1.58, 0], s: [0.78, 0.82, 1.45], c: hide, b: 0, j: 0.02 }); g.sph(0.3, 10, 8, { at: [0, 1.42, 0.05], s: [0.95, 0.6, 1.6], c: hide, b: 0, j: 0.02 }); // barrel + belly line closing over the legs
    g.sph(0.3, 10, 7, { at: [0, 2.0, -0.05], s: [0.9, 1, 1.2], c: hide, b: 0, j: 0.03 });
    // v13 neck: a deep U — down and forward from the withers, then up to the head (it was a flat plank)
    { const pts = [[0, 1.78, 0.5], [0, 1.66, 0.82], [0, 1.82, 1.08], [0, 2.12, 1.2], [0, 2.36, 1.16]], rads = [0.2, 0.15, 0.12, 0.1, 0.09];
      for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], c = pts[k + 1], dy = c[1] - a[1], dz = c[2] - a[2], L = Math.hypot(dy, dz);
        g.cyl(rads[k + 1], rads[k], L + 0.06, 9, { at: [0, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], rx: Math.atan2(dz, dy), c: hide, b: 1, j: 0.02 }); g.sph(rads[k + 1], 8, 6, { at: c, c: hide, b: 1, j: 0.02 }); } }
    g.sph(0.15, 10, 8, { at: [0, 2.42, 1.22], s: [0.85, 0.85, 1.25], c: hide, b: 1, j: 0.02 }); // skull
    g.sph(0.11, 9, 7, { at: [0, 2.36, 1.42], s: [0.8, 0.75, 1.3], c: shade(hide, -0.04), b: 1, j: 0.02 }); // long muzzle
    g.sph(0.07, 7, 5, { at: [0, 2.28, 1.5], s: [1, 0.55, 1], c: shade(hide, -0.18), b: 1 }); // heavy split lip
    for (const s of [1, -1]) g.sph(0.03, 6, 4, { at: [0.11 * s, 2.47, 1.3], c: 0x1a1210, b: 1, j: 0 }); // eyes on the side of the head
    if (o.saddle) { g.box(0.8, 0.12, 0.7, { at: [0, 2.22, -0.05], c: o.saddle, b: 0 }); g.box(0.9, 0.4, 0.3, { at: [0, 1.95, -0.05], c: shade(o.saddle, -0.2), b: 0 }); }
    camelLegs(g, def, hide);
    g.sph(0.24, 9, 7, { at: [0, 2.05, -0.05], s: [0.85, 0.9, 1.1], c: shade(hide, 0.04), b: 0, j: 0.02 }); // the hump rises in one rounded mound
    for (const s of [1, -1]) { g.sph(0.04, 5, 4, { at: [0.1 * s, 2.56, 1.15], s: [0.6, 1.3, 0.6], c: shade(hide, -0.12), b: 1 }); g.sph(0.07, 6, 4, { at: [0.12 * s, 1.55, 0.05], s: [0.3, 1, 2.2], c: shade(hide, -0.06), b: 0 }); }
    g.cyl(0.02, 0.05, 0.5, 5, { at: [0, 1.58, -0.72], rx: 0.25, c: shade(hide, -0.1), b: 6 }); g.sph(0.05, 5, 4, { at: [0, 1.34, -0.78], s: [1, 1.6, 1], c: shade(hide, -0.3), b: 6 });
  } else if (sp === 'donkey' || sp === 'horse') {
    const hide = o.hide || (sp === 'horse' ? 0xeee6d8 : 0x8a8078), big = sp === 'horse' ? 1.25 : 1;
    g.sph(0.32 * big, 12, 8, { at: [0, def[0][3], 0], s: [0.8, 0.85, 1.55], c: hide, b: 0, j: 0.03 });
    g.cyl(0.09 * big, 0.14 * big, 0.5 * big, 8, { at: [0, def[1][3] + 0.05, def[1][4] - 0.05], rx: 0.6, c: hide, b: 1 });
    g.box(0.2 * big, 0.22 * big, 0.45 * big, { at: [0, def[1][3] + 0.18, def[1][4] + 0.2], rx: 0.5, c: hide, b: 1 });
    g.box(0.15 * big, 0.12 * big, 0.12 * big, { at: [0, def[1][3] + 0.03, def[1][4] + 0.4], c: 0xd8d0c8, b: 1 });
    for (const s of [1, -1]) { g.cyl(0.01, 0.04, sp === 'donkey' ? 0.3 : 0.14, 5, { at: [0.06 * s, def[1][3] + 0.42, def[1][4] + 0.08], rz: -0.25 * s, c: hide, b: 1 }); g.sph(0.025, 5, 4, { at: [0.09 * s, def[1][3] + 0.28, def[1][4] + 0.28], c: 0x1a1210, b: 1, j: 0 }); }
    if (sp === 'horse') { g.box(0.05, 0.35, 0.5, { at: [0, def[1][3] + 0.25, def[1][4] - 0.2], rx: 0.6, c: 0xd8c8a0, b: 1 }); g.cyl(0.0, 0.07, 0.3, 5, { at: [0, def[1][3] + 0.55, def[1][4] + 0.1], c: 0xb3472e, b: 1 }); }
    if (o.pack) { g.box(0.8, 0.35, 0.4, { at: [0, def[0][3] + 0.15, 0], c: o.pack, b: 0 }); }
    if (o.saddle) { g.box(0.62, 0.06, 0.6, { at: [0, def[0][3] + 0.27, -0.02], c: o.saddle, b: 0, j: 0 }); for (const s2 of [1, -1]) g.box(0.04, 0.34, 0.56, { at: [0.27 * s2 * big, def[0][3] + 0.12, -0.02], rz: 0.25 * s2, c: shade(o.saddle, -0.15), b: 0, j: 0 }); g.box(0.66, 0.05, 0.05, { at: [0, def[0][3] + 0.27, 0.27], c: o.trim || 0xe0c070, b: 0, j: 0 }); }
    legs(g, def, def[2][3], 0.05 * big, hide);
    g.cyl(0.02, 0.04, 0.45, 5, { at: [0, def[6][3] - 0.22, def[6][4]], c: 0x4a4038, b: 6 });
  } else if (sp === 'wolf') {
    const hide = 0x7a7470;
    g.sph(0.24, 10, 8, { at: [0, 0.58, 0], s: [0.8, 0.85, 1.55], c: hide, b: 0, j: 0.05 });
    g.sph(0.2, 9, 7, { at: [0, 0.6, 0.2], s: [0.85, 1, 0.9], c: hide, b: 0, j: 0.04 }); g.sph(0.15, 8, 6, { at: [0, 0.5, 0.1], s: [0.8, 0.6, 1.3], c: 0xb0aaa2, b: 0 }); // deep chest, pale belly
    g.cyl(0.1, 0.15, 0.28, 8, { at: [0, 0.66, 0.34], rx: 0.9, c: hide, b: 1 }); // neck into the head (no gap)
    g.sph(0.13, 8, 6, { at: [0, 0.72, 0.42], c: hide, b: 1 }); g.cyl(0.03, 0.07, 0.2, 6, { at: [0, 0.68, 0.56], rx: PI / 2, c: 0x9a948c, b: 1 });
    for (const s of [1, -1]) { g.cyl(0.0, 0.05, 0.12, 4, { at: [0.07 * s, 0.86, 0.38], c: hide, b: 1 }); g.sph(0.02, 5, 4, { at: [0.06 * s, 0.76, 0.53], c: 0xffcc40, b: 1, j: 0 }); }
    legs(g, def, 0.42, 0.035, hide);
    seg(g, [0, 0.62, -0.3], [0, 0.4, -0.78], 0.055, 0.025, { c: hide, b: 6, nu: 6, nv: 3, curve: 0.08 }); // tail from the rump
  } else if (sp === 'gazelle') {
    const hide = 0xc8955a;
    g.sph(0.22, 10, 8, { at: [0, 0.84, 0], s: [0.75, 0.85, 1.5], c: hide, b: 0 }); g.sph(0.15, 8, 6, { at: [0, 0.8, 0], s: [0.8, 0.5, 1.3], c: 0xf2e8d8, b: 0 });
    g.cyl(0.05, 0.08, 0.4, 6, { at: [0, 1.02, 0.3], rx: 0.4, c: hide, b: 1 }); g.sph(0.09, 7, 6, { at: [0, 1.2, 0.42], s: [0.8, 0.9, 1.4], c: hide, b: 1 });
    for (const s of [1, -1]) g.cyl(0.0, 0.022, 0.32, 5, { at: [0.04 * s, 1.38, 0.36], rx: -0.4, c: 0x3a2a20, b: 1 });
    legs(g, def, 0.66, 0.025, hide);
  } else if (sp === 'hare') {
    const fur = 0xa08664, light = 0xe8dcc8;
    g.sph(1, 10, 8, { at: [0, 0.23, -0.01], s: [0.1, 0.11, 0.17], c: fur, b: 0, j: 0.02 }); g.sph(1, 8, 6, { at: [0, 0.19, 0.06], s: [0.075, 0.07, 0.09], c: light, b: 0 });
    g.sph(1, 8, 6, { at: [0, 0.32, 0.18], s: [0.06, 0.06, 0.08], c: fur, b: 1 }); for (const s of [1, -1]) { g.sph(1, 6, 5, { at: [0.025 * s, 0.43, 0.15], s: [0.018, 0.08, 0.03], rx: -0.4, rz: 0.15 * s, c: fur, b: 1 }); g.sph(0.012, 5, 4, { at: [0.04 * s, 0.34, 0.22], c: 0x1a1210, b: 1, j: 0 }); }
    for (let i = 2; i <= 5; i++) { const b = def[i], back = i >= 4; g.sph(1, 6, 5, { at: [b[2], b[3] - (back ? 0.07 : 0.08), b[4] + (back ? -0.02 : 0.01)], s: back ? [0.035, 0.07, 0.08] : [0.018, 0.08, 0.02], c: fur, b: i }); }
    g.sph(0.04, 6, 5, { at: [0, 0.27, -0.18], c: 0xf6f2ea, b: 6 });
  } else if (sp === 'partridge') {
    const body = 0xb8ac98, bar = 0x5a4232;
    g.sph(1, 10, 8, { at: [0, 0.2, 0], s: [0.085, 0.085, 0.12], c: (x, y, z) => y < 0.2 && Math.abs(x) > 0.05 && Math.floor((z + 1) * 40) % 3 === 0 ? bar : body, b: 0, j: 0.02 });
    g.sph(1, 8, 6, { at: [0, 0.31, 0.1], s: [0.045, 0.05, 0.05], c: 0xc8bca8, b: 1 }); g.sph(1, 6, 4, { at: [0, 0.3, 0.155], s: [0.012, 0.012, 0.025], c: 0xc83a2a, b: 1 });
    for (const s of [1, -1]) { g.sph(0.012, 5, 4, { at: [0.035 * s, 0.315, 0.125], c: 0x1a1210, b: 1, j: 0 }); g.sph(1, 6, 4, { at: [0.038 * s, 0.31, 0.12], s: [0.008, 0.03, 0.03], c: 0x2a2220, b: 1, j: 0 }); }
    for (const [i, s] of [[2, 1], [3, -1]]) g.sph(1, 8, 4, { at: [0.075 * s, 0.22, -0.01], s: [0.02, 0.06, 0.1], c: 0xa89c88, b: i });
    for (const i of [4, 5]) g.cyl(0.006, 0.008, 0.11, 4, { at: [def[i][2], 0.06, 0.01], c: 0xc8503a, b: i });
    g.sph(1, 6, 4, { at: [0, 0.22, -0.12], s: [0.05, 0.02, 0.06], rx: 0.4, c: 0x8a7a68, b: 6 });
  } else if (sp === 'deer') {
    const hide = 0xa8683a, white = 0xf2e8d8;
    g.sph(1, 12, 9, { at: [0, 0.98, 0], s: [0.2, 0.24, 0.42], c: hide, b: 0, j: 0.02 }); g.sph(1, 8, 6, { at: [0, 0.98, -0.36], s: [0.14, 0.15, 0.08], c: white, b: 0 });
    g.tube(y => [0.065 - y * 0.03, 0.08 - y * 0.035, 0, y * 0.2], 0, 0.42, 8, 4, { at: [0, 1.06, 0.3], rx: 0.45, c: hide, b: 1 });
    g.sph(1, 9, 7, { at: [0, 1.36, 0.5], s: [0.07, 0.08, 0.13], c: hide, b: 1 }); g.sph(0.03, 6, 4, { at: [0, 1.33, 0.63], c: 0x1a1210, b: 1 });
    for (const s of [1, -1]) { g.sph(1, 6, 4, { at: [0.07 * s, 1.45, 0.44], s: [0.05, 0.022, 0.03], rz: -0.5 * s, c: hide, b: 1 }); g.sph(0.015, 5, 4, { at: [0.05 * s, 1.39, 0.56], c: 0x1a1210, b: 1, j: 0 });
      seg(g, [0.035 * s, 1.43, 0.46], [0.09 * s, 1.68, 0.42], 0.016, 0.009, { c: 0x6a5038, b: 1, nu: 5, nv: 2, curve: 0.1 }); seg(g, [0.07 * s, 1.56, 0.44], [0.13 * s, 1.62, 0.52], 0.01, 0.005, { c: 0x6a5038, b: 1, nu: 4, nv: 2 }); }
    legs2(g, def, 0.76, 0.034, 0.018, hide);
  } else if (sp === 'ibex') {
    const hide = 0xb08a5a, dark = 0x5a4430;
    g.sph(1, 12, 9, { at: [0, 0.8, 0], s: [0.21, 0.22, 0.38], c: (x, y) => y < 0.68 ? dark : hide, b: 0, j: 0.02 });
    g.tube(y => [0.07 - y * 0.03, 0.08 - y * 0.03, 0, 0], 0, 0.25, 8, 3, { at: [0, 0.9, 0.3], rx: 0.6, c: hide, b: 1 });
    g.sph(1, 9, 7, { at: [0, 1.05, 0.46], s: [0.07, 0.08, 0.13], c: hide, b: 1 }); g.sph(1, 6, 4, { at: [0, 0.94, 0.52], s: [0.025, 0.06, 0.025], c: dark, b: 1 });
    for (const s of [1, -1]) { g.sph(0.014, 5, 4, { at: [0.05 * s, 1.08, 0.54], c: 0xd8b040, b: 1, j: 0 }); let p0 = [0.04 * s, 1.13, 0.42];
      for (let k = 0; k < 6; k++) { const a = 0.3 + k * 0.42, p1 = [0.04 * s + 0.012 * s * k, 1.13 + Math.sin(a) * 0.3, 0.42 - (1 - Math.cos(a)) * 0.3]; seg(g, p0, p1, 0.035 - k * 0.005, 0.03 - k * 0.005, { c: (x, y) => Math.floor(y * 40) % 2 ? 0x8a7a5a : 0x9a8a68, b: 1, nu: 6, nv: 2, round: k === 5 ? undefined : false }); p0 = p1; } }
    legs2(g, def, 0.6, 0.038, 0.022, hide); g.sph(1, 6, 4, { at: [0, 0.9, -0.4], s: [0.03, 0.05, 0.03], c: dark, b: 6 });
  } else if (sp === 'boar') {
    const bristle = 0x4a3a2e, snout = 0x6a5248;
    g.sph(1, 12, 9, { at: [0, 0.64, 0], s: [0.25, 0.27, 0.48], c: bristle, b: 0, j: 0.06 }); g.sph(1, 10, 6, { at: [0, 0.76, 0.12], s: [0.18, 0.22, 0.3], c: bristle, b: 0, j: 0.06 });
    for (let i = 0; i < 6; i++) g.cyl(0, 0.03, 0.12, 4, { at: [0, 0.92 - i * 0.012, 0.2 - i * 0.09], rx: -0.4, c: 0x2a2018, b: 0 });
    g.tube(y => [0.13 - y * 0.18, 0.12 - y * 0.15, 0, 0], 0, 0.36, 9, 4, { at: [0, 0.62, 0.38], rx: PI / 2 + 0.25, c: bristle, b: 1, cap1: 0.02 });
    g.cyl(0.055, 0.06, 0.04, 8, { at: [0, 0.55, 0.76], rx: PI / 2 + 0.25, c: snout, b: 1 });
    for (const s of [1, -1]) { seg(g, [0.05 * s, 0.56, 0.66], [0.09 * s, 0.66, 0.68], 0.014, 0.004, { c: 0xf4ecd8, b: 1, nu: 5, nv: 2, curve: 0.2 }); g.sph(0.014, 5, 4, { at: [0.08 * s, 0.7, 0.58], c: 0x1a1210, b: 1, j: 0 }); g.sph(1, 6, 4, { at: [0.1 * s, 0.82, 0.46], s: [0.05, 0.06, 0.02], rz: -0.5 * s, c: bristle, b: 1 }); }
    legs2(g, def, 0.42, 0.045, 0.028, bristle); g.cyl(0.006, 0.012, 0.2, 4, { at: [0, 0.62, -0.55], rx: -0.4, c: bristle, b: 6 });
  } else if (sp === 'bear') {
    const fur = 0x8a6a48, dark = 0x5a4430;
    g.sph(1, 12, 10, { at: [0, 0.98, -0.05], s: [0.38, 0.4, 0.66], c: fur, b: 0, j: 0.05 }); g.sph(1, 10, 8, { at: [0, 1.08, 0.3], s: [0.34, 0.38, 0.36], c: fur, b: 0, j: 0.05 });
    g.sph(1, 10, 8, { at: [0, 1.12, 0.78], s: [0.2, 0.2, 0.22], c: fur, b: 1, j: 0.04 }); g.sph(1, 8, 6, { at: [0, 1.05, 0.96], s: [0.1, 0.09, 0.12], c: 0xb89a74, b: 1 }); g.sph(0.035, 6, 4, { at: [0, 1.08, 1.07], c: 0x1a1210, b: 1 });
    for (const s of [1, -1]) { g.sph(0.06, 7, 5, { at: [0.14 * s, 1.3, 0.72], s: [1, 1, 0.6], c: dark, b: 1 }); g.sph(0.018, 5, 4, { at: [0.08 * s, 1.17, 0.94], c: 0x1a1210, b: 1, j: 0 }); }
    legs2(g, def, 0.7, 0.11, 0.085, fur, dark); g.sph(0.07, 6, 5, { at: [0, 1.02, -0.72], c: fur, b: 6 });
  } else if (sp === 'lion') {
    const tawny = 0xc8963c, mane = 0x8a5a24, belly = 0xe0c08a;
    g.sph(1, 12, 9, { at: [0, 0.95, -0.05], s: [0.24, 0.27, 0.62], c: tawny, b: 0, j: 0.02 }); g.sph(1, 8, 6, { at: [0, 0.86, 0], s: [0.18, 0.15, 0.5], c: belly, b: 0 });
    g.sph(1, 12, 10, { at: [0, 1.15, 0.62], s: [0.3, 0.32, 0.26], c: mane, b: 1, j: 0.08 }); // mane
    for (let i = 0; i < 14; i++) { const a = i / 14 * PI * 2; g.sph(0.09, 6, 4, { at: [Math.cos(a) * 0.27, 1.15 + Math.sin(a) * 0.28, 0.58], c: mane, b: 1, j: 0.08 }); }
    g.sph(1, 10, 8, { at: [0, 1.15, 0.8], s: [0.16, 0.16, 0.18], c: tawny, b: 1 }); g.sph(1, 8, 6, { at: [0, 1.08, 0.94], s: [0.09, 0.08, 0.08], c: belly, b: 1 }); g.sph(0.03, 6, 4, { at: [0, 1.12, 0.99], c: 0x3a2018, b: 1 });
    for (const s of [1, -1]) { g.sph(0.02, 5, 4, { at: [0.07 * s, 1.21, 0.93], c: 0xd8b040, b: 1, j: 0 }); g.sph(0.045, 6, 4, { at: [0.12 * s, 1.32, 0.76], s: [1, 1, 0.5], c: tawny, b: 1 }); }
    legs2(g, def, 0.7, 0.07, 0.055, tawny, belly);
    g.tube(y => [0.022, 0.022, 0, 0], 0, 0.8, 5, 4, { at: [0, 0.4, -0.75], rx: 0.5, c: tawny, b: 6 }); g.sph(0.06, 6, 5, { at: [0, 0.32, -0.95], c: mane, b: 6 });
  }
  return { gb: g, def };
}
function animAnimal(rig, st, t) {
  rig.zero(); const sp = st.speed || 0, A = Math.min(1, sp / 1.5), ph = st.phase || 0, s = Math.sin(ph);
  if (st.dead) { const by = rig.def[0][3]; rig.off[1] = -by * 0.62; rig.set(0, 0, 0, 1.5); for (let i = 2; i <= 5; i++) rig.set(i, (i % 2 ? 0.25 : -0.25), 0, 0); rig.set(1, 0.3, 0, 0); return; }
  if (st.fly) { const f = Math.sin(t * 26); rig.off[1] = 0; rig.set(2, 0, 0, 0.9 * f); rig.set(3, 0, 0, -0.9 * f); rig.set(4, -1.2, 0, 0); rig.set(5, -1.2, 0, 0); rig.set(0, -0.15, 0, 0); return; }
  if (st.atk === 1) { rig.off[1] = -0.06; rig.set(0, 0.12, 0, 0); rig.set(1, 0.45 + Math.sin(t * 30) * 0.05, 0, 0); rig.set(2, -0.3, 0, 0); rig.set(3, -0.3, 0, 0); rig.set(4, 0.35, 0, 0); rig.set(5, 0.35, 0, 0); return; }
  if (st.atk === 2) { rig.set(0, -0.12, 0, 0); rig.set(1, -0.35, 0, 0); rig.set(2, -0.9, 0, 0); rig.set(3, -0.7, 0, 0); rig.set(4, 0.6, 0, 0); rig.set(5, 0.5, 0, 0); return; }
  if (st.lie) { rig.off[1] = -(st.legH || 0.4) * 0.8; for (let i = 2; i <= 5; i++) rig.set(i, i < 4 ? -1.45 : 1.45, 0, 0); rig.set(1, 0.2 + Math.sin(t * 0.7) * 0.05, 0, 0); return; }
  const k = st.gallop ? 0.75 : 0.5;
  rig.set(2, s * k * A); rig.set(5, s * k * A); rig.set(3, -s * k * A); rig.set(4, -s * k * A);
  rig.off[1] = -Math.abs(Math.cos(ph)) * 0.03 * A;
  rig.set(0, Math.sin(ph * 2) * 0.03 * A, 0, 0);
  const graze = st.graze ? 0.85 + Math.sin(t * 2.3) * 0.08 : 0;
  rig.set(1, graze + Math.sin(ph) * 0.06 * A + (st.look || 0) * 0, st.headYaw || 0, 0);
  rig.set(6, 0, Math.sin(t * 3 + (st.seed || 0)) * 0.4, 0);
}

// =================================================================== PROPS (non-rigged, in hand/local space)
function prop(kind) {
  const g = new GB(5);
  switch (kind) {
    case 'torch': g.cyl(0.025, 0.03, 0.72, 6, { at: [0, 0.1, 0.03], c: 0x6a4428 }); g.cyl(0.055, 0.035, 0.15, 6, { at: [0, 0.52, 0.03], c: 0x2e241c }); break; // v17.9 P5
    case 'staff': g.cyl(0.022, 0.026, 1.8, 6, { at: [0, -0.05, 0.03], c: 0x7a5232 }); g.sph(0.04, 6, 5, { at: [0, 0.83, 0.03], c: 0x6a4428 }); break;
    case 'club': g.cyl(0.024, 0.03, 0.72, 6, { at: [0, -0.32, 0.02], c: 0xe8dcc0 }); g.sph(0.07, 7, 5, { at: [0, -0.7, 0.02], s: [1, 1.3, 1], c: 0xf0e6d0 }); g.cyl(0.032, 0.032, 0.12, 6, { at: [0, -0.04, 0.02], c: 0x7a5232 }); break;
    case 'knife': g.cyl(0.02, 0.022, 0.1, 6, { at: [0, -0.06, 0.02], c: 0x6a4428 }); g.box(0.008, 0.2, 0.035, { at: [0, -0.21, 0.02], taper: 0.4, c: 0xc89a5a }); break;
    case 'spear': g.cyl(0.02, 0.022, 2.1, 6, { at: [0, -0.55, 0.03], c: 0x8a6440 }); g.cyl(0, 0.035, 0.26, 5, { at: [0, -1.72, 0.03], rx: PI, c: 0xb8b0a0 }); break;
    case 'sling': g.cyl(0.006, 0.006, 0.55, 3, { at: [0.01, -0.3, 0.02], c: 0x8a6a48 }); g.cyl(0.006, 0.006, 0.55, 3, { at: [-0.01, -0.3, 0.02], c: 0x8a6a48 }); g.sph(0.045, 6, 4, { at: [0, -0.58, 0.02], s: [1, 0.6, 1], c: 0x6a4a30 }); break;
    case 'bow': for (let i = 0; i < 8; i++) { const a0 = -0.9 + i * 0.225, a1 = a0 + 0.225; g.cyl(0.014, 0.014, 0.17, 5, { at: [0, 0.02 - Math.cos((a0 + a1) / 2) * 0.12 + 0.12, Math.sin((a0 + a1) / 2) * 0.62], rx: -(a0 + a1) / 2 + PI / 2, c: 0x6a4428 }); } g.cyl(0.003, 0.003, 1.1, 3, { at: [0, 0.14, 0], rx: PI / 2, c: 0xe8e0d0 }); break;
    case 'fishrod': g.cyl(0.012, 0.022, 2.3, 5, { at: [0, -1.05, 0.02], c: 0x9a7a4a }); g.cyl(0.002, 0.002, 1.6, 3, { at: [0, -2.15, 0.02 + 0.0], rz: 0.0, rx: 0.5, c: 0xf0f0f0 }); break;
    case 'hoe': g.cyl(0.02, 0.024, 1.3, 6, { at: [0, 0.1, 0.03], c: 0x8a6440 }); g.box(0.06, 0.04, 0.22, { at: [0, 0.74, 0.13], c: 0x6e6a64 }); break;
    case 'sickle': g.cyl(0.02, 0.022, 0.18, 6, { at: [0, -0.02, 0.02], c: 0x7a5232 }); for (let i = 0; i < 6; i++) { const a = i / 6 * 2.2; g.box(0.015, 0.06, 0.05, { at: [0, -0.1 - Math.sin(a) * 0.12, 0.02 + (1 - Math.cos(a)) * 0.12], rx: -a, c: 0xb8b2a8, j: 0 }); } break;
    case 'axe': g.cyl(0.02, 0.024, 0.7, 6, { at: [0, 0.15, 0.03], c: 0x8a6440 }); g.box(0.04, 0.16, 0.16, { at: [0, 0.45, 0.11], c: 0x8a8680 }); break;
    case 'hammer': g.cyl(0.02, 0.024, 0.6, 6, { at: [0, 0.1, 0.03], c: 0x8a6440 }); g.box(0.12, 0.12, 0.2, { at: [0, 0.4, 0.03], c: 0x8a8680 }); break;
    case 'jar': g.lathe([[0.05, 0], [0.16, 0.08], [0.19, 0.2], [0.15, 0.32], [0.07, 0.38], [0.08, 0.44]], 12, { c: 0xb5673a, at: [0, 0, 0] }); break;
    case 'jarHead': g.lathe([[0.05, 0], [0.16, 0.08], [0.19, 0.2], [0.15, 0.32], [0.07, 0.38], [0.08, 0.44]], 12, { c: 0xb5673a, at: [0, 0.18, 0] }); break;
    case 'basket': g.cyl(0.32, 0.24, 0.24, 12, { at: [0, 0.3, 0], c: 0xa57a3c }); for (let i = 0; i < 5; i++) g.sph(0.09, 6, 5, { at: [Math.cos(i * 1.3) * 0.15, 0.44, Math.sin(i * 1.3) * 0.15], c: 0xe0b070 }); break;
    case 'sheaf': g.cyl(0.18, 0.24, 0.8, 8, { at: [0, 0.3, 0], rz: PI / 2, c: 0xe2b844 }); g.cyl(0.2, 0.2, 0.06, 8, { at: [0, 0.3, 0], rz: PI / 2, c: 0x8a5a2a }); break;
    case 'stew': g.cyl(0.13, 0.1, 0.1, 10, { at: [0, 0, 0.06], c: 0x6a4a3a }); g.cyl(0.12, 0.12, 0.01, 10, { at: [0, 0.05, 0.06], c: 0xb5402a, j: 0 }); break;
    case 'lamb': break;
    case 'stone': g.sph(0.2, 7, 5, { at: [0, 0.2, 0], s: [1.3, 0.8, 1], c: 0xa8a090, flat: true }); break;
    case 'rods': for (let i = 0; i < 3; i++) g.cyl(0.02, 0.02, 1.0, 6, { at: [i * 0.04 - 0.04, 0.2, 0.03], rz: (i - 1) * 0.1, c: (x, y) => (Math.floor((y + 2) * 12) % 2 ? 0xf2ead8 : 0x7a5a3a) }); break;
    case 'oil': g.lathe([[0.04, 0], [0.08, 0.05], [0.08, 0.14], [0.03, 0.2], [0.035, 0.24]], 10, { c: 0x8a6a40 }); break;
    case 'scroll': g.cyl(0.04, 0.04, 0.3, 8, { at: [0, 0, 0.05], rz: PI / 2, c: 0xefe2c0 }); break;
  }
  return g;
}

// =================================================================== ENVIRONMENT (static, into chunk GB with world matrix M)
const env = {};
const leafC = (cs, dark) => (x, y, z) => { const c = cs[Math.abs(Math.floor(x * 3 + z * 5)) % cs.length]; return y < -0.15 ? mixHex(c, 0x1e2a14, dark || 0.25) : c; };
env.tamarisk = function (g, M, r) { // 에셀나무 (창 21:33): v13 — a gnarled trunk, limbs, and feathery drooping grey-green sprays
  limbTree(g, M, r, { trunk: 1.4, tr: 0.18, limbs: 4, spread: 0.7, limb: 1.3, crown: 0.95, clumps: 16, leaf: 0.36, flat: 1.15, bark: 0x6a5444, cols: [0x8aa088, 0x7a9478, 0x96aa90, 0x6e8a6e] });
};
env.retama = function (g, M, r) { // 로뎀나무 (broom bush)
  for (let i = 0; i < 16; i++) { const a = r() * PI * 2, lean = 0.15 + r() * 0.45, h = 0.9 + r() * 0.9; g.cyl(0.008, 0.02, h, 3, { m: M, at: [Math.cos(a) * Math.sin(lean) * h / 2, h / 2 * Math.cos(lean), Math.sin(a) * Math.sin(lean) * h / 2], rz: -Math.cos(a) * lean, rx: Math.sin(a) * lean, c: 0x7a9a5a, sw: 0.5 }); }
  for (let i = 0; i < 8; i++) g.sph(0.3 + r() * 0.2, 6, 4, { m: M, at: [(r() - 0.5) * 1.0, 0.7 + r() * 0.7, (r() - 0.5) * 1.0], s: [1, 0.8, 1], c: r() < 0.3 ? 0xeee8dc : 0x8aa868, j: 0.08, sw: 0.5 });
};
env.opuntia = function (g, M, r) { // 백년초 선인장 (prickly pear)
  const pad = (x, y, z, ry, rz, s) => { g.sph(1, 9, 7, { m: M, at: [x, y, z], s: [0.19 * s, 0.25 * s, 0.045 * s], ry, rz, c: (px, py) => py > 0.6 ? 0x7aa858 : 0x6a9a4c, j: 0.04, ol: 0.7 });
    if (r() < 0.45) g.sph(0.045 * s, 6, 4, { m: M, at: [x + Math.sin(rz) * -0.24 * s * Math.cos(ry), y + Math.cos(rz) * 0.24 * s, z + Math.sin(rz) * 0.24 * s * Math.sin(ry)], s: [0.8, 1.1, 0.8], c: r() < 0.5 ? 0xc0304a : 0xe08a3a, j: 0.05 }); };
  const n = 2 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) { const ry = r() * PI, x = (r() - 0.5) * 0.5, z = (r() - 0.5) * 0.5; pad(x, 0.25, z, ry, (r() - 0.5) * 0.3, 1.1);
    for (let k = 0; k < 2 + Math.floor(r() * 2); k++) { const rz = (r() - 0.5) * 1.3; pad(x + Math.sin(-rz) * 0.25 * Math.cos(ry), 0.62 + r() * 0.15, z + Math.sin(-rz) * 0.25 * Math.sin(ry), ry + (r() - 0.5) * 0.8, rz, 0.9);
      if (r() < 0.5) pad(x + Math.sin(-rz) * 0.42 * Math.cos(ry), 0.98 + r() * 0.1, z + Math.sin(-rz) * 0.42 * Math.sin(ry), ry + (r() - 0.5), rz * 1.3, 0.75); } }
};
env.tumbleweed = function (g, M, r, s) { s = s || 1; for (let i = 0; i < 30; i++) { const a = r() * PI * 2, b = (r() - 0.5) * PI; g.cyl(0.006 * s, 0.01 * s, 0.6 * s * (0.6 + r() * 0.5), 3, { m: M, at: [0, 0.42 * s, 0], ry: a, rx: b, rz: r() * PI, c: [0xb8a070, 0xa08a5a, 0xc8b080][i % 3], j: 0.08, ol: 0.3 }); }
  for (let i = 0; i < 10; i++) g.sph(0.12 * s, 5, 3, { m: M, at: [(r() - 0.5) * 0.5 * s, 0.42 * s + (r() - 0.5) * 0.4 * s, (r() - 0.5) * 0.5 * s], c: 0xa89060, j: 0.1, ol: 0.2 });
};
env.dryGrass = function (g, M, r, col) { for (let i = 0; i < 9; i++) { const h = 0.25 + r() * 0.35, a = r() * PI * 2; g.cyl(0.0, 0.012, h, 3, { m: M, at: [(r() - 0.5) * 0.35, h / 2, (r() - 0.5) * 0.35], rz: Math.cos(a) * 0.35, rx: Math.sin(a) * 0.35, c: col || [0xd8c080, 0xc8b070, 0xb8a868][i % 3], sw: (x, y) => (y + h / 2) / h * 0.6 }); } };
env.outcrop = function (g, M, r, col) { const c = col || 0xb8a48a; for (let i = 0; i < 5; i++) { const s = 0.8 + r() * 1.4; g.sph(s, 7, 5, { m: M, at: [(r() - 0.5) * 3, s * 0.35, (r() - 0.5) * 3], s: [1.2, 0.75 + r() * 0.4, 1], ry: r() * 6, c: [c, mixHex(c, 0xffffff, 0.08), mixHex(c, 0x000000, 0.1)][i % 3], flat: true, j: 0.08 }); } };
env.datePalm = function (g, M, r) {
  const h = 8 + r() * 4, lean = (r() - 0.5) * 0.35; let x = 0, y = 0;
  for (let i = 0; i < 8; i++) { const t = i / 8, nx = Math.sin(lean) * h * (t + 1 / 8) * (t + 1 / 8) * 0.6; g.cyl(0.15 - t * 0.03, 0.19 - t * 0.03, h / 8 + 0.04, 8, { m: M, at: [(x + nx) / 2, y + h / 16, 0], rz: -lean * (0.4 + t), c: i % 2 ? 0x8a6a48 : 0x7a5c3e, j: 0.03 }); x = nx; y += h / 8; }
  for (let k = 0; k < 12; k++) { const a = k / 12 * PI * 2 + r() * 0.3, droop = 0.3 + (k % 3) * 0.25; let px = x, py = y, pz = 0;
    for (let j = 0; j < 6; j++) { const d = 0.38, ang = -0.2 + droop * j * 0.45, nx2 = px + Math.cos(a) * d * Math.cos(ang), ny = py - Math.sin(ang) * d * 0.8 + 0.06, nz = pz + Math.sin(a) * d * Math.cos(ang);
      g.box(0.55 - j * 0.07, 0.02, d * 1.1, { m: M, at: [(px + nx2) / 2, (py + ny) / 2, (pz + nz) / 2], ry: -a + PI / 2, rx: ang, c: [0x5a9a3c, 0x4f8a34, 0x66a448][k % 3], j: 0.05, sw: 0.3 + j * 0.15 }); px = nx2; py = ny; pz = nz; } }
  for (let k = 0; k < 4; k++) g.sph(0.16, 6, 5, { m: M, at: [x + Math.cos(k * 1.7) * 0.28, y - 0.35, Math.sin(k * 1.7) * 0.28], s: [1, 1.4, 1], c: 0xd8823a, j: 0.06 });
};
env.booth = function (g, M, r) { // 초막 (Succoth booth, 창 33:17)
  for (const [x, z] of [[-1.4, -1], [1.4, -1], [-1.4, 1], [1.4, 1]]) g.cyl(0.06, 0.07, 2.1, 5, { m: M, at: [x, 1.05, z], c: 0x7a5a3a });
  for (let i = 0; i < 9; i++) g.cyl(0.03, 0.04, 3.2, 4, { m: M, at: [0, 2.15, -1.1 + i * 0.27], rz: PI / 2, c: 0x8a6a48 });
  for (let i = 0; i < 16; i++) g.sph(0.45 + r() * 0.2, 6, 4, { m: M, at: [(r() - 0.5) * 3, 2.3, (r() - 0.5) * 2.2], s: [1.2, 0.35, 1], c: [0x6a9a48, 0x7aa850, 0x8a9a58][i % 3], j: 0.08, sw: 0.3 });
  g.box(3, 0.9, 0.06, { m: M, at: [0, 0.45, -1.05], c: 0x9a8a68 });
};
const scaledM = (M, k) => m4mul(m4(), M, m4trs(m4(), 0, 0, 0, 0, 0, 0, k, k, k));
/* v13 natural trees: a tapering trunk that forks into limbs, each limb ending in its own cluster of many small leaf
   clumps (irregular silhouette, sky gaps, light tops and darker undersides) instead of a few big spheres */
/* v18.6: on phones (G.treeLod = 1) the leaf masses are tessellated coarser and there are fewer of them (a little bigger each): trees were ~83% of the world's triangles. ?trees=hi keeps the full detail. */
function limbTree(g, M, r, o) {
  const lod = G.treeLod ? 1 : 0, nClump = lod ? Math.max(6, Math.round(o.clumps * 0.68)) : o.clumps, sA = lod ? 6 : 8, sB = lod ? 4 : 5;
  const bark = o.bark || 0x6e5440, th = o.trunk, tr = o.tr; g.cyl(tr * 0.62, tr, th, 9, { m: M, at: [0, th / 2, 0], rz: (r() - 0.5) * 0.08, c: bark, j: 0.05 });
  for (let i = 0; i < 3; i++) g.sph(tr * 0.75, 6, 4, { m: M, at: [Math.cos(i * 2.1) * tr * 0.8, 0.06, Math.sin(i * 2.1) * tr * 0.8], s: [1.6, 0.5, 1], ry: i * 2.1, c: bark, flat: true }); // root flare
  const n = o.limbs, C = o.cols;
  for (let i = 0; i < n; i++) { const a = i / n * PI * 2 + r() * 0.6, el = o.spread * (0.7 + r() * 0.5), L = o.limb * (0.75 + r() * 0.4), y0 = th * (0.82 + r() * 0.15);
    const ex = Math.cos(a) * Math.sin(el) * L, ey = y0 + Math.cos(el) * L, ez = Math.sin(a) * Math.sin(el) * L;
    const lm = m4mul(m4(), M, m4trs(m4(), 0, y0, 0, -a, 0, 0)); g.cyl(tr * 0.2, tr * 0.45, L, 6, { m: lm, at: [Math.sin(el) * L / 2, Math.cos(el) * L / 2, 0], rz: -el, c: bark, j: 0.04 });
    const R0 = o.crown * (0.8 + r() * 0.4); for (let k = 0; k < nClump; k++) { const u = r() * PI * 2, v = Math.acos(1 - 2 * r()) * 0.75, d = Math.cbrt(r()) * R0;
      const x = ex + Math.cos(u) * Math.sin(v) * d, z = ez + Math.sin(u) * Math.sin(v) * d, y = ey + Math.cos(v) * d * o.flat;
      const up = clamp((y - ey + R0 * 0.3) / (R0 * 1.2), 0, 1), c0 = C[Math.floor(r() * C.length)];
      // v16.1: soft, rounded leaf masses (smooth shading, more facets) with a smaller tuft on many of them, so the crown reads as
      // clustered leaves instead of cut gems
      const lr = o.leaf * (0.6 + r() * 0.55) * (lod ? 1.16 : 1), lc = mixHex(mixHex(c0, 0x1c2812, 0.38 * (1 - up)), 0xd8e0a0, 0.12 * up);
      g.sph(lr, sA, sB, { m: M, at: [x, y, z], s: [1, 0.78, 1], ry: r() * 6, c: lc, j: 0.07, sw: 0.6 });
      if (r() < (lod ? 0.4 : 0.6)) { const ta = r() * PI * 2; g.sph(lr * 0.55, lod ? 5 : 6, lod ? 3 : 4, { m: M, at: [x + Math.cos(ta) * lr * 0.75, y + lr * 0.35, z + Math.sin(ta) * lr * 0.75], s: [1, 0.8, 1], c: mixHex(lc, 0xe8f0a8, 0.1), j: 0.08, sw: 0.7 }); } } }
}
env.olive = function (g, M, r) { M = scaledM(M, 1.55); // v12: 4–5 m
  limbTree(g, M, r, { trunk: 1.2, tr: 0.2, limbs: 4, spread: 0.85, limb: 1.25, crown: 1.0, clumps: 14, leaf: 0.42, flat: 0.8, bark: 0x7a6a58, cols: [0x8a9a5b, 0x7d8f50, 0x99a868, 0xa0aa78] });
};
env.oak = function (g, M, r) { M = scaledM(M, 1.85 + r() * 0.35); // v12: a big terebinth/oak, 8–10 m
  limbTree(g, M, r, { trunk: 2.2, tr: 0.34, limbs: 5, spread: 0.75, limb: 2.0, crown: 1.5, clumps: 16, leaf: 0.62, flat: 0.75, cols: [0x5f8a3a, 0x6c9a42, 0x557d34, 0x74a446, 0x4f7530] });
};
env.palm = function (g, M, r) {
  const h = 9 + r() * 4, lean = (r() - 0.5) * 0.5; let x = 0, y = 0;
  for (let i = 0; i < 6; i++) { const t = i / 6, nx = Math.sin(lean) * h * (t + 1 / 6) * (t + 1 / 6) * 0.6; g.cyl(0.17 - t * 0.04, 0.2 - t * 0.04, h / 6 + 0.05, 7, { m: M, at: [(x + nx) / 2, y + h / 12, 0], rz: -lean * (0.4 + t), c: i % 2 ? 0x8a6a48 : 0x7a5c3e, j: 0.03 }); x = nx; y += h / 6; }
  for (let k = 0; k < 9; k++) { const a = k / 9 * PI * 2 + r() * 0.3; for (let j = 0; j < 4; j++) { const d = 0.4 + j * 0.65, dy = 0.15 - j * j * 0.12; g.box(0.5 - j * 0.08, 0.03, 0.7, { m: M, at: [x + Math.cos(a) * d, y + dy, Math.sin(a) * d], ry: -a + PI / 2, rx: 0.15 + j * 0.25, c: [0x4f8f3a, 0x5a9a40, 0x4a8434][k % 3], j: 0.06, sw: 0.4 + j * 0.25 }); } }
  for (let k = 0; k < 4; k++) g.sph(0.1, 5, 4, { m: M, at: [x + Math.cos(k * 1.6) * 0.18, y - 0.25, Math.sin(k * 1.6) * 0.18], c: 0x8a4a20 });
};
env.acacia = function (g, M, r) { M = scaledM(M, 1.4); // v13: the umbrella thorn — a leaning trunk forking into a vase of thin limbs under a flat, layered crown
  const bark = 0x6a5240; g.cyl(0.11, 0.18, 1.6, 7, { m: M, at: [0.06, 0.8, 0], rz: -0.08, c: bark, j: 0.05 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2 + r() * 0.5, el = 0.55 + r() * 0.35, L = 1.6 + r() * 0.6, lm = m4mul(m4(), M, m4trs(m4(), 0.12, 1.55, 0, -a, 0, 0));
    g.cyl(0.035, 0.07, L, 5, { m: lm, at: [Math.sin(el) * L / 2, Math.cos(el) * L / 2, 0], rz: -el, c: bark, j: 0.05 });
    const ex = 0.12 + Math.cos(a) * Math.sin(el) * L, ez = Math.sin(a) * Math.sin(el) * L, ey = 1.55 + Math.cos(el) * L;
    for (let k = 0; k < 9; k++) { const u = r() * PI * 2, d = Math.sqrt(r()) * 1.0; g.sph(0.42 + r() * 0.25, G.treeLod ? 7 : 9, G.treeLod ? 4 : 5, { m: M, at: [ex + Math.cos(u) * d, ey + 0.08 + (r() - 0.5) * 0.18, ez + Math.sin(u) * d], s: [1.3, 0.32, 1.3], ry: r() * 6, c: mixHex([0x7a9a48, 0x86a650, 0x6e8e42][k % 3], 0x26301a, k % 4 === 0 ? 0.3 : 0), j: 0.05, sw: 0.5 }); } }
};
env.fig = function (g, M, r) { M = scaledM(M, 1.5);
  limbTree(g, M, r, { trunk: 1.1, tr: 0.18, limbs: 5, spread: 1.0, limb: 1.1, crown: 0.95, clumps: 12, leaf: 0.5, flat: 0.7, bark: 0x9a8a78, cols: [0x4f8a38, 0x5e9a40, 0x68a446, 0x3e7a2e] });
};
env.bush = function (g, M, r, col) {
  for (let i = 0; i < 6; i++) g.sph(0.4 + r() * 0.3, 8, 6, { m: M, at: [(r() - 0.5) * 0.9, 0.3 + r() * 0.2, (r() - 0.5) * 0.9], c: col || leafC([0x5f8a3a, 0x6f9a44, 0x7a8f48], 0.2), j: 0.06, sw: 0.4 });
};
env.rock = function (g, M, r, col) {
  const s = [1 + r() * 0.4, 0.6 + r() * 0.4, 1 + r() * 0.4];
  g.sph(1, 6, 4, { m: M, at: [0, 0.25, 0], s, ry: r() * 6, rz: (r() - 0.5) * 0.3, c: col || 0xb7a58a, flat: true, j: 0.08 });
  if (r() < 0.6) g.sph(0.6, 5, 4, { m: M, at: [0.7, 0.1, 0.3], s: [1, 0.7, 1], c: col || 0xa8967c, flat: true, j: 0.08 });
};
env.desertShrub = function (g, M, r) { // v12: grey-green saltbush / broom, wind-bent
  for (let i = 0; i < 9; i++) { const a = r() * PI * 2, l = 0.35 + r() * 0.45; g.cyl(0.006, 0.014, l, 3, { m: M, at: [Math.cos(a) * l * 0.35, l * 0.45, Math.sin(a) * l * 0.35], rz: Math.cos(a) * 0.7, rx: -Math.sin(a) * 0.7, c: 0x7a6a50 }); }
  for (let i = 0; i < 7; i++) g.sph(0.16 + r() * 0.12, 6, 4, { m: M, at: [(r() - 0.5) * 0.7, 0.3 + r() * 0.2, (r() - 0.5) * 0.7], s: [1.2, 0.6, 1.2], c: [0x8a9a6a, 0x9aa478, 0x7a8a5e][i % 3], j: 0.08, flat: true, sw: 0.3 });
};
env.rockField = function (g, M, r, col) { // a weathered outcrop with scree around it
  const c = col || [0xc8a880, 0xb89670, 0xd4b48c]; g.sph(1.2 + r() * 0.8, 6, 4, { m: M, at: [0, 0.4, 0], s: [1.4, 0.75 + r() * 0.5, 1.1], ry: r() * 6, c: c[0], flat: true, j: 0.09 });
  for (let i = 0; i < 9; i++) { const a = r() * PI * 2, d = 1.4 + r() * 1.8; g.sph(0.12 + r() * 0.3, 5, 3, { m: M, at: [Math.cos(a) * d, 0.04, Math.sin(a) * d], s: [1.3, 0.55, 1], ry: r() * 6, c: c[i % 3], flat: true, j: 0.08 }); }
};
env.cliff = function (g, M, r, col) {
  for (let i = 0; i < 6; i++) g.sph(2.5 + r() * 2, 6, 4, { m: M, at: [(r() - 0.5) * 6, r() * 2.5, (r() - 0.5) * 6], s: [1, 1.2 + r(), 1], ry: r() * 6, c: col || [0xc2a27e, 0xb39272, 0xcfb08a][i % 3], flat: true, j: 0.07 });
};
env.reeds = function (g, M, r) {
  for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * 1.6, z = (r() - 0.5) * 1.6, h = 1.2 + r() * 1.2; g.cyl(0.0, 0.035, h, 3, { m: M, at: [x, h / 2, z], rz: (r() - 0.5) * 0.2, c: 0x6f9a3c, j: 0.1, sw: (xx, y) => (y + h / 2) / h }); if (r() < 0.4) g.sph(0.09, 5, 4, { m: M, at: [x, h, z], s: [1, 1.4, 1], c: 0x9a7a4a, sw: 1 }); }
};
env.flowers = function (g, M, r, col) {
  for (let i = 0; i < 6; i++) { const x = (r() - 0.5) * 1.4, z = (r() - 0.5) * 1.4; g.cyl(0.008, 0.01, 0.25, 3, { m: M, at: [x, 0.12, z], c: 0x5f8a3a, sw: 0.5 }); g.sph(0.05, 5, 3, { m: M, at: [x, 0.26, z], s: [1, 0.5, 1], c: col || [0xd8343a, 0xf0e0f0, 0xe8c040][i % 3], j: 0, sw: 0.6 }); }
};
env.tent = function (g, M, r, col) { // bedouin goat-hair tent, ~6 x 4
  const c = col || 0x3e3532;
  for (const [x, z, h] of [[-2.6, -1.6, 1.6], [2.6, -1.6, 1.6], [-2.6, 1.6, 1.4], [2.6, 1.6, 1.4], [0, 0, 2.3], [-1.4, 1.8, 1.5], [1.4, 1.8, 1.5]]) g.cyl(0.05, 0.06, h, 5, { m: M, at: [x, h / 2, z], c: 0x7a5a3a });
  g.box(5.6, 0.12, 3.6, { m: M, at: [0, 1.95, 0], rx: 0.05, c, j: 0.05 });
  g.box(5.6, 1.7, 0.08, { m: M, at: [0, 1.0, -1.7], rx: 0.18, c, j: 0.05 });
  for (const s of [1, -1]) g.box(0.08, 1.6, 3.4, { m: M, at: [2.75 * s, 1.0, 0], rz: 0.15 * s, c, j: 0.05 });
  g.box(5.4, 0.1, 0.1, { m: M, at: [0, 1.9, 1.85], c: (x) => (Math.floor((x + 3) * 2) % 2 ? 0xd8c090 : 0x9a3a2a) });
  g.box(3.2, 0.04, 2.2, { m: M, at: [0, 0.03, 0], c: (x, y, z) => (Math.floor((x + 2) * 3) % 3 === 0 ? 0xb3472e : 0xc89a5a), j: 0 });
  g.sph(0.25, 8, 6, { m: M, at: [-1.6, 0.25, -0.8], c: 0xb5673a }); g.box(0.6, 0.3, 0.6, { m: M, at: [1.5, 0.15, -0.9], c: 0x8a6a40 });
};
env.house = function (g, M, r, o) { // flat-roof stone/mudbrick house w x d
  o = o || {}; const w = o.w || 6, d = o.d || 5, h = o.h || 3, c = o.c || 0xcfb48c;
  g.box(w, h, d, { m: M, at: [0, h / 2, 0], c, j: 0.03 });
  g.box(w + 0.3, 0.25, d + 0.3, { m: M, at: [0, h + 0.1, 0], c: mixHex(c, 0x6a5040, 0.3), j: 0.03 });
  for (let i = -2; i <= 2; i++) g.cyl(0.07, 0.07, 0.6, 5, { m: M, at: [i * w / 5.5, h - 0.15, d / 2 + 0.25], rx: PI / 2, c: 0x7a5a3a });
  g.box(1.1, 1.9, 0.08, { m: M, at: [o.doorX || 0, 0.95, d / 2 + 0.02], c: 0x4a3222, j: 0 });
  g.box(0.6, 0.45, 0.08, { m: M, at: [-w / 3.2, 2.0, d / 2 + 0.02], c: 0x2a2018, j: 0 });
  if (h > 3.6) { for (const x of [-w / 3.2, w / 4]) g.box(0.55, 0.4, 0.08, { m: M, at: [x, h - 1.05, d / 2 + 0.02], c: 0x2a2018, j: 0 }); g.box(w + 0.32, 0.4, 0.12, { m: M, at: [0, h + 0.4, d / 2 + 0.1], c: mixHex(c, 0xffffff, 0.1), j: 0.03 }); // upper windows + parapet
    for (let i = 0; i < 3; i++) g.box(0.12, 0.12, 0.5, { m: M, at: [-w / 2 + 0.6 + i * 0.4, 0.8 + i * 0.05, d / 2 + 0.3], c: 0x7a5a3a }); }
  if (o.awning) { g.box(2.2, 0.06, 1.4, { m: M, at: [o.doorX || 0, 2.2, d / 2 + 0.7], rx: 0.15, c: o.awning }); for (const s of [1, -1]) g.cyl(0.04, 0.04, 2.2, 5, { m: M, at: [(o.doorX || 0) + 1.0 * s, 1.1, d / 2 + 1.3], c: 0x7a5a3a }); }
  if (o.stair) g.box(0.9, h, 2.4, { m: M, at: [w / 2 + 0.45, h / 2 - 0.2, -d / 2 + 1.3], rx: -0.75, c: mixHex(c, 0x000000, 0.08) });
  for (let i = 0; i < 3; i++) g.lathe([[0.05, 0], [0.18, 0.1], [0.2, 0.3], [0.1, 0.5], [0.1, 0.56]], 8, { m: M, at: [w / 2 - 0.4 - i * 0.45, 0, d / 2 + 0.45], c: [0xb5673a, 0xa85a30, 0xc0784a][i] });
};
env.well = function (g, M, r, o) { // v12: a well you believe in — stone courses, a worn lip, a wooden frame with a pulley, rope and bucket
  o = o || {}; const rr = o.r || 1.2, n = Math.max(14, Math.round(rr * 13)), stoneC = [0xb8a68a, 0xa8967a, 0xc4b296, 0x9e8c70];
  for (let k = 0; k < 3; k++) for (let i = 0; i < n; i++) { const a = (i + (k % 2) * 0.5) / n * PI * 2, w = 2 * PI * (rr + 0.28) / n * 0.96;
    g.box(w, 0.26, 0.34, { m: M, at: [Math.cos(a) * (rr + 0.28), 0.14 + k * 0.26, Math.sin(a) * (rr + 0.28)], ry: -a + PI / 2, c: stoneC[(i * 3 + k) % 4], j: 0.06, flat: true }); }
  g.cyl(rr + 0.5, rr + 0.5, 0.1, n, { m: M, at: [0, 0.83, 0], c: 0xcab89a, j: 0.04 }); g.cyl(rr + 0.08, rr + 0.08, 0.11, n, { m: M, at: [0, 0.83, 0], c: 0x2a2620, j: 0 });
  g.cyl(rr, rr, 0.02, n, { m: M, at: [0, 0.35, 0], c: 0x1e3a44, j: 0 }); // dark water far down
  if (o.posts !== false) { for (const s of [1, -1]) { g.cyl(0.08, 0.1, 2.3, 7, { m: M, at: [(rr + 0.3) * s, 1.15, 0], c: 0x6e5038, j: 0.04 }); g.box(0.24, 0.12, 0.24, { m: M, at: [(rr + 0.3) * s, 2.3, 0], c: 0x5e4430 }); }
    g.cyl(0.055, 0.055, rr * 2 + 0.8, 7, { m: M, at: [0, 2.22, 0], rz: PI / 2, c: 0x7a5a3a });
    g.cyl(0.18, 0.18, 0.08, 12, { m: M, at: [0, 2.08, 0], rz: PI / 2, c: 0x8a6a48 }); // pulley wheel
    g.cyl(0.012, 0.012, 1.2, 4, { m: M, at: [0.06, 1.48, 0], c: 0xc8b088 }); // rope
    g.lathe([[0.1, 0], [0.15, 0.04], [0.16, 0.22], [0.14, 0.26]], 9, { m: M, at: [0.06, 0.66, 0], c: 0x7a5232, j: 0.03 }); g.cyl(0.005, 0.005, 0.32, 3, { m: M, at: [0.06, 1.0, 0], rz: 0.4, c: 0x5a4030 }); }
  for (let i = 0; i < 4; i++) g.sph(0.14 + r() * 0.08, 5, 4, { m: M, at: [Math.cos(i * 1.7 + 0.4) * (rr + 0.8), 0.06, Math.sin(i * 1.7 + 0.4) * (rr + 0.8)], s: [1.3, 0.5, 1], c: stoneC[i % 4], flat: true });
};
env.trough = function (g, M, r) {
  g.box(2.4, 0.5, 0.8, { m: M, at: [0, 0.25, 0], c: 0xa89a82, j: 0.06 });
  g.box(2.1, 0.05, 0.55, { m: M, at: [0, 0.47, 0], c: 0x3a6a7a, j: 0 });
};
env.wallSeg = function (g, M, r, len, h, col) { // dry-stone wall along x
  const n = Math.max(1, Math.round(len / 0.7));
  for (let i = 0; i < n; i++) for (let k = 0; k < Math.round(h / 0.35); k++) g.box(0.65 + r() * 0.15, 0.36, 0.55 + r() * 0.1, { m: M, at: [-len / 2 + (i + 0.5) * len / n + (k % 2) * 0.12, 0.18 + k * 0.34, (r() - 0.5) * 0.08], ry: (r() - 0.5) * 0.2, c: col || [0xb9a88c, 0xa8977a, 0xc6b597][(i + k) % 3], j: 0.06 });
};
env.fence = function (g, M, r, len) {
  const n = Math.max(1, Math.round(len / 1.6));
  for (let i = 0; i <= n; i++) g.cyl(0.06, 0.07, 1.1, 5, { m: M, at: [-len / 2 + i * len / n, 0.55, 0], c: 0x7a5a3a });
  for (const y of [0.45, 0.9]) g.box(len, 0.07, 0.05, { m: M, at: [0, y, 0], c: 0x8a6a48 });
};
env.campfire = function (g, M, r) {
  for (let i = 0; i < 8; i++) { const a = i / 8 * PI * 2; g.sph(0.17, 5, 4, { m: M, at: [Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55], c: 0x8a8278, flat: true }); }
  for (let i = 0; i < 3; i++) g.cyl(0.06, 0.07, 0.8, 5, { m: M, at: [0, 0.12, 0], ry: i * 1.05, rz: PI / 2, c: 0x4a3222 });
};
env.pillar = function (g, M) { g.box(0.6, 1.5, 0.45, { m: M, at: [0, 0.75, 0], c: 0xb8ac98, taper: 0.85, j: 0.06 }); };
env.altar = function (g, M, r) { for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) { const a = i / 6 * PI * 2 + k; g.sph(0.35, 5, 4, { m: M, at: [Math.cos(a) * 0.55, 0.25 + k * 0.33, Math.sin(a) * 0.55], c: 0xb0a490, flat: true, j: 0.08 }); } };
env.stallM = function (g, M, r, col) {
  for (const [x, z] of [[-1.1, -0.8], [1.1, -0.8], [-1.1, 0.8], [1.1, 0.8]]) g.cyl(0.05, 0.05, 2.2, 5, { m: M, at: [x, 1.1, z], c: 0x7a5a3a });
  g.box(2.8, 0.08, 2.2, { m: M, at: [0, 2.2, 0], rx: 0.12, c: (x) => (Math.floor((x + 2) * 2.5) % 2 ? col : 0xf0e6d0) });
  g.box(2.2, 0.8, 1.0, { m: M, at: [0, 0.4, 0.2], c: 0x8a6440 });
  for (let i = 0; i < 4; i++) g.sph(0.2, 6, 5, { m: M, at: [-0.75 + i * 0.5, 0.95, 0.2], c: [0xd8a43a, 0x9a5a2a, 0x6e9a3a, 0xc04a3a][i] });
};
env.sacks = function (g, M, r) { for (let i = 0; i < 4; i++) g.lathe([[0.2, 0], [0.32, 0.15], [0.3, 0.45], [0.12, 0.62], [0.16, 0.7]], 8, { m: M, at: [(i % 2) * 0.6, 0, Math.floor(i / 2) * 0.6], c: 0xd8c49a }); };
env.pots = function (g, M, r) { for (let i = 0; i < 3; i++) g.lathe([[0.08, 0], [0.25, 0.15], [0.28, 0.45], [0.14, 0.75], [0.15, 0.85]], 10, { m: M, at: [i * 0.55, 0, (i % 2) * 0.3], c: [0xb5673a, 0xa85a30, 0xc0784a][i] }); };
// ---- Egypt
env.egHouse = function (g, M, r, o) { env.house(g, M, r, Object.assign({ c: r() < 0.5 ? 0xeee4cc : 0xdcc7a0, stair: true }, o)); };
env.granary = function (g, M, r, built) {
  g.box(10, 0.8, 6, { m: M, at: [0, 0.4, 0], c: 0xb48a5c, j: 0.04 });
  if (!built) { for (const [x, z] of [[-4.5, -2.5], [4.5, -2.5], [-4.5, 2.5], [4.5, 2.5]]) g.cyl(0.08, 0.08, 2, 5, { m: M, at: [x, 1.8, z], c: 0x8a6a48 }); g.box(9.2, 0.04, 0.04, { m: M, at: [0, 2.6, 2.5], c: 0xd8c8a0 }); return; }
  for (const ox of [-3.2, 0, 3.2]) { g.cyl(1.45, 1.6, 3.6, 14, { m: M, at: [ox, 2.6, -0.4], c: 0xefe5cf, j: 0.02 }); g.sph(1.45, 14, 7, { m: M, at: [ox, 4.4, -0.4], tl: PI / 2, s: [1, 0.9, 1], c: 0xe8dcc0 }); g.box(0.6, 0.6, 0.1, { m: M, at: [ox, 4.5, 1.0], c: 0x3a2618 }); }
  g.box(1.3, 1.7, 0.12, { m: M, at: [0, 1.65, 1.0], c: 0x3a2618 });
};
env.column = function (g, M, r, h) { h = h || 7.5; g.cyl(0.75, 0.8, h, 12, { m: M, at: [0, h / 2, 0], c: 0xe4d2a9, j: 0.02 }); g.cyl(1.15, 0.75, 1.0, 12, { m: M, at: [0, h + 0.4, 0], c: 0x2f8a77 }); g.cyl(0.78, 0.78, 0.35, 12, { m: M, at: [0, h * 0.72, 0], c: 0xb3472e }); g.cyl(0.78, 0.78, 0.25, 12, { m: M, at: [0, h * 0.62, 0], c: 0x2f8a77 }); };
env.obelisk = function (g, M) { g.cyl(0.45, 0.7, 8, 4, { m: M, at: [0, 4, 0], ry: PI / 4, c: 0xe0c48e }); g.cyl(0, 0.5, 1, 4, { m: M, at: [0, 8.5, 0], ry: PI / 4, c: 0xd9a73a }); };
env.pyramid = function (g, M, r, s) { g.cyl(0, s, s * 1.25, 4, { m: M, at: [0, s * 0.625 - 1, 0], ry: PI / 4, c: 0xe3c891, flat: true, j: 0.02 }); };
env.shaduf = function (g, M) {
  for (const s of [1, -1]) g.cyl(0.08, 0.1, 2.4, 6, { m: M, at: [0.4 * s, 1.2, 0], c: 0x8a6a48 });
  g.cyl(0.05, 0.05, 1.0, 5, { m: M, at: [0, 2.3, 0], rz: PI / 2, c: 0x6a4a30 });
  g.cyl(0.05, 0.06, 4.8, 6, { m: M, at: [0, 2.6, 0], rx: PI / 2 - 0.35, c: 0x7a5a3a });
  g.sph(0.35, 6, 5, { m: M, at: [0, 1.85, -2.2], c: 0x8a7a6a, flat: true });
  g.cyl(0.015, 0.015, 1.6, 4, { m: M, at: [0, 2.6, 2.25], c: 0x6a5a40 }); g.lathe([[0.1, 0], [0.18, 0.1], [0.2, 0.3], [0.12, 0.4]], 8, { m: M, at: [0, 1.5, 2.25], c: 0xb5673a });
};
env.pylon = function (g, M) { g.cyl(6.4, 8.49, 11, 4, { m: M, at: [0, 5.5, 0], ry: PI / 4, s: [1, 1, 0.34], c: 0xe4d2a9, flat: true, j: 0.02 }); g.box(9.6, 1.1, 0.12, { m: M, at: [0, 8.4, 1.62], c: 0x2c5aa0 }); g.box(7.8, 0.6, 0.12, { m: M, at: [0, 6.9, 1.7], c: 0xb3472e }); g.box(10.2, 0.6, 3.4, { m: M, at: [0, 11.2, 0], c: 0xd9a73a }); };
env.stairway = function (g, M) { // dream ladder
  for (let i = 0; i < 60; i++) g.box(3, 0.25, 1.2, { m: M, at: [0, 0.3 + i * 0.6, -i * 0.9], c: mixHex(0xfff0c0, 0xffd27a, i / 60), j: 0 });
  for (let i = 0; i < 60; i += 4) for (const s of [1, -1]) g.cyl(0.08, 0.08, 1.5, 6, { m: M, at: [1.55 * s, 1.0 + i * 0.6, -i * 0.9], c: 0xffe6a0 });
};

// =================================================================== MESH CACHE
const cache = {};
function meshOf(key, build) { if (!cache[key]) cache[key] = G.R.mesh(build()); return cache[key]; }

Object.assign(G, { HB, HBK, HBI: B, AB, Rig, humanoid, animHuman, animPose, locoPose, actPose, inertia, clothSim, faceAnim, stepRate, stepLen, animal, animAnimal, prop, env, meshOf, shade, strand, crv });
})(window.G);
