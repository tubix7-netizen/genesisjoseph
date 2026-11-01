/* 약속의 길 — 목표 쪽 돌아보기 (v16.6): with the light pillar gone, when a new objective arrives the camera turns once toward
   where it is (about 1.5 s), holds a moment, and gives control back. Moving the right stick or dragging cancels it. */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI;
const Q = G.QCam = { pend: null, run: null };
const go0 = Game.go; Game.go = function (id, resume) { const r = go0.apply(this, arguments); if (!resume) Q.pend = { step: id, t: 0 }; return r; };
if (G.Life && G.Life.accept) { const acc0 = G.Life.accept; G.Life.accept = function () { const r = acc0.apply(this, arguments); Q.pend = { step: Game.S().step, t: 0, side: true }; return r; }; }
Q.update = function (dt) { const S = Game.S(), P = Game.P, CAM = Game.CAM, IN = Game.INPUT; if (!S || Game.mode !== 'play') return;
  const quiet = !(G.Cine && G.Cine.on) && !G.UI.busy() && !Game.cineOn;
  if (Q.pend && quiet) { Q.pend.t += dt; if (Q.pend.t > 0.6) { const tg = Game.target && Game.target(); Q.pend = null;
      if (tg && Math.hypot(tg.x - P.x, tg.z - P.z) > 6) { Q.run = { yaw0: CAM.yaw, want: Math.atan2(-(tg.x - P.x), -(tg.z - P.z)), t: 0 }; } } }
  const R = Q.run; if (!R) return; if (!quiet || Math.hypot(IN.cx || 0, IN.cy || 0) > 0.25) { Q.run = null; return; }
  R.t += dt; let df = R.want - R.yaw0; while (df > PI) df -= 2 * PI; while (df < -PI) df += 2 * PI;
  const k = R.t < 1.1 ? (1 - Math.cos(Math.min(1, R.t / 1.1) * PI)) / 2 : 1; CAM.yaw = R.yaw0 + df * k; if (R.t > 1.9) Q.run = null; };
})(window.G);
