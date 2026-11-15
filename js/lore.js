/* 약속의 길 — v18.58 물품 설명 (lore.js)
   가게 · 가방 · 창고 · 장비에서 물품을 누르면 그 물품의 설명(어디서 나고, 무엇에 쓰고, 어떤 사연이 있는지)과 효과가 펼쳐져요.
   · LORE[물품 id] = 설명 글. 요리는 화덕 사전(G.Hearth.DISH)의 만드는 법 · 성구 · 맛을 그대로 보여 줘요.
   · 카드에 data-lore="물품 id"(장비는 "gear:id", 도구는 "tool:id")가 달려 있으면 눌렀을 때 설명이 열려요. 단추를 누를 땐 열리지 않아요.
   API: G.Lore.of(key) → { n, t, fx } */
'use strict';
(function (G) {
const Game = G.Game; if (!Game) return;
const L = G.Lore = {};
const LORE = {
  // ---- 재료
  branch: '마른 나뭇가지예요. 모닥불을 피우고, 지팡이와 우산과 텐트 뼈대를 만들어요.', wood: '도끼로 벤 통나무예요. 집과 곳간의 들보가 돼요. 나무가 귀한 애굽에서는 더 값져요.',
  stone: '들에서 주운 돌이에요. 물매에 메겨 던지고, 도구의 날과 화덕 둘레가 돼요.', reed: '나일 강가와 물웅덩이에 자라는 갈대예요. 엮어서 바구니와 자리, 배까지 만들어요.',
  clay: '물가의 차진 흙이에요. 빚어서 항아리를 굽고, 짚을 섞어 벽돌을 찍어요.', straw: '곡식을 떨고 남은 짚이에요. 진흙에 섞으면 벽돌이 갈라지지 않아요(출 5:7).',
  wool: '양에게서 깎은 털이에요. 실을 잣고 천을 짜요. 양털 깎는 날은 잔칫날이었어요.', thread: '양털이나 아마를 꼬아 만든 실이에요. 천과 그물과 물매 끈이 돼요.',
  brick: '진흙과 짚을 틀에 찍어 햇볕에 말린 벽돌이에요. 애굽의 집과 곳간은 이것으로 쌓아요.', rod: '껍질을 벗겨 흰 줄을 낸 버드나무 가지예요. 야곱이 라반의 양 떼 앞에 세웠어요(창 30:37).',
  hay: '베어 말린 풀이에요. 우리에 갇힌 가축과 수레 끄는 말의 먹이예요.', leather: '짐승 가죽을 무두질해 부드럽게 만든 것이에요. 신과 부대와 물매 주머니가 돼요.',
  sinew: '짐승의 힘줄이에요. 말리면 질긴 끈이 되어 활시위와 창날을 묶어요.', smooth: '시내에서 물에 닳은 매끄러운 돌이에요. 물매에 꼭 맞아 곧게 날아가요. 다윗도 시내에서 이런 돌 다섯을 골랐어요(삼상 17:40).',
  flint: '쳐서 날을 세우는 부싯돌이에요. 불꽃이 튀고, 맞으면 깊이 베여요.', basalt: '검고 무거운 현무암 돌이에요. 느리지만 맞으면 짐승이 휘청거려요.',
  // ---- 값진 물건
  cloth: '양털로 짠 두꺼운 천이에요. 겉옷과 장막을 지어요.', linen: '아마로 짠 애굽의 고운 베예요. 바로가 요셉에게 입힌 옷도 세마포였어요(창 41:42).',
  oil: '올리브를 짜서 얻은 기름이에요. 등잔을 밝히고, 빵에 바르고, 상처에 발라요.', cheese: '젖을 굳혀 만든 치즈예요. 목자들이 길에서 먹기 좋아요.',
  grain: '타작한 곡식을 담은 자루예요. 일곱 해 풍년에 요셉이 성마다 쌓아 둔 것이 바로 이 곡식이에요(창 41:48).', spice: '먼 동쪽에서 낙타에 실려 오는 향품이에요. 요셉을 산 이스마엘 상인들의 짐에도 있었어요(창 37:25).',
  balm: '길르앗에서 나는 유향이에요. 상처에 바르는 귀한 약이에요(창 37:25).', myrrh: '쓰고 향기로운 나무 진이에요. 약과 향유로 써요. 야곱이 애굽 총리에게 보낸 예물에도 들어 있었어요(창 43:11).',
  lapis: '먼 산에서 캐는 짙푸른 돌이에요. 애굽 사람들이 목걸이와 인장에 박아요.', goldRing: '오래된 금귀고리예요. 누가 잃어버린 것일까요.',
  cedar: '그발(레바논)의 백향목이에요. 향기롭고 썩지 않아 배와 궁의 들보로 써요.', purple: '바다 고둥으로 물들인 자주색 천이에요. 고둥 수천 마리에서 아주 조금 나와서 왕과 귀인만 입어요.',
  kfPot: '갑돌 섬의 도공이 빚은 토기예요. 달걀 껍질처럼 얇고 소용돌이 무늬가 그려져 있어요.', saffron: '사프란 꽃의 붉은 수술을 말린 것이에요. 꽃 한 송이에 세 가닥뿐이라 금만큼 귀해요.',
  gold: '구스의 강모래에서 일어 낸 사금이에요. 애굽의 금은 대부분 남쪽 구스에서 왔어요.', ebony: '구스의 검고 단단한 나무예요. 물에 가라앉을 만큼 무거워요.',
  ivory: '코끼리의 엄니예요. 애굽 장인들이 빗과 작은 상자를 깎아요.', frank: '나무 진을 말린 하얀 향이에요. 태우면 맑은 향이 올라요.',
  // ---- 밭과 텃밭
  flax: '푸른 꽃이 피는 아마예요. 줄기를 삭혀 실을 뽑으면 세마포가 돼요.', olive: '올리브 열매예요. 그냥 먹으면 쓰고, 절이거나 기름을 짜요.',
  barley: '거친 땅에서도 잘 자라는 보리예요. 가난한 사람의 빵이자 가축의 먹이예요.', wheat: '고운 가루가 나는 밀이에요. 빵 가운데 가장 좋은 빵을 구워요.',
  lentil: '붉은 렌틸콩이에요. 에서가 장자의 명분과 바꾼 팥죽이 이 콩으로 쑨 죽이에요(창 25:34).', cucumber: '애굽의 물 많은 오이예요. 광야에서 이스라엘 백성이 그리워했어요(민 11:5).',
  onion: '애굽 일꾼들이 날마다 먹던 양파예요. 빵과 양파가 한 끼였어요.', garlic: '애굽 사람들이 힘이 난다고 믿은 마늘이에요.',
  leek: '나일 강가 밭에서 기르는 부추예요. 국에 넣으면 향이 좋아요.', coriander: '고수 씨와 잎이에요. 만나가 「깟씨 같다」고 할 때의 깟이 바로 고수예요(출 16:31).',
  mint: '시원한 향이 나는 박하예요. 물에 띄우거나 차로 마시면 더위가 가셔요.', mustard: '아주 작은 겨자씨예요. 갈아서 고기에 바르면 톡 쏘아요.',
  cumin: '고기와 콩 요리에 넣는 향신료예요. 막대기로 떨어서 거둬요(사 28:27).', salt: '바닷물이나 소금 호수를 말려 얻은 소금이에요. 음식을 썩지 않게 지켜요.',
  chickpea: '병아리 머리처럼 생긴 콩이에요. 으깨거나 볶아서 먹어요.', fava: '애굽 사람들이 아침마다 먹는 잠두예요. 푹 삶아 으깨요.', fowl: '그물로 잡은 메추라기 고기예요.',
  // ---- 날것으로 먹는 것
  fig: '달고 부드러운 무화과예요. 말려 두면 겨울 내내 먹어요.', milk: '갓 짠 염소젖이에요. 따뜻할 때 마시면 속이 편해요.', bread: '화덕 벽에 붙여 구운 납작한 빵이에요. 어디서나 끼니의 바탕이에요.',
  herb: '들에서 뜯은 약초예요. 달여 마시거나 상처에 붙여요.', honey: '바위틈과 나무 구멍에서 딴 야생 꿀이에요. 야곱이 총리에게 보낸 예물에도 꿀이 있었어요(창 43:11).',
  egg: '풀숲 둥지에서 찾은 새알이에요.', caper: '바위틈 덤불에 열리는 풀 열매예요. 톡 쏘는 맛이 나요.', carob: '쥐엄나무 꼬투리예요. 달지만 거칠어서 가축에게도 먹여요.',
  dates: '대추야자 열매예요. 달고 오래가서 광야 길의 양식이에요.', pomegranate: '속에 붉은 알이 가득한 석류예요.', grapes: '송이째 딴 포도예요. 술 맡은 관원장의 꿈에 나온 그 포도예요(창 40:10).',
  raisins: '포도를 말린 건포도예요. 가볍고 달아서 먼 길에 좋아요.', melon: '애굽의 달고 물 많은 참외예요.', almond: '봄에 가장 먼저 꽃 피는 아몬드예요. 야곱의 예물에 들어 있었어요(창 43:11).',
  pistachio: '가나안의 유향나무 열매 피스타치오예요. 이것도 야곱의 예물이에요(창 43:11).', curd: '젖을 가죽 부대에 넣고 흔들어 엉기게 한 것이에요. 아브라함이 나그네에게 대접했어요(창 18:8).',
  // ---- 사냥과 낚시
  meat: '갓 잡은 생고기예요. 구워야 먹을 수 있어요.', hide: '짐승의 가죽이에요. 무두질하면 가죽이 돼요.', bone: '짐승의 뼈예요. 갈아서 바늘과 몽둥이를 만들어요.',
  horn: '짐승의 뿔이에요. 속을 파면 기름 뿔과 나팔이 돼요.', tusk: '멧돼지의 엄니예요.', fang: '늑대의 송곳니예요.', claw: '곰의 발톱이에요.', mane: '사자의 갈기예요.',
  feather: '새의 깃털이에요. 화살 끝에 달면 곧게 날아가요.', dove: '비둘기 고기예요.', goose: '나일 강가의 거위 고기예요. 애굽 잔칫상에 올라요.', goatMeat: '들염소 고기예요.',
  hippoTusk: '하마의 엄니예요. 상아처럼 깎아서 써요.', crocTooth: '나일 악어의 이빨이에요.', quill: '호저의 긴 가시예요.', shell: '거북의 등껍질이에요.', plume: '타조의 긴 깃털이에요. 애굽 사람들이 부채를 만들어요.', spotHide: '점박이 짐승의 가죽이에요.',
  arrow: '깃을 단 화살이에요. 활이 있어야 쏠 수 있어요.', flower: '들에 핀 꽃이에요. 누군가에게 주면 좋아할 거예요.',
  carp: '나일 강의 라베오예요.', barbel: '수염이 달린 바벨이에요.', catfish: '강바닥에 사는 메기예요.', tilapia: '나일 강에서 가장 흔한 틸라피아예요. 애굽 사람들이 즐겨 구워 먹어요.',
  gfish: '금빛 비늘의 잉어예요. 좀처럼 낚이지 않아요.', perch: '사람만큼 크게 자라는 나일 농어예요.', mullet: '바다에서 강으로 올라오는 숭어예요.',
  s_barley: '보리 씨앗이에요. 괭이로 간 밭에 심어요.', s_wheat: '밀 씨앗이에요. 물을 넉넉히 주면 잘 자라요.', s_lentil: '렌틸콩 씨앗이에요.', s_flax: '아마 씨앗이에요. 다 자라면 세마포를 짤 수 있어요.', s_cucumber: '오이 씨앗이에요.', s_onion: '양파 씨앗이에요.',
  // ---- 가게에서만 파는 것
  tent2: '두껍게 짠 천막 천이에요. 텐트가 2단계가 되어, 자고 나면 체력이 가득 차요.', tent3: '처마와 깔개까지 갖춘 넉넉한 장막이에요. 텐트가 3단계가 되어, 자고 나면 체력과 기력이 모두 가득 차요.',
  mapEgypt: '서기가 파피루스에 그린 애굽 땅 지도예요. 사면 지도에 마을과 나루와 신전이 「들은 곳」으로 나타나요.', mapCanaan: '헤브론에서 도단까지의 길을 그린 지도예요. 사면 지도에 「들은 곳」으로 나타나요.',
  'tool:hoe': '밭을 가는 괭이예요. 손에 들고 밭 앞에서 써요.', 'tool:jar': '물을 긷는 항아리예요. 우물에서 채워 마시고, 밭에 주고, 남에게 나눠 줘요.', 'tool:bigjar': '물이 더 많이 드는 큰 항아리예요.',
  'tool:sickle': '곡식을 베는 낫이에요. 손으로 뜯는 것보다 많이 거둬요.', 'tool:axe': '나무를 찍는 손도끼예요. 통나무를 얻어요.', 'tool:hammer': '바위를 깨는 돌망치예요. 돌과 부싯돌을 얻어요.',
  'tool:shears': '양털을 깎는 가위예요.', 'tool:staff': '목자의 지팡이예요. 양을 몰고, 짐승을 쫓고, 먼 길에 몸을 기대요. 「주의 지팡이와 막대기가 나를 안위하시나이다」(시 23:4).',
  'tool:umbrella': '잎사귀를 엮은 우산이에요. 비를 막고 한낮 햇볕도 가려 줘요.', 'tool:torch': '갈대와 가지를 묶은 횃불이에요. 동굴과 밤길을 밝혀요.', 'tool:fishrod': '갈대 낚싯대예요. 물가에서 물고기를 낚아요.', 'tool:cloak': '양털로 지은 두꺼운 겉옷이에요. 입으면 밤 추위를 덜 타요.',
};
L.LORE = LORE;
L.of = function (key) { if (!key) return null; const I = Game.ITEMS, H = G.Hearth, CU = G.Cuisine;
  if (key.indexOf('gear:') === 0) { const k = key.slice(5), g = G.Combat && G.Combat.GEAR && G.Combat.GEAR[k]; if (!g) return null; return { n: g.n, t: g.d || '', fx: '' }; }
  if (key.indexOf('tool:') === 0) { const k = key.slice(5); return { n: (Game.TOOLS && Game.TOOLS[k]) || k, t: LORE[key] || '', fx: '' }; }
  const it = I[key]; const dish = H && H.DISH && H.DISH[key]; let t = LORE[key] || (it && it.d) || '';
  if (dish) { const taste = H.TASTE && H.TASTE[key]; t = [taste ? `「${taste}」` : '', dish.how ? `만드는 법: ${dish.how}` : '', dish.ref || ''].filter(Boolean).join('\n') || t; }
  else if (!t && H && H.howTo && H.howTo(key)) t = `만드는 법: ${H.howTo(key)}`;
  let fx = ''; try { if (CU && CU.line && it && (it.cat === 'food' || it.cat === 'crop' || it.cat === 'fish')) fx = CU.line(key) || ''; } catch (e) { }
  if (!fx && it && (it.hp || it.stam)) fx = [it.hp ? `체력 +${it.hp}` : '', it.stam ? `기력 +${it.stam}` : ''].filter(Boolean).join(' · ');
  if (it && it.p > 0 && it.cat !== 'key' && it.cat !== 'quest') fx = (fx ? fx + ' · ' : '') + `값 은 ${it.p}`;
  return { n: it ? it.n : key, t, fx }; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
{ const css = document.createElement('style'); css.textContent = '.loreBox{grid-column:1/-1;margin:-2px 0 8px;padding:10px 12px;border-radius:10px;background:rgba(255,233,184,.09);border:1px solid rgba(255,217,138,.28);color:#f3e6c8;font-size:13px;line-height:1.55;white-space:pre-line}.loreBox b{display:block;color:#ffd98a;font-size:12px;margin-top:6px;font-weight:600}.loreBox i{display:block;color:#b9ad90;font-style:normal;font-size:12px}[data-lore]{cursor:pointer}[data-lore].loreOn{outline:1px solid rgba(255,217,138,.55)}'; document.head.appendChild(css); }
/* a tap on the card (not on one of its buttons) opens or closes the description under it */
document.addEventListener('click', function (e) { const el = e.target.closest && e.target.closest('[data-lore]'); if (!el || e.target.closest('button')) return; const key = el.dataset.lore; if (!key && !el.dataset.lored) return;
  const nx = el.nextElementSibling; if (nx && nx.classList.contains('loreBox')) { nx.remove(); el.classList.remove('loreOn'); return; }
  const par = el.parentNode; par.querySelectorAll('.loreBox').forEach(b => b.remove()); par.querySelectorAll('.loreOn').forEach(b => b.classList.remove('loreOn'));
  const o = L.of(key) || { n: '', t: '', fx: '' }, t = o.t || el.dataset.lored || '', fx = [el.dataset.lorefx || '', o.fx || ''].filter(Boolean).join(' · ');
  const box = document.createElement('div'); box.className = 'loreBox'; box.innerHTML = (t ? esc(t) : '<i>아직 알려진 이야기가 없어요.</i>') + (fx ? `<b>${esc(fx)}</b>` : ''); el.after(box); el.classList.add('loreOn'); G.Audio && G.Audio.sfx && G.Audio.sfx('page', { vol: 0.35 }); }, false);
})(window.G);
