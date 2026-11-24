/* 약속의 길 — v18.91 곁이야기 「감옥 동무 타후」 깊게 (cellq.js · sagaq.js 다음 · 바탕은 delights.js의 d_cell)
   3장 왕의 옥. 빵 하나 훔쳐 갇힌 어린 죄수 타후. 예전에는 「기억놀이 한 판」이 전부였어요.
   창살 사이로 기억놀이(기억) → 짚단에서 마른 짚 한 아름 골라 오기(세기) → 창살 사이로 짚 넣어 잠자리 새로 깔아 주기
   → 채소밭 흙으로 작은 낙타 빚기(리듬) → 해 질 녘까지 창살 곁에 앉아 타후가 잠들 때까지 곁에 있기(기다림)
   흔적: 타후의 감방 안, 짚자리 머리맡의 흙 낙타
   요셉이 옥의 제반 사무를 맡은 때(창 39:22)라 마당을 오갈 수 있어요. 성경 인물의 말은 넣지 않아요(타후 · 요셉만).
   저장: S.flags.cq = { s } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.d_cell) return;
const E = () => { const s = S(); return s.flags.cq || (s.flags.cq = { s: 0 }); };
const on = () => { const s = S(); return !!(s && s.side && s.side.act && s.side.act.d_cell); };
const say = (l, cb) => G.UI.say(l, cb), toast = m => G.UI.toast(m), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const TA = (t, e) => ({ n: '어린 죄수 타후', t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t });
const hour = () => S().time % 24, hAt = (x, z) => Game.W().heightAt(x, z);
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const BARS = [-24.5, -3.9], STRAW = [-42, 5], GARDEN = [-38.5, 4.4], CAMEL = [-25.3, -6.5];
const MEM = ['bread', 'fig', 'stone', 'branch', 'herb', 'water', 'reed', 'clay', 'olive'].filter(k => Game.ITEMS[k]);
let WT = null;
function waitAt(at, r, secs, endH, done) { if (G.Overnight && G.Overnight.need(endH)) { const A = arguments; G.Overnight.ask(() => waitAt.apply(null, A)); return; } /* v18.93 a daytime hour already gone: sleep here, go on tomorrow */ const h = hour(); if (!(h >= 6 && h < endH)) { done(); return; } WT = { at, r, left: secs, rate: (endH - h) / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }

{ const q = QS.d_cell; delete q.repeat; q.start = function () { }; delete q.take; q.title = '감옥 동무 타후';
  Object.assign(q, {
    offer: [TA('형, 너무 심심해요… 내가 물건을 늘어놓을 테니까 기억했다가 맞혀 봐요!'), TA('…그리고요, 밤이 되면 무서워요. 짚이 다 젖어서 차가워요.', 'sad')],
    obj: [{ t: '창살 사이로 타후와 기억놀이 하기', ok: () => (E().s | 0) >= 1 }, { t: '짚단에서 마른 짚 한 아름 골라 오기', ok: () => (E().s | 0) >= 2 }, { t: '창살 사이로 짚 넣어 잠자리 새로 깔아 주기', ok: () => (E().s | 0) >= 3 }, { t: '채소밭 흙으로 작은 낙타 빚기', ok: () => (E().s | 0) >= 4 }, { t: '해 질 녘까지 창살 곁에 앉아 있기', ok: () => (E().s | 0) >= 5 }],
    loc: () => { const k = E().s | 0; return k === 1 ? { x: STRAW[0], z: STRAW[1] } : k === 3 ? { x: GARDEN[0], z: GARDEN[1] } : k < 5 ? { x: BARS[0], z: BARS[1] } : 'npc:youngP'; },
    prog: () => ['형, 놀아 줘요!', '마른 짚은 짚단 안쪽에 있어요. 겉은 이슬에 젖었어요.', '창살 사이로 밀어 넣어 주면 제가 펼게요!', '…낙타요? 엄마가 낙타 대상 이야기를 해 줬었어요.', '형, 아직 가지 마요.', '…'][Math.min(5, E().s | 0)],
    done: [TA('(흙 낙타를 머리맡에 세워 두고) 형, 이 낙타가 엄마 집까지 걸어가는 꿈을 꿀래요.', 'tender'), J('그래. 그리고 아침에 일어나면, 오늘도 같이 물을 나르자.', 'tender'), T('타후의 짚자리 머리맡에 작은 흙 낙타가 놓였어요.')],
    reward: { items: { fig: 2 }, xp: 22 } }); }
function cMem() { mg('memory', { title: '감옥 기억놀이', hint: '타후가 창살 앞에 늘어놓은 물건을 잘 봐요!', pool: MEM, n: 4, grid: 9, show: 3.4 },
  () => { E().s = 1; G.UI.quest(); say([TA('우와, 형 진짜 잘한다! …형, 근데 내 짚자리 좀 봐 줄래요? 차가워서 잠이 안 와요.', 'happy')]); }); }
function cStraw() { mg('count', { title: '마른 짚 고르기', hint: '짚단 안쪽에서 바스락거리는 마른 짚만 골라 한 아름 안아요.', need: 6, btn: '한 줌', onPress: () => sfx('rustle', { vol: 0.4 }) },
  () => { E().s = 2; G.UI.quest(); toast('마른 짚 한 아름 · 타후의 감방 창살로'); }); }
function cGive() { E().s = 3; sfx('rustle', { vol: 0.6 }); G.UI.quest();
  say([T('창살 사이로 짚을 한 줌씩 밀어 넣어요. 타후가 젖은 짚을 걷어 내고 마른 짚을 두툼하게 펴요.'), TA('따뜻해요! …형, 엄마가 그러는데 낙타는 사막에서도 길을 잃지 않는대요. 아빠가 대상을 따라갔었거든요.', 'happy'), J('(채소밭 흙이면 작은 낙타 하나쯤 빚을 수 있겠다.)')]); }
function cCamel() { mg('rhythm', { title: '흙 낙타 빚기', hint: '채소밭 흙에 물을 섞어 박자에 맞춰 주무르고, 혹 하나 다리 넷을 빚어요.', need: 6, beats: 10, btn: '빚기' },
  () => { E().s = 4; sfx('craft'); G.UI.quest(); toast('작은 흙 낙타를 빚었어요 · 타후에게'); }); }
function cSit() { say([T('창살 사이로 흙 낙타를 건네요. 타후가 두 손으로 받아 한참 들여다봐요.'), TA('…형, 오늘 밤엔 가지 말고 여기 있어 줘요. 잠들 때까지만요.', 'tender'), T('창살 곁에 앉아요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt(BARS, 3.4, 10, 20.5, () => { E().s = 5; G.UI.quest(); say([T('타후의 숨소리가 고르게 바뀌었어요. 흙 낙타를 꼭 쥔 채 잠들었어요.'), J('(이 아이를 지키시는 분이 나도 지키신다. 구덩이에서도, 여기서도.)', 'tender'), T('아침에 타후에게 말을 걸어 마무리해요')]); })); }

Game.CTX.push(function (s) { const p = P(); if (!s || !on() || p.ride || p.act || Game.cineOn || G.UI.busy()) return null; const out = [], k = E().s | 0;
  const at = (pt, r, label, key, use) => { const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  if (k === 0) at(BARS, 2.6, '창살 사이로 기억놀이', 'cqM', cMem); if (k === 1) at(STRAW, 2.6, '마른 짚 고르기', 'cqS', cStraw); if (k === 2) at(BARS, 2.6, '창살 사이로 짚 넣어 주기', 'cqG', cGive);
  if (k === 3) at(GARDEN, 2.8, '채소밭 흙으로 낙타 빚기', 'cqC', cCamel); if (k === 4 && !WT) at(BARS, 2.8, '창살 곁에 앉아 있기', 'cqW', cSit);
  return out.length ? out : null; });

const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags || !WT) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try { if (!G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); s.time = Game.clockTo(s, w.endH); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } } } catch (e) { console.error('cellq', e); }
  return r; };

let camel = null; const CM = G.m4();
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.cq || (s.flags.cq.s | 0) < 4) return; const p = P(); if (Math.hypot(p.x - CAMEL[0], p.z - CAMEL[1]) > 40) return;
  const yt = Game.npc('youngP'); if (!yt || !yt.vis) return; /* (while Tahu is in the prison) */
  try { if (!camel) { const g = new G.GB(991); g.sph(0.08, 7, 5, { at: [0, 0.14, 0], s: [1.4, 0.8, 0.8], c: 0xa8744a }); g.sph(0.04, 6, 4, { at: [0, 0.21, 0], c: 0x9a6a40 }); g.cyl(0.015, 0.02, 0.12, 5, { at: [0.12, 0.2, 0], rz: -0.6, c: 0xa8744a }); g.sph(0.03, 6, 4, { at: [0.16, 0.25, 0], s: [1.4, 0.9, 0.9], c: 0xa8744a });
      for (const [x, z] of [[-0.06, -0.03], [-0.06, 0.03], [0.06, -0.03], [0.06, 0.03]]) g.cyl(0.012, 0.012, 0.1, 4, { at: [x, 0.05, z], c: 0x9a6a40 }); camel = G.R.mesh(g); }
    G.m4trs(CM, CAMEL[0], hAt(CAMEL[0], CAMEL[1]), CAMEL[1], 2.4, 0, 0, 1.6, 1.6, 1.6); list.push({ mesh: camel, m: CM, outline: true }); } catch (e) { console.error('cellq dyn', e); } };
G.CellQ = { E, WT: () => WT };
})(window.G);
