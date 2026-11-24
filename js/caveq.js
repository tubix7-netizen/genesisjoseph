/* 약속의 길 — v18.87 곁이야기 「바. 동굴」 깊게 (caveq.js · houseq.js 다음 · 바탕은 cave.js)
   부탁 하나 = 서로 다른 일 3~5가지 · 함께 하는 사람 · 기다림(진짜 시간) · 흔적. 한 부탁 안에서 같은 놀이를 두 번 쓰지 않아요.
   예전에는 「재료 모아 오기 → 펑!」이 전부였고, 실험 재료 셋은 같은 심부름을 세 번씩 되풀이했어요.
   ① 물시계(k_clock): 진흙 · 갈대 → 네브세니와 항아리 빚기(리듬) → 머리카락만 한 구멍 뚫기(균형) → 물을 붓고 한 시간 지켜보기 → 갈대로 눈금 새기기(세기)
      흔적: 공방 탁자 위에서 똑똑 떨어지는 물시계
   ② 빛나는 돌(k_crystal): 돌 셋 → 구리판 갈기(밀기) → 거울 틀에 돌 박기(세기) → 하늘 창 아래 한낮까지 기다리기 → 빛을 공방으로 꺾기(균형)
      흔적: 하늘 창에서 공방까지 비스듬히 드는 빛줄기
   ③ 하늘을 재는 막대(k_star): 통나무 · 실 → 막대에 추 달기(리듬) → 하늘 창 아래 밤까지 앉아 기다리기 → 별 셋을 막대 줄에 맞추기(세기)
      흔적: 하늘 창 아래 서 있는 메르케트
   ④ 메리의 무릎과 석청(k_more1 · 되풀이 없앰): 입구 바위 틈에서 연기로 벌 달래고 석청 따기(밀기) → 메리의 무릎 씻고 꿀 바르기(고르기)
      → 메리 곁에서 해 질 녘까지 염소 지키기 → 네브세니에게 알리기
   ⑤ 막다른 굴의 등잔(k_more2 · 되풀이 없앰): 기름 → 지하 샘에서 물 떠 오기(균형) → 물에 기름 띄워 심지 얹기(리듬) → 막다른 굴에 놓기 → 타는 동안 지켜보기
      흔적: 동쪽 막다른 굴의 등잔불
   ⑥ 갈대 새(k_more3 · 되풀이 없앰): 갈대 넷 → 엮기(세기) → 하늘 창 아래에서 바람 기다리기 → 띄우기(균형)
      흔적: 공방 벽에 매단 갈대 새
   저장: S.flags.vq = { clock, cry, star, honey, lamp, bird } (각각 { s }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life || !G.Cave) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
if (!QS.k_clock || !QS.k_crystal || !QS.k_star || !QS.k_more1) return;
const ST = G.Cave.stage(), CX = ST.x, CZ = ST.z, CY = ST.y, inCave = () => G.Cave.inside();
const E = k => { const s = S(), f = s.flags.vq || (s.flags.vq = {}); return f[k] || (f[k] = { s: 0 }); };
const on = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), toast = m => G.UI.toast(m);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const KN = '기인 현자 네브세니', K = (t, e) => ({ n: KN, t, e }), MR = (t, e) => ({ n: '목동 아이 메리', t, e }), J = (t, e) => ({ n: '요셉', t, e }), T = t => ({ n: '', t });
const hour = () => S().time % 24;
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const ask = (q, right, wrong, then, again) => say([{ n: '', t: q, choices: [right].concat(wrong).sort(() => Math.random() - 0.5).map(c => ({ t: c[0], then: () => setTimeout(() => { if (c === right) then(); else say([T(c[1])], () => again && again()); }, 30) })) }], null);
const sitP = on0 => { P().cpose = on0 ? { k: 'sitg', t: 0, dur: 90, hold: true } : null; };
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: typeof k === 'function' ? k : () => (E(key).s | 0) >= k }));
const tidy = (id, extra) => { const q = QS[id]; delete q.repeat; delete q.take; Object.assign(q, extra); };
let WT = null;
function waitAt(key, at, r, secs, endH, done) { if (G.Overnight && G.Overnight.need(endH)) { const A = arguments; G.Overnight.ask(() => waitAt.apply(null, A)); return; } /* v18.93 a daytime hour already gone: sleep here, go on tomorrow */ const h = hour(); if (!(h >= 6 && h < endH)) { done(); return; } WT = { key, at, r, left: secs, rate: (endH - h) / secs, done, endH, note: 0 }; sitP(true); G.UI.quest(); }
const waiting = k => !!(WT && WT.key === k);
const puff = () => { if (G.FX) for (let i = 0; i < 4; i++) G.FX.burst(CX + 1.4, CY + 1.3, CZ + 46.2, 6, { c: [0.6, 0.58, 0.55], sp: 1.2, up: 1.6, size: 0.6, a: 0.7, g: -0.2, life: 1.6 }); sfx('hit', { pitch: 0.5 }); };

// ------------------------------------------------------------------ places (stage-relative inside the cave)
const T1 = [-5.2, 44.4], T2 = [1.4, 45.0], SKYP = [10, 30.5], POOLP = [-12.4, 29.0], DEAD = [21, 43.2];
const HONEY = [-199.5, 4.5], BOY = () => { const n = Game.npc('cvBoy'); return n ? [n.x, n.z] : [-195.9, -2.4]; }; /* outside, by the mouth */
const W2 = q => [CX + q[0], CZ + q[1]];

// ------------------------------------------------------------------ ① 물시계
tidy('k_clock', {
  offer: [K('밤에도 시간을 알 수 있다면 얼마나 좋겠나! 해시계는 해가 져 버리면 그만이거든.'), K('항아리 바닥에 작은 구멍을 내고 물이 일정하게 새게 하면, 남은 물 높이로 시간을 잴 수 있지 않겠나?'), K('고운 진흙 세 덩이와 곧은 갈대 두 대를 구해 오게. 나머지는 둘이 함께 하세. 내 손이 떨려서 말이야.')],
  obj: stageObj('clock', [['진흙 3 · 갈대 2 구해 오기', () => (E('clock').s | 0) >= 1 || (Game.have('clay', 3) && Game.have('reed', 2))], ['네브세니와 항아리 빚기 (공방 왼쪽 탁자)', 1], ['바닥에 머리카락만 한 구멍 뚫기', 2], ['물을 붓고 한 시간 지켜보기', 3], ['갈대로 눈금 새기기', 4]]),
  loc: () => ((E('clock').s | 0) < 4 ? { x: CX + T1[0], z: CZ + T1[1] } : 'npc:kiin'),
  prog: () => ['진흙 셋, 갈대 둘! 나일 강가에 가면 다 있다네.', '구멍은 머리카락만 하게! 크면 물이 쏟아지고, 작으면 막히지.', '자, 이제 지켜보세. 시간을 재려면 시간을 들여야지. 하하!', '물 높이가 내려간 자리마다 눈금을 새기게.', '다 됐군!'][Math.min(4, E('clock').s | 0)],
  done: [K('(물시계를 들여다보며) 똑, 똑… 한 시간에 꼭 한 눈금. 자네가 새긴 눈금이 맞았어!', 'happy'), T('(펑! 옆 실험 그릇에서 연기가 솟아요)'), K('콜록! 그건 다른 실험이었고! …이 작은 것은 자네 몫일세. 밤에도 시간을 알려 주는 물시계지.')] });
function clockShape() { if (!(Game.have('clay', 3) && Game.have('reed', 2))) { toast('진흙 3 · 갈대 2가 필요해요'); return; } Game.take('clay', 3); Game.take('reed', 2);
  mg('rhythm', { title: '항아리 빚기', hint: '네브세니가 물레를 돌려요. 박자에 맞춰 진흙 벽을 손으로 끌어올려요.', need: 6, beats: 10, btn: '끌어올리기' }, () => { E('clock').s = 1; G.UI.quest(); say([K('훌륭해! 이제 바닥에 구멍을. 숨을 참고, 손을 떨지 말게.')]); }); }
function clockHole() { mg('balance', { title: '머리카락만 한 구멍', hint: '구리 바늘 끝이 흔들리지 않게 ◀ ▶ 로 바로잡으며 천천히 뚫어요.', dur: 10 }, () => { E('clock').s = 2; sfx('click', { pitch: 1.6 }); G.UI.quest(); toast('구멍이 났어요 · 물을 붓고 지켜봐요'); }); }
function clockWait() { say([K('물을 가득 붓고… 이 등잔 곁에 앉게. 한 시간이 얼마나 긴지 자네도 알게 될 거야.'), T('물이 똑, 똑 떨어져요 · 곁에 앉아 지켜봐요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('clock', W2(T1), 3.4, 9, Math.min(22, hour() + 1.2), () => { E('clock').s = 3; G.UI.quest(); say([K('보게, 물이 손가락 한 마디만큼 내려갔지? 그게 한 시간이야. 자, 눈금을 새기세!')]); })); }
function clockMark() { mg('count', { title: '눈금 새기기', hint: '갈대 끝으로 물 높이마다 한 줄씩 눈금을 새겨요.', need: 6, btn: '한 줄', onPress: () => sfx('click', { pitch: 1.2, vol: 0.4 }) }, () => { E('clock').s = 4; G.UI.quest(); toast('물시계가 완성됐어요 · 네브세니에게'); }); }

// ------------------------------------------------------------------ ② 빛나는 돌
tidy('k_crystal', {
  offer: [K('자네, 이 동굴 벽에서 푸르스름하게 빛나는 돌 봤나? 빛을 머금었다가 내놓는 돌이야.'), K('그 돌 셋을 반짝이게 간 구리에 박으면, 하늘 창으로 드는 햇빛을 이 공방까지 꺾어 올 수 있을 걸세.'), K('지하 샘 굴 둘레에 둘, 동쪽 맨 끝 막다른 굴에 하나. 박쥐한테 인사도 하고!')],
  obj: stageObj('cry', [['빛나는 돌 셋 캐 오기', () => (E('cry').s | 0) >= 1 || Game.have('crystal', 3)], ['공방 오른쪽 탁자에서 구리판 갈기', 1], ['거울 틀에 빛나는 돌 박기', 2], ['하늘 창 아래 한낮까지 기다리기', 3], ['빛을 공방으로 꺾기', 4]]),
  loc: () => { const k = E('cry').s | 0; return k <= 1 ? { x: CX + T2[0], z: CZ + T2[1] } : k === 2 ? { x: CX + T2[0], z: CZ + T2[1] } : k === 3 ? { x: CX + SKYP[0], z: CZ + SKYP[1] } : 'npc:kiin'; },
  prog: () => ['샘 굴 둘레에 둘, 막다른 굴에 하나! 횃불 꺼지지 않게.', '구리는 얼굴이 비칠 때까지 갈아야 해.', '돌은 테두리에 고르게, 셋이 삼각을 이루게.', '해가 머리 위에 와야 빛이 곧게 떨어진다네.', '거울을 들어 공방 쪽으로!', '됐네!'][Math.min(5, E('cry').s | 0)],
  done: [K('보게! 하늘 창의 햇빛이 거울을 타고 공방까지 들어왔어! 이제 등잔 기름을 아끼겠군. 하하하!', 'happy'), T('(펑! 이번엔 거울에서 눈부신 빛이 번쩍해요)'), K('이 작은 거울은 자네 거야. 무덤 속 그림 그리는 장인들도 이렇게 빛을 들여간다네.')] });
function cryPolish() { if (!Game.have('crystal', 3)) { toast('빛나는 돌 셋이 필요해요'); return; } Game.take('crystal', 3); mg('push', { title: '구리판 갈기', hint: '모래와 기름을 묻혀 꾹꾹 눌러 갈아요. 얼굴이 비칠 때까지.', btn: '갈기' }, () => { E('cry').s = 2; sfx('coin', { pitch: 1.3 }); G.UI.quest(); toast('얼굴이 비쳐요 · 이제 돌을 박아요'); }); }
function crySet() { mg('count', { title: '거울 틀에 돌 박기', hint: '빛나는 돌을 하나씩 테두리 홈에 끼우고 송진으로 붙여요.', need: 3, btn: '끼우기', onPress: () => sfx('click', { pitch: 1.5 }) }, () => { E('cry').s = 3; G.UI.quest(); say([K('이제 하늘 창 아래로! 해가 머리 위에 올 때까지 기다려야 하네.')]); }); }
function cryNoon() { const h = hour(); if (h >= 12 && h < 15) { E('cry').s = 4; G.UI.quest(); cryAim(); return; } say([T('거울을 무릎에 얹고 하늘 창 아래 앉아요. 빛 기둥이 바닥을 천천히 기어 와요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('cry', W2(SKYP), 3, 9, 12.2, () => { E('cry').s = 4; G.UI.quest(); cryAim(); })); }
function cryAim() { mg('balance', { title: '빛 꺾기', hint: '거울을 들어 하늘에서 떨어지는 빛을 공방 쪽으로 꺾어요. 빛이 흔들리지 않게 ◀ ▶ 로 바로잡아요.', dur: 10 }, () => { E('cry').s = 5; S().flags.kMirror = 1; sfx('insight'); G.UI.quest(); toast('빛줄기가 공방까지 닿았어요 · 네브세니에게'); }); }

// ------------------------------------------------------------------ ③ 하늘을 재는 막대
tidy('k_star', {
  obj: stageObj('star', [['통나무 1 · 실 2 구해 오기', () => (E('star').s | 0) >= 1 || (Game.have('wood', 1) && Game.have('thread', 2))], ['막대에 실과 추 달기 (공방 왼쪽 탁자)', 1], ['하늘 창 아래 밤까지 앉아 기다리기', 2], ['별 셋을 막대 줄에 맞추기', 3]]),
  loc: () => { const k = E('star').s | 0; return k === 0 ? { x: CX + T1[0], z: CZ + T1[1] } : k <= 2 ? { x: CX + SKYP[0], z: CZ + SKYP[1] } : 'npc:kiin'; },
  prog: () => ['통나무 하나, 실 두 타래!', '추가 곧게 늘어지면 그게 하늘의 「아래」라네.', '밤이 깊어야 별이 보이지. 앉아서 기다리게.', '막대 끝, 실, 별. 셋이 한 줄이 될 때 외치게!', '어떻던가?'][Math.min(4, E('star').s | 0)],
  done: [K('자네가 맞춘 세 별로 재면… 흠, 흠… 이 줄과 저 별이 만나고…'), T('(펑! 아무것도 안 했는데 왜 연기가 나는지는 아무도 몰라요)'), K('나왔다! 열두 밤 뒤 새벽에 소프데트가 뜬다! 그러면 곧 강물이 불어나겠지!', 'happy'), K('자네 덕분이야. 이 별 지도를 받게. 다들 나를 미친 늙은이라 했는데, 자네는 끝까지 들어 주었어.', 'tender')] });
function starMake() { if (!(Game.have('wood', 1) && Game.have('thread', 2))) { toast('통나무 1 · 실 2가 필요해요'); return; } Game.take('wood', 1); Game.take('thread', 2);
  mg('rhythm', { title: '메르케트 만들기', hint: '막대 끝에 홈을 파고, 박자에 맞춰 실을 감아 돌추를 매달아요.', need: 6, beats: 10, btn: '감기' }, () => { E('star').s = 1; sfx('craft'); G.UI.quest(); say([K('곧게 늘어지는군! 이제 하늘 창 아래로 가져가게. 밤이 깊을 때까지.')]); }); }
function starWait() { const h = hour(); const go = () => { E('star').s = 2; S().q.kStar = 1; sfx('insight'); G.UI.quest(); say([T('천장 구멍 너머로 별들이 하나둘 돋아나요. 동쪽 가장자리에 유난히 밝은 별 셋이 보여요.')]); };
  if (!(h >= 6 && h < 20)) { go(); return; } say([T('메르케트를 세워 두고 하늘 창 아래 앉아요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('star', W2(SKYP), 3, 10, 20.5, go)); }
function starAlign() { mg('count', { title: '별 맞추기', hint: '막대 끝 · 늘어진 실 · 별 하나가 한 줄로 설 때마다 「맞췄다!」', need: 3, btn: '맞췄다!', onPress: () => sfx('click', { pitch: 1.1 }) }, () => { E('star').s = 3; G.UI.quest(); toast('세 별을 재었어요 · 네브세니에게'); }); }

// ------------------------------------------------------------------ ④ 메리의 무릎과 석청 (k_more1)
QS.k_more1.title = '메리의 무릎과 석청';
tidy('k_more1', {
  offer: [K('자네 왔나! 꿀이 상처를 덧나지 않게 한다는 말이 있지. 정말 그런지 보고 싶네.'), K('입구의 메리 녀석이 염소 쫓다 무릎이 까졌다더군. 입구 위 바위 틈에 석청이 있어. 연기로 벌을 달래고 따 오게.')],
  obj: stageObj('honey', [['입구 위 바위 틈에서 석청 따기', 1], ['메리의 무릎을 씻고 꿀 바르기', 2], ['메리 곁에서 해 질 녘까지 염소 지키기', 3]]),
  loc: () => { const k = E('honey').s | 0; if (k === 0) return { x: HONEY[0], z: HONEY[1] }; if (k <= 2) return 'npc:cvBoy'; return 'npc:kiin'; },
  prog: () => ['연기를 피우면 벌이 순해진다네. 쏘이지 말고!', '먼저 깨끗한 물로 씻게. 흙이 들어간 채 꿀을 바르면 안 되네.', '하루 지켜봐야 알지. 덧나는지 아문는지.', '어떻던가? 덧났나?'][Math.min(3, E('honey').s | 0)],
  done: [K('부어오르지도 않고 고름도 없었다고? (손뼉을 치며) 꿀이 상처를 지켰군! 이걸 적어 두어야지.', 'happy'), T('(펑! …이번엔 꿀단지가 터졌어요)'), K('…꿀은 왜 터졌을까? 아무튼! 메리에게 꿀 한 숟갈 더 갖다주게.')],
  reward: { silver: 12, items: { herb: 2, honey: 1 }, xp: 22 } });
function honeyTake() { mg('push', { title: '연기로 벌 달래기', hint: '젖은 풀에 불을 붙여 연기를 바위 틈에 꾹꾹 불어넣어요. 벌이 잠잠해지면 석청을 떼어 내요.', btn: '불어넣기' }, () => { E('honey').s = 1; Game.give('honey', 1, true); sfx('pickup'); G.UI.quest(); toast('석청 한 덩이 · 입구의 메리에게'); }); }
function honeyKnee() { const n = Game.npc('cvBoy'); if (n) { n.talking = true; n.sit = true; }
  say([MR('으… 염소가 바위 쪽으로 뛰어서 쫓다가 넘어졌어요. 따가워요…', 'sad')], () => {
    const go = () => ask('무릎에 꿀을 바르기 전에 무엇부터?', ['물로 흙과 모래를 깨끗이 씻는다', ''], [['꿀을 바로 듬뿍 바른다', '흙이 들어간 채 덮어 버리면 안에서 덧나요. 먼저 씻어요.'], ['상처를 손으로 꾹 눌러 본다', '아파서 메리가 눈물을 글썽여요. 먼저 씻어요.']],
      () => say([T('물로 씻고 꿀을 얇게 펴 바른 뒤 깨끗한 베 조각으로 감아요.'), MR('…덜 따가워요. 할아버지 실험이 저한테 쓰이는 거예요? 헤헤.', 'happy')], () => { if (n) n.talking = false; E('honey').s = 2; G.UI.quest(); }), () => go()); go(); }); }
function honeyWait() { const n = Game.npc('cvBoy'); if (n) n.sit = true; say([MR('염소들이 또 바위로 가면 안 되는데… 같이 지켜 줄 거예요?'), T('메리 곁에 앉아 염소를 지켜요 · 자리를 뜨면 기다림이 멈춰요')],
  () => waitAt('honey', BOY(), 3.6, 10, 18.2, () => { E('honey').s = 3; G.UI.quest(); say([MR('(베를 살짝 들춰 보며) 안 부었어요! 오히려 딱지가 앉았어요!', 'happy'), T('동굴 안 네브세니에게 알려요')]); })); }

// ------------------------------------------------------------------ ⑤ 막다른 굴의 등잔 (k_more2)
QS.k_more2.title = '막다른 굴의 등잔';
tidy('k_more2', {
  offer: [K('기름을 물에 띄우면 왜 위로 갈까? 그걸로 등잔을 만들면 물이 불을 지켜 주지 않을까?'), K('올리브기름 한 병을 구해 오게. 그리고 동쪽 막다른 굴, 늘 캄캄한 그곳에 첫 등잔을 놓아 보세.')],
  obj: stageObj('lamp', [['올리브기름 구해 오기', () => (E('lamp').s | 0) >= 1 || Game.have('oil', 1)], ['지하 샘에서 물 한 그릇 떠 오기', 1], ['공방에서 물에 기름 띄워 심지 얹기', 2], ['동쪽 막다른 굴에 등잔 놓기', 3], ['등잔이 타는 동안 곁에서 지켜보기', 4]]),
  loc: () => { const k = E('lamp').s | 0; return k === 0 ? { x: CX + POOLP[0], z: CZ + POOLP[1] } : k === 1 ? { x: CX + T1[0], z: CZ + T1[1] } : k <= 3 ? { x: CX + DEAD[0], z: CZ + DEAD[1] } : 'npc:kiin'; },
  prog: () => ['샘물은 차고 맑지. 흘리지 말게.', '기름은 물 위에 뜬다네. 거기 심지를 띄우는 거야.', '그 굴은 늘 캄캄했지. 이제 아니겠군.', '불이 오래 가는지 봐야지.', '어떻던가?'][Math.min(4, E('lamp').s | 0)],
  done: [K('두 시간을 타고도 기름이 반이나 남았다고? 물이 불을 식혀 주는 게로군! 하하!', 'happy'), T('(펑! …등잔은 멀쩡해요. 펑 소리는 공방 쪽에서 났어요)'), K('콜록. 그 굴의 불은 꺼뜨리지 않겠네. 길 잃은 사람이 보고 찾아오게.')],
  reward: { silver: 12, items: { bread: 2, oil: 1 }, xp: 22 } });
function lampWater() { mg('balance', { title: '샘물 떠 오기', hint: '찰랑이는 물그릇을 두 손에 들고 공방까지. 기울면 ◀ ▶ 로 바로잡아요.', dur: 10 }, () => { E('lamp').s = 1; sfx('splash', { vol: 0.4 }); G.UI.quest(); toast('물을 떠 왔어요 · 공방 왼쪽 탁자로'); }); }
function lampMake() { if (!Game.have('oil', 1)) { toast('올리브기름이 필요해요'); return; } Game.take('oil', 1); mg('rhythm', { title: '등잔 만들기', hint: '물 위에 기름을 한 방울씩 박자에 맞춰 떨어뜨리고, 아마 심지를 띄워요.', need: 6, beats: 10, btn: '한 방울' }, () => { E('lamp').s = 2; G.UI.quest(); say([K('기름이 물 위에 떴군! 자, 이제 막다른 굴로.')]); }); }
function lampPut() { E('lamp').s = 3; sfx('fire', { vol: 0.5 }); G.UI.quest(); say([T('등잔을 바위 턱에 놓고 횃불로 심지에 불을 옮겨요. 늘 캄캄하던 굴 끝이 노랗게 밝아져요.')]); }
function lampWait() { say([T('등잔 곁에 앉아 불이 얼마나 가는지 지켜봐요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('lamp', W2(DEAD), 2.8, 9, Math.min(23, hour() + 2), () => { E('lamp').s = 4; G.UI.quest(); toast('두 시간을 탔는데도 기름이 반이나 남았어요 · 네브세니에게'); })); }

// ------------------------------------------------------------------ ⑥ 갈대 새 (k_more3)
QS.k_more3.title = '갈대 새';
tidy('k_more3', {
  offer: [K('갈대를 엮어 하늘을 나는 새를 만들어 볼 생각이야! …웃지 말게. 갈대 네 대만 구해 오게.'), K('하늘 창으로 바람이 내려오는 때가 있다네. 그때 띄워 보세.')],
  obj: stageObj('bird', [['곧은 갈대 4 구해 오기', () => (E('bird').s | 0) >= 1 || Game.have('reed', 4)], ['공방에서 갈대 엮어 새 만들기', 1], ['하늘 창 아래에서 바람 기다리기', 2], ['갈대 새 띄우기', 3]]),
  loc: () => { const k = E('bird').s | 0; return k === 0 ? { x: CX + T1[0], z: CZ + T1[1] } : k <= 2 ? { x: CX + SKYP[0], z: CZ + SKYP[1] } : 'npc:kiin'; },
  prog: () => ['갈대 넷! 곧고 가벼운 걸로!', '날개는 양쪽이 같아야 해.', '바람은 사람을 기다려 주지 않지. 우리가 기다려야지.', '자, 높이 들어!', '어떻던가?'][Math.min(4, E('bird').s | 0)],
  done: [K('(떨어진 갈대 새를 주워 들며) 세 걸음은 날았지? 세 걸음! 처음엔 다 그런 거야!', 'happy'), K('이건 공방 벽에 걸어 두겠네. 언젠가 누가 이걸 보고 더 멀리 날리겠지.')],
  reward: { silver: 10, xp: 18 } });
function birdWeave() { if (!Game.have('reed', 4)) { toast('갈대 4가 필요해요'); return; } Game.take('reed', 4); mg('count', { title: '갈대 새 엮기', hint: '갈대를 쪼개 뼈대를 세우고, 마디마다 아마실로 한 번씩 동여요.', need: 6, btn: '동이기', onPress: () => sfx('rustle', { vol: 0.4 }) }, () => { E('bird').s = 1; G.UI.quest(); toast('갈대 새가 됐어요 · 하늘 창 아래로'); }); }
function birdWait() { say([K('바람이 내려올 때를 기다리세. 하늘 창 가장자리 먼지가 일면 그때야.'), T('갈대 새를 안고 하늘 창 아래 앉아요 · 자리를 뜨면 기다림이 멈춰요')], () => waitAt('bird', W2(SKYP), 3, 8, Math.min(22, hour() + 1.5), () => { E('bird').s = 2; sfx('whoosh', { vol: 0.5 }); G.UI.quest(); toast('하늘 창으로 바람이 내려와요! · 지금이에요'); })); }
function birdFly() { mg('balance', { title: '갈대 새 띄우기', hint: '머리 위로 들어 바람을 태워요. 기울면 ◀ ▶ 로 바로잡아요.', dur: 9 }, () => { E('bird').s = 3; G.UI.quest(); say([T('갈대 새가 바람을 타고 휘익 떠올라 세 걸음쯤 날더니, 빙그르르 돌아 바닥에 내려앉아요.'), K('날았다! 날았어! 보았나?', 'happy')]); }); }

// ------------------------------------------------------------------ 행동 단추
Game.CTX.push(function (s) { const p = P(); if (!s || p.ride || p.act || Game.cineOn || G.UI.busy()) return null; const out = [], ins = inCave();
  const at = (pt, r, label, key, use, rel) => { const q = rel ? W2(pt) : pt; const d = Math.hypot(q[0] - p.x, q[1] - p.z); if (d < r) out.push(Object.assign({ d: Math.min(d - 1, 0.4), x: q[0], z: q[1], label, key, story: true, noMagnet: true, use }, rel ? { yAbs: CY + 1.2 } : { y: 1 })); };
  if (ins) {
    if (on('k_clock')) { const k = E('clock').s | 0; if (k === 0) at(T1, 2.4, '항아리 빚기', 'vqC0', clockShape, 1); if (k === 1) at(T1, 2.4, '구멍 뚫기', 'vqC1', clockHole, 1); if (k === 2 && !waiting('clock')) at(T1, 2.6, '물 붓고 지켜보기', 'vqC2', clockWait, 1); if (k === 3) at(T1, 2.4, '눈금 새기기', 'vqC3', clockMark, 1); }
    if (on('k_crystal')) { const k = E('cry').s | 0; if (k <= 1) at(T2, 2.4, '구리판 갈기', 'vqR0', cryPolish, 1); if (k === 2) at(T2, 2.4, '거울 틀에 돌 박기', 'vqR1', crySet, 1); if (k === 3 && !waiting('cry')) at(SKYP, 2.4, '하늘 창 아래 앉아 한낮 기다리기', 'vqR2', cryNoon, 1); if (k === 4) at(SKYP, 2.4, '빛 꺾기', 'vqR3', cryAim, 1); }
    if (on('k_star')) { const k = E('star').s | 0; if (k === 0) at(T1, 2.4, '메르케트 만들기', 'vqS0', starMake, 1); if (k === 1 && !waiting('star')) at(SKYP, 2.4, '하늘 창 아래 밤까지 기다리기', 'vqS1', starWait, 1); if (k === 2) at(SKYP, 2.4, '별 셋 맞추기', 'vqS2', starAlign, 1); }
    if (on('k_more2')) { const k = E('lamp').s | 0; if (k === 0 && Game.have('oil', 1)) at(POOLP, 2.4, '샘물 한 그릇 뜨기', 'vqL0', lampWater, 1); if (k === 1) at(T1, 2.4, '물에 기름 띄워 등잔 만들기', 'vqL1', lampMake, 1); if (k === 2) at(DEAD, 2.4, '막다른 굴에 등잔 놓기', 'vqL2', lampPut, 1); if (k === 3 && !waiting('lamp')) at(DEAD, 2.6, '등잔 곁에서 지켜보기', 'vqL3', lampWait, 1); }
    if (on('k_more3')) { const k = E('bird').s | 0; if (k === 0) at(T1, 2.4, '갈대 새 엮기', 'vqB0', birdWeave, 1); if (k === 1 && !waiting('bird')) at(SKYP, 2.4, '바람 기다리기', 'vqB1', birdWait, 1); if (k === 2) at(SKYP, 2.4, '갈대 새 띄우기', 'vqB2', birdFly, 1); }
  } else if (on('k_more1')) { const k = E('honey').s | 0; if (k === 0) at(HONEY, 3, '연기로 벌 달래고 석청 따기', 'vqH0', honeyTake); const b = BOY(); if (k === 1) at(b, 2.8, '메리의 무릎 돌봐 주기', 'vqH1', honeyKnee); if (k === 2 && !waiting('honey')) at(b, 3, '메리 곁에서 염소 지키기', 'vqH2', honeyWait); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ 기다림
const up0 = EP.update; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; s = s && s.flags ? s : S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60, p = P();
  try { if (WT && !G.UI.busy() && !(G.Cine && G.Cine.on)) { const dd = Math.hypot(p.x - WT.at[0], p.z - WT.at[1]);
      if (dd < WT.r) { WT.left -= d; s.time = Math.min(29.6, s.time + d * WT.rate); if (WT.note && dd < WT.r * 0.6 && !p.cpose) { WT.note = 0; sitP(true); } if (WT.left <= 0) { const w = WT; WT = null; sitP(false); s.time = Game.clockTo(s, w.endH); const n = Game.npc('cvBoy'); if (n && w.key === 'honey') n.sit = false; w.done(); } }
      else if (!WT.note) { WT.note = 1; sitP(false); toast('자리를 뜨면 기다림이 멈춰요 · 돌아와 앉으면 이어져요'); } } } catch (e) { console.error('caveq', e); }
  return r; };

// ------------------------------------------------------------------ 흔적 (동굴 안에서만)
const MS = {}, MP = []; let mk = 0;
const mkM = (seed, fn) => { const g = new G.GB(seed); fn(g); return G.R.mesh(g); };
function meshes() {
  MS.clock = mkM(961, g => { g.lathe([[0.1, 0], [0.2, 0.08], [0.22, 0.4], [0.18, 0.5]], 12, { c: 0xb8764a }); for (let i = 0; i < 6; i++) g.box(0.012, 0.01, 0.05, { at: [0.215, 0.1 + i * 0.05, 0], c: 0x3a2a1a }); g.cyl(0.14, 0.14, 0.04, 10, { at: [0, 0.02, 0.38], c: 0x8a5a38 }); g.cyl(0.006, 0.006, 0.2, 4, { at: [0, -0.05, 0.38], c: 0x6ab0e0 }); });
  MS.beam = mkM(962, g => g.cyl(0.22, 0.32, 1, 8, { at: [0, 0.5, 0], c: 0xfff4c8 }));
  MS.merk = mkM(963, g => { g.cyl(0.03, 0.035, 1.6, 6, { at: [0, 0.8, 0], c: 0x7a5a38 }); g.cyl(0.004, 0.004, 0.7, 3, { at: [0.06, 1.25, 0], c: 0xf0f0f0 }); g.sph(0.05, 6, 5, { at: [0.06, 0.9, 0], c: 0x5a5a5a }); g.cyl(0.18, 0.22, 0.08, 8, { at: [0, 0.04, 0], c: 0x6a5a48 }); });
  MS.lamp = mkM(964, g => { g.lathe([[0.04, 0], [0.16, 0.04], [0.18, 0.12]], 10, { c: 0xb87a4a }); g.cyl(0.15, 0.15, 0.01, 10, { at: [0, 0.1, 0], c: 0x2a4a6a }); });
  MS.flame = mkM(965, g => { g.sph(0.07, 6, 5, { at: [0, 0.18, 0], s: [0.8, 1.6, 0.8], c: 0xffc060 }); });
  MS.bird = mkM(966, g => { g.box(0.06, 0.06, 0.8, { at: [0, 0, 0], c: 0xc8b070 }); g.box(1.4, 0.02, 0.28, { at: [0, 0.02, -0.05], c: 0xd8c080 }); g.box(0.5, 0.02, 0.16, { at: [0, 0.02, 0.36], c: 0xd8c080 }); g.cyl(0.004, 0.004, 1.2, 3, { at: [0, 0.6, 0], c: 0xe0d8c0 }); });
  MS.ok = 1; }
const putM = (list, mesh, x, y, z, ry, sx, sy, sz, emis) => { const m = MP[mk] || (MP[mk] = G.m4()); mk++; G.m4trs(m, x, y, z, ry || 0, 0, 0, sx || 1, sy || 1, sz || 1); list.push(Object.assign({ mesh, m, outline: !emis }, emis ? { emis } : {})); return m; };
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || Game.mode !== 'play' || !s.flags || !s.flags.vq || !inCave()) return; try { if (!MS.ok) meshes(); mk = 0; const vq = s.flags.vq, g = k => (vq[k] && vq[k].s) | 0, t = performance.now() / 1000;
    if (g('clock') >= 4 || s.flags.kClock) putM(list, MS.clock, CX - 6.2, CY + 0.9, CZ + 45.6, 0.3);
    if (g('cry') >= 5 || (s.flags.kMirror && g('cry') >= 5)) { const ax = CX + 10, az = CZ + 30.5, bx = CX - 1, bz = CZ + 45, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz, 3.4), m = MP[mk] || (MP[mk] = G.m4()); mk++;
      const yaw = Math.atan2(dx, dz), pitch = Math.atan2(Math.hypot(dx, dz), -3.4); G.m4trs(m, ax, CY + 4.6, az, yaw, pitch, 0, 1, L, 1); list.push({ mesh: MS.beam, m, emis: [0.5, 0.46, 0.32], tint: [0.4, 0.4, 0.4] }); }
    if (g('star') >= 3) putM(list, MS.merk, CX + 11.2, CY, CZ + 30.5, 0.4);
    if (g('lamp') >= 3) { putM(list, MS.lamp, CX + 21.6, CY + 0.55, CZ + 43.9, 0); const f = 1 + Math.sin(t * 9) * 0.12; putM(list, MS.flame, CX + 21.6, CY + 0.55, CZ + 43.9, 0, f, f * 1.15, f, [1.6, 0.85, 0.3]); }
    if (g('bird') >= 3 && !on('k_more3')) putM(list, MS.bird, CX - 4.5, CY + 3.0, CZ + 51.4, 0.5);
  } catch (e) { console.error('caveq dyn', e); } };
G.CaveQ = { E, WT: () => WT };
})(window.G);
