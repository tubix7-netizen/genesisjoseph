#!/usr/bin/env python3
"""Background music for 요셉 편 · 꿈꾸는 자. Each track = one loop cycle (+ reverb tail); the game schedules the next
cycle exactly one loop length later so the tail overlaps the new start (seamless). Instruments: GeneralUser GS."""
import sys
sys.path.insert(0, '/home/claude/music')
from comp import Song

# GM presets
HARP, STR_SLOW, STR_FAST, CHOIR, OOHS, OBOE, EHORN, FLUTE, PANF, SHAKU = 46, 49, 48, 52, 53, 68, 69, 73, 75, 77
CELLO, VIOLA, VIOLIN, CBASS, HORNS, TRUMPET, TROMB, TIMP, DULC, NYLON, SHENAI, CELESTE, GLOCK = 42, 41, 40, 43, 60, 56, 57, 47, 15, 24, 111, 8, 9
PIZZ, TREM, WARM, HALO, BOWED, ATMOS, KALIMBA, KOTO, SITAR, BASSOON, CLARINET, WW_CHOIR = 45, 44, 89, 94, 92, 99, 108, 107, 104, 70, 71, 48
# drum keys (GM)
KICK, SNARE, RIM, CLAP, HAT, OHAT, RIDE, BELL, TAMB, CRASH = 36, 38, 37, 39, 42, 46, 51, 53, 54, 49
BONGO_H, BONGO_L, CONGA_M, CONGA_H, CONGA_L, TIMB_H, TIMB_L, SHAKER, CABASA, TRI, TOM_L, TOM_F = 60, 61, 62, 63, 64, 65, 66, 82, 69, 81, 45, 41

def theme():
    """꿈꾸는 자 — 요셉의 주제 (title). D minor → F major → full return. 36 bars @ 68"""
    s = Song('j_theme', 68, 36, seed=3)
    s.inst('harp', HARP, vol=100, pan=-0.25); s.inst('pad', STR_SLOW, vol=86, pan=0.1); s.inst('cello', CELLO, vol=92, pan=0.2)
    s.inst('oboe', OBOE, vol=104, pan=-0.05); s.inst('flute', FLUTE, vol=96, pan=0.05); s.inst('vln', VIOLIN, vol=88, pan=-0.15)
    s.inst('horn', HORNS, vol=84, pan=0.3); s.inst('choir', OOHS, vol=80, pan=0.0); s.inst('bass', CBASS, vol=84, pan=0.15); s.inst('timp', TIMP, vol=90, pan=0)
    intro = 'Dm:4 Bb:4 F:4 Asus4:2 A:2'
    A = 'Dm:4 Bb:4 F:4 C:4 Dm:4 Bbmaj7:4 Gm6:4 Asus4:2 A:2'
    A2 = 'Dm:4 Bb:4 F:4 C:4 Dm:4 Bbmaj7:4 Gm:4 C7:4'
    B = 'F:4 C/E:4 Dm:4 Bb:4 F/A:4 Gm7:4 Bb:4 A:4'
    prog = intro + ' ' + A + ' ' + A2 + ' ' + B + ' ' + A
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 3, 2, 1], step=0.5, lo=50, hi=74, vel=0.42, leg=2.2)
    s.pad('pad', 0, prog, lo=53, hi=72, vel=0.32)
    s.bassline('cello', 0, prog, '1 - 5 -', vel=0.42, oct=2)
    s.bassline('bass', 80, B + ' ' + A, '1', vel=0.45, oct=1)
    # strings swell into each section
    s.swell('pad', 0, 16, 40, 100); s.swell('pad', 76, 84, 90, 118); s.swell('pad', 112, 116, 118, 96); s.swell('pad', 136, 144, 96, 70)
    melA = ('A4:1.5 D5:0.5 F5:1.5 E5:0.5 | D5:1 C5:1 D5:2 | C5:1.5 A4:0.5 F4:1 G4:1 | A4:1 G4:1 E4:2 |'
            'A4:1.5 D5:0.5 F5:1.5 G5:0.5 | A5:1.5 G5:0.5 F5:1 D5:1 | E5:1 D5:0.5 C5:0.5 Bb4:1 G4:1 | A4:3 r:1')
    melA2 = ('A4:1.5 D5:0.5 F5:1.5 E5:0.5 | D5:1 C5:1 D5:2 | C5:1.5 A4:0.5 F4:1 G4:1 | A4:1 G4:1 E4:2 |'
             'A4:1.5 D5:0.5 F5:1.5 G5:0.5 | A5:1.5 G5:0.5 F5:1 D5:1 | E5:1 D5:0.5 C5:0.5 Bb4:1 C5:1 | C5:2 E5:1 G5:1')
    melB = ('F5:1.5 G5:0.5 A5:2 | G5:1.5 F5:0.5 E5:1 C5:1 | D5:1 E5:1 F5:1 A5:1 | Bb5:2 A5:1 G5:1 |'
            'A5:1.5 G5:0.5 F5:1 C5:1 | D5:1 F5:1 G5:1.5 F5:0.5 | F5:2 D5:1 Bb4:1 | C#5:2 E5:2')
    s.mel('oboe', 16, melA, vel=0.62); s.vib('oboe', 16, 48, cents=12, rate=5.0)
    s.mel('flute', 48, melA2, vel=0.58); s.mel('oboe', 48, melA2, vel=0.3, shift=-12); s.vib('flute', 48, 80, cents=10, rate=5.4)
    # B: violins carry the tune, horn sings underneath
    s.mel('vln', 80, melB, vel=0.6); s.vib('vln', 80, 112, cents=16, rate=5.6)
    s.mel('horn', 80, 'A3:4 | G3:4 | F3:2 A3:2 | Bb3:4 | C4:4 | Bb3:4 | D4:4 | C#4:4', vel=0.5)
    s.swell('vln', 80, 96, 80, 120); s.swell('vln', 96, 112, 120, 104)
    # timpani roll into the return
    for i in range(16): s.note('timp', 108 + i * 0.25, 38 if i < 12 else 45, 0.25 + i * 0.03, 0.3)
    s.note('timp', 112, 38, 0.8, 2)
    # A'': full — violins + flute in octaves, oboe, choir
    s.mel('vln', 112, melA, vel=0.62, shift=12); s.mel('flute', 112, melA, vel=0.5); s.mel('oboe', 112, melA, vel=0.42)
    s.vib('vln', 112, 144, cents=16, rate=5.6); s.vib('flute', 112, 144, cents=10)
    s.pad('choir', 112, A, lo=55, hi=74, vel=0.34)
    s.swell('choir', 112, 120, 60, 112); s.swell('choir', 136, 144, 112, 50)
    return s.render(reverb=0.36, size=3.4)


from comp import parse_seq
def M(s, name, beat, text, beats=None, **kw):
    """melody with a length check (catches miscounted bars)"""
    end = s.mel(name, beat, text, **kw)
    if beats is not None and abs(end - beat - beats) > 1e-6: raise ValueError(f'{s.name}/{name}@{beat}: {end - beat} beats, expected {beats}')
    return end
def plen(prog): return sum(float(eval(t.rsplit(':', 1)[1])) for t in prog.split())

def canaan():
    """헤브론 골짜기의 아침 — 심부름 가는 소년 (프롤로그). G major, 84 bpm, 24 bars"""
    s = Song('j_canaan', 84, 24, seed=11)
    s.inst('harp', HARP, vol=96, pan=-0.3); s.inst('pad', STR_SLOW, vol=72, pan=0.15); s.inst('pizz', PIZZ, vol=86, pan=0.25)
    s.inst('flute', FLUTE, vol=98, pan=0.0); s.inst('shaku', SHAKU, vol=92, pan=-0.1); s.inst('oboe', OBOE, vol=80, pan=0.2); s.inst('kit', 0, drum=True, vol=60)
    intro, A, B, A2 = 'G:4 C/G:4 G:4 D/F#:4', 'G:4 Em:4 C:4 D:4 G:4 Bm:4 C:4 D:4', 'Em:4 C:4 G:4 D:4 Em:4 C:4 Am7:4 D:4', 'C:4 D:4 G:4 G:4'
    prog = ' '.join([intro, A, B, A2]); assert plen(prog) == 96
    s.arp('harp', 0, prog, [0, 2, 1, 3, 2, 4, 3, 1], step=0.5, lo=50, hi=76, vel=0.4, leg=2.0)
    s.pad('pad', 0, prog, lo=55, hi=71, vel=0.26); s.swell('pad', 0, 16, 50, 100)
    s.bassline('pizz', 16, ' '.join([A, B, A2]), '1 - 5 -', vel=0.42, oct=2)
    M(s, 'shaku', 0, 'r:8 D5:2 B4:1 A4:1 | G4:4', 16, vel=0.5); s.vib('shaku', 8, 16, cents=14, rate=4.6)
    M(s, 'flute', 16, 'D5:1 G5:1 A5:1 B5:1 | A5:1.5 G5:0.5 E5:2 | G5:1 E5:1 C5:1 E5:1 | D5:3 r:1 | D5:1 G5:1 A5:1 B5:1 | D6:1.5 B5:0.5 A5:2 | G5:1 E5:1 C5:1 E5:1 | D5:2 F#5:1 A5:1', 32, vel=0.58)
    s.vib('flute', 16, 48, cents=9, rate=5.2)
    M(s, 'shaku', 48, 'B4:1.5 C5:0.5 B4:1 G4:1 | E5:2 D5:1 C5:1 | B4:1 A4:1 G4:1 B4:1 | A4:3 r:1 | B4:1.5 C5:0.5 D5:1 E5:1 | G5:2 E5:1 C5:1 | A4:1 B4:1 C5:1 E5:1 | D5:3 r:1', 32, vel=0.56)
    s.vib('shaku', 48, 80, cents=16, rate=4.8)
    M(s, 'flute', 48, 'G5:4 | G5:4 | D5:4 | F#5:4 | G5:4 | E5:4 | E5:4 | F#5:2 A5:2', 32, vel=0.26)
    M(s, 'flute', 80, 'G5:1 A5:1 B5:1 D6:1 | C6:1.5 B5:0.5 A5:2 | B5:2 A5:1 G5:1 | G5:4', 16, vel=0.56)
    M(s, 'oboe', 80, 'E5:4 | F#5:4 | D5:2 B4:2 | B4:4', 16, vel=0.34)
    s.drums(16, 20, {SHAKER: '..o...o...o...g.'}, vel=0.22)
    s.swell('pad', 88, 96, 100, 60)
    return s.render(reverb=0.3, size=2.8, bright=0.6)

def dread():
    """도단 · 형들의 음모. D minor, 60 bpm, 16 bars"""
    s = Song('j_dread', 60, 16, seed=12)
    s.inst('trem', TREM, vol=80, pan=-0.15); s.inst('cello', CELLO, vol=90, pan=0.2); s.inst('bass', CBASS, vol=90, pan=0.1); s.inst('timp', TIMP, vol=92)
    s.inst('ehorn', EHORN, vol=96, pan=-0.05); s.inst('horn', HORNS, vol=72, pan=0.3); s.inst('choir', OOHS, vol=70)
    half = 'Dm:4 Dm:4 Bb:4 A:4 Dm:4 Gm/D:4 Eb:4 A:4'; prog = half + ' ' + half
    s.pad('trem', 0, prog, lo=50, hi=65, vel=0.24); s.swell('trem', 0, 16, 40, 96); s.swell('trem', 48, 64, 110, 70)
    s.bassline('cello', 0, prog, '1 1 1 1', vel=0.3, oct=2, leg=0.5)
    s.bassline('bass', 0, prog, '1', vel=0.4, oct=1)
    for b in range(0, 64, 8): s.note('timp', b, 38 if (b // 8) % 2 == 0 else 33, 0.42, 1.5)
    M(s, 'ehorn', 16, 'r:2 A4:1 Bb4:1 | G4:4 | r:2 G4:1 Bb4:1 | A4:2 E4:2 | F4:2 E4:1 D4:1 | A4:4 | Bb4:2 D5:2 | C#5:3 r:1 | D5:2 F5:2 | D5:2 Bb4:2 | G4:1 Bb4:1 Eb5:2 | E5:2 C#5:1 A4:1', 48, vel=0.56)
    s.vib('ehorn', 16, 64, cents=12, rate=4.6)
    s.pad('choir', 32, half, lo=50, hi=62, vel=0.26); s.swell('choir', 32, 40, 40, 100); s.swell('choir', 56, 64, 100, 50)
    s.mel('horn', 32, 'D3:8 | D3:8 | Bb2:8 | A2:8', vel=0.32); s.swell('horn', 32, 64, 60, 110)
    return s.render(reverb=0.34, size=3.2, bright=0.4)

def pit():
    """구덩이 속에서 — 외로운 퉁소 (창 37:24). A minor, 54 bpm, 16 bars"""
    s = Song('j_pit', 54, 16, seed=13)
    s.inst('shaku', SHAKU, vol=100, pan=0.0); s.inst('pad', STR_SLOW, vol=70, pan=0.15); s.inst('bass', CBASS, vol=84, pan=0.1)
    s.inst('harp', HARP, vol=84, pan=-0.3); s.inst('choir', OOHS, vol=64)
    prog = 'Am:8 F:8 Dm:8 E:8 Am:8 F:8 Dm:4 E:4 Am:8'; assert plen(prog) == 64
    s.pad('pad', 0, prog, lo=45, hi=62, vel=0.24); s.swell('pad', 0, 12, 30, 92)
    s.bassline('bass', 0, prog, '1', vel=0.34, oct=1)
    s.arp('harp', 0, prog, [0, -1, 2, -1, 3, -1, -1, -1], step=1, lo=52, hi=76, vel=0.26, leg=3)
    M(s, 'shaku', 0, 'r:4 E5:2 D5:1 C5:1 | C5:3 A4:1 F4:2 G4:1 A4:1 | A4:4 r:2 D5:1 E5:1 | F5:2 E5:4 r:2 | r:2 A5:2 G5:1 E5:1 C5:1 D5:1 | C5:2 A4:2 r:2 F5:1 E5:1 | D5:2 F5:1 E5:1 | E5:2 B4:1 G#4:1 | A4:6 r:2', 64, vel=0.55, leg=0.98)
    s.vib('shaku', 0, 64, cents=18, rate=4.4, delay=0.6)
    s.pad('choir', 32, 'Am:8 F:8 Dm:4 E:4 Am:8', lo=52, hi=64, vel=0.22); s.swell('choir', 32, 40, 30, 90); s.swell('choir', 56, 64, 90, 30)
    return s.render(reverb=0.44, size=4.2, bright=0.35)

def mourn():
    """야곱의 애통 · 팔려 가는 아들 (창 37:34–35). D minor, 58 bpm, 20 bars"""
    s = Song('j_mourn', 58, 20, seed=14)
    s.inst('cello', CELLO, vol=104, pan=0.15); s.inst('vln', VIOLIN, vol=92, pan=-0.2); s.inst('pad', STR_SLOW, vol=80, pan=0.05)
    s.inst('bass', CBASS, vol=84, pan=0.1); s.inst('choir', CHOIR, vol=72); s.inst('harp', HARP, vol=80, pan=-0.3)
    prog = 'Dm:4 Gm/D:4 Dm:4 A7:4 Bb:4 Gm:4 Asus4:2 A:2 Dm:4 Dm:4 Bbmaj7:4 Gm:4 A:4 F:4 C:4 Dm:4 Bb:4 Gm:4 A:4 Dm:8'; assert plen(prog) == 80
    s.pad('pad', 0, prog, lo=50, hi=69, vel=0.28); s.swell('pad', 0, 8, 40, 92); s.swell('pad', 48, 64, 92, 124); s.swell('pad', 72, 80, 118, 60)
    s.bassline('bass', 0, prog, '1', vel=0.36, oct=1)
    s.arp('harp', 0, prog, [0, 1, 2, 3, -1, 2, 1, -1], step=1, lo=50, hi=74, vel=0.22, leg=2.5)
    M(s, 'cello', 0, 'A3:2 D4:1 E4:1 | G4:3 F4:1 | D4:1.5 C#4:0.5 D4:1 A3:1 | E4:4 | F4:2 G4:1 F4:1 | D4:3 Bb3:1 | D4:2 C#4:1 E4:1 | D4:4', 32, vel=0.62)
    s.vib('cello', 0, 32, cents=16, rate=5.0)
    M(s, 'vln', 32, 'A4:2 D5:1 E5:1 | F5:3 D5:1 | D5:2 Bb4:1 D5:1 | C#5:2 E5:2 | F5:2 A5:1 G5:1 | E5:2 C5:2 | F5:1 E5:1 D5:1 F5:1 | D5:4 | G5:2 F5:1 E5:1 | E5:2 C#5:2 | D5:8', 48, vel=0.6)
    s.vib('vln', 32, 80, cents=18, rate=5.6); s.swell('vln', 32, 48, 80, 110); s.swell('vln', 48, 64, 110, 124); s.swell('vln', 64, 80, 124, 70)
    M(s, 'cello', 32, 'D3:4 | Bb2:4 | G2:4 | A2:4 | F3:2 A3:2 | C3:2 E3:2 | D3:4 | Bb2:4 | Bb3:4 | A3:4 | D3:8', 48, vel=0.42)
    s.pad('choir', 48, 'F:4 C:4 Dm:4 Bb:4 Gm:4 A:4 Dm:8', lo=55, hi=72, vel=0.3); s.swell('choir', 48, 56, 40, 110); s.swell('choir', 72, 80, 110, 40)
    return s.render(reverb=0.4, size=3.8, bright=0.4)

def caravan():
    """이스마엘 대상과 광야 길 (창 37:25, 28). E Hijaz, 76 bpm, 24 bars"""
    s = Song('j_caravan', 76, 24, seed=15)
    s.inst('oud', NYLON, vol=92, pan=-0.25); s.inst('qanun', DULC, vol=84, pan=0.3); s.inst('ney', SHAKU, vol=100, pan=0.0)
    s.inst('drone', CELLO, vol=78, pan=0.1); s.inst('kit', 0, drum=True, vol=96)
    intro, A, B, out = 'E:16', 'E:4 F:4 E:4 Dm:4 E:4 F:4 Dm:4 F:2 E:2', 'Am:4 Dm:4 F:4 E:4 Am:4 Dm:4 F:2 E:2 E:4', 'E:4 F:4 E:8'
    prog = ' '.join([intro, A, B, out]); assert plen(prog) == 96
    for b in range(0, 96, 4): s.note('drone', b, 40, 0.34, 4); s.note('drone', b, 47, 0.26, 4)
    s.arp('oud', 0, prog, [0, -1, 1, 0, 2, -1, 1, -1], step=0.5, lo=40, hi=64, vel=0.42, leg=1.2)
    s.arp('qanun', 16, ' '.join([A, B]), [0, 1, 2, 3, 4, 3, 2, 1], step=0.25, lo=60, hi=84, vel=0.2, leg=1.4)
    s.drums(0, 24, {CONGA_L: 'x.......x.......', BONGO_H: '....o.o.....o...', TAMB: '..g...g...g.o.g.'}, vel=0.5)
    M(s, 'ney', 8, 'r:4 E5:2 F5:1 E5:1', 8, vel=0.5)
    M(s, 'ney', 16, 'E5:1 F5:0.5 G#5:0.5 A5:2 | A5:1.5 G#5:0.5 F5:2 | E5:1 F5:1 G#5:1 B5:1 | A5:1.5 F5:0.5 D5:2 | B5:1 C6:0.5 B5:0.5 G#5:2 | A5:1 C6:1 A5:1 F5:1 | D6:1.5 C6:0.5 A5:2 | G#5:1 F5:1 E5:2', 32, vel=0.58)
    s.vib('ney', 16, 48, cents=20, rate=5.0)
    M(s, 'ney', 48, 'C6:1 B5:0.5 A5:0.5 E5:2 | F5:1 E5:0.5 D5:0.5 A5:2 | C6:1.5 A5:0.5 F5:1 A5:1 | G#5:1 F5:1 E5:2 | E6:2 D6:1 C6:1 | D6:1.5 C6:0.5 A5:2 | A5:1 G#5:1 F5:1 E5:1 | E5:4', 32, vel=0.6)
    M(s, 'qanun', 48, 'C5:1 B4:0.5 A4:0.5 E4:2 | F4:1 E4:0.5 D4:0.5 A4:2 | C5:1.5 A4:0.5 F4:1 A4:1 | G#4:1 F4:1 E4:2 | E5:2 D5:1 C5:1 | D5:1.5 C5:0.5 A4:2 | A4:1 G#4:1 F4:1 E4:1 | E4:4', 32, vel=0.3)
    s.vib('ney', 48, 80, cents=20, rate=5.0)
    M(s, 'ney', 80, 'E5:4 | F5:2 E5:2 | E5:8', 16, vel=0.5)
    return s.render(reverb=0.3, size=2.6, bright=0.55)

def egypt():
    """애굽 · 나일 강의 땅 (노예 장터, 도성). D Hijaz, 88 bpm, 24 bars"""
    s = Song('j_egypt', 88, 24, seed=16)
    s.inst('harp', HARP, vol=100, pan=-0.3); s.inst('oboe', SHENAI, vol=80, pan=0.05); s.inst('ob2', OBOE, vol=92, pan=0.1); s.inst('vln', VIOLIN, vol=86, pan=-0.15)
    s.inst('pad', STR_SLOW, vol=78, pan=0.15); s.inst('horn', HORNS, vol=80, pan=0.3); s.inst('bass', CBASS, vol=86, pan=0.1); s.inst('kit', 0, drum=True, vol=96)
    intro, A, B, A2 = 'D:8 Eb:4 D:4', 'D:4 Eb:4 D:4 Cm:4 D:4 Gm:4 Eb:4 D:4', 'Gm:4 Cm:4 D:4 D:4 Gm:4 Eb:4 Cm:2 D:2 D:4', 'D:4 Eb:4 Cm:2 D:2 D:4'
    prog = ' '.join([intro, A, B, A2]); assert plen(prog) == 96
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 5, 4, 2], step=0.5, lo=50, hi=79, vel=0.38, leg=2.2)
    s.pad('pad', 0, prog, lo=50, hi=69, vel=0.26); s.bassline('bass', 0, prog, '1 - 5 -', vel=0.4, oct=1)
    s.drums(16, 20, {CONGA_L: 'x.....x...x.....', BONGO_H: '..o.o.....o.o.o.', TAMB: 'o.g.o.g.o.g.o.go'}, vel=0.46)
    s.drums(0, 4, {TAMB: 'x...............'}, vel=0.5)
    M(s, 'horn', 0, 'D4:4 A4:4 | Bb4:4 A4:4', 16, vel=0.42)
    M(s, 'ob2', 16, 'D5:1 Eb5:0.5 F#5:0.5 G5:2 | Bb5:1.5 G5:0.5 Eb5:2 | F#5:1 G5:1 A5:2 | G5:1.5 Eb5:0.5 C5:2 | A5:1 Bb5:0.5 A5:0.5 F#5:2 | G5:1 Bb5:1 D6:2 | C6:1 Bb5:1 G5:1 Eb5:1 | F#5:1 Eb5:1 D5:2', 32, vel=0.6)
    s.vib('ob2', 16, 48, cents=14, rate=5.6)
    M(s, 'oboe', 16, 'D4:1 Eb4:0.5 F#4:0.5 G4:2 | Bb4:1.5 G4:0.5 Eb4:2 | F#4:1 G4:1 A4:2 | G4:1.5 Eb4:0.5 C4:2 | A4:1 Bb4:0.5 A4:0.5 F#4:2 | G4:1 Bb4:1 D5:2 | C5:1 Bb4:1 G4:1 Eb4:1 | F#4:1 Eb4:1 D4:2', 32, vel=0.22)
    M(s, 'vln', 48, 'D6:2 Bb5:1 G5:1 | Eb6:2 C6:1 G5:1 | F#5:1 A5:1 D6:2 | C6:1 Bb5:1 A5:2 | G5:1 A5:1 Bb5:2 | G5:1.5 F5:0.5 Eb5:2 | Eb5:1 C5:1 D5:1 F#5:1 | D5:4', 32, vel=0.56)
    s.vib('vln', 48, 80, cents=16, rate=5.8); s.swell('vln', 48, 64, 80, 118)
    M(s, 'ob2', 80, 'D5:1 Eb5:0.5 F#5:0.5 A5:2 | Bb5:1.5 G5:0.5 Eb5:2 | G5:1 Eb5:1 F#5:1 A5:1 | D6:4', 16, vel=0.58)
    M(s, 'vln', 80, 'D5:4 | Eb5:4 | C5:2 D5:2 | D5:4', 16, vel=0.4)
    M(s, 'horn', 80, 'F#3:4 | G3:4 | G3:2 F#3:2 | D3:4', 16, vel=0.4)
    return s.render(reverb=0.32, size=3.0, bright=0.55)

def house():
    """보디발의 집 · 종의 하루 (창 39:2–6). A minor, 96 bpm, 24 bars"""
    s = Song('j_house', 96, 24, seed=17)
    s.inst('harp', HARP, vol=92, pan=-0.3); s.inst('pizz', PIZZ, vol=90, pan=0.25); s.inst('flute', FLUTE, vol=96, pan=0.0); s.inst('clar', CLARINET, vol=90, pan=-0.1)
    s.inst('pad', STR_SLOW, vol=66, pan=0.1); s.inst('kit', 0, drum=True, vol=80)
    A, B = 'Am:4 G:4 F:4 G:4 Am:4 G:4 F:4 E:4', 'F:4 G:4 Em:4 Am:4 Dm:4 G:4 C:4 E:4'
    prog = ' '.join([A, B, A]); assert plen(prog) == 96
    s.arp('harp', 0, prog, [0, 2, 1, 2, 3, 2, 1, 2], step=0.5, lo=52, hi=76, vel=0.34, leg=1.6)
    s.bassline('pizz', 0, prog, '1 5 8 5', vel=0.4, oct=2, leg=0.6)
    s.pad('pad', 32, B, lo=55, hi=71, vel=0.22)
    melA = 'E5:1 A5:1 G5:0.5 A5:0.5 C6:1 | B5:1 G5:1 D5:2 | C6:1 A5:1 F5:1 A5:1 | G5:3 r:1 | E5:1 A5:1 B5:1 C6:1 | D6:1 B5:1 G5:1 B5:1 | A5:1.5 G5:0.5 F5:1 A5:1 | G#5:2 E5:2'
    M(s, 'flute', 0, melA, 32, vel=0.55); M(s, 'flute', 64, melA, 32, vel=0.56); s.vib('flute', 0, 32, cents=8); s.vib('flute', 64, 96, cents=8)
    M(s, 'clar', 32, 'A4:1 C5:1 F5:2 | D5:1 B4:1 G4:2 | E5:1.5 D5:0.5 B4:2 | C5:1 A4:1 E4:2 | F4:1 A4:1 D5:1 F5:1 | G5:1.5 F5:0.5 D5:2 | E5:1 G5:1 C6:2 | B5:2 G#5:2', 32, vel=0.56)
    M(s, 'clar', 64, melA, 32, vel=0.26, shift=-12)
    s.drums(0, 24, {SHAKER: 'o.g.o.g.o.g.o.g.', BONGO_H: '..o.......o..o..', BONGO_L: 'x.......x.......'}, vel=0.32)
    return s.render(reverb=0.26, size=2.4, bright=0.6)

def night():
    """종들의 숙소 · 같은 별 아래 (자장가). F major, 60 bpm, 16 bars"""
    s = Song('j_night', 60, 16, seed=18)
    s.inst('cel', CELESTE, vol=80, pan=-0.2); s.inst('harp', HARP, vol=88, pan=0.25); s.inst('flute', FLUTE, vol=94, pan=0.0); s.inst('pad', WARM, vol=70, pan=0.0)
    s.inst('bass', CBASS, vol=70, pan=0.1)
    prog = 'F:4 Am/E:4 Dm:4 Bb:4 F/C:4 C:4 Bb:4 C:4 F:4 Am:4 Bb:4 Gm7:4 F/C:4 C7:4 F:8'; assert plen(prog) == 64
    s.arp('cel', 0, prog, [0, 2, 3, 1, 2, 3, 1, 3], step=0.5, lo=62, hi=84, vel=0.24, leg=1.8)
    s.arp('harp', 0, prog, [0, -1, 1, -1, 2, -1, 1, -1], step=0.5, lo=41, hi=60, vel=0.3, leg=2.5)
    s.pad('pad', 0, prog, lo=53, hi=69, vel=0.22); s.bassline('bass', 0, prog, '1', vel=0.26, oct=1)
    M(s, 'flute', 0, 'C5:2 A4:1 C5:1 | E5:3 C5:1 | D5:2 F5:1 A5:1 | G5:2 F5:1 D5:1 | C5:2 F5:1 A5:1 | G5:3 E5:1 | F5:2 D5:1 Bb4:1 | C5:4 | A5:2 G5:1 F5:1 | E5:2 C5:2 | D5:1.5 F5:0.5 Bb5:2 | A5:2 G5:1 F5:1 | F5:1 E5:1 F5:1 A5:1 | G5:2 E5:1 Bb4:1 | F5:8', 64, vel=0.48)
    s.vib('flute', 0, 64, cents=8, rate=4.8)
    return s.render(reverb=0.42, size=3.6, bright=0.45)

def prison():
    """왕의 옥 · 차꼬 (시 105:18). C minor, 62 bpm, 20 bars"""
    s = Song('j_prison', 62, 20, seed=19)
    s.inst('clar', CLARINET, vol=98, pan=-0.1); s.inst('cello', CELLO, vol=96, pan=0.2); s.inst('bass', CBASS, vol=84, pan=0.1); s.inst('harp', HARP, vol=78, pan=-0.3)
    s.inst('bsn', BASSOON, vol=80, pan=0.25); s.inst('pad', STR_SLOW, vol=70, pan=0.0)
    prog = 'Cm:4 Ab:4 Fm:4 G:4 Cm:4 Eb:4 Ab:4 G:4 Ab:4 Eb:4 Fm:4 G:4 Cm:4 Ab:4 Bb:4 Eb:4 Fm:4 G:4 Cm:8'; assert plen(prog) == 80
    s.pad('pad', 0, prog, lo=48, hi=67, vel=0.24); s.bassline('bass', 0, prog, '1', vel=0.34, oct=1)
    s.arp('harp', 0, prog, [0, -1, -1, 2, -1, -1, 1, -1], step=0.5, lo=48, hi=72, vel=0.24, leg=3)
    M(s, 'clar', 0, 'G4:2 Eb4:1 G4:1 | C5:3 Bb4:1 | Ab4:2 F4:1 G4:1 | B4:4 | C5:1.5 D5:0.5 Eb5:2 | G5:2 F5:1 Eb5:1 | C5:2 Eb5:1 C5:1 | D5:3 r:1', 32, vel=0.54)
    s.vib('clar', 0, 32, cents=8)
    M(s, 'cello', 32, 'C4:2 Ab3:2 | G3:2 Bb3:2 | Ab3:1.5 G3:0.5 F3:2 | G3:4 | Eb4:2 D4:1 C4:1 | C4:2 Eb4:2 | D4:2 F4:2 | Eb4:4', 32, vel=0.58)
    s.vib('cello', 32, 64, cents=14, rate=5.0)
    M(s, 'bsn', 32, 'Ab2:4 | Eb3:4 | F2:4 | G2:4 | C3:4 | Ab2:4 | Bb2:4 | Eb3:4', 32, vel=0.3)
    M(s, 'clar', 64, 'Ab4:2 G4:1 F4:1 | D4:2 B3:2 | C4:8', 16, vel=0.5); M(s, 'cello', 64, 'F3:4 | G3:4 | C3:8', 16, vel=0.42)
    return s.render(reverb=0.38, size=3.4, bright=0.35)

def hope():
    """은혜 · 형통하게 하셨더라 (창 39:21–23). Eb major, 72 bpm, 20 bars"""
    s = Song('j_hope', 72, 20, seed=20)
    s.inst('oboe', OBOE, vol=98, pan=0.0); s.inst('vln', VIOLIN, vol=90, pan=-0.2); s.inst('pad', STR_SLOW, vol=80, pan=0.15); s.inst('harp', HARP, vol=90, pan=-0.3)
    s.inst('cello', CELLO, vol=84, pan=0.2); s.inst('horn', HORNS, vol=74, pan=0.3)
    A, B, C = 'Eb:4 Bb/D:4 Cm:4 Ab:4 Eb/G:4 Ab:4 Bb:8', 'Ab:4 Bb:4 Gm:4 Cm:4 Ab:4 Fm7:4 Bb:8', 'Ab:4 Bb:4 Eb:8'
    prog = ' '.join([A, B, C]); assert plen(prog) == 80
    s.arp('harp', 0, prog, [0, 1, 2, 3, 2, 1, 2, 3], step=0.5, lo=51, hi=75, vel=0.32, leg=2)
    s.pad('pad', 0, prog, lo=51, hi=70, vel=0.27); s.swell('pad', 24, 32, 80, 110); s.swell('pad', 56, 64, 90, 124)
    s.bassline('cello', 0, prog, '1 - 5 -', vel=0.38, oct=2)
    M(s, 'oboe', 0, 'Bb4:1 Eb5:1 F5:1 G5:1 | F5:2 D5:2 | Eb5:1 G5:1 C6:2 | Bb5:1.5 Ab5:0.5 Eb5:2 | G5:2 Bb5:2 | C6:2 Ab5:1 Eb5:1 | F5:2 G5:1 Ab5:1 | Bb5:4', 32, vel=0.58)
    s.vib('oboe', 0, 32, cents=12, rate=5.4)
    M(s, 'vln', 32, 'C6:2 Bb5:1 Ab5:1 | D6:2 Bb5:2 | Bb5:1 G5:1 D6:2 | C6:2 G5:2 | Eb6:2 C6:1 Ab5:1 | Ab5:2 F5:1 Eb5:1 | F5:2 Bb5:2 | D6:4', 32, vel=0.58)
    s.vib('vln', 32, 80, cents=16, rate=5.6); s.swell('vln', 32, 64, 84, 122)
    M(s, 'horn', 32, 'Ab3:4 | Bb3:4 | Bb3:4 | G3:4 | C4:4 | Ab3:4 | Bb3:8', 32, vel=0.38)
    M(s, 'vln', 64, 'Eb6:2 C6:1 Ab5:1 | D6:2 F6:2 | Eb6:8', 16, vel=0.56); M(s, 'oboe', 64, 'C5:2 Eb5:2 | F5:2 D5:2 | Eb5:8', 16, vel=0.42)
    s.swell('vln', 72, 80, 120, 70)
    return s.render(reverb=0.36, size=3.2, bright=0.55)

def dream():
    """꿈 · 하나님이 보이신 것 (리디안). C lydian, 56 bpm, 16 bars"""
    s = Song('j_dream', 56, 16, seed=21)
    s.inst('choir', OOHS, vol=82, pan=0.0); s.inst('cel', CELESTE, vol=78, pan=-0.25); s.inst('harp', HARP, vol=90, pan=0.3); s.inst('bow', BOWED, vol=70, pan=0.1)
    s.inst('glock', GLOCK, vol=60, pan=-0.1); s.inst('flute', FLUTE, vol=90, pan=0.05); s.inst('bass', CBASS, vol=70)
    prog = 'Cmaj7:8 D/C:8 Em:8 Bm:8 Cmaj7:8 Am7:8 G:8 D:8'; assert plen(prog) == 64
    s.pad('choir', 0, prog, lo=55, hi=74, vel=0.28); s.pad('bow', 0, prog, lo=43, hi=60, vel=0.24)
    s.swell('choir', 0, 8, 30, 100); s.swell('choir', 56, 64, 100, 60)
    s.arp('cel', 0, prog, [0, 1, 2, 3, 4, 3, 2, 1], step=0.5, lo=67, hi=91, vel=0.2, leg=2)
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 5, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1], step=0.25, lo=48, hi=88, vel=0.26, leg=6)
    s.bassline('bass', 0, prog, '1', vel=0.26, oct=1)
    for b in range(4, 64, 8): s.note('glock', b + 0.5, [88, 86, 91, 90, 88, 84, 86, 90][(b // 8) % 8], 0.22, 2)
    M(s, 'flute', 0, 'E5:4 F#5:2 G5:2 | A5:4 F#5:4 | G5:4 B5:2 E5:2 | F#5:4 D5:4 | E5:2 G5:2 B5:4 | C6:4 A5:4 | B5:4 G5:2 D5:2 | F#5:8', 64, vel=0.42)
    s.vib('flute', 0, 64, cents=9, rate=4.6)
    return s.render(reverb=0.5, size=4.6, bright=0.6)

def court():
    """바로의 궁 · 행렬 (창 41:14). D minor, 70 bpm, 20 bars"""
    s = Song('j_court', 70, 20, seed=22)
    s.inst('horn', HORNS, vol=96, pan=0.25); s.inst('tpt', TRUMPET, vol=80, pan=-0.2); s.inst('vln', VIOLIN, vol=90, pan=-0.2); s.inst('pad', STR_SLOW, vol=84, pan=0.1)
    s.inst('harp', HARP, vol=90, pan=-0.3); s.inst('bass', CBASS, vol=90, pan=0.1); s.inst('timp', TIMP, vol=96); s.inst('kit', 0, drum=True, vol=80)
    prog = 'Dm:4 Dm:4 Bb:4 A:4 Dm:4 Gm:4 A:4 Dm:4 F:4 C:4 Bb:4 A:4 Dm:4 Bb:4 Gm:4 A:4 Dm:8 A:4 Dm:4'; assert plen(prog) == 80
    s.pad('pad', 0, prog, lo=50, hi=69, vel=0.3); s.bassline('bass', 0, prog, '1 - 5 -', vel=0.42, oct=1)
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 3, 2, 1], step=0.5, lo=50, hi=77, vel=0.3, leg=2)
    for b in range(0, 80, 2): s.note('timp', b, 38 if (b // 4) % 2 == 0 else 33, 0.5 if b % 4 == 0 else 0.3, 0.6)
    s.drums(0, 20, {TAMB: '....x.......x...'}, vel=0.4)
    M(s, 'horn', 0, 'D4:2 A4:2 | F4:1 E4:1 D4:2 | F4:2 Bb4:2 | A4:3 r:1 | D5:2 C5:1 A4:1 | Bb4:2 G4:2 | E4:1 A4:1 C#5:2 | D5:4', 32, vel=0.56)
    M(s, 'vln', 32, 'A5:2 F5:2 | G5:1 E5:1 C5:2 | D5:2 F5:2 | E5:2 C#5:2 | F5:2 A5:2 | Bb5:2 F5:1 D5:1 | Bb4:2 D5:2 | C#5:2 E5:2', 32, vel=0.58)
    s.vib('vln', 32, 64, cents=14, rate=5.6); M(s, 'horn', 32, 'F3:4 | E3:4 | D3:4 | C#3:4 | D3:4 | D3:4 | D3:4 | E3:4', 32, vel=0.36)
    M(s, 'tpt', 64, 'D5:4 | F5:2 A5:2 | E5:2 C#5:2 | D5:4', 16, vel=0.52); M(s, 'horn', 64, 'A4:4 | D5:4 | C#5:4 | A4:4', 16, vel=0.48)
    return s.render(reverb=0.36, size=3.6, bright=0.5)

def triumph():
    """총리가 되다 · 버금 수레 행렬 (창 41:41–43). D major, 100 bpm, 24 bars"""
    s = Song('j_triumph', 100, 24, seed=23)
    s.inst('tpt', TRUMPET, vol=96, pan=-0.15); s.inst('horn', HORNS, vol=94, pan=0.25); s.inst('vln', VIOLIN, vol=92, pan=-0.25); s.inst('pad', STR_FAST, vol=84, pan=0.1)
    s.inst('choir', CHOIR, vol=82); s.inst('harp', HARP, vol=86, pan=-0.3); s.inst('bass', CBASS, vol=92, pan=0.1); s.inst('timp', TIMP, vol=98); s.inst('kit', 0, drum=True, vol=90)
    A, B, C = 'D:4 G:4 D:4 A:4 D:4 Bm:4 G:4 A:4', 'G:4 A:4 F#m:4 Bm:4 G:4 D/F#:4 Em7:4 A:4', 'D:4 G:4 D:4 A:4 G:4 A:4 D:8'
    prog = ' '.join([A, B, C]); assert plen(prog) == 96
    s.pad('pad', 0, prog, lo=50, hi=72, vel=0.32, restrike=2); s.bassline('bass', 0, prog, '1 1 5 1', vel=0.44, oct=1)
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 3, 2, 1], step=0.5, lo=50, hi=79, vel=0.3, leg=2)
    s.drums(0, 24, {KICK: 'x.......x.......', SNARE: '....o.......o.g.', TAMB: 'o.g.o.g.o.g.o.g.'}, vel=0.44)
    for b in [0, 32, 64]: s.note('kit', b, CRASH, 0.5, 2)
    for b in range(0, 96, 4): s.note('timp', b, 38 if (b // 16) % 2 == 0 else 33, 0.5, 1)
    melA = 'A4:1.5 D5:0.5 F#5:1.5 E5:0.5 | D5:1 B4:1 D5:2 | A4:1.5 F#4:0.5 A4:1 D5:1 | E5:1 C#5:1 A4:2 | A4:1.5 D5:0.5 F#5:1.5 G5:0.5 | F#5:1.5 E5:0.5 D5:1 B4:1 | B4:1 D5:1 G5:1 B5:1 | A5:3 r:1'
    M(s, 'tpt', 0, melA, 32, vel=0.6); M(s, 'horn', 0, melA, 32, vel=0.36, shift=-12)
    M(s, 'vln', 32, 'B5:2 A5:1 G5:1 | C#6:2 A5:2 | A5:2 F#5:1 C#5:1 | D5:1 F#5:1 B5:2 | B5:2 G5:1 D5:1 | A5:2 F#5:2 | G5:1 E5:1 D5:1 B4:1 | C#5:2 E5:2', 32, vel=0.6)
    s.vib('vln', 32, 96, cents=14, rate=5.8); M(s, 'horn', 32, 'D4:4 | E4:4 | C#4:4 | D4:4 | D4:4 | D4:4 | B3:4 | C#4:4', 32, vel=0.4)
    melC = 'A5:1.5 D6:0.5 F#6:1.5 E6:0.5 | D6:1 B5:1 D6:2 | A5:1.5 F#5:0.5 A5:1 D6:1 | E6:1 C#6:1 A5:2 | B5:1 D6:1 G6:1 B6:1 | A6:3 r:1 | D6:8'
    M(s, 'vln', 64, melC, 32, vel=0.6); M(s, 'tpt', 64, melC, 32, vel=0.5, shift=-12)
    s.pad('choir', 64, C, lo=57, hi=76, vel=0.34); s.swell('choir', 64, 72, 50, 116)
    return s.render(reverb=0.32, size=3.2, bright=0.6)

def plenty():
    """일곱 해 풍년 · 거두는 노래 (창 41:47). G major, 104 bpm, 24 bars"""
    s = Song('j_plenty', 104, 24, seed=24)
    s.inst('flute', FLUTE, vol=96, pan=0.0); s.inst('oboe', OBOE, vol=88, pan=0.2); s.inst('dulc', DULC, vol=80, pan=-0.25); s.inst('harp', HARP, vol=86, pan=-0.3)
    s.inst('pizz', PIZZ, vol=88, pan=0.25); s.inst('pad', STR_SLOW, vol=70, pan=0.1); s.inst('kit', 0, drum=True, vol=92)
    A, B, C = 'G:4 C:4 G:4 D:4 G:4 C:4 D:4 G:4', 'Em:4 C:4 G:4 D:4 Em:4 C:4 D:4 D:4', 'C:4 D:4 Bm:4 Em:4 C:4 D:4 G:8'
    prog = ' '.join([A, B, C]); assert plen(prog) == 96
    s.arp('harp', 0, prog, [0, 2, 1, 3, 2, 4, 3, 2], step=0.5, lo=50, hi=78, vel=0.32, leg=1.6)
    s.bassline('pizz', 0, prog, '1 5 8 5', vel=0.42, oct=2, leg=0.55); s.pad('pad', 0, prog, lo=55, hi=71, vel=0.2)
    s.drums(0, 24, {CONGA_L: 'x.....x.x.......', BONGO_H: '..o.o.....o.o.o.', TAMB: 'o.go.go.o.go.go.', CLAP: '....x.......x...'}, vel=0.4)
    M(s, 'flute', 0, 'G5:0.5 A5:0.5 B5:1 D6:1 B5:1 | C6:1 E6:1 C6:1 G5:1 | B5:1 A5:0.5 G5:0.5 D5:2 | F#5:1 A5:1 D6:2 | G5:0.5 A5:0.5 B5:1 D6:1 G6:1 | E6:1 D6:0.5 C6:0.5 G5:2 | A5:1 B5:1 C6:1 A5:1 | G5:3 r:1', 32, vel=0.56)
    s.vib('flute', 0, 32, cents=8)
    melB = 'E5:1 G5:1 B5:2 | C6:1 B5:0.5 A5:0.5 G5:2 | B5:1 D6:1 B5:1 G5:1 | A5:2 F#5:2 | G5:1 B5:1 E6:2 | E6:1 D6:1 C6:1 G5:1 | F#5:1 A5:1 D6:2 | C6:1 A5:1 F#5:2'
    M(s, 'oboe', 32, melB, 32, vel=0.56); M(s, 'dulc', 32, melB, 32, vel=0.3, shift=-12); s.vib('oboe', 32, 64, cents=10)
    M(s, 'flute', 64, 'E6:1 C6:1 G5:2 | F#5:1 A5:1 D6:2 | D6:1 B5:1 F#5:2 | G5:1 B5:1 E6:2 | E6:1.5 D6:0.5 C6:1 E6:1 | D6:1 C6:1 B5:1 A5:1 | G5:8', 32, vel=0.58)
    M(s, 'oboe', 64, 'C5:4 | D5:4 | D5:4 | E5:4 | C5:4 | F#5:4 | G5:8', 32, vel=0.34)
    return s.render(reverb=0.28, size=2.6, bright=0.62)

def famine():
    """일곱 해 흉년 · 마른 바람 (창 41:54). E minor, 54 bpm, 16 bars"""
    s = Song('j_famine', 54, 16, seed=25)
    s.inst('eh', EHORN, vol=100, pan=0.0); s.inst('bow', BOWED, vol=74, pan=-0.1); s.inst('pad', STR_SLOW, vol=70, pan=0.15); s.inst('bass', CBASS, vol=84, pan=0.1)
    s.inst('timp', TIMP, vol=80); s.inst('harp', HARP, vol=70, pan=-0.3)
    prog = 'Em:8 C:8 Am:8 B:8 Em:8 C:8 Am:4 B:4 Em:8'; assert plen(prog) == 64
    s.pad('bow', 0, prog, lo=40, hi=59, vel=0.26); s.pad('pad', 0, prog, lo=52, hi=67, vel=0.2); s.bassline('bass', 0, prog, '1', vel=0.32, oct=1)
    s.swell('bow', 0, 16, 40, 100); s.swell('pad', 24, 40, 60, 110)
    for b in range(0, 64, 4): s.note('timp', b, 40 if b % 8 == 0 else 35, 0.22, 1)
    s.arp('harp', 32, 'Em:8 C:8 Am:4 B:4 Em:8', [0, -1, -1, -1, 2, -1, -1, -1], step=0.5, lo=52, hi=76, vel=0.2, leg=4)
    M(s, 'eh', 0, 'r:2 B4:2 E5:2 D5:1 B4:1 | C5:3 B4:1 G4:4 | A4:2 C5:2 E5:3 D5:1 | D#5:4 r:4 | r:2 G5:2 F#5:1 E5:1 B4:2 | E5:2 D5:1 C5:1 G4:4 | A4:2 C5:1 B4:1 | F#4:2 D#4:2 | E4:8', 64, vel=0.56)
    s.vib('eh', 0, 64, cents=14, rate=4.6, delay=0.6)
    return s.render(reverb=0.44, size=4.0, bright=0.35)

def finale():
    """꿈이 이루어지다 · 형들의 절 (창 42:6–9). D minor → D major, 64 bpm, 32 bars"""
    s = Song('j_finale', 64, 32, seed=26)
    s.inst('cello', CELLO, vol=100, pan=0.2); s.inst('vln', VIOLIN, vol=92, pan=-0.2); s.inst('pad', STR_SLOW, vol=84, pan=0.05); s.inst('harp', HARP, vol=90, pan=-0.3)
    s.inst('choir', CHOIR, vol=80); s.inst('flute', FLUTE, vol=92, pan=0.05); s.inst('oboe', OBOE, vol=92, pan=0.15); s.inst('horn', HORNS, vol=80, pan=0.3); s.inst('bass', CBASS, vol=86, pan=0.1)
    s.inst('timp', TIMP, vol=88)
    A = 'Dm:4 Bb:4 F:4 C:4 Dm:4 Bbmaj7:4 Gm6:4 Asus4:2 A:2'; B = 'F:4 C/E:4 Dm:4 Bb:4 F/A:4 Gm7:4 Bb:4 A:4'
    D = 'D:4 G:4 D:4 A:4 D:4 Bm:4 G:4 A:4'; E = 'G:4 A:4 Bm:4 G:4 D/F#:4 Em7:4 A:4 D:4'
    prog = ' '.join([A, B, D, E]); assert plen(prog) == 128
    s.arp('harp', 0, prog, [0, 1, 2, 3, 4, 3, 2, 1], step=0.5, lo=50, hi=77, vel=0.32, leg=2.2)
    s.pad('pad', 0, prog, lo=52, hi=71, vel=0.28); s.bassline('bass', 0, prog, '1', vel=0.36, oct=1)
    s.swell('pad', 0, 8, 40, 96); s.swell('pad', 56, 64, 96, 124); s.swell('pad', 120, 128, 120, 70)
    melA = 'A4:1.5 D5:0.5 F5:1.5 E5:0.5 | D5:1 C5:1 D5:2 | C5:1.5 A4:0.5 F4:1 G4:1 | A4:1 G4:1 E4:2 | A4:1.5 D5:0.5 F5:1.5 G5:0.5 | A5:1.5 G5:0.5 F5:1 D5:1 | E5:1 D5:0.5 C5:0.5 Bb4:1 G4:1 | A4:3 r:1'
    M(s, 'cello', 0, melA, 32, vel=0.6, shift=-12); s.vib('cello', 0, 32, cents=14)
    melB = 'F5:1.5 G5:0.5 A5:2 | G5:1.5 F5:0.5 E5:1 C5:1 | D5:1 E5:1 F5:1 A5:1 | Bb5:2 A5:1 G5:1 | A5:1.5 G5:0.5 F5:1 C5:1 | D5:1 F5:1 G5:1.5 F5:0.5 | F5:2 D5:1 Bb4:1 | C#5:2 E5:2'
    M(s, 'vln', 32, melB, 32, vel=0.58); s.vib('vln', 32, 128, cents=16, rate=5.6); M(s, 'cello', 32, 'F3:4 | E3:4 | D3:4 | Bb2:4 | A2:4 | G2:4 | Bb2:4 | A2:4', 32, vel=0.4)
    for i in range(16): s.note('timp', 60 + i * 0.25, 33, 0.2 + i * 0.03, 0.25)
    melD = 'A4:1.5 D5:0.5 F#5:1.5 E5:0.5 | D5:1 B4:1 D5:2 | A4:1.5 F#4:0.5 A4:1 D5:1 | E5:1 C#5:1 A4:2 | A4:1.5 D5:0.5 F#5:1.5 G5:0.5 | F#5:1.5 E5:0.5 D5:1 B4:1 | B4:1 D5:1 G5:1 B5:1 | A5:3 r:1'
    M(s, 'vln', 64, melD, 32, vel=0.6, shift=12); M(s, 'flute', 64, melD, 32, vel=0.46); M(s, 'oboe', 64, melD, 32, vel=0.36)
    s.pad('choir', 64, D, lo=55, hi=74, vel=0.34); s.swell('choir', 64, 72, 40, 116); M(s, 'horn', 64, 'D4:4 | D4:4 | D4:4 | C#4:4 | D4:4 | D4:4 | D4:4 | C#4:4', 32, vel=0.4)
    s.note('timp', 64, 38, 0.7, 2)
    melE = 'D5:2 B4:1 D5:1 | E5:2 C#5:2 | F#5:2 D5:1 B4:1 | G5:4 | F#5:1 E5:1 D5:1 A4:1 | G4:2 B4:2 | A4:2 C#5:1 E5:1 | D5:4'
    M(s, 'oboe', 96, melE, 32, vel=0.54); M(s, 'cello', 96, melE, 32, vel=0.42, shift=-12); s.vib('oboe', 96, 128, cents=12)
    s.pad('choir', 96, E, lo=55, hi=72, vel=0.24); s.swell('choir', 96, 128, 100, 40)
    return s.render(reverb=0.4, size=3.8, bright=0.48)

TRACKS = {'j_theme': theme, 'j_canaan': canaan, 'j_dread': dread, 'j_pit': pit, 'j_mourn': mourn, 'j_caravan': caravan, 'j_egypt': egypt, 'j_house': house,
          'j_night': night, 'j_prison': prison, 'j_hope': hope, 'j_dream': dream, 'j_court': court, 'j_triumph': triumph, 'j_plenty': plenty, 'j_famine': famine, 'j_finale': finale}
if __name__ == '__main__':
    import json
    names = sys.argv[1:] or list(TRACKS)
    res = {}
    for n in names: res[n] = TRACKS[n]()
    with open('/home/claude/music/out/index.json', 'w') as f: json.dump(res, f, indent=1)
