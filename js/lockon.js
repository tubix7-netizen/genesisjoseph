/* 약속의 길 — 조준 (lock-on) · v16
   · The 「조준」 button by the left stick locks onto the nearest wild animal in view (or, while carrying something, a jar / stone /
     basket to hit). The camera keeps the target in shot, Joseph turns to it, and the sling, bow, staff and thrown things all go to
     it. While locked the button reads 「해제」: tap it to let go.
   · Carrying something with nothing to lock onto: 「조준」 puts a landing mark on the ground. The left stick then moves the mark
     (Joseph turns to it) and A throws the thing in an arc onto the mark. 「조준」 again (or dropping the thing) ends it.
   Keyboard: V. API: G.Lock.target · G.Lock.aim · G.Lock.point() → {x,y,z} to throw at, or null. */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), PI = Math.PI;
const L = G.Lock = { target: null, aim: null };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const alive = a => a && a.st !== 'dead' && a.st !== 'gone' && (a.near === undefined || a.near);
const posOf = t => t.K ? { x: t.x, y: t.y, z: t.z } : { x: t.x, y: (t.y || 0) + (t.fy || 0) + (t.d && t.d.big ? 0.9 : 0.5), z: t.z };
function candidates() { const P = Game.P, CAM = Game.CAM, fx = -Math.sin(CAM.yaw), fz = -Math.cos(CAM.yaw), out = [];
  if (G.Combat) for (const a of G.Combat.wild()) { if (!alive(a)) continue; const dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz); if (d > 28) continue; const dot = (dx * fx + dz * fz) / (d || 1); if (dot < -0.1 && d > 4) continue; out.push({ t: a, s: d * (1.7 - dot), ang: Math.atan2(dx, dz) }); }
  if (G.Phys && G.Phys.held) for (const b of G.Phys.list) { if (b.gone || b === G.Phys.held) continue; const dx = b.x - P.x, dz = b.z - P.z, d = Math.hypot(dx, dz); if (d > 16 || d < 1.2) continue; const dot = (dx * fx + dz * fz) / (d || 1); if (dot < 0.2) continue; out.push({ t: b, s: d * (1.7 - dot) + 3, ang: Math.atan2(dx, dz) }); }
  if (G.Loot) for (const t of G.Loot.targets()) { const dx = t.x - P.x, dz = t.z - P.z, d = Math.hypot(dx, dz); if (d > 16 || d < 1.2) continue; const dot = (dx * fx + dz * fz) / (d || 1); if (dot < 0.2) continue; out.push({ t, s: d * (1.7 - dot) + 2, ang: Math.atan2(dx, dz) }); }
  return out.sort((a, b) => a.s - b.s); }
L.press = function () { if (G.UI.busy() || (G.Cine && G.Cine.on)) return; const c = candidates();
  if (L.aim) { L.aim = null; sfx('click', { pitch: 0.8 }); return; }
  if (L.target) { L.release(); return; } // v16.1: while locked the button reads 「해제」 and lets go
  if (c.length) { L.target = c[0].t; sfx('click', { pitch: 1.2 }); if (!Game.S().flags.tipLock) { Game.S().flags.tipLock = 1; G.UI.toast('조준 · 한 번 더 누르면 해제돼요'); } return; }
  if (G.Phys && G.Phys.held) { const P = Game.P; L.aim = { x: P.x + Math.sin(P.face) * 6, z: P.z + Math.cos(P.face) * 6 }; sfx('click', { pitch: 1.1 }); G.UI.toast('던질 곳 정하기 · 왼쪽 스틱으로 표시를 옮기고 A로 던져요'); return; }
  G.UI.toast('조준할 대상이 없어요'); };
L.release = function () { L.target = null; L.aim = null; sfx('click', { pitch: 0.8 }); };
L.point = function () { if (L.aim) return { x: L.aim.x, y: Game.W().heightAt(L.aim.x, L.aim.z) + 0.2, z: L.aim.z }; if (L.target && (L.target.K ? !L.target.gone : alive(L.target))) return posOf(L.target); return null; };
// the left stick moves the landing mark while aiming (called from updatePlayer; returns true when it used the stick)
L.steer = function (mx, my, dt) { if (!L.aim) return false; const P = Game.P, CAM = Game.CAM, sp = 9 * dt; // stick is camera-relative, like walking
  const fx = -Math.sin(CAM.yaw), fz = -Math.cos(CAM.yaw), rx = Math.cos(CAM.yaw), rz = -Math.sin(CAM.yaw); if (Math.hypot(mx, my) > 0.12) { L.aim.x += (fx * -my + rx * mx) * sp; L.aim.z += (fz * -my + rz * mx) * sp; }
  let dx = L.aim.x - P.x, dz = L.aim.z - P.z, d = Math.hypot(dx, dz); const dd = Math.max(2, Math.min(14, d)); if (d > 0.01) { L.aim.x = P.x + dx / d * dd; L.aim.z = P.z + dz / d * dd; }
  P.face = Math.atan2(L.aim.x - P.x, L.aim.z - P.z); return true; };
L.update = function (dt) { const P = Game.P, CAM = Game.CAM, IN = Game.INPUT;
  if (L.aim && !(G.Phys && G.Phys.held)) L.aim = null;
  if (L.target && !(L.target.K ? !L.target.gone && L.target !== (G.Phys && G.Phys.held) : alive(L.target))) L.target = null;
  if (L.target && Math.hypot(L.target.x - P.x, L.target.z - P.z) > 34) L.target = null;
  const p = L.target ? posOf(L.target) : L.aim ? L.point() : null;
  if (p && L.target && !Game.cineOn && !G.UI.busy()) { const dx = p.x - P.x, dz = p.z - P.z; // keep it in shot: ease the camera behind Joseph toward it (unless the right stick is turning it)
    const so = (CAM.cOff || 0), sx = dx - Math.cos(CAM.yaw) * so, sz = dz + Math.sin(CAM.yaw) * so; // v16.8 over the shoulder: line up from the shoulder pivot, not the body
    if (Math.hypot(IN.cx || 0, IN.cy || 0) < 0.2 && Math.hypot(dx, dz) > 1.5) { const want = Math.atan2(-sx, -sz); let df = want - CAM.yaw; while (df > PI) df -= 2 * PI; while (df < -PI) df += 2 * PI; CAM.yaw += df * Math.min(1, dt * 3); }
    if ((P.spd || 0) < 0.5 && !P.act && L.target) { let df = Math.atan2(dx, dz) - P.face; while (df > PI) df -= 2 * PI; while (df < -PI) df += 2 * PI; P.face += df * Math.min(1, dt * 8); } }
  // markers
  const ring = $('lockRing'), mark = $('aimMark'), R = G.R; if (!ring) return;
  if (L.target && !G.UI.busy() && !Game.cineOn) { const q = R.project(p.x, p.y + 0.3, p.z, G.UI.W, G.UI.H); if (q) { ring.hidden = false; ring.style.transform = `translate(${q[0]}px,${q[1]}px) translate(-50%,-50%) scale(${Math.max(0.55, Math.min(1.1, 8 / q[2]))})`; } else ring.hidden = true; } else ring.hidden = true;
  if (L.aim && !G.UI.busy() && !Game.cineOn) { const q = R.project(p.x, p.y, p.z, G.UI.W, G.UI.H); if (q) { mark.hidden = false; mark.style.transform = `translate(${q[0]}px,${q[1]}px) translate(-50%,-50%) scale(${Math.max(0.5, Math.min(1.6, 10 / q[2]))}) rotateX(62deg)`; } else mark.hidden = true; } else mark.hidden = true;
  const b = $('btnLock'); if (b) { const lab = L.target || L.aim ? '해제' : '조준'; if (b.dataset.l !== lab) { b.dataset.l = lab; b.querySelector('span').textContent = lab; } b.classList.toggle('on', !!(L.target || L.aim)); } };
// the sling / bow / staff go for the locked target
if (G.Combat) { const pick0 = G.Combat.pickTarget; G.Combat.pickTarget = function () { if (L.target && !L.target.K && alive(L.target)) return L.target; return null; }; } // v16.6: no auto-target — the target (and its health bar) only when you lock on
// thrown things fly in an arc onto the target or the mark
if (G.Phys) { const th0 = G.Phys.throwIt; G.Phys.throwIt = function () { const p = L.point(), Ph = G.Phys, b = Ph.held, P = Game.P; if (!p || !b) return th0.apply(this, arguments);
    th0.apply(this, arguments); const dx = p.x - b.x, dz = p.z - b.z, D = Math.hypot(dx, dz), T = 0.35 + D / 11, GR = 18; b.vx = dx / T; b.vz = dz / T; b.vy = (p.y - b.y + 0.5 * GR * T * T) / T; P.face = Math.atan2(dx, dz); if (L.aim) L.aim = null; }; }
// a button by the left stick, the markers, and Q on the keyboard
const btn = document.createElement('button'); btn.className = 'cbtn'; btn.id = 'btnLock'; btn.innerHTML = '<span>조준</span>'; btn.setAttribute('aria-label', '조준');
btn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); L.press(); }); const ctl = $('controls'); if (ctl) ctl.appendChild(btn);
const ring = document.createElement('div'); ring.id = 'lockRing'; ring.hidden = true; ring.innerHTML = '<i></i><i></i><i></i><i></i><b></b>'; document.body.appendChild(ring);
const vg = document.createElement('div'); vg.id = 'aimVig'; document.body.appendChild(vg);
const mk = document.createElement('div'); mk.id = 'aimMark'; mk.hidden = true; document.body.appendChild(mk);
addEventListener('keydown', e => { if (e.code === 'KeyV' && !e.repeat && Game.mode === 'play') L.press(); });
L.reset = () => { L.target = null; L.aim = null; };
})(window.G);
