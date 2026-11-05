/* 약속의 길 — 바다 건너 그발(비블로스) (v18.23)
   그발(비블로스)은 레바논 바닷가의 항구 도시예요. 요셉 시대보다 훨씬 전부터 애굽과 사이가 좋아서, 그발의 백향목이 애굽의
   배와 궁의 기둥이 되었고, 애굽은 곡식·세마포·금을 보냈어요. 흉년이 들자 "각국 백성도 양식을 사려고 애굽으로 들어와
   요셉에게로 왔으니"(창 41:57).
   · 요셉이 총리가 된 뒤(c5_patrol부터) 나일 강 북쪽 나루에 그발 배가 들어와요. 선장 엘론에게 말하면 배를 타고 그발로 가요.
   · 그발: 항구와 배, 쌓아 둔 백향목, 성벽과 성문, 백향목 기둥의 왕궁, 장터(자주색 천), 우물, 뒤로는 눈 덮인 레바논 산과 백향목 숲.
     장로 아빗(곡식 자루 3개 → 백향목·은), 백향목 장수 하람(가게), 어부·나무꾼·자색 천 짜는 여인·아이·성문지기.
   · 그발에 있는 동안에는 애굽 땅 대신 그발의 땅과 바다만 그려요 (지도 밖 높은 곳에 무대를 세워 두고 땅·건물·바다를 바꿔 끼워요). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(sub ? t + ' · ' + sub : t);
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const vz = () => after('c5_patrol');
const BX = 100, BZ = -200, BY = 64, SEA = BY - 1.3; // the stage: above every hill of the real map (they top out near 55)
const inBy = () => { const s = S(); return !!(s && s.flags && s.flags.byblos); };
const Q = { x: -95.4, z: -71, deckY: 0.55 }; // the Nile quay (east bank, just south of the north ford)
Object.assign(Game.ITEMS, { cedar: { n: '백향목', cat: 'good', p: 30, ic: 'log', c: '#a0603a' }, purple: { n: '자주색 천', cat: 'good', p: 56, ic: 'cloth', c: '#7a2a7a' } });
EP.shops = EP.shops || {};
EP.shops.byShop = { n: '백향목 장수 하람', sells: ['good', 'crop', 'food'], no: ['cedar', 'purple', 'olive', 'fig'], mul: { good: 1.35, crop: 1.15 }, buy: [{ n: '백향목', item: 'cedar', qty: 1, price: 24, d: '향기롭고 썩지 않는 나무 · 애굽에 가면 비싸요' }, { n: '자주색 천', item: 'purple', qty: 1, price: 48, d: '바다 고둥으로 물들인 귀한 천' }, { n: '올리브 ×4', item: 'olive', qty: 4, price: 12 }, { n: '무화과 ×4', item: 'fig', qty: 4, price: 9 }].filter(x => Game.ITEMS[x.item]) };
(EP.places = EP.places || []).push({ n: '나일 나루 · 그발 가는 배', x: Q.x, z: Q.z, when: () => vz() });

// ------------------------------------------------------------------ people
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
const tint = (b, o) => Object.assign({}, b || {}, o);
const BYN = [];
function person(d) { d.show = d.show || (() => inBy()); d.noBond = true; EP.npcs.push(d); BYN.push(d.id); return d; }
const L0 = lookOf('bySidon') || lookOf('byEdom'), LF = lookOf('byWoman') || L0;
person({ id: 'byElder', name: '그발 장로 아빗', look: tint(L0, { top: 0x6a2a6a, trim: 0xe5b552, beard: 'long', hair: 0xd8d0c8, age: 'old' }), x: BX, z: BZ + 8.4, face: Math.PI, talkR: 3 });
person({ id: 'byCedar', name: '백향목 장수 하람', look: tint(L0, { top: 0x2c5aa0, trim: 0xd8c8a0 }), x: BX + 12.6, z: BZ - 1.2, face: -Math.PI / 2 });
person({ id: 'bySail', name: '그발 배 선장 엘론', look: tint(L0, { top: 0xb3472e, trim: 0x3a2a1a, beard: 'short' }), x: BX - 14, z: BZ - 26.6, face: 0, talkR: 3 });
person({ id: 'byFish', name: '그발 어부 세렉', look: tint(L0, { top: 0x8a7a5a }), x: BX + 22, z: BZ - 22.5, face: Math.PI, wander: 4, prop: 'fishrod', chat: ['오늘은 고기가 잘 잡혀요!', '애굽 강물은 잔잔하다지요? 여기 바다는 성이 나면 무서워요.'] });
person({ id: 'byWood', name: '나무꾼 히람', look: tint(L0, { top: 0x5a6a3a, build: 1.15 }), x: BX - 27, z: BZ - 19.5, face: Math.PI, prop: 'axe', act: 'chop', chat: ['레바논 산 백향목은 곧고 단단해요.', '이 나무들이 애굽으로 가서 배가 되고 궁의 기둥이 돼요.'] });
person({ id: 'byDye', name: '자색 천 짜는 엘리사', look: tint(LF, { top: 0x7a2a7a, trim: 0xe8dcc0 }), x: BX + 8, z: BZ + 1, face: 0, wander: 3, chat: ['바다 고둥 만 마리에서 겨우 이만큼 물감이 나와요.', '애굽 세마포에 자주색을 물들이면 왕의 옷이 되지요.'] });
person({ id: 'byKid', name: '그발 아이 아다', look: tint(LF, { top: 0xe8c040 }), x: BX - 6, z: BZ, face: 0, wander: 6, scale: 0.6, chat: ['애굽 사람이다! 피라미드 진짜 커요?', '배 타고 오셨어요? 저도 크면 선장이 될 거예요!'] });
person({ id: 'byGuard', name: '그발 성문지기 바락', look: tint(L0, { top: 0x8a3a2a, trim: 0xc8a040 }), x: BX + 4.2, z: BZ + 24, face: Math.PI, prop: 'spear', chat: ['그발 성에 오신 것을 환영합니다!', '성문 밖은 레바논 산 숲이에요. 길이 험해요.'] });
person({ id: 'egElon', name: '그발 배 선장 엘론', look: tint(L0, { top: 0xb3472e, trim: 0x3a2a1a, beard: 'short' }), x: Q.x - 0.8, z: Q.z, face: Math.PI / 2, talkR: 3, show: () => !inBy() && vz() });

// ------------------------------------------------------------------ the voyage
function canSail() { const p = P(), s = S(); if (p.ride) return '나귀에서 먼저 내려 주세요'; if (s.q && s.q.riding) return '수레에서 먼저 내려 주세요';
  if ((p.follow || []).length) return '함께 가는 사람이 있을 땐 배를 탈 수 없어요'; if ((G.Phys && G.Phys.held) || p.carry) return '들고 있는 것을 먼저 내려놓아요'; return null; }
function sail(toBy) { const why = canSail(); if (why) { pop('배를 탈 수 없어요', why, 'house'); return; } const s = S(), p = P();
  G.UI.fade(() => { if (s.q && s.q.cartPax && G.Cart && G.Cart.dropPax) try { G.Cart.dropPax(); } catch (e) { }
    s.time = Math.min((s.time || 8) + 3, 25); s.flags.byblos = toBy ? 1 : 0; sync(true);
    if (toBy) { Game.teleport(BX - 14, BZ - 25.4, 0); p.y = p.airTop = BY; } else { Game.teleport(Q.x + 1.6, Q.z, Math.PI / 2); }
    sfx('splash', { vol: 0.5, pitch: 0.7 }); }, () => {
    if (toBy) { if (!(G.UI.help && G.UI.help('byblos', '그발(비블로스)', '애굽과 사이좋은 바닷가 나라예요 · 돌아갈 땐 선장 엘론에게 말해요'))) pop('그발 도착!', '백향목의 나라 · 애굽의 오랜 벗', 'house'); }
    else pop('애굽 도착!', '나일 강 북쪽 나루', 'house'); }); }
// ------------------------------------------------------------------ talking
const say = (l, cb) => G.UI.say(l, cb), Ln = (n, t) => ({ n, t });
const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(), done = () => { const n = Game.npc(id); if (n) n.talking = false; };
  if (id === 'egElon') { const h = s.time % 24; if (h > 20.5 || h < 5) { say([Ln('그발 배 선장 엘론', '밤바다에는 배를 띄우지 않아요. 날이 밝으면 오세요!')], done); return true; }
    const intro = s.flags.byMet ? [] : [Ln('그발 배 선장 엘론', '애굽의 총리님! 저는 그발에서 백향목을 싣고 온 선장 엘론입니다.'), Ln('그발 배 선장 엘론', '그발은 북쪽 바닷가, 레바논 산 아래 있는 나라예요. 애굽과는 아주 오래된 벗이지요.')];
    s.flags.byMet = 1; say(intro.concat([{ n: '그발 배 선장 엘론', t: '그발에 가 보시겠어요? 배로 한나절이면 가요.', choices: [{ t: '배 타고 그발로 가기', then: () => { done(); sail(true); } }, { t: '다음에요', then: done }] }]), done); return true; }
  if (id === 'bySail') { say([{ n: '그발 배 선장 엘론', t: '애굽으로 돌아가실까요?', choices: [{ t: '배 타고 애굽으로', then: () => { done(); sail(false); } }, { t: '조금 더 둘러볼게요', then: done }] }], done); return true; }
  if (id === 'byCedar') { say([Ln('백향목 장수 하람', '어서 오세요! 레바논 산에서 갓 베어 온 백향목이에요. 애굽 세마포도 값을 잘 쳐 드려요.')], () => { done(); G.UI.shop('byShop'); }); return true; }
  if (id === 'byElder') { const fam = after('c6_open'), g = (s.inv && s.inv.grain) || 0, today = s.flags.byTrade === s.day;
    const first = s.flags.byElder ? [] : [Ln('그발 장로 아빗', '애굽의 총리님이 몸소 오시다니, 그발의 큰 영광입니다!'), Ln('그발 장로 아빗', '우리 그발의 백향목은 애굽의 배와 궁이 되고, 애굽의 곡식과 세마포는 우리를 먹이고 입혀 왔지요.')];
    s.flags.byElder = 1;
    const word = fam ? Ln('그발 장로 아빗', '온 땅에 흉년이 들었어요. 총리님이 곡식을 모아 두신 덕분에, 우리 백성도 애굽에 가서 양식을 삽니다.') : Ln('그발 장로 아빗', '애굽에 풍년이 들었다지요? 곡식이 넉넉하면 우리 백향목과 바꾸어 주세요.');
    if (today) { say(first.concat([word, Ln('그발 장로 아빗', '오늘 주신 곡식은 백성들에게 잘 나누었어요. 고맙습니다!')]), done); return true; }
    if (g >= 3) { say(first.concat([word, { n: '그발 장로 아빗', t: '곡식 자루 셋을 나눠 주시겠어요? 백향목과 은으로 갚겠어요.', choices: [{ t: '곡식 자루 3개 건네기', then: () => { done(); s.inv.grain -= 3; s.flags.byTrade = s.day; s.flags.byTradeN = (s.flags.byTradeN || 0) + 1; Game.give('cedar', 4); Game.silver(fam ? 30 : 15); const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 12); pop('곡식을 나눴어요', `백향목 4 · 은 ${fam ? 30 : 15} · 정신력 +12`, 'star'); sfx('coins'); G.UI.hud(); } }, { t: '다음에요', then: done }] }]), done); return true; }
    say(first.concat([word, Ln('그발 장로 아빗', '곡식 자루 셋을 가져다주시면, 백향목과 은으로 갚겠어요.')]), done); return true; }
  return lt0.apply(this, arguments); };
// a few words between the people of Byblos
const TALK = [['배가 내일 애굽으로 떠난대요.', '백향목을 잔뜩 싣는다지요?'], ['올해 자색 물감이 곱게 나왔어요.', '애굽 궁에서 좋아하겠네요!'], ['레바논 산에 눈이 아직 남았네.', '그래서 레바논을 흰 산이라고 하지요.'], ['애굽 총리님이 오셨대!', '곡식을 모아 두신 그분 말이지요?'], ['오늘은 바다가 잔잔하네.', '고기 잡기 좋은 날이에요.']];
let tT = 0; const cool = {};
function chatter(dt) { tT -= dt; if (tT > 0) return; tT = 6 + Math.random() * 6; if (G.UI.busy()) return; const now = performance.now() / 1000, p = P();
  const ns = BYN.map(id => Game.npc(id)).filter(n => n && n.vis && !n.talking && Math.hypot(n.x - p.x, n.z - p.z) < 24);
  for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) { const a = ns[i], b = ns[j], k = a.id + b.id; if ((cool[k] || 0) > now || Math.hypot(a.x - b.x, a.z - b.z) > 7) continue; cool[k] = now + 80;
    const L = TALK[Math.floor(Math.random() * TALK.length)]; G.Life.bubble(a.id, L[0], 2.6); setTimeout(() => G.Life.bubble(b.id, L[1], 2.8), 1500); return; } }

// ------------------------------------------------------------------ building the stage (once, at world build)
let STAGE = null; const COLS = [];
const LIME = 0xc4b490, LIME2 = 0xae9e7e, CEDAR = 0x5a3a24, LEAF = 0x2f5a3a, LEAF2 = 0x3a6a44;
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { buildQuay(W); STAGE = buildStage(W); } catch (e) { console.error('byblos', e); } };
function buildQuay(W) { const E = EP.envx || {}, x0 = Q.x + 0.6, x1 = -107.5, y = Q.deckY, z = Q.z, mid = (x0 + x1) / 2, len = x0 - x1;
  W.place((g, M) => { g.box(len, 0.16, 2.6, { m: M, at: [0, -0.08, 0], c: 0x8a6a48 }); for (let i = 0; i < Math.floor(len / 0.5); i++) g.box(0.06, 0.02, 2.62, { m: M, at: [-len / 2 + 0.25 + i * 0.5, 0.005, 0], c: 0x5a4230, j: 0 });
    for (let i = 0; i <= Math.floor(len / 2.4); i++) for (const s of [-1, 1]) g.cyl(0.12, 0.14, 2.4, 6, { m: M, at: [-len / 2 + 0.2 + i * 2.4, -1.2, s * 1.15], c: 0x5a4230 }); }, mid, z, { y });
  if (E.felucca) { W.place(E.felucca, -104.5, z - 3.2, { y: -0.3, ry: 0.05, kind: 'felucca', s: 1.25 }); W.place(E.felucca, -102, z + 3.1, { y: -0.3, ry: -0.08, kind: 'felucca' }); }
  for (const [fn, x, zz, ry] of [['logX', -90.6, -75.6, 0.2], ['woodStack', -89.4, -72.6, 0.5], ['ampRack', -90.2, -67.4, 1.4], ['bales', -88.6, -69.6, 0.3]]) if (E[fn]) W.place(E[fn], x, zz, { ry });
  EP._quay = { x0: x1, x1: x0 + 0.2, z0: z - 1.3, z1: z + 1.3, y: y + 0.0 }; }
function cedarTree(g, x, y, z, s) { g.cyl(0.22 * s, 0.34 * s, 3.2 * s, 6, { at: [x, y + 1.6 * s, z], c: CEDAR });
  for (let k = 0; k < 4; k++) g.cyl(0.3 * s, (2.6 - k * 0.5) * s, 0.55 * s, 9, { at: [x, y + (2.0 + k * 1.05) * s, z], c: k % 2 ? LEAF2 : LEAF }); g.cyl(0.05, 0.5 * s, 0.9 * s, 7, { at: [x, y + 6.3 * s, z], c: LEAF }); }
function buildStage(W) { const R = G.R, g = new G.GB(77), cols = [], C = (o) => { const c = W.addCol(Object.assign({ on: false }, o)); COLS.push(c); return c; }, X = BX, Z = BZ;
  const box = (w, h, d, x, y, z, c, o) => g.box(w, h, d, Object.assign({ at: [X + x, y, Z + z], c }, o || {}));
  // ground: a limestone shelf by the sea, a sand beach, paved streets, gardens
  box(96, 14, 58, 0, BY - 7, 1, 0x9a8a68); box(300, 14, 110, 0, BY - 7.6, 84, 0x6e7a52); // the town shelf · the green feet of Lebanon behind it box(96, 0.06, 6, 0, BY + 0.01, -25, 0xd0bc8a, { j: 0.02 }); box(97, 1.2, 4, 0, SEA - 0.1, -29.2, 0xd8c898, { rx: 0.18 });
  box(6, 0.06, 46, 0, BY + 0.02, 2, 0xa89c84, { j: 0.03 }); box(84, 0.06, 5, 0, BY + 0.025, 4, 0xa89c84, { j: 0.03 });
  for (const [x, z, w, d] of [[-28, 17, 30, 14], [28, 17, 30, 14], [-30, -6, 18, 10], [32, -4, 14, 8]]) box(w, 0.05, d, x, BY + 0.015, z, 0x5e7e42, { j: 0.06 });
  box(4, 14, 18, -14, BY - 7, -36, 0xa89a82); for (let i = 0; i < 4; i++) for (const s of [-1, 1]) g.cyl(0.18, 0.22, 0.6, 7, { at: [X - 14 + s * 1.6, BY + 0.3, Z - 30 - i * 4], c: 0x6a5a48 }); // the stone quay with bollards
  // houses of stone and cedar beams (flat roofs)
  const house = (x, z, w, d, h, rot) => { const W2 = rot ? d : w, D2 = rot ? w : d; box(W2, h, D2, x, BY + h / 2, z, LIME); box(W2 + 0.4, 0.28, D2 + 0.4, x, BY + h + 0.1, z, LIME2);
    const n = Math.floor(W2 / 0.9); for (let i = 0; i < n; i++) box(0.18, 0.18, 0.4, x - W2 / 2 + 0.45 + i * 0.9, BY + h - 0.35, z - D2 / 2 - 0.08, CEDAR, { j: 0 });
    box(1.0, 1.9, 0.08, x, BY + 0.95, z - D2 / 2 - 0.03, 0x3a2818, { j: 0 }); box(0.6, 0.45, 0.08, x - W2 / 4, BY + h * 0.66, z - D2 / 2 - 0.03, 0x2a2018, { j: 0 }); box(0.6, 0.45, 0.08, x + W2 / 4, BY + h * 0.66, z - D2 / 2 - 0.03, 0x2a2018, { j: 0 });
    C({ x: X + x, z: Z + z, w: W2, d: D2, y0: BY - 1, y1: BY + h + 0.3, cam: true }); };
  for (const h of [[-30, -12, 7, 6, 4.2], [-21, -14, 6, 5, 3.6], [-35, 1, 6, 6, 4, 1], [-26, 10, 7, 5, 4.4], [-37, 13, 5, 5, 3.4], [-10, -12, 5, 5, 3.6], [24, -13, 7, 5, 4], [33, -11, 6, 6, 3.8], [35, 2, 6, 5, 4.2, 1], [26, 12, 7, 6, 4], [-14, 12, 5, 5, 3.8]]) house(...h);
  // the king's hall: cedar columns, a deep porch, steps
  box(16, 6.4, 9, 0, BY + 3.2, 16, LIME); box(17, 0.45, 13, 0, BY + 6.6, 14.2, LIME2); box(9, 0.3, 1.3, 0, BY + 0.15, 9.3, LIME2); box(10, 0.6, 0.5, 0, BY + 5.9, 8.4, CEDAR);
  for (let i = 0; i < 6; i++) { const x = -6.5 + i * 2.6; g.cyl(0.32, 0.36, 5.8, 10, { at: [X + x, BY + 2.9, Z + 8.8], c: CEDAR }); g.cyl(0.46, 0.46, 0.3, 10, { at: [X + x, BY + 5.75, Z + 8.8], c: 0xc8a040 }); C({ x: X + x, z: Z + 8.8, r: 0.38, y0: BY - 1, y1: BY + 6 }); }
  box(2.2, 3, 0.1, 0, BY + 1.5, 11.47, 0x3a2818, { j: 0 }); C({ x: X, z: Z + 16, w: 16, d: 9, y0: BY - 1, y1: BY + 7, cam: true });
  // the city wall with a gate and towers
  const wall = (x, z, w, d) => { box(w, 5, d, x, BY + 2.5, z, LIME2); const along = w > d, L = along ? w : d; for (let k = 0; k < Math.floor(L / 2); k++) { const o = -L / 2 + 1 + k * 2; box(along ? 1 : d, 0.8, along ? d : 1, along ? x + o : x, BY + 5.4, along ? z : z + o, LIME2, { j: 0 }); } C({ x: X + x, z: Z + z, w, d, y0: BY - 1, y1: BY + 6 }); };
  wall(-24.75, 26, 43.5, 1.4); wall(24.75, 26, 43.5, 1.4); wall(-46.5, 4, 1.4, 44); wall(46.5, 4, 1.4, 44);
  for (const s of [-1, 1]) { box(3.2, 7.4, 3.2, s * 4.6, BY + 3.7, 26, LIME); box(3.6, 0.5, 3.6, s * 4.6, BY + 7.6, 26, LIME2); C({ x: X + s * 4.6, z: Z + 26, w: 3.2, d: 3.2, y0: BY - 1, y1: BY + 8 }); }
  box(6, 0.6, 1.6, 0, BY + 5.6, 26, CEDAR); // the gate's cedar lintel
  // props from the shared kit: well, stalls, logs, jars, boats
  const E = Object.assign({}, G.env || {}, EP.envx || {}), put = (fn, x, z, o) => { if (E[fn]) W.place(E[fn], X + x, Z + z, Object.assign({ gb: g, y: BY }, o || {})); };
  put('well', 0, 3); C({ x: X, z: Z + 3, r: 1.7, y0: BY - 1, y1: BY + 1 });
  for (const [x, z, ry] of [[10, -4, 0], [16, -4, 0], [13, 4.2, Math.PI]]) { put('stallM', x, z, { ry }); box(3.2, 0.08, 2.2, x, BY + 2.35, z, 0x6a2a6a, { rx: 0.12, j: 0 }); C({ x: X + x, z: Z + z, w: 2.6, d: 1.4, y0: BY - 1, y1: BY + 1.1 }); }
  for (const [fn, x, z, ry] of [['logX', -26, -23, 0.1], ['logX', -31, -21.5, -0.1], ['woodStack', -21.5, -20.5, 0.4], ['ampRack', -8, -23.5, 0], ['bales', -4, -21.5, 0.2], ['sacks', 18.5, -1, 0], ['pots', 8, 4.5, 0]]) { put(fn, x, z, { ry }); }
  for (const [x, z, w, d] of [[-28.5, -22.3, 9, 3.5], [-21.5, -20.5, 1.6, 1.6], [-8, -23.5, 2.4, 1], [-4, -21.5, 1.6, 1.6]]) C({ x: X + x, z: Z + z, w, d, y0: BY - 1, y1: BY + 1.2 });
  for (const [x, z, s, ry] of [[-19.5, -37, 1.7, 0.02], [-8.6, -36, 1.5, -0.06], [21, -27.4, 0.75, 1.5], [28, -27.8, 0.7, 1.7]]) put('felucca', x, z, { s, ry, y: SEA - 0.25 });
  for (const [x, z] of [[-40, 20], [38, 21], [-18, 21], [18, 21]]) put('olive', x, z, { s: 0.9 });
  // cedars: in the town, outside the wall, and up the slopes of Lebanon
  for (const [x, z, s] of [[-42, -3, 1], [42, -5, 1.05], [-8, 20.5, 0.8], [8, 21, 0.85]]) { cedarTree(g, X + x, BY, Z + z, s); C({ x: X + x, z: Z + z, r: 0.45 * s, y0: BY - 1, y1: BY + 4 }); }
  for (let x = -44; x <= 44; x += 7) if (Math.abs(x) > 6) cedarTree(g, X + x, BY, Z + 28.6, 0.75 + ((x * 13) % 5) * 0.06);
  // Lebanon: snow-capped mountains to the south, cedar forest on their feet
  let sd = 53; const rng = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const MT = [[-95, 70, 46, 52], [-40, 62, 40, 46], [8, 74, 50, 60], [58, 64, 42, 48], [110, 72, 48, 54], [-150, 80, 50, 44], [160, 82, 52, 46], [30, 110, 60, 70], [-80, 112, 58, 62]];
  for (const [x, z, rb, h] of MT) { const y0 = BY - 14, top = y0 + h; g.cyl(2.5, rb, h, 14, { at: [X + x, y0 + h / 2, Z + z], c: 0x6e7a5e, j: 0.08 }); const cf = 0.24, rc = 2.5 + (rb - 2.5) * cf; g.cyl(0.6, rc * 1.04, h * cf, 14, { at: [X + x, top - h * cf / 2 + 0.05, Z + z], c: 0xf2f2ee, j: 0.02 });
    for (let k = 0; k < 14; k++) { const a = rng() * Math.PI * 2, d = rb * (0.55 + rng() * 0.4), tx = x + Math.cos(a) * d, tz = z + Math.sin(a) * d; if (tz < 34) continue; const ty = Math.max(BY - 0.6, y0 + h * (1 - d / rb)); cedarTree(g, X + tx, ty - 0.4, Z + tz, 1.2 + rng() * 0.6); } }
  // edges you cannot walk off: the sea, the quay, the mountains
  for (const [x, z, w, d] of [[-62, -60, 0.6, 64], [62, -60, 0.6, 64], [0, -92, 124, 0.6], /* v18.34 the sea is open for swimming out to a line of buoys; these are the far edges */ [-16.4, -36, 0.6, 16], [-11.6, -36, 0.6, 16], [-14, -44.4, 5.4, 0.6], [-48.4, 1, 0.6, 60], [48.4, 1, 0.6, 60], [0, 30.6, 98, 0.6]]) C({ x: X + x, z: Z + z, w, d, y0: BY - 2, y1: BY + 4 });
  const statics = [R.mesh(g)]; statics[0].outline = true;
  // the sea: the shared water shader at a higher level, out to the horizon
  const d = [], st = 12, n = 50; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x0 = X - st * n / 2 + i * st, z0 = Z - st * n / 2 + j * st, x1 = x0 + st, z1 = z0 + st; const v = (x, z) => d.push(x, SEA, z, 0, 1, 0, 1, 1, 1, 0, 0); v(x0, z1); v(x1, z1); v(x1, z0); v(x0, z1); v(x1, z0); v(x0, z0); }
  const w0 = W.water || {}; const sea = { mesh: R.mesh(new Float32Array(d)), level: SEA, map: w0.map, heightTex: w0.heightTex, shallow: [0.16, 0.5, 0.6], deep: [0.03, 0.18, 0.34] };
  return { statics, sea }; }
/* v18.34 the sea off the shelf: swim in it (the shelf edge is a step you climb out over) */
const beach = lz => BY + 0.02 - (-28.8 - lz) / 5.6 * 3.2; /* the shore slopes into the water over 5.6 m (you could not climb back out over a 2.5 m step) */
EP.waterAt = function (x, z, s) { if (!inBy()) return null; const lx = x - BX, lz = z - BZ; if (lz < -28.8 && lz > -92 && Math.abs(lx) < 62 && !(lx > -16.6 && lx < -11.4 && lz > -44.6)) return { level: SEA, bed: lz > -34.4 ? beach(lz) : SEA - 2.6 - Math.min(3, (-28.8 - lz) * 0.08) }; return null; };
// the floor: the Byblos stage while you are there; the Nile quay's deck otherwise
const fl0 = EP.floor; EP.floor = function (x, z, s) { if (inBy()) { const lx = x - BX, lz = z - BZ; if ((lx > -48.5 && lx < 48.5 && lz > -28.8 && lz < 30.8) || (lx > -16.6 && lx < -11.4 && lz > -44.6 && lz <= -28.8)) return BY; if (Math.abs(lx) < 48.5 && lz <= -28.8 && lz > -34.4) return beach(lz); /* v18.34 */ }
  else { const q = EP._quay; if (q && x > q.x0 && x < q.x1 && z > q.z0 && z < q.z1) return q.y; } return fl0 ? fl0.apply(this, arguments) : null; };
// while overseas: draw Byblos instead of Egypt, and keep the wild things of the real map away
const EMPTY = [];
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (!inBy() || !STAGE) return; const sc = Game.scene; if (!sc) return;
  sc.terrain = EMPTY; sc.statics = STAGE.statics; sc.water = STAGE.sea; sc.pools = null; sc.insts.length = 0;
  for (let i = list.length - 1; i >= 0; i--) { const m = list[i] && list[i].m; if (!m || Math.hypot(m[12] - BX, m[14] - BZ) > 150) list.splice(i, 1); } };
const q0 = EP.quiet; EP.quiet = function (s) { return inBy() || (q0 ? q0.apply(this, arguments) : false); };
let modeOn = null;
function sync(force) { const on = inBy(); if (on === modeOn && !force) return; modeOn = on; for (const c of COLS) c.on = on; EP.noGrass = on;
  const mm = document.getElementById('minimap'); if (mm) mm.style.visibility = on ? 'hidden' : '';
  if (on && G.Weather && G.Weather.set && ['dust', 'storm', 'fog'].includes(G.Weather.kind(S()))) G.Weather.set(Math.random() < 0.7 ? 'clear' : 'cloudy', 4); }
/* the sea air of Byblos: no sandstorms, a little rain from the sea */
if (G.Weather && G.Weather.weights) { const w0 = G.Weather.weights; G.Weather.weights = function () { if (inBy()) return { clear: 0.55, cloudy: 0.28, rain: 0.1, wind: 0.07, fog: 0, dust: 0, storm: 0 }; return w0.apply(this, arguments); }; }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play') return r; try { const s = S(), p = P();
  if (s.flags.byblos && Math.hypot(p.x - BX, p.z - BZ) > 160) s.flags.byblos = 0; // carried away by the story: you are home again
  sync(); if (inBy()) chatter(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('byblos', e); } return r; };
G.Byblos = { sail, inBy, stage: () => ({ x: BX, z: BZ, y: BY }) };
})(window.G);
