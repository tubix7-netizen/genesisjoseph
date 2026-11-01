/* 약속의 길 — world: terrain, chunked statics, collision, environment lighting, particles */
'use strict';
// v16.1: solid by default — trees, rocks, tents, wells, pyramids… that were placed without a collider (you walked through them like
// a painted backdrop) get one sized to the model. An explicit col: null still means "no collider" (rugs, things you walk into).
const SOLID = { oak: k => ({ r: 0.5 * k, h: 4 }), olive: k => ({ r: 0.35 * k, h: 3 }), fig: k => ({ r: 0.35 * k, h: 3 }), acacia: k => ({ r: 0.3 * k, h: 3 }), tamarisk: k => ({ r: 0.35 * k, h: 3 }),
  datePalm: k => ({ r: 0.32 * k, h: 5 }), palm: k => ({ r: 0.32 * k, h: 5 }), opuntia: k => ({ r: 0.5 * k, h: 1.2 }), retama: k => ({ r: 0.45 * k, h: 1.2 }), bush: k => ({ r: 0.45 * k, h: 1 }),
  rock: k => ({ r: 1.0 * k, h: 1.2 }), outcrop: k => ({ r: 1.7 * k, h: 2 }), rockField: k => ({ r: 1.1 * k, h: 1 }), cliff: k => ({ r: 3.4 * k, h: 5 }), honeyRock: k => ({ r: 0.9 * k, h: 1 }),
  tent: (k, o) => ({ w: 5.6 * k, d: 3.6 * k, h: 2.2, cam: true, a: o.ry || 0 }), well: k => ({ r: 1.5 * k, h: 1 }), trough: (k, o) => ({ w: 2.2 * k, d: 0.8 * k, h: 0.6, a: o.ry || 0 }),
  pillar: k => ({ r: 0.45 * k, h: 1.6 }), altar: k => ({ r: 0.9 * k, h: 1.1 }), column: k => ({ r: 0.8 * k, h: 6 }), obelisk: k => ({ r: 0.8 * k, h: 8 }), sacks: k => ({ r: 0.6 * k, h: 0.8 }), pots: k => ({ r: 0.5 * k, h: 0.8 }),
  pyramid: (k, o) => { const sz = ((o.args && o.args[0]) || 20) * k; return { w: sz * 1.38, d: sz * 1.38, h: sz * 1.2, cam: true, a: (o.ry || 0) + Math.PI / 4 * 0 }; }, stallM: (k, o) => ({ w: 2.4 * k, d: 2 * k, h: 2.2, a: o.ry || 0 }),
  booth: k => ({ r: 1.2 * k, h: 2.2 }), dovecote: k => ({ r: 1.1 * k, h: 3.5 }), shaduf: k => ({ r: 0.4 * k, h: 2.5 }), oven: k => ({ r: 0.8 * k, h: 1.2 }), quern: (k, o) => ({ w: 1 * k, d: 0.6 * k, h: 0.5, a: o.ry || 0 }),
  jars: (k, o) => { const n = (o.args && o.args[0]) || 4; return { w: n * 0.62 * k, d: 0.7 * k, h: 1, a: o.ry || 0 }; }, shelves: (k, o) => ({ w: 2.5 * k, d: 0.6 * k, h: 1.9, a: o.ry || 0 }),
  chestEg: (k, o) => ({ w: 0.95 * k, d: 0.6 * k, h: 0.7, a: o.ry || 0 }), bedEg: (k, o) => ({ w: 1.9 * k, d: 0.8 * k, h: 0.6, a: o.ry || 0 }), offering: (k, o) => ({ w: 1.8 * k, d: 0.8 * k, h: 0.9, a: o.ry || 0 }),
  potPlant: k => ({ r: 0.32 * k, h: 1 }), scribeDesk: (k, o) => ({ w: 1.2 * k, d: 0.6 * k, h: 0.6, a: o.ry || 0 }), tableEg: (k, o) => ({ w: 1.8 * k, d: 0.8 * k, h: 0.9, a: o.ry || 0 }), couch: (k, o) => ({ w: 2 * k, d: 0.8 * k, h: 0.8, a: o.ry || 0 }),
  felucca: (k, o) => ({ w: 1.6 * k, d: 4.8 * k, h: 1.2, a: (o.ry || 0) + Math.PI / 2 }), woodStack: (k, o) => ({ w: 0.6 * k, d: 0.9 * k, h: 0.4, a: o.ry || 0 }) };
const ROCKY = { rock: 1.2, outcrop: 2.4, rockField: 3.4, cliff: 4.5, honeyRock: 1.2 }; // footprint radius (m) of rock-like props
(function (G) {
const { GB, R, m4, m4trs, clamp, lerp, smooth, rng, hexRGB, fbm, vnoise } = G;

class World {
  constructor(spec) {
    this.spec = spec; this.size = spec.size; this.half = spec.size / 2; this.cell = spec.cell || 2;
    this.N = Math.round(this.size / this.cell) + 1; this.cols = []; this.circles = []; this.boxes = [];
    this.hash = new Map(); this.HC = 12; this.chunks = new Map(); this.dchunks = new Map(); this.CH = 48; this.statics = [];
    this.r = rng(spec.seed || 1); this.markers = {}; this.roofs = []; this.avoids = []; this.ladders = [];
  }
  // ------------------------------------------------ terrain
  buildTerrain() {
    const N = this.N, s = this.spec, h = this.h = new Float32Array(N * N);
    for (let iz = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++) h[iz * N + ix] = s.height(-this.half + ix * this.cell, -this.half + iz * this.cell);
    // normals
    const nx = this.nx = new Float32Array(N * N), ny = this.ny = new Float32Array(N * N), nz = this.nz = new Float32Array(N * N);
    for (let iz = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++) {
      const hl = h[iz * N + Math.max(0, ix - 1)], hr = h[iz * N + Math.min(N - 1, ix + 1)], hd = h[Math.max(0, iz - 1) * N + ix], hu = h[Math.min(N - 1, iz + 1) * N + ix];
      let a = hl - hr, b = 2 * this.cell, c = hd - hu; const l = Math.hypot(a, b, c); nx[iz * N + ix] = a / l; ny[iz * N + ix] = b / l; nz[iz * N + ix] = c / l;
    }
    // colors + grass
    const col = this.col = new Float32Array(N * N * 3), tex = new Uint8Array(N * N * 4);
    for (let iz = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++) {
      const i = iz * N + ix, x = -this.half + ix * this.cell, z = -this.half + iz * this.cell;
      const c = s.color(x, z, h[i], ny[i]);
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      tex[i * 4] = c[0] * 255; tex[i * 4 + 1] = c[1] * 255; tex[i * 4 + 2] = c[2] * 255; tex[i * 4 + 3] = clamp(c[3] || 0, 0, 1) * 255;
    }
    this.colTexData = tex;
    this.heightTex = R.tex(N, N, h, 'r16f'); this.colTex = R.tex(N, N, tex);
    this.map = [-this.half, -this.half, this.size, 0];
    this.rebuildTerrainMesh();
    // water
    if (s.water) {
      const lv = s.water.level, d = [], st = 4, n = this.size / st;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x0 = -this.half + i * st, z0 = -this.half + j * st, x1 = x0 + st, z1 = z0 + st;
        const m = Math.min(this.heightAt(x0, z0), this.heightAt(x1, z0), this.heightAt(x0, z1), this.heightAt(x1, z1), this.heightAt(x0 + 2, z0 + 2));
        if (m > lv + 0.25) continue;
        const v = (x, z) => d.push(x, lv, z, 0, 1, 0, 1, 1, 1, 0, 0);
        v(x0, z1); v(x1, z1); v(x1, z0); v(x0, z1); v(x1, z0); v(x0, z0);
      }
      this.water = { mesh: R.mesh(new Float32Array(d)), level: lv, map: this.map, heightTex: this.heightTex, shallow: s.water.shallow || [0.35, 0.7, 0.68], deep: s.water.deep || [0.1, 0.33, 0.42] };
    }
  }
  rebuildTerrainMesh() {
    const N = this.N, h = this.h, C = 24; // cells per chunk
    if (this.terrain) this.terrain.forEach(m => R.free(m));
    this.terrain = [];
    for (let cz = 0; cz < N - 1; cz += C) for (let cx = 0; cx < N - 1; cx += C) {
      const d = []; let y0 = 1e9, y1 = -1e9;
      const v = (ix, iz) => { const i = iz * N + ix; const y = h[i]; if (y < y0) y0 = y; if (y > y1) y1 = y; d.push(-this.half + ix * this.cell, y, -this.half + iz * this.cell, this.nx[i], this.ny[i], this.nz[i], this.col[i * 3], this.col[i * 3 + 1], this.col[i * 3 + 2], 0, 0); };
      for (let iz = cz; iz < Math.min(cz + C, N - 1); iz++) for (let ix = cx; ix < Math.min(cx + C, N - 1); ix++) {
        if ((ix + iz) % 2) { v(ix, iz + 1); v(ix + 1, iz + 1); v(ix + 1, iz); v(ix, iz + 1); v(ix + 1, iz); v(ix, iz); }
        else { v(ix, iz + 1); v(ix + 1, iz + 1); v(ix, iz); v(ix + 1, iz + 1); v(ix + 1, iz); v(ix, iz); }
      }
      const m = R.mesh(new Float32Array(d)); const w = C * this.cell / 2;
      m.bs = [-this.half + (cx + C / 2) * this.cell, (y0 + y1) / 2, -this.half + (cz + C / 2) * this.cell, Math.hypot(w, w, (y1 - y0) / 2) + 1];
      this.terrain.push(m);
    }
  }
  recolor(fn) { // recompute colors with new color function
    const N = this.N, s = this.spec, tex = this.colTexData;
    for (let iz = 0; iz < N; iz++) for (let ix = 0; ix < N; ix++) {
      const i = iz * N + ix, x = -this.half + ix * this.cell, z = -this.half + iz * this.cell;
      const c = fn(x, z, this.h[i], this.ny[i]); this.col[i * 3] = c[0]; this.col[i * 3 + 1] = c[1]; this.col[i * 3 + 2] = c[2];
      tex[i * 4] = c[0] * 255; tex[i * 4 + 1] = c[1] * 255; tex[i * 4 + 2] = c[2] * 255; tex[i * 4 + 3] = clamp(c[3] || 0, 0, 1) * 255;
    }
    R.texUpdate(this.colTex, N, N, tex); this.rebuildTerrainMesh();
  }
  heightAt(x, z) {
    const N = this.N, fx = clamp((x + this.half) / this.cell, 0, N - 1.001), fz = clamp((z + this.half) / this.cell, 0, N - 1.001);
    const ix = fx | 0, iz = fz | 0, tx = fx - ix, tz = fz - iz, h = this.h;
    return lerp(lerp(h[iz * N + ix], h[iz * N + ix + 1], tx), lerp(h[(iz + 1) * N + ix], h[(iz + 1) * N + ix + 1], tx), tz);
  }
  surfAt(x, z) { const N = this.N, ix = clamp(Math.round((x + this.half) / this.cell), 0, N - 1), iz = clamp(Math.round((z + this.half) / this.cell), 0, N - 1), i = iz * N + ix;
    if (this.ny[i] < 0.8) return 'stone'; return this.colTexData[i * 4 + 3] > 120 ? 'grass' : 'sand'; }
  slopeAt(x, z) { const N = this.N, ix = clamp(Math.round((x + this.half) / this.cell), 0, N - 1), iz = clamp(Math.round((z + this.half) / this.cell), 0, N - 1); return 1 - this.ny[iz * N + ix]; }
  // ------------------------------------------------ statics
  gb(x, z, detail) { const C = detail ? 24 : this.CH, map = detail ? this.dchunks : this.chunks; const k = Math.floor((x + this.half) / C) + ',' + Math.floor((z + this.half) / C); let g = map.get(k); if (!g) { g = new GB((map.size + 3) * 77); map.set(k, g); } return g; }
  place(fn, x, z, o) {
    o = o || {}; let y = o.y !== undefined ? o.y : this.heightAt(x, z) + (o.dy || 0);
    // v15: rocks, outcrops and scree must not hang in the air on a slope — sit them on the LOWEST ground under their footprint (the uphill side just sinks in)
    if (o.y === undefined && typeof fn === 'string' && ROCKY[fn]) { const rad = ROCKY[fn] * (o.s || 1); let lo = y; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; lo = Math.min(lo, this.heightAt(x + Math.cos(a) * rad, z + Math.sin(a) * rad), this.heightAt(x + Math.cos(a) * rad * 0.5, z + Math.sin(a) * rad * 0.5)); } y = lo - 0.04 + (o.dy || 0); }
    const M = m4trs(m4(), x, y, z, o.ry || 0, 0, 0, o.s || 1, o.s || 1, o.s || 1);
    const g = o.gb || this.gb(x, z, o.detail); const r = rng(o.seed || ((x * 73856093) ^ (z * 19349663)));
    (typeof fn === 'string' ? G.env[fn] : fn)(g, M, r, ...(o.args || []));
    const kind = o.kind || (typeof fn === 'string' ? fn : null);
    if (o.col === undefined && kind && SOLID[kind] && !o.gb && !o.noCol) { const c = SOLID[kind](o.s || 1, o); if (c) o = Object.assign({}, o, { col: c }); }
    if (o.col) this.addCol(Object.assign({ x, z, a: o.ry || 0, y0: y, y1: y + (o.col.h || 3) }, o.col));
    return { x, y, z };
  }
  finishStatics() {
    for (const [k, g] of this.chunks) { if (!g.count) continue; const m = R.mesh(g); this.statics.push(m); if (G.Game && G.Game.cellAsk) G.Game.cellAsk(m, g); } // v17.3 P13: the worker sorts big chunks into 12 m cells
    for (const [k, g] of this.dchunks) { if (!g.count) continue; const m = R.mesh(g); m.cullDist = 75; m.shadow = true; this.statics.push(m); }
    this.chunks.clear(); this.dchunks.clear();
  }
  // ------------------------------------------------ collision (circles & oriented boxes)
  addCol(c) {
    c.on = c.on !== false; if (c.r) c.t = 'c'; else { c.t = 'b'; c.hw = c.w / 2; c.hd = c.d / 2; c.ca = Math.cos(c.a || 0); c.sa = Math.sin(c.a || 0); }
    if (c.y0 === undefined) { c.y0 = this.heightAt(c.x, c.z); c.y1 = c.y0 + (c.h || 3); }
    const ext = c.t === 'c' ? c.r : Math.hypot(c.hw, c.hd); const H = this.HC;
    for (let gx = Math.floor((c.x - ext) / H); gx <= Math.floor((c.x + ext) / H); gx++) for (let gz = Math.floor((c.z - ext) / H); gz <= Math.floor((c.z + ext) / H); gz++) {
      const k = gx * 10007 + gz; let a = this.hash.get(k); if (!a) { a = []; this.hash.set(k, a); } a.push(c);
    }
    this.cols.push(c); return c;
  }
  near(x, z) { return this.hash.get(Math.floor(x / this.HC) * 10007 + Math.floor(z / this.HC)) || []; }
  collide(p, r, y) {
    const list = this.near(p.x, p.z);
    for (const c of list) {
      if (!c.on) continue; if (y !== undefined && (y > c.y1 - 0.05 || y + 1.6 < c.y0)) continue;
      if (c.t === 'c') { const dx = p.x - c.x, dz = p.z - c.z, R2 = r + c.r; const d2 = dx * dx + dz * dz; if (d2 < R2 * R2 && d2 > 1e-8) { const d = Math.sqrt(d2); p.x = c.x + dx / d * R2; p.z = c.z + dz / d * R2; p.hit = c; } }
      else {
        const dx = p.x - c.x, dz = p.z - c.z; const lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca;
        const qx = clamp(lx, -c.hw, c.hw), qz = clamp(lz, -c.hd, c.hd); let ex = lx - qx, ez = lz - qz; const d2 = ex * ex + ez * ez;
        if (d2 < r * r) {
          let nlx, nlz;
          if (d2 > 1e-8) { const d = Math.sqrt(d2); nlx = qx + ex / d * r; nlz = qz + ez / d * r; }
          else { const pxp = c.hw - lx, pxn = lx + c.hw, pzp = c.hd - lz, pzn = lz + c.hd, m = Math.min(pxp, pxn, pzp, pzn); nlx = lx; nlz = lz; if (m === pxp) nlx = c.hw + r; else if (m === pxn) nlx = -c.hw - r; else if (m === pzp) nlz = c.hd + r; else nlz = -c.hd - r; }
          p.x = c.x + nlx * c.ca + nlz * c.sa; p.z = c.z - nlx * c.sa + nlz * c.ca; p.hit = c;
        }
      }
    }
  }
  /* swept move: walk p by (dx,dz) in steps no longer than half the radius, resolving walls after every step, so a fast
     dash, a dodge roll or a long frame can't tunnel through a thin wall. Two passes per step settle corners. */
  move(p, dx, dz, r, y) {
    const L = Math.hypot(dx, dz), n = Math.min(12, Math.max(1, Math.ceil(L / Math.max(0.08, r * 0.5))));
    for (let i = 0; i < n; i++) { p.x += dx / n; p.z += dz / n; this.collide(p, r, y); this.collide(p, r, y); }
    return p;
  }
  // ------------------------------------------------ roofs (for the indoor camera) & keep-out zones (pits) & ladders
  addRoof(o) { const r = Object.assign({ a: 0 }, o); r.ca = Math.cos(r.a); r.sa = Math.sin(r.a); r.hw = r.w / 2; r.hd = r.d / 2; this.roofs.push(r); return r; }
  roofAt(x, z, y) { // the lowest roof above a standing person at (x, y, z), or null
    let best = null;
    for (const r of this.roofs) { if (r.on === false) continue; const dx = x - r.x, dz = z - r.z, lx = dx * r.ca - dz * r.sa, lz = dx * r.sa + dz * r.ca;
      if (Math.abs(lx) > r.hw || Math.abs(lz) > r.hd) continue; if (r.y < y + 1.3 || r.y > y + 9) continue; if (!best || r.y < best.y) best = r; }
    return best;
  }
  inRoof(x, z, y, skip) { // a roofed room that contains this point (for keeping the camera out of rooms the hero isn't in)
    for (const r of this.roofs) { if (r === skip || r.on === false) continue; const dx = x - r.x, dz = z - r.z, lx = dx * r.ca - dz * r.sa, lz = dx * r.sa + dz * r.ca;
      if (Math.abs(lx) < r.hw + 0.2 && Math.abs(lz) < r.hd + 0.2 && y < r.y + 0.35 && y > r.y - 7) return r; }
    return null;
  }
  addAvoid(c) { c.on = c.on !== false; this.avoids.push(c); return c; }
  /* keep a walker out of holes and other no-go circles: a point inside is pushed back to the rim, and a step that would
     cut across one is bent along the rim instead, so cutscene walkers go round a pit instead of floating over it */
  avoid(p, fx, fz) {
    for (const c of this.avoids) { if (!c.on) continue; const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz);
      if (d < c.r) { if (fx !== undefined && Math.hypot(fx - c.x, fz - c.z) < c.r - 0.05) continue; // already inside on purpose (Joseph in the pit)
        const k = d > 1e-4 ? c.r / d : 1; p.x = c.x + (d > 1e-4 ? dx : 1) * k; p.z = c.z + (d > 1e-4 ? dz : 0) * k; } }
    return p;
  }
  avoidSteer(x, z, tx, tz) { // returns a waypoint to head for instead of (tx,tz) if the straight line crosses a keep-out circle
    for (const c of this.avoids) { if (!c.on) continue; const vx = tx - x, vz = tz - z, L2 = vx * vx + vz * vz; if (L2 < 1e-6) continue;
      const t = clamp(((c.x - x) * vx + (c.z - z) * vz) / L2, 0, 1), px = x + vx * t, pz = z + vz * t, d = Math.hypot(px - c.x, pz - c.z);
      if (d >= c.r + 0.3 || Math.hypot(tx - c.x, tz - c.z) < c.r) continue;
      // go to the rim point on the side of the line, a little beyond the circle
      let ox = px - c.x, oz = pz - c.z, ol = Math.hypot(ox, oz); if (ol < 1e-3) { ox = -vz; oz = vx; ol = Math.hypot(ox, oz); }
      const R2 = c.r + 0.9; return [c.x + ox / ol * R2, c.z + oz / ol * R2]; }
    return null;
  }
  addLadder(o) { const l = Object.assign({ a: 0, w: 0.8 }, o); this.ladders.push(l); return l; }
  // ray from a to b against tall boxes/circles, returns fraction 0..1
  ray(ax, ay, az, bx, by, bz) {
    let best = 1; const seen = new Set(); const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const x = lerp(ax, bx, i / steps), z = lerp(az, bz, i / steps);
      for (const c of this.near(x, z)) {
        if (!c.on || seen.has(c) || !c.cam) continue; seen.add(c);
        let t = 1;
        if (c.t === 'b') {
          const tr = (px, pz) => { const dx = px - c.x, dz = pz - c.z; return [dx * c.ca - dz * c.sa, dx * c.sa + dz * c.ca]; };
          const A = tr(ax, az), Bq = tr(bx, bz); const d = [Bq[0] - A[0], by - ay, Bq[1] - A[1]]; const o = [A[0], ay, A[1]];
          const mn = [-c.hw, c.y0, -c.hd], mx = [c.hw, c.y1, c.hd]; let t0 = 0, t1 = 1, ok = true;
          for (let k = 0; k < 3; k++) { if (Math.abs(d[k]) < 1e-9) { if (o[k] < mn[k] || o[k] > mx[k]) { ok = false; break; } } else { let u = (mn[k] - o[k]) / d[k], v = (mx[k] - o[k]) / d[k]; if (u > v) [u, v] = [v, u]; t0 = Math.max(t0, u); t1 = Math.min(t1, v); if (t0 > t1) { ok = false; break; } } }
          if (ok) t = t0;
        }
        if (t < best) best = t;
      }
    }
    return best;
  }
}

// =================================================================== ENVIRONMENT LIGHTING (time of day)
const KEYS = [ // hour, sunCol, skyAmb, gndAmb, skyTop, skyHor, fog, cloud
  [0, [0.10, 0.13, 0.22], [0.16, 0.2, 0.32], [0.08, 0.08, 0.12], [0.03, 0.05, 0.13], [0.09, 0.12, 0.22], [0.09, 0.11, 0.19], [0.22, 0.25, 0.35]],
  [4.8, [0.12, 0.14, 0.24], [0.17, 0.2, 0.32], [0.08, 0.08, 0.12], [0.05, 0.07, 0.17], [0.16, 0.17, 0.27], [0.15, 0.15, 0.24], [0.3, 0.3, 0.4]],
  [6.0, [1.0, 0.62, 0.4], [0.45, 0.42, 0.48], [0.3, 0.24, 0.2], [0.32, 0.42, 0.62], [0.98, 0.72, 0.55], [0.86, 0.7, 0.6], [1.0, 0.82, 0.72]],
  [8.0, [1.05, 0.93, 0.78], [0.5, 0.56, 0.66], [0.36, 0.31, 0.26], [0.3, 0.52, 0.82], [0.78, 0.84, 0.88], [0.8, 0.84, 0.86], [1.0, 0.98, 0.95]],
  [12, [1.08, 1.02, 0.9], [0.52, 0.6, 0.72], [0.38, 0.34, 0.28], [0.26, 0.5, 0.86], [0.72, 0.84, 0.92], [0.78, 0.85, 0.9], [1.0, 1.0, 1.0]],
  [16.5, [1.05, 0.92, 0.75], [0.5, 0.55, 0.64], [0.36, 0.3, 0.25], [0.3, 0.5, 0.8], [0.8, 0.82, 0.84], [0.82, 0.82, 0.82], [1.0, 0.96, 0.92]],
  [18.6, [1.05, 0.5, 0.3], [0.42, 0.36, 0.44], [0.3, 0.2, 0.18], [0.3, 0.32, 0.55], [1.0, 0.6, 0.42], [0.9, 0.6, 0.48], [1.0, 0.7, 0.6]],
  [19.8, [0.3, 0.22, 0.32], [0.22, 0.22, 0.34], [0.12, 0.1, 0.14], [0.08, 0.1, 0.25], [0.35, 0.25, 0.35], [0.25, 0.2, 0.3], [0.45, 0.35, 0.45]],
  [21, [0.1, 0.13, 0.22], [0.16, 0.2, 0.32], [0.08, 0.08, 0.12], [0.03, 0.05, 0.13], [0.09, 0.12, 0.22], [0.09, 0.11, 0.19], [0.22, 0.25, 0.35]],
  [24, [0.10, 0.13, 0.22], [0.16, 0.2, 0.32], [0.08, 0.08, 0.12], [0.03, 0.05, 0.13], [0.09, 0.12, 0.22], [0.09, 0.11, 0.19], [0.22, 0.25, 0.35]]];
function envAt(hour, mood) {
  let a = KEYS[0], b = KEYS[1];
  for (let i = 0; i < KEYS.length - 1; i++) if (hour >= KEYS[i][0] && hour <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  const t = (hour - a[0]) / (b[0] - a[0] || 1), L = (i) => [lerp(a[i][0], b[i][0], t), lerp(a[i][1], b[i][1], t), lerp(a[i][2], b[i][2], t)];
  const e = { sunCol: L(1), skyAmb: L(2), gndAmb: L(3), skyTop: L(4), skyHor: L(5), fogCol: L(6), cloudCol: L(7) };
  // sun position: rises east (+x) at 6, sets west at 18.6
  const dayT = clamp((hour - 5.8) / 13.0, 0, 1);
  const ang = dayT * Math.PI; let sx = Math.cos(ang), sy = Math.sin(ang) * 0.95 + 0.05, sz = 0.35;
  const night = 1 - smooth(4.9, 6.2, hour) + smooth(19.0, 20.6, hour);
  e.night = clamp(night, 0, 1);
  if (e.night > 0.5) { const nt = ((hour + 24 - 19.5) % 24) / 10.5; const na = nt * Math.PI; sx = -Math.cos(na); sy = Math.sin(na) * 0.8 + 0.2; sz = -0.3; }
  const l = Math.hypot(sx, sy, sz); e.sunDir = [sx / l, Math.max(0.08, sy / l), sz / l];
  e.fogDen = 1 / 320; e.wind = 1; e.cloud = 0.5; e.rock = [0.66, 0.58, 0.48];
  if (mood && mood.mod) mood.mod(e, hour);
  return e;
}

// =================================================================== PARTICLES
const FX = { list: [], max: 1600 };
FX.init = function () { R.ptsInit(FX.max); };
FX.burst = function (x, y, z, n, o) {
  o = o || {}; const c = o.c || [1, 1, 1];
  for (let i = 0; i < n && FX.list.length < FX.max; i++) {
    const a = Math.random() * Math.PI * 2, sp = (o.sp || 1.5) * (0.4 + Math.random() * 0.8);
    FX.list.push({ x: x + (Math.random() - 0.5) * (o.spread || 0.3), y, z: z + (Math.random() - 0.5) * (o.spread || 0.3), vx: Math.cos(a) * sp * (o.h === undefined ? 1 : o.h), vy: (o.up || 1.5) * (0.5 + Math.random()), vz: Math.sin(a) * sp * (o.h === undefined ? 1 : o.h),
      life: (o.life || 0.8) * (0.7 + Math.random() * 0.6), t: 0, size: (o.size || 0.15) * (0.7 + Math.random() * 0.6), c, g: o.g === undefined ? 4 : o.g, a: o.a || 1, drag: o.drag || 0.5 });
  }
};
FX.update = function (dt) {
  const d = R.ptsBuf.data; let n = 0;
  for (let i = FX.list.length - 1; i >= 0; i--) {
    const p = FX.list[i]; p.t += dt; if (p.t > p.life) { FX.list.splice(i, 1); continue; }
    p.vy -= p.g * dt; p.vx *= 1 - p.drag * dt; p.vz *= 1 - p.drag * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    const k = p.t / p.life, o = n * 8; d[o] = p.x; d[o + 1] = p.y; d[o + 2] = p.z; d[o + 3] = p.c[0]; d[o + 4] = p.c[1]; d[o + 5] = p.c[2]; d[o + 6] = p.a * (1 - k * k); d[o + 7] = p.size * (k < 0.15 ? k / 0.15 : 1); n++;
  }
  return n;
};

/* v17.0 포아송 디스크 배치 (움직임 연구 보고서 E04, Bridson 2007 "Fast Poisson Disk Sampling"): points that keep a minimum
   distance from each other, so trees and rocks neither clump nor leave holes like plain random points do. rFn(x, z) gives the
   spacing at a spot (variable radius: groves where it is fertile, sparse in the desert). Deterministic for a given rng. */
function poisson(r, x0, z0, x1, z1, rFn, rMin, rMax, k) {
  k = k || 24; const cell = rMin / Math.SQRT2, gw = Math.ceil((x1 - x0) / cell), gh = Math.ceil((z1 - z0) / cell), grid = new Int32Array(gw * gh).fill(-1);
  const pts = [], act = [], span = Math.ceil(rMax / cell);
  const fits = (x, z, rr) => { if (x < x0 || x >= x1 || z < z0 || z >= z1) return false; const gx = (x - x0) / cell | 0, gz = (z - z0) / cell | 0;
    for (let j = Math.max(0, gz - span); j <= Math.min(gh - 1, gz + span); j++) for (let i = Math.max(0, gx - span); i <= Math.min(gw - 1, gx + span); i++) {
      const q = grid[j * gw + i]; if (q < 0) continue; const p = pts[q]; if (Math.hypot(p[0] - x, p[1] - z) < Math.max(rr, p[2])) return false; } return true; };
  const add = (x, z) => { const rr = clamp(rFn(x, z), rMin, rMax); pts.push([x, z, rr]); act.push(pts.length - 1); grid[((z - z0) / cell | 0) * gw + ((x - x0) / cell | 0)] = pts.length - 1; };
  add(x0 + (x1 - x0) * (0.25 + r() * 0.5), z0 + (z1 - z0) * (0.25 + r() * 0.5));
  while (act.length) { const ai = r() * act.length | 0, p = pts[act[ai]]; let found = false;
    for (let t = 0; t < k; t++) { const a = r() * Math.PI * 2, d = p[2] * (1 + r()), x = p[0] + Math.cos(a) * d, z = p[1] + Math.sin(a) * d;
      if (fits(x, z, clamp(rFn(x, z), rMin, rMax))) { add(x, z); found = true; break; } }
    if (!found) { act[ai] = act[act.length - 1]; act.pop(); } }
  return pts;
}
Object.assign(G, { World, envAt, FX, poisson });
})(window.G);
