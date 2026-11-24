/* 약속의 길 — v18.64 조상들의 이야기 · 따로 된 지도 (dlcep.js · dlc.js 다음, dlc_jacob.js 앞)
   야곱 편 · 아브라함 편은 요셉의 지도 위에 띄운 무대가 아니라, 저마다 자기 땅(World) · 자기 사람 · 자기 저장을 가진 「따로 된 이야기」예요.
   그래서 요셉 지도의 모닥불 · 문 · 애굽 사람 · 이름표 · 밤샘 피로 · 날씨가 이야기 속으로 따라 들어오지 않아요.
   · 땅: 걷는 곳(spec.area 네모)은 spec.floor 높이 그대로이고, 그 밖은 들판 → 낮은 언덕 → 먼 산으로 자연스럽게 이어져요(가장자리 이음매 없이).
         땅 색은 spec.ground(x, z)가 칠해요(길 · 마당 · 풀밭 · 밭). 풀 높이(풀잎)는 색의 넷째 값이에요.
   · 짓기: spec.build(B)는 예전 무대와 같은 도우미(B.box · cyl · sph · put · col · colR · g …)를 받아요. 무대 원점은 (0, 0), 높이 0이에요.
   · 사람 · 대화(spec.talk) · 손으로 하는 일(spec.ctx) · 한마디(spec.chatter) · 날씨(spec.weather) · 목표(spec.quest) · 지도의 장소(spec.places)
   · 저장: 'genesisSave_dlc_<이야기>'(칸마다 따로). 이야기 값은 S.flags.st (G.DLC.st(key)가 그것을 돌려줘요).
   API: G.DLCEP.make(spec) → L { key, spec, on(), stage(), ep } · G.DLCEP.list */
'use strict';
(function (G) {
const Game = G.Game, JEP = G.EP && G.EP.joseph; if (!Game || !JEP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const fbm = G.fbm, vnoise = G.vnoise, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = c => [((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255];
const X = G.DLCEP = { list: [], hex, mix, sm };
/* distance from a point to a polyline (for painted roads) */
X.segD = function (pts, x, z) { let best = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1), d = Math.hypot(x - ax - dx * t, z - az - dz * t); if (d < best) best = d; } return best; };

X.make = function (spec) {
  const key = spec.key, story = spec.story, id = 'dlc_' + story, AR = spec.area; /* [x0, x1, z0, z1] */
  const SIZE = spec.size || 420, BY = 0;
  let EPD = null; const on = () => !!EPD && Game.EP && Game.EP() === EPD;
  const L = { key, story, spec, on, stage: () => ({ x: 0, z: 0, y: 0 }) };
  const pop = (a, b, c) => (G.DLC && G.DLC.pop ? G.DLC.pop(a, b, c) : (G.UI.pop || G.UI.toast)(a, b, c));
  const K = { BX: 0, BZ: 0, BY, S, P, on, pop, sfx, say: (l, cb) => G.UI.say(l, cb), Ln: (n, t, e) => ({ n, t, e }), npc: q => Game.npc(q), L };
  // ---------------------------------------------------------- the land: the story's ground in the middle, fields, then hills, then far mountains
  const outD = (x, z) => { const dx = Math.max(AR[0] - x, 0, x - AR[1]), dz = Math.max(AR[2] - z, 0, z - AR[3]); return Math.hypot(dx, dz); };
  const edgeFloor = (x, z) => { const cx = clamp(x, AR[0], AR[1]), cz = clamp(z, AR[2], AR[3]); const f = spec.floor ? spec.floor(cx, cz) : 0; return f === null || f === undefined ? 0 : f; };
  function height(x, z) {
    const d = outD(x, z);
    if (d <= 0) { const f = spec.floor ? spec.floor(x, z) : 0; return f === null || f === undefined ? 0 : f; }
    const base = edgeFloor(x, z), sd = spec.seed || 7, vf = spec.valley ? clamp(spec.valley(x, z), 0, 1) : 0;
    const roll = (fbm(x * 0.021 + sd, z * 0.021 - sd, 3) - 0.45) * 2.2 * sm(0, 18, d);           /* gentle rolls in the near fields */
    const hills = sm(14, 70, d) * (5 + 17 * fbm(x * 0.011 - sd * 3, z * 0.011 + sd, 4));          /* hills behind */
    const far = sm(70, 150, d) * (10 + 34 * fbm(x * 0.006 + 40, z * 0.006 - 21, 3));               /* mountains far off */
    const ek = 1 - 0.8 * sm(SIZE / 2 - 50, SIZE / 2 - 4, Math.max(Math.abs(x), Math.abs(z))); /* the ranges fall away again before the world's edge, so a ridge line shows, not a cut-off block */
    let h = base + roll + (hills + far) * (1 - vf * 0.92);
    if (spec.outFloor) { const o = spec.outFloor(x, z, h, d); if (o !== null && o !== undefined) h = o; }
    if (h > base) h = base + (h - base) * ek;
    return h; }
  /* colours: grassland greens with dry patches; ploughed and ripe fields in the near valley; dry hills, rock on steep slopes */
  const C = Object.assign({ g1: 0x688c38, g2: 0x80a046, dry: 0xa89c60, earth: 0xa48a62, rock: 0x948a7a, hill: 0x9a965c, hill2: 0x7a8a48, far: 0x8c8e72 }, spec.colors || {});
  const CC = {}; for (const k in C) CC[k] = hex(C[k]);
  const FIELDC = [hex(0xc8b464), hex(0x8aa04c), hex(0x9a7a52), hex(0xb0b060), hex(0x7a9446), hex(0xd2be78)];
  function color(x, z, h, ny) {
    const d = outD(x, z), n1 = fbm(x * 0.05, z * 0.05, 3), n2 = vnoise(x * 0.17 + 9, z * 0.17 - 4), sd = spec.seed || 7;
    let c = mix(CC.g1, CC.g2, clamp(n1 * 1.4 - 0.2, 0, 1)), gr = 0.82;
    { const dr = sm(0.56, 0.72, fbm(x * 0.03 + 7, z * 0.03 - 3, 3)); c = mix(c, CC.dry, dr * 0.5); gr -= dr * 0.3; }
    c = mix(c, [c[0] * 0.86, c[1] * 0.9, c[2] * 0.82], n2 * 0.6);
    if (d > 0) {
      /* the near valley: a patchwork of fields with soft edges */
      const fx = Math.floor((x + 500) / 17), fz = Math.floor((z + 500) / 12), hsh = vnoise(fx * 7.3 + sd, fz * 3.1 - sd), inF = sm(0.2, 0.45, hsh) * (1 - sm(18, 34, d)) * sm(2, 6, d);
      if (inF > 0) { const fc = FIELDC[Math.floor(vnoise(fx * 1.7, fz * 2.9 + 3) * 6) % 6]; const stripe = 0.94 + 0.06 * Math.sin((x * 0.7 + z * 0.2) * 3); c = mix(c, [fc[0] * stripe, fc[1] * stripe, fc[2] * stripe], inF * 0.85); gr *= 1 - inF * 0.6; }
      const hl = sm(10, 60, d); c = mix(c, mix(CC.hill, CC.hill2, n1), hl * 0.75); gr *= 1 - hl * 0.55;
      c = mix(c, CC.far, sm(90, 180, d) * 0.6);
    }
    if (ny < 0.86) { const r = sm(0.86, 0.7, ny); c = mix(c, CC.rock, r); gr *= 1 - r; }
    if (spec.ground) { const o = spec.ground(x, z, c, gr, h); if (o) { c = [o[0], o[1], o[2]]; gr = o[3] === undefined ? gr : o[3]; } }
    return [c[0], c[1], c[2], clamp(gr, 0, 1)]; }
  // ---------------------------------------------------------- building the story's stage into the world's chunks
  let STAGE = null;
  function build(W) { const R = G.R, E = Object.assign({}, G.env || {}, JEP.envx || {});
    const gAt = (x, z) => W.gb(x, z);
    const pick = args => { for (let i = args.length - 1; i >= 0; i--) { const a = args[i]; if (a && typeof a === 'object' && a.at) return gAt(a.at[0], a.at[2]); } return gAt(0, 0); };
    const g = new Proxy({}, { get: (t, name) => (...args) => { const gb = pick(args); return gb[name](...args); } });
    let sd = spec.seed || 13; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const B = { g, W, R, X: 0, Z: 0, BY, rng, E, hAt: (x, z) => W.heightAt(x, z),
      box: (w, h, d, x, y, z, c, o) => gAt(x, z).box(w, h, d, Object.assign({ at: [x, y, z], c }, o || {})),
      cyl: (rt, rb, h, seg, x, y, z, c, o) => gAt(x, z).cyl(rt, rb, h, seg, Object.assign({ at: [x, y, z], c }, o || {})),
      sph: (r, x, y, z, c, o) => gAt(x, z).sph(r, 10, 6, Object.assign({ at: [x, y, z], c }, o || {})),
      col: (x, z, w, d, y0, y1, cam) => W.addCol({ x, z, w, d, y0: y0 === undefined ? BY - 2 : y0, y1: y1 === undefined ? BY + 5 : y1, cam: !!cam }),
      colR: (x, z, r, y1) => W.addCol({ x, z, r, y0: BY - 2, y1: y1 === undefined ? BY + 4 : y1 }),
      put: (fn, x, z, o) => { const f = E[fn]; if (!f) return false; if (LATE && NATURE.test(fn) && !(o && o.keep)) { LATE.push([fn, x, z, o]); return true; } const res = W.place(f, x, z, Object.assign({ gb: gAt(x, z), y: W.heightAt(x, z) }, o || {})); G.DLCLOG && G.DLCLOG.push([fn, x, z]);
        /* v18.85 a tree's crown is known to the world (shade from the sun, shelter from the rain, cutscene cameras keep out); a booth's leafy top keeps the rain off */
        const c = CROWN[fn], k = (o && o.s) || 1; if (c && res) W.canopies.push({ x, z, y0: res.y + c[0] * k, y1: res.y + c[2] * k, r: c[1] * k }); if (fn === 'booth' && res) W.addCover(x, z, 3.2, 2.4, (o && o.ry) || 0, res.y + 2.1); return true; },
      sea: () => null, mesh: gb => R.mesh(gb), GB: seed => new G.GB(seed) };
    /* v18.85 trees, bushes and rocks are put down after the story's tents, houses and walls stand, and not inside them (nor a crown through a roof) */
    let LATE = [], NATURE = /^(oak|olive|tamarisk|acacia|fig|datePalm|palm|terebinth|cedar|pomegranate|bush|retama|rock|outcrop|dryGrass|flowers|desertShrub|caperBush|herbBush|broom)$/; G.DLCLOG = [];
    const CROWN = { oak: [3.6, 6, 11.5], olive: [1.8, 3.5, 6], fig: [1.6, 3.6, 5.2], acacia: [3, 4.5, 6.2], tamarisk: [2, 3.2, 7], datePalm: [8, 3.5, 12.5], palm: [8, 3.5, 13], terebinth: [3, 5, 9], pomegranate: [1.4, 2.4, 4] }; /* [crown bottom, radius, top] */ W.canopies = W.canopies || [];
    const out = (spec.build && spec.build(B)) || {};
    try { scenery(B, W); } catch (e) { console.error('dlc scenery ' + key, e); }
    if (spec.deco) for (const f of spec.deco) try { f(B); } catch (e) { console.error('dlc deco ' + key, e); }
    { const L = LATE; LATE = null; for (const [fn, x, z, o] of L) { const s = (o && o.s) || 1, c = CROWN[fn]; if (W.inBuilding && (W.inBuilding(x, z, c ? 0.7 : 0.3) || (c && W.inBuilding(x, z, c[1] * s * 0.85, W.heightAt(x, z) + c[0] * s)))) { for (const q of W.near(x, z)) if (q.t === 'c' && Math.abs(q.x - x) < 0.01 && Math.abs(q.z - z) < 0.01) q.on = false; continue; } /* (a tree left out takes its trunk's collider with it: no invisible post) */ B.put(fn, x, z, o); } }
    STAGE = Object.assign({ W }, out); }
  /* outside the story's ground: groves on the near slopes, single trees and boulders on the hills, low dark blobs of wood far off (cheap) */
  function scenery(B, W) { const { rng } = B, sd = spec.seed || 7, half = SIZE / 2 - 4;
    const avoid = spec.sceneryAvoid || (() => false);
    let farG = null; const farTree = (x, z, s) => { const y = W.heightAt(x, z), gb = W.gb(x, z); gb.cyl(0.18 * s, 0.26 * s, 2.2 * s, 5, { at: [x, y + 1.1 * s, z], c: 0x5a4632 }); gb.sph(1.9 * s, 7, 5, { at: [x, y + 3.1 * s, z], s: [1, 0.78, 1], c: [0x56703a, 0x62783e, 0x4e6634][Math.floor(rng() * 3)], flat: true, j: 0.12 }); void farG; };
    const KIND = spec.trees || ['oak', 'olive', 'tamarisk', 'acacia'];
    let n = 0;
    for (let i = 0; i < 2600 && n < (spec.treeN || 420); i++) {
      const x = -half + rng() * half * 2, z = -half + rng() * half * 2, d = outD(x, z); if (d < 5 || avoid(x, z)) continue;
      const grove = fbm(x * 0.03 + sd, z * 0.03 - sd, 3); const want = d < 40 ? sm(0.48, 0.62, grove) : sm(0.55, 0.7, grove) * 0.8; if (rng() > want) continue;
      const W2 = W; if (W2.slopeAt(x, z) > 0.35) continue;
      if (d < 46) { B.put(KIND[Math.floor(rng() * KIND.length)], x, z, { s: 0.8 + rng() * 0.45, ry: rng() * 6.28 }); }
      else farTree(x, z, 0.9 + rng() * 0.7);
      n++; }
    /* bushes and stones on the near slopes */
    for (let i = 0; i < 700; i++) { const x = -half + rng() * half * 2, z = -half + rng() * half * 2, d = outD(x, z); if (d < 3 || d > 60 || avoid(x, z)) continue; if (rng() > 0.45) continue;
      const q = rng(); if (W.slopeAt(x, z) > 0.25 && q < 0.6) B.put('rock', x, z, { s: 0.7 + rng() * 1.2, ry: rng() * 6.28 }); else B.put(q < 0.5 ? 'bush' : q < 0.8 ? 'dryGrass' : 'retama', x, z, { s: 0.7 + rng() * 0.6, ry: rng() * 6.28 }); }
    for (let i = 0; i < 40; i++) { const x = -half + rng() * half * 2, z = -half + rng() * half * 2, d = outD(x, z); if (d < 26 || avoid(x, z) || W.slopeAt(x, z) < 0.08) continue; B.put('outcrop', x, z, { s: 0.8 + rng() * 0.7, ry: rng() * 6.28 }); } /* (only on the slopes, not as blocks on the flat) */
    if (spec.scenery) spec.scenery(B, W, outD); }
  // ---------------------------------------------------------- the episode
  const EPX = spec.ep || {};
  EPD = G.EP[id] = Object.assign({
    id, dlc: true, dlcKey: story, hero: spec.hero || '', timeScale: 1, noSleepAnim: false,
    spec: { size: SIZE, cell: spec.cell || 1.5, seed: spec.seed || 7, height, color, water: spec.water || null },
    build(W) { build(W); },
    npcs: (spec.people || []).map(d0 => Object.assign({ noBond: true }, d0, { show: d0.show || (() => true) })),
    steps: { play: { ch: 1, obj: s => { const r = rows(s); return r[0] ? r[0].t : ''; }, list: s => rows(s).slice(1),
      target: s => { const def = G.DLC && G.DLC.defs[story]; try { const v = def && def.target && def.target(G.DLC.st(story)); return v ? { x: v[0], z: v[1] } : null; } catch (e) { return null; } } } },
    chapters: [{ t: spec.title || '' }], start: { step: 'play', x: (spec.spawn || [0, 0])[0], z: (spec.spawn || [0, 0])[1], face: (spec.spawn || [])[2] || 0, time: 10, silver: 0, inv: {}, tools: {} },
    outfits: { default: spec.look || JEP.outfits.default },
    places: spec.places || [],
    calmSurv: () => true, calmWeather: () => false, noRain: !(spec.weather && spec.weather.rain), quiet: () => true,
    climate: () => spec.weather || { clear: 0.8, cloudy: 0.2 },
    bounds(p) { p.x = clamp(p.x, AR[0] + 0.6, AR[1] - 0.6); p.z = clamp(p.z, AR[2] + 0.6, AR[3] - 0.6); },
    context(s) { if (!spec.ctx || Game.cineOn || G.UI.busy()) return null; const p = P(); try { const r = spec.ctx(s, p.x, p.z, K); return r && r.length ? r : null; } catch (e) { console.error('dlc ctx ' + key, e); return null; } },
    update(dt, s) { if (Game.mode !== 'play' || !s) return; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
      if (s.time > 28.6) s.time -= 24; /* the clock never runs into a new day inside a story */
      try { chatter(d); if (spec.tick) spec.tick(d, K); } catch (e) { console.error('dlc tick ' + key, e); } },
    dyn(list, s, g, t) { if (!STAGE) return; try { if (spec.dyn) spec.dyn(list, performance.now() / 1000, Object.assign(K, { stage: STAGE })); if (X.deco) X.deco(key, list, performance.now() / 1000); } catch (e) { console.error('dlc dyn ' + key, e); } },
    skinned(list, s, g, t) { if (spec.skinned) try { spec.skinned(list, t); } catch (e) { console.error('dlc skinned ' + key, e); } },
    music: spec.music ? (s, g, hr) => spec.music(hr) : undefined,
    mood: () => MOOD, /* a little less haze than Joseph's wide map: the valley and its hills stay clear */
    onLoad(s) { if (G.DLC && G.DLC.loaded) G.DLC.loaded(story, s); },
    pose(pst) { const P0 = Game.P; if (P0 && P0.cpose && !pst.act) { pst.act = P0.cpose.k; pst.actT = P0.cpose.dur ? Math.min(1, P0.cpose.t / P0.cpose.dur) : (P0.cpose.t % 2) / 2; } } /* v18.82 a held pose (sitting by the ewe, in the shade, by the fire) shows inside a story too */
  }, EPX);
  L.ep = EPD; const MOOD = { mod(e) { e.fogDen = 1 / 470; if (spec.mood) spec.mood(e); } };
  function rows(s) { try { return (spec.quest && spec.quest(s, K)) || []; } catch (e) { console.error('dlc quest ' + key, e); return []; } }
  /* people chatting with each other when he walks by */
  let tT = 0; const cool = {};
  function chatter(dt) { tT -= dt; if (tT > 0 || !spec.chatter) return; tT = 6 + Math.random() * 6; if (G.UI.busy()) return; const now = performance.now() / 1000, p = P();
    const ns = EPD.npcs.map(d => Game.npc(d.id)).filter(n => n && n.vis && !n.talking && !(n.d && (n.d.animal || n.d.bib)) && Math.hypot(n.x - p.x, n.z - p.z) < 24); /* v18.82 people of the Bible (bib) don't chat in bubbles */
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const a = ns[i], b = ns[j], k = a.id + b.id; if ((cool[k] || 0) > now || Math.hypot(a.x - b.x, a.z - b.z) > 8) continue; cool[k] = now + 80;
      const T = spec.chatter[Math.floor(Math.random() * spec.chatter.length)]; G.Life.bubble(a.id, T[0], 2.6); setTimeout(() => G.Life.bubble(b.id, T[1], 2.8), 1500); return; } }
  if (spec.items) Object.assign(Game.ITEMS, spec.items);
  X.list.push(L); return L; };

/* talking to the story's people goes to the story first */
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const E = Game.EP && Game.EP(); if (E && E.dlc) { const L = X.list.find(l => l.ep === E); const f = L && L.spec.talk && L.spec.talk[id];
      if (f) { const done = () => { const n = Game.npc(id); if (n) n.talking = false; }; const r = f(S(), done, { L }); if (r !== false) return true; } }
    return lt0.apply(this, arguments); }; }
/* inside a story only the story's own hands-on things are offered (Joseph's fires, doors, beds, stalls … stay in Joseph's world) */
X.ctxOk = (E, pv) => !(E && E.dlc) || !!pv.dlcOk;
})(window.G);
