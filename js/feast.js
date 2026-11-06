/* 약속의 길 — 마을 잔치 (v18.26)
   며칠에 한 번, 애굽 마을 하나에서 저녁 잔치가 열려요(오후 4시 반 ~ 밤 8시 반). 이유는 그때그때 달라요:
   거둠 잔치 · 아기 이름 짓는 날 · 집들이 · 나일 강 새해 맞이(범람이 시작되는 날) · 풍년 잔치(풍년) · 나눔 잔치(흉년) · 혼례(빵집 이네트와 벽돌공 소문이 끝나면).
   · 그날 아침에 「오늘 저녁 ○○ 마을에서 ○○ 잔치!」 알림이 떠요(친한 사람은 전날 초대 편지를 보내요 — letters.js).
   · 마을 사람들이 마당에 모여 둘러앉고, 손뼉 치고, 아이들은 원무를 춰요. 상 위엔 빵·과일·항아리, 둘레엔 불 화로와 천 장식.
   · 요셉: 상 앞에서 A키 「잔치 음식 먹기」(체력·기력·정신력이 차고 그 마을 사람들과 조금씩 친해져요, 잔치마다 한 번),
     마당 가운데에서 A키 「함께 춤추기」. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!EP || !AI) return;
const S = () => Game.S(), P = () => Game.P, rnd = a => a[Math.floor(Math.random() * a.length)];
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; };
const chap = s => { const st = s.step || 'c2'; return st[0] === 'j' || st[0] === 'g' ? 7 : (+st[1] || 2); } /* v18.34 g1–g8 are chapters 7–8 (they read as chapter 1) */;
const H0 = 16.5, H1 = 20.5;
const Fe = G.Feast = {};
const REASON = {
  harvest: { n: '거둠 잔치', d: '올해 곡식을 거둔 것을 감사하는 잔치', say: ['올해도 거두게 하셨으니 감사해요!', '보리빵이 산더미예요!', '자, 다 같이 한 잔씩!'] },
  name: { n: '아기 이름 짓는 날', d: '이웃집에 아기가 태어나 이름을 지어 주는 날', say: ['아기 이름이 정해졌대요!', '아기 볼이 무화과처럼 통통해요.', '건강하게 자라라~'] },
  house: { n: '집들이 잔치', d: '새 집을 다 지은 이웃이 마을 사람들을 부른 날', say: ['새 집이 참 튼튼하네요!', '벽돌을 내가 날랐다고요!', '이 집에 웃음이 가득하길!'] },
  newyear: { n: '나일 강 새해 맞이', d: '강물이 불어나기 시작하는 날, 한 해의 첫날을 맞는 잔치', say: ['강물이 오른다! 새해다!', '올해도 검은 흙이 밭을 덮어 주길!', '새해 복 많이 받아요!'] },
  plenty: { n: '풍년 잔치', d: '곳간이 가득 차서 온 마을이 기뻐하는 잔치', say: ['곳간이 꽉 찼대요!', '총리님 말씀대로 모아 두길 잘했어요.', '오늘만큼은 배불리 먹어요!'] },
  share: { n: '나눔 잔치', d: '흉년이지만 집마다 조금씩 가져와 함께 나누는 저녁', say: ['한 덩이라도 나누면 다 함께 배불러요.', '굶는 사람이 없으니 감사해요.', '내년엔 비가 오겠지요.'] },
  wedding: { n: '혼례 잔치', d: '빵 굽는 여인 이네트와 벽돌공의 혼례!', say: ['신랑 신부 만세!', '두 사람 얼굴이 대추야자처럼 빨개요!', '잔칫빵은 이네트가 다 구웠대요!'] },
};
const villages = s => (EP.villages || []).filter(v => (!v.when || v.when(s)) && (v.folk || []).length >= 4 && v.homes && v.homes.length);
/* today's feast (decided once a day): every 4–6 days somewhere, plus the special days */
function today(s) { const f = s.flags.feast; if (f && f.day === s.day) return f.v ? f : null;
  const vs = villages(s); let out = { day: s.day, v: null };
  if (vs.length && chap(s) >= 2) { const last = s.flags.feastLast === undefined ? -3 : s.flags.feastLast, gap = s.day - last, era = chap(s) < 5 ? 'pre' : chap(s) === 5 ? 'plenty' : 'famine';
    let why = null, v = null;
    if ((s.flags.arc_love || 0) >= 4 && !s.flags.wedDone) { why = 'wedding'; v = vs.find(x => x.id === 'city') || vs[0]; }
    else if (G.Nile && G.Nile.season && G.Nile.season(s).k === 'akhet' && G.Nile.season(s).d === 0 && gap >= 2) { why = 'newyear'; }
    else if (gap >= 4 && (gap >= 6 || hash('f' + s.day) < 0.5)) why = rnd(era === 'plenty' ? ['harvest', 'plenty', 'name', 'house'] : era === 'famine' ? ['share', 'share', 'name', 'house'] : ['harvest', 'name', 'house']);
    if (why) { v = v || vs[Math.floor(hash('v' + s.day) * vs.length)]; out = { day: s.day, v: v.id, why }; s.flags.feastLast = s.day; } }
  s.flags.feast = out; return out.v ? out : null; }
Fe.today = () => { const s = S(); return s ? today(s) : null; };
Fe.tomorrowGuess = s => null;
const isOn = (s, v) => { const f = today(s); if (!f || f.v !== v.id) return false; const h = s.time % 24; return h >= H0 && h < H1; };
/* the feast ground: an open patch near the village middle (found once, after the houses are built) */
const SPOT = {};
function spotOf(v) { if (SPOT[v.id]) return SPOT[v.id]; let best = [v.x, v.z];
  outer: for (let r = 0; r <= v.r * 0.75; r += 3) for (let k = 0; k < Math.max(1, Math.round(r * 1.2)); k++) { const a = k / Math.max(1, Math.round(r * 1.2)) * Math.PI * 2, x = v.x + Math.cos(a) * r, z = v.z + Math.sin(a) * r;
    let ok = true; for (let i = 0; i < 12 && ok; i++) { const b = i / 12 * Math.PI * 2; for (const rr of [0, 2.5, 5]) if (Game.solidAt(x + Math.cos(b) * rr, z + Math.sin(b) * rr, 0.4)) { ok = false; break; } }
    if (ok) { best = [x, z]; break outer; } }
  return (SPOT[v.id] = best); }
/* where each villager stands, sits or dances during the feast */
const MODES = ['act:clap', 'sit', 'act:dance', 'sit', 'act:cheer', 'act:clap', 'sit'];
const p0 = AI.plan; AI.plan = function (v, f, s) { const L = p0.apply(this, arguments); try { const fe = today(s); if (!fe || fe.v !== v.id || !L || !L.length) return L;
    const [cx, cz] = spotOf(v), i = v.folk.indexOf(f), N = v.folk.length, a = (i / N) * Math.PI * 2 + 0.3, r = (i % 2 ? 4.6 : 3.4) + (f.age === 'kid' ? -1.4 : 0);
    let x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (Game.solidAt(x, z, 0.3)) { x = cx + Math.cos(a) * 2.2; z = cz + Math.sin(a) * 2.2; }
    const face = Math.atan2(cx - x, cz - z), mode = f.age === 'kid' ? (i % 3 ? 'act:dance2' : 'act:cheer') : MODES[i % MODES.length];
    const at = h => { let e = L[L.length - 1]; for (const q of L) if (q[0] <= h) e = q; return e; };
    const end = at(H1).slice(); end[0] = H1; const out = L.filter(q => q[0] < H0 || q[0] >= H1); out.push([H0 + (i % 5) * 0.08, x, z, face, mode]); if (!out.some(q => q[0] === H1)) out.push(end);
    return out.sort((p, q) => p[0] - q[0]); } catch (e) { console.error('feast plan', e); return L; } };
// ------------------------------------------------------------------ the morning notice
let tellDay = -1;
function notice(s) { const f = today(s); if (!f || tellDay === s.day) return; const h = s.time % 24; if (h > H1) return; tellDay = s.day; const v = (EP.villages || []).find(x => x.id === f.v); if (!v) return; const R = REASON[f.why];
  setTimeout(() => { if (G.UI.busy() || (G.Cine && G.Cine.on)) { tellDay = -1; return; } pop(`오늘 저녁 ${v.n}에서 ${R.n}!`, `${R.d} · 오후 4시 반부터`, 'star'); }, 2500); }
// ------------------------------------------------------------------ Joseph at the feast
const ate = () => { const s = S(); return (s.flags.feastAte || -1) === s.day; };
Game.CTX.push(function (s) { const p = P(); if (Game.cineOn || p.act || (s.q && s.q.riding)) return null; const f = today(s); if (!f) return null; const v = (EP.villages || []).find(x => x.id === f.v); if (!v || !isOn(s, v)) return null;
  const [cx, cz] = spotOf(v), d = Math.hypot(p.x - cx, p.z - cz); if (d > 4.2) return null; const out = [];
  if (!ate() && d < 2.6) out.push({ d: d - 0.6, label: '잔치 음식 먹기', x: cx, z: cz, y: 1.1, key: 'feastEat', use: () => eat(s, v, f) });
  else out.push({ d: d - 0.3, label: '함께 춤추기', x: cx, z: cz, y: 1.1, key: 'feastDance', noTag: true, use: () => danceGame(s, v, f) });
  return out; });
function eat(s, v, f) { s.flags.feastAte = s.day; const H = s.hero, p = P(); if (H) { H.hp = Math.min(H.hpMax || 100, (H.hp || 0) + 30); H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 15); } p.stam = Math.max(p.stam, (G.Vitals && G.Vitals.cap) || 100);
  if (G.Surv && G.Surv.fed) try { G.Surv.fed('bread', 40); } catch (e) { } /* v18.34 (Surv.eat never existed: the feast did not fill you) */
  let n = 0; if (G.Bond) for (const fo of v.folk) if (Game.ENT.npcs[fo.id]) { G.Bond.add(fo.id, 2, 'feast'); n++; }
  if (G.Acts) G.Acts.play('eat'); sfx('pickup', { pitch: 1.1 }); const R = REASON[f.why];
  pop('잔치 음식을 함께 먹었어요', `${R.n} · 체력·기력·정신력이 찼어요 · ${v.n} 사람들과 조금 더 친해졌어요`, 'heart');
  if (f.why === 'wedding') s.flags.wedDone = s.day; }
// ------------------------------------------------------------------ v18.32 the dance: tap with the drum
/* a ring closes on the circle with each drum beat; tap the screen (or A) when it meets the circle. 12 beats; the better the steps,
   the louder the village cheers (and the closer they feel to Joseph — once per feast) */
let DG = null;
{ const css = document.createElement('style'); css.textContent = `#danceUI{position:fixed;inset:0;z-index:240;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:22vh;pointer-events:auto;touch-action:none}
#danceUI .dz{position:relative;width:120px;height:120px}#danceUI .dc{position:absolute;inset:30px;border-radius:50%;border:4px solid #ffd24a;box-shadow:0 0 14px rgba(255,210,74,.6);background:rgba(20,14,6,.35)}
#danceUI .dr{position:absolute;left:50%;top:50%;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;border:3px solid #fff4d0;opacity:.9}
#danceUI .dt{margin-top:10px;font:700 18px/1.2 var(--serif,serif);color:#ffe9a8;text-shadow:0 2px 6px #000;min-height:24px}#danceUI .ds{font-size:12px;color:#f4e8cc;opacity:.85;text-shadow:0 1px 4px #000}`; document.head.appendChild(css); }
function danceGame(s, v, f) { if (DG) return; const el = document.createElement('div'); el.id = 'danceUI'; el.innerHTML = '<div class="dz"><div class="dc"></div><div class="dr"></div></div><div class="dt">북소리에 맞춰 화면을 톡!</div><div class="ds">0 / 12</div>'; document.body.appendChild(el);
  if (G.Acts) G.Acts.play('dance'); G.UI.setBusy && G.UI.setBusy('dance', true);
  DG = { el, v, f, beat: 0, t: -1.2, per: 0.75, hits: 0, perfect: 0, judged: -1, done: false };
  const hit = e => { if (e) { e.preventDefault(); e.stopPropagation(); } const g = DG; if (!g || g.done || g.judged === g.beat) return; if (g.t < -g.per * 0.5) return; /* v18.34 a tap in the count-in does not use up the first beat */ const ph = g.t - g.beat * g.per, err = Math.abs(ph); g.judged = g.beat;
    const txt = el.querySelector('.dt'); if (err < 0.09) { g.hits++; g.perfect++; txt.textContent = '완벽해요!'; sfx('hit', { pitch: 1.6, vol: 0.5 }); } else if (err < 0.2) { g.hits++; txt.textContent = '좋아요!'; sfx('blip', { pitch: 1.3 }); } else { txt.textContent = '앗, 박자가…'; sfx('fail', { vol: 0.3 }); } };
  el.addEventListener('pointerdown', hit); DG.hit = hit; }
Fe.danceTap = () => DG && DG.hit && DG.hit();
function danceTick(dt) { const g = DG; if (!g) return; g.t += dt; const per = g.per, el = g.el, ring = el.querySelector('.dr');
  if (g.t >= 0) { const b = Math.round(g.t / per); if (b !== g.beat && g.t > g.beat * per + per * 0.5) { if (g.judged !== g.beat && g.beat >= 0 && g.beat < 12 && g.t > 0.3) el.querySelector('.dt').textContent = '…'; g.beat = Math.min(12, b); if (g.beat < 12) sfx('step', { surf: 'wood', vol: 0.9, pitch: 0.55 }); } }
  const ph = ((g.t % per) + per) % per, k = 1 - ph / per, sc = 0.9 + k * 1.6; ring.style.transform = `scale(${sc})`; ring.style.opacity = g.t < 0 ? 0.3 : 0.95;
  el.querySelector('.ds').textContent = `${g.hits} / 12`;
  if (g.t > 12 * per + 0.4 && !g.done) { g.done = true; const s = S(), good = g.hits >= 8, first = (s.flags.danceDay || -1) !== s.day;
    el.querySelector('.dt').textContent = good ? (g.perfect >= 8 ? '온 마을이 환호해요!' : '잘 췄어요!') : '다음엔 더 잘할 수 있어요!';
    if (good && first) { s.flags.danceDay = s.day; if (G.Bond) for (const fo of g.v.folk) if (Game.ENT.npcs[fo.id]) G.Bond.add(fo.id, g.perfect >= 8 ? 3 : 2, 'dance'); const H = s.hero; if (H) H.mind = Math.min(H.mindMax || 100, (H.mind || 0) + 12); }
    for (const fo of g.v.folk.slice(0, 8)) { const n = Game.ENT.npcs[fo.id]; if (n && n.vis && !n.walk) n.emote = { k: good ? 'cheer' : 'clap', t: 0, dur: 2.2, amb: true }; }
    setTimeout(() => { el.remove(); DG = null; G.UI.setBusy && G.UI.setBusy('dance', false); if (G.Acts) G.Acts.stop(); pop(good ? '함께 춤을 췄어요!' : '함께 춤을 췄어요', good && first ? `${g.hits}/12 박자 · 정신력 +12 · 마을 사람들과 더 친해졌어요` : `${g.hits}/12 박자`, 'heart'); }, 1500); } }
// ------------------------------------------------------------------ decorations: tables, food, braziers and cloth on posts
let mesh = null, flame = null; const M0 = G.m4(), MF = [G.m4(), G.m4(), G.m4(), G.m4()];
function build() { const g = new G.GB(91), W = 0x8a6a48, CL = [0xc83a2a, 0x2c5a9a, 0xe8c048, 0x3a8a4a];
  for (const sx of [-1, 1]) { g.box(3.0, 0.08, 0.9, { at: [sx * 1.6, 0.62, 0], c: W }); for (const lx of [-1.3, 1.3]) for (const lz of [-0.35, 0.35]) g.box(0.08, 0.6, 0.08, { at: [sx * 1.6 + lx, 0.3, lz], c: 0x5a4230 });
    g.box(3.05, 0.02, 0.95, { at: [sx * 1.6, 0.67, 0], c: 0xf0e8d8 });
    for (let i = 0; i < 5; i++) { const x = sx * 1.6 - 1.1 + i * 0.55; if (i % 2) g.sph(0.14, 8, 6, { at: [x, 0.76, -0.12], c: 0xd8a860 }); else { g.cyl(0.16, 0.12, 0.08, 10, { at: [x, 0.72, 0.1], c: 0xb87a4a }); for (let k = 0; k < 3; k++) g.sph(0.06, 6, 5, { at: [x - 0.05 + k * 0.05, 0.8, 0.1], c: [0x7a2a7a, 0xe8c048, 0x5a8a2a][k] }); } }
    g.cyl(0.1, 0.14, 0.42, 9, { at: [sx * 1.6 + 1.3, 0.21, 0.75], c: 0xb8764a }); g.cyl(0.13, 0.13, 0.3, 9, { at: [sx * 1.6 - 1.3, 0.15, -0.75], c: 0xa86a40 }); }
  for (const [x, z] of [[-5, -4], [5, -4], [-5, 4], [5, 4]]) { g.cyl(0.07, 0.08, 2.6, 6, { at: [x, 1.3, z], c: 0x6a4a30 }); g.cyl(0.26, 0.16, 0.3, 8, { at: [x, 2.65, z], c: 0x8a6a40 }); }
  for (const [x0, z0, x1, z1] of [[-5, -4, 5, -4], [-5, 4, 5, 4], [-5, -4, -5, 4], [5, -4, 5, 4]]) { const n = 9; for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u, sag = Math.sin(u * Math.PI) * 0.4;
      g.box(0.22, 0.3, 0.02, { at: [x, 2.35 - sag, z], ry: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, c: CL[i % 4], j: 0 }); } }
  g.box(2.2, 0.02, 1.6, { at: [0, 0.02, 2.4], c: 0xa83a2a }); g.box(2.0, 0.025, 1.4, { at: [0, 0.03, 2.4], c: 0xe8c048 }); /* a mat for the dancers */
  mesh = G.R.mesh(g); const f2 = new G.GB(92); f2.sph(0.2, 8, 6, { at: [0, 0.12, 0], c: 0xffb040 }); f2.cyl(0.04, 0.14, 0.4, 6, { at: [0, 0.28, 0], c: 0xffd070 }); flame = G.R.mesh(f2); }
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s) return; try { const f = today(s); if (!f) return; const v = (EP.villages || []).find(x => x.id === f.v); if (!v) return;
    const h = s.time % 24; if (h < H0 - 1.5 || h > H1 + 0.3) return; const [cx, cz] = spotOf(v); if (Math.hypot(cx - P().x, cz - P().z) > 90) return; if (!mesh) build();
    const W = Game.W(), y = W.heightAt(cx, cz); G.m4trs(M0, cx, y, cz, 0, 0, 0, 1, 1, 1); list.push({ mesh, m: M0, outline: true });
    const fl = 1 + Math.sin(performance.now() / 90) * 0.12; [[-5, -4], [5, -4], [-5, 4], [5, 4]].forEach(([x, z], i) => { G.m4trs(MF[i], cx + x, y + 2.78, cz + z, 0, 0, 0, fl, fl * (1 + i * 0.03), fl); list.push({ mesh: flame, m: MF[i], emis: [1.4, 0.7, 0.2] }); }); } catch (e) { console.error('feast dyn', e); } };
// tables are solid while laid out (Joseph walks round them)
const up0 = EP.update; let tT = 0, chk = 0; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { danceTick(d); if ((chk -= d) <= 0) { chk = 3; notice(s); } const f = today(s); const v = f && (EP.villages || []).find(x => x.id === f.v);
    if (v && isOn(s, v)) { const [cx, cz] = spotOf(v), p = P(), dx = p.x - cx, dz = p.z - cz;
      for (const sx of [-1, 1]) { const lx = dx - sx * 1.6, r = 0.35; if (Math.abs(lx) < 1.5 + r && Math.abs(dz) < 0.45 + r) { const px = 1.5 + r - Math.abs(lx), pz = 0.45 + r - Math.abs(dz); if (px < pz) p.x += Math.sign(lx || 1) * px; else p.z += Math.sign(dz || 1) * pz; } }
      if (Math.hypot(dx, dz) < 30 && (tT -= d) <= 0) { tT = 4 + Math.random() * 4; const ids = v.folk.map(fo => Game.ENT.npcs[fo.id]).filter(n => n && n.vis && !n.walk && !n.talking && !n._chat && Math.hypot(n.x - cx, n.z - cz) < 8);
        if (ids.length) G.Life.bubble(rnd(ids).id, rnd(REASON[f.why].say.concat(['하하하!', '한 곡 더!', '얼쑤!', '이 빵 좀 드셔 보세요!'])), 2.6); }
      if (G.Weather && G.Weather.kind && ['storm', 'dust'].includes(G.Weather.kind(s)) && G.Weather.set) G.Weather.set('clear', 3); } } catch (e) { console.error('feast', e); } return r; };
/* music for a feast */
const mu0 = EP.music; EP.music = function (s, g, hr) { try { const f = today(s); const v = f && (EP.villages || []).find(x => x.id === f.v); if (v && isOn(s, v)) { const [cx, cz] = spotOf(v); if (Math.hypot(P().x - cx, P().z - cz) < 35) return 'j_plenty'; } } catch (e) { } return mu0 ? mu0.apply(this, arguments) : undefined; };
Fe.spot = id => { const v = (EP.villages || []).find(x => x.id === id); return v ? spotOf(v) : null; };
Fe.reasons = REASON; Fe.on = isOn;
Fe.force = (vId, why) => { const s = S(); s.flags.feast = { day: s.day, v: vId, why: why || 'harvest' }; s.flags.feastLast = s.day; for (const id in Game.ENT.npcs) Game.ENT.npcs[id].schedKey = null; };
})(window.G);
