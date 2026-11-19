/* 약속의 길 — 모닥불 곁 이야기 · 한낮의 물 한 모금 (v16.7)
   · 마을 모닥불: once the story reaches Egypt, the villages, the market, the Nile ford, Potiphar's workers' yard and the vizier's
     courtyard each get a fire that burns all the time (fixed records in S.bld, pre:1 — they warm, dry and cook like a built one).
   · 「모닥불가에 앉기」 by any fire at night, or whenever Joseph is wet or cold: he sits, dries and warms (5 minutes), and whoever
     is near — family first, then people he knows — may get up and walk over to sit with him (v18.73: each in their own time, slowly; some don't come;
     nobody appears out of nowhere). People of the Bible sit and listen without words (js/quiet.js). Around the fire: tell one of the old stories
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
const ANCHORS = [['총리의 집 마당', 10, -140], ['왕의 도성', -30, -80], ['서쪽 마을', -140, -40], ['남쪽 마을', -145, 128], ['노예 장터', -8, 118], ['나일 나루', -92, -60], ['일꾼 마당', -45, 53]];
/* v18.40 a village fire stands in an open yard: well off the wagon roads, with 3.5 m clear all round, away from doors and lanes, so a wagon can always go round it */
function fireOk(x, z) { const E = G.EP.joseph; if (Math.hypot(x + 92, z + 71) < 13) return false; /* v18.52 the north Nile landing stays open (the boats' pier) */ if (E && E.roadD && E.roadD(x, z) < 9) return false; if (Game.solidAt(x, z, 3.5)) return false; const W = Game.W(); if (W && W.water && W.heightAt(x, z) < W.water.level + 0.6) return false; if (W && W.slopeAt && W.slopeAt(x, z) > 0.3) return false; return true; }
function fireSpot(ax, az) { for (let r = 6; r <= 34; r += 1.5) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + r * 0.7, x = ax + Math.sin(a) * r, z = az + Math.cos(a) * r; if (fireOk(x, z)) return [x, z]; } return null; }
function refitFires(S) { const Bd = G.Build; if (!Bd || !Bd.relocate) return; for (const [name, ax, az] of ANCHORS) { const b = (S.bld || []).find(q => q.pre && q.k === 'campfire' && q.name === name + ' 모닥불'); if (!b || fireOk(b.x, b.z)) continue; const sp = fireSpot(ax, az); if (sp) Bd.relocate(b.id, sp[0], sp[1]); } }
function seedFires(S) { const Bd = G.Build; if (!Bd || !Bd.check || !Bd.prebuild) return; S.flags.vfires = 1; let n = 0;
  for (const [name, ax, az] of ANCHORS) { let ok = null;
    for (let r = 6; r <= 34 && !ok; r += 1.5) for (let k = 0; k < 12 && !ok; k++) { const a = k / 12 * Math.PI * 2 + r * 0.7, x = ax + Math.sin(a) * r, z = az + Math.cos(a) * r; if (!fireOk(x, z)) continue; /* v18.40 an open yard, off the wagon roads */ if (!Bd.check('campfire', x, z, 0, 1, true) && !Bd.check('house', x, z, 0, 1, true)) ok = [x, z]; }
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
    kid: ['아빠 형들 나빠요! …그래도 지금은 용서했어요?', '아빠 꿈이 진짜가 됐어요?'], wife: '그 길 끝에서 우리가 만났네요. 저는 그 길이 고마워요.', man: '그런 길을 걸어오셨다니… 그래서 우리 같은 사람 마음을 아시는구려.' }];
const TALK = [ /* (people of the Bible say nothing by the fire: js/quiet.js) */
  [/어부|그물|나루|사공/, ['나일 강은 밤이 되면 소리가 달라지오. 하마가 숨 쉬는 소리가 들리지.', '오늘은 메기 한 마리를 놓쳤는데 팔뚝만 했다오. 정말이오!']],
  [/농부|일꾼|밭|감독/, ['올해 물이 알맞게 넘쳐서 밭이 검게 기름졌소. 감사한 일이지.', '하루 종일 흙을 만지다 이렇게 불가에 앉으면 세상 부러울 게 없소.']],
  [/상인|장사/, ['나는 남쪽 누비아까지 다녀왔소. 거기 사람들은 상아로 빗을 만든다오.', '장사는 믿음이 반이오. 당신 같은 사람과 거래하면 마음이 편하지.']],
  [/노인|장로|할아버지|할머니|제사장/, ['내 아버지의 아버지 때도 이 불가에서 이야기를 나눴다오. 불은 늘 사람을 모으지.', '젊은이, 사람은 등불 같아서 바람 앞에 설 때 밝기가 드러난다오.']],
  [/여인|물 긷|베 짜/, ['베틀 앞에 종일 앉아 있으면 어깨가 굳어요. 불 쬐니 좀 풀리네요.', '우리 딸이 오늘 처음으로 물동이를 혼자 이었어요.']],
  [/./, ['불을 보고 있으면 걱정이 타서 날아가는 것 같소.', '이런 밤엔 고향 생각이 나지. 당신도 그렇소?', '당신 하나님 이야기를 하나 더 해 주시오. 듣고 싶구려.']]];
const talkOf = n => { const s = n.name + ' ' + (n.d.role || ''); for (const [rx, l] of TALK) if (rx.test(s)) return l; return TALK[TALK.length - 1][1]; };
/* v18.73 Joseph's own made-up thoughts by the fire are gone: only what is seen and heard */
const ALONE = ['요셉은 한동안 말없이 타는 불을 바라보았습니다.', '불똥이 하늘로 올라가 별 사이로 사라졌습니다.', '장작이 타닥타닥 타는 소리만 들렸습니다.', '불빛이 일렁이며 둘레의 어둠을 밀어냈습니다.'];

// ------------------------------------------------------------------ sitting by the fire
const TREEISH = /oak|palm|acacia|tamarisk|sycamore|retama|bush|tree|olive|fig|willow|cedar|pine|shrub|thorn|herb|crop|reed|papyrus|vine/i;
/* v18.78 a tree, bush or reeds between the camera and the fire hides Joseph: count them along the line (G.PROPLOG holds every placed prop) */
const treeOnLine = (x0, z0, x1, z1) => { const L = G.PROPLOG || []; let n = 0; const dx = x1 - x0, dz = z1 - z0, ll = dx * dx + dz * dz || 1; for (const [k, x, z] of L) { if (!TREEISH.test(k)) continue; const t = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / ll)), px = x0 + dx * t, pz = z0 + dz * t; if (Math.hypot(x - px, z - pz) < 1.5) n++; } return n; };
const inCrown = (W, x, y, z) => { for (const c of W.canopies || []) { if (Math.abs(c.x - x) > c.r || Math.abs(c.z - z) > c.r) continue; if (y > c.y0 - 4.2 && y < c.y1 && Math.hypot(c.x - x, c.z - z) < c.r * 0.9) return c; } return null; }; /* (big trees hang their leaves well below the crown's recorded bottom: keep the camera out from under them) */
const near = (x, z, r) => Object.keys(Game.ENT.npcs).filter(id => { const n = npc(id); return n && n.vis && !n.d.animal && !n.talking && !n.walk && Math.hypot(n.x - x, n.z - z) < r; });
const Cs = () => G.Cast;
const quiet = id => !!(G.Quiet && G.Quiet.is(id)); /* v18.73 a person of the Bible: comes and sits, says nothing */
const silent = id => { const n = npc(id), nt = n && n.d.noTalk; return typeof nt === 'function' ? !!nt(Game.S(), Game) : !!nt; };
const castFire = id => { const v = Cs() ? Cs().fire(id) : undefined; return v && quiet(id) ? { quiet: 1 } : v; }; /* v18.56 who this person is, by the fire (js/cast.js) · v18.73 no words for people of the Bible */
const kinNow = id => FAM.includes(id) || !!(Cs() && Cs().kin(id));
const nameGa = nm => G.Quiet ? G.Quiet.ga(nm) : nm + '이(가)';
function companions(f, S) { const P = Game.P, out = [];
  for (const id of FAM) { const n = npc(id); if (n && n.vis && (n.follow || Math.hypot(n.x - P.x, n.z - P.z) < 25)) out.push(id); }
  /* v18.56 Joseph's own people come first: in Hebron his father, Benjamin, Leah and Dinah; in Goshen his father and brothers */
  const PRI = ['jacob', 'benjamin', 'benjamin2', 'leah', 'dinah', 'reuben', 'judah']; /* father and Benjamin first, then the others */
  const pool = near(P.x, P.z, 25).concat(Object.keys(Game.ENT.npcs).filter(id => { const n = npc(id); return n && n.vis && n.follow && !FAM.includes(id); }));
  for (const id of pool.sort((a, b) => ((PRI.indexOf(a) + 1) || 99) - ((PRI.indexOf(b) + 1) || 99))) { if (out.length >= 3) break; if (out.includes(id) || !kinNow(id) || (silent(id) && !castFire(id)) || castFire(id) === false) continue; out.push(id); } /* v18.56b (the brothers and Benjamin are 「noTalk」 between errands in Goshen, but they still come to the fire) */
  if (out.length < 3) { const B = G.Bond, others = near(P.x, P.z, 22).filter(id => !out.includes(id) && !FAM.includes(id) && !silent(id) && castFire(id) !== false && (castFire(id) || !kidOf(npc(id))) && (Math.hypot(npc(id).x - P.x, npc(id).z - P.z) < 10 || (B && B.level(id).i >= 1)));
    others.sort((a, b) => (B ? B.get(b).p - B.get(a).p : 0)); for (const id of others) { if (out.length >= 3) break; out.push(id); } }
  return out.slice(0, 3); }
let ring = null; // { f, ids (seated), key, seats, come: [{ id, t, seat, walking }], news: [], atMenu }
let kept = null; /* while cooking: the people stay seated by the fire */
/* v18.73 nobody appears by the fire any more: whoever wants to come gets up and walks over slowly, each in their own time (some don't come at all) */
function invite(r, S) { const cand = companions(r.f, S);
  cand.forEach(id => { const n = npc(id); if (!n) return; const fol = !!n.follow, want = fol ? 1 : kinNow(id) ? 0.8 : 0.55; if (Math.random() > want) return;
    r.come.push({ id, t: fol ? 0.6 + Math.random() * 2 : 2 + Math.random() * 14, walking: false, home: [n.x, n.z, n.homeFace !== undefined ? n.homeFace : n.face], sched: !!n.d.sched, fol }); }); }
function seatOf(r, i) { const a = r.seats.length ? r.seats[i % r.seats.length] + (i >= r.seats.length ? 0.4 : 0) : r.a0 + [0.95, -0.95, 1.85, -1.85][i % 4]; return { a, x: r.f.x + Math.sin(a) * 1.75, z: r.f.z + Math.cos(a) * 1.75 }; }
function walkIn(r, c) { const n = npc(c.id), S = Game.S(); if (!n || !n.vis) { c.gone = 1; return; } c.walking = true; c.seat = r.nSeat++;
  const s = seatOf(r, c.seat); if (c.fol) { n.follow = false; c.wasFol = 1; } n.talking = true; n.sit = false; n.act = null; n.emote = null; n.wander = null;
  Game.npcWalk(c.id, s.x, s.z, () => arrive(r, c, s), 0.9 + Math.random() * 0.4); if (S.npcPos) delete S.npcPos[c.id]; }
function arrive(r, c, s) { const n = npc(c.id), live = ring === r || (kept && kept.r === r); if (!live || !n) return; c.walking = false; /* (still seated people count while Joseph cooks) */
  if (Math.hypot(n.x - s.x, n.z - s.z) > 1.4) { c.gone = 1; letGo(c); return; } /* couldn't get round to the fire: goes back to what they were doing */
  n.face = s.a + Math.PI; n.homeFace = n.face; n.act = 'sitg'; n.sit = false; r.ids.push(c.id); c.sat = 1;
  const nm = npc(c.id).name, cf = castFire(c.id), line = quiet(c.id) ? null : cf && cf.join ? rnd(cf.join) : rnd(['불 좀 같이 쬐어도 되겠소?', '아, 당신도 불 쬐러 오셨구려. 앉으시오.', '이 불은 우리 마을 사람 누구나 쬐는 불이라오.']);
  r.news.push({ n: '', t: `${nameGa(nm)} 불가로 와서 곁에 앉았어요.` }); if (line) r.news.push({ n: nm, t: line });
  /* v18.56 「아버지와 저녁 이야기」 (a request of Jacob's) ends here at the fire */
  const L = G.Life, S0 = Game.S(), QS = Game.EP().quests || {}; if (c.id === 'jacob' && L && L.active) for (const qid of L.active(S0)) { const q = QS[qid]; if (!q || q.giver !== 'jacob' || !L.qOk || !L.qOk(S0, qid) || !q.done) continue; r.doneQ = qid; break; }
  if (r.atMenu && ring === r) menu(); }
function letGo(c, toHome) { const n = npc(c.id); if (!n) return; if (n.walk && c.walking) n.walk = null; n.emote = null; n.sit = false; n.act = null; n.talking = false; c.walking = false;
  if (c.wasFol) { n.follow = true; return; } if (c.sched) { n.schedSlot = -1; return; } /* back to their day (js/life.js) */
  if (toHome !== false && c.home && Math.hypot(n.x - c.home[0], n.z - c.home[1]) > 1.2) { const S = Game.S(); Game.npcWalk(c.id, c.home[0], c.home[1], () => { n.face = n.homeFace = c.home[2]; }, 1.2); if (S.npcPos) delete S.npcPos[c.id]; } }
function arrTick(dt) { const r = ring; if (!r || !r.come) return; for (const c of r.come) { if (c.gone || c.sat || c.walking) continue; if ((c.t -= dt) <= 0) walkIn(r, c); } }
F.sit = function (f, back) { const S = Game.S(), P = Game.P, C = G.Climate; if (ring || calm()) return; inTalk = 0; const key = nightKey(S), first = S.flags.fsNight !== key;
  const kp = kept && kept.f === f ? kept : null; if (kept && !kp) release(); kept = null;
  ring = kp ? Object.assign(kp.r, { atMenu: false }) : { f, ids: [], key, told: 0, come: [], news: [], seats: [], nSeat: 0, atMenu: false };
  G.UI.fade(() => { const W = Game.W(), y = W.heightAt(f.x, f.z) + 1.1; let a0 = Math.atan2(P.x - f.x, P.z - f.z), best = -1;
    if (kp) a0 = ring.a0; else // pick the side with room for Joseph behind him and for the camera across the fire
    for (let k = 0; k < 12; k++) { const a = a0 + k / 12 * Math.PI * 2, sx = Math.sin(a), sz = Math.cos(a); const me = W.ray(f.x + sx, y, f.z + sz, f.x + sx * 3, y, f.z + sz * 3), cam = W.ray(f.x - sx, y, f.z - sz, f.x - sx * 5, y + 1, f.z - sz * 5);
      const cx = f.x - sx * 4.2, cz = f.z - sz * 4.2, roofed = (W.inRoof && W.inRoof(cx, cz, y + 1.2, null) ? 1 : 0) + (inCrown(W, cx, y + 1.3, cz) ? 1.5 : 0) + Math.min(2, treeOnLine(cx, cz, f.x + sx * 1.7, f.z + sz * 1.7)) * 0.8; /* v18.76 nor inside a tree crown (the Shechem oak) */ const wet = W.heightAt(f.x + sx * 1.7, f.z + sz * 1.7) < (W.water ? W.water.level : -99) + 0.25 ? 3 : 0; const sc = Math.min(1, me) + Math.min(1, cam) * 1.4 - roofed * 2 - wet - k * 0.002; if (sc > best) { best = sc; ring.a0 = a; } }
    a0 = ring.a0; P.x = f.x + Math.sin(a0) * 1.7; P.z = f.z + Math.cos(a0) * 1.7; P.face = a0 + Math.PI; P.vx = P.vz = 0; P.emote = { k: 'sitg', t: 0, dur: 1e4 };
    const wl = W.water ? W.water.level : -99, dry = a => { const x = f.x + Math.sin(a) * 1.75, z = f.z + Math.cos(a) * 1.75; return W.heightAt(x, z) > wl + 0.25 && !(W.waterAt && W.waterAt(x, z)) && W.ray(f.x + Math.sin(a), y, f.z + Math.cos(a), x + Math.sin(a) * 0.4, y, z + Math.cos(a) * 0.4) >= 1; };
    if (!kp) ring.seats = [0.95, -0.95, 1.85, -1.85, 2.5, -2.5].map(d => a0 + d).filter(dry);
    if (C) { C.wet = 0; C.warm(300); } if (first) { S.flags.fsNight = key; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(15); }
    let cd = 1 + 4 * Math.max(0.4, Math.min(1, W.ray(f.x - Math.sin(a0), y, f.z - Math.cos(a0), f.x - Math.sin(a0) * 5, y + 1.2, f.z - Math.cos(a0) * 5)) - 0.05), gy = W.heightAt(f.x, f.z);
    { let cy = gy + 1.2 + cd * 0.3, k = 0; const cxx = () => f.x - Math.sin(a0) * cd, czz = () => f.z - Math.cos(a0) * cd; let cr; while ((cr = inCrown(W, cxx(), cy, czz())) && k++ < 8) { if (cd > 1.7) cd = Math.max(1.6, cd - 0.6); else { cy = Math.max(gy + 0.95, cy - 0.4); } } ring.camY = cy; } /* v18.76 under the leaves, never in them */
    Game.cineCam = { x: f.x - Math.sin(a0) * cd, y: ring.camY, z: f.z - Math.cos(a0) * cd, lx: f.x + Math.sin(a0) * 0.5, ly: gy + 0.65, lz: f.z + Math.cos(a0) * 0.5, fov: 1.2 };
    Game.CAM.yaw = P.face; Game.noDlgCam = true; if (!kp) invite(ring, S); }, () => {
    if (back) { menu(); return; } /* back from cooking: straight to the menu */
    const wetNow = C && (C.wet > 0.2 || C.cold), w = G.Weather && G.Weather.rainy() ? '빗소리 사이로 불이 타닥타닥 탑니다.' : !isNight(S) && !wetNow ? rnd(['모닥불 곁에 앉았어요. 장작이 타닥타닥 탑니다.', '불가에 앉으니 마음이 느긋해져요.']) : isNight(S) ? rnd(['밤하늘에 별이 쏟아질 듯합니다. 불꽃이 타닥타닥 튀어 오릅니다.', egypt(S) ? '나일 쪽에서 서늘한 바람이 불어오고, 모닥불이 따뜻하게 일렁입니다.' : '서늘한 밤바람이 불어오고, 모닥불이 따뜻하게 일렁입니다.']) /* v18.76 (no Nile in Canaan) */ : '젖은 옷에서 김이 피어오릅니다. 불기운이 몸을 녹입니다.';
    const intro = [{ n: '', t: w }]; if (first) intro.push({ n: '', t: (wetNow ? '몸이 마르고 따뜻해졌어요' : '몸이 따뜻해졌어요') + ' · 정신력 +15' });
    if (ring.come.length) intro.push({ n: '', t: '불빛을 보고 누군가 이쪽으로 오려는 것 같아요.' });
    G.UI.say(intro, () => menu()); }); };
let inTalk = 0, idleT = 0; /* after a story, back to the talk (not the top menu) */
/* what happened while you were busy (someone sat down), then the choices */
function news(r) { const ls = r.news.splice(0); return ls; }
function menu() { const S = Game.S(), r = ring; if (!r) return; r.atMenu = false;
  if (r.doneQ) { const qid = r.doneQ, L = G.Life, q = (Game.EP().quests || {})[qid]; r.doneQ = null; if (q && L.qOk(S, qid)) { const dl = typeof q.done === 'function' ? q.done(S, Game) : q.done; const ls = news(r).concat(dl.map(l => typeof l === 'string' ? { n: npc('jacob').name, t: l } : l)); G.UI.say(ls, () => { L.complete(qid); setTimeout(menu, 400); }); return; } }
  if (inTalk && r.ids.length) { talkMenu(); return; } /* v18.60 three ways at most: talk (stories in and out, one by one), pray, get up — cooking sits inside 「활동하기」 */
  const ch = [];
  if (r.ids.length) ch.push({ t: '이야기 나누기', then: () => { r.atMenu = false; setTimeout(talkMenu, 30); } });
  else ch.push({ t: '활동하기', then: () => { r.atMenu = false; setTimeout(soloMenu, 30); } });
  ch.push({ t: r.ids.length ? '함께 기도하기' : '기도하기', then: () => { r.atMenu = false; setTimeout(pray, 30); } }); ch.push({ t: '일어나기', then: () => { r.atMenu = false; inTalk = 0; setTimeout(stand, 30); } });
  G.UI.say(news(r).concat([{ n: '', t: r.ids.length ? '무엇을 할까요?' : '홀로 불가에 앉아 있습니다.', choices: ch }]), null); r.atMenu = true; }
/* stories by the fire: two choices at a time, the next one opens after each — always a way back */
let tk = 0;
function talkMenu() { const r = ring; if (!r) return; inTalk = 1; r.atMenu = false; const opts = [{ t: teller() ? '아버지께 옛이야기 청하기' : '옛이야기 들려주기', f: tellPick }].concat(r.ids.filter(id => !quiet(id)).map(id => ({ t: `${Cs() ? Cs().me(id) : npc(id).name}의 이야기 듣기`, f: () => listen(id) })));
  if (G.Hearth) opts.push({ t: '함께 먹을 것 요리하기', f: cook });
  const two = []; for (let k = 0; k < Math.min(2, opts.length); k++) two.push(opts[(tk + k) % opts.length]); tk = (tk + 1) % Math.max(1, opts.length);
  G.UI.say(news(r).concat([{ n: '', t: '무슨 이야기를 할까요?', choices: two.map(o => ({ t: o.t, then: () => { r.atMenu = false; setTimeout(o.f, 30); } })).concat([{ t: '그만 이야기하기', then: () => { r.atMenu = false; inTalk = 0; setTimeout(menu, 30); } }]) }]), null); r.atMenu = true; }
function soloMenu() { const ch = []; if (G.Hearth) ch.push({ t: '요리하기', then: () => setTimeout(cook, 30) }); ch.push({ t: '불을 바라보기', then: () => setTimeout(() => G.UI.say([{ n: '', t: rnd(ALONE) }], menu), 30) }); if (G.Sleep) { const h = Game.S().time % 24, nt = h >= 18.5 || h < 4.5 || !!(G.storyNight && G.storyNight(Game.S())); ch.push({ t: nt ? '불가에서 자기' : '불가에서 눈 붙이기', then: () => setTimeout(() => { stand(true); /* v18.72 get up from the ring first (else the ring stayed taken and no fire could be sat at again) */ const s = Game.S(); if (G.prFireSleep && G.prFireSleep(s)) return; G.Sleep.go('fire'); }, 30) }); } /* v18.67 sleeping by the fire (fair weather only) */ ch.push({ t: '돌아가기', then: () => setTimeout(menu, 30) }); G.UI.say([{ n: '', t: '무엇을 할까요?', choices: ch }], null); }
/* v18.56 who tells the old stories (someone not of the Bible with stories of their own, js/cast.js) */
function teller() { const r = ring; if (!r) return null; for (const id of r.ids) { const cf = castFire(id); if (cf && cf.tell) return id; } return null; }
function tellOf(id, k) { const cf = castFire(id); if (!cf) return null; let t = cf.tell; if (typeof t === 'string') { const c = Cs().of(id); t = c && c.fire && c.fire[t] && c.fire[t].tell; } return t && t[k] || null; }
const era = () => Cs() ? Cs().era() : 'vizier';
/* v18.73 the old stories are told in the Bible's own words (no made-up words of Joseph's) */
const VERSE = { stars: [['그를 이끌고 밖으로 나가 가라사대 하늘을 우러러 뭇별을 셀 수 있나 보라. 또 그에게 이르시되 네 자손이 이와 같으리라.', '창세기 15:5'], ['아브람이 여호와를 믿으니 여호와께서 이를 그의 의로 여기시고', '창세기 15:6']],
  moriah: [['아브라함이 눈을 들어 살펴본즉 한 수양이 뒤에 있는데 뿔이 수풀에 걸렸는지라.', '창세기 22:13'], ['아브라함이 그 땅 이름을 여호와 이레라 하였으므로 오늘날까지 사람들이 이르기를 여호와의 산에서 준비되리라 하더라.', '창세기 22:14']],
  ladder: [['꿈에 본즉 사닥다리가 땅 위에 섰는데 그 꼭대기가 하늘에 닿았고 또 본즉 하나님의 사자가 그 위에서 오르락내리락 하고', '창세기 28:12'], ['내가 너와 함께 있어 네가 어디로 가든지 너를 지키며', '창세기 28:15']],
  jabbok: [['야곱은 홀로 남았더니 어떤 사람이 날이 새도록 야곱과 씨름하다가', '창세기 32:24'], ['네 이름을 다시는 야곱이라 부를 것이 아니요 이스라엘이라 부를 것이니', '창세기 32:28']],
  rainbow: [['내가 내 무지개를 구름 속에 두었나니 이것이 나의 세상과의 언약의 증거니라.', '창세기 9:13']],
  dreams: [['우리가 밭에서 곡식단을 묶더니 내 단은 일어서고 당신들의 단은 내 단을 둘러서서 절하더이다.', '창세기 37:7'], ['해와 달과 열한 별이 내게 절하더이다.', '창세기 37:9']] };
/* how each listener takes the story: their own words first (js/cast.js), then the old defaults · people of the Bible just listen */
function reactOf(id, k) { if (quiet(id)) return []; const n = npc(id), cf = castFire(id); if (cf && cf.react) { const r = cf.react[k] || cf.react['*']; if (r) return r.map(x => typeof x === 'string' ? { n: n.name, t: x } : Object.assign({ n: x.n === '' ? '' : n.name }, x)); }
  if (cf && Cs().kin(id)) return []; /* Joseph's own family with nothing to add just listens */
  const s = STORIES.find(q => q.k === k), p = G.Persona && G.Persona.of && G.Persona.of(id);
  return [{ n: n.name, t: p && p.age === 'kid' ? EGK[k] : p && p.fem ? EGW[k] : s.man }]; }
/* v18.56 Egyptian women and children hear the old stories too (no 「…들어 보오」 from a girl) */
const EGW = { stars: '별만큼 많은 자손이라니… 그런 약속을 해 주는 신도 있군요.', moriah: '아들을 아끼는 신이라니, 마음이 놓여요.', ladder: '어디로 가든 함께해 준다니… 그런 말 한 번 들어 보고 싶네요.', jabbok: '신과 씨름을 하다니, 무서웠겠어요.', rainbow: '나일이 넘칠 때마다 무서웠는데… 그런 약속이 있었군요.', dreams: '그런 길을 걸어오셨군요. 그래서 그렇게 다정하신가 봐요.' };
const EGK = { stars: '별을 다 셀 수 있어요? 나도 세 볼래요!', moriah: '휴… 다행이다! 양이 숨어 있었어요?', ladder: '하늘까지 닿는 사다리요? 나도 올라가 보고 싶다!', jabbok: '밤새 씨름을요? 우와, 힘세다!', rainbow: '하마도 배에 탔어요? 진짜요?', dreams: '꿈이 진짜가 됐어요? 우와!' };
function tellPick() { const S = Game.S(), told = S.flags.told = S.flags.told || {}, tl = teller();
  G.UI.say([{ n: '', t: tl ? `${npc(tl).name}에게 어떤 이야기를 청할까요?` : '어떤 이야기를 들려줄까요?', choices: STORIES.map(s => ({ t: (told[s.k] ? '' : '✦ ') + s.n, then: () => setTimeout(() => tell(s), 30) })).concat([{ t: '다음에', then: () => setTimeout(menu, 30) }]) }], null); }
function tell(s) { const S = Game.S(), r = ring, told = S.flags.told = S.flags.told || {}, B = G.Bond; const tl = teller(), byDad = tl && tellOf(tl, s.k);
  const elder = r.ids.find(id => id === 'jacob'); /* with his father at the fire, they tell it together */
  const lines = byDad ? byDad.map(t => ({ n: npc(tl).name, t })) : [{ n: '', t: elder ? `불가에 둘러앉아 「${s.n}」 이야기를 나누었습니다.` : `요셉이 「${s.n}」 이야기를 들려주었습니다.` }].concat((VERSE[s.k] || []).map(([t, ref]) => ({ n: '', t, ref })));
  for (const id of r.ids) { if (byDad && id === tl) continue; lines.push(...reactOf(id, s.k)); }
  if (byDad) lines.push({ n: '', t: '요셉은 그 이야기를 마음에 새겼습니다.' });
  G.UI.say(lines, () => { const fresh = !byDad && !told[s.k]; if (!byDad) told[s.k] = 1;
    for (const id of r.ids) { const b = B && B.get(id); if (b && b.fire !== r.key) { b.fire = r.key; B.add(id, 4, '모닥불 이야기'); } }
    if (fresh) { G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(8); if (Object.keys(told).length === STORIES.length && !S.flags.storyteller) { S.flags.storyteller = 1; sfx('quest');
      G.UI.featCard && G.UI.featCard('story', { kick: '모닥불 이야기꾼', n: '여섯 이야기를 모두 들려주었어요', ic: 'star', d: '조상들의 하나님 이야기가 애굽 사람들의 불가로 퍼져 나가요. 깨달음 +2' }); Game.insight && Game.insight(2, '모닥불 이야기꾼'); } }
    menu(); }); }
function listen(id) { const n = npc(id), B = G.Bond, cf = castFire(id); const lv = B ? B.level(id).i : 0, pool = talkOf(n), nod = { n: '', t: '요셉이 고개를 끄덕이며 귀 기울였습니다.' }; /* v18.73 Joseph listens (no made-up replies) */
  if (cf && cf.listen) { const ls = [{ n: n.name, t: Cs().next(id, 'fire:' + era(), cf.listen) }, nod];
    G.UI.say(ls, () => { const b = B && B.get(id); if (b && ring && b.fire !== ring.key) { b.fire = ring.key; B.add(id, 4, '불가의 이야기'); } menu(); }); return; }
  const ls = [{ n: n.name, t: rnd(pool) }]; if (lv >= 2 && !FAM.includes(id)) ls.push({ n: n.name, t: rnd(['당신이랑 이렇게 앉아 있으니 오래된 친구 같구려.', '이건 아무한테나 하는 얘기가 아니오. 당신이니까 하는 거요.']) });
  ls.push(nod);
  G.UI.say(ls, () => { const b = B && B.get(id); if (b && ring && b.fire !== ring.key) { b.fire = ring.key; B.add(id, 4, '불가의 이야기'); } menu(); }); }
/* v18.73 the prayer: Joseph prays without made-up words of his (the narration only); people not of the Bible keep their own way of waiting */
function pray() { const S = Game.S(), r = ring, P = Game.P; P.emote = null; P.emote = { k: 'pray', t: 0, dur: 4 }; const ls = [{ n: '', t: '요셉이 눈을 감고 조용히 기도했습니다.' }];
  const others = r.ids.filter(id => !quiet(id));
  for (const id of others) { const cf = castFire(id); if (cf && cf.amen) ls.push({ n: npc(id).name, t: cf.amen }); }
  if (r.ids.some(quiet)) ls.push({ n: '', t: '불가에 앉은 가족도 고개를 숙였습니다.' });
  if (others.length && !others.some(id => castFire(id) && castFire(id).amen)) ls.push({ n: npc(others[0]).name, t: G.Cast && G.Cast.gentile && G.Cast.gentile(npc(others[0])) ? rnd(['(말없이 불을 바라보며 기도가 끝나기를 기다린다)', '…히브리 사람은 그렇게 비는구려. 처음 보오.', '당신의 신은 이름도 형상도 없다지요. 그런데도 듣는다니, 신기한 일이오.']) : rnd(['…아멘.', '(조용히 눈을 감고 함께 기도한다)']) });
  G.UI.say(ls, () => { P.emote = null; P.emote = { k: 'sitg', t: 0, dur: 1e4 }; if (S.flags.fsPray !== r.key) { S.flags.fsPray = r.key; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(20); G.UI.toast('마음이 고요해졌어요 · 정신력 +20'); } menu(); }); }
/* 요리하기: get up quietly, open the cooking sheet; when the dish is done (or the sheet is closed) sit back down by the same fire (the others stay seated) */
function cook() { const r = ring; if (!r) return; const f = r.f; stand(true, true); G.Hearth.open(f); let n = 0;
  const iv = setInterval(() => { const el = $('cookUI'); if (++n > 600) { clearInterval(iv); release(); return; } if ((el && !el.hidden) || calm()) return; clearInterval(iv); if (Math.hypot(Game.P.x - f.x, Game.P.z - f.z) < 4) F.sit(f, true); else release(); }, 300); }
function release() { const k = kept; kept = null; if (!k) return; for (const c of k.r.come) if (c.sat || c.walking) letGo(c); }
function stand(quiet0, keep) { const P = Game.P, r = ring; ring = null; P.emote = null; Game.noDlgCam = false; if (Game.cineCam && !(G.Cine && G.Cine.on)) Game.cineCam = null; if (!r) return; r.atMenu = false;
  if (keep) kept = { f: r.f, r }; else for (const c of r.come) if (c.sat || c.walking) letGo(c); /* everyone gets up and goes back to what they were doing */
  if (!quiet0) G.UI.toast((G.Surv && G.Surv.cold > 0) || isNight(Game.S()) || (G.Climate && G.Climate.wet > 0.2) ? '불기운이 5분 동안 추위를 막아 줘요' : '불가에서 잠시 쉬었어요'); }
F.ring = () => ring; /* (tests) */

// the action by the fire
Game.CTX.push(function (S) { const P = Game.P, C = G.Climate; if (S.step === 'p_wake') return null; /* v18.38 the first goal is Jacob: nothing else on A yet */ if (ring || P.ride || P.swim || P.act || Game.cineOn) return null; const E = Game.EP(); if (!E || E !== EPJ()) return null;
  for (const st of E.stations || []) { if (st.type !== 'fire' || st.oven || st.torchOnly /* v18.58 a cave's torch pillar only lights a torch: nobody sits or rests by it */ || (st.on && !st.on(S, Game))) continue; const d = Math.hypot(st.x - P.x, st.z - P.z); if (d > 3.4) continue;
    return [{ d: /^(fM_|fCave)/.test(st.id || '') ? d : d - 1.2, /* v18.57 at a cave mouth, 「들어가기」 wins unless you stand right at the fire */ label: '모닥불가에 앉기', x: st.x, z: st.z, y: 0.8, key: 'fireside:' + st.id, reach: 1.7, use: () => F.sit(st) }]; }
  return null; });

// ------------------------------------------------------------------ midday thirst
const ASK = ['물… 물 한 모금만…', '아이고, 목이 타네…', '이 땡볕에 물 한 바가지면 살겠는데…', '누가 물 좀 주시오…'];
const GIFT = [['dates', 2, '대추야자'], ['bread', 1, '빵'], ['fig', 2, '무화과'], ['onion', 2, '양파'], [null, 8, '은 8']];
let tT = 0, bT = 0, cd = 40;
F.thirst = function (force) { const S = Game.S(), P = Game.P;
  const ids = near(P.x, P.z, 34).filter(id => !FAM.includes(id) && !kidOf(npc(id)) && Math.hypot(npc(id).x - P.x, npc(id).z - P.z) > (force ? 0 : 6));
  if (!ids.length) return null; const id = rnd(ids), n = npc(id); S.flags.thirst = { id, until: absH(S) + 2.5 }; bT = 0;
  G.UI.toast(`땡볕에 지친 ${n.name}이(가) 물을 찾아요 · 물항아리에 물을 담아 건네 보세요`); sfx('quest', { pitch: 0.8, vol: 0.5 }); return id; };
F.update = function (dt) { const S = Game.S(); if (!S || !S.flags || Game.mode !== 'play' || Game.EP() !== EPJ()) return; arrTick(dt); /* v18.73 people walking over to the fire */
  if (ring && !G.UI.busy() && !(G.Cine && G.Cine.on) && !(G.Opening && G.Opening.on)) { if ((idleT += dt) > 0.6) { idleT = 0; inTalk = 0; menu(); } } else idleT = 0; /* v18.78 still seated but no menu (another line — e.g. after eating from the bag — took the dialog): the menu comes back */
  tT -= dt; if (tT > 0) return; tT = 1;
  if (!S.flags.vfires && egypt(S)) seedFires(S);
  if (S.flags.vfires && !S.flags.vfire4) { S.flags.vfire4 = 1; S.flags.vfire3 = 1; S.flags.vfire2 = 1; refitFires(S); } /* v18.52 once more: the Nile ford's fire leaves the landing */
  if (S.flags.vfires && !S.flags.vfire2 && G.Build && G.Build.relocate) { S.flags.vfire2 = 1; const b = (S.bld || []).find(q => q.pre && q.name === '왕의 도성 모닥불' && Math.hypot(q.x + 22, q.z + 71) < 12); if (b) G.Build.relocate(b.id, -30, -80); } // v18.14 the city fire leaves the market aisle
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
