/* 약속의 길 — 손에 든 것 (v18.14)
   · 물항아리: 손에 항아리(도구)를 들면 행동 단추가 「마시기」가 돼요. 항아리에는 물뿐 아니라 가방의 음료(염소젖·박하 차·석류즙…)를
     담을 수 있고, 왼쪽 물 단추를 누르면 담긴 음료가 바로바로 바뀌어요 (왼쪽의 「물 마시기」 단추는 없앴어요).
   · 들고 있는 물건(항아리·바구니·수박·자루…): 공격/쏘기 자리는 「던지기」, 행동 단추는 「두기」(앞에 반듯하게 내려놓기),
     그리고 작은 「쓰기」 단추로 물건마다 할 일 — 수박 쪼개 먹기, 바구니·자루 살펴보기, 항아리 물 마시기.
   · 빠른 칸: 음식 하나를 등록해 두면 오른쪽 작은 단추로 바로 먹어요 (가방에서 「빠른 칸」). */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const S = () => Game.S(), P = () => Game.P;
const Ca = G.Carry = {};
const LIQ = /차$|즙|젖|냉수|물$|술|화채|우유|냉즙/;
const isLiquid = k => { const it = Game.ITEMS[k]; return !!it && (k === 'milk' || LIQ.test(it.n)) && (it.stam || it.hp || (G.Surv && G.Surv.food(k) > 0) || (G.Cuisine && G.Cuisine.CLS && G.Cuisine.CLS[k])); };
const edible = k => { const it = Game.ITEMS[k]; return !!it && !!(it.stam || it.hp || (G.Surv && G.Surv.food(k) > 0)); };
const hasJar = () => Game.tool('jar') || Game.tool('bigjar');
const jarK = () => { const s = S(); if (s.jarK && s.jarK !== 'water' && !(Game.inv(s.jarK) > 0)) s.jarK = 'water'; return s.jarK || 'water'; };
Ca.liquids = () => ['water', ...Object.keys(S().inv).filter(k => S().inv[k] > 0 && isLiquid(k))];
Ca.jarLabel = () => { const k = jarK(); return k === 'water' ? `물 ${S().water}` : `${Game.ITEMS[k].n} ${Game.inv(k)}`; };

// ------------------------------------------------------------------ drinking from the jar in your hand
function breath(gain) { const p = P(), H = S().hero, cap = (G.Vitals && G.Vitals.cap) || (H.stamMax || 140); p.stam = Math.min(cap, p.stam + gain); p.exhausted = false; }
Ca.drink = function () { const s = S(), k = jarK(); if (Game.P.act || G.UI.busy()) return;
  if (k === 'water') { if (s.water <= 0) { G.UI.toast('항아리가 비었어요 · 우물이나 물가에서 길어요'); return; } s.water--; breath(35); if (G.Acts) G.Acts.play('drink', { quiet: true }); sfx('water', { vol: 0.6 }); G.UI.toast(`항아리 물을 마셨어요 · 기력 +35 (남은 물 ${s.water})`); }
  else { Game.eat(k); if (G.Acts) G.Acts.play('drink', { quiet: true }); G.UI.toast(`항아리에 담은 ${Game.ITEMS[k].n} · 꿀꺽 마셨어요`); }
  G.UI.hud(); };
Ca.cycle = function () { const L = Ca.liquids(), i = L.indexOf(jarK()), k = L[(i + 1) % L.length]; S().jarK = k; sfx('water', { vol: 0.35, pitch: 1.3 });
  G.UI.toast(k === 'water' ? `항아리 · 물 (${S().water}/${S().jarMax})` : `항아리에 담은 것 · ${Game.ITEMS[k].n} (${Game.inv(k)})${L.length > 2 ? ' · 다시 누르면 바뀌어요' : ''}`); G.UI.hud(); };
Game.CTX.push(function () { const p = P(), h = Game.hand(); if (!(h === 'jar' || h === 'bigjar') || p.ride || p.swim || p.act || p.climb || Game.cineOn || (G.Phys && G.Phys.held)) return null;
  const k = jarK(), n = k === 'water' ? S().water : Game.inv(k);
  return [{ d: 1.7, label: n > 0 ? `마시기 · ${k === 'water' ? '물' : Game.ITEMS[k].n} (${n})` : '항아리가 비었어요', disabled: n <= 0, x: p.x + Math.sin(p.face) * 0.5, z: p.z + Math.cos(p.face) * 0.5, y: 1.4, use: Ca.drink, key: 'jarDrink', noMagnet: true }]; });
// the left 「물 마시기」 button goes; the water pill shows (and switches) what the jar holds
setTimeout(() => { const EP = G.EP && G.EP.joseph; if (EP && EP.extra) EP.extra = EP.extra.filter(e => e.id !== 'drink'); const b = document.getElementById('xb_drink'); if (b) b.remove(); }, 60);
if ($('waterBtn')) $('waterBtn').onclick = () => { if (G.UI.busy()) return; if (!hasJar()) { G.UI.toast('물항아리가 있어야 해요'); return; } Ca.cycle(); };
const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const s = S(); if (!s) return r; const wb = $('waterBtn'), k = jarK();
  if (wb && !wb.hidden && k !== 'water') { const it = Game.ITEMS[k]; wb.innerHTML = `<i class="liq" style="background:${it.c || '#e8d0a0'}"></i><span class="xl">${it.n} ${Game.inv(k)}</span>`; }
  const hb = $('btnAtk'), held = G.Phys && G.Phys.held; if (hb && held) { hb.hidden = false; $('btnAtkL').textContent = '던지기'; }
  quickHud(); useHud(); } catch (e) { console.error('carry', e); } return r; };

// ------------------------------------------------------------------ held things: throw (attack slot), put down (action), use (small button)
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { if (G.Phys && G.Phys.held) { G.Phys.throwIt(); G.UI.hud(); return; } return atk0.apply(this, arguments); }; }
const Ph = G.Phys;
if (Ph) {
  Ph.place = function () { const b = Ph.held, p = P(); if (!b) return; Ph.held = null; p.liftArms = false; const W = Game.W(), x = p.x + Math.sin(p.face) * 0.75, z = p.z + Math.cos(p.face) * 0.75;
    const q = { x, z }; W.collide(q, b.K.r, W.heightAt(x, z)); b.x = q.x; b.z = q.z; b.y = W.heightAt(b.x, b.z) + b.K.r; b.vx = b.vy = b.vz = 0; b.yaw = Math.round(p.face / (Math.PI / 4)) * Math.PI / 4; b.pitch = b.roll = 0; b.sleep = 0;
    G.m4trs(b.m, b.x, b.y, b.z, b.yaw, 0, 0); sfx('pickup', { pitch: 0.7, vol: 0.5 }); G.UI.hud(); };
  // the physics context offers 「던지기」 while holding; turn that into 「두기」 (throwing lives on the attack button now)
  const i = Game.CTX.findIndex(f => String(f).includes("key: 'throw'")); if (i >= 0) { const f0 = Game.CTX[i]; Game.CTX[i] = function (s, g) { const r = f0.apply(this, arguments);
    if (r && r[0] && r[0].key === 'throw') { const b = Ph.held; r[0] = Object.assign({}, r[0], { label: `${b.K.n} 두기`, use: Ph.place, key: 'place' }); } return r; }; }
  const pick0 = Ph.pick; Ph.pick = function () { const r = pick0.apply(this, arguments); G.UI.hud(); return r; };
}
const USE = { // what the small 「쓰기」 button does with the thing in your arms
  melon: { l: '쪼개 먹기', f: b => { brk(b); breath(30); if (G.Surv && G.Surv.fed) G.Surv.fed('melon', 12); if (G.Acts) G.Acts.play('eat', { quiet: true }); sfx('crunch', { vol: 0.6 }); G.UI.toast('수박을 쪼개 먹었어요 · 시원하고 달아요! 기력 +30'); } },
  jar: { l: '물 마시기', f: b => once(b, 'drink', () => { breath(25); if (G.Acts) G.Acts.play('drink', { quiet: true }); sfx('water', { vol: 0.6 }); G.UI.toast('항아리째 물을 마셨어요 · 기력 +25'); }, '항아리가 비었어요 · 내일 다시 채워져요') },
  pot: { l: '들여다보기', f: b => once(b, 'peek', () => gift(['olive', 'honey', 'dates'], '작은 단지 안에')) },
  basket: { l: '살펴보기', f: b => once(b, 'peek', () => gift(['bread', 'fig', 'dates', 'cucumber', 'onion'], '바구니 안에')) },
  sack: { l: '열어 보기', f: b => once(b, 'peek', () => gift(['barley', 'lentil', 'wheat'], '자루 안에')) },
};
function once(b, k, fn, empty) { const s = S(), f = s.flags.peek = s.flags.peek || {}, id = b.id + ':' + k; if (f[id] === s.day) { G.UI.toast(empty || '오늘은 이미 살펴봤어요 · 내일 다시 봐요'); return; } f[id] = s.day; fn(); }
function gift(keys, where) { const ks = keys.filter(k => Game.ITEMS[k]); if (!ks.length || Math.random() < 0.3) { G.UI.toast(`${where} 아무것도 없네요`); return; } const k = ks[Math.floor(Math.random() * ks.length)]; Game.give(k, 1); sfx('pickup'); const n = Game.ITEMS[k].n, c = n.charCodeAt(n.length - 1), jo = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '이' : '가'; G.UI.toast(`${where} ${n}${jo} 있었어요 · 하나 챙겼어요`); }
function brk(b) { Ph.held = null; P().liftArms = false; b.gone = true; G.FX && G.FX.burst(b.x, b.y, b.z, 18, { c: [0.85, 0.25, 0.25], sp: 2, up: 2, size: 0.07, g: 9 }); }
const useBtn = document.createElement('button'); useBtn.className = 'cbtn'; useBtn.id = 'btnUse'; useBtn.hidden = true; ($('controls') || document.body).appendChild(useBtn);
useBtn.addEventListener('pointerdown', e => { e.preventDefault(); const b = Ph && Ph.held, u = b && USE[b.k]; if (!u || G.UI.busy()) return; u.f(b); G.UI.hud(); });
function useHud() { const b = Ph && Ph.held, u = b && USE[b.k]; useBtn.hidden = !u; if (u && useBtn.dataset.l !== u.l) { useBtn.dataset.l = u.l; useBtn.textContent = u.l; } }

// ------------------------------------------------------------------ quick slot: one food, eaten with one tap
const qBtn = document.createElement('button'); qBtn.className = 'cbtn'; qBtn.id = 'btnQuick'; qBtn.hidden = true; ($('controls') || document.body).appendChild(qBtn);
qBtn.addEventListener('pointerdown', e => { e.preventDefault(); const k = S().quick; if (!k || G.UI.busy() || Game.P.act) return; if (!(Game.inv(k) > 0)) { G.UI.toast('빠른 칸의 음식이 다 떨어졌어요'); return; } Game.eat(k); G.UI.hud(); });
Ca.setQuick = k => { S().quick = k || null; G.UI.toast(k ? `빠른 칸에 「${Game.ITEMS[k].n}」 등록 · 오른쪽 작은 단추로 바로 먹어요` : '빠른 칸을 비웠어요'); G.UI.hud(); };
Ca.edible = edible;
function quickHud() { const k = S().quick, n = k ? Game.inv(k) : 0; qBtn.hidden = !k; if (!k) return; const lab = `${Game.ITEMS[k] ? Game.ITEMS[k].n : ''}\n×${n}`; if (qBtn.dataset.l !== lab) { qBtn.dataset.l = lab; qBtn.innerHTML = `<span>${Game.ITEMS[k].n.slice(0, 4)}</span><small>×${n}</small>`; } qBtn.classList.toggle('low', n <= 0); }
addEventListener('keydown', e => { if (Game.mode !== 'play' || (e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) return; if (e.code === 'KeyQ') qBtn.dispatchEvent(new PointerEvent('pointerdown')); if (e.code === 'KeyR') useBtn.dispatchEvent(new PointerEvent('pointerdown')); });

const css = document.createElement('style'); css.textContent = `
#btnUse{width:52px;height:52px;right:calc(var(--gr) + 300px);bottom:calc(env(safe-area-inset-bottom,0px) + 112px);font-size:11.5px;background:radial-gradient(circle at 40% 30%,#6a8a4a,#2a3a1c)}
#btnQuick{width:52px;height:52px;right:calc(var(--gr) + 300px);bottom:calc(env(safe-area-inset-bottom,0px) + 172px);font-size:11px;line-height:1.1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 40% 30%,#a07a3a,#4a3418)}
#btnQuick small{font-size:10px;opacity:.85}#btnQuick.low{opacity:.5}
@media (max-aspect-ratio:1/1){#btnUse{width:48px;height:48px;right:calc(var(--gr) + 160px);bottom:calc(env(safe-area-inset-bottom,0px) + 150px)}#btnQuick{width:48px;height:48px;right:calc(var(--gr) + 160px);bottom:calc(env(safe-area-inset-bottom,0px) + 206px)}}
body.busy #btnUse,body.cine #btnUse,body.photo #btnUse,body.busy #btnQuick,body.cine #btnQuick,body.photo #btnQuick{visibility:hidden}
.hot i.liq{display:inline-block;width:12px;height:12px;border-radius:50% 50% 40% 40%;border:1px solid #fff6;flex:none}`;
document.head.appendChild(css);
})(window.G);
