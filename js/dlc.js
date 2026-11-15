/* 약속의 길 — v18.59 조상들의 이야기 (dlc.js) · 두 DLC가 함께 쓰는 틀
   요셉 편을 마친 뒤, 「꿈의 세계」에 들어가듯 조상들의 이야기 속으로 들어가요. 그 안에서는 야곱이나 아브라함이 되어 걸어요.
   · 「창세기 야곱 편 · 라헬을 위한 일곱 해」(dlc_jacob.js): 고센의 부탁 다섯을 모두 마친 뒤, 고센의 아버지 야곱에게 말을 걸면 열려요.
   · 「창세기 아브라함 편 · 약속의 별」(dlc_abraham.js): 본편을 마치면 가나안으로 다시 갈 수 있어요. 세겜 들판의 옛 제단 앞에 서면 열려요.
   · 이야기 속에서는 배고픔 · 추위 · 더위 · 밤샘이 없어요. 「이야기에서 나오기」로 언제든 돌아오고, 한 만큼은 남아요.
   틀이 맡는 것: 들어가고 나오기(자리 · 옷 · 시간 · 손에 든 것 기억), 주인공 이름 바꾸기, 본편 끝난 뒤 가나안 길 열기, 세겜의 제단, 목표 줄.
   API: G.DLC.add(def) · G.DLC.enter(key) · G.DLC.leave() · G.DLC.cur() · G.DLC.st(key) (그 이야기의 저장 값) */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ls = G.Lands; if (!Game || !EP || !Ls) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const D = G.DLC = { defs: {} };
const HERO0 = EP.hero;
const done = id => { const s = S(); return !!(s && s.side && s.side.done && s.side.done[id] !== undefined); };
D.ended = () => { const s = S(); return !!s && s.step === 'j_end'; };
D.cur = () => { const s = S(); return (s && s.flags && s.flags.dlc && s.flags.dlc.key) || null; };
D.st = key => { const s = S(), a = s.flags.dlcSt || (s.flags.dlcSt = {}); return a[key] || (a[key] = {}); };
D.add = function (def) { D.defs[def.key] = def; };
/* a finished story can be heard again from the start (what was earned stays) */
D.restart = key => { const s = S(), a = s.flags.dlcSt || (s.flags.dlcSt = {}), o = a[key] || {}; a[key] = { done: o.done, best: o.best, again: (o.again | 0) + 1 }; };
const land = key => (Ls.list || []).find(l => l.key === D.defs[key].land);
const FLAGS = () => ['byblos', 'kaftor'].concat((Ls.list || []).map(l => 'land_' + l.key));
function apply(def) { EP.hero = def ? (typeof def.hero === 'function' ? def.hero(D.st(def.key)) : def.hero) : HERO0; }
D.rename = n => { if (D.cur()) EP.hero = n; };
D.enter = function (key) { const def = D.defs[key], s = S(), p = P(), L = land(key); if (!def || !L || D.cur()) return;
  if (p.ride || (s.q && s.q.riding)) { G.UI.toast('탈것에서 먼저 내려 주세요'); return; } if ((G.Phys && G.Phys.held) || p.carry) { G.UI.toast('들고 있는 것을 먼저 내려놓아요'); return; }
  Game.save(true);
  G.UI.fade(() => { s.flags.dlc = { key, x: p.x, z: p.z, f: p.face, o: s.outfit, t: s.time, h: s.hand || null, w: s.wx ? s.wx.k : 'clear' }; s.hand = null;
    for (const f of FLAGS()) s.flags[f] = 0; s.flags['land_' + L.key] = 1; apply(def); Game.setOutfit(def.outfit);
    const st = L.stage(), sp = (def.spawn && def.spawn(D.st(key))) || [0, 0, 0]; Game.teleport(st.x + sp[0], st.z + sp[1], sp[2] || 0); p.y = p.airTop = st.y + (sp[3] || 0); sfx('insight', { pitch: 0.8, vol: 0.6 });
    if (def.onEnter) try { def.onEnter(D.st(key)); } catch (e) { console.error('dlc', e); } }, () => { if (def.intro) try { def.intro(D.st(key)); } catch (e) { console.error('dlc', e); } G.UI.quest && G.UI.quest(); }); };
D.leave = function (cb) { const s = S(), d = s.flags.dlc; if (!d) { cb && cb(); return; } const def = D.defs[d.key], L = land(d.key);
  G.UI.fade(() => { if (def && def.onLeave) try { def.onLeave(D.st(d.key)); } catch (e) { console.error('dlc', e); } s.flags['land_' + L.key] = 0; s.flags.dlc = null; apply(null); Game.setOutfit(d.o); s.time = d.t; s.hand = d.h; P().emote = null; P().cpose = null;
    Game.teleport(d.x, d.z, d.f); if (G.Weather && G.Weather.set) try { G.Weather.set(d.w || 'clear', 3); } catch (e) { } }, () => { G.UI.quest && G.UI.quest(); Game.save(true); cb && cb(); }); };
/* a loaded save that is inside a story: the hero's name again */
{ const ol = EP.onLoad; EP.onLoad = function () { const r = ol ? ol.apply(this, arguments) : undefined; try { const k = D.cur(); apply(k ? D.defs[k] : null); } catch (e) { } return r; }; }
/* inside a story nothing wears him down, and the dream button stays shut */
{ const cs = EP.calmSurv; EP.calmSurv = function (s) { return !!D.cur() || (cs ? cs.apply(this, arguments) : false); }; }
if (G.DW && G.DW.enter) { const e0 = G.DW.enter; G.DW.enter = function () { if (D.cur()) { G.UI.toast('이야기 속에서는 꿈의 세계에 들어갈 수 없어요'); return; } return e0.apply(this, arguments); }; }
if (G.Rest) { const j0 = G.Rest.judge; G.Rest.judge = function () { const j = j0.apply(this, arguments); if (D.cur()) { j.block = ''; j.q = 'full'; } return j; }; }
/* v18.59 본편을 마치면 가나안 길이 다시 열려요 (세겜 · 헤브론) */
{ const lo = EP.landOf; EP.landOf = function (s) { if (s && s.step === 'j_end') return null; return lo ? lo.apply(this, arguments) : null; }; }

// ------------------------------------------------------------------ 고센의 야곱 → 야곱 편
const GOSHEN_Q = ['g_lamb', 'g_tent', 'g_bread', 'g_story', 'g_benj'];
D.jacobOpen = () => D.ended() && GOSHEN_Q.every(done);
{ const lt0 = G.Life.talk; G.Life.talk = function (id) { const s = S();
    if (id === 'jacob' && !D.cur() && D.defs.jacob && D.ended() && !(G.DW && G.DW.on && G.DW.on())) { const n = Game.npc('jacob'), fin = () => { if (n) n.talking = false; };
      if (!D.jacobOpen()) { if (!s.flags.dlcJHint) { s.flags.dlcJHint = 1; const left = GOSHEN_Q.filter(q => !done(q)).length; G.UI.say([{ n: n.name, t: '요셉아, 네 형들과 조카들이 너를 찾더구나. 고센의 일을 먼저 돌봐 다오. 그 뒤에… 이 아비가 젊은 날 하란에서 지낸 이야기를 들려주마.' }, { n: '', t: `(고센의 부탁 다섯 가운데 ${left}개가 남았어요. 모두 마치면 아버지의 이야기가 열려요.)` }], fin); return true; } return lt0.apply(this, arguments); }
      const st = D.st('jacob'); G.UI.say([{ n: n.name, t: st.done ? '하란의 일곱 해 이야기를 또 듣고 싶으냐? 허허, 몇 번을 해도 그 일곱 해는 며칠 같구나.' : st.ch ? '어디까지 이야기했더라… 그래, 하란이었지. 이어서 들려주마.' : '요셉아, 이리 앉거라. 네 어미 라헬을 얻으려고 이 아비가 하란에서 일곱 해를 섬긴 이야기를 들려주마.',
        choices: [{ t: st.ch && !st.done ? '아버지의 이야기를 이어서 듣기 (창세기 야곱 편)' : st.done ? '처음부터 다시 듣기 (창세기 야곱 편)' : '아버지의 젊은 날 이야기 듣기 (창세기 야곱 편)', then: () => { fin(); if (st.done) D.restart('jacob'); setTimeout(() => D.enter('jacob'), 40); } }, { t: '다른 이야기를 나눠요', then: () => { fin(); setTimeout(() => lt0.call(G.Life, id), 40); } }, { t: '다음에 들을게요', then: fin }] }], null); return true; }
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
      { n: '요셉', t: st.done ? '(돌에 손을 얹으니, 아버지께 듣던 그 이야기가 다시 떠오른다.)' : '(돌에 손을 얹었다. 아버지가 불가에서 들려주시던 증조할아버지의 이야기가 눈앞에 그려진다…)', choices: [{ t: st.ch && !st.done ? '이야기를 이어서 떠올리기 (창세기 아브라함 편)' : st.done ? '처음부터 다시 떠올리기 (창세기 아브라함 편)' : '약속의 이야기를 떠올리기 (창세기 아브라함 편)', then: () => { if (st.done) D.restart('abraham'); setTimeout(() => D.enter('abraham'), 40); } }, { t: '조용히 기도하고 돌아서기', then: () => { P().emote = { k: 'pray', t: 0, dur: 3 }; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(10); } }] }], null); } }]; });
/* 가나안에 다시 올 수 있다는 것을 한 번 알려 줘요 */
{ const up0 = EP.update; let tT = 3; EP.update = function (dt, s) { const r = up0 ? up0.apply(this, arguments) : undefined; if (!s || (tT -= dt) > 0) return r; tT = 4; try { if (D.ended() && !s.flags.dlcCanaan && Game.mode === 'play' && !G.UI.busy() && !Game.cineOn && !D.cur()) { s.flags.dlcCanaan = 1; (G.UI.pop || G.UI.toast)('가나안 길이 열렸어요', '고센 동쪽 광야를 지나 세겜과 헤브론에 다시 갈 수 있어요 · 세겜에 아브라함의 옛 제단이 있어요', 'star'); } } catch (e) { } return r; }; }
/* helpers the two stories share */
D.Ln = (n, t, e, ref) => ({ n, t, e, ref }); D.T = (t, ref) => ({ n: '', t, ref });
D.card = (kick, title, t, ref) => ({ kick, title, t, ref });
D.exitRow = () => ({ t: '「이야기에서 나오기」는 이야기꾼 곁에서 (한 만큼은 남아요)', ok: false });
})(window.G);
