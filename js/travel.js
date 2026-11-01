/* 약속의 길 — 이동 시네마틱 카메라 (v18.2, 엔진·연출 업그레이드 문서의 P9; 레드 데드 리뎀션 2의 시네마틱 카메라).
   Turn it on from 동작 → 「영화처럼 보기」: wide letterbox bars slide in and the camera films the hero as he walks or rides, changing its angle every
   8–12 s (side tracking, low in front looking back, high behind, a wide landscape shot, a slow orbit). The sticks still move the hero as usual; the camera
   follows people softly (half-life 0.7 s) so the angle changes glide instead of cutting. It checks that nothing stands between the camera and the hero (it
   moves closer, or goes up high behind him) and keeps off the ground.
   It ends by itself — with a glide back to the normal camera — when you drag the screen to look around (or use the right stick / arrow keys), when a talk,
   menu or cutscene starts, when you fight, aim, work, swim or fall, or when a beast is hunting you. G.Travel.toggle() · G.Travel.stats · off with ?travel=0. */
'use strict';
(function (G) {
const Game = G.Game, T = G.Travel = { on: false, w: 0, type: null, t: 0, dur: 10, st: null, hist: [], hd: 0, side: 1, stats: { shots: 0, blocked: 0, exits: 0, last: '' }, enabled: !/[?&]travel=0\b/.test(location.search) };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
let bars = null;
function showBars(on) { if (!bars) { bars = document.createElement('div'); bars.id = 'tbars'; bars.innerHTML = '<i></i><i></i>'; document.body.appendChild(bars); } requestAnimationFrame(() => bars.classList.toggle('on', on)); if (!on) setTimeout(() => { if (!T.on && bars) bars.classList.remove('on'); }, 700); else bars.classList.add('on'); }

// ------------------------------------------------------------------ the shots: where the camera stands, relative to the hero and the way he is heading
const SHOTS = {
  side: P => { const r = 6.2 * T.side; return { dx: Math.cos(T.hd) * r - Math.sin(T.hd) * 1.2, dz: -Math.sin(T.hd) * r - Math.cos(T.hd) * 1.2, h: 1.35, lead: 2.2, fov: 0.8 }; },
  low: P => ({ dx: Math.sin(T.hd) * 7.5, dz: Math.cos(T.hd) * 7.5, h: 0.45, lead: 0, fov: 0.85, up: 1.2 }),           // ahead of him, near the ground, looking back at him
  high: P => ({ dx: -Math.sin(T.hd) * 8, dz: -Math.cos(T.hd) * 8, h: 4.6, lead: 4, fov: 0.9 }),                       // behind and above, looking down the road
  wide: P => ({ dx: -Math.sin(T.hd) * 11 + Math.cos(T.hd) * 9 * T.side, dz: -Math.cos(T.hd) * 11 - Math.sin(T.hd) * 9 * T.side, h: 3.2, lead: 0, fov: 0.62, up: 0.6 }), // far away: the hero is small in the land
  orbit: P => { const a = T.hd + Math.PI + (T.t / T.dur - 0.5) * 1.1 * T.side; return { dx: Math.sin(a) * 6, dz: Math.cos(a) * 6, h: 1.7, lead: 0, fov: 0.78 }; }
};
const NAMES = Object.keys(SHOTS);

T.toggle = function () { if (T.on) T.stop('manual'); else T.start(); };
T.start = function () {
  if (!T.enabled || T.on || Game.mode !== 'play' || Game.cineOn || G.UI.busy()) return false; const CM = Game.CAM;
  T.on = true; T.t = 0; T.type = null; T.st = { x: CM.x, y: CM.y, z: CM.z, lx: CM.lx === undefined ? CM.tx : CM.lx, ly: CM.ly === undefined ? CM.ty : CM.ly, lz: CM.lz === undefined ? CM.tz : CM.lz, fov: CM.fov || 0.9 };
  T.hd = Game.P.face || 0; showBars(true); G.UI.toast('영화처럼 보기 · 화면을 끌면 끝나요'); return true;
};
T.stop = function (why) {
  if (!T.on) return; T.on = false; T.stats.last = why || ''; T.stats.exits++; const s = T.st; showBars(false);
  if (s) Game.camBlend = { x: s.x, y: s.y, z: s.z, lx: s.lx, ly: s.ly, lz: s.lz, fov: s.fov, t: 0, dur: 0.9 }; // glide back to the normal camera
};
function pick() { const opts = NAMES.filter(n => n !== T.type && (T.hist.length < 2 || n !== T.hist[T.hist.length - 2])); T.type = opts[Math.floor(Math.random() * opts.length)]; T.hist.push(T.type); if (T.hist.length > 6) T.hist.shift(); T.t = 0; T.dur = 8 + Math.random() * 4; T.side = Math.random() < 0.5 ? 1 : -1; T.stats.shots++; }

// should it stop?
function reason() {
  const P = Game.P, I = Game.INPUT || {}, C = G.Combat;
  if (Game.mode !== 'play') return 'mode'; if (Game.cineOn || Game.cineCam) return 'cutscene'; if (G.UI.busy()) return 'ui';
  if (Math.abs(I.cx || 0) + Math.abs(I.cy || 0) > 0.05 || (I.keys && (I.keys.ArrowLeft || I.keys.ArrowRight || I.keys.ArrowUp || I.keys.ArrowDown))) return 'look';
  if (P.downed) return 'down'; if (P.swim) return 'swim'; if ((Game.CAM.aimK || 0) > 0.05) return 'aim'; if (C && C.inCombat) return 'combat';
  if (P.act && !(G.Acts && G.Acts.walkable && G.Acts.walkable(P.act))) return 'act'; if (G.Mood && G.Mood.fear > 0.25) return 'danger'; return null;
}

// called from updateCamera: returns true while it is filming (it then owns the camera)
T.apply = function (dt) {
  if (!T.on) return false; const why = reason(); if (why) { T.stop(why); return false; } const P = Game.P, W = Game.W(), st = T.st;
  if (P.spd > 0.8) { const want = Math.atan2(P.vx, P.vz); T.hd += angDiff(T.hd, want) * Math.min(1, dt * 1.6); } else T.hd += angDiff(T.hd, P.face || T.hd) * Math.min(1, dt * 0.4);
  T.t += dt; if (!T.type || T.t > T.dur) pick();
  let d = SHOTS[T.type](P), tx = P.x + d.dx, tz = P.z + d.dz, ty = Math.max(P.y + d.h, W.heightAt(tx, tz) + 0.4 + (d.up || 0));
  // keep it clear of walls and hills: closer to the hero, or up high behind him
  const eye = P.y + 1.4; let f = W.ray(P.x, eye, P.z, tx, ty, tz), tries = 0; while (f < 0.97 && tries < 3) { tries++; const k = Math.max(0.35, f * 0.8); tx = P.x + d.dx * k; tz = P.z + d.dz * k; ty = Math.max(P.y + d.h * (0.6 + 0.4 * k), W.heightAt(tx, tz) + 0.4); f = W.ray(P.x, eye, P.z, tx, ty, tz); }
  if (f < 0.97) { T.stats.blocked++; d = SHOTS.high(P); tx = P.x + d.dx * 0.55; tz = P.z + d.dz * 0.55; ty = Math.max(P.y + d.h, W.heightAt(tx, tz) + 0.4); }
  const lx = P.x + Math.sin(T.hd) * d.lead, lz = P.z + Math.cos(T.hd) * d.lead, ly = P.y + 1.15, k = 1 - Math.exp(-dt * Math.LN2 / 0.7);
  st.x += (tx - st.x) * k; st.y += (ty - st.y) * k; st.z += (tz - st.z) * k; st.lx += (lx - st.lx) * k; st.ly += (ly - st.ly) * k; st.lz += (lz - st.lz) * k; st.fov += (d.fov - st.fov) * k;
  st.y = Math.max(st.y, W.heightAt(st.x, st.z) + 0.4); // (the soft following lags behind the ground: never let the camera sink into it)
  const CM = Game.CAM; CM.x = st.x; CM.y = st.y; CM.z = st.z; CM.lx = st.lx; CM.ly = st.ly; CM.lz = st.lz; CM.fov = st.fov; CM.tx = P.x; CM.tz = P.z; CM.ty = P.y + 1.4; CM.cDist = undefined; return true;
};
})(window.G);
