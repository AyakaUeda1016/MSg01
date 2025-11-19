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
                                <!-- カレンダーボタンの横に×ボタンを追加してフィルターをクリアできるようにした -->
                                <button class="clear-date-button" id="clear-date-button" title="日付フィルターをクリア">
                                    <i class="fa-solid fa-times"></i>
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
                        <!-- Item 1: クリック可能なリンクとして全体を囲む -->
                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="self-intro" data-date="2024-10-22">
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
                        </a>

                        <!-- Item 2: クリック可能なリンクとして全体を囲む -->
                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="after-school" data-date="2024-10-27">
                                <div class="record-date">
                                    <span class="date-text">10/27</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/street.png" alt="放課後">
                                </div>
                                <div class="record-title">
                                    <h2>放課後</h2>
                                </div>
                            </div>
                        </a>

                        <!-- さらにレコードアイテムを追加 -->
                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="club" data-date="2024-10-29">
                                <div class="record-date">
                                    <span class="date-text">10/29</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/classroom.png" alt="部活動">
                                </div>
                                <div class="record-title">
                                    <h2>部活動</h2>
                                </div>
                            </div>
                        </a>

                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="self-intro" data-date="2024-11-01">
                                <div class="record-date">
                                    <span class="date-text">11/01</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/classroom.png" alt="自己紹介">
                                </div>
                                <div class="record-title">
                                    <h2>自己紹介</h2>
                                </div>
                            </div>
                        </a>

                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="after-school" data-date="2024-11-03">
                                <div class="record-date">
                                    <span class="date-text">11/03</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/street.png" alt="放課後">
                                </div>
                                <div class="record-title">
                                    <h2>放課後</h2>
                                </div>
                            </div>
                        </a>

                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="club" data-date="2024-11-05">
                                <div class="record-date">
                                    <span class="date-text">11/05</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/classroom.png" alt="部活動">
                                </div>
                                <div class="record-title">
                                    <h2>部活動</h2>
                                </div>
                            </div>
                        </a>

                        <a href="growth_record?action=details&recordId=1" class="record-link">
                            <div class="record-item" data-category="self-intro" data-date="2024-11-07">
                                <div class="record-date">
                                    <span class="date-text">11/07</span>
                                </div>
                                <div class="record-thumbnail">
                                    <img src="images/classroom.png" alt="自己紹介">
                                </div>
                                <div class="record-title">
                                    <h2>自己紹介</h2>
                                </div>
                            </div>
                        </a>
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
    		<button class="btn btn-wood">戻る</button>
		</a>
    </div>
    
    <script src="js/growth_record.js"></script>
</body>
</html>