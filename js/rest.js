/* 약속의 길 — v18.58 밤샘과 잠자리 (rest.js)
   · 밤샘: 자지 않고 아침 6시를 넘기면 「밤샘」이 하루 쌓여요(최대 3일). 쌓인 만큼 최대 체력 · 기력 · 정신력이 잠시 줄어요
     (1일 15% · 2일 30% · 3일 50%).
   · 잠자리: 궂은 날(비 · 폭풍우 · 모래바람 · 추운 밤)에는 밖에서 잘 수 없어요. 집 안 · 지붕 아래 · 텐트 · 동굴에서 자야 해요.
   · 회복: 집이나 텐트에서 자면 밤샘이 모두 풀려요. 맑은 날 별을 보며 자면 더 쌓이지만 않아요(그대로).
     제대로 요리한 든든한 음식(3단계 이상 요리)을 먹고 밖에서 자면 하루치만 풀려요.
   · 텐트(「작은 캠프」): 마을 밖에서만, 애굽에 온 뒤부터 칠 수 있어요(가나안에서는 못 쳐요). 새로 치면 예전 텐트는 걷혀요.
     집에서 자도 밖에 쳐 둔 텐트는 걷혀요.
   API: G.Rest.n() 밤샘 날수 · G.Rest.K 줄어드는 비율 · G.Rest.judge() 지금 여기서 자면 어떻게 되는지 */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || !Game.sleep) return;
const R = G.Rest = { K: [0, 0.15, 0.3, 0.5], pending: null };
const S = () => Game.S(), P = () => Game.P;
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const F = () => { const s = S(); return s.flags.vigil || (s.flags.vigil = { n: 0, h: s.time % 24 }); };
R.n = () => { const s = S(); return s && s.flags && s.flags.vigil ? s.flags.vigil.n | 0 : 0; };
R.k = () => R.K[Math.min(3, R.n())] || 0;
const calm = s => { const E = Game.EP(); return !!(Game.cineOn || (G.Cine && G.Cine.on) || (E && E.calmSurv && E.calmSurv(s)) || (s.flags && s.flags.dream) || (G.DW && G.DW.on && G.DW.on())); };
const myCamps = () => (S().bld || []).filter(b => b.k === 'camp');
const inMyTent = () => { const p = P(); return myCamps().some(b => Math.hypot(b.x - p.x, b.z - p.z) < 2.4); };
/* where he is about to lie down */
R.judge = function () { const s = S(), p = P(), Sv = G.Surv, C = G.Climate || {}, Wx = G.Weather;
  const hs = Sv && Sv.heatAt ? Sv.heatAt(p.x, p.z) : { heat: 0, roof: 0 };
  const house = !!(G.Homes && G.Homes.inside && G.Homes.inside()), cave = !!((G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside()));
  const tent = inMyTent() || !!(G.Egypt2 && G.Egypt2.inTent && G.Egypt2.inTent()), roof = hs.roof > 0.45, shelter = house || cave || tent || roof;
  const kind = Wx && Wx.kind ? Wx.kind(s) : 'clear', wx = kind === 'rain' || kind === 'storm' || kind === 'dust' || (Wx && Wx.rainy && Wx.rainy());
  const cold = !!C.cold || (!(hs.heat > 8) && !(C.warmT > 0) && Sv && Sv.cold - Sv.heat > 8);
  const hearty = s.flags.hearty !== undefined && s.time - s.flags.hearty >= 0 && s.time - s.flags.hearty < 10;
  let block = '';
  if (!shelter && wx) block = (kind === 'dust' ? '모래바람이 불어' : kind === 'storm' ? '폭풍우가 쳐서' : '비가 와서') + ' 밖에서는 잘 수 없어요 · 집 안이나 텐트에서 자요';
  else if (!shelter && cold && !(hs.heat > 8)) block = '너무 추워서 밖에서는 잘 수 없어요 · 집 안이나 텐트, 아니면 모닥불 곁에서 자요';
  return { shelter, house: house || roof, tent, cave, hearty, block, q: shelter ? 'full' : hearty ? 'half' : 'open' }; };
/* sleeping: refuse outdoors in foul weather; remember how well he is about to rest */
const sl0 = Game.sleep; Game.sleep = function () { const s = S(); if (s && !calm(s)) { const j = R.judge(); if (j.block) { G.UI.toast(j.block, true); return; } R.pending = j; } return sl0.apply(this, arguments); };
/* called by game.js newDay(): a night slept */
R.onDay = function (s) { const f = F(), j = R.pending, n0 = f.n; R.pending = null; f.h = 6;
  if (!j || j.q === 'story') { if (!j) f.n = 0; return; } /* a night the story put him to bed: rested (a night the story kept him up: no change) */
  if (j.q === 'vigil') { f.n = Math.min(3, (f.n | 0) + 1); const n = f.n; setTimeout(() => pop(n === 1 ? '밤을 새웠어요' : n === 2 ? '이틀 밤을 새웠어요' : '사흘 밤을 새웠어요', `최대 체력·기력·정신력이 ${Math.round(R.K[n] * 100)}% 줄었어요 · 집이나 텐트에서 자면 풀려요`, 'moon'), 2600); return; }
  if (j.q === 'full') f.n = 0; else if (j.q === 'half') f.n = Math.max(0, f.n - 1);
  setTimeout(() => { if (j.q === 'full' && n0 > 0) pop('푹 잤어요', '밤샘 피로가 모두 풀렸어요', 'star');
    else if (j.q === 'half' && n0 > 0) pop('든든히 먹고 잤어요', f.n ? `밤샘 피로가 하루치 풀렸어요 · 아직 ${f.n}일 남았어요 (집이나 텐트에서 자면 다 풀려요)` : '밤샘 피로가 풀렸어요', 'star');
    else if (j.q === 'open' && n0 > 0) pop('별을 보며 잤어요', `밤샘 피로는 그대로예요(${n0}일) · 집이나 텐트에서 자야 풀려요`, 'moon');
    if (j.house && !j.tent && myCamps().length) { strike(null); G.UI.toast('집에서 자는 동안 밖에 쳐 둔 텐트를 걷었어요'); } }, 2600); };
/* one tent at a time */
function strike(keep) { const s = S(); let did = false; for (const b of myCamps()) { if (b === keep) continue; const i = s.bld.indexOf(b); if (i < 0) continue; try { if (G.Build && G.Build.detach1) G.Build.detach1(b); } catch (e) { } s.bld.splice(i, 1); did = true; } if (did) { Game.ENT.plotsDirty = true; Game.save(true); } return did; }
R.strike = strike;
/* per frame */
let hintT = 0;
R.update = function (dt) { const s = S(); if (!s || Game.mode !== 'play' || !s.hero) return; const f = F(), h = s.time % 24, H = s.hero;
  f.h = h; const k = R.k(); if (k > 0) { const hm = H.hpMax * (1 - k); if (H.hp > hm) { H.hp = hm; G.Combat && (G.Combat.hpDirty = 1); } const mm = (H.mindMax || 100) * (1 - k); if ((H.mind || 0) > mm) H.mind = mm; }
  /* only one tent stands: the newest */
  if ((hintT -= dt) <= 0) { hintT = 1; const cs = myCamps(); if (cs.length > 1) { if (strike(cs[cs.length - 1])) G.UI.toast('새 텐트를 쳐서 예전 텐트는 걷었어요'); } } };
if (G.Vitals && G.Vitals.stamCap) { const cap0 = G.Vitals.stamCap; G.Vitals.stamCap = function () { return cap0.apply(this, arguments) * (1 - R.k()); }; }
{ const E = G.EP && G.EP.joseph; if (E) { const up0 = E.update; E.update = function (dt, s) { if (up0) up0.apply(this, arguments); try { R.update(dt); } catch (e) { console.error('rest', e); } };
  /* the tent: not in Canaan (the story has not reached Egypt yet), never inside a village */
  const can0 = E.canBuild; E.canBuild = function (x, z, s, k) { const r = can0 ? can0.apply(this, arguments) : null; if (r) return r; if (k === 'camp') { if (G.Cast && G.Cast.era && G.Cast.era() === 'canaan') return '텐트는 애굽에 간 뒤부터 칠 수 있어요'; if (Game.townAt && Game.townAt(x, z)) return '텐트는 마을 밖에 쳐요'; } return null; }; } }
/* a hearty cooked meal before bed */
{ const eat0 = Game.eat; Game.eat = function (k) { const s = S(), before = Game.inv(k); const r = eat0.apply(this, arguments); try { const p = G.Cuisine && G.Cuisine.profile ? G.Cuisine.profile(k) : null; if (s && p && (p.tier | 0) >= 3 && Game.inv(k) < before) s.flags.hearty = s.time; } catch (e) { } return r; }; }
})(window.G);
