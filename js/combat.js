/* 약속의 길 — hero growth, weapons & armor, wildlife AI, hunting, butchering, projectiles, fishing */
'use strict';
(function (G) {
const { R, Rig, AB, animAnimal, m4, m4trs, m4mul, clamp, lerp, angDiff, GB, rng } = G;
const Game = G.Game, PI = Math.PI;
const C = G.Combat = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);

// =================================================================== ITEMS (registered into Game.ITEMS)
Object.assign(Game.ITEMS, {
  meat: { n: '생고기', cat: 'hunt', p: 6, ic: 'meat', c: '#c05a4a' }, roast: { n: '구운 고기', cat: 'food', p: 14, ic: 'meat', c: '#a8582a', stam: 60, hp: 45 },
  hide: { n: '짐승 가죽', cat: 'hunt', p: 9, ic: 'hide', c: '#a07850' }, leather: { n: '무두질한 가죽', cat: 'mat', p: 22, ic: 'hide', c: '#7a5232' },
  bone: { n: '뼈', cat: 'hunt', p: 3, ic: 'bone', c: '#ece4d0' }, horn: { n: '짐승 뿔', cat: 'hunt', p: 12, ic: 'horn', c: '#d8c8a0' },
  tusk: { n: '멧돼지 엄니', cat: 'hunt', p: 16, ic: 'horn', c: '#f0e8d8' }, fang: { n: '늑대 송곳니', cat: 'hunt', p: 10, ic: 'horn', c: '#f4f0e6' },
  claw: { n: '곰 발톱', cat: 'hunt', p: 20, ic: 'horn', c: '#3a3028' }, mane: { n: '사자 갈기', cat: 'hunt', p: 60, ic: 'wool', c: '#c8903a' },
  feather: { n: '깃털', cat: 'hunt', p: 2, ic: 'feather', c: '#c8b8a0' }, sinew: { n: '힘줄', cat: 'mat', p: 5, ic: 'thread', c: '#e0c8a8' },
  arrow: { n: '화살', cat: 'ammo', p: 2, ic: 'arrow', c: '#c8a878' }, herb: { n: '약초', cat: 'food', p: 4, ic: 'herb', c: '#6aa04a', hp: 25 },
  honey: { n: '석청', cat: 'food', p: 18, ic: 'oil', c: '#e8b030', hp: 30, stam: 80 }, flower: { n: '들꽃', cat: 'gift', p: 2, ic: 'flower', c: '#d84a5a' },
  carp: { n: '잉어', cat: 'fish', p: 7, ic: 'fish', c: '#c8a060' }, barbel: { n: '바벨', cat: 'fish', p: 9, ic: 'fish', c: '#a8a888' }, catfish: { n: '메기', cat: 'fish', p: 15, ic: 'fish', c: '#6a6458' },
  tilapia: { n: '틸라피아', cat: 'fish', p: 10, ic: 'fish', c: '#9aa0a8' }, gfish: { n: '황금 잉어', cat: 'fish', p: 80, ic: 'fish', c: '#f0c040' },
  roastfish: { n: '구운 생선', cat: 'food', p: 12, ic: 'fish', c: '#c88a40', hp: 35, stam: 50 },
  r_gazelleHorn: { n: '은빛 가젤뿔', cat: 'rare', p: 90, ic: 'horn', c: '#e0e8f0', rare: 1 }, r_ibexHorn: { n: '아이벡스 왕뿔', cat: 'rare', p: 110, ic: 'horn', c: '#c8a870', rare: 1 },
  r_wolfFang: { n: '잿빛 늑대 송곳니', cat: 'rare', p: 80, ic: 'horn', c: '#d0d4dc', rare: 1 }, r_boarTusk: { n: '늙은 멧돼지 엄니', cat: 'rare', p: 90, ic: 'horn', c: '#fff4d8', rare: 1 },
  r_bearClaw: { n: '큰곰 앞발톱', cat: 'rare', p: 140, ic: 'horn', c: '#2a2420', rare: 1 }, r_lionBone: { n: '사자의 넓적다리뼈', cat: 'rare', p: 200, ic: 'bone', c: '#fff8e0', rare: 1 },
});

// =================================================================== GEAR
const GEAR = C.GEAR = {
  staff: { n: '목자의 지팡이', kind: 'melee', dmg: 6, rate: 0.5, reach: 2.0, arc: 1.7, prop: 'staff', anim: 'swing', d: '가볍고 빠른 지팡이' },
  club: { n: '뼈 몽둥이', kind: 'melee', dmg: 12, rate: 0.72, reach: 1.8, arc: 1.5, prop: 'club', anim: 'swing', recipe: { wood: 1, bone: 4 }, d: '묵직한 한 방' },
  knife: { n: '구리 칼', kind: 'melee', dmg: 9, rate: 0.36, reach: 1.45, arc: 1.3, prop: 'knife', anim: 'thrust', crit: 0.08, butcher: 1, d: '빠르고, 도축할 때 가죽을 하나 더 얻어요' },
  spear: { n: '사냥 창', kind: 'melee', dmg: 15, rate: 0.7, reach: 2.7, arc: 0.9, prop: 'spear', anim: 'thrust', recipe: { wood: 2, stone: 2, sinew: 1 }, d: '멀리서 찌르는 긴 창' },
  sling: { n: '물매', kind: 'ranged', dmg: 8, rate: 0.9, range: 18, ammo: 'stone', prop: 'sling', anim: 'sling', recipe: { thread: 1, hide: 1 }, d: '돌을 날려요 (돌 소모) · 다윗의 무기' },
  bow: { n: '사냥 활', kind: 'ranged', dmg: 13, rate: 0.85, range: 27, ammo: 'arrow', prop: 'bow', anim: 'shoot', recipe: { wood: 2, sinew: 2, thread: 1 }, d: '화살을 쏴요 (화살 소모) · 에서의 무기 (창 27:3)' },
  fangKnife: { n: '늑대 송곳니 단검', kind: 'melee', dmg: 17, rate: 0.36, reach: 1.5, arc: 1.4, prop: 'knife', anim: 'thrust', crit: 0.2, butcher: 1, recipe: { r_wolfFang: 1, bone: 2, leather: 1 }, rareW: 1, d: '치명타가 잘 터지는 단검' },
  ibexSpear: { n: '아이벡스 뿔창', kind: 'melee', dmg: 25, rate: 0.68, reach: 2.9, arc: 1.0, prop: 'spear', anim: 'thrust', recipe: { r_ibexHorn: 1, wood: 2, sinew: 2 }, rareW: 1, d: '산양의 왕뿔을 끝에 단 창' },
  tuskClub: { n: '엄니 박힌 몽둥이', kind: 'melee', dmg: 22, rate: 0.75, reach: 1.9, arc: 1.6, prop: 'club', anim: 'swing', recipe: { r_boarTusk: 1, wood: 1, bone: 3 }, rareW: 1, d: '늙은 멧돼지의 엄니를 박았어요' },
  lionClub: { n: '사자 뼈 몽둥이', kind: 'melee', dmg: 32, rate: 0.78, reach: 2.0, arc: 1.7, prop: 'club', anim: 'swing', recipe: { r_lionBone: 1, wood: 1, leather: 1 }, rareW: 1, d: '덤불의 사자를 이긴 증표' },
  hornBow: { n: '은빛 뿔활', kind: 'ranged', dmg: 21, rate: 0.75, range: 31, ammo: 'arrow', prop: 'bow', anim: 'shoot', recipe: { r_gazelleHorn: 1, sinew: 3, wood: 1 }, rareW: 1, d: '가젤뿔로 만든 강한 활' },
  vest: { n: '가죽 조끼', kind: 'armor', def: 3, recipe: { leather: 2, thread: 2 }, mantle: 0x7a5232, d: '받는 피해 감소' },
  bearCoat: { n: '곰 가죽 겉옷', kind: 'armor', def: 7, recipe: { r_bearClaw: 1, leather: 3 }, mantle: 0x4a3426, rareW: 1, d: '두껍고 따뜻한 겉옷' },
  maneCloak: { n: '사자 갈기 망토', kind: 'armor', def: 11, recipe: { mane: 1, leather: 2, thread: 2 }, mantle: 0xc8903a, rareW: 1, d: '용맹의 망토' },
};
const SKILL = C.SKILL = {
  str: { n: '힘', d: '근접 무기 피해 +12%' }, aim: { n: '물매·활 솜씨', d: '원거리 피해 +12%, 사거리 +2m' },
  agi: { n: '몸놀림', d: '구르기 기력 −15%, 무적 시간 +' }, guard: { n: '담대함', d: '받는 피해 −6%' }, eye: { n: '짐승을 읽는 눈', d: '치명타 +4%, 희귀 전리품 확률 +' },
};
C.newHero = () => ({ lvl: 1, xp: 0, hpMax: 100, hp: 100, stamMax: 140, ip: 0, insight: 0, sk: { str: 0, aim: 0, agi: 0, guard: 0, eye: 0 }, weapon: null, ranged: null, armor: null, mode: 'melee', gear: {}, kills: {}, fish: {} });
C.hero = () => Game.S().hero;
C.owns = k => !!C.hero().gear[k];
C.lv = k => (C.hero().gear[k] || { lv: 0 }).lv;
C.giveGear = function (k, quiet) {
  const h = C.hero(); if (h.gear[k]) return; h.gear[k] = { lv: 0 }; const g = GEAR[k];
  if (g.kind === 'melee' && (!h.weapon || GEAR[h.weapon].dmg < g.dmg)) h.weapon = k;
  if (g.kind === 'ranged' && (!h.ranged || GEAR[h.ranged].dmg < g.dmg)) h.ranged = k;
  if (g.kind === 'armor' && (!h.armor || GEAR[h.armor].def < g.def)) { h.armor = k; Game.refreshLook && Game.refreshLook(); }
  if (!quiet) { G.UI.toast(`${g.n}을(를) 얻었다`); sfx('craft'); } G.UI.hud();
};
C.upCost = k => { const lv = C.lv(k), g = GEAR[k]; const base = g.kind === 'armor' ? { leather: 1 + lv, thread: 1 + lv } : g.kind === 'ranged' ? { sinew: 1 + lv, bone: 1 + lv } : { bone: 2 + lv * 2, sinew: lv };
  if (lv >= 2) base.hide = lv; if (lv >= 3 && g.rareW) base.horn = lv - 1; for (const x in base) if (!base[x]) delete base[x]; return { items: base, silver: 8 * (lv + 1) * (lv + 1) }; };
C.upgrade = function (k) {
  const lv = C.lv(k); if (lv >= 5) { G.UI.toast('이미 최고 단계예요'); return false; } const c = C.upCost(k), S = Game.S();
  if (S.silver < c.silver) { G.UI.toast('은이 부족해요'); return false; } for (const x in c.items) if (!Game.have(x, c.items[x])) { G.UI.toast(`${Game.ITEMS[x].n}이(가) 부족해요`); return false; }
  for (const x in c.items) Game.take(x, c.items[x]); Game.silver(-c.silver); C.hero().gear[k].lv = lv + 1; sfx('levelup'); G.UI.toast(`${GEAR[k].n} +${lv + 1} 강화 성공!`); Game.stat('upgraded'); Game.checkStep(); return true;
};
C.craftGear = function (k) {
  const g = GEAR[k]; if (C.owns(k)) return false; for (const x in g.recipe) if (!Game.have(x, g.recipe[x])) { G.UI.toast(`${Game.ITEMS[x].n}이(가) 부족해요`); return false; }
  for (const x in g.recipe) Game.take(x, g.recipe[x]); C.giveGear(k); Game.stat('gearMade'); Game.checkStep(); return true;
};
C.wdmg = k => { const g = GEAR[k]; return g.dmg * (1 + 0.15 * C.lv(k)); };
C.def = () => { const h = C.hero(); return h.armor ? GEAR[h.armor].def + C.lv(h.armor) : 0; };

// =================================================================== GROWTH
Game.addXP = function (n) {
  const S = Game.S(); if (!S || !S.hero) return; const h = S.hero; h.xp += n;
  const need = 40 + h.lvl * 25;
  if (h.xp >= need) { h.xp -= need; h.lvl++; h.hpMax += 8; h.stamMax += 5; h.hp = h.hpMax; Game.P.stam = h.stamMax; sfx('levelup'); G.UI.toast(`몸이 단단해졌다 · 체력 Lv ${h.lvl} (최대 체력 ${h.hpMax})`); G.UI.hud(); }
};
Game.insight = function (n, why) {
  const S = Game.S(); if (!S || !S.hero || !n) return; S.hero.ip += n; S.hero.insight += n; sfx('insight');
  G.UI.toast(`깨달음 +${n}${why ? ' · ' + why : ''} (메뉴 → 깨달음에서 쓸 수 있어요)`); G.UI.hud();
};
C.learn = function (k) { const h = C.hero(); if (h.ip < 1 || h.sk[k] >= 5) return false; h.ip--; h.sk[k]++; sfx('insight'); G.UI.hud(); return true; };
C.heal = function (n) { const h = C.hero(); h.hp = Math.min(h.hpMax, h.hp + n); G.UI.hud(); };

// =================================================================== WILDLIFE
const WILD = C.WILD = {
  hare: { n: '들토끼', hp: 8, speed: 7.5, flee: 9, beh: 'flee', loot: { meat: 1, hide: [0, 1], bone: 1 }, xp: 3, sz: 1, snd: null },
  partridge: { n: '자고새', hp: 5, speed: 3, flee: 7, beh: 'fly', loot: { meat: 1, feather: [2, 3] }, xp: 2, snd: 'flap' },
  gazelle: { n: '가젤', hp: 18, speed: 9.5, flee: 15, beh: 'flee', loot: { meat: 2, hide: 1, horn: [0, 1], bone: 1 }, rare: ['r_gazelleHorn', 0.07], xp: 6 },
  deer: { n: '노루', hp: 26, speed: 9, flee: 14, beh: 'flee', loot: { meat: 3, hide: 1, horn: 1, sinew: 1, bone: 1 }, xp: 8 },
  ibex: { n: '아이벡스', hp: 34, speed: 6.5, flee: 10, beh: 'defend', dmg: 10, loot: { meat: 2, hide: 1, horn: 2, sinew: 1, bone: 1 }, rare: ['r_ibexHorn', 0.1], xp: 10, snd: 'goat' },
  boar: { n: '멧돼지', hp: 48, speed: 6.6, aggro: 9, beh: 'charge', dmg: 14, loot: { meat: 4, hide: 1, tusk: 1, sinew: 1, bone: 1 }, rare: ['r_boarTusk', 0.1], xp: 14, snd: 'grunt' },
  wolf: { n: '늑대', hp: 36, speed: 7.6, aggro: 16, beh: 'hunt', dmg: 9, loot: { hide: 1, fang: 1, bone: 1 }, rare: ['r_wolfFang', 0.1], xp: 12, snd: 'growl' },
  bear: { n: '곰', hp: 130, speed: 5.8, aggro: 12, beh: 'charge', dmg: 22, loot: { meat: 6, hide: 2, claw: 2, bone: 2, sinew: 2 }, rare: ['r_bearClaw', 0.35], xp: 40, snd: 'roar', big: 1 },
  lion: { n: '사자', hp: 170, speed: 8.2, aggro: 18, beh: 'hunt', dmg: 26, loot: { hide: 2, bone: 3, mane: 1, sinew: 2 }, rare: ['r_lionBone', 0.5], xp: 60, snd: 'roar', big: 1 },
};
const ENT = () => Game.ENT;
let tgt = null, tgtT = 0; C.target = () => tgt;
C.wild = () => ENT().wild || (ENT().wild = []);
C.spawn = function (sp, x, z, o) {
  const d = WILD[sp], W = Game.W(); o = o || {};
  const a = { sp, d, x, z, y: W.heightAt(x, z), face: Math.random() * 6.28, hp: Math.round(d.hp * (o.hpMul || 1)), hpMax: Math.round(d.hp * (o.hpMul || 1)), st: 'idle', t: Math.random() * 3, tx: x, tz: z, rig: new Rig(AB[sp] || AB.gazelle), mesh: Game.animalMesh(sp, o.pattern || 'plain'), phase: 0, zone: o.zone, home: [x, z], spawn: [x, z], flash: 0, kb: [0, 0], vy: 0, fy: 0, special: o.special, name: o.name || d.n, scale: o.scale || 1, id: 'w' + Math.random().toString(36).slice(2, 8) };
  C.wild().push(a); return a;
};
function canSee(a) { const P = Game.P; return Math.hypot(a.x - P.x, a.z - P.z); }
/* awareness 0..1.6: animals HEAR the hero's footsteps (the noise radius from vitals.js: speed, ground, crouch, landing)
   and SEE him in front of them (less while grazing, much less while he crouches and keeps still). Past 0.35 they freeze
   and stare; at 1 prey bolts and predators commit. Awareness fades slowly when nothing happens. */
C.sense = function (a, dist, dt, night) {
  const P = Game.P, d = a.d, V = G.Vitals, noise = V ? V.noise : 3 + P.spd * 3; let gain = 0;
  if (dist < noise) gain += 1.6 * (1 - dist / noise) + 0.4;
  const sightR = (d.sight || (d.beh === 'fly' ? 13 : d.big ? 30 : 24)) * (night ? 0.5 : 1);
  if (dist < sightR && !P.ride) { const fx = Math.sin(a.face), fz = Math.cos(a.face), dot = ((P.x - a.x) * fx + (P.z - a.z) * fz) / (dist || 1);
    const cone = dot > -0.2 ? 0.5 + 0.5 * dot : 0.12, still = P.spd > 0.4 ? 1.4 : 0.5, grazing = a.st === 'idle' && (a.alert || 0) < 0.25 ? 0.55 : 1;
    gain += (P.crouch ? 0.35 : 1) * still * cone * grazing * (1 - dist / sightR) * 1.4; }
  else if (P.ride && dist < sightR * 1.2) gain += 1.2 * (1 - dist / (sightR * 1.2));
  if (dist < 2.6) gain += 2.5; else if (dist < 4.5 && P.spd > 0.4) gain += 0.5; // close enough to feel the ground move
  const before = a.alert || 0; a.alert = clamp(before + gain * dt - dt * 0.16, 0, 1.6);
  if (before < 0.35 && a.alert >= 0.35 && (d.beh === 'flee' || d.beh === 'defend') && dist < 40) { a.ears = 1; }
  return a.alert;
};
// one bolts, the herd bolts: same-kind animals nearby take fright too
C.panic = function (a) { for (const b of C.wild()) if (b !== a && b.st !== 'dead' && b.sp === a.sp && Math.hypot(b.x - a.x, b.z - a.z) < 16) b.alert = Math.max(b.alert || 0, 1.05); };
C.update = function (dt, t) {
  const S = Game.S(), P = Game.P, W = Game.W(), EP = Game.EP(); if (!S || !S.hero) return;
  const h = S.hero, list = C.wild(), hour = S.time % 24, night = hour < 5.2 || hour > 20.2;
  // spawning in zones
  C.spT = (C.spT || 0) - dt;
  if (C.spT <= 0 && EP.wildZones) { C.spT = 1.2;
    for (const z of EP.wildZones) { if (z.on && !z.on(S, Game)) continue; const dz = Math.hypot(z.x - P.x, z.z - P.z); if (dz > z.r + 70) continue;
      const cnt = list.filter(a => a.zone === z.id && a.st !== 'gone').length; const max = (night && z.nightMax !== undefined) ? z.nightMax : z.max;
      if (cnt >= max) continue;
      const pool = z.sp.filter(e => !e[2] || (e[2] === 'night' ? night : !night)); if (!pool.length) continue;
      let tot = 0; for (const e of pool) tot += e[1]; let r = Math.random() * tot, pick = pool[0][0]; for (const e of pool) { r -= e[1]; if (r <= 0) { pick = e[0]; break; } }
      for (let k = 0; k < 6; k++) { const ang = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * z.r, x = z.x + Math.cos(ang) * rr, zz = z.z + Math.sin(ang) * rr;
        if (Math.hypot(x - P.x, zz - P.z) < 28) continue; if (W.heightAt(x, zz) < (W.water ? W.water.level + 0.1 : -99)) continue; if (EP.wildOk && !EP.wildOk(x, zz)) continue;
        const pack = pick === 'wolf' ? 1 + Math.floor(Math.random() * 2) : 1; for (let p = 0; p < pack; p++) C.spawn(pick, x + p * 1.5, zz + p, { zone: z.id }); break; } } }
  // AI
  const dodging = P.dodgeT > 0;
  for (let i = list.length - 1; i >= 0; i--) {
    const a = list[i], d = a.d; const dist = Math.hypot(a.x - P.x, a.z - P.z);
    if (a.st === 'gone') { list.splice(i, 1); if (tgt === a) tgt = null; continue; }
    if (dist > 140 && !a.special) { list.splice(i, 1); if (tgt === a) tgt = null; continue; }
    a.near = dist < 80; if (!a.near) continue;
    a.flash = Math.max(0, a.flash - dt * 4); a.t -= dt;
    let speed = 0, wantFace = a.face;
    if (a.st === 'dead') { a.deadT = (a.deadT || 0) + dt; if (a.deadT > 240 && !a.special) a.st = 'gone'; }
    else {
      const al = C.sense(a, dist, dt, night), fleeD = (d.flee || 0);
      const hostile = d.beh === 'charge' || d.beh === 'hunt';
      if (P.downed) a.angry = false; // v16.9 a fallen hero is left alone: the hunt is over
      let aggro = hostile && !P.downed && (a.angry || (al >= 1 && dist < (d.aggro || 0) * 1.6) || dist < (d.aggro || 0) * 0.45 * (night && d.beh === 'hunt' ? 1.4 : 1));
      if (hostile && a.hp < a.hpMax * 0.22 && d.beh === 'hunt' && !d.big) { a.st = 'flee'; aggro = false; }
      if (C.busy || Game.cineOn || Game.mode !== 'play' || G.UI.busy() || Game.P.downed) aggro = false;
      if (aggro && G.Chem && G.Chem.scared && G.Chem.scared(a)) { aggro = false; a.angry = false; if (a.st !== 'flee') { a.st = 'flee'; a.t = 3 + Math.random() * 2; } } // v17.9 P5: beasts keep away from fire and from a lit torch
      if (a.st === 'windup') { a.t -= 0; wantFace = Math.atan2(P.x - a.x, P.z - a.z); if (a.t <= 0) { a.st = 'attack'; a.t = 0.32; a.lx = Math.sin(a.face); a.lz = Math.cos(a.face); sfx(d.snd || 'grunt', { x: a.x, z: a.z, pitch: d.big ? 0.8 : 1.1 }); } }
      else if (a.st === 'attack') { speed = d.speed * 1.9; a.x += a.lx * speed * dt; a.z += a.lz * speed * dt; speed = 0;
        if (!a.hitDone && dist < (d.big ? 2.1 : 1.5)) { a.hitDone = true; C.hurtPlayer(d.dmg, a); }
        if (a.t <= 0) { a.st = 'recover'; a.t = d.big ? 0.9 : 0.7; a.hitDone = false; } }
      else if (a.st === 'recover') { if (a.t <= 0) a.st = aggro ? 'chase' : 'idle'; }
      else if (a.st === 'stun') { speed = 0; if ((a.starT = (a.starT || 0) - dt) <= 0) { a.starT = 0.35; G.FX.burst(a.x + Math.sin(t * 5) * 0.3, a.y + (a.d.big ? 1.8 : 1.0), a.z + Math.cos(t * 5) * 0.3, 2, { c: [1, 0.95, 0.5], sp: 0.2, up: 0.4, g: 0, life: 0.6, size: 0.07 }); } if (a.t <= 0) { a.st = hostile || d.beh === 'defend' ? 'chase' : 'flee'; a.angry = hostile; } }
      else if (a.st === 'hurt') { a.x += a.kb[0] * dt; a.z += a.kb[1] * dt; a.kb[0] *= 0.85; a.kb[1] *= 0.85; if (a.t <= 0) a.st = hostile || d.beh === 'defend' ? 'chase' : 'flee'; }
      else if (aggro && hostile) { a.st = 'chase'; wantFace = Math.atan2(P.x - a.x, P.z - a.z); speed = dist > 2.4 ? d.speed : 0;
        if (d.beh === 'hunt' && dist > 5 && dist < 9) { const side = (a.id.charCodeAt(1) % 2 ? 1 : -1); wantFace += side * 0.6; }
        if (dist < (d.big ? 2.8 : 2.3)) { a.st = 'windup'; a.t = d.big ? 0.65 : 0.5; speed = 0; }
        if (!a.roared && d.snd) { a.roared = 1; sfx(d.snd, { x: a.x, z: a.z }); } }
      else if (d.beh === 'defend' && (a.angry || dist < 3.2) && dist < 6) { wantFace = Math.atan2(P.x - a.x, P.z - a.z); if (dist < 2.6) { a.st = 'windup'; a.t = 0.55; } else speed = d.speed * 0.6; a.angry = a.angry && dist < 10; }
      else if ((d.beh === 'flee' || d.beh === 'fly' || d.beh === 'defend') && (al >= 1 || a.st === 'flee' || dist < 1.8)) {
        if (a.st !== 'flee') { a.st = 'flee'; a.t = 4 + Math.random() * 2; C.panic(a); if (d.beh === 'fly') { a.fly = 1; sfx('flap', { x: a.x, z: a.z }); } else sfx(d.snd || 'hoof', { x: a.x, z: a.z, vol: 0.5, pitch: 1.3 }); }
        wantFace = Math.atan2(a.x - P.x, a.z - P.z) + Math.sin(t * 2 + a.home[0]) * 0.4; speed = d.speed; if (a.t <= 0 && dist > Math.max(fleeD * 2.2, 30)) { a.st = 'idle'; a.fly = 0; a.alert = 0.55; a.home = [a.x, a.z]; } }
      else if (al > 0.35 && !hostile) { // heard or glimpsed something: freeze, head up, stare toward the sound; one more step and it bolts
        if (a.st !== 'alert') { a.st = 'alert'; a.t = 0; } wantFace = Math.atan2(P.x - a.x, P.z - a.z); speed = 0; }
      else { // graze / wander
        if (a.st !== 'wander' && a.st !== 'idle') a.st = 'idle';
        if (a.st === 'idle' && a.t <= 0) { a.st = 'wander'; const ang = Math.random() * 6.28, rr = 4 + Math.random() * 10; a.tx = a.home[0] + Math.cos(ang) * rr; a.tz = a.home[1] + Math.sin(ang) * rr; a.t = 8; }
        if (a.st === 'wander') { const dx = a.tx - a.x, dz = a.tz - a.z, dd = Math.hypot(dx, dz); if (dd < 0.5 || a.t <= 0) { a.st = 'idle'; a.t = 2 + Math.random() * 5; } else { wantFace = Math.atan2(dx, dz); speed = d.speed * 0.18; } } }
      a.face += angDiff(a.face, wantFace) * Math.min(1, dt * (a.st === 'flee' ? 6 : 4));
      if (speed) { const nx = a.x + Math.sin(a.face) * speed * dt, nz = a.z + Math.cos(a.face) * speed * dt; const wl = W.water ? W.water.level : -99;
        if (W.heightAt(nx, nz) > wl + 0.05 || a.fly) { W.move(a, nx - a.x, nz - a.z, d.big ? 0.8 : 0.4); } else a.face += 1.2; }
      const hlim = W.half - 8; a.x = clamp(a.x, -hlim, hlim); a.z = clamp(a.z, -hlim, hlim);
    }
    a.y = W.heightAt(a.x, a.z); a.fy = lerp(a.fy, a.fly ? 3.2 + Math.sin(t * 3 + a.home[1]) * 0.5 : 0, Math.min(1, dt * 3));
    a.speed = speed; a.phase += speed * dt * (a.sp === 'hare' ? 5 : 3.2);
    animAnimal(a.rig, { speed, phase: a.phase, gallop: speed > 3, graze: a.st === 'idle' && (a.alert || 0) < 0.25 && Math.sin(t * 0.5 + a.home[0]) > 0, dead: a.st === 'dead', atk: a.st === 'windup' ? 1 : a.st === 'attack' ? 2 : 0, fly: a.fly, seed: a.home[0] }, t);
    a.rig.update(m4trs(a.M || (a.M = m4()), a.x, a.y + a.fy, a.z, a.face, 0, 0, a.scale, a.scale, a.scale));
  }
  // target selection
  tgtT -= dt; if (tgtT <= 0) { tgtT = 0.2; tgt = C.pickTarget(); }
  if (tgt && (tgt.st === 'dead' || tgt.st === 'gone')) tgt = null;
  // combat state for music / UI
  const threat = list.some(a => a.st !== 'dead' && (a.st === 'chase' || a.st === 'windup' || a.st === 'attack' || a.st === 'recover') && Math.hypot(a.x - P.x, a.z - P.z) < 22);
  C.inCombat = threat; C.calmT = threat ? 0 : (C.calmT || 0) + dt;
  // player regen out of combat
  if (!threat && !(G.Climate && G.Climate.cold) && h.hp < h.hpMax && (C.lastHurt || 0) + 6 < t) { h.hp = Math.min(h.hpMax, h.hp + dt * 1.2); C.hpDirty = 1; }
  // attack timing
  if (P.atk) { P.atk.t += dt; if (!P.atk.fired && P.atk.t >= P.atk.hit) { P.atk.fired = true; fireAttack(P.atk); } if (P.atk.t >= P.atk.dur) { P.lastAtk = { k: P.atk.k, combo: P.atk.combo || 0, end: C.tAll || 0 }; P.atk = null; } }
  C.tAll = t;
  updateProjectiles(dt);
  if (C.fish) fishUpdate(dt, t);
};
C.pickTarget = function () {
  const P = Game.P, CAM = Game.CAM, h = C.hero(); const g = GEAR[h.mode === 'ranged' && h.ranged ? h.ranged : h.weapon || 'staff'];
  const range = g ? (g.kind === 'ranged' ? g.range + h.sk.aim * 2 : 9) : 9; const fx = -Math.sin(CAM.yaw), fz = -Math.cos(CAM.yaw);
  let best = null, bs = 1e9;
  for (const a of C.wild()) { if (a.st === 'dead' || a.st === 'gone' || !a.near) continue; const dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz); if (d > range + 2) continue;
    const dot = (dx * fx + dz * fz) / (d || 1); if (dot < 0.2 && d > 3.5) continue; const hostile = a.st === 'chase' || a.st === 'windup' || a.st === 'attack';
    const s = d * (1.6 - dot) * (hostile ? 0.5 : 1); if (s < bs) { bs = s; best = a; } }
  return best;
};

// =================================================================== PLAYER COMBAT
C.attack = function () {
  const P = Game.P, S = Game.S(), h = S.hero; if (P.atk || P.dodgeT > 0 || G.UI.busy() || P.act) return;
  const ranged = h.mode === 'ranged' && h.ranged; const k = ranged ? h.ranged : (h.weapon || (Game.tool('staff') ? 'staff' : null)); if (!k) { G.UI.toast('무기가 없어요. 지팡이를 만들거나 메뉴 → 장비에서 만들어요'); return; }
  const g = GEAR[k];
  if (g.kind === 'ranged') { if (!Game.have(g.ammo)) { G.UI.toast(g.ammo === 'stone' ? '물매에 쓸 돌이 없어요 (돌무더기에서 주워요)' : '화살이 없어요 (제작에서 만들어요)'); return; } }
  if (P.stam < 3) return; P.stam -= g.kind === 'ranged' ? 3 : 5; P.stamT = 0;
  const tg = tgt; if (tg) { P.face = Math.atan2(tg.x - P.x, tg.z - P.z); const d = Math.hypot(tg.x - P.x, tg.z - P.z) - (tg.d.big ? 0.6 : 0.2);
    if (g.kind === 'melee' && d > g.reach * 0.6 && d < g.reach + 2.2) { P.lungeT = 0.2; P.lungeV = Math.min(9, (d - g.reach * 0.55) / 0.2); P.lungeDir = [Math.sin(P.face), Math.cos(P.face)]; } }
  // melee combo: attacks chained within a short window cycle through three moves; the third is a heavier finisher
  const now = C.tAll || 0, chain = g.kind === 'melee' && P.lastAtk && P.lastAtk.k === k && now - P.lastAtk.end < 0.5;
  const combo = chain ? (P.lastAtk.combo + 1) % 3 : 0, fin = g.kind === 'melee' && combo === 2;
  const rate = g.rate * (P.limp ? 1.15 : 1) * (fin ? 1.22 : combo === 1 ? 0.92 : 1);
  const anim = g.kind === 'melee' ? g.anim + (combo ? String(combo + 1) : '') : g.anim;
  if (fin && !(P.lungeT > 0) && !tg) { P.lungeT = 0.16; P.lungeV = 3.2; P.lungeDir = [Math.sin(P.face), Math.cos(P.face)]; }
  if (G.Acts) G.Acts.stop();
  P.atk = { k, g, t: 0, dur: rate, hit: g.kind === 'ranged' ? rate * 0.55 : rate * (fin ? 0.46 : 0.42), fired: false, tg, anim, combo, fin };
  sfx(g.kind === 'ranged' ? (g.ammo === 'stone' ? 'sling' : 'bow') : 'swing', { pitch: 0.9 + Math.random() * 0.2 });
};
function critRoll(g) { const h = C.hero(); return Math.random() < 0.06 + (g.crit || 0) + h.sk.eye * 0.04; }
function fireAttack(atk) {
  const P = Game.P, h = C.hero(), g = atk.g;
  if (g.kind === 'ranged') { Game.take(g.ammo, 1); const tg = atk.tg && atk.tg.st !== 'dead' && !atk.miss ? atk.tg : null; const sy = P.y + 1.5; // v16.6 sling timing: atk.mul / atk.miss / atk.crit / atk.short
    let vx = Math.sin(P.face + (atk.miss ? (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.12) : 0)), vz = Math.cos(P.face + (atk.miss ? 0.1 : 0)), vy = atk.short ? -0.05 : 0.08; const spd = g.ammo === 'arrow' ? 34 : 26;
    if (tg) { const tx = tg.x + Math.sin(tg.face) * (tg.speed || 0) * 0.25, tz = tg.z + Math.cos(tg.face) * (tg.speed || 0) * 0.25, ty = tg.y + tg.fy + (tg.d.big ? 0.9 : 0.5); const dx = tx - P.x, dz = tz - P.z, dd = Math.hypot(dx, dz); vx = dx / dd; vz = dz / dd; const tt = dd / spd; vy = (ty - sy) / dd + 0.5 * 9.8 * tt / spd; }
    proj.push({ x: P.x + vx * 0.6, y: sy, z: P.z + vz * 0.6, vx: vx * spd, vy: vy * spd, vz: vz * spd, t: 0, dmg: C.wdmg(atk.k) * (1 + h.sk.aim * 0.12) * (atk.mul === undefined ? 1 : atk.mul), crit: atk.crit === undefined ? critRoll(g) : atk.crit, head: !!atk.head, kind: g.ammo, range: (g.range + h.sk.aim * 2) * (atk.short ? 0.6 : 1) }); return; }
  const reach = g.reach + 0.3, fx = Math.sin(P.face), fz = Math.cos(P.face); let hit = false;
  for (const a of C.wild()) { if (a.st === 'dead' || a.st === 'gone') continue; const dx = a.x - P.x, dz = a.z - P.z, d = Math.hypot(dx, dz) - (a.d.big ? 0.6 : 0.2); if (d > reach) continue;
    const ang = Math.acos(clamp((dx * fx + dz * fz) / (Math.hypot(dx, dz) || 1), -1, 1)); if (ang > g.arc * 0.5 + (atk.fin ? 0.4 : 0) + (d < 1 ? 0.6 : 0)) continue;
    const cr = critRoll(g); damage(a, C.wdmg(atk.k) * (1 + h.sk.str * 0.12) * (cr ? 1.8 : 1) * (atk.fin ? 1.35 : 1), cr, fx, fz); hit = true; }
  if (atk.fin) { Game.CAM.shake = Math.max(Game.CAM.shake || 0, 0.45); G.FX.burst(P.x + fx * 1.1, P.y + 0.08, P.z + fz * 1.1, 10, { c: [0.8, 0.72, 0.58], sp: 1.8, up: 0.7, size: 0.22 }); }
  if (Game.EP().onSwing) Game.EP().onSwing(atk, hit);
}
// v16.9 sling head shot: the beast staggers and stands dazed for a moment (stars over its head), then comes back angry
function stun(a, s) { a.st = 'stun'; a.t = s; a.kb[0] = a.kb[1] = 0; G.FX.burst(a.x, a.y + (a.d.big ? 1.9 : 1.1), a.z, 12, { c: [1, 0.92, 0.45], sp: 0.8, up: 1.2, g: 0.2, life: 1.2, size: 0.09 }); sfx('crit', { x: a.x, z: a.z, pitch: 1.4 }); }
C.stun = stun;
C.damage = (...a) => damage(...a); // (exported for tests and for other modules)
function damage(a, dmg, crit, kx, kz) {
  a.alert = 1.6; C.panic(a);
  dmg = Math.round(dmg); a.hp -= dmg; a.flash = 1; a.angry = true; sfx(crit ? 'crit' : 'hit', { x: a.x, z: a.z, pitch: a.d.big ? 0.75 : 1.1 });
  G.UI.dmg && G.UI.dmg(a.x, a.y + a.fy + (a.d.big ? 1.6 : 0.9), a.z, dmg, crit ? 'crit' : 'hit');
  Game.CAM.shake = Math.max(Game.CAM.shake || 0, crit ? 0.6 : 0.35); C.hitStop = crit ? 0.07 : 0.045;
  if (a.hp <= 0) { kill(a); return; }
  if (G.Motion && a.rig) G.Motion.react(a.rig, kx, kz, a.face, Math.min(1.4, 0.4 + dmg / (a.hpMax || 20) * 2.5 + (crit ? 0.3 : 0))); // v18.1 P8
  if (a.st !== 'attack') { a.st = 'hurt'; a.t = 0.28; a.kb[0] = kx * (a.d.big ? 2 : 6); a.kb[1] = kz * (a.d.big ? 2 : 6); }
  if (a.fly) a.fly = 0;
}
function kill(a) {
  const h = C.hero(); a.st = 'dead'; a.hp = 0; a.fly = 0; a.deadT = 0; sfx('die', { x: a.x, z: a.z, pitch: a.d.big ? 0.6 : 1.2 }); h.kills[a.sp] = (h.kills[a.sp] || 0) + 1; Game.stat('kills');
  Game.addXP(a.d.xp); G.FX.burst(a.x, a.y + 0.6, a.z, 14, { c: [0.85, 0.8, 0.7], sp: 1.6, up: 1.2 });
  if (tgt === a) tgt = null; const EP = Game.EP(); if (EP.onKill) EP.onKill(a, Game.S(), Game); if (G.Life && G.Life.onKill) G.Life.onKill(a); Game.checkStep();
}
C.kill = kill;
C.hurtPlayer = function (dmg, src) {
  const P = Game.P, h = C.hero(); if (P.dodgeT > 0.05 || Game.mode !== 'play' || G.UI.busy() || Game.cineOn || P.downed) { if (P.dodgeT > 0) { G.UI.dmg && G.UI.dmg(P.x, P.y + 2, P.z, 0, 'dodge'); } return; }
  const red = Math.min(0.65, C.def() * 0.035 + h.sk.guard * 0.06); dmg = Math.max(1, Math.round(dmg * (1 - red)));
  h.hp -= dmg; C.lastHurt = C.tAll || 0; P.tint = [1.6, 0.6, 0.55]; P.tintT = 0.25; sfx('hurt'); Game.haptic && Game.haptic('hurt'); Game.CAM.shake = 0.8;
  G.UI.dmg && G.UI.dmg(P.x, P.y + 2.1, P.z, dmg, 'me');
  if (src) { const dx = P.x - src.x, dz = P.z - src.z, d = Math.hypot(dx, dz) || 1; P.vx += dx / d * 7; P.vz += dz / d * 7; G.Motion && G.Motion.react(P.rig, dx, dz, P.face, Math.min(1.4, 0.4 + dmg / (h.hpMax || 100) * 3)); } // v18.1 P8: a spring reaction away from the blow
  if (h.hp <= 0) { h.hp = 0; C.faint(); } G.UI.hud();
};
C.faint = function () {
  const S = Game.S(), EP = Game.EP(); C.busy = true;
  G.UI.fade(() => { const lost = Math.floor(S.silver * 0.1); Game.silver(-lost); const b = (EP.stations || []).find(s => s.type === 'bed' && (!s.on || s.on(S, Game))); if (b) Game.teleport(b.x + 1, b.z + 1, 0);
    for (const a of C.wild()) if (a.st !== 'dead') { a.st = 'idle'; a.angry = false; } S.hero.hp = Math.round(S.hero.hpMax * 0.6); S.time = Math.max(S.time, (S.time % 24 > 17 ? S.time : S.time) + 3); Game.P.stam = S.hero.stamMax;
    G.UI.toast(lost ? `쓰러졌다가 장막에서 깨어났다… (은 ${lost}을 잃었다)` : '쓰러졌다가 장막에서 깨어났다…'); }, () => { C.busy = false; });
};
C.dodge = function () {
  const P = Game.P, h = C.hero(); if (P.dodgeT > 0 || P.atk || G.UI.busy()) return false; const cost = Math.round(18 * (1 - h.sk.agi * 0.15)); if (P.stam < cost) return false;
  P.stam -= cost; P.stamT = 0; P.dodgeT = 0.42 + h.sk.agi * 0.03; P.dodgeDir = null; sfx('dodge'); return true;
};
C.toggleMode = function () { const h = C.hero(); if (!h.ranged) { G.UI.toast('물매나 활이 있어야 바꿀 수 있어요'); return; } h.mode = h.mode === 'ranged' ? 'melee' : 'ranged'; G.UI.toast(h.mode === 'ranged' ? `원거리 · ${GEAR[h.ranged].n}` : `근접 · ${GEAR[h.weapon || 'staff'].n}`); sfx('click'); G.UI.hud(); };
C.heldProp = function () { const P = Game.P, h = C.hero(); if (!h) return null; if (P.atk) return P.atk.g.prop; if (C.inCombat || (C.calmT || 0) < 4) { const k = h.mode === 'ranged' && h.ranged ? h.ranged : h.weapon || (Game.tool('staff') ? 'staff' : null); return k ? GEAR[k].prop : null; } return null; };

// =================================================================== PROJECTILES
const proj = [];
function updateProjectiles(dt) {
  const W = Game.W();
  for (let i = proj.length - 1; i >= 0; i--) { const p = proj[i]; p.t += dt; p.vy -= 9.8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    let done = p.t > 2.5 || p.y < W.heightAt(p.x, p.z);
    for (const a of C.wild()) { if (a.st === 'dead' || a.st === 'gone') continue; const r = a.d.big ? 1.1 : a.sp === 'hare' || a.sp === 'partridge' ? 0.55 : 0.75; const cy = a.y + a.fy + (a.d.big ? 0.9 : 0.5);
      if (Math.hypot(a.x - p.x, a.z - p.z, (cy - p.y) * 0.7) < r) { const v = Math.hypot(p.vx, p.vz) || 1; damage(a, p.dmg * (p.crit ? 1.8 : 1), p.crit, p.vx / v, p.vz / v); if (p.head && a.st !== 'dead') stun(a, a.d.big ? 1.6 : 2.6); sfx('arrowHit', { x: p.x, z: p.z }); done = true; break; } }
    if (!done && G.Phys && G.Phys.hitAt(p.x, p.y, p.z, p.vx, p.vy, p.vz)) done = true; // knocks over jars, stones…
    if (done) { proj.splice(i, 1); if (p.y < W.heightAt(p.x, p.z) + 0.3) G.FX.burst(p.x, W.heightAt(p.x, p.z) + 0.05, p.z, 5, { c: [0.75, 0.68, 0.55], sp: 0.8, up: 1 }); } }
}

// =================================================================== BUTCHERING (context action)
C.context = function () {
  const P = Game.P, S = Game.S(); const out = [];
  for (const a of C.wild()) { if (a.st !== 'dead') continue; const d = Math.hypot(a.x - P.x, a.z - P.z); if (d > 2.4) continue;
    out.push({ d: d - 0.8, label: `${a.name} 손질하기`, x: a.x, z: a.z, yAbs: a.y + 1, anim: 'gather', dur: 1.1, prop: 'knife', fn: () => butcher(a), key: 'carcass:' + a.id }); }
  // fishing
  const W = Game.W(); if (W && W.water && Game.tool('fishrod') && !C.fish) { const fx = Math.sin(P.face), fz = Math.cos(P.face);
    for (const r of [2.2, 3.4]) { const wx = P.x + fx * r, wz = P.z + fz * r; if (W.heightAt(wx, wz) < W.water.level - 0.35 && W.heightAt(P.x, P.z) > W.water.level - 0.2) { out.push({ d: 1.4, label: '낚시하기', x: wx, z: wz, y: 0.8, use: () => C.startFish(wx, wz), key: 'fish' }); break; } } }
  return out;
};
function butcher(a) {
  if (a.st !== 'dead') return; const h = C.hero(), loot = {};
  for (const k in a.d.loot) { const v = a.d.loot[k]; const n = Array.isArray(v) ? v[0] + Math.floor(Math.random() * (v[1] - v[0] + 1)) : v; if (n > 0) loot[k] = n; }
  if (h.weapon && GEAR[h.weapon].butcher && loot.hide) loot.hide++;
  if (a.d.rare) { const p = a.d.rare[1] * (1 + h.sk.eye * 0.35) * (a.special ? 3 : 1); if (Math.random() < p || (a.special && a.d.big)) loot[a.d.rare[0]] = 1; }
  for (const k in loot) Game.give(k, loot[k]);
  const rareK = Object.keys(loot).find(k => Game.ITEMS[k] && Game.ITEMS[k].rare); if (rareK) { G.UI.toast(`희귀한 전리품! ${Game.ITEMS[rareK].n} · 장비 탭에서 무기로 만들 수 있어요`); sfx('levelup'); }
  sfx('butcher', { x: a.x, z: a.z }); a.st = 'gone'; Game.stat('butchered'); G.FX.burst(a.x, a.y + 0.3, a.z, 12, { c: [0.6, 0.35, 0.3], sp: 1, up: 1 });
  const EP = Game.EP(); if (EP.onButcher) EP.onButcher(a, Game.S(), Game); Game.checkStep();
}

// =================================================================== FISHING
C.startFish = function (wx, wz) {
  const P = Game.P; if (C.fish) return; P.face = Math.atan2(wx - P.x, wz - P.z);
  C.fish = { x: wx, z: wz, st: 'cast', t: 0, wait: 2 + Math.random() * 4.5, tension: 0.3, prog: 0, pull: 0 }; P.act = 'cast'; P.actT = 0; P.actDur = 0.7; P.actProp = 'fishrod'; P.lock = true;
  G.UI.fishUI && G.UI.fishUI(true); sfx('swing');
};
/* fishing, RDR2-style: cast → the float sits → small nibbles (strike now and the fish is gone) → the real bite pulls the
   float under (strike within a second) → the fight. The fish runs left or right; push the stick the OTHER way to ease
   the line, hold A to reel. Too much tension snaps the line. Every catch is weighed; big ones are remembered. */
const FISHW = { carp: [0.6, 3.2], barbel: [0.5, 2.6], tilapia: [0.3, 1.8], catfish: [1.5, 9], gfish: [1.2, 3], perch: [2, 18], mullet: [0.4, 2.2] };
function fishUpdate(dt, t) {
  const f = C.fish, P = Game.P, IN = Game.INPUT; f.t += dt; P.actProp = 'fishrod'; if (!P.act || P.act === 'cast' && P.actT > 0.6) { P.act = 'fish'; P.actT = 0; P.actDur = 99; }
  if (f.st === 'cast' && f.t > 0.7) { f.st = 'wait'; f.t = 0; f.nibbles = Math.floor(Math.random() * 3); f.nextN = 0.8 + Math.random() * 1.6; sfx('splash', { vol: 0.35 }); }
  else if (f.st === 'wait') { if (f.nibbles > 0 && f.t > f.nextN) { f.st = 'nibble'; f.t = 0; f.nibbles--; sfx('bite', { vol: 0.35, pitch: 1.4 }); } else if (f.nibbles <= 0 && f.t > f.wait) { f.st = 'bite'; f.t = 0; sfx('bite'); Game.haptic && Game.haptic('hit'); } }
  else if (f.st === 'nibble' && f.t > 0.35) { f.st = 'wait'; f.t = 0; f.nextN = 0.7 + Math.random() * 1.8; f.wait = 1 + Math.random() * 2.5; }
  else if (f.st === 'bite' && f.t > 1.0) { f.st = 'miss'; }
  else if (f.st === 'reel') { const hold = IN.actHeld;
    f.dirT -= dt; if (f.dirT <= 0) { f.dir = Math.random() < 0.5 ? -1 : 1; f.dirT = 1.2 + Math.random() * 2.2 / (0.6 + f.power); f.rest = Math.random() < 0.25 ? 0.9 : 0; }
    if (f.rest > 0) f.rest -= dt; const run = f.rest > 0 ? 0.2 : 1;
    const stick = clamp(IN.mx + ((IN.keys.KeyD ? 1 : 0) - (IN.keys.KeyA ? 1 : 0)), -1, 1), counter = -stick * f.dir; // pushing against the run eases the line
    f.pull = (0.55 + 0.45 * Math.sin(t * 2.3 + f.seed)) * run;
    f.tension = clamp(f.tension + ((hold ? 0.5 : -0.75) + f.pull * 0.6 * f.power - Math.max(0, counter) * 0.75 + Math.max(0, -counter) * 0.35) * dt, 0, 1.05);
    if (hold) { f.prog += dt * (0.3 - f.power * 0.09) * (f.tension < 0.85 ? 1 : 0.3) * (f.rest > 0 ? 1.6 : 1); sfx('reel', { vol: 0.35, gap: 0.12 }); } else f.prog -= dt * 0.05 * run;
    f.prog = Math.max(0, f.prog); f.bx = (f.bx || 0) + (f.dir * run * 0.9 - (f.bx || 0) * 0.6) * dt; // the float swims off to the side
    if (f.tension >= 1.0) { f.st = 'snap'; } if (f.prog >= 1) f.st = 'land'; }
  G.UI.fishUI && G.UI.fishUI(true, f);
  if (f.st === 'miss' || f.st === 'snap' || f.st === 'land' || f.st === 'early') {
    const S = Game.S(); let msg;
    if (f.st === 'land') { const k = f.fish, h = C.hero(); Game.give(k, 1); h.fish[k] = (h.fish[k] || 0) + 1; Game.stat('fish'); Game.addXP(k === 'gfish' ? 20 : Math.round(3 + f.kg)); h.fishRec = h.fishRec || {};
      const rec = f.kg > (h.fishRec[k] || 0); if (rec) h.fishRec[k] = f.kg;
      msg = `${Game.ITEMS[k].n}을(를) 낚았다! · ${f.kg.toFixed(1)}kg${rec && h.fish[k] > 1 ? ' · 새 기록!' : ''}`; sfx(k === 'gfish' || rec && h.fish[k] > 1 ? 'levelup' : 'splash'); Game.haptic && Game.haptic('quest');
      if (G.Fx2) G.Fx2.splash(f.x, f.z, 1.2); if (Game.EP().onFish) Game.EP().onFish(k, S, Game); }
    else msg = f.st === 'snap' ? '줄이 너무 팽팽해서 물고기가 달아났다… (물고기가 도는 반대쪽으로 스틱을 밀어요)' : f.st === 'early' ? '너무 일찍 챘어요 · 톡톡 건드릴 땐 기다렸다가, 찌가 쑥 들어갈 때!' : '물고기가 미끼만 먹고 달아났다';
    G.UI.toast(msg); C.fish = null; P.act = null; P.actProp = null; P.lock = false; G.UI.fishUI && G.UI.fishUI(false); Game.checkStep();
  }
}
C.fishPress = function () {
  const f = C.fish; if (!f) return false;
  if (f.st === 'bite') { const EP = Game.EP(); const table = (EP.fishAt && EP.fishAt(f.x, f.z)) || [['carp', 6], ['barbel', 3], ['catfish', 1]];
    let tot = 0; for (const e of table) tot += e[1]; let r = Math.random() * tot; f.fish = table[0][0]; for (const e of table) { r -= e[1]; if (r <= 0) { f.fish = e[0]; break; } }
    const wr = FISHW[f.fish] || [0.5, 3], q = Math.pow(Math.random(), 2.2); f.kg = wr[0] + (wr[1] - wr[0]) * q;
    f.power = ({ carp: 0.5, barbel: 0.6, tilapia: 0.55, catfish: 0.9, gfish: 1.2, perch: 1.0, mullet: 0.6 }[f.fish] || 0.6) * (0.75 + q * 0.6);
    f.st = 'reel'; f.t = 0; f.seed = Math.random() * 10; f.dir = 1; f.dirT = 0; f.rest = 0; sfx('splash', { vol: 0.6 }); Game.haptic && Game.haptic('thud'); return true; }
  if (f.st === 'nibble') { f.st = 'early'; return true; }
  if (f.st === 'wait' || f.st === 'cast') { f.st = 'miss'; return true; }
  return f.st === 'reel';
};
C.cancelFish = function () { if (!C.fish) return; C.fish.st = 'miss'; };

// =================================================================== RENDER
let projMesh = { stone: null, arrow: null }, ringMesh = null, bobMesh = null;
const TM = m4(), RM = m4();
C.render = function (scene) {
  const CAM = Game.CAM;
  for (const a of C.wild()) { if (!a.near) continue; const d = Math.hypot(a.x - CAM.x, a.z - CAM.z); if (d > 75 || d < 0.8) continue;
    const sk = a.sk || (a.sk = { mesh: a.mesh, bones: a.rig.bones, bs: [0, 0, 0, a.d.big ? 2.2 : 1.4] }); sk.outline = d < 40; sk.bs[0] = a.x; sk.bs[1] = a.y + 0.7 + a.fy; sk.bs[2] = a.z;
    sk.tint = a.flash > 0 ? (a.flashT || (a.flashT = [1, 1, 1])) : null; if (sk.tint) { const k = 1 + a.flash * 1.5; sk.tint[0] = k; sk.tint[1] = 1 + a.flash * 0.4; sk.tint[2] = 1 + a.flash * 0.3; }
    sk.emis = a.special ? [0.12, 0.05, 0.0] : null; scene.skinned.push(sk); }
  for (const p of proj) { const k = p.kind; if (!projMesh[k]) { const g = new GB(3); if (k === 'stone') g.sph(0.07, 6, 4, { c: 0xa8a090 }); else { g.cyl(0.012, 0.012, 0.75, 4, { rx: PI / 2, c: 0xc8a070 }); g.cyl(0, 0.025, 0.08, 4, { rx: PI / 2, at: [0, 0, 0.4], c: 0x8a8a90 }); g.box(0.005, 0.05, 0.1, { at: [0, 0, -0.33], c: 0xe8e0d0 }); } projMesh[k] = R.mesh(g); }
    const yaw = Math.atan2(p.vx, p.vz), pit = -Math.atan2(p.vy, Math.hypot(p.vx, p.vz)); scene.dyn.push({ mesh: projMesh[k], m: m4trs(p.m || (p.m = m4()), p.x, p.y, p.z, yaw, pit, 0), shadow: false }); }
  if (tgt && tgt.st !== 'dead') { if (!ringMesh) { const g = new GB(2); for (let i = 0; i < 24; i++) { const a0 = i / 24 * PI * 2, a1 = (i + 1) / 24 * PI * 2; const q = (a, r) => [Math.cos(a) * r, 0, Math.sin(a) * r]; for (const v of [q(a0, 0.85), q(a1, 0.85), q(a1, 1.0), q(a0, 0.85), q(a1, 1.0), q(a0, 1.0)]) g.d.push(v[0], v[1], v[2], 0, 1, 0, 1, 0.35, 0.25, 0.8, 0); } ringMesh = R.mesh(g); }
    const s = tgt.d.big ? 1.6 : tgt.sp === 'hare' || tgt.sp === 'partridge' ? 0.6 : 1.0; scene.flats.push({ mesh: ringMesh, m: m4trs(RM, tgt.x, tgt.y + 0.1, tgt.z, (C.tAll || 0) * 1.5, 0, 0, s, 1, s), color: [1, 0.55, 0.45, 0.85] }); }
  if (C.fish && C.fish.st !== 'cast') { if (!bobMesh) { const g = new GB(2); g.sph(0.07, 8, 6, { c: 0xf0f0f0 }); g.sph(0.07, 8, 3, { tl: PI / 2, c: 0xd03a2a, at: [0, 0.005, 0] }); g.cyl(0.006, 0.006, 0.14, 4, { at: [0, 0.1, 0], c: 0x3a2a20 }); bobMesh = R.mesh(g); }
    const W = Game.W(), f = C.fish, P = Game.P, dip = f.st === 'bite' ? -0.08 + Math.sin((C.tAll || 0) * 30) * 0.03 : f.st === 'nibble' ? -0.03 * Math.sin(f.t / 0.35 * PI) : f.st === 'reel' ? -0.05 - f.tension * 0.06 : Math.sin((C.tAll || 0) * 2.5) * 0.015;
    const sx = Math.cos(P.face), sz = -Math.sin(P.face), bx = f.x + sx * (f.bx || 0) - Math.sin(P.face) * (f.st === 'reel' ? f.prog * 1.4 : 0), bz = f.z + sz * (f.bx || 0) - Math.cos(P.face) * (f.st === 'reel' ? f.prog * 1.4 : 0), by = W.water.level + 0.02 + dip;
    scene.dyn.push({ mesh: bobMesh, m: m4trs(TM, bx, by, bz, 0), shadow: false });
    // the line, from the rod tip to the float (sags when slack, straight under tension)
    if (!C.lineMesh) { const g = new GB(3); g.cyl(0.005, 0.005, 1, 3, { base: true, c: 0xf2efe6 }); C.lineMesh = R.mesh(g); }
    const hm = P.rig.world[G.HBI.handR], tx = hm[12] + Math.sin(P.face) * 2.0, ty = hm[13] + 0.9, tz = hm[14] + Math.cos(P.face) * 2.0;
    const dx = bx - tx, dy = by - ty, dz = bz - tz, L = Math.hypot(dx, dy, dz) || 1e-3;
    scene.dyn.push({ mesh: C.lineMesh, m: m4trs(RM, tx, ty, tz, Math.atan2(dx, dz), Math.acos(clamp(dy / L, -1, 1)), 0, 1, L, 1), shadow: false }); }
};

C.onDay = function () { for (const a of C.wild()) if (a.st === 'dead' && !a.special) a.st = 'gone'; };
C.reset = function (S) { if (!S.hero) S.hero = C.newHero(); ENT().wild = []; proj.length = 0; tgt = null; C.fish = null; C.inCombat = false; };
})(window.G);
