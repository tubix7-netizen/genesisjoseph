/* 약속의 길 — 즐길거리 (v17.0): more dishes, more side requests, and four little games woven into them.
   · 새 요리 17가지: only ingredients that already exist (pantry/hearth); each recipe is an exact set, so no older dish is shadowed.
   · 새 부탁 9가지 across the story (Canaan, Potiphar's house, the prison, the vizier years, Goshen). A request whose giver is not
     on the map right now is simply not offered (it follows the giver's own `show`).
   · 미니게임 (ui.js UI.minigame): 키질 rhythm · 기억놀이 memory · 물동이 balance · 열매 받기 catch. A request that is a game starts
     the game when you take it; if you fail or quit, talk to the giver again to retry. */
'use strict';
(function (G) {
const Game = G.Game, H = G.Hearth, CU = G.Cuisine, EP = G.EP && G.EP.joseph; if (!H || !CU || !EP) return;
const D = G.Delights = {};

// ------------------------------------------------------------------ dishes
// key: [name, icon, colour, method, class, tier, temp, recipe text, verse, look colours, taste line, ingredients (exact set), cook spot]
const FISH = '#fish';
const NEW = {
  garlicLeekCake: ['마늘 부추 전', 'bread', '#c8b060', 'bake', 'grain', 2, 'warm', '밀 + 마늘 + 부추', '', [0xd8c070, 0x6a9a3a], '고소한 냄새에 배가 꼬르륵!', ['wheat', 'garlic', 'leek'], 'stone'],
  corianderLentil: ['고수 렌틸 수프', 'bowl', '#a87838', 'stew', 'bean', 2, 'warm', '렌틸 + 고수 + 물', '', [0xa8783a, 0x5a8a3a], '향긋하고 뜨끈해.', ['lentil', 'coriander'], 'pot', 1],
  mustardLamb: ['겨자 마늘 고기찜', 'meat', '#a8602a', 'stew', 'meat', 3, 'warm', '고기 + 겨자씨 + 마늘 + 물', '', [0xa8582a, 0xd8a830], '알싸하고 깊은 맛이야. 힘이 솟는다!', ['meat', 'mustard', 'garlic'], 'pot', 1],
  pomFowl: ['석류 메추라기 구이', 'meat', '#b04a3a', 'grill', 'meat', 3, 'warm', '메추라기 고기 + 석류', '', [0xc0603a, 0xc0303a], '새콤한 즙이 고기에 배었어!', ['fowl', 'pomegranate'], 'spit'],
  garlicFish: ['마늘 소금 생선구이', 'fish', '#c8a060', 'grill', 'fish', 2, 'warm', '생선 + 마늘 + 소금', '', [0xc8a050, 0xefe6d6], '겉은 바삭, 속은 촉촉!', [FISH, 'garlic', 'salt'], 'spit'],
  figAlmond: ['무화과 아몬드 과자', 'cake', '#a86a4a', 'bake', 'sweet', 2, '', '무화과 + 아몬드', '', [0x8a4a3a, 0xc8a070], '쫀득하고 고소해.', ['fig', 'almond'], 'stone'],
  pistaHoney: ['피스타치오 꿀 과자', 'cake', '#b8b050', 'bake', 'sweet', 3, '', '밀 + 피스타치오 + 꿀', '', [0xd8c070, 0x9ab060], '바삭 달콤… 손이 멈추지 않아!', ['wheat', 'pistachio', 'honey'], 'stone'],
  cheeseFigBread: ['치즈 무화과 빵', 'bread', '#d8b878', 'bake', 'mixed', 3, 'warm', '밀 + 치즈 + 무화과', '', [0xe0c080, 0x8a4a3a], '짭짤 달콤, 든든한 한 끼야.', ['wheat', 'cheese', 'fig'], 'stone'],
  chickpeaHerb: ['고수 병아리콩 볶음', 'bean', '#c8b070', 'bake', 'bean', 2, 'warm', '병아리콩 + 고수 + 올리브', '', [0xe0c890, 0x5a8a3a], '톡톡 터지는 콩이 고소해.', ['chickpea', 'coriander', 'olive'], 'stone'],
  favaMint: ['박하 잠두 샐러드', 'veg', '#8ab060', 'bowl', 'veg', 2, 'cool', '잠두 + 박하 + 올리브', '', [0x8aa05a, 0x6ab06a], '상큼해서 기분이 좋아져.', ['fava', 'mint', 'olive'], 'bowl'],
  grapeCurd: ['포도 엉긴 젖', 'milk', '#c8a8d0', 'bowl', 'milk', 2, 'cool', '엉긴 젖 + 포도', '', [0xf4f0e0, 0x6a3a8a], '부드럽고 새콤달콤해.', ['curd', 'grapes'], 'bowl'],
  raisinPorridge: ['건포도 보리 젖죽', 'bowl', '#e0d0b0', 'stew', 'grain', 3, 'warm', '보리 + 건포도 + 염소젖', '', [0xefe6cc, 0x5a2a3a], '달큰한 죽이 속을 데워 줘.', ['barley', 'raisins', 'milk'], 'pot'],
  melonCuc: ['참외 오이 냉채', 'veg', '#d8e090', 'bowl', 'veg', 2, 'cool', '참외 + 오이 + 소금', '', [0xf0e090, 0x6a9a4a], '아삭하고 시원해! 더위가 날아가.', ['melon', 'cucumber', 'salt'], 'bowl'],
  carobMilk: ['쥐엄 열매 젖', 'milk', '#8a6040', 'bowl', 'drink', 2, 'cool', '쥐엄 열매 + 염소젖', '돼지 먹는 쥐엄 열매로 배를 채우고자 하되 (눅 15:16)', [0xc8a080, 0x6a4020], '달콤하고 진해.', ['carob', 'milk'], 'bowl'],
  lentilRice: ['렌틸 양파 보리밥', 'bowl', '#a88850', 'stew', 'bean', 3, 'warm', '렌틸 + 양파 + 보리 + 물', '', [0xa8885a, 0xd8a050], '양파 향이 달큰하고 배가 든든해.', ['lentil', 'onion', 'barley'], 'pot', 1],
  dateNutBar: ['대추야자 견과 떡', 'cake', '#8a5a3a', 'bowl', 'sweet', 3, '', '대추야자 + 아몬드 + 피스타치오', '', [0x8a4a2a, 0xc8a070], '길 떠날 때 품에 넣기 좋겠다.', ['dates', 'almond', 'pistachio'], 'bowl'],
  travelPack: ['나그네 도시락', 'bread', '#c8a070', 'bowl', 'mixed', 4, '', '치즈 + 올리브 + 대추야자 + 건포도', '', [0xc8a060, 0xf4f0e0], '먼 길도 거뜬하겠어!', ['cheese', 'olive', 'dates', 'raisins'], 'bowl'],
};
D.NEW = NEW;
for (const k in NEW) { const [n, ic, c, m, cls, tier, temp, how, ref, look, taste] = NEW[k];
  Game.ITEMS[k] = Game.ITEMS[k] || { n, cat: 'food', p: 8 + tier * 5, ic, c };
  H.DISH[k] = { n, ic, c, pot: m, how, ref, food: 30 }; H.METHOD[k] = m; H.LOOKS[k] = look; H.TASTE[k] = taste; if (!H.ALL.includes(k)) H.ALL.push(k);
  if (CU.CLS) { CU.CLS[k] = [cls, tier, temp]; const it = Game.ITEMS[k], p = CU.profile(k); it.hp = p.hp; it.stam = p.stam; it.mind = p.mind; it.temp = p.temp; it.tier = p.tier;
    H.DISH[k].hp = p.hp; H.DISH[k].stam = p.stam; if (G.Surv && G.Surv.FOOD) G.Surv.FOOD[k] = Math.round(8 + p.tier * 9 + (p.hp + p.stam) * 0.08); } }
// recipes: the picked ingredients must be exactly this set (any fish counts as #fish; counts above one are fine)
const res0 = H.result;
H.result = function (pick) {
  const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null;
  const tag = k => H.KIND[k] === 'fish' ? FISH : k, set = new Set(ks.map(tag)), tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S();
  for (const k in NEW) { const ing = NEW[k][11], spot = NEW[k][12], water = NEW[k][13];
    if (ing.length !== set.size || !ing.every(x => set.has(x))) continue; if (water && !(S.water > 0)) continue;
    return Object.assign({ out: k, n: serv + (NEW[k][5] >= 4 ? 1 : 0), pot: spot }, water ? { water: 1 } : {}); }
  return res0.apply(this, arguments);
};

// ------------------------------------------------------------------ side requests (some are little games)
const S0 = () => Game.S();
const shown = id => S => { const d = EP.npcs.find(n => n.id === id); return !!d && (!d.show || !!d.show(S, Game)) && !S.q.empty; };
const RT = D.RT = { pend: null };
const game = (key, kind, opt) => ({ kind, opt, key });
// queue a game to start as soon as the dialogue closes
D.play = function (g) { RT.pend = g; };
D.tick = function () { const p = RT.pend; if (!p || G.UI.busy() || (G.Cine && G.Cine.on)) return; RT.pend = null; const S = S0();
  G.UI.minigame(p.kind, p.opt, ok => { if (ok) { S.q[p.key] = 1; G.UI.toast('해냈어요! · 부탁한 사람에게 가서 알려요'); G.Audio && G.Audio.sfx('quest'); }
    else G.UI.toast('아쉬워요 · 부탁한 사람에게 다시 말을 걸면 또 해 볼 수 있어요'); G.UI.quest(); }); };
const gameQ = (giver, title, when, offer, objT, g, reward, done, extra) => Object.assign({ giver, title, when, repeat: 2, offer,
  obj: [{ t: objT, ok: S => !!S.q[g.key] }],
  start(S) { S.q[g.key] = 0; D.play(g); },
  prog: S => { if (!S.q[g.key]) { D.play(g); return '자, 다시 한번 해 보자!'; } return '다 했다고? 어서 보여 다오!'; },
  done, reward }, extra || {});
const dishQ = (giver, title, when, offer, dish, n, reward, done) => ({ giver, title, when, repeat: 3, offer,
  obj: [{ t: S => `${Game.ITEMS[dish].n} ${Math.min(n, Game.inv(dish))}/${n} (요리: ${NEW[dish][7]})`, ok: () => Game.have(dish, n) }],
  take: { [dish]: n }, prog: `${Game.ITEMS[dish].n}… 만드는 법은 「${NEW[dish][7]}」이란다.`, done, reward });
const MEM_HOUSE = ['wheat', 'barley', 'oil', 'wine', 'cloth', 'flax', 'honey', 'dates', 'fig', 'onion', 'garlic', 'cumin'].filter(k => Game.ITEMS[k]);
const MEM_CELL = ['bread', 'fig', 'stone', 'branch', 'herb', 'water', 'reed', 'clay', 'olive'].filter(k => Game.ITEMS[k]);
const goshen = S => !!S.q.goshen && shown('simeon')(S);
const Q = {
  d_winnow: gameQ('leah', '레아의 키질', shown('leah'),
    ['요셉아, 타작한 보리를 키질해야 하는데 내 팔이 영 시원찮구나. 바람 불 때 리듬 맞춰 털어 줄 수 있겠니?'], '보리 키질하기 (리듬에 맞춰)',
    game('dWin', 'rhythm', { title: '보리 키질하기', hint: '동그라미가 금에 닿을 때 「털기」! 쭉정이는 바람에 날아가요. 10번 맞히면 돼요.', need: 10, beats: 16, gap: 0.75, btn: '털기' }),
    { silver: 6, items: { bread: 2, barley: 2 }, xp: 14 }, ['어머나, 알곡만 소복이 남았네! 우리 요셉이 손이 야무지구나.']),
  d_lentil: dishQ('jacob', '아버지의 고수 렌틸 수프', shown('jacob'),
    ['요셉아, 네 어미 라헬이 끓여 주던 렌틸 수프가 생각나는구나. 고수를 넣어 향긋했지… 한 그릇 만들어 줄 수 있겠느냐?'], 'corianderLentil', 1,
    { silver: 8, items: { cheese: 1 }, xp: 18 }, ['…그래, 바로 이 맛이다. 라헬이 살아 있는 것 같구나. 고맙다, 내 아들아.']),
  d_garden: gameQ('gardener', '정원사의 물동이', shown('gardener'),
    ['젊은이, 연못에서 대추야자 밭까지 물동이를 이고 가야 하는데 허리가 말을 안 듣네. 한 번만 날라 주겠나? 흘리면 안 되네!'], '물동이 이고 정원까지 가기',
    game('dGarden', 'balance', { title: '물동이 이고 가기', dur: 13 }), { silver: 8, items: { dates: 2 }, xp: 14 }, ['한 방울도 안 흘렸구먼! 종려나무가 고맙다고 하겠네.']),
  d_store: gameQ('scribe', '서기관의 창고 목록', shown('scribe'),
    ['창고 목록을 확인해야 하는데 눈이 침침하오. 내가 물건들을 보여 줄 테니, 잘 기억했다가 골라 내 보시오.'], '창고 물건 기억해서 골라내기',
    game('dStore', 'memory', { title: '창고 목록 외우기', pool: MEM_HOUSE, n: 5, grid: 9, show: 4 }), { silver: 10, xp: 18 }, ['허, 하나도 틀리지 않았구려! 주인께서 그대를 아끼시는 이유를 알겠소.']),
  d_cook: dishQ('cook', '요리사의 시험', shown('cook'),
    ['타! 히브리 젊은이, 생선은 구울 줄 아나? 마늘 다지고 소금 뿌려 바삭하게 구워 오면 내 비법 하나 알려 주지!'], 'garlicFish', 1,
    { silver: 12, items: { cumin: 2, coriander: 2 }, xp: 20 }, ['오호! 겉은 바삭, 속은 촉촉… 자네 손맛이 있구먼! 자, 커민이랑 고수 가져가게. 이걸로 뭘 만들지는 자네 몫이야.']),
  d_cell: gameQ('youngP', '감옥 동무와 기억놀이', shown('youngP'),
    ['형, 너무 심심해요… 내가 물건을 늘어놓을 테니까 기억했다가 맞혀 봐요! 형이 이기면 내 무화과 줄게요.'], '감옥 동무와 기억놀이 하기',
    game('dCell', 'memory', { title: '감옥 기억놀이', hint: '동무가 늘어놓은 물건을 잘 봐요!', pool: MEM_CELL, n: 4, grid: 9, show: 3.4 }), { items: { fig: 2 }, xp: 12 }, ['우와, 형 진짜 잘한다! 약속대로 무화과 줄게요. …형이랑 있으면 여기도 덜 무서워요.']),
  d_brick: gameQ('brick', '벽돌 나르기', shown('brick'),
    ['총리 나으리께서 직접요? 하하, 그럼 마른 벽돌 한 짐만 창고까지 날라 주십시오. 기울면 와르르 무너집니다!'], '벽돌 짐 균형 잡아 나르기',
    game('dBrick', 'balance', { title: '벽돌 짐 나르기', hint: '벽돌 짐이 기울지 않게 ◀ ▶ 로 균형을 잡아요.', dur: 15 }), { silver: 14, items: { clay: 2, straw: 2 }, xp: 20 }, ['나으리 덕에 오늘 일이 일찍 끝났습니다! 이 벽돌로 곡식 창고를 더 짓겠습니다.']),
  d_figs: gameQ('simeon', '시므온과 무화과 떨기', goshen,
    ['요셉, 고센 무화과가 아주 탐스럽게 익었다. 내가 나무를 흔들 테니 너는 바구니로 받아라. 돌멩이는 피하고!'], '떨어지는 무화과 바구니로 받기',
    game('dFigs', 'catch', { title: '무화과 받기', item: 'fig', need: 10, dur: 32 }), { items: { fig: 4, figAlmond: 1 }, heart: 1, xp: 14 }, ['하하, 바구니가 가득하구나! …옛날엔 너랑 이렇게 웃어 본 적이 없었지. 이제라도 다행이다.']),
  d_pack: dishQ('asher', '아셀의 나그네 도시락', goshen,
    ['요셉, 내일 가나안 쪽으로 양을 몰고 가야 한다. 나그네 도시락 하나 싸 줄 수 있겠느냐? 치즈, 올리브, 대추야자, 건포도면 된다.'], 'travelPack', 1,
    { silver: 10, items: { wool: 2 }, heart: 1, xp: 18 }, ['든든하구나! 이걸 먹으며 아버지 계신 이곳을 떠올리겠다.']),
};
for (const k in Q) if (!EP.quests[k]) EP.quests[k] = Q[k];
D.Q = Q;

// per-frame: start a queued game when the screen is free
const upd0 = EP.update; EP.update = function (S, Gm, dt, t) { const r = upd0 ? upd0.apply(this, arguments) : undefined; D.tick(); return r; };
})(window.G);
