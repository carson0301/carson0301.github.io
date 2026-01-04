// 首頁邏輯
document.addEventListener('DOMContentLoaded', function() {
    // 獲取按鈕元素
    const startDetectBtn = document.getElementById('start-detect-btn');

    // 設置端類型樣式
    const deviceType = router.getDeviceType();
    document.body.classList.add(`device-${deviceType}`);

    // 開始檢測按鈕點擊事件
    function handleStartDetect() {
        // 添加按鈕點擊動畫效果
        this.style.transform = 'scale(0.95)';
        this.style.opacity = '0.8';

        // 延遲跳轉，讓動畫效果顯示
        setTimeout(() => {
            // 跳轉到檢測頁面
            window.location.href = 'detect.html';
        }, 200);
    }

    // 綁定事件監聽器
    if (startDetectBtn) {
        startDetectBtn.addEventListener('click', handleStartDetect);
    }

    // 添加按鈕懸停效果
    if (startDetectBtn) {
        startDetectBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        startDetectBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        startDetectBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.opacity = '1';
        });
    }

    // 頁面載入動畫
    setTimeout(() => {
        document.querySelectorAll('.feature-item, .step-item').forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 100);
            }, index * 100);
        });
    }, 300);
});
