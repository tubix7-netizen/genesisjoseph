/* 약속의 길 — 버금 수레 (v18.21)
   · 마을(성읍·서쪽·남쪽 마을)과 관저·보디발의 집 안에서는 수레를 탈 수 없어요 — 사람들이 다쳐요. 타고 들어가면 마을 어귀에서 내려요.
   · 수레 위에서는 물건을 주울 수 없어요(말은 걸 수 있어요).
   · 수레에는 짐칸(12칸)이 있어요: 타고 있을 때 A키 「공간」.
   v18.23 · 요셉은 수레 바닥에 앉아서 가요. · 옆자리에 한 사람을 태울 수 있어요(타고 있을 때 가까운 사람에게 A키 「옆자리에 태우기」,
     멈춰 서서 「내려 주기」). · 붙잡은 죄수는 수레 뒤칸에 앉혀 데려가요. · 내리면 수레와 말이 그 자리에 서 있고, 말에게 다가가
     A키 「말 쓰다듬기」, B키 「먹이 주기」(꼴·보리·밀): 먹이를 먹은 말은 하루 동안 달려도 기력이 절반만 줄어요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const Ct = G.Cart = {};
Ct.town = function (x, z) { const s = S(); for (const v of EP.villages || []) { if (v.when && !v.when(s)) continue; if (Math.hypot(v.x - x, v.z - z) < v.r + 3) return v.n; }
  if (Math.hypot(x - 10, z + 141) < 20) return '총리 관저'; if (x > -51 && x < -5 && z > 35 && z < 71) return '보디발의 집'; return null; };
const e = (EP.extra || []).find(x => x.id === 'chariot');
if (e) { const c0 = e.click; e.click = function (s) { if (s.q.riding) { const p = P(); s.q.cartAt = { x: p.x, z: p.z, f: p.face }; } if (!s.q.riding) { const t = Ct.town(P().x, P().z); if (t) { pop('여기선 못 타요', `${t} 안이에요 · 넓은 곳에서 타요`, 'donkey'); return; } } const r = c0.apply(this, arguments); if (s.q.riding && G.UI.help) G.UI.help('cart', '버금 수레', '마을 밖 넓은 길에서만 · A키 「공간」은 짐칸'); return r; }; }
let cool = 0;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; cool -= typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { cartPeople(); } catch (er) { console.error('cart', er); }
  { const p = P(), now = s.day * 24 + s.time % 24; if (s.q.riding && p.sprint && p.spd > 3 && (s.flags.horseBuff || 0) > now) p.stam = Math.min((G.Vitals && G.Vitals.cap) || 140, p.stam + 10 * (typeof dt === 'number' && dt < 1 ? dt : 1 / 60)); } // fed horses: half the breath
  if (s.q.riding && cool <= 0 && !(G.Cine && G.Cine.on)) { const t = Ct.town(P().x, P().z); if (t) { cool = 2; const p = P(); s.q.cartAt = { x: p.x, z: p.z, f: p.face }; s.q.riding = 0; Game.snapCam && Game.snapCam(); G.Audio && G.Audio.sfx('step'); pop('수레에서 내렸어요', `${t} 안에서는 걸어요`, 'donkey'); G.UI.hud(); } }
  return r; };
/* seated on the cart's floor instead of standing at the reins */
const ry0 = EP.rootY; EP.rootY = function (s, g) { const b = ry0 ? ry0.apply(this, arguments) || 0 : 0; return s && s.q && s.q.riding && s.q.chariotOk ? b + 0.48 : b; }; /* seated on the chariot floor */
const pose0 = EP.pose; EP.pose = function (pst, s, g) { const r = pose0 ? pose0.apply(this, arguments) : undefined; if (s.q.riding && s.q.chariotOk) { pst.act = 'sitg'; pst.actT = 0; pst.sit = false; } return r; };
// people in the cart: one passenger beside Joseph, caught prisoners in the back
const seat = (n, side, back) => { const p = P(), f = p.face, x = p.x + Math.cos(f) * side - Math.sin(f) * back, z = p.z - Math.sin(f) * side - Math.cos(f) * back;
  n.x = x; n.z = z; n.y = Game.W().heightAt(x, z) + 0.48; n.face = f; n.homeFace = f; n.walk = null; n.wander = null; n.act = 'sitg'; n.pass = true; n._inCart = true; };
const unseat = (n, side) => { const p = P(), f = p.face; n.pass = false; n._inCart = false; if (n.act === 'sitg') n.act = null; n.x = p.x + Math.cos(f) * (side || 1.4); n.z = p.z - Math.sin(f) * (side || 1.4); n.y = Game.W().heightAt(n.x, n.z); };
function cartPeople() { const s = S(); if (!s.q.riding) { if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n) { unseat(n, 1.4); if (n.d.folk) n.schedSlot = -1; else Game.npcWalk(n.id, n.d.x, n.d.z, () => { n.face = n.homeFace = n.d.face || 0; }, 1.6); } s.q.cartPax = null; }
    for (const n of P().follow || []) if (n._inCart) unseat(n, -1.6); return; }
  if (s.q.cartPax) { const n = Game.npc(s.q.cartPax); if (n && n.vis) seat(n, -0.38, 0.05); else s.q.cartPax = null; }
  let k = 0; for (const n of P().follow || []) if (/^cul/.test(n.id)) seat(n, (k++ % 2 ? 0.3 : -0.3), 0.95); }
Ct.dropPax = () => { const s = S(), n = s.q.cartPax && Game.npc(s.q.cartPax); if (!n) return; unseat(n, -1.5); if (n.d.folk) n.schedSlot = -1; else Game.npcWalk(n.id, n.d.x, n.d.z, () => { n.face = n.homeFace = n.d.face || 0; }, 1.6); s.q.cartPax = null; pop('내려 드렸어요', n.name, 'donkey'); };
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || Game.cineOn || p.act || G.UI.busy()) return null; const out = [];
  if (!s.q.cartPax) { let best = null, bd = 2.8; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || n.d.animal || n.d.noTalk === true || n.sleep || n.talking || n.follow || n._inCart || n.d.fixed || n.d.sit || n.seatY) continue; const tg = Game.curTarget; if (tg && tg.npc === id) continue;
      const d = Math.hypot(n.x - p.x, n.z - p.z); if (d < bd) { bd = d; best = n; } }
    if (best) out.push({ d: bd - 0.5, label: `옆자리에 태우기 · ${best.name.split(' ').pop()}`, x: best.x, z: best.z, yAbs: best.y + 2, noMagnet: true, rideOk: true, key: 'cartPax', use: () => { s.q.cartPax = best.id; G.UI.say([{ n: best.name, t: '우와, 총리님 수레에 타 보다니요!' }], () => { }); pop('옆자리에 태웠어요', best.name, 'donkey'); } }); }
  else if (p.spd < 0.4) out.push({ d: 1.2, label: '옆자리 사람 내려 주기', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartDrop', use: Ct.dropPax });
  return out.length ? out : null; });
// the parked chariot: where Joseph stepped down, the cart and the two horses wait
const HR = { rigs: null, ph: 0 }, CM = G.m4(), HM = [G.m4(), G.m4()];
let cartMesh = null;
const horsePos = (c, i) => { const s = i ? 1 : -1, f = c.f; return [c.x + Math.sin(f) * 3.0 + Math.cos(f) * s * 0.55, c.z + Math.cos(f) * 3.0 - Math.sin(f) * s * 0.55]; };
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); const c = s.q.cartAt; if (s.q.riding || !c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!HR.rigs) HR.rigs = [new G.Rig(G.AB.horse), new G.Rig(G.AB.horse)]; HR.ph += 0.01;
  HR.rigs.forEach((rig, i) => { const [hx, hz] = horsePos(c, i); G.animAnimal(rig, { speed: 0, phase: HR.ph + i, graze: (s.flags.horseEat || 0) > Date.now() }, t); rig.update(G.m4trs(HM[i], hx, Game.W().heightAt(hx, hz), hz, c.f));
    list.push({ mesh: Game.animalMesh('horse', i ? 'plain' : 'brown', { saddle: 0xd9a73a }), bones: rig.bones, outline: true }); }); };
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); const c = s && s.q.cartAt; if (!s || s.q.riding || !c || !s.q.chariotOk || Math.hypot(c.x - P().x, c.z - P().z) > 70) return;
  if (!cartMesh) { const g = new G.GB(41); g.box(1.3, 0.08, 1.0, { at: [0, 0.42, 0], c: 0x8a6440 }); g.box(1.3, 0.62, 0.06, { at: [0, 0.74, 0.48], c: 0xd9a73a }); for (const sd of [1, -1]) { g.box(0.06, 0.5, 0.95, { at: [sd * 0.62, 0.7, 0], c: 0xd9a73a }); g.cyl(0.42, 0.42, 0.07, 14, { at: [sd * 0.74, 0.42, -0.1], rz: Math.PI / 2, c: 0x6a4a30 }); }
    g.box(0.08, 0.08, 2.4, { at: [0, 0.5, 1.6], c: 0x7a5a3a }); cartMesh = G.R.mesh(g); }
  G.m4trs(CM, c.x, Game.W().heightAt(c.x, c.z), c.z, c.f, 0, 0, 1, 1, 1); list.push({ mesh: cartMesh, m: CM, outline: true }); };
const FEED = ['hay', 'barley', 'wheat'];
const nearHorse = () => { const s = S(), c = s.q.cartAt; if (!c || s.q.riding) return null; let bd = 1e9; for (const i of [0, 1]) { const [hx, hz] = horsePos(c, i); bd = Math.min(bd, Math.hypot(hx - P().x, hz - P().z)); } return bd < 2.2 ? bd : null; };
Ct.feedCtx = () => { const d = nearHorse(); if (d === null || G.UI.busy() || (G.Phys && G.Phys.held)) return null; const k = FEED.find(x => Game.inv(x) > 0); return { label: k ? '먹이 주기' : '먹이 없음', k }; };
Game.CTX.push(function (s) { const d = nearHorse(); if (d === null || P().act || Game.cineOn) return null; const c = s.q.cartAt;
  return [{ d: d - 0.6, label: '말 쓰다듬기', x: horsePos(c, 0)[0], z: horsePos(c, 0)[1], y: 1.8, anim: 'pet', dur: 0.9, hits: 1, key: 'horsePet', fn: () => { const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 3); G.Audio && G.Audio.sfx('blip', { pitch: 0.6 });
    if (!(G.UI.help && G.UI.help('horse', '말 돌보기', 'A키 쓰다듬기 · B키 먹이 주기(꼴·보리·밀)'))) pop('히히힝~', '말이 좋아해요 · 정신력 +3', 'donkey'); } }]; });
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const f = Ct.feedCtx(); if (f) { if (!f.k) { G.UI.toast('꼴·보리·밀 중 하나가 있어야 해요'); return; } const s = S(); Game.take(f.k, 1); s.flags.horseBuff = s.day * 24 + s.time % 24 + 24; s.flags.horseEat = Date.now() + 4000; P().stam = Math.min((G.Vitals && G.Vitals.cap) || 140, P().stam + 30);
      pop('말이 먹이를 먹어요', `${Game.ITEMS[f.k].n} · 하루 동안 지치지 않고 달려요`, 'donkey'); G.UI.hud(); return; } return atk0.apply(this, arguments); }; }
{ const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const f = Game.mode === 'play' && Ct.feedCtx(), b = document.getElementById('btnAtk'); if (f && b) { b.hidden = false; document.getElementById('btnAtkL').textContent = f.label; } } catch (e) { } return r; }; }
Game.CTX.push(function (s) { const p = P(); if (!s.q.riding || Game.cineOn || p.act) return null;
  return [{ d: 5, label: '공간', x: p.x, z: p.z, y: 1.6, noMagnet: true, noTag: true, rideOk: true, key: 'cartBox', use: () => G.Storage && G.Storage.openBox('수레 짐칸', 'cartStore', false, 12) }]; });
})(window.G);
