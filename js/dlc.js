/* 약속의 길 — v18.64 조상들의 이야기 (dlc.js) · 두 DLC가 함께 쓰는 틀
   요셉 편을 마친 뒤, 고센의 아버지 야곱이나 세겜의 옛 제단에서 조상들의 이야기 속으로 들어가요. 그 안에서는 야곱이나 아브라함이 되어 걸어요.
   · 「창세기 야곱 편 · 라헬을 위한 일곱 해」(dlc_jacob.js): 고센의 부탁 다섯을 모두 마친 뒤, 고센의 아버지 야곱에게 말을 걸면 열려요.
   · 「창세기 아브라함 편 · 약속의 별」(dlc_abraham.js): 본편을 마치면 가나안으로 다시 갈 수 있어요. 세겜 들판의 옛 제단 앞에 서면 열려요.
   v18.64 이야기는 요셉 지도 위의 무대가 아니라 「따로 된 지도」예요(dlcep.js). 들어가면 요셉 편을 저장하고 이야기의 땅을 새로 불러오고,
     나오면 이야기를 저장하고 요셉 편을 그 자리에서 다시 불러와요. 요셉의 가방 · 밤샘 · 날씨 · 부탁은 요셉 편에 그대로 남아 있어요.
   · 화면 오른쪽 위 「이야기에서 나오기」 단추로 언제든 나와요(꿈의 세계의 「현실 세계」 단추와 같은 자리). 한 만큼은 남아요.
   · 이야기 속에서 게임을 끄면, 다음에 「이어하기」로 그 이야기 속에서 다시 시작해요.
   · 이야기 값: 이야기 안에서는 그 이야기의 저장(S.flags.st), 요셉 편에서는 요약(S.flags.dlcSt[key] = { ch, done, best, again }).
   API: G.DLC.add(def) · enter(key) · leave(cb) · cur() · st(key) · restart(key) · rename(n) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!Game || !EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const D = G.DLC = { defs: {} };
const done = id => { const s = S(); return !!(s && s.side && s.side.done && s.side.done[id] !== undefined); };
const inStory = () => { const E = Game.EP && Game.EP(); return !!(E && E.dlc); };
D.ended = () => { const s = S(); return !!s && !inStory() && s.step === 'j_end'; };
D.cur = () => { const E = Game.EP && Game.EP(); return E && E.dlc ? E.dlcKey : null; };
const epOf = key => 'dlc_' + key;
/* the story's values: inside the story its own save; in Joseph's world the short record of it */
D.st = key => { const s = S(); if (!s || !s.flags) return {}; if (D.cur() === key) return s.flags.st || (s.flags.st = {}); const a = s.flags.dlcSt || (s.flags.dlcSt = {}); return a[key] || (a[key] = {}); };
D.add = function (def) { D.defs[def.key] = def; };
const heroName = (def, st) => typeof def.hero === 'function' ? def.hero(st) : def.hero;
D.rename = n => { const E = Game.EP(); if (E && E.dlc) E.hero = n; };
/* a finished story can be heard again from the start (what was earned stays) */
D.restart = key => { D._fresh = key; };
const lsGet = (id, n) => { try { return JSON.parse(localStorage.getItem('genesisSave_' + id + ((n || Game.slot) > 1 ? '#' + (n || Game.slot) : '')) || 'null'); } catch (e) { return null; } };
function why() { const s = S(), p = P(); if (p.ride || (s.q && s.q.riding)) return '탈것에서 먼저 내려 주세요'; if ((G.Phys && G.Phys.held) || p.carry) return '들고 있는 것을 먼저 내려놓아요'; if ((p.follow || []).length) return '함께 가는 사람이 있을 땐 들어갈 수 없어요'; return null; }
D.enter = function (key) { const def = D.defs[key]; if (!def || inStory() || !G.EP[epOf(key)]) return; const w = why(); if (w) { G.UI.toast(w); return; }
  const s = S(), restart = D._fresh === key, fresh = restart || !Game.hasSave(epOf(key), Game.slot); D._fresh = null;
  const rec = Object.assign({}, D.st(key)); s.flags.dlcIn = key; Game.save(true);
  /* a story begun before v18.64 (a stage over Joseph's map) has its whole state in the record: it carries on from there. A restart keeps only what was earned. */
  const SUM = ['ch', 'done', 'best', 'again', 'rewarded'], old = Object.keys(rec).some(k => SUM.indexOf(k) < 0 && k !== 'kit' && rec[k] !== undefined && rec[k] !== null);
  D._seed = !fresh ? null : restart || !old || rec.done ? { done: rec.done, best: rec.best, again: (rec.again | 0) + (restart ? 1 : 0) } : (() => { const c = JSON.parse(JSON.stringify(rec)); delete c.kit; return c; })();
  sfx('insight', { pitch: 0.8, vol: 0.6 });
  G.UI.fade(() => { try { G.UI.hush && G.UI.hush(); G.UI.clearTags && G.UI.clearTags(); if (G.UI.hint) G.UI.hint(null); Game.start(epOf(key), fresh); G.UI.buildMap && G.UI.buildMap(); } catch (e) { console.error('dlc enter', e); } },
    () => { const st = D.st(key); if (D._introNow && def.intro) try { def.intro(st); } catch (e) { console.error('dlc', e); } D._introNow = 0; G.UI.quest && G.UI.quest(); }); };
/* the story's episode calls this when it has loaded (a new start, a continue, or a reopened tab) */
D.loaded = function (key, s) { const def = D.defs[key]; if (!def) return; const E = Game.EP();
  if (D._seed) { s.flags.st = D._seed; D._seed = null; } const st = s.flags.st || (s.flags.st = {});
  if (!s.flags.kitGiven) { s.flags.kitGiven = 1; const k = (def.kit && def.kit(st)) || {}; s.inv = Object.assign({}, k.inv || {}); s.tools = {}; for (const x of k.tools || []) s.tools[x] = true; s.silver = k.silver | 0; s.water = k.water | 0; s.hand = k.hand && s.tools[k.hand] ? k.hand : null; }
  E.hero = heroName(def, st); document.body.classList.add('dlcOn');
  const sp = (def.spawn && def.spawn(st)) || null; if (sp) { Game.teleport(sp[0], sp[1], sp[2] || 0); const p = P(); p.y = p.airTop = Game.W().heightAt(sp[0], sp[1]); }
  if (def.onEnter) try { def.onEnter(st); } catch (e) { console.error('dlc', e); }
  D._introNow = 1; setTimeout(() => { if (D._introNow && D.cur() === key) { D._introNow = 0; if (def.intro) try { def.intro(st); } catch (e) { console.error('dlc', e); } G.UI.quest && G.UI.quest(); } }, 900); };
D.leave = function (cb) { const key = D.cur(); if (!key) { cb && cb(); return; } const def = D.defs[key], st = Object.assign({}, D.st(key));
  if (def && def.onLeave) try { def.onLeave(st); } catch (e) { console.error('dlc', e); }
  Game.save(true); sfx('insight', { pitch: 0.7, vol: 0.5 });
  G.UI.fade(() => { try { G.UI.hush && G.UI.hush(); G.UI.clearTags && G.UI.clearTags(); if (G.UI.hint) G.UI.hint(null); D._leaving = 1; Game.start('joseph', false); D._leaving = 0; G.UI.buildMap && G.UI.buildMap();
      const s = S(), a = s.flags.dlcSt || (s.flags.dlcSt = {}), o = a[key] || {}; s.flags.dlcIn = null;
      a[key] = { ch: st.ch | 0, done: st.done || o.done, best: Math.max(st.best | 0, o.best | 0), again: st.again | 0, rewarded: o.rewarded };
      if (st.done && !o.rewarded) { a[key].rewarded = 1; s.flags[key === 'jacob' ? 'dlcJacobDone' : 'dlcAbrahamDone'] = 1; setTimeout(() => { Game.insight && Game.insight(3, def.title); }, 1400); }
      Game.save(true); } catch (e) { D._leaving = 0; console.error('dlc leave', e); } }, () => { G.UI.quest && G.UI.quest(); cb && cb(); }); };
/* a Joseph game saved while inside a story opens in that story */
{ const st0 = Game.start; Game.start = function (epId, fresh, preview) {
    if (epId !== 'joseph' || preview) document.body.classList.remove('dlcOn');
    if (epId === 'joseph' && !fresh && !preview && !D._leaving) { const sv = lsGet('joseph'); const k = sv && sv.flags && sv.flags.dlcIn; if (k && D.defs[k] && G.EP[epOf(k)]) { const r = st0.call(this, epOf(k), !Game.hasSave(epOf(k), Game.slot), false); return r; } }
    if (epId === 'joseph') document.body.classList.remove('dlcOn');
    return st0.apply(this, arguments); }; }
/* a new Joseph game (or a deleted slot) takes its stories with it */
{ const ds0 = Game.deleteSave; Game.deleteSave = function (id, n) { const r = ds0.apply(this, arguments); if (id === 'joseph') for (const k in D.defs) ds0.call(this, epOf(k), n); return r; }; }
/* sleeping inside a story: a quiet night, nothing of Joseph's day turns */
{ const sl0 = Game.sleep; Game.sleep = function () { if (inStory()) { const s = S(); G.UI.fade(() => { s.time = 6.5; P().stam = (G.Vitals && G.Vitals.cap) || 140; if (s.hero) s.hero.hp = s.hero.hpMax; }, () => D.toast('푹 자고 일어났어요')); return; } return sl0.apply(this, arguments); }; }
D.pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c); D.toast = (a, x) => G.UI.toast(a, x);
/* the map of a story: every place in it is known */
if (G.UI) { const pk0 = G.UI.placeKnown; G.UI.placeKnown = function (p, s) { if (inStory()) return 'seen'; return pk0 ? pk0.apply(this, arguments) : 'seen'; }; }
/* the clock's day: not Egypt's days and Nile seasons, but the story's own (def.dayLabel) */
setTimeout(() => { if (G.UI && G.UI.dayLabel) { const dl0 = G.UI.dayLabel; G.UI.dayLabel = function () { const k = D.cur(); if (k && D.defs[k]) { try { return D.defs[k].dayLabel ? D.defs[k].dayLabel(D.st(k)) : D.defs[k].title.split(' · ')[0]; } catch (e) { return ''; } } return dl0.apply(this, arguments); }; } }, 0);
/* the extras Joseph's map draws on top (notice boards, 「가 본 곳」 of Egypt and Canaan …) belong to his map, not to a story's */
setTimeout(() => { if (G.UI && G.UI.mapExtra) { const mx0 = G.UI.mapExtra; G.UI.mapExtra = function () { if (inStory()) return; return mx0.apply(this, arguments); }; } }, 0);
if (G.DW && G.DW.enter) { const e0 = G.DW.enter; G.DW.enter = function () { if (inStory()) { G.UI.toast('이야기 속에서는 꿈의 세계에 들어갈 수 없어요'); return; } return e0.apply(this, arguments); }; }
/* an old save (v18.59–v18.63) that was inside a story over Joseph's map: Joseph gets his things back and stands where he went in; the story waits */
{ const ol = EP.onLoad; EP.onLoad = function (s) { const r = ol ? ol.apply(this, arguments) : undefined; try { const d = s && s.flags && s.flags.dlc; if (d && d.key) { const b = d.bag || {}, H = s.hero || (s.hero = {});
        if (b.inv) { const a = s.flags.dlcSt || (s.flags.dlcSt = {}), k = a[d.key] || (a[d.key] = {}); k.kit = undefined; s.inv = b.inv || {}; s.tools = b.tools || {}; s.silver = b.silver | 0; s.water = b.water | 0; s.jarMax = b.jarMax || 12; s.quick = b.quick; s.seedSel = b.seedSel; H.weapon = b.weapon; H.ranged = b.ranged; H.armor = b.armor; H.gear = b.gear || {}; const sd = s.side || (s.side = { act: {}, done: {}, track: null }); sd.act = b.act || {}; sd.track = b.track; sd.goal = b.goal; s.wp = b.wp; }
        s.flags.land_dlcj = 0; s.flags.land_dlca = 0; s.outfit = d.o || 'default'; if (d.t) s.time = d.t; s.hand = d.h || null; s.flags.dlc = null; Game.teleport(d.x, d.z, d.f || 0); Game.setOutfit(s.outfit); } } catch (e) { console.error('dlc old save', e); } return r; }; }
/* v18.59 본편을 마치면 가나안 길이 다시 열려요 (세겜 · 헤브론) */
{ const lo = EP.landOf; EP.landOf = function (s) { if (s && s.step === 'j_end') return null; return lo ? lo.apply(this, arguments) : null; }; }
// ------------------------------------------------------------------ 오른쪽 위 「이야기에서 나오기」 (꿈의 세계 「현실 세계」 단추 자리)
const xb = document.createElement('button'); xb.id = 'dlcExit'; xb.className = 'cbtn'; xb.innerHTML = '<span>이야기에서 나오기</span>'; xb.hidden = true;
{ const css = document.createElement('style'); css.textContent = '#dlcExit{position:fixed;right:var(--gr,12px);top:calc(var(--gt,12px) + var(--mw,100px) + 112px);width:auto;height:36px;padding:0 14px;border-radius:18px;font-size:12.5px;z-index:12;background:linear-gradient(135deg,#d8a040,#a86a30);color:#fff;border:1px solid #ffe8b0;box-shadow:0 2px 8px #0005}body.dlcOn #dreamBtn,body.dlcOn #rideBtn,body.dlcOn #seedBtn,body.dlcOn #waterBtn,body.dlcOn #gFood,body.dlcOn #gWarm{display:none!important}'; document.head.appendChild(css); }
setTimeout(() => (document.getElementById('hud') || document.body).appendChild(xb), 0);
xb.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (G.UI.busy() || Game.cineOn || !inStory()) return; const def = D.defs[D.cur()];
  G.UI.say([{ n: '', t: `${def && def.backTo ? def.backTo : '요셉의 이야기로 돌아갈까요?'} 여기까지 한 것은 남아요. 다음에 다시 들어오면 이어서 할 수 있어요.`, choices: [{ t: '이야기에서 나오기', then: () => setTimeout(() => D.leave(def && def.afterLeave), 30) }, { t: '조금 더 머물기' }] }], null); });
setInterval(() => { const show = inStory() && Game.mode === 'play' && !Game.cineOn && !(G.Cine && G.Cine.on) && !G.UI.busy(); if (xb.hidden === show) xb.hidden = !show; }, 250);

/* the choices for going into a story: go on (a story under way, also a second hearing left halfway), begin (never begun), or begin again (once finished) */
const LASTCH = { jacob: 6, abraham: 7 };
D.storyChoices = function (key, [goOn, begin, again], fin) { const st = D.st(key), sfx2 = ' (' + (D.defs[key] ? D.defs[key].title.split(' · ')[0] : '') + ')', out = [], go = rs => () => { fin && fin(); if (rs) D.restart(key); setTimeout(() => D.enter(key), 40); };
  const sv = lsGet(epOf(key)), ch = sv && sv.flags && sv.flags.st ? sv.flags.st.ch | 0 : st.ch | 0; /* (the story's own save knows best where it stands) */
  const under = ch < LASTCH[key] && (!!sv || ch > 0);
  if (under && ch > 0) out.push({ t: goOn + sfx2, then: go(false) }); else if (!st.done || under) out.push({ t: begin + sfx2, then: go(false) });
  if (st.done) out.push({ t: again + sfx2, then: go(true) }); return out; };
// ------------------------------------------------------------------ 고센의 야곱 → 야곱 편
const GOSHEN_Q = ['g_lamb', 'g_tent', 'g_bread', 'g_story', 'g_benj'];
D.jacobOpen = () => D.ended() && GOSHEN_Q.every(done);
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S();
    if (id === 'jacob' && !D.cur() && D.defs.jacob && D.ended() && !(G.DW && G.DW.on && G.DW.on())) { const n = Game.npc('jacob'), fin = () => { if (n) n.talking = false; };
      if (!D.jacobOpen()) { if (!s.flags.dlcJHint) { s.flags.dlcJHint = 1; const left = GOSHEN_Q.filter(q => !done(q)).length; G.UI.say([{ n: n.name, t: '요셉아, 네 형들과 조카들이 너를 찾더구나. 고센의 일을 먼저 돌봐 다오. 그 뒤에… 이 아비가 젊은 날 하란에서 지낸 이야기를 들려주마.' }, { n: '', t: `(고센의 부탁 다섯 가운데 ${left}개가 남았어요. 모두 마치면 아버지의 이야기가 열려요.)` }], fin); return true; } return lt0.apply(this, arguments); }
      const st = D.st('jacob'); G.UI.say([{ n: n.name, t: st.done ? '하란의 일곱 해 이야기를 또 듣고 싶으냐? 허허, 몇 번을 해도 그 일곱 해는 며칠 같구나.' : st.ch ? '어디까지 이야기했더라… 그래, 하란이었지. 이어서 들려주마.' : '요셉아, 이리 앉거라. 네 어미 라헬을 얻으려고 이 아비가 하란에서 일곱 해를 섬긴 이야기를 들려주마.',
        choices: D.storyChoices('jacob', ['아버지의 이야기를 이어서 듣기', '아버지의 젊은 날 이야기 듣기', '처음부터 다시 듣기'], fin).concat([{ t: '다른 이야기를 나눠요', then: () => { fin(); setTimeout(() => lt0.call(G.Life, id), 40); } }, { t: '다음에 들을게요', then: fin }]) }], null); return true; }
    return lt0.apply(this, arguments); }; }

// ------------------------------------------------------------------ 세겜의 옛 제단 → 아브라함 편 (창 12:6–7)
const ALTAR = D.ALTAR = { x: 193.5, z: -5.5 };
let altarMesh = null; const AM = G.m4();
{ const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { D.altarCol = W.addCol({ x: ALTAR.x, z: ALTAR.z, r: 1.3, y1: W.heightAt(ALTAR.x, ALTAR.z) + 1.2 }); } catch (e) { console.error('dlc altar', e); } }; }
{ const dyn0 = EP.dyn; EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); if (Game.mode !== 'play' || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy()) || (G.DW && G.DW.on && G.DW.on())) return; const p = P(); if (Math.hypot(ALTAR.x - p.x, ALTAR.z - p.z) > 80) return;
    if (!altarMesh) { const g = new G.GB(1207); let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let ly = 0; ly < 4; ly++) { const n = 7 - ly, rad = 1.05 - ly * 0.18; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + ly * 0.4; g.sph(0.3 + r() * 0.1, 6, 4, { at: [Math.cos(a) * rad, 0.2 + ly * 0.3, Math.sin(a) * rad], s: [1.15, 0.72, 1], c: [0x9a9284, 0x8a8276, 0xa8a090][i % 3], flat: true, j: 0.08 }); } }
      g.box(1.25, 0.14, 1.25, { at: [0, 1.32, 0], c: 0x8a8276, j: 0.05 }); g.box(0.5, 0.12, 0.14, { at: [0.1, 1.45, 0.05], ry: 0.5, c: 0x4a3a2a }); g.box(0.46, 0.1, 0.12, { at: [-0.12, 1.47, -0.08], ry: -0.7, c: 0x3a2e22 });
      altarMesh = G.R.mesh(g); }
    G.m4trs(AM, ALTAR.x, Game.W().heightAt(ALTAR.x, ALTAR.z), ALTAR.z, 0.3, 0, 0, 1, 1, 1); list.push({ mesh: altarMesh, m: AM, outline: true }); }; }
(EP.places = EP.places || []).push({ n: '세겜 · 아브라함의 옛 제단', x: ALTAR.x, z: ALTAR.z, when: () => D.ended() });
Game.CTX.push(function (s) { const p = P(); if (D.cur() || p.ride || p.act || Game.cineOn || G.UI.busy() || (s.q && s.q.riding) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy())) return null; const d = Math.hypot(ALTAR.x - p.x, ALTAR.z - p.z); if (d > 3.2) return null;
  if (!D.ended()) return [{ d: d - 0.4, label: '옛 돌 제단 · 증조할아버지 아브라함이 쌓았대요', disabled: true, x: ALTAR.x, z: ALTAR.z, y: 1.2, key: 'dlcAltar' }];
  return [{ d: d - 0.6, label: '아브라함의 제단 앞에 서기', x: ALTAR.x, z: ALTAR.z, y: 1.2, key: 'dlcAltar', noMagnet: true, use: () => { const st = D.st('abraham');
    G.UI.say([{ n: '', t: '세겜 땅 모레 상수리나무 곁, 풀에 덮인 돌 제단입니다. 증조할아버지 아브라함이 이 땅에 처음 들어와 쌓은 제단이에요. 「내가 이 땅을 네 자손에게 주리라」(창 12:7).' },
      { n: '요셉', t: st.done ? '(돌에 손을 얹으니, 아버지께 듣던 그 이야기가 다시 떠오른다.)' : '(돌에 손을 얹었다. 아버지가 불가에서 들려주시던 증조할아버지의 이야기가 눈앞에 그려진다…)', choices: D.storyChoices('abraham', ['이야기를 이어서 떠올리기', '약속의 이야기를 떠올리기', '처음부터 다시 떠올리기']).concat([{ t: '조용히 기도하고 돌아서기', then: () => { P().emote = { k: 'pray', t: 0, dur: 3 }; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(10); } }]) }], null); } }]; });
/* 가나안에 다시 올 수 있다는 것을 한 번 알려 줘요 */
{ const up0 = EP.update; let tT = 3; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; if (!s || (tT -= dt) > 0) return r; tT = 4; try { if (D.ended() && !s.flags.dlcCanaan && Game.mode === 'play' && !G.UI.busy() && !Game.cineOn && !D.cur()) { s.flags.dlcCanaan = 1; (G.UI.pop || G.UI.toast)('가나안 길이 열렸어요', '고센 동쪽 광야를 지나 세겜과 헤브론에 다시 갈 수 있어요 · 세겜에 아브라함의 옛 제단이 있어요', 'star'); } } catch (e) { } return r; }; }
/* helpers the two stories share */
D.Ln = (n, t, e, ref) => ({ n, t, e, ref }); D.T = (t, ref) => ({ n: '', t, ref });
D.card = (kick, title, t, ref) => ({ kick, title, t, ref });
})(window.G);
