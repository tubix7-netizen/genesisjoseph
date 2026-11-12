/* 약속의 길 — 플레이 중 감정 (v17.7, 엔진·연출 업그레이드 문서의 P4 중 주인공 부분).
   Until now the hero only played an emotion inside cutscenes and dialogue (shot.e), plus 「tired」 and 「cold」 when standing still. G.Mood adds two more that
   come from the game itself, with the same body/face acting (motion.js ACTING):
   · fear  — a hostile beast that is hunting is close: rises fast (about 0.2 s), fades slowly (about 1.2 s); stronger the closer it is
   · weary — health very low, or starving: rises and fades slowly
   While moving, fighting or dodging the emotion is only a light touch (the legs and arms belong to the walk or the weapon), standing it is strong.
   Mood.hero(dt) returns [emotion, strength] or null; game.js render() uses it when no cutscene line owns the feeling. Turn it off with ?mood=0. */
'use strict';
(function (G) {
const Game = G.Game, M = G.Mood = { fear: 0, weary: 0, near: 99, on: !/[?&]mood=0\b/.test(location.search) };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const HUNTING = { windup: 1, attack: 1, chase: 1, stalk: 1, hunt: 1, charge: 1 };
M.hero = function (dt) {
  if (!M.on || Game.cineOn || Game.mode !== 'play') { M.fear = M.weary = 0; return null; }
  const P = Game.P, S = Game.S(); if (!S || P.downed) { M.fear = M.weary = 0; return null; }
  // nearest hostile beast (G.Combat.wild) that is hunting the hero: angry, winding up, attacking or chasing
  let best = 99; const list = G.Combat && G.Combat.wild ? G.Combat.wild() : [];
  for (const n of list) { if (!n.d || !n.near || n.st === 'dead' || n.st === 'gone' || n.st === 'flee') continue;
    if (!(n.d.beh === 'hunt' || n.d.beh === 'charge')) continue; if (!(n.angry || HUNTING[n.st])) continue;
    const d = Math.hypot(n.x - P.x, n.z - P.z); if (d < best) best = d; }
  M.near = best; const fT = best < 4 ? 1 : best < 16 ? 0.15 + 0.85 * (16 - best) / 12 : 0;
  M.fear += (fT - M.fear) * Math.min(1, dt * (fT > M.fear ? 5 : 0.85));
  const H = S.hero, hp = H && H.hpMax ? H.hp / H.hpMax : 1, food = G.Surv && Game.feat && Game.feat('surv') && G.Surv.get ? G.Surv.get().food : 100;
  const wT = hp < 0.35 ? 0.55 + 0.45 * (0.35 - hp) / 0.35 : food < 12 ? 0.6 : 0; M.weary += (wT - M.weary) * Math.min(1, dt * 0.7);
  const busy = P.atk || P.atkPose || P.dodgeT > 0 || P.act, moving = P.spd > 0.5, k = busy ? 0.3 : moving ? 0.4 : 0.9;
  if (M.fear > 0.22) return ['fear', clamp(M.fear, 0, 1) * k];
  if (M.weary > 0.22) return ['weary', clamp(M.weary, 0, 1) * (busy ? 0.3 : moving ? 0.5 : 0.9)];
  return null;
};
})(window.G);
