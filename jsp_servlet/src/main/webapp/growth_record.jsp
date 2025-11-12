<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
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
                    <!--カレンダー-->
                    <label for="fecha" class="calendar-button">
                        <i class="fa-solid fa-calendar-days"></i>
                        </label>
                        <input type="date" id="fecha" name="fecha">
                        
                    <!--前作ったのカレンダー、一様コード置いときます-->
                        <!--<div class="dropdown">
                            <select id="day-filter" class="filter-select date-select">
                                <option value="">日</option>
                                <option value="1">1~10</option>
                                <option value="2">11~20</option>
                                <option value="3">21~31</option>
                            </select>
                        </div>

                        <div class="dropdown">
                            <select id="month-filter" class="filter-select date-select">
                                <option value="">月</option>
                                <option value="1">1月</option>
                                <option value="2">2月</option>
                                <option value="3">3月</option>
                                <option value="4">4月</option>
                                <option value="5">5月</option>
                                <option value="6">6月</option>
                                <option value="7">7月</option>
                                <option value="8">8月</option>
                                <option value="9">9月</option>
                                <option value="10">10月</option>
                                <option value="11">11月</option>
                                <option value="12">12月</option>
                            </select>
                        </div>

                        <div class="dropdown">
                            <select id="year-filter" class="filter-select date-select">
                                <option value="">年</option>
                                <option value="2025">2025年</option>
                                <option value="2026">2026年</option>
                            </select>
                        </div>-->
                    </div>

                    <!--サーチボタン-->
                    <button class="search-btn" aria-label="検索">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!--成長記録リスト-->
            <div class="records-container">
                <div class="record-list">
                    <!-- Item 1 -->
                    <div class="record-item">
                        <div class="record-date">
                            <span class="date-text">10/22</span>
                        </div>
                        <div class="record-thumbnail">
                            <img src="images/classroom.png" alt="自己紹介">
                        </div>
                        <div class="record-title">
                            <h2>自己紹介</h2>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div class="record-item">
                        <a href="growth_record_details.jsp"><div class="record-date">
                            <span class="date-text">10/27</span>
                        </div>
                        <div class="record-thumbnail">
                            <img src="images/street.png" alt="放課後">
                        </div>
                        <div class="record-title">
                            <h2>放課後</h2>
                        </div></a>
                    </div>
                </div>

                <!-- スクロール -->
                <div class="scroll-indicator">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M10 15 L20 25 L30 15" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
            
        </div>
    </div>
    <a href="record_list.jsp">
    <div class="nav-arrow" a="growth-record">▶</div>
    </a>
    <!-- バックボタン -->
    <a href="">
    <button class="back-btn">戻る</button>
</a>
</body>
</html>