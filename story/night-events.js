// ============================================================
//  밤 사건 장면 — 숙박 접수가 끝난 뒤 25% 확률로 하룻밤 최대 1개 (확률/풀은 story/lodging.js 의 nightEvents)
//  - 씬 이름은 nev_<id>. 마지막은 {nightret:true} (밤 업그레이드 화면으로 복귀).
//  - 선택지는 1개, 효과는 소폭: 골드 ±15 이하, 평판 ±2 이하, 호감도는 0~2 증가만. (check-story.js 가 검사)
//  - 'lodge.note' 에 한 줄을 적으면 다음 날 아침 카드의 정산 문구에 실립니다.
// ============================================================
Object.assign(STORY.scenes, {

  // ---------- 한밤의 도둑 (미호의 호감도가 높으면 미호가 해결) ----------
  nev_thief: [
    { bgm: 'tension' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '한밤중, 아래층에서 쨍그랑 하는 소리에 잠이 깼다. 계단을 내려가자 금고 앞에서 검은 그림자가 허둥대고 있다.' },
    { if: 'aff.miho>=' + HEART(3), goto: 'nev_thief_miho' },
    { narr: '손에 든 촛불이 흔들린다. 도둑이 이쪽을 홱 돌아본다. 생각보다 어려 보이는 얼굴이다.' },
    { choice: [
      { text: '"거기 서!" 쫓아가서 붙잡는다', set: { gold: -5, rep: 1, 'lodge.note': '한밤의 도둑을 붙잡았다. 선반이 조금 깨졌지만 소문은 좋게 났다.' }, goto: 'nev_thief_catch' },
      { text: '"배고파서 그랬죠?" 빵을 쥐여 보낸다', set: { gold: -2, rep: 1, 'lodge.note': '배고픈 도둑에게 빵을 쥐여 보냈다. 아침에 문 앞에 들꽃 한 송이가 놓여 있었다.' }, goto: 'nev_thief_bread' },
      { text: '금고를 잠그고 못 본 척 문을 닫는다', set: { gold: -8, 'lodge.note': '도둑이 금고 속 잔돈을 조금 가져갔다.' }, goto: 'nev_thief_ignore' }
    ] }
  ],
  nev_thief_catch: [
    { narr: '촛불을 집어던질 뻔한 걸 겨우 참고 달려들었다. 선반이 와르르 무너졌지만, 도둑은 소매를 붙잡힌 채 주저앉았다.' },
    { narr: '순찰 중이던 청년단이 소란을 듣고 달려와 도둑을 데려갔다. "역시 은빛 여우관 주인이십니다!" 소문은 내일이면 마을에 돌 것이다.' },
    { goto: 'nev_end' }
  ],
  nev_thief_bread: [
    { narr: '도둑의 배에서 꼬르륵 소리가 났다. 빵을 건네자 그림자는 한참 망설이다가 허겁지겁 먹기 시작했다.' },
    { narr: '"…죄송해요." 작은 목소리를 남기고 도둑은 어둠 속으로 사라졌다. 금고는 무사했다.' },
    { goto: 'nev_end' }
  ],
  nev_thief_ignore: [
    { narr: '문을 닫고 방에 돌아와 이불을 뒤집어썼다. 아침에 금고를 열어 보니 잔돈이 조금 비어 있었다.' },
    { goto: 'nev_end' }
  ],
  nev_thief_miho: [
    { narr: '그림자의 손목에 어느새 가느다란 줄이 감겨 있다. 계단 위에서 낯익은 목소리가 들렸다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 이 구역은 제 나와바리예요. 도둑이 도둑을 못 알아볼 줄 알았어요?' },
    { narr: '미호가 능청스럽게 밧줄을 당기자 도둑이 맥없이 끌려왔다. 솜씨가 정말 깔끔하다.' },
    { say: 'miho', face: 'normal', text: '어떻게 할까요? 순찰대에 넘기면 현상금이 나와요. 아, 제가 8할… 아니, 농담이에요. 결정은 사장님이 해요.' },
    { choice: [
      { who: 'miho', text: '"순찰대에 넘겨요. 현상금은 미호 몫도 있어요."', set: { gold: 8, 'aff.miho': 1, 'lodge.note': '미호가 도둑을 붙잡았다. 현상금 8G!' }, goto: 'nev_thief_miho_hand' },
      { who: 'miho', text: '"사정이 있어 보여요. 이번엔 풀어 줘요."', set: { rep: 1, 'aff.miho': 2, 'lodge.note': '미호가 도둑을 붙잡았지만 이번엔 풀어 주었다. 미호는 말없이 웃었다.' }, goto: 'nev_thief_miho_free' }
    ] }
  ],
  nev_thief_miho_hand: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '역시 사장님! 현상금 반은 제 거예요… 라고 하면 화내실 거죠? 헤헤, 오늘은 사장님 다 가지세요!' },
    { goto: 'nev_end' }
  ],
  nev_thief_miho_free: [
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…풀어 주자고요? 저도 한때는 배고파서 훔쳤거든요. 사장님, 그런 것도 알아보시는 거예요?' },
    { narr: '미호는 도둑에게 동전 두 닢을 쥐여 주고 문을 열어 주었다. 쑥스러운 듯 꼬리가 천천히 흔들렸다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 악몽 꾸는 아이 ----------
  nev_nightmare: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '새벽녘, 복도 끝에서 훌쩍이는 소리가 들렸다. 투숙객의 어린아이가 베개를 끌어안고 복도에 서서 울고 있다.' },
    { narr: '"무서운 꿈을 꿨어요… 어두운 게 쫓아왔어요…" 아이의 눈에 눈물이 가득하다.' },
    { choice: [
      { text: '곁에 앉아 옛날이야기를 들려준다', set: { rep: 1, 'lodge.note': '악몽을 꾼 아이에게 옛날이야기를 들려주었다. 부모가 아침에 고마워했다.' }, goto: 'nev_nightmare_story' },
      { text: '따뜻한 우유를 데워 준다', set: { gold: -2, rep: 1, 'lodge.note': '악몽을 꾼 아이에게 따뜻한 우유를 데워 주었다.' }, goto: 'nev_nightmare_milk' },
      { who: 'lia', text: '리아를 불러 함께 달랜다', if: 'aff.lia>=' + HEART(2), set: { rep: 1, 'aff.lia': 1, 'lodge.note': '리아와 함께 악몽 꾸는 아이를 달랬다. 리아의 자장가가 근사했다.' }, goto: 'nev_nightmare_lia' },
      { text: '부모의 방까지 조용히 데려다준다', set: { 'lodge.note': '울던 아이를 부모의 방까지 데려다주었다.' }, goto: 'nev_nightmare_home' }
    ] }
  ],
  nev_nightmare_story: [
    { narr: '이불을 어깨에 둘러 주고, 옛날에 아버지가 들려주던 여우 이야기를 아는 대로 지어 들려주었다. 아이는 이야기가 끝나기 전에 쌔근쌔근 잠들었다.' },
    { goto: 'nev_end' }
  ],
  nev_nightmare_milk: [
    { narr: '부엌에서 우유를 데워 꿀을 한 방울 떨어뜨렸다. 아이는 두 손으로 컵을 감싸 쥐고 홀짝이더니 어느새 웃고 있었다.' },
    { goto: 'nev_end' }
  ],
  nev_nightmare_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '쉿, 괜찮아. 신께서 네 곁에 계셔. 그리고 이 오빠… 아니, 이 여관 주인님도 계시잖아.' },
    { narr: '리아가 낮은 목소리로 자장가를 불렀다. 아이가 잠들자 리아는 쑥스러운 듯 웃으며 속삭였다. "…이런 모습, 보여 줘서 조금 부끄럽네."' },
    { goto: 'nev_end' }
  ],
  nev_nightmare_home: [
    { narr: '아이의 손을 잡고 방문 앞까지 데려다주었다. 문이 열리고 졸린 눈의 어머니가 아이를 안아 들였다. 고개를 꾸벅 숙이는 모습이 문틈으로 사라졌다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 몰래 들어온 고양이 ----------
  nev_cat: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '목이 말라 부엌에 내려갔더니, 우유 병 옆에 얼룩무늬 고양이가 점잖게 앉아 있다. 병뚜껑은 이미 열려 있다.' },
    { narr: '고양이가 이쪽을 보더니 "냥" 하고 짧게 울었다. 도망갈 생각은 전혀 없어 보인다.' },
    { choice: [
      { text: '접시에 우유를 따라 준다', set: { gold: -2, rep: 1, 'lodge.note': '몰래 들어온 고양이에게 우유를 나눠 주었다. 아침에 손님들이 고양이를 쓰다듬고 있었다.' }, goto: 'nev_cat_milk' },
      { text: '쥐 잡는 일을 맡겨 본다', set: { gold: 5, 'lodge.note': '고양이가 부엌의 쥐를 쫓아냈다. 재료 손실이 줄었다.' }, goto: 'nev_cat_work' },
      { text: '문을 열어 내보낸다', set: { 'lodge.note': '고양이는 문을 열어 주자 느긋하게 걸어 나갔다.' }, goto: 'nev_cat_out' }
    ] }
  ],
  nev_cat_milk: [
    { narr: '고양이는 우유를 핥고 나서 발을 핥고, 다시 얼굴을 핥았다. 그러고는 카운터 위에 몸을 말고 앉아 이 여관의 주인 행세를 시작했다.' },
    { goto: 'nev_end' }
  ],
  nev_cat_work: [
    { narr: '"쥐를 잡아 주면 멸치를 주마." 알아듣기라도 한 듯 고양이가 그림자처럼 부엌 구석으로 사라졌다. 잠시 후 찍찍 소리가 뚝 그쳤다.' },
    { goto: 'nev_end' }
  ],
  nev_cat_out: [
    { narr: '문을 열자 고양이는 한 번 돌아보고는 달빛 속으로 유유히 사라졌다. 우유 병은 반쯤 비어 있었다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 수상한 손님의 정체 (망토 쓴 나그네를 재운 날) ----------
  nev_cloak: [
    { bgm: 'tension' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '새벽이 가까운데도 망토 쓴 나그네의 방에서 불빛이 새어 나온다. 문틈으로 낮은 목소리가 들렸다. "…보고서에는 이 여관의 이름을 적어 두지."' },
    { narr: '순간 문이 열렸다. 망토가 흘러내리자 왕도 문장이 새겨진 반지가 촛불에 번쩍였다. 나그네가 조용히 입을 열었다.' },
    { narr: '"들켰군. 나는 왕도 여관 감찰관이오. 은빛 여우관의 소문이 왕도까지 닿았기에 신분을 숨기고 묵어 봤소."' },
    { choice: [
      { text: '"먼 길 오셨네요. 따뜻한 차 한 잔 드시겠어요?"', set: { gold: 12, rep: 1, 'lodge.note': '왕도 감찰관의 정체를 알았다. 차 한 잔을 대접하자 사례금을 두고 갔다.' }, goto: 'nev_cloak_tea' },
      { text: '"신분을 숨기고 숙박객을 시험하다니 불쾌하군요."', set: { rep: -1, 'lodge.note': '감찰관에게 불쾌함을 드러냈다. 그는 말없이 장부에 무언가를 적었다.' }, goto: 'nev_cloak_angry' },
      { text: '못 들은 척 가볍게 인사하고 물러난다', set: { rep: 0, 'lodge.note': '감찰관은 새벽에 소리 없이 떠났다. 방에는 잘 정돈된 침구만 남아 있었다.' }, goto: 'nev_cloak_quiet' }
    ] }
  ],
  nev_cloak_tea: [
    { narr: '따뜻한 차를 내밀자 감찰관의 굳은 얼굴이 조금 풀렸다. "…이 차 맛이 보고서에 가장 길게 적히겠군." 그는 금화 몇 닢을 탁자에 놓고 떠났다.' },
    { goto: 'nev_end' }
  ],
  nev_cloak_angry: [
    { narr: '감찰관은 눈썹을 살짝 치켜올렸다. "…정직하군. 그 점은 기록해 두지." 하지만 어쩐지 기록이 좋은 쪽일지는 알 수 없다.' },
    { goto: 'nev_end' }
  ],
  nev_cloak_quiet: [
    { narr: '다음 날 아침, 방은 비어 있었다. 베개 밑에 짧은 쪽지가 있었다. "…좋은 밤이었소."' },
    { goto: 'nev_end' }
  ],

  // ---------- 술 취한 손님 ----------
  nev_drunk: [
    { bgm: 'inn_night' }, { bg: 'inn_night' }, { hide: 'all' },
    { narr: '자정이 넘었는데 식당에서 쩌렁쩌렁한 노랫소리가 들려온다. 묵던 손님 하나가 잔을 들고 탁자 위에 올라서서 혼자 합창을 하고 있다.' },
    { narr: '"으하하, 이 여관 최고다~! 한 곡 더~!" 위층 방 창문들이 하나둘 열리는 소리가 났다.' },
    { choice: [
      { text: '해장차를 내주며 조용히 방으로 모신다', set: { gold: -3, rep: 1, 'lodge.note': '술 취한 손님을 해장차로 달래 방으로 모셨다. 아침에 쑥스러워하며 사과했다.' }, goto: 'nev_drunk_tea' },
      { text: '단호하게 문밖으로 내보낸다', set: { rep: -1, 'lodge.note': '술 취한 손님을 문밖으로 내보냈다. 소동 소문이 조금 났다.' }, goto: 'nev_drunk_out' },
      { text: '분위기를 맞춰 한 곡 같이 부른다', set: { gold: 6, 'lodge.note': '술 취한 손님과 한 곡 같이 불렀다. 신이 난 손님이 팁을 두고 갔다.' }, goto: 'nev_drunk_sing' }
    ] }
  ],
  nev_drunk_tea: [
    { narr: '꿀을 넣은 따뜻한 차를 내주자 손님은 탁자에서 조심조심 내려와 차를 홀짝였다. "…미안하오, 주인장. 오랜만에 고향 생각이 나서…" 눈가가 젖어 있었다.' },
    { goto: 'nev_end' }
  ],
  nev_drunk_out: [
    { narr: '문을 열자 찬 바람이 훅 들어왔다. 손님은 비틀거리며 밖으로 나갔다가 곧 "문 닫지 마!" 하고 외쳤다. 어쩐지 마음이 불편하다.' },
    { goto: 'nev_end' }
  ],
  nev_drunk_sing: [
    { narr: '못 이기는 척 박자를 맞춰 주자 손님이 어깨동무를 했다. 한 곡이 두 곡이 되고, 위층 창문의 불평은 어느새 박수로 바뀌었다.' },
    { goto: 'nev_end' }
  ],

  // ---------- 별똥별의 밤 (가장 가까운 히로인과) ----------
  nev_stars: [
    { bgm: 'romance' }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '잠이 오지 않아 지붕 위로 올라갔다. 그때 밤하늘 한가운데로 별똥별 하나가 긴 꼬리를 끌며 떨어졌다. 그리고 또 하나.' },
    { if: WIN('erion', HEART(1)), goto: 'nev_stars_erion' },
    { if: WIN('kaela', HEART(1)), goto: 'nev_stars_kaela' },
    { if: WIN('miho', HEART(1)), goto: 'nev_stars_miho' },
    { goto: 'nev_stars_lia' }
  ],
  nev_stars_erion: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…별이 떨어지는 날이었구나. 책이 아까부터 조용히 떨리더라.' },
    { say: 'erion', face: 'shy', text: '…소원을 빈다는 건 미신이야. 하지만 오늘은 빌어 볼까 해. 같이 보는 사람이 있으니까.' },
    { choice: [
      { who: 'erion', text: '"무슨 소원인지 말해 줄래요?"', set: { 'aff.erion': 2, 'lodge.note': '지붕 위에서 에리온과 별똥별을 보았다. 소원은 비밀이라고 했다.' }, goto: 'nev_stars_erion_a' },
      { who: 'erion', text: '말없이 옆에 앉아 별을 센다', set: { 'aff.erion': 1, 'lodge.note': '지붕 위에서 에리온과 말없이 별똥별을 세었다.' }, goto: 'nev_stars_erion_b' }
    ] }
  ],
  nev_stars_erion_a: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…말하면 안 이뤄진대. 그래도, 힌트만. 내일 이후에도 이 지붕에서 별을 볼 수 있는 소원이야.' },
    { goto: 'nev_end' }
  ],
  nev_stars_erion_b: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…일곱, 여덟. 여덟 개째야. 이렇게 별을 세는 건 처음이야. 나쁘지 않네.' },
    { goto: 'nev_end' }
  ],
  nev_stars_kaela: [
    { show: 'kaela', face: 'surprised', pos: 'center' },
    { say: 'kaela', text: '주인장! 저, 저것은 유성이다! 하늘의 검이 떨어지고 있다! …소원을 세 번 외쳐야 한다던데 너무 빠르다!' },
    { say: 'kaela', face: 'shy', text: '…영웅은 소원 따위 빌지 않는다. 하지만 이번 한 번만, 주인장이 보고 있으니까 허락하겠다!' },
    { choice: [
      { who: 'kaela', text: '"같이 소원을 외쳐요! 세 번 연달아서!"', set: { 'aff.kaela': 2, 'lodge.note': '지붕 위에서 카엘라와 소원을 세 번 외쳤다. 이웃 방에서 시끄럽다는 항의가 왔다.' }, goto: 'nev_stars_kaela_a' },
      { who: 'kaela', text: '"조용히 보는 게 더 멋있을지도요."', set: { 'aff.kaela': 1, 'lodge.note': '지붕 위에서 카엘라와 조용히 별똥별을 보았다.' }, goto: 'nev_stars_kaela_b' }
    ] }
  ],
  nev_stars_kaela_a: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '기사시험합격기사시험합격기사시험합격! …아, 소원을 말해 버렸다! 괜찮다, 어차피 이뤄질 것이니!' },
    { goto: 'nev_end' }
  ],
  nev_stars_kaela_b: [
    { show: 'kaela', face: 'smile' },
    { say: 'kaela', text: '…조용히 보니 별이 더 크게 보이는군. 영웅도 가끔은 이렇게 쉬어도 되는 걸까.' },
    { goto: 'nev_end' }
  ],
  nev_stars_miho: [
    { show: 'miho', face: 'surprised', pos: 'center' },
    { say: 'miho', text: '사장님, 별똥별이에요! 저거 하나 주우면 얼마나 받을까요? …아, 소원이 먼저죠.' },
    { say: 'miho', face: 'shy', text: '돈 얘기 말고 진짜 소원을 빌려니까 갑자기 하나도 생각이 안 나네요. 이상하죠?' },
    { choice: [
      { who: 'miho', text: '"소원은 돈이 안 드니까 마음껏 빌어요."', set: { 'aff.miho': 2, 'lodge.note': '지붕 위에서 미호와 별똥별을 보았다. 미호는 처음으로 돈 얘기를 하지 않았다.' }, goto: 'nev_stars_miho_a' },
      { who: 'miho', text: '"나는 미호가 소원 비는 얼굴을 볼게요."', set: { 'aff.miho': 1, 'lodge.note': '지붕 위에서 미호와 별똥별을 보았다.' }, goto: 'nev_stars_miho_b' }
    ] }
  ],
  nev_stars_miho_a: [
    { show: 'miho', face: 'smile' },
    { say: 'miho', text: '공짜라고요? …그럼 크게 빌어야겠다! 아이들 모두 배불리 먹게 해 주세요! …아, 이건 비밀이에요!' },
    { goto: 'nev_end' }
  ],
  nev_stars_miho_b: [
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…그런 말 하면 눈 못 감잖아요. 사장님, 꼬리 밟혔어요. 이건 수수료 비싸요.' },
    { goto: 'nev_end' }
  ],
  nev_stars_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '어, 너도 안 자고 있었구나. 마침 잘됐다! 별똥별이 떨어지고 있어. 어릴 때처럼 옥상… 아니, 지붕에서 같이 볼래?' },
    { say: 'lia', face: 'shy', text: '그때도 이랬잖아. 네가 소원 빌 때 내 이름도 같이 불러 줬던 거, 나 아직 기억해.' },
    { choice: [
      { who: 'lia', text: '"이번에도 네 이름을 넣어서 빌게."', set: { 'aff.lia': 2, 'lodge.note': '지붕 위에서 리아와 별똥별을 보았다. 어릴 적 소원이 생각났다.' }, goto: 'nev_stars_lia_a' },
      { who: 'lia', text: '"추우니까 담요부터 두르자."', set: { 'aff.lia': 1, 'lodge.note': '지붕 위에서 리아와 한 담요를 두르고 별똥별을 보았다.' }, goto: 'nev_stars_lia_b' }
    ] }
  ],
  nev_stars_lia_a: [
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…바보. 그런 걸 아무렇지 않게 말하니까, 내가 계속 이러는 거야.' },
    { goto: 'nev_end' }
  ],
  nev_stars_lia_b: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '후후, 담요 한 장에 둘이면 좁잖아. …그래도 좋아. 이대로 있자.' },
    { goto: 'nev_end' }
  ],

  // 모든 밤 사건의 끝 (다음 일은 밤 업그레이드 화면)
  nev_end: [
    { hide: 'all' },
    { narr: '긴 밤이 지나갔다. 아직 해야 할 일이 남아 있다. 여관을 손볼 시간이다.' },
    { nightret: true }
  ]
});
