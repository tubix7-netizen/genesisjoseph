/* 약속의 길 — 동행 (v17.8, 엔진·연출 업그레이드 문서의 P7).
   People who walk with the hero (P.follow: family, a child, friends — Game.npcFollow) used to stand in one fixed spot behind him. Now:
   · SLOT  — each follower picks the best of eight spots around the hero every 0.45 s: close (2–3 m), on free ground, in line of sight, not in the
             doorway when the hero stops (he stands to the side), and — when a hostile beast is hunting — on the far side from it. A new spot must be
             clearly better than the old one (no dithering), and two followers never take the same spot.
   · WARP  — a follower who is lost behind a wall or far behind may appear at the hero's side only when he is NOT on the screen
             (Companion.canWarp); on the screen he keeps walking/running, and only after 7 s of being stuck does he warp anyway.
   · BARKS — now and then a follower says one short line (bubble) about the rain, nightfall, dawn, a beast nearby, the hero standing still for a while
             or being tired. At most one line per 40 s each (danger: 18 s), never during a talk or cutscene, never the same line twice within 20 lines.
   Counters for tests: G.Companion.stats. Off: ?companion=0. */
'use strict';
(function (G) {
const Game = G.Game, C = G.Companion = { on: !/[?&]companion=0\b/.test(location.search), stats: { slots: 0, warps: 0, warpsBlockedOnScreen: 0, barks: 0 }, log: [] };
const rnd = a => a[Math.floor(Math.random() * a.length)];

// ------------------------------------------------------------------ the spot to stand on
const CAND = [[2.5, 2.5], [2.5, -2.5], [2.2, 1.57], [2.2, -1.57], [3.2, 3.14], [3.0, 2.0], [3.0, -2.0], [2.6, 0.9]]; // [distance, angle from the hero's back (rad, + = to his left)]
function freeAt(W, x, z) { const q = { x, z }; W.collide(q, 0.32); return Math.hypot(q.x - x, q.z - z) < 0.06; }
C.slot = function (n, idx, dt) {
  const P = Game.P, W = Game.W(); if (!C.on || !W) return null; n.cs = n.cs || { t: 0, x: 0, z: 0, ok: false }; const cs = n.cs; cs.t -= dt;
  if (cs.ok && cs.t > 0) return [cs.x, cs.z]; cs.t = 0.45; C.stats.slots++;
  const f = P.face, bx = -Math.sin(f), bz = -Math.cos(f), still = P.spd < 0.4; let threat = null; if (G.Mood && G.Mood.near < 16 && G.Combat && G.Combat.wild) { let bd = 99; for (const a of G.Combat.wild()) { if (a.st === 'dead' || a.st === 'gone' || !a.near || !(a.angry || a.st === 'chase' || a.st === 'windup' || a.st === 'attack')) continue; const d = Math.hypot(a.x - P.x, a.z - P.z); if (d < bd) { bd = d; threat = a; } } }
  const taken = []; for (const o of P.follow) if (o !== n && o.cs && o.cs.ok) taken.push([o.cs.x, o.cs.z]);
  let best = null, bs = -1e9; const hy = P.y + 1.4;
  for (const [r, a] of CAND) { const ca = Math.cos(a), sa = Math.sin(a); // (rotate the "behind" vector by a)
    const px = P.x + (bx * ca - bz * sa) * r, pz = P.z + (bz * ca + bx * sa) * r; let s = -Math.abs(r - 2.8) * 0.5;
    s += freeAt(W, px, pz) ? 2 : -10; if (W.ray && W.ray(P.x, hy, P.z, px, W.heightAt(px, pz) + 1.4, pz) < 0.97) s -= 2; else s += 1;
    s -= 0.15 * Math.hypot(px - n.x, pz - n.z); if (cs.ok) s += Math.hypot(px - cs.x, pz - cs.z) < 0.6 ? 0.8 : 0; // a little stickiness
    if (still && Math.abs(Math.abs(a) - 1.57) < 0.4) s += 0.6; if (still && Math.abs(a) > 3) s -= 0.4; // standing: to the side, out of the doorway behind him
    if (threat) s += 1.2 * Math.max(-1, Math.min(1, (Math.hypot(px - threat.x, pz - threat.z) - Math.hypot(P.x - threat.x, P.z - threat.z)) / 3));
    for (const t of taken) if (Math.hypot(px - t[0], pz - t[1]) < 1.3) s -= 6; if (s > bs) { bs = s; best = [px, pz]; } }
  if (!best) return cs.ok ? [cs.x, cs.z] : null; if (cs.ok && Math.hypot(best[0] - cs.x, best[1] - cs.z) > 0.6) { const old = [cs.x, cs.z]; const oldScore = freeAt(W, old[0], old[1]) ? 1 : -8; if (bs < oldScore + 0.8 && Math.hypot(old[0] - P.x, old[1] - P.z) < 5) best = old; }
  cs.x = best[0]; cs.z = best[1]; cs.ok = true; return best;
};

// ------------------------------------------------------------------ warping only out of sight
C.canWarp = function (n) {
  if (!C.on) return true; const R = G.R, UI = G.UI; if (!R || !R.project || !UI) return true;
  const s = R.project(n.x, n.y + 1, n.z, UI.W, UI.H); if (!s) return true; const m = 30; // inside the screen (with a margin) and not far away = seen
  const seen = s[0] > -m && s[0] < UI.W + m && s[1] > -m && s[1] < UI.H + m && Math.hypot(n.x - Game.P.x, n.z - Game.P.z) < 60;
  if (seen && (n.fstuck || 0) < 7) { C.stats.warpsBlockedOnScreen++; return false; } C.stats.warps++; return true;
};

// ------------------------------------------------------------------ short lines
const LINES = {
  rain: ['비가 오려나 봐요.', '옷이 젖겠어요… 피할 데가 없을까요?', '하늘이 어두워지고 있어요.'],
  night: ['벌써 어두워졌네요.', '별이 참 많아요.', '밤길은 조심해야 해요.'],
  dawn: ['해가 떠요. 좋은 하루가 되겠어요.', '아침이에요. 공기가 맑아요.'],
  danger: ['조심해요! 저기 뭐가 있어요!', '뒤로 물러서요!', '가까이 오면 안 돼요!'],
  idle: ['여기서 잠깐 쉬어도 되겠어요.', '저 멀리 좀 보세요.', '길이 아직 멀었어요?', '바람이 시원해요.'],
  tired: ['힘들어 보여요. 잠깐 쉬었다 가요.', '숨이 차네요. 조금만 쉬어요.'],
  kid: ['와, 저것 좀 보세요!', '저기에 뭐가 있어요?', '다리가 아파요… 조금만요.']
};
function say(n, kind, cool) {
  if (!n.d || n.d.animal || !n.vis) return false; const t = performance.now() / 1000; n.cb = n.cb || { t: 0, mem: [] }; if (t < n.cb.t) return false;
  let full = LINES[kind].slice(); if (kind === 'idle' && n.d.look && n.d.look.kid) full = full.concat(LINES.kid); // (a child also says child things)
  let pool = full.filter(l => !n.cb.mem.includes(l)); if (!pool.length) { n.cb.mem = n.cb.mem.filter(l => !full.includes(l)); pool = full; } // every line of this kind has been said: start over (never the same line twice in a row)
  if (pool.length > 1 && n.cb.last) pool = pool.filter(l => l !== n.cb.last);
  const line = rnd(pool); n.cb.last = line; n.cb.mem.push(line); if (n.cb.mem.length > 20) n.cb.mem.shift(); n.cb.t = t + cool; C.stats.barks++; C.log.push([kind, n.id || n.name, line]); if (C.log.length > 60) C.log.shift();
  G.Life && G.Life.bubble(n, line); return true;
}
let prevRain = 0, prevHour = -1, idleT = 0;
C.update = function (dt) {
  if (!C.on || !Game.P.follow || !Game.P.follow.length) { idleT = 0; return; } const P = Game.P; if (Game.mode !== 'play' || Game.cineOn || (G.UI && G.UI.busy())) return;
  const who = P.follow.filter(n => !n.d.animal && n.vis && Math.hypot(n.x - P.x, n.z - P.z) < 14); if (!who.length) return;
  const hour = Game.hour(), rain = G.Weather && G.Weather.cur ? G.Weather.cur.rain || 0 : 0, pick = () => rnd(who);
  if (prevHour >= 0) { if (prevHour < 19.5 && hour >= 19.5) say(pick(), 'night', 40); else if (prevHour < 5.6 && hour >= 5.6 && hour < 8) say(pick(), 'dawn', 40); } prevHour = hour;
  if (rain > 0.3 && prevRain <= 0.3) say(pick(), 'rain', 40); prevRain = rain;
  if (G.Mood && G.Mood.near < 14 && G.Mood.fear > 0.3) say(pick(), 'danger', 18);
  else if (P.spd < 0.3 && !P.act && !(G.Combat && G.Combat.inCombat)) { idleT += dt; if (idleT > 9) { idleT = 0; if (P.stam !== undefined && P.stam < 35) say(pick(), 'tired', 40); else say(pick(), 'idle', 40); } } else idleT = 0;
};
})(window.G);
