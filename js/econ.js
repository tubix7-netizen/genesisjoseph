/* 약속의 길 — 은의 값 (v18.55)
   은은 일해서 버는 것이 아니라 사람을 도와서 버는 쪽으로 기울였어요.
   · 팔기: 장사꾼이 쳐 주는 값을 절반쯤으로 (EP.sellMul 0.55). 물건을 쌓아 팔아 부자가 되기는 어려워요.
   · 부탁·현상금·보물 상자처럼 일을 마치고 받는 은: 1.6배. 알림 글(「은 30」)도 받은 만큼으로 바꿔 보여 줘요.
   · 사기: 가게 물건 1.5배, 탈것·수레 2.2배 (마구간의 말과 소달구지는 stable.js에서 따로 올렸어요).
   · 새로 살 수 있는 것 (왕의 도성 곡식·잡화 장수): 꿀 대추 과자 · 석류 · 애굽 땅 지도 두루마리 · 가나안 길 지도.
     옷장에 은으로 맞추는 옷 셋(밤하늘 겉옷 · 광야 나그네 차림 · 금빛 예복)도 생겼어요(e_cine.js WARD). */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, EP = G.EP && G.EP.joseph; if (!Game || !UI || !EP) return;
const S = () => Game.S();
const SELL = 0.55, BUY = 1.5, RIDE = 2.2, REWARD = 1.6;
const E = G.Econ = { SELL, BUY, RIDE, REWARD, boost: n => Math.round(n * REWARD) };
EP.sellMul = SELL;
// ------------------------------------------------------------------ prices in the shops (each entry once, when its shop is first opened)
const big = e => !!(e.mount || /수레|달구지|마차|전차|나귀|낙타/.test(e.n || ''));
function scale(e) { if (!e || e._econ || !(e.price > 0)) return; e._econ = 1; e.price = Math.max(1, Math.round(e.price * (big(e) ? RIDE : BUY))); }
const sh0 = UI.shop; UI.shop = function (id) { try { const sh = Game.EP().shops[id]; if (sh && sh.buy) sh.buy.forEach(scale); } catch (e) { } return sh0.apply(this, arguments); };
// ------------------------------------------------------------------ silver earned by doing things: more, and the notices say so
let recent = [];
const sv0 = Game.silver; Game.silver = function (n) { if (n > 0) { const m = E.boost(n); recent.push([n, m, performance.now()]); if (recent.length > 8) recent.shift(); return sv0.call(this, m); } return sv0.apply(this, arguments); };
const fix = t => { if (typeof t !== 'string' || !recent.length) return t; const now = performance.now(); recent = recent.filter(r => now - r[2] < 4000); for (const [n, m] of recent) t = t.replace(new RegExp('은 ' + n + '(?![0-9])', 'g'), '은 ' + m); return t; };
{ const po0 = UI.pop; if (po0) UI.pop = function (t, sub, ic) { return po0.call(this, fix(t), fix(sub), ic); }; const to0 = UI.toast; UI.toast = function (t, ...a) { return to0.call(this, fix(t), ...a); }; }
// ------------------------------------------------------------------ new things to buy
Object.assign(Game.ITEMS, {
  honeycake: { n: '꿀 대추 과자', cat: 'food', p: 10, ic: 'bread', c: '#c8862a', stam: 100, hp: 25 },
  pomegranate: { n: '석류', cat: 'food', p: 6, ic: 'berry', c: '#b8323a', hp: 15 } });
if (G.Surv && G.Surv.FOOD) Object.assign(G.Surv.FOOD, { honeycake: 30, pomegranate: 14 });
const MAPS = { mapEgypt: { n: '애굽 땅 지도 두루마리', d: '애굽의 마을·나루·신전 이름이 적힌 두루마리 · 지도에 「들은 곳」으로 표시돼요', price: 140, at: p => p.x < 120 },
  mapCanaan: { n: '가나안 길 지도', d: '헤브론에서 도단까지 · 지도에 「들은 곳」으로 표시돼요', price: 90, at: p => p.x >= 120 } };
const addShop = () => { const m = EP.shops && EP.shops.market; if (!m || m._econAdd) return; m._econAdd = 1;
  m.buy.push({ n: '꿀 대추 과자 ×2', item: 'honeycake', qty: 2, price: 30, d: '기력을 다 채우고 체력 +25' }, { n: '석류 ×3', item: 'pomegranate', qty: 3, price: 21, d: '체력 +15' });
  for (const k in MAPS) m.buy.push({ n: MAPS[k].n, d: MAPS[k].d, price: MAPS[k].price, fn: k, when: s => !(s.flags.maps && s.flags.maps[k]) }); };
addShop();
const buy0 = Game.buy; Game.buy = function (e) { if (e && MAPS[e.fn]) { const s = S(), M = MAPS[e.fn]; if (s.silver < e.price) { UI.toast('은이 부족해요'); return false; } Game.silver(-e.price); (s.flags.maps = s.flags.maps || {})[e.fn] = 1;
    let n = 0; for (const p of EP.places || []) { try { if (M.at(p) && (!p.when || p.when(s)) && G.MapFog && G.MapFog.mark(p, 'heard', true)) n++; } catch (er) { } } UI.pop && UI.pop(M.n, `지도에 ${n}곳을 적어 넣었어요`, 'map'); return true; }
  return buy0.apply(this, arguments); };
// ------------------------------------------------------------------ the market stalls: what lies on them is for sale (it used to be just for show)
/* at a stall in the king's city: 「수박 사기 · 은 3」 — pay, and a melon (or a basket, a jar of water, a sack) is in your arms */
const STALL = { melon: 3, basket: 6, jar: 4, sack: 8 };
Game.CTX.push(function (s) { const Ph = G.Phys, p = Game.P; if (!Ph || !Ph.list || Ph.held || p.carry || p.ride || p.act || Game.cineOn || UI.busy()) return null; let best = null, bd = 3.4; /* reached across the counter */
  for (const b of Ph.list) { if (!b.stall || b.gone || !STALL[b.k]) continue; const d = Math.hypot(b.x - p.x, b.z - p.z) - b.K.r; if (d < bd && Math.abs(b.y - p.y) < 1.8) { bd = d; best = b; } } if (!best) return null;
  const pr = STALL[best.k]; return [{ d: bd + 0.1, label: `${best.K.n} 사기 · 은 ${pr}`, x: best.x, z: best.z, y: best.y - p.y + 0.5, key: 'stallBuy', noMagnet: true, disabled: s.silver < pr,
    use: () => { if (s.silver < pr) { UI.toast('은이 부족해요'); return; } Game.silver(-pr); const nb = Ph.add(best.k, p.x + Math.sin(p.face) * 0.6, p.z + Math.cos(p.face) * 0.6); if (nb) Ph.pick(nb); G.Audio && G.Audio.sfx('coin'); UI.toast(`${best.K.n}을(를) 샀어요 · 은 ${pr}`); } }]; });
})(window.G);
