# 은빛 여우관 (Silver Fox Inn) — 판타지 비주얼 노벨 프로토타입

변두리 마을 여관의 주인이 되어 모험가 손님들을 맞이하는 모바일(세로 화면) 우선 비주얼 노벨입니다.
순수 HTML/CSS/JS 로 만들어져 빌드 도구, 프레임워크, 외부 CDN 이 전혀 없습니다. 정적 파일 그대로 GitHub Pages 에 올리면 동작합니다.

현재 범위: **1일차(밤까지)** — 손님 2명(허세 전사 카엘, 수상한 엘프 마법사 에리온), 분기 다수, 결과 요약.

## 플레이 방법

- **화면 탭**: 글자가 타이핑되는 중이면 즉시 전부 표시, 다시 탭하면 다음 대사 (데스크톱은 스페이스/엔터도 가능)
- **선택지**: 큰 버튼을 눌러 선택. 선택에 따라 골드/평판/호감도가 바뀌고 이야기가 갈라집니다.
- **상단 HUD**: 왼쪽 골드, 평판. 변화가 생기면 잠깐 알림이 뜹니다.
- **메뉴(오른쪽 위)**: 저장(3슬롯) / 불러오기 / 백로그(지난 대사) / 처음부터 / 타이틀로
- **자동 저장**: 대사가 바뀔 때마다 저장되며, 타이틀의 "이어하기"로 이어서 합니다.
- 저장은 브라우저 `localStorage` 를 사용합니다 (막힌 환경에서도 게임 자체는 동작).

## 실행 / 배포

```bash
cd inn-vn
python3 -m http.server 8000     # http://localhost:8000 접속
```

- `index.html` 을 `file://` 로 직접 열어도 게임은 동작합니다 (스토리를 fetch 가 아닌 `<script>` 로 읽음). 단 PWA/서비스 워커는 http(s) 에서만 동작합니다.
- **GitHub Pages**: 저장소 루트에 이 폴더 내용을 올리고 Settings > Pages 에서 main 브랜치 / root 를 선택하면 끝. 모든 경로가 상대 경로입니다.
- **PWA**: `manifest.webmanifest` + `sw.js` (오프라인 캐시) + 아이콘 포함. 안드로이드 크롬에서 "홈 화면에 추가"가 가능합니다.
  파일을 고쳐 다시 배포할 때는 `sw.js` 맨 위 `VERSION` 을 올리면 캐시가 갱신됩니다. 새 이미지/스토리 파일을 추가했다면 `sw.js` 의 `ASSETS` 목록에도 넣으세요(오프라인 캐시용).
- **APK**: 루트 `index.html` 하나로 동작하므로 Capacitor 등의 `webDir` 로 이 폴더를 그대로 지정하면 됩니다.

## 폴더 구조

```
index.html              진입점 (모든 화면 마크업)
manifest.webmanifest    PWA 매니페스트
sw.js                   서비스 워커 (오프라인 캐시)
css/style.css           모든 스타일
js/engine.js            엔진 (보통 수정할 필요 없음)
story/
  characters.js         캐릭터 정의: 이름, 이름 색, 표정별 이미지 경로
  backgrounds.js        배경 정의: 배경 id -> 이미지 경로
  day1.js               1일차 스크립트 (대사/선택지/분기)  <- 여기를 고쳐서 이야기를 늘립니다
assets/
  char/<캐릭터id>/<표정>.svg   임시 캐릭터 일러스트 (400x600, 상반신)
  bg/*.svg                     임시 배경 (720x1280)
icons/                  앱 아이콘 (icon.svg, icon-192.png, icon-512.png)
tools/
  check-story.js        스크립트 정적 검사 (끊긴 goto, 없는 이미지 등)
  test-play.js          Playwright 자동 플레이 테스트
  gen-icons.js          icon.svg -> PNG 아이콘 생성
```

## 스크립트 작성법

`story/day1.js` 는 **씬 id -> 명령 배열** 형태입니다. 명령은 위에서 아래로 한 줄씩 실행되고,
`say` / `narr` / `choice` 에서 멈춰서 플레이어의 입력을 기다립니다.
**모든 씬의 마지막 명령은 `goto`, `choice`, `summary`, `end` 중 하나**여야 합니다.

```js
Object.assign(STORY.scenes, {
  my_scene: [
    { bg: 'inn_day' },
    { show: 'kael', face: 'smile', pos: 'left' },
    { say: 'kael', text: '안녕, 주인장!' },
    { narr: '카엘이 크게 웃었다.' },
    { choice: [
      { text: '반갑습니다!', set: { 'aff.kael': 1 }, goto: 'scene_a' },
      { text: '골드부터 내세요.', set: { gold: 10, 'aff.kael': -1 }, goto: 'scene_b' }
    ] }
  ],
  scene_a: [ /* ... */ { goto: 'my_next' } ]
});
```

### 명령어 레퍼런스

| 명령 | 설명 | 예시 |
|---|---|---|
| `{bg: id}` | 배경 변경 (`backgrounds.js` 의 id) | `{bg:'inn_night'}` |
| `{show: id, face, pos}` | 캐릭터 등장/표정·위치 변경. `pos` 는 `left`/`center`/`right` (기본 center), `face` 생략 시 현재/첫 표정 | `{show:'kael', face:'smile', pos:'left'}` |
| `{hide: id}` | 캐릭터 퇴장. `'all'` 이면 전원 | `{hide:'all'}` |
| `{say: id, text, face?, as?}` | 대사. `face` 를 주면 그 줄부터 표정 교체, `as` 는 표시 이름 덮어쓰기(예: `'???'`). 화면에 없는 캐릭터가 face 와 함께 말하면 중앙에 자동 등장 | `{say:'erion', face:'angry', text:'...'}` |
| `{narr: text}` | 이름표 없는 나레이션 | `{narr:'밤이 깊었다.'}` |
| `{choice: [...]}` | 선택지. 항목: `text`, `set`(변수 변화), `goto`(이동할 씬), `if`(조건을 만족할 때만 표시). `goto` 가 없으면 선택 후 다음 명령으로 계속 | 위 예시 참고 |
| `{if: '조건', goto: 씬, else?: 씬}` | 조건이 참이면 `goto`, 거짓이면 `else`(없으면 그냥 다음 명령) | `{if:'aff.kael>=2', goto:'honest'}` |
| `{goto: 씬}` | 다른 씬으로 이동 | `{goto:'d1_night'}` |
| `{set: {...}}` | 변수 변경. **숫자는 더하기**, `true/false`/문자열은 대입 | `{set:{gold:-5, 'flag.met_kael':true}}` |
| `{put: {...}}` | 숫자를 **그 값으로 덮어쓰기** | `{put:{gold:100}}` |
| `{summary: {title, note}}` | 결과 요약 화면(골드/평판/호감도) 표시. 마지막에 "타이틀로" 버튼 | `{summary:{title:'1일차 결과', note:'2일차는 다음 업데이트에서!'}}` |
| `{end: true}` | 즉시 타이틀로 | |

### 변수와 조건식

- 기본 변수: `gold`(골드), `rep`(평판), `aff.<캐릭터id>`(호감도, 예 `aff.kael`), `flag.<이름>`(자유롭게 만드는 true/false 표시)
- 시작 값은 `day1.js` 맨 위 `init` 에서 정합니다.
- 조건식: `gold>=30`, `aff.kael==2`, `flag.met_kael`, `!flag.erion_left`, `rep>0 && aff.erion>=1`, `a || b` (`&&` 가 `||` 보다 먼저 계산)
- 대사 안에 `{gold}` 처럼 쓰면 현재 값으로 바뀝니다. (예: `'금고에는 {gold} 골드가 있다.'`)
- 호감도/골드/평판이 바뀌면 화면에 자동으로 알림이 뜹니다.

### 새 캐릭터 / 배경 추가

1. `story/characters.js` 에 캐릭터를 추가 (`affinity: true` 를 주면 결과 화면에 호감도가 표시됨)
   ```js
   mina: { name:'미나', color:'#8fe3a0', affinity:true,
           faces:{ normal:'assets/char/mina/normal.png', smile:'assets/char/mina/smile.png' } }
   ```
2. 시작 변수에 `aff: { ..., mina: 0 }` 추가 (`init` 의 `aff` 안)
3. 배경은 `story/backgrounds.js` 에 `id: '경로'` 한 줄 추가.

### 2일차 추가하기

`story/day2.js` 를 만들어 `Object.assign(STORY.scenes, { d2_open: [ ... ] });` 로 씬을 정의하고,
`index.html` 의 `day1.js` 아래에 `<script src="story/day2.js"></script>` 를 추가한 뒤 1일차 마지막 씬(`d1_summary`)에서 `{goto:'d2_open'}` 으로 이어 주면 됩니다. (`sw.js` 의 `ASSETS` 에도 추가)

### 스크립트 검사

```bash
node tools/check-story.js
```
끊긴 `goto`, 없는 캐릭터/표정/배경/이미지 파일, 잘못된 조건식, 씬 끝 처리 누락, 도달 불가 씬을 알려 줍니다. 스크립트를 고친 뒤 꼭 한 번 돌려 보세요.

## 이미지 교체 방법

지금 들어 있는 SVG 는 임시 그림입니다. PNG/JPG/WebP 로 바꾸려면:

1. 캐릭터: `assets/char/<id>/<표정>.png` 로 파일을 넣고, `story/characters.js` 의 해당 경로를 `.svg` -> `.png` 로 고칩니다. 표정을 더 늘리려면 `faces` 에 항목을 추가하고 스크립트에서 `face:'새표정'` 으로 사용합니다.
   - 권장: 세로로 긴 상반신 이미지(비율 2:3, 예 800x1200), 투명 배경.
2. 배경: `assets/bg/` 에 이미지를 넣고 `story/backgrounds.js` 의 경로를 수정합니다. 권장 비율 9:16(예 1080x1920). 화면 비율이 달라도 `cover` 로 꽉 차게 표시됩니다.
3. 바꾼 파일 경로가 `sw.js` 의 `ASSETS` 목록과 다르면 목록도 고치고 `VERSION` 을 올립니다. (`node tools/check-story.js` 가 불일치를 경고)

## 개발/검증 도구

```bash
python3 -m http.server 8765 &
node tools/test-play.js [스크린샷 폴더]   # Playwright: 모바일 뷰포트로 끝까지 자동 플레이 + 저장/로드 확인
node tools/gen-icons.js                   # icons/icon.svg 에서 PNG 아이콘 재생성
```
