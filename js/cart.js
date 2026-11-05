/* 약속의 길 — 버금 수레 (v18.21 → v18.24)
   · 마을(성읍·서쪽·남쪽 마을)과 관저·보디발의 집 안에서는 수레를 탈 수 없어요 — 사람들이 다쳐요. 타고 들어가면 마을 어귀에서 내려요.
   · 수레 위에서는 물건을 주울 수 없어요(말은 걸 수 있어요).
   v18.23 · 요셉은 수레 바닥에 앉아서 가요. · 옆자리에 한 사람(타고 있을 때 가까운 사람에게 A키 「옆자리에 태우기」).
     · 붙잡은 죄수는 수레 뒤칸에 앉혀 데려가요.
   v18.24 · 왼쪽 「수레 부르기」: 수레가 요셉 가까운 곳에 나타나 요셉 쪽으로 달려와 멈춰요(마을 안에서는 못 불러요).
     · 수레 뒤: A키 「수레 타기」, B키 「짐칸」(12칸) — 물건을 들고 있으면 B키 「싣기」(수레 바닥에 실려요),
       따라오는 사람이 있으면 「싣기 · 이름」(뒤칸에 앉아요), 실은 것이 있으면 「내리기 · 이름」.
     · 탄 채로: A키 「내리기」(수레 뒤로 내려요), B키 「짐칸」.
     · 말 앞: A키 「먹이 주기」(꼴·보리·밀 → 기력 +30, 하루 동안 달려도 기력이 늦게 닳아요), B키 「쓰다듬기」(정신력 +3). */
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

// ------------------------------------------------------------------ getting on and off
function mount() { const s = S(), c = s.q.cartAt; if (!c || drive) return; const t = Ct.town(c.x, c.z); if (t) { pop('여기선 못 타요', `${t} 안이에요 · 넓은 곳에서 타요`, 'donkey'); return; }
  Game.teleport(c.x, c.z, c.f); s.q.riding = 1; s.q.rode = 1; sfx('whoosh'); Game.checkStep(); Game.snapCam && Game.snapCam();
  if (!help('cartRide', '버금 수레', 'A키 내리기 · B키 짐칸 · 달리기 버튼을 누르면 말이 힘차게 달려요')) pop('수레에 탔어요', '달리기 버튼으로 힘차게 달려요', 'donkey'); G.UI.hud(); }
function dismount(quiet) { const s = S(), p = P(); if (!s.q.riding) return; s.q.cartAt = { x: p.x, z: p.z, f: p.face }; s.q.riding = 0;
  const [rx, rz] = rearOf(s.q.cartAt), [fx, fz] = fwd(p.face); Game.teleport(rx - fx * 0.5, rz - fz * 0.5, p.face); sfx('step'); Game.snapCam && Game.snapCam(); if (!quiet) pop('수레에서 내렸어요', '수레는 여기 서 있어요', 'donkey'); G.UI.hud(); }
Ct.mount = mount; Ct.dismount = dismount;
// the left button: 「수레 부르기」 (no 「타기/내리기」 there any more — that is A at the cart)
const e = (EP.extra || []).find(x => x.id === 'chariot');
if (e) { const on0 = e.on; e.on = (s, g) => (on0 ? on0(s, g) : true) && !s.q.riding; e.label = () => '수레 부르기'; e.click = () => Ct.call(); }
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
  const u = d.L > 0 ? d.s / d.L : 1; s.q.cartAt = { x: d.x0 + (d.x1 - d.x0) * u, z: d.z0 + (d.z1 - d.z0) * u, f: d.f }; HR.ph += d.v * dt * 1.6;
  d.hoof += d.v * dt; if (d.hoof > 1.3) { d.hoof = 0; sfx('step', { surf: 'stone', vol: 0.3 + d.v / 30, pitch: 0.7 + Math.random() * 0.2, x: s.q.cartAt.x, z: s.q.cartAt.z }); }
  if (d.s >= d.L - 0.01) { drive = null; HR.spd = 0; sfx('blip', { pitch: 0.55 }); if (!help('cart', '버금 수레', '수레 뒤에서 A키 타기 · B키 짐칸(들고 있으면 싣기) · 말 앞에서 A키 먹이 주기 · B키 쓰다듬기')) pop('수레가 왔어요', '수레 뒤에서 A키로 타요', 'donkey'); }
  else HR.spd = d.v; }

let cool = 0, bKey = '';
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; const dd = typeof dt === 'number' && dt < 1 ? dt : 1 / 60; cool -= dd;
  try { driveTick(dd); cartPeople(); } catch (er) { console.error('cart', er); }
  { const p = P(), now = s.day * 24 + s.time % 24; if (s.q.riding && p.sprint && p.spd > 3 && (s.flags.horseBuff || 0) > now) p.stam = Math.min((G.Vitals && G.Vitals.cap) || 140, p.stam + 10 * dd); } /* fed horses: half the breath */
  if (s.q.riding && cool <= 0 && !(G.Cine && G.Cine.on)) { const t = Ct.town(P().x, P().z); if (t) { cool = 2; dismount(true); pop('수레에서 내렸어요', `${t} 안에서는 걸어요`, 'donkey'); } }
  { const b = Ct.bCtx(), k = b ? b.k + b.label : ''; if (k !== bKey) { bKey = k; G.UI.hud(); } } /* B follows where you stand at once (the HUD only refreshes twice a second) */
  return r; };
/* seated on the cart's floor instead of standing at the reins */
const ry0 = EP.rootY; EP.rootY = function (s, g) { const b = ry0 ? ry0.apply(this, arguments) || 0 : 0; return s && s.q && s.q.riding && s.q.chariotOk ? b + (BENCH_Y - 0.46) : b; }; /* (episode base 0.46 + this = on the bench cushion) */
const pose0 = EP.pose; EP.pose = function (pst, s, g) { const r = pose0 ? pose0.apply(this, arguments) : undefined; if (s.q.riding && s.q.chariotOk) { pst.act = 'sitg'; pst.actT = 0; pst.sit = false; } return r; };

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
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || Game.cineOn || p.act || G.UI.busy()) return null; const out = [];
  out.push({ d: 1.3, label: '내리기', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartOff', use: () => dismount() });
  if (!s.q.cartPax) { let best = null, bd = 2.6; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n.d.animal || n.d.noTalk === true || n.sleep || n.talking || n.follow || n._inCart || n.d.fixed || n.d.sit || n.seatY) continue; const tg = Game.curTarget; if (tg && tg.npc === id) continue;
      const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < bd) { bd = d; best = n; } }
    if (best) out.push({ d: bd - 1.4, label: `옆자리에 태우기 · ${short(best)}`, x: best.x, z: best.z, yAbs: best.y + 2, noMagnet: true, rideOk: true, key: 'cartPax', use: () => { s.q.cartPax = best.id; G.UI.say([{ n: best.name, t: '우와, 총리님 수레에 타 보다니요!' }], () => { }); pop('옆자리에 태웠어요', best.name, 'donkey'); } }); }
  return out; });

// ------------------------------------------------------------------ at the parked cart: behind it, and by the horses
const HR = { rigs: null, ph: 0, spd: 0 }, CM = G.m4(), HM = [G.m4(), G.m4()], LM = [G.m4(), G.m4(), G.m4(), G.m4()];
let cartMesh = null;
const horsePos = (c, i) => { const s = i ? 1 : -1, f = c.f; return [c.x + Math.sin(f) * 2.6 + Math.cos(f) * s * 0.55, c.z + Math.cos(f) * 2.6 - Math.sin(f) * s * 0.55]; };
const parked = () => { const s = S(); return !s.q.riding && s.q.chariotOk && s.q.cartAt ? s.q.cartAt : null; };
const rearD = () => { const c = parked(); if (!c || drive) return null; const [rx, rz] = rearOf(c); return Math.hypot(rx - P().x, rz - P().z); };
const nearHorse = () => { const c = parked(); if (!c || drive) return null; let bd = 1e9; for (const i of [0, 1]) { const [hx, hz] = horsePos(c, i); bd = Math.min(bd, Math.hypot(hx - P().x, hz - P().z)); } return bd < 2.3 ? bd : null; };
const FEED = ['hay', 'barley', 'wheat'];
function feed() { const s = S(), k = FEED.find(x => Game.inv(x) > 0); if (!k) { G.UI.toast('꼴·보리·밀 중 하나가 있어야 해요'); return; }
  Game.take(k, 1); s.flags.horseBuff = s.day * 24 + s.time % 24 + 24; s.flags.horseEat = Date.now() + 4000; P().stam = Math.min((G.Vitals && G.Vitals.cap) || 140, P().stam + 30); sfx('blip', { pitch: 0.5 });
  pop('말이 먹이를 먹어요', `${Game.ITEMS[k].n} · 하루 동안 지치지 않고 달려요`, 'donkey'); G.UI.hud(); }
function pet() { const H = S().hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 3); sfx('blip', { pitch: 0.6 }); if (G.Acts) G.Acts.play('pet', { quiet: true }); pop('히히힝~', '말이 좋아해요 · 정신력 +3', 'donkey'); G.UI.hud(); }
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
  if (s.q.riding) return { k: 'box', label: '짐칸', fn: () => G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12) };
  const r = rearD(); if (r !== null && r < 1.9) { if (G.Phys && G.Phys.held) return { k: 'load', label: '싣기', fn: loadHeld };
    const n = follower(); if (n) return { k: 'loadN', label: `싣기 · ${short(n)}`, fn: () => loadMan(n) };
    if (LOAD.length) return { k: 'unload', label: `내리기 · ${loadName(LOAD[LOAD.length - 1])}`, fn: unloadLast };
    return { k: 'box', label: '짐칸', fn: () => G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12) }; }
  if (nearHorse() !== null && !(G.Phys && G.Phys.held)) return { k: 'pet', label: '쓰다듬기', fn: pet };
  return null; };
Ct.feedCtx = () => null; /* (v18.23's B 「먹이 주기」 is A now) */
Game.CTX.push(function (s) { const p = P(); if (p.act || Game.cineOn || s.q.riding) return null; const c = parked(); if (!c) return null; const out = [];
  const r = rearD(); if (r !== null && r < 1.9) { const [rx, rz] = rearOf(c); out.push({ d: r - 0.4, label: '수레 타기', x: rx, z: rz, y: 1.2, noMagnet: true, key: 'cartOn', use: mount }); }
  const h = nearHorse(); if (h !== null) { const [hx, hz] = horsePos(c, 0); out.push({ d: h - 0.6, label: '먹이 주기', x: hx, z: hz, y: 1.8, noMagnet: true, key: 'horseFeed', use: feed }); }
  return out.length ? out : null; });
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const b = Ct.bCtx(); if (b) { b.fn(); return; } return atk0.apply(this, arguments); }; }
{ const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const f = Game.mode === 'play' && Ct.bCtx(), b = document.getElementById('btnAtk'); if (f && b) { b.hidden = false; document.getElementById('btnAtkL').textContent = f.label; const n = document.getElementById('btnAtkN'); if (n) n.hidden = true; } } catch (e) { } return r; }; }
// picking a loaded thing up from the cart by hand takes it off the load
if (G.Phys) { const pk0 = G.Phys.pick; G.Phys.pick = function (b) { const i = LOAD.findIndex(L => L.b === b); if (i >= 0 && b._onCart) { LOAD.splice(i, 1); b._onCart = false; b.gone = false; } return pk0.apply(this, arguments); }; }

/* v18.24c the royal wagon in white and gold: open spoked wheels (you see through them), a white driver's box with a gold sun disc,
   a white coach-bed framed in gold with lapis panels, a white linen canopy on gold posts with a gold fringe and finials */
function wagon() { const g = new G.GB(43), PI = Math.PI, GOLD = 0xe2b440, GOLDH = 0xf6d878, WHITE = 0xf4efe4, IVORY = 0xe6dccb, LAPIS = 0x2c4f9a, RED = 0xa83a2a;
  const wheel = (x, z, r, n) => { const N = 22, seg = 2 * PI * r / N * 1.12;
    for (let k = 0; k < N; k++) { const a = k / N * 2 * PI; g.box(0.075, 0.07, seg, { at: [x, r + Math.cos(a) * (r - 0.035), z + Math.sin(a) * (r - 0.035)], rx: a, c: GOLD, j: 0 });
      g.box(0.085, 0.025, seg, { at: [x, r + Math.cos(a) * (r - 0.085), z + Math.sin(a) * (r - 0.085)], rx: a, c: WHITE, j: 0 }); }
    for (let k = 0; k < n; k++) g.box(0.035, 0.035, (r - 0.08) * 2, { at: [x, r, z], rx: k * PI / n, c: k % 2 ? GOLD : WHITE, j: 0 });
    g.cyl(0.1, 0.1, 0.16, 12, { at: [x, r, z], rz: PI / 2, c: GOLD, j: 0 }); g.cyl(0.055, 0.055, 0.2, 10, { at: [x, r, z], rz: PI / 2, c: GOLDH, j: 0 }); };
  // undercarriage (white beams, gold axles) and four open wheels
  for (const sx of [1, -1]) { g.box(0.09, 0.1, 3.0, { at: [sx * 0.55, 0.58, -1.0], c: IVORY }); wheel(sx * 0.88, -1.95, 0.6, 12); wheel(sx * 0.84, 0.05, 0.45, 10); }
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
// ------------------------------------------------------------------ drawing the parked (or coming) cart, its horses and its load
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); const c = s.q.cartAt; if (s.q.riding || !c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!HR.rigs) HR.rigs = [new G.Rig(G.AB.horse), new G.Rig(G.AB.horse)]; if (!drive) HR.ph += 0.01;
  HR.rigs.forEach((rig, i) => { const [hx, hz] = horsePos(c, i); G.animAnimal(rig, { speed: drive ? HR.spd * 0.55 : 0, phase: HR.ph + i * 0.4, graze: !drive && (s.flags.horseEat || 0) > Date.now() }, t); rig.update(G.m4trs(HM[i], hx, hAt(hx, hz), hz, c.f));
    list.push({ mesh: Game.animalMesh('horse', 'plain', { saddle: 0xe2b440 }) /* a matched pair of white horses */, bones: rig.bones, outline: true }); }); };
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; const c = cartPos(); if (!c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!cartMesh) cartMesh = G.R.mesh(wagon());
  G.m4trs(CM, c.x, hAt(c.x, c.z), c.z, c.f, 0, 0, 1, 1, 1); list.push({ mesh: cartMesh, m: CM, outline: true }); /* the same wagon parked or ridden (the episode's old standing chariot is not drawn any more) */
  if (G.Phys && G.Phys.meshOf) { let i = 0; const SL = [[-0.38, -1.25], [0.38, -1.25], [-0.38, -1.95], [0.38, -1.95]];
    for (const L of LOAD) { if (!L.b) continue; const [lx, lz] = SL[i % 4], f = c.f, x = c.x + Math.cos(f) * lx + Math.sin(f) * lz, z = c.z - Math.sin(f) * lx + Math.cos(f) * lz;
      G.m4trs(LM[i % 4], x, hAt(c.x, c.z) + BED_Y - 0.04 + L.b.K.r * 0.9, z, f + i, 0, 0); list.push({ mesh: G.Phys.meshOf(L.b.k), m: LM[i % 4], outline: true }); i++; } } };
})(window.G);
