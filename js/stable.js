/* 약속의 길 — 총리의 마구간 (v18.33)
   요셉이 총리가 된 뒤(수레를 받은 뒤), 총리의 집 가까이에 마구간이 있어요. 마구간지기 케티에게 말하면:
   · 말 사기 — 흰 말(은 300) · 갈색 말(은 200) · 검은 말(은 250) (v18.45 값 올림) · 이야기가 끝난 뒤 소달구지(은 360) · 사이드 퀘스트로 유람 마차. 산 말은 마구간에서 기다려요(마구간 덕분에 탈것을 셋까지 둘 수 있어요).
   · 다닐 탈것 고르기 — 「수레로 다니기」 또는 「말 타고 다니기」. 둘 중 하나만 써요.
       수레: 왼쪽 「수레 부르기」 · 말은 마구간에서 쉬어요.   말: 「말 부르기」(휘파람) · 수레는 마구간 옆에 세워 둬요.
   · 말 돌보기 — 은 3으로 지친 말들을 쉬게 해요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Rd = G.Ride; if (!EP || !Rd || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const ok = s => !!(s && s.q && s.q.chariotOk);
const mode = s => (s && s.flags && s.flags.travel) || 'cart';
let ST = null; /* { x, z, f } the stable yard */
/* v18.35 a horse cost about 150 shekels of silver (왕상 10:29) — forty sacks of wheat, not ten */
const HORSES = [{ k: 'white', n: '흰 말', hide: 0xf2ece2, mane: 0xe6d6b0, price: 300 }, { k: 'bay', n: '갈색 말', hide: 0x8a5a36, mane: 0x2a1e16, price: 200 }, { k: 'black', n: '검은 말', hide: 0x2e2a28, mane: 0x141010, price: 250 }]; /* v18.45 prices up a quarter (240/150/190 → 300/200/250): a horse is a great man's thing */
const OX_PRICE = 360; /* v18.45 the ox cart, after the story */
/* the yard: open ground a little way from the vizier's house, outside the house grounds */
function findSpot(W) { const hx = 10, hz = -140; let best = null;
  for (const r of [26, 30, 34, 38]) { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r; if (G.Cart && G.Cart.town && G.Cart.town(x, z)) continue;
      let clear = true; for (let i = -2; i <= 2 && clear; i++) for (let j = -2; j <= 2 && clear; j++) if (Game.solidAt(x + i * 2.4, z + j * 2, 0.4) || W.slopeAt(x + i * 2.4, z + j * 2) > 0.3 || (W.water && W.heightAt(x + i * 2.4, z + j * 2) < W.water.level + 0.5)) clear = false;
      if (clear) { const f = Math.atan2(hx - x, hz - z), ca = Math.cos(f), sa = Math.sin(f); let lo = 1e9, hi = -1e9; /* v18.34 the whole yard must be nearly level (posts and fence floated on a slope) */
        for (const lx of [-6.6, 0, 6.6]) for (const lz of [-3.6, 3, 10.3]) { const h = W.heightAt(x + ca * lx + sa * lz, z - sa * lx + ca * lz); lo = Math.min(lo, h); hi = Math.max(hi, h); }
        if (hi - lo < 0.6) { best = { x, z, f, lo }; break; } } } if (best) break; }
  return best || { x: hx + 28, z: hz, f: -Math.PI / 2 }; }
function build(W) { ST = findSpot(W); const { x, z, f } = ST, y = ST.lo !== undefined ? Math.min(W.heightAt(x, z), ST.lo + 0.15) : W.heightAt(x, z), ca = Math.cos(f), sa = Math.sin(f), at = (lx, lz) => [x + ca * lx + sa * lz, z - sa * lx + ca * lz];
  W.place((g, M) => { const WD = 0x8a6a48, DK = 0x5a4230, TH = 0xc8b078;
    for (const lx of [-5, -1.7, 1.7, 5]) for (const lz of [-2.2, 2.2]) g.cyl(0.12, 0.14, 2.8, 7, { m: M, at: [lx, 1.4, lz], c: WD });
    g.box(10.6, 0.16, 5.2, { m: M, at: [0, 2.85, 0], c: TH, j: 0.08 }); for (let i = 0; i < 12; i++) g.box(0.9, 0.06, 5.4, { m: M, at: [-5 + i * 0.9, 2.96, 0], c: i % 2 ? 0xb89a60 : TH, j: 0.06 });
    for (let i = -1; i <= 1; i++) { g.box(0.1, 1.1, 4.2, { m: M, at: [i * 3.4, 0.55, -0.1], c: DK }); }
    for (const sx of [-1, 1]) { g.box(0.1, 1.0, 9, { m: M, at: [sx * 6.6, 0.55, 5.8], c: WD }); for (const zz of [1.6, 4, 6.4, 8.8, 10.2]) g.cyl(0.08, 0.09, 1.2, 6, { m: M, at: [sx * 6.6, 0.6, zz], c: DK }); }
    for (const sx of [-1, 1]) for (const yy of [0.95, 0.5]) g.box(5.5, 0.1, 0.1, { m: M, at: [sx * 3.85, yy, 10.3], c: WD });
    for (const lx of [-4.2, 0, 4.2]) { g.box(1.6, 0.4, 0.5, { m: M, at: [lx, 0.35, -1.8], c: 0x6a5a48 }); g.box(1.5, 0.08, 0.42, { m: M, at: [lx, 0.52, -1.8], c: 0xc8a050 }); }
    for (const [lx, lz] of [[-6, -3.4], [-5.2, -3.6], [6, -3.2]]) { g.box(1.0, 0.7, 0.8, { m: M, at: [lx, 0.35, lz], ry: lx, c: 0xd8c078, j: 0.1 }); }
    g.box(1.2, 0.5, 0.06, { m: M, at: [0, 1.7, 2.26], c: 0x2c4f9a }); g.box(1.3, 0.06, 0.08, { m: M, at: [0, 1.98, 2.27], c: 0xe2b440 }); }, x, z, { y, ry: f, col: null });
  for (const lx of [-5, -1.7, 1.7, 5]) for (const lz of [-2.2, 2.2]) { const [px, pz] = at(lx, lz); W.addCol({ x: px, z: pz, r: 0.2, h: 2.8 }); }
  /* v18.35b the yard fence is solid: use the gate (v18.42: too high to jump) */ for (const sx of [-1, 1]) { const [px, pz] = at(sx * 6.6, 5.8), [qx, qz] = at(sx * 3.85, 10.3); W.addCol({ x: px, z: pz, w: 0.3, d: 9, a: f, h: 1.35 }); W.addCol({ x: qx, z: qz, w: 5.5, d: 0.3, a: f, h: 1.35 }); } { const [gx, gz] = at(0, 10.3); (G.GATES = G.GATES || []).push({ x: gx, z: gz, a: f, col: W.addCol({ x: gx, z: gz, w: 2.2, d: 0.3, a: f, h: 1.35 }), open: 0, want: 0 }); }
  for (const lx of [-3.4, 0, 3.4]) { const [px, pz] = at(lx, -0.1); W.addCol({ x: px, z: pz, w: 0.2, d: 4.2, a: f, h: 1.1 }); }
  for (const sx of [-1, 1]) { const [px, pz] = at(sx * 6.6, 5.8); W.addCol({ x: px, z: pz, w: 0.2, d: 9, a: f, h: 1.0 }); }
  ST.yard = at(0, 6.5); ST.keeper = at(2.4, 3.2); ST.cart = at(10.5, 4); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { build(W); } catch (e) { console.error('stable', e); } };
(EP.places = EP.places || []).push({ n: '마구간', x: 38, z: -140, when: s => ok(s) });
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
EP.npcs.push({ id: 'stKeeper', name: '마구간지기 케티', look: Object.assign({}, lookOf('ameni') || {}, { top: 0xd8c8a0, trim: 0x8a5a36 }), x: 38, z: -137, face: 0, talkR: 2.6, noBond: false, show: s => ok(s),
  persona: '말이라면 눈빛만 봐도 기분을 안다는 마구간지기. 말에게 이름을 붙여 주는 걸 좋아한다.' });
/* stand the keeper and the cart in the right places once the yard is known */
let placed = false;
function place() { if (placed || !ST) return; const n = Game.ENT.npcs.stKeeper; if (!n) return; placed = true; Game.npcTo && Game.npcTo('stKeeper', ST.keeper[0], ST.keeper[1], ST.f + Math.PI, false); n.d.x = ST.keeper[0]; n.d.z = ST.keeper[1]; }
Rd.cap = (cap0 => s => cap0(s) + (ok(s) ? 2 : 0))(Rd.cap); /* the vizier's stable keeps two more */
if (G.Build) { const ss0 = G.Build.stableSpot; G.Build.stableSpot = function (s) { const r = ss0 ? ss0.apply(this, arguments) : null; if (r) return r; return ST && ok(s) ? [ST.yard[0] + (Math.random() - 0.5) * 6, ST.yard[1] + (Math.random() - 0.5) * 4] : null; }; }
// ------------------------------------------------------------------ talking to Keti
const KN = '마구간지기 케티';
function menu(done) { const s = S(), own = Rd.list.filter(r => r.m.sp === 'horse'), m = mode(s);
  const ch = [{ t: '말 사기', then: () => setTimeout(buy, 40) }]; if (own.length || m !== 'cart') ch.push({ t: m === 'cart' ? '이제 말 타고 다니기' : '이제 수레로 다니기', then: () => setTimeout(() => setMode(m === 'cart' ? 'horse' : 'cart'), 40) });
  if (Rd.list.length) ch.push({ t: '말 돌보기 (은 5)', then: () => { if (s.silver < 5) { G.UI.toast('은이 모자라요'); return; } Game.silver(-5); for (const r of Rd.list) { r.m.st = 100; r.tired = false; } pop('말들이 푹 쉬었어요', '기운이 가득해요', 'donkey'); } });
  { const own2 = s.flags.vehOwn || {}; if (s.flags.free && !own2.ox) ch.splice(1, 0, { t: `소달구지 사기 · 은 ${OX_PRICE}`, then: () => setTimeout(buyOx, 40) }); /* v18.45 */
    const kinds = ['chariot'].concat(Object.keys(own2).filter(k => own2[k] && G.Cart && G.Cart.VEH && G.Cart.VEH[k])); if (kinds.length > 1) ch.splice(1, 0, { t: '탈 수레 고르기', then: () => setTimeout(pickVeh, 40) }); }
  ch.push({ t: '그만 이야기하기' });
  G.UI.say([{ n: KN, t: `총리님! 지금은 ${m === 'cart' ? (G.Cart && G.Cart.VEH ? G.Cart.VEH[G.Cart.veh()].n : '수레') : '말'}로 다니시지요.${own.length ? ` 마구간엔 ${own.map(r => r.m.name).join(', ')}이(가) 있어요.` : ' 아직 총리님 말은 없어요.'} 무엇을 할까요?`, choices: ch }], done); }
/* v18.45 the ox cart (창 45:19 「수레」): slow, but four can ride and it carries twice as much */
function buyOx() { const s = S(); if (s.silver < OX_PRICE) { G.UI.say([{ n: KN, t: `소달구지는 은 ${OX_PRICE}이에요. 소 두 마리와 수레까지 다 드리는 값이랍니다. 조금 더 모아 오세요!` }]); return; }
  G.UI.say([{ n: KN, t: `소달구지 말씀이시군요! 소 두 마리와 수레까지, 은 ${OX_PRICE}이에요.` }, { n: KN, t: '전차보다 훨씬 느리지만, 네 사람이 함께 타고 짐도 두 배는 실어요. 가족 나들이에 그만이지요.', choices: [{ t: `사겠소 · 은 ${OX_PRICE}`, then: () => { Game.silver(-OX_PRICE); (s.flags.vehOwn = s.flags.vehOwn || {}).ox = 1; sfx('coins'); pop('소달구지를 샀어요', '케티에게 「탈 수레 고르기」로 바꿔 타요', 'donkey'); setTimeout(() => G.Cart && G.Cart.setVeh && G.Cart.setVeh('ox'), 600); } }, { t: '다음에 사겠소' }] }]); }
function pickVeh() { const s = S(), own2 = s.flags.vehOwn || {}, V = G.Cart && G.Cart.VEH; if (!V) return; const cur = G.Cart.veh();
  const kinds = ['chariot'].concat(['ox', 'coach'].filter(k => own2[k])); const note = { chariot: '빠르고 둘이 타요', ox: '느리지만 넷이 타고 짐이 많아요', coach: '셋이 타는 화려한 마차예요' };
  G.UI.say([{ n: KN, t: '어느 수레를 내어 드릴까요?', choices: kinds.map(k => ({ t: `${V[k].n}${k === cur ? ' ✓' : ''} · ${note[k]}`, then: () => { if (k !== cur && G.Cart.setVeh(k)) setMode('cart'); } })).concat([{ t: '그대로 두겠소' }]) }]); }
/* v18.46 Keti's story first, then the coach.
   1 「케티의 작은 바퀴」 — Keti, son of the old wheelwright Nebseni of the south village, left home for horses against his father's wish and
     has not been back since the flood and the famine. Joseph carries his greeting; the father, whose hands now shake, sends back his adze
     and the drawing of the coach he always wanted to build. Father and son are reconciled (Joseph speaks of his own father).
   2 「총리의 유람 마차」 — Keti builds his father's coach for the vizier; afterwards the old man comes to the stable to see it. */
const DAD = '늙은 수레장이 네브세니', KID = 'ketiDad';
Object.assign(Game.ITEMS, { kTools: { n: '아버지의 자귀와 마차 그림', cat: 'quest', p: 0, ic: 'tool', c: '#c8a070', d: '네브세니가 아들 케티에게 보내는 것 · 퀘스트 물건' } });
const Q = EP.quests = EP.quests || {};
Q.ketiQ = { giver: 'stKeeper', title: '케티의 작은 바퀴', when: s => !!(s.flags && s.flags.free) && !s.flags.ketiStory,
  offer: [{ n: KN, t: '(작은 나무 바퀴를 만지작거리다가) …아, 총리님. 오셨어요?', e: 'sad' },
    { n: KN, t: '이건 제 아버지가 깎아 주신 장난감 바퀴예요. 아버지는 남쪽 마을의 수레장이셨어요. 바로의 수레도 고치던 솜씨 좋은 분이셨지요.' },
    { n: KN, t: '저는 바퀴보다 말이 좋아서, 아버지 뜻을 거스르고 도성으로 왔어요. 그 뒤로 큰물이 나고 흉년이 들면서… 한 번도 찾아뵙지 못했어요.', e: 'sad' },
    { n: KN, t: '아버지가 아직 저를 서운해하실까 봐 겁이 나요. 총리님, 남쪽 마을에 가시거든 아버지 안부만 좀 여쭤 주시겠어요?' }],
  prog: s => Game.inv('kTools') > 0 ? { n: KN, t: '아버지를 만나셨어요? …무슨 말씀을 하시던가요?' } : { n: KN, t: '아버지 이름은 네브세니예요. 남쪽 마을 우물가 가까이에 사세요.' },
  obj: [{ t: '남쪽 마을의 늙은 수레장이 네브세니 만나기', ok: s => !!s.flags.ketiMet }, { t: '아버지가 보낸 것을 케티에게 전하기', ok: s => Game.inv('kTools') > 0 }],
  take: { kTools: 1 },
  done: [{ n: '요셉', t: '케티, 아버님께서 이것을 전해 달라 하셨소.' },
    { n: KN, t: '이건… 아버지의 자귀! 그리고 이 그림은, 어릴 때 아버지가 밤마다 그리시던 그 마차예요.', e: 'tender' },
    { n: '요셉', t: '아버님께서 그러셨소. 「내가 바퀴만 고집해서 그 아이 마음을 몰라주었다」고. 그리고 이 마차를 그대가 꼭 완성해 주면 좋겠다고 하셨소.' },
    { n: KN, t: '(눈물을 훔치며) 아버지가 저를 원망하지 않으셨다니… 총리님, 정말 고맙습니다.', e: 'cry' },
    { n: '요셉', t: '나도 오래 떨어져 지낸 아버지가 있소. 스무 해 남짓 만에야 다시 뵈었지. 살아 계실 때 찾아뵙는 것보다 큰 효도는 없소.', e: 'tender' },
    { n: KN, t: '네, 다음 장날엔 꼭 아버지를 찾아뵐게요. 그리고… 이 그림 속 마차, 제가 완성해 보고 싶어요.', e: 'happy' }],
  reward: { xp: 30 },
  finish: s => { s.flags.ketiStory = 1; setTimeout(() => pop('케티와 아버지가 화해했어요', '케티에게 다시 말을 걸어 보세요', 'heart'), 900); } };
Q.coachQ = { giver: 'stKeeper', title: '총리의 유람 마차', when: s => !!(s.flags && s.flags.free && s.flags.ketiStory) && !(s.flags.vehOwn && s.flags.vehOwn.coach),
  offer: [{ n: KN, t: '총리님, 아버지가 남기신 그 마차 그림 말이에요. 매일 밤 펼쳐 보고 있어요.' },
    { n: KN, t: '흰 회칠에 금 테를 두르고, 세마포 차양을 단 큰 유람 마차예요. 장인들과 함께 이 마차를 총리님을 위해 꼭 만들어 드리고 싶어요.', e: 'happy' },
    { n: KN, t: '그발의 백향목 넷, 세마포 셋, 청금석 하나를 구해 주세요. 장인들 품삯으로 은 120도 필요해요.' }],
  prog: { n: KN, t: '백향목은 그발의 백향목 장수 하람에게, 세마포는 장터에, 청금석은 동굴 깊은 곳에 있어요. 품삯 은 120도 잊지 마세요!' },
  obj: [{ t: s => `백향목 (${Math.min(4, Game.inv('cedar'))}/4) · 그발`, ok: s => Game.inv('cedar') >= 4 }, { t: s => `세마포 (${Math.min(3, Game.inv('linen'))}/3)`, ok: s => Game.inv('linen') >= 3 },
    { t: s => `청금석 (${Math.min(1, Game.inv('lapis'))}/1) · 동굴`, ok: s => Game.inv('lapis') >= 1 }, { t: '장인 품삯 은 120', ok: s => s.silver >= 120 }],
  take: { cedar: 4, linen: 3, lapis: 1 },
  done: [{ n: KN, t: '와아, 다 모으셨군요! 장인들과 열흘 밤낮을 들여, 아버지의 그림 그대로 만들었어요. 한번 보세요!', e: 'happy' },
    { n: KN, t: '이 마차는 오직 총리님을 위해 특별히 만든 거예요. 애굽 온 땅에 하나뿐이랍니다!' },
    { n: KN, t: '그리고요… 아버지께서 이 마차를 보러 오신대요. 마구간에 들르시면 아버지도 뵐 수 있을 거예요.', e: 'tender' },
    { n: '요셉', t: '참으로 아름답구려. 고맙소, 케티. 아스낫과 아이들이 무척 기뻐하겠소.' }],
  reward: { xp: 40 },
  finish: s => { Game.silver(-120); (s.flags.vehOwn = s.flags.vehOwn || {}).coach = 1; sfx('levelup'); setTimeout(() => pop('총리의 유람 마차를 얻었어요', '케티에게 「탈 수레 고르기」로 바꿔 타요', 'donkey'), 900); } };
/* the old wheelwright: in the south village while Keti's story is open, at the stable once the coach is built */
const DADLOOK = { skin: 0x9a6a40, top: 0xe8dcc0, bottom: 0xd8c8a8, age: 'old', hair: 0xd8d0c0, hairStyle: 'short', belt: 0x6a4a30 };
function dadSpot(s) { if (s.flags.vehOwn && s.flags.vehOwn.coach && ST && ST.keeper) return [ST.keeper[0] + 1.8, ST.keeper[1] + 1.2]; if (s.side && s.side.act && s.side.act.ketiQ && !s.flags.ketiMet) return [-141.5, 131.5]; if (s.side && s.side.act && s.side.act.ketiQ) return [-141.5, 131.5]; return null; }
let dadT = 0; const upD = EP.update; EP.update = function (dt) { const r = upD ? upD.apply(this, arguments) : undefined; if (Game.mode !== 'play') return r; if ((dadT -= (typeof dt === 'number' && dt < 1 ? dt : 1 / 60)) > 0) return r; dadT = 1;
  try { const s = S(), at = dadSpot(s), n = Game.npc(KID);
    if (at && !n) Game.spawnNPC({ id: KID, name: DAD, look: DADLOOK, x: at[0], z: at[1], face: 0.4, talkR: 2.6 });
    else if (!at && n) Game.removeNPC(KID);
    else if (at && n && Math.hypot(n.d.x - at[0], n.d.z - at[1]) > 3) { Game.removeNPC(KID); } } catch (e) { console.error('ketiDad', e); } return r; };
const tk0 = Game.talkTo; Game.talkTo = function (id) { if (id !== KID) return tk0.apply(this, arguments); const s = S(), n = Game.npc(id); if (n) { n.talking = true; const P0 = P(); P0.face = Math.atan2(n.x - P0.x, n.z - P0.z); }
  const end = () => { if (n) n.talking = false; };
  if (s.flags.vehOwn && s.flags.vehOwn.coach) { G.UI.say([{ n: DAD, t: '총리님! 내 아들이 만든 마차, 보셨습니까? 내 그림보다 훨씬 낫지요!', e: 'happy' }, { n: DAD, t: '그 녀석이 장날마다 집에 와요. 늘그막에 이런 복을 다 누립니다. 총리님 덕분이에요.' }], end); return; }
  if (!s.flags.ketiMet) { G.UI.say([{ n: DAD, t: '아이고, 총리님께서 이 늙은이를 다 찾아오시다니요!' }, { n: '요셉', t: '도성 마구간지기 케티가 아버님 안부를 여쭈어 달라 했소.' },
      { n: DAD, t: '…케티가요? (한참 말이 없다가) 그 녀석, 말 다루는 솜씨는 나를 닮았지요. 내가 바퀴만 고집해서 그 아이 마음을 몰라준 거예요.', e: 'sad' },
      { n: DAD, t: '큰물과 흉년이 지나는 동안 총리님 곳간 덕분에 우리 마을이 살았습니다. 그 아이가 총리님 곁에 있다니, 이제야 마음이 놓이네요.' },
      { n: DAD, t: '이걸 그 아이에게 전해 주시겠소? 내 자귀와, 평생 만들고 싶었던 마차 그림이오. 손이 떨려 이제 나는 못 만드니, 그 아이가 꼭 완성해 주면 좋겠소.', e: 'tender' },
      { n: '요셉', t: '꼭 전하겠소.' }], () => { s.flags.ketiMet = 1; Game.give('kTools', 1, true); pop('받았어요', '아버지의 자귀와 마차 그림', 'tool'); G.UI.quest(); end(); }); return; }
  G.UI.say([{ n: DAD, t: '그 아이에게 잘 전해 주시오. 언제든 얼굴 보러 오라고요.' }], end); };
function buy() { const s = S(); G.UI.say([{ n: KN, t: '어느 말이 마음에 드세요? 다들 착하고 튼튼한 녀석들이에요.', choices: HORSES.map(h => ({ t: `${h.n} · 은 ${h.price}`, then: () => setTimeout(() => buyOne(h), 40) })).concat([{ t: '다음에요' }]) }]); }
function buyOne(h) { const s = S(); if (s.silver < h.price) { G.UI.say([{ n: KN, t: `${h.n}은 은 ${h.price}이에요. 조금 더 모아 오세요!` }]); return; }
  const ok2 = Rd.buy({ mount: 'horse', mname: h.n }); if (!ok2) return; Game.silver(-h.price); const r = Rd.list[Rd.list.length - 1]; r.m.hide = h.hide; r.m.mane = h.mane; r.mesh = Game.animalMesh('horse', 'plain', { saddle: Rd.MT.horse.saddle, hide: h.hide, mane: h.mane });
  if (ST) { r.x = r.m.x = ST.yard[0]; r.z = r.m.z = ST.yard[1]; if (r.col) { r.col.x = r.x; r.col.z = r.z; } }
  G.UI.say([{ n: KN, t: `${h.n}이 총리님 말이 되었어요! 이 녀석 이름은 뭐라고 할까요… 제가 몰래 「바람」이라고 불렀는데, 마음에 드시면 그대로 부르세요.` }, { n: KN, t: mode(s) === 'cart' ? '지금은 수레로 다니시니, 말 타고 다니시려면 저에게 「말 타고 다니기」라고 말씀하세요.' : '「말 부르기」로 휘파람을 불면 달려올 거예요!' }]); }
function setMode(m) { const s = S(); s.flags.travel = m; const p = P();
  if (m === 'horse') { if (!Rd.list.length) { G.UI.say([{ n: KN, t: '말 타고 다니시려면 먼저 말이 있어야 해요. 한 마리 고르시겠어요?' }], () => setTimeout(buy, 40)); s.flags.travel = 'cart'; return; } /* v18.34 asked first: the cart is no longer sent away when you have no horse */
    if (s.q.riding && G.Cart) G.Cart.dismount(true); if (ST) s.q.cartAt = { x: ST.cart[0], z: ST.cart[1], f: ST.f };
    pop('이제 말 타고 다녀요', '「말 부르기」로 휘파람 · 수레는 마구간 옆에 서 있어요', 'donkey'); }
  else { if (p.ride && Rd.dismount) Rd.dismount(true); if (ST) for (const r of Rd.list) { r.x = ST.yard[0] + (Math.random() - 0.5) * 5; r.z = ST.yard[1] + (Math.random() - 0.5) * 3; r.called = false; r.tx = null; }
    pop('이제 수레로 다녀요', '「수레 부르기」 · 말들은 마구간에서 쉬어요', 'donkey'); }
  G.UI.hud(); }
const lt0 = G.Life.talk; G.Life.talk = function (id) { if (id === 'stKeeper') { const n = Game.npc('stKeeper'), done = () => { if (n) n.talking = false; }; if (n) n.talking = true;
    const s = S(); if (!s.flags.stMet) { s.flags.stMet = 1; G.UI.say([{ n: KN, t: '총리님! 저는 마구간지기 케티예요. 총리님 수레 말들도 제가 돌보지요.' }, { n: KN, t: '말을 사서 직접 타고 다니셔도 돼요. 수레랑 말, 둘 중 하나로 다니시면 돼요. 언제든 저에게 바꿔 달라고 하세요!' }], () => setTimeout(() => menu(done), 40)); } else menu(done); return true; }
  return lt0.apply(this, arguments); };
// ------------------------------------------------------------------ one way of travel at a time
if (G.Cart) { const m0 = G.Cart.mount; G.Cart.mount = function () { const s = S(); if (ok(s) && mode(s) === 'horse') { pop('지금은 말로 다녀요', '마구간지기 케티에게 「수레로 다니기」를 말해요', 'donkey'); return; } return m0.apply(this, arguments); }; }
const e = (EP.extra || []).find(x => x.id === 'chariot'); if (e) { const on0 = e.on; e.on = (s, g) => (on0 ? on0(s, g) : true) && !(ok(s) && mode(s) === 'horse'); }
{ const rc0 = Rd.call; Rd.call = function () { const s = S(); if (ok(s) && mode(s) === 'cart' && Rd.list.some(r => r.m.sp === 'horse')) { G.UI.toast('지금은 수레로 다녀요 · 말을 타려면 마구간지기 케티에게 말해요'); return; } return rc0.apply(this, arguments); };
  const rm0 = Rd.mount; Rd.mount = function (r) { const s = S(); if (ok(s) && mode(s) === 'cart' && r && r.m && r.m.sp === 'horse') { G.UI.toast('지금은 수레로 다녀요 · 마구간지기 케티에게 「말 타고 다니기」를 말해요'); return; } return rm0.apply(this, arguments); }; }
{ const css = document.createElement('style'); css.textContent = 'body.travelCart #rideBtn{display:none!important}'; document.head.appendChild(css); }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; try { place(); document.body.classList.toggle('travelCart', ok(s) && mode(s) === 'cart' && !Rd.list.some(x => x.m.sp !== 'horse')); } catch (er) { } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { placed = false; return ol0 ? ol0.apply(this, arguments) : undefined; };
G.Stable = { spot: () => ST, mode: () => mode(S()), setMode };
})(window.G);
