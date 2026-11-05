/* 약속의 길 — 심부름꾼이 전하는 편지 (v18.26)
   옛 애굽에는 우체통이 없었어요. 대신 서기관에게 부탁해 파피루스나 깨진 도기 조각(오스트라콘)에 글을 쓰고,
   심부름꾼이나 길 가는 사람이 전해 주었어요(요셉 무렵의 농부 헤카나크트가 집안에 보낸 편지들이 지금도 남아 있어요).
   · 친해진 사람(친밀도 「아는 사이」 이상)이 가끔 아침에 편지를 보내요. 심부름하는 아이가 요셉을 찾아 달려와 건네줘요.
     「친구」부터는 작은 선물이 함께 와요(그 사람 일에 맞는 것: 빵, 생선, 양파, 진흙, 실…). 잔칫날엔 그 마을 친구가 초대장을 보내요.
   · 받은 편지는 메뉴 → 「편지」에서 다시 읽어요. 심부름꾼이 요셉을 못 찾으면(배 위, 동굴 속…) 편지함에 넣어 두고 알려 줘요.
   API: G.Letters.send(from, text, gift, kind) — 다른 이야기(동굴의 기인 등)도 편지를 보낼 수 있어요. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.UI) return;
const S = () => Game.S(), P = () => Game.P, rnd = a => a[Math.floor(Math.random() * a.length)], sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const pop = (t, s, i) => G.UI.pop ? G.UI.pop(t, s, i) : G.UI.toast(s ? t + ' · ' + s : t);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const chap = s => { const st = s.step || 'c2'; return st[0] === 'j' ? 7 : (+st[1] || 2); };
const Lt = G.Letters = {};
const box = () => { const s = S(); return (s.letters = s.letters || { list: [], cool: {}, last: -1, wait: [] }); };
const title = s => chap(s) >= 5 ? '총리님' : '요셉 님';
const short = n => (n.name || '').split(' ').pop();
// ------------------------------------------------------------------ what people write
const OPEN = ['{t}께,', '사랑하는 {t}께,', '{t}, 평안하신지요?'];
const BODY = {
  1: ['지난번에 말을 걸어 주셔서 고마웠어요. 그날 하루가 참 따뜻했어요.', '길에서 인사해 주신 것, 우리 식구들이 다 알아요. 다음에 또 들러 주세요.', '요즘 날이 덥지요? 물 많이 드세요.'],
  2: ['작은 것이지만 제가 손수 준비했어요. 받아 주시면 기쁘겠어요.', '{t} 이야기를 우리 아이들이 제일 좋아해요. 이건 아이들이 고른 거예요.', '요즘 하는 일이 잘 돼서 나누고 싶었어요.'],
  3: ['{t}을(를) 만나고 나서 마음이 많이 단단해졌어요. 정말이에요.', '우리 집에 언제든 오세요. 문은 늘 열려 있어요.', '힘든 일이 있으면 저에게도 말씀해 주세요. 저도 듣는 건 잘해요.'],
  4: ['당신은 제게 형제나 다름없어요. 이 땅에 당신을 보내신 분께 감사해요.', '아이들에게 당신 이야기를 들려줘요. 하나님이 함께하신 사람이라고요.'] };
const ROLE = { fisher: ['오늘 새벽에 큰 고기를 잡았어요! 제일 좋은 놈으로 보내요.', '강물이 곧 불어날 것 같아요. 강가에 가실 땐 조심하세요.'], baker: ['새벽에 구운 빵이에요. 아직 따뜻할 거예요!', '대추야자를 넣어 봤는데 맛이 어떤지 알려 주세요.'],
  farmer: ['밭에서 제일 잘 자란 것만 골랐어요.', '올해 농사가 잘 됐어요. 다 덕분이에요.'], potter: ['제가 빚은 그릇에 쓸 고운 진흙이에요.', '새 항아리를 구웠는데, 하나는 꼭 드리고 싶어요.'],
  weaver: ['베를 짜다 남은 실이에요. 쓸 데가 있으실 거예요.'], washer: ['세마포를 눈처럼 하얗게 빨아 두었어요.'], merchant: ['장사가 잘 돼서 조금 나눠요. 거절하지 마세요!'], trader: ['먼 길에서 구한 대추야자예요.'],
  brickmaker: ['곳간 벽돌을 다 찍었어요! 우리 벽돌이 곡식을 지켜 줄 거예요.'], porter: ['짐 나를 일이 있으면 언제든 부르세요!'], elder: ['늙은이가 아는 들풀 약초예요. 몸이 고단할 때 달여 드세요.'],
  water: ['우물물이 참 맑아졌어요. 들르시면 시원한 물 한 바가지 드릴게요.'], child: ['그림을 그렸어요! (도기 조각에 수레 탄 총리님과 말 두 마리가 그려져 있어요)', '제가 제일 아끼는 반짝이는 돌이에요. 비밀이에요!'] };
const GIFT = { fisher: ['fish', 1], baker: ['bread', 2], farmer: ['onion', 2], potter: ['clay', 3], weaver: ['thread', 2], washer: ['linen', 1], merchant: ['$', 8], trader: ['dates', 2], brickmaker: ['brick', 2], porter: ['bread', 1], elder: ['herb', 1], water: ['cucumber', 2], child: ['flower', 1] };
const CLOSE = ['평안을 빌며,', '늘 고마운 마음으로,', '다음에 또 만나요!', '건강하세요.'];
const roleOf = n => (n.d.folk && n.d.folk.role) || (/어부/.test(n.name) ? 'fisher' : /빵/.test(n.name) ? 'baker' : /농부/.test(n.name) ? 'farmer' : /아이|소년|소녀/.test(n.name) ? 'child' : /노인|장로/.test(n.name) ? 'elder' : '');
function compose(n, lv, s) { const t = title(s), r = roleOf(n), fill = x => x.replace(/\{t\}/g, t);
  const lines = [fill(rnd(OPEN)), fill(rnd(BODY[Math.min(4, Math.max(1, lv))]))]; if (lv >= 2 && ROLE[r]) lines.push(fill(rnd(ROLE[r]))); lines.push(rnd(CLOSE) + ' — ' + n.name);
  const gift = lv >= 2 ? (GIFT[r] || ['fig', 2]) : null; return { text: lines.join('\n'), gift }; }
// ------------------------------------------------------------------ the post: queue, the running child, the box
Lt.send = function (from, text, gift, kind) { const b = box(); b.wait.push({ from, text, gift: gift || null, kind: kind || 'letter', day: S().day }); };
function giveGift(g) { if (!g) return ''; const [k, n] = g; if (k === '$') { Game.silver(n); return `은 ${n}`; } if (!Game.ITEMS[k]) return ''; Game.give(k, n, true); G.UI.gain && G.UI.gain(k, n); return `${Game.ITEMS[k].n} ${n}`; }
function file(L, quiet) { const b = box(), got = giveGift(L.gift); b.list.unshift({ from: L.from, text: L.text, day: L.day, gift: got, kind: L.kind, read: !quiet }); if (b.list.length > 40) b.list.length = 40; return got; }
let runner = null; let tick = 0;
const kidLook = () => { for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.d.folk && n.d.folk.age === 'kid' && n.d.look) return n.d.look; } return undefined; };
const away = () => (G.Cave && G.Cave.inside && G.Cave.inside()) || (G.Caves && G.Caves.inside && G.Caves.inside()) || (G.Byblos && G.Byblos.inBy && G.Byblos.inBy());
function dispatch(L) { const p = P(), W = Game.W(); let x = p.x, z = p.z;
  for (const da of [Math.PI, 2.4, -2.4, 1.6, -1.6]) { const a = p.face + da, tx = p.x + Math.sin(a) * 13, tz = p.z + Math.cos(a) * 13; if (!Game.solidAt(tx, tz, 0.5) && !(W.water && W.heightAt(tx, tz) < W.water.level - 0.3)) { x = tx; z = tz; break; } }
  if (x === p.x) { const got = file(L, true); pop('편지가 왔어요', `${L.from}${got ? ' · ' + got : ''} · 메뉴 → 편지`, 'scroll'); return; }
  const id = 'mailkid'; if (Game.ENT.npcs[id]) Game.removeNPC(id);
  const n = Game.spawnNPC({ id, name: '심부름하는 아이', look: kidLook(), x, z, face: 0, scale: 0.6, noBond: true, noTalk: true, walkSp: 3.2 });
  runner = { n, L, t: 40, rt: 0 }; G.Life.bubble(id, rnd([`${title(S())}~! 편지 왔어요!`, `${title(S())}! 잠깐만요~!`, '헥헥, 편지 심부름이에요!']), 2.4); sfx('blip', { pitch: 1.4 }); }
function runTick(dt) { const r = runner; if (!r) return; const p = P(), n = Game.ENT.npcs[r.n.id || 'mailkid']; r.t -= dt;
  if (!n) { runner = null; return; } const d = Math.hypot(n.x - p.x, n.z - p.z);
  if (r.t <= 0 || away() || (G.Cine && G.Cine.on)) { const got = file(r.L, true); Game.removeNPC('mailkid'); runner = null; pop('편지가 왔어요', `${r.L.from}${got ? ' · ' + got : ''} · 메뉴 → 편지`, 'scroll'); return; }
  if (d < 1.9 && !G.UI.busy()) { n.walk = null; n.face = Math.atan2(p.x - n.x, p.z - n.z); runner = null; const L = r.L, got = file(L, false);
    const head = L.kind === 'invite' ? '잔치 초대장이에요!' : L.kind === 'kiin' ? '동굴의 할아버지가 보내셨어요! …손에서 이상한 냄새가 나요.' : `${L.from}께서 보내셨어요!`;
    G.UI.say([{ n: '심부름하는 아이', t: head }, { n: `✉ ${L.from}의 편지`, t: L.text.replace(/\n/g, ' ') }].concat(got ? [{ n: '', t: `(편지와 함께 온 선물 · ${got})` }] : []), () => {
      G.Life.bubble('mailkid', rnd(['그럼 이만~!', '또 심부름 올게요!', '안녕히 계세요!']), 2); Game.npcWalk('mailkid', n.x + (n.x - p.x) * 6, n.z + (n.z - p.z) * 6, () => Game.removeNPC('mailkid'), 3.2); setTimeout(() => { if (Game.ENT.npcs.mailkid) Game.removeNPC('mailkid'); }, 9000); });
    sfx('page'); return; }
  if ((r.rt -= dt) <= 0) { r.rt = 0.6; Game.npcWalk('mailkid', p.x, p.z, null, 3.2); } }
/* the morning post: who writes today */
function morning(s) { const b = box(); if (b.last === s.day) return; const h = s.time % 24; if (h < 6.5 || h > 18) return; b.last = s.day;
  /* a feast tonight: a friend in that village invites Joseph */
  const fe = G.Feast && G.Feast.today && G.Feast.today(); if (fe && G.Bond) { const v = (EP.villages || []).find(x => x.id === fe.v); const fr = v && v.folk.map(f => Game.ENT.npcs[f.id]).filter(n => n && G.Bond.level(n.id).i >= 1).sort((a, c) => G.Bond.get(c.id).p - G.Bond.get(a.id).p)[0];
    if (fr) { const R = G.Feast.reasons[fe.why]; Lt.send(fr.name, `${title(s)}께,\n오늘 저녁 우리 ${v.n}에서 ${R.n}가 열려요. ${R.d}예요.\n꼭 오셔서 함께 먹고 기뻐해 주세요! — ${fr.name}`, null, 'invite'); return; } }
  if (!G.Bond || Math.random() > 0.55) return; const pool = [];
  for (const id in (s.bond || {})) { const n = Game.ENT.npcs[id]; if (!n || n.d.animal || n.d.noBond) continue; const lv = G.Bond.level(id).i; if (lv < 1 || (b.cool[id] || -9) > s.day - 3) continue; for (let i = 0; i < lv; i++) pool.push([n, lv]); }
  if (!pool.length) return; const [n, lv] = rnd(pool); b.cool[n.id] = s.day; const c = compose(n, lv, s); Lt.send(n.name, c.text, c.gift, 'letter'); }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; const s = S(); if (Game.mode !== 'play' || !s || !s.flags) return r; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  try { runTick(d); if ((tick -= d) > 0) return r; tick = 2.5; if (chap(s) < 2) return r; morning(s); const b = box();
    if (!runner && b.wait.length && !G.UI.busy() && !Game.cineOn && !(G.Cine && G.Cine.on) && !(s.q && s.q.riding && P().spd > 2) && P().spd < 5) { if (away()) { if (b.wait[0].day < s.day - 1) { const L = b.wait.shift(), got = file(L, true); pop('편지가 와 있어요', `${L.from}${got ? ' · ' + got : ''} · 메뉴 → 편지`, 'scroll'); } }
      else if (Math.random() < 0.4) dispatch(b.wait.shift()); } } catch (e) { console.error('letters', e); } return r; };
const ol0 = EP.onLoad; EP.onLoad = function () { runner = null; return ol0 ? ol0.apply(this, arguments) : undefined; };
function render(body) { const b = box(), L = b.list;
  body.innerHTML = `<div class="sec">받은 편지 · ${L.length}</div><div class="ltNote">옛 애굽에는 우체통이 없었어요. 서기관이 파피루스나 깨진 도기 조각(오스트라콘)에 글을 써 주면, 심부름꾼이나 길 가는 사람이 전해 주었어요.</div>
    ${L.length ? L.map(x => `<div class="ltC ${x.kind}${x.read ? '' : ' new'}"><div class="ltH"><b>${esc(x.from)}</b><span>${x.kind === 'invite' ? '초대장 · ' : ''}여정 ${x.day}일째${x.gift ? ' · 선물: ' + esc(x.gift) : ''}</span></div><p>${esc(x.text).replace(/\n/g, '<br>')}</p></div>`).join('') : '<div class="card"><div class="t"><span>아직 받은 편지가 없어요 · 마을 사람들과 친해지면 편지가 와요</span></div></div>'}`;
  for (const x of L) x.read = true; }
(G.UI.extraTabs = G.UI.extraTabs || []).push({ k: 'letters', n: '편지', render, on: () => { const s = S(); return !!(s && s.letters && s.letters.list.length); } });
{ const css = document.createElement('style'); css.textContent = `.ltNote{font-size:11.5px;opacity:.7;margin:0 0 10px;line-height:1.5}.ltC{background:linear-gradient(#efe2c4,#e2d0a8);color:#3a2a1a;border-radius:10px;padding:9px 12px;margin-bottom:9px;box-shadow:inset 0 0 18px rgba(120,80,30,.25)}
.ltC.new{outline:2px solid var(--gold)}.ltC.invite{background:linear-gradient(#f4e0b0,#e8c88a)}.ltC.kiin{background:linear-gradient(#d8d0c0,#b8ae98)}.ltH{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12px}.ltH b{color:#6a3a1a}.ltC p{margin:6px 0 0;font-size:13px;line-height:1.55}`; document.head.appendChild(css); }
Lt.box = box;
})(window.G);
