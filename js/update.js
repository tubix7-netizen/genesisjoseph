/* 약속의 길 — 새 버전 알림 (v18.55)
   브라우저가 예전 index.html을 기억해 두면, 새로 올린 게임 대신 예전 게임이 뜰 수 있어요.
   그래서 게임을 열 때(그리고 30분마다) 서버의 index.html을 캐시 없이 한 번 읽어 보고, 스크립트 꼬리표(?v=)가 다르면
   화면 위에 「새 버전이 있어요 · 눌러서 새로 고침」 띠를 띄워요. 눌러야만 새로 고쳐요(하던 일은 저장 뒤에). */
'use strict';
(function (G) {
const mine = (() => { const s = [...document.scripts].map(x => x.src).find(x => /js\/main\.js\?v=/.test(x)); const m = s && s.match(/\?v=([0-9a-z]+)/); return m ? m[1] : null; })();
if (!mine || !window.fetch || location.protocol === 'file:') return;
function check() { fetch('index.html?nocache=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.text() : '').then(t => { const m = t.match(/js\/main\.js\?v=([0-9a-z]+)/); if (m && m[1] !== mine) show(); }).catch(() => { }); }
function show() { if (document.getElementById('newVer')) return; const b = document.createElement('button'); b.id = 'newVer'; b.textContent = '새 버전이 있어요 · 눌러서 새로 고침';
  b.style.cssText = 'position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:999px;border:1px solid rgba(229,181,82,.7);background:rgba(18,24,48,.92);color:#ffe9b0;font:700 13px "IBM Plex Sans KR",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4)';
  b.onclick = () => { try { const Gm = G.Game; if (Gm && Gm.mode === 'play' && Gm.save) Gm.save(true); } catch (e) { } location.replace(location.pathname + '?r=' + Date.now()); }; document.body.appendChild(b); }
setTimeout(check, 8000); setInterval(check, 30 * 60 * 1000);
})(window.G);
