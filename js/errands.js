/* 약속의 길 — 수레 배달 (v18.26)
   요셉이 총리가 되어 수레를 쓰게 되면(c5_patrol부터), 성읍 곳간 앞의 곳간 서기 이피가 곡식 배달을 부탁해요.
   · 부탁을 맡으면 수레 짐칸에 곡식 자루가 실려요. 수레를 불러 타고, 정한 마을 어귀의 깃발까지 몰고 가서 멈추면 배달 끝.
   · 정해진 시간 안에 닿으면 덤으로 은을 더 받아요. 하지만 너무 서두르면 말이 지쳐서 오히려 늦어요 — 말 기력을 아끼며 달리는 게 요령.
   · 풍년에는 「곳간으로 거두어 들이기」 대신 마을 창고에 씨앗 곡식을, 흉년에는 굶는 마을에 양식을 나눠요. 하루에 마을마다 한 번. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const chap = s => { const st = s.step || 'c2'; return st[0] === 'j' || st[0] === 'g' ? 7 : (+st[1] || 2); } /* v18.34 g1–g8 are chapters 7–8 (they read as chapter 1) */;
const CLERK = [21.5, -58.5];
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
EP.npcs.push({ id: 'dlClerk', name: '곳간 서기 이피', look: Object.assign({}, lookOf('scribeA') || lookOf('steward') || lookOf('ameni') || {}, { top: 0xf0ead8, trim: 0x2c5a9a }), x: CLERK[0], z: CLERK[1], face: -2.4, talkR: 2.6,
  show: s => !!(s.q && s.q.chariotOk), persona: '성읍 곳간의 장부를 맡은 꼼꼼한 서기. 늘 갈대 붓을 귀에 꽂고 다닌다.' });
const DEST = [{ id: 'west', n: '서쪽 마을' }, { id: 'south', n: '남쪽 마을' }, { id: 'pyr', n: '피라미드 일꾼 마을' }];
const vOf = id => (EP.villages || []).find(v => v.id === id);
/* the drop point: on the road side of the village, just outside where wheels may go */
function drop(id) { const v = vOf(id); if (!v) return null; const a = Math.atan2(CLERK[0] - v.x, CLERK[1] - v.z), W = Game.W();
  if (DROP[id]) return DROP[id]; const dry = (x, z) => { if (!W.water) return true; for (let i = 0; i < 8; i++) { const b = i / 8 * Math.PI * 2; if (W.heightAt(x + Math.cos(b) * 4, z + Math.sin(b) * 4) < W.water.level + 0.9) return false; } return W.heightAt(x, z) > W.water.level + 0.9; };
  for (let k = 0; k <= 16; k++) { const da = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.39; for (const rr of [6, 9, 12]) { const r = v.r + rr, x = v.x + Math.sin(a + da) * r, z = v.z + Math.cos(a + da) * r; if (!Game.solidAt(x, z, 1.2) && dry(x, z)) return (DROP[id] = [x, z]); } }
  return (DROP[id] = [v.x + Math.sin(a) * (v.r + 6), v.z + Math.cos(a) * (v.r + 6)]); }
const DROP = {};
const job = () => { const s = S(); return s && s.q && s.q.dlJob; };
/* v18.28 the Nile runs between the city and the west villages: the way goes over a ford (나루), where the wheels can roll through the shallows */
const FORDS = [[-104, -64], [-82, 96]], riverX = z => -106 + Math.max(0, Math.min(1, (z + 60) / 156)) * 22, bank = (x, z) => x < riverX(z) ? 'W' : 'E';
function wayTo(x, z, tx, tz) { if (bank(x, z) === bank(tx, tz)) return [tx, tz]; let best = FORDS[0], bd = 1e9; for (const f of FORDS) { const d = Math.hypot(f[0] - x, f[1] - z) + Math.hypot(f[0] - tx, f[1] - tz); if (d < bd) { bd = d; best = f; } } return best; }
/* the wagon waits outside the city walls, on the side toward the village (you cannot call it inside the city) */
function parkCart(s, to) { const v = vOf('city'), W = Game.W(); if (!v || s.q.riding) return null; const a0 = Math.atan2(to[0] - v.x, to[1] - v.z);
  for (let k = 0; k <= 12; k++) { const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.3; for (const rr of [6, 9, 13]) { const x = v.x + Math.sin(a) * (v.r + rr), z = v.z + Math.cos(a) * (v.r + rr);
      if (Game.solidAt(x, z, 1.4) || (G.Cart && G.Cart.town && G.Cart.town(x, z)) || (W.water && W.heightAt(x, z) < W.water.level + 0.6)) continue; s.q.cartAt = { x, z, f: a }; return [x, z]; } } return null; }
for (const D of DEST) { const qid = 'dl_' + D.id;
  EP.quests[qid] = { giver: 'dlClerk', title: `곡식 수레 · ${D.n}`, repeat: 1,
    when: s => !!(s.q && s.q.chariotOk) && !!vOf(D.id) && (!vOf(D.id).when || vOf(D.id).when(s)) && !(s.q.dlJob && s.q.dlJob.id !== qid),
    offer: s => chap(s) >= 6 ? [`총리님! ${D.n}에 양식이 떨어져 간답니다. 곡식 자루를 수레에 실어 두었어요.`, `해 지기 전에, 아니 될 수 있으면 빨리 가 주세요. 어귀에 깃발을 꽂아 두었습니다.`]
      : [`총리님, ${D.n} 창고에 씨앗 곡식을 보내야 합니다. 수레에 자루를 실어 드릴게요.`, '서두르시면 덤도 드리지요. 하지만 말이 지치면 오히려 늦습니다. 말 기력을 잘 보세요!'],
    obj: [{ t: s => { const j = s.q.dlJob; const left = j ? Math.max(0, Math.ceil(j.left)) : 0; if (j && !j.go) return `성 밖에 대 둔 수레 타기 · 타는 순간부터 시간이 흘러요 (${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')})`; return `수레로 ${D.n} 어귀 깃발까지${bank(P().x, P().z) !== bank(drop(D.id)[0], drop(D.id)[1]) ? ' · 나루로 강 건너기' : ''} · ${left > 0 ? `남은 시간 ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '늦었지만 가져다주기'}`; }, ok: s => s.q.dlDone === qid }],
    loc: () => { const s = S(), p = drop(D.id), j = s.q.dlJob, P0 = P(); if (!p) return null; if (j && !j.go && s.q.cartAt) return { x: s.q.cartAt.x, z: s.q.cartAt.z };
      const w = wayTo(P0.x, P0.z, p[0], p[1]); return { x: w[0], z: w[1] }; },
    start(s) { const p = drop(D.id), d = p ? Math.hypot(p[0] - CLERK[0], p[1] - CLERK[1]) : 100; const par = Math.round(d / 6.5 + 80); s.q.dlJob = { id: qid, v: D.id, left: par, par, go: false }; s.q.dlDone = null; const pk = p ? parkCart(s, p) : null;
      setTimeout(() => { if (pk) pop('수레를 성 밖에 대 두었어요', '파란 표시를 따라가 타요 · 타는 순간부터 시간이 흘러요', 'donkey'); G.UI.help && G.UI.help('dlJob', '수레 배달', '성 밖의 수레에 타면 시간이 흘러요 · 강은 나루(얕은 곳)로 건너요 · 깃발 앞에서 수레를 세우면 배달 끝 · 시간 안에 닿으면 덤'); }, 900); },
    prog: ['깃발 앞에 수레를 세우시면 마을 사람들이 내려 갈 겁니다.'], done: ['수고하셨습니다!'], reward: { silver: 14, xp: 12 } }; }
/* arriving: stop the cart by the flag */
let chk = 0;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.q) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { const j = s.q.dlJob; if (!j) return r; if (!(s.side && s.side.act && s.side.act[j.id])) { s.q.dlJob = null; return r; }
    if (!j.go && s.q.riding) j.go = true; /* the clock starts when you take the reins */
    if (j.go && !G.UI.busy() && !(G.Cine && G.Cine.on)) j.left -= d;
    if ((chk -= d) > 0) return r; chk = 0.25; const p = drop(j.v), P0 = P(); if (!p) return r;
    if (s.q.riding && Math.hypot(P0.x - p[0], P0.z - p[1]) < 8 && Math.abs(G.Cart && G.Cart.speed ? G.Cart.speed() : 0) < 0.9) {
      const on = j.left > 0, v = vOf(j.v); s.q.dlDone = j.id; s.q.dlJob = null; G.Life.complete(j.id); sfx('coin');
      if (on) { const bonus = 6 + Math.round(j.left / j.par * 14); Game.silver(bonus); pop('제시간에 닿았어요!', `덤으로 은 ${bonus} · 말도 대견해요`, 'coin'); } else pop('늦었지만 무사히 닿았어요', '다음엔 말 기력을 아끼며 달려 봐요', 'donkey');
      if (G.Bond && v) for (const f of v.folk.slice(0, 6)) if (Game.ENT.npcs[f.id]) G.Bond.add(f.id, 1, 'grain');
      const ns = v ? v.folk.map(f => Game.ENT.npcs[f.id]).filter(n => n && n.vis && Math.hypot(n.x - P0.x, n.z - P0.z) < 40) : []; if (ns[0]) G.Life.bubble(ns[0].id, chap(s) >= 6 ? '곡식이다! 총리님이 곡식을 가져오셨어요!' : '씨앗 곡식이 왔어요! 고맙습니다!', 3); } } catch (e) { console.error('errands', e); } return r; };
/* the sacks in the wagon bed, and a flag at the drop point */
let sack = null, flag = null; const SM = [G.m4(), G.m4(), G.m4()], FM = G.m4();
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s || !s.q || !s.q.dlJob) return; try {
    if (!sack) { const g = new G.GB(93); g.sph(0.3, 9, 7, { at: [0, 0.26, 0], c: 0xc8a878 }); g.cyl(0.08, 0.14, 0.16, 7, { at: [0, 0.58, 0], c: 0xb89868 }); g.cyl(0.1, 0.1, 0.03, 7, { at: [0, 0.5, 0], c: 0x7a5a38 }); sack = G.R.mesh(g);
      const f = new G.GB(94); f.cyl(0.05, 0.06, 3.4, 6, { at: [0, 1.7, 0], c: 0x6a4a30 }); f.box(0.04, 0.6, 1.0, { at: [0, 3.0, 0.5], c: 0xe8c048 }); f.box(0.045, 0.16, 1.0, { at: [0, 3.0, 0.5], c: 0x2c5a9a }); flag = G.R.mesh(f); }
    const p = P(), c = s.q.riding ? { x: p.x, z: p.z, f: p.face } : s.q.cartAt, W = Game.W();
    if (c && s.q.chariotOk) [[-0.36, -1.3], [0.36, -1.35], [0, -1.95]].forEach(([lx, lz], i) => { const x = c.x + Math.cos(c.f) * lx + Math.sin(c.f) * lz, z = c.z - Math.sin(c.f) * lx + Math.cos(c.f) * lz; G.m4trs(SM[i], x, W.heightAt(c.x, c.z) + 0.68, z, c.f + i, 0, 0, 1, 1, 1); list.push({ mesh: sack, m: SM[i], outline: true }); });
    const d = drop(s.q.dlJob.v); if (d) { G.m4trs(FM, d[0], W.heightAt(d[0], d[1]), d[1], performance.now() / 3000 % 6.28 * 0 + 0.6, 0, Math.sin(performance.now() / 400) * 0.03, 1, 1, 1); list.push({ mesh: flag, m: FM, outline: true }); } } catch (e) { console.error('errands dyn', e); } };
/* v18.30 taking another request while a delivery is running does not quietly swap the goal: the wagon job stays the goal */
{ const ac0 = G.Life.accept; G.Life.accept = function (id) { const s = S(), j = s && s.q && s.q.dlJob, r = ac0.apply(this, arguments);
    if (j && j.id !== id && s.side && s.side.act && s.side.act[j.id]) { s.side.track = j.id; s.side.goal = 'side'; G.UI.quest && G.UI.quest(); setTimeout(() => G.UI.toast('배달 중이라 목표는 그대로예요 · 왼쪽 위 부탁 줄을 눌러 바꿀 수 있어요'), 1600); } return r; }; }
G.Errands = { drop, job };
})(window.G);
