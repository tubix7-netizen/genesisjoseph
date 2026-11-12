/* 약속의 길 — 나일 강의 세 계절 (v18.26)
   옛 애굽 사람들은 한 해를 나일 강에 맞춰 셋으로 나눴어요.
   · 아케트(범람기): 강물이 불어 밭이 물에 잠겨요. 물이 빠지면 기름진 검은 흙이 남아요. 첫날은 「나일 강 새해 맞이」 잔치(feast.js).
   · 페레트(씨 뿌림): 물이 빠진 밭에 씨를 뿌리고 가꿔요.
   · 셰무(거둠): 곡식을 거둬요. 강물이 가장 낮아져요.
   게임에서는 15일이 한 해(계절마다 5일). 흉년(곳간을 연 뒤 ~ 이야기 끝)에는 강물이 거의 불지 않고 바닥이 드러나요.
   강물 높이는 천천히 바뀌고, 위쪽 날짜 표시 옆에 지금 계절이 보여요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.UI) return;
const S = () => Game.S(), pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const Y = 15;
const SEAS = { akhet: { n: '아케트 · 범람기', s: '범람기', desc: '나일 강이 불어 밭이 물에 잠겨요 · 물이 빠지면 검은 흙이 남아요' }, peret: { n: '페레트 · 씨 뿌림', s: '씨 뿌림', desc: '물이 빠진 밭에 씨를 뿌려요' }, shemu: { n: '셰무 · 거둠', s: '거둠', desc: '곡식을 거두는 때 · 강물이 가장 낮아요' } };
const Ni = G.Nile = {};
Ni.season = s => { const d = ((s.day % Y) + Y) % Y, k = d < 5 ? 'akhet' : d < 10 ? 'peret' : 'shemu'; return Object.assign({}, SEAS[k], { k, d: d % 5 }); };
const famine = s => { const o = Game.stepOrder(), i = o.indexOf(s.step), a = o.indexOf('c6_open'); return a >= 0 && i >= a && s.step !== 'j_end'; };
/* how far above (or below) the usual the river stands today */
const RISE = [0.08, 0.18, 0.25, 0.2, 0.1];
function offset(s) { if (famine(s)) return -0.35; const z = Ni.season(s); if (z.k === 'akhet') return RISE[z.d] * (s.flags.free ? 1 : 0.8); if (z.k === 'shemu') return -0.1 - z.d * 0.015; return 0; }
let base = null, cur = 0, told = null;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { const W = Game.W(); if (!W || !W.water) return r; if (base === null || W.water._b !== base) { base = W.water._b !== undefined ? W.water._b : W.water.level; W.water._b = base; cur = W.water.level - base; }
    if (!(G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) { const want = offset(s); cur += Math.max(-d * 0.01, Math.min(d * 0.01, want - cur)); W.water.level = base + cur; }
    const z = Ni.season(s); if (told !== z.k && !G.UI.busy() && !(G.Cine && G.Cine.on) && Game.stepOrder().indexOf(s.step) >= Game.stepOrder().indexOf('c2_arrive')) { const first = told === null; told = z.k; if (!first && z.d === 0) pop(z.n, famine(s) && z.k === 'akhet' ? '올해도 강물이 불지 않아요… 흉년이에요' : z.desc, 'star'); } } catch (e) { console.error('nile', e); } return r; };
/* the snap on load: the river at today's height straight away */
const ol0 = EP.onLoad; EP.onLoad = function () { const r = ol0 ? ol0.apply(this, arguments) : undefined; told = null; try { const s = S(), W = Game.W(); if (s && W && W.water) { if (W.water._b === undefined) W.water._b = W.water.level; base = W.water._b; cur = offset(s); W.water.level = base + cur; told = Ni.season(s).k; } } catch (e) { } return r; };
/* the season beside the day in the top bar */
const dl0 = G.UI.dayLabel; if (dl0) G.UI.dayLabel = function (day) { const t = dl0.apply(this, arguments); try { const s = S(); if (s && Game.stepOrder().indexOf(s.step) >= Game.stepOrder().indexOf('c2_arrive') && !(G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) return t + ' · ' + Ni.season(Object.assign({}, s, { day })).s; } catch (e) { } return t; };
Ni.offset = () => cur;
})(window.G);
