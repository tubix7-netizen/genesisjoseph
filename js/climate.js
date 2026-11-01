/* 약속의 길 — 날씨와 몸 (v16.6)
   · 젖음: rain soaks you in a few seconds (unless you are under a roof or hold up a 잎사귀 우산), water soaks you faster.
     Dry off slowly in the open, fast by a fire.
   · 추위: once soaked (or a cold desert night with no fire), health and stamina wear down a little — never below a floor, nobody
     dies of it. A hot dish (stew, porridge, anything off the spit) keeps you warm for a while.
   · 더위: Egyptian midday sun in the open shrinks the stamina you can hold (you tire quickly). Shade, the umbrella, water, or
     taking off the outer garment (옷장 「겉옷 벗기」 / light linen) eases it.
   · 수레·탈것은 물에 못 들어가요.
   API: G.Climate.state() · G.Climate.warm(seconds) */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), clamp = G.clamp;
const C = G.Climate = { wet: 0, cold: false, hot: 0, warmT: 0, umb: false, lastDry: null, msgT: {} };
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
C.state = () => ({ wet: C.wet, cold: C.cold, hot: C.hot, warmT: C.warmT, umb: C.umb });
C.warm = s => { C.warmT = Math.max(C.warmT, s); C.cold = false; };
C.cool = s => { C.coolT = Math.max(C.coolT || 0, s); C.hot *= 0.4; };
const say = (k, t, every) => { const now = performance.now(); if ((C.msgT[k] || 0) > now) return; C.msgT[k] = now + (every || 20000); G.UI.toast(t); };
const LIGHT = /Shaved|wLinen|Slave|Servant|Fled/; // light clothes: less heat
C.update = function (dt) { const S = Game.S(), P = Game.P, W = Game.W(); if (!S || !W || Game.mode !== 'play') return;
  const calm = Game.cineOn || (G.Cine && G.Cine.on) || G.UI.modal() || (Game.EP().calmSurv && Game.EP().calmSurv(S)); const H = S.hero; if (!H) return;
  // carts and mounts stay out of the water
  const wl = W.water ? W.water.level : -99, gh = W.heightAt(P.x, P.z);
  if ((P.ride || (S.q && S.q.riding)) && gh < wl + 0.15) { if (C.lastDry) { P.x = C.lastDry[0]; P.z = C.lastDry[1]; P.vx = P.vz = 0; } say('cart', P.ride ? '탈것은 물에 들어갈 수 없어요' : '수레는 물에 들어갈 수 없어요', 4000); }
  else if (gh > wl + 0.3) C.lastDry = [P.x, P.z];
  if (calm) return;
  const Sv = G.Surv, hs = Sv ? Sv.heatAt(P.x, P.z) : { heat: 0, roof: 0 }, roof = hs.roof > 0.3, fire = hs.heat > 6, rainy = G.Weather && G.Weather.rainy(), inWater = P.swim || gh < wl;
  C.umb = !!(C.umbOpen && Game.tool('umbrella') && !P.swim && !P.climb);
  // wet
  if (inWater) C.wet = Math.min(1, C.wet + dt / 3); else if (rainy && !roof && !C.umb) C.wet = Math.min(1, C.wet + dt / 7);
  else C.wet = Math.max(0, C.wet - dt / (fire ? 6 : roof ? 25 : 45));
  if (rainy && !roof && !C.umb && C.wet > 0.2 && Game.tool('umbrella')) say('umb', '비가 와요 · 「우산」을 펴면 젖지 않아요');
  // cold
  C.warmT = Math.max(0, C.warmT - dt); const night = (Game.env && Game.env.night) || 0, arid = Game.EP().aridAt ? Game.EP().aridAt(P.x, P.z) : 0;
  const coldNow = C.warmT <= 0 && !fire && (C.wet > 0.55 || (night > 0.7 && arid > 0.6 && !roof));
  if (coldNow && !C.cold) say('cold', C.wet > 0.55 ? '몸이 젖어 추워요 · 체력과 기력이 조금씩 줄어요 (모닥불 · 따뜻한 음식)' : '광야의 밤이 추워요 · 모닥불 곁이나 지붕 아래로 가요');
  C.cold = coldNow;
  if (C.cold) { H.hp = Math.max(Math.min(H.hp, H.hpMax * 0.25), H.hp - dt * 0.45); P.stam = Math.max(Math.min(P.stam, (H.stamMax || 100) * 0.3), P.stam - dt * 2.2); G.Combat && (G.Combat.hpDirty = 1);
    C.shT = (C.shT || 0) - dt; if (C.shT <= 0) { C.shT = 2.5; P.emote = P.emote || null; G.FX.burst(P.x, P.y + 1.6, P.z, 2, { c: [0.85, 0.9, 1], sp: 0.2, up: 0.3, size: 0.08, a: 0.5, g: -0.2, life: 0.9 }); } }
  // heat: Egyptian midday sun in the open
  const h = S.time % 24, egypt = P.x < 112, sunny = !rainy && (!G.Weather || G.Weather.cur.cloud < 0.6);
  let hot = egypt && sunny && h > 10.5 && h < 16.5 && !roof && !inWater ? 1 : 0;
  C.coolT = Math.max(0, (C.coolT || 0) - dt); // v16.9 a cool dish or drink keeps the heat off for a while
  if (hot) { if (C.coolT > 0) hot *= 0.25; if (LIGHT.test(S.outfit || '')) hot *= 0.45; if (C.umb) hot *= 0.5; if (C.wet > 0.3) hot *= 0.6; }
  C.hot += (hot - C.hot) * Math.min(1, dt * 0.5); if (C.hot > 0.5) say('hot', '해가 뜨거워요 · 쉽게 지쳐요 (그늘 · 우산 · 겉옷 벗기)', 60000);
  // HUD chip
  const chip = $('climChip'); if (chip) { const parts = []; if (C.warmT > 0) parts.push(`<b class="w">따뜻함 ${Math.ceil(C.warmT / 60)}분</b>`); if (C.coolT > 0) parts.push(`<b class="r">시원함 ${Math.ceil(C.coolT / 60)}분</b>`); if (C.cold) parts.push('<b class="c">추위</b>'); else if (C.wet > 0.15) parts.push(`<b class="r">젖음 ${Math.round(C.wet * 100)}%</b>`); if (C.hot > 0.35) parts.push('<b class="h">더위</b>'); if (C.umb) parts.push('<b class="u">우산</b>');
    const html = parts.join(''); if (chip.dataset.h !== html) { chip.dataset.h = html; chip.innerHTML = html; chip.hidden = !html; } } };
// heat shrinks the stamina you can hold
if (G.Vitals) { const cap0 = G.Vitals.stamCap; G.Vitals.stamCap = function () { const c = cap0.apply(this, arguments); return c * (1 - 0.38 * C.hot); }; }
// hot dishes warm you
const eat0 = Game.eat; Game.eat = function (k) { const r = eat0.apply(this, arguments); if (G.Cuisine) return r; /* v16.9 cuisine.js: warm and cool dishes */ const M = G.Hearth && G.Hearth.METHOD; if ((M && (M[k] === 'stew' || M[k] === 'grill')) || /roast|stew|porridge|skewer/i.test(k)) { C.warm(240); G.UI.toast('따뜻한 음식 · 4분 동안 추위를 덜 타요'); } return r; };
// the umbrella: a hotbar toggle once you have made one
C.toggle = () => { C.umbOpen = !C.umbOpen; sfx('rustle'); G.UI.toast(C.umbOpen ? '잎사귀 우산을 폈어요' : '우산을 접었어요'); };
let umbMesh = null, umbM = null;
C.dyn = function (list) { if (!C.umb) return; const P = Game.P; if (!P.rig || !P.rig.world) return; if (!umbMesh) { const g = new G.GB(77); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g.box(0.36, 0.02, 0.7, { at: [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], ry: -a + Math.PI / 2, rx: 0.28, c: [0x4f7a32, 0x5f8a3a, 0x6c9a42][i % 3] }); } g.cyl(0.012, 0.012, 0.9, 4, { at: [0, -0.45, 0], c: 0x7a5a3a }); umbMesh = G.R.mesh(g); umbM = G.m4(); }
  const hm = P.rig.world[G.HBI.head]; G.m4trs(umbM, hm[12] + Math.sin(P.face) * 0.08, hm[13] + 0.62, hm[14] + Math.cos(P.face) * 0.08, P.face); list.push({ mesh: umbMesh, m: umbM, outline: true }); };
// a little red flash and shake when hurt
if (G.Vitals) { const hurt0 = G.Vitals.hurt; G.Vitals.hurt = function (dmg) { const r = hurt0.apply(this, arguments); const el = $('hurtFx'); if (el && dmg >= 3) { el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); } if (dmg >= 8) Game.CAM.shake = Math.max(Game.CAM.shake || 0, Math.min(1, 0.3 + dmg * 0.02)); return r; }; }
const fx = document.createElement('div'); fx.id = 'hurtFx'; document.body.appendChild(fx);
const chip = document.createElement('div'); chip.id = 'climChip'; chip.hidden = true; const tr = document.querySelector('#hud .tr'); if (tr) tr.appendChild(chip);
})(window.G);

// v16.6 물 마시기: at any well (no jar needed), or from the water you carry in a jar — breath (기력) comes back
(function (G) {
  const Game = G.Game, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
  const drink = (gain, why) => { const P = Game.P, H = Game.S().hero, cap = (G.Vitals && G.Vitals.cap) || (H.stamMax || 140); P.stam = Math.min(cap, P.stam + gain); P.exhausted = false; if (G.Acts) G.Acts.play('drink', { quiet: true }); sfx('water', { vol: 0.6 }); G.UI.toast(why); G.UI.hud(); };
  Game.CTX.push(function (S) { const P = Game.P; if (P.ride || P.swim || P.act || Game.cineOn) return null; const EP = Game.EP();
    for (const st of EP.stations || []) { if (st.type !== 'well' || (st.on && !st.on(S, Game))) continue; const d = Math.hypot(st.x - P.x, st.z - P.z); if (d > (st.r || 2.6)) continue;
      const day = S.day + Math.floor(S.time / 6); if (S.flags.wellDrink === day) continue;
      return [{ d: d - 0.9, label: '우물물 마시기', x: st.x, z: st.z, y: 1.2, key: 'drinkWell:' + st.id, well: st.rim || 1.75, use: () => { S.flags.wellDrink = day; drink(60, '시원한 우물물 · 기력이 차올라요'); } }]; }
    return null; });
  setTimeout(() => { const EP = G.EP && G.EP.joseph; if (EP) (EP.extra = EP.extra || []).push({ id: 'drink', label: S => `물 마시기 (${S.water})`, ic: 'drop', on: S => S.water > 0 && (Game.tool('jar') || Game.tool('bigjar')),
    click: S => { if (G.UI.busy() || Game.P.act) return; S.water--; drink(35, `항아리 물을 마셨어요 · 기력 +35 (남은 물 ${S.water})`); } }); }, 0); // after the episode scripts have loaded
})(window.G);
