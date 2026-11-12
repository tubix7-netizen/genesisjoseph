/* 약속의 길 — v18.38 길 안내: 목표가 벽 건너편이면 화살표가 먼저 문을 가리켜요.
   방·담장마다 문을 적어 두고, 요셉이 있는 곳과 목표가 있는 곳이 다르면 그 사이의 문으로 안내해요. */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || !Game.target) return;
/* x0, x1, z0, z1, doors (a point just outside each door); bigger compounds first */
const R = [
  [-50, -6, 26, 70, [[-28, 71.4], [-4.8, 52]]],
  [-13.5, -7.5, 40.5, 49.5, [[-10.4, 50.8]]],
  [-24.6, -15, 37.6, 46.6, [[-25.8, 42.3]]],
  [-41, -36.6, 37.6, 46.6, [[-35.4, 42.5]]],
  [-36.6, -24.6, 27, 32.5, [[-30.55, 33.8]]],
  [-17, -8, 60.5, 68.5, [[-18, 64.5]]],
  [-45, -15, -10, 14, [[-30, 15.6]]],
  [-54, -6, -212, -142, [[-30, -140]]],
  [-54, -6, -190, -182, [[-46, -180.6], [-14, -180.6]]],
  [-54, -38, -212, -190, [[-46, -188.8]]],
  [-38, -22, -212, -190, [[-30, -188.8]]],
  [-22, -6, -212, -190, [[-14, -188.8]]],
];
/* v18.39 people walk ON tiles and rugs: the ground under them counts as that much higher (feet used to sink in) */
const EPJ = G.EP && G.EP.joseph, TILE = [[-41, -15, 37.2, 46.6], [-36.9, -24.3, 27.2, 37.2], [-13.5, -7.5, 40.5, 49.5], [-17, -8, 60.5, 68.5], [-30.5, -27.5, 47, 70], [-44.5, -15.5, -5, 10], [-31.5, -28.5, 10, 14], [-54, -6, -212, -182]];
const RUG = [[-34.1, -26.7, 35.7, 42.1], [-37, -34.6, 40.8, 44], [-33.1, -28.1, 30.1, 31.7], [-51.5, -40.5, -204.5, -199.5], [-33.5, -26.5, -205.5, -200.5], [-17, -11, -203.5, -196.5]];
if (EPJ) { const fl0 = EPJ.floor; EPJ.floor = function (x, z, s) { const f = fl0 ? fl0.apply(this, arguments) : null; if (f !== null && f !== undefined) return f; for (const q of RUG) if (x > q[0] && x < q[1] && z > q[2] && z < q[3]) return Game.W().heightAt(x, z) + 0.09; for (const q of TILE) if (x > q[0] && x < q[1] && z > q[2] && z < q[3]) return Game.W().heightAt(x, z) + 0.06; return null; }; }
const has = (r, x, z) => x > r[0] && x < r[1] && z > r[2] && z < r[3];
const near = (r, x, z) => { let b = r[4][0], bd = 1e9; for (const d of r[4]) { const k = Math.hypot(d[0] - x, d[1] - z); if (k < bd) { bd = k; b = d; } } return b; };
/* 받침에 맞는 조사: 「말이(가)」 → 「말이」, 「수레이(가)」 → 「수레가」 */
const JS = { '이(가)': ['이', '가'], '을(를)': ['을', '를'], '은(는)': ['은', '는'], '과(와)': ['과', '와'], '와(과)': ['과', '와'], '으로(로)': ['으로', '로'] };
const josa = t => typeof t !== 'string' ? t : t.replace(/([가-힣])(이\(가\)|을\(를\)|은\(는\)|과\(와\)|와\(과\)|으로\(로\))/g, (m, c, j) => { const b = (c.charCodeAt(0) - 0xac00) % 28; return c + JS[j][j === '으로(로)' ? (b === 0 || b === 8 ? 1 : 0) : (b ? 0 : 1)]; });
const UI = G.UI; UI.josa = josa; { const to = UI.toast, po = UI.pop, sa = UI.say; UI.toast = function (t, ...a) { return to.call(this, josa(t), ...a); }; if (po) UI.pop = function (t, s, ...a) { return po.call(this, josa(t), josa(s), ...a); }; UI.say = function (L, ...a) { return sa.call(this, Array.isArray(L) ? L.map(l => l && l.t ? Object.assign({}, l, { t: josa(l.t) }) : l) : L, ...a); }; }
{ const css = document.createElement('style'); css.textContent = '#clock{white-space:nowrap}'; document.head.appendChild(css); }
const t0 = Game.target; Game.target = function () { const t = t0.apply(this, arguments), p = Game.P, s = Game.S(); if (!t || t.wp || p.ride || p.x > 1500 || (s.q && s.q.riding) || (G.Homes && G.Homes.inside()) || (G.Caves && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside())) return t;
  let way = null; for (let i = R.length - 1; i >= 0 && !way; i--) if (has(R[i], p.x, p.z) && !has(R[i], t.x, t.z)) way = near(R[i], t.x, t.z);
  let inR = null; if (!way) for (const r of R) if (has(r, t.x, t.z) && !has(r, p.x, p.z)) { way = near(r, p.x, p.z); inR = r; break; }
  if (!way) return t;
  if (Math.hypot(way[0] - p.x, way[1] - p.z) < 1.8) { if (!inR) return t; /* v18.42 at the door but still outside: one step through it first (the arrow used to swing straight through the wall) */
    const ix = Math.max(inR[0] + 1.2, Math.min(inR[1] - 1.2, way[0])), iz = Math.max(inR[2] + 1.2, Math.min(inR[3] - 1.2, way[1])); return Math.hypot(ix - p.x, iz - p.z) > 1.0 ? Object.assign({}, t, { x: ix, z: iz, via: true }) : t; }
  return Object.assign({}, t, { x: way[0], z: way[1], via: true }); };
})(window.G);
