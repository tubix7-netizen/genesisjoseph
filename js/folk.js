/* 약속의 길 — v23 마을 사람 (Folk): every person in the story is drawn from the Joseph GLB model (assets/heroes/joseph*),
   so the whole cast shares his hand-painted, toon-shaded look — but nobody is Joseph:
   1. RECOLOUR  the shader repaints skin, hair, the outer coat (two-tone bands), the light under-tunic and trousers, the leather,
                stubble, lips and cheeks per person (masks from tools/folkmask.py, palette from the person's old look).
   2. BUILD     each person is a little taller or shorter, broader or slimmer, with a slightly different head size; children are
                small with bigger heads.
   3. GEAR      what made the old code-built people recognisable is rebuilt around the GLB head and body (their outlines are
                measured from the mesh once): beards (short, long, the false Egyptian one), moustaches, cloth headdresses with a
                band, turbans, veils, wigs, linen caps, the nemes, round caps, long robes and dresses, shawls, sashes, Egyptian
                broad collars, long hair, buns and braids.
   Everyone keeps the motion engine (walk, sit, act, emotions) because the rig has the same bones. Far away (and in the shadow
   map) people use lighter copies of the mesh (joseph_lo, joseph_lo2). ?folk=0 brings back the old code-built people. */
'use strict';
(function (G) {
const F = G.Folk = { on: !/[?&]folk=0\b/.test(location.search), ready: false };
const { GB, mixHex, clamp } = G, PI = Math.PI, TAU = PI * 2;
const ROOT = 'assets/heroes/';
const hex3 = c => [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
const sst = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const BW = (b0, b1, w) => w <= 0.004 ? b0 : w >= 0.996 ? b1 : b0 + b1 * 32 + Math.round(w * 255) * 1024;
const BN = { pelvis: 0, chest: 1, head: 2, uArmL: 3, fArmL: 4, uArmR: 5, fArmR: 6, thighL: 7, shinL: 8, thighR: 9, shinR: 10, back: 13, cape: 14 };
const LINEN = 0xf0e8d6;

// ------------------------------------------------------------------ loading
F.load = function () {
  if (F._p || !F.on || (G.HeroAsset && G.HeroAsset.off)) return F._p;
  const HA = G.HeroAsset;
  F._p = fetch(ROOT + 'folk.json?' + G.HeroAsset.av).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(meta => Promise.all([HA.load(meta.base), HA.load(meta.lo), meta.lo2 ? HA.load(meta.lo2) : null, HA.img(ROOT + meta.mask)]).then(([hi, lo, lo2, mask]) => {
      if (!hi || !mask) throw new Error('folk asset');
      G.R.folkMask = G.R.texArray(mask, meta.layers || 3);
      const r = meta.ref; G.R.folkRef = { s: r.skin.slice(0, 3), l: [r.hair[3], r.coat[3], r.cloth[3], r.leather[3]] };
      F.hi = hi; F.lo = lo || hi; F.lo2 = lo2 || F.lo; F.def = hi.def; F.meta = meta; profiles(hi); skinProfile(meta.skinProf); F.ready = true; return F;
    })).catch(e => { console.warn('[Folk] 끔 (불러오기 실패)', e); F.on = false; return null; });
  return F._p;
};

// ------------------------------------------------------------------ outlines measured from the mesh
/* head: the farthest head/hair vertex from the head's vertical axis, per height (1 cm) and direction (7.5°);
   body: the same for the torso (no arms) — caps, beards, veils, shawls and collars are laid over these */
const HY0 = 1.40, HY1 = 1.86, HDY = 0.01, NA = 48, BY0 = 0.6, BY1 = 1.56, BDY = 0.02, ZC = -0.012;
let HP = null, BP = null;
function profiles(a) {
  const pos = a.cpu.pos, bone = a.cpu.bone, nH = Math.round((HY1 - HY0) / HDY) + 1, nB = Math.round((BY1 - BY0) / BDY) + 1;
  HP = new Float32Array(nH * NA); BP = new Float32Array(nB * NA);
  for (let i = 0; i < bone.length; i++) {
    const b = bone[i] % 32, x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2] - ZC, r = Math.hypot(x, z), k = (Math.round(Math.atan2(x, z) / TAU * NA) + NA) % NA;
    if (b === 2 || b === 15 || b === 16) { const j = Math.round((y - HY0) / HDY); if (j >= 0 && j < nH && r > HP[j * NA + k]) HP[j * NA + k] = r; }
    else if (b === 0 || b === 1 || b === 13 || b === 14) { const j = Math.round((y - BY0) / BDY); if (j >= 0 && j < nB && r > BP[j * NA + k]) BP[j * NA + k] = r; }
  }
  for (const [T, n] of [[HP, nH], [BP, nB]]) for (let pass = 0; pass < 3; pass++) for (let j = 0; j < n; j++) for (let k = 0; k < NA; k++) { // fill holes, then soften
    const o = j * NA + k, l = T[j * NA + (k + NA - 1) % NA], rr = T[j * NA + (k + 1) % NA], u = j + 1 < n ? T[o + NA] : 0, d = j > 0 ? T[o - NA] : 0;
    if (!T[o]) T[o] = Math.max(l, rr, u, d) * 0.98; else if (pass === 2) T[o] = Math.max(T[o], (l + rr) * 0.5);
  }
  HS = new Float32Array(HP); const nH2 = nH; for (let pass = 0; pass < 6; pass++) { const T = new Float32Array(HS); for (let j = 0; j < nH2; j++) for (let k = 0; k < NA; k++) { let s = 0, w = 0;
    for (let dj = -1; dj <= 1; dj++) for (let dk = -2; dk <= 2; dk++) { const jj = j + dj; if (jj < 0 || jj >= nH2) continue; s += T[jj * NA + (k + dk + NA) % NA]; w++; } HS[j * NA + k] = Math.max(T[j * NA + k], s / w); } }
  F.HP = HP; F.BP = BP;
}
let HS = null, SP = null;
/* the skin-only face outline (tools/folkmask.py): beards lie on the jaw and cheeks, not on the hair beside them. Holes are filled
   from the neighbours; jaw(az) is the height where the face ends and the neck begins */
function skinProfile(sp) {
  if (!sp) return; const ny = sp.r.length, na = sp.na, T = new Float32Array(ny * na);
  for (let j = 0; j < ny; j++) for (let k = 0; k < na; k++) T[j * na + k] = sp.r[j][k];
  for (let pass = 0; pass < 4; pass++) for (let j = 0; j < ny; j++) for (let k = 0; k < na; k++) { const o = j * na + k; if (T[o]) continue;
    const c = [T[j * na + (k + 1) % na], T[j * na + (k + na - 1) % na]].filter(Boolean); if (c.length) T[o] = c.reduce((a, b) => a + b) / c.length; }
  const jaw = new Float32Array(na); for (let k = 0; k < na; k++) { let jl = sp.y0 + (ny - 1) * sp.dy; for (let j = 0; j < ny; j++) if (T[j * na + k] > 0.08) { jl = sp.y0 + j * sp.dy; break; } jaw[k] = jl; }
  SP = { T, ny, na, y0: sp.y0, dy: sp.dy, jaw };
}
const skinR = (y, az) => SP ? samp(SP.T, SP.y0, SP.dy, SP.ny, y, az) : headR(y, az);
const jawY = az => { if (!SP) return 1.505; const fk = ((az / TAU * NA) % NA + NA) % NA, k = Math.floor(fk), t = fk - k; return SP.jaw[k] * (1 - t) + SP.jaw[(k + 1) % NA] * t; };
const headS = (y, az) => samp(HS, HY0, HDY, Math.round((HY1 - HY0) / HDY) + 1, y, az); // the same, smoothed and never inside the hair
function samp(T, y0, dy, n, y, az) { const fj = clamp((y - y0) / dy, 0, n - 1.001), j = Math.floor(fj), tj = fj - j, fk = ((az / TAU * NA) % NA + NA) % NA, k = Math.floor(fk), tk = fk - k, k1 = (k + 1) % NA;
  const a = T[j * NA + k] * (1 - tk) + T[j * NA + k1] * tk, b = T[(j + 1) * NA + k] * (1 - tk) + T[(j + 1) * NA + k1] * tk; return a * (1 - tj) + b * tj; }
const headR = (y, az) => samp(HP, HY0, HDY, Math.round((HY1 - HY0) / HDY) + 1, y, az);
const bodyR = (y, az) => samp(BP, BY0, BDY, Math.round((BY1 - BY0) / BDY) + 1, y, az);
const at = (az, r, y) => [Math.sin(az) * r, y, ZC + Math.cos(az) * r]; // az = 0 is the face (+z)

// ------------------------------------------------------------------ palette
function robeCol(L) { const top = L.top === undefined ? 0xd9c9a6 : L.top; return F.isFem(L) ? (L.under !== undefined ? L.under : top) : L.under !== undefined ? L.under : mixHex(top, 0xeee6d2, 0.5); }
const PAL = new WeakMap();
function hash(s) { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
function rnd(h, k) { let x = Math.imul(h ^ (k * 2654435761), 1597334677); x ^= x >>> 15; return (x >>> 0) / 4294967296; }
F.isFem = L => L.fem !== undefined ? !!L.fem : L.headwear === 'veil';
F.isEgy = L => !!(L.collar || L.kilt || L.linenPanel || L.headwear === 'nemes' || L.hairStyle === 'wig');
function palette(L) {
  let p = PAL.get(L); if (p) return p;
  const fem = F.isFem(L), egy = F.isEgy(L), kid = !!L.kid, old = L.age === 'old';
  const top = L.top === undefined ? 0xd9c9a6 : L.top, stripes = L.stripes;
  let coatA = stripes ? stripes[0] : L.bare && L.bottom !== undefined ? L.bottom : top, coatB;
  if (stripes) coatB = stripes.find(c => c !== coatA) || mixHex(coatA, 0x000000, 0.35);
  else if (egy) coatB = mixHex(coatA, 0xffffff, 0.12);
  else coatB = mixHex(coatA, L.trim !== undefined ? L.trim : mixHex(coatA, 0x000000, 0.45), 0.4);
  const under = (fem || L.long) ? robeCol(L) : L.under !== undefined ? L.under : L.bottom !== undefined && L.bottom !== top ? L.bottom : mixHex(top, egy ? 0xf4eee0 : 0xeee6d2, 0.62);
  const hair = L.hair !== undefined ? L.hair : old ? 0xc8c0b4 : 0x2a1a12;
  p = { skin: hex3(L.skin === undefined ? 0xd29a6c : L.skin), hair: hex3(L.hairStyle === 'bald' ? mixHex(L.skin || 0xb07448, 0x000000, 0.25) : hair), coatA: hex3(coatA), coatB: hex3(coatB),
    cloth: hex3(under), leath: hex3(L.belt || L.sandal || (egy ? 0x8a6a40 : 0x5a3a24)),
    rosy: fem ? [1.0, 0.66, 0.64] : kid ? [1.0, 0.8, 0.76] : [0.96, 0.76, 0.72],
    k: [egy ? 0.28 : stripes ? 0.4 : 0.55, fem || kid ? 0 : L.beard ? 0.75 : egy ? 0.12 : 0.32, fem ? 0.7 : kid ? 0.5 : 0.3, 1] };
  PAL.set(L, p); return p;
}
F.palette = palette;

// ------------------------------------------------------------------ faces (v24)
/* every person gets their own brows (height, thickness, tilt, arch, colour), eye colour, lashes, age lines, resting mouth and
   freckles; in a scene the feeling of the moment (rig.emF, rig.emW from the motion engine) bends the brows and the mouth */
const EXPR = { // tilt (+ inner ends up), smile, brow raise
  sad: [0.9, -0.7, 0], cry: [1.1, -0.9, 0], weary: [0.5, -0.4, -0.1], tired: [0.3, -0.3, -0.2], fear: [1, -0.4, 0.5], angry: [-1.2, -0.6, -0.3], shout: [-0.9, -0.2, 0],
  urgent: [-0.4, -0.1, 0.2], happy: [0.15, 1, 0.1], laugh: [0.2, 1.2, 0.2], tender: [0.35, 0.6, 0], solemn: [-0.25, -0.15, -0.1], pray: [0.3, 0.1, 0], awe: [0.6, 0.2, 0.6],
  whisper: [0.2, 0, 0], calm: [0, 0.25, 0], cold: [0.5, -0.4, 0], surprise: [0.7, 0, 0.9], startle: [0.8, -0.2, 0.8], think: [-0.45, -0.1, -0.1] };
const FACE = new WeakMap();
const EYES = [0x4a2e1c, 0x5a3a20, 0x3a2416, 0x6a4a2a, 0x4a2e1c, 0x5a3a20, 0x2e2018, 0x6a4a2a, 0x6e5a30, 0x4a5638]; // mostly browns, a hazel and a dark green now and then
function faceOf(L, id) {
  let f = FACE.get(L); if (f) return f; const h = hash(id + '#f'), fem = F.isFem(L), kid = !!L.kid, old = L.age === 'old';
  const hair = L.hair !== undefined ? L.hair : old ? 0xc8c0b4 : 0x2a1a12, hl = ((hair >> 16 & 255) + (hair >> 8 & 255) + (hair & 255)) / 765;
  const brow = hl > 0.6 ? mixHex(hair, 0x8a8078, 0.35) : mixHex(hair, 0x000000, 0.35);
  const thick = fem ? 0.005 + rnd(h, 1) * 0.0018 : kid ? 0.006 + rnd(h, 1) * 0.0018 : 0.0078 + rnd(h, 1) * 0.0045 + (old ? 0.001 : 0);
  const tilt = (L.browAng !== undefined ? -L.browAng * 1.1 : 0) + (rnd(h, 2) - 0.5) * 0.7;
  const arch = fem ? 1.2 + rnd(h, 3) * 0.5 : 0.25 + rnd(h, 3) * 0.8;
  const eye = L.eye !== undefined ? L.eye : EYES[Math.floor(rnd(h, 4) * EYES.length)];
  const smile = L.smile !== undefined ? L.smile * 0.9 : (rnd(h, 5) - 0.4) * 0.6;
  const age = old ? 0.85 + rnd(h, 6) * 0.15 : kid || fem ? 0 : Math.max(0, rnd(h, 6) - 0.55) * (L.beard ? 0.9 : 0.6);
  const freck = !old && !F.isEgy(L) && rnd(h, 7) < (kid ? 0.35 : 0.18) ? 0.6 + rnd(h, 8) * 0.4 : 0;
  f = { dy: (rnd(h, 9) - 0.45) * 0.005, thick, tilt, arch, smile, age, lash: fem ? (kid ? 0.6 : 1) : 0, freck, brow: hex3(brow), eye: hex3(eye),
    out: { f0: [0, 0, 0, 0], f1: [0, 0, 0, 0], brow: null, eye: null } };
  FACE.set(L, f); return f;
}
function act(f, rig) { // the face of this moment: the person's own face, bent by the feeling of the scene
  const o = f.out, k = rig && rig.emF ? EXPR[rig.emF] : null, w = k ? Math.min(1, rig.emW || 0) : 0;
  o.f0[0] = f.dy + (k ? k[2] * 0.0035 * w : 0); o.f0[1] = f.thick; o.f0[2] = f.tilt * (1 - 0.6 * w) + (k ? k[0] * w : 0); o.f0[3] = f.arch + (k ? Math.max(0, k[2]) * 0.6 * w : 0);
  o.f1[0] = f.smile * (1 - w) + (k ? k[1] * w : 0); o.f1[1] = f.age; o.f1[2] = f.lash; o.f1[3] = f.freck; o.brow = f.brow; o.eye = f.eye; return o;
}
const HERO_F = { dy: 0.0005, thick: 0.0112, tilt: 0.05, arch: 1, smile: 0, age: 0, lash: 0, freck: 0, brow: hex3(0x120a08), eye: [0, 0, 0] /* his own painted eyes */, out: { f0: [0, 0, 0, 0], f1: [0, 0, 0, 0] } };
F.heroFace = rig => (F.ready ? act(HERO_F, rig) : null);

// ------------------------------------------------------------------ gear
const GEAR = {};
const gearKey = L => JSON.stringify([L.beard, L.beardCol, L.hair, L.headwear, L.hairStyle, L.clothCol, L.clothStripe, L.bandCol, L.capCol, L.mantle, L.mantleTrim, L.mantleShort, L.long, L.fem, L.kid,
  L.collar, L.collar2, L.sash, L.top, L.under, L.bottom, L.headband, L.stripesB, L.goatskin, L.age, L.skin]);
function gearMesh(L) {
  const key = gearKey(L); if (GEAR[key] !== undefined) return GEAR[key];
  /* v24 최적화: at most two new gear meshes in any ~16 ms (≈0.7 ms each here, several times that on a phone), so walking into a crowd
     does not stall a frame; the rest appear over the next frames */
  const now = performance.now(); if (now - (F.bT || 0) > 16) { F.bT = now; F.bN = 0; } if (F.bN >= 2) return null; F.bN++;
  const g = new GB(hash(key) % 997 + 5); build(g, L); return (GEAR[key] = g.count ? G.R.mesh(g) : null);
}
F.gearMesh = gearMesh;
/* a sheet laid over a measured outline: az from a0 to a1 (u), height from yT(az) down to yB(az) (v), radius rad(az, y, v) */
function sheet(g, a0, a1, yT, yB, rad, nu, nv, o) {
  g.surf((u, v) => { const az = a0 + (a1 - a0) * u, y0 = yT(az), y1 = yB(az), y = y0 + (y1 - y0) * v; return at(az, rad(az, y, v, u), y); }, nu, nv, Object.assign({ ds: true, inner: 0.35 }, o));
}
const headToChest = (y0, y1) => (x, y, z) => BW(BN.head, BN.chest, sst(y0, y1, y));
function cap(g, col, edgeFront, edgeBack, pad, o) { // a cloth or wig shell over the hair, down to the brow in front and the nape behind
  const brow = az => { const f = Math.pow(Math.max(0, Math.cos(az)), 0.6); return edgeFront * f + edgeBack * (1 - f); };
  g.surf((u, v) => { const az = u * TAU, yE = brow(az), y = 1.875 - (1.875 - yE) * Math.pow(v, 0.85); const r = v < 0.02 ? 0 : headS(Math.max(y, 1.47), az) + pad * (0.6 + 0.4 * v); return at(az, r * Math.min(1, v * 7), y); },
    28, 9, Object.assign({ c: col, b: BN.head, j: 0.03, ds: true }, o));
}
function build(g, L) {
  const fem = F.isFem(L), egy = F.isEgy(L), hw = L.headwear, hs = L.hairStyle, hair = L.hair !== undefined ? L.hair : L.age === 'old' ? 0xc8c0b4 : 0x2a1a12;
  const beardRaw = L.beardCol !== undefined ? L.beardCol : hair, bl = ((beardRaw >> 16 & 255) + (beardRaw >> 8 & 255) + (beardRaw & 255)) / 765, beardC = bl < 0.3 ? mixHex(beardRaw, 0x7a5638, 0.3) : beardRaw, /* a dark beard is lifted a little (in cel shade a black beard read as a mask) */ cloth = L.clothCol !== undefined ? L.clothCol : 0xe8e0cc, band = L.bandCol !== undefined ? L.bandCol : 0x5a3a24;
  const top = L.top === undefined ? 0xd9c9a6 : L.top;
  // ---- beards
  if (L.beard && L.beard !== 'false' && !L.kid && !fem) {
    const long = L.beard === 'long', A0 = 1.42;
    const yT = az => { const s = Math.abs(az) / A0; return 1.551 + (1.628 - 1.551) * sst(0.32, 1, s); }; // under the lower lip in front, up the jaw to the sideburns
    const yB = az => { const s = Math.abs(az) / A0, jl = jawY(az); return long ? jl - 0.15 * (1 - sst(0.1, 0.8, s)) - 0.02 : jl - 0.02 * (1 - 0.5 * s); };
    if (!long) sheet(g, -A0, A0, yT, yB, (az, y, v) => {
      const s = Math.abs(az) / A0, jl = jawY(az), rj = skinR(jl + 0.005, az);
      const r0 = y >= jl ? Math.max(skinR(y, az), 0.05) : rj * (1 - (jl - y) * 6);
      return r0 + 0.0065 + (y < jl ? 0.004 : 0); },
    24, 6, { c: (x, y) => mixHex(beardC, 0x000000, ((Math.floor(y * 140 + x * 60) % 3) === 0) ? 0.12 : 0), bf: headToChest(1.46, 1.3), soft: 0.45, j: 0.06 });
    else { // a long beard: on the jaw like the short one, then a full rounded mass that narrows to a point on the chest
      const yE = 1.36;
      g.surf((u, v) => { const az0 = -A0 + 2 * A0 * u, y0 = yT(az0), jl = jawY(az0), y = y0 + (yE - y0) * v, t = clamp((jl - y) / (jl - yE), 0, 1),
        az = az0 * (1 - 0.62 * Math.pow(t, 0.8)), rj = skinR(jl + 0.005, az0), r = y >= jl ? Math.max(skinR(y, az), 0.05) + 0.012 : rj * (1 - 0.3 * t) + 0.016 + 0.035 * Math.sin(t * PI * 0.85) * Math.max(0, Math.cos(az0 * 0.9));
        return at(az, r, y - 0.012 * t * t * Math.abs(az0) / A0); }, 24, 12,
        { c: (x, y, z) => mixHex(beardC, Math.abs(Math.floor(Math.atan2(x, z - ZC) * 30)) % 3 === 0 ? 0x000000 : 0xffffff, Math.abs(Math.floor(Math.atan2(x, z - ZC) * 30)) % 3 === 0 ? 0.14 : 0.04), bf: headToChest(1.47, 1.33), soft: 0.45, j: 0.05, ds: true });
    }
    // moustache
    g.surf((u, v) => { const az = -0.62 + 1.24 * u, droop = Math.pow(Math.abs(az) / 0.62, 2) * 0.014, y = 1.58 - droop - v * 0.01; return at(az, skinR(y, az) + 0.006 - v * 0.003, y); }, 10, 2, { c: beardC, b: BN.head, ds: true, soft: 0.45 });
  }
  if (L.beard === 'false') { // the plaited false beard of a pharaoh
    for (let i = 0; i < 6; i++) g.cyl(0.018 - i * 0.0015, 0.02 - i * 0.0015, 0.022, 8, { at: [0, 1.5 - i * 0.02, ZC + headR(1.5, 0) - 0.006 - i * 0.004], rx: 0.2, c: i % 2 ? 0x15100c : 0x3a2a1a, b: BN.head });
    g.cyl(0.004, 0.004, 0.1, 4, { at: [0.045, 1.53, ZC + headR(1.53, 0.5) - 0.01], rz: -0.3, c: GOLDC, b: BN.head }); g.cyl(0.004, 0.004, 0.1, 4, { at: [-0.045, 1.53, ZC + headR(1.53, -0.5) - 0.01], rz: 0.3, c: GOLDC, b: BN.head });
  }
  // ---- head coverings
  const stripe = L.clothStripe;
  const clothC = stripe ? (x, y, z) => (Math.abs(x) > 0.15 || y < 1.47) && Math.abs(Math.floor((y - 1.3) * 30)) % 6 === 2 ? stripe : cloth : cloth;
  if (hw === 'cloth' || hw === 'veil') {
    const veil = hw === 'veil', front = veil ? 1.69 : 1.715;
    cap(g, clothC, front, 1.6, 0.01);
    const open = veil ? 0.62 : 0.78; // the face opening (half width, radians)
    const back = az => sst(1.9, 2.7, Math.abs(Math.atan2(Math.sin(az), Math.cos(az)))); // 0 at the sides and front, 1 down the back
    sheet(g, open, TAU - open, az => 1.66 - 0.05 * Math.max(0, Math.cos(az)), az => (veil ? 1.4 : 1.42) - back(az) * (veil ? 0.32 : 0.06),
      (az, y, v) => { const sh = Math.abs(Math.sin(az)), r = y > 1.5 ? headR(y, az) + 0.016 : Math.max(bodyR(Math.min(y, 1.5), az) + 0.03, Math.min(headR(1.5, az) + 0.016 + (1.5 - y) * 1.3, 0.12 + 0.1 * sh));
        return r + 0.008 * Math.sin(az * 9) * v; }, 30, veil ? 12 : 7, { c: clothC, bf: (x, y, z) => BW(BN.head, BN.chest, sst(1.6, 1.4, y)), j: 0.02 });
    if (!veil) { // the band (agal) holding the cloth
      for (const dy of [0, 0.026]) g.surf((u, v) => { const az = u * TAU, a = v * TAU, y = 1.742 + dy + Math.sin(a) * 0.011; return at(az, headR(1.742 + dy, az) + 0.022 + Math.cos(a) * 0.011, y); }, 24, 4, { c: band, b: BN.head });
    } else if (L.headband) g.surf((u, v) => { const az = -1.2 + 2.4 * u, y = 1.72 + v * 0.016; return at(az, headR(y, az) + 0.02, y); }, 12, 1, { c: L.headband, b: BN.head, ds: true });
  } else if (hw === 'turban') { // a long cloth wound round and round: fat diagonal coils over a dome, the loose end tucked in behind
    const tc = cloth, bc = L.clothStripe || band;
    g.surf((u, v) => { const az = u * TAU, y = 1.675 + v * 0.2 - 0.025 * Math.cos(az) * (1 - v), coil = Math.abs(Math.sin((v * 3.4 + az / TAU * 1.0) * PI)) * 0.016,
      dome = v > 0.66 ? Math.sqrt(Math.max(0, 1 - Math.pow((v - 0.66) / 0.34, 2))) : 1;
      return at(az, (headS(Math.min(y, 1.83), az) + 0.04 + coil) * dome, y + (v > 0.66 ? 0.03 * (v - 0.66) / 0.34 : 0)); }, 32, 14,
      { c: (x, y, z) => { const az = Math.atan2(x, z - ZC); return Math.abs(Math.floor((y - 1.675) * 17 + az / TAU)) % 3 === 1 ? bc : tc; }, b: BN.head, j: 0.03, ds: true });
    g.surf((u, v) => { const az = PI - 0.35 + u * 0.5, y = 1.7 - v * 0.17; return at(az, headS(Math.max(y, 1.55), az) + 0.03 + v * 0.01, y); }, 4, 4, { c: tc, bf: headToChest(1.6, 1.45), ds: true });
  } else if (hw === 'band') {
    g.surf((u, v) => { const az = u * TAU, y = 1.71 + v * 0.022; return at(az, headR(y, az) + 0.012, y); }, 24, 1, { c: band, b: BN.head, ds: true });
  } else if (hw === 'cap') {
    cap(g, L.capCol || 0x6a2a5a, 1.75, 1.72, 0.016); g.surf((u, v) => { const az = u * TAU, y = 1.725 + v * 0.03; return at(az, headR(y, az) + 0.02, y); }, 24, 1, { c: GOLDC, b: BN.head, ds: true });
  } else if (hw === 'nemes') {
    const nc = (x, y) => Math.abs(Math.floor((y - 1.2) * 34)) % 2 ? GOLDC : 0x2a4a8a;
    cap(g, nc, 1.72, 1.6, 0.018);
    for (const s of [1, -1]) g.surf((u, v) => { const x = s * (0.1 + 0.07 * u + 0.05 * v), y = 1.66 - v * 0.34, z = 0.03 + 0.03 * u; return [x, y, z]; }, 3, 6, { c: nc, bf: headToChest(1.55, 1.38), ds: true });
    g.surf((u, v) => { const az = PI - 0.5 + u, y = 1.6 - v * 0.24; return at(az, headR(Math.max(y, 1.5), az) + 0.02 - v * 0.03, y); }, 6, 4, { c: nc, bf: headToChest(1.55, 1.4), ds: true });
    g.sph(0.014, 6, 4, { at: [0, 1.745, ZC + headR(1.745, 0) + 0.02], c: GOLDC, b: BN.head });
  }
  // ---- hair styles (only when the head is uncovered)
  if (!hw || hw === 'band') {
    if (hs === 'wig') { cap(g, 0x15100c, 1.715, 1.56, 0.02, { j: 0.02 }); sheet(g, 0.95, TAU - 0.95, () => 1.62, az => 1.5 + 0.03 * Math.abs(Math.cos(az)), (az, y) => headR(Math.max(y, 1.55), az) + 0.026, 22, 3, { c: (x, y) => Math.floor(x * 120) % 2 ? 0x15100c : 0x221812, b: BN.head }); }
    else if (hs === 'bald') cap(g, egy ? LINEN : mixHex(L.skin || 0xb07448, 0x000000, 0.1), 1.735, 1.6, 0.012); // a close linen cap over the hair (shaven Egyptians)
    else if (fem && (hs === 'long' || hs === 'braid' || !hs)) sheet(g, PI - 1.25, PI + 1.25, () => 1.66, () => 1.18, (az, y) => Math.max(headR(Math.max(y, 1.5), az) * (y < 1.5 ? 0.9 : 1), bodyR(Math.min(y, 1.5), az) + 0.02) + 0.008, 14, 9,
      { c: (x, y) => mixHex(hair, 0x000000, Math.floor(x * 90) % 2 ? 0.1 : 0), bf: headToChest(1.58, 1.4), soft: 0.45 });
    else if (hs === 'bun') g.sph(0.06, 10, 7, { at: [0, 1.7, ZC - headR(1.7, PI) - 0.03], s: [1, 0.9, 0.8], c: hair, b: BN.head, soft: 0.45 });
    else if (hs === 'tied') g.cyl(0.018, 0.03, 0.14, 6, { at: [0, 1.6, ZC - headR(1.62, PI) - 0.02], rx: 0.35, c: hair, b: BN.head, soft: 0.45 });
  }
  // ---- long robe / dress over the trousers
  if (L.long || fem) {
    const col = robeCol(L), trim = L.trim2 || L.trim || mixHex(col, 0x000000, 0.4), hem = 0.055, y0 = 0.86;
    g.surf((u, v) => { const az = u * TAU, y = y0 - (y0 - hem) * v, f = sst(0, 1, v), rx = 0.17 + 0.07 * f, rz = 0.13 + 0.07 * f; return [Math.sin(az) * rx, y, 0.006 + Math.cos(az) * rz]; }, 26, 7,
      { c: (x, y) => y < hem + 0.06 && y > hem + 0.025 ? trim : col, bf: (x, y) => { const L0 = x >= 0, w = clamp(1 - Math.abs(x - (L0 ? 0.085 : -0.085)) / 0.2, 0, 1) * (0.35 + 0.35 * sst(0.86, 0.3, y)); return BW(0, L0 ? 7 : 9, w); }, ds: true, j: 0.02 });
  }
  // ---- shawl / mantle over the shoulders
  if (L.mantle && !egy) {
    const yB = L.mantleShort ? 1.2 : 0.95, mc = L.mantle, mt = L.mantleTrim || mixHex(mc, 0x000000, 0.35);
    sheet(g, 0.55, TAU - 0.55, az => 1.47 + 0.02 * Math.cos(az), az => yB + (1.32 - yB) * sst(0.3, 1, Math.max(0, Math.cos(az))), (az, y) => bodyR(y, az) + 0.03 + (y > 1.38 ? 0.02 * (1 - Math.abs(Math.sin(az))) : 0) + Math.abs(Math.sin(az)) * 0.05 * sst(1.44, 1.38, y),
      24, 8, { c: (x, y, z) => (y < yB + 0.05 ? mt : mc), bf: (x, y) => BW(BN.chest, BN.cape, sst(1.38, yB, y) * 0.6), j: 0.03 });
  }
  // ---- Egyptian broad collar
  if (L.collar) { const c1 = L.collar, c2 = L.collar2 || mixHex(c1, 0xffffff, 0.3);
    // a broad collar of bead rows: from the neck out over the collarbones and the top of the shoulders, lying on the coat
    g.surf((u, v) => { const az = u * TAU, sh = Math.abs(Math.sin(az)), y = 1.49 - v * (0.1 + 0.03 * Math.max(0, Math.cos(az))) - v * v * 0.02 * sh, r = 0.075 + v * (0.12 + 0.06 * sh); return at(az, Math.max(r, bodyR(Math.min(y, 1.5), az) + 0.014), y); }, 36, 5,
      { c: (x, y, z) => { const k = Math.floor(Math.hypot(x, z - ZC) / 0.033); return k % 2 ? c2 : c1; }, b: BN.chest, ds: true, j: 0 }); }
  // ---- sash
  if (L.sash) { g.surf((u, v) => { const az = u * TAU, y = 1.0 + v * 0.07; return at(az, bodyR(y, az) + 0.028, y); }, 26, 2, { c: L.sash, b: BN.pelvis, ds: true });
    g.box(0.05, 0.26, 0.012, { at: [0.11, 0.88, 0.14], rz: 0.1, c: L.sash, b: BN.pelvis }); }
}
const GOLDC = 0xe2b440;

// ------------------------------------------------------------------ the people
/* called from Game's NPC drawing each frame: puts this person in the Joseph model (once), picks the mesh for the distance,
   hands the palette to the shader and adds their gear. Returns false when the old look should be drawn. */
/* v24 heroines: story women with a model of their own (Higgsfield → Meshy → tools/glb2hero.py), not the shared villager model.
   NPC id → asset name. Their painted faces stay as they are (no repaint, no drawn brows). */
F.HEROINES = { dinah: 'dinah', asenath: 'asenath' };
function heroine(n, sk, d, list, name) {
  const HA = G.HeroAsset, a = HA.get(name); if (!a) { HA.load(name); return false; } // the old look until it has arrived
  if (n.rig.def !== a.def) { n.rig = HA.swapRig(n.rig, a.def); n.sk = null; sk = null; n.fk = null; n.scale0 = n.d.scale || 1; n.scale = n.scale0 * 0.92;
    if (n.M) n.rig.update(G.m4trs(n.M, n.x, n.y + (n.d.dy || 0) + (n.hopY || 0), n.z, n.face, 0, 0, n.scale, n.scale, n.scale)); }
  if (!sk) sk = n.sk = { bones: n.rig.bones, bs: [0, 0, 0, 1.8] };
  const C = G.Game.COARSE; sk.mesh = a.mesh; sk.meshO = null; sk.tex = a.tex; sk.rc = null; sk.fx = null; sk.bones = n.rig.bones;
  sk.outline = d < (C ? 24 : 40) && !n.d.emis; sk.shadow = !!(d < (C ? 22 : 34) || n.follow || G.Game.cineOn); sk.meshS = null;
  sk.emis = n.d.emis; sk.tint = n.tint || n.d.tint; sk.bs[0] = n.x; sk.bs[1] = n.y + 1; sk.bs[2] = n.z; sk.bs[3] = 1.9 * (n.scale || 1);
  list.push(sk); return true;
}
F.dress = function (n, sk, d, list) {
  if (!F.on || n.d.animal || !n.d.look || n.d.noFolk) return false;
  { const hn = F.HEROINES[n.id]; if (hn && !(G.HeroAsset && G.HeroAsset.off)) return heroine(n, sk, d, list, hn); }
  if (!F.ready) { F.load(); return false; }
  const L = n.d.look;
  if (n.rig.def !== F.def) { // first time: move them onto the GLB rig, pick their build
    n.rig = G.HeroAsset.swapRig(n.rig, F.def); n.sk = null; const h = hash(n.id), fem = F.isFem(L), kid = !!L.kid;
    const bld = L.build === undefined ? 1 : L.build;
    n.fk = { w: clamp(1 + (bld - 1) * 0.1 + (rnd(h, 1) - 0.5) * 0.06 - (fem ? 0.05 : 0), 0.9, 1.12), hd: (kid ? 1.16 : 1) * (1 + (rnd(h, 2) - 0.5) * 0.06), hx: 1 + (rnd(h, 4) - 0.5) * 0.12 - (fem ? 0.03 : 0), hy: 1 + (rnd(h, 5) - 0.5) * 0.08,
      ex: 0.9 + rnd(h, 6) * 0.18 + (fem ? 0.04 : 0), ey: (L.age === 'old' ? 0.8 : 0.88) + rnd(h, 7) * 0.2 + (fem || kid ? 0.06 : 0), mx: 0.88 + rnd(h, 8) * 0.24 - (fem ? 0.06 : 0) }; // the face: eye spacing and size, mouth width
    n.scale0 = n.d.scale || 1; n.scale = kid ? (n.d.scale || 0.7) * (0.97 + rnd(h, 3) * 0.06) /* children were already sized by their own scale */ : n.scale0 * (fem ? 0.95 : 1) * (0.95 + rnd(h, 3) * 0.1) * (L.age === 'old' ? 0.98 : 1);
    if (n.M) n.rig.update(G.m4trs(n.M, n.x, n.y + (n.d.dy || 0) + (n.hopY || 0), n.z, n.face, 0, 0, n.scale, n.scale, n.scale));
    sk = null;
  }
  if (!sk) { sk = n.sk = { bones: n.rig.bones, bs: [0, 0, 0, 1.8] }; }
  const C = G.Game.COARSE, lv = d > (C ? 26 : 34) ? F.lo2 : d > (C ? 12 : 18) ? F.lo : F.hi; // 15.5k / 7.5k / 3k triangles
  sk.mesh = lv.mesh; sk.tex = F.hi.tex; sk.rc = palette(L); sk.bones = n.rig.bones;
  sk.fx = lv === F.lo2 ? null : act(faceOf(L, n.id), n.rig); // (far away the face is a few pixels)
  sk.outline = d < (G.Game.COARSE ? 24 : 40) && !n.d.emis; sk.shadow = !!(d < (G.Game.COARSE ? 22 : 34) || n.follow || G.Game.cineOn); sk.meshS = sk.shadow ? F.lo2.mesh : null;
  sk.meshO = lv === F.hi && d > 7 ? F.lo.mesh : null; // v24 the outline pass draws the body again: beyond 7 m the 10k copy draws the same line
  sk.emis = n.d.emis; sk.tint = n.tint || n.d.tint; sk.bs[0] = n.x; sk.bs[1] = n.y + 1; sk.bs[2] = n.z; sk.bs[3] = 1.9 * (n.scale || 1);
  list.push(sk);
  const gm = d < (C ? 44 : 70) ? gearMesh(L) : null; // far away the headdress and beard are a few pixels
  if (gm) { const gk = n.skG || (n.skG = { bs: sk.bs }); gk.meshO = null; gk.mesh = gm; gk.bones = n.rig.bones; gk.outline = sk.outline; gk.shadow = sk.shadow && d < 16; gk.meshS = null; gk.emis = sk.emis; gk.tint = sk.tint; gk.bs = sk.bs; list.push(gk); }
  return true;
};
/* after the pose: a broader or slimmer frame, a bigger or smaller head (the shoulders carry the arms out without thickening them) */
F.shape = function (n) {
  const k = n.fk; if (!k || n.rig.def !== F.def) return; const s = n.rig.scl, w = k.w;
  s[BN.chest * 3] *= w; s[BN.chest * 3 + 2] *= 0.5 + 0.5 * w;
  for (const b of [BN.uArmL, BN.uArmR]) { s[b * 3] /= w; s[b * 3 + 2] /= 0.5 + 0.5 * w; }
  s[BN.head * 3] *= k.hd * (k.hx || 1) / w; s[BN.head * 3 + 1] *= k.hd * (k.hy || 1); s[BN.head * 3 + 2] *= k.hd / (0.5 + 0.5 * w);
  s[15 * 3] *= k.ex || 1; s[15 * 3 + 1] *= k.ey || 1; s[16 * 3] *= k.mx || 1; // eyes and mouth bones (blinking and speech scale them too)
};
if (F.on) setTimeout(() => { F.load(); if (G.HeroAsset && !G.HeroAsset.off) for (const k in F.HEROINES) G.HeroAsset.load(F.HEROINES[k]); }, 0); // start fetching while the title screen shows, so nobody first appears in the old look
})(window.G);
