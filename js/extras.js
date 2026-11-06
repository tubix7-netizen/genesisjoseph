/* 약속의 길 — 즐길 거리 열 가지 (v18.13e). Everything is kept in S.flags.ex.
   1 양치기 놀이 · 헤브론 양 우리 / 고센: six sheep shy away from Joseph; drive them all into the pen before time runs out.
   2 전설의 짐승 · five named animals (two in Canaan, three in Egypt), stronger and larger, a golden glint; each leaves a trophy.
   3 총리 관저 진열대 · trophies stand on a shelf by Joseph's house; 「모음집」 there shows everything collected.
   4 별자리 찾기 · at night a ✦ button: tap the stars of a constellation (묘성 · 삼성 · 북두 · 열한 별 · 아브라함의 별 세기).
   5 사진 부탁 · 그림 그리는 아이 티티 (Egypt) asks for five pictures; photo mode gets a 「찍기」 button that checks the frame.
   6 총리의 만찬 · every two days a guest comes to Joseph's house wanting a kind of dish.
   7 나일 강 계절 · 아케트(범람) · 페레트(씨뿌림) · 셰무(거둠), ten days each in Egypt: a card, a label, and where game gathers.
   8 수레 순찰 기록 · from the city well round the three granaries and back, against the clock (any way of travel).
   9 숨바꼭질 · 므낫세 hides somewhere round the house; a giggle when you are close.
   10 애굽 말 모으기 · talking to people in Egypt teaches a new word now and then; all twelve bring a blessing. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, C = G.Combat; if (!EP || !C) return;
const $ = id => document.getElementById(id), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), PI = Math.PI;
const S = () => Game.S(), P = () => Game.P, W = () => Game.W();
const X = G.Extras = {};
const F = () => { const s = S(); return s.flags.ex || (s.flags.ex = { tro: {}, stars: {}, photo: {}, words: {}, met: {}, hide: 0, host: 0 }); };
const idx = k => Game.stepOrder().indexOf(k), after = k => idx(S().step) >= idx(k), before = k => idx(S().step) < idx(k);
const canaan = () => after('p_road') && !after('c1_pit'), egypt = () => after('c5_patrol');
const free = () => Game.mode === 'play' && !G.UI.busy() && !(G.UI.modal && G.UI.modal()) && !(G.Cine && G.Cine.on) && !Game.cineOn;
const near = (x, z, r) => Math.hypot(P().x - x, P().z - z) < r;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const card = (kick, n, d, ic) => G.UI.featCard && G.UI.featCard('ex', { kick, n, ic: ic || 'star', d });
const toast = (m, full) => G.UI.toast(m, full === undefined ? true : full);
const giveAll = o => { for (const k in o || {}) if (Game.ITEMS[k]) Game.give(k, o[k], true); };
const H = (S2 => (S2.time % 24));
// a small timer line under the quest box, shared by the timed games
const hud = document.createElement('div'); hud.id = 'exHud'; hud.hidden = true; document.body.appendChild(hud);
const css = document.createElement('style'); css.textContent = `
#exHud{position:fixed;z-index:24;left:50%;top:calc(var(--gt) + 84px);transform:translateX(-50%);background:rgba(9,16,34,.88);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font:700 13px/1.2 system-ui,sans-serif;color:#f4e8cc;pointer-events:none;white-space:nowrap}
#starBtn{position:fixed;z-index:22;right:calc(var(--gr) + 2px);top:calc(var(--gt) + var(--mw) + 112px);width:46px;height:46px;border-radius:50%;border:1px solid rgba(160,190,255,.6);background:rgba(20,30,60,.85);color:#dfe8ff;font:700 20px/1 system-ui;box-shadow:0 0 12px rgba(120,160,255,.45)}
#starBtn small{display:block;font-size:9px;font-weight:600;margin-top:1px}
body.cine #starBtn,body.photo #starBtn{display:none}
.exv .p-body{display:flex;flex-direction:column;gap:8px}.exv .grp b{display:block;font-size:13px;color:var(--gold);margin:6px 0 3px}.exv .grp span{display:inline-block;font-size:12.5px;margin:2px 6px 2px 0;padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.06)}.exv .grp span.on{background:rgba(229,181,82,.22);color:#ffe9a8}
#starUI{position:fixed;inset:0;z-index:200;background:#03050d;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#e8eeff;font-family:system-ui,sans-serif}
#starUI canvas{border-radius:14px;touch-action:none;background:radial-gradient(ellipse at 50% 30%,#1a2550,#05070f 75%)}#starUI .t{font-weight:700;font-size:16px}#starUI .s{font-size:12.5px;opacity:.8;text-align:center;max-width:300px}
#starUI .row{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:320px}#starUI .row button{font-size:12px;padding:5px 9px;border-radius:8px;border:1px solid #5a6a9a;background:#141c38;color:#dfe8ff}#starUI .row button.on{background:#3a4a8a}#starUI .row button.got{border-color:#e5b552}
#photoFlash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:70;transition:opacity .35s}`;
document.head.appendChild(css);
const ctx = []; Game.CTX = Game.CTX || []; Game.CTX.push(() => ctx.filter(c => c.on()).map(c => ({ d: Math.hypot(c.x - P().x, c.z - P().z) - 1.2, label: typeof c.label === 'function' ? c.label() : c.label, x: c.x, z: c.z, y: 1.6, use: c.use, key: 'ex:' + c.id })).filter(c => c.d < 1.6));
const spot = (id, x, z, label, on, use, o) => ctx.push(Object.assign({ id, x, z, label, on, use, sign: true }, o || {}));
/* v18.14 every challenge spot is marked: a wooden signpost with a painted board (and some have a keeper standing by), so nothing waits on bare ground */
const SIGN = {}; let signMesh = null;
const prevDynS = EP.dyn; EP.dyn = function (list) { if (prevDynS) prevDynS.apply(this, arguments); try { if (Game.mode !== 'play') return; const w = W();
  for (const c of ctx) { if (!c.sign || Math.hypot(c.x - P().x, c.z - P().z) > 70 || !c.on()) continue;
    if (!signMesh) { const g = new G.GB(41); g.cyl(0.06, 0.07, 1.7, 6, { at: [0, 0.85, 0], c: 0x7a5a3a }); g.box(0.9, 0.5, 0.06, { at: [0, 1.45, 0.05], c: 0xc8a068 }); g.box(0.96, 0.06, 0.09, { at: [0, 1.73, 0.05], c: 0x7a5a3a }); g.box(0.96, 0.06, 0.09, { at: [0, 1.17, 0.05], c: 0x7a5a3a });
      for (let i = 0; i < 3; i++) g.box(0.55 - i * 0.12, 0.035, 0.07, { at: [0, 1.56 - i * 0.11, 0.06], c: 0x5a3a24 }); g.sph(0.08, 6, 4, { at: [0.33, 1.6, 0.08], c: 0xe5b552 }); signMesh = G.R.mesh(g); }
    const sx = c.x + (c.sx || 0.9), sz = c.z + (c.sz || 0), m = SIGN[c.id] || (SIGN[c.id] = G.m4()); G.m4trs(m, sx, w.heightAt(sx, sz), sz, Math.atan2(P().x - sx, P().z - sz) * 0 + (c.sry || 0), 0, 0, 1, 1, 1); list.push({ mesh: signMesh, m, outline: true }); } } catch (e) { } };

// =================================================================== 1 양치기 놀이
C.WILD.sheep = C.WILD.sheep || { n: '양', hp: 9999, speed: 12, flee: 0, beh: 'herd', loot: {}, xp: 0 }; // 'herd': no flee of its own; herdTick steers each sheep (wander toward a point, speed × 0.18)
const PENS = [{ id: 'heb', x: 192, z: 171, n: '헤브론 양 우리', on: () => !after('c1_pit') && after('p_wake') }, { id: 'gos', x: 86, z: 66, n: '고센 양 우리', on: () => after('j_end') }];
const herd = X.herd = { on: null };
function herdStart(pen) { const w = W(), list = []; let tries = 0;
  while (list.length < 6 && tries++ < 80) { const a = Math.random() * PI * 2, r = 10 + Math.random() * 7, x = pen.x + Math.cos(a) * r, z = pen.z + Math.sin(a) * r;
    if (w.water && w.heightAt(x, z) < w.water.level + 0.2) continue; if (w.slopeAt && w.slopeAt(x, z) > 0.4) continue;
    const sh = C.spawn('sheep', x, z, { special: true, name: '양' }); sh.d = Object.assign({}, C.WILD.sheep); list.push(sh); }
  herd.on = { pen, list, t: 0, dur: 120, ok: 0 }; sfx('bleat'); toast('양 떼를 우리(빛나는 원) 안으로 몰아요 · 양은 요셉을 피해 반대쪽으로 걸어가요'); }
function herdEnd(win) { const h = herd.on; if (!h) return; herd.on = null; hud.hidden = true; const L = C.wild();
  for (const a of h.list) { const i = L.indexOf(a); if (i >= 0) L.splice(i, 1); }
  if (!win) { toast('시간이 다 됐어요 · 양들이 흩어졌어요. 다시 해 볼까요?'); return; }
  const f = F(), first = !f.herdBest, t = Math.round(h.t); f.herdBest = Math.min(f.herdBest || 999, t); f.herdN = (f.herdN || 0) + 1;
  giveAll({ wool: 2, milk: 1 }); if (first) setTimeout(() => Game.insight(1, '목자의 일'), 500);
  sfx('quest'); card('양치기 놀이', `${t}초 만에 다 몰았어요!`, `최고 기록 ${f.herdBest}초 · 양털 2 · 염소젖 1${first ? ' · 깨달음' : ''}`, 'star'); }
function herdTick(dt) { const h = herd.on; if (!h) return; h.t += dt; const { pen } = h; let inside = 0;
  let cx = 0, cz = 0; for (const a of h.list) { cx += a.x / h.list.length; cz += a.z / h.list.length; }
  for (const a of h.list) { const d = Math.hypot(a.x - pen.x, a.z - pen.z), px = a.x - P().x, pz = a.z - P().z, dp = Math.hypot(px, pz) || 1; a.alert = -99; a.st = 'wander'; a.t = 1;
    if (d < 4.5) { inside++; a.tx = a.x; a.tz = a.z; a.d.speed = 0; if (d > 4.2) { a.x = pen.x + (a.x - pen.x) * 4.2 / d; a.z = pen.z + (a.z - pen.z) * 4.2 / d; } continue; }
    if (dp < 7) { let vx = px / dp * 3 + (cx - a.x) * 0.15, vz = pz / dp * 3 + (cz - a.z) * 0.15; const vl = Math.hypot(vx, vz) || 1; a.tx = a.x + vx / vl * 3; a.tz = a.z + vz / vl * 3; a.d.speed = (1.6 + (7 - dp) * 0.45) / 0.18; } // step away from Joseph, keeping near the flock
    else { a.tx = a.x; a.tz = a.z; a.d.speed = 0; } }
  if (Math.random() < dt * 1.5) G.FX.burst(pen.x + (Math.random() - 0.5) * 9, W().heightAt(pen.x, pen.z) + 0.15, pen.z + (Math.random() - 0.5) * 9, 1, { c: [1, 0.9, 0.55], sp: 0.05, up: 0.4, g: -0.1, life: 1.4, size: 0.18 });
  hud.hidden = false; hud.textContent = `양 몰기 · 우리 안 ${inside}/6 · 남은 시간 ${Math.max(0, Math.ceil(h.dur - h.t))}초`;
  h.ok = inside === h.list.length ? h.ok + dt : 0; if (h.ok > 1.2) herdEnd(true); else if (h.t > h.dur) herdEnd(false); }
for (const pen of PENS) spot('herd_' + pen.id, pen.x - 6.5, pen.z, () => `양 떼 몰기${F().herdBest ? ` · 최고 ${F().herdBest}초` : ''}`, () => pen.on() && !herd.on && !X.busy(), () => herdStart(pen));

// =================================================================== 2 전설의 짐승 (+ trophies)
const LEG = X.LEG = [
  { id: 'ibex', sp: 'ibex', x: 206, z: -104, n: '도단 언덕의 늙은 아이벡스', where: '도단 북쪽 언덕', era: canaan, hp: 3, sc: 1.25, tr: 'trIbex', trn: '늙은 아이벡스의 굽은 뿔', rare: { horn: 2, r_ibexHorn: 1 } },
  { id: 'boar', sp: 'boar', x: 224, z: 14, n: '세겜 숲의 외눈 멧돼지', where: '세겜 동쪽 숲', era: canaan, hp: 3, sc: 1.3, tr: 'trBoar', trn: '외눈 멧돼지의 큰 엄니', rare: { tusk: 2, r_boarTusk: 1 } },
  { id: 'goose', sp: 'goose', x: -82, z: -128, n: '갈대밭의 흰 거위', where: '나일 강가 갈대밭', era: egypt, hp: 4, sc: 1.4, tr: 'trGoose', trn: '흰 거위의 긴 깃털', rare: { feather: 6, goose: 2 } },
  { id: 'oryx', sp: 'oryx', x: 54, z: -34, n: '바람을 가르는 오릭스', where: '애굽 동쪽 들', era: egypt, hp: 3, sc: 1.2, tr: 'trOryx', trn: '바람 오릭스의 긴 뿔', rare: { horn: 3, sinew: 2 } },
  { id: 'ostrich', sp: 'ostrich', x: 100, z: 110, n: '사막의 검은 타조', where: '고센 남쪽 사막', era: egypt, hp: 3, sc: 1.25, tr: 'trOstrich', trn: '검은 타조의 큰 알 껍질', rare: { ostrichEgg: 2, feather: 6 } } ];
for (const L of LEG) Game.ITEMS[L.tr] = Game.ITEMS[L.tr] || { n: L.trn, cat: 'trophy', p: 80, ic: 'horn', c: '#e8c870' };
const legOn = {};
function legTick() { const f = F(); for (const L of LEG) { if (f.tro[L.id]) continue; let a = legOn[L.id];
  if (a && C.wild().indexOf(a) < 0) a = legOn[L.id] = null;
  if (!a) { if (L.era() && near(L.x, L.z, 70) && !(L.id === 'goose' && X.season() === 2)) { a = legOn[L.id] = C.spawn(L.sp, L.x, L.z, { special: true, name: L.n, hpMul: L.hp, scale: L.sc }); a.legend = L.id;
      if (!(f.legSeen || (f.legSeen = {}))[L.id]) { f.legSeen[L.id] = 1; toast(`전설의 짐승이 근처에 있어요 · 「${L.n}」`); sfx('quest', { pitch: 0.8 }); } } continue; }
  if (a.st === 'dead') { f.tro[L.id] = 1; legOn[L.id] = null; Game.give(L.tr, 1, true); giveAll(L.rare); Game.addXP && Game.addXP(40); sfx('levelup');
    card('전설의 짐승', L.n, `전리품 「${L.trn}」 · 총리 관저 진열대에 놓을 수 있어요`, 'star'); continue; }
  if (!near(a.x, a.z, 170)) { const i = C.wild().indexOf(a); if (i >= 0) C.wild().splice(i, 1); legOn[L.id] = null; continue; }
  if (near(a.x, a.z, 55)) G.FX.burst(a.x, a.y + 1.2 * a.scale, a.z, 2, { c: [1, 0.85, 0.35], sp: 0.4, up: 0.9, g: -0.2, life: 1.2, size: 0.1 }); } }

// =================================================================== 3 총리 관저 진열대 + 모음집
const HOUSE = (EP.spots && EP.spots.josephHouse) || [10, -140], SH = X.SH = [HOUSE[0] + 5.5, HOUSE[1] + 4.5];
const MESH = {}, M4 = {}; const mk = (k, fn) => MESH[k] || (MESH[k] = (() => { const g = new G.GB(k.length * 5 + 7); fn(g); return G.R.mesh(g); })());
const TRM = { trIbex: g => { for (const s of [1, -1]) for (let i = 0; i < 5; i++) { const a = i * 0.32; g.cyl(0.035 - i * 0.005, 0.03 - i * 0.005, 0.14, 5, { at: [0.08 * s, 0.1 + Math.sin(a) * 0.3, -(1 - Math.cos(a)) * 0.3], rx: -a, c: 0x8a7a5a }); } },
  trBoar: g => { for (const s of [1, -1]) g.cyl(0.006, 0.03, 0.32, 6, { at: [0.06 * s, 0.16, 0], rz: 0.4 * s, c: 0xf4ecd8 }); },
  trGoose: g => { for (let i = 0; i < 5; i++) g.sph(1, 6, 3, { at: [(i - 2) * 0.05, 0.25, 0], s: [0.02, 0.24, 0.05], rz: (i - 2) * 0.18, c: 0xf8f4ec }); },
  trOryx: g => { for (const s of [1, -1]) g.cyl(0.006, 0.025, 0.7, 5, { at: [0, 0.04 + (s > 0 ? 0 : 0.05), 0.06 * s], rz: PI / 2, c: 0x2a2420 }); }, // laid flat on the low shelf
  trOstrich: g => { g.sph(1, 10, 8, { at: [0, 0.16, 0], s: [0.12, 0.15, 0.12], c: 0xf4eedc }); } };
const BASE = [0x8a6a48, 0x7a5a3a];
const prevDyn = EP.dyn;
EP.dyn = function (list, S2, Gm, t) { if (prevDyn) prevDyn.apply(this, arguments); if (!egypt()) return;
  if (Math.hypot(P().x - SH[0], P().z - SH[1]) > 60) return; const w = W(), y = w.heightAt(SH[0], SH[1]);
  list.push({ mesh: mk('exShelf', g => { g.box(2.6, 0.08, 0.6, { at: [0, 0.9, 0], c: BASE[0] }); g.box(2.6, 0.08, 0.6, { at: [0, 0.3, 0], c: BASE[0] }); for (const x of [-1.25, 1.25]) g.box(0.08, 1.4, 0.6, { at: [x, 0.7, 0], c: BASE[1] }); g.box(2.6, 0.06, 0.06, { at: [0, 1.38, -0.27], c: BASE[1] }); }),
    m: G.m4trs(M4.sh || (M4.sh = G.m4()), SH[0], y, SH[1], 0), outline: true });
  LEG.forEach((L, i) => { if (!F().tro[L.id] && !Game.inv(L.tr)) return; const x = SH[0] - 1 + (i % 3) * 1.0, yy = y + (i < 3 ? 0.94 : 0.34);
    list.push({ mesh: mk('tr' + L.id, TRM[L.tr]), m: G.m4trs(M4[L.id] || (M4[L.id] = G.m4()), x + (i >= 3 ? 0.5 : 0), yy, SH[1], 0), outline: true }); }); };
function viewer() { const f = F(), el = document.createElement('div'); el.className = 'overlay sheet exv';
  const chip = (on, t) => `<span class="${on ? 'on' : ''}">${on ? '✓ ' : ''}${esc(t)}</span>`, words = Object.keys(f.words).length;
  const sec = (t, inner) => `<div class="grp"><b>${t}</b>${inner}</div>`;
  el.innerHTML = `<div class="panel"><div class="p-head"><h3>요셉의 모음집</h3><button class="p-x">닫기</button></div><div class="p-body">
    ${sec(`전설의 짐승 ${LEG.filter(L => f.tro[L.id]).length}/${LEG.length}`, LEG.map(L => chip(f.tro[L.id], f.tro[L.id] ? L.trn : `??? · 소문: ${L.where}`)).join(''))}
    ${sec(`별자리 ${Object.keys(f.stars).length}/${CONS.length}`, CONS.map(c => chip(f.stars[c.id], f.stars[c.id] ? c.n : '???')).join(''))}
    ${sec(`티티의 그림 ${Object.keys(f.photo).length}/${PHOTO.length}`, PHOTO.map(p => chip(f.photo[p.id], p.n)).join(''))}
    ${sec(`옛 애굽 말 ${words}/${WORDS.length}`, WORDS.map(w => chip(f.words[w[0]], f.words[w[0]] ? `${w[0]} = ${w[1]}` : '???')).join(''))}
    ${sec('기록', [`양 몰기 최고 ${f.herdBest ? f.herdBest + '초' : '—'}`, `순찰 최고 ${f.patrolBest ? f.patrolBest + '초' : '—'}`, `만찬 대접 ${f.host || 0}번`, `숨바꼭질 찾음 ${f.hide || 0}번`].map(t => `<span>${t}</span>`).join(''))}
  </div></div>`;
  document.body.appendChild(el); G.UI.setBusy('exv', true); sfx('page');
  const close = () => { el.remove(); G.UI.setBusy('exv', false); }; el.querySelector('.p-x').onclick = close; el.onclick = e => { if (e.target === el) close(); }; }
X.viewer = viewer;
spot('shelf', SH[0], SH[1] + 1.2, '진열대 · 모음집 보기', () => egypt() && !X.busy(), viewer, { sign: false });

// =================================================================== 4 별자리 찾기
const CONS = X.CONS = [
  { id: 'pleiades', n: '묘성 (일곱 별)', ref: '네가 묘성을 매어 묶을 수 있으며 (욥 38:31)', pts: [[0, 0], [0.12, -0.05], [0.22, 0.04], [0.08, 0.12], [0.2, 0.17], [-0.06, 0.1], [0.3, -0.06]] },
  { id: 'orion', n: '삼성 (사냥꾼)', ref: '묘성과 삼성을 만드시며 (암 5:8)', pts: [[-0.3, -0.45], [0.3, -0.42], [-0.08, 0], [0, -0.02], [0.08, -0.04], [-0.28, 0.42], [0.3, 0.45]], lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]] },
  { id: 'bear', n: '북두 (일곱 별)', ref: '북두성과 삼성과 묘성과 남방의 밀실을 만드셨으며 (욥 9:9)', pts: [[-0.45, -0.1], [-0.28, -0.05], [-0.12, 0], [0.04, 0.02], [0.08, 0.2], [0.34, 0.24], [0.36, 0.04]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  { id: 'eleven', n: '열한 별', ref: '해와 달과 열한 별이 내게 절하더이다 (창 37:9)', pts: Array.from({ length: 11 }, (_, i) => { const a = PI * 1.1 + i / 10 * PI * 0.8; return [Math.cos(a) * 0.45, Math.sin(a) * 0.45 + 0.25]; }) },
  { id: 'abraham', n: '아브라함의 별 세기', ref: '하늘을 우러러 뭇별을 셀 수 있나 보라 … 네 자손이 이와 같으리라 (창 15:5)', count: 25 } ];
const sbtn = document.createElement('button'); sbtn.id = 'starBtn'; sbtn.hidden = true; sbtn.innerHTML = '✦<small>별자리</small>'; document.body.appendChild(sbtn);
const night = () => { const h = H(S()); return h > 19.6 || h < 4.8; };
sbtn.onclick = e => { e.stopPropagation(); starOpen(); };
function starOpen() { const f = F(); let cur = CONS.find(c => !f.stars[c.id]) || CONS[0];
  const el = document.createElement('div'); el.id = 'starUI'; document.body.appendChild(el); G.UI.setBusy('stars', true);
  const Wc = Math.min(320, innerWidth - 32), Hc = Math.round(Wc * 1.1);
  el.innerHTML = `<div class="t"></div><canvas width="${Wc * 2}" height="${Hc * 2}" style="width:${Wc}px;height:${Hc}px"></canvas><div class="s"></div><div class="row"></div><div class="row"><button id="starX">돌아가기</button></div>`;
  const cv = el.querySelector('canvas'), c2 = cv.getContext('2d'), rnd = G.rng ? G.rng(Math.floor(Math.random() * 1e6)) : Math.random;
  const bg = Array.from({ length: 140 }, () => [rnd() * Wc, rnd() * Hc, 0.3 + rnd() * 1.1, rnd() * 6]);
  let st = null, T0 = performance.now(), raf = 0, done = false;
  function setup(c) { cur = c; done = false; const cx = Wc / 2 + (rnd() - 0.5) * Wc * 0.15, cy = Hc / 2 + (rnd() - 0.5) * Hc * 0.1, sc = Wc * 0.62, rot = (rnd() - 0.5) * 0.6, cs = Math.cos(rot), sn = Math.sin(rot);
    st = c.count ? { pts: Array.from({ length: 36 }, () => [24 + rnd() * (Wc - 48), 24 + rnd() * (Hc - 48)]), hit: [], t: 25 } : { pts: c.pts.map(([x, y]) => [cx + (x * cs - y * sn) * sc, cy + (x * sn + y * cs) * sc]), hit: [] };
    el.querySelector('.t').textContent = c.n; el.querySelector('.s').textContent = c.count ? `25초 안에 별 ${c.count}개를 세어 보세요 (밝은 별을 눌러요)` : `밝게 빛나는 별 ${c.pts.length}개를 모두 찾아 눌러요`; T0 = performance.now();
    el.querySelector('.row').innerHTML = CONS.map(k => `<button data-c="${k.id}" class="${k === c ? 'on' : ''} ${f.stars[k.id] ? 'got' : ''}">${f.stars[k.id] ? '✓ ' : ''}${k.n.split(' (')[0]}</button>`).join(''); }
  setup(cur);
  el.querySelector('.row').onclick = e => { const b = e.target.closest('[data-c]'); if (b) { sfx('click'); setup(CONS.find(k => k.id === b.dataset.c)); } };
  el.querySelector('#starX').onclick = () => close();
  cv.onpointerdown = e => { if (done) return; const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let bi = -1, bd = 26;
    st.pts.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd && !st.hit.includes(i)) { bd = d; bi = i; } });
    if (bi < 0) { sfx('click', { pitch: 0.6, vol: 0.4 }); return; } st.hit.push(bi); sfx('blip', { pitch: 1 + st.hit.length * 0.05 });
    const need = cur.count || st.pts.length; if (st.hit.length >= need) win(); };
  function win() { done = true; const first = !f.stars[cur.id]; f.stars[cur.id] = 1; sfx('quest');
    if (first) { const V = G.Vitals; if (V && V.mindGain) V.mindGain(30); setTimeout(() => Game.insight(1, '별자리'), 400); }
    el.querySelector('.s').textContent = cur.ref + (first ? ' · 정신력 +30 · 깨달음' : '');
    if (CONS.every(k => f.stars[k.id]) && first) setTimeout(() => card('별자리', '하늘의 별을 모두 찾았어요', '「네 자손이 하늘의 별과 같으리라」 — 아브라함의 약속', 'star'), 900);
    setTimeout(() => { const nx = CONS.find(k => !f.stars[k.id]); if (nx && el.isConnected) setup(nx); else if (el.isConnected) setup(cur); }, 2600); }
  function draw() { const t = (performance.now() - T0) / 1000; c2.setTransform(2, 0, 0, 2, 0, 0); c2.clearRect(0, 0, Wc, Hc);
    for (const [x, y, s, p] of bg) { c2.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.3 + p); c2.fillStyle = '#cfd8ff'; c2.beginPath(); c2.arc(x, y, s, 0, 7); c2.fill(); }
    c2.globalAlpha = 1;
    if (cur.lines && done) { c2.strokeStyle = 'rgba(229,181,82,.8)'; c2.lineWidth = 1.5; c2.beginPath(); for (const [a, b] of cur.lines) { c2.moveTo(...st.pts[a]); c2.lineTo(...st.pts[b]); } c2.stroke(); }
    else if (!cur.count && done) { c2.strokeStyle = 'rgba(229,181,82,.8)'; c2.beginPath(); st.pts.forEach((p, i) => i ? c2.lineTo(...p) : c2.moveTo(...p)); c2.stroke(); }
    st.pts.forEach((p, i) => { const hit = st.hit.includes(i), tw = 0.8 + 0.2 * Math.sin(t * 2.4 + i); c2.fillStyle = hit ? '#ffd27a' : '#f4f6ff'; c2.shadowColor = hit ? '#ffb840' : '#9fb4ff'; c2.shadowBlur = hit ? 14 : 8;
      c2.beginPath(); c2.arc(p[0], p[1], (hit ? 3.6 : 2.6) * tw, 0, 7); c2.fill(); c2.shadowBlur = 0; });
    if (cur.count && !done) { const left = Math.max(0, st.t - t); c2.fillStyle = '#dfe8ff'; c2.font = '700 14px system-ui'; c2.fillText(`${st.hit.length} / ${cur.count} · ${Math.ceil(left)}초`, 12, 22);
      if (left <= 0) { done = true; el.querySelector('.s').textContent = '다 세지 못했어요… 그래도 셀 수 없이 많지요. 다시 해 볼까요?'; setTimeout(() => el.isConnected && setup(cur), 2200); } }
    raf = requestAnimationFrame(draw); }
  draw();
  function close() { cancelAnimationFrame(raf); el.remove(); G.UI.setBusy('stars', false); } }

// =================================================================== 5 사진 부탁 (그림 그리는 아이 티티)
const PHOTO = X.PHOTO = [
  { id: 'goose', n: '나일 거위', at: () => ({ x: -76, z: -122 }), ok: () => C.wild().some(a => a.sp === 'goose' && a.st !== 'dead' && seen(a.x, a.y + 0.5, a.z, 30)) },
  { id: 'pyramid', n: '피라미드', at: () => ({ x: -170, z: -170 }), ok: () => seen(-205, 12, -175, 140) || seen(-178, 9, -214, 120) },
  { id: 'sunset', n: '해 질 녘 나일 강', at: () => ({ x: -86, z: -60 }), ok: () => { const h = H(S()); return h > 17.2 && h < 19.6 && EP.waterDist && EP.waterDist(P().x, P().z) < 24; } },
  { id: 'ostrich', n: '타조', at: () => ({ x: 96, z: 104 }), ok: () => C.wild().some(a => a.sp === 'ostrich' && a.st !== 'dead' && seen(a.x, a.y + 1.4, a.z, 40)) },
  { id: 'granary', n: '곡식 가득한 곳간', at: () => ({ x: 16, z: -70 }), ok: () => seen(16, 3, -64, 45) } ];
function seen(x, y, z, maxD) { const cam = Game.CAM; if (Math.hypot(cam.x - x, cam.z - z) > maxD) return false; const q = G.R.project(x, y, z, innerWidth, innerHeight); return !!q && q[0] > innerWidth * 0.1 && q[0] < innerWidth * 0.9 && q[1] > innerHeight * 0.1 && q[1] < innerHeight * 0.9; }
const QS = EP.quests || (EP.quests = {});
QS.x_photo = { giver: 'painter', title: '티티의 그림 공책', when: () => egypt(),
  offer: ['총리님! 저는 그림 그리는 걸 좋아해요. 근데 멀리 못 가요… 대신 보고 와 주실래요? 사진 모드에서 「찍기」를 누르면 제가 그대로 그릴게요!'],
  obj: PHOTO.map(p => ({ t: `${p.n} 찍기`, ok: () => !!F().photo[p.id] })), loc: () => { const p = PHOTO.find(q => !F().photo[q.id]); return p ? p.at() : null; },
  prog: '사진 모드(동작 → 돌보기 → 사진 모드)에서 「찍기」를 눌러 주세요!', done: ['우와… 피라미드가 이렇게 커요? 거위는 이렇게 생겼구나! 평생 간직할게요, 총리님!'],
  reward: { silver: 20, items: { linen: 1 }, xp: 30, insight: 1 } };
const flash = document.createElement('div'); flash.id = 'photoFlash'; document.body.appendChild(flash);
X.snap = function () { flash.style.opacity = 0.85; setTimeout(() => flash.style.opacity = 0, 90); sfx('click', { pitch: 1.6 });
  const f = F(); if (!(S().side && S().side.act && S().side.act.x_photo)) { toast('찰칵! · 멋진 장면이에요'); return; }
  const got = PHOTO.filter(p => !f.photo[p.id] && p.ok()); if (!got.length) { toast('찰칵! · 티티가 부탁한 장면은 아니에요 · 대상이 화면 가운데 오게 찍어요'); return; }
  for (const p of got) f.photo[p.id] = 1; Game.silver && Game.silver(3); toast(`찰칵! · 「${got.map(p => p.n).join(', ')}」 · 티티의 그림 공책 ${Object.keys(f.photo).length}/${PHOTO.length}`); G.UI.quest(); };
if (G.Acts && G.Acts.photo) { const ph0 = G.Acts.photo; G.Acts.photo = function (on) { const r = ph0.apply(this, arguments); const bar = $('photoBar');
  if (on && bar && !$('photoSnap')) { const b = document.createElement('button'); b.className = 'sbtn'; b.id = 'photoSnap'; b.textContent = '찍기'; b.onclick = e => { e.stopPropagation(); X.snap(); }; bar.insertBefore(b, bar.querySelector('button')); } return r; }; }

// =================================================================== 6 총리의 만찬 손님맞이
const CU = G.Cuisine, HH = G.Hearth, cls = k => (CU && CU.CLS[k] ? CU.CLS[k][0] : 'mixed'), tier = k => (CU && CU.CLS[k] ? CU.CLS[k][1] : 1);
const GUESTS = [
  { n: '이스마엘 대상의 상인', line: '먼 길을 오느라 배가 고프오. 들짐승 고기 요리가 있으면 좋겠소만.', want: '고기 요리', ok: k => cls(k) === 'meat' },
  { n: '온의 제사장', line: '오늘은 고기를 먹지 않는 날이라오. 곡식이나 채소로 만든 요리면 고맙겠소.', want: '고기 없는 요리', ok: k => ['grain', 'veg', 'bean', 'milk', 'drink', 'sweet'].includes(cls(k)) },
  { n: '나일의 늙은 어부', line: '평생 생선만 잡았지만, 남이 구워 준 생선은 처음이라오.', want: '생선 요리', ok: k => cls(k) === 'fish' },
  { n: '궁정의 아이들', line: '총리님, 달콤한 거 있어요? 꿀이나 과자요!', want: '단것', ok: k => cls(k) === 'sweet' },
  { n: '먼 나라의 사신', line: '애굽 총리의 식탁이 어떤지 우리 왕께 전해야 하오. 가장 공들인 요리를 보여 주시오.', want: '3단계 이상 요리', ok: k => tier(k) >= 3 },
  { n: '왕의 사냥꾼 세넵', line: '나으리, 요즘 무엇을 잡으셨습니까? 새로 잡은 짐승 요리가 궁금합니다.', want: '새 사냥감 요리', ok: k => !!(G.Hunt && G.Hunt.NEW && G.Hunt.NEW[k]) } ];
function host() { const s = S(), f = F(), gi = (s.day * 7 + (f.host || 0)) % GUESTS.length, g = GUESTS[gi];
  const dishes = HH ? HH.ALL.filter(k => Game.inv(k) > 0).sort((a, b) => (g.ok(b) - g.ok(a)) || (tier(b) - tier(a))).slice(0, 4) : [];
  const serve = k => { Game.take(k, 1); f.host = (f.host || 0) + 1; f.hostDay = s.day; const good = g.ok(k), t = tier(k), n = Game.ITEMS[k].n;
    if (good) { Game.silver(12 + t * 6); if (t >= 3 && Math.random() < 0.4) setTimeout(() => Game.insight(1, '만찬'), 400); }
    else Game.silver(4);
    G.UI.say([{ n: g.n, t: good ? `「${n}」! 바로 이걸 먹고 싶었소. 총리님의 식탁에는 복이 넘치는구려.` : `「${n}」… 원하던 건 아니지만, 정성이 고맙소.` },
      { n: '', t: good ? `손님이 크게 기뻐했어요 · 은 ${12 + t * 6}` : '손님이 고맙게 먹고 갔어요 · 은 4' }], () => G.UI.hud()); };
  const ch = dishes.map(k => ({ t: `${Game.ITEMS[k].n}${g.ok(k) ? ' ★' : ''}`, then: () => setTimeout(() => serve(k), 30) }));
  ch.push({ t: '다음에 대접하기', then: () => {} });
  G.UI.say([{ n: g.n, t: g.line }, { n: '요셉', t: dishes.length ? `(${g.want}을 원해요. ★ 표시가 맞는 요리예요)` : '(가방에 요리가 없어요. 모닥불에서 만들어 오세요)', choices: ch }]); }
spot('host', HOUSE[0] - 4.5, HOUSE[1] + 4.5, () => `만찬 손님 맞기 · ${GUESTS[(S().day * 7 + (F().host || 0)) % GUESTS.length].n}`, () => egypt() && !X.busy() && S().step !== 'g3_feast' && !(F().hostDay !== undefined && S().day - F().hostDay < 2), host);

// =================================================================== 7 나일 강 계절
const SEASONS = [['아케트 · 범람', '나일 강이 불어 밭을 덮어요. 갈대밭에 거위가 많아지고, 들짐승은 높은 곳으로 올라가요.', [6, 2]], ['페레트 · 씨뿌림', '물이 빠진 검은 흙에 씨를 뿌려요. 들에 짐승이 많아져요.', [4, 3]], ['셰무 · 거둠', '곡식을 거두는 뜨거운 철이에요. 거위는 떠나고, 사막에 타조와 오릭스가 많아져요.', [1, 5]]];
X.season = () => (G.Nile && G.Nile.season ? ({ akhet: 0, peret: 1, shemu: 2 })[G.Nile.season(S()).k] : Math.floor(((S().day || 1) - 1) / 10) % 3); /* v18.34 one calendar: the Nile's (nile.js) — the 10-day seasons disagreed with the clock */
function seasonTick() { if (!egypt()) return; const s = X.season(), z = EP.wildZones || [], m = z.find(q => q.id === 'eMarsh'), d = z.find(q => q.id === 'eDesert');
  if (m) m.max = SEASONS[s][2][0]; if (d) d.max = SEASONS[s][2][1];
  const f = F(); if (f.season !== s) { f.season = s; card('나일 강의 계절', SEASONS[s][0], SEASONS[s][1], 'sun'); }
  const ck = $('clock'); if (ck && !ck.querySelector('.exSeason')) { const sp = document.createElement('span'); sp.className = 'exSeason'; sp.style.cssText = 'margin-left:6px;opacity:.75;font-size:.85em'; sp.textContent = SEASONS[s][0].split(' · ')[1]; ck.appendChild(sp); } }

// =================================================================== 8 수레 순찰 기록
const ROUTE = [{ n: '서쪽 마을 곳간', x: -152, z: -24 }, { n: '남쪽 마을 곳간', x: -158, z: 144 }, { n: '성읍 곳간', x: 16, z: -70 }, { n: '성읍 우물 (도착)', x: -21, z: -86.8 }];
const pat = X.patrol = { on: null };
function patrolStart() { pat.on = { i: 0, t: 0 }; S().wp = { x: ROUTE[0].x, z: ROUTE[0].z, n: ROUTE[0].n }; sfx('quest', { pitch: 1.3 }); toast('순찰 시작! · 빨간 표시를 따라 곳간 세 곳을 돌고 우물로 돌아와요 · 나귀나 수레를 타도 돼요'); }
function patrolTick(dt) { const o = pat.on; if (!o) return; o.t += dt; const r = ROUTE[o.i];
  if (near(r.x, r.z, 7.5)) { o.i++; sfx('coin'); if (o.i >= ROUTE.length) { pat.on = null; hud.hidden = true; S().wp = null; const f = F(), t = Math.round(o.t), first = !f.patrolBest; f.patrolBest = Math.min(f.patrolBest || 9999, t);
      const medal = t < 130 ? ['금빛', 30] : t < 200 ? ['은빛', 15] : ['수고의', 5]; Game.silver(medal[1]); if (first) setTimeout(() => Game.insight(1, '순찰'), 500);
      card('수레 순찰', `${t}초 · ${medal[0]} 기록`, `최고 기록 ${f.patrolBest}초 · 은 ${medal[1]} · 감독관들이 총리의 발걸음에 놀라요`, 'star'); return; }
    S().wp = { x: ROUTE[o.i].x, z: ROUTE[o.i].z, n: ROUTE[o.i].n }; toast(`${r.n} 확인! · 다음은 ${ROUTE[o.i].n}`); }
  else if (!S().wp) S().wp = { x: r.x, z: r.z, n: r.n };
  hud.hidden = false; hud.textContent = `순찰 · ${o.i + 1}/${ROUTE.length} ${r.n} · ${Math.floor(o.t)}초${F().patrolBest ? ` · 최고 ${F().patrolBest}초` : ''}`;
  if (o.t > 600) { pat.on = null; hud.hidden = true; S().wp = null; toast('순찰을 멈췄어요'); } }
spot('patrol', -23.6, -86.6, () => `수레 순찰 기록 도전${F().patrolBest ? ` · 최고 ${F().patrolBest}초` : ''}`, () => egypt() && !X.busy(), patrolStart);

// =================================================================== 9 므낫세와 숨바꼭질
const hide = X.hide = { on: null };
function hideStart() { const n = Game.npc('manasseh'); if (!n) return; const w = W(); let best = null;
  for (let i = 0; i < 40 && !best; i++) { const a = Math.random() * PI * 2, r = 9 + Math.random() * 9, x = HOUSE[0] + Math.cos(a) * r, z = HOUSE[1] + 4 + Math.sin(a) * r, q = { x, z };
    if (w.water && w.heightAt(x, z) < w.water.level + 0.3) continue; w.collide(q, 0.35, w.heightAt(x, z)); if (Math.hypot(q.x - x, q.z - z) > 0.05) continue; best = q; }
  if (!best) { toast('숨을 곳이 없대요'); return; }
  G.UI.say([{ n: '므낫세', t: '아빠, 숨바꼭질 해요! 열 셀 동안 눈 감아요! 하나, 둘…' }], () => {
    const home = n.wander ? { cx: n.wander.cx, cz: n.wander.cz, r: n.wander.r } : null; Game.npcTo('manasseh', best.x, best.z, Math.random() * 6); if (n.wander) { n.wander.cx = best.x; n.wander.cz = best.z; n.wander.r = 0.01; }
    hide.on = { n, home, t: 0, g: 0, x: best.x, z: best.z }; G.FX.burst(P().x, P().y + 1.6, P().z, 6, { c: [1, 1, 1], sp: 0.4, up: 0.6, life: 0.6, size: 0.1 }); toast('므낫세가 숨었어요 · 가까이 가면 킥킥 웃음소리가 들려요 (60초)'); }); }
function hideEnd(found) { const h = hide.on; if (!h) return; hide.on = null; hud.hidden = true; if (h.n.wander && h.home) { h.n.wander.cx = h.home.cx; h.n.wander.cz = h.home.cz; h.n.wander.r = h.home.r; }
  if (found) { const f = F(); f.hide = (f.hide || 0) + 1; sfx('quest'); h.n.emote = { k: 'clap', t: 0, dur: 2, amb: true }; G.UI.say([{ n: '므낫세', t: ['찾았다! 아빠 어떻게 알았어요?', '으앗, 또 들켰다! 한 번만 더 해요!', '아빠는 꿈도 잘 풀고 숨은 것도 잘 찾네!'][f.hide % 3] }], () => { const V = G.Vitals; if (V && V.mindGain) V.mindGain(15); toast('마음이 따뜻해졌어요 · 정신력 +15'); }); }
  else G.UI.say([{ n: '므낫세', t: '아빠, 못 찾았지? 히히, 내가 이겼다!' }]); }
function hideTick(dt) { const h = hide.on; if (!h) return; h.t += dt; h.g -= dt; const d = Math.hypot(P().x - h.x, P().z - h.z); h.n.x = h.x; h.n.z = h.z;
  if (d < 9 && h.g <= 0) { h.g = d < 4 ? 1.2 : 2.6; sfx('blip', { pitch: 1.8 + Math.random() * 0.3, vol: 0.5, x: h.x, z: h.z }); }
  hud.hidden = false; hud.textContent = `숨바꼭질 · ${Math.max(0, Math.ceil(60 - h.t))}초${d < 9 ? ' · 킥킥… 가까워요!' : ''}`;
  if (d < 2.2) hideEnd(true); else if (h.t > 60) hideEnd(false); }
ctx.push({ id: 'hide', get x() { const n = Game.npc('manasseh'); return n ? n.x : 0; }, get z() { const n = Game.npc('manasseh'); return n ? n.z : 0; }, label: '므낫세와 숨바꼭질', on: () => { const n = Game.npc('manasseh'); return !!n && n.vis && !!S().q.born1 && !X.busy(); }, use: hideStart });

// =================================================================== 10 옛 애굽 말 모으기
const WORDS = X.WORDS = [['앙크', '생명'], ['우자', '번성'], ['세네브', '건강'], ['이테루', '큰 강'], ['페르', '집'], ['사', '아들'], ['세누', '형제'], ['이브', '마음'], ['렌', '이름'], ['이트', '보리'], ['베데트', '밀'], ['헤메트', '아내']];
function learnWord(n) { if (!egypt() || !n || n.d.animal) return; const f = F(), id = n.id || n.d.id; if (!id || f.met[id] || n.x > 28) return; f.met[id] = 1;
  const left = WORDS.filter(w => !f.words[w[0]]); if (!left.length || Math.random() > 0.55) return; const w = left[Math.floor(Math.random() * left.length)]; f.words[w[0]] = 1;
  setTimeout(() => { toast(`애굽 말을 하나 배웠어요 · 「${w[0]}」 = ${w[1]} (${Object.keys(f.words).length}/${WORDS.length})`); sfx('page');
    if (Object.keys(f.words).length === WORDS.length) setTimeout(() => { Game.insight(2, '애굽 말'); card('옛 애굽 말', '열두 낱말을 모두 배웠어요', '「앙크 · 우자 · 세네브」 — 생명과 번성과 건강이 있기를! 애굽 사람들의 축복 인사예요.', 'star'); }, 1500); }, 1200); }
if (G.Bond && G.Bond.talk) { const t0 = G.Bond.talk; G.Bond.talk = function (n) { try { learnWord(n); } catch (e) { } return t0.apply(this, arguments); }; }
if (G.NpcAI && G.NpcAI.talk) { const t0 = G.NpcAI.talk; G.NpcAI.talk = function (n) { const r = t0.apply(this, arguments); if (r) try { learnWord(n); } catch (e) { } return r; }; }

// =================================================================== per frame
X.busy = () => !!(herd.on || pat.on || hide.on);
let slow = 0;
const upd0 = EP.update; EP.update = function (dt) { const r = upd0 ? upd0.apply(this, arguments) : undefined; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  if (Game.mode !== 'play') return r; try { herdTick(d); patrolTick(d); hideTick(d); } catch (e) { console.error('extras', e); }
  if ((slow += d) > 0.5) { slow = 0; try { legTick(); seasonTick(); } catch (e) { console.error('extras', e); } }
  sbtn.hidden = !(free() && night() && after('p_night') && !X.busy() && !document.body.classList.contains('photo') && !(Game.S().q && Game.S().q.riding)); /* v18.34 not over the wagon's 자동 이동 button */
  return r; };
})(window.G);
