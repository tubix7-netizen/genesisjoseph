// =================================================================== v18.78 7장 손보기 · 「형제들」 (e_ch7.js)
/* ① 42:14–17을 넣었어요: 요셉의 시험(「바로의 생명으로 맹세하노니」) → 사흘 동안 옥에 가둠 → 실제로 사흘을 기다려요 → 사흘째 옥으로 가서 42:18–24
   ② 「옥에 갇힌 시므온 찾아가기」(성경에 없음)는 뺐어요. 유다의 약속 장면(43:1–14)은 형들이 떠난 장면 뒤로 옮겼어요.
   ③ 「조금 더 엄하게 대한다」 고르기(성경에 없음)를 뺐어요. 45:1 말씀대로 「모든 사람은 내게서 물러가라」만.
   ④ 청지기에게 이르기의 틀린 답 설명에서 요셉의 속마음(성경에 없음)을 뺐어요. */
const SPY7 = S => S.q.spy7 || (S.q.spy7 = {});
const prisonRow7 = () => { const [yx, yz] = SPOTS.yard; brosRow(yx + 1, yz + 1.5, 0); BRO.forEach(id => { const n = Gm().npc(id); if (n) { n.act = 'kneelRest'; n.emote = null; } }); };
function cinSpies(S, G, next) { /* v18.78 (redeclared): 42:9–17 · the test and the three days */ const [gx, gz] = G7GRAN, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6, [yx, yz] = SPOTS.yard, yh = hAt(yx, yz);
  cine([
    { hour: 10, fn: () => { ageBrothers(); S.q.broShow = 1; G.teleport(jx, jz, 0); brosRow(gx, gz + 4, Math.PI); },
      cam: [gx + 6, gh + 2.2, gz + 9], look: [gx, gh + 1.2, gz + 3], dur: 6, music: 'j_mourn', t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고 그들에게 이르되,', ref: '창세기 42:9' },
    { cam: [jx + 1.4, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 6, n: '요셉', t: '너희는 정탐들이라. 이 나라의 틈을 엿보려고 왔느니라.', ref: '창세기 42:9', e: 'cold' },
    { cam: [gx - 2, gh + 1.3, gz + 1.8], look: [gx - 0.6, gh + 1.1, gz + 4], dur: 9, n: '형들', t: '내 주여 아니니이다. 당신의 종들은 곡물을 사러 왔나이다. 우리는 다 한 사람의 아들들로서 확실한 자니이다. 당신의 종들은 정탐이 아니니이다.', ref: '창세기 42:10–11', e: 'fear' },
    { cam: [jx + 1.2, gh + 1.7, jz + 1.3], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '아니라, 너희가 이 나라의 틈을 엿보러 왔느니라.', ref: '창세기 42:12', e: 'cold' },
    { cam: [gx + 2, gh + 1.3, gz + 1.9], look: [gx + 0.4, gh + 1.1, gz + 4], dur: 9, n: '형들', t: '당신의 종 우리들은 열두 형제로서 가나안 땅 한 사람의 아들들이라. 말째는 오늘 아비와 함께 있고 하나는 없어졌나이다.', ref: '창세기 42:13', e: 'fear' },
    { cam: [jx + 0.9, gh + 1.7, jz + 1.1], look: [jx, gh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '내가 너희에게 이르기를 너희는 정탐들이라 한 말이 이것이니라. 너희는 이같이 하여 시험을 받을지니, 바로의 생명으로 맹세하노니 너희 말째 아우가 여기 오지 아니하면 너희가 이곳에서 떠나지 못하리라.', ref: '창세기 42:14–15', e: 'cold' },
    { cam: [jx - 1.1, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '너희 중 하나를 보내어 너희 아우를 데려오게 하고 너희는 갇히어 있으라. 내가 너희 말을 시험하여 너희 중에 진실이 있는지 보리라. 바로의 생명으로 맹세하노니 그리하지 아니하면 너희는 과연 정탐이니라.', ref: '창세기 42:16', e: 'cold' },
    { fn: () => prisonRow7(), cam: [yx + 7, yh + 2.4, yz + 8], cam2: [yx + 5, yh + 2, yz + 6], look: [yx + 1, yh + 0.8, yz + 1.5], dur: 7, music: 'j_court', t: '그들을 다 함께 삼 일을 가두었더라.', ref: '창세기 42:17', fadeOut: 1.4 },
  ], () => { SPY7(S).day = S.day; GG.UI.quest(); next && next(); });
}
function cinSpiesB(S, G, next) { /* 42:18–24 · on the third day, at the prison where Joseph himself was once kept */ const [yx, yz] = SPOTS.yard, yh = hAt(yx, yz), jx = yx + 1, jz = yz - 2.4;
  cine([
    { hour: 9, fn: () => { prisonRow7(); G.teleport(jx, jz, 0); BRO.forEach(id => { const n = G.npc(id); if (n) n.act = null; }); }, cam: [yx + 6, yh + 2.6, yz + 7], look: [yx + 1, yh + 1, yz], dur: 6, t: '사흘 만에 요셉이 그들에게 이르되,', ref: '창세기 42:18' },
    { cam: [jx + 0.9, yh + 1.7, jz + 1.1], look: [jx, yh + 1.6, jz], dur: 9, fov: 0.55, n: '요셉', t: '나는 하나님을 경외하노니 너희는 이같이 하여 생명을 보전하라. 너희가 확실한 자이면 너희 형제 중 한 사람만 너희 갇혔던 옥에 갇히게 하고, 너희는 곡식을 가지고 가서 너희 집의 굶주림을 구하고, 너희 말째 아우를 내게로 데리고 오라. 그러면 너희 말이 진실하게 되고 너희가 죽지 아니하리라.', ref: '창세기 42:18–20', e: 'calm' },
    { cam: [yx + 2.6, yh + 1.4, yz + 4], look: [yx + 1, yh + 1.1, yz + 1.6], dur: 10, n: '형들', t: '우리가 아우의 일로 인하여 범죄하였도다. 그가 우리에게 애걸할 때에 그 마음의 괴로움을 보고도 듣지 아니하였으므로 이 괴로움이 우리에게 임하도다.', ref: '창세기 42:21', e: 'sad' },
    { cam: [yx + 3, yh + 1.4, yz + 4.4], look: [yx + 1, yh + 1.2, yz + 1.6], dur: 9, n: '르우벤', t: '내가 너희에게 그 아이에게 죄를 짓지 말라 하지 아니하였더냐. 그래도 너희가 듣지 아니하였느니라. 그러므로 그의 핏값을 치르게 되도다.', ref: '창세기 42:22', e: 'sad' },
    { fn: () => cpose('weep', 6), cam: [jx - 3, yh + 1.5, jz - 2.4], look: [jx, yh + 1.4, jz], dur: 7, t: '그들 사이에 통역을 세웠으므로 그들은 요셉이 듣는 줄을 알지 못하였더라. 요셉이 그들을 떠나가서 울고,', ref: '창세기 42:23–24' },
    { fn: () => { cpose(null); const n = G.npc('simeon'); if (n) { n.emote = null; n.act = 'kneelRest'; } }, cam: [yx - 0.6, yh + 1.6, yz + 0.4], look: [yx - 1.5, yh + 0.9, yz + 1.6], dur: 7, t: '다시 돌아와서 그들과 말하다가 그들 중에서 시므온을 끌어내어 그들의 눈앞에서 결박하고', ref: '창세기 42:24', fadeOut: 1.2 },
  ], () => { const n = G.npc('simeon'); if (n) n.act = null; hide(['simeon']); BRO.forEach(id => { const m = G.npc(id); if (m && id !== 'simeon') m.act = null; }); G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0); SPY7(S).b = 1; GG.UI.quest(); next && next(); });
}
const spyLeft7 = S => { const d = SPY7(S).day; return d === undefined ? 0 : Math.max(0, d + 2 - S.day); };
Object.assign(steps.g1_spy, {
  obj: S => { const c = SPY7(S); if (c.day === undefined) return '정탐이라 하기'; if (!c.b) return spyLeft7(S) ? `형들이 옥에 갇혀 있어요 · 사흘째까지 ${spyLeft7(S)}일 (곁이야기를 해도 돼요)` : '사흘째 · 옥으로 가서 형들 앞에 서기'; return '청지기에게 형들의 자루를 채우라 이르기'; },
  list: S => { const c = SPY7(S); return [{ t: '사흘 동안 기다리기', ok: c.day !== undefined && !spyLeft7(S) }, { t: '사흘째 옥으로 가기', ok: !!c.b }, { t: '청지기에게 이르기', ok: qd(S, 'sacks') }]; },
  enter(S, G, re) { ageBrothers(); const c = SPY7(S); if (!re && c.day === undefined) cinSpies(S, G, () => G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0)); else if (!c.b) { S.q.broShow = 1; prisonRow7(); } },
  target: S => { const c = SPY7(S); if (!c.b) return spyLeft7(S) ? null : { x: GATE3[0], z: GATE3[1] - 2 }; return 'npc:steward2'; },
  next: 'g3_feast', done(S, G, next) { cinDepart(S, G, () => { hide(['simeon']); cinJudahPledge(S, G, next); }); } });
{ const t0 = steps.g1_spy.talk.steward2; steps.g1_spy.talk.steward2 = function (S, G) { if (!SPY7(S).b) return false; const say0 = GG.UI.say; GG.UI.say = function (lines, done) { lines = lines.map(l => l && l.t && /형들의 마음이 변했는지/.test(l.t) ? Object.assign({}, l, { t: '요셉이 명한 것은 곡물을 그 그릇에 채우게 하는 것이었어요.', ref: '창세기 42:25' }) : l); return say0.call(this, lines, done); }; try { return t0.call(this, S, G); } finally { GG.UI.say = say0; } }; }
/* the old Simeon visit (not in the Bible) is gone: an old save there goes on to Judah's pledge and the feast */
Object.assign(steps.g2_simeon, { obj: '형들이 가나안으로 돌아갔어요', talk: {}, check: () => false, target: null, enter(S, G) { hide(['simeon']); setTimeout(() => cinJudahPledge(S, G, () => G.go('g3_feast')), 80); } });
/* 45:1 only: 「모든 사람은 내게서 물러가라」 (no 「a little harsher」) */
Object.assign(steps.g5_reveal, { enter(S, G, re) { atHouse(S); G.teleport(G7HOUSE[0], G7HOUSE[1], 0);
  setTimeout(() => { if (Gm().S().step !== 'g5_reveal') return; say([T('요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리 질러', '창세기 45:1'), { n: '', t: '요셉이 외쳤어요.', choices: [{ t: '「모든 사람은 내게서 물러가라」', then: () => tick(Gm().S(), 'revealJ') }] }], null); }, re ? 900 : 300); } });
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || S.step !== 'g1_spy' || G.cineOn || GG.UI.busy()) return null; const c = SPY7(S); if (c.day === undefined || c.b || spyLeft7(S)) return null;
  const d = Math.hypot(GATE3[0] - p.x, GATE3[1] - 2 - p.z); if (d > 4) return null; return [{ d: d - 0.8, x: GATE3[0], z: GATE3[1] - 2, y: 1, story: true, noMagnet: true, key: 'g1Prison', label: '옥에 들어가 형들 앞에 서기 (사흘째)', use: () => cinSpiesB(S, G, () => G.checkStep()) }]; });
