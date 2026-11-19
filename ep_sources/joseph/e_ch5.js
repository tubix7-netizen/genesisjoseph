// =================================================================== v18.77 5장 다시 짜기 · 「일곱 해 풍년」 (e_ch5.js · 설계표_5장_v18_74.md)
/* 창 41:46–54. 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 요셉의 말은 성경 말씀만(41:34–36 · 41:51–52).
   ① 순찰(41:46): 버금 수레 배우기 · 세 마을 돌며 설득하기(요셉의 말은 바로 앞에서 아뢴 41:34–36) · 곳간 터 재기
   ② 풍년 첫해(41:47): 왕실 밭 두 이랑 · 쟁기질 → 씨 뿌리기 → 나흘 기다림 → 거두기 → 단 묶기 → 타작 → 키질(오후 바람) → 자루 → 오분의 일(41:34)
   ③ 성읍 곳간(41:48 「각 성에 저장하되」): 터 다지기 → 기초 돌 → 벽돌(사흘 말리기) → 벽 다섯 켜(하루 한 켜) → 문 → 둥근 지붕 → 회칠 → 첫 곡식
      · 기다리는 동안 곁이야기를 할 수 있어요(game.js CALM) · 서쪽 · 남쪽 곳간은 장면으로
   ④ 므낫세(41:50–51) ⑤ 해마다 쌓기: 둘째 해 거둔 곡식을 수레로 서쪽 · 남쪽 곳간에 ⑥ 에브라임(41:52) ⑦ 세기를 그침(41:49) ⑧ 풍년이 그침(41:53–54) */
const C5 = S => S.q.c5 || (S.q.c5 = {});
const FIELD5 = 'royal', ROWS5 = [0, 1];
const THRESH5 = [-61.5, -151], STONE5 = [24.5, -58.5], BRICK5 = [-41.5, -113.5];
const GR5 = id => sites.find(s => s.id === id);
const field5 = () => fields.find(f => f.id === FIELD5);
const rowPos5 = j => { const F = field5(); return [F.x, F.z + (j - (F.rows - 1) / 2) * F.ts]; };
const rowIds5 = j => { const F = field5(), out = []; for (let i = 0; i < F.cols; i++) out.push(FIELD5 + ':' + i + ',' + j); return out; };
const plots5 = () => ROWS5.flatMap(rowIds5);
const ripe5 = S => plots5().filter(k => { const p = S.plots[k]; return p && p.s === 2 && p.c === 'wheat' && p.st >= 3; }).length;
const growing5 = S => plots5().filter(k => { const p = S.plots[k]; return p && p.s === 2 && p.c === 'wheat'; }).length;
const MG5 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const hr5 = S => S.time % 24;
const sinceDay = (S, d) => S.day > (d === undefined ? -1 : d);

// ------------------------------------------------------------------ ① 순찰 · 세 마을 설득 · 곳간 터 재기 (41:46)
const SITE5 = [['A', 'granA', '성읍'], ['B', 'granB', '서쪽 마을'], ['C', 'granC', '남쪽 마을']];
Object.assign(steps.c5_patrol, {
  list: S => { const c = C5(S), m = c.meas || {}; return [{ t: '수레지기 호리에게 버금 수레 받기', ok: !S.q.needCart }, { t: '버금 수레 타기', ok: qd(S, 'rode') }]
    .concat(S.q.cartTut ? [{ t: '전진을 두 번 눌러 보통 걸음으로 가기', ok: qd(S, 'tG2') }, { t: '가다가 「정지」로 수레 세우기', ok: qd(S, 'tStop') }, { t: '서기 카이를 옆자리에 태우기', ok: qd(S, 'tPax') }] : [])
    .concat([{ t: '성읍 감독관 만나기', ok: qd(S, 'metC') }, { t: '성읍 곳간 터 재기', ok: !!m.A }, { t: '서쪽 마을 촌장 설득하기 (북쪽 나루 건너)', ok: qd(S, 'metW') }, { t: '서쪽 곳간 터 재기', ok: !!m.B },
      { t: '남쪽 마을 촌장 설득하기 (남쪽 나루 건너)', ok: qd(S, 'metS') }, { t: '남쪽 곳간 터 재기', ok: !!m.C }]); },
  target: S => { const c = C5(S), m = c.meas || {}; if (S.q.needCart) return 'npc:cartMan'; if (!qd(S, 'rode') && GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos()) return GG.Cart.rearPos();
    if (S.q.cartTut && qd(S, 'tStop') && !qd(S, 'tPax')) return 'npc:kaiClerk'; if (!qd(S, 'metC')) return 'npc:overseerC'; const g = id => { const s = GR5(id); return { x: s.x, z: s.z }; };
    if (!m.A) return g('granA'); if (!qd(S, 'metW')) return 'npc:overseerW'; if (!m.B) return g('granB'); if (!qd(S, 'metS')) return 'npc:overseerS'; if (!m.C) return g('granC'); return null; },
  check: S => { const m = C5(S).meas || {}; return qd(S, 'rode') && qd(S, 'metC') && qd(S, 'metW') && qd(S, 'metS') && !!(m.A && m.B && m.C); },
  done(S, G, next) { narr([{ kick: '창세기 41:47', title: '풍년 첫해', t: '칠 년 풍년에 토지 소산이 심히 많은지라. 왕실 밭의 검은 흙이 나일 물을 머금고 기다리고 있어요.', ref: '창세기 41:47' }], next); }, next: 'c5_farm' });
Object.assign(steps.c5_patrol.talk, {
  /* the wagon master teaches (no 「shall I learn?」 answer of Joseph's) */
  cartMan(S, G) { if (!S.q.needCart) return false; say([N('cartMan', '총리님! 바로께서 내리신 버금 수레입니다.', '창세기 41:43'), N('cartMan', '말은 제가 길들여 놓았습니다. 곡식 표본 자루도 짐칸에 실어 두었으니 서쪽 촌장에게 전해 주십시오.'),
    N('cartMan', '수레 뒤에서 A키로 오르십시오. 왼쪽 스틱은 핸들입니다. 전진을 한 번 누르면 걷고, 두 번 누르면 보통 걸음, 세 번부터는 달리지만 말이 지칩니다.'),
    N('cartMan', '「정지」로 세우고, 사람 곁에 서서 「태우기」로 옆자리에 태울 수 있어요. 서기 카이가 성읍 감독관에게 갈 일이 있으니 태워 주십시오.')], () => { S.q.cartTut = 1; S.q.needCart = 0; S.cartStore = S.cartStore || {}; S.cartStore.qSample = 1; G.UI.quest(); }); },
  overseerC(S, G) { if (S.q.metC) return false; const pax = qd(S, 'tPax');
    say([N('overseerC', '총리님! 바로께서 명하신 대로 성읍 동쪽에 곳간 터를 닦아 두었습니다. 말뚝과 줄도 쳐 두었지요.'), N('overseerC', '벽돌은 벽돌 굽는 우니의 벽돌터에서 굽습니다. 터를 한번 재어 보시지요.')]
      .concat(pax ? [N('kaiClerk', '감독관님, 곳간에 들어오는 곡식은 제가 날마다 장부에 적겠습니다.'), N('overseerC', '서기 카이까지 오셨군요! 장부가 있으면 한 톨도 새지 않겠습니다.', '', 'happy'), N('kaiClerk', '총리님, 여기까지 태워 주셔서 감사합니다. 걸어왔으면 해가 졌을 거예요.', '', 'happy')] : []),
      () => { tick(S, 'metC'); if (pax && GG.Cart && GG.Cart.kaiOff) GG.Cart.kaiOff(); }); },
  /* v18.77 the villages are persuaded with Joseph's own words before Pharaoh (41:34–36) — the only words of his here */
  overseerW(S, G) { if (S.q.metW) return false;
    const inBag = G.inv('qSample') > 0, inCart = !!(S.cartStore && S.cartStore.qSample), inBox = !inBag && !inCart && Object.keys(S).some(k => (k === 'store' || /^horseBox_/.test(k)) && S[k] && S[k].qSample > 0);
    if (inBox || (!inBag && inCart)) { say([N('overseerW', '총리님, 바로께서 곡식 표본을 보내신다 들었습니다. 우리 마을 곡식과 견주어 보고 싶은데요.'), T(inBox ? '곡식 표본 자루를 다른 곳에 맡겨 두었어요. 가져와서 다시 와요.' : '곡식 표본 자루는 수레 짐칸에 있어요. 꺼내서 다시 말을 걸어요.')], () => { S.q.sampleAsk = inBox ? 2 : 1; G.UI.quest(); if (!inBox && GG.UI.help) setTimeout(() => GG.UI.help('cartBox', '짐칸에서 꺼내기', '수레 뒤에 서면 뜨는 「짐칸」 단추를 누르거나, 수레 위에서 「짐칸」 단추를 눌러요 · 곡식 표본 자루를 눌러 가방에 넣고 촌장에게 다시 말을 걸어요'), 300); }); return; }
    say([N('overseerW', '오분의 일이라니요, 총리님! 풍년에 곡식을 왜 쌓아 둡니까? 지금 팔면 다 금이 될 텐데!', '', 'angry'),
      { n: '', t: '요셉은 바로 앞에서 아뢴 말을 촌장에게 들려주었어요. 무엇이라 했을까요?', choices: [
        { t: '「그 양식으로 이 땅이 칠 년 흉년을 예비함이 되리니 땅이 이 흉년으로 인하여 멸망치 아니하리이다」', ok: true },
        { t: '「바로의 명이니 따르지 않으면 벌을 받으리라」', ok: false, fb: '요셉이 바로 앞에서 한 말은 겁을 주는 말이 아니었어요. 흉년을 예비하자는 말이었어요(창 41:36).' },
        { t: '「곡식을 쌓아 두면 값이 오르리라」', ok: false, fb: '요셉의 계획은 돈벌이가 아니었어요. 흉년에 땅이 망하지 않게 하는 것이었어요(창 41:36).' }] },
      J('그 양식으로 이 땅이 칠 년 흉년을 예비함이 되리니 땅이 이 흉년으로 인하여 멸망치 아니하리이다.', '창세기 41:36'),
      N('overseerW', '…칠 년 흉년이라. 제 손녀가 이제 막 걸음마를 뗐습니다. 알겠습니다, 총리님. 서쪽 마을은 오분의 일을 바치겠습니다.', '', 'tender'), T('요셉은 곡식 표본 자루를 촌장에게 건넸어요.')],
      () => { if (G.inv('qSample') > 0) G.take('qSample', 1); else if (S.cartStore && S.cartStore.qSample) delete S.cartStore.qSample; S.q.sampleAsk = 0; GG.UI.pop && GG.UI.pop('곡식 표본을 전했어요', '퀘스트 물건', 'sack'); tick(S, 'metW'); }); },
  overseerS(S, G) { if (S.q.metS) return false;
    say([N('overseerS', '총리님, 저희 마을도 따르겠습니다. 다만… 해마다 거둔 것을 바치면 우리 아이들은 무엇을 먹습니까?', '', 'sad'),
      { n: '', t: '요셉은 바로 앞에서 아뢴 말을 들려주었어요. 무엇이라 했을까요?', choices: [
        { t: '「그 칠 년 풍년에 애굽 땅의 오분 일을 거두되」', ok: true },
        { t: '「거둔 것을 모두 바치라」', ok: false, fb: '요셉이 바로 앞에서 말한 것은 오분의 일이었어요(창 41:34).' },
        { t: '「바치지 않아도 되리라」', ok: false, fb: '오분의 일은 거두어 각 성에 쌓아 두어야 했어요(창 41:34–35).' }] },
      J('바로께서는 이같이 행하사 국중에 감독관들을 두어 그 칠 년 풍년에 애굽 땅의 오분 일을 거두되', '창세기 41:34'),
      N('overseerS', '다섯에 하나라면… 넷은 우리 몫이군요! 곳간 터는 마을 서쪽 언덕 위라 들었습니다. 거기라면 강물이 넘쳐도 물 한 방울 들지 않겠지요.', '', 'happy')], () => tick(S, 'metS')); } });

// ------------------------------------------------------------------ ② 풍년 첫해 · 왕실 밭 한 바퀴 (41:47–48 · 41:34)
const CH5 = {};
CH5.c5_farm = { ch: 6, obj: S => farmObj5(S), list: S => { const c = C5(S), r = ripe5(S), g = growing5(S); return [
    { t: '소와 쟁기로 이랑 갈기 (' + Math.min(2, c.plow || 0) + '/2)', ok: (c.plow || 0) >= 2 }, { t: '밀 씨 뿌리기 (' + Math.min(2, c.sow || 0) + '/2)', ok: (c.sow || 0) >= 2 },
    { t: '밀이 자라기를 기다리기 · 나흘', ok: !!c.harvest || (g > 0 && r === g) }, { t: '낫으로 밀 거두기 · 네 칸 (나머지는 일꾼들과)' + ((c.sow || 0) >= 2 && !c.harvest && g ? ` (${Math.min(4, plots5().length - g)}/4)` : ''), ok: !!c.harvest },
    { t: '거둔 밀 단 묶기', ok: !!c.bind }, { t: '타작마당 · 소가 밟아 이삭 떨기', ok: !!c.thresh }, { t: '키질하기 (바람 부는 오후)', ok: !!c.winnow }, { t: '자루에 담기', ok: !!c.bag }, { t: '서기 카이와 오분의 일 나누기', ok: !!c.fifth }]; },
  enter(S, G, re) { G.unlock(FIELD5); (S.irrigated = S.irrigated || {})[FIELD5] = 1; if (!G.tool('sickle')) G.giveTool('sickle');
    if (!re) narr([{ kick: '풍년 첫해 · 왕실 밭', title: '한 해 농사', t: '나일 물이 물러간 왕실 밭에 검은 흙이 드러났어요. 일꾼들과 함께 이랑을 갈고, 씨를 뿌리고, 거두어 곳간 몫을 떼어 놓아요. 밀이 자라는 동안에는 곁이야기를 하러 다녀와도 돼요.', ref: '' }]); },
  target: S => { const c = C5(S); if ((c.plow || 0) < 2) { const [x, z] = rowPos5(ROWS5[c.plow || 0]); return { x, z }; } if ((c.sow || 0) < 2) { const [x, z] = rowPos5(ROWS5[c.sow || 0]); return { x, z }; }
    if (!c.harvest) { const [x, z] = rowPos5(0.5); return { x, z }; } if (!c.bind) { const [x, z] = rowPos5(0.5); return { x, z }; } if (!c.fifth && c.bag) return 'npc:kaiClerk'; return { x: THRESH5[0], z: THRESH5[1] }; },
  check: S => !!C5(S).fifth,
  done(S, G, next) { narr([{ kick: '창세기 41:48', title: '각 성에 저장하되', t: '요셉이 애굽 땅에 있는 그 칠 년 곡물을 거두어 각 성에 저장하되, 각 성 주위의 밭의 곡물을 그 성 중에 쌓으매. 이제 성읍 곳간을 지어요.', ref: '창세기 41:48' }], next); }, next: 'c5_build',
  talk: { kaiClerk(S, G) { const c = C5(S); if (!c.bag || c.fifth) return false;
    say([N('kaiClerk', '총리님, 열 자루가 나왔습니다. 바로께 드릴 오분의 일은 몇 자루입니까?'),
      { n: '', t: '열 자루의 오분의 일은? (4장에서 배운 애굽 숫자: │ 하나 · ∩ 열)', choices: [{ t: '││ (두 자루)', ok: true }, { t: '│││││ (다섯 자루)', ok: false, fb: '다섯 자루는 절반이에요. 다섯 자루마다 한 자루씩이니, 열 자루라면 두 자루예요.' }, { t: '∩ (열 자루)', ok: false, fb: '그러면 밭 임자 몫이 하나도 없어요. 다섯에 하나씩이에요.' }] },
      N('kaiClerk', '두 자루는 곳간 몫, 여덟 자루는 밭 임자 몫. 장부에 적었습니다.', '', 'happy'), T('곳간이 서기 전까지, 곳간 몫 두 자루는 성읍 창고에 맡겨 두었어요.')], () => { c.fifth = 1; GG.UI.quest(); G.checkStep(); }); } } };
function farmObj5(S) { const c = C5(S), r = ripe5(S), g = growing5(S);
  if ((c.plow || 0) < 2) return '왕실 밭 · 소와 쟁기로 이랑 갈기'; if ((c.sow || 0) < 2) return '왕실 밭 · 밀 씨 뿌리기';
  if (!c.harvest && g && r < g) { const left = Math.max(1, 4 - (S.day - (c.sowDay || S.day))); return `밀이 자라기를 기다리기 · ${left}일쯤 (곁이야기를 해도 돼요)`; }
  if (!c.harvest) return '낫으로 밀 거두기 (낫을 손에 들고 밭에서 A)'; if (!c.bind) return '거둔 밀 단 묶기'; if (!c.thresh) return '타작마당 · 소가 밟아 이삭 떨기';
  if (!c.winnow) return hr5(S) >= 13 && hr5(S) < 18.5 ? '키질하기 · 바람이 불어요' : '키질하기 · 바람이 부는 오후(1시~6시)까지 기다리기'; if (!c.bag) return '자루에 담기'; return '서기 카이와 오분의 일 나누기'; }
let OX5 = 0;
function ox5(on, x, z) { const G = Gm(); if (on) { if (!G.npc('ox5')) G.spawnNPC({ id: 'ox5', name: '황소', animal: 'cow', x, z, face: Math.PI / 2, noTalk: true, noTag: true, noBond: true }); else G.npcTo('ox5', x, z, Math.PI / 2, false); OX5 = 1; }
  else if (G.npc('ox5')) { G.removeNPC('ox5'); OX5 = 0; } }
function plow5(S, G, j) { const c = C5(S), F = field5(), [x, z] = rowPos5(j), x0 = F.x - F.cols * F.ts / 2 - 1.2, x1 = F.x + F.cols * F.ts / 2 + 1.2;
  ox5(true, x0, z); G.teleport(x0 - 1.6, z, Math.PI / 2); const ox = G.npc('ox5'); if (ox) G.npcWalk('ox5', x1, z, null, 0.7);
  MG5('push', { title: '쟁기질', hint: '황소가 쟁기를 끌어요. 쟁기 자루를 꾹 눌러 이랑이 곧고 깊게 나도록 해요.', need: 8, dur: 14, btn: '누르기', unit: '고랑' }, () => {
    for (const k of rowIds5(j)) { S.plots[k] = { s: 1 }; } G.ENT.plotsDirty = true; G.FX.burst(x, hAt(x, z) + 0.2, z, 24, { c: [0.35, 0.25, 0.18], sp: 2, up: 1.2, spread: 5 });
    c.plow = (c.plow || 0) + 1; ox5(false); GG.UI.toast(c.plow >= 2 ? '두 이랑을 다 갈았어요 · 이제 씨를 뿌려요' : '한 이랑을 갈았어요'); GG.UI.quest(); }); }
function sow5(S, G, j) { const c = C5(S), [x, z] = rowPos5(j); act('plant', 1.2);
  MG5('rhythm', { title: '씨 뿌리기', hint: '박자에 맞춰 한 줌씩 흩뿌려요. 고르게 뿌려야 고르게 나요.', beats: 14, need: 9 }, () => {
    for (const k of rowIds5(j)) { S.plots[k] = { s: 2, c: 'wheat', st: 0, g: 0, w: 1 }; } G.ENT.plotsDirty = true; c.sow = (c.sow || 0) + 1; if (c.sow >= 2) c.sowDay = S.day;
    GG.UI.toast(c.sow >= 2 ? '씨를 다 뿌렸어요 · 나흘쯤 지나면 거둘 수 있어요 (곁이야기를 해도 돼요)' : '한 이랑에 씨를 뿌렸어요'); GG.UI.quest(); }); }
function bind5(S, G) { act('gather', 1.4); MG5('wrestle', { title: '단 묶기', hint: '밀 한 아름을 모아 짚 끈으로 꽉 조여 묶어요.', need: 6, dur: 14, btn: '조이기', unit: '단' }, () => { C5(S).bind = 1; GG.UI.toast('밀단을 묶어 타작마당으로 날랐어요'); GG.UI.quest(); }); }
function thresh5(S, G) { const [x, z] = THRESH5; ox5(true, x + 2.6, z); const path = []; for (let k = 1; k <= 8; k++) { const a = k / 8 * Math.PI * 2; path.push([x + Math.cos(a) * 2.6, z + Math.sin(a) * 2.6]); } G.npcWalk('ox5', path[7][0], path[7][1], null, 0.9, path.slice(0, 7)); G.teleport(x + 3.6, z + 2.4, -2.2);
  MG5('balance', { title: '타작', hint: '황소가 마당을 돌며 이삭을 밟아요. 고삐를 잡고 소가 원 밖으로 나가지 않게 가운데를 지켜요.', dur: 10 }, () => { C5(S).thresh = 1; ox5(false); GG.UI.toast('이삭이 다 떨어졌어요 · 오후 바람에 키질해요'); GG.UI.quest(); }); }
function winnow5(S, G) { const h = hr5(S); if (h < 13 || h >= 18.5) { GG.UI.toast('아직 바람이 없어요 · 바람은 오후 1시부터 6시 사이에 불어요'); return; } act('gather', 1.2);
  MG5('rhythm', { title: '키질', hint: '바람이 불 때 낟알을 높이 던져 올려요. 가벼운 겨는 날아가고 낟알만 떨어져요.', beats: 16, need: 10 }, () => { C5(S).winnow = 1; G.FX.burst(THRESH5[0], hAt(THRESH5[0], THRESH5[1]) + 1.4, THRESH5[1], 30, { c: [0.95, 0.85, 0.55], sp: 2.4, up: 2.2 }); GG.UI.toast('겨가 바람에 날아가고 낟알만 남았어요'); GG.UI.quest(); }); }
function bag5(S, G) { act('pick', 1); MG5('count', { title: '자루에 담기', hint: '낟알을 자루에 퍼 담아요. 자루 열 개.', need: 10, dur: 14, btn: '담기', unit: '자루' }, () => { C5(S).bag = 1; GG.UI.toast('곡식 열 자루 · 서기 카이에게 가요'); GG.UI.quest(); G.checkStep(); }); }

// ------------------------------------------------------------------ ③ 성읍 곳간 · 직접 공들여 (41:48)
const BUILD5 = [ /* [what to do, where ('site' | 'stone' | 'brick'), minigame, options, wait (null | 'day' | 'dry')] */
  ['다짐판으로 터 다지기', 'site', 'rhythm', { title: '터 다지기', hint: '물을 뿌린 흙을 나무 다짐판으로 쿵, 쿵. 박자에 맞춰 단단히 다져요.', beats: 14, need: 9 }],
  ['기초 돌 놓기', 'stone', null, null],
  ['진흙과 짚 밟아 섞기 (우니의 벽돌터)', 'brick', 'wrestle', { title: '진흙 밟기', hint: '「진흙 둘에 짚 하나.」 발로 꼭꼭 밟아 고루 섞어요.', need: 7, dur: 14, btn: '밟기', unit: '번' }],
  ['벽돌 틀에 찍기', 'brick', 'count', { title: '벽돌 찍기', hint: '나무 틀에 진흙을 꾹 채우고 들어 올려요. 열두 장.', need: 12, dur: 16, btn: '찍기', unit: '장' }, 'dry'],
  ['마른 벽돌 수레에 싣기', 'brick', 'balance', { title: '벽돌 싣기', hint: '마른 벽돌을 수레에 차곡차곡. 한쪽으로 기울지 않게 가운데를 지켜요.', dur: 9 }],
  ['첫째 켜 · 줄 맞춰 벽돌 놓기', 'site', 'count', { title: '첫째 켜', hint: '줄을 따라 벽돌을 한 장씩 놓아요.', need: 10, dur: 14, btn: '놓기', unit: '장' }, 'day'],
  ['둘째 켜 · 진흙 반죽 바르기', 'site', 'rhythm', { title: '둘째 켜', hint: '벽돌 사이에 진흙 반죽을 박자에 맞춰 발라요.', beats: 14, need: 9 }, 'day'],
  ['셋째 켜 · 나무 발판 세우기', 'site', 'push', { title: '셋째 켜', hint: '벽이 가슴 높이를 넘었어요. 일꾼들과 나무 발판을 밀어 세워요.', need: 7, dur: 14, btn: '밀기', unit: '번' }, 'day'],
  ['넷째 켜 · 벽돌 올려 주기', 'site', 'balance', { title: '넷째 켜', hint: '발판 위로 벽돌 바구니를 올려요. 기울지 않게.', dur: 9 }, 'day'],
  ['다섯째 켜 · 다림줄로 곧은지 보기', 'site', 'count', { title: '다섯째 켜', hint: '다림줄을 대고 벽이 곧은지 한 군데씩 살펴요.', need: 8, dur: 12, btn: '살피기', unit: '군데' }, 'day'],
  ['위 구멍과 아래 문 달기 (목수와 함께)', 'site', 'push', { title: '문 달기', hint: '목수와 함께 나무 문을 문틀에 밀어 맞추고 빗장을 걸어요.', need: 6, dur: 12, btn: '밀기', unit: '번' }],
  ['둥근 지붕 올리기 (발판 위에서)', 'site', 'balance', { title: '둥근 지붕', hint: '벽돌을 안쪽으로 조금씩 들여 쌓아 둥글게 닫아요. 발판 위에서 흔들리지 않게.', dur: 10 }, 'day'],
  ['석회 회칠', 'site', 'rhythm', { title: '회칠', hint: '쥐와 습기를 막는 하얀 석회를 박자에 맞춰 발라요.', beats: 16, need: 10 }],
  ['사다리를 올라 첫 곡식 붓기', 'site', 'balance', { title: '첫 곡식', hint: '곳간 몫 두 자루를 지고 사다리를 올라요. 꼭대기 구멍에 부어요.', dur: 9 }]];
/* how far the granary model has risen after each of these (s.work = 9; the last fills it: built) */
const RISE5 = [1, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 9];
const W5 = ['일꾼 메리', '일꾼 세티', '일꾼 아메']; const WK5 = [[-3.6, 4.2, 'swing'], [3.8, 4.4, 'gather'], [5.8, -1.2, 'pick']];
function workers5(on) { const G = Gm(), s = GR5('granA'); WK5.forEach(([dx, dz, a], i) => { const id = 'gw5_' + i; if (on) { if (!G.npc(id)) G.spawnNPC({ id, name: W5[i], look: i === 1 ? LOOK.farmerThin : LOOK.farmer, x: s.x + dx, z: s.z + dz, face: Math.atan2(-dx, -dz), noTalk: true, noTag: true, noBond: true, act: a }); }
  else if (G.npc(id)) G.removeNPC(id); }); }
function buildStage5(S) { return C5(S).b || 0; }
function waitLeft5(S) { const c = C5(S), st = BUILD5[c.b || 0]; if (!st) return 0; if (c.dryUntil && S.day < c.dryUntil) return c.dryUntil - S.day; if (c.lastDay !== undefined && c.lastWait === 'day' && S.day <= c.lastDay) return 1; return 0; } /* (after a day's course the mud sets overnight, whatever comes next) */
CH5.c5_build = { ch: 6, obj: S => { const c = C5(S), b = c.b || 0, st = BUILD5[b], w = waitLeft5(S); if (!st) return '성읍 곳간 다 지음';
    if (b === 1) return (c.stones || 0) < 2 ? `기초 돌 놓기 (${c.stones || 0}/2) · 돌무더기에서 들어 터로` : '큰 기초 돌 둘 · 일꾼들과 굴림대로 굴려 오기'; if (w) return (c.dryUntil && S.day < c.dryUntil ? `벽돌이 볕에 마르는 중 · ${w}일 남음` : '진흙이 굳기를 기다리기 · 내일 아침') + ' (곁이야기를 해도 돼요)'; return '성읍 곳간 짓기 · ' + st[0]; },
  list: S => { const b = C5(S).b || 0; return BUILD5.map((s, i) => ({ t: s[0], ok: b > i })); },
  enter(S, G, re) { const s = GR5('granA'); s.work = 9; if (S.built.granA && !(C5(S).b >= BUILD5.length)) { C5(S).b = BUILD5.length; setTimeout(() => G.checkStep(), 60); return; } /* (an old save that already raised it with the brick puzzles) */ workers5(true); if (!S.siteWork || !S.siteWork.granA) { S.siteWork = S.siteWork || {}; if (!S.built.granA) { S.siteWork.granA = { opt: { shape: 'dome', finish: 'white', band: 'blue' }, n: 0 }; G.buildSiteMeshes && G.buildSiteMeshes(); } }
    if (!re) narr([{ kick: '성읍 곳간 · 공들여 짓기', title: '열흘의 일', t: '곳간은 하루에 다 지을 수 없어요. 벽돌은 볕에 사흘 말려야 하고, 벽은 하루에 한 켜씩 쌓아 진흙이 굳어야 해요. 기다리는 동안에는 곁이야기를 하러 다녀와도 돼요.', ref: '' }]); },
  target: S => { const c = C5(S), b = c.b || 0, st = BUILD5[b], s = GR5('granA'); if (!st || waitLeft5(S)) return null; if (st[1] === 'brick') return { x: BRICK5[0], z: BRICK5[1] };
    if (st[1] === 'stone') return S.q.c5carry ? { x: s.x, z: s.z + 3.2 } : { x: STONE5[0], z: STONE5[1] }; return { x: s.x, z: s.z + 3.6 }; },
  check: S => (C5(S).b || 0) >= BUILD5.length,
  done(S, G, next) { twoGranaries5(S, G, next); }, next: 'c5_manasseh' };
function doBuild5(S, G) { const c = C5(S), b = c.b || 0, st = BUILD5[b]; if (!st || waitLeft5(S)) return;
  const fin = () => { const n = RISE5[b], s = GR5('granA'); s.work = 9; /* (ep_joseph_life.js sets every granary to 4 stages) */ if (n && S.siteWork && S.siteWork.granA && S.siteWork.granA.n < n) { S.siteWork.granA.n = n - 1; G.siteWork(s); } /* (the model rises · the last completes the granary) */
    c.b = b + 1; if (st[4] === 'dry') { c.dryUntil = S.day + 3; } if (st[4] === 'day') { c.lastDay = S.day; c.lastWait = 'day'; } else c.lastWait = null;
    const sayL = { 2: [N('brick', '좋습니다, 총리님. 이제 틀에 찍어 볕에 내놓지요.')], 3: [N('brick', '이제 볕에 사흘입니다. 서두르면 갈라집니다.')], 5: [N('overseerC', '첫 켜가 반듯합니다! 진흙이 굳으면 내일 둘째 켜를 올리지요.', '', 'happy')], 10: [N('gw5_1', '문틀이 반듯해야 빗장이 맞습니다. 됐습니다!')], 12: [N('overseerC', '하얀 곳간이 섰습니다, 총리님!', '', 'happy')] }[b];
    GG.UI.toast(b === BUILD5.length - 1 ? '첫 곡식이 곳간에 들어갔어요' : st[4] === 'dry' ? '벽돌을 볕에 내놓았어요 · 사흘 뒤에 나를 수 있어요' : st[4] === 'day' ? `${st[0].split(' · ')[0]} 끝 · 진흙이 굳으면 내일 다음 켜를 올려요` : '끝났어요');
    const after = () => { GG.UI.quest(); if (b === BUILD5.length - 1) firstGrain5(S, G); else G.checkStep(); }; if (sayL) say(sayL, after); else after(); };
  if (!st[2]) return fin(); act(st[2] === 'rhythm' ? 'gather' : st[2] === 'push' ? 'pick' : 'gather', 1.2, st[1] === 'site' && b >= 5 ? 'hammer' : null); MG5(st[2], st[3], fin); }
function firstGrain5(S, G) { const s = GR5('granA'), h = hAt(s.x, s.z), sc = G.npc('scribeR');
  cine([{ fn: () => { G.teleport(s.x + 1.4, s.z + 3.2, Math.PI); if (sc) G.npcTo('scribeR', s.x - 2.2, s.z + 4.2, 2.6, false); }, cam: [s.x + 6, h + 3.4, s.z + 9], look: [s.x, h + 3, s.z], dur: 6, t: '곳간 몫 두 자루가 꼭대기 구멍으로 쏟아져 들어갔습니다. 왕궁 서기관이 곳간 장부에 첫 줄을 적었습니다.' }], () => G.checkStep()); }
/* the other two granaries: the same work in the same order, seen from Joseph's wagon (no words) */
function twoGranaries5(S, G, next) { const b = GR5('granB'), c = GR5('granC'), hb = hAt(b.x, b.z), hc = hAt(c.x, c.z); const fin = id => { const s = GR5(id); if (S.built[id]) return; S.siteWork = S.siteWork || {}; S.siteWork[id] = { opt: { shape: 'dome', finish: id === 'granB' ? 'ochre' : 'white', band: id === 'granB' ? 'red' : 'green' }, n: (s.work || 9) - 1 }; G.siteWork(s); };
  workers5(false);
  cine([{ cam: [b.x + 12, hb + 6, b.z + 12], cam2: [b.x + 9, hb + 5, b.z + 9], look: [b.x, hb + 1.5, b.z], dur: 6, music: 'j_plenty', t: '서쪽 마을에서도 일꾼들이 같은 차례로 곳간을 지었습니다. 터를 다지고, 벽돌을 말리고, 하루에 한 켜씩.' },
    { fn: () => fin('granB'), cam: [b.x + 8, hb + 4, b.z + 10], look: [b.x, hb + 2.4, b.z], dur: 5, t: '서쪽 마을 곳간이 섰습니다.' },
    { cam: [c.x + 12, hc + 6, c.z - 12], cam2: [c.x + 9, hc + 5, c.z - 9], look: [c.x, hc + 1.5, c.z], dur: 6, t: '남쪽 마을의 곳간은 강물이 닿지 않는 언덕 위에 섰습니다.' },
    { fn: () => fin('granC'), cam: [c.x + 8, hc + 4, c.z - 10], look: [c.x, hc + 2.4, c.z], dur: 5, t: '이렇게 곳간 셋이 섰습니다.', ref: '창세기 41:48' }], () => { GG.Game.musicOverride = null; next(); }); }

// ------------------------------------------------------------------ ④ ⑥ two sons (41:50–52) · only the Bible's words
function birthScene(S, G, which) { /* v18.77 (redeclared: no made-up words of Asenath's, no look east, no toddling Manasseh) */
  const ax = 7.6, az = -137.4, h = hAt(ax, az);
  if (which === 'manasseh') cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 19.6, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 7, music: 'j_night',
      t: '흉년이 들기 전에 요셉에게 두 아들이 나되, 곧 온 제사장 보디베라의 딸 아스낫이 그에게서 낳은지라.', ref: '창세기 41:50' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 므낫세라 하리라. 하나님이 나로 내 모든 고난과 나의 아비의 온 집 일을 잊어버리게 하셨다.', ref: '창세기 41:51', e: 'tender', fadeOut: 1.4 },
  ], () => { S.q.born1 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.newDay('풍년 둘째 해'); G.go('c5_haul'); });
  else cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = GG.Game.clockTo(S, 18.4, 0); }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 6, music: 'j_hope', t: '아스낫이 둘째 아들을 낳았습니다.', ref: '창세기 41:50' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '이 아이의 이름을 에브라임이라 하리라. 하나님이 나로 수고한 땅에서 번성하게 하셨다.', ref: '창세기 41:52', e: 'happy', fadeOut: 1.4 },
  ], () => { S.q.born2 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.go('c5_count'); });
}

// ------------------------------------------------------------------ ⑤ year by year (41:48): the second harvest to the west and south granaries
CH5.c5_haul = { ch: 6, obj: S => { const c = C5(S); return !c.load ? '성읍 곳간 앞 · 곡식 자루를 수레에 싣기' : !c.hB ? '수레를 몰고 서쪽 마을 곳간으로 (북쪽 나루 건너)' : !c.hC ? '수레를 몰고 남쪽 마을 곳간으로 (남쪽 나루 건너)' : '곳간 셋에 다 부었어요'; },
  list: S => { const c = C5(S); return [{ t: '성읍 곳간 앞에서 곡식 자루 싣기', ok: !!c.load }, { t: '서쪽 마을 곳간에 붓기', ok: !!c.hB }, { t: '남쪽 마을 곳간에 붓기', ok: !!c.hC }]; },
  enter(S, G, re) { if (!re) narr([{ kick: '풍년 둘째 해', title: '해마다 쌓기', t: '해마다 각 성 주위 밭의 곡물을 그 성의 곳간에 쌓았어요. 올해는 요셉이 몸소 버금 수레에 자루를 싣고 서쪽과 남쪽 곳간까지 가요.', ref: '창세기 41:48' }]); },
  target: S => { const c = C5(S), g = id => { const s = GR5(id); return { x: s.x, z: s.z + 4 }; }; return !c.load ? g('granA') : !c.hB ? g('granB') : !c.hC ? g('granC') : null; },
  check: S => { const c = C5(S); return !!(c.load && c.hB && c.hC); },
  done(S, G, next) { narr([{ kick: '풍년 둘째 해', title: '곳간마다', t: '세 곳간에 곡식 자루가 쌓여 갔습니다.', ref: '' }], next); }, next: 'c5_ephraim' };
const cartNear5 = (x, z, r) => { const G = Gm(), S = G.S(), cp = S.q.riding ? { x: G.P.x, z: G.P.z } : GG.Cart && GG.Cart.rearPos && GG.Cart.rearPos(); return !!cp && Math.hypot(cp.x - x, cp.z - z) < (r || 16); }; /* (riding: the wagon is where Joseph is) */
function haul5(S, G, k) { const c = C5(S), s = GR5(k === 'load' ? 'granA' : k === 'hB' ? 'granB' : 'granC');
  if (k !== 'load' && !cartNear5(s.x, s.z)) { GG.UI.toast('곡식 자루를 실은 버금 수레를 곳간 앞까지 몰고 와요'); return; }
  if (k === 'load' && !cartNear5(s.x, s.z, 20)) { GG.UI.toast('버금 수레를 곳간 앞에 대 놓고 실어요 (왼쪽 「수레 부르기」)'); return; }
  act('pick', 1); MG5(k === 'load' ? 'balance' : 'count', k === 'load' ? { title: '자루 싣기', hint: '자루를 수레 짐칸에 고르게. 기울지 않게.', dur: 8 } : { title: '곡식 붓기', hint: '자루를 하나씩 풀어 곳간 구멍에 부어요.', need: 6, dur: 12, btn: '붓기', unit: '자루' }, () => {
    c[k] = 1; G.FX.burst(s.x, hAt(s.x, s.z) + 2, s.z, 24, { c: [0.95, 0.85, 0.55], sp: 1.6, up: 2 }); GG.UI.toast(k === 'load' ? '곡식 자루를 실었어요 · 서쪽 마을 곳간으로' : k === 'hB' ? '서쪽 곳간에 부었어요 · 이제 남쪽 마을로' : '남쪽 곳간에도 부었어요'); GG.UI.quest(); G.checkStep(); }); }

// ------------------------------------------------------------------ ⑦ 「세기를 그쳤더라」 (41:49)
CH5.c5_count = { ch: 6, obj: S => '성읍 곳간에서 서기관과 곡식 세기', list: S => [{ t: '곳간의 곡식 세기', ok: !!C5(S).counted }],
  enter(S, G, re) { if (!re) narr([{ kick: '풍년 여섯째 해', title: '곳간마다 가득', t: '해마다 곡식이 들어왔어요. 성읍 곳간 앞에서 왕궁 서기관이 장부를 펴고 기다려요.', ref: '' }]); },
  target: S => { const s = GR5('granA'); return { x: s.x, z: s.z + 4 }; }, check: S => !!C5(S).counted,
  done(S, G, next) { next(); }, next: 'c5_years' };
function count5(S, G) { const s = GR5('granA'), h = hAt(s.x, s.z); act('pick', 1);
  MG5('count', { title: '곡식 세기', hint: '서기관이 부르는 대로 자루를 세어요.', need: 12, dur: 14, btn: '하나', unit: '자루' }, () => {
    say([T('열둘, 스물넷, 백… 서기관의 장부가 금세 가득 찼어요.'), T('그날 들어온 수레가 또 줄지어 섰어요.')], () => {
      MG5('count', { title: '곡식 세기 · 또', hint: '수레가 끝없이 들어와요. 계속 세어요.', need: 16, dur: 14, btn: '하나', unit: '자루' }, () => {
        cine([{ cam: [s.x + 10, h + 5, s.z + 12], cam2: [s.x + 16, h + 9, s.z + 18], look: [s.x, h + 2, s.z], dur: 8, t: '요셉이 곡식을 저축하였으되 바다 모래 같이 심히 많아서 셀 수 없으므로 세기를 그쳤더라.', ref: '창세기 41:49' }], () => { C5(S).counted = 1; GG.UI.quest(); G.checkStep(); }); }); }); }); }

// ------------------------------------------------------------------ ⑧ the end of the plenty (41:53–54) · the old montage without its made-up line
function plentyMontage(S, G) { /* v18.77 (redeclared) */ const gs = sites.map(s => [s.x, s.z, hAt(s.x, s.z)]);
  cine([
    { fn: () => { LAND = 'plenty'; G.W().recolor(color); RT.sacks = 3; }, cam: [gs[0][0] + 12, gs[0][2] + 7, gs[0][1] + 10], cam2: [gs[0][0] + 8, gs[0][2] + 4, gs[0][1] + 7], look: [gs[0][0], gs[0][2] + 1.5, gs[0][1]], dur: 7, music: 'j_plenty', title: '풍년 일곱째 해', sub: '', t: '칠 년 풍년에 토지 소산이 심히 많은지라.', ref: '창세기 41:47' },
    { fn: () => { LAND = 'famine'; G.W().recolor(color); }, hour: 13, cam: [-50, 16, 40], cam2: [-70, 20, 10], look: [-100, 1, 40], look2: [-110, 1, 0], dur: 9, music: 'j_famine', sfx: 'wind',
      t: '애굽 땅에 칠 년 풍년이 그치고, 요셉의 말과 같이 칠 년 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 식물이 있더니', ref: '창세기 41:53–54', fadeOut: 1.6 },
    { black: true, title: '6장 · 일곱 해 흉년', sub: '창세기 41:53–42:9', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4 },
  ], () => { GG.Game.musicOverride = null; S.day += 7 * 360; G.go('c6_dry'); });
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^c5_/.test(S.step || '')) return null; const st = S.step, c = C5(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'c5_patrol') { const m = c.meas || (c.meas = {}); SITE5.forEach(([k, id, n]) => { if (m[k]) return; const s = GR5(id); if (k === 'A' && !qd(S, 'metC')) return; if (k === 'B' && !qd(S, 'metW')) return; if (k === 'C' && !qd(S, 'metS')) return;
      at(s.x, s.z + 3.4, 4.2, { label: `${n} 곳간 터 재기 · 줄을 따라 걸음 세기`, key: 'c5Meas' + k, use: () => MG5('count', { title: '터 재기', hint: '말뚝과 줄을 따라 걸으며 걸음을 세어요. 가로 열 걸음.', need: 10, dur: 12, btn: '한 걸음', unit: '걸음' }, () => { m[k] = 1; say([T(`${n} 곳간 터 · 가로 열 걸음, 세로 여섯 걸음. 말뚝과 줄이 반듯해요.`)], () => { GG.UI.quest(); G.checkStep(); }); }) }); }); }
  if (st === 'c5_farm') { const F = field5();
    if ((c.plow || 0) < 2) { const j = ROWS5[c.plow || 0], [x, z] = rowPos5(j); at(x, z, F.cols * F.ts / 2 + 2, { label: `소와 쟁기로 이랑 갈기 (${(c.plow || 0) + 1}/2)`, key: 'c5Plow', use: () => plow5(S, G, j) }); }
    else if ((c.sow || 0) < 2) { const j = ROWS5[c.sow || 0], [x, z] = rowPos5(j); at(x, z, F.cols * F.ts / 2 + 2, { label: `밀 씨 뿌리기 (${(c.sow || 0) + 1}/2)`, key: 'c5Sow', use: () => sow5(S, G, j) }); }
    else if (!c.harvest) { /* the real harvest: the plots themselves (sickle) */ }
    else if (!c.bind) { const [x, z] = rowPos5(0.5); at(x, z, 9, { label: '거둔 밀 단 묶기', key: 'c5Bind', use: () => bind5(S, G) }); }
    else { const [x, z] = THRESH5; if (!c.thresh) at(x, z, 4, { label: '타작마당 · 소가 밟아 이삭 떨기', key: 'c5Thr', use: () => thresh5(S, G) }); else if (!c.winnow) at(x, z, 4, { label: hr5(S) >= 13 && hr5(S) < 18.5 ? '키질하기 · 바람이 불어요' : '키질하기 · 바람 기다리기 (오후)', key: 'c5Win', use: () => winnow5(S, G) }); else if (!c.bag) at(x, z, 4, { label: '자루에 담기', key: 'c5Bag', use: () => bag5(S, G) }); } }
  if (st === 'c5_build') { const b = c.b || 0, bs = BUILD5[b], s = GR5('granA'); if (bs && !waitLeft5(S)) {
      if (bs[1] === 'brick') at(BRICK5[0], BRICK5[1], 3.6, { label: bs[0], key: 'c5B' + b, use: () => doBuild5(S, G) });
      else if (bs[1] === 'stone' && (c.stones || 0) >= 2) at(STONE5[0], STONE5[1], 3.2, { label: '큰 기초 돌 둘 · 굴림대로 굴려 오기', key: 'c5Roll', use: () => roll5(S, G) }); /* v18.80 two by hand, the two big ones on rollers with the workers (not four of the same) */
      else if (bs[1] === 'stone') { if (!S.q.c5carry) at(STONE5[0], STONE5[1], 2.8, { label: `기초 돌 들기 (${(c.stones || 0) + 1}/2)`, key: 'c5St', use: () => { S.q.c5carry = 1; p.carry = 'stone'; act('pick', 0.8); G.sfx('thud', { vol: 0.4 }); } });
        else at(s.x, s.z + 3.2, 3.6, { label: `기초 돌 놓기 (${(c.stones || 0) + 1}/2)`, key: 'c5Put', use: () => { S.q.c5carry = 0; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.6 }); c.stones = (c.stones || 0) + 1; GG.UI.quest(); if (c.stones === 2) GG.UI.toast('남은 둘은 너무 커요 · 일꾼들과 굴림대로 굴려요'); if (c.stones >= 4) doBuild5(S, G); } }); }
      else at(s.x, s.z + 3.6, 4.4, { label: bs[0], key: 'c5B' + b, use: () => doBuild5(S, G) }); } }
  if (st === 'c5_haul') { if (!c.load) { const s = GR5('granA'); at(s.x, s.z + 4, 6, { label: '곡식 자루를 수레에 싣기', key: 'c5Load', use: () => haul5(S, G, 'load') }); }
    else for (const [k, id] of [['hB', 'granB'], ['hC', 'granC']]) { if (c[k] || (k === 'hC' && !c.hB)) continue; const s = GR5(id); at(s.x, s.z + 4, 7, { label: '곳간에 곡식 붓기', key: 'c5' + k, use: () => haul5(S, G, k) }); } }
  if (st === 'c5_count' && !c.counted) { const s = GR5('granA'); at(s.x, s.z + 4, 5, { label: '서기관과 곳간 곡식 세기', key: 'c5Cnt', use: () => count5(S, G) }); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ every frame
function ch5Tick(dt, S) { if (!S || !/^c5_/.test(S.step || '')) return; try { const G = Gm(), c = C5(S);
    if (S.step === 'c5_farm') { const k = G.npc('kaiClerk'); if (k && Math.hypot(k.x - (THRESH5[0] - 1.6), k.z - (THRESH5[1] + 4.4)) > 1.5 && !k.walk && !k.talking) G.npcTo('kaiClerk', THRESH5[0] - 1.6, THRESH5[1] + 4.4, 2.6, false); }
    if (S.step === 'c5_farm' && !c.harvest && (c.sow || 0) >= 2 && !c.crew && growing5(S) > 0 && growing5(S) <= plots5().length - 4) { c.crew = 1; for (const k of plots5()) { const q = S.plots[k]; if (q && q.s === 2 && q.c === 'wheat') delete S.plots[k]; } G.ENT.plotsDirty = true; GG.UI.toast('곁의 일꾼들이 남은 밀을 함께 다 베었어요'); } /* v18.80 Joseph reaps four plots, the workers the rest */
    if (S.step === 'c5_farm' && !c.harvest && (c.sow || 0) >= 2 && growing5(S) === 0) { c.harvest = 1; GG.UI.toast('밀을 다 거두었어요 · 단을 묶어요'); GG.UI.quest(); }
    if (S.step === 'c5_build') { if (c.dryUntil && S.day >= c.dryUntil && !c.dryTold) { c.dryTold = 1; GG.UI.toast('벽돌이 다 말랐어요 · 우니의 벽돌터로'); GG.UI.quest(); }
      if (!G.npc('gw5_0')) workers5(true); }
    if (c.lastWait === 'day' && S.day > (c.lastDay || 0) && c.toldDay !== S.day) { c.toldDay = S.day; if (S.step === 'c5_build') { GG.UI.toast('진흙이 다 굳었어요 · 다음 켜를 올려요'); GG.UI.quest(); } }
  } catch (e) { console.error('ch5', e); } }
function ch5Build(W, P) { try { const [tx, tz] = THRESH5, [sx, sz] = STONE5, [bx, bz] = BRICK5;
    P((g, M) => { g.cyl(3.4, 3.5, 0.1, 22, { m: M, at: [0, 0.05, 0], c: 0xc8a878, j: 0.02 }); for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.box(0.5, 0.18, 0.32, { m: M, at: [Math.cos(a) * 3.55, 0.09, Math.sin(a) * 3.55], ry: -a, c: 0x9a8a72, j: 0.06 }); } }, tx, tz, { col: null }); /* the threshing floor: beaten earth ringed with stones */
    P('bales', tx + 4.6, tz - 2.4, { ry: 0.4, col: { r: 0.9, h: 1 } }); P('jars', tx - 4.4, tz + 1.8, { args: [3], col: { w: 2, d: 0.6, h: 1 } });
    P((g, M) => { for (let k = 0; k < 9; k++) g.sph(0.32 + (k % 3) * 0.06, 6, 4, { m: M, at: [(k % 3 - 1) * 0.7, 0.22 + Math.floor(k / 3) * 0.32, (Math.floor(k / 3) - 1) * 0.5], s: [1.3, 0.7, 1], c: 0xa89a84, flat: true, j: 0.08 }); }, sx, sz, { col: { r: 1, h: 1 } }); /* foundation stones */
    P((g, M) => { for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) g.box(0.36, 0.12, 0.18, { m: M, at: [-1 + k * 0.42, 0.06, -0.8 + r * 0.5], c: 0xb07a4a, j: 0.05 }); g.box(0.5, 0.14, 0.3, { m: M, at: [1.6, 0.07, 0.6], c: 0x7a5a3a }); }, bx, bz, { col: null }); /* bricks drying in rows · a mould */
  } catch (e) { console.error('ch5Build', e); } }

// ------------------------------------------------------------------ put the steps in order (the old c5_year1 / c5_year2 stay only for old saves)
CH5.c5_manasseh = Object.assign({}, steps.c5_manasseh, { next: 'c5_haul' });
CH5.c5_ephraim = Object.assign({}, steps.c5_ephraim, { next: 'c5_count' });
steps.c5_year1 = Object.assign({}, steps.c5_year1, { obj: '풍년 첫해', enter(S, G, re) { setTimeout(() => G.go('c5_farm'), 60); } }); /* (an old save: on to the new chapter) */
steps.c5_year2 = Object.assign({}, steps.c5_year2, { obj: '풍년 둘째 해', enter(S, G, re) { setTimeout(() => G.go('c5_haul'), 60); } });
{ const keys = Object.keys(steps), cut = keys.indexOf('c5_patrol'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c5_year1 = tail.find(t => t[0] === 'c5_year1')[1]; steps.c5_farm = CH5.c5_farm; steps.c5_build = CH5.c5_build; steps.c5_manasseh = CH5.c5_manasseh;
  steps.c5_year2 = tail.find(t => t[0] === 'c5_year2')[1]; steps.c5_haul = CH5.c5_haul; steps.c5_ephraim = CH5.c5_ephraim; steps.c5_count = CH5.c5_count;
  for (const [k, v] of tail) { if (/^c5_(year1|year2|manasseh|ephraim)$/.test(k)) continue; steps[k] = v; }
  ORDER = Object.keys(steps); }
{ const d = npcs.find(n => n.id === 'kaiClerk'); if (d) { const sh0 = d.show; d.show = S => S.step === 'c5_farm' || sh0(S); } } /* Kai keeps the ledger at the threshing floor in the first harvest */
/* the granaries are raised by the story now (no brick puzzles in chapter 5) */
for (const id of ['granA', 'granB', 'granC']) { const s = sites.find(q => q.id === id); if (!s) continue; const r0 = s.r; Object.defineProperty(s, 'r', { configurable: true, get: () => { const S = Gm().S(); return S && between(S, 'c5_patrol', 'c5_years') ? 0.001 : (r0 || 4); } }); if (id === 'granA') s.work = 9; } /* (the site is still drawn as it rises: only its old 「짓기」 button is out of reach) */

/* v18.80 the two big foundation stones: up on wooden rollers, the workers pull the ropes, Joseph pushes from behind (one hands-on go, a different one from carrying) */
function roll5(S, G) { const c = C5(S); GG.UI.minigame('push', { title: '굴림대로 큰 돌 옮기기', hint: '일꾼들이 줄을 당길 때 꾹 눌러 뒤에서 밀어요. 숨이 차면 잠깐 쉬고, 뒤로 빠진 굴림대는 앞으로 옮겨 놓아요.', btn: '밀기' }, ok => { if (!ok) { GG.UI.toast('돌이 굴림대에서 미끄러졌어요 · 다시 밀어요'); return; }
  c.stones = 4; G.sfx('thud', { vol: 0.8 }); GG.UI.quest(); say([T('통나무 굴림대 위로 큰 돌 둘이 굴러 터에 놓였어요. 일꾼들이 손뼉을 쳤어요.')], () => doBuild5(S, G)); }); }
