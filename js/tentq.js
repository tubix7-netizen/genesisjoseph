/* 약속의 길 — v18.65 더 좋은 텐트를 얻는 부탁: 「검은 염소털 장막」 (tentq.js · deepq.js 다음)
   고센에 온 뒤, 아셀의 딸 세라(창 46:17)가 고센 장막 곁 베틀에서 일해요. 목자들이 쓰는 검은 염소털 장막을 요셉에게 짜 주겠대요.
   ① 세라에게 말 걸기 → ② 고센 염소 우리에서 염소 털 빗기(다섯 번) → ③ 장막 말뚝 · 기둥(나뭇가지 8)과 가죽 끈(짐승 가죽 2) 마련
   → ④ 세라에게 가져가면 함께 짜는 장면 → 텐트 4단계 「검은 염소털 장막」(아 1:5 「게달의 장막같이 검을지라도」)
   4단계 장막에서 자면 체력 · 기력 · 정신력이 가득 차고 몸이 따뜻해져요. 낮잠도 밤샘 피로를 다 풀어요(텐트이므로).
   부탁은 이야기가 쉬는 때(풍년 1 · 2년, 본편 뒤)에만 열려요. 저장: S.flags.tq = { comb } · S.flags.tentLv = 4 */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, Ls = G.Lands; if (!Game || !EP || !EP.quests || !G.Life) return;
const S = () => Game.S(), P = () => Game.P;
const F = () => { const s = S(); return s.flags.tq || (s.flags.tq = {}); };
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb), pop = (a, b, c) => (G.UI.pop || G.UI.toast)(a, b, c), sfx = (n, o) => G.Audio && G.Audio.sfx(n, o);
const look = (k, o) => Object.assign({}, (Ls && Ls.lookOf(k)) || {}, o || {});
const GO = [78, 56], SERAH = [GO[0] - 14.5, GO[1] + 1.5], LOOM = [GO[0] - 15.6, GO[1] + 3.4], GOATS = [GO[0] + 14, GO[1] - 12];
const goshen = s => !!(s && s.q && s.q.goshen);
const N = '세라', L = (t, e, ref) => ({ n: N, t, e, ref }), J = (t, e) => ({ n: '요셉', t, e });
EP.npcs.push({ id: 'tqSerah', name: N, look: { skin: 0xd8a47a, fem: true, long: true, hair: 0x2a1a10, hairStyle: 'braid', eye: 0x3a2412, top: 0x6a4a6a, under: 0xe0d4bc, trim: 0xe0b040, sash: 0xb84a3a, headwear: 'cloth', clothCol: 0xece2cc, clothStripe: 0x6a4a6a, smile: 0.45, vary: false },
  x: SERAH[0], z: SERAH[1], face: 2.4, talkR: 2.8, noBond: true, act: 'gather', show: s => goshen(s),
  chat: ['아버지 아셀은 올리브 기름 이야기만 나오면 눈이 반짝여요.', '염소털은 비를 맞으면 부풀어서 물이 새지 않아요. 할머니들이 그렇게 가르쳐 주셨어요.', '할아버지 야곱이 하란에서 양 치던 이야기를 해 주셨어요. 저도 그 장막에서 자 보고 싶어요.', '베틀 북이 오갈 때 노래를 부르면 실이 덜 엉켜요.'] });
/* her loom beside Levi's tent */
{ const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const E = Object.assign({}, G.env || {}, EP.envx || {}); if (E.loomX) W.place(E.loomX, LOOM[0], LOOM[1], { ry: 2.4 }); if (E.baskets) W.place(E.baskets, LOOM[0] + 1.6, LOOM[1] - 0.6, { args: [2] }); W.addCol({ x: LOOM[0], z: LOOM[1], r: 0.8, y1: W.heightAt(LOOM[0], LOOM[1]) + 1.6 }); } catch (e) { console.error('tentq loom', e); } }; }

EP.quests.tq_tent = { giver: 'tqSerah', title: '검은 염소털 장막', when: s => goshen(s) && ((s.flags.tentLv | 0) || 1) < 4,
  offer: [L('요셉 삼촌! 들에서 주무실 때 쓰는 천막 말이에요. 아마천은 가볍지만 비가 오면 금방 젖지요?', 'happy'), J('그렇단다. 비 오는 밤이면 천막 끝에서 물이 똑똑 떨어지더구나.'),
    L('우리 목자들은 검은 염소털로 장막을 짜요. 비를 맞으면 털이 부풀어서 물이 안 새고, 밤에는 따뜻해요. 삼촌께 하나 짜 드리고 싶어요.', 'tender'),
    L('염소 우리에서 털을 빗어 주시고, 말뚝이랑 기둥에 쓸 나뭇가지 여덟, 끈으로 쓸 짐승 가죽 둘만 구해다 주세요.')],
  prog: '염소 털 다섯 번 · 나뭇가지 8 · 짐승 가죽 2를 가져다주세요.',
  obj: [{ t: s => `고센 염소 우리에서 염소 털 빗기 (${Math.min(5, F().comb | 0)}/5)`, ok: () => (F().comb | 0) >= 5 },
    { t: s => `장막 말뚝과 기둥 · 나뭇가지 (${Math.min(8, Game.inv('branch'))}/8)`, ok: () => Game.inv('branch') >= 8 },
    { t: s => `장막 끈 · 짐승 가죽 (${Math.min(2, Game.inv('hide'))}/2)`, ok: () => Game.inv('hide') >= 2 }],
  loc: s => (F().comb | 0) < 5 ? { x: GOATS[0], z: GOATS[1] } : null,
  take: { branch: 8, hide: 2 },
  done: [L('와, 다 구해 오셨네요! 털이 참 부드러워요. 오늘 밤 안으로 다 짜 볼게요.', 'happy'), J('나도 거들마. 실을 감아 주면 되겠느냐?'),
    { n: '', t: '세라가 베틀에 앉고, 요셉이 실을 감았습니다. 검은 날실 사이로 북이 오가고, 해가 질 무렵 넓은 장막 한 채가 다 짜였어요.' },
    L('게달의 장막처럼 검지만, 비 오는 밤에도 삼촌을 지켜 줄 거예요. 들에 장막을 치시면 이걸로 쳐 드릴게요.', 'tender'), J('고맙다, 세라야. 네 손끝에서 할아버지의 장막 냄새가 나는구나.', 'tender')],
  reward: { insight: 1 },
  finish(s) { s.flags.tentLv = 4; try { if (G.Build && G.Build.refresh) G.Build.refresh(); } catch (e) { } setTimeout(() => pop('텐트가 좋아졌어요', '검은 염소털 장막 · 비 오는 밤에도 따뜻하게 푹 자요', 'house'), 1200); } };

/* combing the goats in the Goshen goat fold */
Game.CTX.push(function (s) { const p = P(); if (!goshen(s) || p.ride || p.act || Game.cineOn || G.UI.busy() || !(s.side && s.side.act && s.side.act.tq_tent)) return null; const f = F(); if ((f.comb | 0) >= 5) return null;
  const d = Math.hypot(GOATS[0] - p.x, GOATS[1] - p.z); if (d > 7) return null;
  return [{ d: d - 1, label: `염소 털 빗기 (${f.comb | 0}/5)`, x: GOATS[0], z: GOATS[1], y: 1, key: 'tqComb', noMagnet: true, use: () => {
    G.UI.minigame('rhythm', { title: '염소 털 빗기', hint: '빗이 털끝에 닿을 때 눌러요. 살살, 엉킨 데는 천천히.', need: 6 }, ok => { if (!ok) { G.UI.toast('털이 엉켰어요 · 다시 살살 빗어 봐요'); return; }
      f.comb = (f.comb | 0) + 1; p.emote = { k: 'pet', t: 0, dur: 1.2 }; sfx('goat', { soft: 1 }); G.UI.quest(); pop(f.comb >= 5 ? '염소털을 다 모았어요' : '염소털 한 줌', f.comb >= 5 ? '세라에게 가져가요 (나뭇가지 8 · 짐승 가죽 2도)' : `${f.comb}/5 · 다른 염소도 빗어 줘요`, 'star'); }); } }]; });

/* the black tent: darker cloth, a wide awning on poles, a striped band, guy-ropes and pegs; sleeping in it */
if (G.Camps) { const sl0 = Game.sleep; Game.sleep = function () { const r = sl0.apply(this, arguments); setTimeout(() => { const s = S(); if ((s.flags.tentLv | 0) < 4) return; const near = (s.bld || []).some(b => b.k === 'camp' && Math.hypot(b.x - P().x, b.z - P().z) < 5); if (!near) return; const H = s.hero;
      if (H) { H.hp = H.hpMax; if (H.mindMax) H.mind = H.mindMax; } P().stam = (G.Vitals && G.Vitals.cap) || (H && H.stamMax) || 140; if (s.surv) s.surv.warm = 100; G.UI.toast('검은 염소털 장막에서 따뜻하게 잤어요 · 몸과 마음이 가득 찼어요'); }, 1600); return r; }; }
})(window.G);
