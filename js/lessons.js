/* 약속의 길 — 배우며 얻는 도구 (v18.55)
   도구를 그냥 주지 않고, 쓰는 법을 알려 주는 부탁을 하면서 얻어요. 요셉이 총리가 된 뒤(5장 「순찰」부터) 마을 사람들이 청해요.
   · 「헤티의 낚시 가르침」 (어부 헤티 · 왕의 도성): 낚싯대를 빌려주며 던지고 감는 법을 알려 줘요 → 한 마리 낚아 보여 주면 「그 낚싯대는 가지시오」.
     (예전에는 5장이 되면 낚싯대가 저절로 생겼어요. 이미 받은 저장은 그대로 써요.)
   · 「이네트의 화덕 땔감」 (빵 굽는 여인 이네트 · 왕의 도성): 손도끼 만드는 법(가지 2 · 돌 3, 모닥불 곁 「만들기」)과 나무 베는 법 → 통나무 셋.
   · 「사부의 돌 깨기」 (벽돌공 사부 · 왕의 도성): 돌망치 만드는 법(통나무 1 · 돌 3)과 큰 바위 깨는 법 → 돌 넷. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, EP = G.EP && G.EP.joseph; if (!Game || !UI || !EP || !G.Life) return;
const after = (S, k) => { const o = Game.stepOrder(); return o.indexOf(S.step) >= o.indexOf(k); };
const vz = S => after(S, 'c5_patrol');
const card = (k, n, d) => { if (UI.featCard) UI.featCard(k, { kick: '쓰는 법', n, ic: 'star', d }); else UI.toast(n + ' · ' + d); };
EP.quests = EP.quests || {};
/* the rod no longer comes by itself with chapter 5 */
if (EP.featAt) delete EP.featAt.fish;
{ const of0 = EP.onFeat; EP.onFeat = function (k, S) { if (k === 'fish') return; return of0 ? of0.apply(this, arguments) : undefined; }; }
Object.assign(EP.quests, {
  l_fish: { giver: 'ct_fish', title: '헤티의 낚시 가르침', main: true, when: S => vz(S) && !S.tools.fishrod,
    offer: ['총리님, 나일 고기 맛을 아시오? 직접 낚은 고기는 더 달다오.', '이 낚싯대를 빌려 드리리다. 물가에 서서 A로 던지고, 찌가 톡톡 건드릴 땐 참고 기다리시오.', '찌가 쑥 들어가면 그때 A! 고기가 도는 반대쪽으로 버티면서 A를 눌러 감으면 되오.'],
    start(S) { S.tools.fishrod = true; UI.hud && UI.hud(); card('fishLesson', '낚싯대 (빌림)', '손 단추로 낚싯대를 들고 물가에서 A로 던져요 · 찌가 쑥 들어가면 A · 고기가 도는 반대쪽으로 스틱을 밀며 A로 감아요'); },
    prog: '물가에서 한 마리만 낚아 보시오. 찌가 쑥 들어갈 때까지 기다리는 게 요령이오.',
    obj: [{ t: '물가에서 물고기 한 마리 낚기', ok: (S, G2, st) => G.Life.fishSince ? G.Life.fishSince(st) >= 1 : (S.stats.fish || 0) > 0 }],
    done: ['허허, 제법이시오! 첫 고기를 그렇게 낚는 사람은 드물다오.', '그 낚싯대는 이제 총리님 것이오. 나일이 늘 넉넉하길!'], reward: { silver: 10, xp: 15 } },
  l_axe: { giver: 'ct_bak', title: '이네트의 화덕 땔감', main: true, when: S => vz(S),
    offer: ['총리님, 화덕 땔감이 다 떨어졌어요. 빵을 구워야 하는데…', '손도끼가 있으면 금방이에요. 가지 둘, 돌 셋을 모아 모닥불 곁에서 「만들기」를 해 보세요.', '그 손도끼로 나무 곁에서 A를 눌러 베면 통나무가 나와요. 세 개만 가져다주세요!'],
    start() { card('axeLesson', '손도끼 만들기', '가지 2 · 돌 3을 모아 모닥불 곁에서 메뉴 → 만들기 → 손도끼 · 손 단추로 들고 나무 곁에서 A로 베어요'); },
    prog: '가지 둘, 돌 셋으로 손도끼를 만들어서 통나무 셋을요!',
    obj: [{ t: '손도끼 만들기 (가지 2 · 돌 3 · 모닥불 곁)', ok: S => !!S.tools.axe }, { t: '통나무 3개 모으기', ok: () => Game.have('wood', 3) }],
    take: { wood: 3 }, done: ['고마워요! 오늘 저녁 빵은 총리님 덕분이에요. 갓 구운 걸 드릴게요.'], reward: { silver: 18, items: { bread: 3 }, xp: 20 } },
  l_hammer: { giver: 'ct_brk', title: '사부의 돌 깨기', main: true, when: S => vz(S),
    offer: ['총리님, 가마 바닥에 깔 돌이 모자라오.', '돌망치를 만들어 보시겠소? 통나무 하나, 돌 셋이면 모닥불 곁에서 만들 수 있소.', '큰 바위 곁에서 A로 내리치면 돌이 떨어져 나오오. 넷만 부탁하오.'],
    start() { card('hammerLesson', '돌망치 만들기', '통나무 1 · 돌 3을 모아 모닥불 곁에서 메뉴 → 만들기 → 돌망치 · 손 단추로 들고 큰 바위 곁에서 A로 깨요'); },
    prog: '통나무 하나에 돌 셋, 돌망치부터 만드시오.',
    obj: [{ t: '돌망치 만들기 (통나무 1 · 돌 3 · 모닥불 곁)', ok: S => !!S.tools.hammer }, { t: '돌 4개 모으기', ok: () => Game.have('stone', 4) }],
    take: { stone: 4 }, done: ['이 돌이면 가마가 단단해지겠소. 고맙소, 총리님!'], reward: { silver: 18, xp: 20 } } });
/* an old save that got the rod by itself keeps it; the lesson simply never comes */
})(window.G);
