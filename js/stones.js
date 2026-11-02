/* 약속의 길 — 돌 (v18.12)
   · 물매 돌 4종: 돌 · 매끄러운 돌 · 부싯돌 · 검은 돌(현무암). 강할수록 피해가 크고, 부싯돌은 급소를 잘 찌르고, 검은 돌은 짐승을 휘청이게 해요.
   · 얻는 길: 돌무더기(가끔 덤으로 좋은 돌) · 시냇돌 더미 · 부싯돌 바위 / 검은 바위(돌망치) · 바위 깨기 · 둥근 돌을 던지면 깨져서 돌이 됨(2일 뒤 제자리에 다시 생김)
     · 장터·나그네·사냥꾼·대상에서 하루 횟수 제한으로 살 수 있어요.
   · 어떤 돌을 쓸지는 왼쪽 단추에서 고르고(자동 = 약한 돌부터), 고른 돌이 떨어지면 자동으로 돌아가요. */
'use strict';
(function (G) {
const Game = G.Game, St = G.Stones = {};
const T = St.T = {
  stone: { n: '돌', short: '돌', mul: 1 },
  smooth: { n: '매끄러운 돌', short: '매끈', mul: 1.5 },
  flint: { n: '부싯돌', short: '부싯', mul: 2.1, crit: 0.15 },
  basalt: { n: '검은 돌', short: '검은', mul: 2.8, stun: 0.3 },
};
const ORDER = ['stone', 'smooth', 'flint', 'basalt'];
Object.assign(Game.ITEMS, {
  smooth: { n: '매끄러운 돌', cat: 'mat', p: 3, ic: 'stone', c: '#8fb4c4' },
  flint: { n: '부싯돌', cat: 'mat', p: 8, ic: 'stone', c: '#58586a' },
  basalt: { n: '검은 현무암 돌', cat: 'mat', p: 16, ic: 'stone', c: '#2c2c36' },
});
const S = () => Game.S(), H = () => { const s = S(); return s && s.hero; };
St.total = () => ORDER.reduce((a, k) => a + Game.inv(k), 0);
St.has = () => St.total() > 0;
const sel = () => { const h = H(); return h && h.stoneSel && h.stoneSel !== 'auto' && Game.inv(h.stoneSel) > 0 ? h.stoneSel : 'auto'; };
St.pick = () => { const s = sel(); if (s !== 'auto') return s; for (const k of ORDER) if (Game.inv(k) > 0) return k; return null; };
St.use = () => { const k = St.pick(); if (!k) return null; Game.take(k, 1); return k; };
St.label = () => { const s = sel(), k = s === 'auto' ? 'stone' : s; return s === 'auto' ? `돌 ${St.total()}` : `${T[k].short} ${Game.inv(k)}`; };
St.cycle = function () {
  const h = H(); if (!h) return; const owned = ORDER.filter(k => Game.inv(k) > 0); if (owned.length < 2 && sel() === 'auto') return;
  const cur = sel(), seq = ['auto'].concat(owned), nx = seq[(seq.indexOf(cur) + 1) % seq.length];
  h.stoneSel = nx; G.UI.toast(nx === 'auto' ? '물매 돌: 자동 (약한 돌부터 써요)' : `물매 돌: ${T[nx].n} · 피해 ×${T[nx].mul}${T[nx].crit ? ' · 급소' : ''}${T[nx].stun ? ' · 휘청' : ''}`); G.Audio && G.Audio.sfx('click'); G.UI.hud();
};
// the small button under the weapon button (only while the sling is in hand and more than one kind of stone is owned)
let btn = null;
St.hud = function () {
  if (!btn) { const w = document.getElementById('wpnBtn'); if (!w) return; btn = document.createElement('button'); btn.id = 'ammoBtn'; btn.hidden = true; w.after(btn); btn.onclick = St.cycle; }
  const h = H(), C = G.Combat; const on = h && h.mode === 'ranged' && h.ranged && C && C.GEAR[h.ranged].ammo === 'stone' && ORDER.filter(k => Game.inv(k) > 0).length > 1;
  btn.hidden = !on; if (on) { const s = sel(), k = s === 'auto' ? St.pick() : s; btn.textContent = s === 'auto' ? '돌 자동' : `${T[k].short}돌`; }
};

// ------------------------------------------------------------------ more stones from gathering
const BONUS = { rock: [['smooth', 0.18], ['flint', 0.05]], creek: [['flint', 0.12]], boulder: [['flint', 0.35], ['basalt', 0.1]] };
St.bonus = function (type) {
  const L = BONUS[type]; if (!L) return; const r = Math.random(); let a = 0;
  for (const [k, p] of L) { a += p; if (r < a) { Game.give(k, 1); G.UI.toast(`운 좋게 ${T[k].n} 1개를 찾았어요`); return; } }
};

// ------------------------------------------------------------------ round stones: throw one and it cracks into stones; it grows back two days later
const Ph = G.Phys;
if (Ph) {
  const throwIt = Ph.throwIt; Ph.throwIt = function () { const b = Ph.held; throwIt.apply(this, arguments); if (b && b.k === 'stone') b.thrown = 0.01; };
  const update = Ph.update; Ph.update = function (dt) {
    update.apply(this, arguments);
    for (const b of Ph.list) { if (!b.thrown || b.gone || b === Ph.held) continue; b.thrown += dt;
      const sp = Math.hypot(b.vx, b.vy, b.vz); if ((b.thrown > 0.3 && sp < 1.2 && b.sleep > 0.1) || b.thrown > 4) crack(b); }
  };
  const reset = Ph.reset; Ph.reset = function () {
    reset.apply(this, arguments);
    try { for (const b of Ph.list) if (b.k === 'stone') b.home = [b.x, b.z];
      for (const q of S().flags.stoneResp || []) for (const b of Ph.list) if (b.k === 'stone' && !b.gone && Math.hypot(b.x - q.x, b.z - q.z) < 0.5) { b.gone = true; break; } } catch (e) { }
  };
}
function crack(b) {
  b.gone = true; b.thrown = 0; const s = S(), r = Math.random(); let n = 2, extra = null;
  if (r < 0.2) extra = 'smooth'; else if (r > 0.96) extra = 'flint';
  Game.give('stone', n); if (extra) Game.give(extra, 1);
  G.UI.toast(`둥근 돌이 깨져서 돌 ${n}개가 되었어요${extra ? ` · ${T[extra].n} 1개도 나왔어요` : ''}`);
  if (G.FX) G.FX.burst(b.x, b.y, b.z, 14, { c: [0.7, 0.66, 0.58], sp: 2.4, up: 2, size: 0.08, g: 9 }); G.Audio && G.Audio.sfx('thud', { pitch: 1.5, vol: 0.8, x: b.x, z: b.z });
  if (b.home) (s.flags.stoneResp = s.flags.stoneResp || []).push({ x: b.home[0], z: b.home[1], day: s.day + 2 });
}
St.onDay = function (s) {
  const L = s.flags.stoneResp; if (!L || !L.length || !Ph) return; const keep = [];
  for (const q of L) { if (q.day > s.day) { keep.push(q); continue; } const b = Ph.add('stone', q.x, q.z); if (b) b.home = [q.x, q.z]; else keep.push({ x: q.x, z: q.z, day: s.day + 1 }); }
  s.flags.stoneResp = keep;
};

// ------------------------------------------------------------------ shops: limited stock per day
const SH = {
  market: [{ n: '돌 ×5', item: 'stone', qty: 5, price: 6, daily: 4, d: '물매에 쓰고 집도 지어요' }, { n: '매끄러운 돌 ×3', item: 'smooth', qty: 3, price: 14, daily: 3, d: '피해 ×1.5' }, { n: '부싯돌 ×2', item: 'flint', qty: 2, price: 30, daily: 2, d: '피해 ×2.1 · 급소를 잘 찔러요' }],
  stg_trav: [{ n: '돌 ×5', item: 'stone', qty: 5, price: 7, daily: 3, d: '' }, { n: '매끄러운 돌 ×2', item: 'smooth', qty: 2, price: 15, daily: 2, d: '피해 ×1.5' }],
  stg_hunt: [{ n: '매끄러운 돌 ×3', item: 'smooth', qty: 3, price: 13, daily: 3, d: '피해 ×1.5' }, { n: '부싯돌 ×3', item: 'flint', qty: 3, price: 26, daily: 2, d: '피해 ×2.1 · 급소' }, { n: '검은 돌 ×1', item: 'basalt', qty: 1, price: 55, daily: 2, d: '피해 ×2.8 · 맞으면 휘청거려요' }],
  stg_car: [{ n: '부싯돌 ×3', item: 'flint', qty: 3, price: 28, daily: 2, d: '피해 ×2.1 · 급소' }, { n: '검은 돌 ×2', item: 'basalt', qty: 2, price: 100, daily: 2, d: '피해 ×2.8 · 맞으면 휘청거려요' }],
};
St.shopList = id => SH[id] || [];
const rec = () => { const f = S().flags; if (!f.stB || f.stB.day !== S().day) f.stB = { day: S().day, c: {} }; return f.stB; };
St.left = (id, x) => Math.max(0, x.daily - (rec().c[id + ':' + x.item] || 0));
St.spent = (id, x) => { const r = rec(); r.c[id + ':' + x.item] = (r.c[id + ':' + x.item] || 0) + 1; };
})(window.G);
