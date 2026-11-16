/* 약속의 길 — v18.65 잠자리 준비 (bedtime.js · persona.js · nightlife.js가 불러 써요)
   밖(장막 · 모닥불 곁 · 종들의 숙소 · 캠프)에서 자는 사람은 더 이상 1초 만에 모포를 깔고 눕지 않아요. 요셉이 보고 있으면 이렇게 해요(9초쯤):
     ① 둘둘 만 모포를 집어 들고 → ② 탈탈 털고 → ③ 자리에 펼치고 → ④ 손으로 한 번 쓸어 고르고 → ⑤ 앉았다가 → ⑥ 천천히 누워요.
   보는 사람이 없으면(멀리 있으면) 그냥 잠들어요. 아침에 일어나면 다음 밤에 다시 처음부터 해요.
   요셉의 「눕기」도 먼저 앉았다가 천천히 누워요(acts.js · motion.js의 recline).
   API: G.Bed.ready(n, id, face) → true면 이제 잠들어요(그 전에는 준비 동작을 보여 줘요) · G.Bed.reset(n) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game) return;
const Bd = G.Bed = {};
/* [from (s), the pose, what the blanket is doing] */
const STEPS = Bd.STEPS = [[0, 'pick', 'roll'], [1.6, 'shakeMat', 'hands'], [3.8, 'gather', 'spread'], [5.6, 'smoothMat', 'flat'], [7.4, 'sitg', 'flat'], [9.2, null, 'flat']];
const now = () => performance.now() / 1000;
const seen = n => n.vis && n.near && Math.hypot(n.x - Game.P.x, n.z - Game.P.z) < 38;
Bd.ready = function (n, id, face) {
  if (!seen(n) && !(n._bed && n._bed.t0)) return true; /* nobody watching: just sleep */
  const b = n._bed || (n._bed = { t0: now(), f: face === undefined ? (n.homeFace === undefined ? n.face : n.homeFace) : face, x: n.x, z: n.z });
  const t = now() - b.t0; let i = 0; while (i < STEPS.length - 1 && t >= STEPS[i + 1][0]) i++;
  const st = STEPS[i]; b.mat = st[2]; b.p = st[2] === 'spread' ? Math.min(1, (t - st[0]) / (STEPS[i + 1][0] - st[0])) : 1;
  if (!st[1]) { b.done = true; return true; }
  if (n.act !== st[1]) { n.act = st[1]; n._ract = st[1]; } n.face = b.f; n.emote = null; return false; };
Bd.reset = n => { if (n) n._bed = null; };
/* the blanket while the bed is got ready: a roll at the feet, a folded cloth in both hands, then unrolled on the ground */
let flat = null, roll = null, held = null; const M1 = {};
function meshes() { if (flat) return; let g = new G.GB(31); g.box(0.85, 0.04, 2.1, { at: [0, 0.02, 0], c: 0xb89a62 }); g.box(0.86, 0.05, 0.95, { at: [0, 0.045, -0.5], c: 0x8a5a3a }); g.box(0.6, 0.08, 0.28, { at: [0, 0.07, 0.86], c: 0xd8c8a0 }); flat = G.R.mesh(g);
  g = new G.GB(32); g.cyl(0.13, 0.13, 0.86, 8, { at: [0, 0.13, 0], rz: Math.PI / 2, c: 0x8a5a3a }); g.cyl(0.135, 0.135, 0.3, 8, { at: [0.12, 0.13, 0], rz: Math.PI / 2, c: 0xb89a62 }); g.box(0.04, 0.27, 0.27, { at: [-0.3, 0.13, 0], c: 0x5a3a24 }); roll = G.R.mesh(g);
  g = new G.GB(33); g.box(0.86, 0.05, 0.62, { at: [0, 0, 0], c: 0x8a5a3a }); g.box(0.84, 0.05, 0.3, { at: [0, -0.04, 0.24], rx: 0.5, c: 0xb89a62 }); held = G.R.mesh(g); }
/* where the blanket lies: under the body, head toward the back (as the sleeping pose lies) */
Bd.OFF = 0; /* (the body lies with its head toward the back: the pillow end goes behind) */
if (EP) { const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); try { const ENT = Game.ENT, H = G.HBI, W = Game.W(); if (!ENT || !W) return;
    for (const id in ENT.npcs) { const n = ENT.npcs[id], b = n._bed; if (!b || b.done || n.sleep || !n.vis || !n.rig || !seen(n)) continue; meshes();
      const m = M1[id] || (M1[id] = G.m4()), a = b.f, sx = Math.sin(a), cz = Math.cos(a);
      if (b.mat === 'hands' && H && n.rig.world[H.handL] && n.rig.world[H.handR]) { const l = n.rig.world[H.handL], r = n.rig.world[H.handR], fl = Math.sin(now() * 15) * 0.12;
        G.m4trs(m, (l[12] + r[12]) / 2 + sx * 0.12, (l[13] + r[13]) / 2 - 0.05, (l[14] + r[14]) / 2 + cz * 0.12, a + Math.PI / 2, fl, 0, 1, 1, 1); list.push({ mesh: held, m }); continue; }
      if (b.mat === 'roll') { const x = n.x + sx * 0.55 + cz * 0.25, z = n.z + cz * 0.55 - sx * 0.25; G.m4trs(m, x, W.heightAt(x, z), z, a, 0, 0, 1, 1, 1); list.push({ mesh: roll, m }); continue; }
      const k = b.mat === 'spread' ? 0.12 + 0.88 * b.p : 1, x = n.x + sx * Bd.OFF, z = n.z + cz * Bd.OFF;
      G.m4trs(m, x + sx * 1.05 * (1 - k), W.heightAt(x, z), z + cz * 1.05 * (1 - k), a + Math.PI, 0, 0, 1, 1, k); list.push({ mesh: flat, m }); } } catch (e) { } }; }
})(window.G);
