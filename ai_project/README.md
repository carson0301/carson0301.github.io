# 中醫舌苔智能識別系統

一個基於純原生HTML/CSS/JavaScript的舌苔識別網站，無需安裝任何第三方依賴。

## 功能特點

- ✅ 純原生技術棧，無第三方依賴
- ✅ 響應式設計，支援移動端和PC端
- ✅ 本地圖片處理，保護隱私
- ✅ TensorFlow.js AI識別（CDN引入）
- ✅ 中醫專業報告生成
- ✅ PDF報告下載功能
- ✅ **模仿澳門紙幣系統的即時檢測技術**
- ✅ **簡化5類舌苔分類系統**

## 🪙 模仿澳門紙幣識別系統 + 簡化分類系統

本項目成功模仿了[澳門紙幣智能識別系統](https://carson0301.github.io/IT-project-fct.html/project/index.html)的TensorFlow.js導入和使用邏輯，同時實現了**簡化的5類舌苔分類系統**：

### 核心模仿技術

1. **相同的函式庫導入方式**
   ```html
   <!-- 使用與紙幣系統完全相同的版本 -->
   <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js"></script>
   ```

2. **相同的模型載入邏輯**
   - 使用 `tmImage.load(modelURL, metadataURL)` 方法
   - 支援本地model.json和metadata.json檔案

3. **相同的網路攝影機整合**
   - 使用 `tmImage.Webcam` 類進行攝影機控制
   - 即時預測循環 `requestAnimationFrame`

4. **相同的信心度顯示邏輯**
   - 三級顏色提示系統（綠色/黃色/紅色）
   - 動態信心度百分比顯示

### 技術展示頁面

訪問 `test-currency-style.html` 查看詳細的技術實現比較和模仿效果。

## 項目結構

```
ai_project/
├── index.html              # 端選擇頁面
├── pages/
│   ├── home.html          # 首頁
│   └── detect.html        # 檢測頁面
├── css/
│   └── style.css          # 統一樣式文件
├── js/
│   ├── router.js          # 原生路由系統
│   ├── device-selection.js # 端選擇邏輯
│   ├── home.js            # 首頁邏輯
│   ├── image-upload.js    # 圖片上傳處理
│   ├── teachable-machine-integration.js # Teachable Machine + TensorFlow.js集成
│   └── report-generator.js # 報告生成器
└── assets/                # 資源文件目錄
```

## 🗂️ 簡化分類系統

### 從16類到5類的進化

**舊系統問題：**
- 16個過於細碎的分類（4顏色 × 4厚度/裂紋組合）
- 訓練數據需求巨大
- 識別準確度低
- 用戶難以理解臨床意義

**新系統優勢：**
- 5個符合中醫實踐的分類
- 更容易收集訓練數據
- 更高的識別準確度
- 更實用的臨床指導

### 五類分類詳解

| 分類 | 舌質特徵 | 苔質特徵 | 中醫意義 | 健康建議 |
|------|----------|----------|----------|----------|
| **正常舌苔** | 淡紅色 | 薄白均勻 | 身體健康 | 維持健康生活習慣 |
| **寒象舌苔** | 淡白色 | 白厚膩 | 寒證、脾虛 | 溫補、保暖，避免生冷 |
| **熱象舌苔** | 紅色 | 黃厚膩 | 熱證、實熱 | 清熱、潤燥，多喝水 |
| **陰虛舌苔** | 紅色 | 少苔、光剝 | 陰虛、津虧 | 滋陰、休息，避免熬夜 |
| **血瘀舌苔** | 紫暗色 | 正常或花剝 | 血瘀、氣滯 | 活血、活動，避免久坐 |

### 測試頁面

- **`test-simplified.html`** - 簡化分類系統測試和說明
- **`test-accuracy.html`** - 準確度評估工具
- **`test-confidence.html`** - 信心度診斷工具

## 使用方法

1. **啟動服務**
   - 使用任何HTTP服務器開啟 `index.html`
   - 或者直接在瀏覽器中開啟（可能會有跨域限制）

2. **選擇設備類型**
   - 首次訪問需要選擇「移動端」或「PC端」
   - 選擇後會自動記錄到localStorage

3. **瀏覽首頁**
   - 查看舌診簡介和功能說明
   - 點擊「開始檢測」進入檢測頁面

4. **上傳圖片**
   - 支持點擊選擇或拖拽上傳
   - 僅支援JPG/PNG格式，最大5MB
   - 上傳後會顯示圖片預覽

5. **AI識別**
   - 點擊「開始識別」按鈕
   - 系統會顯示加載動畫並進行分析
   - 分析完成後顯示識別結果

6. **查看報告**
   - 查看詳細的中醫解讀
   - 包含飲食和生活建議
   - 可下載PDF格式的完整報告

## 技術實現

### 路由系統
- 純原生JavaScript實現頁面跳轉
- 支援瀏覽器前進後退按鈕
- 會話級localStorage存儲端類型

### 響應式設計
- CSS媒體查詢實現多端適配
- 移動端：文字≥16px，按鈕≥48px
- PC端：文字≥14px，布局寬度≤1200px

### 圖片處理
- FileReader API讀取本地文件
- Canvas API進行圖像預處理
- 224×224像素標準化處理

### AI識別
- TensorFlow.js CDN引入
- 本地模型推理，保護隱私
- 識別維度：顏色（白/黃/淡紅/紫）、厚度（薄/厚/膩）、裂紋（有/無）

### 報告生成
- jsPDF CDN生成PDF報告
- 中醫術語映射邏輯
- 個性化飲食和生活建議

## 開發說明

### 添加TensorFlow.js模型

1. 將訓練好的模型文件放入 `assets/models/` 目錄
2. 在 `teachable-machine-integration.js` 中修改模型載入路徑：
   ```javascript
   this.model = await tf.loadLayersModel('/assets/models/your-model.json');
   ```
3. 取消註釋真實的推理邏輯，註釋掉模擬代碼

### 添加jsPDF依賴

在 `detect.html` 中添加：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### 自訂樣式

- 所有樣式集中在 `css/style.css`
- 使用CSS變數統一管理顏色和尺寸
- 媒體查詢實現響應式適配

## 瀏覽器支援

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 免責聲明

⚠️ **重要提醒**

本系統僅供健康參考，不替代專業醫學診斷。舌苔識別結果不能作為臨床診斷依據，如有身體不適，請及時就醫諮詢專業醫師。

## 授權

本項目僅供學習和研究使用。
