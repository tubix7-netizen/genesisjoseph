/* 약속의 길 — 친구의 부탁 (v18.32)
   마을 사람과 「친구」(친밀도 3단계)가 되면, 그 사람만의 작은 사연이 있는 부탁이 하나 열려요(머리 위에 !).
   하는 일에 따라 달라요: 어부의 그물 수선, 빵집의 잔칫빵, 아이의 잃어버린 나무 인형 찾기…
   끝내면 더 가까워지고(친밀도 +6), 다음 날 아침 고맙다는 편지가 와요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.Life || !G.Bond) return;
const S = () => Game.S(), P = () => Game.P, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const short = n => (n.name || '').split(' ').pop();
const it = k => (Game.ITEMS[k] ? Game.ITEMS[k].n : k);
/* [title, need {item: n}, offer lines, done lines, reward] — {n} = their name, {t} = how they call Joseph */
const T = {
  fisher: ['{n}의 찢어진 그물', { thread: 2 }, ['어제 큰 고기가 그물을 찢고 달아났지 뭐예요! 그 녀석, 분명 이만했어요.', '실 두 타래만 있으면 다시 꿰맬 수 있는데… 부탁해도 될까요?'], ['이제 그 녀석도 못 빠져나가요! 이건 오늘 잡은 것 중 제일 좋은 놈이에요.'], { silver: 12, items: { carp: 2 } }],
  baker: ['{n}의 잔칫빵', { wheat: 3, honey: 1 }, ['우리 막내가 다음 주에 혼례를 올려요. 꿀 바른 잔칫빵을 굽고 싶은데 밀이 모자라요.', '밀 세 줌과 석청 하나면 온 동네가 먹을 만큼 구울 수 있어요!'], ['냄새 좋지요? 첫 빵은 {t} 몫이에요. 혼례에도 꼭 오세요!'], { items: { bread: 4 }, silver: 8 }],
  farmer: ['{n}네 밭의 허수아비', { straw: 4, branch: 2 }, ['새들이 씨앗을 다 쪼아 먹어요. 허수아비를 세우려는데 짚과 가지가 모자라네요.', '짚 네 단, 가지 두 개면 돼요. 얼굴은 제가 웃는 얼굴로 그릴게요.'], ['보세요, {t}를 닮게 만들었어요! 새들이 무서워서 못 오겠지요?'], { items: { barley: 5, onion: 2 } }],
  potter: ['{n}의 가마 땔감', { wood: 2 }, ['큰 항아리를 구워야 하는데 가마 불이 약해요. 통나무 두 개만 구해 주실래요?', '이번 항아리는 곳간에 들어갈 거예요. 곡식을 지키는 항아리요!'], ['불이 활활! 이 항아리들이 칠 년을 버틸 거예요.'], { silver: 18, items: { clay: 3 } }],
  weaver: ['{n}의 아마 실', { flax: 3 }, ['딸아이 혼례 예복을 짜는 중인데 아마가 떨어졌어요.', '아마 세 묶음이면 세마포 한 필이 나와요.'], ['보세요, 눈처럼 고운 세마포! 남은 건 {t}께 드릴게요.'], { items: { linen: 1 }, silver: 6 }],
  washer: ['{n}의 빨래 방망이', { branch: 2, olive: 2 }, ['악어가 제 빨래 방망이를 물어 갔어요! 정말이에요!', '단단한 가지 둘이랑 올리브 두 알만 있으면… 아, 올리브는 제 점심이에요. 헤헤.'], ['새 방망이로 두드리니 빨래가 훨씬 하얘요! 악어야, 이번 건 못 가져간다!'], { silver: 10, items: { linen: 1 } }],
  water: ['{n}의 깨진 물동이', { clay: 3 }, ['우물에서 물동이를 떨어뜨려 깨 먹었어요. 토기장이 아저씨가 진흙만 있으면 새로 빚어 준대요.', '진흙 세 덩이만 구해 주실 수 있어요?'], ['새 물동이예요! 첫 물은 {t}께 떠 드릴게요. 시원하죠?'], { silver: 10, items: { cucumber: 2 } }],
  merchant: ['{n}의 귀한 손님', { linen: 1 }, ['먼 곳에서 귀한 손님이 와요. 고운 세마포 한 필을 선물해야 체면이 서는데…', '하나만 구해 주시면 값은 두 배로 쳐 드리지요!'], ['손님이 아주 기뻐했어요! 약속대로 넉넉히 드립니다.'], { silver: 60 }],
  brickmaker: ['{n}의 벽돌 짚', { straw: 5 }, ['곳간 벽돌을 더 찍어야 하는데 짚이 모자라요. 짚 없으면 벽돌이 금방 갈라져요.', '짚 다섯 단이면 오늘 다 찍을 수 있어요!'], ['오늘 찍은 벽돌엔 {t} 이름을 몰래 새겨 둘게요. 하하!'], { silver: 14, items: { brick: 4 } }],
  porter: ['{n}의 점심', { bread: 2 }, ['짐을 나르다 점심을 개한테 빼앗겼어요. 그 개는 신발만 모으는 줄 알았는데…', '빵 두 덩이만 있으면 오후 짐도 거뜬해요!'], ['살았다! 이제 기운이 펄펄 나요. 짐 나를 일 있으면 언제든 부르세요!'], { silver: 10 }],
  elder: ['{n} 어르신의 약초', { herb: 2 }, ['요즘 무릎이 쑤셔서… 들풀 약초 두 줌이면 달여 먹을 수 있겠소.', '젊었을 땐 내가 직접 캤는데, 이젠 산에 오르기가 힘들구려.'], ['고맙소. 늙은이 말 한마디 들려주리다. 받은 은혜는 물에 새기지 말고 돌에 새기시오.'], { silver: 8, insight: 1 }],
  trader: ['{n}의 나귀 간식', { cheese: 1 }, ['우리 나귀가 고집을 부려 꼼짝을 안 해요. 치즈를 좋아하는 이상한 녀석이거든요.', '치즈 한 덩이만 있으면 다시 걸을 거예요!'], ['보세요, 신나서 걸어요! 이건 먼 길에서 구한 대추야자예요.'], { items: { dates: 4 } }],
  child: ['{n}의 잃어버린 나무 인형', null, ['{t}… 제 나무 인형이 없어졌어요. 엄마가 깎아 준 거예요.', '아까 집 근처에서 놀았는데… 같이 찾아 주실래요?'], ['찾았다! 고맙습니다, {t}! 이제 이 인형 이름은 「요셉」이에요!'], { items: { flower: 2 } }],
};
const roleOf = n => (n.d.folk && n.d.folk.role) || (/어부/.test(n.name) ? 'fisher' : /빵/.test(n.name) ? 'baker' : /농부/.test(n.name) ? 'farmer' : /아이/.test(n.name) ? 'child' : /노인|장로/.test(n.name) ? 'elder' : null);
const title = s => { const st = s.step || ''; return st[0] === 'j' || st[0] === 'g' || (+st[1] || 0) >= 5 ? '총리님' : '요셉 님'; };
const DOLL = {}; /* where each child's doll lies (picked once, near their home) */
function dollAt(n) { if (DOLL[n.id]) return DOLL[n.id]; const v = n.d.village, h = v && v.homes && v.homes[n.d.folk.home || 0]; const bx = h ? h[0] : n.x, bz = h ? h[1] : n.z;
  for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 6 + (i % 3) * 2, x = bx + Math.cos(a) * r, z = bz + Math.sin(a) * r; if (!Game.solidAt(x, z, 0.5)) return (DOLL[n.id] = [x, z]); } return (DOLL[n.id] = [bx + 4, bz]); }
function register(n) { const r = roleOf(n), t = r && T[r]; if (!t) return; const qid = 'pf_' + n.id; if (EP.quests[qid]) return; const nm = short(n);
  const fill = x => x.replace(/\{n\}/g, nm).replace(/\{t\}/g, title(S()));
  EP.quests[qid] = { giver: n.id, title: fill(t[0]), when: s => G.Bond.level(n.id).i >= 2,
    offer: s => t[2].map(fill), prog: s => r === 'child' ? '집 근처 어딘가에 있을 거예요… 풀숲 사이요!' : `${Object.keys(t[1]).map(k => `${it(k)} ${t[1][k]}`).join(' · ')}만 있으면 돼요!`,
    obj: r === 'child' ? [{ t: `${nm}의 나무 인형 찾기 (집 근처)`, ok: s => !!(s.q.doll && s.q.doll[n.id]) }] : [{ t: s => Object.keys(t[1]).map(k => `${it(k)} (${Math.min(t[1][k], Game.inv(k))}/${t[1][k]})`).join(' · '), ok: s => Object.keys(t[1]).every(k => Game.have(k, t[1][k])) }],
    take: t[1] || undefined, loc: r === 'child' ? () => { const d = dollAt(n); return { x: d[0], z: d[1] }; } : undefined,
    done: s => t[3].map(fill), reward: t[4],
    finish(s) { G.Bond.add(n.id, 6, 'favor'); if (G.Letters) setTimeout(() => G.Letters.send(n.name, `${title(s)}께,\n어제 일은 정말 고마웠어요. 집에 와서도 계속 {t} 이야기만 했어요.\n작은 거지만 받아 주세요. — ${n.name}`.replace(/\{t\}/g, title(s)), r === 'child' ? ['flower', 1] : ['bread', 1], 'letter'), 2000); } }; }
/* the child's doll, lying in the grass */
Game.CTX.push(function (s) { if (!s.side || !s.side.act) return null; const p = P(), out = [];
  for (const q in s.side.act) { if (!q.startsWith('pf_')) continue; const id = q.slice(3), n = Game.ENT.npcs[id]; if (!n || roleOf(n) !== 'child' || (s.q.doll && s.q.doll[id])) continue; const d = dollAt(n), dd = Math.hypot(p.x - d[0], p.z - d[1]); if (dd > 1.8) continue;
    out.push({ d: dd - 0.4, label: '나무 인형 줍기', x: d[0], z: d[1], y: 0.6, key: 'doll' + id, anim: 'pick', dur: 0.9, fn: () => { (s.q.doll = s.q.doll || {})[id] = 1; sfx('pickup', { pitch: 1.3 }); G.UI.toast(`${short(n)}의 나무 인형을 찾았어요 · 돌려주러 가요`); G.UI.quest && G.UI.quest(); } }); }
  return out.length ? out : null; });
let doll = null; const DM = G.m4();
const dyn0 = EP.dyn; EP.dyn = function (list, s) { if (dyn0) dyn0.apply(this, arguments); if (!s || !s.side || !s.side.act) return; try { for (const q in s.side.act) { if (!q.startsWith('pf_')) continue; const id = q.slice(3), n = Game.ENT.npcs[id]; if (!n || roleOf(n) !== 'child' || (s.q.doll && s.q.doll[id])) continue;
    if (!doll) { const g = new G.GB(181); g.cyl(0.05, 0.07, 0.22, 8, { at: [0, 0.11, 0], c: 0xb8885a }); g.sph(0.06, 8, 6, { at: [0, 0.27, 0], c: 0xc8986a }); g.box(0.18, 0.03, 0.04, { at: [0, 0.18, 0], c: 0xa87848 }); g.box(0.13, 0.08, 0.02, { at: [0, 0.13, 0.05], c: 0x2c5a9a }); doll = G.R.mesh(g); }
    const d = dollAt(n), W = Game.W(); G.m4trs(DM, d[0], W.heightAt(d[0], d[1]), d[1], 0.4, 0, 1.4, 1.4, 1.4, 1.4); list.push({ mesh: doll, m: DM, outline: true }); } } catch (e) { } };
let t = 0;
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.bond) return r; if ((t -= (typeof dt === 'number' && dt < 1 ? dt : 1 / 60)) > 0) return r; t = 5;
  try { for (const id in s.bond) { const n = Game.ENT.npcs[id]; if (n && !n.d.animal && G.Bond.level(id).i >= 2) register(n); } } catch (e) { console.error('favors', e); } return r; };
G.Favors = { register, list: T };
})(window.G);
