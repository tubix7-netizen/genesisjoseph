/* 약속의 길 — 바다 건너 갑돌 섬 (v18.50)
   갑돌은 서쪽 큰 바다 한가운데의 섬이에요(크레타). 성경에는 「갑돌 섬」(렘 47:4), 「갑돌에서 나온 블레셋 사람」(암 9:7)으로 나와요.
   애굽 사람들은 이 섬 사람들을 「케프티우」라 불렀고, 요셉 무렵 이미 이 섬의 얇고 고운 토기가 애굽까지 건너왔어요.
   · 요셉이 총리가 된 뒤(c5_patrol부터) 나일 강 북쪽 나루, 그발 배 곁에 갑돌 배 선장 카르파가 와 있어요. 말을 걸면 배를 타고 섬으로 가요.
   · 섬: 항구와 돌 부두, 물가 장터, 붉은 기둥의 궁전(성벽이 없어요), 소 뛰어넘기를 하는 안마당, 큰 항아리가 줄지어 선 서쪽 창고(미로),
     황소와 재주 넘는 젊은이 벽화 · 돌고래 벽화, 올리브 숲 · 포도밭 · 사프란 꽃밭, 뒤로는 이다 산, 앞바다엔 돌고래가 뛰어요.
   · 할 일: 궁의 청지기 다미와 교역(세마포나 곡식 셋 → 올리브기름 · 갑돌 토기 · 은), 서기 이다가 잃어버린 인장 셋 찾기(창고 미로),
     소녀 레나의 소 뛰어넘기 박자 맞춰 주기(하루 한 번), 도공 키라의 가게, 벽화 보기. 발자취에 「바다 건너」 묶음이 생겨요.
   · 그발(js/byblos.js)과 같은 방식이에요: 지도 밖 높은 곳에 무대를 세워 두고, 섬에 있는 동안에는 애굽 땅 대신 섬의 땅·건물·바다만 그려요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.Byblos) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(sub ? t + ' · ' + sub : t);
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const vz = () => after('c5_patrol');
const BX = -120, BZ = 95, BY = 64, SEA = BY - 1.3, PH = 1.0; // the stage (inside the map's walkable square ±234 with its sea; far from Byblos's); PH = the palace terrace
const inKf = () => { const s = S(); return !!(s && s.flags && s.flags.kaftor) && !(G.DW && G.DW.on && G.DW.on()); }; /* v18.51 not while dreaming */
const Q = { x: -104.4, z: -71.7 }; // v18.52 on the Byblos pier, beside the south ship
Object.assign(Game.ITEMS, { kfPot: { n: '갑돌 토기', cat: 'good', p: 70, ic: 'bowl', c: '#2a2a3a' }, saffron: { n: '사프란', cat: 'good', p: 40, ic: 'flower', c: '#d86a2a' }, kfSeal: { n: '갑돌 인장', cat: 'key', p: 0, ic: 'stone', c: '#e5b552' } });
EP.shops = EP.shops || {};
EP.shops.kfShop = { n: '도공 키라', sells: ['good', 'crop', 'food'], no: ['kfPot', 'saffron', 'oil'], mul: { good: 1.3, crop: 1.1 }, buy: [{ n: '갑돌 토기', item: 'kfPot', qty: 1, price: 52, d: '달걀 껍질처럼 얇은 그릇 · 애굽에서 비싸게 팔려요' }, { n: '올리브기름 ×2', item: 'oil', qty: 2, price: 26 }, { n: '사프란', item: 'saffron', qty: 1, price: 30, d: '꽃 수술을 말린 귀한 물감이자 약' }, { n: '석청', item: 'honey', qty: 1, price: 16 }].filter(x => Game.ITEMS[x.item]) };
(EP.places = EP.places || []).push({ n: '나일 나루 · 갑돌 가는 배', x: Q.x, z: Q.z, when: () => vz() });
/* the other modules ask G.Byblos.inBy() for 「overseas」 (no cart, no horse, no letters, no auto-walk, the Nile does not rise …): the island counts too.
   byblos.js itself uses its own closure, so Byblos's stage is not drawn here. */
{ const ib0 = G.Byblos.inBy; G.Byblos.inBy = () => ib0() || inKf(); }

// ------------------------------------------------------------------ people
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
const tint = (b, o) => Object.assign({}, b || {}, o);
const KFN = [];
function person(d) { d.show = d.show || (() => inKf()); d.noBond = true; EP.npcs.push(d); KFN.push(d.id); return d; }
const L0 = lookOf('bySidon') || lookOf('byEdom') || lookOf('ct_fish'), LF = lookOf('byWoman') || lookOf('ct_wea') || L0;
const CAP = '갑돌 배 선장 카르파';
person({ id: 'kfSail', name: CAP, look: tint(L0, { top: 0x1f5a8a, trim: 0xe0b040, beard: 'short' }), x: BX + 10, z: BZ - 41.5, face: 0, talkR: 3 });
person({ id: 'kfCapE', name: CAP, look: tint(L0, { top: 0x1f5a8a, trim: 0xe0b040, beard: 'short' }), x: Q.x, z: Q.z, face: Math.PI / 2, talkR: 3, show: () => !inKf() && vz() });
person({ id: 'kfSteward', name: '궁의 청지기 다미', look: tint(L0, { top: 0xe8dcc0, trim: 0xa8322a, hair: 0xd8d0c8, beard: 'short', age: 'old' }), x: BX + 8.2, z: BZ + 27.6, face: -Math.PI / 2, talkR: 3 }); /* under the colonnade, clear of the fresco */
person({ id: 'kfScribe', name: '궁의 서기 이다', look: tint(L0, { top: 0x2c6a8a, trim: 0xe8dcc0 }), x: BX - 7.2, z: BZ + 22.6, face: Math.PI / 2, talkR: 3 });
person({ id: 'kfLeaper', name: '소 뛰어넘는 레나', look: tint(LF, { top: 0xc8402a, trim: 0x1f5a8a }), x: BX - 3, z: BZ + 15.5, face: 0.4, wander: 2.5, talkR: 3 });
person({ id: 'kfBull', name: '궁의 황소', animal: 'cow', scale: 1.15, x: BX + 4.5, z: BZ + 22, face: -1.2, wander: 2.5, noTalk: true, noTag: true });
person({ id: 'kfPotter', name: '도공 키라', look: tint(LF, { top: 0x2a5aa0, trim: 0xe0b040 }), x: BX - 9, z: BZ - 20.4, face: Math.PI });
person({ id: 'kfFisher', name: '갑돌 어부 토스', look: tint(L0, { top: 0x8a6a4a }), x: BX - 24, z: BZ - 27, face: Math.PI, wander: 4, prop: 'fishrod', chat: ['돌고래들이 배를 따라와요. 바다의 벗이지요!', '문어는 바위틈에 숨어요. 그래서 우리 토기엔 문어 그림이 많아요.'] });
person({ id: 'kfOlive', name: '올리브 따는 메라', look: tint(LF, { top: 0x5a7a3a, trim: 0xe8dcc0 }), x: BX + 34, z: BZ + 18, face: 0.6, act: 'gather', chat: ['올리브기름은 우리 섬의 금이에요.', '기름을 큰 항아리에 담아 배에 실어요. 애굽까지 가지요.'] });
person({ id: 'kfKid', name: '갑돌 아이 키도', look: tint(L0, { top: 0xe8c040 }), x: BX + 6, z: BZ - 6, face: 0, wander: 6, scale: 0.62, chat: ['애굽 사람이다! 나일 강에 악어 진짜 있어요?', '돌고래 봤어요? 아침마다 항구 앞에서 뛰어놀아요!'] });
person({ id: 'kfGuard', name: '궁의 문지기', look: tint(L0, { top: 0xa8322a, trim: 0xe0b040 }), x: BX + 4.8, z: BZ + 4.6, face: Math.PI, prop: 'spear', chat: ['궁에 오신 것을 환영합니다! 우리 궁엔 성벽이 없어요. 바다가 지켜 주니까요.', '안마당에서 소 뛰어넘기를 연습해요. 구경해 보세요!'] });
person({ id: 'kfSaffron', name: '사프란 따는 아이 니사', look: tint(LF, { top: 0xe8a040 }), x: BX - 40, z: BZ + 19, face: 0.2, scale: 0.7, act: 'gather', chat: ['사프란 꽃은 가을에만 피어요. 수술 세 가닥만 따요!', '꽃 수술 한 줌을 모으려면 하루 종일 걸려요.'] });

// ------------------------------------------------------------------ the voyage
function canSail() { const p = P(), s = S(); if (p.ride) return '나귀에서 먼저 내려 주세요'; if (s.q && s.q.riding) return '수레에서 먼저 내려 주세요';
  if ((p.follow || []).length) return '함께 가는 사람이 있을 땐 배를 탈 수 없어요'; if ((G.Phys && G.Phys.held) || p.carry) return '들고 있는 것을 먼저 내려놓아요'; return null; }
function sail(toKf) { const why = canSail(); if (why) { pop('배를 탈 수 없어요', why, 'house'); return; } const s = S(), p = P();
  G.UI.fade(() => { if (s.q && s.q.cartPax && G.Cart && G.Cart.dropPax) try { G.Cart.dropPax(); } catch (e) { }
    s.time = Math.min((s.time || 8) + 4, 25); s.flags.kaftor = toKf ? 1 : 0; if (toKf) s.flags.byblos = 0; sync(true);
    if (toKf) { Game.teleport(BX + 10, BZ - 39.6, 0); p.y = p.airTop = BY; s.flags.kfMet = 1; } else { Game.teleport(Q.x + 1.4, Q.z + 0.5, Math.PI / 2); }
    sfx('splash', { vol: 0.5, pitch: 0.7 }); }, () => {
    if (toKf) { if (!(G.UI.help && G.UI.help('kaftor', '갑돌 섬', '서쪽 큰 바다 한가운데의 섬이에요 · 붉은 기둥의 궁전에 가 보세요 · 돌아갈 땐 부두의 선장 카르파에게'))) pop('갑돌 섬 도착!', '붉은 기둥의 궁전과 돌고래의 바다', 'house'); }
    else pop('애굽 도착!', '나일 강 북쪽 나루', 'house'); }); }

// ------------------------------------------------------------------ talking
const say = (l, cb) => G.UI.say(l, cb), Ln = (n, t) => ({ n, t });
const SEALS = [[-17.6, 0], [-17.6, 1], [-17.6, 2]]; // placed below (west ends of three storerooms)
const sealGot = s => (s.flags.kfSeals = s.flags.kfSeals || {});
const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(), done = () => { const n = Game.npc(id); if (n) n.talking = false; };
  if (id === 'kfCapE') { const h = s.time % 24; if (h > 20.5 || h < 5) { say([Ln(CAP, '밤바다는 섬사람도 겁내요. 날이 밝으면 오세요!')], done); return true; }
    const intro = s.flags.kfCap ? [] : [Ln(CAP, '애굽의 총리님! 저는 서쪽 바다 건너 갑돌 섬에서 온 선장 카르파예요.'), Ln(CAP, '애굽 사람들은 우리를 「케프티우」라고 부르지요. 우리 배가 기름과 토기를 싣고 애굽에 온답니다.')];
    s.flags.kfCap = 1; say(intro.concat([{ n: CAP, t: '우리 섬에 가 보시겠어요? 그발보다 먼 뱃길이지만, 바람이 좋으면 금방이에요.', choices: [{ t: '배 타고 갑돌 섬으로 가기', then: () => { done(); sail(true); } }, { t: '다음에요', then: done }] }]), done); return true; }
  if (id === 'kfSail') { say([{ n: CAP, t: '애굽으로 돌아가실까요?', choices: [{ t: '배 타고 애굽으로', then: () => { done(); sail(false); } }, { t: '조금 더 둘러볼게요', then: done }] }], done); return true; }
  if (id === 'kfPotter') { say([Ln('도공 키라', '어서 오세요! 달걀 껍질처럼 얇은 우리 토기예요. 애굽 사람들이 참 좋아하지요.')], () => { done(); G.UI.shop('kfShop'); }); return true; }
  if (id === 'kfSteward') { const D = '궁의 청지기 다미', fam = after('c6_open'), today = s.flags.kfTrade === s.day, li = (s.inv && s.inv.linen) || 0, gr = (s.inv && s.inv.grain) || 0;
    const first = s.flags.kfSt ? [] : [Ln(D, '애굽의 총리님이 우리 섬에! 저는 이 궁의 곳간을 맡은 다미라 합니다.'), Ln(D, '우리 섬은 바다로 먹고살아요. 기름과 토기를 배에 실어 애굽과 그발로 보내고, 세마포와 곡식을 받아 오지요.')];
    s.flags.kfSt = 1;
    const word = fam ? Ln(D, '흉년이 바다 건너 우리 섬까지 덮쳤어요. 애굽에 곡식이 있다는 소식이 아니었으면 어찌 되었을지…') : Ln(D, '애굽 세마포는 바다 건너에서도 귀하게 여겨요. 우리 궁의 옷은 모두 애굽 세마포로 지어요.');
    if (today) { say(first.concat([word, Ln(D, '오늘 받은 것은 잘 쓰겠어요. 내일 또 오세요!')]), done); return true; }
    const trade = (k, nm) => ({ t: `${nm} 3개 건네기`, then: () => { done(); Game.take(k, 3); s.flags.kfTrade = s.day; s.flags.kfTradeN = (s.flags.kfTradeN || 0) + 1; Game.give('oil', 3); Game.give('kfPot', 1); Game.silver(fam && k === 'grain' ? 40 : 20); const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 10); pop('갑돌과 교역했어요', `올리브기름 3 · 갑돌 토기 1 · 은 ${fam && k === 'grain' ? 40 : 20}`, 'star'); sfx('coins'); G.UI.hud(); } });
    const ch = []; if (li >= 3) ch.push(trade('linen', '세마포')); if (gr >= 3) ch.push(trade('grain', '곡식 자루'));
    if (ch.length) { ch.push({ t: '다음에요', then: done }); say(first.concat([word, { n: D, t: '세마포나 곡식 셋을 주시면, 기름과 우리 토기로 갚겠어요.', choices: ch }]), done); return true; }
    say(first.concat([word, Ln(D, '세마포나 곡식 자루 셋을 가져다주시면, 올리브기름과 갑돌 토기로 갚겠어요.')]), done); return true; }
  if (id === 'kfScribe') { const I = '궁의 서기 이다', g = sealGot(s), n = Object.keys(g).length;
    if (s.flags.kfSealDone) { say([Ln(I, '총리님이 찾아 주신 인장으로 오늘도 항아리를 봉했어요. 고맙습니다!'), Ln(I, '창고 항아리마다 누가 봉했는지 이 인장이 말해 주지요.')], done); return true; }
    if (n >= SEALS.length) { say([Ln(I, '찾으셨군요! 셋 다요!'), Ln(I, '이 인장이 없으면 항아리마다 누가 봉했는지 알 수 없어서, 곳간 셈이 엉망이 될 뻔했어요.'),
      Ln(I, '총리님도 바로의 인장 반지를 끼고 계시지요? 인장이 얼마나 무거운 것인지 아시겠군요.'), Ln(I, '고마운 마음으로 이걸 드릴게요. 총리님을 위해 새긴 갑돌 인장이에요.')], () => { done(); s.flags.kfSealDone = 1; Game.give('kfSeal', 1); Game.silver(40); if (Game.insight) Game.insight(1, '갑돌 인장'); pop('갑돌 인장을 받았어요', '은 40 · 깨달음 1', 'star'); sfx('coins'); G.UI.hud(); }); return true; }
    if (s.flags.kfSealQ) { say([Ln(I, `인장은 서쪽 창고 어딘가에 있을 거예요. (${n}/${SEALS.length})`), Ln(I, '창고 통로는 미로 같아요. 어떤 방은 옆방을 지나야만 들어갈 수 있어요.')], done); return true; }
    say([Ln(I, '아이고, 총리님… 큰일 났어요.'), Ln(I, '곳간 항아리를 봉하는 인장 셋을 잃어버렸어요. 서쪽 창고에서 항아리를 세다가 떨어뜨린 것 같은데…'),
      { n: I, t: '창고 통로가 미로 같아서 저 혼자서는 못 찾겠어요. 찾아 주시겠어요?', choices: [{ t: '찾아 줄게요', then: () => { s.flags.kfSealQ = 1; G.UI.quest && G.UI.quest(); pop('잃어버린 인장 셋', '궁 서쪽 창고 · 안마당 서쪽 문으로 들어가요', 'star'); } }, { t: '나중에요' }] }], done); return true; }
  if (id === 'kfLeaper') { const R = '소 뛰어넘는 레나', today = s.flags.kfLeapDay === s.day;
    if (today) { say([Ln(R, '오늘은 다리가 후들거려요! 내일 또 박자 맞춰 주세요.')], done); return true; }
    const intro = s.flags.kfLeapN ? [] : [Ln(R, '총리님! 소 뛰어넘기 보셨어요? 황소 뿔을 잡고 등 위로 재주를 넘는 거예요!'), Ln(R, '혼자 연습하면 박자를 놓쳐요. 황소가 달려올 때 「지금!」 하고 외쳐 주시면 그 박자에 뛸게요.')];
    say(intro.concat([{ n: R, t: '박자 맞춰 주실래요?', choices: [{ t: '박자 맞춰 주기', then: () => { done(); leap(); } }, { t: '다음에요', then: done }] }]), done); return true; }
  return lt0.apply(this, arguments); };
function leap() { const s = S(), n = Game.npc('kfLeaper'), b = Game.npc('kfBull');
  G.UI.minigame('wrestle', { title: '소 뛰어넘기 박자', need: 5, dur: 30, btn: '지금!', unit: '뛰어넘기', act: null, hint: '하얀 표시가 초록 구간에 들어올 때 「지금!」을 눌러요. 한가운데에 맞추면 멋진 공중제비예요!' }, () => {
    s.flags.kfLeapDay = s.day; const first = !s.flags.kfLeapN; s.flags.kfLeapN = (s.flags.kfLeapN || 0) + 1; const clean = G.UI.mgLast && G.UI.mgLast.miss === 0;
    if (n && G.Voice) { G.Voice.react(n, 'surprise'); setTimeout(() => G.Voice.react(n, 'laugh'), 1500); }
    if (n && G.FX) G.FX.burst(n.x, n.y + 1.6, n.z, 22, { c: [1, 0.85, 0.4], sp: 2.4, up: 2 });
    for (const id of ['kfGuard', 'kfScribe', 'kfSteward']) { const m = Game.npc(id); if (m && m.vis) setTimeout(() => G.Life.bubble(id, pickOne(['와아아!', '멋지다, 레나!', '황소보다 높이 날았어!']), 2.2), 400 + Math.random() * 900); }
    const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 15); if (first) Game.silver(15);
    setTimeout(() => say([Ln('소 뛰어넘는 레나', clean ? '한 번도 안 놓쳤어요! 총리님 박자는 바닷바람처럼 딱딱 맞아요!' : '해냈어요! 황소 등 위로 붕 날았어요!')], () => { pop('소 뛰어넘기 응원', `정신력 +15${first ? ' · 은 15' : ''}`, 'star'); G.UI.hud(); }), 900);
    if (b) b.face += 0.6; }); }
const pickOne = a => a[Math.floor(Math.random() * a.length)];

// chatter between the islanders
const TALK = [['돌고래가 오늘도 항구에 왔어!', '배를 따라온 거야. 좋은 바람이 불겠네.'], ['궁에서 또 소 뛰어넘기를 한대.', '레나가 올해 제일 잘 뛴다지?'], ['애굽 총리님이 오셨대!', '칠 년 풍년을 미리 아셨다는 그분?'], ['올리브가 올해 많이 열렸네.', '기름 항아리가 모자라겠어.'], ['문어 그림 토기가 다 팔렸어요.', '애굽 배가 다 사 갔지 뭐예요.'], ['이다 산 꼭대기에 구름이 걸렸네.', '저녁엔 비가 오겠어요.']];
let tT = 0; const cool = {};
function chatter(dt) { tT -= dt; if (tT > 0) return; tT = 6 + Math.random() * 6; if (G.UI.busy()) return; const now = performance.now() / 1000, p = P();
  const ns = KFN.map(id => Game.npc(id)).filter(n => n && n.vis && !n.talking && !(n.d && n.d.animal) && Math.hypot(n.x - p.x, n.z - p.z) < 24);
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const a = ns[i], b = ns[j], k = a.id + b.id; if ((cool[k] || 0) > now || Math.hypot(a.x - b.x, a.z - b.z) > 8) continue; cool[k] = now + 80;
    const L = TALK[Math.floor(Math.random() * TALK.length)]; G.Life.bubble(a.id, L[0], 2.6); setTimeout(() => G.Life.bubble(b.id, L[1], 2.8), 1500); return; } }

// ------------------------------------------------------------------ the stage (built once with the world)
let STAGE = null; const COLS = [];
const GYP = 0xe2d8c2, GYP2 = 0xcabda2, OCHRE = 0xd6b98a, RED = 0xa8322a, BLK = 0x1e1a18, LEAF = 0x5f7a3e, CYP = 0x2e4a30;
/* the storerooms (west wing): a corridor, nine long rooms off it, big jars along one side. Rooms 3 and 6 have no door of their own:
   you reach them through a gap at the far end of the room beside them. */
const MAG = { x0: -18.6, x1: -12.6, z0: 6.6, z1: 33.4, n: 9 }, MW = (MAG.z1 - MAG.z0) / MAG.n, mz = k => MAG.z0 + (k + 0.5) * MW;
const NODOOR = { 3: 1, 6: 1 }, GAPS = { 3: 1, 7: 1 }; // GAPS[k]: an opening at the west end of the wall between room k-1 and room k
SEALS[0] = [-17.7, mz(3)]; SEALS[1] = [-17.7, mz(6)]; SEALS[2] = [-17.7, mz(8)];
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { if (STAGE) { STAGE.statics.forEach(m => G.R.free && G.R.free(m)); if (STAGE.sea && G.R.free) G.R.free(STAGE.sea.mesh); } COLS.length = 0; modeOn = null; STAGE = buildStage(W); buildQuaySide(W); } catch (e) { console.error('caphtor', e); } };
const olK = EP.onLoad; EP.onLoad = function () { const r = olK ? olK.apply(this, arguments) : undefined; try { sync(true); } catch (e) { } return r; };
function buildQuaySide(W) { const E = Object.assign({}, G.env || {}, EP.envx || {}); for (const [fn, x, z, ry] of [['pots', -92.6, -74.6, 0.3]]) if (E[fn]) W.place(E[fn], x, z, { ry }); }
function buildStage(W) { const R = G.R, g = new G.GB(91), C = o => { const c = W.addCol(Object.assign({ on: false }, o)); COLS.push(c); return c; }, X = BX, Z = BZ;
  const box = (w, h, d, x, y, z, c, o) => g.box(w, h, d, Object.assign({ at: [X + x, y, Z + z], c }, o || {}));
  const wallC = (x, z, w, d, h, cam) => C({ x: X + x, z: Z + z, w, d, y0: BY - 1, y1: BY + PH + (h || 4), cam: !!cam });
  const TOP = BY + PH;
  // ground: the town shelf, a sand beach, the far land behind
  box(110, 14, 72, 0, BY - 7, 6, 0xb8a27a); g.box(460, 1, 340, { at: [X, BY - 0.68, Z + 140], c: 0x8a9460, j: 0.04 });
  box(110, 0.06, 6, 0, BY + 0.01, -27, 0xe0cc98, { j: 0.02 }); box(111, 1.2, 4, 0, SEA - 0.1, -31.2, 0xe4d4a2, { rx: 0.18 });
  box(5, 0.06, 32, 0, BY + 0.02, -14, 0xc8bca0, { j: 0.03 }); box(60, 0.06, 4, -8, BY + 0.025, -20, 0xc8bca0, { j: 0.03 }); // paved ways
  for (const [x, z, w, d] of [[-34, 33, 34, 16], [38, 24, 30, 30]]) box(w, 0.05, d, x, BY + 0.015, z, 0x7a8a4a, { j: 0.06 }); // vineyard · olive grove ground
  // the stone pier and the edges of the shelf
  box(4.4, 3, 16.4, 10, BY - 1.5, -38, 0x9a9282); for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.cyl(0.18, 0.22, 0.6, 7, { at: [X + 10 + s * 1.8, BY + 0.3, Z - 32 - i * 4], c: 0x6a5a48 });
  box(0.8, 1.1, 72, -55.4, BY + 0.55, 6, 0xa8987a); box(0.8, 1.1, 72, 55.4, BY + 0.55, 6, 0xa8987a); box(111.6, 1.1, 0.8, 0, BY + 0.55, 42.4, 0xa8987a);
  // ---------------------------------------------------------- the palace
  box(38, PH, 28, 0, BY + PH / 2, 20, GYP); box(18, 0.04, 19.5, 0, TOP + 0.02, 20.75, 0xeee4cc, { j: 0.02 }); // the terrace · the court's pale paving
  box(7, PH, 4, 0, BY + PH / 2, 4, GYP2, { rx: -0.24 }); // the ramp up to the gate
  // horns of consecration and Minoan columns (wider at the top, black cushion capitals)
  const horns = (x, y, z, s, ry) => { const o = { ry: ry || 0 }; box(0.9 * s, 0.22 * s, 0.32 * s, x, y + 0.11 * s, z, 0xeee6d2, o); for (const k of [-1, 1]) box(0.17 * s, 0.6 * s, 0.24 * s, x + k * 0.34 * s * Math.cos(ry || 0), y + 0.48 * s, z - k * 0.34 * s * Math.sin(ry || 0), 0xeee6d2, Object.assign({ rz: k * 0.18 }, o)); };
  const column = (x, z, h) => { g.cyl(0.36, 0.24, h - 0.5, 10, { at: [X + x, TOP + (h - 0.5) / 2, Z + z], c: RED }); g.cyl(0.5, 0.38, 0.3, 10, { at: [X + x, TOP + h - 0.35, Z + z], c: BLK }); box(1.0, 0.18, 1.0, x, TOP + h - 0.1, z, BLK); C({ x: X + x, z: Z + z, r: 0.42, y0: BY - 1, y1: TOP + h }); };
  // south wing (the gate between two blocks) and its propylon
  const block = (x0, x1, z0, z1, h, c) => { box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, TOP + h / 2, (z0 + z1) / 2, c || GYP); box(x1 - x0 + 0.3, 0.3, z1 - z0 + 0.3, (x0 + x1) / 2, TOP + h + 0.15, (z0 + z1) / 2, GYP2); wallC((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, h, true); };
  block(-9, -3.5, 6, 11, 4.6); block(3.5, 12.4, 6, 11, 4.6);
  for (const x of [-2.4, 2.4]) column(x, 6.6, 4.6); box(7.4, 0.5, 1.4, 0, TOP + 4.75, 6.6, BLK); // the gate's lintel
  for (let i = 0; i < 6; i++) horns(-8 + i * 1.2 + (i > 2 ? 10.6 : 0), TOP + 4.9, 6.15, 0.8);
  // red bands along the outside walls
  box(5.6, 0.35, 0.06, -6.25, TOP + 3.4, 5.97, RED, { j: 0 }); box(8.9, 0.35, 0.06, 7.95, TOP + 3.4, 5.97, RED, { j: 0 });
  // north wing: a tall block, windows, a grand stair look, the bull fresco facing the court
  block(-9, 12.4, 30.5, 34, 7.2); for (let i = 0; i < 6; i++) { box(0.8, 1.1, 0.06, -7 + i * 3.6, TOP + 5.4, 30.46, 0x3a2a20, { j: 0 }); box(1.0, 0.12, 0.08, -7 + i * 3.6, TOP + 6.0, 30.44, RED, { j: 0 }); }
  for (let i = 0; i < 9; i++) horns(-8 + i * 2.4, TOP + 7.5, 30.7, 1.0);
  { const fz = 30.44, y0 = TOP + 1.2; box(8.4, 3.2, 0.06, 0, y0 + 1.6, fz, 0x5a8ab8, { j: 0 }); box(8.6, 0.22, 0.07, 0, y0 + 3.25, fz - 0.01, 0xd8a83a, { j: 0 }); box(8.6, 0.22, 0.07, 0, y0 - 0.05, fz - 0.01, RED, { j: 0 });
    const fb = (w, h, x, y, c, rz) => box(w, h, 0.05, x, y0 + y, fz - 0.03, c, { j: 0, rz: rz || 0 });
    fb(3.0, 1.0, 0.2, 1.3, 0x7a2e1e); fb(0.9, 0.7, -1.7, 1.55, 0x7a2e1e, 0.25); fb(0.12, 0.6, -2.0, 2.1, 0xeee6d2, 0.5); fb(0.12, 0.6, -1.55, 2.15, 0xeee6d2, -0.4); // the bull: body, head, horns
    for (const x of [-0.9, -0.4, 0.8, 1.3]) fb(0.2, 0.75, x, 0.5, 0x7a2e1e, x < 0 ? 0.35 : -0.25); fb(1.0, 0.12, 1.9, 1.45, 0x7a2e1e, -0.6); // legs at the gallop · the tail
    fb(0.26, 0.9, 0.0, 2.45, 0xc87a4a, 1.25); fb(0.28, 0.28, -0.5, 2.6, 0xc87a4a); fb(0.4, 0.22, 0.25, 2.35, 0xf4efe2, 1.25); // a youth somersaulting over its back
    fb(0.22, 0.85, 2.4, 1.0, 0xf2e8dc, 0.0); fb(0.22, 0.22, 2.4, 1.55, 0xf2e8dc); fb(0.26, 0.85, -2.9, 1.0, 0xc87a4a, 0.3); fb(0.24, 0.24, -2.95, 1.55, 0xc87a4a); } // a girl waiting to catch him · one gripping the horns
  // east wing: rooms behind a red colonnade, the dolphin fresco under the portico
  block(12.4, 19, 11, 30.5, 5.2); for (let i = 0; i < 6; i++) column(9.8, 12.6 + i * 3.3, 4.4); box(3.6, 0.35, 19.8, 11.1, TOP + 4.55, 20.75, GYP2); for (let i = 0; i < 6; i++) horns(9.5, TOP + 4.75, 12.6 + i * 3.3, 0.7, Math.PI / 2);
  { const fx = 12.36, y0 = TOP + 1.1; box(0.06, 2.4, 9, fx, y0 + 1.2, 20.75, 0x6aa8c8, { j: 0 }); box(0.07, 0.18, 9.2, fx - 0.01, y0 + 2.45, 20.75, 0xd8a83a, { j: 0 }); box(0.07, 0.18, 9.2, fx - 0.01, y0 - 0.05, 20.75, RED, { j: 0 });
    for (const [z, y, r] of [[17.4, 1.3, 0.25], [19.8, 0.8, -0.2], [22.2, 1.5, 0.15], [24.0, 0.7, -0.3]]) { box(0.05, 0.42, 1.6, fx - 0.03, y0 + y, z, 0x2a4a6a, { j: 0, rx: r }); box(0.05, 0.16, 0.7, fx - 0.035, y0 + y - 0.14, z, 0xe8e8e0, { j: 0, rx: r }); box(0.05, 0.4, 0.14, fx - 0.03, y0 + y + 0.26, z - 0.1, 0x2a4a6a, { j: 0 }); }
    for (let i = 0; i < 12; i++) box(0.05, 0.12, 0.12, fx - 0.03, y0 + 0.2 + (i % 3) * 0.3, 16.6 + i * 0.75, 0xe8d070, { j: 0 }); } // small fish
  // west wing: the storerooms
  box(0.4, 4, 27.8, -18.8, TOP + 2, 20, GYP); wallC(-18.8, 20, 0.4, 27.8, 4, true); // outer west wall
  box(10.2, 4, 0.4, -13.9, TOP + 2, 6.4, GYP); wallC(-13.9, 6.4, 10.2, 0.4, 4, true); box(3.6, 7.2, 0.4, -10.8, TOP + 3.6, 33.6, GYP); wallC(-10.8, 33.6, 3.6, 0.4, 7.2, true); box(6.6, 4, 0.4, -15.6, TOP + 2, 33.6, GYP); wallC(-15.6, 33.6, 6.6, 0.4, 4, true);
  // the court wall with its door (lz 19…21.4)
  for (const [z0, z1] of [[6.6, 19], [21.4, 30.5]]) { box(0.4, 3.6, z1 - z0, -9, TOP + 1.8, (z0 + z1) / 2, GYP2); wallC(-9, (z0 + z1) / 2, 0.4, z1 - z0, 3.6); }
  box(0.5, 0.4, 2.8, -9, TOP + 3.0, 20.2, BLK); for (const z of [18.95, 21.45]) column(-9, z, 3.2);
  // the storeroom wall along the corridor, with a door into each room (but 3 and 6)
  { let z = MAG.z0; const doors = []; for (let k = 0; k < MAG.n; k++) if (!NODOOR[k]) doors.push(mz(k)); doors.push(MAG.z1 + 0.65);
    for (const dzc of doors) { const z1 = dzc - 0.65; if (z1 - z > 0.05) { box(0.4, 3.2, z1 - z, -12.4, TOP + 1.6, (z + z1) / 2, GYP2); wallC(-12.4, (z + z1) / 2, 0.4, z1 - z, 3.2); } z = dzc + 0.65; } }
  // walls between the rooms; jars down one side; a gap at the far end where a room has no door
  for (let k = 1; k < MAG.n; k++) { const zb = MAG.z0 + k * MW; if (GAPS[k]) { box(4.8, 3.2, 0.4, -15.0, TOP + 1.6, zb, GYP2); wallC(-15.0, zb, 4.8, 0.4, 3.2); } else { box(6.0, 3.2, 0.4, -15.6, TOP + 1.6, zb, GYP2); wallC(-15.6, zb, 6.0, 0.4, 3.2); } }
  const pithos = (x, z, s) => { g.lathe([[0.2, 0], [0.4, 0.25], [0.5, 0.62], [0.45, 0.98], [0.3, 1.18], [0.33, 1.3]].map(([r, y]) => [r * s, y * s]), 12, { at: [X + x, TOP, Z + z], c: 0xb07a4a, j: 0.03 }); for (const y of [0.42, 0.8]) g.cyl(0.5 * s, 0.5 * s, 0.05, 12, { at: [X + x, TOP + y * s, Z + z], c: 0x7a4a2a }); C({ x: X + x, z: Z + z, r: 0.5 * s, y0: BY - 1, y1: TOP + 1.3 * s }); };
  for (let k = 0; k < MAG.n; k++) { const zc = mz(k) - 0.62; for (const x of [-16.2, -14.7, -13.3]) pithos(x, zc, 0.92); if (!GAPS[k] && !GAPS[k + 1]) pithos(-17.7, zc, 0.92); }
  for (const [x, z] of [[-9.75, 8.6], [-7.6, 29.4]]) pithos(x, z, 0.85); /* against the walls: the corridor stays open */ // a few in the corridor and the court
  // ---------------------------------------------------------- the town: flat-roofed houses of two storeys, red window frames
  const house = (x, z, w, d, h, rot) => { const W2 = rot ? d : w, D2 = rot ? w : d; box(W2, h, D2, x, BY + h / 2, z, OCHRE); box(W2 + 0.4, 0.28, D2 + 0.4, x, BY + h + 0.1, z, GYP2);
    box(1.0, 1.9, 0.08, x, BY + 0.95, z - D2 / 2 - 0.03, 0x3a2818, { j: 0 }); for (const k of [-1, 1]) for (const yy of [0.42, 0.75]) { box(0.7, 0.55, 0.08, x + k * W2 / 4, BY + h * yy, z - D2 / 2 - 0.03, 0x2a2018, { j: 0 }); box(0.86, 0.1, 0.1, x + k * W2 / 4, BY + h * yy + 0.32, z - D2 / 2 - 0.04, RED, { j: 0 }); }
    horns(x - W2 / 2 + 0.6, BY + h + 0.25, z - D2 / 2 + 0.3, 0.5); C({ x: X + x, z: Z + z, w: W2, d: D2, y0: BY - 1, y1: BY + h + 0.3, cam: true }); };
  for (const h of [[-42, -14, 7, 6, 4.8], [-30, -16, 6, 5, 4.0], [-46, 2, 6, 7, 5.2, 1], [-34, 8, 7, 6, 4.4], [-25, -5, 6, 5, 3.8], [30, -16, 7, 6, 4.6], [42, -12, 6, 6, 5.0], [24, -4, 6, 5, 4.0], [44, 2, 7, 6, 4.2, 1], [-14, -12, 6, 5, 3.8], [16, -12, 6, 5, 4.0]]) house(...h);
  // things from the shared kit: well, stalls, jars, boats, olive trees
  const E = Object.assign({}, G.env || {}, EP.envx || {}), put = (fn, x, z, o) => { if (E[fn]) W.place(E[fn], X + x, Z + z, Object.assign({ gb: g, y: BY }, o || {})); };
  put('well', 6, -2); C({ x: X + 6, z: Z - 2, r: 1.7, y0: BY - 1, y1: BY + 1 });
  for (const [x, z, ry, col] of [[-9, -22.4, 0, 0x2a5aa0], [-15, -22.4, 0, RED], [16, -22.4, 0, 0xd8a83a]]) { put('stallM', x, z, { ry }); box(3.2, 0.08, 2.2, x, BY + 2.35, z, col, { rx: 0.12, j: 0 }); C({ x: X + x, z: Z + z, w: 2.6, d: 1.4, y0: BY - 1, y1: BY + 1.1 }); }
  for (const [fn, x, z, ry] of [['ampRack', 4, -25, 0], ['pots', -6, -24, 0.4], ['sacks', 20, -21, 0], ['bales', 13.5, -26, 0.3], ['pots', 30, -6, 0]]) put(fn, x, z, { ry });
  for (const [x, z] of [[-4, -24.6], [-2.6, -24.8], [22, -8]]) pithos(x, z, 0.75);
  for (const [x, z, s, ry] of [[15.5, -40, 1.6, 0.05], [3.5, -43, 1.3, -0.1], [-26, -40, 0.8, 1.4], [30, -38, 0.75, 1.7]]) put('felucca', x, z, { s, ry, y: SEA - 0.25 });
  for (let i = 0; i < 18; i++) { const x = 26 + (i % 6) * 4.6 + ((i * 7) % 3) * 0.4, z = 12 + Math.floor(i / 6) * 8 + ((i * 5) % 3) * 0.6; put('olive', x, z, { s: 0.85 + (i % 3) * 0.08 }); C({ x: X + x, z: Z + z, r: 0.4, y0: BY - 1, y1: BY + 2 }); }
  for (let r = 0; r < 5; r++) for (let i = 0; i < 9; i++) { const x = -48 + i * 3.2, z = 27 + r * 2.6; g.cyl(0.05, 0.06, 1.1, 4, { at: [X + x, BY + 0.55, Z + z], c: 0x6a4a2a }); g.sph(0.45, 6, 4, { at: [X + x, BY + 1.05, Z + z], s: [1.2, 0.7, 0.9], c: i % 2 ? 0x5a7a34 : 0x4e6e2e }); } // the vineyard
  for (let i = 0; i < 90; i++) { const x = -50 + (i * 37 % 100) / 100 * 22, z = 14 + (i * 61 % 100) / 100 * 9; g.cyl(0.04, 0.04, 0.16, 4, { at: [X + x, BY + 0.08, Z + z], c: 0x5a7a3a }); g.sph(0.07, 5, 3, { at: [X + x, BY + 0.18, Z + z], c: i % 4 ? 0x9a6ac8 : 0xe86a2a }); } // saffron crocuses
  // cypresses inside the town and up the hills; the ground keeps going to Mount Ida
  const cypress = (x, y, z, s) => { g.cyl(0.08 * s, 0.12 * s, 0.8 * s, 5, { at: [x, y + 0.4 * s, z], c: 0x5a3a24 }); g.cyl(0.05 * s, 0.75 * s, 5.2 * s, 8, { at: [x, y + 3.2 * s, z], c: CYP }); };
  for (const [x, z, s] of [[-22, 2, 1], [22, 4, 1.1], [-50, -20, 0.9], [50, -22, 0.95], [-24, 38, 1], [24, 40, 1.05], [-52, 38, 0.9], [52, 39, 1]]) { cypress(X + x, BY, Z + z, s); C({ x: X + x, z: Z + z, r: 0.5 * s, y0: BY - 1, y1: BY + 4 }); }
  let sd = 71; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 24; i++) { const fx = -150 + i * 13 + (rng() - 0.5) * 6, fz = 56 + rng() * 24, fr = 13 + rng() * 9; g.sph(fr, 10, 5, { at: [X + fx, BY - fr * 0.3, Z + fz], s: [1, 0.5, 0.8], c: [0x8a9460, 0x7e8a58, 0x96a068][i % 3], j: 0.06 });
    for (let k = 0; k < 3; k++) { const tx = fx + (rng() - 0.5) * fr, tz = fz - fr * 0.3 + rng() * fr * 0.4; if (tz < 46) continue; if (k % 2) cypress(X + tx, BY + fr * 0.06, Z + tz, 1 + rng() * 0.4); else if (E.olive) W.place(E.olive, X + tx, Z + tz, { gb: g, y: BY + fr * 0.06, s: 0.9 }); } }
  /* mountains as ridges (several leaning cones and round shoulders), not single cones (one read as a pyramid from the harbour) */
  for (const [x, z, rb, h] of [[-10, 160, 64, 70], [-95, 135, 44, 46], [75, 140, 48, 52], [150, 125, 40, 36], [-165, 122, 42, 36]]) { const y0 = BY - 14;
    for (let k = 0; k < 4; k++) { const ox = (rng() - 0.5) * rb * 0.9, oz = (rng() - 0.3) * rb * 0.5, hh = h * (k ? 0.55 + rng() * 0.3 : 1), rr = rb * (k ? 0.5 + rng() * 0.3 : 1);
      g.cyl(rr * 0.12, rr, hh, 9, { at: [X + x + ox, y0 + hh / 2, Z + z + oz], ry: rng() * 3, c: [0x7e8a68, 0x8a9070, 0x74805e, 0x96987a][k], j: 0.12 }); }
    g.sph(rb * 0.7, 10, 6, { at: [X + x, y0, Z + z - rb * 0.3], s: [1.3, 0.5, 0.8], c: 0x86925e, j: 0.08 });
    if (h > 60) g.cyl(0.6, rb * 0.12 * 0.9, h * 0.1, 9, { at: [X + x, y0 + h * 0.95, Z + z], c: 0xe8e6dc, j: 0.04 }); } // Ida: a little snow on the top
  // edges you cannot walk off: the open sea, the pier, the terrace walls
  for (const [x, z, w, d] of [[-72, -61, 0.6, 62], [72, -61, 0.6, 62], [0, -92, 144, 0.6], [7.6, -38, 0.6, 16.4], [12.4, -38, 0.6, 16.4], [10, -46.4, 5.4, 0.6], [-55.4, 6, 0.8, 72], [55.4, 6, 0.8, 72], [0, 42.4, 111.6, 0.8]]) C({ x: X + x, z: Z + z, w, d, y0: BY - 2, y1: BY + 4 });
  // the palace terrace's outer edge (it stands a metre above the town): walls everywhere but the ramp
  for (const [x, z, w, d] of [[19.2, 20, 0.4, 28], [-19.2, 20, 0.4, 28], [0, 34.2, 38.4, 0.4], [-11.25, 5.8, 15.5, 0.4], [11.25, 5.8, 15.5, 0.4]]) C({ x: X + x, z: Z + z, w, d, y0: BY - 2, y1: TOP + 0.6 });
  box(0.4, PH + 0.02, 28, 19.2, BY + PH / 2, 20, GYP2); box(38.4, PH + 0.02, 0.4, 0, BY + PH / 2, 34.2, GYP2);
  const statics = [R.mesh(g)]; statics[0].outline = true;
  // the sea: the shared water shader, a warmer turquoise
  const d = [], st = 12, n = 50; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x0 = X - st * n / 2 + i * st, z0 = Z - st * n / 2 + j * st, x1 = x0 + st, z1 = z0 + st; const v = (x, z) => d.push(x, SEA, z, 0, 1, 0, 1, 1, 1, 0, 0); v(x0, z1); v(x1, z1); v(x1, z0); v(x0, z1); v(x1, z0); v(x0, z0); }
  const w0 = W.water || {}; const sea = { mesh: R.mesh(new Float32Array(d)), level: SEA, map: w0.map, heightTex: w0.heightTex, shallow: [0.2, 0.62, 0.66], deep: [0.03, 0.22, 0.42] };
  // things that move: dolphins, the seals' glint
  const gd = new G.GB(5); gd.sph(0.5, 10, 6, { at: [0, 0, 0], s: [0.55, 0.5, 1.6], c: 0x6f8496 }); gd.sph(0.45, 8, 5, { at: [0, -0.12, 0.05], s: [0.5, 0.34, 1.4], c: 0xd8dde0 });
  gd.cyl(0.07, 0.12, 0.42, 6, { at: [0, -0.06, 0.98], rx: Math.PI / 2, c: 0x6f8496 }); gd.box(0.06, 0.36, 0.32, { at: [0, 0.38, -0.08], rx: -0.45, c: 0x56697b }); gd.box(0.75, 0.06, 0.26, { at: [0, 0.02, -0.98], c: 0x56697b });
  const gs = new G.GB(6); gs.cyl(0.12, 0.12, 0.06, 12, { at: [0, 0, 0], c: 0xe5b552 }); gs.cyl(0.05, 0.07, 0.14, 8, { at: [0, 0.09, 0], c: 0xc8a040 });
  return { statics, sea, dolphin: R.mesh(gd), seal: R.mesh(gs) }; }

// the floor: the terrace, the ramp, the pier, the beach
const beach = lz => BY + 0.02 - (-30 - lz) / 5.6 * 3.2;
EP.waterAt = (w0 => function (x, z, s) { if (!inKf()) return w0 ? w0.apply(this, arguments) : null; const lx = x - BX, lz = z - BZ;
  if (lz < -30 && lz > -92 && Math.abs(lx) < 72 && !(lx > 7.4 && lx < 12.6 && lz > -46.6)) return { level: SEA, bed: lz > -35.6 ? beach(lz) : SEA - 2.6 - Math.min(3, (-30 - lz) * 0.08) }; return null; })(EP.waterAt);
EP.floor = (f0 => function (x, z, s) { if (inKf()) { const lx = x - BX, lz = z - BZ;
  if (Math.abs(lx) < 19.4 && lz > 6 && lz < 34.4) return BY + PH; if (Math.abs(lx) < 3.5 && lz > 2 && lz <= 6) return BY + PH * (lz - 2) / 4;
  if (Math.abs(lx) < 55.4 && lz > -30 && lz < 42.4) return BY; if (lx > 7.6 && lx < 12.4 && lz > -46.4 && lz <= -30) return BY; if (Math.abs(lx) < 55.4 && lz <= -30 && lz > -35.6) return beach(lz); }
  return f0 ? f0.apply(this, arguments) : null; })(EP.floor);
// while on the island: draw it instead of Egypt; dolphins and the seals' glint
const EMPTY = [], DM = [G.m4(), G.m4(), G.m4()], SM = [G.m4(), G.m4(), G.m4()];
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments);
  /* overseas (here or Byblos): drop the things of the real map that stand under the stage (a pyramid 85 m away rose through the sky as a pale triangle) */
  if (G.Byblos.inBy()) for (let i = list.length - 1; i >= 0; i--) { const m = list[i] && list[i].m; if (m && m[13] < BY - 12) list.splice(i, 1); }
  if (!inKf() || !STAGE) return; const sc = Game.scene; if (!sc) return;
  sc.terrain = EMPTY; sc.statics = STAGE.statics; sc.water = STAGE.sea; sc.pools = null; sc.insts.length = 0;
  for (let i = list.length - 1; i >= 0; i--) { const m = list[i] && list[i].m; if (!m || Math.hypot(m[12] - BX, m[14] - BZ) > 150) list.splice(i, 1); }
  const t = performance.now() / 1000;
  for (let i = 0; i < 3; i++) { const cx = BX - 18 + i * 17, cz = BZ - 58 - i * 7, r = 9 + i * 3, w = 0.22 + i * 0.03, a = t * w + i * 2.1, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, hd = Math.atan2(-Math.sin(a), Math.cos(a));
    const ph = (t * 0.85 + i * 1.3) % 3.4, up = ph < 1 ? Math.sin(Math.PI * ph) : 0, y = SEA - 0.32 + up * 1.7, pitch = ph < 1 ? -Math.cos(Math.PI * ph) * 0.85 : 0;
    G.m4trs(DM[i], x, y, z, hd, pitch, 0, 0.8, 0.8, 0.8); list.push({ mesh: STAGE.dolphin, m: DM[i] }); }
  const s = S(); if (s && s.flags.kfSealQ && !s.flags.kfSealDone) { const got = sealGot(s); SEALS.forEach(([lx, lz], i) => { if (got[i]) return; G.m4trs(SM[i], BX + lx, BY + PH + 0.12 + Math.sin(t * 3 + i) * 0.04, BZ + lz, t * 2 + i, 0, 0, 1, 1, 1); list.push({ mesh: STAGE.seal, m: SM[i], emis: [0.55, 0.4, 0.08] }); }); }
};
// things to do by hand: pick up a seal, look at the frescoes
Game.CTX.push(function (s) { if (!inKf() || Game.cineOn || G.UI.busy()) return null; const p = P(), lx = p.x - BX, lz = p.z - BZ, out = [];
  if (s.flags.kfSealQ && !s.flags.kfSealDone) { const got = sealGot(s); SEALS.forEach(([x, z], i) => { if (got[i]) return; const d = Math.hypot(lx - x, lz - z); if (d < 1.7) out.push({ d: d - 1.0, label: '반짝이는 인장 줍기', x: BX + x, z: BZ + z, yAbs: BY + PH + 0.4, key: 'kfSeal' + i, use: () => { got[i] = 1; P().emote = { k: 'gather', t: 0, dur: 0.8 }; sfx('pickup'); const n = Object.keys(got).length; G.UI.quest && G.UI.quest(); pop(`인장 ${n}/${SEALS.length}`, n >= SEALS.length ? '서기 이다에게 가져다줘요' : '서쪽 창고 · 아직 남았어요', 'star'); } }); }); }
  { const d = Math.hypot(lx - 0, lz - 29.6); if (d < 2.6) out.push({ d: d - 1.4, label: '소 뛰어넘기 벽화 보기', x: BX, z: BZ + 29.6, yAbs: BY + PH + 2.4, key: 'kfFr1', use: () => say([{ n: '', t: '붉은 황소가 내달리고, 한 젊은이가 그 등 위로 공중제비를 넘고 있어요. 황소 뿔을 붙잡은 사람, 뒤에서 받아 주려고 팔을 벌린 소녀도 보여요.' }, { n: '요셉', t: '애굽에서는 황소를 신으로 섬기는데… 이 섬 사람들은 황소와 함께 재주를 넘는구나.' }]) }); }
  { const d = Math.hypot(lx - 11.4, lz - 20.75); if (d < 2.4) out.push({ d: d - 1.3, label: '돌고래 벽화 보기', x: BX + 11.4, z: BZ + 20.75, yAbs: BY + PH + 2.2, key: 'kfFr2', use: () => say([{ n: '', t: '푸른 바다에 돌고래들이 헤엄치고, 작은 물고기 떼가 그 사이를 지나가요. 바다를 벗 삼아 사는 섬사람들의 그림이에요.' }, { n: '요셉', t: '「하나님이 큰 물고기와 물에서 번성하여 움직이는 모든 생물을 그 종류대로… 창조하시니」… 바다 건너에서도 그분의 솜씨가 보이는구나.', ref: '창세기 1:21' }]) }); }
  return out.length ? out : null; });
const q0 = EP.quiet; EP.quiet = function (s) { return inKf() || (q0 ? q0.apply(this, arguments) : false); };
let modeOn = null;
function sync(force) { const on = inKf(); if (on === modeOn && !force) return; modeOn = on; for (const c of COLS) c.on = on; if (on) EP.noGrass = true; else if (!(G.Byblos && G.Byblos.inBy())) EP.noGrass = false;
  const mm = document.getElementById('minimap'); if (mm && (on || !G.Byblos.inBy())) mm.style.visibility = on ? 'hidden' : '';
  if (on && G.Weather && G.Weather.set && ['dust', 'storm', 'fog'].includes(G.Weather.kind(S()))) G.Weather.set('clear', 4); }
if (G.Weather && G.Weather.weights) { const w0 = G.Weather.weights; G.Weather.weights = function () { if (inKf()) return { clear: 0.66, cloudy: 0.2, rain: 0.04, wind: 0.1, fog: 0, dust: 0, storm: 0 }; return w0.apply(this, arguments); }; }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play') return r; try { const s = S(), p = P();
  if (s.flags.kaftor && !(G.DW && G.DW.on && G.DW.on()) && Math.hypot(p.x - BX, p.z - BZ) > 170) s.flags.kaftor = 0; // carried away by the story: home again
  sync(); if (inKf()) chatter(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('caphtor', e); } return r; };
// the quest box: what is left of the seals
if (G.UI && G.UI.quest) { const uq0 = G.UI.quest; G.UI.quest = function () { const r = uq0.apply(this, arguments); try { const s = S(); if (s && inKf() && s.flags.kfSealQ && !s.flags.kfSealDone) { const n = Object.keys(sealGot(s)).length, el = document.getElementById('qList'); if (el) el.insertAdjacentHTML('beforeend', `<div class="${n >= SEALS.length ? 'ok' : ''}"><i>${n >= SEALS.length ? '✓' : '·'}</i><span>갑돌 · 잃어버린 인장 (${n}/${SEALS.length})${n >= SEALS.length ? ' · 서기 이다에게' : ''}</span></div>`); } } catch (e) { } return r; }; }
// 발자취: a new group
if (G.Trail && G.Trail.GROUPS) G.Trail.GROUPS.push({ t: '먼 땅', on: () => vz(), list: [
  { id: 'kfVisit', n: '갑돌 섬에 가 보기', h: '나일 북쪽 나루의 갑돌 배 선장 카르파', v: s => s.flags.kfMet ? 1 : 0, max: 1 },
  { id: 'kfSeal', n: '잃어버린 인장 셋', h: '갑돌 궁의 서기 이다 · 서쪽 창고 미로', v: s => s.flags.kfSealDone ? 3 : Object.keys(s.flags.kfSeals || {}).length, max: 3 },
  { id: 'kfLeap', n: '소 뛰어넘기 응원 세 번', h: '갑돌 궁 안마당의 레나 · 하루 한 번', v: s => s.flags.kfLeapN || 0, max: 3 },
  { id: 'kfTrade', n: '갑돌과 교역 세 번', h: '궁의 청지기 다미 · 세마포나 곡식 셋', v: s => s.flags.kfTradeN || 0, max: 3 }] });
G.Caphtor = { sail, inKf, stage: () => ({ x: BX, z: BZ, y: BY }) };
})(window.G);
