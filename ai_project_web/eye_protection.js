// 護眼模式功能
document.addEventListener('DOMContentLoaded', function() {
    // 獲取護眼模式開關
    const eyeProtectionToggle = document.querySelector('.eye-protection-container #input');
    
    // 檢查本地存儲中是否有保存的護眼模式設置
    const savedDarkMode = localStorage.getItem('darkMode');
    
    // 設置護眼模式狀態函數
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            eyeProtectionToggle.checked = true;
            // 通知用戶已開啟護眼模式
            showModeChangeNotification('已開啟護眼模式', '#1a1a1a');
        } else {
            document.body.classList.remove('dark-mode');
            eyeProtectionToggle.checked = false;
            // 通知用戶已關閉護眼模式
            showModeChangeNotification('已關閉護眼模式', '#f9f9f9');
        }
    }
    
    // 顯示模式切換通知
    function showModeChangeNotification(message, bgColor) {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '100px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '20px';
        notification.style.backgroundColor = bgColor;
        notification.style.color = bgColor === '#1a1a1a' ? '#fff' : '#333';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '2000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        
        // 添加到頁面
        document.body.appendChild(notification);
        
        // 顯示通知
        setTimeout(() => {
            notification.style.opacity = '1';
            
            // 2秒後隱藏
            setTimeout(() => {
                notification.style.opacity = '0';
                // 動畫結束後移除
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        }, 100);
    }
    
    // 如果有保存的設置，應用它
    if (savedDarkMode === 'true') {
        setDarkMode(true);
    } else if (savedDarkMode === 'false') {
        setDarkMode(false);
    } else {
        // 只有當沒有手動設置時才使用系統偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
    }
    
    // 切換護眼模式
    eyeProtectionToggle.addEventListener('change', function() {
        setDarkMode(this.checked);
        localStorage.setItem('darkMode', this.checked ? 'true' : 'false');
    });
    
    // 監聽系統主題變化
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // 只有在用戶沒有明確手動設置偏好時才跟隨系統
            if (localStorage.getItem('darkMode') !== 'true' && localStorage.getItem('darkMode') !== 'false') {
                setDarkMode(e.matches);
            }
        });
    }
});
