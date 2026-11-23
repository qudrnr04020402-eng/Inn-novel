// ============================================================
//  에리온 루트 — 21일 '고백의 밤'에 고백을 받아 준 뒤의 이야기
//  - route_erion_confess : 고백 장면 (루트 확정)
//  - route_erion_1~3     : 4주차 루트 전용 이벤트 (22일 / 24일 / 26일). ROUTE_EVENTS.erion 에 등록
//  - route_erion_epi     : 결전 다음 날 새벽 에필로그 -> end_erion
//  - 말투: 반말 · 츤데레 · "…" 이 많음. 봉인지기의 대가는 이름과 기억. 연인이 된 뒤에도 "좋아해"라는 말은 끝내 아끼다가 엔딩(end_erion)에서 처음 한다.
// ============================================================
window.ROUTE_EVENTS = window.ROUTE_EVENTS || {};
ROUTE_EVENTS.erion = [
  { id: 'route_erion_1', scene: 'route_erion_1', minDay: 22, text: '식당 구석에서 종이에 뭔가를 적다가 이쪽을 보고 황급히 가린다. 제목이 "연인 규칙표"인 것 같다.' },
  { id: 'route_erion_2', scene: 'route_erion_2', minDay: 24, text: '지붕 위에서 푸른 책을 무릎에 올려 두고 있다. 오늘따라 책의 빛이 불안하게 깜박인다.' },
  { id: 'route_erion_3', scene: 'route_erion_3', minDay: 26, text: '꿀과자 봉지 두 개를 든 채 마당 문 앞에서 서성인다. 마을 산책에 같이 가자는 눈치다.' }
];

Object.assign(STORY.scenes, {

  // ================= 고백: 별을 보는 밤 =================
  route_erion_confess: [
    { bg: 'roof_night' }, { hide: 'all' },
    { narr: '지붕 위에는 벌써 먼저 올라온 사람이 있었다. 푸른 책을 무릎에 올려 둔 채, 별도 보지 않고 자기 손끝만 내려다보고 있다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…왔네. 별 보러 온 거지? 그럼 위를 봐야지. 왜 나를 봐.' },
    { narr: '대답하지 않고 옆자리에 앉았다. 에리온이 슬쩍 책을 끌어당겨 둘 사이의 거리를 한 뼘 줄였다가, 들킨 줄 알고 도로 반 뼘 늘렸다.' },
    { say: 'erion', text: '…할 말 있는 얼굴이야. 알아. 나는 사람 얼굴 읽는 건 못 하지만, 네 얼굴은 책보다 쉬워.' },
    { narr: '밤바람이 은빛 머리카락을 흔들었다. 멀리 마을에서 작은 노랫소리가 올라온다. 숨을 한 번 들이쉬었다.' },
    { choice: [
      { text: '"에리온, 좋아해요. 사라질 사람이어도, 이름을 잃어도 상관없어요."', set: { 'aff.erion': 3 }, goto: 'route_erion_confess_a' },
      { text: '"방값은 평생 밀려도 좋으니까, 제 옆에 있어 줘요."', set: { 'aff.erion': 2 }, goto: 'route_erion_confess_b' },
      { text: '"같이 별을 보고 싶은 사람이 에리온이에요. 앞으로도 쭉."', set: { 'aff.erion': 2 }, goto: 'route_erion_confess_c' }
    ] }
  ],
  route_erion_confess_a: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…!' },
    { narr: '에리온이 숨을 멈췄다. 책 위에 올려 둔 손가락이 푸른 빛과 함께 파르르 떨린다.' },
    { say: 'erion', text: '"상관없다"니. 그건 틀렸어. 이름은 상관있어. 나한테는 네가 불러 주는 게 제일 상관있는 일이야.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…그래서 틀린 건 고쳐 줄게. 사라지지 않을 거야. 사라질 생각 없어졌어. 너 때문에. …책임져.' },
    { goto: 'route_erion_confess_end' }
  ],
  route_erion_confess_b: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…이, 이 타이밍에 방값 얘기를 하는 거야? 지금?' },
    { narr: '에리온이 입술을 꾹 깨물었다. 어깨가 들썩이더니, 결국 웃음이 터져 나왔다. 처음 듣는 크고 맑은 소리였다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…푸핫. 아, 진짜. 정산서에 이런 항목은 없었는데. "평생 연체 허용"이라니, 미친 조건이야. …받아들일게.' },
    { goto: 'route_erion_confess_end' }
  ],
  route_erion_confess_c: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…같이 별을. 쭉.' },
    { narr: '에리온이 하늘을 올려다보았다. 별이 총총한데도 눈에는 별 대신 다른 것이 비치는 것 같았다.' },
    { say: 'erion', text: '엘프는 태어난 날 별을 받는다고 했잖아. …내 별 옆에 하나 더 놓아도 될까. 이름은 네가 지어 줘.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '아, 오늘 말고! 오늘은 심장이 시끄러워서 아무 이름도 못 지어!' },
    { goto: 'route_erion_confess_end' }
  ],
  route_erion_confess_end: [
    { narr: '한참 아무 말도 없었다. 에리온이 책 위에 얹은 손을 슬그머니 옆으로 옮겼다. 내 손등과 손끝이 닿았다. 서로 모른 척하는 데 성공했다고 생각하는 얼굴이었다.' },
    { say: 'erion', face: 'shy', text: '…대답은, 한 번만 할 거야. "좋아한다"는 말은 아직 입에 안 붙어서. 그건 나중에, 제대로 된 날에 할게.' },
    { say: 'erion', face: 'normal', text: '지금은 이것만. …네 마음, 받았어. 책에도 적어 둘게. 지워지지 않게 첫 줄에.' },
    { narr: '둘의 손이 천천히 포개졌다. 에리온의 손은 차가웠는데, 포갠 곳부터 따뜻해졌다. 푸른 책이 무릎 위에서 반딧불처럼 은은하게 숨을 쉬었다.' },
    { set: { 'flag.route': true, 'flag.route_erion': true } },
    { hide: 'all' },
    { if: 'flag.cf_night', goto: 'cf_after' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 1 (22일): 연인 규칙표 =================
  route_erion_1: [
    { set: { 'ev.r_erion': 1 } }, { bg: 'inn_day' }, { hide: 'all' },
    { narr: '식당 구석 탁자에 에리온이 앉아 있었다. 어제까지는 밀린 방값 정산서를 쓰던 자리다. 오늘은 종이 맨 위에 제목이 다르다. 내가 다가가자 팔로 종이를 확 덮었다.' },
    { show: 'erion', face: 'surprised', pos: 'center' },
    { say: 'erion', text: '!! 아, 아무것도 아니야. 숙제야. 학술원 때 못 낸 숙제.' },
    { narr: '팔 밑으로 삐져나온 글씨가 보였다. "연인 규칙표 (초안 제7판)". 판이 일곱 개다. 밤새 고쳐 쓴 모양이다.' },
    { say: 'erion', face: 'shy', text: '…봤지. 봤네. 아, 몰라. 어차피 말해야 했어. 나는 이런 거 처음이니까, 기준이 있어야 편해.' },
    { say: 'erion', face: 'normal', text: '제1조. 서로 이름을 부를 때는 또박또박. 제2조. 갑자기 손잡기 금지. 예고하고 잡을 것. 제3조… 이건 안 읽어도 되겠다.' },
    { narr: '제3조가 궁금해서 종이를 뽑으려 하자 에리온이 필사적으로 막았다. 그 와중에 잉크병이 쓰러졌고, 푸른 잉크가 우리 둘의 손에 똑같이 묻었다.' },
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…똑같은 색이 묻었네. 이거, 이틀은 안 지워지는 잉크인데.' },
    { say: 'erion', face: 'smile', text: '…뭐, 규칙에는 없지만 이건 허용해 줄게. 증거가 남는 건 나쁘지 않아.' },
    { narr: '손을 맞대 보니 파란 얼룩의 모양이 신기하게 닮아 있었다. 에리온은 그 손을 한참 내려다보다가, 규칙표 맨 아래에 새 줄을 써넣었다.' },
    { say: 'erion', text: '"제12조. 규칙은 언제든 둘이서 고칠 수 있다." …이게 제일 중요한 조항이야.' },
    { choice: [
      { text: '"제2조부터 고쳐요. 지금 손 잡을게요. 예고했어요."', set: { 'aff.erion': 3, 'flag.erion_rule': true }, goto: 'route_erion_1_hand' },
      { text: '"제3조, 소리 내서 읽어 줘요."', set: { 'aff.erion': 2 }, goto: 'route_erion_1_read' },
      { text: '"제13조를 제안해요. 매일 한 번은 달콤한 걸 같이 먹기."', set: { 'aff.erion': 2 }, goto: 'route_erion_1_sweet' }
    ] }
  ],
  route_erion_1_hand: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '예고… 했어. 했네. 그럼 규칙 위반은 아니야. 아니지. 맞아.' },
    { narr: '푸른 잉크가 묻은 두 손이 포개졌다. 에리온은 눈을 이리저리 굴리다가, 결국 손가락을 천천히 깍지 끼는 쪽으로 움직였다.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…제2조는 폐지야. 대신 새 조항을 넣자. "예고는 생략 가능, 단 도망은 불가".' },
    { goto: 'after_pick' }
  ],
  route_erion_1_read: [
    { show: 'erion', face: 'angry' },
    { say: 'erion', text: '싫어! 절대 싫어! …진짜 읽으라고? 후회하지 마.' },
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '"제3조. 서로가 보지 않을 때는… 그, 조금 더 많이 생각해도 된다." …이게 다야. 웃지 마. 웃으면 이 종이 태워 버릴 거야.' },
    { narr: '웃지 않으려고 입술을 깨무느라 꽤 고생했다. 에리온의 귀 끝은 이미 종이보다 붉었다.' },
    { goto: 'after_pick' }
  ],
  route_erion_1_sweet: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…매일? 그건… 건강에 해롭지 않을까. 아니, 연구 목적이라면 정당화가 되지.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '제13조 통과. 단, 분홍색은 내가 먼저 고르는 걸로. 그리고 마지막 한 입은 네가 먹어. …반드시.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 2 (24일): 불길한 징조, 책이 우는 밤 =================
  route_erion_2: [
    { set: { 'ev.r_erion': 1 } }, { bg: 'roof_night' }, { hide: 'all' },
    { narr: '불길한 징조가 마을을 훑고 지나간 날이었다. 우물이 한 번 파랗게 빛났고, 개들이 한꺼번에 뒷산을 향해 짖었다. 해가 지자 지붕 위에서 푸른 불빛이 깜박이는 것이 보였다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…올라왔어? 아직 안 자네. 아니, 내가 시끄러웠나. 책이 이상해.' },
    { narr: '무릎 위의 푸른 책이 숨 쉬듯 빛나다가 갑자기 꺼지고, 다시 켜지기를 반복했다. 에리온이 책 표지를 손바닥으로 눌렀다. 달래는 손길이었다.' },
    { say: 'erion', text: '봉인이 가까워지니까 책이 먼저 알아. 대가를 치를 때가 오고 있다는 걸. …내 이름이 걸린 일이라서, 이 녀석도 무서운가 봐.' },
    { show: 'erion', face: 'sad' },
    { say: 'erion', text: '나는 안 무섭다고 말해 왔는데. 사실은 어제부터 계속 내 이름을 소리 내어 연습해. 잊어버리기 전에 많이 불러 두려고. 바보 같지?' },
    { narr: '그녀가 작은 목소리로 자기 이름을 불렀다. 한 번, 두 번, 세 번. 이름은 아름다웠지만 부르는 목소리는 자꾸 가늘어졌다.' },
    { say: 'erion', text: '…예전에는 이름을 잃는 게 무서워서 아무하고도 안 가까워지려고 했는데. 지금은 이상한 게 무서워. 이름은 잊어도, 네 얼굴은 잊고 싶지 않다는 거.' },
    { say: 'erion', face: 'shy', text: '…부탁이 아니야. 질문이야. 내가 이름을 잃은 날, 네가 내 이름을 대신 불러 줄 수 있어? 하루에 한 번만이라도.' },
    { choice: [
      { text: '"하루에 백 번도 불러 줄게요. 에리온. 에리온. 에리온."', set: { 'aff.erion': 3, 'flag.erion_name': true }, goto: 'route_erion_2_call' },
      { text: '"그 대신 에리온은 내 얼굴을 잊어도, 내가 에리온이 누군지 매일 얘기해 줄게요."', set: { 'aff.erion': 3, 'flag.erion_name': true }, goto: 'route_erion_2_story' },
      { text: '말없이 어깨를 빌려준다. 책의 빛이 잦아들 때까지.', set: { 'aff.erion': 2 }, goto: 'route_erion_2_shoulder' }
    ] }
  ],
  route_erion_2_call: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…백 번은 너무 많아! 그러다 이름이 닳아 버리면 어떡해!' },
    { narr: '그렇게 말했지만 에리온은 귀를 막지 않았다. 열 번쯤 불렀을 때 표정이 변했다. 같은 이름인데도 내 목소리로 들으면 다른 것 같다고, 그녀가 작게 중얼거렸다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…내 입으로 부를 때는 무섭던 이름인데. 네가 부르면, 누군가 불러 주는 이름이 된다. 그건 잃어도 돌아올 수 있다는 거네.' },
    { goto: 'route_erion_2_end' }
  ],
  route_erion_2_story: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…나에 대해서? 내가 누군지를?' },
    { narr: '손가락을 꼽으며 말했다. 변장하고 과자를 사는 사람. 불꽃 대신 연기를 올려 놓고 연기가 예쁘다고 우기는 사람. 방값 정산서를 열두 장이나 쓰는 사람.' },
    { say: 'erion', face: 'angry', text: '…다, 다 안 좋은 것만 말하고 있잖아! 그건 놀리는 거야!' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…그래도, 전부 나였네. 그렇게 적어서 줘. 이름은 잊어도 그 목록을 읽으면 돌아올 수 있을 것 같아.' },
    { goto: 'route_erion_2_end' }
  ],
  route_erion_2_shoulder: [
    { narr: '말없이 곁에 앉았다. 에리온은 한참 뻣뻣하게 앉아 있다가, 책의 빛이 한 번 더 꺼진 순간에 슬며시 머리를 기울였다. 어깨가 무겁지 않았다. 새털처럼 가벼운 무게였다.' },
    { say: 'erion', face: 'shy', text: '…이건 규칙 제2조 위반이야. 예고도 안 했어. 그러니까, 오늘만 특별히 눈감아 줄게.' },
    { narr: '책의 빛이 천천히 잦아들었다. 에리온의 숨소리가 고르게 변했다. 잠든 것 같지는 않은데, 아무 말도 하지 않는 것으로 대답을 대신하고 있었다.' },
    { goto: 'route_erion_2_end' }
  ],
  route_erion_2_end: [
    { show: 'erion', face: 'normal' },
    { narr: '푸른 책이 마침내 안정된 빛을 되찾았다. 에리온이 책 맨 뒷장을 펼쳐 빈 칸 위에 짧은 한 줄을 적었다. 내가 읽으려 하자 책을 덮어 버렸다.' },
    { say: 'erion', text: '…봉인이 끝나기 전에는 안 보여 줄 거야. 끝난 뒤에 보여 줄게. 그러니까, 그 전에 사라지면 안 돼. 둘 다.' },
    { goto: 'after_pick' }
  ],

  // ================= 루트 3 (26일): 폭풍 전 산책 =================
  route_erion_3: [
    { set: { 'ev.r_erion': 1 } }, { bg: 'square_day' }, { hide: 'all' },
    { narr: '이틀 뒤면 폭풍이 온다. 마을은 서둘러 덧문을 달고 항아리를 안으로 들이고 있었다. 그 소란 속에 에리온이 꿀과자 봉지 두 개를 든 채 마당 문 앞에서 왔다 갔다 하고 있다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…마침 시간 있어 보이네. 아, 아니 있어야 해. 연구 때문에 마을 시장 동선을 조사해야 해서. 혼자는 효율이 떨어지거든.' },
    { narr: '봉지 하나를 내밀면서 눈은 딴 데를 보고 있다. 봉지 안에는 분홍 꿀과자가 정확히 두 개씩 들어 있었다. 짝수라는 것이, 처음부터 둘이 먹을 생각이었다는 증거다.' },
    { say: 'erion', face: 'shy', text: '…웃지 마. 개수는 우연이야.' },
    { narr: '둘이 나란히 장터를 걸었다. 에리온은 일부러 반 걸음 앞에서 걷다가, 사람이 몰리는 모퉁이에서 슬쩍 걸음을 늦춰 내 소매 끝을 잡았다. 예고 없이. 규칙 위반이다.' },
    { say: 'erion', face: 'surprised', text: '!! 이, 이건 사고야. 인파 때문에. 손이 미끄러져서.' },
    { narr: '소매 대신 손을 내밀자 에리온은 한참 노려보다가, 아주 작게 한숨을 내쉬고 그 손을 잡았다. 따뜻했다. 이제는 손이 차갑다는 말이 틀렸다.' },
    { say: 'erion', face: 'smile', text: '…걷는 건 나쁘지 않네. 이 마을은 작아서 한 바퀴가 금방이야. 그런데 오늘은 이상하게, 길어 보여.' },
    { if: 'flag.erion_promise', goto: 'route_erion_3_bill' },
    { goto: 'route_erion_3_ask' }
  ],
  // 8번 이벤트에서 정산서를 찢었던 경우의 덤
  route_erion_3_bill: [
    { narr: '장터 끝 좌판 앞에서 에리온이 걸음을 멈췄다. 품에서 접힌 종이를 꺼냈다. 찢어졌다가 투명한 접착 풀로 정성스레 붙인 흔적이 있는 "방값 정산서"였다.' },
    { say: 'erion', face: 'normal', text: '…네가 찢어 줬던 거. 다시 붙였어. 돌아와서 직접 내라고 했잖아. 그러니까 이건 아직 유효해.' },
    { say: 'erion', face: 'shy', text: '마지막 줄은 고쳤어. "잔액은 본인 사후 이 책 세 권으로" 대신… "잔액은 본인이 평생 갚음". 괜찮지?' },
    { goto: 'route_erion_3_ask' }
  ],
  route_erion_3_ask: [
    { narr: '꿀과자를 하나씩 나눠 먹으며 광장 분수 곁에 앉았다. 하늘 한쪽에서 먹구름이 낮게 깔리기 시작했다. 에리온은 그것을 보며 한동안 말이 없었다.' },
    { say: 'erion', face: 'normal', text: '…있잖아. 이틀 뒤 동굴에서 내가 이름을 바치는 순간이 오면, 아마 내가 내 입으로 말하는 마지막 말이 될 수도 있어.' },
    { say: 'erion', text: '그래서 지금 물어볼게. 네가 듣고 싶은 말이 있어? 이름을 잃기 전에, 미리 말해 둘 수 있는 걸로.' },
    { choice: [
      { text: '"…돌아와서 하는 말이 듣고 싶어요. 오늘은 아무 말도 안 해도 돼요."', set: { 'aff.erion': 3, 'flag.erion_wait': true }, goto: 'route_erion_3_wait' },
      { text: '"그럼 하나만요. 내 이름을 한 번만 불러 줘요."', set: { 'aff.erion': 3, 'flag.erion_wait': true }, goto: 'route_erion_3_name' },
      { text: '"분홍 과자 마지막 한 입, 같이 나눠 먹어요."', set: { 'aff.erion': 2 }, goto: 'route_erion_3_share' }
    ] }
  ],
  route_erion_3_wait: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…그걸 듣고 싶다고? 그럼 나는 돌아올 수밖에 없잖아. 그런 협박은 반칙이야.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…좋아. 약속. 이건 계약서 없이 하는 첫 약속이야. 책임은 네가 져.' },
    { goto: 'route_erion_3_end' }
  ],
  route_erion_3_name: [
    { show: 'erion', face: 'shy' },
    { say: 'erion', text: '…이름? 지금? 여기서?' },
    { narr: '에리온이 분수 물소리에 섞일 만큼 작게 내 이름을 불렀다. 한 글자씩 아끼듯이. 이름이 이렇게 귀한 소리였던가, 하고 새삼 놀랐다.' },
    { say: 'erion', face: 'normal', text: '…한 번은 해 줬으니까, 나머지는 돌아와서 할게. 이자 붙여서. 열 번쯤.' },
    { goto: 'route_erion_3_end' }
  ],
  route_erion_3_share: [
    { show: 'erion', face: 'surprised' },
    { say: 'erion', text: '…나눠 먹자고? 반으로? 이건 한 개가 아니라 반 개가 되는 건데.' },
    { narr: '꿀과자를 반으로 쪼개자 에리온은 큰 쪽을 내 손에 올려놓고 작은 쪽을 입에 넣었다. 들키지 않은 줄 알았겠지만, 큰 쪽을 건넬 때 얼굴이 이미 빨개져 있었다.' },
    { show: 'erion', face: 'smile' },
    { say: 'erion', text: '…달다. 이제 이 맛은 오늘 날짜랑 같이 기억할래. 잊어도, 이 맛이 알려 줄 수 있게.' },
    { goto: 'route_erion_3_end' }
  ],
  route_erion_3_end: [
    { narr: '해가 기울 때까지 둘은 손을 잡은 채 마을 길을 천천히 돌았다. 돌아오는 길에 에리온이 문득 멈춰 서서, 하늘에 번지기 시작한 별 몇 개를 올려다보았다.' },
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…내 별 옆에 네 별이 떠 있으면 좋겠다. 아직 이름을 못 지었지만, 그건 이번 일이 끝나면 정해 줘.' },
    { goto: 'after_pick' }
  ],

  // ================= 에필로그: 결전 다음 날 새벽 =================
  route_erion_epi: [
    { bgm: 'ending_good' },
    { bg: 'inn_dawn' }, { hide: 'all' },
    { narr: '결전 다음 날, 새벽. 동굴에서 돌아와 눈을 붙인 것은 겨우 두 시간. 문틈으로 들어온 푸른빛에 눈을 떴다.' },
    { show: 'erion', face: 'normal', pos: 'center' },
    { say: 'erion', text: '…일어났어? 아니, 깨우려던 건 아니야. 그냥 문 앞에 서 있었어. 한 시간쯤.' },
    { narr: '에리온은 푸른 책을 가슴에 안고 있었다. 눈 밑에 그늘이 있었지만 눈동자는 그 어느 때보다 맑게 빛났다.' },
    { say: 'erion', text: '…확인하고 싶었어. 일어나자마자 내 이름을 불러 봤는데, 안 사라졌더라. 한 글자도.' },
    { say: 'erion', face: 'shy', text: '그런데 이상하게, 그걸 확인하자마자 제일 먼저 하고 싶은 일이 뭐였는지 알아? …네 얼굴 보는 거였어. 기억하는지 확인하고 싶어서.' },
    { narr: '그녀는 한 걸음 가까이 다가와 올려다보았다. 서로의 숨이 닿는 거리에서 눈을 깜박였다.' },
    { say: 'erion', face: 'smile', text: '…기억나. 전부. 변장 과자도, 정산서도, 지붕 위에서 한 약속도. 네가 가장 먼저 한 말도.' },
    { if: 'ev.r_erion>=3', goto: 'route_erion_epi_3' },
    { if: 'ev.r_erion>=1', goto: 'route_erion_epi_1' },
    { goto: 'route_erion_epi_end' }
  ],
  route_erion_epi_3: [
    { say: 'erion', face: 'shy', text: '규칙표 제12조도 지키고 있어. 고칠 일이 있으면 둘이서. 그러니까 오늘은 하나 고치고 싶은데, 괜찮아?' },
    { narr: '품에서 꺼낸 종이에는 잉크가 마르지 않은 새 조항이 적혀 있었다. "제1조. 이름 부르기. 매일, 또박또박. 평생 연장 가능."' },
    { goto: 'route_erion_epi_end' }
  ],
  route_erion_epi_1: [
    { say: 'erion', face: 'shy', text: '…규칙표는 아직 미완성이야. 마지막 조항은 아직 못 정했어. 그건 오늘 밤에 정할 거야.' },
    { goto: 'route_erion_epi_end' }
  ],
  route_erion_epi_end: [
    { show: 'erion', face: 'normal' },
    { say: 'erion', text: '…그, 지붕에서 네가 나한테 마음을 말해 줬던 밤 말이야. 그때 나는 "받았다"고만 했지.' },
    { say: 'erion', text: '"좋아한다"는 말은 아직 못 했어. 입에 안 붙어서가 아니야. 제대로 된 순서로 하고 싶어서. 봉인이 끝난 뒤에, 책의 마지막 장에 쓰고 나서.' },
    { narr: '에리온이 책을 열었다. 맨 뒷장은 아직 비어 있다. 하지만 그 빈칸은 이제 더 이상 쓸쓸해 보이지 않았다. 아침 햇살을 기다리는 종이처럼 보였다.' },
    { say: 'erion', face: 'shy', text: '오늘 밤. 마을 잔치가 끝나면 지붕으로 와. 올 때까지 기다릴 테니까. …안 오면 방값에 이자 붙인다.' },
    { narr: '말을 마친 에리온이 얼굴을 돌렸다. 귀 끝에 새벽빛이 걸려 있었다. 오늘 하루가 이렇게 길 것이라고는 생각하지 못했다. 그리고 이렇게 설렐 줄도.' },
    { goto: 'end_erion' }
  ]
});
