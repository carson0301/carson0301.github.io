// 顯示物料詳情
function showMaterialDetail(type) {
    const material = materialsData[type];
    if (!material) return;
    
    const detailView = document.getElementById('detail-view');
    const detailTitle = document.getElementById('detail-title');
    const detailContent = document.getElementById('detail-content');
    
    // 預先設置內容
    detailTitle.textContent = material.name;
    
    let content = '<div class="step-card">';
    
    // 禁止操作標簽
    if (material.prohibitions && material.prohibitions.length > 0) {
        content += '<div class="prohibition-tag">禁止操作</div>';
        content += '<ul>';
        material.prohibitions.forEach(prohibition => {
            content += `<li>${prohibition}</li>`;
        });
        content += '</ul><br>';
    }
    
    // 清洗步驟
    content += '<h4>清洗方法</h4>';
    material.steps.forEach((step, index) => {
        const stepText = step.important ? `<span class="bold">${step.text}</span>` : step.text;
        content += `
            <div class="step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">${stepText}</div>
            </div>
        `;
    });
    
    content += '</div>';
    
    // 添加AI免責聲明
    content += '<div class="ai-disclaimer">以上內容由AI生成，信息僅供參考，請注意甄別</div>';
    
    detailContent.innerHTML = content;
    
    // 添加進入動畫效果
    detailView.classList.remove('hidden');
    void detailView.offsetWidth; // 強制重繪
    detailView.classList.add('slide-in');
    
    // 動畫完成後移除動畫類
    setTimeout(() => {
        detailView.classList.remove('slide-in');
    }, 400);
}

// 顯示污漬詳情
function showStainDetail(type) {
    const stain = stainsData[type];
    if (!stain) return;
    
    const detailView = document.getElementById('detail-view');
    const detailTitle = document.getElementById('detail-title');
    const detailContent = document.getElementById('detail-content');
    
    // 預先設置內容
    detailTitle.textContent = stain.name + "處理方法";
    
    let content = '<div class="step-card">';
    
    // 清洗步驟
    stain.steps.forEach((step, index) => {
        const stepText = step.important ? `<span class="bold">${step.text}</span>` : step.text;
        content += `
            <div class="step">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    ${stepText}
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    
    // 添加AI免責聲明
    content += '<div class="ai-disclaimer">以上內容由AI生成，信息僅供參考，請注意甄別</div>';
    
    detailContent.innerHTML = content;
    
    // 添加進入動畫效果
    detailView.classList.remove('hidden');
    void detailView.offsetWidth; // 強制重繪
    detailView.classList.add('slide-in');
    
    // 動畫完成後移除動畫類
    setTimeout(() => {
        detailView.classList.remove('slide-in');
    }, 400);
}
