/* 약속의 길 — 집중 (정신력 쓰기) (v16.7)
   「집중」 button (left of 「조준」 along the left stick's arc, or tap the eye by the map, key Q):
   · 평소: costs 15. A line of yellow light runs along the ground from Joseph to where the quest wants him to go (it follows
     roads and goes round water, steep rock and walls), then fades. At the same time treasure nearby (32 m) glints for 8 s:
     chests (gold ◆), jars and boxes (amber ●), things lying on the ground — and chests you sense are marked on the big map.
   · 조준 중(물매): tap to arm 「집중 조준」. While you hold 「쏘기」 the world slows to a third (Joseph and the camera don't),
     the sweet spot widens; it drains 정신력 5/s while the sling spins. Out of 정신력 → time comes back.
   · Aiming goes over the shoulder (CAM.aimK → short boom behind the right shoulder, longer lens, pitch toward the target),
     a little closer in slow motion. v16.8: the button sits left of 「조준」 on the arc around the left stick.
   · 정신력 now comes back slowly by itself; food (a cooked dish +10, a feast +25, sweet things +4), prayer, the fireside,
     the stars, helping people and a night's sleep fill it.
   API: G.Focus.press() · G.Focus.path(x, z) → points · G.Focus.aim (armed) */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), PI = Math.PI;
const F = G.Focus = { aim: false, trail: null, sense: null, slow: 1 };
const V = () => G.Vitals;
const mind = () => (V() && V().mind ? V().mind() : 0);
const locked = () => { const t = G.Lock && G.Lock.target; return t && (t.K ? !t.gone : t.st !== 'dead' && t.st !== 'gone') ? t : null; };
const slingOut = () => { const h = Game.S() && Game.S().hero; return h && h.mode === 'ranged' && h.ranged === 'sling'; };
const calm = () => Game.cineOn || (G.Cine && G.Cine.on) || G.UI.busy() || G.UI.modal();

// ------------------------------------------------------------------ path finding on a coarse grid (A*)
const CELL = 3;
F.path = function (tx, tz) { const W = Game.W(), P = Game.P, EP = Game.EP(), wl = W.water ? W.water.level : -99;
  const x0 = Math.min(P.x, tx) - 40, x1 = Math.max(P.x, tx) + 40, z0 = Math.min(P.z, tz) - 40, z1 = Math.max(P.z, tz) + 40;
  const nx = Math.max(2, Math.ceil((x1 - x0) / CELL)), nz = Math.max(2, Math.ceil((z1 - z0) / CELL)); if (nx * nz > 60000) return null;
  const cx = i => x0 + (i + 0.5) * CELL, cz = j => z0 + (j + 0.5) * CELL, cost = new Float32Array(nx * nz).fill(-1);
  const cellCost = k => { if (cost[k] >= 0) return cost[k]; const i = k % nx, j = (k / nx) | 0, x = cx(i), z = cz(j); if (Math.abs(x) > W.half - 2 || Math.abs(z) > W.half - 2) return (cost[k] = 1e9);
    const h = W.heightAt(x, z); let c = 1; if (h < wl - 0.1) c = h < wl - 0.9 ? 1e9 : 7; const sl = W.slopeAt ? W.slopeAt(x, z) : 0; if (sl > 0.75) c = 1e9; else c *= 1 + sl * 5;
    if (c < 1e8) { const q = { x, z }; W.collide(q, 0.9, h); if (Math.hypot(q.x - x, q.z - z) > 0.6) c = 1e9; }
    if (c < 1e8 && EP.roadD && EP.roadD(x, z) < 3) c *= 0.55; return (cost[k] = c); };
  const idx = (x, z) => Math.max(0, Math.min(nx - 1, Math.floor((x - x0) / CELL))) + Math.max(0, Math.min(nz - 1, Math.floor((z - z0) / CELL))) * nx;
  const s = idx(P.x, P.z), e = idx(tx, tz), g = new Float32Array(nx * nz).fill(1e30), from = new Int32Array(nx * nz).fill(-1), shut = new Uint8Array(nx * nz);
  const ei = e % nx, ej = (e / nx) | 0, hh = k => Math.hypot(k % nx - ei, ((k / nx) | 0) - ej) * 0.55;
  const heap = [], push = (k, f) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } },
    pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  g[s] = 0; push(s, hh(s)); let n = 0, best = s, bestH = hh(s);
  while (heap.length && n++ < 40000) { const [, k] = pop(); if (shut[k]) continue; shut[k] = 1; if (k === e) { best = e; break; } const h0 = hh(k); if (h0 < bestH) { bestH = h0; best = k; }
    const i = k % nx, j = (k / nx) | 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue; const q = a + b * nx; if (shut[q]) continue;
      const c = cellCost(q); if (c >= 1e8 && q !== e) continue; const ng = g[k] + (di && dj ? 1.414 : 1) * Math.min(c, 50); if (ng < g[q]) { g[q] = ng; from[q] = k; push(q, ng + hh(q)); } } }
  const cells = []; for (let k = best; k >= 0; k = from[k]) cells.push(k); cells.reverse();
  let pts = [[P.x, P.z]].concat(cells.slice(1).map(k => [cx(k % nx), cz((k / nx) | 0)])); if (best === e) pts.push([tx, tz]);
  for (let it = 0; it < 2; it++) { const o = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } o.push(pts[pts.length - 1]); pts = o; }
  return pts; };
const resample = (pts, step, max) => { const out = [pts[0]]; let need = step, len = 0;
  for (let i = 0; i < pts.length - 1 && len < max; i++) { const a = pts[i], b = pts[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]); let at = 0;
    while (d - at >= need && len < max) { at += need; out.push([a[0] + (b[0] - a[0]) * at / d, a[1] + (b[1] - a[1]) * at / d]); len += step; need = step; }
    need -= d - at; }
  return out; };

// ------------------------------------------------------------------ the button
const btn = document.createElement('button'); btn.className = 'cbtn'; btn.id = 'btnFocus'; btn.innerHTML = '<span>집중</span>'; btn.setAttribute('aria-label', '집중 (정신력)'); ($('controls') || document.body).appendChild(btn); // v16.9 inside #controls, above the left stick's touch zone (it sat under it on phones)
btn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); F.press(); });
addEventListener('keydown', e => { if (e.code === 'KeyQ' && !e.repeat && Game.mode === 'play') F.press(); });
setTimeout(() => { const c = $('coreMind'); if (c) { c.style.pointerEvents = 'auto'; c.style.cursor = 'pointer'; c.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); F.press(); }); } }, 0);
const fx = document.createElement('div'); fx.id = 'focusFx'; document.body.appendChild(fx);
const slowFx = document.createElement('div'); slowFx.id = 'slowFx'; document.body.appendChild(slowFx);
const marks = document.createElement('div'); marks.id = 'senseMarks'; document.body.appendChild(marks);

F.press = function () { if (Game.mode !== 'play' || calm()) return; const S = Game.S();
  if (locked() && slingOut()) { F.aim = !F.aim; btn.classList.toggle('armed', F.aim); sfx('click');
    G.UI.toast(F.aim ? (mind() >= 6 ? '집중 조준 · 「쏘기」를 누르고 있으면 시간이 느려져요 (정신력 5/초)' : '정신력이 모자라요 · 음식이나 기도로 채워요') : '집중 조준을 껐어요'); return; }
  if (!(V() && V().mindUse && V().mindUse(15))) { G.UI.toast('정신력이 모자라요 (15) · 음식·기도·모닥불·잠으로 채워요'); sfx('click', { pitch: 0.7 }); return; }
  fx.classList.remove('on'); void fx.offsetWidth; fx.classList.add('on'); sfx('quest', { pitch: 1.3, vol: 0.5 });
  const t = Game.target(); let said = '';
  if (t) { const pts = F.path(t.x, t.z); if (pts && pts.length > 1) { F.trail = { pts: resample(pts, 0.55, 140), head: 0, t: 0 }; const far = Math.hypot(t.x - Game.P.x, t.z - Game.P.z); said = far > 140 ? '빛이 가야 할 길의 앞부분을 비춰요' : '빛이 가야 할 곳까지 길을 비춰요'; } }
  else said = '지금 꼭 가야 할 곳은 없어요';
  // treasure nearby
  const P = Game.P, R = 32, list = [], seen = S.flags.chSeen = S.flags.chSeen || {};
  if (G.Loot) { for (const b of G.Loot.list) { if (Math.hypot(b.x - P.x, b.z - P.z) > R) continue; if (b.k === 'chest' ? b.open : b.gone) continue; list.push({ x: b.x, y: b.y, z: b.z, k: b.k === 'chest' ? 'chest' : 'jar' }); if (b.k === 'chest') seen[b.id] = 1; }
    for (const d of G.Loot.drops || []) if (Math.hypot(d.x - P.x, d.z - P.z) < R) list.push({ x: d.x, y: d.gy, z: d.z, k: 'drop' }); }
  F.sense = { list, t: 0, dur: 8 }; marks.innerHTML = list.map(o => `<i class="sm ${o.k}"></i>`).join('');
  const nc = list.filter(o => o.k === 'chest').length, nj = list.filter(o => o.k === 'jar').length;
  G.UI.toast(`정신을 모았어요 (정신력 15) · ${said}${nc ? ` · 가까이에 보물상자 ${nc}개!` : ''}${nj ? ` · 항아리·상자 ${nj}개` : ''}`); };
F.aimOn = () => F.aim && mind() >= 6;

// ------------------------------------------------------------------ per frame
F.update = function (dt) { const S = Game.S(), P = Game.P, W = Game.W(), CAM = Game.CAM; if (!S || !W) return;
  btn.hidden = Game.mode !== 'play'; const lk = locked(); if (!lk && F.aim) { F.aim = false; btn.classList.remove('armed'); }
  btn.classList.toggle('low', mind() < 15 && !(lk && slingOut())); btn.querySelector('span').textContent = lk && slingOut() ? (F.aim ? '집중 켬' : '집중') : '집중';
  // slow motion while a focused sling spins
  const sl = G.Sling && G.Sling.on, slowNow = !!(sl && sl.focus) && !calm();
  if (slowNow) { const H = S.hero; H.mind = Math.max(0, mind() - 5 * dt); H.mindT = 0; if (H.mind <= 0) { sl.focus = false; G.UI.toast('정신력이 다했어요 · 시간이 돌아와요'); $('slingBar') && $('slingBar').classList.remove('focus'); } }
  F.slow += ((slowNow ? 0.3 : 1) - F.slow) * Math.min(1, dt * (slowNow ? 7 : 5)); Game.worldScale = F.slow; document.body.classList.toggle('slowmo', F.slow < 0.8); slowFx.style.opacity = Math.max(0, Math.min(1, (1 - F.slow) / 0.7)).toFixed(2);
  // aim zoom
  const aiming = (lk || (G.Lock && G.Lock.aim)) && !Game.cineOn && !Game.cineCam && !G.UI.busy(), want = aiming ? (F.slow < 0.8 ? 1.35 : 1) : 0; // v16.8 any aim → over the shoulder
  CAM.aimK = (CAM.aimK || 0) + (want - (CAM.aimK || 0)) * Math.min(1, dt * (want > (CAM.aimK || 0) ? 5 : 4)); CAM.aimAt = aiming && G.Lock ? G.Lock.point() : null; document.body.classList.toggle('aiming', CAM.aimK > 0.5);
  // light along the way
  const tr = F.trail; if (tr) { tr.t += dt; const prev = Math.floor(tr.head); tr.head = Math.min(tr.pts.length - 1, tr.head + dt * 55);
    for (let i = prev; i < Math.floor(tr.head); i++) { const [x, z] = tr.pts[i], y = W.heightAt(x, z) + 0.22; G.FX.burst(x, y, z, 2, { c: [1, 0.88, 0.4], sp: 0.03, up: 0.1, g: -0.03, life: 3.2, size: 0.34, a: 1, drag: 3, spread: 0.06 });
      if (i % 3 === 0) G.FX.burst(x, y + 0.05, z, 1, { c: [1, 0.96, 0.75], sp: 0.08, up: 0.35, g: -0.1, life: 1.4, size: 0.1, a: 0.8, spread: 0.3 }); }
    if (tr.head < tr.pts.length - 1) { const [x, z] = tr.pts[Math.floor(tr.head)]; G.FX.burst(x, W.heightAt(x, z) + 0.3, z, 2, { c: [1, 0.95, 0.7], sp: 0.5, up: 0.8, g: 0.5, life: 0.6, size: 0.14 }); }
    else if (tr.t > 4) F.trail = null; }
  // treasure glints
  const se = F.sense; if (se) { se.t += dt; const els = marks.children, a = se.t < 0.4 ? se.t / 0.4 : se.t > se.dur - 1 ? Math.max(0, se.dur - se.t) : 1;
    se.list.forEach((o, i) => { const el = els[i]; if (!el) return; const q = G.R.project(o.x, o.y + (o.k === 'chest' ? 1.1 : 0.8), o.z, G.UI.W, G.UI.H); if (!q) { el.style.opacity = 0; return; } el.style.opacity = a; el.style.transform = `translate(${q[0]}px,${q[1]}px) translate(-50%,-50%)`; });
    if ((se.pT = (se.pT || 0) - dt) <= 0) { se.pT = 0.45; for (const o of se.list) if (o.k === 'chest') G.FX.burst(o.x, o.y + 0.5, o.z, 3, { c: [1, 0.85, 0.3], sp: 0.3, up: 1.6, g: -0.3, life: 1.1, size: 0.12 }); }
    if (se.t > se.dur) { F.sense = null; marks.innerHTML = ''; } } };

// ------------------------------------------------------------------ 정신력 from food, help and sleep
const SWEET = /honey|date|fig|grape|raisin|melon|pomegranate|cake|juice/i;
const eat0 = Game.eat; Game.eat = function (k) { const before = Game.inv(k), r = eat0.apply(this, arguments); if (Game.inv(k) >= before || G.Cuisine) return r; // v16.9 cuisine.js decides what each food gives
  const H = G.Hearth, dish = !!(H && H.ALL && H.ALL.includes(k)), n = /feast|jacobGift/.test(k) ? 25 : dish ? 10 : SWEET.test(k) ? 4 : 1;
  if (V() && V().mindGain) { V().mindGain(n); if (n >= 4) setTimeout(() => G.UI.toast(`마음이 든든해요 · 정신력 +${n}`), 900); } return r; };
const sleep0 = Game.sleep; Game.sleep = function () { const r = sleep0.apply(this, arguments); setTimeout(() => { const H = Game.S().hero; if (H) H.mind = H.mindMax || 100; }, 600); return r; };

const css = document.createElement('style'); css.textContent = `
/* v16.8 「집중」 sits left of 「조준」 on an arc around the left stick (조준 ≈ 35° above the stick's horizontal, 집중 ≈ 66°, a
   little further out so it clears the 가방·동작 pills), so the thumb rolls stick → 조준 → 집중 without crossing the stick */
#btnFocus{width:50px;height:50px;left:calc(var(--gl) + 89px);bottom:calc(env(safe-area-inset-bottom,0px) + 158px);font-size:11.5px;right:auto;border-color:#7ab8ff;color:#d8ecff}
@media (max-aspect-ratio:1/1){#btnFocus{width:46px;height:46px;left:calc(var(--gl) + 81px);bottom:calc(env(safe-area-inset-bottom,0px) + 151px)}}
#btnFocus.low{opacity:.55}#btnFocus.armed{background:#2a4a7a;box-shadow:0 0 12px rgba(110,170,255,.8);color:#fff}
body.busy #btnFocus,body.cine #btnFocus,body.photo #btnFocus{visibility:hidden}
body.desk #btnFocus span::after{content:' Q';font-size:9px;opacity:.7}
#focusFx{position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;background:radial-gradient(circle at 50% 55%,rgba(255,226,140,0) 30%,rgba(255,214,110,.28) 70%,rgba(120,170,255,.25) 100%)}
#focusFx.on{animation:fpulse 1.4s ease-out}
@keyframes fpulse{0%{opacity:0;transform:scale(1.25)}25%{opacity:1}100%{opacity:0;transform:scale(1)}}
#slowFx{position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;background:radial-gradient(circle at 50% 42%,rgba(0,0,0,0) 38%,rgba(16,34,80,.55) 100%);box-shadow:inset 0 0 0 2px rgba(122,184,255,.35)}
#senseMarks{position:fixed;left:0;top:0;pointer-events:none;z-index:6}
#senseMarks .sm{position:absolute;left:0;top:0;display:block;width:14px;height:14px;border-radius:50%;background:#ffb84a;border:2px solid #fff4dc;box-shadow:0 0 10px #ffb84a;opacity:0}
#senseMarks .sm.chest{width:20px;height:20px;border-radius:3px;background:#ffd24a;rotate:45deg;box-shadow:0 0 16px #ffd24a,0 0 30px rgba(255,210,74,.6);animation:smb 1s ease-in-out infinite alternate}
#senseMarks .sm.drop{width:10px;height:10px;background:#fff4dc}
@keyframes smb{from{scale:.85}to{scale:1.15}}`;
document.head.appendChild(css);
})(window.G);
