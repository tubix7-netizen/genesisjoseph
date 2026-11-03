/* 약속의 길 — 팝업 알림 (v18.21)
   · G.UI.pop(제목, 한 줄, 아이콘): 작은 일 하나도 짧고 화려하게 — 가운데 위쪽에 빛나는 카드가 톡 튀어나왔다가 1.6초 뒤 사라져요.
     여러 개가 한꺼번에 오면 차례로.
   · G.UI.help(키, 제목, 한 줄): 처음 해 보는 일에 한 번만 뜨는 도움말 카드(「처음이에요」). 화면을 누르면 닫혀요.
     예전 UI.tipOnce(키, 문구)도 이 카드로 보여요. */
'use strict';
(function (G) {
const UI = G.UI, Game = G.Game, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const css = document.createElement('style'); css.textContent = `
#popBox{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:240;pointer-events:none;display:flex;flex-direction:column;align-items:center}
.popC{display:flex;align-items:center;gap:12px;min-width:200px;max-width:min(86vw,360px);padding:12px 18px 12px 14px;border-radius:18px;color:#fff6dc;
  background:linear-gradient(135deg,rgba(60,40,12,.94),rgba(24,18,40,.94));border:1.5px solid #f0c860;box-shadow:0 0 0 3px rgba(240,200,96,.18),0 10px 30px rgba(0,0,0,.45),0 0 26px rgba(255,210,110,.45);
  animation:popIn .42s cubic-bezier(.2,1.6,.4,1) both;position:relative;overflow:hidden}
.popC.out{animation:popOut .35s ease-in both}
.popC::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.35) 50%,transparent 65%);transform:translateX(-120%);animation:popShine 1.1s .25s ease-out}
.popC .pi{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#ffe7a0,#c8902a);box-shadow:0 0 14px rgba(255,220,120,.8)}
.popC .pi svg{width:24px;height:24px}.popC b{display:block;font-size:17px;font-weight:800;letter-spacing:.01em;text-shadow:0 1px 6px rgba(0,0,0,.4)}.popC span{display:block;font-size:12.5px;opacity:.85;margin-top:2px}
.popC i.sp{position:absolute;width:6px;height:6px;border-radius:50%;background:#ffe9a0;box-shadow:0 0 8px #ffd860;animation:popSp .9s ease-out both}
@keyframes popIn{0%{opacity:0;transform:translateY(-14px) scale(.6)}100%{opacity:1;transform:none}}@keyframes popOut{to{opacity:0;transform:translateY(-10px) scale(.92)}}
@keyframes popShine{to{transform:translateX(120%)}}@keyframes popSp{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
#helpC{position:fixed;inset:0;z-index:245;display:flex;align-items:center;justify-content:center;background:rgba(6,8,16,.45);animation:popFade .25s both}
#helpC .hc{max-width:min(84vw,340px);padding:18px 20px 14px;border-radius:20px;text-align:center;color:#f4ecd8;background:linear-gradient(160deg,#2a2440,#141a30);border:1.5px solid #8ab0ff;box-shadow:0 0 28px rgba(120,170,255,.45);animation:popIn .4s cubic-bezier(.2,1.5,.4,1) both}
#helpC small{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;color:#9ac0ff;margin-bottom:6px}#helpC b{display:block;font-size:18px;margin-bottom:6px}#helpC p{margin:0;font-size:13.5px;line-height:1.5;opacity:.92}#helpC .ok{margin-top:12px;font-size:12px;opacity:.6}
@keyframes popFade{from{opacity:0}}`;
document.head.appendChild(css);
const box = document.createElement('div'); box.id = 'popBox'; document.body.appendChild(box);
const q = []; let busy = false;
UI.pop = function (t, sub, ic) { q.push([t, sub, ic]); if (!busy) next(); };
function next() { const it = q.shift(); if (!it) { busy = false; return; } busy = true; const [t, sub, ic] = it;
  const c = document.createElement('div'); c.className = 'popC'; c.innerHTML = `<div class="pi">${UI.icon(ic || 'star', '#5a3a10')}</div><div><b></b>${sub ? '<span></span>' : ''}</div>`;
  c.querySelector('b').textContent = t; if (sub) c.querySelector('span').textContent = sub;
  for (let i = 0; i < 9; i++) { const s = document.createElement('i'); s.className = 'sp'; const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 60; s.style.left = '30px'; s.style.top = '30px'; s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px'); s.style.animationDelay = (Math.random() * 0.15) + 's'; c.appendChild(s); }
  box.appendChild(c); sfx('levelup', { vol: 0.32, pitch: 1.5 });
  setTimeout(() => { c.classList.add('out'); setTimeout(() => { c.remove(); next(); }, 330); }, q.length ? 1100 : 1650); }
// first-time help: one card, once per save
UI.help = function (key, t, line) { const S = Game.S(); if (!S) return false; const f = S.flags.tips = S.flags.tips || {}; if (f[key]) return false; f[key] = 1;
  const el = document.createElement('div'); el.id = 'helpC'; el.innerHTML = `<div class="hc"><small>처음이에요</small><b></b><p></p><div class="ok">눌러서 닫기</div></div>`; el.querySelector('b').textContent = t; el.querySelector('p').textContent = line;
  const close = () => { el.remove(); UI.setBusy('help', false); }; el.addEventListener('pointerdown', e => { e.preventDefault(); close(); }); document.body.appendChild(el); UI.setBusy('help', true); sfx('insight', { vol: 0.4, pitch: 1.2 }); setTimeout(() => { if (el.isConnected) close(); }, 7000); return true; };
// the old one-time tips now use the help card (first sentence = title, the rest = the line)
UI.tipOnce = function (key, m) { const s = String(m), i = s.indexOf(' · '); return UI.help(key, i > 0 ? s.slice(0, i) : '도움말', i > 0 ? s.slice(i + 3) : s); };
})(window.G);
