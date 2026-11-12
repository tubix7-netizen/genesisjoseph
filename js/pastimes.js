/* 약속의 길 — v18.37 총리가 된 뒤 궁과 옥에서 더 할 수 있는 일들 (하루 한 번씩).
   궁 식당 식사 · 궁 연못 물고기 먹이 주기 · 궁 벽화 읽기 · 옥 창살 너머 죄수에게 빵 나눠 주기 */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return; const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), pop = (a, b, c) => G.UI.pop && G.UI.pop(a, b, c);
const vz = () => { const o = Game.stepOrder(), s = S(); return o.indexOf(s.step) >= o.indexOf('c5_patrol'); };
const done = (s, k) => (s.flags.past || (s.flags.past = {}))[k] === s.day, mark = (s, k) => { (s.flags.past || (s.flags.past = {}))[k] = s.day; };
const mind = n => { const h = S().hero; if (h) h.mind = Math.min(h.mindMax || 100, (h.mind || 0) + n); };
const face = (x, z) => { const p = P(); p.face = Math.atan2(x - p.x, z - p.z); };
const MURAL = ['나일이 불어 오르는 그림이에요. 사람들이 강가에 서서 씨 뿌릴 때를 기다려요.', '곡식 단을 세는 서기관들 그림이에요. 한 사람이 부르고 한 사람이 적어요.', '배를 타고 강을 오르는 왕의 행렬이에요. 뱃머리에 연꽃이 새겨져 있어요.', '포도를 밟아 술을 짜는 사람들이 노래하는 모습이에요.', '먼 나라에서 공물을 들고 오는 사람들이에요. 옷의 무늬가 저마다 달라요.', '갈대숲의 새 사냥 그림이에요. 고양이가 먼저 뛰어들었네요.', '창고마다 곡식이 가득한 그림이에요. 칠 년 풍년을 기리는 그림 같아요.'];
const SPOT = [
  { k: 'dine', x: -46, z: -200.6, r: 2.4, label: '왕의 식탁에서 식사하기', off: '오늘은 궁에서 식사했어요', hours: [10, 21], fn: s => { G.UI.fade(() => { s.time += 0.5; const h = s.hero, p = P(); if (h) h.hp = h.hpMax; p.stam = (G.Vitals && G.Vitals.cap) || (h && h.stamMax) || 140; if (G.Surv && G.Surv.fed) G.Surv.fed('bread', 70); }, () => { pop('궁의 식탁', '배불리 먹었어요 · 체력과 기력이 가득 찼어요', 'star'); G.UI.hud(); }); } },
  { k: 'fish', x: -30 + 14, z: -146.6, r: 2.4, label: '연못 물고기 먹이 주기', off: '오늘은 물고기가 배불러요', fn: () => { sfx('water', { vol: 0.5 }); mind(5); pop('연못이 반짝여요', '물고기들이 몰려왔어요 · 정신력 +5', 'star'); G.UI.hud(); } },
  { k: 'fish2', x: -30 - 14, z: -146.6, r: 2.4, label: '연못 물고기 먹이 주기', off: '오늘은 물고기가 배불러요', fn: () => { sfx('water', { vol: 0.5 }); mind(5); pop('연못이 반짝여요', '물고기들이 몰려왔어요 · 정신력 +5', 'star'); G.UI.hud(); } },
  { k: 'mural', x: -22, z: -180, r: 2.2, label: '벽화 읽기', off: '오늘은 벽화를 다 봤어요', fn: s => { G.UI.say([{ n: '궁의 벽화', t: MURAL[s.day % MURAL.length] }], () => { mind(3); G.UI.hud(); }); } },
  { k: 'alms', x: -30, z: -3.9, r: 2.4, label: '창살 너머 죄수에게 빵 나눠 주기', off: '오늘은 빵을 나눠 주었어요', need: 'bread', fn: () => { Game.take('bread', 1); mind(8); sfx('pickup'); G.UI.say([{ n: '갇힌 사람', t: '총리님… 이 옥에 계셨다는 말이 참말이군요. 고맙습니다.' }], () => { pop('마음이 따뜻해져요', '정신력 +8', 'star'); G.UI.hud(); }); } },
];
Game.CTX.push(function (s) { const p = P(); if (p.ride || p.act || Game.cineOn || G.UI.busy() || !vz() || p.x > 1500 || (G.Homes && G.Homes.inside()) || (G.Caves && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside())) return null; const out = []; for (const q of SPOT) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d > q.r) continue; const h = s.time % 24, base = { d: d - 0.2, x: q.x, z: q.z, y: 1.5, noMagnet: true, key: 'past_' + q.k }; if (done(s, q.k)) out.push(Object.assign(base, { label: q.off, disabled: true })); else if (q.hours && (h < q.hours[0] || h > q.hours[1])) out.push(Object.assign(base, { label: '식사 시간이 아니에요', disabled: true })); else if (q.need && Game.inv(q.need) < 1) out.push(Object.assign(base, { label: '나눠 줄 빵이 없어요', disabled: true })); else out.push(Object.assign(base, { label: q.label, use: () => { mark(s, q.k); face(q.x, q.z); q.fn(s); } })); } return out.length ? out : null; });
})(window.G);
