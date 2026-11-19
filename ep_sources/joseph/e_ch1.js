// =================================================================== v18.68 1장 다시 짜기 · 「구덩이와 노예 장터」 (e_ch1.js · 설계표_1장_v18_68.md)
/* ① 빈 구덩이: 1분 동안(게임 시간 오후 2시 → 6시) 실제로 기다려요. 둘러보기 · 기어오르기 · 형들 부르기(창 42:21) · 빵 냄새(37:25) · 벽 그림자 · 베냐민의 돌멩이 · 기도(세 단계)
      → 낙타 방울 소리 → 형들의 말(37:25–27) → 밧줄에 매달려 끌려 올라가기(37:28) → 흥정 · 애원 · 헤브론의 애통(지금 장면)
   ② 줄에 묶여 걷기 · 돌아보기 · 광야의 날들(지금 장면)
   ③ 광야의 모닥불 밤: 불 둘레 7m 안에서만 움직이고 사람에게 말을 걸 수 없어요. 물그릇 · 대추 한 알 · 낙타 곁 · 별과 기도 · 불가에서 자기 → 「여러 날 후」
   ④ 애굽 장터: 물통에서 씻기 → 줄 서기 · 늙은 가나안 포로의 귓속말 → 장터 단 위(지금 장면) · 가만히 서 있기 → 보디발 · 값 치르기
      → 청지기 네브를 따라 보디발의 집 대문까지 걷기 → 「2장 · 보디발의 집」 */
Object.assign(NM, { mkOld: '늙은 가나안 포로', mkNub: '누비아 소년', mkWoman: '끌려온 여인' });
const MKT = { trough: [SPOTS.market[0] + 7, SPOTS.market[1] - 6], line: [SPOTS.block[0] - 3.2, SPOTS.block[1] + 2.6] };
npcs.push(
  { id: 'mkOld', name: '늙은 가나안 포로', look: Object.assign({}, LOOK.elder, { top: 0x8a7a62, mantle: undefined }), x: MKT.line[0] - 1.2, z: MKT.line[1], face: Math.PI * 0.9, talkR: 2.6, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone },
  { id: 'mkNub', name: '누비아 소년', look: KID({ skin: 0x5a3a24, top: 0xd8c8a0, hairStyle: 'short' }), scale: 0.74, x: MKT.line[0] - 2.4, z: MKT.line[1] + 0.3, face: Math.PI, noTalk: true, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone },
  { id: 'mkWoman', name: '끌려온 여인', look: Object.assign({}, LOOK.woman, { top: 0x8a7a62 }), x: MKT.line[0] - 3.6, z: MKT.line[1] - 0.2, face: Math.PI * 1.1, noTalk: true, noBond: true, show: S => S.step === 'c1_market' && !S.q.mkGone });
{ for (const sp of specials) { if (sp.id === 'pitShout' || sp.id === 'pitPray') sp.on = () => false; } }
function ch1Build(W, P) { P('trough', MKT.trough[0], MKT.trough[1], { ry: 0.4, col: { r: 0.8, h: 0.6 } }); P('jars', MKT.trough[0] + 1.6, MKT.trough[1] - 0.8, { args: [2] }); }
const C1 = S => S.q.c1 || (S.q.c1 = { pitT: 0, call: {}, pray: 0 });
const PIT_T = 60; /* seconds in the pit (the user asked for one minute) */

// ------------------------------------------------------------------ the pit
const PRAY_P = [['살려 주세요… 하나님, 여기서 꺼내 주세요.', '구덩이는 대답이 없었습니다.'], ['아버지의 하나님… 지금 어디에 계세요? 제가 무엇을 잘못했나요?', '하늘은 둥글게 잘린 채 파랗기만 했습니다.'], ['…그래도 저를 버리지 마세요. 아버지가 그러셨어요. 어디로 가든지 지키신다고.', '요셉은 오래도록 무릎을 꿇고 있었습니다.']];
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy()) return null; const out = [], c = C1(S);
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.4)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (S.step === 'c1_pit' && S.q.inPit) {
    at(PIT.x, PIT.z, 3.4, { label: '구덩이 안에서…', key: 'c1Menu', use: () => pitMenu(S) }); }
  if (S.step === 'c1_caravan' && S.q.cNight) nightCtx(S, at);
  if (S.step === 'c1_market') marketCtx(S, at);
  return out.length ? out : null; });
function pitMenu(S) { const c = C1(S), p = Gm().P, t = c.pitT, ch = [];
  if (!c.look) ch.push({ t: '구덩이 둘러보기', then: () => { c.look = 1; GG.UI.quest(); setTimeout(() => say([T('그 구덩이는 빈 것이라 그 속에 물이 없었더라.', '창세기 37:24'), T('바닥은 바싹 말랐고, 벽은 손이 닿지 않을 만큼 높아요.')]), 30); } });
  if (c.look && !Object.keys(c.call).length) ch.push({ t: '위를 향해 형들을 부르기', then: () => setTimeout(() => callBrothers(S), 30) });
  if (t > 12 && t < 44 && !c.shade) ch.push({ t: '벽 그림자 쪽으로 옮겨 앉기', then: () => { c.shade = 1; p.cpose = { k: 'sitHug', t: 0, dur: 0, hold: true }; GG.UI.quest(); setTimeout(() => say([T('해가 머리 위에 오자 구덩이 바닥이 달아올랐어요. 요셉은 벽 그림자에 몸을 붙였습니다.')], () => { p.cpose = null; }), 30); } });
  /* (Benjamin's pebble was not in Scripture) */
  ch.push({ t: '무릎 꿇고 기도하기', then: () => { const k = t < 20 ? 0 : t < 42 ? 1 : 2; c.pray = Math.max(c.pray | 0, k + 1); p.emote = { k: 'pray', t: 0, dur: 4 }; GG.UI.quest(); setTimeout(() => say([T('요셉은 무릎을 꿇고 하나님을 불렀습니다.'), T(PRAY_P[k][1])]), 30); } });
  ch.push({ t: '그냥 기다리기' });
  say([{ n: '', t: t < 20 ? '(해가 구덩이 바닥을 내리쬐어요. 무엇을 할까?)' : t < 45 ? '(해가 벽을 타고 기울어 가요. 무엇을 할까?)' : '(하늘이 붉어져요. 무엇을 할까?)', choices: ch }]); }
function callBrothers(S) { const c = C1(S); c.call['up'] = 1; Gm().sfx('blip', { pitch: 0.8 }); GG.UI.quest();
  say([T('요셉은 구덩이 위를 향해 형들을 불렀습니다. 대답은 없었습니다.'), T('훗날 형들은 이 날을 이렇게 기억했습니다: 「그가 애걸할 때에 우리가 그 마음의 괴로움을 보고도 듣지 아니하였으므로」', '창세기 42:21')]); }
function pitTick(dt, S) { const c = C1(S); if (GG.Cine.on) return; c.pitT += dt; S.time = 14 + 4 * Math.min(1, c.pitT / PIT_T);
  if (c.pitT > 22 && !c.bread && !GG.UI.busy()) { c.bread = 1; say([T('그들이 앉아 음식을 먹었습니다. 위에서 빵을 뜯는 소리가 들려왔어요.', '창세기 37:25')]); }
  if (c.pitT > PIT_T - 6 && !c.bells && !GG.UI.busy()) { c.bells = 1; Gm().sfx('bell', { vol: 0.5 }); say([T('하늘이 붉어지고 구덩이 안이 어두워졌습니다. 멀리서 낙타 방울 소리와 낯선 말소리가 들려왔습니다.')]); } }

// ------------------------------------------------------------------ the sale: the rope comes down between the brothers' words and the bargaining
let splitSold = false, splitMkt = false;
{ const play0 = GG.Cine.play; GG.Cine.play = function (shots, done, o) {
    if (splitSold && shots && shots[0] && /그들이 앉아 음식을 먹다가/.test(shots[0].t || '')) { splitSold = false; const a = shots.slice(0, 4), b = shots.slice(4);
      return play0.call(this, a, () => setTimeout(() => ropeUp(() => play0.call(GG.Cine, b, done, o)), 30), o); }
    if (splitMkt && shots && shots[0] && /애굽의 장터/.test(shots[0].t || '')) { splitMkt = false; const bi = shots.findIndex(s => s.black), a = shots.slice(0, 3), b = shots.slice(3, bi), last = shots[bi];
      return play0.call(this, a, () => setTimeout(() => standStill(() => play0.call(GG.Cine, b, () => { try { last.fn && last.fn(); } catch (e) { } followNeb(Gm().S(), done); }, o)), 30), o); }
    return play0.apply(this, arguments); }; }
function ropeUp(after) { say([T('밧줄 하나가 구덩이 안으로 내려왔습니다. 요셉을 구덩이에서 끌어올리고…', '창세기 37:28')], () =>
  GG.UI.minigame('push', { title: '밧줄을 붙잡고 버티기', hint: '꾹 눌러 밧줄을 붙잡아요. 손이 미끄러지면 잠깐 놓았다가 다시 잡아요.', btn: '붙잡기' }, ok => {
    if (!ok) { say([T('손이 미끄러져 다시 떨어졌습니다. 밧줄이 또 내려왔어요.')], () => ropeUp(after)); return; } Gm().sfx('rope'); after(); })); }

// ------------------------------------------------------------------ the night by the caravan's fire (played, not watched)
function cinCaravanNight(S, G, then) {
  const [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  RT.car = null; const fd = (a, b) => { if (GG.Cine.hold) { a(); b(); } else fade(a, b); };
  fd(() => { S.time = GG.Game.clockTo(S, 20.6, 0); place('ishmael', cx + 2, cz + 1.4, -2.2, { sit: true }); place('midian', cx - 1.8, cz + 1.8, 2.4, { sit: true }); place('ishBoy', cx + 1.6, cz - 2.2, -0.6);
    ['camel1', 'camel2', 'camel3'].forEach((id, i) => place(id, cx + 6 + i * 2.6, cz - 3 + i, -1.2)); G.teleport(cx - 0.4, cz - 3.4, 0.2); cpose(null); },
  () => cine([
    { cam: [cx - 9, h + 3.6, cz - 7], cam2: [cx - 6, h + 2.4, cz - 4.6], look: [cx, h + 0.8, cz], dur: 6, t: '광야의 밤. 대상은 길가에 불을 피우고 쉬었습니다. 요셉의 줄 끝은 낙타 말뚝에 매여 있었습니다.', music: 'j_night' },
    { fn: () => walkTo('ishBoy', cx + 0.4, cz - 4.4, 1.2, n => { face('ishBoy', G.P.x, G.P.z); n.act = 'present'; }), cam: [cx + 2.4, h + 1.1, cz - 5.4], look: [cx - 0.2, h + 0.8, cz - 3.6], dur: 4.5, n: '대상의 아이', t: '…물. 마셔.', e: 'tender' },
  ], () => { const n = G.npc('ishBoy'); if (n) { n.act = null; walkTo('ishBoy', cx + 1.6, cz - 2.2, 1.2, m => { m.sit = true; }); }
    const c = C1(S); c.n = { t: 0, cx: cx - 0.4, cz: cz - 3.4, bowl: [cx + 0.2, cz - 4.6], date: [cx - 2.2, cz - 5.4], then }; S.q.cNight = 1; for (const id of NIGHT_IDS) { const m = G.npc(id); if (m) m.d.noTalk = true; }
    GG.UI.quest(); GG.UI.hint && GG.UI.hint('줄 끝까지만 움직일 수 있어요 · 사람들에게 말을 걸 수 없어요 · 불가에서 잠들면 밤이 지나가요', 'rope', 'tap'); }));
}
const NIGHT_IDS = ['ishmael', 'midian', 'ishBoy', 'camel1', 'camel2', 'camel3'];
function nightCtx(S, at) { const c = C1(S), n = c.n; if (!n) return;
  if (!c.drank) at(n.bowl[0], n.bowl[1], 2, { label: '물그릇 두 손으로 들어 마시기', key: 'c1Bowl', use: () => drinkBowl(S, false) });
  if (!c.date) at(n.date[0], n.date[1], 1.8, { label: '굴러온 대추 한 알 줍기', key: 'c1Date', use: () => { c.date = 1; Gm().P.emote = { k: 'pick', t: 0, dur: 0.9 }; Gm().P.stam = Math.min((GG.Vitals && GG.Vitals.cap) || 140, (Gm().P.stam || 0) + 25); GG.UI.quest(); say([T('불 건너편에서 대추 한 알이 굴러왔습니다. 대상의 아이가 모른 척 고개를 돌렸어요.')]); } });
  const cm = Gm().npc('camel1'); if (cm && !c.camel) at(cm.x - 1.2, cm.z + 0.6, 2.6, { label: '엎드린 낙타 곁에 붙어 앉기', key: 'c1Camel', use: () => { c.camel = 1; Gm().P.cpose = { k: 'sitHug', t: 0, dur: 0, hold: true }; if (GG.Climate) GG.Climate.cold = false; GG.UI.quest(); say([T('밤바람이 차가워지자, 요셉은 엎드린 낙타의 따뜻한 옆구리에 몸을 붙였습니다. 낙타가 콧김을 내뿜었어요.')], () => { Gm().P.cpose = null; }); } });
  at(SPOTS.caravanNight[0], SPOTS.caravanNight[1], 3.6, { label: '불가에 앉기', key: 'c1Fire', use: () => { const ch = []; if (!c.prayed) ch.push({ t: '별을 올려다보며 기도하기', then: () => setTimeout(() => prayStars(S), 30) }); ch.push({ t: '불가에서 자기', then: () => setTimeout(() => { if (!c.drank) { GG.UI.toast('목이 너무 말라 잠이 오지 않아요 · 물그릇'); return; } if (!c.prayed) { GG.UI.toast('잠들기 전에 하늘을 올려다봐요'); return; } sleepNight(S); }, 30) }); ch.push({ t: '일어나기' }); Gm().P.cpose = { k: 'sitg', t: 0, dur: 0, hold: true }; say([{ n: '', t: '(불가에 앉았어요. 무엇을 할까?)', choices: ch }], () => { if (Gm().P.cpose && Gm().P.cpose.k === 'sitg') Gm().P.cpose = null; }); } }); }
function drinkBowl(S, late) { const c = C1(S); c.drank = 1; Gm().P.emote = { k: 'kneel', t: 0, dur: 1.4 }; Gm().sfx('pour'); GG.UI.quest();
  say(late ? [T('한참 동안 고개를 돌리고 있던 요셉은, 목마름을 이기지 못하고 끝내 그 물을 집어 들었습니다.')] : [T('요셉은 두 손으로 물그릇을 들어 마셨습니다.')]); }
function prayStars(S) { const c = C1(S), G = Gm(), [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz); c.prayed = 1; GG.UI.quest(); G.P.emote = { k: 'pray', t: 0, dur: 6 };
  cine([
    { cam: () => [G.P.x + 0.2, hAt(G.P.x, G.P.z) + 0.5, G.P.z - 0.4], look: [cx - 6, h + 30, cz + 14], dur: 8, t: '요셉은 별을 올려다보며 하나님을 불렀습니다. 아버지 야곱이 벧엘에서 들었다는 말씀이 떠올랐습니다.', e: 'pray' },
    { cam: () => [G.P.x + 1, hAt(G.P.x, G.P.z) + 0.7, G.P.z - 1], look: () => [G.P.x, hAt(G.P.x, G.P.z) + 0.9, G.P.z], dur: 8, t: '「내가 너와 함께 있어 네가 어디로 가든지 너를 지키며…」', ref: '창세기 28:15', e: 'pray' }
  ], () => { G.P.emote = null; GG.UI.toast('불가에서 자면 밤이 지나가요'); }); }
function sleepNight(S) { const c = C1(S), G = Gm(), n = c.n, [cx, cz] = SPOTS.caravanNight, h = hAt(cx, cz);
  const go = () => { S.q.cNight = 0; for (const id of NIGHT_IDS) { const m = G.npc(id); if (m) m.d.noTalk = false; } GG.UI.hint && GG.UI.hint(null);
    cine([{ black: true, title: '여러 날 후', sub: '광야를 건너 애굽으로', cam: [cx, h + 2, cz], look: [cx, h, cz - 3], dur: 3.6, fn: () => { cpose(null); S.q.night = 1; S.day += 4; S.time = GG.Game.clockTo(S, 8.4, 1); if (!n.then) caravanStart(S, G, false); } }],
      () => { GG.Game.musicOverride = null; G.UI.quest(); if (n.then) n.then(); }); };
  if (GG.Sleep && GG.Sleep.sky) GG.Sleep.sky('그날 밤 광야의 하늘에도, 헤브론에서 보던 그 별들이 떠 있었습니다.', go); else go(); }
function nightTick(dt, S) { const c = C1(S), n = c.n; if (!n || GG.Cine.on) return; const P = Gm().P; n.t += dt;
  const dx = P.x - n.cx, dz = P.z - n.cz, d = Math.hypot(dx, dz), R = 7; if (d > R) { P.x = n.cx + dx / d * R; P.z = n.cz + dz / d * R; P.vx *= 0.2; P.vz *= 0.2; if (!n.tug || n.t - n.tug > 3) { n.tug = n.t; GG.UI.toast('줄이 팽팽하게 당겨져요'); Gm().sfx('rope', { vol: 0.4 }); } }
  if (!c.drank && n.t > 25 && !GG.UI.busy()) drinkBowl(S, true); }

// ------------------------------------------------------------------ the slave market
function marketCtx(S, at) { const m = S.q.mk | 0;
  if (m === 0) at(MKT.trough[0], MKT.trough[1], 2.8, { label: '물통에서 얼굴과 팔 씻기', key: 'mkWash', use: () => { S.q.mk = 1; Gm().P.emote = { k: 'gather', t: 0, dur: 2 }; Gm().sfx('splash', { vol: 0.5 }); GG.UI.quest(); say([T('광야의 흙먼지가 물통에 뿌옇게 풀렸습니다.')]); } });
  if (m === 1) at(MKT.line[0], MKT.line[1], 3, { label: '포로들 곁에 줄 서기', key: 'mkLine', use: () => { S.q.mk = 3; Gm().teleport(MKT.line[0], MKT.line[1], Math.PI); GG.UI.quest(); } }); /* (the old captive's whisper was not in Scripture) */
  if (m === 3) at(MKT.line[0], MKT.line[1], 3, { label: '단 위로 끌려 올라가기', key: 'mkUp', use: () => { S.q.mk = 4; splitMkt = true; cinMarket(S, Gm()); } }); }
function standStill(after) { GG.UI.minigame('balance', { title: '가만히 서 있기', hint: '사람들이 팔을 만지고 이를 들여다봐요. 고개를 숙이고, 떨리는 몸을 가운데로 붙잡아요.', dur: 9 }, ok => { if (!ok) { say([T('요셉이 움찔하자 줄이 홱 당겨졌습니다.')], () => standStill(after)); return; } after(); }); }
const NEB_PATH = [[-14, 104], [-20, 92], [-28, 72]];
function followNeb(S, done) { const G = Gm(), n = G.npc('neb'); S.q.mkGone = 1; S.q.bound = 1;
  if (!n) { done && done(); return; } n.forceVis = true; place('neb', SPOTS.block[0] + 2, SPOTS.block[1] + 4, Math.PI * 0.9); G.teleport(SPOTS.block[0] + 0.6, SPOTS.block[1] + 5.6, Math.PI * 0.9);
  say([T('청지기가 저울에 은을 달아 상인에게 건넸습니다. 상인은 요셉의 줄을 청지기에게 넘겼습니다.'), T('보디발 집의 청지기를 따라 애굽의 거리를 걸어요.')], () => { S.q.follow = { i: 0, done }; GG.UI.quest(); }); }
function followTick(dt, S) { const f = S.q.follow; if (!f || GG.UI.busy() || GG.Cine.on) return; const G = Gm(), n = G.npc('neb'); if (!n) return; const d = G.dist(n.x, n.z);
  if (d > 7) { if (n.walk) n.walk = null; n.face = Math.atan2(G.P.x - n.x, G.P.z - n.z); f.wt = (f.wt || 0) + dt; if (f.wt > 5) { f.wt = 0; GG.Life.bubble('neb', '이쪽이다. 서둘러라.', 2.6); } return; }
  if (!n.walk) { if (f.i >= NEB_PATH.length) { const done = f.done; S.q.follow = null; n.forceVis = undefined; say([T('시위대장 보디발의 집이에요. 높은 흙벽 너머로 종려나무와 연못이 보였습니다.')], () => cine([{ black: true, title: '2장 · 보디발의 집', sub: '창세기 39:1–20', cam: [G.P.x, hAt(G.P.x, G.P.z) + 2, G.P.z + 4], look: [G.P.x, hAt(G.P.x, G.P.z), G.P.z], dur: 4 }], () => done && done())); return; }
    const [x, z] = NEB_PATH[f.i]; G.npcWalk('neb', x, z, () => { f.i++; }, 1.5); } } /* (the steward only leads the way) */

// ------------------------------------------------------------------ the steps
Object.assign(steps.c1_pit, {
  obj: S => { const t = C1(S).pitT; return t < 20 ? '빈 구덩이 속에서 · 해가 머리 위로 올라와요' : t < 45 ? '해가 구덩이 벽을 타고 기울어요…' : t < PIT_T ? '하늘이 붉어져요…' : '위에서 무슨 소리가 나요'; },
  list: S => { const c = C1(S); return [{ t: '구덩이 둘러보기', ok: !!c.look }, { t: `형들을 부르기 (${Object.keys(c.call).length}/3)`, ok: Object.keys(c.call).length >= 1 }, { t: `벽을 기어오르려 해 보기 · 점프 (${Math.min(3, S.q.climb || 0)})`, ok: (S.q.climb || 0) >= 1 }, { t: '무릎 꿇고 기도하기', ok: (c.pray | 0) >= 1 }]; },
  target: () => null,
  check: S => { const c = C1(S); return c.pitT >= PIT_T && Object.keys(c.call).length >= 1 && (c.pray | 0) >= 1 && !!c.look; },
  done(S, G, next) { G.UI.hint(null); splitSold = true; cinSold(S, G, next); } });
Object.assign(steps.c1_caravan, {
  obj: S => S.q.cNight ? '광야의 밤 · 줄 끝에서' : S.q.night ? '대상을 따라 애굽으로' : '줄에 묶여 이스마엘 대상을 따라 걷기',
  list: S => { if (!S.q.cNight) return [{ t: '광야의 밤', ok: !!S.q.night }, { t: '애굽 국경', ok: !!S.q.reveal }]; const c = C1(S); return [{ t: '물그릇의 물 마시기', ok: !!c.drank }, { t: '대추 한 알 (그냥 둬도 돼요)', ok: !!c.date }, { t: '낙타 곁에서 몸 녹이기 (그냥 둬도 돼요)', ok: !!c.camel }, { t: '별을 보며 기도하기', ok: !!c.prayed }, { t: '불가에서 자기', ok: false }]; } });
Object.assign(steps.c1_market, {
  obj: S => ['장터 어귀 물통에서 씻기', '포로들 곁에 줄 서기', '포로들 곁에 줄 서기', '단 위로 끌려 올라가기', '장터의 단 위에서', '청지기를 따라 보디발의 집으로'][S.q.follow ? 5 : Math.min(4, S.q.mk | 0)],
  list: S => { const m = S.q.mk | 0; return [{ t: '물통에서 씻기', ok: m >= 1 }, { t: '줄 서기', ok: m >= 3 }, { t: '단 위에서', ok: m >= 5 || !!S.q.follow }]; },
  target: S => S.q.follow ? 'npc:neb' : [{ x: MKT.trough[0], z: MKT.trough[1] }, { x: MKT.line[0], z: MKT.line[1] }, { x: MKT.line[0], z: MKT.line[1] }, { x: MKT.line[0], z: MKT.line[1] }, null][Math.min(4, S.q.mk | 0)],
  enter(S, G, re) { if (GG.Cine.hold) setTimeout(() => { GG.Cine.hold = false; }, 0); if ((S.q.mk | 0) >= 4) S.q.mk = 3; S.q.bound = 1; cpose(null);
    if (!re) { G.teleport(SPOTS.market[0] + 10, SPOTS.market[1] - 10, -0.6); say([T('애굽의 장터. 이스마엘 상인들은 포로들을 장터 어귀에 세웠습니다.'), T('장터 어귀 물통에서 얼굴과 팔의 흙먼지를 씻어요.')]); } },
  talk: { mkOld(S, G) { return false; } } }); /* (the old captive stands in the line; he has no lines of his own) */
function ch1Tick(dt, S) { if (!S) return; try { if (S.step === 'c1_pit' && S.q.inPit) pitTick(dt, S); if (S.step === 'c1_caravan' && S.q.cNight) nightTick(dt, S); if (S.step === 'c1_market' && S.q.follow) followTick(dt, S); } catch (e) { console.error('ch1', e); } }
