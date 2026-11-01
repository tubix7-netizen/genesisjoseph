/* 약속의 길 — 행적과 평판 (v18.0, 엔진·연출 업그레이드 문서의 P6; 레드 데드 리뎀션 2의 명예·NPC 기억을 성경 주제로).
   The world now remembers what the hero does, and only what somebody could see:
   · DEEDS   — help (a villager's favour done), share (a gift), honest (a lost lamb brought back), harm (a jar or pot he threw breaks),
               patience (a choice of character in the story: 「맡기기」). Each is written down with where, when and WHO SAW IT.
   · WITNESS — a villager who is within 20 m, awake, with a clear line of sight (and looking towards it, within about 70°) sees it; the one it
               was done to always does. Nobody saw it → it is only written down: no rumour, no reputation.
   · RUMOUR  — a witness who stands near a neighbour tells it (speech bubble; up to three tellings per deed, for a week). Whoever heard it
               remembers it and mentions it the next time the hero talks to them (once each).
   · REPUTATION per village (S.rep[village] = { kind, trust, bad }) moves slowly with the deeds: it shows in greetings, in what merchants pay (±10 %),
               and goes into the free-conversation prompt (「이 마을이 아는 것」).
   · CHARACTER — a story choice (the prison, Gen 40) is kept in S.flags.char ('trust' | 'protest') and answered later in the story.
   Saved in the game state (S.deeds: last 200, S.rep, S.flags.char). Off: ?deeds=0. API: G.Deeds.rec(kind, targetNpc, {x, z}) · G.Deeds.rep() · G.Deeds.char(k). */
'use strict';
(function (G) {
const Game = G.Game, clamp = (v, a, b) => v < a ? a : v > b ? b : v, rnd = a => a[Math.floor(Math.random() * a.length)];
const D = G.Deeds = { on: !/[?&]deeds=0\b/.test(location.search), stats: { rec: 0, seen: 0, unseen: 0, told: 0, remarks: 0 } };
const S = () => Game.S(), hero = () => (Game.EP() && Game.EP().hero) || '요셉';
const hasJong = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c % 28 !== 0; }, J = (w, a, b) => w + (hasJong(w) ? a : b); // Korean particles follow the last sound: 요셉이/가, 은/는, 을/를
const store = () => { const s = S(); if (!s) return null; s.deeds = s.deeds || []; s.rep = s.rep || {}; return s; };

// ------------------------------------------------------------------ where / who
function villageAt(x, z) { const EP = Game.EP(); let best = null, bd = 80; for (const v of EP.villages || []) { const d = Math.hypot(v.x - x, v.z - z); if (d < bd) { bd = d; best = v; } } return best; }
D.village = () => villageAt(Game.P.x, Game.P.z);
function sees(n, x, z) { // can this person see something at (x, z)?
  if (!n.vis || n.d.animal || n.sleep || n.schedHidden || n.pass) return false; const dx = x - n.x, dz = z - n.z, d = Math.hypot(dx, dz); if (d > 20) return false; if (d > 1.5) { const f = Math.sin(n.face) * dx / d + Math.cos(n.face) * dz / d; if (f < 0.33) return false; }
  const W = Game.W(); if (W && W.ray && d > 2 && W.ray(n.x, n.y + 1.6, n.z, x, W.heightAt(x, z) + 1.0, z) < 0.97) return false; return true;
}
D.rep = function (vid) { const s = store(); if (!s) return { kind: 0, trust: 0, bad: 0 }; vid = vid || (D.village() || {}).id || 'wild'; return s.rep[vid] || (s.rep[vid] = { kind: 0, trust: 0, bad: 0 }); };

// ------------------------------------------------------------------ recording
D.rec = function (kind, target, o) {
  const s = store(); if (!D.on || !s || Game.mode !== 'play') return null; o = o || {}; const P = Game.P, x = o.x !== undefined ? o.x : P.x, z = o.z !== undefined ? o.z : P.z, v = villageAt(x, z);
  const seen = []; if (target && Game.ENT.npcs[target.id || target]) { const t = Game.ENT.npcs[target.id || target]; if (!t.d.animal) seen.push(t.id); }
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (seen.includes(id) || !n.d.folk) continue; if (sees(n, x, z)) seen.push(id); }
  const d = { id: (s.deedN = (s.deedN || 0) + 1), kind, day: s.day, x: Math.round(x), z: Math.round(z), v: v ? v.id : null, target: target ? (target.id || target) : null, what: o.what || null, seen, knows: [], rem: [], told: 0 };
  s.deeds.push(d); if (s.deeds.length > 200) s.deeds.splice(0, s.deeds.length - 200); D.stats.rec++;
  if (seen.length) { D.stats.seen++; const r = D.rep(v ? v.id : 'wild'); if (kind === 'help') r.kind += 1; else if (kind === 'share') r.kind += 0.5; else if (kind === 'honest') { r.trust += 1; r.kind += 0.3; } else if (kind === 'harm') r.bad += 1; }
  else D.stats.unseen++;
  return d;
};
D.char = function (k, slot) { const s = store(); if (!s) return; if (slot) { (s.flags.chars = s.flags.chars || {})[slot] = k; return; } s.flags.char = k; if (k === 'trust') D.rec('patience', null, {}); }; // v18.8: several story choices of character — slot 'coat' (the field), 'credit' (before Pharaoh); no slot = the prison one

// ------------------------------------------------------------------ the rumour
const TOLD = {
  help: (nm, tn) => [`${J(nm, '이', '가')} ${tn}의 부탁을 들어줬다지 뭐요.`, `${J(nm, '은', '는')} 이웃의 부탁을 마다하지 않는다더군.`],
  share: (nm, tn) => [`${J(nm, '이', '가')} ${tn}에게 선물을 줬대요.`, `${J(nm, '은', '는')} 인심이 후하다던데.`],
  honest: (nm) => [`${J(nm, '이', '가')} 잃은 양을 그대로 돌려줬다더군.`, `${J(nm, '은', '는')} 남의 것에 손을 대지 않는 사람이래요.`],
  harm: (nm) => [`${J(nm, '이', '가')} 남의 항아리를 깨뜨렸다던데…`, `${J(nm, '을', '를')} 조금 조심해야겠어. 물건을 함부로 다룬다던데.`]
};
let tT = 4, rr = 0;
D.update = function (dt) {
  const s = store(); if (!D.on || !s || Game.mode !== 'play' || Game.cineOn || (G.UI && G.UI.busy())) return; tT -= dt; if (tT > 0) return; tT = 5 + Math.random() * 4;
  const P = Game.P, cand = s.deeds.filter(d => d.seen.length && d.told < 3 && s.day - d.day <= 7 && d.kind !== 'patience'); if (!cand.length) return; const d = cand[(rr++) % cand.length];
  const near = Object.values(Game.ENT.npcs).filter(n => n.vis && n.d.folk && !n.talking && !n.walk && Math.hypot(n.x - P.x, n.z - P.z) < 24);
  for (const w of near) { if (!d.seen.includes(w.id)) continue; const b = near.find(o => o !== w && !d.knows.includes(o.id) && !d.seen.includes(o.id) && Math.hypot(o.x - w.x, o.z - w.z) < 5); if (!b) continue;
    const tn = d.target && Game.ENT.npcs[d.target] ? Game.ENT.npcs[d.target].name.split(' ').pop() : '이웃'; const f = TOLD[d.kind]; if (!f) return;
    G.Life.bubble(w.id, rnd(f(hero(), tn)), 3.8); d.knows.push(b.id); d.told++; D.stats.told++; return; }
};
// what a person says about it the next time the hero speaks to them (once for each deed)
D.remark = function (n) {
  const s = store(); if (!D.on || !s) return ''; const nm = hero();
  const d = s.deeds.find(x => (x.seen.includes(n.id) || x.knows.includes(n.id)) && !x.rem.includes(n.id) && x.kind !== 'patience' && s.day - x.day <= 14);
  if (d) { d.rem.push(n.id); D.stats.remarks++; return ' ' + ({ help: `소문 들었소. 이웃의 부탁을 들어주셨다지요? 고맙소.`, share: `선물을 나눠 주고 다니신다는 소문이 자자하오.`, honest: `남의 양을 그대로 돌려주셨다지요. 요즘 보기 드문 일이오.`, harm: `…항아리를 깨뜨리셨다는 말을 들었소. 조심해 주시오.` }[d.kind] || '').replace(/요셉/g, nm); }
  const r = D.rep(n.village ? n.village.id : undefined), key = 'rep:' + n.id; if (s.flags[key] !== s.day && n.d.folk) { if (r.kind - r.bad * 1.5 >= 3) { s.flags[key] = s.day; return ' 이 마을에서 당신 평이 아주 좋소.'; } if (r.bad >= 2 && r.bad > r.kind) { s.flags[key] = s.day; return ' …듣자 하니 말썽이 있었다더군요.'; } }
  return '';
};
// a line for the free-conversation prompt
D.note = function (n) {
  const s = store(); if (!D.on || !s) return ''; const nm = hero(), r = D.rep(n.village ? n.village.id : undefined), mine = s.deeds.filter(x => (x.seen.includes(n.id) || x.knows.includes(n.id)) && s.day - x.day <= 14 && x.kind !== 'patience').slice(-3);
  const parts = mine.map(x => ({ help: '이웃의 부탁을 들어줬다', share: '선물을 나눠 줬다', honest: '잃은 양을 그대로 돌려줬다', harm: '남의 항아리를 깨뜨렸다' }[x.kind])).filter(Boolean);
  let t = ''; if (parts.length) t += ` 너는 ${J(nm, '이', '가')} ${parts.join(', ')}는 것을 알고 있다.`; if (r.kind - r.bad * 1.5 >= 3) t += ` 이 마을 사람들은 ${J(nm, '을', '를')} 좋게 본다.`; else if (r.bad >= 2 && r.bad > r.kind) t += ` 이 마을 사람들은 ${J(nm, '을', '를')} 조심스러워한다.`; return t;
};
// merchants pay a little more to somebody the village thinks well of (and less to a troublemaker)
D.sellMul = () => { const r = D.rep(); return D.on ? 1 + clamp((r.kind + r.trust * 0.5 - r.bad * 1.5) * 0.015, -0.1, 0.1) : 1; };
const price0 = Game.price; Game.price = function (k, mul) { return Math.max(1, Math.round(price0(k, mul) * D.sellMul())); };
// a favour done counts as help
if (G.Life && G.Life.complete) { const c0 = G.Life.complete; G.Life.complete = function (id) { let g = null; try { const q = Game.EP().quests[id]; g = q && q.giver ? q.giver : null; } catch (e) { } const r = c0.apply(this, arguments); if (g && Game.ENT.npcs[g]) D.rec('help', Game.ENT.npcs[g]); return r; }; }
})(window.G);
