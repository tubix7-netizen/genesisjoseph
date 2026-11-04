/* 약속의 길 — 살아 있는 애굽 마을 (v18.23)
   · 사람이 더 많아요: 성읍·서쪽 마을·남쪽 마을에 어부·뱃사공·빵 굽는 사람·벽돌공·빨래하는 여인·나귀 탄 장사꾼·짐꾼·아이들이 늘었어요.
     (집집마다 식구가 여럿이 되어요.) 어부는 강가에서 낚시하고, 장사꾼은 나귀를 타고 마을 어귀와 장터를 오가요.
   · 나일 강의 세 계절에 따라 일이 바뀌어요(extras.js의 계절: 열흘씩 아케트·페레트·셰무):
       아케트(범람) — 밭이 물에 잠겨 농부들은 고기를 잡거나 벽돌을 찍고 집을 고쳐요
       페레트(씨뿌림) — 괭이질하고 씨를 뿌려요
       셰무(거둠) — 낫으로 거두고 타작해요
   · 날씨도 계절을 따라요: 아케트엔 후텁지근하고 아침 안개, 페레트엔 서늘하고 구름, 가끔 비, 셰무엔 뜨겁고 모래바람(함신).
   · 마을 사람들끼리 마주치면 인사하고 짧게 이야기를 나눠요(말풍선 두 줄, 계절·일에 맞는 말).
   · 애굽 길에도 나그네가 다녀요: 나귀 탄 나그네, 물동이 진 여인, 대상, 흉년엔 굶주린 사람들. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph, AI = G.NpcAI; if (!EP || !AI || !AI.addFolk) return;
const S = () => Game.S(), P = () => Game.P;
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const ord = () => Game.stepOrder(), after = k => { const o = ord(), s = S(); return !!s && o.indexOf(s.step) >= o.indexOf(k); };
const egypt = () => after('c1_market') && P().x < 60;
const season = () => Math.floor(((S().day || 1) - 1) / 10) % 3;

// ------------------------------------------------------------------ new jobs
const R = AI.ROUT;
Object.assign(R, {
  fisher: [[5.2, 'home:wake'], [5.8, 'river:act:fish'], [10.5, 'market:wander:2'], [12, 'eat'], [13.2, 'river:act:fish'], [17.4, 'market:act:gather'], [19, 'fire:sit'], [21, 'home']],
  boatman: [[5.5, 'home:wake'], [6, 'river:wander:2.5'], [12, 'eat'], [13, 'river:act:gather'], [17.8, 'river:wander:2'], [19.2, 'fire:sit'], [20.8, 'home']],
  baker: [[4.8, 'home:act:gather'], [8.5, 'market:act:gather'], [12, 'eat'], [13, 'home:act:gather'], [16.5, 'market:wander:1.5'], [19, 'fire:sit'], [21, 'home']],
  brickmaker: [[5.8, 'work:act:mine'], [11.4, 'shade:sit'], [13.5, 'work:act:mine'], [17.2, 'river:act:gather'], [19, 'fire:sit'], [21, 'home']],
  washer: [[6.4, 'river:act:gather'], [10, 'home:act:gather'], [12, 'eat'], [14, 'market:wander:2'], [16, 'well:act:gather'], [18.4, 'fire:sit'], [20.4, 'home']],
  trader: [[6, 'home:wake'], [6.8, 'gate:wander:4'], [9, 'market:wander:4'], [12, 'eat'], [13.5, 'visit'], [15.5, 'gate:wander:5'], [18, 'market:wander:3'], [20, 'home']],
  porter: [[6, 'market:act:gather'], [9, 'river:wander:3'], [12, 'shade:sit'], [13.5, 'market:act:gather'], [16.5, 'river:wander:3'], [19, 'fire:sit'], [21, 'home']],
});
// looks: made from the villagers already there, each a little different
const tw = (o, x) => Object.assign({}, o, x);
function base(v, fem, kid) { const f = v.folk.find(q => !!(q.look && q.look.fem) === fem && (kid ? q.age === 'kid' : q.age !== 'kid')) || v.folk[0]; return f.look; }
const SK = [0x9a6038, 0xa86a40, 0xb07848, 0x8a5a32, 0xc08a58, 0x7a4a2a], CL = [0xe8dcc0, 0xd8c8a0, 0xc8b890, 0xe0d4b8, 0xb8a888];
const NEW = {
  city: [['ct_fish', '어부 헤티', 'fisher', 0, 0, { prop: 'fishrod', persona: '나일 강에서 고기를 잡는 어부. 큰 고기 자랑을 좋아한다.' }], ['ct_bak', '빵 굽는 여인 이네트', 'baker', 1, 1, { persona: '새벽마다 화덕에 빵을 굽는 여인. 손이 크다.' }],
    ['ct_trd', '나귀 탄 장사꾼 이리', 'trader', 0, 2, { mount: 'donkey', pack: 0x8a6a48, persona: '나귀에 소금과 향료를 싣고 마을을 오가는 장사꾼. 먼 곳 소식에 밝다.' }],
    ['ct_brk', '벽돌공 사부', 'brickmaker', 0, 3, { work: 'brick', persona: '진흙과 짚으로 벽돌을 찍는 일꾼. 늘 손에 흙이 묻어 있다.' }], ['ct_por', '짐꾼 이세', 'porter', 0, 4, { persona: '나루에서 장터까지 짐을 나르는 힘센 짐꾼.' }], ['ct_kid2', '아이 넵', 'child', 0, 5, { age: 'kid', persona: '메리트의 아들. 달리기를 좋아한다.' }]],
  west: [['w_fish', '어부 아피', 'fisher', 0, 1, { prop: 'fishrod', persona: '서쪽 마을 어부. 강물 높이를 누구보다 잘 안다.' }], ['w_wash', '빨래하는 여인 헤누트', 'washer', 1, 2, { persona: '강가에서 세마포를 빠는 여인. 노래를 잘한다.' }],
    ['w_boat', '뱃사공 케무', 'boatman', 0, 3, { persona: '갈대배로 사람과 짐을 건네주는 뱃사공.' }], ['w_trd', '나귀 탄 장사꾼 이티', 'trader', 0, 4, { mount: 'donkey', pack: 0x7a5a3a, persona: '나귀에 항아리를 싣고 다니는 장사꾼.' }], ['w_kid2', '아이 메리', 'child', 1, 5, { age: 'kid', persona: '헤누트의 딸. 강가에서 조약돌을 모은다.' }]],
  south: [['s_fish', '어부 메투', 'fisher', 0, 1, { prop: 'fishrod', persona: '남쪽 마을 어부. 말이 느리지만 마음이 따뜻하다.' }], ['s_bak', '빵 굽는 여인 타위', 'baker', 1, 3, { persona: '보리빵과 대추야자 과자를 굽는 여인.' }],
    ['s_brk', '벽돌공 카이', 'brickmaker', 0, 4, { work: 'brick', persona: '물이 빠지면 벽돌을 찍어 집을 고쳐 주는 일꾼.' }], ['s_wash', '빨래하는 여인 바케트', 'washer', 1, 5, { persona: '빨래하며 마을 소식을 다 듣는 여인.' }], ['s_kid2', '아이 타호', 'child', 0, 0, { age: 'kid', persona: '세티의 막내아들. 개구쟁이.' }]],
};
for (const v of EP.villages || []) { const L = NEW[v.id]; if (!L) continue;
  L.forEach(([id, name, role, fem, home, o], i) => { if (v.folk.some(f => f.id === id)) return; const kid = o && o.age === 'kid', b = base(v, !!fem, kid);
    const f = Object.assign({ id, name, role, home, look: tw(b, { skin: SK[Math.floor(hash(id) * SK.length)], bottom: CL[Math.floor(hash(id + 'c') * CL.length)], top: fem ? CL[Math.floor(hash(id + 't') * CL.length)] : b.top }) }, o || {});
    AI.addFolk(EP, v, f); }); }
// spots the new jobs need: the riverbank (found at world build), a gate, shade
const pb = EP.build; EP.build = function (W) { if (pb) pb.apply(this, arguments); try { const wl = W.water ? W.water.level : -99;
  for (const v of EP.villages || []) { let best = null;
    for (let a = 0; a < 24; a++) { const ca = Math.cos(a / 24 * Math.PI * 2), sa = Math.sin(a / 24 * Math.PI * 2); let prev = null;
      for (let d = 6; d < 105; d += 1.5) { const x = v.x + ca * d, z = v.z + sa * d; if (W.heightAt(x, z) < wl) { if (prev && (!best || d < best[2])) best = [prev[0], prev[1], d]; break; } prev = [x, z]; } }
    if (best) { v.spots.river = [best[0], best[1], 2.2]; const dx = best[0] - v.x, dz = best[1] - v.z, L = Math.hypot(dx, dz) || 1; v.spots.brick = [best[0] - dx / L * 7, best[1] - dz / L * 7, 2.6]; } if (!v.spots.gate) v.spots.gate = v.spots.market || v.spots.hub; if (!v.spots.shade) v.spots.shade = v.spots.fire || v.spots.hub; } } catch (e) { console.error('village', e); } };

// ------------------------------------------------------------------ jobs follow the Nile's seasons
const plan0 = AI.plan; AI.plan = function (v, f, s) { const rows = plan0.apply(this, arguments); if (!['city', 'west', 'south'].includes(v.id)) return rows; const se = season();
  if (f.role !== 'farmer') return rows;
  return rows.map((r, i) => { const m = r[4]; if (!m || !m.startsWith('act:')) return r;
    if (se === 0) { const sp = v.spots.river || v.spots.hub, alt = i % 2 ? ['act:fish', sp] : ['act:mine', v.spots.brick || v.spots.hub]; return [r[0], +(alt[1][0] + (hash(f.id + i) - 0.5) * 2).toFixed(2), +(alt[1][1] + (hash(f.id + 'z' + i) - 0.5) * 2).toFixed(2), r[3], alt[0]]; } // flood: fish or make bricks
    if (se === 1) return [r[0], r[1], r[2], r[3], i % 2 ? 'act:plant' : 'act:hoe']; // sowing
    return [r[0], r[1], r[2], r[3], i % 2 ? 'act:gather' : 'act:harvest']; }); }; // harvest
// ------------------------------------------------------------------ the weather of each season (Egypt only)
if (G.Weather && G.Weather.weights) { const w0 = G.Weather.weights; G.Weather.weights = function (s) { const w = w0.apply(this, arguments); if (!egypt()) return w; const se = season(), o = Object.assign({}, w);
  if (se === 0) { o.clear = (o.clear || 0) * 1.1; o.cloudy = 0.14; o.fog = (Game.S().time % 24) < 9 ? 0.16 : 0.02; o.dust = (o.dust || 0) * 0.4; } // akhet: humid, morning mist
  else if (se === 1) { o.cloudy = 0.3; o.rain = 0.05; o.wind = 0.14; o.dust = (o.dust || 0) * 0.5; } // peret: cool, cloud, the odd shower
  else { o.dust = 0.2; o.wind = 0.22; o.cloudy = 0.05; o.fog = 0; } // shemu: hot, the khamsin brings sand
  return o; }; }
// ------------------------------------------------------------------ villagers talk to each other
const VZ = () => after('c5_patrol'), FAM = () => after('c6_open');
const TALK = {
  0: [['물이 올해도 높이 올라왔네!', '밭이 다 잠겼으니 그물이나 손봐야지.'], ['강이 붉게 불어났어요.', '물이 빠지면 검은 흙이 남을 거예요. 풍년이겠지요.'], ['오늘 큰 고기 잡았소?', '팔뚝만 한 놈으로 둘!'], ['물 빠지기 전에 벽돌을 많이 찍어 둬야지.', '올해는 지붕도 새로 얹어야겠어요.']],
  1: [['씨는 다 뿌렸소?', '보리는 다 뿌렸고 이제 아마 차례요.'], ['아침이 제법 쌀쌀하네요.', '그래도 일하기엔 딱 좋아요.'], ['새싹이 올라왔어요!', '올해도 잘 자라야 할 텐데.'], ['돼지 떼를 몰아 씨를 밟게 했지요.', '그래야 씨가 흙에 잘 묻혀요.']],
  2: [['모래바람이 부니 눈을 조심해요.', '수건으로 얼굴을 꼭 싸매요.'], ['보리가 누렇게 익었어요.', '내일부터 다 같이 거두세!'], ['타작 마당이 북적이네.', '소들이 하루 종일 돌고 있어요.']],
  any: [['안녕하세요!', '평안하신가요?'], ['빵이 잘 구워졌어요. 하나 드실래요?', '고마워요, 저녁에 들를게요.'], ['장터에 새 항아리가 들어왔대요.', '토기장이 솜씨겠지요.'], ['애들 또 강가에 갔대요.', '어이쿠, 악어 조심해야 할 텐데.'], ['나귀가 또 고집을 부려요.', '당근 하나 주면 금방 말 들을걸요.']],
  vz: [['총리님 수레 봤어요?', '봤지요! 금빛 굴레가 번쩍번쩍!'], ['오분의 일은 곳간으로 가야지요.', '총리님이 흉년을 대비하신대요.'], ['곳간이 또 새로 섰대요.', '저렇게 큰 곳간은 처음 봐요.']],
  fam: [['올해도 강물이 낮아요…', '밭이 쩍쩍 갈라졌어요.'], ['총리님 곳간 덕에 살았어요.', '미리 모아 두신 게 얼마나 다행인지.'], ['가나안에서도 곡식 사러 온대요.', '온 땅에 흉년이 들었나 봐요.'], ['빵 한 덩이도 아껴 먹어야지요.', '그래도 굶지는 않으니 감사해요.']],
};
G.VillageTalk = TALK;
function talkPool() { const se = TALK[season()]; if (FAM()) return TALK.fam.concat(TALK.fam, TALK.any); return se.concat(TALK.any, VZ() ? TALK.vz : []); }
const cool = {}; let tT = 0;
function talkTick(dt) { tT -= dt; if (tT > 0) return; tT = 5 + Math.random() * 5; if (!egypt() || G.UI.busy() || Game.cineOn) return; const p = P(), now = performance.now() / 1000;
  const folk = Object.values(Game.ENT.npcs).filter(n => n.vis && n.d.folk && !n.talking && !n.sleep && !n.schedHidden && !n._inCart && Math.hypot(n.x - p.x, n.z - p.z) < 26);
  for (let i = 0; i < folk.length; i++) for (let j = i + 1; j < folk.length; j++) { const a = folk[i], b = folk[j], k = a.id < b.id ? a.id + b.id : b.id + a.id; if ((cool[k] || 0) > now) continue;
    if (Math.hypot(a.x - b.x, a.z - b.z) > 3.6) continue; cool[k] = now + 90;
    const pool = talkPool(), L = pool[Math.floor(Math.random() * pool.length)];
    if (!a.walk) a.face = Math.atan2(b.x - a.x, b.z - a.z); if (!b.walk) b.face = Math.atan2(a.x - b.x, a.z - b.z);
    G.Life.bubble(a.id, L[0], 2.6); setTimeout(() => G.Life.bubble(b.id, L[1], 2.8), 1500); return; } }
// ------------------------------------------------------------------ travellers on Egypt's roads too
if (EP.strangers) { const st = EP.strangers, w0 = st.when; Object.assign(st, { max: 3, when: s => egypt() || (w0 ? w0(s) : false),
  weights: s => egypt() ? { traveler: 1.8, waterwoman: 1.2, elder: 0.5, caravan: 0.5, beggar: after('c6_open') ? 1.1 : 0.15, hunter: 0.25, shepherd: 0.35, wounded: 0.2 } : {} });
  const eg = (EP.villages || []).find(v => v.id === 'city'); if (eg) { st.looks = Object.assign({}, st.looks || {}, { default: base(eg, false), waterwoman: base(eg, true), driver: base(eg, false) }); } }
const up0 = EP.update; EP.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; if (Game.mode === 'play') try { talkTick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); } catch (e) { console.error('village', e); } return r; };
})(window.G);
