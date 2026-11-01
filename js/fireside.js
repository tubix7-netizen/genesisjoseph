/* 약속의 길 — 모닥불 곁 이야기 · 한낮의 물 한 모금 (v16.7)
   · 마을 모닥불: once the story reaches Egypt, the villages, the market, the Nile ford, Potiphar's workers' yard and the vizier's
     courtyard each get a fire that burns all the time (fixed records in S.bld, pre:1 — they warm, dry and cook like a built one).
   · 「모닥불가에 앉기」 by any fire at night, or whenever Joseph is wet or cold: he sits, dries and warms (5 minutes), and whoever
     is near — family first, then people he knows — comes to sit with him. Around the fire: tell one of the old stories
     (Abraham's stars, Isaac on Moriah, Jacob's ladder, the wrestling at the Jabbok, Noah's rainbow, Joseph's own dreams),
     listen to theirs, pray together. Once a night: 정신력 and 친밀도 grow. Telling all six stories → 「모닥불 이야기꾼」.
   · 한낮의 물 한 모금: in Egypt's midday heat a worker nearby sometimes calls for water (a bubble over their head). Bring water
     in a jar (draw it at a well) and hand it over: 친밀도 +6 and a small thank-you; every 5 → 깨달음.
   API: G.Fireside.sit(fire) · G.Fireside.thirst() (debug) */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), rnd = a => a[Math.floor(Math.random() * a.length)], sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const F = G.Fireside = {};
const FAM = ['asenath', 'manasseh', 'ephraim'];
const KID = /아이|소년|소녀|목동|므낫세|에브라임/;
const hour = S => S.time % 24, nightKey = S => hour(S) < 5 ? S.day - 1 : S.day, isNight = S => hour(S) >= 18.5 || hour(S) < 5;
const absH = S => S.day * 24 + hour(S);
const calm = () => Game.cineOn || (G.Cine && G.Cine.on) || G.UI.busy() || G.UI.modal();
const EPJ = () => G.EP && G.EP.joseph;
const egypt = S => { const E = EPJ(); return !!(E && E.landOf && E.landOf(S) === 'egypt'); };
const npc = id => Game.ENT.npcs[id];
const kidOf = n => KID.test(n.name + ' ' + (n.d.role || ''));

// ------------------------------------------------------------------ village fires
const ANCHORS = [['총리의 집 마당', 10, -140], ['왕의 도성', -22, -72], ['서쪽 마을', -140, -40], ['남쪽 마을', -145, 128], ['노예 장터', -8, 118], ['나일 나루', -92, -60], ['일꾼 마당', -45, 53]];
function seedFires(S) { const Bd = G.Build; if (!Bd || !Bd.check || !Bd.prebuild) return; S.flags.vfires = 1; let n = 0;
  for (const [name, ax, az] of ANCHORS) { let ok = null;
    for (let r = 6; r <= 30 && !ok; r += 1.5) for (let k = 0; k < 10 && !ok; k++) { const a = k / 10 * Math.PI * 2 + r * 0.7, x = ax + Math.sin(a) * r, z = az + Math.cos(a) * r; if (!Bd.check('campfire', x, z, 0, 1, true) && !Bd.check('house', x, z, 0, 1, true)) ok = [x, z]; }
    if (ok) { Bd.prebuild(S, 'campfire', ok[0], ok[1], Math.random() * 6, name + ' 모닥불'); n++; } }
  return n; }

// ------------------------------------------------------------------ what people say by the fire
const STORIES = [
  { k: 'stars', n: '아브라함과 하늘의 별', t: ['우리 증조할아버지 아브라함은 자식이 없었어요. 그런데 하나님이 그분을 밖으로 데리고 나가 말씀하셨지요.', '「하늘을 우러러 뭇별을 셀 수 있나 보라. 네 자손이 이와 같으리라.」 아브라함은 그 말씀을 믿었고, 하나님은 그 믿음을 의로 여기셨어요.'],
    kid: ['저 별들을 다 세요? 하나, 둘, 셋… 너무 많아요!', '그럼 저도 그 별 중에 하나예요?'], wife: '별을 볼 때마다 그 약속이 떠오르겠네요.', man: '하늘의 별만큼이라니… 그런 약속을 하는 신은 처음 들어 보오.' },
  { k: 'moriah', n: '모리아 산의 숫양', t: ['하나님이 할아버지 이삭을 바치라 하셨을 때, 아브라함은 새벽같이 일어나 산으로 갔어요.', '칼을 든 그 순간 하나님이 멈추게 하셨고, 덤불에 뿔이 걸린 숫양이 있었어요. 그래서 그곳을 「여호와 이레」, 하나님이 준비하신다고 불렀대요.'],
    kid: ['휴… 다행이다! 이삭 할아버지 무서웠겠어요.', '하나님이 양을 미리 숨겨 두셨어요?'], wife: '준비하시는 하나님… 우리 집에도 그러셨어요.', man: '아들을 아끼는 신이라… 이 땅의 신들과는 다르구려.' },
  { k: 'ladder', n: '벧엘의 사다리', t: ['우리 아버지 야곱은 형을 피해 홀로 길을 떠났어요. 돌을 베개 삼아 잠들었는데, 꿈에 땅에서 하늘까지 닿는 사다리가 보였대요.', '하나님의 사자들이 오르락내리락하고, 하나님이 말씀하셨어요. 「내가 너와 함께 있어 네가 어디로 가든지 너를 지키리라.」'],
    kid: ['사다리가 하늘까지요? 저도 올라가 보고 싶어요!', '할아버지도 혼자 무서웠어요? 그래도 하나님이 계셨네요.'], wife: '당신이 구덩이에서도, 옥에서도 그 말씀을 붙들었던 거군요.', man: '어디로 가든 함께한다… 나도 그런 말을 들어 보고 싶구려.' },
  { k: 'jabbok', n: '얍복 나루의 씨름', t: ['형 에서를 만나기 전날 밤, 아버지는 얍복 나루에서 어떤 분과 밤새 씨름했어요. 「축복하지 않으면 보내지 않겠습니다!」', '그분이 아버지의 이름을 바꿔 주셨어요. 하나님과 겨루어 이긴 사람, 이스라엘. 그날부터 아버지는 다리를 절며 걸으셨지요.'],
    kid: ['밤새 씨름을요? 저도 아빠랑 씨름할래요!', '이스라엘… 멋진 이름이에요!'], wife: '축복을 놓지 않은 사람… 당신 아버지를 꼭 뵙고 싶어요.', man: '신과 씨름을 하다니, 대단한 사람이구려.' },
  { k: 'rainbow', n: '노아와 무지개', t: ['오래전 온 땅이 물에 잠겼을 때, 하나님은 노아의 가족과 짐승들을 방주로 지키셨어요.', '물이 걷히자 하늘에 무지개를 두시고 약속하셨지요. 다시는 물로 땅을 멸하지 않겠다고. 그래서 비 갠 뒤 무지개를 보면 그 약속이 생각나요.'],
    kid: ['짐승들이 다 배에 탔어요? 낙타도요? 하마도요?', '다음에 무지개 뜨면 꼭 알려 주세요!'], wife: '비 온 뒤에 그 이야기를 다시 들려주세요. 아이들이 좋아할 거예요.', man: '나일이 넘칠 때마다 무서웠는데… 그런 약속이 있었구려.' },
  { k: 'dreams', n: '요셉의 두 꿈', t: ['어릴 적 저는 꿈을 꾸었어요. 밭에서 곡식단을 묶는데 형들의 단이 제 단에 절을 하는 꿈, 해와 달과 열한 별이 제게 절하는 꿈.', '그 꿈을 자랑하다 형들의 미움을 샀지요. 구덩이에 던져지고 종으로 팔렸어요. 그런데 지금 돌아보면… 그 모든 길에 하나님이 계셨어요.'],
    kid: ['아빠 형들 나빠요! …그래도 지금은 용서했어요?', '아빠 꿈이 진짜가 됐어요?'], wife: '그 길 끝에서 우리가 만났네요. 저는 그 길이 고마워요.', man: '총리께서 종이었다니… 그래서 우리 같은 사람 마음을 아시는구려.' }];
const TALK = [
  [/아스낫/, ['불빛에 비친 아이들 얼굴 보셨어요? 당신을 꼭 닮았어요.', '온에 살 때는 밤이 이렇게 따뜻한 줄 몰랐어요. 당신이 오고 나서예요.', '오늘 므낫세가 「아빠의 하나님」께 혼자 기도했어요. 저도 따라 했어요.']],
  [/므낫세|에브라임/, ['아빠, 불똥이 별처럼 올라가요!', '아빠 옆에 있으면 하나도 안 추워요.', '아빠, 내일도 여기 앉아요. 약속!']],
  [/어부|그물|나루|사공/, ['나일 강은 밤이 되면 소리가 달라지오. 하마가 숨 쉬는 소리가 들리지.', '오늘은 메기 한 마리를 놓쳤는데 팔뚝만 했다오. 정말이오!']],
  [/농부|일꾼|밭|감독/, ['올해 물이 알맞게 넘쳐서 밭이 검게 기름졌소. 감사한 일이지.', '하루 종일 흙을 만지다 이렇게 불가에 앉으면 세상 부러울 게 없소.']],
  [/상인|장사/, ['나는 남쪽 누비아까지 다녀왔소. 거기 사람들은 상아로 빗을 만든다오.', '장사는 믿음이 반이오. 당신 같은 사람과 거래하면 마음이 편하지.']],
  [/노인|장로|할아버지|할머니|제사장/, ['내 아버지의 아버지 때도 이 불가에서 이야기를 나눴다오. 불은 늘 사람을 모으지.', '젊은이, 사람은 등불 같아서 바람 앞에 설 때 밝기가 드러난다오.']],
  [/여인|물 긷|베 짜/, ['베틀 앞에 종일 앉아 있으면 어깨가 굳어요. 불 쬐니 좀 풀리네요.', '우리 딸이 오늘 처음으로 물동이를 혼자 이었어요.']],
  [/./, ['불을 보고 있으면 걱정이 타서 날아가는 것 같소.', '이런 밤엔 고향 생각이 나지. 당신도 그렇소?', '당신 하나님 이야기를 하나 더 해 주시오. 듣고 싶구려.']]];
const talkOf = n => { const s = n.name + ' ' + (n.d.role || ''); for (const [rx, l] of TALK) if (rx.test(s)) return l; return TALK[TALK.length - 1][1]; };
const ALONE = ['(타닥타닥 타는 불을 보며 헤브론 장막 앞 모닥불을 떠올린다. 아버지는 지금 무엇을 하고 계실까.)', '(베냐민은 이제 많이 컸겠지… 하나님, 그 아이를 지켜 주세요.)',
  '(구덩이의 밤, 옥의 밤, 그리고 오늘 밤. 어느 밤에도 하나님은 나를 떠나지 않으셨다.)', '(불똥이 하늘로 올라가 별 사이로 사라진다. 「네 자손이 이와 같으리라」…)'];

// ------------------------------------------------------------------ sitting by the fire
const near = (x, z, r) => Object.keys(Game.ENT.npcs).filter(id => { const n = npc(id); return n && n.vis && !n.d.animal && !n.talking && !n.walk && Math.hypot(n.x - x, n.z - z) < r; });
function companions(f, S) { const P = Game.P, out = [];
  for (const id of FAM) { const n = npc(id); if (n && n.vis && (n.follow || Math.hypot(n.x - P.x, n.z - P.z) < 25)) out.push(id); }
  if (out.length < 3) { const B = G.Bond, others = near(P.x, P.z, 22).filter(id => !FAM.includes(id) && !kidOf(npc(id)) && (Math.hypot(npc(id).x - P.x, npc(id).z - P.z) < 10 || (B && B.level(id).i >= 1)));
    others.sort((a, b) => (B ? B.get(b).p - B.get(a).p : 0)); for (const id of others) { if (out.length >= 3) break; out.push(id); } }
  return out.slice(0, 3); }
let ring = null; // { f, ids, key }
F.sit = function (f) { const S = Game.S(), P = Game.P, C = G.Climate; if (ring || calm()) return; const key = nightKey(S), first = S.flags.fsNight !== key;
  const ids = companions(f, S); ring = { f, ids, key, told: 0 };
  G.UI.fade(() => { const W = Game.W(), y = W.heightAt(f.x, f.z) + 1.1; let a0 = Math.atan2(P.x - f.x, P.z - f.z), best = -1;
    // pick the side with room for Joseph behind him and for the camera across the fire
    for (let k = 0; k < 12; k++) { const a = a0 + k / 12 * Math.PI * 2, sx = Math.sin(a), sz = Math.cos(a); const me = W.ray(f.x + sx, y, f.z + sz, f.x + sx * 3, y, f.z + sz * 3), cam = W.ray(f.x - sx, y, f.z - sz, f.x - sx * 5, y + 1, f.z - sz * 5);
      const cx = f.x - sx * 4.2, cz = f.z - sz * 4.2, roofed = W.inRoof && W.inRoof(cx, cz, y + 1.2, null) ? 1 : 0; const wet = W.heightAt(f.x + sx * 1.7, f.z + sz * 1.7) < (W.water ? W.water.level : -99) + 0.25 ? 3 : 0; const sc = Math.min(1, me) + Math.min(1, cam) * 1.4 - roofed * 2 - wet - k * 0.002; if (sc > best) { best = sc; ring.a0 = a; } }
    a0 = ring.a0; P.x = f.x + Math.sin(a0) * 1.7; P.z = f.z + Math.cos(a0) * 1.7; P.face = a0 + Math.PI; P.vx = P.vz = 0; P.emote = { k: 'sitg', t: 0, dur: 1e4 };
    const wl = W.water ? W.water.level : -99, dry = a => { const x = f.x + Math.sin(a) * 1.75, z = f.z + Math.cos(a) * 1.75; return W.heightAt(x, z) > wl + 0.25 && !(W.waterAt && W.waterAt(x, z)) && W.ray(f.x + Math.sin(a), y, f.z + Math.cos(a), x + Math.sin(a) * 0.4, y, z + Math.cos(a) * 0.4) >= 1; };
    const seats = [0.95, -0.95, 1.85, -1.85, 2.5, -2.5].map(d => a0 + d).filter(dry);
    ids.forEach((id, i) => { const n = npc(id), a = seats.length ? seats[i % seats.length] + (i >= seats.length ? 0.4 : 0) : a0 + [0.95, -0.95, 1.85][i]; n.x = f.x + Math.sin(a) * 1.75; n.z = f.z + Math.cos(a) * 1.75; n.face = a + Math.PI; n.talking = true; n.walk = null; n.emote = null; n.sit = true; });
    if (C) { C.wet = 0; C.warm(300); } if (first) { S.flags.fsNight = key; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(15); }
    const cd = 1 + 4 * Math.max(0.4, Math.min(1, W.ray(f.x - Math.sin(a0), y, f.z - Math.cos(a0), f.x - Math.sin(a0) * 5, y + 1.2, f.z - Math.cos(a0) * 5)) - 0.05), gy = W.heightAt(f.x, f.z);
    Game.cineCam = { x: f.x - Math.sin(a0) * cd, y: gy + 1.2 + cd * 0.3, z: f.z - Math.cos(a0) * cd, lx: f.x + Math.sin(a0) * 0.5, ly: gy + 0.65, lz: f.z + Math.cos(a0) * 0.5, fov: 1.2 };
    Game.CAM.yaw = P.face; Game.noDlgCam = true; }, () => {
    const w = G.Weather && G.Weather.rainy() ? '빗소리 사이로 불이 타닥타닥 탑니다.' : isNight(S) ? rnd(['밤하늘에 별이 쏟아질 듯합니다. 불꽃이 타닥타닥 튀어 오릅니다.', '나일 쪽에서 서늘한 바람이 불어오고, 모닥불이 따뜻하게 일렁입니다.']) : '젖은 옷에서 김이 피어오릅니다. 불기운이 몸을 녹입니다.';
    const intro = [{ n: '', t: w }]; if (first) intro.push({ n: '', t: '몸이 마르고 따뜻해졌어요 · 정신력 +15' });
    if (ids.length) intro.push({ n: npc(ids[0]).name, t: ids[0] === 'asenath' ? rnd(['여기 계셨네요. 저도 같이 앉을게요.', '불 피워 두셨네요. 아이들도 데려올게요.']) : FAM.includes(ids[0]) ? rnd(['아빠! 나도 불 쬘래요!', '아빠 옆자리는 내 거예요!']) : rnd(['불 좀 같이 쬐어도 되겠소?', '아, 총리님도 불 쬐러 오셨구려. 앉으시오.', '이 불은 우리 마을 사람 누구나 쬐는 불이라오.']) });
    G.UI.say(intro, () => menu()); }); };
function menu() { const S = Game.S(), r = ring; if (!r) return; const ch = [];
  if (r.ids.length) { ch.push({ t: '옛이야기 들려주기', then: () => setTimeout(tellPick, 30) }); for (const id of r.ids) ch.push({ t: `${npc(id).name}의 이야기 듣기`, then: () => setTimeout(() => listen(id), 30) }); }
  else ch.push({ t: '불을 바라보며 생각하기', then: () => setTimeout(() => G.UI.say([{ n: '요셉', t: rnd(ALONE) }], menu), 30) });
  ch.push({ t: r.ids.length ? '함께 기도하기' : '기도하기', then: () => setTimeout(pray, 30) }); ch.push({ t: '일어나기', then: () => setTimeout(stand, 30) });
  G.UI.say([{ n: '', t: r.ids.length ? '무엇을 할까요?' : '홀로 불가에 앉아 있습니다.', choices: ch }], null); }
function tellPick() { const S = Game.S(), told = S.flags.told = S.flags.told || {};
  G.UI.say([{ n: '요셉', t: '어떤 이야기를 해 줄까…', choices: STORIES.map(s => ({ t: (told[s.k] ? '' : '✦ ') + s.n, then: () => setTimeout(() => tell(s), 30) })).concat([{ t: '다음에', then: () => setTimeout(menu, 30) }]) }], null); }
function tell(s) { const S = Game.S(), r = ring, told = S.flags.told = S.flags.told || {}, B = G.Bond; const lines = s.t.map(t => ({ n: '요셉', t }));
  for (const id of r.ids) { const n = npc(id); lines.push({ n: n.name, t: kidOf(n) ? rnd(s.kid) : id === 'asenath' ? s.wife : s.man }); }
  G.UI.say(lines, () => { const fresh = !told[s.k]; told[s.k] = 1;
    for (const id of r.ids) { const b = B && B.get(id); if (b && b.fire !== r.key) { b.fire = r.key; B.add(id, 4, '모닥불 이야기'); } }
    if (fresh) { G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(8); if (Object.keys(told).length === STORIES.length && !S.flags.storyteller) { S.flags.storyteller = 1; sfx('quest');
      G.UI.featCard && G.UI.featCard('story', { kick: '모닥불 이야기꾼', n: '여섯 이야기를 모두 들려주었어요', ic: 'star', d: '조상들의 하나님 이야기가 애굽 사람들의 불가로 퍼져 나가요. 깨달음 +2' }); Game.insight && Game.insight(2, '모닥불 이야기꾼'); } }
    menu(); }); }
function listen(id) { const n = npc(id), B = G.Bond; const lv = B ? B.level(id).i : 0, pool = talkOf(n);
  const ls = [{ n: n.name, t: rnd(pool) }]; if (lv >= 2 && !FAM.includes(id)) ls.push({ n: n.name, t: rnd(['당신이랑 이렇게 앉아 있으니 오래된 친구 같구려.', '이건 아무한테나 하는 얘기가 아니오. 당신이니까 하는 거요.']) });
  ls.push({ n: '요셉', t: rnd(['(고개를 끄덕이며 귀 기울인다)', '그랬군요. 들려줘서 고마워요.', '하나님이 그 마음을 아실 거예요.']) });
  G.UI.say(ls, () => { const b = B && B.get(id); if (b && b.fire !== ring.key) { b.fire = ring.key; B.add(id, 4, '불가의 이야기'); } menu(); }); }
function pray() { const S = Game.S(), r = ring, P = Game.P; P.emote = null; P.emote = { k: 'pray', t: 0, dur: 4 }; const ls = [{ n: '요셉', t: rnd(['조상들의 하나님, 오늘 하루도 지켜 주셔서 감사합니다. 이 불가에 앉은 이들의 집에도 평안을 주세요.', '하나님, 멀리 가나안에 계신 아버지와 베냐민을 지켜 주세요. 그리고 이 땅의 사람들도요.']) }];
  if (r.ids.length) ls.push({ n: npc(r.ids[0]).name, t: FAM.includes(r.ids[0]) ? '아멘!' : rnd(['…아멘. 당신 하나님께 나도 인사드리오.', '(조용히 눈을 감고 따라 한다)']) });
  G.UI.say(ls, () => { P.emote = null; P.emote = { k: 'sitg', t: 0, dur: 1e4 }; if (S.flags.fsPray !== r.key) { S.flags.fsPray = r.key; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(20); G.UI.toast('마음이 고요해졌어요 · 정신력 +20'); } menu(); }); }
function stand() { const P = Game.P, r = ring; ring = null; P.emote = null; Game.noDlgCam = false; if (Game.cineCam && !(G.Cine && G.Cine.on)) Game.cineCam = null; if (!r) return;
  for (const id of r.ids) { const n = npc(id); if (!n) continue; n.emote = null; n.sit = false; n.talking = false; }
  G.UI.toast('불기운이 5분 동안 추위를 막아 줘요'); }

// the action by the fire
Game.CTX.push(function (S) { const P = Game.P, C = G.Climate; if (ring || P.ride || P.swim || P.act || Game.cineOn) return null; const E = Game.EP(); if (!E || E !== EPJ()) return null;
  if (!(isNight(S) || (C && (C.wet > 0.2 || C.cold)))) return null;
  for (const st of E.stations || []) { if (st.type !== 'fire' || (st.on && !st.on(S, Game))) continue; const d = Math.hypot(st.x - P.x, st.z - P.z); if (d > 3.4) continue;
    return [{ d: d - 1.2, label: '모닥불가에 앉기', x: st.x, z: st.z, y: 0.8, key: 'fireside:' + st.id, reach: 1.7, use: () => F.sit(st) }]; }
  return null; });

// ------------------------------------------------------------------ midday thirst
const ASK = ['물… 물 한 모금만…', '아이고, 목이 타네…', '이 땡볕에 물 한 바가지면 살겠는데…', '누가 물 좀 주시오…'];
const GIFT = [['dates', 2, '대추야자'], ['bread', 1, '빵'], ['fig', 2, '무화과'], ['onion', 2, '양파'], [null, 8, '은 8']];
let tT = 0, bT = 0, cd = 40;
F.thirst = function (force) { const S = Game.S(), P = Game.P;
  const ids = near(P.x, P.z, 34).filter(id => !FAM.includes(id) && !kidOf(npc(id)) && Math.hypot(npc(id).x - P.x, npc(id).z - P.z) > (force ? 0 : 6));
  if (!ids.length) return null; const id = rnd(ids), n = npc(id); S.flags.thirst = { id, until: absH(S) + 2.5 }; bT = 0;
  G.UI.toast(`땡볕에 지친 ${n.name}이(가) 물을 찾아요 · 물항아리에 물을 담아 건네 보세요`); sfx('quest', { pitch: 0.8, vol: 0.5 }); return id; };
F.update = function (dt) { const S = Game.S(); if (!S || !S.flags || Game.mode !== 'play' || Game.EP() !== EPJ()) return; tT -= dt; if (tT > 0) return; tT = 1;
  if (!S.flags.vfires && egypt(S)) seedFires(S);
  const th = S.flags.thirst;
  if (th) { const n = npc(th.id); if (!n || !n.vis || absH(S) > th.until) { if (n && n.vis && Math.hypot(n.x - Game.P.x, n.z - Game.P.z) < 40) G.Life && G.Life.bubble(th.id, '휴… 그늘에서 좀 쉬어야겠다.', 3); S.flags.thirst = null; return; }
    if ((bT -= 1) <= 0 && !calm() && Math.hypot(n.x - Game.P.x, n.z - Game.P.z) < 40) { bT = 7; G.Life && G.Life.bubble(th.id, rnd(ASK), 3.5); } return; }
  const C = G.Climate; if (calm() || !egypt(S) || !C || C.hot < 0.4) return; if ((cd -= 1) > 0) return; cd = 75 + Math.random() * 60;
  if (S.flags.thirstDay === S.day && (S.flags.thirstToday || 0) >= 3) return; if (Math.random() < 0.55 && F.thirst()) { if (S.flags.thirstDay !== S.day) { S.flags.thirstDay = S.day; S.flags.thirstToday = 0; } S.flags.thirstToday++; } };
const talk0 = G.Life && G.Life.talk;
if (G.Life) G.Life.talk = function (id) { const S = Game.S(), th = S && S.flags && S.flags.thirst; if (!th || th.id !== id) return talk0.apply(this, arguments);
  const n = npc(id), done = () => { n.talking = false; }, has = S.water > 0;
  const give = () => { S.water--; S.flags.thirst = null; n.emote = { k: 'drink', t: 0, dur: 2.5 }; sfx('water', { vol: 0.5 }); const g = rnd(GIFT);
    setTimeout(() => G.UI.say([{ n: '', t: `${n.name}이(가) 물을 벌컥벌컥 들이켭니다.` }, { n: n.name, t: rnd(['살았다! 이 은혜를 어떻게 갚지요?', '아이고, 시원하다! 당신은 하늘이 보낸 사람이오.', '고맙소, 정말 고맙소. 이거라도 받아 주시오.']) }], () => {
      if (g[0]) { Game.give(g[0], g[1], true); G.UI.gain && G.UI.gain(g[0], g[1]); } else Game.silver(g[1]); G.Bond && G.Bond.add(id, 6, '물 한 모금');
      const k = S.flags.thirstN = (S.flags.thirstN || 0) + 1; if (k % 5 === 0) { Game.insight && Game.insight(1, '목마른 이에게 물을'); G.UI.featCard && G.UI.featCard('water', { kick: '한낮의 물 한 모금', n: `목마른 이웃 ${k}명에게 물을 건넸어요`, ic: 'drop', d: '작은 친절이 쌓여 깨달음 +1' }); }
      done(); }), 30); };
  const ch = has ? [{ t: `물 건네기 (물 ${S.water})`, then: give }, { t: '나중에요', then: done }] : [{ t: '우물에서 길어 올게요', then: () => { G.UI.toast(Game.tool('jar') || Game.tool('bigjar') ? '가까운 우물에서 「물 긷기」로 물항아리를 채워 오세요' : '물항아리가 있어야 물을 길어 올 수 있어요 (만들기 · 장터)'); done(); } }, { t: '미안해요', then: done }];
  G.UI.say([{ n: n.name, t: rnd(['아, 젊은이… 물 좀 있소? 이 볕에 쓰러질 것 같구려.', '일을 하다 보니 물을 다 마셔 버렸소… 목이 타오.']), choices: ch }], null); return true; };
})(window.G);
