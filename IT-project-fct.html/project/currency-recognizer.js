// 主要邏輯控制
let model, webcam, labelContainer;
let totalAmount = 0;
let currentDetectedValue = 0;
let isCapturing = false;
let currentMode = 1; // 1-驗鈔模式, 2-存款模式
let canDetect = true; // 控制檢測流程的標誌

document.addEventListener('DOMContentLoaded', function() {
    console.log('系統初始化中...');
    
    // 初始化界面和按鈕事件
    initializeUI();
});

/**
 * 初始化用戶界面與事件監聽
 */
function initializeUI() {
    // 設置按鈕事件監聽
    document.getElementById('start-button').addEventListener('click', startRecognition);
    document.getElementById('stop-button').addEventListener('click', stopRecognition);
    document.getElementById('next-button').addEventListener('click', enableNextDetection);
    document.getElementById('confirm-button').addEventListener('click', confirmAmount);
    document.getElementById('reject-button').addEventListener('click', rejectAmount);
    document.getElementById('finish-button').addEventListener('click', finishSaving);
    
    // 模式切換按鈕
    document.getElementById('mode-1').addEventListener('click', () => switchMode(1));
    document.getElementById('mode-2').addEventListener('click', () => switchMode(2));
    
    // 默認為驗鈔模式
    switchMode(1);
}

/**
 * 開始紙幣識別
 */
async function startRecognition() {
    try {
        // 載入 Teachable Machine 模型
        const modelURL = 'https://teachablemachine.withgoogle.com/models/qs-zKmF1S/';
        const checkpointURL = modelURL + 'model.json';
        const metadataURL = modelURL + 'metadata.json';
        
        // 加載模型
        console.log('加載模型中...');
        model = await tmImage.load(checkpointURL, metadataURL);
        
        // 檢測使用者系統
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isAndroid = /android/i.test(userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        
        // 設置網絡攝像頭 - 對於移動設備使用不同參數
        if (isAndroid || isIOS) {
            // 移動設備使用特殊配置，強制使用設備相機
            webcam = new tmImage.Webcam(500, 400, true, {
                facingMode: "environment",
                preferredCameraDevice: "environment"
            });
        } else {
            // 桌面設備使用標準配置
            webcam = new tmImage.Webcam(500, 400, true);
        }
        await webcam.setup();  // 請求攝像頭訪問權限
        await webcam.play();
        
        console.log('攝像頭已啟動');
        
        // 將攝像頭元素添加到DOM
        document.getElementById('webcam-container').appendChild(webcam.canvas);
        
        // 創建標籤容器
        labelContainer = document.getElementById('label-container');
        labelContainer.innerHTML = '';
        
        // 更新狀態
        isCapturing = true;
        canDetect = true;
        
        // 更新按鈕狀態
        document.getElementById('start-button').disabled = true;
        document.getElementById('stop-button').disabled = false;
        
        if (currentMode === 2) { // 存款模式
            document.getElementById('next-button').style.display = 'inline-block';
        }
        
        // 開始識別循環
        loop();
        
        // 添加啟動動畫效果
        addStartupAnimation();
        
    } catch (error) {
        console.error('啟動識別系統錯誤:', error);
        alert('無法啟動攝像頭，請確保您的設備有可用攝像頭並已授予權限。');
    }
}

/**
 * 識別循環
 */
async function loop() {
    if (!isCapturing) return;
    
    webcam.update(); // 更新攝像頭幀
    
    // 只有允許檢測時才進行
    if (canDetect) {
        await predict();
        
        // 在存款模式下，停止連續檢測，等待確認
        if (currentMode === 2) {
            if (currentDetectedValue > 0) {
                canDetect = false;
                document.getElementById('confirmation-buttons').style.display = 'flex';
            }
        }
    }
    
    window.requestAnimationFrame(loop);
}

/**
 * 使用模型進行預測
 */
async function predict() {
    // 使用模型預測
    const prediction = await model.predict(webcam.canvas);
    
    // 清除先前的結果
    labelContainer.innerHTML = '';
    let highestProbability = 0;
    let mostLikelyClass = '';
    let mostLikelyValue = 0;
    
    // 找出最高概率的類別
    prediction.forEach(pred => {
        // 創建結果項
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');
        
        // 從預測標籤中提取幣值（假設格式類似 "100 MOP"）
        const valueMatch = pred.className.match(/(\d+)/);
        const value = valueMatch ? parseInt(valueMatch[1]) : 0;
        
        resultItem.innerHTML = `${pred.className}: ${(pred.probability * 100).toFixed(2)}%`;
        labelContainer.appendChild(resultItem);
        
        // 跟踪最高概率
        if (pred.probability > highestProbability) {
            highestProbability = pred.probability;
            mostLikelyClass = pred.className;
            mostLikelyValue = value;
        }
    });
    
    // 設置當前檢測到的值
    currentDetectedValue = mostLikelyValue;
    
    // 更新當前值顯示
    updateCurrentValueDisplay(mostLikelyClass, highestProbability);
}

/**
 * 更新當前檢測值顯示
 */
function updateCurrentValueDisplay(className, confidence) {
    const currentValueDisplay = document.getElementById('current-value');
    
    if (confidence > 0.70) { // 70% 置信度閾值
        currentValueDisplay.textContent = `${className} (${(confidence * 100).toFixed(2)}% 吻合度)`;
        currentValueDisplay.style.color = '#28a745'; // 綠色表示良好的置信度
    } else if (confidence > 0.5) { // 50-70% 之間
        currentValueDisplay.textContent = `${className} (${(confidence * 100).toFixed(2)}% 信心度) - 低吻合度`;
        currentValueDisplay.style.color = '#ffc107'; // 黃色表示中等置信度
    } else {
        currentValueDisplay.textContent = '無法識別紙幣 - 請調整紙幣位置';
        currentValueDisplay.style.color = '#dc3545'; // 紅色表示低置信度
        currentDetectedValue = 0;
    }
}

/**
 * 停止識別
 */
function stopRecognition() {
    if (webcam) {
        webcam.stop();
    }
    isCapturing = false;
    
    // 更新按鈕狀態
    document.getElementById('start-button').disabled = false;
    document.getElementById('stop-button').disabled = true;
    document.getElementById('next-button').style.display = 'none';
    
    // 隱藏確認按鈕
    document.getElementById('confirmation-buttons').style.display = 'none';
    
    // 清除攝像頭容器
    const webcamContainer = document.getElementById('webcam-container');
    while (webcamContainer.firstChild) {
        webcamContainer.removeChild(webcamContainer.firstChild);
    }
}

/**
 * 啟用下一次檢測
 */
function enableNextDetection() {
    // 啟用下一次檢測
    canDetect = true;
    
    // 隱藏確認按鈕
    document.getElementById('confirmation-buttons').style.display = 'none';
}

/**
 * 確認金額
 */
function confirmAmount() {
    // 將當前檢測到的值添加到總額（用於存款模式）
    if (currentDetectedValue > 0) {
        totalAmount += currentDetectedValue;
        updateTotalDisplay();
        
        // 添加動畫效果
        animateTotalAmount();
        
        displayNotification(`已確認並添加 ${currentDetectedValue} 澳門元到總額`);
    } else {
        displayNotification('未識別到有效紙幣面值', 'error');
    }
    
    // 隱藏確認按鈕並啟用下一次檢測
    document.getElementById('confirmation-buttons').style.display = 'none';
    canDetect = true;
}

/**
 * 拒絕當前金額
 */
function rejectAmount() {
    displayNotification('已拒絕當前識別結果，請重新識別', 'warning');
    
    // 隱藏確認按鈕並啟用下一次檢測
    document.getElementById('confirmation-buttons').style.display = 'none';
    canDetect = true;
}

/**
 * 完成存款
 */
function finishSaving() {
    // 顯示最終總額
    alert(`存款完成！總金額：${totalAmount} 澳門元`);
    
    // 重置總額以開始新的會話
    totalAmount = 0;
    updateTotalDisplay();
    
    // 隱藏確認按鈕
    document.getElementById('confirmation-buttons').style.display = 'none';
}

/**
 * 更新總額顯示
 */
function updateTotalDisplay() {
    document.getElementById('total-amount').textContent = `${totalAmount} 澳門元`;
}

/**
 * 切換模式
 */
function switchMode(mode) {
    currentMode = mode;
    
    // 突出顯示活動模式按鈕
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`mode-${mode}`).classList.add('active');
    
    // 重置狀態
    if (isCapturing) {
        stopRecognition();
    }
    totalAmount = 0;
    updateTotalDisplay();
    document.getElementById('current-value').textContent = '等待識別...';
    document.getElementById('current-value').style.color = '#333';
    
    // 根據模式配置界面
    const nextButton = document.getElementById('next-button');
    const confirmationButtons = document.getElementById('confirmation-buttons');
    const totalSection = document.getElementById('total-section');
    
    // 首先隱藏所有模式特定元素
    nextButton.style.display = 'none';
    confirmationButtons.style.display = 'none';
    totalSection.style.display = 'none';
    
    // 根據所選模式顯示元素
    switch (mode) {
        case 1: // 驗鈔模式 - 僅識別
            // 不需要顯示額外內容
            break;
        
        case 2: // 存款模式 - 添加下一個按鈕和總額部分
            totalSection.style.display = 'block';
            
            if (isCapturing) {
                nextButton.style.display = 'inline-block';
            }
            break;
    }
}

/**
 * 顯示通知
 */
function displayNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 動畫效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自動消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

/**
 * 添加啟動動畫效果
 */
function addStartupAnimation() {
    const webcamContainer = document.getElementById('webcam-container');
    
    // 創建掃描線效果
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line';
    webcamContainer.appendChild(scanLine);
    
    // 創建角落標記效果
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    corners.forEach(corner => {
        const cornerMark = document.createElement('div');
        cornerMark.className = `corner-mark ${corner}`;
        webcamContainer.appendChild(cornerMark);
    });
    
    // 添加CSS
    const style = document.createElement('style');
    style.textContent = `
        .scan-line {
            position: absolute;
            height: 2px;
            width: 100%;
            background: rgba(26, 115, 232, 0.7);
            top: 0;
            left: 0;
            box-shadow: 0 0 8px 2px rgba(26, 115, 232, 0.7);
            animation: scan 2s linear infinite;
            z-index: 2;
        }
        
        @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
        }
        
        .corner-mark {
            position: absolute;
            width: 20px;
            height: 20px;
            border-color: rgba(255, 215, 0, 0.8);
            z-index: 2;
        }
        
        .corner-mark.top-left {
            top: 10px;
            left: 10px;
            border-top: 2px solid;
            border-left: 2px solid;
        }
        
        .corner-mark.top-right {
            top: 10px;
            right: 10px;
            border-top: 2px solid;
            border-right: 2px solid;
        }
        
        .corner-mark.bottom-left {
            bottom: 10px;
            left: 10px;
            border-bottom: 2px solid;
            border-left: 2px solid;
        }
        
        .corner-mark.bottom-right {
            bottom: 10px;
            right: 10px;
            border-bottom: 2px solid;
            border-right: 2px solid;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: -300px;
            width: 300px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: right 0.5s ease;
            z-index: 1000;
        }
        
        .notification.show {
            right: 20px;
        }
        
        .notification.success {
            background: var(--success-green);
        }
        
        .notification.error {
            background: var(--error-red);
        }
        
        .notification.warning {
            background: var(--warning-yellow);
            color: var(--text-dark);
        }
    `;
    document.head.appendChild(style);
}

/**
 * 為總額添加動畫效果
 */
function animateTotalAmount() {
    const totalAmount = document.getElementById('total-amount');
    totalAmount.classList.add('highlight');
    
    // 添加CSS (如果尚未添加)
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes highlight {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .highlight {
                animation: highlight 0.5s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 動畫結束後移除類
    setTimeout(() => {
        totalAmount.classList.remove('highlight');
    }, 500);
}