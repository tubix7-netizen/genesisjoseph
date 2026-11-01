/* 약속의 길 — 동작 (player emotes, rest and social life), v8
   The 동작 sheet lets the hero sit, lie down, kneel, pray, bow, wave, clap, dance, play a reed pipe, pet animals…
   · Rest poses (앉기·눕기·꿇어앉기·쪼그려 앉기·손 녹이기) make stamina come back 2.5× faster and slow hunger.
     Lying down at night asks whether to sleep under the stars until morning.
   · Villagers nearby answer: they wave back, bow, clap or dance along, and say something.
   · Upper-body emotes (손 흔들기, 박수, 피리, 팔짱, 생각하기…) keep going while walking (blend tree in motion.js);
     the others stop as soon as the hero moves.
   · 사진 모드 hides the HUD so the view can be framed and captured with the phone's screenshot. */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, $ = id => document.getElementById(id);
const Ac = G.Acts = {};
const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const rnd = a => a[Math.floor(Math.random() * a.length)];
// k: [label, options]  hold = loops until the hero moves · walk = may walk while doing it · rest = counts as resting · dur = seconds
const DEF = {
  sitg: ['앉기', { hold: 1, rest: 1 }], sitHug: ['무릎 안고 앉기', { hold: 1, rest: 1 }], kneelRest: ['꿇어앉기', { hold: 1, rest: 1 }], squat: ['쪼그려 앉기', { hold: 1, rest: 1 }],
  lie: ['눕기', { hold: 1, rest: 1, d: '밤에는 별을 보며 잠들 수 있어요' }], warmHands: ['손 녹이기', { hold: 1, rest: 1 }], crossArms: ['팔짱 끼기', { hold: 1, walk: 1 }],
  pray: ['무릎 꿇고 기도', { hold: 1 }], prostrate: ['엎드려 절하기', { dur: 3.4 }], raiseHands: ['두 손 들고 찬양', { hold: 1 }], bow: ['허리 굽혀 인사', { dur: 1.5 }],
  wave: ['손 흔들기', { dur: 2, walk: 1 }], clap: ['박수', { hold: 1, walk: 1 }], cheer: ['환호', { dur: 2 }], laugh: ['웃기', { dur: 2.4, walk: 1 }], weep: ['울기', { dur: 4.5 }],
  think: ['생각하기', { hold: 1, walk: 1 }], point: ['가리키기', { dur: 1.8, walk: 1 }], stretch: ['기지개', { dur: 2.8 }],
  flute: ['피리 불기', { hold: 1, walk: 1, d: '갈대 피리로 목동의 노래를 불어요' }], dance: ['춤추기', { hold: 1 }], dance2: ['원무 추기', { hold: 1 }], pet: ['동물 쓰다듬기', { dur: 2.8, d: '가까운 양·염소·나귀를 쓰다듬어요' }],
  eat: ['먹기', { dur: 2.3, walk: 1, hide: 1 }], drink: ['마시기', { dur: 1.4, walk: 1, hide: 1 }] };
// v12: only what belongs in Joseph's world — rest, prayer, a greeting, and care for animals (dances, cheers, flute… removed from the sheet)
const TABS = [['rest', '쉬기', ['sitg', 'kneelRest', 'lie', 'warmHands']], ['faith', '기도', ['pray', 'prostrate']], ['social', '인사', ['wave', 'bow']], ['play', '돌보기', ['pet', 'photo']]];
Ac.DEF = DEF;
Ac.walkable = k => !!(DEF[k] && DEF[k][1].walk);
Ac.locks = () => false;
let tipRest = false, tune = null;

// ------------------------------------------------------------------ start / stop
Ac.play = function (k, o) {
  o = o || {}; const P = Game.P, S = Game.S(), d = DEF[k]; if (!d || !S) return false;
  const no = m => { if (!o.quiet) UI.toast(m); return false; };
  if (Game.mode !== 'play' || Game.cineOn) return false;
  if (P.ride) return no('탈것에서 내린 뒤에 할 수 있어요');
  if (P.swim) return no('물속에서는 할 수 없어요');
  if (P.act || P.atk || (P.dodgeT > 0)) return false;
  if (k === 'pet') { const a = nearestAnimal(2.6); if (!a) return no('가까이에 쓰다듬을 동물이 없어요 · 양이나 나귀 곁으로 가 보세요'); P.face = Math.atan2(a.x - P.x, a.z - P.z); P.petTarget = a; }
  if (k === 'warmHands') { const f = nearestFire(6); if (f) P.face = Math.atan2(f.x - P.x, f.z - P.z); }
  P.emote = { k, t: 0, dur: d[1].dur || 0, slept: false }; P.resting = !!d[1].rest; P.vx *= 0.3; P.vz *= 0.3;
  if (k === 'flute') tune = { i: 0, next: 0.25, song: rnd(SONGS) }; else tune = null;
  if (P.resting && !tipRest && !o.quiet) { tipRest = true; UI.toast('쉬는 중 · 기력이 빨리 차고 배가 덜 고파요'); }
  if (!o.quiet) react(k); label();
  return true;
};
Ac.stop = function () { const P = Game.P; if (!P.emote) return; P.emote = null; P.resting = false; tune = null; P.petTarget = null; label(); };
function label() { const b = $('emoBtn'), e = Game.P.emote; if (!b) return; const sp = b.querySelector('span'); if (sp) sp.textContent = e && DEF[e.k] && DEF[e.k][1].hold ? (DEF[e.k][1].rest ? '일어나기' : '멈추기') : '동작'; }
Ac.toggle = k => { const P = Game.P; if (P.emote && P.emote.k === k) Ac.stop(); else Ac.play(k); };

// ------------------------------------------------------------------ per frame
Ac.update = function (dt) {
  const P = Game.P, e = P.emote; if (!e) return;
  if (P.act || P.atk || P.ride || P.swim || Game.cineOn || Game.mode !== 'play' || !P.grounded || P.carry || P.sit || P.kneel || P.sleeping) { Ac.stop(); return; }
  e.t += dt; if (e.dur && e.t >= e.dur) { Ac.stop(); return; }
  if (e.k === 'clap' || e.k === 'dance2') { e.ct = (e.ct || 0) - dt; if (e.ct <= 0) { e.ct = e.k === 'clap' ? 0.334 : 0.507; sfx('clap', { pitch: 0.9 + Math.random() * 0.2, vol: 0.55 }); } }
  if (e.k === 'flute' && tune) { tune.next -= dt; if (tune.next <= 0) { const n = tune.song[tune.i % tune.song.length]; tune.i++; if (n[0]) sfx('ney', { note: n[0], dur: n[1] * 0.42 * 0.95, gap: 0.01 }); tune.next = n[1] * 0.42; if (tune.i % tune.song.length === 0) tune.next += 0.9; }
    // sheep and goats nearby come and listen
    if (Math.random() < dt * 0.6) for (const a of Game.ENT.animals) { if (Math.hypot(a.x - P.x, a.z - P.z) < 14 && Math.random() < 0.3) { a.tx = P.x + (Math.random() - 0.5) * 3; a.tz = P.z + (Math.random() - 0.5) * 3; a.wait = -1; } } }
  if (e.k === 'pet' && !e.done && e.t > 0.9) { e.done = true; const a = P.petTarget; if (a) { const sp = a.sp || (a.m && a.m.sp) || (a.d && a.d.animal) || 'sheep';
      sfx(sp === 'goat' ? 'goat' : sp === 'camel' ? 'camel' : sp === 'donkey' || sp === 'horse' ? 'hoof' : 'bleat', { pitch: 1.05 + Math.random() * 0.2 });
      G.FX.burst(a.x, (a.y || P.y) + 1.0, a.z, 8, { c: [1, 0.62, 0.7], sp: 0.5, up: 1.1, size: 0.16, g: -0.2 });
      const S = Game.S(); S.flags.petted = (S.flags.petted || 0) + 1; if (S.flags.petted === 1 || S.flags.petted % 10 === 0) UI.toast(rnd(['기분이 좋은지 꼬리를 흔들어요', '포근한 털이 따뜻해요', '고개를 비비며 따라와요'])); } }
  if (e.k === 'lie' && !e.slept && e.t > 2.6) { e.slept = true; const h = Game.hour(); if ((h >= 19.5 || h < 4.5) && !UI.busy()) UI.say([{ n: '', t: '별이 쏟아지는 밤이에요. 이대로 아침까지 잘까요?', choices: [{ t: '별을 보며 잔다', then: () => setTimeout(() => { Ac.stop(); Game.sleep(); }, 50) }, { t: '조금 더 누워 있는다' }] }]); }
};

// ------------------------------------------------------------------ village life: now and then someone stretches, laughs, children dance
let ambT = 5;
Ac.ambient = function (dt) {
  ambT -= dt; if (ambT > 0) return; ambT = 3.5 + Math.random() * 5; const P = Game.P;
  if (Game.mode !== 'play' || Game.cineOn) return;
  const c = Object.values(Game.ENT.npcs).filter(n => n.vis && n.near && !n.d.animal && !n.walk && !n.talking && !n.sit && !n.d.sit && !n.emote && !n.act && !n.pass && !n.follow && !n.sleep && !n.schedHidden && !n.d.kneel
    && (!n.wander || n.wander.wait > 0) && Math.hypot(n.x - P.x, n.z - P.z) < 40);
  if (!c.length) return; const n = rnd(c), kid = !!(n.d.look && n.d.look.kid) || !!(n.d.folk && n.d.folk.age === 'kid');
  const k = kid ? rnd(['dance', 'cheer', 'wave', 'laugh', 'dance2']) : rnd(['crossArms', 'think', 'laugh', 'stretch', 'point', 'clap', 'crossArms', 'stretch']);
  const dur = 2.5 + Math.random() * 2.5; n.emote = { k, t: 0, dur, amb: true }; if (n.wander) n.wander.wait = Math.max(n.wander.wait, dur);
};
// ------------------------------------------------------------------ helpers
function nearestAnimal(r) {
  const P = Game.P; let best = null, bd = r;
  const consider = (a, x, z) => { const d = Math.hypot(x - P.x, z - P.z); if (d < bd) { bd = d; best = a; } };
  for (const a of Game.ENT.animals || []) consider(a, a.x, a.z);
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.d.animal && n.vis && !(G.Combat && n.d.hostile)) consider(n, n.x, n.z); }
  if (G.Ride && G.Ride.list) for (const m of G.Ride.list) if (m !== P.ride) consider(m, m.x, m.z);
  return best;
}
function nearestFire(r) { const P = Game.P, EP = Game.EP(), S = Game.S(); let best = null, bd = r;
  for (const s of EP.stations || []) { if (s.type !== 'fire' || (s.on && !s.on(S, Game))) continue; const d = Math.hypot(s.x - P.x, s.z - P.z); if (d < bd) { bd = d; best = s; } }
  return best; }
// shepherd tunes on the reed pipe: [midi, beats] (0 = rest) — modal, Middle-Eastern flavour (D hijaz / D dorian)
const SONGS = [
  [[62, 1], [63, 1], [66, 2], [67, 1], [69, 1], [67, 1], [66, 1], [63, 2], [62, 3], [0, 1]],
  [[69, 1], [70, 1], [69, 1], [67, 1], [66, 2], [67, 1], [69, 1], [74, 2], [72, 1], [70, 1], [69, 3], [0, 1]],
  [[62, 2], [65, 1], [67, 1], [69, 2], [67, 1], [65, 1], [64, 1], [62, 1], [60, 2], [62, 3], [0, 1]],
  [[74, 1], [72, 1], [70, 1], [69, 1], [70, 2], [69, 1], [67, 1], [66, 2], [67, 1], [66, 1], [63, 1], [62, 3], [0, 1]] ];

// ------------------------------------------------------------------ villagers answer
const ANS = {
  wave: { act: 'wave', dur: 2, kid: ['안녕!', '여기요, 여기!', '반가워요!'], adult: ['평안하시오!', '어서 오시오!', '반갑소!', '좋은 날이오!', '어디 가는 길이오?', '샬롬!'] },
  bow: { act: 'bow', dur: 1.6, kid: ['안녕하세요!'], adult: ['평안하시오.', '샬롬.', '어서 오시게.', '하나님이 함께하시길.', '복 받으시오.'] },
  prostrate: { act: 'bow', dur: 1.8, kid: ['…?'], adult: ['일어나시오, 일어나시오.', '어찌 이리 예를 갖추시오.'] },
  dance: { act: 'clap', kidAct: 'dance', dur: 5, kid: ['나도 출래!', '와아!', '빙글빙글!'], adult: ['흥겹구려!', '하하, 잘 추는구먼!', '좋은 날이로군!'] },
  dance2: { act: 'clap', kidAct: 'dance2', dur: 5, kid: ['같이 돌아요!', '손잡고 돌자!'], adult: ['잔칫날 같구려!', '옛 노래가 생각나는군.'] },
  flute: { act: 'clap', kidAct: 'dance', dur: 4, kid: ['피리다!', '또 불어 줘요!'], adult: ['피리 소리가 곱구려.', '목동의 노래로군.', '마음이 편해지는구려.'] },
  clap: { act: 'clap', dur: 2.5, kid: ['짝짝짝!'], adult: ['무슨 좋은 일이오?'] },
  cheer: { act: 'cheer', dur: 2, kid: ['야호!'], adult: ['좋은 일이 있나 보오!', '축하하오!'] },
  laugh: { act: 'laugh', dur: 2.2, kid: ['히히히!'], adult: ['허허허!', '뭐가 그리 즐겁소?'] },
  weep: { act: 'think', dur: 3, kid: ['아저씨, 울지 마요…'], adult: ['무슨 일이오?', '울지 마시오…', '하나님께서 위로하시길.'] },
  pray: { act: 'bow', dur: 1.8, kid: ['…'], adult: ['아멘.', '여호와께서 들으시길.'] },
  raiseHands: { act: 'raiseHands', dur: 3, kid: ['나도!'], adult: ['여호와를 찬양하오!', '그분은 선하시오.'] } };
function react(k) {
  const a = ANS[k]; if (!a) return; const P = Game.P; let said = 0;
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (!n.vis || !n.near || n.d.animal || n.talking || n.walk || n.pass || n.follow || n.schedHidden || n.sleep || n.d.kneel || n.d.hostile) continue;
    const d = Math.hypot(n.x - P.x, n.z - P.z); if (d > 11 || Math.random() > 0.8) continue;
    const kid = !!(n.d.look && n.d.look.kid) || !!(n.d.folk && n.d.folk.age === 'kid');
    if (!n.sit && !n.d.sit) n.emote = { k: (kid && a.kidAct) || a.act, t: -(0.25 + Math.random() * 0.7), dur: a.dur + Math.random() };
    if (said < 2 && G.Life && G.Life.bubble && Math.random() < 0.8) { said++; setTimeout(() => G.Life.bubble(n.id, rnd(kid ? a.kid : a.adult), 2.4), 300 + said * 500); } }
}

// ------------------------------------------------------------------ the 동작 sheet
const ICO = { rest: '<path d="M4 17h16M6 17v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" />', faith: '<path d="M12 3v18M7 8h10" />', social: '<path d="M8 13c-2-3-2-7 1-8M16 13c2-3 2-7-1-8M7 14c1 4 9 4 10 0" />', play: '<path d="M4 20 18 6M15 5l4 4M9 15l1.5 1.5M12 12l1.5 1.5" />' };
Ac.open = function () {
  if (UI.busy() || Game.mode !== 'play') return;
  const P = Game.P, cur = UI._emoTab || 'rest';
  UI.openPanel('동작', TABS.map(t => [t[0], t[1]]), cur, (tab, body) => {
    UI._emoTab = tab; const T = TABS.find(t => t[0] === tab);
    body.innerHTML = `<div class="emo-grid">${T[2].map(k => k === 'photo' ? `<button class="emo" data-photo="1"><b>사진 모드</b><span>화면의 표시를 숨겨요</span></button>`
      : `<button class="emo${P.emote && P.emote.k === k ? ' on' : ''}" data-k="${k}"><b>${DEF[k][0]}</b><span>${DEF[k][1].d || (DEF[k][1].rest ? '쉬면 기력이 빨리 차요' : DEF[k][1].walk ? '걸으면서도 할 수 있어요' : DEF[k][1].hold ? '움직이면 멈춰요' : '')}</span></button>`).join('')}</div>
      <p class="emo-note">${tab === 'rest' ? '앉거나 누워 쉬면 기력이 2.5배 빨리 차고 배도 덜 고파요. 밤에 누우면 그대로 잠들 수 있어요.' : tab === 'faith' ? '제단 앞이 아니어도 어디서나 기도할 수 있어요.' : tab === 'social' ? '가까운 주민들이 손을 흔들어 주거나 같이 웃어 줘요.' : '피리를 불면 아이들이 춤추고 양들이 모여들어요.'}</p>`;
    body.onclick = e => { const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.photo) { UI.closePanel(); Ac.photo(true); return; }
      const k = b.dataset.k; UI.closePanel(); setTimeout(() => Ac.toggle(k), 60); };
  });
};
// photo mode: hide the HUD, keep the sticks working (invisibly) to frame the shot
Ac.photo = function (on) {
  document.body.classList.toggle('photo', !!on); let bar = $('photoBar');
  if (on && !bar) { bar = document.createElement('div'); bar.id = 'photoBar'; bar.innerHTML = '<span>사진 모드 · 끌어서 구도 잡기</span><button class="sbtn" id="photoPose">동작</button><button class="sbtn" id="photoX">끝내기</button>'; document.body.appendChild(bar);
    $('photoX').onclick = () => Ac.photo(false); $('photoPose').onclick = () => { Ac.photo(false); Ac.open(); }; }
  if (bar) bar.hidden = !on;
};
// hotbar button
(function mount() {
  const hot = $('hot'); if (!hot || $('emoBtn')) return;
  const b = document.createElement('button'); b.id = 'emoBtn'; b.setAttribute('aria-label', '동작 · 앉기, 기도, 인사, 피리');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#e5b552" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.2"/><path d="M12 8v6M12 14l-3 6M12 14l3 6M7 10.5l5-1.5 5 1.5"/></svg><span>동작</span>';
  b.onclick = () => { if (Game.P.emote && DEF[Game.P.emote.k] && DEF[Game.P.emote.k][1].hold) Ac.stop(); else Ac.open(); };
  hot.insertBefore(b, $('bagBtn'));
})();
})(window.G);
