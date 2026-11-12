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
  if (Math.hypot(x - 10, z + 141) < 20) return '총리 관저'; if (x > -51 && x < -5 && z > 26 && z < 71) return '보디발의 집'; return null; };
const short = n => (n.name || '').split(' ').pop();
const fwd = f => [Math.sin(f), Math.cos(f)];
/* v18.24b the wagon, front to back: the horses → the driver's bench (Joseph sits here; one more beside him) → the cargo bed under a linen
   canopy (things and people that ride along). The cart's point (c.x, c.z) is the bench; the tailgate is 2.5 m behind it. */
let BENCH_Y = 0.46, BED_Y = 0.46, TAIL = 0.9; /* v18.43 a two-wheeled chariot: people stand on its floor (0.46 m); its back is 0.9 m behind the driver · v18.45 these follow the vehicle in use (VEH below) */
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
/* v18.35 the pace is a gear: 1 tap = walk, 2 taps = the steady pace (no strain on the horses), 3 and up = running, which tires them. In a town the pace stops at 2 */
const GEARV = [0, 3.2, 6, 8.4, 10.6, 13], GEARN = ['', '걷기', '보통', '빠르게', '달리기', '질주'];
const inTown = () => { const p = P(); return !!Ct.town(p.x, p.z); }, topGear = () => D.tired ? 1 : Math.min(VH().top, inTown() ? 2 : 5); /* v18.45 an ox cart never runs */
D.gear = 0; Ct.gear = () => D.gear; Ct.gearName = () => GEARN[D.gear] || '';
function tapGo() { const s = S(), gap = now() - D.last; D.last = now(); D.idle = 0; D.brake = null;
  if (s.q.cartTut && !s.q.tG2 && D.gear >= 1) { s.q.tG2 = 1; G.UI.quest(); pop('보통 걸음이에요', '이 걸음은 말이 지치지 않아요 · 「정지」로 세워 보세요', 'donkey'); } const top = topGear(); if (D.gear >= top && top === 2) { if (!s.flags.cartTown) { s.flags.cartTown = 1; pop('마을 안이에요', '마을에서는 보통 걸음까지만 가요', 'donkey'); } } D.gear = Math.min(D.gear + 1, top);
  D.pend = GEARV[D.gear]; D.whipT = 0.001; /* the pace changes when the reins land on the horses' backs, not before */ sfx('whoosh', { pitch: 1.5 + Math.random() * 0.2, vol: 0.5 }); if (D.tired && gap < 0.8) G.UI.toast('말이 지쳤어요 · 먹이를 주거나 천천히 쉬게 해요');
  if (D.gear >= 3 && !s.flags.cartFast) { s.flags.cartFast = 1; help('cartFast', '힘차게 달려요', '세 번째 탭부터는 말이 지쳐요 · 두 번 탭한 보통 걸음은 지치지 않아요 · 요셉 옆 금색 고리가 말의 기력이에요'); } G.UI.hud(); }
function brakeDown() { { const s = S(); if (s.q.cartTut && s.q.tG2 && !s.q.tStop) { s.q.tStop = 1; G.UI.quest(); pop('잘했어요!', '이제 서기 카이를 태워요', 'donkey'); } } if (AUTO.on) { if (D.gear > 1) { D.gear--; D.thr = GEARV[D.gear]; G.UI.toast('자동 이동 · ' + GEARN[D.gear]); return; } autoOff('자동 이동을 껐어요'); } D.gear = 0; D.brake = Math.abs(D.v) < 0.3 ? 'rev' : 'stop'; D.holdT = 0; D.pend = null; if (D.brake === 'stop') { D.thr = 0; sfx('step', { surf: 'stone', vol: 0.4, pitch: 0.6 }); } G.UI.hud(); }
function brakeUp() { D.brake = null; G.UI.hud(); }
function driveTick2(dt) { const s = S(), riding = s.q.riding && s.q.chariotOk; if (!riding && AUTO.on) AUTO.on = false; autoTick(dt); syncAuto();
  let st = s.q.horseSt === undefined ? 100 : s.q.horseSt; if (s.q.horseBuffT > 0) s.q.horseBuffT = Math.max(0, s.q.horseBuffT - dt);
  if (!riding) { D.v = D.hv = D.sx = D.ca = 0; D.thr = 0; D.pend = null; D.lock = false; D.brake = null; s.q.horseSt = Math.min(100, st + dt * 8); if (s.q.horseSt > 35) D.tired = false; return; }
  if (D.whipT > 0) { D.whipT += dt / 0.6; if (D.pend !== null && D.whipT >= 0.42) { D.thr = D.pend; D.pend = null; D.idle = 0; if (D.thr > D.hv + 0.4) D.hv += 0.35; sfx('hit', { pitch: 1.9, vol: 0.35 }); } if (D.whipT >= 1) D.whipT = 0; }
  if (D.feedT > 0) { D.feedT -= dt; if (D.feedT <= 0) { D.feedT = 0; feedDone(D.feedK); } }
  /* v18.34 hold 「전진」 and the horses keep the pace you tapped up to; let go and they ease off (a second's grace between taps) */
  D.held = !!((Game.INPUT && Game.INPUT.actHeld) || D.kHeld) && driving(); if (D.held && !D.brake && !G.UI.busy()) D.idle = 0;
  /* v18.35 gears 1 and 2 hold their pace by themselves; above that the horses fall back a gear a few seconds after the last tap, unless 전진 is held */
  D.idle += dt; if (D.gear >= 3 && D.idle > (D.held ? 99 : 3)) { D.gear--; D.thr = GEARV[D.gear]; D.idle = 0; }
  if (D.gear > topGear()) { D.gear = topGear(); D.thr = GEARV[D.gear]; if (D.pend !== null) D.pend = GEARV[D.gear]; }
  if (G.UI.busy()) { D.gear = 0; D.thr = Math.max(0, D.thr - dt * 3); }
  if (D.brake) { D.holdT += dt; D.thr = 0; }
  const stF = 0.35 + 0.65 * Math.min(1, st / 40), want = D.brake === 'rev' ? -1.9 : D.thr;
  const aUp = (D.hv < WALKP ? 2.3 : 1.75) * stF, aDn = D.brake === 'stop' ? 6.5 + 8 * Math.min(1, D.holdT / 0.5) : D.held ? 1.1 : 1.6; /* v18.34 「정지」 bites at once */
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
  const buff = s.q.horseBuffT > 0; if (D.hv > GEARV[2] + 0.5) st -= (D.hv - GEARV[2]) * 2.4 * dt * (buff ? 0.45 : 1) * (s.flags.goldTack ? 0.7 : 1); else st += dt * (Math.abs(D.hv) < 0.3 ? 11 : 5);
  st = Math.max(0, Math.min(100, st)); s.q.horseSt = st;
  if (st <= 0 && !D.tired) { D.tired = true; D.gear = Math.min(D.gear, 1); D.thr = Math.min(D.thr, WALKP); pop('말이 지쳤어요', '천천히 가며 쉬게 하거나 먹이를 주어요', 'donkey'); } if (D.tired && st > 35) D.tired = false;
  if (D.tired) { D.thr = Math.min(D.thr, WALKP); if (D.pend !== null) D.pend = Math.min(D.pend, WALKP); }
  const p = P(); p.sprint = false;
  /* the camera settles in behind the wagon when you are not looking round */
  const C = Game.CAM; if (C && Math.abs(D.v) > 0.8 && (C.lookT === undefined || C.lookT > 0.6)) C.yaw += Game.angDiff(C.yaw, p.face + Math.PI) * Math.min(1, dt * 2.2); }
/* called by the movement code while on the wagon: the stick turns the horses (slowly, slower the faster they go), the reins give the speed */
/* v18.33 the left stick is a steering wheel: only left/right counts (up/down does nothing); the horses swing round slower the faster they run,
   and backing up turns the other way, like a real wagon. Auto-drive (AUTO) steers along the yellow road on the map by itself. */
const AUTO = { on: false, why: '' };
Ct.steer = function (dt, mag, dx, dz) { const p = P(), IN = Game.INPUT, v = D.v, av = Math.abs(v);
  let wx = (IN.mx || 0) + ((IN.keys.KeyD ? 1 : 0) - (IN.keys.KeyA ? 1 : 0)); wx = Math.max(-1, Math.min(1, wx)); if (Math.abs(wx) < 0.12) wx = 0;
  if (AUTO.on) { if (Math.abs(wx) > 0.55) autoOff('직접 운전해요 · 자동 이동을 껐어요'); else wx = autoWheel(); }
  if (wx) { const rate = Math.max(0.7, Math.min(1.9, 1.9 - av * 0.11)) * (0.25 + 0.75 * Math.min(1, av / 1.2)); p.face -= wx * rate * dt * (v < -0.05 ? -1 : 1);
    if (av > 4 && Math.abs(wx) > 0.7) D.v -= Math.sign(v) * dt * 1.2 * (Math.abs(wx) - 0.7) / 0.3; }
  return [Math.sin(p.face) * D.v, Math.cos(p.face) * D.v]; };
/* auto-drive: aim at a point ~7 m along the road, keep an easy pace the horses can hold, ease off near the end */
/* v18.41 by the water it looks only a short way ahead and keeps to the road the guide found (it used to cut the corner into the river) */
function lineWet(ax, az, bx, bz) { const Nv = G.Nav; if (!Nv || !Nv.wetNear) return false; const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 1.2); for (let k = 1; k <= n; k++) { const t = k / n; if (Nv.wetNear(ax + (bx - ax) * t, az + (bz - az) * t, 1.8)) return true; } return false; }
function pathPointAt(path, p, dist) { /* the point `dist` metres along the path from where the cart is now */ let bi = 0, bd = 1e9; for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.z - az) * dz) / L2)), d = Math.hypot(p.x - ax - dx * t, p.z - az - dz * t); if (d < bd) { bd = d; bi = i + t; } }
  let i = Math.floor(bi), t = bi - i, left = dist; while (i < path.length - 1) { const [ax, az] = path[i], [bx, bz] = path[i + 1], L = Math.hypot(bx - ax, bz - az), rem = L * (1 - t); if (rem >= left) { const k = t + left / (L || 1); return [ax + (bx - ax) * k, az + (bz - az) * k]; } left -= rem; i++; t = 0; } return path[path.length - 1]; }
function autoWheel() { const p = P(), path = G.Nav && G.Nav.path(); if (!path || path.length < 2) return 0; let tgt = path[path.length - 1];
  for (let i = 1; i < path.length; i++) { if (Math.hypot(path[i][0] - p.x, path[i][1] - p.z) > 7) { tgt = path[i]; break; } }
  if (lineWet(p.x, p.z, tgt[0], tgt[1]) || (G.Nav.wetNear && G.Nav.wetNear(p.x, p.z, 5))) { tgt = pathPointAt(path, p, 3.2); AUTO.nearW = 1; } else AUTO.nearW = 0;
  const want = Math.atan2(tgt[0] - p.x, tgt[1] - p.z), df = Game.angDiff(p.face, want); return Math.max(-1, Math.min(1, -df * 1.6)); }
function autoTick(dt) { if (!AUTO.on) return; const s = S(), p = P(), path = G.Nav && G.Nav.path(); const no = autoBlock(s); if (no) { autoOff(no); return; }
  if (AUTO.backT > 0) { AUTO.backT -= dt; D.gear = 0; D.thr = 0; D.brake = 'rev'; D.holdT = 0; if (AUTO.backT <= 0) { D.brake = null; G.Nav && G.Nav.reset && G.Nav.reset(); } return; }
  if (!path || path.length < 2) { AUTO.wait = (AUTO.wait || 0) + dt; if (AUTO.wait > 3) autoOff('갈 길을 찾지 못했어요'); D.thr = Math.max(0, D.thr - dt); return; } AUTO.wait = 0;
  /* v18.38 wedged against a wall or a rock: back off and look for the way again; after two tries say so instead of sitting there */ { const tg0 = Game.curTarget, lf = tg0 ? Math.hypot(tg0.x - p.x, tg0.z - p.z) : 0; if (AUTO.best === undefined || lf < AUTO.best - 3) { AUTO.best = lf; AUTO.tries = 0; } } /* v18.41 tries reset only on real progress towards the goal (a lurch after backing up used to reset it, so it rocked against a wall forever) */ AUTO.stuckT = D.gear && Math.abs(D.hv) < 0.5 ? (AUTO.stuckT || 0) + dt : 0; if (AUTO.stuckT > 2.5) { AUTO.stuckT = 0; AUTO.tries = (AUTO.tries || 0) + 1; if (AUTO.tries > 3) { AUTO.tries = 0; autoOff('여기선 자동 이동이 어려워요 · 조금만 직접 몰아 주세요'); return; } AUTO.backT = 1.4; return; } /* v18.40 backs off and tries again quietly */
  const end = path[path.length - 1], left = Math.hypot(end[0] - p.x, end[1] - p.z), st = s.q.horseSt === undefined ? 100 : s.q.horseSt;
  const tgN = Game.curTarget && Game.curTarget.npc ? Game.npc(Game.curTarget.npc) : null, nearN = tgN && Math.hypot(tgN.x - p.x, tgN.z - p.z) < 13; /* v18.41 stop short of a person: the horses no longer stand on them */
  if (left < 7 || nearN) { D.thr = 0; D.gear = 0; if (Math.abs(D.v) < 0.4) { AUTO.best = undefined; const pk = G.Nav && G.Nav.park; if (pk && !nearN) { autoOff(''); pop('수레 세우는 곳이에요', `${pk.n} 안은 길이 좁아요 · 걸어서 ${Math.max(5, Math.round(Math.hypot(pk.real.x - p.x, pk.real.z - p.z) / 5) * 5)}m`, 'donkey'); } else autoOff('다 왔어요!'); } return; } /* v18.42 stops at the village's edge */
  if (!D.gear) D.gear = 2; /* v18.35 the speed stays yours: tap 전진 to go faster, 「정지」 to go a gear slower */ const pace = left < 18 || AUTO.nearW ? Math.min(GEARV[D.gear], WALKP) : GEARV[D.gear]; /* v18.41 a walking pace along the bank */ D.thr += (pace - D.thr) * Math.min(1, dt * 1.5); D.idle = 0; D.brake = null; }
function autoBlock(s) { if (s.q.dlJob) return '배달 시간을 잴 때는 자동 이동을 쓸 수 없어요'; if (G.Extras && G.Extras.patrol && G.Extras.patrol.on) return '순찰 기록 도전 중에는 자동 이동을 쓸 수 없어요'; if (s.flags && s.flags.race) return '경주 중에는 자동 이동을 쓸 수 없어요'; return ''; }
function autoOff(why) { AUTO.on = false; if (why) G.UI.toast(why); syncAuto(); }
Ct.autoToggle = function () { const s = S(); if (!driving()) return; if (AUTO.on) { autoOff('자동 이동을 껐어요'); return; } const no = autoBlock(s); if (no) { G.UI.toast(no); return; }
  if (!(G.Nav && G.Nav.path())) { G.UI.toast('갈 곳이 없어요 · 목표나 지도 표시가 있어야 해요'); return; } AUTO.on = true; sfx('blip', { pitch: 1.2 }); if (!D.gear) D.gear = 2; G.UI.toast('자동 이동 · 전진 탭으로 빠르게 · 정지로 느리게 · 스틱을 크게 꺾으면 꺼져요'); syncAuto(); };
Ct.auto = () => AUTO.on;
Ct.halt = () => { D.v = 0; D.thr = 0; D.gear = 0; D.brake = null; if (AUTO.on) { AUTO.on = false; syncAuto(); } };
/* the button: under the distance badge, only on the wagon */
const ab = document.createElement('button'); ab.id = 'autoBtn'; ab.className = 'cbtn'; ab.innerHTML = '<span>자동 이동</span>'; ab.hidden = true;
{ const css = document.createElement('style'); css.textContent = '#autoBtn{position:fixed;right:var(--gr,12px);top:calc(var(--gt,12px) + var(--mw,100px) + 112px);width:auto;height:34px;padding:0 12px;border-radius:17px;font-size:12px;z-index:12}#autoBtn.on{background:var(--gold);color:var(--ink)}#autoBtn.off{opacity:.5}@media (min-aspect-ratio:1/1){#autoBtn{top:calc(var(--gt,12px) + var(--mw,100px) + 64px)}}'; document.head.appendChild(css); }
setTimeout(() => (document.getElementById('hud') || document.body).appendChild(ab), 0);
ab.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (G.Ride && G.Ride.isHorse && G.Ride.isHorse()) { G.Ride.autoToggle(); syncAuto(); return; } Ct.autoToggle(); });
function syncAuto() { const hz = G.Ride && G.Ride.isHorse && G.Ride.isHorse(); if (hz) { const on = !G.UI.busy(); if (ab.hidden === on) ab.hidden = !on; ab.classList.toggle('on', !!G.Ride.H.auto); ab.classList.toggle('off', !G.Ride.H.auto && !(G.Nav && G.Nav.path())); return; } const show = driving() && !G.UI.busy(); if (ab.hidden === show) ab.hidden = !show; ab.classList.toggle('on', AUTO.on); const s = S(); ab.classList.toggle('off', !AUTO.on && (!!(s && autoBlock(s)) || !(G.Nav && G.Nav.path()))); }
Ct.jumpLabel = () => driving() ? (BOARD.length ? '타는 중' : paxCand() ? '태우기' : Math.abs(D.v) < 0.3 && paxCount() ? '내려 주기' : '짐칸') : null; Ct.feeding = () => driving() && D.feedT > 0; /* v18.34 ui.js asks these (the label was written twice a frame) */
Ct.speed = () => D.v; Ct.hv = () => D.hv; Ct.sx = () => D.sx;
/* the horses' stamina ring (shown in place of Joseph's while he drives) */
Ct.ring = () => { const s = S(); if (!s || !driving()) return null; const st = s.q.horseSt === undefined ? 100 : s.q.horseSt; return { f: st / 100, tired: D.tired, buff: s.q.horseBuffT > 0 }; };
/* the buttons while driving: 달리기 → 먹이 주기, 점프 → 짐칸(태우기), 앉기 → 정지/후진 */
const BTN = { btnRun: () => feedRide(), btnJump: () => jumpBtn(), btnCrouch: () => brakeDown() };
addEventListener('pointerdown', e => { if (!driving() || G.UI.busy() || !e.target.closest) return; const b = e.target.closest('#btnRun,#btnJump,#btnCrouch'); if (!b) return;
  e.stopPropagation(); e.preventDefault(); if (b.id === 'btnCrouch') D.brakeId = e.pointerId; BTN[b.id](); }, true);
for (const t of ['pointerup', 'pointercancel']) addEventListener(t, e => { if (D.brake && e.target.closest && e.target.closest('#btnCrouch')) brakeUp(); if (driving() && e.target.closest && e.target.closest('#btnJump,#btnRun,#btnCrouch')) e.stopPropagation(); }, true);
addEventListener('pointerup', e => { if (D.brake && (D.brakeId === undefined || e.pointerId === D.brakeId)) brakeUp(); }); /* (finger slid off the button; v18.34 only that finger — lifting the steering thumb no longer lets go of the brake) */
addEventListener('pointercancel', e => { if (D.brake && e.pointerId === D.brakeId) brakeUp(); });
/* v18.34 the 전진 button held down: the A button's own held flag (ui.js Game.INPUT.actHeld, cleared on up/cancel/leave), or the E key */
addEventListener('keydown', e => { if (e.code === 'KeyE') D.kHeld = true; }, true); addEventListener('keyup', e => { if (e.code === 'KeyE') D.kHeld = false; }, true); addEventListener('blur', () => { D.kHeld = false; });
addEventListener('keydown', e => { if (!driving() || G.UI.busy() || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; const c = e.code;
  if (c === 'ShiftLeft' || c === 'ShiftRight') { e.stopPropagation(); if (!e.repeat) feedRide(); }
  else if (c === 'Space') { e.stopPropagation(); e.preventDefault(); if (!e.repeat) jumpBtn(); }
  else if (c === 'KeyC' || c === 'ControlLeft') { e.stopPropagation(); if (!e.repeat) brakeDown(); } }, true);
addEventListener('keyup', e => { if (D.brake && (e.code === 'KeyC' || e.code === 'ControlLeft')) brakeUp(); if (driving() && /Shift/.test(e.code)) e.stopPropagation(); }, true);
const LBL = { btnRun: '달리기', btnJump: null, btnCrouch: '앉기' }; let lblOn = false;
function driveLabels() { const on = driving(), hz = G.Ride && G.Ride.isHorse && G.Ride.isHorse(), set = (id, t) => { const b = document.getElementById(id); if (b && b.textContent !== t) b.textContent = t; };
  if (hz) { const H = G.Ride.H; lblOn = true; set('btnRun', H.feedT > 0 ? '먹이는 중' : '먹이 주기'); set('btnCrouch', H.rev || (Math.abs(H.v) < 0.3 && !H.gear) ? '후진' : '정지'); const c = document.getElementById('btnCrouch'); if (c) c.classList.toggle('on', !!H.rev); return; }
  if (on) { lblOn = true; set('btnRun', D.feedT > 0 ? '먹이는 중' : '먹이 주기'); 
    set('btnCrouch', D.brake === 'rev' || (Math.abs(D.v) < 0.3 && !D.brake) || D.v < -0.1 ? '후진' : '정지');
    const r = document.getElementById('btnRun'); if (r) r.classList.toggle('on', D.feedT > 0); const c = document.getElementById('btnCrouch'); if (c) c.classList.toggle('on', !!D.brake); }
  else if (Game.P.swim && !Game.P.ride) { lblOn = true; set('btnRun', '힘껏 헤엄'); } /* v18.40 */
  else if (lblOn) { lblOn = false; set('btnRun', '달리기'); set('btnCrouch', '앉기'); const c = document.getElementById('btnCrouch'); if (c) c.classList.remove('on'); } }

// ------------------------------------------------------------------ getting on and off
function mount() { const s = S(), c = s.q.cartAt; if (!c || drive) return; if (s.q.needCart) { pop('수레지기가 기다려요', '호리에게 먼저 말을 걸어요', 'donkey'); return; } if (G.Stable && G.Stable.mode() === 'horse') { pop('지금은 말로 다녀요', '마구간지기 케티에게 「수레로 다니기」를 말해요', 'donkey'); return; } const t = null; void Ct.town(c.x, c.z); if (t) { pop('여기선 못 타요', `${t} 안이에요 · 넓은 곳에서 타요`, 'donkey'); return; }
  { const hk = Game.hand(); if (hk && hk !== 'jar' && hk !== 'bigjar') { s.q.handBack = hk; Game.hold(null); } } /* v18.43 both hands on the reins: the staff goes in the bag (it stuck out like a lance), and comes back when he steps down */
  Game.teleport(c.x, c.z, c.f); s.q.riding = 1; s.q.rode = 1; sfx('whoosh'); Game.checkStep(); Game.snapCam && Game.snapCam();
  D.v = D.hv = D.sx = 0; D.thr = 0; D.pend = null; D.brake = null; D.whipT = 0; if (s.q.horseSt === undefined) s.q.horseSt = 100;
  if (!help('cartDrive', '수레 몰기', '왼쪽 스틱 좌우 = 핸들 · 전진 한 번 = 걷기 · 두 번 = 보통 걸음(말이 안 지쳐요) · 세 번부터 달려요 · 「정지」 = 서기, 멈춘 뒤엔 「후진」 · B키 내리기 · 달리기 버튼 먹이 주기 · 점프 버튼 짐칸')) pop('수레에 탔어요', 'A키를 연달아 누르면 점점 빨라져요', 'donkey'); G.UI.hud(); }
function dismount(quiet) { const s = S(), p = P(); if (!s.q.riding) return; Ct._offT = performance.now(); if (s.q.handBack) { const hb = s.q.handBack; s.q.handBack = null; setTimeout(() => { if (!S().q.riding && !Game.hand()) Game.hold(hb); }, 350); } D.v = 0; D.thr = 0; D.brake = null; D.feedT = 0; s.q.cartAt = { x: p.x, z: p.z, f: p.face }; s.q.riding = 0;
  const [rx, rz] = rearOf(s.q.cartAt), [fx, fz] = fwd(p.face); const tg = Game.curTarget, tn = tg && tg.npc ? Game.npc(tg.npc) : null;
  if (tn && Math.hypot(tn.x - p.x, tn.z - p.z) < 30) { /* v18.41 step down on the side facing the person you came to see, not behind the wagon */ const sx = fz, sz = -fx, side = ((tn.x - p.x) * sx + (tn.z - p.z) * sz) >= 0 ? 1 : -1, cx = p.x - fx * TAIL * 0.15 + sx * side * 1.9, cz = p.z - fz * TAIL * 0.15 + sz * side * 1.9; /* v18.42 beside the driver's seat, not back by the wheels (he ended up farther from the person) */ if (!Game.solidAt(cx, cz, 0.4)) Game.teleport(cx, cz, Math.atan2(tn.x - cx, tn.z - cz)); else Game.teleport(rx - fx * 0.5, rz - fz * 0.5, p.face); }
  else Game.teleport(rx - fx * 0.5, rz - fz * 0.5, p.face); sfx('step'); Game.snapCam && Game.snapCam(); if (!quiet) pop('수레에서 내렸어요', '수레는 여기 서 있어요', 'donkey'); G.UI.hud(); }
Ct.mount = mount; Ct.dismount = dismount;
// the left button: 「수레 부르기」 (no 「타기/내리기」 there any more — that is A at the cart)
const e = (EP.extra || []).find(x => x.id === 'chariot');
if (e) { const on0 = e.on; e.on = (s, g) => (on0 ? on0(s, g) : true) && !s.q.riding && !(G.Caves && G.Caves.inside()) && !(G.Cave && G.Cave.inside()) && !(G.Byblos && G.Byblos.inBy && G.Byblos.inBy()) && !(G.Homes && G.Homes.inside && G.Homes.inside()) && !(G.DW && G.DW.on && G.DW.on()) && !s.q.needCart; /* (not underground, overseas or indoors · v18.34 houses · v18.41 not in a dream, nor before 호리 has handed the wagon over) */ e.label = () => '수레 부르기'; e.click = () => Ct.call(); }
Ct.call = function () { const s = S(), p = P(), W = Game.W(); if (s.q.riding || drive) return; if (s.q.needCart) { pop('수레지기가 기다려요', '호리에게 먼저 말을 걸어요', 'donkey'); return; } if (G.Homes && G.Homes.inside && G.Homes.inside()) { G.UI.toast('집 안에서는 수레를 부를 수 없어요'); return; }
  if (W.roofAt(p.x, p.z, p.y)) { pop('여기선 못 불러요', '지붕 아래에는 수레가 들어오지 못해요', 'donkey'); return; } if (W.water && hAt(p.x, p.z) < W.water.level - 0.1) { pop('여기선 못 불러요', '물속으로는 수레가 못 와요', 'donkey'); return; }
  const c = s.q.cartAt, wet = (x, z) => W.water && hAt(x, z) < W.water.level - 0.25, open = (x, z) => !wet(x, z) && W.ray(x, hAt(x, z) + 1, z, p.x, p.y + 1, p.z) > 0.97;
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
  try { applyVeh(); driveTick(dd); cartPeople(); boardTick(dd); cartSolid(); } catch (er) { console.error('cart', er); }
  document.body.classList.toggle('riding', !!s.q.riding); driveLabels();
  try { driveTick2(dd); Ct.helpTick && Ct.helpTick(dd); } catch (er) { console.error('cart drive', er); }
  if (s.q.riding && !(G.Cine && G.Cine.on)) yieldTick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60);
  { const b = Ct.bCtx(), k = b ? b.k + b.label : ''; if (k !== bKey) { bKey = k; G.UI.hud(); } } /* B follows where you stand at once (the HUD only refreshes twice a second) */
  return r; };
/* seated on the cart's floor instead of standing at the reins */
const ry0 = EP.rootY; EP.rootY = function (s, g) { const b = ry0 ? ry0.apply(this, arguments) || 0 : 0; return s && s.q && s.q.riding && s.q.chariotOk ? b + (BENCH_Y - 0.46) : b; }; /* v18.45 standing in the chariot (0), seated on a bench (cart, coach) */ /* v18.43 standing on the chariot floor (the episode lifts him 0.46 m) */ /* (episode base 0.46 + this = on the bench cushion) */
const pose0 = EP.pose; EP.pose = function (pst, s, g) { const r = pose0 ? pose0.apply(this, arguments) : undefined; if (s.q.riding && s.q.chariotOk) { pst.act = VH().stand ? 'reins' : 'reinsSit'; pst.actT = D.brake === 'stop' ? 1 + Math.min(1, D.holdT * 4) : D.whipT; /* (1..2 = pulling the reins back) */ pst.sit = false; } /* v18.25 hands on the reins; a tap of 전진 flicks them */ return r; };

/* v18.24 the wagon is solid: riding, its whole length (tailgate, bed, pole, horses) is kept out of walls and houses — the push on any
   part moves the whole team; parked, Joseph walks round it instead of through it */
let PROBE = [[-0.45, 1.0], [0.2, 0.75], [1.5, 0.35], [2.6, 0.7], [3.5, 0.55]]; /* v18.43 the short chariot (its wheels stick out 1 m each side) */
function cartSolid() { const s = S(), p = P(), W = Game.W(); if (!W || Game.cineOn || (G.Cine && G.Cine.on)) return;
  if (s.q.riding && s.q.chariotOk) { for (let it = 0; it < 2; it++) { let mx = 0, mz = 0, hit = false; const [fx, fz] = fwd(p.face);
      for (const [lz, r] of PROBE) { const q = { x: p.x + fx * lz, z: p.z + fz * lz }, x0 = q.x, z0 = q.z; W.collide(q, r, p.y + 0.2); const ddx = q.x - x0, ddz = q.z - z0; if (Math.abs(ddx) + Math.abs(ddz) > 1e-4) { hit = true; if (Math.abs(ddx) > Math.abs(mx)) mx = ddx; if (Math.abs(ddz) > Math.abs(mz)) mz = ddz; } }
      if (!hit) break; p.x += mx; p.z += mz; const vn = p.vx * fx + p.vz * fz; if (vn * (mx * fx + mz * fz) < 0) { p.vx *= 0.3; p.vz *= 0.3; D.v *= 0.3; D.hv *= 0.3; D.sx = 0; D.thr = Math.min(D.thr, WALKP); } } return; }
  const c = parked(); if (!c || Math.hypot(c.x - p.x, c.z - p.z) > 8) return; const [fx, fz] = fwd(c.f), sx = fz, sz = -fx; /* (sx, sz) = the wagon's right */
  for (const [z0, z1, hw] of [[-TAIL - 0.05, 0.5, VH().hw], [1.6, 3.9, 0.95]]) { const dx = p.x - c.x, dz = p.z - c.z, lx = dx * sx + dz * sz, lz = dx * fx + dz * fz, r = 0.32;
    if (lx > -hw - r && lx < hw + r && lz > z0 - r && lz < z1 + r) { const pen = [hw + r - lx, lx + hw + r, z1 + r - lz, lz - z0 + r], m = Math.min(...pen); let nx = lx, nz = lz;
      if (m === pen[0]) nx = hw + r; else if (m === pen[1]) nx = -hw - r; else if (m === pen[2]) nz = z1 + r; else nz = z0 - r; p.x = c.x + nx * sx + nz * fx; p.z = c.z + nx * sz + nz * fz; } } }
// ------------------------------------------------------------------ people in the cart: one beside Joseph, the loaded ones (and caught prisoners) in the back
const cartPos = () => { const s = S(), p = P(); return s.q.riding ? { x: p.x, z: p.z, f: p.face } : s.q.cartAt; };
const seatAt = (n, c, side, back, y, stand) => { const f = c.f, x = c.x + Math.cos(f) * side - Math.sin(f) * back, z = c.z - Math.sin(f) * side - Math.cos(f) * back;
  n.x = x; n.z = z; n.y = hAt(c.x, c.z) + (y === undefined ? BED_Y : y); n.face = f; n.homeFace = f; n.walk = null; n.wander = null; n.act = stand ? null : 'sitg'; n.pass = true; n._inCart = true; if (n.col) { n.col.x = x; n.col.z = z; } };
const unseat = (n, side) => { const p = P(), f = p.face; n.pass = false; n._inCart = false; if (n.act === 'sitg') n.act = null; n.x = p.x + Math.cos(f) * (side || 1.4); n.z = p.z - Math.sin(f) * (side || 1.4); n.y = hAt(n.x, n.z); };
const goHome = n => { if (n.d.folk) n.schedSlot = -1; else Game.npcWalk(n.id, n.d.x, n.d.z, () => { n.face = n.homeFace = n.d.face || 0; }, 1.6); };
function cartPeople() { const s = S(), c = cartPos(); let k = 0;
  if (!s.q.riding) { if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n) hopOff(n, -1); s.q.cartPax = null; } if (s.q.cartPax2 && s.q.cartPax2.length) { s.q.cartPax2.forEach((id, i) => { const n = Game.npc(id); if (n) hopOff(n, i % 2 ? -1 : 1); }); s.q.cartPax2 = []; }
    for (const n of P().follow || []) if (n._inCart && !n._cartBack && !n._hop) unseat(n, -1.6); }
  else if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n && n.vis) seatAt(n, c, VH().seat1[0], VH().seat1[1], BENCH_Y, VH().stand); /* v18.43 the passenger stands at Joseph's side in the chariot · v18.45 sits on the bench of a cart or coach */ else s.q.cartPax = null; }
  if (!c) return;
  if (s.q.riding && s.q.cartPax2) s.q.cartPax2 = s.q.cartPax2.filter(id => { const n = Game.npc(id); if (!n || !n.vis) return false; const q = VH().seatN(k); seatAt(n, c, q[0], q[1], BED_Y, VH().stand); k++; return true; });
  for (const L of LOAD) if (L.n) { const n = L.n; if (!n.vis) continue; const q = VH().seatN(k); seatAt(n, c, q[0], q[1], BED_Y, VH().stand); k++; }
  if (s.q.riding) for (const n of P().follow || []) if (/^cul/.test(n.id) && !n._cartBack) { const q = VH().seatN(k); seatAt(n, c, q[0], q[1], BED_Y, VH().stand); k++; } }
/* v18.25 on the wagon A is 「전진」 (always first — get down with B to talk to someone) */
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || !s.q.chariotOk || Game.cineOn || G.UI.busy()) return null;
  return [{ d: -9, label: D.feedT > 0 ? '전진 · 먹이는 중' : D.gear ? `전진 · ${GEARN[D.gear]}` : '전진', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartGo', use: tapGo }]; });
/* v18.35 on the road through town: people ahead step aside in good time. The great (Pharaoh, generals, the palace guard) do not: the wagon stops for them */
const RANK = /^(pharaoh|royalG|guest3|potiphar)/; let yT = 0;
function yieldTick(dt) { if ((yT -= dt) > 0) return; yT = 0.25; const p = P(), v = Math.abs(D.v); if (v < 0.4) return; const [fx, fz] = fwd(p.face), look = 7 + v * 1.1, sgn = D.v < 0 ? -1 : 1;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n._inCart || n.follow || n.pass || n.d.animal || n.schedHidden) continue; const dx = n.x - p.x, dz = n.z - p.z; if (Math.abs(dx) > look + 2 || Math.abs(dz) > look + 2) continue; const al = (dx * fx + dz * fz) * sgn, lat = dx * fz - dz * fx;
    if (al < 1.2 || al > look || Math.abs(lat) > 2.1) continue; const still = RANK.test(id) || n.d.sit || n.sit || n.d.fixed || n.d.kneel || n.talking;
    if (still) { if (al < 4 + v * 0.9 && !AUTO.yielded) { D.gear = 0; D.thr = 0; D.pend = null; D.brake = 'stop'; D.holdT = 0.6; setTimeout(() => { if (D.brake === 'stop') D.brake = null; }, 900); if (RANK.test(id)) { const s = S(); if (!s.flags.cartRank || s.flags.cartRank < s.day) { s.flags.cartRank = s.day; pop('수레를 세웠어요', `${n.name} 앞에서는 멈춰요`, 'donkey'); } } if (AUTO.on) autoOff(''); } continue; }
    if (n.walk && n.walk.aside) continue; const side = lat >= 0 ? 1 : -1, ax = n.x + fz * side * 3, az = n.z - fx * side * 3; if (Game.solidAt(ax, az, 0.5)) continue; const wk = n.walk, sl = n.schedSlot, wa = n.wander; n.wander = null; Game.npcWalk(id, ax, az, () => { n.wander = wa; if (n.d.sched) n.schedSlot = -1; else if (wk) n.walk = wk; }, Math.max(1.5, Math.min(3, v * 0.5))); if (n.walk) n.walk.aside = true; if (Math.random() < 0.4 && G.Life && G.Life.bubble) G.Life.bubble(id, ['수레 지나가요!', '비켜요, 비켜!', '총리님 수레다!'][Math.floor(Math.random() * 3)], 1.8); } }
const paxOk = n => { if (!n || !n.vis || n.id === 'cartMan' || n.d.animal || n.d.noTalk === true || n.sleep || n.talking || n.follow || n._inCart || n._board || n.d.fixed || n.d.sit || n.seatY) return false; const tg = Game.curTarget; return !(tg && tg.npc === n.id && n.id !== 'kaiClerk'); };
Ct.paxOk = paxOk;
const paxCand = () => { const s = S(), p = P(); if ((s.q.cartPax ? 1 : 0) + (s.q.cartPax2 || []).length + BOARD.length >= VH().pax || Math.abs(D.v) > 0.3) return null; { const lk = G.Lock && G.Lock.pick; if (lk && paxOk(lk) && Math.hypot(lk.x - p.x, lk.z - p.z) < 10) return lk; } /* v18.47 the one you aimed at (조준) comes over from further away */ /* v18.45 the cart takes four, the coach three */ let best = null, bd = 2.8;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!paxOk(n)) continue;
    const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < bd) { bd = d; best = n; } } return best; };
/* v18.47 getting on and off is seen: the person walks to the side of the wagon and hops up; set down, they hop to the ground and walk home */
const BOARD = [], HOPS = [], say1 = (n, t) => { if (G.Life && G.Life.bubble) G.Life.bubble(n.id, t, 2.4); };
const sideSpot = (c, sg) => { const L = VH().hw + 0.75; return [c.x + Math.cos(c.f) * sg * L - Math.sin(c.f) * 0.2, c.z - Math.sin(c.f) * sg * L - Math.cos(c.f) * 0.2]; };
const sideOf = (c, n) => ((n.x - c.x) * Math.cos(c.f) - (n.z - c.z) * Math.sin(c.f)) >= 0 ? 1 : -1;
function takePax(n) { const s = S(), c = cartPos(); if (!c || n._board) return; const b = { n, t: 0, ph: 0, first: !s.q.cartPax && !BOARD.some(q => q.first) }, [gx, gz] = sideSpot(c, sideOf(c, n));
  n._board = 1; n.wander = null; n.act = null; n.sit = false; BOARD.push(b); say1(n, b.first ? '우와, 총리님 수레에 타 보다니요!' : '고맙습니다, 총리님! 뒤에 앉을게요.'); sfx('blip', { pitch: 1.2 });
  if (G.Lock && G.Lock.pick === n) G.Lock.pick = null; Game.npcWalk(n.id, gx, gz, () => { if (b.ph === 0) b.ph = 1; }, 2.4); G.UI.hud(); }
function boardCancel(b) { const n = b.n; n._board = 0; n._hop = 0; if (b.ph >= 2) { n.pass = false; n._inCart = false; n.y = hAt(n.x, n.z); } n.walk = null; goHome(n); }
function hopOff(n, sg) { const c = cartPos(); n.act = null; if (!c) { unseat(n, sg * 1.4); goHome(n); return; } const [bx, bz] = sideSpot(c, sg); n.pass = true; n._inCart = true; n._hop = 1; n.emote = { k: 'cheer', t: 0, dur: 0.5 };
  HOPS.push({ n, t: 0, a: [n.x, n.y, n.z], b: [bx, hAt(bx, bz), bz], f: c.f + sg * Math.PI / 2 }); sfx('thud', { vol: 0.3, pitch: 1.5 }); }
function dropLast() { const s = S(), l2 = s.q.cartPax2 || []; let id = l2.length ? l2[l2.length - 1] : s.q.cartPax; if (!id) return false;
  if (id === 'kaiClerk' && !s.q.metC) { G.UI.toast('카이는 성읍 감독관에게 가는 길이에요'); return true; }
  if (l2.length) l2.pop(); else s.q.cartPax = null; const n = Game.npc(id); if (n) { say1(n, '태워 주셔서 고맙습니다, 총리님!'); hopOff(n, l2.length % 2 ? -1 : 1); pop('내려 주었어요', n.name, 'donkey'); } G.UI.hud(); return true; }
Ct.dropPax = function () { const s = S(); for (let i = 0; i < 6 && (s.q.cartPax || (s.q.cartPax2 || []).length); i++) { const l2 = s.q.cartPax2 || [], id = l2.length ? l2.pop() : s.q.cartPax; if (!l2.length && id === s.q.cartPax) s.q.cartPax = null; const n = Game.npc(id); if (n) { unseat(n, 1.4); goHome(n); } } };
const paxCount = () => { const s = S(); return (s.q.cartPax ? 1 : 0) + (s.q.cartPax2 || []).length; };
function boardTick(dd) { const s = S(), c = cartPos();
  for (let i = BOARD.length - 1; i >= 0; i--) { const b = BOARD[i], n = b.n; b.t += dd;
    if (!s.q.riding || !c || !n.vis || (b.ph === 0 && (Math.abs(D.v) > 0.6 || b.t > 9))) { boardCancel(b); BOARD.splice(i, 1); continue; }
    if (b.ph === 0 && !n.walk && b.t > 0.4) { if (Math.hypot(n.x - c.x, n.z - c.z) < 3.2) b.ph = 1; else { boardCancel(b); BOARD.splice(i, 1); continue; } }
    if (b.ph === 1) { b.ph = 2; b.t = 0; b.a = [n.x, n.y, n.z]; n.walk = null; n.pass = true; n._inCart = true; n._hop = 1; n.emote = { k: 'cheer', t: 0, dur: 0.5 }; sfx('thud', { vol: 0.3, pitch: 1.7 }); }
    if (b.ph === 2) { D.v = 0; D.thr = 0; D.gear = 0; const k = Math.min(1, b.t / 0.5), e = k * k * (3 - 2 * k), q = b.first ? VH().seat1 : VH().seatN((s.q.cartPax2 || []).length), f = c.f;
      const tx = c.x + Math.cos(f) * q[0] - Math.sin(f) * q[1], tz = c.z - Math.sin(f) * q[0] - Math.cos(f) * q[1], ty = hAt(c.x, c.z) + (b.first ? BENCH_Y : BED_Y);
      n.x = b.a[0] + (tx - b.a[0]) * e; n.z = b.a[2] + (tz - b.a[2]) * e; n.y = b.a[1] + (ty - b.a[1]) * e + Math.sin(k * Math.PI) * 0.5; n.face = n.homeFace = Math.atan2(tx - b.a[0], tz - b.a[2]);
      if (k >= 1) { n._board = 0; n._hop = 0; BOARD.splice(i, 1); if (b.first && !s.q.cartPax) { s.q.cartPax = n.id; if (n.id === 'kaiClerk') { s.q.tPax = 1; G.UI.quest(); } pop('옆자리에 태웠어요', n.name, 'donkey'); } else { (s.q.cartPax2 = s.q.cartPax2 || []).push(n.id); pop('뒤에 태웠어요', n.name, 'donkey'); } G.UI.hud(); } } }
  for (let i = HOPS.length - 1; i >= 0; i--) { const h = HOPS[i], n = h.n; h.t += dd; const k = Math.min(1, h.t / 0.5), e = k * k * (3 - 2 * k);
    n.x = h.a[0] + (h.b[0] - h.a[0]) * e; n.z = h.a[2] + (h.b[2] - h.a[2]) * e; n.y = h.a[1] + (h.b[1] - h.a[1]) * e + Math.sin(k * Math.PI) * 0.4; n.face = n.homeFace = h.f;
    if (k >= 1 || !n.vis) { HOPS.splice(i, 1); n._hop = 0; n.pass = false; n._inCart = false; n.y = hAt(n.x, n.z); if (n.col) { n.col.x = n.x; n.col.z = n.z; } setTimeout(() => { if (!n._inCart && !n._board) goHome(n); }, 700); } } }
function jumpBtn() { if (BOARD.length) return; const n = paxCand(); if (n) takePax(n); else if (Math.abs(D.v) < 0.3 && paxCount() && dropLast()) return; else G.Storage && G.Storage.openBox(VH().n + ' 짐칸', 'cartStore', false, VH().cap); }

// ------------------------------------------------------------------ at the parked cart: behind it, and by the horses
const HR = { rigs: null, ph: 0, spd: 0 }, CM = G.m4(), HM = [G.m4(), G.m4()], LM = [G.m4(), G.m4(), G.m4(), G.m4()];
let cartMesh = null;
const horsePos = (c, i) => { const s = i ? 1 : -1, f = c.f; return [c.x + Math.sin(f) * 2.6 + Math.cos(f) * s * 0.55, c.z + Math.cos(f) * 2.6 - Math.sin(f) * s * 0.55]; };
const parked = () => { const s = S(); return !s.q.riding && s.q.chariotOk && s.q.cartAt ? s.q.cartAt : null; };
Ct.rearPos = () => { const c = parked(); if (!c) return null; const [rx, rz] = rearOf(c); return { x: rx, z: rz }; }; /* v18.40 where to stand to open the cargo box (the guide points here) */
Object.assign(Game.ITEMS, { qSample: { n: '곡식 표본 자루', cat: 'quest', p: 0, ic: 'sack', c: '#d8c49a', d: '바로가 서쪽 마을 촌장에게 보내는 곡식 표본 · 퀘스트 물건' } });
const rearD = () => { const c = parked(); if (!c || drive) return null; const [rx, rz] = rearOf(c); return Math.hypot(rx - P().x, rz - P().z); };
const nearHorse = () => { const c = parked(); if (!c || drive) return null; let bd = 1e9; for (const i of [0, 1]) { const [hx, hz] = horsePos(c, i); bd = Math.min(bd, Math.hypot(hx - P().x, hz - P().z)); } return bd < 2.3 ? bd : null; };
const FEED = Object.keys(FD); Ct.FD = FD;
/* v18.24 feeding and stroking are real motions: Joseph turns to the horse, reaches out, and only when the motion is over does the next thing happen */
function act(k, dur, fn) { const p = P(), c = parked(); if (!c || p.act) return; const [hx, hz] = horsePos(c, Math.hypot(horsePos(c, 0)[0] - p.x, horsePos(c, 0)[1] - p.z) < Math.hypot(horsePos(c, 1)[0] - p.x, horsePos(c, 1)[1] - p.z) ? 0 : 1);
  p.face = Math.atan2(hx - p.x, hz - p.z); p.vx = p.vz = 0; Object.assign(p, { act: k, actT: 0, actDur: dur, actHits: 1, actFn: fn, actProp: null, fired: false, actRepeat: false }); }
/* what to feed: pick when there is more than one kind (grain first in the list) */
function chooseFeed(go) { const ks = FEED.filter(x => Game.inv(x) > 0); if (!ks.length) { G.UI.toast('말 먹이가 없어요 · 꼴·짚·보리·밀 같은 곡식을 주어요'); return; }
  if (ks.length === 1) { go(ks[0]); return; }
  G.UI.choose('무엇을 먹일까요?', ks.map(k => `${Game.ITEMS[k] ? Game.ITEMS[k].n : k} (${Game.inv(k)}) · 말 기력 +${FD[k][0]} · ${FD[k][1]}초 덜 지쳐요`), i => go(ks[i])); }
Ct.chooseFeed = chooseFeed;
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
    return { k: 'box', label: '짐칸', fn: () => G.Storage && G.Storage.openBox(VH().n + ' 짐칸', 'cartStore', false, VH().cap) }; }
  if (nearHorse() !== null && !(G.Phys && G.Phys.held)) return { k: 'pet', label: '쓰다듬기', fn: pet };
  return null; };
Ct.feedCtx = () => null; /* (v18.23's B 「먹이 주기」 is A now) */
Game.CTX.push(function (s) { const p = P(); if (p.act || Game.cineOn || s.q.riding) return null; const c = parked(); if (!c) return null; const out = []; const talkN = Object.values(Game.ENT.npcs).some(n => n.vis && !n.d.animal && Math.hypot(n.x - p.x, n.z - p.z) < 2.6); /* v18.41 a person close by: talking comes before climbing back on */
  if (performance.now() - (Ct._offT || 0) < 1500) return out.length ? out : null; /* v18.42 just stepped down: a second tap of A does not climb straight back on */
  const r = rearD(); if (r !== null && r < 1.9) { const [rx, rz] = rearOf(c); out.push({ d: r - 0.4 + (talkN ? 3 : 0), label: '수레 타기', x: rx, z: rz, y: 1.2, noMagnet: true, key: 'cartOn', use: mount }); }
  else if (!drive) { const [fx, fz] = fwd(c.f), dx = p.x - c.x, dz = p.z - c.z, lz = dx * fx + dz * fz, lx = dx * fz - dz * fx; /* v18.29 beside the wagon too, not only behind it */
    if (lz > -TAIL - 0.3 && lz < 0.9 && Math.abs(lx) < 2.3) out.push({ d: Math.abs(lx) - 0.9 + (talkN ? 3 : 0), label: '수레 타기', x: c.x, z: c.z, y: 1.4, noMagnet: true, key: 'cartOn', use: mount }); }
  const h = nearHorse(); if (h !== null) { const [hx, hz] = horsePos(c, 0); out.push({ d: h - 0.6, label: '먹이 주기', x: hx, z: hz, y: 1.8, noMagnet: true, key: 'horseFeed', use: feed }); }
  return out.length ? out : null; });
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const b = Ct.bCtx(); if (b) { b.fn(); return; } return atk0.apply(this, arguments); }; }
{ const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const f = Game.mode === 'play' && Ct.bCtx(), b = document.getElementById('btnAtk'); if (f && b) { b.hidden = false; document.getElementById('btnAtkL').textContent = f.label; const n = document.getElementById('btnAtkN'); if (n) n.hidden = true; } driveLabels(); } catch (e) { } return r; }; }
// picking a loaded thing up from the cart by hand takes it off the load
if (G.Phys) { const pk0 = G.Phys.pick; G.Phys.pick = function (b) { const i = LOAD.findIndex(L => L.b === b); if (i >= 0 && b._onCart) { LOAD.splice(i, 1); b._onCart = false; b.gone = false; } return pk0.apply(this, arguments); }; }

/* v18.43 「버금 수레」(창 41:43, merkabah) is an Egyptian chariot: two six-spoked wheels on an axle at the back of a small open box,
   a curved front and sides to the hip, an open back to step in, a pole that rises to the yoke over the pair of white horses.
   Royal: white plaster, gold edges, a lapis panel with a gold sun disc, a quiver and a bow case on the sides. People stand in it. */
function wagon() { const g = new G.GB(43), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, IVORY = 0xe6dccb, LAPIS = 0x2c4f9a, RED = 0xa83a2a, WOOD = 0x8a5a32, F = BED_Y;
  // floor (a woven leather floor in a wooden frame) and the axle under its back edge
  g.box(1.12, 0.05, 0.86, { at: [0, F - 0.03, -0.1], c: IVORY }); for (const z of [-0.52, 0.32]) g.box(1.14, 0.06, 0.05, { at: [0, F - 0.02, z], c: GOLD });
  for (let i = 0; i < 6; i++) g.box(0.02, 0.012, 0.82, { at: [-0.45 + i * 0.18, F + 0.0, -0.1], c: 0xb89a6a, j: 0 });
  g.cyl(0.04, 0.04, 1.95, 8, { at: [0, 0.52, -0.42], rz: PI / 2, c: WOOD }); for (const sx of [1, -1]) g.cyl(0.05, 0.05, 0.08, 8, { at: [sx * 0.6, 0.52, -0.42], rz: PI / 2, c: GOLD });
  // the front: a curved breastwork to the hip, white with a lapis panel and a gold sun disc; the sides sweep back and down to the open rear
  for (let i = 0; i < 7; i++) { const t = (i - 3) / 3, x = t * 0.52, z = 0.34 - t * t * 0.12, a = Math.atan(t * 0.45); g.box(0.17, 0.58, 0.05, { at: [x, F + 0.3, z], ry: a, c: WHITE }); g.box(0.18, 0.04, 0.07, { at: [x, F + 0.6, z], ry: a, c: GOLD }); }
  g.box(0.5, 0.3, 0.012, { at: [0, F + 0.3, 0.37], c: LAPIS, j: 0 }); g.cyl(0.11, 0.11, 0.02, 16, { at: [0, F + 0.33, 0.385], rx: PI / 2, c: GOLDH, j: 0 });
  for (const sx of [1, -1]) { g.box(0.045, 0.46, 0.56, { at: [sx * 0.56, F + 0.24, -0.06], rx: 0.18, c: WHITE }); g.box(0.06, 0.04, 0.6, { at: [sx * 0.56, F + 0.47, -0.02], rx: 0.32, c: GOLD });
    g.box(0.012, 0.18, 0.3, { at: [sx * 0.585, F + 0.24, -0.02], rx: 0.18, c: RED, j: 0 });
    g.cyl(0.025, 0.025, 0.55, 6, { at: [sx * 0.48, F + 0.42, -0.42], rx: -0.3, c: GOLD }); } // hand grips at the open back
  // a quiver on the right, a bow case on the left (both on the outside of the box, slanting forward)
  g.cyl(0.07, 0.055, 0.75, 8, { at: [0.64, F + 0.36, 0.05], rx: 0.55, c: RED }); g.cyl(0.075, 0.075, 0.04, 8, { at: [0.64, F + 0.67, 0.25], rx: 0.55, c: GOLD });
  for (let i = 0; i < 3; i++) g.cyl(0.006, 0.006, 0.22, 4, { at: [0.62 + i * 0.02, F + 0.8, 0.32], rx: 0.55, c: 0xe8dcc0, j: 0 });
  g.box(0.08, 0.14, 0.8, { at: [-0.64, F + 0.34, 0.02], rx: -0.45, c: 0xc8a060 }); g.box(0.085, 0.03, 0.82, { at: [-0.64, F + 0.41, 0.02], rx: -0.45, c: GOLD });
  // the pole: from under the floor, curving up to the yoke; the yoke over the two horses
  g.box(0.08, 0.08, 1.2, { at: [0, 0.42, 0.85], rx: -0.05, c: WOOD }); g.box(0.08, 0.08, 1.1, { at: [0, 0.6, 1.95], rx: -0.28, c: WOOD }); g.box(0.08, 0.08, 0.8, { at: [0, 0.98, 2.75], rx: -0.42, c: WOOD });
  for (const z of [0.5, 1.4, 2.3]) g.box(0.1, 0.1, 0.05, { at: [0, z < 1 ? 0.43 : z < 2 ? 0.55 : 0.8, z], c: GOLD });
  g.box(1.6, 0.08, 0.08, { at: [0, 1.12, 3.0], c: WHITE }); for (const sx of [1, -1]) { g.sph(0.06, 8, 6, { at: [sx * 0.82, 1.12, 3.0], c: GOLDH }); g.box(0.05, 0.3, 0.05, { at: [sx * 0.55, 1.0, 3.0], c: GOLD }); } g.sph(0.08, 8, 6, { at: [0, 1.12, 3.0], c: GOLD });
  // reins from the yoke back to the front rail (where Joseph's hands are)
  for (const sx of [1, -1]) g.box(0.012, 0.012, 2.75, { at: [sx * 0.2, 1.0, 1.62], rx: -0.06, ry: -sx * 0.04, c: 0x5a3a20, j: 0 });
  return g; }

/* ================================================================== v18.45 three vehicles: the chariot (Pharaoh's gift), the ox cart
   (bought from the stable after the story — the 「수레」 of 창 45:19), and the vizier's pleasure coach (a side quest). */
function discWheel(r) { const g = new G.GB(61), PI = Math.PI, WD = 0x8a6038, DK = 0x5e4026; /* a solid wheel of three planks, as on Egyptian and Canaanite carts */
  g.cyl(r, r, 0.12, 18, { at: [0, 0, 0], rz: PI / 2, c: WD, j: 0.04 }); for (const z of [-r * 0.36, r * 0.36]) g.box(0.13, r * 1.9, 0.025, { at: [0, 0, z], c: DK, j: 0 });
  g.box(0.13, 0.06, r * 1.7, { at: [0, r * 0.45, 0], c: DK, j: 0 }); g.box(0.13, 0.06, r * 1.7, { at: [0, -r * 0.45, 0], c: DK, j: 0 });
  g.cyl(0.13, 0.13, 0.2, 10, { at: [0, 0, 0], rz: PI / 2, c: DK, j: 0 }); return G.R.mesh(g); }
function oxModel() { const g = new G.GB(62), PI = Math.PI, WD = 0x9a6c40, DK = 0x6a4a2c, LT = 0xb8905c, BD = 0.82;
  // the bed: plank floor, low slatted sides, a front board with the driver's bench
  g.box(1.6, 0.08, 2.5, { at: [0, BD - 0.04, -1.35], c: LT, j: 0.05 }); for (let i = 0; i < 6; i++) g.box(0.012, 0.012, 2.5, { at: [-0.65 + i * 0.26, BD + 0.005, -1.35], c: DK, j: 0 });
  for (const sx of [1, -1]) { g.box(0.07, 0.07, 2.55, { at: [sx * 0.8, BD + 0.42, -1.35], c: WD }); g.box(0.06, 0.06, 2.55, { at: [sx * 0.8, BD + 0.12, -1.35], c: DK });
    for (let i = 0; i < 6; i++) g.box(0.06, 0.4, 0.06, { at: [sx * 0.8, BD + 0.24, -0.15 - i * 0.48], c: WD }); }
  g.box(1.6, 0.34, 0.07, { at: [0, BD + 0.17, -2.6], c: WD }); g.box(1.6, 0.5, 0.07, { at: [0, BD + 0.25, -0.1], c: WD });
  g.box(1.3, 0.08, 0.36, { at: [0, BENCH_OX - 0.04, 0.02], c: LT }); for (const sx of [1, -1]) g.box(0.08, BENCH_OX - BD, 0.08, { at: [sx * 0.55, (BENCH_OX + BD) / 2, 0.02], c: DK });
  g.box(1.25, 0.06, 0.34, { at: [0, BENCH_OX + 0.01, 0.02], c: 0xc8b088 }); // a folded blanket on the bench
  // the axle under the middle of the bed, the pole forward to the yoke over the two oxen
  g.box(0.12, 0.12, 2.3, { at: [0, 0.72, -1.3], rz: PI / 2, c: DK }); g.cyl(0.06, 0.06, 2.3, 8, { at: [0, 0.72, -1.3], rz: PI / 2, c: DK });
  g.box(0.11, 0.11, 3.1, { at: [0, 0.78, 1.4], rx: -0.08, c: WD }); g.box(1.7, 0.1, 0.14, { at: [0, 1.2, 3.05], c: DK }); for (const sx of [1, -1]) { g.box(0.06, 0.34, 0.06, { at: [sx * 0.42, 1.05, 3.05], c: DK }); g.box(0.06, 0.34, 0.06, { at: [sx * 0.7, 1.05, 3.05], c: DK }); }
  // a sack and a jar in the back, so it looks used
  g.cyl(0.24, 0.28, 0.5, 8, { at: [0.45, BD + 0.25, -2.25], c: 0xd8c49a }); g.lathe([[0.05, 0], [0.16, 0.12], [0.17, 0.32], [0.08, 0.44]], 8, { at: [-0.45, BD, -2.3], c: 0xb5673a });
  return g; }
const BENCH_OX = 1.02;
function coachModel() { const g = new G.GB(43), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, IVORY = 0xe6dccb, LAPIS = 0x2c4f9a, RED = 0xa83a2a;
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
  g.box(1.5, 0.08, 1.95, { at: [0, 0.7 - 0.04, -1.45], c: IVORY });
  for (const sx of [1, -1]) { g.box(0.06, 0.5, 1.95, { at: [sx * 0.75, 0.7 + 0.23, -1.45], c: WHITE }); g.box(0.08, 0.05, 2.0, { at: [sx * 0.75, 0.7 + 0.5, -1.45], c: GOLD }); g.box(0.08, 0.04, 2.0, { at: [sx * 0.75, 0.7 + 0.0, -1.45], c: GOLD });
    for (let i = 0; i < 3; i++) { const z = -0.8 - i * 0.62; g.box(0.012, 0.3, 0.46, { at: [sx * 0.785, 0.7 + 0.25, z], c: LAPIS, j: 0 }); g.cyl(0.06, 0.06, 0.02, 10, { at: [sx * 0.795, 0.7 + 0.25, z], rz: PI / 2, c: GOLDH, j: 0 }); }
    for (let i = 0; i < 4; i++) g.box(0.085, 0.5, 0.05, { at: [sx * 0.755, 0.7 + 0.25, -0.5 - i * 0.62], c: GOLD }); }
  g.box(1.5, 0.44, 0.06, { at: [0, 0.7 + 0.2, -2.5 + 0.08], c: WHITE }); g.box(1.54, 0.05, 0.09, { at: [0, 0.7 + 0.44, -2.5 + 0.08], c: GOLD }); g.cyl(0.09, 0.09, 0.02, 12, { at: [0, 0.7 + 0.22, -2.5 + 0.04], rx: PI / 2, c: GOLDH });
  // the canopy: gold posts, a white linen roof, a red-and-gold border with a short gold fringe, gold finials at the corners and a sun disc on top
  for (const sx of [1, -1]) for (const z of [-0.55, -2.35]) { g.cyl(0.03, 0.03, 1.1, 8, { at: [sx * 0.72, 0.7 + 0.75, z], c: GOLD }); g.sph(0.055, 8, 6, { at: [sx * 0.8, 0.7 + 1.42, z], c: GOLDH }); }
  g.box(1.66, 0.05, 2.04, { at: [0, 0.7 + 1.32, -1.45], c: WHITE }); g.box(1.2, 0.12, 1.6, { at: [0, 0.7 + 1.4, -1.45], taper: 0.55, c: WHITE });
  for (const sx of [1, -1]) { g.box(0.03, 0.12, 2.04, { at: [sx * 0.83, 0.7 + 1.25, -1.45], c: RED }); g.box(0.035, 0.03, 2.04, { at: [sx * 0.835, 0.7 + 1.19, -1.45], c: GOLD }); for (let i = 0; i < 10; i++) g.box(0.02, 0.08, 0.05, { at: [sx * 0.835, 0.7 + 1.13, -0.5 - i * 0.21], c: GOLDH, j: 0 }); }
  for (const sz of [1, -1]) { g.box(1.66, 0.12, 0.03, { at: [0, 0.7 + 1.25, -1.45 + sz * 1.02], c: RED }); g.box(1.66, 0.03, 0.035, { at: [0, 0.7 + 1.19, -1.45 + sz * 1.025], c: GOLD }); }
  g.cyl(0.16, 0.16, 0.03, 18, { at: [0, 0.7 + 1.62, -1.45], rx: PI / 2, c: GOLDH }); g.cyl(0.025, 0.025, 0.18, 6, { at: [0, 0.7 + 1.5, -1.45], c: GOLD });
  // the pole (white, gold-capped) and the yoke over the horses
  g.box(0.09, 0.09, 2.6, { at: [0, 0.64, 1.75], rx: -0.08, c: WHITE }); for (const z of [0.8, 1.75, 2.7]) g.box(0.11, 0.11, 0.06, { at: [0, 0.64 + (z - 1.75) * 0.08, z], rx: -0.08, c: GOLD });
  g.box(1.6, 0.08, 0.08, { at: [0, 1.12, 3.0], c: WHITE }); for (const sx of [1, -1]) g.sph(0.06, 8, 6, { at: [sx * 0.82, 1.12, 3.0], c: GOLDH }); g.sph(0.08, 8, 6, { at: [0, 1.12, 3.0], c: GOLD });
  return g; }

const VEH = {
  chariot: { n: '버금 수레', tail: 0.9, bench: 0.46, bed: 0.46, stand: true, spd: 1, top: 5, cap: 12, pax: 1, beast: 'horse', hw: 1.0, camUp: 1.0,
    probe: [[-0.45, 1.0], [0.2, 0.75], [1.5, 0.35], [2.6, 0.7], [3.5, 0.55]], wheels: [[0.84, -0.42, 0.55], [-0.84, -0.42, 0.55]], wheel: r => wheelMesh(r, 3), model: () => wagon(),
    seat1: [-0.44, 0.18], seatN: k => [k % 2 ? 0.3 : -0.3, 0.45 + Math.floor(k / 2) * 0.3], sl: [[-0.36, -0.42], [0.36, -0.42], [-0.36, 0.12], [0.36, 0.12]] },
  ox: { n: '소달구지', tail: 2.6, bench: BENCH_OX, bed: 0.82, stand: false, spd: 0.42, top: 3, cap: 24, pax: 4, beast: 'cow', hw: 1.1, camUp: 1.4,
    probe: [[-2.5, 0.95], [-1.3, 1.0], [0.1, 0.85], [1.5, 0.4], [2.6, 0.8], [3.5, 0.6]], wheels: [[1.0, -1.3, 0.72], [-1.0, -1.3, 0.72]], wheel: r => discWheel(r), model: () => oxModel(),
    seat1: [-0.42, 0.02], seatN: k => [k % 2 ? 0.42 : -0.42, 1.0 + Math.floor(k / 2) * 0.7], sl: [[-0.42, -1.5], [0.42, -1.5], [-0.42, -2.2], [0.42, -2.2]] },
  coach: { n: '총리의 유람 마차', tail: 2.5, bench: 0.98, bed: 0.7, stand: false, spd: 0.9, top: 4, cap: 18, pax: 3, beast: 'horse', hw: 0.95, camUp: 1.7,
    probe: [[-2.35, 0.75], [-1.2, 0.8], [0.2, 0.75], [1.5, 0.35], [2.6, 0.7], [3.5, 0.55]], wheels: [[0.88, -1.95, 0.6], [-0.88, -1.95, 0.6], [0.84, 0.05, 0.45], [-0.84, 0.05, 0.45]], wheel: r => wheelMesh(r, r > 0.5 ? 12 : 10), model: () => coachModel(),
    seat1: [-0.42, 0.02], seatN: k => [k % 2 ? 0.36 : -0.36, 1.3 + Math.floor(k / 2) * 0.6], sl: [[-0.38, -1.25], [0.38, -1.25], [-0.38, -1.95], [0.38, -1.95]] } };
const GEARV0 = GEARV.slice(); let curVK = null; const VMESH = {}, WMESH = {};
const vk = () => { const s = S(), k = s && s.flags && s.flags.veh; return k && VEH[k] && (k === 'chariot' || (s.flags.vehOwn && s.flags.vehOwn[k])) ? k : 'chariot'; };
function VH() { return VEH[vk()]; }
function applyVeh() { const k = vk(); if (k === curVK) return; curVK = k; const v = VEH[k]; TAIL = v.tail; BENCH_Y = v.bench; BED_Y = v.bed; PROBE = v.probe; WHEELS = v.wheels; for (let i = 0; i < GEARV.length; i++) GEARV[i] = GEARV0[i] * v.spd; G.Nav && G.Nav.reset && G.Nav.reset(); }
Ct.VEH = VEH; Ct.veh = vk; Ct.beast = () => VH().beast; Ct.camUp = () => VH().camUp;
Ct.setVeh = function (k) { const s = S(); if (!VEH[k]) return false; if (s.q.riding) { G.UI.toast('수레에서 내린 뒤에 바꿔요'); return false; } if (k !== 'chariot' && !(s.flags.vehOwn && s.flags.vehOwn[k])) return false;
  const paxN = (s.q.cartPax ? 1 : 0) + (s.q.cartPax2 || []).length; if (paxN) { G.UI.toast('태운 사람을 먼저 내려 주세요'); return false; }
  s.flags.veh = k; applyVeh(); pop(`${VEH[k].n}로 다녀요`, '「수레 부르기」로 불러요', 'donkey'); return true; };
/* one open spoked wheel centred on its hub (axle along x), white and gold */
function wheelMesh(r, n) { const g = new G.GB(44 + n), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, N = 22, seg = 2 * PI * r / N * 1.12;
  for (let k = 0; k < N; k++) { const a = k / N * 2 * PI; g.box(0.075, 0.07, seg, { at: [0, Math.cos(a) * (r - 0.035), Math.sin(a) * (r - 0.035)], rx: a, c: GOLD, j: 0 });
    g.box(0.085, 0.025, seg, { at: [0, Math.cos(a) * (r - 0.085), Math.sin(a) * (r - 0.085)], rx: a, c: WHITE, j: 0 }); }
  for (let k = 0; k < n; k++) g.box(0.035, 0.035, (r - 0.08) * 2, { at: [0, 0, 0], rx: k * PI / n, c: k % 2 ? GOLD : WHITE, j: 0 });
  g.cyl(0.1, 0.1, 0.16, 12, { at: [0, 0, 0], rz: PI / 2, c: GOLD, j: 0 }); g.cyl(0.055, 0.055, 0.2, 10, { at: [0, 0, 0], rz: PI / 2, c: GOLDH, j: 0 }); return G.R.mesh(g); }
let WHEELS = [[0.84, -0.42, 0.55, 3], [-0.84, -0.42, 0.55, 3]]; const WMs = [G.m4(), G.m4(), G.m4(), G.m4()]; /* v18.43 two six-spoked wheels (3 diameters = 6 spokes) */
let wheelMs = null;
// ------------------------------------------------------------------ drawing the parked (or coming) cart, its horses and its load
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); const c = s.q.cartAt; if (s.q.riding || !c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  const bk = VH().beast; if (!HR['r' + bk]) HR['r' + bk] = [new G.Rig(G.AB[bk]), new G.Rig(G.AB[bk])]; if (!drive) HR.ph += 0.01;
  HR['r' + bk].forEach((rig, i) => { const [hx, hz] = horsePos(c, i); G.animAnimal(rig, { speed: drive ? HR.spd * 0.55 : 0, phase: HR.ph + i * 0.4, graze: !drive && (s.flags.horseEat || 0) > Date.now() }, t); rig.update(G.m4trs(HM[i], hx, hAt(hx, hz), hz, c.f));
    list.push({ mesh: bk === 'horse' ? Game.animalMesh('horse', 'plain', { royal: 1 }) /* a matched pair of white horses */ : Game.animalMesh(bk, 'plain'), bones: rig.bones, outline: true }); }); };
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; const c = cartPos(); if (!c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  const vkk = vk(), cartMesh = VMESH[vkk] || (VMESH[vkk] = G.R.mesh(VEH[vkk].model()));
  const y0 = hAt(c.x, c.z), rid = s.q.riding; G.m4trs(CM, c.x, y0, c.z, c.f, rid ? D.pitch : 0, 0, 1, 1, 1); list.push({ mesh: cartMesh, m: CM, outline: true });
  WHEELS.forEach(([lx, lz, r], i) => { const x = c.x + Math.cos(c.f) * lx + Math.sin(c.f) * lz, z = c.z - Math.sin(c.f) * lx + Math.cos(c.f) * lz; /* each wheel turns by distance ÷ its own radius: the small front ones spin faster */
    G.m4trs(WMs[i], x, y0 + r, z, c.f, WH.a / r, 0, 1, 1, 1); const wk = vkk + r; list.push({ mesh: WMESH[wk] || (WMESH[wk] = VEH[vkk].wheel(r)), m: WMs[i], outline: true }); }); /* the same wagon parked or ridden (the episode's old standing chariot is not drawn any more) */
  if (G.Phys && G.Phys.meshOf) { let i = 0; const SL = VH().sl; /* v18.43 on the chariot floor, at its back corners */
    for (const L of LOAD) { if (!L.b) continue; const [lx, lz] = SL[i % 4], f = c.f, x = c.x + Math.cos(f) * lx + Math.sin(f) * lz, z = c.z - Math.sin(f) * lx + Math.cos(f) * lz;
      G.m4trs(LM[i % 4], x, hAt(c.x, c.z) + BED_Y + 0.03 + L.b.K.r * 0.9, z, f + i, 0, 0); list.push({ mesh: G.Phys.meshOf(L.b.k), m: LM[i % 4], outline: true }); i++; } } };
/* v18.25 (the 앉기 button is 「정지 / 후진」 on the wagon now — there is still no crouching there) */
/* v18.28 no big help card in the middle of the screen while the wagon is rolling: it waits until you have stopped for a moment */
const HQ = []; let stillT = 0; { const h0 = G.UI.help; if (h0) { G.UI.help = function (k, t, l) { if (driving() && Math.abs(D.v) > 0.4) { if (!HQ.some(q => q[0] === k)) HQ.push([k, t, l]); return true; } return h0.apply(this, arguments); };
  Ct.helpTick = dt => { if (!HQ.length) return; if (driving() && Math.abs(D.v) > 0.2 || G.UI.busy()) { stillT = 0; return; } if ((stillT += dt) > 1.2) { stillT = 0; const q = HQ.shift(); h0.apply(G.UI, q); } }; } }
/* v18.34 a loaded game starts with a quiet cart (a cart still coming, things on its floor or a feeding timer from the game before carried over) */
{ const E = G.EP && G.EP.joseph; if (E) { const ol = E.onLoad; E.onLoad = function () { const r = ol ? ol.apply(this, arguments) : undefined; try { drive = null; LOAD.length = 0; Object.assign(D, { v: 0, hv: 0, sx: 0, thr: 0, pend: null, brake: null, whipT: 0, feedT: 0, feedK: null, tired: false, held: false, kHeld: false }); AUTO.on = false; HQ.length = 0; } catch (e) { } return r; }; } }
})(window.G);
