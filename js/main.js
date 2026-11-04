/* 약속의 길 — boot, title, loop */
'use strict';
(function (G) {
const $ = id => document.getElementById(id);
const { R, FX, Game, UI } = G;
const Main = G.Main = {};
const canvas = $('view');
let ok = false;
try { ok = R.init(canvas, { aa: /[?&]aa=1\b/.test(location.search) || !(Game.COARSE && Game.SET.quality !== 'high') && !/[?&]aa=0\b/.test(location.search) }); } catch (e) { console.error(e); ok = false; }
if (!ok) { $('loadErr').hidden = false; $('title').hidden = true; return; }
FX.init(); Game.dpr = Math.min(window.devicePixelRatio || 1, 2); UI.resize();
const EPS = Object.keys(G.EP).filter(k => G.EP[k] && G.EP[k].title); // every registered episode gets a title card
let last = null; try { last = localStorage.getItem('genesisLast'); } catch (e) { }
/* v18.23 three save slots. 「새로 시작」 takes the first empty slot (or asks which to use when all three are full); the slot you play is
   the one every auto-save goes to. Each slot shows where you are (chapter), how long the journey has been and when it was saved. */
const SLOTS = [1, 2, 3];
function slotInfo(k, n) { const s = Game.readSlot(k, n); if (!s) return null; const ep = G.EP[k], st = ep.steps && ep.steps[s.step], ch = st && st.ch, chap = ep.chapters && ch ? ep.chapters[ch - 1] : null;
  const when = s.savedAt ? new Date(s.savedAt) : null; return { ch: chap ? chap.t : '', day: UI.dayLabel ? UI.dayLabel(s.day || 1) : (s.day || 1) + '일째', done: s.flags && s.flags.done, when: when ? `${when.getMonth() + 1}/${when.getDate()} ${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}` : '' }; }
function cards() {
  $('eps').innerHTML = EPS.map(k => { const ep = G.EP[k];
    const rows = SLOTS.map(n => { const i = slotInfo(k, n); return i ? `<div class="slot${n === Game.slot ? ' cur' : ''}"><button class="btn sl" data-go="${k}" data-slot="${n}"><b>슬롯 ${n}${i.done ? ' · 완료' : ''}</b><span>${i.ch} · ${i.day}${i.when ? ' · ' + i.when : ''}</span></button><button class="btn ghost del" data-del="${k}" data-slot="${n}">지우기</button></div>`
      : `<div class="slot empty"><button class="btn sl ghostSl" data-new="${k}" data-slot="${n}"><b>슬롯 ${n}</b><span>비어 있어요 · 눌러서 새로 시작</span></button></div>`; }).join('');
    return `<div class="ep"><small>${ep.sub}</small><h2>${ep.title}</h2><p>${ep.blurb}</p><div class="slots">${rows}</div></div>`; }).join('');
  $('eps').classList.toggle('one', EPS.length === 1);
}
$('eps').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const n = +b.dataset.slot || 1;
  if (b.dataset.del) { if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '정말 지울까요?'; setTimeout(() => { if (b.isConnected) { b.dataset.sure = ''; b.textContent = '지우기'; } }, 3000); return; } Game.deleteSave(b.dataset.del, n); cards(); return; }
  const ep = b.dataset.go || b.dataset.new; Main.play(ep, !!b.dataset.new, n);
});
Main.play = function (ep, fresh, slot) {
  try { localStorage.setItem('genesisLast', ep); } catch (e) { }
  if (!slot) { slot = SLOTS.find(n => !Game.hasSave(ep, n)) || Game.slot; } Game.setSlot(slot); // a new game goes into an empty slot
  if (fresh) Game.deleteSave(ep, slot);
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
/* v18.12: building the world takes seconds and blocks the page, so the title card is painted first (buttons wait, with a note), then the world is built. */
const tn = $('tNote'), tnText = tn ? tn.textContent : '';
$('eps').classList.add('wait'); if (tn) tn.textContent = '불러오는 중…';
const go = d => { try { if (!playing) boot(d); } finally { $('eps').classList.remove('wait'); if (tn) tn.textContent = tnText; } };
const later = f => requestAnimationFrame(() => setTimeout(f, 30));
if (hot && hot.ready) hot.ready(d => later(() => go(d))); else later(() => go((hot && hot.data) || {}));
addEventListener('pagehide', () => { if (playing) Game.save(true); });
setInterval(() => { if (playing && Game.mode === 'play' && !UI.busy()) Game.save(true); }, 40000); // v18.23 auto-save to the slot being played
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) Game.save(true); });
let lastRun = 0; // v18.4 P15: with a frame lock (30 / 60) display frames are skipped so that the ones that run are evenly spaced
Main.shouldRun = now => { let tg = Game.fpsTarget ? Game.fpsTarget() : 0; if (Game.COARSE && Game.mode === 'play' && UI.overlayOn && UI.overlayOn() && !/[?&]ov=0\b/.test(location.search)) tg = 15; if (Game.COARSE && Game.mode === 'title' && !/[?&]ov=0\b/.test(location.search)) tg = 20; /* v18.12: the title backdrop only needs 20 fps */ if (tg && now - lastRun < 1000 / tg - 2.5) return false; lastRun = now; return true; };
let okFrames = 0;
function loop(now) { if (window.__bc && ++okFrames === 1) __bc('frame1'); if (window.__bcDone && okFrames === 120) __bcDone(); if (!Main.shouldRun(now)) { requestAnimationFrame(loop); return; } try { Game.frame(now); } catch (e) { console.error(e); if (!Main.errShown) { Main.errShown = 1; UI.toast('문제가 생겼어요: ' + (e && e.message || e)); } } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__G = G;
})(window.G);
