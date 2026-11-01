/* 약속의 길 — 프레임 재기 (v17.1, 엔진·연출 업그레이드 문서의 P11).
   주소 끝에 ?perf=1 을 붙여 열면 맨 위에 작은 표시가 나온다. 안 붙이면 이 파일은 아무것도 하지 않는다.
   · 프레임 시간: 평균 · 중앙값 · p99(100번 중 가장 느린 1번) · 최대, 33ms/50ms 를 넘은 프레임 수(분당)
   · 한 프레임의 JS 시간을 구간으로 나눔: 플레이어 · 시스템 · NPC · 농장 · 로직 · 준비(render 전) · 제출(R.render) · UI, 그 안의 애니메이션 · 메시 만들기
   · 그리기 호출 수 · 삼각형 수 · 힙 크기 · 초당 할당량 · GC 횟수 (크롬 계열만)
   · 튀는 프레임(33ms↑)마다 그 프레임의 구간 시간과 같은 프레임에 일어난 일(셰이더·새 메시·하루 바뀜·장면 시작)을 최근 50개 저장
   표시를 짧게 누르면 관성 블렌딩 켬/끔, 0.7초 길게 누르면 전체 보고서(JSON)를 복사. 콘솔: __perfReport() · G.Perf.reset() */
'use strict';
(function (G) {
if (!/[?&]perf\b/.test(location.search)) return;
const Game = G.Game, R = G.R, M = G.Motion, PM = Game.pm;
const clock = () => performance.now();
const N = 600, ft = new Float32Array(N); let fn = 0;
const P = G.Perf = { spikes: [] };
const SEC = {}, T0 = {}; let EV = [];           // SEC: ms per section in this frame · T0: section start · EV: things that happened this frame
const SECS = ['player', 'sys', 'npc', 'farm', 'logic', 'prep', 'submit', 'ui'];
const SECN = { player: '플레이어', sys: '시스템', npc: 'NPC', farm: '농장', logic: '로직', prep: '준비', submit: '제출', ui: 'UI' };
const D = { draws: 0, tris: 0 };                // GL draw counters, zeroed every frame
/* v17.4: triangles split by pass and kind. 0-3 = shadow pass (buildings+terrain, trees/herbs, people, other), 4-9 = main pass (buildings, terrain, trees/herbs, people, grass, other) */
const BK = ['그림자 건물', '그림자 나무', '그림자 사람', '그림자 기타', '주 건물', '주 지형', '주 나무', '주 사람', '주 풀', '주 기타'], BT = new Float64Array(10), BD = new Float64Array(10);
let CAT = new Map(), catT = 0, curProg = '', curVao = null, progNames = null;
function catUpdate(S) { if (!S || (catT++ % 30)) return; const m = new Map(); for (const x of S.terrain) m.set(x.vao, 'terrain'); for (const x of S.statics) m.set(x.vao, 'static'); for (const x of S.dyn) m.set(x.mesh.vao, 'dyn');
  for (const x of S.insts) { m.set(x.vao, 'inst'); if (x.vaoS) m.set(x.vaoS, 'inst'); } for (const x of S.skinned) m.set(x.mesh.vao, 'skin'); CAT = m; }
let tot, win, L, s33, s50, gcs, alloc, over, since;
P.reset = function () { tot = { n: 0, work: 0, anim: 0, mesh: 0, inert: 0, draws: 0, tris: 0, maxDraws: 0, maxTris: 0, sec: {}, bt: new Float64Array(10), bd: new Float64Array(10) }; win = { n: 0, work: 0, anim: 0, mesh: 0, inert: 0, draws: 0, tris: 0, sec: {}, bt: new Float64Array(10), bd: new Float64Array(10) };
  L = null; s33 = s50 = gcs = alloc = 0; over = { js: 0, ext: 0 }; since = clock(); fn = 0; P.spikes.length = 0; };
P.reset();

// ---- section marks (game.js calls PM.b / PM.e / PM.n; they are empty functions without ?perf)
PM.b = n => { T0[n] = clock(); };
PM.e = n => { const t = T0[n]; if (t !== undefined) { SEC[n] = (SEC[n] || 0) + clock() - t; T0[n] = undefined; } };
PM.n = n => { EV.push(n); };

// ---- GL: count draws/triangles, time shader compiles
const GLP = WebGL2RenderingContext.prototype;
for (const k of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) { const o = GLP[k]; if (!o) continue;
  const el = k.indexOf('Elements') > 0, inst = k.indexOf('Instanced') > 0;
  GLP[k] = function (mode, a, b) { const t = ((el ? a : b) * (inst ? arguments[el ? 4 : 3] : 1)) / 3; D.draws++; D.tris += t;
    const c = CAT.get(curVao), sh = curProg.length <= 5 && curProg.charCodeAt(0) === 100; // the depth programs are dLit, dSkin, dInst
    const i = sh ? (c === 'skin' ? 2 : c === 'inst' ? 1 : (c === 'static' || c === 'terrain') ? 0 : 3) : (c === 'static' ? 4 : c === 'terrain' ? 5 : c === 'inst' ? 6 : c === 'skin' ? 7 : curProg === 'grass' ? 8 : 9); BT[i] += t; BD[i]++;
    return o.apply(this, arguments); }; }
{ const u0 = GLP.useProgram, v0 = GLP.bindVertexArray; GLP.useProgram = function (p) { if (!progNames) { progNames = new Map(); for (const k in R.P) progNames.set(R.P[k].p, k); } curProg = progNames.get(p) || ''; return u0.apply(this, arguments); };
  GLP.bindVertexArray = function (v) { curVao = v; return v0.apply(this, arguments); }; }
for (const k of ['compileShader', 'linkProgram']) { const o = GLP[k]; if (!o) continue;
  GLP[k] = function () { const t = clock(); const r = o.apply(this, arguments); const ms = clock() - t; if (ms > 1) EV.push('셰이더 ' + ms.toFixed(0) + 'ms'); return r; }; }

// ---- meshes built or uploaded this frame
let inIdx = false;
for (const k of ['mesh', 'meshIdx']) { const o = R[k]; if (typeof o !== 'function') continue;
  R[k] = function () { const t = clock(); const was = inIdx; if (k === 'meshIdx') inIdx = true; try { return o.apply(this, arguments); } finally { inIdx = was; const ms = clock() - t; SEC.mesh = (SEC.mesh || 0) + ms; if (ms > 2) EV.push('메시 ' + ms.toFixed(0) + 'ms'); } }; }
{ const o = R.meshWelded; if (typeof o === 'function') R.meshWelded = function () { if (inIdx) return o.apply(this, arguments); const t = clock(); try { return o.apply(this, arguments); } finally { const ms = clock() - t; SEC.mesh = (SEC.mesh || 0) + ms; if (ms > 2) EV.push('업로드 ' + ms.toFixed(0) + 'ms'); } }; } // worker results (js/meshworker.js) arrive here
// R.render is "submit": pause "prep" while it runs
const render0 = R.render; R.render = function (S) { catUpdate(S); PM.e('prep'); PM.b('submit'); try { return render0.apply(this, arguments); } finally { PM.e('submit'); PM.b('prep'); } };
// story/cutscene starts
if (G.Cine && G.Cine.play) { const o = G.Cine.play; G.Cine.play = function () { EV.push('컷신 시작'); return o.apply(this, arguments); }; }
if (Game.go) { const o = Game.go; Game.go = function (id) { EV.push('단계 ' + id); return o.apply(this, arguments); }; }

// ---- the frame wrapper
const mem = performance.memory; let pmem = mem ? mem.usedJSHeapSize : 0, lastTs = 0;
const frame0 = Game.frame;
Game.frame = function (ts) {
  const iv = lastTs ? ts - lastTs : 0; lastTs = ts;
  for (const k in T0) T0[k] = undefined;
  const t0 = clock();
  try { return frame0.apply(this, arguments); } finally { done(iv, clock() - t0); }
};
function done(iv, work) {
  const anim = M.animMs || 0; M.animMs = 0; const mesh = SEC.mesh || 0;
  const inert = M.iStats ? M.iStats.ms : 0; if (M.iStats) { M.iStats.ms = 0; M.iStats.n = 0; }
  if (mem) { const c = mem.usedJSHeapSize; if (c >= pmem) alloc += c - pmem; else gcs++; pmem = c; }
  if (iv > 0 && iv < 1000 && !document.hidden) {
    ft[fn % N] = iv; fn++; tot.n++; win.n++;
    for (const t of [tot, win]) { t.work += work; t.anim += anim; t.mesh += mesh; t.inert += inert; t.draws += D.draws; t.tris += D.tris; for (const k of SECS) t.sec[k] = (t.sec[k] || 0) + (SEC[k] || 0); for (let i = 0; i < 10; i++) { t.bt[i] += BT[i]; t.bd[i] += BD[i]; } }
    if (D.draws > tot.maxDraws) tot.maxDraws = D.draws; if (D.tris > tot.maxTris) tot.maxTris = D.tris;
    if (iv > 33.4) { s33++; if (iv > 50) s50++;
      const js = work > iv * 0.6; if (js) over.js++; else over.ext++;
      const big = {}; for (const k of SECS) if (SEC[k] > 1.5) big[k] = +SEC[k].toFixed(1); if (anim > 1.5) big.anim = +anim.toFixed(1); if (mesh > 1.5) big.mesh = +mesh.toFixed(1);
      P.spikes.push({ at: +((clock() - since) / 1000).toFixed(1), ms: +iv.toFixed(1), work: +work.toFixed(1), cause: js ? 'JS' : 'GPU·브라우저', sec: big, ev: EV.slice(0, 6), draws: D.draws, step: Game.S && Game.S() && Game.S().step });
      if (P.spikes.length > 50) P.spikes.shift(); } }
  for (const k in SEC) SEC[k] = 0; EV = []; D.draws = 0; D.tris = 0; BT.fill(0); BD.fill(0);
  if (clock() - lastShow > 1000) show();
}

// ---- numbers
function pct() { const n = Math.min(fn, N); if (!n) return { avg: 0, med: 0, p99: 0, max: 0 }; const a = Array.prototype.slice.call(ft, 0, n).sort((x, y) => x - y); let s = 0; for (const v of a) s += v;
  return { avg: s / n, med: a[n >> 1], p99: a[Math.min(n - 1, Math.floor(n * 0.99))], max: a[n - 1] }; }
const mins = () => Math.max(0.05, (clock() - since) / 60000);
const f1 = v => v.toFixed(1);
P.report = function () { const p = pct(), n = Math.max(1, tot.n), sec = {}; for (const k of SECS) sec[k] = +((tot.sec[k] || 0) / n).toFixed(2);
  const S = Game.S && Game.S();
  return { 버전: 'v17.1 P11', 기기: navigator.userAgent, 화면: [innerWidth, innerHeight, devicePixelRatio], 품질: Game.dpr, 해상도배율: Game.perf && Game.perf.scale, 장면: S && S.step,
    측정초: +((clock() - since) / 1000).toFixed(0), 프레임수: tot.n, 평균ms: +p.avg.toFixed(2), 중앙ms: +p.med.toFixed(2), p99ms: +p.p99.toFixed(2), 최대ms: +p.max.toFixed(1),
    '33ms초과': s33, '50ms초과': s50, '33ms초과_분당': +(s33 / mins()).toFixed(2), '50ms초과_분당': +(s50 / mins()).toFixed(2), 튐원인: over,
    JS평균ms: +(tot.work / n).toFixed(2), 구간평균ms: sec, 애니메이션ms: +(tot.anim / n).toFixed(2), 메시ms: +(tot.mesh / n).toFixed(2), 관성ms: +(tot.inert / n).toFixed(3),
    삼각형분해K: Object.fromEntries(BK.map((k, i) => [k, Math.round(tot.bt[i] / n / 1000)])), 호출분해: Object.fromEntries(BK.map((k, i) => [k, +(tot.bd[i] / n).toFixed(1)])), 호출평균: Math.round(tot.draws / n), 호출최대: tot.maxDraws, 삼각형평균: Math.round(tot.tris / n), 삼각형최대: Math.round(tot.maxTris),
    힙MB: mem ? +(mem.usedJSHeapSize / 1048576).toFixed(1) : null, 할당MB_초: mem ? +(alloc / 1048576 / ((clock() - since) / 1000)).toFixed(2) : null, GC추정: mem ? gcs : null, 그림자갱신: R.shadowRate || 1, 시야배율: R.farK, 프레임설정: (() => { const P = Game.perf; return { 설정: Game.SET.fps || 'auto', 목표: Game.fpsTarget ? Game.fpsTarget() || '화면 주사율' : null, 자동고정: !!(P && P.autoLock), 배율: P && +P.scale.toFixed(2), p90ms: P && P.p90 ? +P.p90().toFixed(1) : null }; })(), 워커: Game.mw ? { 켬: Game.mw.ok, 완료: Game.mw.done, 평균ms: Game.mw.done ? +(Game.mw.ms / Game.mw.done).toFixed(0) : 0, 대기: Game.mw.pend.size, 실패: Game.mw.fail } : null, 튀는프레임: P.spikes }; };
window.__perfReport = P.report;

// ---- overlay
const el = document.createElement('div');
el.style.cssText = 'position:fixed;left:50%;top:4px;transform:translateX(-50%);z-index:99;font:10px/1.3 monospace;color:#fff;background:rgba(0,0,0,.66);padding:3px 6px;border-radius:6px;pointer-events:auto;white-space:pre;max-width:96vw;overflow:hidden';
const txt = document.createElement('div'), cv = document.createElement('canvas'); cv.width = 240; cv.height = 22; cv.style.cssText = 'display:block;width:120px;height:11px;margin-top:2px;image-rendering:pixelated';
el.appendChild(txt); el.appendChild(cv); const cx = cv.getContext('2d');
let lastShow = 0, pressT = 0, longDone = false;
el.onpointerdown = e => { e.stopPropagation(); longDone = false; pressT = setTimeout(() => { longDone = true; copy(JSON.stringify(P.report(), null, 1)); }, 700); };
el.onpointerup = e => { e.stopPropagation(); clearTimeout(pressT); if (!longDone) M.inertialOn = !M.inertialOn; };
function copy(s) { let ok = false; try { navigator.clipboard.writeText(s); ok = true; } catch (e) { } if (!ok) { try { const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (e) { } }
  txt.textContent = ok ? '보고서를 복사했어요' : '복사 실패 — 콘솔에서 __perfReport() 를 쓰세요'; lastShow = clock() - 700; }
function show() {
  lastShow = clock(); const p = pct(), n = Math.max(1, win.n);
  if (win.n) { const sec = {}; for (const k of SECS) sec[k] = (win.sec[k] || 0) / n; L = { work: win.work / n, anim: win.anim / n, mesh: win.mesh / n, inert: win.inert / n, draws: win.draws / n, tris: win.tris / n, sec, bt: Array.from(win.bt, v => v / n) }; }
  win = { n: 0, work: 0, anim: 0, mesh: 0, inert: 0, draws: 0, tris: 0, sec: {}, bt: new Float64Array(10), bd: new Float64Array(10) };
  let s = `${(1000 / (p.avg || 1)).toFixed(0)}fps ${f1(p.avg)}ms · 중앙 ${f1(p.med)} · p99 ${f1(p.p99)} · 최대 ${f1(p.max)}\n`;
  s += `33ms↑ ${(s33 / mins()).toFixed(1)}/분(${s33}) · 50ms↑ ${(s50 / mins()).toFixed(1)}/분(${s50}) · JS탓 ${over.js} 외부탓 ${over.ext}\n`;
  if (L) { s += `JS ${f1(L.work)}ms = ` + SECS.slice(0, 4).map(k => SECN[k] + ' ' + f1(L.sec[k])).join(' ') + '\n  ' + SECS.slice(4).map(k => SECN[k] + ' ' + f1(L.sec[k])).join(' ') + '\n';
    s += `  그중 애니 ${f1(L.anim)} · 메시 ${f1(L.mesh)} · 관성 ${L.inert.toFixed(3)}(${M.inertialOn ? '켬' : '끔'})\n`;
    s += `삼각형k 그림자: 건물 ${(L.bt[0] / 1000).toFixed(0)} 나무 ${(L.bt[1] / 1000).toFixed(0)} 사람 ${(L.bt[2] / 1000).toFixed(0)}\n  주: 건물 ${(L.bt[4] / 1000).toFixed(0)} 지형 ${(L.bt[5] / 1000).toFixed(0)} 나무 ${(L.bt[6] / 1000).toFixed(0)} 사람 ${(L.bt[7] / 1000).toFixed(0)} 풀 ${(L.bt[8] / 1000).toFixed(0)}\n`;
    s += `호출 ${Math.round(L.draws)} · 삼각형 ${(L.tris / 1000).toFixed(0)}k` + (mem ? ` · 힙 ${(mem.usedJSHeapSize / 1048576).toFixed(0)}MB +${(alloc / 1048576 / ((clock() - since) / 1000)).toFixed(1)}MB/s GC${gcs}` : '') + ` · ×${(Game.perf && Game.perf.scale || 1).toFixed(1)}\n`; }
  const sp = P.spikes[P.spikes.length - 1]; s += sp ? `최근 튐 ${sp.ms}ms @${sp.at}초 ${sp.cause} ${Object.keys(sp.sec).map(k => (SECN[k] || k) + sp.sec[k]).join(' ')} ${sp.ev.join(',')}` : '튄 프레임 아직 없음 (탭: 관성 · 길게: 복사)';
  txt.textContent = s;
  const w = Math.min(120, fn); cx.clearRect(0, 0, 240, 22); for (let i = 0; i < w; i++) { const v = ft[((fn - w + i) % N + N) % N], h = Math.max(1, Math.min(1, v / 50) * 22); cx.fillStyle = v <= 17.5 ? '#4c6' : v <= 34 ? '#ec4' : '#e44'; cx.fillRect(i * 2, 22 - h, 2, h); } }
document.body.appendChild(el);
})(window.G);
