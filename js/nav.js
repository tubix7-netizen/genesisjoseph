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
let grid = null, N = 0, half = 0, path = null, goal = null, lastT = 0, worldRef = null;
/* the fixed part of what blocks a wagon (built once per world): houses and rocks, towns, steep ground */
function build() { const W = Game.W(); if (!W) return false; worldRef = W; half = W.half; N = Math.ceil(W.size / CELL); grid = new Uint8Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = -half + (i + 0.5) * CELL, z = -half + (j + 0.5) * CELL; let b = 0;
    if (W.slopeAt(x, z) > 0.5) b = 1; else if (G.Cart && G.Cart.town && G.Cart.town(x, z)) b = 1; else if (Game.solidAt(x, z, 1.1)) b = 1; grid[j * N + i] = b; } return true; }
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
function solve(tx, tz) { const W = Game.W(), P = Game.P; if (!W) return null; if (!grid || worldRef !== W) build(); const s = nearestOpen(W, ...cellOf(P.x, P.z)), g = nearestOpen(W, ...cellOf(tx, tz)); if (!s || !g) return null;
  const ks = astar(W, s, g); if (!ks) return null; const pts = ks.map(k => ctr(k % N, (k / N) | 0)); pts[0] = [P.x, P.z]; return smooth(W, pts); }
const target = () => { const s = Game.S(), j = s && s.q && s.q.dlJob; if (j && j.go && G.Errands && G.Errands.drop) { const d = G.Errands.drop(j.v); if (d) return { x: d[0], z: d[1] }; } /* a delivery: the whole road to the flag, fords and all */
  const t = Game.curTarget; return t && t.x !== undefined ? t : null; };
Nv.path = () => path;
Nv.on = () => { const s = Game.S(); return !!(s && s.q && s.q.riding && s.q.chariotOk); };
function offPath(P) { if (!path || path.length < 2) return true; let bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((P.x - ax) * dx + (P.z - az) * dz) / L)); bd = Math.min(bd, Math.hypot(P.x - ax - dx * t, P.z - az - dz * t)); } return bd > 10; }
/* trim the part already driven */
function trim(P) { if (!path) return; while (path.length > 2 && Math.hypot(path[1][0] - P.x, path[1][1] - P.z) < CELL * 1.5) path.splice(1, 1); path[0] = [P.x, P.z]; }
Nv.tick = function (dt) { const P = Game.P, tg = target(); if (!Nv.on() || !tg || Game.cineOn || (G.Cave && G.Cave.inside && G.Cave.inside()) || (G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) { path = null; goal = null; return; }
  const now = performance.now(); const moved = !goal || Math.hypot(goal[0] - tg.x, goal[1] - tg.z) > 4;
  if (moved || (now - lastT > 4000 && offPath(P))) { lastT = now; goal = [tg.x, tg.z]; try { path = solve(tg.x, tg.z); } catch (e) { console.error('nav', e); path = null; } }
  else trim(P); };
Nv.reset = () => { grid = null; path = null; goal = null; };
/* draw on a 2D map: toS(x, z) → [sx, sy] */
Nv.draw = function (c, toS, w) { if (!path || path.length < 2) return false; c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  for (const [col, lw] of [['rgba(40,24,6,.85)', (w || 4) + 3], ['#ffd24a', w || 4]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); path.forEach((p, i) => { const [x, y] = toS(p[0], p[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); }
  c.restore(); return true; };
const EPj = G.EP && G.EP.joseph; if (EPj) { const up0 = EPj.update; EPj.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode === 'play') Nv.tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); return r; };
  const ol0 = EPj.onLoad; EPj.onLoad = function () { Nv.reset(); return ol0 ? ol0.apply(this, arguments) : undefined; }; }
})(window.G);
