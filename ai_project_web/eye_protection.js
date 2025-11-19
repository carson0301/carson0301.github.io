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
    
    // 無論先前設置如何，強制網站開啟時為淺色模式
    setDarkMode(false);
    localStorage.setItem('darkMode', 'false');
    
    // 只有當使用者明確選擇了護眼模式並保存到本地時才應用
    if (savedDarkMode === 'true') {
        setDarkMode(true);
    }
    
    // 切換護眼模式
    eyeProtectionToggle.addEventListener('change', function() {
        setDarkMode(this.checked);
        localStorage.setItem('darkMode', this.checked ? 'true' : 'false');
    });
    
    // 移除系統主題變化監聽器，不再自動跟隨系統設置
    // 完全依賴用戶的手動設置
});
