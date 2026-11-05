/* 약속의 길 — 총리의 마구간 (v18.33)
   요셉이 총리가 된 뒤(수레를 받은 뒤), 총리의 집 가까이에 마구간이 있어요. 마구간지기 케티에게 말하면:
   · 말 사기 — 흰 말(은 90) · 갈색 말(은 60) · 검은 말(은 75). 산 말은 마구간에서 기다려요(마구간 덕분에 탈것을 셋까지 둘 수 있어요).
   · 다닐 탈것 고르기 — 「수레로 다니기」 또는 「말 타고 다니기」. 둘 중 하나만 써요.
       수레: 왼쪽 「수레 부르기」 · 말은 마구간에서 쉬어요.   말: 「말 부르기」(휘파람) · 수레는 마구간 옆에 세워 둬요.
   · 말 돌보기 — 은 3으로 지친 말들을 쉬게 해요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Rd = G.Ride; if (!EP || !Rd || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const ok = s => !!(s && s.q && s.q.chariotOk);
const mode = s => (s && s.flags && s.flags.travel) || 'cart';
let ST = null; /* { x, z, f } the stable yard */
const HORSES = [{ k: 'white', n: '흰 말', hide: 0xf2ece2, mane: 0xe6d6b0, price: 90 }, { k: 'bay', n: '갈색 말', hide: 0x8a5a36, mane: 0x2a1e16, price: 60 }, { k: 'black', n: '검은 말', hide: 0x2e2a28, mane: 0x141010, price: 75 }];
/* the yard: open ground a little way from the vizier's house, outside the house grounds */
function findSpot(W) { const hx = 10, hz = -140; let best = null;
  for (const r of [26, 30, 34, 38]) { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r; if (G.Cart && G.Cart.town && G.Cart.town(x, z)) continue;
      let clear = true; for (let i = -2; i <= 2 && clear; i++) for (let j = -2; j <= 2 && clear; j++) if (Game.solidAt(x + i * 2.4, z + j * 2, 0.4) || W.slopeAt(x + i * 2.4, z + j * 2) > 0.3 || (W.water && W.heightAt(x + i * 2.4, z + j * 2) < W.water.level + 0.5)) clear = false;
      if (clear) { const f = Math.atan2(hx - x, hz - z), ca = Math.cos(f), sa = Math.sin(f); let lo = 1e9, hi = -1e9; /* v18.34 the whole yard must be nearly level (posts and fence floated on a slope) */
        for (const lx of [-6.6, 0, 6.6]) for (const lz of [-3.6, 3, 10.3]) { const h = W.heightAt(x + ca * lx + sa * lz, z - sa * lx + ca * lz); lo = Math.min(lo, h); hi = Math.max(hi, h); }
        if (hi - lo < 0.6) { best = { x, z, f, lo }; break; } } } if (best) break; }
  return best || { x: hx + 28, z: hz, f: -Math.PI / 2 }; }
function build(W) { ST = findSpot(W); const { x, z, f } = ST, y = ST.lo !== undefined ? Math.min(W.heightAt(x, z), ST.lo + 0.15) : W.heightAt(x, z), ca = Math.cos(f), sa = Math.sin(f), at = (lx, lz) => [x + ca * lx + sa * lz, z - sa * lx + ca * lz];
  W.place((g, M) => { const WD = 0x8a6a48, DK = 0x5a4230, TH = 0xc8b078;
    for (const lx of [-5, -1.7, 1.7, 5]) for (const lz of [-2.2, 2.2]) g.cyl(0.12, 0.14, 2.8, 7, { m: M, at: [lx, 1.4, lz], c: WD });
    g.box(10.6, 0.16, 5.2, { m: M, at: [0, 2.85, 0], c: TH, j: 0.08 }); for (let i = 0; i < 12; i++) g.box(0.9, 0.06, 5.4, { m: M, at: [-5 + i * 0.9, 2.96, 0], c: i % 2 ? 0xb89a60 : TH, j: 0.06 });
    for (let i = -1; i <= 1; i++) { g.box(0.1, 1.1, 4.2, { m: M, at: [i * 3.4, 0.55, -0.1], c: DK }); }
    for (const sx of [-1, 1]) { g.box(0.1, 1.0, 9, { m: M, at: [sx * 6.6, 0.55, 5.8], c: WD }); for (const zz of [1.6, 4, 6.4, 8.8, 10.2]) g.cyl(0.08, 0.09, 1.2, 6, { m: M, at: [sx * 6.6, 0.6, zz], c: DK }); }
    g.box(13.2, 0.1, 0.1, { m: M, at: [0, 0.95, 10.3], c: WD }); g.box(13.2, 0.1, 0.1, { m: M, at: [0, 0.5, 10.3], c: WD });
    for (const lx of [-4.2, 0, 4.2]) { g.box(1.6, 0.4, 0.5, { m: M, at: [lx, 0.35, -1.8], c: 0x6a5a48 }); g.box(1.5, 0.08, 0.42, { m: M, at: [lx, 0.52, -1.8], c: 0xc8a050 }); }
    for (const [lx, lz] of [[-6, -3.4], [-5.2, -3.6], [6, -3.2]]) { g.box(1.0, 0.7, 0.8, { m: M, at: [lx, 0.35, lz], ry: lx, c: 0xd8c078, j: 0.1 }); }
    g.box(1.2, 0.5, 0.06, { m: M, at: [0, 1.7, 2.26], c: 0x2c4f9a }); g.box(1.3, 0.06, 0.08, { m: M, at: [0, 1.98, 2.27], c: 0xe2b440 }); }, x, z, { y, ry: f, col: null });
  for (const lx of [-5, -1.7, 1.7, 5]) for (const lz of [-2.2, 2.2]) { const [px, pz] = at(lx, lz); W.addCol({ x: px, z: pz, r: 0.2, h: 2.8 }); }
  for (const lx of [-3.4, 0, 3.4]) { const [px, pz] = at(lx, -0.1); W.addCol({ x: px, z: pz, w: 0.2, d: 4.2, a: f, h: 1.1 }); }
  for (const sx of [-1, 1]) { const [px, pz] = at(sx * 6.6, 5.8); W.addCol({ x: px, z: pz, w: 0.2, d: 9, a: f, h: 1.0 }); }
  ST.yard = at(0, 6.5); ST.keeper = at(2.4, 3.2); ST.cart = at(10.5, 4); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { build(W); } catch (e) { console.error('stable', e); } };
(EP.places = EP.places || []).push({ n: '총리의 마구간', x: 38, z: -140, when: s => ok(s) });
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
EP.npcs.push({ id: 'stKeeper', name: '마구간지기 케티', look: Object.assign({}, lookOf('ameni') || {}, { top: 0xd8c8a0, trim: 0x8a5a36 }), x: 38, z: -137, face: 0, talkR: 2.6, noBond: false, show: s => ok(s),
  persona: '말이라면 눈빛만 봐도 기분을 안다는 마구간지기. 말에게 이름을 붙여 주는 걸 좋아한다.' });
/* stand the keeper and the cart in the right places once the yard is known */
let placed = false;
function place() { if (placed || !ST) return; const n = Game.ENT.npcs.stKeeper; if (!n) return; placed = true; Game.npcTo && Game.npcTo('stKeeper', ST.keeper[0], ST.keeper[1], ST.f + Math.PI, false); n.d.x = ST.keeper[0]; n.d.z = ST.keeper[1]; }
Rd.cap = (cap0 => s => cap0(s) + (ok(s) ? 2 : 0))(Rd.cap); /* the vizier's stable keeps two more */
if (G.Build) { const ss0 = G.Build.stableSpot; G.Build.stableSpot = function (s) { const r = ss0 ? ss0.apply(this, arguments) : null; if (r) return r; return ST && ok(s) ? [ST.yard[0] + (Math.random() - 0.5) * 6, ST.yard[1] + (Math.random() - 0.5) * 4] : null; }; }
// ------------------------------------------------------------------ talking to Keti
const KN = '마구간지기 케티';
function menu(done) { const s = S(), own = Rd.list.filter(r => r.m.sp === 'horse'), m = mode(s);
  const ch = [{ t: '말 사기', then: () => setTimeout(buy, 40) }, { t: m === 'cart' ? '이제 말 타고 다니기' : '이제 수레로 다니기', then: () => setTimeout(() => setMode(m === 'cart' ? 'horse' : 'cart'), 40) }];
  if (Rd.list.length) ch.push({ t: '말 돌보기 (은 3)', then: () => { if (s.silver < 3) { G.UI.toast('은이 모자라요'); return; } Game.silver(-3); for (const r of Rd.list) { r.m.st = 100; r.tired = false; } pop('말들이 푹 쉬었어요', '기운이 가득해요', 'donkey'); } });
  ch.push({ t: '그만 이야기하기' });
  G.UI.say([{ n: KN, t: `총리님! 지금은 ${m === 'cart' ? '수레' : '말'}로 다니시지요.${own.length ? ` 마구간엔 ${own.map(r => r.m.name).join(', ')}이(가) 있어요.` : ' 아직 총리님 말은 없어요.'} 무엇을 할까요?`, choices: ch }], done); }
function buy() { const s = S(); G.UI.say([{ n: KN, t: '어느 말이 마음에 드세요? 다들 착하고 튼튼한 녀석들이에요.', choices: HORSES.map(h => ({ t: `${h.n} · 은 ${h.price}`, then: () => setTimeout(() => buyOne(h), 40) })).concat([{ t: '다음에요' }]) }]); }
function buyOne(h) { const s = S(); if (s.silver < h.price) { G.UI.say([{ n: KN, t: `${h.n}은 은 ${h.price}이에요. 조금 더 모아 오세요!` }]); return; }
  const ok2 = Rd.buy({ mount: 'horse', mname: h.n }); if (!ok2) return; Game.silver(-h.price); const r = Rd.list[Rd.list.length - 1]; r.m.hide = h.hide; r.m.mane = h.mane; r.mesh = Game.animalMesh('horse', 'plain', { saddle: Rd.MT.horse.saddle, hide: h.hide, mane: h.mane });
  if (ST) { r.x = r.m.x = ST.yard[0]; r.z = r.m.z = ST.yard[1]; if (r.col) { r.col.x = r.x; r.col.z = r.z; } }
  G.UI.say([{ n: KN, t: `${h.n}이 총리님 말이 되었어요! 이 녀석 이름은 뭐라고 할까요… 제가 몰래 「바람」이라고 불렀는데, 마음에 드시면 그대로 부르세요.` }, { n: KN, t: mode(s) === 'cart' ? '지금은 수레로 다니시니, 말 타고 다니시려면 저에게 「말 타고 다니기」라고 말씀하세요.' : '「말 부르기」로 휘파람을 불면 달려올 거예요!' }]); }
function setMode(m) { const s = S(); s.flags.travel = m; const p = P();
  if (m === 'horse') { if (s.q.riding && G.Cart) G.Cart.dismount(true); if (ST) s.q.cartAt = { x: ST.cart[0], z: ST.cart[1], f: ST.f }; if (!Rd.list.length) { G.UI.say([{ n: KN, t: '말 타고 다니시려면 먼저 말이 있어야 해요. 한 마리 고르시겠어요?' }], () => setTimeout(buy, 40)); s.flags.travel = 'cart'; return; }
    pop('이제 말 타고 다녀요', '「말 부르기」로 휘파람 · 수레는 마구간 옆에 서 있어요', 'donkey'); }
  else { if (p.ride && Rd.dismount) Rd.dismount(true); if (ST) for (const r of Rd.list) { r.x = ST.yard[0] + (Math.random() - 0.5) * 5; r.z = ST.yard[1] + (Math.random() - 0.5) * 3; r.called = false; r.tx = null; }
    pop('이제 수레로 다녀요', '「수레 부르기」 · 말들은 마구간에서 쉬어요', 'donkey'); }
  G.UI.hud(); }
const lt0 = G.Life.talk; G.Life.talk = function (id) { if (id === 'stKeeper') { const n = Game.npc('stKeeper'), done = () => { if (n) n.talking = false; }; if (n) n.talking = true;
    const s = S(); if (!s.flags.stMet) { s.flags.stMet = 1; G.UI.say([{ n: KN, t: '총리님! 저는 마구간지기 케티예요. 총리님 수레 말들도 제가 돌보지요.' }, { n: KN, t: '말을 사서 직접 타고 다니셔도 돼요. 수레랑 말, 둘 중 하나로 다니시면 돼요. 언제든 저에게 바꿔 달라고 하세요!' }], () => setTimeout(() => menu(done), 40)); } else menu(done); return true; }
  return lt0.apply(this, arguments); };
// ------------------------------------------------------------------ one way of travel at a time
if (G.Cart) { const m0 = G.Cart.mount; G.Cart.mount = function () { const s = S(); if (ok(s) && mode(s) === 'horse') { pop('지금은 말로 다녀요', '마구간지기 케티에게 「수레로 다니기」를 말해요', 'donkey'); return; } return m0.apply(this, arguments); }; }
const e = (EP.extra || []).find(x => x.id === 'chariot'); if (e) { const on0 = e.on; e.on = (s, g) => (on0 ? on0(s, g) : true) && !(ok(s) && mode(s) === 'horse'); }
{ const rc0 = Rd.call; Rd.call = function () { const s = S(); if (ok(s) && mode(s) === 'cart' && Rd.list.some(r => r.m.sp === 'horse')) { G.UI.toast('지금은 수레로 다녀요 · 말을 타려면 마구간지기 케티에게 말해요'); return; } return rc0.apply(this, arguments); };
  const rm0 = Rd.mount; Rd.mount = function (r) { const s = S(); if (ok(s) && mode(s) === 'cart' && r && r.m && r.m.sp === 'horse') { G.UI.toast('지금은 수레로 다녀요 · 마구간지기 케티에게 「말 타고 다니기」를 말해요'); return; } return rm0.apply(this, arguments); }; }
{ const css = document.createElement('style'); css.textContent = 'body.travelCart #rideBtn{display:none!important}'; document.head.appendChild(css); }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; try { place(); document.body.classList.toggle('travelCart', ok(s) && mode(s) === 'cart' && !Rd.list.some(x => x.m.sp !== 'horse')); } catch (er) { } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { placed = false; return ol0 ? ol0.apply(this, arguments) : undefined; };
G.Stable = { spot: () => ST, mode: () => mode(S()), setMode };
})(window.G);
