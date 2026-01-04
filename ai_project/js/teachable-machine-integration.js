// 模仿紙幣識別系統的Teachable Machine實現
class TongueDiagnosisAI {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.imageUploader = null;
        this.classLabels = [];
    }

    // 初始化 - 嘗試多種載入方式，模仿紙幣系統
    async init() {
        try {
            console.log('🔄 載入舌苔識別模型...');

            // 方法1: 嘗試Teachable Machine標準載入
            try {
                const modelURL = '../assets/models/model.json';
                const metadataURL = '../assets/models/metadata.json';

                console.log('📂 嘗試Teachable Machine格式載入...');
                this.model = await tmImage.load(modelURL, metadataURL);
                this.classLabels = this.model.getClassLabels();
                console.log('✅ Teachable Machine載入成功！');
            } catch (tmError) {
                console.log('⚠️ Teachable Machine載入失敗，嘗試TensorFlow.js載入...');

                // 方法2: 回退到TensorFlow.js LayersModel
                try {
                    this.model = await tf.loadLayersModel('../assets/models/model.json');
                    this.classLabels = ['正常舌苔', '寒象舌苔', '熱象舌苔', '陰虛舌苔', '血瘀舌苔'];
                    this.isTensorFlowModel = true;
                    console.log('✅ TensorFlow.js載入成功！');
                } catch (tfError) {
                    throw new Error(`所有載入方式都失敗: TM=${tmError.message}, TF=${tfError.message}`);
                }
            }

            this.isModelLoaded = true;
            console.log('📋 可識別類別:', this.classLabels);
            this.imageUploader = window.imageUploader;

        } catch (error) {
            console.error('❌ 模型載入失敗:', error);
            console.log('🔄 切換到模擬模式...');
            this.isModelLoaded = false;
        }
    }

    // 檢查metadata.json是否存在
    async checkMetadataExists() {
        try {
            const response = await fetch('../assets/models/metadata.json');
            return response.ok;
        } catch {
            return false;
        }
    }

    // 為現有模型創建metadata.json
    async createMetadataFile() {
        console.log('創建Teachable Machine metadata.json...');

        // 基於16類別模型創建metadata
        const metadata = {
            "tfjsVersion": "4.22.0",
            "tmVersion": "2.4.4",
            "packageVersion": "0.8.4",
            "packageName": "@teachablemachine/image",
            "timeStamp": new Date().toISOString(),
            "userMetadata": {},
            "modelName": "舌苔識別模型",
            "labels": [
                "白苔薄無裂紋", "白苔厚無裂紋", "白苔膩有裂紋", "白苔厚有裂紋",
                "黃苔薄無裂紋", "黃苔厚無裂紋", "黃苔膩有裂紋", "黃苔厚有裂紋",
                "淡紅苔薄無裂紋", "淡紅苔厚無裂紋", "淡紅苔膩有裂紋", "淡紅苔厚有裂紋",
                "紫苔薄無裂紋", "紫苔厚無裂紋", "紫苔膩有裂紋", "紫苔厚有裂紋"
            ]
        };

        // 將metadata寫入文件（在實際應用中，這需要服務器端支持）
        // 這裡我們創建一個全局變數供模型使用
        window.tmMetadata = metadata;
        console.log('Teachable Machine metadata已創建');
    }

    // 回退到TensorFlow.js模式
    async fallbackToTensorFlow() {
        console.log('載入TensorFlow.js LayersModel...');
        try {
            this.model = await tf.loadLayersModel('../assets/models/model.json');
            this.isModelLoaded = true;
            this.isTeachableMachine = false;
            console.log('TensorFlow.js模型載入成功（回退模式）');
        } catch (tfError) {
            console.error('所有模型載入方式都失敗:', tfError);
            this.isModelLoaded = false;
            alert('AI模型載入失敗，已切換到模擬模式。您仍然可以使用基本功能。');
        }
    }

    // 執行推理 - 模仿紙幣系統的檢測邏輯
    async predict(imageFile) {
        console.log('🔍 predict 函數被調用, isModelLoaded:', this.isModelLoaded);

        if (!this.isModelLoaded) {
            console.log('🔄 模型未載入，使用模擬檢測');
            const result = await this.simulatePrediction(imageFile);
            console.log('📤 模擬檢測結果:', result);
            return result;
        }

        try {
            console.log('🔍 開始舌苔檢測...');
            const result = await this.teachableMachinePrediction(imageFile);
            console.log('📤 TensorFlow檢測結果:', result);
            return result;
        } catch (error) {
            console.error('❌ 檢測失敗:', error);
            console.log('🔄 切換到模擬模式...');
            const result = await this.simulatePrediction(imageFile);
            console.log('📤 模擬備用結果:', result);
            return result;
        }
    }

    // 統一的檢測方法 - 支援Teachable Machine和TensorFlow.js
    async teachableMachinePrediction(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const img = new Image();
                    img.onload = async () => {
                        console.log('📸 處理圖片中...');

                        let predictions;

                        if (this.isTensorFlowModel) {
                            // TensorFlow.js LayersModel處理
                            console.log('🔧 使用TensorFlow.js推理...');
                            const tensor = this.preprocessImageForTensorFlow(img);
                            const output = await this.model.predict(tensor);
                            const predictionData = await output.data();
                            console.log('📊 TensorFlow.js原始輸出:', predictionData);
                            predictions = this.convertTensorFlowPredictions(predictionData);

                            // 清理tensor
                            tensor.dispose();
                            output.dispose();
                        } else {
                            // Teachable Machine處理
                            console.log('🎯 使用Teachable Machine推理...');
                            predictions = await this.model.predict(img);
                        }

                        console.log('📊 原始檢測結果:', predictions);

                        // 解析結果
                        const result = this.parseTeachableMachinePredictions(predictions);

                        console.log('✅ 舌苔檢測完成:', result);
                        resolve(result);

                    };
                    img.onerror = () => reject(new Error('圖片載入失敗'));
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsDataURL(imageFile);
        });
    }

    // 解析檢測結果 - 統一處理兩種模型格式
    parseTeachableMachinePredictions(predictions) {
        console.log('🔍 所有預測結果:');
        predictions.forEach((pred, index) => {
            console.log(`  ${index}: ${pred.className} (${(pred.probability * 100).toFixed(1)}%)`);
        });

        // 找到最高概率的預測
        let maxPrediction = predictions[0];
        for (let prediction of predictions) {
            if (prediction.probability > maxPrediction.probability) {
                maxPrediction = prediction;
            }
        }

        const className = maxPrediction.className;
        const confidence = maxPrediction.probability;

        console.log('🎯 最高概率檢測:', className, `(信心度: ${(confidence * 100).toFixed(1)}%)`);

        // 信心度檢查
        if (confidence < 0.3) {
            console.log('⚠️ 檢測信心度不足，結果可能不準確');
        }

        // 解析類別名稱為舌苔特征
        const result = this.parseClassName(className, confidence);
        // 加入原始類別名稱供顯示
        result.label = className;

        // 確保信心度是有效的數字
        if (typeof result.confidence !== 'number' || isNaN(result.confidence)) {
            console.warn('⚠️ 信心度無效，使用默認值 0.5');
            result.confidence = 0.5; // 默認中等信心度
        }

        // 調試：確保信心度正確設置
        console.log('📤 最終結果物件:', {
            color: result.color,
            thickness: result.thickness,
            crack: result.crack,
            confidence: result.confidence,
            label: result.label,
            confidenceType: typeof result.confidence,
            isValidNumber: typeof result.confidence === 'number' && !isNaN(result.confidence)
        });

        return result;
    }

    // 獲取分類描述
    getCategoryDescription(category) {
        const descriptions = {
            '正常': '舌質淡紅，苔薄白均勻，反映身體健康狀態良好',
            '寒象': '舌質淡白，苔白厚膩，可能存在寒證或脾虛',
            '熱象': '舌質紅，苔黃厚或膩，可能存在熱證或實熱',
            '陰虛': '舌質紅，苔少或光剝，可能存在陰虛或津液不足',
            '血瘀': '舌質紫暗，有瘀斑或裂紋，可能存在血瘀或氣滯'
        };
        return descriptions[category] || '無法確定舌苔類型';
    }

    // 評估預測可靠性
    assessPredictionReliability(predictions) {
        if (!predictions || predictions.length < 2) return 'low';

        // 計算前兩名預測的信心度差距
        const sortedPredictions = predictions.sort((a, b) => b.probability - a.probability);
        const topConfidence = sortedPredictions[0].probability;
        const secondConfidence = sortedPredictions[1].probability;
        const confidenceGap = topConfidence - secondConfidence;

        // 評估可靠性
        if (topConfidence > 0.8 && confidenceGap > 0.3) return 'high';
        if (topConfidence > 0.6 && confidenceGap > 0.2) return 'medium';
        if (topConfidence > 0.4 && confidenceGap > 0.1) return 'low';
        return 'very_low';
    }

    // TensorFlow.js圖片預處理 - 相容版
    preprocessImageForTensorFlow(img) {
        return tf.tidy(() => {
            // 調整圖片大小為224x224
            const resized = tf.image.resizeBilinear(tf.browser.fromPixels(img), [224, 224]);

            // 正規化到[0,1]
            const normalized = resized.div(255.0);

            // 添加batch維度 [1, 224, 224, 3]
            return normalized.expandDims(0);
        });
    }

    // 轉換TensorFlow.js預測結果為Teachable Machine格式
    convertTensorFlowPredictions(predictionData) {
        console.log('🔄 轉換TensorFlow預測結果，原始數據長度:', predictionData.length);
        console.log('📋 類別標籤數量:', this.classLabels.length);
        console.log('📊 原始預測數據樣本:', Array.from(predictionData.slice(0, 5)).map(x => x.toFixed(4)));

        const predictions = [];
        for (let i = 0; i < Math.min(this.classLabels.length, predictionData.length); i++) {
            const probability = predictionData[i];
            predictions.push({
                className: this.classLabels[i],
                probability: probability
            });
            if (i < 5) {
                console.log(`  ${this.classLabels[i]}: ${(probability * 100).toFixed(2)}%`);
            }
        }

        // 按概率排序並顯示前3個
        const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
        console.log('🏆 前3個預測結果:');
        sortedPredictions.slice(0, 3).forEach((pred, index) => {
            console.log(`  ${index + 1}. ${pred.className}: ${(pred.probability * 100).toFixed(2)}%`);
        });

        return predictions;
    }

    // 解析類別名稱為舌苔特征 - 修正版
    parseClassName(className, confidence) {
        console.log('🎯 解析類別名稱:', className);

        // 創建類別名稱到特征的映射表
        // 簡化分類系統：5類主要分類
        const classMapping = {
            // 1. 正常舌苔 (淡紅舌薄白苔)
            '正常舌苔': { category: '正常', color: '淡紅', coating: '薄白', description: '舌質淡紅，苔薄白均勻' },

            // 2. 寒象舌苔 (淡白舌白厚苔)
            '寒象舌苔': { category: '寒象', color: '淡白', coating: '白厚', description: '舌質淡白，苔白厚膩' },

            // 3. 熱象舌苔 (紅舌黃苔)
            '熱象舌苔': { category: '熱象', color: '紅', coating: '黃', description: '舌質紅，苔黃厚或膩' },

            // 4. 陰虛舌苔 (紅舌少苔或花剝苔)
            '陰虛舌苔': { category: '陰虛', color: '紅', coating: '少苔', description: '舌質紅，苔少或光剝' },

            // 5. 血瘀舌苔 (紫暗舌瘀斑)
            '血瘀舌苔': { category: '血瘀', color: '紫暗', coating: '正常', description: '舌質紫暗，有瘀斑或裂紋' },

            // 向下相容：將舊分類映射到新分類
            '白苔薄無裂紋': { category: '寒象', color: '淡白', coating: '薄白', description: '白薄苔，偏寒' },
            '白苔厚無裂紋': { category: '寒象', color: '淡白', coating: '白厚', description: '白厚苔，寒象明顯' },
            '白苔膩有裂紋': { category: '寒象', color: '淡白', coating: '白膩', description: '白膩苔，有裂紋' },
            '白苔厚有裂紋': { category: '寒象', color: '淡白', coating: '白厚', description: '白厚苔，有裂紋' },

            '黃苔薄無裂紋': { category: '熱象', color: '紅', coating: '黃薄', description: '黃薄苔，輕度熱象' },
            '黃苔厚無裂紋': { category: '熱象', color: '紅', coating: '黃厚', description: '黃厚苔，熱象明顯' },
            '黃苔膩有裂紋': { category: '熱象', color: '紅', coating: '黃膩', description: '黃膩苔，熱濕內蘊' },
            '黃苔厚有裂紋': { category: '熱象', color: '紅', coating: '黃厚', description: '黃厚苔，有裂紋' },

            '淡紅苔薄無裂紋': { category: '正常', color: '淡紅', coating: '薄白', description: '淡紅薄苔，基本正常' },
            '淡紅苔厚無裂紋': { category: '正常', color: '淡紅', coating: '白厚', description: '淡紅厚苔，脾虛傾向' },
            '淡紅苔膩有裂紋': { category: '陰虛', color: '紅', coating: '少苔', description: '淡紅膩苔，有裂紋' },
            '淡紅苔厚有裂紋': { category: '陰虛', color: '紅', coating: '花剝', description: '淡紅厚苔，有裂紋' },

            '紫苔薄無裂紋': { category: '血瘀', color: '紫暗', coating: '薄白', description: '紫薄苔，輕度血瘀' },
            '紫苔厚無裂紋': { category: '血瘀', color: '紫暗', coating: '白厚', description: '紫厚苔，血瘀明顯' },
            '紫苔膩有裂紋': { category: '血瘀', color: '紫暗', coating: '黃膩', description: '紫膩苔，有裂紋' },
            '紫苔厚有裂紋': { category: '血瘀', color: '紫暗', coating: '花剝', description: '紫厚苔，有裂紋' }
        };

        // 查找匹配的類別
        const result = classMapping[className];

        if (result) {
            console.log(`✅ 解析成功 - 分類:${result.category}, 顏色:${result.color}, 苔質:${result.coating} (信心度:${(confidence * 100).toFixed(1)}%)`);
            // 回傳包含信心度的結果物件
            return {
                category: result.category,
                color: result.color,
                coating: result.coating || '正常',
                thickness: result.thickness || '正常', // 向下相容
                crack: result.crack || '無', // 向下相容
                description: result.description,
                confidence: confidence
            };
        } else {
            // 如果找不到匹配，使用默認值並記錄警告
            console.warn('⚠️ 無法解析類別名稱:', className, '使用默認值');
            return {
                color: '淡紅',
                thickness: '薄',
                crack: '無',
                confidence: confidence || 0
            };
        }
    }

    // 模擬推理（備用方案）
    async simulatePrediction(imageFile) {
        return new Promise((resolve) => {
            // 創建FileReader來讀取圖片
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 創建canvas來分析圖片
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = Math.min(img.width, 100);
                    canvas.height = Math.min(img.height, 100);

                    // 繪製並縮放圖片
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // 獲取圖片數據
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // 分析圖片特徵
                    let totalR = 0, totalG = 0, totalB = 0;
                    let brightPixels = 0;
                    let edgePixels = 0;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const brightness = (r + g + b) / 3;

                        totalR += r;
                        totalG += g;
                        totalB += b;

                        if (brightness > 200) brightPixels++;
                        if (brightness < 50) edgePixels++;
                    }

                    const pixelCount = data.length / 4;
                    const avgR = totalR / pixelCount;
                    const avgG = totalG / pixelCount;
                    const avgB = totalB / pixelCount;

                    // 基於圖片特徵確定舌苔類別（簡化分類）
                    let category, color, coating;

                    // 分析顏色特徵
                    if (avgR > 200 && avgG > 180 && avgB > 150) {
                        // 偏白 - 寒象
                        category = '寒象';
                        color = '淡白';
                        coating = '白厚';
                    } else if (avgR > 180 && avgG > 120 && avgB < 100) {
                        // 偏黃 - 熱象
                        category = '熱象';
                        color = '紅';
                        coating = '黃';
                    } else if (avgR > 160 && avgG < 140 && avgB < 130) {
                        // 正常色調 - 正常
                        category = '正常';
                        color = '淡紅';
                        coating = '薄白';
                    } else {
                        // 偏暗 - 血瘀
                        category = '血瘀';
                        color = '紫暗';
                        coating = '正常';
                    }

                    // 基於亮度和對比度調整細節
                    const brightnessRatio = brightPixels / pixelCount;
                    const contrastRatio = edgePixels / pixelCount;

                    // 根據亮度調整苔質
                    if (brightnessRatio > 0.7) {
                        coating = category === '熱象' ? '黃薄' : '薄白';
                    } else if (contrastRatio > 0.3) {
                        coating = category === '熱象' ? '黃膩' : '白膩';
                    }

                    // 基於複雜度檢查是否有裂紋特徵
                    const complexity = contrastRatio + (1 - brightnessRatio);
                    if (complexity > 1.2) {
                        if (category === '血瘀') {
                            coating = '花剝'; // 血瘀舌常有裂紋
                        } else if (category === '陰虛') {
                            coating = '少苔'; // 陰虛舌常少苔
                        }
                    }

                    // 產生一個模擬的信心度（基於亮度/對比度）範圍 0.4 - 0.9
                    const confidence = Math.min(0.9, Math.max(0.4, 0.4 + (1 - Math.abs(0.5 - brightnessRatio))));

                    const result = {
                        category: category,
                        color: color,
                        coating: coating,
                        confidence: confidence,
                        // 顯示用的 label（簡化分類）
                        label: `${category}舌苔`,
                        description: getCategoryDescription(category)
                    };

                    console.log('基於圖片特徵的模擬推理結果:', result);
                    console.log('圖片統計 - 平均RGB:', [avgR, avgG, avgB].map(x => Math.round(x)));
                    console.log('亮度比例:', (brightnessRatio * 100).toFixed(1) + '%');
                    console.log('對比度比例:', (contrastRatio * 100).toFixed(1) + '%');

                    resolve(result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageFile);
        });
    }
}

// 修改ImageUploader的performAnalysis方法
window.overridePerformAnalysis = function(imageUploaderInstance) {
    if (!imageUploaderInstance) {
        console.warn('ImageUploader實例未傳入，跳過覆蓋');
        return;
    }

    const originalPerformAnalysis = imageUploaderInstance.performAnalysis;
    imageUploaderInstance.performAnalysis = async function() {
        if (!tongueDiagnosisAI.isModelLoaded) {
            alert('AI模型載入中，請稍後再試');
            this.hideLoadingSpinner();
            this.setButtonsDisabled(false);
            return;
        }

        try {
            // 使用Teachable Machine進行推理
            const result = await tongueDiagnosisAI.predict(this.currentImage);

            // 隱藏加載動畫
            this.hideLoadingSpinner();

            // 啟用按鈕
            this.setButtonsDisabled(false);

            // 顯示分析結果
            this.showAnalysisResult(result);

        } catch (error) {
            console.error('AI分析出錯:', error);
            alert('分析過程出錯，請重試');

            // 隱藏加載動畫
            this.hideLoadingSpinner();

            // 啟用按鈕
            this.setButtonsDisabled(false);
        }
    };
};

// 創建AI實例
const tongueDiagnosisAI = new TongueDiagnosisAI();

// 導出實例
window.tongueDiagnosisAI = tongueDiagnosisAI;
