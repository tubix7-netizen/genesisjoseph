/* 약속의 길 — v18.67 잠자는 방법 (sleepsys.js · pace.js 다음)
   · 아무 데서나 눕고 자는 것은 없어요(「동작 → 눕기」는 쉬기만 해요).
   · 잠은 세 곳에서만 자요.
     - 모닥불 곁: 날씨가 좋을 때만. 불가에 앉아 「불가에서 자기」(낮에는 「불가에서 눈 붙이기」)
     - 텐트 · 장막: 어느 날씨에나. 궂은 날(비 · 폭풍 · 모래바람 · 추운 밤 · 무더운 밤)에는 텐트(또는 집)에서만 잘 수 있어요.
     - 집 안 침대: 언제나.
   · 잠들면 요셉이 눕고, 카메라가 하늘을 올려다보며 밤이 흘러가요(별이 돌고, 달이 지고, 동이 터요). 화면을 누르면 넘어가요.
   API: G.Sleep.go(kind 'fire' | 'tent' | 'bed', after) · G.Sleep.bad() → 궂은 까닭 | '' · G.Sleep.sky(text, done) */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const S = () => Game.S(), P = () => Game.P, pop = (t, s, i) => (G.UI.pop || G.UI.toast)(t, s, i);
const Sl = G.Sleep = {};
const night = () => { const h = S().time % 24; return h >= 18.5 || h < 4.5 || !!(G.storyNight && G.storyNight(S())); }; /* v18.78 (a story night — the first night on the road — counts from dusk) */
Sl.bad = function () { const s = S(), Wx = G.Weather, C = G.Climate || {}, Sv = G.Surv; const k = Wx && Wx.kind ? Wx.kind(s) : 'clear';
  if (k === 'rain' || k === 'storm' || (Wx && Wx.rainy && Wx.rainy())) return '비가 와요';
  if (k === 'dust') return '모래바람이 불어요';
  if (C.cold || (night() && Sv && Sv.cold - Sv.heat > 14)) return '밤바람이 너무 차요';
  if ((C.heat || 0) > 55) return '밤이 너무 무더워요';
  return ''; };
/* the sky while he sleeps: from where he lies, up into the night; the hours run on to the morning */
Sl.sky = function (text, done) { const s = S(), p = P(), W = Game.W(); if (!s || !W || !G.Cine) { done && done(); return; } const y = W.heightAt(p.x, p.z), f = p.face, t0 = s.time;
  const t1 = t0 < 18 && t0 >= 4.5 ? t0 + 3 : Math.min(29.3, t0 < 4.5 ? t0 + 24 : Math.max(t0, 29.3)); /* (a nap by day: three hours; a night: on to just before dawn) */
  p.emote = { k: 'lie', t: 0, dur: 0 }; const lx = p.x - Math.sin(f) * 6, lz = p.z - Math.cos(f) * 6;
  G.Cine.play([{ cam: [p.x + Math.sin(f) * 1.1, y + 0.9, p.z + Math.cos(f) * 1.1], cam2: [p.x + Math.sin(f) * 1.0, y + 1.1, p.z + Math.cos(f) * 1.0], look: [lx, y + 14, lz], look2: [lx, y + 18, lz], dur: 7, fov: 1.15, t: text || '요셉은 하늘을 올려다보다 스르르 잠이 들었습니다.',
    each: tt => { s.time = t0 + (t1 - t0) * Math.min(1, tt / 6.5); }, fadeOut: 1.2 }], () => { s.time = Math.max(s.time, t1); if (p.emote && p.emote.k === 'lie') p.emote = null; done && done(); }, { cut: true }); };
Sl.go = function (kind, after) { const s = S(); if (!s) return;
  if (kind === 'fire') { const b = Sl.bad(); if (b) { G.UI.toast(`${b} · 이런 날은 텐트(장막)나 집에서만 잘 수 있어요`, true); after && after(false); return; } }
  if (!night()) { if (G.Rest && G.Rest.napAsk) G.Rest.napAsk(kind === 'fire' ? 'fire' : kind, ok => after && after(ok)); return; }
  const j = G.Rest && G.Rest.judge ? G.Rest.judge() : null; if (kind !== 'fire' && kind !== 'bed' && kind !== 'tent' && j && j.block) { G.UI.toast(j.block, true); return; }
  const T = { fire: '모닥불이 사위어 가고, 요셉은 별을 올려다보다 스르르 잠이 들었습니다.', tent: '장막 천 너머로 바람 소리를 들으며, 요셉은 잠이 들었습니다.', bed: '요셉은 자리에 누워 하루를 되새기다 잠이 들었습니다.' }[kind];
  Sl.sky(T, () => { Game.sleep(); setTimeout(() => after && after(true), 1600); }); };
/* naps happen in the same places only: the nap's own place check (rest.js treats 'fire' like the open air, and refuses it in foul weather) */
})(window.G);
