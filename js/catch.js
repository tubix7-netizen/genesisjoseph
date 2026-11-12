/* 약속의 길 — 낚시 성공 연출 (v18.34)
   물고기를 끌어 올리면: 요셉이 물고기를 머리 위로 번쩍 들고, 카메라가 앞으로 돌아와 얼굴과 물고기를 비추고, 「잡았다!」 카드가 떠요
   (이름 · 무게 막대 · 첫 낚시 · 새 기록 · 한 줄 이야기). 화면을 누르거나 3초 뒤에 닫혀요. */
'use strict';
(function (G) {
const Game = G.Game, sfx = (n, o) => G.Audio && G.Audio.sfx(n, o); if (!Game) return;
const LORE = { carp: '잉어를 닮은 나일 강 물고기 · 어디서나 잡히고 넉넉해요.', barbel: '수염이 난 강바닥의 물고기 · 살이 단단해요.', tilapia: '애굽 사람들이 즐겨 먹던 물고기 · 무덤 벽화에도 그려져 있어요.',
  catfish: '밤에 움직이는 큰 메기 · 힘이 세서 줄을 끊기 일쑤예요!', gfish: '금빛으로 빛나는 귀한 잉어 · 어부들이 평생 한 번 볼까 말까 해요!', perch: '나일 농어 · 사람만큼 커지는 강의 왕이에요.', mullet: '바닷물과 강물을 오가는 숭어예요.' };
const MAXW = { carp: 3.2, barbel: 2.6, tilapia: 1.8, catfish: 9, gfish: 3, perch: 18, mullet: 2.2 };
const css = document.createElement('style'); css.textContent = `#catchC{position:fixed;inset:0;z-index:236;display:flex;align-items:flex-end;justify-content:center;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 40px);pointer-events:auto}
#catchC .cc{width:min(84vw,330px);padding:16px 18px 14px;border-radius:22px;text-align:center;color:#f6ecd8;background:linear-gradient(165deg,rgba(28,48,70,.96),rgba(12,22,36,.96));border:2px solid #e5b552;box-shadow:0 0 34px rgba(229,181,82,.45);animation:ccIn .45s cubic-bezier(.2,1.4,.4,1) both}
#catchC .k{font-size:12px;letter-spacing:.2em;color:#e5b552;font-weight:800}#catchC b{display:block;font-size:24px;margin:4px 0 2px}#catchC .w{font-size:15px;font-weight:700}
#catchC .bar{height:8px;border-radius:5px;background:rgba(255,255,255,.12);margin:8px 0 6px;overflow:hidden}#catchC .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7ac0e0,#e5b552);transition:width 1s ease .3s}
#catchC .tag{display:inline-block;margin:2px 3px;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:800;background:#e5b552;color:#2a1a08}#catchC p{font-size:13px;line-height:1.45;margin:8px 0 2px;opacity:.88}#catchC small{display:block;margin-top:6px;font-size:11.5px;opacity:.6}
body.catching #hud,body.catching .stick,body.catching .cbtn,body.catching .hot{opacity:0;transition:opacity .3s}
@keyframes ccIn{from{transform:translateY(40px) scale(.85);opacity:0}to{transform:none;opacity:1}}`; document.head.appendChild(css);
let el = null, tmr = 0, myCam = null, openT = 0;
function close() { if (!el) return; el.remove(); el = null; clearTimeout(tmr); const P = Game.P; if (P.carry === 'fish') { P.carry = null; P.carryArms = false; } if (P.emote && P.emote.k === 'raiseHands') P.emote = null;
  if (Game.cineCam && Game.cineCam === myCam) { const cc = myCam; Game.camBlend = { x: cc.x, y: cc.y, z: cc.z, lx: cc.lx, ly: cc.ly, lz: cc.lz, fov: cc.fov || 0.9, t: 0, dur: 0.7 }; Game.cineCam = null; } myCam = null; /* v18.34 ease back, and only our own camera */ document.body.classList.remove('catching'); G.UI.setBusy('catch', false); G.UI.hud && G.UI.hud(); }
const Ct = G.Catch = {};
Ct.show = function (k, kg, rec, first, best) { const P = Game.P, it = Game.ITEMS[k] || { n: k }; if (el) close();
  P.carry = 'fish'; P.carryArms = true; P.emote = { k: 'raiseHands', t: 0, dur: 3.2 }; G.UI.setBusy('catch', true);
  /* the camera swings in front of Joseph, a little low, looking up at him and the fish */
  const a = P.face, y = P.y; Game.cineCam = myCam = { x: P.x + Math.sin(a + 0.55) * 3.6, y: y + 1.5, z: P.z + Math.cos(a + 0.55) * 3.6, lx: P.x, ly: y + 1.55, lz: P.z, fov: 0.95 }; document.body.classList.add('catching');
  sfx(k === 'gfish' || rec ? 'levelup' : 'pickup', { pitch: 1.1 }); if (G.FX) G.FX.burst(P.x, y + 2.2, P.z, 14, { c: [0.7, 0.85, 1], sp: 1.6, up: 1.2, g: -4, life: 0.7, size: 0.09, spread: 0.3 }); /* drops off the fish */
  el = document.createElement('div'); el.id = 'catchC'; const pct = Math.min(100, Math.round(kg / (MAXW[k] || 5) * 100));
  el.innerHTML = `<div class="cc"><div class="k">잡았다!</div><b></b><div class="w">${kg.toFixed(1)} kg</div><div class="bar"><i></i></div>${first ? '<span class="tag">첫 낚시</span>' : ''}${rec ? '<span class="tag">새 기록!</span>' : ''}${k === 'gfish' ? '<span class="tag">아주 귀해요</span>' : ''}<p></p><small>${best && !rec && !first ? '내 기록 ' + best.toFixed(1) + ' kg · ' : ''}눌러서 닫기</small></div>`;
  el.querySelector('b').textContent = it.n; el.querySelector('p').textContent = LORE[k] || ''; document.body.appendChild(el);
  requestAnimationFrame(() => { const i = el && el.querySelector('.bar i'); if (i) i.style.width = pct + '%'; });
  openT = performance.now(); el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); }); el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (performance.now() - openT > 600) close(); }); tmr = setTimeout(close, 3600); }; /* v18.34 closed by a real tap (no click falls through to the bag button), and not by the reeling thumb in the first 0.6 s */
})(window.G);
