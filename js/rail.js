/* 약속의 길 — v18.41 오른쪽 줄 규칙.
   지도(와 둘레 고리) 바로 아래부터, 보이는 것만 이 우선순위대로 한 줄씩 쌓아요. 서로 겹치지 않아요.
     1 거리(미터기) · 2 자동 이동 · 3 꿈의 세계/현실 세계 · 4 더위·추위·젖음 · 5 별자리 · 6 얻은 물건 알림
   v18.40에서 폰에서만 겹쳤던 까닭: 화면 글자·버튼 크기(--uik)가 #hud에 CSS zoom으로 걸려 있어서, 화면 좌표를 그대로 top에
   넣으면 그 배율만큼 어긋났어요. 이제 요소마다 실제 배율로 나눠서 넣어요. 보이는 것이 바뀌면 바로 다시 줄을 세워요. */
'use strict';
(function (G) {
const ORDER = ['#compass', '#autoBtn', '#dreamBtn', '#climChip', '#starBtn', '#gains'];
const GAP = 6;
const $ = s => document.querySelector(s);
const shown = e => !!e && e.isConnected && !e.hidden && e.style.display !== 'none' && e.style.visibility !== 'hidden' && !e.closest('[hidden]');
const zoomOf = e => { const w = e.offsetWidth; if (!w) return 1; const r = e.getBoundingClientRect().width; return r > 0 ? r / w : 1; };
function anchor() { const mw = document.getElementById('mapwrap'); if (!mw || !shown(mw) || !mw.offsetWidth) return null; let b = mw.getBoundingClientRect().bottom; mw.querySelectorAll('.core').forEach(c => { const r = c.getBoundingClientRect(); if (r.height) b = Math.max(b, r.bottom); }); return b; }
let sig = '', last = 0; G.Rail = G.Rail || { box: null };
function lay(force) { const els = ORDER.map($), vis = els.map(e => shown(e)); /* (no layout reads here: this runs every frame) */
  const tst = document.getElementById('toast'), tOn = !!(tst && shown(tst) && tst.classList.contains('show'));
  const s = vis.map((v, i) => v ? (els[i].id + (els[i].textContent || '').length) : '').join('|') + '|' + innerWidth + 'x' + innerHeight + '|t' + (tOn ? tst.className + tst.textContent.length : 0);
  const now = performance.now(); if (!force && s === sig && now - last < 600) return; sig = s; last = now;
  let y = anchor(); if (y === null) { for (const e of els) if (e && e.style.top) e.style.top = ''; G.Rail.box = null; return; } const y0 = y; y += GAP; let left = document.getElementById('mapwrap').getBoundingClientRect().left;
  for (let i = 0; i < els.length; i++) { const e = els[i]; if (!e || !vis[i] || !e.offsetHeight) continue; const k = zoomOf(e) || 1, want = (y / k).toFixed(1) + 'px';
    if (e.style.top !== want) e.style.top = want; if (e.style.bottom) e.style.bottom = 'auto';
    const rr = e.getBoundingClientRect(); if (e.id !== 'gains') { y += rr.height + GAP; if (rr.width) left = Math.min(left, rr.left); } }
  G.Rail.box = { left, top: y0, bottom: y }; /* v18.42 the right column's box: speech bubbles and the wide notice keep out of it */
  if (tst) { if (tst.style.top) tst.style.top = ''; if (tOn) { const r = tst.getBoundingClientRect(); if (r.right > left - 4 && r.top < y && r.bottom > y0) tst.style.top = ((y + GAP) / (zoomOf(tst) || 1)).toFixed(1) + 'px'; } } }
function tick() { try { lay(false); } catch (e) { } requestAnimationFrame(tick); }
requestAnimationFrame(tick);
addEventListener('resize', () => setTimeout(() => lay(true), 60));
G.Rail = Object.assign(G.Rail || {}, { lay: () => lay(true) });
})(window.G);
