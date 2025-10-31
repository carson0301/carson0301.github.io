// 粒子背景：彩色、多方向漂移，滑鼠靠近反彈並朝邊緣逃逸
(function initParticles() {
	const canvas = document.getElementById('canvas-bg');
	const ctx = canvas.getContext('2d');
	let width, height, dpr;
	let particles = [];
	let mouse = { x: -9999, y: -9999 };

	const COLORS = ['#ff6b6b', '#ffd93d', '#6bcbff', '#a36aff', '#14cc8a', '#ff8ec3'];

	function resize() {
		width = window.innerWidth;
		height = window.innerHeight;
		dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
		// 設定真正畫布像素與 CSS 尺寸，確保覆蓋整個視窗且不變形
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(dpr, dpr);
	}
	window.addEventListener('resize', resize);
	resize();

	class Particle {
		constructor() {
			this.reset(true);
		}
		reset(randomPos) {
			this.x = randomPos ? Math.random() * width : (Math.random() < 0.5 ? 0 : width);
			this.y = randomPos ? Math.random() * height : Math.random() * height;
			const speed = 0.6 + Math.random() * 1.6; // 稍快一點
			const angle = Math.random() * Math.PI * 2;
			this.vx = Math.cos(angle) * speed;
			this.vy = Math.sin(angle) * speed;
			this.size = 2 + Math.random() * 3.6; // 更大顆
			this.color = COLORS[(Math.random() * COLORS.length) | 0];
		}
		update() {
			// 與滑鼠互動：距離小於 100 時強力排斥並給予朝邊緣的速度
			const dx = this.x - mouse.x;
			const dy = this.y - mouse.y;
			const dist = Math.hypot(dx, dy);
			if (dist < 100) {
				const repel = (100 - dist) / 100;
				const nx = dx / (dist || 1);
				const ny = dy / (dist || 1);
				// 朝螢幕邊緣推動（加強逃逸感）
				this.vx += nx * 0.8 * repel + (this.x < width/2 ? -0.15 : 0.15);
				this.vy += ny * 0.8 * repel + (this.y < height/2 ? -0.15 : 0.15);
			}

			this.x += this.vx;
			this.y += this.vy;

			// 與邊界彈性碰撞
			if (this.x <= 0 || this.x >= width) this.vx *= -1;
			if (this.y <= 0 || this.y >= height) this.vy *= -1;
			this.x = Math.max(0, Math.min(width, this.x));
			this.y = Math.max(0, Math.min(height, this.y));
		}
		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			ctx.fillStyle = this.color;
			ctx.shadowColor = this.color;
			ctx.shadowBlur = 14;
			ctx.fill();
			ctx.shadowBlur = 0;
		}
	}

	function spawn(n){
		particles = new Array(n).fill(0).map(() => new Particle());
	}
	spawn(320); // 增加粒子數量

	canvas.addEventListener('mousemove', (e) => {
		// 取得相對於畫布的座標（使用 CSS 尺寸，因為我們已用 dpr scale）
		const rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX - rect.left;
		mouse.y = e.clientY - rect.top;
	});
	canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

	function loop(){
		ctx.clearRect(0,0,width,height);
		for (const p of particles) {
			p.update();
			p.draw();
		}
		requestAnimationFrame(loop);
	}
	loop();
})();

// 工具：日期處理
function fmtDate(d){
	const y = d.getFullYear();
	const m = String(d.getMonth()+1).padStart(2,'0');
	const day = String(d.getDate()).padStart(2,'0');
	return `${y}-${m}-${day}`;
}
function weekdayName(d){
	return ['日','一','二','三','四','五','六'][d.getDay()];
}
function isWeekend(d){
	const wd = d.getDay();
	return wd === 0 || wd === 6;
}

// 狀態
let students = [];
let holidays = new Set();
let returnees = new Map(); // name -> date(YYYY-MM-DD)
let lastAssignedByName = new Map(); // name -> last assigned date string
let rotationIndex = 0; // 輪替起點

// UI 元件
const studentsInput = document.getElementById('studentsInput');
const studentCount = document.getElementById('studentCount');
const fileInput = document.getElementById('fileInput');
const demoLoad = document.getElementById('demoLoad');
const chooseFileBtn = document.getElementById('chooseFileBtn');
const fileNameEl = document.getElementById('fileName');
const dropZone = document.getElementById('dropZone');
const importErrorEl = document.getElementById('importError');
const importPreviewEl = document.getElementById('importPreview');
// 主題切換已移除
const perDayEl = document.getElementById('perDay');
const daysEl = document.getElementById('days');
const weekBtn = document.getElementById('weekBtn');
const skipWeekendsEl = document.getElementById('skipWeekends');
const startDateEl = document.getElementById('startDate');
const addHolidayBtn = document.getElementById('addHolidayBtn');
const holidaysWrap = document.getElementById('holidays');
const gradeInput = document.getElementById('gradeInput');
const classInput = document.getElementById('classInput');
const absentTodayEl = document.getElementById('absentToday');
const addReturneeBtn = document.getElementById('addReturnee');
const returneeNameEl = document.getElementById('returneeName');
const returneeDateEl = document.getElementById('returneeDate');
const returneesList = document.getElementById('returneesList');
const generateBtn = document.getElementById('generateBtn');
const exportBtn = document.getElementById('exportBtn');
const resultTableBody = document.querySelector('#resultTable tbody');
const resultInfo = document.getElementById('resultInfo');
const dedupeBtn = document.getElementById('dedupeBtn');

function refreshStudentText(){
	students = studentsInput.value.split(/\s+/).map(s=>s.trim()).filter(Boolean);
	students = Array.from(new Set(students));
	studentsInput.value = students.join(' ');
	studentCount.textContent = `目前 ${students.length} 人`;
}
studentsInput.addEventListener('input', refreshStudentText);
if (dedupeBtn) dedupeBtn.addEventListener('click', refreshStudentText);

// 美化檔案選擇：使用自訂按鈕觸發原生 input
if (chooseFileBtn) {
	chooseFileBtn.addEventListener('click', () => fileInput && fileInput.click());
}

// 假日 UI
function renderHolidays(){
	holidaysWrap.innerHTML = '';
	for (const d of Array.from(holidays).sort()){
		const pill = document.createElement('span');
		pill.className = 'badge warn';
		pill.textContent = `放假 ${d}`;
		pill.style.cursor = 'pointer';
		pill.title = '點擊移除';
		pill.addEventListener('click', ()=>{ holidays.delete(d); renderHolidays(); });
		holidaysWrap.appendChild(pill);
	}
}
addHolidayBtn.addEventListener('click', ()=>{
	const v = startDateEl.value;
	if (v){ holidays.add(v); renderHolidays(); }
});

// 返校安排 UI
function renderReturnees(){
	returneesList.innerHTML = '';
	for (const [name, date] of returnees.entries()){
		const pill = document.createElement('span');
		pill.className = 'badge ok';
		pill.textContent = `${name} 返校：${date}`;
		pill.style.cursor = 'pointer';
		pill.title = '點擊移除';
		pill.addEventListener('click', ()=>{ returnees.delete(name); renderReturnees(); });
		returneesList.appendChild(pill);
	}
}
addReturneeBtn.addEventListener('click', ()=>{
	const n = (returneeNameEl.value || '').trim();
	const d = returneeDateEl.value;
	if (!n || !d) return;
	returnees.set(n, d);
	returneeNameEl.value = '';
	returneeDateEl.value = '';
	renderReturnees();
});

// 一鍵 5 天
weekBtn.addEventListener('click', ()=>{
	daysEl.value = 5;
});

// 讀取 .xlsx：只讀取第一個工作表 B 欄，忽略 B1/B2/B3/B25
fileInput.addEventListener('change', async (e)=>{
	const f = e.target.files && e.target.files[0];
	if (!f) return;
	if (fileNameEl) fileNameEl.textContent = f.name || '未選擇檔案';
	await importFromWorkbookFile(f);
});

// 拖放上傳：阻止預設行為並顯示樣式
if (dropZone){
	dropZone.addEventListener('dragover', (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
	dropZone.addEventListener('dragleave', ()=> dropZone.classList.remove('dragover'));
	dropZone.addEventListener('drop', async (e)=>{
		e.preventDefault(); dropZone.classList.remove('dragover');
		const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
		if (!f) return;
		if (!/\.xlsx?$/.test(f.name.toLowerCase())){ return showImportError('請提供 .xlsx/.xls 檔案'); }
		if (fileNameEl) fileNameEl.textContent = f.name;
		await importFromWorkbookFile(f);
	});
}

function showImportError(msg){
	if (importErrorEl){ importErrorEl.style.display='block'; importErrorEl.textContent = msg; }
}
function clearImportError(){ if (importErrorEl){ importErrorEl.style.display='none'; importErrorEl.textContent=''; } }

async function importFromWorkbookFile(file){
	try{
		clearImportError();
		const data = await file.arrayBuffer();
		const wb = XLSX.read(data, { type: 'array' });
		if (!wb.SheetNames || wb.SheetNames.length === 0) return showImportError('檔案沒有工作表');
		const wsName = wb.SheetNames[0];
		const ws = wb.Sheets[wsName];
		if (!ws || !ws['!ref']) return showImportError('工作表內容為空');
		const range = XLSX.utils.decode_range(ws['!ref']);
		let names = [];
		let started = false; // 自動偵測抬頭：遇到第一個像姓名的值才開始收集
		for (let r = range.s.r; r <= range.e.r; r++){
			const cell = ws[XLSX.utils.encode_cell({ r, c: 1 })]; // B 欄
			if (!cell) continue;
			const vRaw = cell.v;
			const v = String(vRaw == null ? '' : vRaw).trim();
			if (!v) continue;
			// 跳過常見抬頭與無效
			if (/姓名|name|學生|名單/i.test(v)) continue;
			if (/^[-=+@\d\s]+$/.test(v)) continue; // 純符號/數字
			// 中文名/一般姓名啟動判定：包含中日韓文字或至少兩個字母
			const looksLikeName = /[\u4e00-\u9fa5]/.test(v) || /[A-Za-z][A-Za-z\s'-]{1,}$/.test(v);
			if (!started){
				if (!looksLikeName) continue;
				started = true;
			}
			if (looksLikeName) names.push(v);
		}
		// 預覽與合併
		if (names.length === 0) return showImportError('未在 B 欄找到姓名資料');
		const existing = studentsInput.value.trim();
		const merged = (existing ? (existing + ' ') : '') + names.join(' ');
		studentsInput.value = merged;
		refreshStudentText();
		showPreview(names);
	}catch(err){
		showImportError('讀取失敗：' + (err && err.message ? err.message : err));
	}
}

function showPreview(names){
	if (!importPreviewEl) return;
	importPreviewEl.style.display = 'block';
	const sample = names.slice(0, 10).join('、');
	importPreviewEl.textContent = `預覽（前10筆）：${sample} ……（共 ${names.length} 筆）`;
}

// Demo：嘗試讀取同目錄的範例檔名（若存在）
if (demoLoad) demoLoad.addEventListener('click', async ()=>{
	try {
		const resp = await fetch('2526高一甲(曾)_文21_理11_32人(2025-09-02更新).xlsx');
		if (!resp.ok) throw new Error('找不到同目錄範例檔');
		const data = await resp.arrayBuffer();
		const wb = XLSX.read(data, { type: 'array' });
		const wsName = wb.SheetNames[0];
		const ws = wb.Sheets[wsName];
		const range = XLSX.utils.decode_range(ws['!ref']);
		let names = [];
		let started = false;
		for (let r = range.s.r; r <= range.e.r; r++){
			const cell = ws[XLSX.utils.encode_cell({ r, c: 1 })];
			if (!cell) continue;
			const v = String(cell.v || '').trim();
			if (!v) continue;
			if (/姓名|name|學生|名單/i.test(v)) continue;
			if (/^[-=+@\d\s]+$/.test(v)) continue;
			const looksLikeName = /[\u4e00-\u9fa5]/.test(v) || /[A-Za-z][A-Za-z\s'-]{1,}$/.test(v);
			if (!started){ if (!looksLikeName) continue; started = true; }
			if (looksLikeName) names.push(v);
		}
		const existing = studentsInput.value.trim();
		const merged = (existing ? (existing + ' ') : '') + names.join(' ');
		studentsInput.value = merged;
		refreshStudentText();
		showPreview(names);
	} catch (e){
		alert('讀取範例失敗：' + e.message);
	}
});

// 主題初始化已移除

// 規則：
// - 排除請假：當日 absent 名單跳過
// - 自訂人數：perDay 1..3
// - 預排一週：weekBtn 設為 5 天
// - 可自訂多天（例如一個月），可勾選排除週末，假日清單跳過
// - 避免連班：盡量不讓相同同學連續天被指派
// - 返校同學：指定返校日，該日必安排
// - 週內所有人都做完值日後，重新輪替（以 rotationIndex 控制）
// - 工作分配：掃地、擦黑板、垃圾
const TASKS = ['掃地🧹', '擦黑板🧽', '垃圾🗑️'];

function shuffle(arr){
	const a = arr.slice();
	for (let i=a.length-1;i>0;i--){
		const j = Math.floor(Math.random()*(i+1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function chooseForDay(candidates, count, dateStr, avoidNames){
	// 先把候選人分為「非連班」與「可能連班」
	const nonConsecutive = [];
	const maybeConsecutive = [];
	for (const name of candidates){
		if (avoidNames.has(name)) continue; // 當日請假/已選
		const last = lastAssignedByName.get(name);
		if (last === dateStr) continue; // 不可能，但保險
		if (last){
			// 若 last 是昨天，視為可能連班
			const lastDate = new Date(last);
			const curr = new Date(dateStr);
			const diff = (curr - lastDate) / (24*3600*1000);
			if (diff <= 1.1) maybeConsecutive.push(name); else nonConsecutive.push(name);
		} else {
			nonConsecutive.push(name);
		}
	}
	const pick = [];
	const pool = [...shuffle(nonConsecutive), ...shuffle(maybeConsecutive)];
	for (const n of pool){
		if (pick.length >= count) break;
		pick.push(n);
	}
	return pick;
}

function assignTasksForDay(names){
	const n = names.length;
	if (n === 1) {
		return [{ name: names[0], tasks: TASKS.join('、') }];
	}
	if (n === 2) {
		// 一人：擦黑板+垃圾；另一人：掃地
		const order = Math.random() < 0.5 ? [0,1] : [1,0];
        return [
            { name: names[order[0]], tasks: '擦黑板🧽、垃圾🗑️' },
            { name: names[order[1]], tasks: '掃地🧹' }
        ];
	}
	// 3 人：隨機指派三個工作
	const shuffledTasks = shuffle(TASKS);
	return [
		{ name: names[0], tasks: shuffledTasks[0] },
		{ name: names[1], tasks: shuffledTasks[1] },
		{ name: names[2], tasks: shuffledTasks[2] }
	];
}

function nextWorkingDates(start, totalDays, skipWeekends, holidaysSet){
	const out = [];
	let d = new Date(start.getTime());
	while (out.length < totalDays){
		const s = fmtDate(d);
		if (!(skipWeekends && isWeekend(d)) && !holidaysSet.has(s)){
			out.push(new Date(d.getTime()));
		}
		d.setDate(d.getDate()+1);
	}
	return out;
}

function generateSchedule(){
	refreshStudentText();
	const perDay = Math.max(1, Math.min(3, Number(perDayEl.value || 3)));
	const totalDays = Math.max(1, Math.min(31, Number(daysEl.value || 5)));
	if (students.length === 0){
		alert('請先提供學生名單');
		return;
	}
	if (!startDateEl.value){
		startDateEl.value = fmtDate(new Date());
	}
	const start = new Date(startDateEl.value);
	const skipWk = !!skipWeekendsEl.checked;
	const absentSet = new Set((absentTodayEl.value || '').split(/\s+/).map(s=>s.trim()).filter(Boolean));

	// 取排班日期列表
	const dates = nextWorkingDates(start, totalDays, skipWk, holidays);
	// 初始化輪替與上次紀錄（避免跨次生成互相干擾）
	lastAssignedByName = new Map();
	let sequence = students.slice();
	// 讓輪替從上次 index 開始（若無則 0）
	if (rotationIndex >= sequence.length) rotationIndex = 0;
	sequence = [...sequence.slice(rotationIndex), ...sequence.slice(0, rotationIndex)];

	const rows = [];
	let seqPtr = 0; // 輪替指標

    for (const date of dates){
        const dateStr = fmtDate(date);
        const demanded = perDay;
        const todayAvoid = new Set(absentSet);

        // 返校者（必排）
        const forced = [];
        for (const [name, d] of returnees.entries()){
            if (d === dateStr && !todayAvoid.has(name)) forced.push(name);
        }

        // 取本日輪到的一組（大小 = demanded）
        const group = [];
        for (let i=0;i<demanded;i++){
            group.push(sequence[(seqPtr + i) % students.length]);
        }

        // 本組可出席者（剔除請假）
        let present = group.filter(n => !todayAvoid.has(n));

        // 加入返校者（若不在 present 中）
        for (const n of forced){ if (!present.includes(n)) present.push(n); }

        // 若本組全都請假（含返校者也無），推到下一組（循環最多一次遍歷）
        if (present.length === 0){
            let advanced = 0;
            while (advanced < students.length){
                const nextPtr = (seqPtr + demanded) % students.length;
                const nextGroup = [];
                for (let i=0;i<demanded;i++) nextGroup.push(sequence[(nextPtr + i) % students.length]);
                const nextPresent = nextGroup.filter(n => !todayAvoid.has(n));
                if (nextPresent.length > 0){
                    present = nextPresent;
                    // 也將 seqPtr 推進到此「下一組」以符合規則
                    seqPtr = nextPtr;
                    break;
                }
                // 若仍全請假，繼續推下一組
                seqPtr = nextPtr;
                advanced += demanded;
            }
        }

        const chosen = present.slice(); // 不補齊至 demanded，採「實到人數」

        // 更新 lastAssigned（僅對實際被安排者）
        for (const n of chosen){ lastAssignedByName.set(n, dateStr); }

        // 輪替：不論出席幾人，指標固定推進一組（demanded）
        seqPtr = (seqPtr + demanded) % students.length;

        // 任務分派依實到人數套用 1/2/3 人規則
        const assigned = assignTasksForDay(chosen);
        rows.push({ date: dateStr, weekday: `週${weekdayName(date)}`, members: chosen.slice(), assigned });
    }

	// 記錄新的 rotationIndex（以 seqPtr 對應到原 students 的位置）
	const lastNameForPtr = sequence[seqPtr % students.length];
	rotationIndex = students.indexOf(lastNameForPtr);
	if (rotationIndex < 0) rotationIndex = 0;

	// 輸出到表格
	resultTableBody.innerHTML = '';
	for (const r of rows){
		const tr = document.createElement('tr');
		const td1 = document.createElement('td'); td1.textContent = r.date;
		const td2 = document.createElement('td'); td2.textContent = r.weekday;
		const td3 = document.createElement('td'); td3.textContent = r.members.join('、');
		const td4 = document.createElement('td');
		td4.innerHTML = r.assigned.map(a => `<span class=\"badge\">${a.name}：${a.tasks}</span>`).join(' ');
		const td5 = document.createElement('td');
		// 每位值日生皆有獨立的完成勾選（以 日期+姓名 作為 key）
		for (const a of r.assigned){
			const wrapper = document.createElement('label');
			wrapper.style.display = 'inline-flex';
			wrapper.style.alignItems = 'center';
			wrapper.style.gap = '6px';
			wrapper.style.marginRight = '10px';
			const c = document.createElement('input');
			c.type = 'checkbox';
			const key = `dutyDone:${r.date}:${a.name}`;
			c.checked = localStorage.getItem(key) === '1';
			c.addEventListener('change', ()=>{
				if (c.checked) localStorage.setItem(key, '1'); else localStorage.removeItem(key);
			});
			const nameSpan = document.createElement('span');
			nameSpan.textContent = a.name;
			wrapper.appendChild(c);
			wrapper.appendChild(nameSpan);
			td5.appendChild(wrapper);
		}
		tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4); tr.appendChild(td5);
		resultTableBody.appendChild(tr);
	}
	resultInfo.textContent = `已產生 ${rows.length} 天的排班（每日 ${perDay} 人），已套用放假與請假與返校規則。`;

	// 暫存結果供匯出
	window.__scheduleRows = rows;
	exportBtn.disabled = rows.length === 0;
}

generateBtn.addEventListener('click', generateSchedule);

// 匯出 xlsx
exportBtn.addEventListener('click', async ()=>{
	const rows = window.__scheduleRows || [];
	if (!rows.length) return;

	// 只截取結果卡片，避免把背景粒子也塞到 PDF
	const target = document.querySelector('.card:nth-of-type(3)'); // 第三張卡：排班結果
	if (!target) return;

	// 先在結果卡片前插入標題（僅用於 PDF 截圖，稍後移除）
	const header = document.createElement('div');
	header.style.padding = '8px 0';
	header.style.fontWeight = '800';
	header.style.fontSize = '18px';
	header.style.color = '#111317';
	const g = (gradeInput && gradeInput.value.trim()) || '';
	const c = (classInput && classInput.value.trim()) || '';
	const titlePrefix = (g || c) ? `${g}${c}` : '';
	header.textContent = `${titlePrefix ? titlePrefix + ' ' : ''}值日排班表`;
	target.insertBefore(header, target.firstChild);

	await new Promise(r => setTimeout(r, 50));

	const canvas = await html2canvas(target, { backgroundColor: '#ffffff', scale: 2 });
	const imgData = canvas.toDataURL('image/png');

	const { jsPDF } = window.jspdf;
	const pdf = new jsPDF('p', 'mm', 'a4');
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();

	const imgWidth = pageWidth - 20; // 邊距各 10mm
	const imgHeight = canvas.height * imgWidth / canvas.width;

	let position = 10; // top margin
	let remainingHeight = imgHeight;
	let y = 10;

	// 多頁分割
	while (remainingHeight > 0) {
		const pageCanvas = document.createElement('canvas');
		const pageCtx = pageCanvas.getContext('2d');
		const pagePixelWidth = canvas.width;
		const pagePixelHeight = Math.floor(canvas.width * (pageHeight - 20) / imgWidth); // 對應可印高度
		pageCanvas.width = pagePixelWidth;
		pageCanvas.height = Math.min(pagePixelHeight, canvas.height - Math.floor((y - 10) * canvas.width / imgWidth));

		pageCtx.fillStyle = '#ffffff';
		pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
		pageCtx.drawImage(
			canvas,
			0,
			Math.floor((y - 10) * canvas.width / imgWidth),
			pageCanvas.width,
			pageCanvas.height,
			0,
			0,
			pageCanvas.width,
			pageCanvas.height
		);

		const pageImg = pageCanvas.toDataURL('image/png');
		pdf.addImage(pageImg, 'PNG', 10, 10, imgWidth, (pageCanvas.height * imgWidth) / pageCanvas.width);

		remainingHeight -= (pageCanvas.height * imgWidth) / pageCanvas.width;
		y += (pageCanvas.height * imgWidth) / pageCanvas.width;
		if (remainingHeight > 0) pdf.addPage();
	}

	// 清理臨時標題
	if (header && header.parentNode) header.parentNode.removeChild(header);

	const filePrefix = titlePrefix ? `${titlePrefix}` : '';
	pdf.save(`${filePrefix ? filePrefix : ''}值日排班表.pdf`);
});

// 預設起始日為今天
startDateEl.value = fmtDate(new Date());


