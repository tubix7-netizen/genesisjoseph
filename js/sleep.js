/* 약속의 길 — 잠자리의 추위와 더위 (v18.22)
   너무 추운 밤(또는 너무 더운 밤)에 자면 자꾸 깨서 푹 쉬지 못해요: 기력은 반쯤만 차고 정신력도 덜 돌아와요.
   · 모닥불 곁(약 4.5m 안)이나 지붕 아래·집 안에서 자면 괜찮아요 — 모닥불 곁이면 「푹 잤어요」.
   · 자기 전에 따뜻한 음식(추위)·시원한 음식(더위)을 먹어 두어도 괜찮아요. */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || !Game.sleep) return;
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
function judge() { const P = Game.P, Sv = G.Surv, C = G.Climate || {}, hs = Sv && Sv.heatAt ? Sv.heatAt(P.x, P.z) : { heat: 0, roof: 0 }, inside = G.Homes && G.Homes.inside && G.Homes.inside();
  const fire = hs.heat > 8, roof = inside || hs.roof > 0.45;
  const cold = !fire && !roof && !(C.warmT > 0) && ((Sv && Sv.cold - Sv.heat > 8) || C.cold);
  const hot = !(C.coolT > 0) && !roof && (C.hot || 0) > 0.55;
  return { fire, cold, hot }; }
const sleep0 = Game.sleep; Game.sleep = function () { const j = judge(); const r = sleep0.apply(this, arguments);
  setTimeout(() => { const S = Game.S(), P = Game.P, H = S && S.hero; if (!H) return; const cap = (G.Vitals && G.Vitals.cap) || H.stamMax || 140;
    if (j.cold || j.hot) { P.stam = Math.min(P.stam, cap * 0.5); H.mind = Math.min(H.mind || 0, (H.mindMax || 100) * 0.55);
      pop(j.cold ? '추워서 자꾸 깼어요' : '더워서 뒤척였어요', j.cold ? '모닥불 곁이나 따뜻한 음식을 먹고 자요' : '지붕 아래나 시원한 음식을 먹고 자요', j.cold ? 'moon' : 'sun'); }
    else if (j.fire) pop('푹 잤어요', '모닥불 곁이라 따뜻했어요', 'star'); }, 1400);
  return r; };
})(window.G);
