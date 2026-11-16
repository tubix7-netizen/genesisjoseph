/* 약속의 길 — v18.65 살아 있는 마을 (livelife.js · persona.js · npcai.js 뒤)
   마을 사람들(EP.villages의 folk)의 하루에 「까닭」을 줘요. 요셉이 보지 않아도 마을이 제 할 일로 돌아가요.
   · 장터: 장사꾼과 그날 볼일(사고팔기 · 심부름)이 있는 사람만 와요(하루에 열에 셋쯤). 나머지는 우물에서 물 마시기 · 나무 그늘에서 쉬기 ·
     자기 집 문간에 앉기 · 마을 어귀 한 바퀴로 흩어져요.
   · 몸의 필요: 밖에서 일하는 사람은 오전에 우물에 들러 물을 마시고 다시 일하러 가요. 한낮 더위(12시 반~1시 반쯤)에는 나무 그늘에서 쉬었다 가요.
     추운 밤엔 모닥불 곁(npcai), 비가 오면 지붕 아래(공공 건물 · 처마 · 큰 나무)나 집으로 가요.
   · 가까이 가면 왜 거기 있는지 말풍선으로 들려주고(「목 좀 축이고 가야지」), 말을 걸면 지금 하는 일부터 말해요.
   · 길손(5장 풍년 뒤부터): 마을과 마을 사이 큰길을 걷거나 나귀 · 말을 타고 오가는 사람들. 가까이 오면 손을 들어 인사하고,
     말을 걸면 「인사하기」로 축복을 주고받거나 어디서 와서 어디로 가는지 들어요. 흉년에는 가나안에서 곡식을 사러 온 사람들도 지나가요(창 41:57).
   API: G.Live.why(n) 지금 그 사람이 하는 일의 까닭 · G.Live.trav 지금 길 위의 길손 */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!Game || !EP || !AI || !AI.plan) return;
const S = () => Game.S(), P = () => Game.P, PI = Math.PI;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const ord = () => Game.stepOrder(), after = k => { const s = S(); return !!s && ord().indexOf(s.step) >= ord().indexOf(k); };
const Lv = G.Live = { trav: [] };
const OUTJOB = new Set(['farmer', 'water', 'potter', 'weaver', 'shepherd', 'hunter', 'watch']);

// ------------------------------------------------------------------ shade: the big trees round each village (and the public halls, buildings.js)
const SHADE = new Map();
function shadeOf(v) { const W = Game.W(); if (!W) return []; const c = SHADE.get(v.id); if (c && c.W === W) return c.list; const list = [];
  for (const n of W.nodes || []) { const T = Game.NODE && Game.NODE[n.type]; if (!T || !T.tree) continue; const d = Math.hypot(n.x - v.x, n.z - v.z); if (d > v.r + 16 || d < 4) continue; list.push([n.x, n.z]); }
  for (const s of (v.shadeX || [])) list.push(s); list.sort((a, b) => Math.hypot(a[0] - v.x, a[1] - v.z) - Math.hypot(b[0] - v.x, b[1] - v.z)); const out = list.slice(0, 10); SHADE.set(v.id, { W, list: out }); return out; }
const spot = (v, k) => (v.spots && v.spots[k]) || null;
const around = (p, f, k, r) => { const a = hash(f.id + k) * PI * 2, rr = (r || 1.4) * (0.6 + hash(f.id + k + 'r') * 0.4); return [p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, Math.atan2(-Math.cos(a), -Math.sin(a))]; };
const doorOf = (v, f) => { const Ho = G.Homes, d = Ho && Ho.door && Ho.door(v, f.home || 0); if (d) return [d.fx + Math.sin(d.a) * 0.9, d.fz + Math.cos(d.a) * 0.9, d.a]; const h = v.homes && v.homes[f.home || 0]; return h ? [h[0] + 1.6, h[1] + 1.6, 0] : null; };
const nearMkt = (v, x, z) => { const m = spot(v, 'market'); return !!m && Math.hypot(x - m[0], z - m[1]) < (m[2] || 2.5) + 3.2; };

// ------------------------------------------------------------------ the day, with reasons
const CACHE = new Map();
{ const plan1 = AI.plan; AI.plan = function (v, f, s) { const rows = plan1.apply(this, arguments); if (!rows || !rows.length || !s) return rows;
    const wet = !!(G.Weather && G.Weather.rainy && G.Weather.rainy()), key = s.day + '|' + (wet ? 1 : 0) + '|' + rows.length + '|' + rows[0][0] + '|' + rows[0][1];
    const c = CACHE.get(f.id); if (c && c.k === key && c.v === v) return c.p; let p = rows; try { p = shape(v, f, s, rows, wet); } catch (e) { console.error('livelife', e); }
    if (CACHE.size > 800) CACHE.clear(); CACHE.set(f.id, { k: key, v, p }); return p; }; }
function shape(v, f, s, rows, wet) { const out = rows.map(r => r.slice()), merch = !!f.stall || f.role === 'merchant', well = spot(v, 'well'), sh = shadeOf(v);
  /* 1) the market only with an errand */
  out.forEach((r, i) => { const m = r[4]; if (merch || m === 'hide' || !nearMkt(v, r[1], r[2])) return; const k = hash(f.id + s.day + 'mk' + i), h = r[0];
    if (k < 0.28) { r[5] = 'errand'; return; }
    let q = null, why = null, mode = 'sit';
    if (h >= 11 && h < 15.5 && sh.length) { q = around(sh[Math.floor(hash(f.id + 'sh') * sh.length)], f, 'mk' + i, 1.6); why = 'shade'; }
    else if (k < 0.55 && well) { q = around(well, f, 'wl' + i, (well[2] || 2) + 0.8); why = 'drink'; mode = 'act:drink'; }
    else if (k < 0.8) { q = doorOf(v, f); why = 'door'; }
    else { const a = hash(f.id + s.day + 'st') * PI * 2, rr = v.r * 0.75; q = [v.x + Math.cos(a) * rr, v.z + Math.sin(a) * rr, a + PI]; why = 'stroll'; mode = 'wander:3'; }
    if (q) { r[1] = +q[0].toFixed(2); r[2] = +q[1].toFixed(2); r[3] = +(q[2] || 0).toFixed(2); r[4] = mode; r[5] = why; } });
  /* 2) the body's needs: a drink in the morning, shade at noon (then back to what they were doing) */
  if (!wet && OUTJOB.has(f.role) && f.age !== 'kid') { const add = [];
    const at = h => { let k = out.length - 1; for (let i = 0; i < out.length; i++) if (h >= out[i][0]) k = i; return out[k]; };
    const dh = 9.8 + hash(f.id + s.day + 'dr') * 1.2, r0 = at(dh);
    if (well && r0 && r0[4] !== 'hide' && r0[5] !== 'drink' && Math.hypot(r0[1] - well[0], r0[2] - well[1]) > 6) { const q = around(well, f, 'dk', (well[2] || 2) + 0.6); add.push([+dh.toFixed(2), +q[0].toFixed(2), +q[1].toFixed(2), +q[2].toFixed(2), 'act:drink', 'drink'], [+(dh + 0.4).toFixed(2), r0[1], r0[2], r0[3], r0[4], r0[5]]); }
    const nh = 12.5 + hash(f.id + s.day + 'nn') * 0.6, r1 = at(nh);
    if (sh.length && r1 && r1[4] !== 'hide' && r1[5] !== 'shade' && hash(f.id + s.day + 'nq') < 0.75) { const t = sh[Math.floor(hash(f.id + 'tr') * sh.length)], q = around(t, f, 'nn', 1.5); add.push([+nh.toFixed(2), +q[0].toFixed(2), +q[1].toFixed(2), +q[2].toFixed(2), 'sit', 'shade'], [+(nh + 0.9).toFixed(2), r1[1], r1[2], r1[3], r1[4], r1[5]]); }
    if (add.length) { out.push(...add); out.sort((a, b) => a[0] - b[0]); } }
  /* 3) reasons for the rest (for bubbles and talk) */
  const fire = spot(v, 'fire');
  out.forEach(r => { if (r[5]) return; const m = r[4] || ''; if (m === 'hide') return; if (fire && Math.hypot(r[1] - fire[0], r[2] - fire[1]) < 3.5 && m === 'sit') r[5] = r[0] > 17 || r[0] < 5 ? 'fire' : 'eat'; else if (well && Math.hypot(r[1] - well[0], r[2] - well[1]) < 4) r[5] = 'well'; else if (/^act:/.test(m)) r[5] = 'work'; else if (wet && m === null) r[5] = 'shelter'; });
  return out; }
Lv.why = n => { try { const s = S(), sc = n.d && n.d.sched; if (!sc || n.schedSlot === undefined || n.schedSlot < 0) return null; const list = typeof sc === 'function' ? sc(s, Game) : sc; const r = list && list[n.schedSlot]; return r ? r[5] || null : null; } catch (e) { return null; } };

/* what they say about it */
const BUB = {
  drink: ['아이고 목말라라. 한 모금 마시고 가야지.', '물을 넉넉히 마셔 둬야 한낮을 버티지.', '우물물이 참 시원하구나.', '목 좀 축이고 다시 일하러 가야지.'],
  shade: ['한낮엔 그늘이 최고지.', '해가 머리 위에 있을 땐 잠깐 쉬어 가야지.', '어휴, 더워라. 바람 좀 불었으면.', '잠깐 눈 좀 붙였다 가야겠다.'],
  errand: ['오늘은 장에서 소금을 사야 해.', '항아리 판 값으로 보리를 사 가야지.', '장터에 새 옷감이 들어왔다던데.', '심부름 왔어요. 무화과 한 바구니!', '양파랑 마늘을 사 오라고 하셨어요.'],
  door: ['문간에 앉아 바람 쐬는 게 낙이지.', '저녁 짓기 전에 잠깐 앉아 있자.', '오늘 하루도 무사히 지나가는구나.'],
  stroll: ['다리 좀 풀어야지.', '마을 어귀까지 한 바퀴 돌아볼까.', '저녁 바람이 좋구나.'],
  fire: ['불 곁이 따뜻하네.', '밤바람이 차구나. 불 좀 더 지필까?', '오늘 있었던 이야기나 해 볼까.'],
  eat: ['점심 먹자. 배고파라.', '빵에 양파 한 쪽이면 충분하지.', '든든히 먹어야 오후 일을 하지.'],
  shelter: ['비 그칠 때까지 여기 있자.', '비가 오다니, 별일이야.', '지붕 아래가 제일이지.'],
  well: ['물동이가 무겁구나.', '우물가에 오면 소식을 다 듣지.'] };
const TALK = {
  drink: '물 마시러 왔어요. 이 더위엔 자주 마셔야 쓰러지지 않아요.', shade: '한낮이라 그늘에서 잠깐 쉬는 중이에요. 해가 좀 기울면 다시 일하러 가요.',
  errand: '오늘은 장에 볼일이 있어서 왔어요.', door: '하루 일 마치고 문간에 앉아 쉬는 중이에요.', stroll: '다리 좀 풀려고 마을을 한 바퀴 도는 중이에요.',
  fire: '밤이 차서 불가에 앉아 있어요.', eat: '점심 먹는 중이에요. 같이 드시겠어요?', shelter: '비를 피하는 중이에요. 금방 그치겠지요.' };
Lv.BUB = BUB; Lv.TALK = TALK;
if (G.Greet && G.Greet.lines) { const gl0 = G.Greet.lines; G.Greet.lines = function (n) { const ls = gl0.apply(this, arguments); try { const w = n && n.d && n.d.folk && Lv.why(n), t = w && TALK[w]; if (t && Array.isArray(ls)) return [{ n: n.name, t }].concat(ls.slice(0, 1)); } catch (e) { } return ls; }; }

// ------------------------------------------------------------------ travelers between the villages
const ROUTES = [
  { a: '서쪽 마을', b: '왕의 도성', pts: [[-136, -44], [-112, -58], [-80, -60], [-30, -60], [-22, -64]] },
  { a: '남쪽 마을', b: '장터', pts: [[-142, 124], [-118, 104], [-74, 100], [-12, 100], [-6, 114]] },
  { a: '장터', b: '왕의 도성', pts: [[-6, 114], [-20, 92], [-28, 72], [-28, 26], [-24, -30], [-22, -60]] },
  { a: '고센', b: '장터', pts: [[70, 50], [44, 60], [30, 76], [10, 108], [-4, 114]] },
  { a: '서쪽 나루', b: '서쪽 마을', pts: [[-80, -60], [-112, -58], [-136, -44]] }];
const LOOKS = [{ skin: 0xa86a40, top: 0xe8dcc0, trim: 0x3a6a8a, belt: 0x6a4428, hair: 0x15100c, headwear: 'cloth', clothCol: 0xece2cc, bandCol: 0x3a6a8a },
  { skin: 0x9a6038, top: 0xd8c8a0, trim: 0x8a3a2a, belt: 0x5a3a24, hair: 0x1a1410, hairStyle: 'short', collar: 0x2f8a77 },
  { skin: 0xb07a4e, fem: true, long: true, top: 0xe6dcc6, under: 0xe6dcc6, trim: 0x2f8a77, hair: 0x15100c, hairStyle: 'braid', headwear: 'veil', clothCol: 0xece6d6 },
  { skin: 0xc08a5a, top: 0x8a7a60, trim: 0x4a3a2a, hair: 0x2a1c14, beard: 'short', beardCol: 0x2a1c14, headwear: 'turban', clothCol: 0xb8a888, bandCol: 0x6a3a22, long: true }];
const KINDS = [
  { n: '나귀 탄 장사꾼', mount: 'donkey', pack: 0x8a6a48, look: 0, w: s => 1.2, why: (r, to) => `${to}에 보리 자루를 팔러 가는 길이오.` },
  { n: '말 탄 전령', mount: 'horse', look: 1, sp: 3.4, w: s => 0.6, why: (r, to) => `총리님의 곳간 문서를 ${to}에 전하러 가오. 바쁘지만 인사는 해야지요.` },
  { n: '길 가는 여인', look: 2, sp: 1.4, w: s => 0.9, why: (r, to) => `${to}에 사는 언니 집에 다니러 가요. 아기를 낳았대요!` },
  { n: '지팡이 짚은 순례자', prop: 'staff', look: 3, sp: 1.2, w: s => 0.6, why: (r, to) => `${to}까지 걸어서 가는 길이오. 천천히 가면 해 지기 전엔 닿겠지.` },
  { n: '곡식 사러 온 가나안 사람', mount: 'donkey', pack: 0x9a7a52, look: 3, w: s => after('c6_open') && !after('j_end') ? 2.2 : 0, why: (r, to) => '가나안에 기근이 심해서 애굽 총리에게 곡식을 사러 왔소. 듣자 하니 그분이 백성을 살린다더군.' },
  { n: '고센의 히브리 목자', prop: 'staff', look: 3, sp: 1.5, w: s => s.q && s.q.goshen ? 1.1 : 0, why: (r, to) => `${to}에 양털을 팔러 가요. 우리 할아버지 야곱께서 안부 전하라셨어요.` }];
let travT = 20, trN = 0; const RECENT = [];
const travOn = s => !!s && after('c5_year1') && !Game.cineOn && !(s.q && s.q.finale) && !(G.DW && G.DW.on && G.DW.on()) && !(G.Byblos && G.Byblos.inBy && G.Byblos.inBy());
function spawnTrav(s) { const p = P(); const near = ROUTES.map(r => ({ r, d: Math.min(...r.pts.map(q => Math.hypot(q[0] - p.x, q[1] - p.z))) })).filter(o => o.d < 70).sort((a, b) => a.d - b.d); if (!near.length) return;
  const R = near[Math.floor(Math.random() * Math.min(2, near.length))].r;
  /* start somewhere along the road 30–65 m from him (out of sight, but soon in view), coming his way, and go on to the far end */
  const plan = fwd => { const all = fwd ? R.pts.slice() : R.pts.slice().reverse(), dense = []; for (let i = 0; i < all.length - 1; i++) { const a = all[i], b = all[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / 4)); for (let j = 0; j < k; j++) dense.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]); } dense.push(all[all.length - 1]);
    for (let i = 0; i < dense.length - 3; i++) { const d = Math.hypot(dense[i][0] - p.x, dense[i][1] - p.z); if (d > 30 && d < 65 && Math.hypot(dense[i + 2][0] - p.x, dense[i + 2][1] - p.z) < d) return { fwd, pts: dense.slice(i).filter((q, k, a) => k === 0 || k === a.length - 1 || k % 3 === 0) }; } return null; };
  const f0 = Math.random() < 0.5, pl = plan(f0) || plan(!f0); if (!pl) return; const pts = pl.pts, from = pl.fwd ? R.a : R.b, to = pl.fwd ? R.b : R.a;
  const ws = KINDS.map(k => Math.max(0, k.w(s))); let tot = ws.reduce((a, b) => a + b, 0), r = Math.random() * tot, K = KINDS[0]; for (let i = 0; i < KINDS.length; i++) { r -= ws[i]; if (r <= 0) { K = KINDS[i]; break; } }
  const id = 'lvTr' + (++trN); const n = Game.spawnNPC({ id, name: K.n, look: LOOKS[K.look], x: pts[0][0], z: pts[0][1], face: Math.atan2(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), prop: K.prop, mount: K.mount, pack: K.pack, rider: false, noRide: true, noBond: true, talkR: K.mount ? 3.2 : 2.6, walkSp: K.sp || (K.mount ? 2.6 : 1.5) });
  n.trav = true; const T = { id, K, from, to, R, st: 'go', life: 420, met: false, waved: false };
  Game.npcWalk(id, pts[pts.length - 1][0], pts[pts.length - 1][1], () => { T.st = 'rest'; T.restT = 25 + Math.random() * 30; const m = Game.npc(id); if (m && !K.mount) m.act = 'sitg'; }, K.sp || (K.mount ? 2.6 : 1.5), pts.slice(1, -1));
  Lv.trav.push(T); }
function dropTrav(T) { try { Game.removeNPC(T.id); } catch (e) { } Lv.trav = Lv.trav.filter(x => x !== T); }
Lv.tick = function (dt) { const s = S(); if (!s || Game.mode !== 'play') return; const p = P();
  /* bubbles: why someone is where they are */
  Lv._bt = (Lv._bt || 0) - dt; if (Lv._bt <= 0) { Lv._bt = 0.8; if (!G.UI.busy() && !Game.cineOn) { const ENT = Game.ENT.npcs; let said = 0;
      for (const id in ENT) { const n = ENT[id]; if (said || !n.vis || !n.d.folk || n.walk || n.talking || n.schedHidden) continue; if (Math.hypot(n.x - p.x, n.z - p.z) > 14) continue; const w = Lv.why(n), k = s.day + ':' + n.schedSlot;
        if (!w || !BUB[w] || n._lvSaid === k) continue; n._lvSaid = k; if (Math.random() < 0.55) { const L = BUB[w], i0 = Math.floor(hash(id + k) * L.length); let line = null; for (let j = 0; j < L.length; j++) { const c = L[(i0 + j) % L.length]; if (!RECENT.includes(c)) { line = c; break; } } if (!line) continue; RECENT.push(line); if (RECENT.length > 6) RECENT.shift(); G.Life && G.Life.bubble && G.Life.bubble(id, line, 3); said = 1; } } } } /* (two people side by side never say the same thing) */
  /* travelers */
  const on = travOn(s); if (!on) { for (const T of Lv.trav.slice()) { const n = Game.npc(T.id); if (!n || Math.hypot(n.x - p.x, n.z - p.z) > 40) dropTrav(T); } return; }
  if ((travT -= dt) <= 0) { travT = 35 + Math.random() * 40; if (Lv.trav.length < 3 && !(s.q && s.q.riding)) try { spawnTrav(s); } catch (e) { console.error('livelife trav', e); } }
  for (const T of Lv.trav.slice()) { const n = Game.npc(T.id); if (!n) { dropTrav(T); continue; } T.life -= dt; const d = Math.hypot(n.x - p.x, n.z - p.z);
    if (!T.waved && d < 9 && !n.talking && !G.UI.busy()) { T.waved = true; n.emote = { k: 'wave', t: 0, dur: 1.6, amb: true }; G.Life && G.Life.bubble && G.Life.bubble(T.id, rnd(['평안하시오!', '안녕하시오, 길손!', '좋은 날이오!', '총리님 아니시오? 평안하소서!']), 2.6); }
    if (T.st === 'rest') { T.restT -= dt; if (T.restT <= 0 && !n.talking) { T.st = 'back'; n.act = null; const pts = T.R.pts.slice(); if (Math.hypot(pts[0][0] - n.x, pts[0][1] - n.z) < 5) pts.reverse(); [T.from, T.to] = [T.to, T.from];
        Game.npcWalk(T.id, pts[pts.length - 1][0], pts[pts.length - 1][1], () => { T.st = 'gone'; }, T.K.sp || (T.K.mount ? 2.6 : 1.5), pts.slice(1, -1)); } }
    if ((T.st === 'gone' || T.life <= 0) && !n.talking && d > 30) { dropTrav(T); continue; } if (d > 160) dropTrav(T); } };
/* talking to a traveler: greet (a blessing both ways), ask where to, or go on */
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const T = Lv.trav.find(x => x.id === id); if (!T) return lt0.apply(this, arguments); const n = Game.npc(id), fin = () => { if (n) n.talking = false; }, nm = n ? n.name : T.K.n;
    n.face = Math.atan2(P().x - n.x, P().z - n.z);
    const fem = !!(n.d.look && n.d.look.fem);
    G.UI.say([{ n: nm, t: rnd(fem ? ['평안하세요!', '좋은 날이에요. 어디 가세요?', '아, 안녕하세요. 이 길로 가면 장터가 나오지요?'] : ['평안하시오, 길손!', '아, 마침 잘 만났소. 이 길이 맞소?', '좋은 날이오! 쉬어 가는 중이오?']), choices: [
      { t: '인사하기', then: () => { P().emote = { k: 'bow', t: 0, dur: 1.4 }; n.emote = { k: 'bow', t: 0, dur: 1.4, amb: true }; setTimeout(() => G.UI.say([{ n: '요셉', t: '평안히 가시오. 가는 길에 하나님이 함께하시기를.' }, { n: nm, t: rnd(fem ? ['고마워요! 당신도 평안하세요.', '좋은 하루 되세요!'] : ['고맙소! 총리님 덕에 이 길이 편안하오.', '당신도 평안하시오. 좋은 하루 되시오!', '허허, 인사를 다 받는구려. 기분이 좋소!']) }], fin), 300); } },
      { t: '어디로 가시오?', then: () => setTimeout(() => G.UI.say([{ n: nm, t: `${T.from}에서 오는 길이${fem ? '에요' : '오'}. ` + T.K.why(T, T.to) }], fin), 30) },
      { t: '떠나기', then: fin }] }], null); return true; }; }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; try { Lv.tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('livelife', e); } return r; };
{ const st0 = Game.start; Game.start = function () { for (const T of Lv.trav.slice()) { try { Game.removeNPC(T.id); } catch (e) { } } Lv.trav = []; SHADE.clear(); CACHE.clear(); return st0.apply(this, arguments); }; }
})(window.G);
