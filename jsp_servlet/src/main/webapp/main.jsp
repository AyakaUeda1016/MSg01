<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KaiwaNavi メイン画面</title>
  <!-- 컨텍스트 경로 붙여서 CSS 로드 -->
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/main.css" />
</head>
<body>
  <!-- 상단바 -->
  <header class="topbar">
    <div class="level">Lv 1</div>
    <div class="username">ユーザー名</div>
    <div class="time">18:00</div>
  </header>

  <main class="scene">
    <!-- 캐릭터 -->
    <img src="${pageContext.request.contextPath}/images/kaiwanavi.png"
         alt="KaiwaNavi キャラクター" class="character" />

    <!-- 말풍선(내용은 추후 동적 출력) -->
    <div class="speech"></div>

    <!-- 나무패널 메뉴 -->
    <div class="menu">
      <div class="menu-item">
        <img src="${pageContext.request.contextPath}/images/ki.png" class="wood" alt="木背景" />
        <span class="text">シミュレーション</span>
      </div>
      <div class="menu-item">
        <img src="${pageContext.request.contextPath}/images/ki.png" class="wood" alt="木背景" />
        <span class="text">成長記録</span>
      </div>
      <div class="menu-item">
        <img src="${pageContext.request.contextPath}/images/ki.png" class="wood" alt="木背景" />
        <span class="text">設定</span>
      </div>
    </div>
  </main>
</body>
</html>
