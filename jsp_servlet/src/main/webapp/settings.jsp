<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>設定メニュー</title>

    <!-- ✅ フォント読み込み -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">

    <!-- ✅ 切り離したCSSを読み込む -->
    <link rel="stylesheet" href="css/settings.css">
</head>
<body>

    <div class="menu-container">
    
  <button class="menu-btn btn-mic" onclick="location.href='settings?action=mic'">
    	<span>マイク/音量</span>
	</button>
    
    <button class="menu-btn btn-account" onclick="location.href='settings?action=account'">
    	<span>アカウント詳細</span>
	</button>
	
	<button class="menu-btn btn-back" onclick="location.href='settings?action=home'">
    	<span>戻る</span>
	</button>

    </div>

</body>
</html>

