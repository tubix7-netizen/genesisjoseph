/* 약속의 길 — 사냥감 더하기 (v18.13d)
   · 새 짐승 5종: 비둘기 (가나안·애굽, 날아감) · 나일 거위 (나일 강가 갈대밭, 날아감, 가끔 알) · 들염소 (가나안 언덕, 도망)
     · 오릭스 (애굽 동쪽 사막, 뿔로 맞섬) · 타조 (사막, 아주 빠름, 깃털과 타조알). Models: models.js (def.bird for the birds).
   · 새 재료 4가지: 비둘기 고기 · 거위 고기 · 염소 고기 (all count as 고기 for the old free recipes) · 타조알 (counts as 새알).
   · 새 요리 9가지, each an exact set of ingredients (checked before older recipes; the sets are unique). 타조알 dishes feed more. */
'use strict';
(function (G) {
const Game = G.Game, C = G.Combat, H = G.Hearth, CU = G.Cuisine, EP = G.EP && G.EP.joseph; if (!C || !H || !CU || !EP) return;
const Hu = G.Hunt = {};

// ------------------------------------------------------------------ animals
Object.assign(C.WILD, {
  dove: { n: '비둘기', hp: 4, speed: 3, flee: 7, beh: 'fly', loot: { dove: 1, feather: [1, 2] }, xp: 2, snd: 'flap' },
  goose: { n: '나일 거위', hp: 10, speed: 3.5, flee: 8, beh: 'fly', loot: { goose: 1, feather: [2, 4], egg: [0, 1] }, xp: 4, snd: 'flap' },
  wgoat: { n: '들염소', hp: 20, speed: 7, flee: 12, beh: 'flee', loot: { goatMeat: 2, hide: 1, horn: [0, 1], bone: 1 }, xp: 6, snd: 'goat' },
  oryx: { n: '오릭스', hp: 38, speed: 8.5, flee: 12, beh: 'defend', dmg: 12, loot: { meat: 3, hide: 1, horn: 2, sinew: 1, bone: 1 }, xp: 13, snd: 'goat' },
  ostrich: { n: '타조', hp: 40, speed: 11, flee: 16, beh: 'flee', loot: { meat: 3, feather: [4, 6], ostrichEgg: [0, 1], sinew: 1, bone: 1 }, xp: 14 } });

// ------------------------------------------------------------------ where they live
const between = (S, a) => { const o = Game.stepOrder(); return o.indexOf(S.step) >= o.indexOf(a); };
const canaan = S => { const o = Game.stepOrder(), i = o.indexOf(S.step); return i >= o.indexOf('p_road') && i <= o.indexOf('p_approach'); }, egypt = S => between(S, 'c5_patrol');
const Z = EP.wildZones || (EP.wildZones = []), add = (id, list) => { const z = Z.find(q => q.id === id); if (z) for (const e of list) if (!z.sp.some(q => q[0] === e[0])) z.sp.push(e); };
add('cMid', [['dove', 3], ['wgoat', 2]]); add('cDot', [['wgoat', 2]]); add('cHeb', [['dove', 2]]); add('cShe', [['wgoat', 1]]);
add('eEast', [['oryx', 2], ['ostrich', 1]]); add('eNorth', [['dove', 2]]); add('eWest', [['oryx', 1]]);
Z.push({ id: 'eMarsh', x: -76, z: -122, r: 20, max: 4, nightMax: 1, on: egypt, sp: [['goose', 5], ['dove', 2]] }, // the reed beds on the Nile's east bank
  { id: 'eDesert', x: 96, z: 104, r: 24, max: 3, nightMax: 1, on: egypt, sp: [['ostrich', 3], ['oryx', 2], ['hare', 2]] }); // the open desert toward Canaan
Hu.canaan = canaan;

// ------------------------------------------------------------------ ingredients
const ING = { dove: ['비둘기 고기', 'meat', '#c07a6a', 'meat', 6], goose: ['거위 고기', 'meat', '#c8846a', 'meat', 10], goatMeat: ['염소 고기', 'meat', '#b0503a', 'meat', 8], ostrichEgg: ['타조알', 'berry', '#f4eedc', 'egg', 16] };
for (const k in ING) { const [n, ic, c, kind, p] = ING[k]; Game.ITEMS[k] = Game.ITEMS[k] || Object.assign({ n, cat: kind === 'egg' ? 'food' : 'hunt', p, ic, c }, kind === 'egg' ? { hp: 20 } : {}); H.KIND[k] = kind; }

// ------------------------------------------------------------------ dishes: [name, icon, colour, method, class, tier, temp, recipe text, verse, look, taste, ingredients, spot, water, extra servings]
const FISH = '#fish';
const NEW = {
  doveRoast: ['비둘기 꼬치구이', 'meat', '#a8603a', 'grill', 'meat', 2, 'warm', '비둘기 고기 + 약초', '', [0xa8603a, 0x6aa04a], '작지만 고소하다!', ['dove', 'herb'], 'spit', 0, 0],
  doveLentil: ['비둘기 렌틸 수프', 'bowl', '#b0703a', 'stew', 'meat', 3, 'warm', '비둘기 고기 + 렌틸 + 양파 + 물', '', [0xb0703a, 0xd8a050], '뭉근히 끓여서 속이 든든해.', ['dove', 'lentil', 'onion'], 'pot', 1, 0],
  gooseHoney: ['꿀 바른 나일 거위 구이', 'meat', '#c07a30', 'grill', 'meat', 3, 'warm', '거위 고기 + 꿀 + 마늘', '', [0xc07a30, 0xe8b040], '껍질은 바삭, 속은 달큰해!', ['goose', 'honey', 'garlic'], 'spit', 0, 0],
  gooseFig: ['무화과 거위 찜', 'meat', '#8a4a3a', 'stew', 'meat', 3, 'warm', '거위 고기 + 무화과 + 양파 + 물', '', [0x8a4a3a, 0x6a3a52], '무화과 단맛이 거위에 배었어.', ['goose', 'fig', 'onion'], 'pot', 1, 0],
  goatBarley: ['들염소 보리 국', 'bowl', '#a88050', 'stew', 'meat', 2, 'warm', '염소 고기 + 보리 + 물', '', [0xa88050, 0xd8b040], '목자들이 들에서 끓여 먹던 맛이야.', ['goatMeat', 'barley'], 'pot', 1, 0],
  goatCumin: ['커민 염소 꼬치', 'meat', '#9a5030', 'grill', 'meat', 3, 'warm', '염소 고기 + 커민 + 마늘', '', [0x9a5030, 0xa8783a], '향신료 냄새에 침이 고여!', ['goatMeat', 'cumin', 'garlic'], 'spit', 0, 0],
  ostrichOmelet: ['타조알 부추 지짐', 'veg', '#e8d070', 'bake', 'mixed', 3, 'warm', '타조알 + 부추 + 소금', '', [0xe8d070, 0x6a9a3a], '이 큰 지짐 하나면 온 식구가 먹겠어!', ['ostrichEgg', 'leek', 'salt'], 'stone', 0, 2],
  ostrichCake: ['타조알 꿀 빵', 'bread', '#e8c070', 'bake', 'sweet', 3, '', '타조알 + 밀 + 꿀', '', [0xe8c070, 0xe8b040], '폭신하고 달콤해. 아이들이 좋아하겠다.', ['ostrichEgg', 'wheat', 'honey'], 'stone', 0, 2],
  hunterFeast: ['들판의 사냥 잔치', 'meat', '#a8582a', 'grill', 'mixed', 4, 'warm', '고기 + 염소 고기 + 거위 고기 + 소금', '너는 사냥하여 나를 위하여 별미를 만들어 (창 27:3–4)', [0xa8582a, 0xc8846a], '들에서 잡은 것으로 차린 잔치야!', ['meat', 'goatMeat', 'goose', 'salt'], 'spit', 0, 1] };
Hu.NEW = NEW;
for (const k in NEW) { const [n, ic, c, m, cls, tier, temp, how, ref, look, taste] = NEW[k];
  Game.ITEMS[k] = Game.ITEMS[k] || { n, cat: 'food', p: 8 + tier * 6, ic, c };
  H.DISH[k] = { n, ic, c, pot: m, how, ref, food: 30 }; H.METHOD[k] = m; H.LOOKS[k] = look; H.TASTE[k] = taste; if (!H.ALL.includes(k)) H.ALL.push(k);
  CU.CLS[k] = [cls, tier, temp]; const it = Game.ITEMS[k], p = CU.profile(k); it.hp = p.hp; it.stam = p.stam; it.mind = p.mind; it.temp = p.temp; it.tier = p.tier;
  H.DISH[k].hp = p.hp; H.DISH[k].stam = p.stam; if (G.Surv && G.Surv.FOOD) G.Surv.FOOD[k] = Math.round(8 + p.tier * 9 + (p.hp + p.stam) * 0.08); }
const res0 = H.result;
H.result = function (pick) {
  const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null;
  const set = new Set(ks.map(k => H.KIND[k] === 'fish' ? FISH : k)), tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S();
  for (const k in NEW) { const ing = NEW[k][11], water = NEW[k][13];
    if (ing.length !== set.size || !ing.every(x => set.has(x))) continue; if (water && !(S.water > 0)) continue;
    return Object.assign({ out: k, n: serv + (NEW[k][14] || 0), pot: NEW[k][12] }, water ? { water: 1 } : {}); }
  return res0.apply(this, arguments);
};
})(window.G);
