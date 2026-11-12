#!/usr/bin/env python3
# piano-roll-ish spectrogram (log frequency) + loudness envelope for a rendered track
import sys, numpy as np
from scipy.io import wavfile
from scipy import signal
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
name = sys.argv[1]; t0 = float(sys.argv[2]) if len(sys.argv) > 2 else 0; t1 = float(sys.argv[3]) if len(sys.argv) > 3 else None
sr, x = wavfile.read(f'/home/claude/music/out/{name}.wav'); x = x.astype(np.float32) / 32768; m = x.mean(1)
a = int(t0 * sr); b = int(t1 * sr) if t1 else len(m); m = m[a:b]
f, t, S = signal.spectrogram(m, sr, nperseg=8192, noverlap=8192 - 1024)
keep = (f > 40) & (f < 4200); f = f[keep]; S = S[keep]
midi = 69 + 12 * np.log2(f / 440)
fig, ax = plt.subplots(2, 1, figsize=(16, 7), gridspec_kw={'height_ratios': [4, 1]})
ax[0].pcolormesh(t + t0, midi, 10 * np.log10(S + 1e-10), shading='auto', vmin=-90, vmax=-30, cmap='magma')
ax[0].set_ylim(28, 100); ax[0].set_ylabel('midi'); ax[0].set_title(name)
for k in range(36, 100, 12): ax[0].axhline(k, color='w', lw=0.3, alpha=0.4)
env = np.sqrt(signal.lfilter([1], [1, -0.999], m ** 2) * 0.001 + 1e-12)
ax[1].plot(np.arange(len(m))[::200] / sr + t0, 20 * np.log10(env[::200]), lw=0.6); ax[1].set_ylim(-60, 0)
plt.tight_layout(); plt.savefig(f'/home/claude/music/out/{name}.png', dpi=70)
