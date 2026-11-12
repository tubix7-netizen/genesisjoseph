/* 약속의 길 — 먼 땅의 사연 (v18.51)
   요셉은 「꿈을 푸는 사람」이에요. 먼 땅마다 풀리지 않는 꿈과 오래된 상처를 지닌 사람이 있어요. 두 편짜리 부탁(사연)마다
   현실에서 이야기를 모으고 → 꿈의 세계에 들어가 그 사람의 꿈속 세 가지 표징을 살피고 → 꿈을 풀고(고르기) → 현실에서 매듭을 지어요.
   · 갑돌 섬 「꺼지지 않는 등잔」→「애굽의 문」: 폭풍에 사라진 남편을 기다리는 도공 키라. 애굽 옥에 「정탐꾼」으로 갇혀 잊힌 선원 다우로.
   · 하란 「무너지는 돌무더기」→「미스바의 돌」: 라헬이 훔친 드라빔(창 31:19)을 평생 원망한 라반의 막내아들 아살. 라헬의 양털 띠를 돌려주고 함께 돌무더기를 다시 쌓아요.
   · 구스 「엇갈린 두 화살」→「반쪽 다리」: 같은 날 아버지와 아우를 잃은 구스 궁수와 애굽 요새 대장. 원수를 업고 죽은 군사의 부적.
   · 미디안 「다시 묶은 줄」→「살피시는 분의 샘」: 그 옛날 구덩이에서 나온 요셉에게 몰래 물을 주었다가 다시 줄을 묶은 아이 르우(창 16:13–14).
   · 갈대 어촌 「노 없는 배」→「집으로 흐르는 강」: 집안 배를 잃고 부끄러워 돌아오지 못하는 아들 켄티와 그물 깁는 어머니 메르티.
   · 다섯 사연을 다 마치면, 꿈의 들판의 천사에게서 「다섯 꿈의 들판」(창 41:52 · 50:20).
   꿈속 인물은 모두 살아 있는 사람의 꿈이나 요셉 자신의 기억이에요(죽은 이가 말하지 않아요). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, L = G.Life, DW = G.DW; if (!EP || !L || !L.questTalk || !DW) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, sub, ic) => G.UI.pop ? G.UI.pop(t, sub, ic) : G.UI.toast(t);
const say = (l, cb) => G.UI.say(l, cb), N = (n, t, e, ref) => ({ n, t, e, ref }), T = (t, ref) => ({ n: '', t, ref }), J = (t, e, ref) => ({ n: '요셉', t, e, ref });
const Q = EP.quests = EP.quests || {};
const act = id => { const s = S(); return !!(s && s.side && s.side.act && s.side.act[id]); };
const done = id => { const s = S(); return !!(s && s.side && s.side.done && s.side.done[id] !== undefined); };
const F = k => { const s = S(); return !!(s && s.flags && s.flags[k]); };
const setF = (k, msg) => { const s = S(); s.flags[k] = 1; if (G.UI.quest) G.UI.quest(); if (msg) pop(msg[0], msg[1], 'star'); };
const inv = k => (S().inv && S().inv[k]) || 0;
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); if (d && d.look) return d.look; for (const v of EP.villages || []) { const f = (v.folk || []).find(q => q.id === id); if (f) return f.look; } return null; };
const tint = (b, o) => Object.assign({}, b || {}, o);
const LAND = k => G.Lands && G.Lands.list.find(l => l.key === k);
const onLand = k => { const l = LAND(k); return !!(l && l.on()); };
const onKf = () => !!(G.Caphtor && G.Caphtor.inKf());
const away = () => !!(G.Byblos && G.Byblos.inBy());
const KF = G.Caphtor ? G.Caphtor.stage() : { x: -120, z: 95 }, HR = LAND('haran') ? LAND('haran').stage() : { x: 120, z: 40 }, KU = LAND('kush') ? LAND('kush').stage() : { x: -130, z: -95 }, MD = LAND('midian') ? LAND('midian').stage() : { x: 140, z: -120 };
Object.assign(Game.ITEMS, {
  kfShard: { n: '문어 인장 항아리 조각', cat: 'quest', p: 0, ic: 'bowl', c: '#7a4a8a', d: '어부 토스가 바닷가에서 주운 것 · 애굽 배의 밧줄 매듭이 묶여 있어요' },
  kfLampI: { n: '키라의 등잔', cat: 'key', p: 0, ic: 'oil', c: '#e8b040', d: '삼 년 동안 꺼지지 않았던 등잔' },
  hrStone: { n: '미스바의 돌', cat: 'key', p: 0, ic: 'stone', c: '#b0a890', d: '「여호와께서 너와 나 사이에 감찰하옵소서」 (창 31:49)' },
  kuAmulet: { n: '세누의 이름 부적', cat: 'quest', p: 0, ic: 'stone', c: '#2a6a9a', d: '애굽 군사 세누의 목에 걸려 있던 부적' },
  kuBow: { n: '세티 아버지의 활', cat: 'key', p: 0, ic: 'stick', c: '#6a4a2a', d: '두 사람이 화해하며 총리에게 맡긴 활' },
  mdRope: { n: '요셉을 묶었던 줄', cat: 'quest', p: 0, ic: 'thread', c: '#a08060', d: '르우가 오래 지니고 다닌 낡은 줄' },
  mdSkin: { n: '르우의 물가죽 부대', cat: 'key', p: 0, ic: 'drop', c: '#8a6a4a', d: '「…물. 마셔.」' },
  fvNetS: { n: '메르티가 기운 작은 그물', cat: 'key', p: 0, ic: 'thread', c: '#8a7a5a', d: '기다림으로 기운 그물' } });

// =================================================================== people who appear for the stories
const NP = d => { EP.npcs.push(Object.assign({ talkR: 3, noBond: true }, d)); };
NP({ id: 'sgDauro', name: '케프티우 선원 다우로', look: tint(lookOf('kfFisher') || lookOf('bySidon'), { top: 0x6a5a4a, hair: 0x2a2018 }), x: -27.5, z: 3.5, face: 0.6, sit: true, show: () => act('kfLamp2') && F('kfL2a') && !F('kfL2b') && !away() });
NP({ id: 'sgDauroQ', name: '케프티우 선원 다우로', look: tint(lookOf('kfFisher') || lookOf('bySidon'), { top: 0x1f5a8a }), x: -102.9, z: -71.9, face: Math.PI / 2, show: () => F('kfL2b') && !done('kfLamp2') && !away() });
NP({ id: 'sgDauroI', name: '케프티우 선원 다우로', look: tint(lookOf('kfFisher') || lookOf('bySidon'), { top: 0x1f5a8a }), x: KF.x - 7.2, z: KF.z - 22.4, face: Math.PI, show: () => F('kfL2b') && onKf(), chat: ['키라의 등잔은 이제 밤에만 켜요. 기다리는 불이 아니라, 저녁 먹는 불로요.', '총리님이 아니었으면 저는 아직 그 옥에 있었을 거예요.'] });
NP({ id: 'sgAsal', name: '라반의 아들 노인 아살', look: tint(lookOf('hrShep') || lookOf('jacob'), { top: 0x5a4a6a, mantle: 0x3a2a3a, age: 'old' }), x: HR.x + 20, z: HR.z + 17.6, face: Math.PI, sit: true, show: () => onLand('haran') && (done('hrHeap1') || act('hrHeap1')) });
NP({ id: 'sgKenti', name: '어부 아들 켄티', look: tint(lookOf('py_cut2') || lookOf('w_far'), { skin: 0x8a5a32 }), x: -44, z: 146, face: -1.2, show: () => (F('fvB2a') && F('fvB2b')) && !away(), chat: ['어머니가 배 이야기는 꺼내지도 못하게 하세요. 하하.', '새 배로 아침마다 그물을 걷어요. 돌 끄는 것보다 훨씬 좋아요!'] });

// =================================================================== the dreams
/* each dream: a zone of the dream world, three symbols to look at (and people of the dream), then a choice of how to read it */
const MESH = {}; let built = false;
function buildMeshes() { if (built) return; built = true; const R = G.R, GB = G.GB, mk = f => { const g = new GB(9); f(g); return R.mesh(g); };
  MESH.jar = mk(g => { g.lathe([[0.25, 0], [0.5, 0.3], [0.6, 0.75], [0.5, 1.15], [0.3, 1.35], [0.34, 1.45]], 14, { at: [0, 0, 0], c: 0xd8a070 }); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.cyl(0.06, 0.1, 1.5, 6, { at: [Math.cos(a) * 0.55, 0.75, Math.sin(a) * 0.55], rx: Math.sin(a) * 0.5, rz: -Math.cos(a) * 0.5, c: 0x9a4ab0 }); } g.sph(0.42, 10, 6, { at: [0, 1.55, 0], s: [1, 0.8, 1], c: 0xa85ac0 }); });
  MESH.lamp = mk(g => { g.cyl(0.9, 1.0, 0.12, 18, { at: [0, 0.06, 0], c: 0x5ab0d8 }); g.cyl(0.14, 0.2, 0.9, 8, { at: [0, 0.5, 0], c: 0xb0a080 }); g.sph(0.3, 10, 6, { at: [0, 1.0, 0], s: [1.4, 0.5, 1], c: 0xc89850 }); g.sph(0.14, 8, 6, { at: [0.3, 1.22, 0], s: [0.8, 1.6, 0.8], c: 0xffd060 }); });
  MESH.eyeDoor = mk(g => { for (const x of [-1.1, 1.1]) g.box(0.3, 3, 0.3, { at: [x, 1.5, 0], c: 0xd8c8a0 }); g.box(2.5, 0.35, 0.36, { at: [0, 3.1, 0], c: 0xd8c8a0 }); g.box(1.9, 2.8, 0.14, { at: [0, 1.4, 0], c: 0x6a4a30 }); g.box(2.1, 0.12, 0.2, { at: [0, 1.5, 0.12], c: 0x3a2a1a }); g.sph(0.42, 12, 6, { at: [0, 2.2, 0.08], s: [1.4, 0.7, 0.2], c: 0xf4efe2 }); g.sph(0.17, 10, 6, { at: [0, 2.2, 0.12], s: [1, 1, 0.3], c: 0x1a2a5a }); g.box(0.6, 0.06, 0.04, { at: [0.25, 1.9, 0.14], rz: -0.5, c: 0x1a2a5a }); });
  MESH.cairn = mk(g => { const st = [[0, 0.3, 0, 0.6], [0.5, 0.25, 0.3, 0.45], [-0.45, 0.25, 0.2, 0.45], [0.1, 0.7, 0.1, 0.45], [-0.2, 1.05, 0, 0.35], [0.15, 1.3, 0.05, 0.28]]; st.forEach(([x, y, z, r], i) => g.sph(r, 8, 5, { at: [x, y, z], s: [1.2, 0.75, 1], c: [0xb0a890, 0x9a9282, 0xc0b8a0][i % 3] })); g.sph(0.26, 8, 5, { at: [1.2, 0.2, 0.6], s: [1.2, 0.75, 1], c: 0xd8d0b8 }); });
  MESH.pedestal = mk(g => { g.box(0.9, 0.9, 0.9, { at: [0, 0.45, 0], c: 0x9a8a7a }); g.box(1.1, 0.12, 1.1, { at: [0, 0.96, 0], c: 0x8a7a6a }); g.box(0.5, 0.02, 0.5, { at: [0, 1.03, 0], c: 0x5a4a3a }); });
  MESH.watch = mk(g => { g.cyl(0.25, 0.35, 5, 10, { at: [0, 2.5, 0], c: 0xd8d0e8 }); g.sph(0.45, 12, 8, { at: [0, 5.3, 0], c: 0xfff0b0 }); g.cyl(1.2, 1.4, 0.3, 14, { at: [0, 0.15, 0], c: 0xb0a8c8 }); });
  MESH.arrows = mk(g => { g.cyl(0.12, 0.14, 2.6, 8, { at: [0, 1.3, 0], c: 0x7a5a3a }); for (const s of [-1, 1]) { g.cyl(0.03, 0.03, 2.2, 4, { at: [0, 1.7, 0.2], rz: s * 0.9, c: s < 0 ? 0xd8c070 : 0x2a2a2a }); g.cyl(0.0, 0.09, 0.25, 5, { at: [s * 0.85, 2.3, 0.2], rz: s * 0.9 - Math.PI / 2 * s, c: s < 0 ? 0xc89040 : 0x6a6a6a }); } });
  MESH.carry = mk(g => { const fig = (x, z, c, lean) => { g.box(0.45, 0.8, 0.28, { at: [x, 1.2, z], rx: lean, c }); g.sph(0.17, 8, 6, { at: [x, 1.75, z + lean * 0.3], c }); g.box(0.16, 0.8, 0.16, { at: [x - 0.12, 0.4, z], c }); g.box(0.16, 0.8, 0.16, { at: [x + 0.12, 0.4, z], c }); }; fig(0, 0, 0x2a2a3a, 0.35); g.box(0.42, 0.25, 1.0, { at: [0, 1.75, -0.45], c: 0x3a2a2a }); g.sph(0.16, 8, 6, { at: [0, 1.85, -1.0], c: 0x3a2a2a }); });
  MESH.bridge = mk(g => { g.box(6, 0.06, 2.2, { at: [0, 0.04, 0], c: 0x4a90c8 }); for (let i = 0; i < 6; i++) g.cyl(0.18, 0.18, 2, 8, { at: [-2.8 + i * 0.5, 0.2, 0], rx: Math.PI / 2, c: 0xb8a860 }); for (const x of [-3.4, 3.4]) g.cyl(0.16, 0.16, 1.4, 8, { at: [x, 0.3, 0.6], rx: Math.PI / 2, c: 0xa89850 }); });
  MESH.pit = mk(g => { g.cyl(1.5, 1.5, 0.06, 20, { at: [0, 0.02, 0], c: 0x1a1428 }); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.sph(0.32, 7, 5, { at: [Math.cos(a) * 1.75, 0.18, Math.sin(a) * 1.75], s: [1.2, 0.7, 1], c: 0x8a7a68 }); } });
  MESH.skin = mk(g => { g.sph(0.45, 10, 6, { at: [0, 0.45, 0], s: [1, 1.2, 0.8], c: 0x8a6a4a }); g.cyl(0.08, 0.12, 0.35, 6, { at: [0, 1.05, 0], c: 0x6a4a30 }); g.cyl(0.6, 0.6, 0.04, 14, { at: [0, 0.02, 0], c: 0x7ac0e0 }); });
  MESH.spring = mk(g => { for (let i = 0; i < 4; i++) g.cyl(1.6 - i * 0.35, 1.6 - i * 0.35, 0.05 + i * 0.05, 18, { at: [0, 0.03 + i * 0.05, 0], c: [0x6ac8e8, 0x8ad8f0, 0xb8ecf8, 0xffffff][i] }); g.cyl(0.08, 0.2, 1.6, 8, { at: [0, 0.8, 0], c: 0xd8f4ff }); });
  MESH.boat = mk(g => { g.cyl(0.38, 0.38, 3.6, 10, { at: [0, 0.4, 0], rz: Math.PI / 2, c: 0xb8a858 }); for (const s of [-1, 1]) g.cyl(0.06, 0.38, 0.9, 8, { at: [s * 2.2, 0.62, 0], rz: s * (Math.PI / 2 - 0.45), c: 0xa89850 }); g.cyl(1.9, 1.9, 0.04, 18, { at: [0, 0.02, 0], c: 0x4a90c8 }); });
  MESH.stone = mk(g => { g.sph(0.85, 10, 7, { at: [0, 0.8, 0], s: [1.2, 0.9, 1], c: 0x7a7470 }); g.box(0.5, 0.5, 0.04, { at: [0, 0.9, 0.86], c: 0x4a4440 }); });
  MESH.net = mk(g => { for (const x of [-1.6, 1.6]) g.cyl(0.05, 0.06, 2.2, 5, { at: [x, 1.1, 0], c: 0x7a5a3a }); g.box(3.2, 1.5, 0.03, { at: [0, 1.2, 0], c: 0x8a7a5a }); for (let i = 0; i < 8; i++) g.box(0.03, 1.5, 0.04, { at: [-1.4 + i * 0.4, 1.2, 0], c: 0x5a4a30 }); for (let i = 0; i < 4; i++) g.box(3.2, 0.03, 0.04, { at: [0, 0.6 + i * 0.4, 0], c: 0x5a4a30 }); });
  MESH.pillar = mk(g => { g.box(0.6, 2.2, 0.5, { at: [0, 1.1, 0], c: 0xb8a890 }); g.box(0.8, 0.2, 0.7, { at: [0, 2.25, 0], c: 0xa89880 }); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g.sph(0.26, 7, 5, { at: [Math.cos(a) * 0.75, 0.12, Math.sin(a) * 0.75], s: [1.2, 0.6, 1], c: 0x9a8a72 }); } });
}
const DREAMS = {
  kira: { title: '키라의 꿈', zone: 'lake', flag: 'kfL1c', land: () => onKf(),
    intro: [T('그 밤, 요셉은 키라의 가게 처마 아래에 앉아 기도했습니다.'), J('하나님, 이 사람의 꿈을 제게 보여 주십시오. 해석은 하나님께 있습니다.', 'pray', '창세기 40:8')],
    sym: [{ k: 'jar', dx: -6, dz: 2, n: '문어가 감싼 항아리', lines: [T('여덟 팔이 항아리를 감싸 쥐고 놓지 않아요. 그런데 항아리는 깨지지 않았어요. 금 하나 가지 않았어요.'), J('붙잡혀 있지만… 깨지지 않았다.')] },
      { k: 'lamp', dx: 0, dz: -6, n: '물속의 등잔', lines: [T('물속에 잠긴 등잔인데도 불꽃이 흔들리지 않아요. 누군가 계속 기름을 붓고 있는 것처럼요.'), J('키라의 기다림이구나. 그 불은 아직 꺼지지 않았다.')] },
      { k: 'eyeDoor', dx: 6, dz: 2, n: '눈이 그려진 문', lines: [T('애굽의 눈이 그려진 무거운 문이에요. 빗장이 바깥에 걸려 있어요. 문틈으로 낮은 목소리가 새어 나와요.'), T('「…나를 생각해 주오.」'), J('(이 말… 내가 옥에서 술 맡은 관원장에게 했던 바로 그 말이다.)', 'tender', '창세기 40:14')] }],
    ask: { t: '요셉은 이 꿈을 어떻게 풀까?', ok: '"다우로는 애굽의 어느 문 안에 붙잡혀 있으나 살아 있소. 키라의 등잔이 꺼지지 않은 것처럼."',
      no: [['"다우로는 바다에 잠들었소. 이제 잊으라는 꿈이오."', '요셉은 고개를 저었습니다. 항아리는 깨지지 않았고, 등잔은 꺼지지 않았습니다.'], ['"문어는 바다의 저주요. 섬을 떠나라는 뜻이오."', '요셉은 표징을 두려움으로 읽지 않았습니다. 꿈의 해석은 하나님께 있으니까요.']] },
    wake: [T('눈을 뜨니, 새벽 바다 위로 돌고래들이 뛰고 있었습니다.')] },
  asal: { title: '아살의 꿈', zone: 'ladder', flag: 'hrH1c', land: () => onLand('haran'),
    intro: [T('아살의 집 문간, 별 아래에서 요셉은 기도했습니다.'), J('「여호와께서 너와 나 사이에 감찰하옵소서」… 하나님, 두 집 사이를 살펴 주십시오.', 'pray', '창세기 31:49')],
    sym: [{ k: 'cairn', dx: -6, dz: 0, n: '무너지는 돌무더기', lines: [T('돌무더기 맨 위의 돌 하나가 굴러떨어져 있어요. 그 돌에 작은 손자국이 남아 있어요.'), J('아이가 놓았던 돌이구나.')] },
      { k: 'pedestal', dx: 6, dz: 0, n: '빈 받침대', lines: [T('비어 있는 받침대예요. 무엇이 있었는지는 흐릿한데, 빈자리만 크게 남아 있어요.'), J('아살이 잃은 것은 드라빔이 아니라… 부끄러워하던 아버지의 얼굴이었구나.')] },
      { k: 'watch', dx: 0, dz: -8, n: '지켜보는 기둥', lines: [T('사다리 언덕 위 높은 기둥 꼭대기에 빛이 있어요. 두 집 사이를 고루 비추는 빛이에요.'), J('미스바. 「우리 피차 떠나 있을 때에 여호와께서 너와 나 사이에 감찰하옵소서」', 'awe', '창세기 31:49')] }],
    people: [{ id: 'sgdAsal', name: '기억 속 소년 아살', look: () => tint(lookOf('ishBoy'), { top: 0x5a4a6a, kid: true }), dx: -4, dz: 2, face: 1.2, sym: 0, lines: [N('기억 속 소년 아살', '아버지가 이 돌을 놓으라고 했어요. 다시는 서로 해치지 말자는 돌이래요.'), N('기억 속 소년 아살', '그런데 왜 자꾸 떨어져요? 아무도 다시 올려놓지 않아요…', 'sad')] }],
    ask: { t: '요셉은 이 꿈을 어떻게 풀까?', ok: '"무너지는 것은 돌이 아니라 두 집 사이의 마음이오. 떨어진 돌 하나를, 두 집의 아들이 함께 다시 올려야 하오."',
      no: [['"야곱의 집이 이겼으니, 무너져도 상관없소."', '요셉은 형들을 떠올렸습니다. 이긴 쪽이 되어 남는 것은 언제나 외로운 일이었습니다.'], ['"드라빔을 찾아 돌려주면 끝날 일이오."', '우상은 돌려줄 것이 아니었습니다. 그리고 아살에게 필요한 것도 그것이 아니었습니다.']] },
    wake: [T('새벽, 들판 너머로 양 떼의 방울 소리가 들려왔습니다.')] },
  arrows: { title: '세티와 세네브의 꿈', zone: 'nile', flag: 'kuA1c', land: () => onLand('kush'),
    intro: [T('북소리가 잦아든 불가에서 요셉은 기도했습니다.'), J('같은 꿈을 꾸는 두 원수… 하나님, 이 꿈이 무엇인지 보여 주십시오.', 'pray')],
    sym: [{ k: 'arrows', dx: -6, dz: 1, n: '엇갈린 두 화살', lines: [T('한 기둥에 두 화살이 엇갈려 박혀 있어요. 하나는 애굽 화살, 하나는 구스 화살. 같은 날, 같은 물가에서 쏘아졌어요.')] },
      { k: 'carry', dx: 6, dz: 1, n: '업은 그림자', lines: [T('한 사람이 다른 사람을 등에 업고 비틀비틀 걸어가는 그림자예요. 업힌 사람은 구스 옷을, 업은 사람은 애굽 옷을 입었어요.'), J('원수가… 원수를 업고 있다.', 'awe')] },
      { k: 'bridge', dx: 0, dz: -7, n: '반쪽 다리', lines: [T('강 위에 갈대 다리가 반만 놓여 있어요. 양쪽 기슭에 갈대 다발이 하나씩 놓여 있어요.'), J('남은 반은… 양쪽에서 함께 놓아야 하는구나.')] }],
    ask: { t: '요셉은 이 꿈을 어떻게 풀까?', ok: '"두 사람의 원수는 서로가 아니라 그날의 슬픔이오. 그날 원수를 업은 이가 있었고, 남은 다리는 살아남은 두 사람이 놓아야 하오."',
      no: [['"구스 사람은 믿을 수 없다는 꿈이오. 요새를 굳게 지키시오."', '요셉은 형들을 떠올렸습니다. 원수로 남는 길은 언제나 쉬웠습니다.'], ['"화살이 다시 날아올 것이니 먼저 쏘라는 꿈이오."', '그것은 해석이 아니라 두려움이었습니다.']] },
    wake: [T('눈을 뜨니 폭포 소리가 들렸습니다. 불씨는 아직 따뜻했습니다.')] },
  pit: { title: '르우의 꿈', zone: 'hub', flag: 'mdW1c', land: () => onLand('midian'),
    intro: [T('천막 안, 낙타 방울 소리가 멀어지고… 요셉은 잠이 들었습니다.'), J('하나님, 그 밤을 다시 보아야 한다면 함께 가 주십시오.', 'pray')],
    sym: [{ k: 'pit', dx: 0, dz: -5, n: '마른 구덩이', lines: [T('물 없는 구덩이예요. 바닥에서 아이 목소리가 들려요.')] },
      { k: 'skin', dx: 6, dz: 0, n: '물가죽 부대', lines: [T('작은 손에 들린 물가죽 부대. 물이 한 방울씩 떨어져요.')] },
      { k: 'spring', dx: -6, dz: 1, n: '솟아나는 샘', lines: [T('구덩이 곁에서 맑은 샘이 솟아요. 광야에서 울던 하갈을 보신 분이 떠올라요.'), J('「내가 어떻게 여기서 나를 감찰하시는 하나님을 뵈었는고」', 'awe', '창세기 16:13')] }],
    people: [{ id: 'sgdYJ', name: '기억 속 어린 요셉', look: () => tint(lookOf('benjamin') || lookOf('ishBoy'), { top: 0xc84a2a, trim: 0x2a6ac8, kid: true }), dx: 0, dz: -6.8, face: 0, sym: 0,
        talk: () => [N('기억 속 어린 요셉', '형들, 여기서 꺼내 주세요… 왜 아무도 대답하지 않아요?', 'cry'), { n: '요셉', t: '(어린 나에게 무슨 말을 해 줄까?)', choices: [{ t: '"얘야, 너는 혼자가 아니란다. 이 구덩이에서도, 그 뒤 모든 길에서도 하나님이 함께하셨어."', lines: [N('기억 속 어린 요셉', '…정말요? 지금도요?', 'tender'), J('지금도. 그리고 네가 다 자란 뒤에도.', 'tender')] }, { t: '"조금만 참아. 너는 애굽의 총리가 될 거야."', ok: false, fb: '요셉은 쓴웃음을 지었습니다. 그것은 위로가 아니라 결말이었습니다. 구덩이 속 아이에게 필요한 것은 결말이 아니라 곁에 있는 사람이었습니다.' }] }] },
      { id: 'sgdYR', name: '기억 속 어린 르우', look: () => tint(lookOf('ishBoy'), { kid: true }), dx: 7.2, dz: 0.6, face: -1.6, sym: 1,
        talk: () => [N('기억 속 어린 르우', '…물. 마셔.', 'tender'), N('기억 속 어린 르우', '그런데… 나는 다시 묶었어. 할아버지가 무서워서. 미안해… 미안해…', 'cry'), { n: '요셉', t: '(르우에게 무슨 말을 해 줄까?)', choices: [{ t: '"너는 줄을 풀어 준 아이야. 다시 묶은 손보다, 풀어 준 그 손을 나는 기억한단다."', lines: [N('기억 속 어린 르우', '…풀어 준 손.', 'tender')] }, { t: '"그래, 너 때문에 나는 애굽까지 끌려갔단다."', ok: false, fb: '요셉은 입을 다물었습니다. 그 말은 사실이 아니었습니다. 요셉을 판 것은 형들이었고, 보내신 분은 하나님이셨습니다.' }] }] }],
    ask: { t: '요셉은 이 꿈을 어떻게 풀까?', ok: '"그 밤에도 나를 살피시는 분이 계셨소. 르우의 물 한 모금은 그분의 손길이었소."',
      no: [['"르우가 잘못했으니, 벌을 받아야 마음이 놓일 것이오."', '요셉은 이미 용서했습니다. 남은 것은 르우가 그 용서를 받아들이는 일이었습니다.'], ['"그 밤은 그냥 잊는 것이 좋소."', '「하나님이 나로 나의 모든 고난과 나의 아비의 온 집 일을 잊어버리게 하셨다」… 잊는다는 것은 지우는 것이 아니라, 고통이 힘을 잃는 것이었습니다.']] },
    wake: [T('천막 밖에서 르우가 낙타에게 물을 먹이고 있었습니다.')] },
  merti: { title: '메르티의 꿈', zone: 'nile', /* v18.52 a river dream by the dream Nile (it opened on the sheaf hill) */ flag: 'fvB1c', land: () => !away(),
    intro: [T('강가 그물 곁에서, 요셉은 기도하고 눈을 감았습니다.'), J('하나님, 이 어머니의 꿈을 보여 주십시오.', 'pray')],
    sym: [{ k: 'boat', dx: -6, dz: 1, n: '노 없는 갈대배', lines: [T('노가 없는데도 배가 천천히 흘러가요. 나일은 북쪽으로, 집 쪽으로 흐르지요.')] },
      { k: 'stone', dx: 6, dz: 1, n: '배에 실린 큰 돌', lines: [T('배가 가라앉을 만큼 무거운 돌이에요. 돌에 그림 글자 하나가 새겨져 있어요. 고개를 숙인 사람의 모양이에요.'), J('부끄러움이구나.')] },
      { k: 'net', dx: 0, dz: -7, n: '강가의 그물', lines: [T('끝없이 기워지는 그물. 기우는 손이 한 번도 쉬지 않아요.'), J('어머니가 깁는 것은 그물이 아니라 기다림이구나.', 'tender')] }],
    ask: { t: '요셉은 이 꿈을 어떻게 풀까?', ok: '"켄티는 부끄러움이라는 돌을 싣고 있소. 그 돌만 내려놓으면, 강물이 그를 집으로 데려올 것이오."',
      no: [['"배를 되찾기 전에는 돌아오지 말라는 꿈이오."', '요셉은 아버지 야곱을 떠올렸습니다. 아버지는 아무것도 묻지 않고 아들의 목을 안고 울었습니다.'], ['"켄티가 강에 빠질 것이라는 꿈이오."', '요셉은 두려움을 해석이라 부르지 않았습니다.']] },
    wake: [T('눈을 뜨니, 메르티가 벌써 그물을 깁고 있었습니다.')] } };
let ACTIVE = null; const FIG = [];
function startDream(key) { const D = DREAMS[key]; if (!D || DW.on()) return; buildMeshes(); const s = S();
  say(D.intro, () => { DW.enter(D.zone, null, { after: () => { ACTIVE = { key, read: {} }; const [x, z] = DW.zone(D.zone);
    for (const p of D.people || []) { const n = Game.spawnNPC({ id: p.id, name: p.name, look: p.look(), x: x + p.dx, z: z + p.dz, face: p.face || 0, talkR: 3, noBond: true, noTag: false }); FIG.push(p.id); if (n) n.dream = true; }
    pop(D.title, '꿈속의 세 가지 표징을 살펴요', 'star'); G.UI.quest && G.UI.quest(); } }); }); }
function clearFig() { while (FIG.length) { const id = FIG.pop(); if (Game.npc(id)) Game.removeNPC(id); } }
{ const ex0 = DW.exit; DW.exit = function (cb, quiet) { const wasActive = ACTIVE; ACTIVE = null; clearFig(); return ex0.call(this, (...a) => { const p = P(), f = EP.floor ? EP.floor(p.x, p.z, S()) : null; if (f !== null && f !== undefined && p.y < f - 0.5) { p.y = p.airTop = f; p.vy = 0; } cb && cb(...a); }, quiet); }; }
function wake() { const A = ACTIVE, D = A && DREAMS[A.key]; if (!D) return; const s = S(); s.flags[D.flag] = 1; DW.exit(() => setTimeout(() => say(D.wake, () => { G.UI.quest && G.UI.quest(); pop('꿈을 풀었어요', D.title, 'star'); sfx('insight'); }), 300)); }
function interpret() { const A = ACTIVE, D = A && DREAMS[A.key]; if (!D) return; const ch = [{ t: D.ask.ok, then: () => setTimeout(() => say([J('해석은 하나님께 있습니다. 다만 이 꿈은 이렇게 말하는 것 같습니다.', 'calm', '창세기 40:8')], wake), 60) }].concat(D.ask.no.map(([t, fb]) => ({ t, ok: false, fb })));
  for (let i = ch.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ch[i], ch[j]] = [ch[j], ch[i]]; } say([{ n: '요셉', t: D.ask.t, choices: ch }]); }
Game.CTX.push(function (s) { if (!ACTIVE || !DW.on() || G.UI.busy()) return null; const D = DREAMS[ACTIVE.key], [cx, cz] = DW.zone(D.zone), p = P(), out = [];
  D.sym.forEach((y, i) => { if ((D.people || []).some(q => q.sym === i)) return; /* a symbol with a person of the dream is read by talking with them */ const x = cx + y.dx, z = cz + y.dz, d = Math.hypot(p.x - x, p.z - z); if (d < 2.8) out.push({ d: d - 4, label: `${y.n} 살펴보기${ACTIVE.read[i] ? ' ✓' : ''}`, x, z, yAbs: DW.h(x, z) + 1.2, key: 'sgSym' + i, use: () => say(y.lines, () => { ACTIVE.read[i] = 1; G.UI.quest && G.UI.quest(); }) }); });
  const n = Object.keys(ACTIVE.read).length, d0 = Math.hypot(p.x - cx, p.z - cz); if (d0 < 4.5) out.push(n >= D.sym.length ? { d: d0 - 6, label: '꿈을 풀기', x: cx, z: cz, yAbs: DW.h(cx, cz) + 1, key: 'sgRead', noMagnet: true, use: interpret } : { d: d0 - 3.5, label: `꿈 풀기 · 표징 ${n}/${D.sym.length}`, disabled: true, x: cx, z: cz, yAbs: DW.h(cx, cz) + 1, key: 'sgRead' });
  return out.length ? out : null; });
{ const g0 = DW.goal; DW.goal = function () { if (!ACTIVE || !DW.on()) return g0 ? g0() : null; const D = DREAMS[ACTIVE.key], [cx, cz] = DW.zone(D.zone), i = D.sym.findIndex((y, k) => !ACTIVE.read[k]);
  if (i < 0) return { x: cx, z: cz, t: '꿈을 풀기 (가운데에서)', ch: '꿈의 세계 · ' + D.title }; const pp = (D.people || []).find(q => q.sym === i); return { x: cx + (pp ? pp.dx : D.sym[i].dx), z: cz + (pp ? pp.dz : D.sym[i].dz), t: `${D.title} · 표징 살펴보기 (${Object.keys(ACTIVE.read).length}/${D.sym.length})`, ch: '꿈의 세계 · ' + D.title }; }; }
// draw the symbols in the dream; the stones that stay in the lands
const DM = [G.m4(), G.m4(), G.m4()], LM = [G.m4(), G.m4()];
const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); const t = performance.now() / 1000;
  if (ACTIVE && DW.on()) { const D = DREAMS[ACTIVE.key], [cx, cz] = DW.zone(D.zone); D.sym.forEach((y, i) => { const mesh = MESH[y.k]; if (!mesh) return; const x = cx + y.dx, z = cz + y.dz; G.m4trs(DM[i], x, DW.h(x, z) + Math.sin(t * 1.2 + i) * 0.08, z, Math.atan2(cx - x, cz - z) + Math.sin(t * 0.4 + i) * 0.15, 0, 0, 1, 1, 1); list.push({ mesh, m: DM[i], emis: ACTIVE.read[i] ? [0.05, 0.05, 0.08] : [0.32, 0.26, 0.42] }); }); }
  else if (built || F('hrHeapDone') || F('mdWellDone')) { buildMeshes();
    if (F('hrHeapDone') && onLand('haran')) { G.m4trs(LM[0], HR.x - 10, 64, HR.z + 2, 0.4, 0, 0, 1.4, 1.4, 1.4); list.push({ mesh: MESH.cairn, m: LM[0] }); }
    if (F('mdWellDone') && onLand('midian')) { G.m4trs(LM[1], MD.x + 6.4, 64, MD.z + 9.6, -0.5, 0, 0, 1, 1, 1); list.push({ mesh: MESH.pillar, m: LM[1] }); } } };
// the quest box in a dream
if (G.UI && G.UI.quest) { const uq0 = G.UI.quest; G.UI.quest = function () { const r = uq0.apply(this, arguments); try { if (ACTIVE && DW.on()) { const D = DREAMS[ACTIVE.key], n = Object.keys(ACTIVE.read).length, el = document.getElementById('qList'); if (el) el.insertAdjacentHTML('beforeend', `<div class="${n >= D.sym.length ? 'ok' : ''}"><i>${n >= D.sym.length ? '✓' : '·'}</i><span>${D.title} · 표징 ${n}/${D.sym.length}${n >= D.sym.length ? ' · 가운데에서 꿈 풀기' : ''}</span></div>`); } } catch (e) { } return r; }; }

// =================================================================== the requests (two parts each)
const SLEEP = []; // where to lie down for a dream: { dream, at: () => [x, z], ok: s => bool, label }
// ------------------------------------------------------------------ 1 · 갑돌 섬
const KI = '도공 키라', KA = '갑돌 배 선장 카르파', DA = '케프티우 선원 다우로';
const kiraPos = () => [KF.x - 9, KF.z - 20.4];
Q.kfLamp1 = { giver: 'kfPotter', title: '꺼지지 않는 등잔', when: s => !!s.flags.kfMet,
  offer: [T('(가게 안쪽, 한낮인데도 작은 등잔에 불이 켜져 있어요.)'), N(KI, '아, 총리님. 등잔이요? …낮에도 끄지 않아요. 남편이 돌아오는 길을 잃지 않게요.', 'tender'),
    N(KI, '남편 다우로는 삼 년 전, 카르파 선장의 배들과 함께 애굽으로 떠났어요. 돌아오는 길에 큰 폭풍을 만났대요. 다른 배들은 돌아왔는데… 다우로가 탄 배만 돌아오지 않았어요.', 'sad'),
    N(KI, '사람들은 이제 그만 잊으래요. 그런데 매일 밤 같은 꿈을 꿔요. 문어가 항아리를 감싸 쥐고 놓지 않는 꿈. 물속에서도 꺼지지 않는 등잔. 그리고 커다란 눈이 그려진 문.', 'fear'),
    N(KI, '총리님은 바로 임금의 꿈도 푸셨다지요? 제발… 이 꿈이 무슨 뜻인지 알려 주세요.', 'cry')],
  prog: N(KI, '카르파 선장님과 어부 토스가 그날 일을 알 거예요. 그리고… 제 꿈을 함께 보아 주세요.'),
  obj: [{ t: '선장 카르파에게 그 폭풍 이야기 듣기', ok: s => !!s.flags.kfL1a }, { t: '어부 토스에게 바닷가에서 찾은 것 묻기', ok: s => !!s.flags.kfL1b }, { t: '키라의 가게 곁에서 기도하고 잠들어 꿈 보기', ok: s => !!s.flags.kfL1c }],
  loc: s => !s.flags.kfL1a ? 'npc:kfSail' : !s.flags.kfL1b ? 'npc:kfFisher' : !s.flags.kfL1c ? { x: kiraPos()[0] + 1.6, z: kiraPos()[1] - 1.2 } : 'npc:kfPotter',
  done: [J('키라, 그대의 꿈을 보았소.'), J('문어가 감싼 항아리는 깨지지 않았소. 물속의 등잔도 꺼지지 않았소. 그리고 그 문에는 애굽의 눈이 그려져 있었소.'), N(KI, '애굽… 그럼 다우로가 애굽에… 살아 있을지도 모른다는 말씀이세요?', 'awe'),
    J('확실히 말할 수는 없소. 해석은 하나님께 있으니까. 그러나 꿈이 가리킨 그 문을, 내가 열어 보겠소.', 'calm'), N(KI, '…삼 년 만에 처음으로, 등잔 말고 다른 것이 밝아요.', 'tender')],
  reward: { insight: 1 } };
Q.kfLamp2 = { giver: 'kfPotter', title: '애굽의 문', when: s => done('kfLamp1'),
  offer: [N(KI, '총리님, 애굽의 문을 열어 주세요. 다우로를 찾으시면… 이 섬으로 데려와 주세요.', 'tender'), N(KI, '그이가 돌아오는 날까지 등잔은 켜 둘게요.')],
  prog: N(KI, '애굽 왕의 옥… 그런 곳에 사람이 삼 년이나 있을 수 있나요?', 'sad'),
  obj: [{ t: '애굽 왕의 옥 간수장에게 케프티우 사람을 묻기', ok: s => !!s.flags.kfL2a }, { t: '옥에 갇힌 다우로 만나기', ok: s => !!s.flags.kfL2b }, { t: '다우로와 함께 갑돌 섬에 가기 (나일 북쪽 나루)', ok: s => !!s.flags.kfL2b && !!s.flags.kaftor }],
  loc: s => !s.flags.kfL2a ? 'npc:keeper' : !s.flags.kfL2b ? 'npc:sgDauro' : !s.flags.kaftor ? 'npc:kfCapE' : 'npc:kfPotter',
  done: [T('가게 문 앞에 선 사람을 보자, 키라의 손에서 물레가 멈췄습니다.'), N(KI, '…다우로?', 'awe'), N(DA, '키라. 등잔… 아직 켜 두었구나.', 'cry'), N(KI, '바보… 바보 같은 사람… 삼 년이에요, 삼 년!', 'cry'),
    T('두 사람은 한참을 붙들고 울었습니다. 항구 앞바다에서 돌고래 한 마리가 높이 뛰었습니다.'), N(KI, '총리님, 어떻게 이 은혜를 갚아야 할지…'),
    J('나는 옥에서 「나를 생각하고… 이 집에서 나를 건져내소서」 하고 부탁했다가 잊힌 사람이오. 그때 사람은 나를 잊었어도 하나님은 나를 잊지 않으셨소. 나는 그분께 받은 것을 조금 돌려드렸을 뿐이오.', 'tender', '창세기 40:23'),
    N(KI, '그럼 이 등잔을 가져가 주세요. 이제 우리 집엔 기다리는 불이 필요 없으니까요.', 'happy')],
  reward: { insight: 2, silver: 40, items: { kfLampI: 1 } }, finish: s => { s.flags.kfLampDone = 1; } };
SLEEP.push({ dream: 'kira', at: () => [kiraPos()[0] + 1.6, kiraPos()[1] - 1.2], ok: s => act('kfLamp1') && s.flags.kfL1a && s.flags.kfL1b && !s.flags.kfL1c && onKf(), label: '기도하고 잠들어 키라의 꿈 보기' });
// ------------------------------------------------------------------ 2 · 하란
const EL = '라반의 손자 엘닷', AS = '라반의 아들 노인 아살', SE = '할머니 세라';
Q.hrHeap1 = { giver: 'hrEldad', title: '무너지는 돌무더기', when: s => !!s.flags.hrEldad,
  offer: [N(EL, '형님, 부탁이 있어요. 우리 할아버지 아살 말이에요. 라반 할아버지의 막내아들이세요.'), J('라반 외할아버지의 아들이 아직 살아 계시다고?', 'awe'),
    N(EL, '네. 그런데 야곱 어른 이야기만 나오면 화를 내세요. 「우리 아버지의 드라빔을 훔쳐 달아난 집안」이라고요.', 'sad', '창세기 31:19'),
    N(EL, '요즘엔 밤마다 같은 꿈을 꾸고 소리를 지르며 깨세요. 길르앗에 쌓은 돌무더기가 무너지는 꿈이래요.', 'fear'), N(EL, '형님이 꿈을 푸는 분이라면… 할아버지를 한번 만나 주세요. 쫓겨나실 수도 있지만요.')],
  prog: N(EL, '할아버지는 집 앞에 앉아 계세요. 할머니 세라께서 그날 일을 잘 아실 거예요.'),
  obj: [{ t: '노인 아살 만나기', ok: s => !!s.flags.hrH1a }, { t: '할머니 세라에게 길르앗의 그날 이야기 듣기', ok: s => !!s.flags.hrH1b }, { t: '아살의 집 앞에서 기도하고 잠들어 꿈 보기', ok: s => !!s.flags.hrH1c }],
  loc: s => !s.flags.hrH1a ? 'npc:sgAsal' : !s.flags.hrH1b ? 'npc:hrSera' : !s.flags.hrH1c ? { x: HR.x + 23.4, z: HR.z + 15.2 } : 'npc:hrEldad',
  done: [J('엘닷, 할아버지의 꿈을 보았네. 무너지는 돌무더기 맨 위에서 굴러떨어진 돌에… 아이 손자국이 있었어.'), N(EL, '아이 손자국이요?'), J('할아버지가 소년일 때 놓은 돌이야. 무너지는 건 돌이 아니라 두 집 사이의 마음이었네. 떨어진 그 돌을, 두 집의 아들이 함께 다시 올려야 해.'),
    N(EL, '두 집의 아들이 함께라… 할아버지가 들으실까요?', 'sad'), J('들으시게 할 것이 하나 있네.', 'calm')],
  reward: { insight: 1 } };
Q.hrHeap2 = { giver: 'hrEldad', title: '미스바의 돌', when: s => done('hrHeap1'),
  offer: [J('엘닷, 내게 어머니 라헬이 이 집에 사실 때 짠 양털 띠가 있네. 이것을 라반의 집에 돌려드리고 싶어.'), N(EL, '고모님이 짠 띠를요?! …할아버지가 그걸 보시면…', 'awe'), N(EL, '형님, 같이 가요. 그리고 할아버지가 일어서실 수 있으면, 들판에 돌을 놓으러 가요.')],
  prog: s => (s.inv && s.inv.hrBand) || s.flags.hrH2a ? N(EL, '할아버지는 집 앞에 계세요.') : N(EL, '라헬 고모님의 띠는… 할머니 세라께서 갖고 계시던 그것 말이죠? 할머니께 가 보세요.'),
  obj: [{ t: '아살에게 라헬의 양털 띠를 돌려드리기', ok: s => !!s.flags.hrH2a }, { t: '들판에서 아살과 함께 돌무더기에 돌 올리기', ok: s => !!s.flags.hrH2b }],
  loc: s => !s.flags.hrH2a ? ((s.inv && s.inv.hrBand) ? 'npc:sgAsal' : 'npc:hrSera') : !s.flags.hrH2b ? { x: HR.x - 8.4, z: HR.z + 2 } : 'npc:hrEldad',
  done: [N(EL, '형님! 할아버지가 웃으셨어요! 오늘 밤엔 꿈도 안 꾸고 주무실 거래요.', 'happy'), N(AS, '(지팡이를 짚고 다가와) 라헬의 아들아.'), N(AS, '「이 무더기가 증거가 되고 이 기둥이 증거가 되나니」… 네 할아버지와 네 아버지가 한 약속을, 오늘 우리가 다시 지켰구나.', 'tender', '창세기 31:52'),
    N(AS, '네 하나님이 너를 지키셨구나. 구덩이에서도, 애굽에서도. 이 돌을 가져가거라. 미스바의 돌이다.', 'tender')],
  reward: { insight: 2, items: { hrStone: 1 } }, finish: s => { s.flags.hrHeapDone = 1; } };
SLEEP.push({ dream: 'asal', at: () => [HR.x + 23.4, HR.z + 15.2], ok: s => act('hrHeap1') && s.flags.hrH1a && s.flags.hrH1b && !s.flags.hrH1c && onLand('haran'), label: '기도하고 잠들어 아살의 꿈 보기' });
// ------------------------------------------------------------------ 3 · 구스
const SB = '요새 대장 세네브', ST = '활의 땅 궁수 세티', NF = '바구니 짜는 네피';
Q.kuArrow1 = { giver: 'kuCapt', title: '엇갈린 두 화살', when: s => !!s.flags.land_kushMet,
  offer: [N(SB, '총리님, 부끄러운 부탁입니다. 마을 궁수 세티는 우리 요새에 화살 한 대 팔지 않습니다. 요새 사람이 지나가면 활부터 잡지요.'),
    N(SB, '십 년 전 폭포 아래에서 국경 다툼이 있었습니다. 그날 제 아우 세누가 구스 화살에 쓰러졌고… 세티의 아버지도 그날 죽었습니다.', 'sad'),
    N(SB, '그런데 이상합니다. 요즘 밤마다 같은 꿈을 꿉니다. 강 위에서 두 화살이 엇갈리는 꿈이요. 마을 사람 말로는, 세티도 똑같은 꿈을 꾼답니다.', 'fear'),
    N(SB, '같은 꿈을 꾸는 원수라니… 총리님은 꿈을 푸신다지요.')],
  prog: N(SB, '세티는 과녁 쪽에 있을 겁니다. 조심하십시오.'),
  obj: [{ t: '궁수 세티의 이야기 듣기', ok: s => !!s.flags.kuA1a }, { t: '바구니 짜는 네피의 이야기 듣기', ok: s => !!s.flags.kuA1b }, { t: '북 마당 불가에서 기도하고 잠들어 꿈 보기', ok: s => !!s.flags.kuA1c }],
  loc: s => !s.flags.kuA1a ? 'npc:kuArcher' : !s.flags.kuA1b ? 'npc:kuWoman' : !s.flags.kuA1c ? { x: KU.x + 1.6, z: KU.z + 6 } : 'npc:kuCapt',
  done: [J('대장, 꿈을 보았소. 엇갈린 두 화살, 그리고 원수를 업고 가는 그림자.'), N(SB, '원수를… 업고요?'), J('이것을 보시오. 그날 다친 구스 사람을 업고 마을까지 걸어간 애굽 군사의 목에 걸려 있던 것이오.'),
    N(SB, '(부적을 받아 들고) 이건… 세누의 이름! 어머니가 그 애 목에 걸어 주신…', 'awe'), N(SB, '시신도 찾지 못했는데… 그 애가… 원수를 업고…', 'cry'),
    J('세티의 아버지는 그날 밤 아내 곁에서 숨을 거두었소. 세누가 업고 가지 않았다면, 그 작별조차 없었을 것이오.', 'tender')],
  take: { kuAmulet: 1 }, reward: { insight: 1 } };
Q.kuArrow2 = { giver: 'kuCapt', title: '반쪽 다리', when: s => done('kuArrow1'),
  offer: [N(SB, '세티에게 직접 말하고 싶습니다. 하지만 제가 가면 활부터 잡을 테니… 총리님이 먼저 그 아이에게 말해 주십시오.'), N(SB, '그리고 해 질 녘, 북 마당에서 만나고 싶다고 전해 주십시오. 십 년 동안 놓지 못한 반쪽 다리를 놓고 싶습니다.')],
  prog: N(SB, '세티가… 와 줄까요?', 'sad'),
  obj: [{ t: '세티에게 그날의 진실 전하기', ok: s => !!s.flags.kuA2a }, { t: '북 마당에서 세티와 세네브를 만나게 하기', ok: s => !!s.flags.kuA2b }],
  loc: s => !s.flags.kuA2a ? 'npc:kuArcher' : !s.flags.kuA2b ? { x: KU.x + 1.6, z: KU.z + 6 } : 'npc:kuCapt',
  done: [N(SB, '오늘 밤 요새 사람들도 북 마당에 갔습니다. 십 년 만에요.', 'happy'), N(SB, '세티가 이 활을 총리님께 맡기고 싶답니다. 두 집안의 화살이 다시는 서로를 향하지 않게, 애굽과 구스 사이에 두어 달라고요.'), J('「당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사」… 그날의 슬픔도 그분은 그렇게 바꾸시는구려.', 'tender', '창세기 50:20')],
  reward: { insight: 2, silver: 30, items: { kuBow: 1 } }, finish: s => { s.flags.kuArrowDone = 1; } };
SLEEP.push({ dream: 'arrows', at: () => [KU.x + 1.6, KU.z + 6], ok: s => act('kuArrow1') && s.flags.kuA1a && s.flags.kuA1b && !s.flags.kuA1c && onLand('kush'), label: '기도하고 잠들어 두 사람의 꿈 보기' });
// ------------------------------------------------------------------ 4 · 미디안
const RE = '미디안 대상 사람 르우', YA = '늙은 미디안 상인 야틸';
const CAMP = [-22, -36];
Q.mdWell1 = { giver: 'mdGuide', title: '다시 묶은 줄', when: s => !!s.flags.mdForgive,
  offer: [N(RE, '총리님… 할아버지가 말한 그 아이가 저예요.', 'sad'), N(RE, '그날 밤 줄을 풀고 물을 드렸지요. 그런데 새벽에 할아버지 발소리가 나자… 무서워서 다시 묶었어요. 총리님 손목에 줄을 다시 감던 그 감촉을, 지금도 잊지 못해요.', 'cry'),
    N(RE, '그 줄을 버리지 못하고 지니고 다녀요. 밤마다 마른 구덩이 꿈을 꿔요. 구덩이 속에서 아이가 부르는데, 저는 물가죽 부대를 들고 서 있기만 해요.'),
    N(RE, '총리님은 저희를 용서하셨다는데… 저는 저를 용서할 수가 없어요.', 'sad')],
  prog: N(RE, '그날 대상이 묵었던 자리는 협곡 남쪽이에요. 할아버지는 천막 곁에 계세요.'),
  obj: [{ t: '협곡 남쪽 옛 대상 야영터 찾아보기', ok: s => !!s.flags.mdW1a }, { t: '늙은 상인 야틸에게 르우 이야기 듣기', ok: s => !!s.flags.mdW1b }, { t: '오아시스 천막에서 기도하고 잠들어 꿈 보기', ok: s => !!s.flags.mdW1c }],
  loc: s => !s.flags.mdW1a ? { x: MD.x + CAMP[0], z: MD.z + CAMP[1] } : !s.flags.mdW1b ? 'npc:mdOld' : !s.flags.mdW1c ? { x: MD.x - 4, z: MD.z + 14 } : 'npc:mdGuide',
  done: [J('르우, 꿈속에서 그 구덩이에 다녀왔네. 구덩이 속에는 어린 내가 있었고, 그 곁에 물가죽 부대를 든 네가 있었어.'), N(RE, '…저도요?'),
    J('그리고 구덩이 곁에서 샘이 솟고 있었네. 그 밤에도 나를 살피시는 분이 계셨어. 네 물 한 모금은 그분의 손길이었네.', 'tender'), J('다시 묶은 손보다, 풀어 준 그 손을 나는 기억하네.'), N(RE, '…풀어 준 손을… 기억하신다고요.', 'cry')],
  reward: { insight: 1 } };
Q.mdWell2 = { giver: 'mdGuide', title: '살피시는 분의 샘', when: s => done('mdWell1'),
  offer: [N(RE, '(낡은 줄 한 타래를 내밀며) 이 줄을… 총리님이 정해 주세요. 버리든, 간직하든.', 'tender'), J('우리 둘이 함께 정하자. 오아시스로 가세.')],
  start: s => Game.give('mdRope', 1),
  prog: N(RE, '샘가에서 기다릴게요.'),
  obj: [{ t: '오아시스 샘가에 옛 줄을 묻기', ok: s => !!s.flags.mdW2a }, { t: '샘가에 기념 돌 세우기', ok: s => !!s.flags.mdW2b }],
  loc: s => ({ x: MD.x + 6.4, z: MD.z + 9.6 }),
  done: [N(RE, '광야 사람들은 이런 샘을 「브엘라해로이」라고 불러요. 나를 감찰하시는 살아 계신 분의 우물이라는 뜻이래요.', 'tender', '창세기 16:14'), N(RE, '오늘부터 이 샘을 그렇게 부를래요. 그리고 길에서 만나는 아이마다 물 한 모금씩 줄 거예요.', 'happy'),
    N(RE, '이 물가죽 부대를 가져가 주세요. 그날 밤 그 부대예요. 이제는… 부끄러운 물건이 아니에요.')],
  reward: { insight: 2, items: { mdSkin: 1 } }, finish: s => { s.flags.mdWellDone = 1; const H = s.hero; if (H) { H.mindMax = (H.mindMax || 100) + 5; H.mind = H.mindMax; } } };
SLEEP.push({ dream: 'pit', at: () => [MD.x - 4, MD.z + 14], ok: s => act('mdWell1') && s.flags.mdW1a && s.flags.mdW1b && !s.flags.mdW1c && onLand('midian'), label: '기도하고 잠들어 그 밤의 꿈 보기' });
// ------------------------------------------------------------------ 5 · 갈대 어촌
const ME = '그물 깁는 할머니 메르티', KE = '돌 끄는 일꾼 켄티', UN = '어부 어른 우나스', PE = '갈대배 짓는 페피';
const NETP = [-61, 153];
Q.fvBoat1 = { giver: 'fv_merti', title: '노 없는 배', when: s => (s.flags.fvNetN || 0) >= 1,
  offer: [N(ME, '총리님, 그물 깁는 솜씨를 보니… 사람 마음도 기워 주실 분 같아서요.', 'tender'), N(ME, '내 아들 켄티가 흉년 첫해에 피라미드 일꾼 마을로 일하러 갔다오. 두 해째 소식이 없소.', 'sad'),
    N(ME, '밤마다 꿈을 꾸오. 노 없는 갈대배가 강물에 떠가는데, 배에는 큰 돌이 실려 있소. 나는 강가에서 그물만 깁고 있고…', 'sad')],
  prog: N(ME, '우나스 어른이 그 애 사정을 알 거요. 피라미드 마을은 서쪽 사막 끝이고.'),
  obj: [{ t: '어부 어른 우나스에게 켄티 이야기 듣기', ok: s => !!s.flags.fvB1a }, { t: '피라미드 일꾼 마을에서 켄티 찾기', ok: s => !!s.flags.fvB1b }, { t: '메르티의 그물 곁에서 기도하고 잠들어 꿈 보기', ok: s => !!s.flags.fvB1c }],
  loc: s => !s.flags.fvB1a ? 'npc:fv_unas' : !s.flags.fvB1b ? 'npc:py_cut2' : !s.flags.fvB1c ? { x: NETP[0] + 1.6, z: NETP[1] } : 'npc:fv_merti',
  done: [J('메르티, 꿈을 보았소. 노 없는 배는 그래도 북쪽으로, 이 마을 쪽으로 흐르고 있었소.'), J('배에 실린 돌은 켄티가 진 부끄러움이오. 집안 배를 잃고 어머니 얼굴을 볼 낯이 없다 하더이다.'),
    N(ME, '배를 잃어서… 그래서 안 온다고? 이 바보 녀석…', 'cry'), J('그 돌만 내려놓으면, 강물이 그를 집으로 데려올 것이오.', 'tender'), N(ME, '돌을 내려놓으면… 그 애가 올까요?')],
  reward: { insight: 1 } };
Q.fvBoat2 = { giver: 'fv_merti', title: '집으로 흐르는 강', when: s => done('fvBoat1'),
  offer: [N(ME, '총리님, 켄티에게 전해 주시오. 이 어미는 배를 기다린 적 없다고. 그 애를 기다렸다고.', 'cry')],
  prog: N(ME, '…그물이 다 기워졌는데도 손이 멈추질 않는구려.'),
  obj: [{ t: '켄티에게 어머니의 꿈 전하기', ok: s => !!s.flags.fvB2a }, { t: '갈대배 짓는 페피에게 새 배 값 치르기 (은 60)', ok: s => !!s.flags.fvB2b }],
  loc: s => !s.flags.fvB2a ? 'npc:py_cut2' : !s.flags.fvB2b ? 'npc:fv_pepi' : 'npc:fv_merti',
  done: [T('저녁 강가, 새 갈대배 곁에 켄티가 서 있었습니다. 메르티의 손에서 그물이 떨어졌습니다.'), N(KE, '어머니… 배를, 아버지 배를 제가…', 'cry'), N(ME, '배는 무슨 배야. 이리 와, 이 녀석아.', 'cry'), N(KE, '…다녀왔습니다.', 'cry'),
    J('(「요셉이… 그 목을 어긋맞겨 안고 얼마 동안 울매」. 고센에서 아버지를 다시 만나던 그날 강가가 떠올랐습니다.)', 'tender', '창세기 46:29'),
    N(ME, '총리님, 이 작은 그물 받아 주시오. 두 해 동안 기다리며 기운 그물이오. 이제는 기다릴 일이 없으니까.', 'tender')],
  reward: { insight: 2, items: { fvNetS: 1 } }, finish: s => { s.flags.fvBoatDone = 1; } };
SLEEP.push({ dream: 'merti', at: () => [NETP[0] + 1.6, NETP[1]], ok: s => act('fvBoat1') && s.flags.fvB1a && s.flags.fvB1b && !s.flags.fvB1c && !away(), label: '기도하고 잠들어 메르티의 꿈 보기' });
// ------------------------------------------------------------------ the last: 다섯 꿈의 들판
const FIVE = ['kfLamp2', 'hrHeap2', 'kuArrow2', 'mdWell2', 'fvBoat2'];
const FIVEP = [{ id: 'sgF1', name: '꿈속의 키라와 다우로', look: () => lookOf('kfPotter'), dx: -7, dz: 3, l: '총리님, 꿈에서도 등잔이 켜져 있어요. 이번엔 둘이서 켰어요.' },
  { id: 'sgF2', name: '꿈속의 노인 아살', look: () => tint(lookOf('hrShep'), { age: 'old' }), dx: -3.5, dz: 7, l: '돌무더기가 이제 무너지지 않는다네. 맨 위에 라헬의 띠를 감아 두었지.' },
  { id: 'sgF3', name: '꿈속의 세티와 세네브', look: () => lookOf('kuArcher'), dx: 3.5, dz: 7, l: '꿈속 다리는 다 놓였소. 이젠 화살이 아니라 북소리가 강을 건넌다오.' },
  { id: 'sgF4', name: '꿈속의 르우', look: () => lookOf('mdGuide') || lookOf('ishBoy'), dx: 7, dz: 3, l: '마른 구덩이 꿈을 이제 안 꿔요. 꿈에서도 샘이 솟아요.' },
  { id: 'sgF5', name: '꿈속의 메르티와 켄티', look: () => lookOf('fv_merti'), dx: 0, dz: 9, l: '총리님, 이 꿈속 배엔 노가 있다오. 켄티가 젓고 있지!' }];
Q.sgFive = { giver: 'dAngel1', title: '다섯 꿈의 들판', when: s => FIVE.every(done),
  offer: [N('빛나는 천사', '요셉아, 오늘 밤 이 들판에 손님들이 왔단다. 네가 꿈을 풀어 준 이들이, 저마다 잠든 자리에서 이 들판에 이르렀구나.'), N('빛나는 천사', '그들을 만나 보겠느냐?')],
  prog: N('빛나는 천사', '들판 곳곳에 그들이 있단다.'),
  obj: [{ t: s => `꿈의 들판에서 다섯 사람 만나기 (${Object.keys(s.flags.sgMet || {}).length}/5)`, ok: s => Object.keys(s.flags.sgMet || {}).length >= 5 }],
  loc: s => { if (!DW.on()) return null; const m = s.flags.sgMet || {}, f = FIVEP.find(p => !m[p.id]); if (!f) return 'npc:dAngel1'; const [x, z] = DW.zone('hub'); return { x: x + f.dx, z: z + f.dz }; },
  done: [N('빛나는 천사', '바다 건너 섬에서, 강 위쪽 땅에서, 붉은 광야에서, 네 외가의 들판에서, 그리고 나일 강가에서… 네가 다녀간 곳마다 꿈이 풀렸구나.'),
    J('저는 꿈을 풀지 못합니다. 해석은 하나님께 있습니다.', 'calm', '창세기 41:16'), N('빛나는 천사', '그래. 그래서 그분이 너를 보내셨단다. 「하나님이 나로 나의 수고한 땅에서 창성하게 하셨다」, 네가 둘째 아들 이름에 담은 고백을 기억하느냐?', 'tender', '창세기 41:52'),
    N('빛나는 천사', '네가 수고한 땅은 애굽만이 아니었구나. 평안히 가거라, 꿈꾸는 자야.', 'tender')],
  reward: { insight: 3, silver: 100 }, finish: s => { s.flags.sgFiveDone = 1; const H = s.hero; if (H) { H.mindMax = (H.mindMax || 100) + 10; H.mind = H.mindMax; } } };
let fiveOn = false;
const upd = EP.update; EP.update = function (dt) { const r = upd ? upd.apply(this, arguments) : undefined; try { const want = DW.on() && act('sgFive') && !ACTIVE;
  if (want && !fiveOn) { const [x, z] = DW.zone('hub'); for (const p of FIVEP) if (!Game.npc(p.id)) Game.spawnNPC({ id: p.id, name: p.name, look: p.look() || lookOf('ct_wea'), x: x + p.dx, z: z + p.dz, face: Math.PI, talkR: 3, noBond: true }); fiveOn = true; }
  else if (!want && fiveOn) { for (const p of FIVEP) if (Game.npc(p.id)) Game.removeNPC(p.id); fiveOn = false; } } catch (e) { } return r; };

// =================================================================== where to lie down for a dream
Game.CTX.push(function (s) { if (DW.on() || Game.cineOn || G.UI.busy()) return null; const p = P(); for (const L0 of SLEEP) { let ok = false; try { ok = L0.ok(s); } catch (e) { } if (!ok) continue; const [x, z] = L0.at(), d = Math.hypot(p.x - x, p.z - z);
  if (d < 2.8) return [{ d: d - 1.6, label: L0.label, x, z, y: 0.6, key: 'sgSleep', noMagnet: true, use: () => startDream(L0.dream) }]; } return null; });
// the stones and the rope, by hand
Game.CTX.push(function (s) { if (DW.on() || Game.cineOn || G.UI.busy()) return null; const p = P(), out = [];
  if (act('hrHeap2') && s.flags.hrH2a && !s.flags.hrH2b && onLand('haran')) { const x = HR.x - 8.4, z = HR.z + 2, d = Math.hypot(p.x - x, p.z - z); if (d < 3) out.push({ d: d - 1.6, label: '아살과 함께 돌무더기에 돌 올리기', x, z, y: 0.6, key: 'sgCairn', use: () => G.UI.minigame('count', { title: '돌무더기 쌓기', hint: '아살 노인이 건네는 돌을 하나씩 올려요. 마지막 돌은 아살 노인의 몫이에요.', need: 7, btn: '돌 올리기', onPress: () => { P().emote = { k: 'gather', t: 0, dur: 0.4 }; } }, () => { const a = Game.npc('sgAsal'); if (a && G.Voice) G.Voice.react(a, 'laugh'); s.flags.hrHeapDone = 1; say([N(AS, '(떨리는 손으로 마지막 돌을 올리며) 아버지… 이 돌은 제가 놓습니다. 이번엔 떨어지지 않을 겁니다.', 'cry'), N(AS, '야곱의 아들아, 고맙다. 일흔 해 동안 내려놓지 못한 돌을… 오늘 내려놓았구나.', 'tender')], () => setF('hrH2b', ['돌무더기를 다시 쌓았어요', '엘닷에게 가요'])); }) }); }
  if (act('mdWell1') && !s.flags.mdW1a && onLand('midian')) { const x = MD.x + CAMP[0], z = MD.z + CAMP[1], d = Math.hypot(p.x - x, p.z - z); if (d < 3.2) out.push({ d: d - 1.8, label: '옛 대상 야영터 살펴보기', x, z, y: 0.5, key: 'sgCamp', use: () => { const w = s.q && s.q.tookWater; say([T('모래에 반쯤 묻힌 낡은 말뚝 하나. 낙타를 매어 두던 자리예요.'), J('(…여기다. 줄에 묶여 이 말뚝 곁에서 밤을 지냈지. 별이 너무 많아서, 아버지 장막에서 보던 하늘 같아서 울었다.)', 'sad'),
    J(w === 0 ? '(그때 작은 아이가 물을 내밀었는데, 나는 고개를 돌렸었지. 그래도 그 아이는 물을 내 곁에 두고 갔다.)' : '(그때 작은 손이 내 손목의 줄을 풀고 물을 내밀었지. 「…물. 마셔.」)', 'tender'), J('(그 아이가 르우였구나.)')], () => setF('mdW1a')); } }); }
  if (act('mdWell2') && onLand('midian')) { const x = MD.x + 6.4, z = MD.z + 9.6, d = Math.hypot(p.x - x, p.z - z); if (d < 3) { if (!s.flags.mdW2a) out.push({ d: d - 1.6, label: '샘가에 옛 줄을 묻기', x, z, y: 0.5, key: 'sgRope', use: () => { Game.take('mdRope', 1); P().emote = { k: 'gather', t: 0, dur: 1.2 }; say([T('요셉과 르우는 샘가 모래를 파고 낡은 줄을 묻었습니다. 르우가 그 위에 물 한 바가지를 부었습니다.'), N(RE, '…이제 이 줄은 샘물을 마시겠네요.', 'tender'), J('그래. 묶는 줄이 아니라, 물을 머금는 흙이 되겠지.')], () => setF('mdW2a')); } });
    else if (!s.flags.mdW2b) out.push({ d: d - 1.6, label: '샘가에 기념 돌 세우기', x, z, y: 0.5, key: 'sgPillar', use: () => G.UI.minigame('count', { title: '기념 돌 세우기', hint: '르우와 함께 돌을 받쳐 세워요.', need: 6, btn: '받치기', onPress: () => { P().emote = { k: 'gather', t: 0, dur: 0.4 }; } }, () => { s.flags.mdWellDone = 1; const r = Game.npc('mdGuide'); if (r && G.Voice) G.Voice.react(r, 'laugh'); setF('mdW2b', ['기념 돌을 세웠어요', '르우에게 말해요']); }) }); } }
  if (act('kuArrow2') && s.flags.kuA2a && !s.flags.kuA2b && onLand('kush')) { const x = KU.x + 1.6, z = KU.z + 6, d = Math.hypot(p.x - x, p.z - z); if (d < 3) out.push({ d: d - 1.6, label: '세티와 세네브를 북 마당으로 부르기', x, z, y: 0.6, key: 'sgDrum', noMagnet: true, use: () => drumScene(s) }); }
  return out.length ? out : null; });
function drumScene(s) { const a = Game.npc('kuArcher'), c = Game.npc('kuCapt'); G.UI.fade(() => { s.time = Math.max(s.time, 18.4); if (a) { a.x = KU.x - 1.6; a.z = KU.z + 10.6; a.walk = null; a.face = 1.6; } if (c) { c.x = KU.x + 2.6; c.z = KU.z + 10.6; c.walk = null; c.face = -1.6; } }, () => {
  say([T('해 질 녘, 북 마당의 불이 타올랐습니다. 마을 사람들과 요새 군사들이 멀찍이 둘러섰습니다.'), N(SB, '세티. 내 아우 세누가… 네 아버지를 업고 왔다는구나.', 'sad'), N(ST, '…알고 있소. 총리님이 말해 주셨소. 어머니도요.'),
    N(ST, '(부러진 애굽 화살촉을 내밀며) 십 년 동안 이걸 쥐고 잤소. 이제 당신이 가지시오. 당신 아우의 나라 것이니.'), N(SB, '(구스 활 한 자루를 내밀며) 이건 그날 폭포 아래서 주운 활이다. 네 아버지 것이겠지. 이제야 돌려준다.', 'tender'),
    N(ST, '…반쪽 다리. 이제 다 놓였소.', 'tender'), N('북 치는 아마니', '자, 그럼 북을 쳐야지요! 총리님, 장단 맞춰 주세요!', 'happy')], () => G.UI.minigame('rhythm', { title: '화해의 북', need: 7, beats: 14, gap: 0.62, hint: '북소리 표시가 선에 닿을 때 눌러요! 놓쳐도 괜찮아요. 오늘은 모두가 함께 치는 북이에요.' }, () => {
      for (const n of [a, c, Game.npc('kuDrum'), Game.npc('kuWoman')]) if (n && G.Voice) G.Voice.react(n, 'laugh', { vol: 0.8 }); setF('kuA2b', ['두 사람이 화해했어요', '요새 대장 세네브에게 가요']); })); }); }

// =================================================================== talking: the people of the stories answer first
const M0 = L.mark; /* the request engine's own marks: an offer (!) or a request ready to hand in (?) */
EP.talk = EP.talk || {}; /* 「다른 이야기를 나눈다」 under an offer: the guide still takes you home, the potter still sells */
EP.talk.mdGuide = () => { say([{ n: RE, t: '애굽으로 돌아가실까요?', choices: [{ t: '낙타 타고 애굽으로', then: () => { const l = LAND('midian'); if (l) l.go(false); } }, { t: '조금 더 둘러볼게요' }] }]); };
EP.talk.kfPotter = () => { G.UI.shop && G.UI.shop('kfShop'); };
const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(); if (!s) return lt0.apply(this, arguments); const n = Game.npc(id), fin = () => { if (n) n.talking = false; };
  try {
    if (FIG.includes(id) && ACTIVE) { const D = DREAMS[ACTIVE.key], p = (D.people || []).find(q => q.id === id); if (p) { const lines = (p.talk ? p.talk() : p.lines).concat(p.sym !== undefined && !ACTIVE.read[p.sym] ? D.sym[p.sym].lines : []); say(lines, () => { if (p.sym !== undefined) { ACTIVE.read[p.sym] = 1; G.UI.quest && G.UI.quest(); } fin(); }); return true; } }
    const fp = FIVEP.find(p => p.id === id); if (fp) { const m = s.flags.sgMet || (s.flags.sgMet = {}); m[id] = 1; if (n && G.Voice) G.Voice.react(n, 'happy'); say([N(fp.name, fp.l, 'happy')], () => { G.UI.quest && G.UI.quest(); fin(); }); return true; }
    // 갑돌
    if (id === 'kfSail' && act('kfLamp1') && !s.flags.kfL1a) { say([N(KA, '다우로 말씀이오? …그 폭풍은 사흘을 갔소. 돛대가 부러지고, 별도 보이지 않았지.', 'sad'), N(KA, '마지막으로 본 다우로의 배는 남쪽, 애굽 쪽으로 밀려가고 있었소.'),
      N(KA, '애굽 순찰선이 난파선 사람들을 건져 간다는 말도 들었소. 그런데… 건져진 이방 선원들이 정탐꾼으로 몰려 옥에 갇힌다는 소문도 있었지.'), J('(정탐꾼… 형들에게 내가 했던 바로 그 말이구나.)', 'sad', '창세기 42:9')], () => { setF('kfL1a'); fin(); }); return true; }
    if (id === 'kfFisher' && act('kfLamp1') && !s.flags.kfL1b) { say([N('갑돌 어부 토스', '폭풍이 지나고 한 달쯤 뒤였어요. 모래밭에 깨진 항아리가 밀려왔어요. 문어 인장이 찍혀 있었지요. 키라의 가마에서 구운 항아리예요.'),
      N('갑돌 어부 토스', '그런데 이상한 건, 항아리 목에 애굽 배 밧줄 매듭이 묶여 있었다는 거예요. 애굽 사람들 매듭은 우리 매듭이랑 달라요.'), N('갑돌 어부 토스', '키라한테는 차마 못 보여 줬어요. 총리님이 가져가세요.'), J('애굽 배가 이 항아리를… 그리고 어쩌면 사람도 건졌다는 뜻이구나.')], () => { Game.give('kfShard', 1); setF('kfL1b'); fin(); }); return true; }
    if (id === 'keeper' && act('kfLamp2') && !s.flags.kfL2a && !away()) { say([N('간수장', '케프티우 사람이요? …아, 삼 년 전 바다 순찰선이 건져 온 이방 선원들이 있었지요. 정탐꾼일지 모른다 하여 이 옥에 넣었습니다.'),
      N('간수장', '다른 이들은 병으로 죽거나 노역장으로 보내졌고… 한 사람이 아직 남아 있습니다. 옥 마당 구석에요.'), N('간수장', '아무도 그를 찾지 않았지요. 솔직히… 저도 잊고 있었습니다.', 'sad'), J('(나도 이 옥에서 두 해를 잊힌 채 있었지.)', 'sad', '창세기 41:1')], () => { setF('kfL2a', ['옥 마당 구석', '케프티우 선원을 찾아요']); fin(); }); return true; }
    if (id === 'sgDauro') { say([N(DA, '(고개를 들며) …애굽 말을 조금 합니다. 저는 정탐꾼이 아닙니다. 갑돌 섬의 선원… 다우로입니다.', 'weary'), J('다우로. 혹시 키라라는 사람을 아시오?'),
      N(DA, '키라…! 제 아내를 어떻게…', 'awe'), J('그대 아내는 삼 년 동안 낮에도 등잔을 끄지 않았소. 그대가 돌아오는 길을 잃지 않게.'), N(DA, '…', 'cry'), N(DA, '삼 년 동안 매일 밤 빌었습니다. 누군가 나를 기억해 주기를.', 'cry'),
      J('나도 이 옥에 갇혔던 사람이오. 「나를 생각하고… 나를 건져내소서」 하던 내 부탁은 잊혔지만, 하나님은 나를 잊지 않으셨소.', 'tender', '창세기 40:14'),
      { n: '요셉', t: '(간수장을 돌아보며)', choices: [{ t: '"총리의 이름으로 이 사람을 풀어 주시오. 정탐꾼이 아니라 난파한 선원이오."', lines: [N('간수장', '예, 총리님! 당장 풀어 드리겠습니다.'), N(DA, '…자유. 키라에게… 갈 수 있는 겁니까?', 'cry'), J('나일 북쪽 나루에 갑돌 배가 있소. 카르파 선장에게 가 있으시오. 나도 곧 가겠소.')] }] }],
      () => { setF('kfL2b', ['다우로가 풀려났어요', '나일 북쪽 나루의 갑돌 배로 · 함께 섬에 가요']); fin(); }); return true; }
    if (id === 'sgDauroQ') { say([N(DA, '카르파 선장님이 저를 태워 준대요. 총리님도 함께 가 주시겠어요?'), N(DA, '키라가… 저를 알아볼까요? 이렇게 야위었는데.', 'sad')], fin); return true; }
    // 하란
    if (id === 'sgAsal') {
      if (act('hrHeap1') && !s.flags.hrH1a) { say([N(AS, '야곱의 아들이라고? 썩 물러가라!', 'angry'), N(AS, '네 어미 라헬이 우리 아버지의 드라빔을 훔쳐 낙타 안장 밑에 감추고 그 위에 앉았었다. 아버지는 장막을 다 뒤지고도 찾지 못했지.', 'angry', '창세기 31:34'),
        N(AS, '아버지는 평생 그 일을 부끄러워하셨다. 사위에게 속고, 딸에게 속고…', 'sad'),
        { n: '요셉', t: '(무엇이라 답할까?)', choices: [{ t: '"제 어머니가 잘못하셨습니다. 그 아들로서 용서를 구합니다."', lines: [N(AS, '……', 'awe'), N(AS, '야곱 집안 사람이 고개를 숙이는 건 처음 보는구나.'), N(AS, '…가거라. 오늘은 그만 가. 머리가 아프구나.', 'weary')] },
          { t: '"그건 오래된 소문일 뿐입니다."', ok: false, fb: '요셉은 말을 삼켰습니다. 그것은 소문이 아니었습니다. 요셉은 진실 앞에서 어머니를 감싸지 않기로 했습니다.' },
          { t: '"우상 따위가 무슨 대수입니까."', ok: false, fb: '맞는 말이었지만, 지금 아살에게 필요한 것은 옳은 말이 아니었습니다. 그가 잃은 것은 우상이 아니라 아버지의 얼굴이었으니까요.' }] }], () => { setF('hrH1a'); fin(); }); return true; }
      if (act('hrHeap2') && !s.flags.hrH2a) { if (!inv('hrBand')) { say([N(AS, '또 왔느냐… 무슨 일이냐.'), J('(라헬 어머니의 띠가 없다. 할머니 세라께 가 보자.)')], fin); return true; }
        say([J('어머니가 이 집에 사실 때 짠 띠입니다. 어머니가 가져간 것은 돌려드릴 수 없지만, 어머니가 남긴 것을 이 집에 돌려드립니다.', 'tender'), N(AS, '(띠를 받아 들고 한참을 들여다본다)'),
          N(AS, '…라헬 누님 솜씨다. 누님은 이 무늬를 늘 거꾸로 짰지. 아버지가 그걸로 늘 놀리셨는데… 허허…', 'laugh'), N(AS, '…허허… 흐흑…', 'cry'),
          N(AS, '내 나이 일흔이 넘도록 그 원망을 지고 살았구나. 야곱의 아들아, 들판에 가자. 다리가 떨려도 돌 하나는 들 수 있다.', 'tender')], () => { Game.take('hrBand', 1); setF('hrH2a', ['라헬의 띠를 돌려드렸어요', '들판의 돌무더기 자리로']); fin(); }); return true; }
      if (s.flags.hrHeapDone) { say([N(AS, '라헬의 아들아, 띠는 돌무더기 맨 위에 감아 두었다. 바람에 날리지 않게 단단히.', 'tender')], fin); return true; }
      say([N(AS, '…야곱의 아들이 아직도 있느냐.', 'cold')], fin); return true; }
    if (id === 'hrSera' && act('hrHeap1') && !s.flags.hrH1b) { say([N(SE, '아살 말인가… 그 아이는 그날 겨우 열 살이었지.'), N(SE, '야곱이 몰래 떠나고, 라반 어른이 이레 길을 쫓아갔어. 길르앗 산에서 마주쳤지. 칼을 빼 들 줄 알았는데… 돌을 모아 무더기를 쌓더구먼.', 'calm', '창세기 31:23'),
      N(SE, '「내가 이 무더기를 넘어 네게로 가서 해하지 않을 것이요」 그렇게 약속하고 함께 먹었다네. 그때 아살이 작은 돌 하나를 안고 와서 맨 위에 올렸어. 다들 웃었지.', 'tender', '창세기 31:52'),
      N(SE, '그런데 그 아이는… 아버지가 부끄러워하는 얼굴만 기억하나 봐. 웃던 얼굴은 잊고.', 'sad')].concat(inv('hrBand') || s.flags.hrH2a ? [] : [N(SE, '이걸 가져가게. 라헬이 짠 띠야. 언젠가 쓸 데가 있을 걸세.')]), () => { if (!inv('hrBand') && !s.flags.hrH2a) Game.give('hrBand', 1); setF('hrH1b'); fin(); }); return true; }
    if (id === 'hrSera' && act('hrHeap2') && !inv('hrBand') && !s.flags.hrH2a) { say([N(SE, '라헬의 띠 말인가? 여기 있네. 이번엔 잃어버리지 말게.')], () => { Game.give('hrBand', 1); fin(); }); return true; }
    // 구스
    if (id === 'kuArcher' && act('kuArrow1') && !s.flags.kuA1a) { say([N(ST, '요새 대장이 보냈소? …흥.', 'angry'), N(ST, '내 아버지는 애굽 화살에 쓰러졌소. 이걸 보시오. 아버지 몸에서 뽑은 화살촉이오.', 'angry'),
      N(ST, '아버지는 숨이 붙은 채로 마을에 돌아왔다고 했소. 어떻게 돌아왔는지는 어머니가 끝내 말해 주지 않소.', 'sad'), N(ST, '…요즘엔 이상한 꿈까지 꾸오. 강 위에서 화살 두 대가 엇갈리는 꿈.')], () => { setF('kuA1a'); fin(); }); return true; }
    if (id === 'kuWoman' && act('kuArrow1') && !s.flags.kuA1b) { say([N(NF, '(바구니를 짜던 손을 멈추고) 세티가 그 이야기를 꺼냈나요…', 'sad'), N(NF, '그날 해 질 녘, 애굽 군사 하나가 피투성이가 된 내 남편을 업고 마을 어귀까지 왔어요. 자기 등에도 화살이 박혀 있었는데…'),
      N(NF, '남편을 내려놓고 그 자리에 쓰러졌어요. 남편은 그날 밤 내 곁에서 숨을 거뒀고, 그 군사도 새벽을 넘기지 못했어요.', 'cry'),
      N(NF, '세티에게는 말하지 못했어요. 애굽 사람이 은인이라는 걸 그 애가 견딜 수 없을 것 같아서. 그 군사 목에 이게 걸려 있었어요.'), J('(그림 글자로 이름이 새겨져 있다…) 「세누」. 요새 대장의 아우 이름이다.', 'awe')], () => { Game.give('kuAmulet', 1); setF('kuA1b', ['세누의 이름 부적', '그날의 진실']); fin(); }); return true; }
    if (id === 'kuArcher' && act('kuArrow2') && !s.flags.kuA2a) { say([N(ST, '또 오셨소. 요새 대장 이야기라면…'), J('세티, 그대 아버지를 업고 마을까지 온 사람이 있었소. 애굽 군사였소. 그의 이름은 세누. 요새 대장의 아우요.'),
      N(ST, '……', 'awe'), { n: '요셉', t: '(어떻게 이어 말할까?)', choices: [{ t: '"그대 어머니가 십 년을 품고 있던 이야기요. 그대가 미워할 사람이 하나 줄어든다고, 그대 아버지가 덜 소중해지지는 않소."', lines: [N(ST, '(활을 천천히 내려놓으며) …원수가… 아버지를 업고 왔다고.', 'cry'), N(ST, '해 질 녘에 북 마당으로 가겠소. 그 사람 얼굴을… 한 번 보고 싶소.', 'sad')] },
        { t: '"그러니 이제 애굽에 고마워해야 하오."', ok: false, fb: '요셉은 고개를 저었습니다. 고마움을 명령할 수는 없었습니다. 형들에게도 그랬습니다.' }] }], () => { setF('kuA2a', ['세티가 활을 내려놓았어요', '해 질 녘 북 마당으로']); fin(); }); return true; }
    // 미디안
    if (id === 'mdOld' && act('mdWell1') && !s.flags.mdW1b) { say([N(YA, '르우 말이오? …그 애는 그날 이후로 말수가 줄었소.', 'sad'), N(YA, '다시 묶으라고 시킨 건 나였소. 그 애는 내 손을 피할 수 없었지. 그 애 잘못이 아니오.', 'cry'), N(YA, '그 애는 내 잘못까지 지고 사는 것이오. 그 짐을… 좀 내려 주시오.')], () => { setF('mdW1b'); fin(); }); return true; }
    // 갈대 어촌 · 피라미드 마을
    if (id === 'fv_unas' && act('fvBoat1') && !s.flags.fvB1a) { say([N(UN, '켄티 말이오? …허허, 그 녀석.', 'sad'), N(UN, '흉년 첫해에 곡식을 꾸었다가 갚지 못해 집안 배를 빼앗겼소. 그 배가 메르티 남편이 남긴 배였지.'), N(UN, '그 녀석, 어미 얼굴을 볼 낯이 없다며 피라미드 일꾼 마을로 떠났소. 돌이라도 끌어서 배 값을 갚겠다고.')], () => { setF('fvB1a'); fin(); }); return true; }
    if (id === 'py_cut2' && act('fvBoat1') && !s.flags.fvB1b) { say([N(KE, '어머니가… 저를 찾으세요? (돌 끄는 줄을 내려놓으며)', 'awe'), N(KE, '아버지 배를 잃은 놈이 무슨 낯으로 돌아가요. 돌이라도 끌어서 배 값을 모으려 했는데… 두 해가 지나도 반도 못 모았어요.', 'sad'), N(KE, '어머니께 제가 잘 지낸다고만… 아니, 아무 말도 하지 마세요.', 'cry')], () => { setF('fvB1b'); fin(); }); return true; }
    if (id === 'py_cut2' && act('fvBoat2') && !s.flags.fvB2a) { say([J('켄티, 그대 어머니는 꿈에서 노 없는 배를 보았소. 그 배엔 큰 돌이 실려 있었고.'), N(KE, '…돌이요?'), J('부끄러움이라는 돌이오. 그리고 어머니가 전해 달라 하셨소. 「이 어미는 배를 기다린 적 없다. 너를 기다렸다.」', 'tender'),
      { n: '요셉', t: '(무엇을 덧붙일까?)', choices: [{ t: '"나도 스물두 해 만에 아버지를 만났소. 아버지는 내가 무엇을 가졌는지 묻지 않으셨소. 그저 목을 안고 우셨지."', lines: [N(KE, '(한참을 울다가) …돌아갈게요. 빈손이라도.', 'cry')] }, { t: '"배 값을 다 모으면 돌아가시오."', ok: false, fb: '요셉은 그 말을 하지 않았습니다. 그것은 메르티의 꿈이 말한 것과 정반대였습니다.' }] }], () => { setF('fvB2a', ['켄티가 돌아가기로 했어요', '갈대배 짓는 페피에게']); fin(); }); return true; }
    if (id === 'fv_pepi' && act('fvBoat2') && !s.flags.fvB2b) { const ok = (s.silver || 0) >= 60; say([N(PE, '메르티 할머니 댁 배 말이에요? 켄티가 돌아온다고요?! 하하, 좋지요!', 'happy'), N(PE, '갈대 값이랑 품삯해서 은 60이면 튼튼한 배를 지어 드릴게요.')].concat(ok ? [{ n: '요셉', t: '(어떻게 할까?)', choices: [{ t: '은 60 치르기', then: () => { Game.silver(-60); setTimeout(() => say([N(PE, '사흘이면 돼요. 켄티 이름도 뱃머리에 새겨 둘게요!', 'happy')], () => setF('fvB2b', ['새 갈대배를 맡겼어요', '메르티에게 가요'])), 50); } }, { t: '다음에요' }] }] : [J('(은이 모자라다. 60이 필요하다.)')]), fin); return true; }
    /* the story steps above come first (a jailer with another request still answers about the sailor); then offers and hand-ins */
    if (M0 && M0(id)) { if (L.questTalk(id)) return true; }
  } catch (e) { console.error('sagas', e); }
  return lt0.apply(this, arguments); };
// a story person's mark over the head while they have something to say
if (L.mark) { const m0 = L.mark; L.mark = function (id) { const r = m0.apply(this, arguments); if (r) return r; const s = S(); if (!s) return null;
  const pend = { kfSail: act('kfLamp1') && !s.flags.kfL1a, kfFisher: act('kfLamp1') && !s.flags.kfL1b, keeper: act('kfLamp2') && !s.flags.kfL2a, sgDauro: act('kfLamp2') && !s.flags.kfL2b, sgAsal: (act('hrHeap1') && !s.flags.hrH1a) || (act('hrHeap2') && !s.flags.hrH2a), hrSera: act('hrHeap1') && !s.flags.hrH1b,
    kuArcher: (act('kuArrow1') && !s.flags.kuA1a) || (act('kuArrow2') && !s.flags.kuA2a), kuWoman: act('kuArrow1') && !s.flags.kuA1b, mdOld: act('mdWell1') && !s.flags.mdW1b, fv_unas: act('fvBoat1') && !s.flags.fvB1a, py_cut2: (act('fvBoat1') && !s.flags.fvB1b) || (act('fvBoat2') && !s.flags.fvB2a), fv_pepi: act('fvBoat2') && !s.flags.fvB2b };
  return pend[id] ? '!' : null; }; }
// 발자취: 사연
addEventListener('DOMContentLoaded', () => { if (!(G.Trail && G.Trail.GROUPS)) return; const D = id => s => s.side && s.side.done && s.side.done[id] !== undefined ? 1 : 0;
  G.Trail.GROUPS.push({ t: '사연', on: () => { const s = S(); return !!(s && (s.flags.kfMet || s.flags.land_haranMet || s.flags.land_kushMet || s.flags.land_midianMet || (s.flags.fvNetN || 0) > 0)); }, list: [
    { id: 'sgKf', n: '꺼지지 않는 등잔', h: '갑돌 섬의 도공 키라', v: D('kfLamp2'), max: 1 }, { id: 'sgHr', n: '미스바의 돌', h: '하란의 라반의 손자 엘닷', v: D('hrHeap2'), max: 1 },
    { id: 'sgKu', n: '반쪽 다리', h: '구스의 요새 대장 세네브', v: D('kuArrow2'), max: 1 }, { id: 'sgMd', n: '살피시는 분의 샘', h: '미디안의 대상 사람 르우', v: D('mdWell2'), max: 1 },
    { id: 'sgFv', n: '집으로 흐르는 강', h: '갈대 어촌의 메르티 할머니', v: D('fvBoat2'), max: 1 }, { id: 'sgAll', n: '다섯 꿈의 들판', h: '다섯 사연을 마친 뒤 · 꿈의 들판의 천사', v: D('sgFive'), max: 1 }] }); });
G.Sagas = { start: startDream, active: () => ACTIVE, dreams: DREAMS };
})(window.G);
