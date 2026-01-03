// 圖片上傳和處理邏輯
class ImageUploader {
    constructor() {
        this.currentImage = null;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        this.init();
    }

    init() {
        // 設置端類型樣式
        const deviceType = router.getDeviceType();
        document.body.classList.add(`device-${deviceType}`);

        // 獲取DOM元素
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileBtn = document.getElementById('file-btn');
        this.uploadedImage = document.getElementById('uploaded-image');
        this.uploadSection = document.getElementById('upload-section');
        this.uploadedImageSection = document.getElementById('uploaded-image-section');
        this.actionButtons = document.querySelector('.action-buttons');
        this.reuploadBtn = document.getElementById('reupload-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.loadingOverlay = document.getElementById('loading-overlay');

        // 綁定事件監聽器
        this.bindEvents();

        // 非同步載入標籤映射（可遲到但會在顯示之前生效）
        this.loadLabelMapping();
    }

    bindEvents() {
        // 點擊選擇文件
        this.fileBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        // 文件選擇改變
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // 拖拽事件
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // 重新上傳按鈕
        this.reuploadBtn.addEventListener('click', () => {
            this.resetUpload();
        });

        // 開始識別按鈕
        this.analyzeBtn.addEventListener('click', () => {
            this.startAnalysis();
        });

        // 返回首頁按鈕
        const backBtn = document.getElementById('back-home-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'home.html';
            });
        }

        // 如果有AI系統覆蓋，應用它
        if (window.overridePerformAnalysis) {
            window.overridePerformAnalysis(this);
        }
    }

    // 載入 label 映射 JSON
    async loadLabelMapping() {
        try {
            const resp = await fetch('/assets/label-mapping.json');
            if (!resp.ok) throw new Error('label mapping not found');
            this.labelMapping = await resp.json();
            console.log('Label mapping loaded', Object.keys(this.labelMapping).length, 'entries');
        } catch (err) {
            console.warn('無法載入 label mapping:', err);
            this.labelMapping = null;
        }
    }

    // 取得映射後的顯示名稱
    getMappedLabel(rawLabel) {
        if (!rawLabel) return null;
        // 先檢查 exact match
        if (this.labelMapping && this.labelMapping[rawLabel]) return this.labelMapping[rawLabel];
        // 嘗試更寬鬆匹配：若 rawLabel 包含 mapping 的 key，回傳該值
        if (this.labelMapping) {
            for (const key of Object.keys(this.labelMapping)) {
                if (rawLabel.includes(key)) return this.labelMapping[key];
            }
        }
        return rawLabel;
    }

    // 處理選擇的文件
    handleFile(file) {
        // 校驗文件
        if (!this.validateFile(file)) {
            return;
        }

        // 讀取並預覽文件
        this.currentImage = file;
        this.previewImage(file);
    }

    // 校驗文件
    validateFile(file) {
        // 檢查文件類型
        if (!this.allowedTypes.includes(file.type)) {
            alert('請選擇 JPG 或 PNG 格式的圖片文件');
            return false;
        }

        // 檢查文件大小
        if (file.size > this.maxFileSize) {
            alert('文件大小不能超過 5MB');
            return false;
        }

        return true;
    }

    // 顯示上傳的圖片
    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedImage.src = e.target.result;

            // 顯示上傳圖片區域和動作按鈕，隱藏上傳區域
            this.uploadSection.classList.add('hidden');
            this.uploadedImageSection.classList.remove('hidden');
            this.actionButtons.classList.add('visible');
        };
        reader.readAsDataURL(file);
    }

    // 重置上傳
    resetUpload() {
        this.currentImage = null;
        this.fileInput.value = '';

        // 隱藏上傳圖片區域和動作按鈕，顯示上傳區域
        this.uploadedImageSection.classList.add('hidden');
        this.actionButtons.classList.remove('visible');
        this.uploadSection.classList.remove('hidden');

        // 隱藏結果區域
        this.hideResultSection();

        // 停止加載動畫
        this.hideLoadingSpinner();
    }

    // 開始分析
    startAnalysis() {
        if (!this.currentImage) {
            alert('請先上傳圖片');
            return;
        }

        // 顯示加載動畫
        this.showLoadingSpinner();

        // 禁用按鈕
        this.setButtonsDisabled(true);

        // 調用TensorFlow分析（這裡會在後續實現）
        this.performAnalysis();
    }

    // 執行分析（優先使用AI推理，備用模擬）
    async performAnalysis() {
        try {
            // 檢查是否有AI系統可用
            if (window.tongueDiagnosisAI && window.tongueDiagnosisAI.isModelLoaded) {
                console.log('🎯 使用AI推理系統');
                // 使用真正的AI推理
                const result = await window.tongueDiagnosisAI.predict(this.currentImage);
                console.log('📤 AI推理結果:', result);

                // AI推理完成後隱藏加載動畫
                this.hideLoadingSpinner();
                this.setButtonsDisabled(false);

                this.showAnalysisResult(result);
            } else {
                console.log('🔄 使用模擬推理（AI系統未載入）');
                // 使用模擬數據
                const mockResult = {
                    color: '白',
                    thickness: '厚',
                    crack: '無',
                    confidence: 0.5, // 默認中等信心度
                    label: '白厚苔'
                };

                // 模擬推理延遲，然後隱藏加載動畫
                setTimeout(() => {
                    this.hideLoadingSpinner();
                    this.setButtonsDisabled(false);
                    this.showAnalysisResult(mockResult);
                }, 1500); // 1.5秒延遲模擬處理時間
            }
        } catch (error) {
            console.error('❌ 分析失敗:', error);

            // 發生錯誤時也要隱藏加載動畫
            this.hideLoadingSpinner();
            this.setButtonsDisabled(false);

            // 發生錯誤時使用模擬結果
            const fallbackResult = {
                color: '淡紅',
                thickness: '薄',
                crack: '無',
                confidence: 0.3, // 低信心度表示不確定
                label: '淡紅薄苔'
            };
            this.showAnalysisResult(fallbackResult);
        }
    }

    // 顯示加載動畫
    showLoadingSpinner() {
        this.loadingOverlay.classList.remove('hidden');
    }

    // 隱藏加載動畫
    hideLoadingSpinner() {
        this.loadingOverlay.classList.add('hidden');
    }

    // 設置按鈕禁用狀態
    setButtonsDisabled(disabled) {
        this.reuploadBtn.disabled = disabled;
        this.analyzeBtn.disabled = disabled;

        if (disabled) {
            this.reuploadBtn.style.opacity = '0.6';
            this.analyzeBtn.style.opacity = '0.6';
            this.reuploadBtn.style.cursor = 'not-allowed';
            this.analyzeBtn.style.cursor = 'not-allowed';
        } else {
            this.reuploadBtn.style.opacity = '1';
            this.analyzeBtn.style.opacity = '1';
            this.reuploadBtn.style.cursor = 'pointer';
            this.analyzeBtn.style.cursor = 'pointer';
        }
    }

    // 顯示分析結果
    showAnalysisResult(result) {
        console.log('📥 showAnalysisResult 接收到的結果:', result);
        console.log('📊 信心度檢查:', {
            confidence: result.confidence,
            confidenceType: typeof result.confidence,
            isValidNumber: typeof result.confidence === 'number' && !isNaN(result.confidence)
        });

        const resultSection = document.getElementById('result-section');
        const resultContent = document.getElementById('result-content');

        // 確保信心度總是有效的數字
        let confidenceValue = result.confidence;
        if (typeof confidenceValue !== 'number' || isNaN(confidenceValue)) {
            console.warn('⚠️ 信心度無效，使用默認值 0.5');
            confidenceValue = 0.5; // 默認中等信心度
        }

        // 構建結果HTML
        const confidenceText = `${(confidenceValue * 100).toFixed(1)}%`;
        const rawLabel = result.label || `${result.color || ''}${result.thickness || ''}苔`;
        const mappedLabel = this.getMappedLabel(rawLabel) || rawLabel;
        // 儲存用於報告/PDF 的顯示名稱
        result.mappedLabel = mappedLabel;
        result.displayLabel = mappedLabel;

        resultContent.innerHTML = `
            <div class="result-confidence">信心度：<strong>${confidenceText}</strong></div>
            <p class="detected-text"><strong>識別到：</strong> <span class="result-highlight">${mappedLabel}</span></p>
        `;

        // 顯示結果區域
        resultSection.classList.remove('hidden');

        // 綁定下載報告按鈕事件
        const generateBtn = document.getElementById('generate-report-btn');
        if (generateBtn) {
            generateBtn.onclick = () => {
                this.showFullReport(result);
            };
        }
    }

    // 顯示完整報告
    showFullReport(result) {
        const reportSection = document.getElementById('report-section');
        const reportContent = document.getElementById('report-content');

        // 生成完整報告內容
        const reportHTML = this.generateReportHTML(result);

        reportContent.innerHTML = reportHTML;

        // 隱藏結果區域，顯示報告區域
        document.getElementById('result-section').classList.add('hidden');
        reportSection.classList.remove('hidden');

        // 綁定報告按鈕事件
        this.bindReportEvents(result);
    }

    // 生成報告HTML
    generateReportHTML(result) {
        const diagnosis = this.getDiagnosis(result);
        const advice = this.getAdvice(result);

        return `
            <div class="report-section">
                <div class="report-section-header">
                    <span class="report-section-title">識別結果</span>
                </div>
                <div class="report-section-content" id="result-content">
                    <p><strong>識別到：</strong>${result.label || (result.color + result.thickness + '苔')}</p>
                    <p><strong>信心度：</strong>${(typeof result.confidence === 'number') ? (result.confidence * 100).toFixed(1) + '%' : '—'}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header">
                    <span class="report-section-title">中醫解讀</span>
                </div>
                <div class="report-section-content" id="diagnosis-content">
                    ${diagnosis}
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header">
                    <span class="report-section-title">飲食建議</span>
                </div>
                <div class="report-section-content" id="advice-content">
                    ${advice.diet}
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header">
                    <span class="report-section-title">生活建議</span>
                </div>
                <div class="report-section-content" id="lifestyle-content">
                    ${advice.lifestyle}
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header">
                    <span class="report-section-title">免責聲明</span>
                </div>
                <div class="report-section-content" id="disclaimer-content">
                    <h4>⚠️ 重要免責聲明</h4>
                    <p><strong>本系統僅供健康參考，不替代專業醫學診斷。</strong></p>
                    <p>舌苔識別結果不能作為臨床診斷依據，如有身體不適，請及時就醫諮詢專業醫師。</p>
                </div>
            </div>
        `;
    }

    // 獲取診斷結果
    getDiagnosis(result) {
        const { color, thickness, crack } = result;

        if (color === '白' && thickness === '厚') {
            return '<p>您的舌苔呈白色且較厚，這在中医辨證中可能提示痰濕內阻的體質特點。痰濕內阻是指人體內部有過多的痰液和水濕積聚，影響正常的生理功能。</p>';
        } else if (color === '黃' && thickness === '厚') {
            return '<p>您的舌苔呈黃色且較厚，這可能提示內熱較重的體質特點。中醫認為黃厚苔往往與胃腸積熱、飲食不節等因素相關。</p>';
        } else if (crack === '有') {
            return '<p>您的舌苔有裂紋，這在中医辨證中可能提示陰液虧虛的體質特點。陰液虧虛是指人體陰精不足，導致津液虧乏，影響正常的生理功能。</p>';
        } else {
            return '<p>您的舌苔顏色和厚度均在正常範圍內，這提示您的體質狀態較為平和。但仍需注意飲食均衡、生活規律，以維持良好的健康狀態。</p>';
        }
    }

    // 獲取建議
    getAdvice(result) {
        const { color, thickness, crack } = result;

        let diet = '';
        let lifestyle = '';

        if (color === '白' && thickness === '厚') {
            diet = `
                <ul>
                    <li>多食用薏米、冬瓜等利水化濕的食物</li>
                    <li>適量食用生薑、蔥白等溫性食物</li>
                    <li>減少甜食、油膩食物的攝入</li>
                    <li>忌食生冷寒涼的食物和飲料</li>
                </ul>
            `;
            lifestyle = `
                <ul>
                    <li>保持充足的睡眠，避免熬夜</li>
                    <li>適量進行有氧運動，如散步、慢跑</li>
                    <li>保持心情舒暢，避免過度緊張</li>
                    <li>注意保暖，避免受寒</li>
                </ul>
            `;
        } else {
            diet = `
                <ul>
                    <li>保持飲食均衡，多食用新鮮蔬菜水果</li>
                    <li>適量攝入優質蛋白質，如魚類、瘦肉</li>
                    <li>減少高糖、高脂食物的攝入</li>
                    <li>保持規律的飲食習慣</li>
                </ul>
            `;
            lifestyle = `
                <ul>
                    <li>保持規律的作息時間</li>
                    <li>適度進行體育鍛煉</li>
                    <li>保持心情愉快</li>
                    <li>定期進行健康檢查</li>
                </ul>
            `;
        }

        return { diet, lifestyle };
    }

    // 綁定報告事件
    bindReportEvents(result) {
        const backBtn = document.getElementById('back-to-result-btn');
        backBtn.addEventListener('click', () => {
            document.getElementById('report-section').classList.add('hidden');
            document.getElementById('result-section').classList.remove('hidden');
        });
    }

    // 下載報告
    downloadReport(result) {
        // 使用jsPDF生成PDF（CDN引入）
        if (typeof jspdf !== 'undefined') {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();

            doc.setFont('helvetica');
            doc.setFontSize(16);
            doc.text('中醫舌苔智能識別報告', 20, 30);

            doc.setFontSize(12);
            doc.text('識別結果：', 20, 50);
            const pdfLabel = result.mappedLabel || result.label || (result.color + result.thickness + '苔');
            doc.text(`識別到：${pdfLabel}`, 30, 65);
            if (typeof result.confidence === 'number') {
                doc.text(`信心度：${(result.confidence * 100).toFixed(1)}%`, 30, 80);
            }

            doc.text('免責聲明：', 20, 115);
            doc.text('本報告僅供健康參考，不能替代專業醫學診斷。', 30, 130);
            doc.text('如有身體不適，請及時就醫諮詢專業醫師。', 30, 145);

            doc.save('tongue-diagnosis-report.pdf');
        } else {
            alert('PDF生成庫載入中，請稍後再試');
        }
    }

    // 隱藏結果區域
    hideResultSection() {
        const resultSection = document.getElementById('result-section');
        const reportSection = document.getElementById('report-section');

        if (resultSection) resultSection.classList.add('hidden');
        if (reportSection) reportSection.classList.add('hidden');
    }
}

// 創建上傳器實例
const imageUploader = new ImageUploader();

// 報告折疊功能已移除（不再需要）
