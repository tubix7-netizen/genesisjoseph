/* 약속의 길 — v18.35 잠은 집에서.
   이야기 인물(persona 일과)을 밤이 되면 자기 잠자리로 보내고 아침이면 일터로 돌려보냅니다.
   · hide: 문 앞까지 걸어가 안으로 들어가요(보이지 않음). 침실·집·장막.
   · bed : 그 자리(종들의 숙소, 텐트, 모닥불 곁, 감방)에 누워 자요. 깨울 수 있어요.
   · 퀘스트에 필요한 사람은 persona.js가 재우지 않아요(Game.questNeeds).
   · 집이 멀면 G.Camps가 자기 캠프(텐트 + 모닥불)를 마련해 줘요. */
'use strict';
(function (G) {
const Game = G.Game; const NT = G.Night = {};
const QUARTERS = [[-47.6, 46], [-47.6, 52.8], [-45.4, 58.4], [-45.4, 46], [-45.4, 49.4], [-45.4, 52.8], [-45.4, 56.2], [-47.6, 59.2]];
const TABLE = NT.TABLE = {
  // 보디발 부부: 안채 침실 (문 앞에서 들어가요)
  potiphar: { kind: 'hide', at: [-30.5, 34.4] }, wife: { kind: 'hide', at: [-31.5, 34.4] },
  // 보디발 집 종들: 종들의 숙소 짚자리
  ameni: { kind: 'bed', at: QUARTERS[0], f: 0 }, neb: { kind: 'bed', at: QUARTERS[1], f: 0 }, cook: { kind: 'bed', at: QUARTERS[2], f: 0 }, gardener: { kind: 'bed', at: QUARTERS[3], f: 0 },
  cowboy: { kind: 'bed', at: QUARTERS[4], f: 0 }, weaver: { kind: 'bed', at: QUARTERS[5], f: 0 }, scribe: { kind: 'bed', at: QUARTERS[6], f: 0 }, maid: { kind: 'bed', at: QUARTERS[7], f: 0 },
  // 헤브론: 야곱의 장막
  jacob: { kind: 'hide', at: [170, 150] }, leah: { kind: 'hide', at: [170, 150] }, dinah: { kind: 'hide', at: [170, 150] }, benjamin: { kind: 'hide', at: [170, 150] }, hServ: { kind: 'hide', at: [183, 160] }, shepBoy: { camp: 1 },
  // 옥: 간수장은 자기 집, 죄수는 감방에서
  keeper: { kind: 'hide', at: [-20, 5.6] }, prisA: { kind: 'bed' }, prisB: { kind: 'bed' }, oldP: { kind: 'bed' }, youngP: { kind: 'bed' }, cupbearer: { kind: 'bed' }, baker: { kind: 'bed' }, prisD: { kind: 'bed' }, nebka: { kind: 'bed' },
  // 궁: 안쪽 문으로
  pharaoh: { kind: 'bed', at: [-30, -205.6], f: Math.PI, path: true }, magician: { kind: 'hide', at: [-36, -179] }, sage: { kind: 'hide', at: [-24, -179] }, cupbearerC: { kind: 'hide', at: [-24, -179] },
  // 총리의 집
  asenath: { door: 'jhouse' }, manasseh: { door: 'jhouse' }, ephraim: { door: 'jhouse' }, steward2: { door: 'jhouse' },
  // 옥 마당 문지기는 간수장 집 곁에서, 형들은 도단 들판 천막 곁에서, 기인은 자기 동굴에서
  grdSeti: { kind: 'hide', at: [-20, 5.6] }, grdPaneb: { kind: 'hide', at: [-20, 5.6] }, benjamin2: { kind: 'hide', at: [170, 150] }, kiin: { kind: 'bed' },
  reuben: { kind: 'bed' }, simeon: { kind: 'bed' }, levi: { kind: 'bed' }, judah: { kind: 'bed' }, dan: { kind: 'bed' }, naphtali: { kind: 'bed' }, gad: { kind: 'bed' }, asher: { kind: 'bed' }, issachar: { kind: 'bed' }, zebulun: { kind: 'bed' },
  // 집이 먼 사람들: 자기 캠프
  hunterE: { camp: 1 }, culKa: { camp: 1 }, egElon: { camp: 1 }, nmNeb: { camp: 1 }, cvBoy: { camp: 1 }, stKeeper: { kind: 'bed' }, patrolKeeper: { camp: 1 },
};
for (const id of ['byElder', 'byCedar', 'bySail', 'byFish', 'byWood', 'byDye', 'byKid', 'byGuard', 'egElon']) TABLE[id] = { kind: 'hide', at: null, here: true }; /* v18.52 egElon: sleeps aboard his ship */
const hasDoorIn = id => { const v = G.Homes && G.Homes.allV().find(q => q.id === id); return v ? G.Homes.door(v, 0) : null; };
function nearestDoor(x, z, r) { const Ho = G.Homes; if (!Ho) return null; const S = Game.S(); let b = null, bd = r; for (const v of Ho.allV()) { if (v.when && !v.when(S)) continue; if (Math.hypot(v.x - x, v.z - z) > (v.r || 20) + r) continue; (v.homes || []).forEach((h, i) => { const d = Ho.door(v, i); if (!d) return; const k = Math.hypot(d.fx - x, d.fz - z); if (k < bd) { bd = k; b = d; } }); } return b; }
NT.nearestDoor = nearestDoor;
function homeFor(id, n) { const t = TABLE[id]; const x = n.d.x === undefined ? n.x : n.d.x, z = n.d.z === undefined ? n.z : n.d.z;
  if (t && t.kind === 'bed' && !t.at) return { kind: 'bed', at: [n.x, n.z], f: n.homeFace || 0, stay: true };
  if (t && t.here) return { kind: 'hide', at: [n.x, n.z], stay: true, noPop: true }; if (t && t.at) return t; if (t && t.door) { const d = hasDoorIn(t.door); if (d) return { kind: 'hide', at: [d.fx, d.fz] }; }
  if (!(t && t.camp)) { const d = nearestDoor(x, z, 26); if (d) return { kind: 'hide', at: [d.fx, d.fz] }; }
  const c = G.Camps && G.Camps.forNpc(id, x, z); if (c) return { kind: 'bed', at: [c.ex, c.ez], bed: [c.bx, c.bz], f: c.bf };
  return { kind: 'bed', at: [n.x, n.z], f: n.homeFace || 0, stay: true }; }
NT.homeFor = homeFor;
const far = n => !n.near || Game.dist(n.x, n.z) > 55;
function arrive(n, id) { const b = n._nh; if (!b) return; b.st = 'in'; n.walk = null; n.act = null; n._ract = null; if (b.H.kind === 'hide') { Game.npcTo(id, b.H.at[0], b.H.at[1], b.H.f || 0, false); n.schedHidden = true; n.sleep = false; n._psleep = false; } else if (b.H.bed && n.near) { /* a tent: kneel at the flap, crawl in, lie down (never walking through the cloth) */ n.act = 'sitg'; n.face = b.H.f + Math.PI; b.tent = 1; setTimeout(() => { if (n._nh !== b) return; b.tent = 0; n.act = null; Game.npcTo(id, b.H.bed[0], b.H.bed[1], b.H.f, false); n.sleep = true; n._psleep = true; }, 1100); } else { const q = b.H.bed || b.H.at; Game.npcTo(id, q[0], q[1], b.H.f || 0, false); n.face = n.homeFace = b.H.f || 0; n.sleep = true; n._psleep = true; } }
NT.go = function (n, id) { const H = homeFor(id, n); if (!H || (H.noPop && Game.dist(n.x, n.z) < 24)) return false; n._nh = { H, ox: n.x, oz: n.z, of: n.homeFace === undefined ? n.face : n.homeFace, sit: !!n.sit, wander: n.wander || null, st: 'go' };
  n.sit = false; n.noSit = true; n.act = null; n._ract = null; n.wander = null; n.emote = null; n.seatY0 = n.seatY || 0; n.seatY = 0;
  if (H.stay || far(n)) { arrive(n, id); return true; } const np = Game.S().npcPos, op = np && np[id]; Game.npcWalk(id, H.at[0], H.at[1], () => arrive(n, id), n.d.walkSp || 1.6, H.path && G.EP.joseph.palacePath ? G.EP.joseph.palacePath : G.NpcAI && G.NpcAI.pathTo && G.NpcAI.blocked(n.x, n.z, H.at[0], H.at[1]) ? G.NpcAI.pathTo(n.x, n.z, H.at[0], H.at[1]) : null); if (np) { if (op) np[id] = op; else delete np[id]; } /* v18.37 a bedtime walk is not a new home: after a reload they would start the day at their bed */ return true; };
NT.tick = function (n, id, awake) { const b = n._nh; if (!b) return; if (b.st === 'go') { if (!n.walk) arrive(n, id); return; }
  if (b.tent) return; if (b.H.kind === 'bed') { if (awake) { if (n.sleep) { n.sleep = false; n._psleep = false; } return; } if (!n.sleep && !n.talking) { n.sleep = true; n._psleep = true; n.face = n.homeFace = b.H.f || 0; } const P = Game.P; if (n.vis && Math.hypot(P.x - n.x, P.z - n.z) < 7 && Math.random() < 0.12) G.Life && G.Life.bubble && G.Life.bubble(id, 'Zzz…', 2.4); } };
NT.release = function (n, id, morning) { const b = n._nh; if (!b) return; n._nh = null; n.schedHidden = false; if (n._psleep) { n.sleep = false; n._psleep = false; } n.seatY = n.seatY0 || 0; if (b.st === 'go') n.walk = null;
  const home = () => { if (Math.hypot(n.x - b.ox, n.z - b.oz) > 1.5) Game.npcTo(id, b.ox, b.oz, b.of, false); /* (walked into something on the way: back at the post all the same) */ n.noSit = false; /* v18.37 cleared only here: nobody glides home sitting down */ n.face = n.homeFace = b.of; n.sit = b.sit; n.wander = b.wander; };
  if (b.H.bed) { Game.npcTo(id, b.H.at[0], b.H.at[1], b.of, false); } if (!morning || far(n) || b.H.stay) { Game.npcTo(id, b.ox, b.oz, b.of, false); home(); return; } n.emote = { k: 'stretch', t: 0, dur: 2, amb: true }; Game.npcWalk(id, b.ox, b.oz, home, n.d.walkSp || 1.6, G.NpcAI && G.NpcAI.pathTo && G.NpcAI.blocked(n.x, n.z, b.ox, b.oz) ? G.NpcAI.pathTo(n.x, n.z, b.ox, b.oz) : null); };
/* 마을 사람이 집에 들어갔다가 퀘스트로 다시 나올 때: 자기 집 문 앞 */
NT.doorOfFolk = function (n) { const f = n.d.folk, v = n.d.village; if (!f || !v || !G.Homes) return null; const d = G.Homes.door(v, f.home || 0); return d ? [d.fx, d.fz, d.a] : null; };
})(window.G);
