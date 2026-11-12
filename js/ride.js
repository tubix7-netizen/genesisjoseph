/* 약속의 길 — mounts. The hero can own donkeys and camels (S.mounts), ride them (faster travel, gallop with the run
   button, no stamina cost), call them with a whistle, and carry one passenger (family or friends) behind. NPCs with
   d.mount ride their own animals (travelers, merchants). Owned mounts graze where they were left, or rest in a stable. */
'use strict';
(function (G) {
const { Rig, AB, animAnimal, m4, m4trs, clamp, lerp, angDiff } = G;
const Game = G.Game, PI = Math.PI;
const Rd = G.Ride = { list: [], npcM: new Map() };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
// seat: height of the saddle top above the ground and its offset along the body; back: passenger offset behind
const MT = Rd.MT = {
  donkey: { n: '나귀', walk: 4.6, run: 8.6, seatY: 1.24, seatZ: -0.06, back: 0.46, camUp: 0.55, r: 0.55, saddle: 0x9a3a2a, gaitK: 3.4 },
  camel: { n: '낙타', walk: 5.0, run: 9.6, seatY: 2.3, seatZ: -0.05, back: 0.5, camUp: 1.25, r: 0.75, saddle: 0xb3472e, gaitK: 2.4 },
  horse: { n: '말', walk: 5.4, run: 11, seatY: 1.5, seatZ: -0.05, back: 0.5, camUp: 0.75, r: 0.65, saddle: 0x6a3a2a, gaitK: 3 },
};
const HIP = 0.86; // rider's root sits this far below the saddle top
Rd.spec = m => MT[m.sp] || MT.donkey;
/* v17.0 보행 속도 범위 (움직임 연구 보고서 2장 ②, RDR2 말): every gait has a [min, ideal, max] speed. Inside its range the gait
   keeps playing — slower than ideal it takes shorter, slower strides (stride length and cadence both ~sqrt(v/ideal), so the
   hooves still match the ground), faster it reaches further. It only changes gait past max (up) or under min (down), so it
   never flickers at a boundary, and the phase runs on continuously, so the feet carry over into the new gait. */
const GSTR = { walk: 1.15, trot: 1, pace: 1, gallop: 0.8 }; // stride factor: cadence at the ideal speed = ideal * gaitK * this
Rd.gaits = function (spc) { const W = spc.walk, R = spc.run, mid = spc === MT.camel ? 'pace' : 'trot';
  return [['walk', 0, W * 0.5, W * 0.82], [mid, W * 0.62, W, W + 0.9], ['gallop', W + 0.5, R, R * 1.4]]; };
Rd.gaitStep = function (q, spc, v, dt) { // q keeps .gi (current gait); returns phase rate (rad/s), gait weights, stride amplitude
  const GT = spc.gt || (spc.gt = Rd.gaits(spc)); let gi = q.gi === undefined ? 0 : q.gi;
  while (gi < GT.length - 1 && v > GT[gi][3]) gi++; while (gi > 0 && v < GT[gi][1]) gi--; q.gi = gi;
  const g = GT[gi], qv = Math.max(0, v) / g[2], rq = Math.sqrt(qv);
  const want = g[2] * spc.gaitK * GSTR[g[0]] * rq; q.rate = q.rate === undefined ? want : q.rate + (want - q.rate) * Math.min(1, dt * 6); const rate = q.rate, gw = { walk: 0, trot: 0, pace: 0, gallop: 0 }; gw[g[0]] = 1;
  const aw = clamp(rq, 0.45, 1.25); q.amp = q.amp === undefined ? aw : q.amp + (aw - q.amp) * Math.min(1, dt * 6); // stride length eases too
  return { rate, gw, amp: q.amp, name: g[0] }; };
const S0 = () => Game.S();
const mounts = S => S.mounts || (S.mounts = []);
const meshOf = (sp, m) => Game.animalMesh(sp, 'plain', Object.assign({ saddle: (m && m.saddle) || MT[sp].saddle }, sp === 'horse' ? { bags: 1 } : {}, m && m.hide ? { hide: m.hide, mane: m.mane } : {})); /* v18.33 bought horses keep their coat colour */
Rd.mine = () => Rd.list;

// ------------------------------------------------------------------ lifecycle
Rd.reset = function (S) {
  for (const r of Rd.list) if (r.col) r.col.on = false;
  Rd.list = []; Rd.npcM.clear(); const P = Game.P; P.ride = null;
  for (const m of mounts(S)) addRT(m);
};
function addRT(m) {
  const W = Game.W(), P = Game.P; if (m.x === undefined) { m.x = P.x + 2; m.z = P.z + 1.5; m.face = P.face; }
  const r = { m, rig: new Rig(AB[m.sp]), mesh: meshOf(m.sp, m), x: m.x, z: m.z, y: W.heightAt(m.x, m.z), face: m.face || 0, ph: Math.random() * 6, sp: 0, wait: 2, tx: null, M: m4(), seed: Math.random() * 9 };
  r.col = W.addCol({ x: r.x, z: r.z, r: MT[m.sp].r, h: 1.6 }); Rd.list.push(r); return r;
}
Rd.add = function (sp, name, x, z) {
  const S = S0(); const m = { id: 'm' + (S.mountN = (S.mountN || 0) + 1), sp, name: name || MT[sp].n, x, z, face: 0, st: 100 };
  mounts(S).push(m); return addRT(m);
};
Rd.remove = function (id) { const S = S0(), P = Game.P; const i = mounts(S).findIndex(m => m.id === id); if (i < 0) return; const r = Rd.list.find(x => x.m.id === id); if (r) { if (P.ride === r) Rd.dismount(true); r.col.on = false; Rd.list = Rd.list.filter(x => x !== r); } mounts(S).splice(i, 1); };
Rd.cap = S => 1 + (G.Build ? G.Build.count(S, 'stable') * 2 : 0);
// bought at a trader: the animal waits next to the shop (or in a stable you built)
Rd.buy = function (entry) {
  const S = S0(), P = Game.P;
  if (mounts(S).length >= Rd.cap(S)) { G.UI.toast(Game.feat('build2') ? '탈것을 더 두려면 마구간을 지어야 해요 (마구간 하나에 둘씩)' : '지금은 탈것을 하나만 둘 수 있어요'); return false; }
  const home = G.Build && G.Build.stableSpot(S); const a = P.face + PI / 2, x = home ? home[0] : P.x + Math.sin(a) * 2.4, z = home ? home[1] : P.z + Math.cos(a) * 2.4;
  const r = Rd.add(entry.mount, entry.mname, x, z); r.face = P.face; r.m.face = P.face;
  Game.unlockFeat('ride'); G.UI.toast(`${r.m.name}을(를) 샀어요 · ${home ? '마구간에 있어요' : '곁에서 기다려요'} · 가까이 가서 A로 타요`); sfx({ horse: 'neigh', camel: 'camel', donkey: 'bray' }[entry.mount] || 'bleat'); return true;
};
Rd.onDay = function (S) { for (const m of mounts(S)) m.st = 100; for (const r of Rd.list) r.tired = false; if (Game.P.ride) Game.P.ride.tired = false; };

// ------------------------------------------------------------------ riding
/* v18.35 a horse is ridden like the wagon: 전진 taps set the pace (1 walk, 2 steady — no strain —, 3 and up tiring), the stick steers, 「정지」 stops, 「자동 이동」 follows the road; towns: pace 2 at most */
const HG = [0, 2.8, 5.4, 7.6, 9.6, 11.6], HN = ['', '걷기', '보통', '빠르게', '달리기', '질주']; const H = Rd.H = { gear: 0, v: 0, idle: 9, auto: false };
const isHorse = () => { const r = Game.P.ride; return !!(r && r.m.sp === 'horse'); }; Rd.isHorse = isHorse; const townNow = () => { const P = Game.P; return !!(G.Cart && G.Cart.town && G.Cart.town(P.x, P.z)); };
const topG = () => (Game.P.ride && Game.P.ride.tired) ? 1 : townNow() ? 2 : 5;
Rd.tap = function () { H.idle = 0; H.gear = Math.min(H.gear + 1, topG()); sfx('hoof', { pitch: 1.2, vol: 0.5 }); G.UI.hud(); };
Rd.stop = function () { if (H.auto) { if (H.gear > 1) { H.gear--; G.UI.toast('자동 이동 · ' + HN[H.gear]); return; } H.auto = false; G.UI.toast('자동 이동을 껐어요'); } H.gear = 0; };
Rd.autoToggle = function () { if (!isHorse()) return; if (H.auto) { H.auto = false; G.UI.toast('자동 이동을 껐어요'); return; } if (!(G.Nav && G.Nav.path())) { G.UI.toast('갈 곳이 없어요 · 목표나 지도 표시가 있어야 해요'); return; } H.auto = true; if (!H.gear) H.gear = 2; G.UI.toast('자동 이동 · 전진 탭으로 빠르게 · 정지로 느리게'); };
Rd.steer = function (dt) { const P = Game.P, IN = Game.INPUT; let wx = (IN.mx || 0) + ((IN.keys.KeyD ? 1 : 0) - (IN.keys.KeyA ? 1 : 0)); wx = Math.max(-1, Math.min(1, wx)); if (Math.abs(wx) < 0.12) wx = 0; const v = H.v, av = Math.abs(v);
  if (H.auto) { if (Math.abs(wx) > 0.55) { H.auto = false; G.UI.toast('직접 몰아요 · 자동 이동을 껐어요'); } else { const path = G.Nav && G.Nav.path(); if (!path || path.length < 2) { H.auto = false; H.gear = 0; } else { let tg = path[path.length - 1]; for (let i = 1; i < path.length; i++) if (Math.hypot(path[i][0] - P.x, path[i][1] - P.z) > 6) { tg = path[i]; break; } const df = angDiff(P.face, Math.atan2(tg[0] - P.x, tg[1] - P.z)); wx = Math.max(-1, Math.min(1, -df * 1.8)); const end = path[path.length - 1], left = Math.hypot(end[0] - P.x, end[1] - P.z); if (left < 6) { H.gear = 0; H.auto = false; G.UI.toast('다 왔어요!'); } else if (left < 16) H.gear = Math.min(H.gear, 1); } } }
  if (wx) { const rate = Math.max(0.9, 2.5 - av * 0.15) * (0.35 + 0.65 * Math.min(1, av / 1.2)); P.face -= wx * rate * dt; }
  if (G.UI.busy()) { H.gear = 0; H.rev = false; } if (!H.auto) H.idle += dt; const held = IN.actHeld || H.kHeld; if (held) H.idle = 0; if (H.gear >= 3 && !held && H.idle > 3) { H.gear--; H.idle = 0; } if (H.gear > topG()) H.gear = topG(); if (H.gear) H.rev = false; const want = H.rev ? -1.7 : HG[H.gear]; H.v += Math.max(-7 * dt, Math.min(2.6 * dt, want - H.v)); return [Math.sin(P.face) * H.v, Math.cos(P.face) * H.v]; };
Game.CTX.push(function () { const P = Game.P; if (!isHorse() || Game.cineOn || G.UI.busy()) return null; return [{ d: -9, label: H.gear ? `전진 · ${HN[H.gear]}` : '전진', x: P.x, z: P.z, y: 1.8, noMagnet: true, noTag: true, rideOk: true, key: 'horseGo', use: Rd.tap }]; });
Rd.mount = function (r) {
  const P = Game.P; if (P.ride || P.act || G.UI.busy()) return;
  P.ride = r; r.col.on = false; H.gear = 0; H.v = 0; H.auto = false; P.x = r.x; P.z = r.z; P.face = r.face; P.vx = P.vz = 0; P.sprint = false; r.wait = 0; r.called = false;
  sfx('hoof', { pitch: 0.9 }); G.UI.hud();
  const S = S0(); if (r.m.sp === 'horse') { if (G.UI.help) G.UI.help('horseRide', '말 타기', '스틱 좌우 = 방향 · 전진 한 번 = 걷기 · 두 번 = 보통 (안 지쳐요) · 세 번부터 달려요 · 탭 뒤에 꾹 누르면 그 속도 유지 · 「정지」로 서고, 선 뒤엔 「후진」 · 달리기 = 먹이 주기 · 점프 = 짐칸'); } else if (!S.flags.rodeOnce) { S.flags.rodeOnce = 1; G.UI.toast('달리기 버튼으로 빨리 달리고, 왼쪽 아래 「내리기」로 내려요'); }
};
Rd.dismount = function (quiet, why) {
  const P = Game.P, r = P.ride; if (!r) return; const W = Game.W();
  P.ride = null; P.sprint = false; /* v18.34 */ const a = P.face + PI / 2; let x = r.x + Math.sin(a) * 1.15, z = r.z + Math.cos(a) * 1.15; const q = { x, z }; W.collide(q, 0.38); P.x = q.x; P.z = q.z; P.y = W.heightAt(P.x, P.z);
  H.gear = 0; H.v = 0; H.auto = false; r.col.x = r.x; r.col.z = r.z; r.col.on = true; r.m.x = r.x; r.m.z = r.z; r.m.face = r.face; r.tx = null; r.wait = 3;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.pass === r) dropPass(n, r); }
  if (why) G.UI.toast(why); else if (!quiet) sfx('hoof', { pitch: 1.1, vol: 0.5 }); G.UI.hud();
};
// whistle: the nearest own mount trots to you (from far away it is brought along by a servant — it just appears nearby)
Rd.call = function () { if ((G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside()) || (G.Homes && G.Homes.inside && G.Homes.inside()) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) { G.UI.toast('여기서는 부를 수 없어요'); return; } /* v18.34 */
  const P = Game.P; if (P.ride) return; let best = null, bd = 1e9;
  for (const r of Rd.list) { const d = Math.hypot(r.x - P.x, r.z - P.z); if (d < bd) { bd = d; best = r; } }
  if (!best) return; sfx('whistle');
  if (bd > 90) { const a = P.face + PI + 0.6, W = Game.W(); best.x = P.x + Math.sin(a) * 9; best.z = P.z + Math.cos(a) * 9; best.y = W.heightAt(best.x, best.z); }
  best.called = true; best.tx = null; G.UI.toast(`${best.m.name}을(를) 불렀어요`);
};
Rd.near = function () { const P = Game.P; let best = null, bd = 2.8; for (const r of Rd.list) { if (r === P.ride) continue; const d = Math.hypot(r.x - P.x, r.z - P.z); if (d < bd) { bd = d; best = r; } } return best; };

// ------------------------------------------------------------------ passengers
const canRide = n => !n.d.animal && n.vis && !n.talking && !n.walk && !n.d.noRide && !n.trav && (n.d.rider || n.follow || n.d.family);
function takePass(n) {
  const P = Game.P, r = P.ride; if (!r) return; for (const id in Game.ENT.npcs) if (Game.ENT.npcs[id].pass === r) { G.UI.toast('한 사람만 더 태울 수 있어요'); return; }
  n._follow = n.follow; if (n.follow) Game.npcFollow(n.id, false); n.pass = r; n.walk = null; n.sit = false; n.act = null; n.wander = null;
  sfx('blip', { pitch: 1.2 }); G.Life && G.Life.bubble(n.id, ['고마워요!', '와, 높다!', '꽉 잡을게요!', '천천히 가요~'][Math.floor(Math.random() * 4)], 2.2);
}
function dropPass(n, r) {
  const W = Game.W(); n.pass = null; const a = (r ? r.face : 0) - PI / 2; n.x += Math.sin(a) * 1.3; n.z += Math.cos(a) * 1.3; n.y = W.heightAt(n.x, n.z);
  n.col.x = n.x; n.col.z = n.z; n.schedSlot = -1; if (n._follow) Game.npcFollow(n.id, true); n._follow = false; if (n.wander) { n.wander.cx = n.x; n.wander.cz = n.z; }
}
Rd.passSeat = function (n) {
  const r = n.pass, P = Game.P; if (!r || P.ride !== r) { dropPass(n, r); return; } const sp = Rd.spec(r.m), W = Game.W();
  const bz = sp.seatZ - sp.back; n.face = r.face; n.x = r.x + Math.sin(r.face) * bz; n.z = r.z + Math.cos(r.face) * bz; n.y = r.y + sp.seatY - HIP * (n.scale || 1) + 0.02 + (r.bob || 0);
};

// ------------------------------------------------------------------ interaction candidates
Game.CTX.push(function (S) {
  const P = Game.P, out = [];
  if (!P.ride) { const r = Rd.near(); if (r && !P.act && !(r.m.sp === 'horse' && Rd.atHead && Rd.atHead(r))) out.push({ d: Math.hypot(r.x - P.x, r.z - P.z) - 0.4, label: `${r.m.name} 타기`, x: r.x, z: r.z, y: Rd.spec(r.m).seatY + 0.6, use: () => Rd.mount(r), key: 'mount:' + r.m.id, rideOk: true }); return out; }
  if (!Game.feat('ride2')) return out;
  let has = null; for (const id in Game.ENT.npcs) if (Game.ENT.npcs[id].pass === P.ride) has = Game.ENT.npcs[id];
  if (has) return out;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!canRide(n)) continue; const d = Math.hypot(n.x - P.x, n.z - P.z); if (d > 3.2) continue;
    out.push({ d: d - 0.2, label: `${n.name} 태우기`, x: n.x, z: n.z, y: 2.4, use: () => takePass(n), key: 'pass:' + id, rideOk: true }); }
  return out;
});
Rd.takePass = takePass; Rd.paxCand = () => { const P = Game.P; if (!P.ride || !Game.feat('ride2') || Rd.passenger()) return null; let b = null, bd = 3.2; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!canRide(n)) continue; const d = Math.hypot(n.x - P.x, n.z - P.z); if (d < bd) { bd = d; b = n; } } return b; };
Rd.passenger = () => { const P = Game.P; if (!P.ride) return null; for (const id in Game.ENT.npcs) if (Game.ENT.npcs[id].pass === P.ride) return Game.ENT.npcs[id]; return null; };
Rd.drop = () => { const n = Rd.passenger(); if (n) { dropPass(n, Game.P.ride); G.Life && G.Life.bubble(n.id, '여기서 내릴게요!', 2); } };

// ------------------------------------------------------------------ per-frame
Rd.update = function (dt, t) {
  const S = S0(), P = Game.P, W = Game.W(); if (!S || !W) return;
  for (const r of Rd.list) {
    const sp = Rd.spec(r.m); let speed = 0;
    if (r === P.ride) {
      const dfx = P.x - r.x, dfz = P.z - r.z; r.x = P.x; r.z = P.z; r.face = P.face; speed = P.spd;
      if (r.m.sp === 'horse') { /* v18.35 the horse is long: its nose and rump stop at walls as well */ const fx = Math.sin(P.face), fz = Math.cos(P.face); for (const [l, rr] of [[1.05, 0.42], [-0.95, 0.42]]) { const q = { x: P.x + fx * l, z: P.z + fz * l }, x0 = q.x, z0 = q.z; W.collide(q, rr, P.y + 0.3); const ax = q.x - x0, az = q.z - z0; if (Math.abs(ax) + Math.abs(az) > 1e-4) { P.x += ax; P.z += az; if (l > 0 && H.v > 0.5) { H.v *= 0.5; if (H.v < 2 && H.gear > 1) H.gear = 1; } } } r.x = P.x; r.z = P.z;
        /* 다그닥 다그닥: three quick beats and a rest at the gallop, two at the trot, four even ones at the walk */ const beats = speed > 7 ? [0, 0.13, 0.26] : speed > 4 ? [0, 0.5] : [0, 0.25, 0.5, 0.75], ph = (r.ph / (PI * 2)) % 1; for (let bi = 0; bi < beats.length; bi++) { const b = beats[bi]; const crossed = r.lp !== undefined && ((r.lp < b && ph >= b) || (r.lp > ph && b < ph) || (r.lp > ph && b >= r.lp)); if (crossed && speed > 0.5) { sfx('hoof', { pitch: 0.92 + bi * 0.12 + Math.random() * 0.05, vol: Math.min(1, 0.32 + speed / 11), gap: 0.03 }); break; } } r.lp = ph; }
      if (r.m.sp === 'horse' ? speed > 6.1 : speed > sp.walk + 0.5) { r.m.st = Math.max(0, (r.m.st === undefined ? 100 : r.m.st) - dt * 7 * (r.m.buff > 0 ? 0.45 : 1) * (S.flags.goldTack ? 0.7 : 1)); if (r.m.st <= 0 && !r.tired) { r.tired = true; P.sprint = false; G.UI.toast(`${r.m.name}이(가) 지쳤어요 · 천천히 걸으면 다시 힘이 나요`); } }
      else { r.m.st = Math.min(100, (r.m.st === undefined ? 100 : r.m.st) + dt * (speed < 0.3 ? 10 : 4)); if (r.tired && r.m.st > 40) r.tired = false; }
      if (r.tired) P.sprint = false;
      if (speed > 0.6 && r.m.sp !== 'horse') { const step = Math.floor(r.ph / PI); if (step !== r.lastStep) { r.lastStep = step; sfx('hoof', { pitch: 0.85 + Math.random() * 0.25, vol: Math.min(1, 0.25 + speed / 10), gap: 0.08 }); } }
      if (speed > 7 && Math.random() < dt * 8) G.FX.burst(r.x - Math.sin(r.face) * 0.6, r.y + 0.05, r.z - Math.cos(r.face) * 0.6, 2, { c: [0.82, 0.75, 0.6], sp: 0.5, up: 0.5, size: 0.22, a: 0.6, g: 0.5 });
    } else {
      const d = Math.hypot(r.x - P.x, r.z - P.z);
      if (r.called) { if (d < 2.6) { r.called = false; r.face = Math.atan2(P.x - r.x, P.z - r.z); } else { speed = d > 12 ? 6 : 3; const dx = P.x - r.x, dz = P.z - r.z; mv(r, dx / d * speed * dt, dz / d * speed * dt); r.face += angDiff(r.face, Math.atan2(dx, dz)) * Math.min(1, dt * 6); } }
      else if (d < 70) { // graze & amble around where it was left
        if (r.tx === null) { r.wait -= dt; if (r.wait <= 0) { const a = Math.random() * PI * 2, rr = 0.6 + Math.random() * 1.6; r.tx = r.m.x + Math.cos(a) * rr; r.tz = r.m.z + Math.sin(a) * rr; } }
        else { const dx = r.tx - r.x, dz = r.tz - r.z, dd = Math.hypot(dx, dz); if (dd < 0.2) { r.tx = null; r.wait = 4 + Math.random() * 7; } else { speed = 0.7; mv(r, dx / dd * speed * dt, dz / dd * speed * dt); r.face += angDiff(r.face, Math.atan2(dx, dz)) * Math.min(1, dt * 3); } } }
      r.col.x = r.x; r.col.z = r.z;
      if (r.m.sp === 'horse' && !P.ride) { /* v18.35 you can't walk through a standing horse: along its whole length */ const fx = Math.sin(r.face), fz = Math.cos(r.face), ax = r.x - fx * 0.95, az = r.z - fz * 0.95, L = 1.9, t = clamp(((P.x - ax) * fx + (P.z - az) * fz), 0, L), qx = ax + fx * t, qz = az + fz * t, dx = P.x - qx, dz = P.z - qz, dd = Math.hypot(dx, dz), rr = 0.42 + 0.38; if (dd < rr && dd > 1e-3) { P.x = qx + dx / dd * rr; P.z = qz + dz / dd * rr; } }
    }
    r.y = W.heightAt(r.x, r.z); r.sp = lerp(r.sp, speed, Math.min(1, dt * 8)); const gs = Rd.gaitStep(r, sp, r.sp, dt); r.ph += gs.rate * dt; r.gait = gs.name; // v17.0 speed ranges
    r.bob = r === P.ride ? Math.abs(Math.sin(r.ph * 2)) * 0.035 * clamp(r.sp / 4, 0, 1) : 0;
    const vis = Math.hypot(r.x - P.x, r.z - P.z) < 90; r.vis = vis; if (!vis) continue;
    animAnimal(r.rig, { speed: r.sp, phase: r.ph, gw: gs.gw, ampK: gs.amp, graze: r.sp < 0.05 && r !== P.ride && !r.called && Math.sin(t * 0.25 + r.seed) > 0.1, seed: r.seed, headYaw: 0 }, t);
    r.rig.update(m4trs(r.M, r.x, r.y, r.z, r.face));
  }
  // NPCs that ride their own animal
  const ENT = Game.ENT;
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n.d.mount) continue; let q = Rd.npcM.get(id);
    if (!q) { const sp = MT[n.d.mount] || MT.donkey; q = { sp: n.d.mount, rig: new Rig(AB[n.d.mount]), mesh: Game.animalMesh(n.d.mount, 'plain', n.d.mountX || { saddle: sp.saddle, pack: n.d.mount === 'donkey' && n.d.pack ? n.d.pack : undefined }), M: m4(), ph: 0 }; Rd.npcM.set(id, q); n.seatY = sp.seatY - HIP * (n.scale || 1); }
    if (!n.vis || !n.near) continue; const spd = n.aspd || 0, gq = Rd.gaitStep(q, MT[q.sp] || MT.donkey, spd, dt); q.ph += gq.rate * dt; n.mph = q.ph;
    animAnimal(q.rig, { speed: spd, phase: q.ph, gw: gq.gw, ampK: gq.amp, graze: spd < 0.05 && Math.sin(t * 0.3 + n.x) > 0.3, seed: 1 }, t);
    q.rig.update(m4trs(q.M, n.x, n.y - n.seatY, n.z, n.face)); }
  for (const [id] of Rd.npcM) if (!ENT.npcs[id]) Rd.npcM.delete(id);
};
function mv(r, dx, dz) { const W = Game.W(), q = { x: r.x, z: r.z }; r.col.on = false; W.move(q, dx, dz, MT[r.m.sp].r * 0.8); r.col.on = true; r.x = q.x; r.z = q.z; }
// rider's root transform (seat on the mount's back, rocking with the gait)
Rd.riderMatrix = function (M) {
  const P = Game.P, r = P.ride, sp = Rd.spec(r.m), W = Game.W(), gy = W.heightAt(r.x, r.z);
  return m4trs(M, r.x + Math.sin(r.face) * sp.seatZ, gy + sp.seatY - HIP + (r.bob || 0), r.z + Math.cos(r.face) * sp.seatZ, r.face);
};
Rd.skinned = function (list) {
  const CAM = Game.CAM;
  for (const r of Rd.list) { if (!r.vis) continue; const d = Math.hypot(r.x - CAM.x, r.z - CAM.z); if (d > 80 || d < 0.7) continue; const sk = r.sk || (r.sk = { mesh: r.mesh, bones: r.rig.bones, bs: [0, 0, 0, 2] }); sk.outline = d < 40; sk.bs[0] = r.x; sk.bs[1] = r.y + 1; sk.bs[2] = r.z; list.push(sk); }
  for (const [id, q] of Rd.npcM) { const n = Game.ENT.npcs[id]; if (!n || !n.vis || !n.near) continue; const d = Math.hypot(n.x - CAM.x, n.z - CAM.z); if (d > 80) continue; const sk = q.sk || (q.sk = { mesh: q.mesh, bones: q.rig.bones, bs: [0, 0, 0, 2] }); sk.outline = d < 40; sk.bs[0] = n.x; sk.bs[1] = n.y; sk.bs[2] = n.z; list.push(sk); }
};
Rd.save = function () { const P = Game.P; for (const r of Rd.list) { r.m.x = r.x; r.m.z = r.z; r.m.face = r.face; } if (P.ride) { P.ride.m.x = P.x; P.ride.m.z = P.z; } };
})(window.G);
