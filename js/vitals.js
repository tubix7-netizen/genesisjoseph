/* 약속의 길 — vitals (RDR2-style cores): 체력 · 기력 and what wears them down.
   · 기력 (stamina) has a "core": how full the stomach is sets how far stamina can refill (a hungry hero tires early and
     never gets his full breath back); eating refills the core and gives an instant burst. Hard work costs stamina:
     sprinting, swimming, climbing, every swing of an axe or hoe, carrying a load on the run.
   · 체력 (health) regenerates slowly out of danger, faster when fed and warm, not at all when starving.
     Falls hurt: a drop of more than ~3.5 m costs health, more the higher it is. Animals hurt (combat.js).
   · At 0 health the hero is 빈사 (down): he collapses, the world greys out, and after a moment he wakes at the last
     safe place (checkpoint), weaker and hungrier — never a game over.
   · Crouching (앉기) makes him slow and quiet: animals hear footsteps by speed and ground, not a crouched step.
   Checkpoints are recorded every story step, every sleep, and every 15 s while the hero is standing somewhere safe. */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp, lerp = G.lerp;
const V = G.Vitals = { downT: 0, noise: 0, grey: 0 };
const $ = id => document.getElementById(id);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const hero = () => { const S = Game.S(); return S && S.hero; };

// ------------------------------------------------------------------ the stamina core
V.stamCap = function () { // stamina refills up to here; the stomach decides
  const H = hero(), mx = (H && H.stamMax) || 100; if (!G.Surv || !Game.feat('surv')) return mx;
  const f = G.Surv.get().food; return mx * clamp(0.38 + 0.62 * Math.min(1, f / 70), 0.38, 1);
};
V.spend = function (n) { const P = Game.P; P.stam = Math.max(0, P.stam - n); P.stamT = 0; if (P.stam <= 0 && !P.exhausted) { P.exhausted = true; P.sprint = false; G.UI.toast('숨이 차요… 잠시 쉬어요'); } };

// ------------------------------------------------------------------ checkpoints
// v16.9 hunters (wolves, lions, bears…) near a point: a checkpoint is never taken next to one, and you never wake beside one
const hunters = (x, z, R) => G.Combat ? G.Combat.wild().filter(a => a.st !== 'dead' && a.st !== 'gone' && (a.d.beh === 'hunt' || a.d.beh === 'charge') && Math.hypot(a.x - x, a.z - z) < R) : [];
function safeSpot(x, z) { const W = Game.W(), h = hunters(x, z, 40); if (!h.length) return [x, z];
  let ax = 0, az = 0; for (const a of h) { ax += a.x; az += a.z; } ax /= h.length; az /= h.length; const base = Math.atan2(x - ax, z - az), wl = W.water ? W.water.level : -99;
  for (let k = 0; k < 14; k++) { const ang = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.45, d = 46 + (k > 7 ? 14 : 0), tx = x + Math.sin(ang) * d, tz = z + Math.cos(ang) * d;
    if (Math.abs(tx) > W.half - 6 || Math.abs(tz) > W.half - 6 || W.heightAt(tx, tz) < wl + 0.2 || (W.slopeAt && W.slopeAt(tx, tz) > 0.5)) continue;
    const q = { x: tx, z: tz }; W.collide(q, 0.6, W.heightAt(tx, tz)); if (Math.hypot(q.x - tx, q.z - tz) > 0.3) continue; if (hunters(tx, tz, 32).length) continue;
    const land = Game.EP().landOf ? Game.EP().landOf(Game.S()) : null; if ((land === 'canaan' && tx < 120) || (land === 'egypt' && tx > 110)) continue; return [tx, tz]; }
  return [x, z]; }
V.mark = function (why) { const S = Game.S(), P = Game.P; if (!S || Game.mode !== 'play' || P.swim || !P.grounded) return; if (why === 'auto' && hunters(P.x, P.z, 30).length) return; S.ckpt = { x: P.x, z: P.z, face: P.face, step: S.step, why: why || '' }; };
function safeHere() { const P = Game.P, S = Game.S(), H = hero();
  return P.grounded && !P.swim && !P.climb && !P.downed && !Game.cineOn && !(G.Combat && G.Combat.inCombat) && (!H || H.hp > H.hpMax * 0.45) && !(S.q && (S.q.inPit || S.q.bound || S.q.chain)); }

// ------------------------------------------------------------------ falls
let wasGround = true;
/* a fall is measured from the highest point of a real airborne stretch; teleports and story warps reset it (P.airTop) */
function falls(P) {
  if (Game.cineOn || P.climb || P.ride || P.swim || P.downed) { P.airTop = P.y; wasGround = true; return; }
  if (!P.grounded) P.airTop = Math.max(P.airTop === undefined ? P.y : P.airTop, P.y);
  else { if (!wasGround) { const drop = (P.airTop === undefined ? P.y : P.airTop) - P.y;
      if (drop > 3.2) { const H = hero(); if (H) { const dmg = Math.round(Math.pow(drop - 3.2, 1.35) * 7 + 4); V.hurt(dmg, '높은 곳에서 떨어졌어요');
        P.vx *= 0.2; P.vz *= 0.2; P.landT = 0.55; Game.CAM.shake = Math.min(1.2, 0.4 + drop * 0.06); } } }
    P.airTop = P.y; }
  wasGround = P.grounded; if (P.landT > 0) P.landT -= 1 / 60;
}
V.hurt = function (dmg, why) {
  const H = hero(), P = Game.P; if (!H || P.downed) return; H.hp = Math.max(0, H.hp - dmg); if (G.Combat) G.Combat.lastHurt = G.Combat.tAll || 0;
  P.tint = [1.6, 0.6, 0.55]; P.tintT = 0.3; sfx('hurt'); Game.haptic && Game.haptic('hurt');
  G.UI.dmg && G.UI.dmg(P.x, P.y + 2.1, P.z, dmg, 'me'); if (why && H.hp > 0) G.UI.toast(why); G.UI.hud();
  if (H.hp <= 0) V.down(why);
};

// ------------------------------------------------------------------ 빈사 · collapse and wake at the last safe place
V.down = function (why) {
  const P = Game.P, S = Game.S(); if (P.downed) return; P.downed = true; V.downT = 0; P.sprint = false; P.act = null; P.vx = P.vz = 0;
  if (G.Fish && G.Fish.cancel) G.Fish.cancel(); if (G.Combat) { G.Combat.cancelFish && G.Combat.cancelFish(); G.Combat.busy = true; }
  P.emote = null; sfx('thud'); Game.haptic && Game.haptic('thud');
  G.UI.toast('요셉이 쓰러졌어요… 눈앞이 흐려져요');
};
function wake() {
  const P = Game.P, S = Game.S(), H = hero();
  G.UI.fade(() => {
    const c = S.ckpt || { x: P.x, z: P.z, face: P.face }, sp = safeSpot(c.x, c.z); Game.teleport(sp[0], sp[1], c.face); P.downed = false; P.vy = 0; if (G.Lock) G.Lock.reset && G.Lock.reset();
    if (H) H.hp = Math.round(H.hpMax * 0.5); P.stam = 40; P.exhausted = false;
    if (G.Surv && Game.feat('surv')) { const s = G.Surv.get(); s.food = Math.max(5, s.food - 12); }
    S.time += 2; if (G.Combat) { for (const a of G.Combat.wild()) if (a.st !== 'dead' && a.st !== 'gone') { const h = a.spawn || a.home; a.angry = false; a.alert = 0; a.hp = a.hpMax; a.st = 'wander'; a.tx = h[0]; a.tz = h[1]; a.t = 14; a.home = [h[0], h[1]]; } } // v16.9 the beasts lose interest and go back where they came from
    G.UI.toast('정신을 차려 보니 아까 쉬던 곳이에요 · 몸이 무겁고 배가 고파요'); G.UI.hud();
  }, () => { if (G.Combat) G.Combat.busy = false; V.grey = 0; });
}
// the engine's old faint (teleport to a bed) becomes the same collapse-and-wake
if (G.Combat) G.Combat.faint = () => V.down();

// ------------------------------------------------------------------ crouch / stealth
V.crouch = function (on) { const P = Game.P; if (P.ride || P.swim || P.climb || Game.cineOn) on = false; P.crouch = on === undefined ? !P.crouch : !!on; if (P.crouch) P.sprint = false;
  const b = $('btnCrouch'); if (b) b.classList.toggle('on', !!P.crouch); };
/* footstep noise radius (m): how far away an animal can hear the hero this moment */
V.noiseNow = function () {
  const P = Game.P, W = Game.W(); if (!W) return 0; if (P.ride) return 26; const sp = P.spd || 0;
  if (sp < 0.3) return P.act ? 6 : 1.5; const surf = W.surfAt ? W.surfAt(P.x, P.z) : 'sand';
  const sm = { stone: 1.25, gravel: 1.3, wood: 1.2, grass: 0.8, sand: 0.9, mud: 1, water: 1.5 }[surf] || 1;
  let n = (P.crouch ? 1.2 + sp * 0.6 : 4 + sp * 2.6) * sm; if (P.sprint && sp > 4) n *= 1.4; if (!P.grounded) n += 4; if (P.landT > 0) n += 8;
  return n;
};

// ------------------------------------------------------------------ per frame (called after the player update)
let ckT = 0, tipT = 0;
V.update = function (dt, S) {
  const P = Game.P, H = S.hero; if (!H) return;
  falls(P);
  // stamina: hard work costs breath; the core caps the refill
  const cap = V.stamCap(); V.cap = cap;
  if (!P.ride && !P.downed) {
    if (P.swim && P.spd > 0.4) V.spend(7 * dt);
    if (P.carry && P.spd > 2.5) V.spend(5 * dt);
    if (P.act && P.act !== 'fish' && P.act !== 'cast' && P.act !== 'eat' && P.act !== 'drink') { P.workT = (P.workT || 0) + dt; if (P.workT > 0.5) { P.workT = 0; V.spend(2.2); } }
    if (P.stam > cap) P.stam = Math.max(cap, P.stam - 6 * dt); // the core shrank (got hungry): breath ebbs down to it
    if (P.swim && P.stam <= 0) { H.hp = Math.max(0, H.hp - 5 * dt); G.Combat && (G.Combat.hpDirty = 1); if (H.hp <= 0) V.down('물에서 힘이 다했어요'); }
  }
  // health core: regen depends on food and warmth (combat.js gives 1.2/s out of danger; scale it here)
  if (G.Surv && Game.feat('surv') && !G.Combat.inCombat) { const f = G.Surv.get().food, w = Game.feat('warm') ? G.Surv.get().warm : 100;
    const k = (f > 40 ? 1 : f > 15 ? 0.5 : 0) * (w > 30 ? 1 : 0.4); if (k < 1 && H.hp < H.hpMax && (G.Combat.lastHurt || 0) + 6 < (G.Combat.tAll || 0)) H.hp = Math.max(Math.min(H.hp, H.hpMax * 0.3), H.hp - dt * 0.8 * (1 - k)); } // hunger wears health down, but never past 30% — it never kills
  // crouch speed & noise
  if (P.crouch && (P.ride || P.swim || P.climb)) V.crouch(false);
  V.noise = lerp(V.noise, V.noiseNow(), Math.min(1, dt * 6));
  // collapsed: grey the world, then wake
  if (P.downed) { V.downT += dt; V.grey = Math.min(1, V.downT / 1.6); P.vx = P.vz = 0; if (V.downT > 2.6 && !V.waking) { V.waking = true; wake(); setTimeout(() => { V.waking = false; }, 1500); } }
  const gr = $('greyOut'); if (gr) { const o = P.downed ? V.grey * 0.85 : H.hp < H.hpMax * 0.25 ? (1 - H.hp / (H.hpMax * 0.25)) * 0.35 : 0; if (Math.abs((+gr.dataset.o || 0) - o) > 0.01) { gr.dataset.o = o; gr.style.opacity = o; } }
  // checkpoints
  ckT += dt; if (ckT > 15) { ckT = 0; if (safeHere()) V.mark('auto'); }
  if (S.step !== V.lastStep) { V.lastStep = S.step; setTimeout(() => { if (safeHere()) V.mark('step'); }, 1200); }
  // hints, once each
  tipT -= dt; if (tipT <= 0 && !G.UI.busy()) { tipT = 3;
    if (Game.feat('surv') && cap < ((H.stamMax || 100) * 0.7) && !S.flags.tipCore) { S.flags.tipCore = 1; G.UI.toast('배가 고파 숨이 금방 차요 · 먹으면 기력이 끝까지 차올라요'); } }
};
V.reset = function () { const P = Game.P; P.airTop = undefined; P.downed = false; P.crouch = false; P.climb = null; V.downT = 0; V.grey = 0; wasGround = true; const b = $('btnCrouch'); if (b) b.classList.remove('on'); };
})(window.G);

// v15 gauges ring the minimap (heart = health, lightning = stamina, eye = mind); the floating stamina ring is retired
(function (G) {
  const Game = G.Game, $ = id => document.getElementById(id); let last = '';
  G.Vitals.hud = function () { const S = Game.S(), P = Game.P; if (!S || !S.hero) return; const H = S.hero, mx = H.stamMax || 100, mm = H.mindMax || 100;
    const h = Math.max(0, Math.min(1, H.hp / H.hpMax)), st = Math.max(0, Math.min(1, P.stam / mx)), mi = Math.max(0, Math.min(1, (H.mind === undefined ? mm : H.mind) / mm)),
      key = h.toFixed(3) + st.toFixed(3) + mi.toFixed(3) + (P.exhausted ? 1 : 0); if (key === last) return; last = key;
    const a = $('coreHp'), b = $('coreSt'), c = $('coreMind'); if (!a) return; const set = (el, v) => el.querySelector('.carc').setAttribute('stroke-dashoffset', (100 * (1 - v)).toFixed(1));
    set(a, h); set(b, st); if (c) set(c, mi);
    b.querySelector('.carc').setAttribute('stroke', P.exhausted ? '#e0704f' : '#f0c64a'); a.classList.toggle('low', h < 0.25); b.classList.toggle('low', !!P.exhausted); if (c) c.classList.toggle('spent', mi < 0.15);
    const r = $('stam'); if (r) r.style.display = 'none'; };
  // 정신력 (the eye): one more gauge for skills. Nothing spends it yet — the skills are still to be designed — but the plumbing is here:
  //   G.Vitals.mind()            → current value        G.Vitals.mindUse(n) → true and spends n when there is enough
  //   G.Vitals.mindGain(n)       → refill a little      (it also comes back by itself, faster at rest and in prayer)
  const V = G.Vitals;
  V.mind = () => { const H = Game.S() && Game.S().hero; return H ? (H.mind === undefined ? (H.mindMax || 100) : H.mind) : 0; };
  V.mindUse = n => { const H = Game.S() && Game.S().hero; if (!H || V.mind() < n) return false; H.mind = V.mind() - n; H.mindT = 0; last = ''; return true; };
  V.mindGain = n => { const H = Game.S() && Game.S().hero; if (!H) return; H.mind = Math.min(H.mindMax || 100, V.mind() + n); last = ''; };
  const upd = V.update; V.update = function (dt, S) { upd.call(V, dt, S); const H = S && S.hero, P = Game.P; if (!H) return;
    if (H.mindMax === undefined) H.mindMax = 100; if (H.mind === undefined) H.mind = H.mindMax; if (P.downed) return;
    H.mindT = (H.mindT || 0) + dt; if (H.mindT < 2) return; // after spending, a short pause before it refills
    const calm = P.resting || P.act === 'pray' || (P.emote && P.emote.k && /pray|prostrate/.test(P.emote.k)); const rate = calm ? 1.5 : (P.spd || 0) < 0.3 ? 0.12 : 0.05; /* v16.7 slow on its own: food, prayer, the fireside and sleep fill it */ if (H.mind < H.mindMax) H.mind = Math.min(H.mindMax, H.mind + rate * dt); };
})(window.G);
