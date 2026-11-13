/* 약속의 길 — 삯 수레 (v18.55)
   큰 지도에서 「가 본 곳」을 눌러 표시하면 아래에 「삯 수레로 가기 · 은 N」 단추가 생겨요. 누르면 삯을 내고 그곳으로 가요.
   · 요셉이 총리가 된 뒤(5장 「순찰」부터)만 · 「들은 곳 ?」으로는 못 가요(가 본 곳만).
   · 삯: 은 6 + 거리 8걸음마다 1 · 시간도 흘러요(40걸음에 1시간 정도). 밤(오후 8시 반~새벽 5시)엔 수레가 다니지 않아요.
   · 못 탈 때: 동굴·꿈·바다 건너, 수레·말을 타고 있을 때, 함께 가는 사람이 있을 때, 무언가를 들고 있을 때, 이야기 장면 중. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, EP = G.EP && G.EP.joseph; if (!Game || !UI || !EP) return;
const S = () => Game.S(), P = () => Game.P, $ = id => document.getElementById(id);
const after = k => { const s = S(), o = Game.stepOrder(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const fare = d => 6 + Math.round(d / 8);
function target() { const s = S(); if (!s || !s.wp || !G.MapFog) return null; const p = (EP.places || []).find(q => q.n === s.wp.n && Math.abs(q.x - s.wp.x) < 1 && Math.abs(q.z - s.wp.z) < 1); if (!p) return null; try { if (p.when && !p.when(s)) return null; } catch (e) { return null; } return G.MapFog.state(p, s) === 'seen' ? p : null; }
function why() { const s = S(), p = P(), h = s.time % 24; if (!after('c5_patrol')) return '총리가 된 뒤에 탈 수 있어요';
  if ((G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside()) || (G.DW && G.DW.on && G.DW.on()) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) return '여기서는 수레를 부를 수 없어요';
  if (h > 20.5 || h < 5) return '밤에는 삯 수레가 다니지 않아요'; if (p.ride || (s.q && s.q.riding)) return '먼저 내려 주세요'; if ((p.follow || []).length) return '함께 가는 사람이 있으면 탈 수 없어요';
  if ((G.Phys && G.Phys.held) || p.carry) return '들고 있는 것을 내려놓아요'; if (Game.cineOn) return '지금은 탈 수 없어요'; return null; }
function landSpot(p) { const W = Game.W(); for (let r = 3; r < 14; r += 1.5) for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + r, x = p.x + Math.sin(a) * r, z = p.z + Math.cos(a) * r; if (Game.solidAt(x, z, 0.8) || (W.water && W.heightAt(x, z) < W.water.level + 0.3)) continue; return [x, z, Math.atan2(p.x - x, p.z - z)]; } return [p.x + 3, p.z, 0]; }
function go(p) { const w = why(); if (w) { UI.toast(w); return; } const s = S(), d = Math.hypot(p.x - P().x, p.z - P().z), f = fare(d); if (d < 25) { UI.toast('가까워요 · 걸어가요'); return; } if (s.silver < f) { UI.toast(`삯이 모자라요 · 은 ${f}`); return; }
  const bx = $('bmX'); if (bx) bx.click(); Game.silver(-f); G.Audio && G.Audio.sfx('hoof', { vol: 0.6 });
  UI.fade(() => { const [x, z, face] = landSpot(p); s.time = Math.min(s.time + Math.max(0.5, d / 40), 29.5); Game.teleport(x, z, face); s.wp = null; }, () => { UI.pop ? UI.pop('삯 수레로 왔어요', `${p.n} · 은 ${f}`, 'map') : UI.toast(`${p.n}에 왔어요`); }); }
let btn = null;
function ensureBtn() { if (btn) return btn; const foot = document.querySelector('#bigmap .bm-foot'); if (!foot) return null; btn = document.createElement('button'); btn.className = 'sbtn pri'; btn.id = 'bmGo'; btn.hidden = true; btn.onclick = () => { const p = target(); if (p) go(p); }; foot.appendChild(btn); return btn; }
setInterval(() => { const bm = $('bigmap'); if (!bm || bm.hidden || Game.mode !== 'play') return; const b = ensureBtn(); if (!b) return; const p = target(); if (!p || !after('c5_patrol')) { b.hidden = true; return; }
  const d = Math.hypot(p.x - P().x, p.z - P().z); b.hidden = d < 25; b.textContent = `삯 수레로 가기 · 은 ${fare(d)}`; }, 300);
G.Travel = { go, fare };
})(window.G);
