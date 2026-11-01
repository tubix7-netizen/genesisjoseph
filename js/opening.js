/* 약속의 길 — storybook opening. A few illustrated pages (inline SVG art from the episode) told by a narrator, with a
   gentle zoom on each picture, page dots, tap to turn, a skip button, and an optional "before you set out" card for
   first settings. Used on a fresh game: EP.opening = { pages: [{ art, kick, title, t, ref, who }], setup: true, after(S, G) } */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id);
const O = G.Opening = { on: false };
let D = null, lock = 0;
O.play = function (def, S, Gm) {
  D = { def, i: -1, S }; O.on = true; G.UI.setBusy('open', true); const el = $('opening'); el.hidden = false; el.classList.remove('out');
  $('opDots').innerHTML = def.pages.map(() => '<i></i>').join('') + (def.setup ? '<i></i>' : '');
  G.Audio && G.Audio.setMood && G.Audio.setMood(def.music || 'dream'); next();
};
function next() {
  if (!D) return; if (performance.now() < lock) return; D.i++; lock = performance.now() + 650;
  const pg = D.def.pages[D.i]; const dots = $('opDots').children; for (let k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k === D.i);
  if (!pg) { if (D.def.setup && !D.setupShown) { D.setupShown = true; setup(); return; } finish(); return; }
  const card = $('opCard'); card.classList.remove('in'); void card.offsetWidth;
  $('opArt').innerHTML = pg.art || ''; $('opKick').textContent = pg.kick || ''; $('opTitle').textContent = pg.title || ''; $('opWho').textContent = pg.who || ''; $('opWho').hidden = !pg.who;
  $('opText').textContent = pg.t || ''; $('opRef').textContent = pg.ref || ''; $('opSetup').hidden = true; $('opBody').hidden = false; $('opNext').textContent = D.i === D.def.pages.length - 1 && !D.def.setup ? '시작하기' : '눌러서 넘기기';
  card.classList.add('in'); G.Audio && G.Audio.sfx('page', { vol: 0.7 });
}
function setup() {
  const SET = Game.SET, card = $('opCard'); card.classList.remove('in'); void card.offsetWidth; $('opArt').innerHTML = D.def.setupArt || ''; $('opBody').hidden = true; $('opSetup').hidden = false;
  const seg = (k, opts, cur) => `<div class="seg">${opts.map(o => `<button data-k="${k}" data-v="${o[0]}" class="${cur === o[0] ? 'on' : ''}">${o[1]}</button>`).join('')}</div>`;
  $('opSetup').innerHTML = `<div class="n-kick">여정을 떠나기 전에</div><h2>처음 설정</h2>
    <div class="set"><span>시점</span>${seg('view', [['shoulder', '숄더뷰'], ['classic', '일반 3인칭']], SET.view === 'classic' ? 'classic' : 'shoulder')}</div>
    <div class="set"><span>주민이 먼저 말 걸기</span>${seg('chatty', [['often', '자주'], ['some', '가끔'], ['off', '끄기']], SET.chatty || 'some')}</div>
    <div class="set"><span>음악</span>${seg('music', [['0.6', '켜기'], ['0', '끄기']], (SET.music === 0 ? '0' : '0.6'))}</div>
    <p class="op-tip">설정은 나중에 메뉴 → 설정에서 언제든 바꿀 수 있어요.</p><button class="btn big" id="opGo">${D.def.startLabel || ((Game.EP().hero || '') + '의 이야기 시작하기')}</button>`;
  $('opSetup').onclick = e => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    if (b.id === 'opGo') { finish(); return; } const k = b.dataset.k, v = b.dataset.v; SET[k] = k === 'music' ? +v : v; Game.saveSettings(); if (k === 'music' && G.Audio) G.Audio.applyVolume();
    [...b.parentNode.children].forEach(x => x.classList.toggle('on', x === b)); G.Audio && G.Audio.sfx('click'); };
  card.classList.add('in');
}
function finish() {
  // v16.1: the opening cutscene starts underneath the fading storybook, so the game world never flashes up in between
  if (!D) return; const d = D; D = null; const el = $('opening'); O.on = false; G.UI.setBusy('open', false); if (d.def.after) d.def.after(Game.S(), Game);
  if (G.Cine && G.Cine.update) G.Cine.update(0.001); el.classList.add('out'); setTimeout(() => { el.hidden = true; }, 520);
}
$('opening').addEventListener('click', e => { if (e.target.closest('#opSkip') || e.target.closest('#opSetup')) return; next(); });
$('opSkip').onclick = e => { e.stopPropagation(); if (!D) return; if (D.def.setup && !D.setupShown) { D.setupShown = true; D.i = D.def.pages.length; lock = 0; setup(); const dots = $('opDots').children; for (let k = 0; k < dots.length; k++) dots[k].classList.toggle('on', k === dots.length - 1); } else finish(); };
addEventListener('keydown', e => { if (!O.on || !D) return; if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') { e.preventDefault(); if ($('opSetup').hidden) next(); } if (e.code === 'Escape') $('opSkip').click(); });
})(window.G);
