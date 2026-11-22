// ============================================================
//  BGM 정의 — 트랙 id -> 음악 파일
//  - 스크립트에서 {bgm:'inn_day'} 로 틀고 {bgm:'stop'} 으로 멈춥니다. (효과음은 {sfx:'quake'} — 합성음이라 파일이 필요 없음)
//  - file 이 null 이면 그 트랙은 "재생 안 함"이고 파일을 요청하지도 않습니다 (404 로그 없음).
//    지금은 실제 음악 파일이 없어서 전부 null 입니다. 파일을 assets/bgm/ 에 넣고 경로를 적으면 바로 켜집니다.
//      예) inn_day: { file: 'assets/bgm/inn_day.ogg', gain: 0.8 }
//  - gain: 이 트랙만의 음량 배율 (0~1, 트랙끼리 크기가 다를 때 맞추는 용도. 생략하면 1)
//  - loop: false 로 하면 반복하지 않음 (생략하면 반복)
//  - 파일이 있어도 못 읽으면(깨짐/없음) 조용히 건너뜁니다.
//  자세한 안내는 README 의 "BGM 넣는 법" 을 보세요.
// ============================================================
window.AUDIO = {
  fadeMs: 1000,          // 곡이 바뀔 때 크로스페이드 시간(ms)
  tracks: {
    title:       { file: null },   // 타이틀 화면
    inn_day:     { file: null },   // 여관의 낮 / 아침 (잔잔하고 따뜻하게)
    inn_night:   { file: null },   // 여관의 밤 (조용하게)
    tavern:      { file: null },   // 저녁 영업 (경쾌한 주점 음악)
    festival:    { file: null },   // 달맞이 장터 (3일차 저녁)
    tension:     { file: null },   // 지진/습격/결전 직전 (긴장감)
    cave:        { file: null },   // 동굴 안
    romance:     { file: null },   // 히로인과 단둘이 있는 밤
    ending_good: { file: null },   // 엔딩 (개별 / 노멀)
    ending_bad:  { file: null }    // 배드 엔딩
  }
};
