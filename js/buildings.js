/* 약속의 길 — v18.65 문 없이 걸어 들어가는 마을의 공공 건물 (buildings.js · livelife.js 다음)
   집처럼 문을 눌러 들어가는 곳이 아니라, 그대로 걸어 들어가는 지붕 있는 곳이에요(애굽 궁 · 곳간 같은 방식).
   · 왕의 도성 · 열주 회랑(공회당): 기둥 여덟, 그림 벽, 돌 의자. 노인들이 앉아 옛이야기를 하고, 한낮엔 그늘을 찾아온 사람들이 쉬어요. 서기 페피가 문서를 적어요.
   · 서쪽 마을 · 서기의 집(글방): 아이들이 아침마다 모여 앉아 글자를 배워요. 선생은 서기 아멘에트.
   · 남쪽 마을 · 빵 굽는 공방: 둥근 화덕 둘, 반죽 통, 맷돌, 곡식 자루. 빵 굽는 이피가 일하고, 마을 여인들이 빵을 사러 와요.
   비가 오면 마을 사람들이 이 지붕 아래로 피해요(v.shelters). 한낮 그늘로도 써요(v.shadeX · livelife.js).
   자리: 마을 안의 빈터(벽 · 길 · 우물 · 장터를 피해 브라우저에서 찾은 곳). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!Game || !EP) return;
const S = () => Game.S(), PI = Math.PI;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const V = id => (EP.villages || []).find(v => v.id === id);
const B = G.Bldg = { list: [] };
/* x, z, w (side to side), d (front to back); the open front looks toward the village middle */
const DEF = [
  { id: 'hall', v: 'city', n: '도성 열주 회랑', x: -32.5, z: -71, w: 10, d: 7, kind: 'hall' },
  { id: 'school', v: 'west', n: '서쪽 마을 서기의 집', x: -155.5, z: -37, w: 8, d: 6, kind: 'school' },
  { id: 'bakery', v: 'south', n: '남쪽 마을 빵 공방', x: -160.5, z: 131.5, w: 9, d: 6, kind: 'bakery' }];
for (const b of DEF) { const v = V(b.v); if (!v) continue; b.ry = Math.atan2(v.x - b.x, v.z - b.z); b.vil = v; B.list.push(b);
  (v.shelters = v.shelters || []).push([b.x + Math.sin(b.ry) * 0.6, b.z + Math.cos(b.ry) * 0.6, b.ry + PI]); (v.shadeX = v.shadeX || []).push([b.x, b.z]);
  (EP.places = EP.places || []).push({ n: b.n, x: b.x, z: b.z, when: v.when }); }
/* local (side, back-front) → world */
const W2 = (b, lx, lz) => [b.x + lx * Math.cos(b.ry) + lz * Math.sin(b.ry), b.z - lx * Math.sin(b.ry) + lz * Math.cos(b.ry)];
const MUD = 0xcbb48c, MUD2 = 0xb89e74, STONE = 0xd8c8a4, WOOD = 0x6a4a30, PAINT = [0x2f8a77, 0xc8902e, 0x8a3a2a, 0x2e4a78];
function build(W) { const E = Object.assign({}, G.env || {}, EP.envx || {});
  for (const b of B.list) { try { const y0 = W.heightAt(b.x, b.z), g = W.gb(b.x, b.z), M = G.m4trs(G.m4(), b.x, y0, b.z, b.ry, 0, 0, 1, 1, 1), hw = b.w / 2, hd = b.d / 2;
      const box = (w, h, d, x, y, z, c, o) => g.box(w, h, d, Object.assign({ m: M, at: [x, y, z], c, j: 0.03 }, o || {})), cyl = (rt, rb, h, seg, x, y, z, c, o) => g.cyl(rt, rb, h, seg, Object.assign({ m: M, at: [x, y, z], c }, o || {}));
      const col = (lx, lz, w, d, h) => { const [x, z] = W2(b, lx, lz); W.addCol({ x, z, w, d, a: b.ry, y0: y0 - 1, y1: y0 + h }); }, colR = (lx, lz, r, h) => { const [x, z] = W2(b, lx, lz); W.addCol({ x, z, r, y0: y0 - 1, y1: y0 + h }); };
      const put = (fn, lx, lz, o) => { if (!E[fn]) return; const [x, z] = W2(b, lx, lz); W.place(E[fn], x, z, Object.assign({ gb: g, y: y0, ry: b.ry }, o || {})); };
      const H = b.kind === 'hall' ? 3.3 : 2.7;
      box(b.w + 0.4, 0.06, b.d + 0.4, 0, 0.03, 0, b.kind === 'bakery' ? 0xb8a07a : STONE, { j: 0.05 }); /* a swept floor of beaten earth or flags */
      if (b.kind === 'hall') {
        for (const lx of [-hw + 0.4, -hw / 3, hw / 3, hw - 0.4]) for (const lz of [hd - 0.4, 0.2]) { cyl(0.26, 0.3, H - 0.25, 10, lx, (H - 0.25) / 2, lz, 0xe2d4b0); cyl(0.42, 0.26, 0.32, 10, lx, H - 0.1, lz, 0x5a8a5a); cyl(0.3, 0.3, 0.12, 10, lx, 0.06, lz, 0xc8b890); colR(lx, lz, 0.34, H); }
        box(b.w, H, 0.35, 0, H / 2, -hd + 0.18, MUD); col(0, -hd + 0.18, b.w, 0.4, H);
        for (let i = 0; i < 5; i++) box(1.5, 0.9, 0.04, -hw + 1.2 + i * 1.9, 1.9, -hd + 0.38, PAINT[i % 4], { j: 0.06 }); /* painted panels: fields, the river, the harvest */
        box(b.w + 0.7, 0.32, b.d + 0.7, 0, H + 0.16, 0, 0xe0d0aa); box(b.w + 0.9, 0.12, b.d + 0.9, 0, H + 0.38, 0, 0xc8b890); box(b.w + 0.72, 0.1, 0.06, 0, H - 0.05, hd + 0.36, 0x2f8a77);
        for (const s of [-1, 1]) { box(3, 0.42, 0.55, s * 2.4, 0.21, -hd + 0.75, STONE); col(s * 2.4, -hd + 0.75, 3, 0.55, 0.42); }
        box(1.2, 0.35, 0.7, 0, 0.18, -0.6, 0xa07a50); put('jars', hw - 1, -hd + 1, { args: [3] }); put('rugEg', 0, 0.6); put('scribeDesk', -1.6, 0.4);
        W.addRoof && W.addRoof({ x: b.x, z: b.z, w: b.w + 0.6, d: b.d + 0.6, a: b.ry, y: y0 + H + 0.05, k: 'bHall' }); }
      else if (b.kind === 'school') {
        box(b.w, H, 0.4, 0, H / 2, -hd + 0.2, MUD); col(0, -hd + 0.2, b.w, 0.45, H); for (const s of [-1, 1]) { box(0.4, H, b.d, s * (hw - 0.2), H / 2, 0, MUD2); col(s * (hw - 0.2), 0, 0.45, b.d, H); }
        for (const s of [-1, 1]) { cyl(0.18, 0.2, H, 8, s * 1.6, H / 2, hd - 0.3, 0xd8c8a0); colR(s * 1.6, hd - 0.3, 0.24, H); }
        for (let i = -3; i <= 3; i++) cyl(0.09, 0.09, b.d + 0.5, 6, i * 1.15, H + 0.08, 0, 0x8a6a48, { rx: PI / 2 }); box(b.w + 0.5, 0.14, b.d + 0.5, 0, H + 0.22, 0, 0xc8b47a);
        for (const lz of [0.3, 1.5]) for (const s of [-1, 1]) box(1.8, 0.32, 0.45, s * 1.6, 0.16, lz, 0xa07a50); /* low writing benches */
        put('scribeDesk', 0, -hd + 1.2); put('shelves', hw - 0.9, -hd + 0.9); put('ampRack', -hw + 0.9, -hd + 0.9);
        W.addRoof && W.addRoof({ x: b.x, z: b.z, w: b.w, d: b.d, a: b.ry, y: y0 + H + 0.1, k: 'bSchool' }); }
      else if (b.kind === 'bakery') {
        box(b.w, 2.4, 0.4, 0, 1.2, -hd + 0.2, MUD); col(0, -hd + 0.2, b.w, 0.45, 2.4); box(0.4, 2.4, b.d, -hw + 0.2, 1.2, 0, MUD2); col(-hw + 0.2, 0, 0.45, b.d, 2.4);
        box(b.w, 0.1, b.d * 0.55, 0, 2.45, -hd * 0.45, 0xb89a62, { j: 0.08 }); for (let i = -3; i <= 3; i++) cyl(0.07, 0.07, b.d * 0.6, 6, i * 1.3, 2.38, -hd * 0.45, 0x7a5a3a, { rx: PI / 2 }); /* a reed roof over the back half */
        for (const s of [-1, 1]) { cyl(0.11, 0.13, 2.4, 6, s * (hw - 0.6) + (s > 0 ? 0 : 1.2), 1.2, 0.2, WOOD); colR(s * (hw - 0.6) + (s > 0 ? 0 : 1.2), 0.2, 0.16, 2.4); }
        put('oven', -hw + 1.3, -hd + 1.4); put('oven', -hw + 1.3, 0.6); colR(-hw + 1.3, -hd + 1.4, 0.9, 1.4); colR(-hw + 1.3, 0.6, 0.9, 1.4);
        box(2.2, 0.55, 0.7, 1.2, 0.28, -hd + 1.0, 0x8a6a48); box(2.0, 0.05, 0.5, 1.2, 0.56, -hd + 1.0, 0xe8dcc0); col(1.2, -hd + 1.0, 2.2, 0.7, 0.6); /* the kneading trough with dough */
        put('quern', 2.8, 0.8); put('sacks', hw - 1, -hd + 1); put('loaves', 0.6, 0.4, { args: [6] }); put('baskets', 2.4, 1.8, { args: [3] });
        W.addRoof && W.addRoof({ x: W2(b, 0, -hd * 0.45)[0], z: W2(b, 0, -hd * 0.45)[1], w: b.w, d: b.d * 0.55, a: b.ry, y: y0 + 2.45, k: 'bBakery' }); }
    } catch (e) { console.error('buildings ' + b.id, e); } } }
{ const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); build(W); }; }
/* the oven's smoke */
if (G.FX) { const up0 = EP.update; let fT = 0; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; try { fT -= (typeof dt === 'number' && dt < 1 ? dt : 0.016); if (fT > 0) return r; fT = 0.4; const s = S(), p = Game.P, h = s ? s.time % 24 : 12; if (!s || h < 4.5 || h > 19.5) return r;
      const b = B.list.find(q => q.id === 'bakery'); if (!b || Math.hypot(b.x - p.x, b.z - p.z) > 60 || (b.vil.when && !b.vil.when(s))) return r; const [x, z] = W2(b, -b.w / 2 + 1.3, -b.d / 2 + 1.4); G.FX.burst(x, Game.W().heightAt(x, z) + 1.6, z, 1, { c: [0.78, 0.76, 0.72], sp: 0.15, up: 0.9, size: 0.4, a: 0.35, g: -0.25, life: 3.5, drag: 0.2 }); } catch (e) { } return r; }; }

// ------------------------------------------------------------------ the people who work there
const at = (id, lx, lz) => { const b = B.list.find(q => q.id === id); return b ? W2(b, lx, lz) : [0, 0]; };
const bOf = id => B.list.find(q => q.id === id);
const onV = v => s => !!v && (!v.when || v.when(s));
{ const hall = bOf('hall'), sch = bOf('school'), bak = bOf('bakery');
  if (hall) { const [x, z] = at('hall', -1.6, 1.1); EP.npcs.push({ id: 'bdPepi', name: '회랑의 서기 페피', look: { skin: 0xa86a40, top: 0xece2cc, under: 0xece2cc, trim: 0x2f8a77, belt: 0xc8902e, hair: 0x15100c, hairStyle: 'short', collar: 0x2f8a77 }, x, z, face: hall.ry, act: 'sitg', talkR: 2.6, noBond: true, show: onV(hall.vil),
    chat: ['오늘은 곳간에 들어온 곡식 자루를 적고 있소. 한 자루라도 틀리면 안 되지.', '한낮이면 다들 이 회랑 그늘로 모여든다오. 바람이 잘 통하거든.', '노인들 이야기를 듣고 있으면 받아 적고 싶은 게 한둘이 아니오.', '비가 오면 장터 사람들도 여기로 뛰어 들어오지요.'] }); }
  if (sch) { const [x, z] = at('school', 0, -1.6); EP.npcs.push({ id: 'bdAmen', name: '글 선생 아멘에트', look: { skin: 0x9a6038, top: 0xe8dcc0, under: 0xe8dcc0, trim: 0x8a3a2a, belt: 0x6a4428, hair: 0xd0c8bc, beard: 'short', beardCol: 0xd8d0c4, age: 'old', collar: 0xc8902e }, x, z, face: sch.ry, talkR: 2.6, noBond: true, show: onV(sch.vil),
    chat: ['갈대 붓은 이렇게 쥐는 거란다… 아, 손님이시군요.', '아이들이 글을 배우면 곡식 장부를 적을 수 있지요. 총리님의 곳간에도 서기가 많이 필요하다더군요.', '「물」이라는 글자는 물결 세 줄이오. 보시오, 쉽지요?', '아침마다 아이들이 오면 이 집이 시끌벅적하다오.'] }); }
  if (bak) { const [x, z] = at('bakery', 1.2, -0.4); EP.npcs.push({ id: 'bdIpi', name: '빵 굽는 이피', look: { skin: 0xb07a4e, fem: true, long: true, top: 0xe6dcc6, under: 0xe6dcc6, trim: 0xb84a3a, hair: 0x15100c, hairStyle: 'braid', headwear: 'cloth', clothCol: 0xece6d6 }, x, z, face: bak.ry + PI, act: 'gather', talkR: 2.6, noBond: true, show: onV(bak.vil),
    chat: ['새벽부터 화덕에 불을 지폈어요. 빵 냄새 나지요?', '보리 반죽에 무화과를 조금 넣으면 아이들이 좋아해요.', '마을 여인들이 아침마다 빵을 가지러 와요. 그때가 제일 바빠요.', '화덕 곁은 겨울엔 좋은데 여름엔 숨이 턱턱 막혀요.'] }); } }

// ------------------------------------------------------------------ the villagers use them: elders to the hall, children to the school, women for bread
if (AI && AI.plan) { const plan2 = AI.plan; const C2 = new Map(); AI.plan = function (v, f, s) { const rows = plan2.apply(this, arguments); if (!rows || !s) return rows; const key = rows; const c = C2.get(f.id); if (c && c.k === key) return c.p; let p = rows;
    try { const b = B.list.find(q => q.vil === v); if (b) { p = rows.map(r => r.slice()); const sp = (lx, lz) => W2(b, lx, lz);
        p.forEach((r, i) => { const k = hash(f.id + s.day + 'bd' + i), h = r[0];
          if (b.kind === 'hall' && (f.role === 'elder' || f.age === 'old') && r[4] === 'sit' && h > 6 && h < 18 && k < 0.6) { const q = sp(-3.6 + hash(f.id) * 7.2, -2.6); r[1] = +q[0].toFixed(2); r[2] = +q[1].toFixed(2); r[3] = +b.ry.toFixed(2); r[5] = 'hall'; }
          else if (b.kind === 'school' && (f.age === 'kid' || f.role === 'child') && h >= 6 && h < 11 && r[4] && /^wander/.test(r[4]) && k < 0.75) { const q = sp(-1.6 + (hash(f.id) < 0.5 ? 0 : 3.2), 0.3 + (hash(f.id + 'z') < 0.5 ? 0 : 1.2)); r[1] = +q[0].toFixed(2); r[2] = +q[1].toFixed(2); r[3] = +(b.ry + PI).toFixed(2); r[4] = 'sit'; r[5] = 'school'; }
          else if (b.kind === 'bakery' && (f.role === 'water' || f.role === 'oldwoman') && h >= 6 && h < 10 && r[4] !== 'hide' && k < 0.5) { const q = sp(2.2 + hash(f.id) * 1.4, 1.6); r[1] = +q[0].toFixed(2); r[2] = +q[1].toFixed(2); r[3] = +(b.ry + PI).toFixed(2); r[4] = 'wander:0.8'; r[5] = 'bread'; } }); } } catch (e) { console.error('buildings plan', e); }
    if (C2.size > 800) C2.clear(); C2.set(f.id, { k: key, p }); return p; }; }
if (G.Live) { Object.assign(G.Live.BUB, { hall: ['회랑 그늘에 앉으니 살 것 같구먼.', '옛날 이야기 하나 해 줄까?', '요즘 젊은것들은…, 허허.'], school: ['물결 세 줄은 「물」!', '선생님, 이거 맞아요?', '갈대 붓이 자꾸 미끄러져요.'], bread: ['갓 구운 빵 냄새!', '보리빵 다섯 덩이 주세요.', '이피, 오늘도 맛있겠다!'] });
  Object.assign(G.Live.TALK, { hall: '회랑 그늘에 앉아 이웃들과 이야기하는 중이라오.', school: '글 배우러 왔어요! 오늘은 「물」이랑 「빵」 글자를 배워요.', bread: '빵 공방에 빵 가지러 왔어요. 이피네 빵이 제일 맛있어요.' }); }
})(window.G);
