/* 약속의 길 — 보양 요리와 식사 장면 (v18.13)
   · 보양 요리 10가지: each raises one maximum for good — 체력 (meat/fish stews), 기력 (grain, raisins, nuts), 정신력 (mint,
     honey, fruit) — +3 each time, up to three times per dish; 「야곱의 장막 잔칫상」 raises all three by 2. Only ingredients that
     already exist; every recipe is an exact set, checked before the older ones so nothing older is shadowed (sets are unique).
   · 식사 장면: the first time Joseph eats a 보양 요리 or any hard dish (tier 3+) — out of a fight, when the screen is free —
     a short scene plays: he gives thanks, eats, and the body or heart answers (warm glow, a stretch, a clear look at the sky).
     Several variants per stat, a fresh camera angle each time. Later meals are the usual quick bite.
   · 요리 도감 보상: knowing 10 / 20 / 30 / 45 / 60 dishes brings a gift (insight, silver, maximums). The cook book header shows
     how many to the next one, and how much food has raised the maximums so far. */
'use strict';
(function (G) {
const Game = G.Game, H = G.Hearth, CU = G.Cuisine, EP = G.EP && G.EP.joseph; if (!H || !CU || !EP) return;
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), PI = Math.PI, FISH = '#fish';
const T = G.Tonic = {};

// ------------------------------------------------------------------ the dishes
// key: [name, icon, colour, method, class, tier, temp, recipe text, verse, look colours, taste line, ingredients (exact set), cook spot, water, stat]
const TONIC = {
  tLambTonic: ['마늘 대추 양고기 보양탕', 'meat', '#9a5030', 'stew', 'meat', 3, 'warm', '고기 + 마늘 + 대추야자 + 물', '', [0x9a5030, 0x8a4a2a], '뜨끈한 국물이 온몸으로 퍼져… 힘이 난다!', ['meat', 'garlic', 'dates'], 'pot', 1, 'hp'],
  tFowlBarley: ['메추라기 보리 곰국', 'bowl', '#d8b880', 'stew', 'meat', 3, 'warm', '메추라기 고기 + 보리 + 부추 + 물', '', [0xe0c890, 0x6a9a3a], '오래 고아서 국물이 진하다…', ['fowl', 'barley', 'leek'], 'pot', 1, 'hp'],
  tFishLentil: ['생선 렌틸 보양죽', 'fish', '#c09050', 'stew', 'fish', 3, 'warm', '생선 + 렌틸 + 마늘 + 물', '', [0xc8a060, 0xb8502a], '부드럽고 든든해. 아픈 데가 다 나을 것 같아.', [FISH, 'lentil', 'garlic'], 'pot', 1, 'hp'],
  tManna: ['꿀 고수 과자', 'cake', '#f0e0b0', 'bake', 'grain', 3, '', '밀 + 고수 + 꿀', '그 맛은 꿀 섞은 과자 같았더라 (출 16:31)', [0xf4ead0, 0xe8b040], '하늘에서 내린 양식이 이런 맛이었을까?', ['wheat', 'coriander', 'honey'], 'stone', 0, 'stam'],
  tDavidPack: ['다윗의 볶은 곡식 주머니', 'grain', '#c8a050', 'roast', 'grain', 3, '', '보리 + 건포도 + 아몬드', '볶은 곡식 다섯 세아와 건포도 백 송이와 (삼상 25:18)', [0xd8b040, 0x5a2a3a], '한 줌씩 집어 먹으며 하루 종일 걸을 수 있겠다!', ['barley', 'raisins', 'almond'], 'stone', 0, 'stam'],
  tDatePista: ['대추야자 피스타치오 젖', 'milk', '#e8d8b0', 'bowl', 'sweet', 3, 'cool', '염소젖 + 대추야자 + 피스타치오', '', [0xf0e4c8, 0x9ab060], '달고 고소해서 다리에 힘이 붙어.', ['milk', 'dates', 'pistachio'], 'bowl', 0, 'stam'],
  tMintHoney: ['박하 꿀 차', 'drop', '#c8d890', 'stew', 'drink', 3, 'warm', '박하 + 꿀 + 물', '내 아들아 꿀을 먹으라 이것이 좋으니라 (잠 24:13)', [0xc8d890, 0xe8b040], '향긋하고 달콤해… 마음이 고요해진다.', ['mint', 'honey'], 'pot', 1, 'mind'],
  tPomGrape: ['석류 포도 박하 냉즙', 'berry', '#a0304a', 'bowl', 'drink', 3, 'cool', '석류 + 포도 + 박하', '', [0xb02a3a, 0x6a3a8a], '새콤하고 시원해서 머리가 맑아져!', ['pomegranate', 'grapes', 'mint'], 'bowl', 0, 'mind'],
  tAlmondMilk: ['아몬드 꿀 젖', 'milk', '#f0e4c0', 'bowl', 'milk', 3, 'cool', '염소젖 + 아몬드 + 꿀', '살구나무 가지를 보나이다 (렘 1:11)', [0xf6f0e0, 0xc8a070], '부드럽고 따뜻한 맛… 걱정이 사르르 녹아.', ['milk', 'almond', 'honey'], 'bowl', 0, 'mind'],
  tJacobTable: ['야곱의 장막 잔칫상', 'bread', '#c88040', 'bake', 'mixed', 4, 'warm', '고기 + 렌틸 + 밀 + 꿀 + 석류', '그가 먹고 또 포도주를 가져가매 그가 마시고 (창 27:25)', [0xa8582a, 0xc0303a], '아버지 장막에서 먹던 잔치 같아… 온몸에 힘이 넘쳐!', ['meat', 'lentil', 'wheat', 'honey', 'pomegranate'], 'stone', 0, 'all'] };
T.TONIC = TONIC;
const STAT_N = { hp: '최대 체력', stam: '최대 기력', mind: '최대 정신력', all: '모든 최대치' };
for (const k in TONIC) { const [n, ic, c, m, cls, tier, temp, how, ref, look, taste] = TONIC[k];
  Game.ITEMS[k] = Game.ITEMS[k] || { n, cat: 'food', p: 10 + tier * 6, ic, c };
  H.DISH[k] = { n, ic, c, pot: m, how: '보양 · ' + how, ref, food: 34 }; H.METHOD[k] = m; H.LOOKS[k] = look; H.TASTE[k] = taste; if (!H.ALL.includes(k)) H.ALL.push(k);
  CU.CLS[k] = [cls, tier, temp]; }
// a tonic raises its own maximum (+3, all +2); the cuisine layer applies it up to three times per dish
const prof0 = CU.profile;
CU.profile = function (k) { const p = prof0.apply(this, arguments); const t = TONIC[k]; if (p && t) p.max = t[14] === 'all' ? { all: 2 } : { [t[14]]: 3 }; return p; };
for (const k in TONIC) { const it = Game.ITEMS[k], p = CU.profile(k); it.hp = p.hp; it.stam = p.stam; it.mind = p.mind; it.temp = p.temp; it.tier = p.tier;
  H.DISH[k].hp = p.hp; H.DISH[k].stam = p.stam; if (G.Surv && G.Surv.FOOD) G.Surv.FOOD[k] = Math.round(8 + p.tier * 9 + (p.hp + p.stam) * 0.08); }
// recipes: exactly this set of ingredients (any fish counts as #fish)
const res0 = H.result;
H.result = function (pick) {
  const ks = Object.keys(pick).filter(k => pick[k] > 0); if (!ks.length) return null;
  const set = new Set(ks.map(k => H.KIND[k] === 'fish' ? FISH : k)), tot = ks.reduce((a, k) => a + pick[k], 0), serv = 1 + Math.floor((tot - 1) / 2), S = Game.S();
  for (const k in TONIC) { const ing = TONIC[k][11], water = TONIC[k][13];
    if (ing.length !== set.size || !ing.every(x => set.has(x))) continue; if (water && !(S.water > 0)) continue;
    return Object.assign({ out: k, n: serv + (TONIC[k][5] >= 4 ? 1 : 0), pot: TONIC[k][12] }, water ? { water: 1 } : {}); }
  return res0.apply(this, arguments);
};

// ------------------------------------------------------------------ eating: count what food has raised, and queue a scene the first time
const eat0 = Game.eat;
Game.eat = function (k) { const S = Game.S(), Hh = S && S.hero, before = Game.inv(k), m0 = Hh ? [Hh.hpMax, Hh.stamMax || 100, Hh.mindMax || 100] : null;
  const r = eat0.apply(this, arguments); if (!Hh || Game.inv(k) >= before) return r;
  const d = [Hh.hpMax - m0[0], (Hh.stamMax || 100) - m0[1], (Hh.mindMax || 100) - m0[2]], fm = S.flags.foodMax = S.flags.foodMax || { hp: 0, stam: 0, mind: 0 };
  fm.hp += d[0]; fm.stam += d[1]; fm.mind += d[2];
  const p = CU.profile(k), seen = S.flags.ateScene = S.flags.ateScene || {};
  if (p && (TONIC[k] || p.tier >= 3) && !seen[k] && !(G.Combat && G.Combat.inCombat)) T.pend = { k, d, t: 0 }; // marked as seen only once it really plays
  return r; };

// ------------------------------------------------------------------ the meal scene
/* v18.13c grace: standing, head bowed, hands folded at the chest (the old 'pray' act had no pose of its own) */
if (G.Motion && G.Motion.POSES && G.HBI && !G.Motion.POSES.grace) { const B = G.HBI, fn = (rig, p, t) => { const br = Math.sin(t * 1.2) * 0.015;
  rig.set(B.chest, 0.1 + br, 0, 0); rig.set(B.head, 0.42, 0, 0); rig.set(B.uArmL, -0.62, 0, -0.38); rig.set(B.uArmR, -0.62, 0, 0.38); rig.set(B.fArmL, -1.85, 0.32, 0); rig.set(B.fArmR, -1.85, -0.32, 0); rig.faceE = 0.2; };
  fn.up = true; G.Motion.POSES.grace = fn; }
const GRACE = ['먹기 전에… 하나님, 오늘도 먹을 것을 주셔서 감사합니다.', '아버지께 배운 대로, 먼저 감사드려요.', '여호와께서 주신 양식이에요. 감사합니다.', '이 먹을 것을 나눌 사람들도 지켜 주세요.'];
const AFTER = { // [act, line, fx colour, rise]
  hp: [['raiseHands', '몸 깊은 곳에서 힘이 차올라요', [1, 0.55, 0.3], 1.4], ['stretch', '어깨가 펴지고 팔에 힘이 붙어요', [1, 0.6, 0.35], 1.2], ['clap', '아픈 데가 다 나은 것처럼 개운해요', [1, 0.5, 0.35], 1.3]],
  stam: [['stretch', '기지개를 쭉— 다리가 가벼워요', [1, 0.85, 0.35], 1.1], ['laugh', '하루 종일 걸어도 끄떡없겠어요', [1, 0.8, 0.3], 1.2], ['raiseHands', '숨이 깊어지고 몸이 가뿐해요', [1, 0.9, 0.45], 1.4]],
  mind: [['think', '하늘을 올려다보니 마음이 맑아져요', [0.5, 0.78, 1], 1.8], ['grace', '조용히 눈을 감아요… 걱정이 가라앉아요', [0.6, 0.85, 1], 1.5], ['warmHands', '따뜻한 기운이 가슴에 고여요', [0.55, 0.8, 1], 1.2]],
  all: [['raiseHands', '온몸과 마음에 힘이 넘쳐요!', [1, 0.85, 0.4], 1.8], ['clap', '이런 잔치는 오랜만이에요!', [1, 0.8, 0.35], 1.6]] };
const pickOf = a => a[Math.floor(Math.random() * a.length)];
function statOf(k, d) { const t = TONIC[k]; if (t) return t[14]; const p = CU.profile(k); if (d[0] > 0 && d[1] > 0 && d[2] > 0) return 'all'; const i = [p.hp, p.stam, p.mind].indexOf(Math.max(p.hp, p.stam, p.mind)); return ['hp', 'stam', 'mind'][i]; }
T.scene = function (q) {
  const P = Game.P, W = Game.W(), it = Game.ITEMS[q.k]; if (!it || !W) return;
  const st = statOf(q.k, q.d), [act, line, col, rise] = pickOf(AFTER[st]), y = W.heightAt(P.x, P.z), f = P.face, side = Math.random() < 0.5 ? 1 : -1;
  const at = (a, r, h) => [P.x + Math.sin(f + a) * r, y + h, P.z + Math.cos(f + a) * r], head = [P.x, y + 1.35, P.z];
  const em = k => { P.emote = { k, t: 0, dur: 0 }; }, gain = [];
  if (q.d[0] > 0) gain.push(`최대 체력 +${q.d[0]}`); if (q.d[1] > 0) gain.push(`최대 기력 +${q.d[1]}`); if (q.d[2] > 0) gain.push(`최대 정신력 +${q.d[2]}`);
  const glow = n => { for (let i = 0; i < n; i++) { const a = Math.random() * PI * 2, rr = 0.3 + Math.random() * 0.4; G.FX.burst(P.x + Math.cos(a) * rr, y + 0.2 + Math.random() * 0.8, P.z + Math.sin(a) * rr, 1, { c: col, sp: 0.15, up: rise, g: -0.2, life: 1.6, size: 0.09, a: 0.9 }); } };
  const shots = [
    { fn: () => { em('grace'); sfx('blip', { pitch: 0.8, vol: 0.5 }); }, cam: at(0.75 * side, 2.4, 1.35), cam2: at(0.6 * side, 2.1, 1.3), look: [P.x, y + 1.2, P.z], dur: 2.4, fov: 0.75, t: pickOf(GRACE), n: '요셉', e: 'calm', each: t => { if (P.emote) P.emote.t = t; } },
    { fn: () => { H.eatStart && H.eatStart(q.k); em('eat'); P.emote.dur = 2.4; sfx('eat'); }, cam: at(-0.35 * side, 1.25, 1.45), cam2: at(-0.3 * side, 1.1, 1.42), look: head, dur: 2.5, fov: 0.55, t: H.TASTE[q.k] || '음… 맛있다!', n: '요셉', e: 'happy', each: t => { if (P.emote) P.emote.t = t; } },
    { fn: () => { em(act); sfx('quest', { pitch: st === 'mind' ? 1.35 : 1.15, vol: 0.55 }); glow(14); }, cam: st === 'mind' ? at(PI + 0.5 * side, 2.6, 0.5) : at(0.9 * side, 3.0, 1.6), cam2: st === 'mind' ? at(PI + 0.45 * side, 2.9, 0.45) : at(1.0 * side, 3.4, 1.7),
      look: st === 'mind' ? [P.x, y + 2.4, P.z] : [P.x, y + 1.0, P.z], dur: 2.8, fov: st === 'mind' ? 0.8 : 0.7, t: `${line}${gain.length ? ' · ' + gain.join(' · ') : ''}`, e: 'happy',
      each: t => { if (P.emote) P.emote.t = t; if (Math.random() < 0.25) glow(1); } } ];
  G.Cine.play(shots, () => { P.emote = null; H.eatK = null; G.UI.hud(); }, { blendIn: 0.5 });
};
T.tick = function (dt) { const q = T.pend; if (!q) return; q.t += dt;
  if (q.t > 20) { T.pend = null; return; } // missed its moment (a fight, a long menu): no scene this time
  if (Game.mode !== 'play' || G.UI.busy() || (G.Cine && G.Cine.on) || Game.cineOn || (G.Combat && G.Combat.inCombat) || Game.P.ride) return;
  if (q.t < 0.4) return; T.pend = null; const seen = Game.S().flags.ateScene = Game.S().flags.ateScene || {}; if (seen[q.k]) return; seen[q.k] = 1; T.scene(q); };

// ------------------------------------------------------------------ recipe book milestones
const MILE = [[10, { insight: 1 }, '요리하는 즐거움을 알게 됐어요'], [20, { max: 3 }, '음식으로 몸을 돌보는 법을 알게 됐어요'], [30, { silver: 30, insight: 1 }, '애굽 사람들도 요리 솜씨를 칭찬해요'],
  [45, { max: 5 }, '들과 강의 맛을 두루 알게 됐어요'], [60, { max: 5, insight: 2 }, '요리의 달인 · 오병이어처럼 나누는 손']];
const known = () => H.ALL.filter(k => H.known()[k]).length;
T.next = () => { const S = Game.S(), got = (S && S.flags.cookMile) || 0; return MILE[got] || null; };
T.mile = function () { const S = Game.S(); if (!S || !S.hero) return; const n = known(), m = T.next(); if (!m || n < m[0]) return;
  S.flags.cookMile = (S.flags.cookMile || 0) + 1; const rw = m[1], Hh = S.hero, a = [];
  if (rw.max) { Hh.hpMax += rw.max; Hh.hp += rw.max; Hh.stamMax = (Hh.stamMax || 100) + rw.max; Hh.mindMax = (Hh.mindMax || 100) + rw.max; a.push(`모든 최대치 +${rw.max}`); G.Combat && (G.Combat.hpDirty = 1); }
  if (rw.silver) { Game.silver(rw.silver); a.push(`은 ${rw.silver}`); } if (rw.insight) setTimeout(() => Game.insight(rw.insight, '요리 도감'), 600);
  G.UI.featCard && G.UI.featCard('cookMile', { kick: `요리 도감 ${m[0]}가지`, n: m[2], ic: 'bread', d: a.join(' · ') || '깨달음을 얻었어요' }); sfx('quest'); G.UI.hud(); };
const draw0 = H.draw;
H.draw = function () { draw0.apply(this, arguments); const el = document.getElementById('cookBookH'), S = Game.S(); if (!el || !S) return;
  const m = T.next(), n = known(), fm = S.flags.foodMax;
  el.textContent += m ? ` · 다음 선물까지 ${Math.max(0, m[0] - n)}가지` : ' · 도감 선물을 모두 받았어요';
  if (fm && (fm.hp || fm.stam || fm.mind)) el.textContent += ` · 음식으로 오른 최대치 체력+${fm.hp} 기력+${fm.stam} 정신력+${fm.mind}`; };

// ------------------------------------------------------------------ per frame
let mT = 0;
const upd0 = EP.update; EP.update = function (dt) { const r = upd0 ? upd0.apply(this, arguments) : undefined; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60; // called as (dt, S, Game, t)
  T.tick(d); if ((mT += d) > 1) { mT = 0; T.mile(); } return r; };
})(window.G);
