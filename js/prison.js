/* 약속의 길 — 왕의 옥 부탁들 (v18.17)
   요셉이 총리가 된 뒤(5장~) 예전의 간수장이 다시 옥을 지켜요. 옥에서 맡는 부탁 세 갈래:
   · 「옥에 가둘 자」 ×3 (간수장): 수배된 사람을 찾아가면 달아나요 — 달리기로 쫓아가 「붙잡기」, 데려와서 빈 감방 앞에서 「옥에 가두기」.
     빵 도둑 메르(서쪽 마을) → 곡식 자루 도둑 세베크(남쪽 마을) → 가짜 저울 상인 카(나일 나루). 앞의 일을 마쳐야 다음 수배가 나와요.
   · 「잃어버린 열쇠꾸러미」 (간수 앙쿠): 앙쿠와 데디가 감방 열쇠꾸러미를 서로 잃어버렸다고 다퉈요. 데디의 말을 듣고, 옥 마당
     물항아리 옆 짚더미를 뒤져 찾아 주면 둘이 화해해요.
   · 「억울한 죄수」 (죄수 네브카): 은잔을 훔쳤다는 누명. 은잔 주인 하피의 이야기를 듣고, 장터 노점 뒤 바구니에서 떨어진 은잔을 찾아
     간수장에게 보이면 네브카가 풀려나요 — 요셉 자신도 누명을 쓰고 이 옥에 갇혔었지요 (창 39:20).
   감방 네 칸(서쪽부터 0~3)은 앞의 쇠창살 너머에 있어 말은 창살 사이로 걸어요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), say = (l, cb) => G.UI.say(l, cb);
const ord = () => Game.stepOrder(), after = k => { const o = ord(); return o.indexOf(S().step) >= o.indexOf(k); };
const viz = () => !!S() && after('c5_patrol');
const F = () => { const s = S(); return s.flags.px || (s.flags.px = { caught: {}, jailed: {}, keys: 0, wrong: 0, freed: 0 }); };
const CELL = [[-41, -8], [-35.5, -8], [-30, -8.4], [-24.5, -8]], BARS_Z = -4.7;
const L = (n, t, e) => ({ n, t, e });
const jo = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? a : b; };
const LOOK = id => (EP.npcs.find(n => n.id === id) || {}).look;
const PRIS = LOOK('prisA'), GUARD = LOOK('pg1'), KEEP = LOOK('keeper');
const tint = (o, x) => Object.assign({}, o || {}, x);

// ------------------------------------------------------------------ people
const CUL = [
  { id: 'culMer', q: 'x_jail1', n: '빵 도둑 메르', crime: '서쪽 마을 화덕에서 빵 열두 덩이를 훔쳐 달아난 자', at: [-128, -30], cell: 2, look: tint(PRIS, { skin: 0xb07848, top: 0x8a7a5a, hairStyle: 'short' }),
    run: ['헉, 총리님이다!', '빵 몇 덩이 가지고 왜 이러세요!', '잡히면 끝장이야!'], got: '아이고… 배가 고파서 그랬어요. 잘못했어요.' },
  { id: 'culSebek', q: 'x_jail2', n: '자루 도둑 세베크', crime: '남쪽 마을 곳간 앞에서 곡식 자루 다섯을 실어 간 자', at: [-136, 138], cell: 3, look: tint(PRIS, { skin: 0x8a5a32, top: 0x6a5a40, beard: 'short', build: 1.1 }),
    run: ['곡식은 내가 먼저 봤다고!', '못 잡을걸!', '저리 가시오!'], got: '…흉년 대비라 하길래 나 먼저 챙기려 했소. 내 욕심이었소.' },
  { id: 'culKa', q: 'x_jail3', n: '가짜 저울 상인 카', crime: '나루에서 속인 저울로 곡식을 팔아 사람들을 속인 상인', at: [-90, -64], cell: 0, look: tint(PRIS, { skin: 0xc08a58, top: 0x3e6a8a, long: true, hairStyle: 'bald' }),
    run: ['저울이 좀 기울었을 뿐이오!', '장사꾼끼리 다 그러는 거요!', '나, 난 아무것도 몰라!'], got: '…추를 깎은 게 맞소. 속인 곡식은 다 돌려주겠소.' }];
const showCul = c => S => { if (!viz()) return false; const f = F(); return !!(f.jailed[c.id] || (S.side && S.side.act && S.side.act[c.q])); };
for (const c of CUL) EP.npcs.push({ id: c.id, name: c.n, look: c.look, x: c.at[0], z: c.at[1], face: 0, noBond: true, show: showCul(c), chat: () => F().jailed[c.id] ? ['…반성하고 있어요.', '여기 밥은 생각보다 먹을 만하네요.'] : ['…뭐요?'] });
EP.npcs.push(
  { id: 'grdSeti', name: '간수 앙쿠', look: tint(GUARD, { skin: 0xb07a4a }), x: -27.6, z: 9.2, face: 2.6, prop: 'spear', show: () => viz(), chat: ['옥 문은 해가 지면 닫습니다, 총리님.', '간수장님은 총리님 이야기만 나오면 눈시울이 붉어지세요.'] },
  { id: 'grdPaneb', name: '간수 데디', look: tint(GUARD, { skin: 0x8a5a36, build: 1.1 }), x: -38.6, z: 2.4, face: 1.2, prop: 'spear', show: () => viz(), chat: ['감방 순찰 중입니다!', '앙쿠 녀석은 꼼꼼한 척만 해요.'] },
  { id: 'nebka', name: '죄수 네브카', look: tint(PRIS, { skin: 0xa86a3a, hairStyle: 'short', beard: 'short' }), x: CELL[1][0], z: CELL[1][1], face: 0, talkR: 3.8, noBond: true, show: () => viz() && !F().gone, chat: () => F().freed ? ['총리님, 이 은혜를 잊지 않겠습니다!'] : ['…'] },
  { id: 'hapi', name: '은잔 주인 하피', look: tint(KEEP, { top: 0xe8dcc0, skin: 0xc89060 }), x: -14.6, z: -70.6, face: -1.6, show: () => viz(), chat: ['좋은 날이구려, 총리님.', '은잔은 우리 집안 대대로 내려온 것이라오.'] });
// the old keeper is back at the prison once Joseph is vizier
{ const k = EP.npcs.find(n => n.id === 'keeper'); if (k) { const sh = k.show, ch = k.chat; k.show = s => sh(s) || viz(); k.chat = s => viz() ? ['총리님! 이 옥에서 나가신 분이 총리가 되시다니… 아직도 꿈만 같습니다.', '죄수들에게 물 나눠 주던 그 손이 이제 온 애굽을 먹이시는군요.'] : typeof ch === 'function' ? ch(s) : ch; } }

// ------------------------------------------------------------------ quests
const QS = EP.quests || (EP.quests = {});
const act = id => !!(S().side && S().side.act && S().side.act[id]);
CUL.forEach((c, i) => {
  QS[c.q] = { giver: 'keeper', title: `옥에 가둘 자 · ${c.n.split(' ').pop()}`, when: () => viz() && (i === 0 || (S().side && S().side.done && S().side.done[CUL[i - 1].q] !== undefined)),
    offer: [`총리님, 부탁드릴 일이 있습니다. ${c.crime}가 있습니다. 우리 간수들이 다가가면 귀신같이 달아나지요.`, '총리님 수레라면 금방 따라잡으실 겁니다. 붙잡아 이 옥으로 데려와 주십시오.'],
    obj: [{ t: `${c.n} 붙잡기 (달아나면 달리기로 쫓아가요)`, ok: () => !!(F().caught[c.id] || F().jailed[c.id]) }, { t: '옥의 빈 감방 앞에서 「옥에 가두기」', ok: () => !!F().jailed[c.id] }],
    loc: () => { if (F().caught[c.id] && !F().jailed[c.id]) return { x: CELL[c.cell][0], z: BARS_Z }; const n = Game.npc(c.id); return n ? { x: n.x, z: n.z } : { x: c.at[0], z: c.at[1] }; },
    prog: `${c.n}는 아직입니까? ${c.at[0] < -120 ? '마을 쪽' : '나루 쪽'}에서 봤다는 사람이 있습니다.`,
    done: [`잡아 오셨군요! 역시 총리님이십니다. 저자는 이제 이 옥에서 제 죄를 돌아보게 될 겁니다.`, i === 2 ? '세 사람 다 들어왔으니 애굽 길이 한결 편안하겠습니다. 이건 옥에서 드리는 작은 사례입니다.' : '또 수배가 들어오면 말씀드리겠습니다.'],
    reward: { silver: 18 + i * 8, xp: 25 + i * 10, insight: i === 2 ? 1 : 0 } }; });
QS.x_keys = { giver: 'grdSeti', title: '잃어버린 열쇠꾸러미', when: () => viz(),
  offer: ['총리님, 창피한 말씀이지만… 감방 열쇠꾸러미가 없어졌습니다. 어젯밤 데디한테 넘겼는데, 그 녀석은 받은 적이 없다는 겁니다!', '간수장님 아시기 전에 찾아야 해요. 데디 그 녀석 말 좀 들어 봐 주시겠습니까?'],
  obj: [{ t: '간수 데디의 말 듣기', ok: () => F().keys >= 1 }, { t: '옥 마당에서 열쇠꾸러미 찾기', ok: () => F().keys >= 2 }],
  loc: () => F().keys < 1 ? 'npc:grdPaneb' : { x: -42.4, z: 10.6 },
  prog: '데디 녀석이 뭐라고 하던가요? …마당 어딘가에 떨어뜨렸을지도 모르겠습니다.',
  done: [L('간수 앙쿠', '여기 있었군요! 물항아리 옆 짚더미 속에…'), L('간수 데디', '…항아리에 물 채우다가 내 허리띠에서 빠졌나 보오. 앙쿠, 미안하게 됐소.'), L('간수 앙쿠', '아니오, 나도 다짜고짜 의심부터 했소. 앞으로는 넘길 때 같이 세어 봅시다.'), L('간수 데디', '총리님 덕분에 둘 다 목이 붙어 있게 됐습니다. 하하!')],
  reward: { silver: 15, xp: 30, items: { bread: 2 } }, finish: () => { G.UI.toast('앙쿠와 데디가 화해했어요'); } };
QS.x_wrong = { giver: 'nebka', title: '억울한 죄수', when: () => viz() && !F().freed,
  offer: ['…총리님, 제 말 좀 들어 주십시오. 장터에서 하피 어른의 은잔이 없어진 날, 제가 그 노점 곁에 있었다는 이유로 여기 갇혔습니다.', '저는 맹세코 손대지 않았습니다. 아무도 제 말을 믿어 주지 않아요…', L('요셉', '(…나도 이 옥에서, 아무도 믿어 주지 않는 말을 품고 지낸 적이 있었다.)')],
  obj: [{ t: '은잔 주인 하피의 이야기 듣기 (장터)', ok: () => F().wrong >= 1 }, { t: '장터 노점 뒤에서 은잔 찾기', ok: () => F().wrong >= 2 }, { t: '간수장에게 은잔 보여 주기', ok: () => F().wrong >= 3 }],
  loc: () => F().wrong < 1 ? 'npc:hapi' : F().wrong < 2 ? { x: -15.8, z: -77.6 } : F().wrong < 3 ? 'npc:keeper' : 'npc:nebka',
  prog: '…하피 어른은 장터에 계실 겁니다. 그날 일을 저보다 더 잘 아실 거예요.',
  done: [L('간수장', '네브카, 나오너라. 총리님께서 네 누명을 벗겨 주셨다.'), L('죄수 네브카', '…정말입니까? 아아, 감사합니다! 하나님께서 저를 잊지 않으셨군요!'), L('요셉', '나도 이 옥에서 그렇게 기다렸다네. 하나님은 기다리는 사람을 잊지 않으시지.')],
  reward: { silver: 25, xp: 45, insight: 1 }, finish: () => { F().freed = 1; const n = Game.npc('nebka'); if (n) { Game.npcTo('nebka', -30, -4, Math.PI); Game.npcWalk('nebka', -30, 16.5, () => { F().gone = 1; }, 1.6); } /* he walks out through the prison gate, then is gone */ } };

// ------------------------------------------------------------------ talks that move the requests on
const lt0 = G.Life.talk; G.Life.talk = function (id) { const f = F(), done = () => { const n = Game.npc(id); if (n) n.talking = false; };
  if (id === 'grdPaneb' && act('x_keys') && f.keys < 1) { say([L('간수 데디', '열쇠? 난 못 받았다니까요! 앙쿠가 나한테 넘기는 척만 한 거겠지.'), L('간수 데디', '…어젯밤엔 마당 물항아리를 채우느라 정신이 없긴 했소만.'), L('요셉', '(물항아리… 마당 서쪽의 항아리 곁을 살펴보자.)')], () => { f.keys = 1; G.UI.quest(); done(); }); return true; }
  if (id === 'hapi' && act('x_wrong') && f.wrong < 1) { say([L('은잔 주인 하피', '네브카 말이오? …솔직히 그 젊은이가 가져갔는지는 모르겠소. 잔은 노점 동쪽 끝 상에 두었는데.'), L('은잔 주인 하피', '그날 바람이 몹시 불어서 차양이 펄럭이고 바구니들이 굴러다녔지…'), L('요셉', '(바람에 떨어졌다면… 노점 뒤 바구니들을 살펴보자.)')], () => { f.wrong = 1; G.UI.quest(); done(); }); return true; }
  if (id === 'keeper' && act('x_wrong') && f.wrong === 2) { say([L('요셉', '간수장, 이 은잔을 보시오. 장터 노점 뒤 바구니 속에 떨어져 있었소. 바람에 굴러떨어진 것이오.'), L('간수장', '…그렇다면 네브카는 아무 죄가 없군요. 제가 사람을 너무 쉽게 의심했습니다.'), L('간수장', '하피 어른께 잔을 돌려 드리고, 네브카에게 가서 직접 말씀해 주십시오.')], () => { f.wrong = 3; G.UI.quest(); done(); }); return true; }
  return lt0.apply(this, arguments); };

// ------------------------------------------------------------------ chasing, catching, jailing; searching
const RUN = {};
function cTick(dt) { if (!viz()) return; const p = P(), f = F();
  for (const c of CUL) { const n = Game.npc(c.id); if (!n || !n.vis) continue;
    if (f.jailed[c.id]) { if (!n._jail) { n._jail = 1; Game.npcTo(c.id, CELL[c.cell][0], CELL[c.cell][1], 0); } continue; }
    if (f.caught[c.id] && !n.follow && !n._cartBack && Game.npcFollow) Game.npcFollow(c.id, true); /* v18.34 after a reload the caught one follows again (he stood frozen and the quest could not finish) */
    if (f.caught[c.id] || !act(c.q)) continue; const r = RUN[c.id] || (RUN[c.id] = { t: 0, w: 0, b: -9, tired: 0 }), d = Math.hypot(n.x - p.x, n.z - p.z);
    if (d < 9) { r.t += dt; p.chaseT = 1.5; /* v18.24 a chase: running is allowed even in the village */ if ((r.w -= dt) <= 0) { r.w = 0.35; const dx = n.x - p.x, dz = n.z - p.z, l = Math.hypot(dx, dz) || 1, sp = r.t < 9 ? 4.6 : 2.3; Game.npcWalk(c.id, n.x + dx / l * 6, n.z + dz / l * 6, null, sp); }
      if (r.t - r.b > 3) { r.b = r.t; G.Life && G.Life.bubble && G.Life.bubble(c.id, r.t > 9 ? '헉… 헉… 숨이…' : c.run[Math.floor(Math.random() * c.run.length)], 2); } }
    else if (r.t > 0) r.t = Math.max(0, r.t - dt * 0.5); } }
Game.CTX.push(function (s) { const p = P(); if (!viz() || p.ride || p.act || p.climb || Game.cineOn) return null; const f = F(), out = [];
  for (const c of CUL) { const n = Game.npc(c.id); if (!n || !n.vis || !act(c.q) || f.jailed[c.id]) continue; const d = Math.hypot(n.x - p.x, n.z - p.z);
    if (!f.caught[c.id] && d < 1.7) out.push({ d: d - 1, label: `붙잡기 · ${c.n}`, x: n.x, z: n.z, y: 1.8, noMagnet: true, key: 'catch:' + c.id, use: () => { f.caught[c.id] = 1; n.walk = null; sfx('thud', { vol: 0.7 }); Game.CAM.shake = Math.max(Game.CAM.shake || 0, 0.25); say([{ n: c.n, t: c.got }, { n: '', t: '붙잡았어요 · 뒤따라와요 · 옥의 빈 감방 앞으로 데려가요' }], () => Game.npcFollow(c.id, true)); G.UI.quest(); } });
    if (f.caught[c.id] && Math.hypot(CELL[c.cell][0] - p.x, BARS_Z - p.z) < 2.4 && Math.hypot(n.x - p.x, n.z - p.z) < 6) out.push({ d: -0.5, label: `옥에 가두기 · ${c.n}`, x: CELL[c.cell][0], z: BARS_Z, y: 1.4, key: 'jail:' + c.id, use: () => {
      Game.npcFollow(c.id, false); f.jailed[c.id] = 1; delete f.caught[c.id]; n._jail = 0; G.UI.fade(() => { Game.npcTo(c.id, CELL[c.cell][0], CELL[c.cell][1], 0); n._jail = 1; sfx('door', { pitch: 0.7 }); sfx('click', { pitch: 0.5 }); }, () => G.UI.toast(`${c.n}${jo(c.n, '을', '를')} 옥에 가두었어요 · 간수장에게 알려요`)); G.UI.quest(); } }); }
  // searching for the key ring and the silver cup
  const spot = (x, z, label, ok, fn) => { if (!ok) return; const d = Math.hypot(x - p.x, z - p.z); if (d < 1.8) out.push({ d: d - 0.6, label, x, z, y: 0.8, anim: 'gather', dur: 0.8, hits: 2, key: 'px:' + label, fn }); };
  spot(-42.4, 10.6, '짚더미 뒤지기', act('x_keys') && f.keys === 1, () => { f.keys = 2; sfx('chain', { vol: 0.5, pitch: 1.2 }); G.UI.toast('짚더미 속에서 열쇠꾸러미를 찾았어요! · 앙쿠에게 가져가요'); G.UI.quest(); });
  spot(-15.8, -77.6, '노점 뒤 바구니 살피기', act('x_wrong') && f.wrong === 1, () => { f.wrong = 2; sfx('coin'); G.UI.toast('바구니 밑바닥에서 은잔이 나왔어요! · 바람에 굴러떨어졌던 거예요 · 간수장에게 보여요'); G.UI.quest(); });
  return out.length ? out : null; });
// a key ring glinting in the straw, a silver cup in a basket (only while they are being looked for)
const MX = G.m4(), MX2 = G.m4(); let kr = null, cup = null;
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (Game.mode !== 'play' || !viz()) return; const f = F(), W = Game.W();
  if (act('x_keys') && f.keys === 1) { if (!kr) { const g = new G.GB(19); g.box(1.2, 0.25, 0.9, { at: [0, 0.12, 0], c: 0xd8c070 }); for (let i = 0; i < 3; i++) g.box(0.03, 0.12, 0.02, { at: [0.2 + i * 0.05, 0.28, 0.1], rz: 0.3 * i, c: 0x9a8a6a }); g.cyl(0.07, 0.07, 0.02, 8, { at: [0.25, 0.27, 0.1], c: 0x6a6a6a }); kr = G.R.mesh(g); } G.m4trs(MX, -42.4, W.heightAt(-42.4, 10.6), 10.6, 0.4, 0, 0, 1, 1, 1); list.push({ mesh: kr, m: MX, outline: true }); }
  if (act('x_wrong') && f.wrong === 1) { if (!cup) { const g = new G.GB(23); g.lathe([[0.18, 0], [0.26, 0.12], [0.27, 0.32]], 12, { c: 0xc8a868 }); g.lathe([[0.03, 0.2], [0.05, 0.26], [0.04, 0.32], [0.08, 0.36], [0.07, 0.44]], 8, { c: 0xd8dce4 }); cup = G.R.mesh(g); } G.m4trs(MX2, -15.8, W.heightAt(-15.8, -77.6), -77.6, 0, 0, 0, 1, 1, 1); list.push({ mesh: cup, m: MX2, outline: true }); } };
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode === 'play') try { cTick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('prison', e); } return r; };
})(window.G);
