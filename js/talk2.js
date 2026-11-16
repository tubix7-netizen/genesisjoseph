/* 약속의 길 — v18.60 사이드 퀘스트 · 사람과의 대화 손질 (talk2.js)
   · 대화의 규칙: 말을 걸면 처음엔 많아야 세 갈래예요. ① 그 사람과 진행할 부탁·이야기(있을 때만) ② 「이야기 나누기」 ③ 「작별 인사」.
     「이야기 나누기」 안에서는 한 번에 두 가지 화제만 보이고, 하나를 이야기하면 그다음 화제가 열려요(선물, 식사, 함께 걷기, 소식 …).
     어디서든 빠져나갈 길(작별 / 그만 이야기하기)은 늘 있어요.
   · G.Talk.flow(o): 그 「화제가 열리는」 대화를 그려요.
       o = { topics: [{ k, t, when?(), run(next), again? }], exit: { t, then? }, prompt?: line | (n남은 화제) => line, max?: 2 }
       run(next)에서 next()를 부르면 다시 화제 고르기로 돌아와요(부르지 않으면 대화가 그 일로 이어져요 · 식사, 놀이 …).
   · 말 걸기 길 고침: 게임은 A 버튼으로 말을 걸 때 Game.talkTo의 감싸기를 거치지 않고 바로 G.Life.talk로 와요.
     그래서 Game.talkTo를 감싸 두었던 「사다리의 세 천사」(꿈의 세계)는 이야기가 이어지지 않았어요. 여기 G.Life.talk에서 받아요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP) return;
const S = () => Game.S();
const T = G.Talk = {};
const label = x => typeof x === 'function' ? x() : x;
T.flow = function (o) { const used = o.used || (o.used = {});
  const av = o.topics.filter(x => !used[x.k || label(x.t)] && (!x.when || x.when()));
  const show = av.slice(0, o.max || 2);
  const ch = show.map(x => ({ t: label(x.t), then: () => { if (!x.again) used[x.k || label(x.t)] = 1; x.run(() => setTimeout(() => T.flow(o), 30)); } }));
  ch.push({ t: label(o.exit.t), then: () => { if (o.exit.then) o.exit.then(); } });
  const pr = typeof o.prompt === 'function' ? o.prompt(av.length) : o.prompt;
  const line = Object.assign({ n: Game.EP().hero, t: av.length ? '(또 무슨 이야기를 할까?)' : '(이야기를 충분히 나눴다.)' }, pr || {}, { choices: ch });
  G.UI.say([line], null); };
/* a line in someone's voice when they have nothing more planned */
T.more = (n, id) => { const C = G.Cast && G.Cast.of && G.Cast.of(id || n.id); return C && C.more ? { n: n.name, t: C.more } : null; };
/* a menu of at most three: the person's own business first (if any), 「이야기 나누기」, a way out */
T.top = function (lines, o) { const ch = [].concat(o.act ? [o.act] : [], o.chat ? [{ t: o.chatT || '이야기 나누기', then: o.chat }] : [], [{ t: o.byeT || '떠나기', then: () => { if (o.bye) o.bye(); } }]);
  const ls = lines.slice(); const last = ls[ls.length - 1]; ls[ls.length - 1] = Object.assign({}, last, { choices: ch }); G.UI.say(ls, null); };

// ------------------------------------------------------------------ the three angels of the ladder (꿈의 세계 · 「사다리의 세 천사」)
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S();
    if (/^dAngel[34]$/.test(id) && s && s.side && s.side.act && s.side.act.d_angels) { const A = s.flags.dAng || (s.flags.dAng = {});
      if (!A[id]) { A[id] = 1; const n = Game.npc(id), fin = () => { if (n) n.talking = false; };
        const L = { dAngel3: ['나는 땅의 기도를 가지고 하늘로 올라가는 길이란다.', '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며」 그 약속은 애굽에서도 끝나지 않았단다.'],
          dAngel4: ['나는 하늘의 말씀을 가지고 내려오는 길이란다.', '「나를 이리로 보낸 이는 당신들이 아니요 하나님이시라.」 네가 형들에게 한 그 말이 하늘에서도 들렸단다.'] }[id];
        const left = 2 - Object.keys(A).length;
        G.UI.say(L.map(t => ({ n: n ? n.name : '천사', t })).concat([{ n: '', t: left > 0 ? '(다른 천사에게도 말을 걸어 보아요.)' : '(사다리를 지키는 천사에게 돌아가 이야기해요.)' }]), () => { G.UI.quest && G.UI.quest(); fin(); }); return true; } }
    return lt0.apply(this, arguments); }; }
})(window.G);
