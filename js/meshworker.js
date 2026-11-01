/* 약속의 길 — mesh worker (v17.2 P12 사람 메시 · v17.3 P13 정적 덩어리 구역 정렬, 엔진·연출 업그레이드 문서).
   A detailed person (LOD 0/1) takes tens of milliseconds to build (a whole face is computed), which froze the game for several frames
   each time someone came close. This worker builds it off the main thread: game.js sends { key, look, lod }, gets back the welded
   vertex/index arrays (transferred, not copied) and only uploads them to the GPU. It loads the same core.js / models.js, so the result
   is identical to building on the main thread. If workers are unavailable (file://, old browsers) game.js builds on the main thread as before. */
'use strict';
self.window = self;
// v17.3 P13: sort a static chunk's triangles (33 floats each) into C-metre cells; returns the reordered buffer and each cell's range + bounding sphere
function cellSort(d, C) {
  const nTri = Math.floor(d.length / 33), cx = new Float32Array(nTri), cz = new Float32Array(nTri); let ox = 1e9, oz = 1e9, mx = -1e9, mz = -1e9;
  for (let t = 0, b = 0; t < nTri; t++, b += 33) { const x = (d[b] + d[b + 11] + d[b + 22]) / 3, z = (d[b + 2] + d[b + 13] + d[b + 24]) / 3; cx[t] = x; cz[t] = z; if (x < ox) ox = x; if (x > mx) mx = x; if (z < oz) oz = z; if (z > mz) mz = z; }
  const GX = Math.floor((mx - ox) / C) + 1, GZ = Math.floor((mz - oz) / C) + 1, K = GX * GZ; if (K > 4096) return null;
  const cid = new Uint16Array(nTri), cnt = new Uint32Array(K + 1); // bucket sort: count, then place (the original order stays inside a cell)
  for (let t = 0; t < nTri; t++) { // (the centroids are stored as 32-bit floats, so clamp: a rounded value on the edge must not fall outside the grid and lose its triangle)
    const gx = Math.max(0, Math.min(GX - 1, Math.floor((cx[t] - ox) / C))), gz = Math.max(0, Math.min(GZ - 1, Math.floor((cz[t] - oz) / C))), k = gz * GX + gx; cid[t] = k; cnt[k + 1]++; }
  for (let k = 0; k < K; k++) cnt[k + 1] += cnt[k];
  const pos = cnt.slice(0, K), out = new Float32Array(d.length), bb = new Float64Array(K * 6); for (let k = 0; k < K; k++) { const q = k * 6; bb[q] = bb[q + 1] = bb[q + 2] = 1e9; bb[q + 3] = bb[q + 4] = bb[q + 5] = -1e9; }
  for (let t = 0, b = 0; t < nTri; t++, b += 33) {
    const k = cid[t], q = pos[k]++ * 33, w = k * 6; for (let m = 0; m < 33; m++) out[q + m] = d[b + m];
    for (let v = 0; v < 33; v += 11) { const x = d[b + v], y = d[b + v + 1], z = d[b + v + 2]; if (x < bb[w]) bb[w] = x; if (x > bb[w + 3]) bb[w + 3] = x; if (y < bb[w + 1]) bb[w + 1] = y; if (y > bb[w + 4]) bb[w + 4] = y; if (z < bb[w + 2]) bb[w + 2] = z; if (z > bb[w + 5]) bb[w + 5] = z; }
  }
  const cells = []; for (let k = 0; k < K; k++) { const n = cnt[k + 1] - cnt[k]; if (!n) continue; const w = k * 6, x = (bb[w] + bb[w + 3]) / 2, y = (bb[w + 1] + bb[w + 4]) / 2, z = (bb[w + 2] + bb[w + 5]) / 2;
    cells.push({ first: cnt[k] * 3, count: n * 3, bs: [x, y, z, Math.hypot(bb[w + 3] - x, bb[w + 4] - y, bb[w + 5] - z) + 0.05] }); }
  return { out, cells };
}
self.onmessage = e => {
  const m = e.data;
  try {
    if (m.cell) { const r = cellSort(m.data, m.C); if (r) self.postMessage({ cell: m.cell, out: r.out, cells: r.cells }, [r.out.buffer]); else self.postMessage({ cell: m.cell }); return; }
    if (m.init) { importScripts(m.core, m.models); self.postMessage({ ready: 1 }); return; }
    const G = self.G, gb = G.humanoid(m.look, m.lod), w = G.weld(new Float32Array(gb.d));
    self.postMessage({ key: m.key, verts: w.verts, ind: w.ind, big: w.big, uniq: w.uniq, count: w.count, bs: gb.bounds() }, [w.verts.buffer, w.ind.buffer]);
  } catch (err) { self.postMessage({ key: m.key, err: String((err && err.message) || err) }); }
};
