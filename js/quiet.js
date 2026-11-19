/* 약속의 길 — 성경 인물은 평소에 말하지 않아요 (v18.73)
   · 「메인 이야기는 성경만」: 요셉 편의 성경 인물(야곱 · 베냐민 · 레아 · 디나 · 형들 · 들의 사람 · 대상 · 보디발과 그 아내 ·
     간수장 · 두 관원장 · 바로와 그 사자 · 점술가와 현인 · 아스낫 · 므낫세 · 에브라임 · 보디베라 · 요셉의 청지기 · 세라)은
     이야기 단계에서 하는 성경 말씀 말고는 평소 말을 하지 않아요.
   · 말을 걸면 말 대신 몸짓만 글로 보여요(「야곱이 요셉을 보고 말없이 고개를 끄덕여요.」).
     선물 · 함께 식사 · 함께 놀기 · 함께 걷기는 그대로 할 수 있어요(말 없이 몸짓 글로만).
   · 그대로인 것: 이야기 단계의 대사(성경 말씀) · 곁이야기(부탁)의 말 · 꿈의 세계 · 다른 편(DLC) · 성경에 없는 사람들의 말.
   API: G.Quiet.is(id | npc) · G.Quiet.nod(npc) · G.Quiet.ga(name) */
'use strict';
(function (G) {
const Game = G.Game, rnd = a => a[Math.floor(Math.random() * a.length)];
const Q = G.Quiet = {};
const BIB = new Set(['jacob', 'benjamin', 'benjamin2', 'leah', 'dinah', 'man', 'reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun',
  'ishmael', 'midian', 'potiphar', 'wife', 'keeper', 'cupbearer', 'cupbearerC', 'baker', 'messenger', 'pharaoh', 'magician', 'sage', 'asenath', 'manasseh', 'ephraim',
  'steward2', 'potipherah', 'dqPoti', 'dqReuben', 'tqSerah']);
const KID = new Set(['manasseh', 'ephraim', 'benjamin']);
const BRO = new Set(['reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun', 'dqReuben']);
const ROYAL = new Set(['pharaoh', 'potiphar', 'keeper', 'cupbearer', 'cupbearerC', 'baker', 'messenger', 'magician', 'sage', 'steward2', 'potipherah', 'dqPoti', 'man']);
const idOf = x => !x ? '' : typeof x === 'string' ? x : (x.id || (x.d && x.d.id) || '');
const joseph = () => !!(G.EP && G.EP.joseph && Game.EP && Game.EP() === G.EP.joseph);
const dream = () => !!(G.DW && G.DW.on && G.DW.on());
Q.is = x => { const id = idOf(x); return !!id && BIB.has(id) && joseph() && !dream(); };
Q.ids = BIB;
Q.hero = () => joseph() && !dream(); /* Joseph's own everyday words (cooking, eating) become narration too */
const jong = s => { const c = (s || '').charCodeAt((s || '').length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; };
Q.ga = nm => nm + (jong(nm) ? '이' : '가');
const era = () => (G.Cast && G.Cast.era) ? G.Cast.era() : 'vizier';
/* a gesture instead of words, by who they are */
Q.nod = n => { const id = idOf(n), N = Q.ga((n && n.name) || '그'), e = era();
  const pool = KID.has(id) ? ['{N} 요셉을 보고 방긋 웃어요.', '{N} 요셉에게 쪼르르 달려와 옷자락을 잡아요.', '{N} 요셉을 올려다보며 고개를 끄덕여요.']
    : BRO.has(id) ? (e === 'canaan' ? ['{N} 요셉을 힐끗 보고 하던 일을 계속해요.'] : ['{N} 요셉을 보고 말없이 고개를 끄덕여요.', '{N} 하던 일을 잠시 멈추고 요셉을 바라봐요.'])
    : id === 'wife' ? ['{N} 하던 일을 계속해요.']
    : id === 'ishmael' || id === 'midian' ? ['{N} 짐을 살피며 하던 일을 계속해요.']
    : ROYAL.has(id) ? ['{N} 말없이 고개를 끄덕여요.', '{N} 하던 일을 계속해요.']
    : ['{N} 요셉을 보고 말없이 고개를 끄덕여요.', '{N} 말없이 미소 지어요.', '{N} 하던 일을 잠시 멈추고 요셉을 바라봐요.'];
  return rnd(pool).replace('{N}', N); };
const fam = id => { const E = Game.EP(); return E && E.family && E.family[id]; };
const GIFTCAT = ['food', 'good', 'crop', 'fish', 'mat'];
const giftKeys = () => { const S = Game.S(), I = Game.ITEMS; return Object.keys(S.inv).filter(k => S.inv[k] > 0 && I[k] && GIFTCAT.includes(I[k].cat) && !I[k].tool); };
const SWEET = ['dates', 'honey', 'sweetCake', 'figCake', 'fig', 'milkHoney'];
const likesOf = id => { const c = G.Cast && G.Cast.of(id); return (c && c.gift && c.gift.like) || (KID.has(id) ? SWEET : []); };

/* talking to them: a gesture, then what you can do together (no words from them) */
Q.talk = function (n, done) { const B = G.Bond, S = Game.S(), id = n.id = idOf(n) || n.id, b = B.get(id), F = fam(id), end = () => done && done();
  if (b.day !== S.day) { b.day = S.day; setTimeout(() => B.add(id, F ? 3 : 2, '오늘 만남'), 50); }
  const ch = [];
  if (F && F.walk && n.follow) ch.push({ t: '여기서 기다리게 하기', then: () => { n.follow = false; G.UI.toast(`${Q.ga(n.name)} 여기서 기다려요`); end(); } });
  else if (F && F.walk && !(Game.questBusy && Game.questBusy())) ch.push({ t: '함께 걷기', then: () => { n.follow = true; G.UI.toast(`${Q.ga(n.name)} 함께 걸어요`); end(); } });
  if (F && F.meal && b.meal !== S.day) ch.push({ t: '함께 식사하기', then: () => B.meal(n, done) });
  if (F && F.play && b.play !== S.day) ch.push({ t: '함께 놀기', then: () => B.play(n, done) });
  if (b.gift !== S.day && giftKeys().length) ch.push({ t: '선물 주기', then: () => setTimeout(() => B.giftPick(n, done), 30) });
  if (!ch.length) { G.UI.say([{ n: '', t: Q.nod(n) }], end); return; }
  ch.push({ t: '떠나기', then: end });
  G.UI.say([{ n: '', t: Q.nod(n), choices: ch }], null); };
/* a gift: taken with a gesture, no thank-you words */
Q.gift = function (n, done) { const S = Game.S(), id = idOf(n), B = G.Bond, b = B.get(id), I = Game.ITEMS, me = G.Cast && G.Cast.me ? G.Cast.me(id) : n.name, end = () => done && done();
  if (b.gift === S.day) { G.UI.say([{ n: '', t: '오늘은 이미 선물을 건넸어요.' }], end); return; }
  const like = likesOf(id), ks = giftKeys().sort((a, c) => (like.includes(c) ? 1 : 0) - (like.includes(a) ? 1 : 0)).slice(0, 6);
  if (!ks.length) { G.UI.say([{ n: '', t: '건넬 만한 것이 없어요.' }], end); return; }
  G.UI.say([{ n: '', t: `${me}에게 무엇을 건넬까요?`, choices: ks.map(k => ({ t: `${I[k].n} (${S.inv[k]})`, then: () => { Game.take(k, 1); b.gift = S.day; G.Deeds && G.Deeds.rec && G.Deeds.rec('share', n);
    const lk = like.includes(k), odd = ['stone', 'branch', 'clay', 'straw', 'reed'].includes(k), N = Q.ga(n.name);
    const t = lk ? (KID.has(id) ? `${N} 두 손으로 받아 들고 활짝 웃어요.` : `${N} 반갑게 받아 들어요.`) : odd ? `${N} 고개를 갸웃하며 받아요.` : `${N} 고맙게 받아요.`;
    setTimeout(() => G.UI.say([{ n: '', t }], () => { B.add(id, lk ? 6 : odd ? 1 : 2, '선물'); end(); }), 30); } })).concat([{ t: '좀 더 생각해 보기', then: end }]) }], null); };

// ------------------------------------------------------------------ the doors into everyday talk
const B = G.Bond;
if (B) {
  const talk0 = B.talk; B.talk = function (n, lines, done) { if (Q.is(n)) { n.id = idOf(n) || n.id; return Q.talk(n, done); } return talk0.apply(this, arguments); };
  const chat0 = B.chat; if (chat0) B.chat = function (n, done, again) { if (Q.is(n)) return Q.talk(n, done); return chat0.apply(this, arguments); };
  const gift0 = B.giftPick; B.giftPick = function (n, done) { if (Q.is(n)) return Q.gift(n, done); return gift0.apply(this, arguments); };
}
const Pe = G.Persona;
if (Pe) {
  if (Pe.lines) { const l0 = Pe.lines; Pe.lines = function (n) { if (Q.is(n)) return [{ n: '', t: Q.nod(n) }]; return l0.apply(this, arguments); }; }
  if (Pe.story) { const s0 = Pe.story; Pe.story = function (n) { if (Q.is(n)) return Q.nod(n); return s0.apply(this, arguments); }; }
  /* woken at night: they wake and rub their eyes (no sleepy words) */
  if (Pe.wake) { const w0 = Pe.wake; Pe.wake = function (n) { if (!Q.is(n)) return w0.apply(this, arguments); const say0 = G.UI.say;
    G.UI.say = (ls, done) => say0.call(G.UI, [{ n: '', t: `${Q.ga(n.name)} 잠에서 깨어 눈을 비벼요.` }], done); try { return w0.apply(this, arguments); } finally { G.UI.say = say0; } }; }
}
if (G.Greet && G.Greet.lines) { const g0 = G.Greet.lines; G.Greet.lines = function (n) { if (Q.is(n)) return [{ n: '', t: Q.nod(n) }]; return g0.apply(this, arguments); }; }
if (G.Talk && G.Talk.more) { const m0 = G.Talk.more; G.Talk.more = function (n, id) { if (Q.is(id || n)) return null; return m0.apply(this, arguments); }; }
/* people of the Bible don't chat with each other in bubbles either (cast.js 가족끼리 나누는 말 · ep_joseph_life.js 인사 말풍선) */
Q.bubbleOk = who => !Q.is(who);
})(window.G);
