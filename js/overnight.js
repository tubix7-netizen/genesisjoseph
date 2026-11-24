/* 약속의 길 — v18.93 밤을 넘기는 기다림 (overnight.js · rainfolk.js 다음)
   곁이야기의 「○시까지 기다리기」는 게임 시계가 하루 안(6시 → 30시)에서만 앞으로 가서, 그 시각이 이미 지났으면 기다릴 수 없었어요(「자고 나서 다시 와요」).
   이제 낮의 시각(17시 전)을 기다리는데 그 시각이 지났거나 아직 새벽이면 묻고, 그 자리에서 하룻밤 자고 다음 날 아침 6시부터 이어서 기다려요.
   저녁 · 밤을 기다리는 것은 그대로예요(이미 저녁이면 곧바로 끝나요).
   쓰는 곳: prisonq · houseq · caveq · sagaq · cellq 의 waitAt 맨 앞. */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const O = G.Overnight = {};
/* does a wait that should end at endH (a daytime hour) need a night first? */
O.need = endH => { const s = Game.S(); if (!s || typeof endH !== 'number' || endH >= 17) return false; const h = s.time % 24; return !(h >= 6 && h < endH); };
/* ask, then sleep where he is and go on in the morning */
O.ask = function (then, place) { const s = Game.S(), h = s.time % 24, late = h >= 6;
  G.UI.say([{ n: '', t: late ? '그 시각은 오늘 이미 지났어요. 여기서 하룻밤 자고 내일 이어서 기다릴까요?' : '아직 깊은 밤이에요. 여기서 눈을 붙였다가 아침에 이어서 기다릴까요?',
    choices: [{ t: late ? '여기서 하룻밤 자고 내일 이어서 기다리기' : '눈 붙였다가 아침에 이어서 기다리기', then: () => setTimeout(() => O.sleep(then, place), 30) }, { t: '다음에 하기', then: () => { } }] }], null); };
O.sleep = function (then, place) { const p = Game.P; if (p) p.cpose = { k: 'sitg', t: 0, dur: 90, hold: true };
  G.UI.fade(() => { Game.newDay(place || '그 자리에서 하룻밤을 보냈어요'); }, () => { if (p) p.cpose = null; setTimeout(() => { try { then(); } catch (e) { console.error('overnight', e); } }, 250); }); };
})(window.G);
