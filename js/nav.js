/* 약속의 길 — 수레 길 안내 (v18.30)
   수레에 타고 있고 갈 곳(이야기 목표 · 부탁 · 지도에 찍은 표시)이 있으면, 수레가 실제로 갈 수 있는 길을 찾아
   작은 지도와 큰 지도에 노란 길로 그려 줘요(세상 속에는 안 보여요).
   · 수레가 못 가는 곳: 깊은 물(나루의 얕은 곳은 건너요), 마을·성 안, 벽·집·바위, 가파른 비탈.
   · 목표가 마을 안이면 마을 어귀까지 안내해요. 길에서 벗어나면 다시 찾아요. */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const Nv = G.Nav = {};
const CELL = 4;
/* v18.35 low things a wagon still can't cross: fire rings, troughs (solidAt leaves out what is shorter than 0.7 m) */
const lowAt = (W, x, z) => { for (const c of W.near(x, z)) { if (!c.on || c.npcOnly) continue; if (c.t === 'c' ? c.r > 0.45 && Math.hypot(x - c.x, z - c.z) < c.r + 1.1 : false) return true; if (c.t === 'b') { const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca; if (Math.abs(lx) < c.hw + 0.9 && Math.abs(lz) < c.hd + 0.9) return true; } } return false; };
let grid = null, N = 0, half = 0, path = null, goal = null, lastT = 0, worldRef = null, colN = 0;
/* the fixed part of what blocks a wagon (built once per world): houses and rocks, towns, steep ground */
/* v18.40 a cell is open only if the wagon fits anywhere in it, not just at its middle (it used to steer into a wall corner or a fire
   that sat off the cell's centre and then say the road was blocked) */
const SAMP = [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function build() { const W = Game.W(); if (!W) return false; worldRef = W; colN = W.cols ? W.cols.length : 0; half = W.half; N = Math.ceil(W.size / CELL); grid = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = -half + (i + 0.5) * CELL, z = -half + (j + 0.5) * CELL; let b = 0;
    if (W.slopeAt(x, z) > 0.5) b = 1; else for (const [a, c] of SAMP) { const px = x + a * 0.95, pz = z + c * 0.95; if (Game.solidAt(px, pz, a ? 0.9 : 1.1) || lowAt(W, px, pz)) { b = 1; break; } }
    if (!b && !wet(W, x, z)) for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; if (wet(W, x + Math.cos(an) * 2.1, z + Math.sin(an) * 2.1)) { b = 1; break; } } /* v18.41 keep a wagon's width away from deep water (fords stay open: they are shallow) */
    grid[j * N + i] = b; } return true; }
const wet = (W, x, z) => W.water && W.heightAt(x, z) < W.water.level - 0.6;
const cellOf = (x, z) => [Math.max(0, Math.min(N - 1, Math.floor((x + half) / CELL))), Math.max(0, Math.min(N - 1, Math.floor((z + half) / CELL)))];
const ctr = (i, j) => [-half + (i + 0.5) * CELL, -half + (j + 0.5) * CELL];
function open(W, i, j) { if (i < 0 || j < 0 || i >= N || j >= N || grid[j * N + i]) return false; const [x, z] = ctr(i, j); return !wet(W, x, z); }
function nearestOpen(W, i0, j0) { if (open(W, i0, j0)) return [i0, j0]; for (let r = 1; r < 30; r++) { let best = null, bd = 1e9; for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; if (open(W, i0 + di, j0 + dj)) { const d = di * di + dj * dj; if (d < bd) { bd = d; best = [i0 + di, j0 + dj]; } } } if (best) return best; } return null; }
/* A* over the cells, eight ways, a little dearer beside walls and water so the line keeps to open ground */
function astar(W, s, g) { const n = N * N, gs = new Float32Array(n).fill(1e9), from = new Int32Array(n).fill(-1), closed = new Uint8Array(n), heap = [];
  const push = (k, f) => { heap.push([f, k]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = c * 2 + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  const sk = s[1] * N + s[0], gk = g[1] * N + g[0]; gs[sk] = 0; push(sk, 0); let it = 0;
  const near = (i, j) => { let c = 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!open(W, i + a, j + b)) c++; return c; };
  while (heap.length && it++ < 60000) { const [, k] = pop(); if (closed[k]) continue; closed[k] = 1; if (k === gk) break; const i = k % N, j = (k / N) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (!open(W, ni, nj)) continue; if (di && dj && (!open(W, i + di, j) || !open(W, i, j + dj))) continue;
      const nk = nj * N + ni, cost = gs[k] + (di && dj ? 1.414 : 1) + near(ni, nj) * 0.6; if (cost < gs[nk]) { gs[nk] = cost; from[nk] = k; push(nk, cost + Math.hypot(g[0] - ni, g[1] - nj)); } } }
  if (from[gk] < 0 && gk !== sk) return null; const out = []; for (let k = gk; k >= 0; k = from[k]) { out.push(k); if (k === sk) break; } return out.reverse(); }
/* straighten: skip cells while the straight line between stays on open ground */
function clear(W, a, b) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(d / (CELL * 0.5)); for (let t = 1; t < n; t++) { const x = a[0] + (b[0] - a[0]) * t / n, z = a[1] + (b[1] - a[1]) * t / n, [i, j] = cellOf(x, z); if (!open(W, i, j)) return false; } return true; }
function smooth(W, pts) { if (pts.length < 3) return pts; const out = [pts[0]]; let i = 0; while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clear(W, pts[i], pts[j])) j--; out.push(pts[j]); i = j; } return out; }
function solve(tx, tz) { const W = Game.W(), P = Game.P; if (!W) return null; if (!grid || worldRef !== W || (W.cols && W.cols.length !== colN)) build(); /* v18.40 rebuilt when something new stands in the world (a fire, a house) */ const s = nearestOpen(W, ...cellOf(P.x, P.z)), g = nearestOpen(W, ...cellOf(tx, tz)); if (!s || !g) return null;
  let ks = astar(W, s, g);
  if (!ks) { /* v18.47 the goal's nearest open cell can be a walled-in pocket (a yard between houses): try the open cells round it, nearest first, before giving up */
    const [gi, gj] = cellOf(tx, tz), alt = []; for (let dj = -7; dj <= 7; dj++) for (let di = -7; di <= 7; di++) { if ((di === g[0] - gi && dj === g[1] - gj) || !open(W, gi + di, gj + dj)) continue; alt.push([di * di + dj * dj, gi + di, gj + dj]); }
    alt.sort((a, b) => a[0] - b[0]); let last = null, tries = 0; for (const [, i, j] of alt) { if (last && Math.abs(i - last[0]) + Math.abs(j - last[1]) < 3) continue; last = [i, j]; ks = astar(W, s, [i, j]); if (ks || ++tries >= 6) break; } }
  if (!ks) return null; const pts = ks.map(k => ctr(k % N, (k / N) | 0)); pts[0] = [P.x, P.z]; return smooth(W, pts); }
const target = () => { const s = Game.S(), j = s && s.q && s.q.dlJob; if (j && j.go && G.Errands && G.Errands.drop) { const d = G.Errands.drop(j.v); if (d) return { x: d[0], z: d[1] }; } /* a delivery: the whole road to the flag, fords and all */
  const t = Game.curTarget; if (!t || t.x === undefined) { Nv.park = null; return null; } const pk = parkFor(t); Nv.park = pk; return pk || t; };
/* v18.42 the wagon does not squeeze into a village's lanes (the horses' length caught the house corners): when the goal is inside
   a village and the wagon is still outside it, the way ends at the village's edge on the road — 「수레 세우는 곳」 — and you walk the rest */
let pkC = null;
function parkFor(t) { const s = Game.S(), P = Game.P, E = G.EP && G.EP.joseph; if (!E || !(s && s.q && s.q.riding && s.q.chariotOk)) return null;
  if (pkC && Math.hypot(pkC.tx - t.x, pkC.tz - t.z) < 4 && Math.hypot(pkC.px - P.x, pkC.pz - P.z) < 30) return pkC.res;
  let res = null;
  for (const v of E.villages || []) { if (v.id === 'city' || (v.when && !v.when(s))) continue; const dP = Math.hypot(P.x - v.x, P.z - v.z);
    if (Math.hypot(t.x - v.x, t.z - v.z) > v.r + 2 || dP < 22) continue;
    /* the road point closest to the goal, but not in the middle of the village (the well, the lanes) and on Joseph's side of it */
    let best = null, bd = 1e9;
    for (const r of E.roads || []) for (let i = 0; i < r.length - 1; i++) { const [ax, az] = r[i], [bx, bz] = r[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L));
      for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n, dc = Math.hypot(x - v.x, z - v.z); if (dc < 12 || dc > v.r + 6 || Math.hypot(x - P.x, z - P.z) > dP) continue; const d = Math.hypot(x - t.x, z - t.z); if (d < bd) { bd = d; best = [x, z]; } } }
    if (!best) { const a = Math.atan2(P.z - v.z, P.x - v.x); best = [v.x + Math.cos(a) * 14, v.z + Math.sin(a) * 14]; }
    if (Math.hypot(best[0] - t.x, best[1] - t.z) < 9) break; /* the goal is by the road anyway: drive there */
    res = { x: best[0], z: best[1], real: { x: t.x, z: t.z }, n: v.n }; break; }
  pkC = { tx: t.x, tz: t.z, px: P.x, pz: P.z, res }; return res; }
Nv.park = null;
Nv.path = () => path;
Nv.wetNear = (x, z, r) => { const W = Game.W(); if (!W || !W.water) return false; if (wet(W, x, z)) return true; for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; if (wet(W, x + Math.cos(an) * r, z + Math.sin(an) * r)) return true; } return false; };
Nv.on = () => { const s = Game.S(); return !!(s && s.q && s.q.riding && s.q.chariotOk) || !!(G.Ride && G.Ride.isHorse && G.Ride.isHorse()); };
function offPath(P) { if (!path || path.length < 2) return true; let bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((P.x - ax) * dx + (P.z - az) * dz) / L)); bd = Math.min(bd, Math.hypot(P.x - ax - dx * t, P.z - az - dz * t)); } return bd > 10; }
/* trim the part already driven */
function trim(P) { if (!path) return; while (path.length > 2 && Math.hypot(path[1][0] - P.x, path[1][1] - P.z) < CELL * 1.5) path.splice(1, 1); path[0] = [P.x, P.z]; }
Nv.tick = function (dt) { const P = Game.P, tg = target(); if (!Nv.on() || !tg || Game.cineOn || (G.Cave && G.Cave.inside && G.Cave.inside()) || (G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) { path = null; goal = null; return; }
  const now = performance.now(); const moved = !goal || Math.hypot(goal[0] - tg.x, goal[1] - tg.z) > 4;
  if (moved || (now - lastT > 4000 && offPath(P))) { lastT = now; goal = [tg.x, tg.z]; try { path = solve(tg.x, tg.z); } catch (e) { console.error('nav', e); path = null; } }
  else trim(P); };
Nv.reset = () => { grid = null; path = null; goal = null; };
if (G.Build) for (const k of ['relocate', 'remove', 'prebuild', 'confirm']) { const f0 = G.Build[k]; if (typeof f0 === 'function') G.Build[k] = function () { const r = f0.apply(this, arguments); grid = null; return r; }; }
/* draw on a 2D map: toS(x, z) → [sx, sy] */
Nv.draw = function (c, toS, w) { if (!path || path.length < 2) return false; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  for (const [col, lw] of [['rgba(40,24,6,.85)', (w || 4) + 3], ['#ffd24a', w || 4]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); path.forEach((p, i) => { const [x, y] = toS(p[0], p[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); }
  c.restore(); return true; };
const EPj = G.EP && G.EP.joseph; if (EPj) { const up0 = EPj.update; EPj.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode === 'play') Nv.tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); return r; };
  const ol0 = EPj.onLoad; EPj.onLoad = function () { Nv.reset(); return ol0 ? ol0.apply(this, arguments) : undefined; }; }

/* v18.42 on foot the compass arrow never points through a wall: when a wall stands between Joseph and the goal, a small 1 m grid
   search around them finds the way through the gate/door, and the arrow points at the farthest point of that way he can see. */
const FP = G.FootPath = { via: null };
let fpT = 0, fpPath = null, fpGoal = null, fpFrom = null, fpAge = 0;
function solidAt(W, x, z, y) { for (const c of W.near(x, z)) { if (!c.on || c.npcOnly) continue; if (c.y1 - c.y0 < 0.9) continue; if (y !== undefined && (y > c.y1 - 0.3 || y + 1.6 < c.y0)) continue;
    if (c.t === 'c') { if (Math.hypot(x - c.x, z - c.z) < c.r + 0.3) return true; }
    else { const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca; if (Math.abs(lx) < c.hw + 0.3 && Math.abs(lz) < c.hd + 0.3) return true; } } return false; }
function clearLine(W, ax, az, bx, bz, y) { const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 0.5)); for (let i = 1; i < n; i++) { if (solidAt(W, ax + (bx - ax) * i / n, az + (bz - az) * i / n, y)) return false; } return true; }
function footSolve(W, P, tx, tz) { const cx = (P.x + tx) / 2, cz = (P.z + tz) / 2, half = Math.min(60, Math.max(20, Math.hypot(tx - P.x, tz - P.z) / 2 + 14)), N = Math.ceil(half * 2), x0 = cx - half, z0 = cz - half;
  const idx = (x, z) => { const i = Math.floor(x - x0), j = Math.floor(z - z0); return i < 0 || j < 0 || i >= N || j >= N ? -1 : j * N + i; };
  const s = idx(P.x, P.z); let g = idx(tx, tz); if (s < 0 || g < 0) return null;
  const n = N * N, blk = new Uint8Array(n), gs = new Float32Array(n).fill(1e9), from = new Int32Array(n).fill(-1), shut = new Uint8Array(n), heap = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) blk[j * N + i] = solidAt(W, x0 + i + 0.5, z0 + j + 0.5, P.y) ? 1 : 0;
  { /* the goal often stands among shelves or by a wall: aim at the nearest open cell around it */ const gi = g % N, gj = (g / N) | 0; let ok = false; for (let dj = -1; dj <= 1 && !ok; dj++) for (let di = -1; di <= 1; di++) { const q = (gj + dj) * N + gi + di; if (q >= 0 && q < n && !blk[q] && (di || dj)) { ok = true; break; } }
    if (!ok) { let bd = 1e9; for (let r = 1; r <= 4; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { const i2 = gi + di, j2 = gj + dj; if (i2 < 0 || j2 < 0 || i2 >= N || j2 >= N || blk[j2 * N + i2]) continue; const dd = di * di + dj * dj; if (dd < bd) { bd = dd; g = j2 * N + i2; } } } }
  blk[s] = 0; blk[g] = 0; const gx = g % N, gz = (g / N) | 0, hh = k => Math.hypot(k % N - gx, ((k / N) | 0) - gz);
  const push = (f, k) => { heap.push([f, k]); let c = heap.length - 1; while (c) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  gs[s] = 0; push(hh(s), s); let it = 0;
  while (heap.length && it++ < 40000) { const k = pop()[1]; if (shut[k]) continue; shut[k] = 1; if (k === g) break; const i = k % N, j = (k / N) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= N || nj >= N) continue; const q = nj * N + ni; if (blk[q] || shut[q]) continue;
      if (di && dj && (blk[j * N + ni] || blk[nj * N + i])) continue; const c = gs[k] + (di && dj ? 1.414 : 1); if (c < gs[q]) { gs[q] = c; from[q] = k; push(c + hh(q), q); } } }
  if (from[g] < 0) return null; const pts = []; for (let k = g; k >= 0; k = from[k]) pts.push([x0 + (k % N) + 0.5, z0 + ((k / N) | 0) + 0.5]); pts.reverse(); return pts; }
FP._t = { solidAt, clearLine, footSolve }; /* (for testing) */
FP.tick = function (dt) { fpT -= dt; if (fpT > 0) return; fpT = 0.5; FP.via = null; const W = Game.W(), P = Game.P, s = Game.S(), tg = Game.curTarget;
  if (!W || !tg || tg.x === undefined || Game.cineOn || P.ride || (s && s.q && s.q.riding) || P.swim) { fpPath = null; return; }
  const d = Math.hypot(tg.x - P.x, tg.z - P.z); if (d < 2.5 || d > 100) { fpPath = null; return; }
  if (clearLine(W, P.x, P.z, tg.x, tg.z, P.y)) { fpPath = null; return; }
  fpAge += 0.5; const moved = !fpGoal || Math.hypot(fpGoal[0] - tg.x, fpGoal[1] - tg.z) > 2 || !fpFrom || Math.hypot(fpFrom[0] - P.x, fpFrom[1] - P.z) > 6 || fpAge > 3;
  if (moved) { fpAge = 0; fpGoal = [tg.x, tg.z]; fpFrom = [P.x, P.z]; try { fpPath = footSolve(W, P, tg.x, tg.z); } catch (e) { fpPath = null; } }
  if (!fpPath) return; let best = null; for (let i = fpPath.length - 1; i > 0; i--) { const q = fpPath[i]; if (Math.hypot(q[0] - P.x, q[1] - P.z) < 1.2) break; if (clearLine(W, P.x, P.z, q[0], q[1], P.y)) { best = q; break; } }
  if (best) FP.via = { x: best[0], z: best[1] }; };
if (EPj) { const up1 = EPj.update; EPj.update = function (dt) { const r = up1 ? up1.apply(this, arguments) : undefined; if (Game.mode === 'play') try { FP.tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { } return r; }; }
})(window.G);
