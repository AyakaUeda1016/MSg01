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
	<script>
	window.parent.postMessage({ page: "normal" }, "*");
	</script>
	
    <div class="container">
        <div class="card">
            <h1 class="title">新規登録</h1>
            
            <form action="${pageContext.request.contextPath}/register" method="post">
                <!-- ユーザー名入力欄を追加 -->
                <div class="form-group">
                    <label for="username">ユーザー名</label>
                    <input type="text" id="username" name="username" placeholder="">
                </div>

                <div class="button-group">
                    <button type="submit" class="btn btn-back" name="sb" value="back">戻る</button>
                    <button type="submit" class="btn btn-submit" name="sb" value="register">作成</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/register.js"></script>
</body>
</html>