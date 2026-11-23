// ============================================================
//  주간 이벤트 장면 (일요일 휴일의 낮 + 토요일 낮 행사) — 데이터는 story/weekly-events.js (휴일), story/routine.js 의 DAY_ACTIONS (토요일 행사)
//  - 휴일 장면의 끝은 {goto:'hol_end'}, 토요일 행사 장면의 끝은 {goto:'after_pick'} 입니다.
//  - 휴일 데이트: 호감도(하트 3칸)가 넘으면 대사가 달라집니다 ({if: 'aff.erion>=' + HEART(3), goto: ...}).
//  - 마을 행사: 작은 보상(골드 +4~22 / 평판 +1~2) + 선택지. 영업 미니 변형(음식 경연)은 도우미 히로인의 호감도가 오릅니다.
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 1주차 휴일 데이트: 에리온 · 호수 낚시 =================
  wk1_lake_erion: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마을 서쪽 호수는 거울처럼 잔잔했다. 에리온이 낚싯대 두 개를 들고 먼저 와 있었다. 하나는 여분이라고 했지만 줄이 새것이었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…앉아. 낚시는 기다리는 일이야. 말은 필요 없어. 물고기가 놀라니까.' },
    { narr: '한 시간이 지났다. 에리온은 한 마리도 못 잡았고 나는 장화 한 짝을 낚았다. 둘 다 숨죽여 웃음을 참았다.' },
    { if: 'aff.erion>=' + HEART(3), goto: 'wk1_lake_erion_high' },
    { say: 'erion', face: 'angry', text: '…웃지 마. 이 호수 물고기는 내 마력 냄새를 싫어하는 거야. 분명해.' },
    { narr: '해 질 무렵까지 앉아 있다가 에리온이 마지막으로 줄을 걷었다. 낚싯바늘에 말린 꽃잎이 걸려 올라왔다. 그녀는 그것을 책갈피로 끼웠다.' },
    { say: 'erion', face: 'smile', text: '…오늘 수확은 이거면 됐어. 다음에 또 오자. 장화는 두고 가.' },
    { set: { 'aff.erion': 4, fat: -5 } },
    { goto: 'hol_end' }
  ],
  wk1_lake_erion_high: [
    { say: 'erion', face: 'smile', text: '…장화라니. 이 정도로 웃은 건 정말 오랜만이야. 아니, 처음일지도 몰라.' },
    { narr: '한참 뒤, 어깨에 무게가 실렸다. 에리온이 낚싯대를 쥔 채 잠들어 머리를 기대고 있었다. 은빛 머리카락이 호수 바람에 하늘거렸다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…안 잔 거야. 눈을 감고 있었을 뿐이야. 어깨가 편해서 그런 게 아니라 호수 소리가 좋아서.' },
    { narr: '말은 그렇게 하면서 에리온은 해가 질 때까지 어깨에서 머리를 떼지 않았다. 낚싯줄은 한 번도 흔들리지 않았다. 그래도 가장 좋은 낚시였다.' },
    { set: { 'aff.erion': 5, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 1주차 휴일 데이트: 리아 · 숲 약초 채집 =================
  wk1_herb_lia: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '바구니를 하나씩 들고 마을 뒤쪽 숲으로 들어갔다. 리아가 앞장서서 걸으며 풀 이름을 하나씩 알려 주었다. 이건 허브, 이건 독초, 이건 먹으면 하루 종일 웃는 풀.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '신전에서 약초 수업 들을 때 제일 좋아했던 시간이야. 이렇게 같이 오니까 더 좋다.' },
    { narr: '바구니가 반쯤 찼을 때 리아가 갑자기 걸음을 멈췄다. 나무 밑동에서 은은한 달빛 같은 빛이 새어 나오고 있다. 월광초였다.' },
    { say: 'lia', face: 'surprised', text: '월광초야! 이 숲에 있을 줄은 몰랐어. 이건 신전에서도 일 년에 한 번 보기 힘든 건데!' },
    { if: 'aff.lia>=' + HEART(3), goto: 'wk1_herb_lia_high' },
    { narr: '둘이 머리를 맞대고 조심스럽게 뿌리째 캤다. 리아가 허브를 한 줌 더 얹어 바구니를 건넸다.' },
    { say: 'lia', text: '이건 네 몫이야. 여관 요리에 써. 달콤하게 만들면 에리온이 좋아할지도 모르고.' },
    { set: { 'aff.lia': 4, 'tavern.stock.herb': 3, fat: -5 } },
    { narr: '(허브 3개를 얻었다)' },
    { goto: 'hol_end' }
  ],
  wk1_herb_lia_high: [
    { narr: '리아가 월광초를 한 송이 꺾어 조심스럽게 내 머리 위에 얹어 보더니 키득 웃었다. 어릴 때 화관을 만들던 그 웃음 그대로다.' },
    { show: 'lia', face: 'shy' },
    { say: 'lia', text: '…여기, 어릴 때 우리가 길 잃었던 숲이지? 그때 네가 내 손을 안 놓아 줬어. 나, 그날부터 이 숲이 무섭지 않았어.' },
    { narr: '리아가 월광초 뿌리 절반을 내 바구니에 넣어 주었다. 나머지 절반은 자기 바구니에. "…같은 꽃이 두 곳에서 피면 우리가 서로 떨어져 있어도 괜찮을 것 같아서."' },
    { set: { 'aff.lia': 5, 'tavern.stock.herb': 3, fat: -5 } },
    { narr: '(허브 3개를 얻었다)' },
    { goto: 'hol_end' }
  ],

  // ================= 2주차 휴일 데이트: 미호 · 시장 감별 =================
  wk2_market_miho: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '일요일 시장은 사람으로 넘쳤다. 미호는 노점마다 걸음을 멈추고 상품을 한 번 훑더니 입속으로 숫자를 중얼거렸다. "저건 바가지, 저건 정가, 저건… 도둑맞은 물건이네요."' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 오늘은 제 장사 감각 수업이에요! 수업료는 무료지만 배운 걸 써먹으면 수수료 이 할이에요!' },
    { narr: '미호의 지시로 나는 비단 노점 앞에서 값을 깎는 역할을 맡았다. 뒤에서 미호가 손가락으로 숫자를 보내 주었다. 이 정도로 깎아라, 그다음은 한 걸음 물러나라.' },
    { choice: [
      { text: '시키는 대로 흥정한다.', set: { gold: 10, 'aff.miho': 2 }, goto: 'wk2_market_miho_deal' },
      { text: '"미호가 직접 하는 걸 보고 싶어요."', set: { 'aff.miho': 3 }, goto: 'wk2_market_miho_show' }
    ] }
  ],
  wk2_market_miho_deal: [
    { narr: '가격이 반으로 떨어졌다. 상인이 눈을 동그랗게 뜬 채 비단을 넘겨주었다. 미호가 엄지를 척 들었다.' },
    { say: 'miho', face: 'smile', text: '소질 있어요! 사장님은 정직한 얼굴이라 바가지가 안 통해요. 상인들이 속아 줘요!' },
    { goto: 'wk2_market_miho_end' }
  ],
  wk2_market_miho_show: [
    { narr: '미호가 앞치마를 슬쩍 바로잡고 앞으로 나섰다. 다섯 마디 만에 상인은 비단 두 필을 덤으로 얹어 주며 "제발 이제 가라"고 사정했다.' },
    { say: 'miho', face: 'smile', text: '후후, 이게 진짜 장사꾼의 흥정이에요. 시간당 수입이 가장 높은 일은 사실 말하는 거라니까요.' },
    { goto: 'wk2_market_miho_end' }
  ],
  wk2_market_miho_end: [
    { if: 'aff.miho>=' + HEART(3), goto: 'wk2_market_miho_high' },
    { narr: '돌아오는 길에 미호는 꿀과자를 하나 사서 반으로 쪼개 나눠 주었다. "…이건 원가 계산에서 뺄게요."' },
    { set: { 'aff.miho': 2, fat: -5 } },
    { goto: 'hol_end' }
  ],
  wk2_market_miho_high: [
    { narr: '가게 앞을 지나던 미호가 갑자기 멈춰 서서 작은 장식 하나를 집어 들었다. 은빛 여우 모양의 열쇠고리였다.' },
    { show: 'miho', face: 'shy' },
    { say: 'miho', text: '…이건 사장님 거예요. 아니, 판매가는 있어요. 은화 한 닢. 그런데 오늘은 "서비스"예요. 이유는 장부에 안 쓸 거예요.' },
    { narr: '열쇠고리를 받아 들자 미호의 꼬리가 크게 한 번 흔들렸다. 그리고 얼른 앞서 걸으며 말했다. "…그, 그런 얼굴로 쳐다보지 마세요. 비싸 보이잖아요."' },
    { set: { 'aff.miho': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 2주차 휴일 데이트: 카엘라 · 숲 열매 경쟁 =================
  wk2_hunt_kaela: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '카엘라가 대검 대신 바구니를 들고 여관 앞에 서 있었다. 이마에 두른 머리띠에는 "필승"이라고 쓰여 있다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '주인장! 휴일의 훈련이다! 숲에서 누가 더 많은 열매를 따는지 승부를 가린다! 진 쪽이 점심을 사는 거다!' },
    { narr: '숲에 들어서자마자 카엘라는 나뭇가지에 이마를 부딪쳤다. 세 번째 가지에서는 머리띠가 걸렸다. 열매 대신 나뭇잎만 한 바구니 가득 모였다.' },
    { say: 'kaela', face: 'surprised', text: '이, 이건 열매다! 잎사귀 모양의 열매다! …아니, 졌다. 하지만 아직 끝나지 않았다!' },
    { choice: [
      { text: '카엘라 몰래 내 바구니의 열매를 절반 덜어 준다.', set: { 'aff.kaela': 2 }, goto: 'wk2_hunt_kaela_gift' },
      { text: '나무 위에 열매가 주렁주렁한 곳을 알려 준다.', set: { 'aff.kaela': 2 }, goto: 'wk2_hunt_kaela_tip' }
    ] }
  ],
  wk2_hunt_kaela_gift: [
    { narr: '바구니가 갑자기 무거워진 카엘라가 눈을 깜박였다. 그리고 한참 후에 소리쳤다.' },
    { say: 'kaela', face: 'smile', text: '이긴 건가!? 아니, 이건 이 몸의 실력이 아니군. 눈치채고 있다, 주인장. 하지만 기분은 좋다! 점심은 이 몸이 사겠다!' },
    { goto: 'wk2_hunt_kaela_end' }
  ],
  wk2_hunt_kaela_tip: [
    { narr: '카엘라가 나무를 타고 올라가 열매를 따는 동안, 나는 밑에서 바구니를 받쳤다. 놀랍게도 팔 힘이 대단해서 한 번에 한 아름씩 따냈다.' },
    { say: 'kaela', face: 'smile', text: '봤나! 이 몸의 체력이다! …다만 내려오는 방법을 생각 안 했군. 주인장, 받아라!' },
    { narr: '카엘라가 나무에서 뛰어내렸고, 나는 열매 바구니와 함께 카엘라를 받아 냈다. 둘 다 땅바닥에 엎어졌다. 열매가 하늘에서 비처럼 쏟아졌다.' },
    { goto: 'wk2_hunt_kaela_end' }
  ],
  wk2_hunt_kaela_end: [
    { if: 'aff.kaela>=' + HEART(3), goto: 'wk2_hunt_kaela_high' },
    { narr: '점심은 결국 카엘라가 샀다. 고기 파이 두 개를 한꺼번에 먹으며 카엘라는 말했다. "내일도 승부다, 주인장!"' },
    { set: { 'aff.kaela': 2, fat: -5 } },
    { goto: 'hol_end' }
  ],
  wk2_hunt_kaela_high: [
    { narr: '돌아오는 길에 카엘라가 말없이 걷다가 작은 꽃을 하나 꺾어 내 머리에 꽂았다. 그리고 서둘러 앞서 걸으며 소리쳤다.' },
    { show: 'kaela', face: 'shy' },
    { say: 'kaela', text: '이, 이건 승리의 표식이다! 이긴 쪽에게 주는 월계관이다! …내가 졌지만, 기분이다!' },
    { narr: '꽃에서 풀 냄새가 났다. 카엘라의 귀 끝이 붉은 것은 아마 햇볕 때문만은 아닐 것이다.' },
    { set: { 'aff.kaela': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 2주차 마을 행사: 달맞이 뒷정리 =================
  wk2_cleanup: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '달맞이 장터가 끝난 다음 날, 광장은 종잇조각과 타다 만 등불 잔해로 가득했다. 촌장님이 빗자루를 든 채 마을 사람들을 모으고 있었다.' },
    { show: 'chief', face: 'normal', pos: 'center' },
    { say: 'chief', text: '모두 모였군. 어젯밤 지진은 다행히 큰 피해가 없었지만, 광장이 엉망이야. 일손이 필요하네. 여관 주인도 와 주었군.' },
    { narr: '광장 한쪽에서는 카엘라가 짐수레를 혼자 끌고 있고, 에리온은 꺼지지 않은 불씨를 마법으로 하나씩 잠재우고 있었다. 미호는 주운 동전을 세다가 리아에게 혼났다.' },
    { choice: [
      { text: '광장 한복판의 쓰레기를 맡는다.', set: { rep: 2, fat: 6 }, goto: 'wk2_cleanup_square' },
      { text: '어르신들이 쉬는 천막에서 차를 내드린다.', set: { rep: 1, 'aff.lia': 1, fat: 2 }, goto: 'wk2_cleanup_tea' },
      { text: '아이들과 함께 남은 등불을 모아 소원을 읽어 본다.', set: { rep: 1, 'aff.erion': 1, 'aff.miho': 1 }, goto: 'wk2_cleanup_wish' }
    ] }
  ],
  wk2_cleanup_square: [
    { narr: '한 시간 만에 광장이 반짝반짝해졌다. 촌장님이 허리를 두드리며 말했다. "은빛 여우관 주인이 앞장서니 모두가 따라오는군."' },
    { say: 'chief', face: 'smile', text: '고맙네. 이 마을은 이렇게 일어서는 마을이야. 지진이 와도, 무슨 일이 와도.' },
    { goto: 'hol_end' }
  ],
  wk2_cleanup_tea: [
    { narr: '따뜻한 차를 한 잔씩 건네자 어르신들이 고개를 끄덕였다. 리아가 옆에서 조용히 찻잔을 닦으며 작게 말했다. "…고마워. 어르신들이 오래 이야기하고 싶어 하셨거든."' },
    { goto: 'hol_end' }
  ],
  wk2_cleanup_wish: [
    { narr: '아이들이 주운 소원 등불에는 서툰 글씨가 적혀 있었다. "엄마가 안 아프게 해 주세요." "여관 아저씨랑 소풍 가고 싶어요."' },
    { narr: '한쪽 구석에서는 에리온이 말없이 등불 하나를 오래 들여다보고 있었다. 미호는 모른 척 고개를 돌렸다. 눈가가 조금 반짝였다.' },
    { goto: 'hol_end' }
  ],

  // ================= 3주차 휴일 데이트: 에리온 · 언덕 별 보기 (하트 3칸 이상) =================
  wk3_stars_erion: [
    { bg: 'roof_night' }, { hide: 'all' },
    { narr: '해가 기울자 에리온이 말없이 문 앞에서 기다리고 있었다. 손에는 담요 두 장과 별자리 지도가 들려 있다. 마을 뒤 언덕으로 향하는 길은 고요했다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…오늘은 별이 잘 보일 거야. 하늘이 맑아서. 물론 너 때문에 가자고 한 건 아니고, 별자리 관측 숙제가 있어서야.' },
    { narr: '언덕 꼭대기에서 담요를 깔고 나란히 누웠다. 해가 사라지자 하늘 한 귀퉁이부터 별이 하나둘 켜졌다. 숨소리 외에는 아무 소리도 없다.' },
    { say: 'erion', face: 'smile', text: '저기가 북쪽 별. 길 잃은 사람들을 위해 항상 같은 자리에 있어. 그 옆 작은 별들은 길 잃은 사람이 가지고 다니는 등불이래.' },
    { narr: '에리온이 손가락으로 별을 이어 그림을 그렸다. 곰, 여우, 그리고 작은 책 모양. 별 하나가 길게 꼬리를 끌며 흘렀다.' },
    { say: 'erion', face: 'shy', text: '…소원 같은 건 믿지 않아. 그런데 이번에는… 아무 말도 안 했는데 빌고 있었어. 이상하네.' },
    { narr: '어느새 담요 위에서 손끝이 닿았다. 에리온은 손을 빼지 않았다. 별이 하나 더 졌다. 오늘은 두 사람 다 소원을 입 밖에 내지 않았다.' },
    { set: { 'aff.erion': 5, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 3주차 휴일 데이트: 리아 · 호숫가 꽃반지 (하트 3칸 이상) =================
  wk3_flower_lia: [
    { bg: 'inn_front' }, { hide: 'all' },
    { narr: '호숫가 풀밭에 리아가 앉아 클로버를 한 줌 뜯고 있었다. 손가락이 바쁘게 움직이더니 작은 고리가 하나 완성됐다.' },
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '꽃반지 만드는 법, 기억나? 어릴 때 네가 못 만든다고 울면서 매듭만 계속 풀었잖아. 그때 내가 가르쳐 줬는데.' },
    { narr: '리아가 옆자리를 툭툭 쳤다. 나란히 앉아 클로버 줄기를 엮었다. 내 반지는 자꾸 풀렸고 리아의 반지는 점점 길어졌다.' },
    { choice: [
      { text: '"완성하면 줄게요. 아주 비뚤어질 테지만."', set: { 'aff.lia': 2 }, goto: 'wk3_flower_lia_ring' },
      { text: '"리아가 만든 거, 나한테 줄래요?"', set: { 'aff.lia': 3 }, goto: 'wk3_flower_lia_ask' }
    ] }
  ],
  wk3_flower_lia_ring: [
    { narr: '한 시간 끝에 내 반지는 반지라기보다 꽈배기가 되었다. 리아가 눈물이 날 만큼 웃었다. 그리고 소중하게 손가락에 끼웠다.' },
    { say: 'lia', face: 'shy', text: '…웃어서 미안. 그런데 이게 제일 마음에 들어. 풀리지 않게 두 번 더 묶었네? 고마워.' },
    { goto: 'wk3_flower_lia_end' }
  ],
  wk3_flower_lia_ask: [
    { show: 'lia', face: 'surprised' },
    { say: 'lia', text: '내, 내가 만든 거를? …좋아. 그럼 대신 네가 만든 것도 줘야 해. 교환이야.' },
    { narr: '서로의 손가락에 풀꽃 반지를 끼워 주고는 한참 동안 말없이 호수만 바라보았다. 잔물결에 구름이 부서졌다.' },
    { goto: 'wk3_flower_lia_end' }
  ],
  wk3_flower_lia_end: [
    { show: 'lia', face: 'smile' },
    { say: 'lia', text: '…이게 시들 때까지 기억해 줘. 시들어도 괜찮아. 다음 여름에 다시 만들면 되니까.' },
    { set: { 'aff.lia': 3, fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 3주차 휴일 데이트: 미호 · 노점 장사 대결 =================
  wk3_miho_stall: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '광장 한구석에 빈 좌판이 하나 놓여 있다. 미호가 팔짱을 끼고 나를 향해 씩 웃었다. 좌판 위에는 잡화가 가득하다.' },
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '사장님, 장사 대결이에요! 해 질 때까지 누가 더 많이 파는지! 지는 쪽은 저녁 설거지를 맡아요!' },
    { narr: '나는 여관 주인답게 정직한 가격을 붙였다. 미호는 같은 물건에 "오늘만 특별가"라는 푯말을 붙였다. 사람들이 미호 쪽으로 몰려갔다.' },
    { choice: [
      { text: '미호의 좌판에서 같이 호객한다. "합동 판매로 하죠."', set: { gold: 12, 'aff.miho': 3 }, goto: 'wk3_miho_stall_team' },
      { text: '내 방식대로 정직하게 판다.', set: { gold: 6, rep: 1, 'aff.miho': 2 }, goto: 'wk3_miho_stall_honest' }
    ] }
  ],
  wk3_miho_stall_team: [
    { narr: '미호의 호객과 내 정직한 얼굴이 합쳐지자 놀랍게도 상승효과가 났다. 해가 지기도 전에 좌판이 텅 비었다.' },
    { say: 'miho', face: 'shy', text: '…이 조합은 반칙이에요. 사장님이 옆에 있으면 사람들이 믿어요. 제 이름은 안 믿는데요. 신기하네요.' },
    { goto: 'wk3_miho_stall_end' }
  ],
  wk3_miho_stall_honest: [
    { narr: '정직한 가격표를 붙인 내 좌판에는 단골이 하나둘 쌓였다. 매출은 미호가 높았지만 "다음에도 여기서 살게요" 하는 말은 내 몫이었다.' },
    { say: 'miho', face: 'normal', text: '…매출은 제가 이겼지만 신뢰는 사장님이 이겼네요. 장사의 두 가지 종류가 이거였군요.' },
    { goto: 'wk3_miho_stall_end' }
  ],
  wk3_miho_stall_end: [
    { narr: '저녁 설거지는 결국 둘이 함께 했다. 승패는 가리지 않기로 했다. 미호가 거품을 내 코에 묻혀 놓고 꼬리를 흔들었다.' },
    { set: { fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 3주차 휴일 데이트: 카엘라 · 달리기 시합 =================
  wk3_kaela_race: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '광장 한가운데서 카엘라가 준비 운동 중이었다. 갑옷은 벗고 가벼운 훈련복 차림이다. 의외로 평소보다 훨씬 날쌔 보인다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '주인장! 달리기 시합이다! 마을 분수에서 여관 문까지! 이 몸이 이기면 점심은 고기, 주인장이 이기면… 음, 이 몸이 설거지다!' },
    { narr: '출발 신호와 함께 카엘라가 번개처럼 튀어 나갔다. 나는 다섯 걸음 만에 숨이 찼다. 그런데 카엘라가 반 바퀴 돌아서 돌아왔다.' },
    { say: 'kaela', face: 'surprised', text: '주인장!? 뒤처졌잖나! 같이 달려야 의미가 있다! 이쪽으로 와, 손을 잡아라!' },
    { narr: '카엘라가 손을 내밀었다. 손을 잡고 달리자 속도가 두 배가 되었다. 팔다리가 동시에 나가는 것도 같이 달리니 그다지 눈에 띄지 않았다.' },
    { choice: [
      { text: '결승선 직전에 일부러 속도를 늦춘다.', set: { 'aff.kaela': 2 }, goto: 'wk3_kaela_race_slow' },
      { text: '끝까지 손을 놓지 않고 같이 들어온다.', set: { 'aff.kaela': 3 }, goto: 'wk3_kaela_race_tie' }
    ] }
  ],
  wk3_kaela_race_slow: [
    { narr: '카엘라가 결승선을 한 걸음 앞서 통과했다. 환호하던 얼굴이 곧 의심스러운 표정으로 바뀌었다.' },
    { say: 'kaela', face: 'normal', text: '…주인장, 일부러 졌지. 눈을 보면 안다. 이 몸을 얕보지 마라!' },
    { say: 'kaela', face: 'smile', text: '…하지만 고맙다. 승리의 맛은 달다. 다음에는 정정당당히 이길 것이다. 이번엔 점심으로 갚겠다!' },
    { goto: 'wk3_kaela_race_end' }
  ],
  wk3_kaela_race_tie: [
    { narr: '둘이 동시에 결승선을 넘었다. 심판을 맡은 마을 아이들이 판정을 내렸다. "무승부!" 카엘라가 환호하며 번쩍 팔을 들었다.' },
    { say: 'kaela', face: 'smile', text: '무승부다! 이 몸이 승부에서 처음으로 지지 않았다! 둘이 같이 이긴 거나 마찬가지다, 주인장!' },
    { goto: 'wk3_kaela_race_end' }
  ],
  wk3_kaela_race_end: [
    { narr: '점심은 결국 고기 파이였다. 반으로 갈라 나눠 먹으며 카엘라는 만족스러운 얼굴로 말했다. "이 몸의 첫 팀플레이 승리다!"' },
    { set: { fat: -5 } },
    { goto: 'hol_end' }
  ],

  // ================= 3주차 마을 행사: 마을 음식 경연 (영업 미니 변형) =================
  wk3_cookoff: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '광장에 긴 탁자가 놓이고 솥단지가 줄지어 섰다. 올해 첫 "추수 국물 경연". 우승 팀에게는 상금과 마을 소식지에 이름이 실리는 영예가 걸려 있다.' },
    { show: 'chief', face: 'smile', pos: 'center' },
    { say: 'chief', text: '심사는 이 촌장과 마르타, 바론 영감이 맡네. 은빛 여우관은 올해도 나오겠지? 이 마을 음식의 자존심이니 말이야.' },
    { narr: '솥에 불을 지피고 나서야 도우미가 필요하다는 걸 깨달았다. 주변을 둘러보자 네 명이 일제히 눈을 마주쳤다.' },
    { choice: [
      { who: 'erion', text: '에리온에게 신비한 향신료를 부탁한다.', set: { 'aff.erion': 2 }, goto: 'wk3_cookoff_erion' },
      { who: 'kaela', text: '카엘라에게 장작과 큰 솥을 맡긴다.', set: { 'aff.kaela': 2 }, goto: 'wk3_cookoff_kaela' },
      { who: 'miho', text: '미호에게 재료 수급과 가격 전략을 부탁한다.', set: { 'aff.miho': 2 }, goto: 'wk3_cookoff_miho' },
      { who: 'lia', text: '리아에게 정성껏 간을 맡긴다.', set: { 'aff.lia': 2 }, goto: 'wk3_cookoff_lia' },
      { text: '혼자서 묵묵히 끓인다.', set: { gold: 12, rep: 1 }, goto: 'wk3_cookoff_solo' }
    ] }
  ],
  wk3_cookoff_erion: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…이건 엘프식 향신료야. 한 방울만 넣어. 두 방울은 위험해. 세 방울은… 하지 마.' },
    { narr: '국물에 푸른 빛이 한 줄기 돌았다. 심사위원들이 한 모금씩 마시고 눈을 깜박였다. 촌장님이 눈을 크게 떴다. "이건… 처음 맛보는 향이군. 어디서 났나?"' },
    { if: 'aff.erion>=' + HEART(3), goto: 'wk3_cookoff_erion_win' },
    { narr: '호불호가 갈려 3등이었다. 그래도 신기하다며 호기심 가득한 손님들이 몰려들었다.' },
    { set: { gold: 6, rep: 1 } },
    { goto: 'hol_end' }
  ],
  wk3_cookoff_erion_win: [
    { narr: '결과 발표. 신비한 향신료의 국물이 심사위원 만장일치로 우승을 차지했다. 에리온은 상장을 받아 들고 귀 끝까지 빨개졌다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이, 이런 건 필요 없어. 하지만 방에 걸어 둘게. 연구 성과니까.' },
    { set: { gold: 20, rep: 2, 'flag.cookoff_win': true } },
    { goto: 'hol_end' }
  ],
  wk3_cookoff_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '장작은 이 몸에게 맡겨라! 불길은 전장의 기본이다! 솥은 클수록 좋다!' },
    { narr: '카엘라가 장작을 한 아름 쏟아붓자 불길이 천장 가까이 치솟았다. 구경꾼들이 뒤로 물러났다. 다행히 솥은 멀쩡했고 국물은 푸짐했다.' },
    { narr: '심사위원 바론 영감이 세 그릇을 비웠다. "양이 마음에 드는구먼!" 맛과 양 점수가 높아 2등이 되었다.' },
    { set: { gold: 14, rep: 1 } },
    { goto: 'hol_end' }
  ],
  wk3_cookoff_miho: [
    { show: 'miho', face: 'smile', pos: 'center' },
    { say: 'miho', text: '이 솥의 원가는 한 그릇에 반 닢! 그런데 시식 부스를 만들면 열 배 팔려요. 경연 우승보다 현장 매출이 중요해요!' },
    { narr: '미호의 수완으로 경연장 한쪽에 시식 부스가 차려졌다. 솥은 순식간에 바닥을 보였다. 심사 결과는 4등이었지만 수입은 단연 일등이었다.' },
    { set: { gold: 22 } },
    { goto: 'hol_end' }
  ],
  wk3_cookoff_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '국물은 정성이야. 천천히, 저으면서 마음으로 간을 보는 거야. 자, 한 입만 먹어 봐.' },
    { narr: '리아의 국물은 화려하지 않았지만 한 모금 마시면 몸 안쪽이 따뜻해졌다. 마르타가 눈물을 훔쳤다. "…어릴 적 엄마가 끓여 주던 맛이에요."' },
    { narr: '심사 결과 2등. 그런데 마르타가 심사표에 별도의 한 줄을 적었다. "올해의 마음 상."' },
    { set: { gold: 8, rep: 2 } },
    { goto: 'hol_end' }
  ],
  wk3_cookoff_solo: [
    { narr: '혼자 솥 앞에 서서 천천히 국을 끓였다. 평범한 맛이었지만 틀림없이 믿을 만한 맛이었다. 결과는 5등. 하지만 상품으로 받은 장작이 한 달 치였다.' },
    { say: 'chief', face: 'smile', text: '허허, 소박한 맛이 좋군. 이 마을 여관의 맛이야.' },
    { goto: 'hol_end' }
  ],

  // ================= 토요일 행사 (낮 행동 선택지에 그 주 토요일만 나옵니다) =================
  // ----- 1주차 토요일 장날 -----
  sat1_market: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '토요일 장날. 광장에 천막이 늘어서고 행상인들이 목청을 높였다. 오늘만큼은 여관 일을 접고 구경하러 나왔다.' },
    { narr: '곡식 가게, 잡화 가게, 약초 가게. 사람들 틈에서 낯익은 얼굴들이 보였다. 단골 몇 명이 손을 흔들었다.' },
    { choice: [
      { text: '이웃 가게에 인사하며 돌아다닌다. (여관 소문 퍼뜨리기)', set: { rep: 1, 'today.cust': 1, 'today.note': '장날에 인사를 돌아서 저녁에 단골이 한 명 더 찾아온다', fat: 3 }, goto: 'sat1_market_greet' },
      { text: '재료 가게를 돌며 싸게 파는 곳을 찾아본다. (-4G)', cost: 4, set: { 'today.price': -15, 'today.note': '장날 재료 가게에서 값을 흥정해 두었다', fat: 3 }, goto: 'sat1_market_shop' },
      { text: '맛있는 군것질을 사 먹으며 쉰다.', set: { fat: -15, gold: -3 }, goto: 'sat1_market_snack' }
    ] }
  ],
  sat1_market_greet: [
    { narr: '인사를 돌 때마다 "저녁에 들를게요!" 하는 말이 돌아왔다. 장날의 인정이 이런 것이다.' },
    { goto: 'after_pick' }
  ],
  sat1_market_shop: [
    { narr: '곡식 가게에서 한 번, 약초 가게에서 한 번 깎았다. 오늘 장보기는 한결 가벼울 것이다.' },
    { goto: 'after_pick' }
  ],
  sat1_market_snack: [
    { narr: '꿀 바른 튀김과 따끈한 군밤을 사서 분수대에 앉아 먹었다. 별것 아닌 간식인데 이상하게 힘이 났다.' },
    { goto: 'after_pick' }
  ],

  // ----- 3주차 토요일 마을 사냥 대회 -----
  sat3_hunt: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '광장 한복판에 현수막이 걸렸다. "추수 전 사냥 대회". 청년단원들과 사냥꾼들이 활을 들고 모였다. 그 틈에 요란한 갑옷이 하나 서 있다.' },
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '주인장! 이 몸도 참가한다! 이번에야말로 영웅의 사냥 솜씨를 보여 주겠다! 응원해라!' },
    { narr: '결과는 이 대회에서도 한 가지로 예상된다. 카엘라가 잡은 건 도토리 서른 알과 길 잃은 닭 한 마리. 닭이 누구네 닭인지는 모르겠다.' },
    { choice: [
      { who: 'kaela', text: '큰 소리로 카엘라를 응원한다.', set: { 'aff.kaela': 2, rep: 1 }, goto: 'sat3_hunt_cheer' },
      { text: '대회 후 고기 요리를 납품한다. (사냥꾼들의 식재료 거래)', set: { gold: 18, fat: 8 }, goto: 'sat3_hunt_sell' },
      { text: '사냥꾼 로간 영감의 이야기를 듣는다.', set: { rep: 1, fat: -5 }, goto: 'sat3_hunt_talk' }
    ] }
  ],
  sat3_hunt_cheer: [
    { say: 'kaela', face: 'surprised', text: '!! 응원 소리가 들린다! 이 소리가 있으면 도토리도 멧돼지로 보인다!' },
    { narr: '카엘라가 결국 우승 후보에게 반 걸음 모자란 3등을 차지했다. 상품은 마을 대장간의 작은 숫돌이었다. 카엘라는 숫돌을 높이 들고 환호했다.' },
    { goto: 'after_pick' }
  ],
  sat3_hunt_sell: [
    { narr: '사냥꾼들이 잡은 고기를 손질해 간단한 구이로 만들어 팔았다. 사냥꾼도, 구경꾼도 입이 귀에 걸렸다. 정말로 남는 장사였다.' },
    { goto: 'after_pick' }
  ],
  sat3_hunt_talk: [
    { narr: '사냥꾼 로간 영감이 담뱃대를 물고 숲 이야기를 풀어 놓았다. "요즘 짐승들이 이상하게 산 밖으로 내려오는구먼. 뭔가를 느끼는 거야." 마을 사람들이 귀를 기울였다.' },
    { goto: 'after_pick' }
  ],

  // ----- 4주차 토요일 수확제 마지막 준비 -----
  sat4_harvest: [
    { bg: 'square_day' }, { hide: 'all' },
    { narr: '폭풍이 오기 전날. 마을 사람들이 광장에 모여 마지막 수확을 창고에 옮기고 있었다. 평소의 흥겨운 수확제는 올해 조용히 지나갔다. 모두 하늘을 힐끗거린다.' },
    { show: 'chief', face: 'normal', pos: 'center' },
    { say: 'chief', text: '곡식은 창고에, 가축은 우리에. 어차피 오늘은 일꾼이 많을수록 좋네. 여관 주인도 거들어 주겠나?' },
    { narr: '네 사람이 각자 자리에서 일을 하고 있었다. 누구 곁에서 일을 도울까?' },
    { choice: [
      { who: 'erion', text: '에리온을 돕는다. 창고에 보호 마법을 거는 것을 거든다.', set: { 'aff.erion': 2, rep: 1, fat: 6 }, goto: 'sat4_harvest_erion' },
      { who: 'kaela', text: '카엘라를 돕는다. 곡식 자루를 같이 나른다.', set: { 'aff.kaela': 2, rep: 1, fat: 10 }, goto: 'sat4_harvest_kaela' },
      { who: 'miho', text: '미호를 돕는다. 재고를 세고 분배표를 만든다.', set: { 'aff.miho': 2, rep: 1, fat: 4 }, goto: 'sat4_harvest_miho' },
      { who: 'lia', text: '리아를 돕는다. 아이들과 노인들에게 따뜻한 수프를 나눈다.', set: { 'aff.lia': 2, rep: 1, fat: 6 }, goto: 'sat4_harvest_lia' }
    ] }
  ],
  sat4_harvest_erion: [
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…창고 문마다 작은 문양을 그려. 이 선을 따라가면 돼. 마력은 내가 넣을 테니까 손만 움직여.' },
    { narr: '푸른 문양이 한 줄씩 완성될 때마다 공기가 가라앉았다. 마을 사람들이 신기해하며 창고 앞에 몰려들었다. 에리온은 귀찮은 척했지만 한 명 한 명에게 문양의 뜻을 설명해 주었다.' },
    { goto: 'after_pick' }
  ],
  sat4_harvest_kaela: [
    { show: 'kaela', face: 'smile', pos: 'center' },
    { say: 'kaela', text: '곡식 자루는 전장의 병참이다! 보급이 끊기면 아무리 강한 군대도 무너진다! 자, 하나 둘!' },
    { narr: '카엘라는 자루 세 개를 한꺼번에 어깨에 얹고 걸었다. 나는 한 개를 들고 헉헉거렸다. 마을 아이들이 카엘라 뒤를 줄지어 따라 걸었다. 완전히 행렬이다.' },
    { goto: 'after_pick' }
  ],
  sat4_harvest_miho: [
    { show: 'miho', face: 'normal', pos: 'center' },
    { say: 'miho', text: '재고는 이만큼, 하루 소비량은 이만큼. 그럼 열흘은 버텨요. 열흘이면 폭풍이 지나가고도 남아요. 숫자는 안심을 만들어 줘요.' },
    { narr: '미호가 작성한 분배표 덕에 마을 사람들의 줄이 반으로 줄었다. 촌장님이 표를 보고 감탄했다. "자네, 마을에서 일해 볼 생각 없나?" 미호가 꼬리를 흔들며 사양했다.' },
    { goto: 'after_pick' }
  ],
  sat4_harvest_lia: [
    { show: 'lia', face: 'smile', pos: 'center' },
    { say: 'lia', text: '배고프면 불안해지니까. 따뜻한 걸 먹으면 괜찮아져. 자, 한 그릇씩 천천히 드세요.' },
    { narr: '리아가 국자를 들고 줄을 서 있는 사람들에게 한 명씩 수프를 건넸다. 노인들이 고맙다며 리아의 손을 꼭 쥐었다. 아이 한 명이 리아의 앞치마를 붙잡고 말했다. "누나, 안 무서워요."' },
    { goto: 'after_pick' }
  ]
});
