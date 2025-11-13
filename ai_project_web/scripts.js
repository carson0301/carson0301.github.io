// DeepSeek API配置
window.DEEPSEEK_API_KEY = "sk-f554f4b4b9fc444a9184a57e9f0e91f6";

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化標簽切換
    initTabs();
    
    // 初始化物料和污漬點擊事件
    initItemsClick();
    
    // 初始化AI功能
    initAIFeatures();
    
    // 初始化交叉查詢功能
    initCrossQuery();
    
    // 初始化全屏圖片查看器
    initFullscreenViewer();
    
    // 初始化按鈕波紋效果
    initRippleEffect();
    
    // 初始化返回按鈕
    document.getElementById('back-button').addEventListener('click', function() {
        const detailView = document.getElementById('detail-view');
        
        // 添加退出動畫
        detailView.style.transform = 'translateY(0)';
        detailView.style.opacity = '1';
        
        setTimeout(() => {
            detailView.style.transform = 'translateY(20px)';
            detailView.style.opacity = '0';
            
            // 動畫結束後隱藏
            setTimeout(() => {
                detailView.classList.add('hidden');
                // 重置樣式以備下次動畫
                detailView.style.transform = '';
                detailView.style.opacity = '';
            }, 300);
        }, 10);
    });
    
    document.getElementById('cross-query-back').addEventListener('click', function() {
        const crossQueryResult = document.getElementById('cross-query-result');
        
        // 添加退出動畫
        crossQueryResult.style.transform = 'translateY(0)';
        crossQueryResult.style.opacity = '1';
        
        setTimeout(() => {
            crossQueryResult.style.transform = 'translateY(20px)';
            crossQueryResult.style.opacity = '0';
            
            // 動畫結束後隱藏
            setTimeout(() => {
                crossQueryResult.classList.add('hidden');
                // 重置樣式以備下次動畫
                crossQueryResult.style.transform = '';
                crossQueryResult.style.opacity = '';
            }, 300);
        }, 10);
    });
});

// 初始化標簽切換
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const sections = document.querySelectorAll('.section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.classList.contains('active')) return; // 如果已經是活躍的標簽，不做任何操作
            
            // 準備要顯示的部分
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            const currentActive = document.querySelector('.section:not(.hidden)');
            
            // 切換標簽活躍狀態
            tabs.forEach(t => {
                if (t !== this) {
                    t.classList.remove('active');
                }
            });
            
            // 加入過渡動畫效果
            if (currentActive) {
                // 先添加過渡效果的類名
                currentActive.style.opacity = '1';
                targetSection.style.opacity = '0';
                targetSection.style.transform = 'translateX(20px)';
                
                // 轉換顯示狀態
                setTimeout(() => {
                    currentActive.classList.add('hidden');
                    targetSection.classList.remove('hidden');
                    
                    // 強制重繪
                    getComputedStyle(targetSection).opacity;
                    
                    // 加入導入動畫
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateX(0)';
                }, 50);
                
                // 添加當前active類
                setTimeout(() => {
                    this.classList.add('active');
                }, 100);
            } else {
                // 假如沒有現有活躍的部分，直接顯示
                targetSection.classList.remove('hidden');
                this.classList.add('active');
            }
        });
    });
}

// 初始化物料和污漬點擊事件
function initItemsClick() {
    // 物料點擊
    const materialItems = document.querySelectorAll('#materials-section .item');
    materialItems.forEach(item => {
        item.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            showMaterialDetail(type);
        });
    });
    
    // 物料照片區點擊 - 直接顯示詳情而非全屏圖片
    const materialPhotoPlaceholders = document.querySelectorAll('#materials-section .photo-placeholder');
    materialPhotoPlaceholders.forEach(placeholder => {
        placeholder.onclick = function(e) {
            e.stopPropagation();
            const item = this.closest('.item');
            const type = item.getAttribute('data-type');
            showMaterialDetail(type);
        };
    });
    
    // 污漬點擊
    const stainItems = document.querySelectorAll('#stains-section .item');
    stainItems.forEach(item => {
        item.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            showStainDetail(type);
        });
    });
    
    // 污漬照片區點擊 - 直接顯示詳情而非全屏圖片
    const stainPhotoPlaceholders = document.querySelectorAll('#stains-section .photo-placeholder');
    stainPhotoPlaceholders.forEach(placeholder => {
        placeholder.onclick = function(e) {
            e.stopPropagation();
            const item = this.closest('.item');
            const type = item.getAttribute('data-type');
            showStainDetail(type);
        };
    });
}

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

// 初始化AI功能
function initAIFeatures() {
    // 初始化聖天功能
    initChatDialog();
    
    // 拍照按鈕
    const photoBtn = document.getElementById('photo-btn');
    const photoInput = document.getElementById('photo-input');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const submitPhoto = document.getElementById('submit-photo');
    const cancelPhoto = document.getElementById('cancel-photo');
    
    photoBtn.addEventListener('click', function() {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    submitPhoto.addEventListener('click', function() {
        const aiLoading = document.getElementById('ai-loading');
        const aiResult = document.getElementById('ai-result');
        
        photoPreviewContainer.classList.add('hidden');
        aiLoading.classList.remove('hidden');
        
        // 將圖片轉換為base64格式並發送到API
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
            
            // 調用DeepSeek多模態API
            callDeepSeekVisionAPI(base64Image)
                .then(response => {
                    aiLoading.classList.add('hidden');
                    aiResult.classList.remove('hidden');
                    
                    document.getElementById('ai-response-container').textContent = response;
                })
                .catch(error => {
                    aiLoading.classList.add('hidden');
                    document.getElementById('ai-response-container').textContent = "發生錯誤：" + error.message;
                    aiResult.classList.remove('hidden');
                });
        };
        
        img.src = photoPreview.src;
    });
    
    cancelPhoto.addEventListener('click', function() {
        photoPreviewContainer.classList.add('hidden');
        photoInput.value = '';
    });
    
    // 語音按鈕
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    let recognition;
    
    // 檢查瀏覽器是否支持Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'zh-HK';  // 設置為廣東話
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            voiceStatus.classList.add('hidden');
            
            const aiLoading = document.getElementById('ai-loading');
            const aiResult = document.getElementById('ai-result');
            
            aiLoading.classList.remove('hidden');
            
            // 調用DeepSeek API
            callDeepSeekAPI(transcript)
                .then(response => {
                    aiLoading.classList.add('hidden');
                    aiResult.classList.remove('hidden');
                    
                    document.getElementById('ai-response-container').textContent = response;
                })
                .catch(error => {
                    aiLoading.classList.add('hidden');
                    document.getElementById('ai-response-container').textContent = "發生錯誤：" + error.message;
                    aiResult.classList.remove('hidden');
                });
        };
        
        recognition.onerror = function(event) {
            voiceStatus.classList.add('hidden');
            console.error('語音識別錯誤:', event.error);
        };
        
        voiceBtn.addEventListener('mousedown', function() {
            voiceBtn.classList.add('recording');
            voiceStatus.classList.remove('hidden');
            recognition.start();
        });
        
        voiceBtn.addEventListener('mouseup', function() {
            voiceBtn.classList.remove('recording');
            recognition.stop();
        });
        
        voiceBtn.addEventListener('mouseleave', function() {
            if (voiceBtn.classList.contains('recording')) {
                voiceBtn.classList.remove('recording');
                recognition.stop();
            }
        });
    } else {
        voiceBtn.disabled = true;
        voiceBtn.textContent = "🎤 您的瀏覽器不支持語音功能";
    }
}

// 調用DeepSeek文本API
async function callDeepSeekAPI(query) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "你是一個專業的衣物清潔顧問，專門針對污漬處理和布料保養提供建議。請用簡潔的廣東話回答用戶關於衣物清潔的問題。"
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API調用錯誤:', error);
        throw error;
    }
}

// 調用DeepSeek視覺API
async function callDeepSeekVisionAPI(base64Image) {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-vl",
                messages: [
                    {
                        role: "system",
                        content: "你是一個專業的衣物污漬識別專家，能夠識別照片中的污漬類型並提供清潔建議。請用簡潔的廣東話回答。"
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "呢個污漬係乜嘢？點樣清潔佢？"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('視覺API調用錯誤:', error);
        throw error;
    }
}

// 初始化交叉查詢功能
function initCrossQuery() {
    const crossQueryBtn = document.getElementById('cross-query-btn');
    const materialSelect = document.getElementById('material-select');
    const stainSelect = document.getElementById('stain-select');
    
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
        crossQueryContent.innerHTML = `<div class="step-card"><pre>${result}</pre></div>`;
        
        // 添加進入動畫效果
        crossQueryResult.classList.remove('hidden');
        void crossQueryResult.offsetWidth; // 強制重繪
        crossQueryResult.classList.add('slide-in');
        
        // 動畫完成後移除動畫類
        setTimeout(() => {
            crossQueryResult.classList.remove('slide-in');
        }, 400);
    });
}

// 初始化全屏圖片查看器
function initFullscreenViewer() {
    const viewer = document.getElementById('fullscreen-viewer');
    const closeBtn = document.getElementById('close-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    closeBtn.addEventListener('click', function() {
        // 添加淡出效果
        viewer.style.opacity = '0';
        
        // 等待過渡動畫完成後隱藏
        setTimeout(() => {
            viewer.classList.add('hidden');
            // 重置透明度以備下次使用
            setTimeout(() => {
                viewer.style.opacity = '';
            }, 10);
        }, 300);
    });
}

// 顯示全屏圖片
function showFullImage(imageSrc, title) {
    const viewer = document.getElementById('fullscreen-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    // 預先設置內容
    fullscreenImage.src = imageSrc;
    viewerTitle.textContent = title;
    
    // 設置初始透明度為0
    viewer.style.opacity = '0';
    viewer.classList.remove('hidden');
    
    // 強制重繪後添加淡入效果
    setTimeout(() => {
        viewer.style.opacity = '1';
    }, 10);
}

// 初始化按鈕波紋效果
function initRippleEffect() {
    // 選擇所有需要波紋效果的按鈕
    const buttons = document.querySelectorAll('.ai-button, .query-btn, #send-message-btn, #back-button, #cross-query-back, .tab');
    
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    function createRipple(event) {
        const button = event.currentTarget;
        
        // 確保按鈕有相對定位
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        // 計算點擊位置
        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        // 移除現有波紋
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        // 清除波紋效果
        setTimeout(() => {
            if (circle) {
                circle.remove();
            }
        }, 600);
    }
}

// 初始化AI聊天功能
function initChatDialog() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const voiceBtn = document.getElementById('voice-btn');
    const photoBtn = document.getElementById('photo-btn');
    const photoInput = document.getElementById('photo-input');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreview = document.getElementById('photo-preview');
    const submitPhoto = document.getElementById('submit-photo');
    const cancelPhoto = document.getElementById('cancel-photo');
    
    // 送出消息的功能
    function sendMessage(message, isFromVoice = false) {
        if (!message || message.trim() === '') return;
        
        // 新增用戶消息到對話框
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('user-message');
        userMessageElement.textContent = message;
        chatMessages.appendChild(userMessageElement);
        
        // 新增時間戳
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('message-timestamp');
        timestampElement.textContent = 'just now';
        chatMessages.appendChild(timestampElement);
        
        // 清空輸入框如果不是來自語音
        if (!isFromVoice) {
            chatInput.value = '';
        }
        
        // 滾動到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 顯示AI正在思考的提示
        const aiResponseElement = document.createElement('div');
        aiResponseElement.classList.add('ai-response');
        
        const thinkingElement = document.createElement('div');
        thinkingElement.classList.add('ai-response-text');
        thinkingElement.textContent = '正在回覆...';
        aiResponseElement.appendChild(thinkingElement);
        
        chatMessages.appendChild(aiResponseElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 調用DeepSeek API
        callDeepSeekAPI(message)
            .then(response => {
                // 更新AI回覆
                thinkingElement.textContent = response;
                
                // 添加互動按鈕
                const actionsElement = document.createElement('div');
                actionsElement.classList.add('ai-response-actions');
                actionsElement.innerHTML = `
                    <button class="ai-response-action">
                        <i class="far fa-thumbs-up"></i>
                    </button>
                    <button class="ai-response-action">
                        <i class="far fa-thumbs-down"></i>
                    </button>
                    <button class="ai-response-action">
                        <i class="far fa-copy"></i>
                    </button>
                `;
                aiResponseElement.appendChild(actionsElement);
                
                // 滾動到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // 設置按鈕事件
                const actionButtons = actionsElement.querySelectorAll('.ai-response-action');
                actionButtons[0].addEventListener('click', () => {
                    actionButtons[0].innerHTML = '<i class="fas fa-thumbs-up" style="color:#ff40a0;"></i>';
                    actionButtons[1].innerHTML = '<i class="far fa-thumbs-down"></i>';
                });
                
                actionButtons[1].addEventListener('click', () => {
                    actionButtons[1].innerHTML = '<i class="fas fa-thumbs-down" style="color:#ff40a0;"></i>';
                    actionButtons[0].innerHTML = '<i class="far fa-thumbs-up"></i>';
                });
                
                actionButtons[2].addEventListener('click', () => {
                    navigator.clipboard.writeText(response)
                        .then(() => {
                            actionButtons[2].innerHTML = '<i class="fas fa-check" style="color:#34c759;"></i>';
                            setTimeout(() => {
                                actionButtons[2].innerHTML = '<i class="far fa-copy"></i>';
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                        });
                });
            })
            .catch(error => {
                // 顯示錯誤訊息
                thinkingElement.textContent = '發生錯誤，請重試。';
                thinkingElement.style.color = '#ff3b30';
                
                console.error('API調用錯誤:', error);
            });
    }
    
    // 圖片上傳功能
    function setupPhotoUpload() {
        photoBtn.addEventListener('click', function() {
            // 顯示一個小菜單，提供不同選項
            const optionsMenu = document.createElement('div');
            optionsMenu.classList.add('photo-options-menu');
            optionsMenu.innerHTML = `
                <div class="photo-option">
                    <i class="fas fa-camera"></i>
                    <span>拍張照片</span>
                </div>
                <div class="photo-option">
                    <i class="fas fa-image"></i>
                    <span>上傳圖片</span>
                </div>
            `;
            
            // 添加到頁面並定位
            document.body.appendChild(optionsMenu);
            const btnRect = photoBtn.getBoundingClientRect();
            optionsMenu.style.position = 'absolute';
            optionsMenu.style.bottom = `${window.innerHeight - btnRect.top + 10}px`;
            optionsMenu.style.left = `${btnRect.left}px`;
            
            // 設置選項點擊事件
            const options = optionsMenu.querySelectorAll('.photo-option');
            
            // 第一個選項：拍照
            options[0].addEventListener('click', function() {
                photoInput.setAttribute('capture', 'environment');
                photoInput.click();
                document.body.removeChild(optionsMenu);
            });
            
            // 第二個選項：選擇圖片
            options[1].addEventListener('click', function() {
                photoInput.removeAttribute('capture');
                photoInput.click();
                document.body.removeChild(optionsMenu);
            });
            
            // 點擊其他地方關閉選項菜單
            document.addEventListener('click', function closeMenu(e) {
                if (!optionsMenu.contains(e.target) && e.target !== photoBtn) {
                    document.body.removeChild(optionsMenu);
                    document.removeEventListener('click', closeMenu);
                }
            });
        });

        // 照片預覽和提交
        photoInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreview.src = e.target.result;
                    photoPreviewContainer.classList.remove('hidden');
                    
                    // 在對話框中顯示用戶上傳的圖片
                    const userMessageElement = document.createElement('div');
                    userMessageElement.classList.add('user-message');
                    userMessageElement.innerHTML = `<div>我附上了一張圖片讓你看：</div>`;
                    chatMessages.appendChild(userMessageElement);
                    
                    const timestampElement = document.createElement('div');
                    timestampElement.classList.add('message-timestamp');
                    timestampElement.textContent = 'just now';
                    chatMessages.appendChild(timestampElement);
                    
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });

        // 提交照片識別按鈕
        submitPhoto.addEventListener('click', function() {
            // 先將圖片轉換為base64
            const base64Image = photoPreview.src.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
            
            // 顯示AI正在思考的提示
            const aiResponseElement = document.createElement('div');
            aiResponseElement.classList.add('ai-response');
            
            const thinkingElement = document.createElement('div');
            thinkingElement.classList.add('ai-response-text');
            thinkingElement.textContent = '正在分析圖片...';
            aiResponseElement.appendChild(thinkingElement);
            
            chatMessages.appendChild(aiResponseElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 關閉照片預覽
            photoPreviewContainer.classList.add('hidden');
            
            // 調用DeepSeek視覺 API
            callDeepSeekVisionAPI(base64Image)
                .then(response => {
                    // 將圖片新增到AI回覆中
                    const imageElement = document.createElement('div');
                    imageElement.classList.add('ai-response-image');
                    imageElement.innerHTML = `<img src="${photoPreview.src}" alt="上傳的圖片">`;
                    aiResponseElement.insertBefore(imageElement, thinkingElement);
                    
                    // 更新AI回覆
                    thinkingElement.textContent = response;
                    
                    // 添加互動按鈕
                    const actionsElement = document.createElement('div');
                    actionsElement.classList.add('ai-response-actions');
                    actionsElement.innerHTML = `
                        <button class="ai-response-action">
                            <i class="far fa-thumbs-up"></i>
                        </button>
                        <button class="ai-response-action">
                            <i class="far fa-thumbs-down"></i>
                        </button>
                        <button class="ai-response-action">
                            <i class="far fa-copy"></i>
                        </button>
                    `;
                    aiResponseElement.appendChild(actionsElement);
                    
                    // 滾動到底部
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                })
                .catch(error => {
                    // 顯示錯誤訊息
                    thinkingElement.textContent = '圖片識別失敗，請重試。';
                    thinkingElement.style.color = '#ff3b30';
                    
                    console.error('視覺 API調用錯誤:', error);
                });
        });

        // 取消按鈕
        cancelPhoto.addEventListener('click', function() {
            photoPreviewContainer.classList.add('hidden');
            photoInput.value = ''; // 清除選擇的檔案
        });
    }
    
    // 設置語音識別功能
    function setupVoiceRecognition() {
        // 檢查瀏覽器是否支持語音識別
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            const voiceStatus = document.getElementById('voice-status');
            
            // 設置語音識別參數
            recognition.lang = 'zh-HK'; // 粤語
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                voiceStatus.classList.add('hidden');
                
                // 將語音結果發送為消息
                sendMessage(transcript, true);
            };
            
            recognition.onend = function() {
                voiceBtn.classList.remove('recording');
                voiceStatus.classList.add('hidden');
            };
            
            recognition.onerror = function(event) {
                voiceStatus.classList.add('hidden');
                console.error('語音識別錯誤:', event.error);
                
                // 顯示錯誤提示
                const errorToast = document.createElement('div');
                errorToast.classList.add('error-toast');
                errorToast.textContent = '語音識別失敗，請重試';
                document.body.appendChild(errorToast);
                
                setTimeout(() => {
                    document.body.removeChild(errorToast);
                }, 3000);
            };
            
            // 語音按鈕事件
            let isRecording = false;
            
            voiceBtn.addEventListener('click', function() {
                if (!isRecording) {
                    // 開始錄音
                    voiceBtn.classList.add('recording');
                    voiceBtn.style.color = '#ff40a0';
                    voiceStatus.classList.remove('hidden');
                    recognition.start();
                    isRecording = true;
                } else {
                    // 停止錄音
                    voiceBtn.classList.remove('recording');
                    voiceBtn.style.color = '';
                    recognition.stop();
                    isRecording = false;
                }
            });
        } else {
            voiceBtn.disabled = true;
            voiceBtn.title = '您的瀏覽器不支持語音功能';
            console.warn('瀏覽器不支持語音識別');
        }
    }
    
    // 輸入框按Enter鍵事件
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const message = this.value.trim();
            sendMessage(message);
        }
    });
    
    // 初始化圖片上傳功能
    setupPhotoUpload();
    
    // 初始化語音識別功能
    setupVoiceRecognition();
}
