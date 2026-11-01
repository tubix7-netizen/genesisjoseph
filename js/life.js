/* 약속의 길 — camp life: NPC daily schedules, NPC-to-NPC chatter bubbles, NPCs who walk up and talk to you,
   passing travelers, side quests ("부탁"), and simple camera cutscenes. Content comes from the episode (EP.*). */
'use strict';
(function (G) {
const Game = G.Game, PI = Math.PI;
const L = G.Life = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// =================================================================== SPEECH BUBBLES
const bubbles = [];
L.bubble = function (who, text, dur) {
  const el = document.createElement('div'); el.className = 'bub'; el.textContent = text; $('bubbles').appendChild(el);
  bubbles.push({ who, el, t: dur || Math.min(5.5, 2.2 + text.length * 0.07) });
};
function drawBubbles(dt) {
  const R = G.R, UI = G.UI;
  for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.t -= dt; const n = typeof b.who === 'string' ? Game.ENT.npcs[b.who] : b.who;
    if (b.t <= 0 || !n || (n.vis === false) || UI.busy()) { b.el.remove(); bubbles.splice(i, 1); continue; }
    const s = R.project(n.x, n.y + 2.55 * (n.scale || 1), n.z, UI.W, UI.H); if (!s || Math.hypot(n.x - Game.P.x, n.z - Game.P.z) > 30) { b.el.hidden = true; continue; }
    b.el.hidden = false; b.el.style.transform = `translate(${s[0]}px,${s[1]}px) translate(-50%,-100%) scale(var(--uik,1))`; b.el.style.opacity = Math.min(1, b.t * 2); }
}
L.clearBubbles = () => { bubbles.forEach(b => b.el.remove()); bubbles.length = 0; };

// =================================================================== CHATTER (NPC ↔ NPC)
const chat = { t: 4, cool: {}, run: null };
function chatter(dt, S) {
  const EP = Game.EP(), P = Game.P, ENT = Game.ENT;
  if (chat.run) { const r = chat.run; r.t -= dt; if (r.t <= 0) { if (r.i >= r.lines.length) { chat.run = null; return; } const [who, txt] = r.lines[r.i]; const id = who === 0 ? r.a : who === 1 ? r.b : who; L.bubble(id, txt, 3.4); const n = ENT.npcs[id], o = ENT.npcs[id === r.a ? r.b : r.a]; if (n && o && !n.walk) n.face = Math.atan2(o.x - n.x, o.z - n.z); r.i++; r.t = 3.3; } return; }
  chat.t -= dt; if (chat.t > 0 || !EP.chatter) return; chat.t = 6 + Math.random() * 8;
  const pool = EP.chatter.filter((c, i) => { if ((chat.cool[i] || 0) > S.day * 24 + S.time % 24) return false; if (c.when && !c.when(S, Game)) return false;
    const a = ENT.npcs[c.a], b = c.b ? ENT.npcs[c.b] : null; if (!a || !a.vis || a.talking || (c.b && (!b || !b.vis || b.talking))) return false;
    if (Math.hypot(a.x - P.x, a.z - P.z) > 24) return false; if (b && Math.hypot(a.x - b.x, a.z - b.z) > (c.r || 9)) return false; return true; });
  if (!pool.length) return; const c = pool[Math.floor(Math.random() * pool.length)], idx = EP.chatter.indexOf(c);
  chat.cool[idx] = S.day * 24 + S.time % 24 + (c.cool || 8); // cooldown in game hours
  chat.run = { a: c.a, b: c.b, lines: typeof c.lines === 'function' ? c.lines(S, Game) : c.lines, i: 0, t: 0 };
}

// =================================================================== NPCs WHO COME TO YOU
const appr = { t: 25, cur: null, cool: {} };
function approach(dt, S) {
  const EP = Game.EP(), P = Game.P, ENT = Game.ENT; if (!EP.approach) return;
  if (appr.cur) { const a = appr.cur, n = ENT.npcs[a.id]; if (!n || !n.vis) { appr.cur = null; return; } a.t -= dt;
    const d = Math.hypot(n.x - P.x, n.z - P.z);
    if (G.UI.busy() || (G.Combat && G.Combat.inCombat) || a.t <= 0 || d > 40) { n.walk = null; giveUp(n, a); return; }
    if (d < 2.3) { n.walk = null; appr.cur = null; n.face = Math.atan2(P.x - n.x, P.z - n.z); P.face = Math.atan2(n.x - P.x, n.z - P.z); n.talking = true;
      const r = a.def.say(S, Game, n); if (Array.isArray(r)) G.UI.say(r, () => back(n, a)); else if (typeof r === 'function') r(() => back(n, a)); else back(n, a); return; }
    a.rt -= dt; if (a.rt <= 0) { a.rt = 0.6; const k = 1.6 / Math.max(1, d); Game.npcWalk(a.id, P.x + (n.x - P.x) * k, P.z + (n.z - P.z) * k, null, a.def.speed || 2.6); delete S.npcPos[a.id]; }
    return; }
  appr.t -= dt; if (appr.t > 0) return; appr.t = 12 + Math.random() * 14;
  if (G.UI.busy() || P.spd > 5 || P.act || (G.Combat && G.Combat.inCombat) || Game.cineOn || (G.Build && G.Build.placing) || Game.SET.chatty === 'off') return;
  const now = S.day * 24 + S.time;
  const pool = EP.approach.filter(a => { if (a.once && S.flags['ap:' + a.key]) return false; if ((appr.cool[a.key] || 0) > now) return false; if (a.when && !a.when(S, Game)) return false; const n = ENT.npcs[a.id]; if (!n || !n.vis || n.walk || n.talking || n.follow) return false; const d = Math.hypot(n.x - P.x, n.z - P.z); return d < (a.range || 20) && d > 3.2; });
  if (!pool.length) return; const def = pool[Math.floor(Math.random() * pool.length)], n = ENT.npcs[def.id];
  appr.cool[def.key] = now + (def.cool || 6); if (def.once) S.flags['ap:' + def.key] = 1;
  appr.cur = { id: def.id, def, t: 25, rt: 0, home: [n.x, n.z, n.homeFace] }; L.bubble(def.id, def.call || '야곱!', 2.6); sfx('blip', { vol: 0.6, pitch: 1.3 });
}
function back(n, a) { n.talking = false; if (a.def.stay) return; giveUp(n, a); }
function giveUp(n, a) { appr.cur = null; const h = a.home; if (n.d.sched) { n.schedSlot = -1; return; } Game.npcWalk(n.id, h[0], h[1], () => { n.face = n.homeFace = h[2]; }, 1.8); }

// =================================================================== DAILY SCHEDULES
function schedules(S) {
  const ENT = Game.ENT, hr = S.time % 24;
  for (const id in ENT.npcs) { const n = ENT.npcs[id], sc = n.d.sched; if (!sc || n.follow || n.talking || n.pass || (appr.cur && appr.cur.id === id) || (G.NpcAI && G.NpcAI.busyId && G.NpcAI.busyId() === id) || n.d.show && !n.d.show(S, Game)) continue;
    const list = typeof sc === 'function' ? sc(S, Game) : sc; if (!list || !list.length) continue;
    let k = list.length - 1; for (let i = 0; i < list.length; i++) if (hr >= list[i][0]) k = i; // last slot whose hour has passed (wraps from previous day)
    const key = list[k].join(','); if (n.schedSlot === k && n.schedKey === key) continue; n.schedSlot = k; n.schedKey = key;
    const [h, x, z, face, mode] = list[k]; n.sit = false; n.act = null; n.schedHidden = false; n.wander = null;
    const arrive = () => { n.face = n.homeFace = face || 0; if (mode === 'sit') n.sit = true; else if (mode === 'hide') n.schedHidden = true; else if (mode && mode.startsWith('act:')) n.act = mode.slice(4); else if (mode && mode.startsWith('wander')) n.wander = { r: +(mode.split(':')[1] || 4), cx: x, cz: z, tx: null, wait: 1 }; };
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < 0.6 || Game.Q.firstFrame) { Game.npcTo(id, x, z, face, false); arrive(); } else Game.npcWalk(id, x, z, arrive, n.d.walkSp || 1.7, n.d.route ? n.d.route(n, x, z) : null);
    delete S.npcPos[id];
  }
}

// =================================================================== TRAVELERS
const trav = { t: 60, cur: null, n: 0 };
function travelers(dt, S) {
  const EP = Game.EP(), P = Game.P; if (!EP.travelers) return;
  if (trav.cur) { const c = trav.cur, n = Game.ENT.npcs[c.id]; if (!n) { trav.cur = null; return; } c.life -= dt;
    if (c.st === 'come' && !n.walk) { c.st = 'wait'; c.wt = 40; }
    if (c.st === 'wait') { c.wt -= dt; const d = Math.hypot(n.x - P.x, n.z - P.z); if (!c.met && d < 26 && !G.UI.busy() && !appr.cur && !(G.Combat && G.Combat.inCombat)) { c.met = true; appr.cur = { id: c.id, def: { say: (S2, G2, nn) => c.def.say(S2, G2, nn, c), call: c.def.call || '여보시오, 젊은이!', stay: true }, t: 30, rt: 0, home: [n.x, n.z, n.face] }; L.bubble(c.id, c.def.call || '여보시오, 젊은이!', 2.6); }
      if (c.wt <= 0 || c.done) { c.st = 'leave'; Game.npcWalk(c.id, c.from[0], c.from[1], () => { c.st = 'gone'; }, 2.2); } }
    if (c.st === 'gone' || c.life <= 0) { Game.removeNPC(c.id); trav.cur = null; }
    return; }
  trav.t -= dt; if (trav.t > 0) return; trav.t = 70 + Math.random() * 90;
  if (G.UI.busy()) return; const now = S.day * 24 + S.time;
  const pool = EP.travelers.filter(t => (!t.when || t.when(S, Game)) && !(t.once && S.flags['tv:' + t.key]) && ((S.q.tvCool || {})[t.key] || 0) <= now);
  if (!pool.length) return; const def = pool[Math.floor(Math.random() * pool.length)];
  const spot = typeof def.at === 'function' ? def.at(S, Game) : def.at; if (!spot) return; const [fx, fz, tx, tz] = spot; if (Math.hypot(tx - P.x, tz - P.z) > 70) return;
  S.q.tvCool = S.q.tvCool || {}; S.q.tvCool[def.key] = now + (def.cool || 30); if (def.once) S.flags['tv:' + def.key] = 1;
  const id = 'trv' + (++trav.n); Game.spawnNPC({ id, name: def.name, look: def.look, x: fx, z: fz, face: 0, prop: def.prop, noTalk: false, trav: true });
  Game.npcWalk(id, tx, tz, null, 2.1); trav.cur = { id, def, from: [fx, fz], st: 'come', life: 260, met: false };
}
L.travelerDone = () => { if (trav.cur) trav.cur.done = true; };
L.approaching = () => !!appr.cur;

// =================================================================== SIDE QUESTS
const QS = () => Game.EP().quests || {};
const side = S => S.side || (S.side = { act: {}, done: {}, track: null });
L.active = S => Object.keys(side(S).act).filter(id => QS()[id]);
L.qOk = (S, id) => { const q = QS()[id]; const st = side(S).act[id]; return q.obj.every(o => o.ok(S, Game, st)); };
L.avail = (S, id) => { const q = QS()[id], sd = side(S); if (sd.act[id]) return false; const dn = sd.done[id]; if (dn !== undefined && !(q.repeat && S.day - dn >= q.repeat)) return false; return !q.when || q.when(S, Game); };
L.mark = function (id) { const S = Game.S(); if (!S || !Game.EP().quests) return null; for (const qid of L.active(S)) if (QS()[qid].giver === id && L.qOk(S, qid)) return '?'; for (const qid in QS()) if (QS()[qid].giver === id && L.avail(S, qid)) return '!'; return null; };
L.accept = function (id) { const S = Game.S(), q = QS()[id], st = { day: S.day, kills: Object.assign({}, S.hero.kills), fish: Object.assign({}, S.hero.fish), got: Object.assign({}, S.stats.got), stats: { fish: S.stats.fish || 0, butchered: S.stats.butchered || 0 } };
  side(S).act[id] = st; side(S).track = id; if (q.start) q.start(S, Game, st); sfx('quest'); G.UI.toast(`부탁을 맡았다 · ${q.title}`); G.UI.quest(); };
L.complete = function (id) {
  const S = Game.S(), q = QS()[id], rw = q.reward || {}, sd = side(S);
  if (q.take) for (const k in q.take) Game.take(k, q.take[k]);
  delete sd.act[id]; sd.done[id] = S.day; if (sd.track === id) sd.track = L.active(S)[0] || null;
  if (rw.silver) Game.silver(rw.silver); if (rw.items) for (const k in rw.items) Game.give(k, rw.items[k]); if (rw.gear) G.Combat.giveGear(rw.gear);
  if (rw.xp) Game.addXP(rw.xp); if (rw.trust) Game.trust && Game.trust(rw.trust); if (rw.heart) Game.heart && Game.heart(rw.heart);
  if (rw.insight) setTimeout(() => Game.insight(rw.insight, q.title), 400);
  if (q.finish) q.finish(S, Game); Game.stat('quests'); sfx('quest'); G.UI.quest(); Game.save(true); Game.checkStep();
};
L.talk = function (npcId) {
  const S = Game.S(), N = Game.ENT.npcs[npcId], nm = N ? N.name : '';
  const done = () => { if (N) N.talking = false; };
  const mine = L.active(S).filter(qid => QS()[qid].giver === npcId);
  // 1) hand in finished requests
  for (const qid of mine) { const q = QS()[qid]; if (L.qOk(S, qid)) { G.UI.say((typeof q.done === 'function' ? q.done(S, Game) : q.done).map(l => fix(l, nm)), () => { L.complete(qid); done(); }); return true; } }
  // 2) offer: story-critical requests first, then a reminder of one in progress, then other requests
  const avail = Object.keys(QS()).filter(qid => QS()[qid].giver === npcId && L.avail(S, qid)).sort((a, b) => (QS()[b].main ? 1 : 0) - (QS()[a].main ? 1 : 0));
  const offer = qid => { const q = QS()[qid]; const lines = (typeof q.offer === 'function' ? q.offer(S, Game) : q.offer).map(l => fix(l, nm));
    const other = Game.EP().talk && Game.EP().talk[npcId];
    lines.push({ n: Game.EP().hero, t: '어떻게 할까?', choices: [{ t: `맡겠습니다 · ${q.title}`, then: () => L.accept(qid) }, { t: '다음에 하겠습니다' }].concat(other ? [{ t: '다른 이야기를 나눈다', then: () => setTimeout(() => other(S, Game), 40) }] : []) });
    G.UI.say(lines, done); return true; };
  if (avail.length && QS()[avail[0]].main) return offer(avail[0]);
  for (const qid of mine) { const q = QS()[qid]; if (q.prog) { G.UI.say([fix(typeof q.prog === 'function' ? q.prog(S, Game) : q.prog, nm)], done); return true; } }
  if (avail.length) return offer(avail[0]);
  return false;
};
function fix(l, nm) { return typeof l === 'string' ? { n: nm, t: l } : l; }
L.tracked = function (S) { const sd = side(S); const id = sd.track && sd.act[sd.track] ? sd.track : L.active(S)[0]; return id ? { id, q: QS()[id], st: sd.act[id] } : null; };
L.track = id => { side(Game.S()).track = id; G.UI.quest(); };
L.onKill = function () { G.UI.quest(); };
// counters relative to when the quest was accepted
L.killsSince = (st, sp) => { const S = Game.S(); const sps = Array.isArray(sp) ? sp : [sp]; let n = 0; for (const k of sps) n += (S.hero.kills[k] || 0) - ((st && st.kills[k]) || 0); return n; };
L.fishSince = (st) => (Game.S().stats.fish || 0) - ((st && st.stats.fish) || 0);
L.gotSince = (st, k) => (Game.S().stats.got[k] || 0) - ((st && st.got[k]) || 0);

// =================================================================== CUTSCENES
/* shot: { cam:[x,y,z]|fn(t), cam2, look, look2, dur, fov, fov2, ease:'lin'|'in'|'out',  t (subtitle), n (speaker), e (emotion), ref,
           fn(S,G) at start, each(t,S,G) per frame, hour, hold, min, fadeIn, fadeOut (s), black (whole shot black), title, sub (big centred
           card), shake, music (track key or null to clear), sfx: name | [name, opts] }
   「장면 건너뛰기」 runs the remaining shots'
   fn() in order so the story state ends up exactly as if the scene had played. */
const Cine = G.Cine = { on: false };
Cine.play = function (shots, done, opt) {
  opt = opt || {}; if (G.Shot) G.Shot.reset(); if (G.Travel && G.Travel.on) G.Travel.stop('cutscene');
  // v17.7 P2: glide from the play camera into the first shot instead of cutting (opt.blendIn seconds, default 0.6; opt.cut or a black/title/fade-in first shot cuts as before; farther than 40 m is a cut)
  { const f0 = shots.filter(Boolean)[0], CM = Game.CAM, bi = opt.blendIn === undefined ? 0.6 : opt.blendIn; Cine.enter = !opt.cut && bi > 0 && f0 && !f0.black && !f0.title && !f0.fadeIn && !Cine.hold && Game.mode === 'play' && !Game.cineOn ? { x: CM.x, y: CM.y, z: CM.z, lx: CM.lx === undefined ? CM.tx : CM.lx, ly: CM.ly === undefined ? CM.ty : CM.ly, lz: CM.lz === undefined ? CM.tz : CM.lz, fov: CM.fov || 0.9, dur: bi } : null; }
  Cine.on = true; Game.cineOn = true; Cine.shots = shots.filter(Boolean); Cine.i = -1; Cine.done = done; Cine.opt = opt; Cine.T = 0;
  document.body.classList.add('cine'); { const cn = $('cine'); cn.classList.add('pre'); cn.hidden = false; void cn.offsetWidth; cn.classList.remove('pre'); } $('cineSkip').hidden = true; G.UI.hint && G.UI.hint(null); next();
};
function finish() {
  { const gr = $('cineGrade'); if (gr) gr.style.opacity = 0; const cn = $('cine'); cn && cn.classList.remove('nobars'); }
  if (G.Shot && G.Shot.hideDbg) G.Shot.hideDbg();
  // v16.6 Cine.hold: a chain of cutscenes (e.g. the road to Egypt) stays behind a black screen between scenes
  if (Cine.hold) { Cine.on = false; Game.cineOn = true; Cine.holdT = 0; setFade(1); titleCard(null); $('cineBox').hidden = true; const d = Cine.done; Cine.done = null; if (G.Combat) G.Combat.busy = false; d && d(); return; }
  const cc = Game.cineCam, fd = $('cineFade'); if (cc && cc.x !== undefined && !(fd && +fd.dataset.o > 0.05)) Game.camBlend = { x: cc.x, y: cc.y, z: cc.z, lx: cc.lx, ly: cc.ly, lz: cc.lz, fov: cc.fov || 0.9, t: 0, dur: 0.85 }; // v16.8 ease back into play
  Cine.on = false; Game.cineOn = false; Game.cineCam = null; Cine.speaker = undefined; document.body.classList.remove('cine'); $('cine').hidden = true; setFade(0); titleCard(null);
  const d = Cine.done; Cine.done = null; if (G.Combat) G.Combat.busy = false; Game.snapCam && Game.snapCam(); d && d();
}
/* v17.7 P3: colour grade per shot. shot.grade = a preset name or { c: 'rgba(...)', blend: 'soft-light', vig: 0..1, a: 0..1 }; a spoken shot without one gets a light
   grade from its feeling (shot.e) unless Settings → 연출 색감 is off. Shots with grade:'none' clear it. */
const GRADE = { dawn: { c: 'rgba(255,176,96,.22)', blend: 'soft-light', vig: 0.15 }, noon: { c: 'rgba(255,244,214,.06)', blend: 'soft-light', vig: 0.08 }, dusk: { c: 'rgba(255,118,58,.26)', blend: 'soft-light', vig: 0.28 },
  night: { c: 'rgba(40,64,132,.30)', blend: 'multiply', vig: 0.35 }, grief: { c: 'rgba(112,134,168,.34)', blend: 'color', vig: 0.34 }, hope: { c: 'rgba(255,214,140,.22)', blend: 'soft-light', vig: 0.1 }, dread: { c: 'rgba(18,72,62,.32)', blend: 'multiply', vig: 0.5 } };
const EGRADE = { sad: 'grief', cry: 'grief', weary: 'grief', fear: 'dread', cold: 'dread', happy: 'hope', tender: 'hope', awe: 'dawn' };
function applyGrade(sh) {
  const el = $('cineGrade'); if (!el) return; let g = sh.grade, k = 1;
  if (g === undefined && sh.e && sh.t && Game.SET.cgrade !== 'off') { g = EGRADE[sh.e]; k = 0.55; } // (feelings: a gentler tint)
  if (typeof g === 'string') g = g === 'none' ? null : GRADE[g]; if (!g || (sh.black && !sh.grade)) { el.style.opacity = 0; return; }
  const al = Math.min(1, (g.a === undefined ? 1 : g.a) * k); el.style.mixBlendMode = g.blend || 'soft-light';
  el.style.background = `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) ${Math.round((1 - (g.vig || 0)) * 62)}%, rgba(0,0,0,${((g.vig || 0) * 0.9).toFixed(2)}) 100%), ${g.c}`; el.style.opacity = al;
}
function next() {
  Cine.i++; const sh = Cine.shots[Cine.i];
  if (!sh) { finish(); return; }
  Cine.t = 0; const prev = Cine.shots[Cine.i - 1], snap = walkSnap(prev);
  if (sh.fn) { try { sh.fn(Game.S(), Game); } catch (e) { console.error('cine fn', e); } } if (sh.at) Object.assign(sh, sh.at(Game.S(), Game)); if (sh.hour !== undefined) Game.S().time = Math.floor(Game.S().time / 24) * 24 + sh.hour;
  { const cn = $('cine'); cn.classList.toggle('nobars', sh.bars === false); applyGrade(sh); }
  if (G.Shot) { G.Shot.auto(sh); G.Shot.prepare(sh, Cine.i); } // v17.6 P1: a `shot:` (who, how) becomes live cam/look functions; it counts as a new camera for walkInstead
  if (snap) walkInstead(snap, sh);
  if (sh.music !== undefined) Game.musicOverride = sh.music || null;
  if (sh.sfx) { const [nm, o] = Array.isArray(sh.sfx) ? sh.sfx : [sh.sfx, {}]; sfx(nm, o); }
  if (sh.shake && (typeof sh.shake !== 'number' || sh.shake >= 0.4)) G.haptic && G.haptic('thud');
  $('cineN').textContent = sh.n || ''; $('cineN').hidden = !sh.n; $('cineT').textContent = sh.t || ''; $('cineR').textContent = sh.ref || ''; $('cineBox').hidden = !sh.t;
  Cine.speaker = sh.t ? (sh.n || '') : undefined;
  titleCard(sh.title ? sh : null);
  if (sh.t) sfx(sh.n ? 'blip' : 'page', { vol: 0.5 });
}
/* v17.0 컷신 순간이동 → 걷기: a shot's fn often moves people with npcTo. Behind a cut that is invisible, but when the camera
   carries on (the shot has no new camera, or one within 1.5 m of the last) people used to jump. Then anyone who moved 0.4-9 m
   and is on screen walks there instead (and turns to the facing the shot asked for when they arrive). Skipping the scene still
   places everyone at once (skipAll does not come through here). */
function walkSnap(prev) { if (!prev || prev.black || prev.fadeOut || !Game.cineCam) return null; const m = new Map(), cc = Game.cineCam;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.d.animal || n.pass || n.follow || n.vis === false || !n.near) continue;
    if (Math.hypot(n.x - cc.x, n.z - cc.z) > 32) continue; m.set(id, { x: n.x, z: n.z, y: n.y, face: n.face }); } return m; }
function walkInstead(snap, sh) {
  if (sh.black || sh.fadeIn || sh.title) return; const S = Game.S();
  if (sh.cam !== undefined) { const c0 = typeof sh.cam === 'function' ? null : sh.cam, cc = Game.cineCam, lc = cc && [cc.x, cc.y, cc.z]; if (!c0 || !lc || Math.hypot(c0[0] - lc[0], c0[1] - lc[1], c0[2] - lc[2]) > 1.5) return; }
  for (const [id, o] of snap) { const n = Game.ENT.npcs[id]; if (!n || n.walk || n.vis === false) continue; const d = Math.hypot(n.x - o.x, n.z - o.z); if (d < 0.4 || d > 9) continue;
    const tx = n.x, tz = n.z, tf = n.face; n.x = o.x; n.z = o.z; n.y = o.y; n.face = o.face; n.col.x = o.x; n.col.z = o.z;
    Game.npcWalk(id, tx, tz, () => { n.face = n.homeFace = tf; }, d > 5 ? 2.6 : 1.9); if (S.npcPos[id]) S.npcPos[id][2] = tf; }
}
function setFade(o) { const f = $('cineFade'); if (!f) return; const v = Math.max(0, Math.min(1, o)); if (Math.abs((+f.dataset.o || 0) - v) > 0.004) { f.dataset.o = v; f.style.opacity = v; } }
function titleCard(sh) { const el = $('cineTitle'); if (!el) return; if (!sh) { el.classList.remove('show'); return; } $('ctT').textContent = sh.title; $('ctS').textContent = sh.sub || ''; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
Cine.release = function () { Cine.hold = false; if (!Cine.on) { Game.cineOn = false; Game.cineCam = null; document.body.classList.remove('cine'); $('cine').hidden = true; setFade(0); Game.snapCam && Game.snapCam(); } };
Cine.skip = function () { if (!Cine.on) return; const sh = Cine.shots[Cine.i]; if (Cine.t < (sh && sh.min !== undefined ? sh.min : 0.7)) return; next(); };
Cine.skipAll = function () { if (!Cine.on) return; for (let i = Cine.i + 1; i < Cine.shots.length; i++) { const sh = Cine.shots[i]; Cine.i = i; if (sh.fn) sh.fn(Game.S(), Game); if (sh.hour !== undefined) Game.S().time = Math.floor(Game.S().time / 24) * 24 + sh.hour; if (sh.music !== undefined) Game.musicOverride = sh.music; } finish(); };
// v15: a cutscene camera that ends up inside a tree crown sees nothing but leaves — slide it toward what it looks at (or out
// sideways) until it is clear. Episodes register crowns in W.canopies = [{ x, z, y0, y1, r }].
function inCanopy(W, x, y, z) { for (const c of W.canopies) { if (Math.abs(c.x - x) > c.r || Math.abs(c.z - z) > c.r) continue; if (y > c.y0 - 0.4 && y < c.y1 && Math.hypot(c.x - x, c.z - z) < c.r * 0.92) return c; } return null; }
function keepOutOfTrees(cc) { const W = Game.W(); if (!W || !W.canopies || !W.canopies.length) return; let c = inCanopy(W, cc.x, cc.y, cc.z); if (!c) return;
  const dx = cc.lx - cc.x, dy = cc.ly - cc.y, dz = cc.lz - cc.z, L = Math.hypot(dx, dy, dz) || 1;
  for (let i = 1; i <= 16 && c; i++) { const t = Math.min(L * 0.8, i * 0.5) / L, x = cc.x + dx * t, y = cc.y + dy * t, z = cc.z + dz * t; if (!inCanopy(W, x, y, z)) { cc.x = x; cc.y = y; cc.z = z; return; } }
  c = inCanopy(W, cc.x, cc.y, cc.z); if (c) { const ax = cc.x - c.x, az = cc.z - c.z, al = Math.hypot(ax, az) || 1; cc.x = c.x + ax / al * c.r * 0.95; cc.z = c.z + az / al * c.r * 0.95; } }
// v15: never lose the scene behind a wall — if something solid stands between the camera and what it looks at (and it is not the
// building being looked at), slide the camera forward along its line of sight until the view is clear.
function unblock(cc) { const W = Game.W(); if (!W || !W.ray) return; const dx = cc.lx - cc.x, dy = cc.ly - cc.y, dz = cc.lz - cc.z, L = Math.hypot(dx, dy, dz); if (L < 1) return;
  const f = W.ray(cc.x, cc.y, cc.z, cc.lx, cc.ly, cc.lz); if (f >= 0.97 || L * (1 - f) < 6) return;
  for (let d = Math.max(0.4, f * L + 0.4); d < L * 0.75; d += 0.4) { const x = cc.x + dx / L * d, y = cc.y + dy / L * d, z = cc.z + dz / L * d; if (y < W.heightAt(x, z) + 0.3) continue;
    if (W.ray(x, y, z, cc.lx, cc.ly, cc.lz) >= 0.97) { cc.x = x; cc.y = y; cc.z = z; return; } } }
// v15: when a line is spoken by someone standing just outside the picture, turn the camera the least amount that brings them in
// (POV shots from the speaker's own eyes, people behind the camera and far-away voices are left as directed).
function speakerPos(nm) { if (!nm) return null; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.name === nm && n.vis) return [n.x, n.y + 1.45 * (n.scale || 1), n.z]; }
  const EP = Game.EP && Game.EP(); if (EP && nm === EP.hero) return [Game.P.x, Game.P.y + (Game.P.sleeping ? 0.4 : 1.45), Game.P.z]; return null; }
function ndc(cc, p) { let fx = cc.lx - cc.x, fy = cc.ly - cc.y, fz = cc.lz - cc.z; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  let rx = fz, rz = -fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl; const ux = fy * rz, uy = fz * rx - fx * rz, uz = -fy * rx;
  const dx = p[0] - cc.x, dy = p[1] - cc.y, dz = p[2] - cc.z, d = dx * fx + dy * fy + dz * fz; if (d < 0.3) return null; const th = Math.tan((cc.fov || 0.9) / 2), asp = innerWidth / Math.max(1, innerHeight);
  return [(dx * rx + dz * rz) / d / (th * asp), (dx * ux + dy * uy + dz * uz) / d / th]; }
function frameSpeaker(cc, sh) { if (!sh || !sh.n || !sh.t || sh.keepFrame) { Cine.fw = 0; return; } const p = speakerPos(sh.n); if (!p) return; const dist = Math.hypot(p[0] - cc.x, p[1] - cc.y, p[2] - cc.z); if (dist < 1.6 || dist > 14) return;
  const q = ndc(cc, p); if (!q) return; let need = 0; if (Math.abs(q[0]) > 0.9 || Math.abs(q[1]) > 0.9) { const lx = cc.lx, ly = cc.ly, lz = cc.lz;
    for (let w = 0.1; w <= 0.8; w += 0.1) { const c2 = { x: cc.x, y: cc.y, z: cc.z, lx: lx + (p[0] - lx) * w, ly: ly + (p[1] - ly) * w, lz: lz + (p[2] - lz) * w, fov: cc.fov }; const q2 = ndc(c2, p); if (q2 && Math.abs(q2[0]) < 0.72 && Math.abs(q2[1]) < 0.8) { need = w; break; } } if (!need) need = 0.8; }
  Cine.fw = Cine.t < 0.08 ? need : (Cine.fw || 0) + (need - (Cine.fw || 0)) * Math.min(1, 1 / 15); const w = Cine.fw; if (w < 0.01) return;
  cc.lx += (p[0] - cc.lx) * w; cc.ly += (p[1] - cc.ly) * w; cc.lz += (p[2] - cc.lz) * w; }
/* v16.8 acting: the emotion of the line being spoken (shot.e) goes to the speaker's body and face (motion.js ACTING). The
   others in the shot listen with a lighter share of a few feelings (grief and fear spread, tenderness and awe too). */
const SHARED = { cry: 0.45, sad: 0.5, fear: 0.55, awe: 0.6, solemn: 0.6, pray: 0.5, tender: 0.35, happy: 0.4, weary: 0.4 };
Cine.emoOf = function (name) { if (!Cine.on) return null; const sh = Cine.shots[Cine.i]; if (!sh || !sh.e || !sh.t) return null;
  if (sh.n === name) return [sh.e, 1]; const k = SHARED[sh.e]; return k && sh.n ? [sh.e === 'cry' ? 'sad' : sh.e, k] : null; };
Cine.canopyAt = (x, y, z) => { const W = Game.W(); return W && W.canopies ? inCanopy(W, x, y, z) : null; };
/* v16.8 camera grammar from the line's emotion (프롬프트 8장 recipes), laid over the authored shot without changing its framing:
   · sorrow, tenderness, prayer, whispering → a slow, nearly linear push-in (up to 9% of the distance) that draws you into the
     face; · fear, urgency, shouting, anger → a light handheld drift (low-frequency noise, not random jitter); anger also
     drops the camera a little for a low angle · awe → a slow pedestal up · every spoken shot breathes very slightly, so no
     shot is ever dead-still (organic, not CCTV). Shots that already move (cam2) only get the noise. */
const GRAM = { cry: { push: 0.09, hh: 0.35 }, sad: { push: 0.08 }, weary: { push: 0.05 }, tender: { push: 0.07 }, solemn: { push: 0.05 }, pray: { push: 0.06 }, whisper: { push: 0.08 },
  fear: { hh: 1, push: 0.04 }, urgent: { hh: 0.7 }, shout: { hh: 0.8, low: 0.22 }, angry: { hh: 0.6, low: 0.28, push: 0.05 }, awe: { up: 0.35 }, happy: { hh: 0.2 }, calm: {}, cold: { hh: 0.3 } };
const nz = (t, a) => Math.sin(t * 1.13 + a) * 0.5 + Math.sin(t * 2.31 + a * 1.7) * 0.3 + Math.sin(t * 4.07 + a * 2.3) * 0.2; // smooth noise in −1..1
function grammar(cc, sh, k, dur) { if (sh.black || sh.title || sh.still) return; const g = (sh.e && GRAM[sh.e]) || null, T = Cine.T, moving = !!(sh.cam2 || (typeof sh.cam === 'function' && !sh.shotStatic));
  const dx = cc.lx - cc.x, dy = cc.ly - cc.y, dz = cc.lz - cc.z, L = Math.hypot(dx, dy, dz) || 1;
  if (g && g.push && !moving && L > 1.8) { const p = g.push * Math.min(1, Cine.t / Math.max(3, dur)); cc.x += dx * p; cc.y += dy * p; cc.z += dz * p; }
  if (g && g.up && !moving) { const p = g.up * (Cine.t / Math.max(3, dur)); cc.y += p; }
  if (g && g.low && !moving) { const W = Game.W(), gy = W ? W.heightAt(cc.x, cc.z) + 0.5 : -1e9; cc.y = Math.max(gy, cc.y - g.low); }
  const hh = (g && g.hh) || 0, br = sh.t ? 1 : 0.4, a = 0.012 * br + 0.05 * hh, r = 0.008 * br + 0.035 * hh;
  cc.x += nz(T, 0.3) * a; cc.y += nz(T * 1.1, 2.1) * a * 0.7; cc.z += nz(T * 0.9, 4.2) * a; cc.lx += nz(T * 1.3, 5.7) * r * L * 0.12; cc.ly += nz(T * 1.2, 7.3) * r * L * 0.1; }
const EASE = { lin: k => k, in: k => k * k, out: k => 1 - (1 - k) * (1 - k), smooth: k => k * k * (3 - 2 * k) };
Cine.update = function (dt) {
  if (!Cine.on) return; const sh = Cine.shots[Cine.i]; if (!sh) return; Cine.t += dt; Cine.T += dt; const dur = sh.dur || 4, k = Math.min(1, Cine.t / dur), e = (EASE[sh.ease] || EASE.smooth)(k);
  const fnv = (v, d) => v === undefined ? d : typeof v === 'function' ? v(Cine.t) : v;
  const c0 = fnv(sh.cam, Cine.lastCam), l0 = fnv(sh.look, Cine.lastLook); if (!c0 || !l0) return; const c1 = fnv(sh.cam2, c0), l1 = fnv(sh.look2, l0); Cine.lastCam = c0; Cine.lastLook = l0;
  const cc = Game.cineCam || (Game.cineCam = {}); cc.x = c0[0] + (c1[0] - c0[0]) * e; cc.y = c0[1] + (c1[1] - c0[1]) * e; cc.z = c0[2] + (c1[2] - c0[2]) * e; cc.lx = l0[0] + (l1[0] - l0[0]) * e; cc.ly = l0[1] + (l1[1] - l0[1]) * e; cc.lz = l0[2] + (l1[2] - l0[2]) * e;
  cc.fov = sh.fov2 ? (sh.fov || 0.9) + (sh.fov2 - (sh.fov || 0.9)) * e : (sh.fov || 0.9);
  grammar(cc, sh, k, dur);
  keepOutOfTrees(cc); unblock(cc); frameSpeaker(cc, sh);
  if (Cine.enter) { const en = Cine.enter; if (Cine.T < 0.05 && Math.hypot(en.x - cc.x, en.y - cc.y, en.z - cc.z) > 40) Cine.enter = null; else if (Cine.T >= en.dur) Cine.enter = null; else { const u = Cine.T / en.dur, w = 1 - u * u * (3 - 2 * u); // (smoothstep weight of the play camera, fading out)
    cc.x += (en.x - cc.x) * w; cc.y += (en.y - cc.y) * w; cc.z += (en.z - cc.z) * w; cc.lx += (en.lx - cc.lx) * w; cc.ly += (en.ly - cc.ly) * w; cc.lz += (en.lz - cc.lz) * w; cc.fov += (en.fov - cc.fov) * w; } }
  if (sh.shake) { const a = (typeof sh.shake === 'number' ? sh.shake : 0.3) * (sh.shakeDecay ? Math.max(0, 1 - Cine.t / sh.shakeDecay) : 1); cc.x += (Math.random() - 0.5) * a * 0.3; cc.y += (Math.random() - 0.5) * a * 0.3; cc.lx += (Math.random() - 0.5) * a * 0.2; cc.ly += (Math.random() - 0.5) * a * 0.2; }
  if (sh.each) { try { sh.each(Cine.t, Game.S(), Game); } catch (e) { console.error('cine each', e); sh.each = null; } }
  let fo = 0; if (sh.black) fo = 1; if (sh.fadeIn) fo = Math.max(fo, 1 - Cine.t / sh.fadeIn); if (sh.fadeOut) fo = Math.max(fo, (Cine.t - (dur - sh.fadeOut)) / sh.fadeOut); setFade(fo);
  if (Cine.T > 1.6 && $('cineSkip').hidden && !Cine.opt.noSkip) $('cineSkip').hidden = false;
  if (Cine.t >= dur && !sh.hold) next();
};
$('cineSkip') && ($('cineSkip').onpointerdown = e => { e.preventDefault(); e.stopPropagation(); Cine.skipAll(); });

// =================================================================== MAIN HOOKS
L.update = function (dt, t) {
  const S = Game.S(); if (!S || Game.mode !== 'play') return;
  drawBubbles(dt); Cine.update(dt);
  if (Cine.hold && !Cine.on) { Cine.holdT = (Cine.holdT || 0) + dt; if (Cine.holdT > 4) Cine.release(); }
  if (Cine.on) return;
  L.schT = (L.schT || 0) - dt; if (L.schT <= 0) { L.schT = 0.5; schedules(S); }
  chatter(dt, S); approach(dt, S); travelers(dt, S);
};
L.reset = function () { L.clearBubbles(); chat.run = null; chat.t = 5; appr.cur = null; appr.t = 30; if (trav.cur) { try { Game.removeNPC(trav.cur.id); } catch (e) { } } trav.cur = null; trav.t = 50; for (const id in Game.ENT.npcs) Game.ENT.npcs[id].schedSlot = -1; };
L.esc = esc;
})(window.G);
