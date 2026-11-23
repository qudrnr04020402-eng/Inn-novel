// ============================================================
//  업적 목록 (데이터) — 회차와 상관없이 한 번 달성하면 영구 기록됩니다 (localStorage 'ach').
//  - 한 줄 = 업적 하나. { id, cat, name, hint(잠겼을 때 보이는 힌트), desc(달성 후 설명), test(c) }
//  - test(c) 는 true 를 돌려주면 달성입니다. c = { vars(이번 회차 변수), ending(방금 도달한 엔딩 id 또는 ''), endings / recipes / notes / cg(회차 공통 기록 {id:시각}), runs(지금까지 마친 회차 수) }
//  - 확인 시점(js/engine.js): 엔딩 도달 / 하루가 바뀔 때 / 여관 등급이 오를 때. 쓰는 통계는 지금 있는 변수만 (tavern.perfect/spWin/served/tasteHits, gift.gave/bought, lodge.nights, inn.rank, aff.*, rep, gold)
//  - 새 업적은 배열에 한 줄만 더하면 됩니다. (검사: tools/check-story.js 가 id 중복과 필드를 확인)
// ============================================================
(function () {
  var tv = function (c) { return (c.vars && c.vars.tavern) || {}; };
  var cnt = function (o) { return Object.keys(o || {}).length; };
  var maxAff = function (c) { return Math.max.apply(null, HEROINES.map(function (h) { return ((c.vars.aff || {})[h]) || 0; })); };
  var minAff = function (c) { return Math.min.apply(null, HEROINES.map(function (h) { return ((c.vars.aff || {})[h]) || 0; })); };
  var end = function (id) { return function (c) { return !!(c.endings && c.endings[id]); }; };

  window.ACHIEVEMENTS = [
    // ----- 엔딩 -----
    { id: 'end_any',    cat: '엔딩', name: '첫 번째 아침', hint: '어떤 엔딩이든 하나 본다.', desc: '30일을 마치고 첫 엔딩을 봤어요.', test: function (c) { return cnt(c.endings) >= 1; } },
    { id: 'end_erion',  cat: '엔딩', name: '푸른 책의 주인', hint: '에리온 엔딩을 본다.', desc: '에리온과 함께하는 엔딩.', test: end('erion') },
    { id: 'end_kaela',  cat: '엔딩', name: '붉은 사자의 기사', hint: '카엘라 엔딩을 본다.', desc: '카엘라와 함께하는 엔딩.', test: end('kaela') },
    { id: 'end_miho',   cat: '엔딩', name: '여우의 보금자리', hint: '미호 엔딩을 본다.', desc: '미호와 함께하는 엔딩.', test: end('miho') },
    { id: 'end_lia',    cat: '엔딩', name: '가장 오래된 마음', hint: '리아 엔딩을 본다.', desc: '리아와 함께하는 엔딩.', test: end('lia') },
    { id: 'end_true',   cat: '엔딩', name: '모두의 여관', hint: '진 엔딩을 본다.', desc: '네 사람이 모두 남은 엔딩.', test: end('true') },
    { id: 'end_master', cat: '엔딩', name: '명가의 간판', hint: '명가 엔딩을 본다.', desc: '여관이 모두의 자랑이 된 엔딩.', test: end('master') },
    { id: 'end_all',    cat: '엔딩', name: '이야기의 끝에서 끝까지', hint: '모든 엔딩을 본다.', desc: '여덟 가지 엔딩을 모두 봤어요.', test: function (c) { return (window.ENDINGS || []).length > 0 && ENDINGS.every(function (e) { return c.endings && c.endings[e.id]; }); } },
    { id: 'run_2',      cat: '엔딩', name: '다시, 첫날 아침', hint: '엔딩을 보고 새 게임을 시작한다.', desc: '2회차의 문을 열었어요.', test: function (c) { return (c.vars.run || 1) >= 2; } },
    // ----- 마음 -----
    { id: 'route',      cat: '마음', name: '고백의 밤', hint: '21일 밤, 마음을 전해 루트를 확정한다.', desc: '한 사람에게 마음을 전했어요.', test: function (c) { return !!(c.vars.flag && c.vars.flag.route); } },
    { id: 'heart5',     cat: '마음', name: '하트 다섯 칸', hint: '한 사람의 호감도를 하트 5칸까지 올린다.', desc: '마음이 가득 찼어요.', test: function (c) { return maxAff(c) >= HEART(5); } },
    { id: 'allfriend',  cat: '마음', name: '모두와 친구', hint: '네 사람 모두 하트 3칸 이상이 된다.', desc: '누구와도 가까운 여관 주인.', test: function (c) { return minAff(c) >= HEART(3); } },
    { id: 'gift5',      cat: '마음', name: '선물 상자', hint: '선물을 다섯 번 건넨다.', desc: '마음을 담아 선물을 다섯 번 건넸어요.', test: function (c) { return ((c.vars.gift || {}).gave || 0) >= 5; } },
    { id: 'gift_shop',  cat: '마음', name: '단골 장터손님', hint: '장터에서 선물을 열 개 산다.', desc: '장터에서 선물을 열 개 샀어요.', test: function (c) { return ((c.vars.gift || {}).bought || 0) >= 10; } },
    { id: 'crisis',     cat: '마음', name: '흔들리는 소문을 넘다', hint: '12일, 여관을 둘러싼 소문 소동을 해결한다.', desc: '소문 소동을 넘기고 여관의 이름을 지켰어요.', test: function (c) { return !!(c.vars.flag && c.vars.flag.w2_done); } },
    // ----- 여관 -----
    { id: 'inn3',       cat: '여관', name: '소문난 여관', hint: '여관을 3성으로 키운다.', desc: '여관이 3성이 됐어요.', test: function (c) { return ((c.vars.inn || {}).rank || 1) >= 3; } },
    { id: 'inn5',       cat: '여관', name: '별 다섯 개', hint: '여관을 5성으로 키운다.', desc: '여관이 5성이 됐어요.', test: function (c) { return ((c.vars.inn || {}).rank || 1) >= 5; } },
    { id: 'rep50',      cat: '여관', name: '믿음직한 이름', hint: '평판을 50까지 올린다.', desc: '평판이 50을 넘었어요.', test: function (c) { return (c.vars.rep || 0) >= 50; } },
    { id: 'gold500',    cat: '여관', name: '든든한 금고', hint: '한 번에 500G 이상을 모은다.', desc: '금고에 500G를 모았어요.', test: function (c) { return (c.vars.gold || 0) >= 500; } },
    { id: 'nights20',   cat: '여관', name: '불 켜진 객실', hint: '숙박 손님을 스무 밤 재운다.', desc: '객실에 스무 밤의 손님을 맞았어요.', test: function (c) { return ((c.vars.lodge || {}).nights || 0) >= 20; } },
    // ----- 영업 -----
    { id: 'served100',  cat: '영업', name: '백 번째 손님', hint: '손님 100명에게 요리를 낸다.', desc: '이번 회차에 손님 100명을 맞았어요.', test: function (c) { return (tv(c).served || 0) >= 100; } },
    { id: 'perfect20',  cat: '영업', name: '대성공 스무 번', hint: '한 회차에 대성공 20번.', desc: '대성공을 20번 해냈어요.', test: function (c) { return (tv(c).perfect || 0) >= 20; } },
    { id: 'perfect60',  cat: '영업', name: '손맛의 달인', hint: '한 회차에 대성공 60번.', desc: '대성공을 60번 해냈어요.', test: function (c) { return (tv(c).perfect || 0) >= 60; } },
    { id: 'special3',   cat: '영업', name: '특별 주문 3승', hint: '특별 주문에서 세 번 이긴다.', desc: '까다로운 특별 주문을 세 번 해냈어요.', test: function (c) { return (tv(c).spWin || 0) >= 3; } },
    { id: 'special6',   cat: '영업', name: '특별 주문 6승', hint: '특별 주문에서 여섯 번 이긴다.', desc: '특별 주문 여섯 번 승리.', test: function (c) { return (tv(c).spWin || 0) >= 6; } },
    { id: 'taste10',    cat: '영업', name: '취향 저격', hint: '단골의 숨은 취향을 열 번 맞힌다.', desc: '단골의 취향을 열 번 맞혔어요.', test: function (c) { return (tv(c).tasteHits || 0) >= 10; } },
    { id: 'staff1',     cat: '영업', name: '첫 직원', hint: '직원을 한 명 고용한다.', desc: '여관에 첫 직원이 생겼어요.', test: function (c) { return window.MgmtCore && MgmtCore.hiredList(c.vars).length >= 1; } },
    { id: 'staff3',     cat: '영업', name: '북적이는 주방', hint: '직원을 세 명 동시에 고용한다.', desc: '직원 셋과 함께 일해요.', test: function (c) { return window.MgmtCore && MgmtCore.hiredList(c.vars).length >= 3; } },
    { id: 'upg5',       cat: '영업', name: '손보기의 달인', hint: '영업 개조를 5개 산다.', desc: '영업 개조를 5개 갖췄어요.', test: function (c) { var u = tv(c).upg || {}; return Object.keys(u).filter(function (k) { return u[k]; }).length >= 5; } },
    // ----- 수집 -----
    { id: 'recipe10',   cat: '수집', name: '레시피 수집가', hint: '레시피 도감을 10개 채운다.', desc: '레시피 10개를 기록했어요.', test: function (c) { return cnt(c.recipes) >= 10; } },
    { id: 'recipe_all', cat: '수집', name: '메뉴판 완성', hint: '레시피 도감을 모두 채운다.', desc: '모든 레시피를 기록했어요.', test: function (c) { var n = Object.keys(window.TAVERN ? TAVERN.recipes : {}); return n.length > 0 && n.every(function (id) { return c.recipes && c.recipes[id]; }); } },
    { id: 'cg5',        cat: '수집', name: '추억 모으기', hint: '이벤트 CG를 5장 본다.', desc: 'CG를 5장 모았어요.', test: function (c) { return cnt(c.cg) >= 5; } },
    { id: 'notes8',     cat: '수집', name: '손님 수첩', hint: '손님 메모에 8명을 적는다.', desc: '손님 8명의 취향을 적었어요.', test: function (c) { return cnt(c.notes) >= 8; } }
  ];
})();
