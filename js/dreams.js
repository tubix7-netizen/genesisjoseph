/* 약속의 길 — 꿈 앨범 (v18.26)
   요셉 이야기의 꿈들을 그림 카드로 모아 다시 보는 곳 (메뉴 → 「꿈 앨범」).
   이야기가 그 꿈에 닿으면 카드가 열려요: 그림 · 꿈 내용 · 풀이 · 성경 구절 · 요셉의 마음.
   요셉의 곡식 단 · 해와 달과 열한 별 · 술 맡은 관원의 포도나무 · 떡 굽는 관원의 광주리 · 바로의 일곱 소 · 바로의 일곱 이삭
   + 아버지 야곱의 사다리 꿈(고센에서 아버지와 저녁 이야기를 나누면). */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP || !G.UI) return;
const S = () => Game.S();
const after = k => { const s = S(), o = Game.stepOrder ? Game.stepOrder() : []; if (!s) return false; const i = o.indexOf(s.step), j = o.indexOf(k); return i >= 0 && j >= 0 && i > j; };
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SV = (sky, body) => `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="180" fill="${sky}"/>${body}</svg>`;
const stars = (n, sd) => { let s = '', r = sd; for (let i = 0; i < n; i++) { r = (r * 16807) % 2147483647; const x = r % 320; r = (r * 16807) % 2147483647; const y = r % 110; s += `<circle cx="${x}" cy="${y}" r="${0.6 + (r % 10) / 9}" fill="#fff6dc" opacity=".8"/>`; } return s; };
const sheaf = (x, y, s, c, tilt) => `<g transform="translate(${x} ${y}) rotate(${tilt || 0}) scale(${s})"><path d="M-9 0 L-3 -46 L3 -46 L9 0 Z" fill="${c}"/><path d="M-12 -38 Q0 -60 12 -38" stroke="${c}" stroke-width="5" fill="none"/><rect x="-10" y="-22" width="20" height="5" fill="#8a6a30"/></g>`;
const cow = (x, y, fat, c) => fat ? `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="17" ry="11" fill="${c}"/><circle cx="17" cy="-6" r="6" fill="${c}"/><rect x="-12" y="7" width="4" height="12" fill="${c}"/><rect x="8" y="7" width="4" height="12" fill="${c}"/></g>`
  : `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="15" ry="5" fill="${c}"/><circle cx="15" cy="-5" r="4.5" fill="${c}"/><rect x="-10" y="3" width="2.5" height="16" fill="${c}"/><rect x="8" y="3" width="2.5" height="16" fill="${c}"/><path d="M-8 -3 L-4 3 M-2 -3 L2 3 M4 -3 L8 3" stroke="#3a2a20" stroke-width="1"/></g>`;
const ear = (x, y, full) => full ? `<g transform="translate(${x} ${y})"><path d="M0 0 L0 -50" stroke="#a88a30" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map(i => `<ellipse cx="${i % 2 ? 4 : -4}" cy="${-48 + i * 6}" rx="4" ry="6" fill="#e8c048"/>`).join('')}</g>`
  : `<g transform="translate(${x} ${y})"><path d="M0 0 Q3 -25 -4 -46" stroke="#8a7a50" stroke-width="1.5" fill="none"/>${[0, 1, 2].map(i => `<ellipse cx="${-3 + i}" cy="${-44 + i * 7}" rx="2" ry="4" fill="#9a8a5a"/>`).join('')}</g>`;
const DREAMS = [
  { id: 'sheaves', t: '요셉의 곡식 단', ref: '창세기 37:5–8', open: () => true,
    art: SV('#e9d49a', `<rect y="128" width="320" height="52" fill="#c8a858"/>${sheaf(160, 140, 1.25, '#f0c640')}${[60, 95, 225, 260, 40, 280].map((x, i) => sheaf(x, 150 + (i % 2) * 6, 0.85, '#d8a838', x < 160 ? 18 : -18)).join('')}<circle cx="160" cy="40" r="14" fill="#fff2c0" opacity=".7"/>`),
    dream: '밭에서 형들과 곡식 단을 묶는데, 요셉의 단이 일어나 우뚝 서고 형들의 단들이 둘러서서 절을 했어요.',
    mean: '형들은 "네가 우리 왕이 되겠다는 거냐?" 하며 요셉을 더 미워했어요. 이 꿈은 오랜 세월이 지나 형들이 곡식을 사러 애굽에 와서 요셉에게 절할 때 이루어져요(창 42:6).',
    heart: '그때는 자랑처럼 들렸을 꿈. 하지만 하나님은 그 꿈을 온 집안을 살리는 길로 바꾸셨어요.' },
  { id: 'stars', t: '해와 달과 열한 별', ref: '창세기 37:9–11', open: () => true,
    art: SV('#141a3c', `${stars(40, 7)}<circle cx="70" cy="60" r="22" fill="#ffd060"/><path d="M240 40 a22 22 0 1 0 14 40 a17 17 0 1 1 -14 -40" fill="#f4ecd0"/>${Array.from({ length: 11 }, (_, i) => `<path transform="translate(${50 + i * 22} ${120 + (i % 2) * 10}) scale(.7)" d="M0 -10 L3 -3 L10 -3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10 -3 L-3 -3 Z" fill="#fff0a0"/>`).join('')}<rect x="150" y="150" width="20" height="30" fill="#8a3a2a"/>`),
    dream: '해와 달과 열한 별이 요셉에게 절하는 꿈이었어요.',
    mean: '아버지 야곱은 "나와 네 어머니와 네 형들이 네게 절하겠느냐?" 하고 꾸짖었지만, 그 말을 마음에 간직해 두었어요(창 37:11).',
    heart: '아버지는 꾸짖으면서도 잊지 않으셨어요. 꿈은 하나님이 품고 계신 약속이었어요.' },
  { id: 'vine', t: '술 맡은 관원의 포도나무', ref: '창세기 40:9–13', open: () => after('c3_dreams'),
    art: SV('#3a2a3a', `<path d="M160 180 C150 130 175 110 160 60" stroke="#5a3a20" stroke-width="8" fill="none"/>${[[120, 80], [200, 70], [165, 45]].map(([x, y]) => `<path d="M160 100 Q${(x + 160) / 2} ${y - 10} ${x} ${y}" stroke="#5a3a20" stroke-width="4" fill="none"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${x + (i % 3) * 7 - 7}" cy="${y + 6 + Math.floor(i / 3) * 7}" r="4.5" fill="#7a2a7a"/>`).join('')}`).join('')}<path d="M240 140 L260 140 L256 170 L244 170 Z" fill="#e0b040"/>`),
    dream: '포도나무에 가지 셋이 있는데, 싹이 나고 꽃이 피고 포도가 익었어요. 그 포도를 짜서 바로의 잔에 드렸어요.',
    mean: '요셉의 풀이: 가지 셋은 사흘. 사흘 안에 바로가 당신을 다시 그 자리에 세울 거예요. 정말 사흘 뒤 그대로 되었어요.',
    heart: '"그 풀이는 하나님께 있지 아니하니이까" — 요셉은 감옥에서도 꿈의 주인이 하나님이심을 잊지 않았어요.' },
  { id: 'baskets', t: '떡 굽는 관원의 광주리', ref: '창세기 40:16–19', open: () => after('c3_dreams'),
    art: SV('#4a3a2a', `<ellipse cx="160" cy="150" rx="26" ry="10" fill="#c8a070"/>${[0, 1, 2].map(i => `<rect x="${124}" y="${48 + i * 22}" width="72" height="18" rx="5" fill="${i ? '#e8dcc0' : '#f8f0e0'}" stroke="#8a6a40"/>`).join('')}${[[120, 30], [200, 36], [175, 20]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M-10 0 L0 -5 L10 0 L0 2 Z" fill="#1a1a1a"/>`).join('')}`),
    dream: '머리에 흰 떡 세 광주리를 이고 있는데, 맨 위 광주리의 구운 음식을 새들이 와서 먹었어요.',
    mean: '요셉은 듣기 힘든 풀이도 숨기지 않고 정직하게 말했어요. 사흘 뒤, 요셉의 말 그대로 되었어요.',
    heart: '좋은 말만 하고 싶은 마음을 이기고, 받은 그대로 전한 정직한 마음.' },
  { id: 'cows', t: '바로의 일곱 소', ref: '창세기 41:1–4', open: () => after('c4_court'),
    art: SV('#e8c890', `<rect y="110" width="320" height="70" fill="#5a8ab0"/><rect y="104" width="320" height="10" fill="#7a9a50"/>${[30, 70, 110, 150].map(x => cow(x, 90, true, '#c87a3a')).join('')}${[190, 230, 270, 300].map(x => cow(x, 92, false, '#6a5a4a')).join('')}`),
    dream: '나일 강에서 살지고 아름다운 소 일곱이 올라와 풀을 뜯는데, 뒤이어 흉하고 마른 소 일곱이 올라와 살진 소들을 먹어 버렸어요. 그래도 여전히 말랐어요.',
    mean: '요셉의 풀이: 일곱 해 큰 풍년 뒤에 일곱 해 흉년이 온다. 그러니 풍년 동안 곡식을 거두어 쌓아 두어야 해요.',
    heart: '"내가 아니라 하나님께서 바로에게 평안한 대답을 주시리이다" (창 41:16)' },
  { id: 'ears', t: '바로의 일곱 이삭', ref: '창세기 41:5–7', open: () => after('c4_court'),
    art: SV('#f0dcaa', `<rect y="140" width="320" height="40" fill="#b89a58"/>${[40, 65, 90, 115, 140, 160, 185].map(x => ear(x, 150, true)).join('')}${[210, 228, 246, 264, 282, 296, 310].map(x => ear(x, 150, false)).join('')}<path d="M320 60 Q260 70 200 50" stroke="#d8a060" stroke-width="3" fill="none" opacity=".6"/>`),
    dream: '한 줄기에 무성하고 충실한 이삭 일곱이 나오더니, 뒤이어 동풍에 마른 이삭 일곱이 나와 충실한 이삭을 삼켜 버렸어요.',
    mean: '두 꿈은 하나예요. 하나님이 이 일을 정하셨고 속히 이루실 거라 두 번 보여 주신 거예요(창 41:32).',
    heart: '꿈을 풀어 준 요셉은 지혜롭게 준비할 길까지 함께 말했어요. 믿음은 앞날을 대비하는 손길이 되었어요.' },
  { id: 'ladder', t: '아버지 야곱의 사다리', ref: '창세기 28:12–15', open: () => { const s = S(); return !!(s && s.side && s.side.done && s.side.done.g_story !== undefined); },
    art: SV('#0e1430', `${stars(50, 31)}<path d="M130 180 L180 10 M160 180 L210 10" stroke="#e8d8a0" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => { const y = 170 - i * 14, k = (180 - y) / 170 * 50; return `<path d="M${130 + k} ${y} L${160 + k} ${y}" stroke="#e8d8a0" stroke-width="2"/>`; }).join('')}<circle cx="190" cy="14" r="30" fill="#fff6c0" opacity=".25"/><ellipse cx="90" cy="168" rx="30" ry="8" fill="#5a4a3a"/>`),
    dream: '아버지 야곱이 벧엘에서 돌베개를 베고 잘 때, 땅에서 하늘까지 닿은 사다리 위로 천사들이 오르내렸어요.',
    mean: '하나님은 "내가 너와 함께 있어 네가 어디로 가든지 너를 지키리라" 약속하셨어요. 그 약속은 요셉에게도 이루어졌어요.',
    heart: '아버지의 하나님이 요셉의 하나님이 되셨어요. 꿈은 대를 이어 이어지는 약속이었어요.' },
];
const seen = () => { const s = S(); return (s.flags.dreamsSeen = s.flags.dreamsSeen || {}); };
/* v18.33 a grid of pictures; tap one to open it, 「목록으로」 to go back (no long scrolling) */
let sel = null;
function render(body, re) { const sn = seen(); const open = DREAMS.filter(d => d.open()); open.forEach(d => sn[d.id] = 1);
  const d = sel && DREAMS.find(x => x.id === sel && x.open());
  if (d) { body.innerHTML = `<div class="dreamV"><button class="sbtn dBack">◀ 목록으로</button><div class="dArt">${d.art}</div><b>${esc(d.t)}</b><i>${esc(d.ref)}</i><p>${esc(d.dream)}</p><p class="dM"><span>풀이</span>${esc(d.mean)}</p><p class="dH">${esc(d.heart)}</p></div>`;
    body.querySelector('.dBack').onclick = () => { sel = null; re ? re() : render(body); }; return; }
  body.innerHTML = `<div class="sec">꿈 앨범 · ${open.length}/${DREAMS.length} · 그림을 눌러 보세요</div><div class="dreamG">${DREAMS.map(x => x.open() ? `<button class="dCard" data-d="${x.id}"><div class="dArt">${x.art}</div><b>${esc(x.t)}</b></button>` : `<div class="dCard lock"><div class="dArt"><svg viewBox="0 0 320 180"><rect width="320" height="180" fill="#1a1a24"/><text x="160" y="110" fill="#5a5a6a" font-size="56" text-anchor="middle">?</text></svg></div><b>아직 꾸지 않은 꿈</b></div>`).join('')}</div>`;
  body.querySelectorAll('.dCard[data-d]').forEach(b => b.onclick = () => { sel = b.dataset.d; G.Audio && G.Audio.sfx('page', { vol: 0.6 }); re ? re() : render(body); }); }
(G.UI.extraTabs = G.UI.extraTabs || []).push({ k: 'dreams', n: '꿈 앨범', render });
{ const css = document.createElement('style'); css.textContent = `.dreamG{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}.dCard{display:flex;flex-direction:column;gap:5px;padding:6px;border-radius:12px;background:var(--panel2);border:1px solid rgba(229,181,82,.22);color:inherit;font:inherit;text-align:center;cursor:pointer}.dCard svg{width:100%;height:auto;border-radius:8px;display:block}.dCard b{font-size:12.5px;color:var(--gold)}.dCard.lock{opacity:.55;cursor:default}.dCard.lock b{color:inherit}
.dreamV{display:flex;flex-direction:column;gap:6px}.dreamV .dBack{align-self:flex-start}.dreamV svg{width:100%;max-width:420px;height:auto;border-radius:10px;display:block;margin:0 auto}.dreamV b{font-size:16px;color:var(--gold)}.dreamV i{font-size:11px;opacity:.7}.dreamV p{margin:2px 0;font-size:13px;line-height:1.55}.dreamV .dM span{display:inline-block;background:rgba(229,181,82,.2);border-radius:6px;padding:0 6px;margin-right:6px;font-size:11px}.dreamV .dH{opacity:.85;font-style:italic}
.dreamL{display:flex;flex-direction:column;gap:12px}.dreamC{display:flex;gap:10px;background:var(--panel2);border:1px solid rgba(229,181,82,.22);border-radius:12px;padding:8px;flex-wrap:wrap}
.dreamC .dArt{flex:1 1 220px;max-width:340px}.dreamC .dArt svg{width:100%;height:auto;border-radius:8px;display:block}.dreamC .dTx{flex:1 1 200px;min-width:0}.dreamC b{font-size:15px;color:var(--gold)}.dreamC i{display:block;font-size:11px;opacity:.7;margin:2px 0 6px}
.dreamC p{margin:4px 0;font-size:12.5px;line-height:1.5}.dreamC .dM span{display:inline-block;background:rgba(229,181,82,.2);border-radius:6px;padding:0 6px;margin-right:6px;font-size:11px}.dreamC .dH{opacity:.85;font-style:italic}.dreamC.lock{opacity:.6}`; document.head.appendChild(css); }
/* a dream newly opened: tell once */
let chk = 0; const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode !== 'play' || !S()) return r; chk -= (typeof dt === 'number' && dt < 1 ? dt : 1 / 60); if (chk > 0) return r; chk = 2;
  try { const s = S(), told = (s.flags.dreamsTold = s.flags.dreamsTold || {}); for (const d of DREAMS) if (d.open() && !told[d.id]) { told[d.id] = 1; if (d.id !== 'sheaves' && d.id !== 'stars' && !(G.Cine && G.Cine.on) && !G.UI.busy()) { G.UI.pop && G.UI.pop('꿈 앨범에 새 그림', `「${d.t}」 · 메뉴 → 꿈 앨범`, 'star'); break; } } } catch (e) { console.error('dreams', e); } return r; };
G.Dreams = { list: DREAMS, render };
})(window.G);
