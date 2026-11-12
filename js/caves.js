/* 약속의 길 — 숨은 동굴들 · 공포 연출 · 동굴 끝 보상 (v18.27)
   요셉이 총리가 된 뒤(c5_patrol부터) 애굽과 가나안 곳곳에 작은 동굴 세 곳이 열려요. 입구마다 횃불 꽂이가 있어 횃불을 빌려 갈 수 있어요.
   · 여우굴 (광야 길 남쪽 바위 언덕): 구불구불한 굴. 박쥐 떼 · 어둠 속 두 눈 · 무너지는 돌. 맨 끝에 옛 목자의 은 주머니.
   · 끈기의 바위 굴 (남서쪽 바위산): 높은 굴 안에 돌기둥이 나선으로 솟아 있어요. 점프로 기둥을 하나씩 밟고 꼭대기까지!
     떨어지면 바닥부터 다시(다치지는 않아요). 중간중간 넓은 쉼터 바위. 꼭대기엔 끈기의 항아리(최대 기력 +10 · 은 · 금귀고리) + 밧줄로 내려오기.
   · 메아리 굴 (남쪽 나일 강가 언덕): 짧고 으스스한 굴. 속삭임과 물보라… 그리고 맨 끝엔 보물 대신 누군가의 낙서.
   공포 연출(G.Scare): 박쥐 떼가 얼굴로 날아들고, 어둠 속에서 눈이 번쩍이고, 돌이 무너지고, 바람에 횃불이 꺼질 뻔하고, 물에서 뭔가 튀어 올라요.
   화면이 흔들리고 어두워져요. 한 번 들어갈 때마다 자리마다 한 번씩. 기인의 동굴(cave.js)도 이 연출을 써요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), rnd = a => a[Math.floor(Math.random() * a.length)];
const ro = w => { const c = w.charCodeAt(w.length - 1) - 0xac00, b = c >= 0 && c < 11172 ? c % 28 : 0; return b === 0 || b === 8 ? '로' : '으로'; }; /* v18.34 여우굴로 · 바위 굴로 (not 굴으로) */
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const after = k => { const s = S(), o = Game.stepOrder(); if (!s) return false; const i = o.indexOf(s.step), j = o.indexOf(k); return i >= 0 && j >= 0 && i >= j; };
Object.assign(Game.ITEMS, { lapis: { n: '청금석', cat: 'good', p: 40, ic: 'stone', c: '#2c4f9a' }, goldRing: { n: '옛 금귀고리', cat: 'good', p: 70, ic: 'coin', c: '#e8c048' } });

// =================================================================== G.Scare — the frights
const Sc = G.Scare = { dark: 0 };
let fx = null; { fx = document.createElement('div'); fx.id = 'scareFx'; document.body.appendChild(fx); const css = document.createElement('style');
  css.textContent = `#scareFx{position:fixed;inset:0;pointer-events:none;z-index:7;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 25%,rgba(20,0,0,.88) 100%);transition:opacity .5s}
#scareFx.on{opacity:1;transition:none}#scareFx.red{background:radial-gradient(ellipse at center,rgba(80,0,0,.15) 20%,rgba(40,0,0,.92) 100%)}
@keyframes scShake{0%{transform:translate(0,0)}20%{transform:translate(-9px,5px)}40%{transform:translate(8px,-6px)}60%{transform:translate(-6px,-4px)}80%{transform:translate(5px,6px)}100%{transform:translate(0,0)}}
canvas.scShake{animation:scShake .32s linear 2}`; document.head.appendChild(css); }
function jolt(red, k) { fx.className = 'on' + (red ? ' red' : ''); setTimeout(() => { fx.className = ''; }, red ? 620 : 300); if (G.Audio && G.Audio.sting) G.Audio.sting(red ? 1 : 0.6); /* v18.35 a stab of sound: dread rides on the ear */ const c = document.querySelector('canvas'); if (c) { c.classList.remove('scShake'); void c.offsetWidth; c.classList.add('scShake'); setTimeout(() => c.classList.remove('scShake'), 700); }
  if (Game.CAM) Game.CAM.punch = (k || 0.14); if (navigator.vibrate && Game.SET.haptic !== 'off') try { navigator.vibrate([60, 40, 90]); } catch (e) { } }
const EYES = []; let wolf = null;
/* v18.35 the frights that truly make you jump: a bandaged thing lurches out of the dark straight at the camera; a swarm of real bats goes through your face */
const MUM = { look: { skin: 0xb8ac94, top: 0xcfc3a6, bottom: 0xc0b498, trim: 0xa89a80, long: true, bare: false, hairStyle: 'bald', hair: 0xb8ac94, barefoot: true, build: 0.72, eye: 0x101010 } }; const LURK = []; const BATS = []; let batMesh = null; const BM = [];
function lurch(ax, az) { const p = P(), a = Math.atan2(p.x - ax, p.z - az); LURK.push({ x: ax, z: az, y: p.y, f: a, t: 0, tx: p.x - Math.sin(a) * 0.7, tz: p.z - Math.cos(a) * 0.7 }); sfx('whoosh', { vol: 1, pitch: 0.3 }); setTimeout(() => { sfx('bite', { vol: 1, pitch: 0.28 }); jolt(true, 0.34); Sc.dark = 0.9; }, 620); setTimeout(() => G.UI.toast(rnd(['…뭐, 뭐였지? 붕대를 감은…', '방금 눈앞까지 왔다가 사라졌어요…', '심장이 쿵쾅거려요…'])), 1900); }
function batSwarm(ax, y, az) { const p = P(); for (let i = 0; i < 16; i++) BATS.push({ x: ax + (Math.random() - 0.5) * 3, y: y + 1.2 + Math.random() * 1.4, z: az + (Math.random() - 0.5) * 3, vx: (p.x - ax) * 1.3 + (Math.random() - 0.5) * 6, vy: (Math.random() - 0.2) * 1.6, vz: (p.z - az) * 1.3 + (Math.random() - 0.5) * 6, t: 1.5 + Math.random() * 0.8, ph: Math.random() * 6 }); } /* eyes in the dark: { x, y, z, t, dash: [x0, z0, x1, z1] } */
Sc.trigger = function (k, at) { const p = P(), fwd = [Math.sin(p.face), Math.cos(p.face)], ax = at ? at[0] : p.x + fwd[0] * 4, az = at ? at[1] : p.z + fwd[1] * 4, y = p.y;
  if (k === 'mummy') { lurch(ax, az); return; }
  if (k === 'bats') { batSwarm(ax, y, az); for (let i = 0; i < 4; i++) setTimeout(() => G.FX && G.FX.burst(ax, y + 1.6, az, 14, { c: [0.06, 0.05, 0.05], sp: 7, up: 0.4, size: 0.28, a: 1, g: 0, life: 0.9, spread: 1.2 }), i * 70);
    sfx('whoosh', { vol: 1, pitch: 0.55 }); setTimeout(() => sfx('whoosh', { vol: 0.9, pitch: 1.6 }), 120); jolt(false, 0.18); setTimeout(() => G.UI.toast('박쥐 떼다!'), 200); }
  else if (k === 'eyes') { EYES.push({ x: ax, y: y + 0.55, z: az, t: 1.6, dash: [ax, az, ax + fwd[1] * 9, az - fwd[0] * 9] }); sfx('bite', { vol: 1, pitch: 0.35 }); setTimeout(() => { sfx('swing', { vol: 1, pitch: 0.6 }); jolt(true, 0.2); }, 900);
    setTimeout(() => G.UI.toast(rnd(['…들개였나 봐요. 휴.', '방금 그거… 뭐였지?', '어둠 속으로 사라졌어요…'])), 2300); }
  else if (k === 'rocks') { for (let i = 0; i < 6; i++) setTimeout(() => { if (G.FX) G.FX.burst(ax + (Math.random() - 0.5) * 3, y + 4, az + (Math.random() - 0.5) * 3, 8, { c: [0.45, 0.38, 0.3], sp: 1.5, up: -3, size: 0.4, a: 1, g: 12, life: 1.1 }); sfx('hit', { vol: 1, pitch: 0.25 + Math.random() * 0.15 }); }, i * 110);
    jolt(false, 0.22); setTimeout(() => G.UI.toast('쿠르릉! 돌이 무너졌어요…'), 400); }
  else if (k === 'gust') { Sc.dark = 1.8; sfx('whoosh', { vol: 1, pitch: 0.35 }); jolt(false, 0.08); setTimeout(() => G.UI.toast(Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0 ? '바람에 횃불이… 꺼질 뻔했어요!' : '찬 바람이 훅 불어왔어요…'), 300); }
  else if (k === 'splash') { if (G.FX) G.FX.burst(ax, y + 0.2, az, 30, { c: [0.6, 0.75, 0.9], sp: 3, up: 5, size: 0.22, a: 0.9, g: 9, life: 1.2 }); sfx('splash', { vol: 1, pitch: 0.55 }); jolt(false, 0.16); setTimeout(() => G.UI.toast('…커다란 메기였어요!'), 900); }
  else if (k === 'whisper') { sfx('whoosh', { vol: 0.6, pitch: 0.3 }); setTimeout(() => { G.UI.toast('「…돌아가라…」'); sfx('whoosh', { vol: 0.8, pitch: 0.25 }); }, 700); setTimeout(() => { jolt(true, 0.12); sfx('hit', { vol: 0.7, pitch: 0.4 }); }, 1700); setTimeout(() => G.UI.toast('…내 발소리 메아리였나?'), 3000); } };
Sc.darkK = () => Sc.dark > 0 ? Math.max(0.06, 1 - Math.min(1, Sc.dark) * 0.95) : 1;
let eyeMesh = null; const EM = [G.m4(), G.m4()], WM = G.m4();
Sc.draw = function (list, t) { if (BATS.length) { if (!batMesh) { const g = new G.GB(152); g.sph(0.09, 6, 4, { at: [0, 0, 0], s: [0.8, 0.7, 1.4], c: 0x141014 }); for (const s of [1, -1]) g.box(0.34, 0.012, 0.2, { at: [s * 0.2, 0.02, 0], rz: s * 0.28, c: 0x1a1418 }); batMesh = G.R.mesh(g); } BATS.forEach((b, i) => { const m = BM[i] || (BM[i] = G.m4()), fl = 0.5 + Math.abs(Math.sin(t * 26 + b.ph)) * 0.7; G.m4trs(m, b.x, b.y, b.z, Math.atan2(b.vx, b.vz), 0, 0, fl * 1.5, 1.5, 1.5); list.push({ mesh: batMesh, m }); }); }
  if (!EYES.length) return; if (!eyeMesh) { const g = new G.GB(151); g.sph(0.06, 6, 5, { at: [0, 0, 0], c: 0xffe060 }); eyeMesh = G.R.mesh(g); }
  for (const e of EYES) { if (e.t > 0.7) { const p = P(), a = Math.atan2(p.x - e.x, p.z - e.z), cx = Math.cos(a), sz = -Math.sin(a); [-1, 1].forEach((s2, i) => { G.m4trs(EM[i], e.x + cx * 0.12 * s2, e.y, e.z + sz * 0.12 * s2, 0, 0, 0, 1, 1, 1); list.push({ mesh: eyeMesh, m: EM[i], emis: [2.2, 1.6, 0.3] }); }); } } };
Sc.drawSkinned = function (list, t) { for (const L of LURK) { if (!L.rig) { L.rig = new G.Rig(G.HB); L.M = G.m4(); L.st = { phase: 0, face: L.f, speed: 0, act: 'beg', actT: 0.5, idle: 1 }; } L.st.actT = 0.5; G.animHuman(L.rig, L.st, t); L.rig.update(G.m4trs(L.M, L.x, L.y, L.z, L.f, 0, 0, 1.08, 1.08, 1.08)); list.push({ mesh: Game.lookMesh(MUM.look), bones: L.rig.bones, outline: true }); }
  for (const e of EYES) { if (e.t > 0.7 || e.t <= 0) continue; if (!wolf) wolf = new G.Rig(G.AB.wolf); const u = 1 - e.t / 0.7, x = e.dash[0] + (e.dash[2] - e.dash[0]) * u, z = e.dash[1] + (e.dash[3] - e.dash[1]) * u;
    G.animAnimal(wolf, { speed: 9, phase: t * 9 }, t); wolf.update(G.m4trs(WM, x, e.y - 0.55, z, Math.atan2(e.dash[2] - e.dash[0], e.dash[3] - e.dash[1]))); list.push({ mesh: Game.animalMesh('wolf', 'plain'), bones: wolf.bones, outline: true }); } };
Sc.tick = function (dt) { for (let i = LURK.length - 1; i >= 0; i--) { const L = LURK[i]; L.t += dt; const u = Math.min(1, Math.max(0, (L.t - 0.5) / 0.22)); if (L.t > 0.5) { L.x += (L.tx - L.x) * u; L.z += (L.tz - L.z) * u; } if (L.t > 1.05) LURK.splice(i, 1); }
  for (let i = BATS.length - 1; i >= 0; i--) { const b = BATS[i]; b.t -= dt; b.x += b.vx * dt; b.y += b.vy * dt + Math.sin(b.ph + b.t * 9) * 0.05; b.z += b.vz * dt; if (b.t <= 0) BATS.splice(i, 1); }
  if (Sc.dark > 0) Sc.dark -= dt; for (let i = EYES.length - 1; i >= 0; i--) { EYES[i].t -= dt; if (EYES[i].t <= 0) EYES.splice(i, 1); } };

// =================================================================== the caves
/* chambers [x, z, r, ceiling]; tunnels [a, b, width]; all in the cave's own coordinates (stage x/z/y) */
const CAVES = [
  { id: 'fox', n: '여우굴', mouth: { x: 96, z: -60, f: -Math.PI / 2 }, st: { x: -150, z: 60, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.5, 4.6], B: [6, 13, 3.8, 4.2], C: [-3, 24, 5, 5], D: [9, 33, 3.4, 4], E: [-6, 38, 3.2, 4] }, TU: [['A', 'B', 2.6], ['B', 'C', 2.4], ['C', 'D', 2.4], ['C', 'E', 2.2]],
    scares: [{ at: [3, 7], r: 2, k: 'bats' }, { at: [-3, 22], r: 3, k: 'eyes', look: [-6, 27] }, { at: [8, 31], r: 2, k: 'mummy', look: [10.5, 34] }],
    braz: [[2.4, 2.2]], cry: [[8.4, 15.4], [-6.6, 22.4]], loot: { at: [-6.6, 40.2], n: '옛 목자의 은 주머니', give: () => { Game.silver(35); Game.give('lapis', 1, true); return '은 35 · 청금석 1'; } } },
  { id: 'jump', n: '끈기의 바위 굴', mouth: { x: -206, z: 128, f: Math.PI / 2 }, st: { x: 60, z: 140, y: 100 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.5, 4.6], B: [0, 22, 11.5, 17] }, TU: [['A', 'B', 3]], jump: true,
    scares: [{ at: [0, 6.5], r: 1.6, k: 'gust' }, { at: [0, 13], r: 2.4, k: 'bats' }],
    braz: [[2.4, 2.4], [-8.6, 15.6], [8.6, 15.6]], cry: [[-9.6, 27], [9.8, 26], [0, 32.6]],
    loot: { top: true, n: '끈기의 항아리', give: () => { const H = S().hero; if (H) H.stamMax = (H.stamMax || 100) + 10; Game.silver(50); Game.give('goldRing', 1, true); if (Game.insight) Game.insight(1, '끈기의 바위 굴'); return '최대 기력 +10 · 은 50 · 옛 금귀고리 · 깨달음 1'; } } },
  { id: 'echo', n: '메아리 굴', mouth: { x: -118, z: 168, f: -Math.PI / 2 }, st: { x: -150, z: -150, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.2, 4.5], B: [-4, 12, 4.2, 5.5], C: [3, 22, 3.6, 4] }, TU: [['A', 'B', 2.6], ['B', 'C', 2.2]], pool: [-6.5, 13.5, 1.8],
    scares: [{ at: [-2, 7], r: 2, k: 'whisper' }, { at: [-4, 12], r: 2.6, k: 'splash', look: [-6.5, 13.5] }, { at: [3, 19], r: 2.2, k: 'mummy', look: [5, 22] }],
    braz: [[2.2, 2.2]], cry: [[5.4, 23.4]], loot: { at: [4.6, 24.6], n: '바위에 새긴 낙서', note: true } },
  { id: 'quarry', n: '옛 채석장 굴', mouth: { x: -200, z: -90, f: Math.PI / 2 }, st: { x: -40, z: -215, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.6, 4.6], B: [-5, 13, 5.5, 6.5], C: [7, 22, 4.5, 5], D: [-8, 29, 4, 4.5], E: [2, 37, 4.2, 5] }, TU: [['A', 'B', 3], ['B', 'C', 2.6], ['B', 'D', 2.6], ['D', 'E', 2.4], ['C', 'E', 2.2]],
    scares: [{ at: [-4, 11], r: 2.6, k: 'rocks' }, { at: [7, 21], r: 2.4, k: 'eyes', look: [9, 25] }, { at: [-6, 27], r: 2, k: 'bats' }, { at: [1, 34], r: 2, k: 'mummy', look: [3, 37] }],
    braz: [[2.4, 2.2], [-8.5, 12]], cry: [[9.8, 22], [-10.6, 30]], blocks: true,
    loot: { at: [3.6, 39.4], n: '채석공의 나무 상자', give: () => { Game.silver(25); Game.give('lapis', 2, true); Game.give('herb', 2, true); return '은 25 · 청금석 2 · 약초 2'; } } },
  { id: 'hidden', n: '잊힌 곳간 굴', mouth: { x: -14, z: 190, f: -Math.PI / 2 }, st: { x: 20, z: 60, y: 104 }, when: s => pieces(s) >= 5,
    CH: { A: [0, 0, 4.4, 4.6], B: [3, 12, 3.2, 4.2], C: [-4, 22, 3.4, 4.4], D: [2, 34, 7.5, 7.5] }, TU: [['A', 'B', 2.4], ['B', 'C', 2.2], ['C', 'D', 2.6]],
    scares: [{ at: [2, 7], r: 1.8, k: 'whisper' }, { at: [3, 12], r: 2.2, k: 'eyes', look: [5, 15] }, { at: [-3, 19], r: 1.8, k: 'gust' }, { at: [-2, 27], r: 2, k: 'mummy', look: [-1, 30] }, { at: [1, 30], r: 2.2, k: 'bats' }],
    braz: [[2.2, 2.2], [-4, 32], [8, 32]], cry: [[6, 38], [-4, 38], [2, 41.5]], granary: true, /* v18.34 the glow stone off the dais */
    loot: { at: [2, 39.4], dy: 0.5, n: '잊힌 곳간의 큰 항아리', give: () => { Game.silver(120); Game.give('goldRing', 2, true); Game.give('lapis', 3, true); Game.give('grain', 5, true); if (Game.insight) Game.insight(2, '잊힌 곳간'); setTimeout(() => G.UI.say([{ n: '', t: '(항아리 안쪽에 오래된 글씨가 새겨져 있어요.)' }, { n: '바위 글씨', t: '「흉년의 일곱 해를 살게 하신 분께 감사하며, 남은 것을 여기 둔다. 다음 굶는 이를 위하여.」' }, { n: '요셉', t: '…아주 오래전에도, 누군가 이렇게 곳간을 지켰구나. 하나님은 그때도 사람을 먹이셨어.' }], () => { }), 900); return '은 120 · 옛 금귀고리 2 · 청금석 3 · 곡식 자루 5 · 깨달음 2'; } } },
];
/* v18.32 a map in five pieces, one at the end of each cave (the echo cave's is behind the scrawl, the sage's cave in the old jar):
   all five show the way to a sixth, hidden cave under the southern dunes */
const PIECE_OF = { sage: '기인의 동굴', fox: '여우굴', jump: '끈기의 바위 굴', echo: '메아리 굴', quarry: '옛 채석장 굴' };
function pieces(s) { return Object.keys((s && s.flags && s.flags.mapP) || {}).length; }
G.Caves_piece = function (id) { const s = S(), m = s.flags.mapP = s.flags.mapP || {}; if (m[id]) return; m[id] = 1; const n = pieces(s); sfx('insight');
  setTimeout(() => { pop(`동굴 지도 조각 ${n}/5`, n >= 5 ? '조각이 다 모였어요! 남쪽 모래 언덕 아래 숨은 굴이 지도에 나타났어요' : `${PIECE_OF[id]}에서 찾았어요 · 메뉴 → 동굴 지도`, 'scroll'); }, 1400); };
/* the jump course: a spiral of stone pillars up the tall chamber (relative to chamber B) — [x, z, size, height] */
function course() { const out = [], B = [0, 22], GAPS = [1.0, 1.3, 0.8, 1.5, 1.1, 1.25, 0.9, 1.6]; let a = -Math.PI / 2 - 0.2, h = 0.7, prev = 0;
  for (let i = 0; i < 20; i++) { const rest = i === 6 || i === 13, sz = rest ? 2.6 : i % 5 === 4 ? 1.1 : 1.55, r = 8.6 - i * 0.16;
    if (i) { const chord = (prev + sz) / 2 + GAPS[i % GAPS.length] + 0.35; a += 2 * Math.asin(Math.min(0.95, chord / (2 * r))); }
    out.push([B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r, sz, h, rest]); prev = sz; h += i % 5 === 4 ? 0.4 : 0.58; }
  const L = out[out.length - 1], ux = B[0] - L[0], uz = B[1] - L[1], ul = Math.hypot(ux, uz), k = (L[2] + 3.0) / 2 + 1.2; out.push([L[0] + ux / ul * k, L[1] + uz / ul * k, 3.0, L[3] + 0.6, true, true]); return out; }
const PILL = course();
const DEF = id => CAVES.find(c => c.id === id);
const cur = () => { const s = S(); return s && s.flags && s.flags.caveIn ? DEF(s.flags.caveIn) : null; };
const Cs = G.Caves = { inside: () => !!cur(), list: CAVES, course: () => PILL }; for (const c of CAVES) if (c.id !== 'hidden' && c.mouth) (EP.places = EP.places || []).push({ n: c.n, x: c.mouth.x, z: c.mouth.z, when: s => c.when(s) }); /* v18.38 on the map */
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
function walkable(c, x, z, sh) { sh = sh || 0; for (const k in c.CH) { const [cx, cz, r] = c.CH[k]; if (Math.hypot(x - cx, z - cz) < r - sh) return true; }
  for (const [a, b, w] of c.TU) { const A = c.CH[a], B = c.CH[b]; if (segD(x, z, A[0], A[1], B[0], B[1]) < w / 2 - sh) return true; } return false; }
const ceilAt = (c, x, z) => { let best = 4.6, bd = 1e9; for (const k in c.CH) { const [cx, cz, r, h] = c.CH[k], d = Math.hypot(x - cx, z - cz) - r; if (d < bd) { bd = d; best = h; } } return best; };
// ------------------------------------------------------------------ building
const STG = {};
/* v18.35 real rock: one roof that curves down into the walls and one uneven floor, both grids over the cave's outline (they used to be stacks of boxes) */
const sdf = (c, x, z) => { let d = -1e9; for (const k in c.CH) { const [cx, cz, r] = c.CH[k]; d = Math.max(d, r - Math.hypot(x - cx, z - cz)); } for (const [a, b, w] of c.TU) { const A = c.CH[a], B = c.CH[b]; d = Math.max(d, w / 2 - segD(x, z, A[0], A[1], B[0], B[1])); } return d; };
const mixC = (a, b, t) => { const R = (a >> 16 & 255) + ((b >> 16 & 255) - (a >> 16 & 255)) * t, Gc = (a >> 8 & 255) + ((b >> 8 & 255) - (a >> 8 & 255)) * t, B = (a & 255) + ((b & 255) - (a & 255)) * t; return (R << 16) | (Gc << 8) | B; };
function caveSkin(g, c, X, Y, Z, x0, x1, z0, z1, rn) { const st = 0.8, nu = Math.ceil((x1 - x0) / st), nv = Math.ceil((z1 - z0) / st), fb = G.fbm, seed = c.id.length * 3.7;
  const P0 = c.id === 'jump' ? [0x4e463e, 0x6e6254] : c.id === 'echo' ? [0x323c3e, 0x566264] : [0x3e3026, 0x6a5644], S0 = c.id === 'echo' ? 0x2c4a46 : 0x7a6a52;
  const grain = (x, y, z) => { const n = fb(x * 0.22 + seed, z * 0.22 - seed, 3), s = Math.sin(y * 2.3 + n * 5) * 0.5 + 0.5; return mixC(mixC(P0[0], P0[1], n), S0, s * s * 0.32); };
  const roofY = (x, z) => { const d = sdf(c, x, z), H = ceilAt(c, x, z), w = Math.min(2.3, H * 0.6); if (d <= -0.5) return -0.7; if (c.hole) { const hd = Math.hypot(x - c.hole[0], z - c.hole[1]); if (hd < c.hole[2] + 1) return H + Math.max(0, 1 - hd / (c.hole[2] + 1)) * 9; } /* the sky window */ const t = d >= w ? 0 : (w - d) / (w + 0.5), k = Math.sqrt(Math.max(0, 1 - t * t)), bump = (fb(x * 0.3 + seed, z * 0.3, 3) - 0.5) * 1.4 * k + (fb(x * 0.9, z * 0.9 + seed, 2) - 0.5) * 0.35; return -0.7 + (H + 0.7 + bump) * k; };
  g.surf((u, v) => { const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * v; return [X + x, Y + roofY(x, z), Z + z]; }, nu, nv, { c: (x, y, z) => grain(x - X, y - Y, z - Z), ds: true, inner: 1 });
  g.surf((u, v) => { const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * v, d = sdf(c, x, z), e = Math.min(1, Math.max(0, d) / 1.6); return [X + x, Y - 0.06 + (fb(x * 0.5 + seed, z * 0.5, 2) - 0.5) * 0.12 + (1 - e) * 0.16, Z + z]; }, nu, nv, { c: (x, y, z) => mixC(P0[0], P0[1], fb((x - X) * 0.35, (z - Z) * 0.35, 3) * 0.7 + 0.05), flip: true });
  /* v18.37 what the dark holds: dripstone at the walls, pale crystals and glowing fungus, old pots and bones, and handprints and hunters painted long ago */
  { const e = new G.GB(190 + c.id.length), T = c.id === 'jump' ? [0x9ae8c8, 0x70c8e0] : c.id === 'echo' ? [0x80d8ff, 0xa0a8ff] : [0xffc890, 0xc8f0a0]; let any = false;
    for (const k in c.CH) { const [cx, cz, r] = c.CH[k], n = Math.ceil(r * 3.4); for (let i = 0; i < n; i++) { const a = rn() * 6.283, nx = Math.cos(a), nz = Math.sin(a), x = cx + nx * (r - 0.25), z = cz + nz * (r - 0.25); if (walkable(c, x, z, 0.35) || sdf(c, x, z) > 0.8) continue; const q = rn(), wx = X + x, wz = Z + z; any = true;
        if (q < 0.34) { const h = 0.5 + rn() * 1.1; g.cyl(0.02, 0.17 + rn() * 0.1, h, 7, { at: [wx, Y + h / 2, wz], c: mixC(P0[1], 0xb8a890, 0.35), j: 0.04 }); g.cyl(0.02, 0.1, h * 0.55, 6, { at: [wx + 0.2, Y + h * 0.27, wz - 0.12], c: mixC(P0[1], 0xb8a890, 0.25), j: 0.04 }); }
        else if (q < 0.6) { for (let m = 0; m < 4; m++) { const b = rn() * 6.283, h = 0.22 + rn() * 0.5; e.cyl(0.012, 0.06 + rn() * 0.03, h, 5, { at: [wx + Math.cos(b) * 0.14, Y + h / 2 - 0.02, wz + Math.sin(b) * 0.14], rz: Math.cos(b) * 0.3, rx: Math.sin(b) * 0.3, c: T[m % 2], j: 0 }); } }
        else if (q < 0.82) { for (let m = 0; m < 5; m++) { const b = rn() * 6.283, d = rn() * 0.34, s = 0.04 + rn() * 0.05; g.cyl(0.012, 0.016, s * 2, 5, { at: [wx + Math.cos(b) * d, Y + s, wz + Math.sin(b) * d], c: 0xd8d0c0 }); e.sph(s * 1.3, 7, 4, { at: [wx + Math.cos(b) * d, Y + s * 2, wz + Math.sin(b) * d], s: [1, 0.55, 1], c: T[1], j: 0 }); } }
        else if (q < 0.92) { g.lathe([[0.08, 0], [0.17, 0.1], [0.19, 0.26], [0.1, 0.38], [0.12, 0.42]], 9, { at: [wx, Y - 0.02, wz], rz: (rn() - 0.5) * 0.5, c: 0x7a5236, j: 0.05 }); }
        else { for (let m = 0; m < 3; m++) g.cyl(0.018, 0.022, 0.38, 5, { at: [wx + (rn() - 0.5) * 0.3, Y + 0.03, wz + (rn() - 0.5) * 0.3], rz: Math.PI / 2, ry: rn() * 3, c: 0xcfc4ae }); g.sph(0.09, 7, 5, { at: [wx, Y + 0.08, wz + 0.1], s: [1, 0.85, 1.15], c: 0xd8cdb6 }); } }
      for (let i = 0; i < 3; i++) { const a = rn() * 6.283, nx = Math.cos(a), nz = Math.sin(a), y = 1.1 + rn() * 0.5; let rr = r, x = cx + nx * rr, z = cz + nz * rr; while (rr < r + 2 && roofY(x, z) > y) { rr += 0.05; x = cx + nx * rr; z = cz + nz * rr; } if (rr >= r + 2 || walkable(c, x, z, 0.1)) continue; x -= nx * 0.03; z -= nz * 0.03; const ry = Math.atan2(-nx, -nz), tx = nz, tz = -nx; for (let m = 0; m < 4; m++) { const o = (m - 1.5) * 0.28, cc = [0xa8482e, 0xd8c8a0, 0x7a2e22][m % 3]; g.sph(0.07, 6, 4, { at: [X + x + tx * o, Y + y + (m % 2) * 0.16, Z + z + tz * o], ry, s: [1, 1.3, 0.2], c: cc, j: 0 }); for (let f = 0; f < 4; f++) g.box(0.016, 0.075, 0.012, { at: [X + x + tx * (o + (f - 1.5) * 0.03), Y + y + (m % 2) * 0.16 + 0.12, Z + z + tz * (o + (f - 1.5) * 0.03)], ry, c: cc, j: 0 }); } } }
    if (c.glowM && G.R.free) G.R.free(c.glowM); c.glowM = any ? G.R.mesh(e) : null; c.glowE = c.id === 'echo' ? [0.5, 0.95, 1.3] : c.id === 'jump' ? [0.5, 1.2, 1] : [1.15, 0.95, 0.6]; }
  /* fallen rock along the foot of the walls */
  for (const k in c.CH) { const [cx, cz, r] = c.CH[k], n = Math.ceil(r * 2.2); for (let i = 0; i < n; i++) { const a = rn() * 6.283, rr = r - 0.1 + rn() * 0.5, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr; if (sdf(c, x, z) > 0.9) continue; if (walkable(c, x + Math.cos(a) * -1.1, z + Math.sin(a) * -1.1, -0.2) && walkable(c, x, z, 0.5)) continue; const s = 0.28 + rn() * 0.5; g.sph(s, 7, 5, { at: [X + x, Y + s * 0.3, Z + z], s: [1.2, 0.7, 1], c: mixC(P0[0], P0[1], rn()), j: 0.09 }); } } }
function build(W, c) { const g = new G.GB(160 + c.id.length), { x: X, z: Z, y: Y } = c.st, COL = []; let sd = 31 + c.id.length * 7; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const ROCK = c.id === 'jump' ? [0x5a5048, 0x645a50, 0x4e463e, 0x6a5e52] : c.id === 'echo' ? [0x3e4648, 0x46504e, 0x36403e, 0x4e5654] : [0x4a3c30, 0x56463a, 0x3e3228, 0x5e4c3c];
  const C = o => COL.push(W.addCol(Object.assign({ on: false, y0: Y - 1, y1: Y + 30, cam: true, stage: true }, o)));
  const wall = (x, z, nx, nz) => { const a = Math.atan2(nz, nx) * -1 + 0, tx = -nz, tz = nx, ry = Math.atan2(-tz, tx), H = ceilAt(c, x, z) + 0.6, px = x + nx * 0.7, pz = z + nz * 0.7;
    /* v18.34 the collider is trimmed where its ends poke into a passage (at every tunnel mouth two 1.9 m wall boxes met and sealed the way: Joseph got stuck
       leaving the first chamber). The rock you see is unchanged; only the part you bump into is shorter there. */
    let hw = 0.95; const cr = Math.cos(ry), sr = Math.sin(ry), inX = px - nx * 0.8, inZ = pz - nz * 0.8;
    for (let k = 0; k < 6 && hw > 0.3; k++) { const ex = cr * hw, ez = -sr * hw; if (walkable(c, inX + ex, inZ + ez, 0.2) || walkable(c, inX - ex, inZ - ez, 0.2)) hw -= 0.13; else break; }
    C({ x: X + px, z: Z + pz, w: hw * 2, d: 1.6, a: ry }); };
  for (const k in c.CH) { const [cx, cz, r] = c.CH[k], n = Math.ceil(2 * Math.PI * r / 1.25); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a), x = cx + nx * r, z = cz + nz * r; if (walkable(c, x + nx * 0.6, z + nz * 0.6, 0.15)) continue; wall(x, z, nx, nz); } }
  for (const [a, b, w] of c.TU) { const A = c.CH[a], B = c.CH[b], dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, n = Math.ceil(L / 1.25);
    for (let i = 0; i <= n; i++) for (const s2 of [1, -1]) { const nx = -uz * s2, nz = ux * s2, x = A[0] + ux * L * i / n + nx * w / 2, z = A[1] + uz * L * i / n + nz * w / 2; if (walkable(c, x + nx * 0.6, z + nz * 0.6, 0.15)) continue; wall(x, z, nx, nz); } }
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const k in c.CH) { const [cx, cz, r] = c.CH[k]; x0 = Math.min(x0, cx - r - 3); x1 = Math.max(x1, cx + r + 3); z0 = Math.min(z0, cz - r - 3); z1 = Math.max(z1, cz + r + 3); }
  caveSkin(g, c, X, Y, Z, x0, x1, z0, z1, rn);
  for (let x = Math.floor(x0); x <= x1; x += 3) for (let z = Math.floor(z0); z <= z1; z += 3) { if (!walkable(c, x, z, 0.8) || rn() > 0.34) continue; const ch = ceilAt(c, x, z) * 0.95, L = 0.5 + rn() * 1.3, dx = (rn() - 0.5) * 2, dz = (rn() - 0.5) * 2, rc = 0x6a5a48 + Math.floor(rn() * 6) * 0x010101; g.cyl(0.11 + rn() * 0.08, 0.015, L, 7, { at: [X + x + dx, Y + ch - L / 2, Z + z + dz], c: rc, j: 0.04 }); /* v18.37 points down (cyl takes the top radius first) */ if (rn() < 0.28 && walkable(c, x + dx, z + dz, 1.6)) { const l2 = 0.25 + rn() * 0.5; g.cyl(0.02, 0.13 + rn() * 0.06, l2, 7, { at: [X + x + dx, Y + l2 / 2 - 0.02, Z + z + dz], c: rc, j: 0.04 }); C({ x: X + x + dx, z: Z + z + dz, r: 0.16, y1: Y + l2, cam: false }); /* v18.37 low: jump it, don't walk through it */ } }
  /* v18.35 torch pillars (only a torch can take fire from them; no cooking or resting here) */
  for (const [x, z] of c.braz || []) { g.cyl(0.2, 0.3, 1.5, 9, { at: [X + x, Y + 0.75, Z + z], c: 0x6e6256, j: 0.05 }); g.cyl(0.34, 0.3, 0.1, 9, { at: [X + x, Y + 0.05, Z + z], c: 0x5a5046, j: 0.04 }); g.cyl(0.36, 0.2, 0.26, 10, { at: [X + x, Y + 1.62, Z + z], c: 0x4a3a2a }); g.cyl(0.3, 0.3, 0.04, 10, { at: [X + x, Y + 1.74, Z + z], c: 0x2a1a10 }); C({ x: X + x, z: Z + z, r: 0.4, y1: Y + 1.9 }); }
  if (c.pool) { const [px, pz, pr] = c.pool; g.cyl(pr, pr, 0.06, 18, { at: [X + px, Y + 0.02, Z + pz], c: 0x10283a }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.box(0.6, 0.3, 0.45, { at: [X + px + Math.cos(a) * (pr + 0.2), Y + 0.13, Z + pz + Math.sin(a) * (pr + 0.2)], ry: -a, c: 0x4a4440 }); } C({ x: X + px, z: Z + pz, r: pr + 0.3, y1: Y + 0.6 }); }
  if (c.jump) for (const [x, z, sz, h, rest, top] of PILL) { g.box(sz, h + 0.5, sz, { at: [X + x, Y + (h - 0.5) / 2, Z + z], c: ROCK[Math.floor(rn() * ROCK.length)], j: 0.08 });
    g.box(sz + 0.08, 0.1, sz + 0.08, { at: [X + x, Y + h - 0.03, Z + z], c: rest ? 0x6a8a5a : 0x7a6e5e, j: 0.04 }); if (top) g.box(0.08, h, 0.08, { at: [X + x + sz / 2 + 0.1, Y + h / 2, Z + z], c: 0xa88a5a }); } /* v18.34 the rope reaches the floor */
  if (c.granary) { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 5.6 + (i % 2) * 0.4, x = 2 + Math.cos(a) * r, z = 34 + Math.sin(a) * r; if (z < 29) continue; g.cyl(0.32, 0.22, 1.1, 10, { at: [X + x, Y + 0.55, Z + z], c: i % 3 ? 0xb87a4a : 0xa86a40 }); g.cyl(0.18, 0.3, 0.12, 10, { at: [X + x, Y + 1.15, Z + z], c: 0x8a5a38 }); C({ x: X + x, z: Z + z, r: 0.36, y1: Y + 1.2 }); }
    g.box(2.2, 0.5, 1.4, { at: [X + 2, Y + 0.25, Z + 40], c: 0x8a7a64 }); C({ x: X + 2, z: Z + 40, w: 2.2, d: 1.4, y1: Y + 0.5 }); }
  if (c.blocks) for (const [x, z, w, h, d] of [[-8.6, 15.4, 1.6, 1.0, 1.1], [-7.4, 16.6, 1.2, 0.8, 1.2], [9.4, 19.6, 1.4, 1.2, 1.0], [-10.2, 26.6, 1.3, 0.9, 1.3], [5, 39.6, 1.5, 0.7, 1.1]]) { g.box(w, h, d, { at: [X + x, Y + h / 2, Z + z], ry: rn(), c: 0xb8a888, j: 0.04 }); C({ x: X + x, z: Z + z, r: Math.max(w, d) / 2 + 0.1, y1: Y + h }); }
  if (c.blocks) { g.cyl(0.03, 0.03, 0.9, 5, { at: [X - 3, Y + 0.05, Z + 15], rz: Math.PI / 2, c: 0x8a6a40 }); g.box(0.12, 0.12, 0.25, { at: [X - 2.6, Y + 0.06, Z + 15], c: 0x8a6a40 }); }
  if (c.loot && c.loot.note) { const [lx, lz] = c.loot.at; g.box(1.6, 1.2, 0.3, { at: [X + lx, Y + 0.6, Z + lz + 0.5], c: 0x5a5650 }); }
  let moss = null; if (c.jump) { const m = new G.GB(170); for (const [x, z, sz, h] of PILL) for (const [ex, ez, w, d] of [[0, sz / 2, sz, 0.08], [0, -sz / 2, sz, 0.08], [sz / 2, 0, 0.08, sz], [-sz / 2, 0, 0.08, sz]]) m.box(w, 0.05, d, { at: [X + x + ex, Y + h + 0.03, Z + z + ez], c: 0x9adf8a, j: 0 }); moss = G.R.mesh(m); }
  const statics = [G.R.mesh(g)]; statics[0].outline = true; let roof = null;
  if (!c.jump && W.addRoof) { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, hmin = 1e9; for (const k in c.CH) { const [cx, cz, r, h] = c.CH[k]; x0 = Math.min(x0, cx - r); x1 = Math.max(x1, cx + r); z0 = Math.min(z0, cz - r); z1 = Math.max(z1, cz + r); hmin = Math.min(hmin, h); }
    roof = W.addRoof({ x: X + (x0 + x1) / 2, z: Z + (z0 + z1) / 2, w: x1 - x0 + 2, d: z1 - z0 + 2, y: Y + hmin - 0.4, on: false, k: 'cave' }); } /* v18.34 the camera stays under the rock ceiling (it went into it and the screen turned black) */
  if (c.jump) for (const [x, z, sz, h] of PILL) COL.push(W.addCol({ on: false, x: X + x, z: Z + z, w: sz, d: sz, y0: Y - 1, y1: Y + h - 0.65, cam: true, stage: true })); /* v18.34 pillars stop the camera; their tops stay standable */
  STG[c.id] = { statics, COL, moss, roof }; }
G.CaveSkin = (g, c, X, Y, Z, x0, x1, z0, z1, rn) => caveSkin(g, c, X, Y, Z, x0, x1, z0, z1, rn); G.CaveMouth = (W, c) => buildMouth(W, c);
function buildMouth(W, c) { const { x, z, f } = c.mouth, y = W.heightAt(x, z), ROCK = [0x8a7258, 0x9a8264, 0x7a6450], fx = Math.sin(f), fz = Math.cos(f);
  /* the opening faces direction f (Joseph walks in along -f) ; local +z = outwards */
  W.place((g, M) => { let sd = 5 + c.id.length; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647, fb = G.fbm, seed = c.id.length * 2.3;
    /* v18.35 a hill of rock with a real opening: the mound is carved back around the arch, the tunnel recess goes dark into it, broken stones frame it (the opening used to be a dark box in a stack of boxes) */
    const AW = 1.75, AH = 2.95, inArch = (x, y) => (x / (AW + 0.25)) * (x / (AW + 0.25)) + (y / (AH + 0.25)) * (y / (AH + 0.25)) < 1;
    g.surf((u, v) => { const a = (u - 0.5) * 6.283, b = v * 1.5708, n = fb(Math.cos(a) * 2.1 + seed, Math.sin(a) * 2.1 + v * 2.3, 3) - 0.5, R0 = 1 + n * 0.5; let x = Math.sin(a) * Math.cos(b) * 7.4 * R0, y = Math.sin(b) * 6.2 * (1 + n * 0.35) - 0.3, z = Math.cos(a) * Math.cos(b) * 5.6 * R0 - 4.4; if (z > -3.3 && inArch(x, y)) z = -3.3 - (1 - Math.min(1, Math.abs(x) / AW)) * 0.3; return [x, y, z]; }, 56, 18, { m: M, c: (x, y, z) => mixC(mixC(ROCK[2], ROCK[1], fb(x * 0.3 + seed, y * 0.4 + z * 0.3, 3) * 1.2), 0x6a5a44, Math.max(0, Math.sin(y * 1.7 + x * 0.3)) * 0.28), flip: true, ds: true, inner: 1 });
    g.surf((u, v) => { const a = u * 3.1416, t = v * 3.4, k = 1 - t * 0.09, xx = Math.cos(a) * AW * k, yy = Math.sin(a) * AH * k; return [xx, yy, 0.7 - t]; }, 18, 8, { m: M, c: (x, y, z) => mixC(0x4a3c2e, 0x050403, Math.min(1, Math.max(0, (0.6 - z) / 2.4))), ds: true, inner: 1 });
    g.surf((u, v) => { const a = u * 3.1416, r = v, xx = Math.cos(a) * AW * 0.7 * r, yy = Math.sin(a) * AH * 0.7 * r; return [xx, yy, -2.7]; }, 12, 2, { m: M, c: 0x030302, ds: true });
    for (let i = 0; i < 21; i++) { const a = -0.15 + i / 20 * 3.44, s = 0.2 + rn() * 0.26, rr = 1.12 + rn() * 0.14; g.sph(s, 7, 5, { m: M, at: [Math.cos(a) * AW * rr, Math.max(0.1, Math.sin(a) * AH * rr), 0.45 + rn() * 0.4], s: [1.15, 0.9, 0.95], c: mixC(ROCK[0], ROCK[1], rn()), j: 0.09 }); }
    for (let i = 0; i < 9; i++) { const sx = (i % 2 ? 1 : -1) * (2.6 + rn() * 3), s = 0.2 + rn() * 0.34; g.sph(s, 7, 5, { m: M, at: [sx, s * 0.35, 0.2 + rn() * 1.2], s: [1.2, 0.7, 1], c: mixC(ROCK[2], ROCK[1], rn()), j: 0.1 }); }
    g.cyl(0.05, 0.05, 1.6, 6, { m: M, at: [1.9, 0.8, 0.6], c: 0x5a3a20 }); g.box(0.5, 0.06, 0.2, { m: M, at: [1.9, 1.5, 0.6], c: 0x5a3a20 }); for (let k = 0; k < 3; k++) g.cyl(0.04, 0.04, 0.7, 5, { m: M, at: [1.75 + k * 0.15, 1.6, 0.6], c: 0x8a6a40 }); }, x - fx * 0.0, z - fz * 0.0, { y: y - 0.3, ry: f, col: null });
  W.addCol({ x: x - fx * 4.4, z: z - fz * 4.4, w: 11, d: 7, a: f, y0: y - 2, y1: y + 6, cam: true }); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); for (const k in STG) { if (G.R.free) { STG[k].statics.forEach(m => G.R.free(m)); if (STG[k].moss) G.R.free(STG[k].moss); } delete STG[k]; } /* v18.34 free the old meshes (GPU memory grew with every return to the title) */ for (const c of CAVES) try { buildMouth(W, c); const st = (EP.stations || []).find(q => q.id === 'fM_' + c.id); if (st) W.place('campfire', st.x, st.z, { kind: 'campfire', col: { r: 0.75, h: 0.5 } }); /* v18.34 a real campfire under the flames */ } catch (e) { console.error('caves build', c.id, e); } }; /* v18.30 insides are built on the first visit */
const ensure = c => { if (c && !STG[c.id] && Game.W()) try { build(Game.W(), c); } catch (e) { console.error('caves build', c.id, e); } };
for (const c of CAVES) { (EP.places = EP.places || []).push({ n: c.n, x: c.mouth.x, z: c.mouth.z, when: s => c.when(s) });
  EP.stations.push({ id: 'fM_' + c.id, type: 'fire', x: c.mouth.x + Math.sin(c.mouth.f) * 3 + Math.cos(c.mouth.f) * 2.6, z: c.mouth.z + Math.cos(c.mouth.f) * 3 - Math.sin(c.mouth.f) * 2.6, r: 2.4, on: s => c.when(s) });
  (c.braz || []).forEach(([x, z], i) => EP.stations.push({ id: 'fB_' + c.id + i, type: 'fire', torchOnly: true, x: c.st.x + x, z: c.st.z + z, r: 2.2, on: s => !!(cur() === c) })); }
// ------------------------------------------------------------------ going in and out
const seen = {}; /* scares already played on this visit */
/* v18.34 companions wait at the mouth (they used to come along inside, or stood on the ground far below the stage) and walk with you again when you come out */
const waitAt = (mx, mz) => { const s = S(), p = P(), ids = (p.follow || []).map(n => n.id); s.flags.cvWait = ids; ids.forEach((id, i) => { Game.npcFollow(id, false); Game.npcTo(id, mx + (i % 3) * 0.9 - 0.9, mz + Math.floor(i / 3) * 0.9, 0, false); }); };
const rejoin = () => { const s = S(), ids = s.flags.cvWait || []; s.flags.cvWait = null; ids.forEach(id => Game.npcFollow(id, true)); };
function go(c, inside) { const s = S(), p = P(); if (s.q && s.q.riding) { pop('수레에서 먼저 내려요', '', 'house'); return; }
  G.UI.fade(() => { s.flags.caveIn = inside ? c.id : 0; for (const k in seen) delete seen[k]; sync(true);
    if (inside) { if (G.Vitals && G.Vitals.mark) G.Vitals.mark('cave'); { const { x, z, f } = c.mouth; waitAt(x + Math.sin(f) * 3.2, z + Math.cos(f) * 3.2); } Game.teleport(c.st.x, c.st.z - 1.2, 0); p.y = p.airTop = c.st.y; Game.snapCam && Game.snapCam(); /* v18.34 the camera starts at the cave floor (it rose from the ground 96 m below) */ } else { const { x, z, f } = c.mouth; Game.teleport(x + Math.sin(f) * 5.6, z + Math.cos(f) * 5.6, f); if (Game.CAM) { Game.CAM.yaw = f + Math.PI; Game.CAM.cDist = undefined; } Game.snapCam && Game.snapCam(); rejoin(); } /* v18.35 he used to come out with the camera inside the hill: a black screen */
    sfx('step', { surf: 'stone' }); }, () => { if (inside) { const lit = Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0;
      if (c.jump && !(G.UI.help && G.UI.help('caveJump', c.n, '돌기둥을 점프로 밟고 꼭대기까지 · 점프 버튼을 길게 누르면 높이 뛰어요 · 떨어지면 처음부터지만 다치지 않아요'))) pop(c.n, '돌기둥을 밟고 꼭대기까지!', 'star');
      else if (!c.jump) pop(c.n, lit ? '횃불 빛만큼만 보여요… 조심해요' : '너무 어두워요! 입구에서 횃불을 붙여요', 'star'); } }); }
function torchUp() { const s = S(); s.tools.torch = true; if (Game.hand() !== 'torch') Game.hold('torch'); if (G.Chem) G.Chem.torchT = 150; sfx('fire', { vol: 0.7 }); pop('횃불을 들었어요', '불이 붙어 있어요 · 동굴 안에선 천천히 타요', 'star'); }
Game.CTX.push(function (s) { if (Game.cineOn) return null; const p = P(), c0 = cur(), out = [];
  if (!c0) { for (const c of CAVES) { if (s.flags && s.flags.cave) continue; const { x, z, f } = c.mouth, d = Math.hypot(p.x - x, p.z - z); if (d > 5) continue; if (!c.when(s)) { if (d < 3.2) out.push({ d: d - 0.3, label: c.id === 'hidden' ? `바위로 막혀 있어요 · 동굴 지도 조각 ${pieces(s)}/5` : '아직은 들어갈 수 없는 동굴이에요', disabled: true, x, z, y: 1.6, key: 'cvShut' + c.id }); continue; } /* v18.35 a mouth you can see says why it won't let you in */
      const rx = x + Math.sin(f) * 0.6 + Math.cos(f) * 1.9, rz = z + Math.cos(f) * 0.6 - Math.sin(f) * 1.9, dr = Math.hypot(p.x - rx, p.z - rz);
      if (dr < 1.8 && !(Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0)) out.push({ d: dr - 0.6, label: '횃불 꽂이 · 횃불 들기', x: rx, z: rz, y: 1.6, key: 'cvTorch', use: torchUp });
      if (d < 3.5) out.push({ d: d - 2.4, label: `${c.n}${ro(c.n)} 들어가기`, /* v18.42 from 3.5 m, and ahead of the campfire beside the mouth */ x: x - Math.sin(f) * 1, z: z - Math.cos(f) * 1, y: 1.6, key: 'cvIn' + c.id, use: () => { if (!c.jump && !(Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0)) torchUp(); /* v18.38 the rack is right there: he takes a torch on his way in */ go(c, true); } }); } return out.length ? out : null; }
  const lx = p.x - c0.st.x, lz = p.z - c0.st.z, de = Math.hypot(lx, lz + 1.2); if (de < 2.2 && p.y < c0.st.y + 0.5) out.push({ d: de - 0.5, label: '밖으로 나가기', x: c0.st.x, z: c0.st.z - 2.6, yAbs: c0.st.y + 1.6, key: 'cvOut', use: () => go(c0, false) });
  const L = c0.loot, got = s.flags['cvLoot_' + c0.id]; if (L) { let lp = L.at, ly = c0.st.y; if (L.top) { const T = PILL[PILL.length - 1]; lp = [T[0] - 0.7, T[1]]; ly = c0.st.y + T[3]; } ly += L.dy || 0;
    const d = Math.hypot(lx - lp[0], lz - lp[1]); if (d < 1.8 && Math.abs(p.y - ly) < 1.2) { if (L.note) out.push({ d: d - 0.4, label: '바위 낙서 읽기', x: c0.st.x + lp[0], z: c0.st.z + lp[1], yAbs: ly + 1.3, key: 'cvNote', use: readNote });
      else if (!got) out.push({ d: d - 0.4, label: `${L.n} 열기`, x: c0.st.x + lp[0], z: c0.st.z + lp[1], yAbs: ly + 1.2, key: 'cvLoot', anim: 'pick', dur: 1.2, fn: () => openLoot(c0) }); }
    if (L.top) { const T = PILL[PILL.length - 1], dd = Math.hypot(lx - T[0] - 1.5, lz - T[1]); if (dd < 1.6 && p.y > c0.st.y + T[3] - 0.5) out.push({ d: dd - 0.3, label: '밧줄 타고 내려가기', x: c0.st.x + T[0] + 1.7, z: c0.st.z + T[1], yAbs: ly + 1.4, key: 'cvRope', use: () => G.UI.fade(() => { Game.teleport(c0.st.x + T[0] + 2.8, c0.st.z + T[1], 0); p.y = p.airTop = c0.st.y; }) }); } }
  return out.length ? out : null; });
/* v18.35 집중 in a cave shows the way out, or the end of the quest that brought you here */
/* the way through the chambers: breadth-first along the tunnels from the nearest chamber to the one nearest the goal */
function caveWay(c, tx, tz) { const p = P(), X = c.st.x, Z = c.st.z, lx = p.x - X, lz = p.z - Z, gx = tx - X, gz = tz - Z, near = (x, z) => { let b = null, bd = 1e9; for (const k in c.CH) { const d = Math.hypot(c.CH[k][0] - x, c.CH[k][1] - z) - c.CH[k][2]; if (d < bd) { bd = d; b = k; } } return b; }, s = near(lx, lz), e = near(gx, gz), from = { [s]: null }, q = [s]; while (q.length) { const k = q.shift(); if (k === e) break; for (const [a, b] of c.TU) { const o = a === k ? b : b === k ? a : null; if (o && !(o in from)) { from[o] = k; q.push(o); } } } const pts = [[p.x, p.z]]; const chain = []; for (let k = e; k && k in from; k = from[k]) chain.unshift(k); for (const k of chain.slice(1)) pts.push([X + c.CH[k][0], Z + c.CH[k][1]]); pts.push([tx, tz]); const o = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.5)); for (let j = 0; j < n; j++) o.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]); } o.push(pts[pts.length - 1]); return o; }
G.CaveWay = (tx, tz) => { const c = cur() || (G.Cave && G.Cave.inside && G.Cave.inside() && G.Cave.shape && G.Cave.shape()); return c ? caveWay(c, tx, tz) : null; };
const t0c = Game.target; Game.target = function () { if (G.Cave && G.Cave.inside && G.Cave.inside() && G.Cave.shape) { const k = G.Cave.shape(); return { x: k.st.x, z: k.st.z - 1.2 }; } const c = cur(); if (!c) return t0c.apply(this, arguments); const s = S(), tr = G.Life && G.Life.tracked(s), L = c.loot; let goal = null; if (L && !L.note && !s.flags['cvLoot_' + c.id] && ((tr && tr.q && tr.q.cave === c.id) || (s.flags.mapQuest === c.id))) goal = L.at; if (goal && !L.top) return { x: c.st.x + goal[0], z: c.st.z + goal[1], side: true }; return { x: c.st.x, z: c.st.z - 1.2 }; };
function openLoot(c) { const s = S(); s.flags['cvLoot_' + c.id] = 1; const got = c.loot.give(); sfx('quest'); pop(`${c.loot.n}!`, got, 'coin'); if (PIECE_OF[c.id]) G.Caves_piece(c.id); Game.save && Game.save(true); }
function readNote() { const s = S(), met = !!(s.q && s.q.kMet); G.UI.say([{ n: '', t: '(바위에 무언가 긁어 새겨져 있어요…)' }, { n: '바위 낙서', t: met ? '「여기까지 왔나? 대단하군! 그런데 보물은 없다네. 하하! 메아리가 좋아서 노래 연습하던 곳이야. — 네브세니」' : '「여기엔 아무것도 없다. 겁 많은 자는 돌아가라. …정말 아무것도 없다니까.」' },
  { n: '요셉', t: met ? '(…그 할아버지구나. 아까 그 속삭임도?)' : '(정말 아무것도 없네… 그래도 무사히 와서 다행이야.)' }], () => { if (!s.flags.cvEcho) { s.flags.cvEcho = 1; if (Game.addXP) Game.addXP(10); } G.UI.toast('낙서 아래 돌 틈에 무언가 끼워져 있어요…'); G.Caves_piece('echo'); }); }
// ------------------------------------------------------------------ the floor (and the pillars of the jump course)
const fl0 = EP.floor; EP.floor = function (x, z, s) { const c = cur(); if (c) { const lx = x - c.st.x, lz = z - c.st.z; if (lx > -30 && lx < 30 && lz > -12 && lz < 50 && walkable(c, lx, lz, -1.6)) { let f = c.st.y; /* v18.34 only inside the passages (people on the ground below were lifted up into the cave) */
      if (c.jump) for (const [px, pz, sz, h] of PILL) if (Math.abs(lx - px) < sz / 2 && Math.abs(lz - pz) < sz / 2) f = Math.max(f, c.st.y + h); return f; } } return fl0 ? fl0.apply(this, arguments) : null; };
let modeOn = null; function sync(force) { const c = cur(), id = c ? c.id : null; ensure(c); if (id === modeOn && !force) return; modeOn = id; for (const k in STG) for (const col of STG[k].COL) col.on = k === id;
  EP.noGrass = !!id || !!(G.Cave && G.Cave.inside && G.Cave.inside()) || !!(G.Byblos && G.Byblos.inBy && G.Byblos.inBy()); if (id && G.Weather && G.Weather.set) G.Weather.set('clear', 1);
  for (const k in STG) if (STG[k].roof) STG[k].roof.on = k === id; /* v18.34 the ceiling keeps the camera below it */
  const mm = document.getElementById('mapwrap'); if (mm) mm.style.visibility = id || (G.Cave && G.Cave.inside && G.Cave.inside()) ? 'hidden' : ''; /* v18.34 the minimap showed the ground far below */ }
// ------------------------------------------------------------------ light and drawing
let LGT = 0;
function lightAt(c) { const s = S(), p = P(), lx = p.x - c.st.x, lz = p.z - c.st.z; let L = Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0 ? 1 : 0;
  for (const [x, z] of c.braz || []) L = Math.max(L, 1.1 - Math.hypot(lx - x, lz - z) / (c.jump ? 16 : 8)); if (Math.hypot(lx, lz + 1.2) < 6) L = Math.max(L, 0.8 - Math.hypot(lx, lz + 1.2) / 8); if (c.jump) L = Math.max(L, 0.8);
  return Math.max(0, Math.min(1.1, L)) * Sc.darkK(); }
const md0 = EP.mood; EP.mood = function (s) { const c = cur(); if (c) { const k = LGT; return { mod(e) { const w = [0.36, 0.26, 0.16].map(v => v * k + 0.03); e.skyTop = [0.01, 0.01, 0.012]; e.skyHor = [0.02, 0.015, 0.012]; e.fogCol = [0.02, 0.016, 0.012];
      e.sunCol = [0.2 * k + 0.02, 0.14 * k + 0.02, 0.08 * k + 0.02]; e.skyAmb = w; e.gndAmb = w.map(v => v * 0.55); e.fogDen = 1 / (4 + k * (c.jump ? 26 : 12)); e.cloudCol = [0, 0, 0]; e.night = 1; e.sunDir = [0.3, 0.9, 0.2]; } }; }
  return md0 ? md0.apply(this, arguments) : null; };
const mu0 = EP.music; EP.music = function (s) { if (cur()) return 'j_dread'; /* (always the dread music underground) */ return mu0 ? mu0.apply(this, arguments) : undefined; };
const q0 = EP.quiet; EP.quiet = function (s) { return !!cur() || (q0 ? q0.apply(this, arguments) : false); };
let glow = null, fire = null, pot = null, exitM = null; const GM = [], FM = [G.m4(), G.m4(), G.m4()], PM = G.m4(), XM = G.m4();
const EMPTY = [], MOSSM = G.m4();
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; const t = performance.now() / 1000; Sc.draw(list, t); const c = cur(); if (!c || !STG[c.id]) return; const sc = Game.scene; if (!sc) return;
  sc.terrain = EMPTY; sc.statics = STG[c.id].statics; sc.water = null; sc.pools = null; sc.insts.length = 0;
  if (!glow) { const a = new G.GB(161); for (let i = 0; i < 5; i++) { const ang = i / 5 * 6.28; a.cyl(0.02, 0.11, 0.42 + (i % 3) * 0.14, 5, { at: [Math.cos(ang) * 0.12, 0.2, Math.sin(ang) * 0.12], rz: Math.cos(ang) * 0.35, rx: Math.sin(ang) * 0.35, c: 0x9ae8ff }); } glow = G.R.mesh(a);
    const f = new G.GB(162); f.sph(0.22, 8, 6, { at: [0, 0.1, 0], c: 0xffa030 }); f.cyl(0.03, 0.17, 0.45, 6, { at: [0, 0.32, 0], c: 0xffd070 }); fire = G.R.mesh(f);
    const q = new G.GB(163); q.cyl(0.32, 0.22, 0.6, 12, { at: [0, 0.3, 0], c: 0xb87a4a }); q.cyl(0.2, 0.3, 0.14, 12, { at: [0, 0.66, 0], c: 0xa86a40 }); q.cyl(0.33, 0.33, 0.05, 12, { at: [0, 0.4, 0], c: 0xe8c048 }); pot = G.R.mesh(q); }
  (c.cry || []).forEach(([x, z], i) => { const m = GM[i] || (GM[i] = G.m4()); const y = c.st.y + 0.1; /* v18.34 on the floor (in the jump cave they hung in the air off the wall) */ G.m4trs(m, c.st.x + x, y, c.st.z + z, i * 1.7, 0, 0, 1.3, 1.3, 1.3); const p = 0.55 + Math.sin(t * 1.3 + i) * 0.2; list.push({ mesh: glow, m, emis: [0.25 * p, 0.85 * p, 1.2 * p] }); });
  { /* v18.35 the way out glows with the day (or the night) beyond it: it read as a black wall */ if (!exitM) { const m = new G.GB(165); m.surf((u, v) => { const a = u * 3.1416, r = v; return [Math.cos(a) * 1.5 * r, Math.sin(a) * 2.7 * r, 0]; }, 14, 2, { c: 0xfff4d8, ds: true }); exitM = G.R.mesh(m); } let ez = 0; while (ez > -14 && sdf(c, 0, ez) > 0.25) ez -= 0.4; const hr = Game.hour(), dayK = hr > 6 && hr < 18.5 ? 1 : hr > 4.5 && hr < 20.5 ? 0.45 : 0.14; G.m4trs(XM, c.st.x, c.st.y - 0.05, c.st.z + ez, 0, 0, 0, 1, 1, 1); list.push({ mesh: exitM, m: XM, emis: [1.9 * dayK, 1.75 * dayK, 1.5 * dayK + 0.08] }); }
  (c.braz || []).forEach(([x, z], i) => { const f = 1 + Math.sin(t * 11 + i) * 0.1; G.m4trs(FM[i], c.st.x + x, c.st.y + 1.72, c.st.z + z, t + i, 0, 0, f, f * 1.1, f); list.push({ mesh: fire, m: FM[i], emis: [1.5, 0.75, 0.25] }); });
  if (STG[c.id].moss) list.push({ mesh: STG[c.id].moss, m: MOSSM, emis: [0.25, 0.6, 0.3] }); if (c.glowM) list.push({ mesh: c.glowM, m: MOSSM, emis: c.glowE });
  const L = c.loot; if (L && !L.note && !s.flags['cvLoot_' + c.id]) { let lp = L.at, ly = c.st.y; if (L.top) { const T = PILL[PILL.length - 1]; lp = [T[0] - 0.7, T[1]]; ly = c.st.y + T[3]; } ly += L.dy || 0; G.m4trs(PM, c.st.x + lp[0], ly, c.st.z + lp[1], t * 0.3, 0, 0, 1, 1, 1); list.push({ mesh: pot, m: PM, outline: true, emis: [0.18 + Math.sin(t * 3) * 0.08, 0.12, 0.02] }); } };
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); try { Sc.drawSkinned(list, typeof t === 'number' ? t : performance.now() / 1000); } catch (e) { } };
/* v18.30 the night chill of the desert does not reach down into a cave */
if (G.Vitals && G.Vitals.mark) { const mk0 = G.Vitals.mark; G.Vitals.mark = function (why) { if (why !== 'cave' && anyIn()) return; return mk0.apply(this, arguments); }; } /* v18.34 the safe spot is the cave mouth, not the stage high above the map */
const ar0 = EP.aridAt; EP.aridAt = function () { return anyIn() ? 0 : ar0 ? ar0.apply(this, arguments) : 0; };
/* underground, the beasts of the map far below must not find Joseph: none spawn, and those close by go away */
let zonesWrapped = false; const anyIn = () => !!cur() || !!(G.Cave && G.Cave.inside && G.Cave.inside());
function calm() { if (!zonesWrapped && EP.wildZones) { zonesWrapped = true; for (const z of EP.wildZones) { const on0 = z.on; z.on = function () { return !anyIn() && (on0 ? on0.apply(this, arguments) : true); }; } }
  if (!anyIn() || !G.Combat || !G.Combat.wild) return; const p = P(); for (const a of G.Combat.wild()) { if (a.st === 'gone' || a.st === 'dead') continue; const dd = Math.hypot(a.x - p.x, a.z - p.z); if (dd > 90) continue;
    if (a.special) { const k = (95 - dd) / Math.max(1, dd); a.x += (a.x - p.x) * k; a.z += (a.z - p.z) * k; } else a.st = 'gone'; } }
// ------------------------------------------------------------------ every frame: scares, the fall, the torch
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { Sc.tick(d); sync(); calm(); const c = cur(); if (!c && !anyIn() && Game.CAM && Game.CAM.zoom && Math.abs(Game.CAM.zoom - 1) > 0.002) Game.CAM.zoom += (1 - Game.CAM.zoom) * Math.min(1, d * 3); /* v18.34 back to the normal distance outside (it stayed close after a cave) */ if (!c) return r; const p = P(), lx = p.x - c.st.x, lz = p.z - c.st.z;
    if (Math.hypot(lx, lz) > 90) { s.flags.caveIn = 0; rejoin(); return r; } /* (v18.34 woke up outside: the companions come again) */
    if (p.y < c.st.y - 3) { p.y = c.st.y; p.vy = 0; }
    LGT += (lightAt(c) - LGT) * Math.min(1, d * 3);
    if (G.Chem && G.Chem.torchT > 0) G.Chem.torchT += d * 0.6;
    if (Game.CAM) Game.CAM.zoom = (Game.CAM.zoom || 1) + ((c.jump ? 1.05 : 0.74) - (Game.CAM.zoom || 1)) * Math.min(1, d * 3);
    if (c.jump) { if (!p.grounded) p.airTop = Math.min(p.airTop === undefined ? p.y : p.airTop, p.y + 1.5); /* no hurt from a fall here: you just start again */
      const T = PILL[PILL.length - 1]; if (p.grounded && p.y > c.st.y + T[3] - 0.3 && !s.flags.cvJumpTop) { s.flags.cvJumpTop = 1; sfx('levelup'); pop('꼭대기다!', '끈기로 끝까지 올라왔어요 · 항아리를 열어 봐요', 'star'); }
      if (p.grounded && p.y < c.st.y + 0.2 && (c._hi || 0) > 3) { G.UI.toast(rnd(['으악! 다시 처음부터…', '괜찮아요, 다시 해 봐요!', '끈기, 끈기!'])); } c._hi = p.grounded ? p.y - c.st.y : Math.max(c._hi || 0, p.y - c.st.y); }
    if (!G.UI.busy()) for (const [i, sc] of (c.scares || []).entries()) { const key = c.id + i; if (seen[key]) continue; if (Math.hypot(lx - sc.at[0], lz - sc.at[1]) < sc.r && p.y < c.st.y + 2.5) { seen[key] = 1; Sc.trigger(sc.k, sc.look ? [c.st.x + sc.look[0], c.st.z + sc.look[1]] : null); } }
    if (G.Weather && G.Weather.kind && G.Weather.kind(s) !== 'clear' && G.Weather.set) G.Weather.set('clear', 1); } catch (e) { console.error('caves', e); } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { const r = ol0 ? ol0.apply(this, arguments) : undefined; try { sync(true); const c = cur(); if (c) { P().y = c.st.y; Game.snapCam && Game.snapCam(); if (Game.hand() === 'torch' && G.Chem) G.Chem.torchT = Math.max(G.Chem.torchT, 90); /* v18.34 a torch you saved with is still burning */ } } catch (e) { } return r; };
Cs.go = (id, inside) => go(DEF(id), inside !== false);
Cs.pieces = () => pieces(S());
if (G.UI) (G.UI.extraTabs = G.UI.extraTabs || []).push({ k: 'cavemap', n: '동굴 지도', on: () => pieces(S()) > 0, render(body) { const s = S(), m = s.flags.mapP || {}, n = pieces(s);
  const P5 = [['sage', 'M10 10 L110 10 L100 70 L10 80 Z'], ['fox', 'M110 10 L210 10 L200 60 L100 70 Z'], ['jump', 'M210 10 L310 10 L310 80 L200 60 Z'], ['echo', 'M10 80 L100 70 L150 150 L10 150 Z'], ['quarry', 'M100 70 L200 60 L310 80 L310 150 L150 150 Z']];
  const svg = `<svg viewBox="0 0 320 160" style="width:100%;max-width:420px;display:block;margin:6px auto"><rect width="320" height="160" rx="10" fill="#1a1610"/>${P5.map(([id, d]) => `<path d="${d}" fill="${m[id] ? '#d8c08a' : '#2a241a'}" stroke="#5a4a30" stroke-width="2"/>`).join('')}
    ${n >= 5 ? '<path d="M40 40 C90 30 120 110 170 100 S250 60 270 120" stroke="#8a3a20" stroke-width="3" fill="none" stroke-dasharray="6 5"/><text x="270" y="138" font-size="22" text-anchor="middle" fill="#8a3a20">✕</text>' : ''}</svg>`;
  body.innerHTML = `<div class="sec">동굴 지도 · ${n}/5</div>${svg}<div class="ltNote">${n >= 5 ? '조각이 다 맞춰졌어요! ✕ 표시는 남쪽 모래 언덕 아래예요. 「잊힌 곳간 굴」을 찾아가 보세요.' : '동굴 끝에서 조각을 찾을 수 있어요.'}</div>` + Object.keys(PIECE_OF).map(id => `<div class="card"><div class="t"><b>${PIECE_OF[id]}</b><span>${m[id] ? '찾았어요' : '아직'}</span></div></div>`).join(''); } });
})(window.G);
