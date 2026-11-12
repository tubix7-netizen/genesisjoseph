/* 약속의 길 — v18.47 장면 연출 (모션 그래픽).
   컷신과 이야기 카드에 움직이는 그림을 얹어요. 3D는 건드리지 않고 화면 위에 가볍게(transform·opacity만) 그려서 폰에서도 부담이 없어요.
   · 컷신: 화면 가장자리를 떠다니는 빛 번짐 두 줄기, 느리게 떠오르는 빛 먼지, 은은한 테두리 그늘.
   · 장 제목: 금빛 선이 가운데서 양쪽으로 그어지고, 제목 글자에 빛이 한 번 쓸고 지나가요.
   · 자막: 새 줄마다 아래에서 살짝 떠오르며 또렷해져요. 말하는 사람 이름표는 옆에서 미끄러져 들어와요.
   · 이야기 카드(성경 구절): 카드가 빛 속에서 펼쳐지고, 별빛이 뒤에서 천천히 돌아요.
   주소에 ?fx=0 을 붙이면 꺼져요. */
'use strict';
(function (G) {
if (/[?&]fx=0/.test(location.search)) return;
const css = document.createElement('style'); css.textContent = `
#cineFx{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;opacity:0;transition:opacity 1.2s ease}
body.cine #cineFx{opacity:1}
#cineFx .leak{position:absolute;width:150vmax;height:150vmax;left:50%;top:50%;margin:-75vmax 0 0 -75vmax;border-radius:50%;will-change:transform}
#cineFx .leak.a{background:radial-gradient(circle at 22% 24%,rgba(255,214,140,.2) 0,rgba(255,190,120,.08) 16%,rgba(255,190,120,0) 34%);animation:cfLeakA 26s ease-in-out infinite alternate}
#cineFx .leak.b{background:radial-gradient(circle at 80% 74%,rgba(170,190,255,.16) 0,rgba(170,190,255,.06) 15%,rgba(170,190,255,0) 32%);animation:cfLeakB 34s ease-in-out infinite alternate}
@keyframes cfLeakA{0%{transform:translate(-4%,-3%) rotate(0)}100%{transform:translate(6%,4%) rotate(24deg)}}
@keyframes cfLeakB{0%{transform:translate(5%,3%) rotate(0)}100%{transform:translate(-6%,-4%) rotate(-20deg)}}
#cineFx .vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 52%,rgba(6,8,20,.34) 100%)}
#cineFx i{position:absolute;bottom:-12px;width:5px;height:5px;border-radius:50%;background:radial-gradient(circle,#fff6d8 0,rgba(255,236,180,.5) 45%,rgba(255,236,180,0) 70%);opacity:0;animation:cfMote linear infinite;will-change:transform,opacity}
@keyframes cfMote{0%{transform:translate(0,0) scale(.6);opacity:0}12%{opacity:.75}70%{opacity:.5}100%{transform:translate(var(--dx,20px),-78vh) scale(1.25);opacity:0}}
#cineTitle::before,#cineTitle::after{content:"";display:block;height:1px;margin:0 auto;width:min(64vw,360px);background:linear-gradient(90deg,rgba(240,208,140,0),#f0d08c 30%,#fff2cc 50%,#f0d08c 70%,rgba(240,208,140,0));transform:scaleX(0);opacity:0}
#cineTitle::before{margin-bottom:16px}#cineTitle::after{margin-top:16px}
#cineTitle.show::before,#cineTitle.show::after{animation:cfRule 4.6s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes cfRule{0%{transform:scaleX(0);opacity:0}10%{opacity:1}30%{transform:scaleX(1);opacity:1}84%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1.08);opacity:0}}
#cineTitle.show b{background:linear-gradient(100deg,#e8c070 0,#f6dc9c 38%,#fffbe8 50%,#f6dc9c 62%,#e8c070 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-shadow:none;filter:drop-shadow(0 2px 14px rgba(0,0,0,.8));animation:cfSheen 4.6s ease-out forwards,cfTrack 4.6s ease-out forwards}
@keyframes cfSheen{0%{background-position:130% 0}55%{background-position:-30% 0}100%{background-position:-30% 0}}
@keyframes cfTrack{0%{letter-spacing:.2em}30%{letter-spacing:.02em}100%{letter-spacing:.04em}}
#cineTitle.show span{animation:cfSub 4.6s ease forwards}
@keyframes cfSub{0%,14%{opacity:0;transform:translateY(8px)}32%{opacity:1;transform:none}100%{opacity:1}}
#cine .cbox{border:1px solid rgba(240,208,140,.16);box-shadow:0 10px 30px rgba(0,0,0,.32)}
#cine .cbox p.cfIn{animation:cfLine .5s cubic-bezier(.2,.7,.2,1)}
@keyframes cfLine{0%{opacity:0;transform:translateY(9px);filter:blur(3px)}100%{opacity:1;transform:none;filter:none}}
#cine .cbox b.cfIn{animation:cfName .42s cubic-bezier(.2,.7,.2,1)}
@keyframes cfName{0%{opacity:0;transform:translateX(-14px);letter-spacing:.3em}100%{opacity:1;transform:none;letter-spacing:normal}}
#cine .cbox span.cfIn{animation:cfRef 1.6s ease-out}
@keyframes cfRef{0%{opacity:0}40%{opacity:1;text-shadow:0 0 12px rgba(255,220,140,.9)}100%{text-shadow:none}}
#cine .bar{transition:height .9s cubic-bezier(.2,.7,.2,1)}
#narr .n-card{position:relative;overflow:hidden}
#narr .n-card.cfIn{animation:cfCard .75s cubic-bezier(.2,.75,.2,1)}
@keyframes cfCard{0%{opacity:0;transform:translateY(18px) scale(.95);filter:blur(5px) brightness(1.7)}60%{filter:blur(0) brightness(1.15)}100%{opacity:1;transform:none;filter:none}}
#narr .n-card::before{content:"";position:absolute;left:50%;top:50%;width:150%;aspect-ratio:1;margin:-75% 0 0 -75%;pointer-events:none;background:repeating-conic-gradient(from 0deg,rgba(255,226,150,.07) 0deg 5deg,rgba(255,226,150,0) 5deg 20deg);-webkit-mask-image:radial-gradient(circle,#000 0,transparent 60%);mask-image:radial-gradient(circle,#000 0,transparent 60%);animation:cfRays 40s linear infinite;z-index:0}
#narr .n-card>*{position:relative;z-index:1}
@keyframes cfRays{to{transform:rotate(360deg)}}
#narr .n-card.cfIn .rule{animation:cfRule2 1s .25s cubic-bezier(.2,.7,.2,1) both}
@keyframes cfRule2{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:1}}
#narr .n-card.cfIn h2{animation:cfSub2 .7s .12s ease both}#narr .n-card.cfIn p{animation:cfSub2 .8s .32s ease both}#narr .n-card.cfIn .n-ref{animation:cfSub2 .8s .55s ease both}
@keyframes cfSub2{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){#cineFx,#narr .n-card::before{display:none}}
`; document.head.appendChild(css);
function setup() { const cine = document.getElementById('cine'); if (!cine || document.getElementById('cineFx')) return;
  const fx = document.createElement('div'); fx.id = 'cineFx'; let h = '<div class="leak a"></div><div class="leak b"></div><div class="vig"></div>';
  for (let i = 0; i < 14; i++) { const l = (i * 7.3 + 4) % 100, d = 11 + (i * 3.7) % 9, s = 3 + (i % 4) * 1.6; h += `<i style="left:${l}%;width:${s}px;height:${s}px;animation-duration:${d}s;animation-delay:${-(i * 1.9) % d}s;--dx:${((i % 5) - 2) * 26}px"></i>`; }
  fx.innerHTML = h; const grade = document.getElementById('cineGrade'); cine.insertBefore(fx, grade ? grade.nextSibling : cine.firstChild);
  /* a line that changes plays its entrance again */
  const again = el => { if (!el) return; el.classList.remove('cfIn'); void el.offsetWidth; el.classList.add('cfIn'); };
  const watch = (id, fn) => { const el = document.getElementById(id); if (!el) return; let last = ''; new MutationObserver(() => { const t = el.textContent; if (t === last) return; const grew = !!last && t.startsWith(last); last = t; if (t && !grew) (fn || again)(el); /* (text typed out letter by letter is one entrance, not one per letter) */ }).observe(el, { childList: true, characterData: true, subtree: true }); };
  watch('cineT'); watch('cineN'); watch('cineR');
  const card = document.querySelector('#narr .n-card'); watch('nText', () => again(card)); }
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', setup); else setup();
})(window.G = window.G || {});
