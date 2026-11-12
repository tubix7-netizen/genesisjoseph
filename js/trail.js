/* 약속의 길 — 발자취 (v18.48)
   메뉴 → 「발자취」: 이 게임 곳곳에 흩어져 있는 즐길 거리를 한 장에 모아, 어디서 하는지와 얼마나 했는지를 보여 줘요.
   새로 저장하는 것은 S.flags.trail(이미 알린 목표) 하나뿐이고, 나머지는 다른 모듈이 저장해 둔 기록을 읽기만 해요.
   목표 하나를 이루면 「발자취」 알림이 한 번 떠요. 한 묶음을 다 이루면 깨달음 1, 모두 이루면 맺는 카드가 떠요. 끄기: ?trail=0 */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || /[?&]trail=0\b/.test(location.search)) return;
const S = () => Game.S();
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cnt = o => !o ? 0 : Array.isArray(o) ? o.length : typeof o === 'object' ? Object.keys(o).filter(k => o[k]).length : +o || 0;
const fl = s => (s && s.flags) || {}, ex = s => fl(s).ex || {};
const reached = id => { const o = Game.stepOrder(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(id); };
const friends = s => { const b = (s && s.bond) || {}; let n = 0; for (const id in b) { try { if (G.Bond && G.Bond.level(id).i >= 2) n++; } catch (e) {} } return n; };

/* each goal: id · 이름 · 어디서/어떻게 · 지금 값 · 목표 값 · (언제부터 보이는지) */
const GROUPS = [
  { t: '사람들', list: [
    { id: 'sy10', n: '열 사람의 사연', h: '처음 만난 사람에게 말을 걸거나 「안부 묻기」', v: s => cnt(fl(s).sy), max: 10 },
    { id: 'sy40', n: '마흔 사람의 사연', h: '마을마다 사는 사람이 달라요', v: s => cnt(fl(s).sy), max: 40 },
    { id: 'friend5', n: '마음을 연 벗 다섯', h: '안부를 묻고 선물을 건네면 가까워져요', v: friends, max: 5 },
    { id: 'kind10', n: '열 번의 친절', h: '부탁을 들어주고 어려운 이를 도와요', v: s => (s.stats && s.stats.kind) || 0, max: 10 },
    { id: 'vl3', n: '세 마을의 내력', h: '「이 마을은 어떤 곳이에요?」 하고 물어요', v: s => cnt(fl(s).vlSeen), max: 3 },
    { id: 'letter3', n: '편지 세 통', h: '친해진 사람들이 편지를 보내와요', v: s => cnt(s.letters && s.letters.list), max: 3, on: () => reached('c2_arrive') }] },
  { t: '애굽 살이', on: () => reached('c2_arrive'), list: [
    { id: 'words', n: '애굽 말 열두 마디', h: '애굽 사람들과 이야기하다 보면 한 마디씩 배워요', v: s => cnt(ex(s).words), max: 12 },
    { id: 'glyph', n: '그림 글자 일곱 자', h: '애굽 집에 들어가 집주인에게 배워요', v: s => cnt(fl(s).glyphs), max: 7 },
    { id: 'senet1', n: '세넷 첫 승', h: '세넷 판이 있는 집에서 집주인과 한 판', v: s => fl(s).senetW || 0, max: 1 },
    { id: 'senet5', n: '세넷 다섯 판 승리', h: '하루의 첫 판은 정신력도 채워 줘요', v: s => fl(s).senetW || 0, max: 5 },
    { id: 'photo', n: '티티의 그림 다섯 장', h: '그림 그리는 아이 티티의 부탁 · 사진 모드 「찍기」', v: s => cnt(ex(s).photo), max: 5 }] },
  { t: '들과 하늘', list: [
    { id: 'stars', n: '별자리 다섯', h: '밤에 ✦ 단추로 별을 이어요', v: s => cnt(ex(s).stars), max: 5, on: () => reached('p_night') },
    { id: 'beast', n: '전설의 짐승 다섯', h: '가나안에 둘, 애굽에 셋 · 금빛으로 반짝여요', v: s => cnt(ex(s).tro), max: 5 },
    { id: 'chest5', n: '숨은 상자 다섯', h: '외진 곳의 궤짝과 항아리를 열어 봐요', v: s => (s.stats && s.stats.chests) || 0, max: 5 }] },
  { t: '총리의 나날', on: () => reached('c5_patrol'), list: [
    { id: 'veh', n: '내 수레', h: '마구간지기 케티에게 수레를 마련해요', v: s => cnt(fl(s).vehOwn), max: 1 },
    { id: 'host3', n: '만찬 세 번', h: '이틀에 한 번 총리의 집에 손님이 와요', v: s => ex(s).host || 0, max: 3 },
    { id: 'hide3', n: '숨바꼭질 세 번', h: '므낫세가 집 둘레 어딘가에 숨어 있어요', v: s => ex(s).hide || 0, max: 3 },
    { id: 'patrol', n: '수레 순찰 기록', h: '도성 우물에서 세 곳간을 돌아오기', v: s => ex(s).patrolBest ? 1 : 0, max: 1 },
    { id: 'byblos3', n: '그발과 세 번 교역', h: '곡식 자루를 백향목으로 바꿔 와요', v: s => fl(s).byTradeN || 0, max: 3 }] },
  { t: '꿈', list: [
    { id: 'album', n: '꿈 앨범 일곱 장', h: '이야기를 따라가면 그림이 하나씩 열려요', v: s => cnt(fl(s).dreamsTold), max: 7 },
    { id: 'verse', n: '약속의 집 일곱 채', h: '꿈의 세계 돌 고리 둘레 · 문 두드리기', v: s => cnt(fl(s).dVerse), max: 7, on: s => !!(fl(s).dream || fl(s).dSeen || cnt(fl(s).dVerse)) },
    { id: 'shard', n: '별빛 조각 일곱', h: '꿈의 세계에서 천사의 부탁을 받아요', v: s => cnt(fl(s).dShards), max: 7, on: s => !!(fl(s).dream || fl(s).dSeen || cnt(fl(s).dShards)) }] }];

const val = (g, s) => { try { return Math.max(0, Math.min(g.max, Math.floor(+g.v(s) || 0))); } catch (e) { return 0; } };
const shown = (x, s) => { try { return !x.on || !!x.on(s); } catch (e) { return false; } };
const all = s => { const out = []; for (const gr of GROUPS) if (shown(gr, s)) for (const g of gr.list) if (shown(g, s)) out.push(g); return out; };

const Tr = G.Trail = { GROUPS };
Tr.summary = function () { const s = S(); if (!s) return { done: 0, total: 0 }; const L = all(s); return { done: L.filter(g => val(g, s) >= g.max).length, total: L.length }; };

function render(body) {
  const s = S(); if (!s) { body.innerHTML = ''; return; }
  const sm = Tr.summary();
  let h = `<div class="sec">발자취 · ${sm.done}/${sm.total} · 이야기 밖에서 해 볼 만한 일들</div>`;
  for (const gr of GROUPS) { if (!shown(gr, s)) continue; const L = gr.list.filter(g => shown(g, s)); if (!L.length) continue;
    h += `<div class="trG">${esc(gr.t)}</div>`;
    for (const g of L) { const v = val(g, s), ok = v >= g.max;
      h += `<div class="trRow${ok ? ' ok' : ''}"><div class="trT"><b>${ok ? '✓ ' : ''}${esc(g.n)}</b><span>${esc(g.h)}</span></div><div class="trN">${g.max > 1 ? v + '/' + g.max : ok ? '이룸' : '—'}</div><i style="width:${Math.round(v / g.max * 100)}%"></i></div>`; } }
  if (sm.total && sm.done >= sm.total) h += `<div class="trRow ok"><div class="trT"><b>✓ 발자취를 모두 채웠어요</b><span>「당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사 오늘과 같이 만민의 생명을 구원하게 하시려 하셨나니」 · 창세기 50:20</span></div></div>`;
  else h += `<div class="trRow"><div class="trT"><span>한 묶음을 다 이루면 깨달음 1을 얻어요.</span></div></div>`;
  if (G.Chapters) { try { h += G.Chapters.html(); } catch (e) { } }
  body.innerHTML = h; if (G.Chapters) G.Chapters.bind(body);
}
{ const css = document.createElement('style'); css.textContent = '.trG{flex:none;margin:14px 2px 6px;font-size:13px;font-weight:700;color:var(--gold-hi,#f7dd98)}.trRow{position:relative;display:flex;align-items:center;gap:10px;padding:10px 12px 12px;margin-bottom:6px;border-radius:12px;background:rgba(0,0,0,.2);border:1px solid var(--line,rgba(229,181,82,.38));overflow:hidden;flex:none}.trRow .trT{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.trRow b{font-size:14px;color:var(--sand,#f4e8cc)}.trRow span{font-size:12px;line-height:1.4;color:var(--muted,rgba(244,232,204,.68))}.trRow .trN{font-size:13px;font-weight:700;color:var(--gold,#e5b552);white-space:nowrap}.trRow i{position:absolute;left:0;bottom:0;height:3px;background:var(--gold,#e5b552);opacity:.75}.trRow.ok{border-color:rgba(127,191,106,.6)}.trRow.ok b,.trRow.ok .trN{color:var(--leaf,#7fbf6a)}.trRow.ok i{background:var(--leaf,#7fbf6a)}'; document.head.appendChild(css); }
(G.UI.extraTabs = G.UI.extraTabs || []).push({ k: 'trail', n: '발자취', render });

/* a goal reached: one notice (never in a scene, a talk or a panel; the first look at an old save marks what is already done without a row of notices) */
Tr.check = function () {
  const s = S(); if (!s || Game.mode !== 'play' || !s.flags) return;
  if ((G.Cine && G.Cine.on) || Game.cineOn || (G.UI.busy && G.UI.busy())) return;
  const first = !s.flags.trail, T = s.flags.trail || (s.flags.trail = {});
  for (const g of all(s)) { if (T[g.id] || val(g, s) < g.max) continue; T[g.id] = 1; if (first) continue;
    if (G.UI.pop) G.UI.pop('발자취 · ' + g.n, '메뉴 → 발자취', 'star'); if (G.Audio) G.Audio.sfx('insight', { vol: 0.4 }); if (G.UI.quest) G.UI.quest(); return; }
  /* a whole group done → 깨달음 1 (once); all of them → a closing card (once). An old save that already had a group done gets its reward too. */
  for (let i = 0; i < GROUPS.length; i++) { const gr = GROUPS[i], k = '_g' + i; if (T[k] || !shown(gr, s)) continue; const L = gr.list.filter(g => shown(g, s)); if (L.length < gr.list.length || !L.every(g => val(g, s) >= g.max)) continue;
    T[k] = 1; if (Game.insight) Game.insight(1, '발자취 · ' + gr.t); if (G.UI.pop) G.UI.pop('발자취 「' + gr.t + '」을 다 이뤘어요', '깨달음 +1', 'star'); return; }
  if (!T._all && GROUPS.every((gr, i) => T['_g' + i])) { T._all = 1; if (G.UI.quest) G.UI.quest();
    if (G.UI.narr) G.UI.narr([{ kick: '발자취', title: '걸어온 길을 모두 채웠어요', t: '구덩이에서 궁까지, 요셉이 걸은 길 어디에도 하나님이 계시지 않은 곳은 없었습니다. 「당신들은 나를 해하려 하였으나 하나님은 그것을 선으로 바꾸사 오늘과 같이 만민의 생명을 구원하게 하시려 하셨나니」', ref: '창세기 50:20' }]); }
};
setInterval(() => { try { Tr.check(); } catch (e) {} }, 2500);
})(window.G);
