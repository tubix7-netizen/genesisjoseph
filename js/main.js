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
/* v18.24 the title, as asked: with no saved game there is only 「시작하기」 (it takes the first empty slot). With a save there are
   「이어하기」 (the three slots; pick one to play on) and 「새로하기」 (the three slots; an empty one starts there, a full one asks first,
   because starting over wipes what was saved in it). */
const SLOTS = [1, 2, 3];
function slotInfo(k, n) { const s = Game.readSlot(k, n); if (!s) return null; const ep = G.EP[k], st = ep.steps && ep.steps[s.step], ch = st && st.ch, chap = ep.chapters && ch ? ep.chapters[ch - 1] : null;
  const when = s.savedAt ? new Date(s.savedAt) : null; return { ch: chap ? chap.t : '', day: UI.dayLabel ? UI.dayLabel(s.day || 1) : (s.day || 1) + '일째', done: s.flags && s.flags.done, test: !!(s.flags && s.flags.cartTest),
    when: when ? `${when.getMonth() + 1}/${when.getDate()} ${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}` : '' }; }
let view = 'home'; /* home · cont (이어하기 slots) · new (새로하기 slots) */
const anySave = k => SLOTS.some(n => Game.hasSave(k, n));
function slotRows(k, mode) { return SLOTS.map(n => { const i = slotInfo(k, n);
  if (!i) return mode === 'new' ? `<div class="slot empty"><button class="btn sl ghostSl" data-new="${k}" data-slot="${n}"><b>슬롯 ${n}</b><span>비어 있어요 · 눌러서 여기서 시작</span></button></div>`
    : `<div class="slot empty"><button class="btn sl ghostSl" disabled><b>슬롯 ${n}</b><span>비어 있어요</span></button></div>`;
  const sub = `${i.test ? '수레 시험용 · ' : ''}${i.ch} · ${i.day}${i.when ? ' · ' + i.when : ''}`;
  return mode === 'new' ? `<div class="slot"><button class="btn sl" data-over="${k}" data-slot="${n}"><b>슬롯 ${n}${i.done ? ' · 완료' : ''}</b><span>${sub}</span></button></div>`
    : `<div class="slot${n === Game.slot ? ' cur' : ''}"><button class="btn sl" data-go="${k}" data-slot="${n}"><b>슬롯 ${n}${i.done ? ' · 완료' : ''}</b><span>${sub}</span></button><button class="btn ghost del" data-del="${k}" data-slot="${n}">지우기</button></div>`; }).join(''); }
function cards() {
  $('eps').innerHTML = EPS.map(k => { const ep = G.EP[k]; let body;
    if (!anySave(k)) body = `<div class="b"><button class="btn" data-start="${k}">시작하기</button></div>`;
    else if (view === 'home') body = `<div class="b"><button class="btn" data-view="cont">이어하기</button><button class="btn sec" data-view="new">새로하기</button></div>`;
    else body = `<div class="slotHead">${view === 'cont' ? '이어 할 슬롯을 골라요' : '새로 시작할 슬롯을 골라요'}</div><div class="slots">${slotRows(k, view)}</div><button class="btn ghost back" data-view="home">뒤로</button>`;
    return `<div class="ep"><small>${ep.sub}</small><h2>${ep.title}</h2><p>${ep.blurb}</p>${body}</div>`; }).join('');
  $('eps').classList.toggle('one', EPS.length === 1);
}
/* a small card over the title: 「슬롯 N에서 새로 시작할까요?」 */
function confirmOver(k, n) { const i = slotInfo(k, n), box = document.createElement('div'); box.className = 'slotAsk';
  box.innerHTML = `<div class="sa-card"><b>슬롯 ${n}에서 새로 시작할까요?</b><p>덮어쓰면 이 슬롯의 이전 기록${i ? `(${i.ch} · ${i.day})` : ''}이 지워져요.<br>지운 기록은 되돌릴 수 없어요.</p><div class="sa-b"><button class="btn" data-yes>덮어쓰고 시작</button><button class="btn sec" data-no>취소</button></div></div>`;
  $('title').appendChild(box); box.addEventListener('click', e => { if (e.target.closest('[data-yes]')) { box.remove(); Main.play(k, true, n); } else if (e.target.closest('[data-no]') || e.target === box) box.remove(); }); }
$('eps').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return; const n = +b.dataset.slot || 1;
  if (b.dataset.view) { view = b.dataset.view; cards(); return; }
  if (b.dataset.start) { Main.play(b.dataset.start, true, SLOTS.find(m => !Game.hasSave(b.dataset.start, m)) || 1); return; }
  if (b.dataset.del) { if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '정말 지울까요?'; setTimeout(() => { if (b.isConnected) { b.dataset.sure = ''; b.textContent = '지우기'; } }, 3000); return; } Game.deleteSave(b.dataset.del, n); if (!anySave(b.dataset.del)) view = 'home'; cards(); return; }
  if (b.dataset.over) { confirmOver(b.dataset.over, n); return; }
  if (b.dataset.go) { Main.play(b.dataset.go, false, n); return; }
  if (b.dataset.new) Main.play(b.dataset.new, true, n);
});
{ const css = document.createElement('style'); css.textContent = `
.ep .b .btn.sec{width:min(280px,82%);padding:13px 20px;font-size:15.5px;border-radius:16px;letter-spacing:.08em;background:rgba(255,255,255,.07);color:var(--gold-hi);border:1px solid rgba(229,181,82,.55);box-shadow:none}
.slotHead{font-size:13px;color:var(--sand);opacity:.85;margin:0 0 8px}.ep .btn.back{background:none;border:0;box-shadow:none;padding:10px 14px;font-size:13px;color:var(--muted);text-decoration:underline;text-underline-offset:4px;margin-top:4px}
.slot .sl[disabled]{opacity:.45}
.slotAsk{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;background:rgba(5,8,20,.62);animation:tIn .25s ease-out both}
.sa-card{width:min(320px,86vw);padding:20px 18px 16px;border-radius:18px;background:linear-gradient(180deg,#1c2440,#121830);border:1px solid rgba(229,181,82,.6);box-shadow:0 14px 40px rgba(0,0,0,.55);text-align:center}
.sa-card b{display:block;font-family:var(--serif);font-size:18px;color:var(--gold-hi);margin-bottom:8px}.sa-card p{margin:0 0 14px;font-size:13px;line-height:1.6;color:var(--sand)}
.sa-b{display:flex;gap:8px;justify-content:center}.sa-b .btn{padding:11px 16px;font-size:14px;border-radius:13px}.sa-b .btn.sec{background:rgba(255,255,255,.07);color:var(--sand);border:1px solid rgba(229,181,82,.4);box-shadow:none}`; document.head.appendChild(css); }
/* v18.24 (for testing the cart, asked for once): one empty slot — slot 3 if it is free — is filled with a game that has just reached
   5장 「순찰」, when the second chariot is Joseph's. It stands on the road south of the city with a little hay and barley for the horses.
   Made only once (genesisCartSeed); once played it is an ordinary save. */
function seedCartSlot() { try { if (localStorage.getItem('genesisCartSeed')) return; const k = 'joseph', ep = G.EP[k]; if (!ep || !Game.newState) return;
  const n = [3, 2, 1].find(m => !Game.hasSave(k, m)); if (!n) return;
  const s = Game.newState(ep); s.step = 'c5_patrol'; s.q = { chariotOk: 1 }; s.flags = { opened: 1, cartTest: 1 }; s.day = 12; s.time = 9; s.silver = 40;
  s.player = { x: -26, z: -112, face: Math.PI }; s.inv = Object.assign(s.inv || {}, { hay: 4, barley: 3, bread: 4, fig: 3 }); s.outfit = 'josephVizier';
  localStorage.setItem(n > 1 ? 'genesisSave_' + k + '#' + n : 'genesisSave_' + k, JSON.stringify(s)); localStorage.setItem('genesisCartSeed', String(n)); } catch (e) { console.warn('cart seed', e); } }
seedCartSlot();
Main.play = function (ep, fresh, slot) { if (Main._go) return; Main._go = 1; setTimeout(() => { Main._go = 0; }, 1500); /* v18.34 a double tap no longer builds the world twice */
  try { localStorage.setItem('genesisLast', ep); } catch (e) { }
  if (!slot) { slot = SLOTS.find(n => !Game.hasSave(ep, n)) || Game.slot; } Game.setSlot(slot); // a new game goes into an empty slot
  if (fresh) Game.deleteSave(ep, slot);
  UI.fade(() => { UI.clearTags(); Game.start(ep, fresh); UI.buildMap(); playing = ep; }, () => { });
};
let playing = null;
Main.toTitle = function () {
  UI.fade(() => { playing = null; view = 'home'; UI.toTitle(); cards(); UI.clearTags(); Game.start(last && G.EP[last] ? last : EPS[0], false, true); }, () => { });
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
setInterval(() => { if (playing && Game.mode === 'play' && !UI.busy() && !Game.cineOn && !(G.Cine && G.Cine.on)) Game.save(true); }, 40000); /* v18.34 not in the middle of a cutscene */ // v18.23 auto-save to the slot being played
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) Game.save(true); });
let lastRun = 0; // v18.4 P15: with a frame lock (30 / 60) display frames are skipped so that the ones that run are evenly spaced
Main.shouldRun = now => { let tg = Game.fpsTarget ? Game.fpsTarget() : 0; if (Game.COARSE && Game.mode === 'play' && UI.overlayOn && UI.overlayOn() && !/[?&]ov=0\b/.test(location.search)) tg = 15; if (Game.COARSE && Game.mode === 'title' && !/[?&]ov=0\b/.test(location.search)) tg = 20; /* v18.12: the title backdrop only needs 20 fps */ if (tg && now - lastRun < 1000 / tg - 2.5) return false; lastRun = now; return true; };
let okFrames = 0;
function loop(now) { if (window.__bc && ++okFrames === 1) __bc('frame1'); if (window.__bcDone && okFrames === 120) __bcDone(); if (!Main.shouldRun(now)) { requestAnimationFrame(loop); return; } try { Game.frame(now); } catch (e) { console.error(e); if (!Main.errShown) { Main.errShown = 1; UI.toast('문제가 생겼어요: ' + (e && e.message || e)); } } requestAnimationFrame(loop); }
requestAnimationFrame(loop);
window.__G = G;
})(window.G);
