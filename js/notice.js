/* 약속의 길 — 마을 알림판 (v18.54)
   애굽 사람들은 왕의 명령이나 알릴 일을 돌기둥에 새기거나, 석회를 바른 판·담벼락에 먹으로 써서 내걸었어요.
   그 느낌으로, 애굽의 다섯 마을(왕의 도성 · 서쪽 마을 · 남쪽 마을 · 피라미드 일꾼 마을 · 갈대 어촌)의 길가에 알림판을 세웠어요.
   요셉이 총리가 된 뒤(5장 「순찰」부터) 읽을 수 있어요.
   · 부탁: 그 마을 사람의 부탁 하나 (마을 사람과 말해서 받는 부탁과 같아요 · 하루에 하나).
   · 현상금: 수배된 사람을 찾아 「왕의 옥」 문 앞으로 데려가면 은을 받아요. 가서 사정을 들으면, 빚을 대신 갚아 주고 풀어 줄 수도 있어요
     (요셉도 억울하게 옥에 갇혔던 사람이에요 · 창 39:20). 한 번에 하나, 마치면 이틀 뒤 새 수배가 붙어요.
     간수장의 「옥에 가둘 자」 부탁이 열려 있으면 그것도 알려 줘요.
   · 소식: 아직 모르는 장소 둘을 알려 줘요(지도에 「들은 곳 ?」으로 표시 · js/mapfog.js). 다 알면 마을 소문을 들려줘요. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, EP = G.EP && G.EP.joseph; if (!Game || !UI || !EP || !G.Life) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), rnd = a => a[Math.floor(Math.random() * a.length)];
const after = k => { const s = S(), o = Game.stepOrder(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const can = () => after('c5_patrol');
const say = (l, cb) => UI.say(l, cb), T = t => ({ n: '', t }), J = (t, e) => ({ n: '요셉', t, e });
const NB = G.Notice = { boards: [] };
const VIL = ['city', 'west', 'south', 'pyr', 'fish'];
const fl = () => { const s = S(); return s.flags.nb || (s.flags.nb = { req: {}, info: {} }); };

// ------------------------------------------------------------------ the boards: by the road at the edge of each village
function spot(W, v) { const rd = EP.roadD; if (!rd) return null; let best = null;
  for (let r = 7; r <= (v.r || 20) + 6; r += 1.5) for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2 + r, x = v.x + Math.sin(a) * r, z = v.z + Math.cos(a) * r, d = rd(x, z);
    if (d < 3 || d > 6.5 || Game.solidAt(x, z, 1.8) || (W.water && W.heightAt(x, z) < W.water.level + 0.6) || (W.slopeAt && W.slopeAt(x, z) > 0.3)) continue;
    const e = 0.8, gx = rd(x + e, z) - rd(x - e, z), gz = rd(x, z + e) - rd(x, z - e); best = { x, z, ry: Math.atan2(-gx, -gz) }; return best; } /* the face looks at the road */
  /* no road close by (a village off the wagon roads): an open spot in the village, facing its middle */
  for (let r = 5; r <= (v.r || 20); r += 1.5) for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2 + r, x = v.x + Math.sin(a) * r, z = v.z + Math.cos(a) * r;
    if (Game.solidAt(x, z, 2.2) || (W.water && W.heightAt(x, z) < W.water.level + 0.6) || (W.slopeAt && W.slopeAt(x, z) > 0.3)) continue; return { x, z, ry: Math.atan2(v.x - x, v.z - z) }; }
  return best; }
function boardModel(g, M) { const W2 = 1.0;
  for (const s of [-1, 1]) g.cyl(0.07, 0.08, 2.3, 6, { m: M, at: [s * W2, 1.15, 0], c: 0x7a5232 });
  g.box(2.1, 1.25, 0.09, { m: M, at: [0, 1.45, 0], c: 0xe6dcc2, j: 0 }); g.box(2.24, 0.08, 0.14, { m: M, at: [0, 2.1, 0], c: 0x8a6440 }); g.box(2.24, 0.08, 0.14, { m: M, at: [0, 0.8, 0], c: 0x8a6440 });
  g.box(2.5, 0.05, 0.6, { m: M, at: [0, 2.32, 0], rx: 0.18, c: 0xc8a860 }); /* a little reed eave */
  const sheets = [[-0.62, 1.62, 0.04], [0.02, 1.5, -0.06], [0.6, 1.66, 0.05], [-0.3, 1.18, 0.03], [0.42, 1.2, -0.04]];
  for (const side of [1, -1]) sheets.forEach(([x, y, rz], i) => { const zz = side * 0.052; g.box(0.42, 0.5, 0.01, { m: M, at: [x, y, zz], rz, c: i % 2 ? 0xf2e4b8 : 0xeedca8, j: 0 });
    for (let l = 0; l < 4; l++) g.box(0.3 - (l % 2) * 0.08, 0.018, 0.012, { m: M, at: [x - 0.02, y + 0.15 - l * 0.08, zz + side * 0.006], rz, c: l === 0 ? 0xa83a2a : 0x2a2420, j: 0 }); /* a red heading, black lines */
    g.sph(0.03, 5, 4, { m: M, at: [x, y + 0.23, zz + side * 0.01], c: 0x9a2a1a }); }); }
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); NB.boards.length = 0;
  try { for (const id of VIL) { const v = (EP.villages || []).find(q => q.id === id); if (!v) continue; const sp = spot(W, v); if (!sp) continue;
      W.place(boardModel, sp.x, sp.z, { ry: sp.ry, col: { w: 2.3, d: 0.4, h: 2.4 } }); NB.boards.push({ id, v, x: sp.x, z: sp.z, ry: sp.ry }); } } catch (e) { console.error('notice', e); } };

// ------------------------------------------------------------------ reading a board
const nearB = () => { const p = P(); let b = null, bd = 2.8; for (const q of NB.boards) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; b = q; } } return b; };
Game.CTX.push(function (s) { if (!can() || Game.cineOn || UI.busy() || (G.DW && G.DW.on && G.DW.on())) return null; const b = nearB(); if (!b) return null; const p = P(), d = Math.hypot(b.x - p.x, b.z - p.z);
  return [{ d: d - 1.2, label: `알림판 보기 · ${b.v.n || b.v.name}`, x: b.x, z: b.z, y: 2.2, key: 'nb:' + b.id, use: () => readBoard(b) }]; });
function readBoard(b) { const s = S(); (s.flags.nbSeen = s.flags.nbSeen || {})[b.id] = 1; if (G.MapFog) G.MapFog.markName(b.v.n || b.v.name, 'seen', true); sfx('page', { vol: 0.7 }); const ch = [];
  const rq = reqFor(b); if (rq) ch.push({ t: `부탁 · ${rq.d.title}`, then: () => setTimeout(() => say([T(`「${rq.line}」`), T(`— ${rq.d.name}`), { n: '요셉', t: '(어떻게 할까?)', choices: [{ t: '맡겠습니다', then: () => { G.NpcAI.acceptRequest(rq); fl().req[b.id] = s.day; if (G.MapFog) G.MapFog.markName(b.v.n || b.v.name, 'seen', true); UI.toast(`「${rq.d.title}」을 맡았어요 · ${rq.d.name}에게 가져다줘요`); } }, { t: '다음에요' }] }]), 30) });
  const bn = s.flags.bnt; if (bn && bn.st !== 'done') ch.push({ t: `현상금 · ${bn.name} (맡은 일)`, then: () => setTimeout(() => say([T(`「${bn.name} — ${bn.crime}. 붙잡아 왕의 옥 문 앞으로 데려오면 은 ${G.Econ ? G.Econ.boost(bn.reward) : bn.reward}.」`), T(bn.st === 'follow' ? '그 사람이 요셉을 따라오고 있어요. 「왕의 옥」 문 앞으로 가요.' : '나침반이 그 사람을 마지막으로 본 곳을 가리켜요.')]), 30) });
  else if (!bn || (bn.st === 'done' && s.day >= (bn.next || 0))) ch.push({ t: '현상금 · 새 수배', then: () => setTimeout(() => offerBounty(b), 30) });
  const cul = jailOpen(); if (cul) ch.push({ t: `수배 · ${cul} (간수장)`, then: () => setTimeout(() => { if (G.MapFog) G.MapFog.markName('왕의 옥', 'heard'); say([T(`「${cul}을(를) 찾는다. 본 사람은 왕의 옥 간수장에게 알릴 것.」`), J('간수장에게 가 보면 자세히 알 수 있겠구나.')]); }, 30) });
  ch.push({ t: '소식', then: () => setTimeout(() => news(b), 30) }, { t: '그만 보기' });
  say([{ n: '', t: `${b.v.n || b.v.name} 알림판 · 석회를 바른 판에 파피루스가 여러 장 붙어 있어요.`, choices: ch }]); }
/* a request from someone of this village (one a day per board) */
function reqFor(b) { const s = S(), AI = G.NpcAI; if (!AI || !AI.makeRequest || fl().req[b.id] === s.day) return null; const v = b.v;
  const ns = Object.values(Game.ENT.npcs).filter(n => n && n.vis && n.d && n.d.folk && Math.hypot(n.x - v.x, n.z - v.z) < (v.r || 20) + 12);
  for (let i = 0; i < 4 && ns.length; i++) { const n = ns.splice(Math.floor(Math.random() * ns.length), 1)[0]; const rq = AI.makeRequest(n, s); if (rq) return rq; } return null; }
const jailOpen = () => { const s = S(), L = G.Life; if (!L || !L.avail) return null; for (const [q, n] of [['x_jail1', '빵 도둑 메르'], ['x_jail2', '자루 도둑 세베크'], ['x_jail3', '가짜 저울 상인 카']]) { try { if (L.avail(s, q)) return n; } catch (e) { } } return null; };
/* news: two places not yet known, or a rumour */
const HINT = [[/굴/, ' — 깊은 굴이 있음. 들어갈 때는 횃불을 챙길 것.'], [/가는 배/, ' — 먼 나라로 가는 배가 뜸.'], [/나루/, ' — 배가 드나드는 나루.'], [/가는 대상|대상/, ' — 먼 땅으로 가는 대상이 쉬어 가는 곳.'], [/마을|어촌|장터/, ' — 장날 안내.'], [/궁|신전|도성|곳간|옥/, ' — 왕의 알림.'], [/피라미드/, ' — 가는 길 안내.'], [/./, ' — 다녀온 사람의 이야기.']];
function news(b) { const s = S(), MF = G.MapFog, k = (s.flags.mapKnown || {}); const pl = (EP.places || []).filter(p => { try { return (!p.when || p.when(s)) && !k[p.n]; } catch (e) { return false; } }).sort((p, q) => Math.hypot(p.x - b.x, p.z - b.z) - Math.hypot(q.x - b.x, q.z - b.z)).slice(0, 2);
  if (pl.length && MF) { const ls = pl.map(p => T(`「${p.n}${(HINT.find(h => h[0].test(p.n)) || HINT[HINT.length - 1])[1]}」`)); say(ls.concat([J('지도에 적어 두자.')]), () => { for (const p of pl) MF.mark(p, 'heard'); }); return; }
  const AI = G.NpcAI, r = AI && AI.rumor ? AI.rumor(s, { name: '', d: {} }) : '오늘은 새 소식이 없어요.'; say([T(`「${r}」`)]); }

// ------------------------------------------------------------------ bounties
const NAMES = ['파네브', '메네스', '후이', '카엠', '아피', '바크', '네시', '이피'], CRIMES = [['곳간에서 보리 한 자루를 가져간 자', 'grain'], ['장터에서 빵 바구니를 집어 달아난 자', 'bread'], ['빚을 갚지 못해 갇혔다가 옥에서 달아난 자', 'debt'], ['남의 양 두 마리를 몰고 간 자', 'sheep']];
const GATE = () => { const p = (EP.places || []).find(q => q.n === '왕의 옥'); return p ? [p.x, p.z] : [-30, 2]; };
function hideSpot(b) { const W = Game.W(), rd = EP.roadD; for (let i = 0; i < 60; i++) { const a = Math.random() * 6.283, r = 45 + Math.random() * 50, x = b.x + Math.sin(a) * r, z = b.z + Math.cos(a) * r;
    if (Math.abs(x) > 200 || Math.abs(z) > 200 || x > 120) continue; if (W.water && W.heightAt(x, z) < W.water.level + 0.8) continue; if (Game.solidAt(x, z, 2) || (rd && rd(x, z) < 8) || (W.slopeAt && W.slopeAt(x, z) > 0.35)) continue;
    if ((EP.villages || []).some(v => Math.hypot(v.x - x, v.z - z) < (v.r || 20) + 8) || (EP.places || []).some(p => Math.hypot(p.x - x, p.z - z) < 18)) continue; return [x, z]; } return null; }
function offerBounty(b) { const s = S(), at = hideSpot(b); if (!at) { say([T('오늘은 새 수배가 없어요.')]); return; } const [cr, kind] = rnd(CRIMES), nm = rnd(NAMES);
  const bn = { name: '수배자 ' + nm, crime: cr, kind, x: at[0], z: at[1], reward: 28 + Math.floor(Math.random() * 18), debt: 14 + Math.floor(Math.random() * 14), st: 'post', from: b.id };
  say([T(`「${bn.name} — ${cr}. 붙잡아 왕의 옥 문 앞으로 데려오면 은 ${G.Econ ? G.Econ.boost(bn.reward) : bn.reward}을 준다. — 시위대장의 관아」`), T(`아래에 누군가 작게 적어 두었어요. 「${dirOf(b, at)} 들판에서 봤음」`), { n: '요셉', t: '(어떻게 할까?)', choices: [{ t: '현상금을 맡겠습니다', then: () => { s.flags.bnt = bn; s.wp = { x: at[0] + (Math.random() - 0.5) * 16, z: at[1] + (Math.random() - 0.5) * 16, n: '수배자를 본 곳' }; spawnFug(); UI.toast('나침반이 수배자를 본 곳을 가리켜요'); sfx('quest', { pitch: 0.9, vol: 0.7 }); } }, { t: '다음에요' }] }]); }
const dirOf = (b, at) => { const a = Math.atan2(at[0] - b.x, at[1] - b.z), d = ['남쪽', '남동쪽', '동쪽', '북동쪽', '북쪽', '북서쪽', '서쪽', '남서쪽'][((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8]; return (b.v.n || b.v.name) + ' ' + d; };
const FUG = 'bnFug';
function spawnFug() { const s = S(), bn = s.flags.bnt; if (!bn || bn.st === 'done' || Game.npc(FUG)) return; const lk0 = ((EP.npcs || []).find(n => n.id === 'culMer') || {}).look || { skin: 0xb07848, top: 0x8a7a5a };
  const p = P(), fol = bn.st === 'follow', x = fol ? p.x - 1.5 : bn.x, z = fol ? p.z - 1.5 : bn.z;
  const n = Game.spawnNPC({ id: FUG, name: bn.name, look: Object.assign({}, lk0, { top: 0x7a6a50 }), x, z, face: Math.random() * 6, talkR: 2.6, noBond: true, wander: fol ? null : 3 }); if (n && fol) Game.npcFollow(FUG, true); }
const WHY = { grain: ['…흉년에 아이들이 사흘을 굶었소. 곳간 앞에 쌓인 자루를 보니 손이 먼저 나갔소.', '…보리 값은 은 {d}이오. 그만한 돈이 있었으면 훔치지 않았지.'], bread: ['…아침부터 아무것도 못 먹은 어미가 집에 누워 있소.', '…빵 값은 은 {d}. 장사꾼에게 갚으면 고발을 거두겠다 했다는데.'],
  debt: ['…곡식 꾼 값을 못 갚아 갇혔소. 옥에 있으면 갚을 길이 더 없지 않소.', '…남은 빚이 은 {d}이오.'], sheep: ['…내 양이 먼저 그 집 마당에서 죽었소. 그 값을 받으려고 데려온 것인데, 그렇게 말해도 아무도 듣지 않았소.', '…두 집이 은 {d}으로 셈을 끝내면 될 일이었소.'] };
const famine = () => after('c6_open');
const lt0 = G.Life.talk; G.Life.talk = function (id) { if (id !== FUG) return lt0.apply(this, arguments); const s = S(), bn = s.flags.bnt, n = Game.npc(FUG), fin = () => { if (n) n.talking = false; }; if (!bn) { fin(); return true; }
  if (bn.st === 'follow') { say([{ n: bn.name, t: '…압니다. 따라가겠소.', e: 'sad' }], fin); return true; }
  const w = (WHY[bn.kind] || WHY.debt).map(t => t.replace('{d}', bn.debt)); if (bn.kind === 'grain' && !famine()) w[0] = '…밭이 물에 잠겨 한 해 농사를 다 잃었소. 곳간 앞에 쌓인 자루를 보니 손이 먼저 나갔소.'; bn.st = 'found';
  const ok = (s.silver || 0) >= bn.debt;
  say([{ n: bn.name, t: '(요셉을 보고 주저앉으며) …총리님이시군요. 도망칠 힘도 없소.', e: 'fear' }, { n: bn.name, t: w[0], e: 'sad' }, { n: bn.name, t: w[1], e: 'sad' },
    { n: '요셉', t: '(어떻게 할까?)', choices: [{ t: '「함께 옥으로 갑시다.」', then: () => { bn.st = 'follow'; Game.npcFollow(FUG, true); if (n) n.wander = null; const g = GATE(); s.wp = { x: g[0], z: g[1], n: '왕의 옥 문 앞' }; if (G.MapFog) G.MapFog.markName('왕의 옥', 'heard'); setTimeout(() => say([{ n: bn.name, t: '…알겠소.', e: 'sad' }], fin), 30); } }]
      .concat(ok ? [{ t: `「그 값은 내가 갚겠소.」 (은 ${bn.debt})`, then: () => { Game.silver(-bn.debt); setTimeout(() => say([{ n: bn.name, t: '…예? 총리님께서요?', e: 'awe' }, J('나도 억울하게 옥에 갇혀 본 사람이오. 가서 그 값을 갚았다고 전하시오. 그리고 다시는 이런 일로 숨지 마시오.', 'tender'), { n: bn.name, t: '이 은혜를… 평생 잊지 않겠습니다.', e: 'cry' }], () => { closeBounty(true); fin(); }), 30); } }] : [{ t: `(빚을 대신 갚으려면 은 ${bn.debt}이 있어야 해요)`, then: () => setTimeout(fin, 10) }])
      .concat([{ t: '「조금 생각해 보겠소.」', then: () => setTimeout(fin, 10) }]) }]); return true; };
function closeBounty(mercy) { const s = S(), bn = s.flags.bnt; if (!bn) return; const n = Game.npc(FUG);
  if (mercy) { const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 25); if (G.Deeds && G.Deeds.rec) try { G.Deeds.rec('share', n); } catch (e) { } if (Game.insight) setTimeout(() => Game.insight(1, '자비'), 600); if (UI.pop) UI.pop('수배가 풀렸어요', `${bn.name}의 빚을 갚아 주었어요 · 정신력 +25`, 'heart'); if (n) { Game.npcFollow(FUG, false); Game.npcWalk(FUG, n.x + 30, n.z + 30, () => Game.removeNPC(FUG), 2.4); } }
  else { Game.silver(bn.reward); if (UI.pop) UI.pop('현상금을 받았어요', `${bn.name}을(를) 옥에 넘겼어요 · 은 ${bn.reward}`, 'coin'); sfx('coins'); if (n) Game.removeNPC(FUG); }
  bn.st = 'done'; bn.next = s.day + 2; if (s.wp && /수배자|왕의 옥 문/.test(s.wp.n || '')) s.wp = null; UI.hud && UI.hud(); }
Game.CTX.push(function (s) { const bn = s.flags && s.flags.bnt; if (!bn || bn.st !== 'follow' || UI.busy() || Game.cineOn) return null; const g = GATE(), p = P(), n = Game.npc(FUG), d = Math.hypot(g[0] - p.x, g[1] - p.z);
  if (d > 10 || !n || Math.hypot(n.x - p.x, n.z - p.z) > 8) return null; return [{ d: d - 3, label: `옥문지기에게 넘기기 · ${bn.name}`, x: g[0], z: g[1], y: 1.6, key: 'bnGate', use: () => UI.fade(() => { Game.npcFollow(FUG, false); }, () => closeBounty(false)) }]; });
/* nearing the place he was seen: the compass finds him */
let tk = 0;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; tk -= (typeof dt === 'number' && dt < 1 ? dt : 1 / 60); if (tk > 0 || Game.mode !== 'play') return r; tk = 0.5;
  try { const s = S(), bn = s.flags && s.flags.bnt; if (bn && bn.st !== 'done') { if (!Game.npc(FUG) && !(G.DW && G.DW.on && G.DW.on())) spawnFug(); const n = Game.npc(FUG), p = P();
      if (n && bn.st === 'post' && Math.hypot(n.x - p.x, n.z - p.z) < 24 && !bn.seen) { bn.seen = 1; s.wp = { x: n.x, z: n.z, n: bn.name }; UI.toast(`${bn.name}${(c => c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '이' : '가')(bn.name.charCodeAt(bn.name.length - 1))} 보여요! 다가가 말을 걸어요`); } } } catch (e) { console.error('notice', e); } return r; };
// ------------------------------------------------------------------ v18.55 a board once read stays on the big map; and how much of the land Joseph knows
{ const mx0 = UI.mapExtra; UI.mapExtra = function (c, sx, sz, k, w, h) { if (mx0) try { mx0.apply(this, arguments); } catch (e) { }
  const s = S(), seen = (s && s.flags && s.flags.nbSeen) || {}; for (const b of NB.boards) { if (!seen[b.id]) continue; const x = sx(b.x), y = sz(b.z); c.fillStyle = '#e6dcc2'; c.strokeStyle = '#5a3a1a'; c.lineWidth = 1.5; c.fillRect(x - 5, y - 4, 10, 8); c.strokeRect(x - 5, y - 4, 10, 8); c.fillStyle = '#a83a2a'; c.fillRect(x - 3, y - 2, 6, 1.5); }
  if (s && s.flags && G.MapFog) { let a = 0, n = 0; for (const p of EP.places || []) { try { if (p.when && !p.when(s)) continue; } catch (e) { continue; } n++; if (G.MapFog.state(p, s) === 'seen') a++; }
    c.save(); c.textAlign = 'left'; c.font = '700 12px "IBM Plex Sans KR",sans-serif'; const t = `가 본 곳 ${a} / ${n}`; c.fillStyle = 'rgba(9,16,34,.75)'; c.fillRect(10, 10, c.measureText(t).width + 16, 22); c.fillStyle = '#ffe9b0'; c.fillText(t, 18, 25); c.restore(); } }; }
})(window.G);
