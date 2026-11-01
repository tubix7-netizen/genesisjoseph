/* 약속의 길 — living villages and open-country strangers.
   · Villagers (EP.villages[].folk) follow a daily routine built from their role — farmer, water-carrier, potter, weaver,
     merchant, shepherd, hunter, elder, child — with a little variety each day; they shelter from rain, gather at the well,
     the gate and the fire, go home at night, chat with each other in speech bubbles, and now and then walk up to the hero
     to greet him, share news, give a small gift, ask a favour or worry that he looks hungry or cold. Never while a story
     moment is on, near the current objective or right after another conversation (and the player can turn it down).
   · Favours are generated requests (bring N things / hunt N animals) that run through the side-quest system.
   · Strangers roam roads and fields: beggars, hunters, travelers on donkeys, Ishmaelite caravans, shepherds with flocks,
     an old storyteller, a wounded traveler, a woman carrying water. Each has its own ways to interact.
   · Free conversation: with the artifact `sample` capability the hero can say anything and the person answers in
     character (a short Korean reply that knows the place, the hour, the weather and the story so far). Without it, a
     set of topic buttons answers from the scripted pools. */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI, clamp = G.clamp;
const AI = G.NpcAI = { strangers: [], sample: null, sampleOK: true, speaking: null };
const $ = id => document.getElementById(id);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const dayR = (id, S, k) => hash(id + ':' + S.day + ':' + (k || ''));
const EPf = () => Game.EP(), Sf = () => Game.S();
const hero = S => { const EP = EPf(); return EP.heroName ? EP.heroName(S) : EP.hero; };
const hourOf = S => S.time % 24;
const say = (l, cb) => G.UI.say(l, cb);

// claude.use('sample') resolves later (or null outside a Claude viewer) — the free-talk button appears when it is ready
try { if (window.claude && window.claude.use) window.claude.use('sample').then(s => { AI.sample = s || null; }).catch(() => { AI.sample = null; }); } catch (e) { }

// =================================================================== ROUTINES
/* [hour, place:mode]. Places: home, work, well, market, gate, fire, fold, pasture, play, shade, hunt, eat, visit.
   Modes: sit, hide (indoors), act:<anim>, wander:<radius>, wake (stretch by the door). */
const ROUT = AI.ROUT = {
  farmer: [[5.4, 'home:wake'], [6.3, 'work:act:hoe'], [9.4, 'work:act:water'], [11.8, 'eat'], [13, 'work:act:harvest'], [16.4, 'market:wander:2'], [18.2, 'fire:sit'], [20.8, 'home']],
  water: [[5.6, 'well:act:gather'], [7.2, 'home:act:gather'], [9.4, 'market:wander:2'], [11.4, 'home'], [14.2, 'well:act:gather'], [15.8, 'work:act:gather'], [18, 'fire:sit'], [20.4, 'home']],
  potter: [[6.2, 'work:act:mine'], [11.8, 'eat'], [13, 'work:act:mine'], [17.4, 'market:wander:2'], [19, 'fire:sit'], [21, 'home']],
  weaver: [[6.5, 'work:act:gather'], [12, 'eat'], [13, 'work:act:gather'], [16.8, 'well:wander:2'], [18.4, 'fire:sit'], [20.6, 'home']],
  merchant: [[6.6, 'work:wander:1.2'], [12.4, 'eat'], [13.4, 'work:wander:1.2'], [18.6, 'fire:sit'], [21.2, 'home']],
  elder: [[7.2, 'gate:sit'], [11.4, 'home'], [14.4, 'gate:sit'], [17.8, 'fire:sit'], [20.8, 'home']],
  child: [[6.8, 'play:wander:6'], [11.6, 'home'], [13, 'well:wander:4'], [15.6, 'play:wander:7'], [18.4, 'home']],
  shepherd: [[5.4, 'home:wake'], [6, 'fold:wander:3'], [7, 'pasture:wander:8'], [12, 'shade:sit'], [13.2, 'pasture:wander:8'], [17.6, 'fold:wander:3'], [19, 'fire:sit'], [21, 'home']],
  hunter: [[5.2, 'home:wake'], [5.8, 'hunt:wander:12'], [14.6, 'work:act:gather'], [18.4, 'fire:sit'], [21, 'home']],
  oldwoman: [[6.6, 'home:sit'], [9, 'well:sit'], [11.6, 'home'], [15, 'market:wander:1.5'], [17.2, 'fire:sit'], [20, 'home']],
};
const OUTDOOR = new Set(['work', 'well', 'market', 'gate', 'fire', 'fold', 'pasture', 'play', 'shade', 'hunt', 'visit', 'eat']);
function spotPos(v, name, f, S, k) {
  const sp = v.spots[name] || v.spots.hub || [v.x, v.z]; const a = hash(f.id + name) * PI * 2 + (dayR(f.id, S, k) - 0.5) * 1.4, r = (sp[2] !== undefined ? sp[2] : 2.4) * (0.55 + hash(f.id + 'r') * 0.45);
  const x = sp[0] + Math.cos(a) * r, z = sp[1] + Math.sin(a) * r; return [x, z, Math.atan2(sp[0] - x, sp[1] - z)];
}
AI.plan = function (v, f, S) {
  const rout = (v.routines && v.routines[f.role]) || ROUT[f.role] || ROUT.farmer, Wx = G.Weather;
  const wet = Wx && (Wx.rainy() || ['storm', 'dust'].includes(Wx.kind(S)));
  const hm = v.homes[f.home || 0] || [v.x, v.z, 0];
  return rout.map(([h, act], i) => {
    let [where, ...m] = act.split(':'); let mode = m.join(':') || null;
    if (where === 'market' && dayR(f.id, S, i) < 0.3) where = 'well'; // a little different every day
    if (where === 'fire' && f.age !== 'kid' && dayR(f.id, S, 'f' + i) < 0.22) { where = 'visit'; mode = 'wander:1.4'; }
    if (wet && OUTDOOR.has(where) && !(f.role === 'merchant' && where === 'work')) { if (v.shelters && v.shelters.length && dayR(f.id, S, 'w' + i) < 0.45) { where = 'shelter'; mode = null; } else { where = 'home'; mode = null; } }
    let p;
    if (where === 'home') { p = [hm[0], hm[1], hm[2] || 0]; if (!mode) mode = 'hide'; else if (mode === 'wake') mode = 'wander:1.2'; }
    else if (where === 'work') { const w = f.work; if (typeof w === 'string') p = spotPos(v, w, f, S, i); else if (w) { const a = dayR(f.id, S, 'k' + i) * PI * 2, rr = w[3] || 1.6; p = [w[0] + Math.cos(a) * rr * dayR(f.id, S, 'q' + i), w[1] + Math.sin(a) * rr * dayR(f.id, S, 'q' + i), w[2] || 0]; } else p = spotPos(v, 'hub', f, S, i); }
    else if (where === 'visit') { const others = v.folk.filter(o => o !== f); const o = others[Math.floor(dayR(f.id, S, 'v') * others.length)] || f; const oh = v.homes[o.home || 0] || hm; p = [oh[0] + 1.4, oh[1] + 1.1, Math.atan2(-1.4, -1.1)]; }
    else if (where === 'eat') { if (dayR(f.id, S, 'e' + i) < 0.5) p = [hm[0], hm[1], hm[2] || 0]; else p = spotPos(v, 'fire', f, S, i); mode = 'sit'; }
    else if (where === 'shelter') { const sh = v.shelters[Math.floor(hash(f.id + S.day) * v.shelters.length)]; const a = hash(f.id) * PI * 2; p = [sh[0] + Math.cos(a) * 0.8, sh[1] + Math.sin(a) * 0.6, sh[2] || 0]; }
    else p = spotPos(v, where, f, S, i);
    return [h, +p[0].toFixed(2), +p[1].toFixed(2), +(p[2] || 0).toFixed(2), mode];
  });
};
// walking around houses: go through the village square (and the gate) when the straight way is blocked
function blocked(ax, az, bx, bz) {
  const W = Game.W(), L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 1.1);
  for (let i = 1; i < n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n;
    for (const c of W.near(x, z)) { if (!c.on || c.t !== 'b' || (c.y1 - c.y0) < 1.3) continue; const dx = x - c.x, dz = z - c.z, lx = dx * c.ca - dz * c.sa, lz = dx * c.sa + dz * c.ca; if (Math.abs(lx) < c.hw + 0.3 && Math.abs(lz) < c.hd + 0.3) return true; } }
  return false;
}
AI.route = function (v, n, x, z) {
  if (!blocked(n.x, n.z, x, z)) return null; const hub = v.spots.hub || [v.x, v.z]; const path = [[hub[0], hub[1]]];
  if (v.gate) { const outN = Math.hypot(n.x - v.x, n.z - v.z) > v.r * 0.8, outD = Math.hypot(x - v.x, z - v.z) > v.r * 0.8; if (outN) path.unshift([v.gate[0], v.gate[1]]); if (outD) path.push([v.gate[0], v.gate[1]]); }
  return path;
};
// villagers become ordinary NPCs whose schedule comes from AI.plan
AI.register = function (EP) {
  for (const v of EP.villages || []) for (const f of v.folk) {
    const hm = v.homes[f.home || 0] || [v.x, v.z, 0];
    EP.npcs.push({ id: f.id, name: f.name, look: f.look, x: hm[0], z: hm[1], face: hm[2] || 0, scale: f.scale || (f.age === 'kid' ? 0.6 : 1), prop: f.prop,
      show: S => (!v.when || v.when(S)) && (!f.when || f.when(S)), sched: S => AI.plan(v, f, S), route: (n, x, z) => AI.route(v, n, x, z),
      village: v, folk: f, walkSp: f.age === 'old' ? 1.15 : f.age === 'kid' ? 2.1 : 1.55, rider: f.age === 'kid' || f.rider });
  }
};

// =================================================================== WORDS
const ROLE_N = { farmer: '농부', water: '물 긷는 여인', potter: '토기장이', weaver: '베 짜는 여인', merchant: '상인', elder: '성읍의 장로', child: '아이', shepherd: '목자', hunter: '사냥꾼', oldwoman: '할머니' };
const SMALL = {
  farmer: ['올해는 보리가 잘 여물 것 같소.', '밭 가는 일은 허리가 아프지만, 거둘 때면 다 잊는다오.', '씨를 뿌리면 거두는 날이 꼭 오지요.', '땅이 비를 마시는 날이 제일 좋소.', '돌을 골라내야 쟁기가 상하지 않소.'],
  water: ['우물가에서 물 긷다 보면 온 동네 소식을 다 듣는다오.', '물동이가 무거워도 집에 물이 있어야 마음이 놓여요.', '아이들이 우물가에서 물장난을 해서 혼났어요, 호호.', '새벽 물이 제일 맑고 시원해요.'],
  potter: ['진흙은 손이 이끄는 대로 모양이 돼요.', '불에 잘 구워야 깨지지 않는 그릇이 되지요.', '이 항아리 하나면 기름도 곡식도 한 해는 거뜬하오.'],
  weaver: ['실 한 올 한 올이 모여 옷 한 벌이 되지요.', '이 무늬는 우리 어머니께 배웠어요.', '양털을 잘 빗어야 실이 고와요.'],
  merchant: ['좋은 물건은 사람을 다시 오게 하지요.', '다메섹에서 온 상인이 양털 값을 후하게 쳐 주더군요.', '저울추를 속이는 장사꾼은 오래 못 가오.'],
  elder: ['젊은이, 서두르지 마오. 좋은 것은 천천히 자란다오.', '내가 어렸을 적엔 이 땅에 사람이 훨씬 적었지.', '말은 아끼고 귀는 열어 두시오.', '약속을 지키는 사람이 결국 존경을 받소.'],
  child: ['나도 크면 사냥꾼이 될 거예요!', '저기 도마뱀 봤어요? 엄청 빨라요!', '엄마가 해 지기 전에 들어오래요.', '나 돌멩이 멀리 던질 수 있어요. 보여 줄까요?', '어제 양이 새끼를 낳았어요! 하얀 새끼요!'],
  shepherd: ['양은 목자의 목소리를 알아들어요.', '물이 있는 곳에 풀이 있고, 풀이 있는 곳에 양이 있지요.', '밤에 늑대가 울면 잠을 설쳐요.', '어린양은 품에 안고 가야 해요.'],
  hunter: ['바람을 등지고 다가가야 짐승이 냄새를 못 맡소.', '새벽에 가젤이 물 마시러 내려오지.', '활시위는 마른 힘줄로 매야 오래 가오.'],
  oldwoman: ['아이고, 우리 손주 같구먼.', '따뜻한 죽 한 그릇이 보약이지.', '젊을 때 부지런히 일해 두면 늙어서 편하다오.'],
};
const LIKES = { farmer: ['bread', 'cheese', 'stew'], water: ['flower', 'oil', 'fig'], potter: ['bread', 'roast', 'clay'], weaver: ['wool', 'thread', 'flower'], merchant: ['cheese', 'oil', 'honey'], elder: ['herb', 'honey', 'stew'],
  child: ['flower', 'fig', 'honey', 'feather'], shepherd: ['bread', 'cheese', 'milk'], hunter: ['roast', 'bread', 'sinew'], oldwoman: ['herb', 'fig', 'stew', 'flower'] };
function greet(S, n) {
  const h = hourOf(S), Wx = G.Weather, k = Wx ? Wx.kind(S) : 'clear', nm = hero(S), fr = friend(n.id);
  const w = { rain: ['비가 오니 밭이 좋아하겠구려.', '이런, 흠뻑 젖으셨구려!'], storm: ['이런 날엔 집에 있어야지요! 하늘이 무섭게 울어요.'], wind: ['바람이 세서 장막 끈을 단단히 매야겠소.'], dust: ['모래바람이오! 옷깃으로 입을 가리시오.'], fog: ['안개가 짙어 바로 앞도 안 보이네요.'], cloudy: ['구름이 잔뜩 꼈네요. 비가 오려나?'] }[k];
  const t = h < 10 ? [`좋은 아침이오, ${nm}!`, '일찍 나오셨구려.', '아침 이슬이 촉촉하네요.'] : h < 15 ? ['해가 뜨겁소. 그늘에서 좀 쉬어 가오.', `${nm}, 점심은 드셨소?`, '한낮이라 일하기가 힘드네요.'] : h < 19.6 ? ['벌써 해가 기우네요.', '오늘 하루도 수고 많았소.', `${nm}, 저녁 먹고 가시오.`] : ['밤이 깊었소. 들짐승 조심하시오.', '별이 참 많구려.'];
  const close = fr >= 6 ? [`오, 내 친구 ${nm}!`, `${nm}! 기다렸다오.`] : fr >= 3 ? [`${nm}, 또 보는구려!`] : [];
  return rnd([].concat(close, close, w && Math.random() < 0.6 ? w : [], t));
}
const friend = id => { const S = Sf(); return (S.fr && S.fr[id]) || 0; };
function addFriend(n, k, quiet) { const S = Sf(); S.fr = S.fr || {}; const o = S.fr[n.id] || 0; S.fr[n.id] = clamp(o + k, 0, 10); if (!quiet && Math.floor(S.fr[n.id]) > Math.floor(o)) G.UI.toast(`${n.name}와(과) 더 가까워졌어요 ${'♥'.repeat(Math.min(5, Math.ceil(S.fr[n.id] / 2)))}`); }
// what villagers say about the hero's life
function remarks(S, n) {
  const P = Game.P, out = [], f = Game.feat('surv') && S.surv ? S.surv : null;
  if (f && f.food < 35) out.push(['hungry', '얼굴이 핼쑥하구려. 제대로 먹고 다니시오?']);
  if (Game.feat('warm') && S.surv && S.surv.warm < 40) out.push(['cold', '입술이 파래졌소! 불 곁에 가서 몸 좀 녹이시오.']);
  if (P.ride) out.push(['ride', P.ride.m.sp === 'camel' ? '낙타라니! 큰 부자가 되셨구려.' : '나귀가 참 순하게 생겼구려. 이름이 뭐요?']);
  if (G.Build && (S.bld || []).some(b => b.k === 'house')) out.push(['house', '들판에 흙벽돌 집을 지은 사람이 당신이오? 솜씨가 좋던데!']);
  else if ((S.bld || []).length) out.push(['built', '당신이 지은 것을 봤소. 손재주가 좋구려.']);
  if (G.Build && G.Build.homePens(S).some(p => S.herds[p.id] && S.herds[p.id].list.length)) out.push(['herd', '가축을 키운다면서요? 구유 물은 매일 갈아 주시오.']);
  if (S.hero && S.hero.lvl >= 5) out.push(['strong', '팔뚝을 보니 들짐승도 무서워하겠소.']);
  return out;
}
function rumor(S, n) { const EP = EPf(); const own = EP.rumors ? EP.rumors(S, n) : []; const gen = ['요즘 들에 늑대가 자주 나타난다더군요. 밤길 조심하시오.', '남쪽에서 대상이 지나갔는데, 향품 냄새가 온 길에 가득했소.', '어제는 새끼 양이 셋이나 태어났다지 뭐요.', '저 언덕 너머 상수리나무 숲에는 사슴이 산다오.', '비가 오면 시냇물이 불어나니 건널 때 조심하시오.'];
  return rnd(own.length && Math.random() < 0.7 ? own : gen); }

// =================================================================== REQUESTS (generated side quests)
const REQ = {
  farmer: [['straw', 4], ['stone', 5], ['branch', 6], ['clay', 3]], water: [['clay', 3], ['reed', 4], ['flower', 3], ['fig', 3]], potter: [['clay', 6], ['wood', 2], ['branch', 5]], weaver: [['wool', 4], ['flax', 3], ['thread', 1]],
  merchant: [['wool', 6], ['cheese', 2], ['cloth', 1], ['oil', 1]], elder: [['herb', 2], ['bread', 1], ['honey', 1], ['fig', 4]], child: [['flower', 3], ['fig', 2], ['feather', 2]], shepherd: [['hay', 4], ['herb', 2], ['bread', 2], ['K', 'wolf', 2]],
  hunter: [['meat', 2], ['hide', 2], ['sinew', 1], ['K', 'hare', 2], ['K', 'boar', 1], ['K', 'gazelle', 1]], oldwoman: [['herb', 2], ['fig', 3], ['milk', 2]],
};
const WHY = { straw: '지붕을 새로 이으려고', stone: '담장이 무너져서', branch: '불 땔 나무가 다 떨어져서', clay: '항아리를 빚으려고', reed: '바구니를 엮으려고', flower: '딸아이 혼례 화관을 만들려고', fig: '손님 대접을 하려고', wood: '가마에 불을 넣으려고',
  wool: '겨울 겉옷을 지으려고', flax: '세마포를 짜려고', thread: '천을 마저 짜려고', cheese: '대상에게 팔려고', cloth: '새 장막을 만들려고', oil: '등잔에 넣으려고', herb: '무릎이 쑤셔서', bread: '앓아누운 이웃에게 주려고', honey: '목이 칼칼해서',
  feather: '깃털 모자를 만들려고', hay: '새끼 양들 먹이려고', meat: '잔치를 하려고', hide: '신발을 지으려고', sinew: '활시위가 끊어져서', milk: '아기에게 먹이려고' };
const ANIM_N = { wolf: '늑대', hare: '들토끼', boar: '멧돼지', gazelle: '가젤', partridge: '자고새', deer: '사슴' };
const dq = S => S.dq || (S.dq = {});
function regQuest(id, d) {
  const EP = EPf(), L = G.Life; EP.quests = EP.quests || {}; const it = d.item && Game.ITEMS[d.item];
  const obj = d.kill ? [{ t: (S2, G2, st) => `${ANIM_N[d.kill] || d.kill} 사냥 (${Math.min(d.n, L.killsSince(st, d.kill))}/${d.n})`, ok: (S2, G2, st) => L.killsSince(st, d.kill) >= d.n }]
    : [{ t: (S2, G2) => `${it ? it.n : d.item} ${Math.min(d.n, G2.inv(d.item))}/${d.n}`, ok: (S2, G2) => G2.have(d.item, d.n) }];
  EP.quests[id] = { title: d.title, giver: d.giver, desc: d.desc, obj, dyn: true, when: () => false, take: d.kill ? null : { [d.item]: d.n }, reward: { silver: d.silver, xp: d.xp },
    prog: `${d.short}: "${d.kill ? '사냥은 잘 되어 가오?' : (it ? it.n : '') + ' 구하는 건 어떻게 됐소?'}"`.replace(/^[^:]+: /, ''),
    done: [{ n: d.name, t: d.kill ? '정말 잡아 왔구려! 이제 마음 놓고 지내겠소. 고맙소!' : `${it ? it.n : ''}을(를) 가져왔구려! 정말 고맙소. 약소하지만 받아 주시오.` }],
    finish: (S2) => { delete dq(S2)[id]; delete EP.quests[id]; const n = Game.ENT.npcs[d.giver]; if (n) addFriend(n, 3); } };
}
function makeRequest(n, S) {
  const role = n.d.folk ? n.d.folk.role : n.d.stranger === 'hunter' ? 'hunter' : n.d.stranger === 'shepherd' ? 'shepherd' : null; const pool = REQ[role]; if (!pool) return null;
  if (Object.keys(dq(S)).length >= 2 || Object.values(dq(S)).some(q => q.giver === n.id)) return null;
  const r = rnd(pool), kill = r[0] === 'K', item = kill ? null : r[0], cnt = kill ? r[2] : r[1];
  if (!kill && !Game.ITEMS[item]) return null; const short = n.name.split(' ').pop();
  const val = kill ? 14 * cnt : Game.ITEMS[item].p * cnt; const silver = Math.round(val * 1.5 + 6 + Math.random() * 6);
  const id = 'dq' + (S.dqN = (S.dqN || 0) + 1);
  const d = { giver: n.id, name: n.name, short, item, kill: kill ? r[1] : null, n: cnt, silver, xp: 12 + cnt * 2, title: `${short}의 부탁`, desc: kill ? `${ANIM_N[r[1]]}이(가) 가축을 해쳐요` : `${WHY[item] || '쓸 데가 있어서'} ${Game.ITEMS[item].n}이(가) 필요해요` };
  return { id, d, line: kill ? `요즘 ${ANIM_N[r[1]]} 때문에 골치가 아프오. ${cnt}마리만 잡아 주면 은 ${silver}을 드리리다.` : `${WHY[item] || '쓸 데가 있어서'} ${Game.ITEMS[item].n} ${cnt}개가 필요한데… 구해다 주면 은 ${silver}을 드리리다.` };
}
function acceptRequest(rq) { const S = Sf(); dq(S)[rq.id] = rq.d; regQuest(rq.id, rq.d); G.Life.accept(rq.id); }

// =================================================================== STRANGERS
const ST = AI.ST = {
  beggar: { n: '구걸하는 사람', sit: true, where: 'road', life: 330, call: ['젊은이… 먹을 것 좀 나눠 주시오…', '한 푼만… 사흘을 굶었소…'], persona: '가뭄에 밭과 양을 다 잃고 길가에서 구걸하는 늙은 남자. 지치고 서글프지만 친절에 깊이 감사한다.' },
  hunter: { n: '떠돌이 사냥꾼', prop: 'bow', where: 'wild', wander: 9, life: 300, call: ['쉿! 짐승이 놀라겠소.', '거기 젊은이, 사냥하러 왔소?'], persona: '들에서 혼자 사냥하며 사는 무뚝뚝하지만 정 많은 사냥꾼. 짐승의 습성과 들판의 지형을 잘 안다.' },
  traveler: { n: '나귀 탄 나그네', mount: 'donkey', pack: 0x8a6a48, where: 'road', travel: true, life: 260, call: ['여보시오, 젊은이! 길 좀 물읍시다.', '평안하시오, 나그네 양반!'], persona: '여러 성읍을 오가며 소식을 전하는 나그네. 이집트, 다메섹, 갈대아 우르 같은 먼 곳 이야기를 즐겨 한다.' },
  caravan: { n: '이스마엘 대상', mount: 'camel', where: 'road', travel: true, train: 2, life: 300, call: ['향품 사시오! 길르앗의 유향이오!', '좋은 물건 구경하고 가시오!'], persona: '낙타에 향품과 유향과 몰약을 싣고 길르앗에서 이집트로 가는 이스마엘 사람 상인. 흥정을 좋아하고 말솜씨가 좋다.' },
  shepherd: { n: '떠돌이 목자', prop: 'staff', where: 'wild', wander: 6, flock: 4, life: 320, call: ['여기 풀이 좋구려!', '내 양 못 보셨소?'], persona: '풀과 물을 따라 양 떼를 몰고 다니는 순박한 목자. 양 한 마리 한 마리의 이름을 다 안다.' },
  elder: { n: '지팡이 짚은 노인', prop: 'staff', where: 'road', travel: true, slow: true, life: 320, call: ['젊은이, 옛이야기 하나 들어 보겠소?', '쉬어 가며 이야기나 합시다.'], persona: '아브라함 시절부터 전해 내려오는 이야기를 많이 아는 나이 지긋한 노인. 하나님을 경외하며 젊은이를 아낀다.' },
  wounded: { n: '다친 나그네', sit: true, where: 'road', life: 280, call: ['아이고… 다리를 다쳤소… 도와주시오…'], persona: '길에서 넘어져 다리를 다친 젊은 나그네. 아프지만 씩씩하려 애쓴다.' },
  waterwoman: { n: '물동이 진 여인', where: 'road', travel: true, life: 240, call: ['목이 마르면 물 한 모금 드시오.'], persona: '먼 우물에서 물을 길어 집으로 가는 상냥한 여인. 근처 우물과 샘을 잘 안다.' },
};
const TALES = [
  { title: '고향을 떠난 아브라함', t: '오래전, 여호와께서 아브람에게 이르셨소. "너는 너의 고향과 친척과 아버지의 집을 떠나 내가 네게 보여 줄 땅으로 가라. 내가 너로 큰 민족을 이루고 네게 복을 주리라." 아브람은 갈 바를 알지 못하고 길을 떠났다오.', ref: '창세기 12:1–4' },
  { title: '하늘의 뭇별', t: '자식이 없어 슬퍼하던 아브람을 하나님이 밖으로 이끌어 내셨소. "하늘을 우러러 뭇별을 셀 수 있나 보라. 네 자손이 이와 같으리라." 아브람이 여호와를 믿으니, 여호와께서 이를 그의 의로 여기셨다오.', ref: '창세기 15:5–6' },
  { title: '마므레의 세 나그네', t: '한낮 더위에 아브라함이 장막 문에 앉았다가 세 나그네를 보고 달려 나가 절하며 맞았소. 발 씻을 물과 떡과 송아지 요리를 대접했지. 그들은 사라가 아들을 낳으리라 전했다오. 나그네를 대접하다가 하나님의 사자를 만난 게요.', ref: '창세기 18:1–10' },
  { title: '브엘세바의 우물', t: '아브라함이 판 우물을 아비멜렉의 종들이 빼앗은 일이 있었소. 아브라함은 다투지 않고 암양 새끼 일곱을 주어 그 우물이 자기 것임을 증언하게 했지. 그래서 그곳 이름이 브엘세바, "맹세의 우물"이라오. 그리고 거기 에셀나무를 심었소.', ref: '창세기 21:25–33' },
  { title: '여호와 이레', t: '하나님이 아브라함을 시험하셨소. 사랑하는 아들 이삭을 데리고 모리아 산에 올랐지. 이삭이 "불과 나무는 있는데 어린양은 어디 있나이까?" 묻자, 아브라함이 답했소. "하나님이 자기를 위하여 친히 준비하시리라." 정말로 덤불에 걸린 숫양이 있었다오.', ref: '창세기 22:1–14' },
];
const NEWS = ['남쪽 이집트 땅에는 큰 강이 있어서 해마다 넘쳐 들판을 적신다더군.', '다메섹 대상이 향품을 잔뜩 싣고 북쪽으로 올라갔소.', '갈대아 우르에서 왔다는 노인을 만났는데, 그 땅 신전 탑이 하늘에 닿을 듯 높다더군.', '소돔과 고모라가 있던 들은 아직도 소금 냄새가 난다오. 무서운 곳이지.',
  '요단 동편 길르앗에는 유향나무가 많아서 향이 좋소.', '브엘세바 우물 물맛이 제일이라던데, 정말이오?', '세일 산 쪽에 사냥 잘하는 붉은 털의 사내가 산다더군. 사백 명을 거느렸다던가.', '하란 장터에서는 점박이 양이 귀하다오.'];
let stN = 0, stT = 45;
function strangerLook(type) { const EP = EPf(), L = (EP.strangers && EP.strangers.looks) || {}; return L[type] || L.default || { skin: 0xc0885a, top: 0x8a7a60, trim: 0x4a3a2a, hair: 0x3a2a1a, headwear: 'cloth', clothCol: 0xb8a888, bandCol: 0x3a2a1a }; }
function roadPath(S, len) {
  const EP = EPf(), P = Game.P, roads = EP.roads || []; let best = null, bd = 60;
  for (let ri = 0; ri < roads.length; ri++) { const r = roads[ri]; for (let i = 0; i < r.length - 1; i++) { const a = r[i], b = r[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz || 1; const t = clamp(((P.x - a[0]) * vx + (P.z - a[1]) * vz) / L2, 0, 1); const x = a[0] + vx * t, z = a[1] + vz * t, d = Math.hypot(P.x - x, P.z - z); if (d < bd) { bd = d; best = { ri, i, t, x, z }; } } }
  if (!best) return null; const r = roads[best.ri];
  // densify the polyline, then walk from `len` metres one way to `len` metres the other way
  const pts = []; for (let i = 0; i < r.length - 1; i++) { const a = r[i], b = r[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 4)); for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } pts.push(r[r.length - 1].slice());
  let ci = 0, cd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p[0] - best.x, p[1] - best.z); if (d < cd) { cd = d; ci = i; } });
  const dir = Math.random() < 0.5 ? 1 : -1; const out = []; let i0 = ci, acc = 0; while (i0 - dir >= 0 && i0 - dir < pts.length && acc < len) { acc += Math.hypot(pts[i0][0] - pts[i0 - dir][0], pts[i0][1] - pts[i0 - dir][1]); i0 -= dir; }
  for (let i = i0, a2 = 0; i >= 0 && i < pts.length && a2 < len * 2.2; i += dir) { out.push(pts[i]); if (out.length > 1) a2 += Math.hypot(pts[i][0] - out[out.length - 2][0], pts[i][1] - out[out.length - 2][1]); }
  return out.length > 3 ? { pts: out, near: best } : null;
}
function okGround(x, z) { const W = Game.W(), wl = W.water ? W.water.level : -99; return W.heightAt(x, z) > wl + 0.4 && W.slopeAt(x, z) < 0.35 && Math.max(Math.abs(x), Math.abs(z)) < W.half - 25; }
function inVillage(x, z) { for (const v of EPf().villages || []) if (Math.hypot(x - v.x, z - v.z) < v.r + 25) return true; const EP = EPf(); return EP.settled ? EP.settled(x, z) : false; }
function spawnStranger(S) {
  const EP = EPf(), P = Game.P, cfg = EP.strangers || {}; const arid = EP.aridAt ? EP.aridAt(P.x, P.z) : 0.3;
  const w = Object.assign({ beggar: 1, hunter: 1.1, traveler: 1.3, caravan: 0.5 + arid, shepherd: 1.2 - arid * 0.6, elder: 0.7, wounded: 0.45, waterwoman: 0.8 - arid * 0.4 }, cfg.weights ? cfg.weights(S) : {});
  for (const s of AI.strangers) w[s.type] = (w[s.type] || 0) * 0.15; if (S.flags.taleN >= TALES.length) w.elder *= 0.3;
  let tot = 0; for (const k in w) tot += Math.max(0, w[k]); let r = Math.random() * tot, type = 'traveler'; for (const k in w) { r -= Math.max(0, w[k]); if (r <= 0) { type = k; break; } }
  const T = ST[type]; let x, z, path = null, face = 0;
  if (T.where === 'road') { const rp = roadPath(S, T.travel ? 62 : 34); if (!rp) return;
    if (T.travel) { path = rp.pts; x = path[0][0]; z = path[0][1]; }
    else { const p = rp.pts[rp.pts.length - 1 - Math.floor(rp.pts.length * 0.2)]; const p2 = rp.pts[Math.max(0, rp.pts.length - 2 - Math.floor(rp.pts.length * 0.2))]; const ang = Math.atan2(p[0] - p2[0], p[1] - p2[1]) + PI / 2; x = p[0] + Math.sin(ang) * 2.6; z = p[1] + Math.cos(ang) * 2.6; face = ang + PI; } }
  else { const ca = Game.CAM.yaw + PI; let tries = 0; do { const a = ca + (Math.random() - 0.5) * 2.2, d = 30 + Math.random() * 22; x = P.x + Math.sin(a) * d; z = P.z + Math.cos(a) * d; tries++; } while (tries < 8 && (!okGround(x, z) || (EP.roadD && EP.roadD(x, z) < 4))); if (tries >= 8) return; }
  if (!okGround(x, z) || inVillage(x, z) || Math.hypot(x - P.x, z - P.z) < 18) return;
  const id = 'stg' + (++stN), name = T.n, d = { id, name, look: strangerLook(type), x, z, face, prop: T.prop, mount: T.mount, pack: T.pack, stranger: type, sit: T.sit, persona: T.persona, rider: false, noRide: true, talkR: T.mount ? 3.2 : 2.6, walkSp: T.slow ? 1.1 : 1.6 };
  const n = Game.spawnNPC(d); n.trav = true; if (T.sit) n.act = 'sitg';
  const s = { id, type, life: T.life, path, called: false, followers: [] };
  if (T.travel && path) Game.npcWalk(id, path[path.length - 1][0], path[path.length - 1][1], () => { s.arrived = true; }, T.mount === 'camel' ? 2.4 : T.mount ? 2.6 : T.slow ? 1.1 : 1.6, path.slice(1, -1));
  if (T.wander) n.wander = { r: T.wander, cx: x, cz: z, tx: null, wait: 2 };
  if (T.train) for (let k = 0; k < T.train; k++) { const fid = id + 'c' + k; Game.spawnNPC({ id: fid, name: '대상의 낙타', animal: 'camel', extra: { saddle: [0x8a5a3a, 0x6a4a2a][k % 2] }, x: x - Math.sin(face) * (3 + k * 3), z: z - Math.cos(face) * (3 + k * 3), noTalk: true, noTag: true }); s.followers.push(fid); }
  if (type === 'caravan') { const did = id + 'd'; Game.spawnNPC({ id: did, name: '낙타 몰이꾼', look: strangerLook('driver'), x: x + 1.5, z: z + 1.5, prop: 'staff', noTalk: true, noTag: true }); s.followers.push(did); }
  if (T.flock) for (let k = 0; k < T.flock; k++) { const fid = id + 's' + k; const sx = x + (Math.random() - 0.5) * 6, sz = z + (Math.random() - 0.5) * 6; Game.spawnNPC({ id: fid, name: '목자의 양', animal: 'sheep', pattern: k === 2 ? 'black' : 'plain', x: sx, z: sz, wander: 4, noTalk: true, noTag: true }); s.followers.push(fid); }
  AI.strangers.push(s); return s;
}
function despawn(s) { for (const f of s.followers) Game.removeNPC(f); Game.removeNPC(s.id); AI.strangers = AI.strangers.filter(x => x !== s); }
function strangers(dt, S) {
  const P = Game.P, EP = EPf(), cfg = EP.strangers;
  for (const s of AI.strangers.slice()) { const n = Game.ENT.npcs[s.id]; if (!n) { despawn(s); continue; } s.life -= dt; const d = Math.hypot(n.x - P.x, n.z - P.z);
    if ((s.arrived || s.life <= 0 || s.done) && !n.talking) { if (d > 45 || s.arrived && d > 30) { despawn(s); continue; } if (s.done && !n.walk && !s.leaving) { s.leaving = true; const a = Math.atan2(n.x - P.x, n.z - P.z); Game.npcWalk(s.id, n.x + Math.sin(a) * 70, n.z + Math.cos(a) * 70, () => { s.arrived = true; }, 1.8); n.sit = false; } }
    if (d > 150) { despawn(s); continue; }
    // caravan camels and drivers walk behind the leader, the flock drifts after its shepherd
    s.ft = (s.ft || 0) - dt; if (s.ft <= 0) { s.ft = 0.35; s.followers.forEach((fid, k) => { const f = Game.ENT.npcs[fid]; if (!f) return;
      if (f.d.animal === 'sheep') { if (f.wander) { f.wander.cx = n.x + Math.cos(k * 1.7) * 2.5; f.wander.cz = n.z + Math.sin(k * 1.7) * 2.5; } return; }
      const back = 3.2 + k * 3.1, tx = n.x - Math.sin(n.face) * back + (f.d.animal ? 0 : Math.cos(n.face) * 1.4), tz = n.z - Math.cos(n.face) * back - (f.d.animal ? 0 : Math.sin(n.face) * 1.4);
      if (Math.hypot(tx - f.x, tz - f.z) > 0.9) { f.walk = { x: tx, z: tz, sp: Math.min(4, Math.max(n.aspd || 0, 1) * 1.15 + Math.hypot(tx - f.x, tz - f.z) * 0.3), solid: false, stuck: 0 }; } }); }
    if (!s.called && d < 13 && !n.talking && !G.UI.busy() && Math.random() < dt * 0.4) { s.called = true; G.Life.bubble(s.id, rnd(ST[s.type].call), 3); }
  }
  stT -= dt; if (stT > 0) return; stT = 40 + Math.random() * 45;
  if (!cfg || (cfg.when && !cfg.when(S)) || AI.strangers.length >= (cfg.max || 2) || G.UI.busy() || Game.cineOn || (G.Combat && G.Combat.inCombat)) return;
  if (inVillage(P.x, P.z) || (EP.quiet && EP.quiet(S))) return;
  spawnStranger(S);
}

// =================================================================== TALK
AI.talk = function (n) {
  if (n.d.lambOf) { n.talking = false; if (!n.follow) { Game.npcFollow(n.id, true); sfx('bleat'); G.UI.toast('어린양을 안았어요 · 목자에게 데려가요'); } return true; }
  if (n.d.folk) { folkTalk(n); return true; }
  if (n.d.stranger) { strangerTalk(n); return true; }
  return false;
};
const freeOK = () => !!AI.sample && AI.sampleOK;
function endTalk(n) { return () => { n.talking = false; G.UI.lastTalk = performance.now(); }; }
function giftChoice(n, after) {
  const S = Sf(), likes = LIKES[n.d.folk ? n.d.folk.role : 'elder'] || [];
  const items = Object.keys(S.inv).filter(k => S.inv[k] > 0 && Game.ITEMS[k] && ['food', 'gift', 'crop', 'good', 'mat'].includes(Game.ITEMS[k].cat)).sort((a, b) => (likes.includes(b) ? 1 : 0) - (likes.includes(a) ? 1 : 0) || Game.ITEMS[b].p - Game.ITEMS[a].p).slice(0, 4);
  if (!items.length) { say([{ n: '', t: '줄 만한 것이 없어요. 꽃이나 열매, 빵 같은 것을 가져와 보세요.' }], after); return; }
  say([{ n: '', t: '무엇을 줄까요?', choices: items.map(k => ({ t: `${Game.ITEMS[k].n} (${S.inv[k]})`, then: () => { Game.take(k); G.Deeds && G.Deeds.rec('share', n); const liked = likes.includes(k); addFriend(n, liked ? 3 : 1.2);
    setTimeout(() => say([{ n: n.name, t: liked ? rnd(['어머나, 이건 내가 제일 좋아하는 거예요! 정말 고마워요.', '이걸 어떻게 알았소? 내가 이걸 참 좋아하는데!']) : rnd(['고맙소. 마음 써 줘서.', '이런 것까지… 잘 받겠소.']) }], after), 30); } })).concat([{ t: '그만두기', then: () => setTimeout(after, 30) }]) }]);
}
function folkTalk(n) {
  const S = Sf(), f = n.d.folk; n.talking = true;
  const daily = S.flags['ft:' + n.id] !== S.day; if (daily) { S.flags['ft:' + n.id] = S.day; addFriend(n, 0.5, true); }
  const intro = daily && friend(n.id) < 1 ? (f.role === 'child' ? ` 내 이름은 ${n.name.split(' ').pop()}예요!` : ` 나는 ${n.village ? n.village.n + '에 사는 ' : ''}${n.name.split(' ').pop()}라 하오.`) : '';
  say([{ n: n.name, t: greet(S, n) + intro + (G.Deeds ? G.Deeds.remark(n) : '') }], () => folkMenu(n)); // v18.0 P6: a neighbour mentions what they saw or heard
}
function folkMenu(n) {
  const S = Sf(), f = n.d.folk, fin = endTalk(n);
  const opts = [
    { t: '요즘 어떻게 지내요?', then: () => setTimeout(() => say([{ n: n.name, t: rnd(SMALL[f.role] || SMALL.farmer) }], () => folkMenu(n)), 30) },
    { t: '무슨 소식 있어요?', then: () => setTimeout(() => say([{ n: n.name, t: rumor(S, n) }], () => folkMenu(n)), 30) },
  ];
  if (freeOK()) opts.unshift({ t: '자유롭게 이야기하기 ✦', then: () => setTimeout(() => AI.freeTalk(n), 30) });
  else opts.push({ t: '이 마을은 어떤 곳이에요?', then: () => setTimeout(() => say([{ n: n.name, t: n.village && n.village.about ? rnd(n.village.about) : '조용하고 살기 좋은 곳이라오.' }], () => folkMenu(n)), 30) });
  opts.push({ t: '선물 주기', then: () => setTimeout(() => giftChoice(n, () => folkMenu(n)), 30) });
  if (!Object.values(dq(S)).some(q => q.giver === n.id) && Object.keys(dq(S)).length < 2) opts.push({ t: '도울 일 있어요?', then: () => setTimeout(() => offerReq(n, () => folkMenu(n)), 30) });
  opts.push({ t: '잘 지내요!', then: () => setTimeout(fin, 10) });
  say([{ n: hero(S), t: '(무슨 이야기를 할까?)', choices: opts }]);
}
function offerReq(n, after) {
  const S = Sf(), rq = makeRequest(n, S);
  if (!rq) { say([{ n: n.name, t: rnd(['지금은 괜찮소. 마음만이라도 고맙구려.', '도와줄 일이 생기면 꼭 부르리다.']) }], after); return; }
  say([{ n: n.name, t: rq.line, choices: [{ t: `맡을게요 · ${rq.d.title}`, then: () => { acceptRequest(rq); setTimeout(after, 30); } }, { t: '다음에요', then: () => setTimeout(after, 30) }] }]);
}

// stranger conversations
function strangerTalk(n) {
  const S = Sf(), type = n.d.stranger, s = AI.strangers.find(x => x.id === n.id) || {}, fin = () => { endTalk(n)(); }, T = ST[type], nm = hero(S);
  n.talking = true; if (n.walk && !n.d.sit) { s.resume = { x: n.walk.x, z: n.walk.z, path: n.walk.path, sp: n.walk.sp }; n.walk = null; }
  const back = () => { fin(); if (s.resume && !s.done) { const r = s.resume; s.resume = null; Game.npcWalk(n.id, r.x, r.z, () => { s.arrived = true; }, r.sp, r.path); } };
  const free = freeOK() ? [{ t: '자유롭게 이야기하기 ✦', then: () => setTimeout(() => AI.freeTalk(n, back), 30) }] : [];
  const bye = { t: '평안히 가세요', then: () => setTimeout(back, 10) };
  const food = Object.keys(S.inv).filter(k => S.inv[k] > 0 && G.Surv && G.Surv.food(k) > 0).sort((a, b) => G.Surv.food(a) - G.Surv.food(b));
  const kind = (msg) => { S.stats.kind = (S.stats.kind || 0) + 1; if (S.stats.kind % 3 === 0 && Game.insight) setTimeout(() => Game.insight(1, '나그네를 대접함'), 600); s.done = true; G.UI.toast(msg || '따뜻한 마음을 나눴어요'); };
  if (type === 'beggar') {
    say([{ n: n.name, t: rnd(['젊은이… 가뭄에 밭도 양도 다 잃었다오. 먹을 것이 있거든 조금만 나눠 주시오.', '사흘을 굶었소… 부끄럽지만 도움을 청하오.']), choices: [].concat(
      food.length ? [{ t: `${Game.ITEMS[food[0]].n}을(를) 나눠 주기`, then: () => { Game.take(food[0]); setTimeout(() => say([{ n: n.name, t: `아… 고맙소, 정말 고맙소. 여호와께서 ${nm}에게 복을 주시기를!` }], () => { kind('가난한 이웃을 도왔어요'); back(); }), 30); } }] : [],
      S.silver >= 2 ? [{ t: '은 2세겔 주기', then: () => { Game.silver(-2); setTimeout(() => say([{ n: n.name, t: '이 은으로 빵을 사겠소. 이 은혜를 잊지 않으리다.' }], () => { kind(); back(); }), 30); } }] : [],
      [{ t: '어쩌다 이렇게 되셨어요?', then: () => setTimeout(() => say([{ n: n.name, t: '비가 세 해 동안 오지 않았소. 우물이 마르고 양들이 하나둘 쓰러졌지. 그래도 아직 숨이 붙어 있으니 감사할 일이오.' }], () => strangerTalk(n)), 30) }], free, [bye]) }]);
  } else if (type === 'wounded') {
    const heal = ['herb', 'bread', 'roast', 'stew', 'cheese'].filter(k => Game.have(k));
    say([{ n: n.name, t: '돌부리에 걸려 넘어졌는데 다리가 퉁퉁 부었소. 약초나 먹을 것이 있다면…', choices: [].concat(
      heal.length ? [{ t: `${Game.ITEMS[heal[0]].n}을(를) 주고 다리를 싸매 주기`, then: () => { Game.take(heal[0]); Game.P.act = 'gather'; Game.P.actT = 0; Game.P.actDur = 0.9; Game.P.actHits = 1; Game.P.fired = true;
        setTimeout(() => say([{ n: n.name, t: '훨씬 낫소! 당신은 참 좋은 사람이구려. 얼마 안 되지만 받아 주시오.' }], () => { Game.silver(8 + Math.floor(Math.random() * 8)); kind('다친 나그네를 도왔어요'); n.act = null; back(); }), 900); } }] : [{ t: '(약초를 찾아서 다시 와야겠다)', then: () => setTimeout(back, 10) }], free, [bye]) }]);
  } else if (type === 'traveler') {
    const pl = (EPf().places || []).filter(p => Math.hypot(p.x - Game.P.x, p.z - Game.P.z) > 50); const q = pl.length ? rnd(pl) : null;
    say([{ n: n.name, t: rnd(['먼 길을 왔더니 다리가 다 저리오.', '평안하시오! 이 길로 사흘을 왔소.']), choices: [].concat(
      [{ t: '어디서 오셨어요? (소식 듣기)', then: () => setTimeout(() => say([{ n: n.name, t: rnd(NEWS) }], () => strangerTalk(n)), 30) }],
      q && !s.asked ? [{ t: '길을 물어보신다고요?', then: () => { s.asked = true; setTimeout(() => askWay(n, q, () => strangerTalk(n)), 30); } }] : [],
      [{ t: '물건을 좀 보여 주세요', then: () => setTimeout(() => { regShops(); G.UI.shop('stg_trav'); fin(); }, 30) }], free, [bye]) }]);
  } else if (type === 'caravan') {
    say([{ n: n.name, t: '길르앗에서 이집트로 가는 길이오. 향품과 유향과 몰약을 싣고 가지! 좋은 값에 사고팔리다.', ref: '창세기 37:25 참고', choices: [].concat(
      [{ t: '물건 보기 (사고팔기)', then: () => setTimeout(() => { regShops(); G.UI.shop('stg_car'); fin(); }, 30) }, { t: '이집트는 어떤 곳이에요?', then: () => setTimeout(() => say([{ n: n.name, t: '큰 강 나일이 해마다 넘쳐 땅이 기름지다오. 흉년이 들면 온 세상이 곡식을 사러 이집트로 간다지.' }], () => strangerTalk(n)), 30) }], free, [bye]) }]);
  } else if (type === 'hunter') {
    const z = nearestWild(); say([{ n: n.name, t: rnd(['조용히 하시오. 짐승은 귀가 밝소.', '오늘은 발자국이 많구려.']), choices: [].concat(
      [{ t: '사냥 비결이 있나요?', then: () => setTimeout(() => say([{ n: n.name, t: z ? `여기서 ${z.dir}쪽 ${z.d}걸음쯤 가면 ${z.names}이(가) 다니는 곳이 있소. 바람을 등지고 살금살금 다가가시오.` : '바람을 등지고 다가가고, 물매는 짐승이 멈췄을 때 쏘는 거요.' }], () => strangerTalk(n)), 30) }],
      [{ t: '거래해요', then: () => setTimeout(() => { regShops(); G.UI.shop('stg_hunt'); fin(); }, 30) }], [{ t: '도울 일 있어요?', then: () => setTimeout(() => offerReq(n, () => strangerTalk(n)), 30) }], free, [bye]) }]);
  } else if (type === 'shepherd') {
    const lost = s.lamb && Game.ENT.npcs[s.lamb];
    say([{ n: n.name, t: lost ? (lost.follow ? '아이고, 내 어린양! 찾아 주었구려!' : '어린양 한 마리가 아직 안 보이오…') : rnd(['풀이 좋은 곳을 찾아 이리저리 다니는 중이오.', '양들이 물을 마실 샘을 찾고 있소.']), choices: [].concat(
      lost && lost.follow ? [{ t: '여기 있어요!', then: () => { G.Deeds && G.Deeds.rec('honest', n); Game.removeNPC(s.lamb); s.lamb = null; Game.silver(10); kind('잃은 양을 찾아 주었어요'); setTimeout(() => say([{ n: n.name, t: '아흔아홉 마리보다 이 한 마리가 더 기쁘구려. 고맙소!' }], back), 30); } }] : [],
      !s.lamb && !s.lambDone ? [{ t: '양을 잃어버리셨어요?', then: () => { s.lambDone = true; spawnLamb(n, s); setTimeout(() => say([{ n: n.name, t: '어린양 한 마리가 무리에서 떨어졌소. 저쪽 덤불 근처에서 울음소리가 났는데… 찾아서 안아다 주겠소?' }], back), 30); } }] : [],
      [{ t: '양 치는 건 어때요?', then: () => setTimeout(() => say([{ n: n.name, t: rnd(SMALL.shepherd) }], () => strangerTalk(n)), 30) }], free, [bye]) }]);
  } else if (type === 'elder') {
    const i = S.flags.taleN || 0, tale = TALES[i % TALES.length];
    say([{ n: n.name, t: i >= TALES.length ? '내 이야기를 다 들었구려. 이제 그대가 아이들에게 전해 주시오.' : '앉으시오. 우리 조상 아브라함 이야기를 들려주리다.', choices: [].concat(
      [{ t: i >= TALES.length ? '한 번 더 들려주세요' : '이야기 듣기', then: () => setTimeout(() => { Game.P.sit = true; G.UI.narr([{ kick: '노인의 옛이야기', title: tale.title, t: tale.t, ref: tale.ref }], () => { Game.P.sit = false; if (i < TALES.length) { S.flags.taleN = i + 1; if (Game.insight) Game.insight(1, tale.title); } say([{ n: n.name, t: '하나님은 약속하신 것을 반드시 지키신다오. 잊지 마시오.' }], back); }); }, 30) }], free, [bye]) }]);
  } else if (type === 'waterwoman') {
    const jar = Game.tool('jar') || Game.tool('bigjar');
    say([{ n: n.name, t: '먼 우물에서 물을 길어 오는 길이에요. 목마르지 않으세요?', choices: [].concat(
      [{ t: '물 한 모금 얻어 마시기', then: () => { const P = Game.P, H = S.hero; P.stam = (H && H.stamMax) || 100; if (S.surv) S.surv.food = Math.min(100, S.surv.food + 3); setTimeout(() => say([{ n: n.name, t: '천천히 드세요. 물은 생명이지요.' }], () => strangerTalk(n)), 30); } }],
      jar && S.water < S.jarMax ? [{ t: '항아리에 물 좀 나눠 주세요', then: () => { S.water = Math.min(S.jarMax, S.water + 4); G.UI.hud(); setTimeout(() => say([{ n: n.name, t: '조금이지만 보태 드릴게요.' }], () => strangerTalk(n)), 30); } }] : [],
      [{ t: '가까운 우물이 어디예요?', then: () => { const w = nearestWell(); setTimeout(() => say([{ n: n.name, t: w ? `여기서 ${w.dir}쪽으로 ${w.d}걸음쯤 가면 우물이 있어요. 지도에 표시해 드릴게요.` : '이 근처엔 우물이 없어요. 강가로 가 보세요.' }], () => { if (w) { S.wp = { x: w.x, z: w.z, n: '우물' }; G.UI.toast('지도에 우물을 표시했어요'); } strangerTalk(n); }), 30); } }], free, [bye]) }]);
  } else say([{ n: n.name, t: '평안하시오.' }], back);
}
const DIRN = (dx, dz) => { const a = Math.atan2(dx, -dz); const i = Math.round(a / (PI / 4)); return ['북', '북동', '동', '남동', '남', '남서', '서', '북서'][(i + 8) % 8]; };
function nearestWell() { const P = Game.P; let b = null, bd = 1e9; for (const s of EPf().stations || []) { if (s.type !== 'well') continue; const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd) { bd = d; b = s; } } return b ? { x: b.x, z: b.z, d: Math.round(bd), dir: DIRN(b.x - P.x, b.z - P.z) } : null; }
function nearestWild() { const P = Game.P, S = Sf(); let b = null, bd = 1e9; for (const z of EPf().wildZones || []) { if (z.on && !z.on(S)) continue; const d = Math.hypot(z.x - P.x, z.z - P.z); if (d < bd) { bd = d; b = z; } }
  if (!b) return null; const AN = { gazelle: '가젤', hare: '들토끼', partridge: '자고새', wolf: '늑대', boar: '멧돼지', deer: '사슴', ibex: '산양', bear: '곰', lion: '사자' };
  return { d: Math.round(bd), dir: DIRN(b.x - P.x, b.z - P.z), names: b.sp.filter(x => !x[2]).slice(0, 2).map(x => AN[x[0]] || x[0]).join('와(과) ') }; }
function askWay(n, q, after) {
  const P = Game.P, right = DIRN(q.x - P.x, q.z - P.z).slice(0, 1), opts = ['동', '서', '남', '북'];
  say([{ n: n.name, t: `${q.n}(으)로 가려면 어느 쪽으로 가야 하오? (지도를 보면 알 수 있어요)`, choices: opts.map(o => ({ t: `${o}쪽이에요`, then: () => setTimeout(() => { const ok = o === right || DIRN(q.x - P.x, q.z - P.z).includes(o);
    if (ok) { const r = 4 + Math.floor(Math.random() * 5); Game.silver(r); say([{ n: n.name, t: `고맙소! 덕분에 헤매지 않겠구려. 이건 길 안내 값이오. (은 ${r})` }], after); } else say([{ n: n.name, t: '흠… 해가 뜨는 쪽이 동쪽이라던데, 그쪽이 맞소? 내가 다시 알아보리다.' }], after); }, 30) })) }]);
}
function spawnLamb(n, s) { const a = Math.random() * PI * 2, x = n.x + Math.cos(a) * 26, z = n.z + Math.sin(a) * 26; if (!okGround(x, z)) return; const id = s.id + 'L'; Game.spawnNPC({ id, name: '길 잃은 어린양', animal: 'sheep', pattern: 'plain', scale: 0.55, x, z, wander: 2, label: '안아 데려가기', lambOf: s.id }); s.lamb = id; s.followers.push(id); G.UI.toast('어린양을 찾아 목자에게 데려가 주세요'); }
// a carried lamb that is brought close to its shepherd is handed back by talking to him
function lambs() { }
// shops of strangers
const SHOPS = {
  stg_trav: { n: '나그네의 짐 보따리', sells: ['crop', 'food', 'mat'], mul: { crop: 1.1 }, buy: [{ n: '빵 ×2', item: 'bread', qty: 2, price: 18 }, { n: '무화과 ×4', item: 'fig', qty: 4, price: 10 }, { n: '밀 씨앗 ×5', item: 's_wheat', qty: 5, price: 12 }, { n: '양파 씨앗 ×5', item: 's_onion', qty: 5, price: 13 }] },
  stg_car: { n: '이스마엘 대상', sells: ['good', 'crop', 'hunt', 'rare'], mul: { good: 1.35, rare: 1.2, hunt: 1.1 }, buy: [{ n: '향품', item: 'spice', qty: 1, price: 40, d: '장터에 비싸게 팔 수 있어요' }, { n: '유향', item: 'balm', qty: 1, price: 55, d: '길르앗의 귀한 향유' }, { n: '몰약', item: 'myrrh', qty: 1, price: 70 }, { n: '석청 ×2', item: 'honey', qty: 2, price: 30 }, { n: '모직 천', item: 'cloth', qty: 1, price: 46 }] },
  stg_hunt: { n: '떠돌이 사냥꾼', sells: ['hunt', 'food'], mul: { hunt: 1.25, food: 1.1 }, buy: [{ n: '화살 ×10', item: 'arrow', qty: 10, price: 15 }, { n: '구운 고기 ×2', item: 'roast', qty: 2, price: 26 }, { n: '힘줄 ×2', item: 'sinew', qty: 2, price: 12 }] },
};
function regShops() { const EP = EPf(); EP.shops = EP.shops || {}; for (const k in SHOPS) EP.shops[k] = SHOPS[k]; }
Object.assign(Game.ITEMS, { spice: { n: '향품', cat: 'good', p: 34, ic: 'sack', c: '#c8783a' }, balm: { n: '유향', cat: 'good', p: 46, ic: 'oil', c: '#e0c060' }, myrrh: { n: '몰약', cat: 'good', p: 58, ic: 'oil', c: '#a0502a' } });

// =================================================================== VILLAGE CHATTER & APPROACHES
const CHAT2 = [
  [[0, '오늘 장터에 사람이 많더군.'], [1, '보리 값이 좀 올랐다지요?']], [[0, '어젯밤 늑대 소리 들었소?'], [1, '들었지요. 양 우리 문을 단단히 걸어야겠어요.']],
  [[0, '비가 좀 와야 할 텐데.'], [1, '구름이 몰려오는 걸 보니 곧 오겠지요.']], [[0, '저 사람이 그 야곱이라지요?'], [1, '부지런하다고 소문이 자자하던데요.']],
  [[0, '우리 아이가 벌써 양을 몰아요.'], [1, '세월 참 빠르네요.']], [[0, '올리브기름 좀 빌려줄 수 있소?'], [1, '저녁에 항아리째 가져가시오.']],
  [[0, '하몰 어른 댁에 손님이 왔다던데?'], [1, '멀리 하란 쪽에서 온 사람들이래요.']], [[0, '이 그릇 좀 봐요. 금이 갔어요.'], [1, '토기장이 집에 가 보시오. 새로 빚어 줄 거요.']],
];
const SOLO = { farmer: ['에구구, 허리야…', '올해 농사도 잘 되어야 할 텐데.'], child: ['까르르!', '잡아 봐라~!', '나 찾아봐라!'], water: ['영차!', '물이 참 시원하네.'], elder: ['흐음…', '좋은 날이로구나.'], merchant: ['자, 싱싱한 무화과요!', '보리 사시오, 보리!'], shepherd: ['훠어이~ 이리 와!'], potter: ['조금만 더 둥글게…'], weaver: ['한 올, 또 한 올…'], hunter: ['오늘은 가젤을 잡아야지.'], oldwoman: ['아이고 다리야.'] };
let ctT = 6; const chatQ = { run: null };
function villageChatter(dt, S) {
  const P = Game.P;
  if (chatQ.run) { const r = chatQ.run; r.t -= dt; if (r.t <= 0) { if (r.i >= r.lines.length) { chatQ.run = null; return; } const [w, txt] = r.lines[r.i]; const id = w === 0 ? r.a.id : r.b.id; const n = w === 0 ? r.a : r.b, o = w === 0 ? r.b : r.a;
    G.Life.bubble(id, txt.replace('야곱', hero(S)), 3.4); if (!n.walk) n.face = Math.atan2(o.x - n.x, o.z - n.z); r.i++; r.t = 3.3; } return; }
  ctT -= dt; if (ctT > 0) return; ctT = 8 + Math.random() * 9; if (G.UI.busy() || Game.cineOn) return;
  const list = Object.values(Game.ENT.npcs).filter(n => n.vis && n.near && n.d.folk && !n.talking && !n.walk && !n.schedHidden && Math.hypot(n.x - P.x, n.z - P.z) < 24);
  const pairs = []; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (Math.hypot(list[i].x - list[j].x, list[i].z - list[j].z) < 5) pairs.push([list[i], list[j]]);
  if (pairs.length && Math.random() < 0.75) { const [a, b] = rnd(pairs); const pool = (EPf().villageChat ? EPf().villageChat(S) : []).concat(CHAT2); chatQ.run = { a, b, lines: rnd(pool), i: 0, t: 0 }; return; }
  if (list.length) { const n = rnd(list); const pool = SOLO[n.d.folk.role]; if (pool) G.Life.bubble(n.id, rnd(pool), 2.6); }
}
const ap = { t: 35, cur: null, cool: {} };
AI.quietNow = function (S) {
  const P = Game.P, EP = EPf(), st = Game.step();
  if (G.UI.busy() || Game.cineOn || (G.Combat && G.Combat.inCombat) || P.spd > 4.6 || P.act || (G.Build && G.Build.placing) || (G.Life.approaching && G.Life.approaching())) return true;
  if ((st && st.quiet) || (EP.quiet && EP.quiet(S))) return true;
  if (performance.now() - (G.UI.lastTalk || 0) < 35000) return true;
  const tg = Game.curTarget; if (tg && !tg.wp && st && st.target && Math.hypot(tg.x - P.x, tg.z - P.z) < 40) return true; // heading for the story objective
  return false;
};
function approach(dt, S) {
  const P = Game.P, ENT = Game.ENT;
  if (ap.cur) { const a = ap.cur, n = ENT.npcs[a.id]; if (!n || !n.vis) { ap.cur = null; return; } a.t -= dt; const d = Math.hypot(n.x - P.x, n.z - P.z);
    if (G.UI.busy() || (G.Combat && G.Combat.inCombat) || a.t <= 0 || d > 30 || P.spd > 5.5) { n.walk = null; n.schedSlot = -1; ap.cur = null; return; }
    if (d < 2.2) { n.walk = null; ap.cur = null; n.face = Math.atan2(P.x - n.x, P.z - n.z); P.face = Math.atan2(n.x - P.x, n.z - P.z); n.talking = true; Game.dlgNpc = n; visit(n, a.kind, S); return; }
    a.rt -= dt; if (a.rt <= 0) { a.rt = 0.5; const k = 1.6 / Math.max(1, d); Game.npcWalk(a.id, P.x + (n.x - P.x) * k, P.z + (n.z - P.z) * k, null, n.d.folk && n.d.folk.age === 'kid' ? 2.8 : 2.2); delete S.npcPos[a.id]; }
    return; }
  ap.t -= dt; if (ap.t > 0) return; const mode = Game.SET.chatty || 'some'; ap.t = mode === 'often' ? 14 + Math.random() * 16 : 34 + Math.random() * 34; if (mode === 'off') return;
  if (AI.quietNow(S)) return; const now = S.day * 24 + S.time;
  const pool = Object.values(ENT.npcs).filter(n => n.d.folk && n.vis && n.near && !n.talking && !n.walk && !n.schedHidden && !n.pass && (ap.cool[n.id] || 0) < now && (() => { const d = Math.hypot(n.x - P.x, n.z - P.z); return d > 3.5 && d < 17; })());
  if (!pool.length) return; const n = rnd(pool); ap.cool[n.id] = now + 5 + Math.random() * 5;
  const rm = remarks(S, n), fr = friend(n.id), f = n.d.folk; const kinds = [['hello', 3], ['news', 2], ['gift', fr >= 3 ? 2 : 0.6], ['req', Object.keys(dq(S)).length < 2 ? 1.6 : 0], ['remark', rm.length ? 2.6 : 0], ['kid', f.age === 'kid' ? 4 : 0]];
  let tot = 0; for (const k of kinds) tot += k[1]; let r = Math.random() * tot, kind = 'hello'; for (const k of kinds) { r -= k[1]; if (r <= 0) { kind = k[0]; break; } }
  ap.cur = { id: n.id, kind, t: 18, rt: 0 }; n.sit = false; n.act = null; n.wander = null; G.Life.bubble(n.id, f.age === 'kid' ? rnd(['형아!', '아저씨!', '야곱 아저씨!']) : rnd([`${hero(S)}!`, `여보게, ${hero(S)}!`, '잠깐만요!']), 2.4); sfx('blip', { vol: 0.6, pitch: 1.3 });
}
function visit(n, kind, S) {
  const f = n.d.folk, fin = () => { endTalk(n)(); n.schedSlot = -1; }, nm = hero(S);
  if (kind === 'gift') { const opts = (LIKES[f.role] || []).concat(['fig', 'bread', 'milk', 'cheese']).filter(k => Game.ITEMS[k] && Game.ITEMS[k].cat === 'food'); const it = rnd(opts.length ? opts : ['bread']), cnt = Game.ITEMS[it].p < 6 ? 3 : 1;
    say([{ n: n.name, t: rnd([`${nm}, 이것 좀 받으시오. 오늘 넉넉히 만들었거든.`, '지난번에 고마웠어요. 이거 드세요!', '빈손으로 보내면 섭섭해서 그래요. 가져가요.']) }, { n: nm, t: '이렇게 고마울 수가!', fn: () => Game.give(it, cnt) }], fin); addFriend(n, 0.5, true); return; }
  if (kind === 'req') { const rq = makeRequest(n, S); if (rq) { say([{ n: n.name, t: `${nm}, 부탁이 하나 있는데… ${rq.line}`, choices: [{ t: `맡을게요 · ${rq.d.title}`, then: () => acceptRequest(rq) }, { t: '지금은 바빠서요', reply: '미안해요, 다음에 꼭 도울게요.' }] }], fin); return; } kind = 'hello'; }
  if (kind === 'remark') { const rm = rnd(remarks(S, n)); const lines = [{ n: n.name, t: rm[1] }];
    if (rm[0] === 'hungry') lines.push({ n: n.name, t: '자, 이거라도 드시오. 배가 든든해야 일도 하지.', fn: () => { Game.give(rnd(['bread', 'fig', 'cheese']), 1); } });
    if (rm[0] === 'cold') lines.push({ n: n.name, t: '추울 땐 양털 겉옷이 최고요. 베틀에서 짠 천에 양털을 덧대면 된다오.' });
    if (rm[0] === 'ride' && Game.feat('ride2')) lines.push({ n: n.name, t: '아이들이 태워 달라고 조를 거요. 하하!' });
    say(lines, fin); return; }
  if (kind === 'kid') { const P = Game.P; const lines = P.ride && Game.feat('ride2') ? [{ n: n.name, t: '나귀 태워 주세요! 딱 한 번만요, 네?' }, { n: '', t: '(가까이 가서 「태우기」를 누르면 뒤에 태울 수 있어요)' }]
      : [{ n: n.name, t: rnd(['같이 놀아요! 내가 술래 할게요!', '이거 봐요! 예쁜 돌 주웠어요!', '아저씨는 어디서 왔어요? 하란? 거기 멀어요?', '우리 엄마가 아저씨 착한 사람이래요!']) }];
    if (Game.have('flower') || Game.have('fig') || Game.have('honey')) lines.push({ n: nm, t: '(무언가 줄까?)', choices: [{ t: '선물 주기', then: () => setTimeout(() => giftChoice(n, fin), 30) }, { t: '머리를 쓰다듬어 준다', reply: '착하지. 엄마 말씀 잘 들어라.', then: () => addFriend(n, 0.6, true) }] });
    say(lines, () => { if (!G.UI.busy()) fin(); }); return; }
  if (kind === 'news') { say([{ n: n.name, t: `${nm}, 그 소식 들었소?` }, { n: n.name, t: rumor(S, n) }], fin); return; }
  // hello: greeting, then let the player decide
  say([{ n: n.name, t: greet(S, n) }, { n: n.name, t: rnd(SMALL[f.role] || SMALL.farmer) }], () => folkMenu(n));
}

// =================================================================== FREE TALK (Claude)
let chatState = null;
function persona(n, S) {
  const EP = EPf(), f = n.d.folk, hr = hourOf(S), Wx = G.Weather; const tod = hr < 5 ? '한밤중' : hr < 10 ? '아침' : hr < 15 ? '한낮' : hr < 19.5 ? '저녁 무렵' : '밤';
  const who = f ? `${n.name} — ${n.village ? n.village.n + '에 사는 ' : ''}${ROLE_N[f.role] || f.role}${f.age === 'kid' ? ' (어린아이)' : f.age === 'old' ? ' (노인)' : ''}. ${f.persona || ''}` : `${n.name}. ${n.d.persona || ''}`;
  const facts = (EP.worldFacts ? EP.worldFacts(S) : '') + (G.Deeds ? G.Deeds.note(n) : ''); const fr = friend(n.id);
  return `너는 창세기 시대(기원전 1900~1700년경) 가나안·메소포타미아 땅에 사는 사람을 연기한다. 지금부터 말하는 상대는 ${hero(S)}이다.
[너의 정체] ${who}
[지금] ${tod}, 날씨: ${Wx ? Wx.name(S) : '맑음'}. 장소: ${n.village ? n.village.n : '들판의 길가'}. ${hero(S)}와 너의 사이: ${fr >= 6 ? '아주 친한 친구' : fr >= 3 ? '안면이 있는 이웃' : '처음 보거나 잘 모르는 사이'}.
[${hero(S)}에 대해 사람들이 아는 것] ${facts}
[말하는 법]
- 한국어 구어체, 1~3문장으로 짧게. 따뜻하고 소박한 그 시대 사람의 말투(예: "~하오", "~구려", "~지요"). 아이는 아이답게.
- 그 시대에 없던 물건·개념(돈 단위는 은 세겔, 기계, 나라 이름 등)은 모른다. 현대 이야기를 물으면 어리둥절해한다.
- 성경에 없는 큰 사건을 지어내지 않는다. 모르는 일은 모른다고 한다. 하나님은 "하나님" 또는 "여호와"라고 부른다.
- 어린이가 읽어도 좋은 말만 한다. 폭력·잔인함·연애·무서운 이야기를 청하면 부드럽게 다른 이야기로 돌린다.
- 욕설·비속어·조롱·모욕은 절대 쓰지 않는다. 못마땅하거나 화가 나도 걱정·서운함·꾸짖음 정도의 부정적인 말을 정중한 말투로만 한다(예: "그건 좀 서운하구려.", "조심해 주시오.").
- 너는 AI가 아니라 이 사람이다. 역할에서 벗어나지 말고, 해설이나 따옴표 없이 대답할 말만 쓴다.`;
}
function chatUI(on) { const el = $('chat'); if (!el) return; el.hidden = !on; G.UI.setBusy('chat', on); if (on) setTimeout(() => { try { $('chIn').focus({ preventScroll: true }); } catch (e) { } }, 60); }
function chatAdd(who, text, cls) { const d = document.createElement('div'); d.className = 'c-msg ' + (cls || ''); d.innerHTML = `<b></b><span></span>`; d.firstChild.textContent = who; d.lastChild.textContent = text; $('chLog').appendChild(d); $('chLog').scrollTop = 1e6; return d.lastChild; }
AI.freeTalk = function (n, after) {
  const S = Sf(); n.talking = true; chatState = { n, turns: [], busy: false, after: after || null, ctl: null, n0: S.stats.chats || 0 };
  $('chName').textContent = n.name; $('chSub').textContent = freeOK() ? '무엇이든 말을 걸어 보세요' : ''; $('chLog').innerHTML = ''; $('chNote').textContent = '';
  chatAdd(n.name, greet(S, n), 'npc'); chips(); chatUI(true);
};
function chips() { const n = chatState && chatState.n; if (!n) return; const T = ['요즘 어떻게 지내요?', '이 근처에 무엇이 있어요?', '하나님을 믿어요?', '가장 소중한 게 뭐예요?', '저에 대해 들은 게 있어요?', '재미있는 이야기 해 주세요'];
  $('chChips').innerHTML = T.sort(() => Math.random() - 0.5).slice(0, 3).map(t => `<button type="button">${t}</button>`).join(''); }
async function send(text) {
  const st = chatState; if (!st || st.busy) return; text = String(text || '').trim().slice(0, 140); if (!text) return; const S = Sf(), n = st.n;
  chatAdd(hero(S), text, 'me'); $('chIn').value = ''; st.turns.push({ role: 'user', content: `${hero(S)}: ${text}` });
  if (!freeOK()) { const r = fallback(n, text, S); st.turns.push({ role: 'assistant', content: r }); chatAdd(n.name, r, 'npc'); return; }
  st.busy = true; $('chSend').disabled = true; const out = chatAdd(n.name, '…', 'npc'); AI.speaking = n; const ctl = new AbortController(); st.ctl = ctl;
  const turns = st.turns.slice(-12); const input = [{ role: 'user', content: persona(n, S) + '\n\n(대화를 시작한다. 아래부터는 상대의 말이다.)' }].concat(turns);
  try { const r = await AI.sample(input, { modelTier: 'quick', cache: false, signal: ctl.signal, onText: ({ text: t }) => { out.textContent = clean(t); $('chLog').scrollTop = 1e6; } });
    const t = clean(r.text); out.textContent = t; st.turns.push({ role: 'assistant', content: t }); S.stats.chats = (S.stats.chats || 0) + 1; if (st.turns.length === 2) addFriend(n, 0.6, true); }
  catch (e) { const code = e && e.code; if (code === 'cancelled') { out.textContent = e.text ? clean(e.text) : '…'; }
    else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) { AI.sampleOK = false; out.textContent = fallback(n, text, S); $('chNote').textContent = '자유 대화를 쓸 수 없어서 준비된 이야기로 대답해요'; }
    else if (code === 'rate_limited') { out.textContent = e.text ? clean(e.text) : '(잠시 숨을 고르는 듯해요…)'; $('chNote').textContent = '말을 너무 많이 걸었나 봐요. 조금 있다가 다시 이야기해요.'; st.turns.pop(); }
    else if (code === 'refused') { out.textContent = '음… 그런 이야기는 잘 모르겠구려. 다른 이야기를 합시다.'; st.turns.pop(); }
    else { out.textContent = e && e.text ? clean(e.text) : '(바람 소리에 말이 잘 안 들려요. 다시 말해 보세요)'; st.turns.pop(); } }
  finally { st.busy = false; $('chSend').disabled = false; AI.speaking = null; chips(); }
}
const clean = t => String(t || '').replace(/^[\s"'“”]+|[\s"'“”]+$/g, '').replace(/^[^:\n]{1,14}:\s*/, '').replace(/[*#_`]/g, '').slice(0, 400);
function fallback(n, text, S) {
  const f = n.d.folk, role = f ? f.role : n.d.stranger; const t = text;
  if (/하나님|여호와|기도|믿/.test(t)) return rnd(['하나님은 하늘과 땅을 지으신 분이라오. 그분 앞에서 정직하게 사는 게 제일이지요.', '아브라함의 하나님 말이오? 약속을 지키시는 분이라 들었소.']);
  if (/어디|근처|길|우물/.test(t)) { const w = nearestWell(); return w ? `${w.dir}쪽으로 ${w.d}걸음쯤 가면 우물이 있소.` : '이 근처는 나도 잘 모르오.'; }
  if (/이야기|재미/.test(t)) return rnd(TALES).t.slice(0, 120) + '…';
  if (/소중|가족|사랑/.test(t)) return rnd(['내 가족이지요. 저녁에 함께 둘러앉아 먹는 빵 한 조각이 제일 행복하오.', '건강한 몸과 정직한 마음이오.']);
  if (/나|저에 대해|소문|들은/.test(t)) return rumor(S, n);
  return rnd(SMALL[role] || SMALL.elder);
}
function closeChat() { const st = chatState; if (!st) return; if (st.ctl) try { st.ctl.abort(); } catch (e) { } chatUI(false); st.n.talking = false; G.UI.lastTalk = performance.now(); const a = st.after; chatState = null; if (a) a(); }
if ($('chForm')) { $('chForm').addEventListener('submit', e => { e.preventDefault(); send($('chIn').value); }); $('chX').onclick = closeChat;
  $('chChips').addEventListener('click', e => { const b = e.target.closest('button'); if (b) send(b.textContent); }); $('chat').addEventListener('pointerdown', e => { if (e.target === $('chat')) closeChat(); }); }
AI.chatOpen = () => !!chatState;
AI.busyId = () => ap.cur ? ap.cur.id : null;
AI._spawn = S => spawnStranger(S); AI._approach = () => { ap.t = 0; };

// =================================================================== HOOKS
AI.reset = function (S) {
  for (const s of AI.strangers.slice()) { try { despawn(s); } catch (e) { } } AI.strangers = []; ap.cur = null; ap.t = 40; chatQ.run = null; stT = 50;
  const EP = EPf(); if (EP.quests) for (const k in EP.quests) if (EP.quests[k].dyn) delete EP.quests[k];
  for (const id in dq(S)) { if (S.side && S.side.act && S.side.act[id]) regQuest(id, dq(S)[id]); else delete dq(S)[id]; }
  regShops(); if (chatState) closeChat();
};
AI.onDay = function (S) { for (const k in ap.cool) delete ap.cool[k]; };
AI.update = function (dt, t) {
  const S = Sf(); if (!S || Game.mode !== 'play') return; if (Game.cineOn) return;
  villageChatter(dt, S); approach(dt, S); strangers(dt, S); lambs();
};
AI.skinned = function () { };
})(window.G);
