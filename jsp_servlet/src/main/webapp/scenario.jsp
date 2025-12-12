<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.List"%>
<%@ page import="model.Scenario"%>
<% 
	List<Scenario> list = (List<Scenario>)request.getAttribute("LIST");
%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>シナリオ選択</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/scenario.css">
    
</head>
<body>
<div class="bg-mirai">

    <!-- 緑パネル -->
    <div class="green-panel">
        <div class="panel-inner">

            <h1 class="scenario-select-title">シナリオ選択</h1>

            <!-- パネル中のイメージ３つ -->
            <div class="scene-list">
                <img id="scene-left"   src="images/haru.jpg" alt="春のシーン" class="scene-img">
                <img id="scene-center" src="images/kyo.jpg"  alt="教室のシーン" class="scene-img">
                <img id="scene-right"  src="images/natu.jpg" alt="夏のシーン" class="scene-img">
            </div>

            <!-- シナリオ説明 -->
            <div class="scenario-text-box">
                <p class="scenario-title" id="scenario-title">シナリオ1</p>
                <p class="scenario-desc"  id="scenario-desc">
                    みんなの前で自己紹介をやってみよう！
                </p>
            </div>

            <!-- 決定、やじるし -->
            <div class="controller-area">
                <button type="button" class="arrow-btn arrow-left" id="btn-left">
                    <img src="images/l.png" alt="前へ">
                </button>
                
                <form id="scenarioForm"
                action="${pageContext.request.contextPath}/scenario"
                 method="get">
                	<input type="hidden" name="scenarioId"  id="scenarioId" value="1">
                    <input type="hidden" name="sb" id = sbInput value="decide">
                	<button type="submit" name="sb"  value="decide" class="decide-btn">決定</button>
                </form>

                <button type="button" class="arrow-btn arrow-right" id="btn-right">
                    <img src="images/r.png" alt="次へ">
                </button>
            </div>

        </div>
    </div>


    <a href="./scenario?sb=home"><button name="sb" value="home" class="btn btn-wood" id="backBtn">戻る</button></a>

</div>
<script>
    window.contextPath = "${pageContext.request.contextPath}";
</script>
<script>
const initialScenarioId = 1; // 最初に中央に表示したいシナリオID
const basePath = "${pageContext.request.contextPath}";
const scenes = [
<%
  for (int i = 0; i < list.size(); i++) {
      Scenario s = list.get(i);
      String img = s.getImagelink()
              .replace("\\", "\\\\")   // バックスラッシュをエスケープ
              .replace("\"", "\\\"");  // ダブルクォートをエスケープ
%>
  {
    id: <%= s.getScenarioid() %>,
    img: basePath + "<%= img %>",
    title: "<%= s.getTitle().replace("\"", "\\\"") %>",
    desc: "<%= s.getDescription().replace("\"", "\\\"") %>"
  }<%= (i < list.size() - 1) ? "," : "" %>
<% } %>
];
console.log(scenes);
</script>			
<script src="js/scenario.js"></script>
</body>
</html>
