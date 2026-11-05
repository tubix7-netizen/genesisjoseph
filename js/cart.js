/* 약속의 길 — 버금 수레 (v18.21 → v18.24)
   · 마을(성읍·서쪽·남쪽 마을)과 관저·보디발의 집 안에서는 수레를 탈 수 없어요 — 사람들이 다쳐요. 타고 들어가면 마을 어귀에서 내려요.
   · 수레 위에서는 물건을 주울 수 없어요(말은 걸 수 있어요).
   v18.23 · 요셉은 수레 바닥에 앉아서 가요. · 옆자리에 한 사람(타고 있을 때 가까운 사람에게 A키 「옆자리에 태우기」).
     · 붙잡은 죄수는 수레 뒤칸에 앉혀 데려가요.
   v18.24 · 왼쪽 「수레 부르기」: 수레가 요셉 가까운 곳에 나타나 요셉 쪽으로 달려와 멈춰요(마을 안에서는 못 불러요).
     · 수레 뒤: A키 「수레 타기」, B키 「짐칸」(12칸) — 물건을 들고 있으면 B키 「싣기」(수레 바닥에 실려요),
       따라오는 사람이 있으면 「싣기 · 이름」(뒤칸에 앉아요), 실은 것이 있으면 「내리기 · 이름」.
     · 탄 채로: A키 「내리기」(수레 뒤로 내려요), B키 「짐칸」.
     · 말 앞: A키 「먹이 주기」, B키 「쓰다듬기」(정신력 +3).
   v18.25 · 몰기: 탄 채로 A키 「전진」 — 한 번 누르면 걷기보다 조금 빠르게, 연달아 누를수록 점점 빨라지고 요셉이 고삐를 내리쳐요.
       안 누르면 천천히 느려져 멈춰요. 앉기 버튼 자리는 「정지」(달리는 중, 꾹 누를수록 세게 서요) / 「후진」(멈춘 뒤).
       B키 「내리기」, 달리기 버튼 「먹이 주기」(움직임 없이 같은 시간 기다려요), 점프 버튼 「짐칸」(멈춰 서서 옆에 사람이 있으면 「태우기」).
       수레를 쓰는 동안 달리기는 없어요. 말은 따로 기력이 있어서 빨리 달릴수록 아주 빨리 지쳐요(지치면 천천히만 가요).
     · 먹이: 곡식(꼴·짚·보리·밀·곡식 자루)이 주식 — 말 기력을 채우고 잠깐 덜 지치게 해요. 대추야자·무화과·석청·약초는 더 오래가요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t), help = (k, t, l) => G.UI.help && G.UI.help(k, t, l);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), hAt = (x, z) => Game.W().heightAt(x, z);
const Ct = G.Cart = {};
Ct.town = function (x, z) { const s = S(); for (const v of EP.villages || []) { if (v.when && !v.when(s)) continue; if (Math.hypot(v.x - x, v.z - z) < v.r + 3) return v.n; }
  if (Math.hypot(x - 10, z + 141) < 20) return '총리 관저'; if (x > -51 && x < -5 && z > 35 && z < 71) return '보디발의 집'; return null; };
const short = n => (n.name || '').split(' ').pop();
const fwd = f => [Math.sin(f), Math.cos(f)];
/* v18.24b the wagon, front to back: the horses → the driver's bench (Joseph sits here; one more beside him) → the cargo bed under a linen
   canopy (things and people that ride along). The cart's point (c.x, c.z) is the bench; the tailgate is 2.5 m behind it. */
const BENCH_Y = 0.98, BED_Y = 0.7, TAIL = 2.5;
const rearOf = c => { const [fx, fz] = fwd(c.f); return [c.x - fx * (TAIL + 0.35), c.z - fz * (TAIL + 0.35)]; };
let drive = null; /* the cart coming when called: { x0, z0, x1, z1, f, L, s, v } */
const LOAD = []; /* things laid on the cart floor: physics bodies (hidden from the world while they ride along) */

// ------------------------------------------------------------------ v18.25 driving: the reins, not the stick, set the pace
/* D.v = the wagon's speed along its heading (minus = backing up), D.thr = the pace the horses are asked for.
   A taps raise the pace (fast taps more), with no taps it ebbs away; 「정지」 brakes harder the longer it is held. */
/* v18.25b a little physics: the horses (D.hv) run at the pace the reins ask; the wagon (D.v) only moves because the traces pull it —
   a springy link (D.sx = how far the traces are stretched, minus = the wagon pushing on the pole). The wheels roll by the distance the
   wagon travels; pull hard on the reins and the horses dig in, the wheels lock and the wagon skids to a stop. */
const D = { v: 0, hv: 0, sx: 0, ca: 0, pitch: 0, lock: false, pend: null, thr: 0, last: -9, idle: 9, brake: null, holdT: 0, whipT: 0, feedT: 0, feedK: null, tired: false, dust: 0 };
const WH = { a: 0 }; /* the wheels' roll (metres travelled) */
const WALKP = 3.6, MAXV = 13;
/* horse feed: [stamina back, seconds of easy breath, note] — grain is the daily fare; the good things last longer */
const FD = { hay: [30, 40, ''], straw: [15, 25, ''], barley: [45, 60, ''], wheat: [45, 60, ''], grain: [60, 90, ''],
  dates: [55, 150, '달콤한 별미'], fig: [45, 120, '달콤한 별미'], honey: [70, 240, '귀한 석청'], herb: [40, 180, '약초 · 피로가 풀려요'] };
const driving = () => { const s = S(); return !!(s && s.q.riding && s.q.chariotOk && Game.mode === 'play' && !Game.cineOn && !(G.Cine && G.Cine.on)); };
const now = () => performance.now() / 1000;
function tapGo() { const s = S(), gap = now() - D.last; D.last = now(); D.idle = 0; D.brake = null;
  const cap = D.tired ? WALKP : MAXV, base = D.pend !== null ? D.pend : D.thr; let nt = base; if (base < WALKP) nt = WALKP; else if (gap < 0.8) nt = base + (gap < 0.45 ? 1.9 : 1.3);
  D.pend = Math.min(nt, cap); D.whipT = 0.001; /* the pace changes when the reins land on the horses' backs, not before */ sfx('whoosh', { pitch: 1.5 + Math.random() * 0.2, vol: 0.5 }); if (D.tired && gap < 0.8) G.UI.toast('말이 지쳤어요 · 먹이를 주거나 천천히 쉬게 해요');
  if (D.thr >= 9 && !s.flags.cartFast) { s.flags.cartFast = 1; help('cartFast', '힘차게 달려요', '빨리 달릴수록 말이 금방 지쳐요 · 요셉 옆의 금색 고리가 말의 기력이에요'); } G.UI.hud(); }
function brakeDown() { D.brake = Math.abs(D.v) < 0.3 ? 'rev' : 'stop'; D.holdT = 0; D.pend = null; if (D.brake === 'stop') { D.thr = 0; sfx('step', { surf: 'stone', vol: 0.4, pitch: 0.6 }); } G.UI.hud(); }
function brakeUp() { D.brake = null; G.UI.hud(); }
function driveTick2(dt) { const s = S(), riding = s.q.riding && s.q.chariotOk;
  let st = s.q.horseSt === undefined ? 100 : s.q.horseSt; if (s.q.horseBuffT > 0) s.q.horseBuffT = Math.max(0, s.q.horseBuffT - dt);
  if (!riding) { D.v = D.hv = D.sx = D.ca = 0; D.thr = 0; D.pend = null; D.lock = false; D.brake = null; s.q.horseSt = Math.min(100, st + dt * 8); if (s.q.horseSt > 35) D.tired = false; return; }
  if (D.whipT > 0) { D.whipT += dt / 0.6; if (D.pend !== null && D.whipT >= 0.42) { D.thr = D.pend; D.pend = null; D.idle = 0; if (D.thr > D.hv + 0.4) D.hv += 0.35; sfx('hit', { pitch: 1.9, vol: 0.35 }); } if (D.whipT >= 1) D.whipT = 0; }
  if (D.feedT > 0) { D.feedT -= dt; if (D.feedT <= 0) { D.feedT = 0; feedDone(D.feedK); } }
  D.idle += dt; if (D.idle > 2.2) D.thr = Math.max(0, D.thr - dt * (D.thr > WALKP ? 1.1 : 0.45)); /* no taps: the horses ease off and stop */
  if (G.UI.busy()) D.thr = Math.max(0, D.thr - dt * 3);
  if (D.brake) { D.holdT += dt; D.thr = 0; }
  const stF = 0.35 + 0.65 * Math.min(1, st / 40), want = D.brake === 'rev' ? -1.9 : D.thr;
  const aUp = (D.hv < WALKP ? 2.3 : 1.75) * stF, aDn = D.brake === 'stop' ? 3 + 6.5 * Math.min(1, D.holdT / 0.9) : 1.1;
  D.lock = D.brake === 'stop' && D.holdT > 0.3 && D.v > 1.2; /* a hard pull: the wheels stop turning and slide */
  const n = 4, h = dt / n; let caS = 0;
  for (let i = 0; i < n; i++) { const ha = Math.max(-aDn, Math.min(aUp, (want - D.hv) * 2.6)), T = 18 * D.sx + 4.5 * (D.hv - D.v); /* trace tension (per unit of wagon mass) */
    const roll = (0.12 + 0.004 * D.v * D.v) * Math.sign(D.v) + (D.lock ? 3.2 * Math.sign(D.v) : 0), ca = T - roll;
    D.hv += (ha - T * 0.22) * h; D.v += ca * h; if (Math.abs(D.v) < 0.04 && Math.abs(T) < 0.25 && Math.abs(want) < 0.05) D.v = 0;
    D.sx = Math.max(-0.22, Math.min(0.22, D.sx + (D.hv - D.v) * h)); caS += ca / n; }
  D.ca = caS; D.pitch += (Math.max(-0.045, Math.min(0.045, -caS * 0.011)) - D.pitch) * Math.min(1, dt * 6); /* the body nods forward when it brakes, back when it surges */
  if (!D.lock) WH.a += D.v * dt;
  if (D.lock && (D.dust -= dt) <= 0) { D.dust = 0.09; const p = P(); for (const sd of [1, -1]) G.FX && G.FX.burst(p.x - Math.sin(p.face) * 1.95 + Math.cos(p.face) * sd * 0.88, p.y + 0.05, p.z - Math.cos(p.face) * 1.95 - Math.sin(p.face) * sd * 0.88, 2, { c: [0.85, 0.76, 0.6], sp: 0.6, up: 0.5, size: 0.28, a: 0.55, g: 0.3 });
    sfx('step', { surf: 'stone', vol: 0.25, pitch: 0.45 + Math.random() * 0.1 }); }
  const buff = s.q.horseBuffT > 0; if (D.hv > 4.2) st -= (D.hv - 4.2) * 1.8 * dt * (buff ? 0.45 : 1); else st += dt * (Math.abs(D.hv) < 0.3 ? 11 : 5);
  st = Math.max(0, Math.min(100, st)); s.q.horseSt = st;
  if (st <= 0 && !D.tired) { D.tired = true; D.thr = Math.min(D.thr, WALKP); pop('말이 지쳤어요', '천천히 가며 쉬게 하거나 먹이를 주어요', 'donkey'); } if (D.tired && st > 35) D.tired = false;
  if (D.tired) { D.thr = Math.min(D.thr, WALKP); if (D.pend !== null) D.pend = Math.min(D.pend, WALKP); }
  const p = P(); p.sprint = false; }
/* called by the movement code while on the wagon: the stick turns the horses (slowly, slower the faster they go), the reins give the speed */
Ct.steer = function (dt, mag, dx, dz) { const p = P(), v = D.v, av = Math.abs(v);
  if (mag > 0) { let want = Math.atan2(dx, dz); if (v < -0.1) want += Math.PI; const df = Game.angDiff ? Game.angDiff(p.face, want) : Math.atan2(Math.sin(want - p.face), Math.cos(want - p.face));
    const mt = Math.max(0.7, Math.min(1.9, 1.9 - av * 0.11)) * dt * (0.25 + 0.75 * Math.min(1, av / 1.2)); p.face += Math.max(-mt, Math.min(mt, df));
    if (av > 4 && Math.abs(df) > 0.9) D.v -= Math.sign(v) * dt * 2.2 * Math.min(1, (Math.abs(df) - 0.9) / 1.2); }
  return [Math.sin(p.face) * D.v, Math.cos(p.face) * D.v]; };
Ct.jumpLabel = () => driving() ? (paxCand() ? '태우기' : '짐칸') : null; Ct.speed = () => D.v; Ct.hv = () => D.hv; Ct.sx = () => D.sx;
/* the horses' stamina ring (shown in place of Joseph's while he drives) */
Ct.ring = () => { const s = S(); if (!s || !driving()) return null; const st = s.q.horseSt === undefined ? 100 : s.q.horseSt; return { f: st / 100, tired: D.tired, buff: s.q.horseBuffT > 0 }; };
/* the buttons while driving: 달리기 → 먹이 주기, 점프 → 짐칸(태우기), 앉기 → 정지/후진 */
const BTN = { btnRun: () => feedRide(), btnJump: () => jumpBtn(), btnCrouch: () => brakeDown() };
addEventListener('pointerdown', e => { if (!driving() || G.UI.busy() || !e.target.closest) return; const b = e.target.closest('#btnRun,#btnJump,#btnCrouch'); if (!b) return;
  e.stopPropagation(); e.preventDefault(); BTN[b.id](); }, true);
for (const t of ['pointerup', 'pointercancel']) addEventListener(t, e => { if (D.brake && e.target.closest && e.target.closest('#btnCrouch')) brakeUp(); if (driving() && e.target.closest && e.target.closest('#btnJump,#btnRun,#btnCrouch')) e.stopPropagation(); }, true);
addEventListener('pointerup', () => { if (D.brake) brakeUp(); }); /* (finger slid off the button) */
addEventListener('keydown', e => { if (!driving() || G.UI.busy() || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const c = e.code;
  if (c === 'ShiftLeft' || c === 'ShiftRight') { e.stopPropagation(); if (!e.repeat) feedRide(); }
  else if (c === 'Space') { e.stopPropagation(); e.preventDefault(); if (!e.repeat) jumpBtn(); }
  else if (c === 'KeyC' || c === 'ControlLeft') { e.stopPropagation(); if (!e.repeat) brakeDown(); } }, true);
addEventListener('keyup', e => { if (D.brake && (e.code === 'KeyC' || e.code === 'ControlLeft')) brakeUp(); if (driving() && /Shift/.test(e.code)) e.stopPropagation(); }, true);
const LBL = { btnRun: '달리기', btnJump: null, btnCrouch: '앉기' }; let lblOn = false;
function driveLabels() { const on = driving(), set = (id, t) => { const b = document.getElementById(id); if (b && b.textContent !== t) b.textContent = t; };
  if (on) { lblOn = true; set('btnRun', D.feedT > 0 ? '먹이는 중' : '먹이 주기'); set('btnJump', paxCand() ? '태우기' : '짐칸');
    set('btnCrouch', D.brake === 'rev' || (Math.abs(D.v) < 0.3 && !D.brake) || D.v < -0.1 ? '후진' : '정지');
    const r = document.getElementById('btnRun'); if (r) r.classList.toggle('on', D.feedT > 0); const c = document.getElementById('btnCrouch'); if (c) c.classList.toggle('on', !!D.brake); }
  else if (lblOn) { lblOn = false; set('btnRun', '달리기'); set('btnCrouch', '앉기'); const c = document.getElementById('btnCrouch'); if (c) c.classList.remove('on'); } }

// ------------------------------------------------------------------ getting on and off
function mount() { const s = S(), c = s.q.cartAt; if (!c || drive) return; const t = Ct.town(c.x, c.z); if (t) { pop('여기선 못 타요', `${t} 안이에요 · 넓은 곳에서 타요`, 'donkey'); return; }
  Game.teleport(c.x, c.z, c.f); s.q.riding = 1; s.q.rode = 1; sfx('whoosh'); Game.checkStep(); Game.snapCam && Game.snapCam();
  D.v = D.hv = D.sx = 0; D.thr = 0; D.pend = null; D.brake = null; D.whipT = 0; if (s.q.horseSt === undefined) s.q.horseSt = 100;
  if (!help('cartDrive', '수레 몰기', 'A키 전진 — 연달아 누를수록 빨라져요 · 안 누르면 천천히 서요 · 「정지」 꾹 누르면 급정거, 멈춘 뒤엔 「후진」 · B키 내리기 · 달리기 버튼 먹이 주기 · 점프 버튼 짐칸')) pop('수레에 탔어요', 'A키를 연달아 누르면 점점 빨라져요', 'donkey'); G.UI.hud(); }
function dismount(quiet) { const s = S(), p = P(); if (!s.q.riding) return; D.v = 0; D.thr = 0; D.brake = null; D.feedT = 0; s.q.cartAt = { x: p.x, z: p.z, f: p.face }; s.q.riding = 0;
  const [rx, rz] = rearOf(s.q.cartAt), [fx, fz] = fwd(p.face); Game.teleport(rx - fx * 0.5, rz - fz * 0.5, p.face); sfx('step'); Game.snapCam && Game.snapCam(); if (!quiet) pop('수레에서 내렸어요', '수레는 여기 서 있어요', 'donkey'); G.UI.hud(); }
Ct.mount = mount; Ct.dismount = dismount;
// the left button: 「수레 부르기」 (no 「타기/내리기」 there any more — that is A at the cart)
const e = (EP.extra || []).find(x => x.id === 'chariot');
if (e) { const on0 = e.on; e.on = (s, g) => (on0 ? on0(s, g) : true) && !s.q.riding && !(G.Caves && G.Caves.inside()) && !(G.Cave && G.Cave.inside()) && !(G.Byblos && G.Byblos.inBy && G.Byblos.inBy()); /* (not underground or overseas) */ e.label = () => '수레 부르기'; e.click = () => Ct.call(); }
Ct.call = function () { const s = S(), p = P(), W = Game.W(); if (s.q.riding || drive) return;
  const t = Ct.town(p.x, p.z); if (t) { pop('여기선 못 불러요', `${t} 안이에요 · 마을 밖으로 나가서 불러요`, 'donkey'); return; }
  const c = s.q.cartAt, wet = (x, z) => W.water && hAt(x, z) < W.water.level - 0.25, open = (x, z) => !wet(x, z) && !Ct.town(x, z) && W.ray(x, hAt(x, z) + 1, z, p.x, p.y + 1, p.z) > 0.97;
  if (c && Math.hypot(c.x - p.x, c.z - p.z) < 7) { pop('수레가 바로 옆에 있어요', '수레 뒤에서 A키로 타요', 'donkey'); return; }
  let from = c && Math.hypot(c.x - p.x, c.z - p.z) < 80 && open(c.x, c.z) ? { x: c.x, z: c.z } : null;
  if (!from) { const a0 = Game.CAM.yaw; /* from somewhere you can see, off to one side of the view */
    for (const da of [0.9, -0.9, 1.6, -1.6, 0.4, -0.4, 2.3, -2.3, 3.14]) for (const R of [22, 16, 11]) { const a = a0 + Math.PI + da, x = p.x + Math.sin(a) * R, z = p.z + Math.cos(a) * R; if (open(x, z)) { from = { x, z }; break; } } }
  if (!from) { pop('수레가 올 길이 없어요', '조금 더 트인 곳에서 불러요', 'donkey'); return; }
  let ux = from.x - p.x, uz = from.z - p.z; const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul; const vx = uz, vz = -ux;
  const x1 = p.x + ux * 1.2 + vx * 2.5, z1 = p.z + uz * 1.2 + vz * 2.5, f = Math.atan2(x1 - from.x, z1 - from.z), L = Math.hypot(x1 - from.x, z1 - from.z);
  drive = { x0: from.x, z0: from.z, x1, z1, f, L, s: 0, v: 0, hoof: 0 }; s.q.cartAt = { x: from.x, z: from.z, f }; sfx('whoosh', { pitch: 0.8 });
  pop('수레를 불렀어요', '말이 달려와요', 'donkey'); };
function driveTick(dt) { const s = S(), d = drive; if (!d) return; const rem = d.L - d.s; d.v = rem < 6 ? Math.max(1.1, Math.min(d.v, rem * 1.25)) : Math.min(7.5, d.v + dt * 6); d.s = Math.min(d.L, d.s + d.v * dt);
  WH.a += d.v * dt; const u = d.L > 0 ? d.s / d.L : 1; s.q.cartAt = { x: d.x0 + (d.x1 - d.x0) * u, z: d.z0 + (d.z1 - d.z0) * u, f: d.f }; HR.ph += d.v * dt * 1.6;
  d.hoof += d.v * dt; if (d.hoof > 1.3) { d.hoof = 0; sfx('step', { surf: 'stone', vol: 0.3 + d.v / 30, pitch: 0.7 + Math.random() * 0.2, x: s.q.cartAt.x, z: s.q.cartAt.z }); }
  if (d.s >= d.L - 0.01) { drive = null; HR.spd = 0; sfx('blip', { pitch: 0.55 }); if (!help('cart', '버금 수레', '수레 뒤에서 A키 타기 · B키 짐칸(들고 있으면 싣기) · 말 앞에서 A키 먹이 주기 · B키 쓰다듬기')) pop('수레가 왔어요', '수레 뒤에서 A키로 타요', 'donkey'); }
  else HR.spd = d.v; }

let cool = 0, bKey = '';
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; const dd = typeof dt === 'number' && dt < 1 ? dt : 1 / 60; cool -= dd;
  try { driveTick(dd); cartPeople(); cartSolid(); } catch (er) { console.error('cart', er); }
  document.body.classList.toggle('riding', !!s.q.riding); driveLabels();
  try { driveTick2(dd); Ct.helpTick && Ct.helpTick(dd); } catch (er) { console.error('cart drive', er); }
  if (s.q.riding && cool <= 0 && !(G.Cine && G.Cine.on)) { const t = Ct.town(P().x, P().z); if (t) { cool = 2; dismount(true); pop('수레에서 내렸어요', `${t} 안에서는 걸어요`, 'donkey'); } }
  { const b = Ct.bCtx(), k = b ? b.k + b.label : ''; if (k !== bKey) { bKey = k; G.UI.hud(); } } /* B follows where you stand at once (the HUD only refreshes twice a second) */
  return r; };
/* seated on the cart's floor instead of standing at the reins */
const ry0 = EP.rootY; EP.rootY = function (s, g) { const b = ry0 ? ry0.apply(this, arguments) || 0 : 0; return s && s.q && s.q.riding && s.q.chariotOk ? b + (BENCH_Y - 0.46) : b; }; /* (episode base 0.46 + this = on the bench cushion) */
const pose0 = EP.pose; EP.pose = function (pst, s, g) { const r = pose0 ? pose0.apply(this, arguments) : undefined; if (s.q.riding && s.q.chariotOk) { pst.act = 'reins'; pst.actT = D.brake === 'stop' ? 1 + Math.min(1, D.holdT * 4) : D.whipT; /* (1..2 = pulling the reins back) */ pst.sit = false; } /* v18.25 hands on the reins; a tap of 전진 flicks them */ return r; };

/* v18.24 the wagon is solid: riding, its whole length (tailgate, bed, pole, horses) is kept out of walls and houses — the push on any
   part moves the whole team; parked, Joseph walks round it instead of through it */
const PROBE = [[-2.35, 0.75], [-1.2, 0.8], [0.2, 0.75], [1.5, 0.35], [2.6, 0.7], [3.5, 0.55]];
function cartSolid() { const s = S(), p = P(), W = Game.W(); if (!W || Game.cineOn || (G.Cine && G.Cine.on)) return;
  if (s.q.riding && s.q.chariotOk) { for (let it = 0; it < 2; it++) { let mx = 0, mz = 0, hit = false; const [fx, fz] = fwd(p.face);
      for (const [lz, r] of PROBE) { const q = { x: p.x + fx * lz, z: p.z + fz * lz }, x0 = q.x, z0 = q.z; W.collide(q, r, p.y + 0.2); const ddx = q.x - x0, ddz = q.z - z0; if (Math.abs(ddx) + Math.abs(ddz) > 1e-4) { hit = true; if (Math.abs(ddx) > Math.abs(mx)) mx = ddx; if (Math.abs(ddz) > Math.abs(mz)) mz = ddz; } }
      if (!hit) break; p.x += mx; p.z += mz; const vn = p.vx * fx + p.vz * fz; if (vn * (mx * fx + mz * fz) < 0) { p.vx *= 0.3; p.vz *= 0.3; D.v *= 0.3; D.hv *= 0.3; D.sx = 0; D.thr = Math.min(D.thr, WALKP); } } return; }
  const c = parked(); if (!c || Math.hypot(c.x - p.x, c.z - p.z) > 8) return; const [fx, fz] = fwd(c.f), sx = fz, sz = -fx; /* (sx, sz) = the wagon's right */
  for (const [z0, z1, hw] of [[-TAIL - 0.05, 0.65, 0.95], [1.6, 3.9, 0.95]]) { const dx = p.x - c.x, dz = p.z - c.z, lx = dx * sx + dz * sz, lz = dx * fx + dz * fz, r = 0.32;
    if (lx > -hw - r && lx < hw + r && lz > z0 - r && lz < z1 + r) { const pen = [hw + r - lx, lx + hw + r, z1 + r - lz, lz - z0 + r], m = Math.min(...pen); let nx = lx, nz = lz;
      if (m === pen[0]) nx = hw + r; else if (m === pen[1]) nx = -hw - r; else if (m === pen[2]) nz = z1 + r; else nz = z0 - r; p.x = c.x + nx * sx + nz * fx; p.z = c.z + nx * sz + nz * fz; } } }
// ------------------------------------------------------------------ people in the cart: one beside Joseph, the loaded ones (and caught prisoners) in the back
const cartPos = () => { const s = S(), p = P(); return s.q.riding ? { x: p.x, z: p.z, f: p.face } : s.q.cartAt; };
const seatAt = (n, c, side, back, y) => { const f = c.f, x = c.x + Math.cos(f) * side - Math.sin(f) * back, z = c.z - Math.sin(f) * side - Math.cos(f) * back;
  n.x = x; n.z = z; n.y = hAt(c.x, c.z) + (y === undefined ? BED_Y : y); n.face = f; n.homeFace = f; n.walk = null; n.wander = null; n.act = 'sitg'; n.pass = true; n._inCart = true; if (n.col) { n.col.x = x; n.col.z = z; } };
const unseat = (n, side) => { const p = P(), f = p.face; n.pass = false; n._inCart = false; if (n.act === 'sitg') n.act = null; n.x = p.x + Math.cos(f) * (side || 1.4); n.z = p.z - Math.sin(f) * (side || 1.4); n.y = hAt(n.x, n.z); };
const goHome = n => { if (n.d.folk) n.schedSlot = -1; else Game.npcWalk(n.id, n.d.x, n.d.z, () => { n.face = n.homeFace = n.d.face || 0; }, 1.6); };
function cartPeople() { const s = S(), c = cartPos(); let k = 0;
  if (!s.q.riding) { if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n) { unseat(n, 1.4); goHome(n); } s.q.cartPax = null; }
    for (const n of P().follow || []) if (n._inCart && !n._cartBack) unseat(n, -1.6); }
  else if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n && n.vis) seatAt(n, c, -0.42, 0.02, BENCH_Y); else s.q.cartPax = null; }
  if (!c) return;
  for (const L of LOAD) if (L.n) { const n = L.n; if (!n.vis) continue; seatAt(n, c, k % 2 ? 0.36 : -0.36, 1.3 + Math.floor(k / 2) * 0.6); k++; }
  if (s.q.riding) for (const n of P().follow || []) if (/^cul/.test(n.id) && !n._cartBack) { seatAt(n, c, k % 2 ? 0.36 : -0.36, 1.3 + Math.floor(k / 2) * 0.6); k++; } }
/* v18.25 on the wagon A is 「전진」 (always first — get down with B to talk to someone) */
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || !s.q.chariotOk || Game.cineOn || G.UI.busy()) return null;
  return [{ d: -9, label: D.feedT > 0 ? '전진 · 먹이는 중' : D.thr > 0.5 || D.v > 0.5 ? '전진 · 더 빨리' : '전진', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartGo', use: tapGo }]; });
const paxCand = () => { const s = S(), p = P(); if (s.q.cartPax || Math.abs(D.v) > 0.3) return null; let best = null, bd = 2.8;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n.d.animal || n.d.noTalk === true || n.sleep || n.talking || n.follow || n._inCart || n.d.fixed || n.d.sit || n.seatY) continue; const tg = Game.curTarget; if (tg && tg.npc === id) continue;
    const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < bd) { bd = d; best = n; } } return best; };
function takePax(n) { const s = S(); s.q.cartPax = n.id; G.UI.say([{ n: n.name, t: '우와, 총리님 수레에 타 보다니요!' }], () => { }); pop('옆자리에 태웠어요', n.name, 'donkey'); }
function jumpBtn() { const n = paxCand(); if (n) takePax(n); else G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12); }

// ------------------------------------------------------------------ at the parked cart: behind it, and by the horses
const HR = { rigs: null, ph: 0, spd: 0 }, CM = G.m4(), HM = [G.m4(), G.m4()], LM = [G.m4(), G.m4(), G.m4(), G.m4()];
let cartMesh = null;
const horsePos = (c, i) => { const s = i ? 1 : -1, f = c.f; return [c.x + Math.sin(f) * 2.6 + Math.cos(f) * s * 0.55, c.z + Math.cos(f) * 2.6 - Math.sin(f) * s * 0.55]; };
const parked = () => { const s = S(); return !s.q.riding && s.q.chariotOk && s.q.cartAt ? s.q.cartAt : null; };
const rearD = () => { const c = parked(); if (!c || drive) return null; const [rx, rz] = rearOf(c); return Math.hypot(rx - P().x, rz - P().z); };
const nearHorse = () => { const c = parked(); if (!c || drive) return null; let bd = 1e9; for (const i of [0, 1]) { const [hx, hz] = horsePos(c, i); bd = Math.min(bd, Math.hypot(hx - P().x, hz - P().z)); } return bd < 2.3 ? bd : null; };
const FEED = Object.keys(FD);
/* v18.24 feeding and stroking are real motions: Joseph turns to the horse, reaches out, and only when the motion is over does the next thing happen */
function act(k, dur, fn) { const p = P(), c = parked(); if (!c || p.act) return; const [hx, hz] = horsePos(c, Math.hypot(horsePos(c, 0)[0] - p.x, horsePos(c, 0)[1] - p.z) < Math.hypot(horsePos(c, 1)[0] - p.x, horsePos(c, 1)[1] - p.z) ? 0 : 1);
  p.face = Math.atan2(hx - p.x, hz - p.z); p.vx = p.vz = 0; Object.assign(p, { act: k, actT: 0, actDur: dur, actHits: 1, actFn: fn, actProp: null, fired: false, actRepeat: false }); }
/* what to feed: pick when there is more than one kind (grain first in the list) */
function chooseFeed(go) { const ks = FEED.filter(x => Game.inv(x) > 0); if (!ks.length) { G.UI.toast('말 먹이가 없어요 · 꼴·짚·보리·밀 같은 곡식을 주어요'); return; }
  if (ks.length === 1) { go(ks[0]); return; }
  G.UI.choose('무엇을 먹일까요?', ks.map(k => `${Game.ITEMS[k] ? Game.ITEMS[k].n : k} (${Game.inv(k)}) · 말 기력 +${FD[k][0]} · ${FD[k][1]}초 덜 지쳐요`), i => go(ks[i])); }
function feed() { chooseFeed(k => { S().flags.horseEat = Date.now() + 5200; sfx('pickup', { pitch: 0.8 }); act('reach', 1.9, () => feedDone(k)); }); }
/* from the bench (the 달리기 button while riding): no motion, but the same wait before it takes effect */
function feedRide() { if (D.feedT > 0) return; chooseFeed(k => { D.feedT = 1.9; D.feedK = k; sfx('pickup', { pitch: 0.8 }); G.UI.toast('말에게 먹이를 건네요…'); G.UI.hud(); }); }
function feedDone(k) { const s = S(); if (Game.inv(k) <= 0) return; const [add, sec, kind] = FD[k];
  Game.take(k, 1); s.q.horseSt = Math.min(100, (s.q.horseSt === undefined ? 100 : s.q.horseSt) + add); s.q.horseBuffT = Math.max(s.q.horseBuffT || 0, sec); if (s.q.horseSt > 35) D.tired = false; sfx('blip', { pitch: 0.5 });
  pop('말이 먹이를 먹어요', `${Game.ITEMS[k] ? Game.ITEMS[k].n : k} · 말 기력 +${add} · ${sec >= 120 ? Math.round(sec / 60) + '분' : sec + '초'} 동안 덜 지쳐요${kind ? ' (' + kind + ')' : ''}`, 'donkey'); G.UI.hud(); }
function pet() { act('reach', 1.5, petDone); }
function petDone() { const H = S().hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 3); sfx('blip', { pitch: 0.6 }); pop('히히힝~', '말이 좋아해요 · 정신력 +3', 'donkey'); G.UI.hud(); }
const follower = () => { for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.vis && (n.follow || (P().follow || []).includes(n)) && !n._cartBack && !n.d.animal && Math.hypot(n.x - P().x, n.z - P().z) < 6) return n; } return null; };
function loadHeld() { const b = G.Phys && G.Phys.held; if (!b) return; if (LOAD.length >= 4) { G.UI.toast('수레 바닥이 꽉 찼어요'); return; } G.Phys.drop(); b.gone = true; b._onCart = true; LOAD.push({ b }); sfx('pickup', { pitch: 0.8 }); pop('수레에 실었어요', b.K.n, 'donkey'); G.UI.hud(); }
function loadMan(n) { if (LOAD.length >= 4) { G.UI.toast('수레가 꽉 찼어요'); return; } n._cartBack = true; n._wasFollow = !!n.follow; if (n.follow && !/^cul/.test(n.id)) n.follow = false; LOAD.push({ n }); sfx('step'); pop('수레 뒤칸에 태웠어요', n.name, 'donkey'); G.UI.hud(); }
function unloadLast() { const L = LOAD.pop(); if (!L) return; const p = P();
  if (L.b) { const b = L.b; b.gone = false; b._onCart = false; b.x = p.x + Math.sin(p.face) * 0.6; b.z = p.z + Math.cos(p.face) * 0.6; b.y = hAt(b.x, b.z) + b.K.r; b.vx = b.vy = b.vz = 0; if (G.Phys.held) G.Phys.drop(); G.Phys.pick(b); pop('수레에서 내렸어요', b.K.n, 'donkey'); }
  else { const n = L.n; n._cartBack = false; unseat(n, -1.2); if (n._wasFollow) n.follow = true; pop('내려 주었어요', n.name, 'donkey'); }
  G.UI.hud(); }
const loadName = L => L.b ? L.b.K.n : short(L.n);
/* B, by the cart: what it does depends on where Joseph stands and what is in his arms */
Ct.bCtx = function () { const s = S(), p = P(); if (!s || Game.mode !== 'play' || Game.cineOn || G.UI.busy() || p.act) return null;
  if (s.q.riding) return { k: 'off', label: '내리기', fn: () => { if (Math.abs(D.v) > 1.6) { G.UI.toast('먼저 수레를 세워요 · 「정지」를 꾹 눌러요'); return; } dismount(); } };
  const r = rearD(); if (r !== null && r < 1.9) { if (G.Phys && G.Phys.held) return { k: 'load', label: '싣기', fn: loadHeld };
    const n = follower(); if (n) return { k: 'loadN', label: `싣기 · ${short(n)}`, fn: () => loadMan(n) };
    if (LOAD.length) return { k: 'unload', label: `내리기 · ${loadName(LOAD[LOAD.length - 1])}`, fn: unloadLast };
    return { k: 'box', label: '짐칸', fn: () => G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12) }; }
  if (nearHorse() !== null && !(G.Phys && G.Phys.held)) return { k: 'pet', label: '쓰다듬기', fn: pet };
  return null; };
Ct.feedCtx = () => null; /* (v18.23's B 「먹이 주기」 is A now) */
Game.CTX.push(function (s) { const p = P(); if (p.act || Game.cineOn || s.q.riding) return null; const c = parked(); if (!c) return null; const out = [];
  const r = rearD(); if (r !== null && r < 1.9) { const [rx, rz] = rearOf(c); out.push({ d: r - 0.4, label: '수레 타기', x: rx, z: rz, y: 1.2, noMagnet: true, key: 'cartOn', use: mount }); }
  else if (!drive) { const [fx, fz] = fwd(c.f), dx = p.x - c.x, dz = p.z - c.z, lz = dx * fx + dz * fz, lx = dx * fz - dz * fx; /* v18.29 beside the wagon too, not only behind it */
    if (lz > -TAIL - 0.3 && lz < 0.9 && Math.abs(lx) < 2.3) out.push({ d: Math.abs(lx) - 0.9, label: '수레 타기', x: c.x, z: c.z, y: 1.4, noMagnet: true, key: 'cartOn', use: mount }); }
  const h = nearHorse(); if (h !== null) { const [hx, hz] = horsePos(c, 0); out.push({ d: h - 0.6, label: '먹이 주기', x: hx, z: hz, y: 1.8, noMagnet: true, key: 'horseFeed', use: feed }); }
  return out.length ? out : null; });
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const b = Ct.bCtx(); if (b) { b.fn(); return; } return atk0.apply(this, arguments); }; }
{ const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const f = Game.mode === 'play' && Ct.bCtx(), b = document.getElementById('btnAtk'); if (f && b) { b.hidden = false; document.getElementById('btnAtkL').textContent = f.label; const n = document.getElementById('btnAtkN'); if (n) n.hidden = true; } driveLabels(); } catch (e) { } return r; }; }
// picking a loaded thing up from the cart by hand takes it off the load
if (G.Phys) { const pk0 = G.Phys.pick; G.Phys.pick = function (b) { const i = LOAD.findIndex(L => L.b === b); if (i >= 0 && b._onCart) { LOAD.splice(i, 1); b._onCart = false; b.gone = false; } return pk0.apply(this, arguments); }; }

/* v18.24c the royal wagon in white and gold: open spoked wheels (you see through them), a white driver's box with a gold sun disc,
   a white coach-bed framed in gold with lapis panels, a white linen canopy on gold posts with a gold fringe and finials */
function wagon() { const g = new G.GB(43), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, IVORY = 0xe6dccb, LAPIS = 0x2c4f9a, RED = 0xa83a2a;
  // undercarriage (white beams, gold axles); the four open wheels are their own meshes so they can roll (wheelMesh)
  for (const sx of [1, -1]) g.box(0.09, 0.1, 3.0, { at: [sx * 0.55, 0.58, -1.0], c: IVORY });
  g.cyl(0.035, 0.035, 1.8, 8, { at: [0, 0.6, -1.95], rz: PI / 2, c: GOLD }); g.cyl(0.035, 0.035, 1.72, 8, { at: [0, 0.45, 0.05], rz: PI / 2, c: GOLD });
  // the driver's box: a white body with gold edges, a raised dashboard with a gold sun disc, a lapis cushion, a white backrest with gold rail and finials
  g.box(1.36, 0.28, 0.85, { at: [0, 0.74, 0.02], c: WHITE }); g.box(1.4, 0.05, 0.89, { at: [0, 0.885, 0.02], c: GOLD }); g.box(1.4, 0.05, 0.89, { at: [0, 0.6, 0.02], c: GOLD });
  g.box(1.3, 0.42, 0.07, { at: [0, 1.05, 0.46], rx: -0.25, c: WHITE }); g.box(1.36, 0.05, 0.1, { at: [0, 1.25, 0.51], rx: -0.25, c: GOLD });
  g.cyl(0.13, 0.13, 0.03, 16, { at: [0, 1.05, 0.505], rx: PI / 2 - 0.25, c: GOLDH }); for (const sx of [1, -1]) g.box(0.26, 0.05, 0.02, { at: [sx * 0.24, 1.07, 0.5], rx: -0.25, ry: sx * 0.25, c: GOLD });
  g.box(1.18, 0.12, 0.5, { at: [0, 0.94, -0.08], c: LAPIS }); g.box(1.2, 0.03, 0.52, { at: [0, 1.0, -0.08], c: GOLD });
  g.box(1.3, 0.48, 0.08, { at: [0, 1.22, -0.38], c: WHITE }); g.box(1.36, 0.06, 0.12, { at: [0, 1.48, -0.38], c: GOLD });
  for (const sx of [1, -1]) { g.box(0.07, 0.34, 0.75, { at: [sx * 0.66, 1.04, 0.02], c: WHITE }); g.box(0.09, 0.04, 0.77, { at: [sx * 0.66, 1.22, 0.02], c: GOLD }); g.sph(0.06, 8, 6, { at: [sx * 0.66, 1.54, -0.38], c: GOLDH }); }
  // the coach-bed: white walls framed in gold, lapis panels with gold rosettes, a gold rail, a white tailgate
  g.box(1.5, 0.08, 1.95, { at: [0, BED_Y - 0.04, -1.45], c: IVORY });
  for (const sx of [1, -1]) { g.box(0.06, 0.5, 1.95, { at: [sx * 0.75, BED_Y + 0.23, -1.45], c: WHITE }); g.box(0.08, 0.05, 2.0, { at: [sx * 0.75, BED_Y + 0.5, -1.45], c: GOLD }); g.box(0.08, 0.04, 2.0, { at: [sx * 0.75, BED_Y + 0.0, -1.45], c: GOLD });
    for (let i = 0; i < 3; i++) { const z = -0.8 - i * 0.62; g.box(0.012, 0.3, 0.46, { at: [sx * 0.785, BED_Y + 0.25, z], c: LAPIS, j: 0 }); g.cyl(0.06, 0.06, 0.02, 10, { at: [sx * 0.795, BED_Y + 0.25, z], rz: PI / 2, c: GOLDH, j: 0 }); }
    for (let i = 0; i < 4; i++) g.box(0.085, 0.5, 0.05, { at: [sx * 0.755, BED_Y + 0.25, -0.5 - i * 0.62], c: GOLD }); }
  g.box(1.5, 0.44, 0.06, { at: [0, BED_Y + 0.2, -TAIL + 0.08], c: WHITE }); g.box(1.54, 0.05, 0.09, { at: [0, BED_Y + 0.44, -TAIL + 0.08], c: GOLD }); g.cyl(0.09, 0.09, 0.02, 12, { at: [0, BED_Y + 0.22, -TAIL + 0.04], rx: PI / 2, c: GOLDH });
  // the canopy: gold posts, a white linen roof, a red-and-gold border with a short gold fringe, gold finials at the corners and a sun disc on top
  for (const sx of [1, -1]) for (const z of [-0.55, -2.35]) { g.cyl(0.03, 0.03, 1.1, 8, { at: [sx * 0.72, BED_Y + 0.75, z], c: GOLD }); g.sph(0.055, 8, 6, { at: [sx * 0.8, BED_Y + 1.42, z], c: GOLDH }); }
  g.box(1.66, 0.05, 2.04, { at: [0, BED_Y + 1.32, -1.45], c: WHITE }); g.box(1.2, 0.12, 1.6, { at: [0, BED_Y + 1.4, -1.45], taper: 0.55, c: WHITE });
  for (const sx of [1, -1]) { g.box(0.03, 0.12, 2.04, { at: [sx * 0.83, BED_Y + 1.25, -1.45], c: RED }); g.box(0.035, 0.03, 2.04, { at: [sx * 0.835, BED_Y + 1.19, -1.45], c: GOLD }); for (let i = 0; i < 10; i++) g.box(0.02, 0.08, 0.05, { at: [sx * 0.835, BED_Y + 1.13, -0.5 - i * 0.21], c: GOLDH, j: 0 }); }
  for (const sz of [1, -1]) { g.box(1.66, 0.12, 0.03, { at: [0, BED_Y + 1.25, -1.45 + sz * 1.02], c: RED }); g.box(1.66, 0.03, 0.035, { at: [0, BED_Y + 1.19, -1.45 + sz * 1.025], c: GOLD }); }
  g.cyl(0.16, 0.16, 0.03, 18, { at: [0, BED_Y + 1.62, -1.45], rx: PI / 2, c: GOLDH }); g.cyl(0.025, 0.025, 0.18, 6, { at: [0, BED_Y + 1.5, -1.45], c: GOLD });
  // the pole (white, gold-capped) and the yoke over the horses
  g.box(0.09, 0.09, 2.6, { at: [0, 0.64, 1.75], rx: -0.08, c: WHITE }); for (const z of [0.8, 1.75, 2.7]) g.box(0.11, 0.11, 0.06, { at: [0, 0.64 + (z - 1.75) * 0.08, z], rx: -0.08, c: GOLD });
  g.box(1.6, 0.08, 0.08, { at: [0, 1.12, 3.0], c: WHITE }); for (const sx of [1, -1]) g.sph(0.06, 8, 6, { at: [sx * 0.82, 1.12, 3.0], c: GOLDH }); g.sph(0.08, 8, 6, { at: [0, 1.12, 3.0], c: GOLD });
  return g; }
/* one open spoked wheel centred on its hub (axle along x), white and gold */
function wheelMesh(r, n) { const g = new G.GB(44 + n), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, N = 22, seg = 2 * PI * r / N * 1.12;
  for (let k = 0; k < N; k++) { const a = k / N * 2 * PI; g.box(0.075, 0.07, seg, { at: [0, Math.cos(a) * (r - 0.035), Math.sin(a) * (r - 0.035)], rx: a, c: GOLD, j: 0 });
    g.box(0.085, 0.025, seg, { at: [0, Math.cos(a) * (r - 0.085), Math.sin(a) * (r - 0.085)], rx: a, c: WHITE, j: 0 }); }
  for (let k = 0; k < n; k++) g.box(0.035, 0.035, (r - 0.08) * 2, { at: [0, 0, 0], rx: k * PI / n, c: k % 2 ? GOLD : WHITE, j: 0 });
  g.cyl(0.1, 0.1, 0.16, 12, { at: [0, 0, 0], rz: PI / 2, c: GOLD, j: 0 }); g.cyl(0.055, 0.055, 0.2, 10, { at: [0, 0, 0], rz: PI / 2, c: GOLDH, j: 0 }); return G.R.mesh(g); }
const WHEELS = [[0.88, -1.95, 0.6, 12], [-0.88, -1.95, 0.6, 12], [0.84, 0.05, 0.45, 10], [-0.84, 0.05, 0.45, 10]], WMs = WHEELS.map(() => G.m4());
let wheelMs = null;
// ------------------------------------------------------------------ drawing the parked (or coming) cart, its horses and its load
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); const c = s.q.cartAt; if (s.q.riding || !c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!HR.rigs) HR.rigs = [new G.Rig(G.AB.horse), new G.Rig(G.AB.horse)]; if (!drive) HR.ph += 0.01;
  HR.rigs.forEach((rig, i) => { const [hx, hz] = horsePos(c, i); G.animAnimal(rig, { speed: drive ? HR.spd * 0.55 : 0, phase: HR.ph + i * 0.4, graze: !drive && (s.flags.horseEat || 0) > Date.now() }, t); rig.update(G.m4trs(HM[i], hx, hAt(hx, hz), hz, c.f));
    list.push({ mesh: Game.animalMesh('horse', 'plain', { royal: 1 }) /* a matched pair of white horses */, bones: rig.bones, outline: true }); }); };
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; const c = cartPos(); if (!c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!cartMesh) cartMesh = G.R.mesh(wagon());
  const y0 = hAt(c.x, c.z), rid = s.q.riding; G.m4trs(CM, c.x, y0, c.z, c.f, rid ? D.pitch : 0, 0, 1, 1, 1); list.push({ mesh: cartMesh, m: CM, outline: true });
  if (!wheelMs) wheelMs = { big: wheelMesh(0.6, 12), small: wheelMesh(0.45, 10) };
  WHEELS.forEach(([lx, lz, r], i) => { const x = c.x + Math.cos(c.f) * lx + Math.sin(c.f) * lz, z = c.z - Math.sin(c.f) * lx + Math.cos(c.f) * lz; /* each wheel turns by distance ÷ its own radius: the small front ones spin faster */
    G.m4trs(WMs[i], x, y0 + r, z, c.f, WH.a / r, 0, 1, 1, 1); list.push({ mesh: r > 0.5 ? wheelMs.big : wheelMs.small, m: WMs[i], outline: true }); }); /* the same wagon parked or ridden (the episode's old standing chariot is not drawn any more) */
  if (G.Phys && G.Phys.meshOf) { let i = 0; const SL = [[-0.38, -1.25], [0.38, -1.25], [-0.38, -1.95], [0.38, -1.95]];
    for (const L of LOAD) { if (!L.b) continue; const [lx, lz] = SL[i % 4], f = c.f, x = c.x + Math.cos(f) * lx + Math.sin(f) * lz, z = c.z - Math.sin(f) * lx + Math.cos(f) * lz;
      G.m4trs(LM[i % 4], x, hAt(c.x, c.z) + BED_Y - 0.04 + L.b.K.r * 0.9, z, f + i, 0, 0); list.push({ mesh: G.Phys.meshOf(L.b.k), m: LM[i % 4], outline: true }); i++; } } };
/* v18.25 (the 앉기 button is 「정지 / 후진」 on the wagon now — there is still no crouching there) */
/* v18.28 no big help card in the middle of the screen while the wagon is rolling: it waits until you have stopped for a moment */
const HQ = []; let stillT = 0; { const h0 = G.UI.help; if (h0) { G.UI.help = function (k, t, l) { if (driving() && Math.abs(D.v) > 0.4) { if (!HQ.some(q => q[0] === k)) HQ.push([k, t, l]); return true; } return h0.apply(this, arguments); };
  Ct.helpTick = dt => { if (!HQ.length) return; if (driving() && Math.abs(D.v) > 0.2 || G.UI.busy()) { stillT = 0; return; } if ((stillT += dt) > 1.2) { stillT = 0; const q = HQ.shift(); h0.apply(G.UI, q); } }; } }
})(window.G);
