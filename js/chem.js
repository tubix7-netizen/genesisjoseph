/* 약속의 길 — 화학 엔진 (v17.9, 엔진·연출 업그레이드 문서의 P5; 야생의 숨결의 「물리는 움직임 규칙, 화학은 상태 규칙」).
   Weather, warmth, cooking and loose objects used to run side by side. G.Chem gives them a few shared STATE rules on a grid round the hero
   (64 × 64 cells of 1 m; every cell has fuel, heat, wet and fire):
     1 HEAT SPREADS  a burning cell warms its eight neighbours, much more downwind (the wind of the weather), and wind-blown sparks start new
                     fires 2–4 m on. A cell that gets hot enough and has dry fuel catches fire.
     2 WATER WINS    rain wets the ground; wet cells do not catch, and a wet cell puts its fire out. Water cells never burn. Sun and fire dry it again.
     3 STATE CHANGES THINGS  a burning cell burns its fuel away (grass lasts ~16 s) and is left as ash (no fuel). Fire burns the hero a little (never to death),
                     scares hunting beasts away, and wet clothes make the cold bite twice as hard (the hero's wetness is dried by sun, a hearth or a torch).
   The player's way in: a 횃불 (torch: branch + 2 reeds), lit at any campfire, then 「불 붙이기」 on the ground in front of him.
   SAFETY: nothing burns within 3 m of a station (camps, hearths, wells…), a special (story spot) or a building, so no story place can burn down; at
   most 120 cells burn at once; a cell burns at most ~40 s; the hero loses at most a few hit points and never goes below a fifth of his health from fire;
   fire never blocks the way. Off: ?chem=0. API: G.Chem.ignite(x, z) · G.Chem.stats · G.Chem.at(x, z). */
'use strict';
(function (G) {
const Game = G.Game, FX = G.FX, N = 64, CELLS = N * N, MAXFIRE = 120, clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const Ch = G.Chem = { on: !/[?&]chem=0\b/.test(location.search), ox: 0, oz: 0, ready: false, torchT: 0, wetHero: 0, stats: { burning: 0, maxBurning: 0, ignitions: 0, burntTotal: 0, sparks: 0, scared: 0 } };
const fuel = new Float32Array(CELLS), heat = new Float32Array(CELLS), wet = new Float32Array(CELLS), fire = new Float32Array(CELLS), age = new Float32Array(CELLS), ash = new Uint8Array(CELLS);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const idx = (cx, cz) => cz * N + cx;

// ------------------------------------------------------------------ what can burn
function protectedAt(x, z) { // nothing burns near camps, story spots, or buildings
  const EP = Game.EP(), W = Game.W(); if (!EP || !W) return true;
  for (const st of EP.stations || []) if (Math.hypot(st.x - x, st.z - z) < 3) return true;
  for (const sp of Game.ENT.specials || []) if (Math.hypot(sp.x - x, sp.z - z) < 3) return true;
  for (const c of W.near(x, z)) { if (c.t === 'b') { const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca; if (Math.abs(lx) < c.hw + 2 && Math.abs(lz) < c.hd + 2) return true; } }
  return false;
}
function fuelAt(x, z) {
  const EP = Game.EP(), W = Game.W(); if (!W || protectedAt(x, z)) return 0;
  if (EP.waterDist && EP.waterDist(x, z) < 1.2) return 0; const arid = EP.aridAt ? EP.aridAt(x, z) : 0.3;
  if (arid > 0.85) return 0.12; // bare sand
  const h = W.heightAt(x, z), s = Math.max(Math.abs(W.heightAt(x + 1, z) - h), Math.abs(W.heightAt(x, z + 1) - h)); // steep rock does not burn
  return (0.35 + 0.65 * (1 - arid)) * (s > 0.9 ? 0.3 : 1);
}
// the grid follows the hero: when he leaves the middle third it shifts (what leaves the window is forgotten, fires there just go out)
function recenter(force) {
  const P = Game.P, cx = Math.floor(P.x) - N / 2, cz = Math.floor(P.z) - N / 2; if (!force && Math.abs(cx - Ch.ox) < 12 && Math.abs(cz - Ch.oz) < 12) return;
  const dx = cx - Ch.ox, dz = cz - Ch.oz, A = [fuel, heat, wet, fire, age], B = A.map(a => new Float32Array(CELLS)), ashB = new Uint8Array(CELLS);
  if (!force) for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const sx = x + dx, sz = z + dz; if (sx < 0 || sz < 0 || sx >= N || sz >= N) continue; const s = idx(sx, sz), d = idx(x, z); for (let k = 0; k < A.length; k++) B[k][d] = A[k][s]; ashB[d] = ash[s]; }
  for (let k = 0; k < A.length; k++) A[k].set(B[k]); ash.set(ashB); Ch.ox = cx; Ch.oz = cz;
  for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const sx = x + dx, sz = z + dz, old = !force && sx >= 0 && sz >= 0 && sx < N && sz < N; if (!old) { const d = idx(x, z); fuel[d] = fuelAt(cx + x + 0.5, cz + z + 0.5); heat[d] = wet[d] = fire[d] = age[d] = 0; ash[d] = 0; } }
}
const cellOf = (x, z) => { const cx = Math.floor(x) - Ch.ox, cz = Math.floor(z) - Ch.oz; return cx < 0 || cz < 0 || cx >= N || cz >= N ? -1 : idx(cx, cz); };
Ch.at = (x, z) => { const i = cellOf(x, z); return i < 0 ? null : { fuel: fuel[i], heat: heat[i], wet: wet[i], fire: fire[i], ash: !!ash[i] }; };
Ch.ignite = function (x, z, r) { // set the ground on fire (a small patch), unless it is protected / wet / has no fuel
  if (!Ch.on || !Ch.ready) return 0; let n = 0, rr = r || 1; for (let dz = -rr; dz <= rr; dz++) for (let dx = -rr; dx <= rr; dx++) { const i = cellOf(x + dx, z + dz); if (i < 0 || fire[i] > 0 || fuel[i] < 0.05 || wet[i] > 0.45) continue; if (Ch.stats.burning >= MAXFIRE) break; fire[i] = 0.3; age[i] = 0; n++; Ch.stats.burning++; Ch.stats.ignitions++; }
  return n;
};

// ------------------------------------------------------------------ the rules (10 times a second)
let acc = 0, spT = 0, sndT = 0, wetT = 0, hurtT = 0;
function step(dt) {
  const W = Game.W(), Wx = G.Weather && G.Weather.cur || { rain: 0, wind: 0.8 }, wind = Wx.wind || 0.8, wvx = wind * 0.9, wvz = 0.35, wl = Math.hypot(wvx, wvz) || 1, wx = wvx / wl, wz = wvz / wl, ws = clamp(wind / 2, 0, 1.4);
  const rain = Wx.rain || 0; let burning = 0, newly = [];
  // wet: rain wets, sun and fire dry
  wetT += dt; if (wetT >= 0.5) { const k = wetT; wetT = 0; const gain = rain * 0.05 * k, dry = (0.004 + (Game.hour() > 7 && Game.hour() < 18 ? 0.004 : 0)) * k; for (let i = 0; i < CELLS; i++) { if (rain > 0.05) wet[i] = Math.min(1, wet[i] + gain); else if (wet[i] > 0) wet[i] = Math.max(0, wet[i] - dry); } }
  for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) { const i = idx(cx, cz), f = fire[i]; if (f <= 0) continue;
    burning++; age[i] += dt;
    const drown = (wet[i] > 0.5 ? 2.5 : 0) + Math.max(0, rain - 0.25) * 1.1; // water wins: the fire grows 2.5/s, rain 0.9 takes ~2.9/s away (out in ~3 s), wet ground 7.5/s (at once)
    fire[i] = Math.min(1, f + dt * (2.5 - drown * 4)); if (fire[i] <= 0) { fire[i] = 0; Ch.stats.burning--; continue; }
    fuel[i] -= dt * 0.06 * f; heat[i] = Math.min(1.5, heat[i] + dt * 0.5);
    if (fuel[i] <= 0 || age[i] > 40) { fuel[i] = 0; fire[i] = 0; ash[i] = 1; Ch.stats.burning--; Ch.stats.burntTotal++; continue; }
    // heat spreads to the eight neighbours, more downwind
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dz) continue; const nx = cx + dx, nz = cz + dz; if (nx < 0 || nz < 0 || nx >= N || nz >= N) continue; const j = idx(nx, nz); if (fire[j] > 0 || fuel[j] <= 0.05) continue;
      const l = Math.hypot(dx, dz), al = (dx * wx + dz * wz) / l, w = (1 + 1.8 * ws * al) / l; heat[j] += Math.max(0, w) * f * dt * 0.28 * (1 - Math.min(0.9, rain * 0.9)); }
    // wind-blown sparks
    if (ws > 0.35 && Math.random() < dt * 0.22 * ws) { const d = 2 + Math.random() * 2.5 * ws, nx = cx + Math.round(wx * d + (Math.random() - 0.5) * 2), nz = cz + Math.round(wz * d + (Math.random() - 0.5) * 2); if (nx >= 0 && nz >= 0 && nx < N && nz < N) { heat[idx(nx, nz)] += 0.45; Ch.stats.sparks++; } }
  }
  // catch fire / cool down
  if (burning < MAXFIRE) for (let i = 0; i < CELLS && burning + newly.length < MAXFIRE; i++) { if (heat[i] > 0 && fire[i] <= 0) { if (heat[i] > 0.55 + wet[i] * 1.2 && fuel[i] > 0.05 && !ash[i]) newly.push(i); else heat[i] = Math.max(0, heat[i] - dt * 0.7); } }
  for (const i of newly) { fire[i] = 0.3; age[i] = 0; heat[i] = 0; burning++; Ch.stats.burning++; Ch.stats.ignitions++; }
  Ch.stats.burning = burning; if (burning > Ch.stats.maxBurning) Ch.stats.maxBurning = burning;
}

// ------------------------------------------------------------------ what the fire does to the world
function effects(dt) {
  const P = Game.P, W = Game.W(); if (!W) return; const Ec = Math.floor(P.x) - Ch.ox, Ez = Math.floor(P.z) - Ch.oz;
  // look and sound: flames and smoke on burning cells near the hero (a budget of ~300 particles/s)
  let near = 0, emitted = 0; const budget = Math.min(1, 300 * dt / Math.max(1, Ch.stats.burning));
  for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) { const i = idx(cx, cz), f = fire[i]; if (f <= 0) continue; const x = Ch.ox + cx + 0.5, z = Ch.oz + cz + 0.5, d = Math.hypot(x - P.x, z - P.z); if (d > 45) continue; near++;
    if (Math.random() < budget * (d < 20 ? 1 : 0.4)) { const y = W.heightAt(x, z); FX.burst(x, y + 0.15, z, 1, { c: Math.random() < 0.5 ? [1, 0.55, 0.15] : [1, 0.82, 0.3], sp: 0.3, up: 1.7, g: -1.2, life: 0.55, size: 0.24 * (0.6 + f), spread: 0.8, h: 0.4 }); emitted++;
      if (Math.random() < 0.18) FX.burst(x, y + 0.6, z, 1, { c: [0.42, 0.4, 0.38], sp: 0.2, up: 1.3, g: -0.4, life: 2.4, size: 0.4, a: 0.45, spread: 0.7, h: 0.3 }); } }
  sndT -= dt; if (near && sndT <= 0) { sndT = 1.3; sfx('fire', { vol: Math.min(0.6, 0.12 + near / 60) }); }
  // the hero in the fire: a little burn, never lethal
  const i = Ec >= 0 && Ez >= 0 && Ec < N && Ez < N ? idx(Ec, Ez) : -1; hurtT -= dt;
  if (i >= 0 && fire[i] > 0.5 && hurtT <= 0 && !P.downed && !Game.cineOn) { hurtT = 0.7; const H = Game.S().hero; if (H && H.hp > H.hpMax * 0.2 && G.Vitals && G.Vitals.hurt) G.Vitals.hurt(Math.min(3, Math.max(0, H.hp - H.hpMax * 0.2)), '불에 데었어요'); }
}

// a hunting beast is scared (and combat.js turns it to flee) by a lit torch within 5 m of the hero, or by fire within two cells of it
Ch.scared = function (a) {
  if (!Ch.on || !Ch.ready) return false; const P = Game.P; if (Ch.torchT > 0 && Math.hypot(a.x - P.x, a.z - P.z) < 5) { Ch.stats.scared++; return true; }
  const bx = Math.floor(a.x) - Ch.ox, bz = Math.floor(a.z) - Ch.oz; for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) { const x = bx + dx, z = bz + dz; if (x >= 0 && z >= 0 && x < N && z < N && fire[idx(x, z)] > 0.3) { Ch.stats.scared++; return true; } }
  return false;
};

// ------------------------------------------------------------------ burnt ground (v18.8): every ash cell near the hero is drawn as a flat, dark patch on the ground
let ashMesh = null, ashD = null, ashKey = '', ashT = 0;
const ID16 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
function ashRebuild() {
  const W = Game.W(), P = Game.P; if (!W || !G.GB) return; const cells = [];
  for (let cz = 0; cz < N; cz++) for (let cx = 0; cx < N; cx++) { if (!ash[idx(cx, cz)]) continue; const x = Ch.ox + cx + 0.5, z = Ch.oz + cz + 0.5, d = Math.hypot(x - P.x, z - P.z); if (d < 70) cells.push([d, x, z]); }
  cells.sort((a, b) => a[0] - b[0]); const key = cells.length + ':' + (cells.length ? cells[0][1] + ',' + cells[cells.length - 1][2] : ''); if (key === ashKey) return; ashKey = key;
  if (!cells.length) { ashD = null; return; }
  const g = new G.GB(3); for (const c of cells.slice(0, 500)) { const x = c[1], z = c[2], y = Math.max(W.heightAt(x - 0.5, z - 0.5), W.heightAt(x + 0.5, z - 0.5), W.heightAt(x - 0.5, z + 0.5), W.heightAt(x + 0.5, z + 0.5)) + 0.03;
    g.sph(0.78, 7, 3, { at: [x + Math.sin(x * 12.9 + z * 4.1) * 0.12, y, z + Math.cos(z * 9.7 + x * 3.3) * 0.12], s: [1, 0.07, 0.85 + 0.25 * Math.abs(Math.sin(x * 5.3 + z * 2.1))], ry: x * 7.7 + z * 3.1, c: (Math.floor(x * 3 + z * 5)) % 3 ? 0x2a2622 : 0x38322c, flat: true }); }
  if (!ashMesh) ashMesh = G.R.mesh(g); else G.R.updateMesh(ashMesh, g); ashMesh.bs = [0, 0, 0, 1e6]; if (!ashD) ashD = { m: ID16, shadow: false, mesh: ashMesh }; ashD.mesh = ashMesh;
}
Ch.dyn = function (list) { if (Ch.on && ashD && ashD.mesh) list.push(ashD); };

// ------------------------------------------------------------------ the hero's clothes (wet → colder) and the torch
function hero(dt) {
  const P = Game.P, Wx = G.Weather && G.Weather.cur || { rain: 0 }, Sv = G.Surv; let roof = 0, heatN = 0; if (Sv && Sv.heatAt) { const h = Sv.heatAt(P.x, P.z); roof = h.roof || 0; heatN = h.heat || 0; }
  const was = Ch.wetHero; let w = was;
  if (P.swim) w = 1; else if ((Wx.rain || 0) > 0.15 && roof < 0.2) w += (Wx.rain || 0) * 0.02 * dt * 5; else w -= (0.012 + (heatN > 5 ? 0.09 : 0) + (Ch.torchT > 0 ? 0.04 : 0) + (Game.hour() > 8 && Game.hour() < 17 ? 0.01 : 0)) * dt;
  Ch.wetHero = clamp(w, 0, 1); if (was < 0.5 && Ch.wetHero >= 0.5) G.UI.toast('옷이 젖었어요 · 추위가 더 매서워요'); else if (was >= 0.5 && Ch.wetHero < 0.12) G.UI.toast('옷이 말랐어요');
  if (Ch.torchT > 0) { Ch.torchT -= dt * (1 + ((Wx.rain || 0) > 0.4 ? 1.5 : 0)); if (Ch.torchT <= 0) { Ch.torchT = 0; G.UI.toast('횃불이 꺼졌어요'); }
    const W = Game.W(), m = P.rig && P.rig.world && G.HBI ? P.rig.world[G.HBI.handR] : null, x = m ? m[12] : P.x, y = m ? m[13] + 0.5 : P.y + 1.5, z = m ? m[14] : P.z;
    if (Math.random() < dt * 40) FX.burst(x, y, z, 1, { c: Math.random() < 0.5 ? [1, 0.55, 0.15] : [1, 0.85, 0.35], sp: 0.2, up: 1.4, g: -1.2, life: 0.45, size: 0.2, spread: 0.08, h: 0.3 }); }
}

// ------------------------------------------------------------------ the torch as a thing
Game.TOOLS.torch = '횃불'; Game.TOOL_PROP.torch = 'torch';
Game.RECIPES.push({ id: 'torch', n: '횃불', tool: 'torch', in: { branch: 1, reed: 2 }, d: '횃불 · 화덕에서 불을 붙여 풀에 불을 옮길 수 있어요 (바람과 마른 풀을 조심!)' });
Game.CTX.push(function (S, g) {
  if (!Ch.on || !Ch.ready || Game.hand() !== 'torch') return null; const P = Game.P, out = [];
  if (Ch.torchT <= 0) { for (const st of (Game.EP().stations || [])) { if (st.type !== 'fire') continue; if (st.on && !st.on(S, Game)) continue; const d = Math.hypot(st.x - P.x, st.z - P.z); if (d < (st.r || 2.4) + 0.6) out.push({ d: d - 0.4, label: '횃불에 불 붙이기', x: st.x, z: st.z, y: 1.2, key: 'chem:light', reach: 0.8, use: () => { Ch.torchT = 150; sfx('fire', { vol: 0.7 }); G.UI.toast('횃불이 타올라요 · 약 2분 동안'); } }); } }
  else { const px = P.x + Math.sin(P.face) * 1.5, pz = P.z + Math.cos(P.face) * 1.5; out.push({ d: 1.1, label: '불 붙이기', x: px, z: pz, y: 0.4, key: 'chem:ignite', reach: 0.8, use: () => { const n = Ch.ignite(px, pz, 1); sfx('fire', { vol: 0.8 }); G.UI.toast(n ? '풀에 불이 붙었어요 · 바람과 불길을 조심하세요!' : '여기는 불이 붙지 않아요 (젖었거나 탈 것이 없어요)'); } }); }
  return out;
});

// ------------------------------------------------------------------ hooks
Ch.update = function (dt) {
  if (!Ch.on || Game.mode !== 'play' || !Game.W()) return; if (!Ch.ready) { recenter(true); Ch.ready = true; } else recenter(false); hero(dt);
  acc += dt; if (acc >= 0.1) { const s = Math.min(acc, 0.3); acc = 0; step(s); effects(s); }
  ashT += dt; if (ashT >= 1) { ashT = 0; ashRebuild(); }
};
// wet clothes make the cold bite harder
if (G.Weather && G.Weather.chill) { const c0 = G.Weather.chill; G.Weather.chill = () => { const c = c0(); return Ch.on ? c * (1 + Ch.wetHero) + Ch.wetHero * 3 : c; }; }
})(window.G);
