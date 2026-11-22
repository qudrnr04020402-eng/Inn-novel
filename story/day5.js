// ============================================================
//  5일차 — 봉인이 깨지는 날
//  아침(대피소 경영 선택) -> 낮(함께 동굴로 갈 사람 고르기) -> 저녁(동굴 클라이맥스) -> 새벽 -> endings.js 의 end_judge
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d5_open: [
    { bgm: 'tension' },
    { day: 5, time: '아침', tip: '마지막 날이에요.\n낮에 함께 동굴로 갈 사람을 고르고, 저녁에 결전을 치릅니다.' },
    { bg: 'inn_front' }, { hide: 'all' },
    { fx: 'shake' },
    { narr: '새벽부터 땅이 울렸다. 어제보다 훨씬 깊고, 훨씬 길게. 은빛 여우관의 간판이 삐걱거리며 떨어질 듯 흔들린다.' },
    { narr: '뒷산에서 푸른 기둥이 하늘로 치솟고, 그 위로 낮인데도 별 같은 빛이 깜빡인다. 봉인이 깨지는 날. 드디어 마지막 날이 왔다.' },
    { if: 'flag.plan_run', goto: 'd5_open_run' },
    { goto: 'd5_shelter' }
  ],
  d5_open_run: [
    { narr: '밤새 짐을 쌌지만 마음이 가볍지 않았다. 아침, 짐수레를 끌고 나서는데 여관 문 앞에 리아가 팔짱을 끼고 서 있었다.' },
    { show: 'lia', face: 'sad', pos: 'center' },
    { say: 'lia', text: '…도망친다면 말리지 않을게. 하지만 우리가 돌아올 곳이 사라질 텐데, 그래도 괜찮아?' },
    { narr: '리아의 눈동자가 아침 햇살에 반짝였다. 화낸다기보다 믿고 싶어 하는 얼굴이다.' },
    { choice: [
      { text: '"…미안해요. 돌아갈게요. 같이 싸울게요."', set: { rep: 1, 'aff.lia': 1, 'aff.erion': 1, 'aff.kaela': 1, 'aff.miho': 1 }, goto: 'd5_run_back' },
      { text: '"…알았어요. 짐부터 다시 풀게요."', goto: 'd5_run_back' }
    ] }
  ],
  d5_run_back: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…응. 그 말이 듣고 싶었어. 가자, 모두 기다리고 있어.' },
    { goto: 'd5_shelter' }
  ],
  d5_shelter: [
    { hide: 'all' }, { bg: 'inn_day' },
    { narr: '마을 사람들이 줄지어 여관 문을 두드렸다. 아이를 업은 아주머니, 지팡이를 짚은 노인, 겁에 질린 청년단원들. 은빛 여우관의 넓은 식당과 지하 저장고가 마을의 피난처가 된 것이다.' },
    { narr: '이럴 때 주인이 어떻게 하느냐는 오래 기억될 것이다.' },
    { choice: [
      { text: '"여관을 모두에게 개방합니다. 비용은 걱정 마세요." (30G)', cost: 30, set: { rep: 3 }, goto: 'd5_shelter_free' },
      { text: '"자리는 내줄게요. 식사는 각자 가져온 걸로 해결해 주세요."', set: { rep: 1, gold: 10 }, goto: 'd5_shelter_mid' },
      { text: '"…1인당 5골드의 자리값을 받겠습니다."', set: { gold: 30, rep: -3 }, goto: 'd5_shelter_greedy' }
    ] }
  ],
  d5_shelter_free: [
    { narr: '촌장님이 눈시울을 붉히며 내 손을 잡았다. "이 은혜는 잊지 않겠네." 사람들이 서로 도와 담요와 수프를 나눠 주기 시작했다. 여관이 오랜만에 마을 사람들의 온기로 가득 찼다.' },
    { goto: 'd5_pick' }
  ],
  d5_shelter_mid: [
    { narr: '사람들은 고맙다고 고개를 숙였다. 큰 칭찬도, 큰 불만도 없다. 이럴 때 저마다 가진 것을 나누는 모습이 오히려 마음을 놓이게 했다.' },
    { goto: 'd5_pick' }
  ],
  d5_shelter_greedy: [
    { narr: '금고에 돈이 쌓이는 동안 사람들의 눈빛은 싸늘해졌다. "이런 때에 돈을 받아?" 중얼거림이 귓가에 박혔다. 몇몇은 아예 문을 나가 버렸다.' },
    { goto: 'd5_pick' }
  ],

  // ================= 낮: 함께 갈 사람 =================
  d5_pick: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '해 질 녘까지 몇 시간이 남았다. 동굴로 가는 길에 가장 곁에 있어 주었으면 하는 사람은 누구일까?' },
    { narr: '이 선택이 결전의 분위기를 바꿀 것이다. 그리고 마음도.' },
    { talkpick: true, choice: [
      { who: 'erion', text: '"에리온, 마지막으로 곁에서 준비를 도울게요."', set: { 'aff.erion': 2, 'flag.partner_erion': true }, goto: 'd5_with_erion' },
      { who: 'kaela', text: '"카엘라, 같이 앞에서 길을 열어요."', set: { 'aff.kaela': 2, 'flag.partner_kaela': true }, goto: 'd5_with_kaela' },
      { who: 'miho', text: '"미호, 같이 정찰하면서 가요."', set: { 'aff.miho': 2, 'flag.partner_miho': true }, goto: 'd5_with_miho' },
      { who: 'lia', text: '"리아, 같이 기도하고 출발해요."', set: { 'aff.lia': 2, 'flag.partner_lia': true }, goto: 'd5_with_lia' }
    ] }
  ],
  d5_with_erion: [
    { bg: 'roof_night' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…준비라는 게 별거 없어. 책을 펼치고 문양을 그리는 것뿐이야. 그런데도 손이 떨리네.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…손, 잡아 줄래? 아, 아니, 문양이 안정되는지 확인하려고 그런 거야! 이건 실험이야, 실험!' },
    { narr: '에리온의 손은 얼음처럼 차갑고 가늘었다. 한참 쥐고 있자 서서히 온기가 번졌다. 책의 푸른 빛이 한결 부드러워졌다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…따뜻하다. 이 느낌, 잊고 싶지 않아. 이름을 잃어도, 이 손의 온기만큼은 기억하고 싶어.' },
    { goto: 'd5_tavern' }
  ],
  d5_with_kaela: [
    { bg: 'inn_front' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '주인장! 마지막 수련이다! 오늘은 빨랫줄 없는 곳에서 하자!' },
    { narr: '마당 한가운데서 기본 자세를 처음부터 끝까지 반복했다. 땀이 흐르고 숨이 차오르는 동안 카엘라의 눈이 점점 진지해졌다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…주인장 덕에, 나는 처음으로 내 검이 무겁지 않다고 느낀다. 휘두르는 게 아니라 지키는 데 쓰는 거라서 그런가.' },
    { show: 'kaela', face: 'normal' },
    { say: 'kaela', text: '이 싸움이 끝나면 정식 기사 시험을 다시 보겠다. 그때는 …주인장이 응원 와 주면 좋겠다.' },
    { goto: 'd5_tavern' }
  ],
  d5_with_miho: [
    { bg: 'inn_day' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '정찰이라는 건 이런 거예요, 사장님. 소리를 죽이고, 그림자를 밟고, 눈을 가늘게 뜨고.' },
    { narr: '미호를 따라 뒷산 길을 몰래 걸었다. 앞서 걷는 그녀의 꼬리가 길잡이처럼 살랑였다. 발소리 하나 나지 않는 걸음걸이가 놀랍다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…사장님, 저 도적 그만두면요, 이 여관에서 계속 일하면 안 될까요? 월급은 낮아도 돼요. 숙식 제공이면… 아니, 월급은 올려 주세요.' },
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '…농담 반, 진담 반이에요. 반이 어느 쪽인지는 비밀이고요.' },
    { goto: 'd5_tavern' }
  ],
  d5_with_lia: [
    { bg: 'square_day' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '신전에서 마지막 기도를 하고 가자. 어릴 때 처음 같이 와서 소원 빌었던 그 자리에서.' },
    { narr: '신전 안은 조용했다. 햇살이 스테인드글라스를 통과해 리아의 분홍빛 머리카락 위에 부드럽게 내려앉았다. 둘이 나란히 무릎을 꿇고 눈을 감았다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '있잖아. 어릴 땐 \'여관이 망하지 않게 해 주세요\'라고 빌었어. 근데 지금 소원은 달라.' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '\'오늘 이후에도, 이 사람이 내 곁에 있게 해 주세요.\' …이 말은 소리 내서 말하면 안 되는 건데. 들었으면 모른 척해 줘.' },
    { goto: 'd5_tavern' }
  ],

  // ================= 저녁: 출정 전 마지막 영업 =================
  // 저녁 영업(story/tavern.js 의 day5) -> 동굴 결전
  d5_tavern: [
    { bgm: 'tavern' },
    { talkoffer: true },   // 자유 대화 제안 (PC 서버 + 로컬 LLM 일 때만)
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '출발 시각이 가까워졌다. 하지만 식당에는 대피한 마을 사람들이, 그리고 마지막 한 잔을 청하는 동료들이 모여 있다.' },
    { narr: '\'은빛 여우관\'의 주인으로서 하는 마지막 영업이다. 주문을 받고, 재료를 고르고, 한 잔씩 내었다.' },
    { tavern: 'day5' },
    { goto: 'd5_evening' }
  ],

  // ================= 결전: 동굴 =================
  d5_evening: [
    { bgm: 'tension' },
    { time: '황혼' }, { bg: 'cave_front' }, { hide: 'all' },
    { narr: '해 질 녘. 동굴 입구에서 푸른 빛이 하늘로 솟구쳐 노을을 물들였다. 마을 청년단은 멀찍이서 횃불을 들고 우리를 지켜보고 있다.' },
    { show: 'kaela', face: 'normal', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'miho', face: 'normal', pos: 'right' },
    { say: 'kaela', text: '준비는 됐나, 주인장. 여기가 우리의 최전선이다!' },
    { say: 'erion', text: '…문이 열린다. 간다.' },
    { fx: 'shake' },
    { narr: '동굴 안쪽에서 쿠르릉, 하고 거대한 바위가 굴러가는 소리가 났다. 푸른 빛이 눈부시게 터졌다. 우리는 동굴 속으로 뛰어들었다.' },
    { hide: 'all' }, { bgm: 'cave' }, { bg: 'cave_inside' },
    { narr: '동굴 깊숙한 곳. 푸른 수정이 사방에서 빛나는 널찍한 공동. 한가운데에 거대한 검은 그림자가 일어서고 있다. 갑옷 같은 형상에 붉은 눈 두 개.' },
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'lia', face: 'normal', pos: 'right' },
    { say: 'erion', text: '…어둠의 문지기. 삼백 년 만이네.' },
    { say: 'lia', text: '리아도 따라왔어요! 치료와 방어는 맡겨 주세요!' },
    { narr: '뒤늦게 리아가 숨을 몰아쉬며 합류했다. 미호는 이미 어디론가 사라졌다. 어딘가에서 지켜보고 있겠지.' },
    { say: 'kaela', face: 'smile', text: '하하! 드디어 진짜 적이다! 주인장, 명령을! 오프닝 공격은 누구에게 맡길 거냐!' },
    { choice: [
      { who: 'kaela', text: '"카엘라, 정면에서 시선을 끌어 줘요!"', set: { 'aff.kaela': 1 }, goto: 'd5_s1_kaela' },
      { who: 'erion', text: '"에리온, 의식을 준비해요. 시간은 우리가 벌게요!"', set: { 'aff.erion': 1 }, goto: 'd5_s1_erion' },
      { who: 'miho', text: '"미호, 어디선가 보고 있죠? 약점을 찾아 줘요!"', set: { 'aff.miho': 1 }, goto: 'd5_s1_miho' },
      { who: 'lia', text: '"리아, 모두에게 가호를 걸어 줘요!"', set: { 'aff.lia': 1 }, goto: 'd5_s1_lia' }
    ] }
  ],
  d5_s1_kaela: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '맡겨라! 붉은 사자의 포효를… 이번엔 제대로 보여 주겠다!' },
    { fx: 'shake' },
    { narr: '카엘라가 거인의 발목을 향해 달려들었다. 대검과 그림자가 부딪히며 불꽃이 튀었다. 문지기의 시선이 완전히 그녀에게 쏠렸다.' },
    { goto: 'd5_stage2' }
  ],
  d5_s1_erion: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…시간을 벌어 줘. 열 호흡이면 돼.' },
    { narr: '에리온이 책을 펼치고 문양을 그리기 시작했다. 푸른 빛줄기가 땅을 타고 번지며 천천히 거대한 원이 만들어졌다.' },
    { goto: 'd5_stage2' }
  ],
  d5_s1_miho: [
    { narr: '천장 틈에서 짧은 신호음이 났다. 휘파람이다. 미호가 어딘가에서 속삭였다.' },
    { say: 'miho', text: '사장님, 가슴팍 정중앙에 균열이 보여요! 거기가 약점이에요! 제가 시선을 끌어 볼게요!' },
    { narr: '거대한 그림자 위로 작은 그림자가 바람처럼 달려 올라갔다. 문지기가 미호를 잡으려 헛손질을 하는 동안 균열이 눈에 띄게 벌어졌다.' },
    { goto: 'd5_stage2' }
  ],
  d5_s1_lia: [
    { show: 'lia', face: 'normal' },
    { say: 'lia', text: '신이시여, 이 자리에 선 모든 이에게 빛의 가호를!' },
    { sfx: 'mystery' }, { fx: 'flash' },
    { narr: '금빛 빛무리가 동료들을 감쌌다. 몸이 가벼워지고 두려움이 걷혔다. 리아의 손끝에서 따뜻한 빛이 쉼 없이 흘러나오고 있었다.' },
    { goto: 'd5_stage2' }
  ],

  // ----- 2단계: 위기 -----
  d5_stage2: [
    { narr: '그때, 문지기가 거대한 팔을 휘둘렀다. 어둠이 촉수처럼 갈라져 사방으로 뻗쳤다.' },
    { fx: 'shake' },
    { narr: '카엘라가 튕겨 나가 벽에 부딪히고, 에리온의 문양이 흔들리고, 미호가 천장에서 떨어지고, 리아의 방어막에 금이 갔다. 모두가 동시에 위험하다. 단 한 사람밖에 구할 수 없다.' },
    { choice: [
      { who: 'kaela', text: '튕겨 나간 카엘라에게 달려간다', set: { 'aff.kaela': 2 }, goto: 'd5_s2_kaela' },
      { who: 'erion', text: '문양이 흔들리는 에리온 곁으로 달려간다', set: { 'aff.erion': 2 }, goto: 'd5_s2_erion' },
      { who: 'miho', text: '천장에서 떨어지는 미호를 받으러 간다', set: { 'aff.miho': 2 }, goto: 'd5_s2_miho' },
      { who: 'lia', text: '방어막이 깨지는 리아를 감싼다', set: { 'aff.lia': 2 }, goto: 'd5_s2_lia' }
    ] }
  ],
  d5_s2_kaela: [
    { show: 'kaela', face: 'surprised', pos: 'left' },
    { narr: '벽에 처박힌 카엘라 곁으로 뛰어갔다. 대검이 바닥에 꽂혀 있고, 그녀는 투구를 벗은 채 이를 악물고 있다.' },
    { say: 'kaela', face: 'sad', text: '…괜찮다. 영웅은 이 정도로 쓰러지지 않는다. …정말이다. 조금 아프지만.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…주인장이 달려와 줘서, 두려움이 사라졌다. 이게 기사의 마음이라면, 나도 이제 기사가 될 수 있겠지.' },
    { narr: '카엘라가 이를 악물고 일어났다. 대검을 뽑아 든 그녀의 자세는 어느 때보다 곧았다.' },
    { goto: 'd5_stage3' }
  ],
  d5_s2_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { narr: '촉수가 에리온의 문양을 지우려 한다. 나는 그녀를 감싸 안고 등으로 파편을 받았다. 숨이 막혔지만 문양은 지켜졌다.' },
    { say: 'erion', text: '왜… 왜 몸으로 막아! 바보야! 다치면 안 되잖아!' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…하지만 고마워. 너는, 내가 아는 인간 중에서 제일 이상해. 그리고 제일 따뜻해.' },
    { goto: 'd5_stage3' }
  ],
  d5_s2_miho: [
    { show: 'miho', face: 'surprised', pos: 'right' },
    { narr: '천장에서 떨어지는 미호를 팔로 받았다. 푹신한 꼬리가 얼굴을 덮고 시야가 금빛으로 가득 찼다.' },
    { say: 'miho', text: '사, 사장님!? 받아 주다니, 이거 처음이에요. 늘 떨어져도 혼자 착지했는데.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…값 매길 수 없는 서비스네요. 이건 영원히 빚이에요. 갚을 때까지 도망 안 갈 거예요.' },
    { goto: 'd5_stage3' }
  ],
  d5_s2_lia: [
    { show: 'lia', face: 'surprised', pos: 'right' },
    { narr: '리아의 방어막이 유리처럼 깨지는 순간, 나는 몸을 던져 그녀를 끌어안았다. 어둠이 등 뒤를 스치고 지나갔다.' },
    { say: 'lia', text: '…! 안 돼, 위험해! 내가 지켜야 하는 건데!' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…늘 그랬지. 네가 먼저 달려와 줘서. 어릴 때부터 쭉. 그래서 난 널…' },
    { narr: '리아는 말끝을 흐렸다. 그리고 내 가슴에 얼굴을 묻은 채 \'…고마워\'라고 속삭였다.' },
    { goto: 'd5_stage3' }
  ],

  // ----- 3단계: 봉인 -----
  d5_stage3: [
    { hide: 'all' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { narr: '문지기의 움직임이 한순간 느려졌다. 에리온의 문양이 완성된 것이다. 푸른 책이 눈부시게 빛나며 그녀의 발밑에서 거대한 원이 일어섰다.' },
    { say: 'erion', text: '…지금이야. 봉인을 맺겠어. 이름을 바칠게.' },
    { if: 'flag.plan_team', goto: 'd5_s3_team' },
    { if: 'flag.plan_trust', goto: 'd5_s3_trust' },
    { goto: 'd5_s3_other' }
  ],
  d5_s3_team: [
    { say: 'erion', face: 'shy', text: '…하지만 어젯밤 네가 말했지. \'함께 방법을 찾자\'고. 그래서 마지막으로 한 번 더 물어볼게.' },
    { say: 'erion', face: 'normal', text: '내가 이름을 내놓지 않고 봉인할 수 있다고 생각해? 정말로?' },
    { goto: 'd5_final' }
  ],
  d5_s3_trust: [
    { say: 'erion', face: 'normal', text: '…네가 나를 믿는다고 했지. 그래서 네 앞에서는 도망치지 않을 거야. 약속대로 끝까지 해낼게.' },
    { say: 'erion', face: 'sad', text: '…이름이 사라져도 이 장면만은 기억에 남았으면 좋겠어.' },
    { goto: 'd5_final' }
  ],
  d5_s3_other: [
    { say: 'erion', face: 'sad', text: '…이게 최선이야. 아무도 나를 기억해 주지 않아도. 이 마을만 무사하면 돼.' },
    { goto: 'd5_final' }
  ],
  d5_final: [
    { show: 'kaela', face: 'angry', pos: 'left' },
    { show: 'lia', face: 'sad', pos: 'right' },
    { say: 'kaela', text: '안 된다, 에리온! 영웅은 아무도 희생시키지 않는다! 그걸 내가 증명해 보이겠다!' },
    { say: 'lia', text: '그런 봉인은 틀렸어요! 신께서도 분명 같은 말씀을 하실 거예요!' },
    { narr: '모두의 시선이 다시 나를 향했다. 에리온의 손끝에서 책장이 넘어간다. 시간이 없다. 마지막 순간이다. 나는 어떤 말을 해야 할까?' },
    { choice: [
      { who: 'erion', text: '"에리온! 이름을 내놓지 마요! 우리가 함께 지탱할게요!"', set: { 'aff.erion': 2, rep: 1 }, goto: 'd5_win_erion' },
      { text: '"모두, 에리온의 책 위에 손을 얹어요!"', set: { 'aff.erion': 1, 'aff.kaela': 1, 'aff.miho': 1, 'aff.lia': 1, rep: 2 }, goto: 'd5_win_all' },
      { who: 'lia', text: '"리아, 신의 힘을 책에 보태 줘요!"', set: { 'aff.lia': 2, 'aff.erion': 1 }, goto: 'd5_win_lia' }
    ] }
  ],
  d5_win_erion: [
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…함께, 지탱한다고?' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…정말 어리석고, 정말 다정한 말이야. 그래. 한 번만 더 믿어 볼게. 스승님이 원했던 건 이런 걸지도 몰라.' },
    { goto: 'd5_win' }
  ],
  d5_win_all: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '이럴 줄 알고 있었어요! 보수는 후불이니까 다들 책임지고 살아남아야 해요!' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '손을 얹으면 되는 건가! 이 몸의 영웅의 손길을 받아라!' },
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '다 같이, 신께 기도하며!' },
    { show: 'erion', face: 'surprised', pos: 'left' },
    { say: 'erion', text: '…너희들. 정말이지, 한 명도 빠짐없이 바보들이네.' },
    { goto: 'd5_win' }
  ],
  d5_win_lia: [
    { show: 'lia', face: 'normal', pos: 'center' },
    { say: 'lia', text: '맡겨 줘! 신이시여, 이 책에 제 모든 가호를!' },
    { sfx: 'mystery' }, { fx: 'flash' },
    { narr: '리아의 손끝에서 금빛 빛이 퍼져 책과 하나가 되었다. 푸른 빛과 금빛이 뒤섞이며 문양이 한층 단단해졌다.' },
    { show: 'erion', face: 'surprised', pos: 'left' },
    { say: 'erion', text: '…이 따뜻함은. 이름 대신 바칠 필요가 없어졌어.' },
    { goto: 'd5_win' }
  ],
  d5_win: [
    { bgm: 'inn_day' },
    { sfx: 'mystery' }, { fx: 'flash' },
    { narr: '푸른 빛과 금빛이 폭발하듯 동굴을 가득 채웠다. 문지기의 거대한 몸이 빛 속에서 서서히 부서지며 먼지처럼 흩어졌다.' },
    { narr: '쿠르릉— 마지막 진동이 지나가고, 균열이 아물었다. 봉인의 문양이 푸른 수정 위에 선명하게 새겨졌다. 동굴이 고요해졌다.' },
    { hide: 'all' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '…이름이, 사라지지 않았어. 나, 스승님의 이름을… 기억하고 있어. 그리고 너희들의 이름도.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…끝났어. 정말로 끝났어. 다들, 수고했어.' },
    { narr: '동굴 입구에서 환호가 터졌다. 마을 청년단과 사람들이 달려오는 소리. 우리는 서로를 바라보며 웃었다. 지치고 먼지투성이였지만, 모두 살아 있었다.' },
    { time: '새벽' }, { bg: 'inn_dawn' },
    { narr: '동이 트는 새벽. 마을은 무사했다. 은빛 여우관 앞에는 밤새 달려온 사람들이 모여 있다. 여관 간판 위로 첫 햇살이 비친다.' },
    { narr: '이제, 모두가 각자의 마음을 정리할 시간이다.' },
    { goto: 'end_judge' }
  ]
});
