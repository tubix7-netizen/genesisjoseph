// =================================================================== v18.78 6장 다시 짜기 · 「일곱 해 흉년」 (e_ch6.js · 설계표_6장_v18_77.md)
/* 창 41:54 – 42:9(앞부분). 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 요셉의 말은 성경 말씀만(42:7).
   ① 기근(41:54–55): 나일 자로 물 높이 보기 → 궁 앞에 몰려든 백성 · 바로 「요셉에게 가라」
   ② 성읍 곳간(41:56): 진흙 봉인 떼기 → 곡식 한 줌 살피기 → 파는 법(됫박 · 저울 · 장부) · 백성 셋
   ③ 서쪽 곳간: 문 열기 → 둘째 파는 자리 세우기(됫박 · 저울 나르기) → 팔기
   ④ 남쪽 곳간: 언덕 위 곳간 → 나귀에 자루 싣기 → 강가 마을로 끌고 가 팔기
   ⑤ 각국 백성(41:57): 시돈 · 에돔 · 미디안 사람의 은(고리 · 덩이 · 조각) 달기
   ⑥ 형들(42:1–9 앞부분): 가나안 → 대상 속에 섞여 → 엎드려 절함 → 「너희가 어디서 왔느냐」 → 꿈을 생각하고 → 7장
   빠진 것: 요셉의 지어낸 말 · 에돔 목자의 야곱 집안 소식 · 아메니와 만남(→ 메인 뒤 곁이야기) · 마음 고르기 · 속마음 해설 */
const C6 = S => S.q.c6 || (S.q.c6 = {});
const GRA6 = k => sites.find(s => s.id === 'gran' + k);
const NILO6 = [-93.5, -63.5], RIVER6 = [-90, 132];
const MG6 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const CROWD6 = [[-6, 0, 'raiseHands'], [-4.4, 1.6, 'weep'], [-2.6, 0.4, 'raiseHands'], [-1, 2.2, 'kneelRest'], [1.2, 1.8, 'raiseHands'], [2.8, 0.2, 'weep'], [4.4, 1.4, 'raiseHands'], [6, 0.6, 'kneelRest'], [-3.4, 3.8, 'raiseHands'], [3.2, 3.6, 'weep']];
function crowd6(on) { const G = Gm(), [gx, gz] = SPOTS.palaceGate; CROWD6.forEach(([dx, dz, a], i) => { const id = 'cr6_' + i; if (on) { if (!G.npc(id)) G.spawnNPC({ id, name: '굶주린 백성', look: i % 3 === 1 ? LOOK.woman : LOOK.farmerThin, x: gx + dx, z: gz + 8 + dz, face: Math.PI, noTalk: true, noTag: true, noBond: true, act: a }); } else if (G.npc(id)) G.removeNPC(id); }); }
/* the buyers keep to the granary front from the first sale on (they used to come only at the end) */
for (const id of ['byFarmer', 'byWoman', 'buyElder']) { const d = npcs.find(n => n.id === id); if (d) d.show = S => between(S, 'c6_open', 'c6_open') && !(C6(S).sold || {})[id]; }
for (const id of ['bySidon', 'byEdom']) { const d = npcs.find(n => n.id === id); if (d) d.show = S => S.step === 'c6_sell' && !(C6(S).sold || {})[id]; }
{ const d = npcs.find(n => n.id === 'overseerW'); if (d) { const s0 = d.show; d.show = S => S.step === 'c6_west' || s0(S); } }
{ const d = npcs.find(n => n.id === 'byAmeni'); if (d) d.show = S => S.step === 'j_end'; } /* (the old servant is met after the story now · see the side story at the end of this file) */

// ------------------------------------------------------------------ ① 기근 (41:54–55)
const CH6 = {};
CH6.c6_dry = { ch: 7, obj: S => !C6(S).nile ? '북쪽 나루 · 나일 자로 물 높이 보기' : '바로의 궁으로', list: S => { const c = C6(S); return [{ t: '나일 자로 물 높이 보기 (북쪽 나루)', ok: !!c.nile }, { t: '바로의 궁 앞으로', ok: !!c.cry }]; },
  enter(S, G, re) { if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); } crowd6(true); if (!re) narr([{ kick: '창세기 41:54', title: '흉년의 첫해', t: '애굽 땅에 칠 년 풍년이 그치고 요셉의 말과 같이 칠 년 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 식물이 있더니.', ref: '창세기 41:54' }]); },
  target: S => !C6(S).nile ? { x: NILO6[0], z: NILO6[1] } : { x: SPOTS.palaceGate[0], z: SPOTS.palaceGate[1] + 14 }, check: S => !!C6(S).cry,
  done(S, G, next) { crowd6(false); next(); }, next: 'c6_open' };
function nile6(S, G) { const [x, z] = NILO6, h = hAt(x, z); act('gather', 1); cine([{ cam: [x + 3, h + 1.6, z + 3.4], look: [x - 3, h - 0.6, z - 1], dur: 6, t: '나일 강둑의 자에는 해마다 물이 오른 높이를 새겨 두었어요. 올해 물은 가장 아랫금에도 닿지 않았어요.' }],
  () => { C6(S).nile = 1; GG.UI.quest(); }); }
function cry6(S, G) { const [gx, gz] = SPOTS.palaceGate, h = hAt(gx, gz + 6); C6(S).cry = 1;
  cine([{ fn: () => { place('pharaoh', gx, gz - 1.2, 0); G.teleport(gx + 5.5, gz + 13, -2.6); }, cam: [gx + 7, h + 3.4, gz + 18], look: [gx, h + 1.4, gz + 6], dur: 7, music: 'j_famine', t: '애굽 온 땅이 주리매 백성이 바로에게 부르짖어 양식을 구하는지라.', ref: '창세기 41:55' },
    { cam: [gx + 1.6, h + 1.7, gz + 2.8], look: [gx, h + 1.8, gz - 1.2], dur: 7, fov: 0.6, n: '바로', t: '요셉에게 가서 그가 너희에게 이르는 대로 하라.', ref: '창세기 41:55' },
    { fn: () => { CROWD6.forEach((_, i) => { const n = G.npc('cr6_' + i); if (n) { n.act = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); } }); }, cam: [gx - 4, h + 2.2, gz + 6], look: [gx + 5.5, h + 1.4, gz + 13], dur: 6, t: '백성이 일제히 요셉을 바라보았어요.' }],
  () => { const n = G.npc('pharaoh'); if (n) G.npcTo('pharaoh', -30, -177.2, 0, false); G.checkStep(); }); }

// ------------------------------------------------------------------ ② 성읍 곳간 · 파는 법 배우기 (41:56)
const SELL6A = [['byFarmer', '총리님, 곡식을 사러 왔습니다. 은은 이만큼 있습니다.', 'measure'], ['byWoman', '아이들이 배고파해요. 한 자루만 사게 해 주세요.', 'ledger'], ['buyElder', '이 늙은이도 한 자루 사겠소. 은은 정직하게 달아 주시오.', 'weigh']]; /* v18.80 measure · ledger · weigh, each once (no repeats) */
CH6.c6_open = { ch: 7, obj: S => { const c = C6(S); return !c.seal ? '성읍 곳간 · 진흙 봉인 떼고 문 열기' : !c.look ? '곳간 안 곡식 한 줌 살피기' : `곳간 앞 백성에게 곡식 팔기 (${Object.keys(c.sold || {}).filter(k => SELL6A.some(b => b[0] === k)).length}/3)`; },
  list: S => { const c = C6(S), s = c.sold || {}; return [{ t: '진흙 봉인 떼고 문 열기', ok: !!c.seal }, { t: '곡식 한 줌 살피기', ok: !!c.look }].concat(SELL6A.map(([id], i) => ({ t: ['농부에게 팔기 · 됫박으로 되기', '여인에게 팔기 · 장부에 적기', '노인에게 팔기 · 저울에 은 달기'][i], ok: !!s[id] }))); },
  enter(S, G, re) { if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); } },
  target: S => { const c = C6(S), g = GRA6('A'); if (!c.seal || !c.look) return { x: g.x, z: g.z + 3.4 }; const b = SELL6A.find(q => !(c.sold || {})[q[0]]); return b ? 'npc:' + b[0] : null; },
  check: S => SELL6A.every(([id]) => (C6(S).sold || {})[id]),
  done(S, G, next) { narr([{ kick: '창세기 41:56', title: '모든 창고를 열고', t: '온 지면에 기근이 있으매 요셉이 모든 창고를 열고 애굽 백성에게 팔새, 애굽 땅에 기근이 심하며. 이제 서쪽 마을 곳간으로 가요.', ref: '창세기 41:56' }], next); }, next: 'c6_west',
  talk: Object.fromEntries(SELL6A.map(([id, line, how]) => [id, (S, G) => { const c = C6(S); if ((c.sold || {})[id] || !c.look) return false; sell6(S, G, id, [N(id, line)], how); }])) };
function seal6(S, G) { const g = GRA6('A'), h = hAt(g.x, g.z); act('pick', 1.2);
  MG6('wrestle', { title: '진흙 봉인 떼기', hint: '곳간 문 빗장에 붙여 둔 진흙 봉인을 조심조심 떼어 내요.', need: 6, dur: 12, btn: '떼기', unit: '번' }, () => {
    cine([{ cam: [g.x + 4.5, h + 2, g.z + 8.5], look: [g.x, h + 1.8, g.z + 1], dur: 5, sfx: 'door', t: '일곱 해 동안 닫혀 있던 곳간 문이 열렸어요.', fn: () => { G.FX.burst(g.x, h + 1.5, g.z + 2.5, 26, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); } }], () => { C6(S).seal = 1; (S.q.opened = S.q.opened || {}).A = 1; GG.UI.quest(); }); }); }
function look6(S, G) { act('gather', 1.4); say([T('곳간 안으로 들어가 곡식을 한 줌 쥐어 보았어요. 마르고 단단해요. 벌레 먹은 낟알이 없어요.'), T('하얀 석회를 바른 벽이 일곱 해 동안 쥐와 습기를 막아 주었어요.'), T('곳간 앞에는 벌써 사람들이 줄을 섰어요. 됫박으로 곡식을 되고, 저울에 은을 달아 팔아요.')], () => { C6(S).look = 1; GG.UI.quest(); }); }
/* one sale: the buyer's words (background people), then the work itself — Joseph says nothing */
function sell6(S, G, id, lines, how, after) { const c = C6(S);
  const measure = then => MG6('count', { title: '됫박으로 되기', hint: '됫박에 곡식을 수북이 담고 손바닥으로 위를 깎아 고르게 되어요.', need: 8, dur: 12, btn: '되기', unit: '됫박' }, then);
  const weigh = (then, hard) => MG6('balance', { title: hard ? '먼 나라의 은 달기' : '저울에 은 달기', hint: hard ? '은의 모양이 달라 무게를 가늠하기 어려워요. 저울대가 수평이 되게 추를 옮겨요.' : '저울 한쪽에 은을, 다른 쪽에 추를 올려 저울대가 수평이 되게 맞춰요.', dur: hard ? 11 : 8 }, then);
  const ledger = then => say([N('scribeR', '총리님, 장부에 적겠습니다. 이 손님은 몇 자루입니까?'), { n: '', t: '애굽 숫자로 「한 자루」는?', choices: [{ t: '│', ok: true }, { t: '∩', ok: false, fb: '∩는 열이에요. 한 자루는 막대 하나 │예요.' }] }, N('scribeR', '한 자루. 적었습니다.', '', 'happy')], then);
  const fin = () => { (c.sold = c.sold || {})[id] = 1; G.sfx('coins'); emote(id, 'bow', 2); G.FX.burst(G.P.x, hAt(G.P.x, G.P.z) + 1, G.P.z, 14, { c: [0.95, 0.85, 0.55], sp: 1.2, up: 1.4 }); GG.UI.quest(); after ? after() : G.checkStep(); };
  const queue = then => say([{ n: NM.overseerW || '서쪽 촌장', t: '총리님, 새 자리로 누구를 보낼까요?', choices: [{ t: '줄의 뒤쪽 절반', then: () => setTimeout(() => say([T('뒤쪽 사람들이 새 자리로 옮겨 섰어요. 두 줄이 나란히 줄어들어요.')], then), 30) }, { t: '줄의 맨 앞 사람들', ok: false, fb: '맨 앞 사람들은 가장 오래 기다렸어요. 뒤쪽 사람들을 새 자리로 보내면 모두가 더 빨리 받아요.' }] }]);
  const unload = then => MG6('push', { title: '나귀 짐 내리기', hint: '나귀 등의 무거운 자루를 꾹 붙잡고 천천히 내려요. 숨이 차면 잠깐 쉬어요.', btn: '내리기' }, then);
  const shape = (then, ans) => say([T('은을 손바닥에 올려 살펴보았어요.'), { n: '왕궁 서기관', t: '총리님, 장부에 은 모양을 무엇이라 적을까요?', choices: ['고리', '덩이', '조각'].map(k => k === ans ? { t: k, then: () => setTimeout(then, 30) } : { t: k, ok: false, fb: `다시 보세요. 이 사람의 은은 ${ans}예요.` }) }]);
  say(lines, () => { if (how === 'full') measure(() => weigh(() => ledger(fin))); else if (how === 'measure') measure(fin); else if (how === 'ledger') ledger(fin); else if (how === 'weigh') weigh(fin); else if (how === 'far') weigh(fin, true); else if (how === 'queue') queue(fin); else if (how === 'unload') unload(fin); else if (how && how.shape) shape(fin, how.shape); else fin(); }); } /* v18.80 queue · unload · shape: new ways, not the scoop and the scale again */

// ------------------------------------------------------------------ ③ 서쪽 마을 곳간 · 둘째 파는 자리
CH6.c6_west = { ch: 7, obj: S => { const c = C6(S); return !c.wOpen ? '버금 수레로 서쪽 마을 곳간 (북쪽 나루 건너)' : !c.wMet ? '서쪽 마을 촌장과 이야기하기' : (c.post || 0) < 2 ? `둘째 파는 자리 세우기 · 됫박과 저울 나르기 (${c.post || 0}/2)` : '새 자리로 줄 나누기'; },
  list: S => { const c = C6(S); return [{ t: '서쪽 마을 곳간 문 열기', ok: !!c.wOpen }, { t: '촌장과 이야기하기', ok: !!c.wMet }, { t: '됫박과 저울 나르기 (' + Math.min(2, c.post || 0) + '/2)', ok: (c.post || 0) >= 2 }, { t: '새 자리로 줄 나누기', ok: !!c.wSold }]; },
  target: S => { const c = C6(S), g = GRA6('B'); if (!c.wOpen) return { x: g.x, z: g.z + 3.4 }; if (!c.wMet) return 'npc:overseerW'; if ((c.post || 0) < 2) return S.q.c6carry ? { x: g.x + 6, z: g.z + 4 } : { x: g.x - 6, z: g.z + 5 }; return { x: g.x + 6, z: g.z + 4 }; },
  check: S => !!C6(S).wSold, done(S, G, next) { narr([{ kick: '서쪽 마을', title: '두 자리', t: '이제 서쪽 마을 곳간에는 파는 자리가 둘이에요. 줄이 반으로 줄었어요. 남쪽 마을 곳간으로 가요.', ref: '' }], next); }, next: 'c6_south',
  talk: { overseerW(S, G) { const c = C6(S); if (c.wMet || !c.wOpen) return false; say([N('overseerW', '총리님! 「그 양식으로 칠 년 흉년을 예비하자」 하시던 그 말씀이 오늘을 두고 하신 말씀이었군요.', '', 'tender'), N('overseerW', '그런데 줄이 너무 깁니다. 자리 하나로는 해가 져도 다 못 팝니다. 저 짐수레에 됫박과 저울이 하나씩 더 있습니다.')], () => { c.wMet = 1; GG.UI.quest(); }); } } };
function open6(S, G, k, then) { const g = GRA6(k), h = hAt(g.x, g.z); act('pick', 1);
  cine([{ cam: [g.x + 4.5, h + 2, g.z + 8.5], look: [g.x, h + 1.8, g.z + 1], dur: 5, sfx: 'door', t: k === 'B' ? '진흙 봉인을 떼고 서쪽 마을 곳간 문을 열었어요. 줄 선 사람들이 술렁였어요.' : '언덕 위 곳간 문을 열었어요. 강물이 닿지 않은 곡식은 한 톨도 상하지 않았어요.', fn: () => { G.FX.burst(g.x, h + 1.5, g.z + 2.5, 22, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); (S.q.opened = S.q.opened || {})[k] = 1; } }], then); }

// ------------------------------------------------------------------ ④ 남쪽 마을 곳간 · 나귀로 강가 마을에
CH6.c6_south = { ch: 7, obj: S => { const c = C6(S); return !c.sOpen ? '남쪽 마을 곳간 (남쪽 나루 건너 · 언덕 위)' : !c.load ? '나귀에 곡식 자루 싣기' : !c.down ? '나귀를 끌고 강가 마을까지 내려가기' : '나귀 짐에서 자루 내려 팔기'; },
  list: S => { const c = C6(S); return [{ t: '언덕 위 곳간 문 열기', ok: !!c.sOpen }, { t: '나귀에 자루 싣기', ok: !!c.load }, { t: '강가 마을까지 끌고 가기', ok: !!c.down }, { t: '나귀 짐 내려 팔기', ok: !!c.sSold }]; },
  enter(S, G, re) { if (C6(S).load && !C6(S).sSold) donkey6(true); },
  target: S => { const c = C6(S), g = GRA6('C'); if (!c.sOpen || !c.load) return { x: g.x, z: g.z + 3.4 }; return { x: RIVER6[0], z: RIVER6[1] }; },
  check: S => !!C6(S).sSold, done(S, G, next) { donkey6(false); narr([{ kick: '창세기 41:56', title: '곳간 셋', t: '성읍과 서쪽 마을과 남쪽 마을, 곳간 셋의 문이 다 열렸어요. 애굽 땅에 기근이 심하였으나 곳간마다 곡식이 있었어요.', ref: '창세기 41:56' }], next); }, next: 'c6_sell' };
function donkey6(on) { const G = Gm(), g = GRA6('C'); if (on) { if (!G.npc('don6')) G.spawnNPC({ id: 'don6', name: '나귀', animal: 'donkey', x: g.x + 3, z: g.z + 5, face: 0, noTalk: true, noTag: true, noBond: true }); G.npcFollow('don6', true); } else if (G.npc('don6')) { G.npcFollow('don6', false); G.removeNPC('don6'); } }

// ------------------------------------------------------------------ ⑤ 각국 백성 (41:57) · c6_sell keeps its old name (old saves)
const FAR6 = [['bySidon', '바다 건너 시돈에서 왔소. 은고리로 값을 치르겠소. 잘 달아 주시오.', 'far'], ['byEdom', '에돔 땅에서 왔습니다. 가나안도 기근이 아주 심하지요. 은 덩이가 이것뿐입니다.', { shape: '덩이' }], ['byMid6', '미디안 대상이오. 우리 은은 잘게 쪼갠 조각이오.', { shape: '조각' }]]; /* v18.80 one weighing; the other two: the silver's shape for the ledger */
CH6.c6_sell = { ch: 7, obj: S => `성읍 곳간 · 먼 나라 사람들에게 팔기 (${FAR6.filter(([id]) => (C6(S).sold || {})[id]).length}/3)`,
  list: S => FAR6.map(([id], i) => ({ t: ['시돈 상인 · 은고리 달기', '에돔 목자 · 은 모양 살피기', '미디안 대상 · 은 모양 살피기'][i], ok: !!(C6(S).sold || {})[id] })),
  enter(S, G, re) { const g = GRA6('A'); if (!G.npc('byMid6')) G.spawnNPC({ id: 'byMid6', name: '미디안 대상', look: LOOK.midian, x: g.x - 2.6, z: g.z + 8.6, face: Math.PI, noBond: true }); if (!re) narr([{ kick: '창세기 41:57', title: '각국 백성', t: '각국 백성도 양식을 사려고 애굽으로 들어와 요셉에게 이르렀으니, 기근이 온 세상에 심함이었더라.', ref: '창세기 41:57' }]); },
  target: S => { const f = FAR6.find(([id]) => !(C6(S).sold || {})[id]); return f ? 'npc:' + f[0] : null; },
  check: S => FAR6.every(([id]) => (C6(S).sold || {})[id]), done(S, G, next) { const G2 = Gm(); if (G2.npc('byMid6')) G2.removeNPC('byMid6'); cinBrothers(S, G, next); }, next: 'g1_spy',
  talk: Object.fromEntries(FAR6.map(([id, line, how]) => [id, (S, G) => { if ((C6(S).sold || {})[id]) return false; sell6(S, G, id, [N(id, line)], how); }])) };

// ------------------------------------------------------------------ ⑥ the brothers (42:1–9) · only the Bible's words, ending where he remembers the dreams
function cinBrothers(S, G, next) { /* v18.78 (redeclared) */
  const heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4), gx = 16, gz = -58, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6, road = [104, 46], rh = hAt(road[0], road[1]);
  cine([
    { hour: 9, fn: () => { S.q.heb2 = 1; S.q.broShow = 1; BRO.forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI)); place('jacob', heb[0], heb[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('benjamin2', heb[0] + 2.2, heb[1] + 2.4, -0.4); },
      cam: [heb[0] + 4.4, hh + 1.8, heb[1] + 9.6], look: [heb[0], hh + 1.2, heb[1] + 3.4], dur: 7, music: 'j_mourn', t: '때에 야곱이 애굽에 곡식이 있음을 보고 아들들에게 이르되,', ref: '창세기 42:1' },
    { cam: [heb[0] - 1.4, hh + 1.6, heb[1] + 5], look: [heb[0], hh + 1.4, heb[1] + 2.6], dur: 8, n: '야곱', t: '너희는 어찌하여 서로 관망만 하느냐. 내가 들은즉 저 애굽에 곡식이 있다 하니, 너희는 그리로 가서 거기서 우리를 위하여 사오라. 그리하면 우리가 살고 죽지 아니하리라.', ref: '창세기 42:1–2', e: 'weary' },
    { cam: [heb[0] + 3.6, hh + 1.4, heb[1] + 1.4], look: [heb[0] + 2.2, hh + 1.5, heb[1] + 2.4], dur: 8, t: '요셉의 형 십 인이 애굽에서 곡식을 사려고 내려갔으나, 야곱이 요셉의 아우 베냐민을 그 형들과 함께 보내지 아니하였으니, 이는 그의 말이 재난이 그에게 미칠까 두렵다 함이었더라.', ref: '창세기 42:3–4' },
    { fn: () => { S.q.heb2 = 0; BRO.forEach((id, i) => place(id, road[0] - i * 2.2, road[1] + (i % 2) * 1.2, -1.57)); }, cam: [road[0] + 6, rh + 3, road[1] + 9], cam2: [road[0] - 4, rh + 3.4, road[1] + 10], look: [road[0] - 8, rh + 1.2, road[1]], dur: 8, music: 'j_egypt', t: '이스라엘의 아들들이 양식 사러 간 자 중에 섞여 갔으니, 가나안 땅에 기근이 있음이라.', ref: '창세기 42:5' },
    { fn: () => { G.teleport(jx, jz, 0); BRO.forEach((id, i) => place(id, gx - 4.5 + (i % 5) * 2.2, gz + 4 + Math.floor(i / 5) * 1.8, Math.PI)); ['byFarmer', 'byWoman', 'buyElder', 'bySidon', 'byEdom'].forEach(id => G.npcShow(id, false)); },
      cam: [gx + 8, gh + 2.6, gz + 12], cam2: [gx + 5, gh + 2, gz + 9], look: [gx, gh + 1.2, gz + 2], dur: 7, music: 'j_finale', t: '때에 요셉이 나라의 총리로서 그 땅 모든 백성에게 팔더니, 요셉의 형들이 와서', ref: '창세기 42:6' },
    { fn: () => BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: -i * 0.15, dur: 14, amb: true }; } }), cam: [jx + 0.8, gh + 2.8, jz - 2.8], look: [gx, gh + 0.3, gz + 5], dur: 9, t: '그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { cam: [jx - 1.2, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.55, t: '요셉이 보고 형들인 줄 아나, 모르는 체하고 엄한 소리로 그들에게 말하여', ref: '창세기 42:7' },
    { cam: [jx + 1.6, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '너희가 어디서 왔느냐?', ref: '창세기 42:7', e: 'cold' },
    { fn: () => { const n = G.npc('judah'); if (n) { n.emote = null; n.act = 'kneelRest'; } }, cam: [gx - 2, gh + 1.2, gz + 1.6], look: [gx - 0.1, gh + 0.9, gz + 4], dur: 6, n: '형들', t: '곡물을 사려고 가나안에서 왔나이다.', ref: '창세기 42:7', e: 'fear' },
    { cam: [jx + 0.8, gh + 1.6, jz + 0.9], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.5, t: '요셉은 그 형들을 알아보나, 그들은 요셉을 알지 못하더라.', ref: '창세기 42:8' },
    { fn: () => { RT.dreamFx = 'sheaves'; RT.dreamK = 0; }, cam: [DREAM.x + 3.6, hAt(DREAM.x, DREAM.z) + 1.2, DREAM.z + 3.6], cam2: [DREAM.x + 2.8, hAt(DREAM.x, DREAM.z) + 1.6, DREAM.z + 2.8], look: [DREAM.x, hAt(DREAM.x, DREAM.z) + 0.8, DREAM.z], dur: 9, fadeIn: 1,
      each: t => { RT.dreamK = Math.min(1, t / 6); }, t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고', ref: '창세기 42:9' },
    { fn: () => { RT.dreamFx = null; GG.Audio && GG.Audio.sfx('insight', { pitch: 1.0, vol: 0.7 }); BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: 1.6 + i * 0.05, dur: 9, amb: true }; } }); }, cam: [gx + 1.4, gh + 0.55, gz + 8.5], cam2: [gx + 1.1, gh + 0.6, gz + 7.6], look: [jx, gh + 1.5, jz], dur: 6, fov: 0.6, fadeIn: 0.6, fadeOut: 1.6,
      t: '곡식 단들이 둘러서서 절하던 그 꿈이었어요.', ref: '창세기 37:7' },
  ], () => { GG.Game.musicOverride = null; npcSet('jacob', { look: LOOK.jacob }); const H = S.hero || { lvl: 1 };
    narr([{ kick: '나의 여정', title: `${S.day}일의 기록`, t: `배운 애굽 말 ${Object.keys(S.q.words || {}).length}개 · 지은 곳간 ${['granA', 'granB', 'granC'].filter(k => S.built[k]).length}채 · 곡식을 판 사람 ${Object.keys(C6(S).sold || {}).length}명 · 살펴서 알아낸 것 ${Object.keys(S.flags.lore || {}).length}개 · 만들어 본 요리 ${Object.keys(S.flags.dishes || {}).length}가지 · 체력 Lv ${H.lvl}`, ref: '' }], () => next()); });
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^c6_/.test(S.step || '')) return null; const st = S.step, c = C6(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c6_dry' && !c.nile) at(NILO6[0], NILO6[1], 3.4, { label: '나일 자로 물 높이 보기', key: 'c6Nile', use: () => nile6(S, G) });
  if (st === 'c6_open') { const g = GRA6('A'); if (!c.seal) at(g.x, g.z + 3.4, 3.6, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6Seal', use: () => seal6(S, G) }); else if (!c.look) at(g.x, g.z + 3.4, 3.6, { label: '곳간 곡식 한 줌 살피기', key: 'c6Look', use: () => look6(S, G) }); }
  if (st === 'c6_west') { const g = GRA6('B'); if (!c.wOpen) at(g.x, g.z + 3.4, 4, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6WOpen', use: () => open6(S, G, 'B', () => { c.wOpen = 1; GG.UI.quest(); }) });
    else if (c.wMet && (c.post || 0) < 2) { if (!S.q.c6carry) at(g.x - 6, g.z + 5, 3, { label: (c.post || 0) === 0 ? '짐수레에서 됫박 들기' : '짐수레에서 저울 들기', key: 'c6Take', use: () => { S.q.c6carry = 1; p.carry = 'basket'; act('pick', 0.8); } });
      else at(g.x + 6, g.z + 4, 3, { label: (c.post || 0) === 0 ? '둘째 자리에 됫박 놓기' : '둘째 자리에 저울 세우기', key: 'c6Put', use: () => { S.q.c6carry = 0; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.5 }); c.post = (c.post || 0) + 1; GG.UI.quest(); if (c.post >= 2) GG.UI.toast('둘째 파는 자리가 섰어요 · 줄의 반이 이쪽으로 왔어요'); } }); }
    else if ((c.post || 0) >= 2 && !c.wSold) at(g.x + 6, g.z + 4, 3.2, { label: '새 자리로 줄 나누기', key: 'c6WSell', use: () => sell6(S, G, 'west2', [T('곳간 앞 줄이 마을 끝까지 늘어서 있어요.')], 'queue', () => { c.wSold = 1; GG.UI.quest(); G.checkStep(); }) }); }
  if (st === 'c6_south') { const g = GRA6('C'); if (!c.sOpen) at(g.x, g.z + 3.4, 4, { label: '진흙 봉인 떼고 곳간 문 열기', key: 'c6SOpen', use: () => open6(S, G, 'C', () => { c.sOpen = 1; GG.UI.quest(); }) });
    else if (!c.load) at(g.x, g.z + 3.4, 5, { label: '나귀에 곡식 자루 싣기', key: 'c6Load', use: () => { donkey6(true); MG6('balance', { title: '나귀 짐 싣기', hint: '자루를 나귀 양쪽에 고르게 실어요. 한쪽으로 기울면 나귀가 비틀거려요.', dur: 9 }, () => { c.load = 1; GG.UI.toast('나귀가 따라와요 · 언덕 아래 강가 마을까지 끌고 가요'); GG.UI.quest(); }); } });
    else if (!c.down) { const d = Math.hypot(RIVER6[0] - p.x, RIVER6[1] - p.z); if (d < 9) { c.down = 1; GG.UI.toast('강가 마을에 닿았어요'); GG.UI.quest(); } }
    else if (!c.sSold) at(RIVER6[0], RIVER6[1], 5, { label: '나귀 짐에서 자루 내려 팔기', key: 'c6SSell', use: () => sell6(S, G, 'south2', [T('언덕을 오를 힘이 없던 강가 마을 사람들이 나귀 곁으로 모여들었어요.')], 'unload', () => { c.sSold = 1; GG.UI.quest(); G.checkStep(); }) }); }
  return out.length ? out : null; });
function ch6Tick(dt, S) { if (!S || S.step !== 'c6_dry') return; try { const c = C6(S); if (c.nile && !c.cry && !GG.UI.busy() && !GG.Cine.on && Gm().dist(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 10) < 14) cry6(S, Gm()); if (!Gm().npc('cr6_0')) crowd6(true); } catch (e) { console.error('ch6', e); } }

// ------------------------------------------------------------------ the side story after the main one: the old servant Ameni (moved out of chapter 6 · it is not in the Bible)
EP_TALK6: { const t0 = talk.byAmeni; talk.byAmeni = function (S, G) { if (S.step !== 'j_end' || S.flags.ameniMet) return t0 ? t0(S, G) : false;
    say([T('곁이야기 · 늙은 종 아메니'), N('ameni', '총리님께 곡식을 사러 왔습니다. 보디발 나리 댁에서… 얘야? 너… 요셉이냐?', '', 'awe'), J('아메니! 아메니 할아버지!', '', 'happy'), T('요셉은 총리의 자리에서 내려와, 늙은 종을 끌어안았습니다.'),
      N('ameni', '네 하나님이… 정말로 너와 함께 하셨구나. 그 구덩이에서도, 그 옥에서도.', '', 'cry'), J('할아버지가 가르쳐 주신 애굽 말로 바로 앞에서 말했어요. 엠 헤테프, 아메니. 평안히.', '', 'tender'), T('(이 만남은 성경에 기록되지 않은 「IF」 이야기예요.)')],
      () => { S.flags.ameniMet = 1; G.heart && G.heart(1); GG.UI.pop && GG.UI.pop('곁이야기', '늙은 종 아메니를 다시 만났어요', 'heart'); }); }; }

// ------------------------------------------------------------------ put the steps in order (c6_dry first · the rest keep their names for old saves)
{ const keys = Object.keys(steps), cut = keys.indexOf('c6_open'), tail = keys.slice(cut).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c6_dry = CH6.c6_dry; steps.c6_open = Object.assign({}, CH6.c6_open); steps.c6_west = CH6.c6_west; steps.c6_south = CH6.c6_south; steps.c6_sell = CH6.c6_sell;
  for (const [k, v] of tail) { if (k === 'c6_open' || k === 'c6_sell') continue; steps[k] = v; }
  ORDER = Object.keys(steps); }
