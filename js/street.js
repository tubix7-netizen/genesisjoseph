/* 약속의 길 — 골목 이야기 (v18.25)
   애굽 마을 사람들끼리 주고받는 이야기를 구경만 해도 재미있게:
   · 두 사람이 가까이 있으면 3~5마디짜리 이야기를 나눠요(손짓·웃음 같은 몸짓도 해요). 아이끼리, 어른끼리, 어른과 아이, 하는 일에 따라 이야기가 달라요.
   · 이어지는 소문 세 가지(사라진 거위 · 어부 헤티의 큰 고기 · 빵집 이네트와 벽돌공)는 날마다 한 마디씩 다음 이야기로 나아가요.
   · 아이마다 단짝 친구가 있어요. 친구를 부르러 달려가서 술래잡기나 달리기 시합을 해요.
   · 일하는 사람 곁으로 가족이나 이웃이 와서 같이 일해요(그물 당기기, 밭일, 빨래, 반죽…). 가끔 다른 사람에게 다가가 말을 걸기도 해요.
   · 이야기는 그때그때 형편(요셉이 종일 때 · 풍년 · 흉년)에 맞게 골라요. */
'use strict';
(function (G) {
const Game = G.Game; if (!Game || !G.Life) return;
const ST = G.Street = {};
const S = () => Game.S(), P = () => Game.P;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const short = n => (n.name || '').split(' ').pop();
const chap = s => { const st = s.step || 'c2'; return st[0] === 'j' ? 7 : (+st[1] || 2); }; /* (j_end, the free journey, counts as after the story) */
const era = s => { const c = chap(s); return c < 5 ? 'pre' : c === 5 ? 'plenty' : 'famine'; };
const isKid = n => !!(n.d.folk && (n.d.folk.age === 'kid' || n.d.folk.role === 'child'));
const role = n => (n.d.folk && n.d.folk.role) || '';
const vid = n => (n.d.village && n.d.village.id) || '';
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const hero = s => era(s) === 'pre' ? (chap(s) <= 2 ? '그 히브리 청년' : chap(s) === 3 ? '감옥의 그 히브리 사람' : '그 히브리 사람') : '총리님';

/* ------------------------------------------------------------------ the talk itself
   [who (0 = first, 1 = second), words, gesture]. {a} {b} = their names, {j} = Joseph as people call him now */
const ADULT = {
  any: [
    [[0, '어젯밤 나일 강에 악어가 올라왔대요!', 'think'], [1, '어머나, 어디로요?'], [0, '빨래터 바로 옆이요. 빨래 방망이를 보고 도망갔대요.', 'laugh'], [1, '방망이가 그렇게 무서웠나 봐요!', 'laugh']],
    [[0, '{b} 씨, 그 목걸이 새로 했어요?'], [1, '남편이 장터에서 사 왔어요. 진짜 청금석이래요.', 'clap'], [0, '…저번 것도 진짜라더니?', 'crossArms'], [1, '이번엔 진짜예요! 아마도요…', 'laugh']],
    [[0, '오늘 하늘에 매가 세 마리나 돌았어요.', 'think'], [1, '좋은 일이 생기려나 봐요.'], [0, '아니면 우리 닭을 노리는 거든지요.', 'crossArms']],
    [[0, '제 꿈에 소 일곱 마리가 나왔는데요…', 'think'], [1, '어휴, 꿈 이야기는 이제 그만! 온 성이 꿈 얘기예요.', 'laugh'], [0, '이번 소는 춤을 췄다니까요!', 'dance2'], [1, '…그건 좀 궁금하네요.', 'laugh']],
    [[0, '장터 무화과 값이 또 올랐어요.'], [1, '저는 깎아 달라고 노래를 불렀더니 하나 더 주던데요?', 'clap'], [0, '정말요? 무슨 노래요?'], [1, '비밀이에요. 다음에 같이 가요.', 'laugh']],
    [[0, '이웃집 개가 우리 신발을 또 물어 갔어요.', 'crossArms'], [1, '그 개는 신발만 모으나 봐요.'], [0, '지붕 위에 신발이 열두 켤레나 있대요!', 'think'], [1, '어떻게 지붕에 올라갔대요?', 'laugh']],
    [[0, '강물 빛이 오늘따라 유난히 맑네요.'], [1, '이럴 때 강가에 앉아 있으면 걱정이 다 흘러가요.', 'sitg']],
    [[0, '{b} 씨, 우리 집 염소가 또 그 댁 밭에 들어갔죠?'], [1, '들어간 정도가 아니라 상추를 다 먹었어요!', 'crossArms'], [0, '아이고, 미안해요. 내일 치즈 한 덩이 갖다 드릴게요.', 'bow'], [1, '…큰 걸로요.', 'laugh']],
  ],
  pre: [
    [[0, '보디발 장군 댁에 히브리 종이 왔다던데요.'], [1, '그 집이 요즘 이상하게 잘 된대요.', 'think'], [0, '종 하나 들였는데 복이 굴러들어 왔나?']],
    [[0, '감옥에 갇힌 히브리 사람 얘기 들었어요?', 'think'], [1, '억울하게 갇혔다는 소문이 있어요.'], [0, '그런데도 거기서 간수장 일을 다 맡아 한대요.'], [1, '참 이상한 사람이네요. 원망도 안 한대요.', 'think']],
    [[0, '바로의 술 맡은 관원이 풀려났대요!', 'clap'], [1, '떡 굽는 관원은요?'], [0, '…그건 묻지 마세요.', 'crossArms']],
    [[0, '궁에서 박수들이 밤새 머리를 싸맸대요.', 'think'], [1, '바로의 꿈을 아무도 못 풀었다죠?'], [0, '누가 그 꿈을 풀면 팔자가 바뀔 거예요.']],
  ],
  plenty: [
    [[0, '올해 보리가 너무 잘 돼서 창고가 모자라요!', 'cheer'], [1, '{j}께서 오분의 일을 거둬 쌓아 두라셨잖아요.'], [0, '이렇게 많은데 왜 모으라는 걸까요?', 'think'], [1, '일곱 해 뒤를 보신대요. 꿈 이야기 말이에요.']],
    [[0, '{j} 수레 봤어요? 하얀 바탕에 금이 번쩍번쩍!', 'clap'], [1, '말 두 마리가 머리를 꼿꼿이 들고 가더라고요.'], [0, '우리 아들이 따라 달리다가 넘어졌어요.', 'laugh'], [1, '어머, 괜찮대요?'], [0, '넘어진 채로 손을 흔들었대요.', 'wave']],
    [[0, '{j}께서 어제 우리 골목을 지나가셨대요.'], [1, '사람들한테 일일이 인사하시더래요.', 'bow'], [0, '그렇게 높은 분이 말이에요?'], [1, '종살이도 해 보신 분이라 다르대요.', 'think']],
    [[0, '창고 짓는 데 일손이 모자라대요.'], [1, '저도 내일부터 벽돌 나르러 가요. 품삯을 곡식으로 준대요.', 'cheer']],
    [[0, '{j} 아들 이름이 므낫세래요.'], [1, '"모든 고난을 잊게 하셨다"는 뜻이라던데요.', 'think'], [0, '고생을 많이 하셨나 봐요…']],
  ],
  free: [
    [[0, '서쪽 바위산 동굴에서 밤마다 "펑!" 소리가 난대요.', 'think'], [1, '머리 하얀 기인 할아버지가 산다던데요?'], [0, '생명의 집에서 쫓겨난 학자래요. 두루마리를 태워서요!', 'laugh']],
    [[0, '그 동굴에서 푸른 빛이 새어 나오는 걸 봤어요.', 'think'], [1, '무섭지 않아요?'], [0, '이상하게 따뜻한 빛이었어요. 횃불 들고 가 보고 싶어요.']],
    [[0, '총리님 가족이 고센 땅에 자리 잡으셨대요.', 'clap'], [1, '열한 형제가 다 모였다니, 얼마나 기쁘셨을까요.', 'bow']],
  ],
  famine: [
    [[0, '올해도 강물이 안 불었어요…', 'think'], [1, '그래도 우리는 {j} 덕분에 창고에 곡식이 있잖아요.'], [0, '맞아요. 그 꿈 이야기가 정말이었어요.', 'bow']],
    [[0, '가나안에서 사람들이 곡식 사러 몰려온대요.'], [1, '열 형제가 함께 왔다는 무리도 있대요.', 'think'], [0, '열 형제라니… 그 집 어머니는 얼마나 바쁘셨을까요.', 'laugh']],
    [[0, '빵 한 덩이를 셋이 나눠 먹었어요.'], [1, '그래도 굶는 사람이 없잖아요. 감사해요.', 'bow']],
    [[0, '{j}께서 창고를 여실 때 울컥했어요.', 'think'], [1, '저도요. 일곱 해 동안 모은 게 다 우리를 살리네요.']],
  ],
};
/* by trade (one of the two has it) */
const TRADE = {
  fisher: [[[0, '오늘은 몇 마리나 잡았어요?'], [1, '세 마리요. 그런데 놓친 놈이 이만했어요!', 'cheer'], [0, '놓친 고기는 늘 크더라고요.', 'laugh']],
    [[0, '강물 높이 보니 곧 불어나겠어요.', 'think'], [1, '어부 눈은 못 속이지요. 그물 손질해 둬야겠네요.']]],
  baker: [[[0, '아침에 구운 빵 냄새가 골목 끝까지 났어요!'], [1, '대추야자를 넣었거든요. 하나 맛보실래요?', 'clap'], [0, '두 개 주시면 안 돼요?', 'laugh']]],
  potter: [[[0, '이 항아리 좀 보세요. 아주 둥글죠?'], [1, '…한쪽이 살짝 기울었는데요?', 'think'], [0, '그건 멋이에요, 멋!', 'crossArms']]],
  brickmaker: [[[0, '진흙에 짚을 조금 더 섞어야 해요.'], [1, '안 그러면 벽돌이 금방 갈라지죠.', 'think'], [0, '역시 아는 사람은 다르다니까.', 'laugh']]],
  washer: [[[0, '세마포가 눈처럼 하얘졌어요!', 'cheer'], [1, '노래 부르면서 빨면 더 하얘진다던데요?'], [0, '그럼 오늘은 목이 쉬도록 불러야겠네요.', 'laugh']]],
  merchant: [[[0, '오늘 장사 잘 됐어요?'], [1, '향유 한 병을 세 번이나 팔 뻔했어요.'], [0, '세 번이나요?'], [1, '세 번 다 깎아 달래서 못 팔았어요.', 'crossArms']]],
  farmer: [[[0, '밭에 메뚜기가 한 마리 앉았어요.', 'think'], [1, '한 마리면 괜찮아요. 친구 데려오기 전에 쫓아요!', 'laugh']],
    [[0, '올해는 아마가 키만큼 자랐어요.'], [1, '세마포 짜는 집에서 좋아하겠네요.', 'clap']]],
  trader: [[[0, '나귀가 오늘따라 고집을 부리네요.', 'crossArms'], [1, '당근을 앞에 매달아 보세요.'], [0, '그건 저번에 먹고 그냥 앉아 버렸어요.', 'laugh']]],
};
const KIDS = [
  [[0, '{b}! 나 어제 개구리 잡았다!', 'cheer'], [1, '진짜? 보여 줘!'], [0, '…놓쳤어.', 'think'], [1, '에이~', 'laugh']],
  [[0, '우리 커서 뭐 될까?', 'think'], [1, '나는 {j}처럼 높은 사람!'], [0, '나는 빵집 주인! 빵 마음대로 먹게.', 'laugh'], [1, '그럼 나한테 빵 줘야 해!', 'clap']],
  [[0, '쉿, 비밀 하나 알려 줄까?'], [1, '뭔데뭔데?', 'clap'], [0, '우리 엄마가 꿀 숨겨 둔 데 알아.', 'think'], [1, '…우리 같이 지키는 거야. 먹는 거 아니야!', 'laugh']],
  [[0, '{b}, 내가 강가에서 반짝이는 돌 주웠어!', 'cheer'], [1, '우와, 보석이다!'], [0, '너 반 줄게. 우리는 단짝이니까.'], [1, '그럼 우리 보물 상자에 넣자!', 'clap']],
  [[0, '어제 너 왜 안 나왔어?', 'crossArms'], [1, '엄마 심부름했어. 물 길어 오느라.'], [0, '그럼 오늘은 해 질 때까지 놀자!', 'cheer']],
  [[0, '하늘에 구름이 악어 모양이야!', 'think'], [1, '아니야, 하마야!'], [0, '악어!'], [1, '하마!', 'laugh'], [0, '…악어하마!', 'laugh']],
  [[0, '나 이빨 빠졌다!', 'cheer'], [1, '우와, 구멍 났다! 휘파람 불어 봐!'], [0, '휘이~ 피유~', 'laugh']],
  [[0, '우리 집 고양이가 새끼를 다섯 마리나 낳았어!', 'cheer'], [1, '하나만 나 주면 안 돼?'], [0, '엄마한테 물어볼게. 이름은 내가 지어 줄게!', 'clap']],
];
const PARENT = [
  [[0, '{b}, 손 씻었니?'], [1, '…씻을 거예요!', 'laugh'], [0, '"씻을 거예요"는 안 씻은 거지?', 'crossArms']],
  [[1, '이거 보세요! 제가 진흙으로 하마 만들었어요!', 'cheer'], [0, '어머, 정말 잘 만들었네. 다리가 다섯 개인 건…'], [1, '하나는 꼬리예요!', 'laugh']],
  [[0, '해 지기 전에 들어와야 한다.'], [1, '네~ 해님한테 천천히 지라고 할게요!', 'wave']],
  [[1, '오늘 시장에서 뭐 사 왔어요?', 'clap'], [0, '너 좋아하는 무화과.'], [1, '야호! 최고예요!', 'cheer']],
];
/* serial gossip — one more part each day, whoever is talking picks up where the town left off */
const ARCS = {
  goose: [
    [[0, '신전 거위가 없어졌대요!', 'think'], [1, '그 하얗고 목 긴 거위요?'], [0, '제사장님이 온 골목을 찾아다니세요.']],
    [[0, '거위 소식 들었어요? 밤에 꽥꽥 소리가 났대요.', 'think'], [1, '어느 집에서요?'], [0, '그게… 골목 끝 아이들 놀이터 쪽이래요.']],
    [[0, '거위를 찾았대요! 아이들이 숨겨 뒀었대요.', 'laugh'], [1, '아니, 왜요?'], [0, '잔칫날 요리될까 봐 지켜 준 거래요.', 'think'], [1, '어머나, 착하기도 해라.']],
    [[0, '그 거위가 알을 낳았대요! 아이들 앞에서요.', 'cheer'], [1, '제사장님이 아이들한테 첫 알을 주셨대요.', 'clap'], [0, '이제 거위가 아이들만 졸졸 따라다닌대요.', 'laugh']],
  ],
  fish: [
    [[0, '어부 헤티가 팔뚝만 한 고기를 잡았대요.'], [1, '헤티 말로요?', 'crossArms'], [0, '…네, 헤티 말로요.', 'laugh']],
    [[0, '헤티 고기가 이제 다리만 해졌대요.', 'laugh'], [1, '어제는 팔뚝이었잖아요!'], [0, '하룻밤 새 자랐대요. 이야기 속에서요.']],
    [[0, '헤티가 진짜 큰 고기를 잡았어요! 제가 봤어요!', 'cheer'], [1, '에이, 또요?'], [0, '이번엔 진짜예요! 혼자 못 들어서 셋이 들었어요!', 'clap']],
    [[0, '헤티가 그 큰 고기를 온 동네에 나눠 줬대요.', 'clap'], [1, '자랑만 하는 줄 알았더니 마음이 넓네요.'], [0, '이제 아무도 헤티 말을 의심 안 해요.', 'laugh']],
  ],
  love: [
    [[0, '빵집 이네트 말이에요, 벽돌공한테만 빵을 크게 준대요.', 'think'], [1, '어머, 정말요?'], [0, '저번엔 꿀까지 발라 줬대요!', 'laugh']],
    [[0, '그 벽돌공이 이네트 집 앞에 꽃을 두고 갔대요.', 'clap'], [1, '이름도 안 쓰고요?'], [0, '벽돌에 꽃 모양을 찍어 놨대요. 누군지 다 알죠.', 'laugh']],
    [[0, '이네트랑 벽돌공이 강가를 같이 걸었대요.', 'think'], [1, '둘이 얼굴이 대추야자처럼 빨갰다던데요?', 'laugh']],
    [[0, '둘이 혼인한대요! 온 골목이 잔치예요!', 'cheer'], [1, '빵이랑 벽돌로 집을 짓겠네요.', 'laugh'], [0, '잔칫날 빵은 이네트가 다 굽는대요!', 'clap']],
  ],
};
/* working side by side */
const WORK = {
  fish: [[[1, '그물 이쪽 끝 잡았어요!', 'gather'], [0, '하나, 둘, 셋에 당겨요!'], [1, '영차! 영차!', 'gather'], [0, '걸렸다! 묵직해요!', 'cheer']],
    [[1, '아빠, 찌가 움직여요!', 'clap'], [0, '쉿, 조용히. 고기가 놀라.'], [1, '…지금이에요!', 'cheer'], [0, '잡았다! 우리 꼬마 덕분이다.', 'laugh']]],
  field: [[[1, '이랑은 제가 맡을게요.', 'gather'], [0, '고마워요. 둘이 하니 금방 끝나겠네.'], [1, '해 지기 전에 다 심어요!'], [0, '끝나면 시원한 보리 물 한잔해요.', 'laugh']],
    [[1, '물 대는 거 도와줄게요.', 'gather'], [0, '천천히 부어요. 흙이 쓸려 가요.'], [1, '이렇게요?'], [0, '그렇지! 손이 야무지네.', 'clap']]],
  craft: [[[1, '반죽 같이 해요. 오늘 주문이 많다면서요.', 'gather'], [0, '살았다! 둘이 하면 두 배로 구워요.'], [1, '손에 다 묻었어요.', 'laugh'], [0, '그게 맛있는 빵의 증거예요.']],
    [[1, '진흙 날라 왔어요!', 'gather'], [0, '잘했어요. 거기 내려놓고 짚 좀 뿌려 줘요.'], [1, '하나, 둘…'], [0, '이 벽돌로 창고 벽 쌓는대요. 우리 벽돌이에요!', 'cheer']]],
  wash: [[[1, '이쪽 천 같이 비틀어요.', 'gather'], [0, '하나, 둘, 꽉!'], [1, '물이 줄줄 나와요!', 'laugh'], [0, '노래 한 곡 부르면서 해요.', 'clap']]],
};
const WORKCALL = { fish: ['영차!', '조금만 더!', '고기야, 와라~'], field: ['흙이 좋네요.', '하나, 둘!', '허리 펴고 잠깐 쉬어요.'], craft: ['조금만 더 둥글게…', '하나, 둘!', '잘 되고 있어요.'], wash: ['랄랄라~', '하얗게, 더 하얗게!', '꽉 짜요!'] };
const groupOf = n => { const r = role(n), a = n.act || ''; if (r === 'fisher' || a === 'fish') return 'fish'; if (r === 'washer') return 'wash'; if (r === 'farmer' || /hoe|water|harvest|plant|pick/.test(a)) return 'field'; return 'craft'; };
const PLAY_START = [[[0, '{b}! 놀자~!', 'wave'], [1, '술래잡기 할래?', 'cheer'], [0, '좋아! 네가 술래!', 'laugh']], [[0, '{b}, 우리 달리기 시합 하자!', 'cheer'], [1, '저기 야자나무까지! 지는 사람이 물 긷기!', 'clap']]];
const CALLS = ['{b}~! 어디 있어?', '{b}! 나와서 놀자!', '{b}, 같이 놀자!'];

// ------------------------------------------------------------------ who is free to stop and talk
const free = n => n && n.vis && n.near && n.d.folk && !n.talking && !n.walk && !n.schedHidden && !n.sleep && !n.pass && !n.follow && !n._chat && !n._inCart && !n.d.animal;
function hold(n, o) { n._chat = true; n.walk = null; if (n.wander) { n._ws = n.wander; n.wander = null; } if (o) n._chatFace = Math.atan2(o.x - n.x, o.z - n.z); }
function release(n, moved) { if (!n) return; n._chat = false; n._chatFace = undefined; n.emote = null; if (n._ws) { n.wander = n._ws; n._ws = null; } if (moved) { n.walk = null; n.act = null; n.schedSlot = -1; } }
const gest = (n, k, d) => { if (k && n && !n.walk) n.emote = { k, t: 0, dur: d || 2.2, amb: true }; };
const fill = (t, a, b, s) => t.replace(/\{a\}/g, short(a)).replace(/\{b\}/g, short(b)).replace(/\{j\}/g, hero(s));

// ------------------------------------------------------------------ running scenes
const runs = []; /* { a, b, lines, i, t, kind, then } */
function say(a, b, lines, then, kind) { hold(a, b); hold(b, a); runs.push({ a, b, lines, i: 0, t: 0.2, then, kind: kind || 'talk' }); }
function tickRuns(dt) { const s = S();
  for (let k = runs.length - 1; k >= 0; k--) { const r = runs[k];
    if (!r.a.vis || !r.b.vis || dist(r.a, P()) > 45 || G.UI.busy() && r.kind !== 'work') { runs.splice(k, 1); release(r.a, r.moveA); release(r.b, r.moveB); continue; }
    r.a._chatFace = Math.atan2(r.b.x - r.a.x, r.b.z - r.a.z); if (r.kind !== 'work') r.b._chatFace = Math.atan2(r.a.x - r.b.x, r.a.z - r.b.z);
    if ((r.t -= dt) > 0) continue;
    if (r.i >= r.lines.length) { runs.splice(k, 1); if (r.then) r.then(r); else { release(r.a, r.moveA); release(r.b, r.moveB); } continue; }
    const [w, txt, g] = r.lines[r.i++], n = w ? r.b : r.a, t = fill(txt, n, w ? r.a : r.b, s), d = Math.min(5, 2.3 + t.length * 0.06);
    G.Life.bubble(n.id, t, d); if (g && g !== 'gather') gest(n, g, Math.min(2.6, d)); r.t = d + 0.35; } }

// ------------------------------------------------------------------ the kids' games: tag and races
const games = [];
function startPlay(a, b, race) { const c = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; a._chat = b._chat = true;
  if (race) { const ang = Math.random() * Math.PI * 2; let gx = c.x + Math.sin(ang) * 11, gz = c.z + Math.cos(ang) * 11;
    for (let i = 0; i < 8 && Game.solidAt(gx, gz, 0.6); i++) { const a2 = ang + i * 0.8; gx = c.x + Math.sin(a2) * 10; gz = c.z + Math.cos(a2) * 10; }
    const fast = Math.random() < 0.5 ? a : b; games.push({ race: true, a, b, gx, gz, t: 14, done: false });
    Game.npcWalk(a.id, gx, gz, null, fast === a ? 3.9 : 3.6); Game.npcWalk(b.id, gx + 0.8, gz + 0.8, null, fast === b ? 3.9 : 3.6); G.Life.bubble(a.id, '준비, 출발!', 1.6); return; }
  games.push({ a, b, ch: b, ru: a, c, t: 17, tags: 0, rt: 0, pause: 0 }); }
function fleeSpot(g) { const { ru, ch, c } = g; let best = null, bs = -1e9;
  for (let i = 0; i < 6; i++) { const ang = Math.atan2(ru.x - ch.x, ru.z - ch.z) + (Math.random() - 0.5) * 2.2, r = 3 + Math.random() * 2, x = ru.x + Math.sin(ang) * r, z = ru.z + Math.cos(ang) * r;
    if (Math.hypot(x - c.x, z - c.z) > 8 || Game.solidAt(x, z, 0.5)) continue; const sc = Math.hypot(x - ch.x, z - ch.z) - Math.hypot(x - c.x, z - c.z) * 0.3; if (sc > bs) { bs = sc; best = [x, z]; } }
  return best || [c.x + (Math.random() - 0.5) * 4, c.z + (Math.random() - 0.5) * 4]; }
function endGame(g, k, words) { games.splice(k, 1); for (const n of [g.a, g.b]) { n.walk = null; } if (words) say(g.a, g.b, words, r => { release(r.a, true); release(r.b, true); }, 'play'); else { release(g.a, true); release(g.b, true); } }
function tickGames(dt) {
  for (let k = games.length - 1; k >= 0; k--) { const g = games[k]; g.t -= dt;
    if (!g.a.vis || !g.b.vis || dist(g.a, P()) > 50) { games.splice(k, 1); release(g.a, true); release(g.b, true); continue; }
    if (g.race) { const da = Math.hypot(g.a.x - g.gx, g.a.z - g.gz), db = Math.hypot(g.b.x - g.gx, g.b.z - g.gz);
      if (!g.done && (da < 1.2 || db < 1.4 || g.t < 0)) { g.done = true; const w = da <= db ? g.a : g.b, l = w === g.a ? g.b : g.a; G.Life.bubble(w.id, '내가 일등!', 2); gest(w, 'cheer', 2);
        setTimeout(() => { const i = games.indexOf(g); if (i >= 0) endGame(g, i, [[w === g.a ? 1 : 0, `헥헥… 다음엔 내가 이길 거야, ${short(w)}!`, 'laugh'], [w === g.a ? 0 : 1, '좋아, 내일 또 시합하자!', 'wave']]); }, 1600); } continue; }
    if (g.pause > 0) { g.pause -= dt; continue; }
    if (dist(g.ch, g.ru) < 0.95) { g.tags++; G.Life.bubble(g.ch.id, rnd(['잡았다!', '찾았다~ 너 술래!', '이번엔 네 차례!']), 1.8); G.Life.bubble(g.ru.id, rnd(['으악!', '아깝다~', '에이, 다시!']), 1.6);
      g.ch.walk = g.ru.walk = null; const t = g.ch; g.ch = g.ru; g.ru = t; g.pause = 1.1; if (g.tags >= 4 || g.t < 0) endGame(g, k, [[0, '헥헥… 다리 아파.', 'laugh'], [1, '내일 또 하자! 약속!', 'wave']]); continue; }
    if (g.t < -4) { endGame(g, k, [[0, '아휴, 못 잡겠다!', 'laugh'], [1, '내가 제일 빠르지롱~', 'cheer']]); continue; }
    if ((g.rt -= dt) <= 0) { g.rt = 0.45; Game.npcWalk(g.ch.id, g.ru.x, g.ru.z, null, 3.5); if (!g.ru.walk || Math.random() < 0.35) { const [x, z] = fleeSpot(g); Game.npcWalk(g.ru.id, x, z, null, 3.3); } } } }

// ------------------------------------------------------------------ walking over to someone: a friend to play with, a neighbour to talk to, a worker to help
const visits = []; /* { n (walker), o (waited for), t, then } */
function visit(n, o, side, then) { hold(o, n); n._chat = true; if (n.wander) { n._ws = n.wander; n.wander = null; }
  const f = o.face, sx = Math.cos(f) * side, sz = -Math.sin(f) * side; let x = o.x + sx * 1.25, z = o.z + sz * 1.25; if (Game.solidAt(x, z, 0.35)) { x = o.x - sx * 1.25; z = o.z - sz * 1.25; }
  if (!side) { const a = Math.atan2(n.x - o.x, n.z - o.z); x = o.x + Math.sin(a) * 1.3; z = o.z + Math.cos(a) * 1.3; }
  const v = { n, o, t: 16, then, arrived: false }; visits.push(v); Game.npcWalk(n.id, x, z, () => { v.arrived = true; }, isKid(n) ? 3.2 : 1.8); }
function tickVisits(dt) { for (let k = visits.length - 1; k >= 0; k--) { const v = visits[k]; v.t -= dt;
    if (!v.n.vis || !v.o.vis || v.t < 0) { visits.splice(k, 1); release(v.n, true); release(v.o); continue; }
    if (v.arrived) { visits.splice(k, 1); v.n.walk = null; v.then(v.n, v.o); } } }

// ------------------------------------------------------------------ working together
const helps = [];
function startHelp(w, h) { visit(h, w, 1, (h2, w2) => { const g = groupOf(w2); h2.face = h2.homeFace = w2.face; h2.act = g === 'fish' ? 'gather' : w2.act || 'gather';
    say(w2, h2, rnd(WORK[g]), r => { r.a._chat = true; r.b._chat = true; helps.push({ w: w2, h: h2, g, t: 22 + Math.random() * 12, ct: 4 }); }, 'work'); }); }
function tickHelps(dt) { for (let k = helps.length - 1; k >= 0; k--) { const e = helps[k]; e.t -= dt; const { w, h } = e;
    h.act = h.act || 'gather'; h._chatFace = w.face;
    if (!w.vis || !h.vis || e.t < 0 || dist(w, P()) > 50 || w.walk) { helps.splice(k, 1); if (e.t < 0 && w.vis && h.vis) G.Life.bubble(h.id, rnd(['이제 가 볼게요!', '오늘 일 끝!', '내일 또 도와줄게요.']), 2.4); release(w); release(h, true); continue; }
    if ((e.ct -= dt) <= 0) { e.ct = 5 + Math.random() * 4; const n = Math.random() < 0.5 ? w : h; G.Life.bubble(n.id, rnd(WORKCALL[e.g]), 2); } } }

// ------------------------------------------------------------------ who befriends whom (each child has a best friend in the same village)
let friendsOf = null;
function friends() { if (friendsOf) return friendsOf; friendsOf = {}; const byV = {};
  for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (n.d.folk && isKid(n)) (byV[vid(n)] = byV[vid(n)] || []).push(id); }
  for (const v in byV) { const L = byV[v].sort(); for (let i = 0; i + 1 < L.length; i += 2) { friendsOf[L[i]] = L[i + 1]; friendsOf[L[i + 1]] = L[i]; } if (L.length % 2 && L.length > 2) friendsOf[L[L.length - 1]] = L[0]; }
  return friendsOf; }

// ------------------------------------------------------------------ choosing what happens next
const arcDay = {};
function pickTalk(a, b) { const s = S(), ka = isKid(a), kb = isKid(b), e = era(s);
  if (ka && kb) return rnd(KIDS);
  if (ka !== kb) { const fam = vid(a) === vid(b) && a.d.folk.home === b.d.folk.home; if (fam || Math.random() < 0.5) { const L = rnd(PARENT); return ka ? L.map(([w, t, g]) => [1 - w, t, g]) : L; } return null; }
  /* adults: a serial now and then, else something for their trade or the times */
  if (Math.random() < 0.3) { const ks = Object.keys(ARCS).filter(k => (s.flags['arc_' + k] || 0) < ARCS[k].length && arcDay[k] !== s.day && (s.flags['arcD_' + k] || -1) !== s.day);
    if (ks.length) { const k = rnd(ks), i = s.flags['arc_' + k] || 0; s.flags['arc_' + k] = i + 1; s.flags['arcD_' + k] = s.day; arcDay[k] = s.day; return ARCS[k][i]; } }
  const tr = TRADE[role(a)] || TRADE[role(b)]; if (tr && Math.random() < 0.4) return rnd(tr);
  if (s.flags.free && Math.random() < 0.3) return rnd(ADULT.free);
  return rnd(Math.random() < 0.55 ? ADULT[e] : ADULT.any); }
let pickT = 3;
function pick() { const s = S(), p = P(), hr = s.time % 24; if (hr < 6 || hr > 20.5) return;
  const list = []; for (const id in Game.ENT.npcs) { const n = Game.ENT.npcs[id]; if (free(n) && dist(n, p) < 30) list.push(n); } if (!list.length) return;
  const active = runs.length + games.length + visits.length + helps.length; if (active >= 4) return;
  const roll = Math.random();
  /* a child runs off to find their best friend */
  if (roll < 0.3 && games.length < 1) { const F = friends(); const ks = list.filter(n => isKid(n) && F[n.id]);
    for (const n of ks.sort(() => Math.random() - 0.5)) { const o = Game.ENT.npcs[F[n.id]]; if (!free(o) || dist(n, o) > 24) continue;
      if (dist(n, o) > 3) G.Life.bubble(n.id, fill(rnd(CALLS), n, o, s), 2.2);
      visit(n, o, 0, (a, b) => { const L = rnd(PLAY_START), race = /달리기/.test(L[0][1]); say(a, b, L, r => startPlay(r.a, r.b, race), 'play'); }); return; } }
  /* someone comes over to lend a hand */
  if (roll < 0.55 && helps.length < 2) { const ws = list.filter(n => n.act && !n.sit && !isKid(n) && !helps.some(e => e.w === n));
    for (const w of ws.sort(() => Math.random() - 0.5)) { let best = null, bs = -1e9;
      for (const h of list) { if (h === w || h.act || h.sit || dist(h, w) > 22) continue; const sc = (vid(h) === vid(w) && h.d.folk.home === w.d.folk.home ? 12 : 0) + (role(h) === role(w) ? 6 : 0) + (isKid(h) && groupOf(w) === 'fish' ? 5 : 0) - dist(h, w) * 0.3; if (sc > bs) { bs = sc; best = h; } }
      if (best) { startHelp(w, best); return; } } }
  /* two who stand close start talking */
  const pairs = []; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const d = dist(list[i], list[j]); if (d < 6) pairs.push([list[i], list[j], d]); }
  if (pairs.length) { const [a, b] = rnd(pairs); const L = pickTalk(a, b); if (L) { say(a, b, L); return; } }
  /* or one walks over to a neighbour to say something */
  const ads = list.filter(n => !n.act && !n.sit); if (ads.length) { const a = rnd(ads); let best = null, bd = 16; for (const o of list) { const d = dist(a, o); if (o !== a && d > 3 && d < bd && !(isKid(a) && !isKid(o))) { bd = d; best = o; } }
    if (best) { const L = pickTalk(a, best); if (L) visit(a, best, 0, (x, y) => say(x, y, L, r => { release(r.a, true); release(r.b); })); } } }

ST.on = () => true;
ST.tick = function (dt) { const s = S(); if (!s || Game.mode !== 'play') return;
  if (Game.cineOn || (G.Cine && G.Cine.on)) { if (runs.length + games.length + visits.length + helps.length) ST.clear(); return; }
  try { tickVisits(dt); tickRuns(dt); tickGames(dt); tickHelps(dt); if ((pickT -= dt) <= 0) { pickT = 3.5 + Math.random() * 4; if (!G.UI.busy() && Game.SET.chatty !== 'off') pick(); } } catch (e) { console.error('street', e); } };
ST.clear = function () { for (const r of runs) { release(r.a, true); release(r.b, true); } for (const g of games) { release(g.a, true); release(g.b, true); } for (const v of visits) { release(v.n, true); release(v.o); } for (const e of helps) { release(e.w); release(e.h, true); }
  runs.length = games.length = visits.length = helps.length = 0; };
ST.state = () => ({ runs: runs.length, games: games.length, visits: visits.length, helps: helps.length });
ST.onLoad = () => { ST.clear(); friendsOf = null; };
const EPj = G.EP && G.EP.joseph; if (EPj) { const up0 = EPj.update; EPj.update = function (dt) { const r = up0 ? up0.apply(this, arguments) : undefined; ST.tick(typeof dt === 'number' && dt < 1 ? dt : 1 / 60); return r; };
  const ol0 = EPj.onLoad; EPj.onLoad = function () { ST.onLoad(); return ol0 ? ol0.apply(this, arguments) : undefined; }; }
})(window.G);
