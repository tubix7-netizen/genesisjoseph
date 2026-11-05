/* 약속의 길 — 북적이는 애굽 마을 (v18.24)
   사용자 요청: 「모양만 있는 문은 없도록」 · 「도시 느낌 나게 집과 사람을 더 많이 (인구 2배)」.
   · 문이 그려진 집(애굽 집 모양)은 전부 들어갈 수 있는 집이에요. 세상을 지을 때 집 그림이 문을 그릴 때마다 그 자리를 적어 두었다가,
     아직 「들어가기」가 없는 문은 가까운 마을의 집으로 등록해요(마을에서 멀면 그 집 하나만의 작은 집터). 감옥·보디발의 집·궁·관저 안의 건물은 빼요.
   · 도성·서쪽·남쪽·피라미드 일꾼 마을 둘레에 집을 더 지어요(평평하고, 물·길·다른 건물·이야기 장소와 겹치지 않는 자리만, 문은 마을 쪽으로).
   · 새 집마다 사는 사람을 들여요(어른 한 명, 몇 집은 아이도). 일·옷·피부색·이름이 다 다르고, 기존 마을 사람처럼 하루 일과대로 살아요.
     → 애굽 마을 사람이 약 두 배가 돼요. 새 자리는 매번 같은 계산으로 정해져서 저장·불러오기 뒤에도 그대로예요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI, Ho = G.Homes; if (!EP || !AI || !AI.addFolk || !Ho || !G.env || !G.env.house) return;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const C = G.Cy = { extraV: [], added: 0 };
// ------------------------------------------------------------------ every painted door, as the house model draws it
let REC = null;
{ const h0 = G.env.house; G.env.house = function (g, M, r, o) { if (REC && M) { const d = (o && o.d) || 5, lx = (o && o.doorX) || 0, lz = d / 2 + 0.02;
      const x = M[0] * lx + M[8] * lz + M[12], z = M[2] * lx + M[10] * lz + M[14], fx = M[8], fz = M[10], fl = Math.hypot(fx, fz) || 1;
      REC.push({ x, z, a: Math.atan2(fx / fl, fz / fl), cx: M[12], cz: M[14] }); } return h0.apply(this, arguments); }; }
const OUT = (x, z) => (x > -51 && x < 16 && z > 34 && z < 84) /* Potiphar's estate */ || (x > -50 && x < -5 && z > -15 && z < 15) /* the prison */ || Math.hypot(x + 30, z + 162) < 22 /* the palace */ || Math.hypot(x - 10, z + 144) < 10 /* Joseph's house */;
// ------------------------------------------------------------------ new houses round the villages
const MORE = { city: 16, west: 7, south: 7, pyr: 4 };
const egy = () => (EP.villages || []).find(v => v.id === 'city');
function freeSpot(W, x, z, w, d, ry, v) { const wl = W.water ? W.water.level : -99; let lo = 1e9, hi = -1e9; const ca = Math.cos(ry), sa = Math.sin(ry);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const px = x + ca * i * w / 2 + sa * j * d / 2, pz = z - sa * i * w / 2 + ca * j * d / 2, h = W.heightAt(px, pz); lo = Math.min(lo, h); hi = Math.max(hi, h);
    if (Game.solidAt && Game.solidAt(px, pz, 1.6)) return false; }
  if (hi - lo > 1.1 || lo < wl + 0.7) return false;
  for (const k in v.spots || {}) { const sp = v.spots[k]; if (Math.hypot(sp[0] - x, sp[1] - z) < Math.max(w, d) / 2 + 4) return false; }
  for (const [hx, hz] of v.homes) if (Math.hypot(hx - x, hz - z) < 8) return false;
  for (const k in EP.spots || {}) { const sp = EP.spots[k]; if (Array.isArray(sp) && Math.hypot(sp[0] - x, sp[1] - z) < 7) return false; }
  for (const st of EP.stations || []) if (st.x !== undefined && Math.hypot(st.x - x, st.z - z) < 5) return false;
  if (EP.roadD && EP.roadD(x, z) < Math.max(w, d) / 2 + 2.5) return false; if (OUT(x, z)) return false;
  return true; }
// ------------------------------------------------------------------ the people of the new houses
const ROLES = ['farmer', 'water', 'merchant', 'weaver', 'potter', 'fisher', 'baker', 'brickmaker', 'washer', 'porter', 'farmer', 'elder', 'trader', 'water'];
const TITLE = { farmer: ['농부', 0], water: ['물 긷는 여인', 1], merchant: ['장사꾼', 0], weaver: ['베 짜는 여인', 1], potter: ['토기장이', 0], fisher: ['어부', 0], baker: ['빵 굽는 여인', 1], brickmaker: ['벽돌공', 0], washer: ['빨래하는 여인', 1], porter: ['짐꾼', 0], elder: ['노인', 0], trader: ['나귀 탄 장사꾼', 0], child: ['아이', 0] };
const MEN = ['아멘', '바타', '데디', '헤사', '이네니', '카르', '메누', '파세르', '라모세', '타후티', '젠', '호리', '케누', '마이', '나크트', '펜투', '레니', '후이', '카하', '쿠아', '세누', '아키', '두아', '네헤', '우세르카', '이미', '하피루', '메리라', '파타', '보키', '셰티', '아누비', '테티', '헤카', '사카'];
const WOMEN = ['이시', '네베트', '이우네트', '타카', '이세트', '케이', '타슈', '네젬', '우레트', '타네니', '헤테피', '아샤', '비비', '타이', '누비', '세샤', '메니', '하이아', '이피아', '나니', '레니트', '타미아', '헤넨', '바키트', '수수'];
const KIDS = ['피피', '네니', '바바', '투투', '미미', '케케', '나나', '포포', '디디', '수티', '루루', '하하'];
const SK = [0x9a6038, 0xa86a40, 0xb07848, 0x8a5a32, 0xc08a58, 0x7a4a2a, 0xb88050], CL = [0xe8dcc0, 0xd8c8a0, 0xc8b890, 0xe0d4b8, 0xb8a888, 0xd8b890, 0xc8d0c0];
const tw = (o, x) => Object.assign({}, o, x);
function baseLook(fem, kid) { for (const v of EP.villages || []) { const f = (v.folk || []).find(q => q.look && !!q.look.fem === fem && (kid ? q.age === 'kid' : q.age !== 'kid')); if (f) return f.look; } return null; }
function people(v, i, used) { const out = [], k = v.id + ':' + i, role = ROLES[Math.floor(hash(k + 'r') * ROLES.length)], [title, fem] = TITLE[role];
  const nameOf = (L, salt) => { let j = Math.floor(hash(k + salt) * L.length); for (let t = 0; t < L.length; t++) { const n = L[(j + t) % L.length]; if (!used.has(n)) { used.add(n); return n; } } return null; };
  const nm = nameOf(fem ? WOMEN : MEN, 'n'); const b = baseLook(!!fem, false); if (nm && b) out.push({ id: 'cy_' + v.id + i, name: `${title} ${nm}`, role, home: i, look: tw(b, { skin: SK[Math.floor(hash(k + 's') * SK.length)], bottom: CL[Math.floor(hash(k + 'b') * CL.length)], top: fem ? CL[Math.floor(hash(k + 't') * CL.length)] : b.top }),
    age: role === 'elder' ? 'old' : undefined, prop: role === 'fisher' ? 'fishrod' : undefined, mount: role === 'trader' ? 'donkey' : undefined, pack: role === 'trader' ? 0x8a6a48 : undefined, work: role === 'brickmaker' ? 'brick' : undefined,
    persona: `${v.n}에 사는 ${title}. 이웃과 정답게 지낸다.` });
  if (hash(k + 'kid') < 0.45) { const kn = nameOf(KIDS, 'k'), kb = baseLook(hash(k + 'kf') < 0.5, true); if (kn && kb) out.push({ id: 'cy_' + v.id + i + 'k', name: `아이 ${kn}`, role: 'child', home: i, age: 'kid', look: tw(kb, { skin: SK[Math.floor(hash(k + 'ks') * SK.length)] }), persona: `${nm || '이웃'}네 아이. 골목을 뛰어다닌다.` }); }
  return out; }
// ------------------------------------------------------------------ at world build: build the houses, then turn every painted door into a real house
const pb = EP.build; EP.build = function (W) { REC = []; try { if (pb) pb.apply(this, arguments); } finally { } try { grow(W); doors(W); } catch (e) { console.error('city', e); } REC = null; };
function grow(W) { const used = new Set(); for (const d of EP.npcs || []) if (d.name) used.add(d.name.split(' ').pop());
  for (const v of EP.villages || []) { const n = MORE[v.id]; if (!n) continue; if (v._base === undefined) v._base = v.homes.length; v.homes.length = v._base;
    let far = 0; for (const [hx, hz] of v.homes) far = Math.max(far, Math.hypot(hx - v.x, hz - v.z)); let made = 0;
    for (let ring = 0; ring < 4 && made < n; ring++) { const R = far + 8 + ring * 8.5, steps = Math.floor(2 * Math.PI * R / 10.5);
      for (let s = 0; s < steps && made < n; s++) { const a = (s + (ring % 2) * 0.5) / steps * Math.PI * 2 + hash(v.id + ring) * 0.6, x = v.x + Math.cos(a) * R, z = v.z + Math.sin(a) * R;
        const k = v.id + 'h' + ring + ':' + s, w = 5 + Math.floor(hash(k) * 3) * 0.7, d = 4.4 + hash(k + 'd') * 0.8, ry = Math.atan2(v.x - x, v.z - z) + (hash(k + 'a') - 0.5) * 0.3;
        if (!freeSpot(W, x, z, w, d, ry, v)) continue; const h = (hash(k + 'h') < 0.5 ? 2.6 : 3.4) * 1.4;
        W.place('egHouse', x, z, { ry, args: [{ w, d, h, awning: hash(k + 'aw') < 0.3 ? [0xc8862a, 0x2c5aa0, 0x8a3a5a][Math.floor(hash(k + 'c') * 3)] : null }], col: { w, d, h: h + 0.4, a: ry, cam: true } });
        v.homes.push([+x.toFixed(2), +z.toFixed(2), +ry.toFixed(3)]); made++; } }
    for (const [hx, hz] of v.homes) far = Math.max(far, Math.hypot(hx - v.x, hz - v.z)); v.r = Math.max(v.r, far + 5); } }
function doors(W) { const used = new Set(); for (const d of EP.npcs || []) if (d.name) used.add(d.name.split(' ').pop()); C.extraV.length = 0;
  const known = []; for (const v of Ho.allV()) (v.homes || []).forEach((hm, i) => { const dd = Ho.door(v, i); if (dd) known.push(dd); });
  for (const r of REC) { if (r.x > 28 || OUT(r.cx, r.cz)) continue; if (known.some(k => Math.hypot(k.x - r.x, k.z - r.z) < 2.6)) continue;
    let best = null, bd = 1e9; for (const v of EP.villages || []) { const d = Math.hypot(v.x - r.cx, v.z - r.cz); if (d < v.r + 30 && d < bd) { bd = d; best = v; } }
    const dd = { x: r.x + Math.sin(r.a) * 0.06, z: r.z + Math.cos(r.a) * 0.06, a: r.a, y: W.heightAt(r.x, r.z), fx: r.x + Math.sin(r.a) * 1.0, fz: r.z + Math.cos(r.a) * 1.0 };
    if (best) { best.homes.push([+r.cx.toFixed(2), +r.cz.toFixed(2), 0]); const i = best.homes.length - 1; dd.k = Ho.houseKey(best, i); Ho.setDoor(dd.k, dd); }
    else { const v = { id: 'xh' + C.extraV.length, n: '외딴 집', x: r.cx, z: r.cz, r: 6, homes: [[r.cx, r.cz, 0]], folk: [{ id: 'xh' + C.extraV.length + 'f', name: '집주인 ' + (MEN[C.extraV.length % MEN.length]), home: 0 }], when: egy() && egy().when, spots: {} };
      dd.k = Ho.houseKey(v, 0); Ho.setDoor(dd.k, dd); C.extraV.push(v); }
    known.push(dd); }
  // people for every home that has nobody living in it yet (the new houses and the doors just registered)
  let n = 0; for (const v of EP.villages || []) { if (!MORE[v.id]) continue; for (let i = 0; i < v.homes.length; i++) { if (v.folk.some(f => (f.home || 0) === i)) continue;
      for (const f of people(v, i, used)) { if (v.folk.some(q => q.id === f.id) || (EP.npcs || []).some(q => q.id === f.id)) continue; AI.addFolk(EP, v, f); n++; } } }
  C.added = n; }
// ------------------------------------------------------------------ going home means walking to the door (the home spot is the middle of the house, inside its walls)
{ const w0 = Game.npcWalk; Game.npcWalk = function (id, x, z, cb, sp, path) { const n = Game.ENT.npcs[id];
    if (n && n.d.folk && Game.solidAt && Game.solidAt(x, z, 0.05)) { let best = null, bd = 9; for (const v of Ho.allV()) { if (Math.hypot(v.x - x, v.z - z) > v.r + 15) continue;
        (v.homes || []).forEach((hm, i) => { const d = Ho.door(v, i); if (!d) return; const dd = Math.hypot(hm[0] - x, hm[1] - z); if (dd < bd) { bd = dd; best = d; } }); }
      if (best) { x = best.fx; z = best.fz; } }
    return w0.call(this, id, x, z, cb, sp, path); }; }
})(window.G);
