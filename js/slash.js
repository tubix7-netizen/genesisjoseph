/* 약속의 길 — v18.58 무기 잔상 (slash.js)
   지팡이 · 몽둥이 · 칼 · 창을 휘두르면 무기가 지나간 자리에 빛나는 잔상이 남아요(칼 액션 게임의 검기처럼).
   · 무기 끝과 가운데가 지난 길을 따라 작은 빛 조각을 뿌리고, 0.3초쯤에 걸쳐 스러져요. 셋째 타(마무리)는 더 길고 붉어요.
   · 설정: G.Slash.on = false 로 끌 수 있어요. 무기 길이는 LEN, 빛깔은 COL. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, FX = G.FX; if (!Game || !EP || !FX) return;
const SL = G.Slash = { on: true, LEN: { staff: 0.95, club: 0.74, knife: 0.32, spear: 1.85 }, COL: [[1, 0.9, 0.5], [1, 0.82, 0.42], [1, 0.58, 0.24]] };
let prev = null;
const at = (m, y) => [m[4] * y + m[12], m[5] * y + m[13], m[6] * y + m[14]]; /* a point along the hand bone's Y axis in the world */
/* v18.60 every weapon model reaches out PAST THE FINGERS, along the hand's -Y (its +Y runs back up the forearm): the trail follows that end, the one that really cuts the air (it used to trace the back end, by the shoulder) */
function put(x, y, z, size, c, life, a) { if (FX.list.length >= FX.max - 40) return; FX.list.push({ x, y, z, vx: 0, vy: 0.12, vz: 0, life, t: 0, size, c, g: 0, a, drag: 0 }); }
function tick() { const P = Game.P, a = P.atk; if (!SL.on || !a || a.g.kind !== 'melee' || !P.rig || !P.rig.world || Game.cineOn) { prev = null; return; }
  const u = a.t / a.dur, fin = !!a.fin; if (u < (fin ? 0.3 : 0.2) || u > (fin ? 0.66 : 0.6)) { prev = null; return; }
  const m = P.rig.world[G.HBI.handR], L = SL.LEN[a.g.prop] || 0.7, tip = at(m, -L), mid = at(m, -L * 0.28);
  if (prev) { const d = Math.hypot(tip[0] - prev.tip[0], tip[1] - prev.tip[1], tip[2] - prev.tip[2]), n = Math.max(1, Math.min(16, Math.ceil(d / 0.06))), c = SL.COL[Math.min(2, a.combo | 0)], life = fin ? 0.42 : 0.3;
    for (let i = 1; i <= n; i++) { const s = i / n; for (let j = 0; j < 5; j++) { const e = j / 4, ax = prev.mid[0] + (prev.tip[0] - prev.mid[0]) * e, ay = prev.mid[1] + (prev.tip[1] - prev.mid[1]) * e, az = prev.mid[2] + (prev.tip[2] - prev.mid[2]) * e,
          bx = mid[0] + (tip[0] - mid[0]) * e, by = mid[1] + (tip[1] - mid[1]) * e, bz = mid[2] + (tip[2] - mid[2]) * e;
        put(ax + (bx - ax) * s, ay + (by - ay) * s, az + (bz - az) * s, (0.09 + 0.13 * e) * (fin ? 1.3 : 1), j === 4 ? [1, 1, 0.92] : c, life * (0.6 + 0.4 * e), 0.35 + 0.5 * e); } } }
  prev = { tip, mid }; }
const dyn0 = EP.dyn; EP.dyn = function () { if (dyn0) dyn0.apply(this, arguments); try { tick(); } catch (e) { prev = null; } };
})(window.G);
