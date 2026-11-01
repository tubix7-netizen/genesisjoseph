
// ------------------------------------------------------------------ NPCs
const BRO = ['reuben', 'simeon', 'levi', 'judah', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun'];
const show = (a, b) => S => between(S, a, b);
const inEgyptHouse = S => between(S, 'c2_arrive', 'c2_flee');
const CELL = [[-41, -8], [-35.5, -8], [-30, -8.4], [-24.5, -8]];
LOOK.benjaminAdult = { skin: 0xe2ab7c, top: 0xe0c8a0, trim: 0x3e8a66, sash: 0x3e8a66, hair: 0x2a1810, hairStyle: 'curly', beard: 'short', beardCol: 0x2a1810, belt: 0x6a4428, build: 0.9, eye: 0x5a3a20 };
LOOK.ameniOld = Object.assign({}, LOOK.ameni, { build: 0.4, bottom: 0x9a8a6a });
const npcs = [
  // ---- Hebron valley
  { id: 'jacob', name: '야곱', look: LOOK.jacob, x: 170.6, z: 150.8, face: 0.9, show: S => before(S, 'p_road') || S.q.heb, talkR: 3.2 },
  { id: 'benjamin', name: '베냐민', look: LOOK.benjamin, scale: 0.62, x: 179.5, z: 155.6, face: -2.2, show: S => before(S, 'p_road') || S.q.heb, chat: ['형, 별 이야기 해 줘!', '나도 크면 형처럼 채색옷 입을 거야!'] },
  { id: 'leah', name: '레아', look: LOOK.leah, x: 165.2, z: 158.2, face: 0.8, sit: true, show: S => before(S, 'p_road') || S.q.heb, chat: ['요셉아, 형들을 만나거든 어서 돌아오라고 전하렴.', '네 아버지가 너를 얼마나 아끼시는지…'] },
  { id: 'dinah', name: '디나', look: LOOK.dinah, x: 161.8, z: 151.6, face: 0.6, act: 'gather', show: S => before(S, 'p_road') || S.q.heb, chat: ['요셉 오라버니, 그 옷 정말 곱다!', '아버지가 오라버니만 찾으셔.'] },
  { id: 'hServ', name: '야곱의 종', look: LOOK.servantH, x: 188, z: 168, prop: 'staff', wander: 3, show: S => before(S, 'p_road'), chat: ['형님들은 세겜 쪽으로 양을 몰고 가신 지 꽤 되었지요.', '도련님, 길에서 들짐승 조심하십시오.'] },
  { id: 'shepBoy', name: '길가의 목동', look: KID({ top: 0xc8b890, hairStyle: 'short' }), scale: 0.72, x: 186, z: 104, prop: 'staff', wander: 3, show: S => before(S, 'p_night'), chat: ['세겜이요? 저 북쪽으로 쭉 가면 돼요.', '그 옷 진짜 예쁘다! 무지개 같아요!'] },
  // ---- Shechem: the man in the field (창 37:15)
  { id: 'man', name: '들의 사람', look: LOOK.man, x: SPOTS.manSpot[0], z: SPOTS.manSpot[1], face: -2.6, talkR: 3.4, show: S => S.step === 'p_man' },
  // ---- the ten brothers (Dothan; Hebron in the mourning scene; Egypt at the end)
  ...BRO.map((id, i) => { const a = i / BRO.length * Math.PI * 2; return { id, name: NM[id], look: LOOK[id], x: 158 + Math.cos(a) * 3.4, z: -150 + Math.sin(a) * 3.4, face: Math.atan2(-Math.cos(a), -Math.sin(a)), sit: i % 3 !== 0, noTalk: true,
    show: S => between(S, 'p_dothan', 'c1_pit') || !!S.q.broShow }; }),
  // ---- the caravan (창 37:25, 28)
  { id: 'ishmael', name: '이스마엘 상인', look: LOOK.ishmael, x: 236, z: -158, face: -1.6, prop: 'staff', noTalk: true, show: S => !!S.q.caravanOn },
  { id: 'midian', name: '미디안 상인', look: LOOK.midian, x: 238, z: -160, face: -1.6, noTalk: true, show: S => !!S.q.caravanOn },
  { id: 'ishBoy', name: '대상의 아이', look: LOOK.ishBoy, scale: 0.72, x: 240, z: -156, face: -1.6, noTalk: true, show: S => !!S.q.caravanOn },
  ...[1, 2, 3].map(i => ({ id: 'camel' + i, name: '낙타', animal: 'camel', extra: { saddle: [0xb3472e, 0x2c5aa0, 0xd9a73a][i - 1] }, x: 240 + i * 3, z: -158, face: -1.6, noTalk: true, noTag: true, show: S => !!S.q.caravanOn })),
  // ---- Egypt · the slave market
  { id: 'auctioneer', name: NM.auctioneer, look: LOOK.auctioneer, x: -12, z: 112.4, face: 0.2, dy: 0.9, noTalk: true, show: S => S.step === 'c1_market' },
  { id: 'mk1', name: '애굽 상인', look: LOOK.official, x: -6, z: 118, face: 3.0, show: S => between(S, 'c1_market'), chat: ['향품이 들어왔소! 길르앗의 유향이오!', '은을 달아 드리리다.'] },
  { id: 'mk2', name: '물 긷는 여인', look: LOOK.woman, x: -16, z: 120, face: 2.2, act: 'gather', show: S => between(S, 'c1_market'), chat: ['나일 물은 언제나 달아요.'] },
  { id: 'mk3', name: '구경꾼', look: LOOK.farmer, x: -2, z: 112, face: -2.4, show: S => S.step === 'c1_market', noTalk: true },
  // ---- Potiphar's household
  { id: 'potiphar', name: '보디발', look: LOOK.potiphar, x: -28, z: 39.4, face: 0, sit: true, talkR: 3.2, show: S => between(S, 'c1_market', 'c2_flee') && !S.q.empty, sched: S => S.step === 'c2_store' ? [[0, -12.6, 59.2, -1.6, 'wander:0.5']] : null },
  { id: 'wife', name: '보디발의 아내', look: LOOK.wife, x: -20.6, z: 61.6, face: Math.PI, talkR: 3, show: S => between(S, 'c2_arrive', 'c2_flee') && S.step !== 'c2_tempt2', sched: S => S.step === 'c2_tempt3' ? [[0, -25, 39.2, 0.6, 'wander:0.2']] : null },
  { id: 'ameni', name: NM.ameni, look: LOOK.ameni, x: -44, z: 55.4, face: 1.6, show: inEgyptHouse, chat: ['네 하나님 이야기를 또 들려다오.', '애굽 말이 많이 늘었구나.', '엠 헤테프, 요셉. 평안히.'] },
  { id: 'neb', name: NM.neb, look: LOOK.neb, x: -25.4, z: 66.6, face: Math.PI, show: inEgyptHouse, chat: S => S.q.nebOk ? ['대문은 내가 지키겠소, 총무.', '손님이 오시면 바로 알리리다.'] : ['…일이나 하라, 히브리 종.'] },
  { id: 'cook', name: NM.cook, look: LOOK.cook, x: -10.8, z: 43.8, face: Math.PI, act: 'gather', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['타! 갓 구운 타가 최고지!', '오늘은 손님상에 낼 거위를 굽는다네.'] },
  { id: 'gardener', name: NM.gardener, look: LOOK.gardener, x: -15.4, z: 60.6, face: -1.6, act: 'water', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['연꽃이 올해는 유난히 많이 피었어.', '종려나무는 발은 물에, 머리는 불에 두어야 열매를 맺지.'] },
  { id: 'cowboy', name: NM.boy, look: LOOK.cowboy, scale: 0.68, x: 8, z: 74, face: 0, wander: 3, show: S => inEgyptHouse(S) && !S.q.empty, chat: S => S.q.calf ? ['형! 송아지가 형만 졸졸 따라다녀요!', '카! 카! (소야! 소야!)'] : ['송아지 한 마리가 수로 진흙에 빠졌어요! 도와주세요!'] },
  { id: 'weaver', name: NM.weaver, look: LOOK.weaver, x: -44.2, z: 62.4, face: -1.6, act: 'gather', show: S => inEgyptHouse(S) && !S.q.empty, chat: ['아마 세 단이면 세마포 한 필이에요.', '마님은 세마포를 아주 곱게만 입으시죠.'] },
  { id: 'scribe', name: NM.scribe, look: LOOK.scribe, x: -23.6, z: 41.2, face: 0, sit: true, talkR: 3, show: S => inEgyptHouse(S) && !S.q.empty, sched: S => S.step === 'c2_store' ? [[0, -14, 63.2, -1.6, 'wander:0.4']] : null, chat: ['숫자는 거짓말을 하지 않지. 사람이 할 뿐.', '자네 덕분에 눈이 덜 아프구먼.'] },
  { id: 'maid', name: '여종', look: LOOK.maid, x: -30, z: 47, face: 0, show: S => between(S, 'c2_tempt2', 'c2_tempt3') && !S.q.empty, chat: ['마님 심기가 요즘 편치 않으세요.'] },
  { id: 'guest1', name: NM.guest1, look: LOOK.official, x: -34.4, z: 42.2, face: 0.5, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest2', name: NM.guest2, look: LOOK.priest, x: -31.2, z: 43.4, face: 0.1, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'guest3', name: NM.guest3, look: LOOK.soldierEg, x: -23.8, z: 43.2, face: -0.4, sit: true, talkR: 2.4, show: S => S.step === 'c2_banquet' },
  { id: 'calf', name: '진흙에 빠진 송아지', animal: 'cow', scale: 0.55, x: SPOTS.canal[0], z: SPOTS.canal[1] + 0.6, face: 0.3, noTalk: true, noTag: true, dy: -0.35, show: S => S.step === 'c2_field' && !S.q.calf },
  // ---- the king's prison
  { id: 'keeper', name: NM.keeper, look: LOOK.keeper, x: -22.6, z: 6.4, face: Math.PI, show: show('c3_cell', 'c4_shave'), chat: S => S.q.cupDone ? ['요셉, 너 없이는 이 옥이 돌아가지 않는다.', '바로의 관원장들이 다 네 말대로 되었다지…'] : ['일해라. 일하지 않으면 먹지도 못한다.'] },
  { id: 'prisA', name: NM.prisA, look: LOOK.prisoner, x: CELL[0][0], z: CELL[0][1], face: 0, talkR: 4.2, show: show('c3_cell', 'c4_shave'), chat: ['요셉, 오늘 떡은 좀 더 크더라.', '너는 왜 그렇게 평안해 보이지?'] },
  { id: 'prisB', name: NM.prisB, look: Object.assign({}, LOOK.prisoner, { skin: 0xa86a40, hairStyle: 'short', beard: 'long' }), x: CELL[1][0], z: CELL[1][1], face: 0, talkR: 4.2, show: show('c3_cell', 'c4_shave'), chat: ['밖은 지금 나일 강이 불어났겠지…', '네 하나님은 이 옥에도 계시냐?'] },
  { id: 'oldP', name: NM.oldP, look: LOOK.oldPrisoner, x: CELL[2][0], z: CELL[2][1], face: 0, talkR: 4.2, show: S => between(S, 'c3_cell', 'c4_shave') && !S.q.oldGone, chat: ['…고맙다, 히브리 청년.', '네 하나님 이야기를 해 다오.'] },
  { id: 'youngP', name: NM.youngP, look: LOOK.youngPrisoner, scale: 0.7, x: CELL[3][0], z: CELL[3][1], face: 0, talkR: 4.2, show: S => between(S, 'c3_wait', 'c4_shave') && !!S.q.youngIn, chat: ['형, 오늘도 기도해요?', '엄마 꿈을 꿨어요.'] },
  { id: 'cupbearer', name: NM.cupbearer, look: LOOK.cupbearer, x: CELL[3][0] - 1.1, z: CELL[3][1] - 0.2, face: 0, talkR: 4.2, show: show('c3_officers', 'c3_dreams') },
  { id: 'baker', name: NM.baker, look: LOOK.baker, x: CELL[3][0] + 1.1, z: CELL[3][1] - 0.4, face: 0, talkR: 4.2, show: show('c3_officers', 'c3_dreams') },
  { id: 'messenger', name: NM.messenger, look: LOOK.messenger, x: -29, z: 11, face: Math.PI, show: S => S.step === 'c4_shave' },
  { id: 'pg1', name: '옥 문지기', look: LOOK.soldierEg, x: -32.6, z: 16, face: 0, prop: 'spear', noTalk: true, show: show('c3_cell', 'c4_shave') }, { id: 'pg2', name: '옥 문지기', look: LOOK.soldierEg, x: -27.4, z: 16, face: 0, prop: 'spear', noTalk: true, show: show('c3_cell', 'c4_shave') },
  // ---- Pharaoh's court
  { id: 'pharaoh', name: '바로', look: LOOK.pharaoh, x: -30, z: -177.2, face: 0, dy: 1.1 + padH(-30, -176) - padH(-30, -177.2), sit: true, fixedFace: true, talkR: 7.5, show: S => between(S, 'c4_court') || !!S.q.pharShow },
  { id: 'magician', name: NM.magician, look: LOOK.magician, x: -36.5, z: -171, face: 0.7, show: S => between(S, 'c4_court', 'c4_answer') || !!S.q.pharShow, chat: ['…나일의 신께서도 침묵하시는데, 히브리 노예가 무엇을 안다고.'] },
  { id: 'sage', name: NM.sage, look: Object.assign({}, LOOK.magician, { skin: 0xa86a40, sash: GOLD }), x: -23.5, z: -171, face: -0.7, show: S => between(S, 'c4_court', 'c4_answer') || !!S.q.pharShow, chat: ['일곱이라… 하늘의 수로다.'] },
  { id: 'cupbearerC', name: NM.cupbearer, look: LOOK.cupbearer, x: -26, z: -169, face: -0.4, show: S => between(S, 'c4_court') || !!S.q.pharShow, chat: ['요셉… 아니, 총리님. 이 년이나 잊고 있었던 나를 용서하시오.', '바로의 잔을 들 때마다 그날 옥에서의 일을 생각하오.'] },
  ...[[-35, -144], [-25, -144], [-38, -158], [-22, -158]].map(([x, z], i) => ({ id: 'royalG' + i, name: '궁의 호위병', look: LOOK.soldierEg, x, z, face: i < 2 ? 0 : (i === 2 ? 1.57 : -1.57), prop: 'spear', noTalk: true, show: S => between(S, 'c4_court') || !!S.q.pharShow })),
  // ---- the vizier's household (ch5–6)
  { id: 'asenath', name: '아스낫', look: LOOK.asenath, x: 7.6, z: -137.4, face: 0.4, show: S => between(S, 'c5_patrol') && !S.q.finale, chat: S => [S.q.born2 ? '므낫세가 에브라임에게 걸음마를 가르쳐요. 둘 다 넘어지지만요, 후후.' : S.q.born1 ? '므낫세가 오늘 당신을 보고 웃었어요.' : '여보, 오늘도 먼 길 다녀오셨군요.', '아버지께서 온의 신전에서 당신의 지혜를 칭찬하셨어요.'] },
  { id: 'manasseh', name: '므낫세', look: LOOK.manasseh, scale: 0.5, x: 10, z: -136, face: 0, wander: 2, show: S => !!S.q.born1 && !S.q.finale, chat: ['아빠!', '아빠, 수레 태워 주세요!'] },
  { id: 'ephraim', name: '에브라임', look: LOOK.ephraim, scale: 0.42, x: 11.5, z: -136.6, face: 0, wander: 1.5, show: S => !!S.q.born2 && !S.q.finale, chat: ['(방긋 웃는다)', '아빠!'] },
  { id: 'steward2', name: NM.steward2, look: Object.assign({}, LOOK.neb, { collar: GOLD }), x: 15, z: -138.6, face: -0.6, show: S => between(S, 'c5_patrol'), chat: ['총리님, 집안일은 염려 마십시오.', '은잔은 늘 깨끗이 닦아 두었습니다.'] },
  { id: 'overseerC', name: NM.overseerC, look: LOOK.official, x: 12, z: -70, face: 1.2, show: show('c5_patrol'), chat: ['곳간 기록은 서기관이 맡고 있습니다.'] },
  { id: 'overseerW', name: NM.overseerW, look: LOOK.elder, x: -136, z: -35, face: 2.8, show: show('c5_patrol'), chat: ['손녀가 총리님 이야기를 하면 눈이 반짝인답니다.'] },
  { id: 'overseerS', name: NM.overseerS, look: Object.assign({}, LOOK.farmer, { collar: TURQ, top: LINEN, bare: false, sleeveless: true }), x: -141, z: 123, face: 0.3, show: show('c5_patrol'), chat: ['언덕 위 곳간은 물 한 방울 들지 않습니다!'] },
  { id: 'brick', name: NM.brick, look: Object.assign({}, LOOK.farmer, { bottom: 0xb07848, skin: 0x9a6038 }), x: -44, z: -116, face: 0.8, act: 'gather', show: show('c5_patrol'), chat: ['진흙 둘에 짚 하나. 그게 좋은 벽돌의 비결이지요.'] },
  { id: 'scribeR', name: '왕궁 서기관', look: LOOK.scribe, x: 12, z: -58.6, face: 2.6, sit: true, show: show('c5_year1'), chat: ['곳간 기록은 오늘도 늘었습니다.'] },
  // ---- the famine: buyers at the city granary (창 41:56–57)
  { id: 'byFarmer', name: NM.farmer, look: LOOK.farmerThin, x: 10.5, z: -56, face: 2.4, show: show('c6_sell') },
  { id: 'byWoman', name: NM.woman, look: LOOK.woman, x: 13.2, z: -55, face: 2.9, show: show('c6_sell') },
  { id: 'byElder', name: NM.elder, look: LOOK.elder, x: 16.4, z: -55.2, face: -2.9, show: show('c6_sell') },
  { id: 'bySidon', name: NM.sidon, look: LOOK.sidon, x: 19.2, z: -56.2, face: -2.5, show: show('c6_sell') },
  { id: 'byEdom', name: NM.edom, look: LOOK.edom, x: 8.4, z: -54.2, face: 2.2, show: show('c6_sell') },
  { id: 'byAmeni', name: NM.ameni, look: LOOK.ameniOld, x: 21, z: -58.6, face: -2.2, show: show('c6_sell') },
  { id: 'benjamin2', name: '베냐민', look: LOOK.benjaminAdult, x: 172, z: 150, face: 0, noTalk: true, show: S => !!S.q.heb2 },
];
for (const n of npcs) if (n.id === 'jacob') n.show = S => before(S, 'p_road') || !!S.q.heb || !!S.q.heb2;
const BUYERS = [{ id: 'byFarmer' }, { id: 'byWoman' }, { id: 'byElder' }, { id: 'bySidon' }, { id: 'byEdom' }, { id: 'byAmeni', last: true }];

// ------------------------------------------------------------------ villages (people going about their days)
const EGV = { farmerA: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038 }), farmerB: EGM({ hairStyle: 'short', skin: 0xa86a40, bottom: 0xe0d4b8, beard: 'short' }), waterA: LOOK.woman, waterB: EGF({ skin: 0xc89060, top: 0xe8dcc0, collar: 0xb3472e, collar2: 0, hairStyle: 'long' }),
  potter: EGM({ hairStyle: 'bald', skin: 0x9a6038, bottom: 0xb89a78, build: 1.1 }), weaver: LOOK.weaver, merchant: LOOK.official, elder: LOOK.elder, kidA: KID({ skin: 0xb07448, bare: true, kilt: true, bottom: LINEN, top: LINEN, hairStyle: 'short' }),
  kidB: KID({ skin: 0xc08458, top: LINEN, long: true, fem: true, hairStyle: 'long' }), shep: EGM({ hairStyle: 'short', bottom: 0xd8c8a0, skin: 0x9a6038, prop: 'staff' }), oldW: EGF({ skin: 0xb88050, top: 0xd8ccb0, age: 'old', hair: 0xc8c0b8, hairStyle: 'bun', collar: 0x8a6a48, collar2: 0 }) };
const FK = (id, name, role, look, home, o) => Object.assign({ id, name, role, look: EGV[look] || look, home }, o || {});
const egy = S => between(S, 'c1_market');
const villages = [
  { id: 'city', n: '왕의 도성', x: -22, z: -74, r: 26, when: egy,
    spots: { hub: [-22, -74, 3], well: [-22, -82, 2.5], market: [-22, -71, 3], fire: [-30, -80, 2], play: [-14, -80, 3.5], gate: [-24, -50, 2], work: [-40, -66, 3], shade: [-48, -110, 3] },
    homes: [[-40, -60, 0], [-12, -58, 0], [-42, -72, 0], [-6, -74, 0], [-30, -88, 0], [-12, -88, 0]], about: ['바로의 도성은 나일 강 동쪽에 있다오.', '궁 앞 오벨리스크는 해가 뜨면 금빛으로 빛나지요.'],
    folk: [FK('ct_mer', '도성 상인 세네브', 'merchant', 'merchant', 2, { work: [-26, -73, 0, 1], persona: '도성 장터의 상인. 흥정을 좋아하고 소식에 밝다.' }), FK('ct_wat', '물 긷는 여인 네페르', 'water', 'waterA', 1, { persona: '나일 강에서 물을 긷는 상냥한 여인.' }),
      FK('ct_pot', '토기장이 아메니', 'potter', 'potter', 3, { work: [-40, -66, 0, 1], persona: '물동이와 곡식 항아리를 빚는 토기장이.' }), FK('ct_kid', '아이 케티', 'child', 'kidA', 1, { age: 'kid', persona: '네페르의 아들. 수레 구경을 좋아한다.' }),
      FK('ct_eld', '노인 이푸', 'elder', 'elder', 4, { age: 'old', persona: '도성 성문에 앉아 옛이야기를 하는 노인.' }), FK('ct_wea', '베 짜는 여인 메리트', 'weaver', 'waterB', 5, { work: [-10, -86, 0, 0.6], persona: '세마포를 짜는 솜씨 좋은 여인.' })] },
  { id: 'west', n: '서쪽 마을', x: -140, z: -40, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-140, -40, 2.5], well: [-140, -40, 3.2], market: [-136, -46, 2], fire: [-146, -44, 2], play: [-134, -36, 3], fold: [-122, -36, 2], pasture: [-118, -30, 8], field: [-118, -50, 4], work: [-118, -50, 3] },
    homes: [[-129, -36, 0], [-131, -52, 0], [-144, -55, 0], [-154, -42, 0], [-148, -27, 0], [-136, -24, 0]], about: ['서쪽 마을 사람들은 대대로 나일 강가 밭을 일구었다오.', '강을 건너려면 북쪽 나루로 가시오.'],
    folk: [FK('w_far', '농부 네헤시', 'farmer', 'farmerA', 0, { work: [-118, -50, 0, 4], persona: '서쪽 마을 농부. 말수가 적고 성실하다.' }), FK('w_wat', '여인 타-네트', 'water', 'waterB', 1, { persona: '서쪽 마을 여인. 웃음이 많다.' }), FK('w_kid', '아이 이피', 'child', 'kidB', 1, { age: 'kid', persona: '타-네트의 딸.' }), FK('w_shep', '목자 바크', 'shepherd', 'shep', 2, { persona: '마을 양을 치는 젊은이.' })] },
  { id: 'south', n: '남쪽 마을', x: -145, z: 128, r: 22, when: S => between(S, 'c2_arrive'),
    spots: { hub: [-145, 128, 2.5], well: [-145, 128, 3.2], market: [-140, 122, 2], fire: [-150, 124, 2], play: [-139, 133, 3], field: [-123, 118, 4], work: [-123, 118, 3] },
    homes: [[-134, 132, 0], [-136, 116, 0], [-149, 113, 0], [-159, 126, 0], [-153, 141, 0], [-141, 144, 0]], about: ['남쪽 마을은 강물이 넘치는 철이면 섬처럼 된다오.', '마을 서쪽 언덕은 물이 닿지 않는 높은 땅이오.'],
    folk: [FK('s_far', '농부 세티', 'farmer', 'farmerB', 0, { work: [-123, 118, 0, 4], persona: '남쪽 마을 농부. 쾌활하다.' }), FK('s_old', '할머니 우세트', 'oldwoman', 'oldW', 2, { age: 'old', persona: '옛이야기를 잘하는 할머니.' }), FK('s_kid', '아이 파세르', 'child', 'kidA', 3, { age: 'kid', persona: '세티의 아들.' }), FK('s_pot', '토기장이 후이', 'potter', 'potter', 4, { work: [-150, 120, 0, 1], persona: '항아리를 빚는 토기장이.' })] },
];
const strangers = { max: 0, when: () => false, looks: { default: LOOK.farmer } };

// ------------------------------------------------------------------ SITES (granaries, ch5)
const GRAN = (g, M, r) => G.env.granary(g, M, r, true);
const sites = [
  { id: 'granA', n: '성읍 곳간', x: 16, z: -64, cost: { brick: 20, wood: 6 }, model: GRAN, d: '각 성 주위 밭의 곡물을 그 성 중에 쌓아 두었더라 (창 41:48)', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granB', n: '서쪽 마을 곳간', x: -152, z: -20, cost: { brick: 20, wood: 6 }, model: GRAN, d: '서쪽 마을의 오분의 일을 쌓을 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
  { id: 'granC', n: '남쪽 마을 곳간', x: -160, z: 150, cost: { brick: 20, wood: 6 }, model: GRAN, d: '물이 닿지 않는 언덕 위 곳간', w: 10, d2: 6, avail: show('c5_year1'), col: { w: 10, d: 6.4, h: 4.5, cam: true } },
];

// ------------------------------------------------------------------ SPECIALS (things to use)
const SP = (id, x, z, label, on, use, o) => Object.assign({ id, x, z, r: 2.3, label, on, use }, o || {});
const cellIds = ['prisA', 'prisB', 'oldP', 'cell4'];
const specials = [
  SP('skin', 182.2, 155.2, '물가죽 부대 챙기기', S => S.step === 'p_provision' && !S.q.skin, (S, G) => { G.give('skin', 1); pick(); G.UI.hint('잘했어요! 이번엔 모닥불 곁의 빵을 챙겨요', 'items2', 'bag'); tick(S, 'skin'); }),
  SP('bread', 172.5, 157, '빵과 무화과 챙기기', S => S.step === 'p_provision' && !S.q.bread, (S, G) => { G.give('bread', 2); G.give('fig', 2); pick(); G.UI.hint(null); tick(S, 'bread'); }),
  SP('restBed', SPOTS.restBed[0], SPOTS.restBed[1], '누워서 별 보기', S => S.step === 'p_night', (S, G) => cinNight(S, G), { r: 2.8 }),
  ...['clue1', 'clue2', 'clue3'].map((k, i) => SP(k, SPOTS[k][0], SPOTS[k][1], ['식은 모닥불 자리 살피기', '양 떼 발자국 살피기', '돌무더기 표시 살피기'][i], S => S.step === 'p_shechem' && !(S.q.cl || {})[k], (S, G) => clue(S, G, k, i), { r: 2.6 })),
  SP('pitShout', PIT.x, PIT.z, '형들을 부르기', S => S.step === 'c1_pit' && !S.q.shout, (S, G) => pitShout(S, G), { r: 2.6, y: 1.2 }),
  SP('pitPray', PIT.x + 0.6, PIT.z - 0.6, '무릎 꿇고 하나님께 부르짖기', S => S.step === 'c1_pit' && S.q.shout && !S.q.pitPray, (S, G) => pitPray(S, G), { r: 2.6, y: 1.0 }),
  SP('kJars', -8.6, 47.4, S => S.water >= 4 ? '부엌 항아리에 물 붓기' : '물이 부족해요 (우물에서 길어 와요)', S => S.step === 'c2_work' && !S.q.w1, (S, G) => { if (S.water < 4) { G.UI.toast('우물에서 물을 길어 오세요 (4번 부을 물)'); return; } S.water -= 4; act('water', 0.8, 'jar'); G.sfx('pour'); G.UI.hud();
    say([EG('cook', '무! 무 네페르!', '물! 좋은 물이다!', 'happy'), N('ameni', '「무」는 물이란다. 이제 하나 배웠구나.', '', 'tender')], () => { learn('mu'); tick(S, 'w1'); }); }),
  SP('quern', SPOTS.quern[0], SPOTS.quern[1], '맷돌로 보리 갈기', S => S.step === 'c2_work' && !S.q.w2, (S, G) => { G.P.face = 0.3;
    G.UI.minigame('wrestle', { title: '맷돌 돌리기', need: 6, dur: 30 }, () => { G.sfx('grind'); say([EG('cook', '타! 타 네페르!', '빵! 좋은 빵이 되겠군!', 'happy'), N('ameni', '「타」는 빵이다. 이 고운 가루로 내일 아침 빵을 굽겠지.')], () => { learn('ta'); tick(S, 'w2'); }); }); }, { r: 2.2 }),
  SP('feedOx', 9, 70, '외양간 소들에게 꼴 주기', S => S.step === 'c2_work' && !S.q.w3, (S, G) => { act('gather', 0.9); G.sfx('moo'); say([N('boy', '카! 카! 형, 「카」는 황소예요. 우리 소들은 꼴을 주면 이렇게 고개를 끄덕여요!', '', 'happy')], () => { learn('ka'); tick(S, 'w3'); }); }, { r: 3 }),
  SP('calf', SPOTS.canal[0], SPOTS.canal[1] - 0.6, '진흙에서 송아지 끌어내기', S => S.step === 'c2_field' && !S.q.calf, (S, G) => { G.P.face = 0;
    G.UI.minigame('push', { title: '진흙에 빠진 송아지', hint: 'A를 누르고 있으면 끌어당겨요. 기운이 빠지면 잠깐 놓았다가 다시!', rate: 18 }, () => { G.sfx('moo', { pitch: 1.4 }); G.FX.burst(SPOTS.canal[0], G.W().heightAt(SPOTS.canal[0], SPOTS.canal[1]) + 0.4, SPOTS.canal[1], 22, { c: [0.35, 0.28, 0.2], sp: 2, up: 2 });
      say([N('boy', '살았다! 고마워요, 히브리 형! 이 송아지는 제가 제일 아끼는 애예요!', '', 'happy')], () => tick(S, 'calf')); }); }, { r: 2.6 }),
  ...[['wine', '포도주 항아리', 14, 3.4 - 0.6, -2.6], ['oil', '기름병', 9, 3.4 - 0.6, 2.6], ['grain', '곡식 자루', 22, 0.6, -3.3 + 0.6], ['figs', '무화과 바구니', 6, 0.6, 3.3 - 0.6]].map(([k, n, c, dx, dz]) =>
    SP('sh_' + k, SPOTS.store[0] - 0.5 + dx, SPOTS.store[1] + 0.5 + dz, n + ' 세기', S => S.step === 'c2_store' && !(S.q.shelf || {})[k], (S, G) => { act('pick', 1.0); (S.q.shelf = S.q.shelf || {})[k] = c; G.UI.quest();
      say([J(`${n}… 하나, 둘, 셋… 모두 ${KNUM[c]}.`, '', 'calm')]); }, { r: 1.7, y: 1.2 })),
  SP('assign', -28, 44.2, '일꾼들의 일 정하기', S => S.step === 'c2_manage' && !S.q.assign, (S, G) => assignPuzzle(S, G), { r: 2.4 }),
  SP('serveT', -38.4, 44.6, S => S.q.carry ? `들고 있는 것 · ${S.q.carry}` : '시중 상에서 음식 들기', S => S.step === 'c2_banquet', (S, G) => serveTable(S, G), { r: 2 }),
  SP('ledgerT', -22.5, 41.6, '장부 정리하기', S => S.step === 'c2_tempt3' && S.q.empty, (S, G) => cinGrab(S, G), { r: 2.2 }),
  SP('prayWin', -18.4, -8.2, '달빛 아래 무릎 꿇고 기도하기', S => S.step === 'c3_cell' || (S.step === 'c3_wait' && S.q.wReady), (S, G) => windowPray(S, G), { r: 1.8, y: 1.0 }),
  ...CELL.map(([x, z], i) => SP('cw' + i, x, -4.9, S => S.step === 'c3_keeper' ? (S.water > 0 ? '창살 너머로 물 건네기' : '물이 없어요 (대야에서 길어 와요)') : '창살 너머로 떡 건네기',
    S => (S.step === 'c3_keeper' && !(S.q.gave || {})[i]) || (S.step === 'c3_charge' && Gm().P.carry === 'basket' && !(S.q.fed || {})[i]), (S, G) => cellGive(S, G, i), { r: 1.9, y: 1.2 })),
  SP('breadT', -32, 6.2, '떡 바구니 머리에 이기', S => S.step === 'c3_charge' && Gm().P.carry !== 'basket' && Object.keys(S.q.fed || {}).length < 4, (S, G) => { G.P.carry = 'basket'; G.P.carryArms = false; G.sfx('gather'); G.UI.toast('떡 바구니를 머리에 이었다 · 감방마다 나눠 주세요'); G.UI.quest(); }, { r: 2.2 }),
  SP('scratch', -20.4, -6.4, '벽에 지난 날들을 새기기', S => S.step === 'c3_wait' && (S.q.wait || 0) === 2 && !S.q.wReady, (S, G) => scratchWall(S, G), { r: 1.6, y: 1.3 }),
  SP('shave', SPOTS.basin[0], SPOTS.basin[1], '물로 씻고 수염 깎기', S => S.step === 'c4_shave', (S, G) => shaveScene(S, G), { r: 2.4 }),
  SP('rodeChk', 0, 0, '', S => false, () => { }),
  ...['A', 'B', 'C'].map(k => { const g = sites.find(s => s.id === 'gran' + k); return SP('open' + k, g.x, g.z + 4, '곳간 문 열기', S => S.step === 'c6_open' && !(S.q.opened || {})[k], (S, G) => openGranary(S, G, k), { r: 3.2 }); }),
];
// v15 살펴보기: little things worth a closer look. Each one tells a true story of the place (often a verse), fills the eye (정신력)
// a little, and counts toward 「알아낸 것」.
const LORE = [
  ['senet', -19.2, 41.6, '세넷 놀이판', '서른 칸짜리 판 위에서 말을 움직이는 애굽의 놀이 「세넷」이에요. 납작한 막대 네 개를 던져 나온 수만큼 나아가요. 귀족도 종들도 모두 즐겼대요.', ''],
  ['scribe', -36.6, 44.6, '서기관의 책상', '갈대 펜, 검은 잉크와 붉은 잉크, 파피루스 두루마리. 이 집의 곡식과 가축이 여기 하나하나 적혔어요. 훗날 이 모든 것을 요셉이 맡게 되지요.', '창세기 39:4'],
  ['linen', -30.8, 38.6, '고운 세마포', '애굽은 아마로 짠 고운 세마포로 이름난 땅이었어요. 훗날 바로는 요셉에게 세마포 옷을 입히고 금 사슬을 목에 걸어 주었어요.', '창세기 41:42'],
  ['rack', -8.9, 44.4, '말린 생선과 양파', '나일 강의 생선, 양파와 마늘… 훗날 광야의 이스라엘 백성은 애굽에서 먹던 이 맛을 그리워했어요.', '민수기 11:5'],
  ['bread', -11.5, 43.4, '화덕 빵', '애굽 사람들은 보리와 밀로 날마다 빵을 구웠어요. 둥근 빵, 길쭉한 빵, 대추야자를 넣은 달콤한 빵까지 있었대요.', ''],
  ['amph', -12.5, 65.4, '포도주와 기름 항아리', '곳간의 큰 항아리마다 무엇이 들었는지 꼬리표가 붙어 있었어요. 요셉이 이 집을 맡은 뒤로 여호와의 복이 집과 밭에 넘쳤어요.', '창세기 39:5'],
  ['lotus', -18, 61.6, '연꽃 연못', '푸른 연꽃은 아침에 피고 저녁에 오므라들어요. 애굽 사람들이 무척 아끼던 꽃이라 벽화와 그릇마다 그려 넣었어요.', ''],
  ['dove', -45.6, 39.6, '비둘기장', '애굽에서는 집집마다 비둘기를 길렀어요. 알과 고기를 얻고, 거름은 밭에 뿌렸대요.', ''],
  ['shaduf', 16, 53.6, '샤두프', '긴 장대 한쪽엔 두레박, 반대쪽엔 무거운 흙덩이. 지렛대 원리로 나일 강물을 퍼 올려 밭에 대는 도구예요.', ''],
  ['jug', -16.4, -8.0, '물 한 대접', '옥에서는 물 한 대접도 귀했어요. 그래도 여호와께서 요셉과 함께 계셔서, 간수장의 마음을 얻게 하셨어요.', '창세기 39:21'],
  ['throne', -30, -171.2, '바로의 보좌', '금과 청금석으로 꾸민 보좌. 바로는 요셉에게 「내가 너보다 높은 것은 그 보좌뿐이니라」 하고 말했어요.', '창세기 41:40'],
  ['onAltar', 12, -102.2, '온의 제단', '온(헬리오폴리스)은 해를 섬기던 성읍이에요. 요셉의 아내 아스낫은 이 온의 제사장 보디베라의 딸이었어요.', '창세기 41:45'],
  ['obelisk', 6.6, -95, '오벨리스크', '돌 하나를 통째로 깎아 세운 뾰족한 기둥이에요. 꼭대기를 금으로 씌워 햇빛에 번쩍였대요.', ''],
  ['pyramid', -188, -175, '피라미드', '요셉이 애굽에 왔을 때, 이 피라미드는 이미 수백 년 된 옛 왕들의 무덤이었어요.', ''],
  ['tent', 172.6, 150.4, '염소털 장막', '야곱의 장막은 검은 염소털로 짰어요. 비가 오면 털실이 부풀어 물이 새지 않고, 해가 나면 바람이 잘 통했대요.', ''],
];
const loreBusy = (S, me) => specials.some(o => o !== me && !o.lore && o.id !== 'rodeChk' && Math.hypot(o.x - Gm().P.x, o.z - Gm().P.z) < (o.r || 2.4) && o.on && o.on(S, Gm()));
for (const [id, x, z, n, t, ref] of LORE) { const sp = SP('lore_' + id, x, z, `살펴보기 · ${n}`, S => !loreBusy(S, sp), (S, G) => {
    const L = S.flags.lore = S.flags.lore || {}, first = !L[id]; L[id] = 1; GG.Audio && GG.Audio.sfx('page', { vol: 0.6 });
    say([{ n: n, t, ref }], () => { const got = Object.keys(L).length; if (first) { GG.Vitals && GG.Vitals.mindGain && GG.Vitals.mindGain(12); GG.UI.toast(`알아낸 것 ${got} / ${LORE.length} · 정신력 +12`); if (!S.flags.tipLore) { S.flags.tipLore = 1; setTimeout(() => GG.UI.toast('곳곳의 물건을 살펴보면 이야기를 알게 되고, 눈(정신력)이 조금 차요'), 2600); } } }); },
    { r: 1.5, y: 1.1, lore: true }); specials.push(sp); }

const KNUM = { 6: '여섯', 9: '아홉', 14: '열넷', 22: '스물둘' };
function pick() { const P = Gm().P; P.act = 'pick'; P.actT = 0; P.actDur = 0.8; P.actHits = 1; P.fired = true; Gm().sfx('pickup'); }
function act(k, dur, prop) { const P = Gm().P; P.act = k; P.actT = 0; P.actDur = dur || 0.8; P.actHits = 1; P.fired = true; P.actProp = prop || null; }

// ------------------------------------------------------------------ SHOPS & STATIONS
const shops = {
  market: { n: '도성 장터', buy: [{ n: '빵 ×3', item: 'bread', qty: 3, price: 12 }, { n: '무화과 ×4', item: 'fig', qty: 4, price: 8 }, { n: '밀 씨앗 ×10', item: 's_wheat', qty: 10, price: 14 }, { n: '양파 씨앗 ×6', item: 's_onion', qty: 6, price: 10 }], mul: { good: 1.1 } },
};
const stations = [
  // v16.9 each well's action sits on the well itself (it used to be a couple of metres in front of it)
  { id: 'wHeb', type: 'well', x: 160, z: 150, r: 3.2 }, { id: 'fHeb', type: 'fire', x: 176, z: 153, r: 3 }, { id: 'bHeb', type: 'bed', x: SPOTS.bedHeb[0], z: SPOTS.bedHeb[1], r: 2, on: S => before(S, 'p_road') },
  { id: 'fOak', type: 'fire', x: SPOTS.restOak[0], z: SPOTS.restOak[1], r: 3 }, { id: 'fDot', type: 'fire', x: 158, z: -150, r: 3 }, { id: 'fCar', type: 'fire', x: SPOTS.caravanNight[0], z: SPOTS.caravanNight[1], r: 3 },
  { id: 'wPot', type: 'well', x: SPOTS.well[0], z: SPOTS.well[1], r: 3.2, on: inEgyptHouse }, { id: 'bPot', type: 'bed', x: -46.8, z: 50, on: inEgyptHouse },
  { id: 'wPri', type: 'well', x: SPOTS.basin[0], z: SPOTS.basin[1], r: 2.8, rim: 1.3, on: show('c3_keeper', 'c4_shave') }, { id: 'bPri', type: 'bed', x: -19.4, z: -8.6, on: show('c3_keeper', 'c3_wait') },
  { id: 'bJos', type: 'bed', x: 10, z: -141.2, on: show('c5_patrol') }, { id: 'wCity', type: 'well', x: -22, z: -82, r: 3.2 }, { id: 'wW', type: 'well', x: -140, z: -40, r: 3.2 }, { id: 'wS', type: 'well', x: -145, z: 128, r: 3.2 },
  { id: 'shopM', type: 'shop', shop: 'market', label: '도성 장터에서 사고팔기', x: -22, z: -66.4, r: 2.6, on: show('c5_patrol') },
];
const fields = [
  { id: 'pflax', x: 6, z: 44, cols: 8, rows: 4, ts: 1.6 },
  { id: 'royal', x: -72, z: -150, cols: 8, rows: 5, ts: 1.6, lock: true },
];
const pens = [
  { id: 'hebFlock', n: '야곱의 양 떼', x: 192, z: 171, w: 12, d: 9, owner: 'jacob', cap: 40, init: [...Array(10)].map((_, i) => [i % 3 ? 'sheep' : 'goat', i === 4 ? 'speckled' : i === 7 ? 'spotted' : 'plain', i % 4 ? 0 : 1, 12]), trough0: 12, hidden: S => !before(S, 'p_road') },
  { id: 'dotFlock', n: '형들의 양 떼', x: 148, z: -175, w: 14, d: 10, owner: 'bro', cap: 40, init: [...Array(14)].map((_, i) => [i % 4 ? 'sheep' : 'goat', i % 5 === 0 ? 'speckled' : i % 7 === 0 ? 'spotted' : 'plain', i % 5 ? 0 : 1, 12]), trough0: 12, hidden: S => !between(S, 'p_dothan', 'c1_pit') },
  { id: 'pcattle', n: '보디발의 외양간', x: 9, z: 76, w: 10, d: 11, owner: 'potiphar', cap: 30, init: [['cow', 'plain', 0, 20], ['cow', 'plain', 0, 20], ['cow', 'plain', 1, 20], ['cow', 'plain', 0, 3], ['goat', 'plain', 0, 12], ['goat', 'brown', 0, 12]], trough0: 12, hidden: S => before(S, 'c1_market') },
];
