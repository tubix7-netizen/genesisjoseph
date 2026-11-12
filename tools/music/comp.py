# Tiny composition DSL -> event list -> TinySoundFont render -> reverb/master -> mp3
import math, random, subprocess, os, json
import numpy as np
from scipy import signal

SF2 = '/home/claude/music/gugs/GeneralUser-GS.sf2'
RENDER = '/home/claude/music/render'
OUT = '/home/claude/music/out'
os.makedirs(OUT, exist_ok=True)
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

def midi(n):
    """'C4' -> 60, 'F#3', 'Bb5'"""
    if isinstance(n, int): return n
    n = n.strip(); p = PC[n[0].upper()]; i = 1
    while i < len(n) and n[i] in '#b':
        p += 1 if n[i] == '#' else -1; i += 1
    return p + 12 * (int(n[i:]) + 1)

QUAL = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10], 'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11], 'sus2': [0, 2, 7], 'sus4': [0, 5, 7],
        'dim': [0, 3, 6], 'aug': [0, 4, 8], 'add9': [0, 4, 7, 14], 'madd9': [0, 3, 7, 14], '5': [0, 7], 'm9': [0, 3, 7, 10, 14], '6': [0, 4, 7, 9], 'm6': [0, 3, 7, 9],
        '7sus4': [0, 5, 7, 10], 'b9': [0, 4, 7, 10, 13]}

def chord(sym):
    """'Dm', 'Bb', 'C/E', 'F#dim', 'Asus4' -> (root pc, [intervals], bass pc)"""
    bass = None
    if '/' in sym: sym, b = sym.split('/'); bass = midi(b + '0') % 12
    r = PC[sym[0].upper()]; i = 1
    while i < len(sym) and sym[i] in '#b': r += 1 if sym[i] == '#' else -1; i += 1
    q = sym[i:]
    return r % 12, QUAL[q], (bass if bass is not None else r % 12)

def parse_seq(text):
    """'A4:1 F5:2 r:1 [D4 F4 A4]:2' -> [(keys or None, beats)]"""
    out = []
    for tok in text.replace('\n', ' ').replace('|', ' ').split():
        if ':' in tok: n, d = tok.rsplit(':', 1); d = float(eval(d))
        else: n, d = tok, 1.0
        if n == 'r': out.append((None, d))
        elif n.startswith('['): out.append(([midi(x) for x in n[1:-1].split(',')], d))
        else: out.append(([midi(n)], d))
    return out

class Song:
    def __init__(s, name, bpm, bars, bpb=4, sr=44100, tail=5.0, seed=1, swing=0.0):
        s.name, s.bpm, s.bars, s.bpb, s.sr, s.tail = name, bpm, bars, bpb, sr, tail
        s.ev = []; s.ch = {}; s.nch = 0; s.rng = random.Random(seed); s.swing = swing; s.prev = {}
    # ---------------------------------------------------------------- setup
    def inst(s, name, preset, bank=0, vol=100, pan=0.0, drum=False):
        c = 9 if drum else s.nch
        if not drum:
            s.nch += 1
            if s.nch == 9: s.nch = 10
        s.ch[name] = c
        s.ev.append(f'P {c} {bank} {preset} {1 if drum else 0}')
        s.ev.append(f'C 0 {c} 7 {vol}'); s.ev.append(f'C 0 {c} 11 127')
        s.ev.append(f'PAN {c} {pan}')
        return c
    def T(s, beat):
        if s.swing:
            b = math.floor(beat); f = beat - b
            if abs(f - 0.5) < 1e-6: beat = b + 0.5 + s.swing
        return beat * 60.0 / s.bpm
    @property
    def L(s): return s.bars * s.bpb * 60.0 / s.bpm
    # ---------------------------------------------------------------- notes
    def note(s, name, beat, key, vel, dur, hum=0.012, vh=0.06):
        c = s.ch[name]; t = max(0.0, s.T(beat) + (s.rng.uniform(-hum, hum) if hum else 0))
        v = max(0.05, min(1.0, vel * (1 + s.rng.uniform(-vh, vh))))
        d = max(0.03, dur * 60.0 / s.bpm)
        s.ev.append(f'N {t:.4f} {c} {key} {v:.3f} {d:.4f}')
    def mel(s, name, beat, text, vel=0.7, leg=0.96, shift=0, hum=0.01, accent=None):
        b = beat
        for i, (ks, d) in enumerate(parse_seq(text)):
            if ks:
                v = vel * (accent[i % len(accent)] if accent else 1.0)
                for k in ks: s.note(name, b, k + shift, v, d * leg, hum)
            b += d
        return b
    def voicing(s, sym, lo, hi, n=None, key=None):
        r, iv, bass = chord(sym); pcs = [(r + x) % 12 for x in iv]
        cands = [m for m in range(lo, hi + 1) if m % 12 in pcs]
        if n is None: n = len(pcs)
        prev = s.prev.get(key)
        best = None
        # choose n notes covering the pitch classes, close together, near previous voicing
        for start in range(len(cands)):
            sel = []; have = set()
            for m in cands[start:]:
                if m % 12 not in have or len(have) >= len(pcs): sel.append(m); have.add(m % 12)
                if len(sel) >= n: break
            if len(sel) < n or len(have) < min(len(pcs), n): continue
            span = sel[-1] - sel[0]
            cost = span * 0.3 + (sum(abs(a - b) for a, b in zip(sel, prev)) if prev and len(prev) == len(sel) else abs(sum(sel) / len(sel) - (lo + hi) / 2) * 0.5)
            if best is None or cost < best[0]: best = (cost, sel)
        sel = best[1] if best else cands[:n]
        s.prev[key] = sel
        return sel
    def pad(s, name, beat, prog, lo=52, hi=72, vel=0.45, n=None, leg=1.0, bassname=None, bassoct=2, bvel=0.55, restrike=None):
        """prog 'Dm:4 Bb:4 ...' sustained chords (+ optional bass note on another instrument)"""
        b = beat
        for tok in prog.split():
            sym, d = tok.rsplit(':', 1); d = float(eval(d))
            if sym != 'r':
                ks = s.voicing(sym, lo, hi, n, key=name)
                step = restrike or d
                k = 0.0
                while k < d - 1e-6:
                    dd = min(step, d - k)
                    for m in ks: s.note(name, b + k, m, vel, dd * leg, hum=0.02)
                    k += step
                if bassname:
                    _, _, bp = chord(sym); s.note(bassname, b, bp + 12 * (bassoct + 1), bvel, d * 0.98, hum=0.005)
            b += d
        return b
    def arp(s, name, beat, prog, pattern, step=0.5, lo=48, hi=76, vel=0.5, leg=1.6, accent=1.15, vdecay=0.0):
        """pattern indexes into the chord voicing sorted low->high, e.g. [0,1,2,3,2,1]; negative = rest"""
        b = beat
        for tok in prog.split():
            sym, d = tok.rsplit(':', 1); d = float(eval(d))
            if sym != 'r':
                ks = s.voicing(sym, lo, hi, 4, key=name + 'A'); ks = sorted(ks)
                r, iv, bass = chord(sym)
                ext = ks + [k + 12 for k in ks]
                n = int(round(d / step))
                for i in range(n):
                    p = pattern[i % len(pattern)]
                    if p is None or p < 0: continue
                    v = vel * (accent if i % (len(pattern)) == 0 else 1.0) * (1 - vdecay * i / max(1, n))
                    s.note(name, b + i * step, ext[p % len(ext)], v, step * leg, hum=0.008)
            b += d
        return b
    def bassline(s, name, beat, prog, pattern='1', vel=0.6, oct=2, leg=0.95):
        """pattern per chord: '1' root whole, '1-5' root then fifth (split), '1 1 5 1' (quarter units)"""
        b = beat
        for tok in prog.split():
            sym, d = tok.rsplit(':', 1); d = float(eval(d))
            if sym != 'r':
                r, iv, bass = chord(sym); root = bass + 12 * (oct + 1)
                steps = pattern.split()
                sd = d / len(steps)
                for i, p in enumerate(steps):
                    if p == '-': continue
                    k = root + {'1': 0, '5': 7, '8': 12, '3': iv[1] if len(iv) > 1 else 4, 'b7': 10, '4': 5, '2': 2}[p]
                    if k - root == 7 and k > 12 * (oct + 1) + 11: k -= 12
                    s.note(name, b + i * sd, k, vel * (1.1 if i == 0 else 0.9), sd * leg, hum=0.006)
            b += d
        return b
    def drums(s, beat, bars, pat, vel=0.6, kit='kit', step=0.25, hum=0.006):
        """pat {midiKey: 'x...x...'} one char per step; x=accent, o=normal, .=rest, g=ghost"""
        n = int(round(s.bpb / step))
        for bar in range(bars):
            for key, p in pat.items():
                for i, c in enumerate(p[:n] if len(p) >= n else (p * (n // len(p) + 1))[:n]):
                    if c == '.': continue
                    v = vel * {'x': 1.0, 'o': 0.72, 'g': 0.4}.get(c, 0.7)
                    s.note(kit, beat + bar * s.bpb + i * step, key, v, step * 0.9, hum=hum)
    # ---------------------------------------------------------------- controls
    def cc(s, name, beat, cc, val): s.ev.append(f'C {s.T(beat):.4f} {s.ch[name]} {cc} {int(max(0, min(127, val)))}')
    def swell(s, name, b0, b1, v0, v1, cc=11, steps=24):
        for i in range(steps + 1):
            k = i / steps; s.cc(name, b0 + (b1 - b0) * k, cc, v0 + (v1 - v0) * (0.5 - 0.5 * math.cos(math.pi * k)))
    def vib(s, name, b0, b1, cents=14, rate=5.2, delay=0.4, rng=2.0):
        """pitch-bend vibrato (whole channel; use on solo lines). rng = bend range in semitones (default 2)"""
        t0, t1 = s.T(b0), s.T(b1); c = s.ch[name]; dt = 1 / 40.0; t = t0
        while t < t1:
            k = min(1.0, max(0.0, (t - t0 - delay) / 0.8))
            v = 8192 + int(math.sin((t - t0) * rate * 2 * math.pi) * cents / (rng * 100) * 8191 * k)
            s.ev.append(f'B {t:.4f} {c} {v}'); t += dt
        s.ev.append(f'B {t1:.4f} {c} 8192')
    # ---------------------------------------------------------------- render
    def render(s, reverb=0.32, size=3.2, bright=0.5, gain_db=0.0, target_rms_db=-20.0, width=1.0, keep=False, lowcut=40):
        L = s.L; total = L + s.tail
        evf = f'{OUT}/{s.name}.txt'; raw = f'{OUT}/{s.name}.f32'
        with open(evf, 'w') as f:
            f.write(f'SR {s.sr}\nLEN {total:.3f}\n'); f.write('\n'.join(s.ev) + '\n')
        subprocess.run([RENDER, SF2, evf, raw], check=True)
        x = np.fromfile(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
        # cycle overlap is done by the player; keep the full (cycle + tail)
        y = master(x, s.sr, reverb, size, bright, width, lowcut)
        # loudness
        n = int(L * s.sr); body = y[:n]
        rms = np.sqrt(np.mean(body ** 2) + 1e-12); g = 10 ** (target_rms_db / 20) / rms * 10 ** (gain_db / 20)
        y *= g
        y = soft_limit(y, 0.89)
        # fade the very end of the tail
        ft = int(min(s.tail, 2.5) * s.sr); y[-ft:] *= np.linspace(1, 0, ft)[:, None] ** 2
        wav = f'{OUT}/{s.name}.wav'
        from scipy.io import wavfile
        wavfile.write(wav, s.sr, (np.clip(y, -1, 1) * 32767).astype(np.int16))
        mp3 = f'{OUT}/{s.name}.mp3'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '2', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '96k', mp3], check=True)
        if not keep: os.remove(raw)
        peak = float(np.max(np.abs(y)))
        info = {'name': s.name, 'loop': round(L, 4), 'len': round(total, 3), 'bpm': s.bpm, 'peak': round(peak, 3), 'rms_db': round(20 * math.log10(np.sqrt(np.mean(y[:n] ** 2)) + 1e-12), 1), 'kb': os.path.getsize(mp3) // 1024}
        print(json.dumps(info)); return info

def impulse(sr, size=3.2, bright=0.5, seed=7):
    rng = np.random.default_rng(seed); n = int(sr * size)
    t = np.arange(n) / sr
    out = np.zeros((n, 2))
    for ch in range(2):
        noise = rng.standard_normal(n)
        # band split: lows decay slower, highs faster
        bl, al = signal.butter(2, 900 / (sr / 2), 'low'); bh, ah = signal.butter(2, 900 / (sr / 2), 'high')
        low = signal.lfilter(bl, al, noise); high = signal.lfilter(bh, ah, noise)
        rt_low, rt_high = size * 0.95, size * (0.45 + 0.35 * bright)
        env_l = np.exp(-6.9 * t / rt_low); env_h = np.exp(-6.9 * t / rt_high)
        tail = low * env_l + high * env_h * (0.6 + 0.6 * bright)
        pre = int(0.022 * sr); tail = np.concatenate([np.zeros(pre), tail[:-pre]])
        # early reflections
        for d, a in [(0.011, 0.5), (0.019, 0.38), (0.029, 0.3), (0.041, 0.22), (0.057, 0.17), (0.071, 0.12)]:
            k = int((d + (0.0023 if ch else 0)) * sr); tail[k] += a * (1 if (k + ch) % 2 else -1)
        # soft onset
        on = int(0.03 * sr); tail[:on] *= np.linspace(0, 1, on)
        out[:, ch] = tail
    out /= np.sqrt(np.sum(out ** 2) / 2)
    return out

def master(x, sr, wet, size, bright, width, lowcut):
    b, a = signal.butter(2, lowcut / (sr / 2), 'high'); x = signal.lfilter(b, a, x, axis=0)
    ir = impulse(sr, size, bright)
    w = np.zeros_like(x)
    for ch in range(2): w[:, ch] = signal.fftconvolve(x[:, ch], ir[:, ch])[:len(x)]
    # gentle tilt: tame harsh highs in the wet
    b2, a2 = signal.butter(1, 6500 / (sr / 2), 'low'); w = signal.lfilter(b2, a2, w, axis=0)
    y = x * (1 - wet * 0.5) + w * wet * 0.9
    if width != 1.0:
        m = (y[:, 0] + y[:, 1]) / 2; d = (y[:, 0] - y[:, 1]) / 2 * width; y = np.stack([m + d, m - d], 1)
    return y

def soft_limit(y, th):
    a = np.abs(y); over = a > th
    y2 = y.copy(); y2[over] = np.sign(y[over]) * (th + (1 - th) * np.tanh((a[over] - th) / (1 - th)))
    return y2
