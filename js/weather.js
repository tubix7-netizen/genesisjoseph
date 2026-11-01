/* 약속의 길 — weather. Kinds: clear / cloudy / rain / storm / wind / dust (sandstorm) / fog. The current kind changes every
   few game hours by the local climate (desert or green land); its parameters are blended smoothly and drive the sky,
   sunlight, fog, rain streaks, blowing sand, grass sway, ambience, the warmth gauge and NPC behaviour. Rain waters fields.
   Episode hooks: EP.climate(S, x, z) -> {kind: weight}, EP.calmWeather(S) -> true to hold clear skies (cutscenes, dreams). */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp, lerp = G.lerp;
const K = {
  clear: { cloud: 0.22, rain: 0, wind: 0.8, fog: 0, dust: 0, dim: 0, n: '맑음', ic: 'sun' },
  cloudy: { cloud: 0.72, rain: 0, wind: 1.2, fog: 0.05, dust: 0, dim: 0.28, n: '흐림', ic: 'cloud' },
  rain: { cloud: 0.95, rain: 0.55, wind: 1.5, fog: 0.35, dust: 0, dim: 0.5, n: '비', ic: 'rain' },
  storm: { cloud: 1, rain: 1, wind: 2.4, fog: 0.55, dust: 0, dim: 0.66, n: '폭풍우', ic: 'storm', thunder: true },
  wind: { cloud: 0.35, rain: 0, wind: 2.5, fog: 0.12, dust: 0.22, dim: 0.06, n: '바람', ic: 'wind' },
  dust: { cloud: 0.55, rain: 0, wind: 2.9, fog: 0.85, dust: 1, dim: 0.34, n: '모래바람', ic: 'dust' },
  fog: { cloud: 0.5, rain: 0, wind: 0.35, fog: 1, dust: 0, dim: 0.22, n: '안개', ic: 'fog' },
};
const PARAMS = ['cloud', 'rain', 'wind', 'fog', 'dust', 'dim'];
const Wx = G.Weather = { K, cur: { cloud: 0.22, rain: 0, wind: 0.8, fog: 0, dust: 0, dim: 0 }, flash: 0, thT: 8, dustT: 0 };
const st = S => S.wx || (S.wx = { k: S.weather === 'rain' ? 'rain' : 'clear', left: 3 });
Wx.kind = S => { const k = st(S).k; return K[k] ? k : 'clear'; };
Wx.name = S => K[Wx.kind(S)].n;
Wx.icon = S => K[Wx.kind(S)].ic;
Wx.rainy = () => Wx.cur.rain > 0.3;
// climate: weights per kind for where the hero stands and the hour
Wx.weights = function (S) {
  const EP = Game.EP(), P = Game.P, hr = S.time % 24;
  if (EP.climate) { const w = EP.climate(S, P.x, P.z, hr); if (w) return w; }
  const arid = EP.aridAt ? EP.aridAt(P.x, P.z) : 0.3, morning = hr > 4 && hr < 9;
  const lush = { clear: 0.46, cloudy: 0.22, rain: 0.14 * (EP.rain === undefined ? 1 : EP.rain / 0.1), storm: 0.035, wind: 0.07, fog: morning ? 0.12 : 0.01 };
  const desert = { clear: 0.58, cloudy: 0.1, rain: 0.03, storm: 0.005, wind: 0.18, dust: 0.11, fog: 0 };
  const out = {}; for (const k in K) out[k] = lerp(lush[k] || 0, desert[k] || 0, clamp(arid, 0, 1)); if (EP.noRain) { out.rain = 0; out.storm = 0; } return out;
};
Wx.pick = function (S) { const w = Wx.weights(S); let tot = 0; for (const k in w) tot += w[k]; let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'clear'; };
Wx.set = function (k, hours) { const S = Game.S(); if (!S || !K[k]) return; const w = st(S); w.k = k; w.left = hours || 3; S.weather = k === 'rain' || k === 'storm' ? 'rain' : 'clear'; };
Wx.onDay = function (S) { const w = st(S); w.k = Wx.pick(S); w.left = 2 + Math.random() * 4; S.weather = w.k === 'rain' || w.k === 'storm' ? 'rain' : 'clear'; };
const SAY = { rain: '비가 내리기 시작해요', storm: '폭풍우가 몰려와요! 장막이나 집으로 피하세요', wind: '바람이 세게 불어요', dust: '모래바람이 불어와요! 앞이 잘 보이지 않아요', fog: '안개가 짙게 깔렸어요', cloudy: '', clear: '' };
Wx.update = function (dt, S) {
  const EP = Game.EP(), w = st(S); const calm = (EP.calmWeather && EP.calmWeather(S)) || Game.cineOn;
  const hrs = dt / 22 * (EP.timeScale || 1);
  if (!G.UI.modal()) w.left -= hrs;
  if (w.left <= 0) { const prev = w.k; w.k = Wx.pick(S); w.left = 1.5 + Math.random() * 5; S.weather = w.k === 'rain' || w.k === 'storm' ? 'rain' : 'clear';
    if (w.k !== prev && SAY[w.k] && !calm && Game.mode === 'play') G.UI.toast(SAY[w.k]); }
  const tgt = calm ? K.clear : K[Wx.kind(S)], k = Math.min(1, dt * 0.22);
  for (const p of PARAMS) Wx.cur[p] += (tgt[p] - Wx.cur[p]) * k;
  // thunder & lightning
  if (tgt.thunder && Wx.cur.rain > 0.6) { Wx.thT -= dt; if (Wx.thT <= 0) { Wx.thT = 7 + Math.random() * 16; Wx.flash = 1; const d = 0.25 + Math.random() * 2.2; setTimeout(() => Game.sfx && Game.sfx('thunder', { vol: clamp(1.2 - d * 0.3, 0.4, 1) }), d * 1000); } }
  Wx.flash = Math.max(0, Wx.flash - dt * (Wx.flash > 0.6 ? 9 : 3));
  // rain waters planted fields
  if (Wx.cur.rain > 0.4) { w.wet = (w.wet || 0) + hrs; if (w.wet > 0.4) { w.wet = 0; let any = false; for (const id in S.plots) { const p = S.plots[id]; if (p.s === 2 && !p.w) { p.w = 1; any = true; } } if (any) Game.ENT.plotsDirty = true; } }
  // blowing sand
  if (Wx.cur.dust > 0.15 && Game.mode === 'play') { Wx.dustT -= dt; if (Wx.dustT <= 0) { Wx.dustT = 0.05; const P = Game.P; for (let i = 0; i < 3; i++) { const a = Math.random() * 6.28, r = 2 + Math.random() * 14;
    G.FX.burst(P.x + Math.cos(a) * r - 6, P.y + 0.3 + Math.random() * 2.5, P.z + Math.sin(a) * r, 1, { c: [0.82, 0.68, 0.48], sp: 0.4, up: 0.2, g: -0.2, life: 1.6, size: 0.35 + Math.random() * 0.4, a: 0.35 * Wx.cur.dust, drag: 0, h: 0, spread: 0.1 }); }
    for (const p of G.FX.list.slice(-6)) { p.vx = 7 * Wx.cur.dust; p.vz = 1.2; } } }
};
/* sky & light: overcast greys the sky and dims the sun, fog/dust thicken and tint the air */
Wx.apply = function (env, S) {
  const c = Wx.cur, nt = 1 - env.night * 0.85, mix3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], clamp(k, 0, 1)));
  env.cloud = Math.max(env.cloud, c.cloud);
  env.sunCol = env.sunCol.map(v => v * (1 - c.dim * 0.72)); env.skyAmb = env.skyAmb.map(v => v * (1 - c.dim * 0.12)); env.gndAmb = env.gndAmb.map(v => v * (1 - c.dim * 0.1));
  env.skyTop = mix3(env.skyTop, [0.44 * nt, 0.48 * nt, 0.54 * nt], c.dim * 0.7); env.skyHor = mix3(env.skyHor, [0.64 * nt, 0.66 * nt, 0.68 * nt], c.dim * 0.6);
  env.cloudCol = mix3(env.cloudCol, [0.6 * nt, 0.62 * nt, 0.66 * nt], c.dim * 0.55);
  env.fogDen *= 1 + c.fog * 3.2 + c.dust * 5 + c.rain * 0.8;
  if (c.fog > 0.01) env.fogCol = mix3(env.fogCol, [0.74 * nt, 0.76 * nt, 0.78 * nt], c.fog * 0.55);
  if (c.dust > 0.01) { const d = [0.8 * nt, 0.64 * nt, 0.44 * nt]; env.fogCol = mix3(env.fogCol, d, c.dust * 0.75); env.skyHor = mix3(env.skyHor, d, c.dust * 0.75); env.skyTop = mix3(env.skyTop, [0.72 * nt, 0.6 * nt, 0.46 * nt], c.dust * 0.6); env.sunCol = mix3(env.sunCol, [env.sunCol[0], env.sunCol[1] * 0.85, env.sunCol[2] * 0.6], c.dust); }
  env.wind = Math.max(env.wind || 1, c.wind);
  env.flash = Wx.flash * clamp(c.rain, 0, 1); if (env.flash > 0) { env.skyAmb = env.skyAmb.map(v => v + env.flash * 0.7); env.gndAmb = env.gndAmb.map(v => v + env.flash * 0.3); }
};
/* how much the weather cools the body (warmth gauge) */
Wx.chill = () => Wx.cur.rain * 16 + Math.max(0, Wx.cur.wind - 1.2) * 7 + Wx.cur.dust * 5 + Wx.cur.fog * 4;
})(window.G);
