/* 약속의 길 — 사람마다 다른 성격과 말 (v18.13f)
   · Every person gets a profile: age (아이 / 어른 / 노인), 남·여, MBTI, a one-word temperament, a hobby, a worry, a dream and a
     favourite food — drawn so that no two people in the world share the same set (and nobody in one place shares an MBTI
     while there are types left). Main characters have hand-written profiles and lines for each part of the story.
   · What they say comes from their own pool: their work, where they live, the hour, the weather, the story so far, and their
     temperament (E talks more, I less; T facts, F feelings; J plans, P whatever comes). Children talk like children (play,
     animals, parents) — never about making a living. Women speak softly. A line said by one person is never given to another;
     each person goes through their own lines before repeating.
   · 부딪히면: a short reaction in a speech bubble (by age and temperament) and a little stagger; pushed off their place, they
     walk back to it after a moment.
   · 하루 일과: people without a schedule of their own still keep a day — stretch at dawn, work, sit in the noon heat, rest in the
     evening, doze at night — on their own spot, so nobody needed by the story ever wanders off. */
'use strict';
(function (G) {
const Game = G.Game, EP = G.EP && G.EP.joseph; if (!EP) return;
const Pe = G.Persona = {};
const isFam = id => !!(EP.family && EP.family[id]);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
const S = () => Game.S(), P = () => Game.P;
const idx = k => Game.stepOrder().indexOf(k), st = () => idx(S().step);
const era = () => { const i = st(); return i < idx('c1_pit') ? 'canaan' : i < idx('c3_cell') ? 'slave' : i < idx('c4_answer') ? 'prison' : i < idx('g1_spy') ? 'vizier' : i < idx('g6_wagons') ? 'brothers' : 'goshen'; };
// 받침에 맞는 조사
const jong = w => { const c = String(w).trim().slice(-1).charCodeAt(0); return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0; };
const J = (w, a, b) => w + (jong(w) ? a : b);
const fill = (t, p) => t.replace(/\{(\w+)(?:\|([^}]*))?\}/g, (m, k, js) => { const v = p[k] === undefined || p[k] === null ? m : p[k]; if (!js) return v; const [a, b] = js.split('/'); return J(v, a, b); });

// =================================================================== who is who
const FEM = /여인|아내|레아|디나|아스낫|여종|할머니|어머니|딸|소녀|타뮈|네페르|메리트|타-네트|우세트|티티|유모/;
const OLD = /노인|늙은|^야곱$|할머니|장로|촌장|현인|점술가/;
function roleOf(n) { const nm = n.name || '', d = n.d;
  const R = [[/목동|목자|양치기/, 'shepherd'], [/농부|밭/, 'farmer'], [/상인|장사|대상/, 'merchant'], [/토기/, 'potter'], [/베 짜/, 'weaver'], [/물 긷/, 'water'], [/요리/, 'cook'], [/정원/, 'gardener'],
    [/서기관/, 'scribe'], [/간수|문지기|호위병|장교/, 'guard'], [/죄수/, 'prisoner'], [/관원장|관리|사자|감독|청지기|촌장/, 'official'], [/제사장|점술가|현인/, 'priest'], [/사냥꾼/, 'hunter'], [/벽돌/, 'builder'],
    [/소 치는|종 |^종|여종/, 'servant'], [/그림/, 'artist'], [/아이|소년/, 'child']];
  for (const [rx, r] of R) if (rx.test(nm)) return r; if (d.folk) return d.folk.role === 'oldwoman' ? 'elder' : d.folk.role; return 'folk'; }
function regionOf(n) { const x = n.d.x, z = n.d.z;
  if (x > 110) return z > 100 ? 'hebron' : z > -60 ? 'shechem' : 'dothan';
  if (x > 60) return Math.hypot(x - 78, z - 56) < 40 ? 'goshen' : 'desert';
  if (Math.hypot(x + 140, z + 40) < 30) return 'west'; if (Math.hypot(x + 145, z - 128) < 30) return 'south';
  if (z > 100) return 'market'; if (z > 28) return 'potiphar'; if (z > -20) return 'prison'; if (z < -125) return x > 0 ? 'house' : 'palace'; return 'city'; }

// =================================================================== traits (each list is drawn without repeats inside its group)
const T = {
  hobby: { kid: ['도마뱀 쫓아가기', '돌멩이 멀리 던지기', '진흙으로 동물 빚기', '나뭇잎 배 띄우기', '조약돌 모으기', '막대기로 땅에 그림 그리기', '새끼 염소랑 달리기', '별 세기', '물장구치기', '꽃목걸이 엮기', '개미 줄 따라가기', '숨바꼭질', '피리 흉내 내기', '깃털 모으기'],
    man: ['새벽 낚시', '나무 깎아 숟가락 만들기', '씨름', '갈대 피리 불기', '세네트 놀이', '나귀 털 빗기기', '돌 쌓아 담 고치기', '옛 노래 흥얼거리기', '새 울음소리 흉내', '별자리 보기', '지팡이 다듬기', '대추야자 말리기', '활시위 손보기', '강가 산책'],
    woman: ['향유 만들기', '실에 고운 물 들이기', '빵에 무늬 새기기', '연꽃 기르기', '아이들에게 노래 가르치기', '허브 말리기', '팔찌 엮기', '옛이야기 모으기', '머리 땋아 주기', '들꽃 말리기', '꿀 과자 굽기', '새 지저귐 듣기'],
    old: ['옛날이야기 들려주기', '햇볕 쬐며 졸기', '바구니 엮기', '손주 업어 주기', '새벽 기도', '오래된 노래 부르기', '지팡이로 땅에 글씨 쓰기', '별 이름 외우기'] },
  worry: { kid: ['엄마가 아끼는 그릇을 깬 것', '키가 잘 안 크는 것', '친구랑 다툰 것', '새끼 염소가 나를 안 따라오는 것', '밤에 늑대 우는 소리', '이가 흔들리는 것', '아끼던 조약돌을 잃어버린 것', '형이 안 놀아 주는 것', '천둥소리'],
    man: ['지붕 흙벽이 갈라진 것', '나귀가 다리를 저는 것', '아들이 말을 안 듣는 것', '이웃과 밭 경계로 다툰 것', '빌린 쟁기를 아직 못 돌려준 것', '허리가 예전 같지 않은 것', '손님 대접할 양이 모자란 것', '강물이 늦게 불어나는 것', '칼날이 무뎌진 것', '장사 길에 도적이 나온다는 소문'],
    woman: ['막내가 기침을 하는 것', '빵이 자꾸 타는 것', '멀리 시집간 딸 소식', '물동이에 금이 간 것', '남편이 늦게 오는 것', '아끼는 그릇이 이 빠진 것', '옷감 물이 고르게 안 드는 것', '어머니 무릎이 아프신 것', '아이가 강가에 너무 가까이 가는 것'],
    old: ['무릎이 쑤시는 것', '눈이 침침한 것', '손주들이 멀리 사는 것', '밤에 잠이 잘 안 오는 것', '옛 친구들이 하나둘 떠난 것'] },
  dream: { kid: ['낙타 타 보기', '총리님 수레 타 보기', '피라미드 꼭대기 올라가 보기', '나중에 사냥꾼 되기', '엄마한테 꽃목걸이 걸어 주기', '바다 보기', '제일 빠른 아이 되기', '강아지 키우기', '큰 물고기 잡기'],
    man: ['내 밭 한 뙈기 갖기', '강 끝까지 배 타고 가 보기', '아들에게 일을 물려주기', '새 집을 짓는 것', '좋은 나귀 한 쌍 사기', '먼 친척을 다시 만나는 것', '내 이름이 붙은 우물을 파는 것', '아이들 혼례를 잘 치르는 것'],
    woman: ['딸에게 고운 혼례 옷 지어 주기', '작은 정원 가꾸기', '고향 어머니 다시 뵙기', '온 마을 아이들 모아 잔치하기', '연꽃 연못 하나 갖기', '세마포 한 필 다 짜기', '향유 가게 열기'],
    old: ['손주 혼례 보기', '고향 땅 한 번 더 밟기', '조용히 하나님 앞에 눕기', '옛 친구 무덤에 꽃 놓기', '내 이야기를 누가 적어 주는 것'] },
  food: { kid: ['꿀 과자', '대추야자', '무화과', '구운 새알', '단 참외', '건포도'], man: ['렌틸 죽', '구운 생선', '양고기 국', '보리떡', '염소젖 치즈', '양파 볶음', '커민 고기 꼬치'], woman: ['석류', '꿀 바른 빵', '박하 차', '오이 냉채', '무화과 과자', '엉긴 젖'], old: ['따뜻한 보리죽', '부드러운 무화과', '꿀물', '렌틸 수프'] },
  temper: ['느긋한', '꼼꼼한', '수다스러운', '수줍은', '호기심 많은', '고집 센', '다정한', '무뚝뚝한', '장난기 많은', '걱정 많은', '씩씩한', '진지한', '유쾌한', '조용한', '눈치 빠른', '덤벙대는', '의젓한', '낙천적인', '깐깐한', '배려 깊은', '엉뚱한', '용감한', '느릿한', '부지런한', '솔직한', '상냥한', '꿈 많은', '털털한'] };
// compose longer lists so that every person can have a value of their own (a value is never given twice; when a list runs out the
// lines that need it are simply not used for that person)
const X2 = (pre, base) => pre.flatMap(p => base.map(b => p + b));
T.hobby.man = X2(['새벽에 ', '해 질 녘에 ', '쉬는 날 ', '비 오는 날 ', '밤에 '], T.hobby.man); T.hobby.woman = X2(['아침에 ', '오후에 ', '쉬는 날 ', '비 오는 날 ', '저녁에 '], T.hobby.woman);
T.hobby.kid = X2(['아침에 ', '낮에 ', '저녁에 '], T.hobby.kid); T.hobby.old = X2(['아침에 ', '낮에 ', '저녁에 '], T.hobby.old);
T.worry.man = X2(['요즘 ', '올해 들어 ', '며칠째 ', '지난달부터 ', '아침마다 '], T.worry.man); T.worry.woman = X2(['요즘 ', '며칠째 ', '지난달부터 ', '아침마다 ', '밤마다 '], T.worry.woman);
T.worry.old = X2(['요즘 ', '밤마다 ', '올해 들어 '], T.worry.old);
const MBTI = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

// =================================================================== main characters (hand-written)
const MAIN = {
  jacob: { mbti: 'INFJ', tp: '깊이 그리워하는', lines: { canaan: ['요셉아, 네 형들이 세겜에서 양을 치는데… 잘 있는지 보고 오너라.', '라헬이 살아 있었다면 너를 보고 얼마나 기뻐했을까.', '벧엘에서 본 사다리를 잊지 마라. 하나님은 약속을 지키신다.'], goshen: ['죽은 줄 알았던 아들의 얼굴을 다시 보다니… 이제 죽어도 여한이 없구나.', '고센 땅 풀이 참 좋구나. 양들이 살이 오르겠다.', '손주들아, 이리 오너라. 할아비가 축복해 주마.'] } },
  benjamin: { mbti: 'ESFP', tp: '해맑은', lines: { canaan: ['형! 이번엔 언제 돌아와? 꼭 금방 와야 해!', '형이 준 매끈한 돌멩이, 내 보물 상자에 넣어 뒀어.', '아버지가 형만 예뻐한대. 그래도 난 형이 제일 좋아!'] } },
  benjamin2: { mbti: 'ENFJ', tp: '다정한', lines: { brothers: ['…총리님, 제 형 요셉도 살아 있었다면 지금쯤 이 나이였을 거예요.', '아버지는 저를 품에서 놓지 않으셨어요. 저까지 잃을까 봐서요.'], goshen: ['형! 어릴 때처럼 같이 별 세러 가자. 이번엔 내가 더 많이 셀 거야.', '내 아이들 이름에 형 이야기를 담았어. 다시는 잃지 않으려고.'] } },
  leah: { mbti: 'ISFJ', tp: '속 깊은', lines: { canaan: ['요셉, 길 떠나기 전에 빵 좀 더 챙기렴. 형들 먹을 것도.', '네 어미 라헬과 나는 자매였단다. 너를 보면 그 아이 생각이 나.', '아버지 마음을 너무 아프게 하지 말아라.'] } },
  dinah: { mbti: 'INFP', tp: '조용한', lines: { canaan: ['요셉 오라버니, 세겜 쪽 길은 조심해요. 그곳엔… 아픈 기억이 많아요.', '들꽃 물로 천을 물들여 봤어요. 오라버니 옷처럼 고운 색은 안 나네요.'] } },
  hServ: { mbti: 'ISTJ', tp: '성실한', lines: { canaan: ['도련님, 형님들은 세겜 쪽으로 양을 몰고 가셨습니다.', '야곱 어르신 장막 끈은 제가 아침마다 다시 맵니다.'] } },
  shepBoy: { mbti: 'ESTP', tp: '날쌘', lines: { canaan: ['형, 그 알록달록한 옷 어디서 났어? 엄청 멋지다!', '우리 양들 중에 제일 말썽쟁이는 꼬리 까만 녀석이야.'] } },
  man: { mbti: 'INTJ', tp: '말수 적은', lines: { canaan: ['네 형들은 도단으로 간다더구나. 내가 들었다.', '찾는 이를 찾는 자는 결국 찾게 되지.'] } },
  reuben: { mbti: 'ISFJ', tp: '책임감 무거운', lines: { canaan: ['…아버지는 왜 저 아이만 저렇게 감싸실까. 그래도 해치면 안 된다.', '내가 맏이인데, 형제들 마음 하나 못 다스리는구나.'], brothers: ['내가 너희에게 그 아이를 해치지 말라 하지 않았더냐… 이제 그 값을 치르는구나.', '총리님의 눈빛이 어딘가 낯이 익소.'], goshen: ['요셉, 그날 구덩이에 돌아갔을 때 네가 없었다. 그 빈 구덩이가 평생 꿈에 나왔다.', '이제야 맏이 노릇을 하는 것 같구나.'] } },
  simeon: { mbti: 'ESTP', tp: '불같은', lines: { canaan: ['꿈 이야기는 이제 그만해라. 듣기 싫다.', '양 떼는 내가 다 몰았는데, 칭찬은 늘 저 녀석 몫이지.'], brothers: ['옥에 갇혀 보니… 그 아이가 구덩이에서 얼마나 무서웠을지 알겠더군.', '나를 두고 가도 좋다. 막내만은 지켜라.'], goshen: ['요셉, 내 성질 알지? 그래도 이제는 화가 나면 먼저 기도부터 한다.', '고센 무화과가 가나안 것보다 달다. 인정하마.'] } },
  levi: { mbti: 'ISTJ', tp: '엄격한', lines: { canaan: ['규칙은 규칙이다. 아버지 편애도 언젠가 값을 치를 거다.', '장막 말뚝은 깊이 박아야 바람에 안 뽑힌다.'], brothers: ['우리는 정탐꾼이 아니오. 정직한 사람들이오. …적어도 지금은.', '은이 자루에 그대로 있다니, 이게 무슨 일이냐.'], goshen: ['요셉, 너는 우리를 용서했지만 나는 아직 나를 다 용서하지 못했다.', '레위 집안 아이들에게 정직부터 가르치고 있다.'] } },
  judah: { mbti: 'ENTJ', tp: '앞장서는', lines: { canaan: ['그를 죽여서 무슨 이익이 있겠느냐. …차라리 팔자.', '형제들이 내 말을 듣는다. 그게 무겁기도 하다.'], brothers: ['막내 대신 제가 종이 되겠습니다. 아버지께 돌아갈 수 없습니다.', '저 아이를 데려가지 못하면 우리 아버지는 슬퍼하며 무덤에 내려가실 겁니다.'], goshen: ['내가 너를 팔자고 했던 입으로, 이제 너를 자랑하고 다닌다.', '사람은 바뀐다, 요셉. 하나님이 바꾸시면.'] } },
  dan: { mbti: 'INTP', tp: '따지기 좋아하는', lines: { canaan: ['꿈이 정말 하나님께로 온 거라면… 우리가 막을 수 있을까?', '저울은 바르게 달아야지. 형제 사이도 마찬가지고.'], brothers: ['곡식값을 냈는데 은이 그대로 돌아왔다. 이건 계산이 안 맞아.', '총리는 우리 집안 나이 순서를 어떻게 알았지?'], goshen: ['결국 그 꿈은 맞았어. 우리가 틀렸던 거지.', '이제는 다툼이 생기면 내가 판단해 준다. 공정하게.'] } },
  naphtali: { mbti: 'ENFP', tp: '바람 같은', lines: { canaan: ['저 언덕까지 누가 먼저 가나 내기할래? 난 사슴처럼 빠르다고!', '오늘 노을은 꼭 불타는 장막 같네.'], brothers: ['애굽은 넓기도 하지… 그런데 왜 이리 가슴이 답답할까.', '돌아가는 길은 내가 앞장설게. 발만은 자신 있으니까.'], goshen: ['요셉! 고센 언덕 끝까지 달리기 한 판 어때?', '좋은 소식은 바람처럼 전해야지. 가나안 친척들한테 다 알렸어.'] } },
  gad: { mbti: 'ESTJ', tp: '용맹한', lines: { canaan: ['늑대가 오면 내가 막는다. 너는 뒤에 있어.', '칼보다 중요한 건 지키려는 마음이지.'], brothers: ['애굽 군사들 눈빛이 매섭군. 그래도 우리 막내는 내가 지킨다.', '짐은 내가 더 지겠다. 아버지께 빨리 돌아가자.'], goshen: ['고센 경계는 내가 밤마다 돈다. 이제 우리 집이니까.', '요셉, 네 수레 호위는 언제든 내게 맡겨라.'] } },
  asher: { mbti: 'ESFP', tp: '먹보', lines: { canaan: ['배고프다… 요셉, 아버지가 빵 보내셨지? 그렇지?', '올리브기름 바른 빵이 세상에서 제일 맛있어.'], brothers: ['총리 집 잔치 음식이… 와, 이런 건 처음 먹어 봐.', '긴장되면 배가 더 고프더라.'], goshen: ['요셉, 애굽 요리사한테 꿀 과자 비법 좀 알려 달라고 해 줘.', '오늘 저녁은 내가 차린다. 기대해!'] } },
  issachar: { mbti: 'ISTP', tp: '묵묵한', lines: { canaan: ['…짐은 내가 들게.', '쉬는 것도 일이다. 그늘에 좀 앉아라.'], brothers: ['곡식 자루가 무겁군. 그래도 가족 먹일 거니까.', '…말보다 손이 먼저야.'], goshen: ['고센 땅은 일할 맛이 나. 흙이 좋아.', '…요셉, 고맙다. 그 말을 너무 늦게 했다.'] } },
  zebulun: { mbti: 'ENTP', tp: '꿈꾸는 장사꾼', lines: { canaan: ['언젠가 바닷가에 살 거야. 배가 오가는 곳 말이야.', '대상들이 오가는 길목에 장사하면 부자 될 텐데.'], brothers: ['애굽 장터 좀 봐! 물건이 산더미야. 이런 데서 장사하면…', '총리가 우리 사정을 다 아는 것 같아. 신기하지 않아?'], goshen: ['나일 배를 보니 내 꿈이 다시 생각나. 언젠가 바닷가로 가야지.', '요셉, 고센 곡식으로 장사 길을 하나 열어 볼까?'] } },
  ameni: { mbti: 'INFJ', tp: '지혜로운', lines: { slave: ['히브리 젊은이, 애굽 말은 귀보다 마음으로 배우는 거라네.', '이 집에서 오래 살아남는 법? 정직, 그리고 웃음이지.'], vizier: ['허허, 내가 말을 가르친 종이 총리가 되다니. 오래 살고 볼 일일세.'] } },
  neb: { mbti: 'ISTJ', tp: '깐깐한', lines: { slave: ['곳간 숫자는 틀리면 안 된다. 손가락으로 두 번 세라.', '주인님 집은 해 뜨기 전에 깨어 있어야 한다.'] } },
  cook: { mbti: 'ESFP', tp: '흥 많은', lines: { slave: ['타! 오늘은 마늘을 듬뿍 넣었지. 냄새 좋지?', '부엌은 내 왕국이야. 함부로 들어오지 마! …아니, 맛은 봐도 돼.'] } },
  gardener: { mbti: 'ISFP', tp: '꽃 같은', lines: { slave: ['종려나무는 물을 깊이 줘야 해요. 뿌리가 깊으니까요.', '연꽃은 아침에 피고 저녁에 잠들어요. 사람이랑 비슷하죠.'] } },
  scribe: { mbti: 'INTJ', tp: '치밀한', lines: { slave: ['숫자는 거짓말을 하지 않지. 사람이 할 뿐.', '파피루스는 귀하네. 한 글자도 헛되이 쓰지 말게.'] } },
  maid: { mbti: 'ESFJ', tp: '살가운', lines: { slave: ['요셉, 오늘 빨래는 내가 할게요. 대신 물 좀 길어 줄래요?', '안채는 요즘 조용해요. 조심해서 다녀요.'] } },
  weaver: { mbti: 'ISFP', tp: '손끝 고운', lines: { slave: ['아마 세 단이면 세마포 한 필이 나와요. 손가락이 아프지만 보람차요.', '실이 엉키면 서두르지 말고 처음부터 풀어야 해요.'] } },
  keeper: { mbti: 'ESTJ', tp: '엄하지만 공정한', lines: { prison: ['네게 맡긴 일은 내가 다시 보지 않는다. 그만큼 믿는다는 뜻이다.', '옥에도 질서가 있어야 사람이 산다.'] } },
  cupbearer: { mbti: 'ESFJ', tp: '잘 잊는', lines: { prison: ['포도주 맛은 혀끝이 아니라 코로 먼저 본다네.', '내가 풀려나면 너를 꼭 기억하겠네! …정말일세.'], vizier: ['…그대를 잊었던 그 두 해, 지금도 부끄럽소.'] } },
  baker: { mbti: 'INFP', tp: '불안한', lines: { prison: ['꿈에 새들이 내 광주리를 쪼아 먹었어… 무슨 뜻일까.', '갓 구운 빵 냄새가 그리워.'] } },
  youngP: { mbti: 'ENFP', tp: '겁 많지만 밝은', lines: { prison: ['형, 여기 쥐가 있어요! …근데 좀 귀엽다.', '형이 기도하는 거 보고 나도 따라 해 봤어요.'] } },
  oldP: { mbti: 'INTP', tp: '농담 잘하는', lines: { prison: ['이 벽 돌을 다 세어 봤지. 삼백일흔둘. 내일은 다시 세어야지.', '젊은이, 기다림도 일이라네.'] } },
  pharaoh: { mbti: 'ENTJ', tp: '위엄 있는', lines: { vizier: ['애굽 온 땅이 네 손에 있다. 실망시키지 마라.', '꿈은 신들이 아니라… 네 하나님이 보여 주셨다 했지.'] } },
  potiphar: { mbti: 'ESTJ', tp: '엄격한', lines: { slave: ['네가 맡은 뒤로 이 집에 복이 넘친다. 이상한 일이지.', '내 집 일은 너에게 맡기고, 나는 왕궁 일만 보겠다.'] } },
  steward2: { mbti: 'ISTJ', tp: '충직한', lines: { vizier: ['총리님, 오늘 들어온 곡식 장부입니다. 한 톨도 틀림없습니다.'], brothers: ['분부대로 했습니다. …총리님 눈가가 붉으십니다.'] } },
  hunterE: { mbti: 'ISTP', tp: '말보다 활', lines: { vizier: ['바람이 동쪽에서 붑니다. 오늘은 짐승들이 서쪽 언덕에 있을 겁니다.', '활은 팔이 아니라 숨으로 쏘는 겁니다.'] } },
  painter: { mbti: 'ENFP', tp: '상상력 풍부한', lines: { vizier: ['총리님 얼굴도 그려 보고 싶어요! 근데 가만히 있어 주셔야 해요.', '나일 강을 파랗게 칠할까요, 초록으로 칠할까요?'] } },
  overseerC: { mbti: 'ESTJ', tp: '부지런한', lines: { vizier: ['곳간 문은 해가 뜨면 열고 해가 지면 닫습니다.'] } },
  brick: { mbti: 'ESFP', tp: '흥얼거리는', lines: { vizier: ['진흙 둘에 짚 하나, 노래 한 소절! 그래야 벽돌이 단단해지지요.'] } },
};

// =================================================================== generic line pools by register (kid · kidF · man · woman · oldM · oldF)
const SELF = { // personal templates: {hobby} {worry} {dream} {food} {you}
  kid: ['있잖아요 {you}, 나 요즘 {hobby|에/에} 푹 빠졌어요!', '{hobby} 하고 나서 먹는 {food|이/가} 제일 맛있어요! {you|은/는}요?', '{worry|이/가} 좀 걱정돼요… 그래도 금방 괜찮아질 거예요.', '나중에 커서 {dream}, 그거 꼭 할 거예요!', '{you}, 비밀 하나 알려 줄까요? 나 {hobby|은/는} 동네에서 제일 잘해요!'],
  kidF: ['{you}, 저 요즘 {hobby|이/가} 제일 재밌어요!', '{hobby} 하고 나면 {food} 생각이 나요. 헤헤.', '{worry|이/가} 마음에 걸려요… 엄마한테 말해 볼까요?', '제 소원은요, {dream}! 꼭 이뤄질 거예요.', '쉿, 이건 비밀인데요… 저 {hobby|을/를} 혼자 연습하고 있어요.'],
  man: ['요즘 {hobby|에/에} 재미를 붙였소.', '{worry} 때문에 머리가 좀 아프오.', '언젠가 {dream}, 그게 내 바람이오.', '{hobby} 하고 와서 먹는 {food}만 있으면 하루가 든든하지.', '일 끝나고 {hobby|을/를} 하면 시름이 싹 가신다오.'],
  woman: ['요즘 {hobby|에/에} 마음을 붙였어요. 손끝이 즐겁답니다.', '{worry}… 그게 자꾸 마음에 걸리네요.', '언젠가 {dream}, 그게 제 작은 소원이에요.', '{food|을/를} 맛있게 하는 비법이 있어요. {hobby} 하다가 떠올랐답니다.', '저녁이면 {hobby|을/를} 하며 하루를 정리해요.'],
  oldM: ['허허, 이 나이에 {hobby}만 한 낙이 없지.', '{worry}… 늙으면 다 그렇다네.', '눈감기 전에 {dream}, 그거 하나 바라네.', '{hobby} 하고 나서 먹는 {food} 한 그릇이면 보약이 따로 없지.'],
  oldF: ['아이고, 요즘은 {hobby|이/가} 제일 재미있다오.', '{worry}… 그래도 하나님이 다 아시겠지요.', '내 마지막 소원은 {dream}이라오.', '{hobby} 하다가 {food|을/를} 쑤어 놓았다오. 출출하면 들러요.'] };
const MB = { // temperament flavour, one line per letter, each tied to the person's own hobby or worry so no two people say it alike
  kid: { E: ['{you}, 나랑 {hobby} 할래요? 응? 응?'], I: ['…저는 {hobby} 할 때가 제일 좋아요. 조용히요.'], T: ['{hobby} 해 보니까요, 방법이 있어요! 제가 알아냈어요.'], F: ['{worry|이/가} 생각나면 마음이 콩닥콩닥해요.'], J: ['{hobby|은/는} 매일 같은 때에 해요. 약속이에요.'], P: ['오늘은 {hobby} 할까, 아니면… 음, 그때 가서 정할래요!'] },
  man: { E: ['{hobby} 이야기라면 밤새도록 할 수 있소!'], I: ['…{hobby} 할 때는 아무도 말을 안 걸었으면 좋겠소.'], T: ['{worry}? 따져 보면 방법은 있소.'], F: ['{worry|을/를} 생각하면 마음이 무겁구려.'], J: ['{hobby|은/는} 정해 둔 때에만 하오. 그래야 일이 밀리지 않지.'], P: ['{hobby}? 마음 내키면 하는 거지.'] },
  woman: { E: ['어머, {hobby} 좋아하세요? 같이 이야기해요!'], I: ['…{hobby} 할 때는 혼자인 게 좋아요.'], T: ['{worry}… 하나씩 따져 보면 풀릴 거예요.'], F: ['{worry|을/를} 떠올리면 눈시울이 붉어져요.'], J: ['{hobby|은/는} 늘 같은 시간에 해요. 그래야 마음이 놓여요.'], P: ['{hobby}요? 그날 기분 따라 해요. 호호.'] },
  oldM: { E: ['이리 앉게. {hobby} 이야기 좀 들려줌세.'], I: ['…{hobby}나 하며 조용히 지내는 게 좋다네.'], T: ['{worry}… 오래 살아 보니 다 지나가더군.'], F: ['{worry|을/를} 생각하면 가슴이 저리구먼.'], J: ['{hobby|은/는} 날마다 빼먹지 않는다네.'], P: ['{hobby|이야/야} 내키면 하고 아니면 말고, 허허.'] },
  oldF: { E: ['아이고, {hobby} 얘기 들어 볼라우?'], I: ['…{hobby} 하며 조용히 지낸다오.'], T: ['{worry}… 그래도 방도는 있다오.'], F: ['{worry|을/를} 생각하면 눈물이 나요.'], J: ['{hobby|은/는} 날마다 꼭 한다오.'], P: ['오늘은 {hobby|이나/나} 할까, 볕이나 쬘까.'] } };
const ROLE = { // what their work is like (all ages that do it)
  shepherd: ['양은 목자 목소리를 알아들어요. 낯선 소리엔 꿈쩍도 안 하지요.', '어린양은 품에 안고 가야 뒤처지지 않아요.', '물 있는 곳에 풀 있고, 풀 있는 곳에 양이 있지요.'],
  farmer: ['씨를 뿌린 날부터 하늘만 쳐다보게 돼요.', '돌을 골라내야 쟁기가 안 상해요.', '보리 이삭이 고개를 숙이면 거둘 때가 온 거예요.'],
  merchant: ['좋은 물건은 사람을 다시 오게 하지요.', '저울추를 속이는 장사꾼은 오래 못 가요.', '향품 냄새만 맡아도 어디서 왔는지 안다오.'],
  potter: ['진흙은 손이 이끄는 대로 모양이 돼요.', '가마 불이 너무 세면 항아리가 울어요. 쩍 하고요.', '좋은 항아리는 두드려 보면 맑은 소리가 나요.'],
  weaver: ['실 한 올 한 올이 모여 옷 한 벌이 돼요.', '이 무늬는 어머니께 배운 거예요.', '세마포는 햇빛에 비춰 봐야 고운지 알 수 있어요.'],
  water: ['새벽 물이 제일 맑고 시원해요.', '물동이가 무거워도 집에 물이 있어야 마음이 놓여요.', '우물가에 오면 온 동네 소식을 다 들어요.'],
  cook: ['불 조절이 요리의 절반이에요.', '소금은 마지막에 한 꼬집이면 충분해요.'],
  gardener: ['나무도 사람처럼 아침 물을 좋아해요.', '시든 잎을 따 줘야 새 잎이 나요.'],
  scribe: ['숫자 하나 틀리면 곳간 하나가 비어요.', '갈대 붓은 비스듬히 잘라야 글씨가 곱소.'],
  guard: ['교대 시간이 늦으면 다리가 저려요.', '문은 지키는 사람이 졸면 문이 아니오.'],
  prisoner: ['여기선 해가 창으로 얼마나 들어오는지로 시간을 재요.', '밥은 적어도 간수장이 공평하게 나눠 줘서 다행이에요.'],
  official: ['보고는 짧게, 일은 길게 하는 게 좋소.', '장부는 해 지기 전에 맞춰야 하오.'],
  priest: ['별의 움직임엔 다 질서가 있소.', '말을 아끼는 것이 지혜의 시작이오.'],
  hunter: ['바람을 등지고 다가가야 짐승이 냄새를 못 맡소.', '새벽에 가젤이 물 마시러 내려오지.'],
  builder: ['벽돌은 햇볕에 사흘은 말려야 해요.', '기초가 비뚤면 지붕까지 비뚤어요.'],
  servant: ['일은 고돼도 주인 집 사람들이 따뜻해서 견딜 만해요.', '부지런하면 손이 먼저 일을 알아요.'],
  artist: ['색은 돌을 갈아서 만들어요. 초록은 공작석이에요!'],
  child: [], folk: [], elder: ['젊은이, 서두르지 마오. 좋은 것은 천천히 자란다오.'] };
const REGION = { // where they live: adult line, child line
  hebron: [['헤브론 상수리 숲은 아브라함 할아버지 때부터 있었대요.', '마므레 상수리나무 아래가 제일 시원해요.', '야곱 어르신 장막엔 늘 손님이 끊이지 않아요.'], ['상수리나무 그늘에서 낮잠 자면 최고예요!', '양 우리 옆에 새끼 양이 태어났어요!']],
  shechem: [['세겜 들은 풀이 좋아서 양 치기 좋아요.', '이 근방 우물은 야곱 어르신이 파신 거예요.'], ['세겜 언덕에서 굴러 내려가면 진짜 재밌어요!']],
  dothan: [['도단 평원은 대상들이 지나가는 길목이에요.', '이 근처엔 마른 구덩이가 많으니 조심해요.'], ['저기 낙타 행렬 봤어요? 엄청 길어요!']],
  desert: [['사막에선 별을 보고 길을 찾아요.', '낮엔 그늘, 밤엔 모닥불. 그게 사막의 법이에요.'], ['모래가 발가락 사이로 들어와요! 간지러워요.']],
  market: [['노예 장터는 늘 시끄러워요. 사람 사고파는 소리는 들어도 마음이 안 좋아요.', '이 장터엔 먼 나라 말이 다 섞여 있어요.'], ['장터 원숭이 봤어요? 사과를 훔쳐 갔어요!']],
  potiphar: [['보디발 장군 댁은 정원이 아름다워요.', '이 집은 손님이 많아서 부엌 불이 꺼질 날이 없어요.'], ['정원 연못에 개구리가 산대요!']],
  prison: [['옥 안에도 아침은 와요. 창으로 드는 빛이 반가워요.', '여기선 이름보다 죄목으로 불려요. 그게 서럽지요.'], ['여기 오래 있으면 어른들도 울어요…']],
  palace: [['궁 앞 오벨리스크는 해가 뜨면 금빛으로 빛나요.', '궁 안에선 발소리도 조심해야 해요.'], ['궁에 사는 고양이는 금목걸이를 해요!']],
  house: [['총리님 댁은 소박하면서도 정갈하지요.', '아스낫 마님은 아랫사람에게도 상냥하세요.'], ['총리님 댁 무화과나무에 올라가 봤어요!']],
  city: [['도성 장터는 해 뜨면 바로 열려요.', '성문 앞에 가면 먼 나라 소식을 다 들을 수 있어요.', '오늘은 시돈 상인이 왔다던데요.'], ['성문 앞 수레 구경이 제일 재밌어요!', '장터에서 꿀 과자 냄새가 나요!']],
  west: [['서쪽 마을은 대대로 나일 강가 밭을 일궈 왔어요.', '북쪽 나루에서 배를 타면 강을 건널 수 있어요.'], ['강가에 하마 발자국이 있대요! 무서워!']],
  south: [['남쪽 마을은 물이 넘치는 철이면 섬처럼 돼요.', '마을 서쪽 언덕은 물이 닿지 않는 높은 땅이에요.'], ['물이 불면 지붕 위에서 물구경해요!']],
  goshen: [['고센 땅은 풀이 좋아 양 치기 딱이에요.', '가나안에서 온 사람들 말씨가 정겹네요.'], ['고센엔 양이 엄청 많아요! 다 세어 보려다가 잠들었어요.']] };
const ERA = { // the story so far, as each person feels it: [adult, child]
  vizier: [['풍년이라 {food}도 넉넉해요. {hobby} 할 여유도 생겼지요.', '곳간 짓는 망치 소리가 들려도 {hobby}만 하면 마음이 편해요.'], ['곳간이 산만 해요! {hobby} 하다가 구경했어요.']],
  brothers: [['흉년이라도 곳간 덕분에 {food}는 아직 먹을 수 있어요. 감사한 일이지요.', '먼 나라 사람들이 줄을 서요. 그래도 {hobby}는 거르지 않아요.'], ['곳간 앞에 낙타가 엄청 많아요! {hobby} 하다 말고 보러 갔어요.']],
  goshen: [['가나안 사람들이 오니 {hobby} 친구가 늘었어요.'], ['가나안에서 온 친구랑 {hobby} 했어요! 말이 좀 웃겨요.']] };
const TIME = { // the hour and the weather: [adult, child]
  dawn: [['새벽엔 {hobby}부터 하고 하루를 열어요.'], ['하암… 졸려요. 그래도 {hobby} 하러 나왔어요!']], noon: [['한낮 더위엔 {food} 생각이 간절하네요. {hobby}는 저녁으로 미뤄야겠어요.'], ['더워요! {hobby} 하다가 그늘로 도망 왔어요.']],
  eve: [['해가 지니 {worry} 생각이 또 나네요.'], ['해 진다! {hobby} 조금만 더 하고 들어갈래요.']], night: [['잠이 안 와서… {dream} 생각을 하고 있었어요.'], ['쉿, 엄마 몰래 나왔어요. {hobby} 하고 싶어서요!']],
  rain: [['비 오는 날엔 {hobby|이/가} 더 생각나요.'], ['빗물 웅덩이에서 첨벙첨벙! {hobby}보다 더 재밌어요!']], dust: [['모래바람이네요. {worry}까지 날아가 버렸으면.'], ['눈에 모래 들어갔어요… {hobby}도 못 해요.']] };
const BUMP = { kid: { E: ['앗! 깜짝이야! 헤헤, 술래잡기예요?', '으앗, 부딪혔다! 다시 해요!', '{you}, 나 잡으러 온 거예요?'], I: ['…앗.', '(놀라서 눈이 동그래진다)', '히익… 죄송해요.'] },
  man: { E: ['어이쿠! 급한 일이라도 있소?', '허허, 길이 좁구려!', '조심하시오, 젊은이!'], I: ['…조심하시오.', '(말없이 한 걸음 비켜선다)', '흠.'] },
  woman: { E: ['어머나! 깜짝 놀랐잖아요.', '어머, 괜찮으세요? 저는 괜찮아요.', '호호, 바쁘신가 봐요!'], I: ['앗… 괜찮아요.', '(놀라 옷자락을 여민다)', '…조심해 주세요.'] },
  old: { E: ['아이고, 이 늙은이 넘어지겠네!', '허허, 젊은 사람 힘이 좋구먼!', '아이고 허리야… 조심 좀 하게나.'], I: ['…아이고.', '(지팡이를 고쳐 짚는다)', '천천히 다니게나.'] },
  animal: ['(음메에—)', '(놀라서 귀를 쫑긋 세운다)', '(푸르릉!)'] };
const STORY = { // 안부 묻기, by bond level 0–4
  kid: ['{worry|이/가} 좀 걱정이에요. 근데 {you|이랑/랑} 얘기하니까 괜찮아졌어요!', '저 사실 {hobby|을/를} 제일 좋아해요. {you}한테만 말하는 거예요!', '커서 {dream}, 그게 제 꿈이에요. 웃으면 안 돼요!', '{you|은/는} 제 제일 친한 어른이에요!', '{you}처럼 멋진 사람이 될 거예요. 약속!'],
  man: ['요즘은 그럭저럭 지내오. {worry|이/가} 좀 마음에 걸리지만.', '사실 나는 {hobby|을/를} 좋아하오. 아는 사람이 별로 없지.', '언젠가 {dream}, 그게 내 꿈이오. 처음 말하는구려.', '당신을 만나고 나서 하루가 덜 고되오.', '당신은 내게 형제나 다름없소.'],
  woman: ['잘 지내요. 다만 {worry|이/가} 조금 마음에 걸려요.', '저는 {hobby|을/를} 할 때가 제일 행복해요.', '{dream}, 그게 제 오랜 소원이에요. 들어 줘서 고마워요.', '당신과 이야기하면 마음이 편해져요.', '당신은 제게 가족 같은 분이에요. 늘 감사해요.'],
  old: ['늙으니 {worry|이/가} 제일 서럽구먼.', '이 나이에도 {hobby}만큼은 즐겁다네.', '내 마지막 소원은 {dream}이라네.', '자네 같은 젊은이가 있어 이 땅에 희망이 있지.', '자네는 내 손주나 다름없네. 하나님이 함께하시길.'] };

// =================================================================== profiles
const prof = {}; Pe.prof = prof;
const humans = () => EP.npcs.filter(d => !d.animal);
function reg(p) { return p.age === 'kid' ? (p.fem ? 'kidF' : 'kid') : p.age === 'old' ? (p.fem ? 'oldF' : 'oldM') : p.fem ? 'woman' : 'man'; }
function build() { if (Pe.ready) return; Pe.ready = true;
  const used = { hobby: {}, worry: {}, dream: {}, food: {}, temper: {} }, mbtiBy = {};
  const pick = (kind, grp, id) => { const L = (T[kind][grp] || T[kind]); const u = used[kind][grp] = used[kind][grp] || new Set(); let i = Math.floor(hash(id + kind) * L.length);
    for (let k = 0; k < L.length; k++) { const v = L[(i + k) % L.length]; if (!u.has(v)) { u.add(v); return v; } } return kind === 'temper' ? L[i] : null; };
  const list = humans().slice().sort((a, b) => ((MAIN[b.id] ? 1 : 0) - (MAIN[a.id] ? 1 : 0)) || (a.id < b.id ? -1 : 1)); // main characters choose first
  for (const d of list) { const nm = d.name || '', lk = d.look || {}, m = MAIN[d.id] || {};
    const age = lk.kid || (d.folk && d.folk.age === 'kid') || (d.scale && d.scale < 0.75) ? 'kid' : (lk.age === 'old' || (d.folk && d.folk.age === 'old') || OLD.test(nm)) ? 'old' : 'adult';
    const fem = !!(lk.fem || lk.headwear === 'veil' || FEM.test(nm)); const n0 = { name: nm, d };
    const region = regionOf(n0), role = roleOf(n0), grp = age === 'kid' ? 'kid' : age === 'old' ? 'old' : fem ? 'woman' : 'man';
    let mbti = m.mbti; if (!mbti) { const taken = mbtiBy[region] = mbtiBy[region] || new Set(); let i = Math.floor(hash(d.id + 'mb') * 16); for (let k = 0; k < 16 && taken.has(MBTI[(i + k) % 16]); k++) i++; mbti = MBTI[i % 16]; }
    (mbtiBy[region] = mbtiBy[region] || new Set()).add(mbti);
    prof[d.id] = { id: d.id, age, fem, region, role, mbti, temper: m.tp || pick('temper', 'all', d.id), hobby: pick('hobby', grp, d.id), worry: pick('worry', grp, d.id), dream: pick('dream', grp, d.id), food: pick('food', grp, d.id), main: m };
    prof[d.id].reg = reg(prof[d.id]); }
  // every pooled line goes to exactly one person (round robin inside each pool)
  const own = {}; for (const d of list) own[d.id] = [];
  const share = (pool, who) => { if (!who.length) return; pool.forEach((l, i) => own[who[i % who.length].id].push(l)); };
  const byReg = r => list.filter(d => prof[d.id].region === r);
  for (const r in REGION) { const ws = byReg(r); share(REGION[r][0], ws.filter(d => prof[d.id].age !== 'kid')); share(REGION[r][1], ws.filter(d => prof[d.id].age === 'kid')); }
  for (const r in ROLE) share(ROLE[r], list.filter(d => prof[d.id].role === r && prof[d.id].age !== 'kid'));
  for (const d of list) prof[d.id].own = own[d.id]; }
Pe.of = id => { build(); return prof[id]; };

// =================================================================== choosing what to say
const youOf = p => { const e = era(); return p.age === 'kid' ? (e === 'canaan' ? '형' : e === 'slave' || e === 'prison' ? '아저씨' : '총리님') : ''; };
function poolFor(p) { const r = p.reg, R = r.startsWith('kid') ? 'kid' : r, k = p.age === 'kid' ? 1 : 0, out = [], e = era(), S2 = S(), h = S2.time % 24, Wx = G.Weather, wk = Wx && Wx.kind ? Wx.kind(S2) : 'clear';
  const vars = { hobby: p.hobby, worry: p.worry, dream: p.dream, food: p.food, you: youOf(p) };
  const m = p.main && p.main.lines; if (m && m[e]) out.push(...m[e]); // the story's own words first
  out.push(...p.own);
  for (const t of SELF[r] || SELF[R] || []) out.push(fill(t, vars));
  const mb = MB[R] || MB.man; for (const c of p.mbti) if (mb[c]) out.push(...mb[c].map(t => fill(t, vars)));
  if (ERA[e] && (p.region !== 'hebron' || e === 'goshen')) out.push(...ERA[e][k].map(t => fill(t, vars)));
  const tk = h < 7 ? 'dawn' : h > 11.5 && h < 14.5 ? 'noon' : h > 17.5 && h < 20.5 ? 'eve' : (h > 21 || h < 4.5) ? 'night' : null; if (tk) out.unshift(...TIME[tk][k].map(t => fill(t, vars)));
  if (wk === 'rain' || wk === 'storm') out.unshift(...TIME.rain[k].map(t => fill(t, vars))); else if (wk === 'dust') out.unshift(...TIME.dust[k].map(t => fill(t, vars)));
  return out.filter((l, i) => l && !/\{\w/.test(l) && out.indexOf(l) === i); } // a line still holding a {slot} needed a value this person does not have
Pe.line = function (n) { const id = n.id || (n.d && n.d.id); const p = Pe.of(id); if (!p) return null; const pool = poolFor(p); if (!pool.length) return null;
  const mem = S().flags.pl = S().flags.pl || {}, said = mem[id] = mem[id] || [];
  let fresh = pool.filter(l => !said.includes(l)); if (!fresh.length) { said.length = 0; fresh = pool; }
  // the hour and weather lines lead now and then; otherwise go through the person's own lines in order
  const l = fresh[0]; said.push(l); if (said.length > 60) said.splice(0, said.length - 60); return l; };
Pe.lines = function (n) { const p = Pe.of(n.id || n.d.id); const a = Pe.line(n); if (!a) return null; const out = [{ n: n.name, t: a }];
  if (p.mbti[0] === 'E' && Math.random() < 0.55) { const b = Pe.line(n); if (b && b !== a) out.push({ n: n.name, t: b }); } return out; };
Pe.story = function (n, lv) { const p = Pe.of(n.id || n.d.id); if (!p) return null; const R = p.age === 'kid' ? 'kid' : p.age === 'old' ? 'old' : p.fem ? 'woman' : 'man';
  const v = { hobby: p.hobby, worry: p.worry, dream: p.dream, food: p.food, you: youOf(p) || '당신' }, t = fill(STORY[R][Math.max(0, Math.min(4, lv | 0))], v);
  const r = /\{\w/.test(t) ? fill({ kid: '{you}, 다음엔 {hobby} 같이 해 줄 거죠? 약속!', man: '언제 {hobby} 같이 하지 않겠소?', woman: '다음엔 {hobby} 같이 해요. 즐거울 거예요.', old: '{hobby|이나/나} 같이 하세나, 허허.' }[R], v) : t; return /\{\w/.test(r) ? null : r; }; /* v18.40 never show a {slot} */
Pe.describe = id => { const p = Pe.of(id); return p ? `${p.mbti} · ${p.temper} · 취미 ${p.hobby}` : ''; };

// hook the talk paths: named people (Bond), villagers (NpcAI small talk), plain greetings
if (G.Bond && G.Bond.talk) { const t0 = G.Bond.talk; G.Bond.talk = function (n, lines, done) { try { const S2 = S(), id = n.id || n.d.id, b = (S2.flags.plDay = S2.flags.plDay || {});
    const story = lines && lines.length && b[id] !== S2.day; b[id] = S2.day; // the story's line once a day, then their own words
    if (!story && !isFam(id)) { const L = Pe.lines(Object.assign(n, { id })); if (L) lines = L; } } catch (e) { console.error('persona', e); } return t0.call(this, n, lines, done); }; }
if (G.Greet && G.Greet.lines) { const g0 = G.Greet.lines; G.Greet.lines = function (n) { try { const L = Pe.lines(n); if (L) return L; } catch (e) { } return g0.apply(this, arguments); }; }

// =================================================================== bumping into people
const BMP = {}; Pe.bump = BMP;
let lpx = null, lpz = null, clk = 0;
function bumpTick(dt) { clk += dt; const Pl = P(), now = clk, ENT = Game.ENT; if (!ENT) return; // game time, so a pause does not count
  const mv = lpx === null ? 0 : Math.hypot(Pl.x - lpx, Pl.z - lpz) / Math.max(dt, 1e-3); lpx = Pl.x; lpz = Pl.z; const sp = mv > 15 ? 0 : Math.max(mv, Pl.spd || 0); // how fast the hero really moved (a jump across the map is not a bump)
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n.vis || n.talking || n.follow || n.pass || n.seatY || n.d.fixed || n.d.sit || n.sit || n.sleep || (typeof n.d.noTalk === 'function' && n.d.noTalk(Game.S(), Game))) continue; // (no friendly 「oops」 from someone the story keeps silent)
    const dx = n.x - Pl.x, dz = n.z - Pl.z, d = Math.hypot(dx, dz), b = BMP[id] || (BMP[id] = { t: -9, anc: null, idle: 0 });
    // remember where a person who stands still belongs
    if (!n.walk && !n.wander && !b.off) { b.idle += dt; if (b.idle > 1.5) b.anc = [n.x, n.z, n.homeFace !== undefined ? n.homeFace : n.face]; } else if (n.walk || n.wander) { b.idle = 0; b.anc = null; }
    const R = n.d.animal ? 1.25 : 0.95; // the hero's and their colliders meet at about 0.8 m
    if (d < R && sp > 1.1 && now - b.t > 2.6 && !(G.Cine && G.Cine.on) && !Game.cineOn) { b.t = now;
      const k = Math.min(0.35, (R - d) + sp * 0.04); n.x += dx / (d || 1) * k; n.z += dz / (d || 1) * k; if (b.anc) b.off = true;
      if (n.d.animal) { G.Life && G.Life.bubble && G.Life.bubble(id, BUMP.animal[Math.floor(Math.random() * 3)], 1.8); continue; }
      const p = Pe.of(id); if (!p) continue; const R2 = p.age === 'kid' ? 'kid' : p.age === 'old' ? 'old' : p.fem ? 'woman' : 'man', pool = BUMP[R2][p.mbti[0]], l = fill(pool[Math.floor(Math.random() * pool.length)], { you: youOf(p) || '' });
      G.Life && G.Life.bubble && G.Life.bubble(id, l, 2.2); n.face = Math.atan2(Pl.x - n.x, Pl.z - n.z);
      n.emote = { k: p.age === 'kid' ? (p.mbti[0] === 'E' ? 'laugh' : 'think') : p.mbti[0] === 'E' ? 'wave' : 'think', t: 0, dur: 1.4, amb: true };
      G.Audio && G.Audio.sfx('blip', { pitch: p.age === 'kid' ? 1.7 : p.fem ? 1.35 : 0.9, vol: 0.4, x: n.x, z: n.z }); }
    // walk back to their place once the hero has stepped away
    if (b.off && b.anc && !n.walk && d > 1.6 && now - b.t > 2.4) { const [ax, az, af] = b.anc, g = Math.hypot(n.x - ax, n.z - az);
      if (g > 0.3) { b.off = false; Game.npcWalk(id, ax, az, () => { n.homeFace = af; n.face = af; }, 1.1); } // pushed far: walk back
      else if (g > 0.015) { const st = Math.min(g, 0.7 * dt); n.x += (ax - n.x) / g * st; n.z += (az - n.z) / g * st; } // a small shuffle back
      else { b.off = false; n.x = ax; n.z = az; n.homeFace = af; n.face = af; } } } }

// =================================================================== a day for everyone (v18.14: each person keeps their own day)
/* Every person builds their own day from who they are: when they get up and go to bed (J early, P late, children and the old
   earlier), what they do in each hour-and-a-half block (their work, their hobby, chatting for E, sitting quietly for I), whether
   they rest at noon and how they spend the evening. At night they lie down and sleep; talking to them wakes them for a while. */
const ACT = { shepherd: ['gather', 'pet'], farmer: ['hoe', 'plant', 'harvest', 'water'], potter: ['mine', 'gather'], weaver: ['gather', 'pick'], water: ['gather', 'pick'], cook: ['gather', 'pick'], gardener: ['water', 'plant', 'pick'],
  builder: ['mine', 'hoe'], servant: ['gather', 'pick', 'reach'], artist: ['gather', 'think'], scribe: ['think', 'point'], guard: ['crossArms'], official: ['crossArms', 'point', 'think'], priest: ['kneelPray', 'think'],
  merchant: ['point', 'wave'], hunter: ['gather', 'stretch'], prisoner: ['sitHug', 'think'], child: [] };
const HOB = [[/피리|노래|흥얼|지저귐/, 'flute'], [/기도/, 'kneelPray'], [/별/, 'think'], [/깎|다듬|엮|땋|무늬|팔찌|바구니|빚기|그림|글씨|모으기|말리기|만들기|들이기|굽기/, 'gather'],
  [/털|염소|강아지|새끼/, 'pet'], [/씨름|달리기|던지기|물장구/, 'stretch'], [/졸기|햇볕/, 'sitg'], [/이야기|가르치기/, 'clap'], [/낚시|산책|따라가기|쫓아가기/, 'think']];
const hobAct = p => { for (const [rx, a] of HOB) if (rx.test(p.hobby || '')) return a; return null; };
const SOC = { E: ['wave', 'laugh', 'clap', 'point'], I: ['think', 'crossArms', 'sitHug'] };
const pickH = (arr, k) => arr.length ? arr[Math.floor(hash(k) * arr.length) % arr.length] : null;
function dayOf(id, p) { // the person's own clock (hours)
  const J = p.mbti[3] === 'J', ag = p.age, r = hash(id + 'clk');
  const wake = 5.0 + (J ? -0.45 : 0.55) + (ag === 'old' ? -0.5 : ag === 'kid' ? 0.4 : 0) + r * 0.7;
  const bed = 21.4 + (J ? -0.5 : 0.7) + (ag === 'kid' ? -1.4 : ag === 'old' ? -0.7 : 0) + hash(id + 'bed') * 0.8;
  return { wake, bed, nap: ag !== 'kid' && hash(id + 'nap') < (ag === 'old' ? 0.85 : p.mbti[0] === 'I' ? 0.6 : 0.35), napAt: 11.8 + hash(id + 'na') * 1.4 }; }
function blockAct(id, p, n, blk, day) { // what they do in a day block
  const pool = [], w = (a, k) => { if (a) for (let i = 0; i < k; i++) pool.push(a); };
  const work = ACT[p.role] || [], E = p.mbti[0] === 'E', T = p.mbti[2] === 'T', J = p.mbti[3] === 'J';
  for (const a of work) w(a, (T ? 3 : 2) + (J ? 1 : 0));
  w(hobAct(p), p.mbti[3] === 'P' ? 3 : 2);
  for (const a of SOC[E ? 'E' : 'I']) w(a, 1);
  if (n.d.act) w(n.d.act, 3); // the story's own pose for them stays their favourite
  if (p.age === 'old') w('sitg', 3); if (p.age === 'kid') { w('dance2', E ? 2 : 1); w('laugh', 1); w(null, 3); }
  if (!pool.length) w(null, 1);
  return pool[Math.floor(hash(id + ':' + day + ':' + blk) * pool.length) % pool.length]; }
function evenAct(id, p) { const L = p.age === 'old' ? ['sitg', 'sitg', 'warmHands', 'kneelPray'] : p.age === 'kid' ? ['sitHug', 'laugh', 'dance2', 'sitg'] : p.mbti[0] === 'E' ? ['warmHands', 'clap', 'laugh', 'sitg'] : ['sitg', 'sitHug', 'think', 'warmHands'];
  const h = hobAct(p); if (h === 'flute' || h === 'kneelPray') L.push(h, h); return pickH(L, id + 'ev' + S().day); }
const SLP = { kid: ['으응… {you}? 졸려요…', '음냐… 벌써 아침이에요?', '…꿈에서 맛있는 거 먹고 있었는데…'], man: ['음… 누구요? 이 밤중에.', '으음, 깜빡 잠들었구려. 무슨 일이오?', '허, 잠결에 놀랐소. 말해 보시오.'],
  woman: ['어머… 깜빡 잠들었네요. 무슨 일이세요?', '음… 이 밤에 어쩐 일이세요?', '아, 놀랐어요. 잠이 들었었나 봐요.'], old: ['허허… 늙은이 단잠을 깨우는구먼.', '으음… 누군가? 눈이 침침해서.', '아이고, 깜빡 잠들었다네.'] };
let pclk = 0; const WAKE = {};
Pe.asleep = n => !!(n && n.sleep && n._psleep);
Pe.wake = function (n) { const p = Pe.of(n.id); if (!p) { n.sleep = false; n._psleep = false; return false; }
  n.sleep = false; n._psleep = false; WAKE[n.id] = pclk + 150; n.act = null; n._ract = null; n.emote = { k: 'stretch', t: 0, dur: 1.8, amb: true };
  const g = p.age === 'kid' ? 'kid' : p.age === 'old' ? 'old' : p.fem ? 'woman' : 'man', L = SLP[g], l = fill(L[Math.floor(Math.random() * L.length)], { you: youOf(p) || '' });
  G.Audio && G.Audio.sfx('blip', { pitch: p.age === 'kid' ? 1.5 : p.fem ? 1.2 : 0.8, vol: 0.35, x: n.x, z: n.z });
  G.UI.say([{ n: n.name, t: l }], () => { n.talking = false; }); return true; };
let wasCine = false; /* v18.24 a scene starting or ending runs the routine at once */
function dayTick() { const ENT = Game.ENT; if (!ENT) return; const S2 = S(), h = S2.time % 24, tg = Game.curTarget, fam = isFam, Pl = P();
  /* v18.24 nobody the cutscene is using lies down to sleep: while a scene plays (or a scene chain is held behind black), everyone our day routine put to sleep or posed
     stands back up as the story placed them, and no new routine starts until the scene is over */
  const NT = G.Night, need = Game.questNeeds ? Game.questNeeds() : new Set();
  if ((G.Cine && G.Cine.on) || Game.cineOn) { for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (n._nh && NT) NT.release(n, id, false); if (n._psleep) { n.sleep = false; n._psleep = false; } if (n._ract && n.act === n._ract) { n.act = n.d.act || null; n._ract = null; } } return; }
  for (const id in ENT.npcs) { const n = ENT.npcs[id];
    /* v18.35 잠은 집에서: at bedtime they walk to their own bed (house, tent, quarters); the story's people stay up while the story needs them */
    if (NT) { if (n._psleep && (n.walk || n.follow || n.pass || need.has(id))) { n.sleep = false; n._psleep = false; }
      if (n._nh) { const p0 = Pe.of(id), D0 = p0 && dayOf(id, p0), late = D0 && (h < D0.wake || h > D0.bed); if (!late || need.has(id) || n.follow || n.pass || (typeof n.d.sched === 'function' && n.d.sched(S2, Game))) NT.release(n, id, !late); else { NT.tick(n, id, WAKE[id] > pclk); continue; } }
      else if (n.vis && !n.d.animal && !n.d.folk && !(typeof n.d.sched === 'function' ? n.d.sched(S2, Game) : n.d.sched) && !n.talking && !n.follow && !n.pass && !n.walk && !n.d.kneel && !n.d.hostile && !need.has(id) && !(WAKE[id] > pclk)) { const p0 = Pe.of(id); if (p0 && p0.role !== 'guard') { const D0 = dayOf(id, p0); if ((h < D0.wake || h > D0.bed) && NT.go(n, id)) continue; } } }
    if (!n.vis || n.d.animal || n.d.sched || n.d.folk || n.talking || n.follow || n.walk || n.seatY || n.sit || n.d.sit || n.d.kneel || n.d.fixed || (fam && fam(id))) { if (n._ract && n.act === n._ract) { n.act = n.d.act || null; n._ract = null; } continue; } // v18.14 people on a seat (Pharaoh on his throne) stay on it
    if ((tg && tg.npc === id) || need.has(id)) { if (n._ract) { n.act = n.d.act || null; n._ract = null; } if (n._psleep) { n.sleep = false; n._psleep = false; } continue; } // the one the story wants stays as the story left them
    if (n.act && n.act !== n._ract && n.act !== n.d.act) continue; // a story pose: leave it
    if (n.sleep && !n._psleep) continue; // asleep because the story said so
    const p = Pe.of(id); if (!p) continue; const D = dayOf(id, p); let a = n.d.act || null, sl = false;
    const night = h < D.wake || h > D.bed, guard = p.role === 'guard';
    if (night && !n.d.sit && !n.d.kneel && !(WAKE[id] > pclk)) { if (guard && hash(id + S2.day) < 0.7) a = h > 1 && h < 4 && p.mbti[3] === 'P' ? 'sitg' : 'crossArms'; else sl = true; }
    else if (night) a = 'sitg';
    else if (h < D.wake + 0.9) { if (!n._wk || n._wk !== S2.day) { n._wk = S2.day; n.emote = { k: hash(id + 'wk' + S2.day) < 0.6 ? 'stretch' : 'think', t: 0, dur: 2.4, amb: true }; } }
    else if (D.nap && h > D.napAt && h < D.napAt + 1.1 && !n.d.sit) a = p.age === 'old' || hash(id + 'nn') < 0.5 ? 'sitg' : 'sitHug';
    else if (h > D.bed - 2.8 && !n.d.sit) a = evenAct(id, p);
    else if (h > 6.5) a = blockAct(id, p, n, Math.floor((h + hash(id + 'off') * 1.5) / 1.5), S2.day);
    if (p.age === 'kid' && n.wander) n.wander.r = h > 7 && h < 18.5 ? Math.max(n.wander.r, 2 + hash(id + 'wr') * 4) : 0.6; // children run about by day, each as far as they dare
    if (sl) { if (!n.sleep) { n.sleep = true; n._psleep = true; n.act = null; n._ract = null; } if (Pl && Math.hypot(Pl.x - n.x, Pl.z - n.z) < 7 && hash(id + Math.floor(pclk / 7)) < 0.35) G.Life && G.Life.bubble && G.Life.bubble(id, 'Zzz…', 2.4); continue; }
    if (n._psleep) { n.sleep = false; n._psleep = false; n.emote = { k: 'stretch', t: 0, dur: 2.2, amb: true }; }
    if (a !== (n.act || null)) { n.act = a; n._ract = a; } } }
// a straw mat under whoever sleeps out in the open (laid head to feet under the body)
const MAT = {}; let matMesh = null; const dyn0 = EP.dyn;
EP.dyn = function (list) { if (dyn0) dyn0.apply(this, arguments); try { const ENT = Game.ENT, Pl = P(), H = G.HBI; if (!ENT || !H) return;
  for (const id in ENT.npcs) { const n = ENT.npcs[id]; if (!n._psleep || !n.sleep || !n.vis || !n.near || !n.rig || Math.hypot(n.x - Pl.x, n.z - Pl.z) > 45) continue;
    const hd = n.rig.world[H.head], ft = n.rig.world[H.footL]; if (!hd || !ft) continue; const cx = (hd[12] + ft[12]) / 2, cz = (hd[14] + ft[14]) / 2, a = Math.atan2(hd[12] - ft[12], hd[14] - ft[14]);
    if (!matMesh) { const g = new G.GB(31); g.box(0.85, 0.04, 2.1, { at: [0, 0.02, 0], c: 0xb89a62 }); g.box(0.86, 0.05, 0.95, { at: [0, 0.045, -0.5], c: 0x8a5a3a }); g.box(0.6, 0.08, 0.28, { at: [0, 0.07, 0.86], c: 0xd8c8a0 }); matMesh = G.R.mesh(g); }
    const m = MAT[id] || (MAT[id] = G.m4()); G.m4trs(m, cx, Game.W().heightAt(cx, cz), cz, a, 0, 0, 1, 1, 1); list.push({ mesh: matMesh, m }); } } catch (e) { } };
// villagers: same jobs, but each keeps their own hours and their own way of spending them
if (G.NpcAI && G.NpcAI.plan) { const plan0 = G.NpcAI.plan; G.NpcAI.plan = function (v, f, S2) { const rows = plan0.apply(this, arguments);
  try { const p = Pe.of(f.id); const mb = p ? p.mbti : 'ESTJ', sh = (hash(f.id + 'sh') - 0.5) * 1.3 + (mb[3] === 'J' ? -0.3 : 0.35);
    return rows.map((r, i) => { let [h, x, z, fc, m] = r; h = Math.max(0, Math.min(23.9, h + sh));
      if (m === 'sit' && p && hash(f.id + S2.day + 's' + i) < 0.6) m = 'act:' + evenAct(f.id + i, p);
      else if (m && m.startsWith('act:') && p) { const alt = ACT[p.role] || [], ho = hobAct(p), k = hash(f.id + S2.day + 'a' + i); if (ho && k < 0.25) m = 'act:' + ho; else if (alt.length > 1 && k < 0.6) m = 'act:' + pickH(alt, f.id + i + S2.day); }
      else if (m && m.startsWith('wander:')) m = 'wander:' + (+m.split(':')[1] * (mb[0] === 'E' ? 1.25 : 0.75)).toFixed(1);
      return [+h.toFixed(2), x, z, fc, m]; }); } catch (e) { return rows; } }; }

// =================================================================== per frame
let dT = 0;
const upd0 = EP.update; EP.update = function (dt) { const r = upd0 ? upd0.apply(this, arguments) : undefined; const d = typeof dt === 'number' && dt < 1 ? dt : 1 / 60;
  if (Game.mode === 'play') { pclk += d; try { bumpTick(d); { const cn = !!((G.Cine && G.Cine.on) || Game.cineOn); if (cn !== wasCine) { wasCine = cn; dT = 2; } } if ((dT += d) > 1) { dT = 0; dayTick(); } } catch (e) { console.error('persona', e); } } return r; };
})(window.G);
