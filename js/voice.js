/* 약속의 길 — 사람과 짐승의 목소리 (v18.49 처음 · v18.52 엔진을 새로 만듦)
   음성 파일 없이, 목청에서 나는 소리를 한 표본씩 계산해서 만들어요(클랫 방식 포먼트 합성).
   · 목청: 성대가 한 번 열렸다 닫힐 때마다 숨이 터져 나오는 모양(KLGLOTT88)을 쓰고, 떨림마다 길이(지터)와 세기(쉬머)가 조금씩 흔들려요.
     기계처럼 들리던 까닭이 「너무 고른 떨림」이었어요. 사람 목소리는 한 번도 똑같이 떨리지 않아요.
   · 입과 목: 다섯 개의 공명(포먼트)을 차례로 지나며 「아·어·오·우·으·이·에」가 되고, 「ㅎ·ㅁ·ㄴ·ㅇ·ㄱ·ㄷ」도 흉내 내요. 숨 들이쉬기(헉·흡)도 있어요.
   · 감정은 논문에서 찾은 음향 특징으로 정했어요.
     - 기쁨·놀람·화남은 높고 넓은 음높이, 빠르기, 밝은 소리 / 슬픔·다정함은 낮고 좁은 음높이, 느리기, 어두운 소리
       (Juslin & Laukka 2003, Psychological Bulletin 129 · Banse & Scherer 1996, JPSP 70)
     - 목소리 결: 긴장된 목소리 = 화남·기쁨·관심, 숨 섞인 목소리 = 다정함·슬픔·미안함, 끝이 갈라지는 목소리(크리키) = 지침·담담함
       (Gobl & Ní Chasaide 2003, Speech Communication 40 · Yanushevskaya, Gobl & Ní Chasaide 2013, Frontiers in Psychology 4)
     - 웃음: 말할 때보다 음높이가 두 배쯤 높고, 짧은 「하」가 이어지며 차츰 낮아지고 약해져요. 남자는 숨소리 웃음이 많아요. 끝에 숨을 들이쉬어요.
       (Bachorowski, Smoski & Owren 2001, JASA 110)
     - 높은 음 = 작고 순하고 다정한 느낌, 낮은 음 = 크고 힘센 느낌 (Ohala 1984, Phonetica 41) · 떨림이 불규칙할수록 괴롭게 들려요(울음).
     - 말 없는 감탄(웃음·한숨·안도·울음·놀람)은 음높이·소리 빛깔·세기 모양이 저마다 달라요 (Sauter, Eisner, Calder & Scott 2010, QJEP 63)
   · 짐승 소리도 같은 엔진으로, 웹에서 찾은 연구값을 따라 만들었어요(아래 AN 참고).
   · 설정 → 「추임새 소리」로 사람 소리를 끌 수 있어요(짐승 소리는 효과음 크기를 따라요). 끄기(이 방문만): ?voice=0 */
'use strict';
(function (G) {
const Game = G.Game, UI = G.UI, Au = G.Audio; if (!Game || !UI) return;
const MUTE = /[?&]voice=0\b/.test(location.search);
const on = () => false; /* v18.52d people make no sounds of their own any more, as asked (the recordings are kept outside the game, in 음성_보관); gestures stay */
const hash = s => { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const pick = (a, r) => a[Math.floor((r === undefined ? Math.random() : r) * a.length) % a.length];
const R_ = (a, b) => a + Math.random() * (b - a), ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const TAU = Math.PI * 2, SR = 22050;

// ================================================================== 1. the engine
/* Korean vowels for a grown man (Hz, F1–F5); women ×1.16, children ×1.33. sh = the central vowel of laughter; m · n · ng = nasal murmurs */
const VF = { a: [740, 1300, 2550, 3450, 4250], eo: [590, 1040, 2500, 3400, 4200], o: [420, 760, 2450, 3300, 4100], u: [330, 850, 2300, 3300, 4100], eu: [370, 1450, 2450, 3400, 4200],
  i: [290, 2250, 3000, 3650, 4300], e: [480, 1880, 2580, 3500, 4250], sh: [520, 1450, 2480, 3400, 4200], m: [260, 1150, 2250, 3200, 4000], n: [270, 1650, 2550, 3300, 4100], ng: [280, 2000, 2700, 3400, 4100] };
const NAS = { m: 1, n: 1, ng: 1 }, BW = [70, 95, 140, 220, 290];
function setRes(r, F, B) { if (F > SR * 0.46 || F < 30) { r.a = 1; r.b = 0; r.c = 0; return; } const e = Math.exp(-Math.PI * B / SR); r.c = -e * e; r.b = 2 * e * Math.cos(TAU * F / SR); r.a = 1 - r.b - r.c; }
/* formants of a segment (start or end): its own (F / Fe for beasts), its vowel, or — for ㅎ, a pause, a stop — the vowel that comes next */
function fmOf(s, segs, si, fk, end) {
  if (s.F) return end && s.Fe ? s.Fe : s.F;
  let ph = end && s.to ? s.to : s.ph;
  if (!VF[ph]) { ph = 'sh'; for (let k = si + 1; k < segs.length; k++) if (VF[segs[k].ph]) { ph = segs[k].ph; break; } }
  const f = VF[ph]; return [f[0] * fk, f[1] * fk, f[2] * fk, f[3] * fk, f[4] * fk];
}
/* render a list of segments to samples.
   segment: { ph, d (s), p: [start, (peak,) end] pitch (× voice f0, or Hz for beasts), pk (where the peak is, 0–1), to (vowel to glide into), a (loudness),
              av (voicing 0–1), an (breath noise 0–1), br (+breathiness), oq (open quotient), tilt, jit (× jitter), sub (rough, every other pulse weaker),
              cr (creaky end, 0–1), ing (a breath drawn in), am / fm ([rate, depth] wobble of loudness / pitch), wh ([from, to, level] a whistle), att, rel, gap, bw }
   voice:   { f0, fk, oq, jit, sh (shimmer), br, tilt, sub, vib [rate, depth], trem [rate, depth], whMix } */
function render(segs, vo) {
  let tot = 0.12; for (const s of segs) tot += s.d + (s.gap || 0);
  const N = Math.ceil(tot * SR), out = new Float32Array(N), wb = new Float32Array(N); let anyW = false;
  const R = [0, 1, 2, 3, 4].map(() => ({ a: 1, b: 0, c: 0, y1: 0, y2: 0 }));
  const fk = vo.fk || 1, cur = fmOf(segs[0], segs, 0, fk, 0).slice(), sm = 1 - Math.exp(-32 / (SR * 0.016)); /* formants glide with ~16 ms lag (coarticulation) */
  const vib = vo.vib || [R_(4.5, 6), 0.006], trem = vo.trem || [0, 0], trP = Math.random() * TAU;
  let ph = Math.random(), jc = 0, sc = 1, alt = 1, per = 0, tl = 0, ln = 0, dr = 0, wph = 0, n = 0;
  for (let si = 0; si < segs.length && n < N; si++) {
    const s = segs[si], ns = Math.max(1, Math.round(s.d * SR)), ng = Math.max(0, Math.round((s.gap || 0) * SR));
    const Fa = fmOf(s, segs, si, fk, 0), Fb = fmOf(s, segs, si, fk, 1), nas = NAS[s.ph] ? 1 : 0, quiet = s.ph === '_';
    const av = quiet ? 0 : s.av !== undefined ? s.av : s.ph === 'h' ? 0 : 1, an = quiet ? 0 : s.an !== undefined ? s.an : s.ph === 'h' ? 0.55 : 0;
    const oq = clamp(s.oq || vo.oq || 0.55, 0.3, 0.92), br = Math.max(0, (vo.br || 0) + (s.br || 0)), tilt = clamp((vo.tilt === undefined ? 0.35 : vo.tilt) + (s.tilt || 0), 0, 0.93);
    const jit = (vo.jit || 0.01) * (s.jit || 1), shim = (vo.sh || 0.05) * (s.jit || 1), sub = Math.min(0.9, (vo.sub || 0) + (s.sub || 0)), cr = s.cr || 0;
    const att = Math.max(0.002, s.att !== undefined ? s.att : 0.025), rel = Math.max(0.002, s.rel !== undefined ? s.rel : 0.045), A = s.a !== undefined ? s.a : 1, bk = (s.bw || 1) * (s.ing ? 1.8 : 1);
    const P = s.p, p0 = P[0], p1 = P[P.length - 1], pm = P.length > 2 ? P[1] : null, pk = s.pk || 0.4, am = s.am, fm = s.fm, wh = s.wh;
    for (let j = 0; j < ns + ng && n < N; j++, n++) {
      const inS = j < ns, u = inS ? j / ns : 1, t = n / SR;
      if ((n & 31) === 0) { for (let k = 0; k < 5; k++) { cur[k] += (Fa[k] + (Fb[k] - Fa[k]) * u - cur[k]) * sm; setRes(R[k], cur[k], BW[k] * bk * (nas && k ? 2.4 : 1) * (k === 0 ? 1 + (oq - 0.5) * 1.5 : 1)); } dr += (Math.random() * 2 - 1) * 0.0035 - dr * 0.05; }
      let env = 0; if (inS) { const x = Math.min(1, j / SR / att, (ns - j) / SR / rel); env = x * x * (3 - 2 * x) * A; if (am) env *= 1 - am[1] * (0.5 + 0.5 * Math.sin(TAU * am[0] * t)); }
      const pr = pm === null ? p0 + (p1 - p0) * u : u < pk ? p0 + (pm - p0) * Math.sin(u / pk * 1.5708) : pm + (p1 - pm) * (1 - Math.cos((u - pk) / (1 - pk) * 1.5708));
      const creak = cr > 0 && u > 1 - cr;
      let f0 = (vo.f0 || 1) * pr * (1 + vib[1] * Math.sin(TAU * vib[0] * t) + trem[1] * Math.sin(TAU * trem[0] * t + trP) + dr + (fm ? fm[1] * Math.sin(TAU * fm[0] * t) : 0)) * (creak ? 0.6 : 1); if (f0 < 20) f0 = 20;
      ph += f0 * (1 + jc) / SR;
      if (ph >= 1) { ph -= Math.floor(ph); per++; const ir = creak ? 5 : 1; jc = (Math.random() * 2 - 1) * jit * ir; sc = 1 + (Math.random() * 2 - 1) * shim * ir; alt = sub > 0 && (per & 1) ? 1 - sub : 1; if (creak && Math.random() < 0.3) alt *= 0.4; }
      let g = 0, fl = 0; if (ph < oq) { const x = ph / oq; g = 2 * x - 3 * x * x; fl = x * x - x * x * x; }
      tl += (g * av * sc * alt * env - tl) * (1 - tilt); /* the glottal pulse, its high end rolled off (spectral tilt) */
      const w = Math.random() * 2 - 1; ln += (w - ln) * 0.55;
      let x = tl * 4 + ln * env * (an + br * av * (0.3 + fl * 6)) * 0.9; /* breath: steady (ㅎ, whisper) + puffs at each opening (breathy voice) */
      for (let k = 0; k < 5; k++) { const r = R[k], y = r.a * x + r.b * r.y1 + r.c * r.y2; r.y2 = r.y1; r.y1 = y; x = y; }
      out[n] = x;
      if (wh && inS) { anyW = true; wph += (wh[0] + (wh[1] - wh[0]) * u) * (1 + trem[1] * Math.sin(TAU * trem[0] * t) + (fm ? fm[1] * 0.5 * Math.sin(TAU * fm[0] * t) : 0)) / SR; wph -= Math.floor(wph); wb[n] = Math.sin(TAU * wph) * env * (wh[2] || 1); }
    }
  }
  let m = 0; for (let k = 0; k < N; k++) { const v = Math.abs(out[k]); if (v > m) m = v; } const kn = m > 1e-9 ? 0.9 / m : 0;
  const mix = anyW ? (vo.whMix === undefined ? 0.4 : vo.whMix) : 0; let px = 0, py = 0;
  for (let k = 0; k < N; k++) { const x = out[k] * kn * (1 - mix * 0.5) + wb[k] * mix, y = x - px + 0.995 * py; px = x; py = y; out[k] = y; } /* + a DC blocker */
  const fade = Math.min(N, Math.round(SR * 0.03)); for (let k = 0; k < fade; k++) out[N - 1 - k] *= k / fade;
  return out;
}
/* plain tones for birdsong: { d, f: [from, to], c (curve), fm, a, att, rel (fractions), h2, h3, gap } */
function tones(notes) {
  let tot = 0.05; for (const s of notes) tot += s.d + (s.gap || 0); const N = Math.ceil(tot * SR), out = new Float32Array(N); let n = 0, ph = 0;
  for (const s of notes) { const ns = Math.round(s.d * SR), ng = Math.round((s.gap || 0) * SR);
    for (let j = 0; j < ns + ng && n < N; j++, n++) { if (j >= ns) continue; const u = j / ns, t = n / SR;
      const f = (s.f[0] + (s.f[1] - s.f[0]) * (s.c ? u * u : u)) * (1 + (s.fm ? s.fm[1] * Math.sin(TAU * s.fm[0] * t) : 0)); ph += f / SR; ph -= Math.floor(ph);
      const a = Math.min(1, u / (s.att || 0.15), (1 - u) / (s.rel || 0.3)), e = a * a * (3 - 2 * a) * (s.a || 1);
      out[n] = (Math.sin(TAU * ph) + (s.h2 === undefined ? 0.12 : s.h2) * Math.sin(2 * TAU * ph) + (s.h3 || 0) * Math.sin(3 * TAU * ph)) * e * 0.6; } }
  return out;
}
/* pos: { x, y, z, npc } — a voice from someone in the world goes through the surround space (audio.js Au.space): distance, left/right, echo; at most three at once */
function playBuf(data, dest, when, vol, pan, pos) {
  const A = Au && Au.core && Au.core(); if (!A || !data || !data.length) return 0; const c = A.ctx, SPc = Au.space;
  try { const b = c.createBuffer(1, data.length, SR); b.getChannelData(0).set(data);
    const s = c.createBufferSource(); s.buffer = b; const g = c.createGain(); g.gain.value = vol === undefined ? 1 : vol; s.connect(g);
    if (pos && !dest && SPc && c.createPanner) { const d = SPc.dist(pos.x, pos.y, pos.z); if (d > 40) return 0; const a = SPc.claim('voice', d, data.length / SR + 0.1, g, pos.npc); if (!a) return 0;
      const ch = SPc.chain(A.bus, pos.x, pos.y, pos.z, { ref: 2.5, ttl: data.length / SR + 1 }); a.pn = ch.pn; g.connect(ch.inp); s.start(Math.max(c.currentTime + 0.02, when || 0)); s.onended = () => { try { g.disconnect(); } catch (e) { } }; return data.length / SR; }
    let nd = g; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); nd = p; }
    nd.connect(dest || A.bus); if (!dest && A.verb) { const sv = c.createGain(); sv.gain.value = 0.1; nd.connect(sv); sv.connect(A.verb); }
    s.start(Math.max(c.currentTime + 0.02, when || 0)); s.onended = () => { try { nd.disconnect(); g.disconnect(); } catch (e) { } };
  } catch (e) { return 0; }
  return data.length / SR;
}

// ================================================================== 2. people
/* kinds of voice: f0 · formant scale · open quotient · jitter · shimmer · breath · tilt · loudness · tremor (older voices shake a little, ~5 Hz) */
const VT = {
  man: { f0: 112, fk: 1.0, oq: 0.55, jit: 0.012, sh: 0.05, br: 0.06, tilt: 0.35, loud: 1.0 },
  woman: { f0: 208, fk: 1.16, oq: 0.62, jit: 0.01, sh: 0.05, br: 0.1, tilt: 0.42, loud: 0.92 },
  oldman: { f0: 104, fk: 0.98, oq: 0.6, jit: 0.028, sh: 0.1, br: 0.16, tilt: 0.5, loud: 0.95, trem: [5.2, 0.022] },
  oldwoman: { f0: 182, fk: 1.12, oq: 0.66, jit: 0.025, sh: 0.09, br: 0.16, tilt: 0.52, loud: 0.88, trem: [5.5, 0.025] },
  kid: { f0: 285, fk: 1.33, oq: 0.6, jit: 0.01, sh: 0.05, br: 0.08, tilt: 0.38, loud: 0.85 } };
/* how each feeling bends the voice (× mean pitch, × pitch range, × tempo, + open quotient, + breath, + tilt, × jitter, × loudness, creak, tremor) */
const EMO = {
  laugh: { f0: 1.55, rng: 1.2, rate: 1, oq: -0.05, br: 0.12, tilt: -0.08, jit: 1.2, loud: 1 },
  happy: { f0: 1.22, rng: 1.5, rate: 1.15, oq: -0.06, tilt: -0.12, jit: 0.8, loud: 1 },
  greet: { f0: 1.12, rng: 1.2, rate: 1.05, oq: -0.03, br: 0.02, tilt: -0.05, jit: 0.9, loud: 0.85 },
  surprise: { f0: 1.35, rng: 1.6, rate: 1.2, oq: -0.08, br: 0.05, tilt: -0.1, loud: 1.05 },
  awe: { f0: 1.04, rng: 1.1, rate: 0.75, oq: 0.1, br: 0.22, tilt: 0.1, loud: 0.75 },
  tender: { f0: 0.97, rng: 0.8, rate: 0.8, oq: 0.12, br: 0.2, tilt: 0.15, jit: 0.9, loud: 0.62 },
  hmm: { f0: 0.93, rng: 0.7, rate: 0.85, oq: 0.05, br: 0.05, tilt: 0.12, jit: 1.2, loud: 0.65 },
  sigh: { f0: 0.86, rng: 0.6, rate: 0.75, oq: 0.15, br: 0.35, tilt: 0.2, jit: 1.8, loud: 0.7 },
  relief: { f0: 0.95, rng: 0.9, rate: 0.85, oq: 0.12, br: 0.35, tilt: 0.1, jit: 1.2, loud: 0.72 },
  cry: { f0: 1.4, rng: 1.2, rate: 0.9, oq: 0.12, br: 0.35, tilt: 0.1, jit: 3, loud: 0.8 },
  angry: { f0: 1.08, rng: 1.3, rate: 1.2, oq: -0.15, br: -0.03, tilt: -0.22, jit: 1.5, loud: 1.15, sub: 0.12 },
  fear: { f0: 1.4, rng: 0.8, rate: 1.3, oq: 0.08, br: 0.25, jit: 2.5, loud: 0.8, trem: [7, 0.05] },
  urgent: { f0: 1.25, rng: 1.2, rate: 1.35, oq: -0.1, br: 0.03, tilt: -0.15, loud: 1.05 } };
function voiceFor(vt, kind, seed) {
  const T = VT[vt] || VT.man, E = EMO[kind] || {}, s2 = (seed * 7.31) % 1;
  return { f0: T.f0 * (0.9 + seed * 0.2) * (E.f0 || 1), fk: T.fk * (0.96 + s2 * 0.08), oq: T.oq + (E.oq || 0), jit: T.jit * (E.jit || 1), sh: T.sh * (E.jit || 1),
    br: T.br + (E.br || 0) + s2 * 0.04, tilt: T.tilt + (E.tilt || 0), sub: E.sub || 0, trem: E.trem || T.trem, loud: T.loud * (E.loud || 1), vib: [4.5 + seed * 1.5, 0.006] };
}
/* the feeling's pitch range and tempo, applied to a phrase */
function shape(segs, kind) { const E = EMO[kind] || {}, k = E.rng || 1, r = E.rate || 1;
  return segs.map(s => { const o = Object.assign({}, s); if (!s.ing) o.p = s.p.map(x => 1 + (x - 1) * k); o.d = s.d / (s.ing ? Math.sqrt(r) : r); if (s.gap) o.gap = s.gap / r; return o; }); }

// ------------------------------------------------------------------ phrase pieces
const S = (ph, d, p0, p1, o) => Object.assign({ ph, d, p: [p0, p1] }, o);
const S3 = (ph, d, p0, pm, p1, o) => Object.assign({ ph, d, p: [p0, pm, p1] }, o);
const H = (d, a, o) => Object.assign({ ph: 'h', d, p: [1, 1], an: a === undefined ? 0.55 : a, att: 0.015, rel: 0.012 }, o);
/* a breath drawn in (헉 · 흡), cut off at the throat; av > 0 gives the squeak of a sob or a fright */
const IN = (ph, d, a, o) => Object.assign({ ph, d, p: [1.5, 1.7], ing: 1, an: a, av: 0, att: d * 0.6, rel: 0.012 }, o);
/* ㄱ · ㄷ: a short closure then a burst shaped like the next vowel ('i' for a final ㅅ/ㄷ) */
const STOP = (next, d, p) => [S('_', d, p || 1, p || 1), S(next, 0.014, p || 1, p || 1, { av: 0, an: 0.9, att: 0.001, rel: 0.01, bw: 1.6 })];
/* a laugh: 「h + vowel」 calls, ~4–5 a second, each a little lower and softer; often closed with a breath in (Bachorowski et al. 2001) */
function bout(v, n, p0, fall, dc, dg, hA, vA, o) { o = o || {}; const s = [];
  for (let i = 0; i < n; i++) { const k = n > 1 ? i / (n - 1) : 0, p = p0 * (1 - fall * k) * R_(0.96, 1.04), a = 1 - 0.45 * k;
    if (hA > 0) s.push(H(R_(0.03, 0.05), hA * a));
    s.push(S(v, dc * R_(0.8, 1.2), p * 1.02, p * 0.9, { a: a * vA, br: 0.15, att: 0.012, rel: 0.035, gap: i < n - 1 ? dg * R_(0.75, 1.3) : o.inhale ? 0.07 : 0 })); }
  if (o.inhale) s.push(IN('eo', R_(0.18, 0.26), 0.35, { av: o.squeak || 0, p: [1.6, 1.9] }));
  return s; }

// ------------------------------------------------------------------ what each feeling sounds like, per kind of voice (Korean interjections)
const LIB = {
  laugh: {
    man: [() => bout('a', ri(3, 5), 1.2, 0.18, 0.085, 0.12, 0.6, 1, { inhale: Math.random() < 0.4 }) /* 하하하 */, () => bout('eo', ri(3, 4), 1.0, 0.15, 0.1, 0.13, 0.55, 1) /* 허허허 */,
      () => bout('eu', ri(3, 5), 0.95, 0.1, 0.07, 0.1, 0.9, 0.3) /* 흐흐흐 — men laugh breathily more often */, () => [S3('a', 0.12, 1.05, 1.3, 1.25, { att: 0.01 })].concat(bout('a', 3, 1.3, 0.2, 0.08, 0.1, 0.6, 1)) /* 아하하하 */],
    woman: [() => bout('o', ri(3, 4), 1.2, 0.18, 0.08, 0.1, 0.45, 1) /* 호호호 */, () => bout('a', ri(4, 5), 1.3, 0.25, 0.075, 0.09, 0.5, 1, { inhale: Math.random() < 0.5, squeak: 0.2 }) /* 하하하하 (흡) */,
      () => bout('u', 2, 1.05, 0.08, 0.08, 0.14, 0.8, 0.35) /* 후후 */, () => [S3('a', 0.18, 1.0, 1.4, 1.3)].concat(bout('a', 3, 1.35, 0.25, 0.075, 0.09, 0.5, 1)) /* 아하하 */],
    kid: [() => bout('i', ri(4, 6), 1.15, 0.15, 0.06, 0.07, 0.5, 1) /* 히히히 */, () => STOP('a', 0.03).concat(bout('a', ri(5, 7), 1.3, 0.3, 0.055, 0.05, 0.35, 1, { inhale: Math.random() < 0.6, squeak: 0.3 })) /* 까르르르 */],
    oldman: [() => bout('eo', 3, 0.95, 0.12, 0.13, 0.16, 0.6, 0.9).concat([S('_', 0.05, 1, 1), S('eo', 0.16, 0.85, 0.75, { a: 0.6, cr: 0.4 })]) /* 허허허, 허 */],
    oldwoman: [() => bout('o', 3, 1.1, 0.15, 0.11, 0.14, 0.5, 0.9) /* 호호호 */, () => [S('a', 0.08, 1.15, 1.2, { to: 'i' }), S('i', 0.05, 1.2, 1.2)].concat(STOP('o', 0.03, 1.2), [S('o', 0.12, 1.2, 1.1, { gap: 0.08 })], bout('o', 3, 1.15, 0.15, 0.1, 0.12, 0.5, 0.9)) /* 아이고 호호호 */] },
  surprise: {
    man: [() => [S3('o', 0.26, 1.0, 1.55, 1.2, { att: 0.006, pk: 0.35 })] /* 오! */, () => [S('eo', 0.3, 0.95, 1.65, { att: 0.008 })] /* 어?! */,
      () => [IN('eo', 0.17, 0.85, { att: 0.03, rel: 0.004 })] /* 헉! */, () => [S('eo', 0.09, 1.3, 1.4, { att: 0.004, rel: 0.006 })].concat(STOP('i', 0.04, 1.4)) /* 엇! */,
      () => [H(0.05, 0.5), S3('e', 0.4, 1.0, 1.05, 1.7, { pk: 0.3 })] /* 헤에? */],
    woman: [() => [S('eo', 0.1, 1.15, 1.32, { att: 0.006 }), S('m', 0.06, 1.32, 1.35, { a: 0.6 }), S3('eo', 0.22, 1.38, 1.45, 1.05, { pk: 0.25 })] /* 어머! */,
      () => [S('eo', 0.09, 1.15, 1.3, { att: 0.006 }), S('m', 0.05, 1.3, 1.32, { a: 0.6 }), S('eo', 0.08, 1.32, 1.35), S('n', 0.04, 1.35, 1.3, { a: 0.6 }), S3('a', 0.2, 1.3, 1.35, 0.95)] /* 어머나! */,
      () => [IN('eo', 0.16, 0.8, { av: 0.15, p: [1.7, 1.9] })] /* 흡! */, () => [H(0.05, 0.5), S3('e', 0.4, 1.0, 1.05, 1.75, { pk: 0.3 })] /* 헤에? */],
    kid: [() => [S('u', 0.09, 1.0, 1.05, { to: 'a' }), S3('a', 0.32, 1.1, 1.55, 1.25, { pk: 0.4 })] /* 우와! */, () => [S3('e', 0.4, 1.0, 1.0, 1.7)] /* 에에? */],
    oldman: [() => [S('eo', 0.13, 1.0, 1.15, { att: 0.01 }), H(0.06, 0.5), S3('eo', 0.3, 1.15, 1.3, 0.9, { cr: 0.2 })] /* 어허! */, () => [H(0.08, 0.55), S3('eo', 0.42, 1.0, 1.3, 0.85, { br: 0.2, cr: 0.25 })] /* 허어… */],
    oldwoman: [() => [S('a', 0.07, 1.2, 1.3, { to: 'i' }), S('i', 0.05, 1.3, 1.32)].concat(STOP('u', 0.025, 1.32), [S('u', 0.06, 1.35, 1.35), S('m', 0.05, 1.35, 1.3, { a: 0.6 }), S('eo', 0.06, 1.3, 1.3), S('n', 0.04, 1.3, 1.3, { a: 0.6 }), S3('i', 0.22, 1.35, 1.4, 0.95)]) /* 아이구머니! */,
      () => [S('eo', 0.1, 1.15, 1.3), S('m', 0.06, 1.3, 1.3, { a: 0.6 }), S3('a', 0.25, 1.4, 1.5, 1.0)] /* 어마! */] },
  happy: {
    man: [() => [S3('o', 0.22, 1.0, 1.3, 1.15, { pk: 0.5 })] /* 오! */, () => [S('a', 0.08, 1.0, 1.05), H(0.04, 0.45), S3('a', 0.24, 1.2, 1.35, 1.0)] /* 아하! */, () => [S('eu', 0.05, 1.0, 1.0, { a: 0.6 }), S3('m', 0.18, 1.0, 1.25, 1.1, { a: 0.8 })] /* 음! */],
    woman: [() => [S('u', 0.07, 1.0, 1.05, { to: 'a' }), S3('a', 0.3, 1.1, 1.45, 1.2)] /* 와아! */, () => [S('a', 0.08, 1.05, 1.1), H(0.04, 0.45), S3('a', 0.26, 1.25, 1.4, 1.05)] /* 아하! */,
      () => [S('eo', 0.08, 1.1, 1.15), S('m', 0.05, 1.15, 1.2, { a: 0.6 }), S3('a', 0.25, 1.3, 1.45, 1.2)] /* 어머~ */],
    kid: [() => [S('i', 0.05, 1.0, 1.05, { to: 'a' }), S('a', 0.14, 1.15, 1.3), H(0.035, 0.45), S3('o', 0.25, 1.4, 1.55, 1.3)] /* 야호! */, () => [S('u', 0.07, 1.0, 1.05, { to: 'a' }), S3('a', 0.3, 1.1, 1.5, 1.25)] /* 와아! */],
    oldman: [() => [S3('o', 0.3, 1.0, 1.2, 0.95, { br: 0.1 })] /* 오오 */, () => bout('eo', 2, 1.0, 0.1, 0.11, 0.12, 0.6, 0.9) /* 허허 */] },
  greet: {
    man: [() => [S('eo', 0.1, 1.0, 1.05, { to: 'i' }), S3('i', 0.2, 1.1, 1.2, 0.95)] /* 어이~ */, () => [S('i', 0.05, 1.0, 1.0, { to: 'eo' }), S3('eo', 0.28, 1.05, 1.18, 0.95)] /* 여어~ */, () => [S3('o', 0.24, 1.15, 1.2, 0.95)] /* 오~ */],
    woman: [() => [S('n', 0.05, 1.0, 1.05, { a: 0.6 }), S3('e', 0.3, 1.1, 1.25, 1.0, { pk: 0.35 })] /* 네~ */, () => [S3('a', 0.22, 1.0, 1.3, 1.15)] /* 아~! */, () => [S('eo', 0.08, 1.05, 1.1), S('m', 0.05, 1.1, 1.1, { a: 0.6 }), S3('eo', 0.22, 1.15, 1.25, 1.0)] /* 어머~ */],
    kid: [() => [S3('a', 0.2, 1.1, 1.3, 1.2)] /* 아! */, () => [S('i', 0.05, 1.0, 1.0, { to: 'a' }), S3('a', 0.25, 1.1, 1.35, 1.15)] /* 야아! */],
    oldman: [() => [S('o', 0.15, 1.05, 1.1), S('n', 0.05, 1.08, 1.05, { a: 0.6 }), S('i', 0.04, 1.05, 1.05, { to: 'a' }), S3('a', 0.3, 1.05, 1.1, 0.85, { cr: 0.2 })] /* 오냐~ */],
    oldwoman: [() => [S('eo', 0.08, 1.1, 1.15, { to: 'i' })].concat(STOP('u', 0.025, 1.15), [S3('u', 0.3, 1.15, 1.3, 1.0)]) /* 어이구~ */] },
  hmm: { all: [() => [S3('m', 0.45, 1.0, 1.04, 0.88, { a: 0.7, cr: 0.25 })] /* 음… */, () => [H(0.07, 0.4), S3('m', 0.35, 1.02, 1.05, 0.9, { a: 0.7, cr: 0.2 })] /* 흠… */,
    () => [S('eu', 0.12, 1.0, 0.98, { a: 0.7 }), S3('m', 0.35, 1.02, 1.06, 0.9, { a: 0.65, cr: 0.2 })] /* 으음… */, () => [S3('eo', 0.4, 1.0, 1.0, 0.92, { a: 0.6, cr: 0.3 })] /* 어… */] },
  sigh: {
    all: [() => [IN('eo', 0.38, 0.45), H(0.12, 0.55), S3('a', 0.6, 1.0, 0.95, 0.72, { a: 0.6, br: 0.35, cr: 0.3 })] /* (흡) 하아… */,
      () => [S('e', 0.14, 1.05, 1.0, { a: 0.7 }), H(0.07, 0.5), S('i', 0.04, 1.0, 1.0, { to: 'u', a: 0.7 }), S3('u', 0.45, 1.0, 0.95, 0.75, { a: 0.6, br: 0.3, cr: 0.3 })] /* 에휴… */],
    oldman: [() => [S('a', 0.12, 1.05, 1.1, { to: 'i' }), S('i', 0.06, 1.1, 1.1)].concat(STOP('o', 0.03, 1.05), [S3('o', 0.55, 1.05, 1.0, 0.72, { br: 0.25, cr: 0.35 })]) /* 아이고… */,
      () => [IN('eo', 0.38, 0.45), H(0.12, 0.55), S3('a', 0.6, 1.0, 0.95, 0.72, { a: 0.6, br: 0.35, cr: 0.3 })]],
    oldwoman: [() => [S('a', 0.12, 1.05, 1.1, { to: 'i' }), S('i', 0.06, 1.1, 1.1)].concat(STOP('o', 0.03, 1.05), [S3('o', 0.55, 1.05, 1.0, 0.72, { br: 0.25, cr: 0.35 })]) /* 아이고… */] },
  relief: { all: [() => [IN('eo', 0.3, 0.4), H(0.1, 0.6), S('i', 0.05, 1.0, 1.0, { to: 'u' }), S3('u', 0.5, 1.05, 1.0, 0.8, { a: 0.55, br: 0.4 })] /* (흡) 휴우~ */,
    () => [S('a', 0.1, 1.05, 1.0, { a: 0.7 }), H(0.07, 0.5), S('i', 0.04, 1.0, 1.0, { to: 'u' }), S3('u', 0.4, 1.0, 0.95, 0.8, { br: 0.35 })] /* 아휴~ */] },
  cry: {
    all: [() => [IN('eu', 0.12, 0.55, { av: 0.25, p: [1.5, 1.7], gap: 0.05 }), IN('eu', 0.1, 0.5, { av: 0.25, p: [1.6, 1.8] }), H(0.05, 0.5), S3('eu', 0.32, 1.2, 1.45, 1.0, { br: 0.3, a: 0.8, cr: 0.2 })] /* 흐윽… 흐흑 */,
      () => [H(0.05, 0.5), S3('eu', 0.15, 1.3, 1.4, 1.2, { gap: 0.09 }), H(0.04, 0.5), S3('eu', 0.14, 1.35, 1.45, 1.15, { gap: 0.08 }), IN('eu', 0.14, 0.55, { av: 0.3, p: [1.7, 1.9] })] /* 흐흑, 흑 (흡) */],
    kid: [() => [S('eu', 0.12, 1.1, 1.2, { to: 'a' }), S3('a', 0.55, 1.3, 1.55, 1.25, { to: 'ng', br: 0.2, gap: 0.04 }), IN('eu', 0.15, 0.6, { av: 0.3, p: [1.7, 2.0] })] /* 으아앙 (흡) */] },
  angry: {
    all: [() => [H(0.05, 0.85), S('eu', 0.07, 1.15, 1.1, { a: 0.8 }), S('ng', 0.13, 1.1, 0.85, { a: 0.7 })] /* 흥! */, () => 'tsk' /* 쯧쯧 */],
    man: [() => [S('eo', 0.12, 1.0, 1.12, { att: 0.006 }), H(0.05, 0.6), S3('eo', 0.28, 1.15, 1.2, 0.85)] /* 어허! */, () => [S('e', 0.1, 1.15, 1.25, { to: 'i', att: 0.005 }), S('i', 0.05, 1.25, 1.2)].concat(STOP('i', 0.04, 1.2)) /* 에잇! */, () => 'tsk'],
    woman: [() => [S('a', 0.07, 1.1, 1.15, { to: 'i' }), S('i', 0.05, 1.15, 1.2)].concat(STOP('a', 0.03, 1.2), [H(0.03, 0.6), S('a', 0.13, 1.25, 0.95), S('m', 0.07, 0.95, 0.9, { a: 0.6 })]) /* 아이참! */, () => [H(0.05, 0.85), S('eu', 0.07, 1.15, 1.1, { a: 0.8 }), S('ng', 0.13, 1.1, 0.85, { a: 0.7 })]] },
  fear: { all: [() => [IN('i', 0.2, 0.6, { av: 0.25, p: [1.5, 1.8] })] /* 히익! */, () => [S('eu', 0.14, 1.15, 1.2, { gap: 0.09, a: 0.7 }), S3('eu', 0.32, 1.2, 1.3, 1.05, { a: 0.7 })] /* 으, 으으… */,
    () => [S('eo', 0.1, 1.2, 1.25, { gap: 0.07, att: 0.006 }), S('eo', 0.1, 1.25, 1.3, { gap: 0.07 }), S3('eo', 0.3, 1.3, 1.4, 1.1)] /* 어, 어, 어어… */] },
  awe: { all: [() => [H(0.08, 0.45), S3('o', 0.62, 0.95, 1.18, 0.88, { br: 0.2, a: 0.8 })] /* 오오… */, () => [S('u', 0.09, 0.95, 1.0, { to: 'a' }), S3('a', 0.6, 1.0, 1.2, 0.9, { br: 0.2, a: 0.8 })] /* 와아… */],
    oldman: [() => [H(0.08, 0.5), S3('eo', 0.6, 1.0, 1.2, 0.85, { cr: 0.25 })] /* 허어… */] },
  tender: { all: [() => [S('eu', 0.05, 1.0, 1.0, { to: 'ng', a: 0.6 }), S3('ng', 0.38, 1.0, 1.12, 0.92, { a: 0.75 })] /* 응~ */, () => [S3('m', 0.4, 0.98, 1.1, 0.9, { a: 0.7 })] /* 음~ */],
    woman: [() => [S('a', 0.07, 1.05, 1.05, { to: 'i' })].concat(STOP('u', 0.025, 1.08), [S3('u', 0.4, 1.1, 1.2, 0.9)]) /* 아이구~ */, () => [S('eu', 0.05, 1.0, 1.0, { to: 'ng', a: 0.6 }), S3('ng', 0.38, 1.0, 1.12, 0.92, { a: 0.75 })]],
    oldwoman: [() => [S('eo', 0.07, 1.0, 1.05, { to: 'i' })].concat(STOP('u', 0.025, 1.05), [S3('u', 0.35, 1.05, 1.18, 0.9)]) /* 어이구~ */] },
  urgent: { all: [() => [S('eo', 0.09, 1.2, 1.28, { att: 0.005, gap: 0.06 }), S3('eo', 0.17, 1.3, 1.38, 1.15)] /* 어, 어! */,
    () => [S('eo', 0.07, 1.2, 1.3, { to: 'i', att: 0.005 }), S('i', 0.06, 1.3, 1.25, { gap: 0.05 }), S('eo', 0.07, 1.25, 1.3, { to: 'i' }), S('i', 0.08, 1.3, 1.15)] /* 어이, 어이! */] } };
const FALL = { oldman: ['man'], oldwoman: ['woman'], kid: ['woman'], woman: [], man: [] };
function phrase(kind, vt) { const L = LIB[kind]; if (!L) return null; let list = L[vt]; if (!list) for (const f of FALL[vt] || []) if (L[f]) { list = L[f]; break; } list = list || L.all || L.man; return list ? pick(list)() : null; }
/* 쯧쯧: two tongue clicks */
function tsk(vol, pan) { const A = Au && Au.core && Au.core(); if (!A) return; const c = A.ctx, t0 = c.currentTime + 0.02, d = Math.round(SR * 0.4), data = new Float32Array(d);
  for (const k of [0, 0.17]) { const i0 = Math.round(k * SR); for (let i = 0; i < 300; i++) data[i0 + i] = (Math.random() * 2 - 1) * Math.exp(-i / 45) * 0.8; }
  let a = 0, b = 0; for (let i = 0; i < d; i++) { const x = data[i]; a += (x - a) * 0.6; data[i] = x - a; b = data[i]; } /* bright: high-passed */
  playBuf(data, null, t0, (vol || 1) * 0.9, pan); }
/* a murmur of speech: random syllables falling in pitch through the phrase, like talk heard from across a yard */
function babble() { const s = [], n = ri(3, 7); let p = R_(1.0, 1.15);
  for (let i = 0; i < n; i++) { const c = pick(['h', 'm', 'n', 'k', 't', 'g', '_', '_']), v = pick(['a', 'eo', 'o', 'u', 'eu', 'i', 'e', 'a']);
    if (c === 'k' || c === 't') s.push(...STOP(c === 't' ? 'i' : v, 0.03, p)); else if (c === 'g') s.push(S('eu', 0.03, p, p, { a: 0.3, bw: 2.2 })); else if (c === 'h') s.push(H(0.04, 0.45)); else if (c !== '_') s.push(S(c, 0.045, p, p, { a: 0.6 }));
    s.push(S(v, R_(0.07, 0.13), p, p * R_(0.94, 1.04), { gap: Math.random() < 0.2 ? R_(0.05, 0.15) : 0, att: 0.015, rel: 0.02 })); p *= R_(0.95, 1.01); }
  return s; }

// ------------------------------------------------------------------ who is speaking, and what kind of voice
function voiceOf(n) { let p = null; try { p = G.Persona && G.Persona.of && n.id ? G.Persona.of(n.id) : null; } catch (e) { }
  const lk = (n.d && n.d.look) || {}, fem = p && p.fem !== undefined ? !!p.fem : !!lk.fem, age = p && p.age;
  const kid = age === 'kid' || lk.kid || (n.scale || 1) < 0.86, old = age === 'old' || lk.old || lk.age === 'old' || /노인|늙은|할머니|할아버지|장로|촌장|원로/.test(n.name || '') || /^(jacob|keeper|oldP)$/.test(n.id || '');
  return kid ? 'kid' : old ? (fem ? 'oldwoman' : 'oldman') : fem ? 'woman' : 'man'; }
const heroName = n => { const E = Game.EP && Game.EP(); return !n || (E && (n === E.hero || (E.heroName && n === E.heroName))) || /^요셉/.test(n) || n === '이스라엘'; };
function findNpc(name) { if (!name) return null; const E = Game.ENT && Game.ENT.npcs; if (!E) return null; const P = Game.P, C = Game.CAM, d0 = Game.dlgNpc;
  if (d0 && d0.name === name) return d0; let best = null, bd = 1e9;
  for (const id in E) { const m = E[id]; if (m.name !== name || !m.vis || (m.d && m.d.animal)) continue; const d = Math.min(Math.hypot(m.x - P.x, m.z - P.z), C && C.x !== undefined ? Math.hypot(m.x - C.x, m.z - C.z) : 1e9); if (d < bd) { bd = d; best = m; } }
  return bd < 45 ? best : null; }

// ------------------------------------------------------------------ the feeling of a line
const RX = { laugh: /하하|허허|호호|헤헤|히히|ㅎㅎ|ㅋㅋ|껄껄|깔깔|웃으며|웃음이|웃었/, surprise: /다니요!|라니요|이라니!|어머|세상에|헤에|정말(요|이오|이냐|이에요)?\?|뭐라고|깜짝|이럴 수가|놀랍|놀라|설마|우와|어찌 이런|아니[,!]|[?!]{2}|맙소사/,
  cry: /흑|엉엉|훌쩍|흐흑/, relief: /다행|휴우|휴,|살았다|한시름/, sigh: /아이고|에휴|하아|한숨/, angry: /흥[!.]|쳇|쯧|괘씸|어딜/, happy: /고맙|반갑|좋아요|좋소|좋구나|기쁘|잘됐|만세|축하|맛있/ };
const EMAP = { laugh: 'laugh', happy: 'happy', cry: 'cry', sad: 'sigh', weary: 'sigh', tired: 'sigh', fear: 'fear', awe: 'awe', angry: 'angry', shout: 'angry', cold: 'hmm', calm: 'hmm', solemn: 'hmm', tender: 'tender', urgent: 'urgent' };
function feelOf(L) { let t = String(L.t || ''); if (L.n) for (const w of String(L.n).split(/\s+/)) if (w.length > 1) t = t.split(w).join(' '); /* names (아이 하하, 히히 …) are not laughter */
  for (const k of ['laugh', 'surprise', 'cry']) if (RX[k].test(t)) return k;
  if (L.e && EMAP[L.e]) { const k = EMAP[L.e]; return k === 'happy' && /!/.test(t) && Math.random() < 0.35 ? 'laugh' : k === 'sigh' && RX.relief.test(t) ? 'relief' : k; }
  for (const k of ['relief', 'sigh', 'angry']) if (RX[k].test(t)) return k;
  if (RX.happy.test(t) && /!/.test(t)) return 'happy';
  if (/^…|…$|\.\.\.$/.test(t.trim())) return 'hmm';
  return null; }
/* how the body answers each feeling: [gesture, seconds, hops] */
const ACT = { laugh: ['laugh', 1.7, 0], surprise: ['surprise', 1.4, 2], happy: ['happy', 1.8, 1], greet: ['happy', 1.0, 0], hmm: ['think', 2.4, 0], sigh: ['weary', 2.2, 0], relief: ['tender', 2.0, 0], cry: ['cry', 2.6, 0], angry: ['angry', 1.8, 0], fear: ['fear', 1.6, 1], awe: ['awe', 2.2, 0], tender: ['tender', 2.2, 0], urgent: ['urgent', 1.6, 0] };
const STRONG = { laugh: 1, surprise: 1, cry: 1, angry: 1, fear: 1, sigh: 1, relief: 1, happy: 1, awe: 1, urgent: 1 };

// ------------------------------------------------------------------ v18.52b recorded voices (sound/voice/*.m4a)
/* People sound most human as people: 36 short Korean interjections were voiced with an AI voice actor (Higgsfield · Seed Audio / ElevenLabs),
   trimmed and levelled. A synthesized laugh is rated unnatural by listeners (1.71 of 5, ICASSP 2014), and breath intake is what makes a laugh
   believable (Eusipco 2015) — so where a recording exists it is used, and the synthesizer above only fills the feelings without one.
   Each speaker plays them a touch higher or lower (playback rate from their id), so two people never sound quite the same. */
const CLIPS = { man: { laugh: 3, surprise: 3, greet: 1, hmm: 1, sigh: 1, awe: 1, relief: 2 }, /* only sounds of feeling — no words */ woman: { laugh: 2, surprise: 3, hmm: 1, sigh: 1, cry: 1, tender: 1, fear: 1 }, /* v18.52c the ones that sounded wrong to the ear are out */
  oldman: { sigh: 1, laugh: 1, surprise: 1, hmm: 1 }, oldwoman: { laugh: 1, surprise: 1, sigh: 1, tender: 1 }, kid: { surprise: 1, happy: 1, cry: 1, laugh: 1 } };
/* a feeling with no recording of its own borrows a near one: [voice, feeling, rate] */
const ALIAS = { man: { happy: ['man', 'laugh'], fear: ['man', 'surprise'], urgent: ['man', 'surprise'] }, woman: { happy: ['woman', 'laugh'], relief: ['woman', 'sigh'], urgent: ['woman', 'surprise'] },
  oldman: { happy: ['oldman', 'laugh'], greet: ['oldman', 'laugh'], angry: ['oldman', 'surprise'], tender: ['oldman', 'laugh'], awe: ['man', 'awe', 0.93], relief: ['man', 'relief', 0.93] },
  oldwoman: { greet: ['oldwoman', 'tender'], happy: ['oldwoman', 'laugh'], hmm: ['woman', 'hmm', 0.93], cry: ['woman', 'cry', 0.93], relief: ['oldwoman', 'sigh'] }, kid: { greet: ['kid', 'happy'], awe: ['kid', 'surprise'] } };
const BUF = {}; let clipsAsked = false;
function loadClips() { const A = Au && Au.core && Au.core(); if (!on() || clipsAsked || !A) return; clipsAsked = true;
  for (const vt in CLIPS) for (const k in CLIPS[vt]) for (let i = 1; i <= CLIPS[vt][k]; i++) { const nm = vt + '_' + k + '_' + i;
    fetch('sound/voice/' + nm + '.m4a').then(r => r.ok ? r.arrayBuffer() : null).then(ab => ab && new Promise((ok, no) => A.ctx.decodeAudioData(ab, ok, no))).then(b => { if (b) BUF[nm] = b; }).catch(() => { }); } }
function clipFor(kind, vt) { let v = vt, k = kind, rate = 1; if (!(CLIPS[v] && CLIPS[v][k])) { const al = ALIAS[vt] && ALIAS[vt][kind]; if (!al) return null; v = al[0]; k = al[1]; rate = al[2] || 1; }
  const n = CLIPS[v] && CLIPS[v][k]; if (!n) return null; const pickN = []; for (let i = 1; i <= n; i++) if (BUF[v + '_' + k + '_' + i]) pickN.push(BUF[v + '_' + k + '_' + i]); return pickN.length ? { buf: pick(pickN), rate } : null; }
function playClip(c, seed, vol, dest, when, pos) { const A = Au && Au.core && Au.core(); if (!A) return 0; const ac = A.ctx, SPc = Au.space, rate = c.rate * (0.95 + (seed || 0.5) * 0.1), dur = c.buf.duration / rate;
  const s = ac.createBufferSource(); s.buffer = c.buf; s.playbackRate.value = rate; const g = ac.createGain(); g.gain.value = vol; s.connect(g);
  if (pos && !dest && SPc && ac.createPanner) { const d = SPc.dist(pos.x, pos.y, pos.z); if (d > 40) return 0; const a = SPc.claim('voice', d, dur + 0.1, g, pos.npc); if (!a) return 0; const ch = SPc.chain(A.bus, pos.x, pos.y, pos.z, { ref: 2.5, ttl: dur + 1 }); a.pn = ch.pn; g.connect(ch.inp); }
  else { g.connect(dest || A.bus); if (!dest && A.verb) { const sv = ac.createGain(); sv.gain.value = 0.1; g.connect(sv); sv.connect(A.verb); } }
  s.start(Math.max(ac.currentTime + 0.02, when || 0)); s.onended = () => { try { g.disconnect(); } catch (e) { } }; return dur; }
addEventListener('pointerdown', () => setTimeout(loadClips, 400), { once: true }); addEventListener('keydown', () => setTimeout(loadClips, 400), { once: true });

// ------------------------------------------------------------------ react
const V = G.Voice = { stats: { said: 0, acted: 0, beasts: 0, clips: 0 } };
let lastSay = 0, talkKey = null;
function speak(kind, vt, seed, vol, pan, dest, when, pos) { loadClips(); const cl = clipFor(kind, vt); if (cl) { V.stats.clips++; V.stats.said++; return playClip(cl, seed === undefined ? Math.random() : seed, (vol || 1) * 0.95 * ((EMO[kind] && EMO[kind].loud) || 1), dest, when, pos); }
  const ph = phrase(kind, vt); if (!ph) return 0; if (ph === 'tsk') { tsk(vol, pan); return 0.4; }
  const vo = voiceFor(vt, kind, seed === undefined ? Math.random() : seed); V.stats.said++; return playBuf(render(shape(ph, kind), vo), dest, when, (vol || 1) * vo.loud * 0.5, pan, pos); }
V.say = function (kind, vt, seed, vol, pan, pos) { if (!on()) return 0; return speak(kind, vt, seed, vol, pan, null, 0, pos); };
V.react = function (n, kind, o) { o = o || {}; if (!n || !kind) return; const a = ACT[kind];
  if (a && !o.noAct) { const vt = voiceOf(n); let g = a[0]; if (g === 'surprise' && (vt === 'man' || vt === 'oldman')) g = 'startle'; n._va = { k: g, dur: a[1], hops: vt === 'oldman' || vt === 'oldwoman' ? Math.min(1, a[2]) : vt === 'kid' && a[2] ? a[2] + 1 : a[2], t0: undefined }; V.stats.acted++; }
  if (!o.mute) V.say(kind, voiceOf(n), hash(n.id || n.name), o.vol || 1, 0, { x: n.x, y: (n.y || 0) + 1.55, z: n.z, npc: n }); };
/* called by game.js for every person in sight while a reaction lasts: the gesture, and a hop (n.hopY, metres) */
V.act = function (n, t, inScene) { if (n.talking && !inScene && !n.st.sit && !n.st.kneel && !n.st.sleep) { if (n.st.act) n.st.act = null; /* someone bent over their work straightens up to talk with the 총리 */ const P = Game.P; let d = Math.atan2(P.x - n.x, P.z - n.z) - n.face; d = Math.atan2(Math.sin(d), Math.cos(d)); n.face += d * 0.15; n.st.face = n.face; /* …and turns to face him */ } const a = n._va; if (!a) return; n.st.act = null; /* the reaction takes the whole body */ if (a.t0 === undefined) a.t0 = t; const e = t - a.t0;
  if (e > a.dur || e < 0) { n._va = null; n.hopY = 0; if (n.rig) n.rig.hopK = 0; return; }
  n.st.emo = a.k; n.st.emoK = Math.min(1, e * 6, (a.dur - e) * 3);
  let hy = 0; const HT = 0.3; if (a.hops && e < a.hops * HT) { const f = (e % HT) / HT; hy = Math.sin(Math.PI * f) * 0.16; }
  n.hopY = hy; if (n.rig) n.rig.hopK = hy / 0.16; if (hy > 0.01) n.st.gnd = null; };

/* a line in a talk */
UI.onLine = function (L) { if (!L || !L.n || heroName(L.n)) return; const n = findNpc(L.n); if (!n) return;
  const now = performance.now(), key = Game.dlgNpc ? Game.dlgNpc.id : L.n, first = talkKey !== key || now - lastSay > 20000; talkKey = key;
  let kind = feelOf(L); if (!kind && first) kind = 'greet'; /* the first word of a talk always has a little sound */ if (!kind) { const t = String(L.t || '').trim(); if (/!$/.test(t) && Math.random() < 0.35) kind = 'happy'; else if (/\?$/.test(t) && Math.random() < 0.25) kind = 'greet'; } /* now and then on an ordinary line too */ if (!kind) return;
  const strong = STRONG[kind], gap = now - lastSay; if (!strong && gap < 2500) return; if (strong && gap < 900) return; if (!strong && kind !== 'greet' && Math.random() < 0.5) { V.react(n, kind, { mute: true }); return; }
  lastSay = now; V.react(n, kind); };
/* a line in a scene: only clear feelings, a little softer (a solemn scene keeps its quiet) */
if (G.Cine) G.Cine.onShot = function (sh) { if (heroName(sh.n)) return; const kind = feelOf(sh); if (!kind || !(kind in { laugh: 1, surprise: 1, happy: 1, cry: 1, fear: 1, angry: 1, urgent: 1, relief: 1 })) return;
  const n = findNpc(sh.n); if (!n) return; const now = performance.now(); if (now - lastSay < 900) return; lastSay = now; V.react(n, kind, { vol: 0.75 }); };
/* words over someone's head (greetings in the street, a call across the yard): sometimes a sound, if near */
if (G.Life && G.Life.bubble) { const b0 = G.Life.bubble; let lastB = 0; G.Life.bubble = function (who, text) { const r = b0.apply(this, arguments);
  try { const now = performance.now(); if (now - lastB > 5000 && !UI.busy()) { const n = typeof who === 'string' ? (Game.ENT.npcs[who] || null) : who, P = Game.P; if (n && n.vis && Math.hypot(n.x - P.x, n.z - P.z) < 18) { const k = feelOf({ t: text }) || (Math.random() < 0.45 ? 'greet' : null); if (k) { lastB = now; V.react(n, k, { vol: 0.7 }); } } } } catch (e) { }
  return r; }; }
/* a sample when the setting is switched on */
V.demo = function () { const k = pick(['man', 'woman', 'oldman', 'kid']); setTimeout(() => V.say('laugh', k, 0.5, 0.9), 60); };

// ================================================================== 3. beasts
/* formants (Hz) by animal: longer throats, lower resonances */
const AF = { cowM: [230, 650, 1500, 2300, 3100], cowO: [480, 1050, 1900, 2600, 3200], shM: [320, 1250, 2300, 3200, 4000], shO: [650, 1600, 2550, 3400, 4200], goatO: [720, 1750, 2700, 3600, 4400],
  camel: [320, 760, 1500, 2300, 3100], camelO: [450, 950, 1700, 2500, 3300], hee: [950, 1950, 3000, 3800, 4600], haw: [520, 1100, 1900, 2800, 3600], horse: [520, 1350, 2300, 3200, 4000], nos: [300, 900, 1800, 2600, 3400],
  lion: [290, 860, 1430, 2000, 2570], canid: [560, 1500, 2600, 3600, 4500], canidU: [420, 1000, 2400, 3400, 4300], boar: [380, 950, 1800, 2700, 3500], hippo: [220, 560, 950, 1500, 2100],
  goose: [850, 1650, 2650, 3500, 4300], babA: [700, 1250, 2300, 3100, 3900], babU: [400, 850, 2200, 3000, 3800], hiss: [2400, 3600, 4600, 5600, 6800] };
const X = (d, h0, h1, F, o) => Object.assign({ ph: 'x', d, p: [h0, h1], F }, o);
const X3 = (d, h0, hm, h1, F, o) => Object.assign({ ph: 'x', d, p: [h0, hm, h1], F }, o);
/* each call: { vo (voice), segs, raw (already used o.p), vol, whMix } or { tone: [...] } */
const AN = {
  /* cattle — a low closed-mouth call near the calf (~81 Hz) or a loud open-mouth call when apart (~153 Hz, ~1.2 s), resonances ~230–3200 Hz
     (Padilla de la Torre, Briefer, Reader & McElligott 2015, Appl. Anim. Behav. Sci. 163 · Green, Johnston & Clark 2018, Animal) */
  moo: o => { const hi = !o.soft && Math.random() < 0.75, f = hi ? R_(140, 168) : R_(76, 90);
    return { vo: { oq: 0.5, jit: 0.018, sh: 0.06, br: 0.06, tilt: 0.5, vib: [R_(4, 6), 0.01] }, vol: hi ? 1 : 0.6,
      segs: hi ? [X(R_(0.15, 0.22), f * 0.82, f * 0.95, AF.cowM, { Fe: AF.cowO, att: 0.08, a: 0.7 }), X3(R_(0.9, 1.3), f * 0.97, f * 1.06, f * 0.8, AF.cowO, { Fe: AF.cowM, pk: 0.25, rel: 0.3, sub: 0.06 })]
        : [X3(R_(0.8, 1.2), f, f * 1.03, f * 0.9, AF.cowM, { att: 0.15, rel: 0.3, sub: 0.12 })] }; },
  /* sheep — bleats ride on a vibrato-like wobble that helps the ear find the formants (Charlton, Taylor & Reby 2017);
     lambs are higher and their bleats carry an amplitude wobble that tells one lamb from another (Sèbe et al. 2018) */
  bleat: o => { const lamb = (o.p || 1) > 1.12 || Math.random() < 0.2, f = lamb ? R_(330, 440) : R_(160, 240);
    return { raw: 1, vol: lamb ? 0.7 : 0.85, vo: { oq: 0.5, jit: 0.014, sh: 0.07, br: 0.1, tilt: 0.35, vib: [R_(9, 13), lamb ? 0.03 : 0.045] },
      segs: [X(0.06, f * 0.9, f, AF.shM, { Fe: AF.shO, att: 0.02 }), X3(lamb ? R_(0.35, 0.55) : R_(0.5, 0.85), f, f * 1.04, f * 0.86, AF.shO, { am: [R_(9, 13), lamb ? 0.55 : 0.35], rel: 0.15 })] }; },
  /* goats — in a bad moment higher with a wider wobble, when content lower and steadier (Briefer, Tettamanti & McElligott 2015, Anim. Behav. 99) */
  goat: o => { const kid = (o.p || 1) > 1.25 || Math.random() < 0.2, neg = !o.pos && Math.random() < 0.5, f = (kid ? R_(420, 560) : R_(200, 300)) * (neg ? 1.12 : 0.95);
    return { raw: 1, vo: { oq: 0.48, jit: 0.02, sh: 0.08, br: 0.12, tilt: 0.3, vib: [R_(10, 15), neg ? 0.07 : 0.035] },
      segs: [X(0.05, f * 0.9, f, AF.shM, { Fe: AF.goatO, att: 0.015 }), X3(R_(0.4, 0.7), f, f * 1.05, f * 0.88, AF.goatO, { am: [R_(10, 15), 0.45], rel: 0.12, sub: 0.05 })] }; },
  /* camels — a low, rough grumbling moan with a bubbling gurgle; now and then the faint high 「whistle」 (~3.1 kHz, 0.16 s) of the dromedary
     (Volodin, Volodina & Rutovskaya 2021, Bioacoustics) */
  camel: o => { const f = R_(70, 105) * (o.soft ? 1.1 : 1), d = o.soft ? R_(0.6, 0.9) : R_(1.0, 1.7);
    const s = [X3(d, f * 0.9, f * 1.15, f * 0.8, AF.camel, { Fe: AF.camelO, pk: 0.35, sub: 0.45, jit: 4, am: [R_(14, 24), 0.55], an: 0.25, att: 0.1, rel: 0.3 })];
    if (!o.soft && Math.random() < 0.5) s.push(X(R_(0.4, 0.7), f * 0.75, f * 0.6, AF.camel, { sub: 0.5, jit: 5, am: [R_(18, 28), 0.7], an: 0.35, a: 0.7, att: 0.05, rel: 0.2 }));
    if (!o.soft && Math.random() < 0.12) s.push(X(0.16, 40, 40, AF.camel, { av: 0, an: 0, wh: [3150, 3050, 1], att: 0.03, rel: 0.05 }));
    return { raw: 1, whMix: 0.12, vol: o.soft ? 0.6 : 0.9, vo: { oq: 0.55, jit: 0.02, sh: 0.1, br: 0.1, tilt: 0.5 }, segs: s }; },
  /* donkeys — a bray swaps a short 「hee」 drawn in with a longer, lower, rough 「haw」 pushed out; each part arches in pitch,
     and the haws spend more breath than the hees take in, so it runs down (Browning, Acoustical Society of America lay papers) */
  bray: o => { const n = ri(3, 5), s = [X(0.3, 300, 300, AF.hee, { av: 0, an: 0.5, ing: 1, att: 0.2, rel: 0.03, gap: 0.04 })];
    for (let i = 0; i < n; i++) { const k = i / Math.max(1, n - 1), a = 1 - 0.35 * k;
      s.push(X3(R_(0.16, 0.24), R_(380, 460), R_(560, 680), R_(420, 500), AF.hee, { av: 0.7, an: 0.4, ing: 1, oq: 0.75, tilt: 0.2, a: a * 0.85, pk: 0.45, att: 0.03, rel: 0.03, gap: 0.015 }));
      s.push(X3(R_(0.3, 0.5) * (i === 0 ? 1.3 : 1) * (1 - 0.25 * k), R_(150, 190), R_(220, 270), R_(110, 140), AF.haw, { sub: 0.4, jit: 3.5, an: 0.15, a, pk: 0.35, att: 0.03, rel: 0.06, gap: 0.02 })); }
    return { raw: 1, vol: 1, vo: { oq: 0.5, jit: 0.02, sh: 0.08, br: 0.08, tilt: 0.25 }, segs: s }; },
  /* horses — a whinny holds two unrelated pitches at once, a low voiced one and a high whistle (Briefer et al. 2015, Sci. Rep. 4:9989;
     the high part is a whistle, Current Biology 2026), shaking faster toward the end; it settles into a low nicker */
  neigh: o => { const fa = R_(560, 700), fb = R_(300, 380), ga = R_(1700, 2200), gb = ga * R_(0.62, 0.72), d = R_(0.9, 1.3);
    return { raw: 1, whMix: 0.38, vo: { oq: 0.5, jit: 0.02, sh: 0.1, br: 0.1, tilt: 0.3 }, segs: [X(0.12, fa * 0.85, fa, AF.horse, { att: 0.03, wh: [ga * 0.95, ga, 1] }),
      X3(d, fa, fa * 1.04, fb, AF.horse, { pk: 0.15, am: [R_(10, 15), 0.6], fm: [R_(10, 15), 0.04], wh: [ga, gb, 1], rel: 0.2, sub: 0.1 }),
      X(R_(0.25, 0.4), fb * 0.6, fb * 0.45, AF.nos, { am: [R_(12, 18), 0.8], a: 0.5, an: 0.3, att: 0.03, rel: 0.12 })] }; },
  nicker: o => ({ raw: 1, vol: 0.7, vo: { oq: 0.6, jit: 0.03, sh: 0.1, br: 0.15, tilt: 0.55 }, segs: [X(R_(0.5, 0.8), R_(110, 140), R_(90, 110), AF.nos, { am: [R_(10, 14), 0.85], an: 0.2, att: 0.04, rel: 0.15 })] }),
  snort: o => ({ raw: 1, vol: 0.7, vo: { oq: 0.5, jit: 0.05, sh: 0.2, br: 0, tilt: 0.3 }, segs: [X(R_(0.25, 0.4), 60, 50, AF.nos, { av: 0, an: 1, am: [R_(25, 40), 0.75], att: 0.01, rel: 0.12, bw: 1.6 })] }),
  /* lions (and the bear) — roars come in bouts: long moaning calls, then a train of grunts; F0 40–200 Hz (Klemuk, Riede, Walsh & Titze 2011, PLoS ONE) */
  roar: o => { const s = [], short = o.x !== undefined, big = short ? 1 : ri(1, 2);
    for (let i = 0; i < big; i++) s.push(X3(R_(1.1, 1.7) * (short ? 0.7 : 1), R_(90, 115), R_(165, 200), R_(55, 70), AF.lion, { pk: 0.3, sub: 0.35, jit: 3, an: 0.2, att: 0.15, rel: 0.35, gap: R_(0.4, 0.7) }));
    const g = short ? 1 : ri(3, 6); for (let i = 0; i < g; i++) { const k = i / Math.max(1, g - 1); s.push(X(R_(0.22, 0.32) * (1 - 0.25 * k), R_(72, 85) * (1 - 0.15 * k), R_(52, 62), AF.lion, { sub: 0.45, jit: 3, an: 0.25, a: 0.85 - 0.45 * k, att: 0.04, rel: 0.12, gap: R_(0.35, 0.55) * (1 + 0.5 * k) })); }
    return { vo: { oq: 0.5, jit: 0.02, sh: 0.1, br: 0.1, tilt: 0.45 }, segs: s }; },
  growl: o => ({ vo: { oq: 0.45, jit: 0.03, sh: 0.15, br: 0.1, tilt: 0.35 }, segs: [X3(R_(0.6, 0.95), R_(85, 105), R_(100, 125), R_(70, 85), AF.canidU, { Fe: AF.canid, sub: 0.5, jit: 4, an: 0.3, am: [R_(20, 32), 0.45], att: 0.06, rel: 0.15 })] }),
  grunt: o => { const n = ri(2, 3), s = []; for (let i = 0; i < n; i++) s.push(X(R_(0.12, 0.2), R_(95, 125), R_(75, 90), AF.boar, { sub: 0.4, jit: 4, an: 0.45, att: 0.015, rel: 0.06, a: 1 - i * 0.2, gap: R_(0.08, 0.16) }));
    return { vo: { oq: 0.45, jit: 0.03, sh: 0.15, br: 0.1, tilt: 0.3 }, segs: s }; },
  /* hippos — the 「wheeze honk」: a higher wheeze, then a run of honks, heard over a kilometre (Maust-Mohl 2015; Thévenet, Mathevon et al. 2022, Current Biology) */
  hippo: o => { const s = [X3(R_(0.5, 0.8), 260, 330, 240, AF.hippo, { av: 0.5, an: 0.7, jit: 5, sub: 0.3, att: 0.1, rel: 0.1, gap: 0.08 })], n = ri(3, 5);
    for (let i = 0; i < n; i++) s.push(X(R_(0.16, 0.22), R_(115, 140) * (1 - i * 0.05), R_(90, 105), AF.hippo, { sub: 0.35, jit: 3, an: 0.2, att: 0.02, rel: 0.08, a: 1 - 0.12 * i, gap: R_(0.1, 0.16) }));
    return { vo: { oq: 0.5, jit: 0.03, sh: 0.12, br: 0.15, tilt: 0.4 }, segs: s }; },
  /* baboons — the two-part 「wa-hoo」 bark */
  baboon: o => ({ vo: { oq: 0.48, jit: 0.025, sh: 0.1, br: 0.08, tilt: 0.3 }, segs: [X(0.13, R_(320, 380), R_(480, 560), AF.babU, { Fe: AF.babA, att: 0.015, rel: 0.02, gap: 0.03 }), X3(0.24, R_(480, 540), R_(500, 560), R_(260, 320), AF.babA, { Fe: AF.babU, pk: 0.2, sub: 0.15, rel: 0.1 })] }),
  /* golden jackals — a rising, wavering wail and a few yips; in a group several pitches sound at once (Comazzi et al. 2016, Bioacoustics) */
  howl: o => { const fa = R_(560, 700), s = [X3(R_(0.9, 1.5), fa, fa * R_(1.3, 1.55), fa * R_(0.8, 0.95), AF.canidU, { Fe: AF.canid, pk: 0.4, fm: [R_(5, 8), 0.03], oq: 0.7, tilt: 0.25, att: 0.12, rel: 0.25, gap: R_(0.1, 0.3) })];
    const y = ri(2, 5); for (let i = 0; i < y; i++) s.push(X3(R_(0.07, 0.12), fa * 1.3, fa * R_(1.6, 1.9), fa * 1.2, AF.canid, { pk: 0.5, oq: 0.6, att: 0.01, rel: 0.04, a: 0.7, gap: R_(0.06, 0.14) }));
    return { vo: { oq: 0.65, jit: 0.012, sh: 0.06, br: 0.08, tilt: 0.5 }, segs: s }; },
  hiss: o => ({ vo: {}, vol: 0.8, segs: [X(R_(0.6, 1.0), 50, 50, AF.hiss, { av: 0, an: 1, bw: 3, att: 0.04, rel: 0.3 })] }),
  honk: o => { const n = ri(2, 3), s = []; for (let i = 0; i < n; i++) s.push(X3(R_(0.13, 0.2), R_(380, 430), R_(450, 520), R_(360, 400), AF.goose, { pk: 0.3, an: 0.15, bw: 1.5, att: 0.015, rel: 0.05, gap: R_(0.1, 0.18), a: 1 - 0.15 * i }));
    return { vo: { oq: 0.42, jit: 0.02, sh: 0.08, br: 0.08, tilt: 0.2 }, segs: s }; },
  /* the laughing dove's soft bubbling 「구구구구」, common round Egyptian villages and palms */
  coo: o => { const n = ri(5, 7), b = R_(470, 560), t = []; for (let i = 0; i < n; i++) { const hump = Math.sin(i / (n - 1) * Math.PI); t.push({ d: R_(0.09, 0.13), f: [b * (1 + 0.12 * hump), b * (1 + 0.1 * hump) * 0.97], a: 0.6 + 0.4 * hump, att: 0.3, rel: 0.4, h2: 0.08, gap: R_(0.04, 0.07) }); } return { tone: t, vol: 0.8 }; },
  /* small birds: sparrows' falling chirps, a bulbul's liquid phrase, a thin trill */
  chirp: o => { const r = Math.random(), t = [], p = o.p || 1;
    if (r < 0.4) { const n = ri(2, 4); for (let i = 0; i < n; i++) t.push({ d: R_(0.05, 0.08), f: [R_(4200, 5000) * p, R_(2800, 3400) * p], c: 1, att: 0.1, rel: 0.4, h2: 0.25, gap: R_(0.06, 0.14) }); }
    else if (r < 0.8) { const n = ri(4, 6); let f = R_(1500, 2100) * p; for (let i = 0; i < n; i++) { const f2 = clamp(f * R_(0.8, 1.35), 1300, 3200); t.push({ d: R_(0.08, 0.16), f: [f, f2], att: 0.2, rel: 0.3, h2: 0.15, gap: R_(0.02, 0.06) }); f = f2; } }
    else { const n = ri(3, 5); for (let i = 0; i < n; i++) t.push({ d: R_(0.03, 0.05), f: [R_(5200, 6000) * p, R_(5000, 5800) * p], fm: [R_(60, 90), 0.06], att: 0.2, rel: 0.3, gap: 0.02 }); }
    return { tone: t, vol: 0.45 }; } };
V.animal = function (k, o, dest, when) { const f = AN[k]; if (!f) return 0; o = o || {}; const p = o.p || 1, c = f(o); let data;
  if (c.tone) data = tones(c.tone);
  else { if (!c.raw && p !== 1) { const fs = 1 + (p - 1) * 0.5; for (const s of c.segs) { s.p = s.p.map(x => x * p); if (s.F) s.F = s.F.map(x => x * fs); if (s.Fe) s.Fe = s.Fe.map(x => x * fs); } }
    data = render(c.segs, Object.assign({ f0: 1, fk: 1, whMix: c.whMix }, c.vo)); }
  V.stats.beasts++; return playBuf(data, dest, when, (c.vol || 1) * 0.6 * (dest ? 1 : o.vol || 1), dest ? 0 : o.pan || 0); };

// ------------------------------------------------------------------ plug into the sound effects (audio.js looks in Au.ext first)
if (Au) { const X0 = Au.ext = Au.ext || {}, sub = (d, v) => { const g = d.context.createGain(); g.gain.value = v; g.connect(d); return g; };
  for (const k in AN) X0[k] = (d, t, p, o) => { const n = k === 'howl' ? ri(2, 4) : 1; for (let i = 0; i < n; i++) V.animal(k, Object.assign({}, o, { p }), i ? sub(d, R_(0.4, 0.8)) : d, t + (i ? R_(0.3, 1.8) : 0)); };
  /* a crowd: many voices — a murmur of talk, or a cheer of 「와아!」 「오오!」 */
  X0.crowd = (d, t, p, o, SFX) => { if (SFX && SFX.crowd) SFX.crowd(sub(d, 0.45), t, p, o); if (!on()) return; for (let i = 0; i < 9; i++) { const vt = pick(['man', 'man', 'woman', 'woman', 'oldman', 'oldwoman', 'kid']); playBuf(render(babble(), voiceFor(vt, 'greet', Math.random())), sub(d, R_(0.2, 0.45)), t + R_(0, 1.6), 0.5, 0); } };
  X0.cheerC = (d, t, p, o, SFX) => { if (SFX && SFX.cheerC) SFX.cheerC(sub(d, 0.4), t, p, o); if (!on()) return; for (let i = 0; i < 10; i++) { const vt = pick(['man', 'man', 'man', 'woman', 'woman', 'kid', 'oldman']), k = pick(['happy', 'happy', 'awe', 'surprise']); speak(k, vt, Math.random(), R_(0.25, 0.55), 0, sub(d, 1), t + R_(0, 0.7)); } };
  X0.sob = (d, t, p, o, SFX) => { if (!on()) { if (SFX && SFX.sob) SFX.sob(d, t, p, o); return; } speak('cry', p > 1.05 ? 'woman' : 'man', Math.random(), 1, 0, d, t); };
  /* the world's own animals, now and then, from where they stand */
  let nextAni = 0, nextNight = 0, nextDove = 0;
  const CALL = { sheep: ['bleat', 1], goat: ['goat', 1], cow: ['moo', 0.6], ox: ['moo', 0.6], camel: ['camel', 0.45], donkey: ['bray', 0.15], horse: ['neigh', 0.18], goose: ['honk', 0.6], dove: ['coo', 0.4] };
  const ambient = o => { const A = Au.core && Au.core(), P = Game.P; if (!A || !P || UI.busy() || (G.Cine && G.Cine.on)) return; const now = A.ctx.currentTime, night = o.hour < 5.3 || o.hour > 20.4;
    if (!nextAni) { nextAni = now + 5; nextNight = now + 30; nextDove = now + 12; }
    if (now > nextAni) { nextAni = now + R_(6, 13); const cand = []; let tot = 0;
      const add = (sp, x, z, lamb, w) => { const c = CALL[sp]; if (!c || Math.hypot(x - P.x, z - P.z) > 30) return; const wt = c[1] * (w || 1) * (night ? 0.35 : 1); cand.push([c[0], x, z, lamb, wt]); tot += wt; };
      for (const a of Game.ENT.animals || []) add(a.sp, a.x, a.z, a.lamb);
      const E = Game.ENT.npcs; if (E) for (const id in E) { const n = E[id]; if (!n || !n.vis || !n.d) continue; if (n.d.animal) add(n.d.animal, n.x, n.z); else if (n.d.mount) add(n.d.mount, n.x, n.z, false, 0.5); }
      let r = Math.random() * tot; for (const c of cand) { r -= c[4]; if (r <= 0) { if (Math.random() < 0.75) Au.sfx(c[0], { x: c[1], z: c[2], range: 40, vol: 0.8, pitch: c[3] ? 1.4 : 1, gap: 2 }); break; } } }
    /* nights in the open country: a golden-jackal chorus somewhere out in the dark */
    const around = (r0, r1) => { const a = Math.random() * 6.283, r = R_(r0, r1); return [P.x + Math.sin(a) * r, P.z + Math.cos(a) * r]; }; /* v18.52d far sounds come from a place, not from everywhere */
    if (night && !o.indoor && o.arid > 0.3 && now > nextNight) { nextNight = now + R_(60, 140); if (Math.random() < 0.5) { const [x, z] = around(30, 50); Au.sfx('howl', { x, z, range: 60, vol: 0.9, gap: 20 }); } }
    /* days among fields and houses: the laughing dove */
    if (!night && !o.indoor && o.arid < 0.6 && !(o.rain > 0.3) && now > nextDove) { nextDove = now + R_(30, 70); if (Math.random() < 0.6) { const [x, z] = around(10, 26); Au.sfx('coo', { x, z, range: 34, vol: 0.8, gap: 5 }); } } };
  const a0 = Au.ambient; if (a0) Au.ambient = function (o) { a0.apply(this, arguments); try { ambient(o); } catch (e) { } }; }
V._render = render; V._lib = LIB; V._an = AN; V._phrase = phrase; V._feel = feelOf; V._voiceOf = voiceOf; V._voiceFor = voiceFor; V._shape = shape; V._tones = tones; V._babble = babble;
})(window.G);
