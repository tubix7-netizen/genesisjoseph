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
function jolt(red, k) { fx.className = 'on' + (red ? ' red' : ''); setTimeout(() => { fx.className = ''; }, 260); const c = document.querySelector('canvas'); if (c) { c.classList.remove('scShake'); void c.offsetWidth; c.classList.add('scShake'); setTimeout(() => c.classList.remove('scShake'), 700); }
  if (Game.CAM) Game.CAM.punch = (k || 0.14); if (navigator.vibrate && Game.SET.haptic !== 'off') try { navigator.vibrate([60, 40, 90]); } catch (e) { } }
const EYES = []; let wolf = null; /* eyes in the dark: { x, y, z, t, dash: [x0, z0, x1, z1] } */
Sc.trigger = function (k, at) { const p = P(), fwd = [Math.sin(p.face), Math.cos(p.face)], ax = at ? at[0] : p.x + fwd[0] * 4, az = at ? at[1] : p.z + fwd[1] * 4, y = p.y;
  if (k === 'bats') { for (let i = 0; i < 4; i++) setTimeout(() => G.FX && G.FX.burst(ax, y + 1.6, az, 14, { c: [0.06, 0.05, 0.05], sp: 7, up: 0.4, size: 0.28, a: 1, g: 0, life: 0.9, spread: 1.2 }), i * 70);
    sfx('whoosh', { vol: 1, pitch: 0.55 }); setTimeout(() => sfx('whoosh', { vol: 0.9, pitch: 1.6 }), 120); jolt(false, 0.18); setTimeout(() => G.UI.toast('박쥐 떼다!'), 200); }
  else if (k === 'eyes') { EYES.push({ x: ax, y: y + 0.55, z: az, t: 1.6, dash: [ax, az, ax + fwd[1] * 9, az - fwd[0] * 9] }); sfx('bite', { vol: 1, pitch: 0.35 }); setTimeout(() => { sfx('swing', { vol: 1, pitch: 0.6 }); jolt(true, 0.2); }, 900);
    setTimeout(() => G.UI.toast(rnd(['…들개였나 봐요. 휴.', '방금 그거… 뭐였지?', '어둠 속으로 사라졌어요…'])), 2300); }
  else if (k === 'rocks') { for (let i = 0; i < 6; i++) setTimeout(() => { if (G.FX) G.FX.burst(ax + (Math.random() - 0.5) * 3, y + 4, az + (Math.random() - 0.5) * 3, 8, { c: [0.45, 0.38, 0.3], sp: 1.5, up: -3, size: 0.4, a: 1, g: 12, life: 1.1 }); sfx('hit', { vol: 1, pitch: 0.25 + Math.random() * 0.15 }); }, i * 110);
    jolt(false, 0.22); setTimeout(() => G.UI.toast('쿠르릉! 돌이 무너졌어요…'), 400); }
  else if (k === 'gust') { Sc.dark = 1.8; sfx('whoosh', { vol: 1, pitch: 0.35 }); jolt(false, 0.08); setTimeout(() => G.UI.toast('바람에 횃불이… 꺼질 뻔했어요!'), 300); }
  else if (k === 'splash') { if (G.FX) G.FX.burst(ax, y + 0.2, az, 30, { c: [0.6, 0.75, 0.9], sp: 3, up: 5, size: 0.22, a: 0.9, g: 9, life: 1.2 }); sfx('splash', { vol: 1, pitch: 0.55 }); jolt(false, 0.16); setTimeout(() => G.UI.toast('…커다란 메기였어요!'), 900); }
  else if (k === 'whisper') { sfx('whoosh', { vol: 0.6, pitch: 0.3 }); setTimeout(() => { G.UI.toast('「…돌아가라…」'); sfx('whoosh', { vol: 0.8, pitch: 0.25 }); }, 700); setTimeout(() => { jolt(true, 0.12); sfx('hit', { vol: 0.7, pitch: 0.4 }); }, 1700); setTimeout(() => G.UI.toast('…내 발소리 메아리였나?'), 3000); } };
Sc.darkK = () => Sc.dark > 0 ? Math.max(0.06, 1 - Math.min(1, Sc.dark) * 0.95) : 1;
let eyeMesh = null; const EM = [G.m4(), G.m4()], WM = G.m4();
Sc.draw = function (list, t) { if (!EYES.length) return; if (!eyeMesh) { const g = new G.GB(151); g.sph(0.06, 6, 5, { at: [0, 0, 0], c: 0xffe060 }); eyeMesh = G.R.mesh(g); }
  for (const e of EYES) { if (e.t > 0.7) { const p = P(), a = Math.atan2(p.x - e.x, p.z - e.z), cx = Math.cos(a), sz = -Math.sin(a); [-1, 1].forEach((s2, i) => { G.m4trs(EM[i], e.x + cx * 0.12 * s2, e.y, e.z + sz * 0.12 * s2, 0, 0, 0, 1, 1, 1); list.push({ mesh: eyeMesh, m: EM[i], emis: [2.2, 1.6, 0.3] }); }); } } };
Sc.drawSkinned = function (list, t) { for (const e of EYES) { if (e.t > 0.7 || e.t <= 0) continue; if (!wolf) wolf = new G.Rig(G.AB.wolf); const u = 1 - e.t / 0.7, x = e.dash[0] + (e.dash[2] - e.dash[0]) * u, z = e.dash[1] + (e.dash[3] - e.dash[1]) * u;
    G.animAnimal(wolf, { speed: 9, phase: t * 9 }, t); wolf.update(G.m4trs(WM, x, e.y - 0.55, z, Math.atan2(e.dash[2] - e.dash[0], e.dash[3] - e.dash[1]))); list.push({ mesh: Game.animalMesh('wolf', 'plain'), bones: wolf.bones, outline: true }); } };
Sc.tick = function (dt) { if (Sc.dark > 0) Sc.dark -= dt; for (let i = EYES.length - 1; i >= 0; i--) { EYES[i].t -= dt; if (EYES[i].t <= 0) EYES.splice(i, 1); } };

// =================================================================== the caves
/* chambers [x, z, r, ceiling]; tunnels [a, b, width]; all in the cave's own coordinates (stage x/z/y) */
const CAVES = [
  { id: 'fox', n: '여우굴', mouth: { x: 96, z: -60, f: -Math.PI / 2 }, st: { x: -150, z: 60, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.5, 4.6], B: [6, 13, 3.8, 4.2], C: [-3, 24, 5, 5], D: [9, 33, 3.4, 4], E: [-6, 38, 3.2, 4] }, TU: [['A', 'B', 2.6], ['B', 'C', 2.4], ['C', 'D', 2.4], ['C', 'E', 2.2]],
    scares: [{ at: [3, 7], r: 2, k: 'bats' }, { at: [-3, 22], r: 3, k: 'eyes', look: [-6, 27] }, { at: [8, 31], r: 2, k: 'rocks' }],
    braz: [[2.4, 2.2]], cry: [[8.4, 15.4], [-6.6, 22.4]], loot: { at: [-6.6, 40.2], n: '옛 목자의 은 주머니', give: () => { Game.silver(35); Game.give('lapis', 1, true); return '은 35 · 청금석 1'; } } },
  { id: 'jump', n: '끈기의 바위 굴', mouth: { x: -206, z: 128, f: Math.PI / 2 }, st: { x: 60, z: 140, y: 100 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.5, 4.6], B: [0, 22, 11.5, 17] }, TU: [['A', 'B', 3]], jump: true,
    scares: [{ at: [0, 6.5], r: 1.6, k: 'gust' }, { at: [0, 13], r: 2.4, k: 'bats' }],
    braz: [[2.4, 2.4], [-8.6, 15.6], [8.6, 15.6]], cry: [[-9.6, 27], [9.8, 26], [0, 32.6]],
    loot: { top: true, n: '끈기의 항아리', give: () => { const H = S().hero; if (H) H.stamMax = (H.stamMax || 100) + 10; Game.silver(50); Game.give('goldRing', 1, true); if (Game.insight) Game.insight(1, '끈기의 바위 굴'); return '최대 기력 +10 · 은 50 · 옛 금귀고리 · 깨달음 1'; } } },
  { id: 'echo', n: '메아리 굴', mouth: { x: -118, z: 168, f: -Math.PI / 2 }, st: { x: -150, z: -150, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.2, 4.5], B: [-4, 12, 4.2, 5.5], C: [3, 22, 3.6, 4] }, TU: [['A', 'B', 2.6], ['B', 'C', 2.2]], pool: [-6.5, 13.5, 1.8],
    scares: [{ at: [-2, 7], r: 2, k: 'whisper' }, { at: [-4, 12], r: 2.6, k: 'splash', look: [-6.5, 13.5] }],
    braz: [[2.2, 2.2]], cry: [[5.4, 23.4]], loot: { at: [4.6, 24.6], n: '바위에 새긴 낙서', note: true } },
  { id: 'quarry', n: '옛 채석장 굴', mouth: { x: -200, z: -90, f: Math.PI / 2 }, st: { x: -40, z: -215, y: 96 }, when: () => after('c5_patrol'),
    CH: { A: [0, 0, 4.6, 4.6], B: [-5, 13, 5.5, 6.5], C: [7, 22, 4.5, 5], D: [-8, 29, 4, 4.5], E: [2, 37, 4.2, 5] }, TU: [['A', 'B', 3], ['B', 'C', 2.6], ['B', 'D', 2.6], ['D', 'E', 2.4], ['C', 'E', 2.2]],
    scares: [{ at: [-4, 11], r: 2.6, k: 'rocks' }, { at: [7, 21], r: 2.4, k: 'eyes', look: [9, 25] }, { at: [-6, 27], r: 2, k: 'bats' }, { at: [1, 34], r: 2, k: 'gust' }],
    braz: [[2.4, 2.2], [-8.5, 12]], cry: [[9.8, 22], [-10.6, 30]], blocks: true,
    loot: { at: [3.6, 39.4], n: '채석공의 나무 상자', give: () => { Game.silver(25); Game.give('lapis', 2, true); Game.give('herb', 2, true); return '은 25 · 청금석 2 · 약초 2'; } } },
];
/* the jump course: a spiral of stone pillars up the tall chamber (relative to chamber B) — [x, z, size, height] */
function course() { const out = [], B = [0, 22], GAPS = [1.0, 1.3, 0.8, 1.5, 1.1, 1.25, 0.9, 1.6]; let a = -Math.PI / 2 - 0.2, h = 0.7, prev = 0;
  for (let i = 0; i < 20; i++) { const rest = i === 6 || i === 13, sz = rest ? 2.6 : i % 5 === 4 ? 1.1 : 1.55, r = 8.6 - i * 0.16;
    if (i) { const chord = (prev + sz) / 2 + GAPS[i % GAPS.length] + 0.35; a += 2 * Math.asin(Math.min(0.95, chord / (2 * r))); }
    out.push([B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r, sz, h, rest]); prev = sz; h += i % 5 === 4 ? 0.4 : 0.58; }
  const L = out[out.length - 1], ux = B[0] - L[0], uz = B[1] - L[1], ul = Math.hypot(ux, uz), k = (L[2] + 3.0) / 2 + 1.2; out.push([L[0] + ux / ul * k, L[1] + uz / ul * k, 3.0, L[3] + 0.6, true, true]); return out; }
const PILL = course();
const DEF = id => CAVES.find(c => c.id === id);
const cur = () => { const s = S(); return s && s.flags && s.flags.caveIn ? DEF(s.flags.caveIn) : null; };
const Cs = G.Caves = { inside: () => !!cur(), list: CAVES, course: () => PILL };
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
function walkable(c, x, z, sh) { sh = sh || 0; for (const k in c.CH) { const [cx, cz, r] = c.CH[k]; if (Math.hypot(x - cx, z - cz) < r - sh) return true; }
  for (const [a, b, w] of c.TU) { const A = c.CH[a], B = c.CH[b]; if (segD(x, z, A[0], A[1], B[0], B[1]) < w / 2 - sh) return true; } return false; }
const ceilAt = (c, x, z) => { let best = 4.6, bd = 1e9; for (const k in c.CH) { const [cx, cz, r, h] = c.CH[k], d = Math.hypot(x - cx, z - cz) - r; if (d < bd) { bd = d; best = h; } } return best; };
// ------------------------------------------------------------------ building
const STG = {};
function build(W, c) { const g = new G.GB(160 + c.id.length), { x: X, z: Z, y: Y } = c.st, COL = []; let sd = 31 + c.id.length * 7; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const ROCK = c.id === 'jump' ? [0x5a5048, 0x645a50, 0x4e463e, 0x6a5e52] : c.id === 'echo' ? [0x3e4648, 0x46504e, 0x36403e, 0x4e5654] : [0x4a3c30, 0x56463a, 0x3e3228, 0x5e4c3c];
  const C = o => COL.push(W.addCol(Object.assign({ on: false, y0: Y - 1, y1: Y + 30, cam: true }, o)));
  const wall = (x, z, nx, nz) => { const a = Math.atan2(nz, nx) * -1 + 0, tx = -nz, tz = nx, ry = Math.atan2(-tz, tx), H = ceilAt(c, x, z) + 0.6, px = x + nx * 0.7, pz = z + nz * 0.7;
    for (let y0 = 0; y0 < H; y0 += 5.2) { const h = Math.min(5.6, H - y0 + 0.4) + rn() * 0.8; g.box(1.9 + rn() * 0.5, h, 1.5 + rn() * 0.4, { at: [X + px, Y + y0 + h / 2 - 0.3, Z + pz], ry: ry + (rn() - 0.5) * 0.3, rz: (rn() - 0.5) * 0.1, c: ROCK[Math.floor(rn() * ROCK.length)], j: 0.12 }); }
    C({ x: X + px, z: Z + pz, w: 1.9, d: 1.6, a: ry }); };
  for (const k in c.CH) { const [cx, cz, r] = c.CH[k], n = Math.ceil(2 * Math.PI * r / 1.25); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a), x = cx + nx * r, z = cz + nz * r; if (walkable(c, x + nx * 0.6, z + nz * 0.6, 0.15)) continue; wall(x, z, nx, nz); } }
  for (const [a, b, w] of c.TU) { const A = c.CH[a], B = c.CH[b], dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, n = Math.ceil(L / 1.25);
    for (let i = 0; i <= n; i++) for (const s2 of [1, -1]) { const nx = -uz * s2, nz = ux * s2, x = A[0] + ux * L * i / n + nx * w / 2, z = A[1] + uz * L * i / n + nz * w / 2; if (walkable(c, x + nx * 0.6, z + nz * 0.6, 0.15)) continue; wall(x, z, nx, nz); } }
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const k in c.CH) { const [cx, cz, r] = c.CH[k]; x0 = Math.min(x0, cx - r - 3); x1 = Math.max(x1, cx + r + 3); z0 = Math.min(z0, cz - r - 3); z1 = Math.max(z1, cz + r + 3); }
  for (let x = Math.floor(x0); x <= x1; x += 3) for (let z = Math.floor(z0); z <= z1; z += 3) { let any = false; for (const [ox, oz] of [[0, 0], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5], [-1.5, -1.5]]) if (walkable(c, x + ox, z + oz, -1.5)) { any = true; break; } if (!any) continue;
    g.box(3.05, 0.6, 3.05, { at: [X + x, Y - 0.3, Z + z], c: ROCK[Math.abs(x * 7 + z * 3) % ROCK.length], j: 0.06 }); const ch = ceilAt(c, x, z) + Math.sin(x * 0.7 + z * 0.4) * 0.6; g.box(3.05, 1.2, 3.05, { at: [X + x, Y + ch + 0.6, Z + z], c: 0x2a2420, j: 0.1 });
    if (walkable(c, x, z, 0.8) && rn() < 0.3) { const L = 0.5 + rn() * 1.1; g.cyl(0.02, 0.15, L, 6, { at: [X + x + (rn() - 0.5) * 2, Y + ch - L / 2, Z + z + (rn() - 0.5) * 2], c: 0x6a5a48 }); } }
  for (const [x, z] of c.braz || []) { g.cyl(0.36, 0.22, 0.5, 9, { at: [X + x, Y + 0.75, Z + z], c: 0x6a4a2a }); g.cyl(0.06, 0.08, 0.6, 6, { at: [X + x, Y + 0.3, Z + z], c: 0x3a2a1a }); C({ x: X + x, z: Z + z, r: 0.45, y1: Y + 1.2 }); }
  if (c.pool) { const [px, pz, pr] = c.pool; g.cyl(pr, pr, 0.06, 18, { at: [X + px, Y + 0.02, Z + pz], c: 0x10283a }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.box(0.6, 0.3, 0.45, { at: [X + px + Math.cos(a) * (pr + 0.2), Y + 0.13, Z + pz + Math.sin(a) * (pr + 0.2)], ry: -a, c: 0x4a4440 }); } C({ x: X + px, z: Z + pz, r: pr + 0.3, y1: Y + 0.6 }); }
  if (c.jump) for (const [x, z, sz, h, rest, top] of PILL) { g.box(sz, h + 0.5, sz, { at: [X + x, Y + (h - 0.5) / 2, Z + z], c: ROCK[Math.floor(rn() * ROCK.length)], j: 0.08 });
    g.box(sz + 0.08, 0.1, sz + 0.08, { at: [X + x, Y + h - 0.03, Z + z], c: rest ? 0x6a8a5a : 0x7a6e5e, j: 0.04 }); if (top) g.box(0.08, 9, 0.08, { at: [X + x + sz / 2 + 0.1, Y + h - 4.5, Z + z], c: 0xa88a5a }); }
  if (c.blocks) for (const [x, z, w, h, d] of [[-8.6, 15.4, 1.6, 1.0, 1.1], [-7.4, 16.6, 1.2, 0.8, 1.2], [9.4, 19.6, 1.4, 1.2, 1.0], [-10.2, 26.6, 1.3, 0.9, 1.3], [5, 39.6, 1.5, 0.7, 1.1]]) { g.box(w, h, d, { at: [X + x, Y + h / 2, Z + z], ry: rn(), c: 0xb8a888, j: 0.04 }); C({ x: X + x, z: Z + z, r: Math.max(w, d) / 2 + 0.1, y1: Y + h }); }
  if (c.blocks) { g.cyl(0.03, 0.03, 0.9, 5, { at: [X - 3, Y + 0.05, Z + 15], rz: Math.PI / 2, c: 0x8a6a40 }); g.box(0.12, 0.12, 0.25, { at: [X - 2.6, Y + 0.06, Z + 15], c: 0x8a6a40 }); }
  if (c.loot && c.loot.note) { const [lx, lz] = c.loot.at; g.box(1.6, 1.2, 0.3, { at: [X + lx, Y + 0.6, Z + lz + 0.5], c: 0x5a5650 }); }
  let moss = null; if (c.jump) { const m = new G.GB(170); for (const [x, z, sz, h] of PILL) for (const [ex, ez, w, d] of [[0, sz / 2, sz, 0.08], [0, -sz / 2, sz, 0.08], [sz / 2, 0, 0.08, sz], [-sz / 2, 0, 0.08, sz]]) m.box(w, 0.05, d, { at: [X + x + ex, Y + h + 0.03, Z + z + ez], c: 0x9adf8a, j: 0 }); moss = G.R.mesh(m); }
  const statics = [G.R.mesh(g)]; statics[0].outline = true; STG[c.id] = { statics, COL, moss }; }
function buildMouth(W, c) { const { x, z, f } = c.mouth, y = W.heightAt(x, z), ROCK = [0x8a7258, 0x9a8264, 0x7a6450], fx = Math.sin(f), fz = Math.cos(f);
  /* the opening faces direction f (Joseph walks in along -f) ; local +z = outwards */
  W.place((g, M) => { let sd = 5 + c.id.length; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9; i++) { const a = -1.25 + i / 8 * 2.5; g.box(2.4, 3.0 + rn() * 2.4, 2.2, { m: M, at: [Math.sin(a) * 3.2, 1.4, -Math.cos(a) * 1.2 - 1.2], ry: -a, c: ROCK[i % 3], j: 0.12 }); }
    g.box(6.6, 2.2, 3.6, { m: M, at: [0, 4.1, -1.8], c: ROCK[1], j: 0.1 }); g.box(1.3, 2.7, 1.0, { m: M, at: [0, 1.35, -0.6], c: 0x0a0806, j: 0 }); g.box(9, 5.5, 5, { m: M, at: [0, 1.6, -4.2], c: ROCK[0], j: 0.1 });
    g.cyl(0.05, 0.05, 1.6, 6, { m: M, at: [1.9, 0.8, 0.6], c: 0x5a3a20 }); g.box(0.5, 0.06, 0.2, { m: M, at: [1.9, 1.5, 0.6], c: 0x5a3a20 }); for (let k = 0; k < 3; k++) g.cyl(0.04, 0.04, 0.7, 5, { m: M, at: [1.75 + k * 0.15, 1.6, 0.6], c: 0x8a6a40 }); }, x - fx * 0.0, z - fz * 0.0, { y: y - 0.3, ry: f, col: null });
  W.addCol({ x: x - fx * 3.4, z: z - fz * 3.4, w: 9.5, d: 5.5, a: f, y0: y - 2, y1: y + 6, cam: true }); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); for (const c of CAVES) try { buildMouth(W, c); build(W, c); } catch (e) { console.error('caves build', c.id, e); } };
for (const c of CAVES) { (EP.places = EP.places || []).push({ n: c.n, x: c.mouth.x, z: c.mouth.z, when: s => c.when(s) });
  EP.stations.push({ id: 'fM_' + c.id, type: 'fire', x: c.mouth.x + Math.sin(c.mouth.f) * 3 + Math.cos(c.mouth.f) * 2.6, z: c.mouth.z + Math.cos(c.mouth.f) * 3 - Math.sin(c.mouth.f) * 2.6, r: 2.4, on: s => c.when(s) });
  (c.braz || []).forEach(([x, z], i) => EP.stations.push({ id: 'fB_' + c.id + i, type: 'fire', x: c.st.x + x, z: c.st.z + z, r: 2.2, on: s => !!(cur() === c) })); }
// ------------------------------------------------------------------ going in and out
const seen = {}; /* scares already played on this visit */
function go(c, inside) { const s = S(), p = P(); if (s.q && s.q.riding) { pop('수레에서 먼저 내려요', '', 'house'); return; }
  G.UI.fade(() => { s.flags.caveIn = inside ? c.id : 0; for (const k in seen) delete seen[k]; sync(true);
    if (inside) { Game.teleport(c.st.x, c.st.z - 1.2, 0); p.y = p.airTop = c.st.y; } else { const { x, z, f } = c.mouth; Game.teleport(x + Math.sin(f) * 1.6, z + Math.cos(f) * 1.6, f); }
    sfx('step', { surf: 'stone' }); }, () => { if (inside) { const lit = Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0;
      if (c.jump && !(G.UI.help && G.UI.help('caveJump', c.n, '돌기둥을 점프로 밟고 꼭대기까지 · 점프 버튼을 길게 누르면 높이 뛰어요 · 떨어지면 처음부터지만 다치지 않아요'))) pop(c.n, '돌기둥을 밟고 꼭대기까지!', 'star');
      else if (!c.jump) pop(c.n, lit ? '횃불 빛만큼만 보여요… 조심해요' : '너무 어두워요! 입구에서 횃불을 붙여요', 'star'); } }); }
function torchUp() { const s = S(); s.tools.torch = true; if (Game.hand() !== 'torch') Game.hold('torch'); if (G.Chem) G.Chem.torchT = 150; sfx('fire', { vol: 0.7 }); pop('횃불을 들었어요', '불이 붙어 있어요 · 동굴 안에선 천천히 타요', 'star'); }
Game.CTX.push(function (s) { if (Game.cineOn) return null; const p = P(), c0 = cur(), out = [];
  if (!c0) { for (const c of CAVES) { if (!c.when(s) || (s.flags && s.flags.cave)) continue; const { x, z, f } = c.mouth, d = Math.hypot(p.x - x, p.z - z); if (d > 5) continue;
      const rx = x + Math.sin(f) * 0.6 + Math.cos(f) * 1.9, rz = z + Math.cos(f) * 0.6 - Math.sin(f) * 1.9, dr = Math.hypot(p.x - rx, p.z - rz);
      if (dr < 1.8 && !(Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0)) out.push({ d: dr - 0.6, label: '횃불 꽂이 · 횃불 들기', x: rx, z: rz, y: 1.6, key: 'cvTorch', use: torchUp });
      if (d < 2.4) out.push({ d: d - 0.4, label: `${c.n}으로 들어가기`, x: x - Math.sin(f) * 1, z: z - Math.cos(f) * 1, y: 1.6, key: 'cvIn' + c.id, use: () => go(c, true) }); } return out.length ? out : null; }
  const lx = p.x - c0.st.x, lz = p.z - c0.st.z, de = Math.hypot(lx, lz + 1.2); if (de < 2.2 && p.y < c0.st.y + 0.5) out.push({ d: de - 0.5, label: '밖으로 나가기', x: c0.st.x, z: c0.st.z - 2.6, yAbs: c0.st.y + 1.6, key: 'cvOut', use: () => go(c0, false) });
  const L = c0.loot, got = s.flags['cvLoot_' + c0.id]; if (L) { let lp = L.at, ly = c0.st.y; if (L.top) { const T = PILL[PILL.length - 1]; lp = [T[0] - 0.7, T[1]]; ly = c0.st.y + T[3]; }
    const d = Math.hypot(lx - lp[0], lz - lp[1]); if (d < 1.8 && Math.abs(p.y - ly) < 1.2) { if (L.note) out.push({ d: d - 0.4, label: '바위 낙서 읽기', x: c0.st.x + lp[0], z: c0.st.z + lp[1], yAbs: ly + 1.3, key: 'cvNote', use: readNote });
      else if (!got) out.push({ d: d - 0.4, label: `${L.n} 열기`, x: c0.st.x + lp[0], z: c0.st.z + lp[1], yAbs: ly + 1.2, key: 'cvLoot', anim: 'pick', dur: 1.2, fn: () => openLoot(c0) }); }
    if (L.top) { const T = PILL[PILL.length - 1], dd = Math.hypot(lx - T[0] - 1.5, lz - T[1]); if (dd < 1.6 && p.y > c0.st.y + T[3] - 0.5) out.push({ d: dd - 0.3, label: '밧줄 타고 내려가기', x: c0.st.x + T[0] + 1.7, z: c0.st.z + T[1], yAbs: ly + 1.4, key: 'cvRope', use: () => G.UI.fade(() => { Game.teleport(c0.st.x + T[0] + 2.8, c0.st.z + T[1], 0); p.y = p.airTop = c0.st.y; }) }); } }
  return out.length ? out : null; });
function openLoot(c) { const s = S(); s.flags['cvLoot_' + c.id] = 1; const got = c.loot.give(); sfx('quest'); pop(`${c.loot.n}!`, got, 'coin'); Game.save && Game.save(true); }
function readNote() { const s = S(), met = !!(s.q && s.q.kMet); G.UI.say([{ n: '', t: '(바위에 무언가 긁어 새겨져 있어요…)' }, { n: '바위 낙서', t: met ? '「여기까지 왔나? 대단하군! 그런데 보물은 없다네. 하하! 메아리가 좋아서 노래 연습하던 곳이야. — 네브세니」' : '「여기엔 아무것도 없다. 겁 많은 자는 돌아가라. …정말 아무것도 없다니까.」' },
  { n: '요셉', t: met ? '(…그 할아버지구나. 아까 그 속삭임도?)' : '(정말 아무것도 없네… 그래도 무사히 와서 다행이야.)' }], () => { if (!s.flags.cvEcho) { s.flags.cvEcho = 1; if (Game.addXP) Game.addXP(10); } }); }
// ------------------------------------------------------------------ the floor (and the pillars of the jump course)
const fl0 = EP.floor; EP.floor = function (x, z, s) { const c = cur(); if (c) { const lx = x - c.st.x, lz = z - c.st.z; if (lx > -30 && lx < 30 && lz > -12 && lz < 50) { let f = c.st.y;
      if (c.jump) for (const [px, pz, sz, h] of PILL) if (Math.abs(lx - px) < sz / 2 && Math.abs(lz - pz) < sz / 2) f = Math.max(f, c.st.y + h); return f; } } return fl0 ? fl0.apply(this, arguments) : null; };
let modeOn = null; function sync(force) { const c = cur(), id = c ? c.id : null; if (id === modeOn && !force) return; modeOn = id; for (const k in STG) for (const col of STG[k].COL) col.on = k === id;
  EP.noGrass = !!id || !!(G.Cave && G.Cave.inside && G.Cave.inside()) || !!(G.Byblos && G.Byblos.inBy && G.Byblos.inBy()); if (id && G.Weather && G.Weather.set) G.Weather.set('clear', 1); }
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
let glow = null, fire = null, pot = null; const GM = [], FM = [G.m4(), G.m4(), G.m4()], PM = G.m4();
const EMPTY = [], MOSSM = G.m4();
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; const t = performance.now() / 1000; Sc.draw(list, t); const c = cur(); if (!c || !STG[c.id]) return; const sc = Game.scene; if (!sc) return;
  sc.terrain = EMPTY; sc.statics = STG[c.id].statics; sc.water = null; sc.pools = null; sc.insts.length = 0;
  if (!glow) { const a = new G.GB(161); for (let i = 0; i < 5; i++) { const ang = i / 5 * 6.28; a.cyl(0.02, 0.11, 0.42 + (i % 3) * 0.14, 5, { at: [Math.cos(ang) * 0.12, 0.2, Math.sin(ang) * 0.12], rz: Math.cos(ang) * 0.35, rx: Math.sin(ang) * 0.35, c: 0x9ae8ff }); } glow = G.R.mesh(a);
    const f = new G.GB(162); f.sph(0.22, 8, 6, { at: [0, 0.1, 0], c: 0xffa030 }); f.cyl(0.03, 0.17, 0.45, 6, { at: [0, 0.32, 0], c: 0xffd070 }); fire = G.R.mesh(f);
    const q = new G.GB(163); q.cyl(0.32, 0.22, 0.6, 12, { at: [0, 0.3, 0], c: 0xb87a4a }); q.cyl(0.2, 0.3, 0.14, 12, { at: [0, 0.66, 0], c: 0xa86a40 }); q.cyl(0.33, 0.33, 0.05, 12, { at: [0, 0.4, 0], c: 0xe8c048 }); pot = G.R.mesh(q); }
  (c.cry || []).forEach(([x, z], i) => { const m = GM[i] || (GM[i] = G.m4()); const y = c.st.y + (c.jump ? 0.1 + i * 3.5 : 0); G.m4trs(m, c.st.x + x, y, c.st.z + z, i * 1.7, 0, 0, 1.3, 1.3, 1.3); const p = 0.55 + Math.sin(t * 1.3 + i) * 0.2; list.push({ mesh: glow, m, emis: [0.25 * p, 0.85 * p, 1.2 * p] }); });
  (c.braz || []).forEach(([x, z], i) => { const f = 1 + Math.sin(t * 11 + i) * 0.1; G.m4trs(FM[i], c.st.x + x, c.st.y + 1.0, c.st.z + z, t + i, 0, 0, f, f * 1.1, f); list.push({ mesh: fire, m: FM[i], emis: [1.5, 0.75, 0.25] }); });
  if (STG[c.id].moss) list.push({ mesh: STG[c.id].moss, m: MOSSM, emis: [0.25, 0.6, 0.3] });
  const L = c.loot; if (L && !L.note && !s.flags['cvLoot_' + c.id]) { let lp = L.at, ly = c.st.y; if (L.top) { const T = PILL[PILL.length - 1]; lp = [T[0] - 0.7, T[1]]; ly = c.st.y + T[3]; } G.m4trs(PM, c.st.x + lp[0], ly, c.st.z + lp[1], t * 0.3, 0, 0, 1, 1, 1); list.push({ mesh: pot, m: PM, outline: true, emis: [0.18 + Math.sin(t * 3) * 0.08, 0.12, 0.02] }); } };
const sk0 = EP.skinned; EP.skinned = function (list, s, g, t) { if (sk0) sk0.apply(this, arguments); try { Sc.drawSkinned(list, typeof t === 'number' ? t : performance.now() / 1000); } catch (e) { } };
/* underground, the beasts of the map far below must not find Joseph: none spawn, and those close by go away */
let zonesWrapped = false; const anyIn = () => !!cur() || !!(G.Cave && G.Cave.inside && G.Cave.inside());
function calm() { if (!zonesWrapped && EP.wildZones) { zonesWrapped = true; for (const z of EP.wildZones) { const on0 = z.on; z.on = function () { return !anyIn() && (on0 ? on0.apply(this, arguments) : true); }; } }
  if (!anyIn() || !G.Combat || !G.Combat.wild) return; const p = P(); for (const a of G.Combat.wild()) { if (a.st === 'gone' || a.st === 'dead') continue; const dd = Math.hypot(a.x - p.x, a.z - p.z); if (dd > 90) continue;
    if (a.special) { const k = (95 - dd) / Math.max(1, dd); a.x += (a.x - p.x) * k; a.z += (a.z - p.z) * k; } else a.st = 'gone'; } }
// ------------------------------------------------------------------ every frame: scares, the fall, the torch
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { Sc.tick(d); sync(); calm(); const c = cur(); if (!c) return r; const p = P(), lx = p.x - c.st.x, lz = p.z - c.st.z;
    if (Math.hypot(lx, lz) > 90) { s.flags.caveIn = 0; return r; }
    if (p.y < c.st.y - 3) { p.y = c.st.y; p.vy = 0; }
    LGT += (lightAt(c) - LGT) * Math.min(1, d * 3);
    if (G.Chem && G.Chem.torchT > 0) G.Chem.torchT += d * 0.6;
    if (Game.CAM) Game.CAM.zoom = (Game.CAM.zoom || 1) + ((c.jump ? 1.05 : 0.74) - (Game.CAM.zoom || 1)) * Math.min(1, d * 3);
    if (c.jump) { if (!p.grounded) p.airTop = Math.min(p.airTop === undefined ? p.y : p.airTop, p.y + 1.5); /* no hurt from a fall here: you just start again */
      const T = PILL[PILL.length - 1]; if (p.grounded && p.y > c.st.y + T[3] - 0.3 && !s.flags.cvJumpTop) { s.flags.cvJumpTop = 1; sfx('levelup'); pop('꼭대기다!', '끈기로 끝까지 올라왔어요 · 항아리를 열어 봐요', 'star'); }
      if (p.grounded && p.y < c.st.y + 0.2 && (c._hi || 0) > 3) { G.UI.toast(rnd(['으악! 다시 처음부터…', '괜찮아요, 다시 해 봐요!', '끈기, 끈기!'])); } c._hi = p.grounded ? p.y - c.st.y : Math.max(c._hi || 0, p.y - c.st.y); }
    if (!G.UI.busy()) for (const [i, sc] of (c.scares || []).entries()) { const key = c.id + i; if (seen[key]) continue; if (Math.hypot(lx - sc.at[0], lz - sc.at[1]) < sc.r && p.y < c.st.y + 2.5) { seen[key] = 1; Sc.trigger(sc.k, sc.look ? [c.st.x + sc.look[0], c.st.z + sc.look[1]] : null); } }
    if (G.Weather && G.Weather.kind && G.Weather.kind(s) !== 'clear' && G.Weather.set) G.Weather.set('clear', 1); } catch (e) { console.error('caves', e); } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { const r = ol0 ? ol0.apply(this, arguments) : undefined; try { sync(true); const c = cur(); if (c) P().y = c.st.y; } catch (e) { } return r; };
Cs.go = (id, inside) => go(DEF(id), inside !== false);
})(window.G);
