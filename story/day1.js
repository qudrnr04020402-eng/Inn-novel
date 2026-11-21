// ============================================================
//  1일차 — 손님들이 몰려온 날
//  구성: 아침(고정: 등장인물 소개) -> 낮(common.js 의 pick 메뉴 -> 히로인 이벤트 1) -> 저녁(전원) -> 밤
//  히로인 이벤트 "N" 은 그 히로인을 N번째로 골랐을 때 열립니다. (매일 같은 사람을 고르면 일차 = N)
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 아침 =================
  d1_open: [
    { day: 1, time: '아침', tip: '낮에는 한 사람과 시간을 보내고, 저녁에는 모두가 모입니다.\n5일째 밤, 하트 6칸을 가득 채운 가장 가까운 사람이 마음을 전해 와요.' },
    { bg: 'inn_front' },
    { narr: '변두리 마을 라이펜. 그 끝자락, 삐걱거리는 간판 아래에 우리 여관 \'은빛 여우관\'이 있다.' },
    { narr: '아버지에게 물려받아 주인이 된 지 일주일. 손님은 손에 꼽을 정도고, 세금 낼 날은 다가온다.' },
    { bg: 'inn_day' },
    { narr: '장부를 펼쳐 보니 금고에는 {gold} 골드. 이번 달 세금을 낼 수 있을지 아슬아슬하다. 숫자를 노려보다가, 나는 그만 장부 위에 엎드렸다.' },
    { narr: '…얼마나 지났을까. 코끝에 고소한 빵 냄새가 스쳤다.' },
    { goto: 'd1_lia' }
  ],

  // ----- 리아 (소꿉친구) -----
  d1_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '일어났어? 장부 위에서 자는 사람이 어디 있어. 볼에 숫자 자국 났잖아.' },
    { narr: '문을 열고 들어온 건 소꿉친구 리아였다. 마을 신전의 수습 성직자인 그녀는 어릴 적부터 우리 여관을 제집처럼 드나들었다.' },
    { say: 'lia', text: '자, 신전에서 갓 구운 빵. 아침은 먹고 일해야지. …아버님 계실 때처럼 말이야.' },
    { choice: [
      { text: '고마워. 네가 없었으면 벌써 굶었을 거야.', set: { 'aff.lia': 1 }, goto: 'd1_lia_thanks' },
      { text: '볼에 진짜 자국이 있어?', set: { 'aff.lia': 1 }, goto: 'd1_lia_tease' },
      { text: '이거 신전에 바치는 공양 빵 아니야?', set: { 'aff.lia': -1 }, goto: 'd1_lia_offer' }
    ] }
  ],
  d1_lia_thanks: [
    { say: 'lia', face: 'shy', text: '그, 그렇게 정색하고 말하면 부끄럽잖아… 그냥 내가 하고 싶어서 오는 건데.' },
    { say: 'lia', face: 'smile', text: '오늘부터 손님이 더 온다는 소문이야. 나도 틈나는 대로 도울 테니까, 혼자 끙끙대지 마. 알았지?' },
    { goto: 'd1_kaela' }
  ],
  d1_lia_tease: [
    { say: 'lia', face: 'shy', text: '진짜지! 여기, 여기! 3이랑 7 모양으로!' },
    { narr: '리아가 내 볼을 손가락으로 쿡쿡 찔렀다. 가까워서 심장에 안 좋다.' },
    { say: 'lia', face: 'smile', text: '…풋. 거짓말이야. 표정이 너무 진지해서 놀려 봤어.' },
    { goto: 'd1_kaela' }
  ],
  d1_lia_offer: [
    { say: 'lia', face: 'angry', text: '공양 빵은 따로 있거든! 이건 내 몫에서 떼어 온 거란 말이야. 안 먹을 거면 줘!' },
    { narr: '리아가 빵을 도로 가져가려 했다. 나는 서둘러 입에 쑤셔 넣었다. 맛있다. 미안하다.' },
    { goto: 'd1_kaela' }
  ],

  // ----- 카엘라 (여기사) -----
  d1_kaela: [
    { hide: 'lia' },
    { narr: '그때, 문이 쾅 하고 열렸다. …정확히는 열리다 말고 누군가의 이마에 걸려서 멈췄다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '하하하! 이 마을에서 가장 훌륭한 여관이 여기라고 들었다! 아, 두 번째일 수도 있겠군. 첫 번째는 당연히 내가 묵는 곳이니까!' },
    { narr: '문틀에 이마를 부딪히고도 웃는 붉은 머리의 여자. 등에는 대검, 몸에는 번쩍번쩍한 갑옷. 너무 새것처럼 번쩍인다.' },
    { say: 'kaela', face: 'normal', text: '나는 붉은 사자 카엘라! 오우거 세 마리를 혼자 베었고, 드래곤과 눈이 마주친 적도 있는 몸이다. 이름을 기억해 두도록, 여관 주인!' },
    { narr: '…갑옷 옆구리에 가격표가 달랑거린다. 「24개월 할부 가능」이라고 쓰여 있다.' },
    { choice: [
      { text: '대단하세요! 영광입니다, 카엘라 님.', set: { 'aff.kaela': 1 }, goto: 'd1_kaela_praise' },
      { text: '…갑옷에 가격표가 달려 있는데요?', set: { 'aff.kaela': -1 }, goto: 'd1_kaela_tag' },
      { text: '(모른 척 다가가 슬쩍 가격표를 떼어 준다)', set: { 'aff.kaela': 2 }, goto: 'd1_kaela_hide' }
    ] }
  ],
  d1_kaela_praise: [
    { say: 'kaela', face: 'smile', text: '오오, 보는 눈이 있군! 마음에 들었다! 이 마을 여관 주인치고는 말이야!' },
    { narr: '칭찬이 칭찬 같지 않지만, 기분 좋은 건 기분 좋은 거니까.' },
    { goto: 'd1_kaela_room' }
  ],
  d1_kaela_tag: [
    { say: 'kaela', face: 'surprised', text: '이, 이건 신품 보증 표시다! 전투가 끝나면 매번 닦아서 새것 같은 것뿐이고!' },
    { say: 'kaela', face: 'angry', text: '…더 보면 베겠다.' },
    { narr: '진심이 아닌 건 알겠는데, 귀까지 새빨개져서 대검 손잡이를 잡는 바람에 조금 무서웠다.' },
    { goto: 'd1_kaela_room' }
  ],
  d1_kaela_hide: [
    { say: 'kaela', face: 'surprised', text: '…!' },
    { say: 'kaela', face: 'shy', text: '고, 고맙다. 본 건… 아니, 못 본 걸로 해 주면 더 고맙겠다. 이건 전투 중에 찢어진 거다. 그렇지?' },
    { narr: '작은 목소리로 속삭이는 모습이 의외로 귀여웠다.' },
    { goto: 'd1_kaela_room' }
  ],
  d1_kaela_room: [
    { say: 'kaela', face: 'normal', text: '그런데 여관 주인. 영웅에게는 \'영웅 할인\'이라는 게 있다고 들었다. 숙박비는 반값이겠지?' },
    { choice: [
      { text: '물론이죠. 영웅이 묵는 여관이라고 소문나면 저희도 영광이니까요.', set: { 'aff.kaela': 1, gold: -10, rep: 1 }, goto: 'd1_kaela_deal_yes' },
      { text: '죄송하지만 영웅 할인은 저희 여관에 없어요. 하룻밤 20골드, 선불입니다.', set: { gold: 20 }, goto: 'd1_kaela_deal_no' }
    ] }
  ],
  d1_kaela_deal_yes: [
    { say: 'kaela', face: 'smile', text: '하하! 역시 말이 통하는군! 소문을 내 주지. 은빛 여우관은 사자의 쉼터라고!' },
    { hide: 'kaela' },
    { narr: '카엘라는 쿵쾅쿵쾅 계단을 올라갔다. …올라가다 한 번 넘어지는 소리가 났다.' },
    { goto: 'd1_erion' }
  ],
  d1_kaela_deal_no: [
    { say: 'kaela', face: 'sad', text: '으, 으음. 선불… 좋다! 영웅은 이런 사소한 일에 연연하지 않는 법이지!' },
    { narr: '손가락으로 지갑 속을 슬쩍 확인하는 모습이 보였다. 꽤 가벼워 보인다. 그래도 금화 20닢은 쨍그랑 소리를 내며 카운터에 놓였다.' },
    { hide: 'kaela' },
    { goto: 'd1_erion' }
  ],

  // ----- 에리온 (엘프 마법사) -----
  d1_erion: [
    { narr: '카엘라가 방으로 올라가고 얼마 지나지 않아, 문 위의 종이 조용히 울렸다.' },
    { narr: '기척이 없었다. 어느새 후드를 깊이 눌러쓴 사람이 카운터 앞에 서 있다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', as: '???', text: '방 하나. 동쪽 창이 있는 방으로.' },
    { narr: '후드 아래로 은빛 머리카락과 뾰족한 귀 끝이 보였다. 엘프다. 이 마을에서 엘프를 보는 건 처음이다.' },
    { say: 'erion', text: '며칠 묵을 거야. 선불로 낸다. 거스름돈은 필요 없어.' },
    { narr: '카운터에 놓인 건 아주 오래된 은화 세 닢. 오래돼서 오히려 값이 더 나갈 것 같다.' },
    { choice: [
      { text: '동쪽 방이면 뒷산 동굴 쪽이 보이는 방이에요. 괜찮으시겠어요?', set: { 'aff.erion': 1 }, goto: 'd1_erion_cave' },
      { text: '환영합니다. 따뜻한 차를 방에 올려 드릴까요?', set: { 'aff.erion': 1 }, goto: 'd1_erion_tea' },
      { text: '이 은화, 꽤 오래된 건데 어디서 나셨어요?', set: { 'aff.erion': -1 }, goto: 'd1_erion_coin' }
    ] }
  ],
  d1_erion_cave: [
    { say: 'erion', face: 'surprised', text: '…!' },
    { say: 'erion', face: 'normal', text: '…그래서 고른 거야. 눈치가 없는 줄 알았더니, 아니네.' },
    { goto: 'd1_erion_end' }
  ],
  d1_erion_tea: [
    { say: 'erion', face: 'normal', text: '…마음대로 해. 단, 달지 않은 걸로.' },
    { narr: '후드 끝이 아주 조금 움직였다. 고개를 끄덕인 것 같기도 하다.' },
    { goto: 'd1_erion_end' }
  ],
  d1_erion_coin: [
    { say: 'erion', face: 'angry', text: '묻지 마. 받을 건지 말 건지만 말해.' },
    { narr: '한기가 돌 만큼 싸늘한 시선이었다. 은화는 일단 받아 두기로 했다.' },
    { goto: 'd1_erion_end' }
  ],
  d1_erion_end: [
    { say: 'erion', face: 'normal', text: '방해하지 마. 내가 부탁하는 건 그것뿐이야.' },
    { hide: 'erion' },
    { narr: '조용히 계단을 오르는 발소리. 그리고 그녀가 지나간 자리에서 희미하게 푸른 빛이 번졌다 사라졌다.' },
    { goto: 'd1_miho' }
  ],

  // ----- 미호 (여우 수인 도적) -----
  d1_miho: [
    { narr: '모두 방에 올라간 사이, 카운터 쪽에서 쨍그랑 소리가 났다. 팁 항아리 앞에서 폭신한 꼬리 하나가 살랑이고 있다.' },
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '우앗! …아, 아니, 이건 그, 정리 정돈! 항아리 균형이 안 맞아 보여서 말이죠, 사장님!' },
    { narr: '금빛 머리카락 사이로 쫑긋 선 여우 귀. 항아리를 안은 두 손은 어느새 동전 몇 닢을 소매 속으로 옮기는 중이다.' },
    { say: 'miho', face: 'smile', text: '헤헤… 수인 도적 미호라고 합니다. 직업 정보는 가볍게 넘어가 주시면 감사하겠는데요오.' },
    { choice: [
      { text: '소매 속의 동전, 돌려주세요.', set: { rep: 1, gold: 3 }, goto: 'd1_miho_return' },
      { text: '못 본 걸로 해 줄 테니, 오늘 일 좀 거들어 줘요.', set: { 'aff.miho': 2 }, goto: 'd1_miho_job' },
      { text: '도둑이야! 하고 소리를 지른다.', set: { 'aff.miho': -1 }, goto: 'd1_miho_shout' }
    ] }
  ],
  d1_miho_return: [
    { say: 'miho', face: 'angry', text: '쳇, 눈썰미 좋네요. 여우를 속이려면 수련이 더 필요하다니까.' },
    { narr: '미호는 투덜대면서도 소매 속 동전을 순순히 쏟아냈다. …세어 보니 한 닢 모자란다. 그걸 짚자 입을 삐죽이며 마저 내놓았다.' },
    { goto: 'd1_miho_end' }
  ],
  d1_miho_job: [
    { say: 'miho', face: 'surprised', text: '어? 안 혼내요? 보통은 막 소리 지르고, 경비대 부르고, 꼬리 밟고 그러는데…' },
    { say: 'miho', face: 'smile', text: '…좋아요, 사장님. 일 거들면 숙박비 깎아 주는 거죠? 그럼 계약 성립! 도둑질은 당분간 휴업이에요.' },
    { narr: '웃는 얼굴이 장난스러운데, 아주 잠깐 눈빛이 놀란 아이 같았다.' },
    { goto: 'd1_miho_end' }
  ],
  d1_miho_shout: [
    { say: 'miho', face: 'surprised', text: '잠깐, 잠깐만요! 너무하잖아요 사장님! 아직 안 훔쳤…는데 이미 훔친 거나 다름없긴 하지만!' },
    { narr: '위층에서 우당탕 소리가 났다. 카엘라가 대검을 들고 계단을 구르듯 내려왔다가 마지막 계단에서 미끄러졌다.' },
    { say: 'miho', face: 'angry', text: '…이 여관, 분위기 이상해요.' },
    { goto: 'd1_miho_end' }
  ],
  d1_miho_end: [
    { hide: 'all' },
    { narr: '그렇게 은빛 여우관은 일주일 만에 가득 찼다. 손님 셋, 그리고 소꿉친구 하나.' },
    { narr: '평범한 하루가 아닐 것 같은 예감이 든다.' },
    { goto: 'd1_pick' }
  ],

  // ================= 낮 =================
  d1_pick: [
    { time: '낮' }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '점심시간이 지나고 여관이 한가해졌다. 오늘 오후는 누구와 시간을 보낼까?' },
    { goto: 'pick' }
  ],

  // ----- 에리온 1: 푸른 책 -----
  erion_1: [
    { set: { 'ev.erion': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당 구석 벤치. 에리온이 푸른 표지의 책을 무릎에 펼쳐 둔 채 먼 산을 보고 있었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…뭐야. 용건 없으면 가.' },
    { narr: '말은 차갑지만 쫓아내지는 않는다. 쟁반 위의 찻잔에서는 김이 모락모락 올라온다.' },
    { choice: [
      { text: '차를 건넨다. "독 안 탔어요."', set: { 'aff.erion': 1 }, goto: 'erion_1_tea' },
      { text: '(조용히 옆에 앉아 책 읽는 모습을 지켜본다)', set: { 'aff.erion': 2 }, goto: 'erion_1_sit' },
      { text: '"그 책, 뭐가 적혀 있어요?"', set: { 'aff.erion': -1, 'flag.asked_book': true }, goto: 'erion_1_book' },
      { text: '숲 향이 나는 고급 찻잎으로 새로 우려 낸다', cost: 8, set: { 'aff.erion': 2 }, goto: 'erion_1_leaf' }
    ] }
  ],
  erion_1_tea: [
    { say: 'erion', face: 'normal', text: '…독이 들었다면 네 손부터 떨렸겠지. 두고 가.' },
    { narr: '찻잔을 건네받는 손끝이 아주 잠깐 닿았다. 에리온은 재빨리 고개를 돌렸다.' },
    { say: 'erion', face: 'shy', text: '…따뜻하네. 그뿐이야. 딱히 고마워서 마시는 건 아니니까.' },
    { goto: 'after_pick' }
  ],
  erion_1_sit: [
    { narr: '아무 말 없이 곁에 앉았다. 바람이 불고, 나뭇잎이 책 위로 한 장 내려앉았다. 에리온은 그것을 치우지 않았다.' },
    { say: 'erion', face: 'normal', text: '…앉아 있는 건 허락하지. 떠들지만 않는다면.' },
    { narr: '한 시간쯤 지났을까. 책장 넘기는 소리와 숨소리만이 오갔다. 그런데 이상하게 불편하지 않았다.' },
    { say: 'erion', face: 'shy', text: '…이상한 사람이네, 너. 보통은 뭐라도 묻는데.' },
    { goto: 'after_pick' }
  ],
  erion_1_book: [
    { say: 'erion', face: 'angry', text: '그건 건드리지 마.' },
    { narr: '책 표지의 문양이 번쩍 하고 푸르게 빛났다. 에리온은 황급히 책을 덮어 가슴에 끌어안았다.' },
    { say: 'erion', face: 'normal', text: '…미안. 아무것도 아냐. 하지만 다시 묻지는 마.' },
    { goto: 'after_pick' }
  ],
  erion_1_leaf: [
    { say: 'erion', face: 'surprised', text: '이 향… 엘더 숲 찻잎이잖아. 어디서 구했어? 이런 변두리에서?' },
    { narr: '비싼 값을 치른 보람이 있었다. 에리온의 눈이 아이처럼 반짝였다.' },
    { say: 'erion', face: 'shy', text: '…고맙다는 말은 안 할 거야. 하지만 마시겠어. 한 방울도 남기지 않고.' },
    { goto: 'after_pick' }
  ],

  // ----- 카엘라 1: 빨랫줄 -----
  kaela_1: [
    { set: { 'ev.kaela': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당에서 쉬익, 쉬익 하는 소리가 들린다. 카엘라가 대검을 신나게 휘두르는 중이다. 빨랫줄이 아슬아슬하다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '하하! 주인장, 마침 잘 왔다! 내 필살 검술 \'붉은 사자의 포효\'를 보여 주지!' },
    { narr: '카엘라가 검을 높이 치켜든 순간, 칼끝에 빨랫줄이 걸렸다. 널려 있던 시트가 우수수 그녀를 덮쳤다.' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '으앗! 앞이 안 보인다! 적의 기습인가!' },
    { choice: [
      { text: '재빨리 시트를 벗겨 주며 일으켜 세운다', set: { 'aff.kaela': 1 }, goto: 'kaela_1_help' },
      { text: '"…방금 그게 포효예요?" 하며 웃음을 참지 못한다', set: { 'aff.kaela': -1 }, goto: 'kaela_1_laugh' },
      { text: '"자세만 조금 고치면 훨씬 멋질 거예요." 하고 손을 잡아 준다', set: { 'aff.kaela': 2 }, goto: 'kaela_1_form' },
      { text: '연습용 목검을 선물한다 (빨랫줄이 안전해진다)', cost: 10, set: { 'aff.kaela': 2, rep: 0 }, goto: 'kaela_1_gift' }
    ] }
  ],
  kaela_1_help: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '고맙다, 주인장! 적의 기습을 이겨 냈군. 역시 나는 강하다!' },
    { narr: '시트를 뒤집어쓴 건 본인인데. 그래도 즐거워 보여서 뭐라 하지 않기로 했다.' },
    { goto: 'after_pick' }
  ],
  kaela_1_laugh: [
    { show: 'kaela', face: 'angry' },
    { say: 'kaela', text: '웃지 마라! 방금 건 연습이었다! 실전에서는 훨씬… 훨씬 더 대단하다!' },
    { narr: '카엘라가 볼을 부풀리며 토라졌다. 시트 빨래는 결국 내가 다시 하게 생겼다.' },
    { goto: 'after_pick' }
  ],
  kaela_1_form: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '…자세? 내 자세가 이상했나?' },
    { narr: '팔꿈치 각도와 발 위치를 살짝 바로잡아 주자 칼날이 휙 하고 시원한 소리를 냈다. 카엘라의 눈이 휘둥그레졌다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '…주인장, 의외로 보는 눈이 있군. 처음이다. 나한테 그렇게 정확히 말해 준 사람은.' },
    { goto: 'after_pick' }
  ],
  kaela_1_gift: [
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '이, 이건… 연습용 목검! 나를 위해서 사 온 건가!?' },
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '좋다! 이 검으로 마당을 지키는 임무를 맡기겠다. …빨랫줄은 건드리지 않도록 노력하지!' },
    { goto: 'after_pick' }
  ],

  // ----- 미호 1: 거래 -----
  miho_1: [
    { set: { 'ev.miho': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '미호가 카운터에 턱을 괴고 나를 올려다본다. 눈이 반달 모양이다. 위험하다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님~ 비밀 정보 하나 사실래요? 오늘의 특가예요! 마을 소문 한 건에 딱 5골드!' },
    { choice: [
      { text: '5골드를 내고 정보를 산다', cost: 5, set: { 'aff.miho': 1, 'flag.miho_tip': true }, goto: 'miho_1_buy' },
      { text: '"3골드로 깎아 줘요."', set: { 'aff.miho': 1 }, goto: 'miho_1_haggle' },
      { text: '"정보 말고 팁 항아리 앞에서 떨어져 줘요."', set: { 'aff.miho': -1 }, goto: 'miho_1_shoo' },
      { text: '"그 정보, 내가 사면 얼마 벌어요?" 하고 되묻는다', set: { 'aff.miho': 2 }, goto: 'miho_1_ask' }
    ] }
  ],
  miho_1_buy: [
    { say: 'miho', face: 'smile', text: '감사합니다~ 사장님은 역시 큰손! 자, 귀 좀 대 봐요. 요즘 뒷산 동굴 근처에서 밤마다 푸르스름한 빛이 보인대요.' },
    { say: 'miho', face: 'normal', text: '그리고 양치기 영감님네 양이 세 마리 사라졌고요. 이 정보값, 사실 7골드짜리인데 오늘만 5골드. 이득이죠?' },
    { narr: '진짜 정보인지는 모르겠지만, 아까 에리온이 동굴 쪽을 보던 모습이 떠올라 마음에 걸렸다.' },
    { goto: 'after_pick' }
  ],
  miho_1_haggle: [
    { say: 'miho', face: 'surprised', text: '3골드? 그건 원가 이하라고요, 사장님! …4골드. 더는 못 깎아요.' },
    { say: 'miho', face: 'smile', text: '아, 안 사시는구나. 그럼 무료 정보 하나만. 여기 팁 항아리, 벌써 반은 제가… 아니, 농담이에요, 농담!' },
    { narr: '흥정하는 동안 미호의 꼬리가 신나게 살랑거렸다. 돈 얘기를 할 때 제일 즐거워 보인다.' },
    { goto: 'after_pick' }
  ],
  miho_1_shoo: [
    { say: 'miho', face: 'angry', text: '치사해요. 저를 도둑 취급하다니… 사실이긴 하지만요!' },
    { narr: '미호는 꼬리를 홱 돌리고 사라졌다. 그런데 몇 걸음 못 가 다시 돌아보며 혀를 쏙 내밀었다.' },
    { goto: 'after_pick' }
  ],
  miho_1_ask: [
    { say: 'miho', face: 'surprised', text: '어…?' },
    { say: 'miho', face: 'smile', text: '아하하, 사장님 지금 저한테 사업 아이템을 물어보는 거예요? 대박이다, 이런 사람 처음이야!' },
    { narr: '미호가 신나서 귀를 팔랑거렸다. 한참 마을 시세와 소문의 값어치에 대해 열변을 토했다. 의외로 꽤 쓸모 있는 얘기였다.' },
    { say: 'miho', face: 'shy', text: '…으, 이런 얘기를 진지하게 들어 준 건 처음이라 좀… 간지럽네요. 헤헤.' },
    { goto: 'after_pick' }
  ],

  // ----- 리아 1: 복도 청소 -----
  lia_1: [
    { set: { 'ev.lia': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '복도에서 리아가 콧노래를 부르며 걸레질을 하고 있다. 어릴 때 자주 부르던 신전 동요다.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '어, 왔어? 마침 잘됐다. 이 구석 좀 같이 닦자. 어릴 때 여기서 숨바꼭질하다가 네가 항아리에 끼었던 거 기억나?' },
    { choice: [
      { text: '"그 얘기는 하지 마… 아직 흉터가 있다고."', set: { 'aff.lia': 1 }, goto: 'lia_1_memory' },
      { text: '"그때 약속한 거 기억나?" 하고 슬쩍 떠본다', set: { 'aff.lia': 2, 'flag.promise': true }, goto: 'lia_1_promise' },
      { text: '"청소는 내가 할게. 너는 쉬어."', set: { 'aff.lia': 1 }, goto: 'lia_1_rest' },
      { text: '말없이 걸레를 받아 같이 닦는다', set: { 'aff.lia': 1, rep: 1 }, goto: 'lia_1_clean' }
    ] }
  ],
  lia_1_memory: [
    { say: 'lia', face: 'smile', text: '푸하하! 맞아, 그때 내가 얼마나 울었는지 몰라. 네가 안 나올까 봐. 결국 아버님이 기름을 발라서 빼 주셨잖아.' },
    { say: 'lia', face: 'normal', text: '…그때도 지금도, 이 여관은 따뜻하다. 이상하게 돌아오면 안심이 돼.' },
    { goto: 'after_pick' }
  ],
  lia_1_promise: [
    { say: 'lia', face: 'surprised', text: '약속…? 아, 그, 그거?' },
    { say: 'lia', face: 'shy', text: '"여관이 망하지 않게 내가 평생 도와줄게" 그거 말하는 거지? 어, 어릴 때 한 말을 아직도 기억해?' },
    { say: 'lia', face: 'smile', text: '…잊을 리 없잖아. 그, 그러니까, 약속은 지킬 거야. 신전 일이 끝나는 대로… 쭉.' },
    { goto: 'after_pick' }
  ],
  lia_1_rest: [
    { say: 'lia', face: 'normal', text: '괜찮아, 나 이런 거 좋아해. 몸을 움직여야 마음이 개운하거든.' },
    { say: 'lia', face: 'smile', text: '그래도 걱정해 줘서 고마워. 넌 어릴 때부터 그렇게 말이 먼저 다정했어.' },
    { goto: 'after_pick' }
  ],
  lia_1_clean: [
    { narr: '둘이 말없이 걸레질을 했다. 바닥에 나란히 비친 그림자가 어릴 때와 똑같이 키 차이가 나서 웃음이 났다.' },
    { say: 'lia', face: 'smile', text: '…이렇게 하니까 금방 끝났다. 역시 둘이 하면 빨라.' },
    { narr: '복도가 반짝반짝해졌다. 지나가던 손님이 \'깨끗하네\'라고 중얼거렸다.' },
    { goto: 'after_pick' }
  ],

  // ================= 저녁: 첫 만찬 =================
  d1_evening: [
    { time: '저녁' }, { bg: 'inn_evening' }, { hide: 'all' },
    { narr: '해가 기울자 식당에 불이 들어왔다. 오늘은 우리 여관이 이렇게 북적이는 첫날이다.' },
    { show: 'kaela', face: 'smile', pos: 'left' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { show: 'miho', face: 'smile', pos: 'right' },
    { say: 'kaela', text: '주인장! 영웅의 첫 만찬이다! 고기를 산처럼 쌓아 와라!' },
    { say: 'miho', text: '사장님, 저는 제일 비싼 거요! 어차피 내일 공짜로 먹을 거지만요!' },
    { say: 'erion', text: '…시끄럽네.' },
    { narr: '부엌 문이 열리고 리아가 쟁반을 든 채 들어왔다. 앞치마 차림이 꽤 익숙해 보인다.' },
    { hide: 'miho' },
    { show: 'lia', face: 'smile', pos: 'right' },
    { say: 'lia', text: '자, 저녁 메뉴를 정해 줘. 오늘은 사장님이 쏘는 거야, 맞지?' },
    { choice: [
      { text: '든든한 고기 스튜 (12G)', cost: 12, set: { 'aff.kaela': 1, 'aff.miho': 1, rep: 1 }, goto: 'd1_ev_stew' },
      { text: '허브 샐러드와 따뜻한 차 (12G)', cost: 12, set: { 'aff.erion': 1, 'aff.lia': 1, rep: 1 }, goto: 'd1_ev_salad' },
      { text: '빵과 수프 (무료)', goto: 'd1_ev_plain' }
    ] }
  ],
  d1_ev_stew: [
    { say: 'kaela', face: 'smile', text: '이 맛이다! 영웅의 몸은 고기로 만들어지는 법이지!' },
    { say: 'miho', text: '우와, 진짜 고기가 들었어! 이런 여관은 처음이야. 사장님 부자예요? 아니군요. 그래도 맛있어요!' },
    { goto: 'd1_ev_quake' }
  ],
  d1_ev_salad: [
    { say: 'erion', face: 'surprised', text: '…이 허브, 엘프 쪽 품종이잖아. 어떻게…' },
    { say: 'lia', face: 'smile', text: '신전 텃밭에서 키운 거야. 내가 사장님한테 몰래 알려 줬어. 너 향 진한 거 싫어한다고 했잖아.' },
    { narr: '리아가 눈을 찡긋했다. 에리온이 슬쩍 시선을 피하며 샐러드를 한 입 먹었다. 포크가 멈추지 않는다.' },
    { goto: 'd1_ev_quake' }
  ],
  d1_ev_plain: [
    { say: 'kaela', face: 'sad', text: '빵과… 수프… 영웅의 만찬치고는 소박하군.' },
    { say: 'miho', text: '사장님, 세금 걱정이 그렇게 심해요? 제가 좀 도와 드릴 수도 있는데… 수수료 7할에.' },
    { narr: '분위기가 조금 가라앉았다. 다음에는 신경 써서 차려야겠다.' },
    { goto: 'd1_ev_quake' }
  ],
  d1_ev_quake: [
    { narr: '그때였다. 식탁 위의 컵이 달그락달그락 떨리기 시작했다.' },
    { fx: 'shake' },
    { narr: '쿠르르릉— 낮고 깊은 울림이 발밑에서부터 올라왔다. 천장에서 먼지가 떨어지고, 등불이 흔들렸다.' },
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…벌써?' },
    { show: 'kaela', face: 'surprised' },
    { say: 'kaela', text: '지진인가! 걱정 마라, 모두 이 몸에게 맡겨라! …일단 식탁 밑으로!' },
    { say: 'miho', text: '사장님, 벽 갈라지면 수리비 누가 내요? 저 아니에요!' },
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '다, 다들 진정해! 일단 불부터…!' },
    { narr: '울림은 십 초쯤 이어지다가 거짓말처럼 멎었다. 창밖, 먼 뒷산 쪽 하늘에 푸른 빛이 희미하게 번졌다가 사라졌다.' },
    { say: 'erion', face: 'normal', text: '…시간이 없네.' },
    { narr: '에리온이 중얼거리는 소리를 나는 분명히 들었다. 모두의 시선이 일제히 내게 모였다. 이럴 땐 주인이 나서야 한다.' },
    { choice: [
      { text: '"모두 진정하세요. 우선 불부터 끄고 다친 사람이 없는지 확인해요."', set: { rep: 1, 'aff.lia': 1 }, goto: 'd1_ev_calm' },
      { text: '"에리온, 뭔가 알고 있는 거죠?"', set: { 'aff.erion': 1, 'flag.asked_erion': true }, goto: 'd1_ev_ask' },
      { text: '"카엘라, 문 앞을 좀 지켜봐 줄래요? 당신이 제일 든든하니까."', set: { 'aff.kaela': 1 }, goto: 'd1_ev_guard' },
      { text: '"미호, 금고부터 지켜 줘요. 도둑이 제일 눈이 밝으니까."', set: { 'aff.miho': 1, rep: -1 }, goto: 'd1_ev_safe' }
    ] }
  ],
  d1_ev_calm: [
    { say: 'lia', face: 'smile', text: '…역시 주인답네. 나, 그 말에 안심했어.' },
    { narr: '다행히 다친 사람은 없었다. 손님들의 불안한 표정이 조금 풀렸다.' },
    { goto: 'd1_ev_end' }
  ],
  d1_ev_ask: [
    { say: 'erion', face: 'angry', text: '…내일 얘기해. 오늘은 아무것도 말하지 않을 거야.' },
    { say: 'erion', face: 'normal', text: '하지만 눈치는 있네. 그건 인정해.' },
    { goto: 'd1_ev_end' }
  ],
  d1_ev_guard: [
    { say: 'kaela', face: 'smile', text: '하하! 역시 보는 눈이 있군! 이 몸이 문 앞을 지키는 이상 그림자 하나 못 들어온다!' },
    { narr: '카엘라가 의기양양하게 문 앞으로 갔다가 문턱에 걸려 넘어졌다. …그래도 믿음직한 마음만은 확실했다.' },
    { goto: 'd1_ev_end' }
  ],
  d1_ev_safe: [
    { say: 'miho', text: '맡겨 주세요! 금고는 목숨을 걸고 지키겠습니다. 열쇠는… 어, 사장님 허리춤에 있었네?' },
    { narr: '손님을 도둑 취급했다는 소문이 조금 돌 것 같다. 미호만 신나게 웃고 있다.' },
    { goto: 'd1_ev_end' }
  ],
  d1_ev_end: [
    { hide: 'all' },
    { narr: '그날 저녁 식사는 어수선하게 끝났다. 모두 방으로 돌아간 뒤에도 여관은 오랫동안 웅성거렸다.' },
    { goto: 'd1_night' }
  ],

  // ================= 밤 =================
  d1_night: [
    { time: '밤' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '손님들이 모두 잠든 밤. 금고를 정리하고 불을 끄러 나서는데, 위층에서 희미한 소리가 들렸다.' },
    { narr: '동쪽 창가에서, 에리온이 가만히 뒷산을 바라보고 있었다. 그 손에서 푸른 책이 빛나고 있었다.' },
    { narr: '나는 조용히 발길을 돌렸다. 오늘은 더 묻지 않기로 했다. 내일부터, 이 여관에서 무슨 일이 시작될 것 같다.' },
    { goto: 'd2_open' }
  ]
});
