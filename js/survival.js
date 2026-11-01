/* 약속의 길 — survival gauges: 배고픔 (hunger) and 체온 (warmth).
   Hunger falls with time and effort and is refilled by eating. Warmth falls at night, in rain and wind, high up and in
   water, and comes back by day, by a fire, under a roof and in a wool cloak. Low gauges slow the hero, slow stamina
   recovery and finally sap health — but never below a floor, so nobody dies of it (this is a family game).
   The gauges only run once the episode has unlocked them (Game.feat('surv') / Game.feat('warm')).
   Episode hooks: EP.calmSurv(S) -> true pauses both gauges (cutscenes, dreams, boss fights). */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp;
const Sv = G.Surv = { mul: 1, regen: 1, shiver: 0, cold: 0, heat: 0, src: '', warnT: {} };
// how much of the hunger gauge each food fills
const FOOD = Sv.FOOD = { fig: 14, milk: 12, cheese: 26, bread: 32, stew: 48, olive: 5, cucumber: 10, onion: 6, roast: 42, roastfish: 32, herb: 3, honey: 20, lentil: 0, barley: 0, wheat: 0, meal: 0 };
Sv.food = k => { const it = Game.ITEMS[k]; if (!it || it.cat === 'key' || it.cat === 'seed') return 0; if (FOOD[k] !== undefined) return FOOD[k]; return it.food || (it.cat === 'food' ? Math.round((it.stam || 24) * 0.45) : 0); };
const st = S => S.surv || (S.surv = { food: 90, warm: 100 });
Sv.get = () => { const S = Game.S(); return S ? st(S) : { food: 100, warm: 100 }; };
Sv.fed = function (k, v) { const S = Game.S(); if (!S || !v) return; const s = st(S); s.food = clamp(s.food + v, 0, 100); if (s.food > 40) Sv.warnT.food = 0; };
// tap the hunger gauge: eat the snack that fits best (fills the most without wasting much)
Sv.quickEat = function () {
  const S = Game.S(); if (!S) return; const s = st(S), need = 100 - s.food;
  const list = Object.keys(S.inv).filter(k => S.inv[k] > 0 && Sv.food(k) > 0).map(k => [k, Sv.food(k)]);
  if (!list.length) { G.UI.toast('먹을 것이 없어요 · 열매를 따거나 모닥불에서 빵과 고기를 만들어요'); return; }
  if (need < 4) { G.UI.toast('아직 배가 불러요'); return; }
  list.sort((a, b) => { const fa = a[1] <= need + 6, fb = b[1] <= need + 6; if (fa !== fb) return fa ? -1 : 1; return fa ? b[1] - a[1] : a[1] - b[1]; });
  Game.eat(list[0][0]);
};
// insulation from what the hero wears
Sv.insul = function (S) { let k = 0; if (S.tools && S.tools.cloak) k += 0.45; const H = S.hero; if (H && H.armor && G.Combat && G.Combat.GEAR[H.armor]) k += G.Combat.GEAR[H.armor].warm || 0.15; return Math.min(0.7, k); };
// heat sources around a point: fires (stations incl. built campfires), shelters (beds, tents, houses), episode extras
Sv.cover = 0; Sv.coverSrc = '';
Sv.coverTick = function () { // how well something overhead shelters the hero (0 none … 1 full)
  const W = Game.W(), P = Game.P; if (!W) { Sv.cover = 0; return; }
  let c = 0, src = '';
  if (W.roofAt(P.x, P.z, P.y)) { c = 1; src = '지붕 아래'; }
  else { for (const k of W.canopies || []) { const d = Math.hypot(P.x - k.x, P.z - k.z); if (d < k.r * 0.8 && P.y + 1.6 < k.y1 && P.y + 1.6 > k.y0 - 6) { c = Math.max(c, 0.7); src = '나무 아래'; } }
    if (W.ray(P.x, P.y + 1.7, P.z, P.x, P.y + 9, P.z) < 0.98) { c = 1; src = '지붕 아래'; } }
  Sv.cover = c; Sv.coverSrc = src;
};
Sv.heatAt = function (x, z) {
  const EP = Game.EP(), S = Game.S(); let heat = 0, roof = 0, src = '';
  for (const s of EP.stations || []) { if (s.on && !s.on(S, Game)) continue; const d = Math.hypot(s.x - x, s.z - z);
    if (s.type === 'fire' && d < 5.5) { const k = 1 - d / 5.5; if (k * 46 > heat) { heat = k * 46; src = '모닥불'; } }
    if (s.type === 'bed' && d < (s.shelter || 4)) { roof = Math.max(roof, 1 - d / ((s.shelter || 4) * 1.3)); if (!src) src = '지붕 아래'; } }
  if (G.Build) { const b = G.Build.shelterAt(x, z); if (b > roof) { roof = b; if (!src) src = '지붕 아래'; } }
  if (EP.shelterAt) { const e = EP.shelterAt(x, z, S); if (e > roof) { roof = e; if (!src) src = '지붕 아래'; } }
  // v18.9 anything overhead keeps the rain off the hero: a roofed building, a tent, a tree crown, an overhang (Sv.cover, refreshed 5×/s from climate.js)
  const Pp = Game.P; if (Sv.cover > roof && Math.hypot(x - Pp.x, z - Pp.z) < 1.5) { roof = Sv.cover; if (!src) src = Sv.coverSrc; }
  return { heat, roof, src };
};
let tip = 0;
Sv.update = function (dt, S) {
  Sv.mul = 1; Sv.regen = 1; const P = Game.P, EP = Game.EP(), H = S.hero, s = st(S);
  const surv = Game.feat('surv'), warm = Game.feat('warm');
  if (!surv && !warm) { Sv.shiver = 0; return; }
  const calm = (EP.calmSurv && EP.calmSurv(S)) || Game.cineOn || Game.mode !== 'play';
  const hrs = G.UI.modal() || calm ? 0 : dt / 22 * (EP.timeScale || 1);
  // ---- hunger: ~7 per game hour at rest, more when running, working or fighting, less when riding
  if (surv && hrs) { let rate = 6.2; if (P.ride) rate *= 0.75; else if (P.sprint && P.spd > 3) rate *= 2.1; else if (P.act) rate *= 1.5; else if (P.spd > 0.5) rate *= 1.15; if (G.Combat && G.Combat.inCombat) rate *= 1.35; if (P.swim) rate *= 1.6; if (P.resting) rate *= 0.7; rate *= EP.hungerMul || 1;
    s.food = clamp(s.food - rate * hrs, 0, 100); }
  // ---- warmth
  if (warm) {
    const env = Game.env || { night: 0, cloud: 0.3 }, Wx = G.Weather, arid = EP.aridAt ? EP.aridAt(P.x, P.z) : 0.3, W = Game.W();
    let cold = env.night * (8 + arid * 11) + (Wx ? Wx.chill() * 0.85 : 0) + clamp((P.y - 8) / 20, 0, 1) * 6;
    const wl = W.water ? W.water.level : -99, gh = W.heightAt(P.x, P.z); if (P.swim) cold += 26; else if (gh < wl) cold += 7;
    let heat = env.night < 0.35 && !(Wx && Wx.rainy()) ? 9 * (1 - env.night) * (1 - (env.cloud || 0) * 0.5) : 0;
    const hs = Sv.heatAt(P.x, P.z); heat += hs.heat + hs.roof * 14; cold *= (1 - hs.roof * 0.8) * (1 - Sv.insul(S)); if (P.ride) heat += 1.5;
    Sv.cold = cold; Sv.heat = heat; Sv.src = hs.heat > 4 ? hs.src : hs.roof > 0.3 ? hs.src : '';
    if (hrs) s.warm = clamp(s.warm + (heat - cold) * hrs, 0, 100);
  } else s.warm = 100;
  // ---- effects
  const f = surv ? s.food : 100, w = warm ? s.warm : 100;
  if (f < 30) Sv.regen *= 0.6; if (f < 10) Sv.mul *= 0.84;
  if (w < 40) Sv.regen *= 0.7; if (w < 15) Sv.mul *= 0.82;
  Sv.shiver += ((w < 32 && !P.act ? clamp((32 - w) / 22, 0.25, 1) : 0) - Sv.shiver) * Math.min(1, dt * 3);
  if (H && hrs && (f < 3 || w < 6)) { const floor = H.hpMax * (f < 3 && w < 6 ? 0.2 : 0.32); if (H.hp > floor) { H.hp = Math.max(floor, H.hp - (f < 3 ? 1.6 : 0) * dt - (w < 6 ? 2 : 0) * dt); if (G.Combat) G.Combat.hpDirty = 1; } }
  // ---- gentle reminders (never during story moments)
  tip -= dt; if (tip <= 0 && !G.UI.busy() && !calm) { tip = 4;
    const now = S.day * 24 + S.time;
    const warn = (k, m, gap) => { if ((Sv.warnT[k] || 0) > now) return false; Sv.warnT[k] = now + gap; G.UI.toast(m); return true; };
    if (surv && f < 8) warn('food0', '배가 너무 고파 힘이 없어요… 무엇이든 먹어야 해요', 2);
    else if (surv && f < 28) warn('food', '배가 고파요 · 왼쪽 위 빵 표시를 누르면 바로 먹어요', 5);
    else if (warm && w < 12) warn('warm0', '몸이 꽁꽁 얼었어요! 모닥불이나 장막을 찾으세요', 1.5);
    else if (warm && w < 35 && Sv.cold > Sv.heat) warn('warm', G.Weather && G.Weather.rainy() ? '비에 젖어 몸이 차가워져요 · 지붕 아래로 피하세요' : '몸이 차가워져요 · 모닥불 곁에서 몸을 녹이세요', 4);
  }
  const fr = document.getElementById('frost'); if (fr) { const o = warm ? clamp((38 - w) / 38, 0, 1) * 0.85 : 0; if (Math.abs((+fr.dataset.o || 0) - o) > 0.02) { fr.dataset.o = o; fr.style.opacity = o; } }
};
// overnight: you wake up hungrier; a bed or a roof keeps you warm
Sv.onDay = function (S) {
  const s = st(S), P = Game.P;
  if (Game.feat('surv')) s.food = Math.max(4, s.food - 14);
  if (Game.feat('warm')) { const hs = Sv.heatAt(P.x, P.z); s.warm = hs.roof > 0.2 || hs.heat > 5 ? 100 : Math.max(s.warm, 60); }
};
// warm wool cloak (Gen 28:20 "입을 옷") — a craftable garment that halves the cold
Game.TOOLS.cloak = '털겉옷';
Game.RECIPES.push({ id: 'cloak', n: '털겉옷', tool: 'cloak', in: { cloth: 1, wool: 4, thread: 1 }, d: '두툼한 양털 겉옷 · 추위를 절반으로 줄여요' });
})(window.G);
