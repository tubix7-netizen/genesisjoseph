// =================================================================== v18.69 2장 다시 짜기 · 「보디발의 집」 (e_ch2.js · 설계표_2장_v18_69.md)
/* 아메니가 곁에서 함께 일하고, 여러 해가 흘러요(창 39:1–20).
   ① 낯선 집: 아메니 → 집 둘러보기(따라 걷기) → 종들의 저녁 · 첫 밤
   ② 종의 첫날: 아메니와 물 긷기(세 번 · 아메니의 물동이를 들어 드릴 수도) · 헤누의 맷돌 · 외양간 → 네브의 시험 → 저녁에 아메니의 이야기 → 둘째 밤
   ③ 날들이 쌓이다: 사흘의 일(마당 쓸기 · 자루 나르기 · 물 긷기) · 애굽 말 · 우물물이 맑아진다(39:2–3)
   ④ 아마밭(지금 그대로) → 아마 담그기 · 이틀 · 건져 널기 · 두드리기
   ⑤ 곳간과 장부(지금) + 애굽 숫자   ⑥ 잔치 준비(빵 · 포도주 · 연꽃) → 잔치(지금)   ⑦ 가정 총무(지금) + 아메니의 허리 · 약초
   ⑧ 세 철(범람 · 씨뿌림 · 거둠) · 요셉이 청년으로 자라요 → 복의 장면(지금 cinBless · 39:5–6)
   ⑨ 유혹(지금) · 사흘 동안 날마다 사람들 곁에서 일할 곳 고르기 · 밤 기도 → 그날(39:11 · 까닭은 넣지 않아요) → 도망(지금)
   ⑩ 누명(지금) → 아메니의 끄덕임 → 병사들을 따라 옥까지 걷기 → 「3장 · 왕의 옥」 */
Object.assign(WORDS, { iin: ['이 인 · 이리 와', '「이리 와!」 네브가 종을 부를 때 하는 말이에요.', 'star'], shema: ['셰마 · 가라', '「가라」. 일을 시킬 때 많이 들어요.', 'star'],
  seheb: ['세헤브 · 서둘러', '「서둘러!」 네브가 입에 달고 사는 말이에요.', 'star'], irp: ['이르프 · 포도주', '포도주. 잔치 때 손님들이 제일 많이 찾아요.', 'drop'], dab: ['데브 · 무화과', '무화과. 보디발 나리가 제일 좋아하는 과일이에요.', 'heart'] });
const C2 = S => S.q.c2 || (S.q.c2 = { tour: 0, pour: 0, dd: 0, sw: {}, sk: 0, fl: 0, se: 0, td: 0 });
/* the yard's east wall (x −6) has one side door at z ≈ 52: a walk from the yard to the fields and the cattle goes through it */
const route = (x0, z0, x, z) => (x0 < -6) === (x < -6) ? null : x0 < -6 ? [[-8.5, 52], [-3, 52]] : [[-3, 52], [-8.5, 52]];
const amWalk = (x, z, line) => { const G = Gm(), a = G.npc('ameni'); if (!a) return; a.sit = false; G.npcWalk('ameni', x, z, () => { const p = G.P; face('ameni', p.x, p.z); if (line) GG.Life.bubble('ameni', line, 3.6); }, 1.6, route(a.x, a.z, x, z)); };
/* sleep where he lies: the sky, then the real new day (so the bed by the straw works the same) */
const sleepHere = text => { const G = Gm(); if (GG.Sleep && GG.Sleep.sky) GG.Sleep.sky(text, () => G.sleep()); else G.sleep(); };
const BED = [-46.8, 50];
const C2SPOT = { sweep: [[-36, 50], [-33, 55.5], [-30, 51.5]], /* v18.80 three corners, not four */ sackA: [-27, 67.5], sackB: [-12, 62.5], brick: [1.5, 72.5], seed: [6, 50], plough: [9, 73], herb: [-25.5, 58.2], prayer: [-46.2, 51.2], rack: [3, 66] };
const TOUR = [[-45, 53, '여기가 종들의 숙소다. 짚자리 하나가 네 자리야.'], [-38, 61, '우물이다. 새벽마다 여기서 하루가 시작되지.'], [-10.4, 51.4, '부엌. 헤누가 화덕을 지킨다. 배고프면 헤누 눈치를 잘 봐라, 하하.', [[-24, 53]]], [8.2, 68.6, '외양간. 나리는 소를 몹시 아끼신다.'], [-18, 53.4, '연못과 정원. 정원지기가 연꽃을 키우지.', [[-3, 52], [-8.5, 52]]], [-10, 57.4, '저기가 곳간이다. 서기관 이피 영감이 장부를 쓰지.', [[-10, 54]]], [-28, 49, '저기 안채는… 우리 같은 종이 함부로 들어가는 곳이 아니다. 기억해라.', [[-10, 54], [-18, 52.6]]]]; /* round the pool (8 × 5 m) and the palms */

// ------------------------------------------------------------------ hands-on things (one menu entry per spot)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || p.ride) return null; const st = S.step; if (!/^c2_/.test(st)) return null; const c = C2(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c2_supper') { if (!c.ate) at(-44, 52, 3.4, { label: '보리빵과 양파 받아 먹기', key: 'c2Eat', use: () => { c.ate = 1; p.emote = { k: 'eat', t: 0, dur: 2 }; G.sfx('eat'); GG.UI.quest(); say([T('종들이 둘러앉아 보리빵과 양파를 나눠 먹었습니다. 요셉에게도 한 조각이 돌아왔어요.'), T('숙소 짚자리에서 자요.')]); } });
    if (c.ate) at(BED[0], BED[1], 2.6, { label: '숙소 짚자리에서 자기', key: 'c2Sleep1', use: () => sleepHere('요셉은 짚자리에 누워 낯선 하늘의 별을 바라보았습니다. 고향의 별과 같은 별이었습니다.') }); }
  if (st === 'c2_work' && c.pour >= 1 && !c.amJar && !S.q.w1) { const a = G.npc('ameni'); if (a) at(a.x, a.z, 2.4, { label: '아메니의 물동이 대신 들어 드리기', key: 'c2AmJar', use: () => { c.amJar = 1; S.water = Math.min(S.jarMax || 12, (S.water || 0) + 4); G.UI.hud(); GG.Bond && GG.Bond.add && GG.Bond.add('ameni', 6, '물동이'); GG.UI.quest(); say([N('ameni', '어허, 늙은이 허리를 알아주는구나. …고맙다, 얘야.', '', 'tender')]); } }); }
  if (st === 'c2_days') daysCtx(S, c, at);
  if (st === 'c2_flax2') { const cx = SPOTS.canal[0], cz = SPOTS.canal[1];
    if (c.fl === 0) at(cx, cz, 3.2, { label: '아마 다발 운하 물에 담그기', key: 'c2Soak', use: () => { c.fl = 1; p.emote = { k: 'gather', t: 0, dur: 1.6 }; G.sfx('splash'); GG.UI.quest(); say([N('gardener', '이렇게 돌로 눌러 두면 이틀 뒤에 껍질이 물러지지.'), N('ameni', '세마포 한 필이 되려면 이 고생을 다 해야 한단다.')], () => { fade(() => { S.day += 2; S.time = 9; }, () => { c.fl = 2; GG.UI.quest(); GG.UI.toast('이틀이 지났어요'); }); }); } });
    if (c.fl === 2) at(cx, cz, 3.2, { label: '아마 건져 볕에 널기', key: 'c2Dry', use: () => { c.fl = 3; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); say([T('물러진 아마 다발을 건져 밭둑에 길게 널었습니다. 뜨거운 해가 금세 말려 주었어요.'), N('ameni', '다 마르면 저기 두드리는 판에서 두드리자.')]); } });
    if (c.fl === 3) at(C2SPOT.rack[0], C2SPOT.rack[1], 3.4, { label: '방망이로 아마 두드리기', key: 'c2Beat', use: () => GG.UI.minigame('rhythm', { title: '아마 두드리기', hint: '동그라미가 금에 닿을 때 내리쳐요. 껍질이 떨어지고 고운 섬유만 남아요.', need: 7 }, ok => { if (!ok) { GG.UI.toast('섬유가 엉켰어요 · 다시 두드려요'); return; } c.fl = 4; G.sfx('thud'); GG.UI.quest(); say([T('하얗고 고운 섬유가 나왔습니다. 길쌈하는 여인들이 와서 실을 자았어요.'), N('ameni', '이게 나리가 입으실 세마포가 될 거다. 네 손을 거쳐서 말이야.', '', 'tender')], () => G.checkStep()); }) }); }
  if (st === 'c2_banquet' && !S.q.prepDone) { const pr = c.prep || (c.prep = {});
    if (!pr.bread) at(-10.6, 43.6, 2.6, { label: '헤누와 잔치 빵 굽기', key: 'c2Bread', use: () => GG.UI.minigame('rhythm', { title: '빵 굽기', hint: '동그라미가 금에 닿을 때 반죽을 화덕 벽에서 떼어 내요.', need: 5 }, ok => { if (!ok) { GG.UI.toast('빵이 조금 탔어요 · 다시 구워요'); return; } pr.bread = 1; G.sfx('eat'); GG.UI.quest(); prepDone(S); }) });
    if (!pr.wine) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '포도주 단지 대청으로 나르기', key: 'c2Wine', use: () => GG.UI.minigame('balance', { title: '포도주 단지 나르기', hint: '넘치지 않게 가운데를 맞춰요.', dur: 7 }, ok => { if (!ok) { GG.UI.toast('조금 흘렸어요 · 다시 들어요'); return; } pr.wine = 1; GG.UI.quest(); prepDone(S); }) });
    if (!pr.lotus) at(SPOTS.pool[0], SPOTS.pool[1], 3.4, { label: '연못에서 연꽃 꺾어 상에 꽂기', key: 'c2Lotus', use: () => { pr.lotus = 1; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); prepDone(S); } }); }
  if (st === 'c2_manage' && S.q.amHurt && !c.herb) at(C2SPOT.herb[0], C2SPOT.herb[1], 3, { label: '정원에서 약초 캐기', key: 'c2Herb', use: () => { c.herb = 1; p.emote = { k: 'pick', t: 0, dur: 1.2 }; GG.UI.quest(); say([N('gardener', '허리 아픈 데는 이 풀을 짓찧어 붙이는 게 최고지요. 아메니 영감께 갖다 드리세요.')]); } });
  if (st === 'c2_seasons') seasonCtx(S, c, at);
  if (st === 'c2_tempt2' && c.td >= 3 && !c.prayN) at(C2SPOT.prayer[0], C2SPOT.prayer[1], 2.6, { label: '숙소에서 무릎 꿇고 기도하기', key: 'c2Pray', use: () => { c.prayN = 1; p.emote = { k: 'pray', t: 0, dur: 4 }; GG.UI.quest(); say([T('요셉은 무릎을 꿇었습니다. 「내가 어찌 이 큰 악을 행하여 하나님께 득죄하리이까」', '창세기 39:9')], () => G.checkStep()); } });
  return out.length ? out : null; });
function prepDone(S) { const pr = C2(S).prep; if (pr.bread && pr.wine && pr.lotus && !S.q.prepDone) { S.q.prepDone = 1; say([N('cook', '다 됐다! 손님들이 오신다!', '', 'happy')], () => banquetStart(S, Gm(), false)); } }

/* ③ three days of work */
const DAYS = [['마당 쓸기', '숙소 앞마당 네 곳을 쓸어요', ['iin', 'shema']], ['자루 나르기', '대문 앞 곡식 자루를 곳간으로 두 번 날라요', ['seheb', 'irp']], ['빵 굽기', '부엌 화덕에서 요리사 헤누를 도와 종들이 먹을 빵을 구워요 (물 긷기는 첫날에 했어요)', ['ta', 'dab']]]; /* v18.80 not the first day's water again */
const DAYN = ['셋째', '넷째', '다섯째'];
function daysCtx(S, c, at) { const G = Gm(), p = G.P, d = c.dd;
  if (c.dayDone) { at(BED[0], BED[1], 2.6, { label: '숙소 짚자리에서 자기', key: 'c2DSleep', use: () => sleepHere('하루가 저물었습니다. 숙소 지붕 틈으로 별이 보였어요.') }); return; }
  if (d === 0) C2SPOT.sweep.forEach(([x, z], i) => { if (!c.sw[i]) at(x, z, 2, { label: `빗자루로 마당 쓸기 (${Object.keys(c.sw).length}/3)`, key: 'c2Sw' + i, use: () => { c.sw[i] = 1; p.emote = { k: 'gather', t: 0, dur: 1.4 }; G.sfx('rustle'); GG.UI.quest(); if (Object.keys(c.sw).length >= 3) dayEnd(S); } }); });
  if (d === 1) { if (!c.carry && c.sk < 2) at(C2SPOT.sackA[0], C2SPOT.sackA[1], 2.6, { label: `곡식 자루 지기 (${c.sk}/2)`, key: 'c2SackA', use: () => { c.carry = 1; p.emote = { k: 'pick', t: 0, dur: 0.9 }; GG.UI.quest(); GG.UI.toast('자루를 졌어요 · 곳간으로'); } });
    if (c.carry) at(C2SPOT.sackB[0], C2SPOT.sackB[1], 2.6, { label: '곳간에 자루 내려놓기', key: 'c2SackB', use: () => { c.carry = 0; c.sk++; G.sfx('thud', { vol: 0.5 }); GG.UI.quest(); if (c.sk >= 2) dayEnd(S); } }); }
  if (d === 2 && !c.baked) at(-10.6, 43.6, 2.6, { label: '헤누와 화덕에서 빵 굽기', key: 'c2DBake', use: () => GG.UI.minigame('rhythm', { title: '빵 굽기', hint: '동그라미가 금에 닿을 때 반죽을 화덕 벽에 철썩 붙였다가 떼어 내요.', need: 5 }, ok => { if (!ok) { GG.UI.toast('빵이 조금 탔어요 · 다시 구워요'); return; } c.baked = 1; G.sfx('eat'); GG.Life.bubble('cook', '오, 제법인데! 종들 저녁이 푸짐하겠다.', 3); GG.UI.quest(); dayEnd(S); }) }); } /* v18.80 bread, not water again */
function dayStart(S) { const c = C2(S), D = DAYS[c.dd]; if (!D) return; c.sw = {}; c.sk = 0; c.carry = 0; c.pour = 0; c.baked = 0;
  narr([{ kick: '보디발의 집 · 날들이 쌓이다', title: `${DAYN[c.dd]} 날 · ${D[0]}`, t: D[1] + '. 아메니가 곁에서 함께해요.', ref: '' }], () => {
    if (c.dd === 0) amWalk(-34.5, 53, '쓸 때는 바람 부는 쪽에서부터 쓸어라.'); if (c.dd === 1) amWalk(-25.5, 66, '무릎으로 들어라. 허리로 들면 나처럼 된다, 하하.'); if (c.dd === 2) amWalk(-12.2, 45.4, '빵은 화덕 벽에 붙여 굽는단다. 손 데지 마라.'); }); }
function dayEnd(S) { const c = C2(S), D = DAYS[c.dd]; D[2].forEach(k => learn(k)); c.dayDone = 1; c.dayAt = S.day; S.time = Math.max(S.time, 18.6); GG.UI.quest();
  const L = [[N('ameni', '말도 두 개 배워 두자. 「이 인」은 이리 오라, 「셰마」는 가라는 말이다. 네브가 부르면 빨리 대답해야 한다.')], [N('ameni', '「세헤브」는 서둘러라. 네브가 입에 달고 사는 말이지. 「이르프」는 포도주란다. 잔치 때 꼭 듣게 될 게다.')],
    [N('ameni', '「타」는 빵, 「데브」는 무화과. 헤누가 빵 사이에 무화과를 넣어 주었구나.'), N('ameni', '…그나저나 이상하구나. 네가 구운 빵은 한 번도 타지 않는구나. 헤누가 눈이 휘둥그레졌다.', '', 'awe'), T('여호와께서 요셉과 함께하시므로 그가 형통한 자가 되어 그 주인 애굽 사람의 집에 있으니', '창세기 39:2'), N('ameni', '이제 나보다 빠르구나. 늙은이는 구경이나 해야겠다.', '', 'laugh')]][c.dd];
  say(L.concat([T('해가 졌어요. 숙소 짚자리에서 자요.')])); }
function daysTick(S, c) { if (!c.dayDone || S.day <= (c.dayAt || 0) || GG.UI.busy() || GG.Cine.on) return; c.dd++; c.dayDone = 0; GG.UI.quest(); if (c.dd >= 3) Gm().checkStep(); else setTimeout(() => dayStart(S), 900); }

/* ⑧ the three seasons (years go by) */
const SEAS = [['아케트 · 범람의 철', '한 해가 지나', '나일 강물이 넘쳐 밭이 물에 잠겼습니다. 무너진 담을 흙벽돌로 고치고, 곡식을 높은 선반으로 옮겨요.'], ['페레트 · 씨뿌림의 철', '또 해가 바뀌어', '물이 빠진 검은 땅에 씨를 뿌리는 철입니다. 일꾼들에게 씨앗을 나누고, 소에 쟁기를 매요.'], ['셰무 · 거둠의 철', '여러 해가 흘러', '곡식이 누렇게 익었습니다. 거둔 곡식을 세어 장부에 적어요.']];
function seasonCtx(S, c, at) { const G = Gm(), p = G.P, se = c.se, t = c.st || (c.st = {});
  if (se === 0) { if (!t.brick) at(C2SPOT.brick[0], C2SPOT.brick[1], 3, { label: '일꾼들과 흙벽돌 찍기', key: 'c2Brick', use: () => GG.UI.minigame('count', { title: '흙벽돌 찍기', hint: '진흙을 틀에 꾹꾹 눌러 담아요.', need: 6, btn: '꾹!', onPress: () => G.sfx('thud', { pitch: 1.3, vol: 0.4 }) }, ok => { if (!ok) return; t.brick = 1; GG.UI.quest(); seasonCheck(S); }) });
    if (!t.lift) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '곡식 자루 높은 선반으로 옮기기', key: 'c2Lift', use: () => { t.lift = 1; p.emote = { k: 'pick', t: 0, dur: 1.4 }; GG.UI.quest(); seasonCheck(S); } }); }
  if (se === 1) { if (!t.seed) at(C2SPOT.seed[0], C2SPOT.seed[1], 3.4, { label: '일꾼들에게 씨앗 자루 나눠 주기', key: 'c2Seed', use: () => { t.seed = 1; p.emote = { k: 'present', t: 0, dur: 1.4 }; GG.UI.quest(); say([N('gardener', '총무님이 나눠 주시는 씨앗은 싹이 잘 나요. 다들 그렇게 말해요.', '', 'happy')], () => seasonCheck(S)); } });
    if (!t.plough) at(C2SPOT.plough[0], C2SPOT.plough[1], 3, { label: '소에 쟁기 매기', key: 'c2Plough', use: () => GG.UI.minigame('push', { title: '멍에 매기', hint: '꾹 눌러 끈을 당겨요. 소가 놀라지 않게 천천히.', btn: '당기기' }, ok => { if (!ok) return; t.plough = 1; G.sfx('moo'); GG.UI.quest(); seasonCheck(S); }) }); }
  if (se === 2 && !t.count) at(SPOTS.store[0], SPOTS.store[1], 3, { label: '거둔 곡식 세어 장부에 적기', key: 'c2Count', use: () => { t.count = 1; p.emote = { k: 'gather', t: 0, dur: 1.6 }; GG.UI.quest(); say([N('scribe', '…한 번에 딱 맞는구먼! 자네가 쓴 장부는 고칠 데가 없어.', '', 'happy')], () => seasonCheck(S)); } }); }
function seasonStart(S) { const c = C2(S), Q = SEAS[c.se]; c.st = {}; GG.UI.quest(); narr([{ kick: `보디발의 집 · ${Q[1]}`, title: Q[0], t: Q[2], ref: '' }]); }
function seasonCheck(S) { const c = C2(S), t = c.st, done = c.se === 0 ? t.brick && t.lift : c.se === 1 ? t.seed && t.plough : !!t.count; if (!done) return;
  const B = [[N('neb', '이웃 집들은 물에 담이 무너졌다는데, 우리 집은 멀쩡하구려. …총무 덕이오.', '', 'tender'), T('그 주인이 여호와께서 그와 함께하심을 보며, 또 여호와께서 그의 범사에 형통하게 하심을 보았더라.', '창세기 39:3')],
    [N('ameni', '요셉아, 너 키가 나보다 커졌구나. 처음 왔을 땐 비쩍 마른 아이였는데.', '', 'tender')],
    [T('곳간마다 곡식이 가득 찼습니다.')]][c.se];
  say(B, () => { c.se++; GG.UI.quest(); if (c.se === 2) grow(S); if (c.se >= 3) Gm().checkStep(); else fade(() => { S.day += 120; S.time = 8; }, () => seasonStart(S)); }); }
/* Joseph grows into a young man (39:6): the steward's and the fleeing outfits fill out and the jaw firms */
const YOUNG = { build: 0.85, jaw: -0.25 }, GROWN = { build: 0.95, jaw: 0.02 };
function grow(S) { S.flags.grown = 1; lookAge(S); GG.UI.toast('요셉이 청년이 되었어요'); }
function lookAge(S) { const w = S.flags && S.flags.grown ? GROWN : YOUNG; let ch = false; for (const k of ['josephSteward', 'josephFled']) { const L = LOOK[k]; if (L && (L.build !== w.build || L.jaw !== w.jaw)) { L.build = w.build; L.jaw = w.jaw; ch = true; } } if (ch && /^joseph(Steward|Fled)$/.test(S.outfit || '')) Gm().refreshLook(); }

/* v18.72 the things the chores need, where the chores are done */
function ch2Build(W, P) { try {
  P('sacks', C2SPOT.sackA[0] + 0.6, C2SPOT.sackA[1] + 0.5, { ry: 0.4 }); P('sacks', C2SPOT.sackA[0] - 0.7, C2SPOT.sackA[1] + 0.8, { ry: 1.6 }); /* the grain sacks at the gate */
  P('sacks', C2SPOT.seed[0] + 0.8, C2SPOT.seed[1] + 0.4, { ry: 0.8 }); P('baskets', C2SPOT.seed[0] - 0.8, C2SPOT.seed[1] - 0.4, { args: [2] }); /* the seed sacks */
  P('hangRack', C2SPOT.rack[0] + 1.4, C2SPOT.rack[1] + 0.6, { ry: 0.3 }); P('stool', C2SPOT.rack[0], C2SPOT.rack[1] - 0.4); P('baskets', C2SPOT.rack[0] + 0.6, C2SPOT.rack[1] - 1.2, { args: [1] }); P('woodStack', C2SPOT.rack[0] - 1.4, C2SPOT.rack[1] + 0.4, { ry: 0.9 }); /* flax drying and the beating board */
  P('bales', C2SPOT.brick[0] + 1.6, C2SPOT.brick[1] - 0.6, { ry: 0.5 }); P('woodStack', C2SPOT.brick[0] - 0.4, C2SPOT.brick[1] + 0.9, { ry: 0.2 }); P('pots', C2SPOT.brick[0] - 1.6, C2SPOT.brick[1] - 0.4, { ry: 0.3 }); /* mud, straw and the brick moulds */
  for (const [dx, dz] of [[0, 0], [1.2, 0.6], [-1.1, 0.7], [0.4, -1]]) P('herbBush', C2SPOT.herb[0] + dx, C2SPOT.herb[1] + dz, { s: 0.8, keep: 1 }); /* the herb bed in the garden */
} catch (e) { console.error('ch2Build', e); } }
// ------------------------------------------------------------------ the new steps
const CH2 = {
  c2_tour: { ch: 3, obj: S => C2(S).tour < TOUR.length ? '아메니를 따라 집 둘러보기' : '집을 다 둘러보았어요', target: 'npc:ameni', need: ['ameni'],
    list: S => [{ t: `집 둘러보기 (${Math.min(TOUR.length, C2(S).tour)}/${TOUR.length})`, ok: C2(S).tour >= TOUR.length }],
    enter(S, G, re) { const c = C2(S); if (!re) c.tour = 0; c.arrived = -1; c.twait = 0; },
    check: S => C2(S).tour >= TOUR.length, done(S, G, next) { say([N('ameni', '자, 이제 저녁 먹으러 가자. 종들의 저녁은 늦고 짧단다.')], next); }, next: 'c2_supper' },
  c2_supper: { ch: 3, obj: S => C2(S).ate ? '숙소 짚자리에서 자기' : '숙소 앞에서 종들과 저녁 먹기', target: S => C2(S).ate ? { x: BED[0], z: BED[1] } : { x: -44, z: 52 }, need: ['ameni'],
    enter(S, G, re) { const c = C2(S); if (!c.sd0) c.sd0 = S.day; if (G.hour() < 19) S.time = GG.Game.clockTo(S, 19.2, 0); amWalk(-43, 53.4); },
    check: S => S.day > (C2(S).sd0 || 1e9), done(S, G, next) { G.teleport(-45.6, 52.4, 0.4); next(); }, next: 'c2_work' },
  c2_story: { ch: 3, obj: '저녁 · 아메니와 이야기하기', target: 'npc:ameni', need: ['ameni'],
    enter(S, G, re) { if (G.hour() < 19) S.time = GG.Game.clockTo(S, 19.4, 0); amWalk(-43.4, 52.6); },
    talk: { ameni(S, G) { say([N('ameni', '젊을 적에 나는 대상을 따라 가나안을 여러 번 오갔단다. 헤브론 근처 상수리나무 숲도 지나 봤지. 그래서 네 말을 조금 알아.', '', 'tender'),
      J('헤브론이요? …제 아버지 장막이 거기 있어요. 아버지 이름은 야곱이에요. 막내 동생 베냐민도 있고요.', '', 'sad'), N('ameni', '…그렇구나. 아버지가 지금쯤 너를 찾고 계시겠구나.', '', 'sad'),
      J('형들이… 들짐승이 저를 먹었다고 했을지도 몰라요.', '', 'cry'), N('ameni', '울어도 된다. 여기서는 아무도 안 본다. …내일도 새벽에 깨우마. 이제 자거라.', '', 'tender'), T('숙소 짚자리에서 자요.')], () => G.go('c2_night1')); } } },
  c2_days: { ch: 3, obj: S => { const c = C2(S), D = DAYS[c.dd]; return !D ? '날들이 쌓였어요' : c.dayDone ? `${DAYN[c.dd]} 날 저녁 · 숙소 짚자리에서 자기` : `${DAYN[c.dd]} 날 · ${D[0]}`; },
    list: S => { const c = C2(S); return [{ t: '마당 쓸기' + (c.dd === 0 && !c.dayDone ? ` (${Object.keys(c.sw || {}).length}/4)` : ''), ok: c.dd > 0 || (c.dd === 0 && !!c.dayDone) }, { t: '곡식 자루 나르기' + (c.dd === 1 && !c.dayDone ? ` (${c.sk || 0}/2)` : ''), ok: c.dd > 1 || (c.dd === 1 && !!c.dayDone) }, { t: '헤누와 빵 굽기', ok: c.dd > 2 || (c.dd === 2 && !!c.dayDone) }]; }, need: ['ameni'],
    target: S => { const c = C2(S); if (c.dayDone) return { x: BED[0], z: BED[1] }; if (c.dd === 0) { const i = C2SPOT.sweep.findIndex((q, k) => !c.sw[k]); return i >= 0 ? { x: C2SPOT.sweep[i][0], z: C2SPOT.sweep[i][1] } : null; } if (c.dd === 1) return c.carry ? { x: C2SPOT.sackB[0], z: C2SPOT.sackB[1] } : { x: C2SPOT.sackA[0], z: C2SPOT.sackA[1] }; return { x: -10.6, z: 45 }; },
    enter(S, G, re) { const c = C2(S); if (!re) { c.dd = 0; c.dayDone = 0; } if (c.dd < 3 && !c.dayDone) setTimeout(() => dayStart(S), re ? 400 : 1200); },
    check: S => C2(S).dd >= 3,
    done(S, G, next) { narr([{ kick: '보디발의 집', title: '밭으로', t: '아메니가 요셉을 깨웠습니다. "오늘은 밭에 나가자. 아마를 거두는 날이다. 세마포를 짜는 그 아마 말이다."', ref: '' }], next); }, next: 'c2_field' },
  c2_flax2: { ch: 3, obj: S => ['아마 다발 운하 물에 담그기', '이틀을 기다려요', '아마 건져 볕에 널기', '방망이로 아마 두드리기', '세마포가 될 실'][C2(S).fl] || '',
    list: S => { const f = C2(S).fl; return [{ t: '물에 담그기', ok: f >= 1 }, { t: '건져 널기', ok: f >= 3 }, { t: '두드려 섬유 고르기', ok: f >= 4 }]; },
    target: S => { const f = C2(S).fl; return f === 3 ? { x: C2SPOT.rack[0], z: C2SPOT.rack[1] } : { x: SPOTS.canal[0], z: SPOTS.canal[1] }; },
    enter(S, G, re) { if (!re) say([N('ameni', '거둔 아마는 바로 쓰는 게 아니란다. 물에 담갔다가, 말렸다가, 두드려야 실이 나와. 같이 하자.')]); amWalk(SPOTS.canal[0] - 2, SPOTS.canal[1] + 1.5); },
    check: S => C2(S).fl >= 4, next: 'c2_store' },
  c2_seasons: { ch: 3, obj: S => { const c = C2(S); return c.se >= 3 ? '여러 해가 흘렀어요' : SEAS[c.se][0]; },
    list: S => { const c = C2(S), t = c.st || {}; return c.se === 0 ? [{ t: '흙벽돌 찍기', ok: !!t.brick }, { t: '곡식 자루 높은 곳으로', ok: !!t.lift }] : c.se === 1 ? [{ t: '씨앗 나눠 주기', ok: !!t.seed }, { t: '소에 쟁기 매기', ok: !!t.plough }] : [{ t: '곡식 세어 장부에 적기', ok: !!t.count }]; },
    target: S => { const c = C2(S), t = c.st || {}; return c.se === 0 ? (!t.brick ? { x: C2SPOT.brick[0], z: C2SPOT.brick[1] } : { x: SPOTS.store[0], z: SPOTS.store[1] }) : c.se === 1 ? (!t.seed ? { x: C2SPOT.seed[0], z: C2SPOT.seed[1] } : { x: C2SPOT.plough[0], z: C2SPOT.plough[1] }) : { x: SPOTS.store[0], z: SPOTS.store[1] }; },
    enter(S, G, re) { const c = C2(S); if (!re) { c.se = 0; c.st = {}; fade(() => { S.day += 90; S.time = 8; }, () => seasonStart(S)); } },
    check: S => C2(S).se >= 3, done(S, G, next) { cinBless(S, G, next); }, next: 'c2_tempt1' }
};
/* ① Ameni's welcome now ends with 「따라오너라」 and the tour (the jar comes in the morning) */
steps.c2_arrive.talk.ameni = (S, G) => { say([EG('ameni', '엠 헤테프… 이-크 레크?', '평안하냐… 어디서 왔느냐?'), T('요셉은 고개를 저었습니다. 한 마디도 알아들을 수 없었습니다.', '시편 81:5 참고'),
  N('ameni', '…가나안 말을 하는구나? 나도 조금 할 줄 안다. 젊을 적에 대상을 따라 다녔거든.', '', 'tender'), N('ameni', '여기는 바로의 신하, 시위대장 보디발 나리의 집이다. 나리는 바로를 지키는 호위대의 우두머리시지. 이제 너는 이 집의 종이다. 나는 아메니라고 한다.'),
  N('ameni', '울지 마라, 얘야. 종의 하루는 길단다. 살아남으려면 먼저 이 집을 알고, 애굽 말부터 익혀야 해. 내가 가르쳐 주마.', '', 'tender'),
  N('ameni', '자, 따라오너라. 이 집을 한 바퀴 보여 주마. 길을 잃으면 매 맞는다, 하하.')], () => { learn('hotep'); G.go('c2_tour'); }); };
/* ② the first day: Ameni works beside him */
Object.assign(steps.c2_work, { need: ['ameni', 'cook', 'boy'],
  enter(S, G, re) { if (!G.tool('jar')) G.giveTool('jar'); G.hold('jar'); if (!re) say([N('ameni', '일어나라, 얘야. 첫닭이 울었다. 자, 이 물항아리는 이제 네 것이다.'), N('ameni', '우물에서 물을 길어 부엌 항아리를 세 번 채우고, 맷돌에 보리를 갈고, 외양간 소들에게 꼴을 주자. 오늘은 내가 곁에서 같이 하마.'),
    T('「애굽 말 배우기」 · 일을 하면 애굽 말을 하나씩 익혀요. 익힌 말은 사람들의 말을 알아듣는 데 도움이 돼요.')], () => amWalk(SPOTS.well[0] + 1.6, SPOTS.well[1] - 1, '두레박은 무릎을 굽히고 허리를 펴서 당겨라.')); },
  list: S => { const c = C2(S); return [{ t: `우물물 길어 부엌 항아리 채우기 (${qd(S, 'w1') ? 3 : Math.min(3, c.pour)}/3)`, ok: qd(S, 'w1') }, { t: '헤누와 맷돌로 보리 갈기', ok: qd(S, 'w2') }, { t: '외양간 소들에게 꼴 주기', ok: qd(S, 'w3') }]; } });
{ const sp = specials.find(q => q.id === 'kJars'); if (sp) { sp.label = S => S.water >= 4 ? `부엌 항아리에 물 붓기 (${Math.min(3, C2(S).pour + 1)}/3)` : '물이 부족해요 (우물에서 길어 와요)';
    const use0 = sp.use; sp.use = (S, G) => { const c = C2(S); if (c.pour >= 2) { c.pour = 3; return use0(S, G); } if (S.water < 4) { G.UI.toast('우물에서 물을 길어 와요 (한 번 부을 물)'); return; } if (G.hand() !== 'jar') { G.hold('jar'); return; }
      S.water -= 4; act('water', 0.8, 'jar'); G.sfx('pour'); G.UI.hud(); c.pour++; GG.UI.quest(); if (c.pour === 1) { GG.Life.bubble('ameni', '좋다. 두 번만 더.', 3); amWalk(SPOTS.well[0] + 1.4, SPOTS.well[1] - 1.4); } if (c.pour === 2) GG.Life.bubble('ameni', '…어이쿠, 허리야.', 3); }; } }
{ const sq = specials.find(q => q.id === 'quern'); if (sq) { const u0 = sq.use; sq.use = (S, G) => { amWalk(SPOTS.quern[0] - 1.6, SPOTS.quern[1] + 1.4, '헤누가 노래를 부르면 맷돌이 잘 돈다더라.'); return u0(S, G); }; } }
{ const so = specials.find(q => q.id === 'feedOx'); if (so) { const u0 = so.use; so.use = (S, G) => { amWalk(7.4, 68.4, '아픈 소는 눈부터 봐라. 눈이 맑으면 괜찮다.'); return u0(S, G); }; } }
/* the night line of the old c2_quiz moves to the first night (it now leads to Ameni's evening story) */
{ const say0 = GG.UI.say; GG.UI.say = function (lines, cb) { const S = GG.Game.S && GG.Game.S(); if (S && S.step === 'c2_quiz' && Array.isArray(lines)) lines = lines.filter(l => !(l && /그날 밤, 요셉은 종들의 숙소에 누워/.test(l.t || ''))); return say0.call(this, lines, cb); }; }
/* (v18.72 Ameni's evening story — his past and Joseph's words about his father — was not in Scripture: c2_quiz goes straight on to the night) */
steps.c2_night1.done = (S, G, next) => next();
/* ⑤ the ledger, then Egyptian numbers from the scribe */
Object.assign(steps.c2_store, { list: S => [{ t: `곳간 선반 살피기 (${Object.keys(S.q.shelf || {}).length}/4)`, ok: Object.keys(S.q.shelf || {}).length >= 4 }, { t: '서기관에게 틀린 곳 알려 주기', ok: qd(S, 'ledger') }, { t: '서기관 이피에게 애굽 숫자 배우기', ok: !!S.q.numbers }],
  target: S => Object.keys(S.q.shelf || {}).length < 4 ? 'spot:store' : 'npc:scribe', check: S => qd(S, 'ledger') && !!S.q.numbers });
{ const t0 = steps.c2_store.talk.scribe; steps.c2_store.talk.scribe = function (S, G) { if (S.q.ledger && !S.q.numbers) { numbersLesson(S, G); return; } return t0.apply(this, arguments); }; }
function numbersLesson(S, G) { say([N('scribe', '자네 셈이 밝군. 그럼 애굽 숫자도 배워 두게. 막대 하나가 하나, 말발굽처럼 굽은 뒤꿈치뼈가 열, 감긴 밧줄이 백일세.'),
  { n: '서기관 이피', t: '곡식 자루 스물둘을 장부에 어떻게 쓰겠나?', choices: [{ t: '뒤꿈치뼈 둘, 막대 둘', ok: true }, { t: '막대 스물둘', ok: false, fb: '이피가 껄껄 웃었습니다. 「그러다 장부가 막대 숲이 되겠네! 열은 뒤꿈치뼈 하나로 쓰지.」' }, { t: '감긴 밧줄 둘, 막대 둘', ok: false, fb: '「밧줄은 백이라네. 그럼 이백둘이 되지.」' }] },
  N('scribe', '옳지! 오늘부터 곳간 장부 한 장은 자네가 쓰게. 이 늙은 눈이 한결 편하겠구먼.', '', 'happy')], () => { S.q.numbers = 1; GG.UI.quest(); G.checkStep(); }); }
/* ⑥ the feast is prepared first: bread with Henu, wine jars, lotus */
Object.assign(steps.c2_banquet, { enter(S, G, re) { setTimeout(() => { if (G.S().step === 'c2_banquet') G.go('c2_manage'); }, 0); /* v18.72 (Potiphar's feast was not in Scripture: an old save here goes on to 39:4) */ },
  obj: S => S.q.prepDone ? `잔치에서 보디발과 손님들 섬기기 (${Math.min(4, S.q.served || 0)}/4)` : '잔치 준비 · 헤누를 돕기',
  target: S => { if (!S.q.prepDone) { const pr = C2(S).prep || {}; return !pr.bread ? { x: -10.6, z: 43.6 } : !pr.wine ? { x: SPOTS.store[0], z: SPOTS.store[1] } : { x: SPOTS.pool[0], z: SPOTS.pool[1] }; } return S.q.carry ? 'npc:' + (S.q.want || 'guest1') : { x: -39.2, z: 43.1 }; } });
{ const l0 = steps.c2_banquet.list; steps.c2_banquet.list = (S, G) => S.q.prepDone ? l0(S, G) : (pr => [{ t: '헤누와 빵 굽기', ok: !!pr.bread }, { t: '포도주 단지 나르기', ok: !!pr.wine }, { t: '연꽃 꽂기', ok: !!pr.lotus }])(C2(S).prep || {}); }
/* ⑦ the overseer's days, and Ameni's back */
Object.assign(steps.c2_manage, { list: S => [{ t: '일꾼들에게 맞는 일 맡기기', ok: qd(S, 'assign') }, { t: '요리사와 정원지기의 다툼 풀기', ok: qd(S, 'quarrel') }, { t: '청지기 네브와 이야기하기', ok: qd(S, 'nebOk') }].concat(S.q.amHurt ? [{ t: '곁이야기 · 아메니의 허리', ok: !!S.q.amCare }] : []),
  target: S => !qd(S, 'assign') ? { x: -30, z: 44.9 } : !qd(S, 'quarrel') ? 'npc:cook' : !qd(S, 'nebOk') ? 'npc:neb' : !S.q.amCare ? (C2(S).herb ? 'npc:ameni' : { x: C2SPOT.herb[0], z: C2SPOT.herb[1] }) : null,
  check: S => { const base = qd(S, 'assign') && qd(S, 'quarrel') && qd(S, 'nebOk'); if (base && !S.q.amHurt) { S.q.amHurt = 1; GG.UI.quest(); say([{ n: '어린 종', t: '총무님! 아메니 영감이 물동이를 들다 허리를 삐끗했어요!', e: 'fear' }, T('곁이야기 · 정원에서 약초를 캐어 드릴 수 있어요(안 해도 이야기는 이어져요).')]); return false; } return base; },
  done(S, G, next) { next(); }, next: 'c2_seasons' });
steps.c2_manage.talk.ameni = (S, G) => { if (!S.q.amHurt || S.q.amCare) return false; if (!C2(S).herb) { say([N('ameni', '아이고… 괜찮다, 괜찮아. 늙으면 다 이렇지.', '', 'weary'), T('정원지기에게 약초를 얻어 오면 좋겠어요.')]); return; }
  say([T('정원지기가 준 약초를 아메니의 허리에 붙여 드렸어요.'), N('ameni', '…네가 나를 돌보는구나. 처음 이 집에 왔을 때는 내가 너를 돌봤는데.', '', 'cry'), N('ameni', '고맙다, 총무. 아니… 고맙다, 요셉아.', '', 'tender')], () => { S.q.amCare = 1; GG.UI.quest(); G.checkStep(); }); };
/* ⑨ day after day (39:10): three days, each day the summons, and he picks a place among people */
Object.assign(steps.c2_tempt2, { list: S => { const c = C2(S); return [{ t: `날마다 사람들 곁에서 일하기 (${Math.min(3, c.td)}/3일)`, ok: c.td >= 3 }, { t: '숙소에서 무릎 꿇기 (창 39:9)', ok: !!c.prayN }]; },
  target: S => { const c = C2(S); return c.td < 3 ? null : { x: C2SPOT.prayer[0], z: C2SPOT.prayer[1] }; },
  check: S => { const c = C2(S); return c.td >= 3 && !!c.prayN; } });
{ const e0 = steps.c2_tempt2.enter; steps.c2_tempt2.enter = function (S, G, re) { if (e0) e0.apply(this, arguments); if (C2(S).td < 3) setTimeout(() => temptDay(S), re ? 1500 : 4000); }; }
steps.c2_tempt2.talk.ameni = () => false; /* (Ameni's warning and Joseph's answer were not in Scripture) */
const TEMPT_JOBS = [['밭에서 일꾼들과 아마 거두기', [6, 44]], ['대청에서 서기와 장부 맞추기', [-22, 41.5]], ['외양간에서 소 치는 아이와 소 돌보기', [8, 73]], ['곳간에서 짐꾼들과 곡식 세기', [-13, 62]]];
function temptDay(S) { const c = C2(S), G = Gm(); if (S.step !== 'c2_tempt2' || c.td >= 3 || c.tdBusy) return; if (GG.UI.busy() || GG.Cine.on) { setTimeout(() => temptDay(S), 1500); return; } c.tdBusy = 1;
  say([T('여인이 날마다 요셉에게 청하였습니다.', '창세기 39:10'), { n: '', t: '오늘은 어디서 일할까요? (사람들이 있는 곳)', choices: TEMPT_JOBS.map(([t, at]) => ({ t, then: () => setTimeout(() => {
    fade(() => { G.teleport(at[0] + 1.5, at[1] + 1.5, 0); S.time = Math.max(S.time, 17.5); }, () => { c.td++; c.tdBusy = 0; GG.UI.quest();
      say([T(c.td === 1 ? '요셉은 해가 질 때까지 사람들 곁을 떠나지 않았습니다.' : c.td === 2 ? '이튿날도, 그다음 날도 여인은 같은 말로 청하였습니다.' : '여인이 날마다 요셉에게 청하였으나, 요셉이 듣지 아니하여 동침하지 아니할 뿐더러 함께 있지도 아니하니라.', c.td === 3 ? '창세기 39:10' : '')].concat(c.td >= 3 ? [T('밤이 되었어요. 숙소에서 무릎을 꿇어요.')] : []),
        () => { if (c.td < 3) fade(() => { S.day += 1; S.time = 9; }, () => setTimeout(() => temptDay(S), 1200)); }); }); }, 60) })) }]); }
/* ⑩ the walk to the prison: the accusation scene is cut before 「3장」 and the walk is played in between (39:20) */
const JAIL_PATH = [[-17, 51.6], [-6, 52], [-2.5, 49], [-2.5, 24], [-14, 21], [-27, 19.5], [-30, 16.6]]; /* out by the side door and round the back wall to the prison gate (the yard's back wall has no door) */
let splitAccuse = false;
{ const play1 = GG.Cine.play; GG.Cine.play = function (shots, done, o) {
    if (splitAccuse && shots && shots.some(s => /보라! 주인이 히브리 사람을/.test(s.t || ''))) { splitAccuse = false; const bi = shots.findIndex(s => s.black); if (bi > 0) { const a = shots.slice(0, bi).map((s, i) => i === bi - 1 ? Object.assign({}, s, { fadeOut: 0 }) : s), b = shots.slice(bi);
      return play1.call(this, a, () => { const S = GG.Game.S(); S.q.jail = { i: 0, wait: 1 }; /* the escape's catch rule stays off from here */ setTimeout(() => jailWalk(S, () => play1.call(GG.Cine, b, done, o)), 30); }, o); } }
    return play1.apply(this, arguments); }; }
{ const d0 = steps.c2_flee.done; steps.c2_flee.done = function (S, G, next) { splitAccuse = true; return d0.apply(this, arguments); }; }
{ const e0 = steps.c2_flee.enter; steps.c2_flee.enter = function (S, G, re) { if (S.q.grabAt) { GRAB.x = S.q.grabAt[0]; GRAB.z = S.q.grabAt[1]; } return e0 && e0.apply(this, arguments); }; }
{ const o0 = steps.c2_flee.obj, t0 = steps.c2_flee.target; steps.c2_flee.obj = S => S.q.jail ? '병사들을 따라 옥으로 걷기' : (typeof o0 === 'function' ? o0(S) : o0); steps.c2_flee.target = S => S.q.jail ? 'npc:pg1' : (typeof t0 === 'function' ? t0(S) : t0); }
function jailWalk(S, then) { const G = Gm(); S.q.jail = { i: 0, then }; S.q.bound = 1; RT.chase = null; RT.alarm = 0; { const w = G.npc('wife'); if (w) { w.walk = null; w.emote = null; } } G.npcShow('pg1', true); G.npcShow('pg2', true); place('pg1', -28.9, 47.6, Math.PI); place('pg2', -26.3, 47.6, Math.PI); G.teleport(-27.6, 49.6, Math.PI);
  face('ameni', -27.6, 49.6); GG.UI.quest();
  say([T('병사 둘이 요셉의 두 팔을 묶어 앞세우고 걸었습니다.'), T('대청 기둥 곁에서 늙은 아메니가 요셉을 바라보았습니다. 아메니는 아무 말 없이, 천천히 고개를 끄덕였습니다.'), T('병사들을 따라 옥까지 걸어요.')]); }
function jailTick(dt, S) { const j = S.q.jail; if (!j || j.wait || GG.UI.busy() || GG.Cine.on) return;
  if (!j.then) { /* a game loaded in the middle of the walk: the scene's end is gone, so go on to the cell */ S.q.jail = null; S.q.bound = 0; const G = Gm(); stage(S, G); G.teleport(-18.4, -6.2, Math.PI); G.go('c3_cell'); return; } const G = Gm(), n = G.npc('pg1'), n2 = G.npc('pg2'); if (!n) return; const d = G.dist(n.x, n.z);
  if (j.i === 0 && !j.nod) { j.nod = 1; GG.Life.bubble('ameni', '……', 3); }
  if (d > 7) { if (n.walk) n.walk = null; if (n2 && n2.walk) n2.walk = null; j.wt = (j.wt || 0) + dt; if (j.wt > 4) { j.wt = 0; GG.Life.bubble('pg1', '세헤브! 걸어라!', 2.4); } return; }
  if (!n.walk) { if (j.i >= JAIL_PATH.length) { const t = j.then; S.q.jail = null; S.q.bound = 0; t && t(); return; } const [x, z] = JAIL_PATH[j.i]; const nx = JAIL_PATH[j.i + 1] || [x, z - 2], ax = nx[0] - x, az = nx[1] - z, al = Math.hypot(ax, az) || 1; /* side by side, across the way ahead */ G.npcWalk('pg1', x - az / al * 1.1, z + ax / al * 1.1, () => { j.i++; }, 1.4); if (n2) G.npcWalk('pg2', x + az / al * 1.1, z - ax / al * 1.1, null, 1.4);
    if (j.i === 2 && !j.b2) { j.b2 = 1; GG.Life.bubble('pg2', '시위대장 나리 댁 총무가 옥에 가는군.', 3); } if (j.i === 3 && !j.b3) { j.b3 = 1; GG.Life.bubble('pg1', '쉿. 나리 귀에 들어간다.', 3); } } }

// ------------------------------------------------------------------ tick + order
function ch2Tick(dt, S) { if (!S) return; try { lookAge(S); const c = S.q.c2; if (!c && !S.q.jail) return; if (S.step === 'c2_tour') tourTick(dt, S, c); if (S.step === 'c2_days') daysTick(S, c); if (S.q.jail) jailTick(dt, S); } catch (e) { console.error('ch2', e); } }
function tourTick(dt, S, c) { if (!c || GG.UI.busy() || GG.Cine.on || c.tour >= TOUR.length) return; const G = Gm(), a = G.npc('ameni'); if (!a) return;
  if (c.arrived !== c.tour) { const [x, z] = TOUR[c.tour]; c.wk = (c.wk || 0) + dt; /* a well or a wall in the way: after 30 s (or within 3 m) he is there */
    if (Math.hypot(a.x - x, a.z - z) > 3 && c.wk < 30) { if (!a.walk) G.npcWalk('ameni', x, z, null, 1.5, TOUR[c.tour][3] || route(a.x, a.z, x, z)); return; } a.walk = null; c.arrived = c.tour; c.wk = 0; }
  if (a.walk) return;
  if (G.dist(a.x, a.z) > 6) { c.twait = (c.twait || 0) + dt; if (c.twait > 5) { c.twait = 0; GG.Life.bubble('ameni', '이쪽이다, 얘야!', 2.4); } return; }
  c.twait = 0; face('ameni', G.P.x, G.P.z); const line = TOUR[c.tour][2]; c.tour++; GG.UI.quest(); say([N('ameni', line)], () => G.checkStep()); }
{ const keys = Object.keys(steps), cut = keys.indexOf('c2_arrive'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c2_tour = CH2.c2_tour; steps.c2_supper = CH2.c2_supper;
  for (const [k, v] of tail) { steps[k] = v; if (k === 'c2_quiz') steps.c2_story = CH2.c2_story; if (k === 'c2_night1') steps.c2_days = CH2.c2_days; if (k === 'c2_field') steps.c2_flax2 = CH2.c2_flax2; if (k === 'c2_manage') steps.c2_seasons = CH2.c2_seasons; }
  steps.c2_night1.next = 'c2_days'; steps.c2_field.next = 'c2_flax2';
  ORDER = Object.keys(steps); }

/* v18.80 the flax field without the same move eight times: pull a few by the roots, bind the bundle, carry it to the canal (the workers pull the rest) */
const FBIND2 = [4, 51], FDROP2 = [1.2, 66.4];
Object.assign(steps.c2_field, { list: S => { const c = C2(S), n = Math.min(3, S.q.flax || 0); return [{ t: `아마를 뿌리째 뽑기 (${n}/3)`, ok: n >= 3 }, { t: '일꾼들과 아마 다발 묶기', ok: !!c.fBind }, { t: '다발을 지고 운하 곁으로', ok: !!c.fDrop }, { t: '진흙에 빠진 송아지 구하기', ok: qd(S, 'calf') }]; },
  target: S => { const c = C2(S); if ((S.q.flax || 0) < 3) return 'field:pflax'; if (!c.fBind) return { x: FBIND2[0], z: FBIND2[1] }; if (!c.fDrop) return { x: FDROP2[0], z: FDROP2[1] }; return !qd(S, 'calf') ? 'spot:canal' : null; },
  check: S => { const c = C2(S); return (S.q.flax || 0) >= 3 && !!c.fBind && !!c.fDrop && qd(S, 'calf'); } });
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || S.step !== 'c2_field' || G.cineOn || GG.UI.busy()) return null; const c = C2(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if ((S.q.flax || 0) >= 3 && !c.fBind) at(FBIND2[0], FBIND2[1], 3, { label: '일꾼들과 아마 다발 묶기', key: 'c2FBind', use: () => GG.UI.minigame('count', { title: '다발 묶기', hint: '뽑은 아마를 한 아름 모아 끈으로 세 번 감아 매요.', need: 3, btn: '감기', unit: '번' }, ok => { if (!ok) return; c.fBind = 1; p.carry = 'basket'; act('pick', 0.8);
    for (const k in S.plots) if (k.startsWith('pflax:') && S.plots[k].s === 2) delete S.plots[k]; GG.Game.ENT.plotsDirty = true; /* (the workers pulled the rest) */
    GG.UI.quest(); GG.UI.toast('일꾼들이 나머지 아마를 다 뽑았어요 · 다발을 지고 운하 곁으로'); }) });
  if (c.fBind && !c.fDrop) at(FDROP2[0], FDROP2[1], 2.8, { label: '운하 곁에 아마 다발 내려놓기', key: 'c2FDrop', use: () => { c.fDrop = 1; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.4 }); GG.UI.quest(); setTimeout(() => GG.Life.bubble('cowboy', '형! 송아지가 진흙에 빠졌어요!', 3.2), 900); } });
  return out.length ? out : null; });
