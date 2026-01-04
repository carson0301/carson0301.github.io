// 端選擇頁面邏輯
document.addEventListener('DOMContentLoaded', function() {
    // 獲取按鈕元素
    const mobileBtn = document.getElementById('mobile-btn');
    const pcBtn = document.getElementById('pc-btn');

    // 檢查是否已經選擇過端類型，允許通過 ?choose 或 ?force 強制顯示選擇頁
    let savedDeviceType = localStorage.getItem('deviceType');
    const params = new URLSearchParams(window.location.search);
    const forceChoose = params.has('choose') || params.has('force');

    // 如果帶有 force 參數，清除已保存的選擇，強制顯示選擇頁
    if (params.has('force')) {
        localStorage.removeItem('deviceType');
        savedDeviceType = null;
    }

    if (savedDeviceType && !forceChoose) {
        // 如果已經選擇過且沒有強制選擇參數，直接跳轉到首頁
        window.location.href = 'pages/home.html';
        return;
    }

    // 移動端按鈕點擊事件
    mobileBtn.addEventListener('click', function() {
        selectDevice('mobile');
    });

    // PC端按鈕點擊事件
    pcBtn.addEventListener('click', function() {
        selectDevice('pc');
    });

    // 選擇設備類型
    function selectDevice(deviceType) {
        // 保存端類型到localStorage
        router.setDeviceType(deviceType);

        // 添加按鈕點擊動畫效果
        const btn = deviceType === 'mobile' ? mobileBtn : pcBtn;
        btn.style.transform = 'scale(0.95)';
        btn.style.opacity = '0.8';

        // 延遲跳轉，讓動畫效果顯示
        setTimeout(() => {
            // 跳轉到首頁
            window.location.href = 'pages/home.html';
        }, 200);
    }

    // 添加按鈕懸停效果
    [mobileBtn, pcBtn].forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
