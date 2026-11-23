// ============================================================
//  에리온 낮 이벤트 6~10 (순서 이벤트, 12일~21일 무렵. 10번 '고백 직전'은 19일 이후) — 변장 과자 작전 / 촛불 마법 수업 / 방값 정산서 / 별 지도 / 책의 마지막 장
//  - 조건과 미리보기 글은 story/heroine-events.js 에 있습니다. 장면은 {set:{'ev.erion':1}} 로 시작하고 {goto:'after_pick'} 로 끝납니다.
//  - 4번(지붕 위 고백)에서 "봉인의 대가는 봉인지기의 이름과 기억"을 들은 뒤의 이야기입니다. 말투: 반말 · 츤데레 · "…" 이 많음.
// ============================================================
Object.assign(STORY.scenes, {

  // ================= 에리온 6: 변장 과자 작전 (12일부터, 하트 2칸) =================
  erion_6: [
    { set: { 'ev.erion': 1 } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '장터 골목 모퉁이에 챙이 한 뼘은 넓은 모자를 쓰고 목도리를 눈 밑까지 두른 사람이 서 있었다. 삐죽 튀어나온 귀 끝만 봐도 누군지 알겠다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…아는 척하지 마. 지금은 비밀 임무 중이야.' },
    { narr: '비밀 임무의 목표는 길 건너 꿀과자 가게였다. 진열대에 분홍색 설탕 과자가 반짝인다. 에리온의 시선이 그쪽으로 세 번 갔다가 두 번 도망쳤다.' },
    { say: 'erion', text: '왕도에서 학술원 사람들이 곧 온다는 소문이잖아. 엘프 마법사가 단 과자를 줄 서서 사는 걸 들키면, 학술원의 위신이 땅에 떨어져.' },
    { say: 'erion', face: 'angry', text: '…웃지 마. 위신 문제야. 마법사의 체면이라고.' },
    { narr: '그때 가게 앞에서 놀던 꼬마가 이쪽을 가리켰다. "엘프 누나다! 어제 사탕 열 개 사 간 누나죠? 오늘은 변장했네요!"' },
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…!! 열 개가 아니라 여덟 개야. 나머지 둘은… 연구용이었고.' },
    { narr: '꼬마가 눈을 반짝였다. 에리온의 귀 끝이 홍시처럼 빨개졌다. 모자 챙으로는 도저히 가려지지 않는다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…어떡해. 이제 이 마을에서 얼굴을 못 들겠어. …도와줘. 아니, 도와달라는 건 아니고, 조언을 구하는 거야.' },
    { choice: [
      { text: '"같이 줄 서요. 저도 하나 사고 싶었어요."', set: { 'aff.erion': 2 }, goto: 'erion_6_together' },
      { text: '"제가 대신 사 올게요. 모자는 벗어도 돼요."', cost: 6, set: { 'aff.erion': 2, 'flag.erion_sweets': true }, goto: 'erion_6_buy' },
      { text: '"위신보다 맛이 중요하죠. 당당하게 사요."', set: { 'aff.erion': 1 }, goto: 'erion_6_proud' }
    ] }
  ],
  erion_6_together: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…같이? 그럼 한 사람만 이상한 게 아니니까… 위험이 절반으로 줄어드네.' },
    { narr: '둘이 나란히 줄을 서자 에리온은 모자 챙을 슬쩍 올렸다. 꿀과자 하나를 받아 든 순간, 이 사람의 표정이 처음으로 눈에 띄게 풀렸다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…이건 연구 결과를 기록해야겠어. 결론: 설탕은 위대하다.' },
    { goto: 'after_pick' }
  ],
  erion_6_buy: [
    { narr: '꿀과자 한 봉지를 들고 돌아오자 에리온이 모자를 푹 눌러쓴 채 손을 내밀었다. 손가락이 살짝 떨렸다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…값은 나중에 줄게. 장부에 적어 둬. 아니, 적지 마. …적어도 돼. 어느 쪽이든 고마워.' },
    { narr: '한 입 베어 문 에리온의 눈이 가늘게 풀렸다. 이렇게 평온한 얼굴은 책을 펼쳤을 때도 본 적이 없다.' },
    { goto: 'after_pick' }
  ],
  erion_6_proud: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…당당하게. 그래, 엘프는 원래 당당한 종족이지. 가게에 들어가 고개를 들고 말하겠어. "이 분홍색을 전부."' },
    { narr: '진열대의 분홍 과자가 정말로 전부 에리온의 품에 안겼다. 가게 주인이 눈을 동그랗게 떴다. 이 마을 과자 가게의 이번 달 최고 매출이었다.' },
    { say: 'erion', face: 'surprised', text: '…너무 많이 샀나. 나눠 먹을래? 반만. 아니, 한 개만.' },
    { goto: 'after_pick' }
  ],

  // ================= 에리온 7: 촛불 마법 수업 (15일 무렵~, 하트 3칸) =================
  erion_7: [
    { set: { 'ev.erion': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '마당 한가운데 낡은 촛대가 놓여 있다. 그 앞에서 에리온이 푸른 책을 옆구리에 낀 채 팔짱을 끼고 서 있었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…오늘은 수업이야. 불씨 하나만 켜는 가장 쉬운 마법. 초보자도 사흘이면 한다고 하니까, 너라면 하루면 될 거야. 아마.' },
    { say: 'erion', text: '이유는 묻지 마. …그냥, 내가 없을 때 어두운 데서 불 하나 켤 줄은 알아야 하잖아.' },
    { narr: '말은 퉁명스러운데 촛대를 닦아 둔 흔적이 역력하다. 아침부터 준비한 모양이다.' },
    { say: 'erion', text: '손을 이렇게. 숨을 내쉬면서 마음속으로 작은 불꽃을 그려. 형태가 아니라 온기를.' },
    { narr: '시키는 대로 집중했다. 심지 끝이 파직, 하고 튀더니 불꽃 대신 연기가 폴폴 올랐다. 그리고 내 앞머리가 살짝 그을었다.' },
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '푸핫… 아니, 미안. 웃은 거 아니야. 연기가 예뻐서 감탄한 거야.' },
    { say: 'erion', face: 'smile', text: '…그래도 처음에 불씨를 만든 건 맞아. 소질이 있어. 인간치고는.' },
    { narr: '에리온이 한 걸음 다가와 내 손목을 가볍게 잡았다. 차가운 손가락이었는데 닿은 자리가 이상하게 따뜻했다.' },
    { cg: 'erion_spell' },
    { say: 'erion', face: 'shy', text: '…이렇게. 내 마력을 잠깐 빌려줄게. 느껴져? 너한테 흘러가는 거.' },
    { narr: '둘의 손 사이에서 작은 푸른 불꽃이 피어올랐다. 촛불 하나가 낮 마당을 은은하게 밝혔다.' },
    { cg: 'hide' },
    { choice: [
      { text: '"…따뜻해요. 에리온 같아요."', set: { 'aff.erion': 3, 'flag.erion_spell': true }, goto: 'erion_7_warm' },
      { text: '"이번에는 혼자 해 볼게요."', set: { 'aff.erion': 2, 'flag.erion_spell': true }, goto: 'erion_7_alone' },
      { text: '"앞머리 괜찮아요? 탔나요?"', set: { 'aff.erion': 1 }, goto: 'erion_7_hair' }
    ] }
  ],
  erion_7_warm: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…내 이름을 따뜻하다고 말한 사람은 처음이야. 보통은 차갑다고들 하는데.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…잊지 마. 이 불은 네 손에서 켜진 거야. 내가 없을 때도 켤 수 있어.' },
    { goto: 'after_pick' }
  ],
  erion_7_alone: [
    { narr: '손을 놓고 심호흡을 한 뒤 다시 집중했다. 심지가 다시 파직, 하더니 이번에는 쬐그만 불씨가 반짝 켜졌다. 한 번, 두 번 깜박이다 꺼졌지만.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…켜졌네. 정말로. 한 번이면 소질이고 두 번이면 실력이야. 내일도 해 보자.' },
    { goto: 'after_pick' }
  ],
  erion_7_hair: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…앞머리? 이쪽으로 고개 숙여 봐. 이 정도는 금방 고쳐.' },
    { narr: '에리온이 손끝으로 머리를 쓸자 그을린 끝이 말끔히 돌아왔다. 얼굴이 바로 코앞이라 숨을 쉬기도 어려웠다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…다 됐어. 바보 같은 질문이 마법보다 먼저 나오다니, 인간은 참.' },
    { goto: 'after_pick' }
  ],

  // ================= 에리온 8: 방값 정산서 (16일부터, 하트 3칸) =================
  erion_8: [
    { set: { 'ev.erion': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 구석 탁자에서 에리온이 종이에 깨알 같은 글씨를 쓰고 있었다. 제목이 또렷하다. "방값 정산서".' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…마침 잘 왔어. 서명해 줘. 내가 지금까지 밀린 방값이 삼십 일 치, 마법 수리비 공제가 열두 건, 차 값 외상이 일곱 잔.' },
    { narr: '정산서는 놀랍도록 정확했다. 밀린 방값 아래 "공제"가 이어지고 마지막 줄은 이렇게 끝난다. "잔액은 본인 사후 이 책 세 권으로 대신함."' },
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '내가 돌아오지 못해도 외상은 남기지 않을 거야. 엘프는 빚을 지고 가지 않아.' },
    { say: 'erion', text: '…웃지 마. 진지해. 이 책들 값이 얼마인지 알아? 왕도 경매에 나오면 이 여관 한 채는 사.' },
    { narr: '농담처럼 말하지만 펜을 쥔 손끝이 하얗다. 하루하루 봉인이 다가올수록 에리온은 이런 식으로 짐을 하나씩 내려놓고 있는 것이다.' },
    { say: 'erion', face: 'sad', text: '…나는 이게 편해. 숫자는 감정이 없으니까. 그런데 이상하게, 이 줄만 쓸 때 계속 틀려.' },
    { choice: [
      { text: '정산서를 반으로 찢는다. "돌아와서 직접 내요."', set: { 'aff.erion': 3, 'flag.erion_promise': true }, goto: 'erion_8_tear' },
      { text: '"좋아요. 대신 조건이 있어요. 외상 차 값은 제일 먼저 갚기."', set: { 'aff.erion': 2 }, goto: 'erion_8_deal' },
      { text: '"책 세 권은 필요 없어요. 에리온이 읽어 줘요."', set: { 'aff.erion': 2 }, goto: 'erion_8_read' }
    ] }
  ],
  erion_8_tear: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '!? 그건 열두 장짜리 명문서야! …그걸 찢어? 제정신이야?' },
    { narr: '찢어진 종이가 팔랑거리며 바닥으로 떨어졌다. 에리온은 한참 동안 그 조각을 내려다보았다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…좋아. 그럼 계산은 다시 해야겠네. 이번에는 돌아오는 걸로 가정하고. …숫자가 훨씬 어렵군.' },
    { goto: 'after_pick' }
  ],
  erion_8_deal: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…차 값부터. 합리적인 조건이야. 인간 장부 방식도 나쁘지 않네.' },
    { narr: '에리온은 정산서 맨 위에 "차 값 외상, 우선 변제"라고 덧붙였다. 마지막 줄의 "사후"라는 글자는 슬쩍 줄을 그어 지웠다.' },
    { goto: 'after_pick' }
  ],
  erion_8_read: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…내가? 낭독을 하라고? 책 세 권을?' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…밤마다 한 장씩이라면. 그 정도 시간이면 돌아올 때까지 기다릴 이유는 충분하네.' },
    { narr: '에리온이 정산서를 접어 책갈피로 끼워 넣었다. 그날의 서명란은 끝내 비어 있었다.' },
    { goto: 'after_pick' }
  ],

  // ================= 에리온 9: 별 지도 (18일부터, 하트 4칸) =================
  erion_9: [
    { set: { 'ev.erion': 1 } }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '낮인데 하늘이 낮게 어둡다. 지붕 위에서 에리온이 푸른 책 사이에 끼워 둔 얇은 지도를 펼쳐 보이고 있었다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…올라와. 오늘은 별이 안 보이지만, 지도로는 볼 수 있으니까. 이건 우리 숲의 별자리 지도야.' },
    { say: 'erion', text: '이쪽이 스승님의 별. 이쪽이 내 별. 엘프는 태어난 날 별 하나를 받아. 죽으면 그 별이 이름 없이 하늘에 남지.' },
    { narr: '지도 한쪽 귀퉁이에 작은 별 하나가 빈 동그라미로 그려져 있다. 이름이 쓰여 있었을 칸은 지워져 있다.' },
    { say: 'erion', face: 'sad', text: '…나는 이 별이 누구 건지 이제 몰라. 봉인이 끝나면 내 별도 이렇게 되겠지.' },
    { narr: '에리온은 지도 위에 손을 얹었다. 숨을 한 번 고르는 소리가 났다.' },
    { say: 'erion', face: 'normal', text: '부탁 하나만 할게. 내가 만약 모든 걸 잊으면 이 문장을 나한테 말해 줘. 푸른 책의 첫 줄이야.' },
    { say: 'erion', text: '"잊어도 괜찮아. 돌아올 곳은 있어."' },
    { narr: '말해 놓고 에리온의 귀가 새빨개졌다. 바람이 불지 않는데도 머리카락이 흔들렸다.' },
    { say: 'erion', face: 'shy', text: '…웃지 마. 이건 유언이 아니라 열쇠야. 부탁이야.' },
    { choice: [
      { text: '문장을 소리 내어 따라 말한다. 한 글자도 틀리지 않게.', set: { 'aff.erion': 3, 'flag.erion_pact': true }, goto: 'erion_9_say' },
      { text: '"받아 적을게요. 그리고 책상 앞에 붙여 둘게요."', set: { 'aff.erion': 2, 'flag.erion_pact': true }, goto: 'erion_9_write' },
      { text: '"그 문장은 에리온이 직접 말해 줘요. 내가 잊게 되면요."', set: { 'aff.erion': 2 }, goto: 'erion_9_swap' }
    ] }
  ],
  erion_9_say: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…한 글자도 안 틀렸네.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '됐어. 이제 이 열쇠는 내 것이 아니라 우리 것이야. …기억해 줄 사람이 있다는 건 이런 기분이구나.' },
    { goto: 'after_pick' }
  ],
  erion_9_write: [
    { narr: '품에서 꺼낸 영수증 뒷면에 문장을 또박또박 적었다. 에리온이 옆에서 맞춤법을 하나하나 확인했다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '"괜찮"의 받침이 틀렸어. …이건 틀려도 돼. 틀린 글씨도 네 글씨니까.' },
    { goto: 'after_pick' }
  ],
  erion_9_swap: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…내가? 너한테? 그건… 생각해 본 적 없어.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…그래, 서로 잊으면 서로에게 말해 주면 되는 거네. 계약은 쌍방. 나쁘지 않아.' },
    { goto: 'after_pick' }
  ],

  // ================= 에리온 10: 책의 마지막 장 (19일부터, 하트 5칸 · 고백 직전. 21일 밤 '고백의 밤'으로 이어짐) =================
  erion_10: [
    { set: { 'ev.erion': 1 } }, { bg: 'inn_front' }, { hide: 'all' },
    { narr: '해 질 녘 마당에 에리온이 서 있었다. 푸른 책을 가슴에 안은 채, 이쪽을 보더니 숨을 크게 들이쉬었다. 결심한 사람의 얼굴이다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…마침 잘 왔어. 아니, 기다렸어. 하고 싶은 말이 있어. 하지만 오늘은 끝까지 못 해. 먼저 이걸 보여 줄게.' },
    { narr: '에리온이 책을 펼쳤다. 맨 뒷장. 빈 칸이던 곳에 방금 쓴 듯한 첫 글자가 파랗게 빛나고 있다. 내 이름의 첫 글자와 닮았다.' },
    { say: 'erion', text: '스승님의 이름 자리는 비었어. 이 자리에는 다른 걸 적고 싶어. 봉인에 이름을 바치는 순서가 오면, 그 전에 한 줄만.' },
    { cg: 'erion_eve' },
    { say: 'erion', face: 'shy', text: '…좋아한다고 하면 모든 게 끝나 버릴 것 같았어. 사라질 사람이 마음을 남기면 남은 사람이 아프니까.' },
    { say: 'erion', text: '그런데 오늘 아침 눈을 뜨고 알았어. 말하지 않고 사라지는 쪽이 훨씬 아프다는 걸.' },
    { narr: '바람에 은빛 머리카락이 흩날렸다. 에리온의 눈동자가 흔들렸지만 시선은 피하지 않았다.' },
    { say: 'erion', face: 'normal', text: '봉인이 끝나고 내가 여기 서 있으면, 그때 끝까지 말할게. 마음의 이름이 뭔지. 그러니까 그때까지 대답은 보류야.' },
    { cg: 'hide' },
    { choice: [
      { text: '"기다릴게요. 그날은 제가 먼저 차를 끓여 놓을게요."', set: { 'aff.erion': 3, 'flag.erion_eve': true }, goto: 'erion_10_wait' },
      { text: '"먼저 말해도 돼요? 저도 하고 싶은 말이 있어요."', set: { 'aff.erion': 2, 'flag.erion_eve': true }, goto: 'erion_10_first' },
      { text: '"돌아와요. 이름을 다시 지어서라도 부를 테니까."', set: { 'aff.erion': 3, 'flag.erion_eve': true }, goto: 'erion_10_name' }
    ] }
  ],
  erion_10_wait: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…달지 않은 차로 부탁해. 아니, 한 스푼만. 아니, 두 스푼.' },
    { narr: '에리온은 책을 닫고 가슴에 안았다. 책에서 번지는 푸른 빛이 처음으로 노을색과 섞였다.' },
    { goto: 'erion_10_end' }
  ],
  erion_10_first: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '!! 안 돼. 지금 들으면 나는 정말 아무것도 못 하게 돼. 그건… 비겁하지만, 그래도 안 돼.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '그러니까 부탁이야. 입 안에 잘 담아 둬. 내가 돌아오는 날 꺼내 줘.' },
    { goto: 'erion_10_end' }
  ],
  erion_10_name: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…이름을 다시 지어서 부른다고? 그건 엘프에게는 평생의 약속이야. 알고 하는 말이지?' },
    { narr: '대답 대신 고개를 끄덕였다. 에리온이 얼굴을 가렸다. 손가락 사이로 보이는 입가가 파르르 떨렸다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…바보. 그런 말은 좀 더 일찍 하지 그랬어. 아니, 지금이 딱 맞아.' },
    { goto: 'erion_10_end' }
  ],
  // 이벤트 10 마무리: 21일 이전이면 '고백의 밤' 암시, 21일이 지났는데 루트 미확정이면 그 자리에서 고백할 기회
  erion_10_end: [
    { if: 'day>21 && !flag.route', goto: 'erion_10_late' },
    { if: 'day<=21 && !flag.route', goto: 'erion_10_hint' },
    { goto: 'after_pick' }
  ],
  erion_10_hint: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…참, 일요일 밤. 마을 사람들이 다 같이 별을 보는 밤이잖아. 시간 비워 둬. 별 때문이야. …별 때문만은 아닐 수도 있고.' },
    { narr: '말을 마치자마자 에리온은 책으로 얼굴을 반쯤 가리고 총총 건물 안으로 사라졌다. 은빛 머리카락 사이로 귀 끝만 빨갛게 남아 있었다.' },
    { goto: 'after_pick' }
  ],
  erion_10_late: [
    { show: 'erion', face: 'normal' },
    { narr: '돌아서려던 에리온이 문득 걸음을 멈췄다. 책을 안은 팔에 힘이 들어가 있다. 고백의 밤은 이미 지나갔다. 그래도 지금 하지 않으면 영영 못 할 말이 있다.' },
    { say: 'erion', face: 'shy', text: '…방금 한 말, 반만 취소할게. 보류라고 했지만… 네가 먼저 하고 싶은 말이 있다면, 지금 들어 줄 수도 있어. …들어 줄 수도 있다는 거야!' },
    { choice: [
      { text: '"에리온, 좋아해요. 지금 대답해 줘요."', set: { 'aff.erion': 1 }, goto: 'route_erion_confess' },
      { text: '"…아직은 아니에요. 봉인이 끝나면요."', goto: 'erion_10_notyet' }
    ] }
  ],
  erion_10_notyet: [
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…그래. 약속이니까. 대신 늦으면 이자 붙는다.' },
    { goto: 'after_pick' }
  ]
});
