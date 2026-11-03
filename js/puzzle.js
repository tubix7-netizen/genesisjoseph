/* 약속의 길 — 곳간 짓기 퍼즐 (v18.14)
   곳간(성읍·서쪽 마을·남쪽 마을)은 설계를 고르고 재료를 낸 뒤, 짓는 단계(터 다지기 → 벽돌 쌓기 → 곡식 칸 세우기 → 지붕 덮기)마다
   망치질 대신 벽돌 퍼즐을 하나씩 풀어요. 단계가 갈수록 판이 커지고 조각이 길어져요.
   판의 빈칸을 아래 벽돌 조각들로 빈틈없이 채우면 한 단계가 끝나요. 조각을 누르고(「돌리기」로 방향 바꾸기) 판의 칸을 누르면
   그 칸에 조각의 첫 칸이 놓여요. 놓은 조각을 다시 누르면 빼요. 언제든 「나중에 하기」로 나가도 끝낸 단계는 남아요.
   모든 퍼즐은 실제로 채울 수 있는 판에서 만들어요 (먼저 판을 조각으로 나눈 뒤, 조각을 섞어 줘요). */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const Pz = G.Puzzle = {};
const SHAPES = [[[0, 0], [1, 0]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]]];
const norm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
const rot = c => norm(c.map(([x, y]) => [-y, x]));
const rots = c => { const out = [], seen = new Set(); let r = norm(c); for (let i = 0; i < 4; i++) { const k = JSON.stringify(r); if (!seen.has(k)) { seen.add(k); out.push(r); } r = rot(r); } return out; };
const STAGES = [{ n: '터 다지기', w: 5, h: 3, holes: 2, max: 3, d: '곳간 바닥에 다진 흙벽돌을 빈틈없이 깔아요' }, { n: '벽돌 쌓기', w: 6, h: 4, holes: 3, max: 4, d: '벽을 한 칸도 비지 않게 쌓아요' }, { n: '곡식 칸 세우기', w: 6, h: 5, holes: 4, max: 4, d: '곡식이 섞이지 않게 칸막이 벽돌을 채워요' }, { n: '지붕 덮기', w: 7, h: 5, holes: 4, max: 4, d: '들보 위에 판을 덮어 비가 새지 않게 해요' }];
// split the board into pieces (backtracking), keep a few cells already laid
function make(st, seed) { let r = seed; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
  for (let tries = 0; tries < 60; tries++) { const W = st.w, H = st.h, grid = Array(W * H).fill(-1), pieces = [];
    const fixed = new Set(); while (fixed.size < st.holes) fixed.add(Math.floor(rnd() * W * H)); fixed.forEach(i => { grid[i] = -2; });
    const fill = () => { const i = grid.indexOf(-1); if (i < 0) return true; const x0 = i % W, y0 = Math.floor(i / W);
      const opts = []; SHAPES.forEach((s, si) => { if (s.length > st.max) return; rots(s).forEach(c => opts.push(c)); }); for (let k = opts.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [opts[k], opts[j]] = [opts[j], opts[k]]; }
      for (const c of opts) { const [ax, ay] = c[0], cells = c.map(([x, y]) => [x - ax + x0, y - ay + y0]); if (cells.some(([x, y]) => x < 0 || y < 0 || x >= W || y >= H || grid[y * W + x] !== -1)) continue;
        const id = pieces.length; cells.forEach(([x, y]) => { grid[y * W + x] = id; }); pieces.push(c); c.at0 = [x0 - ax, y0 - ay];
        if (fill()) return true; pieces.pop(); cells.forEach(([x, y]) => { grid[y * W + x] = -1; }); }
      return false; };
    if (!fill()) continue; if (pieces.some(p => p.length === 1)) continue;
    return { W: st.w, H: st.h, fixed: [...fixed], pieces: pieces.map(p => { let c = p; for (let k = Math.floor(rnd() * 4); k > 0; k--) c = rot(c); return { cells: c, at: null, sol: [p, p.at0] }; }).sort(() => rnd() - 0.5) }; }
  return null; }

let el = null, cur = null;
function ui() { if (el) return el; el = document.createElement('div'); el.id = 'puzUI'; el.hidden = true; document.body.appendChild(el);
  const css = document.createElement('style'); css.textContent = `
#puzUI{position:fixed;inset:0;z-index:220;background:rgba(12,10,6,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#f0e4c8;font-family:system-ui,sans-serif;padding:16px;touch-action:none}
#puzUI .pt{font-size:13px;color:#e5b552;font-weight:700}#puzUI h3{margin:0;font-size:19px}#puzUI .pd{font-size:12.5px;opacity:.8;text-align:center;max-width:340px}
#puzUI .board{display:grid;gap:3px;padding:8px;background:#5a4630;border-radius:10px;box-shadow:inset 0 2px 8px #0008}
#puzUI .cell{width:var(--cs);height:var(--cs);border-radius:4px;background:#2c241a;border:1px dashed #6a5a44}
#puzUI .cell.fix{background:linear-gradient(#9a8a72,#7a6a52);border:1px solid #4a3a2a}
#puzUI .cell.pc{border:1px solid #3a2a18;box-shadow:inset 0 -3px 0 #0003}
#puzUI .cell.hint{outline:2px solid #e5b552;outline-offset:-2px}
#puzUI .tray{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:380px;min-height:60px}
#puzUI .pc0{display:grid;gap:2px;padding:5px;border-radius:8px;border:2px solid transparent;background:#3a2e20}
#puzUI .pc0.sel{border-color:#e5b552;background:#5a4428}#puzUI .pc0 i{width:16px;height:16px;border-radius:3px;display:block}
#puzUI .prow{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}#puzUI .prow button{font-size:13.5px;padding:8px 14px;border-radius:10px;border:1px solid #8a6a3a;background:#3a2c1a;color:#f0e4c8}
#puzUI .prow button.pri{background:#b07a2a;color:#fff;border-color:#e5b552}#puzUI .steps{display:flex;gap:6px}#puzUI .steps span{font-size:11.5px;padding:3px 8px;border-radius:10px;background:#3a2e20;opacity:.6}#puzUI .steps span.on{opacity:1;background:#8a6a32}#puzUI .steps span.done{opacity:1;background:#3e6a3a}`;
  document.head.appendChild(css);
  el.addEventListener('click', e => { if (!cur) return; const t = e.target.closest('[data-c],[data-p],[data-b]'); if (!t) return; const d = t.dataset;
    if (d.b === 'rot') { const p = cur.pz.pieces[cur.sel]; if (p && !p.at) { p.cells = rot(p.cells); sfx('click'); draw(); } return; }
    if (d.b === 'later') { close(); UI.toast('곳간 짓기를 잠시 멈췄어요 · 끝낸 단계는 그대로 남아요'); return; }
    if (d.b === 'reset') { cur.pz.pieces.forEach(p => { p.at = null; }); draw(); return; }
    if (d.p !== undefined) { cur.sel = +d.p; sfx('click'); draw(); return; }
    if (d.c !== undefined) { const i = +d.c, x = i % cur.pz.W, y = Math.floor(i / cur.pz.W), occ = occupant(i);
      if (occ >= 0) { cur.pz.pieces[occ].at = null; cur.sel = occ; sfx('pickup', { vol: 0.4 }); draw(); return; }
      const p = cur.pz.pieces[cur.sel]; if (!p || p.at) return; const [ax, ay] = p.cells[0], cells = p.cells.map(([cx, cy]) => [cx - ax + x, cy - ay + y]);
      if (cells.some(([cx, cy]) => cx < 0 || cy < 0 || cx >= cur.pz.W || cy >= cur.pz.H || blocked(cy * cur.pz.W + cx))) { sfx('click', { pitch: 0.6 }); UI.toast('거기는 들어가지 않아요 · 「돌리기」로 방향을 바꿔 봐요'); return; }
      p.at = [x - ax, y - ay]; sfx('step', { surf: 'stone' }); const nx = cur.pz.pieces.findIndex(q => !q.at); cur.sel = nx; draw(); if (nx < 0) win(); } }); return el; }
const cellsOf = p => p.at ? p.cells.map(([x, y]) => [x + p.at[0], y + p.at[1]]) : [];
function occupant(i) { const W = cur.pz.W; return cur.pz.pieces.findIndex(p => cellsOf(p).some(([x, y]) => y * W + x === i)); }
function blocked(i) { return cur.pz.fixed.includes(i) || occupant(i) >= 0; }
const COL = ['#c8864a', '#b0703a', '#d89a5a', '#a86a40', '#c07a48', '#d8a868', '#9a6038', '#b8804e', '#c89058', '#a87448', '#d09060', '#b07848'];
function draw() { const pz = cur.pz, st = STAGES[cur.k], cs = Math.min(46, Math.floor((Math.min(innerWidth, 420) - 60) / pz.W));
  let board = ''; for (let i = 0; i < pz.W * pz.H; i++) { const o = occupant(i); board += pz.fixed.includes(i) ? `<i class="cell fix"></i>` : o >= 0 ? `<i class="cell pc" data-c="${i}" style="background:${COL[o % COL.length]}"></i>` : `<i class="cell" data-c="${i}"></i>`; }
  const tray = pz.pieces.map((p, j) => { if (p.at) return ''; const w = Math.max(...p.cells.map(c => c[0])) + 1, h = Math.max(...p.cells.map(c => c[1])) + 1; let s = '';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) s += p.cells.some(c => c[0] === x && c[1] === y) ? `<i style="background:${COL[j % COL.length]}"></i>` : '<i></i>';
    return `<div class="pc0 ${cur.sel === j ? 'sel' : ''}" data-p="${j}" style="grid-template-columns:repeat(${w},16px)">${s}</div>`; }).join('');
  el.innerHTML = `<div class="pt">${cur.site.n} 짓기 · ${cur.k + 1}단계</div><div class="steps">${STAGES.map((s, i) => `<span class="${i < cur.k ? 'done' : i === cur.k ? 'on' : ''}">${i + 1}. ${s.n}</span>`).join('')}</div><h3>${st.n}</h3><div class="pd">${st.d} · 조각을 고르고 판의 칸을 눌러요 (놓은 조각을 누르면 빼요)</div>
    <div class="board" style="--cs:${cs}px;grid-template-columns:repeat(${pz.W},var(--cs))">${board}</div><div class="tray">${tray}</div>
    <div class="prow"><button data-b="rot">↻ 돌리기</button><button data-b="reset">다시 놓기</button><button data-b="later">나중에 하기</button></div>`; }
function win() { const site = cur.site, k = cur.k; sfx('craft'); close(); UI.toast(`${STAGES[k].n} 퍼즐 완성!`); Game.siteWork(site); }
function start(site, k) { const pz = make(STAGES[k], 1 + Math.floor(Math.random() * 2e9)); if (!pz) { Game.siteWork(site); return; } cur = { site, k, pz, sel: 0 }; ui().hidden = false; UI.setBusy('puz', true); draw(); }
function close() { if (el) el.hidden = true; cur = null; UI.setBusy('puz', false); }
Pz.work = function (site) { if (cur || UI.busy()) return; const s = Game.S(), pr = s.siteWork && s.siteWork[site.id]; if (!pr) return; const k = Math.min(STAGES.length - 1, pr.n);
  if (!s.flags.tipPuz) { s.flags.tipPuz = 1; UI.say([{ n: '', t: '곳간은 단계마다 벽돌 퍼즐을 풀어 지어요. 아래 조각을 골라 판의 빈칸을 빈틈없이 채우면 그 단계가 끝나요. 「나중에 하기」로 나가도 끝낸 단계는 남아요.' }], () => start(site, k)); return; }
  start(site, k); };
Pz.cheat = () => { if (!cur) return false; cur.pz.pieces.forEach(p => { p.cells = p.sol[0]; p.at = p.sol[1]; }); draw(); win(); return true; }; // (for testing: lays the board as it was cut)
Pz.test = (k) => make(STAGES[k || 0], 12345);
})(window.G);
