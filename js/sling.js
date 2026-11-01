/* 약속의 길 — 물매 타이밍 (v16.6)
   The sling only fires at a locked target (「조준」 first). Hold 「쏘기」: Joseph whirls the sling and a marker swings back and
   forth on a bar above the animal's health bar (like the millstone game). Let go to loose the stone:
   · dead centre → a great hit (double damage, critical) · near it → a normal hit · the edge → a graze · outside → a miss.
   Out of range, the stone falls short. With 정신력 (the eye) ≥ 12 Joseph focuses: the marker slows and the sweet spot widens
   (costs 12). Keyboard: hold F. */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const SL = G.Sling = { on: null };
const isSling = () => { const S = Game.S(), h = S && S.hero; return h && h.mode === 'ranged' && h.ranged === 'sling'; };
const target = () => { const t = G.Lock && G.Lock.target; return t && !t.K && t.st !== 'dead' && t.st !== 'gone' ? t : null; };
const RANGE = () => { const g = G.Combat.GEAR.sling, h = Game.S().hero; return g.range + (h.sk ? h.sk.aim * 2 : 0); };
SL.start = function () { if (SL.on || G.UI.busy() || Game.cineOn) return;
  const t = target(); if (!t) { G.UI.toast('물매는 먼저 「조준」으로 짐승을 겨눠야 쏠 수 있어요'); return; }
  if (!Game.have('stone')) { G.UI.toast('물매에 쓸 돌이 없어요 (돌무더기에서 주워요)'); return; }
  const focus = G.Focus ? G.Focus.aimOn() : false; /* v16.7 집중 조준 slows the world while the sling spins */ SL.on = { t: 0, x: 0.5, focus, ph: Math.random() * 6 };
  const P = Game.P; P.emote = { k: 'sling', t: 0, dur: 0 }; P.face = Math.atan2(t.x - P.x, t.z - P.z);
  const bar = $('slingBar'); bar.hidden = false; bar.classList.toggle('focus', !!focus); sfx('whoosh', { vol: 0.4, pitch: 0.8 }); };
SL.release = function () { const s = SL.on; if (!s) return; SL.on = null; $('slingBar').hidden = true; const P = Game.P; P.emote = null; const t = target(); if (!t) return;
  const off = Math.abs(s.x - 0.5), k = s.focus ? 1.8 : 1, dist = Math.hypot(t.x - P.x, t.z - P.z), far = dist > RANGE();
  let mul = 1, crit = false, miss = false, head = false, msg = '';
  if (far) { miss = true; msg = '너무 멀어요 · 돌이 닿지 않아요'; } else if (off < 0.075 * k) { mul = 2.6; crit = true; head = true; msg = '머리 명중! · 짐승이 잠시 기절했어요'; } else if (off < 0.19 * k) { mul = 1; msg = ''; } else if (off < 0.32 * k) { mul = 0.5; msg = '살짝 스쳤어요'; } else { miss = true; msg = '빗나갔어요'; } // v16.9 a wider bar: the centre is a head shot (big damage + a short stun)
  if (s.focus) { const S = Game.S(); if (!S.flags.tipFocus) { S.flags.tipFocus = 1; G.UI.toast('집중했어요 · 시간이 느려지는 동안 맞히는 칸이 넓어져요'); } }
  const was = P.atk; G.Combat.attack(); if (P.atk && P.atk !== was) Object.assign(P.atk, { mul, crit, miss, short: far, head }); if (msg) setTimeout(() => G.UI.toast(msg), 250); };
SL.update = function (dt) { const s = SL.on, bar = $('slingBar'); if (!s) return; const t = target();
  if (!t || G.UI.busy() || Game.cineOn || !isSling()) { SL.on = null; bar.hidden = true; Game.P.emote = null; return; }
  s.t += dt; s.x = 0.5 + 0.5 * Math.sin(s.ph + s.t * 4.1); const P = Game.P; P.face = Math.atan2(t.x - P.x, t.z - P.z); if (P.emote) P.emote.t = s.t;
  if ((SL.wT = (SL.wT || 0) - dt) <= 0) { SL.wT = s.focus ? 0.5 : 0.32; sfx('whoosh', { vol: 0.25, pitch: 1.1 + Math.random() * 0.2 }); }
  const q = G.R.project(t.x, (t.y || 0) + (t.fy || 0) + (t.d && t.d.big ? 2.5 : 1.85), t.z, G.UI.W, G.UI.H); if (q) bar.style.transform = `translate(${q[0]}px,${q[1]}px) translate(-50%,-100%)`;
  $('slingMk').style.left = (s.x * 100).toFixed(1) + '%'; const far = Math.hypot(t.x - P.x, t.z - P.z) > RANGE(); bar.classList.toggle('far', far); };
// take over the attack button and F while the sling is the weapon
const btn = $('btnAtk');
btn.addEventListener('pointerdown', e => { if (!isSling()) return; e.preventDefault(); e.stopImmediatePropagation(); SL.start(); }, true);
const up = e => { if (SL.on) { e.preventDefault(); SL.release(); } };
btn.addEventListener('pointerup', up, true); btn.addEventListener('pointercancel', up, true); btn.addEventListener('pointerleave', up, true);
addEventListener('keydown', e => { if (e.code === 'KeyF' && isSling() && Game.mode === 'play') { e.stopImmediatePropagation(); if (!e.repeat) SL.start(); } }, true);
addEventListener('keyup', e => { if (e.code === 'KeyF' && SL.on) SL.release(); }, true);
const bar = document.createElement('div'); bar.id = 'slingBar'; bar.hidden = true; bar.innerHTML = '<i class="g"></i><i class="p"></i><b id="slingMk"></b><span>놓을 때 돌이 날아가요</span>'; document.body.appendChild(bar);
})(window.G);
