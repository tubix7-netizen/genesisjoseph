
// ------------------------------------------------------------------ ITEMS · MUSIC registered at load
Object.assign(GG.Game.ITEMS, { skin: { n: '물가죽 부대', cat: 'key', p: 0, ic: 'drop', c: '#8a6440' } });
const TRK = { j_theme: [127.0588, 'title'], j_canaan: [68.5714, 'camp'], j_dread: [64, 'night'], j_pit: [71.1111, 'night'], j_mourn: [82.7586, 'night'], j_caravan: [75.7895, 'desert'],
  j_egypt: [65.4545, 'haran'], j_house: [60, 'haran'], j_night: [64, 'night'], j_prison: [77.4194, 'night'], j_hope: [66.6667, 'epilogue'], j_dream: [68.5714, 'dream'],
  j_court: [68.5714, 'festival'], j_triumph: [57.6, 'festival'], j_plenty: [55.3846, 'festival'], j_famine: [71.1111, 'desert'], j_finale: [120, 'epilogue'] };
if (GG.Audio && GG.Audio.addTracks) { const m = {}; for (const k in TRK) m[k] = { url: 'music/' + k + '.mp3', loop: TRK[k][0], gain: 0.9, fallback: TRK[k][1], fadeIn: 2.4, xfade: 2.6 }; GG.Audio.addTracks(m); }

// ------------------------------------------------------------------ MUSIC & MOOD
function music(S, G, hr) {
  const st = S.step, night = hr > 20.6 || hr < 5;
  if (S.q.vision || RT.dreamFx) return 'j_dream';
  if (before(S, 'p_dothan')) return night ? 'j_night' : 'j_canaan';
  if (st === 'p_dothan' || st === 'p_approach') return 'j_dread';
  if (st === 'c1_pit') return 'j_pit';
  if (st === 'c1_caravan') return S.q.night ? 'j_egypt' : night ? 'j_night' : 'j_caravan';
  if (st === 'c1_market') return 'j_egypt';
  if (between(S, 'c2_arrive', 'c2_flee')) { if (st === 'c2_tempt3' || st === 'c2_flee') return 'j_dread'; return night ? 'j_night' : 'j_house'; }
  if (st === 'c3_cell' || st === 'c3_officers' || st === 'c3_wait') return night ? 'j_night' : 'j_prison';
  if (between(S, 'c3_keeper', 'c3_dreams') || st === 'c4_shave') return 'j_hope';
  if (between(S, 'c4_court', 'c4_answer')) return 'j_court';
  if (st === 'c5_patrol') return night ? 'j_night' : G.dist(-22, -74) < 50 ? 'j_triumph' : 'j_egypt';
  if (between(S, 'c5_year1', 'c5_years')) return night ? 'j_night' : 'j_plenty';
  if (between(S, 'c6_open', 'c6_sell')) return 'j_famine';
  return night ? 'j_night' : 'j_egypt';
}
const NEXT_TRACK = { p_wake: 'j_night', p_shechem: 'j_dread', p_approach: 'j_pit', c1_pit: 'j_mourn', c1_caravan: 'j_egypt', c1_market: 'j_house', c2_tempt2: 'j_dread', c2_flee: 'j_prison', c3_keeper: 'j_hope',
  c3_dreams: 'j_dream', c3_wait: 'j_court', c4_vision: 'j_triumph', c5_patrol: 'j_plenty', c5_years: 'j_famine', c6_sell: 'j_finale' };
function mood(S, G) {
  if (S.q.vision) return { mod(e) { e.skyTop = [0.42, 0.3, 0.52]; e.skyHor = [1.0, 0.76, 0.52]; e.fogCol = [0.96, 0.78, 0.6]; e.sunCol = [1.0, 0.86, 0.62]; e.skyAmb = [0.62, 0.52, 0.56]; e.gndAmb = [0.4, 0.3, 0.28]; e.fogDen = 1 / 70; e.cloudCol = [1, 0.8, 0.7]; e.night = 0; } };
  if (RT.dreamFx) return { mod(e) { e.skyTop = [0.08, 0.06, 0.22]; e.skyHor = [0.55, 0.38, 0.5]; e.fogCol = [0.28, 0.2, 0.36]; e.sunCol = [1.0, 0.85, 0.6]; e.skyAmb = [0.5, 0.42, 0.6]; e.gndAmb = [0.25, 0.18, 0.3]; e.night = 1; e.sunDir = [0.2, 0.75, -0.6]; e.fogDen = 1 / 60; e.cloudCol = [0.6, 0.45, 0.7]; } };
  if (LAND === 'famine' && between(S, 'c6_open', 'c6_sell')) return { mod(e) { const k = 1 - (e.night || 0) * 0.7; e.fogCol = e.fogCol.map((v, i) => lerp(v, [0.82, 0.64, 0.44][i], 0.55 * k)); e.skyHor = e.skyHor.map((v, i) => lerp(v, [0.9, 0.72, 0.5][i], 0.5 * k)); e.fogDen = (e.fogDen || 1 / 300) * 1.8; e.sunCol = e.sunCol.map((v, i) => v * [1.04, 0.94, 0.8][i]); } };
  return null;
}

// ------------------------------------------------------------------ RUNTIME UPDATE
const FIELD_N = { pflax: 32, royal: 40 };
function ripe(S, f, crop) { const F = fields.find(x => x.id === f); for (let i = 0; i < F.cols; i++) for (let j = 0; j < F.rows; j++) S.plots[f + ':' + i + ',' + j] = { s: 2, c: crop, st: 3, g: 0, w: 1 }; GG.Game.ENT.plotsDirty = true; }
function ripeLeft(S, f) { let n = 0; for (const k in S.plots) if (k.startsWith(f + ':') && S.plots[k].s === 2) n++; return n; }
{ const en = steps.c2_field.enter; steps.c2_field.enter = function (S, G, re) { if (!re || !S.q.flaxPlanted) { ripe(S, 'pflax', 'flax'); S.q.flaxPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c2_tempt2.enter; steps.c2_tempt2.enter = function (S, G, re) { if (!S.q.flax2Planted) { ripe(S, 'pflax', 'flax'); S.q.flax2Planted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_year2.enter; steps.c5_year2.enter = function (S, G, re) { G.unlock('royal'); if (!S.q.wheatPlanted) { ripe(S, 'royal', 'wheat'); S.q.wheatPlanted = 1; } en.call(this, S, G, re); }; }
{ const en = steps.c5_patrol.enter; steps.c5_patrol.enter = function (S, G, re) { S.q.chariotOk = 1; en.call(this, S, G, re); }; }
const SCENE_ONLY = { c1_market: 1, c4_answer: 1, c5_years: 1 };
function update(dt, S, G, t) {
  const P = G.P, st = S.step; RT.t += dt;
  if (P.cpose) { P.cpose.t += dt; if (P.cpose.dur && !P.cpose.hold && P.cpose.t > P.cpose.dur) P.cpose = null; }
  if (P.cpose && P.spd > 0.6 && !GG.Cine.on && ['reach', 'scratchWall', 'shave', 'think', 'bow', 'gather'].includes(P.cpose.k)) P.cpose = null;
  if (P.cpose && P.cpose.hold && !GG.Cine.on && P.spd > 0.6 && !['bound'].includes(P.cpose.k)) P.cpose = null;
  if ((S.q.bound || S.q.chain) && !P.cpose && !GG.Cine.on) P.cpose = { k: 'bound', t: 0, dur: 0, hold: true };
  if (!S.q.bound && !S.q.chain && P.cpose && P.cpose.k === 'bound' && !GG.Cine.on) P.cpose = null;
  if (S.q.bound || S.q.chain) P.sprint = false;
  tutorial(dt, S, G);
  // the pit: trying to climb out
  if (S.q.inPit && st === 'c1_pit' && !GG.Cine.on) { if (!P.grounded && P.vy > 5 && !RT.jmp) { RT.jmp = 1; S.q.climb = (S.q.climb || 0) + 1; G.sfx('scratch'); setTimeout(() => {
      cpose('reach', 1.6); G.FX.burst(P.x + Math.sin(P.face) * 0.6, P.y + 1.6, P.z + Math.cos(P.face) * 0.6, 14, { c: [0.6, 0.5, 0.38], sp: 1, up: -0.5, g: 6 });
      G.UI.toast(S.q.climb === 1 ? '손이 닿지 않아요… 벽이 너무 높아요' : S.q.climb === 2 ? '흙벽이 무너져 내려요. 혼자서는 나갈 수 없어요' : '…');
      if (S.q.climb === 2) GG.UI.hint('구덩이 한가운데에서 형들을 불러 보세요', 'pitCall', 'tap'); G.UI.quest(); G.checkStep(); }, 380); }
    if (P.grounded) RT.jmp = 0; }
  caravanUpdate(dt, S, G);
  visionUpdate(dt, S, G, t);
  /* v16.8 a story scene that only starts when its step begins (노예 장터 · 바로의 꿈 해석 · 일곱 해 풍년) must never hang: if the
     step is still here and nothing is playing for 6 s (a puzzle or dialogue was somehow closed), the scene picks up again.
     Talking to 바로 during 꿈 해석 does the same at once. */
  if (SCENE_ONLY[st]) { const idle = !GG.Cine.on && !GG.Game.cineOn && !GG.UI.busy(); RT.sceneIdle = RT.sceneStep === st && idle ? (RT.sceneIdle || 0) + dt : RT.sceneStep === st ? Math.min(0, RT.sceneIdle || 0) : 0; RT.sceneStep = st;
    if (RT.sceneIdle > 6) { RT.sceneIdle = -20; G.UI.toast('멈춘 장면을 다시 이어 가요'); steps[st].enter(S, G, true); } }
  if (st === 'c2_field') { const n = FIELD_N.pflax - ripeLeft(S, 'pflax'); if (n !== S.q.flax) { S.q.flax = n; G.UI.quest(); G.checkStep(); } }
  if (st === 'c2_tempt2') { const n = FIELD_N.pflax - ripeLeft(S, 'pflax'); if (n !== S.q.flax2) { S.q.flax2 = n; G.UI.quest(); G.checkStep(); } }
  if (st === 'c5_year2') { const n = FIELD_N.royal - ripeLeft(S, 'royal'); if (n !== S.q.wheat) { S.q.wheat = n; G.UI.quest(); G.checkStep(); } }
  // fetters clink as he walks
  if (S.q.chain && P.spd > 0.5) { RT.chT = (RT.chT || 0) - dt; if (RT.chT <= 0) { RT.chT = 0.62; G.sfx('chain', { vol: 0.32, pitch: 0.9 + Math.random() * 0.2 }); } }
  // the second chariot
  const ride = !!S.q.riding && !!S.q.chariotOk && !GG.Cine.on;
  G.CAM.zoom = lerp(G.CAM.zoom || 1, S.q.riding ? 1.6 : 1, Math.min(1, dt * 2));
  if (S.q.riding) { P.stam = Math.max(P.stam, 60); P.exhausted = false; RT.hoof = (RT.hoof || 0) + P.spd * dt; if (RT.hoof > 1.3 && P.spd > 1) { RT.hoof = 0; G.sfx('step', { surf: 'stone', vol: 0.4 + P.spd / 30, pitch: 0.7 + Math.random() * 0.2 }); }
    if (ride && P.spd > 7) { RT.dustT = (RT.dustT || 0) - dt; if (RT.dustT < 0) { RT.dustT = 0.08; G.FX.burst(P.x - Math.sin(P.face) * 1.2, P.y + 0.1, P.z - Math.cos(P.face) * 1.2, 3, { c: [0.85, 0.76, 0.6], sp: 0.8, up: 0.6, size: 0.3, a: 0.6, g: 0.4 }); } } }
  if (RT.dust) { RT.dustT2 = (RT.dustT2 || 0) - dt; if (RT.dustT2 < 0) { RT.dustT2 = 0.05; const v = VISION[4]; G.FX.burst(v.x + 6 + Math.random() * 4, hAt(v.x, v.z) + 0.4 + Math.random() * 1.5, v.z + (Math.random() - 0.5) * 6, 3, { c: [0.8, 0.65, 0.45], sp: 3, up: 0.3, size: 0.25, a: 0.5, g: -0.1 }); } }
  // prefetch the next score
  if (RT.preStep !== st) { RT.preStep = st; const nx = NEXT_TRACK[st]; if (nx && GG.Audio && GG.Audio.prefetch) setTimeout(() => GG.Audio.prefetch(nx), 4000); }
  // buyers line up and the visited one steps aside
  if (st === 'c6_sell') for (const b of BUYERS) { const n = G.npc(b.id); if (n && (S.q.sold || {})[b.id] && !n.left) { n.left = 1; G.npcWalk(b.id, n.x + (Math.random() - 0.5) * 6, n.z + 8, null, 1.4); } }
}
function tutorial(dt, S, G) {
  const P = G.P, st = S.step; if (GG.Cine.on || GG.UI.busy() || (GG.Opening && GG.Opening.on)) return;
  if (st === 'p_wake') { if (!RT.tut0) RT.tut0 = [P.x, P.z]; const moved = Math.hypot(P.x - RT.tut0[0], P.z - RT.tut0[1]);
    if (moved < 3) GG.UI.hint('왼쪽 아래를 끌면 걸어요 · 오른쪽 화면을 끌면 둘러봐요 (키보드: WASD · 방향키)', 'move', 'move');
    else GG.UI.hint('화살표가 가리키는 곳으로 · 아버지 야곱께 가서 A로 말해요', 'goJacob', 'tap'); }
  else if (st === 'p_provision') { if (!S.q.skin) GG.UI.hint('물건 가까이에서 A를 누르면 챙길 수 있어요', 'items', 'tap'); else if (S.q.bread && !S.q.benj) GG.UI.hint('동생 베냐민에게 인사해요', 'benj', 'heart'); }
  else if (st === 'p_road') { const dl = Math.hypot(P.x - SPOTS.log[0], P.z - SPOTS.log[1]);
    if (dl < 11 && P.z > SPOTS.log[1] - 1) GG.UI.hint('쓰러진 나무가 길을 막았어요 · 점프 버튼(스페이스)으로 넘어요', 'jump', 'jump');
    else if (!RT.ran && P.z > SPOTS.log[1]) { if (P.sprint && P.spd > 5) RT.ran = 1; GG.UI.hint('달리기 버튼을 누른 채 걸으면 빨리 달려요 (키보드: Shift)', 'run', 'run'); }
    else GG.UI.hint(null); }
  else if (st === 'c1_pit') { if ((S.q.climb || 0) < 2) GG.UI.hint('구덩이 벽이 높아요 · 점프 버튼으로 기어올라 보세요', 'pitJump', 'jump'); else if (S.q.shout && !S.q.pitPray) GG.UI.hint('무릎 꿇고 하나님께 부르짖어요', 'pitPray', 'pray'); }
}

// ------------------------------------------------------------------ BOUNDS · CAMERA · MOVEMENT · POSE
const ESTATE = { x0: -50.4, x1: 16, z0: 34, z1: 84 };
function bounds(P, S) {
  const st = S.step;
  if (S.q.inPit) { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.wall - 0.48; if (d > R0) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  else { const d = Math.hypot(P.x - PIT.x, P.z - PIT.z), R0 = PIT.r + 1.5; if (d < R0 && d > 0.01) { P.x = PIT.x + (P.x - PIT.x) / d * R0; P.z = PIT.z + (P.z - PIT.z) / d * R0; } }
  if (st === 'c1_caravan' && RT.car) { const n = GG.Game.npc('camel3'); if (n) { const d = Math.hypot(P.x - n.x, P.z - n.z), L = 6.6; if (d > L) { P.x = n.x + (P.x - n.x) / d * L; P.z = n.z + (P.z - n.z) / d * L; } } }
  if (S.q.cellLock) { P.x = clamp(P.x, -20.4, -16.4); P.z = clamp(P.z, -9.2, -4.1); }
  if (between(S, 'c3_keeper', 'c3_wait') && !GG.Cine.on) { P.x = clamp(P.x, -44.3, -15.7); P.z = clamp(P.z, P.x > -20.5 && P.x < -16.3 ? -9.2 : -4.6, 13.2); }
  if (between(S, 'c2_arrive', 'c2_tempt3')) { const ox = P.x, oz = P.z; P.x = clamp(P.x, ESTATE.x0, ESTATE.x1); P.z = clamp(P.z, ESTATE.z0, ESTATE.z1); if ((ox !== P.x || oz !== P.z) && (!RT.estT || RT.t - RT.estT > 6)) { RT.estT = RT.t; GG.UI.toast('보디발의 집 종은 멀리 갈 수 없어요'); } }
  if (S.q.vision) { const d = Math.hypot(P.x + 80, P.z + 203), R0 = 26; if (d > R0) { P.x = -80 + (P.x + 80) / d * R0; P.z = -203 + (P.z + 203) / d * R0; } }
}
function camera(S, G, dt) {
  if (!S.q.inPit) return null; const P = G.P, C = G.CAM;
  const yaw = C.yaw, dist = 2.1, cx = P.x + Math.sin(yaw) * dist, cz = P.z + Math.cos(yaw) * dist, d = Math.hypot(cx - PIT.x, cz - PIT.z), R0 = PIT.wall - 0.25;
  const k = d > R0 ? R0 / d : 1, x = PIT.x + (cx - PIT.x) * k, z = PIT.z + (cz - PIT.z) * k, up = clamp(C.pitch, -0.3, 0.9);
  return { x, y: P.y + 1.25 + up * 0.35, z, lx: P.x - Math.sin(yaw) * 0.6, ly: P.y + 1.95 + up * 1.8, lz: P.z - Math.cos(yaw) * 0.6, fov: 1.1 };
}
function speedMul(S, P, mag) { if (S.q.riding && S.q.chariotOk) return P.sprint ? 1.85 : 2.2; if (S.q.chain) return 0.52; if (S.q.bound) return 0.74; if (S.q.inPit) return 0.6; return 1; }
function pose(pst, S, G) {
  const P = G.P;
  if (S.q.riding && S.q.chariotOk) { pst.act = 'charioteer'; pst.actT = 0; pst.speed = 0; pst.staff = false; pst.carry = null; return; }
  if (P.cpose && !pst.act) { pst.act = P.cpose.k; pst.actT = P.cpose.dur ? Math.min(1, P.cpose.t / P.cpose.dur) : (P.cpose.t % 2) / 2; }
}
function rootY(S, G) { return S.q.riding && S.q.chariotOk ? 0.46 : 0; }
const extra = [{ id: 'chariot', label: S => S.q.riding ? '수레 내리기' : '버금 수레 타기', ic: 'donkey', on: S => !!S.q.chariotOk && between(S, 'c5_patrol'),
  click: (S, G) => { S.q.riding = S.q.riding ? 0 : 1; G.sfx(S.q.riding ? 'whoosh' : 'step'); if (S.q.riding) { S.q.rode = 1; G.UI.toast('버금 수레 · 달리기 버튼을 누르면 말이 힘차게 달려요'); G.checkStep(); } G.snapCam(); } }];
extra.push({ id: 'ward', label: '옷장', ic: 'cloth', on: S => !before(S, 'c5_patrol'), click: (S, G) => openWardrobe(S, G) });
function canSleep(S) { return S.step === 'c2_night1' || S.step === 'p_night'; }

// ------------------------------------------------------------------ DYNAMIC MESHES
const MESH = {};
const mk = (k, fn) => { if (!MESH[k]) { const g = new GG.GB(k.length * 7 + 3); fn(g, m4(), rng(k.length * 13 + 1)); MESH[k] = R.mesh(g); } return MESH[k]; };
const Mx = {}; const mat = (k, x, y, z, ry, rx, rz, sx, sy, sz) => m4trs(Mx[k] || (Mx[k] = m4()), x, y, z, ry || 0, rx || 0, rz || 0, sx, sy, sz);
function ropeSeg(list, k, a, b, col) { const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-3; const ry = Math.atan2(dx, dz), rx = Math.acos(clamp(dy / L, -1, 1));
  list.push({ mesh: mk('rope', g => g.cyl(0.022, 0.022, 1, 5, { base: true, c: col || 0x8a6a40 })), m: mat(k, a[0], a[1], a[2], ry, rx, 0, 1, L, 1) }); }
const wpos = M => [M[12], M[13], M[14]];
function vineMesh(stage) { return mk('vine' + stage, (g, M, r) => {
  g.cyl(0.07, 0.11, 1.4, 7, { at: [0, 0.7, 0], c: 0x6a4a30 });
  for (let b = 0; b < 3; b++) { const a = (b - 1) * 0.7; const ex = Math.sin(a) * 0.9, ey = 1.4 + 0.6, ez = Math.cos(a) * 0.15; g.cyl(0.035, 0.05, 1.0, 5, { at: [ex / 2, 1.4 + 0.3, ez / 2], rz: -a, c: 0x6a4a30 });
    if (stage >= 1) for (let l = 0; l < 4; l++) g.sph(0.16, 6, 4, { at: [ex * (0.4 + l * 0.2) + (r() - 0.5) * 0.2, 1.5 + l * 0.14, ez + (r() - 0.5) * 0.3], s: [1.3, 0.35, 1], ry: r() * 6, c: [0x5a9a3a, 0x6aaa48][l % 2], flat: true });
    if (stage === 2) for (let f = 0; f < 3; f++) g.sph(0.05, 5, 4, { at: [ex * 0.9 + (r() - 0.5) * 0.2, ey - 0.1 + (r() - 0.5) * 0.15, ez + 0.12], c: 0xf4f0d8 });
    if (stage >= 3) for (let q = 0; q < 9; q++) g.sph(0.065, 6, 4, { at: [ex * 0.95 + (q % 3 - 1) * 0.07, ey - 0.15 - Math.floor(q / 3) * 0.1, ez + 0.14 + (q % 2) * 0.04], c: [0x5a2a5a, 0x6a3a6a][q % 2] }); }
  if (stage >= 3) { g.lathe([[0.02, 0], [0.12, 0.02], [0.05, 0.06], [0.03, 0.2], [0.14, 0.28], [0.17, 0.42]], 10, { at: [0.55, 0.9, 0.5], c: 0xd9a73a }); } }); }
function dreamDyn(list, S, G, t) {
  const fx = RT.dreamFx; if (!fx) return; const x = DREAM.x, z = DREAM.z, h = hAt(x, z), k = RT.dreamK || 0;
  if (fx === 'vine') { const stg = k < 0.3 ? 0 : k < 0.55 ? 1 : k < 0.8 ? 2 : 3; list.push({ mesh: vineMesh(stg), m: mat('vine', x, h, z, 0.4, 0, 0, 0.6 + k * 0.6), emis: [0.25, 0.22, 0.12] }); }
  if (fx === 'baskets') { list.push({ mesh: mk('baskets', g => { for (let i = 0; i < 3; i++) { g.cyl(0.42 - i * 0.03, 0.36 - i * 0.03, 0.32, 12, { at: [0, 1.2 + i * 0.34, 0], c: 0xf4ecd8 }); g.cyl(0.36 - i * 0.03, 0.36 - i * 0.03, 0.04, 12, { at: [0, 1.37 + i * 0.34, 0], c: 0xd8b070 }); }
      for (let q = 0; q < 6; q++) g.sph(0.08, 6, 4, { at: [Math.cos(q) * 0.2, 2.25, Math.sin(q) * 0.2], s: [1.4, 0.6, 1], c: 0xc88848 }); }), m: mat('bsk', x, h, z, 0), emis: [0.3, 0.28, 0.2] });
    for (let i = 0; i < 5; i++) { const a = t * (0.9 + i * 0.13) + i * 1.3, r = 1.1 + Math.sin(t * 0.7 + i) * 0.3 - k * 0.6, y = h + 2.6 + Math.sin(t * 2 + i) * 0.25 - k * 0.3;
      list.push({ mesh: mk('bird', g => { g.sph(0.09, 6, 4, { s: [0.7, 0.6, 1.4], c: 0x2a2420 }); g.tri([0, 0.02, 0.02], [-0.32, 0.06, -0.05], [0, 0.02, -0.08], { c: 0x2a2420 }); g.tri([0, 0.02, 0.02], [0, 0.02, -0.08], [0.32, 0.06, -0.05], { c: 0x2a2420 }); }),
        m: mat('bird' + i, x + Math.cos(a) * r, y, z + Math.sin(a) * r, -a, 0, Math.sin(t * 14 + i) * 0.5) }); } }
  if (fx === 'sheaves') { for (let i = 0; i < 12; i++) { const center = i === 11, a = i / 11 * Math.PI * 2, R0 = center ? 0 : 2.2, sx = x + Math.cos(a) * R0, sz = z + Math.sin(a) * R0;
      const bow = center ? 0 : k * 0.55, ry = Math.atan2(x - sx, z - sz);
      list.push({ mesh: mk('sheaf', g => { g.cyl(0.18, 0.26, 1.0, 8, { base: true, c: 0xe2b844, j: 0.06 }); g.cyl(0.27, 0.27, 0.07, 8, { at: [0, 0.55, 0], c: 0xb88a2a }); for (let q = 0; q < 8; q++) g.cyl(0.02, 0.03, 0.4, 3, { at: [Math.cos(q) * 0.12, 1.12, Math.sin(q) * 0.12], rx: Math.sin(q) * 0.3, rz: Math.cos(q) * 0.3, c: 0xf0d060 }); }),
        m: mat('shf' + i, sx, hAt(sx, sz), sz, ry, bow, 0, center ? 1.25 : 1), emis: center ? [0.4, 0.32, 0.1] : [0.18, 0.14, 0.05] }); } }
}
function earsDyn(list, S, G, t) {
  if (!RT.ears) return; const v = VISION[3], w = VISION[4], k = RT.earK || 0, sw = RT.swallow || 0;
  const stalk = (key, good) => mk(key, g => { g.cyl(0.02, 0.035, 1.3, 4, { base: true, c: good ? 0x8aa040 : 0x9a8a5a });
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, y = 1.0 + (i % 3) * 0.12; g.cyl(0.01, 0.012, 0.3, 3, { at: [Math.cos(a) * 0.1, y, Math.sin(a) * 0.1], rz: Math.cos(a) * 0.6, rx: -Math.sin(a) * 0.6, c: good ? 0x8aa040 : 0x8a7a50 });
      g.sph(good ? 0.07 : 0.035, 6, 4, { at: [Math.cos(a) * 0.24, y + 0.16, Math.sin(a) * 0.24], s: [0.8, good ? 2.2 : 2.6, 0.8], c: good ? 0xe8c040 : 0x9a8058 }); } });
  const gs = RT.ears === 'good' ? k : 1; if (sw < 0.98) list.push({ mesh: stalk('earG', true), m: mat('earG', v.x, hAt(v.x, v.z), v.z, t * 0.05, Math.sin(t * 0.8) * 0.04, 0, gs * 1.3 * (1 - sw)), emis: [0.3, 0.25, 0.08] });
  if (RT.ears === 'both') list.push({ mesh: stalk('earT', false), m: mat('earT', w.x, hAt(w.x, w.z), w.z, 0, Math.sin(t * 3) * 0.12, Math.sin(t * 2.3) * 0.1, k * 1.3) });
}
function dyn(list, S, G, t) {
  const P = G.P, W = G.W();
  // v16.9 the things to pack before the road actually lie there (the action used to float beside the jars over nothing)
  if (S.step === 'p_provision' || S.step === 'p_wake' || S.step === 'p_jacob') {
    if (!S.q.bread) list.push({ mesh: mk('provBread', g => { g.cyl(0.26, 0.2, 0.16, 12, { at: [0, 0.08, 0], c: 0xa57a3c }); g.cyl(0.25, 0.25, 0.02, 12, { at: [0, 0.17, 0], c: 0x7a5530 });
      for (let i = 0; i < 4; i++) g.sph(0.085, 8, 5, { at: [Math.cos(i * 1.6) * 0.11, 0.21, Math.sin(i * 1.6) * 0.11], s: [1, 0.55, 1], c: 0xd8a860 });
      for (let i = 0; i < 3; i++) g.sph(0.045, 6, 4, { at: [Math.cos(i * 2.1 + 0.6) * 0.06, 0.27, Math.sin(i * 2.1 + 0.6) * 0.06], c: 0x6a3a52 }); }), m: mat('provBread', 172.5, hAt(172.5, 157), 157, 0.4), outline: true });
    if (!S.q.skin) list.push({ mesh: mk('provSkin', g => { g.sph(0.2, 10, 8, { at: [0, 0.16, 0], s: [1.25, 0.75, 0.85], c: 0x7a5034 }); g.cyl(0.035, 0.045, 0.12, 6, { at: [0.26, 0.24, 0], rz: -1.1, c: 0x6a4228 });
      g.cyl(0.012, 0.012, 0.5, 4, { at: [0, 0.3, 0], rz: 1.5708, c: 0x3a2a1a }); }), m: mat('provSkin', 182.2, hAt(182.2, 155.2), 155.2, 1.1), outline: true }); }
  // the rope: last camel → Joseph's hands
  if (S.step === 'c1_caravan' && S.q.bound && RT.car) { const n = G.npc('camel3'); if (n && n.vis) { const a = [n.x - Math.sin(n.face) * 0.9, n.y + 1.2, n.z - Math.cos(n.face) * 0.9], h = wpos(P.rig.world[HBI.handR]), mid = [(a[0] + h[0]) / 2, Math.min(a[1], h[1]) - 0.35, (a[2] + h[2]) / 2];
    ropeSeg(list, 'r1', a, mid); ropeSeg(list, 'r2', mid, h); } }
  // the second chariot and its horses
  if (S.q.riding && S.q.chariotOk) {
    const f = P.face, y = P.y + (G.EP().rootY ? 0 : 0);
    list.push({ mesh: mk('chariot', g => { g.box(1.3, 0.08, 1.0, { at: [0, 0.42, 0], c: 0x8a6440 }); g.box(1.3, 0.62, 0.06, { at: [0, 0.74, 0.48], c: 0xd9a73a }); for (const s of [1, -1]) { g.box(0.06, 0.5, 0.95, { at: [s * 0.62, 0.7, 0], c: 0xd9a73a }); g.cyl(0.42, 0.42, 0.07, 14, { at: [s * 0.74, 0.42, -0.1], rz: Math.PI / 2, c: 0x6a4a30 }); g.cyl(0.06, 0.06, 0.14, 6, { at: [s * 0.78, 0.42, -0.1], rz: Math.PI / 2, c: 0xd9a73a }); }
      g.box(0.08, 0.08, 2.2, { at: [0, 0.6, 1.5], rx: -0.15, c: 0x8a6440 }); g.box(1.8, 0.07, 0.07, { at: [0, 0.82, 2.55], c: 0x8a6440 }); band2(g); }), m: mat('char', P.x, y, P.z, f), outline: true });
    for (const s of [1, -1]) { const hx = P.x + Math.sin(f) * 3.0 + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * 3.0 - Math.sin(f) * s * 0.55; RT.hph = (RT.hph || 0) + 0; }
  }
  // the banquet table
  if (S.step === 'c2_banquet') list.push({ mesh: mk('feast', g => { ENVX.tableEg(g, m4()); for (let i = 0; i < 4; i++) { g.lathe([[0.05, 0], [0.16, 0.1], [0.18, 0.32], [0.08, 0.5], [0.1, 0.55]], 8, { at: [-0.6 + i * 0.4, 0.84, -0.15], c: [0x8a3a3a, 0xc8865a, 0xd8b860, 0x6a4a6a][i] }); }
      for (let i = 0; i < 5; i++) g.sph(0.09, 6, 4, { at: [-0.5 + i * 0.25, 0.9, 0.2], s: [1.4, 0.7, 1], c: 0xd8a060 }); for (let i = 0; i < 7; i++) g.sph(0.05, 5, 4, { at: [0.3 + (i % 3) * 0.1, 0.9, 0.18 + Math.floor(i / 3) * 0.08], c: 0x6a3a5a }); }), m: mat('feast', -38.4, hAt(-38.4, 43.7), 43.7, 0), outline: true });
  // the garment left in her hand (창 39:12)
  if (S.q.robe && between(S, 'c2_flee', 'c2_flee')) { const n = G.npc('wife'); if (n && n.vis) list.push({ mesh: mk('robe', g => { g.box(0.5, 0.9, 0.06, { at: [0, -0.45, 0], c: 0xe8dcc0 }); g.box(0.52, 0.12, 0.07, { at: [0, -0.86, 0], c: 0x9a6a3a }); }), m: n.rig.world[HBI.handR], outline: true }); }
  // days scratched on the wall
  if (between(S, 'c3_wait') && (S.q.wait || 0) >= 2 && before(S, 'c4_court')) list.push({ mesh: mk('marks', g => { for (let i = 0; i < 24; i++) g.box(0.02, 0.22, 0.01, { at: [(i % 12) * 0.07 + Math.floor((i % 12) / 4) * 0.04, Math.floor(i / 12) * 0.3, 0], rz: (i % 4 === 3) ? 0.9 : 0.05, c: 0x5a4a38 }); }), m: mat('marks', -20.62, hAt(-20.6, -6.4) + 1.2, -6.8, Math.PI / 2) });
  // grain piled before the granaries
  const sacks = RT.sacks || (between(S, 'c5_years') ? 3 : 0);
  if (sacks) for (const s of sites) if (S.built[s.id] || S.step === 'c5_years') list.push({ mesh: mk('sacks' + sacks, (g, M, r) => { for (let i = 0; i < sacks * 7; i++) g.sph(0.32, 7, 5, { at: [(i % 7) * 0.62 - 1.9 + (r() - 0.5) * 0.1, 0.25 + Math.floor(i / 7) * 0.42, (Math.floor(i / 7) % 2) * 0.3], s: [1, 0.85, 0.8], c: [0xd8c49a, 0xc8b080, 0xe2cfa0][i % 3] }); }), m: mat('sk' + s.id, s.x, hAt(s.x, s.z + 4.4), s.z + 4.4, 0), outline: true });
  dreamDyn(list, S, G, t); earsDyn(list, S, G, t);
}
function band2(g) { for (let i = 0; i < 6; i++) g.box(0.2, 0.08, 0.02, { at: [-0.5 + i * 0.2, 0.92, 0.52], c: [0x2c5aa0, 0xb3472e, 0x2f8a77][i % 3] }); }
const HR = { rigs: [new Rig(AB.horse), new Rig(AB.horse)], ph: 0 };
function skinned(list, S, G, t) {
  for (const c of RT.cows) if (c.st !== 'hidden' && c.eaten < 0.99) list.push({ mesh: c.mesh, bones: c.rig.bones, outline: true, tint: c.thin ? [0.72, 0.66, 0.62] : null });
  if (S.q.riding && S.q.chariotOk) { const P = G.P, f = P.face; HR.ph += P.spd * 0.016 * 1.6;
    HR.rigs.forEach((rig, i) => { const s = i ? 1 : -1, hx = P.x + Math.sin(f) * 3.0 + Math.cos(f) * s * 0.55, hz = P.z + Math.cos(f) * 3.0 - Math.sin(f) * s * 0.55;
      animAnimal(rig, { speed: P.spd * 0.55, phase: HR.ph + i * 0.4, graze: false }, t); rig.update(m4trs(HR['M' + i] || (HR['M' + i] = m4()), hx, hAt(hx, hz), hz, f));
      list.push({ mesh: G.animalMesh('horse', i ? 'plain' : 'brown', { saddle: 0xd9a73a }), bones: rig.bones, outline: true }); }); }
}
// light: the moonlight shaft in Joseph's cell, the dream glows
let shaftMesh = null;
function flats(list, S, G, t) {
  const hr = S.time % 24;
  if (between(S, 'c3_cell', 'c4_shave') && (hr > 19 || hr < 5.5 || RT.grace > 0)) {
    if (!shaftMesh) { const g = new GG.GB(2); const top = [[-0.28, 0, -0.1], [0.28, 0, -0.1], [0.28, 0, 0.1], [-0.28, 0, 0.1]], bot = [[-0.7, -2.6, 1.2], [0.7, -2.6, 1.2], [0.7, -2.6, 1.9], [-0.7, -2.6, 1.9]];
      const push = (q, a) => g.d.push(q[0], q[1], q[2], 0, 1, 0, 0.75, 0.85, 1.0, a, 0);
      for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; push(top[i], 0.35); push(top[j], 0.35); push(bot[j], 0); push(top[i], 0.35); push(bot[j], 0); push(bot[i], 0); }
      shaftMesh = R.mesh(g); }
    const k = RT.grace > 0 ? 0.25 + RT.grace * 0.75 : 0.22; list.push({ mesh: shaftMesh, m: mat('shaft', -18.4, hAt(-18.4, -9) + 2.75, -9.55, 0), color: [1, RT.grace > 0 ? 0.95 : 1, RT.grace > 0 ? 0.75 : 1, k] });
  }
  if (S.q.vision && !GG.Cine.on) { const v = VISION.find(q => !(S.q.seen || {})[q.id]); if (v) { if (!RT.glow) { const g = new GG.GB(3); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2, r = 1.1;
        const q = (ang, y, rr) => [Math.cos(ang) * rr, y, Math.sin(ang) * rr]; for (const [p, al] of [[q(a, 0, r), 0.5], [q(b, 0, r), 0.5], [q(b, 6, r * 0.6), 0], [q(a, 0, r), 0.5], [q(b, 6, r * 0.6), 0], [q(a, 6, r * 0.6), 0]]) g.d.push(p[0], p[1], p[2], 0, 1, 0, 1, 0.9, 0.6, al, 0); }
        RT.glow = R.mesh(g); } list.push({ mesh: RT.glow, m: mat('glow', v.x, hAt(v.x, v.z), v.z, t * 0.3), color: [1, 0.92, 0.7, 0.5 + Math.sin(t * 2.4) * 0.15] }); } }
}

// ------------------------------------------------------------------ LOAD · DAY
function onLoad(S, G) {
  RT.car = null; RT.cows.length = 0; RT.ears = null; RT.dreamFx = null; RT.dust = 0; RT.sacks = 0; RT.grace = 0; RT.lookBack = 0; RT.tut0 = null; RT.preStep = null; GG.Game.musicOverride = null; G.CAM.zoom = 1;
  const want = between(S, 'c6_open') ? 'famine' : between(S, 'c5_years') ? 'plenty' : 'normal';
  if (LAND !== want) { LAND = want; G.W().recolor(color); }
  if (between(S, 'c6_open') && S.step !== 'c6_open') { /* the land stays dry */ }
  if (S.step === 'c1_pit') S.q.inPit = 1; if (!S.q.inPit) G.P.cpose = null;
  if (S.step === 'c2_field' && !S.q.flaxPlanted) { ripe(S, 'pflax', 'flax'); S.q.flaxPlanted = 1; }
  if (between(S, 'c5_year2')) G.unlock('royal');
  G.P.sleeping = false; G.P.sit = false; G.P.kneel = false;
}
function onDay(S, G) { if (between(S, 'c5_patrol', 'c5_years')) { S.silver += 0; } }
function calmWeather(S) { return !!(S.q.vision || RT.dreamFx || S.q.inPit || between(S, 'c2_tempt3', 'c3_cell') || between(S, 'c4_shave', 'c4_answer') || (GG.Opening && GG.Opening.on)); }
function calmSurv() { return true; }
function climate(S, x, z, hr) { if (canaanK(x) > 0.5) return null; return { clear: 0.66, cloudy: 0.12, rain: 0.01, storm: 0, wind: 0.12, dust: LAND === 'famine' ? 0.22 : 0.06, fog: hr > 4 && hr < 8 && fert(x, z) > 0.5 ? 0.08 : 0 }; }
function quiet(S) { return !!(S.q.inPit || S.q.vision || between(S, 'c2_tempt3', 'c3_cell') || S.step === 'c1_caravan' || S.step === 'c3_wait'); }
function ledger(S, G) { const w = Object.keys(S.q.words || {}).length; return { title: '요셉의 기록', rows: [['배운 애굽 말', w + '개'], ['지은 곳간', ['granA', 'granB', 'granC'].filter(k => S.built[k]).length + '채'], ['곡식을 판 사람', Object.keys(S.q.sold || {}).length + '명'], ['지난 날', S.day + '일']] }; }
function worldFacts(S) {
  if (before(S, 'c1_caravan')) return '요셉은 헤브론에 사는 야곱의 열한째 아들로, 채색옷을 입은 열일곱 살 목자 소년이다.';
  if (before(S, 'c3_cell')) return '여기는 애굽 땅이다. 요셉은 가나안에서 팔려 온 히브리 종으로, 친위대장 보디발의 집에서 일한다. 애굽 말을 배우는 중이다.';
  if (before(S, 'c4_court')) return '요셉은 왕의 옥에 갇힌 히브리 사람이다. 간수장이 옥중 일을 그에게 맡겼다.';
  return '요셉은 바로가 세운 애굽의 총리(사브낫바네아)다. 풍년에 오분의 일을 거두어 곳간에 쌓게 했다. 여기는 애굽 땅이고, 사람들은 나일 강을 따라 산다.';
}
function rumors(S) { if (between(S, 'c6_open')) return ['곳간 문이 열렸다오! 총리님 덕에 우리 아이들이 살았소.', '가나안에서도 곡식을 사러 사람들이 온다더군요.'];
  if (between(S, 'c5_patrol')) return ['총리님이 각 성마다 곳간을 짓게 하셨대요.', '버금 수레를 탄 총리님을 봤소? 히브리 사람이라던데.', '올해는 밀이 사람 키만큼 자랐어요!'];
  return ['나일 강이 불어날 철이 다가오오.', '바로의 궁에 새 오벨리스크를 세운다더군요.']; }
const chatter = [
  { a: 'cook', b: 'gardener', when: S => between(S, 'c2_arrive', 'c2_tempt2'), lines: [[0, '세티! 연못 물 좀 쓰자니까.'], [1, '연꽃이 다 죽는다고 몇 번을 말해!']] },
  { a: 'neb', b: 'ameni', when: S => between(S, 'c2_arrive', 'c2_quiz'), lines: [[0, '저 히브리 놈, 말 한마디 못 알아듣던데.'], [1, '두고 보게. 눈빛이 다른 아이야.']] },
  { a: 'prisA', b: 'prisB', when: S => between(S, 'c3_keeper', 'c3_wait'), r: 7, lines: [[0, '저 히브리 사람은 왜 늘 기도하지?'], [1, '그 덕에 우리가 물이라도 마시잖아.']] },
  { a: 'magician', b: 'sage', when: S => between(S, 'c4_court', 'c4_answer'), r: 16, lines: [[0, '히브리 죄수가 바로의 꿈을 푼다고?'], [1, '…우리가 못 푼 꿈이오. 지켜봅시다.']] },
  { a: 'reuben', b: 'judah', when: S => S.step === 'c1_pit', r: 8, lines: [[0, '…해가 지면 내가 우물 쪽을 살펴보겠다.'], [1, '왜, 형? 마음이 약해졌소?']] },
  { a: 'ct_mer', b: 'ct_wat', when: S => between(S, 'c5_patrol'), lines: [[0, '총리님 수레가 지나갔다며?'], [1, '말들이 금빛 굴레를 쓰고 있더래요!']] },
];

// ------------------------------------------------------------------ STORYBOOK OPENING (창 37:2–11), told by old Benjamin
const SV = (body, sky) => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">${sky || ''}${body}</svg>`;
const STARS = (n, seed) => { let s = '', r = rng(seed); for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 320).toFixed(1)}" cy="${(r() * 110).toFixed(1)}" r="${(0.4 + r() * 1.1).toFixed(2)}" fill="#fff6dc" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`; return s; };
const SKY_N = `<defs><linearGradient id="jn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".72" stop-color="#2b3b70"/><stop offset="1" stop-color="#6a5274"/></linearGradient><radialGradient id="jf" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf70" stop-opacity=".85"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs><rect width="320" height="200" fill="url(#jn)"/>`;
const SKY_D = `<defs><linearGradient id="jd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2d8"/><stop offset=".7" stop-color="#f2d8a8"/><stop offset="1" stop-color="#e8b878"/></linearGradient></defs><rect width="320" height="200" fill="url(#jd)"/>`;
const SKY_G = `<defs><linearGradient id="jg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c66a"/><stop offset=".6" stop-color="#f4dca0"/><stop offset="1" stop-color="#e6a85a"/></linearGradient></defs><rect width="320" height="200" fill="url(#jg)"/>`;
const COATS = (x, y, s) => { const C = ['#b3472e', '#e5b552', '#2f8a77', '#2c5aa0', '#c06a9a', '#f0e6cc']; let o = ''; for (let i = 0; i < 6; i++) o += `<path d="M${x - 9 * s} ${y + i * 5 * s}H${x + 9 * s}V${y + (i + 1) * 5 * s}H${x - 9 * s}z" fill="${C[i]}"/>`; return o; };
const BOY = (x, y, s, c) => `<g><circle cx="${x}" cy="${y - 8 * s}" r="${5 * s}" fill="${c || '#c98a5a'}"/><path d="M${x - 5 * s} ${y - 12 * s}Q${x} ${y - 16 * s} ${x + 5 * s} ${y - 12 * s}" fill="#2a1810"/>${COATS(x, y - 3 * s, s)}<path d="M${x - 4 * s} ${y + 27 * s}V${y + 36 * s}M${x + 4 * s} ${y + 27 * s}V${y + 36 * s}" stroke="#7a5232" stroke-width="${2.4 * s}"/></g>`;
const OPEN_ART = [
  SV(`${STARS(60, 5)}<path d="M0 150Q80 128 160 146T320 140V200H0z" fill="#3b2f48"/><path d="M0 170Q90 152 170 166T320 160V200H0z" fill="#271f33"/>
    <path d="M30 156L56 116L148 108L176 152z" fill="#17121e"/><path d="M92 152L98 124L116 123L120 152z" fill="#f2b45a"/><circle cx="214" cy="160" r="38" fill="url(#jf)"/>
    <path d="M206 166Q208 150 214 142Q218 152 222 156Q224 150 223 146Q230 156 224 166z" fill="#ffb347"/>
    <g fill="#1d1622"><circle cx="248" cy="132" r="7.5"/><path d="M238 128Q248 118 258 128L262 150L236 150z"/><path d="M236 146Q248 140 262 146L268 172L230 172z"/><path d="M244 138Q248 146 252 138" stroke="#d8d0c8" stroke-width="3" fill="none"/></g>
    ${BOY(186, 146, 0.75)}`, SKY_N),
  SV(`<circle cx="262" cy="44" r="18" fill="#fff4c8"/><path d="M0 140Q90 112 170 132T320 120V200H0z" fill="#9ab060"/><path d="M0 160Q100 140 190 156T320 150V200H0z" fill="#7a9448"/>
    ${[...Array(9)].map((_, i) => `<ellipse cx="${30 + i * 32}" cy="${160 + (i % 3) * 8}" rx="9" ry="6" fill="#f2ead8"/><circle cx="${37 + i * 32}" cy="${157 + (i % 3) * 8}" r="3.4" fill="#2a2420"/>`).join('')}
    <g transform="translate(150 70) scale(2.2)">${BOY(0, 0, 1)}</g><path d="M178 58Q200 40 226 50" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>`, SKY_D),
  SV(`<path d="M0 150Q90 122 170 142T320 130V200H0z" fill="#b8a070"/><path d="M0 168Q100 150 190 164T320 158V200H0z" fill="#9a8458"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<g fill="#3a2a22" opacity="${0.75 + (i % 2) * 0.2}"><circle cx="${40 + i * 24}" cy="${116 + (i % 2) * 6}" r="7"/><path d="M${32 + i * 24} ${124 + (i % 2) * 6}L${48 + i * 24} ${124 + (i % 2) * 6}L${52 + i * 24} ${160 + (i % 2) * 6}L${28 + i * 24} ${160 + (i % 2) * 6}z"/></g>`).join('')}
    <g transform="translate(262 112) scale(1.1)">${BOY(0, 0, 1)}</g><path d="M218 110Q236 100 246 108" stroke="#7a2a1a" stroke-width="2" fill="none" stroke-dasharray="3 4"/>`, SKY_D),
  SV(`<circle cx="160" cy="40" r="22" fill="#fff0b0" opacity=".9"/>${[...Array(11)].map((_, i) => { const a = (i / 11) * Math.PI * 2, x = 160 + Math.cos(a) * 96, y = 150 + Math.sin(a) * 30; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.cos(a) * -28).toFixed(1)})"><path d="M-7 0L7 0L5 -30L-5 -30z" fill="#d8a83a"/><path d="M-8 -24L8 -24" stroke="#9a6a1a" stroke-width="2.4"/><path d="M-5 -30Q0 -42 5 -30" fill="#f0c860"/></g>`; }).join('')}
    <g transform="translate(160 150)"><path d="M-9 0L9 0L7 -46L-7 -46z" fill="#f0c040"/><path d="M-10 -36L10 -36" stroke="#9a6a1a" stroke-width="3"/><path d="M-7 -46Q0 -64 7 -46" fill="#ffe080"/></g>`, SKY_G),
  SV(`${STARS(40, 9)}<circle cx="120" cy="60" r="20" fill="#ffd060"/><circle cx="210" cy="56" r="12" fill="#f4f0e0"/><circle cx="215" cy="52" r="10" fill="#2b3b70"/>
    ${[...Array(11)].map((_, i) => { const x = 40 + i * 24, y = 100 + Math.sin(i) * 8; return `<path d="M${x} ${y - 6}L${x + 2} ${y - 1}L${x + 7} ${y}L${x + 2} ${y + 2}L${x} ${y + 7}L${x - 2} ${y + 2}L${x - 7} ${y}L${x - 2} ${y - 1}z" fill="#fff6c8"/>`; }).join('')}
    <path d="M0 170Q100 150 200 166T320 160V200H0z" fill="#1d1830"/><g transform="translate(160 160)">${BOY(0, 0, 0.9)}</g><path d="M150 132Q160 124 170 132" stroke="#fff4c8" stroke-width="1" fill="none" opacity=".6"/>`, SKY_N),
  SV(`<defs><radialGradient id="js" cx=".5" cy=".9" r=".7"><stop offset="0" stop-color="#ffe6a0"/><stop offset=".5" stop-color="#f4a860"/><stop offset="1" stop-color="#3a4a80"/></radialGradient></defs><rect width="320" height="200" fill="url(#js)"/>
    <circle cx="160" cy="168" r="34" fill="#fff2c0"/><path d="M0 170Q80 150 160 160T320 152V200H0z" fill="#3a2a30"/><path d="M110 168Q160 120 210 168" fill="#2a1e26"/>
    <g transform="translate(160 132) scale(1.25)">${BOY(0, 0, 1, '#b07a4a')}</g>${STARS(18, 13)}`, '')];
const OPENING = {
  music: 'j_theme', startLabel: '요셉의 이야기 시작하기',
  pages: [
    { art: OPEN_ART[0], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '라헬의 아들', t: '내 형 요셉 이야기를 해 주마. 아버지 야곱에게는 아들이 열둘 있었단다. 그중 요셉 형과 나는 아버지가 가장 사랑하신 라헬 어머니의 아들이었지. 아버지는 늙어서 얻은 요셉 형을 누구보다 사랑하셨어.', ref: '창세기 37:2–3' },
    { art: OPEN_ART[1], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '채색옷', t: '아버지는 요셉 형에게 채색옷을 지어 입히셨단다. 햇빛을 받으면 무지개처럼 빛나는 옷이었지. 열일곱 살 형은 그 옷을 입고 양 떼 사이를 뛰어다녔어.', ref: '창세기 37:3' },
    { art: OPEN_ART[2], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '형들의 눈빛', t: '하지만 형들은 그 옷을 볼 때마다 마음이 어두워졌어. 아버지가 요셉만 사랑하는 것을 보고, 형들은 요셉을 미워하여 그에게 다정한 말 한마디 하지 않았지.', ref: '창세기 37:4', e: 'sad' },
    { art: OPEN_ART[3], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '곡식 단의 꿈', t: '어느 날 형이 꿈 이야기를 했어. 밭에서 곡식 단을 묶는데, 형의 단은 일어서고 형들의 단이 둘러서서 절을 했다는 거야. 형들은 "네가 참으로 우리의 왕이 되겠느냐?" 하며 더욱 미워했단다.', ref: '창세기 37:5–8' },
    { art: OPEN_ART[4], who: '늙은 베냐민의 이야기', n: '늙은 베냐민', kick: '창세기 37장', title: '해와 달과 열한 별', t: '형은 또 꿈을 꾸었어. 해와 달과 열한 별이 자기에게 절을 했다는 꿈이었지. 아버지는 형을 꾸짖으셨지만… 그 말을 마음에 두셨단다.', ref: '창세기 37:9–11', e: 'awe' },
    { art: OPEN_ART[5], kick: '요셉 편', title: '꿈꾸는 자', t: '형들에게 미움받던 열일곱 살 소년의 꿈은, 어떻게 이루어질까요? 이제 그 길을 직접 걸어 보세요.', ref: '창세기 37–42장', e: 'tender' }],
  setup: true, setupArt: OPEN_ART[5],
  after(S, G) {
    const bx = SPOTS.bedHeb[0], bz = SPOTS.bedHeb[1], h = hAt(bx, bz), jx = 170.6, jz = 150.8;
    const tc = Math.cos(-0.5), ts = Math.sin(-0.5), at = (lx, lz) => [184 + tc * lx + ts * lz, 158 - ts * lx + tc * lz], c1 = at(-0.15, 3.0), c2 = at(0.75, 2.8); // v16.9 shots from the tent's open front
    G.teleport(bx, bz, -2.07); G.P.sleeping = true; S.time = 6.4;
    cine([{ hour: 6.4, cam: [bx + 30, h + 26, bz + 34], cam2: [bx + 6, h + 4, bz + 6], look: [176, h + 1, 152], look2: [bx, h + 0.8, bz], dur: 7, music: 'j_canaan', t: '헤브론 골짜기에 아침이 밝았습니다.', ref: '창세기 37:14' },
      { cam: [c1[0], h + 1.3, c1[1]], look: [bx, h + 0.3, bz], dur: 4.5, fov: 0.72, n: '야곱', t: '요셉아! 요셉아, 일어나거라!', e: 'tender' },
      { fn: () => { G.P.sleeping = false; setTimeout(() => cpose('stretch', 2.2), 1600); }, cam: [c2[0], h + 1.45, c2[1]], look: [bx, h + 0.8, bz], dur: 4.6, fov: 0.8, n: '요셉', t: '네, 아버지! 지금 가요!', e: 'happy' },
      { cam: [jx + 3, hAt(jx, jz) + 1.7, jz + 4], look: [jx, hAt(jx, jz) + 1.4, jz], dur: 4, t: '아버지 야곱이 장막 앞에서 요셉을 기다리고 있었습니다.' }],
    () => { GG.Game.musicOverride = null; narr([{ kick: '조작 안내', title: '프롤로그 · 형들을 찾아서', t: '왼쪽 아래를 끌어 걷고, 오른쪽 화면을 끌어 둘러봐요. 사람이나 물건 가까이에서 A를 누르면 말하거나 챙길 수 있어요. 갈 곳은 오른쪽 위 미니맵의 노란 길과 화살표가 알려 줘요.', ref: '' }]); }, { noSkip: false });
  },
};

// ------------------------------------------------------------------ REGISTER
G.EP.joseph = {
  floor: (x, z) => pitFloor(x, z), // v16.9 the pit collar
  id: 'joseph', title: '요셉 편 · 꿈꾸는 자', hero: '요셉', sub: '창세기 37–47장',
  blurb: '채색옷을 입은 소년이 형들을 찾아 나섰다가 구덩이에 던져집니다. 은 이십에 팔려 애굽의 종이 되고, 누명을 쓰고 옥에 갇혀도 하나님은 그와 함께 하셨습니다. 보디발의 집과 왕의 옥을 지나 바로 앞에 서기까지.',
  chapters: [{ t: '프롤로그 · 형들을 찾아서', r: '창 37:12–17' }, { t: '1장 · 구덩이', r: '창 37:18–36' }, { t: '2장 · 보디발의 집', r: '창 39:1–20' }, { t: '3장 · 왕의 옥', r: '창 39:20–41:14' },
    { t: '4장 · 바로의 꿈', r: '창 41:14–45' }, { t: '5장 · 일곱 해 풍년', r: '창 41:46–52' }, { t: '6장 · 일곱 해 흉년', r: '창 41:53–42:9' }, { t: '7장 · 형제들', r: '창 42:9–45:15' }, { t: '8장 · 고센 땅', r: '창 45:16–47:12' }, { t: '에필로그 · 고센의 이스라엘', r: '창 47' }],
  spec: { size: SIZE, cell: 2, seed: 37, height, color, water: { level: -0.35, shallow: [0.36, 0.62, 0.56], deep: [0.14, 0.32, 0.36] } },
  build, npcs, pens, fields, sites, specials, shops, stations, spots: SPOTS, steps, talk, chatter, envx: ENVX, quests: QUESTS,
  outfits: Object.assign({ default: LOOK.josephCoat }, ...['josephCoat', 'josephPlain', 'josephSlave', 'josephServant', 'josephSteward', 'josephFled', 'josephPrisoner', 'josephFettered', 'josephShaved', 'josephVizier'].map(k => ({ [k]: LOOK[k] })), { prisoner: LOOK.josephPrisoner }, WARD_LOOKS),
  start: { step: 'p_wake', x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1], face: -2.07, time: 6.4, silver: 0, inv: {}, tools: {}, outfit: 'josephCoat' },
  recipes: ['bread', 'bbread', 'linen', 'brick', 'grain', 'grainW', 'hay', 'torch'],
  showStaff: false, rain: 0.02, sleepFrom: 17, titleCam: { x: 176, z: 152, r: 32, h: 9, ty: 1.5 }, titleTime: 17.6, titleMusic: 'j_theme', timeScale: 1,
  mood, update, skinned, dyn, flats, bounds, camera, speedMul, pose, rootY, extra, onDay, onLoad, canSleep, music, ledger, aridAt, waterDist, climate, noRain: false,
  villages, strangers, opening: OPENING, places: PLACES, roads: ROADS, roadD, rumors, worldFacts, quiet, calmWeather, calmSurv,
  heroName: S => between(S, 'c5_patrol') ? '요셉 (사브낫바네아)' : '요셉', settled: (x, z) => PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 10),
  canBuild: () => '요셉 편에서는 정해진 곳간 터에만 지을 수 있어요',
  _dbg: { RT, stage, VISION, WAIT, ORDER, hAt, cin: (k, nx) => ({ cinNight, cinPlot, cinPit, cinSold, cinCaravanNight, cinReveal, cinMarket, cinGrab, cinAccuse, windowPray, cinOfficers, cinBirthday, cinPharaohDream, courtIntro, cinInvest, plentyMontage, cinBrothers })[k](GG.Game.S(), GG.Game, nx || (() => { })) },
};
{ const u0 = G.EP.joseph.update; G.EP.joseph.update = function (dt, S) { if (u0) u0.apply(this, arguments); goshenTick(dt, S); }; } // v16.7 고센 마을
GG.NpcAI && GG.NpcAI.register(G.EP.joseph);
})(window.G);
