/* 약속의 길 — 부엌 곳간 (v16.6): more ingredients, where they come from, and many more dishes.
   Ingredients: 마늘·부추·고수·박하 (green), 겨자씨·커민·소금 (spice), 석류·포도·건포도·참외 (fruit), 아몬드·피스타치오 (nut),
   병아리콩·잠두 (bean), 메추라기 고기 (fowl), 엉긴 젖 (curd).
   Sources: the city market sells spices, beans and dried fruit; trees and patches to forage (pomegranate, almond, pistachio, vine
   in Canaan; garlic, leek, coriander, mint by the Nile); partridges drop fowl; jars and boxes hold them too.
   Dishes: ~22 more, several with a verse behind them (raisin cakes 삼하 6:19, Jacob's gift 창 43:11, grape juice 창 40:11…). */
'use strict';
(function (G) {
const Game = G.Game, H = G.Hearth, EP = G.EP && G.EP.joseph; if (!H) return;
// ---------------------------------------------------------------- ingredients
const ING = {
  garlic: ['마늘', 'veg', '#efe6d6', 'green', 4], leek: ['부추', 'veg', '#6a9a3a', 'green', 4], coriander: ['고수', 'herb', '#5a8a3a', 'green', 3], mint: ['박하', 'herb', '#6ab06a', 'green', 3],
  mustard: ['겨자씨', 'seed', '#d8a830', 'spice', 5], cumin: ['커민', 'seed', '#a8783a', 'spice', 6], salt: ['소금', 'drop', '#f4f4f0', 'spice', 4],
  pomegranate: ['석류', 'berry', '#c0303a', 'fruit', 6, 30], grapes: ['포도', 'berry', '#6a3a8a', 'fruit', 5, 26], raisins: ['건포도', 'berry', '#5a2a3a', 'fruit', 6, 30], melon: ['참외', 'veg', '#e8d060', 'fruit', 7, 34],
  almond: ['아몬드', 'seed', '#c8a070', 'nut', 7, 20], pistachio: ['피스타치오', 'seed', '#9ab060', 'nut', 8, 20],
  chickpea: ['병아리콩', 'bean', '#e0c890', 'bean', 4], fava: ['잠두', 'bean', '#8aa05a', 'bean', 4], fowl: ['메추라기 고기', 'meat', '#c87a6a', 'meat', 8], curd: ['엉긴 젖', 'milk', '#f4f0e0', 'milk', 6, 30] };
for (const k in ING) { const [n, ic, c, kind, p, stam] = ING[k]; if (!Game.ITEMS[k]) Game.ITEMS[k] = Object.assign({ n, cat: kind === 'fruit' || stam ? 'food' : 'crop', p, ic, c }, stam ? { stam } : {}); H.KIND[k] = kind; }
if (G.Surv && G.Surv.FOOD) Object.assign(G.Surv.FOOD, { pomegranate: 12, grapes: 10, raisins: 14, melon: 16, almond: 8, pistachio: 8, curd: 14 });
// ---------------------------------------------------------------- dishes
const D = {
  spicedLentil: ['커민 렌틸 죽', 'bean', '#b05a2a', 70, 95, 'stew', '렌틸콩 + 커민 + 물', '', [0xb05a2a, 0xd8a050]],
  chickpeaStew: ['병아리콩 스튜', 'bean', '#d8b870', 65, 85, 'stew', '병아리콩 + 물 (+ 양파·마늘)', '', [0xd8b870, 0x6a9a3a]],
  ful: ['잠두 으깸 (풀 메담)', 'bean', '#8a7a3a', 60, 80, 'stew', '잠두 + 마늘이나 올리브', '애굽 사람들이 오래전부터 먹어 온 콩 요리예요', [0x8a7a3a, 0xc8b060]],
  hummus: ['병아리콩 으깸', 'bean', '#e0c890', 45, 70, 'bowl', '병아리콩 + 올리브 + 마늘', '', [0xe0c890, 0x8a9a3a]],
  leekSoup: ['부추 국', 'veg', '#6a9a3a', 40, 55, 'stew', '부추 + 물 (+ 곡식)', '애굽에서 먹던 부추 (민 11:5)', [0x8ab060, 0x5a8a3a]],
  garlicLamb: ['마늘 고기구이', 'meat', '#a8582a', 70, 105, 'grill', '고기 + 마늘', '', [0xa8582a, 0xefe6d6]],
  herbFish: ['고수 생선구이', 'fish', '#c8a050', 55, 80, 'grill', '생선 + 고수나 박하', '', [0xc89040, 0x5a8a3a]],
  fowlRoast: ['메추라기 구이', 'meat', '#c87a4a', 50, 85, 'grill', '메추라기 고기 (+ 약초)', '저녁에는 메추라기가 와서 진에 덮이고 (출 16:13)', [0xc87a4a, 0xa85a3a]],
  fowlStew: ['메추라기 보리죽', 'meat', '#c8a070', 65, 95, 'stew', '메추라기 고기 + 곡식 + 물', '', [0xd8b878, 0xc87a4a]],
  saltFish: ['소금 구운 생선', 'fish', '#e0d0b0', 50, 75, 'bake', '생선 + 소금', '', [0xe8e0d0, 0xc89040]],
  curd: null, // (an ingredient made from milk — see below)
  curdMint: ['박하 엉긴 젖', 'milk', '#eef4e8', 30, 70, 'bowl', '엉긴 젖 + 박하나 고수', '', [0xf4f0e0, 0x6ab06a]],
  pomSalad: ['석류 들나물 무침', 'berry', '#c0303a', 30, 55, 'bowl', '석류 + 약초나 고수', '', [0x6a9a4a, 0xc0303a]],
  mustardGreens: ['겨자 나물 무침', 'herb', '#7a9a3a', 30, 45, 'bowl', '겨자씨 + 나물', '겨자씨 한 알 (마 13:31)', [0x7a9a3a, 0xd8a830]],
  raisinCake: ['건포도 떡', 'bread', '#6a3a3a', 35, 120, 'bake', '건포도 + 곡식', '떡 한 덩이와 고기 한 조각과 건포도 떡 한 덩이씩 (삼하 6:19)', [0x8a5a3a, 0x5a2a3a]],
  almondCake: ['아몬드 꿀과자', 'bread', '#d8a860', 40, 130, 'bake', '아몬드 + 꿀 + 곡식', '', [0xd8a860, 0xc8a070]],
  roastNuts: ['볶은 견과', 'seed', '#b8905a', 20, 70, 'roast', '아몬드나 피스타치오', '', [0xc8a070, 0x9ab060]],
  jacobGift: ['야곱의 선물 꾸러미', 'seed', '#d8b050', 50, 150, 'bowl', '꿀 + 피스타치오 + 아몬드', '이 땅의 가장 좋은 소산 — 유향 조금, 꿀 조금, 향품, 몰약, 비자(피스타치오), 파단행(아몬드) (창 43:11)', [0xe8b040, 0x9ab060]],
  melonCool: ['시원한 참외', 'veg', '#e8d060', 25, 60, 'bowl', '참외', '애굽에서 먹던 참외 (민 11:5)', [0xe8d060, 0xf0e8b0]],
  grapeJuice: ['포도즙 한 잔', 'berry', '#6a3a8a', 20, 90, 'bowl', '포도 두 송이 이상', '포도를 따서 바로의 잔에 짜서 (창 40:11)', [0x6a2a5a, 0x8a4a9a]],
  garlicBread: ['마늘 납작빵', 'bread', '#e0b060', 35, 80, 'bake', '곡식 + 마늘', '', [0xe0b060, 0xefe6d6]],
  feast: ['잔치 상차림', 'bread', '#d8a050', 120, 180, 'bake', '고기 · 곡식 · 단것 · 채소 · 다섯 가지 이상', '살진 송아지를 잡고 즐기자 (눅 15:23)', [0xc8904a, 0xa8582a]] };
delete D.curd;
for (const k in D) { const [n, ic, c, hp, stam, m, how, ref, look] = D[k]; if (!Game.ITEMS[k]) Game.ITEMS[k] = { n, cat: 'food', p: Math.round((hp + stam) / 5), ic, c, hp, stam };
  H.DISH[k] = { n, ic, c, hp, stam, food: Math.round(stam * 0.4 + hp * 0.2), pot: m, how, ref }; H.METHOD[k] = m; H.LOOKS[k] = look; if (G.Surv && G.Surv.FOOD) G.Surv.FOOD[k] = H.DISH[k].food; if (!H.ALL.includes(k)) H.ALL.push(k); }
// curd: milk alone, set in a bowl (an ingredient, not a meal)
H.DISH.curd = { n: '엉긴 젖', how: '염소젖 두 개만', ref: '엉긴 젖과 우유와 송아지 요리 (창 18:8)', pot: 'bowl' }; H.METHOD.curd = 'bowl'; H.LOOKS.curd = [0xf4f0e0, 0xe8e0c8]; if (!H.ALL.includes('curd')) H.ALL.push('curd');
Object.assign(H.TASTE, { spicedLentil: '커민 향이 확 퍼진다!', ful: '애굽 사람들이 왜 이걸 좋아하는지 알겠어.', fowlRoast: '바삭하고 고소하다!', raisinCake: '달콤해서 힘이 솟아요!', jacobGift: '아버지가 형들 손에 들려 보내실 것 같은 맛이야…', grapeJuice: '술 맡은 관원장님이 이렇게 짜 드렸겠지?', feast: '잔칫날 같다! 다 같이 먹으면 좋겠다.', melonCool: '아삭하고 시원해!', curd: '부드럽게 엉겼다.' });
// recipes: checked before the old rules
const res0 = H.result;
H.result = function (pick) { const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null; const KIND = H.KIND, has = c => ks.some(k => KIND[k] === c), only = (...cs) => ks.every(k => cs.includes(KIND[k]));
  const tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S(), wet = S.water > 0, R0 = (out, pot, o) => Object.assign({ out, n: serv, pot }, o || {});
  const kinds = new Set(ks.map(k => KIND[k]));
  if (ks.length >= 5 && has('meat') && (has('grain') || has('bean')) && (has('sweet') || has('fruit'))) return R0('feast', 'bake', { n: serv + 1 });
  if (pick.honey && pick.pistachio && pick.almond) return R0('jacobGift', 'bowl');
  if (pick.lentil && pick.cumin && wet) return R0('spicedLentil', 'pot', { water: 1 });
  if (pick.fowl && has('grain') && wet) return R0('fowlStew', 'pot', { water: 1 });
  if (pick.chickpea && wet && !pick.olive && only('bean', 'green', 'spice')) return R0('chickpeaStew', 'pot', { water: 1 });
  if (pick.chickpea && pick.olive && pick.garlic) return R0('hummus', 'bowl');
  if (pick.fava && (pick.garlic || pick.olive)) return R0('ful', 'pot');
  if (pick.leek && wet && only('green', 'grain', 'spice')) return R0('leekSoup', 'pot', { water: 1 });
  if (has('meat') && pick.garlic && !pick.fowl && only('meat', 'green', 'spice')) return R0('garlicLamb', 'spit');
  if (pick.fowl && only('meat', 'green', 'spice')) return R0('fowlRoast', 'spit');
  if (has('fish') && (pick.coriander || pick.mint) && only('fish', 'green', 'spice')) return R0('herbFish', 'spit');
  if (has('fish') && pick.salt && only('fish', 'spice')) return R0('saltFish', 'stone');
  if (pick.curd && (pick.mint || pick.coriander)) return R0('curdMint', 'bowl');
  if ((pick.milk || 0) >= 2 && ks.length === 1) return R0('curd', 'bowl', { n: pick.milk });
  if (pick.pomegranate && has('green')) return R0('pomSalad', 'bowl');
  if (pick.mustard && has('green')) return R0('mustardGreens', 'bowl');
  if (pick.raisins && has('grain')) return R0('raisinCake', 'stone');
  if (pick.almond && pick.honey && has('grain')) return R0('almondCake', 'stone');
  if (only('nut')) return R0('roastNuts', 'stone');
  if (pick.melon && ks.length === 1) return R0('melonCool', 'bowl');
  if ((pick.grapes || 0) >= 2 && ks.length === 1) return R0('grapeJuice', 'bowl');
  if (has('grain') && pick.garlic && only('grain', 'green', 'spice')) return R0('garlicBread', 'stone');
  if (pick.grapes && ks.length === 1) return R0('raisins', 'stone'); // one bunch dried on the hot stone → raisins
  return res0.apply(this, arguments); };
H.METHOD.raisins = 'roast'; H.LOOKS.raisins = [0x5a2a3a, 0x6a3a5a];
// ---------------------------------------------------------------- where they come from
if (EP) {
  if (EP.shops && EP.shops.market) EP.shops.market.buy.push({ n: '소금 ×3', item: 'salt', qty: 3, price: 6 }, { n: '커민 ×3', item: 'cumin', qty: 3, price: 9 }, { n: '고수 ×3', item: 'coriander', qty: 3, price: 6 }, { n: '병아리콩 ×4', item: 'chickpea', qty: 4, price: 8 },
    { n: '잠두 ×4', item: 'fava', qty: 4, price: 8 }, { n: '마늘 ×3', item: 'garlic', qty: 3, price: 7 }, { n: '부추 ×3', item: 'leek', qty: 3, price: 6 }, { n: '건포도 ×3', item: 'raisins', qty: 3, price: 12 }, { n: '참외 ×1', item: 'melon', qty: 1, price: 8 }, { n: '겨자씨 ×3', item: 'mustard', qty: 3, price: 7 });
  const T = EP.lootTables; if (T) { T.egypt.push(['chickpea', 1, 3, 2], ['fava', 1, 3, 2], ['garlic', 1, 2, 2], ['leek', 1, 2, 2], ['salt', 1, 2, 1], ['cumin', 1, 2, 1], ['melon', 1, 1, 1]);
    T.nile.push(['coriander', 1, 2, 2], ['mint', 1, 2, 2], ['leek', 1, 2, 1]); T.canaan.push(['pomegranate', 1, 2, 2], ['grapes', 1, 2, 2], ['almond', 1, 3, 2], ['pistachio', 1, 3, 1], ['raisins', 1, 2, 1]);
    T.desert.push(['salt', 1, 2, 2], ['almond', 1, 2, 1]); T.treasure.push(['pistachio', 2, 4, 1], ['almond', 2, 4, 1], ['cumin', 1, 3, 1], ['raisins', 2, 4, 1]); }
  if (G.Combat && G.Combat.WILD.partridge) G.Combat.WILD.partridge.loot = Object.assign({}, G.Combat.WILD.partridge.loot, { fowl: 1 });
  // forage: fruit and nut trees in Canaan, herb and garden patches along the Nile
  const NODE = Game.NODE; Object.assign(NODE, {
    pomegranate: { n: '석류나무', env: 'fig', r: 1.0, tree: true, fruit: 'pomegranate', key: 'pomegranate' }, almondT: { n: '아몬드나무', env: 'olive', r: 1.0, tree: true, fruit: 'almond', key: 'almondT' },
    pistachioT: { n: '피스타치오나무', env: 'olive', r: 1.0, tree: true, fruit: 'pistachio', key: 'pistachioT' }, vine: { n: '포도덩굴', env: 'bush', r: 0.5, give: { grapes: 2 }, re: 3, label: '포도 따기', anim: 'pick', key: 'vine' },
    garlicP: { n: '마늘 밭', env: 'herbBush', r: 0, give: { garlic: 2 }, re: 3, label: '마늘 캐기', anim: 'gather', key: 'garlicP' }, leekP: { n: '부추 포기', env: 'herbBush', r: 0, give: { leek: 2 }, re: 2, label: '부추 뜯기', anim: 'gather', key: 'leekP' },
    corP: { n: '고수 덤불', env: 'herbBush', r: 0, give: { coriander: 2 }, re: 2, label: '고수 뜯기', anim: 'gather', key: 'corP' }, mintP: { n: '박하 덤불', env: 'herbBush', r: 0, give: { mint: 2 }, re: 2, label: '박하 뜯기', anim: 'gather', key: 'mintP' },
    melonP: { n: '참외 넝쿨', env: 'caperBush', r: 0.3, give: { melon: 1 }, re: 4, label: '참외 따기', anim: 'gather', key: 'melonP' } });
  const prevB = EP.build; EP.build = function (W, G2) { prevB(W, G2); if (!G.Wilds || !G.Wilds.scatter) return; const nx = z => -92 + 13 * Math.sin(z / 74) + 5 * Math.sin(z / 23 + 1);
    const zones = [{ x: 170, z: 120, r: 26, n: 10, types: [['pomegranate', 2], ['almondT', 2], ['pistachioT', 1], ['vine', 3]] }, { x: 190, z: 20, r: 24, n: 8, types: [['vine', 3], ['pomegranate', 2], ['almondT', 1]] }, { x: 175, z: -90, r: 22, n: 6, types: [['almondT', 2], ['pistachioT', 2], ['vine', 1]] }];
    for (const z of [-120, -40, 40, 120]) zones.push({ x: nx(z) + 16, z, r: 12, n: 6, types: [['garlicP', 2], ['leekP', 2], ['corP', 1], ['mintP', 1], ['melonP', 1]] }, { x: nx(z) - 16, z: z + 20, r: 12, n: 5, types: [['corP', 2], ['mintP', 2], ['melonP', 1]] });
    G.Wilds.scatter(W, zones, 6262); };
}
})(window.G);
