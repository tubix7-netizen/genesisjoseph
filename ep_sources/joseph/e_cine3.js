
// =================================================================== v16.7 7장 형제들 · 8장 고센 땅 (창세기 42:9 – 47:12)
/* The story no longer stops when the brothers bow. 7장: 정탐꾼 누명 → 시므온을 묶어 둠 → 자루에 은을 도로 넣음 → 옥의 시므온 →
   야곱이 베냐민을 보냄(유다의 담보) → 요셉의 집 잔치(나이 순서 자리 · 베냐민의 다섯 배 몫) → 은잔 → 유다의 간청 → 「나는 요셉이라」.
   8장: 아버지께 보낼 수레와 선물 → 브엘세바의 밤 → 고센에서 아버지를 맞음 → 바로 앞에서(목자라 하라) → 고센에 정착.
   After that the free journey (j_end) adds 고센 마을: Jacob's tents, the brothers, sheep — and their side requests (IF). */
const GOSHEN = [78, 56];
const BRO11 = ['reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun', 'benjamin2'];
const AGE = { reuben: '레아의 맏아들', simeon: '레아의 둘째', levi: '레아의 셋째', judah: '레아의 넷째', dan: '빌하의 첫째', naphtali: '빌하의 둘째', gad: '실바의 첫째', asher: '실바의 둘째', issachar: '레아의 다섯째', zebulun: '레아의 여섯째', benjamin2: '라헬의 둘째, 막내' };
const grown = id => { const L0 = LOOK[id] || LOOK.man; return Object.assign({}, L0, { beard: L0.beard === 'none' ? 'short' : 'long', beardCol: L0.beardCol || L0.hair, build: (L0.build || 1) * 1.04 }); };
const ageBrothers = () => { for (const id of BRO) { const n = Gm().npc(id); if (n && !n.d.grown) npcSet(id, { look: grown(id), grown: 1 }); } };
for (const n of npcs) { if (n.id === 'jacob' || n.id === 'benjamin2') { const s0 = n.show; n.show = S => s0(S) || !!S.q.goshen || !!S.q.famShow; } }
const GH = () => hAt(GOSHEN[0], GOSHEN[1]);
const hide = ids => ids.forEach(id => { const n = Gm().npc(id); if (n) n.forceVis = false; });
const showAt = (id, x, z, f, o) => place(id, x, z, f, Object.assign({ vis: true }, o || {}));
const brosRow = (x, z, f, ids, gap) => (ids || BRO).forEach((id, i) => showAt(id, x + (i % 6) * (gap || 1.5) - 3.6, z + Math.floor(i / 6) * 1.6, f));
const G7GRAN = [16, -58], G7HOUSE = [SPOTS.josephHouse[0], SPOTS.josephHouse[1] + 6], /* the courtyard in front of the house */ G7YARD = SPOTS.yard, G7HEB = SPOTS.jacobTent;
const atHouse = S => { S.q.broShow = 1; S.q.famShow = 1; ageBrothers(); const [hx, hz] = G7HOUSE; BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); };

function cinSpies(S, G, next) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz), jx = gx, jz = gz - 1.6;
  cine([
    { hour: 10, fn: () => { ageBrothers(); S.q.broShow = 1; G.teleport(jx, jz, 0); brosRow(gx, gz + 4, Math.PI); },
      cam: [gx + 6, gh + 2.2, gz + 9], look: [gx, gh + 1.2, gz + 3], dur: 6, music: 'j_mourn', t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고 그들에게 이르되,', ref: '창세기 42:9' },
    { cam: [jx + 1.4, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 6, n: '요셉', t: '너희는 정탐꾼이라. 이 나라의 틈을 엿보러 왔느니라.', ref: '창세기 42:9', e: 'cold' },
    { cam: [gx - 2, gh + 1.3, gz + 1.8], look: [gx - 0.6, gh + 1.1, gz + 4], dur: 8, n: '유다', t: '아니니이다, 내 주여. 우리는 다 한 사람의 아들들로서 확실한 자들이니, 열두 형제가 가나안 땅 한 사람의 아들들이라. 막내는 오늘 우리 아버지와 함께 있고 하나는 없어졌나이다.', ref: '창세기 42:10–13', e: 'fear' },
    { cam: [jx + 0.9, gh + 1.7, jz + 1.1], look: [jx, gh + 1.6, jz], dur: 8, fov: 0.55, n: '요셉', t: '너희 형제 중 하나만 옥에 갇히게 하고 너희는 곡식을 가지고 가서 너희 집안의 굶주림을 구하고, 너희 막내 아우를 내게로 데리고 오라.', ref: '창세기 42:19–20', e: 'cold' },
    { cam: [gx + 2.6, gh + 1.4, gz + 6.8], look: [gx, gh + 1.2, gz + 4.2], dur: 9, n: '르우벤', t: '내가 너희에게 그 아이에 대하여 죄를 짓지 말라고 하지 아니하였더냐? 그래도 너희가 듣지 아니하였느니라. 그러므로 그의 핏값을 치르게 되었도다.', ref: '창세기 42:22', e: 'sad' },
    { fn: () => cpose('weep', 6), cam: [jx - 3, gh + 1.5, jz - 2.4], look: [jx, gh + 1.4, jz], dur: 7, t: '그들은 요셉이 통역을 세운 까닭에 그가 알아들은 줄을 알지 못하였더라. 요셉이 그들을 떠나가서 울고,', ref: '창세기 42:23–24' },
    { fn: () => { cpose(null); const n = G.npc('simeon'); if (n) { n.act = 'kneelRest'; } }, cam: [gx - 0.6, gh + 1.6, gz + 1.4], look: [gx - 1.5, gh + 0.9, gz + 4], dur: 7, t: '다시 돌아와서 그들과 말하다가 그들 중에서 시므온을 끌어내어 그들의 눈앞에서 결박하고', ref: '창세기 42:24' },
  ], () => { const n = G.npc('simeon'); if (n) n.act = null; GG.UI.quest(); next && next(); });
}
function cinDepart(S, G, next) { const [gx, gz] = G7GRAN, gh = hAt(gx, gz);
  cine([
    { fn: () => { hide(['simeon']); BRO.filter(id => id !== 'simeon').forEach((id, i) => walkTo(id, gx + 30 + i, gz + 40, 1.6)); }, cam: [gx + 6, gh + 3, gz + 6], look: [gx + 14, gh + 1, gz + 18], dur: 7, music: 'j_mourn',
      t: '그들이 곡식을 나귀에 싣고 그 곳을 떠났더라. 한 사람이 여관에서 나귀에게 먹이를 주려고 자루를 풀고 본즉 그 돈이 자루 아귀에 있는지라.', ref: '창세기 42:26–27' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); }, cam: [G7HEB[0] + 3.4, hAt(G7HEB[0], G7HEB[1]) + 1.6, G7HEB[1] + 6.4], look: [G7HEB[0], hAt(G7HEB[0], G7HEB[1]) + 1.3, G7HEB[1] + 2.6], dur: 8,
      n: '야곱', t: '너희가 나에게 내 자식들을 잃게 하도다. 요셉도 없어졌고 시므온도 없어졌거늘 베냐민을 또 빼앗아 가고자 하니… 내 아들은 너희와 함께 내려가지 못하리니.', ref: '창세기 42:36, 38', e: 'weary' },
  ], () => { S.q.heb2 = 0; S.q.broShow = 0; npcSet('jacob', { look: LOOK.jacob }); BRO.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); next && next(); });
}
function cinJudahPledge(S, G, next) { const hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 8, fn: () => { S.q.heb2 = 1; brosRow(G7HEB[0], G7HEB[1] + 5, Math.PI, BRO.filter(id => id !== 'simeon')); place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); },
      cam: [G7HEB[0] + 5, hh + 2.6, G7HEB[1] + 10], look: [G7HEB[0], hh + 1.2, G7HEB[1] + 3], dur: 7, music: 'j_mourn', t: '그 땅에 기근이 심하고, 그들이 애굽에서 가져온 곡식을 다 먹으매', ref: '창세기 43:1–2' },
    { cam: [G7HEB[0] - 1.6, hh + 1.5, G7HEB[1] + 5.4], look: [G7HEB[0] - 0.6, hh + 1.5, G7HEB[1] + 4.8], dur: 9, n: '유다', t: '저 아이를 나와 함께 보내시면 우리가 곧 가리니, 그러면 우리와 아버지와 우리 어린 아이들이 다 살고 죽지 아니하리이다. 내가 그를 위하여 담보가 되오리니 아버지께서 내 손에서 그를 찾으소서.', ref: '창세기 43:8–9', e: 'solemn' },
    { cam: [G7HEB[0] + 1.4, hh + 1.6, G7HEB[1] + 4.6], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 9, n: '야곱', t: '그러할진대 이렇게 하라. 이 땅의 아름다운 소산을 그릇에 담아 가지고 내려가서 그 사람에게 예물로 드릴지니 곧 유향 조금과 꿀 조금과 향품과 몰약과 유향나무 열매와 감복숭아이니라.', ref: '창세기 43:11', e: 'weary' },
    { cam: [G7HEB[0] + 2.8, hh + 1.4, G7HEB[1] + 3.4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, n: '야곱', t: '전능하신 하나님께서 그 사람 앞에서 너희에게 은혜를 베푸사… 내가 자식을 잃게 되면 잃으리로다.', ref: '창세기 43:14', e: 'weary' },
  ], () => { S.q.heb2 = 0; npcSet('jacob', { look: LOOK.jacob }); next && next(); });
}
function cinFeast(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 12, fn: () => { G.teleport(hx, hz + 1.2, 0); S.q.broShow = 1; BRO11.forEach((id, i) => showAt(id, hx - 6 + (i % 6) * 2.2, hz + 6 + Math.floor(i / 6) * 2, Math.PI)); },
      cam: [hx + 7, hh + 2.6, hz + 12], look: [hx, hh + 1.2, hz + 6], dur: 7, music: 'j_finale', t: '요셉이 베냐민이 그들과 함께 있음을 보고 자기의 청지기에게 이르되, 「이 사람들을 집으로 인도해 들이고 짐승을 잡고 준비하라. 이 사람들이 정오에 나와 함께 먹을 것이니라」', ref: '창세기 43:16' },
    { cam: [hx + 1.8, hh + 1.6, hz + 3.2], look: [hx + 0.4, hh + 1.4, hz + 6.2], dur: 7, fov: 0.55, n: '요셉', t: '너희 아버지 너희가 말하던 그 노인이 잘 있느냐? 아직 살아 있느냐?', ref: '창세기 43:27' },
    { fn: () => { BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'prostrate', t: -i * 0.1, dur: 7, amb: true }; }); }, cam: [hx - 4, hh + 2.4, hz + 2], look: [hx - 1, hh + 0.5, hz + 6.5], dur: 7, n: '유다', t: '주의 종 우리 아버지가 평안하고 지금까지 살아 있나이다.', ref: '창세기 43:28' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }), cam: [hx + 4.2, hh + 1.5, hz + 8.8], look: [hx + 4.4, hh + 1.3, hz + 8], dur: 7, n: '요셉', t: '너희가 내게 말하던 너희 작은 동생이 이 아이냐? 소자여, 하나님이 너에게 은혜 베푸시기를 원하노라.', ref: '창세기 43:29' },
    { fn: () => { G.teleport(hx + 13, hz - 1, -Math.PI / 2); cpose('weep', 8); }, cam: [hx + 10.8, hAt(hx + 13, hz - 1) + 1.5, hz + 0.6], look: [hx + 13, hAt(hx + 13, hz - 1) + 1.4, hz - 1], dur: 8, fadeIn: 0.6,
      t: '요셉이 아우를 사랑하는 마음이 복받쳐 급히 울 곳을 찾아 안방으로 들어가서 울고, 얼굴을 씻고 나와서 그 정을 억제하고 음식을 차리라 하매', ref: '창세기 43:30–31' },
  ], () => { cpose(null); G.teleport(hx, hz + 1.2, 0); next && next(); });
}
function cinMarvel(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => BRO11.forEach((id, i) => showAt(id, hx - 6 + i * 1.2, hz + 7, Math.PI, { sit: true, act: 'eat' })), cam: [hx + 8, hh + 2.6, hz + 11], look: [hx, hh + 0.9, hz + 7], dur: 8, music: 'j_finale',
      t: '그들이 요셉 앞에 앉되 그 나이에 따라 앉게 되니 그들이 서로 이상히 여겼더라.', ref: '창세기 43:33' },
    { cam: [hx + 6.6, hh + 1.3, hz + 5], look: [hx + 6, hh + 0.9, hz + 7], dur: 8, t: '요셉이 자기 음식을 그들에게 주되 베냐민에게는 다른 사람보다 다섯 배나 주매, 그들이 마시며 요셉과 함께 즐거워하였더라.', ref: '창세기 43:34' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.act = null; } }); next && next(); });
}
function cinCup(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { hour: 6, fn: () => { BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 4, cz + Math.floor(i / 6) * 1.8, 0.6)); showAt('steward2', cx - 3, cz - 6, 0.4); },
      cam: [cx + 8, ch + 3, cz - 8], look: [cx, ch + 1.2, cz], dur: 7, music: 'j_mourn', t: '아침이 밝을 때에 사람들과 그들의 나귀들을 보내니라. 그들이 성읍에서 나가 멀리 가기 전에 요셉의 청지기가 그들을 따라 미쳐', ref: '창세기 44:3–6' },
    { fn: () => { const n = G.npc('benjamin2'); if (n) n.act = 'kneelRest'; }, cam: [cx + 4.4, ch + 1.4, cz + 3.2], look: [cx + 4, ch + 0.8, cz + 1.8], dur: 8, t: '그들이 각각 급히 자루를 땅에 내리고 자루를 각기 푸니, 그가 나이 많은 자에게서부터 시작하여 나이 적은 자에게까지 조사하매 그 잔이 베냐민의 자루에서 발견된지라.', ref: '창세기 44:11–12' },
    { fn: () => BRO11.forEach((id, i) => { const n = G.npc(id); if (n) n.emote = { k: 'weep', t: -i * 0.1, dur: 9, amb: true }; }), cam: [cx - 3, ch + 2.2, cz + 5], look: [cx, ch + 1, cz + 0.6], dur: 6, t: '그들이 옷을 찢고 각기 짐을 나귀에 싣고 성으로 돌아가니라.', ref: '창세기 44:13' },
    { fn: () => { G.teleport(hx, hz + 1.2, 0); BRO11.forEach((id, i) => { const n = showAt(id, hx - 5 + (i % 6) * 2, hz + 5 + Math.floor(i / 6) * 1.6, Math.PI); if (n) n.emote = { k: 'prostrate', t: -i * 0.08, dur: 10, amb: true }; }); hide(['steward2']); },
      cam: [hx + 5, hh + 2.4, hz + 9], look: [hx, hh + 0.6, hz + 5], dur: 7, fadeIn: 0.8, t: '유다와 그의 형제들이 요셉의 집에 이르니 요셉이 아직 그 곳에 있는지라. 그의 앞에서 땅에 엎드리니', ref: '창세기 44:14' },
  ], () => { BRO11.forEach(id => { const n = G.npc(id); if (n) n.emote = null; }); next && next(); });
}
function cinPlea(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4), jd = () => G.npc('judah');
  cine([
    { fn: () => { const n = jd(); if (n) { G.npcTo('judah', hx + 0.4, hz + 3.2, Math.PI, false); n.act = 'kneelRest'; } }, cam: [hx - 1.6, hh + 1.3, hz + 2.2], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, music: 'j_mourn',
      n: '유다', t: '내 주여, 원하건대 당신의 종에게 내 주의 귀에 한 말씀을 아뢰게 하소서. 우리 아버지의 생명과 아이의 생명이 서로 하나로 묶여 있거늘,', ref: '창세기 44:18, 30', e: 'cry' },
    { cam: [hx + 1.6, hh + 1.2, hz + 4], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '아이가 우리와 함께 가지 아니함을 아버지가 보면 아버지가 죽으리니, 이같이 되면 종들이 주의 종 우리 아버지의 흰 머리로 슬피 스올로 내려가게 함이니이다.', ref: '창세기 44:31', e: 'cry' },
    { cam: [hx - 0.8, hh + 1.3, hz + 4.6], look: [hx + 0.4, hh + 1, hz + 3.2], dur: 9, n: '유다', t: '이제 주의 종으로 그 아이를 대신하여 머물러 있어 내 주의 종이 되게 하시고 그 아이는 그의 형제들과 함께 올려 보내소서. 그 아이가 나와 함께 가지 아니하면 내가 어찌 내 아버지에게로 올라갈 수 있으리이까.', ref: '창세기 44:33–34', e: 'cry' },
    { cam: [hx + 0.9, hh + 1.7, hz + 1], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.5, t: '스무 해 전, 형을 팔자고 했던 유다가 이제 아우를 위해 자기를 내어 주고 있었습니다.', ref: '창세기 37:26–27; 44:33' },
  ], () => { const n = jd(); if (n) n.act = null; next && next(); });
}
function cinIAmJoseph(S, G, next) { const [hx, hz] = G7HOUSE, hh = hAt(hx, hz + 4);
  cine([
    { fn: () => { cpose('weep', 10); BRO11.forEach((id, i) => showAt(id, hx - 4 + (i % 6) * 1.6, hz + 4 + Math.floor(i / 6) * 1.5, Math.PI)); }, cam: [hx + 2, hh + 1.6, hz - 1.8], look: [hx, hh + 1.5, hz + 0.6], dur: 8, music: 'j_finale',
      t: '요셉이 시종하는 자들 앞에서 그 정을 억제하지 못하여 소리 질러 「모든 사람은 나를 떠나 나가라」 하고, 그들에게 자기를 알리니라. 요셉이 큰 소리로 우니 애굽 사람에게 들리며 바로의 궁중에 들리더라.', ref: '창세기 45:1–2' },
    { cam: [hx + 1, hh + 1.7, hz + 1.2], look: [hx, hh + 1.6, hz], dur: 7, fov: 0.48, n: '요셉', t: '나는 요셉이라. 내 아버지께서 아직 살아 계시니이까?', ref: '창세기 45:3', e: 'cry' },
    { fn: () => BRO11.forEach(id => { const n = G.npc(id); if (n) n.act = 'kneelRest'; }), cam: [hx - 3, hh + 1.8, hz + 1], look: [hx - 1, hh + 1, hz + 4.5], dur: 6, t: '형들이 그 앞에서 놀라서 대답하지 못하더라.', ref: '창세기 45:3' },
    { cam: [hx + 1.4, hh + 1.6, hz + 1.6], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '나는 당신들의 아우 요셉이니 당신들이 애굽에 판 자라. 당신들이 나를 이 곳에 팔았다고 해서 근심하지 마소서. 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다.', ref: '창세기 45:4–5', e: 'cry' },
    { cam: [hx - 1.2, hh + 1.6, hz + 1.8], look: [hx, hh + 1.6, hz], dur: 9, n: '요셉', t: '그런즉 나를 이리로 보낸 이는 당신들이 아니요 하나님이시라. 하나님이 나를 바로에게 아버지로 삼으시고 그 온 집의 주로 삼으시며 애굽 온 땅의 통치자로 삼으셨나이다.', ref: '창세기 45:8', e: 'tender' },
    { fn: () => { const b = G.npc('benjamin2'); if (b) { b.act = null; G.npcTo('benjamin2', hx + 0.5, hz + 0.9, Math.PI, false); b.emote = { k: 'weep', t: 0, dur: 9, amb: true }; } }, cam: [hx + 2.6, hh + 1.5, hz + 0.4], look: [hx + 0.2, hh + 1.4, hz + 0.5], dur: 8,
      t: '자기 아우 베냐민의 목을 안고 우니 베냐민도 요셉의 목을 안고 우니라. 요셉이 또 형들과 입맞추며 안고 우니 형들이 그제서야 요셉과 말하니라.', ref: '창세기 45:14–15' },
  ], () => { cpose(null); BRO11.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next && next(); });
}
function cinSendOff(S, G, next) { const cx = 34, cz = -30, ch = hAt(cx, cz), hh = hAt(G7HEB[0], G7HEB[1]);
  cine([
    { hour: 7, fn: () => { G.teleport(cx - 2, cz - 3, 0.5); BRO11.forEach((id, i) => showAt(id, cx + (i % 6) * 1.6 - 3, cz + 2 + Math.floor(i / 6) * 1.8, 0.4)); },
      cam: [cx + 6, ch + 2.6, cz - 5], look: [cx, ch + 1.2, cz + 2], dur: 8, music: 'j_finale', t: '그들에게 다 각기 옷 한 벌씩을 주되 베냐민에게는 은 삼백과 옷 다섯 벌을 주고, 그 아버지에게는 수나귀 열 필에 애굽의 좋은 물품을 실리고 암나귀 열 필에는 곡식과 떡과 양식을 실렸더라.', ref: '창세기 45:22–23' },
    { cam: [cx - 0.4, ch + 1.7, cz - 1.6], look: [cx - 2, ch + 1.6, cz - 3], dur: 6, n: '요셉', t: '당신들은 길에서 다투지 말라.', ref: '창세기 45:24', e: 'happy' },
    { fn: () => { S.q.heb2 = 1; place('jacob', G7HEB[0], G7HEB[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacob }); }, cam: [G7HEB[0] + 3, hh + 1.5, G7HEB[1] + 5.6], look: [G7HEB[0], hh + 1.4, G7HEB[1] + 2.6], dur: 8, fadeIn: 0.8,
      t: '그들이 가나안 땅으로 들어가서 아버지 야곱에게 이르러 알리되 「요셉이 지금까지 살아 있어 애굽 땅 총리가 되었더이다」 야곱이 그들의 말을 믿지 못하여 어리둥절하더니, 요셉이 보낸 수레를 보고서야 기운이 소생한지라.', ref: '창세기 45:26–27' },
    { cam: [G7HEB[0] + 1.2, hh + 1.6, G7HEB[1] + 4], look: [G7HEB[0], hh + 1.5, G7HEB[1] + 2.6], dur: 7, fov: 0.55, n: '야곱', t: '족하도다. 내 아들 요셉이 지금까지 살아 있으니 내가 죽기 전에 가서 그를 보리라.', ref: '창세기 45:28', e: 'cry' },
    { hour: 21, fn: () => { place('jacob', G7HEB[0] + 6, G7HEB[1] - 20, 0.3, { act: 'kneelRest' }); }, cam: [G7HEB[0] + 9, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.4, G7HEB[1] - 16], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 1.2, G7HEB[1] - 20], dur: 9, fadeIn: 1,
      t: '이스라엘이 브엘세바에 이르러 그의 아버지 이삭의 하나님께 희생제사를 드리니, 그 밤에 하나님이 이상 중에 이스라엘에게 나타나 이르시되', ref: '창세기 46:1–2' },
    { cam: [G7HEB[0] + 6.6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 3, G7HEB[1] - 17], look: [G7HEB[0] + 6, hAt(G7HEB[0] + 6, G7HEB[1] - 20) + 12, G7HEB[1] - 24], dur: 9, fov: 1.1,
      t: '「나는 하나님이라 네 아버지의 하나님이니 애굽으로 내려가기를 두려워하지 말라. 내가 거기서 너로 큰 민족을 이루게 하리라. 내가 너와 함께 애굽으로 내려가겠고 반드시 너를 인도하여 다시 올라올 것이며」', ref: '창세기 46:3–4' },
  ], () => { S.q.heb2 = 0; S.q.broShow = 0; S.q.famShow = 0; const n = G.npc('jacob'); if (n) n.act = null; BRO11.forEach(id => { const n2 = G.npc(id); if (n2) n2.forceVis = undefined; }); next && next(); });
}
function goshenCamp(S) { const Bd = GG.Build; if (S.flags.gvil || !Bd || !Bd.prebuild) return; S.flags.gvil = 1; const [x0, z0] = GOSHEN;
  const put = (k, dx, dz, ry, name) => { for (let t = 0; t < 12; t++) { const a = t * 2.4, r = t ? 1.5 + t * 0.8 : 0, x = x0 + dx + Math.sin(a) * r, z = z0 + dz + Math.cos(a) * r; if (!Bd.check(k, x, z, ry, 1, true)) { Bd.prebuild(S, k, x, z, ry, name); return; } } };
  put('tent', -6, -3, 0.4, '야곱의 장막'); put('tent', 4, -6, -0.3, '르우벤의 장막'); put('tent', 9, 2, -1.2, '유다의 장막'); put('tent', -9, 6, 1.1, '레위의 장막'); put('tent', 2, 9, 2.6, '베냐민의 장막');
  put('campfire', 0, 1, 0, '고센 모닥불'); put('pen', -14, -10, 0.2, '고센 양 우리'); put('pen', 14, -12, -0.4, '고센 염소 우리'); put('well', 6, -1, 0, '고센 우물'); put('altar', -2, 14, 0, '고센 돌 제단'); put('oven', -3, -6, 0, '고센 화덕'); }
const GPOS = { jacob: [-5, -1, 0.6], reuben: [4.5, -3.6, -0.6], simeon: [6, -4.4, -1], levi: [-7.6, 4.4, 1.6], judah: [7.6, 1.4, -1.5], dan: [-2.4, -8, 0.2], naphtali: [-0.6, -8.6, 0.1], gad: [-12, -7, 0.8], asher: [-11, -4.6, 1.2],
  issachar: [11, -9, -0.5], zebulun: [12.4, -7.4, -0.9], benjamin2: [2.2, 7, 2.8] };
function placeGoshen(S) { const [x0, z0] = GOSHEN; for (const id in GPOS) { const [dx, dz, f] = GPOS[id]; const n = Gm().npc(id); if (!n) continue; Gm().npcTo(id, x0 + dx, z0 + dz, f, false); n.walk = null; n.sit = id === 'jacob'; n.act = null; n.emote = null; n.forceVis = undefined;
  if (id !== 'jacob' && id !== 'benjamin2') n.wander = { r: 3, cx: x0 + dx, cz: z0 + dz, tx: null, wait: 2 }; }
  if (!RT.gSheep) { RT.gSheep = 1; for (let i = 0; i < 9; i++) { const a = i * 0.7, r = 6 + (i % 3) * 3; GG.Game.spawnNPC({ id: 'gsheep' + i, name: '고센의 양', animal: i % 4 === 3 ? 'goat' : 'sheep', pattern: i % 5 === 2 ? 'black' : 'plain', x: x0 - 14 + Math.cos(a) * r * 0.5, z: z0 - 18 + Math.sin(a) * r * 0.5, wander: 5, noTalk: true, noTag: true }); } } }
function cinReunion(S, G, next) { const [x0, z0] = GOSHEN, gh = GH();
  cine([
    { hour: 16, fn: () => { S.q.goshen = 1; S.q.broShow = 1; goshenCamp(S); BRO11.forEach((id, i) => showAt(id, x0 - 8 + (i % 6) * 2.4, z0 + 10 + Math.floor(i / 6) * 2, Math.PI)); place('jacob', x0, z0 + 6, Math.PI); npcSet('jacob', { look: LOOK.jacob }); G.teleport(x0, z0 - 6, 0); },
      cam: [x0 + 14, gh + 4, z0 - 6], cam2: [x0 + 10, gh + 3, z0 - 2], look: [x0, gh + 1.2, z0 + 4], dur: 8, music: 'j_finale', t: '야곱이 유다를 요셉에게 미리 보내어 자기를 고센으로 인도하게 하고 다 고센 땅에 이르니, 요셉이 그의 수레를 갖추고 고센으로 올라가서 그의 아버지 이스라엘을 맞으며', ref: '창세기 46:28–29' },
    { fn: () => { G.teleport(x0, z0 + 4.8, 0); cpose('weep', 12); const j = G.npc('jacob'); if (j) j.emote = { k: 'weep', t: 0, dur: 12, amb: true }; }, cam: [x0 + 2.4, gh + 1.6, z0 + 5.6], look: [x0, gh + 1.5, z0 + 5.4], dur: 9, fov: 0.6,
      t: '그에게 보이고 그의 목을 어긋맞춰 안고 얼마 동안 울매', ref: '창세기 46:29' },
    { cam: [x0 - 1.4, gh + 1.6, z0 + 7.4], look: [x0, gh + 1.6, z0 + 6], dur: 9, n: '야곱', t: '네가 지금까지 살아 있고 내가 네 얼굴을 보았으니 지금 죽어도 족하도다.', ref: '창세기 46:30', e: 'cry' },
    { cam: [x0 + 1.4, gh + 1.6, z0 + 4], look: [x0, gh + 1.6, z0 + 4.8], dur: 7, n: '요셉', t: '아버지… 스무 해 동안, 하나님은 하루도 저를 떠나지 않으셨어요.', e: 'cry' },
    { fn: () => { cpose(null); const j = G.npc('jacob'); if (j) j.emote = null; }, cam: [x0 + 18, gh + 9, z0 + 18], cam2: [x0 + 22, gh + 14, z0 + 22], look: [x0, gh + 1, z0 + 3], dur: 9, fadeOut: 1.2,
      t: '애굽에 이른 야곱의 집 사람이 모두 칠십 명이었더라.', ref: '창세기 46:27' },
  ], () => { placeGoshen(S); G.teleport(x0 + 2, z0 - 4, 0); next && next(); });
}
function cinPharaoh(S, G, next) { const [cx, cz] = SPOTS.court, ch = hAt(cx, cz), FIVE = ['reuben', 'judah', 'levi', 'asher', 'benjamin2'];
  cine([
    { hour: 10, fn: () => { S.q.pharShow = 1; G.teleport(cx + 1.6, cz - 1, Math.PI); FIVE.forEach((id, i) => showAt(id, cx - 2.4 + i * 1.2, cz + 1.4, Math.PI)); showAt('jacob', cx, cz - 2.4, Math.PI); },
      cam: [cx + 6, ch + 3, cz + 6], look: [cx, ch + 1.4, cz - 6], dur: 7, music: 'j_finale', t: '요셉이 그의 형들 중 다섯 명을 택하여 바로에게 보이니', ref: '창세기 47:2' },
    { cam: [cx - 2, ch + 2.4, cz - 2], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 6, n: '바로', t: '너희의 생업이 무엇이냐?', ref: '창세기 47:3' },
    { cam: [cx + 2.4, ch + 1.5, cz - 1], look: [cx - 1, ch + 1.4, cz + 1.4], dur: 8, n: '유다', t: '종들은 목자이온데 우리와 우리 선조가 다 그러하니이다. 가나안 땅에 기근이 심하여 종들의 양 떼를 칠 곳이 없기로 이 곳에 거류하고자 왔사오니 종들로 고센 땅에 살게 하소서.', ref: '창세기 47:3–4' },
    { cam: [cx - 1.6, ch + 2.2, cz - 3], look: [-30, hAt(-30, -177) + 2, -177.2], dur: 8, n: '바로', t: '애굽 땅이 네 앞에 있으니 땅의 좋은 곳에 네 아버지와 네 형제가 거주하게 하되 그들이 고센 땅에 거주하고, 그들 중에 능력 있는 자가 있거든 그들로 내 가축을 관리하게 하라.', ref: '창세기 47:6' },
    { cam: [cx + 1.6, ch + 1.6, cz - 4.2], look: [cx, ch + 1.5, cz - 2.4], dur: 7, n: '바로', t: '네 나이가 얼마냐?', ref: '창세기 47:8' },
    { cam: [cx - 1.2, ch + 1.6, cz - 1.2], look: [cx, ch + 1.5, cz - 2.4], dur: 9, n: '야곱', t: '내 나그네 길의 세월이 백삼십 년이니이다. 내 나이가 얼마 못 되니 우리 조상의 나그네 길의 연조에 미치지 못하나 험악한 세월을 보내었나이다.', ref: '창세기 47:9', e: 'weary' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = 'raiseHands'; }, cam: [cx + 3, ch + 2, cz - 0.6], look: [cx, ch + 1.6, cz - 3.4], dur: 7, t: '야곱이 바로에게 축복하고 그 앞에서 나오니라.', ref: '창세기 47:10' },
    { fn: () => { const j = G.npc('jacob'); if (j) j.act = null; placeGoshen(S); }, cam: [GOSHEN[0] + 20, GH() + 10, GOSHEN[1] - 16], cam2: [GOSHEN[0] + 14, GH() + 6, GOSHEN[1] - 10], look: [GOSHEN[0], GH() + 1, GOSHEN[1]], dur: 10, fadeIn: 1,
      t: '요셉이 바로의 명령대로 그의 아버지와 그의 형들에게 거주할 곳을 주되 애굽의 좋은 땅 라암셋을 그들에게 주어 소유로 삼게 하고, 또 그의 아버지와 그의 형들과 그의 아버지의 온 집에 그 식구를 따라 먹을 것을 주어 봉양하였더라.', ref: '창세기 47:11–12' },
  ], () => { S.q.pharShow = 0; next && next(); });
}
// --- 나이 순서 자리 (창 43:33): the brothers were seated "the firstborn according to his birthright"
function seatPuzzle(S, G, done) { let k = 0, miss = 0; const ORD = BRO11;
  const ask = () => { if (k >= ORD.length) { done(miss); return; } const rest = ORD.slice(k), right = ORD[k], pool = rest.slice(1).sort(() => Math.random() - 0.5).slice(0, 3), opts = [right].concat(pool).sort(() => Math.random() - 0.5);
    say([{ n: '요셉', t: `${k + 1}번째 자리에는…`, choices: opts.map(id => ({ t: `${NM[id] || '베냐민'} (${AGE[id]})`, then: () => { if (id === right) { k++; Gm().sfx('coin', { pitch: 1 + k * 0.03 }); setTimeout(ask, 30); } else { miss++; setTimeout(() => say([T(`음… ${NM[right] || '베냐민'}이(가) 더 먼저 태어났어요. 레아의 네 아들, 빌하의 두 아들, 실바의 두 아들, 다시 레아의 두 아들, 그리고 라헬의 베냐민 순서예요.`)], ask), 30); } } })) }], null); };
  ask(); }

const STEPS7 = {
  g1_spy: { ch: 8, obj: '청지기 네브에게 형들의 자루를 채우라 이르기', target: 'npc:steward2',
    enter(S, G, re) { if (!re) cinSpies(S, G, () => G.teleport(SPOTS.josephHouse[0] + 3, SPOTS.josephHouse[1] + 6, 0)); else ageBrothers(); },
    talk: { steward2(S, G) { if (S.q.sacks) return false; const order = [];
      const pick = () => say([{ n: '요셉', t: `청지기에게 무엇을 이를까? (${order.length}/3)`, choices: [
        { t: '그들의 그릇에 곡식을 채우라', then: () => { if (!order.includes('g')) order.push('g'); setTimeout(next2, 30); } },
        { t: '각 사람의 돈은 그의 자루에 도로 넣으라', then: () => { if (!order.includes('s')) order.push('s'); setTimeout(next2, 30); } },
        { t: '길 양식을 그들에게 주라', then: () => { if (!order.includes('p')) order.push('p'); setTimeout(next2, 30); } },
        { t: '돈을 받고 곡식은 조금만 주라', then: () => setTimeout(() => say([T('형들을 벌주려는 것이 아니에요. 요셉은 형들의 마음이 변했는지 보고 싶었고, 집안의 굶주림도 걱정했어요.')], pick), 30) }] }], null);
      const next2 = () => { if (order.length < 3) return pick(); say([N('steward2', '분부대로 하겠습니다, 총리님. 은은 자루 아귀에 몰래 넣어 두겠습니다.'), T('요셉이 명하여 곡물을 그 그릇에 채우게 하고 각 사람의 돈은 그의 자루에 도로 넣게 하고 또 길 양식을 그들에게 주게 하니 그대로 행하였더라. (창세기 42:25)')], () => tick(S, 'sacks')); };
      say([N('steward2', '총리님, 가나안에서 온 사람들의 나귀가 문 앞에 있습니다. 어떻게 할까요?')], pick); } },
    check: S => qd(S, 'sacks'), done(S, G, next) { cinDepart(S, G, next); }, next: 'g2_simeon' },
  g2_simeon: { ch: 8, obj: '옥에 갇힌 시므온 찾아가기', target: 'npc:simeon',
    enter(S, G) { S.q.broShow = 0; ageBrothers(); showAt('simeon', G7YARD[0] + 1.4, G7YARD[1] + 1.4, 0.4, { sit: true }); },
    talk: { simeon(S, G) { if (S.q.visitS) return false; say([N('simeon', '…총리께서 이 옥까지 무슨 일이십니까. 형제들은 반드시 돌아올 것입니다. 막내를 데리고요.', '', 'fear'),
      N('simeon', '밤마다 꿈에 한 소년이 보입니다. 구덩이 속에서 우리를 올려다보던 눈… 이 옥은 그 값인지도 모르지요.', '', 'sad'),
      { n: '요셉', t: '(무엇이라 답할까?)', choices: [{ t: '"이곳 간수장은 내가 아는 이요. 너를 잘 대하라 일러 두겠다."' }, { t: '"…네 하나님이 너를 잊지 않으셨을 것이다."' }] },
      T('요셉은 시므온에게 빵과 물을 넣어 주게 하고 옥을 나섰습니다. 문을 나서자마자 눈시울이 붉어졌습니다.'), T('(이 만남은 성경에 기록되지 않은 「IF」 장면이에요.)')], () => tick(S, 'visitS')); } },
    check: S => qd(S, 'visitS'), done(S, G, next) { hide(['simeon']); cinJudahPledge(S, G, next); }, next: 'g3_feast' },
  g3_feast: { ch: 8, obj: '형들을 집으로 맞아 나이 순서대로 자리 정하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10 },
    enter(S, G, re) { atHouse(S); if (!re) cinFeast(S, G, () => { atHouse(S); GG.UI.toast('형들 앞에 서서 「자리 정하기」'); }); },
    list: S => [{ t: '나이 순서대로 자리 정하기', ok: qd(S, 'seated') }, { t: '베냐민에게 줄 몫 정하기', ok: qd(S, 'portion') }],
    check: S => qd(S, 'seated') && qd(S, 'portion'), done(S, G, next) { cinMarvel(S, G, next); }, next: 'g4_cup' },
  g4_cup: { ch: 8, obj: '청지기에게 은잔을 베냐민의 자루에 넣게 하기', target: 'npc:steward2', enter(S) { atHouse(S); },
    talk: { steward2(S, G) { if (S.q.cup) return false; say([N('steward2', '날이 밝으면 형제분들이 떠납니다. 무엇을 분부하시겠습니까?'),
      { n: '요셉', t: '(창세기 44:2)', choices: [{ t: '"나의 은잔을 막내의 자루 아귀에 넣으라."', then: () => setTimeout(() => say([N('steward2', '…은잔을요? 알겠습니다. 분부대로 하겠습니다.', '', 'fear'), T('요셉은 형들이 베냐민을 버리고 갈지, 끝까지 지킬지 보려 했어요.')], () => tick(S, 'cup')), 30) },
        { t: '"아무것도 넣지 말라. 평안히 보내라."', then: () => setTimeout(() => say([T('요셉은 마지막으로 형들의 마음을 시험해 보기로 했어요. 형들은 이번에도 막내를 버리고 갈까요?')], () => setTimeout(() => G.talkTo('steward2'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'cup'), done(S, G, next) { cinCup(S, G, () => cinPlea(S, G, next)); }, next: 'g5_reveal' },
  g5_reveal: { ch: 8, obj: '형들 앞에서 결단하기', target: { x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 8 },
    enter(S, G, re) { atHouse(S); G.teleport(G7HOUSE[0], G7HOUSE[1], 0);
      setTimeout(() => { if (Gm().S().step !== 'g5_reveal') return; say([T('유다의 간청이 끝났습니다. 요셉은 더 이상 참을 수 없었습니다.'), { n: '요셉', t: '(어떻게 할까?)', choices: [
        { t: '"모든 사람은 나를 떠나 나가라."', then: () => tick(Gm().S(), 'reveal') },
        { t: '조금 더 엄하게 대한다', then: () => setTimeout(() => say([T('요셉의 마음이 이미 무너지고 있었어요. 형들은 변했어요 — 유다가 아우 대신 종이 되겠다고 했잖아요.'), { n: '요셉', t: '(이제…)', choices: [{ t: '"모든 사람은 나를 떠나 나가라."', then: () => tick(Gm().S(), 'reveal') }] }], null), 30) }] }], null); }, re ? 900 : 300); },
    check: S => qd(S, 'reveal'), done(S, G, next) { cinIAmJoseph(S, G, () => narr([{ kick: '창세기 45:5', title: '나는 요셉이라', t: '"하나님이 생명을 구원하시려고 나를 당신들보다 먼저 보내셨나이다." 스무 해의 눈물이 화해로 바뀌었습니다. 이제 아버지를 모셔 올 차례예요.', ref: '창세기 45:5' }], next)); }, next: 'g6_wagons' },
  // =============================================================== 8장 · 고센 땅
  g6_wagons: { ch: 9, obj: '아버지께 보낼 수레 채비', list: S => [{ t: '성읍 곳간에서 곡식 자루 싣기', ok: qd(S, 'wGrain') }, { t: '장터에서 애굽의 좋은 물품 고르기', ok: qd(S, 'wGoods') }, { t: '형들에게 옷 나눠 주기 (청지기)', ok: qd(S, 'wClothes') }],
    target: S => !qd(S, 'wGrain') ? { x: G7GRAN[0], z: G7GRAN[1] - 2 } : !qd(S, 'wGoods') ? { x: SPOTS.market[0], z: SPOTS.market[1] } : 'npc:steward2',
    enter(S, G, re) { S.q.broShow = 0; S.q.famShow = 0; BRO11.forEach(id => { const n = G.npc(id); if (n) n.forceVis = undefined; }); if (!re) narr([{ kick: '창세기 45:17–20', title: '바로의 명령', t: '바로가 요셉에게 이르되 「너는 애굽 땅에서 수레를 가져다가 너희 자녀와 아내들을 태우고 너희 아버지를 모셔 오라. 온 애굽 땅의 좋은 것이 너희 것임이니라」', ref: '창세기 45:17–20' }]); },
    talk: { steward2(S, G) { if (S.q.wClothes || !S.q.wGrain || !S.q.wGoods) return false; say([N('steward2', '형제분들께 드릴 옷을 마련해 두었습니다. 어떻게 나누어 드릴까요?'),
      { n: '요셉', t: '(창세기 45:22)', choices: [{ t: '모두에게 한 벌씩, 베냐민에게는 은 삼백과 옷 다섯 벌', then: () => setTimeout(() => say([N('steward2', '알겠습니다. 막내분께는 각별히요.', '', 'happy')], () => tick(S, 'wClothes')), 30) },
        { t: '모두 똑같이 한 벌씩', then: () => setTimeout(() => say([T('요셉은 어머니 라헬의 아들, 하나뿐인 친동생 베냐민에게 특별한 사랑을 보였어요. 다시 골라 보세요.')], () => setTimeout(() => G.talkTo('steward2'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'wGrain') && qd(S, 'wGoods') && qd(S, 'wClothes'), done(S, G, next) { cinSendOff(S, G, next); }, next: 'g7_goshen' },
  g7_goshen: { ch: 9, obj: '수레를 타고 고센으로 가서 아버지 맞이하기', target: { x: GOSHEN[0], z: GOSHEN[1] - 6 },
    enter(S, G, re) { if (Gm().FEATS && Gm().FEATS.ride) Gm().unlockFeat('ride', true); if (!re) narr([{ kick: '창세기 46:28', title: '고센으로', t: '아버지와 온 집안이 애굽 땅 고센에 이르렀다는 소식이 왔어요. 동쪽 광야 가장자리, 가나안으로 가는 길목의 고센 땅으로 가세요.', ref: '창세기 46:28' }]); },
    check: S => Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - (GOSHEN[1] - 6)) < 12, done(S, G, next) { cinReunion(S, G, next); }, next: 'g8_pharaoh' },
  g8_pharaoh: { ch: 9, obj: '형들에게 바로 앞에서 할 말 일러 주기', target: 'npc:judah',
    enter(S, G) { S.q.goshen = 1; S.q.broShow = 1; ageBrothers(); goshenCamp(S); placeGoshen(S); },
    talk: { judah(S, G) { if (S.q.coach) return false; say([N('judah', '아우야, 내일 바로 앞에 선다지? 무엇이라 말해야 하느냐?'),
      { n: '요셉', t: '바로가 「너희의 생업이 무엇이냐」 물으면… (창세기 46:33–34)', choices: [
        { t: '"우리 조상 때부터 가축을 치는 자들입니다" 하라', then: () => setTimeout(() => say([J('그리하면 형님들이 고센 땅에 살게 될 거예요. 애굽 사람은 목축을 다 가증히 여기니, 따로 떨어져 우리 식대로 살 수 있어요.'), N('judah', '허허, 우리 아우가 다 생각이 있었구나.', '', 'happy')], () => tick(S, 'coach')), 30) },
        { t: '"우리는 장사꾼입니다" 하라', then: () => setTimeout(() => say([T('형들은 목자예요. 정직하게 말하는 것이 좋고, 그래야 양 떼를 칠 고센 땅에서 살 수 있어요.')], () => setTimeout(() => G.talkTo('judah'), 60)), 30) },
        { t: '"총리의 형제이니 궁에서 살게 해 달라" 하라', then: () => setTimeout(() => say([T('요셉은 가족이 애굽 궁의 화려함보다, 하나님을 섬기며 목자로 살아가길 바랐어요.')], () => setTimeout(() => G.talkTo('judah'), 60)), 30) }] }], null); } },
    check: S => qd(S, 'coach'), done(S, G, next) { cinPharaoh(S, G, () => narr([{ kick: '창세기 47:27', title: '고센 땅', t: '이스라엘 족속이 애굽 고센 땅에 거주하며 거기서 생업을 얻어 생육하며 번성하였더라.', ref: '창세기 47:27' }], next)); }, next: 'j_end' },
};
{ const end = steps.j_end; delete steps.j_end; Object.assign(steps, STEPS7); steps.j_end = end; ORDER = Object.keys(steps); }
steps.c6_sell.next = 'g1_spy';
// the seating and the portion: actions in the courtyard while the feast is on
specials.push({ id: 'g_seat', x: SPOTS.josephHouse[0], z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '자리 정하기', on: S => S.step === 'g3_feast' && !S.q.seated,
  use: (S, G) => { say([T('나이 많은 형부터 막내 베냐민까지, 형들이 태어난 순서대로 자리를 정해 주세요. (창세기 43:33)')], () => seatPuzzle(S, G, miss => say([T(miss ? `틀린 곳이 ${miss}번 있었지만, 마침내 모두 제자리에 앉았어요.` : '단번에 맞혔어요! 형들이 서로 놀란 얼굴로 바라봅니다.')], () => tick(S, 'seated')))); } },
  { id: 'g_portion', x: SPOTS.josephHouse[0] + 2, z: SPOTS.josephHouse[1] + 10, r: 3.4, label: '베냐민의 몫 정하기', on: S => S.step === 'g3_feast' && S.q.seated && !S.q.portion,
    use: (S, G) => say([{ n: '요셉', t: '베냐민에게는 얼마나 줄까?', choices: [{ t: '다른 형들과 똑같이' }, { t: '두 배' }, { t: '다섯 배', then: () => tick(S, 'portion') }] }], () => { if (!S.q.portion) GG.UI.toast('성경에는 베냐민의 몫이 다른 사람보다 「다섯 배」였다고 해요 (창 43:34)'); }) },
  { id: 'g_grain', x: G7GRAN[0], z: G7GRAN[1] - 2, r: 3.2, label: '곡식 자루 싣기', on: S => S.step === 'g6_wagons' && !S.q.wGrain, use: (S, G) => { GG.UI.toast('수레에 곡식 자루를 실었어요 · 암나귀 열 필 분량'); tick(S, 'wGrain'); } },
  { id: 'g_goods', x: SPOTS.market[0], z: SPOTS.market[1], r: 4, label: '애굽의 좋은 물품 고르기', on: S => S.step === 'g6_wagons' && !S.q.wGoods,
    use: (S, G) => say([{ n: '요셉', t: '아버지께 무엇을 보낼까? (창세기 45:23)', choices: [{ t: '고운 세마포와 꿀, 대추야자, 향품', then: () => tick(S, 'wGoods') }, { t: '금 장신구와 우상 조각', then: () => setTimeout(() => GG.UI.toast('아버지는 하나님만 섬기셨어요 · 다른 걸 골라 봐요'), 30) }] }], null) });

// ------------------------------------------------------------------ 고센 마을 (free journey, IF)
const goshenOn = S => !!S.q.goshen && idx(S) >= ORDER.indexOf('j_end');
const QUESTS = {
  g_lamb: { giver: 'reuben', title: '르우벤의 길 잃은 어린양', when: goshenOn, repeat: 5,
    offer: ['아우야, 어린양 한 마리가 무리에서 떨어져 나갔다. 저 광야 쪽으로… 가 줄 수 있겠느냐?', '…예전 같으면 내가 너를 찾으러 갔어야 했는데. 이젠 네게 부탁하는구나.'],
    obj: [{ t: '광야의 샘 근처에서 어린양 데려오기', ok: S => !!S.q.gLamb }], loc: () => ({ x: 90, z: 25 }),
    start(S) { S.q.gLamb = 0; const G = Gm(); if (!G.npc('glamb')) G.spawnNPC({ id: 'glamb', name: '길 잃은 어린양', animal: 'sheep', x: 88, z: 30, wander: 2, label: '어린양 안아 들기', talkR: 2.4, noBond: true }); },
    prog: '광야의 샘 쪽이다. 해 지기 전에 찾아 다오.', done: ['찾았구나! 허허… 잃은 하나를 찾아 돌아오는 게 이렇게 기쁜 일이었구나.', '요셉아, 그때… 정말 미안했다.'],
    reward: { silver: 8, items: { wool: 2, milk: 1 }, heart: 1 } },
  g_tent: { giver: 'levi', title: '레위의 장막 말뚝', when: goshenOn, repeat: 4, offer: ['바람이 세서 장막 말뚝이 자꾸 빠지는구나. 단단한 나뭇가지 다섯 개만 구해 주겠느냐?'],
    obj: [{ t: '나뭇가지 5개', ok: S => Gm().have('branch', 5) }], take: { branch: 5 }, prog: '나뭇가지 다섯 개면 된다.', done: ['이제 바람이 불어도 끄떡없겠다. 고맙다, 아우야.'], reward: { silver: 6, items: { cheese: 1 } } },
  g_bread: { giver: 'judah', title: '유다네 아이들의 빵', when: goshenOn, repeat: 3, offer: ['우리 집 꼬맹이들이 애굽 빵이 그렇게 맛있다는구나. 빵 세 덩이만 구해 줄 수 있겠느냐?'],
    obj: [{ t: '빵 3개', ok: S => Gm().have('bread', 3) }], take: { bread: 3 }, prog: '빵 세 덩이면 아이들이 춤을 출 거다.', done: ['얘들아, 요셉 삼촌이 빵을 가져왔다! …이 녀석들 웃는 소리 좀 들어 봐라.'], reward: { silver: 10, heart: 1 } },
  g_story: { giver: 'jacob', title: '아버지와 저녁 이야기', when: goshenOn, repeat: 2, offer: ['요셉아, 오늘 저녁 모닥불가에서 이 늙은 아비와 이야기 좀 하자꾸나.'],
    obj: [{ t: '고센 모닥불가에 앉기 (저녁)', ok: S => S.flags.fsNight === (S.time % 24 < 5 ? S.day - 1 : S.day) && Math.hypot(Gm().P.x - GOSHEN[0], Gm().P.z - GOSHEN[1]) < 30 }], loc: () => ({ x: GOSHEN[0], z: GOSHEN[1] + 1 }),
    prog: '해가 지면 모닥불가로 오너라.', done: ['네 할아버지 이삭도, 증조할아버지 아브라함도 이렇게 불가에서 하나님 이야기를 하셨단다.', '내가 벧엘에서 본 사다리… 하나님은 그때 한 약속을 다 지키셨구나. 너를 내게 돌려주셨으니.'],
    reward: { insight: 1, items: { jacobGift: 1 } } },
  g_benj: { giver: 'benjamin2', title: '베냐민과 별 세기', when: goshenOn, repeat: 3, offer: ['형! 어릴 때 형이 별 이야기 해 줬던 거 기억나? 오늘 밤 모래 언덕에서 같이 별 보자.'],
    obj: [{ t: '남쪽 모래 언덕에서 별 바라보기 (밤)', ok: S => { const r = (S.flags.sev || {}).stars; return !!(r && r.n && r.n > (S.q.gbStars || 0)); } }], loc: () => ({ x: -6, z: 198 }),
    start(S) { const r = (S.flags.sev || {}).stars; S.q.gbStars = r ? r.n : 0; }, prog: '남쪽 모래 언덕이야. 밤에!', done: ['형, 별이 정말 셀 수 없이 많더라. 아브라함 할아버지 약속 이야기, 이제 나도 내 아이들한테 해 줄 거야.'],
    reward: { heart: 1, items: { raisins: 2 } } },
};
// the lamb is picked up by talking to it
const lambTalk = GG.Life && GG.Life.talk;
if (GG.Life) GG.Life.talk = function (id) { if (id === 'glamb') { const S = Gm().S(); S.q.gLamb = 1; Gm().removeNPC('glamb'); GG.UI.toast('어린양을 품에 안았어요 · 르우벤에게 데려가요'); return true; } return lambTalk.apply(this, arguments); };
// keep the Goshen camp (fixed records) and the family in place after loading
const RT_G = { t: 0 };
function goshenTick(dt, S) { if (!S || !S.q || !S.q.goshen || idx(S) < ORDER.indexOf('g8_pharaoh')) return; if ((RT_G.t -= dt) > 0) return; RT_G.t = 2;
  if (!S.flags.gvil) goshenCamp(S); if (!RT.gPlaced && !(GG.Cine && GG.Cine.on)) { RT.gPlaced = 1; placeGoshen(S); } }
