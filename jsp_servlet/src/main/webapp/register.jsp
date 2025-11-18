<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新規登録</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/register.css">
</head>
<body>
    <div class="container">
        <div class="card">
            <h1 class="title">新規登録</h1>
            <form>
                <!-- ユーザー名入力欄を追加 -->
                <div class="form-group">
                    <label for="username">ユーザー名</label>
                    <input type="text" id="username" name="username" placeholder="">
                </div>

                <div class="form-group">
                    <label for="id">ID</label>
                    <input type="text" id="id" name="id" placeholder="">
                </div>

                <div class="form-group">
                    <label for="birthdate">生年月日</label>
                    <!-- 生年月日の入力にmaxlengthを追加してスラッシュ自動入力用に -->
                    <input type="text" id="birthdate" name="birthdate" placeholder="YYYY/MM/DD" maxlength="10" inputmode="numeric">
                </div>

                <div class="form-group">
                    <label for="gender">性別</label>
                    <select id="gender" name="gender">
                        <option value="">選択してください</option>
                        <option value="male">男性</option>
                        <option value="female">女性</option>
                        <option value="other">その他</option>
                    </select>
                </div>

                <div class="form-group password-group">
                    <label for="password">パスワード</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="password" name="password" placeholder="">
                        <!-- 目のアイコンをSVGで表示（デフォルトは目閉じ） -->
                        <button type="button" class="toggle-password" id="togglePassword" title="パスワード表示/非表示">
                            <svg class="eye-closed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                            <svg class="eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="button-group">
                    <a><button type="button" class="btn btn-back">戻る</button></a>
                    <a><button type="button" class="btn btn-submit">作成</button></a>
                </div>
            </form>
        </div>
    </div>

    <script src="js/register.js"></script>
</body>
</html>
