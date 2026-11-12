/* 약속의 길 — 장 끝 「생각해 볼 질문」과 「장 다시 하기」 (v18.48)
   1) 한 장이 끝나고 다음 장으로 넘어가 조작이 돌아오면, 지난 장을 돌아보는 질문 카드가 한 장 떠요.
      본 질문은 메뉴 → 발자취 맨 아래 「생각해 볼 질문」에 모여요. (S.flags.reflect)
   2) 새 장에 들어설 때마다 그 순간의 저장을 따로 한 벌 간직해요(localStorage genesisChap_<ep>#<슬롯>).
      메뉴 → 발자취 → 「장 다시 하기」에서 그 장의 첫머리를 다른 슬롯에 꺼내 다시 할 수 있어요.
      지금 하던 진행은 건드리지 않아요(빈 슬롯이 없을 때만, 물어본 뒤 고른 슬롯에 덮어써요).
   끄기: ?chap=0 */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || /[?&]chap=0\b/.test(location.search)) return;
const S = () => Game.S(), EPo = () => Game.EP();
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* the question for the chapter just finished (index = chapter number 1…9; the epilogue has none) */
const QS = {
  joseph: [null,
    { t: '요셉은 형들이 자기를 미워하는 줄 알면서도 아버지의 심부름을 받아 먼 길을 떠났어요. 하기 어려운 심부름을 맡았던 적이 있나요? 그때 어떤 마음으로 길을 나섰나요?', ref: '창세기 37:13–14' },
    { t: '구덩이 속에서 요셉이 애걸했지만 아무도 대답하지 않았어요. 아무도 내 편이 아닌 것 같았던 때가 있나요? 그때 나는 누구를 불렀나요?', ref: '창세기 37:24 · 42:21' },
    { t: '「여호와께서 요셉과 함께하시므로 그가 형통한 자가 되어」. 종이 된 자리에서도 요셉은 맡은 일에 마음을 다했어요. 아무도 보지 않는 곳에서 옳은 쪽을 고른다는 것은 어떤 일일까요?', ref: '창세기 39:2 · 39:9' },
    { t: '술 맡은 관원장은 요셉을 기억하지 못하고 잊었어요. 그렇게 두 해가 더 흘렀지요. 기다리기만 해야 했던 시간이 있나요? 그 시간은 버려진 시간이었을까요?', ref: '창세기 40:23 · 41:1' },
    { t: '바로 앞에서 요셉은 「이는 내게 있지 아니하니이다. 하나님이 바로에게 평안한 대답을 하시리이다」라고 말했어요. 칭찬받는 자리에서 나는 무엇이라고 말하나요?', ref: '창세기 41:16' },
    { t: '요셉은 풍년의 일곱 해 동안 흉년을 준비했고, 두 아들의 이름에 「잊어버리게 하셨다」, 「창성하게 하셨다」는 고백을 담았어요. 넉넉할 때 내가 미리 해 둘 수 있는 일은 무엇일까요?', ref: '창세기 41:48 · 41:51–52' },
    { t: '온 땅에 기근이 들자 요셉은 곳간을 열었고, 각국 백성도 양식을 사려고 애굽으로 왔어요. 내가 맡은 것으로 누군가를 살릴 수 있다면, 그것은 무엇일까요?', ref: '창세기 41:56–57' },
    { t: '「당신들이 나를 이곳에 팔았으므로 근심하지 마소서, 한탄하지 마소서. 하나님이 생명을 구원하시려고 나를 당신들 앞서 보내셨나이다.」 용서한다는 것은 잊는다는 것과 같을까요?', ref: '창세기 45:5' },
    { t: '요셉은 수레를 갖추어 고센으로 올라가 아버지를 맞았고, 그 목을 안고 오래 울었어요. 오래 기다린 끝에 다시 만난 사람이 있나요? 아직 기다리는 만남이 있나요?', ref: '창세기 46:29' }]
};
const chTitle = ch => { const e = EPo(), c = e && e.chapters && e.chapters[ch - 1]; return c ? c.t : ''; };
const qOf = ch => { const s = S(), L = s && QS[s.ep]; return (L && L[ch]) || null; };
const seen = () => { const s = S(); return (s.flags.reflect = s.flags.reflect || {}); };

// ------------------------------------------------------------------ chapter snapshots
const CK = (ep, slot) => 'genesisChap_' + ep + '#' + (slot || Game.slot);
const readSnaps = (ep, slot) => { try { return JSON.parse(localStorage.getItem(CK(ep, slot)) || '{}') || {}; } catch (e) { return {}; } };
function keepSnap(ch) {
  const s = S(); if (!s) return;
  try { const raw = localStorage.getItem(Game.saveKey(s.ep)); if (!raw) return; const j = JSON.parse(raw); if (!j || j.step !== s.step) return; /* only the save made on entering this very step */
    const M = readSnaps(s.ep); M[ch] = raw; localStorage.setItem(CK(s.ep), JSON.stringify(M)); } catch (e) { /* no room: the game itself goes on unharmed */ }
}

// ------------------------------------------------------------------ hook: entering a step of a new chapter
let pend = null, calm = 0;
const go0 = Game.go;
Game.go = function (id, resume) {
  const s0 = S(), e = EPo(), before = s0 && e && e.steps[s0.step] ? e.steps[s0.step].ch || 0 : 0;
  const r = go0.apply(this, arguments);
  try { const s = S(), st = e && e.steps[id], ch = st && st.ch; if (!resume && s && ch && ch !== before && Game.mode === 'play') { keepSnap(ch); if (ch === before + 1 && before >= 1 && !seen()[before] && qOf(before)) { pend = before; calm = 0; } } } catch (err) { console.warn('chapters', err); }
  return r;
};
/* the card waits until the scenes of the new chapter are over and Joseph has stood free for a few seconds */
setInterval(() => {
  try { const s = S(); if (pend === null || !s || Game.mode !== 'play') return;
    const busy = (G.Cine && G.Cine.on) || Game.cineOn || (G.UI.busy && G.UI.busy()) || document.getElementById('helpC');
    if (busy) { calm = 0; return; } if (++calm < 5) return;
    const ch = pend, q = qOf(ch); pend = null; if (!q || seen()[ch]) return; seen()[ch] = 1;
    G.UI.narr([{ kick: '생각해 볼 질문 · ' + chTitle(ch), title: '', t: q.t, ref: q.ref }]);
  } catch (e) { pend = null; }
}, 800);

// ------------------------------------------------------------------ the menu (drawn at the bottom of 발자취)
const Ch = G.Chapters = {};
Ch.html = function () {
  const s = S(); if (!s) return ''; let h = '';
  const L = QS[s.ep] || [], sn = seen(), got = Object.keys(sn).map(Number).filter(c => L[c]).sort((a, b) => a - b);
  h += `<div class="trG">생각해 볼 질문 · ${got.length}/${L.filter(Boolean).length}</div>`;
  if (!got.length) h += `<div class="trRow"><div class="trT"><span>한 장을 마칠 때마다 질문이 하나씩 모여요.</span></div></div>`;
  for (const c of got) h += `<div class="trRow"><div class="trT"><b>${esc(chTitle(c))}</b><span>${esc(L[c].t)}</span><span style="color:var(--gold,#e5b552)">${esc(L[c].ref)}</span></div></div>`;
  const M = readSnaps(s.ep), chs = Object.keys(M).map(Number).sort((a, b) => a - b);
  h += `<div class="trG">장 다시 하기</div>`;
  if (!chs.length) h += `<div class="trRow"><div class="trT"><span>새 장에 들어설 때마다 그 첫머리가 여기에 간직돼요. 지금까지 지나온 장은 간직된 것이 없어요.</span></div></div>`;
  for (const c of chs) h += `<div class="trRow"><div class="trT"><b>${esc(chTitle(c))}</b><span>이 장의 첫머리를 다른 슬롯에 꺼내요</span></div><button class="btn sec chRe" data-ch="${c}" style="flex:none;padding:8px 12px;font-size:13px">꺼내기</button></div>`;
  return h;
};
Ch.bind = function (body) { body.querySelectorAll('.chRe').forEach(b => { b.onclick = () => Ch.ask(+b.dataset.ch); }); };
Ch.ask = function (ch) {
  const s = S(), raw = readSnaps(s.ep)[ch]; if (!raw) return;
  const slots = [1, 2, 3], free = slots.find(n => n !== Game.slot && !Game.hasSave(s.ep, n)), others = slots.filter(n => n !== Game.slot);
  const put = n => { try { localStorage.setItem(Game.saveKey(s.ep, n), raw); } catch (e) { G.UI.toast('꺼내지 못했어요 · 저장 공간이 부족해요'); return; }
    G.UI.say([{ n: '', t: `슬롯 ${n}에 「${chTitle(ch)}」의 첫머리를 꺼냈어요. 제목 화면 → 이어하기 → 슬롯 ${n}에서 다시 할 수 있어요. 지금 하던 진행(슬롯 ${Game.slot})은 그대로 있어요.` }]); };
  if (G.UI.closePanel) G.UI.closePanel();
  setTimeout(() => {
    if (free) { G.UI.say([{ n: '', t: `「${chTitle(ch)}」의 첫머리를 빈 슬롯 ${free}에 꺼낼까요?`, choices: [{ t: `슬롯 ${free}에 꺼내기`, then: () => setTimeout(() => put(free), 60) }, { t: '그만두기' }] }]); return; }
    G.UI.say([{ n: '', t: `빈 슬롯이 없어요. 어느 슬롯에 덮어쓸까요? 그 슬롯에 있던 진행은 사라져요. (지금 하고 있는 슬롯은 고를 수 없어요)`, choices: others.map(n => ({ t: `슬롯 ${n}에 덮어쓰기`, then: () => setTimeout(() => put(n), 60) })).concat([{ t: '그만두기' }]) }]);
  }, 80);
};
})(window.G);
