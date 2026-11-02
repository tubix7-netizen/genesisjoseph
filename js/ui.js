/* 약속의 길 — UI: HUD, input, dialogue, narration, menus, shop, pens, sites, minigames */
'use strict';
(function (G) {
const $ = id => document.getElementById(id);
const UI = G.UI = {};
const Game = G.Game;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v; // v17.0 (new minigames)
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let busyFlags = { dialog: false, narr: false, panel: false, mg: false, fade: false, rot: false };
UI.busy = () => { for (const k in busyFlags) if (busyFlags[k]) return true; return false; };
UI.setBusy = (k, v) => { busyFlags[k] = !!v; };
UI.lastTalk = 0;
UI.modal = UI.busy;
UI.overlayOn = () => busyFlags.panel || busyFlags.narr; // v18.11 a menu / narration card covers the world (phones draw it at 15 fps meanwhile)
UI.cw = 1; UI.ch = 1; UI.W = 1; UI.H = 1;

// ------------------------------------------------------------------ icons
const IC = {
  stick: '<path d="M4 20 L20 4" stroke="C" stroke-width="3" stroke-linecap="round"/><path d="M11 13 L15 15" stroke="C" stroke-width="2" stroke-linecap="round"/>',
  log: '<rect x="3" y="8" width="16" height="9" rx="4" fill="C"/><ellipse cx="19" cy="12.5" rx="3" ry="4.5" fill="#e8c890"/><ellipse cx="19" cy="12.5" rx="1.2" ry="2" fill="none" stroke="#a87a4a"/>',
  stone: '<path d="M4 16 Q3 9 9 7 Q15 4 19 9 Q22 14 18 18 Q11 21 4 16Z" fill="C"/><path d="M8 11 Q11 9 14 10" stroke="rgba(255,255,255,.4)" fill="none" stroke-width="1.5"/>',
  reed: '<path d="M8 21 L9 6 M12 21 L12 3 M16 21 L15 7" stroke="C" stroke-width="2" stroke-linecap="round"/><ellipse cx="12" cy="5" rx="1.6" ry="3" fill="#9a7a4a"/>',
  clay: '<path d="M3 17 Q4 10 12 10 Q20 10 21 17 Z" fill="C"/><circle cx="9" cy="13" r="1.3" fill="rgba(255,255,255,.3)"/>',
  straw: '<path d="M6 20 L10 4 M9 20 L12 4 M12 20 L14 4 M15 20 L16 4 M18 20 L18 5" stroke="C" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="12" width="13" height="2.4" fill="#8a5a2a"/>',
  wool: '<circle cx="8" cy="13" r="5" fill="C"/><circle cx="14" cy="10" r="5.5" fill="C"/><circle cx="16" cy="15" r="4.5" fill="C"/><circle cx="11" cy="16" r="4" fill="C"/>',
  thread: '<rect x="6" y="4" width="12" height="16" rx="2" fill="#8a6440"/><rect x="7" y="7" width="10" height="10" fill="C"/><path d="M7 9 H17 M7 12 H17 M7 15 H17" stroke="rgba(0,0,0,.18)"/>',
  cloth: '<path d="M4 7 L18 5 L20 17 L6 19 Z" fill="C"/><path d="M6 10 L19 8 M7 14 L19.5 12" stroke="rgba(0,0,0,.15)"/>',
  flax: '<path d="M12 21 L12 8" stroke="#6a9a48" stroke-width="2"/><circle cx="12" cy="6" r="3.5" fill="C"/><circle cx="12" cy="6" r="1.2" fill="#f0e070"/>',
  brick: '<rect x="3" y="7" width="18" height="10" rx="1.5" fill="C"/><path d="M3 12 H21 M10 7 V12 M14 12 V17" stroke="rgba(0,0,0,.2)"/>',
  berry: '<circle cx="9" cy="14" r="4.5" fill="C"/><circle cx="15" cy="12" r="4.5" fill="C"/><path d="M12 7 Q14 3 18 4" stroke="#5a8a3a" stroke-width="2" fill="none"/>',
  oil: '<path d="M9 4 H15 V7 Q19 9 19 14 Q19 20 12 20 Q5 20 5 14 Q5 9 9 7Z" fill="C"/><rect x="10" y="3" width="4" height="3" fill="#7a5232"/>',
  milk: '<path d="M8 4 H16 L17 8 Q19 11 19 15 Q19 20 12 20 Q5 20 5 15 Q5 11 7 8Z" fill="C"/><path d="M8 4 H16" stroke="#b5673a" stroke-width="2"/>',
  cheese: '<path d="M3 16 L12 6 L21 13 L21 18 L3 18Z" fill="C"/><circle cx="12" cy="14" r="1.5" fill="rgba(0,0,0,.15)"/><circle cx="17" cy="15.5" r="1" fill="rgba(0,0,0,.15)"/>',
  grain: '<path d="M12 21 L12 9" stroke="#a88a40" stroke-width="2"/><ellipse cx="12" cy="7" rx="2.6" ry="4" fill="C"/><ellipse cx="8.5" cy="11" rx="2" ry="3.3" fill="C" transform="rotate(-30 8.5 11)"/><ellipse cx="15.5" cy="11" rx="2" ry="3.3" fill="C" transform="rotate(30 15.5 11)"/>',
  bean: '<ellipse cx="8" cy="13" rx="3.5" ry="4.5" fill="C" transform="rotate(-20 8 13)"/><ellipse cx="15" cy="11" rx="3.5" ry="4.5" fill="C" transform="rotate(20 15 11)"/>',
  veg: '<ellipse cx="12" cy="14" rx="6" ry="6" fill="C"/><path d="M12 8 Q10 3 7 3 M12 8 Q14 3 17 4" stroke="#5a8a3a" stroke-width="2" fill="none"/>',
  bread: '<path d="M3 15 Q3 8 12 8 Q21 8 21 15 Q21 18 12 18 Q3 18 3 15Z" fill="C"/><path d="M8 11 L9 14 M12 10 L12 14 M16 11 L15 14" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/>',
  bowl: '<path d="M3 11 H21 Q20 19 12 19 Q4 19 3 11Z" fill="#6a4a3a"/><ellipse cx="12" cy="11" rx="9" ry="2.6" fill="C"/>',
  rod: '<path d="M5 20 L19 4" stroke="#7a5a3a" stroke-width="3.5" stroke-linecap="round"/><path d="M7 18 L9 16 M11 13.5 L13 11.5 M15 9 L17 7" stroke="C" stroke-width="3.5"/>',
  seed: '<path d="M7 7 Q12 4 17 7 L18 19 Q12 21 6 19Z" fill="#c8a878"/><path d="M8 7 Q12 9 16 7" stroke="#8a6440" fill="none"/><circle cx="12" cy="14" r="2.6" fill="C"/>',
  sack: '<path d="M7 6 Q12 3 17 6 L19 18 Q12 21 5 18Z" fill="C"/><path d="M8 6 Q12 8 16 6" stroke="#8a6440" fill="none" stroke-width="1.5"/>',
  drop: '<path d="M12 3 Q18 11 18 15 A6 6 0 0 1 6 15 Q6 11 12 3Z" fill="C"/>',
  coin: '<circle cx="12" cy="12" r="8" fill="C"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>',
  bag: '<path d="M6 9 H18 L19 20 H5Z" fill="C"/><path d="M9 9 Q9 4 12 4 Q15 4 15 9" stroke="C" stroke-width="2" fill="none"/>',
  sun: '<circle cx="12" cy="12" r="5" fill="C"/><path d="M12 2V5M12 19V22M2 12H5M19 12H22M5 5L7 7M17 17L19 19M5 19L7 17M17 7L19 5" stroke="C" stroke-width="2"/>',
  moon: '<path d="M15 3 A9 9 0 1 0 21 15 A7 7 0 1 1 15 3Z" fill="C"/>',
  rain: '<path d="M6 14 Q3 14 3 11 Q3 8 7 8 Q8 4 12 4 Q17 4 17 9 Q21 9 21 12 Q21 14 18 14Z" fill="C"/><path d="M8 17 L7 20 M12 17 L11 20 M16 17 L15 20" stroke="#8ac0f0" stroke-width="1.8"/>',
  tool: '<path d="M5 19 L15 9" stroke="#8a6440" stroke-width="3" stroke-linecap="round"/><path d="M13 5 L19 11 L16 12 L12 8Z" fill="C"/>',
  meat: '<path d="M5 15 Q3 8 10 6 Q18 4 19 11 Q20 17 13 18 Q8 19 5 15Z" fill="C"/><circle cx="7" cy="16" r="2.2" fill="#f0e6d0"/><circle cx="13" cy="11" r="2" fill="rgba(255,255,255,.25)"/>',
  hide: '<path d="M6 4 L9 7 L15 7 L18 4 L19 10 L17 13 L18 20 L12 18 L6 20 L7 13 L5 10Z" fill="C"/>',
  bone: '<path d="M6 6 L18 18" stroke="C" stroke-width="3.5" stroke-linecap="round"/><circle cx="5" cy="7.5" r="2.2" fill="C"/><circle cx="7.5" cy="5" r="2.2" fill="C"/><circle cx="16.5" cy="19" r="2.2" fill="C"/><circle cx="19" cy="16.5" r="2.2" fill="C"/>',
  horn: '<path d="M6 20 Q4 10 12 5 Q18 2 20 5 Q14 6 12 11 Q10 16 10 20Z" fill="C"/>',
  feather: '<path d="M18 3 Q8 6 6 18 L8 20 Q18 14 18 3Z" fill="C"/><path d="M6 20 L15 8" stroke="rgba(0,0,0,.3)"/>',
  arrow: '<path d="M4 20 L18 6" stroke="#8a6440" stroke-width="2"/><path d="M18 6 L14 6 L18 2 L18 6 L22 6 L18 10Z" fill="C"/><path d="M4 20 L3 16 M4 20 L8 21" stroke="#e8e0d0" stroke-width="2"/>',
  herb: '<path d="M12 21 L12 9" stroke="#5a8a3a" stroke-width="2"/><ellipse cx="8" cy="10" rx="4" ry="2.4" fill="C" transform="rotate(-30 8 10)"/><ellipse cx="16" cy="8" rx="4" ry="2.4" fill="C" transform="rotate(30 16 8)"/><ellipse cx="12" cy="5" rx="2.4" ry="3.5" fill="C"/>',
  flower: '<circle cx="12" cy="9" r="3" fill="#f0d040"/><circle cx="12" cy="4.5" r="3" fill="C"/><circle cx="16.5" cy="9" r="3" fill="C"/><circle cx="12" cy="13.5" r="3" fill="C"/><circle cx="7.5" cy="9" r="3" fill="C"/><path d="M12 13 L12 22" stroke="#5a8a3a" stroke-width="2"/>',
  fish: '<path d="M3 12 Q8 5 15 8 L20 5 L19 12 L20 19 L15 16 Q8 19 3 12Z" fill="C"/><circle cx="7" cy="11" r="1.2" fill="#1a1210"/>',
  sword: '<path d="M5 19 L17 7 L19 5 L17 9 L5 21Z" fill="C"/><path d="M4 16 L8 20" stroke="#8a6440" stroke-width="2.5" stroke-linecap="round"/>',
  sling: '<circle cx="15" cy="16" r="4" fill="C"/><path d="M6 4 Q9 12 13 14 M6 4 Q14 8 17 13" stroke="#8a6440" stroke-width="1.6" fill="none"/>',
  bow: '<path d="M6 3 Q20 12 6 21" stroke="C" stroke-width="2.5" fill="none"/><path d="M6 3 L6 21" stroke="#e8e0d0" stroke-width="1"/>',
  star: '<path d="M12 2 L14.6 9 L22 9.3 L16.2 13.9 L18.2 21 L12 16.9 L5.8 21 L7.8 13.9 L2 9.3 L9.4 9Z" fill="C"/>',
  shield: '<path d="M12 2 L20 5 Q20 15 12 22 Q4 15 4 5Z" fill="C"/>',
  cloud: '<path d="M6 18 Q2 18 2 14 Q2 10 6.5 10 Q7.5 5 12.5 5 Q18 5 18.5 10.5 Q22 11 22 14.5 Q22 18 18 18Z" fill="C"/>',
  storm: '<path d="M6 15 Q2 15 2 11.5 Q2 8 6.5 8 Q7.5 3.5 12.5 3.5 Q18 3.5 18.5 8.5 Q22 9 22 12 Q22 15 18 15Z" fill="C"/><path d="M13 13 L9.5 18.5 H12.5 L10.5 23 L16 16.5 H13 L15 13Z" fill="#ffd24a"/>',
  wind: '<path d="M3 9 H14 A3 3 0 1 0 11 6 M3 13 H19 A3 3 0 1 1 16 16 M3 17 H10" stroke="C" stroke-width="2" fill="none" stroke-linecap="round"/>',
  dust: '<path d="M4 8 H15 A3 3 0 1 0 12 5 M2 12 H18 A3 3 0 1 1 15 15" stroke="C" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="6" cy="17" r="1.2" fill="C"/><circle cx="11" cy="19" r="1" fill="C"/><circle cx="17" cy="20" r="1.3" fill="C"/>',
  fog: '<path d="M3 8 H21 M5 12 H19 M3 16 H21 M7 20 H17" stroke="C" stroke-width="2" stroke-linecap="round"/>',
  fire: '<path d="M12 2 Q15 7 17 9 Q20 13 18 17 Q16 22 12 22 Q7 22 6 17 Q5 13 8 10 Q8 13 10 14 Q9 8 12 2Z" fill="C"/><path d="M12 12 Q14 15 14 17 Q14 20 12 20 Q10 20 10 17.5 Q10 15 12 12Z" fill="#ffe08a"/>',
  hammer: '<path d="M10 11 L19 20" stroke="#8a6440" stroke-width="3" stroke-linecap="round"/><path d="M4 7 L9 2 L15 8 L13 10 L10 7 L7 10Z" fill="C"/>',
  house: '<path d="M3 11 L12 4 L21 11 V20 H3Z" fill="C"/><rect x="10" y="14" width="4" height="6" fill="#4a3222"/>',
  donkey: '<path d="M5 12 Q5 9 9 9 H15 Q17 9 18 7 L17 3 L19 6 L20 3 L20.5 7 Q22 9 21 11 L19 12 Q18 15 16 15 V20 H14.5 V15.5 H9.5 V20 H8 V15 Q5 15 5 12Z" fill="C"/><path d="M5 11 Q3 12 3 15" stroke="C" stroke-width="1.5" fill="none"/>',
  map: '<path d="M3 5 L9 3 L15 5 L21 3 V19 L15 21 L9 19 L3 21Z" fill="C"/><path d="M9 3 V19 M15 5 V21" stroke="rgba(0,0,0,.25)"/>',
  move: '<circle cx="12" cy="12" r="9" fill="none" stroke="C" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="C"/><path d="M12 1 L10 4 H14Z M12 23 L10 20 H14Z M1 12 L4 10 V14Z M23 12 L20 10 V14Z" fill="C"/>',
  look: '<path d="M2 12 Q12 3 22 12 Q12 21 2 12Z" fill="none" stroke="C" stroke-width="2"/><circle cx="12" cy="12" r="3.4" fill="C"/>',
  eye: '<path d="M2 12 Q12 4 22 12 Q12 20 2 12Z" fill="C"/><circle cx="12" cy="12" r="3.6" fill="#1a1210"/><circle cx="13.2" cy="10.8" r="1.1" fill="#fff"/>',
  tap: '<circle cx="12" cy="9" r="6" fill="none" stroke="C" stroke-width="1.6" opacity=".6"/><path d="M10 9 V18 L8 16 Q7 15.4 6.4 16.4 L10 21 H17 L18 15 Q18 13 16 13 H12 V9 Q12 7.6 11 7.6 Q10 7.6 10 9Z" fill="C"/>',
  jump: '<path d="M12 3 L18 10 H14 V16 H10 V10 H6Z" fill="C"/><path d="M4 21 H20" stroke="C" stroke-width="2.4" stroke-linecap="round"/>',
  run: '<circle cx="14.5" cy="4.5" r="2.4" fill="C"/><path d="M13 8 L9 12 L11 14 L8 20 M13 8 L16 12 L20 12 M11 14 L15 16 L14 21 M9 12 L5 11" stroke="C" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  chain: '<rect x="3" y="9" width="8" height="6" rx="3" fill="none" stroke="C" stroke-width="2"/><rect x="13" y="9" width="8" height="6" rx="3" fill="none" stroke="C" stroke-width="2"/><path d="M9 12 H15" stroke="C" stroke-width="2"/>',
  pray: '<path d="M12 3 Q10 8 9 12 L7 19 H11 L12 14 L13 19 H17 L15 12 Q14 8 12 3Z" fill="C"/>',
  heart: '<path d="M12 20 Q3 14 3 8.5 Q3 5 6.5 5 Q9.5 5 12 8 Q14.5 5 17.5 5 Q21 5 21 8.5 Q21 14 12 20Z" fill="C"/>',
};
function icon(ic, col) { return `<svg viewBox="0 0 24 24" aria-hidden="true">${(IC[ic] || IC.sack).replace(/"C"/g, '"' + (col || '#e5b552') + '"')}</svg>`; }
UI.icon = icon;
const itemIcon = k => { const it = Game.ITEMS[k]; return icon(it ? it.ic : 'sack', it ? it.c : '#ccc'); }; UI.itemIcon = itemIcon;

// ------------------------------------------------------------------ sizing
const canvas = $('view');
UI.resize = function () {
  UI.W = innerWidth; UI.H = innerHeight; const dpr = (Game.dpr || Math.min(devicePixelRatio || 1, 2)) * ((Game.perf && Game.perf.scale) || 1);
  UI.cw = Math.round(UI.W * dpr); UI.ch = Math.round(UI.H * dpr); canvas.width = UI.cw; canvas.height = UI.ch;
  document.body.classList.toggle('portrait', UI.H > UI.W * 1.05); UI.applyUIScale(); UI.checkRotate();
};
/* UI scale. A phone that lays the page out at desktop width (a scaled-down preview frame, "desktop site" mode, a missing
   viewport) makes every button and label tiny: detect it from the real screen width and zoom the HUD back up. */
const UIK = { s: 0.88, m: 1, l: 1.14, xl: 1.3 };
UI.applyUIScale = function () {
  const SET = Game.SET || {}, sw = Math.min(screen.width || 0, screen.height || 0), lw = Math.max(screen.width || 0, screen.height || 0);
  const devW = UI.W > UI.H ? lw : sw; let k = 1;
  if (matchMedia('(pointer:coarse)').matches && devW > 200 && UI.W > devW * 1.2) k = Math.min(4, UI.W / devW);
  if (window.visualViewport && visualViewport.scale > 0 && visualViewport.scale < 0.8 && k === 1 && matchMedia('(pointer:coarse)').matches) k = Math.min(4, 1 / visualViewport.scale);
  UI.uiK = k * (UIK[SET.ui] || 1); document.documentElement.style.setProperty('--uik', UI.uiK.toFixed(3));
};
// phones held sideways get a "please rotate" card (landscape HUD is cramped on phones); tablets & PCs are unaffected
let rotOk = false; try { rotOk = sessionStorage.getItem('genesisRotOk') === '1'; } catch (e) { }
const coarse = matchMedia('(pointer:coarse)');
UI.checkRotate = function () {
  const want = Game.mode === 'play' && !rotOk && coarse.matches && UI.W > UI.H && UI.H < 520;
  if (want === busyFlags.rot) return; busyFlags.rot = want; $('rotate').hidden = !want;
};
$('rotGo').onclick = () => { rotOk = true; try { sessionStorage.setItem('genesisRotOk', '1'); } catch (e) { } UI.checkRotate(); };
addEventListener('resize', () => UI.resize());
addEventListener('orientationchange', () => setTimeout(() => UI.resize(), 250));

// ------------------------------------------------------------------ input
/* floating thumb sticks. Robust against lost touch-ends (the game runs inside an iframe: a finger that slides off the
   frame, a system gesture or a dialog popping up can swallow pointerup) — a new touch always takes the stick over, and
   when no finger is left on the screen the stick is released. */
const STICKS = [];
function stick(zone, el, cb) {
  const knob = el.querySelector('.knob'), R = 50, st = { id: null, ox: 0, oy: 0 };
  const zk = () => { const r = zone.getBoundingClientRect(); return zone.offsetWidth ? Math.max(0.2, r.width / zone.offsetWidth) : 1; };
  const place = () => { const r = zone.getBoundingClientRect(), k = zk(); el.style.left = (st.ox - r.left) / k + 'px'; el.style.top = (st.oy - r.top) / k + 'px'; };
  const release = () => { if (st.id === null) return; const id = st.id; st.id = null; try { zone.releasePointerCapture(id); } catch (_) { }
    el.style.left = ''; el.style.top = ''; el.classList.remove('live'); knob.style.transform = ''; cb(0, 0); };
  zone.addEventListener('pointerdown', e => { if (st.id !== null) release(); st.id = e.pointerId; try { zone.setPointerCapture(st.id); } catch (_) { }
    st.ox = e.clientX; st.oy = e.clientY; place(); el.classList.add('live'); cb(0, 0); e.preventDefault(); });
  addEventListener('pointermove', e => { if (e.pointerId !== st.id) return; const z = zk(), Rv = R * z; let dx = e.clientX - st.ox, dy = e.clientY - st.oy; const d = Math.hypot(dx, dy);
    if (d > Rv) { const k = Rv / d; st.ox += dx - dx * k; st.oy += dy - dy * k; place(); dx *= k; dy *= k; } // drag the base along for smoother control
    knob.style.transform = `translate(${dx / z}px,${dy / z}px)`; cb(dx / Rv, dy / Rv); }, true);
  const end = e => { if (e.pointerId === st.id) release(); };
  for (const t of ['pointerup', 'pointercancel']) { zone.addEventListener(t, end); addEventListener(t, end, true); }
  zone.addEventListener('lostpointercapture', end);
  addEventListener('touchend', e => { if (e.touches.length === 0) release(); }, true); addEventListener('touchcancel', e => { if (e.touches.length === 0) release(); }, true);
  addEventListener('touchstart', e => { if (st.id !== null && e.touches.length === 1 && !zone.contains(e.target)) release(); }, true); // our finger is gone if this is the only one
  STICKS.push(release);
}
UI.releaseSticks = () => STICKS.forEach(f => f());
addEventListener('blur', () => UI.releaseSticks()); document.addEventListener('visibilitychange', () => { if (document.hidden) UI.releaseSticks(); });
stick($('zoneL'), $('stickL'), (x, y) => { Game.INPUT.mx = x; Game.INPUT.my = y; });
stick($('zoneR'), $('stickR'), (x, y) => { Game.INPUT.cx = x; Game.INPUT.cy = y; });
const btnA = $('btnA');
btnA.addEventListener('pointerdown', e => { e.preventDefault(); Game.INPUT.actHeld = true; if (mgHold) { mgHold(true); return; } Game.pressAction(); });
const relA = () => { Game.INPUT.actHeld = false; if (mgHold) mgHold(false); };
btnA.addEventListener('pointerup', relA); btnA.addEventListener('pointercancel', relA); btnA.addEventListener('pointerleave', relA);
$('btnJump').addEventListener('pointerdown', e => { e.preventDefault(); if (G.Combat && G.Combat.inCombat && G.Combat.dodge()) return; Game.jump(); });
for (const t of ['pointerup', 'pointercancel', 'pointerleave']) $('btnJump').addEventListener(t, () => Game.jumpRelease()); // hold for a full jump, tap for a hop
$('btnAtk').addEventListener('pointerdown', e => { e.preventDefault(); G.Combat && G.Combat.attack(); });
$('wpnBtn').onclick = () => G.Combat && G.Combat.toggleMode();
$('btnRun').addEventListener('pointerdown', e => { e.preventDefault(); Game.toggleSprint(); });
$('btnCrouch').addEventListener('pointerdown', e => { e.preventDefault(); if (!UI.busy()) G.Vitals && G.Vitals.crouch(); });
$('seedBtn').onclick = () => Game.cycleSeed();
$('waterBtn').onclick = () => UI.toast(Game.water() > 0 ? `항아리의 물 ${Game.S().water}/${Game.S().jarMax}` : '우물이나 물가에서 물을 길을 수 있어요');
$('bagBtn').onclick = () => UI.menu('bag');
// 손 버튼: 빈손 → 가진 도구들 → 빈손… 차례로 바꿔 듭니다 (한 번에 하나만)
$('handBtn').onclick = () => { if (UI.busy() || (G.Cine && G.Cine.on)) return; const S = Game.S(); const ks = [null, ...Object.keys(S.tools).filter(k => S.tools[k] && Game.TOOL_PROP[k])]; Game.hold(ks[(ks.indexOf(Game.hand()) + 1) % ks.length]); };
$('menuBtn').onclick = () => UI.menu('journal');
$('questBox').onclick = () => UI.menu('journal');
addEventListener('keydown', e => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  Game.INPUT.keys[e.code] = true;
  if (Game.mode !== 'play') return;
  if (e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); if (!e.repeat) { Game.INPUT.actHeld = true; if (mgHold) mgHold(true); else Game.pressAction(); } }
  else if (e.code === 'Space') { e.preventDefault(); if (busyFlags.narr) nextCard(); else if (busyFlags.dialog) UI.advance(); else if (!busyFlags.panel) Game.jump(); }
  else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') Game.P.sprint = true;
  else if (e.code === 'Tab' || e.code === 'KeyI') { e.preventDefault(); if (busyFlags.panel) { if (!panelLock) UI.closePanel(); } else if (!UI.busy()) UI.menu('bag'); }
  else if (e.code === 'Escape') { if (busyFlags.panel) { if (!panelLock) UI.closePanel(); } else if (!UI.busy()) UI.menu('journal'); }
  else if (e.code === 'KeyQ') Game.cycleSeed();
  else if (e.code === 'KeyF') { G.Combat && G.Combat.attack(); }
  else if (e.code === 'KeyC') { if (G.Combat && G.Combat.inCombat) G.Combat.dodge(); else if (!UI.busy()) G.Vitals && G.Vitals.crouch(); }
  else if (e.code === 'ControlLeft') { if (!UI.busy()) G.Vitals && G.Vitals.crouch(); }
  else if (e.code === 'KeyT') { G.Combat && G.Combat.toggleMode(); }
  else if (e.code === 'KeyM') { if (!UI.busy()) UI.bigMap(); }
  else if (e.code === 'KeyR') { if (G.Build && G.Build.placing) G.Build.rotate(); else UI.rideBtn(); }
});
addEventListener('keyup', e => { Game.INPUT.keys[e.code] = false; if (e.code === 'KeyE' || e.code === 'Enter') { Game.INPUT.actHeld = false; if (mgHold) mgHold(false); } if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') Game.P.sprint = false; if (e.code === 'Space') Game.jumpRelease(); });
addEventListener('blur', () => { for (const k in Game.INPUT.keys) Game.INPUT.keys[k] = false; Game.INPUT.actHeld = false; });
// swipe-look: dragging on open screen (outside the stick zones and buttons) turns the camera directly
{ let did = null, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', e => { if (did !== null || Game.mode !== 'play' || UI.busy()) return; did = e.pointerId; lx = e.clientX; ly = e.clientY; try { canvas.setPointerCapture(did); } catch (_) { } });
  canvas.addEventListener('pointermove', e => { if (e.pointerId !== did) return; Game.camDrag(e.clientX - lx, e.clientY - ly); lx = e.clientX; ly = e.clientY; });
  const up = e => { if (e.pointerId === did) did = null; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up); }
// v15: the page itself must never zoom (pinch, double-tap, iOS gestures); if a zoom sneaks in anyway, snap it back
{ const stop = e => e.preventDefault();
  for (const n of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(n, stop, { passive: false });
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let lastTap = 0; document.addEventListener('touchend', e => { const t = Date.now(); if (t - lastTap < 350) e.preventDefault(); lastTap = t; }, { passive: false });
  document.addEventListener('dblclick', stop, { passive: false });
  const vp = document.querySelector('meta[name=viewport]'); let fixing = false;
  const unzoom = () => { if (fixing || !window.visualViewport || visualViewport.scale <= 1.02 || !vp) return; fixing = true; const c = vp.content; vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'; scrollTo(0, 0); setTimeout(() => { vp.content = c; fixing = false; UI.resize(); }, 120); };
  if (window.visualViewport) { visualViewport.addEventListener('resize', unzoom); visualViewport.addEventListener('scroll', unzoom); } }
canvas.addEventListener('dblclick', () => { Game.CAM.zoom = 1; });
canvas.addEventListener('wheel', e => { Game.CAM.zoom = Math.max(0.6, Math.min(1.6, (Game.CAM.zoom || 1) * (e.deltaY > 0 ? 1.08 : 0.93))); }, { passive: true });

// ------------------------------------------------------------------ toast / gains / day card
let toastT = 0;
// v16.1 조작 모드: 모바일(터치) / 데스크탑(키보드·마우스) / 자동. On touch, keyboard hints like "(키보드: WASD)" are taken out of
// every popup; on desktop the on-screen sticks and buttons are hidden and a key legend is shown instead.
UI.isDesk = () => { const m = Game.SET.input || 'auto'; return m === 'desk' || (m === 'auto' && !matchMedia('(pointer:coarse)').matches); };
const KEYRX = /(?:키보드|Shift|스페이스|WASD|방향키|Space|Enter|Tab|Esc|Ctrl|마우스|[A-Z] ?키|\b[A-Z]\b(?= ?(?:키|로|를|·|\))))/;
UI.txt = s => { if (!s) return s; if (UI.isDesk()) return String(s).replace(/(^|[^A-Za-z])A 버튼/g, '$1E 키').replace(/(^|[^A-Za-z])A(를|로|만|!)/g, '$1E$2'); s = String(s); // v16.9: A = the action button (the keyboard's E)
  s = s.replace(/\s*\(([^()]*)\)/g, (m, inner) => KEYRX.test(inner) || /^\s*[A-Z][a-z]{0,5}\s*$/.test(inner) ? '' : m); s = s.replace(/\s*·\s*키보드[^·]*/g, ''); s = s.replace(/\s*키보드\s*:[^·)]*/g, ''); return s.trim(); };
UI.applyMode = () => { const d = UI.isDesk(); const pk = $('promptK'); if (pk) pk.textContent = d ? 'E' : 'A'; document.body.classList.toggle('desk', d); let lg = $('keyLegend'); if (d && !lg) { lg = document.createElement('div'); lg.id = 'keyLegend'; document.body.appendChild(lg); }
  if (lg) lg.innerHTML = 'WASD 이동 · 마우스 끌기 시점 · <b>E</b> 행동 · <b>Space</b> 점프 · <b>Shift</b> 달리기 · <b>C</b> 앉기 · <b>F</b> 공격 · <b>V</b> 조준 · <b>M</b> 지도 · <b>Tab</b> 가방'; };
setTimeout(() => UI.applyMode(), 0);
/* v16.9 도움말 「간단히」 (the default): tips, toasts and new-feature cards keep only their first part(s) — the "·" pieces that fit
   in about one line — so the screen isn't covered in text. 「자세히」 shows everything, 「끄기」 hides the tips. */
const brief = () => (Game.SET.help || 'brief') === 'brief';
UI.short = function (s, max) { s = String(s || ''); if (!brief()) return s; s = s.replace(/\s*\([^()]*\)/g, ''); const parts = s.split(' · ').filter(Boolean); let out = parts[0] || '';
  for (let i = 1; i < parts.length && (out + ' · ' + parts[i]).length <= max; i++) out += ' · ' + parts[i];
  out = out.replace(/\s*\([^)]*\)\s*$/, ''); return out.length > max + 8 ? out.slice(0, max + 6).replace(/\s+\S*$/, '') + '…' : out; };
UI.toast = function (m, full) { const t = $('toast'); t.textContent = full ? UI.txt(m) : UI.short(UI.txt(m), 36); t.classList.add('show'); toastT = 2.6; };
UI.gain = function (k, n) {
  G.Audio && G.Audio.sfx('pickup', { pitch: 0.95 + Math.random() * 0.15, gap: 0.08 });
  const it = Game.ITEMS[k]; if (!it) return; const box = $('gains');
  const el = document.createElement('div'); el.className = 'gain'; el.innerHTML = itemIcon(k) + `<span>${esc(it.n)} +${n}</span>`; box.appendChild(el);
  while (box.children.length > 5) box.removeChild(box.firstChild);
  setTimeout(() => { el.remove(); }, 2200);
};
UI.dayCard = function (day, weather, msg) {
  $('dcT').textContent = `${day}일째 아침`; $('dcS').textContent = msg || (weather === 'rain' ? '비가 내려 밭이 촉촉해졌어요' : '새날이 밝았어요');
  const c = $('daycard'); c.classList.add('show'); setTimeout(() => c.classList.remove('show'), 2300);
};
UI.fade = function (mid, after) { busyFlags.fade = true; $('fader').classList.add('on'); setTimeout(() => { mid && mid(); setTimeout(() => { $('fader').classList.remove('on'); setTimeout(() => { busyFlags.fade = false; after && after(); }, 380); }, 200); }, 470); };

// ------------------------------------------------------------------ dialogue
let DL = null, typeT = null;
UI.say = function (lines, done) { DL = { lines: lines.slice(), i: 0, done }; busyFlags.dialog = true; $('dialog').hidden = false; showLine(); };
UI.speaker = () => (G.Cine && G.Cine.on && G.Cine.speaker !== undefined && !DL) ? G.Cine.speaker : DL && DL.lines[DL.i] && DL.lines[DL.i].n;
UI.inDialog = () => !!DL;
function showLine() {
  const L = DL.lines[DL.i]; const nm = L.n || ''; $('dName').textContent = nm; $('dText').classList.toggle('n', !nm); $('dRef').textContent = L.ref || '';
  $('dChoices').hidden = true; $('dChoices').innerHTML = ''; $('dNext').hidden = true;
  if (L.fn) L.fn();
  DL.full = UI.txt(L.t || ''); DL.typing = true; let k = 0; clearInterval(typeT); $('dText').textContent = '';
  const myDL = DL, myI = DL.i;
  typeT = setInterval(() => { k += 2; $('dText').textContent = DL.full.slice(0, k); if (k >= DL.full.length) finishType(); }, 24);
}
function finishType() {
  if (!DL) return; clearInterval(typeT); DL.typing = false; $('dText').textContent = DL.full; const L = DL.lines[DL.i];
  if (L.choices) { const ch = $('dChoices'); ch.hidden = false; ch.innerHTML = '';
    /* v16.9 a story question (some answers wrong) shows its answers in a fresh random order every time, so the right one isn't
       always first and you have to read them; menus (안부·선물·작별, 고르기) keep their order */
    let opts = L.choices; if (opts.some(c => c.ok === false || c.fb)) { opts = opts.slice(); for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; } }
    opts.forEach(c => { const b = document.createElement('button'); b.textContent = c.t; b.onclick = ev => { ev.stopPropagation(); pick(c); }; ch.appendChild(b); }); }
  else { $('dNext').hidden = false; // 대사 자동 넘김 (설정): give the player time to read, longer for longer lines
    if (Game.SET.auto === 'on') { const myDL = DL, myI = DL.i; setTimeout(() => { if (DL === myDL && DL.i === myI && !DL.typing) nextLine(); }, 1400 + DL.full.length * 55); } }
}
function pick(c) {
  const L = DL.lines[DL.i];
  if (c.ok !== false && !c.fb) { if (c.reply) DL.lines.splice(DL.i + 1, 0, { n: c.rn === undefined ? Game.EP().hero : c.rn, t: c.reply, ref: c.ref }); if (c.then) c.then(); if (c.lines) DL.lines.splice(DL.i + 1, 0, ...c.lines); nextLine(); }
  else { DL.lines.splice(DL.i + 1, 0, { n: '', t: c.fb }, L); nextLine(); }
}
function nextLine() { G.Audio && G.Audio.sfx('blip', { vol: 0.5 }); DL.i++; if (DL.i >= DL.lines.length) { const d = DL.done; DL = null; busyFlags.dialog = false; UI.lastTalk = performance.now(); $('dialog').hidden = true; for (const id in Game.ENT.npcs) Game.ENT.npcs[id].talking = false; d && d(); } else showLine(); }
UI.advance = function () { if (busyFlags.narr) { nextCard(); return; } if (!DL) return; if (DL.typing) { finishType(); return; } if (DL.lines[DL.i].choices) return; nextLine(); };
$('dialog').addEventListener('click', UI.advance);

// ------------------------------------------------------------------ narration
let NR = null;
UI.narr = function (cards, done) { NR = { cards, i: 0, done }; busyFlags.narr = true; $('narr').hidden = false; showCard(); };
function showCard() { G.Audio && G.Audio.sfx('page', { vol: 0.7 }); const c = NR.cards[NR.i]; $('nKick').textContent = c.kick || ''; $('nTitle').textContent = c.title || ''; $('nTitle').hidden = !c.title; $('nText').textContent = UI.txt(c.t || ''); $('nRef').textContent = c.ref || ''; NR.lock = performance.now() + (c.anim ? 2600 : 380); if (c.anim) c.anim($('nTitle'), $('nText'), $('nRef')); if (c.fn) c.fn(); }
function nextCard() { if (!NR || performance.now() < NR.lock) return; NR.i++; if (NR.i >= NR.cards.length) { const d = NR.done; NR = null; busyFlags.narr = false; $('narr').hidden = true; d && d(); } else showCard(); }
$('narr').addEventListener('click', nextCard);
UI.nextCard = nextCard;

// ------------------------------------------------------------------ panels
let panelClose = null, panelLock = false; // v16.8 panelLock: a story puzzle can't be closed by tapping outside or Esc (the story would hang)
function openPanel(title, tabs, cur, render, onClose) {
  if (panelLock) return; // a story puzzle is open: nothing may replace it
  busyFlags.panel = true; $('panelWrap').hidden = false; panelClose = onClose || null;
  const P = $('panel'); P.innerHTML = `<div class="p-head"><h3>${esc(title)}</h3><button class="p-x" id="pX">닫기</button></div>` + (tabs ? `<div class="tabs" id="pTabs">${tabs.map(t => `<button data-t="${t[0]}" class="${t[0] === cur ? 'on' : ''}">${esc(t[1])}</button>`).join('')}</div>` : '') + `<div class="p-body" id="pBody"></div>`;
  $('pX').onclick = UI.closePanel;
  if (tabs) $('pTabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; [...$('pTabs').children].forEach(x => x.classList.toggle('on', x === b)); render(b.dataset.t, $('pBody')); };
  render(cur, $('pBody'));
}
UI.openPanel = openPanel;
UI.closePanel = function () { panelLock = false; busyFlags.panel = false; $('panelWrap').hidden = true; $('panel').innerHTML = ''; const c = panelClose; panelClose = null; c && c(); UI.hud(); Game.checkStep(); };
$('panelWrap').addEventListener('pointerdown', e => { if (e.target !== $('panelWrap')) return; if (panelLock) { UI.toast('이 퍼즐을 마쳐야 이야기가 이어져요'); return; } UI.closePanel(); });
const costHTML = (cost, silver) => { const S = Game.S(); let h = ''; for (const k in cost || {}) { const ok = Game.have(k, cost[k]); h += `<em class="${ok ? '' : 'no'}">${esc(Game.ITEMS[k].n)} ${Game.inv(k)}/${cost[k]}</em>`; } if (silver) h += `<em class="${S.silver >= silver ? '' : 'no'}">은 ${S.silver}/${silver}</em>`; return `<div class="cost">${h}</div>`; };

UI.menu = function (tab) {
  if (UI.busy()) return;
  const tabs = [['bag', '가방'], ['gear', '장비'], ['craft', '제작']].concat(Game.feat('build') && G.Build ? [['build', '짓기']] : []).concat([['skill', '깨달음'], ['quest', '부탁'], ['journal', '일지'], ['set', '설정']]);
  openPanel('여정 메뉴', tabs, tabs.some(t => t[0] === tab) ? tab : 'bag', renderMenu);
};
function renderMenu(tab, body) {
  const S = Game.S(), EP = Game.EP();
  if (tab === 'build') { G.Build.renderMenu(body, () => renderMenu('build', body)); }
  else if (tab === 'bag') {
    const items = Object.keys(S.inv).filter(k => S.inv[k] > 0 && Game.ITEMS[k]);
    const tools = Object.keys(S.tools).filter(k => S.tools[k]);
    body.innerHTML = `<div class="sec">도구</div><div class="grid">${tools.length ? tools.map(k => `<div class="card">${icon('tool', Game.hand() === k ? '#f0d8b0' : '#c8c0b0')}<div class="t"><b>${esc(Game.TOOLS[k])}</b><span>${k === 'jar' || k === 'bigjar' ? `물 ${S.water}/${S.jarMax}` : Game.hand() === k ? '손에 들고 있어요' : '가방 속'}</span></div>${Game.TOOL_PROP[k] ? `<button class="sbtn" data-hold="${Game.hand() === k ? '' : k}">${Game.hand() === k ? '내려놓기' : '손에 들기'}</button>` : ''}</div>`).join('') : '<div class="card"><div class="t"><span>아직 도구가 없어요. 제작 탭에서 만들 수 있어요.</span></div></div>'}</div>
      <div class="sec">소지품 · 은 ${S.silver}</div><div class="grid">${items.length ? items.map(k => { const it = Game.ITEMS[k]; return `<div class="card">${itemIcon(k)}<div class="t"><b>${esc(it.n)}</b><span>×${S.inv[k]}</span></div>${it.stam || it.hp || (G.Surv && G.Surv.food(k) > 0) ? `<button class="sbtn" data-eat="${k}">먹기</button>` : ''}</div>`; }).join('') : '<div class="card"><div class="t"><span>비어 있어요</span></div></div>'}</div>`;
    body.onclick = e => { const b = e.target.closest('[data-eat]'); if (b) { Game.eat(b.dataset.eat); renderMenu('bag', body); } const h = e.target.closest('[data-hold]'); if (h) { Game.hold(h.dataset.hold || null); renderMenu('bag', body); } };
  } else if (tab === 'gear') {
    const C = G.Combat, H = S.hero, GE = C.GEAR, near = Game.nearStation('fire') || Game.nearStation('smith');
    const row = k => { const g = GE[k], own = !!H.gear[k], lv = C.lv(k), eq = H.weapon === k || H.ranged === k || H.armor === k;
      const stat = g.kind === 'armor' ? `방어 ${g.def + lv}` : g.kind === 'ranged' ? `피해 ${Math.round(C.wdmg(k))} · 사거리 ${g.range}m` : `피해 ${Math.round(C.wdmg(k))} · ${g.rate < 0.45 ? '빠름' : g.rate > 0.72 ? '묵직함' : '보통'}`;
      if (own) { const c = C.upCost(k); const can = lv < 5 && S.silver >= c.silver && Object.keys(c.items).every(x => Game.have(x, c.items[x]));
        return `<div class="row">${icon(g.kind === 'armor' ? 'shield' : g.kind === 'ranged' ? (g.ammo === 'stone' ? 'sling' : 'bow') : 'sword', g.rareW ? '#ffd24a' : '#e8dcc0')}<div class="t"><b>${esc(g.n)}${lv ? ` +${lv}` : ''}${eq ? ' · 사용 중' : ''}</b><span>${stat} · ${esc(g.d || '')}</span>${lv < 5 ? costHTML(c.items, c.silver) : '<span>최고 단계</span>'}</div>${eq ? '' : `<button class="sbtn" data-eq="${k}">쓰기</button>`}<button class="sbtn ${can && near ? 'pri' : ''}" data-up="${k}" ${can && near ? '' : 'disabled'}>강화</button></div>`; }
      const can = Object.keys(g.recipe || {}).every(x => Game.have(x, g.recipe[x])); const hint = g.rareW && !Object.keys(g.recipe).some(x => Game.have(x)) ;
      return `<div class="row">${icon(g.kind === 'armor' ? 'shield' : g.kind === 'ranged' ? (g.ammo === 'stone' ? 'sling' : 'bow') : 'sword', '#8a8070')}<div class="t"><b>${hint ? '??? (희귀한 재료가 필요해요)' : esc(g.n)}</b><span>${hint ? '사냥하다 보면 희귀한 뼈나 뿔을 얻을 수 있어요' : stat + ' · ' + esc(g.d || '')}</span>${hint ? '' : costHTML(g.recipe)}</div><button class="sbtn ${can ? 'pri' : ''}" data-mk="${k}" ${can ? '' : 'disabled'}>만들기</button></div>`; };
    const keys = Object.keys(GE).filter(k => k !== 'staff' && (GE[k].recipe || H.gear[k]));
    body.innerHTML = `<div class="row"><div class="t"><b>근접 · ${esc(H.weapon ? GE[H.weapon].n : Game.tool('staff') ? '목자의 지팡이' : '없음')} / 원거리 · ${esc(H.ranged ? GE[H.ranged].n : '없음')} / 방어구 · ${esc(H.armor ? GE[H.armor].n : '없음')}</b><span>강화는 모닥불이나 대장장이 곁에서 할 수 있어요${near ? ' · 지금 가능' : ''}. 공격 버튼(PC: F), 구르기(C), 무기 바꾸기(T)</span></div></div>
      <div class="sec">가진 장비</div>${Object.keys(H.gear).map(row).join('') || '<div class="row"><div class="t"><span>아직 없어요</span></div></div>'}
      <div class="sec">만들 수 있는 장비</div>${keys.filter(k => !H.gear[k]).map(row).join('')}`;
    body.onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.mk) C.craftGear(b.dataset.mk); if (b.dataset.up) C.upgrade(b.dataset.up);
      if (b.dataset.eq) { const g = GE[b.dataset.eq]; if (g.kind === 'melee') H.weapon = b.dataset.eq; else if (g.kind === 'ranged') H.ranged = b.dataset.eq; else { H.armor = b.dataset.eq; Game.refreshLook(); } G.Audio && G.Audio.sfx('click'); UI.hud(); }
      renderMenu('gear', body); };
  } else if (tab === 'skill') {
    const C = G.Combat, H = S.hero, need = 40 + H.lvl * 25;
    body.innerHTML = `<div class="stats"><div><b>Lv ${H.lvl}</b><span>체력 · 일하고 걷고 사냥하면 올라요</span><div class="bar"><i style="width:${H.xp / need * 100}%"></i></div></div><div><b>${H.hpMax}</b><span>최대 체력</span></div><div><b>${H.stamMax}</b><span>최대 기력</span></div><div><b>${H.ip}</b><span>쓸 수 있는 깨달음 (모은 깨달음 ${H.insight})</span></div></div>
      <div class="row"><div class="t"><span>깨달음은 이야기를 따라가고, 부탁을 들어주고, 하나님 앞에 엎드릴 때 얻어요. 하나를 써서 아래 능력을 한 단계 올릴 수 있어요.</span></div></div>
      ${Object.keys(C.SKILL).map(k => `<div class="row">${icon('star', H.sk[k] ? '#ffd24a' : '#8a8070')}<div class="t"><b>${esc(C.SKILL[k].n)} ${'●'.repeat(H.sk[k])}${'○'.repeat(5 - H.sk[k])}</b><span>${esc(C.SKILL[k].d)}</span></div><button class="sbtn ${H.ip > 0 && H.sk[k] < 5 ? 'pri' : ''}" data-sk="${k}" ${H.ip > 0 && H.sk[k] < 5 ? '' : 'disabled'}>배우기</button></div>`).join('')}`;
    body.onclick = e => { const b = e.target.closest('[data-sk]'); if (!b || b.disabled) return; C.learn(b.dataset.sk); renderMenu('skill', body); };
  } else if (tab === 'quest') {
    const L = G.Life, act = L.active(S), QS = EP.quests || {}, done = Object.keys((S.side || {}).done || {}).length, tr = L.tracked(S);
    body.innerHTML = `<div class="row"><div class="t"><b>맡은 부탁 ${act.length} · 마친 부탁 ${done}</b><span>이름 위에 <b style="color:var(--gold)">!</b> 표시가 있는 사람은 부탁할 일이 있어요. <b style="color:#9be0ff">?</b> 표시는 다 했으니 말을 걸어 보라는 뜻이에요.</span></div></div>` +
      (act.length ? act.map(id => { const q = QS[id], st = S.side.act[id], giver = Game.ENT.npcs[q.giver]; return `<div class="row"><div class="t"><b>${esc(q.title)}${tr && tr.id === id ? ' · 따라가는 중' : ''}</b><span>${esc(giver ? giver.name : '')} · ${esc(q.desc || '')}</span>${q.obj.map(o => `<span>${o.ok(S, Game, st) ? '✓' : '·'} ${esc(typeof o.t === 'function' ? o.t(S, Game, st) : o.t)}</span>`).join('')}</div>${tr && tr.id === id ? '' : `<button class="sbtn" data-tr="${id}">따라가기</button>`}</div>`; }).join('') : '<div class="row"><div class="t"><span>지금 맡은 부탁이 없어요. 사람들에게 말을 걸어 보세요.</span></div></div>');
    body.onclick = e => { const b = e.target.closest('[data-tr]'); if (!b) return; L.track(b.dataset.tr); renderMenu('quest', body); };
  } else if (tab === 'craft') {
    const rs = Game.recipes();
    body.innerHTML = rs.map((r, i) => { const can = Object.keys(r.in).every(k => Game.have(k, r.in[k])) && (!r.water || S.water >= r.water) && !(r.tool && S.tools[r.tool]);
      const stn = r.st ? ({ fire: '모닥불 근처', loom: '베틀 근처', press: '기름틀 근처', tan: '가죽 장인 작업대 근처', smith: '대장장이 화덕 근처' }[r.st] || '') : ''; const near = !r.st || Game.nearStation(r.st);
      let ch = costHTML(r.in); if (r.water) ch = ch.replace('</div>', `<em class="${S.water >= r.water ? '' : 'no'}">물 ${r.water}</em></div>`);
      return `<div class="row">${r.tool ? icon('tool', '#c8c0b0') : itemIcon(Object.keys(r.out)[0])}<div class="t"><b>${esc(r.n)}${r.tool && S.tools[r.tool] ? ' · 보유 중' : ''}</b><span>${esc(r.d || '')}${stn ? (r.d ? ' · ' : '') + stn + (near ? '' : ' (멀어요)') : ''}</span>${ch}</div><button class="sbtn ${can && near ? 'pri' : ''}" data-r="${i}" ${can && near ? '' : 'disabled'}>만들기</button>${!r.tool ? `<button class="sbtn" data-r5="${i}" ${can && near ? '' : 'disabled'}>×5</button>` : ''}</div>`; }).join('');
    body.onclick = e => { const b = e.target.closest('[data-r],[data-r5]'); if (!b || b.disabled) return; const r = rs[+(b.dataset.r || b.dataset.r5)]; Game.craft(r, b.dataset.r5 ? 5 : 1); renderMenu('craft', body); };
  } else if (tab === 'journal') {
    const st = Game.step(); const chs = EP.chapters; const cur = st ? st.ch : 1;
    const herdTxt = (EP.pens || []).filter(p => S.herds[p.id] && !(p.hidden && p.hidden(S))).map(p => `<div><b>${Game.herdCount(p.id)}</b><span>${esc(p.n)}</span></div>`).join('');
    body.innerHTML = `<div class="row"><div class="t"><b>지금 할 일</b><span>${esc($('qObj').textContent)}</span></div></div>
      <div class="sec">${esc(EP.title)}</div>${chs.map((c, i) => `<div class="chap ${i + 1 < cur ? 'done' : i + 1 === cur ? 'cur' : 'lock'}"><span class="s">${i + 1 < cur ? '✓' : i + 1 === cur ? '▸' : i + 1}</span><span>${esc(c.t)}</span><span class="r">${esc(c.r)}</span></div>`).join('')}
      <div class="sec">살림</div>${EP.ledger ? `<div class="sec">${esc(EP.ledger(S, Game).title)}</div><div class="stats">${EP.ledger(S, Game).rows.map(r => `<div><b>${esc(String(r[1]))}</b><span>${esc(r[0])}</span>${r[2] !== undefined ? `<div class="bar"><i style="width:${Math.min(100, r[2] * 100)}%"></i></div>` : ''}</div>`).join('')}</div>` : ''}<div class="stats"><div><b>${S.day}</b><span>지난 날수</span></div><div><b>${S.silver}</b><span>은 (세겔)</span></div><div><b>${Object.values(S.stats.harvest).reduce((a, b) => a + b, 0)}</b><span>거둔 곡식과 열매</span></div><div><b>${S.stats.born || 0}</b><span>태어난 새끼</span></div>${herdTxt}</div>`;
  } else if (tab === 'set') {
    const SET = Game.SET;
    body.innerHTML = `<div class="set"><span>도움말 표시</span><div class="seg"><button data-hl="brief" class="${(SET.help || 'brief') === 'brief' ? 'on' : ''}">간단히</button><button data-hl="on" class="${SET.help === 'on' ? 'on' : ''}">자세히</button><button data-hl="off" class="${SET.help === 'off' ? 'on' : ''}">끄기</button></div></div>
      <div class="set"><span>조작 모드</span><div class="seg">${[['auto', '자동'], ['touch', '모바일'], ['desk', '데스크탑']].map(q => `<button data-in="${q[0]}" class="${(SET.input || 'auto') === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>카메라 감도</span><input type="range" id="sSens" min="0.4" max="2" step="0.1" value="${SET.sens}"></div>
      <div class="set"><span>카메라 거리</span><input type="range" id="sDist" min="0.7" max="1.5" step="0.05" value="${SET.dist}"></div>
      <div class="set"><span>음악</span><input type="range" id="sMus" min="0" max="1" step="0.05" value="${SET.music === undefined ? 0.6 : SET.music}"></div>
      <div class="set"><span>효과음</span><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${SET.sfx === undefined ? 0.8 : SET.sfx}"></div>
      ${navigator.vibrate ? `<div class="set"><span>진동</span><div class="seg"><button data-hp="on" class="${SET.haptic !== 'off' ? 'on' : ''}">켜기</button><button data-hp="off" class="${SET.haptic === 'off' ? 'on' : ''}">끄기</button></div></div>` : ''}
      <div class="set"><span>연출 색감 (컷신 분위기 색)</span><div class="seg"><button data-cg="on" class="${SET.cgrade !== 'off' ? 'on' : ''}">켜기</button><button data-cg="off" class="${SET.cgrade === 'off' ? 'on' : ''}">끄기</button></div></div>
      <div class="set"><span>대사 자동 넘김</span><div class="seg"><button data-au="on" class="${SET.auto === 'on' ? 'on' : ''}">켜기</button><button data-au="off" class="${SET.auto !== 'on' ? 'on' : ''}">끄기</button></div></div>
      <div class="set"><span>시점</span><div class="seg"><button data-v="shoulder" class="${SET.view !== 'classic' ? 'on' : ''}">숄더뷰</button><button data-v="classic" class="${SET.view === 'classic' ? 'on' : ''}">일반 3인칭</button></div></div>
      <div class="set"><span>어깨 방향</span><div class="seg"><button data-sd="right" class="${SET.side !== 'left' ? 'on' : ''}">오른쪽</button><button data-sd="left" class="${SET.side === 'left' ? 'on' : ''}">왼쪽</button></div></div>
      <div class="set"><span>카메라 자동 따라가기</span><div class="seg"><button data-a="1" class="${SET.autoCam ? 'on' : ''}">켜기</button><button data-a="0" class="${SET.autoCam ? '' : 'on'}">끄기</button></div></div>
      <div class="set"><span>고정 시야</span><div class="seg"><button data-fx="1" class="${SET.fixView ? 'on' : ''}">켜기</button><button data-fx="0" class="${SET.fixView ? '' : 'on'}">끄기</button></div></div>
      <div class="set"><span>카메라 위아래 반전</span><div class="seg"><button data-i="0" class="${SET.invert ? '' : 'on'}">기본</button><button data-i="1" class="${SET.invert ? 'on' : ''}">반전</button></div></div>
      <div class="set"><span>주민이 먼저 말 걸기</span><div class="seg">${[['often', '자주'], ['some', '가끔'], ['off', '끄기']].map(q => `<button data-ch="${q[0]}" class="${(SET.chatty || 'some') === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>움직임 느낌</span><div class="seg">${[['wild', '자유롭게'], ['heavy', '묵직하게'], ['bal', '균형'], ['snappy', '경쾌하게']].map(q => `<button data-fl="${q[0]}" class="${(SET.feel || 'wild') === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>글자·버튼 크기</span><div class="seg">${[['s', '작게'], ['m', '보통'], ['l', '크게'], ['xl', '최대']].map(q => `<button data-ui="${q[0]}" class="${(SET.ui || 'm') === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>프레임 (자동: 기기가 괜찮으면 60까지 올려요)</span><div class="seg">${[['auto', '자동'], ['30', '30 고정'], ['60', '60']].map(q => `<button data-fps="${q[0]}" class="${(SET.fps || 'auto') === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>그래픽 품질</span><div class="seg">${[['low', '낮음'], ['mid', '보통'], ['high', '높음']].map(q => `<button data-q="${q[0]}" class="${SET.quality === q[0] ? 'on' : ''}">${q[1]}</button>`).join('')}</div></div>
      <div class="set"><span>진행 상황</span><div class="seg"><button id="sSave">저장하기</button><button id="sTitle">타이틀로</button></div></div>`;
    $('sSens').oninput = e => { SET.sens = +e.target.value; Game.saveSettings(); };
    $('sDist').oninput = e => { SET.dist = +e.target.value; Game.saveSettings(); };
    $('sMus').oninput = e => { SET.music = +e.target.value; Game.saveSettings(); G.Audio && G.Audio.applyVolume(); };
    $('sSfx').oninput = e => { SET.sfx = +e.target.value; Game.saveSettings(); G.Audio && G.Audio.applyVolume(); G.Audio && G.Audio.sfx('pickup'); };
    body.onclick = e => { const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.hl) { SET.help = b.dataset.hl; Game.saveSettings(); if (SET.help === 'off') UI.hint(null); renderMenu('set', body); }
      if (b.dataset.in) { SET.input = b.dataset.in; Game.saveSettings(); UI.applyMode(); renderMenu('set', body); }
      if (b.dataset.cg) { SET.cgrade = b.dataset.cg; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.hp) { SET.haptic = b.dataset.hp; Game.saveSettings(); G.haptic && G.haptic('hit'); renderMenu('set', body); }
      if (b.dataset.au) { SET.auto = b.dataset.au; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.v) { SET.view = b.dataset.v; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.sd) { SET.side = b.dataset.sd; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.fx) { SET.fixView = b.dataset.fx === '1'; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.a) { SET.autoCam = b.dataset.a === '1'; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.i) { SET.invert = b.dataset.i === '1'; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.ch) { SET.chatty = b.dataset.ch; Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.fl) { SET.feel = b.dataset.fl; Game.saveSettings(); renderMenu('set', body); G.UI.toast(G.Motion.FEEL[SET.feel].n + ' · ' + (SET.feel === 'wild' ? '빠르게 출발하고, 급히 멈추면 살짝 미끄러지며, 방향 전환이 시원해요' : SET.feel === 'heavy' ? '관성이 크고 멈출 때 미끄러져요' : SET.feel === 'snappy' ? '바로 가속하고 즉시 방향을 바꿔요' : '자연스러운 기본값')); }
      if (b.dataset.ui) { SET.ui = b.dataset.ui; Game.saveSettings(); UI.applyUIScale(); renderMenu('set', body); }
      if (b.dataset.fps) { SET.fps = b.dataset.fps; if (Game.perf) { Game.perf.autoLock = false; Game.perf.sticky = false; Game.perf.trial = 0; Game.perf.hn = 0; } Game.saveSettings(); renderMenu('set', body); }
      if (b.dataset.q) { SET.quality = b.dataset.q; Game.saveSettings(); Game.applyQuality(); renderMenu('set', body); }
      if (b.id === 'sSave') { Game.save(); }
      if (b.id === 'sTitle') { Game.save(true); UI.closePanel(); G.Main.toTitle(); } };
  }
}

UI.shop = function (shopId) {
  const EP = Game.EP(), shop = EP.shops[shopId];
  openPanel(shop.n, [['sell', '팔기'], ['buy', '사기']], 'sell', function render(tab, body) {
    const S = Game.S();
    if (tab === 'sell') {
      const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0 && Game.ITEMS[k] && Game.ITEMS[k].cat !== 'key' && (!shop.sells || shop.sells.includes(Game.ITEMS[k].cat)));
      body.innerHTML = `<div class="sec">가진 은 ${S.silver}</div>` + (ks.length ? ks.map(k => { const it = Game.ITEMS[k]; const pr = Game.price(k, shop.mul); return `<div class="row">${itemIcon(k)}<div class="t"><b>${esc(it.n)} ×${S.inv[k]}</b><span>하나에 은 ${pr}</span></div><button class="sbtn" data-s="${k}" data-n="1">1개</button><button class="sbtn pri" data-s="${k}" data-n="999">모두</button></div>`; }).join('') : '<div class="row"><div class="t"><span>팔 물건이 없어요</span></div></div>');
      body.onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; Game.sell(b.dataset.s, +b.dataset.n, shop.mul); render('sell', body); };
    } else {
      const list = shop.buy.filter(x => !x.when || x.when(S, Game)).concat(G.Stones ? G.Stones.shopList(shopId) : []); const St = G.Stones;
      body.innerHTML = `<div class="sec">가진 은 ${S.silver}</div>` + list.map((x, i) => `<div class="row">${x.item ? itemIcon(x.item) : icon(x.tool ? 'tool' : 'wool', '#e8dcc0')}<div class="t"><b>${esc(x.n)}</b><span>${esc(x.d || '')}</span></div><button class="sbtn pri" data-b="${i}" ${S.silver >= x.price && (!x.daily || St.left(shopId, x) > 0) ? '' : 'disabled'}>${x.daily ? (St.left(shopId, x) > 0 ? `은 ${x.price} · 오늘 ${St.left(shopId, x)}번` : '오늘은 다 팔렸어요') : `은 ${x.price}`}</button></div>`).join('');
      body.onclick = e => { const b = e.target.closest('[data-b]'); if (!b || b.disabled) return; const ent = list[+b.dataset.b]; if (Game.buy(ent) && ent.daily) St.spent(shopId, ent); render('buy', body); };
    }
  });
};
UI.pen = function (id) {
  const p = Game.pen(id);
  openPanel(p.n, null, null, function render(_, body) {
    const S = Game.S(), h = Game.herd(id); const list = h.list; const groups = {};
    list.forEach(a => { const k = a[0] + ':' + a[1]; groups[k] = groups[k] || { f: 0, m: 0, y: 0 }; if (a[3] < 4) groups[k].y++; else if (a[2]) groups[k].m++; else groups[k].f++; });
    const sheep = list.some(a => a[0] === 'sheep'), goats = list.some(a => a[0] === 'goat' || a[0] === 'cow');
    body.innerHTML = `<div class="row"><div class="t"><b>${list.length}마리 · 기분 ${h.joy}%</b><div class="bar"><i style="width:${h.joy}%"></i></div><span>물구유 ${h.trough}/12 · ${p.pasture === false ? `꼴 ${h.hay}` : '풀밭에서 풀을 뜯어요'}${h.rods ? ` · 가지 ${h.rods}일` : ''}</span></div></div>
      <div class="grid">${Object.keys(groups).map(k => { const [sp, pat] = k.split(':'); const g = groups[k]; return `<div class="card">${icon('wool', pat === 'plain' ? (sp === 'goat' ? '#3a302a' : '#f0eadc') : pat === 'black' ? '#3a302a' : pat === 'brown' ? '#8a5a3a' : '#c8b8a0')}<div class="t"><b>${esc(Game.PATN[pat] || pat)} ${esc(Game.SPN[sp])}</b><span>암 ${g.f} · 수 ${g.m}${g.y ? ` · 새끼 ${g.y}` : ''}</span></div></div>`; }).join('') || '<div class="card"><div class="t"><span>아직 가축이 없어요</span></div></div>'}</div>
      <div class="sec">돌보기</div>
      <div class="row"><div class="t"><b>구유에 물 채우기</b><span>매일 물을 마셔야 기분이 좋아져요 · 항아리 물 ${S.water}</span></div><button class="sbtn pri" data-a="water" ${S.water > 0 && h.trough < 12 ? '' : 'disabled'}>채우기</button></div>
      ${p.pasture === false ? `<div class="row"><div class="t"><b>꼴 주기</b><span>가진 꼴 ${Game.inv('hay')}</span></div><button class="sbtn pri" data-a="hay" ${Game.inv('hay') ? '' : 'disabled'}>주기</button></div>` : ''}
      ${sheep ? `<div class="row"><div class="t"><b>양털 깎기</b><span>${h.wool ? '털이 충분히 자랐어요' : '이틀 동안 기분 좋게 지내면 털이 자라요'}${Game.tool('shears') ? '' : ' · 양털 가위 필요'}</span></div><button class="sbtn pri" data-a="shear" ${h.wool && Game.tool('shears') ? '' : 'disabled'}>깎기</button></div>` : ''}
      ${goats ? `<div class="row"><div class="t"><b>젖 짜기</b><span>${h.milk ? '오늘 젖을 짤 수 있어요' : '기분 좋게 하루를 보내면 젖을 짤 수 있어요'}</span></div><button class="sbtn pri" data-a="milk" ${h.milk ? '' : 'disabled'}>짜기</button></div>` : ''}
      ${Game.EP().rods && p.rods ? `<div class="row"><div class="t"><b>껍질 벗긴 가지 세우기</b><span>물 마시러 온 튼튼한 양과 염소 앞에 세워요 (창 30:38) · 가진 가지 ${Game.inv('rod')}</span></div><button class="sbtn pri" data-a="rods" ${Game.inv('rod') >= 2 ? '' : 'disabled'}>세우기</button></div>` : ''}`;
    body.onclick = e => { const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; Game.penAction(id, b.dataset.a); render(null, body); };
  });
};
UI.site = function (s) {
  if (s.opts && s.work) return UI.siteDesign(s);
  openPanel(s.n, null, null, function render(_, body) {
    const S = Game.S(); const can = Object.keys(s.cost || {}).every(k => Game.have(k, s.cost[k])) && (!s.silver || S.silver >= s.silver);
    body.innerHTML = `<div class="row"><div class="t"><b>${esc(s.n)}</b><span>${esc(s.d || '')}</span>${costHTML(s.cost, s.silver)}</div><button class="sbtn pri" id="bBuild" ${can ? '' : 'disabled'}>짓기</button></div>`;
    $('bBuild').onclick = () => { if (Game.build(s)) UI.closePanel(); };
  });
};
// design a building before it is raised: pick its shape, finish and trim (each choice may change the materials)
UI.siteDesign = function (s) {
  const opt = {}; for (const k in s.opts) opt[k] = s.opts[k][0][0];
  openPanel(s.n + ' 설계', null, null, function render(_, body) {
    const S = Game.S(), cost = Game.siteCost(s, opt), can = Object.keys(cost).every(k => Game.have(k, cost[k])) && (!s.silver || S.silver >= s.silver);
    const LBL = s.optNames || {};
    body.innerHTML = `<div class="row"><div class="t"><b>${esc(s.n)}</b><span>${esc(s.d || '')}</span></div></div>` +
      Object.keys(s.opts).map(k => `<div class="sec">${esc(LBL[k] || k)}</div><div class="chips">${s.opts[k].map(o => `<button class="chip ${opt[k] === o[0] ? 'on' : ''}" data-k="${k}" data-v="${o[0]}">${o[2] && typeof o[2] === 'number' ? `<i style="background:#${o[2].toString(16).padStart(6, '0')}"></i>` : ''}${esc(o[1])}</button>`).join('')}</div>`).join('') +
      `<div class="row"><div class="t"><b>필요한 재료</b><span>터를 닦은 뒤 ${s.work}번에 걸쳐 직접 지어 올려요 (${esc((s.stages || []).join(' → '))})</span>${costHTML(cost, s.silver)}</div><button class="sbtn pri" id="bBuild" ${can ? '' : 'disabled'}>이대로 짓기 시작</button></div>`;
    body.querySelectorAll('.chip').forEach(b => b.onclick = () => { opt[b.dataset.k] = b.dataset.v; G.Audio && G.Audio.sfx('click'); render(_, body); });
    $('bBuild').onclick = () => { if (Game.siteStart(s, Object.assign({}, opt))) UI.closePanel(); };
  });
};
UI.sleepAsk = function () {
  const h = Game.hour();
  const from = Game.EP().sleepFrom || 16; if (h < from && h >= 5 && !(Game.EP().canSleep && Game.EP().canSleep(Game.S()))) { UI.say([{ n: '', t: `아직 해가 높아요. ${from > 12 ? '오후 ' + (from - 12) : '오전 ' + from}시가 지나면 잘 수 있어요.` }]); return; }
  UI.say([{ n: '', t: '아침까지 잘까요? 밭의 곡식이 자라고 가축이 새끼를 낳아요.', choices: [{ t: '잔다', then: () => setTimeout(() => Game.sleep(), 50) }, { t: '조금 더 있는다' }] }]);
};
UI.choose = function (title, opts, cb) { UI.say([{ n: '', t: title, choices: opts.map((o, i) => ({ t: o, then: () => cb(i) })) }]); };

// ------------------------------------------------------------------ minigames
let mgHold = null; UI.mgActive = () => busyFlags.mg;
UI.minigame = function (kind, opt, done) {
  busyFlags.mg = true; $('mg').hidden = false; const box = $('mgBox'); opt = opt || {};
  let ended = false; const finish = (ok) => { if (ended) return; ended = true; busyFlags.mg = false; /* v17.0: once only (a stale button or a timer can't end it twice) */ $('mg').hidden = true; mgHold = null; cancelAnimationFrame(raf); done && done(ok); };
  let raf = 0, last = performance.now();
  if (kind === 'push') {
    let prog = 0, holding = false, stam = 100, mgBuzz = 0;
    box.innerHTML = `<h4>${esc(opt.title || '힘껏 밀기')}</h4><p>${esc(opt.hint || 'A를 누르고 있으면 밀어요. 힘이 빠지면 잠깐 놓았다가 다시 미세요.')}</p><div class="meter"><i id="mgP" style="width:0%"></i></div><div class="meter"><i id="mgS" style="width:100%;background:#9be07a"></i></div><button class="btn big" id="mgBtn">꾹 눌러 밀기</button>`;
    mgHold = v => holding = v; const b = $('mgBtn'); b.onpointerdown = e => { e.preventDefault(); holding = true; }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => holding = false;
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (holding && stam > 0) { prog += dt * (opt.rate || 14); stam -= dt * 32; Game.P.act = 'push'; } else { prog = Math.max(0, prog - dt * 4); stam = Math.min(100, stam + dt * 40); if (Game.P.act === 'push') Game.P.act = null; }
      $('mgP').style.width = Math.min(100, prog) + '%'; $('mgS').style.width = Math.max(0, stam) + '%';
      if (holding && stam > 0) { mgBuzz = (mgBuzz || 0) - dt; if (mgBuzz <= 0) { mgBuzz = 0.22; G.haptic && G.haptic('tap'); } }
      if (prog >= 100) { Game.P.act = null; finish(true); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  } else if (kind === 'wrestle') {
    let pos = 0, dir = 1, hits = 0, miss = 0, time = 0; const need = opt.need || 8, dur = opt.dur || 40; const zw = 22;
    let zx = 40;
    box.innerHTML = `<h4>${esc(opt.title || '씨름')}</h4><p>${esc(opt.hint || `하얀 표시가 초록 구간에 들어올 때 A를 누르세요. 날이 새기 전에 ${need}번 붙잡아야 해요.`)}</p><div class="meter" id="mgM"><div class="zone" id="mgZ" style="left:40%;width:${zw}%"></div><div class="mk" id="mgK"></div></div><p id="mgT">${esc(opt.unit || '붙잡음')} 0/${need}</p><button class="btn big" id="mgBtn">${esc(opt.btn || '붙잡기')}</button>`;
    const press = () => { if (pos >= zx && pos <= zx + zw) { hits++; G.haptic && G.haptic('hit'); zx = 8 + Math.random() * (92 - zw - 8); $('mgZ').style.left = zx + '%'; Game.P.act = 'wrestle'; G.FX.burst(Game.P.x, Game.P.y + 1, Game.P.z, 10, { c: [1, 0.9, 0.6], sp: 2 }); } else { miss++; } $('mgT').textContent = `${opt.unit || '붙잡음'} ${hits}/${need}`; if (hits >= need) finish(true); };
    mgHold = v => { if (v) press(); }; $('mgBtn').onpointerdown = e => { e.preventDefault(); press(); };
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt; pos += dir * dt * (55 + hits * 6); if (pos > 100) { pos = 100; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } $('mgK').style.left = pos + '%'; if (opt.onTick) opt.onTick(time / dur, hits / need); if (time > dur * 3) { finish(true); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  } else if (kind === 'count') {
    let n = 0; const need = opt.need || 7;
    box.innerHTML = `<h4>${esc(opt.title || '')}</h4><p>${esc(opt.hint || '')}</p><p id="mgT" style="font-size:22px;color:var(--gold-hi)">0 / ${need}</p><button class="btn big" id="mgBtn">${esc(opt.btn || '누르기')}</button>`;
    const press = () => { n++; G.haptic && G.haptic('tap'); $('mgT').textContent = `${n} / ${need}`; if (opt.onPress) opt.onPress(n); if (n >= need) setTimeout(() => finish(true), 400); };
    mgHold = v => { if (v) press(); }; $('mgBtn').onpointerdown = e => { e.preventDefault(); press(); };
  } else if (kind === 'rhythm') { // v17.0 키질·타작: beats slide to the line; tap as each one crosses it
    const need = opt.need || 10, total = opt.beats || 16, gap = opt.gap || 0.8, spd = 42; let tt = -1.2, hit = 0, miss = 0, nx = 0; const beats = [];
    for (let i = 0; i < total; i++) beats.push({ t: i * gap + (i % 4 === 3 ? gap * 0.5 : 0), st: 0 }); // a little syncopation every fourth beat
    box.innerHTML = `<h4>${esc(opt.title || '키질하기')}</h4><p>${esc(opt.hint || `동그라미가 금에 닿을 때 A를 누르세요. ${need}번 맞히면 돼요.`)}</p><div class="mgLane" id="mgL"><b class="mgLine"></b></div><p id="mgT" style="font-size:15px;color:var(--gold-hi)">0 / ${need}</p><button class="btn big" id="mgBtn">${esc(opt.btn || '털기')}</button>`;
    const L = $('mgL'); for (const b of beats) { b.el = document.createElement('i'); L.appendChild(b.el); }
    const press = () => { let best = null, bd = 0.2; for (const b of beats) if (!b.st && Math.abs(b.t - tt) < bd) { bd = Math.abs(b.t - tt); best = b; }
      if (best) { best.st = 1; hit++; best.el.className = 'ok'; G.haptic && G.haptic('tap'); if (opt.onHit) opt.onHit(hit); } else { miss++; L.classList.remove('bad'); void L.offsetWidth; L.classList.add('bad'); }
      $('mgT').textContent = `${hit} / ${need}`; };
    mgHold = v => { if (v) press(); }; $('mgBtn').onpointerdown = e => { e.preventDefault(); press(); };
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; tt += dt;
      for (const b of beats) { const x = 12 + (b.t - tt) * spd; b.el.style.left = x + '%'; b.el.style.opacity = x > 100 || x < -6 ? 0 : 1; if (!b.st && tt - b.t > 0.2) { b.st = 2; b.el.className = 'miss'; } }
      if (hit >= need) { setTimeout(() => finish(true), 350); return; }
      if (tt > beats[total - 1].t + 0.6) { finish(hit >= need); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  } else if (kind === 'memory') { // v17.0 기억놀이: remember the things shown, then pick them out of a bigger set
    const pool = (opt.pool || []).slice(), n = opt.n || 4, show = opt.show || 3.2; for (let i = pool.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const want = pool.slice(0, n), grid = pool.slice(0, Math.min(pool.length, opt.grid || 9)); for (let i = grid.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [grid[i], grid[j]] = [grid[j], grid[i]]; }
    const nm = k => (Game.ITEMS[k] ? Game.ITEMS[k].n : (opt.names && opt.names[k]) || k), ic = k => Game.ITEMS[k] ? itemIcon(k) : icon((opt.icons && opt.icons[k]) || 'star', '#ffd98a');
    let picked = new Set(), wrong = 0, phase = 0;
    box.innerHTML = `<h4>${esc(opt.title || '기억놀이')}</h4><p id="mgH">${esc(opt.hint || '잘 보고 기억하세요!')}</p><div class="mgGrid" id="mgG">${want.map(k => `<span>${ic(k)}<small>${esc(nm(k))}</small></span>`).join('')}</div><div class="meter"><i id="mgP" style="width:100%"></i></div>`;
    let left = show; const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; left -= dt; $('mgP').style.width = Math.max(0, left / show * 100) + '%';
      if (left > 0) { raf = requestAnimationFrame(tick); return; } phase = 1;
      $('mgH').textContent = `방금 본 ${n}가지를 골라요. (틀려도 두 번까지 괜찮아요)`;
      $('mgG').innerHTML = grid.map(k => `<button class="btn" data-k="${k}">${ic(k)}<small>${esc(nm(k))}</small></button>`).join('');
      $('mgG').onclick = e => { const b = e.target.closest('[data-k]'); if (!b || b.disabled) return; const k = b.dataset.k; b.disabled = true;
        if (want.includes(k)) { picked.add(k); b.classList.add('ok'); G.haptic && G.haptic('tap'); if (picked.size >= n) setTimeout(() => finish(true), 450); }
        else { wrong++; b.classList.add('no'); if (wrong > 2) setTimeout(() => finish(false), 450); } }; };
    raf = requestAnimationFrame(tick);
  } else if (kind === 'balance') { // v17.0 물동이 이고 가기: the load sways; lean left/right to keep it in the middle until you arrive
    const dur = opt.dur || 14; let x = 0, v = 0, gust = 0, gT = 0, t = 0, ok = 0, held = 0;
    box.innerHTML = `<h4>${esc(opt.title || '물동이 이고 가기')}</h4><p>${esc(opt.hint || '흔들리는 표시가 가운데 초록 구간에 머물도록 ◀ ▶ 를 눌러 균형을 잡아요.')}</p><div class="meter" id="mgM"><div class="zone" style="left:35%;width:30%"></div><i id="mgK" style="width:4px;left:48%;background:#fff"></i></div><div class="meter"><i id="mgP" style="width:0%"></i></div><div style="display:flex;gap:10px;justify-content:center"><button class="btn big" id="mgLft">◀</button><button class="btn big" id="mgRgt">▶</button></div>`;
    for (const [id, d] of [['mgLft', -1], ['mgRgt', 1]]) { const b = $(id); b.onpointerdown = e => { e.preventDefault(); held = d; }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => { if (held === d) held = 0; }; }
    mgHold = v2 => { if (v2) held = x > 0 ? -1 : 1; else held = 0; }; // the A button / E key leans back toward the middle
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; gT -= dt; if (gT <= 0) { gT = 0.8 + Math.random() * 1.4; gust = t < 1.5 ? 0 : (Math.random() - 0.5) * (1.6 + t * 0.06); } // a calm first moment
      v += (gust + x * 0.6 + held * 2.6) * dt; v *= Math.pow(0.35, dt); x = clamp(x + v * dt * 1.7, -1, 1);
      const inZone = Math.abs(x) < 0.3; if (inZone) ok += dt; $('mgK').style.left = (48 + x * 48) + '%'; $('mgM').classList.toggle('bad', !inZone); $('mgP').style.width = Math.min(100, ok / (dur * 0.7) * 100) + '%';
      if (Math.abs(x) >= 1) { G.haptic && G.haptic('thud'); finish(false); return; }
      if (ok >= dur * 0.7) { finish(true); return; } if (t > dur * 1.6) { finish(false); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  } else if (kind === 'catch') { // v17.0 열매 받기: fruit drops in three rows; move the basket under it
    const need = opt.need || 10, dur = opt.dur || 30; let lane = 1, got = 0, lost = 0, t = 0, nT = 0.6; const drops = [];
    box.innerHTML = `<h4>${esc(opt.title || '열매 받기')}</h4><p>${esc(opt.hint || `떨어지는 열매 아래로 바구니를 옮겨요. ${need}개를 받으면 돼요.`)}</p><div class="mgField" id="mgF"><b id="mgB"></b></div><p id="mgT" style="font-size:15px;color:var(--gold-hi)">0 / ${need}</p><div style="display:flex;gap:10px;justify-content:center"><button class="btn big" id="mgLft">◀</button><button class="btn big" id="mgRgt">▶</button></div>`;
    const F = $('mgF'), Bk = $('mgB'), place = () => { Bk.style.left = (lane * 33.3 + 16.6) + '%'; };
    const mv = d => { lane = clamp(lane + d, 0, 2); place(); G.haptic && G.haptic('tap'); }; $('mgLft').onpointerdown = e => { e.preventDefault(); mv(-1); }; $('mgRgt').onpointerdown = e => { e.preventDefault(); mv(1); };
    mgHold = v2 => { if (v2) mv(lane >= 2 ? -2 : 1); }; place(); const fic = itemIcon(opt.item || 'fig');
    const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; nT -= dt;
      if (nT <= 0) { nT = Math.max(0.45, 1.05 - t * 0.02); const el = document.createElement('i'); el.innerHTML = Math.random() < 0.15 ? icon('stone', '#9a9080') : fic; const bad = el.innerHTML !== fic; el.style.left = ((Math.random() * 3 | 0) * 33.3 + 16.6) + '%'; F.appendChild(el); drops.push({ el, y: -8, lane: Math.round((parseFloat(el.style.left) - 16.6) / 33.3), sp: 38 + t * 0.9, bad }); }
      for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.y += d.sp * dt; d.el.style.top = d.y + '%';
        if (d.y > 78 && d.y < 92 && d.lane === lane) { if (d.bad) { got = Math.max(0, got - 1); G.haptic && G.haptic('thud'); } else { got++; } d.el.remove(); drops.splice(i, 1); $('mgT').textContent = `${got} / ${need}`; continue; }
        if (d.y > 104) { if (!d.bad) lost++; d.el.remove(); drops.splice(i, 1); } }
      if (got >= need) { finish(true); return; } if (t > dur) { finish(false); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  if (opt.quit !== false && ['rhythm', 'memory', 'balance', 'catch'].includes(kind)) { const q = document.createElement('button'); q.className = 'btn'; q.textContent = '그만두기'; q.style.alignSelf = 'center'; q.onclick = () => finish(false); box.appendChild(q); }
};
UI.puzzle = function (def, done) {
  let sel = null; const solved = new Set();
  openPanel(def.title, null, null, function render(_, body) {
    body.innerHTML = `<div class="row"><div class="t"><span>${esc(def.hint)}</span></div></div><div class="eps" style="grid-template-columns:1.1fr 1fr;gap:10px"><div class="pz-col" style="display:flex;flex-direction:column;gap:6px">${def.syms.map(s => `<button class="row" data-s="${s.id}" style="${sel === s.id ? 'background:var(--gold);color:var(--ink)' : solved.has(s.id) ? 'outline:1px solid var(--nile)' : ''};text-align:left"><div class="t"><b>${esc(s.t)}</b>${solved.has(s.id) ? `<span style="color:var(--nile)">→ ${esc(def.means.find(m => m.id === s.m).t)}</span>` : ''}</div></button>`).join('')}</div><div style="display:flex;flex-direction:column;gap:6px">${def.means.map(m => `<button class="row" data-m="${m.id}" style="text-align:left"><div class="t"><b>${esc(m.t)}</b></div></button>`).join('')}</div></div><div class="row"><div class="t"><span id="pzMsg" style="color:var(--gold-hi)">${solved.size === def.syms.length ? '모든 뜻을 찾았어요!' : ''}</span></div>${solved.size === def.syms.length ? '<button class="sbtn pri" id="pzOk">해석을 전하기</button>' : ''}</div>`;
    body.onclick = e => { const s = e.target.closest('[data-s]'), m = e.target.closest('[data-m]');
      if (s && !solved.has(s.dataset.s)) { sel = s.dataset.s; render(null, body); }
      if (m) { if (!sel) { $('pzMsg').textContent = '먼저 왼쪽에서 장면을 고르세요'; return; } const sy = def.syms.find(x => x.id === sel); if (sy.m === m.dataset.m) { solved.add(sel); sel = null; render(null, body); } else { $('pzMsg').textContent = sy.h; } }
      if (e.target.id === 'pzOk') { panelClose = null; UI.closePanel(); done && done(); } };
  }, null);
  $('pX').hidden = true; panelLock = true;
};

// ------------------------------------------------------------------ HUD
const fmtTime = h => { h = h % 24; const hh = Math.floor(h), mm = Math.floor((h - hh) * 6) * 10; const am = hh < 12; const h12 = hh % 12 === 0 ? 12 : hh % 12; return `${am ? '오전' : '오후'} ${h12}:${String(mm).padStart(2, '0')}`; };
UI.quest = function () {
  const st = Game.step(); const EP = Game.EP(); if (!st) return;
  $('qCh').textContent = EP.chapters[(st.ch || 1) - 1] ? EP.chapters[(st.ch || 1) - 1].t : '';
  const S = Game.S(); $('qObj').textContent = typeof st.obj === 'function' ? st.obj(S, Game) : (st.obj || '');
  const list = st.list ? st.list(S, Game) : []; $('qList').innerHTML = list.map(l => `<div class="${l.ok ? 'ok' : ''}"><i>${l.ok ? '✓' : '·'}</i><span>${esc(l.t)}</span></div>`).join('');
  const tr = G.Life && G.Life.tracked(S); const qs = $('qSide'); if (tr && tr.q) { qs.hidden = false; qs.innerHTML = `<b>부탁 · ${esc(tr.q.title)}</b>` + tr.q.obj.map(o => { const ok = o.ok(S, Game, tr.st); return `<span>${ok ? '✓' : '·'} ${esc(typeof o.t === 'function' ? o.t(S, Game, tr.st) : o.t)}</span>`; }).join(''); } else qs.hidden = true;
};
UI.hud = function () {
  const S = Game.S(); if (!S) return;
  const h = S.time % 24, night = h < 5.6 || h > 19.6;
  const wic = G.Weather ? G.Weather.icon(S) : S.weather === 'rain' ? 'rain' : 'sun'; const ic = wic === 'sun' && night ? 'moon' : wic;
  const ck = ic + S.day + fmtTime(S.time); if ($('clock').dataset.k !== ck) { $('clock').dataset.k = ck; $('clock').innerHTML = icon(ic, ic === 'sun' ? '#f7d070' : ic === 'moon' ? '#cfd8f0' : ic === 'dust' ? '#e0b070' : '#d8e0ec') + `${S.day}일째 · ${fmtTime(S.time)}`; $('clock').title = G.Weather ? G.Weather.name(S) : ''; }
  if (G.Surv) { const sv = G.Surv.get(), gf = $('gFood'), gw = $('gWarm'); gf.hidden = !Game.feat('surv'); gw.hidden = !Game.feat('warm');
    if (!gf.hidden) { gf.querySelector('i').style.width = sv.food + '%'; gf.classList.toggle('low', sv.food < 28); }
    if (!gw.hidden) { gw.querySelector('i').style.width = sv.warm + '%'; gw.classList.toggle('low', sv.warm < 35); gw.classList.toggle('hot', !!G.Surv.src && G.Surv.heat > G.Surv.cold); } }
  const rb = $('rideBtn'); if (rb && G.Ride) { const P = Game.P, own = G.Ride.list.length > 0; rb.hidden = !own || !Game.feat('ride'); const lab = P.ride ? '내리기' : '부르기'; if (rb.dataset.l !== lab) { rb.dataset.l = lab; rb.innerHTML = icon('donkey', '#e8d8b8') + lab; } }
  $('silverPill').innerHTML = icon('coin', '#e8c870') + `은 ${S.silver}`;
  const seed = Game.curSeed();
  $('seedBtn').innerHTML = seed ? itemIcon(seed) + `${esc(Game.ITEMS[seed].n.replace(' 씨앗', ''))} ×${S.inv[seed]}` : icon('seed', '#8a8070') + '씨앗 없음';
  const hasJar = Game.tool('jar') || Game.tool('bigjar');
  $('waterBtn').hidden = !hasJar; $('waterBtn').innerHTML = icon('drop', '#63c3b6') + `<span class="wbar"><i style="width:${S.water / S.jarMax * 100}%"></i></span>${S.water}`;
  $('bagBtn').innerHTML = icon('bag', '#e5b552') + '가방';
  { const hk = Game.hand(), any = Object.keys(S.tools).some(k => S.tools[k] && Game.TOOL_PROP[k]); $('handBtn').hidden = !any; if (any) { const lab = hk ? Game.TOOLS[hk] : '빈손'; if ($('handBtn').dataset.l !== lab) { $('handBtn').dataset.l = lab; $('handBtn').innerHTML = icon('tool', hk ? '#f0d8b0' : '#8a8070') + esc(lab); } } }
  $('seedBtn').hidden = !Object.keys(S.inv).some(k => Game.ITEMS[k] && Game.ITEMS[k].cat === 'seed') && !Game.tool('hoe');
  const H = S.hero; if (H) { $('hpFill').style.width = (H.hp / H.hpMax * 100).toFixed(1) + '%'; $('hpTxt').textContent = `${Math.ceil(H.hp)} / ${H.hpMax}`; $('lvlTxt').textContent = `체력 Lv${H.lvl}`; $('menuDot').hidden = !(H.ip > 0);
    const C = G.Combat, mel = H.weapon || (Game.tool('staff') ? 'staff' : null); $('btnAtk').hidden = !mel && !H.ranged;
    const rng = H.mode === 'ranged' && H.ranged; $('wpnBtn').hidden = !H.ranged; if (H.ranged) $('wpnBtn').innerHTML = icon(rng ? (C.GEAR[H.ranged].ammo === 'stone' ? 'sling' : 'bow') : 'sword', '#f0d8b0') + (rng ? (C.GEAR[H.ranged].ammo === 'stone' && G.Stones ? G.Stones.label() : `${C.GEAR[H.ranged].ammo === 'stone' ? '돌' : '화살'} ${Game.inv(C.GEAR[H.ranged].ammo)}`) : '근접'); if (G.Stones) G.Stones.hud();
    $('btnAtkL').textContent = rng ? '쏘기' : '공격'; }
  extraBtns(); UI.quest();
};
UI.rideBtn = function () { const P = Game.P; if (!G.Ride || UI.busy()) return; if (P.ride) G.Ride.dismount(); else G.Ride.call(); UI.hud(); };
$('rideBtn').onclick = UI.rideBtn; $('gFood').onclick = () => { if (!UI.busy()) G.Surv && G.Surv.quickEat(); };
$('gWarm').onclick = () => { const sv = G.Surv && G.Surv.get(); if (!sv) return; UI.toast(sv.warm > 70 ? '몸이 따뜻해요' : G.Surv.src ? `${G.Surv.src}에서 몸을 녹이는 중이에요` : '추워요 · 모닥불이나 장막, 집으로 가면 몸이 따뜻해져요'); };
// feature unlock cards (queued, non-blocking)
// v15: help popups close on a wall-clock deadline (a timer that does not depend on the frame loop or on UI.busy), shorter than
// before (4.5s card, 6s hint), close on a tap, and a hint whose step has passed never lingers.
const fq = []; let fcEnd = 0, fcHide = 0, hintEnd = 0, hintStep = null;
UI.featCard = function (k, f) { fq.push(f); };
function closeFeat() { const el = $('featCard'); el.classList.remove('show'); fcEnd = 0; clearTimeout(fcHide); fcHide = setTimeout(() => { if (!fcEnd) el.hidden = true; }, 450); }
function featTick(dt) { const el = $('featCard'); if (fcEnd) return; if (!fq.length || UI.busy() || (G.Cine && G.Cine.on)) return;
  const f = fq.shift(); const kk = document.querySelector('#featCard small'); if (kk) kk.textContent = f.kick || '새로 열린 기능'; $('fcIc').innerHTML = icon(f.ic || 'star', '#ffd98a'); $('fcT').textContent = f.n; $('fcD').textContent = UI.short(UI.txt(f.d).split(/(?<=[.!?요다])\s/)[0], 30); clearTimeout(fcHide); el.hidden = false; requestAnimationFrame(() => el.classList.add('show')); fcEnd = Date.now() + (brief() ? 3200 : 4500); G.Audio && G.Audio.sfx('quest', { pitch: 1.2 }); }
$('featCard').style.pointerEvents = 'auto'; $('featCard').onclick = closeFeat; $('featCard').addEventListener('pointerdown', e => { e.stopPropagation(); closeFeat(); });
// tutorial hints: a small non-blocking pill above the thumb controls (UI.hint(text, key) / UI.hint(null))
let hintK = null;
function closeHint() { const el = $('hint'); if (el) el.classList.remove('show'); hintEnd = 0; }
UI.hint = function (text, key, ic) { const el = $('hint'); if (!el) return; if (!text) { if (hintK !== null) { closeHint(); hintK = null; } return; }
  if (Game.SET.help === 'off') return; if (hintK === (key || text)) return; hintK = key || text; $('hintT').textContent = UI.short(UI.txt(text), 36); $('hintI').innerHTML = icon(ic || 'star', '#ffd98a'); el.hidden = false; requestAnimationFrame(() => el.classList.add('show')); hintEnd = Date.now() + (brief() ? 4500 : 6000); hintStep = Game.S() && Game.S().step; G.Audio && G.Audio.sfx('click'); };
setInterval(() => { const now = Date.now(); if (fcEnd && now > fcEnd) closeFeat();
  if (hintEnd && (now > hintEnd || (Game.S() && hintStep !== null && Game.S().step !== hintStep) || Game.mode !== 'play')) closeHint(); }, 200);
// episode buttons in the hotbar: EP.extra = [{ id, label, ic, on(S, G), click(S, G) }]
function extraBtns() {
  const EP = Game.EP(), S = Game.S(), host = $('hot'); if (!EP || !S) return;
  for (const e of EP.extra || []) { let b = document.getElementById('xb_' + e.id);
    if (!b) { b = document.createElement('button'); b.id = 'xb_' + e.id; b.className = 'xb'; b.onclick = () => { if (UI.busy() || (G.Cine && G.Cine.on)) return; e.click(Game.S(), Game); UI.hud(); }; host.insertBefore(b, host.firstChild); }
    const on = !e.on || e.on(S, Game); b.hidden = !on; if (on) { const lab = typeof e.label === 'function' ? e.label(S, Game) : e.label; if (b.dataset.l !== lab) { b.dataset.l = lab; b.innerHTML = icon(e.ic || 'star', '#e8d8b8') + esc(lab); } } }
}
UI.enterGame = function () { document.querySelectorAll('.xb').forEach(b => b.remove()); $('title').hidden = true; $('hud').hidden = false; $('controls').hidden = false; UI.resize(); UI.hud(); UI.checkRotate(); };
UI.toTitle = function () { UI.hint(null); document.querySelectorAll('.xb').forEach(b => b.remove()); busyFlags.rot = false; $('rotate').hidden = true; $('title').hidden = false; $('hud').hidden = true; $('controls').hidden = true; $('prompt').hidden = true; $('stam').hidden = true; $('tags').innerHTML = ''; tagEls = {}; };

// minimap
const mm = $('minimap').getContext('2d'); let mapImg = null;
UI.buildMap = function () {
  const W = Game.W(); const c = document.createElement('canvas'); const N = 256; c.width = c.height = N; const x = c.getContext('2d'); const img = x.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const wx = -W.half + (i + 0.5) / N * W.size, wz = -W.half + (j + 0.5) / N * W.size; const ix = Math.min(W.N - 1, Math.round((wx + W.half) / W.cell)), iz = Math.min(W.N - 1, Math.round((wz + W.half) / W.cell)); const k = iz * W.N + ix; let r = W.col[k * 3], g = W.col[k * 3 + 1], b = W.col[k * 3 + 2];
    if (W.water && W.h[k] < W.water.level) { r = 0.25; g = 0.55; b = 0.62; } const sh = 0.85 + (W.nx[k] * 0.3 - W.nz[k] * 0.3);
    const o = (j * N + i) * 4; img.data[o] = Math.min(255, r * 255 * sh); img.data[o + 1] = Math.min(255, g * 255 * sh); img.data[o + 2] = Math.min(255, b * 255 * sh); img.data[o + 3] = 255; }
  x.putImageData(img, 0, 0); x.fillStyle = 'rgba(70,50,35,.9)';
  for (const col of W.cols) if (col.t === 'b' && col.cam) { const sx = (col.x + W.half) / W.size * N, sz = (col.z + W.half) / W.size * N; x.save(); x.translate(sx, sz); x.rotate(-col.a || 0); x.fillRect(-col.hw / W.size * N, -col.hd / W.size * N, col.w / W.size * N, col.d / W.size * N); x.restore(); }
  mapImg = c;
};
function drawMap(tg) {
  const W = Game.W(), P = Game.P, S2 = 192, R = S2 / 2, view = 70; if (!mapImg) UI.buildMap();
  mm.save(); mm.clearRect(0, 0, S2, S2); mm.beginPath(); mm.arc(R, R, R, 0, Math.PI * 2); mm.clip(); mm.fillStyle = '#2a3a5a'; mm.fillRect(0, 0, S2, S2);
  const N = mapImg.width, sc = N / W.size; mm.imageSmoothingEnabled = true;
  mm.drawImage(mapImg, (P.x - view + W.half) * sc, (P.z - view + W.half) * sc, view * 2 * sc, view * 2 * sc, 0, 0, S2, S2);
  const k = S2 / (view * 2);
  // npcs dots
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n.d.animal) continue; const dx = (n.x - P.x) * k, dz = (n.z - P.z) * k; if (Math.hypot(dx, dz) > R - 6) continue; mm.fillStyle = '#f4e8cc'; mm.beginPath(); mm.arc(R + dx, R + dz, 3, 0, 7); mm.fill(); }
  // v12: the way to the goal is drawn on the map (dashed route + pulsing ring), instead of a light pillar in the world
  if (tg) { const t = performance.now() / 1000; let dx0 = (tg.x - P.x) * k, dz0 = (tg.z - P.z) * k; const d0 = Math.hypot(dx0, dz0);
    mm.save(); mm.setLineDash([7, 6]); mm.lineDashOffset = -t * 18; mm.strokeStyle = 'rgba(255,214,90,.9)'; mm.lineWidth = 3.5; mm.beginPath(); mm.moveTo(R, R); const cl = Math.min(1, (R - 12) / (d0 || 1)); mm.lineTo(R + dx0 * cl, R + dz0 * cl); mm.stroke(); mm.restore();
    if (d0 <= R - 12) { const pr = 10 + 5 * (0.5 + 0.5 * Math.sin(t * 4)); mm.strokeStyle = 'rgba(255,214,90,.75)'; mm.lineWidth = 3; mm.beginPath(); mm.arc(R + dx0, R + dz0, pr, 0, 7); mm.stroke(); } }
  if (tg) { let dx = (tg.x - P.x) * k, dz = (tg.z - P.z) * k; const d = Math.hypot(dx, dz); if (d > R - 12) { dx *= (R - 12) / d; dz *= (R - 12) / d; } mm.fillStyle = '#ffd24a'; mm.strokeStyle = '#3a2a10'; mm.lineWidth = 2; mm.beginPath(); mm.moveTo(R + dx, R + dz - 9); mm.lineTo(R + dx + 7, R + dz); mm.lineTo(R + dx, R + dz + 9); mm.lineTo(R + dx - 7, R + dz); mm.closePath(); mm.fill(); mm.stroke(); }
  const fa = Math.atan2(-Math.cos(Game.CAM.yaw), -Math.sin(Game.CAM.yaw)); mm.fillStyle = 'rgba(255,255,255,.18)'; mm.beginPath(); mm.moveTo(R, R); mm.arc(R, R, 44, fa - 0.55, fa + 0.55); mm.closePath(); mm.fill();
  mm.translate(R, R); mm.rotate(Math.PI - P.face); mm.fillStyle = '#fff'; mm.strokeStyle = '#14213d'; mm.lineWidth = 2.5; mm.beginPath(); mm.moveTo(0, -11); mm.lineTo(8, 8); mm.lineTo(0, 4); mm.lineTo(-8, 8); mm.closePath(); mm.stroke(); mm.fill();
  mm.restore(); mm.fillStyle = '#f4e8cc'; mm.font = 'bold 18px sans-serif'; mm.textAlign = 'center'; mm.fillText('N', R, 22);
}
// ------------------------------------------------------------------ big map (tap the minimap)
let bigImg = null; const BM = { on: false, cx: 0, cz: 0, k: 2, ptr: new Map(), moved: 0, dirty: true };
function buildBig() {
  const W = Game.W(), N = 512, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), img = x.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const wx = -W.half + (i + 0.5) / N * W.size, wz = -W.half + (j + 0.5) / N * W.size, h = W.heightAt(wx, wz);
    const ix = Math.min(W.N - 1, Math.round((wx + W.half) / W.cell)), iz = Math.min(W.N - 1, Math.round((wz + W.half) / W.cell)), k = iz * W.N + ix; let r = W.col[k * 3], g = W.col[k * 3 + 1], b = W.col[k * 3 + 2];
    if (W.water && h < W.water.level) { const d = Math.min(1, (W.water.level - h) / 1.5); r = 0.3 - d * 0.1; g = 0.6 - d * 0.12; b = 0.66 - d * 0.06; }
    const sh = 0.82 + (W.nx[k] * 0.45 - W.nz[k] * 0.45) + Math.min(0.12, h * 0.004); const o = (j * N + i) * 4; img.data[o] = Math.min(255, r * 255 * sh); img.data[o + 1] = Math.min(255, g * 255 * sh); img.data[o + 2] = Math.min(255, b * 255 * sh); img.data[o + 3] = 255; }
  x.putImageData(img, 0, 0); x.fillStyle = 'rgba(70,50,35,.92)';
  for (const col of W.cols) if (col.t === 'b' && col.cam) { const sx = (col.x + W.half) / W.size * N, sz = (col.z + W.half) / W.size * N; x.save(); x.translate(sx, sz); x.rotate(-col.a || 0); x.fillRect(-col.hw / W.size * N, -col.hd / W.size * N, col.w / W.size * N, col.d / W.size * N); x.restore(); }
  bigImg = c;
}
UI.bigMap = function () {
  if (UI.busy() || Game.mode !== 'play') return; if (!bigImg) buildBig(); const P = Game.P; BM.on = true; BM.cx = P.x; BM.cz = P.z; const cv = $('bmC');
  $('bigmap').hidden = false; busyFlags.map = true; const r = cv.getBoundingClientRect(); BM.k = Math.min(r.width, r.height) / 190; $('bmClr').hidden = !Game.S().wp; if (UI.mapHead) { const hs = document.querySelector('#bigmap .bm-head span'); if (hs) hs.textContent = UI.mapHead(); } G.Audio && G.Audio.sfx('page', { vol: 0.6 });
};
function closeBig() { BM.on = false; $('bigmap').hidden = true; busyFlags.map = false; BM.ptr.clear(); }
$('minimap').addEventListener('click', () => UI.bigMap());
$('bmX').onclick = closeBig; $('bmMe').onclick = () => { BM.cx = Game.P.x; BM.cz = Game.P.z; };
$('bmZi').onclick = () => { BM.k = Math.min(14, BM.k * 1.4); }; $('bmZo').onclick = () => { BM.k = Math.max(0.6, BM.k / 1.4); };
$('bmClr').onclick = () => { Game.S().wp = null; $('bmClr').hidden = true; UI.toast('표시를 지웠어요'); };
{ const cv = $('bmC');
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); BM.ptr.set(e.pointerId, [e.clientX, e.clientY]); BM.moved = 0; BM.pd = null; });
  cv.addEventListener('pointermove', e => { const p = BM.ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p[0], dy = e.clientY - p[1];
    if (BM.ptr.size === 1) { BM.cx -= dx / BM.k; BM.cz -= dy / BM.k; BM.moved += Math.abs(dx) + Math.abs(dy); }
    p[0] = e.clientX; p[1] = e.clientY;
    if (BM.ptr.size === 2) { const [a, b] = [...BM.ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (BM.pd) BM.k = Math.max(0.6, Math.min(14, BM.k * d / BM.pd)); BM.pd = d; BM.moved = 99; } });
  const up = e => { const had = BM.ptr.has(e.pointerId); BM.ptr.delete(e.pointerId); BM.pd = null; if (!had || BM.moved > 8 || e.type !== 'pointerup') return;
    const r = cv.getBoundingClientRect(), wx = BM.cx + (e.clientX - r.left - r.width / 2) / BM.k, wz = BM.cz + (e.clientY - r.top - r.height / 2) / BM.k; const S = Game.S(); const pl = (Game.EP().places || []).find(p => Math.hypot(p.x - wx, p.z - wz) < 9 / BM.k * 2 + 4);
    S.wp = pl ? { x: pl.x, z: pl.z, n: pl.n } : { x: wx, z: wz, n: '표시한 곳' }; $('bmClr').hidden = false; UI.toast(`${S.wp.n}을(를) 표시했어요 · 나침반이 길을 알려 줘요`); G.Audio && G.Audio.sfx('click'); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); BM.k = Math.max(0.6, Math.min(14, BM.k * (e.deltaY > 0 ? 0.88 : 1.14))); }, { passive: false }); }
function drawBig() {
  const cv = $('bmC'), r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), W = Game.W(), S = Game.S(), P = Game.P, EP = Game.EP(); if (!r.width) return;
  if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const c = cv.getContext('2d'), w = r.width, h = r.height, k = BM.k; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = '#20293f'; c.fillRect(0, 0, w, h);
  BM.cx = Math.max(-W.half, Math.min(W.half, BM.cx)); BM.cz = Math.max(-W.half, Math.min(W.half, BM.cz));
  const sx = x => w / 2 + (x - BM.cx) * k, sz = z => h / 2 + (z - BM.cz) * k; c.imageSmoothingEnabled = true;
  c.drawImage(bigImg, sx(-W.half), sz(-W.half), W.size * k, W.size * k);
  // places
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const p of EP.places || []) { if (p.when && !p.when(S)) continue; const x = sx(p.x), y = sz(p.z); if (x < -40 || y < -20 || x > w + 40 || y > h + 20) continue; const big = p.k === 'town';
    c.fillStyle = big ? '#ffd98a' : '#f4e8cc'; c.strokeStyle = '#1a1208'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, big ? 5 : 3.5, 0, 7); c.fill(); c.stroke();
    c.font = `${big ? 700 : 600} ${big ? 14 : 12}px "IBM Plex Sans KR",sans-serif`; c.lineWidth = 3.5; c.strokeStyle = 'rgba(10,14,28,.85)'; c.strokeText(p.n, x, y - (big ? 14 : 11)); c.fillStyle = big ? '#ffe9b0' : '#f4e8cc'; c.fillText(p.n, x, y - (big ? 14 : 11)); }
  // wells, shops & fires
  if (k > 1.2) for (const st of EP.stations || []) { if (st.on && !st.on(S, Game)) continue; const col = st.type === 'well' ? '#63c3e6' : st.type === 'shop' ? '#e5b552' : st.type === 'fire' ? '#ff8a4a' : st.type === 'bed' ? '#c8a0f0' : null; if (!col) continue;
    c.fillStyle = col; c.beginPath(); c.arc(sx(st.x), sz(st.z), 3, 0, 7); c.fill(); }
  if (UI.mapExtra) try { UI.mapExtra(c, sx, sz, k, w, h); } catch (e) { console.warn(e); }
  // own buildings & mounts
  for (const b of S.bld || []) { c.fillStyle = '#a0623a'; c.strokeStyle = '#f4e8cc'; c.lineWidth = 1.5; c.fillRect(sx(b.x) - 4, sz(b.z) - 4, 8, 8); c.strokeRect(sx(b.x) - 4, sz(b.z) - 4, 8, 8); }
  if (G.Ride) for (const m of G.Ride.list) if (m !== P.ride) { c.fillStyle = '#e8d8b8'; c.beginPath(); c.arc(sx(m.x), sz(m.z), 4, 0, 7); c.fill(); c.strokeStyle = '#5a3a24'; c.stroke(); }
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n.d.animal || n.d.noTag || !G.Life || !G.Life.mark(id)) continue; c.fillStyle = G.Life.mark(id) === '?' ? '#9be0ff' : '#ffd24a'; c.font = '800 13px sans-serif'; c.fillText(G.Life.mark(id), sx(n.x), sz(n.z)); }
  const tg = Game.curTarget; if (tg) { const x = sx(tg.x), y = sz(tg.z); c.fillStyle = tg.wp ? '#ff7a6a' : '#ffd24a'; c.strokeStyle = '#3a2a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 9); c.lineTo(x + 7, y); c.lineTo(x, y + 9); c.lineTo(x - 7, y); c.closePath(); c.fill(); c.stroke(); }
  if (S.wp && !(tg && tg.wp)) { c.fillStyle = '#ff7a6a'; c.beginPath(); c.arc(sx(S.wp.x), sz(S.wp.z), 5, 0, 7); c.fill(); }
  // hero
  c.save(); c.translate(sx(P.x), sz(P.z)); c.rotate(Math.PI - P.face); c.fillStyle = '#fff'; c.strokeStyle = '#14213d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -11); c.lineTo(8, 8); c.lineTo(0, 4); c.lineTo(-8, 8); c.closePath(); c.stroke(); c.fill(); c.restore();
  // compass rose & scale
  c.fillStyle = 'rgba(9,16,34,.75)'; c.beginPath(); c.arc(w - 30, 30, 20, 0, 7); c.fill(); c.fillStyle = '#ffd98a'; c.font = '800 13px sans-serif'; c.fillText('북', w - 30, 18); c.fillStyle = '#f4e8cc'; c.font = '600 10px sans-serif'; c.fillText('남', w - 30, 43); c.fillText('동', w - 15, 30); c.fillText('서', w - 45, 30);
  const L = k > 4 ? 20 : k > 1.6 ? 50 : 100; c.fillStyle = 'rgba(9,16,34,.75)'; c.fillRect(10, h - 26, L * k + 16, 18); c.fillStyle = '#f4e8cc'; c.fillRect(18, h - 18, L * k, 3); c.font = '600 10px sans-serif'; c.textAlign = 'left'; c.fillText(`${L}걸음`, 18 + L * k + 4 > w ? 18 : 18, h - 22);
}
let tagEls = {}, hudT = 0, mapT = 0;
UI.frame = function (dt) {
  const R = G.R, P = Game.P, S = Game.S();
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
  document.body.classList.toggle('busy', UI.busy());
  hudT -= dt; if (hudT <= 0) { hudT = 0.5; UI.hud(); }
  // action button
  const c = Game.ctx(); const lab = busyFlags.dialog || busyFlags.narr ? '다음' : c ? c.label : '행동';
  if ($('btnAL').textContent !== lab) $('btnAL').textContent = lab;
  btnA.classList.toggle('off', !c && !busyFlags.dialog); btnA.classList.toggle('on', !!c && !c.disabled && !UI.busy());
  $('btnRun').classList.toggle('on', P.sprint); $('btnJump').hidden = P.swim;
  const C = G.Combat, inC = C && C.inCombat; const jl = inC ? '구르기' : '점프'; if ($('btnJump').textContent !== jl) $('btnJump').textContent = jl;
  if (C && C.fish) { const f = C.fish, l2 = f.st === 'bite' ? '챔질!' : f.st === 'reel' ? '당기기' : '거두기'; if ($('btnAL').textContent !== l2) $('btnAL').textContent = l2; btnA.classList.toggle('on', f.st === 'bite'); btnA.classList.remove('off'); }
  if (G.Cine && G.Cine.on) $('btnAL').textContent = '다음';
  if (C && C.hpDirty) { C.hpDirty = 0; const H = S.hero; $('hpFill').style.width = (H.hp / H.hpMax * 100).toFixed(1) + '%'; $('hpTxt').textContent = `${Math.ceil(H.hp)} / ${H.hpMax}`; }
  const ctg = C && C.target(), tb = $('tgtBar');
  if (ctg && ctg.st !== 'dead' && !UI.busy()) { const s = R.project(ctg.x, ctg.y + ctg.fy + (ctg.d.big ? 2.0 : 1.3), ctg.z, UI.W, UI.H); if (s) { tb.hidden = false; tb.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; $('tgtName').textContent = ctg.name; $('tgtFill').style.width = Math.max(0, ctg.hp / ctg.hpMax * 100) + '%'; } else tb.hidden = true; } else tb.hidden = true;
  // prompt bubble
  const pr = $('prompt');
  if (c && !UI.busy()) { const EPf = Game.EP(), fl = EPf && EPf.floor ? EPf.floor(c.x, c.z, Game.S()) : null, gy = fl !== null && fl !== undefined ? fl : Game.W().heightAt(c.x, c.z); // v16.9 the bubble sits on the thing (absolute height when given, else above the floor/ground under it)
    const s = R.project(c.x, c.yAbs !== undefined ? c.yAbs : gy + (c.y || 1.5), c.z, UI.W, UI.H); if (s) { pr.hidden = false; pr.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; $('promptT').textContent = c.label; pr.classList.toggle('off', !!c.disabled); } else pr.hidden = true; }
  else pr.hidden = true;
  // stamina ring
  const sv = $('stam');
  const scap = (G.Vitals && G.Vitals.cap) || 100, smx = (Game.S().hero && Game.S().hero.stamMax) || 100;
  if ((P.stam < scap - 0.5 || scap < smx - 1) && !UI.busy() && !P.downed) { $('stamCap').setAttribute('stroke-dashoffset', String(106.8 * (1 - scap / smx))); const s = R.project(P.x, P.y + 2.3, P.z, UI.W, UI.H); if (s) { sv.hidden = false; sv.style.transform = `translate(${s[0] + 38}px,${s[1]}px) translate(-50%,-50%) scale(var(--uik,1))`; $('stamArc').setAttribute('stroke-dashoffset', String(106.8 * (1 - P.stam / smx))); $('stamArc').setAttribute('stroke', P.exhausted ? '#e0704f' : P.stam < 30 ? '#f0c040' : '#9be07a'); } }
  else sv.hidden = true;
  // compass
  const tg = Game.curTarget; const cp = $('compass');
  if (tg && !UI.busy()) { const dx = tg.x - P.x, dz = tg.z - P.z; const rel = Math.atan2(dx, dz) - Math.atan2(-Math.sin(Game.CAM.yaw), -Math.cos(Game.CAM.yaw)); cp.hidden = false; $('cArrow').style.transform = `rotate(${-rel}rad)`; $('cDist').textContent = Math.round(Math.hypot(dx, dz)) + 'm'; }
  else cp.hidden = true;
  document.body.classList.toggle('dlgcam', Game.dlgW > 0.3); // dialogue close-up: clear the frame
  // name tags
  const goal = tg && tg.npc;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; let el = tagEls[id]; const d = Math.hypot(n.x - P.x, n.z - P.z);
    const mk0 = !n.d.noTag && n.vis && n.near && d < 34 && G.Life && G.Life.mark(id); const show = n.vis && n.near && (d < 16 || mk0) && !n.d.noTag && !busyFlags.narr && !(Game.dlgW > 0.3); if (!show) { if (el) el.hidden = true; continue; }
    if (!el) { el = document.createElement('div'); el.className = 'tag'; $('tags').appendChild(el); tagEls[id] = el; } const mk = G.Life && G.Life.mark(id); const key = (mk || '') + n.name; if (el.dataset.k !== key) { el.dataset.k = key; el.innerHTML = (mk ? `<i class="mk ${mk === '?' ? 'q' : ''}">${mk}</i>` : '') + esc(n.name); }
    const s = R.project(n.x, n.y + (n.d.animal ? 1.6 : 2.5) * (n.scale || 1), n.z, UI.W, UI.H); if (!s) { el.hidden = true; continue; }
    el.hidden = false; el.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; el.classList.toggle('goal', id === goal); }
  mapT -= dt; if (mapT <= 0) { mapT = 0.12; drawMap(tg); }
  featTick(dt); if (BM.on) drawBig();
};
UI.clearTags = () => { $('tags').innerHTML = ''; tagEls = {}; mapImg = null; bigImg = null; };
UI.dropTag = id => { if (tagEls[id]) { tagEls[id].remove(); delete tagEls[id]; } };
// floating damage numbers
UI.dmg = function (x, y, z, n, kind) { const s = G.R.project(x, y, z, UI.W, UI.H); if (!s) return; const el = document.createElement('div'); el.className = 'dmg ' + (kind || ''); el.textContent = kind === 'dodge' ? '회피' : n; el.style.transform = `translate(${s[0] + (Math.random() - 0.5) * 30}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; $('dmgs').appendChild(el); setTimeout(() => el.remove(), 820); };
// fishing meter
UI.fishUI = function (on, f) { const el = $('fishUI'); el.hidden = !on; if (!on || !f) return;
  $('fishMsg').textContent = f.st === 'bite' ? '입질이다! 지금 A!' : f.st === 'nibble' ? '톡… 톡… (아직 기다려요)' : f.st === 'reel' ? (f.rest > 0 ? '물고기가 지쳤다 · 지금 감아요!' : f.dir < 0 ? '◀ 왼쪽으로 달아나요 · 스틱을 오른쪽으로 ▶' : '◀ 스틱을 왼쪽으로 · 오른쪽으로 달아나요 ▶') + (f.kg > 4 ? ' · 무겁다!' : '') : '찌를 지켜보세요…';
  $('fishProg').style.width = Math.max(0, f.prog * 100) + '%'; $('fishTen').style.width = Math.min(100, f.tension * 100) + '%'; $('fishHint').textContent = f.st === 'reel' ? 'A를 누르고 있으면 감기 · 줄이 빨개지면 손을 떼요' : f.st === 'bite' ? '' : '입질이 오면 A를 누르세요 · 다른 곳을 누르면 그만둬요'; };
$('cine').addEventListener('pointerdown', e => { e.preventDefault(); G.Cine && G.Cine.skip(); });
})(window.G);
