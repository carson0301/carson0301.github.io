// 數據模型
const materialsData = {
    // 衣物類
    cotton: {
        name: "棉質衣物",
        image: "image/棉质衣物.jpg",
        steps: [
            { text: "確認水溫，一般使用溫水（30°C-40°C）。", important: false },
            { text: "使用中性洗滌劑，避免漂白劑。", important: false },
            { text: "可機洗，建議使用標準程序。", important: false },
            { text: "懸掛晾乾或低溫烘乾。", important: false }
        ],
        prohibitions: ["使用高溫水洗滌", "使用強漂白劑"]
    },
    wool: {
        name: "羊毛衣物",
        image: "image/羊毛衣物jpg.jpg",
        steps: [
            { text: "使用冷水或溫水（不超過30°C）。", important: false },
            { text: "使用專用羊毛洗滌劑。", important: true },
            { text: "輕柔手洗或使用洗衣機的羊毛/手洗程序。", important: true },
            { text: "平鋪晾乾，避免懸掛以防變形。", important: true }
        ],
        prohibitions: ["機洗（除非有專用羊毛程序）", "使用漂白劑", "高溫烘乾", "暴曬"]
    },
    silk: {
        name: "絲綢衣物",
        image: "image/丝绸衣物.png",
        steps: [
            { text: "使用冷水或涼水（不超過30°C）。", important: false },
            { text: "使用專用絲綢洗滌劑或中性洗滌劑。", important: true },
            { text: "輕柔手洗，避免揉搓。", important: true },
            { text: "用毛巾輕輕按壓吸水後平鋪晾乾。", important: true }
        ],
        prohibitions: ["機洗", "使用漂白劑", "暴曬", "擰絞", "熨燙（除非使用絲綢檔位）"]
    },
    synthetic: {
        name: "化纖衣物",
        image: "image/化纤衣物.jpg",
        steps: [
            { text: "冷水或溫水洗滌（不超過40°C）。", important: false },
            { text: "使用一般洗滌劑。", important: false },
            { text: "可機洗，建議使用標準或化纖程序。", important: false },
            { text: "懸掛晾乾或低溫烘乾。", important: true }
        ],
        prohibitions: ["高溫洗滌", "高溫烘乾"]
    },
    denim: {
        name: "牛仔衣物",
        image: "image/牛仔衣物.jpg",
        steps: [
            { text: "翻轉衣物，使用冷水洗滌。", important: true },
            { text: "使用專用牛仔洗滌劑或溫和洗滌劑。", important: false },
            { text: "輕柔機洗或手洗。", important: false },
            { text: "懸掛晾乾，避免陽光直射。", important: true }
        ],
        prohibitions: ["頻繁洗滌", "使用漂白劑", "高溫烘乾"]
    },

    // 家紡類
    bedding: {
        name: "被套/床單",
        image: "image/被套床单.jpg",
        steps: [
            { text: "查看標籤，確認適合的洗滌方式。", important: false },
            { text: "一般可使用溫水（40°C）機洗。", important: false },
            { text: "使用溫和洗滌劑。", important: false },
            { text: "可低溫烘乾或懸掛晾乾。", important: false }
        ],
        prohibitions: ["過度裝載洗衣機"]
    },
    down: {
        name: "羽絨被/羽絨服",
        image: "image/羽绒.jpg",
        steps: [
            { text: "使用溫水（30°C）和專用羽絨洗滌劑。", important: true },
            { text: "使用洗衣機的羽絨程序或輕柔程序。", important: true },
            { text: "徹底漂洗，確保無洗滌劑殘留。", important: false },
            { text: "低溫烘乾，並放入網球或專用烘乾球保持蓬鬆。", important: true }
        ],
        prohibitions: ["使用一般洗滌劑", "擰絞", "自然晾乾（會結塊）"]
    },
    woolblanket: {
        name: "羊毛毯",
        image: "image/羊毛毯.jpg",
        steps: [
            { text: "使用冷水或溫水（不超過30°C）。", important: false },
            { text: "使用專用羊毛洗滌劑。", important: true },
            { text: "輕柔手洗或使用洗衣機的羊毛程序。", important: true },
            { text: "平鋪晾乾，避免懸掛。", important: true }
        ],
        prohibitions: ["使用漂白劑", "高溫烘乾", "暴曬"]
    }
};

const stainsData = {
    // 飲食類
    oil: {
        name: "油漬",
        image: "image/油渍.jpg",
        steps: [
            { text: "使用廚房紙巾吸取多餘油漬。", important: true },
            { text: "撒上吸油粉（如玉米澱粉、滑石粉），靜置1小時。", important: false },
            { text: "刷掉吸油粉，塗抹洗潔精，輕輕揉搓。", important: false },
            { text: "冷水沖洗後正常洗滌。", important: false }
        ]
    },
    soysauce: {
        name: "醬油漬",
        image: "image/酱油渍.jpg",
        steps: [
            { text: "立即用冷水沖洗，不要使用熱水（會固定污漬）。", important: true },
            { text: "塗抹少量洗潔精或洗滌劑，輕輕揉搓。", important: false },
            { text: "若有頑固污漬，可使用適量白醋溶液浸泡15分鐘。", important: false },
            { text: "正常洗滌。", important: false }
        ]
    },
    redwine: {
        name: "紅酒漬",
        image: "image/红酒渍.jpg",
        steps: [
            { text: "立即用紙巾吸取多餘液體，不要揉搓。", important: true },
            { text: "撒上鹽，吸取紅酒（約5分鐘）。", important: false },
            { text: "用冷水沖洗，然後塗抹白醋或檸檬汁。", important: false },
            { text: "靜置30分鐘後正常洗滌。", important: false }
        ]
    },
    milk: {
        name: "奶漬",
        image: "image/奶渍.jpg",
        steps: [
            { text: "用冷水沖洗去除多餘奶漬。", important: false },
            { text: "用溫和洗滌劑處理，輕輕揉搓。", important: false },
            { text: "對於乾涸奶漬，可先用溫水浸泡再處理。", important: false },
            { text: "正常洗滌。", important: false }
        ]
    },
    fruit: {
        name: "水果漬",
        image: "image/水果渍.jpg",
        steps: [
            { text: "立即用冷水沖洗。", important: true },
            { text: "將檸檬汁或白醋直接塗抹於污漬處。", important: false },
            { text: "輕輕揉搓，靜置10分鐘。", important: false },
            { text: "正常洗滌。", important: false }
        ]
    },

    // 生活類
    sweat: {
        name: "汗漬",
        image: "image/汗渍.jpg",
        steps: [
            { text: "使用白醋和水的混合液（1:1）塗抹於污漬處。", important: false },
            { text: "輕輕揉搓，靜置30分鐘。", important: false },
            { text: "使用溫和洗滌劑處理。", important: false },
            { text: "正常洗滌。", important: false }
        ]
    },
    blood: {
        name: "血漬",
        image: "image/血渍.jpg",
        steps: [
            { text: "立即用冷水沖洗，絕不使用熱水（會凝固血液）。", important: true },
            { text: "塗抹鹽水或冷水溶解洗滌劑。", important: false },
            { text: "輕輕揉搓，靜置15分鐘。", important: false },
            { text: "如有殘留，可用氫氧化鈉溶液處理後正常洗滌。", important: false }
        ]
    },
    ink: {
        name: "墨漬",
        image: "image/墨渍.jpg",
        steps: [
            { text: "使用酒精或乙醇塗抹於污漬處（先在隱蔽處測試）。", important: true },
            { text: "用乾淨棉布吸取墨水，避免擴散。", important: true },
            { text: "重複操作直到墨漬減退。", important: false },
            { text: "使用洗滌劑處理後正常洗滌。", important: false }
        ]
    },
    cosmetics: {
        name: "化妝品漬",
        image: "image/化妆品渍.jpg",
        steps: [
            { text: "使用卸妝油或專業去污劑塗抹於污漬處。", important: true },
            { text: "輕輕揉搓，靜置5分鐘。", important: false },
            { text: "用洗滌劑處理。", important: false },
            { text: "正常洗滌。", important: false }
        ]
    },
    urine: {
        name: "尿漬",
        image: "image/尿渍.jpg",
        steps: [
            { text: "使用冷水沖洗去除多餘尿液。", important: false },
            { text: "用白醋和水的混合液（1:1）塗抹，去除氣味。", important: true },
            { text: "靜置30分鐘。", important: false },
            { text: "使用溫和洗滌劑處理後正常洗滌。", important: false }
        ]
    }
};

// 交叉查詢推薦
const crossQueryRecommendations = {
    // 棉質衣物
    cotton_oil: "1. 立即使用廚房紙巾吸取多餘油漬\n2. 撒上玉米澱粉靜置1小時\n3. 使用溫水（30-40°C）和洗潔精處理\n4. 標準機洗程序\n\n禁忌：使用高溫水或強漂白劑",
    cotton_soysauce: "1. 立即用冷水沖洗\n2. 塗抹洗滌劑輕輕揉搓\n3. 可使用白醋溶液浸泡頑固污漬\n4. 溫水（30-40°C）標準機洗\n\n禁忌：使用熱水（會固定污漬）",
    cotton_redwine: "1. 立即用紙巾吸取多餘紅酒，撒上鹽\n2. 冷水沖洗後塗抹白醋或檸檬汁\n3. 靜置30分鐘\n4. 標準機洗\n\n禁忌：揉搓（會擴散污漬）",
    cotton_milk: "1. 用冷水沖洗去除多餘奶漬\n2. 使用洗滌劑輕輕揉搓\n3. 標準機洗\n\n禁忌：高溫水洗",
    cotton_fruit: "1. 立即用冷水沖洗\n2. 塗抹檸檬汁或白醋\n3. 輕輕揉搓，靜置10分鐘\n4. 標準機洗\n\n禁忌：熱水洗滌，強漂白劑",
    cotton_sweat: "1. 白醋水溶液（1:1）塗抹\n2. 靜置30分鐘\n3. 標準機洗\n\n禁忌：使用強漂白劑",
    cotton_blood: "1. 立即用冷水沖洗\n2. 塗抹鹽水溶液\n3. 輕輕揉搓，靜置15分鐘\n4. 標準機洗\n\n禁忌：使用熱水（會凝固血液）",
    cotton_ink: "1. 使用酒精塗抹（先在隱蔽處測試）\n2. 用乾淨棉布吸取墨水\n3. 標準機洗\n\n禁忌：使用強漂白劑，除非是白色棉質",
    cotton_cosmetics: "1. 使用卸妝油處理\n2. 輕輕揉搓，靜置5分鐘\n3. 標準機洗\n\n禁忌：使用強漂白劑",
    cotton_urine: "1. 冷水沖洗\n2. 白醋水溶液（1:1）塗抹\n3. 靜置30分鐘\n4. 標準機洗\n\n禁忌：使用強漂白劑",
    
    // 羊毛衣物
    wool_oil: "1. 使用廚房紙巾吸取多餘油漬\n2. 撒上玉米澱粉或滑石粉，靜置1小時\n3. 使用專用羊毛洗滌劑輕柔手洗\n4. 平鋪晾乾\n\n禁忌：機洗，熱水洗滌，漂白劑，烘乾機",
    wool_soysauce: "1. 立即用冷水沖洗\n2. 使用專用羊毛洗滌劑輕柔手洗\n3. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，漂白劑，烘乾機",
    wool_redwine: "1. 立即用紙巾吸取，撒上鹽\n2. 冷水沖洗\n3. 使用專用羊毛洗滌劑輕柔手洗\n4. 平鋪晾乾\n\n禁忌：熱水洗滌，揉搓，機洗，烘乾機",
    wool_milk: "1. 冷水沖洗\n2. 使用專用羊毛洗滌劑輕柔手洗\n3. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，烘乾機",
    wool_fruit: "1. 立即用冷水沖洗\n2. 輕輕塗抹白醋或檸檬汁\n3. 使用專用羊毛洗滌劑輕柔手洗\n4. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，烘乾機",
    wool_sweat: "1. 白醋水溶液（1:2）輕輕塗抹\n2. 使用專用羊毛洗滌劑輕柔手洗\n3. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，烘乾機",
    wool_blood: "1. 立即用冷水沖洗\n2. 使用專用羊毛洗滌劑輕柔手洗\n3. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，漂白劑，烘乾機",
    wool_ink: "1. 謹慎使用少量酒精（先在隱蔽處測試）\n2. 輕拍不要揉搓\n3. 使用專用羊毛洗滌劑輕柔手洗\n4. 平鋪晾乾\n\n禁忌：揉搓，熱水洗滌，機洗，烘乾機",
    wool_cosmetics: "1. 使用少量卸妝油輕拍\n2. 使用專用羊毛洗滌劑輕柔手洗\n3. 平鋪晾乾\n\n禁忌：揉搓，熱水洗滌，機洗，烘乾機",
    wool_urine: "1. 冷水沖洗\n2. 稀釋白醋溶液（1:3）輕輕塗抹\n3. 使用專用羊毛洗滌劑輕柔手洗\n4. 平鋪晾乾\n\n禁忌：熱水洗滌，機洗，烘乾機",
    
    // 其他交叉查詢組合可以依此類推...
    // 由於內容量大，這裡只列出部分示例
    silk_redwine: "1. 立即用紙巾輕輕吸取，不要揉搓\n2. 撒上少量鹽\n3. 冷水輕輕沖洗\n4. 使用專用絲綢洗滌劑手洗\n5. 用毛巾輕輕按壓吸水後平鋪晾乾\n\n禁忌：揉搓，機洗，漂白劑，擰絞",
    
    // 預設交叉查詢結果（當找不到特定組合時使用）
    default: "對於這種組合，建議以下步驟：\n1. 查看衣物標籤的洗滌說明\n2. 先處理污漬（通常使用冷水沖洗）\n3. 依照物料類型選擇合適的洗滌方法\n4. 適當晾乾\n\n如有疑問，可使用AI交互功能獲取更具體的建議"
};

// 獲取交叉查詢結果
function getCrossQueryResult(material, stain) {
    const key = `${material}_${stain}`;
    return crossQueryRecommendations[key] || crossQueryRecommendations.default;
}
