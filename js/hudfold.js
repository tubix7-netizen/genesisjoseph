/* 약속의 길 — 왼쪽 단추 접기 (v18.48)
   세로 화면 왼쪽에 쌓이는 단추(수레 부르기 · 동작 · 손에 든 것 · 물 …)를 「접기」 한 번으로 가방만 남기고 숨겨요.
   다시 누르면 펴져요. 고른 대로 기억해요(localStorage genesisHotFold). 기본은 펴진 채예요. */
'use strict';
(function (G) {
const hot = document.getElementById('hot'); if (!hot || !G.Game) return;
const KEY = 'genesisHotFold'; let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) { }
const css = document.createElement('style');
css.textContent = '#hotFoldBtn{display:none}@media (max-aspect-ratio:1/1){#hotFoldBtn{display:flex;min-height:30px;padding:4px 10px;font-size:12px;opacity:.82;border-style:dashed}body.hotFold #hotFoldBtn{opacity:1}body.hotFold #hot>button:not(#bagBtn):not(#hotFoldBtn){display:none!important}}'; // only the portrait column folds; in landscape the row along the bottom is left alone
document.head.appendChild(css);
const b = document.createElement('button'); b.id = 'hotFoldBtn'; b.type = 'button';
const paint = () => { document.body.classList.toggle('hotFold', on); b.textContent = on ? '펴기 ▸' : '접기 ▾'; b.setAttribute('aria-label', on ? '단추 펴기' : '단추 접기'); };
b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e2) { } paint(); if (G.Audio) G.Audio.sfx('blip', { vol: 0.4 }); });
/* other modules add their buttons to #hot later: keep this one last, so it sits on top of the column */
const place = () => { if (hot.lastElementChild !== b) hot.appendChild(b); };
place(); paint(); setInterval(place, 3000);
})(window.G);
