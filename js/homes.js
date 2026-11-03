/* 약속의 길 — 마을 집에 들어가기 (v18.14)
   애굽의 성읍·서쪽 마을·남쪽 마을 집 앞에서 「집에 들어가기」. 집집마다 사는 사람과 살림이 달라요:
   빵 굽는 집 · 베 짜는 집 · 토기장이 집 · 저녁 밥상이 차려진 집 · 아이들이 노는 집.
   안에서: 짚자리에서 잠깐 쉬기, 물항아리(물 마시기 · 내 항아리 채우기), 그 집의 일 거들기, 문으로 나가기.
   방은 지도 바깥쪽 한 곳에 하나 지어 두고, 들어갈 때마다 그 집의 살림으로 바꿔 보여 줘요 (지붕은 열어 두어 카메라가 위에서 봐요). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const Ho = G.Homes = {};
const RW = 7.2, RD = 6.2, WH = 2.8; // room width (x) · depth (z) · wall height
const CAND = [[226, -226], [-226, 226], [226, 0], [0, -228], [-228, -226]];
let IX = CAND[0][0], IZ = CAND[0][1], IY = 0;
const inRoom = (x, z) => Math.abs(x - IX) < RW / 2 + 0.6 && Math.abs(z - IZ) < RD / 2 + 0.6;

// ------------------------------------------------------------------ the room, built once at world build (somewhere nobody walks)
const pb = EP.build; EP.build = function (W, G2) { if (pb) pb.apply(this, arguments); try {
  let best = null; for (const [cx, cz] of CAND) { let lo = 1e9, hi = -1e9; for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const h = W.heightAt(cx - 5 + i * 10 / 6, cz - 5 + j * 10 / 6); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    const wl = W.water ? W.water.level : -99; if (lo < wl + 0.3) continue; if (!best || hi - lo < best[2]) best = [cx, cz, hi - lo, hi]; }
  if (best) { IX = best[0]; IZ = best[1]; IY = best[3] + 0.25; }
  const y0 = IY - 4, y1 = IY + WH + 0.4, hw = RW / 2, hd = RD / 2;
  W.addCol({ x: IX, z: IZ + hd + 0.15, w: RW + 0.6, d: 0.3, y0, y1 }); W.addCol({ x: IX - hw - 0.15, z: IZ, w: 0.3, d: RD + 0.6, y0, y1 }); W.addCol({ x: IX + hw + 0.15, z: IZ, w: 0.3, d: RD + 0.6, y0, y1 });
  W.addCol({ x: IX - (hw + 0.7) / 2 - 0.35, z: IZ - hd - 0.15, w: hw - 0.7 + 0.3, d: 0.3, y0, y1 }); W.addCol({ x: IX + (hw + 0.7) / 2 + 0.35, z: IZ - hd - 0.15, w: hw - 0.7 + 0.3, d: 0.3, y0, y1 });
  W.addCol({ x: IX, z: IZ - hd - 0.9, w: 1.6, d: 0.3, y0, y1 }); // the doorway leads nowhere: the door itself takes you out
  for (const [x, z, r] of [[-2.5, 2.2, 0.55], [2.9, -2.0, 0.45], [0.3, 0.5, 0.75]]) W.addCol({ x: IX + x, z: IZ + z, r, y0, y1: IY + 0.9 });
} catch (e) { console.error('homes', e); } };
const fl0 = EP.floor; EP.floor = function (x, z, s) { if (inRoom(x, z)) return IY; return fl0 ? fl0.apply(this, arguments) : null; };

// ------------------------------------------------------------------ meshes: the room and each kind of household
const MESH = {}; const mk = (k, fn) => MESH[k] || (MESH[k] = (() => { const g = new G.GB(k.length * 9 + 11); fn(g); return G.R.mesh(g); })());
const WALL = 0xdcc8a4, BAND = 0x9a6a40, FLOOR = 0xb89a70, WOOD = 0x7a5a3a;
function room(g) { const hw = RW / 2, hd = RD / 2;
  g.box(RW + 0.6, 0.3, RD + 0.6, { at: [0, -0.15, 0], c: FLOOR }); g.box(RW + 0.6, 4, RD + 0.6, { at: [0, -2.3, 0], c: 0xa88a60 }); // packed-earth floor on a plinth
  const wall = (x, z, w, d) => { g.box(w, WH, d, { at: [x, WH / 2, z], c: (px, py) => py < 0.32 ? BAND : WALL }); };
  wall(0, hd + 0.15, RW + 0.6, 0.3); wall(-hw - 0.15, 0, 0.3, RD + 0.6); wall(hw + 0.15, 0, 0.3, RD + 0.6);
  wall(-(hw + 0.7) / 2 - 0.35, -hd - 0.15, hw - 0.7 + 0.3, 0.3); wall((hw + 0.7) / 2 + 0.35, -hd - 0.15, hw - 0.7 + 0.3, 0.3);
  g.box(1.6, 0.4, 0.34, { at: [0, WH - 0.2, -hd - 0.15], c: WALL }); // lintel over the doorway
  for (const x of [-2.4, 0, 2.4]) g.box(0.16, 0.16, RD + 0.5, { at: [x, WH - 0.05, 0], c: WOOD }); // roof beams (the roof itself is left off so the camera sees in)
  for (const x of [-1.6, 1.6]) g.box(0.7, 0.35, 0.34, { at: [x, 2.05, hd + 0.15], c: 0x3a3028 }); // window slits
  g.box(2.6, 0.03, 1.8, { at: [0.3, 0.02, 0.4], c: (x, y, z) => Math.floor((x + 3) * 4) % 3 ? 0x9a3a2e : 0x2c5aa0 }); // a woven rug
  g.box(0.95, 0.08, 2.0, { at: [-2.5, 0.05, 1.9], c: 0xc8a868 }); g.box(0.6, 0.1, 0.3, { at: [-2.5, 0.12, 2.75], c: 0xe8dcc0 }); // sleeping mat and pillow
  g.lathe([[0.1, 0], [0.34, 0.2], [0.4, 0.6], [0.24, 0.95], [0.2, 1.05]], 12, { at: [2.9, 0, -2.0], c: 0xb5673a }); // the big water jar
  g.box(2.2, 0.06, 0.4, { at: [0.6, 1.5, hd - 0.2], c: WOOD }); for (let i = 0; i < 4; i++) g.lathe([[0.05, 0], [0.13, 0.08], [0.14, 0.2], [0.08, 0.28]], 8, { at: [-0.2 + i * 0.55, 1.53, hd - 0.2], c: [0xb5673a, 0xc0784a, 0x8a5a3a, 0xd8c49a][i] }); // shelf with pots
  g.cyl(0.08, 0.1, 0.08, 8, { at: [1.5, 1.58, hd - 0.2], c: 0xc8a040 }); }
const TYPE = {
  bake: { n: '빵 굽는 집', model(g) { g.sph(0.75, 10, 6, { at: [2.4, 0.2, 2.1], s: [1, 0.9, 1], c: 0xb8865a }); g.box(0.4, 0.3, 0.1, { at: [2.4, 0.35, 1.4], c: 0x2a1a10 }); g.box(1.2, 0.75, 0.7, { at: [0.3, 0.38, 0.5], c: WOOD }); for (let i = 0; i < 4; i++) g.sph(0.14, 7, 5, { at: [-0.1 + i * 0.27, 0.8, 0.5], s: [1, 0.55, 1], c: 0xd8a060 }); },
    act: { label: '빵 굽기 돕기', give: 'bread', msg: '반죽을 치대고 화덕에 붙였어요 · 갓 구운 빵을 하나 받았어요' } },
  loom: { n: '베 짜는 집', model(g) { for (const x of [-0.9, 0.9]) g.cyl(0.05, 0.06, 1.9, 6, { at: [x - 0.2, 0.95, 2.3], c: WOOD }); g.cyl(0.05, 0.05, 1.9, 6, { at: [-0.2, 1.85, 2.3], rz: Math.PI / 2, c: WOOD }); g.box(1.7, 1.4, 0.02, { at: [-0.2, 1.05, 2.3], c: 0xece2c8 }); g.box(1.2, 0.7, 0.7, { at: [0.3, 0.35, 0.5], c: WOOD }); g.sph(0.2, 6, 5, { at: [0.2, 0.82, 0.5], c: 0xe8dcc0 }); },
    act: { label: '베 짜기 돕기', give: 'thread', msg: '북을 넘기며 몇 줄 짰어요 · 실 한 타래를 받았어요' } },
  potter: { n: '토기장이 집', model(g) { g.cyl(0.45, 0.5, 0.5, 12, { at: [0.3, 0.25, 0.5], c: WOOD }); g.cyl(0.3, 0.3, 0.06, 12, { at: [0.3, 0.53, 0.5], c: 0x8a6a4a }); g.lathe([[0.05, 0], [0.16, 0.1], [0.18, 0.24], [0.1, 0.34]], 10, { at: [0.3, 0.56, 0.5], c: 0xa86a42 }); for (let i = 0; i < 5; i++) g.lathe([[0.06, 0], [0.18, 0.12], [0.2, 0.3], [0.1, 0.42]], 8, { at: [2.0 + (i % 3) * 0.45, 0, 1.6 + Math.floor(i / 3) * 0.5], c: 0xc0784a }); },
    act: { label: '토기 빚기 돕기', silver: 3, msg: '물레를 돌려 작은 단지 하나를 빚었어요 · 일삯으로 은 3을 받았어요' } },
  family: { n: '밥상이 차려진 집', model(g) { g.box(1.6, 0.4, 0.9, { at: [0.3, 0.2, 0.5], c: WOOD }); for (let i = 0; i < 5; i++) g.cyl(0.14, 0.1, 0.06, 8, { at: [-0.3 + i * 0.3, 0.43, 0.5 + (i % 2 ? 0.2 : -0.2)], c: [0xc0784a, 0xd8c49a, 0x9a5a2a, 0x6e9a3a, 0xd8a43a][i] }); for (const x of [-0.7, 1.3]) g.box(0.5, 0.06, 0.5, { at: [x, 0.03, 0.5], c: 0xb8483a }); g.sph(0.4, 8, 6, { at: [2.4, 0.15, 2.1], s: [1, 0.5, 1], c: 0x5a4a3a }); },
    act: { label: '함께 밥 먹기', meal: true, msg: '「어서 앉으세요!」 · 한 상에 둘러앉아 배불리 먹었어요 · 체력과 기력이 차올라요' } },
  kids: { n: '아이들이 노는 집', model(g) { for (let i = 0; i < 3; i++) g.sph(0.12, 8, 6, { at: [-0.4 + i * 0.6, 0.12, 0.2 + i * 0.3], c: [0xc04a3a, 0x2c5aa0, 0xe5b552][i] }); g.box(0.3, 0.18, 0.12, { at: [1.1, 0.12, 1.2], c: WOOD }); g.cyl(0.03, 0.03, 0.2, 5, { at: [1.1, 0.25, 1.2], c: WOOD }); g.box(1.2, 0.7, 0.7, { at: [0.3, 0.35, -0.6], c: WOOD }); g.sph(0.4, 8, 6, { at: [2.4, 0.15, 2.1], s: [1, 0.5, 1], c: 0x5a4a3a }); },
    act: { label: '아이들과 놀기', mind: 20, msg: '공 던지기·숨바꼭질 한 판! 아이들이 깔깔 웃어요 · 마음이 가벼워졌어요 (정신력 +20)' } },
};
const TYPES = Object.keys(TYPE);
const houseKey = (v, i) => v.id + ':' + i;
const typeOf = (v, i) => TYPES[Math.floor(hash(houseKey(v, i)) * TYPES.length)];

// ------------------------------------------------------------------ going in and out
const cur = () => S().flags.inHouse || null;
function ownerOf(v, i) { return (v.folk || []).find(f => (f.home || 0) === i); }
const GREET = { kid: ['우와, {you}이다! 들어와요!', '엄마! 손님 왔어요!'], old: ['허허, 누추한 집에 귀한 손님이 오셨구먼.', '어서 오게, 앉게나.'], woman: ['어머, 어서 오세요! 물이라도 드릴게요.', '들어오세요, 집이 좁아도 시원해요.'], man: ['어서 오시오! 편히 쉬다 가시오.', '이런 영광이! 들어오시오.'] };
// ------------------------------------------------------------------ doors (v18.14): a real door leaf on every house; 「문 열기」 → it swings in → 「들어가기」
/* The door is found from the house collider nearest the home spot: the painted doorway is the middle of the collider's +z face. */
const DOORS = {}, DM = {};
function doorOf(v, i) { const k = houseKey(v, i); if (DOORS[k] !== undefined) return DOORS[k]; const W = Game.W(), hm = v.homes[i]; let best = null, bd = 1e9;
  const seen = new Set(); for (const ox of [-5, 0, 5]) for (const oz of [-5, 0, 5]) for (const c of W.near(hm[0] + ox, hm[1] + oz)) seen.add(c); // the house may stand a few steps from the home spot
  for (const c of seen) { if (!c.on || c.t !== 'b' || c.hw < 1.8 || c.hd < 1.5) continue; const d = Math.hypot(c.x - hm[0], c.z - hm[1]); if (d < bd && d < 7.5) { bd = d; best = c; } }
  if (!best) return (DOORS[k] = null); const a = Math.atan2(best.sa, best.ca), ox = Math.sin(a), oz = Math.cos(a), x = best.x + ox * (best.hd + 0.06), z = best.z + oz * (best.hd + 0.06);
  return (DOORS[k] = { k, x, z, a, y: W.heightAt(x, z), fx: x + ox * 0.95, fz: z + oz * 0.95, open: 0, want: 0, t: 0 }); }
const doorMesh = () => mk('hDoor', g => { for (let i = 0; i < 4; i++) g.box(0.27, 1.88, 0.07, { at: [0.15 + i * 0.275, 0.95, 0], c: [0x7a5232, 0x6e4a2c, 0x80583a, 0x744e30][i] }); for (const y of [0.45, 1.45]) g.box(1.08, 0.1, 0.1, { at: [0.55, y, 0.03], c: 0x5a3a22 }); g.sph(0.045, 6, 4, { at: [0.95, 1.0, 0.07], c: 0xc8a040 }); });
const darkMesh = () => mk('hDoorDark', g => { g.box(1.12, 1.92, 0.02, { at: [0, 0.96, 0.025], c: 0x120c08 }); });
function swing(d, open) { if (!d || d.want === (open ? 1 : 0)) return; d.want = open ? 1 : 0; d.t = 0; sfx('door', { vol: 0.55, pitch: open ? 1.05 : 0.85 }); }
const IN_DOOR = { open: 0, want: 0, t: 0 }; // the door of the room, seen from inside
Ho.enter = function (v, i) { const s = S(), p = P(), t = typeOf(v, i), ow = ownerOf(v, i), d = doorOf(v, i);
  if (d) { p.face = d.a + Math.PI; } // step in through the doorway, then the scene changes
  G.UI.fade(() => { s.flags.inHouse = { v: v.id, i, t, x: d ? d.fx : p.x, z: d ? d.fz : p.z, f: d ? d.a : p.face + Math.PI, ow: ow ? ow.name : null, age: ow ? ow.age : null };
    if (d) { d.want = 0; d.open = 0; } Game.teleport(IX, IZ - RD / 2 + 1.9, 0); p.y = IY; IN_DOOR.open = 1; IN_DOOR.want = 1; setTimeout(() => swing(IN_DOOR, false), 450); }, () => {
    const pr = ow && G.Persona && G.Persona.of(ow.id), g = !ow ? null : ow.age === 'kid' ? 'kid' : ow.age === 'old' ? 'old' : pr && pr.fem ? 'woman' : 'man';
    G.UI.say([{ n: '', t: `${v.n} · ${ow ? ow.name + '의 집' : '빈집'} (${TYPE[t].n})` }].concat(ow ? [{ n: ow.name, t: GREET[g][Math.floor(Math.random() * 2)].replace('{you}', '총리님') }] : []), () => { }); }); };
Ho.leave = function () { const h = cur(); if (!h) return; const v = (EP.villages || []).find(q => q.id === h.v), d = v ? doorOf(v, h.i) : null;
  G.UI.fade(() => { S().flags.inHouse = null; IN_DOOR.open = IN_DOOR.want = 0; Game.teleport(h.x, h.z, h.f); if (d) { d.open = 1; d.want = 1; setTimeout(() => swing(d, false), 600); } }, () => { }); };
Ho.inside = () => !!cur();
Ho.door = (v, i) => doorOf(v, i); Ho.leafM = k => DM[k]; // (for checking)
// ------------------------------------------------------------------ locks and keys (v18.17)
/* Every house can be locked. About a third of them are kept locked while the family is out. From inside, the bolt needs no key
   (the attack button: 「문 잠그기」 / 「잠금 풀기」). From outside you need that house's own key — the family gives you one the first
   time you help them at home. Without a key, knock: if someone is home (or the owner is close by) they open it for you — the
   owners always carry their keys, so their own comings and goings are never stopped by a lock. */
const keyId = (v, i) => 'hk_' + v.id + '_' + i;
const whoOf = (v, i) => { const ow = ownerOf(v, i); return ow ? ow.name.split(' ').pop() + '네' : '빈집'; };
for (const v of EP.villages || []) v.homes.forEach((hm, i) => { Game.ITEMS[keyId(v, i)] = { n: `${whoOf(v, i)} 열쇠`, cat: 'key', p: 0, ic: 'key', c: '#c8a040', d: `${v.n}의 ${whoOf(v, i)} 집 문을 여는 열쇠` }; });
const locks = () => S().flags.hLock || (S().flags.hLock = {});
const locked = (v, i) => { const k = houseKey(v, i), L = locks(); return L[k] !== undefined ? L[k] : hash(k + 'lk') < 0.35; };
const setLock = (v, i, on) => { locks()[houseKey(v, i)] = !!on; sfx('click', { pitch: on ? 0.6 : 0.85, vol: 0.7 }); };
const hasKey = (v, i) => Game.inv(keyId(v, i)) > 0; // (a key left in the chest does not open doors)
function ownerNear(v, i, d) { const ow = ownerOf(v, i), n = ow && Game.ENT.npcs[ow.id]; if (!n || !n.vis && !n.schedHidden) return null; const hm = v.homes[i];
  if (n.schedHidden && Math.hypot(n.x - hm[0], n.z - hm[1]) < 3) return { n, home: true }; if (n.vis && !n.schedHidden && Math.hypot(n.x - d.x, n.z - d.z) < 9) return { n, home: false }; return null; }
function knock(v, i, d) { sfx('thud', { vol: 0.6, pitch: 1.4 }); setTimeout(() => sfx('thud', { vol: 0.6, pitch: 1.5 }), 180); const o = ownerNear(v, i, d), ow = ownerOf(v, i);
  setTimeout(() => { if (!o) { G.UI.toast(`똑똑… 아무도 없나 봐요 · 문이 잠겨 있어요${ow ? ` (「${whoOf(v, i)} 열쇠」가 있으면 열 수 있어요)` : ''}`); return; }
    G.UI.say([{ n: ow.name, t: o.home ? '누구세요? …어머나, 총리님! 잠깐만요, 빗장 풀어 드릴게요.' : '아이고, 제 집 앞에 계셨군요! 제가 열어 드릴게요.' }], () => { setLock(v, i, false); swing(d, true); }); }, 520); }
function nearDoor() { const s = S(), p = P(); let best = null, bd = 1e9; for (const v of EP.villages || []) { if (v.when && !v.when(s)) continue; if (Math.hypot(v.x - p.x, v.z - p.z) > v.r + 12) continue;
    v.homes.forEach((hm, i) => { const d = doorOf(v, i); if (!d) return; const dd = Math.hypot(d.fx - p.x, d.fz - p.z); if (dd < bd) { bd = dd; best = [v, i, d]; } }); }
  return best && bd <= 2.3 ? best.concat([bd]) : null; }
// the attack-button slot near a door: lock or unlock (inside: the bolt; outside: with the key)
Ho.lockCtx = function () { const s = S(), p = P(); if (!s || p.ride || p.act || p.climb || Game.cineOn || (G.Phys && G.Phys.held) || G.UI.busy()) return null; const h = cur();
  if (h) { const v = (EP.villages || []).find(q => q.id === h.v); if (!v || IN_DOOR.want > 0) return null; if (Math.hypot(IX - p.x, IZ - RD / 2 + 0.2 - p.z) > 1.9) return null;
    const on = locked(v, h.i); return { label: on ? '잠금 풀기' : '문 잠그기', fn: () => { setLock(v, h.i, !on); G.UI.toast(on ? '빗장을 풀었어요' : '빗장을 질렀어요 · 밖에서는 열쇠가 있어야 열려요'); } }; }
  const nd = nearDoor(); if (!nd) return null; const [v, i, d] = nd; if (d.want > 0 || !hasKey(v, i)) return null; const on = locked(v, i);
  return { label: on ? '잠금 풀기' : '문 잠그기', fn: () => { setLock(v, i, !on); G.UI.toast(on ? `${Game.ITEMS[keyId(v, i)].n}로 잠금을 풀었어요` : `${Game.ITEMS[keyId(v, i)].n}로 문을 잠갔어요 · 주인네는 자기 열쇠로 드나들어요`); } }; };
if (G.Combat) { const atk0 = G.Combat.attack; G.Combat.attack = function () { const c = Ho.lockCtx(); if (c) { c.fn(); G.UI.hud(); return; } return atk0.apply(this, arguments); }; }
{ const hud0 = G.UI.hud; G.UI.hud = function () { const r = hud0.apply(this, arguments); try { const c = Game.mode === 'play' && Ho.lockCtx(), b = document.getElementById('btnAtk'); if (c && b) { b.hidden = false; document.getElementById('btnAtkL').textContent = c.label; b.classList.add('lockMode'); } else if (b) b.classList.remove('lockMode'); } catch (e) { } return r; }; }
// doors swing over ~0.6 s; an outside door left open closes by itself after a while
let dClock = 0;
function doorTick(dt) { dClock += dt; for (const d of [IN_DOOR, ...Object.values(DOORS)]) { if (!d) continue; d.open += (d.want - d.open) * Math.min(1, dt * 7); d.t += dt; if (d !== IN_DOOR && d.want === 1 && d.t > 7 && Math.hypot(P().x - d.x, P().z - d.z) > 1.4) swing(d, false); } }

// ------------------------------------------------------------------ actions
Game.CTX.push(function (s) { const p = P(); if (p.ride || p.swim || p.act || p.climb || Game.cineOn || (G.Phys && G.Phys.held) || (s.q && s.q.riding)) return null;
  const h = cur();
  if (!h) { // outside: the nearest house door
    const nd = nearDoor(); if (!nd) return null; const [v, i, d, bd] = nd, who = whoOf(v, i);
    if (d.want < 1 && locked(v, i)) return [hasKey(v, i) ? { d: bd - 0.6, label: `열쇠로 열기 · ${who}`, x: d.x, z: d.z, y: 1.3, reach: 0.95, anim: 'push', dur: 0.55, hits: 1, fn: () => { setLock(v, i, false); swing(d, true); }, key: 'hDoor' }
      : { d: bd - 0.6, label: `잠긴 문 · 두드리기 · ${who}`, x: d.x, z: d.z, y: 1.3, reach: 0.95, anim: 'push', dur: 0.4, hits: 1, fn: () => knock(v, i, d), key: 'hDoor' }];
    if (d.want < 1) return [{ d: bd - 0.6, label: `문 열기 · ${who}`, x: d.x, z: d.z, y: 1.3, reach: 0.95, anim: 'push', dur: 0.5, hits: 1, fn: () => swing(d, true), key: 'hDoor' }];
    return [{ d: bd - 0.6, label: `들어가기 · ${who}`, x: d.x, z: d.z, y: 1.3, use: () => Ho.enter(v, i), key: 'house', noMagnet: true }]; }
  // inside
  const L = (x, z) => [IX + x, IZ + z], out = [], add = (x, z, r, c) => { const [wx, wz] = L(x, z), d = Math.hypot(wx - p.x, wz - p.z); if (d < r) out.push(Object.assign({ d: d - 0.4, x: wx, z: wz, y: 1.2, noMagnet: true }, c)); };
  { const v = (EP.villages || []).find(q => q.id === h.v), lk = v && locked(v, h.i);
    add(0, -RD / 2 + 0.2, 1.6, IN_DOOR.want < 1 ? { label: lk ? '빗장 풀고 문 열기' : '문 열기', anim: 'push', dur: 0.5, hits: 1, fn: () => { if (v && locked(v, h.i)) setLock(v, h.i, false); swing(IN_DOOR, true); }, key: 'hLeave', noMagnet: false } : { label: '밖으로 나가기', use: Ho.leave, key: 'hLeave' }); }
  const rest = s.flags.hRest || -99, abs = s.day * 24 + s.time % 24;
  add(-2.5, 1.9, 1.8, abs - rest < 4 ? { label: '방금 쉬었어요', disabled: true, key: 'hRest' } : { label: '짚자리에서 잠깐 쉬기', key: 'hRest', use: () => G.UI.fade(() => { s.flags.hRest = abs + 1.5; s.time += 1.5; const H = s.hero; p.stam = (G.Vitals && G.Vitals.cap) || H.stamMax || 140; p.exhausted = false; if (H) H.hp = Math.min(H.hpMax, H.hp + H.hpMax * 0.15); }, () => G.UI.toast('한숨 쉬었어요 · 기력이 다 차고 몸이 조금 나았어요')) });
  add(2.9, -2.0, 1.7, { label: (Game.tool('jar') || Game.tool('bigjar')) && s.water < s.jarMax ? '물항아리 · 마시고 내 항아리 채우기' : '물항아리에서 물 마시기', key: 'hJar', use: () => { const H = s.hero, cap = (G.Vitals && G.Vitals.cap) || (H && H.stamMax) || 140; p.stam = Math.min(cap, p.stam + 30); p.exhausted = false; let msg = '시원한 물 · 기력 +30';
    if ((Game.tool('jar') || Game.tool('bigjar')) && s.water < s.jarMax) { s.water = s.jarMax; msg += ' · 내 항아리도 가득 채웠어요'; } if (G.Acts) G.Acts.play('drink', { quiet: true }); sfx('water', { vol: 0.6 }); G.UI.toast(msg); G.UI.hud(); } });
  const T = TYPE[h.t], a = T.act, did = (s.flags.hDid || {})[h.v + h.i] === s.day, meal = a.meal && !(s.time % 24 > 16.5 && s.time % 24 < 21.5);
  add(0.3, 0.5, 2.1, did ? { label: `${a.label} · 오늘은 했어요`, disabled: true, key: 'hAct' } : meal ? { label: '저녁때(오후 5시~9시)에 밥상이 차려져요', disabled: true, key: 'hAct' } : { label: a.label, key: 'hAct', anim: a.meal ? 'eat' : 'gather', dur: 0.9, hits: 2, fn: () => { (s.flags.hDid = s.flags.hDid || {})[h.v + h.i] = s.day; const H = s.hero;
    if (a.give && Game.ITEMS[a.give]) Game.give(a.give, 1); if (a.silver) Game.silver(a.silver); if (a.meal) { if (H) H.hp = H.hpMax; p.stam = (G.Vitals && G.Vitals.cap) || (H && H.stamMax) || 140; if (G.Surv && G.Surv.fed) G.Surv.fed('bread', 60); } if (a.mind && H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + a.mind);
    G.UI.toast(a.msg); sfx('pickup'); G.UI.hud();
    const v = (EP.villages || []).find(q => q.id === h.v), kid = v && keyId(v, h.i); if (v && h.ow && !(s.flags.hKeyGot || {})[kid]) { (s.flags.hKeyGot = s.flags.hKeyGot || {})[kid] = 1; Game.give(kid, 1, true);
      setTimeout(() => G.UI.say([{ n: h.ow, t: '도와주셔서 고마워요. 이 집 열쇠를 하나 드릴게요 · 문이 잠겨 있어도 언제든 들르세요!' }], () => G.UI.toast(`「${Game.ITEMS[kid].n}」를 받았어요 · 가방의 귀중품`)), 900); } } });
  return out; });
// draw the room only when someone is in it (or near)
const MX = G.m4(), MX2 = G.m4();
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (Game.mode !== 'play') return; const h = cur(), p = P();
  if (!h) { for (const v of EP.villages || []) { if (v.when && !v.when(S())) continue; if (Math.hypot(v.x - p.x, v.z - p.z) > v.r + 50) continue;
      v.homes.forEach((hm, i) => { const d = doorOf(v, i); if (!d || Math.hypot(d.x - p.x, d.z - p.z) > 45) return; const ca = Math.cos(d.a), sa = Math.sin(d.a), hx = d.x - ca * 0.55, hz = d.z + sa * 0.55; // hinge at the left edge (seen from outside)
        const m = DM[d.k] || (DM[d.k] = G.m4()); G.m4trs(m, hx, d.y, hz, d.a + d.open * 1.65, 0, 0, 1, 1, 1); /* swings in, into the dark doorway */ list.push({ mesh: doorMesh(), m, outline: true });
        if (d.open > 0.02) { const m2 = DM[d.k + '#'] || (DM[d.k + '#'] = G.m4()); G.m4trs(m2, d.x, d.y, d.z, d.a, 0, 0, 1, 1, 1); list.push({ mesh: darkMesh(), m: m2 }); } }); } /* the dark inside of the house shows through the open door */
    return; }
  if (Math.hypot(p.x - IX, p.z - IZ) > 40) return;
  G.m4trs(MX, IX, IY, IZ, 0, 0, 0, 1, 1, 1); list.push({ mesh: mk('hRoom', room), m: MX, outline: true }); list.push({ mesh: mk('hT_' + h.t, TYPE[h.t].model), m: MX, outline: true });
  G.m4trs(MX2, IX - 0.7, IY, IZ - RD / 2 - 0.15, Math.PI / 2 * 0 + IN_DOOR.open * 1.65, 0, 0, 1.3, 1.15, 1); list.push({ mesh: doorMesh(), m: MX2, outline: true }); };
// a safety net: inside the room but no house remembered (an old save) → the door still works; far from the room → you are outside
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; doorTick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60);
  if (s.flags.inHouse && Math.hypot(P().x - IX, P().z - IZ) > 30) s.flags.inHouse = null; return r; };
})(window.G);
