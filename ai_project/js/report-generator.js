// 報告生成器模塊
class ReportGenerator {
    constructor() {
        this.templates = {};
        this.init();
    }

    init() {
        // 初始化報告模板
        this.templates = {
            diagnosis: {
                '白厚苔': {
                    interpretation: '痰濕內阻',
                    description: '您的舌苔呈白色且較厚，這在中医辨證中可能提示痰濕內阻的體質特點。痰濕內阻是指人體內部有過多的痰液和水濕積聚，影響正常的生理功能。'
                },
                '黃厚苔': {
                    interpretation: '內熱積盛',
                    description: '您的舌苔呈黃色且較厚，這可能提示內熱較重的體質特點。中醫認為黃厚苔往往與胃腸積熱、飲食不節等因素相關。'
                },
                '裂紋舌': {
                    interpretation: '陰液虧虛',
                    description: '您的舌苔有裂紋，這在中医辨證中可能提示陰液虧虛的體質特點。陰液虧虛是指人體陰精不足，導致津液虧乏，影響正常的生理功能。'
                },
                '正常': {
                    interpretation: '體質平和',
                    description: '您的舌苔顏色和厚度均在正常範圍內，這提示您的體質狀態較為平和。但仍需注意飲食均衡、生活規律，以維持良好的健康狀態。'
                }
            },

            advice: {
                '痰濕內阻': {
                    diet: [
                        '多食用薏米、冬瓜等利水化濕的食物',
                        '適量食用生薑、蔥白等溫性食物',
                        '減少甜食、油膩食物的攝入',
                        '忌食生冷寒涼的食物和飲料'
                    ],
                    lifestyle: [
                        '保持充足的睡眠，避免熬夜',
                        '適量進行有氧運動，如散步、慢跑',
                        '保持心情舒暢，避免過度緊張',
                        '注意保暖，避免受寒'
                    ]
                },
                '內熱積盛': {
                    diet: [
                        '多食用清熱解毒的食物，如菊花茶、綠豆',
                        '適量食用苦瓜、蓮子等清熱食物',
                        '減少辛辣刺激性食物的攝入',
                        '保持飲食清淡，避免油炸食物'
                    ],
                    lifestyle: [
                        '保持良好的作息習慣',
                        '適量進行體育鍛煉',
                        '保持心情平和',
                        '避免過度疲勞'
                    ]
                },
                '陰液虧虛': {
                    diet: [
                        '多食用滋陰的食物，如銀耳、百合',
                        '適量食用黑芝麻、核桃等補腎食物',
                        '減少辛辣刺激性食物的攝入',
                        '保持飲食均衡，適量飲水'
                    ],
                    lifestyle: [
                        '保證充足的睡眠',
                        '適量進行靜態修煉，如瑜伽',
                        '保持心情愉快',
                        '避免過度勞累'
                    ]
                },
                '體質平和': {
                    diet: [
                        '保持飲食均衡，多食用新鮮蔬菜水果',
                        '適量攝入優質蛋白質，如魚類、瘦肉',
                        '減少高糖、高脂食物的攝入',
                        '保持規律的飲食習慣'
                    ],
                    lifestyle: [
                        '保持規律的作息時間',
                        '適度進行體育鍛煉',
                        '保持心情愉快',
                        '定期進行健康檢查'
                    ]
                }
            }
        };
    }

    // 生成完整報告
    generateReport(result) {
        const diagnosisKey = this.getDiagnosisKey(result);
        const diagnosis = this.templates.diagnosis[diagnosisKey];
        const advice = this.templates.advice[diagnosis.interpretation];

        return {
            result: result,
            diagnosis: diagnosis,
            advice: advice,
            disclaimer: {
                title: '重要免責聲明',
                content: [
                    '本報告僅供健康參考，不能替代專業醫學診斷。',
                    '舌苔識別結果不能作為臨床診斷依據，如有身體不適，請及時就醫諮詢專業醫師。',
                    '本系統的分析結果基於圖像識別技術，可能存在誤差，請理性看待。'
                ]
            }
        };
    }

    // 根據識別結果獲取診斷關鍵字
    getDiagnosisKey(result) {
        const { color, thickness, crack } = result;

        if (crack === '有') {
            return '裂紋舌';
        } else if (color === '白' && thickness === '厚') {
            return '白厚苔';
        } else if (color === '黃' && thickness === '厚') {
            return '黃厚苔';
        } else {
            return '正常';
        }
    }

    // 生成HTML格式的報告
    generateReportHTML(result) {
        const report = this.generateReport(result);

        return `
            <div class="report-section">
                <div class="report-section-header" onclick="toggleReportSection('result')">
                    <span class="report-section-title">識別結果</span>
                    <span class="report-section-toggle">點擊展開 ▼</span>
                </div>
                <div class="report-section-content" id="result-content">
                    <p><strong>舌苔顏色：</strong>${result.color}</p>
                    <p><strong>舌苔厚度：</strong>${result.thickness}</p>
                    <p><strong>舌苔裂紋：</strong>${result.crack}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header" onclick="toggleReportSection('diagnosis')">
                    <span class="report-section-title">中醫解讀</span>
                    <span class="report-section-toggle">點擊展開 ▼</span>
                </div>
                <div class="report-section-content" id="diagnosis-content">
                    <p><strong>${report.diagnosis.interpretation}</strong></p>
                    <p>${report.diagnosis.description}</p>
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header" onclick="toggleReportSection('advice')">
                    <span class="report-section-title">飲食建議</span>
                    <span class="report-section-toggle">點擊展開 ▼</span>
                </div>
                <div class="report-section-content" id="advice-content">
                    <ul>
                        ${report.advice.diet.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header" onclick="toggleReportSection('lifestyle')">
                    <span class="report-section-title">生活建議</span>
                    <span class="report-section-toggle">點擊展開 ▼</span>
                </div>
                <div class="report-section-content" id="lifestyle-content">
                    <ul>
                        ${report.advice.lifestyle.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="report-section">
                <div class="report-section-header" onclick="toggleReportSection('disclaimer')">
                    <span class="report-section-title">${report.disclaimer.title}</span>
                    <span class="report-section-toggle">點擊展開 ▼</span>
                </div>
                <div class="report-section-content" id="disclaimer-content">
                    ${report.disclaimer.content.map(item => `<p>${item}</p>`).join('')}
                </div>
            </div>
        `;
    }

    // 生成PDF格式的報告
    generatePDFReport(result) {
        const report = this.generateReport(result);

        // PDF內容結構
        const pdfContent = {
            title: '中醫舌苔智能識別報告',
            result: {
                color: result.color,
                thickness: result.thickness,
                crack: result.crack
            },
            diagnosis: report.diagnosis,
            advice: report.advice,
            disclaimer: report.disclaimer
        };

        return pdfContent;
    }
}

// 創建報告生成器實例
const reportGenerator = new ReportGenerator();

// 導出實例
window.reportGenerator = reportGenerator;
