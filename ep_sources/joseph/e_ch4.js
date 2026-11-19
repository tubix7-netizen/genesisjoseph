// =================================================================== v18.71 4장 다시 짜기 · 「바로의 꿈」 (e_ch4.js · 설계표_4장_v18_71.md)
/* 창 41:14–46. 메인 이야기에는 성경에 없는 일 · 만남 · 대사를 넣지 않아요. 성경에 적힌 일을 손으로 해 보는 것만 더해요.
   ① 급히(41:14): 부름 · 씻고 수염 깎기(조심조심) · 옷 갈아입기 · 사자를 따라 바로에게(말 없음)
   ② 바로 앞에서(41:15–16 · 지금) ③ 꿈(41:17–24 · 지금, 요셉의 속말 기도는 뺌) ④ 해석(41:25–32 · 지금)
   ⑤ 계획(41:33–36): 오분의 일 셈 · 지도에 표시된 세 성읍 짚기(자리는 정해져 있어요 · 5장 곳간)
   ⑥ 결정(41:37–41) · 반지와 세마포 옷과 금사슬을 하나씩 받기(41:42) · 버금 수레(41:43 · 장면) · 41:44 · 새 이름과 아스낫(41:45)
   ⑦ 혼인 잔치 · 잔치 튜토리얼(잔치 자리 · 음식 먹기 · 함께 춤추기 · 잔치 알림과 초대 편지) → 삼십 세(41:46) → 5장 */
const C4 = S => S.q.c4 || (S.q.c4 = {});
const MSG_PATH = [[-30, 16.6], [-12, 16.4], [-11, -14], [-23, -20], [-22, -60], [-24, -100], [-28, -124], [-30, -137]];
const WED = { x: -30, z: -151 };
const CITIES4 = [{ id: 'A', n: '성읍', x: SPOTS.granaryA[0], z: SPOTS.granaryA[1] }, { id: 'B', n: '서쪽 마을', x: SPOTS.granaryB[0], z: SPOTS.granaryB[1] }, { id: 'C', n: '남쪽 마을', x: SPOTS.granaryC[0], z: SPOTS.granaryC[1] }];
const WED_GUESTS = [['wg0', '궁의 신하', LOOK.official, 'sit'], ['wg1', '궁의 신하', LOOK.official, 'clap'], ['wg2', '온의 제사장', LOOK.priest, 'sit'], ['wg3', '궁의 여인', LOOK.woman, 'clap'], ['wg4', '궁의 여종', LOOK.maid, 'dance'], ['wg5', '궁의 어른', LOOK.elder, 'sit'], ['wg6', '궁의 여인', LOOK.woman, 'cheer'], ['wg7', '궁의 신하', LOOK.official, 'clap']];

// ------------------------------------------------------------------ ① in haste (41:14)
{ const sp = specials.find(q => q.id === 'shave'); if (sp) { sp.label = S => !C4(S).shaved ? '물로 씻고 수염 깎기' : '깨끗한 옷으로 갈아입기'; sp.on = S => S.step === 'c4_shave' && !(C4(S).shaved && C4(S).dressed); sp.use = (S, G) => C4(S).shaved ? dress4(S, G) : shave4(S, G); } }
function shave4(S, G) { const [bx, bz] = SPOTS.basin; G.teleport(bx + 1.2, bz, -1.57); act('gather', 1.2); G.sfx('water');
  GG.UI.minigame('balance', { title: '수염 깎기', hint: '대야 물로 얼굴을 씻었어요. 구리 칼이 흔들리지 않게 가운데를 지켜요. 서두르면 베여요.', dur: 8 }, ok => {
    if (!ok) { G.sfx('fail', { vol: 0.4 }); GG.UI.toast('앗, 살짝 베였어요 · 천천히 다시 해요'); return; }
    const h = hAt(bx, bz); cine([
      { fn: () => cpose('shave', 0, true), cam: [bx + 2.2, h + 1.6, bz - 0.6], look: [bx + 1.2, h + 1.5, bz], dur: 4.5, fov: 0.6, t: '요셉이 곧 수염을 깎고', ref: '창세기 41:14' }], () => { cpose(null); C4(S).shaved = 1; GG.UI.quest(); }); }); }
function dress4(S, G) { const [bx, bz] = SPOTS.basin, h = hAt(bx, bz);
  cine([{ fn: () => { G.setOutfit('josephShaved'); G.sfx('whoosh'); G.FX.burst(bx + 1.2, h + 1, bz, 18, { c: [1, 0.95, 0.8], sp: 1.4, up: 1.4 }); }, cam: [bx + 3.4, h + 1.5, bz + 1.4], look: [bx + 1.2, h + 1.1, bz], dur: 4.5, t: '그 옷을 갈아입고', ref: '창세기 41:14' }],
    () => { C4(S).dressed = 1; GG.UI.quest(); G.checkStep(); }); }
Object.assign(steps.c4_shave, { obj: S => { const c = C4(S); return !c.shaved ? '대야에서 씻고 수염 깎기' : '깨끗한 옷으로 갈아입기'; },
  list: S => { const c = C4(S); return [{ t: '씻고 수염 깎기', ok: !!c.shaved }, { t: '옷 갈아입기', ok: !!c.dressed }]; },
  enter(S, G, re) { if (!re) say([N('messenger', '히브리 사람 요셉! 바로께서 너를 부르신다. 서둘러라!', '', 'urgent')], () => GG.UI.toast('옥 마당 대야에서 씻고 수염을 깎아요')); },
  check: S => !!C4(S).shaved && !!C4(S).dressed, next: 'c4_go' });
{ const m = npcs.find(n => n.id === 'messenger'); if (m) m.show = S => S.step === 'c4_shave' || S.step === 'c4_go' || S.step === 'c4_court'; }

// ------------------------------------------------------------------ ⑤ the plan: one fifth, and the cities (41:34–35)
function oneFifth(S, G, then) { say([J('바로께서는 또 이같이 행하사 나라 안에 감독관들을 두어, 그 일곱 해 풍년에 애굽 땅의 오분의 일을 거두소서.', '창세기 41:34'),
    { n: '오분의 일', t: '밭에서 곡식 쉰 자루를 거두면, 다섯에 하나는 몇 자루일까? (애굽 숫자로)', choices: [{ t: '뒤꿈치뼈 하나 · 열 자루', ok: true }, { t: '막대 다섯 · 다섯 자루', ok: false, fb: '쉰을 다섯 몫으로 나누면 한 몫은…?' }, { t: '뒤꿈치뼈 다섯 · 쉰 자루', ok: false, fb: '그건 전부예요. 다섯에 하나만 거둬요.' }] },
    { n: '오분의 일', t: '곡식 백 자루라면?', choices: [{ t: '뒤꿈치뼈 둘 · 스무 자루', ok: true }, { t: '감긴 밧줄 하나 · 백 자루', ok: false, fb: '감긴 밧줄은 백, 전부예요.' }, { t: '뒤꿈치뼈 하나 · 열 자루', ok: false, fb: '백의 다섯에 하나는 열이 아니라…' }] }], then); }
{ const css = document.createElement('style'); css.textContent = `#c4map{position:fixed;inset:0;z-index:235;display:flex;align-items:center;justify-content:center;background:rgba(10,8,4,.55);touch-action:none}
#c4map .box{background:#efe0bc;border:2px solid #8a6a3a;border-radius:14px;padding:12px 14px 10px;width:min(340px,92vw);box-shadow:0 8px 30px rgba(0,0,0,.5);color:#3a2a14;text-align:center}
#c4map h4{margin:0 0 2px;font:700 17px/1.3 var(--serif,serif)}#c4map p{margin:0 0 6px;font-size:12px;opacity:.85}#c4map svg{width:100%;height:auto;display:block}
#c4map .mk{cursor:pointer}#c4map .st{font:700 15px/1.2 var(--serif,serif);margin-top:4px}`; document.head.appendChild(css); }
function cityMap(then) { const X = x => 24 + (x + 178) / 216 * 252, Y = z => 22 + (z + 212) / 378 * 370; GG.UI.setBusy('c4map', true);
  let nile = ''; for (let z = -212; z <= 166; z += 14) nile += (z === -212 ? 'M' : 'L') + X(nileX(z)).toFixed(1) + ' ' + Y(z).toFixed(1) + ' ';
  const el = document.createElement('div'); el.id = 'c4map';
  el.innerHTML = `<div class="box"><h4>각 성에 적치하게 하소서</h4><p>창세기 41:35 · 지도에 표시된 성읍 세 곳을 짚어요</p><svg viewBox="0 0 300 420"><rect x="6" y="6" width="288" height="408" rx="10" fill="#e6d2a4" stroke="#b8945a"/>
    <path d="${nile}" fill="none" stroke="#4a86b8" stroke-width="7" stroke-linecap="round" opacity=".8"/><circle cx="${X(-30)}" cy="${Y(-170)}" r="7" fill="#8a3a2a"/><text x="${X(-30) + 10}" y="${Y(-170) + 4}" font-size="12" fill="#5a2a1a">바로의 궁</text>
    ${CITIES4.map(c => `<g class="mk" data-id="${c.id}"><circle cx="${X(c.x)}" cy="${Y(c.z)}" r="15" fill="#f8e6a8" stroke="#c89a2a" stroke-width="3"><animate attributeName="r" values="13;17;13" dur="1.4s" repeatCount="indefinite"/></circle><text x="${X(c.x)}" y="${Y(c.z) + 30}" font-size="12" text-anchor="middle" fill="#3a2a14">${c.n}</text></g>`).join('')}</svg><div class="st">0 / 3</div></div>`;
  document.body.appendChild(el); const got = {};
  el.querySelectorAll('.mk').forEach(g => { const hit = e => { e && e.preventDefault && e.preventDefault(); const id = g.dataset.id; if (got[id]) return; got[id] = 1; const c = g.querySelector('circle'); c.setAttribute('fill', '#e8b830'); const an = c.querySelector('animate'); an && an.remove(); GG.Audio && GG.Audio.sfx('blip', { pitch: 1.2 });
      const n = Object.keys(got).length; el.querySelector('.st').textContent = `${n} / 3`; if (n >= 3) setTimeout(() => { el.remove(); GG.UI.setBusy('c4map', false); then && then(); }, 700); };
    g.addEventListener('pointerdown', hit); g._hit = hit; }); }

// ------------------------------------------------------------------ ②–⑥ the court: the old answer scene, kept to the words of Scripture
VIS_T.nile[1] = { t: '바로의 말을 따라 꿈속 나일 강가를 걸어요. 빛나는 곳마다 바로가 본 것이 나타나요.' }; /* (the line of Joseph's own prayer is not in Scripture) */
function answerScene(S, G) {
  stage(S, G); G.P.face = Math.PI;
  say([N('pharaoh', '내가 그 꿈을 술객에게 말하였으나 그것을 내게 보이는 자가 없느니라.', '창세기 41:24'), J('바로의 꿈은 하나이라. 하나님이 그 하실 일을 바로에게 보이심이니이다.', '창세기 41:25', 'solemn')], () =>
  GG.UI.puzzle({ title: '바로의 꿈 해석', hint: '꿈속 장면(왼쪽)을 고르고, 하나님이 보이신 뜻(오른쪽)을 찾아 짝지으세요',
    syms: [{ id: 'fat', t: '일곱 살진 암소', m: 'y7', h: '살지고 좋은 것은 좋은 해를 뜻해요. 일곱은…?' }, { id: 'good', t: '충실한 일곱 이삭', m: 'y7', h: '무성한 이삭은 풍성한 해예요.' },
      { id: 'thin', t: '파리하고 흉한 일곱 암소', m: 'f7', h: '살진 소를 먹고도 여전히 흉한 소… 무엇이 풍년을 삼킬까요?' }, { id: 'blight', t: '동풍에 마른 일곱 이삭', m: 'f7', h: '마른 이삭은 굶주림의 해예요.' },
      { id: 'twice', t: '꿈을 두 번 겹쳐 꾸심', m: 'sure', h: '같은 뜻을 두 번 보이신 것은…' }],
    means: [{ id: 'y7', t: '온 애굽 땅에 일곱 해 큰 풍년' }, { id: 'f7', t: '뒤이어 일곱 해 흉년' }, { id: 'sure', t: '하나님이 이 일을 정하셨고 속히 행하시리라' }] }, () => say([
    J('일곱 좋은 암소는 일곱해요, 일곱 좋은 이삭도 일곱해니, 그 꿈은 하나이라.', '창세기 41:26'),
    J('온 애굽 땅에 일곱해 큰 풍년이 있겠고, 후에 일곱해 흉년이 들므로 애굽 땅에 있던 풍년을 다 잊어버리게 되고, 이 땅이 기근으로 멸망되리니', '창세기 41:29–30', 'solemn'),
    J('바로께서 꿈을 두번 겹쳐 꾸신 것은, 하나님이 이 일을 정하셨음이라. 속히 행하시리니', '창세기 41:32', 'solemn'),
    { n: '요셉', t: '그렇다면 바로께 무엇을 아뢸까?', choices: [
      { t: '"명철하고 지혜 있는 사람을 택하여 애굽 땅을 치리하게 하시고, 그 일곱해 풍년에 애굽 땅의 오분의 일을 거두어 흉년을 예비하소서."', ok: true, ref: '창세기 41:33–36' },
      { t: '"지금 실컷 먹고 즐기소서. 흉년은 그때 가서 걱정하면 됩니다."', ok: false, fb: '하나님이 미리 보이신 것은 준비하라는 뜻이었어요.' },
      { t: '"신들께 제물을 더 바치소서."', ok: false, fb: '요셉은 하나님이 보이신 길을 그대로 전했습니다. 거두고, 쌓고, 나누는 길을.' }] },
    J('이제 바로께서는 명철하고 지혜 있는 사람을 택하여 애굽 땅을 치리하게 하소서.', '창세기 41:33')],
  () => oneFifth(S, G, () => say([J('그들로 장차 올 풍년의 모든 곡물을 거두고 그 곡물을 바로의 손에 돌려 양식을 위하여 각 성에 적치하게 하소서.', '창세기 41:35')], () => cityMap(() => say([
    J('이와 같이 그 곡물을 이 땅에 저장하여 애굽 땅에 임할 일곱해 흉년을 예비하시면, 땅이 이 흉년을 인하여 멸망치 아니하리이다.', '창세기 41:36'),
    T('바로와 그 모든 신하가 이 일을 좋게 여긴지라.', '창세기 41:37'),
    N('pharaoh', '이와 같이 하나님의 신이 감동한 사람을 우리가 어찌 얻을 수 있으리요.', '창세기 41:38', 'awe'),
    N('pharaoh', '하나님이 이 모든 것을 네게 보이셨으니 너와 같이 명철하고 지혜 있는 자가 없도다. 너는 내 집을 치리하라. 내 백성이 다 네 명을 복종하리니, 나는 너보다 높음이 보좌 뿐이니라.', '창세기 41:39–40', 'solemn')],
    () => G.go('c4_robe'))))))));
}

// ------------------------------------------------------------------ ⑥ the ring, the linen, the gold chain (41:42) · the second chariot (41:43)
const ROBE4 = [['ring', '손을 내밀어 인장 반지 받기', '바로가 자기의 인장 반지를 빼어 요셉의 손에 끼우고'], ['linen', '세마포 옷 받아 입기', '그에게 세마포 옷을 입히고'], ['chain', '고개 숙여 금사슬 받기', '금 사슬을 목에 걸고']];
function robe4(S, G, k) { const c = C4(S), P = G.P, h = hAt(P.x, P.z), f = P.face, [, , text] = ROBE4.find(r => r[0] === k);
  cine([{ fn: () => { if (k === 'ring') P.emote = { k: 'present', t: 0, dur: 2 }; if (k === 'linen') G.setOutfit('josephVizier'); if (k === 'chain') { P.emote = { k: 'bow', t: 0, dur: 2 }; G.FX.burst(P.x, h + 1.4, P.z, 24, { c: [1, 0.85, 0.4], sp: 1.6, up: 1.4 }); } GG.Audio && GG.Audio.sfx('insight', { pitch: k === 'ring' ? 0.84 : k === 'linen' ? 1.0 : 1.25, vol: 0.7 }); },
    cam: [P.x + Math.sin(f) * 1.6 + Math.cos(f) * 0.6, h + 1.5, P.z + Math.cos(f) * 1.6 - Math.sin(f) * 0.6], look: [P.x, h + (k === 'ring' ? 1.0 : 1.3), P.z], dur: 4.5, fov: 0.55, t: text, ref: '창세기 41:42' }], () => { c[k] = 1; GG.UI.quest(); G.checkStep(); }); }
function cinParade4(S, G, next) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  const road = [[-29, -138], [-28, -124], [-24, -100], [-22, -80], [-22, -66]];
  const along = k => { const n = road.length - 1, f = clamp(k, 0, 0.999) * n, i = Math.floor(f), u = f - i; return [lerp(road[i][0], road[i + 1][0], u), lerp(road[i][1], road[i + 1][1], u), Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1])]; };
  cine([
    { fn: () => { S.q.parade = 1; S.q.riding = 1; S.q.chariotOk = 1; const [x, z, f] = along(0); G.teleport(x, z, f); crowdLine(G, road, true); }, music: 'j_triumph',
      cam: t => { const [x, z] = along(t / 16); return [x + 6, hAt(x, z) + 3, z + 4]; }, look: t => { const [x, z] = along(t / 16); return [x, hAt(x, z) + 1.4, z]; }, dur: 9, sfx: 'cheerC',
      each: t => { const [x, z, f] = along(t / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; },
      t: '자기에게 있는 버금 수레에 그를 태우매, 무리가 그 앞에서 소리 지르기를 「엎드리라」 하더라.', ref: '창세기 41:43' },
    { cam: t => { const [x, z] = along((t + 9) / 16); return [x - 5, hAt(x, z) + 1.8, z + 7]; }, look: t => { const [x, z] = along((t + 9) / 16); return [x, hAt(x, z) + 1.6, z]; }, dur: 7, sfx: 'cheerC',
      each: t => { const [x, z, f] = along((t + 9) / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; }, t: '아브렉! 아브렉!', n: '애굽 백성', e: 'shout', ref: '창세기 41:43' },
    { cam: [-14, hAt(-22, -66) + 6, -56], cam2: [-8, hAt(-22, -66) + 14, -48], look: [-22, hAt(-22, -66) + 1.4, -66], dur: 7, t: '바로가 그로 애굽 전국을 총리하게 하였더라.', ref: '창세기 41:43', fadeOut: 1.4 },
    { fn: () => { S.q.parade = 0; S.q.riding = 0; crowdLine(G, road, false); G.teleport(cx, cz, Math.PI); place('pharaoh', px, pz, 0, { sit: true }); }, fadeIn: 1.2, music: 'j_court',
      cam: [px + 2, ph + 0.8, pz + 4.2], look: [px, ph + 1.3, pz], dur: 7, n: '바로', t: '나는 바로라. 애굽 온 땅에서 너의 허락이 없이는 수족을 놀릴 자가 없으리라.', ref: '창세기 41:44', e: 'solemn' },
    { cam: [cx - 3, chh + 2.2, cz + 3], look: [cx, chh + 1.3, cz - 2], dur: 9, t: '바로가 요셉의 이름을 사브낫바네아라 하고, 또 온 제사장 보디베라의 딸 아스낫을 그에게 주어 아내를 삼게 하니라.', ref: '창세기 41:45' },
  ], () => { GG.Game.musicOverride = null; next(); });
}

// ------------------------------------------------------------------ ⑦ the wedding feast: the feast tutorial (the village feast's own table, food and dance)
const ateW = S => (S.flags.feastAte || -1) === S.day, dancedW = S => !!C4(S).danced;
function wedStart(S, G, re) { const c = C4(S);
  const setUp = () => { if (S.time < 17.6) S.time = 17.6; G.teleport(WED.x, WED.z + 7, Math.PI); G.setOutfit('josephVizier');
    GG.Feast && GG.Feast.stage({ x: WED.x, z: WED.z, v: { id: 'royalWed', n: '잔치 자리', folk: WED_GUESTS.map(([id]) => ({ id })) } });
    WED_GUESTS.forEach(([id, name, look, mode], i) => { const a = (i / WED_GUESTS.length) * Math.PI * 2 + 0.3, r = i % 2 ? 4.6 : 3.4, x = WED.x + Math.cos(a) * r, z = WED.z + Math.sin(a) * r;
      if (!G.npc(id)) G.spawnNPC({ id, name, look, x, z, face: Math.atan2(WED.x - x, WED.z - z), noTalk: true, noTag: true, act: mode === 'sit' ? null : mode }); if (mode === 'sit') place(id, x, z, Math.atan2(WED.x - x, WED.z - z), { sit: true }); });
    if (!G.npc('potipherah')) G.spawnNPC({ id: 'potipherah', name: '온의 제사장 보디베라', look: LOOK.priest, x: WED.x + 2.2, z: WED.z - 2.4, face: 0, noTalk: true });
    place('potipherah', WED.x + 2.2, WED.z - 2.4, 0, { sit: true }); place('asenath', WED.x - 2.2, WED.z - 2.4, 0, { sit: true }); };
  if (re) { setUp(); return; }
  fade(setUp, () => { GG.Game.musicOverride = 'j_plenty'; narr([{ kick: '창세기 41:45', title: '혼인 잔치', t: '바로가 온 제사장 보디베라의 딸 아스낫을 요셉에게 주어 아내를 삼게 하였습니다. 궁 뜰에 잔치 상이 차려졌어요.', ref: '창세기 41:45' },
    { kick: '잔치 배우기 · 1', title: '잔치 자리', t: '잔치는 해 질 녘에 열리고, 상 둘레에 사람들이 모여요. 상 앞으로 가서 「잔치 음식 먹기」를 해 보세요.', ref: '' }], () => { c.wedIn = 1; GG.UI.quest(); }); }); }
function wedEnd(S, G, next) { const c = C4(S);
  cine([{ cam: [WED.x + 8, hAt(WED.x, WED.z) + 4, WED.z + 10], cam2: [WED.x + 6, hAt(WED.x, WED.z) + 6, WED.z + 8], look: [WED.x, hAt(WED.x, WED.z) + 1, WED.z], dur: 7, t: '요셉이 애굽 왕 바로 앞에 설 때에 삼십 세라.', ref: '창세기 41:46', fadeOut: 1.6 }, /* (「애굽 온 땅을 순찰하니」는 5장 첫머리에 나와요) */
    { black: true, title: '5장 · 일곱 해 풍년', sub: '창세기 41:46–52', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4, fn: () => { GG.Feast && GG.Feast.stage(null); WED_GUESTS.forEach(([id]) => { if (G.npc(id)) G.removeNPC(id); }); if (G.npc('potipherah')) G.removeNPC('potipherah'); } }],
    () => { S.q.chariotOk = 1; S.q.riding = 0; S.q.needCart = 1; S.q.cartAt = { x: -20.6, z: -25.6, f: Math.PI }; G.teleport(-25, -29.5, 1.2); GG.Game.musicOverride = null; c.wedDone = 1; next(); }); }
{ const a = npcs.find(n => n.id === 'asenath'); if (a) { const s0 = a.show; a.show = S => S.step === 'c4_wedding' || s0(S); } }

// ------------------------------------------------------------------ the new steps
const CH4 = {
  c4_go: { ch: 5, obj: '바로의 사자를 따라 궁으로', target: 'npc:messenger', need: ['messenger'],
    enter(S, G, re) { const c = C4(S); if (re) { G.teleport(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 2, Math.PI); c.atGate = 1; return; } place('messenger', -30, 12.6, Math.PI); escort('messenger', MSG_PATH, () => { c.atGate = 1; G.checkStep(); }, 1.9, '서둘러라!'); },
    check: S => !!C4(S).atGate, done(S, G, next) { GG.Game.musicOverride = 'j_court'; next(); }, next: 'c4_court' },
  c4_robe: { ch: 5, obj: S => { const c = C4(S), r = ROBE4.find(q => !c[q[0]]); return r ? r[1] : '바로 앞에서'; },
    list: S => { const c = C4(S); return [{ t: '인장 반지', ok: !!c.ring }, { t: '세마포 옷', ok: !!c.linen }, { t: '금사슬', ok: !!c.chain }]; },
    target: () => ({ x: SPOTS.court[0], z: SPOTS.court[1] }), need: ['pharaoh'],
    enter(S, G, re) { stage(S, G); if (!re) say([N('pharaoh', '내가 너로 애굽 온 땅을 총리하게 하노라.', '창세기 41:41', 'solemn')]); },
    check: S => { const c = C4(S); return !!(c.ring && c.linen && c.chain); }, done(S, G, next) { cinParade4(S, G, next); }, next: 'c4_wedding' },
  c4_wedding: { ch: 5, obj: S => { const c = C4(S); return !c.wedIn ? '혼인 잔치' : !ateW(S) ? '잔치 음식 먹기' : !dancedW(S) ? '마당 가운데에서 함께 춤추기' : '잔치 알림과 초대 편지'; },
    list: S => [{ t: '잔치 음식 먹기', ok: ateW(S) }, { t: '함께 춤추기', ok: dancedW(S) }, { t: '잔치 알림과 초대 편지', ok: !!C4(S).told }],
    target: () => ({ x: WED.x, z: WED.z }), need: ['asenath'],
    enter(S, G, re) { wedStart(S, G, re); },
    check: S => ateW(S) && dancedW(S) && !!C4(S).told, done(S, G, next) { wedEnd(S, G, next); }, next: 'c5_patrol' }
};
GG.Game.CTX.push(function (S) { const G = Gm(), p = G.P; if (!S || G.cineOn || GG.UI.busy() || S.step !== 'c4_robe') return null; const c = C4(S), r = ROBE4.find(q => !c[q[0]]); if (!r) return null;
  const [x, z] = SPOTS.court, d = Math.hypot(p.x - x, p.z - z); if (d > 4.5) return null; return [{ d: d - 0.8, x: p.x, z: p.z, y: 1.2, story: true, noMagnet: true, key: 'c4Robe', label: r[1], use: () => robe4(S, G, r[0]) }]; });
function ch4Tick(dt, S) { if (!S || !/^c4_/.test(S.step || '')) return; try { const G = Gm(), c = C4(S);
    if (S.step === 'c4_go') escTick(dt);
    if ((S.step === 'c4_robe' && c.linen) || S.step === 'c4_wedding') { if (!GG.Cine.on && S.outfit !== 'josephVizier') G.setOutfit('josephVizier'); }
    if (S.step === 'c4_wedding' && c.wedIn && !GG.UI.busy() && !GG.Cine.on) {
      if (ateW(S) && !c.t2) { c.t2 = 1; GG.UI.quest(); narr([{ kick: '잔치 배우기 · 2', title: '함께 춤추기', t: '잔치 음식을 먹으면 체력 · 기력 · 정신력이 차고, 함께한 사람들과 조금씩 가까워져요(잔치마다 한 번). 이번엔 마당 가운데에서 「함께 춤추기」! 북소리에 맞춰 화면(또는 A)을 톡 눌러요.', ref: '' }]); }
      if (!c.danced && GG.Feast && GG.Feast.lastDance === S.day) { c.danced = 1; GG.UI.quest(); }
      if (c.danced && !c.told) { c.told = 1; narr([{ kick: '잔치 배우기 · 3', title: '잔치 알림과 초대 편지', t: '앞으로 애굽의 마을마다 잔치가 열려요(거둠 잔치 · 아기 이름 짓는 날 · 집들이 · 나일 강 새해 맞이 …). 그날 아침 「오늘 저녁 ○○ 마을에서 잔치!」 알림이 뜨고, 친한 사람은 전날 초대 편지를 보내요.', ref: '' }], () => { GG.UI.quest(); G.checkStep(); }); } } } catch (e) { console.error('ch4', e); } }
/* put the new steps in order (c4_answer now ends in c4_robe; the old cinInvest is no longer used) */
{ const keys = Object.keys(steps), cut = keys.indexOf('c4_shave'), tail = keys.slice(cut + 1).map(k => [k, steps[k]]); for (const [k] of tail) delete steps[k];
  steps.c4_go = CH4.c4_go; for (const [k, v] of tail) { steps[k] = v; if (k === 'c4_answer') { steps.c4_robe = CH4.c4_robe; steps.c4_wedding = CH4.c4_wedding; } }
  ORDER = Object.keys(steps); }
