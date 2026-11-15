/* 약속의 길 — v18.58 던진 물건 (hurl.js)
   들고 있던 돌 · 항아리 · 단지 · 수박 · 자루를 던져 짐승을 맞히면 피해를 줘요.
   물매와 달리 「겨눠도 맞을지 모르는」 던지기예요: 물건이 짐승에게 닿았을 때 주사위를 굴려요(맞음 / 빗나감).
   · 맞을 확률: 가까울수록 높고(HIT_NEAR), 멀리 날아갈수록 낮아요(HIT_FAR). 큰 짐승은 조금 더 잘 맞아요.
   · 피해: 무게와 날아가는 빠르기에 따라. 둥근 돌이 가장 세고, 바구니는 거의 안 아파요.
   API: G.Hurl.DMG · G.Hurl.chance(body, animal) */
'use strict';
(function (G) {
const Game = G.Game, Ph = G.Phys, C = G.Combat; if (!Game || !Ph || !C || !C.wild || !C.damage) return;
const H = G.Hurl = { DMG: { stone: 12, jar: 8, pot: 5, melon: 5, sack: 9, basket: 2 }, HIT_NEAR: 0.72, HIT_FAR: 0.38 };
const FLY = []; /* bodies in the air after a throw */
H.chance = (b, a) => { const d = Math.hypot(b.x - b.hurl.x0, b.z - b.hurl.z0), k = Math.min(1, d / 7); let p = H.HIT_NEAR + (H.HIT_FAR - H.HIT_NEAR) * k; if (a.d && a.d.big) p += 0.1; if (a.st === 'sleep' || a.sleep) p += 0.15; return Math.max(0.1, Math.min(0.92, p)); };
const th0 = Ph.throwIt; Ph.throwIt = function () { const b = Ph.held; const r = th0.apply(this, arguments); if (b && H.DMG[b.k] !== undefined) { b.hurl = { t: 0, x0: b.x, z0: b.z, seen: [] }; if (!FLY.includes(b)) FLY.push(b); } return r; };
const up0 = Ph.update; Ph.update = function (dt) { const r = up0.apply(this, arguments); if (FLY.length) try { tick(Math.min(dt, 0.1)); } catch (e) { console.error('hurl', e); FLY.length = 0; } return r; };
function tick(dt) {
  for (let i = FLY.length - 1; i >= 0; i--) { const b = FLY[i], h = b.hurl; if (!h || b.gone) { FLY.splice(i, 1); continue; } h.t += dt; const sp = Math.hypot(b.vx, b.vy, b.vz);
    if (h.t > 3.5 || (h.t > 0.25 && sp < 2.2)) { b.hurl = null; FLY.splice(i, 1); continue; }
    for (const a of C.wild()) { if (a.st === 'dead' || a.st === 'gone' || h.seen.includes(a)) continue; const big = a.d && a.d.big, r = (big ? 1.1 : a.sp === 'hare' || a.sp === 'partridge' ? 0.55 : 0.75) + b.K.r * 0.6, cy = a.y + (a.fy || 0) + (big ? 0.9 : 0.5);
      if (Math.hypot(a.x - b.x, a.z - b.z, (cy - b.y) * 0.7) > r) continue; h.seen.push(a);
      if (Math.random() > H.chance(b, a)) { /* a miss: it sails past, the animal startles */ G.UI.dmg && G.UI.dmg(a.x, cy + 0.6, a.z, '빗나감', 'dodge2'); a.alert = Math.max(a.alert || 0, 1.2); G.Audio && G.Audio.sfx('whoosh', { vol: 0.35, pitch: 1.4, x: a.x, z: a.z }); continue; }
      const v = Math.hypot(b.vx, b.vz) || 1, k = Math.max(0.6, Math.min(1.4, sp / 7)), crit = Math.random() < 0.1, hero = C.hero && C.hero(), str = hero && hero.sk ? 1 + (hero.sk.str || 0) * 0.08 : 1;
      C.damage(a, H.DMG[b.k] * k * str * (crit ? 1.6 : 1), crit, b.vx / v, b.vz / v);
      if (G.FX) G.FX.burst(b.x, b.y, b.z, 8, { c: b.k === 'stone' ? [0.7, 0.66, 0.6] : [0.75, 0.5, 0.3], sp: 2, up: 1.4, size: 0.1, g: 7, life: 0.5 });
      /* it bounces off; a jar or pot that hits hard goes on to smash on the ground by itself */ b.vx *= -0.25; b.vz *= -0.25; b.vy = Math.max(b.vy, 1.5); b.hurl = null; FLY.splice(i, 1); break; } } }
})(window.G);
