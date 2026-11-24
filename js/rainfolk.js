/* 약속의 길 — v18.92 비 올 때 마을 사람들도 비를 피해요 (rainfolk.js · cellq.js 다음)
   비가 오면(G.Weather.rainy) 요셉 가까이(60 m) 있는 마을 사람이 가장 가까운 비 가림으로 종종걸음으로 가서 비를 그어요.
   · 비 가림: 나무 갓 밑(W.canopies, 한 그루에 넷까지 둘레에 나눠 서기) · 노점 · 처마 차양(W.covers) · 걸어 들어가는 지붕(W.roofs)
   · 일과(life.js schedules)는 n._rain이 있는 사람을 건너뛰어요. 비가 그치거나 요셉이 멀어지면 n._rain을 지우고 일과를 다시 짜요(schedSlot = -1).
   · 옮기지 않는 사람: 성경 인물(G.Quiet.is) · 함께 걷거나 말하는 중 · 집 안(schedHidden) · 이미 무언가 밑에 있는 사람 · 부탁이 붙잡아 둔 사람(schedHeld) · 잠깐 세운 사람(dyn) · 짐승 · 꿈 · 장면 중 */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const S = () => Game.S(), P = () => Game.P;
const LINES = ['비 온다! 저 나무 밑으로!', '아이고, 옷 다 젖겠네!', '잠깐 비 좀 긋고 가세.', '차양 밑으로 와요, 얼른!', '이 비가 밭에는 단비지.', '하늘이 열렸네!'];
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shelteredAt = (W, x, z, y) => { if (W.roofAt && W.roofAt(x, z, y)) return true; if (W.coverAt && W.coverAt(x, z, y)) return true;
  for (const c of W.canopies || []) { if (Math.abs(c.x - x) > c.r || Math.abs(c.z - z) > c.r) continue; if (Math.hypot(c.x - x, c.z - z) < c.r * 0.75 && y + 1.6 < c.y1 && y + 1.6 > c.y0 - 9) return true; } return false; };
/* the nearest free shelter spot within 30 m of (x, z) */
const USED = new Map();
function spotFor(W, n) { let best = null, bd = 30;
  const tryPt = (key, cx, cz, cap, ring) => { const used = USED.get(key) || 0; if (used >= cap) return; const a = used * 1.9 + (key.length % 5), sx = cx + Math.cos(a) * ring, sz = cz + Math.sin(a) * ring, d = Math.hypot(sx - n.x, sz - n.z);
    if (d < bd && !(Game.solidAt && Game.solidAt(sx, sz, 0.35)) && !(W.water && W.heightAt(sx, sz) < W.water.level + 0.1)) { bd = d; best = { key, x: sx, z: sz, fx: cx, fz: cz }; } };
  for (const c of W.canopies || []) { if (Math.abs(c.x - n.x) > 31 || Math.abs(c.z - n.z) > 31) continue; if (c.y0 - W.heightAt(c.x, c.z) > 9) continue; tryPt('t' + c.x.toFixed(1) + ',' + c.z.toFixed(1), c.x, c.z, 4, Math.max(1.1, c.r * 0.45)); }
  for (const c of W.covers || []) { if (Math.abs(c.x - n.x) > 31 || Math.abs(c.z - n.z) > 31) continue; tryPt('c' + c.x.toFixed(1) + ',' + c.z.toFixed(1), c.x, c.z, 2, 0.5); }
  for (const r of W.roofs || []) { if (r.on === false || r.k === 'cave' || !/portico|pavilion/.test(r.k || '')) continue; if (Math.abs(r.x - n.x) > 31 || Math.abs(r.z - n.z) > 31) continue; tryPt('r' + r.x.toFixed(1) + ',' + r.z.toFixed(1), r.x, r.z, 6, Math.min(r.hw, r.hd) * 0.5); }
  return best; }
function release(n) { if (!n || !n._rain) return; n._rain = null; n.schedSlot = -1; n.act = null; }
let T = 0, was = false, talkT = 0;
function tick() { const s = S(), W = Game.W(), p = P(); if (!s || !W || Game.mode !== 'play') return;
  const ENT = Game.ENT, raining = !!(G.Weather && G.Weather.rainy && G.Weather.rainy()) && !(G.DW && G.DW.on && G.DW.on()) && !(s.flags && (s.flags.cave || s.flags.inHouse));
  if (!raining) { if (was) { for (const id in ENT.npcs) release(ENT.npcs[id]); USED.clear(); } was = false; return; }
  was = true;
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n) continue; const d = Math.hypot(n.x - p.x, n.z - p.z);
    if (n._rain) { if (d > 80 || n.follow || n.talking || !n.vis) { release(n); continue; } /* arrived: face out from the trunk, stand still */ if (!n.walk && Math.hypot(n.x - n._rain.x, n.z - n._rain.z) < 0.8) n.face = Math.atan2(n.x - n._rain.fx, n.z - n._rain.fz); continue; }
    if (d > 60 || !n.vis || !n.d || !n.d.sched || n.d.animal || n.dyn || n.follow || n.talking || n._chat || n.schedHidden || n.schedHeld || n.sleeping || n.sit && n.d.noTalk) continue;
    if (G.Quiet && G.Quiet.is && G.Quiet.is(n)) continue; /* (the people of the Bible stay where the story wants them) */
    if (shelteredAt(W, n.x, n.z, n.y)) continue;
    const sp = spotFor(W, n); if (!sp) continue; USED.set(sp.key, (USED.get(sp.key) || 0) + 1);
    n._rain = sp; n.sit = false; n.act = null; n.wander = null; Game.npcWalk(id, sp.x, sp.z, null, 2.6);
    if (G.Life && G.Life.bubble && (talkT -= 1) <= 0 && d < 25) { talkT = 3; G.Life.bubble(id, rnd(LINES), 2.4); } } }
const st0 = Game.start; Game.start = function () { USED.clear(); was = false; return st0.apply(this, arguments); };
/* hooked on the episode update chain at load (EP.update exists per episode) */
for (const k in G.EP || {}) { const EP = G.EP[k]; if (!EP || EP._rainfolk) continue; EP._rainfolk = 1; const up0 = EP.update; EP.update = function () { const r = up0 ? up0.apply(this, arguments) : undefined; try { if ((T -= 1 / 60) <= 0) { T = 0.9; tick(); } } catch (e) { console.error('rainfolk', e); } return r; }; }
G.RainFolk = { tick, release, USED };
})(window.G);
