/* 약속의 길 — 먼 땅 공용 틀 (v18.50)
   그발(byblos.js) · 갑돌(caphtor.js)과 같은 방식으로 「지도 밖 무대」 땅을 만드는 틀이에요. 땅 하나는 G.Lands.make(spec) 한 번이에요.
   틀이 맡는 것: 오가기(어둠 · 수레 · 짐 확인, 화면 전환, 시간 흐름), 무대 짓기와 충돌 벽 켜고 끄기, 땅 높이 · 물, 그 땅만 그리기,
   애굽 쪽 안내인과 그 땅 안내인, 사람 등록과 대화 연결, 손으로 하는 일(CTX), 사람들끼리의 한마디, 날씨, 목표 목록 줄, 발자취 묶음.
   spec: { key, name, BX, BZ, BY, hours, depart:{…}, arrive:{…}, spawn:[lx,lz,face], build(K), floor(lx,lz), water(lx,lz), people:[…],
           talk:{ id: (s, done, K) => true }, ctx(s, lx, lz, K), dyn(list, t, K), chatter:[[a,b]…], weather:{…}, quest(s), trail:{…}, help:[t, line], hello:[t, sub] } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.Byblos) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(sub ? t + ' · ' + sub : t);
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
const tint = (b, o) => Object.assign({}, b || {}, o);
const LANDS = [];
const Ls = G.Lands = { list: LANDS, lookOf, tint, after, pop, sfx };
const anyOn = () => LANDS.some(L => L.on());
{ const ib0 = G.Byblos.inBy; G.Byblos.inBy = () => ib0() || anyOn(); } // the other modules: 「overseas」
const FLAGS = () => ['byblos', 'kaftor'].concat(LANDS.map(L => 'land_' + L.key));

Ls.make = function (spec) {
  const key = spec.key, FL = 'land_' + key, BX = spec.BX, BZ = spec.BZ, BY = spec.BY || 64;
  const on = () => { const s = S(); return !!(s && s.flags && s.flags[FL]) && !(G.DW && G.DW.on && G.DW.on()); }; /* v18.51 in a dream the dream world is drawn, not the land */
  const L = { key, spec, on, stage: () => ({ x: BX, z: BZ, y: BY }) }; LANDS.push(L);
  const K = { BX, BZ, BY, S, P, on, pop, sfx, after, say: (l, cb) => G.UI.say(l, cb), Ln: (n, t, e) => ({ n, t, e }), npc: id => Game.npc(id), L };
  // ---------------------------------------------------------- people (local x, z on the stage)
  const IDS = [];
  for (const d0 of spec.people || []) { const d = Object.assign({}, d0); d.x = BX + d0.x; d.z = BZ + d0.z; d.show = d.show || (() => on()); d.noBond = true; EP.npcs.push(d); IDS.push(d.id); }
  const dep = spec.depart, arr = spec.arrive;
  if (dep) EP.npcs.push(Object.assign({ talkR: 3, noBond: true }, dep, { show: () => !on() && (!dep.when || dep.when()) }));
  if (arr) { EP.npcs.push(Object.assign({ talkR: 3, noBond: true }, arr, { x: BX + arr.x, z: BZ + arr.z, show: () => on() })); IDS.push(arr.id); }
  if (dep) (EP.places = EP.places || []).push({ n: dep.place || (spec.name + ' 가는 길'), x: dep.x, z: dep.z, when: () => !dep.when || dep.when() });
  // ---------------------------------------------------------- going and coming back
  function canGo() { const p = P(), s = S(); if (p.ride) return '나귀에서 먼저 내려 주세요'; if (s.q && s.q.riding) return '수레에서 먼저 내려 주세요';
    if ((p.follow || []).length) return '함께 가는 사람이 있을 땐 떠날 수 없어요'; if ((G.Phys && G.Phys.held) || p.carry) return '들고 있는 것을 먼저 내려놓아요'; return null; }
  L.go = function (toLand) { const why = canGo(); if (why) { pop('떠날 수 없어요', why, 'house'); return; } const s = S(), p = P();
    G.UI.fade(() => { if (s.q && s.q.cartPax && G.Cart && G.Cart.dropPax) try { G.Cart.dropPax(); } catch (e) { }
      s.time = Math.min((s.time || 8) + (spec.hours || 4), 25); for (const f of FLAGS()) s.flags[f] = 0; s.flags[FL] = toLand ? 1 : 0; sync(true);
      if (toLand) { const sp = spec.spawn; Game.teleport(BX + sp[0], BZ + sp[1], sp[2] || 0); const fy = floorAt(BX + sp[0], BZ + sp[1]); p.y = p.airTop = fy === null ? BY : fy; s.flags[FL + 'Met'] = 1; }
      else Game.teleport(dep.x + (dep.backDx || 1.2), dep.z + (dep.backDz || 0), dep.face || 0);
      sfx(spec.sfx || 'step', { vol: 0.5 }); }, () => {
      if (toLand) { const h = spec.help; if (!(h && G.UI.help && G.UI.help('land_' + key, h[0], h[1]))) pop(spec.hello[0], spec.hello[1], 'house'); }
      else pop('애굽 도착!', dep.backMsg || '', 'house'); }); };
  // ---------------------------------------------------------- talking
  const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(), done = () => { const n = Game.npc(id); if (n) n.talking = false; };
    if (dep && id === dep.id) { const h = s.time % 24; if (h > 20.5 || h < 5) { K.say([K.Ln(dep.name, dep.night || '밤에는 떠나지 않아요. 날이 밝으면 오세요!')], done); return true; }
      const intro = s.flags[FL + 'Dep'] ? [] : (dep.intro || []).map(t => K.Ln(dep.name, t)); s.flags[FL + 'Dep'] = 1;
      K.say(intro.concat([{ n: dep.name, t: dep.ask, choices: [{ t: dep.go, then: () => { done(); L.go(true); } }, { t: '다음에요', then: done }] }]), done); return true; }
    if (arr && id === arr.id) { K.say([{ n: arr.name, t: arr.ask || '애굽으로 돌아가실까요?', choices: [{ t: arr.go || '애굽으로 돌아가기', then: () => { done(); L.go(false); } }, { t: '조금 더 둘러볼게요', then: done }] }], done); return true; }
    const f = spec.talk && spec.talk[id]; if (f) { const r = f(s, done, K); if (r !== false) return true; }
    return lt0.apply(this, arguments); };
  // ---------------------------------------------------------- the stage
  let STAGE = null; const COLS = [];
  const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { if (STAGE) { STAGE.statics.forEach(m => G.R.free && G.R.free(m)); if (STAGE.water && G.R.free) G.R.free(STAGE.water.mesh); } COLS.length = 0; modeOn = null; STAGE = build(W); } catch (e) { console.error('land ' + key, e); } };
  function build(W) { const R = G.R, g = new G.GB(spec.seed || 13), X = BX, Z = BZ;
    const C = o => { const c = W.addCol(Object.assign({ on: false }, o)); COLS.push(c); return c; };
    const E = Object.assign({}, G.env || {}, EP.envx || {});
    let sd = spec.seed || 13; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const B = { g, W, R, X, Z, BY, rng, E,
      box: (w, h, d, x, y, z, c, o) => g.box(w, h, d, Object.assign({ at: [X + x, y, Z + z], c }, o || {})),
      cyl: (rt, rb, h, seg, x, y, z, c, o) => g.cyl(rt, rb, h, seg, Object.assign({ at: [X + x, y, Z + z], c }, o || {})),
      sph: (r, x, y, z, c, o) => g.sph(r, 10, 6, Object.assign({ at: [X + x, y, Z + z], c }, o || {})),
      col: (x, z, w, d, y0, y1, cam) => C({ x: X + x, z: Z + z, w, d, y0: y0 === undefined ? BY - 2 : y0, y1: y1 === undefined ? BY + 5 : y1, cam: !!cam }),
      colR: (x, z, r, y1) => C({ x: X + x, z: Z + z, r, y0: BY - 2, y1: y1 === undefined ? BY + 4 : y1 }),
      put: (fn, x, z, o) => { if (E[fn]) W.place(E[fn], X + x, Z + z, Object.assign({ gb: g, y: BY }, o || {})); return !!E[fn]; },
      sea: (level, shallow, deep, size) => { const d = [], st = 12, n = size || 50; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x0 = X - st * n / 2 + i * st, z0 = Z - st * n / 2 + j * st, x1 = x0 + st, z1 = z0 + st; const v = (x, z) => d.push(x, level, z, 0, 1, 0, 1, 1, 1, 0, 0); v(x0, z1); v(x1, z1); v(x1, z0); v(x0, z1); v(x1, z0); v(x0, z0); }
        const w0 = W.water || {}; return { mesh: R.mesh(new Float32Array(d)), level, map: w0.map, heightTex: w0.heightTex, shallow: shallow || [0.16, 0.5, 0.5], deep: deep || [0.05, 0.22, 0.3] }; },
      mesh: gb => R.mesh(gb), GB: seed => new G.GB(seed) };
    /* a hill range far behind, so the edge of the stage never shows empty sky under it */
    const out = spec.build(B) || {};
    const statics = [R.mesh(g)]; statics[0].outline = true;
    return Object.assign({ statics }, out); }
  // ---------------------------------------------------------- height, water, drawing
  const floorAt = (x, z) => { const v = spec.floor ? spec.floor(x - BX, z - BZ) : null; return v === null || v === undefined ? null : v; };
  EP.floor = (f0 => function (x, z, s) { if (on()) { const v = floorAt(x, z); if (v !== null) return v; } return f0 ? f0.apply(this, arguments) : null; })(EP.floor);
  EP.waterAt = (w0 => function (x, z, s) { if (!on()) return w0 ? w0.apply(this, arguments) : null; return spec.water ? spec.water(x - BX, z - BZ) : null; })(EP.waterAt);
  const EMPTY = [];
  const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (!on() || !STAGE) return; const sc = Game.scene; if (!sc) return;
    sc.terrain = EMPTY; sc.statics = STAGE.statics; sc.water = STAGE.water || null; sc.pools = null; sc.insts.length = 0;
    for (let i = list.length - 1; i >= 0; i--) { const m = list[i] && list[i].m; if (!m || Math.hypot(m[12] - BX, m[14] - BZ) > 150 || m[13] < BY - 12) list.splice(i, 1); }
    if (spec.dyn) try { spec.dyn(list, performance.now() / 1000, Object.assign(K, { stage: STAGE })); } catch (e) { console.error('land dyn ' + key, e); } };
  if (spec.ctx) Game.CTX.push(function (s) { if (!on() || Game.cineOn || G.UI.busy()) return null; const p = P(); try { const r = spec.ctx(s, p.x - BX, p.z - BZ, K); return r && r.length ? r : null; } catch (e) { return null; } });
  const q0 = EP.quiet; EP.quiet = function (s) { return on() || (q0 ? q0.apply(this, arguments) : false); };
  let modeOn = null;
  function sync(force) { const o = on(); if (o === modeOn && !force) return; modeOn = o; for (const c of COLS) c.on = o; if (o) EP.noGrass = true; else if (!G.Byblos.inBy()) EP.noGrass = false;
    const mm = document.getElementById('minimap'); if (mm) { if (o) mm.style.visibility = 'hidden'; else if (!G.Byblos.inBy()) mm.style.visibility = ''; }
    if (o && G.Weather && G.Weather.set && spec.weatherNow) G.Weather.set(spec.weatherNow, 4); }
  const olK = EP.onLoad; EP.onLoad = function () { const r = olK ? olK.apply(this, arguments) : undefined; try { sync(true); } catch (e) { } return r; };
  if (spec.weather && G.Weather && G.Weather.weights) { const w0 = G.Weather.weights; G.Weather.weights = function () { if (on()) return spec.weather; return w0.apply(this, arguments); }; }
  let tT = 0; const cool = {};
  function chatter(dt) { tT -= dt; if (tT > 0 || !spec.chatter) return; tT = 6 + Math.random() * 6; if (G.UI.busy()) return; const now = performance.now() / 1000, p = P();
    const ns = IDS.map(id => Game.npc(id)).filter(n => n && n.vis && !n.talking && !(n.d && n.d.animal) && Math.hypot(n.x - p.x, n.z - p.z) < 24);
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const a = ns[i], b = ns[j], k = a.id + b.id; if ((cool[k] || 0) > now || Math.hypot(a.x - b.x, a.z - b.z) > 8) continue; cool[k] = now + 80;
      const T = spec.chatter[Math.floor(Math.random() * spec.chatter.length)]; G.Life.bubble(a.id, T[0], 2.6); setTimeout(() => G.Life.bubble(b.id, T[1], 2.8), 1500); return; } }
  const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play') return r; try { const s = S(), p = P();
    if (s.flags[FL] && !(G.DW && G.DW.on && G.DW.on()) && Math.hypot(p.x - BX, p.z - BZ) > 170) s.flags[FL] = 0;
    sync(); if (on()) { const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60; chatter(d); if (spec.tick) spec.tick(d, K); } } catch (e) { console.error('land ' + key, e); } return r; };
  if (spec.quest && G.UI && G.UI.quest) { const uq0 = G.UI.quest; G.UI.quest = function () { const r = uq0.apply(this, arguments); try { const s = S(); if (s && on()) { const el = document.getElementById('qList'); const rows = spec.quest(s, K) || []; if (el) el.insertAdjacentHTML('beforeend', rows.map(q => `<div class="${q.ok ? 'ok' : ''}"><i>${q.ok ? '✓' : '·'}</i><span>${String(q.t).replace(/[<>&]/g, '')}</span></div>`).join('')); } } catch (e) { } return r; }; }
  if (spec.items) Object.assign(Game.ITEMS, spec.items);
  if (spec.shops) { EP.shops = EP.shops || {}; for (const k in spec.shops) { const sh = spec.shops[k]; sh.buy = (sh.buy || []).filter(x => Game.ITEMS[x.item]); EP.shops[k] = sh; } }
  if (spec.trail && G.Trail && G.Trail.GROUPS) { const gr = G.Trail.GROUPS.find(x => x.t === spec.trail.group); const list = spec.trail.list.map(x => Object.assign({ on: () => !dep || !dep.when || dep.when() }, x)); if (gr) gr.list.push(...list); else G.Trail.GROUPS.push({ t: spec.trail.group, on: spec.trail.on, list }); }
  return L; };
})(window.G);
