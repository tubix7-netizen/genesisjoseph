#!/usr/bin/env python3
"""GLB (Meshy / Higgsfield 리깅 캐릭터) → 약속의 길 엔진용 캐릭터 에셋.

사용법:
  python3 tools/glb2hero.py <입력.glb> <출력 폴더> <이름> [--height 1.0] [--tex 1024]

하는 일
  1. A-포즈로 벌어진 팔을 게임의 기본 자세(팔을 아래로 늘어뜨린 자세)로 내린다 (GLB 뼈대로 CPU 스키닝).
  2. 몸을 세로로 늘이거나 줄여서 발목·무릎·엉덩이·어깨 높이를 게임 뼈대(models.js HB)에 맞춘다.
     걷기·발 IK·물매 같은 기존 절차적 동작이 그대로 맞게 움직이도록 하기 위해서다. 머리 크기는 그대로 둔다.
  3. GLB 뼈 24개를 게임 뼈 19개에 연결하고, 정점마다 영향이 가장 큰 뼈 2개만 남긴다 (엔진 셰이더 제한).
  4. <이름>.bin (정점·인덱스), <이름>.json (뼈 위치와 메타 정보), <이름>.jpg (텍스처)를 쓴다.

필요한 것: numpy, macOS sips (텍스처 크기 조절).
"""
import json, struct, sys, os, subprocess, argparse
import numpy as np

# 게임 뼈 순서 (js/models.js HB와 같아야 한다): name, parent
GAME = [('pelvis', -1), ('chest', 0), ('head', 1), ('uArmL', 1), ('fArmL', 3), ('uArmR', 1), ('fArmR', 5),
        ('thighL', 0), ('shinL', 7), ('thighR', 0), ('shinR', 9), ('handL', 4), ('handR', 6), ('back', 1), ('cape', 1),
        ('eyes', 2), ('mouth', 2), ('footL', 8), ('footR', 10)]
GI = {n: i for i, (n, _) in enumerate(GAME)}
# Meshy/Mixamo 계열 뼈 이름 → 게임 뼈
MAP = {'Hips': 'pelvis', 'Spine02': 'chest', 'Spine01': 'chest', 'Spine': 'chest', 'neck': 'head', 'Head': 'head',
       'head_end': 'head', 'headfront': 'head', 'LeftShoulder': 'chest', 'RightShoulder': 'chest',
       'LeftArm': 'uArmL', 'LeftForeArm': 'fArmL', 'LeftHand': 'handL', 'RightArm': 'uArmR', 'RightForeArm': 'fArmR',
       'RightHand': 'handR', 'LeftUpLeg': 'thighL', 'LeftLeg': 'shinL', 'LeftFoot': 'footL', 'LeftToeBase': 'footL',
       'RightUpLeg': 'thighR', 'RightLeg': 'shinR', 'RightFoot': 'footR', 'RightToeBase': 'footR'}
# 게임 뼈대 기준 높이 (models.js HB): 발목, 무릎, 엉덩이(허벅지 뿌리), 어깨
HB_ANKLE, HB_KNEE, HB_HIP, HB_SHOULDER = 0.072, 0.5, 0.93, 1.41


def load_glb(path):
    b = open(path, 'rb').read()
    ln = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + ln])
    b0 = 20 + ln + 8

    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
        n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}[a['type']]
        dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32, 5121: np.uint8}[a['componentType']]
        o = b0 + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        st = bv.get('byteStride')
        if st and st != n * np.dtype(dt).itemsize:
            raise SystemExit('interleaved buffers are not supported')
        arr = np.frombuffer(b, dtype=dt, count=a['count'] * n, offset=o).reshape(a['count'], n)
        if a.get('normalized') and dt != np.float32:
            arr = arr / float(np.iinfo(dt).max)
        return arr

    def image(i):
        im = j['images'][i]; bv = j['bufferViews'][im['bufferView']]
        o = b0 + bv.get('byteOffset', 0)
        return b[o:o + bv['byteLength']], im.get('mimeType', 'image/jpeg')
    return j, acc, image


def rot_between(a, b):
    """회전 행렬: 단위벡터 a를 b로 돌리는 가장 작은 회전."""
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    v = np.cross(a, b); c = float(np.dot(a, b)); s = np.linalg.norm(v)
    if s < 1e-8:
        return np.eye(3)
    k = v / s; K = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + np.sin(np.arccos(np.clip(c, -1, 1))) * K + (1 - c) * K @ K


def about(R, p):
    """점 p를 중심으로 R만큼 도는 4x4 행렬."""
    M = np.eye(4); M[:3, :3] = R; M[:3, 3] = p - R @ p
    return M


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('glb'); ap.add_argument('out'); ap.add_argument('name')
    ap.add_argument('--tex', type=int, default=1024, help='텍스처 한 변 크기 (px)')
    ap.add_argument('--arm-out', type=float, default=9.0, help='팔을 내린 뒤 몸에서 벌어지는 각도 (도)')
    ap.add_argument('--leg-gap', type=float, default=0.004, help='발목이 엉덩이 관절보다 바깥에 놓이는 거리 (m)')
    ap.add_argument('--toe-out', type=float, default=3.0, help='발끝이 바깥으로 벌어지는 각도 (도)')
    ap.add_argument('--eyes', default=None, help='눈 자리 cx,cy[,rx,ry] (m): 두 눈 중심의 |x|와 높이')
    ap.add_argument('--mouth', default=None, help='입 자리 cy[,rx,ry] (m)')
    ap.add_argument('--hem-free', type=float, default=1.0, help='겉옷 자락을 다리에서 떼어 골반에 나눠 주는 정도 (0 = Meshy 그대로)')
    a = ap.parse_args()

    j, acc, image = load_glb(a.glb)
    prim = j['meshes'][0]['primitives'][0]; at = prim['attributes']
    P = acc(at['POSITION']).astype(np.float64); N = acc(at['NORMAL']).astype(np.float64)
    UV = acc(at['TEXCOORD_0']).astype(np.float32)
    J = acc(at['JOINTS_0']).astype(np.int32); W = acc(at['WEIGHTS_0']).astype(np.float64)
    IDX = acc(prim['indices']).reshape(-1).astype(np.uint32)
    skin = j['skins'][0]; names = [j['nodes'][i].get('name') for i in skin['joints']]
    IBM = acc(skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1).astype(np.float64)  # column-major → 행렬
    WB = np.linalg.inv(IBM)                      # 각 뼈의 바인드 자세 월드 행렬
    pos = {n: WB[k][:3, 3].copy() for k, n in enumerate(names)}
    for n in names:
        if n not in MAP:
            raise SystemExit(f'알 수 없는 뼈 이름: {n} (MAP에 추가하세요)')
    if pos['headfront'][2] < pos['Head'][2]:
        raise SystemExit('캐릭터가 +z를 보고 있지 않습니다 (지원하지 않는 방향)')

    # ---- 1. 팔 내리기 (A-포즈 → 게임 기본 자세)
    child = {}
    for k, n in enumerate(names):
        for ci in j['nodes'][skin['joints'][k]].get('children', []):
            if ci in skin['joints']:
                child.setdefault(n, []).append(names[skin['joints'].index(ci)])

    def desc(n):
        out = [n]
        for c in child.get(n, []):
            out += desc(c)
        return out
    S = np.array([np.eye(4) for _ in names])   # 스키닝 행렬 (자세 월드 · 역바인드)
    ang = np.radians(a.arm_out)
    for side, sx in (('Left', 1), ('Right', -1)):
        sh, el, wr = pos[side + 'Arm'], pos[side + 'ForeArm'], pos[side + 'Hand']
        down = np.array([sx * np.sin(ang), -np.cos(ang), 0.0])
        M1 = about(rot_between(el - sh, down), sh)
        el2 = (M1 @ np.append(el, 1))[:3]; wr2 = (M1 @ np.append(wr, 1))[:3]
        down2 = np.array([sx * np.sin(ang * 0.6), -np.cos(ang * 0.6), 0.0])
        M2 = about(rot_between(wr2 - el2, down2), el2)
        for n in desc(side + 'Arm'):
            k = names.index(n); M = M1 if n == side + 'Arm' else M2 @ M1
            S[k] = M @ S[k]
            pos[n] = (M @ np.append(pos[n], 1))[:3]
    # ---- 1b. 다리 모으기 (v23): Meshy A-포즈는 발목이 엉덩이보다 바깥(약 7 cm)에 있고 발끝도 벌어져 있어서, 게임에서 걸으면
    # 팔자걸음처럼 보였다. 다리 전체를 엉덩이 관절을 중심으로 안쪽으로 돌려 발목을 엉덩이 바로 아래로 모으고,
    # 발은 발목을 중심으로 돌려 발끝이 거의 앞(--toe-out 도)을 보게 한다. 무릎 회전축이 다리 가운데 오도록 하는 효과도 있다.
    for side, sx in (('Left', 1), ('Right', -1)):
        hp, an = pos[side + 'UpLeg'].copy(), pos[side + 'Foot'].copy()
        tgt = np.array([sx * (abs(hp[0]) + a.leg_gap), an[1], an[2]])
        M1 = about(rot_between(an - hp, tgt - hp), hp)
        for n in desc(side + 'UpLeg'):
            k = names.index(n); S[k] = M1 @ S[k]; pos[n] = (M1 @ np.append(pos[n], 1))[:3]
        # 발끝 방향: 발바닥 정점(이 발에 붙은)의 뒤꿈치 → 발끝
        fk = [names.index(side + 'Foot'), names.index(side + 'ToeBase')]
        wf = sum(W[:, i] * np.isin(J[:, i], fk) for i in range(4))
        Ph0 = np.c_[P, np.ones(len(P))]
        Pf = np.einsum('ij,nj->ni', M1, Ph0)[:, :3]
        y0 = Pf[wf > 0.5, 1].min(); sole = (wf > 0.5) & (Pf[:, 1] < y0 + 0.03)   # 발바닥 (아래 3 cm)
        f = Pf[sole]; z0, z1 = f[:, 2].min(), f[:, 2].max()
        toe = f[f[:, 2] > z1 - 0.05].mean(0); heel = f[f[:, 2] < z0 + 0.04].mean(0)
        cur = np.degrees(np.arctan2((toe[0] - heel[0]) * sx, toe[2] - heel[2]))   # +: 바깥으로 벌어짐
        yaw = np.radians(-(cur - a.toe_out) * sx)
        c, s = np.cos(yaw), np.sin(yaw); Ry = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
        M2 = about(Ry, pos[side + 'Foot'])
        for n in desc(side + 'Foot'):
            k = names.index(n); S[k] = M2 @ S[k]; pos[n] = (M2 @ np.append(pos[n], 1))[:3]
        print(f'  {side}: 발목 x {an[0]:+.3f} → {pos[side + "Foot"][0]:+.3f}, 발끝 {cur:.1f}° → {a.toe_out:.1f}°')
    Ph = np.c_[P, np.ones(len(P))]
    P2 = np.zeros_like(P); N2 = np.zeros_like(N)
    for i in range(4):
        Mk = S[J[:, i]]
        P2 += W[:, i:i + 1] * np.einsum('nij,nj->ni', Mk, Ph)[:, :3]
        N2 += W[:, i:i + 1] * np.einsum('nij,nj->ni', Mk[:, :3, :3], N)
    P = P2; N = N2 / np.maximum(np.linalg.norm(N2, axis=1, keepdims=True), 1e-9)

    # ---- 2. 게임 뼈대 높이에 맞춰 세로로 늘이기 (높이에 대한 연속 함수라 이음매가 생기지 않는다)
    ank = (pos['LeftFoot'][1] + pos['RightFoot'][1]) / 2
    kne = (pos['LeftLeg'][1] + pos['RightLeg'][1]) / 2
    hip = (pos['LeftUpLeg'][1] + pos['RightUpLeg'][1]) / 2
    sho = (pos['LeftArm'][1] + pos['RightArm'][1]) / 2
    neck = pos['neck'][1]
    k_torso = (HB_SHOULDER - HB_HIP) / (sho - hip)
    xs = [0.0, ank, kne, hip, sho, neck]
    ys = [0.0, HB_ANKLE, HB_KNEE, HB_HIP, HB_SHOULDER, HB_SHOULDER + (neck - sho) * k_torso]

    def fy(y):
        y = np.asarray(y, dtype=np.float64)
        return np.where(y > neck, ys[-1] + (y - neck) * 1.0, np.interp(y, xs, ys))

    def farm(y):  # 팔은 어깨 기준으로 몸통과 같은 비율 (다리 쪽 늘이기를 받지 않게)
        return HB_SHOULDER + (np.asarray(y) - sho) * k_torso
    armW = np.zeros(len(P))
    for i in range(4):
        armW += W[:, i] * np.isin(np.array(names)[J[:, i]], [s + p for s in ('Left', 'Right') for p in ('Arm', 'ForeArm', 'Hand')])
    armW = np.clip(armW, 0, 1)
    Y0 = P[:, 1].copy()
    P[:, 1] = armW * farm(Y0) + (1 - armW) * fy(Y0)
    # 세로로 늘인 만큼 법선의 y 성분을 줄인다 (근사)
    eps = 1e-3
    sy = (armW * k_torso + (1 - armW) * (fy(Y0 + eps) - fy(Y0 - eps)) / (2 * eps))
    N[:, 1] /= np.maximum(sy, 1e-3)
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)

    def mapP(n, arm=False):
        p = pos[n].copy(); p[1] = float(farm(p[1]) if arm else fy(p[1])); return p

    # ---- 3. 게임 뼈 위치 (def)
    D = {}
    D['pelvis'] = mapP('Hips'); D['pelvis'][0] = 0
    D['chest'] = mapP('Spine02'); D['chest'][0] = 0
    D['head'] = mapP('neck'); D['head'][0] = 0
    for s, g in (('Left', 'L'), ('Right', 'R')):
        D['uArm' + g] = mapP(s + 'Arm', True); D['fArm' + g] = mapP(s + 'ForeArm', True); D['hand' + g] = mapP(s + 'Hand', True)
        D['thigh' + g] = mapP(s + 'UpLeg'); D['shin' + g] = mapP(s + 'Leg'); D['foot' + g] = mapP(s + 'Foot')
        D['shin' + g][2] = (D['thigh' + g][2] + D['foot' + g][2]) / 2   # 무릎 회전축은 다리 가운데에
    hd = mapP('Head')
    D['back'] = np.array([0, D['chest'][1] + 0.22, -0.17]); D['cape'] = np.array([0, HB_SHOULDER + 0.05, -0.09])
    D['eyes'] = hd + np.array([0, 0.09, 0.1]); D['mouth'] = hd + np.array([0, 0.03, 0.11])
    D['eyes'][0] = D['mouth'][0] = 0

    # ---- 4. 정점마다 게임 뼈 2개 (+ 가중치)
    gidx = np.array([GI[MAP[n]] for n in names])
    G = np.zeros((len(P), len(GAME)))
    for i in range(4):
        np.add.at(G, (np.arange(len(P)), gidx[J[:, i]]), W[:, i])
    # ---- 4b. 겉옷 자락 (v23): Meshy는 무릎 위 코트 자락을 허벅지·정강이에 통째로 붙여서, 쪼그려 앉거나 앉으면 자락이
    # 허벅지를 따라 앞으로 들려 풍선처럼 부풀었다. 다리 축에서 멀리 떨어진 바깥 층(코트)은 다리 가중치의 절반만 허벅지에 남기고
    # 나머지는 골반에 준다. 정강이(무릎 아래)로는 접히지 않게 한다. 바지처럼 다리에 붙은 정점은 그대로다.
    x_, y_, z_ = P.T
    for g_, s_ in (('L', 1), ('R', -1)):
        th, sh, ft = D['thigh' + g_], D['shin' + g_], D['foot' + g_]
        side = (x_ * s_) > 0
        t = np.clip((y_ - ft[1]) / (th[1] - ft[1]), 0, 1); ax = ft[0] + (th[0] - ft[0]) * t; az = ft[2] + (th[2] - ft[2]) * t
        dist = np.hypot(x_ - ax, z_ - az)
        outer = side & (y_ < th[1] + 0.02) & (y_ > 0.3)
        k = np.clip((dist - 0.1) / 0.05, 0, 1) * outer * a.hem_free
        ti, si, pi = GI['thigh' + g_], GI['shin' + g_], GI['pelvis']
        leg = G[:, ti] + G[:, si]
        G[:, pi] += leg * k * 0.5; G[:, ti] = G[:, ti] * (1 - k) + leg * k * 0.5; G[:, si] *= (1 - k)
    order = np.argsort(-G, axis=1)
    b0 = order[:, 0]; b1 = order[:, 1]
    w0 = G[np.arange(len(P)), b0]; w1 = G[np.arange(len(P)), b1]
    bw = np.where(w0 + w1 > 0, w1 / np.maximum(w0 + w1, 1e-9), 0)
    q = np.round(bw * 255).astype(np.int64)
    b1 = np.where(q == 0, b0, b1)
    code = (b0 + b1 * 32 + q * 1024).astype(np.float32)
    # 머리(얼굴·머리카락)는 엔진의 '얼굴' 셰이딩을 받는다 (aCol.a = 0.5: 부드럽고 고른 명암, 얇은 외곽선)
    soft = np.where(b0 == GI['head'], 0.5, 0.0).astype(np.float32)

    # 눈·입 자리 (게임 좌표, m): 깜빡임과 말할 때 입 움직임이 붙는 정점. 요셉은 앞에서 잰 값, 다른 캐릭터는 --eyes/--mouth로 준다
    # (tools/folkmask.py와 같은 방식으로 얼굴 정면도를 뽑아서 잰다).
    marks = None
    if a.eyes and a.mouth:
        e = [float(v) for v in a.eyes.split(',')]; mo = [float(v) for v in a.mouth.split(',')]
        marks = [('eyes', e[0], e[1], e[2] if len(e) > 2 else 0.04, e[3] if len(e) > 3 else 0.026), ('mouth', 0, mo[0], mo[1] if len(mo) > 1 else 0.042, mo[2] if len(mo) > 2 else 0.016)]
    elif a.name == 'joseph' and os.path.basename(a.glb) == 'joseph_3d.glb':
        marks = [('eyes', 0.049, 1.634, 0.041, 0.028), ('mouth', 0, 1.565, 0.044, 0.016)]
    if marks:
        x, y, z = P.T
        front = (b0 == GI['head']) & (z > 0.045)
        for name, cx, cy, rx, ry in marks:
            distance = ((np.abs(x) - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
            influence = np.clip((1.45 - distance) / 0.7, 0, 1)
            mask = front & (influence > 0)
            weight = np.rint(255 * influence[mask])
            code[mask] = GI['head'] + GI[name] * 32 + weight * 1024
            D[name][1] = cy

    # ---- 쓰기
    os.makedirs(a.out, exist_ok=True)
    nv = len(P)
    if nv > 65535:
        raise SystemExit('정점이 65535개를 넘습니다 (폴리곤 수를 줄이세요)')
    blob = b''.join([P.astype(np.float32).tobytes(), N.astype(np.float32).tobytes(), UV.tobytes(), code.tobytes(),
                     soft.tobytes(), IDX.astype(np.uint16).tobytes()])
    open(os.path.join(a.out, a.name + '.bin'), 'wb').write(blob)
    img, mime = image(j['materials'][0]['pbrMetallicRoughness']['baseColorTexture']['index']
                      if 'pbrMetallicRoughness' in j['materials'][0] else 0)
    raw = os.path.join(a.out, a.name + '_src' + ('.png' if 'png' in mime else '.jpg'))
    open(raw, 'wb').write(img)
    dst = os.path.join(a.out, a.name + '.jpg')
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', '-Z', str(a.tex), raw, '--out', dst],
                   check=True, capture_output=True)
    os.remove(raw)
    meta = {'name': a.name, 'verts': nv, 'tris': len(IDX) // 3, 'tex': a.name + '.jpg',
            'def': [[n, p, *[round(float(v), 4) for v in D[n]]] for n, p in GAME],
            'height': round(float(P[:, 1].max()), 3), 'src': os.path.basename(a.glb)}
    json.dump(meta, open(os.path.join(a.out, a.name + '.json'), 'w'), ensure_ascii=False, indent=1)
    print(f"{a.name}: verts {nv}, tris {len(IDX)//3}, height {meta['height']} m, "
          f"bin {len(blob)//1024} KB, tex {os.path.getsize(dst)//1024} KB")


if __name__ == '__main__':
    main()
