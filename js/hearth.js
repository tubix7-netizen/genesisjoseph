/* 약속의 길 — the hearth: cooking with a little cutscene, and eating that you can see.
   · At any fire: 「요리하기」 opens a cooking cloth. Lay up to four ingredients on it (BotW-style free cooking); the dish
     follows from what went in — meat alone becomes 꼬치, fish 숯불 생선, meat with greens and water 고기 국, honey and
     fruit 꿀 대추 과자, greens 나물 무침, eggs 구운 새알, anything mixed 들판 모둠 요리. More ingredients, more servings.
     Then a short scene: Joseph crouches at the fire, sets out the pot or the skewers, it sizzles and steams, he tastes.
   · Eating anywhere: the food appears in his hand, two bites, chewing, crumbs — and the gain lands on the bite. */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI, clamp = G.clamp;
const H = G.Hearth = { pick: {} };
const $ = id => document.getElementById(id);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ------------------------------------------------------------------ what can go in, and what comes out
const KIND = { meat: 'meat', carp: 'fish', barbel: 'fish', tilapia: 'fish', catfish: 'fish', gfish: 'fish', perch: 'fish', mullet: 'fish',
  herb: 'green', caper: 'green', onion: 'green', cucumber: 'green', lentil: 'green', honey: 'sweet', dates: 'sweet', fig: 'sweet', carob: 'sweet', olive: 'green', egg: 'egg',
  wheat: 'grain', barley: 'grain', milk: 'milk', cheese: 'milk' };
H.KIND = KIND;
H.cookable = k => !!KIND[k];
// v15: many more dishes — each has its own recipe (and most a verse behind it). The first time you make one it goes in your recipe book.
const DISH = {
  lentilStew: { n: '붉은 렌틸 죽', ic: 'bean', c: '#b8502a', hp: 55, stam: 80, food: 50, pot: 'pot', water: 1, how: '렌틸콩 + 물 (+ 양파·약초·곡식)', ref: '야곱이 떡과 팥죽을 에서에게 주매 (창 25:34)' },
  fishStew: { n: '나일 생선 국', ic: 'fish', c: '#c8a060', hp: 60, stam: 70, food: 48, pot: 'pot', water: 1, how: '생선 + 양파나 곡식 + 물', ref: '' },
  fishHoney: { n: '구운 생선과 꿀', ic: 'fish', c: '#d8a040', hp: 45, stam: 95, food: 40, pot: 'spit', how: '생선 + 꿀이나 대추야자', ref: '구운 생선 한 토막과 벌집꿀 (눅 24:42)' },
  honeyMeat: { n: '대추꿀 고기구이', ic: 'meat', c: '#b8602a', hp: 60, stam: 100, food: 48, pot: 'spit', how: '고기 + 꿀이나 대추야자', ref: '' },
  flatbread: { n: '기름 바른 납작빵', ic: 'bread', c: '#e0b060', hp: 30, stam: 70, food: 40, pot: 'stone', how: '밀이나 보리 + 올리브', ref: '고운 가루에 기름을 섞은 과자 (레 2:4)' },
  parched: { n: '볶은 곡식', ic: 'grain', c: '#d8b040', hp: 15, stam: 45, food: 22, pot: 'stone', how: '밀이나 보리만', ref: '보아스가 볶은 곡식을 주매 (룻 2:14)' },
  porridge: { n: '젖 보리죽', ic: 'bowl', c: '#efe6cc', hp: 40, stam: 75, food: 45, pot: 'pot', how: '곡식 + 염소젖', ref: '' },
  milkHoney: { n: '젖과 꿀 한 그릇', ic: 'milk', c: '#f0d890', hp: 25, stam: 130, food: 30, pot: 'bowl', how: '염소젖이나 치즈 + 꿀이나 대추야자', ref: '젖과 꿀이 흐르는 땅 (출 3:8)' },
  figCake: { n: '무화과 뭉치', ic: 'berry', c: '#7a4a6a', hp: 20, stam: 90, food: 32, pot: 'stone', how: '무화과 두 개 이상 (+ 쥐엄 열매)', ref: '무화과 뭉치 이백 개 (삼상 25:18)' },
  figCheese: { n: '무화과 치즈 접시', ic: 'cheese', c: '#e0c080', hp: 35, stam: 80, food: 36, pot: 'bowl', how: '무화과 + 치즈', ref: '' },
  eggHerb: { n: '나물 새알 지짐', ic: 'berry', c: '#e8d070', hp: 32, stam: 40, food: 28, pot: 'stone', how: '새알 + 약초나 양파', ref: '' },
  cucSalad: { n: '오이 양파 무침', ic: 'veg', c: '#6a9a4a', hp: 22, stam: 35, food: 20, pot: 'bowl', how: '오이 + 양파나 약초', ref: '애굽에서 먹던 오이와 참외와 부추와 파와 마늘 (민 11:5)' },
  shepherd: { n: '목자의 치즈빵', ic: 'bread', c: '#e8c878', hp: 50, stam: 85, food: 46, pot: 'stone', how: '곡식 + 치즈 (+ 약초)', ref: '' },
};
const OLD = { meatStew: '고기 + 채소나 곡식 + 물', skewer: '고기 (+ 약초)', grilledFish: '생선 (+ 약초)', roastEgg: '새알만', sweetCake: '꿀이나 대추야자 + 곡식', herbMix: '약초·나물만', fieldPlate: '아무거나 섞어서' };
for (const k in DISH) { const d = DISH[k]; if (!Game.ITEMS[k]) Game.ITEMS[k] = { n: d.n, cat: 'food', p: Math.round((d.hp + d.stam) / 5), ic: d.ic, c: d.c, hp: d.hp, stam: d.stam }; }
if (G.Surv && G.Surv.FOOD) for (const k in DISH) G.Surv.FOOD[k] = DISH[k].food;
H.DISH = DISH; H.ALL = Object.keys(OLD).concat(Object.keys(DISH));
H.howTo = k => DISH[k] ? DISH[k].how : OLD[k];
H.result = function (pick) { // { item: n } → { out, n, pot }
  const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null; const has = c => ks.some(k => KIND[k] === c), only = (...cs) => ks.every(k => cs.includes(KIND[k]));
  const tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S(), wet = S.water > 0, sweet2 = pick.honey || pick.dates;
  const R0 = (out, pot, o) => Object.assign({ out, n: serv, pot }, o || {});
  if (pick.lentil && wet && !has('meat') && !has('fish')) return R0('lentilStew', 'pot', { water: 1 });
  if (has('meat') && (has('green') || has('grain')) && wet) return R0('meatStew', 'pot', { water: 1 });
  if (has('fish') && (pick.onion || has('grain')) && wet && !sweet2) return R0('fishStew', 'pot', { water: 1 });
  if (has('meat') && sweet2 && only('meat', 'sweet', 'green')) return R0('honeyMeat', 'spit');
  if (has('fish') && sweet2 && only('fish', 'sweet', 'green')) return R0('fishHoney', 'spit');
  if (only('meat', 'green') && has('meat')) return R0('skewer', 'spit');
  if (only('fish', 'green') && has('fish')) return R0('grilledFish', 'spit');
  if (has('egg') && only('egg', 'green') && has('green')) return R0('eggHerb', 'stone');
  if (only('egg')) return R0('roastEgg', 'stone');
  if (has('grain') && pick.cheese && only('grain', 'milk', 'green')) return R0('shepherd', 'stone');
  if (has('grain') && pick.milk && only('grain', 'milk', 'sweet')) return R0('porridge', 'pot');
  if (has('milk') && sweet2 && only('milk', 'sweet')) return R0('milkHoney', 'bowl');
  if (pick.fig && pick.cheese && only('sweet', 'milk')) return R0('figCheese', 'bowl');
  if ((pick.fig || 0) >= 2 && ks.every(k => k === 'fig' || k === 'carob' || k === 'dates')) return R0('figCake', 'stone');
  if (only('sweet', 'grain', 'milk') && has('sweet') && sweet2) return R0('sweetCake', 'stone');
  if (has('grain') && pick.olive && only('grain', 'green')) return R0('flatbread', 'stone');
  if (only('grain')) return R0('parched', 'stone');
  if (pick.cucumber && only('green') && (pick.onion || pick.herb || pick.caper)) return R0('cucSalad', 'bowl');
  if (only('green')) return R0('herbMix', 'pot');
  return R0('fieldPlate', 'stone');
};
H.known = () => { const S = Game.S(); return (S && S.flags && S.flags.dishes) || {}; };

// ------------------------------------------------------------------ the cooking cloth (UI)
function ensureUI() {
  if ($('cookUI')) return;
  const d = document.createElement('div'); d.className = 'overlay sheet'; d.id = 'cookUI'; d.hidden = true;
  d.innerHTML = `<div class="panel cook"><div class="p-head"><h3>모닥불 요리</h3><button class="p-x" id="cookX">닫기</button></div>
    <div class="p-body"><div class="cook-slots" id="cookSlots"></div><div class="cook-out" id="cookOut"></div>
    <div class="cook-foot"><button class="btn ghost" id="cookClose">나가기</button><button class="btn" id="cookGo">요리하기</button></div>
    <div class="sec">재료 고르기 · 여섯 가지까지</div><div class="grid" id="cookInv"></div>
    <button class="cook-bookT" id="cookBookT"><span id="cookBookH">요리 비법</span><i id="cookBookI">펼치기 ▾</i></button><div class="cook-book" id="cookBook" hidden></div></div></div>`;
  document.body.appendChild(d);
  $('cookX').onclick = () => H.close(); $('cookClose').onclick = () => H.close();
  $('cookBookT').onclick = () => { const b = $('cookBook'); b.hidden = !b.hidden; $('cookBookI').textContent = b.hidden ? '펼치기 ▾' : '접기 ▴'; sfx('click'); };
  $('cookGo').onclick = () => { const r = H.result(H.pick); if (!r) { G.UI.toast('재료를 골라 주세요'); return; } const pick = H.pick, st = H.st; H.close(); H.cook(pick, r, st); };
  $('cookInv').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k, S = Game.S(); const used = Object.values(H.pick).reduce((a, n) => a + n, 0);
    if ((H.pick[k] || 0) < (S.inv[k] || 0) && used < 6) { H.pick[k] = (H.pick[k] || 0) + 1; sfx('click'); } H.draw(); };
  $('cookSlots').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; H.pick[k]--; if (H.pick[k] <= 0) delete H.pick[k]; sfx('click'); H.draw(); };
}
H.draw = function () {
  const S = Game.S(), I = Game.ITEMS, icon = G.UI.itemIcon || (() => '');
  const slots = []; for (const k in H.pick) for (let i = 0; i < H.pick[k]; i++) slots.push(k); while (slots.length < 6) slots.push(null);
  $('cookSlots').innerHTML = slots.map(k => k ? `<button class="cslot full" data-k="${k}">${icon(k)}<span>${esc(I[k].n)}</span></button>` : '<div class="cslot"></div>').join('');
  const r = H.result(H.pick); $('cookOut').innerHTML = r ? `${icon(r.out)}<div><b>${esc(I[r.out].n)} ×${r.n}</b><span>${esc(dishLine(r))}</span></div>` : '<span class="muted">재료를 천 위에 올려 보세요. 무엇이 될지 여기 보여요.</span>';
  const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0 && KIND[k]);
  $('cookInv').innerHTML = ks.length ? ks.map(k => `<button class="card" data-k="${k}">${icon(k)}<div class="t"><b>${esc(I[k].n)}</b><span>×${S.inv[k] - (H.pick[k] || 0)}</span></div></button>`).join('') : '<p class="muted">요리할 재료가 없어요 · 사냥하고, 낚고, 들에서 약초와 열매를 찾아보세요.</p>';
  $('cookGo').disabled = !r;
  const kn = H.known(), n = H.ALL.filter(k => kn[k]).length; $('cookBookH').textContent = `요리 비법 · 알아낸 요리 ${n} / ${H.ALL.length}`;
  $('cookBook').innerHTML = H.ALL.map(k => kn[k] ? `<div class="cb on">${icon(k)}<div><b>${esc(I[k].n)}</b><span>${esc(H.howTo(k))}</span></div></div>` : `<div class="cb"><i class="cbq">?</i><div><b>???</b><span>${esc(hintOf(k))}</span></div></div>`).join('');
};
function hintOf(k) { const h = H.howTo(k) || ''; return '힌트 · ' + h.split(' + ')[0].replace(/\(.*\)/, '').trim() + '에 무언가를 더해 보세요'; }
function dishLine(r) { const it = Game.ITEMS[r.out]; const f = G.Surv ? G.Surv.food(r.out) : 0;
  return [it.hp ? `체력 +${it.hp}` : '', it.stam ? `기력 +${it.stam}` : '', f && Game.feat('surv') ? `배부름 +${f}` : '', r.water ? '물 한 번 사용' : ''].filter(Boolean).join(' · '); }
H.open = function (st) { ensureUI(); H.pick = {}; H.st = st; $('cookUI').hidden = false; G.UI.setBusy('cook', true); H.draw(); };
H.close = function () { const el = $('cookUI'); if (el) el.hidden = true; G.UI.setBusy('cook', false); };

// ------------------------------------------------------------------ the cooking scene
const MESH = {};
// v16: every dish has its own little cooking scene — the way it is made (stew pot, spit, hot stone, bowl, roasting grain), what sits
// on the fire (built for that dish: red lentils, a whole fish, flat breads, cucumber slices…), and what Joseph does and says.
const METHOD = { meatStew: 'stew', lentilStew: 'stew', fishStew: 'stew', porridge: 'stew', herbMix: 'stew',
  skewer: 'grill', honeyMeat: 'grill', grilledFish: 'grill', fishHoney: 'grill',
  flatbread: 'bake', sweetCake: 'bake', shepherd: 'bake', figCake: 'bake', roastEgg: 'bake', eggHerb: 'bake', fieldPlate: 'bake',
  parched: 'roast', cucSalad: 'bowl', milkHoney: 'bowl', figCheese: 'bowl' };
const LOOKS = { // what the dish looks like on the fire: [base colour, accent colour]
  meatStew: [0x8a4a2a, 0xa8582a], lentilStew: [0xb8502a, 0x6aa04a], fishStew: [0xd8b878, 0xe8e0d0], porridge: [0xefe6cc, 0xd8b050], herbMix: [0x5a8a3a, 0x8aba5a],
  skewer: [0xa8582a, 0x6aa04a], honeyMeat: [0xb8602a, 0xe8b040], grilledFish: [0xc88a40, 0xa86a30], fishHoney: [0xc88a40, 0xe8b040],
  flatbread: [0xe0b060, 0x8a9a3a], sweetCake: [0xd89a3a, 0x7a3a2a], shepherd: [0xe8c878, 0xf4e8b0], figCake: [0x6a3a5a, 0x8a5a6a], roastEgg: [0xefe6d2, 0xe8c040], eggHerb: [0xe8d070, 0x6aa04a], fieldPlate: [0xc8a060, 0x8a4a2a],
  parched: [0xd8b040, 0xa88030], cucSalad: [0x6a9a4a, 0xf0e8d0], milkHoney: [0xf6f2ea, 0xe8b040], figCheese: [0x7a4a6a, 0xf0d890] };
function cookware(out) { const key = 'd_' + out; if (MESH[key]) return MESH[key]; const g = new G.GB(31 + out.length), m = METHOD[out] || 'bake', [c1, c2] = LOOKS[out] || [0xc8a060, 0x8a4a2a];
  const rocks = (rr, y) => { for (let i = 0; i < 3; i++) { const a = i / 3 * PI * 2 + 0.5; g.sph(0.12, 5, 4, { at: [Math.cos(a) * rr, y || 0.08, Math.sin(a) * rr], c: 0x7a7268, flat: true }); } };
  if (m === 'stew') { rocks(0.32); g.lathe([[0.08, 0.14], [0.26, 0.2], [0.3, 0.38], [0.24, 0.55], [0.26, 0.6]], 12, { c: 0x9a5a34, j: 0.03 }); g.cyl(0.235, 0.235, 0.02, 12, { at: [0, 0.53, 0], c: c1 });
    for (let i = 0; i < 6; i++) g.sph(0.035, 5, 3, { at: [Math.cos(i * 1.9) * 0.13, 0.55, Math.sin(i * 1.9) * 0.13], s: [1, 0.5, 1], c: i % 2 ? c2 : c1 });
    g.cyl(0.012, 0.012, 0.55, 4, { at: [0.12, 0.72, 0.02], rz: -0.5, c: 0x8a6a40 }); }
  else if (m === 'grill') { for (const s2 of [1, -1]) g.cyl(0.025, 0.03, 0.7, 5, { at: [s2 * 0.45, 0.35, 0], c: 0x6a4a2a }); g.cyl(0.015, 0.015, 1.05, 4, { at: [0, 0.62, 0], rz: PI / 2, c: 0x8a6a40 });
    if (out === 'grilledFish' || out === 'fishHoney') { g.sph(0.07, 7, 5, { at: [0, 0.62, 0], s: [3.6, 1.1, 0.6], c: c1 }); g.sph(0.06, 5, 3, { at: [0.3, 0.62, 0], s: [0.6, 1.4, 0.3], c: c2 }); if (out === 'fishHoney') g.sph(0.05, 5, 3, { at: [-0.05, 0.69, 0], s: [3, 0.3, 0.6], c: 0xe8b040 }); }
    else for (let i = 0; i < 5; i++) g.sph(0.065, 6, 4, { at: [-0.28 + i * 0.14, 0.62, 0], s: [1, 0.85, 0.85], c: i % 2 && out === 'skewer' ? c2 : c1 }); }
  else if (m === 'bowl') { g.lathe([[0.04, 0.02], [0.24, 0.06], [0.3, 0.2], [0.32, 0.24]], 12, { c: 0x2f8a77, j: 0.02 }); g.cyl(0.27, 0.27, 0.02, 12, { at: [0, 0.18, 0], c: out === 'milkHoney' ? c1 : 0xe8d8b0 });
    if (out === 'milkHoney') { for (let i = 0; i < 8; i++) g.sph(0.03, 4, 3, { at: [Math.cos(i * 0.8) * i * 0.022, 0.2, Math.sin(i * 0.8) * i * 0.022], s: [1, 0.3, 1], c: c2 }); }
    else if (out === 'cucSalad') { for (let i = 0; i < 10; i++) g.cyl(0.045, 0.045, 0.012, 7, { at: [Math.cos(i * 1.4) * (0.05 + (i % 3) * 0.05), 0.21 + (i % 2) * 0.01, Math.sin(i * 1.4) * (0.05 + (i % 3) * 0.05)], rx: 0.3, c: i % 3 ? c1 : 0xd0c090 }); }
    else for (let i = 0; i < 6; i++) { g.sph(0.06, 6, 4, { at: [Math.cos(i * 1.1) * 0.12, 0.23, Math.sin(i * 1.1) * 0.12], c: i % 2 ? c1 : c2 }); } }
  else { rocks(0.3); g.cyl(0.36, 0.38, 0.06, 9, { at: [0, 0.22, 0], c: 0x8a8278, j: 0.05, flat: true });
    if (m === 'roast') for (let i = 0; i < 26; i++) g.sph(0.018, 3, 2, { at: [Math.cos(i * 2.4) * (i % 7) * 0.04, 0.26, Math.sin(i * 2.4) * (i % 7) * 0.04], s: [1.4, 0.7, 1], c: i % 3 ? c1 : c2 });
    else if (out === 'roastEgg' || out === 'eggHerb') for (let i = 0; i < 3; i++) { g.sph(0.055, 7, 5, { at: [(i - 1) * 0.15, 0.3, 0.02], s: [0.85, 1.15, 0.85], c: out === 'eggHerb' ? 0xf4ecd8 : c1 }); if (out === 'eggHerb') g.sph(0.03, 4, 3, { at: [(i - 1) * 0.15 + 0.05, 0.27, 0.06], c: c2 }); }
    else for (let i = 0; i < 3; i++) { const fl = out === 'flatbread' || out === 'shepherd'; g.sph(fl ? 0.13 : 0.085, 8, 4, { at: [(i - 1) * (fl ? 0.2 : 0.16), 0.27, (i % 2) * 0.06], s: [1, fl ? 0.18 : 0.55, 1], c: c1 }); g.sph(0.025, 4, 3, { at: [(i - 1) * (fl ? 0.2 : 0.16) + 0.03, fl ? 0.3 : 0.33, 0.02], c: c2 }); } }
  return (MESH[key] = G.R.mesh(g)); }
const SCRIPT = { // [text, act, sound, fx] per stage; the last stage is always tasting
  stew: [['{in}을(를) 송송 썰어 냄비에 담아요', 'gather', 'gather', null], ['물을 붓고 휘휘 저어요', 'water', 'water', 'splash'], ['보글보글… 구수한 냄새가 퍼져요', 'milk', 'bubble', 'steam']],
  grill: [['{in}을(를) 꼬챙이에 꿰어요', 'gather', 'gather', null], ['불 위에서 이리저리 돌려 가며 구워요', 'milk', 'fire', 'spark'], ['지글지글… 기름이 불에 떨어져요', 'warmHands', 'fire', 'spark']],
  bake: [['{in}을(를) 조물조물 반죽해요', 'plant', 'gather', 'flour'], ['달군 돌 위에 척 올려요', 'pick', 'thud', 'spark'], ['노릇노릇… 한 번 뒤집어요', 'milk', 'fire', 'steam']],
  roast: [['{in}을(를) 달군 돌에 펼쳐요', 'pick', 'gather', null], ['타닥타닥… 알곡이 톡톡 튀어요', 'milk', 'fire', 'pop']],
  bowl: [['{in}을(를) 가지런히 손질해요', 'gather', 'gather', null], ['그릇에 담아 조물조물 버무려요', 'milk', 'click', null]] };
H.METHOD = METHOD; H.LOOKS = LOOKS;
const TASTE = H.TASTE = { lentilStew: '구수하다… 에서 형님도 이 냄새는 못 참았겠는걸.', fishStew: '나일 강 냄새가 나는 국이야.', fishHoney: '짭짤하고 달콤하다!', honeyMeat: '꿀이 졸아서 반짝반짝해!', flatbread: '겉은 바삭, 속은 촉촉!',
  parched: '고소하다! 한 줌만 더…', porridge: '따뜻한 죽이 속을 달래 줘.', milkHoney: '아, 이게 젖과 꿀의 맛이구나.', figCake: '쫀득쫀득 달다!', figCheese: '달콤하고 짭짤해.', eggHerb: '새알이 보들보들해.', cucSalad: '아삭아삭 시원하다!', shepherd: '들에서 먹으니 더 맛있다.' };
H.cook = function (pick, r, st) {
  const S = Game.S(), P = Game.P, W = Game.W(); if (!st) st = { x: P.x + Math.sin(P.face) * 1.3, z: P.z + Math.cos(P.face) * 1.3 };
  for (const k in pick) Game.take(k, pick[k]); if (r.water) S.water = Math.max(0, S.water - r.water);
  const fx = st.x, fz = st.z, fy = W.heightAt(fx, fz); let a = Math.atan2(P.x - fx, P.z - fz); if (!isFinite(a)) a = 0;
  const hx = fx + Math.sin(a) * 1.15, hz = fz + Math.cos(a) * 1.15; const face = Math.atan2(fx - hx, fz - hz);
  const side = a + PI / 2, m = METHOD[r.out] || 'bake', [c1] = LOOKS[r.out] || [0xc8a060]; const ware = { mesh: cookware(r.out), m: G.m4trs(G.m4(), fx, fy, fz, face), outline: true }; H.ware = ware;
  const top = m === 'stew' ? 0.62 : m === 'grill' ? 0.66 : m === 'bowl' ? 0.24 : 0.3, col = [((c1 >> 16) & 255) / 255, ((c1 >> 8) & 255) / 255, (c1 & 255) / 255];
  const FXK = { steam: n => G.FX.burst(fx, fy + top, fz, n, { c: [0.95, 0.95, 0.95], sp: 0.3, up: 1.2, size: 0.32, a: 0.35, g: -0.4, life: 1.6, drag: 1 }),
    spark: n => G.FX.burst(fx, fy + top - 0.1, fz, n, { c: [1, 0.6, 0.25], sp: 0.9, up: 2.2, size: 0.06, a: 1, g: 3, life: 0.6, drag: 1 }),
    flour: n => G.FX.burst(hx + Math.sin(face) * 0.5, fy + 0.5, hz + Math.cos(face) * 0.5, n, { c: [0.97, 0.95, 0.9], sp: 0.5, up: 0.6, size: 0.12, a: 0.5, g: 0.3, life: 1, drag: 1 }),
    splash: n => G.FX.burst(fx, fy + top, fz, n, { c: [0.6, 0.75, 0.85], sp: 0.6, up: 1.2, size: 0.05, g: 6, life: 0.6 }),
    pop: n => G.FX.burst(fx, fy + top, fz, n, { c: col, sp: 0.8, up: 2.4, size: 0.035, g: 9, life: 0.7 }) };
  const em = k => { P.emote = { k, t: 0, dur: 0 }; };
  const name = Game.ITEMS[r.out].n, inN = Object.keys(pick).map(k => Game.ITEMS[k].n).join(', ');
  const cams = [ // a different angle for each stage: wide over the shoulder, low by the fire, across the fire, and on his face
    [hx + Math.sin(side) * 2.2 + Math.sin(a) * 1.1, fy + 1.15, hz + Math.cos(side) * 2.2 + Math.cos(a) * 1.1, (hx + fx) / 2, fy + 0.6, (hz + fz) / 2, 0.8],
    [fx + Math.sin(side) * 0.95, fy + 0.6, fz + Math.cos(side) * 0.95, fx, fy + top * 0.8, fz, 0.6],
    [fx - Math.sin(side) * 1.25 - Math.sin(a) * 0.35, fy + 0.95, fz - Math.cos(side) * 1.25 - Math.cos(a) * 0.35, fx + (hx - fx) * 0.25, fy + top * 0.9, fz + (hz - fz) * 0.25, 0.68]];
  const shots = SCRIPT[m].map(([t, act, snd, fxk], i) => { const c = cams[i % cams.length]; return {
    fn: () => { if (i === 0) { Game.teleport(hx, hz, face); P.y = W.heightAt(hx, hz); } em(act); sfx(snd === 'pop' ? 'fire' : snd, { vol: 0.8, pitch: snd === 'thud' ? 1.4 : 1 }); },
    cam: [c[0], c[1], c[2]], cam2: [c[0] + Math.sin(side) * 0.15, c[1] + 0.05, c[2] + Math.cos(side) * 0.15], look: [c[3], c[4], c[5]], dur: i === 0 ? 2.2 : 2.5, fov: c[6], t: t.replace('{in}', inN),
    each: tt => { if (P.emote) P.emote.t = tt; H.fxT = (H.fxT || 0) - 1 / 60; if (fxk && H.fxT <= 0) { H.fxT = fxk === 'pop' ? 0.18 : 0.12; FXK[fxk](fxk === 'steam' ? 2 : 3); if (fxk === 'pop' && Math.random() < 0.5) sfx('click', { vol: 0.4, pitch: 1.6 + Math.random() * 0.5 }); }
      if (m === 'stew' && i === 2 && Math.random() < 0.03) sfx('bubble', { vol: 0.4 }); if (m === 'grill' && Math.random() < 0.02) sfx('fire', { vol: 0.4 }); } }; });
  if (H.extraShots) H.extraShots(shots, { fx, fy, fz, hx, hz, face, side, a, top, FXK, em, r, pick, m, name, inN }); // v16.9 cuisine.js: seasoning, happenings, more angles
  shots.push({ fn: () => { em('eat'); sfx('eat'); Game.give(r.out, r.n, true); sfx('craft'); S.stats.crafted['cook_' + r.out] = (S.stats.crafted['cook_' + r.out] || 0) + 1; const kn = S.flags.dishes = S.flags.dishes || {}; if (!kn[r.out]) { kn[r.out] = 1; H.newDish = r.out; } },
    cam: [hx + Math.sin(a) * 1.6 + Math.sin(side) * 0.6, fy + 1.45, hz + Math.cos(a) * 1.6 + Math.cos(side) * 0.6], look: [hx, fy + 1.35, hz], dur: 2.6, fov: 0.62,
    n: '요셉', t: TASTE[r.out] || ['음… 맛있다!', '따뜻하다… 살 것 같아.', '아버지가 해 주시던 맛이 나.'][Math.floor(Math.random() * 3)], each: t => { if (P.emote) P.emote.t = t * 0.7; } });
  G.Cine.play(shots, () => { P.emote = null; H.ware = null; G.UI.gain && G.UI.gain(r.out, r.n);
    if (H.newDish === r.out) { H.newDish = null; const n = H.ALL.filter(k => H.known()[k]).length, d = DISH[r.out]; G.UI.featCard && G.UI.featCard('dish', { kick: `새 요리 · ${n} / ${H.ALL.length}`, n: name, ic: 'bread', d: d && d.ref ? d.ref : '요리 비법에 적어 두었어요' }); }
    G.UI.toast(`${name} ${r.n}개를 만들었어요 · 가방에서 먹을 수 있어요`); Game.checkStep(); });
};

// ------------------------------------------------------------------ eating you can see
const FOODM = {};
function foodMesh(k) { const it = Game.ITEMS[k], ic = it && it.ic, key = ic === 'meat' || ic === 'fish' || ic === 'bread' || ic === 'berry' ? ic : 'misc'; if (FOODM[key]) return FOODM[key]; const g = new G.GB(40 + key.length);
  if (key === 'meat') { g.sph(0.06, 6, 5, { s: [1.5, 1, 1], c: 0xa8582a }); g.cyl(0.012, 0.012, 0.12, 4, { at: [0.09, 0, 0], rz: PI / 2, c: 0xece4d0 }); }
  else if (key === 'fish') { g.sph(0.05, 6, 5, { s: [2.4, 1, 0.6], c: 0xc88a40 }); g.sph(0.035, 4, 3, { at: [0.13, 0, 0], s: [0.6, 1.2, 0.3], c: 0xa86a30 }); }
  else if (key === 'bread') { g.sph(0.07, 7, 5, { s: [1.2, 0.6, 1], c: 0xd8a85a }); }
  else if (key === 'berry') { for (let i = 0; i < 3; i++) g.sph(0.03, 5, 4, { at: [(i - 1) * 0.035, 0, (i % 2) * 0.02], c: it.c ? parseInt(it.c.slice(1), 16) : 0x9a4a24 }); }
  else g.sph(0.05, 6, 4, { c: it && it.c ? parseInt(it.c.slice(1), 16) : 0xc8a060 });
  return (FOODM[key] = G.R.mesh(g)); }
H.eatStart = function (k) { const P = Game.P; H.eatK = k; H.eatT = 0; H.bit = 0; };
H.dyn = function (list) {
  const P = Game.P; if (H.ware) list.push(H.ware);
  const e = P.emote; if (!e || (e.k !== 'eat' && e.k !== 'drink') || !H.eatK) return;
  const m = G.m4mul(H.eM || (H.eM = G.m4()), P.rig.world[G.HBI.handR], G.m4trs(H.eL || (H.eL = G.m4()), 0, -0.08, 0.04, 0));
  list.push({ mesh: foodMesh(H.eatK), m, shadow: false });
  // two bites: crumbs and a crunch on each
  const p = e.dur ? e.t / e.dur : 0, bite = Math.floor(p * 2.0 + 0.15); if (bite > H.bit && bite <= 2) { H.bit = bite; const hm = P.rig.world[G.HBI.head]; G.FX.burst(hm[12], hm[13] - 0.05, hm[14], 4, { c: [0.85, 0.7, 0.45], sp: 0.5, up: 0.4, size: 0.04, g: 6 }); sfx('eat', { vol: 0.6, pitch: 0.9 + Math.random() * 0.25 }); }
  if (p >= 1) H.eatK = null;
};
})(window.G);
