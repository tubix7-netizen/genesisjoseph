/* 약속의 길 — 외딴 곳의 사건 · 큰 지도 표시 (v16.7)
   · Out-of-the-way places in Egypt (EP.places2) now have something happening there. When Joseph comes near (55 m) and the place
     is ready, the scene sets itself up; when he finishes it, the place rests for a few days before something happens again.
       광야의 샘 — 흩어진 염소들: a goatherd boy lost three goats; walk up to each (A · 염소 몰기) and lead them back.
       버려진 대상 야영지 — 길 잃은 나그네: a traveler stranded by a sandstorm; give water or food → he marks the places he knows
                         on your map (unfound places show up with their names) + silver.
       갈대숲의 낡은 배 — 갈대에 걸린 배: an old fisherman's boat is stuck in the reeds; push it free (기력 40) → fish.
       피라미드 일꾼 마을 터 — 떠돌이 서기관: a scribe copying old marks asks three riddles; 2 right → 정신력, all right the first
                         time → 깨달음.
       남쪽 모래 언덕 — 별 바라보기 (night): lie on the dune and look up — 창 15:5. 정신력 +25 once a night, 깨달음 the first time.
   · Big map: found places (◆ with name), places you have only heard of (dim, from the traveler), unknown places (?), treasure
     chests you have seen (gold) or opened (grey), and a ! where something is happening. The header counts places and chests.
   API: G.Sites.cur · G.Sites.start(key) (debug) · G.Sites.ready(key) */
'use strict';
(function (G) {
const Game = G.Game, $ = id => document.getElementById(id), rnd = a => a[Math.floor(Math.random() * a.length)], sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const SI = G.Sites = { cur: null };
const EPJ = () => G.EP && G.EP.joseph;
const mine = () => Game.EP() && Game.EP() === EPJ();
const hour = S => S.time % 24, absH = S => S.day * 24 + hour(S), isNight = S => hour(S) >= 19 || hour(S) < 4.5;
const calm = () => Game.cineOn || (G.Cine && G.Cine.on) || G.UI.busy() || G.UI.modal();
const egypt = S => { const E = EPJ(); return !!(E && E.landOf && E.landOf(S) === 'egypt'); };
const site = id => (Game.EP().places2 || []).find(p => p.id === id);
const st = () => { const S = Game.S(); return (S.flags.sev = S.flags.sev || {}); };
const npc = id => Game.ENT.npcs[id];
const W = () => Game.W();
const okAt = (x, z) => { const w = W(); if (w.water && w.heightAt(x, z) < w.water.level + 0.25) return false; if (w.slopeAt && w.slopeAt(x, z) > 0.4) return false; const q = { x, z }; w.collide(q, 0.5, w.heightAt(x, z)); return Math.hypot(q.x - x, q.z - z) < 0.05; };
const spotNear = (cx, cz, r0, r1, seed) => { for (let i = 0; i < 40; i++) { const a = (seed || 0) + i * 2.399, r = r0 + (r1 - r0) * ((i * 0.618) % 1), x = cx + Math.sin(a) * r, z = cz + Math.cos(a) * r; if (okAt(x, z)) return [x, z]; } return [cx + r0, cz]; };
const KIDL = { kid: true, skin: 0xb07848, top: 0xd8c8a0, trim: 0x8a5a3a, hair: 0x2a1810, hairStyle: 'short', belt: 0x6a4a2a };
const TRAV = { skin: 0xb07848, long: true, top: 0x9a8a6a, trim: 0x5a3a24, under: 0xd8c8a0, hair: 0x3a2a1a, beard: 'short', beardCol: 0x3a2a1a, headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x5a3a24, mantle: 0x7a6a50 };
const FISH = { skin: 0x9a6038, top: 0xd8d0c0, sleeveless: true, bottom: 0xd8d0c0, hair: 0xd8d0c4, hairStyle: 'short', beard: 'short', beardCol: 0xd8d0c4, age: 'old', belt: 0x6a4a2a };
const SCRIBE = { skin: 0xa86a40, long: true, top: 0xe8e4dc, trim: 0x2e5a8a, under: 0xe8e4dc, hair: 0x1a1210, hairStyle: 'short', collar: 0x3a8a8a, belt: 0x2e5a8a };

// ------------------------------------------------------------------ the events
const EV = {
  goats: { site: 'oasis', n: '흩어진 염소들', cool: 72,
    setup(c, p) { const [bx, bz] = spotNear(p.x, p.z, 4, 9, 1); c.boy = 'sv_boy'; Game.spawnNPC({ id: c.boy, name: '목동 소년', look: KIDL, x: bx, z: bz, face: 0, prop: 'staff', talkR: 2.6, noBond: true });
      c.goats = []; for (let i = 0; i < 3; i++) { const [gx, gz] = spotNear(p.x, p.z, 14, 26, 0.7 + i * 2.1); const id = 'sv_goat' + i; Game.spawnNPC({ id, name: '흩어진 염소', animal: 'goat', pattern: ['plain', 'black', 'plain'][i], x: gx, z: gz, wander: 2.5, label: '염소 몰기', talkR: 2.4, noBond: true }); c.goats.push(id); }
      c.back = 0; c.ids = [c.boy].concat(c.goats); },
    talk(c, id) { const S = Game.S();
      if (id === c.boy) { if (c.back >= 3) return finish(c); G.UI.say(c.met ? [{ n: '목동 소년', t: `아직 ${3 - c.back}마리가 안 돌아왔어요… 샘 둘레 언덕 쪽에 있을 거예요.` }] : [{ n: '목동 소년', t: '아저씨! 물 먹이러 왔다가 모래바람에 염소들이 다 흩어졌어요. 세 마리나요…' }, { n: '목동 소년', t: '아빠한테 혼나요. 같이 찾아 주실 수 있어요? 가까이 가서 부르면 따라올 거예요.' }], () => { c.met = 1; done(id); }); return true; }
      const n = npc(id); if (!n || n.follow) { done(id); return true; } Game.npcFollow(id, true); n.wander = null; sfx('goat', { vol: 0.6 }); G.UI.toast(`염소가 따라와요 · 소년에게 데려가요 (${c.goats.filter(g => npc(g) && npc(g).follow).length + c.back}/3)`); done(id); return true; },
    tick(c) { const b = npc(c.boy); if (!b) return; for (const g of c.goats) { const n = npc(g); if (!n || !n.follow || n.home) continue; if (Math.hypot(n.x - b.x, n.z - b.z) < 5) { Game.npcFollow(g, false); n.home = 1; n.d.noTalk = true; c.back++; Game.npcWalk(g, b.x + Math.sin(c.back * 2) * 1.6, b.z + Math.cos(c.back * 2) * 1.6, () => { n.wander = { r: 1.5, cx: n.x, cz: n.z, tx: null, wait: 2 }; }, 1.6);
        G.Life && G.Life.bubble(c.boy, c.back >= 3 ? '다 찾았다! 아저씨, 고마워요!' : rnd(['찾았다! 이리 와!', '한 마리 더!']), 3); sfx('goat'); if (c.back >= 3) G.UI.toast('세 마리 다 찾았어요 · 소년에게 말을 걸어요'); } } },
    reward(c) { Game.give('milk', 2, true); Game.give('cheese', 1, true); G.UI.gain('milk', 2); G.UI.gain('cheese', 1); Game.silver(5);
      return [{ n: '목동 소년', t: '세 마리 다 있어요! 아빠가 이거 드리래요. 아니, 제가 드리고 싶어요!' }, { n: '요셉', t: '나도 어릴 때 아버지 양 떼를 쳤단다. 잃은 하나를 찾으면 얼마나 기쁜지 알지.' }]; } },
  stranded: { site: 'camp', n: '길 잃은 나그네', cool: 96,
    setup(c, p) { const [x, z] = spotNear(p.x, p.z, 3, 8, 2); c.man = 'sv_trav'; const n = Game.spawnNPC({ id: c.man, name: '길 잃은 나그네', look: TRAV, x, z, face: 0, prop: 'staff', talkR: 2.8, noBond: true }); n.act = 'sitg'; c.ids = [c.man]; },
    talk(c, id) { const S = Game.S(), foods = Object.keys(S.inv).filter(k => Game.ITEMS[k] && Game.ITEMS[k].cat === 'food' && S.inv[k] > 0); const ch = [];
      if (S.water > 0) ch.push({ t: `물 건네기 (물 ${S.water})`, then: () => { S.water--; c.gave = '물'; finish(c); } });
      if (foods.length) { const k = foods.sort((a, b) => (Game.ITEMS[b].stam || 0) - (Game.ITEMS[a].stam || 0))[0]; ch.push({ t: `${Game.ITEMS[k].n} 건네기`, then: () => { Game.take(k, 1); c.gave = Game.ITEMS[k].n; finish(c); } }); }
      ch.push({ t: ch.length ? '나중에요' : '먹을 것과 물을 구해 올게요', then: () => done(id) });
      G.UI.say([{ n: '길 잃은 나그네', t: '모래바람에 일행을 놓쳤소… 사흘째 이 천막 그늘에 숨어 있었다오. 물이든 먹을 것이든, 조금만 나눠 줄 수 있겠소?', choices: ch }], null); return true; },
    reward(c) { const S = Game.S(), f = S.flags.found || {}, h = S.flags.heard = S.flags.heard || {}; let k = 0; for (const p of Game.EP().places2 || []) if (!f[p.id] && !h[p.id]) { h[p.id] = 1; k++; } Game.silver(10);
      return [{ n: '', t: `나그네가 ${c.gave}을(를) 받아 들고 한참을 말없이 있었습니다.` }, { n: '길 잃은 나그네', t: '당신 덕에 살았소. 나는 이 광야를 이십 년 넘게 다녔소. 내가 아는 곳들을 알려 주리다.' },
        { n: '', t: k ? `지도에 나그네가 들려준 곳 ${k}곳이 표시되었어요 · 은 10` : '나그네가 은 10을 쥐여 줍니다. 「당신은 벌써 다 다녀 봤구려!」' }]; } },
  boat: { site: 'boat', n: '갈대에 걸린 배', cool: 72,
    setup(c, p) { const [x, z] = spotNear(p.x, p.z, 2.5, 7, 3); c.man = 'sv_fish'; Game.spawnNPC({ id: c.man, name: '늙은 어부', look: FISH, x, z, face: 0, talkR: 2.8, noBond: true }); c.ids = [c.man]; },
    talk(c, id) { const P = Game.P, ok = P.stam >= 40;
      G.UI.say([{ n: '늙은 어부', t: '어이, 젊은이! 배가 갈대에 걸려서 꿈쩍을 안 하네. 내 팔로는 이제 어림없구먼…', choices: [{ t: ok ? '배 밀어 주기 (기력 40)' : '배 밀어 주기 (기력이 모자라요)', then: () => { if (!ok) { G.UI.toast('기력이 40 이상 있어야 해요 · 먹거나 물을 마셔요'); done(id); return; } G.Vitals && G.Vitals.spend(40); P.emote = { k: 'pick', t: 0, dur: 1.6 }; G.Life && G.Life.bubble(id, '하나, 둘, 셋… 영차!', 2); sfx('splash', { vol: 0.7 }); G.FX && G.FX.burst(P.x, P.y + 0.3, P.z, 14, { c: [0.75, 0.9, 1], sp: 1.6, up: 2.2, size: 0.06, g: -6, life: 0.8 }); setTimeout(() => finish(c), 1300); } }, { t: '나중에요', then: () => done(id) }] }], null); return true; },
    reward() { Game.give('carp', 3, true); G.UI.gain('carp', 3); Game.silver(3);
      return [{ n: '늙은 어부', t: '빠졌다! 허허, 당신 팔뚝은 나일 물소 같구려. 오늘 잡은 것 좀 가져가시오.' }, { n: '요셉', t: '조심히 가세요. 오늘도 그물이 가득하길 빌게요.' }]; } },
  scribe: { site: 'pyr', n: '떠돌이 서기관', cool: 96,
    setup(c, p) { const [x, z] = spotNear(p.x, p.z, 3, 9, 4); c.man = 'sv_scribe'; const n = Game.spawnNPC({ id: c.man, name: '떠돌이 서기관', look: SCRIBE, x, z, face: 0, talkR: 2.8, noBond: true }); n.act = 'sitg'; c.ids = [c.man]; },
    talk(c, id) { G.UI.say([{ n: '떠돌이 서기관', t: '돌에 새겨진 옛 글자를 옮겨 적고 있소. 심심하던 참인데, 수수께끼 세 개 맞혀 보겠소?', choices: [{ t: '좋아요', then: () => setTimeout(() => quiz(c, id), 30) }, { t: '다음에요', then: () => done(id) }] }], null); return true; },
    reward(c) { const S = Game.S(), first = !S.flags.scribeAll && c.right === 3; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(20); if (first) { S.flags.scribeAll = 1; Game.insight && Game.insight(1, '서기관의 수수께끼'); }
      return [{ n: '떠돌이 서기관', t: c.right === 3 ? '셋 다! 총리께서 지혜롭다더니 소문이 맞구려.' : '둘이나 맞혔구려. 제법이오.' }, { n: '', t: '마음이 맑아졌어요 · 정신력 +20' + (first ? ' · 깨달음 +1' : '') }]; } },
  stars: { site: 'dune', n: '별 바라보기', night: true, cool: 20, noNpc: true,
    setup(c) { c.ids = []; }, talk() { return false; },
    reward(c) { const S = Game.S(), first = !S.flags.starsSeen; G.Vitals && G.Vitals.mindGain && G.Vitals.mindGain(25); if (first) { S.flags.starsSeen = 1; Game.insight && Game.insight(1, '모래 언덕의 별'); }
      return [{ n: '', t: '모래 언덕에 누워 하늘을 올려다봅니다. 별이 쏟아질 듯 많습니다.' }, { n: '', t: '「하늘을 우러러 뭇별을 셀 수 있나 보라… 네 자손이 이와 같으리라」 (창 15:5)' },
        { n: '요셉', t: '할아버지 아브라함도 이 별을 보셨겠지. 하나님, 저는 아직 다 알 수 없지만, 그 약속 안에 제가 있어요.' }, { n: '', t: '마음이 고요해졌어요 · 정신력 +25' + (first ? ' · 깨달음 +1' : '') }]; } } };
SI.EV = EV;
const QUIZ = [['바로의 꿈에 나일 강에서 올라온 살진 소는 몇 마리였을까요?', ['일곱', '셋', '열둘'], 0], ['애굽 사람들이 글을 쓰는, 갈대로 만든 종이는?', ['양피지', '파피루스', '점토판'], 1],
  ['나일 강이 넘친 뒤 물이 빠지면 무엇을 할 때일까요?', ['씨를 뿌릴 때', '곡식을 거둘 때', '집을 지을 때'], 0], ['총리 요셉의 맏아들 이름은?', ['에브라임', '므낫세', '베냐민'], 1],
  ['곳간에 곡식을 쌓아 둔 것은 몇 해 흉년을 위해서일까요?', ['세 해', '일곱 해', '열 해'], 1], ['요셉을 애굽으로 데려온 상인들은 누구였을까요?', ['이스마엘 사람들', '블레셋 사람들', '시돈 사람들'], 0],
  ['애굽 왕을 부르는 이름은?', ['바로', '아비멜렉', '가이사'], 0], ['요셉에게 바로의 꿈을 처음 알려 준 사람은?', ['떡 굽는 관원장', '술 맡은 관원장', '보디발'], 1]];
function quiz(c, id) { const qs = QUIZ.slice().sort(() => Math.random() - 0.5).slice(0, 3); c.right = 0; let i = 0;
  const ask = () => { if (i >= 3) { if (c.right >= 2) return finish(c); G.UI.say([{ n: '떠돌이 서기관', t: `셋 중에 ${c.right}개라… 다음에 다시 와 보시오. 나는 며칠 더 여기 있을 거요.` }], () => done(id)); return; }
    const [q, opts, ans] = qs[i++]; G.UI.say([{ n: '떠돌이 서기관', t: `${i}번째 · ${q}`, choices: opts.map((o, k) => ({ t: o, then: () => { const ok = k === ans; if (ok) c.right++; sfx(ok ? 'coin' : 'click'); setTimeout(() => G.UI.say([{ n: '떠돌이 서기관', t: ok ? rnd(['맞소!', '옳거니!', '그렇지!']) : `아니오, 「${opts[ans]}」이오.` }], ask), 30); } })) }], null); };
  ask(); }
function done(id) { const n = npc(id); if (n) n.talking = false; }
function finish(c) { const ev = EV[c.key], S = Game.S(); if (c.fin) return; c.fin = 1; const lines = ev.reward(c); const s = st(); const r = s[c.key] = s[c.key] || {}; r.n = (r.n || 0) + 1; r.cool = absH(S) + ev.cool;
  sfx('quest'); G.UI.say(lines, () => { for (const id of c.ids) done(id); if (r.n === 1) G.UI.featCard && G.UI.featCard('site', { kick: '외딴 곳의 이야기', n: ev.n, ic: 'map', d: `${site(ev.site) ? site(ev.site).n : ''}에서 있었던 일 · 며칠 뒤에 다시 가 보면 또 무슨 일이 있을지 몰라요` });
    c.leaveT = 25; }); }
SI.ready = key => { const ev = EV[key], S = Game.S(), r = st()[key]; if (ev.night && !isNight(S)) return false; return !r || !r.cool || absH(S) >= r.cool; };
SI.start = function (key) { const ev = EV[key], p = site(ev.site); if (!p || SI.cur) return null; const c = { key, x: p.x, z: p.z, ids: [] }; ev.setup(c, p); SI.cur = c; return c; };
function clear() { const c = SI.cur; if (!c) return; for (const id of c.ids) { if (npc(id)) { Game.npcFollow(id, false); Game.removeNPC(id); } } SI.cur = null; }
SI.clear = clear;

// talking to the people (and goats) of an event
const talk0 = G.Life && G.Life.talk;
if (G.Life) G.Life.talk = function (id) { const c = SI.cur; if (c && c.ids.includes(id) && !c.fin) { const r = EV[c.key].talk(c, id); if (r) return true; } if (c && c.fin && c.ids.includes(id)) { const n = npc(id); if (n && !n.d.animal) { G.UI.say([{ n: n.name, t: rnd(['고마웠소. 하나님이 당신과 함께하시길.', '이 은혜 잊지 않으리다.', '조심히 가시오!']) }], () => done(id)); return true; } } return talk0 ? talk0.apply(this, arguments) : false; };

// the stars: an action on the dune top at night
Game.CTX.push(function (S) { const P = Game.P; if (!mine() || P.ride || P.swim || P.act || Game.cineOn) return null; const p = site('dune'); if (!p || !isNight(S) || !egypt(S)) return null;
  const d = Math.hypot(p.x - P.x, p.z - P.z); if (d > 9) return null; const r = st().stars; if (r && r.cool && absH(S) < r.cool) return null;
  return [{ d: d - 3, label: '별 바라보기', x: P.x, z: P.z, y: 1.2, key: 'sv:stars', reach: 9, use: () => lookUp(p) }]; });
function lookUp(p) { const P = Game.P, w = W(); const c = { key: 'stars', ids: [] };
  G.UI.fade(() => { P.emote = { k: 'lie', t: 0, dur: 1e4 }; P.vx = P.vz = 0; const gy = w.heightAt(P.x, P.z); Game.cineCam = { x: P.x - Math.sin(P.face) * 1.2, y: gy + 1.0, z: P.z - Math.cos(P.face) * 1.2, lx: P.x + Math.sin(P.face) * 8, ly: gy + 14, lz: P.z + Math.cos(P.face) * 8, fov: 1.25 }; Game.noDlgCam = true; },
    () => { const lines = EV.stars.reward(c); const s = st(), r = s.stars = s.stars || {}; r.n = (r.n || 0) + 1; r.cool = absH(Game.S()) + EV.stars.cool; sfx('quest', { pitch: 0.9 });
      G.UI.say(lines, () => { G.UI.fade(() => { Game.cineCam = null; Game.noDlgCam = false; P.emote = null; }); if (r.n === 1) G.UI.featCard && G.UI.featCard('site', { kick: '외딴 곳의 이야기', n: '모래 언덕의 별', ic: 'star', d: '밤마다 이 언덕에 오면 별을 바라볼 수 있어요' }); }); }); }

// ------------------------------------------------------------------ spawning & cleanup
let tT = 0;
SI.update = function (dt) { const S = Game.S(); if (!S || !S.flags || Game.mode !== 'play' || !mine()) return; const P = Game.P, c = SI.cur;
  if (c) { if (!c.fin && EV[c.key].tick) EV[c.key].tick(c); if (c.leaveT !== undefined && (c.leaveT -= dt) <= 0 && Math.hypot(c.x - P.x, c.z - P.z) > 40) { clear(); return; }
    if (Math.hypot(c.x - P.x, c.z - P.z) > 120 && !calm()) { if (!c.fin) { const r = st()[c.key] = st()[c.key] || {}; r.cool = absH(S) + 12; } clear(); } }
  tT -= dt; if (tT > 0) return; tT = 0.5;
  const f = S.flags.chSeen = S.flags.chSeen || {}; if (G.Loot) for (const b of G.Loot.list) if (b.k === 'chest' && !f[b.id] && Math.hypot(b.x - P.x, b.z - P.z) < 14) f[b.id] = 1;
  if (SI.cur || calm() || !egypt(S)) return;
  for (const key in EV) { const ev = EV[key]; if (ev.noNpc) continue; const p = site(ev.site); if (!p || p.x >= 112) continue; const d = Math.hypot(p.x - P.x, p.z - P.z); if (d > 55 || d < 14 || !SI.ready(key)) continue; SI.start(key); break; } };
const reset0 = G.Loot && G.Loot.reset; if (G.Loot) G.Loot.reset = function () { SI.cur = null; return reset0.apply(this, arguments); };

// ------------------------------------------------------------------ the big map
G.UI.mapHead = function () { const S = Game.S(), E = Game.EP(); const ps = E.places2 || []; if (!ps.length) return '끌어서 움직이고 두 손가락으로 확대해요 · 누르면 그곳을 표시해요';
  const f = S.flags.found || {}, ch = (G.Loot ? G.Loot.list : []).filter(b => b.k === 'chest'), op = ch.filter(b => b.open).length;
  return `◆ 찾은 곳 ${ps.filter(p => f[p.id]).length}/${ps.length} · ▣ 보물상자 ${op}/${ch.length} · ! 무슨 일이 있는 곳 · 누르면 그곳을 표시해요`; };
G.UI.mapExtra = function (c, sx, sz, k) { const S = Game.S(), E = Game.EP(); if (!E || !E.places2) return; const f = S.flags.found || {}, h = S.flags.heard || {}, seen = S.flags.chSeen || {};
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const p of E.places2) { const x = sx(p.x), y = sz(p.z);
    if (f[p.id] || h[p.id]) { const known = !!f[p.id]; c.save(); c.globalAlpha = known ? 1 : 0.7; c.translate(x, y); c.rotate(Math.PI / 4); c.fillStyle = known ? '#ffd24a' : '#c8b88a'; c.strokeStyle = '#2a1a08'; c.lineWidth = 2; c.fillRect(-4.5, -4.5, 9, 9); c.strokeRect(-4.5, -4.5, 9, 9); c.restore();
      c.font = '600 11.5px "IBM Plex Sans KR",sans-serif'; c.lineWidth = 3.2; c.strokeStyle = 'rgba(10,14,28,.85)'; const t = known ? p.n : p.n + ' (소문)'; c.strokeText(t, x, y + 14); c.fillStyle = known ? '#ffe9b0' : '#d8ccb0'; c.fillText(t, x, y + 14); }
    else { c.font = '800 13px sans-serif'; c.lineWidth = 3; c.strokeStyle = 'rgba(10,14,28,.7)'; c.strokeText('?', x, y); c.fillStyle = 'rgba(244,232,204,.55)'; c.fillText('?', x, y); } }
  if (G.Loot) for (const b of G.Loot.list) { if (b.k !== 'chest' || !(b.open || seen[b.id])) continue; const x = sx(b.x), y = sz(b.z) - (k > 2 ? 0 : 0); c.fillStyle = b.open ? '#8a8478' : '#e8b53a'; c.strokeStyle = '#2a1a08'; c.lineWidth = 1.5; c.fillRect(x - 5, y - 3.5, 10, 7); c.strokeRect(x - 5, y - 3.5, 10, 7); c.beginPath(); c.moveTo(x - 5, y - 0.5); c.lineTo(x + 5, y - 0.5); c.stroke(); }
  const flag = (x, y, on) => { c.font = '900 15px sans-serif'; c.lineWidth = 3.5; c.strokeStyle = 'rgba(10,14,28,.9)'; c.strokeText('!', x + 9, y - 9); c.fillStyle = on ? '#ff8a5a' : 'rgba(255,170,120,.7)'; c.fillText('!', x + 9, y - 9); };
  if (egypt(S)) for (const key in EV) { const ev = EV[key], p = site(ev.site); if (!p || p.x >= 112) continue; const on = SI.cur && SI.cur.key === key && !SI.cur.fin; if (on || ((f[p.id] || h[p.id]) && SI.ready(key) && !(SI.cur && SI.cur.key === key))) flag(sx(p.x), sz(p.z), on); } };
})(window.G);
