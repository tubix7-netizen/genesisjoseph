/* 약속의 길 — v18.59 창세기 아브라함 편 · 약속의 별 (dlc_abraham.js)   창 12–22장
   세겜의 옛 제단 앞에서 증조할아버지 아브라함의 이야기 속으로 들어가요. 야곱 편이 목장 경영이라면, 이 편은 걷고 숨고 겨루고 올려다보는 체험이에요.
   일곱 장: ① 부르심과 세겜의 제단(12장) ② 롯을 구하러 · 밤의 진영(14장) ③ 별을 세다(15장) ④ 세 나그네(18장) ⑤ 소돔을 위한 간구(18장)
            ⑥ 웃음, 이삭(21장) ⑦ 모리아 산(22장)
   · ②는 숨어들기예요: 파수꾼의 눈길(앞쪽 5m)에 들면 겨루기가 벌어져요. 지면 진영 밖으로 밀려나요. 낮게 걷기(앉기 단추)면 눈에 덜 띄어요.
   · ⑦에서 이삭을 묶는 대목은 글로만 전하고, 손에 쥐는 것은 「수풀에 걸린 숫양」을 찾는 일이에요.
   저장: G.DLC.st('abraham') = { ch, ph, … , done } */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ls = G.Lands, D = G.DLC; if (!Game || !EP || !Ls || !D) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c);
const st = () => D.st('abraham'), say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), Ln = D.Ln, T = D.T, A = (t, ref, e) => ({ n: st().renamed ? '아브라함' : '아브람', t, ref, e });
const t = Ls.tint, L0 = Ls.lookOf('reuben') || {}, LJ0 = Ls.lookOf('jacob') || {}, LW = Ls.lookOf('leah') || Ls.lookOf('dinah') || {}, LK = Ls.lookOf('benjamin') || Ls.lookOf('ishBoy') || L0;
EP.outfits.dlcAbraham = { skin: 0xd09a68, hair: 0xb8b0a4, hairStyle: 'short', beard: 'long', beardCol: 0xd8d0c4, eye: 0x4a3420, build: 0.85, long: true, top: 0xe4d8b8, under: 0xe4d8b8, trim: 0x2e4a78, belt: 0x6a4428, mantle: 0x8a3a2e, mantleTrim: 0x2e4a78, headwear: 'cloth', clothCol: 0xe8dcc0, vary: false };
const OUT = [-42, 0], OAK = [-30, -20], ALT1 = [-25.5, -17], TENT = [0, 10], WELLM = [9, 19], HERD = [-12, 22], CAMP = [36, -24], LOT = [43, -28], EDGE = [20, -14], HILL = [30, 30], HR = 18, HSTEP = 0.22, TOP = [30, 30], WOOD = [-6, 16], VIS = [-13, -5], VIEW = [16, 2];
const STONES = [[-36, -26], [-33, -13], [-24, -27], [-20, -14], [-28, -9], [-38, -16], [-18, -22], [-31, -31]];
const GUARDS = [{ a: [30, -18], b: [30, -30] }, { a: [36, -17], b: [44, -17] }, { a: [40, -22], b: [34, -30] }, { a: [46, -24], b: [46, -32] }];
const THICK = [[24, 26], [35, 36], [36, 25]]; /* the ram is in the last one he looks into */
const hillH = (lx, lz) => { const d = Math.hypot(lx - HILL[0], lz - HILL[1]); return d >= HR ? 0 : Math.min(HR - 2, Math.floor(HR - d) + 1) * HSTEP; };
let LAND = null; const on = () => !!(LAND && LAND.on()), ch = () => st().ch | 0, ph = () => st().ph | 0;
const npc = id => Game.npc(id), fin = id => { const n = npc(id); if (n) n.talking = false; }, W0 = () => LAND.stage(), wx = l => W0().x + l[0], wz = l => W0().z + l[1];
const setCh = (c, p) => { st().ch = c; st().ph = p || 0; G.UI.quest(); };
const night = h => { S().time = h; };
function place(id, l, face) { const n = npc(id); if (!n) return; n.x = n.d.x = wx(l); n.z = n.d.z = wz(l); n.walk = null; if (face !== undefined) n.face = n.homeFace = face; }
function follow(id, dt, gap) { const n = npc(id), p = P(); if (!n || !n.vis) return; const d = Math.hypot(n.x - p.x, n.z - p.z); n._fT = (n._fT || 0) - dt; if (d > (gap || 2.2) && n._fT <= 0) { n._fT = 0.35; const k = (gap || 2.2) * 0.8 / d; Game.npcWalk(id, p.x + (n.x - p.x) * k, p.z + (n.z - p.z) * k, null, d > 6 ? 4.4 : 2.6); } }

// ------------------------------------------------------------------ ① 부르심 (창 12:1–8)
function ch0Sarai() { say([Ln('사래', '여보, 하란을 떠난 지 여러 날이에요. 이 낯선 땅이 정말 그분이 말씀하신 곳일까요?', 'weary'), A('나도 갈 바를 알지 못하오. 다만 말씀을 따라 왔을 뿐이오.', '', 'tender'), Ln('사래', '…저 상수리나무 아래에서 쉬어 가요. 가나안 사람들이 모레 상수리나무라 부른대요.')], () => fin('daSarai')); }
function oak() { narr([D.card('창세기 12:6–7', '세겜 땅 모레 상수리나무', '아브람이 그 땅을 통과하여 세겜 땅 모레 상수리나무에 이르니 그때에 가나안 사람이 그 땅에 거하였더라. 여호와께서 아브람에게 나타나 가라사대 「내가 이 땅을 네 자손에게 주리라」 하신지라.', '창세기 12:6–7')],
  () => say([A('…이 땅을, 내 자손에게. 자식 하나 없는 나에게.', '', 'awe'), T('아브람은 그곳에 제단을 쌓기로 했습니다. 둘레의 돌을 모아 오세요.')], () => { st().ph = 1; st().stones = st().stones || {}; G.UI.quest(); })); }
function altar1() { G.UI.minigame('count', { title: '돌 제단 쌓기', hint: '주워 온 돌을 하나씩 올려 쌓아요.', need: 8, btn: '돌 올리기', onPress: () => sfx('step', { surf: 'stone', vol: 0.6 }) }, ok => { if (!ok) return; st().altar1 = 1; P().emote = { k: 'kneelPray', t: 0, dur: 5 }; sfx('insight');
    narr([D.card('창세기 12:7–8', '여호와의 이름을 부르다', '그가 자기에게 나타나신 여호와를 위하여 그곳에 단을 쌓고… 거기서 여호와를 위하여 단을 쌓고 여호와의 이름을 부르더니', '창세기 12:7–8'), D.card('먼 훗날', '이 제단은', '이 돌 제단이 바로, 요셉이 세겜 들판에서 손을 얹은 그 옛 제단이에요. 약속은 이 돌 위에서 시작되었습니다.')], () => { P().emote = null; Game.insight && Game.insight(1, '아브라함 편 · 부르심'); setCh(1, 0); pop('1장을 마쳤어요', '장막의 종 엘리에셀이 급히 찾아요', 'star'); }); }); }
// ------------------------------------------------------------------ ② 롯을 구하러 (창 14:12–24)
function ch1News() { say([Ln('엘리에셀', '주인님! 도망해 온 자가 고했습니다. 동방의 네 왕이 소돔을 쳐서, 조카 롯과 그 재물을 다 사로잡아 갔답니다!', 'fear'), A('롯이…!', '', 'fear'),
    T('아브람이 그 조카의 사로잡혔음을 듣고 집에서 길리고 연습한 자 삼백십팔 인을 거느리고 단까지 쫓아가서', '창세기 14:14'), Ln('엘리에셀', '적의 진이 저 동쪽에 있습니다. 밤을 타서 나누어 치기로 했습니다. 주인님은 롯이 묶인 장막으로 숨어드십시오.'),
    T('파수꾼의 눈길(앞쪽)에 들면 붙들려요. 「앉기」로 낮게 걸으면 눈에 덜 띄어요. 붙들리면 겨뤄서 이겨야 해요.')], () => { fin('daEli'); night(23); st().ph = 1; st().down = {}; GUARDS.forEach((g, i) => place('daG' + i, g.a, 0)); G.UI.quest(); if (G.Weather && G.Weather.set) G.Weather.set('clear', 8); }); }
function caught(i) { const s0 = st(); s0.busy = 1; const n = npc('daG' + i); if (n) { n.walk = null; n.face = Math.atan2(P().x - n.x, P().z - n.z); G.Life.bubble('daG' + i, '거기 누구냐!', 2); } P().vx = P().vz = 0; sfx('thud');
  setTimeout(() => G.UI.minigame('wrestle', { title: '파수꾼과 겨루기', hint: '초록 칸에 들 때 눌러요. 소리 지르기 전에 쓰러뜨려야 해요.', need: 5, dur: 22 }, ok => { s0.busy = 0;
    if (ok) { s0.down[i] = 1; if (n) { n.act = 'fallen'; n.walk = null; } sfx('hit'); pop('파수꾼을 쓰러뜨렸어요', '롯은 진 한가운데 장막에 묶여 있어요', 'star'); }
    else G.UI.fade(() => { Game.teleport(wx(EDGE), wz(EDGE), 1.2); if (s0.lot) { s0.lot = 0; place('daLot', LOT, -2); } }, () => G.UI.toast('진영 밖으로 밀려났어요 · 낮게 걸어서 눈길을 피해 다시 가요')); }), 500); }
function freeLot() { say([Ln('롯', '숙부님…! 어떻게 여기까지…', 'cry'), A('소리 내지 마라. 줄을 끊었다. 내 뒤를 바짝 따라오너라.', '', 'tender')], () => { fin('daLot'); st().lot = 1; st().ph = 2; G.UI.quest(); G.UI.toast('롯을 데리고 진영 서쪽 끝으로 빠져나가요'); }); }
function ch1Out() { const s0 = st(); s0.lot = 0; s0.ph = 3; G.UI.fade(() => { night(8); GUARDS.forEach((g, i) => place('daG' + i, [200, 200])); place('daLot', [EDGE[0] - 4, EDGE[1] + 3], 1.2); place('daMelch', [EDGE[0] - 7, EDGE[1] + 1], 1.4); Game.teleport(wx(EDGE) - 5.4, wz(EDGE) + 2, -1.6); },
  () => narr([D.card('창세기 14:15–16', '밤의 승리', '그 가신을 나누어 밤을 타서 그들을 쳐서 파하고 다메섹 좌편 호바까지 쫓아가서, 모든 빼앗겼던 재물과 자기 조카 롯과 그 재물과 또 부녀와 인민을 다 찾아왔더라.', '창세기 14:15–16')],
    () => say([T('살렘 왕 멜기세덱이 떡과 포도주를 가지고 나왔으니 그는 지극히 높으신 하나님의 제사장이었더라.', '창세기 14:18'), Ln('멜기세덱', '천지의 주재시요 지극히 높으신 하나님이여, 아브람에게 복을 주옵소서. 너희 대적을 네 손에 붙이신 지극히 높으신 하나님을 찬송할지로다.', 'awe', '창세기 14:19–20'),
      T('아브람이 그 얻은 것에서 십분 일을 멜기세덱에게 주었더라. 소돔 왕이 아브람에게 이르되 「사람은 내게 보내고 물품은 네가 취하라」', '창세기 14:20–21'),
      { n: '아브람', t: '(소돔 왕의 재물을 어떻게 할까?)', choices: [{ t: '"네 말이 내가 아브람으로 치부케 하였다 할까 하여, 네게 속한 것은 무론 한 실이나 신들메라도 내가 취하지 아니하리라."', then: () => { st().refused = 1; } },
        { t: '(싸움의 값이니 받아 둔다)', then: () => setTimeout(() => say([T('아브람은 받지 않았습니다. 자기를 부하게 하신 분이 소돔 왕이 아니라 하나님이심을 모두가 알기를 바랐어요.', '창세기 14:22–23')], null), 30) }] }],
      () => { Game.insight && Game.insight(1, '아브라함 편 · 롯'); setCh(2, 0); night(21.5); place('daMelch', [200, 200]); place('daLot', [200, 210]); pop('2장을 마쳤어요', '밤이에요 · 장막의 사래에게 가요', 'star'); }))); }
// ------------------------------------------------------------------ ③ 별 (창 15:1–6)
function ch2Sarai() { say([Ln('사래', '롯은 돌아왔지만… 우리 장막에는 아이 울음소리가 없네요. 저는 이제 늙었어요.', 'sad'), A('…', '', 'sad'), T('이 후에 여호와의 말씀이 이상 중에 아브람에게 임하여 가라사대 「아브람아 두려워 말라 나는 너의 방패요 너의 지극히 큰 상급이니라」', '창세기 15:1'),
    A('주 여호와여, 무엇을 내게 주시려나이까? 나는 무자하오니 나의 상속자는 이 다메섹 엘리에셀이니이다.', '창세기 15:2', 'sad'), T('「그 사람은 너의 후사가 아니라. 네 몸에서 날 자가 네 후사가 되리라」 하시고 그를 이끌고 밖으로 나가 가라사대', '창세기 15:4–5'), T('장막 밖 언덕 쪽 빈터로 나가 하늘을 올려다보세요.')], () => { fin('daSarai'); st().ph = 1; G.UI.quest(); }); }
function stars() { P().emote = { k: 'raiseHands', t: 0, dur: 30 }; G.UI.minigame('count', { title: '하늘을 우러러 뭇별을 세어 보라', hint: '하나, 둘, 셋… 별을 세어 보세요.', need: 24, btn: '별 하나 세기', onPress: () => sfx('blip', { pitch: 1.4 + Math.random() * 0.6, vol: 0.35 }) }, ok => { P().emote = null; if (!ok) return;
    say([A('…스물넷, 스물다섯… 아니, 저쪽에도, 그 너머에도. 셀수록 더 많구나.', '', 'awe')], () => narr([D.card('창세기 15:5', '네 자손이 이와 같으리라', '「하늘을 우러러 뭇별을 셀 수 있나 보라」 또 그에게 이르시되 「네 자손이 이와 같으리라」', '창세기 15:5'), D.card('창세기 15:6', '믿으니', '아브람이 여호와를 믿으니 여호와께서 이를 그의 의로 여기시고', '창세기 15:6'),
      D.card('요셉의 꿈', '열한 별', '훗날 요셉이 꿈에서 본 열한 별도, 이 밤 아브람이 세다 만 그 별들 가운데 있었을 거예요.'), D.card('창세기 17:1–5', '아브라함', '아브람의 구십구 세 때에 여호와께서 그에게 나타나서 이르시되 「…이제 후로는 네 이름을 아브람이라 하지 아니하고 아브라함이라 하리니 이는 내가 너로 열국의 아비가 되게 함이니라」', '창세기 17:5')], () => { Game.insight && Game.insight(1, '아브라함 편 · 별'); st().renamed = 1; D.rename('아브라함'); { const sr = npc('daSarai'); if (sr) sr.name = '사라'; } setCh(3, 0); night(12.5); place('daV0', [VIS[0], VIS[1]], 1.2); place('daV1', [VIS[0] - 1.4, VIS[1] + 0.8], 1.2); place('daV2', [VIS[0] - 0.6, VIS[1] - 1.3], 1.2); pop('3장을 마쳤어요', '여러 해 뒤, 한낮 · 장막 문 앞에 나그네 셋이 서 있어요', 'star'); })); }); }
// ------------------------------------------------------------------ ④ 세 나그네 (창 18:1–15)
function greet() { P().emote = { k: 'prostrate', t: 0, dur: 3.2 }; setTimeout(() => say([T('아브라함이 눈을 들어 본즉 사람 셋이 맞은편에 섰는지라. 그가 그들을 보자 곧 장막 문에서 달려 나가 영접하며 몸을 땅에 굽혀', '창세기 18:2'), A('내 주여, 내가 주께 은혜를 입었사오면 원컨대 종을 떠나 지나가지 마옵시고, 물을 조금 가져오게 하사 당신들의 발을 씻으시고 나무 아래서 쉬소서. 내가 떡을 조금 가져오리니 당신들의 마음을 쾌활케 하신 후에 지나가소서.', '창세기 18:3–5'), Ln('나그네', '네 말대로 그리하라.', '', '창세기 18:5'),
    T('급히 움직이세요: 우물에서 발 씻을 물, 사래에게 떡, 짐승 떼에서 기름진 송아지.')], () => { P().emote = null; st().ph = 1; st().got = {}; G.UI.quest(); }), 600); }
const got = k => { st().got[k] = 1; G.UI.quest(); if (['w', 'b', 'c'].every(x => st().got[x])) pop('채비를 다 했어요', '나무 아래 나그네들께 상을 차려 드려요', 'star'); };
function serve() { say([T('아브라함이 뻐터와 우유와 하인이 요리한 송아지를 가져다가 그들의 앞에 진설하고 나무 아래 모셔 서매 그들이 먹으니라.', '창세기 18:8'), Ln('나그네', '네 아내 사라가 어디 있느냐?', '', '창세기 18:9'), A('장막에 있나이다.'), Ln('나그네', '기한이 이를 때에 내가 정녕 네게로 돌아오리니 네 아내 사라에게 아들이 있으리라.', '', '창세기 18:10'),
    T('사라가 그 뒤 장막 문에서 들었더라. 사라가 속으로 웃고 이르되 「내가 노쇠하였고 내 주인도 늙었으니 내게 어찌 낙이 있으리요」', '창세기 18:10–12'), Ln('나그네', '사라가 왜 웃느냐? 여호와께 능치 못한 일이 있겠느냐? 기한이 이를 때에 내가 네게로 돌아오리니 사라에게 아들이 있으리라.', '', '창세기 18:13–14')],
  () => { Game.insight && Game.insight(1, '아브라함 편 · 세 나그네'); setCh(4, 0); ['daV0', 'daV1', 'daV2'].forEach((id, i) => Game.npcWalk(id, wx(VIEW) + i * 1.3, wz(VIEW) - i * 0.8, null, 1.8)); pop('4장을 마쳤어요', '나그네들이 소돔 쪽으로 일어서요 · 배웅하러 따라가요', 'star'); }); }
// ------------------------------------------------------------------ ⑤ 간구 (창 18:16–33)
const PLEA = [[50, '주께서 의인을 악인과 함께 멸하시려나이까? 그 성중에 의인 오십이 있을지라도 주께서 그곳을 멸하시고 그 오십 의인을 위하여 용서치 아니하시리이까?', '내가 만일 소돔 성중에서 의인 오십을 찾으면 그들을 위하여 온 지경을 용서하리라.'],
  [45, '티끌과 같은 나라도 감히 주께 고하나이다. 오십 의인 중에 오 인이 부족할 것이면 그 오 인 부족함을 인하여 온 성을 멸하시리이까?', '내가 거기서 사십오 인을 찾으면 멸하지 아니하리라.'], [40, '거기서 사십 인을 찾으시면 어찌하시려나이까?', '사십 인을 인하여 멸하지 아니하리라.'],
  [30, '내 주여 노하지 마옵시고 말씀하게 하옵소서. 거기서 삼십 인을 찾으시면 어찌하시려나이까?', '내가 거기서 삼십 인을 찾으면 멸하지 아니하리라.'], [20, '내가 감히 내 주께 고하나이다. 거기서 이십 인을 찾으시면 어찌하시려나이까?', '내가 이십 인을 인하여 멸하지 아니하리라.'],
  [10, '주는 노하지 마옵소서. 내가 이번만 더 말씀하리이다. 거기서 십 인을 찾으시면 어찌하시려나이까?', '내가 십 인을 인하여도 멸하지 아니하리라.']];
function plea(i) { if (i === 0) { say([T('그 사람들이 거기서 일어나서 소돔으로 향하고 아브라함은 그들을 전송하러 함께 나가니라.', '창세기 18:16'), T('「소돔과 고모라에 대한 부르짖음이 크고 그 죄악이 심히 중하니」… 아브라함은 여호와 앞에 그대로 섰더니', '창세기 18:20–22'), A('(저 성에는 조카 롯이 산다…)', '', 'fear')], () => plea1(0)); return; } plea1(i); }
function plea1(i) { const [n, q, a] = PLEA[i]; say([A(q, '창세기 18:' + [24, 28, 29, 30, 31, 32][i], i >= 3 ? 'fear' : ''), Ln('', a), { n: '아브라함', t: i < 5 ? `(${n}명… 더 구할까?)` : '(열 명. 여기까지다.)', choices: i < 5 ? [{ t: '한 번 더 간구한다', then: () => setTimeout(() => plea1(i + 1), 40) }, { t: '(두려워 입을 다문다)', then: () => setTimeout(() => say([T('아브라함은 두려웠지만 물러서지 않았습니다. 한 사람이라도 더 살리고 싶었습니다.')], () => plea1(i + 1)), 40) }]
    : [{ t: '(고개를 숙이고 물러난다)', then: () => setTimeout(() => narr([D.card('창세기 18:33', '돌아서는 길', '여호와께서 아브라함과 말씀을 마치시고 즉시 가시니 아브라함도 자기 곳으로 돌아갔더라.', '창세기 18:33'), D.card('창세기 19:29', '롯을 기억하사', '하나님이 들의 성들을 멸하실 때… 하나님이 아브라함을 생각하사 롯을 그 엎으시는 중에서 내어 보내셨더라.', '창세기 19:29')],
        () => { Game.insight && Game.insight(1, '아브라함 편 · 간구'); setCh(5, 0); ['daV0', 'daV1', 'daV2'].forEach(id => place(id, [200, 220])); night(9); pop('5장을 마쳤어요', '이듬해 · 장막의 사라에게 가요', 'star'); }), 40) }] }], null); }
// ------------------------------------------------------------------ ⑥ 이삭 (창 21:1–7)
function isaacBorn() { say([T('여호와께서 그 말씀대로 사라를 권고하셨고 여호와께서 그 말씀대로 사라에게 행하셨으므로, 사라가 잉태하고 하나님의 말씀하신 기한에 미쳐 늙은 아브라함에게 아들을 낳으니', '창세기 21:1–2'), Ln('사라', '하나님이 나로 웃게 하시니 듣는 자가 다 나와 함께 웃으리로다.', 'happy', '창세기 21:6'), Ln('사라', '사라가 자식들을 젖 먹이겠다고 누가 아브라함에게 말하였으리요마는, 아브라함 노경에 내가 아들을 낳았도다.', 'happy', '창세기 21:7'),
    T('아브라함이 그 아들의 이름을 이삭이라 하였습니다. 「웃음」이라는 뜻이에요. 백 세에 얻은 아들이었습니다.', '창세기 21:3, 5'), T('…그리고 여러 해가 흘러, 아이는 아버지의 어깨만큼 자랐습니다.')], () => { fin('daSarai'); Game.insight && Game.insight(1, '아브라함 편 · 이삭'); setCh(6, 0); night(5.2); place('daIsaac', [TENT[0] + 3, TENT[1] - 3], 2.4);
    setTimeout(() => narr([D.card('창세기 22:1–2', '그 일 후에', '하나님이 아브라함을 시험하시려고 그를 부르시되 「아브라함아」 하시니 그가 가로되 「내가 여기 있나이다」', '창세기 22:1'), D.card('창세기 22:2', '모리아 땅으로', '「네 아들 네 사랑하는 독자 이삭을 데리고 모리아 땅으로 가서 내가 네게 지시하는 한 산 거기서 그를 번제로 드리라」', '창세기 22:2'), D.card('창세기 22:3', '아침에 일찍이', '아브라함이 아침에 일찍이 일어나 나귀에 안장을 지우고… 번제에 쓸 나무를 쪼개어 가지고 떠나. 장막 곁 나뭇더미로 가세요.', '창세기 22:3')]), 700); }); }
// ------------------------------------------------------------------ ⑦ 모리아 (창 22:3–19)
function wood() { G.UI.minigame('rhythm', { title: '번제에 쓸 나무 쪼개기', hint: '도끼가 줄에 닿을 때 눌러요. 아브라함의 손이 떨립니다.', need: 7, beats: 12 }, ok => { st().ph = 1; sfx('thud'); say([Ln('이삭', '아버지, 어디 가세요? 이 나무는 다 뭐예요?', 'happy'), A('하나님께 예배하러 간다, 내 아들아. 너도 함께 가자.', '', 'tender')], () => { G.UI.quest(); }); }); }
function journey() { say([Ln('이삭', '네, 아버지!', 'happy')], () => { fin('daIsaac'); G.UI.fade(() => { night(7.5); st().ph = 2; Game.teleport(wx(HILL) - HR - 4, wz(HILL) - 1, Math.PI / 2); place('daIsaac', [HILL[0] - HR - 5.5, HILL[1] + 0.6], Math.PI / 2); place('daEli', [HILL[0] - HR - 8, HILL[1] - 2], 1.6); },
    () => narr([D.card('창세기 22:4', '제삼일에', '제삼일에 아브라함이 눈을 들어 그곳을 멀리 바라본지라.', '창세기 22:4')], () => say([A('너희는 나귀와 함께 여기서 기다리라. 내가 아이와 함께 저기 가서 경배하고 너희에게로 돌아오리라.', '창세기 22:5'), T('「돌아오리라.」 아브라함은 그렇게 말했습니다. 아브라함이 번제 나무를 취하여 그 아들 이삭에게 지우고, 자기는 불과 칼을 손에 들고 두 사람이 동행하더니', '창세기 22:6'), T('이삭과 함께 산꼭대기로 올라가세요.')], () => G.UI.quest()))); }); }
function isaacAsk() { st().asked = 1; P().vx = P().vz = 0; say([Ln('이삭', '내 아버지여.', '', '창세기 22:7'), A('내 아들아, 내가 여기 있노라.', '창세기 22:7', 'tender'), Ln('이삭', '불과 나무는 있거니와 번제할 어린 양은 어디 있나이까?', '', '창세기 22:7'), { n: '아브라함', t: '(…무엇이라 답할까.)', choices: [{ t: '"아들아, 번제할 어린 양은 하나님이 자기를 위하여 친히 준비하시리라."' }] }, T('두 사람이 함께 나아가서', '창세기 22:8')], () => G.UI.quest()); }
function altar2() { G.UI.minigame('count', { title: '단을 쌓다', hint: '돌을 하나씩 올려요.', need: 7, btn: '돌 올리기', onPress: () => sfx('step', { surf: 'stone', vol: 0.6 }) }, ok => { if (!ok) return; st().altar2 = 1; st().ph = 3; const i = npc('daIsaac'); if (i) { i.walk = null; place('daIsaac', [TOP[0] + 0.9, TOP[1] + 0.4], -1.6); i.act = 'kneelRest'; }
    narr([D.card('창세기 22:9', '지시하신 곳에', '하나님이 그에게 지시하신 곳에 이른지라. 이에 아브라함이 그곳에 단을 쌓고 나무를 벌여 놓고 그 아들 이삭을 결박하여 단 나무 위에 놓고', '창세기 22:9'), D.card('창세기 22:10', '', '손을 내밀어 칼을 잡고…', '창세기 22:10')],
      () => { sfx('insight', { pitch: 1.3 }); Game.CAM.shake = 0.5; say([Ln('여호와의 사자', '아브라함아, 아브라함아!', 'awe', '창세기 22:11'), A('내가 여기 있나이다.', '창세기 22:11', 'cry'), Ln('여호와의 사자', '그 아이에게 네 손을 대지 말라. 아무 일도 그에게 하지 말라. 네가 네 아들 네 독자라도 내게 아끼지 아니하였으니 내가 이제야 네가 하나님을 경외하는 줄을 아노라.', 'awe', '창세기 22:12'),
        T('아브라함이 눈을 들어 살펴본즉… 산꼭대기 둘레의 수풀을 살펴보세요. 어디선가 양 우는 소리가 들립니다.')], () => { const i2 = npc('daIsaac'); if (i2) i2.act = null; st().ph = 4; st().seen = {}; sfx('sheep', { vol: 0.6 }); G.UI.quest(); }); }); }); }
function thicket(k) { const s0 = st(); if (s0.seen[k]) return; s0.seen[k] = 1; const n = Object.keys(s0.seen).length; sfx('rustle'); if (n < THICK.length) { G.UI.toast(n === 1 ? '바람에 가지만 흔들려요 · 다른 수풀을 봐요' : '여기도 아니에요 · 양 소리가 더 가까워졌어요'); sfx('sheep', { vol: 0.5 + n * 0.2 }); return; }
  s0.ramAt = k; place('daRam', [THICK[k][0] + 0.6, THICK[k][1] + 0.4], 1); sfx('sheep'); say([T('한 숫양이 뒤에 있는데 뿔이 수풀에 걸렸는지라.', '창세기 22:13'), Ln('이삭', '아버지! 양이에요! 양이 여기 있어요!', 'happy'), A('…하나님이 준비하셨구나. 친히 준비하셨구나.', '', 'cry')],
    () => narr([D.card('창세기 22:13', '아들을 대신하여', '아브라함이 가서 그 숫양을 가져다가 아들을 대신하여 번제로 드렸더라.', '창세기 22:13'), D.card('창세기 22:14', '여호와 이레', '아브라함이 그 땅 이름을 여호와 이레라 하였으므로 오늘까지 사람들이 이르기를 「여호와의 산에서 준비되리라」 하더라.', '창세기 22:14'),
      D.card('창세기 22:16–18', '하늘의 별과 같이', '「네가 이같이 행하여 네 아들 네 독자를 아끼지 아니하였은즉 내가 네게 큰 복을 주고 네 씨로 크게 성하여 하늘의 별과 같고 바닷가의 모래와 같게 하리니… 네 씨로 말미암아 천하 만민이 복을 얻으리니」', '창세기 22:16–18'),
      D.card('아브라함 편을 마쳤어요', '약속의 길', '이삭은 야곱을 낳고, 야곱은 요셉을 낳았습니다. 구덩이에서도, 옥에서도 요셉을 붙든 것은 이 산에서 다시 굳어진 그 약속이었어요.\n「아버지는 이 이야기를 하실 때마다 불을 한참 바라보셨다.」')],
      () => { const first = !s0.done; s0.done = 1; setCh(7, 0); if (first) { Game.insight && Game.insight(3, '창세기 아브라함 편'); S().flags.dlcAbrahamDone = 1; } say([{ n: '', t: '이야기가 끝났습니다. 세겜의 제단 앞으로 돌아갈까요?', choices: [{ t: '돌아가기', then: () => D.leave(() => G.UI.toast('요셉은 한참 동안 돌 제단에 손을 얹고 있었습니다')) }, { t: '산 위에 조금 더 머물기' }] }], null); })); }

// ------------------------------------------------------------------ the land
const person = (id, name, look, l, face, o) => Object.assign({ id, name, look, x: l[0], z: l[1], face, talkR: 3, noBond: true }, o || {});
const GLOOK = t(L0, { top: 0x5a3a2a, mantle: 0x3a2a22, headwear: 'cloth', clothCol: 0x6a2a22 });
let M1 = null, M2 = null; const MA = G.m4(), MB = G.m4();
const altarMesh = seed => { const g = new G.GB(seed); for (let ly = 0; ly < 3; ly++) { const n = 6 - ly, rad = 0.9 - ly * 0.18; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + ly * 0.5; g.sph(0.3, 6, 4, { at: [Math.cos(a) * rad, 0.2 + ly * 0.3, Math.sin(a) * rad], s: [1.15, 0.72, 1], c: [0x9a9284, 0x8a8276, 0xa8a090][i % 3], flat: true, j: 0.08 }); } } g.box(1.1, 0.12, 1.1, { at: [0, 1.02, 0], c: 0x8a8276, j: 0.05 }); for (let i = 0; i < 4; i++) g.box(0.9, 0.09, 0.12, { at: [0, 1.14 + (i % 2) * 0.08, -0.3 + i * 0.2], ry: i % 2 ? 0.2 : -0.15, c: 0x5a4028 }); return G.R.mesh(g); };
LAND = Ls.make({ key: 'dlca', name: '가나안 (증조할아버지의 이야기)', BX: 40, BZ: 150, BY: 64, hours: 0, seed: 331, spawn: [OUT[0] + 2.5, OUT[1], Math.PI / 2], hello: ['', ''],
  people: [
    person('daSarai', '사래', t(LW, { age: undefined, hair: 0x4a3a30, top: 0x7a4a6a, clothCol: 0xe0d0b0 }), [TENT[0] - 2.4, TENT[1] - 3], 2.6, { show: () => on() }),
    person('daEli', '엘리에셀', t(L0, { top: 0x8a7a5a, beard: 'short' }), [TENT[0] + 4, TENT[1] - 4.5], -2.4, { show: () => on(), chat: ['주인님의 집 일은 제가 맡고 있습니다.', '다메섹에서부터 주인님을 따라왔지요.'] }),
    person('daLot', '롯', t(L0, { top: 0x4a6a7a, beard: 'short' }), LOT, -2, { act: 'kneelRest', show: () => on() && ch() === 1 && ph() >= 1 }),
    person('daMelch', '살렘 왕 멜기세덱', t(LJ0, { top: 0xf0ece0, mantle: 0x6a3a8a, mantleTrim: 0xe0b040, trim: 0xe0b040, limp: false }), [200, 200], 1.4, { show: () => on() && ch() === 1 && ph() === 3 }),
    ...GUARDS.map((g, i) => person('daG' + i, '동방 왕의 파수꾼', GLOOK, g.a, 0, { prop: 'spear', noTalk: true, show: () => on() && ch() === 1 && ph() >= 1 && ph() < 3 })),
    ...[0, 1, 2].map(i => person('daV' + i, '나그네', t(LJ0, { top: 0xf2efe6, mantle: 0xe8e4d8, mantleTrim: 0xd8c890, trim: 0xd8c890, hair: 0x3a2a20, beardCol: 0x3a2a20, age: undefined, limp: false }), [200, 220 + i], 1.2, { noTalk: i > 0, show: () => on() && (ch() === 3 || ch() === 4) })),
    person('daIsaac', '이삭', t(LK, { top: 0xd8c8a0, kid: false }), [200, 230], 2.4, { scale: 0.82, show: () => on() && ch() >= 6 }),
    { id: 'daRam', name: '수풀에 걸린 숫양', animal: 'sheep', x: 200, z: 240, face: 1, noTalk: true, show: () => on() && ch() >= 6 && st().ramAt !== undefined },
    ...[[-14, 24], [-10, 21], [-12, 27], [-8, 25], [-16, 21]].map(([x, z], i) => ({ id: 'daSheep' + i, name: '양', animal: i === 4 ? 'cow' : 'sheep', x, z, face: i, wander: 3, noTalk: true, noTag: true, show: () => on() }))],
  talk: {
    daSarai() { const c = ch(); if (c === 0) { ch0Sarai(); return true; } if (c === 2 && ph() === 0) { ch2Sarai(); return true; } if (c === 5) { isaacBorn(); return true; }
      if (c === 3 && ph() === 1 && !st().got.b) { say([A('속히 고운 가루 세 스아를 가져다가 반죽하여 떡을 만들라.', '창세기 18:6'), Ln('사라', '세 스아나요? 귀한 손님이신가 봐요. 금방 구울게요!', 'happy')], () => { fin('daSarai'); got('b'); }); return true; }
      say([Ln(st().renamed ? '사라' : '사래', c >= 6 ? '이삭이 오늘은 유난히 일찍 일어났네요. …당신 얼굴이 왜 그래요?' : c === 1 ? '롯을 꼭 데려오세요. 조심하시고요.' : c === 4 ? '(장막 문 뒤에서) …제가 웃지 않았어요.' : '어서 다녀오세요.', c === 4 ? 'fear' : '')], () => fin('daSarai')); return true; },
    daEli() { const c = ch(); if (c === 1 && ph() === 0) { ch1News(); return true; } if (c === 3 && ph() === 1 && st().got.c === 0.5) { say([A('이 송아지를 급히 요리하라.', '창세기 18:7'), Ln('엘리에셀', '기름지고 좋은 놈이군요. 바로 잡겠습니다!')], () => { fin('daEli'); got('c'); }); return true; } return false; },
    daLot() { if (ch() === 1 && ph() === 1) { freeLot(); return true; } return false; },
    daV0() { const c = ch(); if (c === 3 && ph() === 0) { greet(); return true; } if (c === 3 && ph() === 1) { if (['w', 'b', 'c'].every(x => st().got[x] === 1)) { serve(); return true; } say([Ln('나그네', '(나무 그늘에서 기다리신다.)')], () => fin('daV0')); return true; } if (c === 4) { fin('daV0'); plea(0); return true; } /* (they walk toward the hill; speaking to the first of them begins it wherever they are) */ return false; },
    daIsaac() { const c = ch(); if (c === 6 && ph() === 1) { journey(); return true; } say([Ln('이삭', c === 6 && ph() === 0 ? '아버지, 좋은 아침이에요!' : c >= 7 ? '아버지, 이제 집에 가요. 어머니가 기다리세요.' : '아버지, 저 여기 있어요.', 'happy')], () => fin('daIsaac')); return true; } },
  tick(dt) { const s0 = st(), c = ch(), p = P(); if (!s0 || G.UI.busy() || Game.cineOn) return;
    if (c === 1 && (ph() === 1 || ph() === 2) && !s0.busy) { GUARDS.forEach((g, i) => { const n = npc('daG' + i); if (!n || s0.down[i]) return; if (!n.walk) { n._leg = (n._leg || 0) ^ 1; const tg = n._leg ? g.b : g.a; Game.npcWalk('daG' + i, wx(tg), wz(tg), null, 1.3); }
        const dx = p.x - n.x, dz = p.z - n.z, d = Math.hypot(dx, dz), low = p.crouch ? 0.62 : 1, front = Math.cos(Math.atan2(dx, dz) - n.face) > 0.5; if (!s0.busy && (d < 1.5 * low || (front && d < 5.2 * low))) caught(i); });
      if (s0.lot) { follow('daLot', dt, 2); if (Math.hypot(p.x - wx(EDGE), p.z - wz(EDGE)) < 4.5) ch1Out(); } }
    if (c === 6 && (ph() === 2 || ph() === 4)) follow('daIsaac', dt, 2);
    if (c === 6 && ph() === 2 && !s0.asked && hillH(p.x - W0().x, p.z - W0().z) > 1.3) isaacAsk(); },
  ctx(s, lx, lz) { const out = [], c = ch(), p0 = ph(), s0 = st(), near = (q, r) => Math.hypot(q[0] - lx, q[1] - lz) < (r || 3), at = (q, o) => Object.assign({ x: wx(q), z: wz(q), y: 1.1, noMagnet: true }, o);
    if (near(OUT, 3.6)) out.push(at(OUT, { d: 0.6, label: '이야기에서 나오기 (세겜으로)', key: 'daOut', use: () => say([{ n: '', t: '이야기를 잠시 멈추고 세겜의 제단 앞으로 돌아갈까요? 여기까지 한 것은 남아요.', choices: [{ t: '돌아가기', then: () => D.leave() }, { t: '더 머물기' }] }], null) }));
    if (c === 0 && p0 === 0 && near(OAK, 5)) out.push(at(OAK, { d: 0, label: '모레 상수리나무 아래 서기', key: 'daOak', use: oak }));
    if (c === 0 && p0 === 1) { const n = Object.keys(s0.stones || {}).length; STONES.forEach((q, i) => { if (!s0.stones[i] && near(q, 2)) out.push(at(q, { d: -0.2, label: `돌 줍기 (${n}/8)`, key: 'daSt' + i, use: () => { s0.stones[i] = 1; P().emote = { k: 'pick', t: 0, dur: 0.9 }; sfx('pickup'); G.UI.quest(); if (Object.keys(s0.stones).length >= 8) pop('돌을 다 모았어요', '상수리나무 곁 빈터에 제단을 쌓아요', 'star'); } })); });
      if (n >= 8 && near(ALT1, 3)) out.push(at(ALT1, { d: -0.4, label: '제단 쌓기', key: 'daAlt1', use: altar1 })); }
    if (c === 2 && p0 === 1 && near(VIEW, 5)) out.push(at(VIEW, { d: 0, label: '하늘을 우러러보기', key: 'daStars', use: stars }));
    if (c === 3 && p0 === 1) { if (!s0.got.w && near(WELLM, 3.4)) out.push(at(WELLM, { d: 0, label: '발 씻을 물 긷기', key: 'daW', use: () => G.UI.minigame('balance', { title: '물동이 이고 가기', hint: '물이 쏟아지지 않게 가운데로 맞춰요.', dur: 9 }, ok => { if (ok) got('w'); else G.UI.toast('물을 쏟았어요 · 다시 길어요'); }) }));
      if (!s0.got.c && near(HERD, 5)) out.push(at(HERD, { d: 0.2, label: '기름지고 좋은 송아지 고르기', key: 'daC', use: () => { s0.got.c = 0.5; sfx('cow'); G.UI.toast('송아지를 골랐어요 · 하인 엘리에셀에게 맡겨요'); G.UI.quest(); } })); }
    if (c === 6 && p0 === 0 && near(WOOD, 3.2)) out.push(at(WOOD, { d: 0, label: '번제에 쓸 나무 쪼개기', key: 'daWood', use: wood }));
    if (c === 6 && p0 === 2 && s0.asked && near(TOP, 3.2)) out.push(at(TOP, { d: 0, label: '단 쌓기', key: 'daAlt2', use: altar2 }));
    if (c === 6 && p0 === 4) THICK.forEach((q, i) => { if (!s0.seen[i] && near(q, 2.6)) out.push(at(q, { d: 0, label: '수풀 살피기', key: 'daTh' + i, use: () => thicket(i) })); });
    return out; },
  quest(s) { const c = ch(), p0 = ph(), s0 = st(), n = Object.keys(s0.stones || {}).length, R = (t0, ok) => ({ t: t0, ok: !!ok });
    if (c === 0) return p0 === 0 ? [R('1장 부르심 · 북서쪽 모레 상수리나무 아래로 가기')] : [R(`1장 부르심 · 둘레의 돌 모으기 (${n}/8)`, n >= 8), R('상수리나무 곁 빈터에 제단 쌓기', s0.altar1)];
    if (c === 1) return [R(['2장 롯 · 장막의 엘리에셀과 이야기하기', '2장 롯 · 동쪽 진영 한가운데, 롯이 묶인 곳으로 숨어들기', '2장 롯 · 롯을 데리고 진영 서쪽 끝으로 빠져나가기', '2장 롯 · 살렘 왕 멜기세덱'][p0])].concat(p0 === 1 || p0 === 2 ? [R('파수꾼의 눈길(앞쪽)을 피해요 · 앉기 단추로 낮게')] : []);
    if (c === 2) return [R(p0 === 0 ? '3장 별 · 장막의 사래와 이야기하기' : '3장 별 · 장막 동쪽 빈터에서 하늘을 우러러보기')];
    if (c === 3) return p0 === 0 ? [R('4장 세 나그네 · 서쪽 나무 아래 나그네들에게 달려가기')] : [R('4장 세 나그네 · 우물에서 발 씻을 물 긷기', s0.got.w), R('사라에게 떡을 부탁하기', s0.got.b), R('짐승 떼에서 송아지를 골라 엘리에셀에게', s0.got.c === 1), R('나그네들께 상 차려 드리기 (앞의 나그네에게)')];
    if (c === 4) return [R('5장 간구 · 나그네들을 따라가 말씀드리기')]; if (c === 5) return [R('6장 웃음 · 장막의 사라에게 가기')];
    if (c === 6) return [R(['7장 모리아 · 장막 곁 나뭇더미에서 번제 나무 쪼개기', '7장 모리아 · 이삭에게 말하기', s0.asked ? '7장 모리아 · 산꼭대기에 단 쌓기' : '7장 모리아 · 이삭과 함께 산을 오르기', '7장 모리아', `7장 모리아 · 산꼭대기 둘레의 수풀 살피기 (${Object.keys(s0.seen || {}).length}/3)`][p0])];
    return [R('아브라함 편을 마쳤어요 · 서쪽 돌무더기에서 「이야기에서 나오기」', 1)]; },
  dyn(list) { const s0 = st(), W = W0(); if (s0.altar1) { M1 = M1 || altarMesh(41); G.m4trs(MA, wx(ALT1), W.y, wz(ALT1), 0.4, 0, 0, 1, 1, 1); list.push({ mesh: M1, m: MA, outline: true }); } if (s0.altar2) { M2 = M2 || altarMesh(43); G.m4trs(MB, wx(TOP), W.y + hillH(TOP[0], TOP[1]), wz(TOP), 1.1, 0, 0, 1, 1, 1); list.push({ mesh: M2, m: MB, outline: true }); } },
  weather: { clear: 0.8, cloudy: 0.2, rain: 0, wind: 0, fog: 0, dust: 0, storm: 0 },
  floor: (lx, lz) => (Math.abs(lx) < 56 && Math.abs(lz) < 52 ? 64 + hillH(lx, lz) : null),
  build(B) { const { box, cyl, sph, put, col, colR, rng, g, X, Z, BY } = B, GR = 0x9aa262, DRY = 0xb8a878;
    box(112, 14, 104, 0, BY - 7, 0, GR); g.box(560, 1, 560, { at: [X, BY - 0.6, Z], c: 0x98985e, j: 0.05 });
    for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 160 + rng() * 40; sph(28 + rng() * 16, Math.cos(a) * r, BY - 10, Math.sin(a) * r, [0x8a8a5a, 0x9a9664, 0x7e8250][i % 3], { s: [1.4, 0.55, 1], j: 0.06 }); }
    /* Moriah: a stepped hill you can walk up from any side */
    for (let i = 1; i <= HR - 2; i++) cyl(HR - i + 0.5, HR - i + 1.5, HSTEP, 28, HILL[0], BY + i * HSTEP - HSTEP / 2, HILL[1], i % 2 ? 0xa89c74 : 0x9c9068, { j: 0.03 });
    THICK.forEach(([x, z], i) => { const y = BY + hillH(x, z); for (let k = 0; k < 5; k++) sph(0.55 + rng() * 0.3, x + Math.cos(k * 1.3) * 0.7, y + 0.45 + (k % 2) * 0.35, z + Math.sin(k * 1.3) * 0.7, [0x4a6a34, 0x5a7a3c, 0x3e5a2c][k % 3], { j: 0.1 }); });
    /* the oak of Moreh */
    cyl(0.5, 0.75, 4.4, 9, OAK[0], BY + 2.2, OAK[1], 0x5a4028); for (let k = 0; k < 7; k++) sph(2.3 + rng() * 0.9, OAK[0] + Math.cos(k) * 2.2, BY + 5.2 + (k % 3) * 0.7, OAK[1] + Math.sin(k) * 2.2, [0x3e6a34, 0x4a7a3c, 0x356030][k % 3], { j: 0.08 }); colR(OAK[0], OAK[1], 0.9, BY + 5);
    STONES.forEach(([x, z]) => sph(0.34, x, BY + 0.18, z, 0x9a9284, { s: [1.2, 0.7, 1], j: 0.1 })); box(3.2, 0.04, 3.2, ALT1[0], BY + 0.02, ALT1[1], DRY, { j: 0.05 });
    /* tents: Abram's camp at Mamre */
    const tent = (x, z, w, d, c) => { for (const s of [1, -1]) box(Math.hypot(w / 2, 2.2) + 0.06, 0.06, d, x + s * w / 4, BY + 1.1, z, c, { rz: -s * Math.atan2(2.2, w / 2) }); box(w * 0.5, 2.0, 0.06, x, BY + 1.0, z + d / 2, c); col(x, z + d / 2 - 0.2, w, 0.5, BY - 1, BY + 2.2); for (const s of [1, -1]) col(x + s * w / 2.2, z, 0.5, d, BY - 1, BY + 1.6); };
    tent(TENT[0], TENT[1], 6, 5, 0x4a3e38); tent(TENT[0] + 8, TENT[1] + 1, 4.4, 4, 0x6a5a48); tent(TENT[0] - 8, TENT[1] + 3, 4.4, 4, 0x5a4a3a);
    cyl(1.1, 1.2, 0.7, 12, WELLM[0], BY + 0.35, WELLM[1], 0x9a9282); colR(WELLM[0], WELLM[1], 1.3, BY + 1); for (let k = 0; k < 6; k++) box(1.4, 0.16, 0.2, WOOD[0] + (k % 2) * 0.12, BY + 0.1 + Math.floor(k / 2) * 0.17, WOOD[1] + (k % 3) * 0.24, 0x6a4a2a, { ry: 0.1 * k }); colR(WOOD[0], WOOD[1], 0.8, BY + 0.8);
    box(16, 0.05, 10, HERD[0], BY + 0.02, HERD[1] + 2, 0x86a04e, { j: 0.06 });
    /* the kings' camp near Dan */
    for (const [x, z, c] of [[36, -24, 0x5a2a22], [42, -20, 0x4a2a2a], [31, -28, 0x5a3a2a], [44, -30, 0x4a2a22], [38, -32, 0x5a2a2a]]) tent(x, z, 4.6, 4, c);
    cyl(0.07, 0.08, 2.2, 6, LOT[0] + 0.5, BY + 1.1, LOT[1] - 0.4, 0x5a4028); for (const [x, z] of [[33, -21], [40, -26]]) { cyl(0.5, 0.6, 0.3, 8, x, BY + 0.15, z, 0x3a3028); sph(0.3, x, BY + 0.45, z, 0xe08030, { j: 0.2 }); }
    for (let i = 0; i < 5; i++) sph(0.42 + rng() * 0.15, OUT[0] - 1 + Math.cos(i * 1.3) * 0.7, BY + 0.25 + (i % 2) * 0.3, OUT[1] + Math.sin(i * 1.3) * 0.7, 0x9a9284, { s: [1.1, 0.75, 1] }); colR(OUT[0] - 1, OUT[1], 1.0, BY + 1);
    cyl(0.4, 0.55, 3.4, 8, VIS[0] - 2.6, BY + 1.7, VIS[1] - 0.5, 0x5a4028); for (let k = 0; k < 5; k++) sph(1.8 + rng() * 0.6, VIS[0] - 2.6 + Math.cos(k * 1.2) * 1.5, BY + 4 + (k % 2) * 0.6, VIS[1] - 0.5 + Math.sin(k * 1.2) * 1.5, [0x3e6a34, 0x4a7a3c][k % 2], { j: 0.08 }); colR(VIS[0] - 2.6, VIS[1] - 0.5, 0.7, BY + 4);
    for (const [x, z] of [[-46, -34], [48, 44], [-44, 40], [50, -6], [-6, -40], [6, 44]]) { if (put('oak', x, z, { s: 1 }) || put('palm', x, z, { s: 1 })) colR(x, z, 0.5); } } });
D.add({ key: 'abraham', land: 'dlca', hero: s0 => s0.renamed ? '아브라함' : '아브람', outfit: 'dlcAbraham', spawn: () => [OUT[0] + 2.5, OUT[1], Math.PI / 2],
  onEnter(s0) { { const sr = npc('daSarai'); if (sr) sr.name = s0.renamed ? '사라' : '사래'; } const c = s0.ch | 0; night([13, c === 1 && (s0.ph | 0) >= 1 && (s0.ph | 0) < 3 ? 23 : 16, 21.5, 12.5, 15, 9, (s0.ph | 0) >= 2 ? 7.5 : 5.2, 9][c] || 13); if (G.Weather && G.Weather.set) G.Weather.set('clear', 8);
    if (c === 1 && (s0.ph === 1 || s0.ph === 2)) { s0.lot = 0; s0.ph = 1; s0.busy = 0; GUARDS.forEach((g, i) => { place('daG' + i, g.a, 0); const n = npc('daG' + i); if (n) n.act = s0.down[i] ? 'fallen' : null; }); place('daLot', LOT, -2); }
    if (c === 3 || c === 4) { const q = c === 4 ? VIEW : VIS; place('daV0', [q[0], q[1]], 1.2); place('daV1', [q[0] - 1.4, q[1] + 0.8], 1.2); place('daV2', [q[0] - 0.6, q[1] - 1.3], 1.2); }
    if (c >= 6) { place('daIsaac', (s0.ph | 0) >= 2 ? [HILL[0] - HR - 5.5, HILL[1] + 0.6] : [TENT[0] + 3, TENT[1] - 3], 2.4); if ((s0.ph | 0) === 3) { s0.ph = 2; s0.altar2 = 0; } if (s0.ramAt !== undefined) place('daRam', [THICK[s0.ramAt][0] + 0.6, THICK[s0.ramAt][1] + 0.4], 1); } },
  intro(s0) { if (!s0.ch && !s0.ph) narr([D.card('창세기 12:1–3', '아브라함 편 · 약속의 별', '여호와께서 아브람에게 이르시되 「너는 너의 본토 친척 아비 집을 떠나 내가 네게 지시할 땅으로 가라. 내가 너로 큰 민족을 이루고 네게 복을 주어 네 이름을 창대케 하리니 너는 복의 근원이 될지라」', '창세기 12:1–2'),
      D.card('창세기 12:4', '칠십오 세에', '이에 아브람이 여호와의 말씀을 좇아갔고 롯도 그와 함께 갔으며, 아브람이 하란을 떠날 때에 그 나이 칠십오 세였더라.', '창세기 12:4'), D.card('증조할아버지의 이야기', '아브람이 되어', '이 이야기 속에서 요셉은 증조할아버지 아브람이 되어 걸어요. 북서쪽 큰 상수리나무로 가 보세요.\n서쪽 돌무더기에서 언제든 「이야기에서 나오기」를 할 수 있어요.')]); else G.UI.toast('약속의 이야기를 이어서 떠올려요'); } });
})(window.G);
