// 全局變數
let students = [];
let remainingStudents = [];
let studentScores = {};
let isClassActive = false;
let currentFileName = '';
let mouseX = 0;
let mouseY = 0;

// DOM 元素
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const btnStart = document.getElementById('btnStart');
const btnEnd = document.getElementById('btnEnd');
const btnDraw = document.getElementById('btnDraw');
const selectedStudent = document.getElementById('selectedStudent');
const studentsList = document.getElementById('studentsList');
const statusIndicator = document.getElementById('statusIndicator');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

// 設置畫布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 粒子系統
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.x = Math.random() * canvas.width;
    }

    reset() {
        this.x = mouseX || Math.random() * canvas.width;
        this.y = mouseY || Math.random() * canvas.height;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    update() {
        // 跟隨滑鼠移動
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            this.x += (dx / distance) * 0.5;
            this.y += (dy / distance) * 0.5;
        } else {
            this.x += this.speedX;
            this.y += this.speedY;
        }

        // 邊界檢查
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 創建粒子
const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

// 動畫循環
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}
animate();

// 滑鼠移動追蹤
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 讀取 XLSX 檔案
fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    fileName.textContent = `已選擇：${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // 讀取 B 欄（索引為 1）的學生姓名
            students = [];
            const nameSet = new Set();
            
            for (let i = 0; i < jsonData.length; i++) {
                if (jsonData[i][1] && typeof jsonData[i][1] === 'string') {
                    const name = jsonData[i][1].trim();
                    if (name && !nameSet.has(name)) {
                        nameSet.add(name);
                        students.push(name);
                    }
                }
            }

            if (students.length === 0) {
                alert('無法從 B 欄讀取到學生姓名，請檢查檔案格式！');
                return;
            }

            alert(`成功讀取 ${students.length} 位學生！`);
            // 不清空現有的分數記錄，只更新學生名單
            updateStudentsList();
        } catch (error) {
            alert('讀取檔案時發生錯誤：' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
});

// 開始上課
btnStart.addEventListener('click', function() {
    if (students.length === 0) {
        alert('請先上傳學生名單！');
        return;
    }

    isClassActive = true;
    remainingStudents = [...students];
    statusIndicator.textContent = '狀態：上課中';
    statusIndicator.className = 'status-indicator status-class';
    btnStart.disabled = true;
    btnEnd.disabled = false;
    btnDraw.disabled = false;
    selectedStudent.textContent = '準備抽籤...';
});

// 下課
btnEnd.addEventListener('click', async function() {
    if (!isClassActive) return;

    isClassActive = false;
    statusIndicator.textContent = '狀態：下課中';
    statusIndicator.className = 'status-indicator status-break';
    btnStart.disabled = false;
    btnEnd.disabled = true;
    btnDraw.disabled = true;

    // 顯示載入提示
    btnEnd.textContent = '正在生成PDF...';
    btnEnd.disabled = true;

    // 生成 PDF
    try {
        await generatePDF();
    } catch (error) {
        console.error('生成PDF時發生錯誤：', error);
        alert('生成PDF時發生錯誤，請重試！');
    } finally {
        btnEnd.textContent = '下課';
    }
});

// 抽籤動畫變數
let isDrawing = false;
let drawAnimationInterval = null;

// 抽籤
btnDraw.addEventListener('click', function() {
    if (!isClassActive) {
        alert('請先開始上課！');
        return;
    }

    if (isDrawing) {
        return; // 防止重複點擊
    }

    if (remainingStudents.length === 0) {
        alert('所有學生都已抽過！是否要重置名單繼續抽籤？');
        if (confirm('重置名單並繼續抽籤？')) {
            remainingStudents = [...students];
        } else {
            return;
        }
    }

    // 開始抽籤動畫
    startDrawAnimation();
});

// 開始抽籤動畫
function startDrawAnimation() {
    isDrawing = true;
    btnDraw.disabled = true;
    
    // 移除之前的類別
    selectedStudent.classList.remove('reveal');
    selectedStudent.classList.add('rolling');
    
    // 快速滾動顯示名字
    let rollCount = 0;
    const maxRolls = 40; // 滾動次數（增加以延長動畫時間）
    const rollSpeed = 40; // 每次滾動間隔（毫秒，減少以加快速度）
    
    // 初始顯示
    if (remainingStudents.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingStudents.length);
        selectedStudent.textContent = remainingStudents[randomIndex];
    }
    
    drawAnimationInterval = setInterval(() => {
        if (rollCount < maxRolls) {
            // 隨機顯示一個名字（製造滾動效果）
            if (remainingStudents.length > 0) {
                const randomIndex = Math.floor(Math.random() * remainingStudents.length);
                selectedStudent.textContent = remainingStudents[randomIndex];
            }
            rollCount++;
        } else {
            // 動畫結束，選出最終結果
            clearInterval(drawAnimationInterval);
            finishDrawAnimation();
        }
    }, rollSpeed);
}

// 完成抽籤動畫
function finishDrawAnimation() {
    // 選出最終結果
    const randomIndex = Math.floor(Math.random() * remainingStudents.length);
    const selected = remainingStudents.splice(randomIndex, 1)[0];
    
    // 移除滾動動畫，添加揭示動畫
    selectedStudent.classList.remove('rolling');
    selectedStudent.classList.add('reveal');
    selectedStudent.textContent = selected;
    
    // 確保該學生在分數記錄中（初始化為0如果還沒有記錄）
    if (!(selected in studentScores)) {
        studentScores[selected] = 0;
    }

    updateStudentsList();
    
    // 重置狀態
    setTimeout(() => {
        isDrawing = false;
        btnDraw.disabled = false;
        selectedStudent.classList.remove('reveal');
    }, 800);
}

// 更新學生列表
function updateStudentsList() {
    studentsList.innerHTML = '';
    
    // 只顯示被抽中的學生（有分數記錄的學生）
    const drawnStudents = Object.keys(studentScores).sort();
    
    if (drawnStudents.length === 0) {
        studentsList.innerHTML = '<div class="empty-message">尚無學生記錄</div>';
        return;
    }
    
    drawnStudents.forEach(name => {
        const item = document.createElement('div');
        item.className = 'student-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = name;
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'student-score';
        scoreSpan.textContent = `${studentScores[name]} 分`;
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'score-controls';
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn-score btn-plus';
        plusBtn.textContent = '+1';
        plusBtn.addEventListener('click', () => changeScore(name, 1));
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn-score btn-minus';
        minusBtn.textContent = '-1';
        minusBtn.addEventListener('click', () => changeScore(name, -1));
        
        controlsDiv.appendChild(plusBtn);
        controlsDiv.appendChild(minusBtn);
        
        item.appendChild(nameSpan);
        item.appendChild(scoreSpan);
        item.appendChild(controlsDiv);
        
        studentsList.appendChild(item);
    });
}

// 改變分數
function changeScore(name, delta) {
    if (!studentScores[name]) {
        studentScores[name] = 0;
    }
    
    studentScores[name] += delta;
    
    // 確保分數不低於 0
    if (studentScores[name] < 0) {
        studentScores[name] = 0;
    }
    
    updateStudentsList();
}

// 生成 PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 嘗試截取學生分數記錄區域
    try {
        const studentsSection = document.querySelector('.students-section');
        if (studentsSection && Object.keys(studentScores).length > 0) {
            // 使用 html2canvas 截圖
            const canvas = await html2canvas(studentsSection, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });

            // 將截圖轉換為圖片數據
            const imgData = canvas.toDataURL('image/png');
            
            // 計算圖片尺寸（PDF寬度為210mm，左右各留20mm，實際可用170mm）
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pdfWidth - (margin * 2);
            
            // 計算縮放比例
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = maxWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;
            
            // 從頁面頂部開始放置截圖（只保留截圖，不添加任何文字）
            const y = margin;
            
            // 直接添加截圖到PDF（jsPDF會自動處理分頁）
            doc.addImage(imgData, 'PNG', margin, y, maxWidth, scaledHeight, undefined, 'FAST');
        } else {
            alert('沒有學生分數記錄可以匯出！');
            return;
        }
    } catch (error) {
        console.error('截圖失敗：', error);
        alert('生成PDF時發生錯誤，請重試！');
        return;
    }

    // 儲存檔案
    const date = new Date().toLocaleString('zh-TW');
    const pdfFileName = currentFileName 
        ? `學生抽籤與分數追蹤器@${currentFileName.replace('.xlsx', '')}.pdf`
        : `學生抽籤與分數追蹤器@${date.replace(/[/:]/g, '-')}.pdf`;
    
    doc.save(pdfFileName);
    
    alert('PDF 檔案已儲存到下載資料夾！');
}

