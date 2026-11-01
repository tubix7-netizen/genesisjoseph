/* 약속의 길 — the wild: foraging finds, their models, new foods, and the sneaking noise meter.
   · New gathering nodes an episode can scatter (W.nodes): 들풀 약초 덤불, 바위 틈 석청 (bees sting unless you creep up
     crouched), 자고새 둥지 (eggs; the hen bursts out), 풀 열매 덤불 (capers), 쥐엄나무 (carob pods, Lk 15:16),
     대추야자 (dates). Trees block like the others; bushes regrow after a few days.
   · Foods: 새알, 풀 열매, 쥐엄 열매, 대추야자, and the cooked dishes made at a fire (hearth.js).
   · 기척 meter: while crouching, a small ring under the hero shows how far his footsteps carry (BotW's sound meter),
     and a dot appears over any animal that has started to notice him. */
'use strict';
(function (G) {
const Game = G.Game, clamp = G.clamp, PI = Math.PI;
const Wl = G.Wilds = {};
const $ = id => document.getElementById(id);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);

// ------------------------------------------------------------------ items
Object.assign(Game.ITEMS, {
  egg: { n: '새알', cat: 'food', p: 3, ic: 'berry', c: '#efe6d2', hp: 6 }, caper: { n: '풀 열매', cat: 'food', p: 2, ic: 'berry', c: '#7a9a4a', hp: 4 },
  carob: { n: '쥐엄 열매', cat: 'food', p: 2, ic: 'stick', c: '#5a3a24', stam: 30 }, dates: { n: '대추야자', cat: 'food', p: 4, ic: 'berry', c: '#9a4a24', stam: 40, hp: 8 },
  perch: { n: '나일 농어', cat: 'fish', p: 18, ic: 'fish', c: '#b8b0a0' }, mullet: { n: '숭어', cat: 'fish', p: 8, ic: 'fish', c: '#a8b0b8' },
  // cooked at a fire (hearth.js)
  skewer: { n: '고기 꼬치', cat: 'food', p: 18, ic: 'meat', c: '#a8582a', hp: 50, stam: 60 }, grilledFish: { n: '숯불 생선', cat: 'food', p: 16, ic: 'fish', c: '#c88a40', hp: 40, stam: 55 },
  herbMix: { n: '들나물 무침', cat: 'food', p: 8, ic: 'herb', c: '#6aa04a', hp: 30, stam: 20 }, meatStew: { n: '고기 국', cat: 'food', p: 26, ic: 'oil', c: '#8a4a2a', hp: 70, stam: 90 },
  sweetCake: { n: '꿀 대추 과자', cat: 'food', p: 22, ic: 'bread', c: '#d89a3a', hp: 25, stam: 120 }, fieldPlate: { n: '들판 모둠 요리', cat: 'food', p: 20, ic: 'bread', c: '#c8a060', hp: 45, stam: 70 },
  roastEgg: { n: '구운 새알', cat: 'food', p: 6, ic: 'berry', c: '#e0c890', hp: 18, stam: 25 },
});
if (G.Surv) Object.assign(G.Surv.FOOD, { egg: 6, caper: 5, carob: 8, dates: 12, skewer: 44, grilledFish: 38, herbMix: 18, meatStew: 60, sweetCake: 30, fieldPlate: 50, roastEgg: 16, roast: 42, roastfish: 32, meat: 0, perch: 0, mullet: 0 });

// ------------------------------------------------------------------ models
const env = G.env;
env.herbBush = function (g, M, r) { for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2 + r(); g.cyl(0.012, 0.016, 0.42, 3, { m: M, at: [Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12], rz: Math.cos(a) * 0.3, rx: Math.sin(a) * 0.3, c: 0x5a7a3a });
  g.sph(0.09, 5, 4, { m: M, at: [Math.cos(a) * 0.22, 0.38 + r() * 0.08, Math.sin(a) * 0.22], s: [1.3, 0.6, 1], c: [0x6aa04a, 0x7ab058, 0x8ac06a][i % 3], flat: true }); }
  for (let i = 0; i < 4; i++) g.sph(0.035, 4, 3, { m: M, at: [(r() - 0.5) * 0.4, 0.47, (r() - 0.5) * 0.4], c: 0xe8e0f0 }); };
env.honeyRock = function (g, M, r) { env.rock(g, M, r, 0xa89c88); g.sph(0.22, 6, 4, { m: M, at: [0.15, 0.55, 0.55], s: [1.2, 0.7, 0.5], c: 0x2a1c12 });
  for (let i = 0; i < 4; i++) g.box(0.06, 0.18, 0.02, { m: M, at: [0.05 + i * 0.07, 0.5, 0.62], c: 0xe8b030 }); };
env.birdNest = function (g, M, r) { g.lathe([[0.05, 0], [0.24, 0.04], [0.28, 0.12], [0.2, 0.14]], 9, { m: M, c: 0x9a7a4a, j: 0.15 }); for (let i = 0; i < 3; i++) g.sph(0.045, 6, 4, { m: M, at: [(i - 1) * 0.07, 0.11, (i % 2) * 0.05], s: [1, 1.25, 1], c: 0xefe6d2 }); };
env.caperBush = function (g, M, r) { for (let i = 0; i < 6; i++) g.sph(0.24 + r() * 0.1, 6, 4, { m: M, at: [(r() - 0.5) * 0.6, 0.2 + r() * 0.15, (r() - 0.5) * 0.6], s: [1.2, 0.7, 1.2], c: [0x5a7a3a, 0x6a8a44][i % 2], flat: true, j: 0.1 });
  for (let i = 0; i < 8; i++) g.sph(0.04, 4, 3, { m: M, at: [(r() - 0.5) * 0.8, 0.35 + r() * 0.2, (r() - 0.5) * 0.8], c: i % 3 ? 0x9ab858 : 0xf0e8f4 }); };

// ------------------------------------------------------------------ node types
const NODE = Game.NODE;
const stung = (S, n) => { const P = Game.P; if (P.crouch && Math.random() < 0.75) return false; return Math.random() < 0.6; };
Object.assign(NODE, {
  herb: { n: '들풀 약초', env: 'herbBush', r: 0, give: { herb: 1 }, re: 2, label: '약초 캐기', anim: 'gather' },
  caper: { n: '풀 열매 덤불', env: 'caperBush', r: 0.3, give: { caper: 3 }, re: 3, label: '열매 따기', anim: 'pick' },
  honey: { n: '바위 틈 석청', env: 'honeyRock', r: 1.0, re: 6, label: '석청 따기', anim: 'pick',
    act(n) { return { label: Game.P.crouch ? '살금살금 석청 따기' : '석청 따기 (벌이 있어요)', anim: 'pick', dur: 0.9, fn: () => { const S = Game.S(), W = Game.W();
      Game.give('honey', 1); S.nodes[n.id] = S.day + 6; Game.refreshNodes(); G.FX.burst(n.x, W.heightAt(n.x, n.z) + 0.7, n.z, 16, { c: [0.25, 0.2, 0.1], sp: 1.6, up: 0.8, size: 0.06, g: 0, drag: 2, life: 1.6 });
      if (stung(S, n)) { if (G.Vitals) G.Vitals.hurt(6, '벌에 쏘였어요! 앉아서 살금살금 다가가면 벌이 덜 놀라요'); sfx('hurt', { pitch: 1.5 }); } else G.UI.toast('벌을 놀라게 하지 않고 석청을 땄어요 (신 32:13)'); } }; } },
  nest: { n: '자고새 둥지', env: 'birdNest', r: 0, re: 4, label: '둥지의 알 줍기', anim: 'gather',
    act(n) { return { label: '둥지의 알 줍기', anim: 'gather', dur: 0.7, fn: () => { const S = Game.S(); Game.give('egg', 2); S.nodes[n.id] = S.day + 4; Game.refreshNodes();
      if (G.Combat && G.Combat.WILD.partridge) { const a = G.Combat.spawn('partridge', n.x + 0.6, n.z + 0.4); a.alert = 1.4; } G.UI.toast('어미 새가 푸드득 날아올랐어요 · 알 두 개'); } }; } },
  carob: { n: '쥐엄나무', env: 'oak', r: 1.0, tree: true, fruit: 'carob' },
  date: { n: '대추야자나무', env: 'palm', r: 0.8, tree: true, fruit: 'dates' },
});
for (const k in NODE) NODE[k].key = k;

// ------------------------------------------------------------------ scattering helper for episodes
/* place nodes from a list of zones: [{ x, z, r, n, types: [[type, weight]], ok(x,z) }] — deterministic per seed */
Wl.scatter = function (W, zones, seed) {
  const r = G.rng(seed || 7); W.nodes = W.nodes || []; let id = W.nodes.length;
  for (const zn of zones) { let placed = 0, tries = 0;
    while (placed < zn.n && tries++ < zn.n * 12) { const a = r() * PI * 2, d = Math.sqrt(r()) * zn.r, x = zn.x + Math.cos(a) * d, z = zn.z + Math.sin(a) * d;
      if (zn.ok && !zn.ok(x, z)) continue; if (W.water && W.heightAt(x, z) < W.water.level + 0.15) continue; if (W.slopeAt(x, z) > 0.45) continue;
      let tot = 0; for (const t of zn.types) tot += t[1]; let q = r() * tot, type = zn.types[0][0]; for (const t of zn.types) { q -= t[1]; if (q <= 0) { type = t[0]; break; } }
      if (W.nodes.some(o => Math.hypot(o.x - x, o.z - z) < (NODE[type].tree ? 4 : 2))) continue;
      W.nodes.push({ id: 'wn' + (id++), type, x, z, y: W.heightAt(x, z), ry: r() * PI * 2, s: NODE[type].tree ? 0.85 + r() * 0.3 : 0.9 + r() * 0.25 }); placed++; } }
};

// ------------------------------------------------------------------ the 기척 meter
Wl.frame = function () {
  if (G.Vitals && G.Vitals.hud) G.Vitals.hud();
  const P = Game.P, V = G.Vitals, el = $('noiseRing'); if (!el || !V) return;
  const on = P.crouch && Game.mode === 'play' && !G.UI.busy() && !Game.cineOn;
  if (!on) { if (!el.hidden) el.hidden = true; return; }
  const s = G.R.project(P.x, P.y + 0.05, P.z, G.UI.W, G.UI.H); if (!s) return; el.hidden = false;
  const px = clamp(V.noise / 10, 0.12, 1.4); el.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-50%) scale(${(0.6 + px * 0.9).toFixed(3)})`;
  el.classList.toggle('loud', V.noise > 5);
  // who has noticed?
  let warn = 0; if (G.Combat) for (const a of G.Combat.wild()) if (a.st !== 'dead' && (a.alert || 0) > 0.3 && Math.hypot(a.x - P.x, a.z - P.z) < 40) warn = Math.max(warn, a.alert);
  el.dataset.warn = warn > 0.9 ? '2' : warn > 0.3 ? '1' : '0';
};
})(window.G);
/* small things Joseph can do and feel anywhere (v11)
   · 물 마시기: kneel at any river or pond edge and drink from the hands — breath comes back, a little.
   · 생각: on a roof, a hilltop or a riverbank he sometimes thinks aloud (once per place per day), so the world has a
     voice even when no one is talking — his father, Benjamin, the dreams, the strange new land. */
(function (G) {
  const Game = G.Game; const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
  Game.CTX.push(function (S) { const P = Game.P, W = Game.W(); if (!W || !W.water || P.ride || P.climb || P.swim || P.act || Game.cineOn) return null;
    const wl = W.water.level; if (W.heightAt(P.x, P.z) < wl - 0.1) return null; const fx = Math.sin(P.face), fz = Math.cos(P.face);
    for (const r of [0.9, 1.6]) { const wx = P.x + fx * r, wz = P.z + fz * r; if (W.heightAt(wx, wz) < wl - 0.05) return [{ d: 1.9, label: '손으로 물 떠 마시기', x: wx, z: wz, y: 0.4, key: 'drinkRiver', noMagnet: true,
      use: () => { if (G.Acts) G.Acts.play('drink', { quiet: true }); sfx('water', { vol: 0.6 }); G.FX.burst(wx, wl + 0.05, wz, 8, { c: [0.7, 0.85, 1], sp: 0.6, up: 0.8, size: 0.06 });
        const H = S.hero, mx = (H && H.stamMax) || 100; P.stam = Math.min((G.Vitals && G.Vitals.cap) || mx, P.stam + 30); P.exhausted = false; if (G.Surv && S.surv) S.surv.warm = Math.max(0, S.surv.warm - 2);
        G.UI.toast(S.flags.drankRiver ? '시원한 물을 마셨어요 · 숨이 돌아와요' : '두 손으로 물을 떠 마셨어요 · 숨이 돌아와요 (물가 어디서나 마실 수 있어요)'); S.flags.drankRiver = 1; } }]; }
    return null; });
  const THINK = {
    roof: ['여기서 보니 강이 하늘처럼 넓구나…', '아버지의 장막에서 보던 별이 여기서도 보일까.', '저 많은 집마다 저마다의 사연이 있겠지.'],
    nile: ['이 물이 애굽 사람들을 먹여 살리는구나.', '헤브론의 마른 시내만 보다가… 이렇게 큰 강이라니.', '베냐민이 이 강을 보면 뭐라고 할까.'],
    hill: ['저 멀리 길이 실처럼 이어져 있어. 형들도 이 길을 걸었을까?', '바람이 차다. 아버지가 밤에는 불을 피우라고 하셨지.', '하나님, 이 넓은 땅 어디에서든 저와 함께 하시나요?'],
    night: ['별이 쏟아질 것 같아. …열한 별이 내게 절하던 그 꿈이 생각나.', '밤 짐승 소리가 들려. 불 곁에 있어야겠다.'],
  };
  let tT = 20;
  G.Wilds.thoughts = function (dt) {
    const S = Game.S(), P = Game.P, W = Game.W(), EP = Game.EP(); if (!S || !W || Game.mode !== 'play' || Game.cineOn || G.UI.busy() || P.downed) return;
    tT -= dt; if (tT > 0) return; tT = 6; if (EP.quiet && EP.quiet(S)) return;
    const day = S.day, said = S.flags.thought || (S.flags.thought = {}), key = (k) => k + ':' + Math.round(P.x / 40) + ',' + Math.round(P.z / 40);
    const hr = S.time % 24, g = W.heightAt(P.x, P.z); let k = null;
    if (P.y > g + 2.2 && P.grounded) k = 'roof'; else if (EP.waterDist && EP.waterDist(P.x, P.z) < 4) k = 'nile'; else if (g > 16 && P.spd < 0.5) k = 'hill'; else if ((hr > 20.5 || hr < 4.5) && P.spd < 0.5) k = 'night';
    if (!k || said[key(k)] === day) return; said[key(k)] = day; if (Math.random() < 0.35) return;
    const L = THINK[k]; G.UI.toast(`요셉 · "${L[Math.floor(Math.random() * L.length)]}"`); tT = 40;
  };
})(window.G);
