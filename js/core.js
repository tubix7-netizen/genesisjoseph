/* 약속의 길 — engine core: math, noise, geometry builder, WebGL2 renderer */
'use strict';
window.G = window.G || {};
(function (G) {
// ------------------------------------------------------------------ math
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
function m4() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }
function m4id(m) { m.fill(0); m[0] = m[5] = m[10] = m[15] = 1; return m; }
function m4mul(o, a, b) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  for (let i = 0; i < 4; i++) {
    const b0 = b[i * 4], b1 = b[i * 4 + 1], b2 = b[i * 4 + 2], b3 = b[i * 4 + 3];
    o[i * 4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    o[i * 4 + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    o[i * 4 + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    o[i * 4 + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  }
  return o;
}
function m4persp(o, fovy, asp, n, f) {
  const t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f); o.fill(0);
  o[0] = t / asp; o[5] = t; o[10] = (f + n) * nf; o[11] = -1; o[14] = 2 * f * n * nf; return o;
}
function m4ortho(o, l, r, b, t, n, f) {
  const lr = 1 / (l - r), bt = 1 / (b - t), nf = 1 / (n - f); o.fill(0);
  o[0] = -2 * lr; o[5] = -2 * bt; o[10] = 2 * nf; o[12] = (l + r) * lr; o[13] = (t + b) * bt; o[14] = (f + n) * nf; o[15] = 1; return o;
}
function m4look(o, ex, ey, ez, cx, cy, cz, ux, uy, uz) {
  let z0 = ex - cx, z1 = ey - cy, z2 = ez - cz; let l = Math.hypot(z0, z1, z2) || 1; z0 /= l; z1 /= l; z2 /= l;
  let x0 = uy * z2 - uz * z1, x1 = uz * z0 - ux * z2, x2 = ux * z1 - uy * z0; l = Math.hypot(x0, x1, x2) || 1; x0 /= l; x1 /= l; x2 /= l;
  const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
  o[0] = x0; o[1] = y0; o[2] = z0; o[3] = 0; o[4] = x1; o[5] = y1; o[6] = z1; o[7] = 0; o[8] = x2; o[9] = y2; o[10] = z2; o[11] = 0;
  o[12] = -(x0 * ex + x1 * ey + x2 * ez); o[13] = -(y0 * ex + y1 * ey + y2 * ez); o[14] = -(z0 * ex + z1 * ey + z2 * ez); o[15] = 1; return o;
}
function m4inv(o, a) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06; if (!det) return null; det = 1 / det;
  o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det; return o;
}
// R = Ry * Rx * Rz ; o = T * R * S
function m4trs(o, x, y, z, ry, rx, rz, sx, sy, sz) {
  const cy = Math.cos(ry || 0), syn = Math.sin(ry || 0), cx = Math.cos(rx || 0), sxn = Math.sin(rx || 0), cz = Math.cos(rz || 0), szn = Math.sin(rz || 0);
  // Ry*Rx
  const a00 = cy, a01 = syn * sxn, a02 = syn * cx, a10 = 0, a11 = cx, a12 = -sxn, a20 = -syn, a21 = cy * sxn, a22 = cy * cx;
  // *Rz
  const r00 = a00 * cz + a01 * szn, r01 = -a00 * szn + a01 * cz, r02 = a02;
  const r10 = a10 * cz + a11 * szn, r11 = -a10 * szn + a11 * cz, r12 = a12;
  const r20 = a20 * cz + a21 * szn, r21 = -a20 * szn + a21 * cz, r22 = a22;
  sx = sx === undefined ? 1 : sx; sy = sy === undefined ? sx : sy; sz = sz === undefined ? sx : sz;
  o[0] = r00 * sx; o[1] = r10 * sx; o[2] = r20 * sx; o[3] = 0;
  o[4] = r01 * sy; o[5] = r11 * sy; o[6] = r21 * sy; o[7] = 0;
  o[8] = r02 * sz; o[9] = r12 * sz; o[10] = r22 * sz; o[11] = 0;
  o[12] = x; o[13] = y; o[14] = z; o[15] = 1; return o;
}
function nmat(m) { // inverse-transpose of upper 3x3 -> array(9) row-major-ish usage
  const a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g);
  const Gx = b * f - c * e, H = -(a * f - c * d), I = a * e - b * d;
  const det = a * A + b * B + c * C || 1;
  // inverse = adj/det ; transpose -> columns become rows
  return [A / det, B / det, C / det, D / det, E / det, F / det, Gx / det, H / det, I / det];
}
// cubic Hermite (Catmull-Rom tangents) through keys [[t, a, b, ...], ...] sorted by t -> fn(t) -> [a, b, ...]
function spline(keys) {
  const n = keys.length, dim = keys[0].length - 1;
  const m = keys.map((k, i) => { const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)], dt = (b[0] - a[0]) || 1, out = []; for (let d = 1; d <= dim; d++) out.push((b[d] - a[d]) / dt); return out; });
  return function (t) {
    if (t <= keys[0][0]) return keys[0].slice(1);
    if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
    let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
    const k0 = keys[i], k1 = keys[i + 1], h = k1[0] - k0[0], s = (t - k0[0]) / h, s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2, out = [];
    for (let d = 1; d <= dim; d++) out.push(h00 * k0[d] + h10 * h * m[i][d - 1] + h01 * k1[d] + h11 * h * m[i + 1][d - 1]);
    return out;
  };
}
// ------------------------------------------------------------------ noise / rng
function hash2(x, z) { let h = (Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z, o) { o = o || 4; let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, z * f); n += a; f *= 2.03; a *= 0.5; } return s / n; }
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hexRGB = h => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
function mixHex(a, b, t) { const A = hexRGB(a), B = hexRGB(b); return ((Math.round(lerp(A[0], B[0], t) * 255) << 16) | (Math.round(lerp(A[1], B[1], t) * 255) << 8) | Math.round(lerp(A[2], B[2], t) * 255)); }

// ------------------------------------------------------------------ geometry builder
const TMP = m4();
class GB {
  constructor(seed) { this.d = []; this.r = rng(seed || 7); }
  get count() { return this.d.length / 11; }
  _emit(P, N, o, colFn) {
    const m = m4trs(TMP, o.at ? o.at[0] : 0, o.at ? o.at[1] : 0, o.at ? o.at[2] : 0, o.ry || 0, o.rx || 0, o.rz || 0,
      o.s ? o.s[0] : 1, o.s ? o.s[1] : 1, o.s ? o.s[2] : 1);
    const M = o.m ? m4mul(m4(), o.m, m) : m; const nm = nmat(M);
    const b = o.b || 0, sw = o.sw || 0, j = o.j === undefined ? 0.05 : o.j, bf = o.bf || null;
    // ol: outline weight 0..1 (stored as negative "sway" so the outline shader can thin it)
    const olv = o.ol === undefined || o.ol >= 1 ? (o.soft ? clamp(o.soft, 0, 1) * 0.5 + 0.01 : null) : -(1 - clamp(o.ol, 0, 1)) - 1e-4;
    const base = typeof o.c === 'number' ? hexRGB(o.c) : [1, 1, 1];
    const fn = typeof o.c === 'function' ? o.c : null; const dk = o.dark || 0;
    for (let t = 0; t < P.length; t += 9) {
      const jj = j ? (this.r() - 0.5) * 2 * j : 0;
      const tc = fn && o.flatC ? hexRGB(fn((P[t] + P[t + 3] + P[t + 6]) / 3, (P[t + 1] + P[t + 4] + P[t + 7]) / 3, (P[t + 2] + P[t + 5] + P[t + 8]) / 3)) : null;
      for (let k = 0; k < 3; k++) {
        const x = P[t + k * 3], y = P[t + k * 3 + 1], z = P[t + k * 3 + 2];
        const nx = N[t + k * 3], ny = N[t + k * 3 + 1], nz = N[t + k * 3 + 2];
        const wx = M[0] * x + M[4] * y + M[8] * z + M[12], wy = M[1] * x + M[5] * y + M[9] * z + M[13], wz = M[2] * x + M[6] * y + M[10] * z + M[14];
        let ox = nm[0] * nx + nm[1] * ny + nm[2] * nz, oy = nm[3] * nx + nm[4] * ny + nm[5] * nz, oz = nm[6] * nx + nm[7] * ny + nm[8] * nz;
        const l = Math.hypot(ox, oy, oz) || 1; ox /= l; oy /= l; oz /= l;
        let c = base; if (P.cols) c = hexRGB(P.cols[t / 3 + k]); else if (tc) c = tc; else if (fn) c = hexRGB(fn(x, y, z, wx, wy, wz));
        const swv = olv !== null ? olv : typeof sw === 'function' ? sw(x, y, z) : sw;
        const kk = (1 + jj) * (1 - (P.dk ? P.dk[t / 9 | 0] : dk));
        this.d.push(wx, wy, wz, ox, oy, oz, clamp(c[0] * kk, 0, 1), clamp(c[1] * kk, 0, 1), clamp(c[2] * kk, 0, 1), swv, bf ? bf(wx, wy, wz) : b);
      }
    }
    return this;
  }
  tri(a, b, c, o) { // raw world-ish triangle with flat normal
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    return this._emit([...a, ...b, ...c], [nx, ny, nz, nx, ny, nz, nx, ny, nz], o || {});
  }
  quadN(a, b, c, d, o) { this.tri(a, b, c, o); this.tri(a, c, d, o); return this; }
  box(w, h, d, o) {
    o = o || {}; const x = w / 2, z = d / 2, y0 = o.base ? 0 : -h / 2, y1 = y0 + h, tp = o.taper || 1, tx = x * tp, tz = z * tp;
    const v = [[-x, y0, z], [x, y0, z], [tx, y1, tz], [-tx, y1, tz], [-x, y0, -z], [x, y0, -z], [tx, y1, -tz], [-tx, y1, -tz]];
    const F = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
    const P = [], N = [];
    for (const f of F) {
      const a = v[f[0]], b = v[f[1]], c = v[f[2]], dd = v[f[3]];
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      P.push(...a, ...b, ...c, ...a, ...c, ...dd); for (let i = 0; i < 6; i++) N.push(nx, ny, nz);
    }
    return this._emit(P, N, o);
  }
  cyl(rt, rb, h, seg, o) {
    o = o || {}; seg = seg || 8; const y0 = o.base ? 0 : -h / 2, y1 = y0 + h, P = [], N = [];
    const sl = (rb - rt) / h; const a0 = o.a0 || 0, al = o.al || Math.PI * 2;
    for (let i = 0; i < seg; i++) {
      const A = a0 + al * i / seg, B = a0 + al * (i + 1) / seg, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
      const na = [ca, sl, sa], nb = [cb, sl, sb]; const la = Math.hypot(...na), lb = Math.hypot(...nb);
      const n1 = [ca / la, sl / la, sa / la], n2 = [cb / lb, sl / lb, sb / lb];
      const p00 = [ca * rb, y0, sa * rb], p10 = [cb * rb, y0, sb * rb], p01 = [ca * rt, y1, sa * rt], p11 = [cb * rt, y1, sb * rt];
      if (o.flat) { const fn = [Math.cos((A + B) / 2) / la, sl / la, Math.sin((A + B) / 2) / la]; P.push(...p00, ...p01, ...p11, ...p00, ...p11, ...p10); for (let k = 0; k < 6; k++) N.push(...fn); }
      else { P.push(...p00, ...p01, ...p11, ...p00, ...p11, ...p10); N.push(...n1, ...n1, ...n2, ...n1, ...n2, ...n2); }
      if (rt > 0 && o.cap !== false) { P.push(0, y1, 0, ...p11, ...p01); N.push(0, 1, 0, 0, 1, 0, 0, 1, 0); }
      if (o.capB) { P.push(0, y0, 0, ...p00, ...p10); N.push(0, -1, 0, 0, -1, 0, 0, -1, 0); }
    }
    return this._emit(P, N, o);
  }
  sph(r, ws, hs, o) {
    o = o || {}; ws = ws || 10; hs = hs || 7; const t0 = o.t0 || 0, tl = o.tl || Math.PI, P = [], N = [];
    const pt = (i, j) => { const th = t0 + tl * j / hs, ph = Math.PI * 2 * i / ws; const x = -Math.cos(ph) * Math.sin(th), y = Math.cos(th), z = Math.sin(ph) * Math.sin(th); return [x, y, z]; };
    for (let j = 0; j < hs; j++) for (let i = 0; i < ws; i++) {
      const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      const add = (p, q, s) => { P.push(p[0] * r, p[1] * r, p[2] * r, q[0] * r, q[1] * r, q[2] * r, s[0] * r, s[1] * r, s[2] * r); if (o.flat) { const n = [(p[0] + q[0] + s[0]) / 3, (p[1] + q[1] + s[1]) / 3, (p[2] + q[2] + s[2]) / 3]; N.push(...n, ...n, ...n); } else N.push(...p, ...q, ...s); };
      if (j > 0 || t0 > 0) add(a, c, b); add(a, d, c);
    }
    return this._emit(P, N, o);
  }
  lathe(prof, seg, o) { // prof: [[r,y],...] bottom->top
    o = o || {}; seg = seg || 10; const P = [], N = [];
    for (let k = 0; k < prof.length - 1; k++) {
      const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; const dy = y1 - y0, dr = r1 - r0, l = Math.hypot(dy, dr) || 1; const ny = -dr / l, nr = dy / l;
      for (let i = 0; i < seg; i++) {
        const A = Math.PI * 2 * i / seg, B = Math.PI * 2 * (i + 1) / seg, ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
        P.push(ca * r0, y0, sa * r0, ca * r1, y1, sa * r1, cb * r1, y1, sb * r1, ca * r0, y0, sa * r0, cb * r1, y1, sb * r1, cb * r0, y0, sb * r0);
        N.push(ca * nr, ny, sa * nr, ca * nr, ny, sa * nr, cb * nr, ny, sb * nr, ca * nr, ny, sa * nr, cb * nr, ny, sb * nr, cb * nr, ny, sb * nr);
      }
    }
    return this._emit(P, N, o);
  }
  /* parametric surface: fn(u,v) -> [x,y,z]; u runs around (CCW seen from +y when it is an angle), v runs bottom -> top.
     Smooth normals from finite differences (poles averaged). o.ds: double sided (inner side darkened by o.inner, default 0.28). */
  surf(fn, nu, nv, o) {
    o = o || {}; const pts = [], nrm = [], cls = [], e = 1e-3, W = nu + 1;
    const F = (u, v) => fn(u, v < 0 ? 0 : v > 1 ? 1 : v);
    const nAt = (u, v) => {
      const a = F(u + e, v), b = F(u - e, v), c = F(u, v + e), d = F(u, v - e);
      const ux = a[0] - b[0], uy = a[1] - b[1], uz = a[2] - b[2], vx = c[0] - d[0], vy = c[1] - d[1], vz = c[2] - d[2];
      return [vy * uz - vz * uy, vz * ux - vx * uz, vx * uy - vy * ux];
    };
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const u = i / nu, v = j / nv; pts.push(F(u, v)); if (o.cuv) cls.push(o.cuv(u, v)); }
    // normals from the point grid (one evaluation per vertex); seams that close in u are treated as periodic,
    // degenerate spots (poles, tips) fall back to finite differences of fn
    const jm = nv >> 1, A0 = pts[jm * W], A1 = pts[jm * W + nu], perU = Math.hypot(A0[0] - A1[0], A0[1] - A1[1], A0[2] - A1[2]) < 1e-6;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      let iL = i - 1, iR = i + 1; if (perU) { if (iL < 0) iL = nu - 1; if (iR > nu) iR = 1; } else { if (iL < 0) iL = 0; if (iR > nu) iR = nu; }
      const jD = j > 0 ? j - 1 : 0, jU = j < nv ? j + 1 : nv;
      const pa = pts[j * W + iR], pb = pts[j * W + iL], pc = pts[jU * W + i], pd = pts[jD * W + i];
      const ux = pa[0] - pb[0], uy = pa[1] - pb[1], uz = pa[2] - pb[2], vx = pc[0] - pd[0], vy = pc[1] - pd[1], vz = pc[2] - pd[2];
      let n = [vy * uz - vz * uy, vz * ux - vx * uz, vx * uy - vy * ux], l = Math.hypot(n[0], n[1], n[2]);
      const ul = Math.hypot(ux, uy, uz), vl = Math.hypot(vx, vy, vz);
      if (l < 1e-9 * (ul * vl + 1e-12) * 1e3 || ul < 1e-9 || vl < 1e-9) { const u = i / nu, v = j / nv; n = nAt(u, v); l = Math.hypot(n[0], n[1], n[2]);
        if (l < 1e-12) { const vv = v < 0.5 ? v + 0.03 : v - 0.03; n = [0, 0, 0]; for (let k = 0; k < 12; k++) { const q = nAt(k / 12, vv), ql = Math.hypot(q[0], q[1], q[2]) || 1; n[0] += q[0] / ql; n[1] += q[1] / ql; n[2] += q[2] / ql; } l = Math.hypot(n[0], n[1], n[2]) || 1; } }
      nrm.push([n[0] / l, n[1] / l, n[2] / l]);
    }
    if (o.nrm) for (let k = 0; k < nrm.length; k++) nrm[k] = o.nrm(pts[k], nrm[k]); // v17.0: optional normal edit (e.g. face normals bent toward a proxy shape)
    const P = [], N = [], dk = o.ds ? [] : null, s = o.flip ? -1 : 1, C = o.cuv ? [] : null;
    const put = (k, sg) => { const p = pts[k], n = nrm[k]; P.push(p[0], p[1], p[2]); N.push(n[0] * sg, n[1] * sg, n[2] * sg); if (C) C.push(cls[k]); };
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = j * W + i, b = a + W, c = b + 1, d = a + 1;
      const quad = (sg, flip) => { const T = flip ? [[a, c, b], [a, d, c]] : [[a, b, c], [a, c, d]]; for (const t of T) { put(t[0], sg); put(t[1], sg); put(t[2], sg); if (dk) dk.push(sg === s ? 0 : (o.inner === undefined ? 0.28 : o.inner)); } };
      quad(s, s < 0); if (o.ds) quad(-s, s > 0);
    }
    if (dk) P.dk = dk; if (C) P.cols = C;
    return this._emit(P, N, o);
  }
  /* tube around the y axis. sp(y) -> [rx, rz, cx, cz, p(superellipse, default 2)]; y0/y1 may be functions of angle.
     o.a0/o.al: angle range; o.mod(a,y,v) radius multiplier; o.cap0/o.cap1: rounded end length. */
  tube(sp, y0, y1, nu, nv, o) {
    o = o || {}; const a0 = o.a0 === undefined ? 0 : o.a0, al = o.al === undefined ? Math.PI * 2 : o.al, mod = o.mod;
    const c0 = o.cap0 || 0, c1 = o.cap1 || 0, n0 = c0 ? (o.capN || 3) : 0, n1 = c1 ? (o.capN || 3) : 0, nt = nv + n0 + n1;
    const sup = (c, p) => p === 2 || !p ? c : Math.sign(c) * Math.pow(Math.abs(c), 2 / p);
    return this.surf((u, v) => {
      const a = a0 + al * u, Y0 = typeof y0 === 'function' ? y0(a) : y0, Y1 = typeof y1 === 'function' ? y1(a) : y1;
      const j = v * nt; let y, k = 1;
      if (j < n0) { const th = (j / n0) * Math.PI / 2; y = Y0 - c0 * Math.cos(th); k = Math.sin(th); }
      else if (j > n0 + nv) { const th = ((nt - j) / n1) * Math.PI / 2; y = Y1 + c1 * Math.cos(th); k = Math.sin(th); }
      else y = Y0 + (Y1 - Y0) * ((j - n0) / nv);
      const yy = Math.min(Math.max(y, Math.min(Y0, Y1)), Math.max(Y0, Y1)), r = sp(yy), m = (mod ? mod(a, yy, (j - n0) / nv) : 1) * k;
      return [(r[2] || 0) + sup(Math.cos(a), r[4]) * Math.max(0, r[0]) * m, y, (r[3] || 0) + sup(Math.sin(a), r[4]) * Math.max(0, r[1]) * m];
    }, nu, nt, o);
  }
  plane(w, d, o) { o = o || {}; const x = w / 2, z = d / 2; return this._emit([-x, 0, z, x, 0, z, x, 0, -z, -x, 0, z, x, 0, -z, -x, 0, -z], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], o); }
  add(other) { for (let i = 0; i < other.d.length; i++) this.d.push(other.d[i]); return this; }
  bounds() {
    let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9; const d = this.d;
    for (let i = 0; i < d.length; i += 11) { const x = d[i], y = d[i + 1], z = d[i + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z; }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2; return [cx, cy, cz, Math.hypot(x1 - cx, y1 - cy, z1 - cz)];
  }
}

// ------------------------------------------------------------------ shaders
const HEAD = '#version 300 es\nprecision highp float;\nprecision highp sampler2DShadow;\n';
const NOISE = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s/0.97;}
`;
const VS_LIT = `
layout(location=0) in vec3 aPos;layout(location=1) in vec3 aNrm;layout(location=2) in vec4 aCol;layout(location=3) in float aBone;
#ifdef INST
layout(location=4) in vec4 iA;layout(location=5) in vec4 iB;
#endif
uniform mat4 uVP,uModel,uShadowVP;uniform float uTime,uWind;
#ifdef SKIN
uniform mat4 uBones[20];
#endif
#ifdef OUTLINE
uniform float uOutline;uniform vec3 uCamPos;
#endif
out vec3 vN;out vec3 vC;out vec3 vW;out vec4 vS;out float vSoft;
void main(){
  vec4 p=vec4(aPos,1.0);vec3 n=aNrm;
#ifdef SKIN
  int bi=int(aBone+0.5);int b0=bi&31;int b1=(bi>>5)&31;float bw=float(bi>>10)/255.0;
  mat4 B=uBones[b0]*(1.0-bw)+uBones[b1]*bw;p=B*p;n=mat3(B)*n;
#endif
#ifdef INST
  float c=cos(iA.w),s=sin(iA.w);p.xyz*=iB.x;p.xz=vec2(c*p.x+s*p.z,-s*p.x+c*p.z);n.xz=vec2(c*n.x+s*n.z,-s*n.x+c*n.z);p.xyz+=iA.xyz;
#endif
  vec4 w=uModel*p;
  float sw=aCol.a;vSoft=0.0;
#ifdef SKIN
  vSoft=clamp(sw*2.0,0.0,1.0);sw=0.0;
#endif
  if(sw>0.0){float ph=dot(w.xz,vec2(0.21,0.17));w.x+=sin(uTime*1.6+ph)*0.07*sw*uWind;w.z+=cos(uTime*1.25+ph*1.3)*0.05*sw*uWind;}
  vN=normalize(mat3(uModel)*n);
#ifdef OUTLINE
  float d=length(w.xyz-uCamPos);float ow=aCol.a<0.0?1.0+aCol.a:1.0;
#ifdef SKIN
  ow*=aCol.a>0.3?0.55:1.0; // v17.0 외곽선: skin (face, neck, hands) gets a thinner line than cloth and hair
#endif
  w.xyz+=vN*uOutline*ow*clamp(d*0.045,0.7,4.0);
#endif
  vW=w.xyz;vC=aCol.rgb;
#ifdef INST
  vC*=iB.yzw;
#endif
  vS=uShadowVP*w;
#ifdef DEPTH
  gl_Position=uVP*w;
#else
  gl_Position=uVP*w;
#endif
}`;
const FS_COMMON = `
uniform vec3 uSunDir,uSunCol,uSkyAmb,uGndAmb,uFogCol,uCamPos;uniform float uFogDen,uShadowOn,uShadowTexel;
uniform vec2 uFogX; // v18.3 P10: x = how much the haze glows towards the sun, y = how fast the air thins with height (0, 0 = the old fog exactly)
uniform highp sampler2DShadow uShadow;
float shadowF(vec4 S){
  if(uShadowOn<0.5)return 1.0;
  vec3 c=S.xyz/S.w*0.5+0.5;
  if(c.x<0.0||c.x>1.0||c.y<0.0||c.y>1.0||c.z>1.0)return 1.0;
  float t=uShadowTexel,z=c.z-0.0012;
  float s=texture(uShadow,vec3(c.xy+vec2(-t,-t),z))+texture(uShadow,vec3(c.xy+vec2(t,-t),z))+texture(uShadow,vec3(c.xy+vec2(-t,t),z))+texture(uShadow,vec3(c.xy+vec2(t,t),z));
  float e=smoothstep(0.9,1.0,max(abs(c.x-0.5),abs(c.y-0.5))*2.0);
  return mix(s*0.25,1.0,e);
}
vec3 tone(vec3 c){c*=0.98;c=clamp((c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14),0.0,1.0);return clamp(mix(vec3(dot(c,vec3(0.299,0.587,0.114))),c,1.3),0.0,1.0);}
vec3 fog(vec3 c,vec3 w){
  vec3 rv=w-uCamPos;float d=length(rv);
  float hk=exp(-max(rv.y,0.0)*uFogX.y); // things above the eye stand in thinner air (a valley is hazier than a ridge)
  float f=1.0-exp(-d*uFogDen*hk);f=f*f*(3.0-2.0*f);f=max(f,smoothstep(105.0,170.0,d));
  float sc=pow(max(dot(rv/max(d,1e-3),uSunDir),0.0),5.0); // looking towards the sun the haze glows with its light
  return mix(c,uFogCol+uSunCol*(uFogX.x*sc),clamp(f,0.0,1.0));}
`;
const FS_LIT = `
in vec3 vN;in vec3 vC;in vec3 vW;in vec4 vS;in float vSoft;
uniform vec3 uTint,uEmis,uRock;uniform float uTime,uCloudSh; // uCloudSh: v18.3 P10 how dark a passing cloud's shadow is (0 = none)
out vec4 o;
` + NOISE + FS_COMMON + `
void main(){
  vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;
  vec3 col=vC;
#ifdef TERRAIN
  float n1=noise(vW.xz*0.35),n2=noise(vW.xz*2.1),n3=noise(vW.xz*7.0);
  col*=0.88+0.16*n1+0.07*n2+0.04*n3;
  float slope=1.0-N.y;
  col=mix(col,uRock*(0.88+0.18*n2),smoothstep(0.30,0.52,slope));
  float sandy=clamp((col.r-col.b)*3.2-0.75,0.0,1.0)*(1.0-smoothstep(0.2,0.45,slope));
  float rip=sin(dot(vW.xz,vec2(0.83,0.56))*4.2+noise(vW.xz*0.37)*7.0);
  col*=1.0+0.045*rip*sandy;
#endif
  float ndl=dot(N,uSunDir);
  float sh=shadowF(vS);
  vec3 amb=mix(uGndAmb,uSkyAmb,N.y*0.5+0.5);
  vec3 V=normalize(uCamPos-vW);
#ifdef SKIN
  // characters: authored colours are sRGB-ish; a partial decode keeps dyed cloth, hair and leather rich instead of pastel
  col=pow(col,vec3(1.38));
  // v16.5 cel look (anime adventure style): cloth and hair get a crisp two-tone edge; faces stay evenly lit (only a truly
  // back-lit face falls into shadow) so features read cleanly; shadows are tinted (warm peach on skin, cool violet on cloth)
  // instead of grey, lit areas are flat and bright, and a soft rim outlines the silhouette.
  float faceK=smoothstep(0.6,1.0,vSoft);
  float bodyLit=smoothstep(-0.1,0.2,ndl)*mix(sh,1.0,0.15); // v16.6: a smoother body terminator (still two-tone, no hard facets)
  float faceLit=mix(0.66,1.0,smoothstep(-0.22,0.12,ndl))*mix(sh,1.0,0.3); // v17.0 얼굴 그늘: one clean, softly edged cel shade on the far side (the smoothed face normals keep it from blotching) // v16.6: faces darken in shade with the body (no floating bright face) // faces: a wide, soft gradient (no hard edge, no facets) and no cast-shadow blotches
  float lit=mix(bodyLit,faceLit,faceK);
  vec3 tintS=mix(vec3(0.78,0.74,0.84),vec3(0.9,0.68,0.64),faceK);
  vec3 cS=col*tintS*(amb*0.95+0.12);
  vec3 cL=col*(amb*0.5+uSunCol*0.92)*mix(1.0,1.05,faceK);
  if(faceK>0.0){cS=mix(cS,col*tintS*(amb*0.95+uSunCol*0.12),faceK);} // a face's shade side stays light and warm
  vec3 c=mix(cS,cL,lit);
  float fr=1.0-max(dot(N,V),0.0),rim=pow(fr,3.0);
  c+=col*uSunCol*rim*0.3*(0.3+0.7*lit)+uSkyAmb*rim*0.06;
  // v17.0 테두리 빛: a crisp, light rim on the side facing the sun (a cel "kick" that lifts the figure off a hazy background)
  vec2 sx=normalize(uSunDir.xz+vec2(1e-4)),nx=N.xz/max(length(N.xz),1e-3);float side=smoothstep(-0.2,0.6,dot(nx,sx));
  c+=(col*0.6+uSunCol*0.25)*smoothstep(0.55,0.72,fr)*side*0.85*mix(sh,1.0,0.4);
  // a little sheen on hair (the half-soft strands)
  float hairK=1.0-abs(vSoft-0.45)*6.0; if(hairK>0.0){vec3 H2=normalize(uSunDir+V);c+=uSunCol*col*pow(max(dot(N,H2),0.0),28.0)*0.5*hairK*lit;}
#else
  float lit=smoothstep(-0.07,0.32,ndl)*sh;
  if(uCloudSh>0.01){float cn=noise(vW.xz*0.016+vec2(uTime*0.021,uTime*0.009))*0.65+noise(vW.xz*0.045-vec2(uTime*0.012,0.0))*0.35;lit*=1.0-smoothstep(0.5,0.78,cn)*uCloudSh*0.55;} // drifting cloud shadows on the ground
  float rim=pow(1.0-max(dot(N,V),0.0),4.0);
  vec3 c=col*(amb+uSunCol*lit);
  c+=col*uSunCol*rim*0.28*(0.35+0.65*lit);
#endif
  c=c*uTint+uEmis;
  o=vec4(tone(fog(c,vW)),1.0);
}`;
const FS_OUT = `in vec3 vN;in vec3 vC;in vec3 vW;in vec4 vS;in float vSoft;uniform vec3 uLineCol;out vec4 o;` + FS_COMMON + `void main(){vec3 lc=mix(uLineCol,vC*0.3,0.5);
  lc=mix(lc,pow(vC,vec3(1.38))*vec3(0.55,0.4,0.36),smoothstep(0.6,1.0,vSoft)*0.7); // v17.0 외곽선: a skin line is a darker skin tone, not a brown stroke
  o=vec4(tone(fog(lc,vW)),1.0);}`;
const FS_DEPTH = `out vec4 o;void main(){o=vec4(1.0);}`;
const VS_GRASS = `
layout(location=0) in vec3 aPos;layout(location=4) in vec4 iA;
uniform mat4 uVP,uShadowVP;uniform vec2 uCenter;uniform float uPatch,uTime,uWind,uGrassH;uniform vec4 uMap;uniform vec3 uPlayer;
uniform sampler2D uHeight,uColTex;
out vec3 vC;out vec3 vW;out vec4 vS;out float vY;
void main(){
  vec2 base=iA.xy+uPatch*floor((uCenter-iA.xy)/uPatch+0.5);
  vec2 uv=(base-uMap.xy)/uMap.z;
  vec4 ct=texture(uColTex,uv);float dens=ct.a;float h=texture(uHeight,uv).r;
  float dl=length(base-uCenter);
  float fade=1.0-smoothstep(uPatch*0.30,uPatch*0.48,dl);
  float sc=step(iA.z,dens)*fade*(0.6+0.55*iA.w)*min(1.0,dens*1.5)*uGrassH;
  float ang=iA.z*61.0+iA.w*13.0;float c=cos(ang),s=sin(ang);
  float y01=aPos.y;
  vec3 p=vec3((aPos.x*c-aPos.z*s)*(0.6+0.4*sc),aPos.y*sc,(aPos.x*s+aPos.z*c)*(0.6+0.4*sc));
  float wv=sin(uTime*1.9+base.x*0.31+base.y*0.23)*0.6+sin(uTime*3.1+base.x*0.83+base.y*0.5)*0.25;
  vec2 bend=vec2(0.75,0.45)*wv*uWind*0.28*y01*y01*sc;
  vec2 aw=base-uPlayer.xz;float pd=length(aw);
  if(pd<1.3&&pd>0.001)bend+=aw/pd*(1.3-pd)*0.55*y01*sc;
  vec3 w=vec3(base.x+p.x+bend.x,h+p.y-length(bend)*0.3*y01,base.y+p.z+bend.y);
  vec3 gc=ct.rgb;
  vC=mix(gc*0.55,gc*1.22+vec3(0.05,0.06,0.0),y01);
  vY=y01;vW=w;vS=uShadowVP*vec4(w,1.0);
  gl_Position=uVP*vec4(w,1.0);
}`;
const FS_GRASS = `in vec3 vC;in vec3 vW;in vec4 vS;in float vY;out vec4 o;` + FS_COMMON + `
void main(){
  float sh=shadowF(vS);
  float lit=max(uSunDir.y,0.0)*0.6+0.4;
  vec3 c=vC*(uSkyAmb*0.95+uSunCol*lit*sh*0.85);
  c+=vC*uSunCol*0.12*vY*sh;
  o=vec4(tone(fog(c,vW)),1.0);
}`;
const VS_WATER = `layout(location=0) in vec3 aPos;uniform mat4 uVP;uniform float uLevel,uTime;out vec3 vW;
void main(){vec3 w=aPos;w.y=uLevel+sin(uTime*1.3+w.x*0.35)*0.03+cos(uTime*1.1+w.z*0.3)*0.03;vW=w;gl_Position=uVP*vec4(w,1.0);}`;
const FS_WATER = `in vec3 vW;out vec4 o;uniform sampler2D uHeight;uniform vec4 uMap;uniform float uLevel,uTime;uniform vec3 uShallow,uDeep,uSkyTop,uSkyHor;uniform mat4 uShadowVP;
` + NOISE + FS_COMMON + `
void main(){
  vec2 uv=(vW.xz-uMap.xy)/uMap.z;float th=texture(uHeight,uv).r;float depth=uLevel-th;
  if(depth<-0.03)discard;
  vec2 q=vW.xz*0.55;float e=0.08;
  float h0=noise(q+uTime*vec2(0.21,0.13))+0.5*noise(q*2.3-uTime*vec2(0.33,0.19));
  float hx=noise(q+vec2(e,0)+uTime*vec2(0.21,0.13))+0.5*noise((q+vec2(e,0))*2.3-uTime*vec2(0.33,0.19));
  float hz=noise(q+vec2(0,e)+uTime*vec2(0.21,0.13))+0.5*noise((q+vec2(0,e))*2.3-uTime*vec2(0.33,0.19));
  vec3 N=normalize(vec3((h0-hx)*1.6,1.0,(h0-hz)*1.6));
  vec3 V=normalize(uCamPos-vW);
  float fr=pow(1.0-max(dot(N,V),0.0),3.0)*0.75+0.08;
  vec3 R=reflect(-V,N);vec3 sky=mix(uSkyHor,uSkyTop,clamp(R.y*1.5,0.0,1.0));
  vec3 base=mix(uShallow,uDeep,smoothstep(0.0,2.4,depth));
  float sh=shadowF(uShadowVP*vec4(vW,1.0));
  vec3 c=mix(base*(uSkyAmb+uSunCol*0.55*sh),sky,fr);
  c+=uSunCol*pow(max(dot(R,uSunDir),0.0),140.0)*1.8*sh;
  float foam=smoothstep(0.32,0.0,depth)*(0.55+0.45*sin(uTime*2.2+h0*7.0));
  c=mix(c,vec3(0.96,0.97,0.95),foam*0.65);
  float a=mix(0.5,0.92,smoothstep(0.0,1.4,depth));a=max(a,foam*0.85);
  o=vec4(tone(fog(c,vW)),a);
}`;
const VS_SKY = `layout(location=0) in vec3 aPos;out vec2 vP;void main(){vP=aPos.xy;gl_Position=vec4(aPos.xy,0.99999,1.0);}`;
const FS_SKY = `in vec2 vP;out vec4 o;uniform mat4 uInvVP;uniform vec3 uCamPos,uSunDir,uSunCol,uTop,uHor,uGround,uCloudCol;uniform float uTime,uNight,uCloud,uFlash;
` + NOISE + `
float h3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float fbm3(vec2 p){float s=0.0,a=0.5;for(int i=0;i<3;i++){s+=a*noise(p);p=p*2.07+vec2(3.1,1.7);a*=0.5;}return s/0.875;}
void main(){
  vec4 a=uInvVP*vec4(vP,1.0,1.0);vec3 dir=normalize(a.xyz/a.w-uCamPos);float h=dir.y;
  vec3 L=uSunDir;float day=1.0-uNight;float sd=max(dot(dir,L),0.0);
  vec2 dxz=normalize(dir.xz+vec2(1e-4)),lxz=normalize(L.xz+vec2(1e-4));float side=dot(dxz,lxz)*0.5+0.5;
  float low=pow(1.0-clamp(L.y,0.0,1.0),5.0)*day;
  // gradient: horizon -> zenith, warmer and brighter on the sun side; a sunset band hugging the horizon
  float g=pow(smoothstep(-0.03,0.62,h),0.62);
  vec3 c=mix(uHor,uTop,g);
  c=mix(c,c*vec3(1.07,1.0,0.94)+vec3(0.035,0.025,0.01),side*(1.0-g)*0.55*day);
  c+=uSunCol*vec3(1.0,0.5,0.26)*low*pow(side,3.0)*exp(-max(h,0.0)*6.5)*0.6;
  c+=vec3(0.18,0.08,0.22)*low*pow(1.0-side,2.0)*exp(-max(h,0.0)*5.0)*0.35;
  if(h<0.0)c=mix(c,uGround,smoothstep(0.0,-0.18,h));
  // sun (disc + glare + wide glow) / moon (disc + halo)
  c+=uSunCol*(pow(sd,1500.0)*7.0+pow(sd,110.0)*0.42+pow(sd,10.0)*0.13+low*pow(sd,4.0)*0.18)*day*(1.0-uCloud*0.55);
  c+=vec3(0.92,0.95,1.0)*(smoothstep(0.99935,0.9997,sd)*1.5+pow(sd,70.0)*0.1+pow(sd,8.0)*0.03)*uNight*(1.0-uCloud*0.6);
  // stars + milky way
  if(uNight>0.01&&h>0.0){
    vec3 sp=floor(dir*270.0);float r=h3(sp);float st=step(0.9972,r)*(0.45+0.55*h3(sp+3.0));
    float tw=0.6+0.4*sin(uTime*(2.0+h3(sp+7.0)*3.0)+r*60.0);
    float band=exp(-pow(dot(dir,normalize(vec3(0.35,0.55,-0.76))),2.0)*20.0);
    float mw=band*(0.3+0.7*fbm3(dir.xz/(h+0.35)*3.2+vec2(5.0)));
    float clr=1.0-uCloud*0.85;
    c+=vec3(st*tw)*uNight*smoothstep(0.0,0.2,h)*clr+vec3(0.5,0.56,0.82)*mw*0.17*uNight*smoothstep(0.0,0.3,h)*clr;
  }
  // clouds: soft cumulus, self-shadowed away from the sun with a silver lining; thin high cirrus; haze at the horizon
  if(h>-0.02){
    float hh=max(h,0.0)+0.06;
    vec2 uv=dir.xz/hh*0.5+vec2(uTime*0.007,uTime*0.0035);
    float cov=0.64-uCloud*0.4;
    float d0=fbm(uv*1.2);
    float dens=smoothstep(cov,cov+0.2+uCloud*0.1,d0)*smoothstep(-0.02,0.12,h);
    if(dens>0.002){
      float d1=fbm(uv*1.2+lxz*0.085);
      float lit=clamp(0.6+(d0-d1)*3.4,0.0,1.0);
      vec3 shC=mix(uCloudCol*vec3(0.6,0.64,0.76),uTop,0.22);
      vec3 cc=mix(shC,uCloudCol*1.08,lit);
      cc+=uSunCol*pow(sd,6.0)*0.6*(1.0-dens*0.6)*day;
      cc=mix(cc,cc*vec3(0.55,0.57,0.62),uCloud*uCloud*0.75);
      c=mix(c,cc,dens*0.93);
    }
    vec2 uv2=dir.xz/(hh+0.1)*0.3+vec2(uTime*0.011,-uTime*0.004);
    float ci=fbm3(vec2(uv2.x*0.35+uv2.y*0.6,uv2.y*2.6));
    ci=smoothstep(0.56,0.92,ci)*smoothstep(0.06,0.4,h)*(1.0-uCloud*0.6)*0.32;
    c=mix(c,uCloudCol*1.05+uSunCol*0.08*day,ci*(0.35+0.65*day));
    c=mix(c,mix(uHor,uGround,0.35),smoothstep(0.1,0.0,h)*0.3);
  }
  c+=vec3(0.75,0.8,1.0)*uFlash;
  c*=0.98;c=clamp((c*(2.51*c+0.03))/(c*(2.43*c+0.59)+0.14),0.0,1.0);c=clamp(mix(vec3(dot(c,vec3(0.299,0.587,0.114))),c,1.3),0.0,1.0);
  o=vec4(c,1.0);
}`;
// rain streaks: instanced thin quads that fall through a box that wraps around the camera
const VS_RAIN = `layout(location=0) in vec3 aPos;layout(location=4) in vec4 iA;
uniform mat4 uVP;uniform vec3 uCamPos;uniform float uTime,uRain,uBox;uniform vec2 uWindXZ;out float vA;out vec3 vW;
void main(){
  float H=16.0,sp=10.0+iA.w*5.0;
  float y=mod(iA.y-uTime*sp,H);
  vec3 p=vec3(uCamPos.x+mod(iA.x-uCamPos.x+uWindXZ.x*uTime*0.7,uBox)-uBox*0.5,uCamPos.y-5.0+y,uCamPos.z+mod(iA.z-uCamPos.z+uWindXZ.y*uTime*0.7,uBox)-uBox*0.5);
  vec3 vel=normalize(vec3(uWindXZ.x,-sp,uWindXZ.y));
  vec3 sd=normalize(cross(vel,normalize(uCamPos-p)+vec3(1e-4)));
  float len=0.42+0.3*iA.w;
  vec3 wp=p+vel*(aPos.y*len)+sd*(aPos.x*0.022);
  vA=(1.0-aPos.y*0.75)*step(iA.w,uRain)*smoothstep(0.6,2.5,length(p-uCamPos));
  vW=wp;gl_Position=uVP*vec4(wp,1.0);
}`;
const FS_RAIN = `in float vA;in vec3 vW;uniform vec3 uRainCol;out vec4 o;void main(){if(vA<=0.002)discard;o=vec4(uRainCol,vA*0.32);}`;
const VS_FLAT = `layout(location=0) in vec3 aPos;layout(location=2) in vec4 aCol;uniform mat4 uVP,uModel;out vec4 vC;out vec3 vW;
void main(){vec4 w=uModel*vec4(aPos,1.0);vW=w.xyz;vC=aCol;gl_Position=uVP*w;}`;
const FS_FLAT = `in vec4 vC;in vec3 vW;uniform vec4 uColor;out vec4 o;void main(){o=vec4(vC.rgb*uColor.rgb,vC.a*uColor.a);}`;
const VS_PTS = `layout(location=0) in vec3 aPos;layout(location=2) in vec4 aCol;layout(location=3) in float aSize;uniform mat4 uVP;uniform float uScale;out vec4 vC;
void main(){vec4 p=uVP*vec4(aPos,1.0);gl_Position=p;gl_PointSize=clamp(aSize*uScale/max(p.w,0.1),1.0,128.0);vC=aCol;}`;
const FS_PTS = `in vec4 vC;out vec4 o;void main(){vec2 d=gl_PointCoord-0.5;float r=dot(d,d)*4.0;if(r>1.0)discard;o=vec4(vC.rgb,vC.a*(1.0-r));}`;

// ------------------------------------------------------------------ renderer
const R = {};
let gl;
function compile(vs, fs, defs) {
  const pre = HEAD + (defs || []).map(d => '#define ' + d + '\n').join('');
  const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, pre + s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(sh) + '\n' + (defs || []).join(',')); return sh; };
  const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  const U = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); const nm = info.name.replace('[0]', ''); U[nm] = gl.getUniformLocation(p, info.name); }
  return { p, U };
}
R.init = function (canvas) {
  gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  if (!gl) return false;
  R.gl = gl;
  const P = R.P = {};
  P.lit = compile(VS_LIT, FS_LIT); P.skin = compile(VS_LIT, FS_LIT, ['SKIN']); P.inst = compile(VS_LIT, FS_LIT, ['INST']);
  P.terrain = compile(VS_LIT, FS_LIT, ['TERRAIN']);
  P.outSkin = compile(VS_LIT, FS_OUT, ['SKIN', 'OUTLINE']); P.out = compile(VS_LIT, FS_OUT, ['OUTLINE']);
  P.dLit = compile(VS_LIT, FS_DEPTH, ['DEPTH']); P.dSkin = compile(VS_LIT, FS_DEPTH, ['DEPTH', 'SKIN']); P.dInst = compile(VS_LIT, FS_DEPTH, ['DEPTH', 'INST']);
  P.grass = compile(VS_GRASS, FS_GRASS); P.water = compile(VS_WATER, FS_WATER); P.sky = compile(VS_SKY, FS_SKY);
  P.flat = compile(VS_FLAT, FS_FLAT); P.pts = compile(VS_PTS, FS_PTS); P.rain = compile(VS_RAIN, FS_RAIN);
  // fullscreen tri
  R.fs = R.mesh(new Float32Array([-1, -1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 3, -1, 0, 0, 0, 0, 1, 1, 1, 0, 0, -1, 3, 0, 0, 0, 0, 1, 1, 1, 0, 0]));
  // grass blade
  const blade = [];
  const bp = (x, y, z) => blade.push(x, y, z, 0, 1, 0, 1, 1, 1, 0, 0);
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1, ca = Math.cos(a), sa = Math.sin(a), ox = Math.cos(a + 1) * 0.07, oz = Math.sin(a + 1) * 0.07, bw = 0.045, h = 1 - k * 0.18, lean = 0.12;
    const P = (u, y) => [ox + ca * u + Math.sin(a + 1) * lean * y * y, y * h, oz + sa * u - Math.cos(a + 1) * lean * y * y];
    const A = P(-bw, 0), Bv = P(bw, 0), Cv = P(bw * 0.65, 0.5), D = P(-bw * 0.65, 0.5), E = P(0, 1);
    bp(...A); bp(...Bv); bp(...Cv); bp(...A); bp(...Cv); bp(...D); bp(...D); bp(...Cv); bp(...E);
  }
  R.bladeData = new Float32Array(blade);
  R.shadowSize = 0; R.setShadow(2048);
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE);
  return true;
};
R.setShadow = function (size) {
  if (R.shadowTex) { gl.deleteTexture(R.shadowTex); gl.deleteFramebuffer(R.shadowFB); R.shadowTex = null; }
  R.shadowSize = size; R.shadowValid = false; if (!size) return;
  const t = R.shadowTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, size, size);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  const fb = R.shadowFB = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, t, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
function bindLayout(stride11) {
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 44, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 44, 12);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 44, 24);
  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 44, 40);
}
R.mesh = function (src) {
  const data = src instanceof Float32Array ? src : new Float32Array(src.d);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao); bindLayout(); gl.bindVertexArray(null);
  let bs = [0, 0, 0, 1e6]; if (src instanceof GB) bs = src.bounds();
  return { vao, buf, count: data.length / 11, bs };
};
/* v17.3 P13: a static chunk (up to ~48 m wide, up to 170 000 triangles) used to be drawn whole as soon as any corner of it touched the view,
   and the shadow pass touches a lot of them. js/meshworker.js sorts the triangles of the big chunks into 12 m cells in a Web Worker and
   R.applyCells swaps the sorted buffer in (m.cells = each cell's range and bounding sphere); drawStatic then draws only the cells that are
   inside the current frustum, neighbouring visible cells in one call. Until the sorted buffer arrives (or without a worker) the chunk is drawn whole, as before. */
R.applyCells = function (m, data, cells) {
  if (m.freed) return; const m2 = R.mesh(data); gl.deleteBuffer(m.buf); gl.deleteVertexArray(m.vao); m.buf = m2.buf; m.vao = m2.vao; m.cells = cells;
};
function drawStatic(m) { // draws the cells of m that are inside the current frustum (R.noCellCull = true draws it whole, for comparing)
  gl.bindVertexArray(m.vao); const cs = m.cells;
  if (!cs || R.noCellCull) { gl.drawArrays(gl.TRIANGLES, 0, m.count); return; }
  let first = -1, cnt = 0;
  for (let i = 0; i < cs.length; i++) { const e = cs[i];
    if (visible(e.bs)) { if (first < 0) first = e.first; cnt += e.count; } else if (first >= 0) { gl.drawArrays(gl.TRIANGLES, first, cnt); first = -1; cnt = 0; } }
  if (first >= 0) gl.drawArrays(gl.TRIANGLES, first, cnt);
}
// indexed mesh: identical vertices (all 11 floats) are merged so smooth surfaces are shaded once per vertex
/* v17.2 P12: the welding step is pure (no GL), so a Web Worker can run it (js/meshworker.js); R.meshWelded then only uploads */
G.weld = function (src) {
  const data = src instanceof Float32Array ? src : new Float32Array(src.d), n = data.length / 11, U = new Uint32Array(data.buffer, data.byteOffset, data.length);
  const map = new Map(), next = new Int32Array(n).fill(-1), out = new Float32Array(data.length), idx = new Uint32Array(n); let uc = 0;
  for (let i = 0; i < n; i++) {
    let h = 2166136261 >>> 0; const o = i * 11; for (let k = 0; k < 11; k++) h = Math.imul(h ^ U[o + k], 16777619) >>> 0;
    let j = map.has(h) ? map.get(h) : -1, found = -1;
    while (j >= 0) { let same = true; const p = j * 11; for (let k = 0; k < 11; k++) if (out[p + k] !== data[o + k] && !(isNaN(out[p + k]) && isNaN(data[o + k]))) { same = false; break; } if (same) { found = j; break; } j = next[j]; }
    if (found < 0) { found = uc++; out.set(data.subarray(o, o + 11), found * 11); next[found] = map.has(h) ? map.get(h) : -1; map.set(h, found); }
    idx[i] = found;
  }
  const verts = out.slice(0, uc * 11), big = uc > 65535, ind = big ? idx : Uint16Array.from(idx);
  return { verts, ind, big, uniq: uc, count: n };
};
R.meshWelded = function (w, bs) {
  const { verts, ind, big, uniq: uc, count: n } = w;
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao); bindLayout();
  const ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  return { vao, buf, ibuf, count: n, ib: true, it: big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, uniq: uc, bs: bs || [0, 0, 0, 1e6] };
};
R.meshIdx = function (src) { let bs = [0, 0, 0, 1e6]; if (src instanceof GB) bs = src.bounds(); return R.meshWelded(G.weld(src), bs); };
R.draw = function (m) { if (m.ib) gl.drawElements(gl.TRIANGLES, m.count, m.it, 0); else gl.drawArrays(gl.TRIANGLES, 0, m.count); };
R.updateMesh = function (m, src) {
  const data = src instanceof Float32Array ? src : new Float32Array(src.d);
  gl.bindBuffer(gl.ARRAY_BUFFER, m.buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); m.count = data.length / 11; if (src instanceof GB) m.bs = src.bounds();
};
R.free = function (m) { if (!m) return; m.freed = true; gl.deleteBuffer(m.buf); gl.deleteVertexArray(m.vao); if (m.ibuf) gl.deleteBuffer(m.ibuf); if (m.ibufS) gl.deleteBuffer(m.ibufS); if (m.vaoS) gl.deleteVertexArray(m.vaoS); };
// instanced: mesh + instance buffer (8 floats: x,y,z,rotY, scale, r,g,b)
function instVao(mesh, ib) {
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buf); bindLayout();
  gl.bindBuffer(gl.ARRAY_BUFFER, ib);
  gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(4, 1);
  gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(5, 1);
  gl.bindVertexArray(null); return vao;
}
/* v17.3 P13: an instance set (all the trees of one kind, all the herbs…) used to be drawn whole whenever any part of it was in view, in
   both the shadow pass and the main pass. Now each instance is tested against the current frustum and only the ones that could be seen
   are drawn — the picture is the same (compared pixel by pixel). A distance cut at the fog limit was tried too, but a far tree can still
   tint a pixel there, so it is left out. The shadow pass has its own buffer so the two passes never overwrite one buffer in a frame. */
function instDraw(s, shadow, cam) {
  let n = s.n, vao = s.vao;
  if (n > 8 && s.data && R.noInstCull !== true && R.noInstCull !== (shadow ? 'shadow' : 'main')) { // R.noInstCull = true / 'shadow' / 'main' switches it off (for comparing)
    const d = s.data, o = s.cdata || (s.cdata = new Float32Array(d.length)), bs = s.mesh.bs, br = (bs ? bs[3] + Math.hypot(bs[0], bs[2]) : 4), by = bs ? bs[1] : 0;
    n = 0;
    for (let i = 0, N = s.n; i < N; i++) {
      const b = i * 8, sc = d[b + 4] || 1, x = d[b], y = d[b + 1] + by * sc, z = d[b + 2], r = br * sc + 1.5; let ok = true;
      for (let p = 0; p < 24; p += 4) if (FR[p] * x + FR[p + 1] * y + FR[p + 2] * z + FR[p + 3] < -r) { ok = false; break; }
      if (ok) { const q = n * 8; for (let k = 0; k < 8; k++) o[q + k] = d[b + k]; n++; }
    }
    if (!n) return;
    if (shadow) { if (!s.vaoS) { s.ibufS = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, s.ibufS); gl.bufferData(gl.ARRAY_BUFFER, s.max * 32, gl.DYNAMIC_DRAW); s.vaoS = instVao(s.mesh, s.ibufS); } vao = s.vaoS; gl.bindBuffer(gl.ARRAY_BUFFER, s.ibufS); }
    else { gl.bindBuffer(gl.ARRAY_BUFFER, s.ibuf); s.dirty = true; } // the main buffer now holds this frame's subset, not the whole list
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, o, 0, n * 8);
  } else if (s.dirty && s.data) { gl.bindBuffer(gl.ARRAY_BUFFER, s.ibuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, s.data, 0, s.n * 8); s.dirty = false; }
  gl.bindVertexArray(vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, s.mesh.count, n);
}
R.inst = function (mesh, max) {
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ib); gl.bufferData(gl.ARRAY_BUFFER, max * 32, gl.DYNAMIC_DRAW);
  const vao = instVao(mesh, ib);
  return { mesh, vao, ibuf: ib, max, n: 0, data: new Float32Array(max * 8), bs: [0, 0, 0, 1e6], shadow: true,
    set(list) { // list of [x,y,z,ry,s,r,g,b]
      const n = Math.min(list.length, this.max); let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9, y = 0;
      for (let i = 0; i < n; i++) { const e = list[i]; this.data.set(e.length === 8 ? e : [e[0], e[1], e[2], e[3] || 0, e[4] || 1, e[5] === undefined ? 1 : e[5], e[6] === undefined ? 1 : e[6], e[7] === undefined ? 1 : e[7]], i * 8); if (e[0] < x0) x0 = e[0]; if (e[0] > x1) x1 = e[0]; if (e[2] < z0) z0 = e[2]; if (e[2] > z1) z1 = e[2]; y = e[1]; }
      this.n = n; gl.bindBuffer(gl.ARRAY_BUFFER, this.ibuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, n * 8); this.dirty = false;
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; this.bs = n ? [cx, y, cz, Math.hypot(x1 - cx, z1 - cz) + (this.mesh.bs[3] || 4) + 4] : [0, 0, 0, 0];
    } };
};
R.rainInit = function (count, box) {
  const q = []; const v = (x, y) => q.push(x, y, 0, 0, 1, 0, 1, 1, 1, 0, 0); v(-0.5, 0); v(0.5, 0); v(0.5, 1); v(-0.5, 0); v(0.5, 1); v(-0.5, 1);
  const g = R.inst(R.mesh(new Float32Array(q)), count); const r = rng(51); const arr = [];
  for (let i = 0; i < count; i++) arr.push([r() * box, r() * 16, r() * box, r(), 1, 1, 1, 1]);
  g.set(arr); g.box = box; R.rain = g;
};
R.grassInit = function (count, patch) {
  const mesh = R.mesh(R.bladeData); const g = R.inst(mesh, count); const r = rng(99); const arr = [];
  for (let i = 0; i < count; i++) arr.push([r() * patch, r() * patch, r(), r(), 1, 1, 1, 1]);
  // iA = (x, z, rnd, rnd) packed into first 4 floats
  g.set(arr.map(a => [a[0], a[1], a[2], a[3], 1, 1, 1, 1])); g.patch = patch; R.grass = g;
};
R.tex = function (w, h, data, fmt) {
  const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  if (fmt === 'r16f') gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, w, h, 0, gl.RED, gl.FLOAT, data);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
};
R.texUpdate = function (t, w, h, data) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data); };
// particles buffer
R.ptsInit = function (max) {
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, max * 32, gl.DYNAMIC_DRAW);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 12);
  gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 32, 28);
  gl.bindVertexArray(null); R.ptsBuf = { buf, vao, max, data: new Float32Array(max * 8) };
};

// frustum
const FR = new Float32Array(24);
function frustum(m) {
  const p = [[m[3] + m[0], m[7] + m[4], m[11] + m[8], m[15] + m[12]], [m[3] - m[0], m[7] - m[4], m[11] - m[8], m[15] - m[12]],
    [m[3] + m[1], m[7] + m[5], m[11] + m[9], m[15] + m[13]], [m[3] - m[1], m[7] - m[5], m[11] - m[9], m[15] - m[13]],
    [m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]], [m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]]];
  for (let i = 0; i < 6; i++) { const l = Math.hypot(p[i][0], p[i][1], p[i][2]); FR[i * 4] = p[i][0] / l; FR[i * 4 + 1] = p[i][1] / l; FR[i * 4 + 2] = p[i][2] / l; FR[i * 4 + 3] = p[i][3] / l; }
}
function visible(bs, mm) {
  let x = bs[0], y = bs[1], z = bs[2];
  if (mm) { const tx = mm[0] * x + mm[4] * y + mm[8] * z + mm[12], ty = mm[1] * x + mm[5] * y + mm[9] * z + mm[13], tz = mm[2] * x + mm[6] * y + mm[10] * z + mm[14]; x = tx; y = ty; z = tz; }
  const r = bs[3] * (mm ? Math.max(Math.hypot(mm[0], mm[1], mm[2]), 1) : 1);
  for (let i = 0; i < 6; i++) if (FR[i * 4] * x + FR[i * 4 + 1] * y + FR[i * 4 + 2] * z + FR[i * 4 + 3] < -r) return false;
  return true;
}
R.visible = visible;
const R_FAR = 172; R.FAR = R_FAR; // v16.6 draw distance: beyond it the fog is total, so nothing is drawn
function farOff(m, c, d) { const b = m.bs; return Math.hypot(b[0] - c[0], b[2] - c[2]) - b[3] > d; }

R.skyOn = !/[?&]sky=0\b/.test(location.search); R.fogX = R.skyOn ? [0.6, 0.03] : [0, 0]; R.cloudSh = R.skyOn ? 1 : 0; // v18.3 P10: ?sky=0 = the old look
const VP = m4(), V = m4(), PR = m4(), IVP = m4(), LV = m4(), LP = m4(), LVP = m4(), IDM = m4();
R.VP = VP; R.LVP = LVP; R.V = V; R.PR = PR;
function setCommon(P, S) {
  const u = P.U;
  if (u.uVP) gl.uniformMatrix4fv(u.uVP, false, VP);
  if (u.uShadowVP) gl.uniformMatrix4fv(u.uShadowVP, false, LVP);
  if (u.uCamPos) gl.uniform3fv(u.uCamPos, S.cam);
  if (u.uSunDir) gl.uniform3fv(u.uSunDir, S.env.sunDir);
  if (u.uSunCol) gl.uniform3fv(u.uSunCol, S.env.sunCol);
  if (u.uSkyAmb) gl.uniform3fv(u.uSkyAmb, S.env.skyAmb);
  if (u.uGndAmb) gl.uniform3fv(u.uGndAmb, S.env.gndAmb);
  if (u.uFogCol) gl.uniform3fv(u.uFogCol, S.env.fogCol);
  if (u.uFogDen) gl.uniform1f(u.uFogDen, S.env.fogDen);
  if (u.uFogX) gl.uniform2f(u.uFogX, R.fogX[0], R.fogX[1]); // v18.3 P10 (R.fogX = [0, 0] switches the new fog off)
  if (u.uCloudSh) gl.uniform1f(u.uCloudSh, R.cloudSh * Math.min(1, (S.env.cloud || 0) * 1.2));
  if (u.uTime) gl.uniform1f(u.uTime, S.time);
  if (u.uWind) gl.uniform1f(u.uWind, S.env.wind);
  if (u.uShadowOn) gl.uniform1f(u.uShadowOn, R.shadowSize && S.shadowOn ? 1 : 0);
  if (u.uShadowTexel) gl.uniform1f(u.uShadowTexel, 0.75 / (R.shadowSize || 1024));
  if (u.uShadow) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, R.shadowTex || R.dummyShadow()); gl.uniform1i(u.uShadow, 0); }
  if (u.uTint) gl.uniform3f(u.uTint, 1, 1, 1);
  if (u.uEmis) gl.uniform3f(u.uEmis, 0, 0, 0);
  if (u.uModel) gl.uniformMatrix4fv(u.uModel, false, IDM);
}
R.dummyShadow = function () {
  if (R._ds) return R._ds; const t = R._ds = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, 1, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return t;
};
/* scene: {cam:[x,y,z], target:[x,y,z], fov, near, far, env:{...}, time, focus:[x,y,z], shadowOn,
   terrain:[mesh], statics:[mesh], insts:[inst], dyn:[{mesh, m, tint, emis, outline}], skinned:[{mesh, bones, outline, tint}],
   grass:{on, center, player, map, heightTex, colTex, h}, water:{mesh, level, ...}, flats:[{mesh,m,color}], pts:{n}} */
R.render = function (S, W, H) {
  const env = S.env;
  // ---- camera matrices
  m4persp(PR, S.fov, W / H, S.near || 0.15, S.far || 900); // (the sky is drawn separately; geometry beyond R_FAR is culled above)
  m4look(V, S.cam[0], S.cam[1], S.cam[2], S.target[0], S.target[1], S.target[2], 0, 1, 0);
  m4mul(VP, PR, V); m4inv(IVP, VP);
  // ---- shadow pass
  /* v17.3 P13 shadow update rate: R.shadowRate = 2 redraws the shadow map every second frame and reuses the last map (and its matrix) in between.
     Game sets it only while frames are slow; at 1 (the default) nothing changes. A fresh map is forced when the hero has moved >2.5 m since the last one. */
  const useShadow = R.shadowSize && S.shadowOn; let redo = useShadow;
  if (!useShadow) R.shadowValid = false;
  else if ((R.shadowRate || 1) > 1 && R.shadowValid && R.shadowAge + 1 < R.shadowRate && Math.hypot(S.focus[0] - R.shadowFx, S.focus[2] - R.shadowFz) < 2.5) { redo = false; R.shadowAge++; }
  if (redo) {
    R.shadowValid = true; R.shadowAge = 0; R.shadowFx = S.focus[0]; R.shadowFz = S.focus[2];
    const ext = S.shadowExt || 30, sd = env.sunDir, f = S.focus;
    // light basis
    let rx = sd[2], rz = -sd[0]; let rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl; // right ⟂ sun on xz
    const ux = -sd[1] * rz * 0 + (sd[1] * 0), uy = 0; // unused
    const texel = ext * 2 / R.shadowSize;
    // snap focus along right & a 'forward' axis
    const fx = rx, fz = rz; const dot = f[0] * fx + f[2] * fz; const snap = Math.round(dot / texel) * texel - dot;
    const cx = f[0] + fx * snap, cy = f[1], cz = f[2] + fz * snap;
    const upv = Math.abs(sd[1]) > 0.99 ? [0, 0, 1] : [0, 1, 0];
    m4look(LV, cx + sd[0] * 120, cy + sd[1] * 120, cz + sd[2] * 120, cx, cy, cz, upv[0], upv[1], upv[2]);
    // snap translation in light space
    LV[12] = Math.round(LV[12] / texel) * texel; LV[13] = Math.round(LV[13] / texel) * texel;
    m4ortho(LP, -ext, ext, -ext, ext, 1, 260); m4mul(LVP, LP, LV);
    gl.bindFramebuffer(gl.FRAMEBUFFER, R.shadowFB); gl.viewport(0, 0, R.shadowSize, R.shadowSize);
    gl.clear(gl.DEPTH_BUFFER_BIT); gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2.0, 4.0);
    gl.disable(gl.CULL_FACE);
    frustum(LVP);
    const SV = { cam: S.cam, env, time: S.time, shadowOn: 0 };
    // static + terrain
    let P = R.P.dLit; gl.useProgram(P.p); setCommonDepth(P, SV);
    for (const m of S.terrain) if (visible(m.bs)) { gl.bindVertexArray(m.vao); gl.drawArrays(gl.TRIANGLES, 0, m.count); }
    for (const m of S.statics) if (m.shadow !== false && !(m.cullDist && farOff(m, S.cam, 40)) && visible(m.bs)) drawStatic(m);
    for (const d of S.dyn) if (d.shadow !== false && visible(d.mesh.bs, d.m)) { gl.uniformMatrix4fv(P.U.uModel, false, d.m); gl.bindVertexArray(d.mesh.vao); R.draw(d.mesh); }
    gl.uniformMatrix4fv(P.U.uModel, false, IDM);
    P = R.P.dInst; gl.useProgram(P.p); setCommonDepth(P, SV);
    for (const s of S.insts) if (s.n && s.shadow && visible(s.bs)) instDraw(s, true, S.cam);
    P = R.P.dSkin; gl.useProgram(P.p); setCommonDepth(P, SV);
    for (const k of S.skinned) { if (k.shadow === false || (k.bs && !visible(k.bs))) continue; gl.uniformMatrix4fv(P.U.uBones, false, k.bones); gl.bindVertexArray(k.mesh.vao); R.draw(k.mesh); }
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.enable(gl.CULL_FACE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  // ---- main pass
  gl.viewport(0, 0, W, H);
  gl.clearColor(env.fogCol[0], env.fogCol[1], env.fogCol[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  frustum(VP);
  // sky
  let P = R.P.sky; gl.useProgram(P.p); gl.depthMask(false);
  gl.uniformMatrix4fv(P.U.uInvVP, false, IVP); gl.uniform3fv(P.U.uCamPos, S.cam); gl.uniform3fv(P.U.uSunDir, env.sunDir); gl.uniform3fv(P.U.uSunCol, env.sunCol);
  gl.uniform3fv(P.U.uTop, env.skyTop); gl.uniform3fv(P.U.uHor, env.skyHor); gl.uniform3fv(P.U.uGround, env.fogCol); gl.uniform3fv(P.U.uCloudCol, env.cloudCol);
  gl.uniform1f(P.U.uTime, S.time); gl.uniform1f(P.U.uNight, env.night); gl.uniform1f(P.U.uCloud, env.cloud); gl.uniform1f(P.U.uFlash, env.flash || 0);
  gl.bindVertexArray(R.fs.vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true);
  // terrain
  P = R.P.terrain; gl.useProgram(P.p); setCommon(P, S); gl.uniform3fv(P.U.uRock, env.rock || [0.6, 0.5, 0.42]);
  for (const m of S.terrain) if (!farOff(m, S.cam, R_FAR) && visible(m.bs)) { gl.bindVertexArray(m.vao); gl.drawArrays(gl.TRIANGLES, 0, m.count); }
  // statics + dynamic
  P = R.P.lit; gl.useProgram(P.p); setCommon(P, S);
  gl.disable(gl.CULL_FACE);
  for (const m of S.statics) if (!farOff(m, S.cam, m.cullDist || R_FAR) && visible(m.bs)) drawStatic(m);
  for (const d of S.dyn) {
    if (!visible(d.mesh.bs, d.m)) continue;
    gl.uniformMatrix4fv(P.U.uModel, false, d.m);
    if (d.tint) gl.uniform3fv(P.U.uTint, d.tint); if (d.emis) gl.uniform3fv(P.U.uEmis, d.emis);
    gl.bindVertexArray(d.mesh.vao); R.draw(d.mesh);
    if (d.tint) gl.uniform3f(P.U.uTint, 1, 1, 1); if (d.emis) gl.uniform3f(P.U.uEmis, 0, 0, 0);
  }
  gl.uniformMatrix4fv(P.U.uModel, false, IDM);
  P = R.P.inst; gl.useProgram(P.p); setCommon(P, S);
  for (const s of S.insts) if (s.n && !farOff(s, S.cam, R_FAR) && visible(s.bs)) instDraw(s, false, S.cam);
  gl.enable(gl.CULL_FACE);
  // skinned
  P = R.P.skin; gl.useProgram(P.p); setCommon(P, S);
  for (const k of S.skinned) { k.cull = !!(k.bs && !visible(k.bs)); }
  for (const k of S.skinned) {
    if (k.cull) continue; gl.uniformMatrix4fv(P.U.uBones, false, k.bones);
    if (k.tint) gl.uniform3fv(P.U.uTint, k.tint); if (k.emis) gl.uniform3fv(P.U.uEmis, k.emis);
    gl.bindVertexArray(k.mesh.vao); R.draw(k.mesh);
    if (k.tint) gl.uniform3f(P.U.uTint, 1, 1, 1); if (k.emis) gl.uniform3f(P.U.uEmis, 0, 0, 0);
  }
  // outlines (back faces)
  gl.cullFace(gl.FRONT);
  P = R.P.outSkin; gl.useProgram(P.p); setCommon(P, S); gl.uniform1f(P.U.uOutline, 0.0058); gl.uniform3fv(P.U.uLineCol, [0.27, 0.18, 0.15]); // v16.7 야숨: a finer, warmer line round the characters
  for (const k of S.skinned) { if (!k.outline || k.cull) continue; gl.uniformMatrix4fv(P.U.uBones, false, k.bones); gl.bindVertexArray(k.mesh.vao); R.draw(k.mesh); }
  P = R.P.out; gl.useProgram(P.p); setCommon(P, S); gl.uniform1f(P.U.uOutline, 0.016); gl.uniform3fv(P.U.uLineCol, env.line || [0.16, 0.11, 0.09]);
  for (const d of S.dyn) { if (!d.outline || !visible(d.mesh.bs, d.m)) continue; gl.uniformMatrix4fv(P.U.uModel, false, d.m); gl.bindVertexArray(d.mesh.vao); R.draw(d.mesh); }
  for (const m of S.statics) { if (!m.outline || !visible(m.bs)) continue; gl.uniformMatrix4fv(P.U.uModel, false, IDM); drawStatic(m); }
  gl.cullFace(gl.BACK);
  // grass
  if (S.grass && S.grass.on && R.grass) {
    const g = S.grass; P = R.P.grass; gl.useProgram(P.p); setCommon(P, S); gl.disable(gl.CULL_FACE);
    gl.uniform2f(P.U.uCenter, g.center[0], g.center[1]); gl.uniform1f(P.U.uPatch, R.grass.patch); gl.uniform4fv(P.U.uMap, g.map);
    gl.uniform3fv(P.U.uPlayer, g.player); gl.uniform1f(P.U.uGrassH, g.h || 0.72);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, g.heightTex); gl.uniform1i(P.U.uHeight, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, g.colTex); gl.uniform1i(P.U.uColTex, 2);
    gl.bindVertexArray(R.grass.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 27, g.count || R.grass.n); gl.enable(gl.CULL_FACE);
  }
  // water
  if (S.water && S.water.mesh) {
    const w = S.water; P = R.P.water; gl.useProgram(P.p); setCommon(P, S);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    gl.uniform1f(P.U.uLevel, w.level); gl.uniform4fv(P.U.uMap, w.map); gl.uniform3fv(P.U.uShallow, w.shallow); gl.uniform3fv(P.U.uDeep, w.deep);
    gl.uniform3fv(P.U.uSkyTop, env.skyTop); gl.uniform3fv(P.U.uSkyHor, env.skyHor);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, w.heightTex); gl.uniform1i(P.U.uHeight, 1);
    gl.bindVertexArray(w.mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, w.mesh.count);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
  }
  // rain
  if (S.rain > 0.01) {
    if (!R.rain) R.rainInit(1600, 34);
    const rn = R.rain; P = R.P.rain; gl.useProgram(P.p); gl.uniformMatrix4fv(P.U.uVP, false, VP); gl.uniform3fv(P.U.uCamPos, S.cam); gl.uniform1f(P.U.uTime, S.time);
    gl.uniform1f(P.U.uRain, S.rain); gl.uniform1f(P.U.uBox, rn.box); gl.uniform2f(P.U.uWindXZ, S.rainWind ? S.rainWind[0] : 1.2, S.rainWind ? S.rainWind[1] : 0.4);
    gl.uniform3fv(P.U.uRainCol, S.rainCol || [0.78, 0.82, 0.9]);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    gl.bindVertexArray(rn.vao); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, rn.n);
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
  }
  // flats (transparent unlit)
  if (S.flats && S.flats.length) {
    P = R.P.flat; gl.useProgram(P.p); gl.uniformMatrix4fv(P.U.uVP, false, VP);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    for (const f of S.flats) { gl.uniformMatrix4fv(P.U.uModel, false, f.m); gl.uniform4fv(P.U.uColor, f.color); gl.bindVertexArray(f.mesh.vao); gl.drawArrays(gl.TRIANGLES, 0, f.mesh.count); }
    gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE);
  }
  // particles
  if (S.pts && S.pts.n && R.ptsBuf) {
    const pb = R.ptsBuf; P = R.P.pts; gl.useProgram(P.p); gl.uniformMatrix4fv(P.U.uVP, false, VP); gl.uniform1f(P.U.uScale, H * 0.9);
    gl.bindBuffer(gl.ARRAY_BUFFER, pb.buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pb.data, 0, S.pts.n * 8);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.bindVertexArray(pb.vao); gl.drawArrays(gl.POINTS, 0, S.pts.n);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
  gl.bindVertexArray(null);
};
function setCommonDepth(P, S) {
  const u = P.U; gl.uniformMatrix4fv(u.uVP, false, LVP); if (u.uModel) gl.uniformMatrix4fv(u.uModel, false, IDM);
  if (u.uTime) gl.uniform1f(u.uTime, S.time); if (u.uWind) gl.uniform1f(u.uWind, S.env.wind);
  if (u.uShadowVP) gl.uniformMatrix4fv(u.uShadowVP, false, LVP);
}
// project world point to screen
const PV = new Float32Array(4);
R.project = function (x, y, z, W, H) {
  const m = VP; const cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw <= 0.05) return null; return [(cx / cw * 0.5 + 0.5) * W, (1 - (cy / cw * 0.5 + 0.5)) * H, cw];
};

Object.assign(G, { clamp, lerp, smooth, angDiff, m4, m4id, m4mul, m4trs, m4inv, hash2, vnoise, fbm, rng, hexRGB, mixHex, spline, GB, R });
})(window.G);
