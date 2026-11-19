/* 약속의 길 — v18.66 천천히, 깊이 (pace.js · climate.js · survival.js 뒤)
   · 그늘: 해가 비치는 쪽으로 눈길을 따라가 보아 나무 갓(W.canopies)이나 벽 · 지붕(충돌체)에 가리면 그늘이에요.
     나무 바로 밑뿐 아니라, 아침 · 저녁에 길게 드리운 나무 그림자 · 건물 그림자 속도 그늘로 쳐요(더위가 내려가요). 화면 왼쪽 위에 「그늘」이 잠깐 떠요.
   · 조용한 화면: 한참 걷고 있으면 목표 상자가 옅어져요. 멈추거나 새 목표가 생기면 다시 또렷해져요.
   · 새 떼: 나무 곁을 뛰어 지나가면 숨어 있던 새들이 푸드덕 날아올라요.
   (움직임 「느긋하게」 기본 · 하루 길이 · 걷기 속도는 motion.js · game.js) */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const P = () => Game.P, S = () => Game.S();
const Sh = G.Shade = {};
/* is (x, y, z) out of the sun? (y = the ground under a standing person) */
Sh.sun = function (x, y, z) { const W = Game.W(), sd = Game.env && Game.env.sunDir; if (!W || !sd || sd[1] < 0.1) return false; const y0 = y + 1.5;
  for (const c of W.canopies || []) { if (Math.abs(c.x - x) > 26 || Math.abs(c.z - z) > 26) continue; const ym = (c.y0 + c.y1) * 0.5; if (ym <= y0) continue; const t = (ym - y0) / sd[1]; if (t > 30) continue;
    const px = x + sd[0] * t, pz = z + sd[2] * t; if (Math.hypot(px - c.x, pz - c.z) < c.r * 0.82) return 'tree'; }
  if (W.ray && W.ray(x, y0, z, x + sd[0] * 18, y0 + sd[1] * 18, z + sd[2] * 18) < 0.995) return 'wall';
  return false; };
/* the heat gauge in climate.js asks C.shade; it now also counts a crown's shadow thrown aside by a low sun */
let shT = 0, lastShade = false;
{ const up0 = G.Climate && G.Climate.update; if (up0) G.Climate.update = function (dt) { const r = up0.apply(this, arguments); try { const C = G.Climate, p = P(); shT -= dt; if (shT <= 0) { shT = 0.25; Sh.here = Sh.sun(p.x, p.y, p.z); }
      if (!C.shade && Sh.here) { C.shade = true; if (C.heat > 0) C.heat = Math.max(0, C.heat - dt * (100 / (C.HEAT_SHADE || 90)) - dt * (100 / (C.HEAT_FILL || 300))); } /* (the fill climate.js just added is taken back, and it cools as in shade) */
      const h = S() ? S().time % 24 : 12, hotHour = h > 9.5 && h < 17; if (Sh.here && !lastShade && hotHour && !G.UI.busy()) toastShade(Sh.here); lastShade = !!Sh.here; } catch (e) { } return r; }; }
let tipT = 0; function toastShade(k) { const now = performance.now(); if (now - tipT < 40000) return; tipT = now; const el = document.getElementById('shadeTip'); if (!el) return; el.textContent = k === 'tree' ? '나무 그늘 · 더위가 식어요' : '그늘 · 더위가 식어요'; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); }
{ const css = document.createElement('style'); css.textContent = '#shadeTip{position:fixed;left:50%;top:calc(var(--gt,12px) + 54px);transform:translate(-50%,-6px);padding:5px 12px;border-radius:14px;background:rgba(20,40,30,.55);color:#d8f0d0;font-size:12px;opacity:0;transition:opacity .6s,transform .6s;pointer-events:none;z-index:11}#shadeTip.on{opacity:1;transform:translate(-50%,0)}'
    + 'body.calmHud #questBox{opacity:.28;transition:opacity 1.6s}#questBox{transition:opacity .5s}'; document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'shadeTip'; setTimeout(() => (document.getElementById('hud') || document.body).appendChild(el), 0); }

// ------------------------------------------------------------------ a quiet screen while walking
let walkT = 0, stillT = 0, calm = false;
{ const q0 = G.UI.quest; G.UI.quest = function () { const r = q0.apply(this, arguments); walkT = 0; if (calm) { calm = false; document.body.classList.remove('calmHud'); } return r; }; }
function hudTick(dt) { const p = P(), moving = p.spd > 0.8 && !G.UI.busy() && !Game.cineOn; if (moving) { walkT += dt; stillT = 0; } else { stillT += dt; if (stillT > 1.2) walkT = 0; }
  const want = walkT > 6 && !(Game.goalSide && Game.goalSide() && walkT < 12); if (want !== calm) { calm = want; document.body.classList.toggle('calmHud', calm); } }

// ------------------------------------------------------------------ birds startled out of the trees
const flushed = new Map();
function birdTick() { const p = P(), W = Game.W(); if (!W || !G.FX || p.spd < 3.2) return; const h = S() ? S().time % 24 : 12; if (h < 5.5 || h > 19.5) return; const now = performance.now() / 1000;
  for (const c of W.canopies || []) { if (Math.abs(c.x - p.x) > 7 || Math.abs(c.z - p.z) > 7) continue; const k = Math.round(c.x) + ',' + Math.round(c.z); if ((flushed.get(k) || 0) > now || Math.hypot(c.x - p.x, c.z - p.z) > c.r + 2.5) continue;
    flushed.set(k, now + 90); if (Math.random() > 0.55) continue; const y = (c.y0 + c.y1) * 0.5, n = 3 + Math.floor(Math.random() * 4);
    G.FX.burst(c.x, y, c.z, n, { c: [0.16, 0.14, 0.13], sp: 3.2, up: 3.4, size: 0.16, g: -1.2, life: 2.6, a: 0.95, drag: 0.15 }); G.Audio && G.Audio.sfx && G.Audio.sfx('flap', { vol: 0.45, pitch: 1.1 + Math.random() * 0.2 }); break; } }

let bT = 0;
{ const fr = Game.frame; Game.frame = function (now) { const r = fr.apply(this, arguments); try { if (Game.mode === 'play' && S()) { const dt = 1 / 60; hudTick(dt); if ((bT -= dt) <= 0) { bT = 0.4; birdTick(); } } else if (calm) { calm = false; document.body.classList.remove('calmHud'); } } catch (e) { } return r; }; }
})(window.G);
