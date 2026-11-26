/* 약속의 길 — v19 GLB 캐릭터 에셋 (Higgsfield/Meshy → tools/glb2hero.py → assets/heroes/<이름>.{json,bin,jpg})
   변환된 캐릭터는 게임의 뼈대 순서(models.js HB)를 그대로 쓰므로 걷기·발 IK·감정 연기·물매 같은 기존 절차적 동작이
   그대로 적용된다. 뼈 위치(def)만 캐릭터마다 다르다. 셰이딩은 기존 캐릭터와 같은 셀 셰이딩에 색만 텍스처에서 읽는다.
   ?glb=0 이면 끈다 (예전 코드 캐릭터와 비교할 때). */
'use strict';
(function (G) {
const H = G.HeroAsset = { assets: {}, off: /[?&]glb=0/.test(location.search) };
const LINE = [0.55, 0.42, 0.36]; // 외곽선 색이 섞일 정점색 (따뜻한 갈색)

H.load = function (name, base) {
  if (H.off) return Promise.resolve(null);
  if (H.assets[name]) return H.assets[name].ready;
  const a = H.assets[name] = { name, mesh: null, tex: null, def: null };
  const dir = (base || 'assets/heroes/') + name;
  a.ready = Promise.all([
    fetch(dir + '.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    fetch(dir + '.bin').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }),
    new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = dir + '.jpg'; })
  ]).then(([meta, bin, img]) => {
    const nv = meta.verts; let o = 0;
    const take = (T, n) => { const v = new T(bin, o, n); o += n * T.BYTES_PER_ELEMENT; return v; };
    const pos = take(Float32Array, nv * 3), nrm = take(Float32Array, nv * 3), uv = take(Float32Array, nv * 2),
      bone = take(Float32Array, nv), soft = take(Float32Array, nv), idx = take(Uint16Array, meta.tris * 3);
    const d = new Float32Array(nv * 11);
    for (let i = 0; i < nv; i++) { const b = i * 11;
      d[b] = pos[i * 3]; d[b + 1] = pos[i * 3 + 1]; d[b + 2] = pos[i * 3 + 2];
      d[b + 3] = nrm[i * 3]; d[b + 4] = nrm[i * 3 + 1]; d[b + 5] = nrm[i * 3 + 2];
      d[b + 6] = LINE[0]; d[b + 7] = LINE[1]; d[b + 8] = LINE[2]; d[b + 9] = soft[i]; d[b + 10] = bone[i]; }
    a.mesh = G.R.meshTex(d, uv, idx); a.tex = G.R.texture(img);
    a.def = meta.def.map(e => [e[0], e[1], e[2], e[3], e[4]]); a.meta = meta;
    return a;
  }).catch(e => { console.warn('[HeroAsset] ' + name + ' 불러오기 실패', e); a.failed = true; return null; });
  return a.ready;
};
H.get = name => { const a = H.assets[name]; return a && a.mesh ? a : null; };

/* 같은 객체의 rig를 다른 뼈 위치(def)의 rig로 바꾼다. 동작 상태(브레이크, IK, 천 시뮬레이션 등 rig에 붙은 값)는 그대로 옮긴다. */
const CORE = new Set(['def', 'n', 'rot', 'scl', 'off', 'world', 'bones', 'L']);
H.swapRig = function (rig, def) {
  if (rig.def === def) return rig;
  const r = new G.Rig(def); for (const k of Object.keys(rig)) if (!CORE.has(k)) r[k] = rig[k];
  r.rot.set(rig.rot); r.scl.set(rig.scl); r.off[0] = rig.off[0]; r.off[1] = rig.off[1]; r.off[2] = rig.off[2];
  return r;
};
})(window.G);
