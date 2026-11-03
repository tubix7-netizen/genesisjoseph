/* 약속의 길 — 버금 수레 (v18.21)
   · 마을(성읍·서쪽·남쪽 마을)과 관저·보디발의 집 안에서는 수레를 탈 수 없어요 — 사람들이 다쳐요. 타고 들어가면 마을 어귀에서 내려요.
   · 수레 위에서는 물건을 주울 수 없어요(말은 걸 수 있어요).
   · 수레에는 짐칸(12칸)이 있어요: 타고 있을 때 A키 「공간」. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const Ct = G.Cart = {};
Ct.town = function (x, z) { const s = S(); for (const v of EP.villages || []) { if (v.when && !v.when(s)) continue; if (Math.hypot(v.x - x, v.z - z) < v.r + 3) return v.n; }
  if (Math.hypot(x - 10, z + 141) < 20) return '총리 관저'; if (x > -51 && x < -5 && z > 35 && z < 71) return '보디발의 집'; return null; };
const e = (EP.extra || []).find(x => x.id === 'chariot');
if (e) { const c0 = e.click; e.click = function (s) { if (!s.q.riding) { const t = Ct.town(P().x, P().z); if (t) { pop('여기선 못 타요', `${t} 안이에요 · 넓은 곳에서 타요`, 'donkey'); return; } } const r = c0.apply(this, arguments); if (s.q.riding && G.UI.help) G.UI.help('cart', '버금 수레', '마을 밖 넓은 길에서만 · A키 「공간」은 짐칸'); return r; }; }
let cool = 0;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; cool -= typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  if (s.q.riding && cool <= 0 && !(G.Cine && G.Cine.on)) { const t = Ct.town(P().x, P().z); if (t) { cool = 2; s.q.riding = 0; Game.snapCam && Game.snapCam(); G.Audio && G.Audio.sfx('step'); pop('수레에서 내렸어요', `${t} 안에서는 걸어요`, 'donkey'); G.UI.hud(); } }
  return r; };
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || Game.cineOn || p.act) return null;
  return [{ d: 5, label: '공간', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartBox', use: () => G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12) }]; });
})(window.G);
