/* 약속의 길 — 지도는 아는 곳만 (v18.54)
   큰 지도의 장소 이름은 처음부터 다 보이지 않아요.
   · 가 본 곳: 그 장소 가까이 가면(마을 24m · 그 밖 15m) 지도에 이름이 나타나요 —「지도에 새 장소」.
   · 들은 곳: 대화나 이야기 장면에서 그 장소 이름(또는 「그발」「하란」 같은 줄임말)을 들으면 지도에 「?」를 붙여 먼저 표시해요.
     가 보면 「?」가 빠져요. 알림판의 「소식」에서 읽어도 들은 곳이 돼요(js/notice.js).
   · 이야기가 아직 그곳을 열지 않았으면(place.when) 듣거나 가도 나타나지 않아요.
   · 저장: S.flags.mapKnown = { 장소 이름: 'seen' | 'heard' }. 예전 저장은 처음 불러올 때 마을만 「들은 곳」으로 두어요.
   API: G.MapFog.state(place) · mark(place, 'seen'|'heard', quiet) · hear(text) · markName(name, how) */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, EP = G.EP && G.EP.joseph; if (!Game || !UI || !EP) return;
const S = () => Game.S(), P = () => Game.P;
const MF = G.MapFog = {};
const known = s => s.flags.mapKnown || (s.flags.mapKnown = {});
/* short names people actually say */
const EXTRA = { '나일 나루 · 그발 가는 배': ['그발'], '나일 나루 · 갑돌 가는 배': ['갑돌'], '나일 나루 · 구스 가는 배': ['구스'], '도성 동쪽 길 · 하란 가는 대상': ['하란'], '고센 들판 · 미디안 대상': ['미디안'],
  '고센 땅 (애굽 동쪽 목초지)': ['고센 땅'], '나일로미터 (수위 계단)': ['나일로미터', '수위 계단'], '헤브론 골짜기': ['헤브론'], '세겜 들판': ['세겜'], '바로의 궁': ['바로의 궁', '바로 궁'], '왕의 옥': ['왕의 옥', '감옥'],
  '온의 신전': ['온의 신전', '온 신전'], '피라미드 일꾼 마을': ['일꾼 마을'], '상수리나무 쉼터': ['상수리나무'], '피라미드': ['피라미드'] };
const keysOf = p => { const k = [p.n, p.n.split(' (')[0]].concat(EXTRA[p.n] || []); return k.filter((x, i) => x && x.length >= 2 && k.indexOf(x) === i); };
const open = (p, s) => { try { return !p.when || p.when(s); } catch (e) { return false; } };
MF.state = (p, s) => { s = s || S(); if (!s || !s.flags) return 'seen'; return known(s)[p.n] || null; };
let pend = []; /* names to announce once the talk is over */
MF.mark = function (p, how, quiet) { const s = S(); if (!s || !s.flags || !open(p, s)) return false; const k = known(s), was = k[p.n]; if (was === 'seen' || was === how) return false;
  k[p.n] = how; if (!quiet) pend.push([p.n, how, was]); return true; };
MF.markName = (n, how, quiet) => { const p = (EP.places || []).find(q => q.n === n); return p ? MF.mark(p, how || 'heard', quiet) : false; };
/* a line someone said (or a notice read): any place named in it becomes a place one has heard of */
MF.hear = function (t) { const s = S(); if (!t || !s || !s.flags) return 0; t = String(t); let n = 0; const k = known(s);
  for (const p of EP.places || []) { if (k[p.n] || !open(p, s)) continue; if (keysOf(p).some(w => t.includes(w))) { if (MF.mark(p, 'heard')) n++; } } return n; };
UI.placeKnown = (p, s) => MF.state(p, s);
{ const ol0 = UI.onLine; UI.onLine = function (L) { try { if (L) MF.hear(L.t); } catch (e) { } return ol0 ? ol0.apply(this, arguments) : undefined; }; }
if (G.Cine) { const os0 = G.Cine.onShot; G.Cine.onShot = function (sh) { try { if (sh) MF.hear(sh.t); } catch (e) { } return os0 ? os0.apply(this, arguments) : undefined; }; }
/* walking near a place: it is on the map from now on. Announcements wait until no one is talking. */
let tk = 0;
function tick(dt) { tk -= dt; if (tk > 0) return; tk = 0.5; const s = S(), p = P(); if (!s || !s.flags || !p || Game.mode !== 'play') return;
  if (s.flags.mapKnown === undefined) { const k = known(s), o = Game.stepOrder ? Game.stepOrder() : [], fresh = (s.day || 1) <= 1; /* an older save: its towns are 「heard of」 */
    if (!fresh) for (const q of EP.places || []) if (q.k === 'town' && open(q, s)) k[q.n] = 'heard'; }
  if (G.DW && G.DW.on && G.DW.on()) return; if (G.Byblos && G.Byblos.inBy && G.Byblos.inBy()) return;
  for (const q of EP.places || []) { const r = q.k === 'town' ? 24 : 15; if (Math.abs(q.x - p.x) > r || Math.abs(q.z - p.z) > r) continue; if (Math.hypot(q.x - p.x, q.z - p.z) < r) MF.mark(q, 'seen'); }
  if (pend.length && !UI.busy() && !(G.Cine && G.Cine.on)) { const seen = pend.filter(x => x[1] === 'seen'), heard = pend.filter(x => x[1] === 'heard'); pend = [];
    for (const [n] of seen) { if (UI.pop) UI.pop('지도에 새 장소', n, 'map'); else UI.toast('지도에 새 장소 · ' + n); }
    if (heard.length) UI.toast(`지도에 표시했어요 · ${heard.map(x => x[0]).join(', ')} (들은 곳 ?)`); if (seen.length || heard.length) G.Audio && G.Audio.sfx('page', { vol: 0.5 }); } }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; try { tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('mapfog', e); } return r; };
})(window.G);
