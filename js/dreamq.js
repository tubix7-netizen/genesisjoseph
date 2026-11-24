/* 약속의 길 — v18.88 곁이야기 「사. 꿈」 깊게 (dreamq.js · caveq.js 다음 · 바탕은 dreamworld.js)
   부탁 하나 = 서로 다른 일 3~5가지 · 함께 하는 사람 · 기다림 · 흔적. 한 부탁 안에서 같은 놀이를 두 번 쓰지 않아요.
   꿈에서는 게임 시간이 흐르지 않아요. 그래서 기다림은 「곁에 머문 진짜 초」로 세요.
   예전에는 「별빛 조각 일곱 줍기」 · 「천사 둘과 말하기」 · 「물가 30초 걷기」였어요.
   ① 흩어진 별빛(d_stars): 곡식단 언덕에서 쓰러진 단 일으키기(균형) → 관원장들의 꿈터에서 포도 짜기(리듬) → 거울 물가에서 물에 비친 별 건지기(받기)
      → 돌 고리 가운데 앉아 밤하늘 기다리기 → 해와 달과 열한 별 잇기(세기)           흔적: 돌 고리 위에 떠 있는 해 · 달 · 열한 별
   ② 사다리의 세 천사(d_angels): 사다리 아래 돌베개 베고 눕기(기다림) → 오르는 천사 · 내려오는 천사와 이야기 → 돌을 기둥으로 세우기(밀기)
      → 기둥 위에 기름 붓기(리듬) → 그곳의 이름(고르기 · 창 28:19)                      흔적: 사다리 아래 기름 바른 돌기둥
   ③ 어머니의 자장가(d_rachel): 기억 속 어머니와 함께 얕은 물을 걷기(함께 걷기) → 어릴 적처럼 갈대 배 접기(세기) → 배 띄워 보내기(균형)
      → 물가에 앉아 자장가를 떠올리기(기다림)                                          흔적: 거울 물가에 떠 있는 갈대 배
   꿈속 어머니는 「기억」이에요(v18.42 규칙: 죽은 이가 새 말을 하지 않아요). 어머니의 말은 괄호 속 기억으로만 나와요.
   저장: S.flags.dq2 = { star, ang, mom } (각각 { s, … }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, DW = G.DW; if (!Game || !EP || !EP.quests || !DW || !G.DWORLD) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.d_stars || !QS.d_angels || !QS.d_rachel) return;
const { X, Z } = G.DWORLD, W2 = q => [X + q[0], Z + q[1]];
const E = k => { const s = S(), f = s.flags.dq2 || (s.flags.dq2 = {}); return f[k] || (f[k] = { s: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), toast = m => G.UI.toast(m);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e) => ({ n: nm(id), t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t }), V = (t, ref) => ({ n: '', t, ref });
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const ask = (q, right, wrong, then, again) => say([{ n: '', t: q, choices: [right].concat(wrong).sort(() => Math.random() - 0.5).map(c => ({ t: c[0], then: () => setTimeout(() => { if (c === right) then(); else say([T(c[1])], () => again && again()); }, 30) })) }], null);
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: typeof k === 'function' ? k : () => (E(key).s | 0) >= k }));
/* a dream wait: real seconds near the spot (the dream's clock stands still) */
let WT = null;
function waitAt(key, at, r, secs, done) { WT = { key, at: W2(at), r, left: secs, done, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);

// ------------------------------------------------------------------ places (dream-local)
const SHEAF = [70, -4], VINE = [0, -66], LAKE = [-8, 24], RING = [0, 14];
const STONE = [1, 79];
const REED = [-8, 24], FLOAT = [-14, 30], SIT = [-6, 26];

// ------------------------------------------------------------------ ① 흩어진 별빛
Object.assign(QS.d_stars, {
  offer: [L('dAngel1', '요셉아, 네가 젊은 날 꾼 꿈들이 이 들판에 흩어져 빛을 잃었구나.'), L('dAngel1', '곡식단 언덕, 관원장들의 꿈터, 거울 물가. 꿈마다 한 조각씩 빛을 되찾고, 돌 고리 가운데서 밤하늘을 기다리렴.')],
  start(s) { const g = s.flags.dShards || (s.flags.dShards = {}); for (let i = 0; i < 7; i++) g[i] = 1; /* (the old seven shards are not scattered any more) */ },
  obj: stageObj('star', [['곡식단 언덕에서 쓰러진 단 일으키기', 1], ['관원장들의 꿈터에서 포도 짜기', 2], ['거울 물가에서 물에 비친 별 건지기', 3], ['돌 고리 가운데 앉아 밤하늘 기다리기', 4], ['해와 달과 열한 별 잇기', 5]]),
  loc: () => { const k = E('star').s | 0, q = [SHEAF, VINE, LAKE, RING, RING][k]; return q ? { x: X + q[0], z: Z + q[1] } : 'npc:dAngel1'; },
  prog: () => ['곡식단 언덕부터 가 보렴. 네 첫 꿈이 거기 있단다.', '관원장들의 꿈터로. 네가 옥에서 풀어 준 꿈이지.', '거울 물가로. 별은 물에도 떠 있단다.', '돌 고리 가운데 앉으렴. 하늘이 내려올 게다.', '이제 이어 보렴.', '보았느냐?'][Math.min(5, E('star').s | 0)],
  done: [L('dAngel1', '잘했다. 너의 형제들이 별처럼 네 앞에 절했던 그 꿈을 기억하느냐?'), V('「해와 달과 열 한 별이 내게 절하더이다」', '창세기 37:9'), L('dAngel1', '높아졌을 때에도, 낮아졌을 때에도 그 별들을 지으신 분이 네 곁에 계셨단다.'), T('돌 고리 위에 해와 달과 열한 별이 떠 있어요.')] });
function starSheaf() { mg('balance', { title: '곡식단 일으키기', hint: '쓰러진 곡식단을 안아 일으켜 세워요. 기울지 않게 ◀ ▶ 로 바로잡아요.', dur: 10 },
  () => { E('star').s = 1; sfx('insight'); G.UI.quest(); say([T('단이 똑바로 서자 이삭 끝에서 작은 빛 하나가 떠올라요.'), J('(내 단은 일어서고, 형들의 단은 둘러서서 절했지. …그때 나는 그 꿈의 무게를 몰랐다.)')]); }); }
function starVine() { mg('rhythm', { title: '포도 짜기', hint: '세 가지에 달린 포도송이를 박자에 맞춰 잔 위에서 짜요.', need: 6, beats: 10, btn: '짜기' },
  () => { E('star').s = 2; sfx('insight'); G.UI.quest(); say([T('잔이 차오르자 그 위에 빛 하나가 맺혀요.'), J('(세 가지는 사흘이었지. 「당신이 득의하거든 나를 생각하고」… 그는 두 해를 잊었다. 그래도 하나님은 잊지 않으셨다.)')]); }); }
function starLake() { mg('catch', { title: '물에 비친 별 건지기', item: 'star', need: 6, dur: 24, hint: '물 위에서 흔들리는 별빛을 두 손으로 떠 올려요.' },
  () => { E('star').s = 3; sfx('insight'); G.UI.quest(); toast('빛 세 조각을 되찾았어요 · 돌 고리 가운데로'); }); }
function starWait() { say([L('dAngel1', '앉으렴. 꿈의 하늘은 서두르는 사람에게 내려오지 않는단다.'), T('돌 고리 가운데 앉아 하늘을 올려다봐요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('star', RING, 4, 9, () => { E('star').s = 4; G.UI.quest(); narr({ t: '내려오는 하늘', s: '박하빛 하늘이 천천히 짙은 남빛으로 바뀌어요. 되찾은 세 빛이 떠올라 해와 달이 되고, 그 둘레로 희미한 별들이 돋아나요.' }, () => toast('별을 하나씩 이어요')); })); }
function starJoin() { mg('count', { title: '열한 별 잇기', hint: '희미한 별을 하나씩 눌러 해와 달 둘레에 밝혀요. 형들의 수만큼.', need: 11, btn: '밝히기', onPress: () => sfx('click', { pitch: 1.6, vol: 0.4 }) },
  () => { E('star').s = 5; sfx('quest'); G.UI.quest(); toast('해와 달과 열한 별 · 빛나는 천사에게'); }); }

// ------------------------------------------------------------------ ② 사다리의 세 천사
const angN = () => Object.keys(S().flags.dAng || {}).length;
Object.assign(QS.d_angels, {
  offer: [L('dAngel2', '이 사다리는 네 아버지 야곱이 벧엘에서 본 것이란다.'), L('dAngel2', '그 밤 네 아버지처럼, 저 돌을 베고 누워 보겠느냐? 그리고 오르내리는 벗들과 이야기해 보렴.')],
  obj: [{ t: '사다리 아래 돌베개를 베고 누워 보기', ok: () => (E('ang').s | 0) >= 1 }, { t: '오르는 천사 · 내려오는 천사와 이야기하기', ok: () => angN() >= 2 }, { t: '베개 돌을 기둥으로 세우기', ok: () => (E('ang').s | 0) >= 2 }, { t: '기둥 위에 기름 붓기', ok: () => (E('ang').s | 0) >= 3 }, { t: '그곳의 이름 부르기', ok: () => (E('ang').s | 0) >= 4 }],
  loc: () => { const k = E('ang').s | 0; if (k === 0) return { x: X + STONE[0], z: Z + STONE[1] }; if (angN() < 2) { const D = S().flags.dAng || {}, id = ['dAngel3', 'dAngel4'].find(i => !D[i]); return 'npc:' + id; } if (k < 4) return { x: X + STONE[0], z: Z + STONE[1] }; return 'npc:dAngel2'; },
  prog: () => (E('ang').s | 0) === 0 ? '돌을 베고 누워 보렴. 네 아버지도 지쳐 그렇게 잠들었단다.' : angN() < 2 ? '오르는 벗과 내려오는 벗, 둘 다 네게 할 말이 있단다.' : '네 아버지가 아침에 한 일을 기억하느냐?',
  done: [L('dAngel2', '땅에서 하늘까지 이어진 그 길을, 네 아버지도 너도 걸었구나.'), V('「여호와께서 과연 여기 계시거늘 내가 알지 못하였도다」', '창세기 28:16'), L('dAngel2', '애굽에서도, 옥에서도, 그분은 과연 거기 계셨단다.'), T('사다리 아래에 기름 바른 돌기둥이 섰어요.')] });
function angLie() { say([T('사다리 아래 매끈한 돌을 베고 누워요 · 자리를 뜨면 멈춰요')], () => { const p = P(); waitAt('ang', STONE, 3, 8, () => { E('ang').s = 1; G.UI.quest();
  narr({ t: '오르락 내리락', s: '눈을 감았다 뜨니, 사다리 위로 빛나는 이들이 오르고 또 내려와요.\n\n「꿈에 본즉 사닥다리가 땅위에 섰는데 그 꼭대기가 하늘에 닿았고 또 본즉 하나님의 사자가 그 위에서 오르락 내리락하고」 (창 28:12)' }, () => toast('오르는 천사와 내려오는 천사에게 말을 걸어요')); }); void p; }); }
function angRaise() { mg('push', { title: '돌기둥 세우기', hint: '베고 잤던 돌을 꾹 밀어 일으켜 세우고, 밑동을 흙으로 다져요.', btn: '밀기' }, () => { E('ang').s = 2; sfx('thud', { vol: 0.6, pitch: 0.7 }); G.UI.quest(); toast('돌이 섰어요 · 이제 기름을'); }); }
function angOil() { mg('rhythm', { title: '기름 붓기', hint: '박자에 맞춰 기둥 꼭대기에 기름을 천천히 부어요.', need: 6, beats: 10, btn: '붓기' }, () => { E('ang').s = 3; sfx('splash', { vol: 0.3, pitch: 1.4 }); G.UI.quest();
  const go = () => ask('네 아버지는 이곳을 무엇이라 불렀을까?', ['벧엘 · 하나님의 집', ''], [['마하나임 · 두 진', '마하나임은 네 아버지가 하란에서 돌아오다 하나님의 군대를 만난 곳이란다 (창 32:2).'], ['브니엘 · 하나님의 얼굴', '브니엘은 네 아버지가 얍복 나루에서 씨름한 곳이란다 (창 32:30).']],
    () => say([V('「그곳 이름을 벧엘이라 하였더라」', '창세기 28:19'), J('(하나님의 집… 아버지가 돌베개 하나로 그 집을 세우셨구나.)')], () => { E('ang').s = 4; G.UI.quest(); toast('사다리를 지키는 천사에게'); }), () => go()); go(); }); }

// ------------------------------------------------------------------ ③ 어머니의 자장가
Object.assign(QS.d_rachel, {
  obj: stageObj('mom', [['기억 속 어머니와 함께 얕은 물을 걷기', 1], ['어릴 적처럼 갈대 배 접기', 2], ['갈대 배 띄워 보내기', 3], ['물가에 앉아 자장가를 떠올리기', 4]]),
  loc: () => { const k = E('mom').s | 0, q = [null, REED, FLOAT, SIT][k]; if (k === 0) return 'npc:dRachel'; return q ? { x: X + q[0], z: Z + q[1] } : 'npc:dRachel'; },
  prog: () => ['(천천히 걷자꾸나. 물소리를 들으면 마음이 고요해진단다.)', '(갈대는 꺾지 말고, 쓰러진 것으로.)', '(놓아 주는 것도 배우는 거란다.)', '(눈을 감으렴.)', '…'][Math.min(4, E('mom').s | 0)],
  done: [J('(「잘 자거라, 내 아들.」 그 목소리를 기억하며 요셉은 하나님께 감사했어요.)', 'tender'), T('거울 물가에 작은 갈대 배가 떠 있어요.')] });
function momWalk() { const n = Game.npc('dRachel'); if (!n) return; n.talking = false; const f = E('mom'); f.walk = 1; f.t = f.t || 0; n.walk = null; n.wander = null; Game.npcFollow('dRachel', true); G.UI.quest(); toast('어머니(기억)가 곁에서 걸어요 · 얕은 물을 천천히 걸어요'); }
function momReed() { mg('count', { title: '갈대 배 접기', hint: '쓰러진 갈대를 주워 반으로 접고, 끝을 엮어 작은 배를 만들어요.', need: 5, btn: '접기', onPress: () => sfx('rustle', { vol: 0.4 }) },
  () => { E('mom').s = 2; G.UI.quest(); say([J('(어머니는 베냐민을 배 속에 품고도 이렇게 배를 접어 주셨지. 「이 배가 가는 곳까지 하나님이 함께 가신단다.」)', 'tender')]); }); }
function momFloat() { mg('balance', { title: '갈대 배 띄우기', hint: '물결이 잔잔할 때 손바닥에 얹어 살며시 띄워요. 기울면 ◀ ▶ 로 바로잡아요.', dur: 9 },
  () => { E('mom').s = 3; sfx('splash', { vol: 0.3, pitch: 1.6 }); G.UI.quest(); toast('갈대 배가 거울 물가로 흘러가요'); }); }
function momSit() { say([T('물가에 앉아 눈을 감아요 · 자리를 뜨면 멈춰요')], () => waitAt('mom', SIT, 3.4, 10, () => { E('mom').s = 4; G.UI.quest();
  narr({ t: '자장가', s: '물소리 사이로 아주 오래전 장막 안의 노랫소리가 떠올라요. 가사는 다 생각나지 않지만, 머리를 쓸어 주던 손의 따뜻함은 또렷해요.' }, () => toast('기억 속 어머니에게 말을 걸어 마무리해요')); })); }

// ------------------------------------------------------------------ 행동 단추 (꿈속에서만)
Game.CTX.push(function (s) { if (!DW.on() || G.UI.busy()) return null; const p = P(), out = [];
  const at = (pt, r, label, key, use) => { const q = W2(pt), d = Math.hypot(q[0] - p.x, q[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: q[0], z: q[1], y: 1, label, key, story: true, noMagnet: true, use }); };
  if (on('d_stars')) { const k = E('star').s | 0; if (k === 0) at(SHEAF, 4, '쓰러진 곡식단 일으키기', 'dqS0', starSheaf); if (k === 1) at(VINE, 4, '포도 짜기', 'dqS1', starVine); if (k === 2) at(LAKE, 4, '물에 비친 별 건지기', 'dqS2', starLake); if (k === 3 && !waiting('star')) at(RING, 4, '돌 고리 가운데 앉기', 'dqS3', starWait); if (k === 4) at(RING, 4, '열한 별 잇기', 'dqS4', starJoin); }
  if (on('d_angels')) { const k = E('ang').s | 0; if (k === 0 && !waiting('ang')) at(STONE, 3, '돌베개 베고 눕기', 'dqA0', angLie); if (k === 1 && angN() >= 2) at(STONE, 3, '돌을 기둥으로 세우기', 'dqA1', angRaise); if (k === 2) at(STONE, 3, '기둥 위에 기름 붓기', 'dqA2', angOil); }
  if (on('d_rachel')) { const k = E('mom').s | 0, n = Game.npc('dRachel'); if (k === 0 && !E('mom').walk && n && Math.hypot(n.x - p.x, n.z - p.z) < 3.2) out.push({ d: -0.3, x: n.x, z: n.z, y: 1.6, label: '어머니와 물가 걷기', key: 'dqM0', story: true, noMagnet: true, use: momWalk }); if (k === 1) at(REED, 3.4, '갈대 배 접기', 'dqM1', momReed); if (k === 2) at(FLOAT, 4, '갈대 배 띄우기', 'dqM2', momFloat); if (k === 3 && !waiting('mom')) at(SIT, 3.4, '물가에 앉기', 'dqM3', momSit); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ 기다림 · 함께 걷기
let LP = null;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try { if (!DW.on()) { WT = null; return r; }
    if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } }
    /* ③ walking in the shallows beside her: 20 seconds of it */
    if (on('d_rachel')) { const f = E('mom'), n = Game.npc('dRachel');
      if ((f.s | 0) === 0 && f.walk && n) { if (!n.follow && !n.talking) Game.npcFollow('dRachel', true); const wet = DW.h(p.x, p.z) < DW.level, mv = LP ? Math.hypot(p.x - LP[0], p.z - LP[1]) : 0; LP = [p.x, p.z]; if (wet && mv > 0.004 && mv < 2 && Math.hypot(n.x - p.x, n.z - p.z) < 5) { f.t = (f.t || 0) + d; /* (really moving through the shallows, not standing) */
          if (f.t >= 20) { f.s = 1; f.walk = 0; Game.npcFollow('dRachel', false); n.walk = null; G.UI.quest(); say([J('(어머니는 물에 발을 담그면 늘 웃으셨지. 「요셉아, 물은 낮은 데로 흐른단다. 그래서 모두를 적시지.」)', 'tender'), T('물가의 쓰러진 갈대가 눈에 띄어요')]); } } } }
  } catch (e) { console.error('dreamq', e); }
  return r; };

// ------------------------------------------------------------------ 흔적 (꿈속에서만)
const MS = {}, MP = []; let mk = 0;
const mkM = (seed, fn) => { const g = new G.GB(seed); fn(g); return G.R.mesh(g); };
function meshes() {
  MS.sun = mkM(971, g => g.sph(0.7, 12, 9, { c: 0xffd060 })); MS.moon = mkM(972, g => g.sph(0.45, 10, 8, { c: 0xe8ecff })); MS.star = mkM(973, g => g.sph(0.16, 6, 5, { c: 0xfff4c8 }));
  MS.pillar = mkM(974, g => { g.box(0.55, 1.6, 0.45, { at: [0, 0.8, 0], c: 0x9a8a72, j: 0.05 }); g.box(0.5, 0.06, 0.4, { at: [0, 1.62, 0], c: 0xd8c070 }); g.cyl(0.4, 0.5, 0.12, 8, { at: [0, 0.06, 0], c: 0x6a5a44 }); });
  MS.boat = mkM(975, g => { g.box(0.12, 0.06, 0.7, { at: [0, 0.03, 0], c: 0xc8b070 }); for (const s of [-1, 1]) g.box(0.03, 0.12, 0.6, { at: [s * 0.07, 0.08, 0], c: 0xb8a060 }); g.box(0.02, 0.2, 0.02, { at: [0, 0.16, 0.05], c: 0x9a8050 }); });
  MS.ok = 1; }
const putM = (list, mesh, x, y, z, ry, sc, emis) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, x, y, z, ry || 0, 0, 0, sc || 1, sc || 1, sc || 1); list.push(Object.assign({ mesh, m, outline: !emis }, emis ? { emis } : {})); };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.dq2 || !DW.on()) return; try { if (!MS.ok) meshes(); mk = 0; const q = s.flags.dq2, g = k => (q[k] && q[k].s) | 0, t = performance.now() / 1000;
    const sk = g('star'); if (sk >= 4) { const [cx, cz] = W2(RING), y0 = DW.h(cx, cz) + 9; putM(list, MS.sun, cx - 2.2, y0 + 1, cz, 0, 1, [1.8, 1.4, 0.5]); putM(list, MS.moon, cx + 2.2, y0 + 0.8, cz, 0, 1, [1.1, 1.15, 1.4]);
      const n = sk >= 5 ? 11 : 3; for (let i = 0; i < n; i++) { const a = i / 11 * Math.PI * 2 + t * 0.05, rr = 5.2 + (i % 2) * 0.8; putM(list, MS.star, cx + Math.cos(a) * rr, y0 + Math.sin(t * 1.3 + i) * 0.2 - 0.5 + (i % 3) * 0.4, cz + Math.sin(a) * rr, 0, 1, [1.6, 1.5, 1.0]); } }
    if (g('ang') >= 2) { const [x, z] = W2(STONE); putM(list, MS.pillar, x, DW.h(x, z), z, 0.3); }
    if (g('mom') >= 3) { const [x, z] = W2(FLOAT), dx = Math.sin(t * 0.2) * 1.5; putM(list, MS.boat, x + dx, DW.level + 0.01 + Math.sin(t * 1.7) * 0.02, z + Math.cos(t * 0.17) * 1.2, t * 0.1); }
  } catch (e) { console.error('dreamq dyn', e); } };
G.DreamQ = { E, WT: () => WT };
})(window.G);
