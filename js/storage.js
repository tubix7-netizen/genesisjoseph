/* 약속의 길 — 가방과 개인 창고 (v18.14)
   · 가방: 도구 / 음식 / 재료 / 씨앗 / 돌·화살 / 귀중품 / 그 밖에 로 나눠 보여 주고, 위쪽 칸 단추로 골라 봐요. 씨앗은 여기서 「심을 씨앗」으로
     고르고(왼쪽 씨앗 단추는 없앴어요), 음식은 「퀵슬롯」에 등록할 수 있어요.
   · 칸: 가방은 물건 종류 수로 칸을 써요. 기본 16칸 + 이야기 장마다 2칸 + 체력 레벨마다 1칸 + 부탁 2개마다 1칸 (최대 48).
     칸을 넘기면 물건은 그대로 들어오지만 짐이 무거워 걸음이 느려져요 → 잠자리 옆 「개인 창고」에 맡겨요.
   · 개인 창고: 잠자리(헤브론 장막·종들의 숙소·옥·총리 관저, 직접 지은 움막·집)마다 나무 궤짝. 보관함과 옷장이 여기 있어요. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, $ = id => document.getElementById(id), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const S = () => Game.S(), P = () => Game.P, EP = () => Game.EP();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const Bg = G.Bag = {}, St = G.Storage = {}, EPJ = G.EP && G.EP.joseph; if (!EPJ) return;

// ------------------------------------------------------------------ what kind of thing is it
const CATS = [['all', '전체'], ['food', '음식'], ['mat', '재료'], ['seed', '씨앗'], ['ammo', '돌·화살'], ['val', '귀중품'], ['etc', '그 밖에']];
const edible = k => G.Carry ? G.Carry.edible(k) : !!(Game.ITEMS[k] && (Game.ITEMS[k].stam || Game.ITEMS[k].hp));
function catOf(k) { const it = Game.ITEMS[k]; if (!it) return 'etc';
  if (it.cat === 'seed') return 'seed';
  if ((G.Stones && G.Stones.T && G.Stones.T[k]) || k === 'stone' || k === 'arrow') return 'ammo';
  if (it.cat === 'key' || /^r_|^tr[A-Z]/.test(k) || it.cat === 'good') return 'val';
  if (edible(k)) return 'food';
  if (it.cat === 'mat' || it.cat === 'crop' || it.cat === 'hunt') return 'mat';
  return 'etc'; }
Bg.catOf = catOf;

// ------------------------------------------------------------------ how big the bag is
St.cap = function () { const s = S(); if (!s) return 16; const st = EP().steps[s.step], ch = (st && st.ch) || 1, lvl = (s.hero && s.hero.lvl) || 1, done = Object.keys((s.side && s.side.done) || {}).length;
  return Math.min(48, 16 + 2 * Math.max(0, ch - 1) + (lvl - 1) + Math.floor(done / 2)); };
St.used = () => Object.keys(S().inv).filter(k => S().inv[k] > 0 && Game.ITEMS[k]).length;
St.over = () => St.used() > St.cap();

// ------------------------------------------------------------------ the bag tab
let cat = 'all';
Bg.render = function (body, again) { const s = S(), used = St.used(), cap = St.cap();
  const tools = Object.keys(s.tools).filter(k => s.tools[k]), items = Object.keys(s.inv).filter(k => s.inv[k] > 0 && Game.ITEMS[k]);
  const order = CATS.map(c => c[0]); items.sort((a, b) => order.indexOf(catOf(a)) - order.indexOf(catOf(b)) || Game.ITEMS[a].n.localeCompare(Game.ITEMS[b].n, 'ko'));
  const shown = cat === 'all' ? items : items.filter(k => catOf(k) === cat), n = c => items.filter(k => catOf(k) === c).length;
  const card = k => { const it = Game.ITEMS[k], c = catOf(k), btn = [];
    if (edible(k)) { btn.push(`<button class="sbtn" data-eat="${k}">먹기</button>`); btn.push(`<button class="sbtn ${s.quick === k ? 'pri' : ''}" data-quick="${k}">${s.quick === k ? '퀵슬롯 ✓' : '퀵슬롯'}</button>`); }
    if (c === 'seed') btn.push(`<button class="sbtn ${s.seedSel === k ? 'pri' : ''}" data-seed="${k}">${s.seedSel === k ? '심을 씨앗 ✓' : '심을 씨앗'}</button>`);
    const sub = G.Cuisine && G.Cuisine.line && edible(k) ? G.Cuisine.line(k) : '';
    return `<div class="card bag-${c}">${UI.itemIcon(k)}<div class="t"><b>${esc(it.n)} <i class="bn">×${s.inv[k]}</i></b><span>${esc(sub || CATS.find(x => x[0] === c)[1])}</span></div><div class="bb">${btn.join('')}</div></div>`; };
  body.innerHTML = `<div class="bagHead"><b class="${used > cap ? 'full' : ''}">가방 ${used}/${cap}칸</b><span>은 ${s.silver}${used > cap ? ' · 짐이 무거워요! 잠자리 옆 창고에 맡겨요' : ''}</span></div>
    <div class="sec">도구</div><div class="grid bagG">${tools.length ? tools.map(k => `<div class="card">${UI.icon('tool', Game.hand() === k ? '#f0d8b0' : '#c8c0b0')}<div class="t"><b>${esc(Game.TOOLS[k])}</b><span>${k === 'jar' || k === 'bigjar' ? `항아리 · ${G.Carry ? G.Carry.jarLabel() : '물 ' + s.water}` : Game.hand() === k ? '손에 들고 있어요' : '가방 속'}</span></div><div class="bb">${Game.TOOL_PROP[k] ? `<button class="sbtn" data-hold="${Game.hand() === k ? '' : k}">${Game.hand() === k ? '내려놓기' : '손에 들기'}</button>` : ''}</div></div>`).join('') : '<div class="card"><div class="t"><span>아직 도구가 없어요. 제작 탭에서 만들 수 있어요.</span></div></div>'}</div>
    <div class="sec">소지품</div><div class="chips">${CATS.map(([k, l]) => k === 'all' || n(k) ? `<button class="chip ${cat === k ? 'on' : ''}" data-cat="${k}">${l}${k === 'all' ? '' : ' ' + n(k)}</button>` : '').join('')}</div>
    <div class="grid bagG">${shown.length ? shown.map(card).join('') : '<div class="card"><div class="t"><span>비어 있어요</span></div></div>'}</div>`;
  body.onclick = e => { const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
    if (d.cat) cat = d.cat; else if (d.eat) Game.eat(d.eat); else if (d.quick) G.Carry && G.Carry.setQuick(s.quick === d.quick ? null : d.quick);
    else if (d.seed) { s.seedSel = d.seed; UI.toast(`심을 씨앗 · ${Game.ITEMS[d.seed].n}`); } else if (d.hold !== undefined) Game.hold(d.hold || null); else return;
    UI.hud(); again(); }; };

// ------------------------------------------------------------------ personal chests by every bed
const chests = () => { const out = []; for (const st of EP().stations || []) { if (st.type !== 'bed' || (st.on && !st.on(S(), Game))) continue; out.push({ id: st.id, x: st.x + 1.15, z: st.z + 0.75 }); } return out; };
St.near = () => chests().some(c => Math.hypot(c.x - P().x, c.z - P().z) < 2.2);
Game.CTX.push(function () { const p = P(); if (p.ride || p.swim || p.act || p.climb || Game.cineOn || (G.Phys && G.Phys.held)) return null;
  for (const c of chests()) { const d = Math.hypot(c.x - p.x, c.z - p.z); if (d < 1.6) return [{ d: d - 0.2, label: '개인 창고 열기', x: c.x, z: c.z, y: 0.9, use: St.open, key: 'chest:' + c.id }]; } return null; });
let chestMesh = null; const CM = {};
const dyn0 = EPJ.dyn; EPJ.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); try { if (Game.mode !== 'play') return; const W = Game.W();
  for (const c of chests()) { if (Math.hypot(c.x - P().x, c.z - P().z) > 60) continue;
    if (!chestMesh) { const g = new G.GB(37); g.box(0.9, 0.5, 0.55, { at: [0, 0.25, 0], c: 0x8a5a32 }); g.box(0.94, 0.12, 0.59, { at: [0, 0.55, 0], c: 0x6e4424 }); for (const x of [-0.36, 0.36]) g.box(0.06, 0.52, 0.6, { at: [x, 0.27, 0], c: 0x4a3a2a }); g.box(0.12, 0.12, 0.04, { at: [0, 0.44, 0.3], c: 0xc8a040 }); chestMesh = G.R.mesh(g); }
    const m = CM[c.id] || (CM[c.id] = G.m4()); G.m4trs(m, c.x, W.heightAt(c.x, c.z), c.z, 0, 0, 0, 1, 1, 1); list.push({ mesh: chestMesh, m, outline: true }); } } catch (e) { } };

/* v18.21 one box panel for the personal chest (with the wardrobe) and the chariot's cargo space */
St.openBox = function (title, key, withWard, cap) { const s = S(), box = s[key] || (s[key] = {}); sfx('door', { vol: 0.5, pitch: 1.3 });
  const ward = withWard && EP().openWardrobe && EP().wardOk && EP().wardOk(s);
  UI.openPanel(title, withWard ? [['store', '보관함'], ['ward', '옷장']] : null, 'store', function render(tab, body) {
    if (tab === 'ward') { body.innerHTML = ward ? `<div class="card"><div class="t"><b>옷장</b><span>모은 옷과 장신구를 고르고 갈아입어요.</span></div><button class="sbtn pri" id="wardGo">옷장 열기</button></div>` : '<div class="card"><div class="t"><span>총리가 된 뒤에 옷장을 쓸 수 있어요.</span></div></div>';
      if ($('wardGo')) $('wardGo').onclick = () => { UI.closePanel(); EP().openWardrobe(S(), Game); }; return; }
    const inv = Object.keys(s.inv).filter(k => s.inv[k] > 0 && Game.ITEMS[k]).sort((a, b) => Game.ITEMS[a].n.localeCompare(Game.ITEMS[b].n, 'ko')), st = Object.keys(box).filter(k => box[k] > 0 && Game.ITEMS[k]).sort((a, b) => Game.ITEMS[a].n.localeCompare(Game.ITEMS[b].n, 'ko'));
    const row = (k, n, act, lab) => `<div class="card">${UI.itemIcon(k)}<div class="t"><b>${esc(Game.ITEMS[k].n)} <i class="bn">×${n}</i></b><span>${esc(CATS.find(x => x[0] === catOf(k))[1])}</span></div><div class="bb"><button class="sbtn" data-${act}="${k}">${lab}</button></div></div>`;
    body.innerHTML = `<div class="bagHead"><b class="${St.over() ? 'full' : ''}">가방 ${St.used()}/${St.cap()}칸</b><span>${cap ? `${title} ${Object.keys(box).filter(q => box[q] > 0).length}/${cap}칸` : '창고에는 칸 제한이 없어요'}</span></div>
      <div class="chips"><button class="chip" data-bulk="mat">재료 모두 맡기기</button><button class="chip" data-bulk="val">귀중품 모두 맡기기</button><button class="chip" data-bulk="etc">그 밖에 모두 맡기기</button></div>
      <div class="sec">가방</div><div class="grid bagG">${inv.length ? inv.map(k => row(k, s.inv[k], 'put', '맡기기')).join('') : '<div class="card"><div class="t"><span>비어 있어요</span></div></div>'}</div>
      <div class="sec">${cap ? title : '창고'}</div><div class="grid bagG">${st.length ? st.map(k => row(k, box[k], 'take', '꺼내기')).join('') : '<div class="card"><div class="t"><span>창고가 비어 있어요</span></div></div>'}</div>`;
    body.onclick = e => { const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      const put = k => { const n = s.inv[k]; if (!n) return; if (cap && !box[k] && Object.keys(box).filter(q => box[q] > 0).length >= cap) { UI.toast(`${title}이 꽉 찼어요 (${cap}칸)`); return; } box[k] = (box[k] || 0) + n; s.inv[k] = 0; delete s.inv[k]; if (s.quick === k) s.quick = null; };
      if (d.put) put(d.put); else if (d.take) { s.inv[d.take] = (s.inv[d.take] || 0) + box[d.take]; delete box[d.take]; } else if (d.bulk) Object.keys(s.inv).filter(k => catOf(k) === d.bulk).forEach(put); else return;
      sfx('pickup', { vol: 0.5 }); UI.hud(); render('store', body); Game.save && Game.save(true); }; }); };

St.open = () => { St.openBox('개인 창고', 'store', true); UI.help && UI.help('chest', '개인 창고', '맡긴 물건은 칸을 쓰지 않아요 · 옷장도 여기'); };
// ------------------------------------------------------------------ heavy bag: slower steps; a bigger bag as Joseph grows
const sm0 = EPJ.speedMul; EPJ.speedMul = function (s, p, mag) { const r = sm0 ? sm0.apply(this, arguments) : 1; return St.over() && !(s.q && s.q.riding) ? r * 0.82 : r; };
let tick = 0, warnT = -999, tAll = 0;
const up0 = EPJ.update; EPJ.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play') return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60; tAll += d;
  if ((tick += d) > 2) { tick = 0; try { const s = S(), cap = St.cap(); s.flags.bagCap = s.flags.bagCap || cap; if (cap > s.flags.bagCap) { UI.toast(`가방이 넓어졌어요 · ${cap}칸`); s.flags.bagCap = cap; }
    if (St.over() && tAll - warnT > 90 && !UI.busy()) { warnT = tAll; UI.toast(`가방이 꽉 찼어요 (${St.used()}/${cap}칸) · 짐이 무거워 느려져요 · 잠자리 옆 창고에 맡겨요`); } } catch (e) { console.error('storage', e); } }
  return r; };

// seeds are chosen in the bag now: the left seed button goes
const hud0 = UI.hud; UI.hud = function () { const r = hud0.apply(this, arguments); const sb = $('seedBtn'); if (sb) sb.hidden = true; return r; };

const css = document.createElement('style'); css.textContent = `
.bagHead{display:flex;align-items:baseline;gap:10px;margin:2px 2px 8px;font-size:13px}.bagHead b{font-size:15px;color:#f0d8a8}.bagHead b.full{color:#ff9a7a}.bagHead span{opacity:.75;font-size:12px}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}.chips .chip{font-size:12px;padding:5px 10px;border-radius:14px;border:1px solid #6a5a40;background:rgba(40,30,18,.6);color:#e8dcc0}.chips .chip.on{background:#8a6a32;color:#fff;border-color:#e5b552}
.bagG{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.bagG .card{flex-wrap:wrap;align-items:flex-start}.bagG .card .t{flex:1 1 0;min-width:0}.bagG .card .t span{white-space:normal;line-height:1.3}.card .bb{display:flex;gap:4px;width:100%;flex-wrap:wrap}.card .bb:empty{display:none}.card .bb .sbtn{flex:1;padding:5px 6px;font-size:11.5px}.card i.bn{font-style:normal;opacity:.7;font-weight:500;font-size:.9em}
.card.bag-food{border-left:3px solid #c8a050}.card.bag-mat{border-left:3px solid #8a9a6a}.card.bag-seed{border-left:3px solid #6aa048}.card.bag-ammo{border-left:3px solid #9a9a9a}.card.bag-val{border-left:3px solid #e5b552}.card.bag-etc{border-left:3px solid #7a6a5a}`;
document.head.appendChild(css);
})(window.G);
