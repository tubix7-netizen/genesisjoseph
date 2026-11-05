/* 약속의 길 — 짐승 더하기 · 마을 고양이 (v18.34)
   · 들짐승 다섯 종: 자칼 (애굽 사막, 밤에 많아요) · 여우 (가나안 언덕) · 나일 악어 (강가 갈대밭, 물속에서도 다녀요 · 가까이 가면 덤벼요)
     · 하마 (강가, 아주 힘세요 · 건드리지 않는 게 좋아요) · 따오기 (갈대밭의 흰 새, 날아가요). Models: models.js.
   · 마을 고양이: 애굽의 마을과 도성 골목에 고양이가 살아요. 어슬렁거리다 그늘에서 낮잠을 자고, 뛰어오면 도망가요.
     A 「고양이 쓰다듬기」 · 생선이 있으면 「생선 주기」 → 그날 하루 졸졸 따라다녀요. 애굽 사람들은 곡식 창고의 쥐를 잡아 주는
     고양이를 무척 아꼈어요 (요셉의 곳간 이야기와 이어져요). 고양이는 사냥할 수 없어요. */
'use strict';
(function (G) {
const Game = G.Game, C = G.Combat, EP = G.EP && G.EP.joseph; if (!C || !EP || !G.AB || !G.AB.cat) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), rnd = a => a[Math.floor(Math.random() * a.length)];
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const ord = () => Game.stepOrder(), after = k => { const s = S(), o = ord(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const egypt = s => after('c5_patrol'), egyptAny = s => after('c2_arrive');
const canaan = s => { const o = ord(), i = o.indexOf(s.step); return i >= o.indexOf('p_road') && i <= o.indexOf('p_approach'); };

// ------------------------------------------------------------------ the wild ones
Object.assign(C.WILD, {
  jackal: { n: '자칼', hp: 22, speed: 7.8, flee: 11, beh: 'flee', loot: { hide: 1, fang: 1, bone: 1 }, xp: 6, snd: 'growl' },
  fox: { n: '여우', hp: 12, speed: 8.2, flee: 10, beh: 'flee', loot: { hide: 1, bone: 1 }, xp: 4 },
  croc: { n: '나일 악어', hp: 90, speed: 4.6, aggro: 6, beh: 'charge', dmg: 18, loot: { meat: 3, hide: 2, fang: 2, bone: 1 }, xp: 28, snd: 'growl', sight: 14, water: 0.33 },
  hippo: { n: '하마', hp: 180, speed: 5.4, aggro: 7, beh: 'charge', dmg: 24, loot: { meat: 6, hide: 2, tusk: 2, bone: 2 }, xp: 45, snd: 'grunt', big: 1, water: 1.2 },
  ibis: { n: '따오기', hp: 5, speed: 3, flee: 8, beh: 'fly', loot: { feather: [2, 3] }, xp: 2, snd: 'flap' } });
const Z = EP.wildZones || (EP.wildZones = []), add = (id, list) => { const z = Z.find(q => q.id === id); if (z) for (const e of list) if (!z.sp.some(q => q[0] === e[0])) z.sp.push(e); };
add('eMarsh', [['ibis', 3], ['croc', 1]]); add('eEast', [['jackal', 2, 'night']]); add('eWest', [['jackal', 2, 'night']]); add('eDesert', [['jackal', 2]]);
add('cMid', [['fox', 2]]); add('cHeb', [['fox', 1]]); add('cDot', [['fox', 1]]);
/* a stretch of the Nile bank where the river horses and the crocodiles live (found at world build: the first dry bank east of the water, south of the marsh) */
const NZ = { id: 'eNile', x: -88, z: -20, r: 16, max: 3, nightMax: 2, on: egypt, sp: [['ibis', 4], ['croc', 2], ['hippo', 1]] }; Z.push(NZ);
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const wl = W.water ? W.water.level : -99;
  for (const zc of [-20, -2, 14, -36]) { let best = null; for (let x = -140; x < -40; x += 2) { const dry = W.heightAt(x, zc) > wl + 0.4, wet = W.heightAt(x - 6, zc) < wl - 0.3; if (dry && wet) { best = x; break; } } if (best !== null) { NZ.x = best + 6; NZ.z = zc; break; } } } catch (e) { console.error('fauna', e); } };

// ------------------------------------------------------------------ the town cats
const CATS = []; const Ca = G.Cats = { list: CATS };
const COATS = [[0xb8a078, null], [0xa88a60, 0x2c5aa0], [0xc8b48c, null], [0x8a7a68, 0xc8a040], [0xd0b890, 0xb3472e], [0x9a8a70, null]];
const NAMES = ['미우', '바스테', '누비', '타미', '세티', '푸티', '네페르', '아미'];
let built = false; const NOF = {};
function spawnCats() { built = true; const W = Game.W(); if (!W) return; let i = 0;
  for (const v of EP.villages || []) { if (v.x > 60) continue; const n = v.id === 'city' ? 3 : 2;
    for (let k = 0; k < n; k++, i++) { const a = (i * 2.399) % (Math.PI * 2), r = Math.min(v.r || 10, 9) * (0.4 + (k * 0.27) % 0.6), x = v.x + Math.cos(a) * r, z = v.z + Math.sin(a) * r;
      const [hide, collar] = COATS[i % COATS.length], c = { id: 'cat' + i, name: NAMES[i % NAMES.length], v: v.id, home: [x, z], x, z, y: W.heightAt(x, z), face: a, st: 'idle', t: Math.random() * 4, tx: x, tz: z, phase: 0, speed: 0,
        rig: new G.Rig(G.AB.cat), mesh: Game.animalMesh('cat', 'plain', collar ? { hide, collar } : { hide }), M: G.m4(), scale: 1, vis: true, seed: i * 7.1, bubY: 0.75 };
      CATS.push(c); } } }
const fishOf = () => { const H = G.Hearth, L = []; for (const k in Game.ITEMS) if (k !== 'gfish' && H && H.KIND && H.KIND[k] === 'fish' && Game.have && Game.have(k)) L.push(k); L.sort((a, b) => (Game.ITEMS[a].p || 0) - (Game.ITEMS[b].p || 0)); return L[0] || null; }; /* v18.34 the cheapest fish, never the golden carp */
const fr = c => (S().flags.cats = S().flags.cats || {})[c.id] || 0;
function upd(dt) { if (!built) spawnCats(); const s = S(), p = P(), W = Game.W(); if (!s || !W || !egyptAny(s)) return; const h = s.time % 24, t = performance.now() / 1000, today = s.day;
  const CF = s.flags.catF || NOF; for (const c of CATS) { const dP = Math.hypot(c.x - p.x, c.z - p.z); c.near = dP < 70; if (!c.near) continue; c.t -= dt; let want = c.face, sp = 0;
    const friend = CF[c.id] === today;
    if (dP < 3.2 && p.spd > 5 && c.st !== 'flee' && !friend) { c.st = 'flee'; c.t = 2.2; if (Math.random() < 0.6 && G.Life) G.Life.bubble(c, rnd(['냐악!', '하악!', '야옹!']), 1.6); }
    if (c.st === 'flee') { want = Math.atan2(c.x - p.x, c.z - p.z); sp = 4.2; if (c.t <= 0) { c.st = 'idle'; c.t = 3; } }
    else if (c.st === 'pet') { sp = 0; want = Math.atan2(p.x - c.x, p.z - c.z); if (c.t <= 0) { c.st = friend ? 'follow' : 'idle'; c.t = 3; } }
    else if (!friend && c.st === 'follow') { c.st = 'walk'; c.tx = c.home[0]; c.tz = c.home[1]; c.t = 40; } /* v18.34 the next day it goes home (it froze where it was) */
    else if (friend && (c.st === 'follow' || dP < 16)) { c.st = 'follow'; if (dP > 2.2) { want = Math.atan2(p.x - c.x, p.z - c.z); sp = Math.min(4.5, 0.9 + (dP - 2.2) * 1.2); } else if (c.t <= 0) { c.t = 2 + Math.random() * 3; } }
    else if (c.st === 'idle' || c.st === 'sit') { if (c.t <= 0) { const nap = h > 11.5 && h < 15 || h < 5.5; if (c.st === 'idle' && (nap || Math.random() < 0.45)) { c.st = 'sit'; c.t = nap ? 25 + Math.random() * 30 : 6 + Math.random() * 10; }
        else { c.st = 'walk'; const a = Math.random() * 6.28, r = 1.5 + Math.random() * 6; c.tx = c.home[0] + Math.cos(a) * r; c.tz = c.home[1] + Math.sin(a) * r; c.t = 9; } } }
    else if (c.st === 'walk') { const dx = c.tx - c.x, dz = c.tz - c.z, dd = Math.hypot(dx, dz); if (dd < 0.3 || c.t <= 0) { c.st = 'idle'; c.t = 1.5 + Math.random() * 4; } else { want = Math.atan2(dx, dz); sp = 0.75; } }
    c.face += G.angDiff(c.face, want) * Math.min(1, dt * 5);
    if (sp) { const nx = c.x + Math.sin(c.face) * sp * dt, nz = c.z + Math.cos(c.face) * sp * dt, wl = W.water ? W.water.level : -99; if (W.heightAt(nx, nz) > wl + 0.1) W.move(c, nx - c.x, nz - c.z, 0.18); else c.face += 1.5; }
    if (Math.hypot(c.x - c.home[0], c.z - c.home[1]) > 40 && c.st !== 'follow') { c.st = 'walk'; c.tx = c.home[0]; c.tz = c.home[1]; c.t = 30; }
    const fy = EP.floor ? EP.floor(c.x, c.z, s) : null; c.y = fy != null ? fy : W.heightAt(c.x, c.z); c.speed = sp; c.phase += sp * dt * 5.5;
    if (c.st === 'sit' && Math.random() < dt * 0.02 && dP < 12 && G.Life) G.Life.bubble(c, rnd(['(하품)', '그르릉…', '야옹']), 2); }
}
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode === 'play') try { upd(typeof dt === 'number' && dt < 0.2 ? dt : 1 / 60); } catch (e) { console.error('cats', e); } return r; };
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); if (Game.mode !== 'play' || !s || !egyptAny(s)) return; const CAM = Game.CAM, tt = typeof t === 'number' ? t : performance.now() / 1000;
  for (const c of CATS) { if (!c.near) continue; const d = Math.hypot(c.x - CAM.x, c.z - CAM.z); if (d > 40 || d < 0.6) continue;
    const A = c.ast || (c.ast = { graze: false, legH: 0.18, seed: c.seed }); A.speed = c.speed; A.phase = c.phase; A.lie = c.st === 'sit'; A.gallop = c.speed > 2.5; A.headYaw = c.st === 'pet' ? 0.3 : 0; G.animAnimal(c.rig, A, tt);
    c.rig.update(G.m4trs(c.M, c.x, c.y, c.z, c.face, 0, 0, 1, 1, 1)); const sk = c.sk || (c.sk = { mesh: c.mesh, bones: c.rig.bones, outline: true, bs: [0, 0, 0, 0.6] }); sk.outline = d < 14; sk.bs[0] = c.x; sk.bs[1] = c.y + 0.3; sk.bs[2] = c.z; list.push(sk); } };
// petting and feeding
Game.CTX.push(function (s) { const p = P(); if (!egyptAny(s) || p.ride || p.swim || p.act || Game.cineOn || (s.q && s.q.riding)) return null; let best = null, bd = 1.7;
  for (const c of CATS) { if (!c.near || c.st === 'flee') continue; const d = Math.hypot(c.x - p.x, c.z - p.z); if (d < bd) { bd = d; best = c; } } if (!best) return null; const c = best, fish = fishOf(), F = s.flags.catF || {};
  const out = [{ d: bd - 0.5, label: `고양이 쓰다듬기 · ${c.name}`, x: c.x, z: c.z, y: 0.5, key: 'catPet', noMagnet: true, use: () => petCat(c) }];
  if (fish && F[c.id] !== s.day) out.push({ d: bd - 0.4, label: `${c.name}에게 ${Game.ITEMS[fish].n} 주기`, x: c.x, z: c.z, y: 0.5, key: 'catFish', noMagnet: true, use: () => feedCat(c, fish) });
  return out; });
function petCat(c) { const s = S(), p = P(); c.st = 'pet'; c.t = 2.2; p.face = Math.atan2(c.x - p.x, c.z - p.z); P().emote = { k: 'warmHands', t: 0, dur: 1.8 }; /* v18.34 down on one knee by the cat (the 「pet」 act looks for sheep and donkeys and turned Joseph to them) */
  const n = ((s.flags.cats = s.flags.cats || {})[c.id] = (s.flags.cats[c.id] || 0) + 1); if (G.Life) G.Life.bubble(c, n > 4 ? '그르르릉… (몸을 비빈다)' : rnd(['그르릉…', '야옹~', '(눈을 지그시 감는다)']), 2.2);
  sfx('pickup', { pitch: 1.8, vol: 0.35 }); const day = s.flags.catPetDay || {}; if (day[c.id] !== s.day) { day[c.id] = s.day; s.flags.catPetDay = day; const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 3); }
  if (!s.flags.catLore) { s.flags.catLore = 1; setTimeout(() => G.UI.featCard ? G.UI.featCard('cat', { kick: '애굽의 고양이', n: '곳간을 지키는 작은 친구', ic: 'star', d: '애굽 사람들은 고양이를 무척 아꼈어요. 곡식 창고의 쥐와 뱀을 쫓아 주었거든요.' + (after('c5_patrol') ? ' 일곱 해 풍년의 곡식을 지킨 것도 이 작은 친구들이었을지 몰라요.' : '') }) : pop('애굽의 고양이', '곡식 창고의 쥐를 잡아 주는 고마운 친구', 'star'), 900); }
  G.UI.hud(); }
function feedCat(c, fish) { const s = S(); if (!Game.take(fish, 1)) return; (s.flags.catF = s.flags.catF || {})[c.id] = s.day; c.st = 'pet'; c.t = 2.6; if (G.Life) G.Life.bubble(c, '냠냠… 야옹!', 2.4); sfx('pickup', { pitch: 1.5 });
  pop(`${c.name}가 따라와요`, '오늘 하루 졸졸 따라다녀요', 'star'); G.UI.hud(); }
})(window.G);
