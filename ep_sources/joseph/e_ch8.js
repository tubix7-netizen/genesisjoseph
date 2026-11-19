// =================================================================== v18.79 7장 나머지 · 8장 「고센 땅」 (e_ch8.js · 설계표_7장8장_v18_78.md)
/* 창 43:15 – 47:26. 메인은 성경만: 요셉 · 야곱 · 형들 · 바로 · 청지기 · 애굽 백성의 말은 성경 말씀 그대로예요(서기 · 마구간지기 같은 배경 사람만 짧게 일 이야기를 해요).
   같은 일을 되풀이하지 않게, 장면마다 손으로 하는 일이 달라요.
   7장: 베냐민과 온 형들 → 청지기 · 시므온이 풀려남 → 세 상 따로 차리기 → 정오(예물 · 절 · 안부 · 베냐민) → 안방에서 울고 얼굴 씻기 → 「음식을 차리라」
        → 나이 차례(어머니별 다섯 무리) → 다섯 배의 몫 → 은잔(말씀 한 번) → 자루 뒤지기 · 44:15–17 → 유다의 간청 → 「나는 요셉이라」(45:9–13 더함)
   8장: 바로의 명령(궁) → 수레 끌어내기 · 멍에 → 옷 · 베냐민의 은 삼백 → 나귀 스무 필 살피기 → 「노중에서 다투지 말라」 → 가나안 · 브엘세바 · 수레에 탄 집안 · 일흔 사람
        → 유다가 먼저 옴 → 수레에 말 매기 → 고센 만남 · 46:31–34 → 형 다섯과 궁으로 · 47:1–6 → 아버지와 천천히 걸어 · 47:7–10 → 라암세스 문서에 인 · 식구를 따라 양식
        → 흉년의 다섯 가지 일(47:13–26: 은 · 가축 · 땅 · 씨앗 · 법) → 47:27 에필로그 */
const C8 = S => S.q.c8 || (S.q.c8 = {});
const MG8 = (kind, o, then) => GG.UI.minigame(kind, o, ok => { if (!ok) { Gm().sfx('fail', { vol: 0.4 }); GG.UI.toast('한 번 더 해 봐요'); return; } then(); });
const HX8 = G7HOUSE[0], HZ8 = G7HOUSE[1];
const ROOM8 = [24, -136], STACK8 = [19, -138.4];
const TAB8 = { j: { x: HX8, z: HZ8 + 4.3, n: '요셉의 상', d: '요셉은 따로 먹어요' }, h: { x: HX8, z: HZ8 + 6, n: '형제들의 상', d: '히브리 사람인 형제들은 따로 먹어요' }, e: { x: HX8 + 7.2, z: HZ8 + 4.6, n: '애굽 사람의 상', d: '애굽 사람은 히브리 사람과 같이 먹지 않아요' } };
const SEAT8 = i => [HX8 - 6 + i * 1.2, HZ8 + 7];
const WAIT8 = [3, 7, 0, 9, 5, 1, 10, 4, 8, 2, 6]; /* (the brothers stand about in no order until they are seated) */
const WAG8 = [[34, -118], [38.5, -118]], OXT8 = [36, -123.5];
const LINE8 = { x0: 4, x1: 26, z: -113 };
const PALG8 = [-30, -134], COURT8 = SPOTS.court, OFFICE8 = [-14, -205], TREAS8 = [-30, -151], STABLE8 = [38, -127], FIELD8 = [-62, -141], LAW8 = [-23, -133];
const FIVE8 = ['reuben', 'judah', 'levi', 'asher', 'benjamin2'];
const PHAR8 = () => [-30, hAt(-30, -177) + 2, -177.2];
const bros10 = () => BRO.filter(id => id !== 'simeon').concat(['benjamin2']);
const spawn8 = (id, o) => { const G = Gm(); if (!G.npc(id)) G.spawnNPC(Object.assign({ id, noTalk: true, noTag: true, noBond: true }, o)); return G.npc(id); };
const kill8 = re => { const G = Gm(); for (const id of Object.keys(G.ENT.npcs)) if (re.test(id)) { G.npcFollow(id, false); G.removeNPC(id); } };
const near8 = (x, z, r) => Gm().dist(x, z) < r;

// ------------------------------------------------------------------ 7장 · 첫째 마디 · 다시 내려옴 (43:15–25)
const S8 = {};
S8.g3_return = { ch: 8, obj: S => { const c = C8(S), n = Object.keys(c.tb || {}).length; return !c.met ? '성읍 곳간 앞 · 다시 온 형들' : n < 3 ? `잔칫방 · 상 셋을 따로 차리기 (${n}/3)` : '정오 · 형들을 맞기 (앞마당)'; },
  list: S => { const c = C8(S), t = c.tb || {}; return [{ t: '곳간 앞에서 형들을 보기', ok: !!c.met }].concat(['j', 'h', 'e'].map(k => ({ t: TAB8[k].n + ' 놓기', ok: !!t[k] }))).concat([{ t: '정오 · 형들을 맞기', ok: !!c.noonGo }]); },
  enter(S, G, re) { ageBrothers(); stage8(S, true); if (!re && !C8(S).met) narr([{ kick: '창세기 43:15', title: '다시 애굽으로', t: '그 사람들이 예물을 마련하고 갑절의 돈을 자기들의 손에 가지고 베냐민을 데리고 일어나 애굽에 내려가서 요셉 앞에 서니라.', ref: '창세기 43:15' }]); },
  target: S => { const c = C8(S); if (!c.met) return { x: G7GRAN[0], z: G7GRAN[1] - 1.6 }; const t = c.tb || {}; if (Object.keys(t).length < 3) { const k = S.q.c8carry; return k && TAB8[k] ? { x: TAB8[k].x, z: TAB8[k].z - 0.9 } : { x: STACK8[0], z: STACK8[1] }; } return { x: HX8, z: HZ8 + 2.4 }; },
  check: S => !!C8(S).noonGo, next: 'g3_feast' };
function cine8Return(S, G) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz), dx = HX8, dz = HZ8 - 5.2, dh = hAt(dx, dz); C8(S).met = 1;
  cine([
    { hour: 9, fn: () => { G.teleport(gx, gz - 1.6, 0); showAt('steward2', gx + 1.8, gz - 1.4, -0.8); }, cam: [gx + 6, gh + 2.4, gz + 10], look: [gx, gh + 1.2, gz + 3.6], dur: 6, music: 'j_finale', t: '요셉은 베냐민이 그들과 함께 있음을 보고', ref: '창세기 43:16' },
    { cam: [gx + 1.2, gh + 1.7, gz - 0.2], look: [gx, gh + 1.6, gz - 1.6], dur: 8, fov: 0.55, n: '요셉', t: '이 사람들을 집으로 인도해 들이고 짐승을 잡고 준비하라. 이 사람들이 오정에 나와 함께 먹을 것이니라.', ref: '창세기 43:16' },
    { fn: () => { bros10().forEach((id, i) => showAt(id, dx - 6 + (i % 6) * 2.2, dz + 3 + Math.floor(i / 6) * 1.6, Math.PI)); showAt('steward2', dx, dz + 0.6, 0); },
      cam: [dx + 7, dh + 2.6, dz + 9], look: [dx, dh + 1.2, dz + 2], dur: 7, fadeIn: 0.8, t: '그 사람이 요셉의 명대로 하여 그 사람들을 요셉의 집으로 인도하니, 그 사람들이 요셉의 집으로 인도되매 두려워하여 이르되', ref: '창세기 43:17–18' },
    { cam: [dx - 2.4, dh + 1.5, dz + 6.4], look: [dx - 1, dh + 1.3, dz + 3.4], dur: 8, n: '형들', t: '전번에 우리 자루에 들어 있던 돈의 일로 우리가 끌려 드는도다. 이는 틈을 타서 우리에게 달려들어 우리를 잡아 노예를 삼고 우리 나귀를 빼앗으려 함이로다.', ref: '창세기 43:18', e: 'fear' },
    { cam: [dx + 1.6, dh + 1.5, dz + 5.6], look: [dx, dh + 1.4, dz + 3], dur: 9, n: '형들', t: '내 주여, 우리가 전번에 내려와서 양식을 사가지고 여관에 이르러 자루를 푼즉 각 사람의 돈이 그 자루 아구에 있고 그 중수가 여전하기로 우리 손에 도로 가져왔고, 양식 살 다른 돈도 우리 손에 가지고 내려왔나이다. 우리의 돈을 누가 우리 자루에 넣었는지 우리가 알지 못하나이다.', ref: '창세기 43:20–22', e: 'fear' },
    { cam: [dx + 1.2, dh + 1.6, dz + 2.4], look: [dx, dh + 1.5, dz + 0.6], dur: 9, n: '요셉의 청지기', t: '너희는 안심하라, 두려워 말라. 너희 하나님, 너희 아버지의 하나님이 재물을 너희 자루에 넣어 너희에게 주신 것이니라. 너희 돈은 내가 이미 받았느니라.', ref: '창세기 43:23', e: 'calm' },
    { fn: () => { showAt('simeon', dx + 12, dz + 1.6, -1.57); walkTo('simeon', dx + 7.6, dz + 3.4, 1.1); }, cam: [dx + 1, dh + 1.9, dz + 9.4], look: [dx + 6.4, dh + 1.1, dz + 2.8], dur: 8, t: '하고 시므온을 그들에게로 이끌어내고', ref: '창세기 43:23' },
    { fn: () => { bros10().concat(['simeon']).forEach(id => { const n = G.npc(id); if (n) { n.walk = null; n.sit = true; } }); }, cam: [dx + 5, dh + 2, dz + 7.4], look: [dx, dh + 0.7, dz + 3], dur: 8, t: '그들을 요셉의 집으로 인도하고 물을 주어 발을 씻기며 그 나귀에게 먹이를 주더라.', ref: '창세기 43:24' },
    { cam: [dx - 4, dh + 2.4, dz + 8], look: [dx, dh + 1, dz + 1], dur: 7, fadeOut: 1.2, t: '그들이 거기서 먹겠다 함을 들었으므로 예물을 정돈하고 요셉이 정오에 오기를 기다리더니', ref: '창세기 43:25' },
  ], () => { hide(BRO11); showAt('steward2', 15, -138.6, -0.6); G.teleport(STACK8[0] - 1.6, STACK8[1] + 3, Math.PI); GG.UI.quest(); setTimeout(() => GG.UI.toast('정오 전에 · 앞마당에 상 셋을 따로 차려요 (창세기 43:32)', true), 600); });
}

// ------------------------------------------------------------------ 7장 · 둘째 마디 · 정오의 잔치 (43:26–34)
S8.g3_feast = { ch: 8, obj: S => { const c = C8(S); return !c.wept ? '울 곳을 찾아 · 안방으로' : !c.washed ? '안방 대야에서 얼굴 씻기' : !c.serve ? '앞마당으로 나가 「음식을 차리라」' : !c.seated ? '형들을 나이 차례로 앉히기' : '요셉의 상에서 몫 보내기'; },
  list: S => { const c = C8(S); return [{ t: '안방에서 울기', ok: !!c.wept }, { t: '얼굴 씻기', ok: !!c.washed }, { t: '「음식을 차리라」', ok: !!c.serve }, { t: '나이 차례로 앉히기', ok: !!c.seated }, { t: '몫 보내기 (베냐민은 다섯 배)', ok: !!c.portion }]; },
  enter(S, G, re) { const c = C8(S); if (Object.keys(c.tb || {}).length < 3) c.tb = { j: 1, h: 1, e: 1 }; /* (an old save: the tables stand ready) */ S.q.broShow = 1; S.q.famShow = 1; ageBrothers(); if (!c.noon) cine8Noon(S, G); else stage8(S, true); },
  target: S => { const c = C8(S); if (!c.wept) return { x: ROOM8[0] - 0.6, z: ROOM8[1] + 0.3 }; if (!c.washed) return { x: ROOM8[0] + 0.4, z: ROOM8[1] - 0.2 }; if (!c.serve) return { x: HX8, z: HZ8 + 2.6 }; if (!c.seated) return { x: HX8, z: HZ8 + 5 }; return { x: TAB8.j.x, z: TAB8.j.z - 0.9 }; },
  check: S => !!C8(S).portion, done(S, G, next) { cinMarvel(S, G, next); }, next: 'g4_cup' };
function bros8Wait() { const G = Gm(); BRO11.forEach((id, i) => { const k = WAIT8[i], n = showAt(id, HX8 - 6 + k * 1.2 + (k % 2) * 0.3, HZ8 + 9.4 + (k % 3) * 0.5, Math.PI); if (n) { n.sit = false; n.act = null; } }); }
function seatAll8() { BRO11.forEach((id, i) => { const [x, z] = SEAT8(i); showAt(id, x, z, Math.PI, { sit: true }); }); }
function cine8Noon(S, G) { const c = C8(S), hh = hAt(HX8, HZ8 + 4); c.noon = 1;
  cine([
    { hour: 12, fn: () => { G.teleport(HX8, HZ8 + 1.4, 0); bros8Wait(); BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'prostrate', t: -i * 0.1, dur: 8, amb: true }; }); }, cam: [HX8 + 7, hh + 2.8, HZ8 + 15], look: [HX8, hh + 1, HZ8 + 7], dur: 8, music: 'j_finale', t: '요셉이 집으로 오매 그들이 집으로 가지고 들어온 예물을 그 앞에 드리고 땅에 엎드려 절하니', ref: '창세기 43:26' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }), cam: [HX8 + 1.6, hh + 1.6, HZ8 + 3.4], look: [HX8, hh + 1.5, HZ8 + 1.4], dur: 7, fov: 0.55, n: '요셉', t: '너희 아비 너희가 말하던 그 노인이 안녕하시냐? 지금까지 생존하였느냐?', ref: '창세기 43:27' },
    { cam: [HX8 - 3, hh + 1.6, HZ8 + 6], look: [HX8 - 1, hh + 1.2, HZ8 + 9.6], dur: 7, n: '형들', t: '주의 종 우리 아비가 평안하고 지금까지 생존하였나이다.', ref: '창세기 43:28' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'bow', t: -i * 0.08, dur: 3 }; }), cam: [HX8 + 4, hh + 2, HZ8 + 6], look: [HX8, hh + 0.9, HZ8 + 9.6], dur: 5, t: '하고 머리 숙여 절하더라.', ref: '창세기 43:28' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) b.face = Math.atan2(G.P.x - b.x, G.P.z - b.z); }, at: () => { const b = G.npc('benjamin2'); return b ? { look: [b.x, hAt(b.x, b.z) + 1.5, b.z], cam: [b.x - Math.sin(b.face) * -2.2 + 0.6, hAt(b.x, b.z) + 1.6, b.z + Math.cos(b.face) * 2.2] } : null; }, cam: [HX8 + 2, hh + 1.6, HZ8 + 7.4], look: [HX8 + 2, hh + 1.5, HZ8 + 9.6], dur: 9,
      n: '요셉', t: '너희가 내게 말하던 너희 작은 동생이 이냐? …소자여, 하나님이 네게 은혜 베푸시기를 원하노라.', ref: '창세기 43:29', e: 'tender' },
    { fn: () => cpose('weep', 5), cam: [HX8 + 1, hh + 1.6, HZ8 + 2.6], look: [HX8, hh + 1.5, HZ8 + 1.4], dur: 6, fov: 0.5, t: '요셉이 아우를 인하여 마음이 타는 듯하므로 급히 울 곳을 찾아', ref: '창세기 43:30' },
  ], () => { cpose(null); GG.UI.quest(); });
}
function weep8(S, G) { const [rx, rz] = ROOM8, h = hAt(rx, rz); G.teleport(rx - 0.4, rz + 0.2, Math.PI / 2);
  cine([{ fn: () => cpose('weep', 9), cam: [rx - 3.6, h + 1.5, rz + 0.8], cam2: [rx - 3, h + 1.5, rz + 0.6], look: [rx - 0.2, h + 1.2, rz + 0.1], dur: 8, music: 'j_mourn', t: '안방으로 들어가서 울고', ref: '창세기 43:30' }], () => { cpose(null); C8(S).wept = 1; GG.UI.quest(); }); }
function wash8(S, G) { const [rx, rz] = ROOM8, h = hAt(rx, rz); act('pick', 1.4); G.sfx('splash', { vol: 0.6 }); G.FX.burst(rx + 0.8, h + 0.95, rz, 16, { c: [0.6, 0.78, 0.92], sp: 0.7, up: 1, size: 0.05, g: 6, life: 0.6 });
  setTimeout(() => say([T('얼굴을 씻고 나와서 그 정을 억제하고', '창세기 43:31')], () => { C8(S).washed = 1; GG.UI.quest(); }), 900); }
function serve8(S, G) { const hh = hAt(HX8, HZ8 + 4); cine([{ fn: () => { G.teleport(HX8, HZ8 + 2.6, 0); C8(S).serve = 1; }, cam: [HX8 + 1.5, hh + 1.7, HZ8 + 4.2], look: [HX8, hh + 1.6, HZ8 + 2.6], dur: 5, fov: 0.55, n: '요셉', t: '음식을 차리라.', ref: '창세기 43:31' },
  { cam: [HX8 + 9, hh + 3.4, HZ8 + 13], look: [HX8, hh + 0.5, HZ8 + 5], dur: 6, t: '종들이 상 셋에 음식을 차렸어요.' }], () => GG.UI.quest()); }
const GROUP8 = [[['reuben', 'simeon', 'levi', 'judah'], '레아의 네 아들 · 르우벤 · 시므온 · 레위 · 유다'], [['dan', 'naphtali'], '빌하의 두 아들 · 단 · 납달리'], [['gad', 'asher'], '실바의 두 아들 · 갓 · 아셀'], [['issachar', 'zebulun'], '레아의 두 아들 · 잇사갈 · 스불론'], [['benjamin2'], '라헬의 아들 · 베냐민']];
function seat8(S, G) { const c = C8(S); let k = 0, seat = 0; const head = s => s.split(' · ')[0];
  const sitGroup = ids => ids.forEach(id => { const [x, z] = SEAT8(seat++); walkTo(id, x, z, 1.5, n => { n.sit = true; n.face = n.homeFace = Math.PI; }); });
  const ask = () => { if (k >= GROUP8.length) { c.seated = 1; GG.UI.quest(); setTimeout(() => say([T('그들이 요셉의 앞에 앉되 그 장유의 차서대로 앉히운바 되니 그들이 서로 이상히 여겼더라.', '창세기 43:33')], () => G.checkStep()), 1400); return; }
    if (k === GROUP8.length - 1) { say([T('마지막 자리에는 라헬의 아들, 막내 베냐민이 앉아요.')], () => { sitGroup(GROUP8[k][0]); k++; setTimeout(ask, 1500); }); return; } /* (one group left: no one-button question) */
    const right = GROUP8[k], opts = GROUP8.slice(k).map((g, i) => i === 0 ? { t: g[1], then: () => { sitGroup(g[0]); G.sfx('coin', { pitch: 1 + k * 0.05 }); k++; setTimeout(ask, 1500); } } : { t: g[1], ok: false, fb: `${head(g[1])}보다 ${head(right[1])}이 먼저 태어났어요.` }).sort(() => Math.random() - 0.5);
    say([{ n: '', t: k === 0 ? '맏아들 쪽 자리부터 · 누구를 먼저 앉힐까요?' : `다음 자리에는? (${k + 1}/5)`, choices: opts }], null); };
  say([T('앞에서부터 나이 차례로 앉혀요. 어머니별로 함께 태어난 형제들을 한 무리로 앉혀요.')], ask); }

function cinMarvel(S, G, next) { /* v18.79 (redeclared): 43:33 was just read at the seating, so the scene shows the three tables (43:32) and the portions (43:34) */ const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => { BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })); G.teleport(hx, hz + 3.4, 0); cpose('sitg', 40, true); showAt('steward2', hx + 8, hz + 4.6, -Math.PI / 2, { sit: true, act: 'eat' }); },
      cam: [hx - 9, hh + 3.2, hz + 2.6], look: [hx + 1, hh + 0.8, hz + 5.4], dur: 9, music: 'j_finale',
      t: '그들이 요셉에게 따로 하고 그 형제들에게 따로 하고 배식하는 애굽 사람에게도 따로 하니 애굽 사람은 히브리 사람과 같이 먹으면 부정을 입음이었더라.', ref: '창세기 43:32' },
    { cam: [hx + 6.6, hh + 1.3, hz + 5], look: [hx + 6, hh + 0.9, hz + 7], dur: 8, t: '요셉이 자기 식물로 그들에게 주되 베냐민에게는 다른 사람보다 오배나 주매, 그들이 마시며 요셉과 함께 즐거워하였더라.', ref: '창세기 43:34' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.act = null; } }); { const st = G.npc('steward2'); if (st) { st.sit = false; st.act = null; } } next && next(); });
}

// ------------------------------------------------------------------ 7장 · 셋째 마디 · 은잔 (44:1–17)
S8.g4_cup = { ch: 8, obj: S => !C8(S).cupCmd ? '청지기에게 이르기 (창세기 44:1–2)' : '밤이 지나고 · 새벽', target: 'npc:steward2',
  enter(S, G, re) { stage8(S, true); },
  talk: { steward2(S, G) { const c = C8(S); if (c.cupCmd) return false; say([J('양식을 각인의 자루에 운반할 수 있을 만큼 채우고 각인의 돈을 그 자루 아구에 넣고, 또 나의 잔 곧 은잔을 그 소년의 자루 아구에 넣고 그 양식 값 돈도 함께 넣으라.', '창세기 44:1–2')], () => { c.cupCmd = 1; GG.UI.quest(); cine8Night(S, G); }); } },
  check: S => !!C8(S).dawn, done(S, G, next) { cinCup8(S, G, () => cinPlea(S, G, next)); }, next: 'g5_reveal' };
function cine8Night(S, G) { const sx = HX8, sz = HZ8 - 3.6, h = hAt(sx, sz);
  cine([{ hour: 22, fn: () => { place('steward2', sx - 0.4, sz + 0.6, -1.57, { act: 'gather', vis: true }); G.teleport(HX8 + 8, HZ8 + 6, -2.4); }, cam: [sx - 8.4, h + 2.3, sz + 5.4], look: [sx - 3, h + 0.5, sz + 0.2], dur: 8, music: 'j_mourn', t: '그가 요셉의 명대로 하고', ref: '창세기 44:2' }],
    () => { const n = G.npc('steward2'); if (n) n.act = null; C8(S).dawn = 1; G.checkStep(); }); }
function cinCup8(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), hh = hAt(HX8, HZ8 + 4), gp = (x, dy, z) => [x, hAt(x, z) + dy, z]; /* (the road is on a slope: every lens stands on its own ground) */
  cine([
    { hour: 6, fn: () => { BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 4, cz + Math.floor(i / 6) * 1.8, 0.6)); hide(['steward2']); }, cam: gp(cx + 8, 3, cz - 8), look: gp(cx, 1.2, cz), dur: 6, music: 'j_mourn', t: '아침 밝을 때에 사람들과 그 나귀들을 보내니라.', ref: '창세기 44:3' },
    { fn: () => { G.teleport(HX8, HZ8 - 1, 0); showAt('steward2', HX8 + 1.2, HZ8 + 0.6, -2.4); }, cam: [HX8 + 2.2, hh + 1.6, HZ8 + 2.4], look: [HX8 + 0.4, hh + 1.5, HZ8 - 0.4], dur: 6, fadeIn: 0.6, t: '그들이 성에서 나가 멀리 가기 전에 요셉이 청지기에게 이르되', ref: '창세기 44:4' },
    { cam: [HX8 + 1.4, hh + 1.7, HZ8 + 0.6], look: [HX8, hh + 1.6, HZ8 - 1], dur: 10, fov: 0.55, n: '요셉', t: '일어나 그 사람들을 따라 미쳐서 그들에게 이르기를, 너희가 어찌하여 선을 악으로 갚느냐? 이는 내 주인이 가지고 마시며 늘 점치는 데 쓰는 것이 아니냐? 너희가 이같이 하니 악하도다 하라.', ref: '창세기 44:4–5' },
    { fn: () => showAt('steward2', cx - 3, cz - 4, 0.4), cam: gp(cx - 7, 2.4, cz - 8), look: gp(cx - 1, 1.2, cz), dur: 6, fadeIn: 0.6, t: '청지기가 그들에게 미쳐서 그대로 말하니', ref: '창세기 44:6' },
    { cam: gp(cx - 4.6, 1.7, cz - 4.8), look: gp(cx - 1, 1.3, cz + 0.6), dur: 10, n: '형들', t: '내 주여, 어찌 이렇게 말씀하시나이까? 당신의 종들이 이런 일은 결단코 아니하나이다. … 당신의 종 중 누구에게서 발견되든지 그는 죽을 것이요, 우리는 내 주의 종이 되리이다.', ref: '창세기 44:7–9', e: 'fear' },
    { cam: gp(cx - 1.2, 1.7, cz - 1.4), look: gp(cx - 3, 1.5, cz - 4), dur: 7, n: '요셉의 청지기', t: '그러면 너희 말과 같이 하리라. 그것이 발견되는 자는 내 종이 될 것이요, 너희는 무죄하리라.', ref: '창세기 44:10' },
    { fn: () => { const n = G.npc('benjamin2'); if (n) n.act = 'kneelRest'; }, at: () => { const b = G.npc('benjamin2'); return b ? { look: [b.x, hAt(b.x, b.z) + 0.7, b.z], cam: gp(b.x + 2.4, 1.5, b.z - 2) } : null; }, cam: gp(cx + 4.4, 1.4, cz + 3.2), look: gp(cx + 2.4, 0.8, cz + 1.8), dur: 8, t: '그들이 각각 급히 자루를 땅에 내려놓고 각기 푸니, 그가 나이 많은 자에게서부터 시작하여 나이 적은 자에게까지 수탐하매 잔이 베냐민의 자루에서 발견된지라.', ref: '창세기 44:11–12' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'weep', t: -i * 0.1, dur: 9, amb: true }; } }), cam: gp(cx - 3, 2.2, cz + 5), look: gp(cx, 1, cz + 0.6), dur: 6, t: '그들이 옷을 찢고 각기 짐을 나귀에 싣고 성으로 돌아오니라.', ref: '창세기 44:13' },
    { fn: () => { G.teleport(HX8, HZ8 + 1.2, 0); hide(['steward2']); BRO11.forEach((id, i) => { const n = showAt(id, HX8 - 5 + (i % 6) * 2, HZ8 + 5 + Math.floor(i / 6) * 1.6, Math.PI); if (n) n.emote = { k: 'prostrate', t: -i * 0.08, dur: 14, amb: true }; }); },
      cam: [HX8 + 5, hh + 2.4, HZ8 + 9], look: [HX8, hh + 0.6, HZ8 + 5], dur: 7, fadeIn: 0.8, t: '유다와 그 형제들이 요셉의 집에 이르니 요셉이 오히려 그곳에 있는지라. 그 앞 땅에 엎드리니', ref: '창세기 44:14' },
    { cam: [HX8 + 1.2, hh + 1.7, HZ8 + 2.6], look: [HX8, hh + 1.6, HZ8 + 1.2], dur: 7, fov: 0.55, n: '요셉', t: '너희가 어찌하여 이렇게 행하였느냐? 나 같은 사람이 점칠 줄을 너희가 알지 못하였느냐?', ref: '창세기 44:15', e: 'cold' },
    { cam: [HX8 + 1.6, hh + 1.2, HZ8 + 4], look: [HX8 + 0.4, hh + 0.8, HZ8 + 3.2], dur: 10, n: '유다', t: '우리가 내 주께 무슨 말을 하오며 무슨 설명을 하오며 어떻게 우리의 정직함을 나타내리이까? 하나님이 종들의 죄악을 적발하셨으니 우리와 이 잔이 발견된 자가 다 내 주의 노예가 되겠나이다.', ref: '창세기 44:16', e: 'cry' },
    { cam: [HX8 - 1.2, hh + 1.7, HZ8 + 2.6], look: [HX8, hh + 1.6, HZ8 + 1.2], dur: 9, fov: 0.55, n: '요셉', t: '내가 결단코 그리하지 아니하리라. 잔이 그 손에서 발견된 자만 내 종이 되고, 너희는 평안히 너희 아비에게로 도로 올라갈 것이니라.', ref: '창세기 44:17', e: 'cold' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }); next && next(); });
}

// ------------------------------------------------------------------ 7장 · 넷째 마디 · 「나는 요셉이라」 (45:1–15) · redeclared: 45:9–13 added
function cinIAmJoseph(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  const jHead = () => { const P = GG.Game.P, w = P.rig && P.rig.world && GG.HBI && P.rig.world[GG.HBI.head]; return w && isFinite(w[13]) && Math.hypot(w[12] - P.x, w[14] - P.z) < 1.5 ? [w[12], w[13] + 0.08, w[14]] : [P.x, P.y + 1.5, P.z]; };
  const onJ = (dx, dy, dz) => () => { const h = jHead(); return { look: h, cam: [h[0] + dx, h[1] + dy, h[2] + dz] }; };
  cine([
    { fn: () => { G.teleport(hx, hz, 0); cpose('weep', 10); hide(['asenath', 'steward2']); BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); }, cam: [hx + 2, hh + 1.6, hz - 1.8], look: [hx, hh + 1.5, hz + 0.6], dur: 8, music: 'j_finale',
      t: '요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리질러 「모든 사람을 자기에게서 물러가라」 하고, 그 형제에게 자기를 알리니 때에 그와 함께한 자가 없었더라. 요셉이 방성대곡하니 애굽 사람에게 들리며 바로의 궁중에 들리더라.', ref: '창세기 45:1–2' },
    { at: onJ(1.22, 0.05, 1.46), cam: [hx + 1, hh + 1.7, hz + 1.2], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.48, n: '요셉', t: '나는 요셉이라. 내 아버지께서 아직 살아 계시니이까?', ref: '창세기 45:3', e: 'cry' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.act = 'kneelRest'; }), cam: [hx - 3, hh + 1.8, hz + 1], look: [hx - 1, hh + 1, hz + 4.5], dur: 6, t: '형들이 그 앞에서 놀라서 능히 대답하지 못하는지라.', ref: '창세기 45:3' },
    { at: onJ(1.40, 0.05, 1.60), cam: [hx + 1.4, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '나는 당신들의 아우 요셉이니 당신들이 애굽에 판 자라. 당신들이 나를 이곳에 팔았으므로 근심하지 마소서. 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들 앞서 보내셨나이다.', ref: '창세기 45:4–5', e: 'cry' },
    { at: onJ(-1.20, 0.05, 1.80), cam: [hx - 1.2, hh + 1.6, hz + 1.8], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '그런즉 나를 이리로 보낸 자는 당신들이 아니요 하나님이시라. 하나님이 나로 바로의 아비를 삼으시며 그 온 집의 주를 삼으시며 애굽 온 땅의 치리자를 삼으셨나이다.', ref: '창세기 45:8', e: 'tender' },
    { at: onJ(1.0, 0.1, 1.7), cam: [hx + 1, hh + 1.6, hz + 1.7], look: [hx, hh + 1.6, hz], dur: 11, n: '요셉', t: '당신들은 속히 아버지께로 올라가서 고하기를, 아버지의 아들 요셉의 말에 하나님이 나를 애굽 전국의 주로 세우셨으니 지체 말고 내게로 내려오사 아버지와 아버지의 아들들과 아버지의 손자들과 아버지의 양과 소와 모든 소유가 고센 땅에 머물며 나와 가깝게 하소서.', ref: '창세기 45:9–10', e: 'tender' },
    { at: onJ(-1.1, 0.1, 1.6), cam: [hx - 1.1, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '흉년이 아직 다섯 해가 있으니 내가 거기서 아버지를 봉양하리이다. 아버지와 아버지의 가족과 아버지께 속한 모든 사람에게 부족함이 없도록 하리이다 하더라 하소서.', ref: '창세기 45:11', e: 'tender' },
    { at: onJ(1.3, 0.1, 1.3), cam: [hx + 1.3, hh + 1.6, hz + 1.3], look: [hx, hh + 1.6, hz], dur: 10, n: '요셉', t: '당신들의 눈과 내 아우 베냐민의 눈이 보는 바 당신들에게 이렇게 말하는 것은 내 입이라. 당신들은 내가 애굽에서 받는 영화와 당신들이 본 모든 것을 내 아버지께 고하고 속히 모시고 내려오소서.', ref: '창세기 45:12–13', e: 'happy' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) { b.act = null; G.npcTo('benjamin2', hx + 0.5, hz + 0.9, Math.PI, false); b.emote = { k: 'weep', t: 0, dur: 22, amb: true }; } }, cam: [hx + 2.6, hh + 1.5, hz + 0.4], look: [hx + 0.2, hh + 1.4, hz + 0.5], dur: 8,
      t: '자기 아우 베냐민의 목을 안고 우니 베냐민도 요셉의 목을 안고 우니라. 요셉이 또 형들과 입맞추며 안고 우니 형들이 그제야 요셉과 말하니라.', ref: '창세기 45:14–15' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next && next(); });
}

// ------------------------------------------------------------------ 8장 · 첫째 마디 · 바로의 명령과 수레 (45:16–24)
S8.g6_palace = { ch: 9, obj: '바로의 궁으로 · 바로 앞에 서기', target: { x: COURT8[0], z: COURT8[1] + 2 },
  enter(S, G, re) { S.q.broShow = 0; S.q.famShow = 0; BRO11.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); { const a = G.npc('asenath'); if (a) a.forceVis = undefined; } showAt('steward2', 15, -138.6, -0.6); /* (he was sent out for 45:1) */ if (!re) narr([{ kick: '창세기 45:16', title: '바로의 궁에 들린 소문', t: '요셉의 형들이 왔다는 소문이 바로의 궁에 들리매 바로와 그 신하들이 기뻐하고', ref: '창세기 45:16' }]); },
  check: S => !!C8(S).order, next: 'g6_wagons' };
function cine8Command(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); C8(S).orderGo = 1;
  cine([
    { fn: () => { G.teleport(cx + 1.6, cz - 2, Math.PI); }, cam: [cx + 5, ch + 3, cz + 4], look: [cx, ch + 1.6, cz - 8], dur: 6, music: 'j_finale', t: '바로는 요셉에게 이르되', ref: '창세기 45:17' },
    { cam: [cx - 2, ch + 2.4, cz - 2.4], look: PHAR8(), dur: 10, n: '바로', t: '너의 형들에게 명하기를, 너희는 이렇게 하여 너희 짐승에 싣고 가서 가나안 땅에 이르거든 너희 아비와 너희 가속을 이끌고 내게로 오라. 내가 너희에게 애굽의 좋은 땅을 주리니 너희가 나라의 기름진 것을 먹으리라 하라.', ref: '창세기 45:17–18' },
    { cam: [cx + 2, ch + 2.2, cz - 3], look: PHAR8(), dur: 10, n: '바로', t: '이제 명을 받았으니 이렇게 하라. 너희는 애굽 땅에서 수레를 가져다가 너희 자녀와 아내를 태우고 너희 아비를 데려오라. 또 너희의 기구를 아끼지 말라. 온 애굽 땅의 좋은 것이 너희 것임이니라.', ref: '창세기 45:19–20' },
  ], () => { C8(S).order = 1; G.checkStep(); });
}
S8.g6_wagons = { ch: 9, obj: S => { const c = C8(S); return !c.pull ? '왕의 수레 곳간 · 수레 끌어내기' : !c.yoke ? '수레에 소의 멍에 메우기' : !c.robe ? '앞마당 · 형들에게 옷 한 벌씩 주기' : !c.benj ? '베냐민에게 은 삼백과 옷 다섯 벌' : !c.line ? '나귀 스무 필 · 줄을 따라 걸으며 짐 살피기' : '형들을 떠나보내기'; },
  list: S => { const c = C8(S); return [{ t: '수레 끌어내기', ok: !!c.pull }, { t: '소에 멍에 메우기', ok: !!c.yoke }, { t: '형들에게 옷 한 벌씩', ok: !!c.robe }, { t: '베냐민에게 은 삼백과 옷 다섯 벌', ok: !!c.benj }, { t: '나귀 스무 필의 짐 살피기', ok: !!c.line }, { t: '「노중에서 다투지 말라」', ok: !!c.sent }]; },
  enter(S, G, re) { ageBrothers(); stage8(S, true); if (!re) GG.UI.toast('요셉이 바로의 명대로 형들에게 수레를 주고 길 양식을 주어요 (창세기 45:21)', true); },
  target: S => { const c = C8(S); if (!c.pull) return { x: (WAG8[0][0] + WAG8[1][0]) / 2, z: WAG8[0][1] - 2.4 }; if (!c.yoke) return { x: OXT8[0], z: OXT8[1] - 1.6 }; if (!c.robe) return { x: HX8, z: HZ8 + 5 }; if (!c.benj) return 'npc:benjamin2'; if (!c.line) return c.lineOn ? { x: LINE8.x1 + 1, z: LINE8.z - 2 } : { x: LINE8.x0 - 1.5, z: LINE8.z - 2 }; return { x: LINE8.x0 - 2.5, z: LINE8.z - 1 }; },
  check: S => !!C8(S).sent, done(S, G, next) { kill8(/^(ox8|don8_|scribe8)/); next(); }, next: 'g7_goshen' };
const NEWROBE8 = { top: 0xeee6d2, trim: 0x2f6f8f, under: 0xf4efe2 };
function robes8(S, G) { const ids = bros10().concat(['simeon']).filter((id, i, a) => a.indexOf(id) === i && id !== 'benjamin2'), hh = hAt(HX8, HZ8 + 6);
  cine([{ fn: () => { G.teleport(HX8, HZ8 + 3.4, 0); }, cam: [HX8 + 6, hh + 2.2, HZ8 + 1.4], look: [HX8, hh + 1.1, HZ8 + 7.6], dur: 9, music: 'j_finale', t: '그들에게 다 각기 옷 한 벌씩 주되', ref: '창세기 45:22',
    each: t => { const k = Math.floor(t / 0.75); ids.forEach((id, i) => { const n = G.npc(id); if (!n || i > k || n._robe8) return; n._robe8 = 1; npcSet(id, { look: Object.assign({}, n.d.look, NEWROBE8) }); n.emote = { k: 'bow', t: 0, dur: 1.6 }; G.sfx('cloth', { vol: 0.4 }); }); } }],
    () => { ids.forEach(id => { const n = G.npc(id); if (n && !n._robe8) { n._robe8 = 1; npcSet(id, { look: Object.assign({}, n.d.look, NEWROBE8) }); } }); C8(S).robe = 1; GG.UI.quest(); }); }
function benj8(S, G) { const b = G.npc('benjamin2'); if (!b) { C8(S).benj = 1; return; } const h = hAt(b.x, b.z);
  cine([{ fn: () => { act('pick', 1.2); }, cam: [b.x + 1.8, h + 1.6, b.z - 1.6], look: [b.x, h + 1.3, b.z], dur: 8, t: '베냐민에게는 은 삼백과 옷 다섯 벌을 주고', ref: '창세기 45:22',
    each: t => { if (t > 1.5 && !b._robe8) { b._robe8 = 1; npcSet('benjamin2', { look: Object.assign({}, b.d.look, NEWROBE8, { trim: 0x8a2a5a }) }); G.sfx('coins'); G.FX.burst(b.x, h + 1.1, b.z, 22, { c: [0.92, 0.92, 0.95], sp: 1, up: 1.2 }); } } }],
    () => { C8(S).benj = 1; GG.UI.quest(); }); }
function sendOff8(S, G) { const x0 = LINE8.x0 - 3, z0 = LINE8.z, h0 = hAt(x0, z0), hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 7, fn: () => { G.teleport(x0 - 1.6, z0 - 2.4, 0.6); bros10().concat(['simeon']).forEach((id, i) => showAt(id, x0 + (i % 6) * 1.4, z0 - 1.2 + Math.floor(i / 6) * 1.4, -2.6)); }, cam: [x0 + 5, h0 + 2.4, z0 - 6], look: [x0, h0 + 1.2, z0], dur: 6, music: 'j_finale', t: '이에 형들을 돌려보내며 떠날 때에 그들에게 이르되', ref: '창세기 45:24' },
    { cam: [x0 - 0.6, h0 + 1.7, z0 - 1.2], look: [x0 - 1.6, h0 + 1.6, z0 - 2.4], dur: 6, n: '요셉', t: '당신들은 노중에서 다투지 말라.', ref: '창세기 45:24', e: 'happy' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacob }); }, cam: [G7HEB[0] + 3, hh + 1.5, G7HEB[1] + 5.6], look: [G7HEB[0], hh + 1.4, G7HEB[1] + 2.6], dur: 8, fadeIn: 0.8,
      t: '그들이 애굽에서 올라와 가나안 땅에 들어가서 그 아비 야곱에게 이르러 고하여 가로되 「요셉이 지금까지 살아 있어 애굽 땅 총리가 되었더이다」 야곱이 그들을 믿지 아니하므로 기색하더니, 요셉의 자기를 태우려고 보낸 수레를 보고야 기운이 소생한지라.', ref: '창세기 45:25–27' },
    { cam: [G7HEB[0] + 1.2, hh + 1.6, G7HEB[1] + 4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, fov: 0.55, n: '야곱', t: '족하도다. 내 아들 요셉이 지금까지 살았으니 내가 죽기 전에 가서 그를 보리라.', ref: '창세기 45:28', e: 'cry' },
    { hour: 21, fn: () => { place('jacob', G7HEB[0] + 6, G7HEB[1] - 20, 0.3, { act: 'kneelRest' }); }, cam: [G7HEB[0] + 9, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.4, G7HEB[1] - 16], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.2, G7HEB[1] - 20], dur: 9, fadeIn: 1,
      t: '이스라엘이 모든 소유를 이끌고 발행하여 브엘세바에 이르러 그 아비 이삭의 하나님께 희생을 드리니, 밤에 하나님이 이상 중에 이스라엘에게 나타나시고', ref: '창세기 46:1–2' },
    { cam: [G7HEB[0] + 6.6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 3, G7HEB[1] - 17], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 12, G7HEB[1] - 24], dur: 9, fov: 1.1,
      t: '「나는 하나님이라 네 아비의 하나님이니 애굽으로 내려가기를 두려워 말라. 내가 거기서 너로 큰 민족을 이루게 하리라. 내가 너와 함께 애굽으로 내려가겠고 정녕 너를 인도하여 다시 올라올 것이며」', ref: '창세기 46:3–4' },
    { hour: 9, fn: () => { const n = G.npc('jacob'); if (n) n.act = null; const [tx, tz] = [G7HEB[0] - 20, G7HEB[1] - 46]; RT.wag8T = [tx, tz]; place('jacob', tx + 0.3, tz + 0.1, -2.2, { sit: true }); bros10().concat(['simeon']).forEach((id, i) => showAt(id, tx - 2 - (i % 4) * 1.6, tz - 1 - Math.floor(i / 4) * 1.8, -2.2)); },
      at: () => { const w = RT.wag8T; return w ? { look: [w[0] - 2, hAt(w[0], w[1]) + 1, w[1] - 1.5], cam: [w[0] + 7, hAt(w[0], w[1]) + 3, w[1] + 6] } : null; }, cam: [G7HEB[0] - 13, hh + 3, G7HEB[1] - 40], look: [G7HEB[0] - 22, hh + 1, G7HEB[1] - 47], dur: 9, fadeIn: 1,
      t: '이스라엘의 아들들이 바로가 그를 태우려고 보낸 수레에 그 아비 야곱과 그들의 처자들을 태우고, 그 가축과 가나안 땅에서 얻은 재물을 이끌었으며, 야곱과 그 자손들이 다 함께 애굽으로 갔더라.', ref: '창세기 46:5–7', fadeOut: 1 },
  ], () => { RT.wag8T = null; S.q.heb2 = 0; S.q.broShow = 0; S.q.famShow = 0; const n = G.npc('jacob'); if (n) { n.act = null; n.sit = false; } BRO11.forEach(id => { const n2 = G.npc(id); if (n2) n2.forceVis = undefined; });
    narr([{ kick: '창세기 46:8–27', title: '일흔 사람', t: '레아의 자손 서른세 명 · 실바의 자손 열여섯 명 · 라헬의 자손 열네 명 · 빌하의 자손 일곱 명. 야곱의 집 사람으로 애굽에 이른 자가 도합 칠십 명이었더라.', ref: '창세기 46:15–27' }], () => { C8(S).sent = 1; G.checkStep(); }); });
}

// ------------------------------------------------------------------ 8장 · 셋째 마디 · 고센에서 만남 (46:28–34)
const CART8 = { x: 23, z: -127.6, f: 1.3 };
S8.g7_goshen = { ch: 9, obj: S => { const c = C8(S); return S.q.chariotOk && !c.harness ? '버금 수레에 말 매기 (앞마당 동쪽)' : '수레를 몰고 고센으로 · 아버지 맞이하기'; },
  list: S => { const c = C8(S); return [{ t: '유다가 먼저 옴', ok: !!c.judah }, { t: '버금 수레에 말 매기', ok: !!c.harness || !S.q.chariotOk }, { t: '고센으로 가서 아버지 맞이하기', ok: false }]; },
  enter(S, G, re) { if (Gm().FEATS && Gm().FEATS.ride) Gm().unlockFeat('ride', true); const c = C8(S); if (S.q.chariotOk && !c.harness && !S.q.riding) S.q.cartAt = { x: CART8.x, z: CART8.z, f: CART8.f }; if (!c.judah) setTimeout(() => cine8Judah(S, Gm()), re ? 900 : 300); },
  target: S => { const c = C8(S); if (S.q.chariotOk && !c.harness) return { x: CART8.x + 1.6, z: CART8.z - 1.2 }; return { x: GOSHEN[0], z: GOSHEN[1] - 6 }; },
  check: S => (!!C8(S).harness || !S.q.chariotOk) && Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - (GOSHEN[1] - 6)) < 12,
  done(S, G, next) { cinReunion(S, G, next); }, next: 'g8_pharaoh' };
function cine8Judah(S, G) { if (GG.Cine.on || C8(S).judah) return; const jx = HX8 + 4, jz = HZ8 + 4, h = hAt(jx, jz); C8(S).judah = 1;
  cine([{ hour: 10, fn: () => { ageBrothers(); showAt('judah', jx + 14, jz + 10, -2.2); walkTo('judah', jx, jz, 1.8); G.teleport(HX8, HZ8 + 1, 0.4); }, cam: [jx - 4, h + 2.2, jz - 3], look: [jx + 6, h + 1.2, jz + 5], dur: 8, music: 'j_finale', t: '야곱이 유다를 요셉에게 미리 보내어 자기를 고센으로 인도하게 하고 다 고센 땅에 이르니', ref: '창세기 46:28' }],
    () => { hide(['judah']); GG.UI.quest(); if (S.q.chariotOk) GG.UI.toast('요셉이 그의 수레를 갖추고 · 앞마당 동쪽 버금 수레로 가요 (창세기 46:29)', true); }); }
function cinReunion(S, G, next) { /* v18.79 (redeclared): the Bible's words only (the seven made-up lines after 46:30 are gone) + 46:31–34 */ const [x0, z0] = GOSHEN, gh = GH();
  cine([
    { hour: 16, fn: () => { S.q.goshen = 1; S.q.broShow = 1; goshenCamp(S); BRO11.forEach((id, i) => showAt(id, x0 - 8 + (i % 6) * 2.4, z0 + 10 + Math.floor(i / 6) * 2, Math.PI)); place('jacob', x0, z0 + 6, Math.PI); npcSet('jacob', { look: LOOK.jacob }); G.teleport(x0, z0 - 6, 0); },
      cam: [x0 + 14, gh + 4, z0 - 6], cam2: [x0 + 10, gh + 3, z0 - 2], look: [x0, gh + 1.2, z0 + 4], dur: 8, music: 'j_finale', t: '요셉이 그의 수레를 갖추고 고센으로 올라가서 그의 아버지 이스라엘을 맞으며', ref: '창세기 46:29' },
    { fn: () => { G.teleport(x0, z0 + 4.8, 0); cpose('weep', 12); const j = G.npc('jacob'); if (j) j.emote = { k: 'weep', t: 0, dur: 12, amb: true }; }, cam: [x0 + 2.4, gh + 1.6, z0 + 5.6], look: [x0, gh + 1.5, z0 + 5.4], dur: 9, fov: 0.6,
      t: '그에게 보이고 그의 목을 어긋맞겨 안고 얼마 동안 울매', ref: '창세기 46:29' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 9, n: '야곱', t: '네가 지금까지 살아 있고 내가 네 얼굴을 보았으니 지금 죽어도 가하도다.', ref: '창세기 46:30', e: 'cry' },
    { fn: () => { cpose(null); const j = G.npc('jacob'); if (j) j.emote = null; G.teleport(x0 + 1.2, z0 + 4.4, -0.3); }, cam: [x0 + 4.6, gh + 1.8, z0 + 2.4], look: [x0 - 1, gh + 1.3, z0 + 8.6], dur: 6, t: '요셉이 그의 형들과 그의 아버지의 가속에게 이르되', ref: '창세기 46:31' },
    { cam: [x0 + 2.2, gh + 1.7, z0 + 5.8], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 11, n: '요셉', t: '내가 올라가서 바로에게 고하여 이르기를, 가나안 땅에 있던 내 형들과 내 아버지의 가속이 내게로 왔는데 그들은 목자라 목축하는 사람들이므로 그들의 양과 소와 모든 소유를 이끌고 왔나이다 하리니,', ref: '창세기 46:31–32' },
    { cam: [x0 - 0.2, gh + 1.7, z0 + 6.2], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 11, n: '요셉', t: '바로가 당신들을 불러서 「너희의 생업이 무엇이냐」 묻거든, 당신들은 이르기를 「주의 종들은 어렸을 때부터 지금까지 목축하는 자들이온데 우리와 우리 선조가 그러하니이다」 하소서.', ref: '창세기 46:33–34' },
    { cam: [x0 + 2.6, gh + 1.7, z0 + 3.2], look: [x0 + 1.2, gh + 1.6, z0 + 4.4], dur: 8, n: '요셉', t: '그리하면 당신들이 고센 땅에 거하게 되리이다. 애굽 사람은 다 목축을 가증히 여기나이다.', ref: '창세기 46:34' },
    { cam: [x0 + 18, gh + 9, z0 + 18], cam2: [x0 + 22, gh + 14, z0 + 22], look: [x0, gh + 1, z0 + 3], dur: 9, fadeOut: 1.2, t: '야곱의 집 사람으로 애굽에 이른 자의 도합이 칠십 명이었더라.', ref: '창세기 46:27' },
  ], () => { placeGoshen(S); G.teleport(x0 + 2, z0 - 4, 0); next && next(); });
}

// ------------------------------------------------------------------ 8장 · 넷째 마디 · 바로 앞에서 (47:1–10)
S8.g8_pharaoh = { ch: 9, obj: S => { const c = C8(S); return !c.five ? '요셉의 집 앞마당 · 형 다섯과 함께 바로의 궁으로' : !c.phar1 ? '형 다섯과 함께 바로 앞에 서기' : !c.walk ? '궁 문 밖 · 아버지를 모시기' : '아버지와 천천히 걸어 바로 앞으로'; },
  list: S => { const c = C8(S); return [{ t: '형 다섯과 함께 궁으로', ok: !!c.phar1 }, { t: '아버지를 모시고 바로 앞으로 (천천히)', ok: !!c.phar2 }]; },
  enter(S, G, re) { S.q.goshen = 1; ageBrothers(); goshenCamp(S); placeGoshen(S); stage8(S, true); if (!re && !C8(S).five) narr([{ kick: '창세기 47:1–2', title: '바로 앞으로', t: '형들 가운데 다섯이 요셉의 집 앞마당에서 기다려요. 함께 바로의 궁으로 가요. 아버지는 궁 문 밖에서 기다리세요.', ref: '' }]); },
  target: S => { const c = C8(S); if (!c.five) return { x: HX8, z: HZ8 + 4 }; if (!c.phar1) return { x: COURT8[0], z: COURT8[1] + 2 }; if (!c.walk) return { x: PALG8[0] + 1.2, z: PALG8[1] + 1.4 }; return { x: COURT8[0], z: COURT8[1] + 2 }; },
  check: S => !!C8(S).phar2, next: 'g9_land' };
function cine8Phar1(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); FIVE8.forEach(id => G.npcFollow(id, false));
  cine([
    { fn: () => { G.teleport(cx + 1.6, cz - 1, Math.PI); FIVE8.forEach((id, i) => showAt(id, cx - 2.4 + i * 1.2, cz + 1.4, Math.PI)); }, cam: [cx + 5, ch + 2.6, cz + 5], look: [cx, ch + 1.4, cz - 6], dur: 6, music: 'j_finale', t: '요셉이 바로에게 가서 고하여 이르되', ref: '창세기 47:1' },
    { cam: [cx + 2.6, ch + 1.7, cz - 0.2], look: [cx + 1.6, ch + 1.6, cz - 1], dur: 9, fov: 0.55, n: '요셉', t: '내 아버지와 내 형들과 그들의 양과 소와 모든 소유가 가나안 땅에서 와서 고센 땅에 있나이다.', ref: '창세기 47:1' },
    { cam: [cx + 6, ch + 3, cz + 6], look: [cx, ch + 1.4, cz - 6], dur: 6, t: '그의 형들 중 다섯 명을 택하여 바로에게 보이니', ref: '창세기 47:2' },
    { cam: [cx - 2, ch + 2.4, cz - 2], look: PHAR8(), dur: 5, n: '바로', t: '너희 생업이 무엇이냐?', ref: '창세기 47:3' },
    { cam: [cx + 2.4, ch + 1.5, cz - 1], look: [cx - 1, ch + 1.4, cz + 1.4], dur: 11, n: '형들', t: '종들은 목자이온데 우리와 선조가 다 그러하니이다. … 가나안 땅에 기근이 심하여 종들의 양 떼를 칠 곳이 없기로 종들이 이곳에 거류하고자 왔사오니, 청하건대 종들로 고센 땅에 거하게 하소서.', ref: '창세기 47:3–4' },
    { cam: [cx - 1.6, ch + 2.2, cz - 3], look: PHAR8(), dur: 11, n: '바로', t: '네 아비와 형들이 네게 왔은즉 애굽 땅이 네 앞에 있으니 땅의 좋은 곳에 네 아비와 형들로 거하게 하되 고센 땅에 그들로 거하게 하고, 그들 중에 능한 자가 있는 줄을 알거든 그들로 나의 짐승을 주관하게 하라.', ref: '창세기 47:5–6' },
  ], () => { const c = C8(S); c.phar1 = 1; FIVE8.forEach((id, i) => showAt(id, cx + 4 + (i % 3) * 1.2, cz + 3 + Math.floor(i / 3) * 1.2, Math.PI)); showAt('jacob', PALG8[0], PALG8[1], Math.PI); GG.UI.quest(); GG.UI.toast('궁 문 밖에서 아버지가 기다려요', true); });
}
function cine8Phar2(S, G) { const [cx, cz] = COURT8, ch = hAt(cx, cz); C8(S).walkEnd = 1;
  cine([
    { fn: () => { G.teleport(cx + 1.4, cz - 1.6, Math.PI); place('jacob', cx, cz - 2.4, Math.PI, { vis: true }); }, cam: [cx + 4, ch + 2.4, cz + 3], look: [cx, ch + 1.5, cz - 4], dur: 8, music: 'j_finale', t: '요셉이 자기 아버지 야곱을 인도하여 바로 앞에 서게 하니 야곱이 바로에게 축복하매', ref: '창세기 47:7' },
    { cam: [cx + 1.6, ch + 1.6, cz - 4.2], look: [cx, ch + 1.5, cz - 2.4], dur: 6, n: '바로', t: '네 나이가 얼마냐?', ref: '창세기 47:8' },
    { cam: [cx - 1.2, ch + 1.6, cz - 1.2], look: [cx, ch + 1.5, cz - 2.4], dur: 10, n: '야곱', t: '내 나그네 길의 세월이 일백 삼십 년이니이다. 나의 연세가 얼마 못 되니 우리 조상의 나그네 길의 세월에 미치지 못하나 험악한 세월을 보내었나이다.', ref: '창세기 47:9', e: 'weary' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = 'raiseHands'; }, cam: [cx + 3, ch + 2, cz - 0.6], look: [cx, ch + 1.6, cz - 3.4], dur: 7, t: '야곱이 바로에게 축복하고 그 앞에서 나오니라.', ref: '창세기 47:10', fadeOut: 1 },
  ], () => { const j = G.npc('jacob'); if (j) j.act = null; FIVE8.concat(['jacob']).forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); placeGoshen(S); C8(S).phar2 = 1; G.checkStep(); });
}

// ------------------------------------------------------------------ 8장 · 다섯째 마디 · 라암세스 땅 (47:11–12)
S8.g9_land = { ch: 9, obj: S => !C8(S).deed ? '총리의 집무실 · 라암세스 땅 문서에 인 치기' : '집무실 · 서기와 양식 나눌 법 정하기', target: { x: OFFICE8[0] + 0.6, z: OFFICE8[1] + 1.4 },
  list: S => { const c = C8(S); return [{ t: '기업 문서에 반지로 인 치기', ok: !!c.deed }, { t: '식구를 따라 양식 정하기', ok: !!c.feed }]; },
  enter(S, G, re) { stage8(S, true); if (!re) narr([{ kick: '창세기 47:11', title: '라암세스 땅', t: '바로의 명대로 아버지와 형들에게 땅을 기업으로 주어요. 궁 뒤 총리의 집무실로 가요.', ref: '' }]); },
  check: S => !!C8(S).feed, done(S, G, next) { kill8(/^scribe8/); cine8Ration(S, G, next); }, next: 'g10_famine' };
function deed8(S, G) { act('pick', 1.4); setTimeout(() => { G.sfx('thud', { vol: 0.6 }); G.FX.burst(OFFICE8[0], hAt(OFFICE8[0], OFFICE8[1]) + 0.9, OFFICE8[1] - 1.2, 10, { c: [0.6, 0.42, 0.3], sp: 0.5, up: 0.6, size: 0.05 }); }, 600);
  setTimeout(() => say([T('요셉이 손가락의 반지를 진흙에 꾹 눌러 인을 쳤어요.'), T('요셉이 바로의 명대로 그 아비와 형들에게 거할 곳을 주되 애굽의 좋은 땅 라암세스를 그들에게 주어 기업을 삼게 하고', '창세기 47:11')], () => { C8(S).deed = 1; GG.UI.quest(); }), 1300); }
function feed8(S, G) { say([{ n: '서기', t: '고센의 집마다 어린아이 수가 달라요. 양식을 어떻게 나눌까요?', choices: [{ t: '집마다 똑같이', ok: false, fb: '성경은 「그 식구를 따라」 주었다고 해요. 어린아이가 많은 집에는 더 많이요.' }, { t: '식구를 따라 · 어린아이 수대로', then: () => setTimeout(() => say([{ n: '서기', t: '식구 수대로 적겠습니다, 총리님.' }], () => { C8(S).feed = 1; GG.UI.quest(); G.checkStep(); }), 30) }] }], null); }
function cine8Ration(S, G, next) { cine([{ fn: () => placeGoshen(S), cam: [GOSHEN[0] + 20, GH() + 10, GOSHEN[1] - 16], cam2: [GOSHEN[0] + 14, GH() + 6, GOSHEN[1] - 10], look: [GOSHEN[0], GH() + 1, GOSHEN[1]], dur: 10, fadeIn: 1, music: 'j_finale',
  t: '또 그 아비와 형들과 아비의 온 집에 그 식구를 따라 식물을 주어 공궤하였더라.', ref: '창세기 47:12' }], () => next && next()); }

// ------------------------------------------------------------------ 8장 · 여섯째 마디 · 흉년의 다섯 가지 일 (47:13–26)
S8.g10_famine = { ch: 9, obj: S => { const c = C8(S); return !c.coin ? '성읍 곳간 · 곡식을 팔고 받은 은 거두기' : !c.treas ? '은 궤를 들고 바로의 궁으로' : !c.heard ? '궁 문 앞 · 백성의 말 듣기' : !c.herd ? '받은 소와 나귀를 왕의 마구간으로' : !c.yearTold ? '…' : !c.land ? '왕의 밭 어귀 · 바로의 경계석 세우기' : !c.seed ? '농부들에게 씨앗을 주고 뿌리는 법 보이기' : '궁 문 앞 · 서기와 토지법 새기기'; },
  list: S => { const c = C8(S); return [{ t: '은 · 바로의 궁으로 (47:14)', ok: !!c.treas }, { t: '가축 · 왕의 마구간으로 (47:17)', ok: !!c.herd }, { t: '땅 · 경계석 세우기 (47:20)', ok: !!c.land }, { t: '씨앗 · 뿌리는 법 (47:23)', ok: !!c.seed }, { t: '법 · 오분의 일 (47:26)', ok: !!c.law }]; },
  enter(S, G, re) { stage8(S, true); if (!re) narr([{ kick: '창세기 47:13', title: '흉년이 더욱 심하여', t: '기근이 더욱 심하여 사방에 먹을 것이 없고 애굽 땅과 가나안 땅이 기근으로 황폐하니', ref: '창세기 47:13' }]); },
  target: S => { const c = C8(S); if (!c.coin) return { x: G7GRAN[0], z: G7GRAN[1] - 1.6 }; if (!c.treas) return { x: TREAS8[0], z: TREAS8[1] }; if (!c.heard) return { x: LAW8[0] + 1, z: LAW8[1] + 4 }; if (!c.herd) return { x: STABLE8[0], z: STABLE8[1] }; if (!c.land) return { x: FIELD8[0], z: FIELD8[1] }; if (!c.seed) return { x: FIELD8[0] - 3, z: FIELD8[1] + 2.4 }; return { x: LAW8[0], z: LAW8[1] + 1.4 }; },
  check: S => !!C8(S).law, done(S, G, next) { kill8(/^(ppl8|far8|cow8|don8h|scribe8)/); narr([{ kick: '창세기 47:27', title: '고센 땅', t: '이스라엘 족속이 애굽 고센 땅에 거하며 거기서 산업을 얻고 생육하며 번성하였더라.', ref: '창세기 47:27' }], next); }, next: 'j_end' };
function coin8(S, G) { MG8('catch', { title: '은 거두기', hint: '곡식을 팔고 받은 은을 바구니에 받아 담아요.', need: 10, dur: 30 }, () => { const c = C8(S); c.coin = 1; S.q.c8carry = 'chest'; G.P.carry = 'head'; GG.UI.quest();
  say([T('요셉이 곡식을 팔고 애굽 땅과 가나안 땅에 있는 돈을 모두 거두어들이고', '창세기 47:14')], () => GG.UI.toast('무거운 은 궤예요 · 바로의 궁으로 들고 가요', true)); }); }
function treas8(S, G) { S.q.c8carry = null; G.P.carry = null; act('pick', 1); G.sfx('coins'); say([T('그 돈을 바로의 궁으로 가져가니', '창세기 47:14')], () => { C8(S).treas = 1; GG.UI.quest(); stage8(S, true); }); }
function heard8(S, G) { say([{ n: '애굽 백성', t: '돈이 진하였사오니 우리에게 식물을 주소서. 어찌 주 앞에서 죽으리이까?', ref: '창세기 47:15' }, J('너희 짐승을 내라. 돈이 진하였을진대 내가 너희의 짐승과 바꾸어 주리라.', '창세기 47:16')], () => {
  const c = C8(S); c.heard = 1; ['cow8', 'don8h'].forEach(id => G.npcFollow(id, true)); GG.UI.quest(); GG.UI.toast('소와 나귀가 따라와요 · 왕의 마구간으로 데려가요', true); }); }
function herd8(S, G) { const c = C8(S); c.herd = 1; ['cow8', 'don8h'].forEach(id => { G.npcFollow(id, false); walkTo(id, STABLE8[0] + (id === 'cow8' ? -1 : 1), STABLE8[1] - 6, 1.2); }); GG.UI.quest();
  say([{ n: '마구간지기', t: '총리님, 왕의 마구간에 들이겠습니다.' }, T('그들이 그 짐승을 요셉에게 끌어오는지라. 요셉이 그 말과 양 떼와 소 떼와 나귀를 받고 그들에게 식물을 주되, 곧 그 모든 짐승과 바꾸어서 그 해 동안에 식물로 그들을 기르니라.', '창세기 47:17')], () => {
    kill8(/^(cow8|don8h)/); narr([{ kick: '창세기 47:18', title: '새 해', t: '그 해가 다 가고 새 해가 되매 무리가 요셉에게 와서 가로되,', ref: '창세기 47:18' }], () => { const P = G.P; [[0, LOOK.farmerThin], [1, LOOK.woman], [2, LOOK.farmer]].forEach(([i, L]) => { const a = P.face + (i - 1) * 0.5; spawn8('ppl8_y' + i, { name: '애굽 백성', look: L, x: P.x + Math.sin(a) * 2.6, z: P.z + Math.cos(a) * 2.6, face: P.face + Math.PI, act: i === 1 ? 'beg' : null }); }); say([{ n: '애굽 백성', t: '우리가 주께 숨기지 아니하나이다. 우리의 돈이 다하였고 우리의 짐승 떼가 주께로 돌아갔사오니 주께 낼 것이 아무것도 남지 아니하고 우리의 몸과 토지뿐이라.', ref: '창세기 47:18' },
      { n: '애굽 백성', t: '우리 몸과 우리 토지를 식물로 사소서. 우리가 토지와 함께 바로의 종이 되리니 우리에게 종자를 주시면 우리가 살고 죽지 아니하며 토지도 황폐하지 아니하리이다.', ref: '창세기 47:19' }], () => { c.yearTold = 1; kill8(/^ppl8_y/); stage8(S, true); GG.UI.quest(); GG.UI.toast('서쪽 · 왕의 밭 어귀로 가요', true); }); }); }); }
function stone8(S, G) { MG8('push', { title: '경계석 세우기', hint: '바로의 표가 새겨진 돌을 꾹 밀어 일으켜 세우다가, 힘이 빠지면 잠깐 쉬어요.', btn: '밀기' }, () => { const c = C8(S); c.land = 1; G.sfx('thud', { vol: 0.7 }); GG.UI.quest();
  say([T('그러므로 요셉이 애굽의 모든 토지를 다 사서 바로에게 바치니, 애굽의 각 사람이 기근에 몰려서 다 그 전지를 팔았음이라. 땅이 바로의 소유가 되니라.', '창세기 47:20'), T('요셉이 애굽 이 지경에서 저 지경까지의 백성을 성읍들에 옮겼으나, 제사장들의 토지는 사지 아니하였으니 제사장들은 바로에게서 녹을 받는 고로 바로가 주는 녹을 먹음이라.', '창세기 47:21–22')]); }); }
function seed8(S, G) { say([J('오늘날 내가 바로를 위하여 너희 몸과 너희 토지를 샀노라. 여기 종자가 있으니 너희는 그 땅에 뿌리라.', '창세기 47:23'), J('추수의 오분 일을 바로에게 상납하고 사분은 너희가 취하여 전지의 종자도 삼고 너희의 양식도 삼고 너희 가족과 어린아이의 양식도 삼으라.', '창세기 47:24')], () =>
  MG8('rhythm', { title: '씨 뿌리기 보이기', hint: '걸음에 맞춰 한 줌씩, 줄에 닿을 때 씨를 흩뿌려요.', need: 5 }, () => { const c = C8(S); c.seed = 1; act('gather', 1.2); G.FX.burst(G.P.x + Math.sin(G.P.face), hAt(G.P.x, G.P.z) + 1, G.P.z + Math.cos(G.P.face), 18, { c: [0.85, 0.72, 0.4], sp: 1.4, up: 0.8, size: 0.04, g: 7 });
    for (let i = 0; i < 3; i++) { const n = G.npc('far8_' + i); if (n) n.act = 'gather'; } GG.UI.quest(); say([{ n: '애굽 백성', t: '주께서 우리를 살리셨사오니 우리가 주께 은혜를 입고 바로의 종이 되겠나이다.', ref: '창세기 47:25' }], () => stage8(S, true)); })); }
function law8(S, G) { MG8('memory', { title: '토지법 새기기', hint: '서기가 쓴 글자를 잘 보고, 돌에 똑같이 새겨요.', n: 4, grid: 9, show: 3.6, pool: ['reed', 'water', 'eye', 'bird', 'bread', 'rope', 'hand', 'leg', 'snake'], names: { reed: '갈대', water: '물결', eye: '눈', bird: '새', bread: '빵', rope: '밧줄', hand: '손', leg: '다리', snake: '뱀' } }, () => { const c = C8(S); c.law = 1; G.sfx('craft'); GG.UI.quest();
  say([T('요셉이 애굽 토지법을 세우매 그 오분 일이 바로에게 상납되나, 제사장의 토지는 바로의 소유가 되지 아니하여 오늘날까지 이르니라.', '창세기 47:26')], () => G.checkStep()); }); }

// ------------------------------------------------------------------ who stands where (called on entering a step and when a save loads)
function stage8(S, force) { const G = Gm(), st = S.step, c = C8(S); if (!force && RT.st8 === st) return; RT.st8 = st;
  { const k = S.q.c8carry, mine = (st === 'g3_return' && TAB8[k]) || (st === 'g10_famine' && k === 'chest' && !c.treas); if (k && !mine) { S.q.c8carry = null; if (G.P.carry === 'head') G.P.carry = null; } else if (k) G.P.carry = 'head'; } /* (a table or the chest is only carried in its own step; after a load the pose comes back) */
  if (st !== 'g6_wagons') kill8(/^(ox8|don8_)/); if (!/^g(9|10)_/.test(st)) kill8(/^(scribe8|ppl8|far8|cow8|don8h)/);
  if (st === 'g3_return') { S.q.broShow = 1; if (!c.met) { const [gx, gz] = G7GRAN; bros10().forEach((id, i) => showAt(id, gx - 4.5 + (i % 6) * 1.8, gz + 4.4 + Math.floor(i / 6) * 1.8, Math.PI)); hide(['simeon']); } else hide(BRO11); }
  if (st === 'g3_feast') { if (c.seated) seatAll8(); else bros8Wait(); }
  if (st === 'g4_cup') hide(BRO11);
  if (st === 'g6_wagons') { S.q.broShow = 1; ageBrothers(); if (!c.robe) bros10().concat(['simeon']).forEach((id, i) => showAt(id, HX8 - 5 + (i % 6) * 2, HZ8 + 7 + Math.floor(i / 6) * 1.6, Math.PI));
    else bros10().concat(['simeon']).forEach((id, i) => showAt(id, LINE8.x0 - 4 + (i % 4) * 1.4, LINE8.z - 4 - Math.floor(i / 4) * 1.4, 0.4));
    const oxAt = (i, x, z, f) => { const n = spawn8('ox8' + i, { name: '소', animal: 'cow', x, z, face: f }); if (n) { Gm().npcTo('ox8' + i, x, z, f, false); n.walk = null; n.wander = null; } };
    if (c.yoke) WAG8.forEach(([x, z], i) => oxAt(i, x, z + 2.8, 0)); else { oxAt(0, OXT8[0] - 1, OXT8[1], 0.4); oxAt(1, OXT8[0] + 1, OXT8[1] + 0.4, -0.3); }
    if (!c.sent) for (let i = 0; i < 12; i++) { const x = LINE8.x0 + (i % 6) * 4.2, z = LINE8.z + (i < 6 ? 0 : 2.2); const n = spawn8('don8_' + i, { name: i < 6 ? '수나귀' : '암나귀', animal: 'donkey', x, z, face: Math.PI / 2 }); if (n) n.wander = null; } }
  if (st === 'g8_pharaoh') { S.q.broShow = 1; if (!c.phar1) { FIVE8.forEach((id, i) => showAt(id, HX8 - 3 + i * 1.5, HZ8 + 5, Math.PI)); if (c.five) FIVE8.forEach(id => G.npcFollow(id, true)); showAt('jacob', PALG8[0], PALG8[1], Math.PI); } else if (!c.phar2) showAt('jacob', PALG8[0], PALG8[1], Math.PI); }
  if (st === 'g9_land') { const n = spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: OFFICE8[0] + 1.6, z: OFFICE8[1] - 0.4, face: -1.3 }); if (n) n.wander = null; }
  if (st === 'g10_famine') { if (c.treas && !c.heard) { [[0, LOOK.farmerThin], [1, LOOK.woman]].forEach(([i, L]) => spawn8('ppl8_' + i, { name: '애굽 백성', look: L, x: LAW8[0] + 0.4 + i * 1.4, z: LAW8[1] + 5.4, face: Math.PI, act: 'beg' })); spawn8('cow8', { name: '소', animal: 'cow', x: LAW8[0] + 3.6, z: LAW8[1] + 6.4, face: Math.PI }); spawn8('don8h', { name: '나귀', animal: 'donkey', x: LAW8[0] + 5.4, z: LAW8[1] + 6, face: Math.PI }); }
    if (c.heard && !c.herd) { spawn8('cow8', { name: '소', animal: 'cow', x: G.P.x - 1.6, z: G.P.z - 1.6, face: 0 }); spawn8('don8h', { name: '나귀', animal: 'donkey', x: G.P.x + 1.6, z: G.P.z - 1.6, face: 0 }); ['cow8', 'don8h'].forEach(id => G.npcFollow(id, true)); }
    if (c.heard) kill8(/^ppl8/);
    if (c.yearTold && !c.seed) for (let i = 0; i < 3; i++) spawn8('far8_' + i, { name: '애굽 농부', look: LOOK.farmerThin, x: FIELD8[0] - 3 - i * 1.5, z: FIELD8[1] + 3.6, face: Math.PI * 0.9 });
    if (c.seed && !c.law) { kill8(/^far8/); spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: LAW8[0] + 1.4, z: LAW8[1] - 0.6, face: -1.2 }); } }
}

// ------------------------------------------------------------------ the actions (A)
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || !/^g(3|4|6|7|8|9|10)_/.test(S.step || '')) return null; const st = S.step, c = C8(S), out = [];
  const at = (x, z, r, o) => { const d = Math.hypot(x - p.x, z - p.z); if (d < (r || 2.6)) out.push(Object.assign({ d: d - 0.8, x, z, y: 1, noMagnet: true, story: true }, o)); };
  if (st === 'g3_return' && c.met) { const t = c.tb || (c.tb = {}), k = S.q.c8carry, nxt = ['j', 'h', 'e'].find(q => !t[q]);
    if (nxt && !k) at(STACK8[0], STACK8[1], 2.8, { label: `${TAB8[nxt].n} 들기`, key: 'c8Tab', use: () => { S.q.c8carry = nxt; p.carry = 'head'; act('pick', 0.8); GG.UI.quest(); } }); /* (carried on the head, the way loads went in Egypt) */
    if (k && TAB8[k]) at(TAB8[k].x, TAB8[k].z, 2.6, { label: `${TAB8[k].n} 놓기`, key: 'c8Put', use: () => { t[k] = 1; S.q.c8carry = null; p.carry = null; act('pick', 0.8); G.sfx('thud', { vol: 0.5 }); GG.UI.toast(TAB8[k].d + ' (창세기 43:32)'); GG.UI.quest(); } });
    if (!nxt && !c.noonGo) at(HX8, HZ8 + 2.4, 3.2, { label: '정오 · 형들을 맞기', key: 'c8Noon', use: () => { c.noonGo = 1; G.checkStep(); } }); }
  if (st === 'g3_feast' && c.noon) { const [rx, rz] = ROOM8;
    if (!c.wept) at(rx - 0.4, rz + 0.2, 2.2, { label: '안방에서 울기', key: 'c8Weep', use: () => weep8(S, G) });
    else if (!c.washed) at(rx + 0.8, rz, 2, { label: '대야에서 얼굴 씻기', key: 'c8Wash', use: () => wash8(S, G) });
    else if (!c.serve) at(HX8, HZ8 + 2.6, 3.2, { label: '「음식을 차리라」', key: 'c8Serve', use: () => serve8(S, G) });
    else if (!c.seated) at(HX8, HZ8 + 5, 3.6, { label: '형들을 나이 차례로 앉히기', key: 'c8Seat', use: () => seat8(S, G) });
    else if (!c.portion) at(TAB8.j.x, TAB8.j.z - 0.6, 2.6, { label: '요셉의 상에서 몫 보내기', key: 'c8Por', use: () => MG8('count', { title: '몫 보내기', hint: '요셉의 상에서 음식을 덜어 형제들에게 보내요. 베냐민에게는 다섯 몫이에요.', need: 5, btn: '베냐민에게 보내기', unit: '몫' }, () => { c.portion = 1; GG.UI.quest(); G.checkStep(); }) }); }
  if (st === 'g6_wagons') { const wx = (WAG8[0][0] + WAG8[1][0]) / 2, wz = WAG8[0][1];
    if (!c.pull) at(wx, wz - 1.6, 4, { label: '왕의 수레 끌어내기', key: 'c8Pull', use: () => MG8('wrestle', { title: '수레 끌어내기', hint: '바퀴가 모래에 박혔어요. 힘껏 당겨 수레를 끌어내요.', need: 6, dur: 12, btn: '당기기', unit: '번' }, () => { c.pull = 1; G.sfx('thud', { vol: 0.6 }); GG.UI.quest(); GG.UI.toast('수레 둘을 내놓았어요 · 소에 멍에를 메워요'); }) });
    else if (!c.yoke) at(OXT8[0], OXT8[1], 3.4, { label: '소에 멍에 메우기', key: 'c8Yoke', use: () => MG8('balance', { title: '멍에 메우기', hint: '무거운 멍에를 두 소의 목에 고르게 얹어요. 한쪽으로 기울지 않게.', dur: 8 }, () => { c.yoke = 1; GG.UI.quest(); stage8(S, true); GG.UI.toast('소가 수레 앞에 섰어요 · 앞마당의 형들에게 가요'); }) });
    else if (!c.robe) at(HX8, HZ8 + 5, 3.6, { label: '형들에게 옷 한 벌씩 주기', key: 'c8Robe', use: () => robes8(S, G) });
    else if (!c.benj) { const b = G.npc('benjamin2'); if (b) at(b.x, b.z, 2.8, { label: '베냐민에게 은 삼백과 옷 다섯 벌', key: 'c8Benj', use: () => benj8(S, G) }); }
    else if (c.line && !c.sent) at(LINE8.x0 - 2.5, LINE8.z - 1, 3.4, { label: '형들을 떠나보내기', key: 'c8Send', use: () => sendOff8(S, G) }); }
  if (st === 'g7_goshen' && S.q.chariotOk && !c.harness && !S.q.riding && c.judah) at(CART8.x + 1.6, CART8.z - 1.2, 4, { label: '버금 수레에 말 매기', key: 'c8Harn', use: () => MG8('rhythm', { title: '말 매기', hint: '말이 가만히 설 때 끈을 조여요.', need: 4 }, () => { c.harness = 1; GG.UI.quest(); GG.UI.toast('수레에 올라 고센으로 몰고 가요 (동쪽 광야 가장자리)', true); }) });
  if (st === 'g8_pharaoh') { if (!c.five) at(HX8, HZ8 + 4, 3.6, { label: '형 다섯과 함께 바로의 궁으로', key: 'c8Five', use: () => { c.five = 1; FIVE8.forEach(id => G.npcFollow(id, true)); GG.UI.quest(); } });
    else if (c.phar1 && !c.walk) { const j = G.npc('jacob'); if (j) at(j.x, j.z, 2.8, { label: '아버지를 모시고 바로 앞으로', key: 'c8Dad', use: () => { c.walk = 1; GG.UI.quest(); GG.UI.toast('아버지는 백삼십 살이에요 · 걸음을 맞춰 천천히 걸어요', true); } }); } }
  if (st === 'g9_land') { if (!c.deed) at(OFFICE8[0], OFFICE8[1] - 0.6, 2.8, { label: '라암세스 땅 문서에 인 치기', key: 'c8Deed', use: () => deed8(S, G) }); else if (!c.feed) { const n = G.npc('scribe8'); if (n) at(n.x, n.z, 2.8, { label: '서기와 양식 나눌 법 정하기', key: 'c8Feed', use: () => feed8(S, G) }); } }
  if (st === 'g10_famine') { if (!c.coin) at(G7GRAN[0], G7GRAN[1] - 1.6, 3.2, { label: '팔고 받은 은 거두기', key: 'c8Coin', use: () => coin8(S, G) });
    else if (!c.treas) at(TREAS8[0], TREAS8[1], 3.2, { label: '바로의 궁에 은 궤 들이기', key: 'c8Treas', use: () => treas8(S, G) });
    else if (!c.heard) { const n = G.npc('ppl8_0'); if (n) at(n.x, n.z, 3, { label: '백성의 말 듣기', key: 'c8Hear', use: () => heard8(S, G) }); }
    else if (c.yearTold && !c.land) at(FIELD8[0], FIELD8[1], 3, { label: '바로의 경계석 세우기', key: 'c8Stone', use: () => stone8(S, G) });
    else if (c.land && !c.seed) at(FIELD8[0] - 3, FIELD8[1] + 2.4, 3.4, { label: '씨앗을 주며 이르기', key: 'c8Seed', use: () => seed8(S, G) });
    else if (c.seed && !c.law) at(LAW8[0], LAW8[1] + 1.4, 3, { label: '서기와 토지법 새기기', key: 'c8Law', use: () => law8(S, G) }); }
  return out.length ? out : null; });

// ------------------------------------------------------------------ every frame
let t8 = 0;
function ch8Tick(dt, S) { if (!S || !/^g(3|6|8|10)_/.test(S.step || '')) return; try { const G = Gm(), c = C8(S), st = S.step, free = !GG.UI.busy() && !GG.Cine.on && !G.cineOn;
  if ((t8 -= dt) > 0) return; t8 = 0.3; if (RT.st8 !== st) stage8(S);
  if (st === 'g3_return' && !c.met && free && near8(G7GRAN[0], G7GRAN[1], 8)) cine8Return(S, G);
  if (st === 'g6_palace' && !c.orderGo && free && near8(COURT8[0], COURT8[1], 9)) cine8Command(S, G);
  if (st === 'g6_wagons' && c.benj && !c.line) { const p = G.P;
    if (!c.lineOn && Math.hypot(p.x - (LINE8.x0 - 1.5), p.z - (LINE8.z - 2)) < 3) { c.lineOn = 1; c.lineK = 0; const n = spawn8('scribe8', { name: '서기', look: LOOK.scribe, x: p.x - 1, z: p.z - 1, face: Math.PI / 2 }); if (n) G.npcFollow('scribe8', true); GG.UI.quest(); GG.UI.toast('줄을 따라 천천히 걸어요 · 서기가 짐을 읽어 줘요'); }
    if (c.lineOn && Math.abs(p.z - LINE8.z) < 6) { const k = p.x > LINE8.x1 - 1 ? 3 : p.x > LINE8.x0 + 13 ? 2 : p.x > LINE8.x0 + 4 ? 1 : 0;
      if (k > (c.lineK || 0)) { c.lineK = k; if (k === 1) GG.Life.bubble('scribe8', '수나귀 열 필 · 애굽의 아름다운 물품입니다.', 3.4); if (k === 2) GG.Life.bubble('scribe8', '암나귀 열 필 · 곡식과 떡과 길 양식입니다.', 3.4);
        if (k === 3) { c.line = 1; G.npcFollow('scribe8', false); GG.UI.quest(); say([T('그가 또 이와 같이 그 아비에게 보내되, 수나귀 열 필에 애굽의 아름다운 물품을 실리고 암나귀 열 필에는 아비에게 길에서 공궤할 곡식과 떡과 양식을 실리고', '창세기 45:23')]); } } } }
  if (st === 'g8_pharaoh') { const p = G.P;
    if (c.five && !c.phar1 && free && near8(COURT8[0], COURT8[1], 10.5)) cine8Phar1(S, G);
    if (c.walk && !c.walkEnd && free) { const j = G.npc('jacob'); if (j) { const d = Math.hypot(j.x - p.x, j.z - p.z);
      if (d > 2.2 && d < 12) { const bx = p.x - Math.sin(p.face) * 1.3 + Math.cos(p.face) * 0.8, bz = p.z - Math.cos(p.face) * 1.3 - Math.sin(p.face) * 0.8; if (!j.walk || Math.hypot(j.walk.x - bx, j.walk.z - bz) > 1.2) { j.sit = false; j.act = null; G.npcWalk('jacob', bx, bz, null, 0.8); } }
      if (d > 6) { RT.lag8 = (RT.lag8 || 0) - 0.3; if (RT.lag8 <= 0) { RT.lag8 = 7; GG.UI.toast('아버지가 뒤처졌어요 · 걸음을 맞춰 천천히 걸어요'); } }
      if (d >= 12) { G.npcTo('jacob', p.x - Math.sin(p.face) * 2, p.z - Math.cos(p.face) * 2, p.face, false); }
      if (near8(COURT8[0], COURT8[1], 7) && d < 4) cine8Phar2(S, G); } } }
  if (st === 'g10_famine' && c.heard && !c.herd && free && near8(STABLE8[0], STABLE8[1], 6)) { const a = G.npc('cow8'); if (a && Math.hypot(a.x - G.P.x, a.z - G.P.z) < 8) herd8(S, G); }
} catch (e) { console.error('ch8', e); } }

// ------------------------------------------------------------------ things to see (dyn meshes · f_runtime draws them)
function ch8Dyn(list, S, G, t) { const st = S.step; if (!/^g(3|4|6|9|10)_/.test(st || '')) return; const c = C8(S), P = G.P, WD = 0x8a6440, LIN = 0xeee4cc;
  const tbl = k => mk('tab8' + k, g => { const w = k === 'h' ? 13 : k === 'e' ? 0.8 : 1.5, d = k === 'h' ? 0.8 : k === 'e' ? 2.6 : 0.75; g.box(w, 0.06, d, { at: [0, 0.42, 0], c: WD }); g.box(w + 0.04, 0.012, d + 0.04, { at: [0, 0.455, 0], c: LIN, j: 0 });
    const lx = w / 2 - 0.12, lz = d / 2 - 0.12, xs = k === 'h' ? [-lx, -lx / 2, 0, lx / 2, lx] : [-lx, lx]; for (const x of xs) for (const z of [-lz, lz]) g.box(0.07, 0.4, 0.07, { at: [x, 0.2, z], c: 0x6a4a30 }); });
  if ((st === 'g3_return' || st === 'g3_feast' || st === 'g4_cup') && c.tb) for (const k of ['j', 'h', 'e']) if (c.tb[k]) { const T0 = TAB8[k]; list.push({ mesh: tbl(k), m: mat('tab8' + k, T0.x, hAt(T0.x, T0.z), T0.z, 0), outline: true }); }
  if (S.q.c8carry && TAB8[S.q.c8carry] && st === 'g3_return') { const k = S.q.c8carry; list.push({ mesh: tbl(k), m: mat('tab8c', P.x, P.y + 2.02, P.z, P.face + (k === 'e' ? Math.PI / 2 : 0), Math.PI, 0, k === 'h' ? 0.16 : 0.8, 0.5, 0.8), outline: true }); } /* (upside down on his head; the long one is shown folded short) */
  if (st === 'g3_return' && c.met) { const left = ['j', 'h', 'e'].filter(k => !(c.tb || {})[k] && S.q.c8carry !== k); left.forEach((k, i) => list.push({ mesh: tbl(k), m: mat('tab8s' + i, STACK8[0] + i * 0.15, hAt(STACK8[0], STACK8[1]) + i * 0.08, STACK8[1] + i * 0.1, 0.3, 0, 0, k === 'h' ? 0.16 : 0.8, 0.9, 0.8), outline: true })); } /* (the tables waiting by the house wall) */
  if ((st === 'g3_feast' && c.serve) || (st === 'g4_cup' && !c.dawn)) { const dish = mk('dish8', g => { g.cyl(0.13, 0.1, 0.05, 10, { at: [0, 0.025, 0], c: 0xc8a070 }); g.sph(0.07, 6, 4, { at: [0, 0.07, 0], s: [1, 0.5, 1], c: 0xb86a3a }); });
    const put = (key, x, z) => list.push({ mesh: dish, m: mat(key, x, hAt(x, z) + 0.46, z, 0), outline: false });
    put('dish8j', TAB8.j.x, TAB8.j.z); put('dish8e0', TAB8.e.x, TAB8.e.z - 0.6); put('dish8e1', TAB8.e.x, TAB8.e.z + 0.6);
    for (let i = 0; i < 11; i++) { const [x] = SEAT8(i), n = i === 10 && c.portion ? 5 : 1; for (let k = 0; k < n; k++) put('dish8b' + i + '_' + k, x + (k ? ((k % 2) ? -1 : 1) * Math.ceil(k / 2) * 0.24 : 0), TAB8.h.z + (k ? 0.18 : 0)); } }
  if (st === 'g4_cup' && !c.dawn) { const sack = mk('sack8', g => { g.sph(0.3, 7, 5, { at: [0, 0.32, 0], s: [1, 1.25, 0.9], c: 0xc8b088 }); g.cyl(0.1, 0.14, 0.12, 6, { at: [0, 0.7, 0], c: 0xa8906a }); });
    for (let i = 0; i < 11; i++) { const x = HX8 - 8 + i * 0.7, z = HZ8 - 3.6; list.push({ mesh: sack, m: mat('sack8_' + i, x, hAt(x, z), z, i * 0.7), outline: true }); } }
  if (st === 'g6_wagons' || RT.wag8T) { const wag = mk('wag8', g => { g.box(1.6, 0.12, 2.6, { at: [0, 0.78, 0], c: 0x8a6a44 }); for (const sx of [-1, 1]) g.box(0.06, 0.36, 2.6, { at: [sx * 0.8, 1.0, 0], c: 0x7a5a38 }); g.box(1.6, 0.36, 0.06, { at: [0, 1.0, -1.3], c: 0x7a5a38 });
      for (const sx of [-1, 1]) { g.cyl(0.42, 0.42, 0.08, 12, { at: [sx * 0.88, 0.42, -0.6], rz: Math.PI / 2, c: 0x5a4028 }); g.cyl(0.08, 0.08, 0.12, 6, { at: [sx * 0.9, 0.42, -0.6], rz: Math.PI / 2, c: 0x3a2818 }); } g.cyl(0.04, 0.05, 2.2, 5, { at: [0, 0.6, 2.1], rx: Math.PI / 2 - 0.15, c: 0x6a4a30 }); });
    if (st === 'g6_wagons') WAG8.forEach(([x, z], i) => list.push({ mesh: wag, m: mat('wag8_' + i, x, hAt(x, z), z, 0), outline: true }));
    if (RT.wag8T) { const [x, z] = RT.wag8T; list.push({ mesh: wag, m: mat('wag8_t', x, hAt(x, z), z, -2.2), outline: true }); } }
  if (st === 'g10_famine') { if (S.q.c8carry === 'chest') list.push({ mesh: mk('chest8', g => { g.box(0.5, 0.28, 0.36, { at: [0, 0, 0], c: 0x6a4428 }); g.box(0.52, 0.04, 0.38, { at: [0, 0.16, 0], c: 0xd8b04a }); }), m: mat('chest8', P.x, P.y + 1.96, P.z, P.face), outline: true }); /* (on his head, held with both hands) */
    const stn = mk('bstone8', g => { g.box(0.5, 1.3, 0.28, { at: [0, 0.65, 0], c: 0xb8aa92, j: 0.05 }); g.box(0.3, 0.3, 0.02, { at: [0, 1.0, 0.15], c: 0x8a3a2a, j: 0 }); });
    list.push({ mesh: stn, m: c.land ? mat('bstone8', FIELD8[0], hAt(FIELD8[0], FIELD8[1]), FIELD8[1], 0.4) : mat('bstone8', FIELD8[0], hAt(FIELD8[0], FIELD8[1]) + 0.14, FIELD8[1] + 0.5, 0.4, -Math.PI / 2 + 0.08), outline: true });
    if (c.seed || c.law) list.push({ mesh: mk('stele8', g => { g.box(1.0, 1.9, 0.3, { at: [0, 0.95, 0], c: 0xcabf9e, j: 0.03 }); g.box(1.0, 0.24, 0.32, { at: [0, 2.0, 0], c: 0xd8b04a }); }), m: mat('stele8', LAW8[0], hAt(LAW8[0], LAW8[1]), LAW8[1] - 0.6, Math.PI), outline: true });
    if (c.law) list.push({ mesh: mk('stele8w', g => { for (let i = 0; i < 5; i++) g.box(0.7, 0.05, 0.02, { at: [0, 0.6 + i * 0.22, 0], c: 0x4a3a2a, j: 0 }); }), m: mat('stele8w', LAW8[0], hAt(LAW8[0], LAW8[1]), LAW8[1] - 0.44, Math.PI), outline: false }); }
}
function ch8Build(W, P) { try { /* the inner room (창 43:30): a curtained chamber east of the vizier's house, open toward the courtyard, with a basin to wash in */ const [rx, rz] = ROOM8;
  P((g, M) => { const POST = 0x8a6a48, LIN = 0xe8dcc0, TR = 0x2f6f8f; for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) g.box(0.14, 2.5, 0.14, { m: M, at: [x, 1.25, z], c: POST }); g.box(3.3, 0.12, 3.3, { m: M, at: [0, 2.56, 0], c: LIN });
    g.box(3.1, 2.3, 0.04, { m: M, at: [0, 1.2, -1.5], c: LIN, j: 0.02 }); g.box(3.1, 2.3, 0.04, { m: M, at: [0, 1.2, 1.5], c: LIN, j: 0.02 }); g.box(0.04, 2.3, 3.1, { m: M, at: [1.5, 1.2, 0], c: LIN, j: 0.02 }); g.box(3.3, 0.14, 0.06, { m: M, at: [0, 2.42, -1.52], c: TR }); g.box(3.3, 0.14, 0.06, { m: M, at: [0, 2.42, 1.52], c: TR });
    g.box(2.6, 0.02, 2.4, { m: M, at: [0, 0.01, 0], c: 0x8a3a3a, j: 0 }); g.cyl(0.2, 0.24, 0.62, 10, { m: M, at: [0.85, 0.31, 0], c: 0x9a8e7e }); g.lathe([[0.2, 0.62], [0.32, 0.74], [0.36, 0.8]], 14, { m: M, at: [0.85, 0, 0], c: 0xb5673a }); g.lathe([[0.3, 0.8], [0.2, 0.66]], 14, { m: M, at: [0.85, 0, 0], c: 0x7a4a2a }); g.cyl(0.26, 0.26, 0.01, 12, { m: M, at: [0.85, 0.72, 0], c: 0x5f9cc4, j: 0 }); }, rx, rz, { keep: 1, col: null }); } catch (e) { console.warn('ch8Build', e); } }

// ------------------------------------------------------------------ put the steps in order (the old keys stay: old saves land in them)
for (const sp of specials) if (/^g_(dish|seat|portion|grain|goods)$/.test(sp.id)) sp.on = () => false; /* (the old feast and wagon buttons) */
{ const keys = Object.keys(steps), cut = keys.indexOf('g3_feast'), tail = keys.slice(cut).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.g3_return = S8.g3_return; steps.g3_feast = S8.g3_feast; steps.g4_cup = S8.g4_cup;
  steps.g5_reveal = Object.assign(tail.find(q => q[0] === 'g5_reveal')[1], { done(S, G, next) { cinIAmJoseph(S, G, next); } });
  steps.g6_palace = S8.g6_palace; steps.g6_wagons = S8.g6_wagons; steps.g7_goshen = S8.g7_goshen; steps.g8_pharaoh = S8.g8_pharaoh; steps.g9_land = S8.g9_land; steps.g10_famine = S8.g10_famine;
  for (const [k, v] of tail) if (!steps[k]) steps[k] = v;
  ORDER = Object.keys(steps); }
steps.g5_reveal.next = 'g6_palace'; steps.g1_spy.next = 'g3_return';
Object.assign(steps.g2_simeon, { enter(S, G) { hide(['simeon']); setTimeout(() => cinJudahPledge(S, G, () => G.go('g3_return')), 80); } });
