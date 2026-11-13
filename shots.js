/* 약속의 길 — 샷 문법 (v17.6, 엔진·연출 업그레이드 문서의 P1).
   A cutscene shot used to say WHERE the camera is ([x,y,z]); now it can say WHO is in the picture and HOW:
     { shot: { type: 'MCU', a: 'hero', b: 'simeon', side: 'auto', lens: 'normal', move: 'pushIn' }, dur: 4, n: '요셉', t: '…' }
   The camera is worked out every frame from where those people really are (eye height, sitting, kneeling), so a shot keeps its
   composition when people walk or the scene is moved. Shots without `shot` are untouched.
   type  : ECU 눈·입 / CU 얼굴 / MCU 가슴 위 / MS 허리 위 / FS 전신 / WS 배경 속 인물 / ESTAB 장소 소개 / HIGH 내려다봄 / LOW 올려다봄
           OTS a를 b의 어깨 너머로 / TWO 두 사람 옆모습 / POV a의 눈으로 b를 봄
   a, b  : 'hero' or an NPC id. With b, CU…LOW show a seen from b's side (a reverse shot).
   side  : 'auto' (default) keeps the camera on the same side of the line between the two people as the shots before it (the 180° rule),
           'L' / 'R' choose a side (relative to the two ids in alphabetical order).
   lens  : 'wide' / 'normal' / 'tele' (fov 0.95 / 0.75 / 0.45; a longer lens stands farther back). `fov` on the shot still wins.
   move  : 'static' (default) · 'pushIn' · 'pullOut' · 'arc' · 'crane'. The camera follows the people softly (half-life 0.25 s).
   Also: `autoShot: true` on a spoken shot (with n:) picks type/side from the feeling (e:) and avoids three equal types in a row.
   Debug: open the game with ?shotdbg=1 — a rule-of-thirds grid and "shot · type · side · lens" show during cutscenes, and a flipped
   side between two shots of the same pair is warned about in the console (G.Shot.log has every shot). */
'use strict';
(function (G) {
const Game = G.Game, Shot = G.Shot = { axis: null, log: [], hist: [] };
const LENS = { wide: 0.95, normal: 0.75, tele: 0.45 };
// visible height (m) the picture should show around the subject
const SIZE = { ECU: 0.3, CU: 0.55, MCU: 0.95, MS: 1.5, FS: 2.4, WS: 6.5, ESTAB: 15, HIGH: 1.5, LOW: 1.5, OTS: 1.15 };
const EL = { HIGH: 0.55, LOW: -0.2 };            // camera elevation angle (rad)
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// ------------------------------------------------------------------ people
function who(id) {
  if (!id) return null; const EP = Game.EP && Game.EP(), P = Game.P;
  if (id === 'hero' || (EP && id === EP.hero)) { const sl = P.sleeping, cr = P.crouch; return { x: P.x, y: P.y, z: P.z, face: P.face || 0, eye: P.y + (sl ? 0.4 : cr ? 1.1 : 1.55), top: P.y + (sl ? 0.6 : 1.8) }; }
  const n = Game.ENT.npcs[id]; if (!n) return null; const k = n.scale || 1, kid = n.d && n.d.look && n.d.look.kid, an = n.d && n.d.animal;
  const h = an ? 0.75 : n.sit ? 1.1 : kid ? 1.1 : 1.55; return { x: n.x, y: n.y, z: n.z, face: n.face || 0, eye: n.y + h * k, top: n.y + (an ? 1 : n.sit ? 1.35 : 1.8) * k };
}
const byName = nm => { if (!nm) return null; const EP = Game.EP && Game.EP(); if (EP && nm === EP.hero) return 'hero'; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.name === nm && !(n.d && n.d.animal)) return id; } return null; };
Shot.who = who; Shot.byName = byName;

// ------------------------------------------------------------------ the 180° rule
const pairKey = (a, b) => a < b ? a + '|' + b : b + '|' + a;
Shot.reset = function () { Shot.axis = null; Shot.hist.length = 0; };

function compute(o, sh, st, t) {
  const A = who(o.a), B = o.b ? who(o.b) : null; let T = o.type || 'MS'; const dur = sh.dur || 4, k = clamp(t / dur, 0, 1);
  if (!A) { const c = Game.cineCam; return { cam: c ? [c.x, c.y, c.z] : [Game.P.x, Game.P.y + 2, Game.P.z - 3], look: c ? [c.lx, c.ly, c.lz] : [Game.P.x, Game.P.y + 1.4, Game.P.z] }; }
  const fov = sh.fov || LENS[o.lens || 'normal'] || 0.75, th = Math.tan(fov / 2), asp = innerWidth / Math.max(1, innerHeight);
  // which side of the line between the two people (canonical direction: smaller id -> larger id)
  let nC = [0, 0], uAB = [0, 1], len = 0;
  if (B) { const dx = B.x - A.x, dz = B.z - A.z; len = Math.hypot(dx, dz); uAB = len > 0.05 ? [dx / len, dz / len] : [Math.sin(A.face), Math.cos(A.face)];
    const first = o.a < o.b ? A : B, second = o.a < o.b ? B : A, cx = second.x - first.x, cz = second.z - first.z, cl = Math.hypot(cx, cz) || 1; nC = [cz / cl, -cx / cl]; } // left normal
  if (st.s === undefined) { // decided once, at the first frame of the shot
    const key = B ? pairKey(o.a, o.b) : null; let s = o.side === 'L' ? 1 : o.side === 'R' ? -1 : 0;
    if (!s) { if (B && Shot.axis && Shot.axis.key === key) s = Shot.axis.s; else { const c = Game.cineCam; s = B && c ? (Math.sign((c.x - A.x) * nC[0] + (c.z - A.z) * nC[1]) || 1) : 1; } }
    st.s = s; if (B) Shot.axis = { key, s };
  }
  // The type is decided once, at the first frame, and then kept (a shot must not change character while it runs). A close-up of a taken "from b's
  // side" would put the camera inside b when they stand close together: it becomes over-the-shoulder. Over-the-shoulder and two-shots mean nothing
  // when the two are far apart (people still walking in): those fall back to a medium close-up of a / a wide shot.
  if (st.T === undefined) { let T0 = T; if (B) { if ((T0 === 'ECU' || T0 === 'CU' || T0 === 'MCU' || T0 === 'MS') && len < SIZE[T0] / (2 * th) + 0.3) T0 = 'OTS'; if (T0 === 'OTS' && len > 25) T0 = 'MCU'; if (T0 === 'TWO' && len > 40) T0 = 'WS'; } st.T = T0; }
  T = st.T;
  const s = st.s, ang = (o.move === 'arc' ? 0.35 * (k - 0.5) * (st.s || 1) : 0);
  let cam, look;
  if (T === 'POV') { // a's own eyes
    if (!B) T = 'MS'; else { cam = [A.x + Math.sin(A.face) * 0.12, A.eye, A.z + Math.cos(A.face) * 0.12]; look = [B.x, B.eye - 0.05, B.z]; return { cam, look, fov, T, s }; }
  }
  if (T === 'TWO' && B) { // both people in profile
    const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, W = len + 1.3, dH = (W / 2) / (th * asp), dV = 2.1 / (2 * th), dist = Math.max(dH, dV) * (o.move === 'pushIn' ? 1 - 0.15 * k : o.move === 'pullOut' ? 0.85 + 0.15 * k : 1);
    const ca = Math.cos(ang), sa = Math.sin(ang), px = nC[0] * s, pz = nC[1] * s; // perpendicular to the line, on the chosen side
    cam = [mx + (px * ca - pz * sa) * dist, (A.eye + B.eye) / 2 + 0.1, mz + (px * sa + pz * ca) * dist]; look = [mx, (A.eye + B.eye) / 2 - 0.25, mz]; return { cam, look, fov, T, s };
  }
  if (T === 'OTS' && B) { // a seen over b's shoulder: the camera stands 0.7 m behind b (on the far side from a), a little to one side
    const visH = SIZE.OTS, back = 0.7; let f = fov;
    if (!sh.fov) f = clamp(2 * Math.atan(visH / (2 * (len + back))), 0.3, 0.95); // a long lens keeps a the size it should have
    cam = [B.x + uAB[0] * back + nC[0] * s * 0.4, B.eye + 0.1, B.z + uAB[1] * back + nC[1] * s * 0.4]; look = [A.x, A.eye - visH / 6, A.z]; return { cam, look, fov: f, T, s };
  }
  if (!SIZE[T]) T = 'MS';
  const visH = SIZE[T], mv = o.move === 'pushIn' ? 1 - 0.2 * k : o.move === 'pullOut' ? 0.8 + 0.2 * k : 1, dist = visH / (2 * th) * mv, el = EL[T] === undefined ? 0.04 : EL[T];
  let dx, dz; // horizontal direction from the subject towards the camera
  if (B) { const th0 = 0.38; dx = uAB[0] * Math.cos(th0) + nC[0] * s * Math.sin(th0); dz = uAB[1] * Math.cos(th0) + nC[1] * s * Math.sin(th0); }
  else { const f = A.face + s * 0.42; dx = Math.sin(f); dz = Math.cos(f); }
  if (ang) { const ca = Math.cos(ang), sa = Math.sin(ang), x = dx * ca - dz * sa, z = dx * sa + dz * ca; dx = x; dz = z; }
  const body = T === 'FS' || T === 'WS' || T === 'ESTAB', cy = body ? A.y + 0.95 : A.eye - visH / 6, ce = Math.cos(el);
  cam = [A.x + dx * dist * ce, cy + Math.sin(el) * dist + (o.move === 'crane' ? 1.4 * k : 0) + (body ? 0.3 : 0), A.z + dz * dist * ce];
  look = [A.x, cy, A.z];
  if (!body) { // looking room: the subject sits a little to the side, away from where they look
    const fx = -dx, fz = -dz, rx = -fz, rz = fx, sf = clamp(Math.sin(A.face) * rx + Math.cos(A.face) * rz, -1, 1), sh2 = sf * 0.1 * visH * asp; look[0] += rx * sh2; look[2] += rz * sh2; }
  return { cam, look, fov, T, s };
}

// ------------------------------------------------------------------ shot -> camera functions
Shot.prepare = function (sh, index) {
  const o = sh.shot; if (!o || sh.cam !== undefined) return false; const st = {}; let last = -1, res = null, t0 = 0;
  const get = t => { if (t === last && res) return res; const r = compute(o, sh, st, t), dt = Math.max(0, t - t0);
    if (!st.init) { st.init = 1; st.c = r.cam.slice(); st.l = r.look.slice(); } else { const f = 1 - Math.exp(-dt * Math.LN2 / 0.25); for (let i = 0; i < 3; i++) { st.c[i] += (r.cam[i] - st.c[i]) * f; st.l[i] += (r.look[i] - st.l[i]) * f; } }
    const W = Game.W && Game.W(); if (W && W.heightAt) st.c[1] = Math.max(st.c[1], W.heightAt(st.c[0], st.c[2]) + 0.35);
    t0 = t; last = t; res = { cam: st.c.slice(), look: st.l.slice(), fov: r.fov, T: r.T, s: r.s }; return res; };
  const first = get(0.0001); // decides the side now, so the log below is right
  sh.cam = t => get(t).cam; sh.look = t => get(t).look; if (!sh.fov) sh.fov = first.fov; sh.shotLive = true; sh.shotStatic = !o.move || o.move === 'static';
  const side = first.s > 0 ? 'L' : 'R', rec = { i: index, type: first.T, a: o.a, b: o.b || '', side, lens: o.lens || 'normal', auto: !!sh.autoShot }; Shot.log.push(rec); Shot.hist.push(first.T);
  const prev = Shot.log[Shot.log.length - 2]; // same pair, explicit sides that flip = a broken 180° line
  if (prev && o.b && prev.b && prev.a + prev.b !== '' && pairKey(prev.a, prev.b) === pairKey(o.a, o.b) && prev.side !== side && o.side && o.side !== 'auto') console.warn('shot: 180° line crossed between shot', prev.i, 'and', index, '(' + o.a + ', ' + o.b + ')');
  dbg(rec); return true;
};

// ------------------------------------------------------------------ feelings -> shots
const AUTO = { fear: ['HIGH', 'CU'], sad: ['HIGH', 'CU'], cry: ['CU', 'HIGH'], angry: ['LOW', 'OTS'], cold: ['LOW', 'OTS'], awe: ['LOW', 'WS'], solemn: ['LOW', 'MS'], pray: ['MCU', 'LOW'], tender: ['TWO', 'MCU'], happy: ['MS', 'MCU'], weary: ['MS', 'HIGH'] };
Shot.auto = function (sh) {
  if (!sh.autoShot || sh.shot || sh.cam !== undefined || !sh.n) return;
  const a = byName(sh.n); if (!a) return; let b = sh.with || null;
  if (!b) { const A = who(a); let bd = 8; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (id === a || !n.vis || (n.d && n.d.animal) || n.name === sh.n) continue; const d = Math.hypot(n.x - A.x, n.z - A.z); if (d < bd) { bd = d; b = id; } } if (!b && a !== 'hero') b = 'hero'; }
  const opts = AUTO[sh.e] || ['MS', 'MCU'], h = Shot.hist; let type = opts[0]; if (h.length >= 2 && h[h.length - 1] === type && h[h.length - 2] === type) type = opts[1] || (type === 'MS' ? 'MCU' : 'MS');
  if ((type === 'OTS' || type === 'TWO') && !b) type = 'MCU';
  sh.shot = { type, a, b, side: 'auto', lens: type === 'CU' ? 'tele' : type === 'WS' ? 'wide' : 'normal' };
};

// ------------------------------------------------------------------ ?shotdbg=1
let box = null;
function dbg(rec) {
  if (!/[?&]shotdbg\b/.test(location.search)) return;
  if (!box) { box = document.createElement('div'); box.style.cssText = 'position:fixed;inset:0;z-index:98;pointer-events:none;background:linear-gradient(to right,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.8%),linear-gradient(to bottom,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.5%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.8%);font:11px monospace;color:#ff0';
    box.appendChild(document.createElement('div')).style.cssText = 'position:absolute;left:6px;bottom:96px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:4px'; document.body.appendChild(box); }
  box.firstChild.textContent = '샷 ' + rec.i + ' · ' + rec.type + ' · ' + rec.a + (rec.b ? '→' + rec.b : '') + ' · ' + rec.side + ' · ' + rec.lens + (rec.auto ? ' · auto' : ''); box.hidden = false; }
Shot.hideDbg = () => { if (box) box.hidden = true; };
})(window.G);
