# 요셉 편 배경음악 도구

1. 준비 (한 번)
   ```sh
   mkdir -p /home/claude/music && cd /home/claude/music
   cp <이 폴더>/*.py <이 폴더>/render.c .
   git clone --depth 1 https://github.com/mrbumpy409/GeneralUser-GS gugs      # 사운드폰트 GeneralUser-GS.sf2
   git clone --depth 1 https://github.com/schellingb/TinySoundFont tsf        # tsf.h
   gcc -O2 -o render render.c -lm
   ```
   파이썬: numpy, scipy (PyPI가 막혀 있으면 기본 설치본 사용). mp3 인코딩: ffmpeg(libmp3lame).
2. 렌더: `python3 tracks.py` (전체) 또는 `python3 tracks.py j_pit j_dream` → `out/<이름>.mp3`, `out/index.json`(loop 길이).
3. 게임에 넣기: `out/j_*.mp3`를 게임 폴더 `music/`에 복사. 곡 길이(loop)가 바뀌면 `ep_sources/joseph/f_runtime.js`의 `TRK` 표도 고칩니다.
4. 확인: `python3 viz.py j_pit 0 60` → `out/j_pit.png` (스펙트로그램).

DSL 요약 (`comp.py`): `Song(name, bpm, bars)` → `inst(이름, GM 번호)` → `mel/pad/arp/bassline/drums/swell/vib` → `render(reverb, size, bright)`.
한 곡 = 한 사이클(loop초) + 잔향 꼬리 5초. 게임은 loop초마다 다음 사이클을 겹쳐 시작해 끊김 없이 반복합니다.
