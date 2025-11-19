// 初始化交叉查詢功能
function initCrossQuery() {
    const crossQueryBtn = document.getElementById('cross-query-btn');
    const materialSelect = document.getElementById('material-select');
    const stainSelect = document.getElementById('stain-select');
    
    // 彈出選項相關元素
    const materialButton = document.getElementById('material-button');
    const stainButton = document.getElementById('stain-button');
    const materialOptions = document.getElementById('material-options');
    const stainOptions = document.getElementById('stain-options');
    const closeButtons = document.querySelectorAll('.close-popup');
    const allOptions = document.querySelectorAll('.option');
    
    // 按鈕點擊彈出選項
    materialButton.addEventListener('click', function(e) {
        // 添加波紋動畫效果
        this.classList.add('animate');
        
        // 延遲顯示選項面板，等動畫效果先顯示
        setTimeout(() => {
            materialOptions.classList.remove('hidden');
            materialOptions.classList.add('show');
            document.body.style.overflow = 'hidden'; // 防止背景捲動
        }, 150);
        
        // 移除動畫類，以便下次點擊可再次觸發
        setTimeout(() => {
            this.classList.remove('animate');
        }, 700);
    });
    
    stainButton.addEventListener('click', function() {
        // 添加波紋動畫效果
        this.classList.add('animate');
        
        // 延遲顯示選項面板，等動畫效果先顯示
        setTimeout(() => {
            stainOptions.classList.remove('hidden');
            stainOptions.classList.add('show');
            document.body.style.overflow = 'hidden'; // 防止背景捲動
        }, 150);
        
        // 移除動畫類，以便下次點擊可再次觸發
        setTimeout(() => {
            this.classList.remove('animate');
        }, 700);
    });
    
    // 關閉按鈕點擊 - 添加滑回動畫
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 找到父元素
            const popup = button.closest('.popup-options');
            
            // 清除show類
            popup.classList.remove('show');
            
            // 添加滑回動畫
            popup.classList.add('slideup');
            
            // 等動畫完成才真正隱藏
            setTimeout(function() {
                popup.classList.remove('slideup');
                popup.classList.add('hidden');
            }, 400); // 與slideUp動畫時間一致
            
            document.body.style.overflow = ''; // 恢復捲動
        });
    });
    
    // 選擇選項
    allOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent.trim();
            const parentPopup = this.closest('.popup-options');
            
            // 清除同組中的所有選中狀態
            const siblings = this.closest('.options-group').querySelectorAll('.option');
            siblings.forEach(sib => sib.classList.remove('selected'));
            
            // 添加選中狀態
            this.classList.add('selected');
            
            if (parentPopup.id === 'material-options') {
                materialSelect.value = value;
                materialButton.querySelector('span').textContent = text;
            } else if (parentPopup.id === 'stain-options') {
                stainSelect.value = value;
                stainButton.querySelector('span').textContent = text;
            }
            
            // 關閉彈出選項 - 添加滑回動畫
            parentPopup.classList.remove('show');
            
            // 添加滑回動畫
            parentPopup.classList.add('slideup');
            
            // 等動畫完成才真正隱藏
            setTimeout(function() {
                parentPopup.classList.remove('slideup');
                parentPopup.classList.add('hidden');
            }, 400);
            
            document.body.style.overflow = ''; // 恢復捲動
        });
    });
    
    crossQueryBtn.addEventListener('click', function() {
        const material = materialSelect.value;
        const stain = stainSelect.value;
                
        if (!material || !stain) {
            alert('請先選擇物料和污漬類型');
            return;
        }
                
        const crossQueryResult = document.getElementById('cross-query-result');
        const crossQueryTitle = document.getElementById('cross-query-title');
        const crossQueryContent = document.getElementById('cross-query-content');
                
        const materialName = materialsData[material]?.name || material;
        const stainName = stainsData[stain]?.name || stain;
        
        crossQueryTitle.textContent = `你查詢的：${materialName} + ${stainName} 處理方法`;
        
        const result = getCrossQueryResult(material, stain);
        
        // 創建更多獨立元素以便應用動畫效果
        crossQueryContent.innerHTML = '';
        
        // 添加查詢標題元素
        const titleEl = document.createElement('h3');
        titleEl.textContent = `${materialName} + ${stainName} 組合清洗方法`;
        titleEl.style.marginBottom = '15px';
        crossQueryContent.appendChild(titleEl);
        
        // 添加一個標籤元素
        const tagEl = document.createElement('div');
        tagEl.className = 'prohibition-tag';
        tagEl.textContent = '清洗步驟與禁忌';
        tagEl.style.padding = '8px 16px';
        tagEl.style.background = 'linear-gradient(135deg, #ff8a65, #ff7043)';
        tagEl.style.color = 'white';
        tagEl.style.borderRadius = '20px';
        tagEl.style.display = 'inline-block';
        tagEl.style.marginBottom = '15px';
        crossQueryContent.appendChild(tagEl);
        
        // 添加卡片元素
        const cardEl = document.createElement('div');
        cardEl.className = 'step-card';
        
        // 添加結果內容，按行拆分為單獨元素
        const lines = result.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
            const lineEl = document.createElement('p');
            if (line.includes('禁止') || line.includes('❌')) {
                lineEl.style.color = '#ff3b30';
                lineEl.style.fontWeight = 'bold';
            }
            lineEl.innerHTML = line;
            lineEl.style.margin = '8px 0';
            cardEl.appendChild(lineEl);
        });
        
        crossQueryContent.appendChild(cardEl);
        
        // 添加提示元素
        const tipEl = document.createElement('div');
        tipEl.className = 'hint cross-query-hint';
        tipEl.innerHTML = '<i class="fas fa-lightbulb" style="color: #ff9500;"></i> <span>以上建議僅供參考，請根據衣物標簽指示操作</span>';
        tipEl.style.marginTop = '15px';
        tipEl.style.padding = '10px';
        // 背景色通過CSS控制
        tipEl.style.borderRadius = '8px';
        tipEl.style.fontSize = '14px';
        crossQueryContent.appendChild(tipEl);
        
        // 添加AI免責聲明
        const disclaimerEl = document.createElement('div');
        disclaimerEl.className = 'ai-disclaimer';
        disclaimerEl.textContent = '以上內容由AI生成，信息僅供參考，請注意甄別';
        crossQueryContent.appendChild(disclaimerEl);
        
        // 顯示結果
        crossQueryResult.classList.remove('hidden');
        void crossQueryResult.offsetWidth; // 強制重繪
        crossQueryResult.classList.add('slide-in');
        
        // 為內容添加動畫
        setTimeout(() => {
            crossQueryContent.classList.add('animated');
        }, 300);
        
        // 內容動畫完成後移除動畫類
        setTimeout(() => {
            crossQueryResult.classList.remove('slide-in');
        }, 400);
    });
}
