<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>アカウント詳細</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/account_details.css">
</head>
<body>
    <div class="container">
        <!-- 背景画像 -->
        <div class="background"></div>
        
        <!-- 黒板コンテナ -->
        <div class="chalkboard-wrapper">
            <div class="chalkboard">
                <!-- 入力フォーム -->
                <div class="form-section">
                    <div class="form-group">
                        <label>ID</label>
                        <div class="input-wrapper">
                            <span class="placeholder-text">ユーザーID</span>
                            <div class="input-line"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>パスワード</label>
                        <div class="input-wrapper password-wrapper">
                            <!-- Added actual input field for password -->
                            <input type="password" id="passwordInput" class="password-input" value="password123">
                            <div class="input-line"></div>
                            <!-- Eye toggle button to show/hide password -->
                            <button type="button" class="password-toggle" id="passwordToggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>ユーザー名</label>
                        <div class="input-wrapper">
                            <span class="placeholder-text">山田太郎</span>
                            <div class="input-line"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>生年月日</label>
                        <div class="input-wrapper">
                            <span class="placeholder-text">2000年1月1日</span>
                            <div class="input-line"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>クレジット</label>
                        <div class="input-wrapper">
                            <span class="placeholder-text">本アプリの音声は以下の VOICEVOX 音声ライブラリを利用して生成しています。<br>
・VOICEVOX: 冥鳴ひまり</span>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 戻るボタン -->
        <a href="settings.jsp"><button class="back-button">戻る</button></a>
    </div>
    
    <script src="js/account_details.js"></script>
</body>
</html>
