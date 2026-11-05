/* 약속의 길 — 처음 하는 사람을 위한 작은 도움 (v18.29)
   · 헤브론에서 보내는 첫날(길을 떠나기 전)에는 「조준」·「동작」 버튼을 숨겨 화면을 가볍게 해요. 길을 떠나면 나타나요.
   · 지도 옆 세 동그라미(하트 · 번개 · 눈)를 처음 한 번 설명해 주고, 누르면 언제든 지금 값을 알려 줘요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.UI) return;
const S = () => Game.S(), $ = id => document.getElementById(id);
{ const css = document.createElement('style'); css.textContent = 'body.early #btnLock,body.early #emoBtn{display:none!important}'; document.head.appendChild(css); }
const early = s => { const o = Game.stepOrder(), i = o.indexOf(s.step), j = o.indexOf('p_road'); return i >= 0 && j >= 0 && i < j; };
let t = 0, shown = false;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { document.body.classList.toggle('early', early(s)); if (!shown && !G.UI.busy() && !(G.Cine && G.Cine.on) && !Game.cineOn) { t += d; if (t > 8) { shown = true; G.UI.help && G.UI.help('cores', '지도 옆 세 동그라미', '하트 = 체력 · 번개 = 기력(달리기·점프·일에 써요) · 눈 = 정신력(마음이 지치면 실수가 늘어요) · 누르면 지금 값을 볼 수 있어요'); } } } catch (e) { console.error('tips', e); } return r; };
const say = (k) => { const s = S(), H = s && s.hero, p = Game.P; if (!H) return; const T = { coreHp: `체력 ${Math.round(H.hp)}/${Math.round(H.hpMax || 100)} · 다치면 줄고, 먹고 쉬면 차요`, coreSt: `기력 ${Math.round(p.stam)}/${Math.round(H.stamMax || 100)} · 달리기·점프·일에 써요`, coreMind: `정신력 ${Math.round(H.mind || 0)}/${Math.round(H.mindMax || 100)} · 기도하고 쉬면 차요` }; G.UI.toast(T[k]); };
setTimeout(() => { for (const k of ['coreHp', 'coreSt', 'coreMind']) { const el = $(k); if (el) { el.style.pointerEvents = 'auto'; el.style.cursor = 'pointer'; el.addEventListener('pointerdown', e => { e.stopPropagation(); say(k); }); } } }, 0);
})(window.G);
