/* 약속의 길 — 서쪽 바위산 동굴과 기인(奇人) 현자 (v18.26 · 자유 여행 IF 이야기)
   성경 이야기가 끝난 뒤(자유 여행), 서쪽 사막 바위산 기슭에 동굴 입구가 열려요. 마을엔 "밤마다 동굴에서 '펑!' 소리와 이상한 빛이 난다"는 소문.
   · 입구의 목동 아이 메리가 횃불을 줘요. 입구 모닥불에 횃불을 붙이고(A키) 들어가요. 동굴 안은 캄캄해서 횃불 빛만큼만 보여요.
     횃불은 동굴 안에서 천천히 타지만 꺼지면 아주 어두워요 — 곳곳의 화로에서 다시 붙여요.
   · 동굴: 입구 굴 → 수정 굴(빛나는 돌) → 지하 샘 굴 → 하늘 창 굴(천장 구멍으로 하늘이 보여요) → 깊은 막다른 굴 → 맨 안쪽 기인의 공방.
   · 기인 현자 네브세니: '생명의 집'(신전의 학당)에서 실험하다 두루마리를 태워 쫓겨난, 남다른 생각을 하는 늙은 학자.
     ① 물시계 만들기(진흙 3 · 갈대 2) ② 동굴 깊은 곳의 빛나는 돌 3개 ③ 별을 재는 막대 메르케트(통나무 1 · 실 2) + 밤에 하늘 창 아래서 별 보기
     ④ 그 뒤로 가끔 실험 재료 부탁. 다 마치면 며칠 뒤 그의 편지가 와요.
   · 실험은 늘 "펑!" 하고 연기가 나요. 그래도 성공이에요… 대개는. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, rnd = a => a[Math.floor(Math.random() * a.length)], sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const free = s => !!(s && s.flags && s.flags.free);
const MOUTH = { x: -201.5, z: 0, f: Math.PI / 2 }; /* stand here, facing west into the hill */
const CX = -60, CZ = 150, CY = 92; /* the stage: high above the dunes, out of sight */
const inCave = () => { const s = S(); return !!(s && s.flags && s.flags.cave); };
const Cv = G.Cave = { inside: inCave };
Object.assign(Game.ITEMS, { crystal: { n: '빛나는 돌', cat: 'good', p: 0, ic: 'stone', c: '#8ad8ff' }, waterclock: { n: '기인의 물시계', cat: 'key', p: 0, ic: 'jar', c: '#c8a070' },
  mirror: { n: '빛 모으는 구리 거울', cat: 'key', p: 0, ic: 'coin', c: '#e8a050' }, starmap: { n: '네브세니의 별 지도', cat: 'key', p: 0, ic: 'scroll', c: '#4a5a9a' } });
// ------------------------------------------------------------------ the cave's shape: chambers (circles) joined by tunnels
const CH = { A: [0, 0, 5.5], B: [2, 15, 5], C: [-12, 26, 6], D: [10, 30, 5], E: [22, 42, 3.6], F: [-2, 45, 8] };
const TU = [['A', 'B', 3.4], ['B', 'C', 3.0], ['B', 'D', 3.0], ['C', 'F', 3.2], ['D', 'F', 3.0], ['D', 'E', 2.7]];
const segD = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L)); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
function walk(x, z, sh) { sh = sh || 0; for (const k in CH) { const [cx, cz, r] = CH[k]; if (Math.hypot(x - cx, z - cz) < r - sh) return true; }
  for (const [a, b, w] of TU) { const A = CH[a], B = CH[b]; if (segD(x, z, A[0], A[1], B[0], B[1]) < w / 2 - sh) return true; } return false; }
const POOL = [-15.5, 29.5, 2.4], SKY = [10, 30.5], EXIT = [0, -3.6];
const CRY = [[-15.2, 22.4], [-8.4, 30.6], [24.2, 43.4]]; /* the three you can take */
const CRYD = [[4.8, 17.6], [-1.8, 13.2], [5.6, 12.4], [12.6, 33.2], [-16.8, 25.6], [20.4, 40.0], [-7.2, 49.6]]; /* glowing on the walls */
const BRAZ = [[2.6, 2.6], [-2.5, 40.5], [-11.6, 21.6]];
const KIIN = [-2, 47.4];
// ------------------------------------------------------------------ building it (at world build)
let STAGE = null; const COLS = [];
function buildCave(W) { const g = new G.GB(141), C = o => { const c = W.addCol(Object.assign({ on: false, y0: CY - 1, y1: CY + 7, cam: true }, o)); COLS.push(c); return c; };
  let sd = 77; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const ROCK = [0x4a3c30, 0x56463a, 0x3e3228, 0x5e4c3c, 0x463a30];
  const wallAt = (x, z, nx, nz) => { const tx = -nz, tz = nx, a = Math.atan2(-tz, tx), h = 4.6 + rn() * 2.2, px = x + nx * 0.7, pz = z + nz * 0.7;
    g.box(1.9 + rn() * 0.5, h, 1.5 + rn() * 0.4, { at: [CX + px, CY + h / 2 - 0.3, CZ + pz], ry: a + (rn() - 0.5) * 0.3, rz: (rn() - 0.5) * 0.12, c: ROCK[Math.floor(rn() * ROCK.length)], j: 0.12 });
    if (rn() < 0.5) g.box(1.0 + rn() * 0.6, 0.6 + rn() * 0.7, 0.9, { at: [CX + x + nx * 0.15, CY + 0.25, CZ + z + nz * 0.15], ry: a + rn(), c: ROCK[Math.floor(rn() * 5)], j: 0.15 });
    C({ x: CX + px, z: CZ + pz, w: 1.9, d: 1.6, a }); };
  for (const k in CH) { const [cx, cz, r] = CH[k], n = Math.ceil(2 * Math.PI * r / 1.25);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, nx = Math.cos(a), nz = Math.sin(a), x = cx + nx * r, z = cz + nz * r; if (walk(x - nx * 0.05 + nx * 0.6, z - nz * 0.05 + nz * 0.6, 0.15)) continue; wallAt(x, z, nx, nz); } }
  for (const [a, b, w] of TU) { const A = CH[a], B = CH[b], dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, n = Math.ceil(L / 1.25);
    for (let i = 0; i <= n; i++) for (const sdn of [1, -1]) { const nx = -uz * sdn, nz = ux * sdn, x = A[0] + ux * L * i / n + nx * w / 2, z = A[1] + uz * L * i / n + nz * w / 2; if (walk(x + nx * 0.6, z + nz * 0.6, 0.15)) continue; wallAt(x, z, nx, nz); } }
  /* floor and ceiling tiles over everything you can walk (the ceiling opens over the sky chamber) */
  for (let x = -20; x <= 30; x += 3) for (let z = -8; z <= 56; z += 3) { let any = false; for (const [ox, oz] of [[0, 0], [1.5, 1.5], [-1.5, 1.5], [1.5, -1.5], [-1.5, -1.5]]) if (walk(x + ox, z + oz, -1.5)) { any = true; break; } if (!any) continue;
    g.box(3.05, 0.6, 3.05, { at: [CX + x, CY - 0.3, CZ + z], c: ROCK[(Math.abs(x * 7 + z * 3)) % 5], j: 0.06 });
    if (Math.hypot(x - SKY[0], z - SKY[1]) < 2.4) continue; const ch = 5.6 + Math.sin(x * 0.7 + z * 0.4) * 0.7; g.box(3.05, 1.2, 3.05, { at: [CX + x, CY + ch + 0.6, CZ + z], c: 0x2e2620, j: 0.1 });
    if (walk(x, z, 0.8) && rn() < 0.35) { const L = 0.6 + rn() * 1.2; g.cyl(0.02, 0.16 + rn() * 0.1, L, 6, { at: [CX + x + (rn() - 0.5) * 2, CY + ch - L / 2, CZ + z + (rn() - 0.5) * 2], c: 0x6a5a48 }); } }
  /* the sky window: a ring of rocks around the hole, and a column of daylight */
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.box(1.4, 1.4, 1.4, { at: [CX + SKY[0] + Math.cos(a) * 2.3, CY + 6.2, CZ + SKY[1] + Math.sin(a) * 2.3], ry: a, c: 0x3a3028 }); }
  /* stalagmites by the walls (solid) */
  for (const [x, z, h] of [[-3.6, 3.4, 1.4], [4.4, -2.6, 1.0], [5.8, 18.2, 1.6], [-16.8, 30.6, 1.2], [14.4, 27.2, 1.3], [-8.6, 41.6, 1.1], [5.2, 49.4, 1.5]]) { g.cyl(0.03, 0.32, h, 7, { at: [CX + x, CY + h / 2, CZ + z], c: 0x7a6a56 }); C({ x: CX + x, z: CZ + z, r: 0.35 }); }
  /* the underground spring behind a low rim */
  g.cyl(POOL[2], POOL[2], 0.06, 20, { at: [CX + POOL[0], CY + 0.02, CZ + POOL[1]], c: 0x14304a }); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.box(0.7, 0.35, 0.5, { at: [CX + POOL[0] + Math.cos(a) * (POOL[2] + 0.2), CY + 0.15, CZ + POOL[1] + Math.sin(a) * (POOL[2] + 0.2)], ry: -a, c: 0x5a4a3a }); }
  C({ x: CX + POOL[0], z: CZ + POOL[1], r: POOL[2] + 0.3 });
  /* the way out: daylight in the mouth */
  /* braziers */
  for (const [x, z] of BRAZ) { g.cyl(0.36, 0.22, 0.5, 9, { at: [CX + x, CY + 0.75, CZ + z], c: 0x6a4a2a }); g.cyl(0.06, 0.08, 0.6, 6, { at: [CX + x, CY + 0.3, CZ + z], c: 0x3a2a1a }); C({ x: CX + x, z: CZ + z, r: 0.45 }); }
  /* the workshop: tables, scroll shelves, jars, a star chart on a board */
  const F = CH.F, T = (w, h, d, x, y, z, c, o) => g.box(w, h, d, Object.assign({ at: [CX + x, CY + y, CZ + z], c }, o || {}));
  T(3.0, 0.1, 1.1, F[0] - 3.2, 0.85, F[1] + 0.6, 0x7a5a38); for (const [lx, lz] of [[-1.3, -0.45], [1.3, -0.45], [-1.3, 0.45], [1.3, 0.45]]) T(0.1, 0.85, 0.1, F[0] - 3.2 + lx, 0.42, F[1] + 0.6 + lz, 0x4a3420);
  C({ x: CX + F[0] - 3.2, z: CZ + F[1] + 0.6, w: 3.1, d: 1.2 });
  T(2.4, 0.1, 1.0, F[0] + 3.4, 0.85, F[1] + 1.2, 0x7a5a38); for (const [lx, lz] of [[-1.0, -0.4], [1.0, -0.4], [-1.0, 0.4], [1.0, 0.4]]) T(0.1, 0.85, 0.1, F[0] + 3.4 + lx, 0.42, F[1] + 1.2 + lz, 0x4a3420);
  C({ x: CX + F[0] + 3.4, z: CZ + F[1] + 1.2, w: 2.5, d: 1.1 });
  for (let i = 0; i < 6; i++) g.cyl(0.07, 0.07, 0.5, 8, { at: [CX + F[0] - 4.2 + i * 0.35, CY + 1.0, CZ + F[1] + 0.4], rz: Math.PI / 2, ry: 0.2 * i, c: 0xe8dcb8 });
  for (let i = 0; i < 5; i++) g.cyl(0.12 + (i % 2) * 0.04, 0.09, 0.32 + (i % 3) * 0.1, 9, { at: [CX + F[0] + 2.6 + i * 0.42, CY + 1.05, CZ + F[1] + 1.2], c: [0xb8764a, 0x8a9a6a, 0x5a6a9a, 0xc8a050, 0x9a4a3a][i] });
  T(0.2, 2.4, 3.2, F[0] - 6.4, 1.2, F[1] + 3.5, 0x5a4230, { ry: 0.5 }); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) g.cyl(0.06, 0.06, 0.4, 6, { at: [CX + F[0] - 6.1 + i * 0.08, CY + 0.6 + r * 0.7, CZ + F[1] + 2.4 + i * 0.4], rx: Math.PI / 2, c: 0xd8c8a0 });
  C({ x: CX + F[0] - 6.3, z: CZ + F[1] + 3.5, w: 0.6, d: 3.4, a: -0.5 });
  T(2.6, 1.8, 0.08, F[0] + 1.2, 1.9, F[1] + 7.2, 0x1a2244); for (let i = 0; i < 24; i++) T(0.06, 0.06, 0.02, F[0] + 0.0 + (i * 37 % 23) / 10, 1.1 + (i * 17 % 15) / 10, F[1] + 7.14, 0xfff0b0, { j: 0 });
  T(3.6, 0.04, 2.6, F[0] - 0.4, 0.03, F[1] + 1.4, 0x8a3a2a, { j: 0 }); /* a woven mat */
  const statics = [G.R.mesh(g)]; statics[0].outline = true; return { statics }; }
/* the mouth in the hillside (part of the real map) */
function buildMouth(W) { const x0 = MOUTH.x - 4.6, z0 = MOUTH.z, y0 = W.heightAt(x0, z0), ROCK = [0x8a7258, 0x9a8264, 0x7a6450];
  W.place((g, M) => { let sd = 11; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9; i++) { const a = -1.25 + i / 8 * 2.5, r = 3.2; g.box(2.4, 3.2 + rn() * 2.5, 2.2, { m: M, at: [Math.sin(a + Math.PI) * -r * 0.3 - 0.6, 1.4, Math.sin(a) * r], ry: a, c: ROCK[i % 3], j: 0.12 }); }
    g.box(3.6, 2.2, 6.6, { m: M, at: [-1.6, 4.2, 0], c: ROCK[1], j: 0.1 }); g.box(1.2, 2.7, 2.6, { m: M, at: [0.2, 1.35, 0], c: 0x0a0806, j: 0 }); /* the dark opening */
    g.box(5, 5, 9, { m: M, at: [-3.4, 1.5, 0], c: ROCK[0], j: 0.1 }); }, x0, z0, { y: y0 - 0.3, col: null });
  W.addCol({ x: x0 - 1.8, z: z0, w: 6, d: 9.5, y0: y0 - 2, y1: y0 + 6, cam: true }); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { buildMouth(W); STAGE = buildCave(W); } catch (e) { console.error('cave build', e); } };
/* a fire by the mouth to light torches at */
EP.stations.push({ id: 'fCave', type: 'fire', x: MOUTH.x + 3.2, z: MOUTH.z + 3.4, r: 2.6, on: s => free(s) });
for (const [i, [x, z]] of BRAZ.entries()) EP.stations.push({ id: 'fCv' + i, type: 'fire', x: CX + x, z: CZ + z, r: 2.2, on: s => inCave() });
(EP.places = EP.places || []).push({ n: '서쪽 바위산 동굴', x: MOUTH.x, z: MOUTH.z, when: s => free(s) });
// ------------------------------------------------------------------ people: the shepherd boy at the mouth, the sage inside
const lookOf = id => { const d = (EP.npcs || []).find(n => n.id === id); return d && d.look; };
const tint = (b, o) => Object.assign({}, b || {}, o);
EP.npcs.push({ id: 'cvBoy', name: '목동 아이 메리', look: tint(lookOf('cy_city0k') || lookOf('benjamin') || lookOf('manasseh'), { top: 0xd8c8a0 }), x: MOUTH.x + 5.6, z: MOUTH.z - 2.4, face: -1.2, scale: 0.62, talkR: 2.4, noBond: true,
  show: s => free(s) && !inCave(), persona: '염소를 치다가 동굴에서 펑 소리를 듣고 겁이 난 아이.' });
EP.npcs.push({ id: 'kiin', name: '기인 현자 네브세니', look: tint(lookOf('sage') || lookOf('magician') || lookOf('ameni'), { top: 0xe8e0d0, trim: 0x6a3a8a, beard: 'long', hair: 0xf0f0f0, age: 'old' }), x: CX + KIIN[0], z: CZ + KIIN[1], face: Math.PI, talkR: 2.8, noBond: true,
  show: s => free(s) && inCave(), persona: '생명의 집에서 쫓겨난 늙은 학자. 별과 물과 빛을 재는 데 미쳐 있다(본인은 "푹 빠졌다"고 한다).' });
const KN = '기인 현자 네브세니';
// ------------------------------------------------------------------ the requests (EP.quests, given by 'kiin')
const done = id => { const s = S(); return !!(s.side && s.side.done && s.side.done[id] !== undefined); };
const puff = () => { const s = S(); const x = CX + CH.F[0] + 3.4, z = CZ + CH.F[1] + 1.2; if (G.FX) for (let i = 0; i < 5; i++) G.FX.burst(x, CY + 1.3, z, 6, { c: [0.6, 0.58, 0.55], sp: 1.2, up: 1.6, size: 0.6, a: 0.7, g: -0.2, life: 1.6 }); sfx('hit', { pitch: 0.5 }); };
Object.assign(EP.quests, {
  k_find: { giver: 'cvBoy', title: '동굴 속의 펑 소리', when: s => free(s),
    offer: s => ['저, 저기요! 저 동굴에서 밤마다 "펑!" 소리가 나고 이상한 빛이 새어 나와요!', '안에 머리 하얀 할아버지가 산대요. 마을 어른들은 "기인(奇人)"이라고 불러요. 생각이 남다른 사람이래요.', Game.S().tools.torch ? '횃불 있으시죠? 저 모닥불에 붙이면 돼요. 안은 진짜 깜깜해요!' : '이 횃불 가져가세요. 저 모닥불에 붙이면 돼요. 안은 진짜 깜깜해요!'],
    obj: [{ t: '횃불을 붙여 들고 동굴 맨 안쪽의 기인 찾아가기', ok: s => !!s.q.kMet }], loc: () => ({ x: MOUTH.x, z: MOUTH.z }),
    start(s) { if (!s.tools.torch) { s.tools.torch = true; G.UI.featCard ? G.UI.featCard('torch', { kick: '새 도구', n: '횃불', ic: 'star', d: '손 단추로 들고, 모닥불·화로 앞에서 A키 「횃불에 불 붙이기」' }) : pop('횃불을 받았어요', '모닥불에서 불을 붙여요', 'star'); } if (Game.hand() !== 'torch') Game.hold('torch'); },
    prog: '횃불 꼭 붙이고 들어가세요! 저는 무서워서 여기 있을게요…', done: ['돌아오셨어요? 그 할아버지 무서운 사람 아니죠?'], reward: { silver: 3 } },
  k_clock: { giver: 'kiin', title: '물시계 만들기', when: s => free(s) && !!s.q.kMet,
    offer: ['밤에도 시간을 알 수 있다면 얼마나 좋겠나! 해시계는 해가 져 버리면 그만이거든.', '그래서 생각했지. 항아리 바닥에 작은 구멍을 내고 물이 일정하게 새게 하면, 남은 물 높이로 시간을 잴 수 있지 않겠나?', '고운 진흙 세 덩이와 곧은 갈대 두 대만 구해 오게. 갈대로 눈금을 새길 거야.'],
    obj: [{ t: s => `진흙 (${Math.min(3, Game.inv('clay'))}/3) · 갈대 (${Math.min(2, Game.inv('reed'))}/2)`, ok: s => Game.have('clay', 3) && Game.have('reed', 2) }], take: { clay: 3, reed: 2 },
    prog: '진흙 셋, 갈대 둘! 나일 강가에 가면 다 있다네.',
    done: ['오오, 이 진흙 결 좀 보게! 자, 반죽하고… 구멍은 머리카락만 하게… 물을 붓고…', { n: '', t: '(펑! 항아리 옆 실험 그릇에서 연기가 솟아요)' }, '콜록콜록! 그건 다른 실험이었고! 보게, 물이 똑, 똑, 일정하게 떨어지지? 성공이야!', '이건 자네 몫일세. 밤에도 시간을 알려 주는 물시계지. 신전 사람들이 보면 깜짝 놀랄 거야. 흠흠.'],
    finish(s) { puff(); s.flags.kClock = 1; }, reward: { silver: 15, items: { waterclock: 1 }, xp: 20 } },
  k_crystal: { giver: 'kiin', title: '동굴 깊은 곳의 빛나는 돌', when: s => free(s) && done('k_clock'),
    offer: ['자네, 이 동굴 벽에서 푸르스름하게 빛나는 돌 봤나? 빛을 머금었다가 내놓는 돌이야. 정말 신기하지!', '그 돌 셋과 반짝이게 간 구리를 맞추면, 해님 빛을 모아 굴 안까지 끌어올 거울을 만들 수 있을 걸세.', '지하 샘 굴 둘레에 둘, 동쪽 맨 끝 막다른 굴에 하나 있을 거야. 박쥐한테 인사도 하고!'],
    obj: [{ t: s => `빛나는 돌 (${Math.min(3, Game.inv('crystal'))}/3) · 지하 샘 굴과 깊은 막다른 굴`, ok: s => Game.have('crystal', 3) }], take: { crystal: 3 },
    prog: '샘 굴 둘레에 둘, 막다른 굴에 하나! 횃불 꺼지지 않게 조심하고.',
    done: ['바로 이거야! 이 돌을 거울 둘레에 박고… 각도는 이렇게…', { n: '', t: '(펑! 이번엔 거울에서 눈부신 빛이 번쩍해요)' }, '보게! 하늘 창의 햇빛이 거울을 타고 공방까지 들어왔어! 이제 등잔 기름을 아끼겠군. 하하하!', '이 작은 거울은 자네 거야. 무덤 속 그림 그리는 장인들도 이렇게 거울로 빛을 들여간다네.'],
    finish(s) { puff(); s.flags.kMirror = 1; }, reward: { silver: 20, items: { mirror: 1 }, xp: 25 } },
  k_star: { giver: 'kiin', title: '하늘을 재는 막대', when: s => free(s) && done('k_crystal'),
    offer: ['마지막으로 가장 큰 실험이야. 나는 별로 나일 강이 불어날 날을 맞히고 싶네.', '해 뜨기 직전 동쪽 하늘에 "소프데트"라는 밝은 별이 처음 다시 보이는 무렵이면 강물이 불기 시작하거든!', '별을 재려면 "메르케트"가 필요해. 곧은 나무 막대에 실로 추를 단 거지. 통나무 하나와 실 두 타래를 가져오게.', '그리고 밤에 하늘 창 굴, 천장 구멍 아래에 서서 별을 봐 주게. 내 눈은 이제 침침해서 말이야.'],
    obj: [{ t: s => `통나무 (${Math.min(1, Game.inv('wood'))}/1) · 실 (${Math.min(2, Game.inv('thread'))}/2)`, ok: s => Game.have('wood', 1) && Game.have('thread', 2) }, { t: '밤에 하늘 창 굴의 천장 구멍 아래서 별 보기', ok: s => !!s.q.kStar }], take: { wood: 1, thread: 2 },
    prog: s => s.q.kStar ? '별을 보았다고? 재료만 가져오면 되네!' : '밤에 하늘 창 아래 서 보게. 이 동굴에서 하늘이 보이는 곳은 거기뿐이야.',
    done: ['자네가 본 별 위치를 이 막대로 재면… 흠, 흠… 이 줄과 저 별이 만나고…', { n: '', t: '(펑! 아무것도 안 했는데 왜 연기가 나는지는 아무도 몰라요)' }, '나왔다! 열두 밤 뒤 새벽에 소프데트가 뜬다! 그러면 곧 강물이 불어나겠지. 아케트, 범람의 계절이 올 거야!', '자네 덕분이야. 이 별 지도를 받게. 그리고… 고맙네. 다들 나를 미친 늙은이라 했는데, 자네는 끝까지 들어 주었어.'],
    finish(s) { puff(); s.flags.kStar = 1; s.flags.kLetterDay = s.day + 2; }, reward: { silver: 40, items: { starmap: 1 }, xp: 40, insight: 1 } },
  k_more1: { giver: 'kiin', title: '기인의 실험 재료 · 석청', repeat: 3, when: s => free(s) && done('k_star'),
    offer: ['자네 왔나! 이번엔 꿀이 상처를 덧나지 않게 하는지 보려고 하네. 석청 한 덩이만!'], obj: [{ t: '석청 1', ok: () => Game.have('honey', 1) }], take: { honey: 1 }, prog: '바위 틈 석청, 벌한테 쏘이지 말고!',
    done: ['(펑!) …꿀은 왜 터졌을까? 아무튼 상처엔 좋더군! 고맙네!'], finish: () => puff(), reward: { silver: 12, items: { herb: 2 } } },
  k_more2: { giver: 'kiin', title: '기인의 실험 재료 · 올리브기름', repeat: 3, when: s => free(s) && done('k_star'),
    offer: ['기름을 물에 띄우면 왜 위로 갈까? 올리브기름 하나만 구해 오게!'], obj: [{ t: '올리브기름 1', ok: () => Game.have('oil', 1) }], take: { oil: 1 }, prog: '기름 한 병이면 충분해!',
    done: ['보게, 기름은 물보다 가벼워서 위로 뜬다네! 이건 (펑!) …불 가까이 두면 안 되는 거였군. 콜록.'], finish: () => puff(), reward: { silver: 12, items: { bread: 2 } } },
  k_more3: { giver: 'kiin', title: '기인의 실험 재료 · 갈대 다발', repeat: 3, when: s => free(s) && done('k_star'),
    offer: ['갈대를 엮어 하늘을 나는 새를 만들어 볼 생각이야! …웃지 말게. 갈대 네 대만!'], obj: [{ t: s => `갈대 (${Math.min(4, Game.inv('reed'))}/4)`, ok: () => Game.have('reed', 4) }], take: { reed: 4 }, prog: '갈대 넷! 곧고 가벼운 걸로!',
    done: ['자, 날아라!… (갈대 새가 툭 떨어져요) …바람이 부족했어. 다음엔 바람이 센 날 해 보세!'], finish: () => puff(), reward: { silver: 10, xp: 8 } },
});
/* meeting the sage for the first time */
const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S(); if (id === 'kiin' && !s.q.kMet) { const n = Game.npc('kiin'), fin = () => { if (n) n.talking = false; };
    G.UI.say([{ n: KN, t: '누, 누구냐! …아니, 횃불을 든 걸 보니 도둑은 아니군. 도둑은 어둠을 좋아하지.' }, { n: KN, t: '나는 네브세니. "생명의 집"에서 글과 별을 가르치던 학자였지. 실험하다 두루마리 몇 개를… 태워 먹고 쫓겨났다네.' },
      { n: KN, t: '사람들은 나를 기인(奇人)이라 부르지. 이상한 사람이라는 뜻이야. 나는 "남다른 생각을 하는 사람"이라는 뜻으로 듣는다네! 흠흠.' }, { n: '요셉', t: '저는 요셉입니다. 바로의 꿈을 풀었던…' },
      { n: KN, t: '알지, 알고말고! 일곱 해 풍년과 일곱 해 흉년! 하늘의 일을 미리 안 사람이라니, 내가 가장 만나고 싶던 사람이야!' }, { n: KN, t: '자네라면 내 실험을 비웃지 않겠지. 도와주겠나? 이 늙은이가 세상을 조금 더 알고 싶어서 말이야.' }],
      () => { fin(); s.q.kMet = 1; if (s.side && s.side.act && s.side.act.k_find) G.Life.complete('k_find'); setTimeout(() => G.Life.talk('kiin'), 300); }); if (n) n.talking = true; return true; }
  if (id === 'cvBoy' && s.q.kMet && !(s.side && s.side.act && s.side.act.k_find)) { G.UI.say([{ n: '목동 아이 메리', t: rnd(['그 할아버지가 저한테도 반짝이는 돌 보여 주셨어요!', '오늘도 펑 소리 났어요. 이번엔 웃음소리도 들렸어요!', '횃불 꺼지면 화로에서 다시 붙이세요!']) }], () => { const n = Game.npc('cvBoy'); if (n) n.talking = false; }); return true; }
  return lt0.apply(this, arguments); };
// ------------------------------------------------------------------ in and out
function go(inside) { const s = S(), p = P(); for (const k in seenS) delete seenS[k]; if (s.q && s.q.riding) { pop('수레에서 먼저 내려요', '', 'house'); return; } if ((p.follow || []).length && inside) { pop('혼자 들어가요', '함께 가는 사람은 입구에서 기다려요', 'house'); }
  G.UI.fade(() => { s.flags.cave = inside ? 1 : 0; sync(true);
    if (inside) { Game.teleport(CX + EXIT[0], CZ + EXIT[1] + 1.2, 0); p.y = p.airTop = CY; } else Game.teleport(MOUTH.x + 1.2, MOUTH.z, Math.PI / 2);
    sfx('step', { surf: 'stone' }); }, () => { if (inside) { const lit = Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0; if (!(G.UI.help && G.UI.help('cave', '서쪽 바위산 동굴', lit ? '횃불 빛만큼만 보여요 · 꺼지면 화로에서 다시 붙여요 · 맨 안쪽에 누군가 있어요' : '너무 어두워요! 입구 모닥불에서 횃불을 붙여 와요')) && !lit) pop('너무 어두워요', '횃불을 붙여 들고 오세요', 'star'); } }); }
Game.CTX.push(function (s) { if (!free(s) || Game.cineOn) return null; const p = P();
  if (!inCave()) { const d = Math.hypot(p.x - MOUTH.x, p.z - MOUTH.z); return d < 2.4 ? [{ d: d - 0.5, label: '동굴로 들어가기', x: MOUTH.x - 2.6, z: MOUTH.z, y: 1.6, key: 'caveIn', use: () => go(true) }] : null; }
  const out = [], lx = p.x - CX, lz = p.z - CZ, de = Math.hypot(lx - EXIT[0], lz - EXIT[1]); if (de < 2.0) out.push({ d: de - 0.5, label: '밖으로 나가기', x: CX + EXIT[0], z: CZ + EXIT[1] - 1, yAbs: CY + 1.6, key: 'caveOut', use: () => go(false) });
  const q = s.side && s.side.act && s.side.act.k_crystal, got = s.q.kCry || (s.q.kCry = {});
  if (q) CRY.forEach(([x, z], i) => { if (got[i]) return; const d = Math.hypot(lx - x, lz - z); if (d < 1.8) out.push({ d: d - 0.4, label: '빛나는 돌 캐기', x: CX + x, z: CZ + z, yAbs: CY + 1, key: 'cry' + i, anim: 'mine', dur: 1.4, fn: () => { got[i] = 1; Game.give('crystal', 1); sfx('pickup', { pitch: 1.4 }); pop('빛나는 돌', `${Object.keys(got).length}/3`, 'star'); } }); });
  return out.length ? out : null; });
/* the floor of the cave; the walls are colliders (on only while inside) */
const fl0 = EP.floor; EP.floor = function (x, z, s) { if (inCave()) { const lx = x - CX, lz = z - CZ; if (lx > -24 && lx < 34 && lz > -12 && lz < 60) return CY; } return fl0 ? fl0.apply(this, arguments) : null; };
let modeOn = null; function sync(force) { const on = inCave(); if (on === modeOn && !force) return; modeOn = on; for (const c of COLS) c.on = on; EP.noGrass = on || !!(G.Byblos && G.Byblos.inBy && G.Byblos.inBy()); if (on && G.Weather && G.Weather.set) G.Weather.set('clear', 1); }
const EMPTY = [];
/* light: the torch, the braziers, the sky window (by day), the mirror (once it is made) */
function lightAt(s) { const p = P(), lx = p.x - CX, lz = p.z - CZ, h = s.time % 24, day = h > 6 && h < 18.5; let L = Game.hand() === 'torch' && G.Chem && G.Chem.torchT > 0 ? 1 : 0;
  for (const [x, z] of BRAZ) L = Math.max(L, 1.1 - Math.hypot(lx - x, lz - z) / 9); if (day) L = Math.max(L, 1.2 - Math.hypot(lx - SKY[0], lz - SKY[1]) / 7);
  if (s.flags.kMirror) L = Math.max(L, 1.15 - Math.hypot(lx - CH.F[0], lz - CH.F[1]) / 11); if (Math.hypot(lx - EXIT[0], lz - EXIT[1]) < 6) L = Math.max(L, 0.8 - Math.hypot(lx - EXIT[0], lz - EXIT[1]) / 8); return Math.max(0, Math.min(1.1, L)); }
let LGT = 0;
const md0 = EP.mood; EP.mood = function (s, g) { if (inCave()) { const k = LGT * (G.Scare ? G.Scare.darkK() : 1); return { mod(e) { const w = [0.36, 0.26, 0.16].map(v => v * k + 0.035), d = 0.04 + k * 0.03;
      e.skyTop = [0.01, 0.01, 0.012]; e.skyHor = [0.02, 0.015, 0.012]; e.fogCol = [0.025, 0.018, 0.012]; e.sunCol = [0.2 * k + 0.02, 0.14 * k + 0.02, 0.08 * k + 0.02]; e.skyAmb = w; e.gndAmb = w.map(v => v * 0.55); e.fogDen = 1 / (4.5 + k * 12); e.cloudCol = [0, 0, 0]; e.night = 1; e.sunDir = [0.3, 0.9, 0.2]; } }; }
  return md0 ? md0.apply(this, arguments) : null; };
const mu0 = EP.music; EP.music = function (s) { if (inCave()) { const p = P(); return 'j_dread'; } return mu0 ? mu0.apply(this, arguments) : undefined; };
const q0 = EP.quiet; EP.quiet = function (s) { return inCave() || (q0 ? q0.apply(this, arguments) : false); };
/* drawing: the cave instead of Egypt while inside; glowing stones, flames, daylight in the sky window */
let potM = null, glow = null, fire = null, shaft = null, mouthLight = null, gadget = null; const GM = [], FM = [G.m4(), G.m4(), G.m4()], SM = G.m4(), XM = G.m4(), KM = [G.m4(), G.m4(), G.m4()];
function meshes() { const a = new G.GB(142); for (let i = 0; i < 5; i++) { const ang = i / 5 * 6.28; a.cyl(0.02, 0.11, 0.42 + (i % 3) * 0.14, 5, { at: [Math.cos(ang) * 0.12, 0.2, Math.sin(ang) * 0.12], rz: Math.cos(ang) * 0.35, rx: Math.sin(ang) * 0.35, c: 0x9ae8ff }); } glow = G.R.mesh(a);
  const f = new G.GB(143); f.sph(0.22, 8, 6, { at: [0, 0.1, 0], c: 0xffa030 }); f.cyl(0.03, 0.17, 0.45, 6, { at: [0, 0.32, 0], c: 0xffd070 }); fire = G.R.mesh(f);
  const sh = new G.GB(144); sh.cyl(1.9, 1.5, 6.2, 14, { at: [0, 3.1, 0], c: 0xfff4d0 }); shaft = G.R.mesh(sh);
  const m = new G.GB(145); m.box(1.3, 2.6, 0.05, { at: [0, 1.3, 0], c: 0xfff0c8 }); mouthLight = G.R.mesh(m);
  const k = new G.GB(146); k.cyl(0.22, 0.14, 0.5, 10, { at: [0, 1.15, 0], c: 0xb87a4a }); k.cyl(0.18, 0.18, 0.06, 10, { at: [0, 0.88, 0], c: 0x8a5a38 }); k.cyl(0.015, 0.015, 0.02 + 0.0, 4, { at: [0, 0.86, 0], c: 0x6ab0e0 });
  k.cyl(0.03, 0.03, 1.0, 6, { at: [0.9, 1.4, 0], c: 0x7a5a38 }); k.cyl(0.004, 0.004, 0.6, 3, { at: [0.98, 1.6, 0], c: 0xf0f0f0 }); k.sph(0.04, 6, 5, { at: [0.98, 1.3, 0], c: 0x6a6a6a });
  k.cyl(0.32, 0.32, 0.03, 16, { at: [-0.9, 1.4, 0], rx: Math.PI / 2, c: 0xe8a050 }); k.cyl(0.03, 0.04, 0.5, 6, { at: [-0.9, 1.1, 0], c: 0x6a4a2a }); gadget = G.R.mesh(k); }
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s || !inCave() || !STAGE) return; const sc = Game.scene; if (!sc) return;
  sc.terrain = EMPTY; sc.statics = STAGE.statics; sc.water = null; sc.pools = null; sc.insts.length = 0; if (!glow) meshes();
  const t = performance.now() / 1000, got = s.q.kCry || {}, act = s.side && s.side.act && s.side.act.k_crystal; let gi = 0;
  const put = (x, z, i, big) => { const m = GM[gi] || (GM[gi] = G.m4()); gi++; G.m4trs(m, CX + x, CY, CZ + z, i * 1.7, 0, 0, big ? 1.6 : 1.1); const p = 0.55 + Math.sin(t * 1.3 + i) * 0.2; list.push({ mesh: glow, m, emis: [0.25 * p, 0.85 * p, 1.2 * p] }); };
  CRYD.forEach(([x, z], i) => put(x, z, i, false)); CRY.forEach(([x, z], i) => { if (!got[i] || !act && !done('k_crystal')) { if (!got[i]) put(x, z, i + 9, true); } });
  BRAZ.forEach(([x, z], i) => { const f = 1 + Math.sin(t * 11 + i) * 0.1; G.m4trs(FM[i], CX + x, CY + 1.0, CZ + z, t + i, 0, 0, f, f * 1.1, f); list.push({ mesh: fire, m: FM[i], emis: [1.5, 0.75, 0.25] }); });
  const h = s.time % 24; if (h > 6 && h < 18.5) { G.m4trs(SM, CX + SKY[0], CY, CZ + SKY[1], 0, 0, 0, 1, 1, 1); list.push({ mesh: shaft, m: SM, emis: [0.55, 0.5, 0.38], tint: [0.4, 0.4, 0.4] }); }
  else { G.m4trs(SM, CX + SKY[0], CY, CZ + SKY[1], 0, 0, 0, 0.6, 1, 0.6); list.push({ mesh: shaft, m: SM, emis: [0.08, 0.1, 0.2], tint: [0.2, 0.2, 0.25] }); }
  G.m4trs(XM, CX + EXIT[0], CY, CZ + EXIT[1] - 1.7, 0, 0, 0, 1.6, 1, 1); list.push({ mesh: mouthLight, m: XM, emis: h > 6 && h < 18.5 ? [1.1, 1.0, 0.8] : [0.12, 0.14, 0.22] });
  if (!s.flags.cvLoot_sage && G.Caves) { const pm = KM[1]; G.m4trs(pm, CX + POT[0], CY, CZ + POT[1], 0.4, 0, 0.2, 0.9, 0.9, 0.9); if (!potM) { const q = new G.GB(147); q.cyl(0.3, 0.2, 0.55, 10, { at: [0, 0.28, 0], c: 0x9a6a40 }); q.cyl(0.18, 0.28, 0.12, 10, { at: [0, 0.6, 0], c: 0x8a5a38 }); potM = G.R.mesh(q); } list.push({ mesh: potM, m: pm, outline: true, emis: [0.12, 0.08, 0.02] }); }
  if (s.flags.kClock || s.flags.kMirror || s.flags.kStar) { G.m4trs(KM[0], CX + CH.F[0] + 3.4, CY, CZ + CH.F[1] + 1.2, 0, 0, 0, 1, 1, 1); list.push({ mesh: gadget, m: KM[0], outline: true, emis: s.flags.kMirror ? [0.25, 0.15, 0.05] : null }); } };
// ------------------------------------------------------------------ every frame
let batT = 0, dripT = 0;
/* v18.27 frights on the way (once per visit) and a forgotten jar in the deep dead end */
const SCARES = [{ at: [1.2, 8.5], r: 2, k: 'bats' }, { at: [-12, 25.5], r: 3, k: 'splash', look: POOL }, { at: [16.6, 36.6], r: 1.8, k: 'eyes', look: [24, 44] }, { at: [6.2, 23], r: 1.6, k: 'gust' }]; const seenS = {};
const POT = [23.4, 39.8];
Game.CTX.push(function (s) { if (!inCave() || s.flags.cvLoot_sage) return null; const p = P(), d = Math.hypot(p.x - CX - POT[0], p.z - CZ - POT[1]); if (d > 1.7) return null;
  return [{ d: d - 0.4, label: '깨진 항아리 뒤지기', x: CX + POT[0], z: CZ + POT[1], yAbs: CY + 1, key: 'cvPotSage', anim: 'pick', dur: 1.2, fn: () => { s.flags.cvLoot_sage = 1; Game.silver(20); Game.give('dates', 3, true); sfx('quest'); pop('깨진 항아리 속에서', '옛 상인의 은 20 · 말라 버린… 아니, 아직 먹을 만한 대추야자 3', 'coin'); } }]; });
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { sync(); if (s.flags.kLetterDay && s.day >= s.flags.kLetterDay && G.Letters) { s.flags.kLetterDay = 0; G.Letters.send(KN, '요셉에게,\n자네 덕분에 내 물시계가 신전에까지 소문이 났다네. 생명의 집에서 다시 와 달라는군! …불은 조심하라는 조건으로.\n별 지도대로 소프데트가 떴네. 곧 강물이 불 걸세. 하늘을 지으신 분이 정하신 때를 우리는 그저 재어 볼 뿐이지.\n언제든 동굴에 들르게. 차는 없지만 펑 소리는 많다네. — 네브세니', ['$', 10], 'kiin'); }
    if (!inCave()) { if (s.flags.cave) s.flags.cave = 0; return r; }
    const p = P(); if (Math.hypot(p.x - CX, p.z - CZ) > 80) { s.flags.cave = 0; return r; } /* carried away by something: you are outside again */
    if (p.y < CY - 3) { p.y = CY; p.vy = 0; }
    LGT += (lightAt(s) - LGT) * Math.min(1, d * 3);
    if (G.Chem && G.Chem.torchT > 0) G.Chem.torchT += d * 0.6; /* (it burns slower in the still air) */
    if (Game.CAM) Game.CAM.zoom = (Game.CAM.zoom || 1) + (0.72 - (Game.CAM.zoom || 1)) * Math.min(1, d * 3);
    const a = s.side && s.side.act && s.side.act.k_star, h = s.time % 24; if (a && !s.q.kStar && (h >= 20 || h < 4.5) && Math.hypot(p.x - CX - SKY[0], p.z - CZ - SKY[1]) < 1.8) { s.q.kStar = 1; sfx('insight'); pop('별을 보았어요', '천장 구멍 너머로 밝은 별 하나가 반짝여요 · 네브세니에게 알려요', 'star'); G.UI.quest && G.UI.quest(); }
    if (G.Scare && !G.UI.busy()) { const lx = p.x - CX, lz = p.z - CZ; SCARES.forEach((sc, i) => { if (seenS[i] || Math.hypot(lx - sc.at[0], lz - sc.at[1]) > sc.r) return; seenS[i] = 1; G.Scare.trigger(sc.k, sc.look ? [CX + sc.look[0], CZ + sc.look[1]] : null); }); }
    if ((batT -= d) <= 0) { batT = 6 + Math.random() * 10; if (G.FX) G.FX.burst(p.x + (Math.random() - 0.5) * 6, CY + 4.5, p.z + 3 + Math.random() * 3, 3, { c: [0.08, 0.06, 0.06], sp: 2.5, up: 0.2, size: 0.18, a: 0.9, g: 0, life: 1.2 }); sfx('whoosh', { vol: 0.15, pitch: 1.8 }); }
    if ((dripT -= d) <= 0) { dripT = 1.5 + Math.random() * 3; sfx('splash', { vol: 0.06, pitch: 2.2 + Math.random() }); }
    if (G.Weather && G.Weather.kind && G.Weather.kind(s) !== 'clear' && G.Weather.set) G.Weather.set('clear', 1); } catch (e) { console.error('cave', e); } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { const r = ol0 ? ol0.apply(this, arguments) : undefined; try { sync(true); const s = S(); if (s && s.flags.cave) { const p = P(); p.y = CY; } } catch (e) { } return r; };
/* torches: Joseph gets one from the boy; the camera light-weights itself in narrow tunnels */
Cv.go = go; Cv.stage = () => ({ x: CX, z: CZ, y: CY }); Cv.mouth = MOUTH;
})(window.G);
