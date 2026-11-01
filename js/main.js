/* 약속의 길 — boot, title, loop */
'use strict';
(function (G) {
const $ = id => document.getElementById(id);
const { R, FX, Game, UI } = G;
const Main = G.Main = {};
const canvas = $('view');
let ok = false;
try { ok = R.init(canvas); } catch (e) { console.error(e); ok = false; }
if (!ok) { $('loadErr').hidden = false; $('title').hidden = true; return; }
FX.init(); Game.dpr = Math.min(window.devicePixelRatio || 1, 2); UI.resize();
const EPS = Object.keys(G.EP).filter(k => G.EP[k] && G.EP[k].title); // every registered episode gets a title card
let last = null; try { last = localStorage.getItem('genesisLast'); } catch (e) { }
function cards() {
  $('eps').innerHTML = EPS.map(k => { const ep = G.EP[k]; const has = Game.hasSave(k); let done = false; try { const s = JSON.parse(localStorage.getItem('genesisSave_' + k) || 'null'); done = s && s.flags && s.flags.done; } catch (e) { }
    return `<div class="ep"><small>${ep.sub}${done ? ' · 완료' : ''}</small><h2>${ep.title}</h2><p>${ep.blurb}</p><div class="b">${has ? `<button class="btn" data-go="${k}">이어하기</button><button class="btn ghost" data-new="${k}">처음부터</button>` : `<button class="btn" data-new="${k}">시작하기</button>`}</div></div>`; }).join('');
  $('eps').classList.toggle('one', EPS.length === 1);
}
$('eps').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.new && Game.hasSave(b.dataset.new) && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '저장을 지우고 시작'; return; }
  const ep = b.dataset.go || b.dataset.new; Main.play(ep, !!b.dataset.new);
});
Main.play = function (ep, fresh) {
  try { localStorage.setItem('genesisLast', ep); } catch (e) { }
  if (fresh) Game.deleteSave(ep);
  UI.fade(() => { UI.clearTags(); Game.start(ep, fresh); UI.buildMap(); playing = ep; }, () => { });
};
let playing = null;
Main.toTitle = function () {
  UI.fade(() => { playing = null; UI.toTitle(); cards(); UI.clearTags(); Game.start(last && G.EP[last] ? last : EPS[0], false, true); }, () => { });
};
// boot
cards();
let bootEp = last && G.EP[last] ? last : EPS[0];
const hot = window.claude && window.claude.hot;
function boot(data) {
  if (data && data.playing && G.EP[data.playing]) { Game.start(data.playing, false); UI.buildMap(); playing = data.playing; }
  else Game.start(bootEp, false, true);
}
if (hot && hot.snapshot) hot.snapshot(() => { if (playing) Game.save(true); return { playing }; });
if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
addEventListener('pagehide', () => { if (playing) Game.save(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) Game.save(true); });
function loop(now) { try { Game.frame(now); } catch (e) { console.error(e); if (!Main.errShown) { Main.errShown = 1; UI.toast('문제가 생겼어요: ' + (e && e.message || e)); } } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__G = G;
})(window.G);
