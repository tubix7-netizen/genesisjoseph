/* 약속의 길 — v18.35 비가 건물 안으로 들어오지 않게 + 비가 오래 오면 웅덩이.
   · 지붕(W.roofs)과 비 가림 목록(G.Rain2.cover)을 카메라 가까운 순으로 8개 골라 빗줄기 셰이더에 넘깁니다.
   · 집 안 방, 동굴 안에서는 비를 아예 그리지 않아요.
   · 비가 약 1시간(게임 시각) 이어지면 웅덩이가 생겨 커지고, 비가 그치면 천천히 말라요. 저장: S.wx.pud */
'use strict';
(function (G) {
const Game = G.Game, R = G.R, clamp = G.clamp;
const R2 = G.Rain2 = { cover: [], pud: 0 };
const hash2 = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const roofs = new Float32Array(64); let roofT = 0, mesh = null, mk = '', mT = 0, built = 0;
R2.under = () => { const S = Game.S(); if (!S) return false; const f = S.flags || {}; return !!(f.inHouse || f.inCave || (G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside())); };
function pickRoofs(sc, W) { const cx = sc.cam[0], cz = sc.cam[2], L = [];
  for (const r of W.roofs) { if (r.on === false) continue; const d = Math.hypot(r.x - cx, r.z - cz) - Math.max(r.hw, r.hd); if (d < 36) L.push([d, r]); }
  for (const r of R2.cover) { const d = Math.hypot(r.x - cx, r.z - cz) - Math.max(r.hw, r.hd); if (d < 36) L.push([d, r]); }
  L.sort((a, b) => a[0] - b[0]); let n = 0; for (const [, r] of L) { if (n >= 8) break; const i = n * 8; roofs[i] = r.x; roofs[i + 1] = r.z; roofs[i + 2] = r.hw + 0.25; roofs[i + 3] = r.hd + 0.25; roofs[i + 4] = r.ca; roofs[i + 5] = r.sa; roofs[i + 6] = r.y + 0.1; roofs[i + 7] = 0; n++; }
  sc.rainRoofs = roofs; sc.rainRoofN = n; }
R2.addCover = (x, z, w, d, a, y) => { R2.cover.push({ x, z, hw: w / 2, hd: d / 2, ca: Math.cos(a || 0), sa: Math.sin(a || 0), y }); };
// 웅덩이: 6 m 칸마다 해시로 자리를 정하고, 평평하고 막힌 데 없고 지붕 없는 땅에만
function buildPuddles(W, px, pz, k) { const out = [], wl = W.water ? W.water.level : -99, c0x = Math.floor(px / 6), c0z = Math.floor(pz / 6), S = Game.S(), EP = Game.EP();
  const v = (x, y, z) => out.push(x, y, z, 0, 1, 0, 1, 1, 1, 0, 0);
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const cx = c0x + i, cz = c0z + j, r0 = hash2(cx, cz); if (r0 > 0.42) continue;
    const x = (cx + 0.15 + hash2(cz, cx) * 0.7) * 6, z = (cz + 0.15 + hash2(cx + 7, cz - 3) * 0.7) * 6; if (Math.hypot(x - px, z - pz) > 36) continue;
    const y = W.heightAt(x, z); if (y < wl + 0.25) continue; const rad = (0.4 + hash2(cx - 5, cz + 9) * 0.85) * k, h1 = W.heightAt(x + rad, z), h2 = W.heightAt(x - rad, z), h3 = W.heightAt(x, z + rad), h4 = W.heightAt(x, z - rad);
    const top = Math.max(h1, h2, h3, h4, y), low = Math.min(h1, h2, h3, h4, y); if (top - low > 0.16) continue; if (Game.solidAt && Game.solidAt(x, z, rad * 0.7)) continue; if (W.roofAt(x, z, y)) continue; if (EP.floor) { const f = EP.floor(x, z, S); if (f !== null && f !== undefined && f > y + 0.1) continue; }
    if (rad < 0.25) continue; const n = 20, yy = top + 0.022, pts = [], p1 = r0 * 40, p2 = r0 * 91, p3 = r0 * 17, sq = 0.8 + hash2(cx + 2, cz + 2) * 0.6; for (let a = 0; a < n; a++) { const an = a / n * Math.PI * 2, rr = rad * (1 + 0.24 * Math.sin(2 * an + p1) + 0.15 * Math.sin(3 * an + p2) + 0.07 * Math.sin(5 * an + p3)); pts.push([x + Math.cos(an) * rr * sq, z + Math.sin(an) * rr / sq]); }
    for (let a = 0; a < n; a++) { const p = pts[a], q = pts[(a + 1) % n]; v(x, yy, z); v(q[0], yy, q[1]); v(p[0], yy, p[1]); } }
  return out.length ? new Float32Array(out) : null; }
R2.frame = function (sc, dt) { const S = Game.S(), W = Game.W(), P = Game.P; if (!S || !W) return;
  if ((roofT -= dt) <= 0) { roofT = 0.35; if (sc.rain > 0.01) pickRoofs(sc, W); }
  if (Game.mode !== 'play' || !G.Weather) { sc.puddles = null; return; }
  const wx = S.wx || (S.wx = { k: 'clear', left: 3 }), rain = G.Weather.cur.rain, hrs = dt / 22 * ((Game.EP().timeScale) || 1); /* 게임 시각으로 셈 */
  wx.pud = wx.pud || 0; if (!G.UI.modal()) { if (rain > 0.3) { wx.rainH = (wx.rainH || 0) + hrs; if (wx.rainH > 0.8) wx.pud = Math.min(1, wx.pud + hrs / 1.6 * (0.5 + rain)); } else { wx.rainH = Math.max(0, (wx.rainH || 0) - hrs * 2); wx.pud = Math.max(0, wx.pud - hrs / 5); } }
  R2.pud = wx.pud; const off = R2.under() || (S.flags && (S.flags.byblos || S.flags.dream)) || Game.EP().noRain;
  if (wx.pud < 0.04 || off) { if (mesh) { R.free(mesh); mesh = null; mk = ''; } sc.puddles = null; return; }
  const key = Math.round(P.x / 5) + ':' + Math.round(P.z / 5) + ':' + Math.round(wx.pud * 12);
  if (key !== mk && (mT -= dt) <= 0) { mT = 0.5; mk = key; const d = buildPuddles(W, P.x, P.z, 0.35 + wx.pud * 0.65); if (mesh) { R.free(mesh); mesh = null; } if (d) mesh = R.mesh(d); }
  sc.puddles = mesh; };
})(window.G);
