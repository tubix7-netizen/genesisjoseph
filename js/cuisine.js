/* 약속의 길 — 음식의 맛과 힘 (v16.9)
   Every food now gives what its kind would really give, instead of "stamina full / health a little":
   · 고기·생선 → mostly 체력; the more it is cooked up (spices, a sauce, a stew) the more 기력 and 정신력 on top.
   · 곡식·빵 → mostly 기력; a hearty dish (a stew, a pie, bread with cheese) adds 체력 or 정신력.
   · 채소·과일·나물 → mostly 정신력. 마실 것 (juice, milk, tea, cool water) → 정신력 and always 기력 too.
   · 단것 → 기력 and 정신력. 콩 → 체력 and 기력. 잔칫상 → everything.
   · How much depends on how hard the dish is (tier 1 one ingredient … tier 4 a feast of five or more), and the harder dishes
     also raise a maximum a little (최대 체력 / 기력 / 정신력, a few times per dish).
   · 따뜻한 요리 (stews, soups, grills, tea) keep the cold off for 4 min; 시원한 음식 (juice, salads, melon, curd) keep the
     Egyptian midday heat off for 4 min.
   · More recipes (19 new), and the cooking scenes get a seasoning step for harder dishes, a random little happening
     (a spark, smoke in the eyes, a toss in the air, humming, a perfect bake…) and more camera angles. */
'use strict';
(function (G) {
const Game = G.Game, H = G.Hearth; if (!H) return;
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), PI = Math.PI;
const CU = G.Cuisine = {};

// ------------------------------------------------------------------ new dishes
// key: [name, icon, colour, method, class, tier, temp, recipe text, verse, look colours, taste line]
const NEW = {
  mintTea: ['박하 차', 'drop', '#9ac080', 'stew', 'drink', 1, 'warm', '박하 + 물', '', [0xa8c890, 0x6ab06a], '향긋하다… 머리가 맑아져.'],
  mintWater: ['박하 오이 냉수', 'drop', '#c8e8d8', 'bowl', 'drink', 2, 'cool', '박하 + 오이 + 물', '', [0xd8f0e8, 0x6ab06a], '아, 시원하다! 더위가 싹 가셔.'],
  pomJuice: ['석류즙', 'berry', '#c0303a', 'bowl', 'drink', 2, 'cool', '석류 두 개', '석류즙으로 빚은 향기로운 술 (아 8:2)', [0xb02a3a, 0xe05060], '새콤달콤… 정신이 번쩍 들어!'],
  melonMint: ['참외 박하 화채', 'veg', '#e8d878', 'bowl', 'drink', 2, 'cool', '참외 + 박하', '', [0xf0e090, 0x6ab06a], '시원하고 달다! 한 그릇 더…'],
  dateMilk: ['대추야자 젖', 'milk', '#e8d0a0', 'bowl', 'drink', 2, 'cool', '염소젖 + 대추야자', '', [0xf0e4c8, 0x8a4a2a], '달큰하고 부드러워.'],
  honeyCurd: ['꿀 엉긴 젖', 'milk', '#f4e8b0', 'bowl', 'milk', 2, 'cool', '엉긴 젖 + 꿀', '그가 악을 버리며 선을 택할 줄 알 때에 엉긴 젖과 꿀을 먹을 것이라 (사 7:15)', [0xf6f0e0, 0xe8b040], '입안이 사르르 녹아.'],
  cucCurd: ['오이 엉긴 젖 냉채', 'veg', '#d8ecd0', 'bowl', 'veg', 2, 'cool', '오이 + 엉긴 젖', '', [0xf0f4e8, 0x6a9a4a], '아삭아삭 시원해!'],
  fruitPlate: ['포도 석류 과일 접시', 'berry', '#8a3a6a', 'bowl', 'veg', 2, 'cool', '포도 + 석류 (+ 참외)', '', [0x6a3a8a, 0xc0303a], '과일이 달아서 기분이 좋아져.'],
  olivePickle: ['소금 올리브 절임', 'veg', '#6a7a3a', 'bowl', 'veg', 1, '', '올리브 두 개 + 소금', '', [0x5a6a2a, 0xf4f4f0], '짭짤하니 입맛이 돈다.'],
  eggLeek: ['부추 새알 지짐', 'veg', '#d8c860', 'bake', 'mixed', 2, 'warm', '새알 + 부추', '', [0xe8d070, 0x6a9a3a], '부추 향이 확 올라와!'],
  caperFish: ['케이퍼 생선구이', 'fish', '#c8a050', 'grill', 'fish', 2, 'warm', '생선 + 케이퍼', '', [0xc89040, 0x5a7a3a], '톡 쏘는 맛이 생선이랑 잘 어울려.'],
  barleyLoaf: ['보리떡', 'bread', '#c8a060', 'bake', 'grain', 1, 'warm', '보리 두 개 + 소금', '여기 한 아이가 보리떡 다섯 개와 물고기 두 마리를 가지고 있나이다 (요 6:9)', [0xc8a060, 0xa88040], '거칠어도 든든하다.'],
  unleavened: ['무교병', 'bread', '#ecd8a8', 'bake', 'grain', 2, 'warm', '밀 + 올리브 + 소금', '그 밤에 그 고기를 불에 구워 무교병과 쓴 나물과 아울러 먹되 (출 12:8)', [0xf0e0b0, 0xc8a060], '바삭하고 담백해.'],
  fowlDates: ['대추야자 메추라기 구이', 'meat', '#b8602a', 'grill', 'meat', 3, 'warm', '메추라기 고기 + 대추야자', '', [0xc87a4a, 0x8a4a2a], '달콤한 육즙이… 최고야!'],
  cuminKebab: ['커민 양파 꼬치', 'meat', '#a8502a', 'grill', 'meat', 3, 'warm', '고기 + 양파 + 커민', '', [0xa8502a, 0xd8a050], '향신료 냄새에 힘이 솟아!'],
  fishLeek: ['부추 생선 찜', 'fish', '#c8b880', 'stew', 'fish', 3, 'warm', '생선 + 부추 + 물', '', [0xe0d0a0, 0x6a9a3a], '살이 부드럽게 풀어진다.'],
  spicedFava: ['커민 잠두 스튜', 'bean', '#8a7030', 'stew', 'bean', 3, 'warm', '잠두 + 커민 + 물', '', [0x8a7a3a, 0xa8783a], '뜨끈하고 구수하다.'],
  nutPorridge: ['견과 젖 보리죽', 'bowl', '#e8dcc0', 'stew', 'grain', 3, 'warm', '곡식 + 염소젖 + 아몬드나 피스타치오', '', [0xefe6cc, 0xc8a070], '고소한 죽이 속을 꽉 채워.'],
  ezekielBread: ['에스겔의 떡', 'bread', '#b8905a', 'bake', 'grain', 3, 'warm', '밀 + 보리 + 콩 + 렌틸', '너는 밀과 보리와 콩과 팥과 조와 귀리를 가져다가 떡을 만들어 먹되 (겔 4:9)', [0xb8905a, 0x8a6a3a], '씹을수록 고소하고 힘이 난다.'],
  passover: ['구운 고기와 무교병 상', 'meat', '#a86a3a', 'bake', 'mixed', 4, 'warm', '고기 + 밀 + 약초 + 소금', '그 밤에 그 고기를 불에 구워 무교병과 쓴 나물과 아울러 먹되 (출 12:8)', [0xa8582a, 0xf0e0b0], '하나님이 우리를 이끄시는 밤의 맛이야…'],
  royalFeast: ['바로의 잔칫상', 'bread', '#e0a040', 'bake', 'mixed', 4, 'warm', '고기 + 메추라기 + 생선 + 곡식 + 과일 + 단것', '베냐민의 몫은 다른 사람보다 다섯 배나 되더라 (창 43:34)', [0xd89a3a, 0xc0303a], '이런 잔치는 처음이야! 온몸에 힘이 넘쳐!'] };
for (const k in NEW) { const [n, ic, c, m, , , , how, ref, look, taste] = NEW[k];
  Game.ITEMS[k] = Game.ITEMS[k] || { n, cat: 'food', p: 10, ic, c };
  H.DISH[k] = { n, ic, c, pot: m, how, ref, food: 30 }; H.METHOD[k] = m; H.LOOKS[k] = look; H.TASTE[k] = taste; if (!H.ALL.includes(k)) H.ALL.push(k); }
const res0 = H.result;
H.result = function (pick) { const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null; const KIND = H.KIND, has = c => ks.some(k => KIND[k] === c), only = (...cs) => ks.every(k => cs.includes(KIND[k])), just = (...a) => ks.length === a.length && a.every(x => pick[x]);
  const tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S(), wet = S.water > 0, R0 = (out, pot, o) => Object.assign({ out, n: serv, pot }, o || {});
  if (pick.meat && pick.fowl && has('fish') && has('grain') && has('fruit') && has('sweet')) return R0('royalFeast', 'bake', { n: serv + 2 });
  if (pick.meat && pick.wheat && pick.herb && pick.salt) return R0('passover', 'bake', { n: serv + 1 });
  if (pick.wheat && pick.barley && (pick.fava || pick.chickpea) && pick.lentil) return R0('ezekielBread', 'stone');
  if (has('grain') && pick.milk && has('nut')) return R0('nutPorridge', 'pot');
  if (pick.fava && pick.cumin && wet) return R0('spicedFava', 'pot', { water: 1 });
  if (has('fish') && pick.leek && wet) return R0('fishLeek', 'pot', { water: 1 });
  if (pick.meat && pick.onion && pick.cumin && only('meat', 'green', 'spice')) return R0('cuminKebab', 'spit');
  if (pick.fowl && pick.dates) return R0('fowlDates', 'spit');
  if (pick.wheat && pick.olive && pick.salt && only('grain', 'green', 'spice')) return R0('unleavened', 'stone');
  if ((pick.barley || 0) >= 2 && pick.salt && only('grain', 'spice')) return R0('barleyLoaf', 'stone');
  if (has('fish') && pick.caper && only('fish', 'green', 'spice')) return R0('caperFish', 'spit');
  if (pick.egg && pick.leek && only('egg', 'green', 'spice')) return R0('eggLeek', 'stone');
  if ((pick.olive || 0) >= 2 && pick.salt && only('green', 'spice')) return R0('olivePickle', 'bowl');
  if (pick.grapes && pick.pomegranate && only('fruit')) return R0('fruitPlate', 'bowl');
  if (pick.cucumber && pick.curd && only('green', 'milk')) return R0('cucCurd', 'bowl');
  if (pick.curd && pick.honey && only('milk', 'sweet')) return R0('honeyCurd', 'bowl');
  if (pick.milk && pick.dates && !pick.honey && only('milk', 'sweet')) return R0('dateMilk', 'bowl');
  if (pick.melon && pick.mint && only('fruit', 'green')) return R0('melonMint', 'bowl');
  if ((pick.pomegranate || 0) >= 2 && ks.length === 1) return R0('pomJuice', 'bowl');
  if (pick.mint && pick.cucumber && wet && only('green')) return R0('mintWater', 'bowl', { water: 1 });
  if (pick.mint && wet && ks.length === 1) return R0('mintTea', 'pot', { water: 1 });
  return res0.apply(this, arguments); };

// ------------------------------------------------------------------ the class, tier and temperature of every food
const CLS = { // the older dishes: class, tier, temp
  lentilStew: ['bean', 2, 'warm'], fishStew: ['fish', 3, 'warm'], fishHoney: ['fish', 2, 'warm'], honeyMeat: ['meat', 3, 'warm'], flatbread: ['grain', 2, 'warm'], parched: ['grain', 1, ''],
  porridge: ['grain', 2, 'warm'], milkHoney: ['drink', 2, 'cool'], figCake: ['sweet', 2, ''], figCheese: ['milk', 2, 'cool'], eggHerb: ['mixed', 2, 'warm'], cucSalad: ['veg', 2, 'cool'], shepherd: ['grain', 3, 'warm'],
  meatStew: ['meat', 3, 'warm'], skewer: ['meat', 1, 'warm'], grilledFish: ['fish', 1, 'warm'], roastEgg: ['mixed', 1, 'warm'], sweetCake: ['sweet', 2, 'warm'], herbMix: ['veg', 1, 'warm'], fieldPlate: ['mixed', 2, 'warm'],
  spicedLentil: ['bean', 3, 'warm'], chickpeaStew: ['bean', 2, 'warm'], ful: ['bean', 2, 'warm'], hummus: ['bean', 3, 'cool'], leekSoup: ['veg', 2, 'warm'], garlicLamb: ['meat', 2, 'warm'], herbFish: ['fish', 2, 'warm'],
  fowlRoast: ['meat', 2, 'warm'], fowlStew: ['meat', 3, 'warm'], saltFish: ['fish', 2, 'warm'], curdMint: ['milk', 2, 'cool'], pomSalad: ['veg', 2, 'cool'], mustardGreens: ['veg', 2, ''], raisinCake: ['sweet', 2, ''],
  almondCake: ['sweet', 3, ''], roastNuts: ['sweet', 1, ''], jacobGift: ['sweet', 4, ''], melonCool: ['drink', 1, 'cool'], grapeJuice: ['drink', 2, 'cool'], garlicBread: ['grain', 2, 'warm'], feast: ['mixed', 4, 'warm'],
  curd: ['milk', 1, 'cool'], raisins: ['sweet', 1, ''],
  // plain things
  bread: ['grain', 1, ''], stew: ['bean', 2, 'warm'], fig: ['sweet', 1, ''], dates: ['sweet', 1, ''], honey: ['sweet', 1, ''], carob: ['sweet', 1, ''], milk: ['drink', 1, 'cool'], cheese: ['milk', 1, ''],
  olive: ['veg', 1, ''], cucumber: ['veg', 1, 'cool'], onion: ['veg', 1, ''], herb: ['veg', 1, ''], caper: ['veg', 1, ''], melon: ['drink', 1, 'cool'], grapes: ['drink', 1, 'cool'], pomegranate: ['veg', 1, 'cool'],
  almond: ['sweet', 1, ''], pistachio: ['sweet', 1, ''], egg: ['mixed', 1, ''] };
for (const k in NEW) CLS[k] = [NEW[k][4], NEW[k][5], NEW[k][6]];
CU.CLS = CLS; // v17.0: delights.js registers more dishes here
// share of the points: [체력, 기력, 정신력]
const SHARE = { meat: [0.62, 0.22, 0.16], fish: [0.55, 0.2, 0.25], grain: [0.2, 0.65, 0.15], bean: [0.42, 0.4, 0.18], veg: [0.2, 0.18, 0.62], drink: [0.08, 0.42, 0.5],
  sweet: [0.1, 0.5, 0.4], milk: [0.25, 0.35, 0.4], mixed: [0.34, 0.33, 0.33] };
const BUDGET = [0, 36, 70, 108, 160]; // points by tier
const MAXUP = { 3: 1, 4: 2 }; // how much a hard dish raises a maximum (up to 3 times each)
CU.profile = function (k) { const c = CLS[k]; if (!c) { const it = Game.ITEMS[k]; return it ? { hp: it.hp || 0, stam: it.stam || 0, mind: 0, tier: 1, cls: 'mixed', temp: '' } : null; }
  let [cls, tier, temp] = c; const sh = SHARE[cls] || SHARE.mixed, B = BUDGET[tier] || 36, M = H.METHOD[k];
  let hp = B * sh[0], stam = B * sh[1], mind = B * sh[2];
  if (M === 'stew' && (cls === 'grain' || cls === 'bean' || cls === 'veg')) hp += B * 0.15; // a hearty pot fills the body too
  if (tier >= 3 && (cls === 'meat' || cls === 'fish')) { stam += B * 0.12; mind += B * 0.08; } // well-cooked meat: more than just the meat
  if (cls === 'drink') stam = Math.max(stam, 20); // a drink always brings your breath back a little
  const pr = sh.indexOf(Math.max(...sh)), stat = ['hp', 'stam', 'mind'][pr];
  return { hp: Math.round(hp), stam: Math.round(stam), mind: Math.round(mind), tier, cls, temp, max: MAXUP[tier] ? { [cls === 'mixed' ? 'all' : stat]: MAXUP[tier] } : null }; };
// item table: what the bag shows
for (const k in CLS) { const it = Game.ITEMS[k]; if (!it) continue; const p = CU.profile(k); it.hp = p.hp; it.stam = p.stam; it.mind = p.mind; it.temp = p.temp; it.tier = p.tier;
  if (H.DISH[k]) { H.DISH[k].hp = p.hp; H.DISH[k].stam = p.stam; } if (G.Surv && G.Surv.FOOD) G.Surv.FOOD[k] = Math.max(G.Surv.FOOD[k] || 0, Math.round(8 + p.tier * 9 + (p.hp + p.stam) * 0.08)); }
CU.line = function (k) { const p = CU.profile(k); if (!p) return ''; const a = [];
  if (p.hp) a.push(`체력 +${p.hp}`); if (p.stam) a.push(`기력 +${p.stam}`); if (p.mind) a.push(`정신력 +${p.mind}`);
  if (p.max) { const s = Object.keys(p.max)[0]; a.push(`${s === 'all' ? '모든 최대치' : s === 'hp' ? '최대 체력' : s === 'stam' ? '최대 기력' : '최대 정신력'} +${p.max[s]}`); }
  if (p.temp === 'warm') a.push('따뜻함 4분'); else if (p.temp === 'cool') a.push('시원함 4분'); return a.join(' · '); };

// ------------------------------------------------------------------ eating
const eat0 = Game.eat;
Game.eat = function (k) { const S = Game.S(), P = Game.P, Hh = S && S.hero, before = Game.inv(k), st0 = P.stam, p = CU.profile(k);
  const r = eat0.apply(this, arguments); if (!p || Game.inv(k) >= before || !Hh) return r;
  const V = G.Vitals, cap = V && V.stamCap ? V.stamCap() : (Hh.stamMax || 100); P.stam = Math.min(Math.max(cap, st0), st0 + p.stam); if (P.stam > 15) P.exhausted = false; // the base eat filled stamina up; give back only this food's share
  if (p.mind && V && V.mindGain) V.mindGain(p.mind);
  const got = [];
  if (p.max) { const f = S.flags.maxUp = S.flags.maxUp || {}; if ((f[k] || 0) < 3) { f[k] = (f[k] || 0) + 1; const s = Object.keys(p.max)[0], n = p.max[s];
    if (s === 'hp' || s === 'all') { Hh.hpMax += n; Hh.hp += n; got.push(`최대 체력 +${n}`); } if (s === 'stam' || s === 'all') { Hh.stamMax = (Hh.stamMax || 100) + n; got.push(`최대 기력 +${n}`); }
    if (s === 'mind' || s === 'all') { Hh.mindMax = (Hh.mindMax || 100) + n; Hh.mind = Math.min(Hh.mindMax, (Hh.mind || 0) + n); got.push(`최대 정신력 +${n}`); } } }
  const C = G.Climate; if (C) { if (p.temp === 'warm' && C.warm) { C.warm(240); got.push('몸이 따뜻해요'); } else if (p.temp === 'cool' && C.cool) { C.cool(240); got.push('더위가 가셔요'); } }
  G.Combat && (G.Combat.hpDirty = 1);
  G.UI.toast(`${Game.ITEMS[k].n} · ${[p.hp ? `체력+${p.hp}` : '', p.stam ? `기력+${p.stam}` : '', p.mind ? `정신력+${p.mind}` : ''].filter(Boolean).join(' ')}${got.length ? ' · ' + got.slice(0, 2).join(' ') : ''}`, true); G.UI.hud(); return r; };
// the cooking cloth shows the new line
const draw0 = H.draw; H.draw = function () { draw0.apply(this, arguments); const r = H.result(H.pick), el = document.querySelector('#cookOut span'); if (r && el) el.textContent = CU.line(r.out) + (r.water ? ' · 물 한 번 사용' : ''); };

// ------------------------------------------------------------------ livelier cooking scenes
const SEASON = { stew: '소금 한 꼬집, 향신료를 솔솔… 휘휘 저어요', grill: '불 쪽으로 기름을 똑똑 떨어뜨려 향을 입혀요', bake: '반죽을 손바닥으로 탁탁 펴서 모양을 내요', roast: '알곡을 손으로 휘휘 섞어요', bowl: '마지막으로 고명을 살짝 얹어요' };
const HAPPEN = [ // [text, emote, sound, fx, shake, extra]
  ['타닥! 불똥이 튀었어요 — 앗 뜨거!', 'wave', 'fire', 'spark', 0.25],
  ['연기가 확… 콜록콜록! 눈이 매워요', 'weep', 'whoosh', 'steam', 0],
  ['휙! 공중에서 한 바퀴 — 받았다!', 'cheer', 'whoosh', 'pop', 0],
  ['흥얼흥얼… 아버지께 배운 노래를 부르며 저어요', 'dance', 'flute', 'note', 0],
  ['킁킁… 냄새를 맡아 보고, 고개를 끄덕여요', 'think', 'blip', 'steam', 0],
  ['조금 맛을 보고… 음, 소금을 아주 조금만 더!', 'eat', 'click', null, 0],
  ['불이 약해져서 후— 후— 불어요', 'squat', 'whoosh', 'spark', 0],
  ['딱 알맞게 익었어요! 하나 더 만들 수 있겠어요', 'clap', 'craft', 'star', 0, 'bonus'] ];
H.extraShots = function (shots, c) { const tier = (CLS[c.r.out] || [0, 1])[1], P = Game.P;
  const note = n => G.FX.burst(c.hx, c.fy + 1.9, c.hz, n, { c: [1, 0.9, 0.5], sp: 0.3, up: 0.9, g: -0.2, life: 1.4, size: 0.08 });
  const star = n => G.FX.burst(c.fx, c.fy + c.top + 0.2, c.fz, n, { c: [1, 0.85, 0.35], sp: 0.9, up: 1.6, g: 0.5, life: 1.2, size: 0.09 });
  const fxOf = k => k === 'note' ? note : k === 'star' ? star : k ? c.FXK[k] : null;
  const ang = Math.random() * PI * 2, rr = 2.4; // a fresh angle every time: high above the fire, or circling low
  const mid = shots.length > 1 ? 1 : 0;
  if (tier >= 2) { const f = c.FXK.flour || c.FXK.spark; shots.splice(mid + 1, 0, { fn: () => { c.em(c.m === 'bowl' ? 'gather' : 'milk'); sfx('gather', { pitch: 1.3 }); },
    cam: [c.fx + Math.sin(ang) * 0.6, c.fy + 1.9, c.fz + Math.cos(ang) * 0.6], cam2: [c.fx + Math.sin(ang) * 0.5, c.fy + 1.6, c.fz + Math.cos(ang) * 0.5], look: [c.fx, c.fy + c.top, c.fz], dur: 2.3, fov: 0.7, t: SEASON[c.m] || SEASON.bake,
    each: t => { if (P.emote) P.emote.t = t; if (Math.random() < 0.15) G.FX.burst(c.fx, c.fy + c.top + 0.35, c.fz, 2, { c: [0.95, 0.85, 0.6], sp: 0.2, up: -0.3, g: 3, life: 0.5, size: 0.03 }); } }); }
  if (Math.random() < (tier >= 3 ? 0.85 : 0.6)) { const h = HAPPEN[Math.floor(Math.random() * HAPPEN.length)], fx = fxOf(h[3]);
    shots.splice(Math.min(shots.length, mid + 2), 0, { fn: () => { c.em(h[1]); sfx(h[2], { vol: 0.8 }); if (h[4]) Game.CAM.shake = h[4]; if (fx) fx(h[3] === 'star' ? 14 : 8); if (h[5] === 'bonus') c.r.n += 1; },
      cam: [c.hx + Math.sin(ang + 1.2) * rr, c.fy + 1.2, c.hz + Math.cos(ang + 1.2) * rr], look: [(c.hx + c.fx) / 2, c.fy + 0.9, (c.hz + c.fz) / 2], dur: 2.4, fov: 0.72, t: h[0], shake: h[4] || 0, shakeDecay: 0.6,
      e: h[1] === 'weep' ? 'cry' : h[1] === 'cheer' || h[1] === 'clap' ? 'happy' : h[1] === 'dance' ? 'happy' : undefined, n: h[1] === 'think' || h[1] === 'eat' ? '' : undefined,
      each: t => { if (P.emote) P.emote.t = t; if (fx && h[3] !== 'star' && Math.random() < 0.12) fx(2); } }); }
  if (tier >= 3) shots.push({ fn: () => { c.em('clap'); sfx('quest', { pitch: 1.2, vol: 0.6 }); star(20); }, cam: [c.fx + Math.sin(ang + PI) * 1.6, c.fy + 0.9, c.fz + Math.cos(ang + PI) * 1.6], look: [c.fx, c.fy + c.top, c.fz], dur: 2.2, fov: 0.6,
    t: tier >= 4 ? `「${c.name}」 — 정성을 다해 차린 상이에요!` : `「${c.name}」이(가) 완성됐어요!`, e: 'happy', each: t => { if (P.emote) P.emote.t = t; } }); };
})(window.G);
