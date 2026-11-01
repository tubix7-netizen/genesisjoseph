/* 약속의 길 — procedural audio: music (plucked oud/lyre, ney flute, frame drums, drones, pads), sound effects, ambience.
   Everything is synthesized with Web Audio; no audio files. Starts on the first tap/keypress (browser autoplay rules). */
'use strict';
(function (G) {
const Au = G.Audio = { on: false, mood: null };
let ctx = null, master, comp, musicBus, sfxBus, ambBus, verbSend, noiseBuf, sched = null, curMood = null, moodGain = null, moodT0 = 0;
const PL = new Map(); // pluck buffer cache by midi*10+tone
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const SETV = () => (G.Game && G.Game.SET) || { music: 0.6, sfx: 0.8 };

Au.init = function () {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => { }); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); } catch (e) { ctx = null; return; }
  comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp); comp.connect(ctx.destination);
  musicBus = ctx.createGain(); sfxBus = ctx.createGain(); ambBus = ctx.createGain();
  musicBus.connect(master); sfxBus.connect(master); ambBus.connect(master);
  // reverb (generated impulse)
  const verb = ctx.createConvolver(); verb.buffer = impulse(2.4, 2.6); const vOut = ctx.createGain(); vOut.gain.value = 0.32; verb.connect(vOut); vOut.connect(master);
  verbSend = ctx.createGain(); verbSend.gain.value = 1; verbSend.connect(verb);
  const mv = ctx.createGain(); mv.gain.value = 0.55; musicBus.connect(mv); mv.connect(verbSend);
  const sv = ctx.createGain(); sv.gain.value = 0.18; sfxBus.connect(sv); sv.connect(verbSend);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  Au.applyVolume(); Au.on = true;
  sched = setInterval(tick, 60);
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend().catch(() => { }); else ctx.resume().catch(() => { }); });
  ambInit();
};
let ducked = false;
Au.applyVolume = function () { if (!ctx) return; const s = SETV(); musicBus.gain.setTargetAtTime(0.5 * (s.music === undefined ? 0.6 : s.music) * (ducked ? 0.58 : 1), ctx.currentTime, ducked ? 0.25 : 0.6); sfxBus.gain.setTargetAtTime(s.sfx === undefined ? 0.8 : s.sfx, ctx.currentTime, 0.1); ambBus.gain.setTargetAtTime(0.75 * (s.sfx === undefined ? 0.8 : s.sfx) * (ducked ? 0.7 : 1), ctx.currentTime, 0.3); };
// lower the music a little (kept for episodes that duck under a scene)
Au.duck = function (on) { if (ducked === !!on) return; ducked = !!on; Au.applyVolume(); };
function impulse(sec, decay) { const sr = ctx.sampleRate, n = Math.floor(sr * sec), b = ctx.createBuffer(2, n, sr); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { lp += (Math.random() * 2 - 1 - lp) * 0.35; d[i] = lp * Math.pow(1 - i / n, decay); } } return b; }

// ------------------------------------------------------------------ instruments
// Karplus–Strong plucked string, rendered once per pitch. tone: 0 = oud (darker, longer), 1 = lyre/kinnor (bright), 2 = low bass
function pluckBuf(midi, tone) {
  const key = midi * 10 + tone; if (PL.has(key)) return PL.get(key);
  const sr = ctx.sampleRate, f = mtof(midi), N = Math.max(2, Math.round(sr / f)), dur = tone === 1 ? 2.2 : tone === 2 ? 1.8 : 1.6, L = Math.floor(sr * dur);
  const b = ctx.createBuffer(1, L, sr), d = b.getChannelData(0), buf = new Float32Array(N);
  let lp = 0; for (let i = 0; i < N; i++) { lp += ((Math.random() * 2 - 1) - lp) * (tone === 1 ? 0.75 : 0.45); buf[i] = lp; }
  const damp = tone === 1 ? 0.4985 : tone === 2 ? 0.4975 : 0.4965; let p = 0, prev = 0;
  for (let i = 0; i < L; i++) { const cur = buf[p]; const nx = (cur + prev) * damp; prev = cur; buf[p] = nx; d[i] = cur; p = (p + 1) % N; }
  // gentle pick attack + body
  for (let i = 0; i < Math.min(L, 120); i++) d[i] *= i / 120;
  let pk = 0; for (let i = 0; i < L; i++) pk = Math.max(pk, Math.abs(d[i])); if (pk > 0) for (let i = 0; i < L; i++) d[i] /= pk;
  PL.set(key, b); return b;
}
function pluck(dest, t, midi, vel, tone, pan) {
  const s = ctx.createBufferSource(); s.buffer = pluckBuf(Math.round(midi), tone || 0); s.playbackRate.value = Math.pow(2, (midi - Math.round(midi)) / 12) * (1 + (Math.random() - 0.5) * 0.002);
  const g = ctx.createGain(); g.gain.value = vel * (tone === 2 ? 0.55 : 0.42);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = tone === 1 ? 6000 : tone === 2 ? 900 : 2600; f.Q.value = 0.6;
  s.connect(f); f.connect(g); out(g, dest, pan); s.start(t); s.stop(t + 2.4);
}
function out(node, dest, pan) { if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); node.connect(p); p.connect(dest); } else node.connect(dest); }
// ney (reed flute): breathy sine with vibrato
function ney(dest, t, midi, dur, vel, pan) {
  const f = mtof(midi), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
  o.type = 'sine'; o.frequency.value = f; o2.type = 'triangle'; o2.frequency.value = f * 2; g2.gain.value = 0.12;
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.detune); lg.connect(o2.detune);
  const att = Math.min(0.12, dur * 0.3), rel = Math.min(0.35, dur * 0.4), v = vel * 0.2;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v * 0.85, t + Math.max(att, dur - rel)); g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
  // breath
  const n = ctx.createBufferSource(); n.buffer = noiseBuf; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2.5; bp.Q.value = 2.5; const ng = ctx.createGain(); ng.gain.value = 0.18;
  n.connect(bp); bp.connect(ng); ng.connect(g); o.connect(g); o2.connect(g2); g2.connect(g); out(g, dest, pan);
  const off = Math.random() * 1.5; o.start(t); o2.start(t); lfo.start(t); n.start(t, off); const e = t + dur + 0.05; o.stop(e); o2.stop(e); lfo.stop(e); n.stop(e);
}
function drum(dest, t, kind, vel) {
  vel = vel || 1;
  if (kind === 'dum') { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(52, t + 0.18); g.gain.setValueAtTime(0.55 * vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.4); noiseHit(dest, t, 400, 0.04, 0.12 * vel, 'lowpass'); }
  else if (kind === 'tek') noiseHit(dest, t, 3200, 0.05, 0.16 * vel, 'highpass');
  else if (kind === 'ka') noiseHit(dest, t, 1400, 0.06, 0.12 * vel, 'bandpass');
  else if (kind === 'jingle') { for (let i = 0; i < 3; i++) noiseHit(dest, t + i * 0.012, 7000, 0.09, 0.05 * vel, 'highpass'); }
  else if (kind === 'clap') { for (let i = 0; i < 3; i++) noiseHit(dest, t + i * 0.011, 1600, 0.05, 0.11 * vel, 'bandpass'); }
  else if (kind === 'boom') { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.6); g.gain.setValueAtTime(0.7 * vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.1); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 1.2); noiseHit(dest, t, 200, 0.2, 0.2 * vel, 'lowpass'); }
}
function noiseHit(dest, t, freq, dur, vel, type) { const n = ctx.createBufferSource(); n.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = type === 'bandpass' ? 1.2 : 0.7; const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); n.connect(f); f.connect(g); g.connect(dest); n.start(t, Math.random() * 1.5); n.stop(t + dur + 0.02); }
// sustained pad / choir
function pad(dest, t, midis, dur, vel, choir) {
  const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = choir ? 1400 : 900; lp.Q.value = 0.5;
  const v = vel * 0.06; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(1.6, dur * 0.4)); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.linearRampToValueAtTime(0, t + dur);
  let last = lp;
  if (choir) { const f1 = ctx.createBiquadFilter(); f1.type = 'peaking'; f1.frequency.value = 760; f1.gain.value = 9; f1.Q.value = 3; const f2 = ctx.createBiquadFilter(); f2.type = 'peaking'; f2.frequency.value = 1150; f2.gain.value = 7; f2.Q.value = 3; lp.connect(f1); f1.connect(f2); last = f2; }
  last.connect(g); g.connect(dest);
  for (const m of midis) for (const det of [-6, 6]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det + (Math.random() - 0.5) * 4; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); }
}
function bell(dest, t, midi, vel) { const f = mtof(midi); for (const [r, a, d] of [[1, 1, 1.6], [2.76, 0.4, 0.7], [5.4, 0.18, 0.35]]) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * r; g.gain.setValueAtTime(vel * 0.12 * a, t); g.gain.exponentialRampToValueAtTime(0.0005, t + d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05); } }

// ------------------------------------------------------------------ music
const SC = { hijaz: [0, 1, 4, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], aeolian: [0, 2, 3, 5, 7, 8, 10], ionian: [0, 2, 4, 5, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10], phryg: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11] };
const deg = (m, d) => { const s = SC[m.scale], o = Math.floor(d / 7), i = ((d % 7) + 7) % 7; return m.root + 12 * o + s[i]; };
// melodies: [degree, beats] (null degree = rest)
const MEL = {
  camp: [[0, 1], [1, .5], [2, .5], [3, 1], [2, .5], [1, .5], [0, 2], [2, 1], [3, .5], [4, .5], [5, 1], [4, .5], [3, .5], [2, 2], [4, 1], [3, .5], [2, .5], [1, 1], [2, .5], [1, .5], [0, 1], [-1, .5], [0, 2.5], [null, 2]],
  haran: [[4, 1.5], [3, .5], [2, 1], [0, 1], [1, 2], [null, 1], [2, 1], [3, 1], [4, 1], [6, 1], [5, 2], [4, 2], [3, 1], [2, .5], [1, .5], [0, 2], [null, 1], [4, 1], [5, .5], [4, .5], [3, 1], [2, 1], [1, 1.5], [0, .5], [0, 3], [null, 3]],
  night: [[4, 3], [3, 1], [2, 4], [null, 2], [0, 2], [1, 1], [2, 1], [-1, 4], [null, 4], [2, 3], [4, 1], [3, 2], [2, 2], [0, 4], [null, 6]],
  desert: [[0, 2], [1, 1], [0, 1], [-1, 2], [-2, 2], [null, 2], [2, 1.5], [3, .5], [2, 1], [1, 1], [0, 4], [null, 4]],
  combat: [[0, .5], [1, .5], [2, .5], [1, .5], [4, 1], [3, .5], [2, .5], [1, .5], [0, .5], [-1, .5], [0, 1.5], [null, .5], [4, .5], [5, .5], [4, .5], [3, .5], [2, 1], [1, .5], [2, .5], [0, 2]],
  boss: [[7, 2], [6, 1], [5, 1], [4, 3], [null, 1], [5, 1], [4, .5], [3, .5], [2, 1], [1, 1], [0, 4]],
  dream: [[7, 3], [9, 1], [8, 2], [7, 2], [4, 4], [null, 2], [5, 2], [7, 2], [9, 4], [8, 4], [null, 4]],
  festival: [[0, .5], [2, .5], [4, .5], [5, .5], [4, .5], [2, .5], [4, 1], [5, .5], [4, .5], [2, .5], [1, .5], [0, 1], [2, .5], [4, .5], [7, 1], [5, .5], [4, .5], [5, .5], [4, .5], [2, .5], [1, .5], [0, 2]],
  epilogue: [[2, 1], [4, 1], [5, 1], [4, .5], [2, .5], [0, 2], [null, 1], [1, 1], [2, 1], [4, 1.5], [2, .5], [1, 3], [null, 1], [2, 1], [4, 1], [7, 1.5], [5, .5], [4, 1], [2, 1], [0, 3], [null, 3]],
  title: [[4, 2], [3, 1], [2, 1], [0, 2], [1, 2], [2, 3], [null, 1], [4, 1], [5, 1], [6, 1], [7, 1], [6, 2], [4, 2], [5, 1.5], [4, .5], [2, 2], [0, 4], [null, 4]],
};
const MOODS = {
  title: { scale: 'dorian', root: 57, bpm: 66, lead: 'ney', arp: [0, 4, 7, 9], arpTone: 1, arpEvery: 0.5, drone: [45, 52], drum: null },
  camp: { scale: 'hijaz', root: 62, bpm: 74, lead: 'oud', arp: [0, 4, 7, 4], arpTone: 2, arpEvery: 1, drone: [38, 45], drum: 'maqsum', soft: 1 },
  haran: { scale: 'dorian', root: 57, bpm: 82, lead: 'ney', arp: [0, 2, 4, 7, 4, 2], arpTone: 1, arpEvery: 0.5, drone: [45], drum: 'soft' },
  night: { scale: 'aeolian', root: 64, bpm: 58, lead: 'ney', arp: null, drone: [40, 47], drum: null, sparse: 1 },
  desert: { scale: 'phryg', root: 62, bpm: 64, lead: 'oud', arp: [0, 7], arpTone: 2, arpEvery: 2, drone: [38, 45], drum: null },
  combat: { scale: 'hijaz', root: 64, bpm: 116, lead: 'oud', arp: [0, 0, 1, 0, 3, 1, 0, -1], arpTone: 2, arpEvery: 0.5, drone: [40], drum: 'battle' },
  boss: { scale: 'hijaz', root: 62, bpm: 92, lead: 'ney', arp: [0, 0, 1, 0], arpTone: 2, arpEvery: 0.5, drone: [38, 45, 50], drum: 'boss', choir: [[0, 4, 7], [1, 5, 8]] },
  dream: { scale: 'lydian', root: 60, bpm: 50, lead: 'bell', arp: [0, 4, 7, 11, 14], arpTone: 1, arpEvery: 0.5, drone: null, drum: null, choir: [[0, 4, 7], [5, 9, 12], [3, 7, 10], [4, 8, 11]] },
  festival: { scale: 'mixo', root: 67, bpm: 108, lead: 'oud', arp: [0, 4, 7, 4], arpTone: 1, arpEvery: 0.5, drone: [43], drum: 'dance' },
  epilogue: { scale: 'mixo', root: 62, bpm: 80, lead: 'ney', arp: [0, 2, 4, 7], arpTone: 1, arpEvery: 0.5, drone: [38, 45], drum: 'soft' },
};
const DRUMS = { // per 8 eighth-notes of a 4-beat bar
  maqsum: ['dum', 'tek', null, 'tek', 'dum', null, 'tek', null],
  soft: ['dum', null, null, 'ka', null, null, 'ka', null],
  battle: ['dum', 'tek', 'dum', 'tek', 'dum', 'tek', 'ka', 'tek'],
  boss: ['boom', null, 'tek', 'tek', 'dum', null, 'dum', 'tek'],
  dance: ['dum', 'jingle', 'tek', 'jingle', 'dum', 'clap', 'tek', 'jingle'],
};
let seq = null;
// ------------------------------------------------------------------ recorded music (rendered orchestral tracks)
/* Episodes register files: Au.addTracks({ key: { url, loop (seconds of one cycle), gain, once } }). A track plays as
   cycles started exactly `loop` seconds apart, so the reverb tail of one cycle rings into the next (seamless). Only a few
   decoded buffers are kept; if a file can't load, the procedural score below takes over for that mood. */
const TR = Au.TRACKS = {}, BUF = new Map(); let fileCur = null, fileGen = 0;
Au.addTracks = function (map) { Object.assign(TR, map || {}); };
Au.hasTrack = k => !!TR[k];
function getBuf(url) {
  if (BUF.has(url)) { const p = BUF.get(url); BUF.delete(url); BUF.set(url, p); return p; } // LRU touch
  const p = fetch(url).then(r => { if (!r.ok) throw new Error('music ' + r.status); return r.arrayBuffer(); }).then(ab => new Promise((res, rej) => { try { const q = ctx.decodeAudioData(ab, res, rej); if (q && q.catch) q.catch(rej); } catch (e) { rej(e); } }));
  p.catch(() => BUF.delete(url)); BUF.set(url, p);
  while (BUF.size > 2) BUF.delete(BUF.keys().next().value);
  return p;
}
Au.prefetch = function (k) { if (ctx && TR[k]) getBuf(TR[k].url).catch(() => { }); };
function fileStop(fade) {
  if (!fileCur) return; const old = fileCur; fileCur = null; old.dead = true; const now = ctx.currentTime, f = fade === undefined ? 2.4 : fade;
  old.g.gain.cancelScheduledValues(now); old.g.gain.setValueAtTime(old.g.gain.value, now); old.g.gain.linearRampToValueAtTime(0, now + f);
  setTimeout(() => { old.srcs.forEach(x => { try { x.s.stop(); } catch (e) { } }); try { old.g.disconnect(); } catch (e) { } }, f * 1000 + 200);
}
function filePlay(k) {
  const tr = TR[k], my = ++fileGen; fileStop(tr.xfade || 2.4);
  const g = ctx.createGain(); g.gain.value = 0; g.connect(musicBus);
  const cur = fileCur = { key: k, g, srcs: [], next: 0, loop: tr.loop, buf: null, gen: my, once: !!tr.once };
  getBuf(tr.url).then(buf => { if (fileCur !== cur) return; cur.buf = buf; const t = ctx.currentTime + 0.06; cur.next = t; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(tr.gain || 1, t + (tr.fadeIn || 2.0)); fileTick(); })
    .catch(() => { if (fileCur !== cur) return; fileCur = null; try { g.disconnect(); } catch (e) { } const fb = tr.fallback || (MOODS[k] ? k : 'haran'); curMood = null; procMood(fb); curMood = k; });
}
function fileTick() {
  const c = fileCur; if (!c || !c.buf || c.dead) return; const now = ctx.currentTime;
  while (c.next < now + 1.2 && !(c.once && c.srcs.length)) { const s = ctx.createBufferSource(); s.buffer = c.buf; s.connect(c.g); s.start(Math.max(c.next, now + 0.01)); c.srcs.push({ s, end: c.next + c.buf.duration }); c.next += c.loop; }
  c.srcs = c.srcs.filter(x => x.end > now - 0.5);
}
Au.setMood = function (m) {
  if (!ctx || !m || m === curMood) return;
  if (TR[m] && !Au.noFiles) { curMood = m; Au.mood = m; procStop(); filePlay(m); return; }
  fileStop(); procMood(m);
};
function procStop() { const now = ctx.currentTime; if (moodGain) { const old = moodGain; old.gain.cancelScheduledValues(now); old.gain.setValueAtTime(old.gain.value, now); old.gain.linearRampToValueAtTime(0, now + 2.2); setTimeout(() => { try { old.disconnect(); } catch (e) { } }, 3000); moodGain = null; }
  if (seq && seq.drone) seq.drone.forEach(o => { try { o.stop(now + 2.4); } catch (e) { } }); seq = null; }
function procMood(m) {
  if (!MOODS[m]) m = 'haran'; curMood = m; Au.mood = m;
  const now = ctx.currentTime;
  procStop();
  moodGain = ctx.createGain(); moodGain.gain.setValueAtTime(0, now); moodGain.gain.linearRampToValueAtTime(1, now + 2.0); moodGain.connect(musicBus);
  const M = MOODS[m]; seq = { M, name: m, t: now + 0.25, beat: 0, mi: 0, mt: 0, rep: 0, rest: 0, drone: null, out: moodGain, bar: 0 };
  if (M.drone) { const g = ctx.createGain(); g.gain.value = m === 'boss' ? 0.07 : 0.04; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency); lp.connect(g); g.connect(moodGain);
    seq.drone = [lfo]; lfo.start(now); for (const d of M.drone) for (const det of [-5, 5]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(d); o.detune.value = det; o.connect(lp); o.start(now); seq.drone.push(o); } }
};
function tick() {
  if (!ctx || ctx.state !== 'running') return; fileTick(); if (!seq) return;
  const ahead = ctx.currentTime + 0.25, M = seq.M, spb = 60 / M.bpm, dest = seq.out;
  while (seq.t < ahead) {
    const t = seq.t, b = seq.beat; // eighth-note grid
    // drums
    if (M.drum) { const pat = DRUMS[M.drum]; const k = pat[b % 8]; if (k) drum(dest, t, k, M.soft ? 0.6 : 1); }
    // accompaniment arpeggio
    if (M.arp && (b % Math.round(M.arpEvery * 2) === 0)) { const i = Math.floor(b / Math.round(M.arpEvery * 2)) % M.arp.length; const bar = Math.floor(b / 8) % 4, shift = [0, 0, 3, 4][bar] * (M.name === 'combat' ? 0 : 1); pluck(dest, t, deg(M, M.arp[i] + shift) - 12, 0.5, M.arpTone, Math.sin(b) * 0.3); }
    // choir pads every 2 bars
    if (M.choir && b % 16 === 0) { const ch = M.choir[(b / 16) % M.choir.length]; pad(dest, t, ch.map(d => deg(M, d)), spb * 8, 1, true); }
    // lead melody
    if (seq.mt <= 0) {
      const mel = MEL[seq.name] || MEL.haran;
      if (seq.rest > 0) { seq.rest--; seq.mt = 1; }
      else { const [d, len] = mel[seq.mi]; const dur = len * spb;
        if (d !== null && !(M.sparse && Math.random() < 0.15)) { const note = deg(M, d) + (seq.rep % 2 && Math.random() < 0.25 ? 12 : 0);
          if (M.lead === 'ney') ney(dest, t, note, dur * 0.95, 0.9, -0.15); else if (M.lead === 'bell') bell(dest, t, note + 12, 1); else { pluck(dest, t, note, 0.8, 0, 0.1); if (len >= 1 && M.name !== 'combat') pluck(dest, t + spb * 0.5, note, 0.35, 0, 0.1); } }
        seq.mt = len * 2; seq.mi++;
        if (seq.mi >= mel.length) { seq.mi = 0; seq.rep++; if (seq.rep % 2 === 0) seq.rest = M.sparse ? 16 : 8; } }
    }
    seq.mt--; seq.beat++; seq.t += spb / 2;
  }
}

// ------------------------------------------------------------------ sound effects
const lastSfx = {};
Au.sfx = function (name, o) {
  if (!ctx || ctx.state !== 'running') return; o = o || {};
  const now = ctx.currentTime; if (lastSfx[name] && now - lastSfx[name] < (o.gap || 0.03)) return; lastSfx[name] = now;
  let vol = o.vol === undefined ? 1 : o.vol, pan = 0;
  if (o.x !== undefined && G.Game && G.Game.P) { const P = G.Game.P, C = G.Game.CAM, dx = o.x - P.x, dz = o.z - P.z, d = Math.hypot(dx, dz); vol *= clamp(1 - d / (o.range || 34), 0, 1); if (vol <= 0.01) return; const ang = Math.atan2(dx, dz) - (C.yaw + Math.PI); pan = clamp(Math.sin(ang) * -0.8, -0.8, 0.8); }
  const g = ctx.createGain(); g.gain.value = vol; out(g, sfxBus, pan); const t = now + 0.005, p = o.pitch || 1;
  const fn = SFX[name]; if (fn) fn(g, t, p, o);
};
const osc = (dest, t, type, f0, f1, dur, v, at) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + (at || 0.005)); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o; };
const nz = (dest, t, type, f, q, dur, v, f1, at) => { const n = ctx.createBufferSource(); n.buffer = noiseBuf; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur); fl.Q.value = q || 1; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + (at || 0.004)); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); n.connect(fl); fl.connect(g); g.connect(dest); n.start(t, Math.random() * 1.6); n.stop(t + dur + 0.05); };
const SFX = {
  step: (d, t, p, o) => { const s = o.surf || 'sand'; nz(d, t, s === 'stone' ? 'bandpass' : 'lowpass', s === 'grass' ? 1800 : s === 'stone' ? 1200 : 900 * p, 0.8, 0.09, s === 'grass' ? 0.11 : 0.09); if (s === 'water') nz(d, t, 'bandpass', 600, 2, 0.18, 0.12, 300); },
  hoe: (d, t, p) => { osc(d, t, 'sine', 140 * p, 55, 0.18, 0.5); nz(d, t + 0.01, 'lowpass', 1400, 0.7, 0.22, 0.35); },
  chop: (d, t, p) => { osc(d, t, 'triangle', 260 * p, 120, 0.09, 0.4); nz(d, t, 'bandpass', 900, 3, 0.12, 0.45); },
  mine: (d, t, p) => { osc(d, t, 'square', 1800 * p, 900, 0.05, 0.12); nz(d, t, 'highpass', 2500, 0.8, 0.14, 0.35); osc(d, t, 'sine', 120, 70, 0.15, 0.3); },
  gather: (d, t, p) => { nz(d, t, 'bandpass', 2600 * p, 1.2, 0.16, 0.2, 1400); },
  pour: (d, t, p) => { for (let i = 0; i < 9; i++) osc(d, t + i * 0.055 + Math.random() * 0.02, 'sine', 500 + Math.random() * 500, 900 + Math.random() * 400, 0.05, 0.05); nz(d, t, 'lowpass', 1600, 0.5, 0.6, 0.12, 700, 0.05); },
  splash: (d, t, p) => { nz(d, t, 'lowpass', 2400 * p, 0.6, 0.45, 0.4, 500); nz(d, t + 0.05, 'bandpass', 900, 2, 0.3, 0.2); },
  pickup: (d, t, p) => { osc(d, t, 'sine', 880 * p, 880 * p, 0.25, 0.12); osc(d, t + 0.07, 'sine', 1320 * p, 1320 * p, 0.3, 0.1); },
  coin: (d, t, p) => { for (const [f, k] of [[2100, 0], [2650, 0.05], [3150, 0.09]]) osc(d, t + k, 'sine', f * p, f * p, 0.28, 0.08); },
  craft: (d, t) => { nz(d, t, 'bandpass', 1800, 1, 0.2, 0.2); osc(d, t + 0.12, 'triangle', 660, 660, 0.3, 0.14); osc(d, t + 0.2, 'triangle', 990, 990, 0.35, 0.12); },
  click: (d, t) => { osc(d, t, 'sine', 1500, 1200, 0.03, 0.08); },
  blip: (d, t, p) => { osc(d, t, 'triangle', 620 * p, 600 * p, 0.06, 0.05); },
  page: (d, t) => { nz(d, t, 'bandpass', 2400, 0.6, 0.35, 0.12, 800, 0.08); },
  swing: (d, t, p) => { nz(d, t, 'bandpass', 500 * p, 1.5, 0.22, 0.32, 2200, 0.05); },
  hit: (d, t, p) => { osc(d, t, 'sine', 180 * p, 60, 0.16, 0.6); nz(d, t, 'lowpass', 2600, 0.6, 0.12, 0.45); },
  crit: (d, t, p) => { osc(d, t, 'sine', 220 * p, 50, 0.22, 0.7); nz(d, t, 'highpass', 1800, 0.6, 0.2, 0.35); osc(d, t + 0.02, 'triangle', 1400, 900, 0.18, 0.12); },
  hurt: (d, t) => { osc(d, t, 'sine', 160, 70, 0.25, 0.6); nz(d, t, 'lowpass', 900, 0.8, 0.25, 0.35); },
  dodge: (d, t) => { nz(d, t, 'bandpass', 900, 1.2, 0.25, 0.25, 300, 0.04); nz(d, t + 0.1, 'lowpass', 600, 0.6, 0.15, 0.2); },
  sling: (d, t) => { for (let i = 0; i < 3; i++) nz(d, t + i * 0.08, 'bandpass', 700 + i * 300, 4, 0.08, 0.12); nz(d, t + 0.26, 'highpass', 2000, 0.6, 0.08, 0.3); },
  bow: (d, t) => { pluck(d, t, 45, 1.1, 2); nz(d, t, 'bandpass', 2400, 3, 0.15, 0.2, 1200); },
  arrowHit: (d, t) => { osc(d, t, 'square', 240, 120, 0.06, 0.18); nz(d, t, 'bandpass', 1600, 2, 0.08, 0.25); },
  die: (d, t, p) => { osc(d, t, 'sine', 200 * p, 60, 0.6, 0.35); },
  butcher: (d, t) => { for (let i = 0; i < 3; i++) nz(d, t + i * 0.14, 'bandpass', 1200 + i * 200, 2, 0.1, 0.25); osc(d, t, 'sine', 160, 90, 0.2, 0.25); },
  levelup: (d, t) => { [0, 4, 7, 12, 16].forEach((s, i) => bell(d, t + i * 0.08, 72 + s, 1.1)); },
  insight: (d, t) => { [0, 7, 12, 19].forEach((s, i) => bell(d, t + i * 0.12, 67 + s, 1)); pad(d, t, [55, 62, 67], 2.2, 1.6, true); },
  quest: (d, t) => { const n = [62, 66, 69, 74]; n.forEach((m, i) => pluck(d, t + i * 0.11, m, 1.0, 1)); drum(d, t, 'dum', 0.8); drum(d, t + 0.44, 'dum', 0.6); },
  fail: (d, t) => { pluck(d, t, 52, 0.8, 0); pluck(d, t + 0.18, 51, 0.8, 0); },
  bite: (d, t) => { for (let i = 0; i < 2; i++) nz(d, t + i * 0.12, 'bandpass', 1200, 3, 0.07, 0.3); },
  reel: (d, t) => { for (let i = 0; i < 4; i++) osc(d, t + i * 0.035, 'square', 2200, 2000, 0.02, 0.04); },
  baby: (d, t) => { [0, 4, 7, 11, 12].forEach((s, i) => bell(d, t + i * 0.14, 76 + s, 0.9)); },
  bleat: (d, t, p) => { const o = osc(d, t, 'sawtooth', 340 * p, 300 * p, 0.55, 0.06, 0.05); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 9; lg.gain.value = 25 * p; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.6); },
  goat: (d, t, p) => SFX.bleat(d, t, 1.4 * p),
  howl: (d, t) => { const o = osc(d, t, 'sine', 380, 520, 1.6, 0.12, 0.4); o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(560, t + 0.6); o.frequency.linearRampToValueAtTime(420, t + 1.6); },
  growl: (d, t, p) => { nz(d, t, 'lowpass', 300 * p, 3, 0.7, 0.35, 160, 0.08); osc(d, t, 'sawtooth', 70 * p, 55 * p, 0.7, 0.12, 0.08); },
  roar: (d, t) => { nz(d, t, 'lowpass', 500, 2, 1.4, 0.5, 180, 0.15); osc(d, t, 'sawtooth', 90, 60, 1.3, 0.18, 0.15); osc(d, t, 'sawtooth', 135, 80, 1.2, 0.1, 0.2); },
  grunt: (d, t, p) => { nz(d, t, 'lowpass', 400 * p, 4, 0.22, 0.4); osc(d, t, 'square', 90 * p, 70 * p, 0.2, 0.06); },
  chirp: (d, t, p) => { for (let i = 0; i < 3; i++) osc(d, t + i * 0.09, 'sine', 3200 * p, 4200 * p, 0.06, 0.04); },
  flap: (d, t) => { for (let i = 0; i < 5; i++) nz(d, t + i * 0.06, 'bandpass', 700, 1, 0.05, 0.15); },
  camel: (d, t) => { nz(d, t, 'lowpass', 350, 5, 0.6, 0.3, 200, 0.06); osc(d, t, 'sawtooth', 110, 85, 0.6, 0.06, 0.06); },
  fire: (d, t) => { for (let i = 0; i < 4; i++) nz(d, t + Math.random() * 0.3, 'highpass', 2500 + Math.random() * 2000, 0.6, 0.02, 0.08); },
  rustle: (d, t) => { nz(d, t, 'bandpass', 3000, 0.7, 0.4, 0.06, 1500, 0.1); },
  bubble: (d, t) => { osc(d, t, 'sine', 900, 1300, 0.08, 0.06); },
  thunder: (d, t, p) => { nz(d, t, 'highpass', 1800, 0.5, 0.25, 0.5, 600, 0.002); nz(d, t + 0.05, 'lowpass', 260 * p, 1.2, 2.8, 0.9, 70, 0.08); nz(d, t + 0.4, 'lowpass', 180, 1, 2.4, 0.6, 60, 0.4); },
  eat: (d, t) => { for (let i = 0; i < 3; i++) nz(d, t + i * 0.13, 'bandpass', 900 + i * 200, 2.5, 0.07, 0.28); },
  hammer: (d, t, p) => { osc(d, t, 'square', 600 * p, 300, 0.05, 0.12); nz(d, t, 'bandpass', 1500, 2, 0.08, 0.4); osc(d, t, 'sine', 160, 90, 0.12, 0.35); },
  whistle: (d, t) => { osc(d, t, 'sine', 1500, 2300, 0.18, 0.12); osc(d, t + 0.22, 'sine', 1700, 2600, 0.22, 0.12); },
  ney: (d, t, p, o) => { ney(d, t, o.note || 69, o.dur || 0.45, 1.1, 0); }, // one reed-pipe note (player's 피리 emote)
  clap: (d, t, p) => { nz(d, t, 'bandpass', 1400 * p, 1.4, 0.06, 0.5, 900, 0.002); nz(d, t + 0.004, 'highpass', 2600, 0.7, 0.04, 0.25); },
  hoof: (d, t, p) => { osc(d, t, 'sine', 220 * p, 120, 0.06, 0.25); nz(d, t, 'bandpass', 700 * p, 3, 0.05, 0.22); },
  // ---- story sounds (요셉 편)
  thud: (d, t, p) => { osc(d, t, 'sine', 95 * p, 38, 0.5, 0.95); nz(d, t, 'lowpass', 520, 0.8, 0.45, 0.7, 120); nz(d, t + 0.02, 'bandpass', 1400, 1, 0.25, 0.25, 500); },
  rope: (d, t) => { for (let i = 0; i < 4; i++) nz(d, t + i * 0.16, 'bandpass', 700 + Math.random() * 500, 6, 0.14, 0.12, 400); },
  chain: (d, t, p) => { for (let i = 0; i < 6; i++) { const k = t + i * 0.045 + Math.random() * 0.03; osc(d, k, 'square', (2400 + Math.random() * 1800) * p, 1800 * p, 0.05, 0.035); osc(d, k, 'sine', (3800 + Math.random() * 900) * p, 3600 * p, 0.12, 0.05); } nz(d, t, 'highpass', 4000, 0.7, 0.2, 0.08); },
  coins: (d, t) => { for (let i = 0; i < 9; i++) { const k = t + i * 0.09 + Math.random() * 0.05, f = 2000 + Math.random() * 1400; osc(d, k, 'sine', f, f, 0.22, 0.06); osc(d, k + 0.01, 'sine', f * 1.5, f * 1.5, 0.14, 0.03); } },
  rip: (d, t) => { for (let i = 0; i < 12; i++) nz(d, t + i * 0.025 + Math.random() * 0.01, 'bandpass', 1800 + Math.random() * 2400, 1.4, 0.04, 0.22); nz(d, t, 'highpass', 2500, 0.6, 0.35, 0.12, 6000, 0.05); },
  crowd: (d, t) => { for (let i = 0; i < 6; i++) nz(d, t + i * 0.18, 'bandpass', 380 + Math.random() * 500, 2.5, 0.9, 0.08 + Math.random() * 0.05, 300 + Math.random() * 300, 0.25); },
  cheerC: (d, t) => { for (let i = 0; i < 10; i++) nz(d, t + Math.random() * 0.6, 'bandpass', 700 + Math.random() * 900, 3, 0.8, 0.07, 500 + Math.random() * 500, 0.1); },
  heart: (d, t) => { for (const k of [0, 0.22]) { osc(d, t + k, 'sine', 62, 40, 0.22, k ? 0.45 : 0.6); nz(d, t + k, 'lowpass', 160, 0.8, 0.12, 0.25); } },
  fanfare: (d, t, p) => { const n = [62, 69, 74, 69, 74, 78, 81]; n.forEach((m, i) => { const f = mtof(m) * p, k = t + [0, 0.18, 0.36, 0.62, 0.74, 0.92, 1.1][i], len = i === n.length - 1 ? 1.2 : 0.2; const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.setValueAtTime(800, k); lp.frequency.linearRampToValueAtTime(2600, k + 0.06); g.gain.setValueAtTime(0, k); g.gain.linearRampToValueAtTime(0.11, k + 0.03); g.gain.setValueAtTime(0.1, k + len * 0.7); g.gain.linearRampToValueAtTime(0, k + len); o.connect(lp); lp.connect(g); g.connect(d); o.start(k); o.stop(k + len + 0.05); }); drum(d, t, 'boom', 0.7); },
  sistrum: (d, t) => { for (let i = 0; i < 3; i++) drum(d, t + i * 0.13, 'jingle', 1.2); },
  door: (d, t) => { const o = osc(d, t, 'sawtooth', 120, 90, 0.7, 0.05, 0.1); nz(d, t, 'bandpass', 500, 8, 0.7, 0.1, 300, 0.1); nz(d, t + 0.62, 'lowpass', 300, 1, 0.2, 0.4); },
  scratch: (d, t) => { for (let i = 0; i < 3; i++) nz(d, t + i * 0.22, 'bandpass', 2600, 4, 0.18, 0.18, 1800, 0.03); },
  whoosh: (d, t, p) => { nz(d, t, 'bandpass', 300 * p, 1.2, 1.1, 0.35, 3200 * p, 0.45); },
  grind: (d, t, p) => { nz(d, t, 'lowpass', 340 * p, 1.5, 0.5, 0.35, 220, 0.08); osc(d, t, 'triangle', 48 * p, 44 * p, 0.5, 0.12, 0.1); },
  moo: (d, t, p) => { const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140 * p, t); o.frequency.linearRampToValueAtTime(116 * p, t + 0.9); lp.type = 'lowpass'; lp.frequency.setValueAtTime(380, t); lp.frequency.linearRampToValueAtTime(900, t + 0.3); lp.frequency.linearRampToValueAtTime(340, t + 1.0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.13, t + 0.15); g.gain.linearRampToValueAtTime(0, t + 1.1); o.connect(lp); lp.connect(g); g.connect(d); o.start(t); o.stop(t + 1.2); },
  sob: (d, t) => { for (let i = 0; i < 3; i++) { nz(d, t + i * 0.28, 'bandpass', 900 - i * 80, 3, 0.2, 0.12, 600, 0.03); osc(d, t + i * 0.28, 'sine', 330 - i * 20, 260, 0.18, 0.03); } },
  bell2: (d, t, p) => { bell(d, t, 79 * (p || 1), 1.2); bell(d, t + 0.02, 86, 0.6); },
  water: (d, t) => { for (let i = 0; i < 6; i++) osc(d, t + i * 0.07 + Math.random() * 0.03, 'sine', 600 + Math.random() * 700, 1100 + Math.random() * 400, 0.06, 0.04); },
  wind: (d, t) => { nz(d, t, 'bandpass', 400, 0.8, 2.2, 0.25, 900, 0.8); },
  stamp: (d, t) => { osc(d, t, 'sine', 140, 60, 0.12, 0.6); nz(d, t, 'bandpass', 900, 1.5, 0.08, 0.35); },
};

// ------------------------------------------------------------------ ambience (continuous layers driven by the game)
let amb = null;
function loopNoise(type, f, q, g0) { const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = g0 || 0; n.connect(fl); fl.connect(g); g.connect(ambBus); n.start(); return { n, fl, g }; }
function ambInit() {
  amb = { wind: loopNoise('bandpass', 420, 0.6, 0), water: loopNoise('lowpass', 1100, 0.5, 0), rain: loopNoise('highpass', 900, 0.4, 0), rainLo: loopNoise('lowpass', 500, 0.6, 0), crick: null, nextBird: 0, nextCrick: 0, nextFire: 0, nextAnimal: 0 };
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 220; lfo.connect(lg); lg.connect(amb.wind.fl.frequency); lfo.start();
}
/* o: {hour, arid (0..1), water (distance), fire (distance), pens (distance), night} */
Au.ambient = function (o, dt) {
  if (!amb || !ctx || ctx.state !== 'running') return; const now = ctx.currentTime;
  const night = o.hour < 5.3 || o.hour > 20.4;
  amb.wind.g.gain.setTargetAtTime((0.05 + 0.13 * o.arid + (o.high || 0) * 0.08 + Math.max(0, (o.wind || 1) - 1) * 0.12) * (o.indoor ? 0.3 : 1), now, 0.8);
  amb.rain.g.gain.setTargetAtTime((o.rain || 0) * 0.32 * (o.indoor ? 0.5 : 1), now, 0.8); amb.rainLo.g.gain.setTargetAtTime((o.rain || 0) * 0.22, now, 0.8);
  amb.water.g.gain.setTargetAtTime(clamp(1 - o.water / 22, 0, 1) * 0.22, now, 0.5);
  if (!night && now > amb.nextBird && o.arid < 0.75 && !(o.rain > 0.3)) { amb.nextBird = now + 1.5 + Math.random() * 5 * (0.5 + o.arid); Au.sfx('chirp', { vol: 0.25 + Math.random() * 0.25, pitch: 0.8 + Math.random() * 0.5 }); }
  if (night && now > amb.nextCrick) { amb.nextCrick = now + 0.4 + Math.random() * 0.5; const t = now + 0.01, g = ctx.createGain(); g.gain.value = 0.05; g.connect(ambBus); for (let i = 0; i < 3; i++) { const o2 = ctx.createOscillator(), g2 = ctx.createGain(); o2.frequency.value = 4400 + Math.random() * 300; g2.gain.setValueAtTime(0, t + i * 0.05); g2.gain.linearRampToValueAtTime(1, t + i * 0.05 + 0.01); g2.gain.linearRampToValueAtTime(0, t + i * 0.05 + 0.035); o2.connect(g2); g2.connect(g); o2.start(t + i * 0.05); o2.stop(t + i * 0.05 + 0.05); } }
  if (o.fire < 14 && now > amb.nextFire) { amb.nextFire = now + 0.15 + Math.random() * 0.35; Au.sfx('fire', { vol: clamp(1 - o.fire / 14, 0, 1) * 0.8, gap: 0.05 }); }
  if (o.pens < 26 && now > amb.nextAnimal) { amb.nextAnimal = now + 4 + Math.random() * 9; Au.sfx(Math.random() < 0.6 ? 'bleat' : 'goat', { vol: clamp(1 - o.pens / 26, 0, 1) * 0.5, pitch: 0.85 + Math.random() * 0.35 }); }
};
// unlock on first gesture
const unlock = () => { Au.init(); };
addEventListener('pointerdown', unlock, { capture: true }); addEventListener('keydown', unlock, { capture: true });
})(window.G);
