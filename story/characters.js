// 캐릭터 정의 파일
// - name   : 대사창에 표시되는 이름
// - color  : 이름표 색
// - affinity: true 이면 결과/일차 카드에 호감도가 표시됨 (변수 이름은 aff.<id>)
// - tag    : 한 줄 소개 (타이틀 이름 위에 마우스를 올렸을 때 등에 사용)
// - faces  : 표정 이름 -> 이미지 경로 (확장자 포함).
//            나중에 PNG 로 바꾸려면 같은 폴더에 PNG 를 넣고 아래 경로의 .svg 를 .png 로만 고치면 됩니다.
//            (현재 SVG 는 tools/gen-chars.js 가 만든 임시 그림입니다)
function faces(id) {
  var f = {};
  ['normal', 'smile', 'angry', 'shy', 'surprised', 'sad'].forEach(function (k) { f[k] = 'assets/char/' + id + '/' + k + '.svg'; });
  return f;
}
window.CHARACTERS = {
  erion: { name: '에리온', color: '#9fb4ff', affinity: true, tag: '엘프 마법사 / 츤데레 · 푸른 책의 비밀', faces: faces('erion') },
  kaela: { name: '카엘라', color: '#ff8a65', affinity: true, tag: '여기사 / 허세 · 허당 · 밝음',            faces: faces('kaela') },
  miho:  { name: '미호',   color: '#ffc857', affinity: true, tag: '여우 수인 도적 / 장난꾸러기 · 돈 밝힘',      faces: faces('miho') },
  lia:   { name: '리아',   color: '#ff9ec7', affinity: true, tag: '수습 성직자 · 소꿉친구 / 다정 · 질투',       faces: faces('lia') }
};
