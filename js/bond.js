/* 약속의 길 — 친밀도와 가정 (v16.2)
   · Everyone you can talk to (men and women, young and old) has a 친밀도 with Joseph. It grows when you talk to them (once a day),
     bring them something they like (once a day), and help them. Levels: 처음 보는 사이 → 아는 사이 → 친구 → 가까운 친구 →
     형제·자매 같은 사이. Each level brings a warmer greeting, a small thank-you gift and a personal story.
   · Family (an episode can name it in EP.family): for Joseph, his wife 아스낫 and their sons 므낫세 and 에브라임. With them there is no
     「friendship」 but family time: eating together, a walk together, playing with the boys — and their own bond ladder.
   Talking: after what someone says, a few choices appear — 안부 묻기 · 선물 주기 · (family) 함께 식사 / 함께 걷기 / 놀아 주기 · 작별.
   API: G.Bond.get(id) · G.Bond.add(id, n, why) · G.Bond.talk(npc, lines, done) · G.Bond.panel() */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), rnd = a => a[Math.floor(Math.random() * a.length)];
const B = G.Bond = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const LV = [[0, '처음 보는 사이'], [5, '아는 사이'], [15, '친구'], [30, '가까운 친구'], [50, '형제처럼 가까운 사이']];
const LVF = [[0, '가족'], [20, '다정한 가족'], [45, '서로의 기쁨'], [80, '온전한 한 집']];
const fam = id => { const EP = Game.EP(); return EP && EP.family && EP.family[id]; };
const st = () => { const S = Game.S(); return (S.bond = S.bond || {}); };
B.get = id => { const s = st(); return s[id] || (s[id] = { p: fam(id) ? fam(id).start || 20 : 0, day: -1, gift: -1, meal: -1, play: -1, lv: 0 }); };
B.level = id => { const L = fam(id) ? LVF : LV, p = B.get(id).p; let i = 0; for (let k = 0; k < L.length; k++) if (p >= L[k][0]) i = k; return { i, name: L[i][1], next: L[i + 1] ? L[i + 1][0] : null, max: L.length - 1 }; };
B.hearts = id => { const l = B.level(id); return '♥'.repeat(l.i + 1) + '♡'.repeat(l.max - l.i); };
B.add = function (id, n, why) { const b = B.get(id), n0 = B.level(id).i; b.p = Math.max(0, b.p + n); const lv = B.level(id), N = Game.ENT.npcs[id], nm = N ? N.name : id;
  if (n > 0) G.UI.toast(`${nm} ${fam(id) ? '가족의 정' : '친밀도'} +${n}${why ? ' · ' + why : ''} (${lv.name})`);
  if (lv.i > n0) { b.lv = lv.i; sfx('quest', { pitch: 1.15 }); G.UI.featCard && G.UI.featCard('bond', { kick: fam(id) ? '가정' : '친밀도', n: `${nm} · ${lv.name}`, ic: 'star', d: fam(id) ? '함께한 시간만큼 집이 더 따뜻해졌어요.' : '이제 더 깊은 이야기를 들려줄 거예요.' });
    setTimeout(() => reward(id, lv.i), 1600); } };
// what people like, by who they are (name / role words) — and what everybody likes a little
const LIKE = [[/아이|목동|소년|소녀|므낫세|에브라임/, ['dates', 'honey', 'sweetCake', 'figCake', 'fig', 'milkHoney']], [/농부|일꾼|밭/, ['bread', 'onion', 'lentilStew', 'flatbread', 'barley']],
  [/여인|물 긷|베 짜|아내|아스낫/, ['flower', 'linen', 'honey', 'fig', 'thread', 'milkHoney']], [/노인|장로|할아버지|할머니|아메니/, ['cheese', 'porridge', 'bread', 'dates', 'herb']],
  [/상인|장사/, ['linen', 'honey', 'hide', 'wool']], [/목자|사냥꾼/, ['meat', 'skewer', 'cheese', 'bread', 'sinew']], [/간수|관원|감독|신하|제사장/, ['linen', 'fishStew', 'honeyMeat', 'cheese']]];
function likes(n) { const nm = n.name + ' ' + (n.d.role || ''); for (const [rx, l] of LIKE) if (rx.test(nm)) return l; return ['bread', 'fig', 'dates', 'honey']; }
// v16.3 rewards that fit the person and grow with the bond (level 1 → 4); family has its own
const ROLEREW = [[/농부|일꾼|밭/, { k: 'barley', n: 6, d: '보리 한 자루' }], [/상인|장사/, { silver: 25, d: '은 25' }], [/토기|그릇/, { k: 'clay', n: 6, d: '고운 진흙' }], [/베 짜|길쌈|직조/, { k: 'cloth', n: 2, d: '모직 천' }],
  [/사냥꾼/, { k: 'arrow', n: 12, d: '화살 한 묶음' }], [/목자/, { k: 'cheese', n: 2, d: '치즈' }], [/아이|소년|소녀|목동/, { k: 'flower', n: 3, d: '들꽃 한 줌' }], [/노인|장로|할아버지|할머니|아메니/, { insight: 1, d: '깨달음 1' }],
  [/관원|감독|신하|간수|제사장/, { silver: 30, d: '은 30' }], [/여인|물 긷/, { k: 'honey', n: 2, d: '꿀' }]];
const FAMREW = { asenath: [null, { ward: 'wFeast', d: '아스낫이 손수 지은 잔치 예복' }, { insight: 2, mind: 10, d: '깨달음 2 · 정신력 최대치 +10' }, { stam: 10, hp: 10, d: '가정의 축복 · 체력·기력 최대치 +10' }],
  manasseh: [null, { k: 'flower', n: 3, d: '므낫세가 꺾어 온 들꽃' }, { insight: 1, d: '아이의 기도 · 깨달음 1' }, { mind: 10, d: '「아빠 사랑해요」 · 정신력 최대치 +10' }],
  ephraim: [null, { k: 'stone', n: 1, d: '에브라임의 반짝이는 돌멩이' }, { insight: 1, d: '아이의 웃음 · 깨달음 1' }, { mind: 10, d: '「아빠 품이 제일 좋아요」 · 정신력 최대치 +10' }] };
function roleRew(n) { const nm = n.name + ' ' + (n.d.role || ''); for (const [rx, r] of ROLEREW) if (rx.test(nm)) return r; return { silver: 15, d: '은 15' }; }
B.rewardOf = function (id, lv) { const N = Game.ENT.npcs[id]; if (fam(id)) return (FAMREW[id] || [])[lv] || null; if (!N) return null;
  return lv <= 0 ? null : lv === 1 ? { food: 2, d: '그 땅의 먹을거리' } : lv === 2 ? roleRew(N) : lv === 3 ? { k: 'linen', n: 1, silver: 25, insight: 1, d: '세마포 · 은 25 · 깨달음 1' } : { silver: 40, insight: 2, mind: 5, d: '평생의 우정 · 은 40 · 깨달음 2 · 정신력 최대치 +5' }; };
function reward(id, lv) { const N = Game.ENT.npcs[id], r = B.rewardOf(id, lv), S = Game.S(), H = S.hero; if (!r) return; const nm = N ? N.name : id;
  if (r.food) { const T = Game.EP().lootTables, tab = (T && (N && N.x > 110 ? T.canaan : T.egypt)) || [['bread', 1, 1]]; const t = rnd(tab); Game.give(t[0], r.food, true); G.UI.gain && G.UI.gain(t[0], r.food); }
  if (r.k && Game.ITEMS[r.k]) { Game.give(r.k, r.n || 1, true); G.UI.gain && G.UI.gain(r.k, r.n || 1); }
  if (r.silver) Game.silver(r.silver); if (r.insight && Game.insight) Game.insight(r.insight, `${nm}와의 정`);
  if (r.mind && H) { H.mindMax = (H.mindMax || 100) + r.mind; H.mind = H.mindMax; } if (r.stam && H) H.stamMax = (H.stamMax || 100) + r.stam; if (r.hp && H) { H.hpMax += r.hp; H.hp = H.hpMax; }
  if (r.ward) { const w = S.flags.ward = S.flags.ward || { own: { josephVizier: 1, josephShaved: 1 }, sel: null }; w.own[r.ward] = 1; }
  G.UI.toast(`${nm}의 선물 · ${r.d}`); G.UI.hud && G.UI.hud(); }
// personal stories that open up with the level
const STORY = [
  ['요즘은 그럭저럭 지내오. 자네는?', '하루하루 먹고사는 게 일이지요.'],
  ['사실 고향에 두고 온 동생이 있소. 잘 지내는지…', '어릴 적엔 나일 강에서 하루 종일 헤엄쳤다오.'],
  ['당신을 만나고 나서 하루가 덜 고되오. 정말이오.', '내가 힘들 때 당신의 하나님 이야기가 떠오르더군요.'],
  ['당신이라면 내 속마음을 털어놓을 수 있겠소. 언젠가 내 이야기를 끝까지 들어 주시오.', '우리 집 문은 늘 열려 있소. 언제든 오시오.'],
  ['당신은 내게 형제나 다름없소. 이 땅이 굶주릴 때 당신이 우리를 살렸지.', '내 아이들에게 당신 이야기를 들려준다오. 하나님이 함께하신 사람이라고.']];
B.talk = function (n, lines, done) { const id = n.id || Object.keys(Game.ENT.npcs).find(k => Game.ENT.npcs[k] === n); n.id = id; const S = Game.S(), b = B.get(id), F = fam(id), first = b.day !== S.day;
  if (first) { b.day = S.day; setTimeout(() => B.add(id, F ? 3 : 2, '오늘 이야기'), 50); }
  const ls = (lines && lines.length ? lines : G.Greet ? G.Greet.lines(n) : [{ n: n.name, t: '평안하시오.' }]).map(l => typeof l === 'string' ? { n: n.name, t: l } : l);
  const ch = [{ t: '안부 묻기', then: () => setTimeout(() => G.UI.say([{ n: n.name, t: F ? rnd(F.talk(S, B.level(id).i)) : rnd(STORY[B.level(id).i]) }], () => B.talk(n, [{ n: n.name, t: '또 무슨 이야기를 할까요?' }], done)), 30) },
    { t: '선물 주기', then: () => setTimeout(() => B.giftPick(n, done), 30) }];
  if (F && F.meal && b.meal !== S.day) ch.push({ t: '함께 식사하기', then: () => setTimeout(() => B.meal(n, done), 30) });
  if (F && F.walk) ch.push({ t: n.follow ? '여기서 기다려 줘요' : '같이 걸어요', then: () => { n.follow = !n.follow; G.UI.toast(n.follow ? `${n.name}이(가) 함께 걸어요` : `${n.name}이(가) 여기서 기다려요`); done && done(); } });
  if (F && F.play && b.play !== S.day) ch.push({ t: '놀아 주기', then: () => setTimeout(() => B.play(n, done), 30) });
  ch.push({ t: '작별 인사', then: () => done && done() });
  const last = ls[ls.length - 1]; ls[ls.length - 1] = Object.assign({}, last, { choices: ch });
  G.UI.say(ls, done); };
B.giftPick = function (n, done) { const S = Game.S(), id = n.id, b = B.get(id), I = Game.ITEMS;
  if (b.gift === S.day) { G.UI.say([{ n: n.name, t: '오늘은 벌써 받았어요. 마음만으로도 고마워요.' }], done); return; }
  const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0 && I[k] && ['food', 'good', 'crop', 'fish', 'mat'].includes(I[k].cat) && !Game.ITEMS[k].tool).sort((a, c) => (likes(n).includes(c) ? 1 : 0) - (likes(n).includes(a) ? 1 : 0)).slice(0, 6);
  if (!ks.length) { G.UI.say([{ n: '요셉', t: '(줄 만한 것이 없다…)' }], done); return; }
  G.UI.say([{ n: '요셉', t: '무엇을 줄까?', choices: ks.map(k => ({ t: `${I[k].n} (${S.inv[k]})`, then: () => { Game.take(k, 1); b.gift = S.day; G.Deeds && G.Deeds.rec('share', n); const like = likes(n).includes(k), sto = ['stone', 'branch', 'clay', 'straw', 'reed'].includes(k);
      setTimeout(() => G.UI.say([{ n: n.name, t: like ? rnd(['어머, 이거 정말 좋아하는 거예요! 고마워요!', '어떻게 알았소? 내가 이걸 제일 좋아하는데!', '와아! 최고예요!']) : sto ? rnd(['…이걸 왜 주시오? 허허.', '음… 고마워요. (어리둥절)']) : rnd(['고마워요. 잘 쓸게요.', '정성이 고맙구려.']) }], () => { B.add(id, like ? 6 : sto ? 0 : 2, '선물'); done && done(); }), 30); } })).concat([{ t: '그만두기', then: () => done && done() }]) }], null); };
// family time
B.meal = function (n, done) { const S = Game.S(), P = Game.P, b = B.get(n.id); b.meal = S.day; const F = fam(n.id);
  G.UI.fade(() => { P.sit = true; const H = S.hero; if (H) H.hp = H.hpMax; P.stam = (H && H.stamMax) || 100; if (G.Vitals && G.Vitals.mindGain) G.Vitals.mindGain(25); if (S.surv) S.surv.food = 100; }, () => {
    G.UI.say([{ n: '', t: rnd(['식탁에 따뜻한 빵과 렌틸 죽, 대추야자가 차려졌습니다.', '아이들이 앞다투어 오늘 있었던 일을 이야기했습니다.', '나일 강에서 잡은 생선이 구수하게 익었습니다.']) },
      { n: n.name, t: rnd(F.mealTalk) }, { n: '요셉', t: rnd(['하나님, 이 식탁을 주셔서 감사합니다.', '고마워요. 오늘도 덕분에 힘이 나요.', '(아이들의 웃음소리를 들으며 미소 짓는다)']) }],
      () => { P.sit = false; B.add(n.id, 5, '함께한 식사'); for (const k in Game.EP().family) if (k !== n.id && Game.ENT.npcs[k] && Game.ENT.npcs[k].vis) B.add(k, 2); G.UI.toast('체력·기력·정신력이 가득 찼어요'); done && done(); }); }); };
B.play = function (n, done) { const S = Game.S(), P = Game.P, b = B.get(n.id); b.play = S.day; const F = fam(n.id), game = rnd(F.games);
  n.emote = { k: game.k, t: 0, dur: 5 }; P.emote = { k: game.me, t: 0, dur: 5 }; sfx('cheer');
  G.UI.say([{ n: '', t: game.t }, { n: n.name, t: rnd(game.kid) }], () => { B.add(n.id, 5, '함께 논 시간'); if (G.Vitals && G.Vitals.mindGain) G.Vitals.mindGain(15); done && done(); }); };
// family members who walk with you
B.update = function (dt) { const P = Game.P; if (!Game.S()) return; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.follow || !n.vis) continue; const d = Math.hypot(n.x - P.x, n.z - P.z);
    if (d > 60) { n.follow = false; continue; } if (d > 2.6 && (!n.walk || (B.fT = (B.fT || 0) - dt) < 0)) { B.fT = 0.5; const a = P.face + Math.PI + (id.length % 3 - 1) * 0.6; Game.npcWalk(id, P.x + Math.sin(a) * 1.6, P.z + Math.cos(a) * 1.6, null, d > 6 ? 4.2 : 2.4); } } };
// who you know: a small panel
B.panel = function () { const S = Game.S(), ids = Object.keys(st()).filter(id => Game.ENT.npcs[id] || fam(id)); let el = $('bondUI');
  if (!el) { el = document.createElement('div'); el.className = 'overlay sheet'; el.id = 'bondUI'; document.body.appendChild(el); el.addEventListener('click', e => { if (e.target.closest('#bondX') || e.target === el) { el.hidden = true; G.UI.setBusy('bond', false); } }); }
  const row = id => { const N = Game.ENT.npcs[id], nm = N ? N.name : id, l = B.level(id), p = B.get(id).p; const nr = l.next ? B.rewardOf(id, l.i + 1) : null; return `<div class="brow${fam(id) ? ' fam' : ''}"><b>${nm}</b><span>${l.name}${nr ? ` · 다음 보상: ${nr.d}` : ''}</span><i>${B.hearts(id)}</i><em>${l.next ? `${p} / ${l.next}` : p}</em></div>`; };
  const famIds = ids.filter(fam), others = ids.filter(id => !fam(id)).sort((a, c) => B.get(c).p - B.get(a).p);
  el.innerHTML = `<div class="panel"><div class="p-head"><h3>사람들</h3><button class="p-x" id="bondX">닫기</button></div><div class="p-body">${famIds.length ? `<div class="sec">가족</div>${famIds.map(row).join('')}` : ''}<div class="sec">아는 사람들</div>${others.length ? others.map(row).join('') : '<p class="muted">아직 친해진 사람이 없어요. 사람들에게 말을 걸어 보세요.</p>'}<p class="muted" style="margin-top:8px">하루에 한 번 이야기 나누기, 좋아하는 선물, 부탁 들어주기로 가까워져요.</p></div></div>`;
  el.hidden = false; G.UI.setBusy('bond', true); };
})(window.G);
