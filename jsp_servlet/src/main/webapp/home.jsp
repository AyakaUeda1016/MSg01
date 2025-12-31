<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ホーム - Kaiwanavi</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/home.css">
</head>

<body>
<script>
window.parent.postMessage({ page: "normal" }, "*");
</script>
    <!-- Added header with Lv, username, and time -->
    <video autoplay loop muted playsinline id="bg-video"
      <!--  style="position:fixed;top:0;left:0;width:100%;height:100%;
              object-fit:cover;z-index:-1;pointer-events:none;"> -->
    <source src="images/classroom-bg.mp4" type="video/mp4">
	</video>

    <header class="header">
        <div class="header-center">はるたろう</div>
        <div class="header-right">18:00</div>
    </header>

    <!-- Restructured main content to match the design -->
    <main class="main-content">
        <!-- Left side: Character area -->
        <div class="character-area">
            <!-- Added data-default attribute to store default message -->
            <div class="speech-bubble" data-default="今日も頑張りましょうね">今日も頑張りましょうね</div>
            <img src="images/kaiwanavi-chara.png" alt="キャラクター" class="character" id="character">
        </div>

        <!-- Right side: Note area with buttons -->
        <div class="note-area">
            <img src="images/note.png" alt="ノート" class="note-bg">

            <div class="buttons-container">
                <!-- Updated button structure with description placeholders -->
                <div class="button-wrapper">
                    <a href="home?sb=register" class="menu-button simulation" data-description="学習シミュレーションを行います">
                        <img src="images/sticky note_red.png" alt="付箋" class="sticky-note">
                        <span class="button-text">シミュレーション</span>
                        <img src="images/red.png" alt="赤線" class="red-underline">
                        </a>
                    <!-- Removed description div - now using speech bubble -->
                </div>

                <div class="button-wrapper">
                    <a href="home?sb=growth_record" class="menu-button growth" data-page="growth-record.html"
                            data-description="あなたの学習記録と成長を確認できます">
                            <img src="images/sticky note_blue.png" alt="付箋" class="sticky-note">
                            <span class="button-text">成長記録</span>
                            <img src="images/red.png" alt="赤線" class="red-underline">
                        </a>
                    <!-- Removed description div - now using speech bubble -->
                </div>

                <div class="button-wrapper">
                    <a href="home?sb=setting" class="menu-button settings" data-page="settings.html"
                            data-description="アプリの各種設定を変更できます">
                            <img src="images/sticky note_green.png" alt="付箋" class="sticky-note">
                            <span class="button-text">設定</span>
                            <img src="images/red.png" alt="赤線" class="red-underline">
                        </a>
                    <!-- Removed description div - now using speech bubble -->
                </div>
            </div>

            <!-- Updated decorations positioning -->
            <div class="decorations">
                <img src="images/pen.png" alt="ペン" class="pen">
                <img src="images/eraser.png" alt="消しゴム" class="eraser">
            </div>
        </div>
    </main>

    <script src="js/home.js"></script>
</body>

</html>
