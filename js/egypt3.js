/* 약속의 길 — 나일로미터 (나일 강 수위 재는 돌계단) · 곡식 세기 (v18.34)
   옛 애굽 사람들은 강가에 돌계단을 쌓고 눈금을 새겨 해마다 나일 강이 얼마나 불었는지 쟀어요. 물이 알맞게 불면 풍년,
   모자라면 흉년이었지요. 바로의 꿈(살진 소 일곱, 마른 소 일곱)을 풀었던 요셉에게 이 눈금은 남의 일이 아니었어요.
   · 도성 강가의 돌계단에서 A 「나일 강 수위 재기」(하루 한 번): 지금 계절과 물 높이를 서기 석판에 적어요.
     계절마다 처음 적으면 깨달음 +1, 세 계절을 다 적으면 「강을 읽는 사람」 카드. 풍년·흉년마다 요셉의 혼잣말이 달라요.
   · 계단 곁의 늙은 수위 서기 「네브」가 말을 걸어요(눈금 읽는 법, 옛 흉년 이야기).
   · 곳간 서기를 돕는 「곡식 세기」: 성읍의 곳간 앞에서 A — 자루가 지나갈 때 화면을 톡 눌러 셈 막대를 그어요(10번).
     다 맞추면 은 6 · 정확히 맞춘 날이 쌓이면 창세기 41:49 카드 (「셀 수 없을 만큼 많아 세기를 그쳤더라」). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!EP) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o), rnd = a => a[Math.floor(Math.random() * a.length)];
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const ord = () => Game.stepOrder(), after = k => { const s = S(), o = ord(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const famine = () => after('c6_open') && S().step !== 'j_end';
const NM = { x: 0, z: 0, f: 0, ok: false };
// ------------------------------------------------------------------ the stairway, on the city's riverbank
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const v = (EP.villages || []).find(q => q.id === 'city'), r = v && v.spots && v.spots.river; if (!r) return;
  const wl = W.water ? W.water.level : -99; let bx = r[0], bz = r[1], dx = r[0] - v.x, dz = r[1] - v.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  /* walk along the bank a little so it does not sit on the villagers' washing place */ const sx = -dz, sz = dx; bx += sx * 9; bz += sz * 9;
  for (let k = 0; k < 12 && W.heightAt(bx, bz) < wl + 0.3; k++) { bx -= dx; bz -= dz; } const f = Math.atan2(dx, dz), y = W.heightAt(bx, bz);
  Object.assign(NM, { x: bx, z: bz, f, ok: true, y });
  W.place((g, M) => { const ST = [0xd8c8a8, 0xc8b898, 0xbcac8c];
    for (let i = 0; i < 9; i++) g.box(2.6, 0.5, 0.7, { m: M, at: [0, -i * 0.32, 0.4 + i * 0.62], c: ST[i % 3], j: 0.04 }); /* steps going down into the river */
    for (const s2 of [1, -1]) g.box(0.5, 1.2 + 2.6, 6.2, { m: M, at: [1.55 * s2, -0.9, 2.8], c: 0xc0b090, j: 0.05 }); /* side walls */
    g.box(0.36, 3.6, 0.36, { m: M, at: [-1.05, -0.3, 4.6], c: 0xe4d4b0 }); for (let i = 0; i < 9; i++) g.box(0.4, 0.04, 0.4, { m: M, at: [-1.05, -1.9 + i * 0.4, 4.6], c: i % 3 === 0 ? 0x2c5aa0 : 0x6a4a30, j: 0 }); /* the marked column: a blue mark every three cubits */
    g.box(0.9, 0.5, 0.5, { m: M, at: [1.9, 0.25, -0.6], c: 0xb8a888 }); g.box(0.5, 0.04, 0.36, { m: M, at: [1.9, 0.52, -0.6], c: 0x7a7a70 }); /* the scribe's seat and slate */
  }, bx, bz, { y: y + 0.02, ry: f, col: null });
  for (const s2 of [1, -1]) W.addCol({ x: bx + Math.cos(f) * 1.55 * s2 + dx * 2.8, z: bz - Math.sin(f) * 1.55 * s2 + dz * 2.8, w: 0.5, d: 6.2, a: f, y0: y - 3, y1: y + 0.4 });
  addKeeper(W);
} catch (e) { console.error('egypt3', e); } };
// the old gauge keeper (added while the world is built: the NPCs are made right after)
const vl = id => { for (const v of EP.villages || []) { const f = (v.folk || []).find(q => q.id === id); if (f) return f.look; } return null; };
const NEB = ['눈금이 열여섯 자에 닿으면 풍년이오. 열두 자면 배고프고, 열여덟 자를 넘으면 마을이 잠기지.', '내 아버지도, 할아버지도 이 계단에서 물을 쟀소. 강은 거짓말을 안 하오.', '총리께서 바로의 꿈을 푸셨다지요? 나는 그 뒤로 눈금을 더 꼼꼼히 적소.', '옛날, 우리 할아버지 때 일곱 해 동안 강이 안 분 적이 있었다오. 그때 사람들은 나무껍질까지 먹었다지.', '물은 남쪽 먼 산에서 온다오. 거기 비가 와야 여기 밭이 산다니, 참 신기하지 않소?'];
const NEBF = ['요즘 눈금을 보면 가슴이 철렁하오. 총리께서 곳간을 지어 두지 않았다면…', '흉년에도 나는 날마다 눈금을 적소. 언젠가 다시 물이 차오르는 날을 첫 번째로 보려고.'];
function addKeeper(W) { if (!NM.ok || !EP.npcs) return; for (let i = EP.npcs.length - 1; i >= 0; i--) if (EP.npcs[i].id === 'nmNeb') EP.npcs.splice(i, 1); const L = vl('ct_mer') || vl('ct_pot');
  const x = NM.x + Math.cos(NM.f) * 1.9 - Math.sin(NM.f) * 1.2, z = NM.z - Math.sin(NM.f) * 1.9 - Math.cos(NM.f) * 1.2; /* v18.34 behind his seat, not in it */
  EP.npcs.push({ id: 'nmNeb', name: '수위 서기 네브', look: Object.assign({}, L || {}, { skin: 0x9a6a40, top: 0xece2c8, age: 'old', beard: 'short', hair: 0xd8d0c0 }), x, z, face: NM.f + Math.PI, talkR: 2.4, noBond: true, show: s => after('c5_patrol'), persona: '나일 강 수위를 평생 재 온 늙은 서기. 숫자에 엄격하지만 강 이야기만 나오면 눈이 반짝인다.' }); }
if (G.Life && G.Life.talk) { const t0 = G.Life.talk; G.Life.talk = function (id) { if (id !== 'nmNeb') return t0.apply(this, arguments); const n = Game.ENT.npcs[id]; if (n) n.talking = true;
  const s = S(), log = s.flags.nmLog || {}, met = s.flags.nebMet; s.flags.nebMet = 1; let t;
  if (!met) t = '처음 뵙소, 총리님. 나는 이 계단을 마흔 해 지켜 온 수위 서기 네브요. 강물이 얼마나 불었는지 날마다 이 눈금에 적지요.';
  else if (s.step === 'j_end' || s.step === 'g8_pharaoh') t = '총리님! 어제 눈금이 한 자 올랐소! 마른 해가 끝나 가는 게요. 내가 제일 먼저 봤소!';
  else if (s.flags.nmCard) t = rnd(['허허, 이제 총리께서 나보다 강을 더 잘 읽으시오.', '세 계절 눈금을 다 적으셨으니, 우리 서기들 사이에서 소문이 났소.']);
  else if (Object.keys(log).length) { const left = ['akhet', 'peret', 'shemu'].filter(k => !log[k]).map(k => ({ akhet: '범람기', peret: '씨 뿌림', shemu: '거둠' })[k]); t = left.length ? `${Object.keys(log).length === 1 ? '첫 눈금을' : '눈금을'} 적으셨구려. 이제 ${left.join('·')} 철만 남았소.` : rnd(NEB); }
  else t = rnd(famine() ? NEBF.concat(NEB.slice(3)) : NEB);
  G.UI.say([{ n: '수위 서기 네브', t }], () => { if (n) n.talking = false; }); return true; }; } /* v18.34 return true: otherwise the default 「평안하시오.」 replaced his line */
// ------------------------------------------------------------------ reading the level
const LEVEL = () => { const s = S(), z = G.Nile ? G.Nile.season(s) : { k: 'peret', n: '' }, off = G.Nile && G.Nile.offset ? G.Nile.offset() : 0; const cub = Math.round(14 + off * 6 + (z.k === 'akhet' ? 1 : z.k === 'shemu' ? -2 : 0)); return { z, cub: famine() ? Math.min(cub, 11) : cub }; };
const WORD = (c, k) => !famine() && k && k !== 'akhet' ? (k === 'shemu' ? '물이 빠지는 거둠 철이에요 · 이맘때는 낮은 게 당연해요' : '물이 빠져 씨를 뿌리는 철이에요 · 범람기 눈금이 한 해를 정해요') : c >= 18 ? '너무 많이 불었어요 · 둑을 살펴야 해요' : c >= 15 ? '알맞게 불었어요 · 풍년이 들겠어요' : c >= 13 ? '조금 모자라요 · 물길을 잘 대야 해요' : '물이 거의 불지 않았어요 · 흉년의 눈금이에요';
const MUSE = { plenty: ['(물이 넉넉하다… 하나님이 바로에게 보이신 살진 소 일곱 마리의 해로구나.)', '(이 넉넉함이 끝나는 날이 온다. 오늘 한 자루라도 더 곳간에 쌓아야지.)', '(강도 하나님의 손 안에 있다. 넘치게 하시는 분도, 마르게 하시는 분도.)'],
  famine: ['(눈금이 바닥에 닿았다… 마른 소 일곱 마리가 살진 소를 삼킨다더니.)', '(곳간의 곡식이 사람들을 살린다. 하나님이 먼저 알려 주셔서 다행이야.)', '(아버지 계신 가나안도 이 가뭄을 겪고 있겠지… 하나님, 그들을 지켜 주세요.)'] };
function read() { const s = S(), { z, cub } = LEVEL(), log = s.flags.nmLog = s.flags.nmLog || {}, first = !log[z.k]; s.flags.nmDay = s.day; log[z.k] = cub;
  if (G.Acts && G.Acts.play) G.Acts.play('kneelRest', { quiet: true }); sfx('water', { vol: 0.5 });
  const ls = [{ n: '나일 강 수위', t: `${z.n || '지금'} · 눈금 ${cub}자 — ${WORD(cub, z.k)}` }, { n: '요셉', t: rnd(MUSE[famine() ? 'famine' : 'plenty']) }];
  G.UI.say(ls, () => { if (G.Acts && G.Acts.stop) G.Acts.stop(); if (first) { if (Game.insight) Game.insight(1, '나일 강 수위 기록'); pop('수위를 적었어요', `${z.n} · ${cub}자 · 깨달음 +1`, 'drop'); } else pop('수위를 적었어요', `${cub}자`, 'drop');
    if (Object.keys(log).length >= 3 && !s.flags.nmCard) { s.flags.nmCard = 1; setTimeout(() => G.UI.featCard && G.UI.featCard('nilo', { kick: '세 계절의 눈금', n: '강을 읽는 사람', ic: 'star', d: '범람기·씨 뿌림·거둠, 세 계절의 나일 강 눈금을 모두 적었어요. 애굽의 풍년과 흉년은 이 눈금에 먼저 나타났어요. 요셉은 하나님이 보여 주신 꿈과 이 강을 함께 읽었어요.' }), 700); } G.UI.hud(); }); }
// ------------------------------------------------------------------ counting the grain at the city storehouse
const CT = { on: false };
function granary() { const sp = EP.spots && EP.spots.granaryA; return sp ? { x: sp[0], z: sp[1] + 4 } : null; }
let css = null; function ui() { if (css) return; css = document.createElement('style'); css.textContent = `#countUI{position:fixed;inset:0;z-index:240;display:flex;align-items:flex-end;justify-content:center;padding-bottom:22vh;pointer-events:auto;background:rgba(10,8,4,.25)}
#countUI .cb{width:min(88vw,340px);padding:14px 16px 12px;border-radius:18px;background:linear-gradient(170deg,#f6ecd0,#e4d2a4);border:2px solid #c8902a;color:#3a2810;text-align:center;font-weight:700}
#countUI .lane{position:relative;height:54px;margin:10px 0;border-radius:10px;background:#d8c49a;overflow:hidden}#countUI .sack{position:absolute;top:9px;width:36px;height:36px;border-radius:40% 40% 30% 30%;background:#b88a4a;border:2px solid #7a5a2a}
#countUI .gate{position:absolute;left:50%;top:0;bottom:0;width:3px;margin-left:-1px;background:#2c5aa0}#countUI .tal{font-size:22px;letter-spacing:3px;min-height:28px;color:#2a1a08}#countUI .hint{font-size:12px;opacity:.75}`; document.head.appendChild(css); }
function startCount() { if (CT.on) return; ui(); const s = S(); CT.on = true; G.UI.setBusy('count', true); const el = document.createElement('div'); el.id = 'countUI';
  el.innerHTML = `<div class="cb"><div>곡식 자루 세기 · 창 41:49</div><div class="lane"><div class="gate"></div></div><div class="tal"></div><div class="hint">자루가 파란 줄에 닿을 때 화면을 톡!</div></div>`; document.body.appendChild(el);
  const lane = el.querySelector('.lane'), tal = el.querySelector('.tal'), N = 10, sacks = []; let hit = 0, miss = 0, wrong = 0, i = 0, t0 = performance.now(), done = false;
  for (let k = 0; k < N; k++) { const d = document.createElement('div'); d.className = 'sack'; lane.appendChild(d); sacks.push({ el: d, at: 900 + k * (720 + (k % 3) * 120), got: false }); }
  const W = () => lane.clientWidth || 300, speed = 0.16; /* px per ms */
  const tick = () => { if (done) return; const t = performance.now() - t0, w = W(); for (const q of sacks) { const x = w + 20 - (t - q.at + w / 2 / speed) * speed; q.x = x; q.el.style.left = (x - 18) + 'px'; if (!q.got && x < w / 2 - 34 && !q.miss) { q.miss = true; miss++; q.el.style.opacity = 0.35; } }
    if (sacks.every(q => q.got || q.miss)) return end(); requestAnimationFrame(tick); };
  const tap = e => { e.preventDefault(); e.stopPropagation(); const w = W(); let best = null, bd = 1e9; for (const q of sacks) { if (q.got || q.miss) continue; const d = Math.abs(q.x - w / 2); if (d < bd) { bd = d; best = q; } }
    if (best && bd < 30) { best.got = true; hit++; best.el.style.background = '#e8c048'; tal.textContent += hit % 5 === 0 ? '卌 ' : '|'; sfx('click', { pitch: 1.2 + hit * 0.04 }); } else { wrong++; sfx('thud', { vol: 0.4, pitch: 1.6 }); if (best && bd < 90) { best.miss = true; miss++; best.el.style.opacity = 0.35; } } }; /* v18.34 a wrong tap loses the nearest sack (tapping wildly used to win every day) */
  el.addEventListener('pointerdown', tap);
  function end() { done = true; setTimeout(() => { el.remove(); CT.on = false; G.UI.setBusy('count', false); s.flags.ctDay = s.day; const perfect = hit === N && wrong <= 1;
    if (hit >= 7) { Game.silver && Game.silver(perfect ? 6 : 4); if (perfect) s.flags.ctPerfect = (s.flags.ctPerfect || 0) + 1; pop(perfect ? '한 자루도 안 놓쳤어요!' : '잘 셌어요', `${hit} / ${N} 자루 · 은 ${perfect ? 6 : 4}`, 'star'); }
    else pop('셈이 어긋났어요', `${hit} / ${N} 자루 · 서기가 다시 세요`, 'star');
    if ((s.flags.ctPerfect || 0) >= 3 && !s.flags.ctCard) { s.flags.ctCard = 1; setTimeout(() => G.UI.featCard && G.UI.featCard('count', { kick: '창세기 41:49', n: '셀 수 없을 만큼', ic: 'star', d: '요셉이 곡식을 바다의 모래같이 쌓았어요. 셀 수 없을 만큼 많아 세기를 그쳤대요. (창 41:49)' }), 600); } G.UI.hud(); }, 500); }
  requestAnimationFrame(tick); }
// ------------------------------------------------------------------ actions
Game.CTX.push(function (s) { const p = P(); if (!after('c5_patrol') || p.ride || p.swim || p.act || Game.cineOn || (s.q && s.q.riding)) return null; const out = [];
  if (NM.ok) { const ax = NM.x + Math.sin(NM.f) * 1.0, az = NM.z + Math.cos(NM.f) * 1.0, d = Math.hypot(ax - p.x, az - p.z);
    if (d < 2.6) out.push(s.flags.nmDay === s.day ? { d: d - 0.3, label: '나일 강 수위 · 오늘은 적었어요', disabled: true, x: ax, z: az, y: 0.8, key: 'nmRead' } : { d: d - 0.6, label: '나일 강 수위 재기', x: ax, z: az, y: 0.8, key: 'nmRead', noMagnet: true, use: read }); }
  const gr = granary(); if (gr && !famine() && s.built && s.built.granA) { /* v18.34 only once the city storehouse stands */ const d = Math.hypot(gr.x - p.x, gr.z - p.z); if (d < 4.5) out.push(s.flags.ctDay === s.day ? { d: d + 0.4, label: '곡식 세기 · 오늘은 도왔어요', disabled: true, x: gr.x, z: gr.z, y: 1, key: 'ctCount' } : { d: d + 0.2, label: '곳간 서기 돕기 · 곡식 세기', x: gr.x, z: gr.z, y: 1, key: 'ctCount', use: startCount }); }
  return out.length ? out : null; });
(EP.places = EP.places || []).push({ n: '나일로미터 (수위 계단)', get x() { return NM.x; }, get z() { return NM.z; }, when: s => NM.ok && after('c5_patrol') });
/* v18.34 the steps are walkable: going down them follows each tread (you walked through them on the bank's slope) */
const fl0 = EP.floor; EP.floor = function (x, z, s) { if (NM.ok) { const dx = x - NM.x, dz = z - NM.z, ca = Math.cos(NM.f), sa = Math.sin(NM.f), lx = dx * ca - dz * sa, lz = dx * sa + dz * ca;
  if (Math.abs(lx) < 1.3 && lz > 0.05 && lz < 5.7) { const y = NM.y + 0.27 - Math.floor((lz - 0.05) / 0.62) * 0.32; const W = Game.W(); if (!W || y > W.heightAt(x, z) - 0.05) return y; } } return fl0 ? fl0.apply(this, arguments) : null; };
G.Nilometer = NM;
})(window.G);
