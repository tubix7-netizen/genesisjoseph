/* 약속의 길 — climbing (BotW-style) and ladders.
   · Walk into a wall, a house front or a big block (box colliders 1.1–7 m tall) and keep pushing: Joseph grabs it and
     climbs. Stick up/down/left/right moves on the face; stamina drains while he climbs (slowly while he just hangs) and
     when it runs out he lets go. Jump while climbing is a quick lunge upward for a chunk of stamina. At the top he hauls
     himself over and stands on it — flat roofs and wall tops are walkable (W.topAt).
   · Ladders (W.addLadder): press A at the foot, climb without tiring, step off at the top.
   · Not while riding, carrying, swimming, in a cutscene, or where the episode says no (EP.noClimb(x, z, S)). */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp, lerp = G.lerp, PI = Math.PI;
const Cl = G.Climb = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);

// world support: walkable tops of boxes and roofs
G.climbTopAt = function (W, x, z, y) { // highest walkable top under the feet (within a step), or -Infinity
  let best = -Infinity;
  for (const c of W.near(x, z)) { if (!c.on || c.t !== 'b' || c.noTop) continue; if (c.y1 > y + 0.45 || c.y1 < y - 1.2) continue; if (Math.min(c.hw, c.hd) < 0.22) continue;
    const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca; if (Math.abs(lx) <= c.hw && Math.abs(lz) <= c.hd && c.y1 > best) best = c.y1; }
  for (const r of W.roofs || []) { const top = r.y + 0.28; if (top > y + 0.45 || top < y - 1.2) continue; const dx = x - r.x, dz = z - r.z, lx = dx * r.ca - dz * r.sa, lz = dx * r.sa + dz * r.ca; if (Math.abs(lx) <= r.hw + 0.2 && Math.abs(lz) <= r.hd + 0.2 && top > best) best = top; }
  return best;
};
function climbable(c) { return c && c.on && c.t === 'b' && !c.noClimb && (c.y1 - c.y0) >= 1.1 && (c.y1 - c.y0) <= 7.5; }
function faceOf(c, x, z) { // local coords on the box and the outward normal of the face the point is against
  const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca;
  const ox = Math.abs(lx) - c.hw, oz = Math.abs(lz) - c.hd; let nlx = 0, nlz = 0; if (ox > oz) nlx = Math.sign(lx) || 1; else nlz = Math.sign(lz) || 1;
  return { lx, lz, nlx, nlz, nx: nlx * c.ca + nlz * c.sa, nz: -nlx * c.sa + nlz * c.ca };
}
const toWorld = (c, lx, lz) => [c.x + lx * c.ca + lz * c.sa, c.z - lx * c.sa + lz * c.ca];

// ------------------------------------------------------------------ start
Cl.tryGrab = function (P, dt, mag, dx, dz) { // called after movement: pushing into a climbable wall for a moment grabs it
  const S = Game.S(), W = Game.W(), EP = Game.EP(); const c = P.hit;
  if (!climbable(c) || mag < 0.6 || P.ride || P.carry || P.swim || P.act || P.atk || P.downed || Game.cineOn || P.climbCool > 0 || (EP.noClimb && EP.noClimb(P.x, P.z, S))) { P.grabT = 0; return; }
  if (P.y > c.y1 - 0.5) { P.grabT = 0; return; } // already up there
  const f = faceOf(c, P.x, P.z); if (dx * f.nx + dz * f.nz > -0.55) { P.grabT = 0; return; } // must push into the face
  if (P.stam < 8) { if (!P.tipTired) { P.tipTired = 1; G.UI.toast('기력이 모자라 오를 수 없어요'); } return; }
  P.grabT = (P.grabT || 0) + dt; if (P.grabT < (P.grounded ? 0.28 : 0.05)) return;
  Cl.start(P, c, f);
};
Cl.start = function (P, c, f, ladder) {
  const fc = f || faceOf(c, P.x, P.z);
  P.climb = { c, nlx: fc.nlx, nlz: fc.nlz, nx: fc.nx, nz: fc.nz, ladder: !!ladder, t: 0, ph: 0, mantle: 0 };
  P.vx = P.vz = P.vy = 0; P.grounded = false; P.sprint = false; P.crouch = false; P.grabT = 0; P.face = Math.atan2(-fc.nx, -fc.nz); snap(P); sfx('rustle', { vol: 0.6 });
  if (!Game.S().flags.tipClimb) { Game.S().flags.tipClimb = 1; G.UI.toast(ladder ? '사다리 · 위아래로 움직여요' : '벽 타기 · 스틱으로 오르내려요 · 점프로 훌쩍 · 기력이 다하면 떨어져요'); }
};
function snap(P) { // keep the hero on the face, 0.36 m off it, inside its width
  const k = P.climb, c = k.c; if (k.ladder) { P.x = k.lx; P.z = k.lz; return; }
  const f = faceOf(c, P.x, P.z); let lx = f.lx, lz = f.lz;
  if (k.nlx) { lx = k.nlx * (c.hw + 0.36); lz = clamp(lz, -c.hd + 0.25, c.hd - 0.25); } else { lz = k.nlz * (c.hd + 0.36); lx = clamp(lx, -c.hw + 0.25, c.hw - 0.25); }
  const w = toWorld(c, lx, lz); P.x = w[0]; P.z = w[1];
}
Cl.ladderAt = function (x, z) { const W = Game.W(); for (const l of W.ladders || []) if (Math.hypot(l.x - x, l.z - z) < 1.3) return l; return null; };
Cl.useLadder = function (l) { const P = Game.P, W = Game.W(); const top = l.y0 + l.h, onTop = P.y > top - 0.6;
  const c = { x: l.x, z: l.z, y0: l.y0, y1: top, t: 'b', hw: 0.4, hd: 0.1, ca: Math.cos(l.a), sa: Math.sin(l.a), on: true };
  P.climb = { c, ladder: true, nx: Math.sin(l.a), nz: Math.cos(l.a), lx: l.x + Math.sin(l.a) * 0.42, lz: l.z + Math.cos(l.a) * 0.42, t: 0, ph: 0, mantle: 0 };
  P.face = l.a + PI; P.x = P.climb.lx; P.z = P.climb.lz; P.vx = P.vz = P.vy = 0; P.grounded = false; if (onTop) P.y = top - 1.5; sfx('step', { surf: 'wood' }); };
// interaction: ladders are used with A
Game.CTX.push(function (S, G2) { const P = Game.P, W = Game.W(); if (!W || P.climb || P.ride) return null; const out = [];
  for (const l of W.ladders || []) { const d = Math.hypot(l.x - P.x, l.z - P.z); const top = l.y0 + l.h; if (d < 1.8 && Math.abs(P.y - l.y0) < 1) out.push({ d: d - 0.3, label: '사다리 오르기', x: l.x, z: l.z, y: 1.2, use: () => Cl.useLadder(l), key: 'ladder', noMagnet: true });
    else if (Math.abs(P.y - top) < 0.8) { const tx = l.x - Math.sin(l.a) * 0.6, tz = l.z - Math.cos(l.a) * 0.6; const dd = Math.hypot(tx - P.x, tz - P.z); if (dd < 1.6) out.push({ d: dd - 0.3, label: '사다리 내려가기', x: tx, z: tz, y: 0.6, use: () => Cl.useLadder(l), key: 'ladderDown', noMagnet: true }); } }
  return out; });

// ------------------------------------------------------------------ per frame while climbing (replaces walking)
Cl.update = function (dt) {
  const P = Game.P, k = P.climb, c = k.c, IN = Game.INPUT, W = Game.W(), V = G.Vitals; k.t += dt;
  if (Game.cineOn || P.downed) { Cl.release(P, 0); return; }
  if (k.mantle > 0) { // hauling over the top
    k.mantle += dt / 0.5; const e = clamp(k.mantle, 0, 1), ee = e * e * (3 - 2 * e); P.y = lerp(k.m0[1], k.m1[1], Math.min(1, ee * 1.6)); P.x = lerp(k.m0[0], k.m1[0], ee); P.z = lerp(k.m0[2], k.m1[2], ee);
    if (k.mantle >= 1) { P.climb = null; P.grounded = true; P.vy = 0; P.climbCool = 0.4; P.onTop = true; } return; }
  let up = -(IN.my + ((IN.keys.KeyS ? 1 : 0) - (IN.keys.KeyW ? 1 : 0))), side = IN.mx + ((IN.keys.KeyD ? 1 : 0) - (IN.keys.KeyA ? 1 : 0));
  if (Math.abs(up) < 0.2) up = 0; if (Math.abs(side) < 0.25 || k.ladder) side = 0; up = clamp(up, -1, 1); side = clamp(side, -1, 1);
  const tired = P.stam < 1, moving = up || side;
  if (!k.ladder && V) { V.spend((moving ? 11 : 2.6) * dt); P.stamT = 0; } else if (k.ladder) { if (V && moving) V.spend(3 * dt); P.stamT = 0; } // v16.6: climbing costs more breath
  if (!k.ladder && P.stam <= 0) { G.UI.toast('기력이 다해 손을 놓쳤어요!'); Cl.release(P, 1.5); return; }
  // let go: jump while pulling away from the wall
  if (P.jumpBuf > 0 && IN.my > 0.6) { P.jumpBuf = 0; Cl.release(P, 2.5); P.vy = 4; return; }
  // lunge
  if (P.jumpBuf > 0 && !k.ladder) { P.jumpBuf = 0; if (P.stam > 12) { V && V.spend(14); k.lunge = 0.28; sfx('whoosh', { vol: 0.5 }); } }
  let vy = up * (k.ladder ? 1.6 : tired ? 0 : 1.05); if (k.lunge > 0) { k.lunge -= dt; vy = 4.2; }
  P.y += vy * dt; k.ph += (Math.abs(vy) + Math.abs(side) * 1.1) * dt * 3.2;
  // sideways along the face (the face's tangent, from the climber's point of view: right = stick right)
  if (side && !k.ladder) { const tx = -k.nz, tz = k.nx; P.x -= tx * side * 0.95 * dt; P.z -= tz * side * 0.95 * dt; snap(P); }
  const ground = W.heightAt(P.x + k.nx * 0.4, P.z + k.nz * 0.4);
  if (P.y <= ground + 0.02 && up < 0) { P.y = ground; Cl.release(P, 0, true); return; }
  if (P.y < ground) P.y = ground;
  // reached the top: mantle onto it (or step off a ladder on to whatever is up there)
  const top = c.y1; if (P.y + 1.05 >= top && up >= 0 && vy >= 0) {
    const inw = k.ladder ? 0.9 : 0.55; const m1x = P.x - k.nx * (0.36 + inw), m1z = P.z - k.nz * (0.36 + inw); const stand = G.climbTopAt(W, m1x, m1z, top + 0.2);
    if (stand > -Infinity && Math.abs(stand - top) < 0.6) { k.mantle = 0.001; k.m0 = [P.x, P.y, P.z]; k.m1 = [m1x, stand, m1z]; sfx('step', { surf: 'stone' }); return; }
    P.y = Math.min(P.y, top - 1.05); // nothing to stand on (a thin edge): stay hanging at the top
  }
  P.spd = 0; P.vx = P.vz = 0; P.climbPh = k.ph; P.climbMove = !!moving;
};
Cl.release = function (P, push, landed) { const k = P.climb; if (!k) return; P.climb = null; P.climbCool = 0.6; P.grounded = !!landed; P.vy = landed ? 0 : -0.5;
  P.x += k.nx * (0.25 + (push || 0) * 0.2); P.z += k.nz * (0.25 + (push || 0) * 0.2); if (push) { P.vx = k.nx * push; P.vz = k.nz * push; } };
Cl.frame = function (dt) { const P = Game.P; if (P.climbCool > 0) P.climbCool -= dt; };
})(window.G);
