/* 약속의 길 — 인사와 짧은 이야기 (v16.1): what people say when you walk up to them and nothing else is going on.
   Depends on the hour, the weather, where you are (Canaan or Egypt), who they are (child, woman, elder, worker), and what Joseph is
   now (a shepherd boy in a striped coat, a slave, a prisoner, the vizier everyone bows to). Sometimes a rumour about an out-of-the-way
   place or hidden chest, sometimes a small gift, sometimes just a wave or a bow. G.Greet.lines(npc) → dialogue lines. */
'use strict';
(function (G) {
const Game = G.Game, rnd = a => a[Math.floor(Math.random() * a.length)];
const Gr = G.Greet = {};
const H = () => { const S = Game.S(); return S ? S.time % 24 : 12; };
const TIME = { morning: { c: ['좋은 아침이오!', '일찍 나왔구려.', '아침 이슬이 아직 마르지 않았네.'], e: ['좋은 아침이에요. 해가 벌써 뜨거워지네요.', '아침 장이 곧 서겠군요.', '새벽에 나일 강에서 물안개가 피더군요.'] },
  noon: { c: ['한낮엔 그늘에서 쉬는 게 좋소.', '해가 머리 위에 있구려. 물은 넉넉하오?'], e: ['한낮이에요. 이럴 땐 그늘이 최고지요.', '이 더위에 어디를 그렇게 바삐 가세요?'] },
  evening: { c: ['해가 지기 전에 장막으로 돌아가야지.', '저녁 짓는 연기가 오르는구려.'], e: ['저녁 바람이 시원하네요.', '해가 서쪽 사막으로 지고 있어요. 아름답지요?'] },
  night: { c: ['이 밤에 어딜 가시오? 늑대를 조심하오.', '별이 참 많기도 하지.'], e: ['밤길 조심하세요. 등불은 있어요?', '이 시간엔 다들 잠들었어요.'] } };
const WEATHER = { rain: ['비가 오니 땅이 살아나는구려.', '비 맞으면 감기 들어요!'], dust: ['모래바람이 눈에 들어가요. 얼굴을 가리세요.'], wind: ['바람이 세네요. 겉옷을 꼭 여미세요.'] };
const ROLE = { child: ['안녕! 어디 가요?', '나랑 놀래요?', '저기 큰 도마뱀 봤어요!', '우리 엄마가 낯선 사람이랑 말하지 말랬는데… 그래도 착해 보여요!'],
  fem: ['어서 오세요.', '물 한 모금 드실래요?', '오늘 시장에 무화과가 많이 나왔더라고요.', '바쁘신가 봐요.'],
  old: ['젊은이, 서두르지 마오. 좋은 것은 천천히 오지.', '내 나이쯤 되면 바람 소리만 들어도 비가 올지 안다오.', '허허, 얼굴이 밝구려.'],
  man: ['어서 오시오.', '무슨 일로 오셨소?', '수고가 많소.', '요즘 곡식 값이 어떤지 아시오?'] };
const STATE = { // what they make of Joseph
  coat: ['그 무지개 같은 옷은 어디서 났소? 눈이 부시구려.', '야곱 어른의 아들이로구먼. 아버지가 많이 아끼시지?'],
  slave: ['…새로 온 히브리 종인가? 말이 통하나?', '열심히 일하면 주인이 알아줄 거요.'],
  steward: ['보디발 나리 댁 총무 아니시오? 일솜씨가 대단하다고 들었소.', '히브리 총무 양반, 오늘도 바쁘시구려.'],
  prisoner: ['…', '옥에 갇힌 사람과 말하면 안 돼요.'],
  vizier: ['총리 나리! (고개를 깊이 숙인다)', '사브낫바네아 님! 나리 덕분에 곳간이 가득해요.', '아브렉! 총리 나리 오셨다!', '나리, 우리 마을에도 꼭 들러 주십시오.'] };
const RUMOR = [['tower', '북쪽 언덕 위에 옛 망대가 무너져 있다더군. 거기서 보면 도단 평원이 다 보인다오.'], ['oasis', '광야 한가운데 샘이 숨어 있다오. 대추야자 그늘이 있는 곳 말이오.'],
  ['camp', '남쪽 광야에 대상이 버리고 간 야영지가 있다던데, 짐짝이 그대로라더군.'], ['cave', '남쪽 바위산 틈에 옛 목자가 쉬던 은신처가 있다고 들었소.'], ['altar', '헤브론 마므레 숲에 아브라함 할아버지가 쌓은 옛 제단이 있다지.'],
  ['boat', '북쪽 나루 아래 갈대숲에 버려진 고깃배가 있대요. 아무도 안 가 봤대요.'], ['pyr', '피라미드 서쪽에 옛 일꾼들이 살던 마을 터가 있다오. 무서워서 아무도 안 가지.'], ['dune', '남쪽 끝 모래 언덕 꼭대기에선 바람이 노래를 한대요.'], ['cairn', '남쪽 봉우리에 목자들이 쌓은 돌무더기가 있소. 길 잃지 말라는 표시지.']];
function who(n) { const L = n.look || n.d.look || {}; return n.d.kid || L.kid ? 'child' : L.fem ? 'fem' : (L.hair === 0xd8d0c4 || /노인|장로|할아버지|할머니/.test(n.name)) ? 'old' : 'man'; }
function state(S) { const o = S.outfit || ''; return /Vizier|^w[A-Z]/.test(o) ? 'vizier' : /Prisoner|Fettered/.test(o) ? 'prisoner' : /Steward/.test(o) ? 'steward' : /Slave|Servant|Fled|Shaved/.test(o) ? 'slave' : 'coat'; }
Gr.lines = function (n) { const S = Game.S(), P = Game.P, h = H(), eg = n.x < 110, W = who(n), st = state(S), nm = n.name, out = [];
  const tk = h < 5 || h >= 20.5 ? 'night' : h < 10.5 ? 'morning' : h < 16 ? 'noon' : 'evening';
  const pool = [].concat(TIME[tk][eg ? 'e' : 'c'], ROLE[W], STATE[st], STATE[st], WEATHER[S.weather] || []);
  let line = rnd(pool); if (eg && st === 'coat') line = rnd(ROLE[W]);
  // a bow or a wave to go with it
  const emo = st === 'vizier' && W !== 'child' ? 'bow' : W === 'child' ? 'wave' : Math.random() < 0.35 ? (Math.random() < 0.5 ? 'wave' : 'bow') : null; if (emo) n.emote = { k: emo, t: 0, dur: emo === 'bow' ? 1.6 : 2 };
  out.push({ n: nm, t: line });
  // sometimes a rumour about somewhere off the road you haven't found yet
  const found = S.flags.found || {}, rum = RUMOR.filter(r => !found[r[0]]); if (rum.length && Math.random() < 0.3 && W !== 'child') out.push({ n: nm, t: rnd(rum)[1] });
  // sometimes a little something
  else if (Math.random() < 0.08 && st !== 'prisoner') { const k = eg ? rnd(['dates', 'bread', 'onion', 'fig']) : rnd(['fig', 'bread', 'olive', 'cheese']); if (Game.ITEMS[k]) { out.push({ n: nm, t: W === 'child' ? '이거 줄게요! 우리 집에 많아요.' : '먼 길 가는 것 같은데, 이거라도 가져가시오.', fn: () => { Game.give(k, 1, true); G.UI.gain && G.UI.gain(k, 1); } }); } }
  return out; };
// replace the bare 「평안하시오.」 fallbacks
const say0 = G.UI.say; G.UI.say = function (lines, done) { if (lines && lines.length === 1 && lines[0] && lines[0].t === '평안하시오.' && Game.dlgNpc && lines[0].n === Game.dlgNpc.name) { return say0.call(this, Gr.lines(Game.dlgNpc), done); } return say0.apply(this, arguments); }; // a gift line's fn runs when the line is shown
})(window.G);
