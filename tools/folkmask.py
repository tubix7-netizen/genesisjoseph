#!/usr/bin/env python3
"""요셉 GLB 에셋 → 마을 사람(NPC)용 '다시 칠하기' 마스크와 가벼운 LOD 메시.

사용법:
  python3 tools/folkmask.py assets/heroes joseph [--res 512] [--debug 폴더]

요셉 모델 하나를 모든 NPC가 함께 쓰되, 사람마다 피부·머리카락·겉옷·속옷·가죽 색을 셰이더에서 바꿔 칠한다
(js/folk.js). 이 도구는 그 '어디가 무엇인지'를 텍스처 공간에서 미리 계산한다.

  1. 삼각형을 UV 공간에 래스터화해서 텍셀마다 3D 위치(게임 좌표, m)와 뼈를 구한다.
  2. 텍스처 색 + 위치로 부위를 나눈다.
       folk_mask.png (RGB 세 층을 세로로 쌓음)
         층 0: R 피부 · G 머리카락 · B 겉옷(줄무늬 코트)
         층 1: R 밝은 천(속옷, 바지) · G 가죽(허리띠, 샌들, 주머니, 정강이 감개) · B 수염 자리(턱·윗입술)
         층 2: R 입술(1)과 볼(0.45)
     눈·눈썹은 어느 마스크에도 들어가지 않아 그대로 남는다.
  3. 부위별 기준 색(텍스처 안의 평균)을 folk.json에 쓴다. 셰이더는 '텍셀 색 / 기준 색 × 새 색'으로 명암과 짜임을 지킨다.
  4. <이름>_lo, <이름>_lo2 .{bin,json}: 위치+UV 격자로 정점을 합친 가벼운 메시 (중간 거리·그림자용과 먼 거리용, 텍스처는 같이 쓴다).

필요한 것: numpy, macOS sips (JPEG 읽기).
"""
import json, os, sys, struct, zlib, subprocess, argparse, tempfile
import numpy as np

GI = {n: i for i, n in enumerate(['pelvis', 'chest', 'head', 'uArmL', 'fArmL', 'uArmR', 'fArmR', 'thighL', 'shinL', 'thighR',
                                   'shinR', 'handL', 'handR', 'back', 'cape', 'eyes', 'mouth', 'footL', 'footR'])}


def load_asset(d, name):
    m = json.load(open(os.path.join(d, name + '.json'))); nv, nt = m['verts'], m['tris']
    b = open(os.path.join(d, name + '.bin'), 'rb').read(); o = 0

    def take(dt, n):
        nonlocal o; a = np.frombuffer(b, dtype=dt, count=n, offset=o); o += n * np.dtype(dt).itemsize; return a
    P = take(np.float32, nv * 3).reshape(-1, 3); N = take(np.float32, nv * 3).reshape(-1, 3); UV = take(np.float32, nv * 2).reshape(-1, 2)
    code = take(np.float32, nv); soft = take(np.float32, nv); I = take(np.uint16, nt * 3).reshape(-1, 3).astype(np.int64)
    return m, P, N, UV, code, soft, I


def read_jpg(path):
    tmp = tempfile.mktemp(suffix='.bmp')
    subprocess.run(['sips', '-s', 'format', 'bmp', path, '--out', tmp], check=True, capture_output=True)
    b = open(tmp, 'rb').read(); os.remove(tmp)
    off = struct.unpack('<I', b[10:14])[0]; w, h = struct.unpack('<ii', b[18:26]); bpp = struct.unpack('<H', b[28:30])[0]
    st = ((w * bpp // 8) + 3) // 4 * 4; px = bpp // 8
    a = np.frombuffer(b, dtype=np.uint8, count=st * abs(h), offset=off).reshape(abs(h), st)[:, :w * px].reshape(abs(h), w, px)
    if h > 0: a = a[::-1]
    return a[:, :, [2, 1, 0]].astype(np.float32) / 255.0   # BGR → RGB, 위가 0행


def write_png(path, rgba):
    h, w, c = rgba.shape; raw = b''.join(b'\x00' + rgba[y].tobytes() for y in range(h))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) +
                           chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def raster(P, UV, code, I, res):
    """텍셀마다 3D 위치와 첫 번째 뼈 (덮이지 않은 텍셀은 뼈 -1)."""
    pos = np.zeros((res, res, 3), np.float32); bone = -np.ones((res, res), np.int32)
    b0 = (code % 32).astype(np.int32)
    for t in I:
        uv = UV[t] * res - 0.5; x0, y0 = np.floor(uv.min(0)).astype(int); x1, y1 = np.ceil(uv.max(0)).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, res - 1), min(y1, res - 1)
        if x1 < x0 or y1 < y0: continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        a, b, c = uv; d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-12: continue
        l0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / d
        l1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / d; l2 = 1 - l0 - l1
        inside = (l0 >= -0.02) & (l1 >= -0.02) & (l2 >= -0.02)
        if not inside.any(): continue
        p = l0[..., None] * P[t[0]] + l1[..., None] * P[t[1]] + l2[..., None] * P[t[2]]
        k = np.argmax(np.stack([l0, l1, l2]), 0); bb = b0[t][k]
        pos[ys[inside], xs[inside]] = p[inside]; bone[ys[inside], xs[inside]] = bb[inside]
    return pos, bone


def hsv(c):
    mx = c.max(-1); mn = c.min(-1); d = mx - mn + 1e-6; r, g, b = c[..., 0], c[..., 1], c[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, np.where(mx > 0, d / (mx + 1e-6), 0), mx


def dilate(m, cov, n=6):
    """덮이지 않은 텍셀(UV 섬 사이 틈)을 이웃 값으로 채워서, 밉맵과 선형 보간에서 경계가 번지지 않게 한다."""
    m = m.copy(); have = cov.copy()
    for _ in range(n):
        acc = np.zeros_like(m); cnt = np.zeros(have.shape, np.float32)
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            sh = np.roll(np.roll(m, dy, 0), dx, 1); hv = np.roll(np.roll(have, dy, 0), dx, 1)
            acc += sh * hv[..., None]; cnt += hv
        new = (~have) & (cnt > 0); m[new] = acc[new] / cnt[new][:, None]; have = have | new
    return m


def blur(m, cov):
    k = np.zeros_like(m); w = np.zeros(cov.shape, np.float32)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            c = np.roll(np.roll(cov, dy, 0), dx, 1).astype(np.float32); k += np.roll(np.roll(m, dy, 0), dx, 1) * c[..., None]; w += c
    out = m.copy(); ok = cov & (w > 0); out[ok] = k[ok] / w[ok][:, None]; return out


def lod(P, N, UV, code, soft, I, cell=0.034, ucell=1 / 48, hcell=0.014, hucell=1 / 200):
    """위치(cell m)와 UV(ucell) 격자가 같은 정점들을 하나로 합친다. UV가 다르면 합치지 않으니 텍스처 이음매는 그대로다."""
    hd = np.isin(code % 32, [GI['head'], GI['eyes'], GI['mouth']])[:, None]   # 얼굴은 거의 줄이지 않는다 (UV 평균이 머리카락 텍셀을 끌어와 얼굴이 얼룩졌다)
    cs = np.where(hd, hcell, cell); us = np.where(hd, hucell, ucell)
    key = np.c_[np.floor(P / cs), np.floor(UV / us), code % 32].astype(np.int64)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True); inv = inv.reshape(-1); n = cnt.size
    def avg(a):
        s = np.zeros((n, a.shape[1])); np.add.at(s, inv, a); return s / cnt[:, None]
    P2 = avg(P.astype(np.float64)); UV2 = avg(UV.astype(np.float64)); N2 = avg(N.astype(np.float64))
    N2 /= np.maximum(np.linalg.norm(N2, axis=1, keepdims=True), 1e-9)
    d = np.linalg.norm(P - P2[inv], axis=1); rep = np.full(n, -1)   # 대표 정점: 평균에 가장 가까운 원래 정점 (뼈 가중치를 빌린다)
    order = np.argsort(d)
    for i in order:
        c = inv[i]
        if rep[c] < 0: rep[c] = i
    I2 = inv[I]; ok = (I2[:, 0] != I2[:, 1]) & (I2[:, 1] != I2[:, 2]) & (I2[:, 0] != I2[:, 2]); I2 = I2[ok]
    _, first = np.unique(np.sort(I2, 1), axis=0, return_index=True); I2 = I2[np.sort(first)]   # 겹친 삼각형은 하나만
    return P2.astype(np.float32), N2.astype(np.float32), UV2.astype(np.float32), code[rep], soft[rep], I2


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('dir'); ap.add_argument('name'); ap.add_argument('--res', type=int, default=512)
    ap.add_argument('--debug', default=None); a = ap.parse_args()
    m, P, N, UV, code, soft, I = load_asset(a.dir, a.name); R = a.res
    tex = read_jpg(os.path.join(a.dir, m['tex'])); T = tex.shape[0]
    pos, bone = raster(P, UV, code, I, R); cov = bone >= 0
    # 텍스처 색 (마스크 해상도로 평균)
    f = T // R; col = tex[:R * f, :R * f].reshape(R, f, R, f, 3).mean((1, 3))
    h, s, v = hsv(col); L = col @ np.array([0.3, 0.59, 0.11])
    x, y, z = pos[..., 0], pos[..., 1], pos[..., 2]
    head = cov & np.isin(bone, [GI['head'], GI['eyes'], GI['mouth']])
    # 얼굴 특징 (눈·눈썹·입): 요셉 정면에서 잰 자리. 여기는 피부/머리 칠하기에서 뺀다
    ex, eyY, mY = 0.049, 1.634, 1.565
    eyeD = ((np.abs(x) - ex) / 0.034) ** 2 + ((y - (eyY + 0.006)) / 0.03) ** 2
    front = z > 0.03
    feature = head & front & (eyeD < 1.0)
    peach = (h > 5) & (h < 40) & (s > 0.15) & (s < 0.62) & (v > 0.55)
    dark = (v < 0.42) | ((L < 0.36) & (s < 0.55))
    hand = np.isin(bone, [GI['handL'], GI['handR']]); foot = np.isin(bone, [GI['footL'], GI['footR']])
    # v25: 눈가의 피부도 피부다 (빼 두었더니 피부가 어두운 사람은 눈 주변만 요셉의 밝은 살색으로 남아 하얗게 떠 보였다).
    # 눈 자리 안에서는 확실한 살구색만 (흰자·눈동자·속눈썹·눈썹은 그대로 남는다)
    eyeOpen = ((np.abs(x) - 0.047) / 0.025) ** 2 + ((y - 1.6325) / 0.0155) ** 2 < 1.0   # 뜬 눈 (흰자·눈동자): 그대로 둔다
    lidLight = feature & ~eyeOpen & (L > 0.5)   # 눈 바깥의 밝게 칠해진 눈꺼풀·눈밑 (요셉 그림은 거의 흰색이라 사람 피부색으로 바꿔야 한다)
    skin = cov & (peach | lidLight) & (~feature | lidLight | ((s > 0.2) & (v > 0.62))) & (head | hand | foot | ((y > 1.36) & (np.abs(x) < 0.1)))   # 소매 끝 무늬의 살구색은 피부가 아니다
    hair = head & ~feature & ~peach & (dark | ((v < 0.55) & (h < 45)))
    body = cov & ~head
    cream = body & (s < 0.24) & (v > 0.6)
    leather = body & ~skin & (h > 12) & (h < 45) & (s > 0.28) & (v < 0.62) & (v > 0.12) & ~cream
    # 가죽은 허리띠 높이, 발, 주머니 (손목 아래 엉덩이 옆)에서만
    leather &= (foot | (y < 0.36) | ((y > 0.9) & (y < 1.12)) | ((np.abs(x) > 0.12) & (y > 0.75) & (y < 1.1)))
    leather |= body & (y < 0.36) & ~cream & ~skin & (v < 0.7) & (s > 0.2) & (h > 8) & (h < 50)   # 정강이 감개
    coat = body & ~skin & ~cream & ~leather
    cloth = cream
    M1 = np.stack([skin, hair, coat], -1).astype(np.float32)
    # 얼굴 그림 (부드러운 가중치)
    beard = head & front & ~feature & (((y < mY + 0.022) & (y > mY - 0.09)) | ((y < mY + 0.05) & (np.abs(x) > 0.045) & (z < 0.07) & (y > mY - 0.07)))
    beardW = beard * np.clip(1 - np.maximum(0, np.abs(y - (mY - 0.03)) - 0.035) / 0.02, 0, 1) * peach
    lipD = (x / 0.024) ** 2 + ((y - mY) / 0.009) ** 2; lips = (head & front) * np.clip(1.2 - lipD, 0, 1)
    chD = ((np.abs(x) - 0.05) / 0.028) ** 2 + ((y - 1.592) / 0.02) ** 2; cheek = (head & front) * np.clip(1 - chD, 0, 1) * peach
    rosy = np.maximum(lips * peach, cheek * 0.45)
    M2 = np.stack([cloth, leather, beardW], -1).astype(np.float32); M3 = np.stack([rosy, np.zeros_like(rosy), np.zeros_like(rosy)], -1).astype(np.float32)
    M1, M2, M3 = (blur(dilate(m_, cov), np.ones_like(cov)) for m_ in (M1, M2, M3))
    out = a.dir
    # 알파 없는 RGB 세 층을 세로로 쌓은 한 장 (브라우저가 알파를 미리 곱하면서 RGB를 잃는 일이 없게). js/folk.js가 텍스처 배열로 올린다.
    stack = np.concatenate([M1, M2, M3], 0)
    write_png(os.path.join(out, 'folk_mask.png'), np.dstack([(np.clip(stack, 0, 1) * 255 + 0.5).astype(np.uint8), np.full(stack.shape[:2], 255, np.uint8)]))
    def ref(msk):
        c = col[msk]; return [round(float(v), 4) for v in c.mean(0)] + [round(float((c @ np.array([0.3, 0.59, 0.11])).mean()), 4)]
    meta = {'base': a.name, 'mask': 'folk_mask.png', 'layers': 3, 'lo': a.name + '_lo', 'lo2': a.name + '_lo2',
            'ref': {'skin': ref(skin), 'hair': ref(hair), 'coat': ref(coat), 'cloth': ref(cloth), 'leather': ref(leather)},
            'cover': {k: round(float(v.sum() / cov.sum()), 3) for k, v in dict(skin=skin, hair=hair, coat=coat, cloth=cloth, leather=leather).items()}}
    # 피부만의 얼굴 윤곽 (v24): 높이 1 cm × 방향 7.5°마다 머리 축에서 가장 먼 '피부' 텍셀. 수염이 옆머리 위가 아니라 턱과 볼에 붙게 한다.
    ZC, NA, Y0, NY = -0.012, 48, 1.40, 31
    sp = np.zeros((NY, NA)); sk3 = pos[skin & head]
    rr = np.hypot(sk3[:, 0], sk3[:, 2] - ZC); jj = np.round((sk3[:, 1] - Y0) / 0.01).astype(int); kk = (np.round(np.arctan2(sk3[:, 0], sk3[:, 2] - ZC) / (2 * np.pi) * NA).astype(int) + NA) % NA
    ok = (jj >= 0) & (jj < NY); np.maximum.at(sp, (jj[ok], kk[ok]), rr[ok])
    meta['skinProf'] = {'y0': Y0, 'dy': 0.01, 'na': NA, 'zc': ZC, 'r': [[round(float(v), 4) for v in row] for row in sp]}
    json.dump(meta, open(os.path.join(out, 'folk.json'), 'w'), indent=1)
    print('folk masks', meta['cover'], meta['ref'])
    # LOD: _lo (중간 거리, 그림자), _lo2 (먼 거리)
    for suf, cell, ucell, hcell, hucell in (('_lo', 0.034, 1 / 48, 0.014, 1 / 200), ('_lo2', 0.1, 1 / 14, 0.034, 1 / 90)):
        P2, N2, UV2, c2, s2, I2 = lod(P, N, UV, code, soft, I, cell, ucell, hcell, hucell)
        blob = b''.join([P2.tobytes(), N2.tobytes(), UV2.tobytes(), c2.astype(np.float32).tobytes(), s2.astype(np.float32).tobytes(), I2.astype(np.uint16).tobytes()])
        open(os.path.join(out, a.name + suf + '.bin'), 'wb').write(blob)
        ml = dict(m); ml.update(name=a.name + suf, verts=int(len(P2)), tris=int(len(I2)), tex=m['tex'])
        json.dump(ml, open(os.path.join(out, a.name + suf + '.json'), 'w'), ensure_ascii=False, indent=1)
        print(f'lod {suf}: verts {len(P)} → {len(P2)}, tris {len(I)} → {len(I2)}, {len(blob) // 1024} KB')
    if a.debug:
        os.makedirs(a.debug, exist_ok=True)
        cl = np.zeros((R, R, 3)); cl[skin] = [1, 0.7, 0.55]; cl[hair] = [0.3, 0.15, 0.05]; cl[coat] = [0.2, 0.4, 1]; cl[cloth] = [1, 1, 0.8]; cl[leather] = [0.6, 0.35, 0.1]; cl[feature] = [1, 0, 1]
        cl[~cov] = [0, 0.3, 0]
        write_png(os.path.join(a.debug, 'classes.png'), np.dstack([(cl * 255).astype(np.uint8), np.full((R, R), 255, np.uint8)]))
        write_png(os.path.join(a.debug, 'tex.png'), np.dstack([(col * 255).astype(np.uint8), np.full((R, R), 255, np.uint8)]))



if __name__ == '__main__':
    main()
