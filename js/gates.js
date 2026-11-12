/* 약속의 길 — v18.35 울타리 문. 우리마다 여닫는 문이 있어요(A키). 사람이 지나가면 잠시 뒤 저절로 닫혀요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return; let mesh = null; const M = {};
const close = (g, p) => Math.hypot(g.x - p.x, g.z - p.z);
Game.CTX.push(function () { const p = Game.P; if (p.ride || p.swim || Game.cineOn) return null; for (const g of G.GATES || []) { const d = close(g, p); if (d < 2.3) return [{ d: d - 0.2, label: g.want ? '울타리 문 닫기' : '울타리 문 열기', x: g.x, z: g.z, y: 1.1, noMagnet: true, key: 'gate', use: () => { g.want = g.want ? 0 : 1; g.t = 0; Game.sfx && Game.sfx('door', { vol: 0.35, pitch: 1.5 }); } }]; } return null; });
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (Game.mode !== 'play') return; const p = Game.P, W = Game.W(); if (!mesh) { const g = new G.GB(181); for (const y of [0.35, 0.62, 0.88]) g.box(2.15, 0.09, 0.05, { at: [1.07, y, 0], c: 0x8a6a48 }); for (const x of [0.06, 1.07, 2.08]) g.box(0.09, 0.98, 0.07, { at: [x, 0.5, 0], c: 0x7a5a3a }); g.box(2.3, 0.08, 0.05, { at: [1.07, 0.6, 0], rz: 0.36, c: 0x7a5a3a }); mesh = G.R.mesh(g); }
  (G.GATES || []).forEach((g, i) => { if (close(g, p) > 70) return; g.open = (g.open || 0) + ((g.want ? 1.75 : 0) - (g.open || 0)) * 0.1; g.col.on = g.want ? false : g.open < 0.25; if (g.want && close(g, p) > 7) { g.t = (g.t || 0) + 1 / 60; if (g.t > 4) g.want = 0; } const m = M[i] || (M[i] = G.m4()), hx = g.x - Math.cos(g.a) * 1.1, hz = g.z + Math.sin(g.a) * 1.1; G.m4trs(m, hx, W.heightAt(g.x, g.z), hz, g.a + g.open, 0, 0, 1, 1, 1); list.push({ mesh, m, outline: true }); }); };
})(window.G);
