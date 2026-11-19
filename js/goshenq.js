/* 약속의 길 — v18.81 곁이야기 「가. 고센 가족」 깊게 (goshenq.js · tentq.js 다음)   설계표_곁이야기_v18_80.md
   메인이 끝난 뒤의 성경 밖 이야기예요. 부탁 하나 = 서로 다른 일 3~5가지(같은 동작을 되풀이하지 않아요) · 함께 하는 사람 · 기다림 · 흔적.
   ① 르우벤의 길 잃은 어린양: 우리 살피기 → 발자국 따라 광야로(르우벤과 함께) → 부목 대기 → 바위 그늘에서 하룻밤 → 울타리 막기 → 어린양이 우리에 남음
   ② 레위의 장막 말뚝: 무너진 장막 → 아카시아에서 나무 고르기 → 손도끼로 깎기 → 말뚝 박기 → 이튿날 모래바람에 버티는지 보기
   ③ 유다네 아이들의 빵: 손주 둘 → 돌 화덕 쌓기 → 반죽 → 반나절 부풀기 → 달군 돌판에 굽기 → 밤에 돌아온 유다에게 남긴 빵
   ④ 아버지와 저녁 이야기: 세 밤, 밤마다 다른 일(땔감과 불 · 지팡이 손질 · 등잔 기름)과 이야기(하란 우물 · 얍복 나루 · 열네 해)
   ⑤ 베냐민과 별 세기: 등불 들고 밤길 → 별 잇기 → 열한 별 꿈 이야기 → 잠든 베냐민 업고 오기
   ⑥ 시므온과 무화과: 나무 흔들어 받기 → 돗자리에 널어 이틀 말리기 → 무화과 떡 누르기 → 시므온의 이야기(창 42:24)
   ⑦ 아셀의 나그네 도시락: 빵(화덕) · 치즈(염소 우리) · 올리브(아버지 장막) → 천에 싸 매듭 → 새벽 배웅 → 사흘 뒤 길 소식
   ⑧ 르우벤의 빈 구덩이(deepq.js): 도단까지 르우벤과 함께 걸어요 · 길 위 야영 한 밤
   ⑨ 세라의 검은 염소털 장막(tentq.js): 털 빗기 다섯 번 → 한 번 · 세라와 실 잣기
   그리고 모든 「되풀이 부탁」(repeat)을 없애요: 한 번 끝난 부탁은 다시 열리지 않아요.
   저장: S.flags.gq = { lamb, tent, bread, story, benj, figs, pack, pit, tq } (각각 { s, day, t0 … }) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP || !EP.quests || !G.Life) return;
const QS = EP.quests, S = () => Game.S(), P = () => Game.P;
const F = k => { const s = S(), f = s.flags.gq || (s.flags.gq = {}); return f[k] || (f[k] = { s: 0 }); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c), toast = m => G.UI.toast(m);
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), cine = (sh, cb) => G.Cine.play(sh, cb);
const nm = id => { const n = Game.npc(id); return n ? n.name : id; };
const L = (id, t, e, ref) => ({ n: nm(id), t, e, ref }), J = (t, e) => ({ n: '요셉', t, e }), T = (t, ref) => ({ n: '', t, ref });
const hAt = (x, z) => Game.W().heightAt(x, z), hour = () => S().time % 24, night = () => { const h = hour(); return h >= 18.5 || h < 4.5; };
const mg = (kind, o, then) => G.UI.minigame(kind, o, ok => { if (!ok) { toast('한 번 더 해 봐요'); return; } then(); });
const after = s => !!s && s.step === 'j_end' && !!(s.q && s.q.goshen);
const GO = [78, 56];
const bp = (name, fb) => { const b = (S().bld || []).find(q => q.name === name); return b ? [b.x, b.z] : [GO[0] + fb[0], GO[1] + fb[1]]; };
const PEN = () => bp('고센 양 우리', [-14, -10]), GOATS = () => bp('고센 염소 우리', [14, -12]), FIRE = () => bp('고센 모닥불', [0, 1]), OVEN = () => bp('고센 화덕', [-3, -6]);
const TENT = { jacob: () => bp('야곱의 장막', [-6, -3]), reuben: () => bp('르우벤의 장막', [4, -6]), judah: () => bp('유다의 장막', [9, 2]), levi: () => bp('레위의 장막', [-9, 6]), benjamin2: () => bp('베냐민의 장막', [2, 9]) };
const TRACK = [[-8, -14], [-1, -19], [7, -23], [14, -27], [19, -31], [22, -35]].map(([x, z]) => [GO[0] + x, GO[1] + z]), ROCK = [GO[0] + 24, GO[1] - 37];
const DUNE = [GO[0] + 22, GO[1] + 34], FIG = [GO[0] + 18, GO[1] + 11], MAT = [GO[0] + 15, GO[1] + 14];
let ACACIA = null; const acacia = () => { if (ACACIA) return ACACIA; const W = Game.W(); let best = null; for (const c of (W && W.canopies) || []) { const d = Math.hypot(c.x - GO[0], c.z - GO[1]); if (d > 14 && d < 70 && (!best || d < best.d)) best = { d, c }; } ACACIA = best ? [best.c.x + best.c.r * 0.6, best.c.z] : [GO[0] - 30, GO[1] + 20]; return ACACIA; };
const near = (p, r) => Math.hypot(P().x - p[0], P().z - p[1]) < r;
const homeOf = id => { const n = Game.npc(id); return n ? { x: n.x, z: n.z, f: n.face } : null; };
function walkWith(id, on) { const n = Game.npc(id); if (!n) return; if (on) { n.walk = null; n.wander = null; n.sit = false; n.act = null; Game.npcFollow(id, true); } else { Game.npcFollow(id, false); } }
function goHome(id) { const n = Game.npc(id), T0 = TENT[id] ? TENT[id]() : null; if (!n) return; Game.npcFollow(id, false); const x = T0 ? T0[0] + 1.6 : n.x, z = T0 ? T0[1] + 2.2 : n.z; Game.npcWalk(id, x, z, () => { n.wander = { r: 3, cx: x, cz: z, tx: null, wait: 2 }; }, 1.6); }
function sleepHere(kind, text, then) { /* fair weather: by the fire · foul weather: a tent (the rule of the road) */ const bad = G.Sleep && G.Sleep.bad && G.Sleep.bad(); if (G.Sleep && G.Sleep.sky) G.Sleep.sky(bad ? '궂은 밤이라 작은 텐트를 치고 그 안에서 잤습니다.' : text, () => { Game.sleep(); setTimeout(() => then && then(), 1400); }); else { Game.sleep(); then && then(); } }
const spawn = (id, o) => { if (!Game.npc(id)) Game.spawnNPC(Object.assign({ id, noTalk: true, noTag: true, noBond: true }, o)); return Game.npc(id); };
const kill = id => { if (Game.npc(id)) { Game.npcFollow(id, false); Game.removeNPC(id); } };
const act = k => { const p = P(); p.emote = { k, t: 0, dur: 1.4 }; };
const stageObj = (key, list) => list.map(([t, k]) => ({ t, ok: () => (F(key).s | 0) >= k }));

// ------------------------------------------------------------------ ① 르우벤의 길 잃은 어린양
QS.g_lamb = { giver: 'reuben', title: '르우벤의 길 잃은 어린양', when: after,
  offer: ['아우야, 어미양이 아침부터 울기만 한다. 새끼 하나가 안 보여.', '…예전 같으면 내가 너를 찾으러 갔어야 했는데. 같이 가 주겠느냐? 우리부터 보자.'],
  start() { F('lamb').s = 0; },
  obj: stageObj('lamb', [['양 우리 살피기', 1], ['발자국 따라 광야로 (르우벤과 함께)', 2], ['다친 어린양에게 부목 대기', 3], ['바위 그늘에서 하룻밤', 4], ['울타리 구멍 막기', 5]]),
  loc: () => { const s = F('lamb').s | 0; if (s === 0 || s === 4) return { x: PEN()[0] + 7.6, z: PEN()[1] }; if (s === 5) return 'npc:reuben'; if (s === 1) { const i = Math.min(TRACK.length - 1, F('lamb').k | 0); return { x: TRACK[i][0], z: TRACK[i][1] }; } if (s === 2 || s === 3) return { x: ROCK[0] - 1.6, z: ROCK[1] + 1 }; return null; }, /* (the pen is 12.6 × 9.6: stand outside it, on the camp side) */
  prog: () => ['우리부터 보자. 울타리 어디가 터졌을 거다.', '발자국을 놓치지 마라. 집중해서 보면 작은 발굽 자국이 보일 게다.', '저기다! 바위틈에… 다리를 다쳤구나.', '해가 졌다. 이 녀석을 안고 밤길을 갈 순 없지. 여기서 불을 피우자.', '우리로 돌아가자. 그 구멍부터 막아야지.', '…고맙다, 아우야.'][Math.min(5, F('lamb').s | 0)],
  done: [L('reuben', '(어미양에게 새끼를 안겨 주며) 봐라, 어미가 금세 알아보는구나.', 'happy'), L('reuben', '…그날 도단에서 나는 너를 찾으러 다시 갔는데, 너는 없었다. 오늘은 찾았구나. 잃은 하나를 찾아 돌아오는 게 이렇게 기쁜 일이었구나.', 'tender'), T('르우벤의 어린양은 고센 양 우리에 남았어요. 우리 곁을 지나면 다리를 조금 절며 다가와요.')],
  finish() { walkWith('reuben', false); goHome('reuben'); const l = Game.npc('gqLamb'); if (l) { Game.npcFollow('gqLamb', false); const p = PEN(); l.name = '르우벤의 어린양'; Game.npcTo('gqLamb', p[0], p[1], 0, false); l.wander = { r: 2.5, cx: p[0], cz: p[1], tx: null, wait: 3 }; } },
  reward: { silver: 8, items: { wool: 2, milk: 1 }, heart: 1 } };
function lambPen() { const p = PEN(), h = hAt(p[0], p[1]); walkWith('reuben', true); cine([{ hour: 9, cam: [p[0] + 6, h + 2.4, p[1] + 6], look: [p[0], h + 0.6, p[1]], dur: 6, t: '어미양 한 마리가 울타리 모퉁이에서 자꾸 울어요. 아래쪽 가시나무 울이 뜯겨 있어요.' }],
  () => say([L('reuben', '여기로 빠져나갔구나. 발자국이 남쪽 광야로 나 있다. 같이 따라가자.', 'calm'), T('발자국이 이어져요. 「집중」을 켜면 더 잘 보여요. 르우벤이 함께 걸어요.')], () => { F('lamb').s = 1; F('lamb').k = 0; G.UI.quest(); })); }
function lambSplint() { mg('balance', { title: '부목 대기', hint: '어린양 다리를 곧게 잡고, 막대와 천을 고르게 감아요. 한쪽으로 기울면 다리가 틀어져요.', dur: 9 }, () => { const f = F('lamb'); f.s = 3; sfx('sheep', { soft: 1 }); G.UI.quest();
  say([L('reuben', '목자 손이구나. 아버지가 너한테만 그런 걸 가르치셨지. …그땐 그게 그렇게 샘이 났다.', 'tender'), T('해가 졌어요. 바위 그늘에서 불을 피우고 밤을 지내요.')]); }); }
function lambNight() { const r = ROCK, h = hAt(r[0], r[1]); cine([{ hour: 20.6, fn: () => { Game.teleport(r[0] - 1.6, r[1] + 1.2, 1.2); const n = Game.npc('reuben'); if (n) { Game.npcFollow('reuben', false); Game.npcTo('reuben', r[0] - 3.2, r[1] + 0.2, 1.4, false); n.sit = true; } Game.FX && Game.FX.burst(r[0] - 2.4, h + 0.3, r[1] + 1.4, 30, { c: [1, 0.6, 0.2], sp: 0.6, up: 1.6, size: 0.08, life: 1 }); sfx('fire', { vol: 0.5 }); },
  cam: [r[0] - 6, h + 1.8, r[1] + 5], look: [r[0] - 2, h + 0.8, r[1] + 0.6], dur: 8, t: '바위 그늘에 불을 피웠어요. 요셉은 어린양을 품에 안고, 르우벤은 불 건너편에서 밤새 불을 지켰어요.' }],
  () => sleepHere('fire', '불이 사위어 가고, 품속의 어린양이 따뜻했습니다. 요셉은 별을 보다 잠이 들었습니다.', () => { const f = F('lamb'); f.s = 4; const n = Game.npc('reuben'); if (n) n.sit = false; walkWith('reuben', true); const l = spawn('gqLamb', { name: '다친 어린양', animal: 'sheep', scale: 0.6, x: r[0] - 1, z: r[1] + 2, face: 0 }); l.noTalk = true; Game.npcFollow('gqLamb', true); G.UI.quest(); toast('어린양이 절뚝이며 따라와요 · 우리로 돌아가요'); })); }
function lambFence() { mg('wrestle', { title: '울타리 구멍 막기', hint: '가시나무 가지를 엮어 뜯긴 울을 메워요. 르우벤이 말뚝을 잡아 줘요.', need: 6, dur: 14, btn: '엮기', unit: '번' }, () => { F('lamb').s = 5; sfx('rustle'); const p = PEN(), r = Game.npc('reuben'), l = Game.npc('gqLamb'); walkWith('reuben', false); if (r) { Game.npcTo('reuben', p[0] + 8.6, p[1] + 1.2, -Math.PI / 2, false); r.walk = null; r.wander = null; } if (l) { Game.npcFollow('gqLamb', false); Game.npcWalk('gqLamb', p[0], p[1], null, 0.8); } G.UI.quest(); toast('울타리를 막았어요 · 어린양이 어미에게 갔어요 · 르우벤에게 말해요'); }); } /* (he stops following, so he can be talked to) */

// ------------------------------------------------------------------ ② 레위의 장막 말뚝
QS.g_tent = { giver: 'levi', title: '레위의 장막 말뚝', when: after,
  offer: ['간밤 모래바람에 장막이 통째로 주저앉았다. 애굽 말뚝은 무른 나무라 모래에서 버티질 못해.', '아카시아 숲에 가서 단단한 나무로 새 말뚝을 깎자. 같이 가겠느냐?'],
  start() { F('tent').s = 0; walkWith('levi', true); },
  obj: stageObj('tent', [['아카시아 숲에서 말뚝 나무 고르기', 1], ['손도끼로 말뚝 깎기', 2], ['레위와 말뚝 박기', 3], ['이튿날 모래바람에 버티는지 보기', 4]]),
  loc: () => { const s = F('tent').s | 0; if (s === 0 || s === 1) { const a = acacia(); return { x: a[0], z: a[1] }; } if (s === 2) { const t = TENT.levi(); return { x: t[0] + 2.4, z: t[1] + 2 }; } if (s === 3) { const t = TENT.levi(); return { x: t[0] + 2.4, z: t[1] + 2 }; } return null; },
  prog: () => ['동쪽 아카시아 숲이다. 마르고 곧은 걸로 골라라.', '이제 깎자. 끝은 뾰족하게, 머리는 뭉툭하게.', '내가 줄을 잡으마. 네가 박아라.', '모래바람이 다시 불 때 보자. 내일이면 알겠지.', '버텼다!'][Math.min(4, F('tent').s | 0)],
  done: [L('levi', '(말뚝을 쓰다듬으며) 이 손이 예전엔 세겜에서 칼을 들었었다. 아버지가 우리 이름을 들으면 지금도 한숨을 쉬시지.', 'sad'), T('요셉은 말없이 망치를 받아, 장막 줄 하나를 더 단단히 맸어요.'), L('levi', '…집을 세우는 손이라. 그래, 그런 손으로 살아 보마. 고맙다, 아우야.', 'tender')],
  finish() { goHome('levi'); }, reward: { silver: 6, items: { cheese: 1 }, heart: 1 } };
function tentPick() { say([{ n: '레위', t: '어떤 나무로 말뚝을 깎을까?', choices: [{ t: '마르고 곧은 아카시아 가지', then: () => setTimeout(() => { act('gather'); sfx('rustle'); F('tent').s = 1; G.UI.quest(); say([L('levi', '그거다. 아카시아는 마르면 쇠처럼 단단해지지.', 'happy')]); }, 30) },
  { t: '푸른 생가지', ok: false, fb: '생가지는 마르면서 줄어들어 모래에서 쑥 빠져요.' }, { t: '속이 빈 썩은 가지', ok: false, fb: '썩은 가지는 망치 한 번에 부서져요.' }] }], null); }
function tentCarve() { mg('rhythm', { title: '손도끼로 말뚝 깎기', hint: '도끼날이 줄에 닿을 때 내리쳐요. 끝은 뾰족하게, 머리는 뭉툭하게.', need: 5 }, () => { F('tent').s = 2; sfx('thud'); G.UI.quest(); toast('말뚝 넷을 깎았어요 · 레위의 장막으로'); }); }
function tentDrive() { const t = TENT.levi(), lv = Game.npc('levi'); walkWith('levi', false); if (lv) { Game.npcTo('levi', t[0] + 1.2, t[1] + 2.8, 0.6, false); lv.walk = null; lv.wander = null; } mg('count', { title: '말뚝 박기', hint: '레위가 줄을 팽팽히 잡는 동안, 망치로 말뚝 머리를 내리쳐요.', need: 5, btn: '탕!', unit: '번', onPress: () => sfx('thud', { pitch: 1.2, vol: 0.5 }) }, () => { const f = F('tent'); f.s = 3; f.day = S().day; G.UI.quest(); say([L('levi', '이제 기다려 보자. 내일 바람이 불면 알게 된다.', 'calm'), T('하루가 지나야 해요. 그동안 다른 일을 해도 돼요.')]); }); }
function tentStorm() { const t = TENT.levi(), h = hAt(t[0], t[1]); cine([{ hour: 15, fn: () => { Game.teleport(t[0] + 4, t[1] + 4, -2.4); const n = Game.npc('levi'); if (n) Game.npcTo('levi', t[0] + 2.4, t[1] + 2.2, -2.2, false); }, cam: [t[0] + 8, h + 2.4, t[1] + 7], look: [t[0], h + 1, t[1]], dur: 8, sfx: 'wind',
  each: tt => { if (Math.random() < 0.3 && Game.FX) Game.FX.burst(t[0] + 6, h + 1, t[1] + 3, 4, { c: [0.85, 0.75, 0.55], sp: 3, up: 0.4, size: 0.3, a: 0.4, life: 1.4, drag: 0.6 }); }, t: '이튿날 오후, 다시 모래바람이 불었어요. 장막 천이 부풀었다 가라앉았지만, 말뚝은 꿈쩍도 하지 않았어요.' }], () => { F('tent').s = 4; G.UI.quest(); }); }

// ------------------------------------------------------------------ ③ 유다네 아이들의 빵
QS.g_bread = { giver: 'judah', title: '유다네 아이들의 빵', when: after,
  offer: ['우리 집 손주 녀석들이 애굽 빵 타령이다. 장터 빵 말고, 삼촌이 같이 구워 주면 얼마나 좋아하겠느냐.', '나는 오늘 들에 나가 밤에나 온다. 녀석들을 부탁한다.'],
  start() { F('bread').s = 0; spawnKids(); },
  obj: stageObj('bread', [['유다네 손주들 만나기', 1], ['돌과 진흙으로 작은 화덕 쌓기', 2], ['아이들과 반죽 치대기', 3], ['반죽이 부풀기를 기다리기 (반나절)', 4], ['달군 돌판에 굽기', 5]]).concat([{ t: '밤에 돌아온 유다에게 빵 건네기', ok: () => (F('bread').s | 0) >= 5 && night() }]),
  loc: () => { const s = F('bread').s | 0, t = TENT.judah(); if (s === 5) return 'npc:judah'; return { x: t[0] + 3, z: t[1] + 3 }; },
  prog: () => (F('bread').s | 0) >= 5 ? '애들이 벌써 자랑을 하던데? 하나 남겨 뒀다고.' : '녀석들이 장막 앞에서 기다린다.',
  done: [L('judah', '(빵을 받아 들고) …남겨 둔 거라고? 이 녀석들이?', 'awe'), L('judah', '흉년에 이 아이들이 굶을까 밤마다 잠을 못 잤다. 그런데 오늘은 삼촌이랑 화덕까지 쌓았다고 자랑이구나.', 'tender'), T('유다의 장막 앞에 작은 돌 화덕이 남았어요. 아이들은 그 뒤로도 그 화덕에서 빵을 구워요.')],
  finish() { kill('gqKid0'); kill('gqKid1'); S().flags.gqOven = 1; const j = Game.npc('judah'); if (j) j.forceVis = undefined; }, reward: { silver: 10, heart: 1 } };
const KIDS = [['헤스론', { look: { kid: true, skin: 0xc8946a, top: 0xb0784a, under: 0xd8c4a4, trim: 0x6a4a2a, hair: 0x2a1a10 } }], ['하물', { look: { kid: true, skin: 0xc08a5a, top: 0x8a9a5a, under: 0xd8c4a4, trim: 0x4a3a2a, hair: 0x241810 } }]];
function spawnKids() { const t = TENT.judah(); KIDS.forEach(([n, o], i) => { const k = spawn('gqKid' + i, Object.assign({ name: n + ' (유다의 손주)', scale: 0.62, x: t[0] + 2.2 + i * 1.2, z: t[1] + 3.2, face: Math.PI, wander: 1.2 }, o)); if (k) k.noTalk = true; }); }
const bake = () => { const f = F('bread'); return f; };
function breadMeet() { say([{ n: '헤스론', t: '삼촌이 요셉 할아버지… 아니 요셉 삼촌이에요? 진짜 총리예요?', e: 'awe' }, { n: '하물', t: '우리 빵 구워요? 화덕은 어디 있어요?', e: 'happy' }, T('화덕부터 쌓아요. 장막 옆 돌무더기와 우물가 진흙이면 돼요.')], () => { bake().s = 1; G.UI.quest(); }); }
function breadOven() { mg('balance', { title: '돌 화덕 쌓기', hint: '납작한 돌을 둥글게 쌓고 틈에 진흙을 발라요. 한쪽으로 기울지 않게.', dur: 9 }, () => { bake().s = 2; sfx('thud'); G.UI.quest(); GG_bub('gqKid1', '화덕이다!'); }); }
function breadKnead() { mg('push', { title: '반죽 치대기', hint: '꾹 눌러 치대다가, 팔이 아프면 잠깐 쉬어요. 아이들이 밀가루를 날려요.', btn: '치대기' }, () => { const f = bake(); f.s = 3; f.t0 = (S().day | 0) * 24 + S().time; /* v18.84 counted across days (the clock goes 6 → 30 and starts again) */ G.UI.quest(); say([T('반죽을 젖은 천으로 덮었어요. 반나절쯤 부풀어야 해요. 그동안 다른 일을 해도 돼요.')]); }); }
function breadBake() { mg('rhythm', { title: '달군 돌판에 굽기', hint: '반죽을 돌판에 펴 얹었다가, 노릇해지면 뒤집어요.', need: 5 }, () => { const f = bake(); f.s = 5; sfx('eat'); G.UI.quest(); const t = TENT.judah(), h = hAt(t[0], t[1]);
  cine([{ cam: [t[0] + 6, h + 1.8, t[1] + 6], look: [t[0] + 2.6, h + 0.8, t[1] + 3], dur: 7, t: '아이들이 뜨거운 빵을 호호 불며 먹었어요. 하물이 한 덩이를 천에 싸 두었어요. 「할아버지 거예요.」' }], () => toast('밤에 돌아온 유다에게 빵을 건네요')); }); }
function GG_bub(id, t) { if (G.Life && G.Life.bubble && Game.npc(id)) G.Life.bubble(id, t, 2.6); }

// ------------------------------------------------------------------ ④ 아버지와 저녁 이야기 (세 밤, 밤마다 다른 일)
const NIGHTS = [
  { job: '아버지와 땔감 줍고 모닥불 피우기', mg: ['wrestle', { title: '마른 가지 꺾기', hint: '아버지가 가리키는 마른 덤불을 꺾어 한 아름 모아요.', need: 5, dur: 14, btn: '꺾기', unit: '번' }], at: () => FIRE(),
    talk: [L('jacob', '하란의 들에 우물이 있었다. 아귀를 큰 돌이 덮고 있었지. 목자들이 다 모여야 그 돌을 굴린다더구나.', 'tender'), L('jacob', '그런데 네 어머니가 양을 몰고 오는 걸 보고… 나 혼자 그 돌을 굴렸다. 힘이 어디서 났는지 지금도 모르겠다.', 'happy')] },
  { job: '아버지 지팡이 끝을 숫돌에 갈기', mg: ['rhythm', { title: '지팡이 손질', hint: '숫돌에 지팡이 끝을 대고, 줄에 닿을 때 밀어요.', need: 5 }], at: () => TENT.jacob(),
    talk: [L('jacob', '얍복 나루에서 밤새 누군가와 씨름했다. 날이 새도록. 그가 내 허벅지 관절을 쳤지.', 'tender'), L('jacob', '「내가 하나님과 대면하여 보았으나 내 생명이 보전되었다」(창 32:30). 그날부터 이 지팡이 없이는 못 걷는다. 그래도 그 절뚝임이 내게는 복이었다.', 'calm')] },
  { job: '아버지 장막의 등잔에 기름 채우기', mg: ['balance', { title: '등잔에 기름 붓기', hint: '좁은 주둥이에 기름이 흘러넘치지 않게 천천히 기울여요.', dur: 8 }], at: () => TENT.jacob(),
    talk: [L('jacob', '네 어머니를 위해 일곱 해를 일했다. 「그를 사랑하는 까닭에 칠 년을 수일같이 여겼더라」(창 29:20). 그리고 또 일곱 해.', 'tender'), L('jacob', '…이 등잔 빛이 네 어머니 장막의 빛과 닮았구나. 이제 자자, 요셉아.', 'calm')] }];
QS.g_story = { giver: 'jacob', title: '아버지와 저녁 이야기', when: after,
  offer: ['요셉아, 해가 지면 이 늙은 아비와 앉아 있자꾸나. 오늘만이 아니라, 며칠 밤만.'],
  start() { const f = F('story'); f.s = 0; f.day = -1; },
  obj: NIGHTS.map((n, i) => ({ t: `${['첫째', '둘째', '셋째'][i]} 밤 · ${n.job}`, ok: () => (F('story').s | 0) > i })),
  loc: () => { const f = F('story'), n = NIGHTS[f.s | 0]; if (!n) return null; const p = n.at(); return { x: p[0] + 1.2, z: p[1] + 1.6 }; },
  prog: () => { const f = F('story'); if ((f.s | 0) >= 3) return '세 밤이 다 지났구나.'; if (f.day === S().day) return '오늘 밤은 다 이야기했다. 내일 밤에 또 오너라.'; return night() ? '왔구나. 앉자.' : '해가 지면 오너라.'; },
  done: [L('jacob', '네 할아버지 이삭도, 증조할아버지 아브라함도 이렇게 불가에서 하나님 이야기를 하셨단다.', 'tender'), L('jacob', '내가 벧엘에서 본 사다리… 하나님은 그때 한 약속을 다 지키셨구나. 너를 내게 돌려주셨으니.', 'cry')],
  finish() { goHome('jacob'); }, reward: { insight: 1, items: { jacobGift: 1 } } };
function storyNight(i) { const n = NIGHTS[i]; mg(n.mg[0], n.mg[1], () => { const p = FIRE(), h = hAt(p[0], p[1]); if (i === 0) { sfx('fire', { vol: 0.6 }); }
  cine([{ hour: Math.max(19.5, hour()), fn: () => { Game.teleport(p[0] + 1.3, p[1] + 0.6, -1.6); const j = Game.npc('jacob'); if (j) { j.walk = null; j.wander = null; Game.npcTo('jacob', p[0] - 1.3, p[1] + 0.4, 1.6, false); j.sit = true; } P().cpose = { k: 'sitg', t: 0, dur: 30, hold: true }; },
    cam: [p[0], h + 1.5, p[1] + 3.6], look: [p[0], h + 0.9, p[1] + 0.4], dur: 6, t: ['불을 피웠어요. 야곱이 지팡이를 무릎에 눕히고 불 곁에 앉았어요.', '지팡이 끝이 매끈해졌어요. 야곱이 그 끝을 오래 쓰다듬었어요.', '등잔 심지가 밝아졌어요. 야곱이 등잔을 들고 불가로 나왔어요.'][i] }],
    () => say(n.talk, () => { P().cpose = null; const j = Game.npc('jacob'); if (j) j.sit = false; const f = F('story'); f.s = i + 1; f.day = S().day; G.UI.quest(); if (f.s < 3) toast('내일 밤에 또 아버지께 가요'); })); }); }

// ------------------------------------------------------------------ ⑤ 베냐민과 별 세기
QS.g_benj = { giver: 'benjamin2', title: '베냐민과 별 세기', when: after,
  offer: ['형! 어릴 때 형이 별 이야기 해 줬던 거 기억나? 오늘 밤 모래 언덕에서 같이 별 보자. 등불은 형이 들어!'],
  start() { F('benj').s = 0; },
  obj: stageObj('benj', [['밤에 베냐민의 장막 앞에서 등불 들기', 1], ['모래 언덕까지 함께 밤길 걷기', 2], ['하늘의 별 잇기 (✦ 별자리)', 3], ['베냐민과 이야기하기', 4], ['겉옷 덮어 주고, 별이 기울면 함께 장막으로', 5]]),
  loc: () => { const s = F('benj').s | 0, t = TENT.benjamin2(); if (s === 0 || s === 4) return { x: t[0] + 1.6, z: t[1] + 2.2 }; if (s === 1 || s === 2 || s === 3) return { x: DUNE[0], z: DUNE[1] }; return null; },
  prog: () => night() ? '형, 등불 들었어?' : '밤에! 해 지면 와.',
  done: [L('benjamin2', '(졸린 눈으로) …형, 별이 정말 셀 수 없이 많더라. 아브라함 할아버지 약속 이야기, 이제 나도 내 아이들한테 해 줄 거야.', 'tender')],
  finish() { goHome('benjamin2'); }, reward: { heart: 1, items: { raisins: 2 } } };
function benjLamp() { const f = F('benj'); f.s = 1; walkWith('benjamin2', true); S().q.gbStars = ((S().flags.sev || {}).stars || {}).n || 0; G.UI.quest(); toast('등불을 들었어요 · 베냐민이 따라와요 · 모래 언덕으로'); }
function benjTalk() { say([L('benjamin2', '형… 형이 꾼 꿈 있잖아. 해와 달과 열한 별이 형한테 절하던 꿈.', 'awe'), L('benjamin2', '그 열한 별에 나도 있었어? 그때 나는 아기였잖아.', 'tender'), J('그래, 너도 있었지. 꿈은 하나님이 주신 것이고, 그 뜻도 하나님께 있단다. 나는 이제야 조금 알 것 같아.', 'tender'),
  L('benjamin2', '…형 옆에서 별 보니까 좋다. (하품)', 'happy'), T('베냐민이 모래 위에서 스르르 잠이 들었어요.')], () => { const f = F('benj'); f.s = 4; walkWith('benjamin2', false); const b = Game.npc('benjamin2'); if (b) { b.walk = null; b.act = 'sleep'; } G.UI.quest(); }); }
function benjCarry() { const b = Game.npc('benjamin2'), h = b ? hAt(b.x, b.z) : 0; if (!b) return; /* (he is a grown man with sons of his own (46:21): no carrying — a cloak, a quiet wait, a walk home together) */
  cine([{ fn: () => { Game.teleport(b.x + 1, b.z, -1.57); P().cpose = { k: 'sitg', t: 0, dur: 30, hold: true }; }, cam: [b.x + 4, h + 1.6, b.z + 3], look: [b.x + 0.4, h + 0.5, b.z], dur: 7, t: '요셉은 겉옷을 벗어 잠든 베냐민에게 덮어 주고, 그 곁에 앉아 별이 기울 때까지 하늘을 보았어요.' },
    { hour: 2.5, cam: [b.x + 4, h + 1.6, b.z + 3], look: [b.x, h + 6, b.z - 8], dur: 5, t: '별들이 서쪽으로 기울었어요.' }],
    () => { P().cpose = null; b.act = null; F('benj').carry = 1; walkWith('benjamin2', true); say([L('benjamin2', '…형? 나 잠들었었어? 형 옷이네. 가자, 형.', 'tender')], () => toast('베냐민과 함께 장막으로 돌아가요')); }); }
function benjHome() { const b = Game.npc('benjamin2'), t = TENT.benjamin2(); F('benj').carry = 0; walkWith('benjamin2', false); if (b) { Game.npcTo('benjamin2', t[0] + 1.2, t[1] + 2.2, Math.PI, false); b.walk = null; b.wander = null; } F('benj').s = 5; G.UI.quest(); toast('장막에 닿았어요 · 베냐민에게 말을 걸어요'); }

// ------------------------------------------------------------------ ⑥ 시므온과 무화과
QS.d_figs = { giver: 'simeon', title: '시므온과 무화과', when: after,
  offer: ['요셉, 고센 무화과가 아주 탐스럽게 익었다. 내가 나무를 흔들 테니 너는 바구니로 받아라. 돌멩이는 피하고!'],
  start() { F('figs').s = 0; const n = Game.npc('simeon'); if (n) { n.wander = null; Game.npcWalk('simeon', FIG[0] - 1.4, FIG[1] + 0.6, () => { n.face = 1.2; }, 1.6); } },
  obj: stageObj('figs', [['무화과나무 흔들어 바구니로 받기', 1], ['돗자리에 무화과 널기', 2], ['이틀 볕에 말리기', 3], ['무화과 떡 누르기', 4]]),
  loc: () => { const s = F('figs').s | 0; if (s === 0) return { x: FIG[0] + 1.6, z: FIG[1] }; if (s <= 3) return { x: MAT[0], z: MAT[1] + 1.4 }; return null; },
  prog: () => (F('figs').s | 0) === 2 ? '이틀은 말려야 달아진다. 기다려라.' : '무화과나무는 장막촌 동쪽에 있다.',
  done: [L('simeon', '(무화과 떡을 쪼개 주며) …애굽 옥에 혼자 남았던 날들 말이다(창 42:24). 형제들이 돌아올지 안 올지 몰랐지.', 'sad'), L('simeon', '그때 옥에서 받던 떡이 이것보다 훨씬 거칠었는데… 그 떡을 누가 보내 줬는지 이제 안다.', 'tender'), T('시므온의 장막 앞 돗자리에는 그 뒤로도 늘 무화과가 말라 가요.')],
  finish() { goHome('simeon'); }, reward: { items: { fig: 4, figAlmond: 1 }, heart: 1, xp: 14 } };
function figsCatch() { mg('catch', { title: '무화과 받기', item: 'fig', need: 10, dur: 32 }, () => { F('figs').s = 1; G.UI.quest(); toast('바구니가 가득해요 · 돗자리에 널어요'); }); }
function figsLay() { const sm = Game.npc('simeon'); if (sm) Game.npcWalk('simeon', MAT[0] - 1.6, MAT[1] + 0.8, null, 1.4); act('gather'); const f = F('figs'); f.s = 2; f.day = S().day; sfx('rustle'); G.UI.quest(); say([L('simeon', '이렇게 한 알씩 떨어지게 널어야 곰팡이가 안 핀다. 이틀 지나면 달아질 거다.', 'calm'), T('이틀이 지나야 해요. 그동안 다른 일을 해도 돼요.')]); }
function figsPress() { mg('push', { title: '무화과 떡 누르기', hint: '마른 무화과를 틀에 담고 꾹 눌러 한 덩이로 만들어요.', btn: '누르기' }, () => { F('figs').s = 4; G.UI.quest(); toast('무화과 떡이 됐어요 · 시므온에게'); }); }

// ------------------------------------------------------------------ ⑦ 아셀의 나그네 도시락
QS.d_pack = { giver: 'asher', title: '아셀의 나그네 도시락', when: after,
  offer: ['요셉, 내일 새벽 가나안 쪽으로 양을 몰고 간다. 나그네 도시락 하나 싸 줄 수 있겠느냐?', '빵은 화덕에, 치즈는 염소 우리 곁 항아리에, 올리브는 아버지 장막에 있다.'],
  start() { F('pack').s = 0; F('pack').got = {}; },
  obj: [{ t: '빵 · 치즈 · 올리브 모으기', ok: () => ['b', 'c', 'o'].every(k => (F('pack').got || {})[k]) }, { t: '천에 싸서 매듭 짓기', ok: () => (F('pack').s | 0) >= 1 }, { t: '새벽에 아셀 배웅하기', ok: () => (F('pack').s | 0) >= 2 }, { t: '사흘 뒤 돌아온 아셀 만나기', ok: () => (F('pack').s | 0) >= 3 }],
  loc: () => { const f = F('pack'), g = f.got || {}; if (!g.b) { const o = OVEN(); return { x: o[0] + 1.6, z: o[1] + 1 }; } if (!g.c) { const o = GOATS(); return { x: o[0] - 3, z: o[1] + 3 }; } if (!g.o) { const o = TENT.jacob(); return { x: o[0] + 1.6, z: o[1] + 2 }; } if ((f.s | 0) === 0 || (f.s | 0) === 1) return 'npc:asher'; return null; },
  prog: () => { const f = F('pack'); if ((f.s | 0) === 1) return hour() >= 4.5 && hour() < 7.5 ? '이제 떠난다. 고맙다.' : '새벽에 떠난다. 해 뜰 무렵 내 장막 앞으로 오너라.'; if ((f.s | 0) === 2) return '…'; return '빵, 치즈, 올리브. 천에 싸 주면 된다.'; },
  done: [L('asher', '다녀왔다! 네 도시락 덕에 사흘 길이 든든했다.', 'happy'), L('asher', '가나안 들에도 이제 비가 온다더구나. 헤브론 상수리나무 아래엔 아직도 아버지 장막 자리가 그대로 있더라.', 'tender'), T('아셀이 길에서 주운 매끈한 돌 하나를 건넸어요. 「헤브론 길가 돌이다.」')],
  reward: { silver: 10, items: { wool: 2, smooth: 1 }, heart: 1, xp: 18 } };
function packWrap() { mg('count', { title: '천에 싸 매듭 짓기', hint: '빵 · 치즈 · 올리브를 천 가운데 놓고, 네 귀를 모아 단단히 매요.', need: 4, btn: '매기', unit: '번' }, () => { F('pack').s = 1; G.UI.quest(); say([L('asher', '이거면 사흘은 든든하겠다. 새벽에 떠난다. 해 뜰 무렵 와 주겠느냐?', 'happy')]); }); }
function packFarewell() { const a = Game.npc('asher'); const f = F('pack'); say([L('asher', '다녀오마, 아우야. 사흘이면 돌아온다.', 'tender'), T('아셀이 양 떼를 몰고 북쪽 길로 떠났어요. 사흘 뒤에 돌아와요.')], () => { f.s = 2; f.day = S().day; if (a) { Game.npcWalk('asher', GO[0] + 40, GO[1] - 40, () => { a.forceVis = false; }, 1.8); } G.UI.quest(); }); }

// ------------------------------------------------------------------ ⑧ 르우벤의 빈 구덩이 · 함께 걷는 길 (deepq.js 위에)
const PITM = [130, -40]; /* (a halfway camp on the road north) */
if (QS.dq_pit) { const q0 = QS.dq_pit;
  q0.offer = q0.offer.map(t => t.replace('내가 먼저 가 있으마. 도단 들판, 북쪽 길 끝이다.', '이틀길이다. 이번엔 같이 걸어가자.'));
  const st0 = q0.start; q0.start = function (s) { st0 && st0.apply(this, arguments); F('pit').s = 0; walkWith('reuben', true); };
  const o0 = q0.obj; q0.obj = [{ t: '르우벤과 함께 북쪽 길 · 길 위에서 야영 한 밤', ok: () => (F('pit').s | 0) >= 1 }].concat(o0);
  const l0 = q0.loc; q0.loc = s => (F('pit').s | 0) < 1 ? { x: PITM[0], z: PITM[1] } : l0(s);
  const f0 = q0.finish; q0.finish = function (s) { f0 && f0.apply(this, arguments); walkWith('reuben', false); goHome('reuben'); }; }
function pitCamp() { const p = PITM, h = hAt(p[0], p[1]); cine([{ hour: 20.4, fn: () => { Game.teleport(p[0] + 1.4, p[1], -1.6); const n = Game.npc('reuben'); if (n) { Game.npcFollow('reuben', false); Game.npcTo('reuben', p[0] - 1.4, p[1] + 0.3, 1.6, false); n.sit = true; } Game.FX && Game.FX.burst(p[0], h + 0.3, p[1], 30, { c: [1, 0.6, 0.2], sp: 0.6, up: 1.6, size: 0.08, life: 1 }); sfx('fire', { vol: 0.5 }); },
  cam: [p[0] + 0.4, h + 1.6, p[1] + 4.4], look: [p[0], h + 0.8, p[1]], dur: 8, t: '길가에 불을 피웠어요. 르우벤은 한참 말이 없다가, 도단 쪽 하늘을 오래 바라보았어요.' }],
  () => say([L('reuben', '…스무 해 동안 이 길을 다시 걷는 꿈을 꿨다. 혼자서. 오늘은 네가 옆에 있구나.', 'tender')], () => sleepHere('fire', '형제는 불가에서 잠이 들었습니다.', () => { const n = Game.npc('reuben'); if (n) n.sit = false; F('pit').s = 1; walkWith('reuben', true); G.UI.quest(); toast('도단까지 남은 길 · 르우벤과 함께'); }))); }

// ------------------------------------------------------------------ ⑨ 세라의 검은 염소털 장막 (tentq.js 위에) · 털 빗기 다섯 번 → 한 번, 실 잣기
if (QS.tq_tent) { const q0 = QS.tq_tent; const SERAH = [GO[0] - 14.5, GO[1] + 1.5];
  q0.obj = [{ t: '고센 염소 우리에서 염소 털 빗기', ok: () => ((S().flags.tq || {}).comb | 0) >= 5 }, { t: '세라와 실 잣기', ok: () => (F('tq').s | 0) >= 1 }].concat(q0.obj.slice(1));
  q0.loc = s => ((S().flags.tq || {}).comb | 0) < 5 ? { x: GO[0] + 14, z: GO[1] - 12 } : (F('tq').s | 0) < 1 ? { x: SERAH[0], z: SERAH[1] + 1.6 } : null;
  q0.done = q0.done.concat([T('세라가 다 짠 장막을 개어 요셉의 짐 위에 얹어 주었어요.')]); }
function tqSpin() { mg('rhythm', { title: '실 잣기', hint: '세라가 가락을 돌리면, 털 뭉치에서 실을 길게 뽑아요. 줄에 닿을 때 당겨요.', need: 6 }, () => { F('tq').s = 1; G.UI.quest(); say([{ n: '세라', t: '삼촌 손이 참 빨라요! 이제 나뭇가지랑 가죽만 있으면 짤 수 있어요.', e: 'happy' }]); }); }
/* the comb goes once (one rhythm game fills the five handfuls) */
{ const i = Game.CTX.findIndex(f => /tqComb/.test(String(f))); if (i >= 0) { const f0 = Game.CTX[i]; Game.CTX[i] = function (s) { const r = f0.apply(this, arguments); if (!r) return r; return r.map(a => a.key === 'tqComb' ? Object.assign({}, a, { label: '염소 털 빗기', use: () => G.UI.minigame('rhythm', { title: '염소 털 빗기', hint: '빗이 털끝에 닿을 때 눌러요. 살살, 엉킨 데는 천천히. 염소 다섯 마리를 차례로 빗어요.', need: 8 }, ok => { if (!ok) { toast('털이 엉켰어요 · 다시 살살'); return; } s.flags.tq = s.flags.tq || {}; s.flags.tq.comb = 5; P().emote = { k: 'pet', t: 0, dur: 1.2 }; sfx('goat', { soft: 1 }); G.UI.quest(); pop('염소털을 다 모았어요', '세라에게 가져가 실을 자아요', 'star'); }) }) : a); }; } }

// ------------------------------------------------------------------ the actions (A)
Game.CTX.push(function (s) { const p = P(); if (!s || !after(s) || p.ride || p.act || Game.cineOn || G.UI.busy()) return null; const act0 = (s.side && s.side.act) || {}, out = [];
  const at = (pt, r, label, key, use) => { const d = Math.hypot(pt[0] - p.x, pt[1] - p.z); if (d < r) out.push({ d: Math.min(d - 1, 0.4), x: pt[0], z: pt[1], y: 1, label, key, story: true, noMagnet: true, use }); }; /* (in range, the errand's own step comes before chatting with whoever stands closer) */
  if (act0.g_lamb) { const f = F('lamb'), sg = f.s | 0; if (sg === 0) at(PEN(), 9, '양 우리 살피기', 'gqPen', lambPen);
    if (sg === 2) at(ROCK, 3, '다친 어린양에게 부목 대기', 'gqSplint', lambSplint); if (sg === 3) at(ROCK, 3.4, '바위 그늘에 불 피우고 하룻밤', 'gqNight', lambNight); if (sg === 4) { const l = Game.npc('gqLamb'); if (near(PEN(), 9) && l && Math.hypot(l.x - p.x, l.z - p.z) < 9) at(PEN(), 9, '울타리 구멍 막기', 'gqFence', lambFence); } }
  if (act0.g_tent) { const f = F('tent'), sg = f.s | 0, t = TENT.levi(); if (sg === 0) at(acacia(), 4, '말뚝 나무 고르기', 'gqWood', tentPick); if (sg === 1) at(acacia(), 4.5, '손도끼로 말뚝 깎기', 'gqCarve', tentCarve);
    if (sg === 2) at([t[0] + 2.4, t[1] + 2], 4, '레위와 말뚝 박기', 'gqDrive', tentDrive); if (sg === 3 && s.day > (f.day | 0) && hour() > 9 && hour() < 18) at([t[0] + 2.4, t[1] + 2], 6, '모래바람 속 장막 지켜보기', 'gqStorm', tentStorm); }
  if (act0.g_bread) { const f = F('bread'), sg = f.s | 0, t = TENT.judah(), spot = [t[0] + 3, t[1] + 3]; if (!Game.npc('gqKid0') && sg < 6) spawnKids();
    if (sg === 0) at(spot, 4, '유다네 손주들 만나기', 'gqKids', breadMeet); if (sg === 1) at(spot, 4, '돌과 진흙으로 화덕 쌓기', 'gqOven', breadOven); if (sg === 2) at(spot, 4, '아이들과 반죽 치대기', 'gqKnead', breadKnead);
    if (sg === 3) { const left = (f.t0 || 0) <= 30 ? 0 : (f.t0 + 5) - ((s.day | 0) * 24 + s.time); if (left <= 0) { f.s = 4; G.UI.quest(); toast('반죽이 부풀었어요 · 굽자!'); } }
    if (sg === 4) at(spot, 4, '달군 돌판에 굽기', 'gqBake', breadBake); }
  if (act0.g_story) { const f = F('story'), i = f.s | 0, n = NIGHTS[i]; if (n && night() && f.day !== s.day) at(n.at(), 4.5, n.job, 'gqStory', () => storyNight(i)); }
  if (act0.g_benj) { const f = F('benj'), sg = f.s | 0, t = TENT.benjamin2(); if (sg === 0 && night()) at([t[0] + 1.6, t[1] + 2.2], 4, '등불 들기 · 베냐민과 밤길', 'gqLamp', benjLamp);
    if (sg === 1 && near(DUNE, 6)) { f.s = 2; G.UI.quest(); toast('모래 언덕이에요 · ✦ 「별자리」로 별을 이어 보세요'); }
    if (sg === 2) { const r = (s.flags.sev || {}).stars; if (r && r.n > (s.q.gbStars || 0)) { f.s = 3; G.UI.quest(); } }
    if (sg === 3) { const b = Game.npc('benjamin2'); if (b) at([b.x, b.z], 3, '베냐민과 이야기하기', 'gqBTalk', benjTalk); }
    if (sg === 4 && !f.carry) { const b = Game.npc('benjamin2'); if (b) at([b.x, b.z], 3, '겉옷 덮어 주고 곁에 앉기', 'gqCarryB', benjCarry); }
    if (sg === 4 && f.carry && near([t[0] + 1.2, t[1] + 2.2], 5)) benjHome(); }
  if (act0.d_figs) { const f = F('figs'), sg = f.s | 0; if (sg === 0) at(FIG, 3.6, '무화과나무 흔들어 받기', 'gqFig', figsCatch); if (sg === 1) at(MAT, 3.4, '돗자리에 무화과 널기', 'gqLay', figsLay);
    if (sg === 2 && s.day >= (f.day | 0) + 2) { f.s = 3; G.UI.quest(); toast('무화과가 다 말랐어요'); } if (sg === 3) at(MAT, 3.4, '무화과 떡 누르기', 'gqPress', figsPress); }
  if (act0.d_pack) { const f = F('pack'), g = f.got || (f.got = {}); const grab = (k, pt, label, item) => { if (!g[k]) at(pt, 3.4, label, 'gqP' + k, () => { g[k] = 1; act('pick'); sfx('pickup'); G.UI.quest(); toast(item + '을(를) 챙겼어요'); }); };
    grab('b', OVEN(), '화덕에서 빵 꺼내기', '빵'); grab('c', [GOATS()[0] - 3, GOATS()[1] + 3], '항아리에서 치즈 꺼내기', '치즈'); grab('o', [TENT.jacob()[0] + 1.6, TENT.jacob()[1] + 2], '아버지 장막의 올리브 담기', '올리브');
    const a = Game.npc('asher'); if (a && (f.s | 0) === 0 && ['b', 'c', 'o'].every(k => g[k])) at([a.x, a.z], 3, '천에 싸서 매듭 짓기', 'gqWrap', packWrap);
    if (a && (f.s | 0) === 1 && hour() >= 4.5 && hour() < 7.5) at([a.x, a.z], 3.4, '새벽 · 아셀 배웅하기', 'gqBye', packFarewell);
    if ((f.s | 0) === 2 && s.day >= (f.day | 0) + 3) { f.s = 3; const n = Game.npc('asher'); if (n) { n.forceVis = undefined; Game.npcTo('asher', GO[0] - 11, GO[1] - 4.6, 1.2, false); } G.UI.quest(); pop('아셀이 돌아왔어요', '고센에서 아셀에게 말을 걸어요', 'star'); } }
  if (act0.dq_pit && (F('pit').s | 0) === 0) { const r = Game.npc('reuben'); if (near(PITM, 5) && r && Math.hypot(r.x - p.x, r.z - p.z) < 9) at(PITM, 5, '길가에서 야영하기 (르우벤과)', 'gqPitCamp', pitCamp); }
  if (act0.tq_tent && ((s.flags.tq || {}).comb | 0) >= 5 && (F('tq').s | 0) < 1) { const sr = Game.npc('tqSerah'); if (sr) at([sr.x, sr.z], 3, '세라와 실 잣기', 'gqSpin', tqSpin); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ every second: the lamb's trail, the bread's rising (also when away)
let tk = 0;
const up0 = EP.update; EP.update = function (dt, s, g, t) { if (up0) up0.apply(this, arguments); if (!s || !after(s) || (tk -= dt) > 0) return; tk = 0.5; const act0 = (s.side && s.side.act) || {};
  if (act0.g_lamb) { const f = F('lamb'); if ((f.s | 0) === 1) { const k = f.k | 0, q = TRACK[Math.min(k, TRACK.length - 1)]; if (near(q, 4)) { f.k = k + 1; if (f.k === 2 && G.Life.bubble) G.Life.bubble('reuben', '발굽 자국이 작다. 새끼가 맞다.', 3); if (f.k === 4 && G.Life.bubble) G.Life.bubble('reuben', '털 뭉치다. 가시에 걸렸었구나.', 3); if (f.k >= TRACK.length) { f.s = 2; G.UI.quest(); spawn('gqLamb', { name: '다친 어린양', animal: 'sheep', scale: 0.6, x: ROCK[0], z: ROCK[1], face: 0 }); toast('바위틈에서 어린양 우는 소리가 나요'); } } } }
  if (act0.g_bread) { const f = F('bread'), j = Game.npc('judah'); if ((f.s | 0) === 3 && ((f.t0 || 0) <= 30 || ((s.day | 0) * 24 + s.time) - f.t0 >= 5)) { f.s = 4; G.UI.quest(); toast('유다네 반죽이 다 부풀었어요'); } if (j && !j.talking) j.forceVis = night() ? undefined : false; } /* (he said he'd be in the fields till night) */
  if (act0.d_pack) { const f = F('pack'), a = Game.npc('asher'); if ((f.s | 0) === 2 && a && !a.walk) a.forceVis = false; }
  if (act0.dq_pit) { const dq = s.flags.dq || {}, r = Game.npc('reuben'), pit = dq.pit || 0, fp = F('pit'); /* the walking Reuben hands over to the one at the pit (deepq.js), then walks home with Joseph (by the errand's state) */
    if (r && pit === 1 && !fp.hand) { if (near([168, -140], 22)) { fp.hand = 1; walkWith('reuben', false); r.forceVis = false; } else if (!r.follow && !near(GO, 20)) walkWith('reuben', true); }
    if (r && pit >= 2 && fp.hand && !fp.home) { if (!fp.back) { fp.back = 1; r.forceVis = undefined; const P0 = P(); Game.npcTo('reuben', P0.x - Math.sin(P0.face) * 1.6, P0.z - Math.cos(P0.face) * 1.6, P0.face, false); walkWith('reuben', true); toast('르우벤과 함께 고센으로 돌아가요'); }
      else if (near(GO, 24)) { fp.home = 1; walkWith('reuben', false); const t = TENT.reuben(); Game.npcTo('reuben', t[0] + 1.6, t[1] + 2.2, 0, false); r.walk = null; r.wander = null; }
      else if (!r.follow) walkWith('reuben', true); } }
  if (s.side && s.side.done && s.side.done.g_lamb !== undefined && !Game.npc('gqLamb')) { const p = PEN(), l = spawn('gqLamb', { name: '르우벤의 어린양', animal: 'sheep', scale: 0.62, x: p[0], z: p[1], face: 0 }); if (l) l.wander = { r: 2.5, cx: p[0], cz: p[1], tx: null, wait: 3 }; } /* (the lamb stays in the fold, also after loading) */ };

// ------------------------------------------------------------------ things to see: the footprints, the fig tree and the mat, the oven (dyn)
const MESH = {}, mk = (k, fn) => { if (!MESH[k]) { const g = new G.GB(k.length * 7 + 5); fn(g); MESH[k] = G.R.mesh(g); } return MESH[k]; }, MX = {}, mat = (k, x, y, z, ry, sx, sy, sz) => G.m4trs(MX[k] || (MX[k] = G.m4()), x, y, z, ry || 0, 0, 0, sx || 1, sy || 1, sz || 1);
const dy0 = EP.dyn; EP.dyn = function (list, s) { if (dy0) dy0.apply(this, arguments); if (!s || !after(s) || Game.mode !== 'play') return; const act0 = (s.side && s.side.act) || {}, P0 = P(); if (Math.hypot(P0.x - GO[0], P0.z - GO[1]) > 90) return;
  if (act0.g_lamb && (F('lamb').s | 0) === 1) { const pr = mk('gqPrint', g => { for (let i = 0; i < 2; i++) g.sph(0.05, 5, 3, { at: [i * 0.07 - 0.035, 0.01, 0], s: [1, 0.15, 1.4], c: 0x6a5a40, j: 0 }); });
    TRACK.forEach((q, i) => { if (i < (F('lamb').k | 0) - 1) return; for (let j = 0; j < 3; j++) { const n = TRACK[Math.min(TRACK.length - 1, i + 1)], u = j / 3, x = q[0] + (n[0] - q[0]) * u, z = q[1] + (n[1] - q[1]) * u; list.push({ mesh: pr, m: mat('pr' + i + '_' + j, x, hAt(x, z) + 0.02, z, Math.atan2(n[0] - q[0], n[1] - q[1])) }); } }); }
  if (act0.g_lamb && (F('lamb').s | 0) >= 1) list.push({ mesh: mk('gqRock', g => { const R = [[0, 0.7, 0, 1.5, 1.2], [1.4, 0.5, -0.6, 1.1, 0.9], [-1.2, 0.45, -0.8, 1.0, 0.8], [0.4, 1.5, -0.4, 0.9, 0.7]]; R.forEach(([x, y, z, r, sy]) => g.sph(r, 6, 5, { at: [x, y, z], s: [1.2, sy, 1], c: 0xa89a84, flat: true, j: 0.08 })); }), m: mat('gqRock', ROCK[0] + 0.6, hAt(ROCK[0], ROCK[1]) - 0.1, ROCK[1] - 1.6, 0.3), outline: true }); /* the rocks the lamb hid among */
  if (act0.d_figs || (s.side && s.side.done && s.side.done.d_figs !== undefined)) { list.push({ mesh: mk('gqFigTree', g => { g.cyl(0.14, 0.2, 1.8, 7, { at: [0, 0.9, 0], c: 0x7a6a58 }); for (let i = 0; i < 6; i++) g.sph(0.8 - (i % 2) * 0.15, 7, 5, { at: [Math.cos(i * 1.05) * 0.8, 2.2 + (i % 3) * 0.25, Math.sin(i * 1.05) * 0.8], c: i % 2 ? 0x4a7a3a : 0x5a8a42 }); for (let i = 0; i < 10; i++) g.sph(0.07, 5, 4, { at: [Math.cos(i * 2.3) * 1.1, 1.8 + (i % 4) * 0.2, Math.sin(i * 2.3) * 1.1], c: 0x6a3a5a }); }), m: mat('gqFigTree', FIG[0], hAt(FIG[0], FIG[1]), FIG[1], 0.4), outline: true });
    const fs = F('figs').s | 0; if (fs >= 2 || (s.side.done && s.side.done.d_figs !== undefined)) list.push({ mesh: mk('gqMat', g => { g.box(1.6, 0.02, 1.0, { at: [0, 0.01, 0], c: 0xc8a868, j: 0 }); for (let i = 0; i < 18; i++) g.sph(0.06, 5, 3, { at: [-0.65 + (i % 6) * 0.26, 0.04, -0.3 + Math.floor(i / 6) * 0.3], s: [1, 0.6, 1], c: 0x6a3a4a }); }), m: mat('gqMat', MAT[0], hAt(MAT[0], MAT[1]), MAT[1], 0.2), outline: false }); }
  const bs = F('bread').s | 0; if ((act0.g_bread && bs >= 2) || s.flags.gqOven) { const t = TENT.judah(), x = t[0] + 3.8, z = t[1] + 3.6; list.push({ mesh: mk('gqOvenM', g => { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.sph(0.2, 5, 4, { at: [Math.cos(a) * 0.42, 0.18, Math.sin(a) * 0.42], s: [1.2, 0.8, 1], c: 0x8a8070, flat: true }); } g.cyl(0.4, 0.44, 0.06, 10, { at: [0, 0.38, 0], c: 0x6a625a }); }), m: mat('gqOvenM', x, hAt(x, z), z), outline: true }); }
};

/* the lamb trotting after him: talking to it does nothing (it isn't a person) */
{ const t0 = G.Life.talk; G.Life.talk = function (id) { if (id === 'gqLamb' || /^gqKid/.test(id)) { if (/^gqKid/.test(id)) GG_bub(id, ['삼촌, 빵 언제 구워요?', '헤헤, 밀가루 묻었다!'][Math.random() * 2 | 0]); return true; } return t0.apply(this, arguments); }; }

// ------------------------------------------------------------------ no more repeat errands: one that is done stays done (an old save keeps its record)
for (const k in QS) if (QS[k].repeat) delete QS[k].repeat;
})(window.G);
