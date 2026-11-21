// 캐릭터 정의 파일
// - name   : 대사창에 표시되는 이름
// - color  : 이름표 색
// - affinity: true 이면 결과 화면에 호감도가 표시됨 (변수 이름은 aff.<id>)
// - faces  : 표정 이름 -> 이미지 경로 (확장자 포함).
//            나중에 PNG 로 바꾸려면 같은 폴더에 PNG 를 넣고 아래 경로의 .svg 를 .png 로만 고치면 됩니다.
window.CHARACTERS = {
  kael: {
    name: '카엘',
    color: '#ff8a65',
    affinity: true,
    faces: {
      normal:   'assets/char/kael/normal.svg',
      smile:    'assets/char/kael/smile.svg',
      angry:    'assets/char/kael/angry.svg',
      troubled: 'assets/char/kael/troubled.svg'
    }
  },
  erion: {
    name: '에리온',
    color: '#9fa8ff',
    affinity: true,
    faces: {
      normal:    'assets/char/erion/normal.svg',
      smile:     'assets/char/erion/smile.svg',
      surprised: 'assets/char/erion/surprised.svg',
      angry:     'assets/char/erion/angry.svg'
    }
  }
};
