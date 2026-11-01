
// ------------------------------------------------------------------ 3장 · the king's prison
NM.prisD = '죄수 네헤시';
npcs.push({ id: 'prisD', name: NM.prisD, look: Object.assign({}, LOOK.prisoner, { skin: 0x7a4a2a, hairStyle: 'bald', beard: null }), x: CELL[3][0], z: CELL[3][1], face: 0, talkR: 4.2,
  show: S => between(S, 'c3_cell', 'c3_charge'), chat: ['나는 곧 풀려난다. 남쪽 마을에 가족이 있지.', '히브리 사람, 너는 왜 그리 평안하냐?'] });
{ const pot = npcs.find(n => n.id === 'potiphar'); const s0 = pot.show; pot.show = S => s0(S) || !!S.q.potPrison; delete pot.sched; delete pot.sit;
  const wf = npcs.find(n => n.id === 'wife'); delete wf.sched; const sc = npcs.find(n => n.id === 'scribe'); delete sc.sched; delete sc.sit;
  BRO.forEach(id => { const b = npcs.find(n => n.id === id); delete b.sit; }); }
const CELL_IDS = ['prisA', 'prisB', 'oldP', 'prisD'];
const PRAY = [-18.4, -8.2];
function windowPray(S, G) {
  const h = hAt(PRAY[0], PRAY[1]);
  if (S.step === 'c3_cell') {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6, n: '요셉', t: '하나님… 저는 아무 잘못도 하지 않았어요.', e: 'pray', music: 'j_prison' },
      { cam: [-19.8, h + 0.9, -6.6], look: [-18.4, h + 1.1, -8.3], dur: 6.5, n: '요셉', t: '구덩이에서도, 종의 숙소에서도… 그리고 이제는 왕의 옥이에요.', e: 'weary' },
      { cam: [-17.4, h + 0.7, -7.0], look: [-18.4, h + 1.15, -8.3], dur: 8, n: '요셉', t: '아버지가 말씀하셨어요. 하나님은 벧엘에서도, 하란에서도, 얍복 강가에서도 함께 계셨다고.', e: 'pray' },
      { cam: [-18.0, h + 1.1, -7.1], look: [-18.4, h + 1.2, -8.3], dur: 6, fov: 0.58, n: '요셉', t: '여기서도… 함께 계신 거죠?', e: 'cry' },
      { cam: [-18.6, h + 0.5, -6.4], cam2: [-18.5, h + 0.7, -6.8], look: [-18.4, h + 2.6, -9.6], look2: [-18.4, h + 1.4, -8.4], dur: 9, music: 'j_hope', each: t => { RT.grace = Math.min(1, t / 6); },
        t: '여호와께서 요셉과 함께 하시고 그에게 인자를 더하사, 그로 하여금 간수장에게 은혜를 받게 하시매', ref: '창세기 39:21' },
    ], () => { cpose(null); RT.grace = 0; G.newDay('옥에서의 아침'); G.go('c3_keeper'); });
  } else {
    cine([
      { fn: () => { G.teleport(PRAY[0], PRAY[1] + 0.2, Math.PI); cpose('kneelPray', 0, true); RT.grace = 0; }, cam: [-16.9, h + 1.25, -6.2], look: [-18.4, h + 1.0, -8.6], dur: 6.5, n: '요셉', t: '하나님, 술 맡은 관원장이 떠난 지 벌써 한 해가 넘었어요.', e: 'weary' },
      { cam: [-19.8, h + 0.9, -6.6], look: [-18.4, h + 1.1, -8.3], dur: 7, n: '요셉', t: '날마다 문소리가 나면 혹시나 했어요. …이제는 그 문소리가 무서워요.', e: 'sad' },
      { cam: [-18.0, h + 1.1, -7.1], look: [-18.4, h + 1.2, -8.3], dur: 6.5, fov: 0.58, n: '요셉', t: '그래도… 하나님은 저를 잊지 않으셨죠? 사람은 잊어도요.', e: 'cry' },
      { cam: [-18.6, h + 0.5, -6.4], look: [-18.4, h + 2.6, -9.6], dur: 10, each: t => { RT.grace = Math.min(0.7, t / 8); },
        t: '그날 밤 요셉은 원망 대신 감사로 기도를 마쳤습니다. 오늘도 살아 있게 하신 것과, 어린 케티에게 이야기를 들려줄 수 있었던 것과, 늙은 죄수가 웃으며 문을 나선 것을.' },
    ], () => { cpose(null); RT.grace = 0; S.q.wReady = 0; waitNext(S, G); });
  }
}
const GIVE_T = { prisA: ['…고맙다. 너 같은 놈은 처음 본다.', '떡이다! 오늘은 좀 크구나.'], prisB: ['물이다! 살겠다…', '고맙다, 히브리 사람.'], oldP: ['…물… 고맙구나…', '…떡…'], prisD: ['고맙소. 나는 곧 나간다오.', '마지막 떡이로군. 고맙소.'] };
function cellGive(S, G, i) {
  const id = CELL_IDS[i], keeper = S.step === 'c3_keeper';
  if (keeper) { if (S.water < 1) { G.UI.toast('물이 없어요 · 마당의 대야에서 물을 길어 오세요'); return; } S.water--; (S.q.gave = S.q.gave || {})[i] = 1; act('water', 0.7, 'jar'); G.UI.hud(); }
  else { (S.q.fed = S.q.fed || {})[i] = 1; act('pick', 0.7); if (Object.keys(S.q.fed).length >= 4) { G.P.carry = null; } }
  bubble(id, GIVE_T[id][keeper ? 0 : 1], 3); G.UI.quest(); G.checkStep();
}
function fight(S, G) {
  say([N('prisA', '메루 놈이 내 떡을 훔쳐 먹었어!', '', 'angry'), N('prisB', '거짓말! 네가 먼저 내 물을 엎질렀잖아!', '', 'angry'),
    { n: '요셉', t: '어떻게 말릴까?', choices: [
      { t: '"제 몫의 떡을 반씩 나눠 드릴게요. 대신 서로 손을 잡으세요."', ok: true },
      { t: '"간수장께 일러서 둘 다 벌을 받게 하겠어요."', ok: false, fb: '벌은 미움을 키울 뿐이에요. 형제의 미움이 어디까지 갈 수 있는지, 요셉은 누구보다 잘 알았습니다.' },
      { t: '(모른 척한다)', ok: false, fb: '옥중의 일을 맡은 이상, 요셉은 외면할 수 없었습니다.' }] },
    N('prisA', '…네 몫을? 그럼 너는 뭘 먹고.', '', 'awe'), J('저는 괜찮아요. 하나님이 먹이실 거예요.', '', 'tender'),
    N('prisB', '……미안하다, 케티. 물은 내가 실수로 엎은 거야.', '', 'sad'), N('prisA', '…나도 떡 훔친 거 아니라고 소리친 거, 미안하다.', '', 'sad')], () => tick(S, 'fight'));
}
function cinOfficers(S, G) {
  const gx = -30, gz = 14, gh = hAt(gx, gz);
  cine([
    { fn: () => { S.q.potPrison = 1; place('potiphar', gx, gz + 3.4, Math.PI); place('cupbearer', gx - 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('baker', gx + 1.3, gz + 2.2, Math.PI, { act: 'bound' }); place('pg1', gx - 2.4, gz + 3.2, Math.PI); place('pg2', gx + 2.4, gz + 3.2, Math.PI);
        G.teleport(gx, gz - 4.4, 0); G.sfx('door'); },
      cam: [gx + 5, gh + 2.2, gz - 7], cam2: [gx + 3.6, gh + 1.8, gz - 5.6], look: [gx, gh + 1.3, gz + 2], dur: 7, music: 'j_dread', t: '그 후에 애굽 왕의 술 맡은 자와 떡 굽는 자가 그들의 주 애굽 왕에게 범죄한지라. 바로가 그 두 관원장에게 노하여', ref: '창세기 40:1–2' },
    { cam: [gx - 2.6, gh + 1.5, gz - 1.6], look: [gx, gh + 1.4, gz + 2.4], dur: 6, t: '그들을 친위대장의 집 안에 있는 옥에 가두니, 곧 요셉이 갇힌 곳이라.', ref: '창세기 40:3' },
    { fn: () => walkTo('potiphar', gx, gz - 1.6, 1.4, () => face('potiphar', gx, gz - 4.4)), cam: [gx + 2.4, gh + 1.6, gz - 6], look: [gx, gh + 1.5, gz - 1], dur: 6, n: '보디발', t: '……요셉.', e: 'cold' },
    { cam: [gx - 1.4, gh + 1.6, gz - 0.6], look: [gx, gh + 1.5, gz - 4.4], dur: 4.5, fov: 0.6, n: '요셉', t: '…나리.', e: 'tender' },
    { cam: [gx + 4, gh + 1.4, gz - 3], look: [gx, gh + 1.4, gz - 3], dur: 6, t: '두 사람은 한참 동안 서로를 바라보았습니다. 보디발은 무언가 말하려다 입을 다물었습니다.' },
    { cam: [gx + 1.2, gh + 1.6, gz - 6.2], look: [gx, gh + 1.6, gz - 1.6], dur: 7, n: '보디발', t: '이 두 사람은 바로의 관원장들이다. 네가 이들을 수종 들어라. …네가 늘 그랬듯이, 잘 섬겨라.', ref: '창세기 40:4', e: 'tender' },
    { fn: () => { walkTo('potiphar', gx, gz + 6, 1.6); place('cupbearer', CELL[3][0] - 1.1, CELL[3][1] - 0.2, 0); place('baker', CELL[3][0] + 1.1, CELL[3][1] - 0.4, 0); },
      cam: [CELL[3][0] + 1, hAt(CELL[3][0], -3) + 1.6, -2.4], look: [CELL[3][0], hAt(CELL[3][0], -8) + 1.1, -8], dur: 6, t: '친위대장이 요셉에게 그들을 수종들게 하매 요셉이 그들을 섬겼더라.', ref: '창세기 40:4' },
  ], () => { S.q.potPrison = 0; GG.Game.musicOverride = null; stage(S, G); });
}
// the officers' dreams (창 40:5–19)
const DREAM = { x: -78, z: -196 };
function dreamShots(kind, lines) { const h = hAt(DREAM.x, DREAM.z);
  return lines.map((l, i) => Object.assign({ cam: [DREAM.x + 4.4 - i * 1.2, h + 1.6 + i * 0.2, DREAM.z + 4.2 - i * 0.6], cam2: [DREAM.x + 3.6 - i * 1.2, h + 1.8 + i * 0.25, DREAM.z + 3.4 - i * 0.6], look: [DREAM.x, h + 1.2, DREAM.z], dur: 6.5,
    each: t => { RT.dreamK = Math.min(1, (i + t / 6.5) / lines.length * 1.1); } }, l, i === 0 ? { fn: () => { RT.dreamFx = kind; RT.dreamK = 0; }, fadeIn: 1.2, music: 'j_dream' } : {})); }
function cupDream(S, G) {
  say([J('나리들, 오늘은 어찌하여 근심 빛이 있나이까?', '창세기 40:7', 'tender'), N('cupbearer', '우리가 꿈을 꾸었으나 이를 해석할 자가 없도다.', '창세기 40:8', 'sad'),
    ...(S.flags.char === 'trust' ? [N('cupbearer', '자네가 원망 없이 지내는 걸 보니, 이 꿈 이야기를 털어놓아도 될 것 같네.', '', 'tender')] : S.flags.char === 'protest' ? [N('cupbearer', '자네도 억울하다 하지 않았나. 같은 처지니 속을 털어놓겠네.', '', 'sad')] : []),
    { n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '"해석은 하나님께 있지 아니하니이까? 청하건대 내게 이르소서."', ok: true, ref: '창세기 40:8' },
      { t: '"제가 꿈을 잘 풉니다. 말씀해 보세요."', ok: false, fb: '요셉은 알고 있었습니다. 꿈을 푸는 지혜는 자기 것이 아니라 하나님께 있다는 것을.' }] },
    J('해석은 하나님께 있지 아니하니이까? 청하건대 내게 이르소서.', '창세기 40:8')], () => cine(dreamShots('vine', [
    { n: '술 맡은 관원장', t: '꿈에 보니 내 앞에 포도나무가 있는데, 그 나무에 세 가지가 있고', ref: '창세기 40:9–10' },
    { n: '술 맡은 관원장', t: '싹이 나서 꽃이 피고, 포도송이가 익었고', ref: '창세기 40:10' },
    { n: '술 맡은 관원장', t: '내 손에 바로의 잔이 있기로, 내가 포도를 따서 그 즙을 바로의 잔에 짜서, 그 잔을 바로의 손에 드렸노라.', ref: '창세기 40:11', fadeOut: 1.2 }]),
  () => { RT.dreamFx = null; GG.Game.musicOverride = null; say([
    { n: '요셉', t: '세 가지는 무엇을 뜻할까?', choices: [{ t: '사흘', ok: true }, { t: '세 해', ok: false, fb: '포도나무는 한 꿈 안에서 금세 자라 열매를 맺었어요. 아주 짧은 때예요.' }, { t: '세 사람', ok: false, fb: '가지가 자라 열매 맺기까지의 「때」를 생각해 보세요.' }] },
    J('그 해석이 이러하니, 세 가지는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 들고 당신의 전직을 회복시키리니, 당신이 이전에 술 맡은 자가 되었을 때에 하던 것 같이 바로의 잔을 그의 손에 드리게 되리이다.', '창세기 40:12–13'),
    N('cupbearer', '…정말인가? 정말 그렇게 된단 말인가!', '', 'happy'),
    J('당신이 잘 되시거든 나를 생각하고 내게 은혜를 베풀어서, 내 사정을 바로에게 아뢰어 이 집에서 나를 건져 주소서.', '창세기 40:14', 'urgent'),
    J('나는 히브리 땅에서 끌려온 자요, 여기서도 옥에 갇힐 일은 행하지 아니하였나이다.', '창세기 40:15', 'sad'),
    N('cupbearer', '물론이지! 내가 반드시 바로께 아뢰겠네. 이 은혜를 어찌 잊겠는가!', '', 'happy')], () => tick(S, 'cupDone')); }));
}
function bakerDream(S, G) {
  say([N('baker', '(해석이 좋은 것을 보고) 나도 꿈에 보니…', '창세기 40:16')], () => cine(dreamShots('baskets', [
    { n: '떡 굽는 관원장', t: '흰 떡 세 광주리가 내 머리에 있고', ref: '창세기 40:16' },
    { n: '떡 굽는 관원장', t: '맨 윗광주리에 바로를 위하여 만든 각종 구운 음식이 있는데', ref: '창세기 40:17' },
    { n: '떡 굽는 관원장', t: '새들이 내 머리의 광주리에서 그것을 먹더라.', ref: '창세기 40:17', fadeOut: 1.2 }]),
  () => { RT.dreamFx = null; GG.Game.musicOverride = null; say([
    T('요셉의 얼굴이 굳어졌습니다. 하나님이 보이신 뜻은 좋은 소식이 아니었습니다.'),
    { n: '요셉', t: '어떻게 할까?', choices: [{ t: '하나님이 보이신 대로 정직하게 말한다', ok: true }, { t: '좋은 꿈이라고 둘러댄다', ok: false, fb: '듣기 좋은 거짓말은 그 사람을 준비하지 못하게 해요. 하나님이 보이신 것을 요셉은 바꿀 수 없었습니다.' }] },
    J('그 해석은 이러하니, 세 광주리는 사흘이라. 지금부터 사흘 안에 바로가 당신의 머리를 들고 당신을 나무에 달리니, 새들이 당신의 고기를 뜯어 먹으리이다.', '창세기 40:18–19', 'solemn'),
    N('baker', '……', '', 'fear')], () => tick(S, 'bakeDone')); }));
}
function cinBirthday(S, G, next) {
  const px = -30, pz = -176.8, ph = hAt(px, -176) + 1.1, ch = hAt(-30, 10);
  cine([
    { hour: 9, fn: () => { place('messenger', -30, 12.6, Math.PI); place('cupbearer', -30, 8, 0); place('baker', -27.6, 8.6, 0, { act: 'bound' }); G.teleport(-30, 4.6, 0); }, cam: [-34, ch + 2, 2], look: [-30, ch + 1.3, 9], dur: 7,
      t: '사흘째 되는 날은 바로의 생일이라. 바로가 그의 모든 신하를 위하여 잔치를 베풀 때에', ref: '창세기 40:20' },
    { fn: () => walkTo('cupbearer', -30, 15.5, 1.6, () => face('cupbearer', -30, 4.6)), cam: [-31.6, ch + 1.6, 3.4], look: [-30, ch + 1.5, 4.6], dur: 4.5, n: '요셉', t: '나리! 저를 꼭 기억해 주세요!', e: 'urgent' },
    { fn: () => emote('cupbearer', 'wave', 3), cam: [-28.6, ch + 1.6, 11.6], look: [-30, ch + 1.5, 15.5], dur: 5, n: '술 맡은 관원장', t: '걱정 말게! 바로께 꼭 아뢰겠네!', e: 'happy' },
    { fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('cupbearerC', px + 1.6, -173.6, -2.6, { act: 'present' }); }, cam: [px + 5, ph + 1.4, -168], look: [px, ph + 0.8, pz + 1], dur: 7, music: 'j_court',
      t: '술 맡은 관원장은 전직을 회복하매, 그가 잔을 바로의 손에 드렸고', ref: '창세기 40:21' },
    { fn: () => { const n = G.npc('baker'); if (n) n.forceVis = false; }, cam: [CELL[3][0] + 0.8, hAt(CELL[3][0], -4) + 1.5, -3], look: [CELL[3][0], hAt(CELL[3][0], -8) + 0.8, -8.2], dur: 6,
      t: '떡 굽는 관원장은 매달리니, 요셉이 그들에게 해석함과 같이 되었으나', ref: '창세기 40:22' },
    { fn: () => { const n = G.npc('cupbearerC'); if (n) { n.act = 'laugh'; } ['magician', 'sage'].forEach(id => emote(id, 'laugh', 6)); }, cam: [px + 4.5, ph + 2.4, -163.5], cam2: [px + 3.5, ph + 1.7, -167], look: [px + 1.6, ph + 0.4, -173.6], dur: 9, fadeOut: 2, music: '',
      t: '술 맡은 관원장이 요셉을 기억하지 못하고 그를 잊었더라.', ref: '창세기 40:23', e: 'solemn' },
    { fn: () => { S.q.pharShow = 0; const c = G.npc('cupbearerC'); if (c) c.act = null; const b = G.npc('baker'); if (b) b.forceVis = undefined; G.teleport(PRAY[0], PRAY[1] + 0.6, Math.PI); }, fadeIn: 1.6, hour: 16.5, music: 'j_prison',
      cam: [-18.4, hAt(-18.4, -6) + 1.5, -4.4], look: [-18.4, hAt(-18.4, -8) + 1.6, -9.4], dur: 7, t: '하루, 또 하루. 요셉은 옥 문이 열리기를 기다렸습니다.' },
  ], () => { GG.Game.musicOverride = null; next(); });
}
// c3_wait · the forgotten two years (창 41:1)
const SEASON = [
  { kick: '잊힌 시간 · 첫째 철', title: '물이 불어나는 철', t: '술 맡은 관원장이 떠난 뒤로 나일 강이 불어났다가 줄어들었습니다. 옥 문은 열리지 않았습니다. 그 사이, 옥에 어린 죄수 하나가 새로 들어왔습니다.', ref: '' },
  { kick: '잊힌 시간 · 둘째 철', title: '씨 뿌리는 철', t: '들판에 씨를 뿌리는 철이 왔습니다. 옥 밖에서는 농부들의 노랫소리가 들렸습니다. 오늘은 늙은 죄수가 풀려나는 날입니다.', ref: '' },
  { kick: '잊힌 시간 · 셋째 철', title: '거두는 철', t: '한 해가 지나고, 또 한 해가 흘러갔습니다. 요셉은 벽에 날들을 새기기 시작했습니다.', ref: '' },
  { kick: '만 이 년', title: '다시 물이 불어나는 철', t: '술 맡은 관원장이 떠난 지 만 이 년. 그날 밤, 간수장이 요셉을 찾아왔습니다.', ref: '창세기 41:1' }];
const WAIT = [
  { obj: '새로 들어온 어린 죄수 달래기', target: S => 'npc:youngP' },
  { obj: '풀려나는 늙은 죄수 배웅하기', target: S => 'npc:oldP' },
  { obj: S => S.q.wReady ? '창가에서 기도하기' : '벽에 지난 날들을 새기기', target: S => S.q.wReady ? { x: PRAY[0], z: PRAY[1] } : { x: -20.4, z: -6.4 } },
  { obj: '간수장과 이야기하기', target: S => 'npc:keeper' }];
steps.c3_wait.obj = S => { const w = WAIT[S.q.wait || 0]; return w ? (typeof w.obj === 'function' ? w.obj(S) : w.obj) : ''; };
function waitSetup(S, G, re) { S.q.wait = S.q.wait || 0; if (S.q.wait === 0) S.q.youngIn = 1; if (!re) narr([SEASON[S.q.wait]]); }
function waitNext(S, G) {
  S.q.wait = (S.q.wait || 0) + 1; G.UI.quest();
  if (S.q.wait >= 4) { cinPharaohDream(S, G); return; }
  fade(() => { S.day += 60; S.time = Math.floor(S.time / 24) * 24 + (S.q.wait === 3 ? 20.4 : 8.5); if (S.q.wait === 2) S.q.oldGone = 1; }, () => narr([SEASON[S.q.wait]], () => G.UI.quest()));
}
steps.c3_wait.talk = {
  youngP(S, G) { if ((S.q.wait || 0) !== 0) return false;
    say([N('youngP', '…엄마… 엄마…', '', 'cry'), J('얘야, 이름이 뭐니?', '', 'tender'), N('youngP', '…케티. 빵 하나 훔쳤다고… 여기 갇혔어요.', '', 'cry'),
      J('케티. 내 동생 베냐민도 지금쯤 너만 하겠구나. …나도 처음 여기 왔을 때 많이 무서웠어.', '', 'tender'),
      N('youngP', '형도요? 형은 어른이잖아요.', ''),
      J('무서울 땐 이렇게 해 봐. 하늘을 보고 「여호와여」 하고 불러. 우리 아버지가 그랬어. 어디에 있든지 함께 계시는 분이라고.', '', 'tender'),
      N('youngP', '…여호와. 여기에도요?', ''), J('응. 구덩이 속에도 계셨어. 내가 알아.', '', 'calm')], () => waitNext(S, G)); },
  oldP(S, G) { if ((S.q.wait || 0) !== 1) return false;
    say([N('oldP', '요셉… 오늘 내가 나간다. 앓아누웠던 이 늙은이를 살린 건 너였어.', '', 'tender'), J('하나님이 하신 일이에요, 할아버지.', '', 'calm'),
      N('oldP', '그래, 네 하나님. …얘야, 그 관원장 놈이 너를 잊었다고 낙심하지 마라.', '', 'tender'),
      N('oldP', '사람은 잊어도, 네 하나님은 너를 잊지 않으실 게다. 이 늙은이가 장담하마.', '', 'tender'),
      T('늙은 죄수는 요셉의 손을 오래도록 붙잡았다가, 웃으며 옥 문을 나섰습니다.')], () => waitNext(S, G)); },
  keeper(S, G) { if ((S.q.wait || 0) !== 3) return false;
    say([N('keeper', '요셉, 잠이 안 오는구나. 나도 그렇다.', '', 'calm'), N('keeper', '너는 왜 원망하지 않느냐? 그 관원장 놈은 너를 까맣게 잊었을 텐데.', '', 'calm'),
      { n: '요셉', t: '요셉은 무엇이라 대답할까?', choices: [{ t: '"원망한 날도 있었어요. 그래도… 하나님은 구덩이에서도, 보디발의 집에서도, 여기서도 저를 떠나지 않으셨어요."', ok: true },
        { t: '"원망 같은 건 해 본 적 없어요."', ok: false, fb: '그건 정직한 대답이 아니었어요. 요셉도 사람이었고, 울며 기도한 밤들이 있었습니다.' }] },
      N('keeper', '…네 하나님이 부럽구나. 나도 그런 신을 섬겨 보고 싶다.', '', 'tender'), T('그 밤, 나일 강 건너 바로의 궁에서는 한 왕이 잠 못 이루고 있었습니다.', '창세기 41:1')], () => waitNext(S, G)); },
};
function scratchWall(S, G) {
  G.P.face = -1.57;
  GG.UI.minigame('count', { title: '벽에 날들을 새기기', hint: '돌 조각으로 벽에 금을 그어 지난 달들을 세어요.', need: 8, btn: '새기기', onPress: () => { cpose('scratchWall', 0.6); G.sfx('scratch'); } }, () => {
    say([T('여덟 줄, 그리고 또 여덟 줄. 벽은 금으로 가득했습니다.'), J('…스물넷. 이 년이 지났구나.', '', 'weary'), J('하나님, 저는 아직 여기 있어요.', '', 'sad')], () => { S.q.wReady = 1; G.UI.quest(); }); });
}
// Pharaoh's dreams and the cupbearer remembers (창 41:1–14)
function cinPharaohDream(S, G) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1;
  cine([
    { hour: 5.6, fn: () => { S.q.pharShow = 1; place('pharaoh', px, pz, 0, { sit: true }); place('magician', -36.5, -171, 0.7); place('sage', -23.5, -171, -0.7); place('cupbearerC', -26, -169, -0.4); },
      cam: [px + 3.4, ph + 1.3, pz + 3.4], cam2: [px + 2.4, ph + 1.1, pz + 2.4], look: [px, ph + 1.2, pz], dur: 7, music: 'j_dream', t: '만 이 년 후에 바로가 꿈을 꾼즉, 자기가 나일 강 가에 서 있는데', ref: '창세기 41:1' },
    { cam: [px + 4, ph + 3, -162], look: [px, ph + 0.8, pz + 2], dur: 8, music: 'j_court', t: '아침에 그의 마음이 번민하여, 애굽의 점술가와 현인들을 다 불러 그들에게 그의 꿈을 말하였으나, 그것을 바로에게 해석하는 자가 없었더라.', ref: '창세기 41:8' },
    { cam: [-35, hAt(-36, -171) + 1.6, -168.6], look: [-36.5, hAt(-36, -171) + 1.5, -171], dur: 5, n: '애굽의 점술가', t: '…바로여, 그 꿈은 저희 지혜로는…', e: 'fear', fn: () => emote('magician', 'bow', 3) },
    { fn: () => walkTo('cupbearerC', px + 1, -172.4, 1.4, () => { face('cupbearerC', px, pz); emote('cupbearerC', 'bow', 2); }), cam: [px + 3.2, ph, -168], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 6, n: '술 맡은 관원장', t: '내가 오늘 내 죄를 기억하나이다.', ref: '창세기 41:9', e: 'solemn' },
    { cam: [px - 2.4, ph, -169.6], look: [px + 1, hAt(px, -172) + 1.5, -172.4], dur: 10, n: '술 맡은 관원장', t: '그곳에 친위대장의 종 된 히브리 청년이 우리와 함께 있기로, 우리가 그에게 말하매 그가 우리의 꿈을 풀되 각 사람의 꿈대로 해석하더니, 그 해석한 대로 되어 나는 복직되고 그는 매달렸나이다.', ref: '창세기 41:12–13' },
    { cam: [px + 1.6, ph + 0.9, pz + 2.6], look: [px, ph + 1.3, pz], dur: 5, fov: 0.6, n: '바로', t: '그를 부르라.', ref: '창세기 41:14', e: 'solemn' },
    { cam: [-30, hAt(-30, 14) + 2.4, 20], cam2: [-30, hAt(-30, 14) + 1.8, 17], look: [-30, hAt(-30, 14) + 1.4, 12], dur: 6, hour: 7.2, sfx: 'door', fn: () => { G.teleport(-30, 6, 0); place('messenger', -29, 11, Math.PI); },
      t: '바로가 사람을 보내어 요셉을 부르매, 그들이 곧 그를 옥에서 내어놓은지라.', ref: '창세기 41:14' },
    { black: true, title: '4장 · 바로의 꿈', sub: '창세기 41:14–45', cam: [-30, 4, 10], look: [-30, 1, 0], dur: 4 },
  ], () => { S.q.pharShow = 0; GG.Game.musicOverride = null; G.go('c4_shave'); });
}

// ------------------------------------------------------------------ 4장 · Pharaoh's court
function shaveScene(S, G) {
  const [bx, bz] = SPOTS.basin, h = hAt(bx, bz);
  cine([
    { fn: () => { G.teleport(bx + 1.2, bz, -1.57); cpose('gather', 3); }, cam: [bx + 3.2, h + 1.4, bz + 2], look: [bx, h + 0.8, bz], dur: 5, sfx: 'water', t: '요셉이 곧 수염을 깎고', ref: '창세기 41:14' },
    { fn: () => cpose('shave', 0, true), cam: [bx + 2.2, h + 1.6, bz - 0.6], look: [bx + 1.2, h + 1.5, bz], dur: 5, fov: 0.6 },
    { fn: () => { cpose(null); G.setOutfit('josephShaved'); G.sfx('whoosh'); G.FX.burst(bx + 1.2, h + 1, bz, 20, { c: [1, 0.95, 0.8], sp: 1.4, up: 1.4 }); }, cam: [bx + 3.4, h + 1.5, bz + 1.4], look: [bx + 1.2, h + 1.1, bz], dur: 5, t: '그의 옷을 갈아입고 바로에게 들어가니', ref: '창세기 41:14' },
    { fn: () => { place('youngP', bx + 4, bz + 2.4, -2, { vis: true }); place('keeper', bx + 3.4, bz - 1.6, -1.2); }, cam: [bx + 4.6, h + 1.5, bz + 4.4], look: [bx + 2.4, h + 1.2, bz + 1], dur: 5, n: '어린 죄수', t: '형… 가는 거야? 진짜 가는 거야?', e: 'cry' },
    { cam: [bx + 0.6, h + 1.5, bz + 2.2], look: [bx + 2.4, h + 1.2, bz + 1.6], dur: 6, n: '요셉', t: '응. 하나님이 문을 여셨어. 케티, 너도 꼭 기도해. 그분은 너도 잊지 않으셔.', e: 'tender' },
    { cam: [bx + 5.6, h + 1.6, bz - 2], look: [bx + 3.4, h + 1.5, bz - 1.6], dur: 5, n: '간수장', t: '…가거라, 요셉. 너는 원래부터 여기 있을 사람이 아니었다.', e: 'tender' },
  ], () => { const y = G.npc('youngP'); if (y) y.forceVis = undefined; fade(() => { G.teleport(SPOTS.palaceGate[0], SPOTS.palaceGate[1] + 2, Math.PI); S.time = Math.floor(S.time / 24) * 24 + 9; GG.Game.musicOverride = 'j_court'; }, () => G.go('c4_court')); });
}
function courtIntro(S, G, next) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  G.P.face = Math.PI;
  cine([
    { fn: () => { place('pharaoh', px, pz, 0, { sit: true }); }, cam: [cx + 6, chh + 3.4, cz + 10], cam2: [cx + 3, chh + 2.4, cz + 5], look: [px, ph + 1, pz], dur: 7, music: 'j_court',
      t: '요셉은 바로의 궁에 들어섰습니다. 금빛 기둥 사이로, 애굽의 모든 신하가 히브리 죄수를 바라보았습니다.' },
    { cam: [px + 1.8, ph + 1.0, pz + 3.4], look: [px, ph + 1.3, pz], dur: 9, fov: 0.62, n: '바로', t: '내가 한 꿈을 꾸었으나 그것을 해석하는 자가 없더니, 들은즉 너는 꿈을 들으면 능히 푼다 하더라.', ref: '창세기 41:15', e: 'solemn' },
  ], () => say([{ n: '요셉', t: '요셉은 무엇이라 대답했을까?', choices: [{ t: '"내가 아니라 하나님께서 바로에게 편안한 대답을 하시리이다."', ok: true, ref: '창세기 41:16' },
    { t: '"그렇습니다. 저는 어떤 꿈이든 풀 수 있습니다."', ok: false, fb: '이 년 전 옥에서처럼, 요셉은 공을 자기에게 돌리지 않았습니다.' }] },
    J('내가 아니라 하나님께서 바로에게 편안한 대답을 하시리이다.', '창세기 41:16', 'solemn'),
    N('pharaoh', '…좋다. 들어라. 내가 꿈에 나일 강 가에 서서 보니…', '창세기 41:17', 'awe')], next));
}
// c4_vision · walk inside Pharaoh's dream by the Nile (창 41:17–24)
const VISION = [{ id: 'nile', x: -84, z: -192 }, { id: 'fat', x: -88, z: -204 }, { id: 'thin', x: -87, z: -215 }, { id: 'good', x: -73, z: -211 }, { id: 'blight', x: -69, z: -197 }];
function visionEnter(S, G, re) {
  const go = () => { S.q.vision = 1; S.time = Math.floor(S.time / 24) * 24 + 6.9; G.teleport(-80, -189, -2.4); spawnCows(G); G.UI.hint('꿈속의 빛나는 곳으로 걸어가세요', 'vision', 'eye'); };
  if (re) { go(); return; } fade(go, () => { GG.Game.musicOverride = 'j_dream'; });
}
function spawnCows(G) {
  RT.cows.length = 0;
  for (let i = 0; i < 14; i++) { const thin = i >= 7, k = i % 7; const sp = thin ? 'cow' : 'cow';
    RT.cows.push({ thin, rig: new Rig(AB.cow), mesh: G.animalMesh(sp, thin ? 'black' : (k % 3 === 0 ? 'brown' : 'plain')), x: -95.5, z: (thin ? -217 : -205) + (k - 3) * 1.8, tx: (thin ? -88.5 : -89) + (k % 2) * 1.6, tz: (thin ? -217 : -205) + (k - 3) * 1.8 + (k % 3) * 0.5,
      y: -1.5, k: 0, st: 'hidden', ph: Math.random() * 6, face: 1.4, eaten: 0 }); }
}
function visionUpdate(dt, S, G, t) {
  if (!S.q.vision) return;
  for (const c of RT.cows) {
    if (c.st === 'emerge') { c.k = Math.min(1, c.k + dt / 5); c.x = lerp(-95.5, c.tx, c.k); c.z = lerp(c.z, c.tz, dt); if (c.k >= 1) c.st = 'graze'; }
    if (c.st === 'eaten') c.eaten = Math.min(1, c.eaten + dt / 2.5);
    const g = hAt(c.x, c.z); c.y = c.st === 'hidden' ? g - 3 : Math.max(g, lerp(-1.6, g, Math.min(1, c.k * 1.6)));
    const sp = c.st === 'emerge' ? 1.6 : 0; c.ph += sp * dt * 3; c.face = c.st === 'emerge' ? 1.57 : c.face + Math.sin(t * 0.3 + c.ph) * dt * 0.1;
    animAnimal(c.rig, { speed: sp, phase: c.ph, graze: c.st === 'graze' && Math.sin(t * 0.7 + c.ph) > -0.2 }, t);
    const s = (1 - c.eaten) * (c.thin ? 1 : 1.12); const sx = c.thin ? 0.62 * s : 1.18 * s;
    c.rig.update(m4trs(c.M || (c.M = m4()), c.x, c.y, c.z, c.face, 0, 0, sx, s * (c.thin ? 1.02 : 1), s));
  }
  if (GG.Cine.on || GG.UI.busy()) return;
  const v = VISION.find(q => !(S.q.seen || {})[q.id]); if (!v) return;
  if (Math.hypot(G.P.x - v.x, G.P.z - v.z) < 4.2) playVision(S, G, v);
}
const VIS_T = {
  nile: [{ n: '바로', t: '내가 꿈에 나일 강 가에 서서 보니', ref: '창세기 41:17', e: 'awe' }, { n: '요셉', t: '(하나님, 이 꿈을 보여 주소서. 바로가 본 것을 저도 보게 하소서.)', e: 'pray' }],
  fat: [{ n: '바로', t: '살지고 아름다운 일곱 암소가 나일 강 가에서 올라와 갈밭에서 뜯어먹고', ref: '창세기 41:18', e: 'awe' }],
  thin: [{ n: '바로', t: '그 뒤에 또 약하고 심히 흉하고 파리한 일곱 암소가 올라오니, 그같이 흉한 것들은 애굽 땅에서 내가 아직 보지 못한 것이라.', ref: '창세기 41:19', e: 'fear' },
    { n: '바로', t: '그 파리하고 흉한 소가 처음의 일곱 살진 소를 먹었으며, 먹었으나 먹은 듯 하지 아니하고 여전히 흉하더라.', ref: '창세기 41:20–21', e: 'fear' }],
  good: [{ n: '바로', t: '또 꿈에 보니, 한 줄기에 무성하고 충실한 일곱 이삭이 나오고', ref: '창세기 41:22', e: 'awe' }],
  blight: [{ n: '바로', t: '그 후에 또 가늘고 동풍에 마른 일곱 이삭이 나더니', ref: '창세기 41:23', e: 'fear' }, { n: '바로', t: '그 가는 이삭이 좋은 일곱 이삭을 삼키더라.', ref: '창세기 41:24', e: 'fear' }] };
function playVision(S, G, v) {
  const h = hAt(v.x, v.z); GG.UI.hint(null);
  const L = VIS_T[v.id]; let shots;
  if (v.id === 'nile') shots = [{ cam: [v.x + 3, h + 1.8, v.z + 3], cam2: [v.x + 4, h + 3.4, v.z + 1], look: [v.x - 6, h + 0.6, v.z - 4], look2: [-102, -0.2, v.z - 6], dur: 7, ...L[0] }, { cam: [v.x - 1.6, h + 1.5, v.z + 1.8], look: [v.x, h + 1.4, v.z], dur: 6, ...L[1] }];
  else if (v.id === 'fat') shots = [{ fn: () => RT.cows.forEach(c => { if (!c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 2.5, h + 2.2, v.z + 7], cam2: [v.x + 1, h + 1.6, v.z + 5], look: [-95, -0.2, v.z], look2: [-90, h + 0.6, v.z], dur: 9, ...L[0] }];
  else if (v.id === 'thin') shots = [{ fn: () => RT.cows.forEach(c => { if (c.thin) { c.st = 'emerge'; c.k = 0; } }), cam: [v.x + 2.6, h + 2, v.z - 6], look: [-95, -0.2, v.z], look2: [-89, h + 0.6, v.z], dur: 9, ...L[0] },
    { fn: () => RT.cows.forEach(c => { if (!c.thin) c.st = 'eaten'; }), cam: [v.x + 4, h + 3, v.z + 7], look: [-89, h + 0.6, -210], dur: 9, shake: 0.15, sfx: 'moo', ...L[1] }];
  else if (v.id === 'good') shots = [{ fn: () => { RT.ears = 'good'; RT.earK = 0; }, cam: [v.x + 2.2, h + 1.3, v.z + 2.2], look: [v.x, h + 1.0, v.z], dur: 8, each: t => { RT.earK = Math.min(1, t / 6); }, ...L[0] }];
  else shots = [{ fn: () => { RT.ears = 'both'; RT.earK = 0; }, cam: [v.x + 2.4, h + 1.3, v.z - 2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.earK = Math.min(1, t / 6); RT.dust = 1; }, ...L[0] },
    { cam: [v.x - 2.2, h + 1.2, v.z + 2.2], look: [v.x, h + 0.9, v.z], dur: 8, sfx: 'wind', each: t => { RT.swallow = Math.min(1, t / 6); }, ...L[1] }];
  cine(shots, () => { RT.dust = 0; (S.q.seen = S.q.seen || {})[v.id] = 1; G.UI.quest();
    if (Object.keys(S.q.seen).length >= VISION.length) fade(() => { S.q.vision = 0; RT.cows.length = 0; RT.ears = null; RT.swallow = 0; G.teleport(SPOTS.court[0], SPOTS.court[1], Math.PI); S.time = Math.floor(S.time / 24) * 24 + 10.5; GG.Game.musicOverride = null; G.UI.hint(null); }, () => G.go('c4_answer'));
    else G.UI.hint('다음 빛나는 곳으로', 'vision' + v.id, 'eye'); });
}
function answerScene(S, G) {
  stage(S, G); G.P.face = Math.PI;
  say([N('pharaoh', '내가 이 꿈을 점술가에게 말하였으나 이를 내게 풀이해 주는 자가 없느니라.', '창세기 41:24'), J('바로의 꿈은 하나라. 하나님이 그가 하실 일을 바로에게 보이심이니이다.', '창세기 41:25', 'solemn')], () =>
  GG.UI.puzzle({ title: '바로의 꿈 해석', hint: '꿈속 장면(왼쪽)을 고르고, 하나님이 보이신 뜻(오른쪽)을 찾아 짝지으세요',
    syms: [{ id: 'fat', t: '일곱 살진 암소', m: 'y7', h: '살지고 좋은 것은 좋은 해를 뜻해요. 일곱은…?' }, { id: 'good', t: '충실한 일곱 이삭', m: 'y7', h: '무성한 이삭은 풍성한 해예요.' },
      { id: 'thin', t: '파리하고 흉한 일곱 암소', m: 'f7', h: '살진 소를 먹고도 여전히 흉한 소… 무엇이 풍년을 삼킬까요?' }, { id: 'blight', t: '동풍에 마른 일곱 이삭', m: 'f7', h: '마른 이삭은 굶주림의 해예요.' },
      { id: 'twice', t: '꿈을 두 번 겹쳐 꾸심', m: 'sure', h: '같은 뜻을 두 번 보이신 것은…' }],
    means: [{ id: 'y7', t: '온 애굽 땅에 일곱 해 큰 풍년' }, { id: 'f7', t: '뒤이어 일곱 해 흉년' }, { id: 'sure', t: '하나님이 이 일을 정하셨고 속히 행하시리라' }] }, () => say([
    J('일곱 좋은 암소는 일곱 해요, 일곱 좋은 이삭도 일곱 해니, 그 꿈은 하나라.', '창세기 41:26'),
    J('온 애굽 땅에 일곱 해 큰 풍년이 있겠고, 후에 일곱 해 흉년이 들므로 애굽 땅에 있던 풍년을 다 잊어버리게 되고, 이 땅이 기근으로 망하리니', '창세기 41:29–30', 'solemn'),
    J('바로께서 꿈을 두 번 겹쳐 꾸신 것은, 하나님이 이 일을 정하셨음이라. 하나님이 속히 행하시리니', '창세기 41:32', 'solemn'),
    { n: '요셉', t: '그렇다면 바로께 무엇을 아뢸까?', choices: [
      { t: '"명철하고 지혜 있는 사람을 택하여 애굽 땅을 다스리게 하시고, 풍년 일곱 해 동안 애굽 땅의 오분의 일을 거두어 흉년을 대비하소서."', ok: true, ref: '창세기 41:33–36' },
      { t: '"지금 실컷 먹고 즐기소서. 흉년은 그때 가서 걱정하면 됩니다."', ok: false, fb: '하나님이 미리 보이신 것은 준비하라는 뜻이었어요.' },
      { t: '"신들께 제물을 더 바치소서."', ok: false, fb: '요셉은 하나님이 보이신 길을 그대로 전했습니다. 거두고, 쌓고, 나누는 길을.' }] },
    J('그 곡물을 각 성에 쌓아 두어 애굽 땅에 임할 일곱 해 흉년에 대비하시면, 땅이 이 흉년으로 말미암아 망하지 아니하리이다.', '창세기 41:35–36'),
    N('pharaoh', '이와 같이 하나님의 영에 감동된 사람을 우리가 어찌 찾을 수 있으리요.', '창세기 41:38', 'awe'),
    N('pharaoh', '하나님이 이 모든 것을 네게 보이셨으니 너와 같이 명철하고 지혜 있는 자가 없도다. 너는 내 집을 다스리라. 내 백성이 다 네 명령을 따르리니, 내가 너보다 높은 것은 그 왕좌뿐이니라.', '창세기 41:39–40', 'solemn'),
    { n: '요셉', t: '바로의 말에 요셉은 어떻게 대답했을까? (어느 쪽도 정답은 아니에요)', choices: [
      { t: '"이는 저의 지혜가 아니라, 하나님께서 보여 주신 것입니다."', then: () => { GG.Deeds && GG.Deeds.char('god', 'credit'); } },
      { t: '"맡겨 주신 일을 힘을 다해 맡아 하겠습니다."', then: () => { GG.Deeds && GG.Deeds.char('duty', 'credit'); } }] }],
  () => cinInvest(S, G))));
}
// v16.8 if the interpretation was interrupted, speaking to 바로 again takes it up from the start of the scene
steps.c4_answer.talk = { pharaoh(S, G) { answerScene(S, G); } };
function cinInvest(S, G) {
  const px = -30, pz = -177.2, ph = hAt(px, -176) + 1.1, cx = SPOTS.court[0], cz = SPOTS.court[1], chh = hAt(cx, cz);
  const road = [[-29, -138], [-28, -124], [-24, -100], [-22, -80], [-22, -66]];
  const along = k => { const n = road.length - 1, f = clamp(k, 0, 0.999) * n, i = Math.floor(f), u = f - i; return [lerp(road[i][0], road[i + 1][0], u), lerp(road[i][1], road[i + 1][1], u), Math.atan2(road[i + 1][0] - road[i][0], road[i + 1][1] - road[i][1])]; };
  cine([
    { fn: () => { G.setOutfit('josephVizier'); G.sfx('fanfare'); G.FX.burst(cx, chh + 1.2, cz, 30, { c: [1, 0.85, 0.4], sp: 2, up: 2 }); }, cam: [cx + 1.6, chh + 1.6, cz - 1.8], look: [cx, chh + 1.4, cz], dur: 9, music: 'j_triumph',
      t: '바로가 자기의 인장 반지를 빼어 요셉의 손에 끼우고, 그에게 세마포 옷을 입히고 금 사슬을 목에 걸고', ref: '창세기 41:42' },
    { cam: [px + 2, ph + 0.8, pz + 4.2], look: [px, ph + 1.3, pz], dur: 6, n: '바로', t: '내가 너를 애굽 온 땅의 총리가 되게 하노라.', ref: '창세기 41:41', e: 'solemn' },
    { cam: [cx - 3, chh + 2.2, cz + 3], look: [cx, chh + 1.3, cz - 2], dur: 9, n: '바로', t: '네 이름을 사브낫바네아라 하리라. 그리고 온의 제사장 보디베라의 딸 아스낫을 네 아내로 주노라.', ref: '창세기 41:45' },
    { fn: () => { S.q.parade = 1; S.q.riding = 1; S.q.chariotOk = 1; const [x, z, f] = along(0); G.teleport(x, z, f); crowdLine(G, road, true); },
      cam: t => { const [x, z] = along(t / 16); return [x + 6, hAt(x, z) + 3, z + 4]; }, look: t => { const [x, z] = along(t / 16); return [x, hAt(x, z) + 1.4, z]; }, dur: 9, sfx: 'cheerC',
      each: t => { const [x, z, f] = along(t / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; },
      t: '자기에게 있는 버금 수레에 그를 태우매, 무리가 그의 앞에서 소리 지르기를 「엎드리라(아브렉)」 하더라.', ref: '창세기 41:43' },
    { cam: t => { const [x, z] = along((t + 9) / 16); return [x - 5, hAt(x, z) + 1.8, z + 7]; }, look: t => { const [x, z] = along((t + 9) / 16); return [x, hAt(x, z) + 1.6, z]; }, dur: 7, sfx: 'cheerC',
      each: t => { const [x, z, f] = along((t + 9) / 16); const P = G.P; P.x = x; P.z = z; P.y = hAt(x, z); P.face = f; P.spd = 6; }, t: '아브렉! 아브렉!', n: '애굽 백성', e: 'shout' },
    { cam: [-14, hAt(-22, -66) + 6, -56], cam2: [-8, hAt(-22, -66) + 14, -48], look: [-22, hAt(-22, -66) + 1.4, -66], dur: 8, t: '바로가 그에게 애굽 전국을 총리로 다스리게 하였더라. 요셉이 애굽 왕 바로 앞에 설 때에 삼십 세라.', ref: '창세기 41:43, 46', fadeOut: 1.6 },
    { black: true, title: '5장 · 일곱 해 풍년', sub: '창세기 41:46–52', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4, fn: () => { S.q.parade = 0; crowdLine(G, road, false); } },
  ], () => { S.q.chariotOk = 1; S.q.riding = 1; GG.Game.musicOverride = null; G.go('c5_patrol'); });
}
function crowdLine(G, road, on) {
  const LK = [LOOK.farmer, LOOK.woman, LOOK.elder, LOOK.maid, LOOK.official, LOOK.farmerThin, LOOK.priest, EGV.kidA, EGV.kidB, EGV.waterB];
  for (let i = 0; i < 18; i++) { const id = 'abrek' + i; if (!on) { if (G.npc(id)) G.removeNPC(id); continue; }
    const k = (i % 9) / 9 + 0.04, n = road.length - 1, f = k * n, j = Math.floor(f), u = f - j; const x = lerp(road[j][0], road[j + 1][0], u), z = lerp(road[j][1], road[j + 1][1], u), s = i < 9 ? 1 : -1;
    if (!G.npc(id)) G.spawnNPC({ id, name: '애굽 백성', look: LK[i % LK.length], scale: LK[i % LK.length].kid ? 0.7 : 1, x: x + s * 3.4, z: z + (i % 3) * 0.7, face: s > 0 ? -1.57 : 1.57, noTalk: true, noTag: true, act: i % 3 === 0 ? 'cheer' : i % 3 === 1 ? 'prostrate' : 'wave' }); }
}

// ------------------------------------------------------------------ 5장 · the seven years of plenty
function birthScene(S, G, which) {
  const ax = 7.6, az = -137.4, h = hAt(ax, az);
  if (which === 'manasseh') cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = Math.floor(S.time / 24) * 24 + 19.6; }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 7, music: 'j_night',
      t: '흉년이 들기 전에 요셉에게 두 아들이 나되, 곧 온의 제사장 보디베라의 딸 아스낫이 그에게서 낳은지라.', ref: '창세기 41:50' },
    { cam: [ax + 2.75, h + 1.4, az - 0.7], look: [ax + 0.4, h + 1.0, az + 0.4], dur: 6, n: '아스낫', t: '당신을 닮았어요. 이 아이의 이름을 무엇이라 할까요?', e: 'tender' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '므낫세. 하나님이 내게 내 모든 고난과 내 아버지의 온 집 일을 잊어버리게 하셨다.', ref: '창세기 41:51', e: 'tender' },
    { fn: () => { const a = G.npc('asenath'); if (a) a.sit = false; G.P.face = 1.2; }, hour: 22.5, cam: [ax - 2, h + 1.2, az + 4], look: [ax + 30, h + 14, az - 6], dur: 9,
      t: '그러나 그날 밤, 요셉은 오래도록 동쪽 하늘을 바라보았습니다. 가나안이 있는 쪽이었습니다.', fadeOut: 1.6 },
  ], () => { S.q.born1 = 1; GG.Game.musicOverride = null; G.newDay('풍년 둘째 해'); G.go('c5_year2'); });
  else cine([
    { fn: () => { G.teleport(ax + 1.4, az + 1.8, -2.4); place('asenath', ax, az, 0.6, { sit: true }); S.time = Math.floor(S.time / 24) * 24 + 18.4; }, cam: [ax + 3.4, h + 1.6, az + 3.4], look: [ax + 0.6, h + 1, az + 0.8], dur: 6, music: 'j_hope',
      t: '이듬해, 아스낫이 둘째 아들을 낳았습니다. 므낫세가 아장아장 걸어와 동생을 들여다보았습니다.' },
    { cam: [ax + 1.45, h + 1.45, az + 0.5], look: [ax + 1.4, h + 1.55, az + 1.8], dur: 9, fov: 0.6, n: '요셉', t: '에브라임. 하나님이 나를 내가 수고한 땅에서 번성하게 하셨다.', ref: '창세기 41:52', e: 'happy' },
    { cam: [ax + 5, h + 2.6, az + 6], look: [ax, h + 0.8, az], dur: 7, t: '구덩이에서 울던 소년은, 이제 두 아이의 아버지가 되었습니다.', fadeOut: 1.4 },
  ], () => { S.q.born2 = 1; GG.Game.musicOverride = null; const a = G.npc('asenath'); if (a) a.sit = false; G.go('c5_years'); });
}
function plentyMontage(S, G) {
  const gs = sites.map(s => [s.x, s.z, hAt(s.x, s.z)]);
  cine([
    { fn: () => { LAND = 'plenty'; G.W().recolor(color); RT.sacks = 1; }, cam: [gs[0][0] + 12, gs[0][2] + 7, gs[0][1] + 10], cam2: [gs[0][0] + 8, gs[0][2] + 4, gs[0][1] + 7], look: [gs[0][0], gs[0][2] + 1.5, gs[0][1]], dur: 7, music: 'j_plenty', title: '풍년 셋째 해', sub: '',
      t: '일곱 해 풍년에 토지 소출이 심히 많았습니다.', ref: '창세기 41:47' },
    { fn: () => { RT.sacks = 2; }, cam: [-60, 18, -120], cam2: [-90, 22, -60], look: [-100, 1, -100], look2: [-120, 1, -20], dur: 8, title: '풍년 다섯째 해', sub: '', t: '요셉이 애굽 땅에 있는 그 일곱 해의 곡물을 거두어 각 성에 저장하되, 각 성 주위의 밭의 곡물을 그 성 중에 쌓아 두었습니다.', ref: '창세기 41:48' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[1][0] + 10, gs[1][2] + 5, gs[1][1] - 8], look: [gs[1][0], gs[1][2] + 1.5, gs[1][1]], dur: 7, title: '풍년 일곱째 해', sub: '', t: '요셉이 곡식을 저축함이 바다의 모래 같이 심히 많아, 세기를 그쳤으니 이는 그 수가 한이 없음이었더라.', ref: '창세기 41:49' },
    { fn: () => { RT.sacks = 3; }, cam: [gs[2][0] + 8, gs[2][2] + 4, gs[2][1] + 9], look: [gs[2][0], gs[2][2] + 2, gs[2][1]], dur: 6, t: '언덕 위 곳간은 물 한 방울 들지 않았고, 곳간마다 곡식이 천장까지 쌓였습니다.' },
    { fn: () => { LAND = 'famine'; G.W().recolor(color); }, hour: 13, cam: [-50, 16, 40], cam2: [-70, 20, 10], look: [-100, 1, 40], look2: [-110, 1, 0], dur: 9, music: 'j_famine', sfx: 'wind',
      t: '애굽 땅에 일곱 해 풍년이 그치고, 요셉의 말과 같이 일곱 해 흉년이 들기 시작하매, 각국에는 기근이 있으나 애굽 온 땅에는 먹을 것이 있더니', ref: '창세기 41:53–54', fadeOut: 1.6 },
    { black: true, title: '6장 · 일곱 해 흉년', sub: '창세기 41:53–42:9', cam: [-22, 6, -60], look: [-22, 1, -66], dur: 4 },
  ], () => { GG.Game.musicOverride = null; S.day += 7 * 360; G.go('c6_open'); });
}

// ------------------------------------------------------------------ 6장 · the seven years of famine
function famineEnter(S, G, re) {
  if (LAND !== 'famine') { LAND = 'famine'; G.W().recolor(color); }
  if (!re) narr([{ kick: '창세기 41:55', title: '요셉에게 가라', t: '애굽 온 땅이 굶주리매 백성이 바로에게 부르짖어 양식을 구하는지라. 바로가 애굽의 모든 백성에게 이르되 「요셉에게 가서 그가 너희에게 이르는 대로 하라」 하니라.', ref: '창세기 41:55' }]);
}
function openGranary(S, G, k) {
  const g = sites.find(s => s.id === 'gran' + k), h = hAt(g.x, g.z);
  cine([{ cam: [g.x + 5, h + 2.2, g.z + 9], look: [g.x, h + 2, g.z], dur: 5, sfx: 'door', t: k === 'A' ? '요셉이 모든 창고를 열고 애굽 백성에게 팔았습니다.' : k === 'B' ? '서쪽 마을 사람들이 곳간 앞으로 몰려들었습니다.' : '물이 닿지 않는 언덕 위 곳간의 곡식은 한 톨도 상하지 않았습니다.', ref: k === 'A' ? '창세기 41:56' : '',
    fn: () => { (S.q.opened = S.q.opened || {})[k] = 1; G.sfx('cheerC'); G.FX.burst(g.x, h + 1.5, g.z + 3, 26, { c: [0.95, 0.82, 0.45], sp: 2, up: 2 }); } }],
  () => { G.UI.quest(); G.checkStep(); });
}
steps.c6_sell.talk = {
  byFarmer(S, G) { return sellTo(S, G, 'byFarmer', [N('farmer', '총리님… 풍년에 오분의 일을 바치라 하실 때는 원망도 했습니다. 그 곡식이 이렇게 돌아올 줄이야.', '', 'weary'),
    { n: '요셉', t: '어떻게 할까?', choices: [{ t: '"정한 값으로 파시오. 그리고 씨앗도 조금 덤으로 드리시오. 흉년이 끝나면 다시 뿌려야 하니까."', ok: true }, { t: '"값을 두 배로 받으시오. 모자라니까."', ok: false, fb: '곳간은 백성을 살리려고 지은 것이었어요.' }] },
    N('farmer', '씨앗까지…! 총리님, 이 은혜를 잊지 않겠습니다.', '', 'happy')]); },
  byWoman(S, G) { return sellTo(S, G, 'byWoman', [N('woman', '아이들이 사흘을 굶었어요. 은이 이것밖에 없는데… 반 자루라도 될까요?', '', 'cry'),
    J('한 자루를 가져가시오. 모자라는 값은 아이들이 자라서 갚으면 되오.', '', 'tender'), N('woman', '…한 자루를요? 하나님이 당신을 보내셨군요.', '', 'cry')]); },
  byElder(S, G) { return sellTo(S, G, 'byElder', [N('overseerW', '총리님! 저를 기억하십니까? 오분의 일이 웬 말이냐고 대들던 서쪽 마을 촌장입니다.', '', 'happy'),
    N('overseerW', '그때 총리님이 「지금 쌓은 곡식이 당신의 아이들을 살릴 것이오」 하셨지요. 제 손녀가… 살았습니다. 이제 다섯 살이에요.', '', 'cry'), J('하나님이 하신 일이오, 촌장.', '', 'tender')]); },
  bySidon(S, G) { return sellTo(S, G, 'bySidon', [N('sidon', '바다 건너 시돈에서 왔소. 온 세상에 기근이 심하여, 각국 백성이 다 애굽으로 곡식을 사러 온다오.', '창세기 41:57'),
    J('먼 길 오셨소. 정한 값에 파시오. 이방인이라고 값을 더 받지 마시오.', '', 'calm')]); },
  byEdom(S, G) { return sellTo(S, G, 'byEdom', [N('edom', '에돔 땅에서 왔습니다. 가나안도 기근이 아주 심하지요.', '', 'weary'),
    N('edom', '헤브론 골짜기의 늙은 족장 집안도 곧 애굽으로 곡식을 사러 올 거라더군요. 아들이 열하나라던가…', '', 'calm'),
    J('……헤브론? 그 족장의 이름이… 혹시…', '', 'awe'), N('edom', '야곱이라던가. 이스라엘이라고도 하고. 옛날에 아들 하나를 들짐승에게 잃었다지요.', '', 'calm'),
    T('요셉의 손이 떨렸습니다. 이십 년 동안 한 번도 잊은 적 없는 이름이었습니다.')]); },
  byAmeni(S, G) { return sellTo(S, G, 'byAmeni', [N('ameni', '총리님께 곡식을 사러 왔습니다. 보디발 나리 댁에서… 얘야? 너… 요셉이냐?', '', 'awe'),
    J('아메니! 아메니 할아버지!', '', 'happy'), T('요셉은 총리의 자리에서 내려와, 늙은 종을 끌어안았습니다.'),
    N('ameni', '네 하나님이… 정말로 너와 함께 하셨구나. 그 구덩이에서도, 그 옥에서도.', '', 'cry'),
    J('할아버지가 가르쳐 주신 애굽 말로 바로 앞에서 말했어요. 엠 헤테프, 아메니. 평안히.', '', 'tender')]); },
};
function sellTo(S, G, id, lines) {
  const b = BUYERS.find(x => x.id === id); if ((S.q.sold || {})[id]) return false;
  if (b.last && Object.keys(S.q.sold || {}).length < 5) { say([N(id === 'byAmeni' ? 'ameni' : id, '…먼저 온 사람들부터 사게 하시오.')]); return; }
  say(lines, () => { (S.q.sold = S.q.sold || {})[id] = 1; G.sfx('coins'); emote(id, 'bow', 2); G.UI.quest(); G.checkStep(); });
}
// the brothers come (창 42:1–9)
function cinBrothers(S, G, next) {
  const heb = SPOTS.jacobTent, hh = hAt(heb[0], heb[1] + 4), gx = 16, gz = -58, gh = hAt(gx, gz);
  const jx = gx, jz = gz - 1.6;
  cine([
    { hour: 9, fn: () => { S.q.heb2 = 1; S.q.broShow = 1; BRO.forEach((id, i) => place(id, heb[0] - 3 + (i % 5) * 1.5, heb[1] + 5 + Math.floor(i / 5) * 1.6, Math.PI)); place('jacob', heb[0], heb[1] + 2.6, 0); npcSet('jacob', { look: LOOK.jacobMourn }); place('benjamin2', heb[0] + 2.2, heb[1] + 2.4, -0.4); },
      cam: [heb[0] + 4.4, hh + 1.8, heb[1] + 9.6], look: [heb[0], hh + 1.2, heb[1] + 3.4], dur: 7, music: 'j_mourn', t: '그 때에 야곱이 애굽에 곡식이 있음을 보고 아들들에게 이르되, 「너희는 어찌하여 서로 바라보고만 있느냐」', ref: '창세기 42:1' },
    { cam: [heb[0] - 1.4, hh + 1.6, heb[1] + 5], look: [heb[0], hh + 1.4, heb[1] + 2.6], dur: 8, n: '야곱', t: '내가 들은즉 저 애굽에 곡식이 있다 하니, 너희는 그리로 가서 거기서 우리를 위하여 사 오라. 그러면 우리가 살고 죽지 아니하리라.', ref: '창세기 42:2', e: 'weary' },
    { cam: [heb[0] + 3.6, hh + 1.4, heb[1] + 1.4], look: [heb[0] + 2.2, hh + 1.5, heb[1] + 2.4], dur: 8, t: '요셉의 형 열 사람이 애굽에서 곡식을 사려고 내려갔으나, 야곱이 요셉의 아우 베냐민은 그의 형들과 함께 보내지 아니하였으니, 이는 그의 생각에 재난이 그에게 미칠까 두려워함이었더라.', ref: '창세기 42:3–4' },
    { fn: () => { S.q.heb2 = 0; G.teleport(jx, jz, 0); BRO.forEach((id, i) => place(id, gx - 4.5 + (i % 5) * 2.2, gz + 4 + Math.floor(i / 5) * 1.8, Math.PI)); ['byFarmer', 'byWoman', 'byElder', 'bySidon', 'byEdom', 'byAmeni'].forEach(id => G.npcShow(id, false)); },
      cam: [gx + 8, gh + 2.6, gz + 12], cam2: [gx + 5, gh + 2, gz + 9], look: [gx, gh + 1.2, gz + 2], dur: 7, music: 'j_finale', t: '요셉이 나라의 총리로서 그 땅 모든 백성에게 곡식을 팔더니, 요셉의 형들이 와서', ref: '창세기 42:6' },
    { fn: () => BRO.forEach((id, i) => { const n = G.npc(id); if (n) { n.act = null; n.emote = { k: 'prostrate', t: -i * 0.15, dur: 12, amb: true }; } }), cam: [jx + 0.8, gh + 2.8, jz - 2.8], look: [gx, gh + 0.3, gz + 5], dur: 9, t: '그 앞에서 땅에 엎드려 절하매', ref: '창세기 42:6' },
    { fn: () => { RT.dreamFx = 'sheaves'; RT.dreamK = 0; }, cam: [DREAM.x + 3.6, hAt(DREAM.x, DREAM.z) + 1.2, DREAM.z + 3.6], cam2: [DREAM.x + 2.8, hAt(DREAM.x, DREAM.z) + 1.6, DREAM.z + 2.8], look: [DREAM.x, hAt(DREAM.x, DREAM.z) + 0.8, DREAM.z], dur: 9, fadeIn: 1,
      each: t => { RT.dreamK = Math.min(1, t / 6); }, t: '요셉이 그들에게 대하여 꾼 꿈을 생각하고', ref: '창세기 42:9' },
    { fn: () => { RT.dreamFx = null; }, cam: [jx - 1.2, gh + 1.7, jz + 1.4], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.55, fadeIn: 0.8, t: '요셉이 보고 형들인 줄을 아나, 모르는 체하고 엄한 소리로 그들에게 말하였습니다.', ref: '창세기 42:7' },
    { cam: [jx + 1.6, gh + 1.7, jz + 1.2], look: [jx, gh + 1.6, jz], dur: 5, n: '요셉', t: '너희가 어디서 왔느냐?', ref: '창세기 42:7', e: 'cold' },
    { fn: () => { const n = G.npc('judah'); if (n) n.act = 'kneelRest'; }, cam: [gx - 2, gh + 1.2, gz + 1.6], look: [gx - 0.1, gh + 0.9, gz + 4], dur: 6, n: '유다', t: '곡물을 사려고 가나안 땅에서 왔나이다.', ref: '창세기 42:7', e: 'fear' },
    { cam: [jx + 0.8, gh + 1.6, jz + 0.9], look: [jx, gh + 1.6, jz], dur: 7, fov: 0.5, t: '요셉은 그들을 알아보았으나, 그들은 요셉을 알아보지 못하더라.', ref: '창세기 42:8' },
    { cam: [gx + 14, gh + 8, gz + 14], cam2: [gx + 20, gh + 16, gz + 20], look: [gx, gh + 1, gz + 2], dur: 10, fadeOut: 2.4,
      t: '스무 해 전 도단의 구덩이에서 울던 소년이, 이제 애굽의 총리가 되어 형들 앞에 서 있었습니다. 그리고 이야기는 이제, 용서와 화해를 향해 나아갑니다.', ref: '창세기 42–45장' },
  ], () => { GG.Game.musicOverride = 'j_finale'; const H = S.hero || { lvl: 1 };
    narr([{ kick: '창세기 42:9', title: '형들의 마음', t: '요셉은 곧바로 자기를 밝히지 않았습니다. 스무 해 전 자기를 팔았던 형들의 마음이 정말 변했는지, 아우 베냐민은 무사한지 알고 싶었습니다.', ref: '창세기 42:7–9' },
      { kick: '나의 여정', title: `${S.day}일의 기록`, t: `배운 애굽 말 ${Object.keys(S.q.words || {}).length}개 · 지은 곳간 ${['granA', 'granB', 'granC'].filter(k => S.built[k]).length}채 · 곡식을 판 사람 ${Object.keys(S.q.sold || {}).length}명 · 살펴서 알아낸 것 ${Object.keys(S.flags.lore || {}).length}개 · 만들어 본 요리 ${Object.keys(S.flags.dishes || {}).length}가지 · 체력 Lv ${H.lvl}`, ref: '' }], () => {
      S.q.broShow = 0; GG.Game.musicOverride = null; npcSet('jacob', { look: LOOK.jacob }); BRO.forEach(id => { const n = G.npc(id); if (n) { n.act = null; n.emote = null; } }); next(); }); });
}
// ------------------------------------------------------------------ precise targets (the guide light points at the next thing to use)
steps.p_approach.target = { x: 160, z: -141 };
steps.c2_store.target = S => { const sh = S.q.shelf || {}; const sp = specials.find(s => s.id.startsWith('sh_') && !sh[s.id.slice(3)]); return sp ? { x: sp.x, z: sp.z } : 'npc:scribe'; };
steps.c3_keeper.target = S => { const g = S.q.gave || {}; const i = [0, 1, 2, 3].find(k => !g[k]); if (i === undefined) return 'npc:oldP'; return S.water > 0 ? { x: CELL[i][0], z: -4.9 } : 'spot:basin'; };
steps.c3_charge.target = S => { const f = S.q.fed || {}; const i = [0, 1, 2, 3].find(k => !f[k]); if (i === undefined) return 'npc:prisA'; return Gm().P.carry === 'basket' ? { x: CELL[i][0], z: -4.9 } : { x: -32, z: 6.2 }; };
steps.c6_open.target = S => { const o = S.q.opened || {}; const k = ['A', 'B', 'C'].find(q => !o[q]); if (!k) return null; const g = sites.find(s => s.id === 'gran' + k); return { x: g.x, z: g.z + 4 }; };
steps.c5_patrol.target = S => !S.q.rode ? null : !qd(S, 'metC') ? 'npc:overseerC' : !qd(S, 'metW') ? 'npc:overseerW' : !qd(S, 'metS') ? 'npc:overseerS' : null;
