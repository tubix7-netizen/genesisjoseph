/* 약속의 길 — v18.89 곁이야기 「아. 먼 땅」 깊게 (sagaq.js · dreamq.js 다음 · 바탕은 sagas.js)
   다섯 사연의 1편(이야기 모으기 → 꿈 → 꿈 풀기)은 이미 깊어요. 2편 「매듭짓기」 가운데 말로만 끝나던 셋에 손으로 하는 일 · 기다림 · 함께 걷기 · 흔적을 더해요.
   (「미스바의 돌」 · 「살피시는 분의 샘」은 이미 돌 쌓기 · 줄 묻기 · 기념 돌 세우기가 있어요.)
   ① 애굽의 문(kfLamp2): 옥에서 다우로를 풀어 준 뒤 → 나루에서 다우로와 갑돌 배에 짐 싣기(세기) → 배 뜰 때까지 나루에서 함께 기다리기
      → 섬에서 다우로를 앞세우고 키라의 가게까지 함께 걷기 → (재회)
   ② 반쪽 다리(kuArrow2): 세티에게 진실을 전한 뒤 → 세티와 강가의 무너진 다리 반쪽 잇기(밀기) → 해 질 녘까지 북 마당에서 기다리기 → (화해의 북)
      흔적: 세티의 과녁 곁에 이어 놓은 널다리
   ③ 집으로 흐르는 강(fvBoat2): 배 값을 치른 뒤 → 페피와 함께 새 갈대배 엮기(세기) → 해 질 녘 강가에서 메르티와 함께 기다리기 → (켄티가 돌아와요)
      흔적: 메르티의 그물 곁 물가에 매어 둔 새 갈대배
   저장: S.flags.sq = { kf, ku, fv } (각각 { s }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.kfLamp2 || !QS.kuArrow2 || !QS.fvBoat2) return;
const E = k => { const s = S(), f = s.flags.sq || (s.flags.sq = {}); return f[k] || (f[k] = { s: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const F = k => { const s = S(); return !!(s && s.flags && s.flags[k]); };
const say = (l, cb) => G.UI.say(l, cb), toast = m => G.UI.toast(m);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const N = (n, t, e, ref) => ({ n, t, e, ref }), J = (t, e, ref) => ({ n: '요셉', t, e, ref }), T = t => ({ n: '', t });
const hour = () => S().time % 24;
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const LAND = k => G.Lands && G.Lands.list.find(l => l.key === k), onLand = k => { const l = LAND(k); return !!(l && l.on()); };
const onKf = () => !!(G.Caphtor && G.Caphtor.inKf()), away = () => !!(G.Byblos && G.Byblos.inBy());
const KU = LAND('kush') ? LAND('kush').stage() : { x: -130, z: -95 };
const yAt = (x, z) => { const f = EP.floor ? EP.floor(x, z, S()) : null; return typeof f === 'number' ? f : Game.W().heightAt(x, z); };
const npcAt = id => { const n = Game.npc(id); return n && n.vis ? [n.x, n.z] : null; };
let WT = null;
function waitAt(key, at, r, secs, endH, done) { if (G.Overnight && G.Overnight.need(endH)) { const A = arguments; G.Overnight.ask(() => waitAt.apply(null, A)); return; } /* v18.93 a daytime hour already gone: sleep here, go on tomorrow */ const h = hour(); if (!(h >= 6 && h < endH)) { done(); return; } WT = { key, at, r, left: secs, rate: (endH - h) / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);
const KI = '갑돌 도공 키라', DA = '케프티우 선원 다우로', ST = '활의 땅 궁수 세티', ME = '그물 깁는 할머니 메르티', PE = '갈대배 짓는 페피';
const QUAY = [-102.9, -71.9], DRUM = [KU.x + 1.6, KU.z + 6], NETP = [-61, 153], BOAT = [-64.6, 154.7];

// ------------------------------------------------------------------ ① 애굽의 문
{ const q = QS.kfLamp2, o0 = q.obj;
  q.obj = [o0[0], o0[1], { t: '나루에서 다우로와 갑돌 배에 짐 싣기', ok: () => (E('kf').s | 0) >= 1 }, { t: '배가 뜰 때까지 나루에서 다우로와 기다리기', ok: () => (E('kf').s | 0) >= 2 }, o0[2], { t: '섬에서 다우로와 함께 키라의 가게까지 걷기', ok: () => (E('kf').s | 0) >= 3 }];
  const l0 = q.loc; q.loc = s => { const k = E('kf').s | 0; if (s.flags.kfL2b && k < 2 && !onKf()) return 'npc:sgDauroQ'; if (onKf() && k < 3) return 'npc:sgDauroI'; return l0(s); };
  /* (the line in the reunion is 창 40:14 — Joseph's own words to the cupbearer) */
  for (const l of q.done || []) if (l && l.ref === '창세기 40:23') l.ref = '창세기 40:14 · 40:23'; }
function kfLoad() { mg('count', { title: '갑돌 배에 짐 싣기', hint: '다우로와 함께 물항아리 · 빵 · 키라에게 줄 애굽 아마포를 하나씩 배에 실어요.', need: 6, btn: '싣기', onPress: () => sfx('thud', { vol: 0.35, pitch: 1.1 }) },
  () => { E('kf').s = 1; G.UI.quest(); say([N(DA, '(배 난간을 쓰다듬으며) 삼 년 만에 바다 냄새를 맡습니다. …배가 뜨려면 바람이 바뀌어야 해요. 조금만 기다리면 됩니다.')]); }); }
function kfWait() { say([T('나루 끝에 다우로와 나란히 앉아 북쪽 바람을 기다려요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('kf', QUAY, 4, 9, Math.min(20, hour() + 1.5), () => { E('kf').s = 2; G.UI.quest(); say([N(DA, '바람이 바뀌었어요! 총리님, 같이 가 주세요. …키라 얼굴을 혼자 볼 자신이 없어요.', 'tender'), T('갑돌 배 선장에게 말해 섬으로 건너가요')]); })); }
function kfWalk() { const n = Game.npc('sgDauroI'); if (!n) return; n.walk = null; n.sit = false; Game.npcFollow('sgDauroI', true); E('kf').walk = 1; G.UI.quest(); toast('다우로가 뒤따라와요 · 키라의 가게로'); }

// ------------------------------------------------------------------ ② 반쪽 다리
{ const q = QS.kuArrow2, o0 = q.obj;
  q.obj = [o0[0], { t: '세티와 강가의 무너진 다리 반쪽 잇기', ok: () => (E('ku').s | 0) >= 1 }, { t: '해 질 녘까지 북 마당에서 기다리기', ok: () => (E('ku').s | 0) >= 2 }, o0[1]];
  const l0 = q.loc; q.loc = s => { const k = E('ku').s | 0; if (s.flags.kuA2a && k === 0) return 'npc:kuArcher'; if (s.flags.kuA2a && k === 1) return { x: DRUM[0], z: DRUM[1] }; return l0(s); }; }
function kuBridge() { const a = Game.npc('kuArcher'); if (a) a.talking = true;
  say([N(ST, '…요새 사람들이 마을로 건너오던 널다리가 있었소. 그날 뒤로 내가 반을 부숴 버렸지.'), N(ST, '해 지기 전에 다시 잇겠소. 손을 빌려주시오.')],
    () => mg('push', { title: '다리 반쪽 잇기', hint: '세티가 널빤지를 받치는 동안 말뚝을 꾹꾹 박아 넣어요. 힘이 빠지면 잠깐 쉬어요.', btn: '박기' }, () => { if (a) a.talking = false; E('ku').s = 1; sfx('thud', { vol: 0.6, pitch: 0.8 }); G.UI.quest(); say([N(ST, '(이어진 다리를 한참 내려다보며) …십 년 만이오. 해 질 녘 북 마당에서 기다리겠소.')]); })); }
function kuWait() { say([T('북 마당 불가에 앉아 해가 지기를 기다려요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('ku', DRUM, 4, 9, 18.4, () => { E('ku').s = 2; G.UI.quest(); toast('해가 졌어요 · 세티와 세네브를 북 마당으로'); })); }

// ------------------------------------------------------------------ ③ 집으로 흐르는 강
{ const q = QS.fvBoat2, o0 = q.obj;
  q.obj = [o0[0], o0[1], { t: '페피와 함께 새 갈대배 엮기', ok: () => (E('fv').s | 0) >= 1 }, { t: '해 질 녘 강가에서 메르티와 함께 기다리기', ok: () => (E('fv').s | 0) >= 2 }];
  const l0 = q.loc; q.loc = s => { const k = E('fv').s | 0; if (s.flags.fvB2b && k === 0) return 'npc:fv_pepi'; if (s.flags.fvB2b && k === 1) return { x: NETP[0] + 1.6, z: NETP[1] }; return l0(s); };
  if (q.done && q.done[0] && /사흘 뒤 저녁 강가/.test(q.done[0].t)) q.done[0] = T('해 질 녘 강가, 새 갈대배 곁에 켄티가 서 있었습니다. 메르티의 손에서 그물이 떨어졌습니다.'); }
function fvWeave() { const n = Game.npc('fv_pepi'); if (n) n.talking = true;
  say([N(PE, '총리님이 손을 보태 주신다고요? 그럼 사흘 걸릴 일을 오늘 해 지기 전에 띄우겠는데요!', 'happy')],
    () => mg('count', { title: '갈대배 엮기', hint: '갈대 다발을 단단히 묶어 배 몸통에 한 단씩 엮어 붙여요. 페피가 끝을 당겨 줘요.', need: 7, btn: '엮기', onPress: () => sfx('rustle', { vol: 0.4 }) }, () => { if (n) n.talking = false; E('fv').s = 1; G.UI.quest();
      say([N(PE, '다 됐어요! 뱃머리에 켄티 이름도 새겼어요. 켄티한테는 사람을 보냈으니, 해 질 녘엔 강가에 닿을 거예요.'), T('메르티의 그물 곁 강가로 가요')]); })); }
function fvWait() { const m = Game.npc('fv_merti'); if (m) { m.talking = false; }
  say([N(ME, '…오늘 온다고? 정말이오? (그물을 내려놓지 못한 채) 같이 앉아 있어 주시오. 혼자 기다리는 건 이제 지겨워서.', 'tender'), T('메르티 곁에 앉아 강물을 바라봐요 · 자리를 뜨면 기다림이 멈춰요')],
    () => waitAt('fv', [NETP[0] + 1.6, NETP[1]], 4, 10, 18.3, () => { E('fv').s = 2; G.UI.quest(); sfx('splash', { vol: 0.3 }); toast('강 아래쪽에서 누군가 걸어와요 · 메르티에게 말을 걸어요'); })); }

// ------------------------------------------------------------------ the old buttons in the new order (the drum yard waits for the bridge and the evening)
{ const i = Game.CTX.findIndex(f => /sgDrum/.test(String(f)) && /sgCairn/.test(String(f))); if (i >= 0) { const f0 = Game.CTX[i];
  Game.CTX[i] = function (s) { const r = f0.apply(this, arguments); if (!r) return r; const o = r.filter(x => !(x.key === 'sgDrum' && (E('ku').s | 0) < 2)); return o.length ? o : null; }; } }
/* Kenti comes home only after the evening wait */
{ const k = EP.npcs.find(n => n.id === 'sgKenti'); if (k) { const sh = k.show; k.show = s => sh(s) && ((E('fv').s | 0) >= 2 || (s.side && s.side.done && s.side.done.fvBoat2 !== undefined)); } }

// ------------------------------------------------------------------ 행동 단추
Game.CTX.push(function (s) { const p = P(); if (!s || p.ride || p.act || Game.cineOn || G.UI.busy() || (G.DW && G.DW.on && G.DW.on())) return null; const out = [];
  const at = (pt, r, label, key, use) => { if (!pt) return; const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  if (on('kfLamp2') && F('kfL2b')) { const k = E('kf').s | 0; if (!onKf() && !away()) { const dq = npcAt('sgDauroQ') || QUAY; if (k === 0) at(dq, 3, '다우로와 배에 짐 싣기', 'sqK0', kfLoad); if (k === 1 && !waiting('kf')) at(dq, 3.4, '나루에서 함께 바람 기다리기', 'sqK1', kfWait); }
    if (onKf() && k === 2 && !E('kf').walk) at(npcAt('sgDauroI'), 3, '다우로와 키라의 가게로 걷기', 'sqK2', kfWalk); }
  if (on('kuArrow2') && F('kuA2a') && onLand('kush')) { const k = E('ku').s | 0; if (k === 0) at(npcAt('kuArcher'), 3, '세티와 다리 반쪽 잇기', 'sqU0', kuBridge); if (k === 1 && !waiting('ku')) at(DRUM, 3.4, '북 마당 불가에서 해 질 녘 기다리기', 'sqU1', kuWait); }
  if (on('fvBoat2') && F('fvB2b') && !away()) { const k = E('fv').s | 0; if (k === 0) at(npcAt('fv_pepi'), 3, '페피와 갈대배 엮기', 'sqF0', fvWeave); if (k === 1 && !waiting('fv')) at([NETP[0] + 1.6, NETP[1]], 3.4, '메르티 곁에서 해 질 녘 기다리기', 'sqF1', fvWait); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ 기다림 · 함께 걷기
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try {
    if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); s.time = Game.clockTo(s, w.endH); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } }
    /* ① Dauro walks with Joseph to Kira's shop on the island */
    if (on('kfLamp2') && onKf() && E('kf').walk && (E('kf').s | 0) === 2) { const n = Game.npc('sgDauroI'), k = Game.npc('kfPotter'); if (n && !n.follow && !n.talking) Game.npcFollow('sgDauroI', true);
      if (n && k && Math.hypot(n.x - k.x, n.z - k.z) < 4.5 && Math.hypot(p.x - k.x, p.z - k.z) < 5) { Game.npcFollow('sgDauroI', false); n.walk = null; Game.npcTo('sgDauroI', k.x + 1.4, k.z + 1.2, Math.atan2(k.x - n.x, k.z - n.z), false); E('kf').s = 3; E('kf').walk = 0; G.UI.quest(); toast('키라의 가게 앞이에요 · 키라에게 말을 걸어요'); } }
  } catch (e) { console.error('sagaq', e); }
  return r; };

// ------------------------------------------------------------------ 흔적
const MS = {}, MP = []; let mk = 0;
const mkM = (seed, fn) => { const g = new G.GB(seed); fn(g); return G.R.mesh(g); };
function meshes() {
  MS.bridge = mkM(981, g => { for (let i = 0; i < 7; i++) g.box(1.3, 0.08, 0.32, { at: [0, 0.32, (i - 3) * 0.36], c: [0x8a6a48, 0x7a5a3a][i % 2], j: 0.04 }); for (const sx of [-0.6, 0.6]) for (const sz of [-1.1, 1.1]) g.cyl(0.06, 0.07, 0.7, 6, { at: [sx, 0.15, sz], c: 0x5a4028 }); for (const sx of [-0.62, 0.62]) g.box(0.04, 0.04, 2.6, { at: [sx, 0.7, 0], c: 0x7a5a3a }); });
  MS.boat = mkM(982, g => { for (let i = 0; i < 5; i++) g.cyl(0.16, 0.16, 3.4 - Math.abs(i - 2) * 0.5, 7, { at: [(i - 2) * 0.24, 0.16 + (2 - Math.abs(i - 2)) * 0.03, 0], rx: Math.PI / 2, c: [0xc8b070, 0xb8a060][i % 2] }); for (const z of [-1.7, 1.7]) g.cyl(0.08, 0.2, 0.5, 6, { at: [0, 0.45, z], rx: z > 0 ? -0.6 : 0.6, c: 0xb8a060 }); g.box(0.06, 0.06, 1.8, { at: [0.5, 0.36, 0.2], ry: 0.2, c: 0x7a5a38 }); });
  MS.ok = 1; }
const put = (list, mesh, x, y, z, ry) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, x, y, z, ry || 0, 0, 0, 1, 1, 1); list.push({ mesh, m, outline: true }); };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.sq) return; try { if (!MS.ok) meshes(); mk = 0; const sq = s.flags.sq, g = k => (sq[k] && sq[k].s) | 0, p = P();
    if (g('ku') >= 1 && onLand('kush')) { const a = (EP.npcs.find(n => n.id === 'kuArcher') || {}); if (typeof a.x === 'number') { const x = a.x + 2.2, z = a.z + 2.6; put(list, MS.bridge, x, yAt(x, z), z, 0.4); } }
    if (g('fv') >= 2 && !away() && Math.hypot(p.x - BOAT[0], p.z - BOAT[1]) < 80) { const wl = (Game.W().water || { level: 0 }).level; put(list, MS.boat, BOAT[0], Math.max(wl - 0.08, Game.W().heightAt(BOAT[0], BOAT[1]) - 0.05), BOAT[1], 0.3); }
  } catch (e) { console.error('sagaq dyn', e); } };
G.SagaQ = { E, WT: () => WT };
})(window.G);
