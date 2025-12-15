<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.List"%>
<%@ page import="model.Scenario"%>
<% 
	List<Scenario> list = (List<Scenario>)request.getAttribute("LIST");
%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>成長記録画面</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="css/growth_record.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
<script>
window.parent.postMessage({ page: "growth_record" }, "*");
</script>
    <!-- チュートリアルモーダルとオーバーレイを追加 -->
    <div id="tutorial-overlay" class="tutorial-overlay"></div>
    <div id="tutorial-tooltip" class="tutorial-tooltip">
        <div class="tooltip-content">
            <p id="tutorial-text"></p>
            <div class="tooltip-footer">
                <span id="tutorial-step" class="step-indicator"></span>
                <button id="skip-tutorial" class="skip-btn">スキップ</button>
            </div>
        </div>
        <div class="tooltip-arrow"></div>
    </div>

    <!-- チュートリアルヘルプボタンを右上に追加 -->
    <button id="tutorial-help-btn" class="tutorial-help-btn" title="チュートリアルを表示">
        ?
    </button>

    <!-- スライドアニメーション用のラッパーを追加 -->
    <div class="screen-wrapper">
        <div class="background-scene">
            <div class="chalkboard-container">
                <!--  タイトル　-->
                <header class="header">
                    <h1 class="page-title">成長記録画面</h1>
                </header>
                <!-- フィルター -->
                <div class="filter-section">
                    <div class="filter-controls">
                        <div class="dropdown">
                            <select id="category-filter" class="filter-select">
                                <option value="">すべて</option>
                                <option value="self-intro">自己紹介</option>
                                <option value="after-school">放課後</option>
                                <option value="club">部活動</option>
                            </select>
                        </div>

                        <div class="date-filters">
                            <div class="dropdown">
                                <select id="sort-filter" class="filter-select">
                                    <option value="desc">新しい順</option>
                                    <option value="asc">古い順</option>
                                </select>
                            </div>
                            
                            <!-- カレンダー選択UIコンテナを追加 -->
                            <div class="calendar-container">
                                <label for="fecha" class="calendar-button" id="calendar-button">
                                    <i class="fa-solid fa-calendar-days"></i>
                                </label>
                                <!-- ×ボタンをdli-redoアイコンに変更 -->
                                <button class="clear-date-button" id="clear-date-button" title="日付フィルターをクリア">
                                    <span class="dli-redo"></span>
                                </button>
                                <input type="date" id="fecha" name="fecha">
                                <div class="calendar-picker" id="calendar-picker">
                                    <div class="calendar-header">
                                        <button class="calendar-nav" id="prevMonth">◀</button>
                                        <span class="calendar-month" id="currentMonth"></span>
                                        <button class="calendar-nav" id="nextMonth">▶</button>
                                    </div>
                                    <div class="calendar-grid" id="calendarGrid"></div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                <!--成長記録リスト-->
                <div class="records-container">
                    <div class="record-list">
                        <%if(list != null && !list.isEmpty()){ %>
                        	<%for(Scenario s : list){ %>
                        		<a href="growth_record?action=details&recordId=<%=s.getScenarioid() %>&finishdate=<%=s.getFinishdate() %>" class="record-link">
                        			<div class="record-item" 
                         				data-category="self-intro" 
                         				data-date="<%= s.getFinishdate().substring(0,10) %>">

                        				<div class="record-date">
                            				<span class="date-text">
                                				<%= s.getFinishdate().substring(5,10).replace("-", "/") %>
                            				</span>
                        				</div>

                        				<div class="record-thumbnail">
                            				<img src="<%= request.getContextPath() + s.getImagelink() %>" alt="<%= s.getTitle() %>">
                        				</div>

                        				<div class="record-title">
                            				<h2><%= s.getTitle() %></h2>
                        				</div>
                    				</div>
                        		</a>
                        	<%} %>
                        <%}else{ %>
                        	<p>成長記録がありません。</p>
                        <%} %>
                    </div>
                </div>
                
            </div>
        </div>
        <!-- 右矢印にIDとクリックイベントを追加 -->
        <a href="growth_record?action=list" id="navRightArrow">
            <div class="nav-arrow">▶</div>
        </a>
        <!-- 戻るボタンのスタイルを適用 -->
        <a href="growth_record?action=home">
    		<button class="btn btn-wood" id="back-button">戻る</button>
		</a>
    </div>
    
    <script src="js/growth_record.js"></script>
</body>
</html>
