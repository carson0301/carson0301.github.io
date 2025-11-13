 (function () {
  const el = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const API_URL = 'https://api.deepseek.com/v1/chat/completions';
  window.DEEPSEEK_API_KEY = 'sk-7e8f0e81f4994daebfd2cc82b9471ec1';
  const getKey = () => window.DEEPSEEK_API_KEY || localStorage.getItem('DEEPSEEK_API_KEY') || '';

  const DATA = {
    materials: [
       { id: 'cotton', group: '衣物類', name: '棉織物（T恤、襯衫、內衣等）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>水溫30-40℃</strong>（深色建議冷水防褪色）' },
         { text: '普通洗衣液/肥皂（頑固污漬加少量小蘇打）' },
         { text: '<strong>可機洗</strong>（選「棉織物」模式，深淺分開）' },
         { text: '避免暴曬（可翻面晾幹）' },
       ], forbid: [
         '❌ 高溫水煮（會縮水）',
         '❌ 漂白劑（除非是白色棉織物）',
       ] },
       { id: 'wool', group: '衣物類', name: '羊毛（毛衣、圍巾、羊毛衫）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>20℃以下冷水</strong>' },
         { text: '中性羊毛專用洗衣液（或稀釋嬰兒洗衣液）' },
         { text: '<strong>手洗輕按壓</strong>（禁搓揉/擰幹，浸泡≤5分鐘）' },
         { text: '<strong>平鋪晾曬</strong>（避陽光）' },
       ], forbid: [
         '❌ 熱水洗（會縮水、結塊）',
         '❌ 機洗（除非有「羊毛專用」模式）',
         '❌ 堿性洗滌劑（如肥皂）',
       ] },
       { id: 'silk', group: '衣物類', name: '絲綢（襯衫、連衣裙、圍巾）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>30℃以下溫水</strong>' },
         { text: '中性絲綢專用洗滌劑（或稀釋嬰兒洗衣液）' },
         { text: '<strong>手洗輕按壓</strong>（禁搓/擰/刷，快速清洗）' },
         { text: '避光陰幹（半幹拉平褶皺）' },
       ], forbid: [
         '❌ 機洗（會勾絲、變形）',
         '❌ 漂白劑',
         '❌ 烘幹機（高溫會硬化）',
       ] },
       { id: 'synthetic', group: '衣物類', name: '化纖（滌綸、錦綸、腈綸等運動服、外套）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>30-40℃</strong>（高溫易變形）' },
         { text: '普通洗衣液（用量比棉少1/3）' },
         { text: '<strong>可機洗</strong>（選「輕柔模式」，防勾絲）' },
         { text: '陰涼晾幹（暴曬易變脆）' },
       ], forbid: [
         '❌ 長時間浸泡（超過15分鐘易染色）',
         '❌ 高溫熨燙（部分化纖會融化）',
       ] },
       { id: 'denim', group: '衣物類', name: '牛仔（牛仔褲、牛仔外套）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>冷水</strong>（首次洗加少量鹽固色）' },
         { text: '中性洗衣液（防褪色）' },
         { text: '<strong>可機洗</strong>（翻面，選「牛仔模式」）' },
         { text: '翻面暴曬（避免過度拉伸）' },
       ], forbid: [
         '❌ 頻繁清洗（會變硬、變形）',
         '❌ 熱水泡（嚴重褪色）',
       ] },
       { id: 'bedsheet', group: '家紡類', name: '被套/床單（棉、化纖、混紡）', placeholder: '點擊查看物料圖', steps: [
         { text: '棉<strong>30-40℃</strong>、化纖<strong>30℃以下</strong>' },
         { text: '普通洗衣液（蟎蟲多可加除蟎劑）' },
         { text: '<strong>可機洗</strong>（選「大件模式」，裝一半容量）' },
         { text: '陽光下暴曬（曬幹後抖浮毛）' },
       ], forbid: [
         '❌ 化纖被套高溫洗（會縮水）',
         '❌ 洗完直接堆在洗衣機里（易滋生細菌）',
       ] },
       { id: 'down', group: '家紡類', name: '羽絨（羽絨被、羽絨服）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>30℃左右溫水</strong>（防羽絨結團）' },
         { text: '中性羽絨專用洗滌劑（或少量洗衣液）' },
         { text: '<strong>可機洗</strong>（選「輕柔/羽絨模式」，洗前拉拉鏈翻面）' },
         { text: '陰涼處平鋪/掛晾（晾幹後輕拍蓬松）' },
       ], forbid: [
         '❌ 用漂白劑（損傷羽絨）',
         '❌ 手擰幹（會讓羽絨結塊）',
         '❌ 烘幹機高溫烘幹',
       ] },
       { id: 'woolblanket', group: '家紡類', name: '羊毛毯（冬季毛毯、羊絨毯）', placeholder: '點擊查看物料圖', steps: [
         { text: '<strong>20℃以下冷水</strong>（防縮水）' },
         { text: '羊毛專用中性洗滌劑（稀釋後用）' },
         { text: '<strong>手洗輕按壓</strong>（禁搓揉/擰幹，局部用軟毛刷）' },
         { text: '平鋪大晾衣架（陰幹後輕拍去浮毛）' },
       ], forbid: [
         '❌ 機洗（會縮水、起球）',
         '❌ 暴曬（面料變脆）',
         '❌ 高溫熨燙',
       ] },
     ],
     stains: [
       { id: 'oil', group: '飲食類', name: '油漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '乾布<strong>吸油</strong>（別擦）' },
         { text: '塗洗滌劑輕揉' },
         { text: '靜置<strong>5分鐘</strong>' },
         { text: '<strong>30-40℃</strong>溫水搓洗' },
       ], note: '羊毛/絲綢用中性洗滌劑，避免用力搓' },
       { id: 'soy', group: '飲食類', name: '醬油漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '<strong>新鮮</strong>：冷水沖背面' },
         { text: '<strong>新鮮</strong>：塗白醋靜置2分鐘' },
         { text: '<strong>新鮮</strong>：洗衣液搓洗' },
         { text: '<strong>陳舊</strong>：1勺小蘇打+溫水泡30分鐘' },
         { text: '<strong>陳舊</strong>：洗衣液搓洗' },
       ], note: '彩色衣物慎用漂白' },
       { id: 'redwine', group: '飲食類', name: '紅酒漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '撒鹽<strong>吸液</strong>靜置5分鐘' },
         { text: '抖鹽後冷水沖' },
         { text: '塗中性肥皂搓洗' },
         { text: '按面料水溫洗滌' },
       ], note: '羊毛/絲綢用冷水+中性洗滌劑，別用力搓' },
       { id: 'milk', group: '飲食類', name: '奶漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '冷水泡<strong>10分鐘</strong>' },
         { text: '塗洗衣液輕搓' },
         { text: '有奶味加<strong>1勺白醋</strong>泡5分鐘' },
       ], note: '嬰兒衣物用嬰兒專用洗衣液' },
       { id: 'fruit', group: '飲食類', name: '水果漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '冷水沖' },
         { text: '塗檸檬汁靜置<strong>3分鐘</strong>' },
         { text: '洗衣液搓洗' },
       ], note: '深色衣物慎用檸檬汁' },
       { id: 'sweat', group: '生活類', name: '汗漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '1勺小蘇打+溫水攪勻' },
         { text: '浸泡<strong>20分鐘</strong>' },
         { text: '洗衣液搓洗（領口袖口可加肥皂）' },
         { text: '按面料清洗' },
       ], note: '羊毛面料用冷水+中性洗滌劑，避免小蘇打' },
       { id: 'blood', group: '生活類', name: '血漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '<strong>新鮮</strong>：冷水沖背面' },
         { text: '<strong>新鮮</strong>：塗中性肥皂輕搓' },
         { text: '<strong>陳舊</strong>：3%雙氧水塗漬處靜置10分鐘' },
         { text: '<strong>陳舊</strong>：冷水+洗衣液搓洗' },
       ], note: '羊毛/絲綢禁用雙氧水，改用冷水+中性洗滌劑' },
       { id: 'ink', group: '生活類', name: '墨漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '塗酒精/風油精' },
         { text: '靜置<strong>5分鐘</strong>' },
         { text: '洗衣液搓洗' },
       ], note: '彩色衣物先在衣角測試酒精是否褪色' },
       { id: 'cosmetic', group: '生活類', name: '化妝品漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '<strong>口紅</strong>：刮殘留' },
         { text: '<strong>口紅</strong>：塗卸妝油揉1分鐘' },
         { text: '<strong>口紅</strong>：溫水+洗衣液搓洗' },
         { text: '<strong>粉底液</strong>：乾塗洗衣液搓1分鐘' },
         { text: '<strong>粉底液</strong>：溫水洗' },
       ], note: '絲綢用溫和卸妝油，避免用力搓' },
       { id: 'urine', group: '生活類', name: '尿漬', placeholder: '點擊查看污漬圖', steps: [
         { text: '冷水泡<strong>30分鐘</strong>' },
         { text: '1勺白醋+水泡<strong>15分鐘</strong>' },
         { text: '洗衣液搓洗（有異味加小蘇打）' },
       ], note: '棉織物可暴曬，羊毛/絲綢陰幹' },
     ],
  };

  const IMAGES = {
    // materials
    cotton: 'image/棉质衣物.jpg',
    wool: 'image/羊毛衣物jpg.jpg',
    silk: 'image/丝绸衣物.png',
    synthetic: 'image/化纤衣物.jpg',
    denim: 'image/牛仔衣物.jpg',
    bedsheet: 'image/被套床单.jpg',
    down: 'image/羽绒.jpg',
    woolblanket: 'image/羊毛毯.jpg',
    // stains
    oil: 'image/油渍.jpg',
    soy: 'image/酱油渍.jpg',
    redwine: 'image/红酒渍.jpg',
    milk: 'image/奶渍.jpg',
    fruit: 'image/水果渍.jpg',
    sweat: 'image/汗渍.jpg',
    blood: 'image/血渍.jpg',
    ink: 'image/墨渍.jpg',
    cosmetic: 'image/化妆品渍.jpg',
    urine: 'image/尿渍.jpg',
  };

   function groupBy(arr, key) {
     return arr.reduce((m, it) => { (m[it[key]] = m[it[key]] || []).push(it); return m; }, {});
   }

   function renderLists() {
     const mats = el('materials-list');
     const sts = el('stains-list');
     mats.innerHTML = '';
     sts.innerHTML = '';
     const gM = groupBy(DATA.materials, 'group');
     Object.keys(gM).forEach(g => {
       const t = document.createElement('div');
       t.className = 'group-title';
       t.textContent = g;
       mats.appendChild(t);
       const wrap = document.createElement('div');
       wrap.className = 'grid-list';
       mats.appendChild(wrap);
       gM[g].forEach(item => wrap.appendChild(createItemCard(item, 'material')));
     });
     const gS = groupBy(DATA.stains, 'group');
     Object.keys(gS).forEach(g => {
       const t = document.createElement('div');
       t.className = 'group-title';
       t.textContent = g;
       sts.appendChild(t);
       const wrap = document.createElement('div');
       wrap.className = 'grid-list';
       sts.appendChild(wrap);
       gS[g].forEach(item => wrap.appendChild(createItemCard(item, 'stain')));
     });
     fillSelects();
   }

   function createItemCard(item, type) {
    const card = document.createElement('button');
    card.className = 'item-card';
    card.type = 'button';
    const thumb = document.createElement('div');
    thumb.className = 'circle circle-80';
    const src = IMAGES[item.id];
    if (src) {
      const im = document.createElement('img');
      im.src = src;
      im.alt = item.name;
      im.style.width = '100%';
      im.style.height = '100%';
      im.style.objectFit = 'cover';
      im.style.borderRadius = '50%';
      thumb.appendChild(im);
      thumb.addEventListener('click', (e) => { e.stopPropagation(); openViewer(src); });
    } else {
      thumb.classList.add('placeholder-text');
      thumb.textContent = type === 'material' ? '點擊查看物料圖' : '點擊查看污漬圖';
      thumb.addEventListener('click', (e) => { e.stopPropagation(); openViewer(null); });
    }
    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = item.name;
    card.appendChild(thumb);
    card.appendChild(title);
    card.addEventListener('click', () => openDetail(item, type));
    return card;
  }

   function openDetail(item, type) {
     el('detail-title').textContent = item.name;
     const box = el('detail-content');
     box.innerHTML = '';
     const forbidTag = document.createElement('div');
     forbidTag.className = 'forbid-tag';
     forbidTag.textContent = '禁止操作';
     box.appendChild(forbidTag);
     if (item.forbid && item.forbid.length) {
       const ul = document.createElement('ul');
       ul.className = 'prohibit-list';
       item.forbid.forEach(f => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
       box.appendChild(ul);
     }
     if (item.steps && item.steps.length) {
       item.steps.forEach((s, i) => {
         const row = document.createElement('div');
         row.className = 'step-card';
         const ph = document.createElement('div');
         ph.className = 'circle circle-40 placeholder-text';
         ph.textContent = '步驟圖';
         ph.addEventListener('click', () => openViewer(IMAGES[item.id] || null));
         const txt = document.createElement('div');
         txt.className = 'step-text';
         txt.innerHTML = (i + 1) + '）' + s.text;
         row.appendChild(ph);
         row.appendChild(txt);
         box.appendChild(row);
       });
     }
     if (item.note) {
       const n = document.createElement('div');
       n.className = 'hint';
       n.textContent = '注意：' + item.note;
       box.appendChild(n);
     }
     el('detail-section').hidden = false;
     window.scrollTo({ top: 0 });
   }

   function closeDetail() {
     el('detail-section').hidden = true;
   }

   function openViewer(src) {
     const viewer = el('image-viewer');
     const img = el('viewer-img');
     const ph = el('viewer-placeholder');
     if (src) {
       img.src = src;
       img.style.display = 'block';
       ph.style.display = 'none';
     } else {
       img.removeAttribute('src');
       img.style.display = 'none';
       ph.style.display = 'flex';
     }
     resetZoom();
     viewer.hidden = false;
   }

   function closeViewer() {
     el('image-viewer').hidden = true;
   }

   function fillSelects() {
     const mSel = el('material-select');
     const sSel = el('stain-select');
     const mOpts = DATA.materials.map(m => ({ v: m.id, t: m.name }));
     const sOpts = DATA.stains.map(s => ({ v: s.id, t: s.name }));
     mSel.innerHTML = '<option value="">選擇衣物/家紡物料（如：棉、羊毛）</option>' + mOpts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
     sSel.innerHTML = '<option value="">選擇污漬類型（如：油漬、汗漬）</option>' + sOpts.map(o => `<option value="${o.v}">${o.t}</option>`).join('');
   }

   function doQuery() {
     const mid = el('material-select').value;
     const sid = el('stain-select').value;
     const out = el('query-result');
     if (!mid || !sid) { out.hidden = false; out.textContent = '請先選擇物料與污漬'; return; }
     const mat = DATA.materials.find(x => x.id === mid);
     const st = DATA.stains.find(x => x.id === sid);
     let html = '';
     html += `<div class="section-title">你查詢的：${mat.name} + ${st.name} 處理方法</div>`;
     html += '<div class="forbid-tag">禁止操作</div>';
     if (mat.forbid && mat.forbid.length) {
       html += '<ul class="prohibit-list">' + mat.forbid.map(f => `<li>${f}</li>`).join('') + '</ul>';
     }
     if (st.note) {
       html += `<div class="hint">注意：${st.note}</div>`;
     }
     if (mat.steps && mat.steps.length) {
       html += mat.steps.map((s, i) => `<div class="step-card"><div class="circle circle-40 placeholder-text">步驟圖</div><div class="step-text">${i + 1}）${s.text}</div></div>`).join('');
     }
     if (st.steps && st.steps.length) {
       html += st.steps.map((s, i) => `<div class="step-card"><div class="circle circle-40 placeholder-text">步驟圖</div><div class="step-text">${i + 1}）${s.text}</div></div>`).join('');
     }
     out.innerHTML = html;
     out.hidden = false;
   }

   function switchTab(targetId) {
     qsa('.tab-item').forEach(b => b.classList.toggle('active', b.dataset.target === targetId));
     qsa('.content-section').forEach(sec => sec.classList.toggle('active', sec.id === targetId));
     qsa('.content-section').forEach(sec => { if (sec.id !== targetId) sec.style.display = 'none'; });
     const target = el(targetId);
     if (target) target.style.display = 'block';
     closeDetail();
   }

   function b64FromFile(file) {
     return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
   }

   async function withTimeout(p, ms) {
     const t = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
     return Promise.race([p, t]);
   }

   async function askDeepseekChat(userText) {
     const key = getKey();
     if (!key) throw new Error('缺少 DeepSeek API 金鑰');
     const body = {
       model: 'deepseek-chat',
       messages: [
         { role: 'system', content: '你係一位衣物污漬清潔指南助手，請用粵語簡潔列出步驟與禁忌。' },
         { role: 'user', content: userText }
       ],
       temperature: 0.2
     };
     const r = await fetch(API_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
       body: JSON.stringify(body)
     });
     if (!r.ok) throw new Error('API 錯誤 ' + r.status);
     const j = await r.json();
     const msg = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
     return msg;
   }

   async function askDeepseekVL(imageDataUrl, textPrompt) {
     const key = getKey();
     if (!key) throw new Error('缺少 DeepSeek API 金鑰');
     const body = {
       model: 'deepseek-vl',
       messages: [
         { role: 'user', content: [
           { type: 'text', text: textPrompt || '請判斷圖中污漬類型並用粵語給出清洗步驟與禁忌' },
           { type: 'image_url', image_url: { url: imageDataUrl } }
         ]}
       ],
       temperature: 0.2,
       max_tokens: 600
     };
     const r = await fetch(API_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
       body: JSON.stringify(body)
     });
     if (!r.ok) throw new Error('API 錯誤 ' + r.status);
     const j = await r.json();
     const msg = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || '';
     return msg;
   }

   function bindEvents() {
     qsa('.tab-item').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.target)));
     el('btn-back').addEventListener('click', closeDetail);
     el('viewer-close').addEventListener('click', closeViewer);
     el('btn-query').addEventListener('click', doQuery);
     const file = el('photo-input');
     el('btn-photo').addEventListener('click', () => file.click());
     file.addEventListener('change', async () => {
       const f = file.files && file.files[0];
       if (!f) return;
       const answer = el('ai-answer');
       const status = el('ai-status');
       status.hidden = false; status.textContent = 'AI分析緊...（大約10秒）';
       answer.hidden = true; answer.textContent = '';
       try {
         const dataUrl = await b64FromFile(f);
         const res = await withTimeout(askDeepseekVL(dataUrl), 10000);
         answer.textContent = res || '未獲得結果';
       } catch (e) {
         answer.textContent = '出錯咗：' + e.message;
       } finally {
         status.hidden = true; answer.hidden = false; file.value = '';
       }
     });
     const vb = el('btn-voice');
     let rec;
     function createRec() {
       const R = window.SpeechRecognition || window.webkitSpeechRecognition;
       if (!R) return null;
       const r = new R();
       r.lang = 'zh-HK';
       r.interimResults = false;
       r.maxAlternatives = 1;
       return r;
     }
     function startRec() {
       if (!rec) rec = createRec();
       const status = el('ai-status');
       if (!rec) { status.hidden = false; status.textContent = '裝置未支援語音識別'; return; }
       status.hidden = false; status.textContent = '請講嘢...講完松開按鈕';
       try { rec.start(); } catch (_) {}
     }
     function stopRec() {
       if (rec) try { rec.stop(); } catch (_) {}
     }
     vb.addEventListener('mousedown', startRec);
     vb.addEventListener('touchstart', (e) => { e.preventDefault(); startRec(); }, { passive: false });
     const endHan = () => stopRec();
     vb.addEventListener('mouseup', endHan);
     vb.addEventListener('mouseleave', endHan);
     vb.addEventListener('touchend', endHan);
     vb.addEventListener('touchcancel', endHan);
     if (!rec) rec = createRec();
     if (rec) {
       rec.onresult = async (ev) => {
         const transcript = ev.results[0][0].transcript;
         const status = el('ai-status');
         const answer = el('ai-answer');
         status.hidden = false; status.textContent = 'AI聽緊...（大約10秒）';
         answer.hidden = true; answer.textContent = '';
         try {
           const res = await withTimeout(askDeepseekChat(`問題：${transcript}。請結合常見做法給出步驟與禁忌。`), 10000);
           answer.textContent = res || '未獲得結果';
         } catch (e) {
           answer.textContent = '出錯咗：' + e.message;
         } finally {
           status.hidden = true; answer.hidden = false;
         }
       };
       rec.onerror = () => { const s = el('ai-status'); s.hidden = false; s.textContent = '語音識別出錯'; setTimeout(() => s.hidden = true, 1500); };
       rec.onend = () => {};
     }
   }

   let scale = 1;
   let lastDist = 0;
   let lastTap = 0;
   function resetZoom() {
     scale = 1; lastDist = 0; const img = el('viewer-img'); img.style.transform = 'scale(1)';
   }
   function bindViewerGestures() {
     const stage = qs('.image-stage');
     const img = el('viewer-img');
     stage.addEventListener('touchstart', (ev) => {
       if (ev.touches.length === 2) {
         const a = ev.touches[0], b = ev.touches[1];
         lastDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
       }
     }, { passive: true });
     stage.addEventListener('touchmove', (ev) => {
       if (ev.touches.length === 2) {
         ev.preventDefault();
         const a = ev.touches[0], b = ev.touches[1];
         const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
         if (lastDist) {
           const ds = d / lastDist;
           scale = Math.max(1, Math.min(4, scale * ds));
           img.style.transform = `scale(${scale})`;
           lastDist = d;
         } else {
           lastDist = d;
         }
       }
     }, { passive: false });
     stage.addEventListener('touchend', () => { lastDist = 0; }, { passive: true });
     stage.addEventListener('click', () => {
       const now = Date.now();
       if (now - lastTap < 300) { resetZoom(); }
       lastTap = now;
     });
   }

   function init() {
     renderLists();
     switchTab('materials-section');
     bindEvents();
     bindViewerGestures();
   }

   document.addEventListener('DOMContentLoaded', init);
 })();
