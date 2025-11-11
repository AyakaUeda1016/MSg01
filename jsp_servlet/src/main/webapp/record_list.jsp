<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>棒グラフ画面</title>
    <link rel="stylesheet" href="css/growth_record_details.css">
</head>
<body>
    <div class="container">
        <div class="chalkboard bar-chart-page">
            <div class="content-wrapper">
                <div class="bar-chart-container">
                    <h1 class="chart-title">棒グラフ画面</h1>
                    
                    <div class="bars-container">
                        <div class="bar-wrapper">
                            <div class="bar green" style="height: 320px;">
                                <span class="bar-value">80</span>
                            </div>
                            <div class="bar-label">自己<br>認識</div>
                        </div>
                        
                        <div class="bar-wrapper">
                            <div class="bar blue" style="height: 272px;">
                                <span class="bar-value">68</span>
                            </div>
                            <div class="bar-label">気持ちの<br>コントロール<br>(緊張など)</div>
                        </div>
                        
                        <div class="bar-wrapper">
                            <div class="bar yellow" style="height: 300px;">
                                <span class="bar-value">75</span>
                            </div>
                            <div class="bar-label">理際力</div>
                        </div>
                        
                        <div class="bar-wrapper">
                            <div class="bar red" style="height: 288px;">
                                <span class="bar-value">72</span>
                            </div>
                            <div class="bar-label">話す力</div>
                        </div>
                        
                        <div class="bar-wrapper">
                            <div class="bar purple" style="height: 340px;">
                                <span class="bar-value">85</span>
                            </div>
                            <div class="bar-label">思いやり</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="chalk-tray"></div>
        </div>
        <a href="growth_record.jsp">
        <div class="nav-arrow" a="growth_record">◀</div>
        </a>
        <button class="back-button">
            <span>戻る</span>
        </button>
    </div>
</body>
</html>