/* 약속의 길 — 곳간 짓기 놀이 (v18.21)
   곳간(성읍·서쪽 마을·남쪽 마을)은 설계를 고르고 재료를 낸 뒤, 단계마다 서로 다른 짧은 놀이를 하나씩 해요 (어렵지 않게):
   ① 터 다지기 — 벽돌 조각을 끌어다 판의 빈칸을 채워요 (누르면 돌려요)
   ② 벽돌 쌓기 — 좌우로 오가는 벽돌을 눌러 떨어뜨려 여섯 층을 쌓아요 (빗나가면 그 층만 다시)
   ③ 곡식 칸 세우기 — 곡식 자루를 끌어다 맞는 칸에 넣어요
   ④ 지붕 덮기 — 솟아오르는 못을 눌러 열 개를 박아요
   끝날 때마다 화려한 팝업. 「나중에」로 나가도 끝낸 단계는 남아요. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), pop = (t, s, i) => UI.pop ? UI.pop(t, s, i) : UI.toast(s ? t + ' · ' + s : t);
const Pz = G.Puzzle = {};
const STAGES = [{ n: '터 다지기', d: '조각을 끌어다 빈칸을 채워요 · 누르면 돌아가요' }, { n: '벽돌 쌓기', d: '눌러서 벽돌을 떨어뜨려요 · 여섯 층' }, { n: '곡식 칸 세우기', d: '자루를 같은 곡식 칸으로 끌어요' }, { n: '지붕 덮기', d: '솟아오른 못을 눌러 박아요 · 열 개' }];
let el = null, cur = null;
function ui() { if (el) return el; el = document.createElement('div'); el.id = 'puzUI'; el.hidden = true; document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = `
#puzUI{position:fixed;inset:0;z-index:220;background:radial-gradient(ellipse at 50% 30%,rgba(40,30,16,.94),rgba(10,8,4,.96));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#f0e4c8;font-family:system-ui,sans-serif;padding:16px;touch-action:none;user-select:none;-webkit-user-select:none}
#puzUI .pt{font-size:12px;color:#e5b552;font-weight:700;letter-spacing:.05em}#puzUI h3{margin:0;font-size:21px;text-shadow:0 2px 10px rgba(229,181,82,.4)}#puzUI .pd{font-size:12.5px;opacity:.75;text-align:center}
#puzUI .stage{position:relative}#puzUI .board{display:grid;gap:3px;padding:8px;background:#5a4630;border-radius:12px;box-shadow:inset 0 2px 8px #0008}
#puzUI .cell{width:var(--cs);height:var(--cs);border-radius:5px;background:#2c241a;border:1px dashed #6a5a44;box-sizing:border-box}
#puzUI .cell.fix{background:linear-gradient(#9a8a72,#7a6a52);border:1px solid #4a3a2a}#puzUI .cell.pc{border:1px solid #3a2a18;box-shadow:inset 0 -3px 0 #0003}
#puzUI .cell.ok{background:#4a7a3a}#puzUI .cell.bad{background:#7a3a2a}
#puzUI .tray{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:380px;min-height:70px;align-items:center}
#puzUI .pc0{display:grid;gap:2px;padding:6px;border-radius:9px;background:#3a2e20;touch-action:none}#puzUI .pc0 i{width:18px;height:18px;border-radius:3px;display:block}#puzUI .pc0 i.e{visibility:hidden}
#puzUI .ghost{position:fixed;display:grid;gap:3px;pointer-events:none;z-index:230;opacity:.9;filter:drop-shadow(0 6px 10px #000a)}#puzUI .ghost i{width:var(--cs);height:var(--cs);border-radius:5px;display:block}#puzUI .ghost i.e{visibility:hidden}
#puzUI .prow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}#puzUI .prow button{font-size:13.5px;padding:8px 16px;border-radius:10px;border:1px solid #8a6a3a;background:#3a2c1a;color:#f0e4c8}
#puzUI .steps{display:flex;gap:6px}#puzUI .steps span{width:28px;height:6px;border-radius:3px;background:#3a2e20}#puzUI .steps span.on{background:#e5b552;box-shadow:0 0 8px #e5b552}#puzUI .steps span.done{background:#6a9a4a}
#puzUI .stk{position:relative;width:280px;height:300px;background:linear-gradient(#8ab0d0,#e8d8b0);border-radius:12px;overflow:hidden;box-shadow:inset 0 2px 10px #0006}
#puzUI .stk i{position:absolute;height:26px;border-radius:4px;background:linear-gradient(#c8864a,#9a6034);border:1px solid #5a3a20;box-sizing:border-box}
#puzUI .bins{display:flex;gap:10px}#puzUI .bin{width:92px;height:96px;border-radius:12px;border:2px dashed #8a7a5a;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:6px;font-size:12px;font-weight:700;background:rgba(0,0,0,.25);box-sizing:border-box}
#puzUI .bin.binOver{border-color:#e5b552;background:rgba(229,181,82,.15)}#puzUI .sacks{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:320px;min-height:56px}
#puzUI .sack{width:46px;height:50px;border-radius:40% 40% 30% 30%;display:grid;place-items:center;font-size:11px;font-weight:700;color:#3a2a14;touch-action:none;box-shadow:inset 0 -4px 0 #0002}
#puzUI .sack.shake{animation:pzShake .3s}@keyframes pzShake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
#puzUI .roof{display:grid;grid-template-columns:repeat(4,64px);gap:6px;padding:10px;border-radius:12px;background:repeating-linear-gradient(90deg,#9a6a3a 0 30px,#8a5a30 30px 34px)}
#puzUI .nail{width:64px;height:54px;border-radius:8px;display:grid;place-items:center;background:rgba(0,0,0,.12)}#puzUI .nail b{width:14px;height:36px;border-radius:3px 3px 1px 1px;background:linear-gradient(#e8e8f0,#8a8a9a);transform:translateY(18px) scaleY(.2);transition:transform .12s;display:block}
#puzUI .nail.up b{transform:none}#puzUI .nail.hit b{background:#6a6a7a;transform:translateY(20px) scaleY(.15)}#puzUI .cnt{font-size:15px;font-weight:800;color:#ffe9a8}`;
  document.head.appendChild(css); return el; }
function frame(inner) { const st = STAGES[cur.k]; el.innerHTML = `<div class="pt">${cur.site.n}</div><div class="steps">${STAGES.map((s, i) => `<span class="${i < cur.k ? 'done' : i === cur.k ? 'on' : ''}"></span>`).join('')}</div><h3>${st.n}</h3><div class="pd">${st.d}</div>${inner}<div class="prow"><button data-b="later">나중에</button></div>`;
  el.querySelector('[data-b="later"]').onclick = () => { close(); UI.toast('끝낸 단계는 그대로 남아요'); }; }
function close() { if (el) el.hidden = true; if (cur && cur.stop) cur.stop(); cur = null; UI.setBusy('puz', false); document.querySelectorAll('#puzUI .ghost').forEach(g => g.remove()); }
function win() { if (!cur || cur.won) return; cur.won = true; const site = cur.site, k = cur.k; sfx('craft'); close(); const last = k >= STAGES.length - 1;
  pop(`${STAGES[k].n} 완성!`, last ? '마지막 단계까지 끝!' : `다음은 ${STAGES[k + 1].n}`, 'star'); Game.siteWork(site); if (last && Game.S().built[site.id]) pop(`${site.n} 완성!`, '곡식을 쌓을 곳이 생겼어요', 'house'); }

// ① 터 다지기 — drag pieces onto the board
const SHAPES = [[[0, 0], [1, 0]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]]];
const norm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const rot = c => norm(c.map(([x, y]) => [-y, x]));
const rots = c => { const out = [], seen = new Set(); let r = norm(c); for (let i = 0; i < 4; i++) { const k = JSON.stringify(r); if (!seen.has(k)) { seen.add(k); out.push(r); } r = rot(r); } return out; };
function cut(W, H, holes) { for (let tries = 0; tries < 80; tries++) { const grid = Array(W * H).fill(-1), pieces = []; const fixed = new Set(); while (fixed.size < holes) fixed.add(Math.floor(Math.random() * W * H)); fixed.forEach(i => { grid[i] = -2; });
    const fill = () => { const i = grid.indexOf(-1); if (i < 0) return true; const x0 = i % W, y0 = Math.floor(i / W); const opts = []; SHAPES.forEach(s => rots(s).forEach(c => opts.push(c))); opts.sort(() => Math.random() - 0.5);
      for (const c of opts) { const [ax, ay] = c[0], cells = c.map(([x, y]) => [x - ax + x0, y - ay + y0]); if (cells.some(([x, y]) => x < 0 || y < 0 || x >= W || y >= H || grid[y * W + x] !== -1)) continue;
        cells.forEach(([x, y]) => { grid[y * W + x] = pieces.length; }); pieces.push(c); if (fill()) return true; pieces.pop(); cells.forEach(([x, y]) => { grid[y * W + x] = -1; }); } return false; };
    if (fill()) return { W, H, fixed: [...fixed], pieces: pieces.map(p => { let c = p; for (let k = Math.floor(Math.random() * 4); k > 0; k--) c = rot(c); return { cells: c, at: null }; }).sort(() => Math.random() - 0.5) }; } return null; }
const COL = ['#c8864a', '#b0703a', '#d89a5a', '#a86a40', '#c07a48', '#d8a868', '#9a6038', '#b8804e'];
function gameFit() { const pz = cut(5, 3, 2); if (!pz) { win(); return; } cur.pz = pz; const cs = Math.min(52, Math.floor((Math.min(innerWidth, 420) - 70) / pz.W));
  const cellsOf = p => p.at ? p.cells.map(([x, y]) => [x + p.at[0], y + p.at[1]]) : [], occ = i => pz.pieces.findIndex(p => cellsOf(p).some(([x, y]) => y * pz.W + x === i)), free = (x, y) => x >= 0 && y >= 0 && x < pz.W && y < pz.H && !pz.fixed.includes(y * pz.W + x) && occ(y * pz.W + x) < 0;
  const grid = (p, sz, cls, j) => { const w = Math.max(...p.cells.map(c => c[0])) + 1, h = Math.max(...p.cells.map(c => c[1])) + 1; let s = ''; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) s += p.cells.some(c => c[0] === x && c[1] === y) ? `<i style="background:${COL[pz.pieces.indexOf(p) % COL.length]}"></i>` : '<i class="e"></i>';
    return `<div class="${cls}" ${j !== undefined ? `data-p="${j}"` : ''} style="grid-template-columns:repeat(${w},${sz}px);grid-auto-rows:${sz}px">${s}</div>`; };
  const draw = () => { let b = ''; for (let i = 0; i < pz.W * pz.H; i++) { const o = occ(i); b += pz.fixed.includes(i) ? '<i class="cell fix"></i>' : o >= 0 ? `<i class="cell pc" data-c="${i}" style="background:${COL[o % COL.length]}"></i>` : `<i class="cell" data-c="${i}"></i>`; }
    frame(`<div class="stage"><div class="board" style="--cs:${cs}px;grid-template-columns:repeat(${pz.W},var(--cs))">${b}</div></div><div class="tray">${pz.pieces.map((p, j) => p.at ? '' : grid(p, 18, 'pc0', j)).join('')}</div>`); hook(); };
  let drag = null;
  const hook = () => { el.querySelectorAll('.pc0').forEach(t => t.addEventListener('pointerdown', e => { e.preventDefault(); const p = pz.pieces[+t.dataset.p], g = document.createElement('div'); g.innerHTML = grid(p, cs, 'ghost'); const gh = g.firstChild; gh.style.setProperty('--cs', cs + 'px'); el.appendChild(gh);
      drag = { p, gh, x0: e.clientX, y0: e.clientY, moved: false }; move(e); }));
    el.querySelectorAll('.cell.pc').forEach(c => c.addEventListener('pointerdown', e => { e.preventDefault(); const o = occ(+c.dataset.c); if (o >= 0) { pz.pieces[o].at = null; sfx('pickup', { vol: 0.4 }); draw(); } })); };
  const target = e => { const bd = el.querySelector('.board').getBoundingClientRect(), st = cs + 3, w = Math.max(...drag.p.cells.map(c => c[0])) + 1, h = Math.max(...drag.p.cells.map(c => c[1])) + 1;
    const gx = e.clientX - w * st / 2, gy = e.clientY - h * st / 2 - 40; return [Math.round((gx - bd.left - 8) / st), Math.round((gy - bd.top - 8) / st), gx, gy]; }; // the piece floats a little above the finger
  const move = e => { if (!drag) return; if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) drag.moved = true; const [ax, ay, gx, gy] = target(e); drag.gh.style.left = gx + 'px'; drag.gh.style.top = gy + 'px'; drag.gh.style.visibility = drag.moved ? 'visible' : 'hidden';
    const ok = drag.p.cells.every(([x, y]) => free(x + ax, y + ay)), all = el.querySelectorAll('.board .cell'); all.forEach(c => c.classList.remove('ok', 'bad')); if (!drag.moved) return;
    drag.p.cells.forEach(([x, y]) => { if (x + ax >= 0 && y + ay >= 0 && x + ax < pz.W && y + ay < pz.H) { const c = all[(y + ay) * pz.W + (x + ax)]; if (c) c.classList.add(ok ? 'ok' : 'bad'); } }); };
  const up = e => { if (!drag) return; const d = drag; d.gh.remove(); if (!d.moved) { drag = null; d.p.cells = rot(d.p.cells); sfx('click'); draw(); return; } const [ax, ay] = target(e); drag = null;
    if (d.p.cells.every(([x, y]) => free(x + ax, y + ay))) { d.p.at = [ax, ay]; sfx('step', { surf: 'stone' }); if (pz.pieces.every(q => q.at)) { draw(); setTimeout(win, 250); return; } } else sfx('click', { pitch: 0.6 }); draw(); };
  addEventListener('pointermove', move); addEventListener('pointerup', up); cur.stop = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); }; draw(); }

// ② 벽돌 쌓기 — tap to drop the sliding brick
function gameStack() { frame(`<div class="stk" id="pzStk"></div><div class="cnt" id="pzCnt">0 / 6</div>`); const box = el.querySelector('#pzStk'), cnt = el.querySelector('#pzCnt'), W = 280, BH = 26;
  const rows = [{ x: 70, w: 140 }]; const mk = (x, y, w) => { const i = document.createElement('i'); i.style.left = x + 'px'; i.style.bottom = y + 'px'; i.style.width = w + 'px'; box.appendChild(i); return i; };
  mk(70, 0, 140); let br = null, dir = 1, t0 = performance.now(), raf = 0, live = true;
  const spawn = () => { const w = rows[rows.length - 1].w; br = { x: 0, w, el: mk(0, rows.length * BH, w) }; dir = 1; };
  const tick = () => { if (!live) return; const now = performance.now(), dt = Math.min(0.05, (now - t0) / 1000); t0 = now; if (br) { br.x += dir * (140 + rows.length * 16) * dt; if (br.x < 0) { br.x = 0; dir = 1; } if (br.x + br.w > W) { br.x = W - br.w; dir = -1; } br.el.style.left = br.x + 'px'; } raf = requestAnimationFrame(tick); };
  box.addEventListener('pointerdown', e => { e.preventDefault(); if (!br) return; const top = rows[rows.length - 1], l = Math.max(br.x, top.x), r = Math.min(br.x + br.w, top.x + top.w), ov = r - l;
    if (ov < Math.min(top.w, br.w) * 0.3) { sfx('thud', { vol: 0.5 }); br.el.remove(); spawn(); return; } // missed: that layer again
    const w = Math.max(ov, 60), x = ov < 60 ? (l + r) / 2 - 30 : l; br.el.style.left = x + 'px'; br.el.style.width = w + 'px'; rows.push({ x, w }); sfx('step', { surf: 'stone' }); cnt.textContent = `${rows.length - 1} / 6`; br = null;
    if (rows.length > 6) { live = false; setTimeout(win, 300); return; } spawn(); });
  spawn(); raf = requestAnimationFrame(tick); cur.stop = () => { live = false; cancelAnimationFrame(raf); }; }

// ③ 곡식 칸 세우기 — drag each sack into its bin
function gameSort() { const K = [['밀', '#e0b040'], ['보리', '#d8c870'], ['렌틸', '#c0603a']], sacks = []; for (let i = 0; i < 9; i++) sacks.push(i % 3); sacks.sort(() => Math.random() - 0.5);
  frame(`<div class="bins">${K.map(([n, c], i) => `<div class="bin" data-bin="${i}" style="border-color:${c}">${n}<span class="cnt" data-n="${i}">0</span></div>`).join('')}</div><div class="sacks">${sacks.map((k, i) => `<div class="sack" data-s="${i}" data-k="${k}" style="background:${K[k][1]}">${K[k][0]}</div>`).join('')}</div>`);
  let drag = null, done = 0; const got = [0, 0, 0];
  el.querySelectorAll('.sack').forEach(s => s.addEventListener('pointerdown', e => { e.preventDefault(); const r = s.getBoundingClientRect(); drag = { s, dx: e.clientX - r.left, dy: e.clientY - r.top }; s.style.position = 'fixed'; s.style.zIndex = 231; mv(e); }));
  const binAt = e => [...el.querySelectorAll('.bin')].find(b => { const r = b.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; });
  const mv = e => { if (!drag) return; drag.s.style.left = e.clientX - drag.dx + 'px'; drag.s.style.top = e.clientY - drag.dy + 'px'; el.querySelectorAll('.bin').forEach(b => b.classList.toggle('binOver', b === binAt(e))); }; /* v18.35 'hot' is the hotbar's class: the bin flew off to the bottom of the screen and back, again and again */
  const up = e => { if (!drag) return; const s = drag.s, b = binAt(e); drag = null; el.querySelectorAll('.bin').forEach(x => x.classList.remove('binOver'));
    if (b && +b.dataset.bin === +s.dataset.k) { s.remove(); got[+s.dataset.k]++; el.querySelector(`[data-n="${s.dataset.k}"]`).textContent = got[+s.dataset.k]; sfx('rustle', { vol: 0.6 }); if (++done >= 9) setTimeout(win, 250); }
    else { s.style.position = ''; s.style.left = s.style.top = ''; s.style.zIndex = ''; s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); if (b) sfx('click', { pitch: 0.6 }); } };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); cur.stop = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); }; }

// ④ 지붕 덮기 — tap the nails that pop up
function gameNails() { frame(`<div class="roof">${[...Array(12)].map((_, i) => `<div class="nail" data-i="${i}"><b></b></div>`).join('')}</div><div class="cnt" id="pzCnt">0 / 10</div>`);
  const ns = [...el.querySelectorAll('.nail')], cnt = el.querySelector('#pzCnt'); let hits = 0, live = true, tm = 0;
  const rise = () => { if (!live) return; const idle = ns.filter(n => !n.classList.contains('up')); if (idle.length) { const n = idle[Math.floor(Math.random() * idle.length)]; n.classList.remove('hit'); n.classList.add('up'); setTimeout(() => n.classList.remove('up'), 1400); } tm = setTimeout(rise, 520); };
  ns.forEach(n => n.addEventListener('pointerdown', e => { e.preventDefault(); if (!n.classList.contains('up')) return; n.classList.remove('up'); n.classList.add('hit'); sfx('thud', { vol: 0.5, pitch: 1.6 }); hits++; cnt.textContent = `${hits} / 10`; if (hits >= 10) { live = false; setTimeout(win, 300); } }));
  rise(); cur.stop = () => { live = false; clearTimeout(tm); }; }

const GAMES = [gameFit, gameStack, gameSort, gameNails];
function start(site, k) { cur = { site, k }; ui().hidden = false; UI.setBusy('puz', true); GAMES[k](); }
Pz.work = function (site) { if (cur || UI.busy()) return; const s = Game.S(), pr = s.siteWork && s.siteWork[site.id]; if (!pr) return; if (site.id !== 'granA' && pr.n % 2 === 0) { Game.siteWork(site); UI.toast('일꾼들이 첫 곳간에서 배운 대로 해 두었어요'); } /* v18.38 the second and third granary go faster: two games each, not four */ const k = Math.min(STAGES.length - 1, pr.n);
  if (UI.help && UI.help('granary', '곳간 짓기', '단계마다 짧은 놀이 하나씩 · 끝낸 단계는 남아요')) { const w = setInterval(() => { if (!UI.busy()) { clearInterval(w); start(site, k); } }, 200); return; } start(site, k); };
Pz.stageName = k => (STAGES[k] || STAGES[0]).n;
Pz.cheat = () => { if (!cur) return false; win(); return true; }; // (for testing)
})(window.G);
