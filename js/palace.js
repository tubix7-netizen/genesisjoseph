/* 약속의 길 — v18.36 바로의 궁 뒤채: 복도, 식당, 바로의 침실, 총리 집무실.
   바로는 밤이 되면 어전에서 내려와 침실로 걸어가 잠들어요. 집무실은 애굽의 총리가 된 뒤부터 열려요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return; const PI = Math.PI;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const ORDER = () => (EP.stepOrder || EP.order || null);
function vizier(s) { return !!(s.q && (s.q.vizSilver || s.q.chariotOk)) || !!(s.flags && s.flags.free); }
const BED = [-30, -208.3], AT = [-30, -205.6];
const PATH = [[-30, -170], [-39, -170], [-46, -177], [-46, -188], [-30, -188], [-30, -192.5], AT];
const NT = G.Night; if (NT) { const go0 = NT.go, rel0 = NT.release;
  NT.go = function (n, id) { if (id !== 'pharaoh') return go0.apply(this, arguments); if (n.d._dy0 === undefined) n.d._dy0 = n.d.dy; const ox = n.x, oz = n.z, walk = Game.dist(n.x, n.z) < 60; if (walk) { n.d.dy = 0; n.x = -30; n.z = -172; } const r = go0.apply(this, arguments); if (n._nh) { n._nh.ox = ox; n._nh.oz = oz; } else if (walk) { n.x = ox; n.z = oz; n.d.dy = n.d._dy0; } return r; };
  NT.release = function (n, id, morning) { if (id === 'pharaoh') { if (n.d._dy0 !== undefined) n.d.dy = n.d._dy0; n._inBed = 0; return rel0.call(this, n, id, false); } return rel0.apply(this, arguments); }; }
EP.palacePath = PATH;
/* doors */
let leaf = null; const DM = {};
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (Game.mode !== 'play' || !G.PALACE) return; const p = P(); if (Math.hypot(p.x + 30, p.z + 195) > 60) return; const W = Game.W();
  if (!leaf) { const g = new G.GB(211); g.box(2.4, 2.95, 0.12, { at: [0, 1.48, 0], c: 0x6a4426, j: 0.03 }); for (const y of [0.5, 1.5, 2.5]) g.box(2.42, 0.09, 0.15, { at: [0, y, 0], c: 0xc89a3a, j: 0 }); g.sph(0.06, 6, 5, { at: [0.95, 1.2, 0.1], c: 0xe2b440 }); leaf = G.R.mesh(g); }
  for (const k of ['bed', 'office']) { const c = G.PALACE[k]; if (!c.on) continue; const m = DM[k] || (DM[k] = G.m4()); G.m4trs(m, c.x, W.heightAt(c.x, c.z), c.z, 0); list.push({ mesh: leaf, m, outline: true }); } };
const up0 = EP.update; EP.update = function (dt, s) { if (up0) up0.apply(this, arguments); const Pal = G.PALACE; if (!Pal || Game.mode !== 'play') return; const st = s || S(), n = Game.npc('pharaoh'), v = vizier(st), b = n && n._nh; if (n && !b && n.d._dy0 !== undefined && n.d.dy !== n.d._dy0) { n.d.dy = n.d._dy0; n._inBed = 0; } /* (a reload while he slept) */
  if (n && b && b.st === 'in' && !n._inBed) { n._inBed = 1; Game.npcTo('pharaoh', BED[0], BED[1], PI, false); n.face = n.homeFace = PI; n.d.dy = 0.62; }
  Pal.bedCol.on = !(n && n._inBed); Pal.bed.on = (!!(n && n._inBed) || (!v && !b)) && P().z > -190; /* never shut with Joseph inside */ Pal.office.on = !v; };
/* v18.38 the vizier's day: one petition, a real choice, and word of it comes back next time */
const PET = [
  ['농부 헤카', '둑이 터져 밭이 물에 잠겼습니다. 올해 세금을 줄여 주십시오.', ['세금을 반으로 줄여 준다', 15, 3, '농부가 땅에 엎드려 절했어요.', '둑이 터졌던 헤카네가 다시 씨를 뿌렸대요.'], ['법대로 받되 씨앗을 빌려 준다', 35, 1, '농부가 씨앗 자루를 안고 돌아갔어요.', '헤카가 빌린 씨앗을 갚겠다고 벼르고 있대요.']],
  ['과부 메렛', '남편이 죽자 시동생이 제 밭을 가져갔습니다.', ['밭을 과부에게 돌려준다', 15, 3, '메렛이 눈물을 닦으며 고개를 숙였어요.', '메렛의 밭에 올해 첫 싹이 났대요.'], ['둘이 반씩 나누게 한다', 25, 1, '둘 다 조금씩 서운한 얼굴로 나갔어요.', '메렛과 시동생이 아직도 말을 안 한대요.']],
  ['상인 아무', '시돈 배가 나루 세를 두 배로 내라 한다며 항의합니다.', ['시돈과 값을 다시 정한다', 40, 1, '상인들이 장부를 들고 나루로 갔어요.', '나루 세가 정리되어 배가 늘었대요.'], ['애굽 상인 편을 든다', 25, 2, '상인들이 환호했어요.', '시돈 사람들이 조금 불만이래요.']],
  ['서기관 네페르', '곳간 기록과 실제 자루 수가 열 자루 다릅니다.', ['직접 세어 보게 다시 재게 한다', 20, 3, '서기관이 곳간으로 달려갔어요.', '다시 세어 보니 옮겨 적다 틀린 것이었대요.'], ['담당 서기를 바꾼다', 30, 1, '새 서기가 임명됐어요.', '곳간 일이 조금 어수선하대요.']],
  ['목자 바키', '이웃 양 떼가 제 풀밭을 뜯어 먹습니다.', ['풀밭 경계에 돌을 세워 준다', 20, 2, '두 목자가 함께 돌을 나르러 갔어요.', '경계석 덕분에 다툼이 없어졌대요.'], ['번갈아 쓰게 날을 정해 준다', 25, 2, '두 목자가 달력을 받아 갔어요.', '양 떼들이 번갈아 살이 올랐대요.']],
  ['옥의 간수', '오래 갇힌 늙은 죄수가 앓고 있습니다.', ['풀어 주고 가족에게 보낸다', 15, 3, '요셉은 옥에 있던 날을 떠올렸어요.', '풀려난 노인이 총리를 위해 기도한대요.'], ['옥에서 의원을 보내 돌본다', 25, 2, '의원이 약초를 들고 옥으로 갔어요.', '노인의 열이 내렸대요.']],
  ['토기장이 데두', '곡식 항아리 값을 올려 주셔야 흙값을 댑니다.', ['값을 조금 올려 준다', 20, 2, '토기장이가 기뻐하며 물러갔어요.', '곳간 항아리가 더 튼튼해졌대요.'], ['궁 흙 구덩이를 쓰게 해 준다', 35, 1, '돈 들이지 않고 일이 풀렸어요.', '토기장이들이 궁 뒤 흙을 파 간대요.']],
  ['어머니 타위', '아들이 일꾼으로 끌려가 집에 일손이 없습니다.', ['추수 때까지 돌려보낸다', 15, 3, '타위가 손을 모아 감사했어요.', '타위네 추수가 무사히 끝났대요.'], ['대신 품삯을 보내 준다', 30, 1, '타위가 은을 받아 돌아갔어요.', '타위가 일꾼을 사서 밭을 돌본대요.']],
];
function petition(s) { const say = (t, cb) => G.UI.say(t, cb), i = (s.flags.vizN || 0) % PET.length, [who, t, a, b] = PET[i], pre = s.flags.vizNews ? [{ n: '서기', t: s.flags.vizNews }] : []; s.flags.vizNews = null; const pick = c => { s.flags.vizDesk = s.day; s.flags.vizN = (s.flags.vizN || 0) + 1; s.flags.vizRep = (s.flags.vizRep || 0) + c[2]; s.flags.vizNews = c[4]; setTimeout(() => G.UI.fade(() => { s.time += 1; }, () => { Game.silver(c[1]); const r = s.flags.vizRep; G.UI.pop && G.UI.pop('청원을 마쳤어요', `${c[3]} · 은 ${c[1]} · 백성의 신망 ${r}`, 'coin'); for (const [need, gift, msg] of [[10, 60, '백성들이 총리를 칭송해요'], [25, 150, '온 나라가 총리의 판결을 믿어요']]) if (r >= need && !(s.flags['vizR' + need])) { s.flags['vizR' + need] = 1; Game.silver(gift); setTimeout(() => G.UI.pop && G.UI.pop(msg, `감사 예물 · 은 ${gift}`, 'star'), 2600); } G.UI.hud(); }), 60); }; say(pre.concat([{ n: who, t }, { n: '요셉', t: '어떻게 할까?', choices: [{ t: a[0], then: () => pick(a) }, { t: b[0], then: () => pick(b) }, { t: '좀 더 알아보고 다시 부르겠소', reply: '사정을 더 알아본 뒤에 판결하겠소. 오늘 안에 다시 부르리다.' }] }]), () => { }); } /* v18.41 a judge may take time to look into it */
const after = k => { const o = Game.stepOrder(), s = S(); return o.indexOf(s.step) >= o.indexOf(k); };
const VAULT = [
  { k: 'vzFeast', n: '곳간 일꾼들에게 잔치 베풀기', p: 120, ok: s => (s.flags.vzFeastDay || -99) < s.day - 6, go: s => { s.flags.vzFeastDay = s.day; s.flags.vizRep = (s.flags.vizRep || 0) + 4; return ['일꾼들이 총리 이름으로 건배했어요', '백성의 신망 +4']; } },
  { k: 'vzHome', n: '총리의 집 단장하기', p: 350, ok: s => !s.flags.vzHome, go: s => { s.flags.vzHome = 1; return ['집이 새로 꾸며졌어요', '요셉의 집에 들어가 보세요']; } },
  { k: 'vzTack', n: '금장 마구 맞추기 (말이 덜 지쳐요)', p: 500, ok: s => !s.flags.goldTack, go: s => { s.flags.goldTack = 1; return ['금장 마구를 맞췄어요', '말과 수레 말이 30% 덜 지쳐요']; } },
  { k: 'vzGift', n: '아버지 야곱께 귀한 선물 보내기', p: 300, ok: s => !s.flags.vzGift && after('g5_reveal'), go: s => { s.flags.vzGift = 1; const h = s.hero; if (h) h.mind = h.mindMax || 100; return ['아버지께 선물을 보냈어요', '마음이 가득 찼어요']; } },
];
function vault(s) { const L = VAULT.filter(v => v.ok(s)); if (!L.length) { G.UI.toast('지금은 금고로 할 일이 없어요'); return; } G.UI.choose(`금고 · 내 은 ${s.silver}`, L.map(v => `${v.n} · 은 ${v.p}`).concat(['그만두기']), i => { const v = L[i]; if (!v) return; if (s.silver < v.p) { G.UI.toast('은이 모자라요 · 청원을 들으면 은이 모여요'); return; } Game.silver(-v.p); const [a, b] = v.go(s); sfx('coins'); G.UI.pop && G.UI.pop(a, b, 'star'); G.UI.hud(); }); }
/* the done-up house: drawn in Joseph's room once he has paid for it */
let homeM = null; const HM = G.m4(); const dynH = EP.dyn; EP.dyn = function (list) { if (dynH) dynH.apply(this, arguments); if (Game.mode !== 'play' || !G.Homes) return; const s = S(), h = s.flags.inHouse; if (!s.flags.vzHome || !h || h.t === undefined || !/^mine/.test(h.t)) return; const R0 = G.Homes.room(); if (!homeM) { const g = new G.GB(231); g.box(3.2, 0.02, 2.2, { at: [0.3, 0.008, -1.5], c: 0x2c5aa0, j: 0 }); for (let i = 0; i < 8; i++) g.box(0.12, 0.022, 2.2, { at: [-1.1 + i * 0.4, 0.009, -1.5], c: i % 2 ? 0xe5c97a : 0xb3472e, j: 0 }); for (const x of [-3.3, 3.3]) { g.cyl(0.02, 0.03, 1.9, 8, { at: [x, 0.95, 2.75], c: 0xc89a3a, j: 0 }); g.cyl(0.13, 0.06, 0.1, 10, { at: [x, 1.92, 2.75], c: 0xd8b050, j: 0 }); g.sph(0.04, 6, 5, { at: [x, 2.02, 2.75], s: [0.7, 1.5, 0.7], c: 0xffc860, j: 0 }); } for (const z of [-2.4, 2.8]) g.box(0.03, 1.5, 0.9, { at: [-3.56, 1.5, z], c: 0x2c5aa0, j: 0 }); g.box(0.04, 0.1, 1, { at: [-3.56, 2.2, 2.8], c: 0xd8b050, j: 0 }); homeM = G.R.mesh(g); } G.m4trs(HM, R0.x, R0.y, R0.z, 0, 0, 0, 1, 1, 1); list.push({ mesh: homeM, m: HM, outline: true }); };
/* 출입문 안내와 집무 */
Game.CTX.push(function () { const p = P(), s = S(), Pal = G.PALACE; if (!Pal || p.ride || Game.cineOn || G.UI.busy() || p.z > -180 || p.z < -214 || (G.Caves && G.Caves.inside()) || (G.Cave && G.Cave.inside && G.Cave.inside())) return null; const out = [];
  const d = Math.hypot(p.x - Pal.bed.x, p.z - Pal.bed.z), e = Math.hypot(p.x - Pal.office.x, p.z - Pal.office.z);
  if (Pal.bed.on && d < 2.2) out.push({ d, label: '침실 문 두드리기', x: Pal.bed.x, z: Pal.bed.z, y: 1.4, noMagnet: true, key: 'phDoor', use: () => G.UI.toast(vizier(s) ? '바로께서 주무십니다. 날이 밝으면 오세요' : '바로의 침실이에요. 들어갈 수 없어요') });
  if (Pal.office.on && e < 2.2) out.push({ d: e, label: '문 살펴보기', x: Pal.office.x, z: Pal.office.z, y: 1.4, noMagnet: true, key: 'ofDoor', use: () => G.UI.toast('총리의 집무실이에요. 아직은 잠겨 있어요') });
  const w = Math.hypot(p.x + 14, p.z + 205.2); if (!Pal.office.on && w < 2.4) { const done = s.flags.vizDesk === s.day; out.push({ d: w, label: done ? '오늘 청원은 끝났어요' : '청원 듣기', x: -14, z: -206.4, y: 1, noMagnet: true, key: 'vizDesk', disabled: done, use: () => { if (!done) petition(s); } }); }
  const cf = Math.hypot(p.x + 8.6, p.z + 208.2); if (!Pal.office.on && cf < 2) out.push({ d: cf, label: '총리 금고 · 큰일 맡기기', x: -8, z: -209, y: 1, noMagnet: true, key: 'vizVault', use: () => vault(s) });
  return out.length ? out : null; });
})(window.G);
